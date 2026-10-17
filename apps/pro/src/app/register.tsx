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

const ESPECIALIDADES = [
  'Personal Trainer',
  'Nutricionista',
  'Fisioterapeuta',
  'Preparador Físico',
  'Coach',
  'Educador Físico',
];

const MODALIDADES = ['Musculação', 'CrossFit', 'Natação', 'Corrida', 'Yoga', 'Funcional', 'Artes Marciais'];

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [cref, setCref] = useState('');
  const [gymName, setGymName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [modalidade, setModalidade] = useState('');

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
    if (!specialty) { Alert.alert('Atenção', 'Selecione sua especialidade.'); return; }
    setLoading(true);
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
        user_type: 'professional',
        cref: cref.trim() || undefined,
        gym_name: gymName.trim() || undefined,
        specialty,
        modalidade: modalidade || undefined,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      const data = err?.response?.data;
      const msg =
        data?.email?.[0] ||
        data?.non_field_errors?.[0] ||
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
          <Text style={styles.title}>Perfil Profissional</Text>
          <Text style={styles.subtitle}>Passo 2 de 2 — Especialização</Text>

          <Text style={styles.label}>Especialidade</Text>
          <View style={styles.chipGrid}>
            {ESPECIALIDADES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, specialty === s && styles.chipActive]}
                onPress={() => setSpecialty(s)}
              >
                <Text style={[styles.chipText, specialty === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Modalidade principal (opcional)</Text>
          <View style={styles.chipGrid}>
            {MODALIDADES.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.chip, modalidade === m && styles.chipActive]}
                onPress={() => setModalidade(modalidade === m ? '' : m)}
              >
                <Text style={[styles.chipText, modalidade === m && styles.chipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>CREF (opcional)</Text>
          <TextInput style={styles.input} value={cref} onChangeText={setCref}
            placeholder="000000-G/SP" placeholderTextColor={Colors.textMuted} autoCapitalize="characters" />

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
  label: { fontSize: 13, color: Colors.textMuted, marginBottom: 8, marginTop: 16 },
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
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textMuted, fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
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
