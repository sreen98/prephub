import { describe, it, expect } from 'vitest';
import { readSeries } from './guideSeries';
import { inspect } from 'node:util';

/** Run the four repaired demo blocks and check they print what they claim. */
describe('repaired JavaScript guide demos actually print', () => {
  const md = readSeries('javascript');
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

  it('§7.1 reduce initialValue behaviour is as claimed', () => {
    expect(run(block('[1, 2, 3].reduce((a, b) => a + b)'))).toEqual(['6', '0']);
  });

  it('§7.2 default sort really is lexicographic', () => {
    expect(run(block('[10, 9, 100].sort()'))).toEqual(['[ 10, 100, 9 ]', '[ 9, 10, 100 ]']);
  });

  it('§7.2 fill with an object shares one reference', () => {
    expect(run(block("const grid = new Array(3).fill([])"))).toEqual([
      "[ [ 'x' ], [ 'x' ], [ 'x' ] ]",
    ]);
  });

  it('§6.3 keys() excludes inherited and non-enumerable', () => {
    expect(run(block('const parent = { inherited: 1 }'))).toEqual([
      "[ 'visible' ]", "[ 'visible', 'hidden' ]", 'true',
    ]);
  });

  it('§6.3 freeze is shallow', () => {
    expect(run(block("const config = Object.freeze({ api:"))).toEqual(['https://b.example']);
  });

  it('§7.3 forEach return acts as continue, not break', () => {
    expect(run(block('[1, 2, 3, 4].forEach(n => {'))).toEqual(['1', '2', '4']);
  });

  it('§7.3 for...in on an array yields STRING keys', () => {
    expect(run(block("const arr = ['a', 'b'];"))).toEqual([
      'string 0', 'string 1', '0', '1', 'custom',
    ]);
  });

  it('§7.3 entries() gives index and value', () => {
    expect(run(block("for (const [index, value] of ['a', 'b'].entries())"))).toEqual(['0 a', '1 b']);
  });

  it('§7.3 forEach skips holes but spread does not', () => {
    expect(run(block('const sparse = [1, , 3];'))).toEqual(['[ 1, 3 ]', '[ 1, undefined, 3 ]']);
  });

  it('Q6 event-loop ordering prints exactly what the guide claims', async () => {
    const logs: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the guide's own snippet is the point
    const fn = new Function('console', block("console.log('1 sync start');")) as (c: unknown) => void;
    fn({ log: (...a: unknown[]) => logs.push(String(a[0])) });
    await new Promise(r => setTimeout(r, 20));      // let the macrotask land
    expect(logs).toEqual([
      '1 sync start',
      '2 async body is SYNC up to the first await',
      '3 sync end',
      '4 microtask A',
      '4.5 queueMicrotask',
      '4.7 after await = a microtask',
      '5 microtask queued BY a microtask',
      '6 timeout 0',
    ]);
  });
});

/**
 * Interview Q41–Q46: each runnable block is followed by a `text` block giving
 * its output. Run the block and compare, so no output is written by hand.
 */
describe('JavaScript guide interview Q41–Q46 print their Output blocks', () => {
  const md = readSeries('javascript');
  const fmt = (a: unknown[]) => a.map(v => typeof v === 'string' ? v : inspect(v)).join(' ');

  /** Every js block in [from, to) paired with the text block right after it. */
  const pairs = (from: string, to: string) => {
    const start = md.indexOf(from);
    const end = md.indexOf(to, start);
    expect(start, `marker not found: ${from}`).toBeGreaterThan(-1);
    const region = md.slice(start, end);
    const out: { code: string; output: string[] }[] = [];
    const re = /```js\n([\s\S]*?)```\n\n```text\n([\s\S]*?)\n```/g;
    for (let m = re.exec(region); m; m = re.exec(region)) out.push({ code: m[1], output: m[2].split('\n') });
    return out;
  };

  /** Run a block with real timers, then wait for them to finish (rule 9a). */
  const run = async (code: string) => {
    const logs: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the guide's own snippet is the point
    const fn = new Function('console', code) as (c: unknown) => void;
    fn({ log: (...a: unknown[]) => logs.push(fmt(a)) });
    await new Promise(r => setTimeout(r, 150));
    return logs;
  };

  it.each([
    ['Q41', '**Q41:', '**Q42:', 1],
    ['Q42', '**Q42:', '**Q43:', 2],
    ['Q43', '**Q43:', '**Q44:', 1],
    ['Q44', '**Q44:', '**Q45:', 1],
    ['Q45', '**Q45:', '**Q46:', 6],
    ['Q46', '**Q46:', '## 16. Tricky Output Questions', 3],
  ] as const)('%s', async (_label, from, to, count) => {
    const blocks = pairs(from, to);
    expect(blocks).toHaveLength(count);
    for (const { code, output } of blocks) {
      const logs = await run(code);
      expect(logs.length, 'the block printed nothing').toBeGreaterThan(0);
      expect(logs).toEqual(output);
    }
  });
});
