from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from . import spotify as spotify_client
from . import youtube as youtube_client


# ── Spotify ───────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def spotify_auth_url(request):
    code_challenge = request.query_params.get('code_challenge')
    state = request.query_params.get('state', 'gympro')
    redirect_uri = request.query_params.get('redirect_uri', '')
    if not code_challenge:
        return Response({'detail': 'code_challenge é obrigatório.'}, status=400)
    url = spotify_client.get_auth_url(redirect_uri, code_challenge, state)
    return Response({'auth_url': url})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def spotify_callback(request):
    code = request.data.get('code')
    code_verifier = request.data.get('code_verifier')
    redirect_uri = request.data.get('redirect_uri', '')
    if not code or not code_verifier:
        return Response({'detail': 'code e code_verifier são obrigatórios.'}, status=400)

    result = spotify_client.exchange_code(code, code_verifier, redirect_uri)
    if 'error' in result:
        return Response({'detail': result.get('error_description', 'Erro OAuth')}, status=400)

    access_token = result.get('access_token')
    refresh_token = result.get('refresh_token')
    expires_in = result.get('expires_in', 3600)

    prof = None
    student = None
    if request.user.is_professional:
        prof = request.user.professional_profile
        prof.spotify_access_token = access_token
        prof.spotify_refresh_token = refresh_token
        prof.spotify_token_expires = timezone.now() + timedelta(seconds=expires_in)
        prof.save()
    else:
        student = request.user.student_profile
        student.fcm_token = student.fcm_token  # keep
        # Store spotify tokens on student profile using metadata approach
        # Store as separate fields — extend StudentProfile if needed

    return Response({'status': 'connected', 'expires_in': expires_in})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def spotify_refresh(request):
    if request.user.is_professional:
        prof = request.user.professional_profile
        refresh_token = prof.spotify_refresh_token
    else:
        return Response({'detail': 'Sem refresh token armazenado.'}, status=400)

    if not refresh_token:
        return Response({'detail': 'Spotify não conectado.'}, status=400)

    result = spotify_client.refresh_access_token(refresh_token)
    if 'error' in result:
        return Response({'detail': 'Erro ao renovar token.'}, status=400)

    prof.spotify_access_token = result.get('access_token', '')
    if 'refresh_token' in result:
        prof.spotify_refresh_token = result['refresh_token']
    prof.spotify_token_expires = timezone.now() + timedelta(seconds=result.get('expires_in', 3600))
    prof.save()
    return Response({'access_token': prof.spotify_access_token})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def spotify_playlists(request):
    token = None
    if request.user.is_professional:
        token = request.user.professional_profile.spotify_access_token
    if not token:
        return Response({'detail': 'Spotify não conectado.'}, status=400)
    data = spotify_client.get_playlists(token)
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def spotify_status(request):
    connected = False
    if request.user.is_professional:
        prof = request.user.professional_profile
        connected = bool(prof.spotify_access_token)
    return Response({'connected': connected})


# ── YouTube ───────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def youtube_search(request):
    query = request.query_params.get('q', 'workout music')
    max_results = int(request.query_params.get('max', 10))
    data = youtube_client.search_videos(query, max_results)
    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def youtube_playlist(request, playlist_id):
    data = youtube_client.get_playlist_items(playlist_id)
    return Response(data)


# ── Location ──────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nearby_gyms(request):
    lat = request.query_params.get('lat')
    lng = request.query_params.get('lng')
    radius_km = float(request.query_params.get('radius_km', 10))

    if not lat or not lng:
        return Response({'detail': 'lat e lng são obrigatórios.'}, status=400)

    from apps.accounts.models import ProfessionalProfile
    import math

    def haversine(lat1, lon1, lat2, lon2):
        R = 6371
        dlat = math.radians(float(lat2) - float(lat1))
        dlon = math.radians(float(lon2) - float(lon1))
        a = math.sin(dlat/2)**2 + math.cos(math.radians(float(lat1))) * math.cos(math.radians(float(lat2))) * math.sin(dlon/2)**2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    pros = ProfessionalProfile.objects.exclude(gym_lat=None).exclude(gym_lng=None)
    nearby = []
    for pro in pros:
        dist = haversine(lat, lng, pro.gym_lat, pro.gym_lng)
        if dist <= radius_km:
            nearby.append({
                'id': pro.id,
                'gym_name': pro.gym_name or pro.user.full_name,
                'gym_address': pro.gym_address,
                'lat': float(pro.gym_lat),
                'lng': float(pro.gym_lng),
                'distance_km': round(dist, 2),
                'specialty': pro.specialty,
                'cref': pro.cref,
            })
    nearby.sort(key=lambda x: x['distance_km'])
    return Response(nearby)
