import urllib.parse
import requests
from django.conf import settings


def get_auth_url(redirect_uri, code_challenge, state):
    params = urllib.parse.urlencode({
        'client_id': settings.SPOTIFY_CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': redirect_uri,
        'code_challenge_method': 'S256',
        'code_challenge': code_challenge,
        'state': state,
        'scope': 'user-read-private playlist-read-private streaming user-library-read user-top-read',
    })
    return f'https://accounts.spotify.com/authorize?{params}'


def exchange_code(code, code_verifier, redirect_uri):
    resp = requests.post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'client_id': settings.SPOTIFY_CLIENT_ID,
        'code_verifier': code_verifier,
    }, headers={'Content-Type': 'application/x-www-form-urlencoded'})
    return resp.json()


def refresh_access_token(refresh_token_value):
    resp = requests.post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token_value,
        'client_id': settings.SPOTIFY_CLIENT_ID,
    }, headers={'Content-Type': 'application/x-www-form-urlencoded'})
    return resp.json()


def get_playlists(access_token):
    resp = requests.get('https://api.spotify.com/v1/me/playlists', headers={
        'Authorization': f'Bearer {access_token}'
    }, params={'limit': 50})
    return resp.json()


def get_current_user(access_token):
    resp = requests.get('https://api.spotify.com/v1/me', headers={
        'Authorization': f'Bearer {access_token}'
    })
    return resp.json()
