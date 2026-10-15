// WorkoutDetailView + WorkoutSessionView — premium dark UI rewrite
import React, { useState } from 'react';
import {
  FlatList, View, Text, TouchableOpacity, StyleSheet, Modal, SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useStore } from '../../context/StoreContext';
import { metodoTreinamentoInfo } from '../../data/types';
import type { Treino, Exercicio, WatchNotification } from '../../data/types';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { treinos, addWatchNotification } = useStore();
  const [sessionOpen, setSessionOpen] = useState(false);

  const treino = treinos.find(t => t.id === id);

  if (!treino) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Ionicons name="alert-circle-outline" size={52} color={Colors.textTertiary} />
          <Text style={s.notFoundText}>Treino não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ListHeader = (
    <>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{treino.titulo}</Text>
        </View>
        <View style={s.durationBadge}>
          <Ionicons name="time" size={12} color={Colors.primary2} />
          <Text style={s.durationBadgeText}>{treino.duracaoEstimadaMin}min</Text>
        </View>
      </View>

      {/* ── Stat chips row ── */}
      <View style={s.statsRow}>
        <StatChip label="DURAÇÃO" value={`${treino.duracaoEstimadaMin} min`} icon="time-outline" />
        <StatChip label="NÍVEL" value={treino.nivel} icon="stats-chart-outline" />
        <StatChip label="EXERCÍCIOS" value={`${treino.exercicios.length}`} icon="barbell-outline" />
      </View>

      {/* ── Section label ── */}
      <Text style={s.sectionLabel}>EXERCÍCIOS</Text>
    </>
  );

  return (
    <SafeAreaView style={s.safe}>
      <FlatList<Exercicio>
        data={treino.exercicios}
        keyExtractor={(ex: Exercicio) => ex.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        renderItem={({ item: ex, index }: { item: Exercicio; index: number }) => (
          <ExercicioCard ex={ex} index={index} />
        )}
        ListFooterComponent={
          <>
            {/* ── Start button ── */}
            <TouchableOpacity
              style={s.startBtn}
              onPress={() => setSessionOpen(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={20} color="#FFF" />
              <Text style={s.startText}>Iniciar treino</Text>
            </TouchableOpacity>
            <View style={{ height: 32 }} />
          </>
        }
      />

      <WorkoutSession
        treino={treino}
        visible={sessionOpen}
        onClose={() => setSessionOpen(false)}
        onNotify={addWatchNotification}
      />
    </SafeAreaView>
  );
}

// ─── ExercicioCard ────────────────────────────────────────────────────────────

function ExercicioCard({ ex, index }: { ex: Exercicio; index: number }) {
  const metodoInfo = ex.metodo ? metodoTreinamentoInfo[ex.metodo] : null;
  return (
    <View style={c.card}>
      <View style={c.cardTop}>
        <View style={c.indexBadge}>
          <Text style={c.indexText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={c.exName}>{ex.nome}</Text>
          <Text style={c.exMuscle}>{ex.grupoMuscular}</Text>
        </View>
      </View>
      <View style={c.pillsRow}>
        <View style={c.infoPill}>
          <Text style={c.infoPillLabel}>Séries</Text>
          <Text style={c.infoPillValue}>{ex.series}</Text>
        </View>
        <View style={c.infoPill}>
          <Text style={c.infoPillLabel}>Reps</Text>
          <Text style={c.infoPillValue}>{ex.repeticoes}</Text>
        </View>
        {metodoInfo && (
          <View style={c.metodoBadge}>
            <Text style={c.metodoText}>{metodoInfo.titulo.toUpperCase()}</Text>
          </View>
        )}
      </View>
      {ex.observacoes ? (
        <Text style={c.obs}>{ex.observacoes}</Text>
      ) : null}
    </View>
  );
}

// ─── StatChip ─────────────────────────────────────────────────────────────────

function StatChip({ label, value, icon }: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View style={s.statChip}>
      <Ionicons name={icon} size={14} color={Colors.textTertiary} />
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
    </View>
  );
}

// ─── WorkoutSession Modal ─────────────────────────────────────────────────────

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
      onNotify({
        id: Date.now().toString() + 'f',
        titulo: 'Treino finalizado 🎉',
        corpo: treino.titulo,
        data: new Date(),
      });
    }
  }

  function fechar() {
    setIndice(0);
    onClose();
  }

  const done = indice >= treino.exercicios.length;
  const ex = done ? null : treino.exercicios[indice];
  const metodoInfo = ex?.metodo ? metodoTreinamentoInfo[ex.metodo] : null;

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={ws.safe}>
        {/* Header */}
        <View style={ws.header}>
          {done ? (
            <Text style={ws.headerLabel}>Sessão completa</Text>
          ) : (
            <Text style={ws.headerLabel}>
              Exercício {indice + 1} / {treino.exercicios.length}
            </Text>
          )}
          <TouchableOpacity onPress={fechar} style={ws.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        {!done && (
          <View style={ws.progressTrack}>
            <View
              style={[
                ws.progressFill,
                { width: `${((indice) / treino.exercicios.length) * 100}%` },
              ]}
            />
          </View>
        )}

        {/* Body */}
        <View style={ws.body}>
          {done ? (
            // ── Completion screen ──
            <View style={ws.doneContainer}>
              <Text style={ws.trophy}>🏆</Text>
              <Text style={ws.doneTitle}>Treino concluído!</Text>
              <Text style={ws.doneSub}>{treino.titulo}</Text>
              <Text style={ws.doneDetail}>
                {treino.exercicios.length} exercícios completados
              </Text>
              <TouchableOpacity style={ws.btn} onPress={fechar} activeOpacity={0.85}>
                <Text style={ws.btnText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          ) : ex ? (
            // ── Exercise screen ──
            <View style={ws.exContainer}>
              <View style={ws.exIndexRow}>
                <Text style={ws.exIndex}>{indice + 1}</Text>
                <Text style={ws.exIndexOf}>/{treino.exercicios.length}</Text>
              </View>
              <Text style={ws.exName}>{ex.nome}</Text>
              <Text style={ws.exMuscle}>{ex.grupoMuscular}</Text>

              <View style={ws.setsRow}>
                <View style={ws.setChip}>
                  <Text style={ws.setChipLabel}>SÉRIES</Text>
                  <Text style={ws.setChipValue}>{ex.series}</Text>
                </View>
                <View style={ws.setDivider} />
                <View style={ws.setChip}>
                  <Text style={ws.setChipLabel}>REPS</Text>
                  <Text style={ws.setChipValue}>{ex.repeticoes}</Text>
                </View>
              </View>

              {metodoInfo && (
                <View style={ws.metodoBadge}>
                  <Text style={ws.metodoText}>{metodoInfo.titulo}</Text>
                </View>
              )}

              <TouchableOpacity style={ws.btn} onPress={avancar} activeOpacity={0.85}>
                <Text style={ws.btnText}>
                  {indice < treino.exercicios.length - 1 ? 'Próximo' : 'Finalizar'}
                </Text>
                <Ionicons
                  name={indice < treino.exercicios.length - 1 ? 'arrow-forward' : 'checkmark'}
                  size={18}
                  color="#FFF"
                />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },

  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 16,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  durationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary2 + '20', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  durationBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.primary2 },

  statsRow: {
    flexDirection: 'row', gap: 8, marginBottom: 20,
  },
  statChip: {
    flex: 1, backgroundColor: Colors.surfaceElevated, borderRadius: 12,
    padding: 12, gap: 3, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  statLabel: { fontSize: 10, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.8 },
  statValue: { fontSize: 14, fontWeight: '700', color: Colors.text },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textTertiary,
    letterSpacing: 1.2, marginBottom: 10,
  },

  startBtn: {
    height: 56, backgroundColor: Colors.primary, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 16,
    shadowColor: Colors.primary, shadowRadius: 16, shadowOpacity: 0.3, elevation: 8,
  },
  startText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});

