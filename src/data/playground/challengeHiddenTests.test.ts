import { describe, it, expect } from 'vitest';
import vm from 'node:vm';
import { challengeHiddenTests } from './challengeHiddenTests';
import { playgroundSolutions } from './playgroundSolutions';
import { allTemplates } from './playgroundTemplates';
import { buildHiddenHarness, harnessBudgetMs, HIDDEN_MARKER, readHiddenResults } from '../../lib/hiddenTests';

/**
 * Hidden tests are graded against `output`, which is what the REFERENCE
 * solution prints. Re-derive every one here, through the same harness the
 * playground appends, so a changed solution or a harness change cannot leave a
 * hidden test demanding an answer nobody can produce. Also require every test
 * to FAIL on the unfinished stub: a test the stub passes proves nothing.
 */
// TypeScript challenges are graded by the type checker instead (typeChallenges.test.ts).
const challenges = allTemplates.filter((t) => t.kind === 'challenge' && t.tag === 'JS' && t.lang !== 'ts');

async function runHidden(program: string, name: string) {
  const tests = challengeHiddenTests[name];
  process.on('unhandledRejection', () => {});
  const logs: { text: string }[] = [];
  const top = { log: (...a: unknown[]) => logs.push({ text: a.map(String).join(' ') }), info() {}, warn() {}, error() {}, debug() {} };
  const ctx = vm.createContext({ console: top, setTimeout, clearTimeout, setInterval, clearInterval, Promise, queueMicrotask, structuredClone });
  try { vm.runInContext(program + buildHiddenHarness(tests), ctx, { timeout: 3000 }); } catch { /* the stub may throw */ }
  const end = Date.now() + harnessBudgetMs(tests) + 2000;
  while (!logs.some((l) => l.text.startsWith(HIDDEN_MARKER)) && Date.now() < end) await new Promise((r) => setTimeout(r, 20));
  return readHiddenResults(logs, tests).results;
}

describe('hidden tests', () => {
  it('every JS coding challenge has at least 4', () => {
    const thin = challenges.filter((t) => (challengeHiddenTests[t.name]?.length ?? 0) < 4).map((t) => t.name);
    expect(thin).toEqual([]);
  });

  it.concurrent.each(Object.keys(challengeHiddenTests).map((n) => [n] as const))('%s: the reference passes every one, the stub none', async (name) => {
    const ref = await runHidden(playgroundSolutions[name], name);
    expect(ref, 'reference did not finish').not.toBeNull();
    expect(ref!.filter((r) => !r.passed).map((r) => `${r.label}: expected ${r.expected}, got ${r.actual}${r.error ? ' / ' + r.error : ''}`)).toEqual([]);
    const stub = await runHidden(allTemplates.find((t) => t.name === name)!.code, name);
    expect((stub ?? []).filter((r) => r.passed).map((r) => r.label), 'tests the stub already passes').toEqual([]);
  }, 30000);
});
