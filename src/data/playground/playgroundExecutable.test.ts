import { describe, it, expect } from 'vitest';
import * as babel from '@babel/standalone';
import { allTemplates } from './playgroundTemplates';
import { playgroundSolutionKeys } from './playgroundSolutionKeys';
import { detectJSX, detectTS, stripModuleSyntax } from '../../lib/playgroundRunner';

/**
 * Every template and solution must still compile.
 *
 * CLAUDE.md's standing rule is "always extract-and-run after editing
 * playgroundTemplates.ts or playgroundSolutions.ts; a typecheck is not
 * sufficient" — because a mis-escaped backtick inside these `code:` literals
 * truncates the template and `tsc` still parses the remainder happily. That
 * rule used to mean hand-building a throwaway script each time. This is it,
 * permanently, running in the push gate.
 */
function compile(code: string, name: string) {
  const { code: stripped } = stripModuleSyntax(code);
  const presets: (string | [string, Record<string, unknown>])[] = [];
  if (detectTS(stripped)) presets.push(['typescript', { isTSX: detectJSX(stripped), allExtensions: true }]);
  if (detectJSX(stripped)) presets.push('react');
  babel.transform(stripped, {
    presets,
    filename: `${name.replace(/[^\w]/g, '_')}.tsx`,
  });
}

describe('every template compiles', () => {
  it.each(allTemplates.map((t) => [t.name, t.code] as const))('%s', (name, code) => {
    expect(() => compile(code, name)).not.toThrow();
  });
});

describe('every solution compiles', () => {
  it('all of them', async () => {
    const solutions = (await import('./playgroundSolutions')).playgroundSolutions;
    const broken: string[] = [];
    for (const key of playgroundSolutionKeys) {
      try {
        compile(solutions[key], key);
      } catch (err) {
        broken.push(`${key}: ${err instanceof Error ? err.message.split('\n')[0] : String(err)}`);
      }
    }
    expect(broken).toEqual([]);
  });
});

describe('plain-JS challenges actually execute and pass their own tests', () => {
  // JS coding challenges print ✅ / ❌ markers. A solution that compiles but
  // fails its own assertions is worse than one that does not compile, because
  // "Show Solution" then teaches the wrong answer.
  //
  // Several solutions are ASYNC — they end in `run()` where run is an async
  // function, or schedule assertions inside setTimeout. Reading `logs` straight
  // after `new Function(...)()` returns therefore sees an EMPTY array and the
  // test passes vacuously, which is worse than no test at all. So the run below
  // drains the macrotask queue until the log output stops growing.
  it('every JS solution produces only ✅ markers when run', async () => {
    const solutions = (await import('./playgroundSolutions')).playgroundSolutions;
    const failures: string[] = [];

    for (const key of playgroundSolutionKeys) {
      const tpl = allTemplates.find((t) => t.name === key);
      if (!tpl || tpl.tag !== 'JS' || detectJSX(solutions[key])) continue;

      const logs: string[] = [];
      const { code: stripped } = stripModuleSyntax(solutions[key]);
      const src = detectTS(stripped)
        ? babel.transform(stripped, { presets: [['typescript', { allExtensions: true }]], filename: 'x.ts' }).code
        : stripped;
      try {
        // Executing the solution is the entire point of this test — it is the
        // same `new Function` the playground uses to run user code.
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const fn = new Function('console', src) as (c: unknown) => void;
        fn({
          log: (...a: unknown[]) => logs.push(a.map(String).join(' ')),
          warn: () => {}, error: () => {}, info: () => {},
        });
      } catch (err) {
        failures.push(`${key}: threw — ${err instanceof Error ? err.message : String(err)}`);
        continue;
      }
      // Let anything scheduled with setTimeout / promises actually run. Only
      // solutions that schedule work pay this cost, so the ~80 synchronous
      // ones stay instant.
      //
      // The minimum-tick floor is load-bearing: Throttle's only assertion sits
      // in nested setTimeouts 200 ms out, so a pure "stop once it goes quiet"
      // rule gave up at 150 ms having seen nothing and called that a pass.
      if (/setTimeout|setInterval|async |await |Promise|queueMicrotask/.test(src)) {
        let quiet = 0;
        for (let tick = 0; tick < 60 && !(tick >= 12 && quiet >= 6); tick++) {
          const before = logs.length;
          await new Promise((r) => setTimeout(r, 25));
          quiet = logs.length === before ? quiet + 1 : 0;
        }
      }

      const out = logs.join('\n');
      if (out.includes('❌')) {
        const bad = logs.filter((l) => l.includes('❌')).slice(0, 2).join(' | ');
        failures.push(`${key}: printed a ❌ assertion failure — ${bad}`);
      } else if (out.trim() === '') {
        // A solution that prints nothing is not passing, it is silent. That is
        // exactly how an async solution used to slip through this gate.
        failures.push(`${key}: produced no output at all`);
      }
    }

    expect(failures).toEqual([]);
  }, 60_000);

  /**
   * A solution must not depend on an API the user's browser may not have.
   *
   * "Array Intersection & Union" called `Set.prototype.intersection` in its own
   * test, which threw on CI — those methods are Node 22+ and Chrome 122 /
   * Safari 17 / Firefox 127 (2024), so a slightly older browser gets a
   * TypeError the moment it presses Run. Nothing upstream catches this: it is
   * not a parse error, and `tsc` types it happily against modern lib defs.
   *
   * That it was caught at all was luck — CI happened to run Node 20. Bump the
   * CI image and the protection silently disappears, so pin it here instead:
   * strip the newest Set methods, then re-run every solution.
   */
  it('no solution depends on the ES2025 Set methods without a guard', async () => {
    const solutions = (await import('./playgroundSolutions')).playgroundSolutions;
    const NEW_SET_METHODS = ['intersection', 'union', 'difference', 'symmetricDifference',
      'isSubsetOf', 'isSupersetOf', 'isDisjointFrom'] as const;

    const saved = new Map<string, unknown>();
    for (const m of NEW_SET_METHODS) {
      const proto = Set.prototype as unknown as Record<string, unknown>;
      if (m in proto) { saved.set(m, proto[m]); delete proto[m]; }
    }
    try {
      const failures: string[] = [];
      for (const key of playgroundSolutionKeys) {
        const tpl = allTemplates.find((t) => t.name === key);
        if (!tpl || tpl.tag !== 'JS' || detectJSX(solutions[key])) continue;
        const logs: string[] = [];
        const { code: stripped } = stripModuleSyntax(solutions[key]);
        const src = detectTS(stripped)
          ? babel.transform(stripped, { presets: [['typescript', { allExtensions: true }]], filename: 'x.ts' }).code
          : stripped;
        try {
          // eslint-disable-next-line @typescript-eslint/no-implied-eval
          const fn = new Function('console', src) as (c: unknown) => void;
          fn({ log: (...a: unknown[]) => logs.push(a.map(String).join(' ')),
               warn: () => {}, error: () => {}, info: () => {} });
        } catch (err) {
          failures.push(`${key}: threw without the new Set methods — ${err instanceof Error ? err.message : String(err)}`);
          continue;
        }
        if (logs.join('\n').includes('❌')) failures.push(`${key}: failed an assertion without the new Set methods`);
      }
      expect(failures).toEqual([]);
    } finally {
      const proto = Set.prototype as unknown as Record<string, unknown>;
      for (const [m, impl] of saved) proto[m] = impl;
    }
  }, 60_000);
});
