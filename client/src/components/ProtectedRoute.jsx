// ProtectedRoute — real auth-state check.
//
// Per the Technical Design Document (section 3): checks auth state before
// rendering a protected page and redirects to Login if there's no valid
// session.
//
// Three states from authStore matter here, not just two:
//   - 'idle' / 'checking' — session status isn't resolved yet (either
//     hydration hasn't run, or a persisted token is being validated via
//     GET /auth/me — see hooks/useSessionRestore.js). Rendering nothing
//     (or a minimal loading state) here — NOT redirecting to /login — is
//     what actually matters: a valid session should never get bounced to
//     the login page just because the validation round-trip hasn't
//     finished yet.
//   - 'unauthenticated' — resolved, and there's definitely no valid
//     session. Redirect to /login.
//   - 'authenticated' — render the protected page.

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const status = useAuthStore((state) => state.status);

  if (status === 'idle' || status === 'checking') {
    return <p className="text-sm text-gray-500">Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return children;
}