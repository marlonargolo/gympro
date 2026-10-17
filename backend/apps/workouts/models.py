import uuid
from django.db import models


class Treino(models.Model):
    MODALIDADE_CHOICES = [
        ('corredor', 'Corredor'),
        ('futebol', 'Jogador de Futebol'),
        ('musculacao', 'Musculação / Hipertrofia'),
        ('ciclista', 'Ciclista'),
        ('natacao', 'Nadador'),
        ('crossTraining', 'Cross Training'),
    ]
    NIVEL_CHOICES = [
        ('Iniciante', 'Iniciante'),
        ('Intermediário', 'Intermediário'),
        ('Avançado', 'Avançado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_by = models.ForeignKey(
        'accounts.ProfessionalProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='treinos',
    )
    titulo = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    modalidade = models.CharField(choices=MODALIDADE_CHOICES, max_length=30)
    nivel = models.CharField(choices=NIVEL_CHOICES, max_length=50, default='Iniciante')
    duracao_estimada_min = models.IntegerField(default=60)
    is_public = models.BooleanField(default=True)
    assigned_to = models.ManyToManyField(
        'accounts.StudentProfile',
        blank=True,
        related_name='treinos_atribuidos',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Treino'
        verbose_name_plural = 'Treinos'
        ordering = ['-created_at']

    def __str__(self):
        return self.titulo


class Exercicio(models.Model):
    treino = models.ForeignKey(Treino, on_delete=models.CASCADE, related_name='exercicios')
    nome = models.CharField(max_length=200)
    grupo_muscular = models.CharField(max_length=100)
    series = models.IntegerField(default=3)
    repeticoes = models.CharField(max_length=50, default='12')
    descanso_seg = models.IntegerField(default=60)
    metodo = models.CharField(max_length=50, blank=True)
    observacoes = models.TextField(blank=True)
    video_url = models.URLField(blank=True)
    ordem = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Exercício'
        verbose_name_plural = 'Exercícios'
        ordering = ['ordem']

    def __str__(self):
        return f'{self.nome} — {self.treino.titulo}'


class WorkoutLog(models.Model):
    student = models.ForeignKey(
        'accounts.StudentProfile',
        on_delete=models.CASCADE,
        related_name='workout_logs',
    )
    treino = models.ForeignKey(Treino, on_delete=models.CASCADE, related_name='logs')
    started_at = models.DateTimeField()
    finished_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    exercises_data = models.JSONField(default=list)

    class Meta:
        verbose_name = 'Registro de Treino'
        verbose_name_plural = 'Registros de Treino'
        ordering = ['-started_at']

    def __str__(self):
        return f'{self.student} — {self.treino.titulo}'

    @property
    def duration_minutes(self):
        if self.finished_at and self.started_at:
            delta = self.finished_at - self.started_at
            return int(delta.total_seconds() / 60)
        return None
