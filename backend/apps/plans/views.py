from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Plan, Subscription
from .serializers import PlanSerializer, SubscriptionSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def list_plans(request):
    plan_type = request.query_params.get('type')
    qs = Plan.objects.filter(is_active=True)
    if plan_type:
        qs = qs.filter(plan_type=plan_type)
    return Response(PlanSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def plan_detail(request, slug):
    try:
        plan = Plan.objects.get(slug=slug, is_active=True)
    except Plan.DoesNotExist:
        return Response({'detail': 'Plano não encontrado.'}, status=404)
    return Response(PlanSerializer(plan).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_subscription(request):
    sub = Subscription.objects.filter(
        user=request.user, status='active'
    ).select_related('plan').first()
    if sub and sub.is_active:
        return Response(SubscriptionSerializer(sub).data)
    return Response(None)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription(request):
    serializer = SubscriptionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    plan = serializer.validated_data['plan']

    # Cancel any existing active subscription
    Subscription.objects.filter(user=request.user, status='active').update(status='cancelled')

    sub = Subscription.objects.create(
        user=request.user,
        plan=plan,
        status='pending',
    )
    return Response(SubscriptionSerializer(sub).data, status=status.HTTP_201_CREATED)
