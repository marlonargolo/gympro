// TrainingMethodsScreen — premium dark UI rewrite
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { allMetodos, metodoTreinamentoInfo } from '../data/types';
import type { MetodoTreinamento } from '../data/types';

type LevelFilter = 'Todos' | 'Iniciante' | 'Avançado';

const FEATURED: MetodoTreinamento[] = ['dropSet', 'gvt', 'heavyDuty'];

function getLevelColor(nivel: string): string {
  if (nivel.toLowerCase().includes('avançado')) return Colors.primary;
  if (nivel.toLowerCase().includes('intermediário') && !nivel.toLowerCase().includes('iniciante')) return Colors.primary2;
  return Colors.success;
}

function matchesFilter(nivel: string, filter: LevelFilter): boolean {
  if (filter === 'Todos') return true;
  if (filter === 'Iniciante') return nivel.toLowerCase().includes('iniciante');
  if (filter === 'Avançado') return nivel.toLowerCase().includes('avançado');
  return true;
}

export default function TrainingMethodsScreen() {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('Todos');
  const [expandedMethod, setExpandedMethod] = useState<MetodoTreinamento | null>(null);

  const filters: LevelFilter[] = ['Todos', 'Iniciante', 'Avançado'];

  const filtered = allMetodos.filter(m =>
    matchesFilter(metodoTreinamentoInfo[m].nivelRecomendado, levelFilter)
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Métodos de Treino</Text>
            <Text style={s.headerSub}>Técnicas avançadas de intensidade</Text>
          </View>
          <View style={s.countBadge}>
            <Text style={s.countBadgeText}>{filtered.length}</Text>
          </View>
        </View>

        {/* Level filter tabs */}
        <View style={s.filterRow}>
          {filters.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setLevelFilter(f)}
              style={[s.filterTab, levelFilter === f && s.filterTabActive]}
              activeOpacity={0.75}
            >
              <Text style={[s.filterTabText, levelFilter === f && s.filterTabTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Method cards */}
        {filtered.map(method => {
          const info = metodoTreinamentoInfo[method];
          const isFeatured = FEATURED.includes(method);
          const isExpanded = expandedMethod === method;
          const levelColor = getLevelColor(info.nivelRecomendado);

          return (
            <TouchableOpacity
              key={method}
              onPress={() => setExpandedMethod(isExpanded ? null : method)}
              style={[s.methodCard, isFeatured && s.featuredCard]}
              activeOpacity={0.8}
            >
              {isFeatured && <View style={s.featuredStrip} />}
              <View style={s.methodCardInner}>
                {/* Row 1: title + level badge */}
                <View style={s.methodRow1}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {isFeatured && (
                      <View style={s.starBadge}>
                        <Ionicons name="star" size={10} color={Colors.primary} />
                      </View>
                    )}
                    <Text style={s.methodTitle} numberOfLines={isExpanded ? undefined : 1}>
                      {info.titulo}
                    </Text>
                  </View>
                  <View style={[s.levelBadge, { backgroundColor: levelColor + '25', borderColor: levelColor + '50' }]}>
                    <Text style={[s.levelBadgeText, { color: levelColor }]}>
                      {info.nivelRecomendado}
                    </Text>
                  </View>
                </View>

                {/* Row 2: description */}
                <Text style={s.methodDesc} numberOfLines={isExpanded ? undefined : 2}>
                  {info.descricao}
                </Text>

                {/* Expand indicator */}
                <View style={s.expandRow}>
                  <Text style={s.expandHint}>{isExpanded ? 'Recolher' : 'Ver mais'}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={Colors.textTertiary}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 14, paddingBottom: 48 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingBottom: 4,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  countBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '25',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary + '50',
  },
  countBadgeText: { fontSize: 16, fontWeight: '800', color: Colors.primary },

  filterRow: { flexDirection: 'row', gap: 8 },
  filterTab: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowRadius: 8,
    shadowOpacity: 0.4,
    elevation: 4,
  },
  filterTabText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  filterTabTextActive: { color: '#FFF' },

  methodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  featuredCard: {
    shadowColor: Colors.primary,
    shadowRadius: 16,
    shadowOpacity: 0.3,
    elevation: 8,
    borderColor: Colors.primary + '40',
  },
  featuredStrip: { height: 2, backgroundColor: Colors.primary, width: '100%' },
  methodCardInner: { padding: 16, gap: 10 },

  methodRow1: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  starBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primary + '25',
    alignItems: 'center', justifyContent: 'center',
  },
  methodTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, flex: 1 },

  levelBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  levelBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  methodDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  expandRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  expandHint: { fontSize: 12, color: Colors.textTertiary, fontWeight: '600' },
});
