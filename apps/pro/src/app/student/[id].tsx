import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import {
  MOCK_STUDENTS,
  MOCK_WORKOUTS,
  MOCK_WORKOUT_LOGS,
  MOCK_NUTRITION_PLANS,
  MOCK_PROGRESS,
  MOCK_SESSIONS,
} from '@gympro/shared';
import type { Student } from '@gympro/shared';

const GOAL_LABEL: Record<Student['goal'], string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  endurance: 'Resistência',
  flexibility: 'Flexibilidade',
  health: 'Saúde',
};

const WEEKDAY_LABEL: Record<string, string> = {
  monday: 'Seg', tuesday: 'Ter', wednesday: 'Qua',
  thursday: 'Qui', friday: 'Sex', saturday: 'Sáb', sunday: 'Dom',
};

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const student = MOCK_STUDENTS.find((s) => s.id === id);

  if (!student) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Aluno não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const latest = student.metrics[student.metrics.length - 1];
  const prev = student.metrics[student.metrics.length - 2];
  const weightDelta = prev ? latest.weight - prev.weight : 0;
  const fatDelta = prev && latest.bodyFat && prev.bodyFat ? latest.bodyFat - prev.bodyFat : 0;

  const assignedWorkouts = MOCK_WORKOUTS.filter((w) => w.assignedTo === student.id);
  const studentLogs = MOCK_WORKOUT_LOGS.filter((l) => l.studentId === student.id);
  const nutritionPlan = MOCK_NUTRITION_PLANS.find((n) => n.studentId === student.id);
  const sessions = MOCK_SESSIONS.filter((s) => s.studentId === student.id);
  const progress = MOCK_PROGRESS.filter((p) => p.studentId === student.id);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View>
            <Text style={styles.name}>{student.name}</Text>
            <Text style={styles.goal}>{GOAL_LABEL[student.goal]}</Text>
          </View>
        </View>

        {/* Body Metrics */}
        <Text style={styles.sectionTitle}>Métricas Corporais</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>⚖️</Text>
            <Text style={styles.metricValue}>{latest.weight} kg</Text>
            <Text style={styles.metricLabel}>Peso</Text>
            <Text style={[styles.metricDelta, { color: weightDelta <= 0 ? Colors.success : Colors.danger }]}>
              {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
            </Text>
          </View>
          {latest.bodyFat && (
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>📊</Text>
              <Text style={styles.metricValue}>{latest.bodyFat}%</Text>
              <Text style={styles.metricLabel}>Gordura</Text>
              <Text style={[styles.metricDelta, { color: fatDelta <= 0 ? Colors.success : Colors.danger }]}>
                {fatDelta > 0 ? '+' : ''}{fatDelta.toFixed(1)}%
              </Text>
            </View>
          )}
          {latest.muscleMass && (
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>💪</Text>
              <Text style={styles.metricValue}>{latest.muscleMass} kg</Text>
              <Text style={styles.metricLabel}>Massa</Text>
              <Text style={[styles.metricDelta, { color: Colors.success }]}>+1 kg</Text>
            </View>
          )}
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>📏</Text>
            <Text style={styles.metricValue}>{latest.height} cm</Text>
            <Text style={styles.metricLabel}>Altura</Text>
            <Text style={styles.metricDelta}>—</Text>
          </View>
        </View>

        {/* Progress */}
        {progress.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Progresso</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Treinos este mês</Text>
                <Text style={styles.progressValue}>{progress[progress.length - 1].workoutsThisMonth}</Text>
              </View>
              {progress[progress.length - 1].nutritionAdherence !== undefined && (
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Aderência à dieta</Text>
                  <Text style={[styles.progressValue, { color: Colors.success }]}>
                    {progress[progress.length - 1].nutritionAdherence}%
                  </Text>
                </View>
              )}
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Total de treinos registados</Text>
                <Text style={styles.progressValue}>{studentLogs.length}</Text>
              </View>
            </View>
          </>
        )}

        {/* Scheduled sessions */}
        <Text style={styles.sectionTitle}>Treinos na Semana</Text>
        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma sessão agendada</Text>
        ) : (
          sessions.map((sess) => {
            const wkt = MOCK_WORKOUTS.find((w) => w.id === sess.workoutId);
            return (
              <View key={sess.id} style={styles.sessionRow}>
                <View style={styles.sessionDay}>
                  <Text style={styles.sessionDayText}>{WEEKDAY_LABEL[sess.weekDay]}</Text>
                  <Text style={styles.sessionTime}>{sess.time}</Text>
                </View>
                <Text style={styles.sessionWorkout}>{wkt?.name ?? '—'}</Text>
              </View>
            );
          })
        )}

        {/* Workouts assigned */}
        <Text style={styles.sectionTitle}>Treinos Atribuídos</Text>
        {assignedWorkouts.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum treino atribuído</Text>
        ) : (
          assignedWorkouts.map((w) => (
            <TouchableOpacity
              key={w.id}
              style={styles.workoutRow}
              onPress={() => router.push(`/workout/${w.id}` as any)}
            >
              <View>
                <Text style={styles.workoutName}>{w.name}</Text>
                <Text style={styles.workoutMeta}>
                  {w.exercises.length} exercícios · {w.durationMinutes} min
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))
        )}

        {/* Nutrition plan summary */}
        {nutritionPlan && (
          <>
            <Text style={styles.sectionTitle}>Plano Nutricional</Text>
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionName}>{nutritionPlan.name}</Text>
              <View style={styles.macroRow}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{nutritionPlan.dailyCalories}</Text>
                  <Text style={styles.macroLabel}>kcal</Text>
                </View>
                <View style={styles.macroDivider} />
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: Colors.danger }]}>
                    {nutritionPlan.dailyProtein}g
                  </Text>
                  <Text style={styles.macroLabel}>Proteína</Text>
                </View>
                <View style={styles.macroDivider} />
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: Colors.warning }]}>
                    {nutritionPlan.dailyCarbs}g
                  </Text>
                  <Text style={styles.macroLabel}>Carboidrato</Text>
                </View>
                <View style={styles.macroDivider} />
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: Colors.success }]}>
                    {nutritionPlan.dailyFat}g
                  </Text>
                  <Text style={styles.macroLabel}>Gordura</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>💬 Mensagem</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]}>
            <Text style={[styles.actionBtnText, { color: Colors.primary }]}>+ Treino</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 24,
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
  metricDelta: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: Colors.textMuted, fontSize: 14 },
  progressValue: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  sessionRow: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionDay: {
    backgroundColor: Colors.primary + '22',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  sessionDayText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  sessionTime: { color: Colors.primary, fontSize: 11, marginTop: 2 },
  sessionWorkout: { color: Colors.text, fontSize: 14, fontWeight: '500', flex: 1 },
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
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 32, marginTop: 8 },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionBtnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
