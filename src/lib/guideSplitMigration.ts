/**
 * Keeps user data intact when a guide is split into a series (React in v1.7.14, JavaScript and
 * TypeScript in v1.7.15; the splits are described in src/data/guideSplits.ts).
 *
 * Question ids are `<guide name>-qN`, so moving the Interview Q&A and Tricky sections into
 * their own guides changes the ids that key Daily Review history (`sr-schedule`) and quiz
 * bookmarks. Heading bookmarks and checkpoints key on a guide path plus a heading anchor, and
 * those anchors moved to new routes. Every function here is pure and idempotent, so the
 * migration can run on every start-up without a "done" flag or a new storage key.
 */
import { getJSON, setJSON } from './storage';
import { GUIDE_SPLITS, type GuideSplit } from '../data/guideSplits';

// The stored shapes, declared here because lib/ sits below hooks/ in the layering and may not
// import from it. They mirror Bookmark (useBookmarks.ts) and CheckpointsMap (useCheckpoints.ts).
type Bookmark =
  | { type: 'quiz'; id: string; questionId: string; questionText: string; guideName?: string; createdAt?: string }
  | { type: 'heading'; id: string; guidePath: string; headingId: string; headingText: string; guideName?: string; createdAt?: string };
type Checkpoint = { headingId: string; headingText: string; guideName: string; createdAt: string };
type CheckpointsMap = Record<string, Checkpoint>;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The post-split id for a pre-split question id, and the guide it now belongs to. */
function moveQuestion(id: string, splits: readonly GuideSplit[]): { id: string; guideName: string } | null {
  for (const s of splits) {
    const m = new RegExp(`^${escape(s.oldName)}-q(\\d+)(-2)?$`).exec(id);
    if (!m) continue;
    const n = Number(m[1]);
    // Tricky questions restart at Q1. Dedupe gave a Tricky Qn the `-2` suffix only when the
    // Interview Q&A also had a Qn, i.e. n <= qaMax; above that, a plain id is a Tricky one.
    const tricky = m[2] !== undefined || n > s.qaMax;
    const target = tricky ? s.tricky : s.qa;
    return { id: `${target.name}-q${n}`, guideName: target.name };
  }
  return null;
}

export function migrateQuestionId(id: string, splits: readonly GuideSplit[] = GUIDE_SPLITS): string {
  return moveQuestion(id, splits)?.id ?? id;
}

/** Rename keys of an id-keyed record. A key that already exists under its new name wins. */
export function migrateIdKeyedRecord<T>(
  record: Record<string, T>, splits: readonly GuideSplit[] = GUIDE_SPLITS,
): { next: Record<string, T>; changed: boolean } {
  const next: Record<string, T> = {};
  let changed = false;
  for (const [key, value] of Object.entries(record)) {
    const to = migrateQuestionId(key, splits);
    if (to !== key) {
      changed = true;
      if (!(to in record)) next[to] = value;
    } else {
      next[key] = value;
    }
  }
  return { next, changed };
}

/** Where a heading anchor on a pre-split route now lives, if it moved. */
function movedRoute(guidePath: string, headingId: string, splits: readonly GuideSplit[]): { route: string; name: string } | null {
  const path = guidePath.replace(/\/$/, '');
  for (const s of splits) {
    if (path !== s.oldRoute) continue;
    const route = s.movedAnchors[headingId];
    if (route) return { route, name: s.routeNames[route] ?? '' };
  }
  return null;
}

/** Heading-bookmark ids are `<path with / as ->__<anchor>` (see markdownComponents.tsx). */
const headingBookmarkId = (guidePath: string, headingId: string) =>
  `${guidePath.replace(/\//g, '-').slice(1)}__${headingId}`;

