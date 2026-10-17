import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPaymentStatus } from '@gympro/api';
import { Colors } from '../constants/colors';

export default function PaymentStatusScreen() {
  const { payment_id } = useLocalSearchParams<{ payment_id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!payment_id) {
      setStatus('pending');
      setLoading(false);
      return;
    }
    getPaymentStatus(payment_id)
      .then((data) => setStatus(data.status ?? 'pending'))
      .catch(() => setStatus('pending'))
      .finally(() => setLoading(false));
  }, [payment_id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Verificando pagamento…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const approved = status === 'approved';
  const pending = status === 'pending' || status === 'in_process';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.icon}>{approved ? '✅' : pending ? '⏳' : '❌'}</Text>
        <Text style={styles.title}>
          {approved ? 'Pagamento aprovado!' : pending ? 'Aguardando confirmação' : 'Pagamento não concluído'}
        </Text>
        <Text style={styles.subtitle}>
          {approved
            ? 'Seu plano foi ativado. Aproveite todos os recursos premium!'
            : pending
            ? 'Seu pagamento está sendo processado. Atualize em alguns instantes.'
            : 'O pagamento não foi confirmado. Tente novamente.'}
        </Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {approved ? 'Começar agora' : 'Voltar ao início'}
          </Text>
        </TouchableOpacity>

        {!approved && (
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => router.replace('/plans')}
            activeOpacity={0.85}
          >
            <Text style={styles.retryText}>Ver planos</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { fontSize: 64, marginBottom: 24 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  loadingText: { color: Colors.textSecondary, marginTop: 16, fontSize: 15 },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  retryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: { color: Colors.primary, fontWeight: '600', fontSize: 15 },
});
