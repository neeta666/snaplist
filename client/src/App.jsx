// App.jsx — routing skeleton.
//
// Wires AuthLayout/AppLayout to their respective pages. SessionInitializer
// (defined below) calls useSessionRestore() from inside the <BrowserRouter>
// tree, not before it — useSessionRestore doesn't currently use any
// router-specific hooks itself, but keeping all routing-related
// initialization inside the router's context is the safer long-term
// pattern (e.g. if this hook or a sibling ever needs useNavigate/useLocation
// as the app grows), rather than running it at the top of App() where
// there's no router context yet at all.

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
import Listings from './pages/Listings';
import { API_BASE_URL_ROOT } from './lib/apiClient';
import { useSessionRestore } from './hooks/useSessionRestore';

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

function SessionInitializer() {
  // Renders nothing — exists purely so useSessionRestore() runs inside the
  // <BrowserRouter> tree instead of at the top of App(), where no router
  // context exists yet.
  useSessionRestore();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionInitializer />
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
            path="/listings"
            element={
              <ProtectedRoute>
                <Listings />
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