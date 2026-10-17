from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Treino, WorkoutLog
from .serializers import TreinoSerializer, TreinoWriteSerializer, WorkoutLogSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def treino_list(request):
    if request.method == 'GET':
        user = request.user
        if user.is_student:
            student = user.student_profile
            qs = Treino.objects.filter(
                Q(is_public=True) | Q(assigned_to=student)
            ).distinct().prefetch_related('exercicios')
        else:
            prof = user.professional_profile
            qs = Treino.objects.filter(created_by=prof).prefetch_related('exercicios')

        modalidade = request.query_params.get('modalidade')
        nivel = request.query_params.get('nivel')
        if modalidade:
            qs = qs.filter(modalidade=modalidade)
        if nivel:
            qs = qs.filter(nivel=nivel)

        return Response(TreinoSerializer(qs, many=True).data)

    # POST — pro only
    if not request.user.is_professional:
        return Response({'detail': 'Apenas profissionais podem criar treinos.'}, status=403)
    serializer = TreinoWriteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    treino = serializer.save(created_by=request.user.professional_profile)
    return Response(TreinoSerializer(treino).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def treino_detail(request, pk):
    try:
        treino = Treino.objects.prefetch_related('exercicios').get(pk=pk)
    except Treino.DoesNotExist:
        return Response({'detail': 'Treino não encontrado.'}, status=404)

    if request.method == 'GET':
        return Response(TreinoSerializer(treino).data)

    if not request.user.is_professional or treino.created_by != request.user.professional_profile:
        return Response({'detail': 'Sem permissão.'}, status=403)

    if request.method == 'DELETE':
        treino.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = TreinoWriteSerializer(treino, data=request.data, partial=request.method == 'PATCH')
    serializer.is_valid(raise_exception=True)
    treino = serializer.save()
    return Response(TreinoSerializer(treino).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_treino(request, pk):
    if not request.user.is_professional:
        return Response({'detail': 'Sem permissão.'}, status=403)
    try:
        treino = Treino.objects.get(pk=pk, created_by=request.user.professional_profile)
    except Treino.DoesNotExist:
        return Response({'detail': 'Treino não encontrado.'}, status=404)

    from apps.accounts.models import StudentProfile
    student_ids = request.data.get('student_ids', [])
    students = StudentProfile.objects.filter(
        id__in=student_ids,
        professional=request.user.professional_profile,
    )
    treino.assigned_to.set(students)
    return Response({'detail': f'Treino atribuído a {students.count()} aluno(s).'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_treino(request, pk):
    if not request.user.is_student:
        return Response({'detail': 'Apenas alunos podem registrar treinos.'}, status=403)
    try:
        treino = Treino.objects.get(pk=pk)
    except Treino.DoesNotExist:
        return Response({'detail': 'Treino não encontrado.'}, status=404)
    serializer = WorkoutLogSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    log = serializer.save(
        student=request.user.student_profile,
        treino=treino,
    )
    return Response(WorkoutLogSerializer(log).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def treino_logs(request, pk):
    try:
        treino = Treino.objects.get(pk=pk)
    except Treino.DoesNotExist:
        return Response({'detail': 'Treino não encontrado.'}, status=404)
    if request.user.is_student:
        logs = WorkoutLog.objects.filter(treino=treino, student=request.user.student_profile)
    else:
        logs = WorkoutLog.objects.filter(treino=treino)
    return Response(WorkoutLogSerializer(logs, many=True).data)
