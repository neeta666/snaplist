// AuthLayout — wraps unauthenticated pages (Register, Login).
//
// Per the Technical Design Document (section 3): a simple centered-card
// layout, distinct from AppLayout. Kept intentionally plain in Slice 0 —
// real visual design/polish is Slice 8 scope, not scaffolding.

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        {children}
      </div>
    </div>
  );
}
