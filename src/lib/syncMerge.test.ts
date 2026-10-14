import { describe, it, expect } from 'vitest';
import { deepEqual, mergeSyncedValue } from './syncMerge';
import { SYNCED_KEYS } from './syncKeys';

describe('deepEqual', () => {
  it('ignores key order and undefined fields, as a JSON round trip does', () => {
    expect(deepEqual({ a: 1, b: { c: [1, 2] } }, { b: { c: [1, 2] }, a: 1 })).toBe(true);
    expect(deepEqual({ a: 1, notes: undefined }, { a: 1 })).toBe(true);
  });

  it('still tells different values apart', () => {
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
    expect(deepEqual({ a: [] }, { a: {} })).toBe(false);
    expect(deepEqual(null, {})).toBe(false);
  });
});

describe('guide-progress', () => {
  const done = { status: 'completed', lastVisited: '2026-10-01' };
  const reading = { status: 'in-progress', lastVisited: '2026-10-05' };

  it('first sign-in: unions both devices, and the further status wins an overlap', () => {
    const merged = mergeSyncedValue('guide-progress', undefined,
      { '/react': reading, '/git': reading },
      { '/react': done, '/css': reading });
    expect(merged).toEqual({ '/react': done, '/git': reading, '/css': reading });
  });

  it('a deliberate un-complete on one device is kept, because the other side never changed it', () => {
    const base = { '/react': done };
    const merged = mergeSyncedValue('guide-progress', base, { '/react': done }, { '/react': reading });
    expect(merged).toEqual({ '/react': reading });
  });
});

describe('bookmarks', () => {
  const a = { id: 'a', type: 'quiz', questionId: 'q1', questionText: 'A?', createdAt: '2026-10-01T00:00:00Z' };
  const b = { id: 'b', type: 'quiz', questionId: 'q2', questionText: 'B?', createdAt: '2026-10-02T00:00:00Z' };
  const c = { id: 'c', type: 'quiz', questionId: 'q3', questionText: 'C?', createdAt: '2026-10-03T00:00:00Z' };

  it('a bookmark removed on another device stays removed', () => {
    expect(mergeSyncedValue('bookmarks', [a, b], [a, b], [a])).toEqual([a]);
  });

  it('a bookmark removed here stays removed', () => {
    expect(mergeSyncedValue('bookmarks', [a, b], [a], [a, b])).toEqual([a]);
  });

  it('without a base nothing counts as removed: the lists are unioned, this device first', () => {
    expect(mergeSyncedValue('bookmarks', undefined, [b, a], [a, c])).toEqual([b, a, c]);
  });

  it('additions on both sides are all kept', () => {
    expect(mergeSyncedValue('bookmarks', [a], [a, b], [a, c])).toEqual([a, b, c]);
  });
});

describe('checkpoints', () => {
  it('an edit beats a deletion of the same entry', () => {
    const old = { headingId: 'h1', headingText: 'One', guideName: 'React', createdAt: '2026-10-01T00:00:00Z' };
    const moved = { ...old, headingId: 'h2', headingText: 'Two', createdAt: '2026-10-04T00:00:00Z' };
    expect(mergeSyncedValue('checkpoints', { '/react': old }, {}, { '/react': moved })).toEqual({ '/react': moved });
    expect(mergeSyncedValue('checkpoints', { '/react': old }, { '/react': moved }, {})).toEqual({ '/react': moved });
  });

  it('when both devices moved it, the later one wins', () => {
    const x = { headingId: 'x', headingText: 'X', guideName: 'React', createdAt: '2026-10-02T00:00:00Z' };
    const y = { ...x, headingId: 'y', createdAt: '2026-10-03T00:00:00Z' };
    expect(mergeSyncedValue('checkpoints', {}, { '/react': y }, { '/react': x })).toEqual({ '/react': y });
    expect(mergeSyncedValue('checkpoints', {}, { '/react': x }, { '/react': y })).toEqual({ '/react': y });
  });
});

