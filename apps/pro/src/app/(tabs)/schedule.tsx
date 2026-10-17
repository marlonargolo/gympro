import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { getMyStudents } from '@gympro/api';

interface Student {
  id: number;
  user: { full_name: string; email: string };
  fitness_goal?: string;
  personal_trainer?: unknown;
  nutritionist?: unknown;
}

const DAYS = [
  { key: 'dom', label: 'Dom' },
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sáb' },
];

const JS_DAY_INDEX = new Date().getDay();

const GOAL_LABEL: Record<string, string> = {
  hipertrofia: 'Hipertrofia',
  emagrecimento: 'Emagrecimento',
  saude: 'Saúde',
  condicionamento: 'Condicionamento',
};

export default function ScheduleProScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyStudents()
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Agenda</Text>

        {/* Week strip (visual only) */}
        <View style={styles.weekRow}>
          {DAYS.map((d, i) => {
            const isToday = i === JS_DAY_INDEX;
            return (
              <View key={d.key} style={[styles.dayCell, isToday && styles.dayCellActive]}>
                <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>{d.label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.comingSoonBanner}>
          <Text style={styles.comingSoonText}>📅 Agendamento integrado — Em breve</Text>
        </View>

        <Text style={styles.sectionTitle}>Seus Alunos ({students.length})</Text>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
        ) : students.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum aluno vinculado ainda.</Text>
        ) : (
          students.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={styles.studentCard}
              onPress={() => router.push(`/student/${student.id}` as any)}
            >
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>
                  {student.user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.user.full_name}</Text>
                <Text style={styles.studentGoal}>
                  {GOAL_LABEL[student.fitness_goal ?? ''] ?? student.fitness_goal ?? '—'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.agendarBtn}
                onPress={() => Alert.alert('Em breve', 'Agendamento integrado em breve.')}
              >
                <Text style={styles.agendarBtnText}>Agendar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Em breve', 'Agendamento integrado em breve.')}
        >
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
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dayCell: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    minWidth: 38,
  },
  dayCellActive: { backgroundColor: Colors.primary },
  dayLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  dayLabelActive: { color: '#fff' },
  comingSoonBanner: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    alignItems: 'center',
  },
  comingSoonText: { color: Colors.textMuted, fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', marginVertical: 16 },
  studentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  studentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  studentInfo: { flex: 1 },
  studentName: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  studentGoal: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  agendarBtn: {
    backgroundColor: Colors.primary + '22',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  agendarBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 12 },
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
