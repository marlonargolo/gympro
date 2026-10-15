// MusicScreen — premium dark UI rewrite
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const SPOTIFY_GREEN = '#1DB954';
const YOUTUBE_RED = '#FF0000';

type Playlist = { id: string; icon: React.ComponentProps<typeof Ionicons>['name']; name: string; desc: string };

const PLAYLISTS: Playlist[] = [
  { id: '1', icon: 'barbell', name: 'Power & Strength', desc: 'Metal, rock e beats intensos para levantar pesado' },
  { id: '2', icon: 'flash', name: 'HIIT Cardio', desc: 'BPM alto para sprints e circuitos explosivos' },
  { id: '3', icon: 'moon', name: 'Focus Flow', desc: 'Lo-fi e chill para treinos de longa duração' },
];

export default function MusicScreen() {
  const [isPlaying, setIsPlaying] = useState(false);

  async function openApp(url: string) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) await Linking.openURL(url);
      else await Linking.openURL(url);
    } catch (_) {
      await Linking.openURL(url);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerTitle}>Música no Treino</Text>
            <Text style={s.headerSub}>Mantenha o ritmo e a intensidade</Text>
          </View>
          <View style={s.headerIconGlow}>
            <Ionicons name="musical-notes" size={24} color={Colors.primary} />
          </View>
        </View>

        {/* Launcher cards row */}
        <View style={s.launchersRow}>
          {/* Spotify */}
          <TouchableOpacity
            style={[s.launcherCard, { shadowColor: SPOTIFY_GREEN }]}
            onPress={() => openApp('spotify://')}
            activeOpacity={0.85}
          >
            <View style={[s.launcherStrip, { backgroundColor: SPOTIFY_GREEN }]} />
            <View style={s.launcherInner}>
              <View style={[s.launcherIconWrap, { backgroundColor: SPOTIFY_GREEN + '25' }]}>
                <Ionicons name="musical-notes" size={40} color={SPOTIFY_GREEN} />
              </View>
              <Text style={s.launcherTitle}>Spotify</Text>
              <Text style={[s.launcherBtn, { color: SPOTIFY_GREEN }]}>Abrir Spotify</Text>
            </View>
          </TouchableOpacity>

          {/* YouTube Music */}
          <TouchableOpacity
            style={[s.launcherCard, { shadowColor: YOUTUBE_RED }]}
            onPress={() => openApp('https://music.youtube.com')}
            activeOpacity={0.85}
          >
            <View style={[s.launcherStrip, { backgroundColor: YOUTUBE_RED }]} />
            <View style={s.launcherInner}>
              <View style={[s.launcherIconWrap, { backgroundColor: YOUTUBE_RED + '25' }]}>
                <Ionicons name="play-circle" size={40} color={YOUTUBE_RED} />
              </View>
              <Text style={s.launcherTitle}>YouTube Music</Text>
              <Text style={[s.launcherBtn, { color: YOUTUBE_RED }]}>Abrir YouTube Music</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Now playing card */}
        <View style={s.nowPlayingCard}>
          <View style={s.nowPlayingStrip} />
          <View style={s.nowPlayingInner}>
            <Text style={s.nowPlayingLabel}>REPRODUZINDO AGORA</Text>
            <View style={s.nowPlayingRow}>
              {/* Fake album art */}
              <View style={s.albumArt}>
                <Ionicons name="musical-notes" size={28} color={Colors.textTertiary} />
              </View>
              {/* Track info */}
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={s.trackTitle}>Treino Pesado 🔥</Text>
                <Text style={s.trackArtist}>GymPro Playlist</Text>
              </View>
            </View>
            {/* Controls */}
            <View style={s.controlsRow}>
              <TouchableOpacity style={s.controlBtn} activeOpacity={0.7}>
                <Ionicons name="play-skip-back" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={s.playBtn}
                onPress={() => setIsPlaying(v => !v)}
                activeOpacity={0.85}
              >
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={s.controlBtn} activeOpacity={0.7}>
                <Ionicons name="play-skip-forward" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Playlists section */}
        <View style={s.playlistsSection}>
          <Text style={s.playlistsHeader}>PARA O SEU TREINO</Text>
          {PLAYLISTS.map((pl, i) => (
            <View key={pl.id} style={[s.playlistRow, i < PLAYLISTS.length - 1 && s.playlistRowBorder]}>
              <View style={s.playlistIcon}>
                <Ionicons name={pl.icon} size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.playlistName}>{pl.name}</Text>
                <Text style={s.playlistDesc}>{pl.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 20, paddingBottom: 48 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { gap: 2 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 13, color: Colors.textSecondary },
  headerIconGlow: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.primary + '25',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowRadius: 12, shadowOpacity: 0.4, elevation: 5,
    borderWidth: 1, borderColor: Colors.primary + '40',
  },

  launchersRow: { flexDirection: 'row', gap: 14 },
  launcherCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowRadius: 16, shadowOpacity: 0.35, elevation: 8,
  },
  launcherStrip: { height: 3, width: '100%' },
  launcherInner: { padding: 20, gap: 10, alignItems: 'center' },
  launcherIconWrap: {
    width: 68, height: 68, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  launcherTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  launcherBtn: { fontSize: 12, fontWeight: '700', textAlign: 'center' },

  nowPlayingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowColor: Colors.primary, shadowRadius: 16, shadowOpacity: 0.3, elevation: 8,
  },
  nowPlayingStrip: { height: 3, backgroundColor: Colors.primary },
  nowPlayingInner: { padding: 18, gap: 14 },
  nowPlayingLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    color: Colors.textTertiary, textTransform: 'uppercase',
  },
  nowPlayingRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  albumArt: {
    width: 64, height: 64, borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  trackTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  trackArtist: { fontSize: 13, color: Colors.textSecondary },

  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  controlBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  playBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowRadius: 12, shadowOpacity: 0.5, elevation: 6,
  },

  playlistsSection: {
    backgroundColor: Colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  playlistsHeader: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    color: Colors.textTertiary, textTransform: 'uppercase',
    paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10,
  },
  playlistRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 18, paddingVertical: 14,
  },
  playlistRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  playlistIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  playlistName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  playlistDesc: { fontSize: 12, color: Colors.textSecondary },
});
