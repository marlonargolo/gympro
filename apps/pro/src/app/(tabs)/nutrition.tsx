import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  FlatList, ScrollView, Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getNutritionPlans, createNutritionPlan } from '@gympro/api';

interface PlanoNutricional {
  id: number;
  titulo: string;
  objetivo: 'emagrecimento' | 'manutencao' | 'hipertrofia';
  calorias_diarias: number;
  proteinas_g: number;
  carboidratos_g: number;
  gorduras_g: number;
}

const OBJETIVOS = {
  emagrecimento: { label: 'Emagrecimento', color: '#FF6B6B' },
  manutencao: { label: 'Manutenção', color: '#FFD93D' },
  hipertrofia: { label: 'Hipertrofia', color: '#4DD68C' },
};

type ObjetivoKey = keyof typeof OBJETIVOS;

function MacroBadge({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <View style={[macro.wrap, { borderColor: color + '44', backgroundColor: color + '18' }]}>
      <Text style={[macro.value, { color }]}>{value}{unit}</Text>
      <Text style={macro.label}>{label}</Text>
    </View>
  );
}

function PlanoCard({ item }: { item: PlanoNutricional }) {
  const obj = OBJETIVOS[item.objetivo] ?? OBJETIVOS.manutencao;
  return (
    <TouchableOpacity style={card.wrap} activeOpacity={0.8}>
      <View style={[card.strip, { backgroundColor: obj.color }]} />
      <View style={card.body}>
        <View style={card.top}>
          <View style={{ flex: 1 }}>
            <Text style={card.titulo}>{item.titulo}</Text>
            <View style={[card.badge, { backgroundColor: obj.color + '25', borderColor: obj.color + '55' }]}>
              <Text style={[card.badgeText, { color: obj.color }]}>{obj.label}</Text>
            </View>
          </View>
        </View>
        <View style={card.macros}>
          <MacroBadge label="kcal" value={item.calorias_diarias} unit="" color={Colors.primary} />
          <MacroBadge label="Prot" value={item.proteinas_g} unit="g" color="#7388FF" />
          <MacroBadge label="Carbo" value={item.carboidratos_g} unit="g" color="#FFD93D" />
          <MacroBadge label="Gord" value={item.gorduras_g} unit="g" color="#FF9E26" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function NutritionScreen() {
  const [planos, setPlanos] = useState<PlanoNutricional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [objetivo, setObjetivo] = useState<ObjetivoKey>('hipertrofia');
  const [calorias, setCalorias] = useState('');
  const [proteinas, setProteinas] = useState('');
  const [carboidratos, setCarboidratos] = useState('');
  const [gorduras, setGorduras] = useState('');

  async function load() {
    try {
      const data = await getNutritionPlans();
      setPlanos(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!titulo.trim()) { Alert.alert('Título obrigatório'); return; }
    setSaving(true);
    try {
      await createNutritionPlan({
        titulo: titulo.trim(),
        objetivo,
        calorias_diarias: Number(calorias) || 0,
        proteinas_g: Number(proteinas) || 0,
        carboidratos_g: Number(carboidratos) || 0,
        gorduras_g: Number(gorduras) || 0,
      });
      setShowModal(false);
      setTitulo(''); setCalorias(''); setProteinas(''); setCarboidratos(''); setGorduras('');
      setLoading(true);
      await load();
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o plano.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Nutrição</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={s.addBtnText}>Novo plano</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.summaryRow}>
            <View style={s.summaryCard}>
              <Text style={s.summaryValue}>{planos.length}</Text>
              <Text style={s.summaryLabel}>Planos ativos</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={[s.summaryValue, { color: '#4DD68C' }]}>
                {planos.filter(p => p.objetivo === 'hipertrofia').length}
              </Text>
              <Text style={s.summaryLabel}>Hipertrofia</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={[s.summaryValue, { color: '#FF6B6B' }]}>
                {planos.filter(p => p.objetivo === 'emagrecimento').length}
              </Text>
              <Text style={s.summaryLabel}>Emagrecimento</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={[s.summaryValue, { color: '#FFD93D' }]}>
                {planos.filter(p => p.objetivo === 'manutencao').length}
              </Text>
              <Text style={s.summaryLabel}>Manutenção</Text>
            </View>
          </ScrollView>

          <FlatList
            data={planos}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <PlanoCard item={item} />}
            ListEmptyComponent={
              <View style={s.empty}>
                <Ionicons name="nutrition-outline" size={40} color={Colors.textMuted} />
                <Text style={s.emptyText}>Nenhum plano nutricional criado</Text>
              </View>
            }
          />
        </>
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <ScrollView style={m.container} contentContainerStyle={{ gap: 12, paddingBottom: 40 }}>
          <View style={m.header}>
            <Text style={m.title}>Novo Plano Nutricional</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={m.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={m.label}>TÍTULO</Text>
          <TextInput
            style={m.input}
            placeholder="Ex: Cutting Avançado"
            placeholderTextColor={Colors.textMuted}
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={m.label}>OBJETIVO</Text>
          <View style={m.chipRow}>
            {(Object.keys(OBJETIVOS) as ObjetivoKey[]).map(key => (
              <TouchableOpacity
                key={key}
                style={[m.chip, objetivo === key && { backgroundColor: OBJETIVOS[key].color, borderColor: OBJETIVOS[key].color }]}
                onPress={() => setObjetivo(key)}
              >
                <Text style={[m.chipText, objetivo === key && { color: '#fff' }]}>
                  {OBJETIVOS[key].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={m.label}>CALORIAS DIÁRIAS</Text>
          <TextInput style={m.input} placeholder="2400" placeholderTextColor={Colors.textMuted} value={calorias} onChangeText={setCalorias} keyboardType="numeric" />

          <Text style={m.label}>PROTEÍNAS (g)</Text>
          <TextInput style={m.input} placeholder="180" placeholderTextColor={Colors.textMuted} value={proteinas} onChangeText={setProteinas} keyboardType="numeric" />

          <Text style={m.label}>CARBOIDRATOS (g)</Text>
          <TextInput style={m.input} placeholder="250" placeholderTextColor={Colors.textMuted} value={carboidratos} onChangeText={setCarboidratos} keyboardType="numeric" />

          <Text style={m.label}>GORDURAS (g)</Text>
          <TextInput style={m.input} placeholder="70" placeholderTextColor={Colors.textMuted} value={gorduras} onChangeText={setGorduras} keyboardType="numeric" />

          <TouchableOpacity style={[m.saveBtn, saving && { opacity: 0.6 }]} onPress={handleCreate} disabled={saving}>
            <Text style={m.saveBtnText}>{saving ? 'Criando...' : 'Criar Plano'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

const macro = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  value: { fontSize: 14, fontWeight: '700' },
  label: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
});

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1,
    borderColor: Colors.border, overflow: 'hidden', flexDirection: 'row',
  },
  strip: { width: 4 },
  body: { flex: 1, padding: 14, gap: 12 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  titulo: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  badge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  macros: { flexDirection: 'row', gap: 8 },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  summaryRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 16 },
  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1,
    borderColor: Colors.border, padding: 14, minWidth: 100, alignItems: 'center', gap: 4,
  },
  summaryValue: { fontSize: 24, fontWeight: '800', color: Colors.text },
  summaryLabel: { fontSize: 11, color: Colors.textMuted },
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted },
});

const m = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text },
  close: { fontSize: 20, color: Colors.textMuted, padding: 4 },
  label: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginBottom: -4 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 10, padding: 12,
    color: Colors.text, fontSize: 14, borderWidth: 1, borderColor: Colors.border,
  },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
    borderColor: Colors.border, alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
