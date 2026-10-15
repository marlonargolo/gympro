// GymsAndProfessionalsMapViews — port of Views/Maps/GymsAndProfessionalsMapViews.swift
// Note: MapKit is iOS-only; replaced by a card list for web/cross-platform.
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { mockAcademias, mockProfissionaisMapa } from '../data/mock-data';
import type { Academia } from '../data/types';

export default function MapsScreen() {
  const [academias, setAcademias] = useState(mockAcademias);
  const [showNovaAcademia, setShowNovaAcademia] = useState(false);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Academias */}
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleRow}>
            <Ionicons name="barbell" size={18} color={Colors.primary} />
            <Text style={s.sectionTitle}>Academias</Text>
          </View>
          <TouchableOpacity onPress={() => setShowNovaAcademia(true)}>
            <Ionicons name="add-circle" size={26} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {academias.map(ac => (
          <View key={ac.id} style={s.card}>
            <View style={s.cardIconCircle}>
              <Ionicons name="barbell" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardName}>{ac.nome}</Text>
              <Text style={s.cardAddress}>{ac.endereco}</Text>
              <View style={s.tagsRow}>
                {ac.modalidades.map(m => (
                  <View key={m} style={s.tag}>
                    <Text style={s.tagText}>{m}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={s.ratingPill}>
              <Ionicons name="star" size={12} color={Colors.primary2} />
              <Text style={s.ratingText}> {ac.avaliacao.toFixed(1)}</Text>
            </View>
          </View>
        ))}

        <View style={s.divider} />

        {/* Profissionais */}
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleRow}>
            <Ionicons name="person" size={18} color={Colors.accent} />
            <Text style={s.sectionTitle}>Profissionais</Text>
          </View>
        </View>
        {mockProfissionaisMapa.map(pro => (
          <View key={pro.id} style={s.card}>
            <View style={[s.cardIconCircle, { backgroundColor: Colors.accent + '33' }]}>
              <Ionicons name="person" size={22} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardName}>{pro.nome}</Text>
              <Text style={s.cardAddress}>{pro.especialidade}</Text>
              <Text style={s.cardPrice}>{pro.precoConsultaAprox}</Text>
            </View>
            <View style={s.ratingPill}>
              <Ionicons name="star" size={12} color={Colors.primary2} />
              <Text style={s.ratingText}> {pro.avaliacao.toFixed(1)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <NovaAcademiaModal
        visible={showNovaAcademia}
        onClose={() => setShowNovaAcademia(false)}
        onSalvar={(nova) => {
          setAcademias(v => [...v, nova]);
          setShowNovaAcademia(false);
        }}
      />
    </SafeAreaView>
  );
}

function NovaAcademiaModal({
  visible, onClose, onSalvar,
}: { visible: boolean; onClose: () => void; onSalvar: (a: Academia) => void }) {
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={m.overlay}>
        <View style={m.card}>
          <Text style={m.title}>Nova academia</Text>
          <TextInput
            style={m.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome da academia"
            placeholderTextColor={Colors.textTertiary}
          />
          <TextInput
            style={m.input}
            value={endereco}
            onChangeText={setEndereco}
            placeholder="Endereço"
            placeholderTextColor={Colors.textTertiary}
          />
          <Text style={m.hint}>
            Localização usa coordenadas de exemplo nesta versão — próxima integração usará CLGeocoder.
          </Text>
          <View style={m.btns}>
            <TouchableOpacity style={m.btnSec} onPress={onClose}>
              <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={m.btnPri}
              onPress={() => {
                onSalvar({
                  id: Date.now().toString(),
                  nome: nome || 'Nova Academia',
                  endereco: endereco || '—',
                  avaliacao: 0,
                  modalidades: [],
                });
                setNome(''); setEndereco('');
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '700' }}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.glassBorder,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  cardIconCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  cardName: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardAddress: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  cardPrice: { fontSize: 12, color: Colors.textTertiary },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: {
    backgroundColor: Colors.surfaceElevated, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
  },
  tagText: { fontSize: 11, color: Colors.textTertiary },
  ratingPill: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 13, fontWeight: '700', color: Colors.primary2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: Colors.surfaceElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 14,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    color: Colors.text, fontSize: 15, borderWidth: 1, borderColor: Colors.border,
  },
  hint: { fontSize: 11, color: Colors.textTertiary, fontStyle: 'italic' },
  btns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnPri: { flex: 1, backgroundColor: Colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  btnSec: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
});
