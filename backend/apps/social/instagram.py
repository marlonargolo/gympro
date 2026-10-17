import requests
from django.conf import settings

INSTAGRAM_GRAPH_API = 'https://graph.instagram.com/v19.0'


def get_auth_url(redirect_uri):
    import urllib.parse
    params = urllib.parse.urlencode({
        'client_id': settings.INSTAGRAM_APP_ID,
        'redirect_uri': redirect_uri,
        'scope': 'instagram_basic,instagram_content_publish,pages_read_engagement',
        'response_type': 'code',
    })
    return f'https://api.instagram.com/oauth/authorize?{params}'


def exchange_code(code, redirect_uri):
    resp = requests.post('https://api.instagram.com/oauth/access_token', data={
        'client_id': settings.INSTAGRAM_APP_ID,
        'client_secret': settings.INSTAGRAM_APP_SECRET,
        'grant_type': 'authorization_code',
        'redirect_uri': redirect_uri,
        'code': code,
    })
    return resp.json()


def get_long_lived_token(short_token):
    resp = requests.get('https://graph.instagram.com/access_token', params={
        'grant_type': 'ig_exchange_token',
        'client_secret': settings.INSTAGRAM_APP_SECRET,
        'access_token': short_token,
    })
    return resp.json()


def get_user_id(access_token):
    resp = requests.get(f'{INSTAGRAM_GRAPH_API}/me', params={
        'fields': 'id,username',
        'access_token': access_token,
    })
    return resp.json()


def publish_feed_photo(access_token, ig_user_id, image_url, caption):
    r = requests.post(f'{INSTAGRAM_GRAPH_API}/{ig_user_id}/media', params={
        'image_url': image_url,
        'caption': caption,
        'access_token': access_token,
    })
    data = r.json()
    container_id = data.get('id')
    if not container_id:
        return {'error': data}
    r2 = requests.post(f'{INSTAGRAM_GRAPH_API}/{ig_user_id}/media_publish', params={
        'creation_id': container_id,
        'access_token': access_token,
    })
    return r2.json()


def publish_story(access_token, ig_user_id, image_url):
    r = requests.post(f'{INSTAGRAM_GRAPH_API}/{ig_user_id}/media', params={
        'image_url': image_url,
        'media_type': 'STORIES',
        'access_token': access_token,
    })
    data = r.json()
    container_id = data.get('id')
    if not container_id:
        return {'error': data}
    r2 = requests.post(f'{INSTAGRAM_GRAPH_API}/{ig_user_id}/media_publish', params={
        'creation_id': container_id,
        'access_token': access_token,
    })
    return r2.json()
