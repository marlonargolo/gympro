// MusicPlayerHubView — faithful port of Views/Music/MusicPlayerHubView.swift
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function MusicScreen() {
  const [playing, setPlaying] = useState(false);

  async function abrirApp(url: string) {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.content}>
        {/* Header */}
        <View style={s.headerArea}>
          <Ionicons name="musical-notes" size={56} color={Colors.primary} />
          <Text style={s.title}>Música durante o treino</Text>
          <Text style={s.subtitle}>
            Abra seu player favorito. O áudio continua em segundo plano enquanto você acompanha o treino no app.
          </Text>
        </View>

        {/* Player buttons */}
        <View style={s.buttonsRow}>
          <TouchableOpacity style={s.playerBtn} onPress={() => abrirApp('spotify://')} activeOpacity={0.8}>
            <Ionicons name="musical-note" size={30} color={Colors.text} />
            <Text style={s.playerBtnText}>Spotify</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.playerBtn} onPress={() => abrirApp('youtube://')} activeOpacity={0.8}>
            <Ionicons name="play-circle" size={30} color={Colors.text} />
            <Text style={s.playerBtnText}>YouTube Music</Text>
          </TouchableOpacity>
        </View>

        <View style={s.divider} />

        {/* Now playing mock */}
        <Text style={s.nowPlayingLabel}>Now Playing (simulado)</Text>
        <View style={s.nowPlayingCard}>
          <View style={s.albumArt}>
            <Ionicons name="radio" size={24} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.trackTitle}>Playlist: Treino Pesado</Text>
            <Text style={s.trackMeta}>Faixa simulada · 3:24</Text>
          </View>
          <TouchableOpacity onPress={() => setPlaying(v => !v)}>
            <Ionicons
              name={playing ? 'pause-circle' : 'play-circle'}
              size={40}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        <Text style={s.integrationNote}>
          Integração real com Spotify SDK / YouTube Music API (OAuth) é o próximo passo.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 24, gap: 20, alignItems: 'stretch' },
  headerArea: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 20, paddingHorizontal: 10,
  },
  buttonsRow: { flexDirection: 'row', gap: 16 },
  playerBtn: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: 16, padding: 20, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  playerBtnText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border },
  nowPlayingLabel: { fontSize: 12, color: Colors.textSecondary },
  nowPlayingCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  albumArt: {
    width: 52, height: 52, borderRadius: 10,
    backgroundColor: Colors.primary + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  trackTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  trackMeta: { fontSize: 13, color: Colors.textSecondary },
  integrationNote: {
    fontSize: 11, color: Colors.textTertiary, textAlign: 'center', fontStyle: 'italic',
  },
});
