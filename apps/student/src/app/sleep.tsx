// WatchAndSleepViews — faithful port of Views/Sleep/WatchAndSleepViews.swift
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useStore } from '../context/StoreContext';

type Tab = 'sono' | 'relogio';

export default function SleepScreen() {
  const [tab, setTab] = useState<Tab>('sono');

  return (
    <SafeAreaView style={s.safe}>
      {/* Tab switcher */}
      <View style={s.tabRow}>
        {(['sono', 'relogio'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[s.tabBtn, tab === t && s.tabBtnAtivo]}
          >
            <Ionicons
              name={t === 'sono' ? 'moon' : 'watch'}
              size={16}
              color={tab === t ? '#FFF' : Colors.textSecondary}
            />
            <Text style={[s.tabText, tab === t && s.tabTextAtivo]}>
              {t === 'sono' ? 'Sono' : 'Apple Watch'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'sono' ? <SleepInsights /> : <WatchNotifications />}
    </SafeAreaView>
  );
}

function SleepInsights() {
  const [horas, setHoras] = useState(7);
  const [qualidade, setQualidade] = useState(3);

  const dicas: string[] = [];
  if (horas < 7) dicas.push('Tente dormir pelo menos 7-8h para otimizar recuperação muscular.');
  if (qualidade < 3) dicas.push('Evite telas 30min antes de dormir para melhorar a qualidade do sono.');
  dicas.push('Mantenha um horário regular para dormir e acordar, inclusive nos fins de semana.');
  dicas.push('Evite cafeína e treinos intensos nas 3h antes de deitar.');

  return (
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.card}>
        <Text style={s.cardTitle}>Registro de hoje</Text>

        <Text style={s.sliderLabel}>Horas dormidas: {horas.toFixed(1)}h</Text>
        <View style={s.sliderRow}>
          <TouchableOpacity style={s.stepBtn} onPress={() => setHoras(v => Math.max(0, +(v - 0.5).toFixed(1)))}>
            <Ionicons name="remove" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <View style={s.sliderTrack}>
            <View style={[s.sliderFill, { width: `${(horas / 12) * 100}%` }]} />
          </View>
          <TouchableOpacity style={s.stepBtn} onPress={() => setHoras(v => Math.min(12, +(v + 0.5).toFixed(1)))}>
            <Ionicons name="add" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={s.sliderLabel}>Qualidade percebida: {qualidade}/5</Text>
        <View style={s.starsRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity key={n} onPress={() => setQualidade(n)}>
              <Ionicons
                name={n <= qualidade ? 'star' : 'star-outline'}
                size={28}
                color={n <= qualidade ? Colors.primary2 : Colors.textTertiary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Recomendações</Text>
        {dicas.map((d, i) => (
          <View key={i} style={s.dicaRow}>
            <Ionicons name="moon" size={16} color={Colors.accent} style={{ marginTop: 2 }} />
            <Text style={s.dicaText}>{d}</Text>
          </View>
        ))}
      </View>

      <Text style={s.note}>
        Integração real com Apple Health (HKCategoryTypeIdentifier.sleepAnalysis) pode preencher isso automaticamente.
      </Text>
    </ScrollView>
  );
}

function WatchNotifications() {
  const { watchNotifications, addWatchNotification } = useStore();

  function simular() {
    addWatchNotification({
      id: Date.now().toString(),
      titulo: 'Hora de treinar!',
      corpo: 'Seu treino de hoje está pronto.',
      data: new Date(),
    });
  }

  return (
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      {watchNotifications.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="watch-outline" size={48} color={Colors.textTertiary} />
          <Text style={s.emptyText}>Nenhuma notificação simulada ainda</Text>
          <Text style={s.emptyHint}>Inicie um treino para ver notificações aparecendo aqui.</Text>
        </View>
      ) : (
        watchNotifications.map(item => (
          <View key={item.id} style={s.notifCard}>
            <View style={s.notifIconCircle}>
              <Ionicons name="watch" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.notifTitle}>{item.titulo}</Text>
              <Text style={s.notifBody}>{item.corpo}</Text>
              <Text style={s.notifTime}>
                {item.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity style={s.simBtn} onPress={simular} activeOpacity={0.8}>
        <Ionicons name="radio" size={18} color="#FFF" />
        <Text style={s.simBtnText}> Simular notificação no relógio</Text>
      </TouchableOpacity>

      <Text style={s.note}>
        Integração real exige WatchKit Extension / WatchConnectivity (WCSession) — envia mensagens do iPhone ao Apple Watch.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  tabRow: { flexDirection: 'row', margin: 16, gap: 10 },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: 12, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  tabBtnAtivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tabTextAtivo: { color: '#FFF' },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: Colors.glassBorder, gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  sliderLabel: { fontSize: 14, color: Colors.textSecondary },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  sliderTrack: { flex: 1, height: 6, backgroundColor: Colors.surfaceElevated, borderRadius: 3, overflow: 'hidden' },
  sliderFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  starsRow: { flexDirection: 'row', gap: 8 },
  dicaRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  dicaText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  note: { fontSize: 11, color: Colors.textTertiary, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 8 },
  empty: { alignItems: 'center', gap: 10, paddingTop: 40 },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  emptyHint: { fontSize: 13, color: Colors.textTertiary, textAlign: 'center' },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  notifIconCircle: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  notifBody: { fontSize: 13, color: Colors.textSecondary },
  notifTime: { fontSize: 11, color: Colors.textTertiary, marginTop: 3 },
  simBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, padding: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  simBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
