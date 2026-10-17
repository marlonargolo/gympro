from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, StudentProfile, ProfessionalProfile, InviteCode


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        exclude = ['user', 'fcm_token', 'spotify_access_token']
        read_only_fields = ['professional']


class ProfessionalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalProfile
        exclude = ['user', 'instagram_token', 'spotify_access_token', 'spotify_refresh_token', 'fcm_token']


class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)
    professional_profile = ProfessionalProfileSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'phone', 'avatar_url',
            'user_type', 'created_at', 'student_profile', 'professional_profile',
        ]
        read_only_fields = ['id', 'created_at', 'user_type']

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
        return None


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    user_type = serializers.ChoiceField(choices=['student', 'professional'])
    # Student fields
    modalidade = serializers.CharField(required=False, default='musculacao')
    sexo = serializers.CharField(required=False, default='masculino')
    fitness_goal = serializers.CharField(required=False, default='hipertrofia')
    # Pro fields
    cref = serializers.CharField(required=False, allow_blank=True)
    gym_name = serializers.CharField(required=False, allow_blank=True)
    specialty = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este e-mail já está cadastrado.')
        return value

    def create(self, validated_data):
        user_type = validated_data['user_type']
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            phone=validated_data.get('phone', ''),
            user_type=user_type,
        )
        if user_type == 'student':
            StudentProfile.objects.create(
                user=user,
                modalidade=validated_data.get('modalidade', 'musculacao'),
                sexo=validated_data.get('sexo', 'masculino'),
                fitness_goal=validated_data.get('fitness_goal', 'hipertrofia'),
            )
        else:
            ProfessionalProfile.objects.create(
                user=user,
                cref=validated_data.get('cref', ''),
                gym_name=validated_data.get('gym_name', ''),
                specialty=validated_data.get('specialty', ''),
            )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('E-mail ou senha inválidos.')
        if not user.is_active:
            raise serializers.ValidationError('Conta desativada.')
        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Senha atual incorreta.')
        return value


class UpdateProfileSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(required=False)
    professional_profile = ProfessionalProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['full_name', 'phone', 'avatar', 'student_profile', 'professional_profile']

    def update(self, instance, validated_data):
        student_data = validated_data.pop('student_profile', None)
        pro_data = validated_data.pop('professional_profile', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if student_data and hasattr(instance, 'student_profile'):
            for attr, value in student_data.items():
                setattr(instance.student_profile, attr, value)
            instance.student_profile.save()
        if pro_data and hasattr(instance, 'professional_profile'):
            for attr, value in pro_data.items():
                setattr(instance.professional_profile, attr, value)
            instance.professional_profile.save()
        return instance


class InviteCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InviteCode
        fields = ['code', 'created_at', 'expires_at', 'used_by']
        read_only_fields = ['code', 'created_at', 'used_by']
