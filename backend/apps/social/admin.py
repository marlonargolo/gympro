from django.contrib import admin
from .models import FeedPost, InstagramPost


@admin.register(FeedPost)
class FeedPostAdmin(admin.ModelAdmin):
    list_display = ['author', 'tipo', 'likes_count', 'is_public', 'created_at']
    list_filter = ['tipo', 'is_public']
    search_fields = ['author__full_name', 'caption']


@admin.register(InstagramPost)
class InstagramPostAdmin(admin.ModelAdmin):
    list_display = ['professional', 'post_type', 'status', 'published_at', 'created_at']
    list_filter = ['post_type', 'status']
    search_fields = ['professional__user__full_name']
    readonly_fields = ['instagram_media_id', 'published_at', 'created_at', 'error_message']
