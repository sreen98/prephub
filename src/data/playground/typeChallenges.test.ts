import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { readFileSync, readdirSync } from 'node:fs';
import { templateCategories } from './playgroundTemplates';
import { playgroundSolutions } from './playgroundSolutions';
import { typeCheckSource } from '../../lib/typeCheck';

/**
 * TypeScript challenges are graded by the REAL type checker (challengeJudge:
 * zero type errors plus every runtime ✅). So for each one, pin both ends:
 *
 *   - the reference solution type-checks with ZERO diagnostics, under exactly
 *     the options and prelude the playground uses, and its runtime prints only
 *     ✅ once the types are stripped;
 *   - the unfinished stub has at least one diagnostic, so an attempt that has
 *     not been written yet can never count as solved.
 *
 * The type tests inside the templates (Expect<Equal<…>> and @ts-expect-error
 * lines) are what the diagnostics come from; this suite is what proves they
 * discriminate.
 */
const dir = 'node_modules/typescript/lib/';
const libs = Object.fromEntries(readdirSync(dir)
  .filter((f) => /^lib\.(es5|es20\d\d.*|decorators.*)\.d\.ts$/.test(f))
  .map((f) => [f, readFileSync(dir + f, 'utf8')]));

const category = templateCategories.find((c) => c.label === 'TypeScript Challenges');
const templates = category?.templates ?? [];

function run(source: string): string[] {
  const js = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  const logs: string[] = [];
  // Executing the stripped code is the point: it is what Run does in the Worker.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const fn = new Function('console', js) as (c: unknown) => void;
  fn({ log: (...a: unknown[]) => logs.push(a.map(String).join(' ')), warn() {}, error() {}, info() {} });
  return logs;
}

const describeDiags = (source: string) => typeCheckSource(ts, source, libs)
  .map((d) => `L${d.line} TS${d.code}: ${d.message.split('\n')[0]}`);

describe('TypeScript Challenges', () => {
  it('the category exists, sits right after Coding Challenges, and is all TypeScript', () => {
    const labels = templateCategories.map((c) => c.label);
    expect(labels.indexOf('TypeScript Challenges')).toBe(labels.indexOf('Coding Challenges') + 1);
    expect(category?.kind).toBe('challenge');
    expect(category?.tag).toBe('JS');
    expect(templates.length).toBe(6);
    for (const t of templates) {
      expect(t.lang, t.name).toBe('ts');
      expect(t.difficulty, t.name).toBeDefined();
      expect(playgroundSolutions[t.name], `${t.name} has no solution`).toBeTruthy();
    }
  });

  it.each(templates.map((t) => [t.name] as const))('%s: the solution type-checks with zero diagnostics', (name) => {
    expect(describeDiags(playgroundSolutions[name])).toEqual([]);
  });

  it.each(templates.map((t) => [t.name, t.code] as const))('%s: the stub has at least one type error', (_name, code) => {
    expect(typeCheckSource(ts, code, libs).length).toBeGreaterThan(0);
  });

  it.each(templates.map((t) => [t.name] as const))('%s: every approach passes its runtime tests', (name) => {
    const logs = run(playgroundSolutions[name]);
    expect(logs.filter((l) => l.includes('❌'))).toEqual([]);
    expect(logs.filter((l) => l.includes('✅')).length).toBeGreaterThan(0);
  });

  // The suite must be able to fail. Loosen one solution in memory — drop the
  // "K extends keyof T" constraint that makes MyPick<Todo, "nope"> an error —
  // and the negative test's @ts-expect-error must become unused (TS2578).
  it('a loosened solution is caught (probe)', () => {
    const src = playgroundSolutions['MyPick and MyOmit'];
    const broken = src.replace('type MyPick<T, K extends keyof T> = { [P in K]: T[P] };', 'type MyPick<T, K extends keyof any> = { [P in K]: P extends keyof T ? T[P] : never };');
    expect(broken).not.toBe(src);
    expect(typeCheckSource(ts, broken, libs).map((d) => d.code)).toContain(2578);
  });
});
