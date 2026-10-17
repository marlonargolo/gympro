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
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getStudentFicha } from '@gympro/api';
import { Colors } from '../../constants/colors';

interface Ficha {
  student: {
    id: number;
    modalidade?: string;
    fitness_goal?: string;
    birth_date?: string;
    weight_kg?: number;
    height_cm?: number;
    sexo?: string;
  };
  user: {
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  treinos: Array<{
    id: number;
    name: string;
    descricao?: string;
    exercicios_count?: number;
  }>;
  evolucao: Array<{
    id: number;
    peso_kg?: number;
    gordura_corporal?: number;
    massa_muscular?: number;
    imc?: number;
    created_at: string;
  }>;
  plano_nutricional?: {
    id: number;
    titulo: string;
    calorias_diarias?: number;
    proteinas_g?: number;
    carboidratos_g?: number;
    gorduras_g?: number;
  } | null;
  personal_trainer?: { full_name: string } | null;
  nutritionist?: { full_name: string } | null;
}

const GOAL_LABEL: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  endurance: 'Resistência',
  flexibility: 'Flexibilidade',
  health: 'Saúde',
};

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadFicha() {
    try {
      const data = await getStudentFicha(Number(id));
      setFicha(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar a ficha do aluno.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadFicha(); }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!ficha) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Aluno não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { student, user } = ficha;
  const initials = user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const latest = ficha.evolucao[ficha.evolucao.length - 1];
  const prev = ficha.evolucao[ficha.evolucao.length - 2];

  const weight = latest?.peso_kg ?? student.weight_kg;
  const prevWeight = prev?.peso_kg;
  const weightDelta = weight && prevWeight ? weight - prevWeight : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFicha(); }} tintColor={Colors.primary} />}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user.full_name}</Text>
            <Text style={styles.goal}>
              {student.fitness_goal ? (GOAL_LABEL[student.fitness_goal] || student.fitness_goal) : 'Sem objetivo definido'}
            </Text>
          </View>
        </View>

        {user.email && (
          <View style={styles.contactCard}>
            <Text style={styles.contactItem}>📧 {user.email}</Text>
            {user.phone && <Text style={styles.contactItem}>📱 {user.phone}</Text>}
          </View>
        )}

        {(weight || student.height_cm) && (
          <>
            <Text style={styles.sectionTitle}>Métricas Corporais</Text>
            <View style={styles.metricsGrid}>
              {weight && (
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>⚖️</Text>
                  <Text style={styles.metricValue}>{weight} kg</Text>
                  <Text style={styles.metricLabel}>Peso</Text>
                  {weightDelta !== null && (
                    <Text style={[styles.metricDelta, { color: weightDelta <= 0 ? Colors.success : Colors.danger }]}>
                      {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
                    </Text>
                  )}
                </View>
              )}
              {student.height_cm && (
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>📏</Text>
                  <Text style={styles.metricValue}>{student.height_cm} cm</Text>
                  <Text style={styles.metricLabel}>Altura</Text>
                  <Text style={styles.metricDelta}>—</Text>
                </View>
              )}
              {latest?.gordura_corporal && (
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>📊</Text>
                  <Text style={styles.metricValue}>{latest.gordura_corporal}%</Text>
                  <Text style={styles.metricLabel}>Gordura</Text>
                  <Text style={styles.metricDelta}>—</Text>
                </View>
              )}
              {latest?.massa_muscular && (
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>💪</Text>
                  <Text style={styles.metricValue}>{latest.massa_muscular} kg</Text>
                  <Text style={styles.metricLabel}>Massa</Text>
                  <Text style={styles.metricDelta}>—</Text>
                </View>
              )}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Treinos Atribuídos</Text>
        {ficha.treinos.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum treino atribuído</Text>
        ) : (
          ficha.treinos.map((w) => (
            <TouchableOpacity
              key={w.id}
              style={styles.workoutRow}
              onPress={() => router.push(`/workout/${w.id}` as any)}
            >
              <View>
                <Text style={styles.workoutName}>{w.name}</Text>
                {w.exercicios_count !== undefined && (
                  <Text style={styles.workoutMeta}>{w.exercicios_count} exercícios</Text>
                )}
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))
        )}

        {ficha.plano_nutricional && (
          <>
            <Text style={styles.sectionTitle}>Plano Nutricional</Text>
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionName}>{ficha.plano_nutricional.titulo}</Text>
              {(ficha.plano_nutricional.calorias_diarias || ficha.plano_nutricional.proteinas_g) && (
                <View style={styles.macroRow}>
                  {ficha.plano_nutricional.calorias_diarias && (
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{ficha.plano_nutricional.calorias_diarias}</Text>
                      <Text style={styles.macroLabel}>kcal</Text>
                    </View>
                  )}
                  {ficha.plano_nutricional.proteinas_g && (
                    <>
                      <View style={styles.macroDivider} />
                      <View style={styles.macroItem}>
                        <Text style={[styles.macroValue, { color: Colors.danger }]}>
                          {ficha.plano_nutricional.proteinas_g}g
                        </Text>
                        <Text style={styles.macroLabel}>Proteína</Text>
                      </View>
                    </>
                  )}
                  {ficha.plano_nutricional.carboidratos_g && (
                    <>
                      <View style={styles.macroDivider} />
                      <View style={styles.macroItem}>
                        <Text style={[styles.macroValue, { color: Colors.warning }]}>
                          {ficha.plano_nutricional.carboidratos_g}g
                        </Text>
                        <Text style={styles.macroLabel}>Carbo</Text>
                      </View>
                    </>
                  )}
                  {ficha.plano_nutricional.gorduras_g && (
                    <>
                      <View style={styles.macroDivider} />
                      <View style={styles.macroItem}>
                        <Text style={[styles.macroValue, { color: Colors.success }]}>
                          {ficha.plano_nutricional.gorduras_g}g
                        </Text>
                        <Text style={styles.macroLabel}>Gordura</Text>
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>
          </>
        )}

        {ficha.evolucao.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Histórico de Evolução</Text>
            <View style={styles.evolutionCard}>
              {ficha.evolucao.slice(-3).reverse().map((ev) => (
                <View key={ev.id} style={styles.evolutionRow}>
                  <Text style={styles.evolutionDate}>
                    {new Date(ev.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                  <View style={styles.evolutionMetrics}>
                    {ev.peso_kg && <Text style={styles.evolutionValue}>⚖️ {ev.peso_kg} kg</Text>}
                    {ev.gordura_corporal && <Text style={styles.evolutionValue}>📊 {ev.gordura_corporal}%</Text>}
                    {ev.imc && <Text style={styles.evolutionValue}>IMC {ev.imc}</Text>}
                  </View>
                </View>
              ))}
            </View>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.textMuted, fontSize: 16 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  name: { fontSize: 20, fontWeight: '700', color: Colors.text },
  goal: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  contactCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  contactItem: { color: Colors.textMuted, fontSize: 14 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
    marginTop: 4,
  },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  metricIcon: { fontSize: 20, marginBottom: 6 },
  metricValue: { fontSize: 18, fontWeight: '700', color: Colors.text },
  metricLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  metricDelta: { fontSize: 12, fontWeight: '600', marginTop: 4, color: Colors.textMuted },
  workoutRow: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  workoutName: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  workoutMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  chevron: { fontSize: 22, color: Colors.textMuted },
  nutritionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nutritionName: { color: Colors.text, fontWeight: '600', fontSize: 14, marginBottom: 12 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-around' },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 16, fontWeight: '700', color: Colors.text },
  macroLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  macroDivider: { width: 1, backgroundColor: Colors.border },
  emptyText: { color: Colors.textMuted, fontSize: 14, marginBottom: 16 },
  evolutionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  evolutionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  evolutionDate: { color: Colors.textMuted, fontSize: 13 },
  evolutionMetrics: { flexDirection: 'row', gap: 12 },
  evolutionValue: { color: Colors.text, fontSize: 13, fontWeight: '500' },
});
