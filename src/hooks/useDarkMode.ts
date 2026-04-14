import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'lifecare-theme';

function getInitialTheme(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return true; // default to dark if localStorage unavailable
  }
}

function applyTheme(dark: boolean): void {
  const html = document.documentElement;
  if (dark) {
    html.classList.add('dark');
    html.classList.remove('light');
  } else {
    html.classList.add('light');
    html.classList.remove('dark');
  }
  try {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  } catch {
    // ignore write errors
  }
}

export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(getInitialTheme);

  // Apply on mount and whenever `dark` changes
  useEffect(() => {
    applyTheme(dark);
  }, [dark]);

  // Listen for system preference changes (e.g. OS switches theme)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Only follow system if the user hasn't made an explicit choice
      if (!stored) {
        setDark(e.matches);
      }
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const toggle = () => setDark((prev) => !prev);

  const setTheme = (theme: Theme) => setDark(theme === 'dark');

  return { dark, toggle, setTheme };
}