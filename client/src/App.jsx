// App.jsx — routing skeleton.
//
// Wires AuthLayout/AppLayout to their respective pages. No real navigation
// guarding exists yet (ProtectedRoute is a pass-through placeholder — see
// components/ProtectedRoute.jsx); it will start actually redirecting once
// Slice 1 adds real auth state. A brief backend connectivity check is
// included here only to prove Slice 0's scaffolding works end to end
// (frontend can reach the backend's health-check endpoint) — this is not a
// permanent feature and will be removed once real pages replace this
// landing view.

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import NewListing from './pages/NewListing';
import ListingDetail from './pages/ListingDetail';
import { API_BASE_URL_ROOT } from './lib/apiClient';

function ScaffoldStatus() {
  // Temporary Slice-0-only view: confirms the frontend can reach the
  // backend's health-check endpoint. Replaced by the real Dashboard once
  // Slice 4/6 land.
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    fetch(`${API_BASE_URL_ROOT}/health`)
      .then((res) => res.json())
      .then((body) => setStatus(`backend: ${body.data.status}, db: ${body.data.database}`))
      .catch(() => setStatus('backend unreachable'));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">SnapList</h1>
      <p className="text-sm text-gray-500 mt-2">Slice 0 scaffold — {status}</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Unauthenticated pages */}
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />

        {/* Authenticated app shell */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<ScaffoldStatus />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/new"
            element={
              <ProtectedRoute>
                <NewListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/:id"
            element={
              <ProtectedRoute>
                <ListingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
