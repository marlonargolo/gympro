import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

FCM_URL = 'https://fcm.googleapis.com/fcm/send'


def send_push(fcm_token, title, body, data=None):
    if not settings.FCM_SERVER_KEY or not fcm_token:
        return None
    payload = {
        'to': fcm_token,
        'notification': {
            'title': title,
            'body': body,
            'sound': 'default',
        },
        'data': data or {},
    }
    try:
        resp = requests.post(FCM_URL, json=payload, headers={
            'Authorization': f'key={settings.FCM_SERVER_KEY}',
            'Content-Type': 'application/json',
        }, timeout=10)
        return resp.json()
    except Exception as e:
        logger.error(f'FCM send error: {e}')
        return None


def notify_user(user, title, body, notification_type='general', data=None):
    from .models import Notification
    notif = Notification.objects.create(
        user=user,
        title=title,
        body=body,
        notification_type=notification_type,
        data=data or {},
    )
    fcm_token = None
    if user.is_student and hasattr(user, 'student_profile'):
        fcm_token = user.student_profile.fcm_token
    elif user.is_professional and hasattr(user, 'professional_profile'):
        fcm_token = user.professional_profile.fcm_token

    if fcm_token:
        send_push(fcm_token, title, body, data)
    return notif
