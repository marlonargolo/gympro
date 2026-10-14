import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../../constants/colors';

const STATS = [
  { label: 'Treinos', value: '124' },
  { label: 'Seguidores', value: '48' },
  { label: 'Seguindo', value: '32' },
];

const MENU_ITEMS = [
  { icon: '🎯', label: 'Metas & Objetivos' },
  { icon: '📊', label: 'Histórico de Progresso' },
  { icon: '🏅', label: 'Conquistas' },
  { icon: '🔔', label: 'Notificações' },
  { icon: '🔒', label: 'Privacidade' },
  { icon: '⚙️', label: 'Configurações' },
  { icon: '❓', label: 'Suporte' },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MA</Text>
          </View>
          <Text style={styles.name}>Marlon Argolo</Text>
          <Text style={styles.handle}>@marlonargolo</Text>

          <View style={styles.statsRow}>
            {STATS.map((stat, i) => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                {i < STATS.length - 1 && <View style={styles.statDivider} />}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Objetivo</Text>
            <Text style={styles.infoValue}>Hipertrofia</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nível</Text>
            <Text style={styles.infoValue}>Intermediário</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plano</Text>
            <Text style={[styles.infoValue, { color: Colors.primary }]}>
              Pro ⭐
            </Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <View key={item.label}>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuChevron}>›</Text>
              </TouchableOpacity>
              {i < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 16 },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
  },
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
  handle: { fontSize: 14, color: Colors.textMuted, marginTop: 2, marginBottom: 20 },
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
  editProfileBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  editProfileText: { color: Colors.text, fontWeight: '600' },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: { color: Colors.textMuted, fontSize: 15 },
  infoValue: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
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
  logoutBtn: {
    backgroundColor: Colors.primary + '18',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  logoutText: { color: Colors.primary, fontWeight: '600', fontSize: 16 },
});
