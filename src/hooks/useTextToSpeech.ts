import { useState, useCallback, useRef, useEffect } from 'react';

const STORAGE_KEY = 'tts-prefs' as const;

export interface TTSPrefs {
  rate: number;
}

export interface UseTextToSpeechReturn {
  speak: (paragraphs: string[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  currentIndex: number;
  rate: number;
  setRate: (r: number) => void;
}

function loadPrefs(): TTSPrefs {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) as string) || { rate: 1.0 }; }
  catch { return { rate: 1.0 }; }
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [rate, setRateState] = useState<number>(loadPrefs().rate);
  const paragraphsRef = useRef<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const setRate = useCallback((r: number): void => {
    setRateState(r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ rate: r }));
  }, []);

  const speakParagraph = useCallback((index: number): void => {
    if (index >= paragraphsRef.current.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentIndex(-1);
      return;
    }

    const text = paragraphsRef.current[index];
    if (!text.trim()) {
      // Skip empty paragraphs
      speakParagraph(index + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.onend = () => speakParagraph(index + 1);
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      if (e.error !== 'canceled') {
        speakParagraph(index + 1);
      }
    };

    utteranceRef.current = utterance;
    setCurrentIndex(index);
    window.speechSynthesis.speak(utterance);
  }, [rate]);

  const speak = useCallback((paragraphs: string[]): void => {
    window.speechSynthesis.cancel();
    paragraphsRef.current = paragraphs;
    setIsPlaying(true);
    setIsPaused(false);
    // Small delay to let cancel complete
    setTimeout(() => speakParagraph(0), 50);
  }, [speakParagraph]);

  const pause = useCallback((): void => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback((): void => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback((): void => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(-1);
  }, []);

  return { speak, pause, resume, stop, isPlaying, isPaused, currentIndex, rate, setRate };
}
