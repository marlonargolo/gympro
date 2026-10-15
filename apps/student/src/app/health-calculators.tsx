// HealthCalculatorsView — faithful port of Models/Views/Health/HealthCalculatorsView.swift
import React, { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useStore } from '../context/StoreContext';
import {
  imc, classificacaoIMC, aguaRecomendadaLitros, fcMaxima, zonasFC,
  percentualGorduraEstimado, calcularMacros, calcularGET,
} from '../data/calculators';
import type { ObjetivoMacro } from '../data/types';
import { objetivoMacroLabel } from '../data/types';

const objetivos: ObjetivoMacro[] = ['emagrecimento', 'manutencao', 'hipertrofia'];

export default function HealthCalculatorsScreen() {
  const { perfil } = useStore();
  const [cintura, setCintura] = useState(85);
  const [objetivo, setObjetivo] = useState<ObjetivoMacro>('hipertrofia');

  const imcVal = imc(perfil.pesoKg, perfil.alturaCm);
  const aguaVal = aguaRecomendadaLitros(perfil.pesoKg, perfil.nivelAtividade);
  const fcMax = fcMaxima(perfil.idade);
  const gorduraVal = percentualGorduraEstimado(perfil, cintura);
  const get = calcularGET(perfil);
  const macros = calcularMacros(get, objetivo);
  const zonas = zonasFC(perfil.idade);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* IMC */}
        <ResultCard
          icon="body"
          iconColor={Colors.primary}
          titulo="IMC"
          valor={imcVal.toFixed(1)}
          legenda={classificacaoIMC(imcVal)}
        />

        {/* Água */}
        <ResultCard
          icon="water"
          iconColor={Colors.accent}
          titulo="Água recomendada"
          valor={`${aguaVal.toFixed(1)}L`}
          legenda="por dia, conforme peso e atividade"
        />

        {/* FC Máxima */}
        <ResultCard
          icon="heart"
          iconColor="#FF4466"
          titulo="FC máxima de treino"
          valor={`${Math.round(fcMax)} bpm`}
          legenda="fórmula de Tanaka"
        />

        {/* Zonas de FC */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>Zonas de frequência cardíaca</Text>
          {zonas.map(z => (
            <View key={z.nome} style={s.zonaRow}>
              <Text style={s.zonaName}>{z.nome}</Text>
              <Text style={s.zonaVal}>{z.min}-{z.max} bpm</Text>
            </View>
          ))}
        </View>

        {/* % Gordura */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>% de gordura estimado</Text>
          <Text style={s.sliderLabel}>Circunferência da cintura: {cintura}cm</Text>
          <View style={s.sliderRow}>
            <TouchableOpacity onPress={() => setCintura(v => Math.max(50, v - 1))} style={s.sliderBtn}>
              <Ionicons name="remove" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <View style={s.sliderTrack}>
              <View style={[s.sliderFill, { width: `${((cintura - 50) / 100) * 100}%` }]} />
            </View>
            <TouchableOpacity onPress={() => setCintura(v => Math.min(150, v + 1))} style={s.sliderBtn}>
              <Ionicons name="add" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {gorduraVal !== null && (
            <Text style={s.gorduraVal}>{gorduraVal.toFixed(1)}%</Text>
          )}
          <Text style={s.disclaimer}>
            Estimativa simplificada (fórmula da Marinha dos EUA) — não substitui bioimpedância.
          </Text>
        </View>

        {/* Macros */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>Macronutrientes</Text>
          <View style={s.objetivoRow}>
            {objetivos.map(o => (
              <TouchableOpacity
                key={o}
                onPress={() => setObjetivo(o)}
                style={[s.objetivoBtn, objetivo === o && s.objetivoBtnAtivo]}
              >
                <Text style={[s.objetivoText, objetivo === o && s.objetivoTextAtivo]}>
                  {objetivoMacroLabel[o]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.macrosRow}>
            <MacroPill nome="Proteína" valor={macros.proteinaG} cor={Colors.primary} />
            <MacroPill nome="Carbo" valor={macros.carboG} cor={Colors.accent} />
            <MacroPill nome="Gordura" valor={macros.gorduraG} cor={Colors.primary2} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultCard({
  icon, iconColor, titulo, valor, legenda,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  titulo: string;
  valor: string;
  legenda: string;
}) {
  return (
    <View style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 14 }]}>
      <View style={[s.iconCircle, { backgroundColor: iconColor + '33' }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rcTitle}>{titulo}</Text>
        <Text style={s.rcValor}>{valor}</Text>
        <Text style={s.rcLegenda}>{legenda}</Text>
      </View>
    </View>
  );
}

function MacroPill({ nome, valor, cor }: { nome: string; valor: number; cor: string }) {
  return (
    <View style={[s.macroPill, { flex: 1 }]}>
      <Text style={[s.macroVal, { color: cor }]}>{valor}g</Text>
      <Text style={s.macroNome}>{nome}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 14, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: Colors.glassBorder, gap: 10,
  },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  rcTitle: { fontSize: 12, color: Colors.textTertiary, marginBottom: 2 },
  rcValor: { fontSize: 22, fontWeight: '700', color: Colors.text },
  rcLegenda: { fontSize: 11, color: Colors.textSecondary },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  zonaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  zonaName: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  zonaVal: { fontSize: 12, fontWeight: '700', color: Colors.text },
  sliderLabel: { fontSize: 13, color: Colors.textSecondary },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sliderBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  sliderTrack: {
    flex: 1, height: 6, backgroundColor: Colors.surfaceElevated,
    borderRadius: 3, overflow: 'hidden',
  },
  sliderFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  gorduraVal: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  disclaimer: { fontSize: 11, color: Colors.textTertiary, fontStyle: 'italic' },
  objetivoRow: { flexDirection: 'row', gap: 8 },
  objetivoBtn: {
    flex: 1, padding: 9, alignItems: 'center',
    backgroundColor: Colors.surfaceElevated, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  objetivoBtnAtivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  objetivoText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  objetivoTextAtivo: { color: '#FFF' },
  macrosRow: { flexDirection: 'row', gap: 10 },
  macroPill: {
    backgroundColor: Colors.surfaceElevated, borderRadius: 12,
    padding: 12, alignItems: 'center', gap: 4,
  },
  macroVal: { fontSize: 18, fontWeight: '700' },
  macroNome: { fontSize: 11, color: Colors.textTertiary },
});
