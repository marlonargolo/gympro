import { api } from './client';

export async function getWorkouts(params?: { modalidade?: string; nivel?: string }) {
  const resp = await api.get('/api/workouts/', { params });
  return resp.data;
}

export async function getWorkout(id: string) {
  const resp = await api.get(`/api/workouts/${id}/`);
  return resp.data;
}

export async function createWorkout(data: object) {
  const resp = await api.post('/api/workouts/', data);
  return resp.data;
}

export async function updateWorkout(id: string, data: object) {
  const resp = await api.patch(`/api/workouts/${id}/`, data);
  return resp.data;
}

export async function deleteWorkout(id: string) {
  await api.delete(`/api/workouts/${id}/`);
}

export async function assignWorkout(id: string, studentIds: number[]) {
  const resp = await api.post(`/api/workouts/${id}/assign/`, { student_ids: studentIds });
  return resp.data;
}

export async function logWorkout(id: string, data: object) {
  const resp = await api.post(`/api/workouts/${id}/log/`, data);
  return resp.data;
}

export async function getWorkoutLogs(id: string) {
  const resp = await api.get(`/api/workouts/${id}/logs/`);
  return resp.data;
}
