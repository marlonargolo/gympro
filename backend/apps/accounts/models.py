import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


MODALIDADE_CHOICES = [
    ('corredor', 'Corredor'),
    ('futebol', 'Jogador de Futebol'),
    ('musculacao', 'Musculação / Hipertrofia'),
    ('ciclista', 'Ciclista'),
    ('natacao', 'Nadador'),
    ('crossTraining', 'Cross Training'),
]


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError('Email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        extra.setdefault('user_type', 'professional')
        return self.create_user(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = [
        ('student', 'Aluno'),
        ('professional', 'Profissional'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    user_type = models.CharField(choices=USER_TYPE_CHOICES, max_length=20, default='student')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return f'{self.full_name} ({self.email})'

    @property
    def is_student(self):
        return self.user_type == 'student'

    @property
    def is_professional(self):
        return self.user_type == 'professional'


class StudentProfile(models.Model):
    GOAL_CHOICES = [
        ('emagrecimento', 'Emagrecimento'),
        ('manutencao', 'Manutenção'),
        ('hipertrofia', 'Hipertrofia'),
    ]
    NIVEL_CHOICES = [
        ('sedentario', 'Sedentário'),
        ('leve', 'Leve'),
        ('moderado', 'Moderado'),
        ('ativo', 'Ativo'),
        ('muitoAtivo', 'Muito Ativo'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    modalidade = models.CharField(choices=MODALIDADE_CHOICES, max_length=30, default='musculacao')
    birth_date = models.DateField(null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    height_cm = models.IntegerField(null=True, blank=True)
    fitness_goal = models.CharField(choices=GOAL_CHOICES, max_length=20, default='hipertrofia')
    nivel_atividade = models.CharField(choices=NIVEL_CHOICES, max_length=20, default='moderado')
    sexo = models.CharField(choices=[('masculino', 'Masculino'), ('feminino', 'Feminino')], max_length=10, default='masculino')
    professional = models.ForeignKey(
        'accounts.ProfessionalProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
    )
    fcm_token = models.CharField(max_length=500, blank=True)

    class Meta:
        verbose_name = 'Perfil de Aluno'
        verbose_name_plural = 'Perfis de Alunos'

    def __str__(self):
        return f'Aluno: {self.user.full_name}'


class ProfessionalProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='professional_profile')
    cref = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    specialty = models.CharField(max_length=200, blank=True)
    gym_name = models.CharField(max_length=200, blank=True)
    gym_address = models.TextField(blank=True)
    gym_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    gym_lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    instagram_token = models.TextField(blank=True)
    instagram_user_id = models.CharField(max_length=50, blank=True)
    spotify_access_token = models.TextField(blank=True)
    spotify_refresh_token = models.TextField(blank=True)
    spotify_token_expires = models.DateTimeField(null=True, blank=True)
    fcm_token = models.CharField(max_length=500, blank=True)

    class Meta:
        verbose_name = 'Perfil de Profissional'
        verbose_name_plural = 'Perfis de Profissionais'

    def __str__(self):
        return f'Prof: {self.user.full_name}'


class InviteCode(models.Model):
    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='invite_codes')
    code = models.CharField(max_length=20, unique=True)
    used_by = models.OneToOneField(StudentProfile, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Código de Convite'

    def __str__(self):
        return f'{self.code} — {self.professional}'
