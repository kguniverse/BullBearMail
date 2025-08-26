from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from .models import Subscription

User = get_user_model()

class SubscriptionPermissionTests(APITestCase):
    def setUp(self):
        self.userA = User.objects.create_user(username="a", password="a123456")
        self.userB = User.objects.create_user(username="b", password="b123456")
        self.admin = User.objects.create_superuser(username="admin", password="admin123")
        self.subA = Subscription.objects.create(user=self.userA)

        def login(u, p):
            url = reverse("token_obtain_pair")
            res = self.client.post(url, {"username": u, "password": p}, format="json")
            return res.data["access"]
        self.tkA = login("a", "a123456")
        self.tkB = login("b", "b123456")
        self.tkAdmin = login("admin", "admin123")

    def test_unauth_401(self):
        url = "/api/subscriptions/"
        res = self.client.get(url)
        self.assertEqual(res.status_code, 401)

    def test_user_cannot_see_others(self):
        url = "/api/subscriptions/"
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.tkB}")
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 0)

    def test_user_cannot_delete_others(self):
        url = f"/api/subscriptions/{self.subA.id}/"
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.tkB}")
        res = self.client.delete(url)
        self.assertEqual(res.status_code, 403)

    def test_admin_can_see_all(self):
        url = "/api/subscriptions/"
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.tkAdmin}")
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 1)
