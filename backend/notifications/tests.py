from rest_framework.test import APITestCase

from users.models import User
from .models import Notification


class NotificationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="notification-user",
            email="notification-user@example.com",
            password="StrongPass!123",
            role=User.Role.STUDENT,
        )
        self.other_user = User.objects.create_user(
            username="other-notification-user",
            email="other-notification-user@example.com",
            password="StrongPass!123",
            role=User.Role.STUDENT,
        )
        self.client.force_authenticate(self.user)

    def test_list_is_private_and_newest_first(self):
        older = Notification.objects.create(user=self.user, title="Older", message="Older message")
        newer = Notification.objects.create(user=self.user, title="Newer", message="Newer message")
        Notification.objects.create(user=self.other_user, title="Private", message="Do not expose")

        response = self.client.get("/api/notifications/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data], [newer.id, older.id])

    def test_user_can_mark_only_their_notification_read(self):
        notification = Notification.objects.create(user=self.user, title="Update", message="Read me")
        other_notification = Notification.objects.create(user=self.other_user, title="Private", message="Keep unread")

        response = self.client.patch(f"/api/notifications/{notification.id}/read/")

        self.assertEqual(response.status_code, 204)
        self.assertTrue(Notification.objects.get(pk=notification.id).is_read)
        self.assertFalse(Notification.objects.get(pk=other_notification.id).is_read)

    def test_mark_all_read_updates_only_current_user(self):
        Notification.objects.create(user=self.user, title="One", message="One")
        Notification.objects.create(user=self.user, title="Two", message="Two")
        other_notification = Notification.objects.create(user=self.other_user, title="Private", message="Keep unread")

        response = self.client.patch("/api/notifications/read-all/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Notification.objects.filter(user=self.user, is_read=False).exists())
        self.assertFalse(Notification.objects.get(pk=other_notification.id).is_read)
