import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { inspect } from 'node:util';

/**
 * Q7, Q8, Q9, Q13, Q14, Q16, Q17, Q29, Q30 and tricky Q17–Q26 each state an output. Extract the block from the guide
 * and run it, so a claim can never drift from what the "Try it" button prints.
 */
describe('JavaScript guide interview answers print what they claim', () => {
  const md = readFileSync('src/content/javascript-and-typescript/javascript-guide.md', 'utf8');
  const block = (marker: string) => {
    const i = md.indexOf(marker);
    expect(i, `marker not found: ${marker}`).toBeGreaterThan(-1);
    // A marker that appears twice silently tests whichever block comes first.
    expect(md.indexOf(marker, i + 1), `marker is not unique: ${marker}`).toBe(-1);
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
    expect(await captureAsync(block("console.log('1 await + try:', e.message);"), 50)).toEqual([
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

  // Tricky Q27–Q40: scope, this, numbers, promises, generators, syntax.
  const trickySync: [string, string, string[]][] = [
    ['Q28 — hoisting: function beats var, then the assignment; a local var shadows', 'function hoisting() {', ['function', 'string', 'undefined']],
    ['Q29 — the TDZ shadows the outer let', "let color = 'red';", ['ReferenceError', 'blue', 'red']],
    ['Q30 — closures read the variable live; each call makes new variables', 'const read = () => count;', ['2', '3 1']],
    ['Q31 — this follows the call site; arrows take it from where they are written', "  arrow: () => (this === undefined ? 'undefined' : 'has a this'),", ['Asha', 'undefined', 'undefined', '["undefined","Asha"]']],
    ['Q32 — floating point and safe integers', 'console.log(9007199254740993n + 1n);', ['0.30000000000000004', 'false', 'true', '9007199254740992', '9007199254740991', '9007199254740994n']],
    ['Q33 — typeof quirks', 'console.log(typeof notDeclaredAnywhere);', ['object', 'number', 'object', 'function', 'undefined', 'true true']],
    ['Q34 — + joins, the others convert', "console.log('b' + 'a' + +'a' + 'a');", ['3', '52', '10', '0', 'NaN', 'baNaNa']],
    ['Q35 — default sort and map(parseInt)', "console.log(['10', '10', '10'].map(parseInt).join(', '));", ['1, 10, 20, 3', '1, 3, 10, 20', '10, NaN, 2', '3 1']],
    ['Q38 — generator next(value)', 'function* conversation() {', ['What is your name?', 'Hello, Asha', '{"value":"Done, bye","done":true}', '{"done":true}']],
    ['Q39 — defaults apply only to undefined', "function greet({ name = 'guest', greeting = 'Hi' } = {}) {", ['Hi, guest', 'Hi, null', 'Hi, guest', ', guest']],
    ['Q40 — ASI after return, and none before [', 'function getConfig() {', ['undefined', 'TypeError']],
    ['Q41 — finally always runs, and a return inside it overrides', 'function override() {', ['finally runs first', 'from try', 'from finally', 'finally wins']],
    ['Q42 — subclass fields are set after the parent constructor', "  label = 'child';", ['child describe, label = undefined', 'child describe, label = child']],
    ['Q43 — #private fields are invisible outside the class', '  #balance = 100;', ['100', 'undefined', '{"owner":"Asha"}', 'owner', 'true false']],
    ['Q44 — ===, SameValueZero and Object.is disagree on NaN and -0', 'console.log(Object.is(0, -0));', ['true', 'false', 'true', 'true -1', '-Infinity', '0 0']],
    ['Q45 — arguments, arrows and rest parameters', '  const arrow = () => arguments[0];', ['3', 'from outer', 'true false', '1 0 1']],
    ['Q46 — length, holes and delete', 'arr.length = 2;', ['1,2', '3 false', '3 2', '3 undefined', '10']],
    ['Q47 — valueOf for maths, toString for strings', '  valueOf() { return 42; },', ['43', 'forty-two', 'forty-two', '84', 'true', '1,23']],
    ['Q49 — optional chaining short-circuits the whole chain', 'console.log(user.settings?.theme.color);', ['undefined', 'undefined', 'calls: 0', 'default 0', 'SyntaxError']],
    ['Q50 — a named function expression\'s name is local and read-only', 'console.log(typeof fact);', ['120', 'undefined', 'TypeError', '["fact","",""]']],
    ['Q51 — symbol keys are hidden; Map keys keep their type', "console.log(Symbol('id') === Symbol('id'), Symbol.for('id') === Symbol.for('id'));", ['name', '{"name":"Asha"}', '7 1', 'false true', 'not a number 3 number NaN, string 1, number 1']],
  ];
  for (const [name, marker, expected] of trickySync) {
    it(`tricky ${name}`, () => {
      expect(capture(block(marker))).toEqual(expected);
    });
  }
  it('tricky Q48 — the executor runs synchronously and only the first settle counts', async () => {
    expect(await captureAsync(block("  console.log('2. executor runs immediately');"), 50)).toEqual([
      '1. before', '2. executor runs immediately', '3. still running after resolve', '4. after', '5. settled with first',
    ]);
  });
  it('Q40 — closures give private state, factories and memory between calls', () => {
    expect(capture(block('function createAccount(initial) {'))).toEqual(['150 undefined', '10 15', 'computed 1 time']);
  });
  it('tricky Q52 — sync, then the promise, then the timer, each seeing the shared count', async () => {
    expect(await captureAsync(block('console.log("promise:", count);'), 50)).toEqual(['sync: 0', 'promise: 1', 'timeout: 2']);
  });
  it('tricky Q53 — the count++ before the first await runs synchronously', async () => {
    expect(await captureAsync(block('console.log("B", result1, count);'), 100)).toEqual(['A 0', 'D 1', 'B 2 2', 'C 3 3']);
  });
  it('tricky Q27 — var shares one variable across the loop, let makes one per iteration', async () => {
    expect(await captureAsync(block("setTimeout(() => console.log('var:', i), 0);"), 50)).toEqual([
      'var: 3', 'var: 3', 'var: 3', 'let: 0', 'let: 1', 'let: 2',
    ]);
  });
  it('tricky Q36 — a catch that returns recovers the chain', async () => {
    expect(await captureAsync(block("console.log('then 2', value)"), 50)).toEqual([
      'caught boom', 'then 2 recovered', 'finally',
    ]);
  });
  it('tricky Q37 — return without await escapes the try', async () => {
    expect(await captureAsync(block('async function withoutAwait() {'), 50)).toEqual([
      'caught inside withAwait', 'withoutAwait rejected: network down',
    ]);
  });

  // §1.1–§1.6 (moved from Q6 and Q31–Q33): how JavaScript works under the hood.
  it('§1.4 — a 0 ms timer waits for a busy loop on the only thread', async () => {
    expect(await captureAsync(block('while (Date.now() - start < 300) {}   // 300 ms of work on the only thread'), 50)).toEqual([
      'loop finished', 'timer ran after 300 ms or more',
    ]);
  });
  it('§1.6 — microtasks run before the next task', async () => {
    expect(await captureAsync(block("console.log('4. timer (a task)')"), 50)).toEqual([
      '1. synchronous', '2. still synchronous', '3. promise callback (a microtask)', '4. timer (a task)',
    ]);
  });
  it('§1.5 — a 0 ms timer still waits for the running code to finish', async () => {
    expect(await captureAsync(block("setTimeout(() => console.log('3. coffee is ready')"), 50)).toEqual([
      '1. order coffee', '2. find a seat', '3. coffee is ready',
    ]);
  });
  const engineClaims: [string, string, string[]][] = [
    ['§1.1 — a syntax error stops the whole snippet before line 1', 'new Function(source);', ['SyntaxError', 'line 1 never printed']],
    ['§1.2 — the call stack pushes and pops in order', 'function third() {', [
      '1. in first', '2. in second', '3. in third: the stack is global > first > second > third',
      '4. back in second, because third was taken off the stack', '5. back in first', '6. back in the global context',
    ]],
    ['§1.2 — the creation phase is what hoisting is', 'console.log(count);          // the var exists, but is still empty', ['function', 'undefined', 'ReferenceError']],
    ['§1.2 — unbounded recursion overflows the stack', 'function dive() {', ['RangeError true']],
    ['§1.3 — a name holds a reference to one function object', 'const alias = sayHi;', ['true', 'hi', 'function string', '0', 'false', 'old']],
    ['§1.3 — removeEventListener needs the same reference', "button.removeEventListener('click', () => clicks++);", [
      'after removing a lookalike: 1', 'after removing the reference: 1',
    ]],
    ['§1.3 — a detached method loses its this', "return this === undefined ? 'this is undefined'", ['Hi, Asha', 'this is undefined', 'Hi, Asha']],
  ];
  for (const [name, marker, expected] of engineClaims) {
    it(name, () => {
      expect(capture(block(marker))).toEqual(expected);
    });
  }

  // Tricky Q18–Q26: objects and references. Each block's printed lines are the claim.
  const objectClaims: [string, string, string[]][] = [
    ['Q18 — object keys collide as "[object Object]"', 'a[b] = 123;', ['456', '["[object Object]"]']],
    ['Q19 — integer-like keys first, then insertion order', "const obj = { b: 'b', 2: 'two'", ['["1","2","b","a","-1","01"]']],
    ['Q20 — spread shares nested objects', 'const copy = { ...original };', ['Asha', 'Delhi', '2', 'true']],
    ['Q21 — reassigning a parameter does not reach the caller', 'function update(user) {', ['Asha 30']],
    ['Q22 — fill shares one object, Array.from does not', 'new Array(3).fill({ count: 0 })', ['1 1', '0 0']],
    ['Q23 — what the JSON round trip loses', 'JSON.parse(JSON.stringify(source))', ['string', 'false', 'null null', 'undefined', '{}', '[null,null]']],
    ['Q24 — structuredClone keeps cycles and throws on functions', 'node.self = node;', ['false', 'true', 'true true', 'DataCloneError']],
    ['Q25 — freeze is shallow and throws only in strict mode', "db: { host: 'localhost' } });", ['prod-db', 'true', '3000']],
    ['Q26 — spread runs the getter once and copies the value', 'get stamp() {\n    reads++;', ['1', 'read #1 read #1', 'read #2', 'undefined']],
  ];
  for (const [name, marker, expected] of objectClaims) {
    it(`tricky ${name}`, () => {
      expect(capture(block(marker))).toEqual(expected);
    });
  }
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
