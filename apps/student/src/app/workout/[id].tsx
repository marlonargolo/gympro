// WorkoutDetailView + WorkoutSessionView — faithful port of Views/Workout/WorkoutDetailView.swift
import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, Modal, SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useStore } from '../../context/StoreContext';
import { metodoTreinamentoInfo } from '../../data/types';
import type { Treino, WatchNotification } from '../../data/types';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { treinos, addWatchNotification } = useStore();
  const [sessionOpen, setSessionOpen] = useState(false);

  const treino = treinos.find(t => t.id === id);
  if (!treino) {
    return (
      <View style={s.center}>
        <Text style={{ color: Colors.textSecondary }}>Treino não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Info section */}
      <View style={s.card}>
        <InfoRow icon="time" text={`${treino.duracaoEstimadaMin} min estimados`} />
        <InfoRow icon="stats-chart" text={treino.nivel} />
        <TouchableOpacity onPress={() => router.navigate('/music')} style={s.infoRow}>
          <Ionicons name="musical-notes" size={18} color={Colors.primary} />
          <Text style={s.infoLink}>Tocar música durante o treino</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Exercises */}
      <Text style={s.sectionTitle}>Exercícios</Text>
      <View style={s.card}>
        {treino.exercicios.map((ex, idx) => (
          <View key={ex.id} style={[s.exRow, idx < treino.exercicios.length - 1 && s.exBorder]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.exName}>{ex.nome}</Text>
              <Text style={s.exSub}>{ex.grupoMuscular} · {ex.series}x{ex.repeticoes}</Text>
              {ex.metodo && (
                <TouchableOpacity
                  onPress={() => router.navigate('/training-methods')}
                  style={s.metodoBadge}
                >
                  <Text style={s.metodoText}>{metodoTreinamentoInfo[ex.metodo]?.titulo}</Text>
                </TouchableOpacity>
              )}
              {ex.observacoes && (
                <Text style={s.obs}>{ex.observacoes}</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Start workout */}
      <TouchableOpacity style={s.startBtn} onPress={() => setSessionOpen(true)} activeOpacity={0.8}>
        <Ionicons name="play" size={18} color="#FFF" />
        <Text style={s.startText}> Iniciar treino</Text>
      </TouchableOpacity>

      <WorkoutSession
        treino={treino}
        visible={sessionOpen}
        onClose={() => setSessionOpen(false)}
        onNotify={addWatchNotification}
      />
    </ScrollView>
  );
}

function InfoRow({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon} size={18} color={Colors.textSecondary} />
      <Text style={s.infoText}>{text}</Text>
    </View>
  );
}

function WorkoutSession({
  treino, visible, onClose, onNotify,
}: {
  treino: Treino;
  visible: boolean;
  onClose: () => void;
  onNotify: (n: WatchNotification) => void;
}) {
  const [indice, setIndice] = useState(0);

  function avancar() {
    const ex = treino.exercicios[indice];
    onNotify({
      id: Date.now().toString(),
      titulo: 'Série concluída 💪',
      corpo: `${ex.nome} — próxima em breve`,
      data: new Date(),
    });
    if (indice < treino.exercicios.length - 1) {
      setIndice(i => i + 1);
    } else {
      setIndice(treino.exercicios.length);
      onNotify({ id: Date.now().toString() + 'f', titulo: 'Treino finalizado 🎉', corpo: treino.titulo, data: new Date() });
    }
  }

  const done = indice >= treino.exercicios.length;
  const ex = done ? null : treino.exercicios[indice];

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={[sess.safe, { backgroundColor: Colors.background }]}>
        <View style={sess.header}>
          <Text style={sess.headerTitle}>
            {done ? 'Concluído!' : `Exercício ${indice + 1}/${treino.exercicios.length}`}
          </Text>
          <TouchableOpacity onPress={() => { setIndice(0); onClose(); }}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={sess.body}>
          {done ? (
            <>
              <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
              <Text style={sess.doneTitle}>Treino concluído!</Text>
              <Text style={sess.doneSub}>Notificação enviada ao relógio (simulada).</Text>
              <TouchableOpacity style={sess.btn} onPress={() => { setIndice(0); onClose(); }}>
                <Text style={sess.btnText}>Fechar</Text>
              </TouchableOpacity>
            </>
          ) : ex ? (
            <>
              <Text style={sess.exName}>{ex.nome}</Text>
              <Text style={sess.exSets}>{ex.series}x{ex.repeticoes}</Text>
              {ex.metodo && (
                <Text style={sess.metodo}>{metodoTreinamentoInfo[ex.metodo]?.titulo}</Text>
              )}
              <TouchableOpacity style={sess.btn} onPress={avancar}>
                <Text style={sess.btnText}>Concluir série</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 18, gap: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.glassBorder, gap: 12,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, color: Colors.textSecondary },
  infoLink: { fontSize: 14, color: Colors.primary, flex: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  exRow: { paddingVertical: 8, gap: 6 },
  exBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 12, marginBottom: 4 },
  exName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  exSub: { fontSize: 13, color: Colors.textSecondary },
  metodoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '22',
    borderRadius: 100,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  metodoText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  obs: { fontSize: 12, color: Colors.textTertiary, fontStyle: 'italic' },
  startBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, padding: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  startText: { color: '#FFF', fontWeight: '700', fontSize: 17 },
});

const sess = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 18,
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  body: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 32, gap: 16,
  },
  exName: { fontSize: 32, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  exSets: { fontSize: 20, color: Colors.textSecondary },
  metodo: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  doneTitle: { fontSize: 28, fontWeight: '700', color: Colors.text },
  doneSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  btn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 16,
    marginTop: 8,
  },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 17 },
});
