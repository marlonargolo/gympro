from django.db import models as db_models
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import StudentProfile, ProfessionalProfile
from .models import ConnectionRequest
from .serializers import ConnectionRequestSerializer, CreateConnectionRequestSerializer


class CreateConnectionRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateConnectionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        connection_type = data['connection_type']

        user = request.user

        if user.is_student:
            student = user.student_profile
            pro_id = data.get('target_professional_id')
            if not pro_id:
                return Response({'detail': 'target_professional_id é obrigatório para alunos.'}, status=400)
            try:
                professional = ProfessionalProfile.objects.get(pk=pro_id)
            except ProfessionalProfile.DoesNotExist:
                return Response({'detail': 'Profissional não encontrado.'}, status=404)

            # Validate type compatibility
            if connection_type == 'personal_trainer' and not professional.is_personal_trainer:
                return Response({'detail': 'Este profissional não é personal trainer.'}, status=400)
            if connection_type == 'nutritionist' and not professional.is_nutritionist:
                return Response({'detail': 'Este profissional não é nutricionista.'}, status=400)

            # Student already has this type
            if connection_type == 'personal_trainer' and student.personal_trainer_id:
                return Response({'detail': 'Você já possui um personal trainer.'}, status=400)
            if connection_type == 'nutritionist' and student.nutritionist_id:
                return Response({'detail': 'Você já possui um nutricionista.'}, status=400)

            # Check duplicate pending
            exists = ConnectionRequest.objects.filter(
                requester_student=student,
                target_professional=professional,
                connection_type=connection_type,
                status='pending',
            ).exists()
            if exists:
                return Response({'detail': 'Solicitação já enviada.'}, status=400)

            req = ConnectionRequest.objects.create(
                requester_student=student,
                target_professional=professional,
                connection_type=connection_type,
                message=data.get('message', ''),
            )

        elif user.is_professional:
            professional = user.professional_profile
            student_id = data.get('target_student_id')
            if not student_id:
                return Response({'detail': 'target_student_id é obrigatório para profissionais.'}, status=400)
            try:
                student = StudentProfile.objects.get(pk=student_id)
            except StudentProfile.DoesNotExist:
                return Response({'detail': 'Aluno não encontrado.'}, status=404)

            if connection_type == 'personal_trainer' and not professional.is_personal_trainer:
                return Response({'detail': 'Você não é personal trainer.'}, status=400)
            if connection_type == 'nutritionist' and not professional.is_nutritionist:
                return Response({'detail': 'Você não é nutricionista.'}, status=400)

            if connection_type == 'personal_trainer' and student.personal_trainer_id:
                return Response({'detail': 'Este aluno já possui um personal trainer.'}, status=400)
            if connection_type == 'nutritionist' and student.nutritionist_id:
                return Response({'detail': 'Este aluno já possui um nutricionista.'}, status=400)

            exists = ConnectionRequest.objects.filter(
                requester_professional=professional,
                target_student=student,
                connection_type=connection_type,
                status='pending',
            ).exists()
            if exists:
                return Response({'detail': 'Convite já enviado.'}, status=400)

            req = ConnectionRequest.objects.create(
                requester_professional=professional,
                target_student=student,
                connection_type=connection_type,
                message=data.get('message', ''),
            )
        else:
            return Response({'detail': 'Usuário sem perfil válido.'}, status=400)

        return Response(ConnectionRequestSerializer(req).data, status=201)


class ListConnectionRequestsView(generics.ListAPIView):
    serializer_class = ConnectionRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        status_filter = self.request.query_params.get('status', 'pending')
        qs = ConnectionRequest.objects.select_related(
            'requester_student__user', 'requester_professional__user',
            'target_student__user', 'target_professional__user',
        )
        if user.is_student:
            student = user.student_profile
            qs = qs.filter(
                db_models.Q(requester_student=student) | db_models.Q(target_student=student)
            )
        elif user.is_professional:
            professional = user.professional_profile
            qs = qs.filter(
                db_models.Q(requester_professional=professional) | db_models.Q(target_professional=professional)
            )
        if status_filter != 'all':
            qs = qs.filter(status=status_filter)
        return qs


class RespondConnectionRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, action):
        try:
            req = ConnectionRequest.objects.get(pk=pk, status='pending')
        except ConnectionRequest.DoesNotExist:
            return Response({'detail': 'Solicitação não encontrada ou já respondida.'}, status=404)

        user = request.user
        # Only the target can accept/reject
        is_target = (
            (user.is_student and req.target_student and req.target_student.user == user) or
            (user.is_professional and req.target_professional and req.target_professional.user == user)
        )
        # Requester can cancel
        is_requester = (
            (user.is_student and req.requester_student and req.requester_student.user == user) or
            (user.is_professional and req.requester_professional and req.requester_professional.user == user)
        )

        if action == 'accept':
            if not is_target:
                return Response({'detail': 'Apenas o destinatário pode aceitar.'}, status=403)
            try:
                req.accept()
            except Exception as e:
                return Response({'detail': str(e)}, status=400)
            return Response({'detail': 'Vínculo criado com sucesso.'})

        elif action == 'reject':
            if not is_target:
                return Response({'detail': 'Apenas o destinatário pode recusar.'}, status=403)
            req.status = 'rejected'
            req.responded_at = timezone.now()
            req.save(update_fields=['status', 'responded_at'])
            return Response({'detail': 'Solicitação recusada.'})

        elif action == 'cancel':
            if not is_requester:
                return Response({'detail': 'Apenas o solicitante pode cancelar.'}, status=403)
            req.status = 'cancelled'
            req.responded_at = timezone.now()
            req.save(update_fields=['status', 'responded_at'])
            return Response({'detail': 'Solicitação cancelada.'})

        return Response({'detail': 'Ação inválida.'}, status=400)


