from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_students),
    path('<int:pk>/', views.student_detail),
    path('invite/', views.create_invite),
]
