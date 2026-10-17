from rest_framework import serializers
from .models import RegistroEvolucao


class RegistroEvolucaoSerializer(serializers.ModelSerializer):
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model = RegistroEvolucao
        fields = [
            'id', 'data', 'peso_kg', 'percentual_gordura',
            'massa_muscular_kg', 'foto_url', 'observacoes', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'foto_url']

    def get_foto_url(self, obj):
        if obj.foto:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto.url)
        return None
