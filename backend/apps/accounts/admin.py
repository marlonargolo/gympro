from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, StudentProfile, ProfessionalProfile, InviteCode


class StudentProfileInline(admin.StackedInline):
    model = StudentProfile
    can_delete = False
    verbose_name_plural = 'Perfil de Aluno'


class ProfessionalProfileInline(admin.StackedInline):
    model = ProfessionalProfile
    can_delete = False
    verbose_name_plural = 'Perfil de Profissional'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ['-created_at']
    list_display = ['email', 'full_name', 'user_type', 'is_active', 'is_staff', 'created_at']
    list_filter = ['user_type', 'is_active', 'is_staff']
    search_fields = ['email', 'full_name']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('full_name', 'phone', 'avatar')}),
        ('Tipo', {'fields': ('user_type',)}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas', {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'user_type', 'password1', 'password2'),
        }),
    )

    def get_inlines(self, request, obj=None):
        if obj is None:
            return []
        if obj.user_type == 'student':
            return [StudentProfileInline]
        return [ProfessionalProfileInline]


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'modalidade', 'fitness_goal', 'personal_trainer', 'nutritionist']
    list_filter = ['modalidade', 'fitness_goal']
    search_fields = ['user__full_name', 'user__email']


@admin.register(ProfessionalProfile)
class ProfessionalProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'cref', 'gym_name', 'specialty']
    search_fields = ['user__full_name', 'cref', 'gym_name']


@admin.register(InviteCode)
class InviteCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'professional', 'used_by', 'created_at']
    list_filter = ['professional']
