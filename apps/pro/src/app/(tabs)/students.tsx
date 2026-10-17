import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { getMyStudents, createInviteCode } from '@gympro/api';
import { Colors } from '../../constants/colors';

interface StudentItem {
  id: number;
  user: { full_name: string; email: string; phone?: string };
  modalidade?: string;
  fitness_goal?: string;
  connection_type?: string;
}

const GOAL_LABEL: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  endurance: 'Resistência',
  flexibility: 'Flexibilidade',
  health: 'Saúde',
};

const MODAL_LABEL: Record<string, string> = {
  musculacao: 'Musculação',
  crossfit: 'CrossFit',
  running: 'Corrida',
  swimming: 'Natação',
  cycling: 'Ciclismo',
  yoga: 'Yoga',
  pilates: 'Pilates',
  football: 'Futebol',
};

export default function StudentsScreen() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      const data = await getMyStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os alunos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadStudents(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStudents();
  }, [loadStudents]);

  async function handleGenerateInvite() {
    setInviteLoading(true);
    try {
      const result = await createInviteCode('personal_trainer');
      Alert.alert(
        'Código de Convite',
        `Compartilhe este código com seu aluno:\n\n${result.code}`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Não foi possível gerar o código.';
      Alert.alert('Erro', msg);
    } finally {
      setInviteLoading(false);
    }
  }

  const filtered = students.filter((s) =>
    s.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={styles.pageTitle}>Alunos</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar aluno..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        <Text style={styles.count}>
          {filtered.length} aluno{filtered.length !== 1 ? 's' : ''}
        </Text>

        {filtered.map((student) => {
          const initials = student.user.full_name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <TouchableOpacity
              key={student.id}
              style={styles.card}
              onPress={() => router.push(`/student/${student.id}` as any)}
            >
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{student.user.full_name}</Text>
                  <Text style={styles.cardEmail}>{student.user.email}</Text>
                </View>
                {student.connection_type && (
                  <View style={[
                    styles.typeBadge,
                    student.connection_type === 'nutritionist' && { borderColor: Colors.secondary + '66' },
                  ]}>
                    <Text style={[
                      styles.typeText,
                      student.connection_type === 'nutritionist' && { color: Colors.secondary },
                    ]}>
                      {student.connection_type === 'nutritionist' ? '🥗 Nutrição' : '💪 Personal'}
                    </Text>
                  </View>
                )}
              </View>

              {(student.fitness_goal || student.modalidade) && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.cardBottom}>
                    {student.fitness_goal && (
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Objetivo</Text>
                        <Text style={styles.metricValue}>
                          {GOAL_LABEL[student.fitness_goal] || student.fitness_goal}
                        </Text>
                      </View>
                    )}
                    {student.modalidade && (
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Modalidade</Text>
                        <Text style={styles.metricValue}>
                          {MODAL_LABEL[student.modalidade] || student.modalidade}
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {search ? 'Nenhum aluno encontrado.' : 'Você ainda não tem alunos vinculados.'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleGenerateInvite}
          disabled={inviteLoading}
        >
          {inviteLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={styles.addButtonText}>+ Gerar Código de Convite</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '66',
  },
  typeText: { color: Colors.primary, fontSize: 11, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  cardBottom: { flexDirection: 'row', gap: 24 },
  metricItem: {},
  metricLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 2 },
  metricValue: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: Colors.textMuted, fontSize: 15, textAlign: 'center' },
  addButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: { color: Colors.primary, fontWeight: '600', fontSize: 16 },
});
