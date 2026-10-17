// GymsAndProfessionalsMapViews — premium dark UI rewrite
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, TextInput,
  TouchableOpacity, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getNearbyGyms, getConnections } from '@gympro/api';

// SP fallback coords (expo-location not installed)
const SP_LAT = -23.55;
const SP_LNG = -46.63;

interface Academia {
  id: string;
  nome: string;
  endereco: string;
  avaliacao: number;
  modalidades: string[];
  distance_km?: number;
  is_open?: boolean;
}

interface Connection {
  id: number;
  connection_type: string;
  status: string;
  requester_name: string | null;
  target_name: string | null;
}

const MODALIDADES_OPCOES = [
  'Musculação', 'Crossfit', 'Yoga', 'Pilates', 'Natação',
  'Futebol', 'Basquete', 'Ciclismo', 'Boxe', 'Artes Marciais',
];

type Tab = 'academias' | 'profissionais';

export default function MapsScreen() {
  const [tab, setTab] = useState<Tab>('academias');
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    Promise.all([
      getNearbyGyms(SP_LAT, SP_LNG, 20),
      getConnections('accepted'),
    ]).then(([gymsData, connsData]: [any[], any[]]) => {
      const mapped: Academia[] = (Array.isArray(gymsData) ? gymsData : []).map(g => ({
        id: String(g.id),
        nome: g.gym_name ?? g.name ?? '—',
        endereco: g.gym_address ?? g.address ?? '—',
        avaliacao: 0,
        modalidades: g.specialty ? [g.specialty] : [],
        distance_km: g.distance_km,
      }));
      setAcademias(mapped);
      setConnections(Array.isArray(connsData) ? connsData : []);
    })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerTitle}>Academias &amp; Profissionais</Text>
          <Text style={s.headerSub}>Encontre perto de você</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ── Segment Tabs ── */}
      <View style={s.segmentWrapper}>
        <View style={s.segment}>
          <TouchableOpacity
            style={[s.segTab, tab === 'academias' && s.segTabActive]}
            onPress={() => setTab('academias')}
          >
            <Ionicons
              name="barbell"
              size={14}
              color={tab === 'academias' ? '#FFF' : Colors.textTertiary}
            />
            <Text style={[s.segLabel, tab === 'academias' && s.segLabelActive]}>
              Academias
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.segTab, tab === 'profissionais' && s.segTabActive]}
            onPress={() => setTab('profissionais')}
          >
            <Ionicons
              name="person"
              size={14}
              color={tab === 'profissionais' ? '#FFF' : Colors.textTertiary}
            />
            <Text style={[s.segLabel, tab === 'profissionais' && s.segLabelActive]}>
              Profissionais
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Content ── */}
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'academias' ? (
          <>
            <Text style={s.sectionLabel}>
              {loading ? 'BUSCANDO...' : `${academias.length} ACADEMIAS ENCONTRADAS`}
            </Text>
            {loading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
            ) : academias.length === 0 ? (
              <EmptyState icon="barbell-outline" text="Nenhuma academia encontrada" />
            ) : (
              academias.map(ac => <AcademiaCard key={ac.id} academia={ac} />)
            )}
          </>
        ) : (
          <>
            <Text style={s.sectionLabel}>
              {loading ? 'BUSCANDO...' : `${connections.length} PROFISSIONAIS VINCULADOS`}
            </Text>
            {loading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
            ) : connections.length === 0 ? (
              <EmptyState icon="person-outline" text="Nenhum profissional vinculado" />
            ) : (
              connections.map(pro => (
                <ProfissionalCard key={pro.id} profissional={pro} />
              ))
            )}
          </>
        )}
      </ScrollView>

      <NovaAcademiaModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSalvar={nova => {
          setAcademias(v => [...v, nova]);
          setShowModal(false);
        }}
      />
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AcademiaCard({ academia }: { academia: Academia }) {
  return (
    <View style={c.card}>
      <View style={c.topStrip} />
      <View style={c.cardInner}>
        <View style={c.cardRow}>
          <View style={c.iconCircle}>
            <Ionicons name="barbell" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={c.name}>{academia.nome}</Text>
            <Text style={c.address}>{academia.endereco}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View style={c.ratingChip}>
              <Ionicons name="star" size={11} color={Colors.primary2} />
              <Text style={c.ratingText}> {academia.avaliacao.toFixed(1)}</Text>
            </View>
            {academia.distance_km !== undefined && (
              <Text style={c.distText}>{academia.distance_km.toFixed(1)} km</Text>
            )}
            {academia.is_open !== undefined && (
              <View style={[c.openChip, { backgroundColor: academia.is_open ? Colors.success + '22' : '#FF6B6B22' }]}>
                <Text style={[c.openText, { color: academia.is_open ? Colors.success : '#FF6B6B' }]}>
                  {academia.is_open ? 'Aberta' : 'Fechada'}
                </Text>
              </View>
            )}
          </View>
        </View>
        {academia.modalidades.length > 0 && (
          <View style={c.tagsRow}>
            {academia.modalidades.map(m => (
              <View key={m} style={c.tag}>
                <Text style={c.tagText}>{m}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function ProfissionalCard({ profissional }: { profissional: Connection }) {
  const nome = profissional.target_name ?? profissional.requester_name ?? 'Profissional';
  const tipo = profissional.connection_type === 'nutritionist' ? 'Nutricionista' : 'Personal Trainer';
  return (
    <View style={c.card}>
      <View style={[c.topStrip, { backgroundColor: Colors.accent }]} />
      <View style={c.cardInner}>
        <View style={c.cardRow}>
          <View style={[c.iconCircle, { backgroundColor: Colors.accent + '22' }]}>
            <Ionicons name="person" size={22} color={Colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={c.name}>{nome}</Text>
            <Text style={c.address}>{tipo}</Text>
          </View>
          <TouchableOpacity style={c.agendarBtn}>
            <Text style={c.agendarText}>Ver perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function EmptyState({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={s.emptyState}>
      <Ionicons name={icon} size={52} color={Colors.textTertiary} />
      <Text style={s.emptyText}>{text}</Text>
    </View>
  );
}

function NovaAcademiaModal({
  visible, onClose, onSalvar,
}: { visible: boolean; onClose: () => void; onSalvar: (a: Academia) => void }) {
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [selectedModalidades, setSelectedModalidades] = useState<string[]>([]);

  function toggleModalidade(m: string) {
    setSelectedModalidades(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m],
    );
  }

  function handleSalvar() {
    onSalvar({
      id: Date.now().toString(),
      nome: nome.trim() || 'Nova Academia',
      endereco: endereco.trim() || '—',
      avaliacao: 0,
      modalidades: selectedModalidades,
    });
    setNome('');
    setEndereco('');
    setSelectedModalidades([]);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={m.overlay}>
        <View style={m.sheet}>
          {/* Handle */}
          <View style={m.handle} />
          <Text style={m.title}>Nova Academia</Text>

          <Text style={m.fieldLabel}>NOME</Text>
          <TextInput
            style={m.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome da academia"
            placeholderTextColor={Colors.textTertiary}
          />

          <Text style={m.fieldLabel}>ENDEREÇO</Text>
          <TextInput
            style={m.input}
            value={endereco}
            onChangeText={setEndereco}
            placeholder="Endereço completo"
            placeholderTextColor={Colors.textTertiary}
          />

          <Text style={m.fieldLabel}>MODALIDADES</Text>
          <View style={m.chipsGrid}>
            {MODALIDADES_OPCOES.map(mod => {
              const active = selectedModalidades.includes(mod);
              return (
                <TouchableOpacity
                  key={mod}
                  style={[m.chip, active && m.chipActive]}
                  onPress={() => toggleModalidade(mod)}
                >
                  <Text style={[m.chipText, active && m.chipTextActive]}>{mod}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={m.btns}>
            <TouchableOpacity style={m.btnSec} onPress={onClose}>
              <Text style={m.btnSecText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.btnPri} onPress={handleSalvar}>
              <Text style={m.btnPriText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerLeft: { gap: 2 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: Colors.textSecondary },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowRadius: 12, shadowOpacity: 0.4, elevation: 6,
  },

  segmentWrapper: { paddingHorizontal: 20, paddingBottom: 12 },
  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  segTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 9, borderRadius: 10,
  },
  segTabActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowRadius: 10, shadowOpacity: 0.35, elevation: 4,
  },
  segLabel: { fontSize: 13, fontWeight: '600', color: Colors.textTertiary },
  segLabelActive: { color: '#FFF', fontWeight: '700' },

  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textTertiary,
    letterSpacing: 1.2, marginBottom: 4,
  },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textTertiary },
});

const c = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: 18,
    borderWidth: 1, borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowColor: '#000', shadowRadius: 8, shadowOpacity: 0.2, elevation: 4,
  },
  topStrip: { height: 2, backgroundColor: Colors.primary },
  cardInner: { padding: 16, gap: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  address: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  ratingChip: { flexDirection: 'row', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  ratingText: { fontSize: 12, fontWeight: '700', color: Colors.primary2, marginLeft: 2 },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: {
    backgroundColor: Colors.surfaceElevated, borderRadius: 8,
    paddingHorizontal: 9, paddingVertical: 4,
  },
  tagText: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600' },
  distText: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600' },
  openChip: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  openText: { fontSize: 10, fontWeight: '700' },
  price: { fontSize: 14, fontWeight: '700', color: Colors.primary2 },
  agendarBtn: {
    backgroundColor: Colors.accent, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  agendarText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, gap: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.glassBorder, alignSelf: 'center', marginBottom: 4,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 1.2,
  },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    color: Colors.text, fontSize: 15, borderWidth: 1, borderColor: Colors.glassBorder,
  },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.glassBorder,
  },
  chipActive: {
    backgroundColor: Colors.primary + '22', borderColor: Colors.primary,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.textTertiary },
  chipTextActive: { color: Colors.primary },
  btns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnPri: {
    flex: 1, backgroundColor: Colors.primary, borderRadius: 14,
    padding: 15, alignItems: 'center',
    shadowColor: Colors.primary, shadowRadius: 12, shadowOpacity: 0.35, elevation: 6,
  },
  btnPriText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  btnSec: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 14,
    padding: 15, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  btnSecText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 15 },
});
