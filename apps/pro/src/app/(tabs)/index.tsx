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
import {
  MOCK_PROFESSIONALS,
  MOCK_STUDENTS,
  MOCK_WORKOUT_LOGS,
  MOCK_CONVERSATIONS,
} from '@gympro/shared';

const PRO = MOCK_PROFESSIONALS[0];

export default function DashboardScreen() {
  const myStudents = MOCK_STUDENTS.filter((s) =>
    PRO.studentIds.includes(s.id)
  );

  const todayLogs = MOCK_WORKOUT_LOGS.filter(
    (l) =>
      PRO.studentIds.includes(l.studentId) &&
      new Date(l.date).toDateString() === new Date().toDateString()
  );

  const unreadConvs = MOCK_CONVERSATIONS.filter(
    (c) =>
      c.participantIds.includes(PRO.id) &&
      c.lastMessage &&
      c.lastMessage.senderId !== PRO.id
  );

  const stats = [
    { label: 'Alunos ativos', value: String(myStudents.length), icon: '👥', color: Colors.primary },
    { label: 'Treinos hoje', value: String(todayLogs.length), icon: '🔥', color: Colors.secondary },
    { label: 'Mensagens', value: String(unreadConvs.length), icon: '💬', color: Colors.warning },
    { label: 'Este mês', value: '18', icon: '📅', color: Colors.primary },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {PRO.name.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>
              {PRO.specialty === 'both' ? 'Personal & Nutricionista' : 'Personal Trainer'}
            </Text>
          </View>
          <View style={styles.crefBadge}>
            <Text style={styles.crefText}>CREF</Text>
          </View>
        </View>

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
        {myStudents.map((student) => {
          const latest = student.metrics[student.metrics.length - 1];
          const prev = student.metrics[student.metrics.length - 2];
          const weightDelta = prev ? latest.weight - prev.weight : 0;

          return (
            <TouchableOpacity
              key={student.id}
              style={styles.studentCard}
              onPress={() => router.push(`/student/${student.id}` as any)}
            >
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>
                  {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentMeta}>
                  {student.goal === 'hypertrophy' ? 'Hipertrofia' :
                   student.goal === 'weight_loss' ? 'Emagrecimento' : 'Saúde'} ·{' '}
                  {student.level === 'beginner' ? 'Iniciante' :
                   student.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                </Text>
              </View>
              <View style={styles.weightDelta}>
                <Text style={[
                  styles.deltaValue,
                  { color: weightDelta <= 0 ? Colors.success : Colors.danger }
                ]}>
                  {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
                </Text>
                <Text style={styles.deltaLabel}>vs anterior</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionTitle}>Mensagens Recentes</Text>
        {MOCK_CONVERSATIONS.filter((c) => c.participantIds.includes(PRO.id)).map((conv) => {
          const student = MOCK_STUDENTS.find((s) => conv.participantIds.includes(s.id));
          return (
            <TouchableOpacity key={conv.id} style={styles.messageCard}>
              <View style={styles.msgAvatar}>
                <Text style={styles.msgAvatarText}>
                  {student?.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </Text>
              </View>
              <View style={styles.msgContent}>
                <Text style={styles.msgSender}>{student?.name}</Text>
                <Text style={styles.msgText} numberOfLines={1}>
                  {conv.lastMessage?.text}
                </Text>
              </View>
              {conv.lastMessage?.senderId !== PRO.id && (
                <View style={styles.unreadDot} />
              )}
            </TouchableOpacity>
          );
        })}
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
  weightDelta: { alignItems: 'flex-end' },
  deltaValue: { fontWeight: '700', fontSize: 15 },
  deltaLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 1 },
  messageCard: {
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
  msgAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: { color: Colors.text, fontWeight: '700', fontSize: 13 },
  msgContent: { flex: 1 },
  msgSender: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  msgText: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
