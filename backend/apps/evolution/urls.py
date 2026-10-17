from django.urls import path
from . import views

urlpatterns = [
    path('', views.registro_list),
    path('<int:pk>/', views.registro_detail),
]
