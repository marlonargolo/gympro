// SleepScreen — premium dark UI rewrite
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
      {/* Tab pills */}
      <View style={s.tabRow}>
        {(['sono', 'relogio'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[s.tabPill, tab === t && s.tabPillActive]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={t === 'sono' ? 'moon' : 'watch'}
              size={16}
              color={tab === t ? '#FFF' : Colors.textSecondary}
            />
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'sono' ? 'Qualidade do Sono' : 'Apple Watch'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'sono' ? <SleepQuality /> : <WatchNotifications />}
    </SafeAreaView>
  );
}

function SleepQuality() {
  const [horas, setHoras] = useState(7);
  const [qualidade, setQualidade] = useState(3);

  const dicas: string[] = [];
  if (horas < 7) dicas.push('Tente dormir pelo menos 7–8h para otimizar recuperação muscular e síntese proteica.');
  if (qualidade < 3) dicas.push('Evite telas 30min antes de dormir — a luz azul inibe a melatonina e prejudica a qualidade.');
  dicas.push('Mantenha um horário regular para dormir e acordar, inclusive nos fins de semana.');
  if (dicas.length < 3) dicas.push('Evite cafeína e treinos intensos nas 3h antes de deitar para garantir um sono profundo.');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

      {/* Moon hero */}
      <View style={s.heroContainer}>
        <View style={s.moonGlow}>
          <View style={s.moonCircle}>
            <Ionicons name="moon" size={48} color={Colors.primary} />
          </View>
        </View>
        <Text style={s.heroTitle}>Registro de Sono</Text>
        <Text style={s.heroSub}>Monitore e melhore sua recuperação</Text>
      </View>

      {/* Hours stepper */}
      <View style={s.card}>
        <Text style={s.sectionLabel}>HORAS DORMIDAS</Text>
        <View style={s.stepperRow}>
          <TouchableOpacity
            onPress={() => setHoras(v => Math.max(4, +(v - 0.5).toFixed(1)))}
            style={s.stepperBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <View style={s.stepperCenter}>
            <Text style={s.stepperValue}>{horas.toFixed(1)}</Text>
            <Text style={s.stepperUnit}>horas</Text>
          </View>
          <TouchableOpacity
            onPress={() => setHoras(v => Math.min(12, +(v + 0.5).toFixed(1)))}
            style={s.stepperBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, {
            width: `${((horas - 4) / 8) * 100}%`,
            backgroundColor: horas >= 7 ? Colors.success : Colors.primary,
          }]} />
        </View>
        <Text style={s.horasHint}>
          {horas >= 8 ? 'Ótimo! Recuperação completa.' : horas >= 7 ? 'Bom. Tente manter acima de 7h.' : 'Pouco sono. Afeta recuperação e performance.'}
        </Text>
      </View>

      {/* Star rating */}
      <View style={s.card}>
        <Text style={s.sectionLabel}>QUALIDADE PERCEBIDA</Text>
        <View style={s.starsRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity key={n} onPress={() => setQualidade(n)} activeOpacity={0.7}>
              <Ionicons
                name={n <= qualidade ? 'star' : 'star-outline'}
                size={34}
                color={n <= qualidade ? Colors.primary2 : Colors.surfaceElevated}
                style={n <= qualidade ? s.starActive : undefined}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.qualidadeLabel}>
          {qualidade >= 4 ? 'Excelente 🌟' : qualidade >= 3 ? 'Boa 👍' : qualidade >= 2 ? 'Regular 😐' : 'Ruim 😴'}
        </Text>
      </View>

      {/* Tips card */}
      <View style={s.tipsCard}>
        <View style={[s.tipsAccent]} />
        <View style={s.tipsInner}>
          <View style={s.tipsHeader}>
            <Ionicons name="bulb" size={18} color={Colors.accent} />
            <Text style={s.tipsTitleText}>Recomendações para você</Text>
          </View>
          {dicas.slice(0, 3).map((d, i) => (
            <View key={i} style={s.dicaRow}>
              <View style={s.dicaBullet} />
              <Text style={s.dicaText}>{d}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Save button */}
      <TouchableOpacity style={s.saveBtn} activeOpacity={0.85}>
        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
        <Text style={s.saveBtnText}>Salvar registro</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

function WatchNotifications() {
  const { watchNotifications, addWatchNotification } = useStore();

  function simular() {
    addWatchNotification({
      id: Date.now().toString(),
      titulo: 'Hora de treinar!',
      corpo: 'Seu treino de hoje está pronto. Vamos lá!',
      data: new Date(),
    });
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

      {/* Watch hero */}
      <View style={s.heroContainer}>
        <View style={[s.moonGlow, { shadowColor: Colors.accent }]}>
          <View style={[s.moonCircle, { backgroundColor: Colors.accent + '20', borderColor: Colors.accent + '40' }]}>
            <Ionicons name="watch" size={48} color={Colors.accent} />
          </View>
        </View>
        <Text style={s.heroTitle}>Apple Watch</Text>
        <Text style={s.heroSub}>Notificações de treino do relógio</Text>
      </View>

      {watchNotifications.length === 0 ? (
        <View style={s.emptyState}>
          <Ionicons name="watch-outline" size={56} color={Colors.textTertiary} />
          <Text style={s.emptyTitle}>Nenhuma notificação ainda</Text>
          <Text style={s.emptyHint}>Simule uma notificação de treino para ver como funciona.</Text>
        </View>
      ) : (
        watchNotifications.map(item => (
          <View key={item.id} style={s.notifCard}>
            <View style={s.notifIconWrap}>
              <Ionicons name="watch" size={20} color={Colors.accent} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={s.notifTitle}>{item.titulo}</Text>
              <Text style={s.notifBody}>{item.corpo}</Text>
              <Text style={s.notifTime}>
                {item.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity style={s.accentBtn} onPress={simular} activeOpacity={0.85}>
        <Ionicons name="radio" size={18} color="#FFF" />
        <Text style={s.accentBtnText}>Simular notificação do treino</Text>
      </TouchableOpacity>

      <Text style={s.note}>
        Integração real exige WatchKit Extension / WatchConnectivity (WCSession).
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  tabRow: { flexDirection: 'row', margin: 16, gap: 10 },
  tabPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 12, borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  tabPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowRadius: 10,
    shadowOpacity: 0.45,
    elevation: 6,
  },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  tabTextActive: { color: '#FFF' },

  scroll: { padding: 18, gap: 16, paddingBottom: 48 },

  heroContainer: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  moonGlow: {
    shadowColor: Colors.primary, shadowRadius: 20, shadowOpacity: 0.5, elevation: 0,
  },
  moonCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary + '40',
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 4 },
  heroSub: { fontSize: 13, color: Colors.textSecondary },

  card: {
    backgroundColor: Colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.glassBorder,
    padding: 18, gap: 14,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    color: Colors.textTertiary, textTransform: 'uppercase',
  },

  stepperRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 56, height: 60, alignItems: 'center', justifyContent: 'center',
  },
  stepperCenter: {
    flex: 1, alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center', gap: 6,
  },
  stepperValue: { fontSize: 36, fontWeight: '800', color: Colors.text },
  stepperUnit: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },

  progressTrack: {
    height: 4, backgroundColor: Colors.surfaceElevated,
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  horasHint: { fontSize: 13, color: Colors.textSecondary },

  starsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  starActive: {
    shadowColor: Colors.primary2,
    shadowRadius: 6,
    shadowOpacity: 0.6,
  },
  qualidadeLabel: {
    textAlign: 'center', fontSize: 15, fontWeight: '700', color: Colors.text,
  },

  tipsCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  tipsAccent: { height: 2, backgroundColor: Colors.accent },
  tipsInner: { padding: 16, gap: 12 },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipsTitleText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  dicaRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dicaBullet: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.accent, marginTop: 7, flexShrink: 0,
  },
  dicaText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 16,
    padding: 18, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
    shadowColor: Colors.primary, shadowRadius: 14, shadowOpacity: 0.4, elevation: 6,
  },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

  // Watch tab
  emptyState: { alignItems: 'center', gap: 10, paddingVertical: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  emptyHint: { fontSize: 13, color: Colors.textTertiary, textAlign: 'center', paddingHorizontal: 20 },

  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  notifIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.accent + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  notifBody: { fontSize: 13, color: Colors.textSecondary },
  notifTime: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },

  accentBtn: {
    backgroundColor: Colors.accent, borderRadius: 16,
    padding: 18, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
    shadowColor: Colors.accent, shadowRadius: 14, shadowOpacity: 0.4, elevation: 6,
  },
  accentBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

  note: {
    fontSize: 11, color: Colors.textTertiary,
    textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 8,
  },
});
