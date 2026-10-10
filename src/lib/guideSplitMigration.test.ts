// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  migrateQuestionId, migrateIdKeyedRecord, migrateBookmarks, migrateCheckpoints,
  movedAnchorUrl, applyGuideSplitMigration,
} from './guideSplitMigration';
import { GUIDE_SPLITS } from '../data/guideSplits';
import { getJSON, setJSON, safeRemove } from './storage';
import { menuStructure, slugify } from '../data';

describe('migrateQuestionId', () => {
  it.each([
    // React: Q&A Q1–Q86, Tricky Q1–Q26 (all suffixed)
    ['React Guide-q5', 'React Interview Questions-q5'],
    ['React Guide-q86', 'React Interview Questions-q86'],
    ['React Guide-q5-2', 'React Tricky Questions-q5'],
    // JavaScript: deployed Q&A Q1–Q45, Tricky Q1–Q53 — Tricky Q46–Q53 were never suffixed
    ['JavaScript Guide-q45', 'JavaScript Interview Questions-q45'],
    ['JavaScript Guide-q12-2', 'JavaScript Tricky Questions-q12'],
    ['JavaScript Guide-q46', 'JavaScript Tricky Questions-q46'],
    ['JavaScript Guide-q53', 'JavaScript Tricky Questions-q53'],
    // TypeScript: deployed Q&A Q1–Q29, Tricky Q1–Q31 — Tricky Q30–Q31 were never suffixed
    ['TypeScript Guide-q29', 'TypeScript Interview Questions-q29'],
    ['TypeScript Guide-q29-2', 'TypeScript Tricky Questions-q29'],
    ['TypeScript Guide-q31', 'TypeScript Tricky Questions-q31'],
    // untouched
    ['React Interview Questions-q5', 'React Interview Questions-q5'],
    ['React Router-q5', 'React Router-q5'],
    ['Regex Guide-q3', 'Regex Guide-q3'],
    ['JavaScript Guide-q5-3', 'JavaScript Guide-q5-3'],
  ])('%s -> %s', (from, to) => {
    expect(migrateQuestionId(from)).toBe(to);
  });
});

describe('migrateIdKeyedRecord (Daily Review history)', () => {
  it('renames old keys, keeps others, and is idempotent', () => {
    const { next, changed } = migrateIdKeyedRecord({ 'React Guide-q1': 1, 'JavaScript Guide-q50': 2, 'Node.js Guide-q1': 3 });
    expect(changed).toBe(true);
    expect(next).toEqual({ 'React Interview Questions-q1': 1, 'JavaScript Tricky Questions-q50': 2, 'Node.js Guide-q1': 3 });
    expect(migrateIdKeyedRecord(next)).toEqual({ next, changed: false });
  });

  it('never overwrites history already stored under the new id', () => {
    const { next } = migrateIdKeyedRecord({ 'TypeScript Guide-q1': 'old', 'TypeScript Interview Questions-q1': 'new' });
    expect(next).toEqual({ 'TypeScript Interview Questions-q1': 'new' });
  });
});

describe('migrateBookmarks', () => {
  it('moves a quiz bookmark to the new id, bookmark id and guide name', () => {
    const { next } = migrateBookmarks([{ type: 'quiz', id: 'quiz__JavaScript Guide-q3-2', questionId: 'JavaScript Guide-q3-2', questionText: 'x', guideName: 'JavaScript Guide' }]);
    expect(next[0]).toMatchObject({ id: 'quiz__JavaScript Tricky Questions-q3', questionId: 'JavaScript Tricky Questions-q3', guideName: 'JavaScript Tricky Questions' });
  });

  it('moves a heading bookmark whose section moved, and leaves one that stayed', () => {
    const moved = '135-concurrent-features-usetransition-usedeferredvalue';
    const { next, changed } = migrateBookmarks([
      { type: 'heading', id: `frontend-react__${moved}`, guidePath: '/frontend/react', headingId: moved, headingText: '13.5', guideName: 'React Guide' },
      { type: 'heading', id: 'frontend-react__5-state', guidePath: '/frontend/react', headingId: '5-state', headingText: '5. State', guideName: 'React Guide' },
    ]);
    expect(changed).toBe(true);
    expect(next[0]).toMatchObject({ guidePath: '/frontend/react-performance', id: `frontend-react-performance__${moved}`, guideName: 'React Performance & Internals' });
    expect(next[1]).toMatchObject({ guidePath: '/frontend/react', id: 'frontend-react__5-state' });
  });
});

describe('migrateCheckpoints', () => {
  const cp = (headingId: string, guideName = 'x') => ({ headingId, headingText: 't', guideName, createdAt: '2026-01-01' });

  it('moves checkpoints in moved sections, for every split at once', () => {
    const { next } = migrateCheckpoints({
      '/frontend/react': cp('17-interview-questions-answers'),
      '/javascript/guide': cp('16-tricky-output-questions'),
      '/javascript/typescript': cp('2-basic-types'),   // stayed on the core page
    });
    expect(Object.keys(next).sort()).toEqual(['/frontend/react-interview-questions', '/javascript/tricky-questions', '/javascript/typescript']);
    expect(next['/javascript/tricky-questions'].guideName).toBe('JavaScript Tricky Questions');
  });

  it('does not overwrite a checkpoint the new guide already has', () => {
    const mine = cp('18-tricky-output-questions', 'mine');
    const { next } = migrateCheckpoints({ '/frontend/react': cp('18-tricky-output-questions'), '/frontend/react-tricky-questions': mine });
    expect(next).toEqual({ '/frontend/react-tricky-questions': mine });
  });
});

