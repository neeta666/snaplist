// Base API client.
//
// Centralizes the backend base URL and Authorization header attachment, so
// feature code never hardcodes a URL or repeats auth-header wiring. Per the
// API Contract, all business endpoints live under `/api/v1/...` on the
// backend — the health check is the one exception, which is why it's
// called with its own relative path in App.jsx rather than through this
// shared client.

import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

// Vite exposes env vars prefixed with VITE_ to client code (see .env.example
// and vite.config.js). VITE_API_BASE_URL should point at the backend's origin,
// e.g. http://localhost:5000 in development.
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attaches the current JWT (if any) to every outgoing request. Reads the
// token via useAuthStore.getState() rather than the useAuthStore() hook,
// since this file is a plain module, not a React component — getState() is
// Zustand's supported way to read current state from outside a component.
//
// No response interceptor is added here to auto-clear auth state on a 401.
// That's deliberately left to be handled explicitly wherever a 401 actually
// occurs (e.g. the session-restoration check, or a protected page's own
// error handling in a later step), rather than a blanket global rule —
// a 401 from, say, a login attempt itself doesn't mean an existing session
// should be torn down (there isn't one yet), so a global interceptor would
// need the same case-by-case judgment anyway.
apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const API_BASE_URL_ROOT = API_BASE_URL;