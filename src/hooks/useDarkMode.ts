import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export interface UseDarkModeReturn {
  theme: Theme;
  toggleTheme: () => void;
}

export function useDarkMode(): UseDarkModeReturn {
  // Read the class the blocking script in index.html already set, so the first
  // React render agrees with what is on screen. Reading localStorage again
  // would be equivalent, but trusting the DOM keeps the two in lockstep if the
  // resolution logic ever changes.
  const [theme, setTheme] = useState<Theme>(() => {
    if (document.documentElement.classList.contains('dark')) return 'dark';
    try {
      const stored = localStorage.getItem('theme') as Theme | null;
      if (stored) return stored;
    } catch { /* localStorage unavailable */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Clear the inline colour the blocking script set, so CSS owns it from here.
    root.style.removeProperty('background-color');
    try {
      localStorage.setItem('theme', theme);
    } catch { /* localStorage unavailable — theme just won't persist */ }
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}
