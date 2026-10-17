import requests
from django.conf import settings

YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'


def search_videos(query, max_results=10):
    resp = requests.get(f'{YOUTUBE_API_BASE}/search', params={
        'part': 'snippet',
        'q': query,
        'type': 'video',
        'maxResults': max_results,
        'key': settings.YOUTUBE_API_KEY,
    })
    return resp.json()


def get_playlist_items(playlist_id, max_results=50):
    resp = requests.get(f'{YOUTUBE_API_BASE}/playlistItems', params={
        'part': 'snippet,contentDetails',
        'playlistId': playlist_id,
        'maxResults': max_results,
        'key': settings.YOUTUBE_API_KEY,
    })
    return resp.json()


def get_video_details(video_id):
    resp = requests.get(f'{YOUTUBE_API_BASE}/videos', params={
        'part': 'snippet,contentDetails,statistics',
        'id': video_id,
        'key': settings.YOUTUBE_API_KEY,
    })
    return resp.json()
