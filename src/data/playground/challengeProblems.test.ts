import { describe, it, expect } from 'vitest';
import vm from 'node:vm';
import ts from 'typescript';
import { challengeProblems } from './challengeProblems';
import { playgroundSolutions } from './playgroundSolutions';
import { allTemplates } from './templateIndex';

/**
 * The problem panel shows sample inputs with their expected outputs. A wrong
 * sample output is worse than none: the reader codes to it. So every JS example
 * carries a `run` snippet, and this suite executes the REFERENCE SOLUTION
 * followed by that snippet and requires the printed text to equal `output`.
 *
 * The snippet gets its own captured console, passed in as a parameter, so the
 * solution file's own ✅ test logs (some of them on timers) are not mixed in.
 */
const challenges = allTemplates.filter((t) => t.kind === 'challenge');

async function runExample(solution: string, run: string): Promise<string> {
  const logs: string[] = [];
  const muted = { log() {}, error() {}, warn() {}, info() {} };
  const capture = {
    log: (...a: unknown[]) => logs.push(a.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ')),
    error() {}, warn() {}, info() {},
  };
  const ctx = vm.createContext({ console: muted, __capture: capture, setTimeout, clearTimeout, setInterval, clearInterval, Promise, queueMicrotask });
  vm.runInContext(`${solution}\n;(function (console) {\n${run}\n})(__capture);`, ctx, { timeout: 3000 });
  // Only asynchronous examples (debounce, retry, promise pools) need to wait for later logs.
  if (/setTimeout|setInterval|await|\.then\(|Promise|async/.test(run)) await new Promise((r) => setTimeout(r, 1200));
  return logs.join('\n');
}

describe('challenge problem statements', () => {
  it('every challenge has a statement, a short summary and examples', () => {
    const missing = challenges.filter((t) => !challengeProblems[t.name]).map((t) => t.name);
    expect(missing, 'challenges with no problem statement').toEqual([]);
    for (const t of challenges) {
      const p = challengeProblems[t.name];
      expect(p.summary.length, `${t.name}: summary`).toBeLessThanOrEqual(140);
      expect(p.statement.length, `${t.name}: statement`).toBeGreaterThan(60);
      expect(p.examples.length, `${t.name}: examples`).toBeGreaterThanOrEqual(t.tag === 'JS' ? 2 : 1);
    }
  });

  // The Problem panel is the one place the statement lives. The code used to
  // open with a comment block restating it (title, examples, constraints), so
  // the two copies could disagree and the stub started 10-20 lines down.
  it('no challenge template restates the problem in a header comment', async () => {
    const { getTemplateCode } = await import('./templateIndex');
    const restated: string[] = [];
    for (const t of challenges) {
      const code = (await getTemplateCode(t.name)) ?? '';
      if (/^\/\/ (=====|═════) (CHALLENGE|MACHINE CODING):/m.test(code) || /^\/\/ TASK$/m.test(code)) restated.push(t.name);
    }
    expect(restated).toEqual([]);
  });

  it('no statement belongs to a challenge that does not exist', () => {
    const names = new Set(challenges.map((t) => t.name));
    expect(Object.keys(challengeProblems).filter((n) => !names.has(n))).toEqual([]);
  });

  const jsWithExamples = challenges
    .filter((t) => t.tag === 'JS' && challengeProblems[t.name] && playgroundSolutions[t.name]);

  // A TypeScript challenge's solution is TypeScript, so it is transpiled first,
  // exactly as the playground strips types before running. Its examples may be
  // TYPE-level ("MyPick<Todo, 'title'>" → "{ title: string }"), which have no
  // runtime to execute, so a missing `run` is allowed there and nowhere else.
  // Those claims are covered by typeChallenges.test.ts, which type-checks the
  // solution's own type tests.
  const isTs = (name: string) => challenges.find((t) => t.name === name)?.lang === 'ts';
  const runnable = (name: string) => (isTs(name)
    ? ts.transpileModule(playgroundSolutions[name], { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText
    : playgroundSolutions[name]);

  it.each(jsWithExamples.map((t) => [t.name] as const))('%s: every sample output is what the reference solution prints', async (name) => {
    const problem = challengeProblems[name];
    let executed = 0;
    for (const [i, ex] of problem.examples.entries()) {
      if (!ex.run && isTs(name)) continue;
      expect(ex.run, `${name} example ${i + 1} has no run snippet`).toBeTruthy();
      expect(await runExample(runnable(name), ex.run!), `${name} example ${i + 1}: ${ex.input}`).toBe(String(ex.output));
      executed++;
    }
    // Even a TypeScript challenge shows at least one example the reader can run.
    expect(executed, `${name}: no example is executed`).toBeGreaterThan(0);
  }, 30000);
});
