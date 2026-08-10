import { apiClient } from '../lib/apiClient';

// GET /dashboard/stats (API Contract 4.1).
export async function getDashboardStats() {
  const response = await apiClient.get('/dashboard/stats');

  return response.data.data;
}