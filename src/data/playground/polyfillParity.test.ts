import { describe, it, expect } from 'vitest';
import { templateCategories } from './playgroundTemplates';

/**
 * A polyfill is a CLAIM that it behaves like the built-in, so check it against
 * the built-in rather than by reading it.
 *
 * Four real defects were found this way, none of which any other gate could
 * see — they are valid JavaScript that runs and produces a wrong answer:
 *   - `map` used result.push(), which DROPS holes and shortens the array.
 *   - `find`/`findIndex` skipped holes; those two methods are exactly the ones
 *     that do not.
 *   - `bind` ignored `new`, though §4.3 of the JavaScript guide states that
 *     reproducing that asymmetry is the point of the exercise.
 *   - `JSON.parse` looped FOREVER on malformed input instead of throwing,
 *     because its loops could only exit on a delimiter and never on
 *     end-of-input. In the playground that is a hung worker.
 */
/**
 * The polyfills attach themselves at runtime, so declare the shapes we exercise
 * rather than casting at every call site.
 */
declare global {
  interface Array<T> {
    myMap<U>(fn: (v: T, i: number, a: T[]) => U, thisArg?: unknown): U[];
    myFilter(fn: (v: T, i: number, a: T[]) => unknown, thisArg?: unknown): T[];
    myForEach(fn: (v: T, i: number, a: T[]) => void, thisArg?: unknown): void;
    myFind(fn: (v: T, i: number, a: T[]) => unknown, thisArg?: unknown): T | undefined;
    // Loosely typed on purpose: these are exercised against sparse arrays,
    // where TypeScript widens the element type to include undefined.
    myReduce(fn: (acc: never, v: never, i: number, a: never[]) => unknown, init?: unknown): unknown;
    myIndexOf(target: unknown, fromIndex?: number): number;
    myLastIndexOf(target: unknown, fromIndex?: number): number;
    mySlice(start?: number, end?: number): T[];
    mySplice(start?: number, deleteCount?: number, ...items: T[]): T[];
  }
  interface ObjectConstructor {
    myCreate(proto: object | null, props?: PropertyDescriptorMap): object;
  }
  interface Function {
    myBind(thisArg: unknown, ...args: unknown[]): (...rest: unknown[]) => unknown;
  }
  interface JSON {
    myParse(text: string): unknown;
    myStringify(value: unknown): string;
  }
}

const byName = new Map<string, string>();
for (const c of templateCategories) {
  if (!/Polyfill/.test(c.label)) continue;
  for (const t of c.templates) byName.set(t.name, t.code);
}

/** Load a polyfill template with console silenced; returns nothing on success. */
function load(templateName: string): void {
  const code = byName.get(templateName);
  expect(code, `template "${templateName}" not found`).toBeTruthy();
  const quiet = { log: () => {}, warn: () => {}, error: () => {}, info: () => {} };
  /* eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the
     polyfill is the entire point of this suite */
  new Function('console', code as string)(quiet);
}

// A genuine sparse array — the hole at index 1 is the whole point of several
// of these tests, so the rule against sparse literals is disabled deliberately.
// eslint-disable-next-line no-sparse-arrays -- holes are the subject here
const sparse = (): (number | undefined)[] => [1, , 3];

