from rest_framework import serializers
from .models import ConnectionRequest


class ConnectionRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.SerializerMethodField()
    target_name = serializers.SerializerMethodField()

    class Meta:
        model = ConnectionRequest
        fields = [
            'id', 'connection_type', 'status', 'message',
            'requester_student', 'requester_professional',
            'target_student', 'target_professional',
            'requester_name', 'target_name',
            'created_at', 'responded_at',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'responded_at', 'requester_name', 'target_name']

    def get_requester_name(self, obj):
        if obj.requester_student:
            return obj.requester_student.user.full_name
        if obj.requester_professional:
            return obj.requester_professional.user.full_name
        return None

    def get_target_name(self, obj):
        if obj.target_student:
            return obj.target_student.user.full_name
        if obj.target_professional:
            return obj.target_professional.user.full_name
        return None
