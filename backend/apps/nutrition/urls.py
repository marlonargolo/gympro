from django.urls import path
from . import views

urlpatterns = [
    path('', views.plano_list),
    path('<int:pk>/', views.plano_detail),
    path('<int:pk>/assign/', views.assign_plano),
]
