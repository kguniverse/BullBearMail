from celery import shared_task
from django.utils import timezone
from django.conf import settings
from .models import Subscription
from .mailer import mailer
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_grouped_subscription_emails():
    """Task: find active subscriptions and send grouped emails."""
    # Adjust query as needed; here we pick all subscriptions. You may want filtering logic (active, not ended)
    subs = list(Subscription.objects.all())
    if not subs:
        logger.info("No subscriptions to process")
        return 0
    sent = mailer.send_all(subs)
    logger.info("Sent grouped emails to %s recipients", len(sent))
    return len(sent)
