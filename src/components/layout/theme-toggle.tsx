'use client';

import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'futuroute-theme';

type ThemeToggleProps = {
  showLabel?: boolean;
  className?: string;
};

export function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const toggleTheme = () => {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';

    root.dataset.theme = nextTheme;
    localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 text-sm font-extrabold text-app-text transition-colors hover:bg-app-surface-muted ${className}`}
      aria-label="Açık ve koyu tema arasında geçiş yap"
      title="Temayı değiştir"
    >
      <Moon className="theme-toggle__dark size-4" aria-hidden="true" />
      <Sun className="theme-toggle__light size-4" aria-hidden="true" />
      {showLabel && (
        <>
          <span className="theme-toggle__label-dark">Koyu tema</span>
          <span className="theme-toggle__label-light">Açık tema</span>
        </>
      )}
    </button>
  );
}
