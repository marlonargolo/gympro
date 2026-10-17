import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getConnections } from '@gympro/api';

interface Connection {
  id: number;
  connection_type: string;
  status: string;
  requester_name: string | null;
  target_name: string | null;
  created_at: string;
}

export default function NutritionistsScreen() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConnections('accepted')
      .then((data: Connection[]) => {
        const nutris = Array.isArray(data)
          ? data.filter(c => c.connection_type === 'nutritionist')
          : [];
        setConnections(nutris);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Nutricionistas</Text>
            <Text style={s.sub}>Seus nutricionistas vinculados</Text>
          </View>
          <View style={s.medkitCircle}>
            <Ionicons name="medkit" size={22} color={Colors.primary} />
          </View>
        </View>

        <Text style={s.sectionLabel}>
          {loading ? '—' : connections.length} {connections.length === 1 ? 'PROFISSIONAL' : 'PROFISSIONAIS'}
        </Text>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : connections.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="search-outline" size={52} color={Colors.textTertiary} />
            <Text style={s.emptyTitle}>Nenhum nutricionista vinculado</Text>
            <Text style={s.emptySub}>Use um código de convite para conectar</Text>
          </View>
        ) : (
          connections.map(conn => (
            <View key={conn.id} style={s.card}>
              <View style={s.cardStrip} />
              <View style={s.cardBody}>
                <View style={s.row1}>
                  <View style={s.avatar}>
                    <Ionicons name="person-circle" size={28} color={Colors.primary2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.nameRow}>
                      <Text style={s.nome} numberOfLines={1}>
                        {conn.target_name ?? conn.requester_name ?? 'Nutricionista'}
                      </Text>
                      <View style={s.onlineBadge}>
                        <View style={s.onlineDot} />
                        <Text style={s.onlineText}>Vinculado</Text>
                      </View>
                    </View>
                    <Text style={s.crn}>
                      {new Date(conn.created_at).toLocaleDateString('pt-BR')} · Nutricionista
                    </Text>
                  </View>
                </View>

                <Text style={s.especialidade}>Nutrição · Saúde e Performance</Text>

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

  agendarBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    shadowColor: Colors.primary, shadowRadius: 10, shadowOpacity: 0.3, elevation: 4,
  },
  agendarText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});
