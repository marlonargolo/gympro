import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Modal, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getFeed, createPost, toggleLike } from '@gympro/api';

type TipoPost = 'treino' | 'evolucao' | 'conquista';
type Filter = TipoPost | null;

const tipoPostLabel: Record<TipoPost, string> = {
  treino: 'Treino',
  evolucao: 'Evolução',
  conquista: 'Conquista',
};

const filters: Array<{ key: Filter; label: string }> = [
  { key: null,        label: 'Tudo'       },
  { key: 'treino',    label: 'Treinos'    },
  { key: 'evolucao',  label: 'Evolução'   },
  { key: 'conquista', label: 'Conquistas' },
];

interface ApiPost {
  id: string | number;
  author: { full_name: string };
  caption: string;
  likes_count: number;
  tipo: TipoPost;
  is_liked: boolean;
  created_at: string;
}

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
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filter>(null);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    try {
      const data = await getFeed();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleToggleLike(postId: string | number) {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
        : p
    ));
    try {
      await toggleLike(String(postId));
    } catch {
      // revert on error
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      ));
    }
  }

  async function handleCreate(caption: string, tipo: TipoPost) {
    try {
      await createPost({ caption, tipo });
      setShowModal(false);
      setLoading(true);
      await load();
    } catch {
      Alert.alert('Erro', 'Não foi possível publicar.');
    }
  }

  const postsFiltrados = filtro
    ? posts.filter(p => p.tipo === filtro)
    : posts;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
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

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : postsFiltrados.length === 0 ? (
          <View style={s.emptyWrap}>
            <Ionicons name="newspaper-outline" size={40} color={Colors.textTertiary} />
            <Text style={s.emptyText}>Nenhuma publicação</Text>
          </View>
        ) : (
          postsFiltrados.map(post => (
            <PostCard key={String(post.id)} post={post} onToggleLike={handleToggleLike} />
          ))
        )}
      </ScrollView>

      <NovoPostModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onPublicar={handleCreate}
      />
    </SafeAreaView>
  );
}

function PostCard({
  post,
  onToggleLike,
}: {
  post: ApiPost;
  onToggleLike: (id: string | number) => void;
}) {
  const badgeStyle = post.tipo === 'treino'
    ? { bg: Colors.primary + '22', fg: Colors.primary }
    : post.tipo === 'evolucao'
    ? { bg: Colors.success + '22', fg: Colors.success }
    : { bg: Colors.accent + '22', fg: Colors.accent };

  const iconMap: Record<TipoPost, React.ComponentProps<typeof Ionicons>['name']> = {
    treino: 'barbell',
    evolucao: 'trending-up',
    conquista: 'trophy',
  };

  const date = new Date(post.created_at);

  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={s.avatar}>
          <Ionicons name="person" size={24} color={Colors.primary} />
        </View>
        <View style={s.authorInfo}>
          <Text style={s.authorName}>{post.author?.full_name ?? 'Usuário'}</Text>
          <Text style={s.authorTime}>{formatRelative(date)}</Text>
        </View>
        <View style={[s.tipoBadge, { backgroundColor: badgeStyle.bg }]}>
          <Text style={[s.tipoBadgeText, { color: badgeStyle.fg }]}>
            {tipoPostLabel[post.tipo]}
          </Text>
        </View>
      </View>

      <View style={s.imageArea}>
        <View style={[s.imageInner, { backgroundColor: badgeStyle.bg }]}>
          <Ionicons name={iconMap[post.tipo]} size={40} color={badgeStyle.fg} />
        </View>
      </View>

      <Text style={s.legenda}>{post.caption}</Text>

      <View style={s.bottomRow}>
        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => onToggleLike(post.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={post.is_liked ? 'heart' : 'heart-outline'}
            size={18}
            color={post.is_liked ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[s.actionText, post.is_liked && { color: Colors.primary }]}>
            {post.likes_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <Text style={s.postDate}>{formatDate(date)}</Text>
      </View>
    </View>
  );
}

function NovoPostModal({
  visible,
  onClose,
  onPublicar,
}: {
  visible: boolean;
  onClose: () => void;
  onPublicar: (caption: string, tipo: TipoPost) => void;
}) {
  const [legenda, setLegenda] = useState('');
  const [tipo, setTipo] = useState<TipoPost>('treino');
  const [saving, setSaving] = useState(false);

  async function publicar() {
    setSaving(true);
    try {
      await onPublicar(legenda.trim() || 'Novo progresso!', tipo);
      setLegenda('');
      setTipo('treino');
    } finally {
      setSaving(false);
    }
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
        <View style={m.header}>
          <Text style={m.headerTitle}>Nova publicação</Text>
          <TouchableOpacity style={m.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

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

        <TouchableOpacity
          style={[m.publishBtn, saving && { opacity: 0.6 }]}
          onPress={publicar}
          activeOpacity={0.85}
          disabled={saving}
        >
          <Text style={m.publishBtnText}>{saving ? 'Publicando...' : 'Publicar'}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 14, paddingBottom: 40 },

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
  imageInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  legenda: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },

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

  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textTertiary,
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
