import { useState, useEffect } from 'react';

const SIZES = ['small', 'medium', 'large'];
const SIZE_LABELS = { small: 'S', medium: 'M', large: 'L' };

export function useReadingPrefs() {
  const [fontSize, setFontSize] = useState(
    localStorage.getItem('readingFontSize') || 'medium'
  );

  useEffect(() => {
    const root = document.documentElement;
    SIZES.forEach(s => root.classList.remove(`font-size-${s}`));
    root.classList.add(`font-size-${fontSize}`);
    localStorage.setItem('readingFontSize', fontSize);
  }, [fontSize]);

  const cycleFontSize = () => {
    setFontSize(prev => {
      const idx = SIZES.indexOf(prev);
      return SIZES[(idx + 1) % SIZES.length];
    });
  };

  return { fontSize, setFontSize, cycleFontSize, sizeLabel: SIZE_LABELS[fontSize] };
}
