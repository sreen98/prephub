import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { inspect } from 'node:util';

/** Run the four repaired demo blocks and check they print what they claim. */
describe('repaired JavaScript guide demos actually print', () => {
  const md = readFileSync('src/content/javascript-and-typescript/javascript-guide.md', 'utf8');
  const run = (snippet: string) => {
    const logs: string[] = [];
    /* eslint-disable @typescript-eslint/no-implied-eval -- executing the guide's
       own snippets is the entire point of this suite */
    const fn = new Function('console', snippet) as (c: unknown) => void;
    /* eslint-enable @typescript-eslint/no-implied-eval */
    fn({
      log: (...a: unknown[]) => logs.push(a.map(v => typeof v === 'string' ? v : inspect(v)).join(' ')),
    });
    return logs;
  };
  const block = (marker: string) => {
    const i = md.indexOf(marker);
    const start = md.lastIndexOf('```js\n', i) + 6;
    return md.slice(start, md.indexOf('```', start));
  };

  it('§5.1 scope chain prints three lines', () => {
    expect(run(block("const outerVar = 'I am outer'"))).toEqual(['I am inner', 'I am outer', 'I am global']);
  });

  it('§5.2 counter prints 1, 2, 2, undefined', () => {
    expect(run(block('const counter = createCounter()'))).toEqual(['1', '2', '2', 'undefined']);
  });

  it('Q2 closure prints 1, 2', () => {
    expect(run(block('const inc = outer()'))).toEqual(['1', '2']);
  });

  it('Q12 generator prints the claimed fibonacci values', () => {
    expect(run(block('const fib = fibonacci()'))).toEqual([
      '{ value: 0, done: false }', '{ value: 1, done: false }',
      '{ value: 1, done: false }', '{ value: 2, done: false }',
    ]);
  });

  it('§5.4 function factory respects minLevel', () => {
    expect(run(block("const apiLog = createLogger('api', 1)"))).toEqual([
      '[api] ERROR: timeout after 3s', '[db] DEBUG: connection opened',
    ]);
  });

  it('§5.4 memoize calls the underlying function once', () => {
    expect(run(block('const fastSquare = memoize(slowSquare)'))).toEqual([
      '16', 'cache hit [4]', '16', 'underlying calls: 1',
    ]);
  });

  it('§5.4 private state is unreachable from outside', () => {
    const out = run(block("const client = createApiClient('https://api.example.com')"));
    expect(out[0]).toBe('GET https://api.example.com/users (auth: Bearer secr…)');
    expect(out[2]).toBe('undefined');     // client.token
  });

  it('§5.4 per-item handlers capture their own item', () => {
    expect(run(block("const handlers = attachHandlers(['alpha', 'beta', 'gamma'])"))).toEqual([
      'clicked alpha at position 0', 'clicked gamma at position 2',
    ]);
  });

  it('§5.4 the stale-closure demo really is stale', () => {
    expect(run(block('const cycle = makeRenderCycle()'))).toEqual(['callback sees count = 0']);
  });

  it('§5.3 setTimeout-with-extra-args fix prints 0, 1, 2', () => {
    // The third fix is the one a reader is least likely to have seen, so it is
    // the one most worth pinning.
    const snippet = block('for (var k = 0; k < 3; k++)');
    const logs: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the guide's own snippet is the point
    const fn = new Function('console', 'setTimeout', snippet) as (c: unknown, t: unknown) => void;
    fn({ log: (...a: unknown[]) => logs.push(String(a[0])) },
       (cb: (v: number) => void, _d: number, v: number) => cb(v));
    expect(logs).toEqual(['0', '1', '2']);
  });
});
