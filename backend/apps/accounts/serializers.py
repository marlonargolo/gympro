from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, StudentProfile, ProfessionalProfile, InviteCode


class ProfessionalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalProfile
        exclude = ['user', 'instagram_token', 'spotify_access_token', 'spotify_refresh_token', 'fcm_token']
        read_only_fields = ['trainer_student_count', 'nutritionist_student_count']


class StudentProfileSerializer(serializers.ModelSerializer):
    personal_trainer_name = serializers.SerializerMethodField()
    nutritionist_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        exclude = ['user', 'fcm_token']
        read_only_fields = ['personal_trainer', 'nutritionist']

    def get_personal_trainer_name(self, obj):
        if obj.personal_trainer_id:
            return obj.personal_trainer.user.full_name
        return None

    def get_nutritionist_name(self, obj):
        if obj.nutritionist_id:
            return obj.nutritionist.user.full_name
        return None


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
    password = serializers.CharField(write_only=True, min_length=6)
    full_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    user_type = serializers.ChoiceField(choices=['student', 'professional'])
    # Student fields
    modalidade = serializers.CharField(required=False, default='musculacao')
    sexo = serializers.CharField(required=False, default='masculino')
    fitness_goal = serializers.CharField(required=False, default='hipertrofia')
    # Pro fields
    is_personal_trainer = serializers.BooleanField(required=False, default=False)
    is_nutritionist = serializers.BooleanField(required=False, default=False)
    cref = serializers.CharField(required=False, allow_blank=True, default='')
    crn = serializers.CharField(required=False, allow_blank=True, default='')
    gym_name = serializers.CharField(required=False, allow_blank=True, default='')
    specialty = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este e-mail já está cadastrado.')
        return value

    def validate(self, data):
        if data.get('user_type') == 'professional':
            if not data.get('is_personal_trainer') and not data.get('is_nutritionist'):
                raise serializers.ValidationError(
                    'Selecione ao menos uma especialidade: Personal Trainer ou Nutricionista.'
                )
        return data

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
                is_personal_trainer=validated_data.get('is_personal_trainer', False),
                is_nutritionist=validated_data.get('is_nutritionist', False),
                cref=validated_data.get('cref', ''),
                crn=validated_data.get('crn', ''),
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
    new_password = serializers.CharField(write_only=True, min_length=6)

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
        fields = ['code', 'connection_type', 'created_at', 'expires_at', 'used_by']
        read_only_fields = ['code', 'created_at', 'used_by']
