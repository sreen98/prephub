import { describe, it, expect } from 'vitest';
import { finishJudge, prepareJudge, isTypeScriptChallenge } from './challengeJudge';
import { buildHiddenHarness, HIDDEN_MARKER, type HiddenTest } from './hiddenTests';

const hidden: HiddenTest[] = [
  { label: 'empty', run: 'console.log(double([]))', output: '[]' },
  { label: 'negatives', run: 'console.log(double([-1, 2]))', output: '[-2,4]' },
];
const prepared = { hidden, appendix: buildHiddenHarness(hidden), waitFor: { marker: HIDDEN_MARKER, maxMs: 2000 }, typeCheck: false };

/** Run code + harness the way the worker does: one script, the worker console collecting lines. */
async function run(program: string) {
  const logs: { type: 'log'; text: string }[] = [];
  const console = { log: (...a: unknown[]) => logs.push({ type: 'log', text: a.map(String).join(' ') }) };
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  try { new Function('console', program + prepared.appendix)(console); } catch { /* reader code threw */ }
  await new Promise((r) => setTimeout(r, 50));
  return logs;
}

describe('challenge judge', () => {
  it('solved needs the visible AND the hidden tests', async () => {
    const good = await run('function double(a) { return a.map((x) => x * 2); }\nconsole.log("✅ visible");');
    expect(finishJudge(prepared, good, null)).toMatchObject({ solved: true, summary: { pass: 1, fail: 0, hiddenPass: 2, hiddenTotal: 2 } });

    // Hard-codes the visible answer: passes the ✅ line, fails the hidden ones.
    const cheat = await run('function double(a) { return [2, 4]; }\nconsole.log("✅ visible");');
    const v = finishJudge(prepared, cheat, null);
    expect(v.solved).toBe(false);
    expect(v.summary).toMatchObject({ hiddenPass: 0, hiddenTotal: 2 });
    expect(v.logs.map((l) => l.text).join('\n')).toMatch(/✗ empty: expected \[\], got \[2,4\]/);
  });

  it('strips the harness result line and says so when the code threw first', async () => {
    const logs = await run('throw new Error("boom")');
    const v = finishJudge(prepared, logs, null);
    expect(v.logs.some((l) => l.text.startsWith(HIDDEN_MARKER))).toBe(false);
    expect(v.logs[0].text).toMatch(/did not run/);
    expect(v.solved).toBe(false);
  });

  it('a type error blocks solving a TypeScript challenge, and a checker failure is not a pass', () => {
    const noHidden = { hidden: null, appendix: '', typeCheck: true };
    const ok = [{ type: 'log' as const, text: '✅ runtime' }];
    expect(finishJudge(noHidden, ok, { diagnostics: [] }).solved).toBe(true);
    expect(finishJudge(noHidden, ok, { diagnostics: [{ line: 1, column: 1, code: 2322, message: 'x' }] }).solved).toBe(false);
    expect(finishJudge(noHidden, ok, { error: 'offline' }).solved).toBe(false);
  });

  it('only JS challenges are judged; TS ones also type-checked', async () => {
    expect((await prepareJudge({ name: 'Accordion', kind: 'challenge', tag: 'React' })).hidden).toBeNull();
    expect((await prepareJudge({ name: 'Two Sum', kind: 'challenge', tag: 'JS' })).hidden?.length).toBeGreaterThan(3);
    expect(isTypeScriptChallenge({ name: 'x', kind: 'challenge', tag: 'JS', lang: 'ts' })).toBe(true);
    expect(isTypeScriptChallenge({ name: 'x', kind: 'template', tag: 'JS', lang: 'ts' })).toBe(false);
  });
});
