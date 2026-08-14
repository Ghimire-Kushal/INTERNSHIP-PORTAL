from rest_framework.test import APITestCase
from users.models import User

class CompanyTests(APITestCase):
    def test_employer_can_update_only_own_company(self):
        employer = User.objects.create_user(username="employer", email="employer@example.com", password="StrongPass!123", role="employer")
        self.client.force_authenticate(employer)
        response = self.client.patch("/api/companies/me/", {"company_name": "Acme Labs", "city": "Kathmandu"}, format="json")
        self.assertEqual(response.status_code, 200); self.assertEqual(response.data["company_name"], "Acme Labs")
    def test_student_cannot_access_employer_company(self):
        student = User.objects.create_user(username="student", email="student@example.com", password="StrongPass!123", role="student")
        self.client.force_authenticate(student)
        self.assertEqual(self.client.get("/api/companies/me/").status_code, 403)
