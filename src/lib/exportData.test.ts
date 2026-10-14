import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildExport, exportFileName } from './exportData';
import { setJSON, safeSet } from './storage';

beforeEach(() => {
  const map = new Map<string, string>();
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => { map.set(k, v); },
      removeItem: (k: string) => { map.delete(k); },
    },
  });
});
afterEach(() => { vi.unstubAllGlobals(); });

describe('buildExport', () => {
  it('includes every saved progress key and no device settings or sync bookkeeping', () => {
    setJSON('bookmarks', [{ id: 'a' }]);
    setJSON('guide-progress', { '/react': { status: 'completed', lastVisited: '2026-10-14' } });
    safeSet('theme', 'dark');
    setJSON('sync-base', { uid: 'alice', values: {} });
    const now = new Date('2026-10-14T12:00:00Z');
    expect(buildExport(now)).toEqual({
      app: 'PrepHub',
      exportedAt: '2026-10-14T12:00:00.000Z',
      data: {
        bookmarks: [{ id: 'a' }],
        'guide-progress': { '/react': { status: 'completed', lastVisited: '2026-10-14' } },
      },
    });
  });

  it('names the file by date', () => {
    expect(exportFileName(new Date('2026-10-14T23:00:00Z'))).toBe('prephub-progress-2026-10-14.json');
  });
});
