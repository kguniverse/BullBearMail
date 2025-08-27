from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework import viewsets, permissions, status
from .models import Subscription
from .serializers import SubscriptionSerializer
from .permissions import IsOwnerOrAdmin
from .utils_market import is_valid_ticker, get_realtime_details
from django.core.mail import send_mail, BadHeaderError
from django.conf import settings
import logging

class PingView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({"message": f"hello {request.user.username}"})


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsOwnerOrAdmin]
    queryset = Subscription.objects.all()
    lookup_field = "pk" 

    def get_queryset(self):
        user = self.request.user
        qs = Subscription.objects.all()
        if user.is_staff or user.is_superuser:
            return qs
        return qs.filter(user=user)

    @action(detail=False, methods=["post"], url_path="ticker/validate",
            permission_classes=[IsAuthenticated])
    def ticker_validate(self, request, *args, **kwargs):
        symbol = (request.data.get("ticker") or "").strip()
        if not symbol:
            return Response({"detail": "ticker is required"}, status=status.HTTP_400_BAD_REQUEST)
        ok = is_valid_ticker(symbol)
        return Response({"ticker": symbol, "valid": ok}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="ticker/price",
            permission_classes=[IsAuthenticated])
    def ticker_price(self, request, *args, **kwargs):
        symbol = (request.data.get("ticker") or "").strip()
        if not symbol:
            return Response({"detail": "ticker is required"}, status=status.HTTP_400_BAD_REQUEST)

        data = get_realtime_details(symbol)
        if not data:
            return Response({"detail": "Invalid or unsupported ticker"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsOwnerOrAdmin])
    def send(self, request, *args, **kwargs):
        subscription = self.get_object()
        details = get_realtime_details(subscription.stock_ticker)
        if not details:
            return Response({"detail": "Failed to retrieve stock details"}, status=status.HTTP_400_BAD_REQUEST)

        subject = f"Subscription update: {subscription.stock_ticker}"
        body_lines = [
            f"Hello {subscription.user},",
            "",
            f"Current data for {subscription.stock_ticker}:",
            f"{details}",
            "",
            "If you did not request this, ignore this email.",
        ]
        body = "\n".join(body_lines)
        try:
            # pass
            # Synchronous sending (asynchronous is recommended in production)
            send_mail(
                subject,
                body,
                getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com"),
                [subscription.email],
                fail_silently=False,
            )
            # Asynchronous example (requires implementation of tasks.send_subscription_email_task)
            # from .tasks import send_subscription_email_task
            # send_subscription_email_task.delay(subscription.id, details)
        except BadHeaderError:
            return Response({"detail": "Invalid header in email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception:
            logging.exception("Failed to send subscription email")
            return Response({"detail": "Failed to send email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"detail": "Email sent"}, status=status.HTTP_200_OK)