from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/plans/', include('apps.plans.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/workouts/', include('apps.workouts.urls')),
    path('api/nutrition/', include('apps.nutrition.urls')),
    path('api/evolution/', include('apps.evolution.urls')),
    path('api/feed/', include('apps.social.urls')),
    path('api/instagram/', include('apps.social.instagram_urls')),
    path('api/spotify/', include('apps.integrations.spotify_urls')),
    path('api/youtube/', include('apps.integrations.youtube_urls')),
    path('api/location/', include('apps.integrations.location_urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/students/', include('apps.accounts.student_urls')),
    path('api/subscriptions/', include('apps.plans.subscription_urls')),
    path('api/admin-stats/', include('apps.accounts.admin_urls')),
    path('api/connections/', include('apps.connections.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
