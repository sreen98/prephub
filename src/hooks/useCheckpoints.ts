import { useState, useCallback } from 'react';
import { getJSON, setJSON } from '../lib/storage';
import { useSyncedReload } from './useSyncedReload';

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
  return getJSON(STORAGE_KEY, {});
}

export function useCheckpoints(): UseCheckpointsReturn {
  const [checkpoints, setCheckpoints] = useState<CheckpointsMap>(load);

  const save = useCallback((next: CheckpointsMap): void => {
    setJSON(STORAGE_KEY, next);
    setCheckpoints(next);
  }, []);

  // Another device changed it (account sync): show the merged value.
  const reload = useCallback((): void => setCheckpoints(load()), []);
  useSyncedReload(STORAGE_KEY, reload);

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
