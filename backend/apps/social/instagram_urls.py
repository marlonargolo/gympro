from django.urls import path
from . import views

urlpatterns = [
    path('auth-url/', views.instagram_auth_url),
    path('callback/', views.instagram_callback),
    path('publish/', views.instagram_publish),
    path('status/', views.instagram_status),
]
