from django.db import models


class RegistroEvolucao(models.Model):
    student = models.ForeignKey(
        'accounts.StudentProfile',
        on_delete=models.CASCADE,
        related_name='evolucao',
    )
    data = models.DateField()
    peso_kg = models.DecimalField(max_digits=5, decimal_places=2)
    percentual_gordura = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    massa_muscular_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    foto = models.ImageField(upload_to='evolucao/', null=True, blank=True)
    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Registro de Evolução'
        verbose_name_plural = 'Registros de Evolução'
        ordering = ['-data']

    def __str__(self):
        return f'{self.student} — {self.data} ({self.peso_kg}kg)'
