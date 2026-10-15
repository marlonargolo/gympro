// NutritionistsListView — premium dark UI rewrite
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { mockNutricionistas } from '../data/mock-data';

export default function NutritionistsScreen() {
  const [somenteOnline, setSomenteOnline] = useState(false);
  const lista = somenteOnline ? mockNutricionistas.filter(n => n.atendeOnline) : mockNutricionistas;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Nutricionistas</Text>
            <Text style={s.sub}>Consultas presenciais e online</Text>
          </View>
          <View style={s.medkitCircle}>
            <Ionicons name="medkit" size={22} color={Colors.primary} />
          </View>
        </View>

        {/* ── Online filter ── */}
        <View style={s.filterCard}>
          <View style={s.filterLeft}>
            <View style={s.filterDot} />
            <View>
              <Text style={s.filterTitle}>Online</Text>
              <Text style={s.filterDesc}>Somente atendimento remoto</Text>
            </View>
          </View>
          <Switch
            value={somenteOnline}
            onValueChange={setSomenteOnline}
            trackColor={{ false: Colors.glassBorder, true: Colors.primary }}
            thumbColor={somenteOnline ? '#FFF' : Colors.textTertiary}
          />
        </View>

        {/* ── Section label ── */}
        <Text style={s.sectionLabel}>
          {lista.length} {lista.length === 1 ? 'PROFISSIONAL' : 'PROFISSIONAIS'}
        </Text>

        {/* ── Cards ── */}
        {lista.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="search-outline" size={52} color={Colors.textTertiary} />
            <Text style={s.emptyTitle}>Nenhum resultado</Text>
            <Text style={s.emptySub}>Tente remover o filtro online</Text>
          </View>
        ) : (
          lista.map(nutri => (
            <View key={nutri.id} style={s.card}>
              {/* top accent strip */}
              <View style={s.cardStrip} />

              <View style={s.cardBody}>
                {/* Row 1: avatar + name + CRN + online badge */}
                <View style={s.row1}>
                  <View style={s.avatar}>
                    <Ionicons name="person-circle" size={28} color={Colors.primary2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.nameRow}>
                      <Text style={s.nome} numberOfLines={1}>{nutri.nome}</Text>
                      {nutri.atendeOnline && (
                        <View style={s.onlineBadge}>
                          <View style={s.onlineDot} />
                          <Text style={s.onlineText}>Online</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.crn}>CRN {nutri.crn}</Text>
                  </View>
                </View>

                {/* Row 2: especialidade */}
                <Text style={s.especialidade}>{nutri.especialidade}</Text>

                {/* Row 3: stars + price */}
                <View style={s.row3}>
                  <View style={s.starsRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < Math.floor(nutri.avaliacao) ? 'star' : 'star-outline'}
                        size={14}
                        color={Colors.primary2}
                      />
                    ))}
                    <Text style={s.avaliacaoNum}>{nutri.avaliacao.toFixed(1)}</Text>
                  </View>
                  <Text style={s.preco}>{nutri.precoConsultaAprox}</Text>
                </View>

                {/* Agendar button */}
                <TouchableOpacity style={s.agendarBtn} activeOpacity={0.85}>
                  <Ionicons name="calendar" size={15} color="#FFF" />
                  <Text style={s.agendarText}>Agendar consulta</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 12, paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.4 },
  sub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  medkitCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary + '30',
  },

  filterCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  filterLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filterDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success,
  },
  filterTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  filterDesc: { fontSize: 12, color: Colors.textTertiary, marginTop: 1 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 1.2,
  },

  empty: { alignItems: 'center', paddingTop: 48, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textSecondary },
  emptySub: { fontSize: 13, color: Colors.textTertiary },

  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    borderWidth: 1, borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowColor: '#000', shadowRadius: 10, shadowOpacity: 0.2, elevation: 4,
  },
  cardStrip: { height: 2, backgroundColor: Colors.accent },
  cardBody: { padding: 16, gap: 12 },

  row1: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  nome: { fontSize: 16, fontWeight: '700', color: Colors.text },
  crn: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  onlineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.success + '22', borderRadius: 100,
    paddingHorizontal: 9, paddingVertical: 3,
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  onlineText: { fontSize: 11, fontWeight: '700', color: Colors.success },

  especialidade: { fontSize: 14, color: Colors.textSecondary },

  row3: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  avaliacaoNum: {
    fontSize: 13, fontWeight: '700', color: Colors.primary2, marginLeft: 6,
  },
  preco: { fontSize: 14, fontWeight: '700', color: Colors.primary2 },

  agendarBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    shadowColor: Colors.primary, shadowRadius: 10, shadowOpacity: 0.3, elevation: 4,
  },
  agendarText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
