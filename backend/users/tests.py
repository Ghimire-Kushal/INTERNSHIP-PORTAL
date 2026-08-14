from django.urls import reverse
from rest_framework.test import APITestCase
from .models import User


class AuthenticationTests(APITestCase):
    def test_student_can_register_and_login(self):
        registration = self.client.post(reverse("register"), {"username": "student1", "email": "student@example.com", "password": "StrongPass!123", "first_name": "Test", "last_name": "Student", "role": "student"}, format="json")
        self.assertEqual(registration.status_code, 201)
        self.assertEqual(User.objects.get().role, User.Role.STUDENT)
        login = self.client.post(reverse("login"), {"username": "student1", "password": "StrongPass!123"}, format="json")
        self.assertEqual(login.status_code, 200)
        self.assertIn("access", login.data)

    def test_public_registration_cannot_create_admin(self):
        response = self.client.post(reverse("register"), {"username": "admin1", "email": "admin@example.com", "password": "StrongPass!123", "first_name": "Test", "last_name": "Admin", "role": "admin"}, format="json")
        self.assertEqual(response.status_code, 400)
