import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getPlans, createPaymentPreference } from '@gympro/api';
import { Colors } from '../constants/colors';

interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string;
  plan_type: string;
  price: string;
  duration_days: number;
  features: string[];
  highlight: boolean;
}

export default function PlansScreen() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    getPlans('student')
      .then(setPlans)
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar os planos.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSelectPlan(plan: Plan) {
    setPurchasing(plan.id);
    try {
      const pref = await createPaymentPreference(plan.id);
      const url = pref.sandbox_init_point || pref.init_point;
      if (url) {
        await Linking.openURL(url);
        router.replace(`/payment-status?payment_id=${pref.payment_id}`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Não foi possível iniciar o pagamento.';
      Alert.alert('Erro', msg);
    } finally {
      setPurchasing(null);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Planos GymPro</Text>
        <Text style={styles.pageSubtitle}>
          Desbloqueie recursos premium para turbinar seus treinos
        </Text>

        {plans.map((plan) => (
          <View
            key={plan.id}
            style={[styles.planCard, plan.highlight && styles.planCardHighlight]}
          >
            {plan.highlight && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>RECOMENDADO</Text>
              </View>
            )}

            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceCurrency}>R$</Text>
              <Text style={styles.priceValue}>
                {parseFloat(plan.price).toFixed(2).replace('.', ',')}
              </Text>
              <Text style={styles.pricePeriod}>/{plan.duration_days} dias</Text>
            </View>

            {plan.features.length > 0 && (
              <View style={styles.featuresList}>
                {plan.features.map((feat, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Text style={styles.featureCheck}>✓</Text>
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.selectBtn,
                plan.highlight && styles.selectBtnHighlight,
                purchasing === plan.id && styles.selectBtnDisabled,
              ]}
              onPress={() => handleSelectPlan(plan)}
              disabled={purchasing !== null}
              activeOpacity={0.85}
            >
              {purchasing === plan.id ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.selectBtnText, plan.highlight && { color: '#fff' }]}>
                  Assinar agora
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ))}

        {plans.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum plano disponível no momento.</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  planCardHighlight: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  popularText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 4,
  },
  priceCurrency: { fontSize: 16, color: Colors.text, fontWeight: '600', paddingBottom: 4 },
  priceValue: { fontSize: 36, fontWeight: '800', color: Colors.text },
  pricePeriod: { fontSize: 14, color: Colors.textSecondary, paddingBottom: 6 },
  featuresList: { marginBottom: 20, gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureCheck: { color: Colors.success, fontWeight: '700', fontSize: 14 },
  featureText: { color: Colors.text, fontSize: 14 },
  selectBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  selectBtnHighlight: { backgroundColor: Colors.primary },
  selectBtnDisabled: { opacity: 0.6 },
  selectBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: Colors.textTertiary, fontSize: 15 },
});
