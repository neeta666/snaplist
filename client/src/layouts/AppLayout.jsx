// AppLayout — wraps authenticated pages (Dashboard, New Listing, etc.).
//
// Per the Technical Design Document (section 3): nav/topbar wrapping all
// authenticated pages. `<Outlet />` renders whichever page the router
// matched. Real navigation items and visual design are added incrementally
// as their features land (Slice 1 auth links now; Dashboard/New Listing
// links from Slice 4 onward); polish is Slice 8 scope.

import { Outlet, Link } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-gray-900">
            SnapList
          </Link>
          {/* Slice 1 adds: profile link, logout button */}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
