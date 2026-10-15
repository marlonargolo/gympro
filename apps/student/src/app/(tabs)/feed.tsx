// FeedView — faithful port of Models/Views/Feed/FeedView.swift
import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useStore } from '../../context/StoreContext';
import type { FeedPost, TipoPost } from '../../data/types';
import { tipoPostLabel } from '../../data/types';

type Filter = TipoPost | null;

const filters: Array<{ key: Filter; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { key: null, label: 'Tudo', icon: 'apps' },
  { key: 'treino', label: 'Treinos', icon: 'barbell' },
  { key: 'evolucao', label: 'Evolução', icon: 'trending-up' },
  { key: 'conquista', label: 'Conquistas', icon: 'trophy' },
];

const tipoIcon: Record<TipoPost, React.ComponentProps<typeof Ionicons>['name']> = {
  treino: 'barbell',
  evolucao: 'trending-up',
  conquista: 'trophy',
};

const imageIcons: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  barbell: 'barbell',
  'trending-up': 'trending-up',
  trophy: 'trophy',
  flame: 'flame',
  person: 'person',
};

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d atrás`;
  if (h > 0) return `${h}h atrás`;
  return 'agora';
}

export default function FeedScreen() {
  const { feed, addFeedPost } = useStore();
  const [filtro, setFiltro] = useState<Filter>(null);
  const [showModal, setShowModal] = useState(false);

  const postsFiltrados = filtro ? feed.filter(p => p.tipo === filtro) : feed;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.headerRow}>
          <Text style={s.title}>Comunidade</Text>
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {filters.map(f => (
            <TouchableOpacity
              key={String(f.key)}
              onPress={() => setFiltro(f.key)}
              style={[s.chip, filtro === f.key && s.chipAtivo]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={f.icon}
                size={13}
                color={filtro === f.key ? '#FFF' : Colors.textSecondary}
              />
              <Text style={[s.chipText, filtro === f.key && s.chipTextAtivo]}> {f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Posts */}
        {postsFiltrados.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </ScrollView>

      <NovoPostModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onPublicar={(post) => { addFeedPost(post); setShowModal(false); }}
      />
    </SafeAreaView>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  const [curtido, setCurtido] = useState(false);
  const iconName = (imageIcons[post.imageIcon] || 'barbell') as React.ComponentProps<typeof Ionicons>['name'];

  return (
    <View style={s.card}>
      {/* Author row */}
      <View style={s.authorRow}>
        <View style={s.avatarCircle}>
          <Ionicons name="person" size={20} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.authorName}>{post.autor}</Text>
          <Text style={s.authorMeta}>
            {tipoPostLabel[post.tipo]} · {formatRelative(post.data)}
          </Text>
        </View>
      </View>

      {/* Image area */}
      <View style={s.imageArea}>
        <Ionicons name={iconName} size={72} color={Colors.primary} style={{ opacity: 0.85 }} />
      </View>

      {/* Caption + actions */}
      <View style={s.footerArea}>
        <Text style={s.legenda}>{post.legenda}</Text>
        <View style={s.actions}>
          <TouchableOpacity onPress={() => setCurtido(v => !v)} style={s.actionBtn}>
            <Ionicons
              name={curtido ? 'heart' : 'heart-outline'}
              size={18}
              color={curtido ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[s.actionText, curtido && { color: Colors.primary }]}>
              {post.curtidas + (curtido ? 1 : 0)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn}>
            <Ionicons name="share-outline" size={18} color={Colors.textSecondary} />
            <Text style={s.actionText}>Compartilhar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function NovoPostModal({
  visible, onClose, onPublicar,
}: {
  visible: boolean;
  onClose: () => void;
  onPublicar: (p: FeedPost) => void;
}) {
  const [legenda, setLegenda] = useState('');
  const [tipo, setTipo] = useState<TipoPost>('treino');

  function publicar() {
    const novo: FeedPost = {
      id: Date.now().toString(),
      autor: 'Você',
      avatarIcon: 'person',
      imageIcon: tipo === 'treino' ? 'barbell' : tipo === 'evolucao' ? 'trending-up' : 'trophy',
      legenda: legenda || 'Novo progresso!',
      curtidas: 0,
      tipo,
      data: new Date(),
    };
    onPublicar(novo);
    setLegenda('');
    setTipo('treino');
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={s.modalCard}>
          <Text style={s.modalTitle}>Novo post</Text>
          <TextInput
            style={s.input}
            placeholder="O que você quer compartilhar?"
            placeholderTextColor={Colors.textTertiary}
            value={legenda}
            onChangeText={setLegenda}
            multiline
          />
          <Text style={[s.chipText, { color: Colors.textSecondary, marginBottom: 6 }]}>Tipo:</Text>
          <View style={s.chips}>
            {(['treino', 'evolucao', 'conquista'] as TipoPost[]).map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setTipo(t)}
                style={[s.chip, tipo === t && s.chipAtivo]}
              >
                <Text style={[s.chipText, tipo === t && s.chipTextAtivo]}>
                  {tipoPostLabel[t]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity style={s.btnSecondary} onPress={onClose}>
              <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnPrimary} onPress={publicar}>
              <Text style={{ color: '#FFF', fontWeight: '700' }}>Publicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 16, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text },
  chips: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipAtivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  chipTextAtivo: { color: '#FFF' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  authorName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  authorMeta: { fontSize: 11, color: Colors.textTertiary },
  imageArea: {
    height: 200,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerArea: { padding: 14, gap: 10 },
  legenda: { fontSize: 14, color: Colors.text },
  actions: { flexDirection: 'row', gap: 18 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 14,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlignVertical: 'top',
  },
  btnPrimary: {
    flex: 1, backgroundColor: Colors.primary, borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  btnSecondary: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
});
