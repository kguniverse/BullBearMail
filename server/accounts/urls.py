from django.urls import path
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, CustomTokenObtainPairView

urlpatterns = [
    path("auth/login/", CustomTokenObtainPairView.as_view(permission_classes=[AllowAny]), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(permission_classes=[AllowAny]), name="token_refresh"),
    path("auth/register/", RegisterView.as_view(), name="register"),
]