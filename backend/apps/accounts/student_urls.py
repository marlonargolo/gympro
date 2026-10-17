from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_students),
    path('<int:pk>/', views.student_detail),
    path('<int:pk>/ficha/', views.student_ficha),
    path('invite/', views.create_invite),
]
