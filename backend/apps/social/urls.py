from django.urls import path
from . import views

urlpatterns = [
    path('', views.feed_list),
    path('<int:pk>/like/', views.toggle_like),
    path('<int:pk>/', views.delete_post),
]
