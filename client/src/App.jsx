import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import AuthWelcome from './pages/AuthWelcome';
import Profile from './pages/Profile';
import NewListing from './pages/NewListing';
import ListingDetail from './pages/ListingDetail';
import Listings from './pages/Listings';
import { API_BASE_URL_ROOT } from './lib/apiClient';
import { useSessionRestore } from './hooks/useSessionRestore';

// Temporary Slice-0 scaffold at "/" — replaced by the real landing page later.
function ScaffoldStatus() {
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
  useSessionRestore();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionInitializer />
      <Routes>
        <Route path="/auth/welcome" element={<AuthWelcome />} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<ScaffoldStatus />} />
          <Route path="/dashboard" element={<Navigate to="/listings/new" replace />} />
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