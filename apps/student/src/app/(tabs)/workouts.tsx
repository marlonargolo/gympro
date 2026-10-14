import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../../constants/colors';

const CATEGORIES = ['Todos', 'Força', 'Cardio', 'Flexibilidade', 'HIIT'];

const WORKOUTS = [
  {
    name: 'Peito & Tríceps',
    exercises: 8,
    duration: '55 min',
    level: 'Intermediário',
    emoji: '💪',
  },
  {
    name: 'Costas & Bíceps',
    exercises: 7,
    duration: '50 min',
    level: 'Intermediário',
    emoji: '🏋️',
  },
  {
    name: 'Pernas Completo',
    exercises: 10,
    duration: '65 min',
    level: 'Avançado',
    emoji: '🦵',
  },
  {
    name: 'HIIT Cardio',
    exercises: 6,
    duration: '30 min',
    level: 'Avançado',
    emoji: '🔥',
  },
  {
    name: 'Ombros & Trapézio',
    exercises: 6,
    duration: '45 min',
    level: 'Iniciante',
    emoji: '🏆',
  },
  {
    name: 'Core & Abdômen',
    exercises: 5,
    duration: '25 min',
    level: 'Iniciante',
    emoji: '⚡',
  },
];

const LEVEL_COLORS: Record<string, string> = {
  Iniciante: Colors.success,
  Intermediário: Colors.warning,
  Avançado: Colors.primary,
};

export default function WorkoutsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Treinos</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryPill, i === 0 && styles.categoryPillActive]}
            >
              <Text
                style={[
                  styles.categoryText,
                  i === 0 && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.grid}>
          {WORKOUTS.map((w) => (
            <TouchableOpacity key={w.name} style={styles.card}>
              <Text style={styles.cardEmoji}>{w.emoji}</Text>
              <Text style={styles.cardName}>{w.name}</Text>
              <Text style={styles.cardMeta}>
                {w.exercises} exercícios · {w.duration}
              </Text>
              <View
                style={[
                  styles.levelBadge,
                  { backgroundColor: LEVEL_COLORS[w.level] + '22' },
                ]}
              >
                <Text
                  style={[styles.levelText, { color: LEVEL_COLORS[w.level] }]}
                >
                  {w.level}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 16 },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 16,
  },
  categoriesScroll: { marginBottom: 20 },
  categoriesContent: { gap: 8, paddingRight: 16 },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: { color: Colors.textMuted, fontSize: 14 },
  categoryTextActive: { color: '#fff', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 24 },
  card: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardEmoji: { fontSize: 28, marginBottom: 10 },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  cardMeta: { fontSize: 12, color: Colors.textMuted, marginBottom: 10 },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelText: { fontSize: 11, fontWeight: '600' },
});