export function migrateBookmarks(
  bookmarks: Bookmark[], splits: readonly GuideSplit[] = GUIDE_SPLITS,
): { next: Bookmark[]; changed: boolean } {
  let changed = false;
  const next = bookmarks.map((b): Bookmark => {
    if (b.type === 'quiz') {
      const to = moveQuestion(b.questionId, splits);
      if (!to) return b;
      changed = true;
      return { ...b, questionId: to.id, id: `quiz__${to.id}`, guideName: to.guideName };
    }
    const to = movedRoute(b.guidePath, b.headingId, splits);
    if (!to) return b;
    changed = true;
    return { ...b, guidePath: to.route, guideName: to.name || b.guideName, id: headingBookmarkId(to.route, b.headingId) };
  });
  return { next, changed };
}

/**
 * Checkpoints are one per guide path. A checkpoint whose heading moved goes to the new guide,
 * unless that guide already has its own checkpoint.
 */
export function migrateCheckpoints(
  map: CheckpointsMap, splits: readonly GuideSplit[] = GUIDE_SPLITS,
): { next: CheckpointsMap; changed: boolean } {
  let changed = false;
  const next: CheckpointsMap = { ...map };
  for (const s of splits) {
    const cp = next[s.oldRoute];
    const to = cp ? movedRoute(s.oldRoute, cp.headingId, splits) : null;
    if (!cp || !to) continue;
    changed = true;
    delete next[s.oldRoute];
    if (!next[to.route]) next[to.route] = { ...cp, guideName: to.name || cp.guideName };
  }
  return { next: changed ? next : map, changed };
}

/**
 * A pre-split deep link such as /frontend/react#135-concurrent-… points at a section that now
 * lives on another route. Returns the address to replace it with, or null.
 */
export function movedAnchorUrl(pathname: string, hash: string, splits: readonly GuideSplit[] = GUIDE_SPLITS): string | null {
  if (!hash) return null;
  const anchor = decodeURIComponent(hash.replace(/^#/, ''));
  const to = movedRoute(pathname, anchor, splits);
  return to ? `${to.route}#${anchor}` : null;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** Applies all of the above to the stored data. Safe to call on every start-up. */
export function applyGuideSplitMigration(): void {
  const rawSchedule = getJSON<unknown>('sr-schedule', {});
  if (isRecord(rawSchedule)) {
    const schedule = migrateIdKeyedRecord(rawSchedule);
    if (schedule.changed) setJSON('sr-schedule', schedule.next);
  }

  const rawBookmarks = getJSON<unknown>('bookmarks', []);
  if (Array.isArray(rawBookmarks)) {
    // Only well-formed entries are touched; anything else passes through untouched.
    const wellFormed = (b: unknown): b is Bookmark => isRecord(b) && (
      (b.type === 'quiz' && typeof b.questionId === 'string')
      || (b.type === 'heading' && typeof b.guidePath === 'string' && typeof b.headingId === 'string'));
    let changed = false;
    const next = rawBookmarks.map((b: unknown) => {
      if (!wellFormed(b)) return b;
      const r = migrateBookmarks([b]);
      changed ||= r.changed;
      return r.next[0];
    });
    if (changed) setJSON('bookmarks', next);
  }

  const rawCheckpoints = getJSON<unknown>('checkpoints', {});
  if (isRecord(rawCheckpoints)) {
    const typed: CheckpointsMap = {};
    for (const [k, v] of Object.entries(rawCheckpoints)) {
      if (isRecord(v) && typeof v.headingId === 'string') {
        typed[k] = { headingId: v.headingId, headingText: str(v.headingText), guideName: str(v.guideName), createdAt: str(v.createdAt) };
      }
    }
    const checkpoints = migrateCheckpoints(typed);
    if (checkpoints.changed) {
      // Rebuild from the raw map so fields this module does not know about are kept.
      const next: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rawCheckpoints)) if (k in checkpoints.next) next[k] = v;
      for (const [k, v] of Object.entries(checkpoints.next)) {
        if (!(k in next)) {
          const from = Object.entries(typed).find(([, t]) => t.headingId === v.headingId && t.createdAt === v.createdAt)?.[0];
          const raw = from !== undefined ? rawCheckpoints[from] : undefined;
          next[k] = { ...(isRecord(raw) ? raw : {}), ...v };
        }
      }
      setJSON('checkpoints', next);
    }
  }
}
