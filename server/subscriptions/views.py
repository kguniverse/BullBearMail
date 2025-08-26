from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, permissions
from .models import Subscription
from .serializers import SubscriptionSerializer
from .permissions import IsOwnerOrAdmin

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
