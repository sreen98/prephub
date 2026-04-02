import { useState, useCallback } from 'react';

const STORAGE_KEY = 'sr-schedule' as const;

export interface SM2Item {
  easeFactor?: number;
  interval?: number;
  repetitions?: number;
}

export interface ScheduleEntry {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReview: string;
}

export interface ScheduleMap {
  [questionId: string]: ScheduleEntry;
}

export interface Question {
  id: string;
  [key: string]: unknown;
}

export interface UseSpacedRepetitionReturn {
  recordReview: (questionId: string, quality: number) => void;
  getDueQuestions: (allQuestions: Question[]) => Question[];
  getDueCount: (allQuestions: Question[]) => number;
  getQuestionSchedule: (questionId: string) => ScheduleEntry | null;
  schedule: ScheduleMap;
}

function load(): ScheduleMap {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) as string) || {}; }
  catch { return {}; }
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// SM-2 algorithm
function sm2(item: SM2Item, quality: number): ScheduleEntry {
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

export function useSpacedRepetition(): UseSpacedRepetitionReturn {
  const [schedule, setSchedule] = useState<ScheduleMap>(load);

  const save = useCallback((next: ScheduleMap): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSchedule(next);
  }, []);

  // quality: 1 = "Study Again", 4 = "Got It"
  const recordReview = useCallback((questionId: string, quality: number): void => {
    const current = load();
    const existing: SM2Item = current[questionId] || {};
    const updated = sm2(existing, quality);
    save({ ...current, [questionId]: updated });
  }, [save]);

  const getDueQuestions = useCallback((allQuestions: Question[]): Question[] => {
    const t = today();
    return allQuestions.filter(q => {
      const entry = schedule[q.id];
      if (!entry) return true; // never reviewed = due
      return entry.nextReview <= t;
    });
  }, [schedule]);

  const getDueCount = useCallback((allQuestions: Question[]): number => {
    const t = today();
    let count = 0;
    for (const q of allQuestions) {
      const entry = schedule[q.id];
      if (!entry || entry.nextReview <= t) count++;
    }
    return count;
  }, [schedule]);

  const getQuestionSchedule = useCallback((questionId: string): ScheduleEntry | null => {
    return schedule[questionId] || null;
  }, [schedule]);

  return { recordReview, getDueQuestions, getDueCount, getQuestionSchedule, schedule };
}
