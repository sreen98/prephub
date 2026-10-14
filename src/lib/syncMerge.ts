import type { SyncedKey } from './syncKeys';

/**
 * Merging two devices' copies of a synced key (docs/accounts-and-sync-plan.md).
 *
 * It is a THREE-way merge: `base` is the value both sides last agreed on (the
 * last successful sync), `local` is this device, `remote` is the account copy.
 * Comparing each side with the base tells an edit from an untouched entry, so:
 *  - a change made on only one side wins, including a deliberate downgrade
 *    (un-marking a guide as completed) and a deletion (removing a bookmark);
 *  - only when BOTH sides changed the same entry does a per-key rule decide.
 * With no base (the first sign-in on a device) nothing can be called a deletion,
 * so the two copies are unioned and every overlap goes to the rule.
 *
 * Values arrive from storage and the network, so they are typed `unknown` and
 * read through small accessors rather than trusted: a malformed entry loses to
 * a well-formed one instead of throwing.
 */

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Structural equality where key order and `undefined` fields don't count (JSON drops both). */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  }
  if (!isRecord(a) || !isRecord(b)) return false;
  const defined = (o: Record<string, unknown>): string[] => Object.keys(o).filter((k) => o[k] !== undefined);
  const ak = defined(a);
  const bk = defined(b);
  return ak.length === bk.length && ak.every((k) => deepEqual(a[k], b[k]));
}

function text(v: unknown, name: string): string {
  const f = isRecord(v) ? v[name] : undefined;
  return typeof f === 'string' ? f : '';
}

function num(v: unknown, name: string): number {
  const f = isRecord(v) ? v[name] : undefined;
  return typeof f === 'number' && Number.isFinite(f) ? f : 0;
}

type Resolve = (local: unknown, remote: unknown) => unknown;

/** Both sides changed one entry: the later timestamp in `name` wins (ISO strings sort as dates). */
function laterBy(name: string): Resolve {
  return (l, r) => (text(r, name) > text(l, name) ? r : l);
}

function pickEntry(hasBase: boolean, b: unknown, l: unknown, r: unknown, resolve: Resolve): unknown {
  if (deepEqual(l, r)) return l;
  if (hasBase && deepEqual(l, b)) return r;
  if (hasBase && deepEqual(r, b)) return l;
  // Changed on one side and deleted on the other: the edit is the newer intent.
  if (l === undefined) return r;
  if (r === undefined) return l;
  return resolve(l, r);
}

/** Entry-by-entry three-way merge. Order: this device's entries, then new remote ones. */
export function mergeEntries(
  base: Map<string, unknown> | undefined,
  local: Map<string, unknown>,
  remote: Map<string, unknown>,
  resolve: Resolve,
): Map<string, unknown> {
  const out = new Map<string, unknown>();
  for (const k of new Set([...local.keys(), ...remote.keys()])) {
    const v = pickEntry(base !== undefined, base?.get(k), local.get(k), remote.get(k), resolve);
    if (v !== undefined) out.set(k, v);
  }
  return out;
}

function recordMap(v: unknown): Map<string, unknown> | undefined {
  return isRecord(v) ? new Map(Object.entries(v)) : undefined;
}

function mergeRecords(base: unknown, local: unknown, remote: unknown, resolve: Resolve): Record<string, unknown> {
  const merged = mergeEntries(recordMap(base), recordMap(local) ?? new Map(), recordMap(remote) ?? new Map(), resolve);
  return Object.fromEntries(merged);
}

const STATUS_RANK: Record<string, number> = { 'in-progress': 1, completed: 2 };

/** guide-progress: the further status wins (completed beats in-progress), then the later visit. */
function resolveGuide(l: unknown, r: unknown): unknown {
  const diff = (STATUS_RANK[text(r, 'status')] ?? 0) - (STATUS_RANK[text(l, 'status')] ?? 0);
  if (diff !== 0) return diff > 0 ? r : l;
  return laterBy('lastVisited')(l, r);
}

/** sr-schedule: the most recent review wins; on the same day, the one scheduled further out. */
function resolveSchedule(l: unknown, r: unknown): unknown {
  const byReview = text(r, 'lastReview').localeCompare(text(l, 'lastReview'));
  if (byReview !== 0) return byReview > 0 ? r : l;
  return text(r, 'nextReview') > text(l, 'nextReview') ? r : l;
}

