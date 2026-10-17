from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_plans),
    path('<slug:slug>/', views.plan_detail),
]
