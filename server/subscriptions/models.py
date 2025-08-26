from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="subscriptions")
    stock_ticker = models.CharField(max_length=10)
    email = models.EmailField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "stock_ticker"], name="unique_user_stock_ticker")
        ]

    def __str__(self):
        # Avoid referencing missing attributes; show user and ticker
        return f"{self.user} - {self.stock_ticker}"
