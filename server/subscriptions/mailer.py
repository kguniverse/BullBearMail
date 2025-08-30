from typing import List, Dict
# from django.core.mail import send_mail
from django.conf import settings
from .models import Subscription
from .utils_market import get_realtime_details
from .ai_helper import generate_recommendation
import logging
import pytz
from datetime import datetime
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.errors import HttpError
import base64
import os
from email.message import EmailMessage

logger = logging.getLogger(__name__)
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify"
]

class SubscriptionMailer:
    """Builds and sends grouped subscription emails per recipient."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):

        creds = None
        if os.path.exists("token.json"):
            creds = Credentials.from_authorized_user_file("token.json", SCOPES)
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    "credentials.json", SCOPES
                )
                creds = flow.run_local_server(port=0)
                # Save the credentials for the next run
            with open("token.json", "w") as token:
                token.write(creds.to_json())

        self.creds = creds

    def _group_by_email(self, subs):
        out = {}
        for s in subs:
            out.setdefault(s.email, []).append(s)
        return out

    def _build_message_for_email(self, email: str, subs: List[Subscription]) -> Dict[str, str]:
        lines = [f"Hello,\n\nHere are your subscription updates:\n"]
        details_list = []
        for s in subs:
            try:
                d = get_realtime_details(s.stock_ticker) or {}
            except Exception:
                logger.exception("Failed to fetch realtime details for %s", s.stock_ticker)
                d = {}
            if isinstance(d, dict):
                d.setdefault("stock_ticker", s.stock_ticker)
            details_list.append(d)

        recommendations = generate_recommendation(details_list)
        for s, details in zip(subs, details_list):
            rec = recommendations.get(s.stock_ticker, {})
            price = details.get('price')
            price_str = f"{price:.2f}" if isinstance(price, (int, float)) else price
            lines.append(f"- {s.stock_ticker}: {price_str} ({rec.get('action', 'HOLD')}) - {rec.get('reason', '')}")
        lines.append("\nIf you don't want these emails, update your subscription settings.")
        subject = f"Subscription digest: {', '.join([s.stock_ticker for s in subs])}"
        body = "\n".join(lines)
        return {"subject": subject, "body": body}

    def _send_email_gmail(self, subject, body, to_emails):
        for to_email in to_emails:
            service = build('gmail', 'v1', credentials=self.creds)
            message = EmailMessage()
            message['To'] = to_email
            message['From'] = settings.DEFAULT_FROM_EMAIL
            message['Subject'] = subject

            message.set_content(body)

            raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
            create_message = {"raw": raw}
            # pylint: disable=E1101
            send = (
                service.users()
                .messages()
                .send(userId="me", body=create_message)
                .execute()
            )

            print(send)

    def send_all(self, subscriptions):
        by_email = self._group_by_email(subscriptions)
        sent = []
        for email, subs in by_email.items():
            msg = self._build_message_for_email(email, subs)
            try:
                self._send_email_gmail(msg['subject'], msg['body'], [email])
                sent.append(email)
            except Exception:
                logger.exception("Failed to send grouped email to %s", email)
        return sent

    def send_scheduled(self):
        # Only run during 9am-5pm ET on weekdays
        now = datetime.now(pytz.timezone("US/Eastern"))
        if now.weekday() >= 5 or not (9 <= now.hour <= 17):
            return 0

        subs = list(Subscription.objects.all())
        return len(self.send_all(subs))

    def send_single(self, subscription):
        try:
            details = get_realtime_details(subscription.stock_ticker) or {}
        except Exception:
            logger.exception("Failed to fetch realtime details for %s", subscription.stock_ticker)
            details = {}
        if not details:
            return 0
        details.setdefault("stock_ticker", subscription.stock_ticker)
        rec = generate_recommendation([details]).get(subscription.stock_ticker, {})
        subject = f"Subscription update: {subscription.stock_ticker}"
        body_lines = [
            f"Hello {subscription.user},",
            "",
            "This email is triggered by your subscription.",
            f"Current data for {subscription.stock_ticker}:",
            f"- {subscription.stock_ticker}: {details.get('price', 0):.2f}",
            f"AI Recommendation: {rec.get('action', 'HOLD')} - {rec.get('reason', '')}",
            "",
            "If you did not request this, ignore this email.",
        ]
        body = "\n".join(body_lines)
        try:
            self._send_email_gmail(
                subject,
                body,
                [subscription.email],
            )
            return 1
        except Exception:
            logger.exception("Failed to send subscription email")
            return 0

# Singleton instance
mailer = SubscriptionMailer()
