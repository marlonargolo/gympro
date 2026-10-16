// WorkoutsScreen — premium dark UI rewrite
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useStore } from '../../context/StoreContext';
import type { ModalidadeAtleta, Treino } from '../../data/types';
import { modalidadeLabel } from '../../data/types';

// ─── helpers ──────────────────────────────────────────────────────────────────

const allModalidades: ModalidadeAtleta[] = [
  'corredor', 'futebol', 'musculacao', 'ciclista', 'natacao', 'crossTraining',
];

function duracaoColor(min: number): string {
  if (min < 45) return Colors.success;
  if (min < 60) return Colors.primary2;
  return Colors.primary;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterChip({
  titulo, ativo, onPress,
}: {
  titulo: string;
  ativo: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        chip.base,
        ativo
          ? {
              backgroundColor: Colors.primary,
              borderColor: Colors.primary,
              shadowColor: Colors.primary,
              shadowRadius: 8,
              shadowOpacity: 0.35,
              shadowOffset: { width: 0, height: 0 },
              elevation: 6,
            }
          : {
              backgroundColor: Colors.surfaceElevated,
              borderColor: Colors.glassBorder,
            },
      ]}
    >
      <Text style={[chip.text, { color: ativo ? '#FFF' : Colors.textSecondary }]}>
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

function WorkoutCard({ item }: { item: Treino }) {
  const color = duracaoColor(item.duracaoEstimadaMin);
  const exCount = item.exercicios.length;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.navigate(`/workout/${item.id}` as any)}
      style={card.wrap}
    >
      {/* orange / colored accent strip */}
      <View
        style={[
          card.strip,
          {
            backgroundColor: color,
            shadowColor: color,
            shadowRadius: 6,
            shadowOpacity: 0.45,
            shadowOffset: { width: 0, height: 0 },
            elevation: 4,
          },
        ]}
      />
      {/* card body */}
      <View style={card.body}>
        <View style={card.left}>
          <Text style={card.title}>{item.titulo}</Text>
          <Text style={card.sub}>
            {modalidadeLabel[item.modalidade]} · {item.nivel}
          </Text>
          <Text style={card.exCount}>
            {exCount} exercício{exCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={card.right}>
          <View
            style={[
              card.badge,
              { backgroundColor: color + '28', borderColor: color + '55', borderWidth: 1 },
            ]}
          >
            <Ionicons name="time-outline" size={11} color={color} style={{ marginRight: 3 }} />
            <Text style={[card.badgeText, { color }]}>
              {item.duracaoEstimadaMin}min
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WorkoutsScreen() {
  const { treinos } = useStore();
  const [filtro, setFiltro] = useState<ModalidadeAtleta | null>(null);

  const treinosFiltrados = filtro
    ? treinos.filter(t => t.modalidade === filtro)
    : treinos;

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Treinos</Text>
        <TouchableOpacity
          style={s.methodsPill}
          onPress={() => router.navigate('/training-methods' as any)}
          activeOpacity={0.8}
        >
          <Text style={s.methodsPillText}>Métodos →</Text>
        </TouchableOpacity>
      </View>

      {/* ── Filter chips ── */}
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

      {/* ── Workout list ── */}
      <FlatList<Treino>
        data={treinosFiltrados}
        keyExtractor={(item: Treino) => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: { item: Treino }) => <WorkoutCard item={item} />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Ionicons name="barbell-outline" size={40} color={Colors.textTertiary} />
            <Text style={s.emptyText}>Nenhum treino encontrado</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Chip styles ──────────────────────────────────────────────────────────────
const chip = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    height: 36,
    alignSelf: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});

// ─── Card styles ──────────────────────────────────────────────────────────────
const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  strip: {
    width: 4,
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 14,
    gap: 12,
  },
  left: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  sub: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  exCount: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  right: {
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  methodsPill: {
    backgroundColor: Colors.accent + '22',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.accent + '55',
  },
  methodsPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
  },

  chipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },

  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textTertiary,
  },
});
