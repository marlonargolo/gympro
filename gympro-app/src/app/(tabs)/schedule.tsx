import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../../constants/colors';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const TODAY = new Date().getDay();

const SCHEDULE = [
  {
    day: 'Segunda',
    time: '07:00',
    workout: 'Peito & Tríceps',
    trainer: 'Carlos M.',
  },
  {
    day: 'Quarta',
    time: '07:00',
    workout: 'Costas & Bíceps',
    trainer: 'Carlos M.',
  },
  {
    day: 'Sexta',
    time: '07:00',
    workout: 'Pernas Completo',
    trainer: 'Ana L.',
  },
  { day: 'Sábado', time: '09:00', workout: 'HIIT Cardio', trainer: 'Ana L.' },
];

export default function ScheduleScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Agenda</Text>

        <View style={styles.weekRow}>
          {DAYS.map((day, i) => (
            <View
              key={day}
              style={[styles.dayCell, i === TODAY && styles.dayCellActive]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  i === TODAY && styles.dayLabelActive,
                ]}
              >
                {day}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  i === TODAY && styles.dayNumberActive,
                ]}
              >
                {new Date(
                  new Date().setDate(new Date().getDate() - TODAY + i)
                ).getDate()}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Treinos Agendados</Text>
        {SCHEDULE.map((item) => (
          <View key={item.day + item.time} style={styles.scheduleCard}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>{item.time}</Text>
              <Text style={styles.dayText}>{item.day}</Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleWorkout}>{item.workout}</Text>
              <Text style={styles.scheduleTrainer}>
                👨‍🏫 {item.trainer}
              </Text>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>✏️</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Agendar Treino</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 16 },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 20,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  dayCell: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    minWidth: 40,
  },
  dayCellActive: { backgroundColor: Colors.primary },
  dayLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 4 },
  dayLabelActive: { color: '#fff' },
  dayNumber: { fontSize: 15, fontWeight: '700', color: Colors.text },
  dayNumberActive: { color: '#fff' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  scheduleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  timeBadge: {
    backgroundColor: Colors.primary + '22',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    minWidth: 56,
  },
  timeText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  dayText: { color: Colors.primary, fontSize: 11, marginTop: 2 },
  scheduleInfo: { flex: 1 },
  scheduleWorkout: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  scheduleTrainer: { color: Colors.textMuted, fontSize: 13, marginTop: 3 },
  editBtn: { padding: 8 },
  editBtnText: { fontSize: 18 },
  addButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  addButtonText: { color: Colors.primary, fontWeight: '600', fontSize: 16 },
});
