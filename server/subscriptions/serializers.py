from rest_framework import serializers
from .models import Subscription
from .utils_market import get_realtime_details

class SubscriptionSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Subscription
        fields = ["id", "user", "stock_ticker", "email", "details"]
        read_only_fields = ["id", "user", "details"]

    def get_details(self, obj):
        return get_realtime_details(obj.stock_ticker)

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
