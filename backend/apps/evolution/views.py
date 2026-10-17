from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import RegistroEvolucao
from .serializers import RegistroEvolucaoSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def registro_list(request):
    if not request.user.is_student:
        return Response({'detail': 'Apenas alunos.'}, status=403)
    student = request.user.student_profile

    if request.method == 'GET':
        registros = RegistroEvolucao.objects.filter(student=student)
        return Response(RegistroEvolucaoSerializer(registros, many=True, context={'request': request}).data)

    serializer = RegistroEvolucaoSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    registro = serializer.save(student=student)
    return Response(RegistroEvolucaoSerializer(registro, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def registro_detail(request, pk):
    if not request.user.is_student:
        return Response({'detail': 'Apenas alunos.'}, status=403)
    try:
        registro = RegistroEvolucao.objects.get(pk=pk, student=request.user.student_profile)
    except RegistroEvolucao.DoesNotExist:
        return Response({'detail': 'Registro não encontrado.'}, status=404)

    if request.method == 'DELETE':
        registro.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    return Response(RegistroEvolucaoSerializer(registro, context={'request': request}).data)
