from typing import List, Dict
from django.core.mail import send_mail
from django.conf import settings
from .models import Subscription
from .utils_market import get_realtime_details
from .ai_helper import generate_recommendation
import logging
import pytz
from datetime import datetime

logger = logging.getLogger(__name__)

class SubscriptionMailer:
    """Builds and sends grouped subscription emails per recipient."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _group_by_email(self, subs):
        out = {}
        for s in subs:
            out.setdefault(s.email, []).append(s)
        return out

    def _build_message_for_email(self, email: str, subs: List[Subscription]) -> Dict[str, str]:
        lines = [f"Hello,\n\nHere are your subscription updates:\n"]
        details_list = [get_realtime_details(s.stock_ticker) or {} for s in subs]
        recommendations = generate_recommendation(details_list)
        for s in subs:
            details = details_list[subs.index(s)]
            rec = recommendations.get(s.stock_ticker, {})
            price = details.get('price')
            price_str = f"{price:.2f}" if isinstance(price, (int, float)) else price
            lines.append(f"- {s.stock_ticker}: {price_str} ({rec.get('action', 'HOLD')}) - {rec.get('reason', '')}")
        lines.append("\nIf you don't want these emails, update your subscription settings.")
        subject = f"Subscription digest: {', '.join([s.stock_ticker for s in subs])}"
        body = "\n".join(lines)
        return {"subject": subject, "body": body}

    def send_all(self, subscriptions):
        by_email = self._group_by_email(subscriptions)
        sent = []
        for email, subs in by_email.items():
            msg = self._build_message_for_email(email, subs)
            try:
                send_mail(msg['subject'], msg['body'], getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@example.com'), [email], fail_silently=False)
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
        details = get_realtime_details(subscription.stock_ticker)
        if not details:
            return 0
        rec = generate_recommendation([details])[subscription.stock_ticker]
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
            send_mail(
                subject,
                body,
                getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com"),
                [subscription.email],
                fail_silently=False,
            )
            return 1
        except Exception:
            logger.exception("Failed to send subscription email")
            return 0

# Singleton instance
mailer = SubscriptionMailer()
