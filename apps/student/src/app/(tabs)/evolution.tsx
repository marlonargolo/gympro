// EvolutionScreen — premium dark UI rewrite
import React from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useStore } from '../../context/StoreContext';
import type { RegistroEvolucao } from '../../data/types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// ─── Line chart (pure View, no SVG) ──────────────────────────────────────────

const CHART_HEIGHT = 130;
const DOT_SIZE = 10;

function WeightChart({ data }: { data: number[] }) {
  if (data.length < 2) {
    return (
      <View style={ch.empty}>
        <Text style={ch.emptyText}>Adicione registros para ver o gráfico</Text>
      </View>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const chartUsable = CHART_HEIGHT - DOT_SIZE * 2;

  const points = data.map((v, i) => ({
    // percent of width (0–100); we'll multiply by (areaWidth/100) at render
    xPct: (i / (data.length - 1)) * 100,
    // y in px (0 = top of chart area, grows downward)
    y: chartUsable - ((v - min) / range) * chartUsable + DOT_SIZE,
  }));

  return (
    <View style={ch.wrapper}>
      {/* Y-axis */}
      <View style={ch.yAxis}>
        <Text style={ch.axisLabel}>{max.toFixed(1)}</Text>
        <Text style={ch.axisLabel}>{min.toFixed(1)}</Text>
      </View>

      {/* Chart area — uses flex:1 so width adapts */}
      <View style={ch.area}>
        {/* Lines between consecutive dots */}
        {points.slice(0, -1).map((pt, i) => {
          const next = points[i + 1];
          const dxPct = next.xPct - pt.xPct;
          const dy = next.y - pt.y;
          // length as percentage string based on percent difference
          const lenPct = Math.sqrt(dxPct * dxPct);
          const angle = Math.atan2(dy, 1) * (180 / Math.PI);
          return (
            <View
              key={`line-${i}`}
              style={[
                ch.line,
                {
                  left: `${pt.xPct}%` as any,
                  top: pt.y,
                  // width as a percentage approximation
                  width: `${lenPct}%` as any,
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: '0% 50%',
                },
              ]}
            />
          );
        })}

        {/* Dots */}
        {points.map((pt, i) => (
          <View
            key={`dot-${i}`}
            style={[
              ch.dot,
              {
                left: `${pt.xPct}%` as any,
                top: pt.y - DOT_SIZE / 2,
                marginLeft: -DOT_SIZE / 2,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Stat mini-card ───────────────────────────────────────────────────────────

function StatCard({
  label, value, valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={stat.card}>
      <Text style={[stat.value, valueColor ? { color: valueColor } : {}]}>{value}</Text>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

// ─── Timeline record card ─────────────────────────────────────────────────────

function RegistroCard({ registro }: { registro: RegistroEvolucao }) {
  return (
    <View style={tl.wrap}>
      {/* Avatar circle */}
      <View style={tl.avatar}>
        <Ionicons name="person" size={24} color={Colors.primary} />
      </View>

      {/* Details */}
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={tl.date}>{formatDate(registro.data)}</Text>
        <View style={tl.metrics}>
          <View style={[tl.badge, { borderColor: Colors.primary + '55' }]}>
            <Ionicons name="scale-outline" size={12} color={Colors.primary} />
            <Text style={[tl.badgeText, { color: Colors.primary }]}>
              {' '}{registro.pesoKg.toFixed(1)} kg
            </Text>
          </View>
          {registro.percentualGordura !== undefined && (
            <View style={[tl.badge, { borderColor: Colors.primary2 + '55' }]}>
              <Ionicons name="body-outline" size={12} color={Colors.primary2} />
              <Text style={[tl.badgeText, { color: Colors.primary2 }]}>
                {' '}{registro.percentualGordura.toFixed(0)}% gordura
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EvolutionScreen() {
  const { evolucao } = useStore();

  const weights = evolucao.map(r => r.pesoKg);
  const reversed = [...evolucao].reverse();

  // Stats calculations
  const pesoAtual = evolucao.length > 0 ? evolucao[evolucao.length - 1].pesoKg : null;
  const pesoInicio = evolucao.length > 0 ? evolucao[0].pesoKg : null;
  const variacao = pesoAtual !== null && pesoInicio !== null ? pesoAtual - pesoInicio : null;

  const variacaoStr =
    variacao === null
      ? '--'
      : variacao > 0
      ? `+${variacao.toFixed(1)}`
      : variacao.toFixed(1);
  const variacaoColor =
    variacao === null
      ? Colors.textSecondary
      : variacao > 0
      ? '#FF5A5A'
      : Colors.success;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── Header ── */}
        <Text style={s.title}>Sua jornada</Text>

        {/* ── Stats row ── */}
        <View style={s.statsRow}>
          <StatCard
            label="Peso atual"
            value={pesoAtual !== null ? `${pesoAtual.toFixed(1)}` : '--'}
          />
          <View style={s.statsDivider} />
          <StatCard label="Variação kg" value={variacaoStr} valueColor={variacaoColor} />
          <View style={s.statsDivider} />
          <StatCard label="Registros" value={String(evolucao.length)} />
        </View>

        {/* ── Chart card ── */}
        <View style={s.chartCard}>
          {/* accent strip */}
          <View style={[s.accentStrip, { backgroundColor: Colors.primary2 }]} />
          <View style={s.chartBody}>
            <Text style={s.chartLabel}>EVOLUÇÃO DE PESO</Text>
            <WeightChart data={weights} />
            {/* X-axis date labels */}
            {evolucao.length >= 2 && (
              <View style={s.xAxis}>
                {evolucao.map(r => (
                  <Text key={r.id} style={s.xLabel}>
                    {formatShortDate(r.data)}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ── Timeline header ── */}
        {reversed.length > 0 && (
          <Text style={s.sectionLabel}>HISTÓRICO</Text>
        )}

        {/* ── Timeline records ── */}
        {reversed.map(registro => (
          <RegistroCard key={registro.id} registro={registro} />
        ))}

        {/* ── Share button ── */}
        <TouchableOpacity style={s.shareBtn} activeOpacity={0.85}>
          <Ionicons name="share-outline" size={18} color="#FFF" />
          <Text style={s.shareBtnText}>Compartilhar no Instagram Stories</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Chart styles ─────────────────────────────────────────────────────────────
const ch = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
    marginTop: 8,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingVertical: 4,
    width: 42,
  },
  axisLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  area: {
    flex: 1,
    position: 'relative',
    height: CHART_HEIGHT,
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    opacity: 0.9,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.primary2,
    borderWidth: 2,
    borderColor: '#FFF',
    // glow
    shadowColor: Colors.primary2,
    shadowRadius: 6,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  empty: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
});

// ─── Stat card styles ─────────────────────────────────────────────────────────
const stat = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});

// ─── Timeline styles ──────────────────────────────────────────────────────────
const tl = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: '#000',
    shadowRadius: 6,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  date: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.glassBackground,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36, gap: 14 },

  title: { fontSize: 26, fontWeight: '800', color: Colors.text },

  // Stats row
  statsRow: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  statsDivider: {
    width: 1,
    backgroundColor: Colors.glassBorder,
    alignSelf: 'stretch',
    marginVertical: 12,
  },

  // Chart card
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowColor: Colors.primary2,
    shadowRadius: 18,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  accentStrip: {
    height: 3,
    width: '100%',
  },
  chartBody: {
    padding: 18,
    gap: 4,
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingLeft: 42,
  },
  xLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontWeight: '500',
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 2,
    marginBottom: -2,
  },

  // Share button
  shareBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowRadius: 18,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  shareBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
