from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.my_subscription),
    path('', views.create_subscription),
]
