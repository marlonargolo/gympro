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
import { MOCK_WORKOUTS, MOCK_STUDENTS, MOCK_PROFESSIONALS } from '@gympro/shared';

const PRO = MOCK_PROFESSIONALS[0];

const MUSCLE_LABEL: Record<string, string> = {
  chest: 'Peito', back: 'Costas', shoulders: 'Ombros',
  biceps: 'Bíceps', triceps: 'Tríceps', legs: 'Pernas',
  glutes: 'Glúteos', core: 'Core', cardio: 'Cardio', full_body: 'Full Body',
};

export default function WorkoutsProScreen() {
  const myWorkouts = MOCK_WORKOUTS.filter((w) => w.createdBy === PRO.id);

  const templates = myWorkouts.filter((w) => !w.assignedTo);
  const assigned = myWorkouts.filter((w) => !!w.assignedTo);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Treinos</Text>
          <TouchableOpacity style={styles.newBtn}>
            <Text style={styles.newBtnText}>+ Novo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Atribuídos a Alunos ({assigned.length})</Text>
        {assigned.map((w) => {
          const student = MOCK_STUDENTS.find((s) => s.id === w.assignedTo);
          return (
            <TouchableOpacity
              key={w.id}
              style={styles.card}
              onPress={() => router.push(`/workout/${w.id}` as any)}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardName}>{w.name}</Text>
                <Text style={styles.cardMeta}>
                  {w.exercises.length} exercícios · {w.durationMinutes} min
                </Text>
                <View style={styles.muscleRow}>
                  {w.muscleGroups.slice(0, 3).map((mg) => (
                    <View key={mg} style={styles.musclePill}>
                      <Text style={styles.musclePillText}>{MUSCLE_LABEL[mg] ?? mg}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.cardRight}>
                {student && (
                  <View style={styles.studentBadge}>
                    <View style={styles.studentBadgeAvatar}>
                      <Text style={styles.studentBadgeAvatarText}>
                        {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </Text>
                    </View>
                    <Text style={styles.studentBadgeName} numberOfLines={1}>
                      {student.name.split(' ')[0]}
                    </Text>
                  </View>
                )}
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {templates.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Templates ({templates.length})</Text>
            {templates.map((w) => (
              <TouchableOpacity key={w.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardName}>{w.name}</Text>
                  <Text style={styles.cardMeta}>
                    {w.exercises.length} exercícios · {w.durationMinutes} min
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Criar Treino</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  pageTitle: { fontSize: 26, fontWeight: '700', color: Colors.text },
  newBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  newBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardLeft: { flex: 1 },
  cardName: { color: Colors.text, fontWeight: '600', fontSize: 15, marginBottom: 2 },
  cardMeta: { color: Colors.textMuted, fontSize: 12, marginBottom: 6 },
  muscleRow: { flexDirection: 'row', gap: 4 },
  musclePill: {
    backgroundColor: Colors.primary + '22',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  musclePillText: { color: Colors.primary, fontSize: 10, fontWeight: '600' },
  cardRight: { alignItems: 'flex-end', gap: 8, marginLeft: 10 },
  studentBadge: { alignItems: 'center', gap: 3 },
  studentBadgeAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentBadgeAvatarText: { color: Colors.text, fontSize: 10, fontWeight: '700' },
  studentBadgeName: { color: Colors.textMuted, fontSize: 10, maxWidth: 50 },
  chevron: { fontSize: 22, color: Colors.textMuted },
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
