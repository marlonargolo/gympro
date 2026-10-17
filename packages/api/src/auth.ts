import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './client';

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  user_type: 'student' | 'professional';
  modalidade?: string;
  sexo?: string;
  fitness_goal?: string;
  cref?: string;
  gym_name?: string;
  specialty?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

async function storeTokens(access: string, refresh: string) {
  await AsyncStorage.multiSet([
    ['access_token', access],
    ['refresh_token', refresh],
  ]);
}

export async function register(payload: RegisterPayload) {
  const resp = await api.post('/api/auth/register/', payload);
  await storeTokens(resp.data.access, resp.data.refresh);
  return resp.data;
}

export async function login(payload: LoginPayload) {
  const resp = await api.post('/api/auth/login/', payload);
  await storeTokens(resp.data.access, resp.data.refresh);
  return resp.data;
}

export async function logout(refreshToken: string) {
  await api.post('/api/auth/logout/', { refresh: refreshToken });
  await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
}

export async function getMe() {
  const resp = await api.get('/api/auth/me/');
  return resp.data;
}

export async function updateMe(data: Partial<RegisterPayload>) {
  const resp = await api.patch('/api/auth/me/', data);
  return resp.data;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const resp = await api.post('/api/auth/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return resp.data;
}

export async function useInviteCode(code: string) {
  const resp = await api.post('/api/auth/use-invite/', { code });
  return resp.data;
}

export async function getStoredTokens() {
  const result = await AsyncStorage.multiGet(['access_token', 'refresh_token']);
  return {
    access: result[0][1],
    refresh: result[1][1],
  };
}

export async function isLoggedIn() {
  const { access } = await getStoredTokens();
  return !!access;
}
