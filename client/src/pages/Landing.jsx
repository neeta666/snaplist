import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ui/ThemeToggle";
import symbolMark from "../assets/snaplist-symbol.png";
import wordmark from "../assets/snaplist-wordmark.png";
import sofaImage from "../assets/landing-sofa.jpg";

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const [pressedMenuItem, setPressedMenuItem] = useState(null);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 640px)");

    const handleViewportChange = (event) => {
      if (event.matches) {
        setIsMobileMenuOpen(false);
      }
    };

    desktopQuery.addEventListener("change", handleViewportChange);

    return () => {
      desktopQuery.removeEventListener("change", handleViewportChange);
    };
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleMobileNavigation = (item, path) => {
    setPressedMenuItem(item);

    setTimeout(() => {
      setPressedMenuItem(null);
      closeMobileMenu();
      navigate(path);
    }, 120);
  };

  const getRegisterPath = () =>
    window.matchMedia("(max-width: 639px)").matches
      ? "/auth/welcome?next=register"
      : "/register";

  return (
    <div className="min-h-screen bg-surface-muted text-ink">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap');

          .landing-navbar {
            background:
              radial-gradient(circle at 18% 0%, rgba(139, 92, 246, 0.18), transparent 32%),
              radial-gradient(circle at 88% 0%, rgba(236, 72, 153, 0.10), transparent 28%),
              linear-gradient(90deg, #d8c9f0 0%, #cfc4ea 52%, #dfcae8 100%);
          }

          [data-theme="dark"] .landing-navbar {
            background:
              radial-gradient(circle at 18% 0%, rgba(139, 92, 246, 0.16), transparent 32%),
              radial-gradient(circle at 88% 0%, rgba(236, 72, 153, 0.08), transparent 28%),
              linear-gradient(90deg, #1b1733 0%, #1d1838 52%, #19152f 100%);
          }

          .landing-navbar-top {
            position: relative;
            z-index: 1;
            background: linear-gradient(
              100deg,
              #cfc4f7 0%,
              #c2aff2 45%,
              #d9b9e7 72%,
              #ecc5dc 100%
            );
            box-shadow:
              0 8px 24px rgba(124, 58, 237, 0.25),
              0 2px 8px rgba(124, 58, 237, 0.12);
          }

          [data-theme="dark"] .landing-navbar-top {
            background: transparent;
            box-shadow: 
              0 8px 24px rgba(124, 58, 237, 0.24),
              0 2px 8px rgba(124, 58, 237, 0.14);
          }

          .landing-nav-pill {
            border-color: rgba(111, 90, 143, 0.22);
            background: #ffffff;
            color: #3f3158;
            box-shadow: 0 3px 10px rgba(74, 47, 105, 0.12);
          }

          .landing-nav-pill:hover {
            border-color: rgba(118, 80, 168, 0.4);
            background: #ffffff;
            color: #7c3aed;;
            box-shadow: 0 5px 14px rgba(74, 47, 105, 0.18);
          }

          [data-theme="dark"] .landing-nav-pill {
            border-color: rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.75);
          }

          [data-theme="dark"] .landing-nav-pill:hover {
            border-color: rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.08);
            color: #7c3aed;
          }

          .landing-login-button {
            background: #7c3aed;
            color: white;
          }

          .landing-login-button:hover {
            background: #6d28d9;
          }

          [data-theme="dark"] .landing-login-button {
            background: #4c1d95;
            color: white;
          }

          [data-theme="dark"] .landing-login-button:hover {
            background: #7c3aed;
          }

          .landing-mobile-menu-toggle {
            color: #302644;
          }

          [data-theme="dark"] .landing-mobile-menu-toggle {
            color: rgba(255, 255, 255, 0.65);
          }

          .landing-mobile-menu-item {
            color: #302644;
          }

          [data-theme="dark"] .landing-mobile-menu-item {
            color: rgba(255, 255, 255, 0.65);
          }

          .landing-mobile-divider {
            border-color: rgba(48, 38, 68, 0.35);
          }

          [data-theme="dark"] .landing-mobile-divider {
            border-color: rgba(255, 255, 255, 0.45);
          }

          .landing-hero {
            background:
              radial-gradient(circle at 76% 24%, rgba(174, 116, 255, 0.26), transparent 27%),
              radial-gradient(circle at 93% 48%, rgba(236, 72, 153, 0.10), transparent 20%),
              radial-gradient(circle at 9% 58%, rgba(139, 92, 246, 0.07), transparent 24%),
              linear-gradient(180deg, #fbfaff 0%, #ffffff 74%, #fdfcff 100%);
          }

          [data-theme="dark"] .landing-hero {
            background:
              radial-gradient(circle at 76% 27%, rgba(112, 60, 255, 0.24), transparent 29%),
              radial-gradient(circle at 91% 47%, rgba(236, 72, 153, 0.09), transparent 21%),
              radial-gradient(circle at 8% 51%, rgba(76, 29, 149, 0.13), transparent 25%),
              linear-gradient(180deg, #070b17 0%, #07101e 58%, #06101d 100%);
          }

          .hero-handwriting {
            font-family: "Caveat", cursive;
          }

          .hero-listing-card {
            background: rgba(255, 255, 255, 0.94);
            box-shadow:
              0 28px 60px rgba(72, 36, 133, 0.18),
              0 0 45px rgba(168, 85, 247, 0.13);
          }

          [data-theme="dark"] .hero-listing-card {
            background: linear-gradient(
              160deg,
              rgba(17, 24, 39, 0.97),
              rgba(8, 15, 29, 0.98)
            );
            box-shadow:
              0 32px 70px rgba(0, 0, 0, 0.48),
              0 0 55px rgba(124, 58, 237, 0.20);
          }

          .hero-photo-frame {
            box-shadow:
              0 24px 50px rgba(67, 36, 115, 0.16),
              0 0 0 1px rgba(139, 92, 246, 0.16);
          }

          [data-theme="dark"] .hero-photo-frame {
            box-shadow:
              0 26px 55px rgba(0, 0, 0, 0.42),
              0 0 30px rgba(139, 92, 246, 0.15);
          }
        `}
      </style>

      <header className="landing-navbar sticky top-0 z-50">
        <div className="landing-navbar-top">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-2"
            >
              <img src={symbolMark} alt="" className="h-10 w-10" />
              <img src={wordmark} alt="SnapList" className="h-11" />
            </Link>

            <nav className="hidden items-center gap-4 sm:flex">
              <a
                href="#features"
                className="landing-nav-pill rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                className="landing-nav-pill rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
              >
                How it works
              </a>

              <a
                href="#faq"
                className="landing-nav-pill rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
              >
                FAQ
              </a>
            </nav>

            <div className="hidden items-center gap-3 sm:flex">
              <ThemeToggle />

              <Link
                to="/login"
                className="landing-login-button rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="inline-flex rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-brand)" }}
              >
                Get started
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="landing-mobile-menu-toggle inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/35 hover:text-brand sm:hidden"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg
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

        {isMobileMenuOpen && (
          <nav className="landing-navbar border-t border-brand/15 px-6 py-2 sm:hidden">
            <a
              href="#features"
              onClick={closeMobileMenu}
              className="landing-mobile-menu-item flex h-11 w-full items-center rounded-lg px-2 text-sm font-medium transition-colors hover:bg-white/35 hover:text-brand"
            >
              Features
            </a>

            <div className="landing-mobile-divider border-t-2" />

            <a
              href="#how-it-works"
              onClick={closeMobileMenu}
              className="landing-mobile-menu-item flex h-11 w-full items-center rounded-lg px-2 text-sm font-medium transition-colors hover:bg-white/35 hover:text-brand"
            >
              How it works
            </a>

            <div className="landing-mobile-divider border-t-2" />

            <a
              href="#faq"
              onClick={closeMobileMenu}
              className="landing-mobile-menu-item flex h-11 w-full items-center rounded-lg px-2 text-sm font-medium transition-colors hover:bg-white/35 hover:text-brand"
            >
              FAQ
            </a>

            <div className="landing-mobile-divider my-1 border-t-2" />

            <button
              type="button"
              onClick={() =>
                handleMobileNavigation("login", "/auth/welcome?next=login")
              }
              className={[
                "flex h-11 w-full items-center gap-3 rounded-lg border px-2 text-sm font-medium transition-all duration-200",
                pressedMenuItem === "login"
                  ? "border-brand bg-brand-tint text-brand"
                  : "border-transparent landing-mobile-menu-item hover:border-brand hover:bg-white/35 hover:text-brand",
              ].join(" ")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="m10 17 5-5-5-5" />
                <path d="M15 12H3" />
              </svg>

              <span>Log in</span>
            </button>

            <div className="landing-mobile-divider border-t-2" />

            <button
              type="button"
              onClick={() =>
                handleMobileNavigation(
                  "register",
                  "/auth/welcome?next=register",
                )
              }
              className={[
                "flex h-11 w-full items-center gap-3 rounded-lg border px-2 text-sm font-medium transition-all duration-200",
                pressedMenuItem === "register"
                  ? "border-brand bg-brand-tint text-brand"
                  : "border-transparent landing-mobile-menu-item hover:border-brand hover:bg-white/35 hover:text-brand",
              ].join(" ")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="9" cy="8" r="4" />
                <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
                <path d="M19 8v6M16 11h6" />
              </svg>

              <span>Register</span>
            </button>

            <div className="landing-mobile-divider border-t-2" />

            <ThemeToggle menuItem onThemeChange={closeMobileMenu} />
          </nav>
        )}
      </header>

      <main>
        <section className="landing-hero relative overflow-hidden">
          <div className="pointer-events-none absolute left-[42%] top-10 hidden text-brand/60 lg:block">
            <span className="text-xl">✦</span>
          </div>

          <div className="pointer-events-none absolute right-[11%] top-14 hidden text-brand/50 lg:block">
            <span className="text-sm">✦</span>
          </div>

          <div className="pointer-events-none absolute right-[3%] top-[44%] hidden text-pink-400 lg:block">
            <span className="text-xl">✦</span>
          </div>

          <div className="mx-auto max-w-7xl px-6 pb-16 pt-14 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
            <div className="grid items-center gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:gap-10">
              <div className="relative z-10 mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
                <h1 className="text-[2.65rem] font-extrabold leading-[1.03] tracking-tight text-ink sm:text-5xl lg:text-[3.75rem]">
                  Turn a photo
                  <br />
                  into a perfect
                  <br />
                  listing{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: "var(--gradient-brand)",
                    }}
                  >
                    in seconds
                  </span>
                  <span className="ml-2 inline-flex translate-y-[-0.15em] items-start gap-1 align-middle">
                    <span className="text-base text-pink-500 sm:text-lg lg:text-xl">
                      ✦
                    </span>
                    <span className="mt-[-0.15rem] text-[0.55rem] text-brand sm:text-[0.65rem] lg:text-xs">
                      ✦
                    </span>
                  </span>
                </h1>

                <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-ink-muted sm:text-lg lg:mx-0">
                  SnapList uses AI to generate titles, descriptions, categories
                  and price suggestions so you can sell faster and smarter.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link
                    to={getRegisterPath()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    Create your first listing
                    <span aria-hidden="true">✦</span>
                  </Link>

                  <a
                    href="#features"
                    className="inline-flex items-center justify-center rounded-lg border border-brand/40 bg-surface/70 px-6 py-3.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-tint"
                  >
                    Explore features
                  </a>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-2 text-[11px] text-ink-muted sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:gap-y-4 sm:text-sm lg:justify-start">
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand sm:h-9 sm:w-9">
                      ✦
                    </span>

                    <span className="whitespace-nowrap font-medium">
                      AI Powered
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand sm:h-9 sm:w-9">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="8" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                    </span>

                    <span className="whitespace-nowrap font-medium">
                      Saves Time
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand sm:h-9 sm:w-9">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        aria-hidden="true"
                      >
                        <path d="M5 16l5-5 4 4 5-7" />
                        <path d="M15 8h4v4" />
                      </svg>
                    </span>

                    <span className="whitespace-nowrap font-medium">
                      Sell Faster
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[720px]">
                <div className="relative hidden min-h-[570px] sm:block">
                  <div className="hero-handwriting absolute left-[12%] top-0 z-30 -rotate-6 text-2xl leading-6 text-ink">
                    Just upload
                    <br />
                    <span className="pl-5">a photo</span>
                    <svg
                      viewBox="0 0 90 60"
                      fill="none"
                      className="ml-12 -mt-1 h-14 w-20"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 4C38 3 60 18 66 46"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M58 39L66 47L72 37"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="absolute left-[8%] top-[118px] z-10 w-[39%] max-w-[280px]">
                    <div className="hero-photo-frame rotate-[-3deg] overflow-hidden rounded-[22px] border-4 border-white bg-white p-1.5">
                      <div className="aspect-[0.95/1] overflow-hidden rounded-[16px]">
                        <img
                          src={sofaImage}
                          alt="Cream two-seater sofa"
                          className="h-full w-full scale-[1.22] object-cover object-[center_67%]"
                        />
                      </div>
                    </div>
                  </div>

                  <svg
                    viewBox="0 0 120 30"
                    fill="none"
                    className="absolute left-[47%] top-[278px] z-20 w-[72px] text-brand"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 16C34 12 55 14 93 16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="5 6"
                    />
                    <path
                      d="M87 9L98 16L87 23"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <div className="hero-listing-card absolute right-[2%] top-[84px] z-20 w-[40%] max-w-[288px] rotate-[4deg] rounded-[24px] border border-brand/50 p-5">
                    <div
                      className="inline-flex rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      AI Generated ✦
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-ink">
                      Modern 2 Seater Sofa
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-ink-muted">
                        Home & Living
                      </span>

                      <span className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-ink-muted">
                        Used - Good
                      </span>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-ink-muted">
                      Comfortable and stylish 2 seater sofa in excellent
                      condition. Soft fabric with sturdy wooden legs. Perfect
                      for any living room.
                    </p>

                    <div className="mt-5">
                      <p className="text-xs font-medium text-ink-muted">
                        Estimated price range
                      </p>

                      <p
                        className="mt-1 text-xl font-bold"
                        style={{
                          backgroundImage: "var(--gradient-brand)",
                          WebkitBackgroundClip: "text",
                          color: "transparent",
                        }}
                      >
                        ₹8,000 – ₹10,000
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </div>

                    <div
                      className="mt-4 rounded-lg px-4 py-3 text-center text-sm font-semibold text-white shadow-md"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      Review &amp; save listing
                    </div>
                  </div>

                  <div className="hero-handwriting absolute bottom-[8px] left-[36%] z-30 -rotate-6 text-2xl leading-6 text-ink">
                    AI creates
                    <br />
                    <span className="pl-2">your listing</span>
                    <svg
                      viewBox="0 0 90 60"
                      fill="none"
                      className="absolute -right-20 -top-4 h-14 w-20 rotate-[12deg]"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 50C32 53 56 34 67 12"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M59 17L67 10L70 21"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <span className="absolute left-[52%] top-[34px] text-2xl text-brand">
                    ✦
                  </span>

                  <span className="absolute right-[7%] top-[10px] text-sm text-pink-400">
                    ✦
                  </span>

                  <span className="absolute right-0 top-[44%] text-xl text-brand">
                    ✦
                  </span>

                  <span className="absolute left-[3%] top-[49%] text-base text-pink-500">
                    ✦
                  </span>
                </div>

                <div className="relative mt-12 sm:hidden">
                  <div className="hero-handwriting relative z-20 mx-auto mb-1 w-fit -translate-x-14 -rotate-3 text-center text-[1.65rem] leading-6 text-ink">
                    Just upload
                    <br />
                    <span className="pl-4">a photo</span>
                    <svg
                      viewBox="0 0 70 55"
                      fill="none"
                      className="absolute left-[95%] top-[35px] h-12 w-16"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 4C20 8 38 17 50 40"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M42 35L51 42L54 31"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="relative mx-auto mt-7 w-[68%] max-w-[245px]">
                    <span className="absolute -left-6 -top-4 text-xl text-pink-500">
                      ✦
                    </span>

                    <span className="absolute -right-7 top-[22%] text-base text-brand">
                      ✦
                    </span>

                    <div className="hero-photo-frame rotate-[-3deg] overflow-hidden rounded-[22px] border-4 border-white bg-white p-1.5">
                      <div className="aspect-[1/0.92] overflow-hidden rounded-[16px]">
                        <img
                          src={sofaImage}
                          alt="Cream two-seater sofa"
                          className="h-full w-full scale-[1.26] object-cover object-[center_70%]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative mx-auto my-4 flex h-14 w-12 items-center justify-center text-brand">
                    <svg
                      viewBox="0 0 40 60"
                      fill="none"
                      className="h-14 w-10"
                      aria-hidden="true"
                    >
                      <path
                        d="M20 3C19 19 20 29 20 48"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="4 5"
                      />
                      <path
                        d="M13 42L20 50L27 42"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="hero-listing-card relative mx-auto w-[84%] max-w-[304px] rotate-[1deg] rounded-[24px] border border-brand/50 p-5">
                    <div
                      className="inline-flex rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      AI Generated ✦
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-ink">
                      Modern 2 Seater Sofa
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-ink-muted">
                        Home & Living
                      </span>

                      <span className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-ink-muted">
                        Used - Good
                      </span>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-ink-muted">
                      Comfortable and stylish 2 seater sofa in excellent
                      condition. Soft fabric with sturdy wooden legs. Perfect
                      for any living room.
                    </p>

                    <div className="mt-5">
                      <p className="text-xs font-medium text-ink-muted">
                        Estimated price range
                      </p>

                      <p
                        className="mt-1 text-xl font-bold"
                        style={{
                          backgroundImage: "var(--gradient-brand)",
                          WebkitBackgroundClip: "text",
                          color: "transparent",
                        }}
                      >
                        ₹8,000 – ₹10,000
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </div>

                    <div
                      className="mt-4 rounded-lg px-4 py-3 text-center text-sm font-semibold text-white shadow-md"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      Review &amp; save listing
                    </div>
                  </div>

                  <div className="hero-handwriting relative z-20 mx-auto mt-5 w-fit -rotate-3 text-center text-[1.65rem] leading-6 text-ink">
                    AI creates
                    <br />
                    <span className="pl-2">your listing</span>
                    <svg
                      viewBox="0 0 72 50"
                      fill="none"
                      className="absolute -right-14 -top-5 h-12 w-14 rotate-[-18deg]"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 42C28 43 48 28 58 8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M50 13L59 7L61 18"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-4 text-center text-xs font-medium text-ink-muted sm:mt-16 sm:text-sm">
              <div className="h-px flex-1 bg-border" />
              <span>Smart listing creation, powered by AI</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 sm:gap-6">
              <div className="flex items-center justify-center gap-2.5 text-center text-xs text-ink-muted sm:text-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 shrink-0 text-brand"
                  aria-hidden="true"
                >
                  <path d="M20 12v8H4v-8" />
                  <path d="M2 7h20v5H2z" />
                  <path d="M12 7v13" />
                  <path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C10.5 2 12 7 12 7Z" />
                  <path d="M12 7h4.5a2.5 2.5 0 1 0 0-5C13.5 2 12 7 12 7Z" />
                </svg>

                <span>100% Free to start</span>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-muted sm:gap-2.5 sm:text-sm">
                <svg
                  viewBox="0 0 28 24"
                  fill="none"
                  className="h-5 w-6 shrink-0 text-brand"
                  aria-hidden="true"
                >
                  <rect
                    x="1.5"
                    y="3.5"
                    width="20"
                    height="15"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M2 8H21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <rect
                    x="4.5"
                    y="11"
                    width="5"
                    height="3.5"
                    rx="0.8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="21" cy="17" r="5.5" fill="var(--color-brand)" />
                  <path
                    d="M18.5 17L20.2 18.7L23.7 15.2"
                    stroke="white"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span>No credit card required</span>
              </div>

              <div className="flex items-center justify-center gap-2.5 text-center text-xs text-ink-muted sm:text-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 shrink-0 text-brand"
                  aria-hidden="true"
                >
                  <rect x="5" y="10" width="14" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v3" />
                </svg>

                <span>Secure &amp; private</span>
              </div>

              <div className="flex items-center justify-center gap-2.5 text-center text-xs text-ink-muted sm:text-sm">
                <svg
                  viewBox="0 0 30 20"
                  className="h-4 w-6 shrink-0 overflow-hidden rounded-[2px] shadow-sm"
                  aria-label="India flag"
                  role="img"
                >
                  <rect width="30" height="6.67" y="0" fill="#FF9933" />
                  <rect width="30" height="6.67" y="6.67" fill="#FFFFFF" />
                  <rect width="30" height="6.66" y="13.34" fill="#138808" />
                  <circle
                    cx="15"
                    cy="10"
                    r="2.4"
                    fill="none"
                    stroke="#000080"
                    strokeWidth="0.6"
                  />
                  <circle cx="15" cy="10" r="0.45" fill="#000080" />
                  <path
                    d="M15 7.6V12.4M12.6 10H17.4M13.3 8.3L16.7 11.7M16.7 8.3L13.3 11.7"
                    stroke="#000080"
                    strokeWidth="0.35"
                  />
                </svg>

                <span>Built for India</span>
              </div>
            </div>

            {/* Features */}
            <section id="features" className="mt-14 scroll-mt-28 sm:mt-16">
              <div className="rounded-2xl border border-border bg-surface/60 px-5 py-8 shadow-sm sm:px-8 sm:py-9">
                <h2 className="text-center text-xl font-bold text-ink sm:text-2xl">
                  Everything you need to sell with confidence
                </h2>

                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
                  <div className="flex flex-col items-center px-4 text-center lg:border-r lg:border-border">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7"
                        aria-hidden="true"
                      >
                        <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" />
                        <path d="M18.5 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
                        <path d="M5 14l1.1 2.9L9 18l-2.9 1.1L5 22l-1.1-2.9L1 18l2.9-1.1L5 14Z" />
                      </svg>
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-ink">
                      AI Listing Generation
                    </h3>

                    <p className="mt-2 max-w-[190px] text-xs leading-5 text-ink-muted">
                      Get titles, descriptions, categories and price range
                      suggestions in seconds.
                    </p>
                  </div>

                  <div className="flex flex-col items-center px-4 text-center lg:border-r lg:border-border">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7"
                        aria-hidden="true"
                      >
                        <path d="M12 16V4" />
                        <path d="m8 8 4-4 4 4" />
                        <path d="M20 15.5A4.5 4.5 0 0 1 15.5 20h-7A4.5 4.5 0 0 1 4 15.5" />
                      </svg>
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-ink">
                      Single Photo Upload
                    </h3>

                    <p className="mt-2 max-w-[190px] text-xs leading-5 text-ink-muted">
                      Upload one clear photo and let AI understand the product
                      you want to sell.
                    </p>
                  </div>

                  <div className="flex flex-col items-center px-4 text-center lg:border-r lg:border-border">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7"
                        aria-hidden="true"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-ink">
                      Review &amp; Edit
                    </h3>

                    <p className="mt-2 max-w-[190px] text-xs leading-5 text-ink-muted">
                      Review AI suggestions and edit everything before saving
                      your listing.
                    </p>
                  </div>

                  <div className="flex flex-col items-center px-4 text-center lg:border-r lg:border-border">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7"
                        aria-hidden="true"
                      >
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        <path d="M8 8h8" />
                        <path d="M8 12h5" />
                        <path d="M8 16h7" />
                      </svg>
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-ink">
                      Manage Easily
                    </h3>

                    <p className="mt-2 max-w-[190px] text-xs leading-5 text-ink-muted">
                      Keep track of your listings with simple draft, active and
                      sold statuses.
                    </p>
                  </div>

                  <div className="flex flex-col items-center px-4 text-center sm:col-span-2 lg:col-span-1">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7"
                        aria-hidden="true"
                      >
                        <circle cx="11" cy="11" r="6" />
                        <path d="m16 16 4 4" />
                        <path d="M8 11h6" />
                      </svg>
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-ink">
                      Search &amp; Filter
                    </h3>

                    <p className="mt-2 max-w-[190px] text-xs leading-5 text-ink-muted">
                      Quickly find listings and narrow them down using useful
                      filters.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* How it works */}
            <section
              id="how-it-works"
              className="mt-14 scroll-mt-28 pb-4 sm:mt-16"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold text-ink sm:text-2xl">
                  How SnapList works
                </h2>

                <div className="mt-2 flex items-center justify-center gap-1 text-brand">
                  <span className="h-0.5 w-8 rounded-full bg-brand" />
                  <span className="text-xs">✦</span>
                </div>
              </div>

              <div className="relative mt-9 grid gap-10 sm:mt-10 lg:grid-cols-3 lg:gap-14">
                <svg
                  viewBox="0 0 300 24"
                  fill="none"
                  className="pointer-events-none absolute left-[27%] top-10 hidden w-[20%] text-brand/50 lg:block"
                  aria-hidden="true"
                >
                  <path
                    d="M3 12H278"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="6 7"
                  />
                  <path
                    d="M269 5L279 12L269 19"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <svg
                  viewBox="0 0 300 24"
                  fill="none"
                  className="pointer-events-none absolute right-[27%] top-10 hidden w-[20%] text-brand/50 lg:block"
                  aria-hidden="true"
                >
                  <path
                    d="M3 12H278"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="6 7"
                  />
                  <path
                    d="M269 5L279 12L269 19"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div className="relative flex flex-col items-center text-center">
                  <span className="absolute -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-sm">
                    1
                  </span>

                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-brand/30 bg-brand-tint text-brand">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-9 w-9"
                      aria-hidden="true"
                    >
                      <rect x="3" y="6" width="18" height="14" rx="2" />
                      <path d="M8 6l1.5-2h5L16 6" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-ink">
                    Upload a photo
                  </h3>

                  <p className="mt-2 max-w-[220px] text-xs leading-5 text-ink-muted">
                    Add a clear photo of the product you want to sell.
                  </p>
                </div>

                <div className="relative flex flex-col items-center text-center">
                  <span className="absolute -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-sm">
                    2
                  </span>

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-brand/30 bg-brand-tint text-brand">
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      className="h-10 w-10"
                      aria-hidden="true"
                    >
                      {/* Wand */}
                      <path
                        d="M13.5 35.5L30.5 18.5L34 22L17 39L11.5 40.5L13.5 35.5Z"
                        fill="currentColor"
                      />

                      {/* Large sparkle */}
                      <path
                        d="M35 7.5C35.6 11.2 37.8 13.4 41.5 14C37.8 14.6 35.6 16.8 35 20.5C34.4 16.8 32.2 14.6 28.5 14C32.2 13.4 34.4 11.2 35 7.5Z"
                        fill="currentColor"
                      />

                      {/* Medium sparkle */}
                      <path
                        d="M24 8C24.4 10.4 25.6 11.6 28 12C25.6 12.4 24.4 13.6 24 16C23.6 13.6 22.4 12.4 20 12C22.4 11.6 23.6 10.4 24 8Z"
                        fill="currentColor"
                      />

                      {/* Small sparkle */}
                      <path
                        d="M38 25C38.3 26.8 39.2 27.7 41 28C39.2 28.3 38.3 29.2 38 31C37.7 29.2 36.8 28.3 35 28C36.8 27.7 37.7 26.8 38 25Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-ink">
                    AI generates details
                  </h3>

                  <p className="mt-2 max-w-[240px] text-xs leading-5 text-ink-muted">
                    Our AI creates a compelling title, description, category and
                    price range.
                  </p>
                </div>

                <div className="relative flex flex-col items-center text-center">
                  <span className="absolute -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-sm">
                    3
                  </span>

                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-brand/30 bg-brand-tint text-brand">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-9 w-9"
                      aria-hidden="true"
                    >
                      <rect x="5" y="3" width="14" height="18" rx="2" />
                      <path d="m8 8 1.5 1.5L12 7" />
                      <path d="M13 9h3" />
                      <path d="m8 14 1.5 1.5L12 13" />
                      <path d="M13 15h3" />
                    </svg>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-ink">
                    Review &amp; publish
                  </h3>

                  <p className="mt-2 max-w-[220px] text-xs leading-5 text-ink-muted">
                    Edit if needed and save your listing when everything looks
                    right.
                  </p>
                </div>
              </div>
            </section>

            {/* Product value strip */}
            <section className="mt-12 sm:mt-14">
              <div className="rounded-2xl bg-gradient-to-r from-brand via-purple-400 to-pink-500 p-[1px] shadow-sm">
                <div className="grid overflow-hidden rounded-[15px] bg-[#f3efff] sm:grid-cols-2 dark:bg-surface/95 lg:grid-cols-4">
                  <div className="flex items-center gap-4 border-b border-border/70 px-5 py-5 sm:border-r lg:border-b-0 lg:px-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
                      <span className="text-2xl font-semibold">₹</span>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-ink">₹ INR</p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        India-ready pricing
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-b border-border/70 px-5 py-5 lg:border-b-0 lg:border-r lg:px-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                        aria-hidden="true"
                      >
                        <rect x="5" y="3" width="14" height="18" rx="2" />
                        <path d="M9 8h6" />
                        <path d="M9 12h6" />
                        <path d="M9 16h4" />
                      </svg>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-ink">3 Statuses</p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        Draft · Active · Sold
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-b border-border/70 px-5 py-5 sm:border-b-0 sm:border-r lg:px-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
                      <svg
                        viewBox="0 0 48 48"
                        fill="none"
                        className="h-7 w-7"
                        aria-hidden="true"
                      >
                        <path
                          d="M13.5 35.5L30.5 18.5L34 22L17 39L11.5 40.5L13.5 35.5Z"
                          fill="currentColor"
                        />
                        <path
                          d="M35 7.5C35.6 11.2 37.8 13.4 41.5 14C37.8 14.6 35.6 16.8 35 20.5C34.4 16.8 32.2 14.6 28.5 14C32.2 13.4 34.4 11.2 35 7.5Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-ink">AI + You</p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        Generated, then editable
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 px-5 py-5 lg:px-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                        aria-hidden="true"
                      >
                        <rect x="5" y="10" width="14" height="11" rx="2" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                        <path d="M12 14v3" />
                      </svg>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-ink">Private</p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        Your listings, your account
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mt-14 scroll-mt-28 sm:mt-16">
              <div className="text-center">
                <h2 className="text-xl font-bold text-ink sm:text-2xl">
                  Frequently asked questions
                </h2>

                <div className="mt-2 flex items-center justify-center gap-1 text-brand">
                  <span className="h-0.5 w-8 rounded-full bg-brand" />
                  <span className="text-xs">✦</span>
                </div>
              </div>

              <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-sm sm:mt-9">
                <details
                  name="snaplist-faq"
                  className="group border-b border-border px-5 sm:px-6"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-ink sm:text-base [&::-webkit-details-marker]:hidden">
                    <span>What does SnapList generate for me?</span>

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand transition-transform duration-200 group-open:rotate-45">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>

                  <p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-ink-muted">
                    SnapList generates a title, description, category and
                    suggested price range based on the product information and
                    photo you provide.
                  </p>
                </details>

                <details
                  name="snaplist-faq"
                  className="group border-b border-border px-5 sm:px-6"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-ink sm:text-base [&::-webkit-details-marker]:hidden">
                    <span>Can I edit the AI-generated listing?</span>

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand transition-transform duration-200 group-open:rotate-45">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>

                  <p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-ink-muted">
                    Yes. You can review and edit the generated details before
                    saving your listing.
                  </p>
                </details>

                <details
                  name="snaplist-faq"
                  className="group border-b border-border px-5 sm:px-6"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-ink sm:text-base [&::-webkit-details-marker]:hidden">
                    <span>
                      Does SnapList post my listing directly to marketplaces?
                    </span>

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand transition-transform duration-200 group-open:rotate-45">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>

                  <p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-ink-muted">
                    No. SnapList helps you create and manage your listings, but
                    it does not automatically publish them to external
                    marketplaces.
                  </p>
                </details>

                <details
                  name="snaplist-faq"
                  className="group border-b border-border px-5 sm:px-6"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-ink sm:text-base [&::-webkit-details-marker]:hidden">
                    <span>What happens to my listings after I save them?</span>

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand transition-transform duration-200 group-open:rotate-45">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>

                  <p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-ink-muted">
                    You can keep listings as Draft, mark them Active or Sold,
                    and manage your saved listings from your account.
                  </p>
                </details>

                <details name="snaplist-faq" className="group px-5 sm:px-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-ink sm:text-base [&::-webkit-details-marker]:hidden">
                    <span>Is SnapList free to use?</span>

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand transition-transform duration-200 group-open:rotate-45">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>

                  <p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-ink-muted">
                    SnapList is currently free to use and does not require a
                    credit card.
                  </p>
                </details>
              </div>
            </section>
            {/* Final CTA */}
            <section className="mt-14 sm:mt-16">
              <div className="rounded-2xl bg-gradient-to-r from-brand via-purple-400 to-pink-500 p-[1px] shadow-sm">
                <div className="flex flex-col items-center gap-6 rounded-[15px] bg-[#f3efff] px-6 py-7 text-center dark:bg-surface/95 sm:px-8 sm:py-8 lg:flex-row lg:justify-between lg:text-left">
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:text-left">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-7 w-7"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 2.5C12.7 7.2 15.3 9.8 20 10.5C15.3 11.2 12.7 13.8 12 18.5C11.3 13.8 8.7 11.2 4 10.5C8.7 9.8 11.3 7.2 12 2.5Z"
                          fill="currentColor"
                        />
                        <path
                          d="M19 15C19.3 17 20.5 18.2 22.5 18.5C20.5 18.8 19.3 20 19 22C18.7 20 17.5 18.8 15.5 18.5C17.5 18.2 18.7 17 19 15Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-ink sm:text-2xl">
                        Ready to create your first listing?
                      </h2>

                      <p className="mt-1.5 text-sm leading-6 text-ink-muted">
                        Turn your product photo into a polished listing in just
                        a few steps.
                      </p>
                    </div>
                  </div>

                  <Link
                    to={getRegisterPath()}
                    className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    Get started for free
                    <span aria-hidden="true">✦</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#2a2445] bg-[#17132d] text-white">
        <div className="mx-auto max-w-7xl px-6 py-9 lg:px-8">
          <div className="flex flex-col items-center gap-9 text-center sm:grid sm:grid-cols-3 sm:items-start sm:text-left">
            <div className="max-w-sm">
              <Link to="/" className="inline-flex items-center gap-2">
                <img src={symbolMark} alt="" className="h-9 w-9" />
                <img src={wordmark} alt="SnapList" className="h-10" />
              </Link>

              <p className="mt-3 text-sm leading-6 text-white/65">
                AI-powered listing generator that helps you sell faster and
                smarter.
              </p>

              <div
                className="mt-5 flex items-center justify-center gap-3 sm:justify-start"
                aria-label="Social media"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-4.5 w-4.5"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4.5 w-4.5"
                    aria-hidden="true"
                  >
                    <path d="M13.7 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.1H8V13h2.6v8h3.1Z" />
                  </svg>
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M18.9 3H22l-6.8 7.8L23 21h-6.1l-4.8-6.3L6.6 21H3.5l7.1-8.1L3.1 3h6.2l4.3 5.7L18.9 3Zm-1.1 16.2h1.7L8.4 4.7H6.6l11.2 14.5Z" />
                  </svg>
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M5.3 7.8H2.1V21h3.2V7.8ZM3.7 2.2A1.9 1.9 0 1 0 3.7 6a1.9 1.9 0 0 0 0-3.8ZM21.9 13.4c0-4-2.1-5.9-5-5.9-2.3 0-3.3 1.3-3.9 2.2V7.8H9.8V21H13v-6.5c0-1.7.3-3.4 2.5-3.4s2.2 2 2.2 3.5V21h3.2v-7.6Z" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="sm:justify-self-center sm:pt-1">
              <p className="text-sm font-semibold text-white">Explore</p>

              <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/65 sm:flex-col sm:items-start sm:gap-3">
                <a
                  href="#features"
                  className="transition-colors hover:text-white"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="transition-colors hover:text-white"
                >
                  How it works
                </a>
                <a href="#faq" className="transition-colors hover:text-white">
                  FAQ
                </a>
              </nav>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white/65 sm:justify-self-end">
              Made with 💜 in India
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-white/60">
            <p>© 2026 SnapList.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
