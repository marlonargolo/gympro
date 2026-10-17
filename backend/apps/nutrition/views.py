from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import PlanoNutricional
from .serializers import PlanoNutricionalSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def plano_list(request):
    if request.method == 'GET':
        if request.user.is_student:
            qs = PlanoNutricional.objects.filter(assigned_to=request.user.student_profile)
        else:
            qs = PlanoNutricional.objects.filter(created_by=request.user.professional_profile)
        return Response(PlanoNutricionalSerializer(qs, many=True).data)

    if not request.user.is_professional:
        return Response({'detail': 'Apenas profissionais podem criar planos.'}, status=403)
    serializer = PlanoNutricionalSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    plano = serializer.save(created_by=request.user.professional_profile)
    return Response(PlanoNutricionalSerializer(plano).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def plano_detail(request, pk):
    if request.user.is_student:
        qs = PlanoNutricional.objects.filter(assigned_to=request.user.student_profile)
    else:
        qs = PlanoNutricional.objects.filter(created_by=request.user.professional_profile)
    try:
        plano = qs.get(pk=pk)
    except PlanoNutricional.DoesNotExist:
        return Response({'detail': 'Plano não encontrado.'}, status=404)

    if request.method == 'GET':
        return Response(PlanoNutricionalSerializer(plano).data)
    if request.method == 'DELETE':
        plano.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    serializer = PlanoNutricionalSerializer(plano, data=request.data, partial=request.method == 'PATCH')
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(PlanoNutricionalSerializer(plano).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_plano(request, pk):
    if not request.user.is_professional:
        return Response({'detail': 'Sem permissão.'}, status=403)
    try:
        plano = PlanoNutricional.objects.get(pk=pk, created_by=request.user.professional_profile)
    except PlanoNutricional.DoesNotExist:
        return Response({'detail': 'Plano não encontrado.'}, status=404)
    from apps.accounts.models import StudentProfile
    student_ids = request.data.get('student_ids', [])
    students = StudentProfile.objects.filter(id__in=student_ids, professional=request.user.professional_profile)
    plano.assigned_to.set(students)
    return Response({'detail': f'Plano atribuído a {students.count()} aluno(s).'})