/**
 * playground-progress: the newer edit supplies the code and notes, while
 * "solved" is sticky (solved on either device stays solved) and keeps the
 * earliest solvedAt, so a later re-run never rewrites when it was first solved.
 */
function resolvePlayground(l: unknown, r: unknown): unknown {
  const newer = text(r, 'updatedAt') > text(l, 'updatedAt') ? r : l;
  if (!isRecord(newer)) return newer;
  const solved = text(l, 'status') === 'solved' || text(r, 'status') === 'solved';
  const firstSolved = [text(l, 'solvedAt'), text(r, 'solvedAt')].filter(Boolean).sort()[0];
  const { solvedAt: _dropped, ...rest } = newer;
  const out: Record<string, unknown> = { ...rest, status: solved ? 'solved' : 'in-progress' };
  if (solved && firstSolved) out.solvedAt = firstSolved;
  return out;
}

/** playground-interview-history: attempts never change once recorded, so keep every one, by start time. */
function resolveAttempts(l: unknown, r: unknown): unknown {
  const byStart = new Map<number, unknown>();
  for (const a of [...(Array.isArray(l) ? l : []), ...(Array.isArray(r) ? r : [])]) {
    const start = num(a, 'startedAt');
    if (!byStart.has(start)) byStart.set(start, a);
  }
  return [...byStart.entries()].sort((x, y) => x[0] - y[0]).map(([, a]) => a);
}

/** bookmarks: a list keyed by `id`; both-sides edits keep the later createdAt. */
function mergeBookmarks(base: unknown, local: unknown, remote: unknown): unknown[] {
  const byId = (v: unknown): Map<string, unknown> | undefined =>
    Array.isArray(v) ? new Map(v.filter((b) => text(b, 'id') !== '').map((b): [string, unknown] => [text(b, 'id'), b])) : undefined;
  const merged = mergeEntries(byId(base), byId(local) ?? new Map(), byId(remote) ?? new Map(), laterBy('createdAt'));
  return [...merged.values()];
}

function listOf<T>(v: unknown, name: string, keep: (x: unknown) => x is T): T[] {
  const f = isRecord(v) ? v[name] : undefined;
  return Array.isArray(f) ? f.filter(keep) : [];
}

const isString = (x: unknown): x is string => typeof x === 'string';
const isNumber = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);

/**
 * study-stats: visit dates and milestones are sets, so they union. The totals
 * are counters: with a base, each side's increase since the base is added
 * (two devices each reviewing 5 questions makes 10); without one, the larger
 * total is kept, because adding could count the same history twice.
 */
function mergeStudyStats(base: unknown, local: unknown, remote: unknown): Record<string, unknown> {
  const counter = (name: string): number => {
    const l = num(local, name);
    const r = num(remote, name);
    return isRecord(base) ? Math.max(l, r, l + r - num(base, name)) : Math.max(l, r);
  };
  const visitDates = [...new Set([...listOf(local, 'visitDates', isString), ...listOf(remote, 'visitDates', isString)])].sort();
  const milestonesSeen = [...new Set([...listOf(local, 'milestonesSeen', isNumber), ...listOf(remote, 'milestonesSeen', isNumber)])]
    .sort((a, b) => a - b);
  return {
    visitDates,
    totalQuestionsReviewed: counter('totalQuestionsReviewed'),
    totalGuidesCompleted: counter('totalGuidesCompleted'),
    milestonesSeen,
  };
}

/** Merge one synced key. `base` is undefined when this device has never synced. */
export function mergeSyncedValue(key: SyncedKey, base: unknown, local: unknown, remote: unknown): unknown {
  switch (key) {
    case 'bookmarks': return mergeBookmarks(base, local, remote);
    case 'checkpoints': return mergeRecords(base, local, remote, laterBy('createdAt'));
    case 'guide-progress': return mergeRecords(base, local, remote, resolveGuide);
    case 'playground-interview-history': return mergeRecords(base, local, remote, resolveAttempts);
    case 'playground-progress': return mergeRecords(base, local, remote, resolvePlayground);
    case 'sr-schedule': return mergeRecords(base, local, remote, resolveSchedule);
    case 'study-stats': return mergeStudyStats(base, local, remote);
  }
}
