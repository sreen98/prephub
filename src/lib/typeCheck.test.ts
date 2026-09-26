import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { readFileSync, readdirSync } from 'node:fs';
import { typeCheckSource, describeTypeDiagnostics } from './typeCheck';

// The same lib set the worker bundles (its glob pattern, applied here by hand).
const dir = 'node_modules/typescript/lib/';
const libs = Object.fromEntries(readdirSync(dir)
  .filter((f) => /^lib\.(es5|es20\d\d.*|decorators.*)\.d\.ts$/.test(f))
  .map((f) => [f, readFileSync(dir + f, 'utf8')]));

describe('typeCheckSource', () => {
  it('passes clean code, including console and timers from the prelude', () => {
    expect(typeCheckSource(ts, 'const xs: number[] = [1, 2].map((n) => n * 2);\nsetTimeout(() => console.log(xs.at(-1)), 0);', libs)).toEqual([]);
  });

  it('reports a real type error with its code and line', () => {
    const d = typeCheckSource(ts, 'const a = 1;\nconst s: string = a;', libs);
    expect(d).toHaveLength(1);
    expect(d[0]).toMatchObject({ code: 2322, line: 2 });
  });

  it('checks type-level assertions, which is what a TypeScript challenge is graded on', () => {
    const src = `type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type _ok = Expect<Equal<MyPick<{ a: 1; b: 2 }, 'a'>, { a: 1 }>>;
type _bad = Expect<Equal<MyPick<{ a: 1; b: 2 }, 'a'>, { b: 2 }>>;`;
    const d = typeCheckSource(ts, src, libs);
    expect(d.map((x) => x.line)).toEqual([5]);
  });

  it('has no DOM: a snippet cannot type-check against APIs the sandbox lacks', () => {
    expect(typeCheckSource(ts, 'document.title = "x";', libs)[0]?.code).toBe(2584);
  });

  it('describes results in the ✅/❌ vocabulary the run tally counts', () => {
    expect(describeTypeDiagnostics([])).toEqual(['✅ Type check: no type errors']);
    expect(describeTypeDiagnostics([{ line: 3, column: 1, code: 2322, message: 'nope' }])[0]).toMatch(/^❌ Type error TS2322 \(line 3\)/);
  });
});
