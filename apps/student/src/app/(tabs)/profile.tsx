// ProfileScreen — Premium dark UI
import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useStore } from '../../context/StoreContext';
import { calcularTMB, calcularGET } from '../../data/calculators';
import type { NivelAtividade, ModalidadeAtleta, Sexo } from '../../data/types';
import { nivelAtividadeLabel, modalidadeLabel } from '../../data/types';
import { getStoredUser, logout, useInviteCode, getMySubscription } from '@gympro/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const sexos: Sexo[] = ['masculino', 'feminino'];
const niveis: NivelAtividade[] = ['sedentario', 'leve', 'moderado', 'ativo', 'muitoAtivo'];
const modalidades: ModalidadeAtleta[] = [
  'corredor', 'futebol', 'musculacao', 'ciclista', 'natacao', 'crossTraining',
];

interface StoredUser {
  full_name?: string;
  email?: string;
  personal_trainer_name?: string;
  nutritionist_name?: string;
  has_active_plan?: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { perfil, setPerfil } = useStore();
  const tmb = Math.round(calcularTMB(perfil));
  const get = Math.round(calcularGET(perfil));

  const [apiUser, setApiUser] = useState<StoredUser | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [submittingCode, setSubmittingCode] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    getStoredUser().then(setApiUser).catch(() => {});
    getMySubscription().then(setSubscription).catch(() => {});
  }, []);

  async function handleLogout() {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          const refresh = await AsyncStorage.getItem('refresh_token');
          await logout(refresh ?? undefined);
          router.replace('/login');
        },
      },
    ]);
  }

  async function handleUseCode() {
    const code = inviteCode.trim().toUpperCase();
    if (!code) return;
    setSubmittingCode(true);
    try {
      await useInviteCode(code);
      Alert.alert('Sucesso!', 'Você foi vinculado ao profissional.');
      setInviteCode('');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Código inválido ou expirado.';
      Alert.alert('Erro', msg);
    } finally {
      setSubmittingCode(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── AVATAR HEADER ─────────────────────────────────── */}
        <View style={s.avatarHeader}>
          <View style={s.avatarCircle}>
            {perfil.nome.trim().length > 0 ? (
              <Text style={s.avatarLetter}>
                {perfil.nome.trim()[0].toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person" size={36} color={Colors.primary} />
            )}
          </View>
          <Text style={s.avatarName}>
            {apiUser?.full_name || (perfil.nome.trim().length > 0 ? perfil.nome : 'Atleta')}
          </Text>
          <Text style={s.avatarSub}>
            {modalidadeLabel[perfil.modalidadePrincipal]}
          </Text>
        </View>

        {/* ── SUBSCRIPTION STATUS ───────────────────────────── */}
        {subscription ? (
          <View style={[s.subCard, subscription.status === 'active' ? s.subCardActive : s.subCardInactive]}>
            <Text style={s.subTitle}>
              {subscription.status === 'active' ? '⭐ Plano Premium Ativo' : '📋 Plano Gratuito'}
            </Text>
            {subscription.end_date && subscription.status === 'active' && (
              <Text style={s.subDesc}>
                Válido até {new Date(subscription.end_date).toLocaleDateString('pt-BR')}
              </Text>
            )}
            {subscription.status !== 'active' && (
              <TouchableOpacity onPress={() => router.push('/plans' as any)}>
                <Text style={s.subUpgrade}>Upgrade para Premium →</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={s.subCardInactive}
            onPress={() => router.push('/plans' as any)}
            activeOpacity={0.85}
          >
            <Text style={s.subTitle}>📋 Ver planos disponíveis</Text>
            <Text style={s.subUpgrade}>Assinar agora →</Text>
          </TouchableOpacity>
        )}

        {/* ── PROFESSIONALS ────────────────────────────────── */}
        {(apiUser?.personal_trainer_name || apiUser?.nutritionist_name) ? (
          <View style={s.profSection}>
            <Text style={s.sectionTitle}>MEUS PROFISSIONAIS</Text>
            <View style={s.sectionCard}>
              {apiUser.personal_trainer_name && (
                <View style={s.profRow}>
                  <Text style={s.profIcon}>💪</Text>
                  <View>
                    <Text style={s.profLabel}>Personal Trainer</Text>
                    <Text style={s.profName}>{apiUser.personal_trainer_name}</Text>
                  </View>
                </View>
              )}
              {apiUser.personal_trainer_name && apiUser.nutritionist_name && (
                <View style={s.divider} />
              )}
              {apiUser.nutritionist_name && (
                <View style={s.profRow}>
                  <Text style={s.profIcon}>🥗</Text>
                  <View>
                    <Text style={s.profLabel}>Nutricionista</Text>
                    <Text style={s.profName}>{apiUser.nutritionist_name}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={s.profSection}>
            <Text style={s.sectionTitle}>MEUS PROFISSIONAIS</Text>
            <View style={s.sectionCard}>
              <View style={s.inviteRow}>
                <TextInput
                  style={s.inviteInput}
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  placeholder="Código de convite"
                  placeholderTextColor={Colors.textTertiary}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[s.inviteBtn, submittingCode && s.inviteBtnDisabled]}
                  onPress={handleUseCode}
                  disabled={submittingCode}
                  activeOpacity={0.85}
                >
                  {submittingCode ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={s.inviteBtnText}>Conectar</Text>
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={s.findProfBtn}
                onPress={() => router.push('/find-professionals' as any)}
              >
                <Text style={s.findProfText}>Ver meus profissionais →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── STATS ROW ─────────────────────────────────────── */}
        <View style={s.statsRow}>
          <StatCard value={perfil.pesoKg.toFixed(1)} label="KG" />
          <StatCard value={String(perfil.alturaCm)} label="CM" />
          <StatCard value={String(perfil.idade)} label="ANOS" />
        </View>

        {/* ── DADOS PESSOAIS ────────────────────────────────── */}
        <SectionCard title="DADOS PESSOAIS">
          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Nome</Text>
            <TextInput
              style={s.input}
              value={perfil.nome}
              onChangeText={v => setPerfil({ ...perfil, nome: v })}
              placeholder="Seu nome"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={s.divider} />

          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Sexo</Text>
            <View style={s.segmented}>
              {sexos.map(sx => (
                <TouchableOpacity
                  key={sx}
                  style={[s.segPill, perfil.sexo === sx && s.segPillAtivo]}
                  onPress={() => setPerfil({ ...perfil, sexo: sx })}
                  activeOpacity={0.8}
                >
                  <Text style={[s.segPillText, perfil.sexo === sx && s.segPillTextAtivo]}>
                    {sx === 'masculino' ? 'Masculino' : 'Feminino'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Idade</Text>
            <View style={s.stepperRow}>
              <TouchableOpacity
                style={s.stepBtn}
                onPress={() => setPerfil({ ...perfil, idade: Math.max(10, perfil.idade - 1) })}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={s.stepValue}>{perfil.idade}</Text>
              <TouchableOpacity
                style={s.stepBtn}
                onPress={() => setPerfil({ ...perfil, idade: Math.min(90, perfil.idade + 1) })}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </SectionCard>

        {/* ── MEDIDAS ───────────────────────────────────────── */}
        <SectionCard title="MEDIDAS">
          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Peso (kg)</Text>
            <TextInput
              style={s.input}
              value={String(perfil.pesoKg)}
              onChangeText={v => setPerfil({ ...perfil, pesoKg: parseFloat(v) || perfil.pesoKg })}
              keyboardType="decimal-pad"
              placeholder="kg"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
          <View style={s.divider} />
          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Altura (cm)</Text>
            <TextInput
              style={s.input}
              value={String(perfil.alturaCm)}
              onChangeText={v => setPerfil({ ...perfil, alturaCm: parseFloat(v) || perfil.alturaCm })}
              keyboardType="decimal-pad"
              placeholder="cm"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
        </SectionCard>

        {/* ── ATIVIDADE ─────────────────────────────────────── */}
        <SectionCard title="ATIVIDADE">
          <Text style={s.subLabel}>Nível de atividade</Text>
          {niveis.map(n => (
            <TouchableOpacity
              key={n}
              style={[s.radioRow, perfil.nivelAtividade === n && s.radioRowAtivo]}
              onPress={() => setPerfil({ ...perfil, nivelAtividade: n })}
              activeOpacity={0.75}
            >
              <Text style={[s.radioText, perfil.nivelAtividade === n && s.radioTextAtivo]}>
                {nivelAtividadeLabel[n]}
              </Text>
              {perfil.nivelAtividade === n && (
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}

          <View style={[s.divider, { marginTop: 4 }]} />

          <Text style={[s.subLabel, { marginTop: 4 }]}>Modalidade principal</Text>
          {modalidades.map(m => (
            <TouchableOpacity
              key={m}
              style={[s.radioRow, perfil.modalidadePrincipal === m && s.radioRowAtivo]}
              onPress={() => setPerfil({ ...perfil, modalidadePrincipal: m })}
              activeOpacity={0.75}
            >
              <Text style={[s.radioText, perfil.modalidadePrincipal === m && s.radioTextAtivo]}>
                {modalidadeLabel[m]}
              </Text>
              {perfil.modalidadePrincipal === m && (
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </SectionCard>

        {/* ── RESULTADO ─────────────────────────────────────── */}
        <LinearGradient
          colors={['#1E1620', Colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.resultCard}
        >
          <View style={s.resultTopStrip} />
          <View style={s.resultBody}>
            <Text style={s.sectionTitle}>RESULTADO</Text>
            <View style={s.resultRow}>
              <Text style={s.resultLabel}>TMB (repouso)</Text>
              <Text style={s.resultValueNormal}>{tmb} kcal/dia</Text>
            </View>
            <View style={[s.divider, { marginVertical: 10 }]} />
            <View style={s.resultRow}>
              <Text style={s.resultLabel}>Gasto total</Text>
              <Text style={s.resultValuePrimary}>{get} kcal/dia</Text>
            </View>
            <Text style={s.resultNote}>Calculado pela fórmula Mifflin-St Jeor</Text>
          </View>
        </LinearGradient>

        {/* ── LOGOUT ───────────────────────────────────────── */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={s.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <LinearGradient
      colors={['#1E1C2E', Colors.surfaceElevated]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={sc.card}
    >
      <Text style={sc.value}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
    </LinearGradient>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionCard}>{children}</View>
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  value: { fontSize: 24, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  label: {
    fontSize: 11, color: Colors.textTertiary, textTransform: 'uppercase',
    letterSpacing: 0.8, marginTop: 3,
  },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 20, paddingBottom: 48 },
  avatarHeader: { alignItems: 'center', paddingVertical: 8, gap: 6 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary + '22',
    borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowRadius: 16, shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 }, elevation: 8,
  },
  avatarLetter: { fontSize: 32, fontWeight: '800', color: Colors.primary },
  avatarName: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 4 },
  avatarSub: { fontSize: 13, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: 10 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: Colors.surface, borderRadius: 18, borderWidth: 1,
    borderColor: Colors.glassBorder, paddingHorizontal: 16, paddingVertical: 8, gap: 4,
  },
  fieldGroup: { paddingVertical: 10, gap: 8 },
  fieldLabel: {
    fontSize: 12, fontWeight: '600', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  input: {
    backgroundColor: Colors.surfaceElevated, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11, color: Colors.text,
    fontSize: 15, fontWeight: '600', borderWidth: 1, borderColor: Colors.glassBorder,
  },
  divider: { height: 1, backgroundColor: Colors.glassBorder },
  segmented: { flexDirection: 'row', gap: 8 },
  segPill: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  segPillAtivo: {
    backgroundColor: Colors.primary, borderColor: Colors.primary,
    shadowColor: Colors.primary, shadowRadius: 10, shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 0 }, elevation: 6,
  },
  segPillText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  segPillTextAtivo: { color: '#FFFFFF', fontWeight: '700' },
  stepperRow: {
    flexDirection: 'row', alignItems: 'center', gap: 0, alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceElevated, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.glassBorder, overflow: 'hidden',
  },
  stepBtn: { paddingHorizontal: 18, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  stepValue: {
    fontSize: 20, fontWeight: '800', color: Colors.text, minWidth: 48,
    textAlign: 'center', paddingVertical: 10,
    borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.glassBorder,
  },
  subLabel: {
    fontSize: 12, fontWeight: '600', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8, paddingTop: 6, paddingBottom: 4,
  },
  radioRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 11, paddingHorizontal: 12, borderRadius: 10,
    borderLeftWidth: 3, borderLeftColor: 'transparent', marginVertical: 2,
  },
  radioRowAtivo: { backgroundColor: Colors.primary + '14', borderLeftColor: Colors.primary },
  radioText: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  radioTextAtivo: { color: Colors.text, fontWeight: '600' },
  resultCard: {
    borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: Colors.glassBorder,
    backgroundColor: Colors.surface, shadowColor: Colors.primary,
    shadowRadius: 16, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  resultTopStrip: { height: 2, backgroundColor: Colors.primary },
  resultBody: { padding: 18, gap: 4 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  resultValueNormal: { fontSize: 18, fontWeight: '700', color: Colors.text },
  resultValuePrimary: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  resultNote: { fontSize: 11, color: Colors.textTertiary, marginTop: 10 },
  // Subscription card
  subCard: {
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.glassBorder,
    backgroundColor: Colors.surface,
  },
  subCardActive: { borderColor: Colors.primary + '66', backgroundColor: Colors.primary + '11' },
  subCardInactive: { borderColor: Colors.glassBorder },
  subTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  subDesc: { fontSize: 13, color: Colors.textSecondary },
  subUpgrade: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 6 },
  // Professionals section
  profSection: {},
  profRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  profIcon: { fontSize: 24 },
  profLabel: { fontSize: 11, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  profName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  // Invite code input
  inviteRow: { flexDirection: 'row', gap: 10, paddingVertical: 10 },
  inviteInput: {
    flex: 1, backgroundColor: Colors.surfaceElevated, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, color: Colors.text,
    fontSize: 15, fontWeight: '600', borderWidth: 1, borderColor: Colors.glassBorder,
    letterSpacing: 2,
  },
  inviteBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center',
  },
  inviteBtnDisabled: { opacity: 0.6 },
  inviteBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  findProfBtn: { paddingVertical: 10, paddingHorizontal: 4 },
  findProfText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  // Logout
  logoutBtn: {
    backgroundColor: Colors.surface, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,80,80,0.3)',
  },
  logoutText: { color: '#FF5050', fontWeight: '700', fontSize: 15 },
});
