import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { MOCK_PROFESSIONALS, MOCK_STUDENTS } from '@gympro/shared';
import type { Student } from '@gympro/shared';

const PRO = MOCK_PROFESSIONALS[0];

const GOAL_LABEL: Record<Student['goal'], string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  endurance: 'Resistência',
  flexibility: 'Flexibilidade',
  health: 'Saúde',
};

const LEVEL_LABEL: Record<Student['level'], string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

const LEVEL_COLOR: Record<Student['level'], string> = {
  beginner: Colors.success,
  intermediate: Colors.warning,
  advanced: Colors.danger,
};

export default function StudentsScreen() {
  const [search, setSearch] = useState('');

  const myStudents = MOCK_STUDENTS.filter((s) =>
    PRO.studentIds.includes(s.id)
  );

  const filtered = myStudents.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Alunos</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar aluno..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        <Text style={styles.count}>{filtered.length} aluno{filtered.length !== 1 ? 's' : ''}</Text>

        {filtered.map((student) => {
          const latest = student.metrics[student.metrics.length - 1];
          const prev = student.metrics[student.metrics.length - 2];
          const weightDelta = prev ? latest.weight - prev.weight : null;

          return (
            <TouchableOpacity
              key={student.id}
              style={styles.card}
              onPress={() => router.push(`/student/${student.id}` as any)}
            >
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{student.name}</Text>
                  <Text style={styles.cardEmail}>{student.email}</Text>
                </View>
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: LEVEL_COLOR[student.level] + '22' },
                  ]}
                >
                  <Text style={[styles.levelText, { color: LEVEL_COLOR[student.level] }]}>
                    {LEVEL_LABEL[student.level]}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardBottom}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Objetivo</Text>
                  <Text style={styles.metricValue}>{GOAL_LABEL[student.goal]}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Peso atual</Text>
                  <Text style={styles.metricValue}>{latest.weight} kg</Text>
                </View>
                {weightDelta !== null && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Variação</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: weightDelta <= 0 ? Colors.success : Colors.danger },
                      ]}
                    >
                      {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
                    </Text>
                  </View>
                )}
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Plano</Text>
                  <Text style={[styles.metricValue, student.plan === 'pro' && { color: Colors.warning }]}>
                    {student.plan === 'pro' ? 'Pro ⭐' : 'Free'}
                  </Text>
                </View>
              </View>

              <View style={styles.profsRow}>
                {student.personalId && (
                  <View style={styles.profChip}>
                    <Text style={styles.profChipText}>💪 Personal</Text>
                  </View>
                )}
                {student.nutritionistId && (
                  <View style={[styles.profChip, { borderColor: Colors.secondary + '66' }]}>
                    <Text style={[styles.profChipText, { color: Colors.secondary }]}>
                      🥗 Nutrição
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Adicionar Aluno</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 16 },
  pageTitle: { fontSize: 26, fontWeight: '700', color: Colors.text, marginTop: 24, marginBottom: 16 },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  count: { color: Colors.textMuted, fontSize: 13, marginBottom: 12 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cardInfo: { flex: 1 },
  cardName: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  cardEmail: { color: Colors.textMuted, fontSize: 12, marginTop: 1 },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelText: { fontSize: 11, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  metricItem: { alignItems: 'center' },
  metricLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 2 },
  metricValue: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  profsRow: { flexDirection: 'row', gap: 8 },
  profChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '66',
  },
  profChipText: { color: Colors.primary, fontSize: 11, fontWeight: '600' },
  addButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  addButtonText: { color: Colors.primary, fontWeight: '600', fontSize: 16 },
});
