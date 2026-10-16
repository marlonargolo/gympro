// ProfileScreen — Premium dark UI
import React from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useStore } from '../../context/StoreContext';
import { calcularTMB, calcularGET } from '../../data/calculators';
import type { NivelAtividade, ModalidadeAtleta, Sexo } from '../../data/types';
import { nivelAtividadeLabel, modalidadeLabel } from '../../data/types';

const sexos: Sexo[] = ['masculino', 'feminino'];
const niveis: NivelAtividade[] = ['sedentario', 'leve', 'moderado', 'ativo', 'muitoAtivo'];
const modalidades: ModalidadeAtleta[] = [
  'corredor', 'futebol', 'musculacao', 'ciclista', 'natacao', 'crossTraining',
];

export default function ProfileScreen() {
  const { perfil, setPerfil } = useStore();
  const tmb = Math.round(calcularTMB(perfil));
  const get = Math.round(calcularGET(perfil));

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
            {perfil.nome.trim().length > 0 ? perfil.nome : 'Atleta'}
          </Text>
          <Text style={s.avatarSub}>
            {modalidadeLabel[perfil.modalidadePrincipal]}
          </Text>
        </View>

        {/* ── STATS ROW ─────────────────────────────────────── */}
        <View style={s.statsRow}>
          <StatCard value={perfil.pesoKg.toFixed(1)} label="KG" />
          <StatCard value={String(perfil.alturaCm)} label="CM" />
          <StatCard value={String(perfil.idade)} label="ANOS" />
        </View>

        {/* ── DADOS PESSOAIS ────────────────────────────────── */}
        <SectionCard title="DADOS PESSOAIS">
          {/* Nome */}
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

          {/* Sexo segmented */}
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

          {/* Idade stepper */}
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
              <Text
                style={[
                  s.radioText,
                  perfil.nivelAtividade === n && s.radioTextAtivo,
                ]}
              >
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
              <Text
                style={[
                  s.radioText,
                  perfil.modalidadePrincipal === m && s.radioTextAtivo,
                ]}
              >
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

            <Text style={s.resultNote}>
              Calculado pela fórmula Mifflin-St Jeor
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
      <View style={s.sectionCard}>
        {children}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 3,
  },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 20, paddingBottom: 48 },

  // Avatar header
  avatarHeader: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '22',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowRadius: 16,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 4,
  },
  avatarSub: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  // Section title
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  // Section card
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },

  // Field group
  fieldGroup: {
    paddingVertical: 10,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Input
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.glassBorder,
  },

  // Segmented control
  segmented: {
    flexDirection: 'row',
    gap: 8,
  },
  segPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  segPillAtivo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowRadius: 10,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  segPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segPillTextAtivo: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  stepBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    minWidth: 48,
    textAlign: 'center',
    paddingVertical: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.glassBorder,
  },

  // Radio list
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingTop: 6,
    paddingBottom: 4,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    marginVertical: 2,
  },
  radioRowAtivo: {
    backgroundColor: Colors.primary + '14',
    borderLeftColor: Colors.primary,
  },
  radioText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  radioTextAtivo: {
    color: Colors.text,
    fontWeight: '600',
  },

  // Resultado card
  resultCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.surface,
    shadowColor: Colors.primary,
    shadowRadius: 16,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  resultTopStrip: {
    height: 2,
    backgroundColor: Colors.primary,
  },
  resultBody: {
    padding: 18,
    gap: 4,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  resultValueNormal: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  resultValuePrimary: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  resultNote: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 10,
  },
});
