// Global auth state.
//
// Implements the token-persistence flow agreed on for Slice 1:
//   - Only `token` is persisted to localStorage (via the `partialize` option
//     below) — never `user`. The user object is always meant to come fresh
//     from GET /auth/me, so there is one source of truth for "is this
//     session actually still valid" (the server), not a stale localStorage
//     copy of user data.
//   - `status` tracks where the session currently stands:
//       'idle'          — the store's initial value, before hydration has
//                         resolved. Zustand's hydration runs via a promise
//                         (even for synchronous storage like localStorage —
//                         confirmed by reading zustand's own middleware
//                         source), so a component can in principle render
//                         once before that promise resolves. Keeping this
//                         distinct from 'unauthenticated' matters: if the
//                         initial default were 'unauthenticated', a
//                         component checking status on that very first
//                         render could momentarily see "logged out" even
//                         when a valid persisted token is a microtask away
//                         from being restored as 'checking' below.
//       'checking'      — hydration resolved and found a persisted token;
//                         GET /auth/me is expected to be called next (by
//                         app-level startup code, not this file) to
//                         confirm it's still valid
//       'authenticated' — a valid user is loaded (via setAuth or setUser)
//       'unauthenticated' — hydration resolved and found no persisted
//                         token, or a token that later failed validation
//                         (via clearAuth)
//
// The 'checking'/'unauthenticated' transition is set during hydration via
// the `merge` option below — Zustand persist's documented mechanism for
// controlling exactly how persisted state combines with the store's
// initial state — rather than by mutating the state object inside
// `onRehydrateStorage`'s callback. `merge` is a pure function: it receives
// what was found in storage (or `undefined` if nothing was ever
// persisted) and the store's initial state, and returns the state to
// actually use. Zustand then applies that return value via a full
// `set(..., true)` replace (confirmed by reading zustand's own middleware
// source), so there's no in-place mutation of a live state object anywhere
// in this flow — `merge` always runs, even when nothing was ever
// persisted, so both the "token present" and "no token" cases are handled
// by the same single code path below.
//
// This file does not call the API itself (no import of apiClient here) —
// keeping the store as pure state/actions and letting a startup effect
// elsewhere own the actual /auth/me call avoids a circular import between
// this file and apiClient.js (which imports this store to attach the
// token — see apiClient.js).
//
// `storage` is passed explicitly as `createJSONStorage(() => localStorage)`
// rather than left to Zustand's built-in default. Zustand's default
// resolves to `window.localStorage` specifically — identical in a real
// browser, but it makes the code implicitly depend on a `window` global
// existing at all. Being explicit here avoids that implicit dependency and
// also made this store directly testable in a plain Node script during
// development (with a minimal localStorage polyfill), without needing a
// browser or a DOM testing library.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      status: 'idle',

      // Called after a successful register or login: we have both a fresh
      // token and the user object returned alongside it.
      setAuth: (user, token) => set({ user, token, status: 'authenticated' }),

      // Called after a successful GET /auth/me during session restoration,
      // when we already have the token (from rehydration) and are now
      // confirming/populating the user.
      setUser: (user) => set({ user, status: 'authenticated' }),

      // Clears both token and user together, never one without the other —
      // used for both explicit logout and a failed session-restoration
      // check (invalid/expired token).
      clearAuth: () => set({ user: null, token: null, status: 'unauthenticated' }),
    }),
    {
      name: 'snaplist-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),

      // Called unconditionally during hydration, whether or not anything
      // was ever persisted. `persistedState` is whatever partialize wrote
      // out previously (i.e. just `{ token }`), or `undefined` if this is
      // the very first load. `currentState` is the store's initial state
      // from the creator function above (token: null, user: null,
      // status: 'idle', plus the action functions).
      merge: (persistedState, currentState) => {
        const restoredToken = persistedState?.token ?? null;
        return {
          ...currentState,
          token: restoredToken,
          user: null,
          status: restoredToken ? 'checking' : 'unauthenticated',
        };
      },
    }
  )
);