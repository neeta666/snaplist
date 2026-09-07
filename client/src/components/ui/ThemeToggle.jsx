import { useTheme } from "../../hooks/useTheme";

function SunIcon() {
  return (
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
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
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
    </svg>
  );
}

export default function ThemeToggle({ menuItem = false, onThemeChange }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (menuItem) {
    return (
      <button
        type="button"
        onClick={() => {
          toggleTheme();

          setTimeout(() => {
            onThemeChange?.();
          }, 0);
        }}
        className="landing-mobile-menu-item flex h-11 w-full items-center gap-3 rounded-lg border border-transparent px-2 text-sm font-medium transition-all duration-200 hover:border-brand hover:bg-brand-tint hover:text-brand focus-visible:border-brand focus-visible:bg-brand-tint focus-visible:text-brand active:border-brand active:bg-brand-tint active:text-brand"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
        <span>Theme</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-ink-muted shadow-sm transition-colors hover:bg-brand-tint hover:text-brand"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
