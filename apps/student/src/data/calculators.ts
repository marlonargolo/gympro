// Health calculators — faithful TypeScript port of Swift HealthCalculators.swift
import type { PerfilUsuario, NivelAtividade, ObjetivoMacro } from './types';

const nivelFator: Record<NivelAtividade, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  ativo: 1.725,
  muitoAtivo: 1.9,
};

export function calcularTMB(perfil: PerfilUsuario): number {
  const base = 10 * perfil.pesoKg + 6.25 * perfil.alturaCm - 5 * perfil.idade;
  return perfil.sexo === 'masculino' ? base + 5 : base - 161;
}

export function calcularGET(perfil: PerfilUsuario): number {
  return calcularTMB(perfil) * nivelFator[perfil.nivelAtividade];
}

export function imc(pesoKg: number, alturaCm: number): number {
  const alturaM = alturaCm / 100;
  if (alturaM <= 0) return 0;
  return pesoKg / (alturaM * alturaM);
}

export function classificacaoIMC(valor: number): string {
  if (valor < 18.5) return 'Abaixo do peso';
  if (valor < 25) return 'Peso normal';
  if (valor < 30) return 'Sobrepeso';
  if (valor < 35) return 'Obesidade grau I';
  if (valor < 40) return 'Obesidade grau II';
  return 'Obesidade grau III';
}

export function aguaRecomendadaLitros(pesoKg: number, nivel: NivelAtividade): number {
  const base = pesoKg * 0.035;
  const extra = nivel === 'ativo' || nivel === 'muitoAtivo' ? 0.5 : 0;
  return base + extra;
}

export function fcMaxima(idade: number): number {
  return 208 - 0.7 * idade;
}

export function zonasFC(idade: number): Array<{ nome: string; min: number; max: number }> {
  const max = fcMaxima(idade);
  return [
    { nome: 'Aquecimento (50-60%)', min: Math.round(max * 0.5), max: Math.round(max * 0.6) },
    { nome: 'Queima de gordura (60-70%)', min: Math.round(max * 0.6), max: Math.round(max * 0.7) },
    { nome: 'Cardio (70-80%)', min: Math.round(max * 0.7), max: Math.round(max * 0.8) },
    { nome: 'Limiar (80-90%)', min: Math.round(max * 0.8), max: Math.round(max * 0.9) },
    { nome: 'Máximo (90-100%)', min: Math.round(max * 0.9), max: Math.round(max) },
  ];
}

export function percentualGorduraEstimado(perfil: PerfilUsuario, cinturaCm: number): number | null {
  if (cinturaCm <= 0) return null;
  if (perfil.sexo === 'masculino') {
    const val = 495 / (1.0324 - 0.19077 * Math.log10(cinturaCm) + 0.15456 * Math.log10(perfil.alturaCm)) - 450;
    return Math.max(3, Math.min(val, 50));
  } else {
    const val = 495 / (1.29579 - 0.35004 * Math.log10(cinturaCm) + 0.221 * Math.log10(perfil.alturaCm)) - 450;
    return Math.max(3, Math.min(val, 55));
  }
}

const macroPercentuais: Record<ObjetivoMacro, [number, number, number]> = {
  emagrecimento: [0.40, 0.30, 0.30],
  manutencao: [0.30, 0.40, 0.30],
  hipertrofia: [0.30, 0.45, 0.25],
};

export function calcularMacros(get: number, objetivo: ObjetivoMacro) {
  const [pPerc, cPerc, gPerc] = macroPercentuais[objetivo];
  return {
    proteinaG: Math.round((get * pPerc) / 4),
    carboG: Math.round((get * cPerc) / 4),
    gorduraG: Math.round((get * gPerc) / 9),
  };
}
