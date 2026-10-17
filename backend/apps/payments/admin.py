from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'plan', 'amount', 'status', 'payment_method', 'created_at', 'paid_at']
    list_filter = ['status', 'payment_method', 'plan']
    search_fields = ['user__email', 'user__full_name', 'mp_payment_id']
    readonly_fields = ['id', 'created_at', 'paid_at', 'mp_payment_id', 'mp_preference_id', 'metadata']
    raw_id_fields = ['user', 'plan']
    date_hierarchy = 'created_at'
