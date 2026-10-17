import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Platform, Animated, Linking, TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as ExpoLinking from 'expo-linking';
import { Colors } from '../constants/colors';
import {
  getSpotifyStatus,
  getSpotifyPlaylists,
  getSpotifyAuthUrl,
  connectSpotify as connectSpotifyBackend,
  searchYoutube,
} from '@gympro/api';

const SPOTIFY_GREEN = '#1DB954';
const YOUTUBE_RED = '#FF0000';

// ──────────────────────────────────────────────────────────────────────────────
// PKCE helpers (kept for code_challenge generation)
// ──────────────────────────────────────────────────────────────────────────────
function generateCodeVerifier(length = 128): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.crypto?.subtle) {
    const data = new TextEncoder().encode(verifier);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return verifier;
}

function generateState(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// YouTube IFrame
// ──────────────────────────────────────────────────────────────────────────────
const YT_PLAYLIST_ID = 'PLH6pfBXQXHJ8-Q14V6jY3HFlb1AXkZwVY';

function YouTubeIframe({ playlistId }: { playlistId: string }) {
  const containerRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = containerRef.current as unknown as HTMLElement | null;
    if (!el) return;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=0&controls=1&modestbranding=1&rel=0`;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.display = 'block';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    el.appendChild(iframe);
    return () => { if (el.contains(iframe)) el.removeChild(iframe); };
  }, [playlistId]);

  if (Platform.OS !== 'web') {
    return (
      <TouchableOpacity
        style={s.ytFallback}
        onPress={() => Linking.openURL(`https://www.youtube.com/playlist?list=${playlistId}`)}
        activeOpacity={0.8}
      >
        <View style={s.ytFallbackIcon}>
          <Ionicons name="logo-youtube" size={32} color={YOUTUBE_RED} />
        </View>
        <Text style={s.ytFallbackText}>Abrir playlist no YouTube</Text>
        <Ionicons name="open-outline" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  return <View ref={containerRef} style={s.youtubeContainer} />;
}

// ──────────────────────────────────────────────────────────────────────────────
// Animated equalizer
// ──────────────────────────────────────────────────────────────────────────────
function EqualizerBars({ active }: { active: boolean }) {
  const bar0 = useRef(new Animated.Value(0.4)).current;
  const bar1 = useRef(new Animated.Value(0.7)).current;
  const bar2 = useRef(new Animated.Value(0.5)).current;
  const bars = [bar0, bar1, bar2];

  useEffect(() => {
    if (!active) return;
    const animations = bars.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 280 + i * 90, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0.15, duration: 280 + i * 90, useNativeDriver: false }),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={s.equalizerRow}>
      {bars.map((anim, i) => (
        <Animated.View
          key={i}
          style={[s.equalizerBar, {
            height: anim.interpolate({ inputRange: [0, 1], outputRange: [5, 24] }),
            backgroundColor: i === 1 ? Colors.primary2 : Colors.primary,
          }]}
        />
      ))}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Fallback playlists (shown when Spotify not connected)
// ──────────────────────────────────────────────────────────────────────────────
type LocalPlaylist = {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  name: string;
  desc: string;
  color: string;
};

const FALLBACK_PLAYLISTS: LocalPlaylist[] = [
  { id: '1', icon: 'barbell', name: 'Power & Strength', desc: 'Metal, rock e beats intensos para levantar pesado', color: Colors.primary },
  { id: '2', icon: 'flash', name: 'HIIT Cardio', desc: 'BPM alto para sprints e circuitos explosivos', color: Colors.primary2 },
  { id: '3', icon: 'moon', name: 'Focus Flow', desc: 'Lo-fi e chill para treinos de longa duração', color: Colors.accent },
];

// ──────────────────────────────────────────────────────────────────────────────
// Screen
// ──────────────────────────────────────────────────────────────────────────────
export default function MusicScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyConnecting, setSpotifyConnecting] = useState(false);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<any[]>([]);

  const [ytQuery, setYtQuery] = useState('');
  const [ytResults, setYtResults] = useState<any[]>([]);
  const [ytSearching, setYtSearching] = useState(false);

  useEffect(() => {
    getSpotifyStatus()
      .then(({ connected }) => {
        setSpotifyConnected(connected);
        if (connected) {
          getSpotifyPlaylists()
            .then(data => setSpotifyPlaylists(data?.items ?? []))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  async function handleConnectSpotify() {
    setSpotifyConnecting(true);
    try {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      const state = generateState();
      const redirectUri = ExpoLinking.createURL('auth/spotify');
      const authUrl = await getSpotifyAuthUrl(redirectUri, challenge, state);
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      if (result.type === 'success' && result.url) {
        const parsed = ExpoLinking.parse(result.url);
        const code = (parsed.queryParams?.code as string) ?? '';
        if (code) {
          await connectSpotifyBackend(code, verifier, redirectUri);
          setSpotifyConnected(true);
          const data = await getSpotifyPlaylists();
          setSpotifyPlaylists(data?.items ?? []);
        }
      }
    } catch (e) {
      console.warn('Spotify auth error:', e);
    } finally {
      setSpotifyConnecting(false);
    }
  }

  async function handleYtSearch() {
    if (!ytQuery.trim()) { setYtResults([]); return; }
    setYtSearching(true);
    try {
      const data = await searchYoutube(ytQuery.trim());
      setYtResults(data?.items ?? []);
    } catch {
      setYtResults([]);
    } finally {
      setYtSearching(false);
    }
  }

  const playlistsToShow = spotifyConnected && spotifyPlaylists.length > 0 ? null : FALLBACK_PLAYLISTS;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Música</Text>
            <Text style={s.headerSub}>Mantenha o ritmo e a intensidade</Text>
          </View>
          <View style={s.headerIconGlow}>
            <Ionicons name="musical-notes" size={22} color={Colors.primary} />
          </View>
        </View>

        {/* ── Now Playing card ── */}
        <LinearGradient colors={[Colors.surface, Colors.surfaceElevated]} style={s.nowPlayingCard}>
          <View style={s.nowPlayingTop}>
            <Text style={s.sectionLabel}>REPRODUZINDO AGORA</Text>
            <EqualizerBars active={isPlaying} />
          </View>
          <View style={s.nowPlayingRow}>
            <LinearGradient colors={[Colors.primary, Colors.primary2]} style={s.albumArt}>
              <Ionicons name="musical-notes" size={28} color="#FFF" />
            </LinearGradient>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.trackTitle}>Treino Pesado 🔥</Text>
              <Text style={s.trackArtist}>GymPro Workout Playlist</Text>
            </View>
          </View>
          <View style={s.controlsRow}>
            <TouchableOpacity style={s.controlBtn} activeOpacity={0.7}>
              <Ionicons name="play-skip-back" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsPlaying(v => !v)} activeOpacity={0.85}>
              <LinearGradient colors={[Colors.primary, Colors.primary2]} style={s.playBtnInner}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={s.controlBtn} activeOpacity={0.7}>
              <Ionicons name="play-skip-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── YouTube section ── */}
        <View style={s.sectionCard}>
          <View style={[s.sectionStrip, { backgroundColor: YOUTUBE_RED }]} />
          <View style={s.sectionPad}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionIconWrap, { backgroundColor: YOUTUBE_RED + '22' }]}>
                <Ionicons name="logo-youtube" size={20} color={YOUTUBE_RED} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sectionTitle}>YouTube Workout</Text>
                <Text style={s.sectionSubtitle}>Pesquise ou veja a playlist</Text>
              </View>
            </View>

            {/* Search bar */}
            <View style={s.ytSearchRow}>
              <TextInput
                style={s.ytSearchInput}
                placeholder="Pesquisar workout..."
                placeholderTextColor={Colors.textTertiary}
                value={ytQuery}
                onChangeText={setYtQuery}
                onSubmitEditing={handleYtSearch}
                returnKeyType="search"
              />
              <TouchableOpacity style={s.ytSearchBtn} onPress={handleYtSearch} activeOpacity={0.8}>
                {ytSearching ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="search" size={18} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Results or default iframe */}
            {ytResults.length > 0 ? (
              <View style={{ gap: 8 }}>
                {ytResults.map((item: any) => (
                  <TouchableOpacity
                    key={item.videoId}
                    style={s.ytResultItem}
                    onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${item.videoId}`)}
                    activeOpacity={0.8}
                  >
                    <View style={s.ytResultIcon}>
                      <Ionicons name="logo-youtube" size={18} color={YOUTUBE_RED} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.ytResultTitle} numberOfLines={2}>{item.title}</Text>
                      <Text style={s.ytResultChannel}>{item.channelTitle}</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color={Colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <YouTubeIframe playlistId={YT_PLAYLIST_ID} />
            )}
          </View>
        </View>

        {/* ── Spotify section ── */}
        <View style={s.sectionCard}>
          <View style={[s.sectionStrip, { backgroundColor: SPOTIFY_GREEN }]} />
          <View style={s.sectionPad}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionIconWrap, { backgroundColor: SPOTIFY_GREEN + '22' }]}>
                <Ionicons name="musical-notes" size={20} color={SPOTIFY_GREEN} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sectionTitle}>Spotify</Text>
                <Text style={s.sectionSubtitle}>{spotifyConnected ? 'Conectado' : 'Conecte sua conta'}</Text>
              </View>
              {spotifyConnected && (
                <View style={s.connectedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={SPOTIFY_GREEN} />
                  <Text style={[s.connectedText, { color: SPOTIFY_GREEN }]}>Ativo</Text>
                </View>
              )}
            </View>

            {spotifyConnected ? (
              spotifyPlaylists.length > 0 ? (
                <View style={{ gap: 8 }}>
                  {spotifyPlaylists.slice(0, 5).map((pl: any) => (
                    <LinearGradient key={pl.id} colors={[SPOTIFY_GREEN + '20', SPOTIFY_GREEN + '06']} style={s.spotifyNowPlaying}>
                      <View style={s.spotifyTrackRow}>
                        <View style={[s.spotifyAlbumArt, { backgroundColor: SPOTIFY_GREEN + '30' }]}>
                          <Ionicons name="musical-note" size={22} color={SPOTIFY_GREEN} />
                        </View>
                        <View style={{ flex: 1, gap: 3 }}>
                          <Text style={s.trackTitle} numberOfLines={1}>{pl.name}</Text>
                          <Text style={s.trackArtist}>{pl.tracks?.total ?? ''}{pl.tracks?.total ? ' músicas' : 'Spotify'}</Text>
                        </View>
                        <TouchableOpacity
                          style={[s.miniPlayBtn, { backgroundColor: SPOTIFY_GREEN }]}
                          onPress={() => pl.external_urls?.spotify && Linking.openURL(pl.external_urls.spotify)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="play" size={14} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  ))}
                </View>
              ) : (
                <LinearGradient colors={[SPOTIFY_GREEN + '20', SPOTIFY_GREEN + '06']} style={s.spotifyNowPlaying}>
                  <View style={s.spotifyTrackRow}>
                    <View style={[s.spotifyAlbumArt, { backgroundColor: SPOTIFY_GREEN + '30' }]}>
                      <Ionicons name="musical-note" size={24} color={SPOTIFY_GREEN} />
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={s.trackTitle}>Spotify conectado</Text>
                      <Text style={s.trackArtist}>Suas playlists serão exibidas aqui</Text>
                    </View>
                  </View>
                </LinearGradient>
              )
            ) : (
              <TouchableOpacity
                style={[s.spotifyConnectBtn, spotifyConnecting && s.spotifyBtnDisabled]}
                onPress={handleConnectSpotify}
                disabled={spotifyConnecting}
                activeOpacity={0.85}
              >
                <Ionicons name="musical-notes" size={18} color="#FFF" />
                <Text style={s.spotifyBtnText}>{spotifyConnecting ? 'Conectando...' : 'Conectar Spotify'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Workout playlists grid (fallback when Spotify not connected) ── */}
        {playlistsToShow && (
          <View style={s.playlistsSection}>
            <Text style={s.sectionLabel}>PARA O SEU TREINO</Text>
            <View style={s.playlistsGrid}>
              {playlistsToShow.map(pl => (
                <TouchableOpacity key={pl.id} style={s.playlistCard} activeOpacity={0.85}>
                  <LinearGradient colors={[pl.color + '30', pl.color + '08']} style={s.playlistCardInner}>
                    <View style={[s.playlistIconWrap, { backgroundColor: pl.color + '28' }]}>
                      <Ionicons name={pl.icon} size={22} color={pl.color} />
                    </View>
                    <Text style={s.playlistName}>{pl.name}</Text>
                    <Text style={s.playlistDesc}>{pl.desc}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 20, paddingBottom: 60 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  headerIconGlow: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: Colors.primary + '25',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary + '40',
    shadowColor: Colors.primary, shadowRadius: 10, shadowOpacity: 0.4, elevation: 5,
  },

  nowPlayingCard: {
    borderRadius: 20, borderWidth: 1, borderColor: Colors.glassBorder,
    overflow: 'hidden', padding: 20, gap: 16,
    shadowColor: Colors.primary, shadowRadius: 16, shadowOpacity: 0.3, elevation: 8,
  },
  nowPlayingTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    color: Colors.textTertiary, textTransform: 'uppercase',
  },
  equalizerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 24 },
  equalizerBar: { width: 4, borderRadius: 2 },
  nowPlayingRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  albumArt: {
    width: 64, height: 64, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowRadius: 8, shadowOpacity: 0.4, elevation: 5,
  },
  trackTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  trackArtist: { fontSize: 13, color: Colors.textSecondary },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  controlBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  playBtnInner: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowRadius: 14, shadowOpacity: 0.5, elevation: 8,
  },

  sectionCard: {
    backgroundColor: Colors.surface, borderRadius: 20, borderWidth: 1,
    borderColor: Colors.glassBorder, overflow: 'hidden',
    shadowColor: '#000', shadowRadius: 12, shadowOpacity: 0.3, elevation: 6,
  },
  sectionStrip: { height: 3, width: '100%' },
  sectionPad: { padding: 18, gap: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  sectionSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  youtubeContainer: {
    width: '100%', height: 200, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000',
  },
  ytFallback: {
    height: 72, borderRadius: 12, backgroundColor: Colors.surfaceElevated,
    borderWidth: 1, borderColor: YOUTUBE_RED + '40',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12,
  },
  ytFallbackIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: YOUTUBE_RED + '20', alignItems: 'center', justifyContent: 'center',
  },
  ytFallbackText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.text },

  ytSearchRow: { flexDirection: 'row', gap: 8 },
  ytSearchInput: {
    flex: 1, backgroundColor: Colors.surfaceElevated, borderRadius: 10,
    padding: 10, color: Colors.text, fontSize: 14,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  ytSearchBtn: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: YOUTUBE_RED, alignItems: 'center', justifyContent: 'center',
  },
  ytResultItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceElevated, borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: Colors.glassBorder,
  },
  ytResultIcon: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: YOUTUBE_RED + '20', alignItems: 'center', justifyContent: 'center',
  },
  ytResultTitle: { fontSize: 13, fontWeight: '600', color: Colors.text, lineHeight: 18 },
  ytResultChannel: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },

  spotifyConnectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: SPOTIFY_GREEN, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
    shadowColor: SPOTIFY_GREEN, shadowRadius: 12, shadowOpacity: 0.4, elevation: 6,
  },
  spotifyBtnDisabled: { opacity: 0.6 },
  spotifyBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  spotifyNowPlaying: {
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: SPOTIFY_GREEN + '30',
  },
  spotifyTrackRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spotifyAlbumArt: {
    width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  miniPlayBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    shadowColor: SPOTIFY_GREEN, shadowRadius: 8, shadowOpacity: 0.4, elevation: 5,
  },
  connectedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: SPOTIFY_GREEN + '20', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: SPOTIFY_GREEN + '40',
  },
  connectedText: { fontSize: 11, fontWeight: '700' },

  playlistsSection: { gap: 14 },
  playlistsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  playlistCard: {
    width: '47%', borderRadius: 16, borderWidth: 1, borderColor: Colors.glassBorder, overflow: 'hidden',
  },
  playlistCardInner: { padding: 14, gap: 8 },
  playlistIconWrap: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  playlistName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  playlistDesc: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16 },
});
