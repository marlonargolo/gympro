import uuid
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import StudentProfile, ProfessionalProfile, InviteCode
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ChangePasswordSerializer, UpdateProfileSerializer, InviteCodeSerializer,
)

User = get_user_model()


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    tokens = get_tokens(user)
    return Response({
        **tokens,
        'user': UserSerializer(user, context={'request': request}).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    tokens = get_tokens(user)

    # Get active subscription
    active_sub = None
    try:
        from apps.plans.models import Subscription
        from apps.plans.serializers import SubscriptionSerializer
        sub = Subscription.objects.filter(
            user=user, status='active'
        ).select_related('plan').first()
        if sub and sub.is_active:
            active_sub = SubscriptionSerializer(sub).data
    except Exception:
        pass

    return Response({
        **tokens,
        'user': UserSerializer(user, context={'request': request}).data,
        'subscription': active_sub,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'detail': 'Logout realizado com sucesso.'})
    except TokenError:
        return Response({'detail': 'Token inválido.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(UserSerializer(request.user, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    request.user.set_password(serializer.validated_data['new_password'])
    request.user.save()
    return Response({'detail': 'Senha alterada com sucesso.'})


# ── Students management (pro only) ──────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_students(request):
    if not request.user.is_professional:
        return Response({'detail': 'Acesso negado.'}, status=403)
    prof = request.user.professional_profile
    students = StudentProfile.objects.filter(professional=prof).select_related('user')
    from .serializers import StudentProfileSerializer
    data = []
    for s in students:
        d = StudentProfileSerializer(s).data
        d['user'] = UserSerializer(s.user, context={'request': request}).data
        data.append(d)
    return Response(data)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def student_detail(request, pk):
    if not request.user.is_professional:
        return Response({'detail': 'Acesso negado.'}, status=403)
    try:
        student = StudentProfile.objects.get(pk=pk, professional=request.user.professional_profile)
    except StudentProfile.DoesNotExist:
        return Response({'detail': 'Aluno não encontrado.'}, status=404)

    if request.method == 'DELETE':
        student.professional = None
        student.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    from .serializers import StudentProfileSerializer
    d = StudentProfileSerializer(student).data
    d['user'] = UserSerializer(student.user, context={'request': request}).data
    return Response(d)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_invite(request):
    if not request.user.is_professional:
        return Response({'detail': 'Acesso negado.'}, status=403)
    code = str(uuid.uuid4())[:8].upper()
    invite = InviteCode.objects.create(
        professional=request.user.professional_profile,
        code=code,
    )
    return Response(InviteCodeSerializer(invite).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def use_invite(request):
    if not request.user.is_student:
        return Response({'detail': 'Apenas alunos podem usar convites.'}, status=403)
    code = request.data.get('code', '').upper()
    try:
        invite = InviteCode.objects.get(code=code, used_by=None)
    except InviteCode.DoesNotExist:
        return Response({'detail': 'Código inválido ou já utilizado.'}, status=400)
    student = request.user.student_profile
    student.professional = invite.professional
    student.save()
    invite.used_by = student
    invite.save()
    return Response({'detail': 'Vinculado ao profissional com sucesso.'})


# ── Admin stats ──────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_overview(request):
    from django.db.models import Sum, Count
    from apps.plans.models import Subscription
    from apps.payments.models import Payment

    total_users = User.objects.count()
    total_students = User.objects.filter(user_type='student').count()
    total_pros = User.objects.filter(user_type='professional').count()
    active_subs = Subscription.objects.filter(status='active').count()
    total_revenue = Payment.objects.filter(status='approved').aggregate(total=Sum('amount'))['total'] or 0
    recent_payments = Payment.objects.filter(status='approved').order_by('-paid_at')[:5]
    from apps.payments.serializers import PaymentSerializer

    return Response({
        'total_users': total_users,
        'total_students': total_students,
        'total_professionals': total_pros,
        'active_subscriptions': active_subs,
        'total_revenue_brl': float(total_revenue),
        'recent_payments': PaymentSerializer(recent_payments, many=True).data,
        'new_users_today': User.objects.filter(created_at__date=timezone.now().date()).count(),
    })
