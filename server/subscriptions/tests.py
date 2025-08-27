from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from .models import Subscription
from .mailer import mailer
from .tasks import send_grouped_subscription_emails
from unittest.mock import patch

User = get_user_model()

# class SubscriptionPermissionTests(APITestCase):
#     def setUp(self):
#         self.userA = User.objects.create_user(username="a", password="a123456")
#         self.userB = User.objects.create_user(username="b", password="b123456")
#         self.admin = User.objects.create_superuser(username="admin", password="admin123")
#         self.subA = Subscription.objects.create(user=self.userA)

#         def login(u, p):
#             url = reverse("token_obtain_pair")
#             res = self.client.post(url, {"username": u, "password": p}, format="json")
#             return res.data["access"]
#         self.tkA = login("a", "a123456")
#         self.tkB = login("b", "b123456")
#         self.tkAdmin = login("admin", "admin123")

#     def test_unauth_401(self):
#         url = "/api/subscriptions/"
#         res = self.client.get(url)
#         self.assertEqual(res.status_code, 401)

#     def test_user_cannot_see_others(self):
#         url = "/api/subscriptions/"
#         self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.tkB}")
#         res = self.client.get(url)
#         self.assertEqual(res.status_code, 200)
#         self.assertEqual(len(res.data), 0)

#     def test_user_cannot_delete_others(self):
#         url = f"/api/subscriptions/{self.subA.id}/"
#         self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.tkB}")
#         res = self.client.delete(url)
#         self.assertEqual(res.status_code, 403)

#     def test_admin_can_see_all(self):
#         url = "/api/subscriptions/"
#         self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.tkAdmin}")
#         res = self.client.get(url)
#         self.assertEqual(res.status_code, 200)
#         self.assertGreaterEqual(len(res.data), 1)

# class StockTickerTests(APITestCase):
#     def setUp(self):
#         self.user = User.objects.create_user(username="user", password="user123")
#         url = reverse("token_obtain_pair")
#         res = self.client.post(url, {"username": "user", "password": "user123"}, format="json")
#         self.token = res.data["access"]
#         self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

#     def test_validate_valid_ticker(self):
#         url = "/api/subscriptions/ticker/validate/"
#         res = self.client.post(url, {"ticker": "AAPL"}, format="json")
#         self.assertEqual(res.status_code, 200)
#         self.assertTrue(res.data["valid"])

#     def test_validate_invalid_ticker(self):
#         url = "/api/subscriptions/ticker/validate/"
#         res = self.client.post(url, {"ticker": "INVALIDTICKER"}, format="json")
#         self.assertEqual(res.status_code, 200)
#         self.assertFalse(res.data["valid"])

#     def test_price_valid_ticker(self):
#         url = "/api/subscriptions/ticker/price/"
#         res = self.client.post(url, {"ticker": "AAPL"}, format="json")
#         self.assertEqual(res.status_code, 200)
#         self.assertIn("price", res.data)

#     def test_price_invalid_ticker(self):
#         url = "/api/subscriptions/ticker/price/"
#         res = self.client.post(url, {"ticker": "INVALIDTICKER"}, format="json")
#         self.assertEqual(res.status_code, 400)

class SubscriptionMailerTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="user", password="user123")
        self.email = "kkwang@outlook.com"
        self.sub1 = Subscription.objects.create(user=self.user, stock_ticker="AAPL", email=self.email)
        self.sub2 = Subscription.objects.create(user=self.user, stock_ticker="MSFT", email=self.email)

    @patch("subscriptions.mailer.send_mail")
    def test_send_single(self, mock_send_mail):
        # 测试单条订阅发送
        count = mailer.send_single(self.sub1)
        self.assertEqual(count, 1)
        mock_send_mail.assert_called_once()
        args, kwargs = mock_send_mail.call_args
        self.assertIn("AAPL", args[0])  # subject
        self.assertIn(self.email, kwargs["recipient_list"])

    @patch("subscriptions.mailer.send_mail")
    def test_send_all_grouped(self, mock_send_mail):
        # 测试分组发送（同邮箱合并）
        subs = [self.sub1, self.sub2]
        sent = mailer.send_all(subs)
        self.assertEqual(sent, [self.email])
        mock_send_mail.assert_called_once()
        args, kwargs = mock_send_mail.call_args
        self.assertIn("AAPL", args[0])
        self.assertIn("MSFT", args[0])
        self.assertIn(self.email, kwargs["recipient_list"])

    @patch("subscriptions.mailer.send_mail")
    def test_send_scheduled_time_window(self, mock_send_mail):
        # 测试定时任务只在工作日9-17点发送
        with patch("subscriptions.mailer.datetime") as mock_dt:
            import pytz
            from datetime import datetime
            # 设置为周一10点ET
            mock_dt.now.return_value = datetime(2025, 8, 25, 10, 0, tzinfo=pytz.timezone("US/Eastern"))
            count = mailer.send_scheduled()
            self.assertGreaterEqual(count, 1)
            mock_send_mail.assert_called()

    @patch("subscriptions.mailer.send_mail")
    def test_send_scheduled_outside_time(self, mock_send_mail):
        # 设置为周六10点ET（非工作日）
        with patch("subscriptions.mailer.datetime") as mock_dt:
            import pytz
            from datetime import datetime
            mock_dt.now.return_value = datetime(2025, 8, 23, 10, 0, tzinfo=pytz.timezone("US/Eastern"))
            count = mailer.send_scheduled()
            self.assertEqual(count, 0)
            mock_send_mail.assert_not_called()

    @patch("subscriptions.mailer.send_mail")
    def test_celery_task_grouped(self, mock_send_mail):
        # 测试 celery task 入口
        result = send_grouped_subscription_emails()
        self.assertGreaterEqual(result, 1)
        mock_send_mail.assert_called()

    @patch("subscriptions.ai_helper.generate_recommendation")
    @patch("subscriptions.mailer.send_mail")
    def test_ai_recommendation_in_email(self, mock_send_mail, mock_gen_rec):
        # 测试AI推荐内容被包含在邮件正文
        mock_gen_rec.return_value = {"action": "BUY", "reason": "AI says buy", "source": "openai"}
        mailer.send_single(self.sub1)
        args, kwargs = mock_send_mail.call_args
        self.assertIn("AI Recommendation: BUY - AI says buy", args[1])  # body

