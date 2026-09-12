import { useState, useCallback } from 'react';
import { getJSON, setJSON } from '../lib/storage';

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

// Minimal structural shape — the hook only needs an id. The consumers below
// are GENERIC over it so filtering preserves the caller's richer Question type
// (see data.ts); without that, callers had to cast the result back, and one of
// those casts hid a real bug when getAllQuestions() became async.
export interface Question {
  id: string;
  [key: string]: unknown;
}

export interface UseSpacedRepetitionReturn {
  recordReview: (questionId: string, quality: number) => void;
  getDueQuestions: <T extends Question>(allQuestions: T[]) => T[];
  getDueCount: <T extends Question>(allQuestions: T[]) => number;
  getDueCountFromTotal: (total: number) => number;
  getQuestionSchedule: (questionId: string) => ScheduleEntry | null;
  schedule: ScheduleMap;
}

function load(): ScheduleMap {
  return getJSON(STORAGE_KEY, {});
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
    setJSON(STORAGE_KEY, next);
    setSchedule(next);
  }, []);

  // quality: 1 = "Study Again", 4 = "Got It"
  const recordReview = useCallback((questionId: string, quality: number): void => {
    const current = load();
    const existing: SM2Item = current[questionId] || {};
    const updated = sm2(existing, quality);
    save({ ...current, [questionId]: updated });
  }, [save]);

  const getDueQuestions = useCallback(<T extends Question>(allQuestions: T[]): T[] => {
    const t = today();
    return allQuestions.filter(q => {
      const entry = schedule[q.id];
      if (!entry) return true; // never reviewed = due
      return entry.nextReview <= t;
    });
  }, [schedule]);

  const getDueCount = useCallback(<T extends Question>(allQuestions: T[]): number => {
    const t = today();
    let count = 0;
    for (const q of allQuestions) {
      const entry = schedule[q.id];
      if (!entry || entry.nextReview <= t) count++;
    }
    return count;
  }, [schedule]);

  /**
   * The same count, from a total instead of the questions themselves.
   *
   * `getDueCount` only reads `q.id`, so the ONLY reason it takes the corpus is
   * to know how many there are. The sidebar badge used that, and pulled every
   * guide — 64 chunks, 1.6 MB — on every route to size one number.
   *
   * "Due" is "never reviewed, or scheduled for today or earlier", so it is
   * simply the total minus the entries scheduled for later.
   *
   * The one inexactness: a schedule entry for a question that no longer exists
   * still counts as not-due, so the badge can under-report after questions are
   * removed. It is bounded by how much content changed, self-corrects as those
   * entries come due, and the Review page itself still computes the exact set
   * from the real corpus it loads anyway.
   */
  const getDueCountFromTotal = useCallback((total: number): number => {
    const t = today();
    let notDue = 0;
    for (const entry of Object.values(schedule)) {
      if (entry.nextReview > t) notDue++;
    }
    return Math.max(0, total - notDue);
  }, [schedule]);

  const getQuestionSchedule = useCallback((questionId: string): ScheduleEntry | null => {
    return schedule[questionId] || null;
  }, [schedule]);

  return { recordReview, getDueQuestions, getDueCount, getDueCountFromTotal, getQuestionSchedule, schedule };
}
