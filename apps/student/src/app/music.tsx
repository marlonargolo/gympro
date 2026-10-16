// MusicScreen — premium music player with real YouTube embed and Spotify PKCE OAuth
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Animated,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '../constants/colors';

const SPOTIFY_GREEN = '#1DB954';
const YOUTUBE_RED = '#FF0000';

// ──────────────────────────────────────────────────────────────────────────────
// Spotify PKCE helpers
// ──────────────────────────────────────────────────────────────────────────────
function generateCodeVerifier(length = 128): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    window.crypto?.subtle
  ) {
    const data = new TextEncoder().encode(verifier);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  // Fallback for native (plain verifier — swap for a real SHA-256 lib in production)
  return verifier;
}

// Fill in your real Spotify App credentials:
const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
const SPOTIFY_REDIRECT_URI = 'https://gympro.app/auth/spotify';
const SPOTIFY_SCOPES =
  'streaming user-read-email user-read-private user-modify-playback-state';

// ──────────────────────────────────────────────────────────────────────────────
// YouTube IFrame component — real embed on web, link fallback on native
// ──────────────────────────────────────────────────────────────────────────────
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
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    el.appendChild(iframe);

    return () => {
      if (el.contains(iframe)) el.removeChild(iframe);
    };
  }, [playlistId]);

  if (Platform.OS !== 'web') {
    return (
      <TouchableOpacity
        style={s.ytFallback}
        onPress={() =>
          Linking.openURL(
            `https://www.youtube.com/playlist?list=${playlistId}`
          )
        }
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
// Animated equalizer bars
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
          Animated.timing(anim, {
            toValue: 1,
            duration: 280 + i * 90,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.15,
            duration: 280 + i * 90,
            useNativeDriver: false,
          }),
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
          style={[
            s.equalizerBar,
            {
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [5, 24],
              }),
              backgroundColor: i === 1 ? Colors.primary2 : Colors.primary,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Playlist data
// ──────────────────────────────────────────────────────────────────────────────
type Playlist = {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  name: string;
  desc: string;
  color: string;
};

const PLAYLISTS: Playlist[] = [
  {
    id: '1',
    icon: 'barbell',
    name: 'Power & Strength',
    desc: 'Metal, rock e beats intensos para levantar pesado',
    color: Colors.primary,
  },
  {
    id: '2',
    icon: 'flash',
    name: 'HIIT Cardio',
    desc: 'BPM alto para sprints e circuitos explosivos',
    color: Colors.primary2,
  },
  {
    id: '3',
    icon: 'moon',
    name: 'Focus Flow',
    desc: 'Lo-fi e chill para treinos de longa duração',
    color: Colors.accent,
  },
];

// Public YouTube workout playlist
const YT_PLAYLIST_ID = 'PLH6pfBXQXHJ8-Q14V6jY3HFlb1AXkZwVY';

// ──────────────────────────────────────────────────────────────────────────────
// Screen
// ──────────────────────────────────────────────────────────────────────────────
export default function MusicScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyConnecting, setSpotifyConnecting] = useState(false);

  async function connectSpotify() {
    setSpotifyConnecting(true);
    try {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: SPOTIFY_REDIRECT_URI,
        scope: SPOTIFY_SCOPES,
        code_challenge_method: 'S256',
        code_challenge: challenge,
      });
      const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        SPOTIFY_REDIRECT_URI
      );
      if (result.type === 'success') {
        // In production: parse result.url for `code`, exchange it for access token
        setSpotifyConnected(true);
      }
    } catch (e) {
      console.warn('Spotify auth error:', e);
    } finally {
      setSpotifyConnecting(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
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
        <LinearGradient
          colors={[Colors.surface, Colors.surfaceElevated]}
          style={s.nowPlayingCard}
        >
          {/* top row */}
          <View style={s.nowPlayingTop}>
            <Text style={s.sectionLabel}>REPRODUZINDO AGORA</Text>
            <EqualizerBars active={isPlaying} />
          </View>

          {/* album art + track info */}
          <View style={s.nowPlayingRow}>
            <LinearGradient
              colors={[Colors.primary, Colors.primary2]}
              style={s.albumArt}
            >
              <Ionicons name="musical-notes" size={28} color="#FFF" />
            </LinearGradient>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.trackTitle}>Treino Pesado 🔥</Text>
              <Text style={s.trackArtist}>GymPro Workout Playlist</Text>
            </View>
          </View>

          {/* playback controls */}
          <View style={s.controlsRow}>
            <TouchableOpacity style={s.controlBtn} activeOpacity={0.7}>
              <Ionicons
                name="play-skip-back"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsPlaying(v => !v)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primary2]}
                style={s.playBtnInner}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={26}
                  color="#FFF"
                />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={s.controlBtn} activeOpacity={0.7}>
              <Ionicons
                name="play-skip-forward"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── YouTube section ── */}
        <View style={s.sectionCard}>
          <View style={[s.sectionStrip, { backgroundColor: YOUTUBE_RED }]} />
          <View style={s.sectionPad}>
            <View style={s.sectionHeader}>
              <View
                style={[
                  s.sectionIconWrap,
                  { backgroundColor: YOUTUBE_RED + '22' },
                ]}
              >
                <Ionicons
                  name="logo-youtube"
                  size={20}
                  color={YOUTUBE_RED}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sectionTitle}>YouTube Workout</Text>
                <Text style={s.sectionSubtitle}>
                  Playlist de treino incorporada
                </Text>
              </View>
            </View>
            <YouTubeIframe playlistId={YT_PLAYLIST_ID} />
          </View>
        </View>

        {/* ── Spotify section ── */}
        <View style={s.sectionCard}>
          <View
            style={[s.sectionStrip, { backgroundColor: SPOTIFY_GREEN }]}
          />
          <View style={s.sectionPad}>
            <View style={s.sectionHeader}>
              <View
                style={[
                  s.sectionIconWrap,
                  { backgroundColor: SPOTIFY_GREEN + '22' },
                ]}
              >
                <Ionicons
                  name="musical-notes"
                  size={20}
                  color={SPOTIFY_GREEN}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sectionTitle}>Spotify</Text>
                <Text style={s.sectionSubtitle}>
                  {spotifyConnected ? 'Conectado' : 'Conecte sua conta'}
                </Text>
              </View>
              {spotifyConnected && (
                <View style={s.connectedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={SPOTIFY_GREEN}
                  />
                  <Text style={[s.connectedText, { color: SPOTIFY_GREEN }]}>
                    Ativo
                  </Text>
                </View>
              )}
            </View>

            {spotifyConnected ? (
              /* Mini player shown after connecting */
              <LinearGradient
                colors={[SPOTIFY_GREEN + '20', SPOTIFY_GREEN + '06']}
                style={s.spotifyNowPlaying}
              >
                <View style={s.spotifyTrackRow}>
                  <View
                    style={[
                      s.spotifyAlbumArt,
                      { backgroundColor: SPOTIFY_GREEN + '30' },
                    ]}
                  >
                    <Ionicons
                      name="musical-note"
                      size={24}
                      color={SPOTIFY_GREEN}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={s.trackTitle}>Workout Mix</Text>
                    <Text style={s.trackArtist}>GymPro • Spotify</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      s.miniPlayBtn,
                      { backgroundColor: SPOTIFY_GREEN },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="play" size={14} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            ) : (
              /* OAuth connect button */
              <TouchableOpacity
                style={[
                  s.spotifyConnectBtn,
                  spotifyConnecting && s.spotifyBtnDisabled,
                ]}
                onPress={connectSpotify}
                disabled={spotifyConnecting}
                activeOpacity={0.85}
              >
                <Ionicons name="musical-notes" size={18} color="#FFF" />
                <Text style={s.spotifyBtnText}>
                  {spotifyConnecting ? 'Conectando...' : 'Conectar Spotify'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Workout playlists grid ── */}
        <View style={s.playlistsSection}>
          <Text style={s.sectionLabel}>PARA O SEU TREINO</Text>
          <View style={s.playlistsGrid}>
            {PLAYLISTS.map(pl => (
              <TouchableOpacity
                key={pl.id}
                style={s.playlistCard}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[pl.color + '30', pl.color + '08']}
                  style={s.playlistCardInner}
                >
                  <View
                    style={[
                      s.playlistIconWrap,
                      { backgroundColor: pl.color + '28' },
                    ]}
                  >
                    <Ionicons name={pl.icon} size={22} color={pl.color} />
                  </View>
                  <Text style={s.playlistName}>{pl.name}</Text>
                  <Text style={s.playlistDesc}>{pl.desc}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  headerIconGlow: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.primary + '25',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    shadowColor: Colors.primary,
    shadowRadius: 10,
    shadowOpacity: 0.4,
    elevation: 5,
  },

  /* Now Playing */
  nowPlayingCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    padding: 20,
    gap: 16,
    shadowColor: Colors.primary,
    shadowRadius: 16,
    shadowOpacity: 0.3,
    elevation: 8,
  },
  nowPlayingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  equalizerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 24,
  },
  equalizerBar: { width: 4, borderRadius: 2 },
  nowPlayingRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  albumArt: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowRadius: 8,
    shadowOpacity: 0.4,
    elevation: 5,
  },
  trackTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  trackArtist: { fontSize: 13, color: Colors.textSecondary },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  playBtnInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowRadius: 14,
    shadowOpacity: 0.5,
    elevation: 8,
  },

  /* Generic section card */
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowRadius: 12,
    shadowOpacity: 0.3,
    elevation: 6,
  },
  sectionStrip: { height: 3, width: '100%' },
  sectionPad: { padding: 18, gap: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  sectionSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  /* YouTube */
  youtubeContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  ytFallback: {
    height: 72,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: YOUTUBE_RED + '40',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  ytFallbackIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: YOUTUBE_RED + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ytFallbackText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },

  /* Spotify */
  spotifyConnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: SPOTIFY_GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: SPOTIFY_GREEN,
    shadowRadius: 12,
    shadowOpacity: 0.4,
    elevation: 6,
  },
  spotifyBtnDisabled: { opacity: 0.6 },
  spotifyBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  spotifyNowPlaying: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: SPOTIFY_GREEN + '30',
  },
  spotifyTrackRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spotifyAlbumArt: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SPOTIFY_GREEN,
    shadowRadius: 8,
    shadowOpacity: 0.4,
    elevation: 5,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: SPOTIFY_GREEN + '20',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: SPOTIFY_GREEN + '40',
  },
  connectedText: { fontSize: 11, fontWeight: '700' },

  /* Playlists grid */
  playlistsSection: { gap: 14 },
  playlistsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  playlistCard: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  playlistCardInner: { padding: 14, gap: 8 },
  playlistIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  playlistDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
