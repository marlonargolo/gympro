import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://89.117.33.235:8000';

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 — personal data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  // Step 2 — professional type + credentials
  const [isPersonalTrainer, setIsPersonalTrainer] = useState(false);
  const [isNutritionist, setIsNutritionist] = useState(false);
  const [cref, setCref] = useState('');
  const [crn, setCrn] = useState('');
  const [gymName, setGymName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');

  function validateStep1() {
    if (!fullName.trim()) return 'Informe seu nome completo.';
    if (!email.trim() || !email.includes('@')) return 'Informe um e-mail válido.';
    if (password.length < 6) return 'A senha deve ter ao menos 6 caracteres.';
    if (password !== password2) return 'As senhas não coincidem.';
    return null;
  }

  function validateStep2() {
    if (!isPersonalTrainer && !isNutritionist) return 'Selecione pelo menos um tipo de profissional.';
    if (isPersonalTrainer && !cref.trim()) return 'CREF é obrigatório para Personal Trainer.';
    if (isNutritionist && !crn.trim()) return 'CRN é obrigatório para Nutricionista.';
    return null;
  }

  function goStep2() {
    const err = validateStep1();
    if (err) { Alert.alert('Atenção', err); return; }
    setStep(2);
  }

  async function handleRegister() {
    const err = validateStep2();
    if (err) { Alert.alert('Atenção', err); return; }
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          password,
          user_type: 'professional',
          is_personal_trainer: isPersonalTrainer,
          is_nutritionist: isNutritionist,
          cref: isPersonalTrainer ? cref.trim() : undefined,
          crn: isNutritionist ? crn.trim() : undefined,
          gym_name: gymName.trim() || undefined,
          specialty: specialty.trim() || undefined,
          bio: bio.trim() || undefined,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        const msg =
          data?.email?.[0] ||
          data?.non_field_errors?.[0] ||
          data?.detail ||
          'Não foi possível criar a conta.';
        Alert.alert('Erro no cadastro', msg);
        return;
      }
      if (data.access) {
        await AsyncStorage.setItem('access_token', data.access);
        await AsyncStorage.setItem('refresh_token', data.refresh);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
      }
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 1) {
    return (
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.hero}>
            <Text style={s.logo}>GYM<Text style={s.accent}>PRO</Text></Text>
            <Text style={s.tagline}>Área do Profissional</Text>
          </View>

          <View style={s.card}>
            <Text style={s.title}>Criar Conta</Text>
            <Text style={s.subtitle}>Passo 1 de 2 — Dados pessoais</Text>

            <Text style={s.label}>Nome completo</Text>
            <TextInput style={s.input} value={fullName} onChangeText={setFullName}
              placeholder="Nome Sobrenome" placeholderTextColor={Colors.textMuted} />

            <Text style={s.label}>E-mail profissional</Text>
            <TextInput style={s.input} value={email} onChangeText={setEmail}
              placeholder="profissional@email.com" placeholderTextColor={Colors.textMuted}
              keyboardType="email-address" autoCapitalize="none" />

            <Text style={s.label}>Telefone / WhatsApp</Text>
            <TextInput style={s.input} value={phone} onChangeText={setPhone}
              placeholder="(11) 99999-9999" placeholderTextColor={Colors.textMuted} keyboardType="phone-pad" />

            <Text style={s.label}>Senha</Text>
            <TextInput style={s.input} value={password} onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres" placeholderTextColor={Colors.textMuted} secureTextEntry />

            <Text style={s.label}>Confirmar senha</Text>
            <TextInput style={s.input} value={password2} onChangeText={setPassword2}
              placeholder="Repita a senha" placeholderTextColor={Colors.textMuted} secureTextEntry />

            <TouchableOpacity style={s.btn} onPress={goStep2} activeOpacity={0.85}>
              <Text style={s.btnText}>Próximo →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.link} onPress={() => router.push('/login' as any)}>
              <Text style={s.linkText}>Já tem conta? <Text style={s.linkAccent}>Entrar</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Text style={s.logo}>GYM<Text style={s.accent}>PRO</Text></Text>
          <Text style={s.tagline}>Área do Profissional</Text>
        </View>

        <View style={s.card}>
          <Text style={s.title}>Tipo de Profissional</Text>
          <Text style={s.subtitle}>Passo 2 de 2 — Selecione sua(s) especialidade(s)</Text>

          {/* Type selection */}
          <View style={s.typeRow}>
            <TouchableOpacity
              style={[s.typeCard, isPersonalTrainer && s.typeCardActive]}
              onPress={() => setIsPersonalTrainer(v => !v)}
              activeOpacity={0.8}
            >
              <Text style={s.typeIcon}>💪</Text>
              <Text style={[s.typeLabel, isPersonalTrainer && s.typeLabelActive]}>Personal Trainer</Text>
              <Text style={[s.typeDesc, isPersonalTrainer && s.typeDescActive]}>
                Treinos, musculação, performance
              </Text>
              <View style={[s.typeCheck, isPersonalTrainer && s.typeCheckActive]}>
                {isPersonalTrainer && <Text style={s.typeCheckMark}>✓</Text>}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.typeCard, isNutritionist && s.typeCardActive]}
              onPress={() => setIsNutritionist(v => !v)}
              activeOpacity={0.8}
            >
              <Text style={s.typeIcon}>🥗</Text>
              <Text style={[s.typeLabel, isNutritionist && s.typeLabelActive]}>Nutricionista</Text>
              <Text style={[s.typeDesc, isNutritionist && s.typeDescActive]}>
                Dieta, alimentação, suplementação
              </Text>
              <View style={[s.typeCheck, isNutritionist && s.typeCheckActive]}>
                {isNutritionist && <Text style={s.typeCheckMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          </View>

          {isPersonalTrainer && (
            <>
              <Text style={s.label}>CREF (obrigatório para Personal Trainer)</Text>
              <TextInput style={s.input} value={cref} onChangeText={setCref}
                placeholder="000000-G/SP" placeholderTextColor={Colors.textMuted} autoCapitalize="characters" />
            </>
          )}

          {isNutritionist && (
            <>
              <Text style={s.label}>CRN (obrigatório para Nutricionista)</Text>
              <TextInput style={s.input} value={crn} onChangeText={setCrn}
                placeholder="CRN-3 00000" placeholderTextColor={Colors.textMuted} autoCapitalize="characters" />
            </>
          )}

          <Text style={s.label}>Academia / Consultório (opcional)</Text>
          <TextInput style={s.input} value={gymName} onChangeText={setGymName}
            placeholder="Nome do local de trabalho" placeholderTextColor={Colors.textMuted} />

          <Text style={s.label}>Especialidade / Foco (opcional)</Text>
          <TextInput style={s.input} value={specialty} onChangeText={setSpecialty}
            placeholder="Ex: Hipertrofia, Emagrecimento, Atletas..." placeholderTextColor={Colors.textMuted} />

          <Text style={s.label}>Bio (opcional)</Text>
          <TextInput
            style={[s.input, { height: 80, textAlignVertical: 'top' }]}
            value={bio} onChangeText={setBio}
            placeholder="Conte um pouco sobre você..." placeholderTextColor={Colors.textMuted}
            multiline numberOfLines={3}
          />

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Criar conta</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.link} onPress={() => setStep(1)}>
            <Text style={s.linkText}><Text style={s.linkAccent}>← Voltar</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  hero: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 42, fontWeight: '900', color: Colors.text, letterSpacing: 4 },
  accent: { color: Colors.primary },
  tagline: { fontSize: 12, color: Colors.textMuted, letterSpacing: 6, marginTop: 4, textTransform: 'uppercase' },
  card: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 24 },
  label: { fontSize: 13, color: Colors.textMuted, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.text, fontSize: 15,
  },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeCard: {
    flex: 1, backgroundColor: Colors.background, borderRadius: 16, padding: 16,
    borderWidth: 2, borderColor: Colors.border, alignItems: 'center', gap: 6, position: 'relative',
  },
  typeCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '14' },
  typeIcon: { fontSize: 28 },
  typeLabel: { fontSize: 14, fontWeight: '700', color: Colors.textMuted, textAlign: 'center' },
  typeLabelActive: { color: Colors.primary },
  typeDesc: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 16 },
  typeDescActive: { color: Colors.text },
  typeCheck: {
    position: 'absolute', top: 8, right: 8, width: 20, height: 20,
    borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  typeCheckActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeCheckMark: { color: '#fff', fontSize: 11, fontWeight: '700' },
  btn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 28,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: 20 },
  linkText: { color: Colors.textMuted, fontSize: 14 },
  linkAccent: { color: Colors.primary, fontWeight: '600' },
});
