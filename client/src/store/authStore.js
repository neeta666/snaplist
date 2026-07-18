// Global auth state — placeholder.
//
// Per the Technical Design Document (section 3), this will hold the current
// user and JWT using a lightweight store (Zustand is the planned choice —
// see the Technical Design Document). No state library is installed yet:
// adding it now, before there's any real auth state to manage, would be
// scaffolding ahead of Slice 1's actual scope. This file exists so the
// `store/` folder and its intended purpose are visible from Slice 0 onward.

// Slice 1 will implement something along these lines:
//
// import { create } from 'zustand';
//
// export const useAuthStore = create((set) => ({
//   user: null,
//   token: null,
//   setAuth: (user, token) => set({ user, token }),
//   clearAuth: () => set({ user: null, token: null }),
// }));
