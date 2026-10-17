from django.db import models
from django.contrib.auth import get_user_model
from datetime import date

User = get_user_model()


class Plan(models.Model):
    PLAN_TYPE_CHOICES = [
        ('student', 'Aluno'),
        ('personal_trainer', 'Personal Trainer'),
        ('nutritionist', 'Nutricionista'),
        ('professional_combined', 'Personal + Nutricionista'),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    plan_type = models.CharField(choices=PLAN_TYPE_CHOICES, max_length=25)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.IntegerField(default=30)
    features = models.JSONField(default=list, help_text='Lista de recursos do plano')
    max_students = models.IntegerField(null=True, blank=True, help_text='Máx. de alunos (planos pro)')
    is_active = models.BooleanField(default=True)
    highlight = models.BooleanField(default=False, help_text='Destacar como mais popular')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Plano'
        verbose_name_plural = 'Planos'
        ordering = ['order', 'price']

    def __str__(self):
        return f'{self.name} ({self.get_plan_type_display()})'


class Subscription(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('active', 'Ativo'),
        ('cancelled', 'Cancelado'),
        ('expired', 'Expirado'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name='subscriptions')
    status = models.CharField(choices=STATUS_CHOICES, max_length=20, default='pending')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    payment = models.ForeignKey(
        'payments.Payment', on_delete=models.SET_NULL, null=True, blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Assinatura'
        verbose_name_plural = 'Assinaturas'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} — {self.plan} ({self.status})'

    @property
    def is_active(self):
        return self.status == 'active' and self.end_date is not None and self.end_date >= date.today()
