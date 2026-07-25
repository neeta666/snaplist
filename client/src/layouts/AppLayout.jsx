// AppLayout — wraps authenticated pages (Dashboard, New Listing, etc.).
//
// Per the Technical Design Document (section 3): nav/topbar wrapping all
// authenticated pages. `<Outlet />` renders whichever page the router
// matched.
//
// AppLayout also wraps the one unprotected route ("/", the Slice-0
// scaffold status page — see App.jsx), so the nav here has to make sense
// for both a logged-in and a logged-out visitor: it shows the user's name
// + a logout button only when actually authenticated, and Login/Register
// links otherwise. This is the minimum needed for the logout button to be
// coherent, not a broader visual redesign — that's Slice 8 scope.
//
// Logout: per ADR 9, JWTs are stateless in V1, so clearing local state
// (clearAuth) is what actually logs the user out — the POST /auth/logout
// call is best-effort for API Contract consistency (section 2.4) and its
// failure is deliberately not allowed to block the local logout.

import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../lib/apiClient';

export default function AppLayout() {
  const navigate = useNavigate();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Intentionally ignored — see file comment above. A failed logout
      // request should never prevent the user from being logged out
      // locally, since there is no server-side session that could be left
      // in an inconsistent state.
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-gray-900">
            SnapList
          </Link>

          {status === 'authenticated' ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">
                {user.name}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Log in
              </Link>
              <Link to="/register" className="text-sm text-gray-600 hover:text-gray-900">
                Register
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}