const c = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.glassBorder, gap: 8, marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  indexBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  indexText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  exName: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  exMuscle: { fontSize: 12, color: Colors.textSecondary },
  pillsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', paddingLeft: 30 },
  infoPill: {
    backgroundColor: Colors.surfaceElevated, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    alignItems: 'center',
  },
  infoPillLabel: { fontSize: 9, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.6 },
  infoPillValue: { fontSize: 13, fontWeight: '700', color: Colors.text },
  metodoBadge: {
    backgroundColor: Colors.accent + '22', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  metodoText: { fontSize: 10, fontWeight: '700', color: Colors.accent, letterSpacing: 0.4 },
  obs: { fontSize: 12, color: Colors.textTertiary, fontStyle: 'italic', paddingLeft: 30 },
});

const ws = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  headerLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.glassBorder,
  },

  progressTrack: {
    height: 3, backgroundColor: Colors.surfaceElevated, marginHorizontal: 20,
  },
  progressFill: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },

  body: { flex: 1, paddingHorizontal: 24 },

  exContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  exIndexRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  exIndex: { fontSize: 56, fontWeight: '800', color: Colors.primary, lineHeight: 64 },
  exIndexOf: { fontSize: 22, fontWeight: '600', color: Colors.textTertiary },
  exName: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  exMuscle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center' },

  setsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.glassBorder,
    gap: 24,
  },
  setChip: { alignItems: 'center', gap: 4 },
  setChipLabel: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 1 },
  setChipValue: { fontSize: 36, fontWeight: '800', color: Colors.text },
  setDivider: { width: 1, height: 40, backgroundColor: Colors.glassBorder },

  metodoBadge: {
    backgroundColor: Colors.accent + '22', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  metodoText: { fontSize: 13, fontWeight: '700', color: Colors.accent },

  btn: {
    width: '100%', height: 56, backgroundColor: Colors.primary, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowRadius: 16, shadowOpacity: 0.3, elevation: 8,
    marginTop: 8,
  },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 17 },

  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  trophy: { fontSize: 72 },
  doneTitle: { fontSize: 32, fontWeight: '800', color: Colors.text },
  doneSub: { fontSize: 17, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  doneDetail: { fontSize: 14, color: Colors.textTertiary },
});
