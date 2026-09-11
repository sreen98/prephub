import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

/**
 * The localStorage keys ARE the user's saved data: reading progress, bookmarks,
 * checkpoints, SM-2 review schedules, playground drafts. Renaming one does not
 * migrate anything — it silently orphans that data and the user's progress
 * appears to reset. So the key names are a compatibility contract, and this
 * test pins them.
 *
 * If you are here because this test failed: do not just update the list. Either
 * keep the old key, or write a migration that reads the old key and writes the
 * new one.
 */
const EXPECTED_KEYS = [
  'bookmarks',
  'checkpoints',
  'guide-progress',
  'lastSeenChangelog',
  'playground-bracket-autoclose',
  'playground-last-session',
  'playground-progress',
  'playground-split-pct',
  'playground-wrap',
  'readingFontSize',
  'sr-schedule',
  'study-stats',
  'theme',
].sort();

/** Session-scoped keys: transient, but a rename still breaks a flow mid-use. */
const EXPECTED_SESSION_KEYS = ['admin-unlocked', 'playground-code'].sort();

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${e.name}`;
    if (e.isDirectory()) {
      if (e.name !== 'data' && e.name !== 'generated') sourceFiles(full, out);
    } else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) {
      out.push(full);
    }
  }
  return out;
}

describe('localStorage key contract', () => {
  const bodies = sourceFiles('src').map((f) => readFileSync(f, 'utf8')).join('\n');

  it('every expected key is still referenced somewhere in the source', () => {
    const missing = EXPECTED_KEYS.filter((k) => !bodies.includes(`'${k}'`));
    expect(missing, 'these keys vanished — user data would be orphaned').toEqual([]);
  });

  it('every session key is still referenced', () => {
    const missing = EXPECTED_SESSION_KEYS.filter((k) => !bodies.includes(`'${k}'`));
    expect(missing).toEqual([]);
  });

  it('storage access is funnelled through src/lib/storage.ts', () => {
    const offenders = sourceFiles('src')
      .filter((f) => !f.includes('lib/storage'))
      .filter((f) => /\b(localStorage|sessionStorage)\s*\./.test(readFileSync(f, 'utf8')));
    expect(offenders, 'use safeGet/safeSet — raw access throws in private mode').toEqual([]);
  });
});
