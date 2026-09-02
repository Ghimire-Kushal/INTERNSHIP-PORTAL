from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from companies.models import Company
from jobs.models import Job
from users.models import User


class SavedJobTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username="saved-job-student",
            email="saved-job-student@example.com",
            password="StrongPass!123",
            role=User.Role.STUDENT,
        )
        employer = User.objects.create_user(
            username="saved-job-employer",
            email="saved-job-employer@example.com",
            password="StrongPass!123",
            role=User.Role.EMPLOYER,
        )
        company = Company.objects.create(owner=employer, company_name="Saved Job Co")
        self.expired_job = Job.objects.create(
            company=company,
            title="Expired but open role",
            description="This role has passed its deadline.",
            location="Kathmandu",
            application_deadline=timezone.localdate() - timedelta(days=1),
            status=Job.Status.OPEN,
        )
        self.client.force_authenticate(self.student)

    def test_student_cannot_save_an_expired_job(self):
        response = self.client.post(
            "/api/applications/saved/",
            {"job": self.expired_job.id},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Job not found.", str(response.data))
