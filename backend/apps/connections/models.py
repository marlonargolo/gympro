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
