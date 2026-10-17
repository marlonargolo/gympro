from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class FeedPost(models.Model):
    TIPO_CHOICES = [
        ('treino', 'Treino'),
        ('evolucao', 'Evolução'),
        ('conquista', 'Conquista'),
    ]

    POST_ROLE_CHOICES = [
        ('personal_trainer', 'Personal Trainer'),
        ('nutritionist', 'Nutricionista'),
        ('student', 'Aluno'),
    ]

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feed_posts')
    caption = models.TextField()
    media_url = models.URLField(blank=True)
    tipo = models.CharField(choices=TIPO_CHOICES, max_length=20)
    post_role = models.CharField(choices=POST_ROLE_CHOICES, max_length=20, default='student')
    likes_count = models.IntegerField(default=0)
    liked_by = models.ManyToManyField(User, blank=True, related_name='liked_posts')
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Post do Feed'
        verbose_name_plural = 'Posts do Feed'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.author.full_name} — {self.tipo}'


class InstagramPost(models.Model):
    POST_TYPE_CHOICES = [
        ('feed', 'Feed'),
        ('story', 'Story'),
        ('reel', 'Reel'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('published', 'Publicado'),
        ('failed', 'Falhou'),
    ]

    professional = models.ForeignKey(
        'accounts.ProfessionalProfile',
        on_delete=models.CASCADE,
        related_name='instagram_posts',
    )
    feed_post = models.ForeignKey(FeedPost, on_delete=models.SET_NULL, null=True, blank=True)
    post_type = models.CharField(choices=POST_TYPE_CHOICES, max_length=10, default='feed')
    caption = models.TextField()
    media_url = models.URLField()
    instagram_media_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(choices=STATUS_CHOICES, max_length=20, default='pending')
    error_message = models.TextField(blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Post no Instagram'
        verbose_name_plural = 'Posts no Instagram'
        ordering = ['-created_at']
