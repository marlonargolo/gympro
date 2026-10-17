from django.contrib import admin
from .models import ConnectionRequest


@admin.register(ConnectionRequest)
class ConnectionRequestAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'connection_type', 'status', 'created_at', 'responded_at']
    list_filter = ['status', 'connection_type']
    search_fields = [
        'requester_student__user__full_name',
        'requester_professional__user__full_name',
        'target_student__user__full_name',
        'target_professional__user__full_name',
    ]
    readonly_fields = ['created_at', 'responded_at']
    actions = ['accept_selected']

    def accept_selected(self, request, queryset):
        accepted = 0
        for req in queryset.filter(status='pending'):
            try:
                req.accept()
                accepted += 1
            except Exception:
                pass
        self.message_user(request, f'{accepted} vínculos criados.')
    accept_selected.short_description = 'Aceitar vínculos selecionados'
