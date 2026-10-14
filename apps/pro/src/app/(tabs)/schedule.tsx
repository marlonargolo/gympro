import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { MOCK_PROFESSIONALS, MOCK_STUDENTS, MOCK_WORKOUTS, MOCK_SESSIONS } from '@gympro/shared';

const PRO = MOCK_PROFESSIONALS[0];

const DAYS = [
  { key: 'monday', label: 'Seg' },
  { key: 'tuesday', label: 'Ter' },
  { key: 'wednesday', label: 'Qua' },
  { key: 'thursday', label: 'Qui' },
  { key: 'friday', label: 'Sex' },
  { key: 'saturday', label: 'Sáb' },
  { key: 'sunday', label: 'Dom' },
];

const JS_TO_KEY = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const todayKey = JS_TO_KEY[new Date().getDay()];

export default function ScheduleProScreen() {
  const mySessions = MOCK_SESSIONS.filter((s) => s.professionalId === PRO.id);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Agenda</Text>

        <View style={styles.weekRow}>
          {DAYS.map((d) => {
            const count = mySessions.filter((s) => s.weekDay === d.key).length;
            const isToday = d.key === todayKey;
            return (
              <View key={d.key} style={[styles.dayCell, isToday && styles.dayCellActive]}>
                <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>{d.label}</Text>
                {count > 0 && (
                  <View style={[styles.sessionCount, isToday && styles.sessionCountActive]}>
                    <Text style={[styles.sessionCountText, isToday && styles.sessionCountTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {DAYS.map((d) => {
          const daySessions = mySessions
            .filter((s) => s.weekDay === d.key)
            .sort((a, b) => a.time.localeCompare(b.time));
          if (daySessions.length === 0) return null;

          return (
            <View key={d.key}>
              <Text style={styles.dayHeader}>{d.label}feira</Text>
              {daySessions.map((sess) => {
                const student = MOCK_STUDENTS.find((s) => s.id === sess.studentId);
                const workout = MOCK_WORKOUTS.find((w) => w.id === sess.workoutId);
                return (
                  <TouchableOpacity
                    key={sess.id}
                    style={styles.sessionCard}
                    onPress={() => router.push(`/student/${sess.studentId}` as any)}
                  >
                    <View style={styles.sessionTime}>
                      <Text style={styles.sessionTimeText}>{sess.time}</Text>
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionStudent}>{student?.name ?? '—'}</Text>
                      <Text style={styles.sessionWorkout}>{workout?.name ?? '—'}</Text>
                    </View>
                    <View style={styles.sessionAvatar}>
                      <Text style={styles.sessionAvatarText}>
                        {student?.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Agendar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 16 },
  pageTitle: { fontSize: 26, fontWeight: '700', color: Colors.text, marginTop: 24, marginBottom: 20 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  dayCell: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    minWidth: 38,
    gap: 4,
  },
  dayCellActive: { backgroundColor: Colors.primary },
  dayLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  dayLabelActive: { color: '#fff' },
  sessionCount: {
    backgroundColor: Colors.primary + '33',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  sessionCountActive: { backgroundColor: '#ffffff33' },
  sessionCountText: { color: Colors.primary, fontSize: 11, fontWeight: '700' },
  sessionCountTextActive: { color: '#fff' },
  dayHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
    marginTop: 4,
  },
  sessionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  sessionTime: {
    backgroundColor: Colors.primary + '22',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 52,
  },
  sessionTimeText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  sessionInfo: { flex: 1 },
  sessionStudent: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  sessionWorkout: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  sessionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionAvatarText: { color: Colors.text, fontWeight: '700', fontSize: 11 },
  addButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addButtonText: { color: Colors.primary, fontWeight: '600', fontSize: 16 },
});
