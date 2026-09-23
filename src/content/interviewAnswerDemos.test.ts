import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { inspect } from 'node:util';

/**
 * Q7, Q8, Q9, Q13, Q14, Q16, Q17, Q29, Q30 and tricky Q17 each state an output. Extract the block from the guide
 * and run it, so a claim can never drift from what the "Try it" button prints.
 */
describe('JavaScript guide interview answers print what they claim', () => {
  const md = readFileSync('src/content/javascript-and-typescript/javascript-guide.md', 'utf8');
  const block = (marker: string) => {
    const i = md.indexOf(marker);
    expect(i, `marker not found: ${marker}`).toBeGreaterThan(-1);
    const start = md.lastIndexOf('```js\n', i) + 6;
    return md.slice(start, md.indexOf('```', start));
  };
  const capture = (snippet: string) => {
    const logs: string[] = [];
    /* eslint-disable @typescript-eslint/no-implied-eval -- running the guide's own snippets is the point */
    const fn = new Function('console', snippet) as (c: unknown) => void;
    /* eslint-enable @typescript-eslint/no-implied-eval */
    fn({
      log: (...a: unknown[]) =>
        logs.push(a.map(v => (typeof v === 'string' ? v : inspect(v))).join(' ')),
    });
    return logs;
  };
  /** Runs the snippet, then drains timers until the output stops growing. */
  const captureAsync = async (snippet: string, settle = 300) => {
    const logs = capture(snippet);
    await new Promise(r => setTimeout(r, settle));
    return logs;
  };

  it('Q8 — call, apply and bind behave as the comments say', () => {
    expect(capture(block('function describe(greeting, punctuation)'))).toEqual([
      'Hello, Alice!',
      'Hi, Alice?',
      'function',
      'Hey, Alice.',
      'Hey, Alice!', // bind wins over call — NOT Bob
      'false', // every bind() is a new function object
    ]);
  });

  it('Q8 — an arrow ignores .call', () => {
    expect(capture(block('const arrow = () => this.name;'))).toEqual(['Alice']);
  });

  it('Q8 — a sloppy-mode thisArg is boxed, and null becomes globalThis', () => {
    expect(capture(block('function whoAmI() { return this; }'))).toEqual(['object', 'true']);
  });

  it('Q13 — deref survives dropping the last strong reference', () => {
    expect(capture(block('const ref = new WeakRef(cacheKey);'))).toEqual([
      'deref -> { id: 42 }',
      'read once into a local: 42',
      'after dropping the strong ref -> { id: 42 }',
    ]);
  });

  it('Q13 — registering and unregistering a finalizer does not throw', () => {
    expect(capture(block('const registry = new FinalizationRegistry'))).toEqual([
      'registered; the callback is not guaranteed to run',
      'unregistered',
    ]);
  });

  it('Q14 — for...in sees the extra property, for...of and forEach do not', () => {
    expect(capture(block("arr.custom = 'oops';"))).toEqual([
      'for...in "0"', 'for...in "1"', 'for...in "2"', 'for...in "custom"',
      'for...of a', 'for...of b', 'for...of c',
      'forEach  0 a', 'forEach  1 b', 'forEach  2 c',
    ]);
  });

  it('Q14 — forEach does not await, for...of does', async () => {
    const claimed = block('ids.forEach(async (id)');
    expect(await captureAsync(claimed, 50)).toEqual([
      'forEach did NOT wait',
      'forEach done 1',
      'forEach done 2',
      'for...of done 1',
      'for...of done 2',
      'for...of waited',
    ]);
  });

  it('Q16 — leading fires on the first call, trailing on the last', async () => {
    const logs = await captureAsync(block("// Same implementation as above"), 400);
    expect(logs).toEqual([
      "keystrokes 'a','b','c' 30ms apart, delay = 100ms",
      "leading-only  fired with 'a'",
      "both          fired with 'a'",
      "trailing-only fired with 'c'",
      "both          fired with 'c'",
    ]);
  });

  it('Q17 — preventExtensions, seal and freeze differ exactly as tabulated', () => {
    expect(capture(block('const p = Object.preventExtensions({ a: 1 });'))).toEqual(['5', '1']);
  });

  it('Q17 — freeze is shallow', () => {
    expect(capture(block('const obj = Object.freeze({ nested: { a: 1 } });'))).toEqual(['99']);
  });

  it('Q26 — once runs the original exactly once and caches its result', () => {
    expect(capture(block('function once(fn) {'))).toEqual([
      '  expensive setup running...',
      '1st call -> {"ready":true}',
      '2nd call -> {"ready":true}',
      '3rd call -> {"ready":true}',
      'same object every time -> true',
      'times the original ran -> 1',
    ]);
  });

  it('Q26 — onceAsync shares one in-flight promise between concurrent callers', async () => {
    expect(await captureAsync(block('function onceAsync(fn) {'), 50)).toEqual([
      'all three callers got -> ["connection#1","connection#1","connection#1"]',
      'underlying calls -> 1',
    ]);
  });

  it('tricky Q12 — the three claimed lines are what actually print', () => {
    expect(capture(block('const grouped = Object.groupBy(rows, r => r.id);'))).toEqual([
      "[ '1', 'null' ]",
      '2',
      'undefined',
    ]);
  });

  it('tricky Q13 — iterator helpers are lazy and take(1) closes the chain', () => {
    const snippet = block("const chain = [1, 2, 3].values()");
    expect(capture(snippet)).toEqual([
      'nothing yet',
      'map 1',
      'filter 2',
      'map 2',
      'filter 4',
      '[ 4 ]',
    ]);
    // The guide claims a second toArray() yields [] because take(1) CLOSED the
    // upstream iterator — it previously claimed [6], which is wrong.
    const chain = [1, 2, 3]
      .values()
      .map(n => n * 2)
      .filter(n => n > 2);
    expect(chain.take(1).toArray()).toEqual([4]);
    expect(chain.toArray()).toEqual([]);
  });

  it('Q21 — Object.groupBy collides where Map.groupBy keeps identity', () => {
    expect(capture(block("const values = [1, '1'];"))).toEqual([
      'Object.groupBy -> {"1":[1,"1"]}',
      'Map.groupBy keys -> number, string',
      'Map.groupBy get(1) -> [1] get(\'1\') -> ["1"]',
      'coerced keys -> ["null","undefined"]',
    ]);
  });

  it('Q21 — a hand-rolled grouper breaks on __proto__, Object.groupBy does not', () => {
    expect(capture(block("const byHand = {};"))).toEqual([
      'hand-rolled -> TypeError',
      'keys -> ["__proto__","ok"]',
      'safe.constructor -> undefined',
      'safe.hasOwnProperty -> undefined',
      "Object.hasOwn(safe, 'ok') -> true",
    ]);
  });

  it('Q21 — the three ways a Lodash call fails on Object.groupBy', () => {
    const users = [{ role: 'admin' }];
    // 1. no iteratee shorthand
    // @ts-expect-error -- deliberately passing the Lodash shorthand
    expect(() => Object.groupBy(users, 'role')).toThrow(TypeError);
    // 2. null input is not tolerated
    // @ts-expect-error -- deliberately passing null
    expect(() => Object.groupBy(null, (u: unknown) => String(u))).toThrow(TypeError);
    // 3. a plain object is not iterable
    // @ts-expect-error -- deliberately passing a non-iterable
    expect(() => Object.groupBy({ a: 1 }, (v: unknown) => String(v))).toThrow(TypeError);
    // 4. the callback receives (element, index), not just the element
    const seen: unknown[][] = [];
    Object.groupBy(['x', 'y'], (...args: unknown[]) => {
      seen.push(args);
      return 'k';
    });
    expect(seen).toEqual([['x', 0], ['y', 1]]);
  });

  it('Q17 — deepFreeze walks the graph', () => {
    const snippet = block('function deepFreeze(obj, seen = new WeakSet())');
    expect(capture(snippet + "\nconsole.log(state.user.name);")).toEqual(['Ada']);
  });

  it('Q7 — lookup walks the chain, writes shadow it, null-prototype has none', () => {
    expect(capture(block("get label() { return 'animal named ' + this.name; }"))).toEqual([
      'true', 'false true', 'animal named Rex', 'undefined', 'false true', 'true', 'false',
    ]);
  });

  it('Q9 — spread shares the nested object; path-copying does not', () => {
    expect(capture(block('const copy = { ...state };'))).toEqual([
      'Ben', 'false true', 'Ben Cy', 'true', '1', 'true', 'string',
    ]);
  });

  it('Q29 — live binding, stale closure, retained value', () => {
    expect(capture(block('const registered = render(0);'))).toEqual([
      'live binding: 5', 'handler sees 0', 'still reachable: 1000000',
    ]);
  });

  it('Q30 — each correct handling point catches, in the stated order', async () => {
    expect(await captureAsync(block('async function withAwait()'), 50)).toEqual([
      '2 .catch: network down',
      '1 await + try: network down',
      '3 inside the callback: timer failed',
    ]);
  });

  it('tricky Q17 — a chain of resolved promises holds a 0 ms timer for the whole chain', async () => {
    expect(await captureAsync(block('chain = chain.then(() => {'), 50)).toEqual([
      'sync done', 'chain done', 'timer waited 200ms+: true',
    ]);
  });

  it('tricky Q17 — yielding to the task queue lets the timer in early', async () => {
    const logs = await captureAsync(block('const nextTask = () =>'), 400);
    expect(logs).toEqual(['timer waited under 50ms: true', 'work done']);
  });
});

describe('React guide Q64 — an unbounded memoize cache grows with zero hits', () => {
  it('prints the claimed stats', () => {
    const md = readFileSync('src/content/front-end/react-guide.md', 'utf8');
    const i = md.indexOf('const formatTime = memoize(');
    expect(i).toBeGreaterThan(-1);
    const start = md.lastIndexOf('```js\n', i) + 6;
    const snippet = md.slice(start, md.indexOf('```', start));
    const logs: string[] = [];
    /* eslint-disable @typescript-eslint/no-implied-eval -- running the guide's own snippet is the point */
    const fn = new Function('console', snippet) as (c: unknown) => void;
    /* eslint-enable @typescript-eslint/no-implied-eval */
    fn({ log: (...a: unknown[]) => logs.push(a.map(v => inspect(v)).join(' ')) });
    expect(logs).toEqual(['{ entries: 100000, hits: 0 }']);
  });
});