describe('polyfills behave like the built-ins they replace', () => {
  it('Array.map preserves holes and array length', () => {
    load('Array.map');
    const mine = sparse().myMap(x => (x ?? 0) * 2);
    const native = sparse().map(x => (x ?? 0) * 2);
    expect(mine.length).toBe(native.length);      // 3, not 2
    expect(1 in mine).toBe(1 in native);          // the hole is still a hole
    expect(mine).toEqual(native);
  });

  it('Array.find and findIndex visit holes, unlike map/filter/forEach', () => {
    load('Array.find & findIndex');
    const seen: unknown[] = [];
    sparse().myFind(x => { seen.push(x); return false; });
    const nativeSeen: unknown[] = [];
    sparse().find(x => { nativeSeen.push(x); return false; });
    expect(seen).toEqual(nativeSeen);             // [1, undefined, 3]
    expect(seen).toHaveLength(3);
  });

  it('Function.bind: new overrides the bound this and keeps instanceof', () => {
    load('Function.bind');
    function Point(this: { x: number }, x: number) { this.x = x; }
    const Bound = Point.myBind({ ignored: true }, 5) as unknown as new () => { x: number };
    const made = new Bound();
    expect(made.x).toBe(5);                       // bound `this` ignored under new
    expect(made instanceof Point).toBe(true);
    // ...while an ordinary call still uses the bound this.
    const greet = function (this: { name: string }) { return this.name; };
    const bound = greet.myBind({ name: 'A' });
    expect(bound.call({ name: 'B' })).toBe('A');
  });

  it('JSON.parse throws on malformed input instead of looping forever', () => {
    load('JSON.parse');
    const parse = (text: string) => JSON.myParse(text);
    expect(parse('{"a":1,"b":[2,null,true]}')).toEqual({ a: 1, b: [2, null, true] });
    // Each of these previously spun until the Worker timeout killed it.
    for (const bad of ['{oops}', '[1,', '', '{"a":1', '[1] extra']) {
      expect(() => parse(bad), `should reject ${JSON.stringify(bad)}`).toThrow(SyntaxError);
    }
  });

  it('JSON.stringify matches native on the values people ask about', () => {
    load('JSON.stringify');
    const s = (value: unknown) => JSON.myStringify(value);
    for (const v of [
      { a: 1, b: 'x' },
      { a: undefined, b: 1 },
      [1, undefined, 2],
      { a: NaN, b: Infinity },
      { a: { b: [1, { c: 2 }] } },
      null,
    ]) {
      expect(s(v), JSON.stringify(v) ?? 'undefined').toBe(JSON.stringify(v));
    }
  });

  it('the sparse-array family skips holes exactly where native does', () => {
    load('Array.filter');
    load('Array.forEach');
    expect(sparse().myFilter(() => true)).toEqual(sparse().filter(() => true));
    const mine: unknown[] = []; const nat: unknown[] = [];
    sparse().myForEach(x => mine.push(x));
    sparse().forEach(x => nat.push(x));
    expect(mine).toEqual(nat);
  });

  it('Array.reduce matches native, including the empty-without-initial throw', () => {
    load('Array.reduce');
    expect([1, 2, 3].myReduce((a, b) => (a as number) + (b as number))).toBe(6);
    expect([1, 2, 3].myReduce((a, b) => (a as number) + (b as number), 10)).toBe(16);
    expect(() => ([] as number[]).myReduce((a, b) => (a as number) + (b as number))).toThrow(TypeError);
  });

  it('Array.reduce with no initial value starts at the first PRESENT element', () => {
    load('Array.reduce');
    // [ , , 3] has one element; the accumulator is 3, not this[0] (undefined).
    // eslint-disable-next-line no-sparse-arrays -- holes are the subject here
    expect([, , 3].myReduce((x, y) => (x as number) + (y as number))).toBe(3);
    // An array of nothing but holes is empty as far as reduce is concerned.
    // eslint-disable-next-line no-sparse-arrays -- holes are the subject here
    expect(() => [, ,].myReduce((x, y) => (x as number) + (y as number))).toThrow(TypeError);
  });

  it('Array.indexOf and lastIndexOf skip holes', () => {
    load('Array.indexOf / lastIndexOf');
    // eslint-disable-next-line no-sparse-arrays -- holes are the subject here
    expect([, 1].myIndexOf(undefined)).toBe(-1);
    // eslint-disable-next-line no-sparse-arrays -- holes are the subject here
    expect([, 1].myIndexOf(undefined)).toBe([, 1].indexOf(undefined));
    // eslint-disable-next-line no-sparse-arrays -- holes are the subject here
    expect([1, ,].myLastIndexOf(undefined)).toBe(-1);
  });

  it('Array.splice with no arguments removes nothing', () => {
    load('Array.splice');
    const a = [1, 2, 3];
    expect(a.mySplice()).toEqual([]);     // previously threw RangeError
    expect(a).toEqual([1, 2, 3]);
  });

  it('Array.slice preserves holes, and map captures length once', () => {
    load('Array.slice');
    // eslint-disable-next-line no-sparse-arrays -- holes are the subject here
    const sliced = [1, , 3].mySlice();
    expect(1 in sliced).toBe(false);
    load('Array.map');
    // Pushing during iteration must not extend the walk.
    const grow = [1, 2, 3];
    expect(grow.myMap((v: number, i: number) => { if (i === 0) grow.push(9); return v; }))
      .toEqual([1, 2, 3]);
  });

  it('Object.create(null) really has a null prototype', () => {
    load('Object.create');
    expect(Object.getPrototypeOf(Object.myCreate(null))).toBe(null);
    const proto = { tag: 1 };
    expect(Object.getPrototypeOf(Object.myCreate(proto))).toBe(proto);
  });

  it('JSON.stringify escapes control characters, so the output re-parses', () => {
    load('JSON.stringify');
    const s = (value: unknown) => JSON.myStringify(value);
    for (const v of [{ s: 'a\nb' }, { s: 'a\tb' }, { s: 'a\rb' }, { s: 'a"b' }, { s: 'a\\b' }]) {
      expect(s(v)).toBe(JSON.stringify(v));
      expect(JSON.parse(s(v))).toEqual(v);   // a raw newline would make this throw
    }
  });

  it('JSON.parse handles \\u and the remaining escapes', () => {
    load('JSON.parse');
    const parse = (t: string) => JSON.myParse(t);
    expect(parse('"\\u0041"')).toBe('A');
    expect(parse('"a\\nb"')).toBe('a\nb');
    expect(parse('"a\\tb"')).toBe('a\tb');
    expect(parse('"a\\\\b"')).toBe('a\\b');
    expect(parse('"a\\"b"')).toBe('a"b');
  });
});
