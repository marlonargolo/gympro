import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getStoredUser, logout, getMyStudents } from '@gympro/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  is_personal_trainer: boolean;
  is_nutritionist: boolean;
  cref?: string;
  crn?: string;
  gym_name?: string;
  specialty?: string;
}

const MENU_ITEMS = [
  { icon: '💳', label: 'Plano & Assinatura', route: '/plans' as const },
  { icon: '🔔', label: 'Notificações', route: null },
  { icon: '⚙️', label: 'Configurações', route: null },
  { icon: '❓', label: 'Suporte', route: null },
];

export default function ProfileProScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [storedUser, students] = await Promise.all([
        getStoredUser(),
        getMyStudents().catch(() => []),
      ]);
      setUser(storedUser);
      setStudentCount(Array.isArray(students) ? students.length : 0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  async function handleLogout() {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          const refresh = await AsyncStorage.getItem('refresh_token');
          await logout(refresh ?? undefined);
          router.replace('/login');
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const name = user?.full_name ?? 'Profissional';
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const specialtyLabel =
    user?.is_personal_trainer && user?.is_nutritionist
      ? 'Personal & Nutricionista'
      : user?.is_personal_trainer
      ? 'Personal Trainer'
      : user?.is_nutritionist
      ? 'Nutricionista'
      : 'Profissional';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.specialty}>{specialtyLabel}</Text>

          {(user?.cref || user?.crn) && (
            <View style={styles.credRow}>
              {user.cref && (
                <View style={styles.credBadge}>
                  <Text style={styles.credText}>CREF {user.cref}</Text>
                </View>
              )}
              {user.crn && (
                <View style={[styles.credBadge, { borderColor: Colors.secondary + '66' }]}>
                  <Text style={[styles.credText, { color: Colors.secondary }]}>
                    CRN {user.crn}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{studentCount}</Text>
              <Text style={styles.statLabel}>Alunos</Text>
              <View style={styles.statDivider} />
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.email ? '✓' : '—'}</Text>
              <Text style={styles.statLabel}>E-mail</Text>
            </View>
          </View>

          {user?.gym_name && (
            <Text style={styles.gymName}>🏋️ {user.gym_name}</Text>
          )}
        </View>

        {user?.email && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>E-mail</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
            {user.phone && (
              <>
                <View style={styles.divider} />
                <Text style={styles.infoLabel}>Telefone</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </>
            )}
          </View>
        )}

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <View key={item.label}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => item.route && router.push(item.route as any)}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuChevron}>›</Text>
              </TouchableOpacity>
              {i < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  profileHeader: { alignItems: 'center', paddingTop: 28, paddingBottom: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text },
  specialty: { fontSize: 14, color: Colors.textMuted, marginTop: 2, marginBottom: 12 },
  gymName: { fontSize: 13, color: Colors.textMuted, marginTop: 8 },
  credRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  credBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '66',
  },
  credText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  statItem: { alignItems: 'center', flex: 1, position: 'relative' },
  statValue: { fontSize: 20, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statDivider: {
    position: 'absolute',
    right: 0,
    top: 4,
    bottom: 4,
    width: 1,
    backgroundColor: Colors.border,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  infoLabel: { color: Colors.textMuted, fontSize: 12 },
  infoValue: { color: Colors.text, fontSize: 15, fontWeight: '500' },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  menuIcon: { fontSize: 20 },
  menuLabel: { flex: 1, color: Colors.text, fontSize: 15 },
  menuChevron: { fontSize: 22, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  logoutBtn: {
    backgroundColor: Colors.danger + '18',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.danger + '44',
  },
  logoutText: { color: Colors.danger, fontWeight: '600', fontSize: 16 },
});
