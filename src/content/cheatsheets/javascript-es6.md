# JavaScript ES6+ Cheat Sheet

## let, const, var

| Feature | `var` | `let` | `const` |
|---------|-------|-------|---------|
| Scope | Function | Block | Block |
| Hoisting | Yes (undefined) | TDZ | TDZ |
| Reassign | Yes | Yes | No |
| Redeclare | Yes | No | No |

## Arrow Functions
```js
const add = (a, b) => a + b;          // implicit return
const greet = name => `Hi ${name}`;   // single param, no parens
const getObj = () => ({ key: 'val' }); // return object literal
```
**Note:** No own `this`, `arguments`, or `super`. Can't use as constructor.

## Destructuring
```js
const { name, age = 0 } = user;           // object
const { data: { items } } = response;     // nested
const [first, ...rest] = array;           // array + rest
function draw({ size = 'big', x = 0 }) {} // params
```

## Spread & Rest
```js
const merged = { ...obj1, ...obj2 };    // object spread
const copy = [...arr1, ...arr2];        // array spread
function sum(...nums) { }              // rest params
```

## Template Literals
```js
`Hello ${name}, you are ${age} years old`
`multi
 line`
```

## Promises & Async/Await
```js
// Promise chain
fetch(url).then(r => r.json()).then(data => use(data)).catch(handleError);

// Async/await
async function getData() {
  try {
    const res = await fetch(url);
    const data = await res.json();
  } catch (err) { handleError(err); }
}

// Parallel
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

## Modules
```js
export const PI = 3.14;
export default function add(a, b) { return a + b; }
import add, { PI } from './math.js';
```

## Optional Chaining & Nullish Coalescing
```js
user?.address?.city       // undefined if any is null/undefined
arr?.[0]                  // safe array access
fn?.()                    // safe function call
value ?? 'default'        // only null/undefined (not 0 or '')
```

## Map, Set, WeakMap, WeakSet

| Collection | Keys | Iterable | Garbage Collected |
|-----------|------|----------|------------------|
| Map | Any type | Yes | No |
| Set | Values (unique) | Yes | No |
| WeakMap | Objects only | No | Yes |
| WeakSet | Objects only | No | Yes |

## Array Methods Quick Ref

| Method | Returns | Mutates |
|--------|---------|---------|
| `map(fn)` | New array | No |
| `filter(fn)` | New array | No |
| `reduce(fn, init)` | Single value | No |
| `find(fn)` | First match | No |
| `some(fn)` | Boolean | No |
| `every(fn)` | Boolean | No |
| `flat(depth)` | New array | No |
| `flatMap(fn)` | New array | No |
| `sort(fn)` | Same array | **Yes** |
| `splice(i, n)` | Removed items | **Yes** |

## Classes
```js
class Animal {
  static count = 0;              // static field
  #secret = 'private';           // TRULY private (runtime-enforced)
  constructor(name) { this.name = name; Animal.count++; }
  get label() { return `<${this.name}>`; }
  speak() { return 'generic'; }
  static create(n) { return new this(n); }   // `this` = the subclass
  static { /* static init block */ }
}
class Dog extends Animal {
  speak() { return `${super.speak()} woof`; }
}
#secret in obj                   // private brand check
```

## Generators & Iterators
```js
function* gen() { yield 1; yield 2; return 3; }
const g = gen();
g.next();                        // { value: 1, done: false }
[...gen()];                      // [1, 2] — the return value is NOT included

function* flatten(xs) {
  for (const x of xs) Array.isArray(x) ? yield* flatten(x) : yield x;
}

