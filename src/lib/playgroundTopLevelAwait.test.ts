import { describe, it, expect } from 'vitest';
import { compileUserFunction, runUserFunction } from './playgroundRunner';

/**
 * `new Function` builds a SCRIPT, where top-level await is a hard SyntaxError —
 * so 129 runnable guide blocks across 26 guides shipped a "Try it" button that
 * failed before running a line. verify:blocks cannot see it: that gate parses
 * with Babel in module mode, where top-level await is legal.
 */
describe('playground execution handles top-level await', () => {
  it('a plain new Function still cannot compile top-level await — the bug being fixed', () => {
    /* eslint-disable-next-line @typescript-eslint/no-implied-eval -- reproducing the
       exact failure the fix exists for; without this the test proves nothing */
    expect(() => new Function('const x = await Promise.resolve(1);')).toThrow(SyntaxError);
  });

  it('compiles a snippet that uses top-level await', async () => {
    const logs: string[] = [];
    const fn = compileUserFunction(['console'], `
      const value = await Promise.resolve(42);
      console.log('got', value);
    `);
    await fn({ log: (...a: unknown[]) => logs.push(a.join(' ')) });
    expect(logs).toEqual(['got 42']);
  });

  it('leaves ordinary synchronous snippets on the plain path', () => {
    const fn = compileUserFunction([], 'return 7;');
    expect(fn()).toBe(7);
    // A synchronous body must NOT become a promise — that would change semantics
    // for every existing snippet.
    expect(fn()).not.toBeInstanceOf(Promise);
  });

  it('still throws a real syntax error rather than swallowing it', () => {
    expect(() => compileUserFunction([], 'const = ;')).toThrow(SyntaxError);
  });

  it('reports an async rejection instead of losing it', async () => {
    const errors: string[] = [];
    runUserFunction([], [], 'await Promise.reject(new TypeError("boom"));', e => errors.push(e));
    await new Promise(r => setTimeout(r, 10));
    expect(errors).toEqual(['TypeError: boom']);
  });

  it('runs the JavaScript guide Q16 block, which uses top-level await', async () => {
    const logs: string[] = [];
    const src = `
      async function* gen() {
        for (const ms of [30, 10, 20]) {
          await new Promise(r => setTimeout(r, ms));
          console.log('yield', ms);
          yield ms;
        }
      }
      const t = Date.now();
      const out = await Array.fromAsync(gen());
      console.log(out, Date.now() - t >= 60);
    `;
    const fn = compileUserFunction(['console'], src);
    await fn({ log: (...a: unknown[]) => logs.push(a.map(String).join(' ')) });
    expect(logs).toEqual(['yield 30', 'yield 10', 'yield 20', '30,10,20 true']);
  });
});
