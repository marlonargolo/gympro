import mercadopago
from django.conf import settings


def get_sdk():
    return mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)


def create_preference(user, plan, payment_id):
    sdk = get_sdk()
    back_urls = {
        'success': f'{settings.FRONTEND_STUDENT_URL}/payment/success',
        'failure': f'{settings.FRONTEND_STUDENT_URL}/payment/failure',
        'pending': f'{settings.FRONTEND_STUDENT_URL}/payment/pending',
    }
    if user.user_type == 'professional':
        back_urls = {
            'success': f'{settings.FRONTEND_PRO_URL}/payment/success',
            'failure': f'{settings.FRONTEND_PRO_URL}/payment/failure',
            'pending': f'{settings.FRONTEND_PRO_URL}/payment/pending',
        }

    preference_data = {
        'items': [{
            'title': plan.name,
            'description': plan.description[:255],
            'quantity': 1,
            'unit_price': float(plan.price),
            'currency_id': 'BRL',
        }],
        'payer': {
            'email': user.email,
            'name': user.full_name,
        },
        'payment_methods': {
            'installments': 12,
        },
        'back_urls': back_urls,
        'auto_return': 'approved',
        'notification_url': settings.MP_NOTIFICATION_URL,
        'external_reference': str(payment_id),
        'expires': False,
        'metadata': {
            'user_id': str(user.id),
            'plan_id': plan.id,
            'payment_id': str(payment_id),
        },
    }
    result = sdk.preference().create(preference_data)
    return result


def get_payment_info(mp_payment_id):
    sdk = get_sdk()
    return sdk.payment().get(mp_payment_id)