describe('movedAnchorUrl (old deep links)', () => {
  it.each([
    ['/frontend/react', '#16-react-19-features', '/frontend/react-19-patterns#16-react-19-features'],
    ['/frontend/react/', '#18-tricky-output-questions', '/frontend/react-tricky-questions#18-tricky-output-questions'],
    ['/javascript/guide', '#15-interview-questions-answers', '/javascript/interview-questions#15-interview-questions-answers'],
    ['/javascript/typescript', '#16-tricky-output-questions', '/javascript/typescript-tricky-questions#16-tricky-output-questions'],
    ['/frontend/react', '#6-hooks', null],
    ['/frontend/react', '', null],
    ['/frontend/react-router', '#16-react-19-features', null],
  ])('%s%s -> %s', (path, hash, expected) => {
    expect(movedAnchorUrl(path, hash)).toBe(expected);
  });
});

describe('applyGuideSplitMigration against real storage', () => {
  beforeEach(() => { for (const k of ['sr-schedule', 'bookmarks', 'checkpoints']) safeRemove(k); });

  it('migrates every store once and is a no-op the second time', () => {
    setJSON('sr-schedule', { 'React Guide-q7': { interval: 3 }, 'TypeScript Guide-q30': { interval: 1 } });
    setJSON('bookmarks', [{ type: 'quiz', id: 'quiz__React Guide-q7', questionId: 'React Guide-q7', questionText: 'q' }, 'garbage']);
    setJSON('checkpoints', { '/frontend/react': { headingId: '13-performance-optimization', headingText: '13', guideName: 'React Guide', createdAt: 'x', extra: 1 } });

    applyGuideSplitMigration();
    const after = [getJSON('sr-schedule', {}), getJSON('bookmarks', []), getJSON('checkpoints', {})];
    expect(after[0]).toEqual({ 'React Interview Questions-q7': { interval: 3 }, 'TypeScript Tricky Questions-q30': { interval: 1 } });
    expect(after[1]).toEqual([
      { type: 'quiz', id: 'quiz__React Interview Questions-q7', questionId: 'React Interview Questions-q7', questionText: 'q', guideName: 'React Interview Questions' },
      'garbage',   // malformed entries pass through untouched
    ]);
    // moved, renamed to the new guide, and the unknown field kept
    expect(after[2]).toEqual({ '/frontend/react-performance': { headingId: '13-performance-optimization', headingText: '13', guideName: 'React Performance & Internals', createdAt: 'x', extra: 1 } });

    applyGuideSplitMigration();
    expect([getJSON('sr-schedule', {}), getJSON('bookmarks', []), getJSON('checkpoints', {})]).toEqual(after);
  });

  it('does nothing on an empty or corrupt store', () => {
    setJSON('sr-schedule', [1, 2]);
    expect(() => applyGuideSplitMigration()).not.toThrow();
    expect(getJSON('sr-schedule', null)).toEqual([1, 2]);
  });
});

/** The anchor maps are generated; this pins them to the files so a heading rename can't break them silently. */
describe('GUIDE_SPLITS matches the guides', () => {
  const fileOf = new Map(menuStructure.flatMap((s) => s.items ?? []).map((i) => [i.path, i.file]));
  const headings = (route: string) => {
    const file = fileOf.get(route);
    if (!file) throw new Error(`no guide at ${route}`);
    const md = readFileSync(`src/${file.replace(/^\.\//, '')}`, 'utf8').replace(/\r\n/g, '\n');
    const out = new Set<string>(); let fence = false;
    for (const l of md.split('\n')) {
      if (/^\s*```/.test(l)) fence = !fence;
      const m = !fence && /^#{1,6}\s+(.*)$/.exec(l);
      if (m) out.add(slugify(m[1].replace(/`/g, '')));
    }
    return out;
  };

  it.each(GUIDE_SPLITS.map((s) => [s.oldName, s] as const))('%s: every moved anchor is on its target page and gone from the old one', (_name, split) => {
    const core = headings(split.oldRoute);
    for (const [anchor, route] of Object.entries(split.movedAnchors)) {
      expect(headings(route).has(anchor), `${anchor} on ${route}`).toBe(true);
      expect(core.has(anchor), `${anchor} still on ${split.oldRoute}`).toBe(false);
    }
    expect(Object.keys(split.movedAnchors).length).toBeGreaterThan(5);
  });

  it.each(GUIDE_SPLITS.map((s) => [s.oldName, s] as const))('%s: every target route is a real guide with the stated name', (_name, split) => {
    const nameOf = new Map(menuStructure.flatMap((s) => s.items ?? []).map((i) => [i.path, i.name]));
    for (const [route, name] of Object.entries(split.routeNames)) expect(nameOf.get(route)).toBe(name);
    expect(nameOf.get(split.qa.route)).toBe(split.qa.name);
    expect(nameOf.get(split.tricky.route)).toBe(split.tricky.name);
    expect(nameOf.get(split.oldRoute)).toBe(split.oldName);
  });
});
