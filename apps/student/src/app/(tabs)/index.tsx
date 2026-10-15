// HomeScreen — premium dark UI rewrite
import React from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useStore } from '../../context/StoreContext';
import { calcularTMB, calcularGET } from '../../data/calculators';

// ─── helpers ──────────────────────────────────────────────────────────────────

function todayLabel(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={hero.block}>
      <View style={[hero.dot, { backgroundColor: color }]} />
      <Text style={hero.metaLabel}>{label}</Text>
      <Text style={[hero.metaValue, { color }]}>{value}</Text>
      <Text style={hero.metaUnit}>kcal</Text>
    </View>
  );
}

function WideShortcutCard() {
  return (
    <TouchableOpacity
      style={[s.shortcutCard, s.wideCard]}
      onPress={() => router.navigate('/music' as any)}
      activeOpacity={0.75}
    >
      <View style={s.wideInner}>
        {/* Música */}
        <View style={s.wideItem}>
          <View style={s.iconWrap}>
            <Ionicons name="musical-notes" size={28} color={Colors.primary} />
          </View>
          <Text style={s.shortcutTitle}>Música</Text>
          <Text style={s.shortcutSub}>Spotify / YouTube</Text>
        </View>
        <View style={s.wideDivider} />
        {/* Sono */}
        <TouchableOpacity
          style={s.wideItem}
          onPress={() => router.navigate('/sleep' as any)}
          activeOpacity={0.75}
        >
          <View style={s.iconWrap}>
            <Ionicons name="moon" size={28} color={Colors.accent} />
          </View>
          <Text style={s.shortcutTitle}>Sono</Text>
          <Text style={s.shortcutSub}>Análise e dicas</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function ShortcutCard({
  title, subtitle, icon, route, iconColor,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
  iconColor?: string;
}) {
  const color = iconColor ?? Colors.primary;
  return (
    <TouchableOpacity
      style={[s.shortcutCard, s.halfCard]}
      onPress={() => router.navigate(route as any)}
      activeOpacity={0.75}
    >
      {/* orange top border strip */}
      <View style={[s.accentStrip, { backgroundColor: color }]} />
      <View style={s.halfBody}>
        <View style={[s.iconWrap, { shadowColor: color, shadowRadius: 10, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 0 } }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={s.shortcutTitle}>{title}</Text>
        <Text style={s.shortcutSub}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function WatchCard() {
  return (
    <TouchableOpacity
      style={[s.shortcutCard, s.wideCard, s.watchCard]}
      onPress={() => router.navigate('/sleep' as any)}
      activeOpacity={0.75}
    >
      <View style={[s.accentStrip, { backgroundColor: Colors.success }]} />
      <View style={s.watchBody}>
        <View style={[s.iconWrap, { shadowColor: Colors.success, shadowRadius: 10, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 0 } }]}>
          <Ionicons name="watch" size={28} color={Colors.success} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.shortcutTitle}>Watch</Text>
          <Text style={s.shortcutSub}>Notificações Apple Watch (mock)</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

function PillCTA({
  icon, iconColor, title, subtitle, route,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  title: string;
  subtitle: string;
  route: string;
}) {
  return (
    <TouchableOpacity
      style={s.pillCta}
      onPress={() => router.navigate(route as any)}
      activeOpacity={0.8}
    >
      <View style={[s.pillIcon, { shadowColor: iconColor, shadowRadius: 8, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 0 } }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.pillTitle}>{title}</Text>
        <Text style={s.pillSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { perfil } = useStore();
  const tmb = Math.round(calcularTMB(perfil));
  const get = Math.round(calcularGET(perfil));
  const nomeDisplay = perfil.nome.trim() || 'Atleta';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.headerRow}>
          <Text style={s.greeting}>Olá, {nomeDisplay}</Text>
          <Text style={s.dateLabel}>{todayLabel()}</Text>
        </View>

        {/* ── Hero card (3D tilt + glow) ── */}
        <View style={[s.heroCard, { transform: [{ perspective: 800 }, { rotateX: '1.5deg' }] }]}>
          {/* orange top border */}
          <View style={s.heroTopBorder} />
          <View style={s.heroBody}>
            <View style={s.heroMetrics}>
              <MetricBlock label="TMB · repouso" value={tmb.toLocaleString('pt-BR')} color={Colors.primary2} />
              <View style={s.heroSeparator} />
              <MetricBlock label="GET · total/dia" value={get.toLocaleString('pt-BR')} color={Colors.primary} />
            </View>
            <TouchableOpacity
              onPress={() => router.navigate('/(tabs)/profile' as any)}
              style={s.editRow}
            >
              <Ionicons name="create-outline" size={14} color={Colors.primary} />
              <Text style={s.editLink}> Editar perfil →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Section label ── */}
        <Text style={s.sectionLabel}>ACESSO RÁPIDO</Text>

        {/* ── Bento grid ── */}
        {/* Row 0: wide card (Música + Sono) */}
        <WideShortcutCard />

        {/* Row 1: Profissionais | Nutricionistas */}
        <View style={s.bentoRow}>
          <ShortcutCard
            title="Profissionais"
            subtitle="Perto de você"
            icon="people"
            route="/maps"
            iconColor={Colors.primary}
          />
          <ShortcutCard
            title="Nutricionistas"
            subtitle="Especialistas"
            icon="medkit"
            route="/nutritionists"
            iconColor={Colors.primary2}
          />
        </View>

        {/* Row 2: Watch (full width) */}
        <WatchCard />

        {/* ── CTA pills ── */}
        <PillCTA
          icon="calculator"
          iconColor={Colors.accent}
          title="Calculadoras de Saúde"
          subtitle="IMC · água · FC · macros"
          route="/health-calculators"
        />
        <PillCTA
          icon="cart"
          iconColor={Colors.primary2}
          title="Marketplace"
          subtitle="Suplementos e parceiros"
          route="/marketplace"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Hero chart styles ─────────────────────────────────────────────────────────
const hero = StyleSheet.create({
  block: { flex: 1, alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 2 },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  metaValue: {
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 46,
    textAlign: 'center',
  },
  metaUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textTertiary,
  },
});

// ─── Main styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 36, gap: 14 },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { fontSize: 26, fontWeight: '800', color: Colors.text },
  dateLabel: { fontSize: 12, color: Colors.textTertiary, fontWeight: '500' },

  // Hero card
  heroCard: {
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    // glow shadow
    shadowColor: '#FF6B35',
    shadowRadius: 20,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  heroTopBorder: {
    height: 2,
    backgroundColor: Colors.primary,
  },
  heroBody: {
    padding: 20,
    gap: 16,
  },
  heroMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  heroSeparator: {
    width: 1,
    height: 60,
    backgroundColor: Colors.glassBorder,
    marginHorizontal: 16,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  editLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 2,
  },

  // Shortcut cards
  shortcutCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  wideCard: { width: '100%' },

  wideInner: {
    flexDirection: 'row',
    padding: 16,
    gap: 0,
  },
  wideItem: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 4,
  },
  wideDivider: {
    width: 1,
    backgroundColor: Colors.glassBorder,
    marginHorizontal: 14,
    alignSelf: 'stretch',
  },

  halfCard: { flex: 1 },

  halfBody: {
    padding: 16,
    gap: 8,
    minHeight: 110,
  },

  accentStrip: {
    height: 3,
    width: '100%',
  },

  watchCard: {},
  watchBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },

  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },

  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  shortcutSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Pill CTAs
  pillCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 14,
  },
  pillIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.glassBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  pillSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
