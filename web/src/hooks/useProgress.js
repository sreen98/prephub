import { useState, useCallback } from 'react';

const STORAGE_KEY = 'guide-progress';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

export function useProgress() {
  const [progress, setProgress] = useState(load);

  const save = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProgress(next);
  }, []);

  const getStatus = useCallback((path) => {
    return progress[path]?.status || 'not-started';
  }, [progress]);

  const markInProgress = useCallback((path) => {
    if (!path) return;
    const current = load();
    if (current[path]?.status === 'completed') return; // don't downgrade
    save({ ...current, [path]: { status: 'in-progress', lastVisited: new Date().toISOString().split('T')[0] } });
  }, [save]);

  const markCompleted = useCallback((path) => {
    if (!path) return;
    const current = load();
    save({ ...current, [path]: { status: 'completed', lastVisited: new Date().toISOString().split('T')[0] } });
  }, [save]);

  const toggleComplete = useCallback((path) => {
    if (!path) return;
    const current = load();
    const isCompleted = current[path]?.status === 'completed';
    save({
      ...current,
      [path]: { status: isCompleted ? 'in-progress' : 'completed', lastVisited: new Date().toISOString().split('T')[0] }
    });
  }, [save]);

  const getCategoryStats = useCallback((items) => {
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

  const getOverallStats = useCallback((allItems) => {
    return getCategoryStats(allItems);
  }, [getCategoryStats]);

  return { getStatus, markInProgress, markCompleted, toggleComplete, getCategoryStats, getOverallStats, progress };
}
