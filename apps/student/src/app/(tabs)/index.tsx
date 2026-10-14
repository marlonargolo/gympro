import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../../constants/colors';

const QUICK_STATS = [
  { label: 'Treinos este mês', value: '12', icon: '🔥' },
  { label: 'Horas ativas', value: '18h', icon: '⏱️' },
  { label: 'Calorias totais', value: '4.2k', icon: '⚡' },
];

const RECENT_WORKOUTS = [
  { name: 'Peito & Tríceps', duration: '55 min', date: 'Hoje' },
  { name: 'Costas & Bíceps', duration: '50 min', date: 'Ontem' },
  { name: 'Pernas', duration: '65 min', date: '3 dias atrás' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, Atleta 👋</Text>
          <Text style={styles.subtitle}>Pronto para treinar hoje?</Text>
        </View>

        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>▶ Iniciar Treino</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Resumo do Mês</Text>
        <View style={styles.statsRow}>
          {QUICK_STATS.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Treinos Recentes</Text>
        {RECENT_WORKOUTS.map((workout) => (
          <TouchableOpacity key={workout.name} style={styles.workoutCard}>
            <View>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutMeta}>
                {workout.duration} · {workout.date}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { marginTop: 24, marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 15, color: Colors.textMuted, marginTop: 4 },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 28,
  },
  startButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: '700', color: Colors.text },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  workoutCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  workoutName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  workoutMeta: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 22, color: Colors.textMuted },
});
