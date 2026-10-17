import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { getWorkouts, createWorkout } from '@gympro/api';

interface Workout {
  id: string;
  titulo: string;
  descricao?: string;
  exercicios: unknown[];
  duracao_estimada_min?: number;
  assigned_to?: { id: number; user: { full_name: string } } | null;
}

export default function WorkoutsProScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await getWorkouts();
      setWorkouts(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!titulo.trim()) { Alert.alert('Título obrigatório'); return; }
    setSaving(true);
    try {
      await createWorkout({ titulo: titulo.trim(), descricao: descricao.trim() });
      setTitulo('');
      setDescricao('');
      setShowModal(false);
      setLoading(true);
      await load();
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o treino.');
    } finally {
      setSaving(false);
    }
  }

  const assigned = workouts.filter((w) => !!w.assigned_to);
  const templates = workouts.filter((w) => !w.assigned_to);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Treinos</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.newBtnText}>+ Novo</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Atribuídos a Alunos ({assigned.length})</Text>
            {assigned.length === 0 && (
              <Text style={styles.emptyText}>Nenhum treino atribuído.</Text>
            )}
            {assigned.map((w) => (
              <TouchableOpacity
                key={w.id}
                style={styles.card}
                onPress={() => router.push(`/workout/${w.id}` as any)}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.cardName}>{w.titulo}</Text>
                  <Text style={styles.cardMeta}>
                    {w.exercicios.length} exercício{w.exercicios.length !== 1 ? 's' : ''}
                    {w.duracao_estimada_min ? ` · ${w.duracao_estimada_min} min` : ''}
                  </Text>
                  {w.assigned_to && (
                    <Text style={styles.assignedTo}>→ {w.assigned_to.user.full_name}</Text>
                  )}
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}

            {templates.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Templates ({templates.length})</Text>
                {templates.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    style={styles.card}
                    onPress={() => router.push(`/workout/${w.id}` as any)}
                  >
                    <View style={styles.cardLeft}>
                      <Text style={styles.cardName}>{w.titulo}</Text>
                      <Text style={styles.cardMeta}>
                        {w.exercicios.length} exercício{w.exercicios.length !== 1 ? 's' : ''}
                        {w.duracao_estimada_min ? ` · ${w.duracao_estimada_min} min` : ''}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
              <Text style={styles.addButtonText}>+ Criar Treino</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={modal.container}>
          <View style={modal.header}>
            <Text style={modal.title}>Novo Treino</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={modal.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={modal.label}>TÍTULO</Text>
          <TextInput
            style={modal.input}
            placeholder="Ex: Treino A — Peito e Tríceps"
            placeholderTextColor={Colors.textMuted}
            value={titulo}
            onChangeText={setTitulo}
          />
          <Text style={modal.label}>DESCRIÇÃO (opcional)</Text>
          <TextInput
            style={[modal.input, { height: 80 }]}
            placeholder="Descrição do treino..."
            placeholderTextColor={Colors.textMuted}
            value={descricao}
            onChangeText={setDescricao}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[modal.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={saving}
          >
            <Text style={modal.saveBtnText}>{saving ? 'Criando...' : 'Criar Treino'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10, marginTop: 4 },
  emptyText: { color: Colors.textMuted, fontSize: 14, marginBottom: 12 },
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
  cardMeta: { color: Colors.textMuted, fontSize: 12, marginBottom: 4 },
  assignedTo: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
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

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text },
  close: { fontSize: 20, color: Colors.textMuted, padding: 4 },
  label: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
