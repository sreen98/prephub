import { useState, useCallback } from 'react';

const STORAGE_KEY = 'study-stats' as const;
const MILESTONES = [3, 7, 14, 30, 60, 100, 365] as const;

export interface StudyStatsData {
  visitDates: string[];
  totalQuestionsReviewed: number;
  totalGuidesCompleted: number;
  milestonesSeen: number[];
}

export interface StatsSnapshot {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  totalQuestionsReviewed: number;
  totalGuidesCompleted: number;
}

export interface UseStudyStatsReturn {
  recordVisit: () => void;
  recordQuestionReviewed: () => void;
  recordGuideCompleted: () => void;
  getCurrentStreak: () => number;
  getLongestStreak: () => number;
  getStats: () => StatsSnapshot;
  checkMilestone: () => number | null;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function load(): StudyStatsData {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) as string) || {
      visitDates: [],
      totalQuestionsReviewed: 0,
      totalGuidesCompleted: 0,
      milestonesSeen: [],
    };
  } catch {
    return { visitDates: [], totalQuestionsReviewed: 0, totalGuidesCompleted: 0, milestonesSeen: [] };
  }
}

function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort().reverse();
  const t = today();
  // Must include today or yesterday to have a streak
  if (sorted[0] !== t) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (sorted[0] !== yesterday.toISOString().split('T')[0]) return 0;
  }
  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = new Date(sorted[i]);
    const prev = new Date(sorted[i + 1]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function longestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort();
  let max = 1, current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) { current++; max = Math.max(max, current); }
    else current = 1;
  }
  return max;
}

export function useStudyStats(): UseStudyStatsReturn {
  const [stats, setStats] = useState<StudyStatsData>(load);

  const save = useCallback((next: StudyStatsData): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setStats(next);
  }, []);

  const recordVisit = useCallback((): void => {
    const current = load();
    const t = today();
    if (!current.visitDates.includes(t)) {
      save({ ...current, visitDates: [...current.visitDates, t] });
    }
  }, [save]);

  const recordQuestionReviewed = useCallback((): void => {
    const current = load();
    save({ ...current, totalQuestionsReviewed: (current.totalQuestionsReviewed || 0) + 1 });
  }, [save]);

  const recordGuideCompleted = useCallback((): void => {
    const current = load();
    save({ ...current, totalGuidesCompleted: (current.totalGuidesCompleted || 0) + 1 });
  }, [save]);

  const getCurrentStreak = useCallback((): number => calcStreak(stats.visitDates), [stats.visitDates]);
  const getLongestStreak = useCallback((): number => longestStreak(stats.visitDates), [stats.visitDates]);

  const getStats = useCallback((): StatsSnapshot => ({
    currentStreak: calcStreak(stats.visitDates),
    longestStreak: longestStreak(stats.visitDates),
    totalDays: new Set(stats.visitDates).size,
    totalQuestionsReviewed: stats.totalQuestionsReviewed || 0,
    totalGuidesCompleted: stats.totalGuidesCompleted || 0,
  }), [stats]);

  const checkMilestone = useCallback((): number | null => {
    const streak = calcStreak(stats.visitDates);
    const seen = stats.milestonesSeen || [];
    for (const m of MILESTONES) {
      if (streak >= m && !seen.includes(m)) {
        // Mark as seen
        const current = load();
        save({ ...current, milestonesSeen: [...seen, m] });
        return m;
      }
    }
    return null;
  }, [stats, save]);

  return { recordVisit, recordQuestionReviewed, recordGuideCompleted, getCurrentStreak, getLongestStreak, getStats, checkMilestone };
}
