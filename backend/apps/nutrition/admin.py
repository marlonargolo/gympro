from django.contrib import admin
from .models import PlanoNutricional


@admin.register(PlanoNutricional)
class PlanoNutricionalAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'objetivo', 'calorias_diarias', 'created_by', 'created_at']
    list_filter = ['objetivo']
    search_fields = ['titulo', 'created_by__user__full_name']
    filter_horizontal = ['assigned_to']
    raw_id_fields = ['created_by']
