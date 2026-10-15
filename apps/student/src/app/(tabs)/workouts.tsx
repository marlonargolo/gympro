// WorkoutListView — faithful port of Views/Workout/WorkoutListView.swift
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useStore } from '../../context/StoreContext';
import type { ModalidadeAtleta } from '../../data/types';
import { modalidadeLabel } from '../../data/types';

const allModalidades: ModalidadeAtleta[] = [
  'corredor', 'futebol', 'musculacao', 'ciclista', 'natacao', 'crossTraining',
];

const duracaoColor = (min: number) => {
  if (min < 45) return Colors.success;
  if (min < 60) return Colors.primary2;
  return Colors.primary;
};

export default function WorkoutsScreen() {
  const { treinos } = useStore();
  const [filtro, setFiltro] = useState<ModalidadeAtleta | null>(null);

  const treinosFiltrados = filtro ? treinos.filter(t => t.modalidade === filtro) : treinos;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Treinos</Text>
        <TouchableOpacity onPress={() => router.navigate('/training-methods')}>
          <Text style={s.methodsLink}>Métodos</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chipsRow}
      >
        <FilterChip titulo="Todos" ativo={filtro === null} onPress={() => setFiltro(null)} />
        {allModalidades.map(m => (
          <FilterChip
            key={m}
            titulo={modalidadeLabel[m]}
            ativo={filtro === m}
            onPress={() => setFiltro(m)}
          />
        ))}
      </ScrollView>

      {/* Workout list */}
      <FlatList
        data={treinosFiltrados}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => router.navigate(`/workout/${item.id}` as any)}
            activeOpacity={0.8}
          >
            <View style={s.cardLeft}>
              <Text style={s.cardTitle}>{item.titulo}</Text>
              <Text style={s.cardSub}>
                {modalidadeLabel[item.modalidade]} · {item.duracaoEstimadaMin} min · {item.nivel}
              </Text>
              <Text style={s.exCount}>{item.exercicios.length} exercício{item.exercicios.length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={s.cardRight}>
              <View style={[s.badge, { backgroundColor: duracaoColor(item.duracaoEstimadaMin) + '22' }]}>
                <Text style={[s.badgeText, { color: duracaoColor(item.duracaoEstimadaMin) }]}>
                  {item.duracaoEstimadaMin}min
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function FilterChip({ titulo, ativo, onPress }: { titulo: string; ativo: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.chip, ativo && s.chipAtivo]}
      activeOpacity={0.7}
    >
      <Text style={[s.chipText, ativo && s.chipTextAtivo]}>{titulo}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 26, fontWeight: '700', color: Colors.text },
  methodsLink: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  chipsRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Colors.surface,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipAtivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextAtivo: { color: '#FFF' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardLeft: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  cardSub: { fontSize: 13, color: Colors.textSecondary },
  exCount: { fontSize: 12, color: Colors.textTertiary },
  cardRight: { alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
