// Base API client.
//
// Centralizes the backend base URL and (eventually) the Authorization header
// attachment, so feature code never hardcodes a URL or repeats auth-header
// wiring. Per the API Contract, all business endpoints live under
// `/api/v1/...` on the backend — the health check is the one exception,
// which is why it's called with its own relative path below rather than
// through this shared client.
//
// No real API calls exist yet in Slice 0 (no auth, no listings) — this file
// only proves the frontend can reach the backend at all, via the health
// check used in App.jsx.

import axios from 'axios';

// Vite exposes env vars prefixed with VITE_ to client code (see .env.example
// and vite.config.js). VITE_API_BASE_URL should point at the backend's origin,
// e.g. http://localhost:5000 in development.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Slice 1 will add a request interceptor here to attach the JWT from auth
// state, e.g.:
// apiClient.interceptors.request.use((config) => { ... attach token ... })

export const API_BASE_URL_ROOT = API_BASE_URL;
