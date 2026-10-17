from rest_framework import serializers
from .models import Plan, Subscription


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = [
            'id', 'name', 'slug', 'description', 'plan_type',
            'price', 'duration_days', 'features', 'max_students',
            'is_active', 'highlight', 'order',
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    plan_id = serializers.PrimaryKeyRelatedField(
        queryset=Plan.objects.filter(is_active=True),
        source='plan',
        write_only=True,
    )
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'plan_id', 'status', 'start_date',
            'end_date', 'is_active', 'created_at', 'cancelled_at',
        ]
        read_only_fields = ['id', 'status', 'start_date', 'end_date', 'created_at', 'cancelled_at']

    def get_is_active(self, obj):
        return obj.is_active
