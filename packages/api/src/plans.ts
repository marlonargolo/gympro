import { api } from './client';

export async function getPlans(type?: 'student' | 'professional') {
  const resp = await api.get('/api/plans/', { params: type ? { type } : undefined });
  return resp.data;
}

export async function getPlan(slug: string) {
  const resp = await api.get(`/api/plans/${slug}/`);
  return resp.data;
}

export async function getMySubscription() {
  const resp = await api.get('/api/subscriptions/me/');
  return resp.data;
}

export async function createSubscription(planId: number) {
  const resp = await api.post('/api/subscriptions/', { plan_id: planId });
  return resp.data;
}
