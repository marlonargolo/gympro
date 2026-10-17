import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, FlatList, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getWorkouts } from '@gympro/api';

type Modalidade = 'corredor' | 'futebol' | 'musculacao' | 'ciclista' | 'natacao' | 'crossTraining';

const modalidadeLabel: Record<string, string> = {
  corredor: 'Corrida',
  futebol: 'Futebol',
  musculacao: 'Musculação',
  ciclista: 'Ciclismo',
  natacao: 'Natação',
  crossTraining: 'Cross Training',
};

const allModalidades: Modalidade[] = [
  'corredor', 'futebol', 'musculacao', 'ciclista', 'natacao', 'crossTraining',
];

interface ApiWorkout {
  id: string;
  titulo: string;
  descricao?: string;
  exercicios: object[];
  duracao_estimada_min: number;
  modalidade: string;
  nivel: string;
  assigned_to?: object | null;
}

function duracaoColor(min: number): string {
  if (min < 45) return Colors.success;
  if (min < 60) return Colors.primary2;
  return Colors.primary;
}

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
      <Text
        style={[chip.text, { color: ativo ? '#FFF' : Colors.textSecondary }]}
        numberOfLines={1}
      >
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

function WorkoutCard({ item }: { item: ApiWorkout }) {
  const color = duracaoColor(item.duracao_estimada_min);
  const exCount = item.exercicios.length;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.navigate(`/workout/${item.id}` as any)}
      style={card.wrap}
    >
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
      <View style={card.body}>
        <View style={card.left}>
          <Text style={card.title}>{item.titulo}</Text>
          <Text style={card.sub}>
            {modalidadeLabel[item.modalidade] ?? item.modalidade} · {item.nivel}
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
              {item.duracao_estimada_min}min
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function WorkoutsScreen() {
  const [workouts, setWorkouts] = useState<ApiWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Modalidade | null>(null);

  useEffect(() => {
    getWorkouts()
      .then((data: ApiWorkout[]) => setWorkouts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const treinosFiltrados = filtro
    ? workouts.filter(t => t.modalidade === filtro)
    : workouts;

  return (
    <SafeAreaView style={s.safe}>
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

      <View style={s.chipsWrap}>
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
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList<ApiWorkout>
          data={treinosFiltrados}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <WorkoutCard item={item} />}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Ionicons name="barbell-outline" size={40} color={Colors.textTertiary} />
              <Text style={s.emptyText}>Nenhum treino encontrado</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const chip = StyleSheet.create({
  base: {
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 34,
    includeFontPadding: false,
  },
});

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

  chipsWrap: {
    height: 54,
    justifyContent: 'center',
  },
  chipsRow: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
