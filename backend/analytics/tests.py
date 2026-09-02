from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from companies.models import Company
from jobs.models import Job
from users.models import User


class DashboardTests(APITestCase):
    def setUp(self):
        self.employer = User.objects.create_user(
            username="dashboard-employer",
            email="dashboard-employer@example.com",
            password="StrongPass!123",
            role=User.Role.EMPLOYER,
        )
        company = Company.objects.create(owner=self.employer, company_name="Dashboard Co")
        common_fields = {
            "company": company,
            "description": "A role for dashboard tests.",
            "location": "Kathmandu",
            "status": Job.Status.OPEN,
        }
        Job.objects.create(
            title="Current role",
            application_deadline=timezone.localdate() + timedelta(days=1),
            **common_fields,
        )
        Job.objects.create(
            title="Expired role",
            application_deadline=timezone.localdate() - timedelta(days=1),
            **common_fields,
        )
        self.client.force_authenticate(self.employer)

    def test_active_jobs_excludes_open_jobs_with_expired_deadlines(self):
        response = self.client.get("/api/analytics/dashboard/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["active_jobs"], 1)
        self.assertEqual(response.data["total_jobs"], 2)
