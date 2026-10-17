from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Notification(models.Model):
    TYPE_CHOICES = [
        ('workout_assigned', 'Treino Atribuído'),
        ('nutrition_assigned', 'Plano Nutricional Atribuído'),
        ('subscription_activated', 'Assinatura Ativada'),
        ('subscription_expiring', 'Assinatura Expirando'),
        ('payment_approved', 'Pagamento Aprovado'),
        ('payment_rejected', 'Pagamento Rejeitado'),
        ('new_student', 'Novo Aluno'),
        ('general', 'Geral'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    body = models.TextField()
    notification_type = models.CharField(choices=TYPE_CHOICES, max_length=30, default='general')
    is_read = models.BooleanField(default=False)
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} — {self.title}'
