// ProfileView — faithful port of Views/ProfileView.swift
import React from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useStore } from '../../context/StoreContext';
import { calcularTMB, calcularGET } from '../../data/calculators';
import type { NivelAtividade, ModalidadeAtleta, Sexo } from '../../data/types';
import { nivelAtividadeLabel, modalidadeLabel } from '../../data/types';

const sexos: Sexo[] = ['masculino', 'feminino'];
const niveis: NivelAtividade[] = ['sedentario', 'leve', 'moderado', 'ativo', 'muitoAtivo'];
const modalidades: ModalidadeAtleta[] = ['corredor', 'futebol', 'musculacao', 'ciclista', 'natacao', 'crossTraining'];

export default function ProfileScreen() {
  const { perfil, setPerfil } = useStore();
  const tmb = Math.round(calcularTMB(perfil));
  const get = Math.round(calcularGET(perfil));

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.title}>Perfil</Text>

        {/* Dados pessoais */}
        <Section title="Dados pessoais">
          <FormField label="Nome">
            <TextInput
              style={s.input}
              value={perfil.nome}
              onChangeText={v => setPerfil({ ...perfil, nome: v })}
              placeholder="Seu nome"
              placeholderTextColor={Colors.textTertiary}
            />
          </FormField>

          <FormField label="Sexo">
            <View style={s.segmented}>
              {sexos.map(s_ => (
                <TouchableOpacity
                  key={s_}
                  style={[s.seg, perfil.sexo === s_ && s.segAtivo]}
                  onPress={() => setPerfil({ ...perfil, sexo: s_ })}
                >
                  <Text style={[s.segText, perfil.sexo === s_ && s.segTextAtivo]}>
                    {s_ === 'masculino' ? 'Masculino' : 'Feminino'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormField>

          <FormField label={`Idade: ${perfil.idade} anos`}>
            <View style={s.stepper}>
              <TouchableOpacity
                style={s.stepBtn}
                onPress={() => setPerfil({ ...perfil, idade: Math.max(10, perfil.idade - 1) })}
              >
                <Ionicons name="remove" size={18} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={s.stepVal}>{perfil.idade}</Text>
              <TouchableOpacity
                style={s.stepBtn}
                onPress={() => setPerfil({ ...perfil, idade: Math.min(90, perfil.idade + 1) })}
              >
                <Ionicons name="add" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </FormField>
        </Section>

        {/* Medidas */}
        <Section title="Medidas">
          <FormField label="Peso (kg)">
            <TextInput
              style={s.input}
              value={String(perfil.pesoKg)}
              onChangeText={v => setPerfil({ ...perfil, pesoKg: parseFloat(v) || perfil.pesoKg })}
              keyboardType="decimal-pad"
              placeholder="kg"
              placeholderTextColor={Colors.textTertiary}
            />
          </FormField>
          <FormField label="Altura (cm)">
            <TextInput
              style={s.input}
              value={String(perfil.alturaCm)}
              onChangeText={v => setPerfil({ ...perfil, alturaCm: parseFloat(v) || perfil.alturaCm })}
              keyboardType="decimal-pad"
              placeholder="cm"
              placeholderTextColor={Colors.textTertiary}
            />
          </FormField>
        </Section>

        {/* Atividade e modalidade */}
        <Section title="Atividade e modalidade">
          <Text style={s.fieldLabel}>Nível de atividade</Text>
          {niveis.map(n => (
            <TouchableOpacity
              key={n}
              style={[s.listOption, perfil.nivelAtividade === n && s.listOptionAtivo]}
              onPress={() => setPerfil({ ...perfil, nivelAtividade: n })}
            >
              <Text style={[s.listOptionText, perfil.nivelAtividade === n && s.listOptionTextAtivo]}>
                {nivelAtividadeLabel[n]}
              </Text>
              {perfil.nivelAtividade === n && (
                <Ionicons name="checkmark" size={16} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}

          <Text style={[s.fieldLabel, { marginTop: 12 }]}>Modalidade principal</Text>
          {modalidades.map(m => (
            <TouchableOpacity
              key={m}
              style={[s.listOption, perfil.modalidadePrincipal === m && s.listOptionAtivo]}
              onPress={() => setPerfil({ ...perfil, modalidadePrincipal: m })}
            >
              <Text style={[s.listOptionText, perfil.modalidadePrincipal === m && s.listOptionTextAtivo]}>
                {modalidadeLabel[m]}
              </Text>
              {perfil.modalidadePrincipal === m && (
                <Ionicons name="checkmark" size={16} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Section>

        {/* Resultado */}
        <Section title="Resultado">
          <View style={s.resultRow}>
            <Text style={s.resultLabel}>TMB</Text>
            <Text style={s.resultValue}>{tmb} kcal/dia</Text>
          </View>
          <View style={s.resultRow}>
            <Text style={s.resultLabel}>Gasto total estimado</Text>
            <Text style={[s.resultValue, { color: Colors.primary }]}>{get} kcal/dia</Text>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={ss.section}>
      <Text style={ss.sectionTitle}>{title}</Text>
      <View style={ss.sectionBody}>{children}</View>
    </View>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={ss.field}>
      <Text style={ss.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const ss = StyleSheet.create({
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
  },
  sectionBody: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 12,
  },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, color: Colors.textSecondary },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text },
  fieldLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmented: { flexDirection: 'row', borderRadius: 10, overflow: 'hidden', gap: 4 },
  seg: {
    flex: 1, padding: 10, alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
  },
  segAtivo: { backgroundColor: Colors.primary },
  segText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  segTextAtivo: { color: '#FFF' },
  stepper: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surfaceElevated, borderRadius: 10, padding: 8,
    alignSelf: 'flex-start',
  },
  stepBtn: { padding: 6 },
  stepVal: { fontSize: 18, fontWeight: '700', color: Colors.text, minWidth: 36, textAlign: 'center' },
  listOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listOptionAtivo: { borderColor: Colors.primary, backgroundColor: Colors.primary + '18' },
  listOptionText: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  listOptionTextAtivo: { color: Colors.text, fontWeight: '600' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 14, color: Colors.textSecondary },
  resultValue: { fontSize: 16, fontWeight: '700', color: Colors.text },
});
