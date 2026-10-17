import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useInviteCode, getConnections } from '@gympro/api';
import { Colors } from '../constants/colors';

interface Connection {
  id: number;
  connection_type: 'personal_trainer' | 'nutritionist';
  status: string;
  professional?: {
    full_name: string;
    cref?: string;
    crn?: string;
    gym_name?: string;
  };
}

const TYPE_LABEL: Record<string, string> = {
  personal_trainer: 'Personal Trainer',
  nutritionist: 'Nutricionista',
};

export default function FindProfessionalsScreen() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getConnections()
      .then((data) => setConnections(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleUseCode() {
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('Atenção', 'Digite o código de convite.');
      return;
    }
    setSubmitting(true);
    try {
      await useInviteCode(code);
      Alert.alert('Sucesso!', 'Você foi vinculado ao profissional com sucesso.');
      setInviteCode('');
      const updated = await getConnections();
      setConnections(Array.isArray(updated) ? updated : []);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Código inválido ou expirado.';
      Alert.alert('Erro', msg);
    } finally {
      setSubmitting(false);
    }
  }

  const active = connections.filter((c) => c.status === 'accepted');
  const pending = connections.filter((c) => c.status === 'pending');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Meus Profissionais</Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeCardTitle}>Conectar com código de convite</Text>
          <Text style={styles.codeCardSubtitle}>
            Peça ao seu personal trainer ou nutricionista o código de convite
          </Text>
          <TextInput
            style={styles.codeInput}
            value={inviteCode}
            onChangeText={setInviteCode}
            placeholder="Ex: ABC123"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.connectBtn, submitting && styles.connectBtnDisabled]}
            onPress={handleUseCode}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.connectBtnText}>Conectar</Text>
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Profissionais Vinculados</Text>
                {active.map((conn) => (
                  <View key={conn.id} style={styles.profCard}>
                    <View style={styles.profHeader}>
                      <View style={styles.profAvatar}>
                        <Text style={styles.profAvatarText}>
                          {(conn.professional?.full_name ?? 'P')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.profInfo}>
                        <Text style={styles.profName}>
                          {conn.professional?.full_name ?? '—'}
                        </Text>
                        <View style={[
                          styles.typeBadge,
                          conn.connection_type === 'nutritionist' && { backgroundColor: Colors.success + '22' },
                        ]}>
                          <Text style={[
                            styles.typeText,
                            conn.connection_type === 'nutritionist' && { color: Colors.success },
                          ]}>
                            {conn.connection_type === 'nutritionist' ? '🥗' : '💪'} {TYPE_LABEL[conn.connection_type]}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeText}>Ativo</Text>
                      </View>
                    </View>
                    {(conn.professional?.cref || conn.professional?.crn || conn.professional?.gym_name) && (
                      <View style={styles.profMeta}>
                        {conn.professional.cref && (
                          <Text style={styles.profMetaText}>CREF {conn.professional.cref}</Text>
                        )}
                        {conn.professional.crn && (
                          <Text style={styles.profMetaText}>CRN {conn.professional.crn}</Text>
                        )}
                        {conn.professional.gym_name && (
                          <Text style={styles.profMetaText}>🏋️ {conn.professional.gym_name}</Text>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}

            {pending.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Pendentes</Text>
                {pending.map((conn) => (
                  <View key={conn.id} style={[styles.profCard, styles.profCardPending]}>
                    <View style={styles.profHeader}>
                      <View style={[styles.profAvatar, { backgroundColor: Colors.warning + '33' }]}>
                        <Text style={[styles.profAvatarText, { color: Colors.warning }]}>⏳</Text>
                      </View>
                      <View style={styles.profInfo}>
                        <Text style={styles.profName}>
                          {conn.professional?.full_name ?? 'Aguardando confirmação'}
                        </Text>
                        <Text style={styles.profSubtitle}>{TYPE_LABEL[conn.connection_type]}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {active.length === 0 && pending.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>Nenhum profissional vinculado</Text>
                <Text style={styles.emptyText}>
                  Use o código de convite acima para se conectar com seu personal trainer ou nutricionista.
                </Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 16 },
  center: { alignItems: 'center', paddingVertical: 32 },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 20,
  },
  codeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  codeCardTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  codeCardSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16, lineHeight: 18 },
  codeInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: 12,
    letterSpacing: 3,
    textAlign: 'center',
  },
  connectBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  connectBtnDisabled: { opacity: 0.6 },
  connectBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  profCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  profCardPending: { borderColor: Colors.warning + '44' },
  profHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profAvatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  profInfo: { flex: 1 },
  profName: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  profSubtitle: { color: Colors.textSecondary, fontSize: 13 },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '22',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeText: { color: Colors.primary, fontSize: 11, fontWeight: '600' },
  activeBadge: {
    backgroundColor: Colors.success + '22',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeText: { color: Colors.success, fontSize: 11, fontWeight: '600' },
  profMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  profMetaText: { color: Colors.textTertiary, fontSize: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
