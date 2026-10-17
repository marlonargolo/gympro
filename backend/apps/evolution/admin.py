from django.contrib import admin
from .models import RegistroEvolucao


@admin.register(RegistroEvolucao)
class RegistroEvolucaoAdmin(admin.ModelAdmin):
    list_display = ['student', 'data', 'peso_kg', 'percentual_gordura', 'massa_muscular_kg']
    list_filter = ['data']
    search_fields = ['student__user__full_name']
    raw_id_fields = ['student']
    date_hierarchy = 'data'