describe('sr-schedule', () => {
  it('the most recent review wins, whichever side it is on', () => {
    const older = { easeFactor: 2.5, interval: 1, repetitions: 1, lastReview: '2026-10-01', nextReview: '2026-10-02' };
    const newer = { easeFactor: 2.6, interval: 6, repetitions: 2, lastReview: '2026-10-03', nextReview: '2026-10-09' };
    expect(mergeSyncedValue('sr-schedule', {}, { q: older }, { q: newer })).toEqual({ q: newer });
    expect(mergeSyncedValue('sr-schedule', {}, { q: newer }, { q: older })).toEqual({ q: newer });
  });

  it('two reviews on the same day keep the one scheduled further out', () => {
    const again = { easeFactor: 2.2, interval: 1, repetitions: 0, lastReview: '2026-10-03', nextReview: '2026-10-04' };
    const gotIt = { easeFactor: 2.5, interval: 6, repetitions: 2, lastReview: '2026-10-03', nextReview: '2026-10-09' };
    expect(mergeSyncedValue('sr-schedule', undefined, { q: again }, { q: gotIt })).toEqual({ q: gotIt });
  });
});

describe('playground-progress', () => {
  it('the newer draft supplies the code, solved stays solved, and the first solvedAt is kept', () => {
    const solvedEarly = { code: 'v1', status: 'solved', updatedAt: '2026-10-01T10:00:00Z', solvedAt: '2026-10-01T10:00:00Z' };
    const editedLater = { code: 'v2', notes: 'try a map', status: 'in-progress', updatedAt: '2026-10-02T10:00:00Z' };
    const expected = { code: 'v2', notes: 'try a map', status: 'solved', updatedAt: '2026-10-02T10:00:00Z', solvedAt: '2026-10-01T10:00:00Z' };
    expect(mergeSyncedValue('playground-progress', undefined, { t: solvedEarly }, { t: editedLater })).toEqual({ t: expected });
    expect(mergeSyncedValue('playground-progress', undefined, { t: editedLater }, { t: solvedEarly })).toEqual({ t: expected });
  });

  it('un-marking solved on one device propagates when the other side is unchanged', () => {
    const solved = { code: 'x', status: 'solved', updatedAt: '2026-10-01T00:00:00Z', solvedAt: '2026-10-01T00:00:00Z' };
    const unmarked = { code: 'x', status: 'in-progress', updatedAt: '2026-10-02T00:00:00Z' };
    expect(mergeSyncedValue('playground-progress', { t: solved }, { t: solved }, { t: unmarked })).toEqual({ t: unmarked });
  });
});

describe('playground-interview-history', () => {
  it('keeps every attempt from both devices once, in start order', () => {
    const at = (startedAt: number) => ({ startedAt, minutes: 30, elapsedMs: 1000, outcome: 'solved' });
    const merged = mergeSyncedValue('playground-interview-history', undefined,
      { LRU: [at(3), at(1)] }, { LRU: [at(1), at(2)], Debounce: [at(5)] });
    expect(merged).toEqual({ LRU: [at(1), at(2), at(3)], Debounce: [at(5)] });
  });
});

describe('study-stats', () => {
  const stats = (dates: string[], reviewed: number, guides: number, milestones: number[]) => ({
    visitDates: dates, totalQuestionsReviewed: reviewed, totalGuidesCompleted: guides, milestonesSeen: milestones,
  });

  it('with a base, counters add up what each device did since the last sync', () => {
    const base = stats(['2026-10-01'], 10, 2, [3]);
    const local = stats(['2026-10-01', '2026-10-02'], 15, 2, [3]);
    const remote = stats(['2026-10-01', '2026-10-03'], 13, 3, [3, 7]);
    expect(mergeSyncedValue('study-stats', base, local, remote))
      .toEqual(stats(['2026-10-01', '2026-10-02', '2026-10-03'], 18, 3, [3, 7]));
  });

  it('without a base, counters take the larger total instead of double counting', () => {
    expect(mergeSyncedValue('study-stats', undefined, stats([], 15, 2, []), stats([], 13, 3, [])))
      .toEqual(stats([], 15, 3, []));
  });
});

describe('robustness', () => {
  it('a malformed remote value never throws and never wipes local progress', () => {
    const local = { '/react': { status: 'completed', lastVisited: '2026-10-01' } };
    expect(mergeSyncedValue('guide-progress', undefined, local, 'garbage')).toEqual(local);
    expect(mergeSyncedValue('bookmarks', undefined, [{ id: 'a' }], { not: 'a list' })).toEqual([{ id: 'a' }]);
  });

  it('every synced key merges empty inputs, and merging a result with itself changes nothing', () => {
    for (const key of SYNCED_KEYS) {
      const merged = mergeSyncedValue(key, undefined, undefined, undefined);
      expect(mergeSyncedValue(key, merged, merged, merged), key).toEqual(merged);
    }
  });
});
