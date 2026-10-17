from django.urls import path
from . import views

urlpatterns = [
    path('create-preference/', views.create_payment_preference),
    path('webhook/', views.webhook),
    path('history/', views.payment_history),
    path('<uuid:pk>/status/', views.payment_status),
]
