// Session restoration.
//
// Implements the "checking" leg of the token-persistence flow: when
// authStore's `merge` (see store/authStore.js) finds a persisted token on
// load, it sets status to 'checking' rather than assuming the token is
// still valid. This hook is what actually acts on that — it calls
// GET /auth/me exactly when status is 'checking', and resolves it one way
// or the other:
//   - success -> setUser(user), status becomes 'authenticated'
//   - failure (401 — invalid/expired token, or a deleted account) ->
//     clearAuth(), status becomes 'unauthenticated'
//
// This is a one-time effect per "checking" episode, not a polling loop —
// it only re-runs if status transitions back to 'checking' again (which
// doesn't currently happen mid-session; it only happens once, on load,
// per authStore's merge logic).
//
// Called once, at the top of App.jsx — not inside ProtectedRoute — so it
// runs a single time regardless of which route the user lands on first,
// rather than re-triggering per protected page visited.

import { useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';

export function useSessionRestore() {
  const status = useAuthStore((state) => state.status);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (status !== 'checking') return;

    let cancelled = false;

    apiClient
      .get('/auth/me')
      .then((response) => {
        if (cancelled) return;
        setUser(response.data.data.user);
      })
      .catch(() => {
        if (cancelled) return;
        // Per the API Contract, any failure here (401 — missing, invalid,
        // or expired token) is generic; we don't need to distinguish why —
        // an invalid session is cleared the same way regardless.
        clearAuth();
      });

    return () => {
      // Guards against setting state from a stale request if this effect
      // were ever to re-run before the first call resolves (not expected
      // in practice, given status only reaches 'checking' once, but cheap
      // insurance against a race).
      cancelled = true;
    };
  }, [status, setUser, clearAuth]);
}