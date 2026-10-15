// TrainingMethodsListView + detail — port of Views/Workout/TrainingMethodsView.swift
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { allMetodos, metodoTreinamentoInfo } from '../data/types';
import type { MetodoTreinamento } from '../data/types';

export default function TrainingMethodsScreen() {
  const [selected, setSelected] = useState<MetodoTreinamento | null>(null);
  const info = selected ? metodoTreinamentoInfo[selected] : null;

  if (selected && info) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.detailContent}>
          <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.primary} />
            <Text style={s.backText}>Todos os métodos</Text>
          </TouchableOpacity>
          <Text style={s.detailTitle}>{info.titulo}</Text>
          <View style={s.nivelBadge}>
            <Ionicons name="stats-chart" size={14} color={Colors.primary} />
            <Text style={s.nivelText}> {info.nivelRecomendado}</Text>
          </View>
          <Text style={s.detailDesc}>{info.descricao}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={allMetodos}
        keyExtractor={m => m}
        contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const info = metodoTreinamentoInfo[item];
          return (
            <TouchableOpacity
              style={s.row}
              onPress={() => setSelected(item)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>{info.titulo}</Text>
                <Text style={s.rowLevel}>{info.nivelRecomendado}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  rowTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  rowLevel: { fontSize: 12, color: Colors.primary },
  // Detail
  detailContent: { padding: 20, gap: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  backText: { color: Colors.primary, fontWeight: '600', fontSize: 15 },
  detailTitle: { fontSize: 28, fontWeight: '800', color: Colors.text },
  nivelBadge: { flexDirection: 'row', alignItems: 'center' },
  nivelText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  detailDesc: { fontSize: 16, color: Colors.textSecondary, lineHeight: 24 },
});
