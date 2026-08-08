import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000';

// Let Axios choose Content-Type so JSON and FormData are handled correctly.
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
});

apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const API_BASE_URL_ROOT = API_BASE_URL;