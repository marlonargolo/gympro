import { api } from './client';

export async function createPaymentPreference(planId: number) {
  const resp = await api.post('/api/payments/create-preference/', { plan_id: planId });
  return resp.data as {
    payment_id: string;
    preference_id: string;
    init_point: string;
    sandbox_init_point: string;
  };
}

export async function getPaymentStatus(paymentId: string) {
  const resp = await api.get(`/api/payments/${paymentId}/status/`);
  return resp.data;
}

export async function getPaymentHistory() {
  const resp = await api.get('/api/payments/history/');
  return resp.data;
}
