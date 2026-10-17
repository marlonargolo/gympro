from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_token(request):
    token = request.data.get('token')
    if not token:
        return Response({'detail': 'token é obrigatório.'}, status=400)
    user = request.user
    if user.is_student and hasattr(user, 'student_profile'):
        user.student_profile.fcm_token = token
        user.student_profile.save()
    elif user.is_professional and hasattr(user, 'professional_profile'):
        user.professional_profile.fcm_token = token
        user.professional_profile.save()
    return Response({'status': 'token registrado'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    notifs = Notification.objects.filter(user=request.user)
    return Response(NotificationSerializer(notifs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_read(request, pk):
    try:
        notif = Notification.objects.get(pk=pk, user=request.user)
    except Notification.DoesNotExist:
        return Response({'detail': 'Não encontrado.'}, status=404)
    notif.is_read = True
    notif.save()
    return Response({'status': 'lido'})
