import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '@gympro/api';
import { Colors } from '../constants/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const [isPT, setIsPT] = useState(false);
  const [isNutri, setIsNutri] = useState(false);
  const [cref, setCref] = useState('');
  const [crn, setCrn] = useState('');
  const [gymName, setGymName] = useState('');

  function validateStep1() {
    if (!fullName.trim()) return 'Informe seu nome completo.';
    if (!email.trim() || !email.includes('@')) return 'Informe um e-mail válido.';
    if (password.length < 6) return 'A senha deve ter ao menos 6 caracteres.';
    if (password !== password2) return 'As senhas não coincidem.';
    return null;
  }

  function goStep2() {
    const err = validateStep1();
    if (err) { Alert.alert('Atenção', err); return; }
    setStep(2);
  }

  async function handleRegister() {
    if (!isPT && !isNutri) {
      Alert.alert('Atenção', 'Selecione ao menos uma especialidade: Personal Trainer ou Nutricionista.');
      return;
    }
    if (isPT && !cref.trim()) {
      Alert.alert('Atenção', 'Informe seu CREF para atuar como Personal Trainer.');
      return;
    }
    if (isNutri && !crn.trim()) {
      Alert.alert('Atenção', 'Informe seu CRN para atuar como Nutricionista.');
      return;
    }
    setLoading(true);
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
        user_type: 'professional',
        is_personal_trainer: isPT,
        is_nutritionist: isNutri,
        cref: cref.trim(),
        crn: crn.trim(),
        gym_name: gymName.trim() || undefined,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      const data = err?.response?.data;
      const msg =
        (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : undefined) ||
        data?.email?.[0] ||
        data?.detail ||
        'Não foi possível criar a conta.';
      Alert.alert('Erro no cadastro', msg);
    } finally {
      setLoading(false);
    }
  }

  if (step === 1) {
    return (
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.logo}>GYM<Text style={styles.logoAccent}>PRO</Text></Text>
            <Text style={styles.tagline}>Novo Profissional</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Cadastro Profissional</Text>
            <Text style={styles.subtitle}>Passo 1 de 2 — Dados pessoais</Text>

            <Text style={styles.label}>Nome completo</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName}
              placeholder="Nome Sobrenome" placeholderTextColor={Colors.textMuted} />

            <Text style={styles.label}>E-mail</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail}
              placeholder="seu@email.com" placeholderTextColor={Colors.textMuted}
              keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.label}>Telefone (opcional)</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone}
              placeholder="(11) 99999-9999" placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad" />

            <Text style={styles.label}>Senha</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres" placeholderTextColor={Colors.textMuted} secureTextEntry />

            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput style={styles.input} value={password2} onChangeText={setPassword2}
              placeholder="Repita a senha" placeholderTextColor={Colors.textMuted} secureTextEntry />

            <TouchableOpacity style={styles.btn} onPress={goStep2} activeOpacity={0.85}>
              <Text style={styles.btnText}>Próximo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.link} onPress={() => router.push('/login')}>
              <Text style={styles.linkText}>
                Já tem conta? <Text style={styles.linkAccent}>Entrar</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.logo}>GYM<Text style={styles.logoAccent}>PRO</Text></Text>
          <Text style={styles.tagline}>Novo Profissional</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Especialização</Text>
          <Text style={styles.subtitle}>Passo 2 de 2 — Selecione ao menos uma</Text>

          {/* Personal Trainer toggle */}
          <TouchableOpacity
            style={[styles.typeRow, isPT && styles.typeRowActive]}
            onPress={() => setIsPT(!isPT)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isPT && styles.checkboxActive]}>
              {isPT && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.typeTitle, isPT && styles.typeTitleActive]}>Personal Trainer</Text>
              <Text style={styles.typeDesc}>Crie e gerencie treinos para seus alunos</Text>
            </View>
          </TouchableOpacity>

          {isPT && (
            <>
              <Text style={styles.label}>CREF *</Text>
              <TextInput style={styles.input} value={cref} onChangeText={setCref}
                placeholder="000000-G/SP" placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters" />
            </>
          )}

          {/* Nutritionist toggle */}
          <TouchableOpacity
            style={[styles.typeRow, isNutri && styles.typeRowActive]}
            onPress={() => setIsNutri(!isNutri)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isNutri && styles.checkboxActive]}>
              {isNutri && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.typeTitle, isNutri && styles.typeTitleActive]}>Nutricionista</Text>
              <Text style={styles.typeDesc}>Elabore planos nutricionais personalizados</Text>
            </View>
          </TouchableOpacity>

          {isNutri && (
            <>
              <Text style={styles.label}>CRN *</Text>
              <TextInput style={styles.input} value={crn} onChangeText={setCrn}
                placeholder="CRN-3 00000" placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters" />
            </>
          )}

          <Text style={styles.label}>Academia / Studio (opcional)</Text>
          <TextInput style={styles.input} value={gymName} onChangeText={setGymName}
            placeholder="Nome do local" placeholderTextColor={Colors.textMuted} />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Criar conta</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => setStep(1)}>
            <Text style={styles.linkText}>
              <Text style={styles.linkAccent}>← Voltar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  hero: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 42, fontWeight: '900', color: Colors.text, letterSpacing: 4 },
  logoAccent: { color: Colors.primary },
  tagline: { fontSize: 13, color: Colors.textMuted, letterSpacing: 6, marginTop: 4, textTransform: 'uppercase' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 24 },
  label: { fontSize: 13, color: Colors.textMuted, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 15,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    marginTop: 12,
  },
  typeRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '11',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  typeTitle: { fontSize: 15, fontWeight: '600', color: Colors.textMuted },
  typeTitleActive: { color: Colors.text },
  typeDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: 20 },
  linkText: { color: Colors.textMuted, fontSize: 14 },
  linkAccent: { color: Colors.primary, fontWeight: '600' },
});
