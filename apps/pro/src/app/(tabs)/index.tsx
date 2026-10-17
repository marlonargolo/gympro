import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { getMe, getMyStudents } from '@gympro/api';

interface ProUser {
  full_name: string;
  professional_profile?: {
    is_personal_trainer?: boolean;
    is_nutritionist?: boolean;
    cref?: string;
    crn?: string;
  };
}

interface Student {
  id: number;
  user: { full_name: string; email: string };
  fitness_goal?: string;
  personal_trainer?: unknown;
  nutritionist?: unknown;
}

const GOAL_LABEL: Record<string, string> = {
  hipertrofia: 'Hipertrofia',
  emagrecimento: 'Emagrecimento',
  saude: 'Saúde',
  condicionamento: 'Condicionamento',
};

export default function DashboardScreen() {
  const [user, setUser] = useState<ProUser | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [me, studs] = await Promise.all([getMe(), getMyStudents()]);
        setUser(me);
        setStudents(Array.isArray(studs) ? studs : []);
      } catch {
        // ignore — show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const prof = user?.professional_profile;
  const firstName = user?.full_name?.split(' ')[0] ?? 'Pro';
  const specialty = prof?.is_personal_trainer && prof?.is_nutritionist
    ? 'Personal & Nutricionista'
    : prof?.is_nutritionist
    ? 'Nutricionista'
    : 'Personal Trainer';

  const stats = [
    { label: 'Alunos ativos', value: String(students.length), icon: '👥', color: Colors.primary },
    { label: 'Treinos hoje', value: '0', icon: '🔥', color: Colors.secondary },
    { label: 'Mensagens', value: '0', icon: '💬', color: Colors.warning },
    { label: 'Este mês', value: '—', icon: '📅', color: Colors.primary },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {firstName} 👋</Text>
            <Text style={styles.subtitle}>{specialty}</Text>
          </View>
          {(prof?.cref || prof?.crn) && (
            <View style={styles.crefBadge}>
              <Text style={styles.crefText}>{prof.cref ? 'CREF' : 'CRN'}</Text>
            </View>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              {stats.map((s) => (
                <View key={s.label} style={[styles.statCard, { borderLeftColor: s.color }]}>
                  <Text style={styles.statIcon}>{s.icon}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Alunos — Visão Geral</Text>
            {students.length === 0 && (
              <Text style={styles.emptyText}>Nenhum aluno vinculado ainda.</Text>
            )}
            {students.map((student) => (
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
                  <Text style={styles.studentMeta}>
                    {GOAL_LABEL[student.fitness_goal ?? ''] ?? student.fitness_goal ?? '—'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 24,
    marginBottom: 20,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 2 },
  crefBadge: {
    backgroundColor: Colors.primary + '22',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  crefText: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
  },
  statIcon: { fontSize: 20, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', marginVertical: 16 },
  studentCard: {
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
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  studentInfo: { flex: 1 },
  studentName: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  studentMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  chevron: { fontSize: 22, color: Colors.textMuted },
});
