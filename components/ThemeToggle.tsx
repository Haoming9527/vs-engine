"use client";

import { useState, useEffect } from "react";

type Theme = "dark" | "light";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const saved = window.localStorage.getItem("vs-engine-theme");
  if (saved === "light" || saved === "dark") return saved;

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("vs-engine-theme", theme);
}
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(getPreferredTheme());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-md border border-white/10" />
    );
  }

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      onClick={() => {
        const newTheme = nextTheme;
        setTheme(newTheme);
        applyTheme(newTheme);
      }}
      className="theme-toggle inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-zinc-300 transition hover:border-white/25 hover:text-white"
      title={`Switch to ${nextTheme} mode`}
    >
      {theme === "dark" ? (
        <SunIcon />
      ) : (
        <MoonIcon />
      )}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
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
      className="h-4 w-4"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M20.4 13.6A7.8 7.8 0 0 1 10.4 3.6 8.2 8.2 0 1 0 20.4 13.6Z" />
    </svg>
  );
}
