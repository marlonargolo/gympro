// HomeScreen — Premium redesign with LinearGradient + authentic feel
import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { useStore } from '../../context/StoreContext';
import { calcularTMB, calcularGET } from '../../data/calculators';
import { getMe, getMySubscription } from '@gympro/api';

function todayLabel(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short',
  });
}

function MetricBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={hero.block}>
      <Text style={hero.metaLabel}>{label}</Text>
      <Text style={[hero.metaValue, { color }]}>{value}</Text>
      <Text style={hero.metaUnit}>kcal/dia</Text>
    </View>
  );
}

function QuickCard({
  title, subtitle, icon, route, iconColor, accentColor,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
  iconColor: string;
  accentColor?: string;
}) {
  const accent = accentColor ?? iconColor;
  return (
    <TouchableOpacity
      style={q.wrap}
      onPress={() => router.navigate(route as any)}
      activeOpacity={0.8}
    >
      <View style={[q.topLine, { backgroundColor: accent }]} />
      <View style={q.body}>
        <View style={[q.iconBox, { backgroundColor: iconColor + '18' }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <Text style={q.title}>{title}</Text>
        <Text style={q.sub}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function WideCard({
  left, right,
}: {
  left: { title: string; sub: string; icon: React.ComponentProps<typeof Ionicons>['name']; color: string; route: string };
  right: { title: string; sub: string; icon: React.ComponentProps<typeof Ionicons>['name']; color: string; route: string };
}) {
  return (
    <View style={w.wrap}>
      <TouchableOpacity style={w.half} onPress={() => router.navigate(left.route as any)} activeOpacity={0.8}>
        <View style={[w.iconBox, { backgroundColor: left.color + '18' }]}>
          <Ionicons name={left.icon} size={22} color={left.color} />
        </View>
        <Text style={w.title}>{left.title}</Text>
        <Text style={w.sub}>{left.sub}</Text>
      </TouchableOpacity>
      <View style={w.divider} />
      <TouchableOpacity style={w.half} onPress={() => router.navigate(right.route as any)} activeOpacity={0.8}>
        <View style={[w.iconBox, { backgroundColor: right.color + '18' }]}>
          <Ionicons name={right.icon} size={22} color={right.color} />
        </View>
        <Text style={w.title}>{right.title}</Text>
        <Text style={w.sub}>{right.sub}</Text>
      </TouchableOpacity>
    </View>
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
      style={s.pill}
      onPress={() => router.navigate(route as any)}
      activeOpacity={0.8}
    >
      <View style={[s.pillIcon, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.pillTitle}>{title}</Text>
        <Text style={s.pillSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { perfil } = useStore();
  const tmb = Math.round(calcularTMB(perfil));
  const get = Math.round(calcularGET(perfil));

  const [meData, setMeData] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    getMe().then(setMeData).catch(() => {});
    getMySubscription().then(setSubscription).catch(() => {});
  }, []);

  const fullName = meData?.full_name?.trim() || perfil.nome.trim() || 'Atleta';
  const nomeDisplay = fullName.split(' ')[0];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.greeting}>Olá, {nomeDisplay}</Text>
            <Text style={s.dateLabel}>{todayLabel()}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.navigate('/(tabs)/profile' as any)}
            style={s.avatarBtn}
            activeOpacity={0.8}
          >
            <Text style={s.avatarInitial}>
              {nomeDisplay[0].toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Hero card ── */}
        <LinearGradient
          colors={['#1E1A2E', Colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          <View style={s.heroAccentLine} />
          <View style={s.heroBody}>
            <Text style={s.heroEyebrow}>CONSUMO CALÓRICO</Text>
            <View style={s.heroMetrics}>
              <MetricBlock label="Repouso (TMB)" value={tmb.toLocaleString('pt-BR')} color={Colors.primary2} />
              <View style={s.heroSep} />
              <MetricBlock label="Total diário (GET)" value={get.toLocaleString('pt-BR')} color={Colors.primary} />
            </View>
            <TouchableOpacity
              onPress={() => router.navigate('/(tabs)/profile' as any)}
              style={s.editRow}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={13} color={Colors.primary} />
              <Text style={s.editLink}> Editar perfil</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Subscription pill ── */}
        {subscription && (
          <View style={s.subPill}>
            <Ionicons name="shield-checkmark" size={13} color={Colors.primary} />
            <Text style={s.subPillName}>{subscription.plan_name ?? 'Plano Ativo'}</Text>
            <View style={s.subPillSep} />
            <View style={s.subPillDot} />
            <Text style={s.subPillStatus}>Ativo</Text>
          </View>
        )}

        {/* ── Acesso Rápido ── */}
        <Text style={s.sectionLabel}>ACESSO RÁPIDO</Text>

        {/* Música + Sono */}
        <WideCard
          left={{ title: 'Música', sub: 'Spotify · YouTube', icon: 'musical-notes', color: Colors.primary, route: '/music' }}
          right={{ title: 'Sono', sub: 'Análise e dicas', icon: 'moon', color: Colors.accent, route: '/sleep' }}
        />

        {/* Profissionais + Nutricionistas */}
        <View style={s.row}>
          <QuickCard
            title="Profissionais"
            subtitle="Perto de você"
            icon="people"
            route="/maps"
            iconColor={Colors.primary}
          />
          <QuickCard
            title="Nutricionistas"
            subtitle="Especialistas"
            icon="medkit"
            route="/nutritionists"
            iconColor={Colors.primary2}
          />
        </View>

        {/* Watch */}
        <TouchableOpacity
          style={s.watchCard}
          onPress={() => router.navigate('/sleep' as any)}
          activeOpacity={0.8}
        >
          <View style={[s.watchIcon, { backgroundColor: Colors.success + '18' }]}>
            <Ionicons name="watch" size={20} color={Colors.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.watchTitle}>Apple Watch</Text>
            <Text style={s.watchSub}>Notificações de treino</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
        </TouchableOpacity>

        {/* ── Ferramentas ── */}
        <Text style={s.sectionLabel}>FERRAMENTAS</Text>

        <PillCTA
          icon="calculator"
          iconColor={Colors.accent}
          title="Calculadoras de Saúde"
          subtitle="IMC · hidratação · FC · macros"
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

// ─── Hero styles ──────────────────────────────────────────────────────────────
const hero = StyleSheet.create({
  block: { flex: 1, alignItems: 'center', gap: 3 },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  metaValue: {
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 42,
    textAlign: 'center',
    letterSpacing: -1,
  },
  metaUnit: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
});

// ─── Quick card styles ────────────────────────────────────────────────────────
const q = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  topLine: {
    height: 2,
    width: '100%',
  },
  body: {
    padding: 14,
    gap: 7,
    minHeight: 100,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  sub: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
});

// ─── Wide card styles ─────────────────────────────────────────────────────────
const w = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  half: {
    flex: 1,
    padding: 16,
    gap: 7,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.glassBorder,
    marginVertical: 16,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  sub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});

// ─── Main styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40, gap: 12 },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: Colors.text },
  dateLabel: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary + '22',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },

  // Hero card
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowRadius: 16,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  heroAccentLine: {
    height: 2,
    backgroundColor: Colors.primary,
  },
  heroBody: {
    padding: 20,
    gap: 12,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  heroMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroSep: {
    width: 1,
    height: 50,
    backgroundColor: Colors.glassBorder,
    marginHorizontal: 12,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  editLink: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Section label
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  // Row
  row: {
    flexDirection: 'row',
    gap: 12,
  },

  // Watch card
  watchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 14,
    gap: 12,
  },
  watchIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  watchSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Subscription pill
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '15',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  subPillName: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  subPillSep: { width: 1, height: 10, backgroundColor: Colors.primary + '30' },
  subPillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  subPillStatus: { fontSize: 11, fontWeight: '600', color: Colors.success },

  // Pill CTAs
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 12,
  },
  pillIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  pillSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
