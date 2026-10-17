from rest_framework import serializers
from .models import PlanoNutricional


class PlanoNutricionalSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.user.full_name', read_only=True)

    class Meta:
        model = PlanoNutricional
        fields = [
            'id', 'titulo', 'objetivo', 'calorias_diarias',
            'proteinas_g', 'carboidratos_g', 'gorduras_g',
            'refeicoes', 'created_by_name', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'created_by_name']
