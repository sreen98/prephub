/**
 * Hidden tests for JS coding challenges.
 *
 * The visible `test(...)` calls in a challenge's code can be satisfied by
 * hard-coding their answers, and they rarely cover the edges an interviewer
 * probes (empty input, duplicates, negatives, one element, a large input). So
 * each challenge also carries tests the reader cannot see, and Run reports both:
 * "3/3 visible · 5/7 hidden".
 *
 * A hidden test is a snippet that calls the reader's function and prints with
 * console.log. It runs in the SAME scope as their code (it is appended to it),
 * so it sees their declarations, but it gets its own captured console, so its
 * output never mixes with the visible tests' output. `output` is not written by
 * hand: it is what the REFERENCE solution prints for that snippet, and
 * `challengeHiddenTests.test.ts` re-derives it on every build.
 *
 * This module is plain string building, shared by the playground, the test and
 * the generator script, so all three run exactly the same harness.
 */
import type { HiddenTestData } from '../data/playground/challengeHiddenTests';

/**
 * `label`: what is tested, shown when it fails. `run`: code that calls the
 * reader's function and prints with console.log. `output`: what the reference
 * prints. `waitMs`: extra time for timer-based challenges.
 */
export type HiddenTest = HiddenTestData;

/** The hidden tests for a challenge, loaded on first use (they are ~100 KB). */
export async function loadHiddenTests(name: string): Promise<HiddenTest[] | null> {
  const mod = await import('../data/playground/challengeHiddenTests');
  return mod.challengeHiddenTests[name] ?? null;
}

export interface HiddenResult {
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
  error: string | null;
}

/** Printed once by the harness, carrying every result. Stripped from the visible output. */
export const HIDDEN_MARKER = '__PREPHUB_HIDDEN__';

/** Snippets that need time after they return: timers, promises, async functions. */
export function needsWait(run: string): boolean {
  return /setTimeout|setInterval|await|\.then\(|Promise|async/.test(run);
}

/**
 * The code appended after the reader's code. Each case is a function whose
 * parameter is named `console`, so the snippet's console.log writes to a
 * per-case buffer while the real console (outside the function) stays the
 * worker's. Cases run one after another, so a slow one cannot interleave with
 * the next.
 */
export function buildHiddenHarness(tests: Pick<HiddenTest, 'run' | 'waitMs'>[]): string {
  const cases = tests.map((t, i) =>
    `  [${i}, async (console) => {\n${t.run}\n  }, ${t.waitMs ?? (needsWait(t.run) ? 1000 : 0)}],`,
  ).join('\n');
  return `
;(async () => {
  const __fmt = (v) => (typeof v === 'string' ? v : JSON.stringify(v));
  const __cases = [
${cases}
  ];
  const __results = [];
  for (const [__i, __fn, __wait] of __cases) {
    const __out = [];
    const __cap = { log: (...a) => __out.push(a.map(__fmt).join(' ')), info() {}, warn() {}, error() {}, debug() {} };
    let __err = null;
    try { await __fn(__cap); } catch (e) { __err = String((e && e.message) || e); }
    if (__wait) await new Promise((r) => setTimeout(r, __wait));
    __results.push({ i: __i, out: __out.join('\\n'), err: __err });
  }
  console.log(${JSON.stringify(HIDDEN_MARKER)} + JSON.stringify(__results));
})();
`;
}

/** Total time the harness may need, so the runner can keep the worker alive long enough. */
export function harnessBudgetMs(tests: Pick<HiddenTest, 'run' | 'waitMs'>[]): number {
  return tests.reduce((sum, t) => sum + (t.waitMs ?? (needsWait(t.run) ? 1000 : 0)), 0) + 1500;
}

interface RawResult { i: number; out: string; err: string | null }

/**
 * Pull the harness's result line out of the captured logs. Returns the logs
 * without it, and the per-test results, or null when the harness never printed
 * (the reader's code threw before reaching it, or it timed out).
 */
export function readHiddenResults<T extends { text: string }>(
  logs: T[], tests: HiddenTest[],
): { logs: T[]; results: HiddenResult[] | null } {
  const at = logs.findIndex((l) => l.text.startsWith(HIDDEN_MARKER));
  if (at === -1) return { logs, results: null };
  let raw: RawResult[] = [];
  try { raw = JSON.parse(logs[at].text.slice(HIDDEN_MARKER.length)) as RawResult[]; } catch { raw = []; }
  const results = tests.map((t, i) => {
    const r = raw.find((x) => x.i === i);
    const actual = r?.out ?? '';
    const error = r?.err ?? null;
    return { label: t.label, passed: !error && actual === t.output, expected: t.output, actual, error };
  });
  return { logs: logs.filter((_, i) => i !== at), results };
}

/** Console lines describing the hidden results. No ✅/❌, so the visible tally is unaffected. */
export function describeHiddenResults(results: HiddenResult[] | null, total: number): string[] {
  if (results === null) {
    return [`🔒 Hidden tests (${total}) did not run: your code threw or timed out before reaching them.`];
  }
  const passed = results.filter((r) => r.passed).length;
  const lines = [`🔒 Hidden tests: ${passed}/${results.length} passed`];
  for (const r of results) {
    if (r.passed) continue;
    lines.push(r.error
      ? `   ✗ ${r.label}: threw ${r.error}`
      : `   ✗ ${r.label}: expected ${r.expected || '(nothing printed)'}, got ${r.actual || '(nothing printed)'}`);
  }
  return lines;
}
