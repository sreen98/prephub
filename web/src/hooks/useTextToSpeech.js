import { useState, useCallback, useRef, useEffect } from 'react';

const STORAGE_KEY = 'tts-prefs';

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { rate: 1.0 }; }
  catch { return { rate: 1.0 }; }
}

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [rate, setRateState] = useState(loadPrefs().rate);
  const paragraphsRef = useRef([]);
  const utteranceRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const setRate = useCallback((r) => {
    setRateState(r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ rate: r }));
  }, []);

  const speakParagraph = useCallback((index) => {
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
    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        speakParagraph(index + 1);
      }
    };

    utteranceRef.current = utterance;
    setCurrentIndex(index);
    window.speechSynthesis.speak(utterance);
  }, [rate]);

  const speak = useCallback((paragraphs) => {
    window.speechSynthesis.cancel();
    paragraphsRef.current = paragraphs;
    setIsPlaying(true);
    setIsPaused(false);
    // Small delay to let cancel complete
    setTimeout(() => speakParagraph(0), 50);
  }, [speakParagraph]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(-1);
  }, []);

  return { speak, pause, resume, stop, isPlaying, isPaused, currentIndex, rate, setRate };
}
