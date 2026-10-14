import { getJSON } from './storage';
import { SYNCED_KEYS } from './syncKeys';

/**
 * "Export my data": everything PrepHub keeps as progress, as one JSON file.
 * It reads this device's copy, which the sync engine keeps equal to the
 * account copy, so it works offline and for a guest too.
 */
export function buildExport(now: Date = new Date()): { app: 'PrepHub'; exportedAt: string; data: Record<string, unknown> } {
  const data: Record<string, unknown> = {};
  for (const key of SYNCED_KEYS) {
    const value = getJSON<unknown>(key, undefined);
    if (value !== undefined) data[key] = value;
  }
  return { app: 'PrepHub', exportedAt: now.toISOString(), data };
}

export function exportFileName(now: Date = new Date()): string {
  return `prephub-progress-${now.toISOString().slice(0, 10)}.json`;
}
