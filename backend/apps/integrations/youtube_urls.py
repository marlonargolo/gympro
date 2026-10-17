from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.youtube_search),
    path('playlist/<str:playlist_id>/', views.youtube_playlist),
]
