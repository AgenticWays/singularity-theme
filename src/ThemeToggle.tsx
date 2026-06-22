'use client';
// @singularityfp/theme — ThemeToggle. Persists to localStorage['sfp-theme'],
// sets data-theme on <html>. Pair with noFlashScript in <head>. Adds
// data-testid="theme-toggle".
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const KEY = 'sfp-theme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) as Theme | null;
    const initial: Theme = saved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-testid="theme-toggle"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={
        'inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 ' +
        'font-mono text-xs uppercase tracking-wide text-fg-muted hover:text-fg ' +
        'transition-colors ' + className
      }
    >
      <span aria-hidden>{theme === 'dark' ? '◗' : '◖'}</span>
      {theme === 'dark' ? 'Dark' : 'Light'}
    </button>
  );
}

export default ThemeToggle;
