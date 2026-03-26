import { useState, useCallback } from 'react';

const STORAGE_KEY = 'sr-schedule';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// SM-2 algorithm
function sm2(item, quality) {
  let { easeFactor = 2.5, interval = 0, repetitions = 0 } = item;

  if (quality >= 3) {
    // correct response
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    // incorrect — reset
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview: addDays(today(), interval),
    lastReview: today(),
  };
}

export function useSpacedRepetition() {
  const [schedule, setSchedule] = useState(load);

  const save = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSchedule(next);
  }, []);

  // quality: 1 = "Study Again", 4 = "Got It"
  const recordReview = useCallback((questionId, quality) => {
    const current = load();
    const existing = current[questionId] || {};
    const updated = sm2(existing, quality);
    save({ ...current, [questionId]: updated });
  }, [save]);

  const getDueQuestions = useCallback((allQuestions) => {
    const t = today();
    return allQuestions.filter(q => {
      const entry = schedule[q.id];
      if (!entry) return true; // never reviewed = due
      return entry.nextReview <= t;
    });
  }, [schedule]);

  const getDueCount = useCallback((allQuestions) => {
    const t = today();
    let count = 0;
    for (const q of allQuestions) {
      const entry = schedule[q.id];
      if (!entry || entry.nextReview <= t) count++;
    }
    return count;
  }, [schedule]);

  const getQuestionSchedule = useCallback((questionId) => {
    return schedule[questionId] || null;
  }, [schedule]);

  return { recordReview, getDueQuestions, getDueCount, getQuestionSchedule, schedule };
}
