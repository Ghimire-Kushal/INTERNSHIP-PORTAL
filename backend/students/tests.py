from rest_framework.test import APITestCase
from users.models import User


class StudentProfileTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(username="student", email="student@example.com", password="StrongPass!123", role="student")
        self.client.force_authenticate(self.student)

    def test_student_can_update_profile(self):
        response = self.client.patch("/api/students/me/", {"headline": "BCSIT Student", "city": "Pokhara", "university": "Pokhara University", "cv": None}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["profile_completion"], 20)

    def test_employer_cannot_access_student_profile(self):
        employer = User.objects.create_user(username="employer", email="employer@example.com", password="StrongPass!123", role="employer")
        self.client.force_authenticate(employer)
        self.assertEqual(self.client.get("/api/students/me/").status_code, 403)
