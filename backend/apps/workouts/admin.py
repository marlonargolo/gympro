from django.contrib import admin
from .models import Treino, Exercicio, WorkoutLog


class ExercicioInline(admin.TabularInline):
    model = Exercicio
    extra = 1
    fields = ['nome', 'grupo_muscular', 'series', 'repeticoes', 'descanso_seg', 'metodo', 'ordem']


@admin.register(Treino)
class TreinoAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'modalidade', 'nivel', 'duracao_estimada_min', 'is_public', 'created_by', 'created_at']
    list_filter = ['modalidade', 'nivel', 'is_public']
    search_fields = ['titulo', 'descricao']
    inlines = [ExercicioInline]
    filter_horizontal = ['assigned_to']


@admin.register(WorkoutLog)
class WorkoutLogAdmin(admin.ModelAdmin):
    list_display = ['student', 'treino', 'started_at', 'finished_at']
    list_filter = ['treino']
    raw_id_fields = ['student', 'treino']
