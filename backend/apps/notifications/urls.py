from django.urls import path
from . import views

urlpatterns = [
    path('register-token/', views.register_token),
    path('', views.notification_list),
    path('<int:pk>/read/', views.mark_read),
]