class UnlinkView(APIView):
    """Break an existing student-professional connection."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, student_id, connection_type):
        user = request.user
        try:
            student = StudentProfile.objects.get(pk=student_id)
        except StudentProfile.DoesNotExist:
            return Response({'detail': 'Aluno não encontrado.'}, status=404)

        # Authorization: the student themselves or their linked professional
        is_student = user.is_student and student.user == user
        is_linked_pro = (
            user.is_professional and (
                (connection_type == 'personal_trainer' and student.personal_trainer and student.personal_trainer.user == user) or
                (connection_type == 'nutritionist' and student.nutritionist and student.nutritionist.user == user)
            )
        )
        if not is_student and not is_linked_pro:
            return Response({'detail': 'Sem permissão para desvincular.'}, status=403)

        if connection_type == 'personal_trainer':
            if not student.personal_trainer_id:
                return Response({'detail': 'Aluno não possui personal trainer.'}, status=400)
            student.personal_trainer = None
            student.save(update_fields=['personal_trainer'])
        elif connection_type == 'nutritionist':
            if not student.nutritionist_id:
                return Response({'detail': 'Aluno não possui nutricionista.'}, status=400)
            student.nutritionist = None
            student.save(update_fields=['nutritionist'])
        else:
            return Response({'detail': 'Tipo de vínculo inválido.'}, status=400)

        return Response({'detail': 'Vínculo removido com sucesso.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_ficha(request, student_id):
    """Full student record — accessible by the student, their trainer, and their nutritionist."""
    try:
        student = StudentProfile.objects.select_related(
            'user', 'personal_trainer__user', 'nutritionist__user'
        ).get(pk=student_id)
    except StudentProfile.DoesNotExist:
        return Response({'detail': 'Aluno não encontrado.'}, status=404)

    user = request.user
    is_self = user.is_student and student.user == user
    is_trainer = user.is_professional and student.personal_trainer and student.personal_trainer.user == user
    is_nutritionist = user.is_professional and student.nutritionist and student.nutritionist.user == user

    if not (is_self or is_trainer or is_nutritionist):
        return Response({'detail': 'Sem permissão para ver esta ficha.'}, status=403)

    from apps.workouts.models import Treino, WorkoutLog
    from apps.evolution.models import RegistroEvolucao
    from apps.nutrition.models import PlanoNutricional
    from apps.workouts.serializers import TreinoSerializer
    from apps.evolution.serializers import RegistroEvolucaoSerializer
    from apps.nutrition.serializers import PlanoNutricionalSerializer
    from datetime import date, timedelta

    workouts = Treino.objects.filter(assigned_to=student)
    logs = WorkoutLog.objects.filter(
        student=student,
        started_at__date__gte=date.today() - timedelta(days=30),
    ).order_by('-started_at')[:20]
    evolucao = RegistroEvolucao.objects.filter(student=student).order_by('-data')[:12]
    nutrition_plan = PlanoNutricional.objects.filter(assigned_to=student).order_by('-created_at').first()

    return Response({
        'student': {
            'id': str(student.pk),
            'name': student.user.full_name,
            'email': student.user.email,
            'phone': student.user.phone,
            'avatar': request.build_absolute_uri(student.user.avatar.url) if student.user.avatar else None,
            'modalidade': student.modalidade,
            'fitness_goal': student.fitness_goal,
            'nivel_atividade': student.nivel_atividade,
            'sexo': student.sexo,
            'birth_date': student.birth_date,
            'weight_kg': student.weight_kg,
            'height_cm': student.height_cm,
        },
        'personal_trainer': {
            'id': student.personal_trainer.pk,
            'name': student.personal_trainer.user.full_name,
            'specialty': student.personal_trainer.specialty,
            'cref': student.personal_trainer.cref,
        } if student.personal_trainer else None,
        'nutritionist': {
            'id': student.nutritionist.pk,
            'name': student.nutritionist.user.full_name,
            'specialty': student.nutritionist.specialty,
            'crn': student.nutritionist.crn,
        } if student.nutritionist else None,
        'treinos': TreinoSerializer(workouts, many=True).data,
        'workout_logs': [
            {
                'id': log.pk,
                'treino_titulo': log.treino.titulo,
                'started_at': log.started_at,
                'finished_at': log.finished_at,
                'notes': log.notes,
            }
            for log in logs
        ],
        'evolucao': RegistroEvolucaoSerializer(evolucao, many=True).data,
        'plano_nutricional': PlanoNutricionalSerializer(nutrition_plan).data if nutrition_plan else None,
    })
