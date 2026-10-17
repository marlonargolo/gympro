import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://89.117.33.235:8000';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = await AsyncStorage.getItem('refresh_token');
        if (!refresh) return Promise.reject(error);
        const resp = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, { refresh });
        const newAccess = resp.data.access;
        await AsyncStorage.setItem('access_token', newAccess);
        if (resp.data.refresh) {
          await AsyncStorage.setItem('refresh_token', resp.data.refresh);
        }
        original.headers.Authorization = `Bearer ${newAccess}`;
        return axios(original);
      } catch {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export { BASE_URL };
