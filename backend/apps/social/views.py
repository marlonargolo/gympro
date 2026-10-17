from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import FeedPost, InstagramPost
from .serializers import FeedPostSerializer, InstagramPostSerializer
from . import instagram as ig_client


# ── Feed ─────────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def feed_list(request):
    if request.method == 'GET':
        posts = FeedPost.objects.filter(is_public=True).select_related('author')
        return Response(FeedPostSerializer(posts, many=True, context={'request': request}).data)

    serializer = FeedPostSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    post = serializer.save(author=request.user)
    return Response(FeedPostSerializer(post, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request, pk):
    try:
        post = FeedPost.objects.get(pk=pk)
    except FeedPost.DoesNotExist:
        return Response({'detail': 'Post não encontrado.'}, status=404)

    if post.liked_by.filter(id=request.user.id).exists():
        post.liked_by.remove(request.user)
        post.likes_count = max(0, post.likes_count - 1)
    else:
        post.liked_by.add(request.user)
        post.likes_count += 1
    post.save()
    return Response({'likes_count': post.likes_count, 'is_liked': post.liked_by.filter(id=request.user.id).exists()})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post(request, pk):
    try:
        post = FeedPost.objects.get(pk=pk, author=request.user)
    except FeedPost.DoesNotExist:
        return Response({'detail': 'Post não encontrado.'}, status=404)
    post.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ── Instagram ─────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instagram_auth_url(request):
    if not request.user.is_professional:
        return Response({'detail': 'Apenas profissionais.'}, status=403)
    redirect_uri = request.query_params.get('redirect_uri', f'{request.build_absolute_uri("/api/instagram/callback/")}')
    url = ig_client.get_auth_url(redirect_uri)
    return Response({'auth_url': url})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def instagram_callback(request):
    if not request.user.is_professional:
        return Response({'detail': 'Apenas profissionais.'}, status=403)
    code = request.data.get('code')
    redirect_uri = request.data.get('redirect_uri')
    if not code:
        return Response({'detail': 'Código não fornecido.'}, status=400)

    result = ig_client.exchange_code(code, redirect_uri)
    if 'error' in result:
        return Response({'detail': result.get('error_description', 'Erro OAuth')}, status=400)

    short_token = result.get('access_token')
    long_result = ig_client.get_long_lived_token(short_token)
    long_token = long_result.get('access_token', short_token)

    user_result = ig_client.get_user_id(long_token)
    ig_user_id = user_result.get('id', '')

    prof = request.user.professional_profile
    prof.instagram_token = long_token
    prof.instagram_user_id = ig_user_id
    prof.save()

    return Response({'status': 'connected', 'instagram_user_id': ig_user_id})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instagram_status(request):
    if not request.user.is_professional:
        return Response({'detail': 'Apenas profissionais.'}, status=403)
    prof = request.user.professional_profile
    connected = bool(prof.instagram_token and prof.instagram_user_id)
    return Response({
        'connected': connected,
        'instagram_user_id': prof.instagram_user_id if connected else None,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def instagram_publish(request):
    if not request.user.is_professional:
        return Response({'detail': 'Apenas profissionais.'}, status=403)
    prof = request.user.professional_profile
    if not prof.instagram_token:
        return Response({'detail': 'Instagram não conectado.'}, status=400)

    post_type = request.data.get('post_type', 'feed')
    media_url = request.data.get('media_url')
    caption = request.data.get('caption', '')

    if not media_url:
        return Response({'detail': 'media_url é obrigatório.'}, status=400)

    ig_post = InstagramPost.objects.create(
        professional=prof,
        post_type=post_type,
        caption=caption,
        media_url=media_url,
        status='pending',
    )

    if post_type == 'story':
        result = ig_client.publish_story(prof.instagram_token, prof.instagram_user_id, media_url)
    else:
        result = ig_client.publish_feed_photo(prof.instagram_token, prof.instagram_user_id, media_url, caption)

    if 'error' in result or 'id' not in result:
        ig_post.status = 'failed'
        ig_post.error_message = str(result)
        ig_post.save()
        return Response({'detail': 'Erro ao publicar.', 'error': result}, status=502)

    ig_post.status = 'published'
    ig_post.instagram_media_id = result.get('id', '')
    ig_post.published_at = timezone.now()
    ig_post.save()

    return Response(InstagramPostSerializer(ig_post).data)
