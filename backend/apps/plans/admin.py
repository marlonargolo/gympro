from django.contrib import admin
from .models import Plan, Subscription


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan_type', 'price', 'duration_days', 'is_active', 'highlight', 'order']
    list_filter = ['plan_type', 'is_active', 'highlight']
    list_editable = ['is_active', 'order', 'highlight', 'price']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    fieldsets = (
        (None, {'fields': ('name', 'slug', 'description', 'plan_type')}),
        ('Preço e Duração', {'fields': ('price', 'duration_days')}),
        ('Recursos', {'fields': ('features', 'max_students')}),
        ('Exibição', {'fields': ('is_active', 'highlight', 'order')}),
    )


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'status', 'start_date', 'end_date', 'created_at']
    list_filter = ['status', 'plan']
    search_fields = ['user__email', 'user__full_name']
    readonly_fields = ['created_at', 'cancelled_at']
    raw_id_fields = ['user', 'plan', 'payment']
