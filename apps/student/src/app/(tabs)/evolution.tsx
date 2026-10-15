// EvolutionView — faithful port of Models/Views/Feed/EvolutionView.swift
import React from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useStore } from '../../context/StoreContext';
import type { RegistroEvolucao } from '../../data/types';

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Simple line chart using positioned Views — cross-platform
function SimpleLineChart({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = (max - min) || 1;
  const chartH = 120;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 100, // percent
    y: chartH - ((v - min) / range) * (chartH - 20) - 10,
  }));

  return (
    <View style={chart.container}>
      {/* Y-axis labels */}
      <View style={chart.yAxis}>
        <Text style={chart.axisLabel}>{max.toFixed(1)}</Text>
        <Text style={chart.axisLabel}>{min.toFixed(1)}</Text>
      </View>

      {/* Chart area */}
      <View style={chart.area}>
        {/* Lines between points */}
        {points.slice(0, -1).map((pt, i) => {
          const next = points[i + 1];
          const dx = next.x - pt.x;
          const dy = next.y - pt.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return (
            <View
              key={i}
              style={[
                chart.line,
                {
                  left: `${pt.x}%` as any,
                  top: pt.y,
                  width: `${len}%` as any,
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: '0 50%' as any,
                },
              ]}
            />
          );
        })}
        {/* Dots */}
        {points.map((pt, i) => (
          <View
            key={i}
            style={[chart.dot, { left: `${pt.x}%` as any, top: pt.y }]}
          />
        ))}
      </View>
    </View>
  );
}

export default function EvolutionScreen() {
  const { evolucao } = useStore();
  const weights = evolucao.map(r => r.pesoKg);
  const reversed = [...evolucao].reverse();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.title}>Sua jornada</Text>

        {/* Line chart */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>Evolução de peso (kg)</Text>
          <SimpleLineChart data={weights} />
          <View style={s.chartLegend}>
            {evolucao.map(r => (
              <Text key={r.id} style={s.axisDateLabel}>
                {r.data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </Text>
            ))}
          </View>
        </View>

        {/* Timeline records */}
        {reversed.map(registro => (
          <RegistroCard key={registro.id} registro={registro} />
        ))}

        {/* Share button */}
        <TouchableOpacity style={s.btnPrimary} activeOpacity={0.8}>
          <Ionicons name="share-outline" size={18} color="#FFF" />
          <Text style={s.btnText}> Compartilhar evolução no Instagram Stories</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function RegistroCard({ registro }: { registro: RegistroEvolucao }) {
  return (
    <View style={s.registroCard}>
      <View style={s.registroAvatar}>
        <Ionicons name="person" size={22} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.registroDate}>{formatDate(registro.data)}</Text>
        <View style={s.registroMetrics}>
          <View style={s.metricBadge}>
            <Ionicons name="scale" size={13} color={Colors.textTertiary} />
            <Text style={s.metricText}> {registro.pesoKg.toFixed(1)}kg</Text>
          </View>
          {registro.percentualGordura !== undefined && (
            <View style={s.metricBadge}>
              <Text style={s.metricText}>{registro.percentualGordura.toFixed(0)}% gordura</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const chart = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 130,
    marginTop: 8,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingVertical: 4,
    width: 44,
  },
  axisLabel: { fontSize: 10, color: Colors.textTertiary },
  area: { flex: 1, position: 'relative', height: 120 },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary2,
    marginLeft: -5,
    marginTop: -5,
  },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 16, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 8,
  },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  axisDateLabel: { fontSize: 9, color: Colors.textTertiary },
  registroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  registroAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  registroDate: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  registroMetrics: { flexDirection: 'row', gap: 10 },
  metricBadge: { flexDirection: 'row', alignItems: 'center' },
  metricText: { fontSize: 12, color: Colors.textTertiary },
  btnPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
