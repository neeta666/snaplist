// ProtectedRoute — placeholder.
//
// Per the Technical Design Document (section 3), this wrapper checks auth
// state before rendering protected pages and redirects to Login if absent.
// Real auth-state checking arrives in Slice 1 alongside the auth store;
// for now it renders children unconditionally so the routing skeleton is
// navigable end to end before authentication exists.

export default function ProtectedRoute({ children }) {
  // Slice 1 will replace this with a real check against the auth store,
  // e.g.:
  //   const { user } = useAuthStore();
  //   if (!user) return <Navigate to="/login" replace />;
  return children;
}
