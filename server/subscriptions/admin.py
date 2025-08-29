from django.contrib import admin
from .models import Subscription

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "stock_ticker", "email")
    search_fields = ("user__username", "stock_ticker", "email")
    list_filter = ("stock_ticker", "email")
