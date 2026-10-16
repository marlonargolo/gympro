// EvolutionScreen — premium dark UI with proper line chart
import React, { useState } from 'react';
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

// ─── Line chart (View-based, works on web and native) ─────────────────────────

const CHART_HEIGHT = 160;
const DOT_SIZE = 10;
const LINE_H = 2.5;

function SimpleLineChart({
  data,
  dates,
}: {
  data: number[];
  dates: string[];
}) {
  const [areaWidth, setAreaWidth] = useState(0);

  if (data.length < 2) {
    return (
      <View style={ch.empty}>
        <Ionicons name="stats-chart-outline" size={28} color={Colors.textTertiary} />
        <Text style={ch.emptyText}>Adicione mais registros para ver o gráfico</Text>
      </View>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const usableH = CHART_HEIGHT - DOT_SIZE * 2;

  const getY = (v: number) =>
    usableH - ((v - min) / range) * usableH + DOT_SIZE;

  const getX = (i: number, w: number) =>
    data.length === 1 ? w / 2 : (i / (data.length - 1)) * w;

  return (
    <View style={ch.outerRow}>
      {/* Y-axis labels */}
      <View style={ch.yAxis}>
        <Text style={ch.axisLabel}>{max.toFixed(1)}</Text>
        <Text style={ch.axisLabel}>{((max + min) / 2).toFixed(1)}</Text>
        <Text style={ch.axisLabel}>{min.toFixed(1)}</Text>
      </View>

      {/* Chart area */}
      <View style={ch.areaOuter}>
        <View
          style={ch.area}
          onLayout={(e) => setAreaWidth(e.nativeEvent.layout.width)}
        >
          {/* Subtle horizontal grid lines at 0%, 50%, 100% */}
          {[0, 0.5, 1].map((pct) => (
            <View
              key={`grid-${pct}`}
              style={[
                ch.gridLine,
                { top: pct * usableH + DOT_SIZE },
              ]}
            />
          ))}

          {/* Connecting line segments */}
          {areaWidth > 0 &&
            data.slice(0, -1).map((v, i) => {
              const x1 = getX(i, areaWidth);
              const y1 = getY(v);
              const x2 = getX(i + 1, areaWidth);
              const y2 = getY(data[i + 1]);
              const dx = x2 - x1;
              const dy = y2 - y1;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <View
                  key={`seg-${i}`}
                  style={[
                    ch.segment,
                    {
                      left: midX - length / 2,
                      top: midY - LINE_H / 2,
                      width: length,
                      transform: [{ rotate: `${angle}deg` }],
                    },
                  ]}
                />
              );
            })}

          {/* Dots at each data point */}
          {areaWidth > 0 &&
            data.map((v, i) => {
              const x = getX(i, areaWidth);
              const y = getY(v);
              const isLatest = i === data.length - 1;
              return (
                <View
                  key={`dot-${i}`}
                  style={[
                    ch.dot,
                    isLatest ? ch.dotLatest : ch.dotNormal,
                    {
                      left: x - DOT_SIZE / 2,
                      top: y - DOT_SIZE / 2,
                    },
                  ]}
                />
              );
            })}
        </View>

        {/* X-axis date labels */}
        {dates.length >= 2 && (
          <View style={ch.xAxisRow}>
            {dates.map((d, i) => (
              <Text key={`xl-${i}`} style={ch.xLabel}>
                {d}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  valueColor,
  accentColor,
  icon,
}: {
  label: string;
  value: string;
  valueColor?: string;
  accentColor?: string;
  icon: string;
}) {
  const accent = accentColor ?? Colors.accent;
  return (
    <View style={[stat.card, { borderTopColor: accent }]}>
      <View style={[stat.iconWrap, { backgroundColor: accent + '20' }]}>
        <Ionicons name={icon as any} size={14} color={accent} />
      </View>
      <Text style={[stat.value, { color: valueColor ?? Colors.text }]}>
        {value}
      </Text>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

// ─── Timeline record card ─────────────────────────────────────────────────────

function RegistroCard({ registro }: { registro: RegistroEvolucao }) {
  return (
    <View style={tl.wrap}>
      {/* Avatar circle with weight */}
      <View style={tl.avatar}>
        <Text style={tl.avatarNum}>{registro.pesoKg.toFixed(0)}</Text>
        <Text style={tl.avatarUnit}>kg</Text>
      </View>

      {/* Details */}
      <View style={tl.details}>
        <Text style={tl.date}>{formatDate(registro.data)}</Text>
        <View style={tl.badges}>
          <View style={[tl.badge, { backgroundColor: Colors.primary + '18', borderColor: Colors.primary + '40' }]}>
            <Ionicons name="scale-outline" size={11} color={Colors.primary} />
            <Text style={[tl.badgeText, { color: Colors.primary }]}>
              {registro.pesoKg.toFixed(1)} kg
            </Text>
          </View>
          {registro.percentualGordura !== undefined && (
            <View style={[tl.badge, { backgroundColor: Colors.primary2 + '18', borderColor: Colors.primary2 + '40' }]}>
              <Ionicons name="body-outline" size={11} color={Colors.primary2} />
              <Text style={[tl.badgeText, { color: Colors.primary2 }]}>
                {registro.percentualGordura.toFixed(0)}% gordura
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
  const dates = evolucao.map(r => formatShortDate(r.data));
  const reversed = [...evolucao].reverse();

  const pesoAtual = evolucao.length > 0 ? evolucao[evolucao.length - 1].pesoKg : null;
  const pesoInicio = evolucao.length > 0 ? evolucao[0].pesoKg : null;
  const variacao =
    pesoAtual !== null && pesoInicio !== null ? pesoAtual - pesoInicio : null;

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
        <View style={s.headerRow}>
          <View>
            <Text style={s.title}>Sua Jornada</Text>
            <Text style={s.subtitle}>Acompanhe sua evolução física</Text>
          </View>
          <View style={s.headerIcon}>
            <Ionicons name="trending-up" size={22} color={Colors.primary} />
          </View>
        </View>

        {/* ── Stats row ── */}
        <View style={s.statsRow}>
          <StatCard
            label="Peso atual"
            value={pesoAtual !== null ? `${pesoAtual.toFixed(1)}` : '--'}
            accentColor={Colors.accent}
            icon="scale-outline"
          />
          <View style={s.statsDivider} />
          <StatCard
            label="Variação (kg)"
            value={variacaoStr}
            valueColor={variacaoColor}
            accentColor={variacaoColor !== Colors.textSecondary ? variacaoColor : Colors.accent}
            icon="swap-vertical-outline"
          />
          <View style={s.statsDivider} />
          <StatCard
            label="Registros"
            value={String(evolucao.length)}
            accentColor={Colors.primary}
            icon="calendar-outline"
          />
        </View>

        {/* ── Chart card ── */}
        <View style={s.chartCard}>
          <View style={s.chartHeader}>
            <Text style={s.chartLabel}>EVOLUÇÃO DE PESO</Text>
            <View style={s.chartLegend}>
              <View style={[s.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={s.legendText}>kg</Text>
            </View>
          </View>
          <SimpleLineChart data={weights} dates={dates} />
        </View>

        {/* ── Timeline header ── */}
        {reversed.length > 0 && (
          <View style={s.sectionRow}>
            <Text style={s.sectionLabel}>HISTÓRICO</Text>
            <Text style={s.sectionCount}>{reversed.length} registros</Text>
          </View>
        )}

        {/* ── Timeline records ── */}
        {reversed.map(registro => (
          <RegistroCard key={registro.id} registro={registro} />
        ))}

        {/* ── Share button ── */}
        <TouchableOpacity style={s.shareBtn} activeOpacity={0.82}>
          <View style={s.shareBtnInner}>
            <Ionicons name="share-social-outline" size={20} color="#FFF" />
            <Text style={s.shareBtnText}>Compartilhar no Instagram Stories</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Chart styles ─────────────────────────────────────────────────────────────
const ch = StyleSheet.create({
  outerRow: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingVertical: 2,
    width: 44,
  },
  axisLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '500',
    textAlign: 'right',
  },
  areaOuter: {
    flex: 1,
    gap: 6,
  },
  area: {
    flex: 1,
    position: 'relative',
    height: CHART_HEIGHT,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  segment: {
    position: 'absolute',
    height: LINE_H,
    backgroundColor: Colors.primary,
    borderRadius: LINE_H / 2,
    opacity: 0.9,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  dotNormal: {
    backgroundColor: Colors.primary2,
    borderWidth: 2,
    borderColor: Colors.surface,
    shadowColor: Colors.primary2,
    shadowRadius: 4,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  dotLatest: {
    backgroundColor: Colors.primary,
    borderWidth: 2.5,
    borderColor: '#FFF',
    shadowColor: Colors.primary,
    shadowRadius: 10,
    shadowOpacity: 0.85,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  xLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  empty: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});

// ─── Stat card styles ─────────────────────────────────────────────────────────
const stat = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 5,
    borderTopWidth: 2,
    borderTopColor: Colors.accent,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
    backgroundColor: Colors.primary + '18',
    borderWidth: 1.5,
    borderColor: Colors.primary + '45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarNum: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
    lineHeight: 20,
  },
  avatarUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    opacity: 0.7,
    lineHeight: 12,
  },
  details: {
    flex: 1,
    gap: 6,
  },
  date: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
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
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36, gap: 16 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
  subtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
    fontWeight: '500',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary + '18',
    borderWidth: 1,
    borderColor: Colors.primary + '35',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats row
  statsRow: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  statsDivider: {
    width: 1,
    backgroundColor: Colors.glassBorder,
    alignSelf: 'stretch',
    marginVertical: 10,
  },

  // Chart card
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 18,
    gap: 12,
    shadowColor: Colors.primary,
    shadowRadius: 16,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '600',
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },

  // Share button
  shareBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowRadius: 18,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  shareBtnInner: {
    backgroundColor: Colors.primary,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  shareBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
