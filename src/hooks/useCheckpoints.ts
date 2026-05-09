import { useState, useCallback } from 'react';

const STORAGE_KEY = 'checkpoints' as const;

export interface Checkpoint {
  headingId: string;
  headingText: string;
  guideName: string;
  createdAt: string;
}

export type CheckpointsMap = Record<string, Checkpoint>;

export interface UseCheckpointsReturn {
  checkpoints: CheckpointsMap;
  getCheckpoint: (guidePath: string) => Checkpoint | null;
  setCheckpoint: (guidePath: string, data: Omit<Checkpoint, 'createdAt'>) => void;
  clearCheckpoint: (guidePath: string) => void;
  clearAll: () => void;
}

function load(): CheckpointsMap {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) as string) || {}; }
  catch { return {}; }
}

export function useCheckpoints(): UseCheckpointsReturn {
  const [checkpoints, setCheckpoints] = useState<CheckpointsMap>(load);

  const save = useCallback((next: CheckpointsMap): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setCheckpoints(next);
  }, []);

  const getCheckpoint = useCallback((guidePath: string): Checkpoint | null => {
    return checkpoints[guidePath] ?? null;
  }, [checkpoints]);

  const setCheckpoint = useCallback((guidePath: string, data: Omit<Checkpoint, 'createdAt'>): void => {
    const current = load();
    save({ ...current, [guidePath]: { ...data, createdAt: new Date().toISOString() } });
  }, [save]);

  const clearCheckpoint = useCallback((guidePath: string): void => {
    const current = load();
    const { [guidePath]: _removed, ...rest } = current;
    save(rest);
  }, [save]);

  const clearAll = useCallback((): void => save({}), [save]);

  return { checkpoints, getCheckpoint, setCheckpoint, clearCheckpoint, clearAll };
}
