import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export interface UseDarkModeReturn {
  theme: Theme;
  toggleTheme: () => void;
}

export function useDarkMode(): UseDarkModeReturn {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('theme') as Theme | null) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}
