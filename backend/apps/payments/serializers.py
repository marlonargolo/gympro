from rest_framework import serializers
from .models import Payment
from apps.plans.serializers import PlanSerializer


class PaymentSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'plan', 'amount', 'status', 'payment_method',
            'created_at', 'paid_at', 'mp_payment_id',
        ]
        read_only_fields = fields


class CreatePreferenceSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()
