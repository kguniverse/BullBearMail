from rest_framework import serializers
from .models import Subscription
from .utils_market import get_realtime_details, is_valid_ticker

class SubscriptionSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Subscription
        fields = ["id", "user", "stock_ticker", "email", "details"]
        read_only_fields = ["id", "user", "details"]

    def validate_stock_ticker(self, value):
        """
        Validate and normalize stock_ticker before saving.
        Raises ValidationError for invalid/unsupported tickers.
        """
        symbol = (value or "").strip().upper()
        if not symbol:
            raise serializers.ValidationError("stock_ticker is required")
        if not is_valid_ticker(symbol):
            raise serializers.ValidationError("Invalid or unsupported stock ticker")
        return symbol

    def get_details(self, obj):
        try:
            details = get_realtime_details(obj.stock_ticker)
            return details or {"error": "Unable to fetch stock details"}
        except Exception as e:
            return {"error": f"Error fetching details: {str(e)}"}

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        try:
            return super().create(validated_data)
        except Exception as e:
            raise serializers.ValidationError(f"Error creating subscription: {str(e)}")
