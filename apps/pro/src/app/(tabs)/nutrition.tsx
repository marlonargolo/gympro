import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  FlatList, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface PlanoNutricional {
  id: string;
  titulo: string;
  objetivo: 'emagrecimento' | 'manutencao' | 'hipertrofia';
  calorias_diarias: number;
  proteinas_g: number;
  carboidratos_g: number;
  gorduras_g: number;
  alunos_vinculados: number;
}

const OBJETIVOS = {
  emagrecimento: { label: 'Emagrecimento', color: '#FF6B6B' },
  manutencao: { label: 'Manutenção', color: '#FFD93D' },
  hipertrofia: { label: 'Hipertrofia', color: '#4DD68C' },
};

const MOCK_PLANOS: PlanoNutricional[] = [
  {
    id: '1', titulo: 'Cutting Avançado', objetivo: 'emagrecimento',
    calorias_diarias: 1800, proteinas_g: 180, carboidratos_g: 120, gorduras_g: 60,
    alunos_vinculados: 3,
  },
  {
    id: '2', titulo: 'Bulking Limpo', objetivo: 'hipertrofia',
    calorias_diarias: 3200, proteinas_g: 220, carboidratos_g: 380, gorduras_g: 80,
    alunos_vinculados: 5,
  },
  {
    id: '3', titulo: 'Manutenção Equilibrada', objetivo: 'manutencao',
    calorias_diarias: 2400, proteinas_g: 160, carboidratos_g: 280, gorduras_g: 70,
    alunos_vinculados: 2,
  },
];

function MacroBadge({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <View style={[macro.wrap, { borderColor: color + '44', backgroundColor: color + '18' }]}>
      <Text style={[macro.value, { color }]}>{value}{unit}</Text>
      <Text style={macro.label}>{label}</Text>
    </View>
  );
}

function PlanoCard({ item }: { item: PlanoNutricional }) {
  const obj = OBJETIVOS[item.objetivo];
  return (
    <TouchableOpacity style={card.wrap} activeOpacity={0.8}>
      <View style={[card.strip, { backgroundColor: obj.color }]} />
      <View style={card.body}>
        <View style={card.top}>
          <View style={{ flex: 1 }}>
            <Text style={card.titulo}>{item.titulo}</Text>
            <View style={[card.badge, { backgroundColor: obj.color + '25', borderColor: obj.color + '55' }]}>
              <Text style={[card.badgeText, { color: obj.color }]}>{obj.label}</Text>
            </View>
          </View>
          <View style={card.studentsBadge}>
            <Ionicons name="people-outline" size={13} color={Colors.textMuted} />
            <Text style={card.studentsText}>{item.alunos_vinculados}</Text>
          </View>
        </View>
        <View style={card.macros}>
          <MacroBadge label="kcal" value={item.calorias_diarias} unit="" color={Colors.primary} />
          <MacroBadge label="Prot" value={item.proteinas_g} unit="g" color="#7388FF" />
          <MacroBadge label="Carbo" value={item.carboidratos_g} unit="g" color="#FFD93D" />
          <MacroBadge label="Gord" value={item.gorduras_g} unit="g" color="#FF9E26" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function NutritionScreen() {
  const [planos] = useState<PlanoNutricional[]>(MOCK_PLANOS);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Nutrição</Text>
        <TouchableOpacity style={s.addBtn} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={s.addBtnText}>Novo plano</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryValue}>{planos.length}</Text>
          <Text style={s.summaryLabel}>Planos ativos</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryValue}>{planos.reduce((a, p) => a + p.alunos_vinculados, 0)}</Text>
          <Text style={s.summaryLabel}>Alunos vinculados</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={[s.summaryValue, { color: '#4DD68C' }]}>
            {planos.filter(p => p.objetivo === 'hipertrofia').length}
          </Text>
          <Text style={s.summaryLabel}>Hipertrofia</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={[s.summaryValue, { color: '#FF6B6B' }]}>
            {planos.filter(p => p.objetivo === 'emagrecimento').length}
          </Text>
          <Text style={s.summaryLabel}>Emagrecimento</Text>
        </View>
      </ScrollView>

      <FlatList
        data={planos}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PlanoCard item={item} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="nutrition-outline" size={40} color={Colors.textMuted} />
            <Text style={s.emptyText}>Nenhum plano nutricional criado</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const macro = StyleSheet.create({
  wrap: {
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, borderWidth: 1,
  },
  value: { fontSize: 14, fontWeight: '700' },
  label: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
});

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1,
    borderColor: Colors.border, overflow: 'hidden', flexDirection: 'row',
  },
  strip: { width: 4 },
  body: { flex: 1, padding: 14, gap: 12 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  titulo: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  badge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  studentsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.background, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
  },
  studentsText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  macros: { flexDirection: 'row', gap: 8 },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  summaryRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 16 },
  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1,
    borderColor: Colors.border, padding: 14, minWidth: 100, alignItems: 'center', gap: 4,
  },
  summaryValue: { fontSize: 24, fontWeight: '800', color: Colors.text },
  summaryLabel: { fontSize: 11, color: Colors.textMuted },
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
});
