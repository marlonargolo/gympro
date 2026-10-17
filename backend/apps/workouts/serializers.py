from rest_framework import serializers
from .models import Treino, Exercicio, WorkoutLog


class ExercicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercicio
        exclude = ['treino']


class TreinoSerializer(serializers.ModelSerializer):
    exercicios = ExercicioSerializer(many=True, read_only=True)
    exercise_count = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Treino
        fields = [
            'id', 'titulo', 'descricao', 'modalidade', 'nivel',
            'duracao_estimada_min', 'is_public', 'exercicios',
            'exercise_count', 'created_by_name', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'created_by_name', 'exercise_count']

    def get_exercise_count(self, obj):
        return obj.exercicios.count()

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.user.full_name
        return None


class TreinoWriteSerializer(serializers.ModelSerializer):
    exercicios = ExercicioSerializer(many=True, required=False)

    class Meta:
        model = Treino
        fields = [
            'titulo', 'descricao', 'modalidade', 'nivel',
            'duracao_estimada_min', 'is_public', 'exercicios',
        ]

    def create(self, validated_data):
        exercicios_data = validated_data.pop('exercicios', [])
        treino = Treino.objects.create(**validated_data)
        for i, ex_data in enumerate(exercicios_data):
            ex_data['ordem'] = ex_data.get('ordem', i)
            Exercicio.objects.create(treino=treino, **ex_data)
        return treino

    def update(self, instance, validated_data):
        exercicios_data = validated_data.pop('exercicios', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if exercicios_data is not None:
            instance.exercicios.all().delete()
            for i, ex_data in enumerate(exercicios_data):
                ex_data['ordem'] = ex_data.get('ordem', i)
                Exercicio.objects.create(treino=instance, **ex_data)
        return instance


class WorkoutLogSerializer(serializers.ModelSerializer):
    treino_titulo = serializers.CharField(source='treino.titulo', read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)

    class Meta:
        model = WorkoutLog
        fields = [
            'id', 'treino', 'treino_titulo', 'started_at', 'finished_at',
            'notes', 'exercises_data', 'duration_minutes',
        ]
        read_only_fields = ['id', 'treino_titulo', 'duration_minutes']
