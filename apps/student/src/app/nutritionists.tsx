// NutritionistsListView — faithful port of Models/Views/Health/NutritionistsListView.swift
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
        {/* Online filter */}
        <View style={s.filterCard}>
          <Text style={s.filterText}>Somente atendimento online</Text>
          <Switch
            value={somenteOnline}
            onValueChange={setSomenteOnline}
            trackColor={{ false: Colors.surfaceElevated, true: Colors.primary }}
            thumbColor={somenteOnline ? '#FFF' : Colors.textTertiary}
          />
        </View>

        {lista.map(nutri => (
          <View key={nutri.id} style={s.card}>
            <View style={s.iconCircle}>
              <Ionicons name="medkit" size={24} color={Colors.accent} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.nome}>{nutri.nome}</Text>
              <Text style={s.especialidade}>{nutri.especialidade}</Text>
              <View style={s.metaRow}>
                <View style={s.ratingRow}>
                  <Ionicons name="star" size={13} color={Colors.primary2} />
                  <Text style={s.rating}> {nutri.avaliacao.toFixed(1)}</Text>
                </View>
                {nutri.atendeOnline && (
                  <View style={s.onlineBadge}>
                    <Text style={s.onlineText}>Online</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={s.preco}>{nutri.precoConsultaAprox}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 14, paddingBottom: 32 },
  filterCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  filterText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: Colors.surface, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  iconCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.accent + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  nome: { fontSize: 16, fontWeight: '700', color: Colors.text },
  especialidade: { fontSize: 13, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  rating: { fontSize: 13, fontWeight: '700', color: Colors.primary2 },
  onlineBadge: {
    backgroundColor: Colors.success + '33', borderRadius: 100,
    paddingHorizontal: 9, paddingVertical: 3,
  },
  onlineText: { fontSize: 11, fontWeight: '700', color: Colors.success },
  preco: { fontSize: 11, color: Colors.textTertiary, alignSelf: 'center' },
});
