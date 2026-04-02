import { useState, useCallback } from 'react';

const STORAGE_KEY = 'guide-progress' as const;

export type ProgressStatus = 'not-started' | 'in-progress' | 'completed';

export interface ProgressEntry {
  status: ProgressStatus;
  lastVisited: string;
}

export interface ProgressMap {
  [path: string]: ProgressEntry;
}

export interface CategoryStats {
  total: number;
  completed: number;
  inProgress: number;
}

export interface ProgressItem {
  path: string;
  [key: string]: unknown;
}

export interface UseProgressReturn {
  getStatus: (path: string) => ProgressStatus;
  markInProgress: (path: string) => void;
  markCompleted: (path: string) => void;
  toggleComplete: (path: string) => void;
  getCategoryStats: (items: ProgressItem[]) => CategoryStats;
  getOverallStats: (allItems: ProgressItem[]) => CategoryStats;
  progress: ProgressMap;
}

function load(): ProgressMap {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) as string) || {}; }
  catch { return {}; }
}

export function useProgress(): UseProgressReturn {
  const [progress, setProgress] = useState<ProgressMap>(load);

  const save = useCallback((next: ProgressMap): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProgress(next);
  }, []);

  const getStatus = useCallback((path: string): ProgressStatus => {
    return progress[path]?.status || 'not-started';
  }, [progress]);

  const markInProgress = useCallback((path: string): void => {
    if (!path) return;
    const current = load();
    if (current[path]?.status === 'completed') return; // don't downgrade
    save({ ...current, [path]: { status: 'in-progress', lastVisited: new Date().toISOString().split('T')[0] } });
  }, [save]);

  const markCompleted = useCallback((path: string): void => {
    if (!path) return;
    const current = load();
    save({ ...current, [path]: { status: 'completed', lastVisited: new Date().toISOString().split('T')[0] } });
  }, [save]);

  const toggleComplete = useCallback((path: string): void => {
    if (!path) return;
    const current = load();
    const isCompleted = current[path]?.status === 'completed';
    save({
      ...current,
      [path]: { status: isCompleted ? 'in-progress' : 'completed', lastVisited: new Date().toISOString().split('T')[0] }
    });
  }, [save]);

  const getCategoryStats = useCallback((items: ProgressItem[]): CategoryStats => {
    if (!items) return { total: 0, completed: 0, inProgress: 0 };
    const total = items.length;
    let completed = 0, inProgress = 0;
    for (const item of items) {
      const s = progress[item.path]?.status;
      if (s === 'completed') completed++;
      else if (s === 'in-progress') inProgress++;
    }
    return { total, completed, inProgress };
  }, [progress]);

  const getOverallStats = useCallback((allItems: ProgressItem[]): CategoryStats => {
    return getCategoryStats(allItems);
  }, [getCategoryStats]);

  return { getStatus, markInProgress, markCompleted, toggleComplete, getCategoryStats, getOverallStats, progress };
}
