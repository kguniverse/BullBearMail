from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework import viewsets, permissions, status
from .models import Subscription
from .mailer import mailer
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
        # Only send the current subscription, no grouping
        sent_count = mailer.send_single(subscription)
        if sent_count:
            return Response({"detail": "Email sent"}, status=status.HTTP_200_OK)
        return Response({"detail": "Failed to send email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def sendall(self, request, *args, **kwargs):
        user = request.user
        if user.is_staff or user.is_superuser:
            subs = Subscription.objects.all()
        else:
            subs = Subscription.objects.filter(user=user)
        sent_emails = mailer.send_all(subs)
        return Response({
            "sent_count": len(sent_emails),
            "emails": sent_emails
        }, status=status.HTTP_200_OK)

