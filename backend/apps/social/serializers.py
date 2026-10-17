from rest_framework import serializers
from .models import FeedPost, InstagramPost


class FeedPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_type = serializers.CharField(source='author.user_type', read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = FeedPost
        fields = [
            'id', 'author_name', 'author_type', 'caption', 'media_url',
            'tipo', 'likes_count', 'is_liked', 'is_public', 'created_at',
        ]
        read_only_fields = ['id', 'likes_count', 'created_at', 'author_name', 'author_type', 'is_liked']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.liked_by.filter(id=request.user.id).exists()
        return False


class InstagramPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstagramPost
        fields = [
            'id', 'post_type', 'caption', 'media_url',
            'status', 'error_message', 'published_at', 'created_at',
        ]
        read_only_fields = ['id', 'status', 'error_message', 'published_at', 'created_at']
