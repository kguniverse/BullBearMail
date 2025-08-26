from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework import viewsets, permissions, status
from .models import Subscription
from .serializers import SubscriptionSerializer
from .permissions import IsOwnerOrAdmin
from .utils_market import is_valid_ticker, get_realtime_price

class PingView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({"message": f"hello {request.user.username}"})


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsOwnerOrAdmin]

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

        data = get_realtime_price(symbol)
        if not data:
            return Response({"detail": "Invalid or unsupported ticker"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_200_OK)