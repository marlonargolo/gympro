from django.urls import path
from . import views

urlpatterns = [
    path('auth-url/', views.spotify_auth_url),
    path('callback/', views.spotify_callback),
    path('refresh/', views.spotify_refresh),
    path('playlists/', views.spotify_playlists),
    path('status/', views.spotify_status),
]
