import logging
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer, CreatePreferenceSerializer
from .mercadopago_client import create_preference, get_payment_info
from apps.plans.models import Plan, Subscription

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_preference(request):
    serializer = CreatePreferenceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        plan = Plan.objects.get(pk=serializer.validated_data['plan_id'], is_active=True)
    except Plan.DoesNotExist:
        return Response({'detail': 'Plano não encontrado.'}, status=404)

    payment = Payment.objects.create(
        user=request.user,
        plan=plan,
        amount=plan.price,
        status='pending',
    )

    result = create_preference(request.user, plan, payment.id)
    if result['status'] not in (200, 201):
        payment.delete()
        return Response({'detail': 'Erro ao criar preferência no Mercado Pago.'}, status=502)

    preference = result['response']
    payment.mp_preference_id = preference['id']
    payment.save()

    # Create pending subscription
    Subscription.objects.filter(user=request.user, status='active').update(status='cancelled')
    Subscription.objects.create(
        user=request.user,
        plan=plan,
        status='pending',
        payment=payment,
    )

    return Response({
        'payment_id': str(payment.id),
        'preference_id': preference['id'],
        'init_point': preference['init_point'],
        'sandbox_init_point': preference.get('sandbox_init_point'),
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def webhook(request):
    topic = request.query_params.get('topic') or request.data.get('type')
    resource_id = request.query_params.get('id') or request.data.get('data', {}).get('id')

    if topic not in ('payment', 'merchant_order', None):
        return Response({'status': 'ignored'})

    if not resource_id:
        return Response({'status': 'no_id'})

    try:
        result = get_payment_info(resource_id)
        if result['status'] != 200:
            return Response({'status': 'mp_error'}, status=502)

        mp_data = result['response']
        external_ref = mp_data.get('external_reference')
        mp_status = mp_data.get('status')

        if not external_ref:
            return Response({'status': 'no_ref'})

        try:
            payment = Payment.objects.get(id=external_ref)
        except Payment.DoesNotExist:
            logger.warning(f'Webhook: payment {external_ref} not found')
            return Response({'status': 'not_found'})

        payment.mp_payment_id = str(resource_id)
        payment.payment_method = mp_data.get('payment_method_id', '')
        payment.payment_type_id = mp_data.get('payment_type_id', '')
        payment.metadata = mp_data

        if mp_status == 'approved':
            payment.status = 'approved'
            payment.paid_at = timezone.now()
            # Activate subscription
            sub = Subscription.objects.filter(payment=payment).first()
            if sub:
                sub.status = 'active'
                sub.start_date = timezone.now().date()
                sub.end_date = timezone.now().date() + timedelta(days=sub.plan.duration_days)
                sub.save()
        elif mp_status in ('rejected', 'cancelled'):
            payment.status = mp_status
        elif mp_status == 'in_process':
            payment.status = 'in_process'

        payment.save()
    except Exception as e:
        logger.error(f'Webhook error: {e}')
        return Response({'status': 'error'}, status=500)

    return Response({'status': 'ok'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_history(request):
    payments = Payment.objects.filter(user=request.user).order_by('-created_at')
    return Response(PaymentSerializer(payments, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, pk):
    try:
        payment = Payment.objects.get(id=pk, user=request.user)
    except Payment.DoesNotExist:
        return Response({'detail': 'Pagamento não encontrado.'}, status=404)

    # Refresh from MP if still pending
    if payment.status == 'pending' and payment.mp_payment_id:
        result = get_payment_info(payment.mp_payment_id)
        if result['status'] == 200:
            mp_status = result['response'].get('status')
            if mp_status == 'approved' and payment.status != 'approved':
                payment.status = 'approved'
                payment.paid_at = timezone.now()
                payment.save()

    return Response(PaymentSerializer(payment).data)
