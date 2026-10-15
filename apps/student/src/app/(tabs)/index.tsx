// HomeView — faithful port of Views/HomeView.swift
import React from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useStore } from '../../context/StoreContext';
import { calcularTMB, calcularGET } from '../../data/calculators';

type ShortcutDef = {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
};

const shortcuts: ShortcutDef[] = [
  { title: 'Música no treino', subtitle: 'Spotify / YouTube', icon: 'musical-notes', route: '/music' },
  { title: 'Notificações no relógio', subtitle: 'Apple Watch (mock)', icon: 'watch', route: '/sleep' },
  { title: 'Melhoria do sono', subtitle: 'Análise e dicas', icon: 'moon', route: '/sleep' },
  { title: 'Profissionais', subtitle: 'Perto de você', icon: 'people', route: '/maps' },
  { title: 'Nutricionistas', subtitle: 'Especialistas esportivos', icon: 'medkit', route: '/nutritionists' },
];

export default function HomeScreen() {
  const { perfil } = useStore();
  const tmb = Math.round(calcularTMB(perfil));
  const get = Math.round(calcularGET(perfil));
  const nomeDisplay = perfil.nome.trim() || 'Atleta';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.greeting}>Olá, {nomeDisplay}</Text>

        {/* Taxa Metabólica Basal card */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <Ionicons name="flame" size={18} color={Colors.primary} />
            <Text style={s.cardTitle}> Sua Taxa Metabólica Basal</Text>
          </View>
          <View style={s.metabolicRow}>
            <View>
              <Text style={s.metaLabel}>TMB (repouso)</Text>
              <Text style={s.metaValue}>{tmb} kcal</Text>
            </View>
            <View>
              <Text style={s.metaLabel}>Gasto total/dia</Text>
              <Text style={[s.metaValue, { color: Colors.primary }]}>{get} kcal</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.navigate('/(tabs)/profile')}>
            <Text style={s.editLink}>Editar perfil e recalcular →</Text>
          </TouchableOpacity>
        </View>

        {/* Shortcut cards 2x2 grid */}
        <View style={s.grid}>
          {shortcuts.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={s.shortcut}
              onPress={() => router.navigate(item.route as any)}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={28} color={Colors.primary} />
              <Text style={s.shortcutTitle}>{item.title}</Text>
              <Text style={s.shortcutSub}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Health calculators shortcut */}
        <TouchableOpacity
          style={[s.card, s.calcCard]}
          onPress={() => router.navigate('/health-calculators')}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="calculator" size={22} color={Colors.accent} />
            <View>
              <Text style={[s.shortcutTitle, { color: Colors.text }]}>Calculadoras de Saúde</Text>
              <Text style={s.shortcutSub}>IMC · água · FC · macros</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} style={{ marginLeft: 'auto' }} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.card, s.calcCard]}
          onPress={() => router.navigate('/marketplace')}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="cart" size={22} color={Colors.primary2} />
            <View>
              <Text style={[s.shortcutTitle, { color: Colors.text }]}>Marketplace</Text>
              <Text style={s.shortcutSub}>Suplementos e parceiros</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} style={{ marginLeft: 'auto' }} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, paddingBottom: 32, gap: 16 },
  greeting: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 12,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  metabolicRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { fontSize: 12, color: Colors.textSecondary },
  metaValue: { fontSize: 22, fontWeight: '700', color: Colors.text },
  editLink: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  shortcut: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    width: '47%',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 8,
  },
  shortcutTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  shortcutSub: { fontSize: 12, color: Colors.textSecondary },
  calcCard: { gap: 0 },
});
