import { useState, useEffect } from 'react';

export type FontSize = 'small' | 'medium' | 'large';

const SIZES = ['small', 'medium', 'large'] as const;

const SIZE_LABELS: Record<FontSize, string> = { small: 'S', medium: 'M', large: 'L' } as const;

export interface UseReadingPrefsReturn {
  fontSize: FontSize;
  setFontSize: React.Dispatch<React.SetStateAction<FontSize>>;
  cycleFontSize: () => void;
  sizeLabel: string;
}

export function useReadingPrefs(): UseReadingPrefsReturn {
  const [fontSize, setFontSize] = useState<FontSize>(
    (localStorage.getItem('readingFontSize') as FontSize | null) || 'medium'
  );

  useEffect(() => {
    const root = document.documentElement;
    SIZES.forEach(s => root.classList.remove(`font-size-${s}`));
    root.classList.add(`font-size-${fontSize}`);
    localStorage.setItem('readingFontSize', fontSize);
  }, [fontSize]);

  const cycleFontSize = (): void => {
    setFontSize(prev => {
      const idx = SIZES.indexOf(prev);
      return SIZES[(idx + 1) % SIZES.length];
    });
  };

  return { fontSize, setFontSize, cycleFontSize, sizeLabel: SIZE_LABELS[fontSize] };
}