// custom iterable
const range = { *[Symbol.iterator]() { for (let i = 0; i < 3; i++) yield i; } };
[...range];                      // [0, 1, 2]
```

## The Event Loop
```js
console.log('1');
setTimeout(() => console.log('4'), 0);        // MACROtask
Promise.resolve().then(() => console.log('3'));// MICROtask
queueMicrotask(() => console.log('3.5'));
console.log('2');
// 1, 2, 3, 3.5, 4  — the whole microtask queue drains before any macrotask
```
Order: **sync → microtasks (promises, `queueMicrotask`) → one macrotask → microtasks again → …**. `await` schedules the continuation as a microtask.

## Promise Combinators
```js
Promise.all([a, b])          // all fulfil, or reject on FIRST rejection
Promise.allSettled([a, b])   // never rejects: [{status, value|reason}, ...]
Promise.race([a, b])         // first to settle, fulfil OR reject
Promise.any([a, b])          // first to FULFIL; AggregateError if all reject
const { promise, resolve, reject } = Promise.withResolvers();   // ES2024
```

## Modern Additions (ES2020 → ES2026)
```js
arr.at(-1)                                  // last element
arr.findLast(fn)  arr.findLastIndex(fn)
arr.toSorted()  arr.toReversed()  arr.with(0, x)   // IMMUTABLE copies
Object.groupBy(items, x => x.type)          // → { type: [...] }
Map.groupBy(items, fn)
Object.hasOwn(obj, 'k')                     // safer than hasOwnProperty
structuredClone(obj)                        // deep clone incl. Map/Set/Date/cycles
Array.fromAsync(asyncIterable)
Promise.try(fn)
Error.isError(e)                            // survives cross-realm
RegExp.escape(str)
str.replaceAll('a', 'b')
new Set([1,2]).union(other).intersection(other).difference(other)
using file = open();                        // explicit resource management
await using conn = await connect();         // disposed in reverse order
Temporal.Now.plainDateISO()                 // the Date replacement
label: { if (x) break label; }              // labeled block
```

## Symbols & Well-Known Symbols
```js
const key = Symbol('desc');                 // unique, non-enumerable key
Symbol.iterator  Symbol.asyncIterator  Symbol.toPrimitive  Symbol.toStringTag
class T { get [Symbol.toStringTag]() { return 'T'; } }
```

## Proxy & Reflect
```js
const p = new Proxy(target, {
  get(t, k, r) { return k in t ? Reflect.get(t, k, r) : `no ${String(k)}`; },
  set(t, k, v) { if (typeof v !== 'number') throw new TypeError(); return Reflect.set(t, k, v); },
});
```

## Equality & Coercion
```js
0 == '0'          // true  — loose equality coerces
0 === '0'         // false
NaN === NaN       // false;  Object.is(NaN, NaN) → true
[] == false       // true  (!)
null == undefined // true;  null === undefined → false
typeof null       // 'object' — a historical bug
0.1 + 0.2         // 0.30000000000000004
```
Always `===`. The only defensible `==` is `x == null` to test both null and undefined.

## Gotchas
- Arrow functions have no own `this`, `arguments`, `super`, or `prototype` — never as methods needing `this`, never as constructors.
- `const` prevents **reassignment**, not mutation: `const a = []; a.push(1)` is fine.
- `let`/`const` are hoisted but in the **TDZ** — reading before declaration throws.
- `sort()` coerces to string by default: `[10,9,1].sort()` → `[1,10,9]`. Pass a comparator.
- `sort`, `splice`, `reverse`, `push`, `fill` **mutate**; `toSorted`, `toReversed`, `with`, `map`, `filter` don't.
- `forEach` ignores `async` callbacks and cannot be broken out of — use `for...of`.
- Spread and `Object.assign` are **shallow** — nested objects stay shared.
- `?.` short-circuits the whole chain; `??` only treats `null`/`undefined` as missing, so `0 ?? 5` is `0` but `0 || 5` is `5`.
- `JSON.stringify` drops `undefined`, functions and symbols, and turns `NaN`/`Infinity` into `null`.
- Modules are always strict mode and hoisted; `import` is static and cannot be conditional (use `import()`).
- A `for...in` loop iterates inherited enumerable keys — use `for...of` or `Object.keys`.
