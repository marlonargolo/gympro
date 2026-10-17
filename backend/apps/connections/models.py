from django.db import models


class ConnectionRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('accepted', 'Aceito'),
        ('rejected', 'Recusado'),
        ('cancelled', 'Cancelado'),
    ]
    CONNECTION_TYPE_CHOICES = [
        ('personal_trainer', 'Personal Trainer'),
        ('nutritionist', 'Nutricionista'),
    ]

    requester_student = models.ForeignKey(
        'accounts.StudentProfile',
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='sent_requests',
    )
    requester_professional = models.ForeignKey(
        'accounts.ProfessionalProfile',
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='sent_requests',
    )
    target_student = models.ForeignKey(
        'accounts.StudentProfile',
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='received_requests',
    )
    target_professional = models.ForeignKey(
        'accounts.ProfessionalProfile',
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='received_requests',
    )
    connection_type = models.CharField(choices=CONNECTION_TYPE_CHOICES, max_length=20)
    status = models.CharField(choices=STATUS_CHOICES, max_length=20, default='pending')
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Solicitação de Conexão'
        verbose_name_plural = 'Solicitações de Conexão'
        ordering = ['-created_at']

    def __str__(self):
        requester = self.requester_student or self.requester_professional
        target = self.target_student or self.target_professional
        return f'{requester} → {target} ({self.connection_type}, {self.status})'

    def accept(self):
        from django.utils import timezone
        from django.core.exceptions import ValidationError

        student = self.requester_student or self.target_student
        professional = self.requester_professional or self.target_professional

        if not student or not professional:
            raise ValidationError('Solicitação incompleta: aluno ou profissional ausente.')

        if self.connection_type == 'personal_trainer':
            if student.personal_trainer_id:
                raise ValidationError('Aluno já possui um personal trainer.')
            student.personal_trainer = professional
        elif self.connection_type == 'nutritionist':
            if student.nutritionist_id:
                raise ValidationError('Aluno já possui um nutricionista.')
            student.nutritionist = professional

        student.save(update_fields=['personal_trainer' if self.connection_type == 'personal_trainer' else 'nutritionist'])
        self.status = 'accepted'
        self.responded_at = timezone.now()
        self.save(update_fields=['status', 'responded_at'])

        try:
            from apps.notifications.fcm import notify_user
            notify_user(
                student.user,
                title='Conexão aceita!',
                body=f'Você foi vinculado a {professional.user.full_name}.',
                data={'type': 'connection', 'connection_type': self.connection_type},
            )
            notify_user(
                professional.user,
                title='Novo aluno!',
                body=f'{student.user.full_name} foi vinculado à sua conta.',
                data={'type': 'connection', 'connection_type': self.connection_type},
            )
        except Exception:
            pass
