// FeedScreen — Premium dark UI rewrite
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

const filters: Array<{ key: Filter; label: string }> = [
  { key: null,        label: 'Tudo'       },
  { key: 'treino',    label: 'Treinos'    },
  { key: 'evolucao',  label: 'Evolução'   },
  { key: 'conquista', label: 'Conquistas' },
];

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d atrás`;
  if (h > 0) return `${h}h atrás`;
  return 'agora';
}

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

export default function FeedScreen() {
  const { feed, addFeedPost } = useStore();
  const [filtro, setFiltro] = useState<Filter>(null);
  const [showModal, setShowModal] = useState(false);

  const postsFiltrados: FeedPost[] = filtro
    ? feed.filter((p: FeedPost) => p.tipo === filtro)
    : feed;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── HEADER ────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <Text style={s.title}>Feed</Text>
          <TouchableOpacity
            style={s.fabAdd}
            onPress={() => setShowModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ── FILTER CHIPS ──────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsRow}
        >
          {filters.map(f => {
            const ativo = filtro === f.key;
            return (
              <TouchableOpacity
                key={String(f.key)}
                style={[s.chip, ativo && s.chipAtivo]}
                onPress={() => setFiltro(f.key)}
                activeOpacity={0.75}
              >
                <Text style={[s.chipText, ativo && s.chipTextAtivo]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── POSTS ─────────────────────────────────────────── */}
        {postsFiltrados.map((post: FeedPost) => (
          <PostCard key={post.id} post={post} />
        ))}
      </ScrollView>

      <NovoPostModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onPublicar={(post: FeedPost) => {
          addFeedPost(post);
          setShowModal(false);
        }}
      />
    </SafeAreaView>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: FeedPost }) {
  const [curtido, setCurtido] = useState(false);

  const badgeStyle = post.tipo === 'treino'
    ? { bg: Colors.primary + '22', fg: Colors.primary }
    : post.tipo === 'evolucao'
    ? { bg: Colors.success + '22', fg: Colors.success }
    : { bg: Colors.accent + '22', fg: Colors.accent };

  return (
    <View style={s.card}>
      {/* TOP ROW */}
      <View style={s.cardTop}>
        <View style={s.avatar}>
          <Ionicons
            name={(post.avatarIcon as React.ComponentProps<typeof Ionicons>['name']) || 'person'}
            size={24}
            color={Colors.primary}
          />
        </View>
        <View style={s.authorInfo}>
          <Text style={s.authorName}>{post.autor}</Text>
          <Text style={s.authorTime}>{formatRelative(post.data)}</Text>
        </View>
        <View style={[s.tipoBadge, { backgroundColor: badgeStyle.bg }]}>
          <Text style={[s.tipoBadgeText, { color: badgeStyle.fg }]}>
            {tipoPostLabel[post.tipo]}
          </Text>
        </View>
      </View>

      {/* IMAGE AREA */}
      {post.imageIcon ? (
        <View style={s.imageArea}>
          <View style={[s.imageInner, { backgroundColor: badgeStyle.bg }]}>
            <Ionicons
              name={(post.imageIcon as React.ComponentProps<typeof Ionicons>['name']) || 'image'}
              size={40}
              color={badgeStyle.fg}
            />
          </View>
        </View>
      ) : null}

      {/* LEGENDA */}
      <Text style={s.legenda}>{post.legenda}</Text>

      {/* BOTTOM ROW */}
      <View style={s.bottomRow}>
        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => setCurtido(v => !v)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={curtido ? 'heart' : 'heart-outline'}
            size={18}
            color={curtido ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[s.actionText, curtido && { color: Colors.primary }]}>
            {post.curtidas + (curtido ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <Text style={s.postDate}>{formatDate(post.data)}</Text>
      </View>
    </View>
  );
}

// ─── New Post Modal ───────────────────────────────────────────────────────────

function NovoPostModal({
  visible,
  onClose,
  onPublicar,
}: {
  visible: boolean;
  onClose: () => void;
  onPublicar: (p: FeedPost) => void;
}) {
  const [legenda, setLegenda] = useState('');
  const [tipo, setTipo] = useState<TipoPost>('treino');

  function publicar() {
    const imageMap: Record<TipoPost, string> = {
      treino: 'barbell',
      evolucao: 'trending-up',
      conquista: 'trophy',
    };
    const novo: FeedPost = {
      id: Date.now().toString(),
      autor: 'Eu',
      avatarIcon: 'person',
      imageIcon: imageMap[tipo],
      legenda: legenda.trim() || 'Novo progresso!',
      curtidas: 0,
      tipo,
      data: new Date(),
    };
    onPublicar(novo);
    setLegenda('');
    setTipo('treino');
  }

  const tiposModal: TipoPost[] = ['treino', 'evolucao', 'conquista'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={m.container}>
        {/* Header */}
        <View style={m.header}>
          <Text style={m.headerTitle}>Nova publicação</Text>
          <TouchableOpacity style={m.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Type selector */}
        <Text style={m.sectionLabel}>TIPO</Text>
        <View style={m.typeRow}>
          {tiposModal.map(t => (
            <TouchableOpacity
              key={t}
              style={[m.typeChip, tipo === t && m.typeChipAtivo]}
              onPress={() => setTipo(t)}
              activeOpacity={0.75}
            >
              <Text style={[m.typeChipText, tipo === t && m.typeChipTextAtivo]}>
                {tipoPostLabel[t]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legenda input */}
        <Text style={m.sectionLabel}>LEGENDA</Text>
        <TextInput
          style={m.input}
          placeholder="O que você quer compartilhar?"
          placeholderTextColor={Colors.textTertiary}
          value={legenda}
          onChangeText={setLegenda}
          multiline
          textAlignVertical="top"
        />

        {/* Publish button */}
        <TouchableOpacity
          style={m.publishBtn}
          onPress={publicar}
          activeOpacity={0.85}
        >
          <Text style={m.publishBtnText}>Publicar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 14, paddingBottom: 40 },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  fabAdd: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowRadius: 12,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },

  // Filter chips
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    height: 34,
    borderRadius: 100,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  chipAtivo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowRadius: 10,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextAtivo: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Post card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowRadius: 6,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Card top row
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '44',
  },
  authorInfo: { flex: 1 },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  authorTime: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  tipoBadge: {
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tipoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Image area
  imageArea: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },

  // Image inner
  imageInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Caption
  legenda: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },

  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  postDate: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginLeft: 'auto',
  },
});

const m = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: -6,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 100,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  typeChipAtivo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowRadius: 10,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeChipTextAtivo: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 14,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    textAlignVertical: 'top',
  },
  publishBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowRadius: 16,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    marginTop: 4,
  },
  publishBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
