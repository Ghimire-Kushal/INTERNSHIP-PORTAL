from datetime import timedelta

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework.test import APITestCase

from companies.models import Company
from users.models import User

from .models import Category, Job


class JobViewSetTests(APITestCase):
    def setUp(self):
        self.employer = User.objects.create_user(
            username="job-owner",
            email="job-owner@example.com",
            password="StrongPass!123",
            role=User.Role.EMPLOYER,
        )
        self.other_employer = User.objects.create_user(
            username="other-employer",
            email="other-employer@example.com",
            password="StrongPass!123",
            role=User.Role.EMPLOYER,
        )
        self.company = Company.objects.create(owner=self.employer, company_name="Owner Co")
        self.other_company = Company.objects.create(owner=self.other_employer, company_name="Other Co")
        self.category = Category.objects.create(name="Jobs Test Category")

    def make_job(self, *, title, company=None, **overrides):
        fields = {
            "company": company or self.company,
            "title": title,
            "category": self.category,
            "description": "Build useful software.",
            "location": "Kathmandu",
            "application_deadline": timezone.localdate() + timedelta(days=7),
            "status": Job.Status.OPEN,
        }
        fields.update(overrides)
        return Job.objects.create(**fields)

    def test_public_list_filters_only_matching_open_jobs(self):
        matching_job = self.make_job(
            title="Remote internship",
            job_type=Job.JobType.INTERNSHIP,
            work_mode=Job.WorkMode.REMOTE,
        )
        self.make_job(title="On-site internship", job_type=Job.JobType.INTERNSHIP)
        self.make_job(
            title="Closed remote internship",
            job_type=Job.JobType.INTERNSHIP,
            work_mode=Job.WorkMode.REMOTE,
            status=Job.Status.CLOSED,
        )

        response = self.client.get(
            "/api/jobs/",
            {
                "job_type": Job.JobType.INTERNSHIP,
                "category": self.category.id,
                "work_mode": Job.WorkMode.REMOTE,
                "location": "kath",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual([job["id"] for job in response.data], [matching_job.id])

    def test_invalid_choice_filter_returns_validation_error(self):
        response = self.client.get("/api/jobs/", {"job_type": "not-a-job-type"})

        self.assertEqual(response.status_code, 400)
        self.assertIn("job_type", response.data)

    def test_employer_can_retrieve_update_and_delete_own_draft_job(self):
        draft_job = self.make_job(title="Private draft", status=Job.Status.DRAFT)

        self.assertEqual(self.client.get(f"/api/jobs/{draft_job.id}/").status_code, 404)

        self.client.force_authenticate(self.employer)
        self.assertEqual(self.client.get(f"/api/jobs/{draft_job.id}/").status_code, 200)
        update = self.client.patch(
            f"/api/jobs/{draft_job.id}/",
            {"title": "Updated private draft"},
            format="json",
        )
        self.assertEqual(update.status_code, 200)
        self.assertEqual(update.data["title"], "Updated private draft")

        deletion = self.client.delete(f"/api/jobs/{draft_job.id}/")
        self.assertEqual(deletion.status_code, 204)
        self.assertFalse(Job.objects.filter(pk=draft_job.id).exists())

        other_draft = self.make_job(
            title="Other private draft",
            company=self.other_company,
            status=Job.Status.DRAFT,
        )
        self.client.force_authenticate(self.other_employer)
        self.assertEqual(self.client.get(f"/api/jobs/{other_draft.id}/").status_code, 200)
        self.client.force_authenticate(self.employer)
        self.assertEqual(self.client.get(f"/api/jobs/{other_draft.id}/").status_code, 404)

    def test_partial_update_cannot_make_salary_range_invalid(self):
        job = self.make_job(title="Salary range", salary_min=100, salary_max=200)
        self.client.force_authenticate(self.employer)

        response = self.client.patch(
            f"/api/jobs/{job.id}/",
            {"salary_min": 300},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("salary_min", response.data)
        job.refresh_from_db()
        self.assertEqual(job.salary_min, 100)
        self.assertEqual(job.salary_max, 200)

    def test_salary_range_database_constraint_rejects_invalid_values(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                self.make_job(title="Invalid salary range", salary_min=300, salary_max=200)
