import { api } from './client';

// Spotify
export async function getSpotifyAuthUrl(redirectUri: string, codeChallenge: string, state: string) {
  const resp = await api.get('/api/spotify/auth-url/', {
    params: { redirect_uri: redirectUri, code_challenge: codeChallenge, state },
  });
  return resp.data.auth_url as string;
}

export async function connectSpotify(code: string, codeVerifier: string, redirectUri: string) {
  const resp = await api.post('/api/spotify/callback/', {
    code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
  });
  return resp.data;
}

export async function getSpotifyStatus() {
  const resp = await api.get('/api/spotify/status/');
  return resp.data as { connected: boolean };
}

export async function getSpotifyPlaylists() {
  const resp = await api.get('/api/spotify/playlists/');
  return resp.data;
}

export async function refreshSpotifyToken() {
  const resp = await api.post('/api/spotify/refresh/');
  return resp.data;
}

// YouTube
export async function searchYoutube(q: string, maxResults = 10) {
  const resp = await api.get('/api/youtube/search/', { params: { q, max_results: maxResults } });
  return resp.data;
}

export async function getYoutubePlaylist(playlistId: string, maxResults = 20) {
  const resp = await api.get('/api/youtube/playlist/', {
    params: { playlist_id: playlistId, max_results: maxResults },
  });
  return resp.data;
}

// Location
export async function getNearbyGyms(lat: number, lng: number, radiusKm = 20) {
  const resp = await api.get('/api/location/nearby/', {
    params: { lat, lng, radius_km: radiusKm },
  });
  return resp.data;
}

// Evolution
export async function getEvolutionLogs() {
  const resp = await api.get('/api/evolution/');
  return resp.data;
}

export async function createEvolutionLog(data: {
  peso_kg?: number;
  gordura_corporal?: number;
  massa_muscular?: number;
  imc?: number;
  notas?: string;
  fotos?: string[];
}) {
  const resp = await api.post('/api/evolution/', data);
  return resp.data;
}

export async function getEvolutionLog(id: number) {
  const resp = await api.get(`/api/evolution/${id}/`);
  return resp.data;
}

export async function deleteEvolutionLog(id: number) {
  await api.delete(`/api/evolution/${id}/`);
}

// Nutrition
export async function getNutritionPlans() {
  const resp = await api.get('/api/nutrition/');
  return resp.data;
}

export async function getNutritionPlan(id: number) {
  const resp = await api.get(`/api/nutrition/${id}/`);
  return resp.data;
}

export async function createNutritionPlan(data: {
  titulo: string;
  objetivo: string;
  calorias_diarias?: number;
  proteinas_g?: number;
  carboidratos_g?: number;
  gorduras_g?: number;
  refeicoes?: object[];
  notas?: string;
  student_id?: number;
}) {
  const resp = await api.post('/api/nutrition/', data);
  return resp.data;
}

export async function updateNutritionPlan(id: number, data: object) {
  const resp = await api.patch(`/api/nutrition/${id}/`, data);
  return resp.data;
}

export async function deleteNutritionPlan(id: number) {
  await api.delete(`/api/nutrition/${id}/`);
}

// Notifications
export async function getNotifications() {
  const resp = await api.get('/api/notifications/');
  return resp.data;
}

export async function markNotificationRead(id: number) {
  const resp = await api.patch(`/api/notifications/${id}/read/`);
  return resp.data;
}

export async function markAllNotificationsRead() {
  const resp = await api.post('/api/notifications/mark-all-read/');
  return resp.data;
}

export async function updateFcmToken(fcmToken: string) {
  const resp = await api.post('/api/notifications/update-fcm-token/', { fcm_token: fcmToken });
  return resp.data;
}

// Students (pro dashboard)
export async function getMyStudents() {
  const resp = await api.get('/api/students/');
  return resp.data;
}

export async function getStudentDetail(studentId: number) {
  const resp = await api.get(`/api/students/${studentId}/`);
  return resp.data;
}

export async function createInviteCode() {
  const resp = await api.post('/api/auth/invite/create/');
  return resp.data as { code: string };
}

export async function useInviteCode(code: string) {
  const resp = await api.post('/api/auth/use-invite/', { code });
  return resp.data;
}

// Admin stats
export async function getAdminStats() {
  const resp = await api.get('/api/admin-stats/');
  return resp.data;
}
