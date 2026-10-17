from django.urls import path
from . import views

urlpatterns = [
    path('', views.treino_list),
    path('<uuid:pk>/', views.treino_detail),
    path('<uuid:pk>/assign/', views.assign_treino),
    path('<uuid:pk>/log/', views.log_treino),
    path('<uuid:pk>/logs/', views.treino_logs),
]
