import { api } from './client';

export async function getFeed() {
  const resp = await api.get('/api/feed/');
  return resp.data;
}

export async function createPost(data: { caption: string; media_url?: string; tipo: string }) {
  const resp = await api.post('/api/feed/', data);
  return resp.data;
}

export async function toggleLike(postId: number) {
  const resp = await api.post(`/api/feed/${postId}/like/`);
  return resp.data;
}

export async function deletePost(postId: number) {
  await api.delete(`/api/feed/${postId}/`);
}

// Instagram
export async function getInstagramAuthUrl(redirectUri: string) {
  const resp = await api.get('/api/instagram/auth-url/', {
    params: { redirect_uri: redirectUri },
  });
  return resp.data.auth_url as string;
}

export async function connectInstagram(code: string, redirectUri: string) {
  const resp = await api.post('/api/instagram/callback/', { code, redirect_uri: redirectUri });
  return resp.data;
}

export async function getInstagramStatus() {
  const resp = await api.get('/api/instagram/status/');
  return resp.data as { connected: boolean; instagram_user_id: string | null };
}

export async function publishToInstagram(data: {
  post_type: 'feed' | 'story' | 'reel';
  media_url: string;
  caption?: string;
}) {
  const resp = await api.post('/api/instagram/publish/', data);
  return resp.data;
}
