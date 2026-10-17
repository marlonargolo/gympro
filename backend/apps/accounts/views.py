import uuid
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.db.models import Q
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

def _get_pro_students(prof):
    """All students linked to this professional as trainer or nutritionist."""
    return StudentProfile.objects.filter(
        Q(personal_trainer=prof) | Q(nutritionist=prof)
    ).distinct().select_related('user')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_students(request):
    if not request.user.is_professional:
        return Response({'detail': 'Acesso negado.'}, status=403)
    prof = request.user.professional_profile
    students = _get_pro_students(prof)
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
    prof = request.user.professional_profile
    try:
        student = StudentProfile.objects.get(pk=pk)
        if student.personal_trainer != prof and student.nutritionist != prof:
            raise StudentProfile.DoesNotExist
    except StudentProfile.DoesNotExist:
        return Response({'detail': 'Aluno não encontrado.'}, status=404)

    if request.method == 'DELETE':
        if student.personal_trainer == prof:
            student.personal_trainer = None
        if student.nutritionist == prof:
            student.nutritionist = None
        student.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    from .serializers import StudentProfileSerializer
    d = StudentProfileSerializer(student).data
    d['user'] = UserSerializer(student.user, context={'request': request}).data
    return Response(d)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_ficha(request, pk):
    """
    Full student record.
    Access: the student themselves, their personal_trainer, or their nutritionist.
    """
    try:
        student = StudentProfile.objects.select_related('user', 'personal_trainer__user', 'nutritionist__user').get(pk=pk)
    except StudentProfile.DoesNotExist:
        return Response({'detail': 'Aluno não encontrado.'}, status=404)

    user = request.user
    prof = getattr(user, 'professional_profile', None)
    is_own = user.is_student and student.user == user
    is_linked_prof = prof and (student.personal_trainer == prof or student.nutritionist == prof)
    if not (is_own or is_linked_prof):
        return Response({'detail': 'Acesso negado.'}, status=403)

    from apps.workouts.models import Treino, WorkoutLog
    from apps.workouts.serializers import TreinoSerializer, WorkoutLogSerializer
    from apps.nutrition.models import PlanoNutricional
    from apps.nutrition.serializers import PlanoNutricionalSerializer
    from apps.evolution.models import RegistroEvolucao
    from apps.evolution.serializers import RegistroEvolucaoSerializer
    from .serializers import StudentProfileSerializer

    treinos = Treino.objects.filter(assigned_to=student)
    logs = WorkoutLog.objects.filter(student=student).order_by('-started_at')[:20]
    evolucao = RegistroEvolucao.objects.filter(student=student).order_by('-recorded_at')[:20]
    nutri_plan = PlanoNutricional.objects.filter(student=student).first()

    return Response({
        'student': StudentProfileSerializer(student).data,
        'user': UserSerializer(student.user, context={'request': request}).data,
        'treinos': TreinoSerializer(treinos, many=True).data,
        'workout_logs': WorkoutLogSerializer(logs, many=True).data,
        'evolucao': RegistroEvolucaoSerializer(evolucao, many=True).data,
        'plano_nutricional': PlanoNutricionalSerializer(nutri_plan).data if nutri_plan else None,
        'personal_trainer': {
            'name': student.personal_trainer.user.full_name,
            'cref': student.personal_trainer.cref,
        } if student.personal_trainer else None,
        'nutritionist': {
            'name': student.nutritionist.user.full_name,
            'crn': student.nutritionist.crn,
        } if student.nutritionist else None,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_invite(request):
    if not request.user.is_professional:
        return Response({'detail': 'Acesso negado.'}, status=403)
    prof = request.user.professional_profile
    connection_type = request.data.get('connection_type', 'personal_trainer')

    if connection_type == 'personal_trainer' and not prof.is_personal_trainer:
        return Response({'detail': 'Você não é personal trainer.'}, status=400)
    if connection_type == 'nutritionist' and not prof.is_nutritionist:
        return Response({'detail': 'Você não é nutricionista.'}, status=400)

    code = str(uuid.uuid4())[:8].upper()
    invite = InviteCode.objects.create(
        professional=prof,
        code=code,
        connection_type=connection_type,
    )
    return Response(InviteCodeSerializer(invite).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def use_invite(request):
    if not request.user.is_student:
        return Response({'detail': 'Apenas alunos podem usar convites.'}, status=403)
    code = request.data.get('code', '').upper()
    try:
        invite = InviteCode.objects.select_related('professional').get(code=code, used_by=None)
    except InviteCode.DoesNotExist:
        return Response({'detail': 'Código inválido ou já utilizado.'}, status=400)

    student = request.user.student_profile
    conn_type = invite.connection_type

    if conn_type == 'personal_trainer':
        if student.personal_trainer_id:
            return Response({'detail': 'Você já tem um personal trainer vinculado.'}, status=400)
        student.personal_trainer = invite.professional
    elif conn_type == 'nutritionist':
        if student.nutritionist_id:
            return Response({'detail': 'Você já tem um nutricionista vinculado.'}, status=400)
        student.nutritionist = invite.professional

    student.save()
    invite.used_by = student
    invite.save()
    return Response({'detail': f'Vinculado ao {invite.professional.user.full_name} como {conn_type}.'})


# ── Admin stats ──────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_overview(request):
    from django.db.models import Sum
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
