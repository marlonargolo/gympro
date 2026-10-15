// HealthCalculatorsView — premium dark UI rewrite
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

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerIconWrap}>
            <Ionicons name="calculator" size={28} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Calculadoras de Saúde</Text>
            <Text style={s.headerSub}>Métricas personalizadas baseadas no seu perfil</Text>
          </View>
        </View>

        {/* IMC */}
        <View style={s.card}>
          <View style={[s.accentStrip, { backgroundColor: Colors.accent }]} />
          <View style={s.cardInner}>
            <Text style={s.sectionLabel}>ÍNDICE DE MASSA CORPORAL</Text>
            <View style={s.resultRow}>
              <View style={[s.iconCircle, { backgroundColor: Colors.accent + '30' }]}>
                <Ionicons name="body" size={22} color={Colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.bigNumber}>{imcVal.toFixed(1)}</Text>
                <Text style={s.bigNumberLabel}>{classificacaoIMC(imcVal)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Água */}
        <View style={s.card}>
          <View style={[s.accentStrip, { backgroundColor: Colors.success }]} />
          <View style={s.cardInner}>
            <Text style={s.sectionLabel}>ÁGUA RECOMENDADA</Text>
            <View style={s.resultRow}>
              <View style={[s.iconCircle, { backgroundColor: Colors.success + '30' }]}>
                <Ionicons name="water" size={22} color={Colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.bigNumber, { color: Colors.success }]}>{aguaVal.toFixed(1)}L</Text>
                <Text style={s.bigNumberLabel}>por dia, conforme peso e atividade</Text>
              </View>
            </View>
          </View>
        </View>

        {/* FC Máxima */}
        <View style={s.card}>
          <View style={[s.accentStrip, { backgroundColor: Colors.primary2 }]} />
          <View style={s.cardInner}>
            <Text style={s.sectionLabel}>FC MÁXIMA DE TREINO</Text>
            <View style={s.resultRow}>
              <View style={[s.iconCircle, { backgroundColor: Colors.primary2 + '30' }]}>
                <Ionicons name="heart" size={22} color={Colors.primary2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.bigNumber, { color: Colors.primary2 }]}>{Math.round(fcMax)}</Text>
                <Text style={s.bigNumberLabel}>bpm — fórmula de Tanaka</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Zonas de FC */}
        <View style={s.card}>
          <View style={[s.accentStrip, { backgroundColor: Colors.primary2 }]} />
          <View style={s.cardInner}>
            <Text style={s.sectionLabel}>ZONAS DE FREQUÊNCIA CARDÍACA</Text>
            {zonas.map((z, i) => (
              <View key={z.nome} style={[s.zonaRow, i < zonas.length - 1 && s.zonaRowBorder]}>
                <View style={[s.zonaDot, { backgroundColor: Colors.primary2 + '50' }]} />
                <Text style={s.zonaName}>{z.nome}</Text>
                <Text style={s.zonaVal}>{z.min}–{z.max} bpm</Text>
              </View>
            ))}
          </View>
        </View>

        {/* % Gordura */}
        <View style={[s.card, s.glowCard]}>
          <View style={[s.accentStrip, { backgroundColor: Colors.primary }]} />
          <View style={s.cardInner}>
            <Text style={s.sectionLabel}>% DE GORDURA ESTIMADO</Text>
            <Text style={s.inputLabel}>Circunferência da cintura</Text>
            <View style={s.stepperRow}>
              <TouchableOpacity
                onPress={() => setCintura(v => Math.max(50, v - 1))}
                style={s.stepperBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <View style={s.stepperDisplay}>
                <Text style={s.stepperValue}>{cintura}</Text>
                <Text style={s.stepperUnit}>cm</Text>
              </View>
              <TouchableOpacity
                onPress={() => setCintura(v => Math.min(150, v + 1))}
                style={s.stepperBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${((cintura - 50) / 100) * 100}%`, backgroundColor: Colors.primary }]} />
            </View>
            {gorduraVal !== null && (
              <View style={s.resultCenter}>
                <Text style={[s.bigNumber, { color: Colors.primary }]}>{gorduraVal.toFixed(1)}%</Text>
                <Text style={s.bigNumberLabel}>gordura corporal estimada</Text>
              </View>
            )}
            <Text style={s.disclaimer}>
              Estimativa simplificada (fórmula da Marinha dos EUA) — não substitui bioimpedância.
            </Text>
          </View>
        </View>

        {/* Macros */}
        <View style={[s.card, s.glowCard2]}>
          <View style={[s.accentStrip, { backgroundColor: Colors.primary2 }]} />
          <View style={s.cardInner}>
            <Text style={s.sectionLabel}>MACRONUTRIENTES</Text>
            <View style={s.objetivoRow}>
              {objetivos.map(o => (
                <TouchableOpacity
                  key={o}
                  onPress={() => setObjetivo(o)}
                  style={[s.objetivoBtn, objetivo === o && s.objetivoBtnAtivo]}
                  activeOpacity={0.75}
                >
                  <Text style={[s.objetivoText, objetivo === o && s.objetivoTextAtivo]}>
                    {objetivoMacroLabel[o]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.macrosRow}>
              <MacroPill nome="Proteína" valor={macros.proteinaG} cor={Colors.primary} />
              <MacroPill nome="Carboidrato" valor={macros.carboG} cor={Colors.accent} />
              <MacroPill nome="Gordura" valor={macros.gorduraG} cor={Colors.primary2} />
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function MacroPill({ nome, valor, cor }: { nome: string; valor: number; cor: string }) {
  return (
    <View style={[s.macroPill, { flex: 1, borderColor: cor + '40' }]}>
      <Text style={[s.macroVal, { color: cor }]}>{valor}g</Text>
      <Text style={s.macroNome}>{nome}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 18, gap: 16, paddingBottom: 48 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingBottom: 4,
  },
  headerIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: Colors.primary + '25',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowRadius: 12, shadowOpacity: 0.35, elevation: 5,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  glowCard: {
    shadowColor: Colors.primary,
    shadowRadius: 16,
    shadowOpacity: 0.3,
    elevation: 8,
  },
  glowCard2: {
    shadowColor: Colors.primary2,
    shadowRadius: 16,
    shadowOpacity: 0.25,
    elevation: 8,
  },
  accentStrip: { height: 2, width: '100%' },
  cardInner: { padding: 18, gap: 12 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },

  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },

  bigNumber: { fontSize: 40, fontWeight: '800', color: Colors.text, lineHeight: 46 },
  bigNumberLabel: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  resultCenter: { alignItems: 'center', paddingVertical: 4 },

  zonaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8,
  },
  zonaRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  zonaDot: { width: 8, height: 8, borderRadius: 4 },
  zonaName: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  zonaVal: { fontSize: 13, fontWeight: '700', color: Colors.text },

  inputLabel: { fontSize: 13, color: Colors.textSecondary },
  stepperRow: {
    flexDirection: 'row', alignItems: 'center', gap: 0,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 50, height: 52, alignItems: 'center', justifyContent: 'center',
  },
  stepperDisplay: {
    flex: 1, flexDirection: 'row', alignItems: 'baseline',
    justifyContent: 'center', gap: 4,
  },
  stepperValue: { fontSize: 28, fontWeight: '800', color: Colors.text },
  stepperUnit: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },

  progressTrack: {
    height: 4, backgroundColor: Colors.surfaceElevated,
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },

  disclaimer: { fontSize: 11, color: Colors.textTertiary, fontStyle: 'italic' },

  objetivoRow: { flexDirection: 'row', gap: 8 },
  objetivoBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    backgroundColor: Colors.surfaceElevated, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  objetivoBtnAtivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  objetivoText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textAlign: 'center' },
  objetivoTextAtivo: { color: '#FFF' },

  macrosRow: { flexDirection: 'row', gap: 10 },
  macroPill: {
    backgroundColor: Colors.surfaceElevated, borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 6,
    borderWidth: 1,
  },
  macroVal: { fontSize: 28, fontWeight: '800' },
  macroNome: { fontSize: 11, color: Colors.textTertiary, fontWeight: '600', letterSpacing: 0.5 },
});
