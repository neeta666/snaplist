// AppLayout — wraps authenticated pages (Dashboard, New Listing, etc.),
// and also the one public route ("/") per the existing routing in App.jsx.
//
// Auth/session/logout behavior is unchanged from the original: JWTs are
// stateless (ADR 9), so clearAuth() is what actually logs the user out;
// the POST /auth/logout call is best-effort and its failure never blocks
// the local logout (see original file comment, preserved in intent below).

import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { apiClient } from "../lib/apiClient";
import ThemeToggle from "../components/ui/ThemeToggle";
import snaplistSymbol from "../assets/snaplist-symbol.png";
import snaplistWordmark from "../assets/snaplist-wordmark.png";

const authNavLinks = [
  { to: "/listings/new", label: "Create" },
  { to: "/listings", label: "My Listings" },
];

// NavLink's default matching can't express this: "/listings" must match as
// a prefix for "/listings/:id" but NOT for "/listings/new", which is itself
// an exact match. That's not expressible as a single exact-vs-prefix
// choice, so active state is computed explicitly per link instead.
function isLinkActive(to, pathname) {
  if (to === "/listings") {
    return (
      pathname === "/listings" ||
      (pathname.startsWith("/listings/") && pathname !== "/listings/new")
    );
  }

  return pathname === to;
}

function navLinkClasses(isActive) {
  return [
    "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
    isActive
      ? "bg-nav-active-bg text-brand"
      : "text-ink-muted hover:text-ink",
  ].join(" ");
}

function mobileMenuItemClasses(isActive, isPressed) {
  return [
    "app-auth-mobile-menu-item",
    "flex h-11 w-full items-center rounded-lg border px-2 text-left text-sm font-medium transition-all duration-200",
    isPressed
      ? "border-brand bg-brand-tint text-brand"
      : isActive
        ? "border-transparent text-brand"
        : "border-transparent text-ink-muted hover:border-brand hover:bg-brand-tint hover:text-ink",
  ].join(" ");
}

export default function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [pressedMenuItem, setPressedMenuItem] = useState(null);

  const isAuthenticated = status === "authenticated";
  const isCreatePage = pathname === "/listings/new";

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Intentionally ignored — there is no server-side session that could
      // be left inconsistent; local logout is always what matters.
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setPressedMenuItem(null);
  };

  const handleMobileNavigation = (item, path) => {
    setPressedMenuItem(item);

    setTimeout(() => {
      setPressedMenuItem(null);
      setIsMobileMenuOpen(false);
      navigate(path);
    }, 120);
  };

  const handleMobileLogout = () => {
    setPressedMenuItem("logout");

    setTimeout(() => {
      setPressedMenuItem(null);
      setIsMobileMenuOpen(false);
      handleLogout();
    }, 120);
  };

  const handleMobileThemeClose = () => {
    setTimeout(() => {
      setPressedMenuItem(null);
      setIsMobileMenuOpen(false);
    }, 120);
  };

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="app-auth-header sticky top-0 z-40 bg-surface">
        {/* Header bar */}
        <div className="app-auth-header-top relative z-10 bg-surface shadow-[var(--shadow-header)]">
          <div className="mx-auto max-w-5xl px-4">
            <div className="flex h-16 items-center justify-between">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex shrink-0 items-center gap-2"
                aria-label="SnapList"
              >
                <img
                  src={snaplistSymbol}
                  alt=""
                  className="block h-11 w-11 object-contain"
                  aria-hidden="true"
                />

                <img
                  src={snaplistWordmark}
                  alt="SnapList"
                  className="block h-11 w-auto object-contain"
                />
              </Link>

              {/* Desktop nav */}
              <nav className="hidden items-center gap-2 md:flex">
                {isAuthenticated &&
                  authNavLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={navLinkClasses(
                        isLinkActive(link.to, pathname),
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
              </nav>

              <div className="hidden items-center gap-4 md:flex">
                <ThemeToggle />

                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsProfileMenuOpen((open) => !open)
                      }
                      className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-nav-active-bg hover:text-ink"
                      aria-expanded={isProfileMenuOpen}
                      aria-haspopup="menu"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-semibold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>

                      <span>{user?.name || "Profile"}</span>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-ink-muted"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {isProfileMenuOpen && (
                      <div
                        className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-border bg-surface p-1.5 shadow-lg"
                        role="menu"
                      >
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-nav-active-bg hover:text-ink"
                          role="menuitem"
                        >
                          Profile
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-danger hover:bg-nav-active-bg"
                          role="menuitem"
                        >
                          Log out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-sm font-medium text-ink-muted hover:text-ink"
                    >
                      Log in
                    </Link>

                    <Link
                      to="/register"
                      className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-hover"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => {
                  setPressedMenuItem(null);
                  setIsMobileMenuOpen((open) => !open);
                }}
                className="app-auth-mobile-menu-toggle inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:text-brand md:hidden"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav panel */}
        {isMobileMenuOpen && (
          <nav className="app-auth-mobile-menu px-4 py-2 md:hidden">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleMobileNavigation("create", "/listings/new")
                  }
                  className={mobileMenuItemClasses(
                    isLinkActive("/listings/new", pathname),
                    pressedMenuItem === "create",
                  )}
                >
                  Create
                </button>

                <div className="app-auth-mobile-divider border-t-2" />

                <button
                  type="button"
                  onClick={() =>
                    handleMobileNavigation("listings", "/listings")
                  }
                  className={mobileMenuItemClasses(
                    isLinkActive("/listings", pathname),
                    pressedMenuItem === "listings",
                  )}
                >
                  My Listings
                </button>

                <div className="app-auth-mobile-divider my-1 border-t-2" />

                <button
                  type="button"
                  onClick={() =>
                    handleMobileNavigation("profile", "/profile")
                  }
                  className={mobileMenuItemClasses(
                    pathname === "/profile",
                    pressedMenuItem === "profile",
                  )}
                >
                  {user?.name || "Profile"}
                </button>

                <div className="app-auth-mobile-divider border-t-2" />

                <button
                  type="button"
                  onClick={handleMobileLogout}
                  className={mobileMenuItemClasses(
                    false,
                    pressedMenuItem === "logout",
                  )}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleMobileNavigation(
                      "login",
                      "/auth/welcome?next=login",
                    )
                  }
                  className={mobileMenuItemClasses(
                    false,
                    pressedMenuItem === "login",
                  )}
                >
                  Log in
                </button>

                <div className="app-auth-mobile-divider border-t-2" />

                <button
                  type="button"
                  onClick={() =>
                    handleMobileNavigation(
                      "register",
                      "/auth/welcome?next=register",
                    )
                  }
                  className={mobileMenuItemClasses(
                    false,
                    pressedMenuItem === "register",
                  )}
                >
                  Register
                </button>
              </>
            )}

            <div className="app-auth-mobile-divider border-t-2" />

            <div
              className={[
                "app-auth-theme-menu-item rounded-lg border transition-all duration-200",
                pressedMenuItem === "theme"
                  ? "border-brand bg-brand-tint text-brand"
                  : "border-transparent",
              ].join(" ")}
              onClickCapture={() => setPressedMenuItem("theme")}
            >
              <ThemeToggle
                menuItem
                onThemeChange={handleMobileThemeClose}
              />
            </div>
          </nav>
        )}
      </header>

      <main
        className={`mx-auto px-4 py-6 ${
          isCreatePage ? "max-w-[1440px]" : "max-w-5xl"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}