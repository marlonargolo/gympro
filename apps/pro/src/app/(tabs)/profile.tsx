import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { MOCK_PROFESSIONALS, MOCK_STUDENTS, MOCK_SESSIONS } from '@gympro/shared';

const PRO = MOCK_PROFESSIONALS[0];

const SPECIALTY_LABEL: Record<string, string> = {
  personal: 'Personal Trainer',
  nutritionist: 'Nutricionista',
  both: 'Personal & Nutricionista',
};

const MENU_ITEMS = [
  { icon: '📊', label: 'Relatórios de Alunos' },
  { icon: '📋', label: 'Templates de Treino' },
  { icon: '🥗', label: 'Biblioteca Nutricional' },
  { icon: '🔔', label: 'Notificações' },
  { icon: '💳', label: 'Plano & Assinatura' },
  { icon: '⚙️', label: 'Configurações' },
  { icon: '❓', label: 'Suporte' },
];

export default function ProfileProScreen() {
  const myStudents = MOCK_STUDENTS.filter((s) => PRO.studentIds.includes(s.id));
  const mySessions = MOCK_SESSIONS.filter((s) => s.professionalId === PRO.id);

  const stats = [
    { label: 'Alunos', value: String(myStudents.length) },
    { label: 'Sessões/sem', value: String(mySessions.length) },
    { label: 'Avaliação', value: '4.9 ⭐' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {PRO.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <Text style={styles.name}>{PRO.name}</Text>
          <Text style={styles.specialty}>{SPECIALTY_LABEL[PRO.specialty]}</Text>

          <View style={styles.credRow}>
            {PRO.cref && (
              <View style={styles.credBadge}>
                <Text style={styles.credText}>CREF {PRO.cref}</Text>
              </View>
            )}
            {PRO.crn && (
              <View style={[styles.credBadge, { borderColor: Colors.secondary + '66' }]}>
                <Text style={[styles.credText, { color: Colors.secondary }]}>
                  CRN {PRO.crn}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            {stats.map((stat, i) => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                {i < stats.length - 1 && <View style={styles.statDivider} />}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bioCard}>
          <Text style={styles.bioLabel}>Bio</Text>
          <Text style={styles.bioText}>{PRO.bio}</Text>
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
  editBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  editBtnText: { color: Colors.text, fontWeight: '600' },
  bioCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bioLabel: { color: Colors.textMuted, fontSize: 12, marginBottom: 6 },
  bioText: { color: Colors.text, fontSize: 14, lineHeight: 20 },
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
