from django.db import models


class PlanoNutricional(models.Model):
    OBJETIVO_CHOICES = [
        ('emagrecimento', 'Emagrecimento'),
        ('manutencao', 'Manutenção'),
        ('hipertrofia', 'Hipertrofia'),
    ]

    created_by = models.ForeignKey(
        'accounts.ProfessionalProfile',
        on_delete=models.CASCADE,
        related_name='planos_nutricionais',
    )
    assigned_to = models.ManyToManyField(
        'accounts.StudentProfile',
        blank=True,
        related_name='planos_nutricionais',
    )
    titulo = models.CharField(max_length=200)
    objetivo = models.CharField(choices=OBJETIVO_CHOICES, max_length=20)
    calorias_diarias = models.IntegerField()
    proteinas_g = models.IntegerField()
    carboidratos_g = models.IntegerField()
    gorduras_g = models.IntegerField()
    refeicoes = models.JSONField(default=list, help_text='[{nome, horario, alimentos: [{nome, qtd, calorias}]}]')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Plano Nutricional'
        verbose_name_plural = 'Planos Nutricionais'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.titulo} ({self.get_objetivo_display()})'
