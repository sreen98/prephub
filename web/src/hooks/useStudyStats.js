import { useState, useCallback } from 'react';

const STORAGE_KEY = 'study-stats';
const MILESTONES = [3, 7, 14, 30, 60, 100, 365];

function today() {
  return new Date().toISOString().split('T')[0];
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      visitDates: [],
      totalQuestionsReviewed: 0,
      totalGuidesCompleted: 0,
      milestonesSeen: [],
    };
  } catch {
    return { visitDates: [], totalQuestionsReviewed: 0, totalGuidesCompleted: 0, milestonesSeen: [] };
  }
}

function calcStreak(dates) {
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
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function longestStreak(dates) {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort();
  let max = 1, current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) { current++; max = Math.max(max, current); }
    else current = 1;
  }
  return max;
}

export function useStudyStats() {
  const [stats, setStats] = useState(load);

  const save = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setStats(next);
  }, []);

  const recordVisit = useCallback(() => {
    const current = load();
    const t = today();
    if (!current.visitDates.includes(t)) {
      save({ ...current, visitDates: [...current.visitDates, t] });
    }
  }, [save]);

  const recordQuestionReviewed = useCallback(() => {
    const current = load();
    save({ ...current, totalQuestionsReviewed: (current.totalQuestionsReviewed || 0) + 1 });
  }, [save]);

  const recordGuideCompleted = useCallback(() => {
    const current = load();
    save({ ...current, totalGuidesCompleted: (current.totalGuidesCompleted || 0) + 1 });
  }, [save]);

  const getCurrentStreak = useCallback(() => calcStreak(stats.visitDates), [stats.visitDates]);
  const getLongestStreak = useCallback(() => longestStreak(stats.visitDates), [stats.visitDates]);

  const getStats = useCallback(() => ({
    currentStreak: calcStreak(stats.visitDates),
    longestStreak: longestStreak(stats.visitDates),
    totalDays: new Set(stats.visitDates).size,
    totalQuestionsReviewed: stats.totalQuestionsReviewed || 0,
    totalGuidesCompleted: stats.totalGuidesCompleted || 0,
  }), [stats]);

  const checkMilestone = useCallback(() => {
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
