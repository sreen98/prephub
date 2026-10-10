# JavaScript — Tricky Output Questions

Predict-the-output puzzles on coercion, scope, closures, `this`, promises and the event loop, each with a short explanation of why.

Part of the JavaScript series: [JavaScript Guide](/javascript/guide) · [JavaScript Interview Questions](/javascript/interview-questions) · **JavaScript Tricky Questions**

---

## Table of Contents

- [16. Tricky Output Questions](#16-tricky-output-questions)

---

## 16. Tricky Output Questions

Practice questions testing your understanding of JavaScript quirks — type coercion, reference types, and the event loop.

### Type Coercion & Comparisons

---

**Q1: Why does the chained comparison `3 > 2 > 1` return `false` even though 3, 2, and 1 appear to be in strictly decreasing order?**

```js
console.log(3 > 2 > 1);
```

**Output:** `false`

**Explanation:**

JavaScript has no chained comparison. `>` is a binary, left-associative operator, so this is `(3 > 2) > 1` → `true > 1`. Relational operators convert to numbers (`ToNumber(true)` is `1`), so it ends as `1 > 1` → `false`. By the same rule `1 < 2 < 3` is `true` only because `true < 3` is `1 < 3`. Write `3 > 2 && 2 > 1` for a range check.

---

**Q2: Why does `[] == ![]` evaluate to `true` when an empty array is truthy but also appears to be equal to its own negation?**

```js
console.log([] == ![]);
```

**Output:** `true`

**Explanation:**

Two different conversions collide: `!` uses `ToBoolean`, while `==` converts objects to primitives and then to numbers.

| Step | Expression | Rule |
|---|---|---|
| 1 | `[] == false` | every object is truthy, so `![]` is `false` (`!` binds tighter than `==`) |
| 2 | `[] == 0` | a boolean operand of `==` becomes a number |
| 3 | `"" == 0` | `ToPrimitive([])` with the `"default"` hint: `valueOf()` returns the array itself, so it falls back to `toString()`, which is `""` |
| 4 | `0 == 0` → `true` | `Number("")` is `0` |

Truthiness and `==` are separate rule sets, so one object can be truthy and loosely equal to `false`. That is why linters ban `==` on mixed types.

---

**Q3: How can `null >= 0` be `true` while both `null > 0` and `null == 0` are `false` — isn't that mathematically inconsistent?**

```js
console.log(null >= 0);
console.log(null > 0);
console.log(null == 0);
```

**Output:**
```
true
false
false
```

**Explanation:**

Relational operators and `==` use different algorithms. `>=` and `>` call `ToNumber`, and `ToNumber(null)` is `0`, so they become `0 >= 0` (`true`) and `0 > 0` (`false`). `==` has a hard-coded rule instead: `null` is loosely equal only to `null` and `undefined` (which is what makes the `x == null` idiom work), so `null == 0` is `false` with no numeric conversion at all. Avoid relational operators on values that may be `null`.

---

**Q4: Why does `NaN == NaN` return `false` when every other value in JavaScript is equal to itself?**

```js
console.log(NaN == NaN);
```

**Output:** `false`

**Explanation:**

This comes from the **IEEE 754** floating-point standard, not from JavaScript: `NaN` means "a failed computation" (`0/0`, `Math.sqrt(-1)`, `"foo" * 2`), and two failures are not assumed to be the same one. Every comparison with `NaN` is `false`, except `!=` and `!==`, which are `true`. So `x === NaN` can never detect it. Use `Number.isNaN(x)`, or `Object.is(x, NaN)` (the SameValue algorithm, which also tells `+0` from `-0`). The global `isNaN("abc")` is `true` because it converts to a number first, and `x !== x` is the old self-inequality trick.

---

**Q5: What does each of `[] + []`, `[] + {}`, `{} + []`, and `true + true` produce — and why does `{} + []` give a different answer depending on where you write it?**

```js
console.log(JSON.stringify([] + []));
console.log(JSON.stringify([] + {}));
console.log(JSON.stringify({} + []));
console.log(true + true);

// The famous `{} + []` → 0 needs `{}` at the START of a statement,
// which is what happens when you type it straight into a console.
console.log(eval('{} + []'));
```

**Output:**
```
""
"[object Object]"
"[object Object]"
2
0
```

**Explanation:**

Binary `+` calls `ToPrimitive` (hint `"default"`) on each operand, then concatenates if either result is a string and adds otherwise.

| Expression | Result | Why |
|---|---|---|
| `[] + []` | `""` | an array's `toString()` joins with commas, so this is `"" + ""` |
| `[] + {}` | `"[object Object]"` | `"" + "[object Object]"` |
| `{} + []` in `console.log(...)` | `"[object Object]"` | an argument is an expression, so `{}` is an object literal, same as the line above |
| `true + true` | `2` | no strings, so it adds: `1 + 1` |
| `eval('{} + []')` | `0` | at the start of a statement `{}` is an empty **block**, so what remains is unary `+[]`, which is `ToNumber("")` → `0` |

The famous `{} + []` → `0` is a **parsing** artefact, not a coercion one. It only reproduces at statement position (a REPL line or `eval`) and disappears anywhere a value is expected.

---

### Reference Equality

---

**Q6: Why does `{} === {}` return `false` — aren't two empty objects "the same"?**

```js
console.log({} === {});
console.log([] === []);
```

**Output:**
```
false
false
```

**Explanation:**

Primitives (string, number, boolean, null, undefined, symbol, bigint) compare **by value**; objects, arrays and functions compare **by reference**. Every literal (`{}`, `[]`, `() => {}`) allocates a fresh object, so two of them are never `===`, however similar. To compare contents you need structural equality: lodash `isEqual`, or `JSON.stringify(a) === JSON.stringify(b)` for simple data (brittle: it ignores `undefined`, functions and symbols, and throws on cycles).

---

### Async / Event Loop (Advanced)

These questions test your understanding of the execution order between synchronous code, microtasks (Promises, await), and macrotasks (setTimeout). The model is in [§11](/javascript/guide#11-the-event-loop): run the synchronous code, drain **every** microtask, run **one** macrotask, drain microtasks again, repeat.

---

**Q7: In what order will `"A"`, `"B"`, and `"C"` print when an async function logs `"A"`, awaits a resolved promise, then logs `"B"`, and the calling code logs `"C"` after invoking the function?**

```js
async function test() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}
test();
console.log("C");
```

**Output:**
```
A
C
B
```

**Explanation:**

An `async` function runs synchronously until its first `await`, so `A` prints during the call. The `await` **always** suspends, even on an already-resolved promise, and queues the rest of the function as a microtask. `C` runs first, then the microtask prints `B`. → [§11](/javascript/guide#11-the-event-loop)

---

**Q8: When a `console.log(3)` happens before an `async` function is called and `console.log(4)` happens after, in what order do `1`, `2`, `3`, and `4` appear?**

```js
async function test() {
  console.log(1);
  await Promise.resolve();
  console.log(2);
}

console.log(3);
test();
console.log(4);
```

**Output:**
```
3
1
4
2
```

**Explanation:**

Calling `test()` defers only the part **after** `await`. So `1` prints inside the synchronous pass, between `3` and `4`, and `2` waits for the microtask drain after the script ends.

---

**Q9: Given a `setTimeout` that internally schedules a Promise, plus a top-level Promise and surrounding synchronous logs, what is the exact printing order?**

```js
console.log("A");

setTimeout(() => {
  console.log("B");
  Promise.resolve().then(() => console.log("C"));
}, 0);

Promise.resolve().then(() => console.log("D"));

console.log("E");
```

**Output:**
```
A
E
D
B
C
```

**Explanation:**

| Phase | Prints | Why |
|---|---|---|
| synchronous | `A`, `E` | the timer and the `.then` are only registered |
| microtask drain | `D` | microtasks run before any macrotask, so a `0ms` timer still waits |
| macrotask | `B` | the timer callback queues a new microtask |
| microtask drain | `C` | every macrotask is followed by its own microtask drain |

Microtasks are promise callbacks, `queueMicrotask` and `MutationObserver`; macrotasks are `setTimeout`, `setInterval` and I/O. → [§11](/javascript/guide#11-the-event-loop)

---

**Q10: When an `async` function with `await` is called and then a separate `Promise.then()` is chained afterwards, which one's callback runs first in the microtask queue?**

```js
async function foo() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}

console.log("C");
foo();
Promise.resolve().then(() => console.log("D"));
console.log("E");
```

**Output:**
```
C
A
E
B
D
```

**Explanation:**

The microtask queue is FIFO, and `await` and `.then()` have equal priority. `foo()` reaches its `await` first, so its continuation (`B`) is queued before the `.then` callback (`D`). Call `foo()` after the `.then()` line and the last two flip to `D, B`.

---

**Q11: Given a mix of synchronous logs, a `setTimeout`, an `async` function with `await`, and a `Promise.then`, what is the full execution order from start to finish?**

```js
console.log("1");

setTimeout(() => console.log("2"), 0);

async function foo() {
  console.log("3");
  await Promise.resolve();
  console.log("4");
}

foo();

Promise.resolve().then(() => console.log("5"));

console.log("6");
```

**Output:**
```
1
3
6
4
5
2
```

**Explanation:**

Synchronous logs first, in source order (`1`, `3` from inside `foo` before its `await`, `6`). Then the microtasks in the order they were queued (`4` from the `await`, then `5`). The `setTimeout` callback, despite its `0ms` delay, is a macrotask and runs last (`2`).

---

### Modern JavaScript (ES2022–ES2026)

---

**Q12: Grouping three rows by `id` with `Object.groupBy` produces only two keys and the result has no `hasOwnProperty` — why?**

```js
const rows = [{ id: 1 }, { id: '1' }, { id: null }];
const grouped = Object.groupBy(rows, r => r.id);

console.log(Object.keys(grouped));
console.log(grouped['1'].length);
console.log(grouped.hasOwnProperty);
```

**Output:**
```
[ '1', 'null' ]
2
undefined
```

**Explanation:**

`Object.groupBy` (ES2024) calls the callback on each item to get a group name and returns an object of arrays, e.g. `Object.groupBy(people, p => p.city)` → `{ London: [...], Paris: [...] }`.

| Line | Prints | Why |
|---|---|---|
| `Object.keys(grouped)` | `[ '1', 'null' ]` | keys go through `ToPropertyKey`, so the number `1` and the string `'1'` are the same key, and `null` becomes the string `'null'` (`undefined` would become `'undefined'`) |
| `grouped['1'].length` | `2` | that one group holds both rows |
| `grouped.hasOwnProperty` | `undefined` | the result is created with a **`null` prototype** (`Object.create(null)`), so it inherits nothing; `String(grouped)` even throws |

The null prototype is for safety: a group named `"__proto__"` or `"constructor"` can't corrupt anything, which the hand-written `reduce` this replaces could. Check keys with `Object.hasOwn(grouped, key)`. For keys that must keep their type, `Map.groupBy` compares with SameValueZero and gives three entries: `1`, `'1'` and `null`. → [§9.7](/javascript/guide#97-grouping-and-the-new-set-methods)

---

**Q13: Why do the `map` and `filter` side effects interleave here, instead of all the `map` logs coming first?**

```js
const chain = [1, 2, 3].values()
  .map(n => { console.log('map', n); return n * 2; })
  .filter(n => { console.log('filter', n); return n > 2; });

console.log('nothing yet');
console.log(chain.take(1).toArray());
```

**Output:**
```
nothing yet
map 1
filter 2
map 2
filter 4
[ 4 ]
```

**Explanation:**

`.values()` returns an iterator, and ES2025 iterator helpers (`map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray`, …) are **lazy** and pull-based.

| Prints | Why |
|---|---|
| `nothing yet` | building the chain only recorded the callbacks |
| `map 1` / `filter 2` | `toArray()` pulls one value through the whole pipeline: `1` → `2`, rejected |
| `map 2` / `filter 4` | the next value: `2` → `4`, accepted |
| `[ 4 ]` | `take(1)` is satisfied, so `3` is never touched |

An array chain would print all three `map` lines first. One more trap: on reaching its limit, `take(1)` **closes** the iterator below it (through its `return()` method), so a second `chain.toArray()` returns `[]`, not `[6]`. A bare array iterator has no `return()` and would survive; rely on neither. → [§9.8](/javascript/guide#98-iterator-helpers-lazy-array-methods-for-anything-iterable)

---

**Q14: In what order do the disposals run when the function body throws?**

```js
function make(name) {
  return { [Symbol.dispose]() { console.log('dispose', name); } };
}

function run() {
  using a = make('a');
  using b = make('b');
  console.log('body');
  throw new Error('boom');
}

try { run(); } catch (e) { console.log('caught', e.message); }
```

**Output:**
```
body
dispose b
dispose a
caught boom
```

**Explanation:**

`using` (explicit resource management, ES2027) calls the value's `[Symbol.dispose]()` when the block exits, like Python's `with` or C#'s `using`. Disposal is **LIFO**: `b` was declared last, so it goes first, because it may depend on `a` (a transaction opened on a connection). It also runs **before** the error leaves the function, exactly like `finally`, so both `dispose` lines print before `caught boom`.

Related traps:

- `using` bindings are implicitly `const`; reassigning one is a syntax error.
- `null` and `undefined` are skipped silently; any other value without `[Symbol.dispose]` throws a `TypeError` at the declaration.
- If a dispose method throws while the scope is already unwinding from an error, the errors are combined into a `SuppressedError`.
- An async resource needs `await using`, which calls `[Symbol.asyncDispose]` and awaits it. Plain `using` would not wait for the teardown.

→ [§9.9](/javascript/guide#99-explicit-resource-management-using-and-await-using)

---

**Q15: Why does the date not change on the first log, and why is the second result February 28 rather than March 3?**

```js
const d = Temporal.PlainDate.from('2026-01-31');
d.add({ months: 1 });
console.log(d.toString());

console.log(Temporal.PlainDate.from('2026-01-31').add({ months: 1 }).toString());

const legacy = new Date(Date.UTC(2026, 0, 31));   // UTC, so the printed date is the same in every time zone
legacy.setUTCMonth(legacy.getUTCMonth() + 1);
console.log(legacy.toISOString().slice(0, 10));
```

**Output:**
```
2026-01-31
2026-02-28
2026-03-03
```

**Explanation:**

`Temporal` (ES2027) replaces `Date`; `Temporal.PlainDate` is a calendar date with no time or time zone.

| Prints | Why |
|---|---|
| `2026-01-31` | Temporal objects are **immutable**: `add`, `subtract`, `with` and `round` return a new object, and line 2 threw it away |
| `2026-02-28` | February has no 31st, so the default `overflow: 'constrain'` **clamps** to the last valid day |
| `2026-03-03` | `Date` **overflows** instead: "February 31" rolls into March (2026 is not a leap year) |

Pass `{ overflow: 'reject' }` to get a `RangeError` instead of the clamp. Clamping makes date arithmetic irreversible: `2026-01-31` plus one month minus one month is `2026-01-28`. The demo uses the UTC `Date` methods on purpose: `new Date(2026, 0, 31)` is local midnight while `toISOString()` prints UTC, so east of Greenwich (India, say) it would print `2026-03-02`. → [§9.10](/javascript/guide#910-the-temporal-api-the-replacement-for-date)

---

**Q16: Why does this take about 60 ms rather than about 30 ms, and why is the result in source order?**

```js
async function* gen() {
  for (const ms of [30, 10, 20]) {
    await new Promise(r => setTimeout(r, ms));
    console.log('yield', ms);
    yield ms;
  }
}

const t = Date.now();
const out = await Array.fromAsync(gen());
// Well above the ~30 ms a parallel run would take. Not ">= 60": a timer can
// fire a millisecond early by Date.now(), which makes an exact bound flaky.
console.log(out, Date.now() - t >= 50);
```

**Output:**
```
yield 30
yield 10
yield 20
[ 30, 10, 20 ] true
```

**Explanation:**

`Array.fromAsync` (ES2026) is a `for await…of` collecting loop, not "`Promise.all` for async iterables". An async generator is serial by construction: it cannot produce its third value before its second, so the time is the **sum** of the delays (30 + 10 + 20 ≈ 60 ms). Sequential is what you need for paginated fetching, where page 2's cursor comes from page 1. For independent work, use `Promise.all` over a mapped array (≈ 30 ms here) or a bounded concurrency pool.

Given a **sync** iterable of promises, `Array.fromAsync([p1, p2, p3])` awaits them one at a time, but they are already running, so three 50 ms timers finish in about 50 ms, not 150. The real differences from `Promise.all` are that it does **not fail fast** (it keeps waiting on `p1` after `p2` has rejected) and that `p2`'s rejection has no handler yet while `p1` is awaited, so it fires `unhandledRejection`. In Node that crashes the process even when the `await` sits inside `try/catch`.

---

### Async Performance

**Q17: Promises are asynchronous, so how can a chain of already-resolved Promises freeze the UI?**

```js
const start = Date.now();
setTimeout(() => console.log('timer waited 200ms+:', Date.now() - start >= 200), 0);

let chain = Promise.resolve();
for (let i = 0; i < 20; i++) {
  chain = chain.then(() => {
    const t = Date.now();
    while (Date.now() - t < 10) {}   // 10 ms of real work per step
  });
}
chain.then(() => console.log('chain done'));
console.log('sync done');
```

**Output:**
```
sync done
chain done
timer waited 200ms+: true
```

**Explanation:**

"Asynchronous" means *later*, not *on another thread*: `.then` callbacks run on the main thread. The engine drains **every** microtask, including ones queued during the drain, before it runs a timer, handles a click or paints. So the 20 steps run back to back, and the 0 ms timer waits the full 200 ms, although no single function ran longer than 10 ms. A microtask that re-queues itself (`function starve() { Promise.resolve().then(starve); }`) freezes the page for good.

The fix is to yield to the **task** queue between steps:

```js
const start = Date.now();
setTimeout(() => console.log('timer waited under 50ms:', Date.now() - start < 50), 0);

const nextTask = () => new Promise(resolve => setTimeout(resolve, 0));

async function work() {
  for (let i = 0; i < 20; i++) {
    const t = Date.now();
    while (Date.now() - t < 10) {}   // same 10 ms per step
    await nextTask();                // give the browser a turn
  }
  console.log('work done');
}
work();
```

Now input, timers and paint can run between steps, and the timer fires after about one step. In modern Chromium, `await scheduler.yield()` does the same and resumes your work at the front of the queue. Genuinely heavy work (parsing, image processing) belongs in a **Web Worker**, which is a real second thread.

---

### Objects & References (Deep Dive)

These build on Q6. Each one turns on the same question: is this a new object, or another reference to one that already exists?

**Q18: Two different objects are used as keys, so why does `a[b]` print `456` and why is there only one key?**

```js
const a = {};
const b = { key: 'b' };
const c = { key: 'c' };

a[b] = 123;
a[c] = 456;

console.log(a[b]);
console.log(JSON.stringify(Object.keys(a)));
```

**Output:**
```
456
["[object Object]"]
```

**Explanation:**

Plain-object keys are only strings or symbols, so any other key is converted to a string. Every plain object becomes `"[object Object]"`, so `b` and `c` are the same key, and `a[c] = 456` overwrote `a[b]`. The same conversion makes `obj[1]` and `obj['1']` one property, and `obj[[1, 2]]` is `obj['1,2']`. Use a `Map`, which compares keys by identity:

```js
const m = new Map();
const b = { key: 'b' };
const c = { key: 'c' };
m.set(b, 123);
m.set(c, 456);
console.log(m.get(b), m.size); // 123 2
```

---

**Q19: In what order does `Object.keys` return these keys, and why is it not the order they were written?**

```js
const obj = { b: 'b', 2: 'two', a: 'a', 1: 'one', '-1': 'minus one', '01': 'zero one' };
console.log(JSON.stringify(Object.keys(obj)));
```

**Output:**
```
["1","2","b","a","-1","01"]
```

**Explanation:**

`Object.keys`, `for...in`, `Object.entries` and `JSON.stringify` list **integer-like keys first, in ascending order**, then other string keys in insertion order. (Symbol keys come last, and only `Reflect.ownKeys` and `Object.getOwnPropertySymbols` show them.) "Integer-like" means a *canonical* non-negative integer: `"-1"` is negative, and `"01"` round-trips to `"1"`, so both stay with the ordinary strings. In practice an id-keyed lookup like `{ 30: …, 10: …, 20: … }` comes back as `10, 20, 30`; use an array or a `Map` when order matters.

---

**Q20: The copy was made with spread, so why did changing the copy's city and tags change the original, but changing its name did not?**

```js
const original = { name: 'Asha', address: { city: 'Pune' }, tags: ['admin'] };
const copy = { ...original };

copy.name = 'Ravi';
copy.address.city = 'Delhi';
copy.tags.push('editor');

console.log(original.name);
console.log(original.address.city);
console.log(original.tags.length);
console.log(copy.address === original.address);
```

**Output:**
```
Asha
Delhi
2
true
```

**Explanation:**

| Line | Why |
|---|---|
| `Asha` | `name` is a string; reassigning it on the copy touches only the copy |
| `Delhi` | `address` was copied as a **reference**, so both objects share it |
| `2` | `tags` is the same array in both |
| `true` | proof that the nested object is shared |

Spread is a **shallow** copy: assigning a property of the copy is safe, mutating something it points to is not. To change a nested value, copy each level on the path, as React and Redux updates do:

```js
const original = { name: 'Asha', address: { city: 'Pune' } };
const updated = { ...original, address: { ...original.address, city: 'Delhi' } };
console.log(original.address.city, updated.address.city); // Pune Delhi
```

For a full independent copy of plain data, use `structuredClone(original)` (Q24).

---

**Q21: The function sets `age` to 30 and later to 100, so why does the original end up with 30 and not 100?**

```js
function update(user) {
  user.age = 30;
  user = { name: 'New', age: 99 };
  user.age = 100;
}

const person = { name: 'Asha', age: 25 };
update(person);

console.log(person.name, person.age);
```

**Output:**
```
Asha 30
```

**Explanation:**

Arguments are passed by value, and an object's value is a reference (*pass by sharing*). `user.age = 30` **mutates** the shared object, so `person` sees it. `user = {...}` only **reassigns** the local variable to a new object, and `user.age = 100` changes that new object, which is discarded. A function cannot replace the caller's object; return a new one and let the caller assign it.

---

**Q22: Only `grid[0]` was incremented, so why did `grid[1]` and `grid[2]` change too, and why does `Array.from` not have the problem?**

```js
const grid = new Array(3).fill({ count: 0 });
grid[0].count++;
console.log(grid[1].count, grid[2].count);

const fixed = Array.from({ length: 3 }, () => ({ count: 0 }));
fixed[0].count++;
console.log(fixed[1].count, fixed[2].count);
```

**Output:**
```
1 1
0 0
```

**Explanation:**

`fill(value)` evaluates its argument **once** and puts that one object in every slot, so there is only one `count`. `new Array(3).fill([])` is the classic 2D-grid bug: one inner array, so setting a cell sets the whole column. `Array.from` takes a **factory function** and calls it per slot, as does `new Array(3).fill().map(() => ({ count: 0 }))`. The parentheses around `{ count: 0 }` stop the arrow reading `{` as a function body.

---

**Q23: Why is `JSON.parse(JSON.stringify(obj))` not a real deep clone? Predict what survives.**

```js
const source = {
  when: new Date(0),
  missing: undefined,
  notANumber: NaN,
  big: Infinity,
  greet() { return 'hi'; },
  roles: new Map([['admin', true]]),
  list: [undefined, () => 1],
};

const clone = JSON.parse(JSON.stringify(source));

console.log(typeof clone.when);
console.log('missing' in clone);
console.log(clone.notANumber, clone.big);
console.log(typeof clone.greet);
console.log(JSON.stringify(clone.roles));
console.log(JSON.stringify(clone.list));
```

**Output:**
```
string
false
null null
undefined
{}
[null,null]
```

**Explanation:**

| Line | What happened |
|---|---|
| `string` | a `Date` becomes an ISO string and never turns back into a `Date` |
| `false` | a property whose value is `undefined` is dropped |
| `null null` | `NaN` and `Infinity` are not valid JSON numbers |
| `undefined` | functions and methods are dropped |
| `{}` | a `Map` (or `Set`) has no enumerable own properties |
| `[null,null]` | inside an array, `undefined` and functions become `null`, since dropping them would shift indexes |

All of that happens **silently**; the bug shows up later as `TypeError: clone.when.getTime is not a function`. Two cases do throw: a cycle (`TypeError: Converting circular structure to JSON`) and a `BigInt` (`TypeError: Do not know how to serialize a BigInt`). Use the round trip only for data that is already JSON-shaped; otherwise use `structuredClone` (Q24).

---

**Q24: `structuredClone` copies an object that contains itself. What does the copy's `self` point to, and what happens with a method?**

```js
const node = { name: 'root', when: new Date(0), tags: new Set(['a']) };
node.self = node;

const copy = structuredClone(node);

console.log(copy === node);
console.log(copy.self === copy);
console.log(copy.when instanceof Date, copy.tags.has('a'));

try {
  structuredClone({ run() {} });
} catch (err) {
  console.log(err.name);
}
```

**Output:**
```
false
true
true true
DataCloneError
```

**Explanation:**

| Line | Why |
|---|---|
| `false` | the clone is a new object |
| `true` | the cycle is recreated **inside the copy**: `copy.self` points to `copy`, not `node` |
| `true true` | `Date` and `Set` survive as real instances |
| `DataCloneError` | functions cannot be cloned, and it throws rather than dropping them |

`structuredClone` (browsers and Node 17+) uses the algorithm `postMessage` uses to send data to a Web Worker, so it handles `Date`, `Map`, `Set`, `RegExp`, typed arrays, `Blob`, `Error` and more. It remembers every object it has copied, so cycles and shared references are preserved. Its limits: functions and DOM nodes throw, **class instances lose their class** (plain object, no methods, `instanceof` is `false`), and getters are run, not copied.

---

**Q25: The object is frozen, so why could `db.host` be changed while `port` could not?**

```js
'use strict';

const config = Object.freeze({ port: 3000, db: { host: 'localhost' } });

config.db.host = 'prod-db';
console.log(config.db.host);

try {
  config.port = 8080;
} catch (err) {
  console.log(err instanceof TypeError);
}
console.log(config.port);
```

**Output:**
```
prod-db
true
3000
```

**Explanation:**

| Line | Why |
|---|---|
| `prod-db` | `Object.freeze` is **shallow**: `config.db` can't be repointed, but the object it points to isn't frozen |
| `true` | writing a frozen property throws a `TypeError` in strict mode |
| `3000` | the write never happened |

The `'use strict'` line matters. Modules and `class` bodies are always strict; in sloppy mode the same write fails **silently**, so the `true` line disappears. To freeze all the way down, recurse (the `deepFreeze` in [interview Q17](/javascript/interview-questions)). TypeScript's `as const` is deep, but only at compile time.

---

**Q26: Why did the getter run once during the spread and never again when reading `copy.stamp`?**

```js
let reads = 0;
const source = {
  get stamp() {
    reads++;
    return 'read #' + reads;
  },
};

const copy = { ...source };

console.log(reads);
console.log(copy.stamp, copy.stamp);
console.log(source.stamp);
console.log(typeof Object.getOwnPropertyDescriptor(copy, 'stamp').get);
```

**Output:**
```
1
read #1 read #1
read #2
undefined
```

**Explanation:**

| Line | Why |
|---|---|
| `1` | the spread **read** `source.stamp`, which ran the getter once |
| `read #1 read #1` | the copy holds that value as a plain data property |
| `read #2` | the original still has the getter |
| `undefined` | the copy's `stamp` has no `get` function |

Spread and `Object.assign` copy by reading and writing, so a live getter (`get total()` on a cart, `get isExpired()` on a token) becomes a frozen snapshot, and a getter that throws makes the spread throw. To keep the getter, copy the descriptors:

```js
let reads = 0;
const source = { get stamp() { reads++; return 'read #' + reads; } };
const live = Object.defineProperties({}, Object.getOwnPropertyDescriptors(source));
console.log(live.stamp, live.stamp); // read #1 read #2
```

---

### Scope, Hoisting & Closures

The questions interviewers ask most often of all. Each one comes down to *when* a variable is created and *which* variable a function is looking at.

**Q27: Why do the `var` timers all print 3, while the `let` timers print 0, 1 and 2?**

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var:', i), 0);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let:', j), 0);
}
```

**Output:**
```text
var: 3
var: 3
var: 3
let: 0
let: 1
let: 2
```

**Explanation:**

The timers run after both loops finish, and each arrow remembers a **variable**, not a value. `var` is function-scoped, so all three callbacks share one `i`, which the loop left at `3`. A `for` loop with `let` creates a fresh `j` per iteration, so each callback has its own. Before 2015 the fix was an IIFE per iteration: `(function (k) { setTimeout(() => console.log(k)); })(i)`. → [§5.3](/javascript/guide#53-classic-closure-gotcha)

---

**Q28: What does `typeof greet` print before and after the assignment, and why does `show()` print `undefined` instead of `1`?**

```js
function hoisting() {
  console.log(typeof greet);
  var greet = 'hello';
  function greet() {}
  console.log(typeof greet);
}
hoisting();

var x = 1;
function show() {
  console.log(x);
  var x = 2;
}
show();
```

**Output:**
```text
function
string
undefined
```

**Explanation:**

Before a scope runs, its declarations are set up ([hoisting, §3.2](/javascript/guide#32-hoisting)): function declarations are ready, `var`s exist as `undefined`; assignments happen when their line runs.

| Line | Why |
|---|---|
| `function` | during setup the function declaration wins |
| `string` | then `var greet = 'hello'` runs its assignment |
| `undefined` | `show`'s own `var x` is hoisted to the top of `show` and **shadows** the outer `x` for the whole function, even above the declaration |

With `let` the second case would throw instead (Q29), which is the safer failure. At the top level of an ES module the first half is a `SyntaxError` (a `var` and a function with the same name), which is why the demo wraps it in a function.

---

**Q29: Why does reading `color` throw inside the block, when there is a perfectly good `color` outside it?**

```js
let color = 'red';
{
  try {
    console.log(color);
  } catch (err) {
    console.log(err.name);
  }
  let color = 'blue';
  console.log(color);
}
console.log(color);
```

**Output:**
```text
ReferenceError
blue
red
```

**Explanation:**

The inner `let color` is hoisted to the top of the block but **not initialised**, so for the whole block `color` means the inner variable, and reading it before its line throws. That gap is the **temporal dead zone** (TDZ). After the `let` line it is `blue`; outside the block the outer `red` was never touched. It is the same shadowing as `var` in Q28, but with an error at the right line instead of a silent `undefined`.

---

**Q30: Why does `read()` print 2, and why do the two counters not share a count?**

```js
let count = 1;
const read = () => count;
count = 2;
console.log(read());

function makeCounter() {
  let n = 0;
  return () => ++n;
}
const a = makeCounter();
const b = makeCounter();
a(); a();
console.log(a(), b());
```

**Output:**
```text
2
3 1
```

**Explanation:**

| Line | Why |
|---|---|
| `2` | a closure links to the **variable**, and reads it when called, by which time `count` is `2` |
| `3 1` | each `makeCounter()` call creates its own `n`; `a` is on its third call, `b` on its first |

The first fact is why closures see fresh values (and keep objects alive, [interview Q25](/javascript/interview-questions)); the second gives each instance private state, as in the module pattern and React hooks. A closure shows a *stale* value only when it holds an old variable that has since been replaced, such as a previous render's state ([interview Q29](/javascript/interview-questions)).

---

### `this`

`this` is decided by **how a function is called**, not where it is written, except in arrow functions, which never have their own. The demo uses `'use strict'` so that plain calls get `undefined` rather than the global object; it does **not** change top-level `this`, which depends on how the file is loaded (see the `user.arrow()` row).

**Q31: Why does `this.name` work in `regular()`, but not in `arrow()`, not after the method is copied into a variable, and not in the inner `function`?**

```js
'use strict';

const user = {
  name: 'Asha',
  regular() { return this === undefined ? 'undefined' : this.name; },
  arrow: () => (this === undefined ? 'undefined' : 'has a this'),
  later() {
    const inner = function () { return this === undefined ? 'undefined' : this.name; };
    const innerArrow = () => this.name;
    return [inner(), innerArrow()];
  },
};

console.log(user.regular());
console.log(user.arrow());
const detached = user.regular;
console.log(detached());
console.log(JSON.stringify(user.later()));
```

**Output** (in an ES module and in Try it; a classic `<script>` or a Node CommonJS file prints `has a this` on the second line):
```text
Asha
undefined
undefined
["undefined","Asha"]
```

**Explanation:**

A normal function gets `this` from the object **before the dot at the call site**; an arrow uses the `this` of **where it was written**.

| Call | `this` | Why |
|---|---|---|
| `user.regular()` | `user` → `Asha` | called as `user.something()` |
| `user.arrow()` | top-level `this` | an object literal is not a scope, so the arrow sees the top-level `this`: `undefined` in an ES module, `window` in a classic browser script, `module.exports` in CommonJS. Try it prints `undefined` because it runs your code as a `new Function` body, and `'use strict'` makes that function strict |
| `detached()` | `undefined` | same function, called with nothing before the dot |
| `inner()` | `undefined` | a plain call of a normal function |
| `innerArrow()` | `user` → `Asha` | uses `later`'s `this`, and `later` was called as `user.later()` |

The last row is why arrows exist: callbacks inside a method (`array.map(...)`, `setTimeout(...)`) can use the method's `this` without `const self = this` or `.bind(this)`. Without `'use strict'`, the plain calls get the global object instead of `undefined`, and in a browser `window.name` (often `''`) produces confusing output rather than an error. Never use an arrow as a method that needs `this`. → [§4.3](/javascript/guide#43-this-keyword), [§1.3](/javascript/guide#13-function-references-functions-are-values)

---

### Numbers, Types & Coercion

Short puzzles interviewers use as warm-ups. Each one has a single rule behind it.

**Q32: Why is `0.1 + 0.2` not `0.3`, and why does `9007199254740993` print as `9007199254740992`?**

```js
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);
console.log(9007199254740993);
console.log(Number.MAX_SAFE_INTEGER);
console.log(9007199254740993n + 1n);
```

**Output:**
```text
0.30000000000000004
false
true
9007199254740992
9007199254740991
9007199254740994n
```

**Explanation:**

Numbers are 64-bit IEEE 754 floats (Python, Java and C behave the same way).

| Line | Why |
|---|---|
| `0.30000000000000004` | `0.1` and `0.2` are stored as the nearest binary values, and the small errors add up |
| `false` | so the sum is not the stored `0.3` |
| `true` | compare with a tolerance: `Number.EPSILON` is the gap between 1 and the next representable number |
| `9007199254740992` | above 2⁵³ not every integer is representable, so it rounds to the even neighbour |
| `9007199254740991` | `Number.MAX_SAFE_INTEGER`: every integer up to here is exact |
| `9007199254740994n` | `BigInt` is exact at any size |

Keep **money** in integer cents (`1999`, not `19.99`), as the Shopping Cart template does. Keep database **IDs** that can exceed 2⁵³ as strings or `BigInt`, because `JSON.parse` silently rounds them.

---

**Q33: What does `typeof` return for `null`, `NaN`, an array, a class, and a variable that was never declared?**

```js
console.log(typeof null);
console.log(typeof NaN);
console.log(typeof []);
console.log(typeof class {});
console.log(typeof notDeclaredAnywhere);
console.log(Array.isArray([]), Number.isNaN(NaN));
```

**Output:**
```text
object
number
object
function
undefined
true true
```

**Explanation:**

| Line | Why |
|---|---|
| `object` for `null` | a bug from 1995 that can't be fixed without breaking the web; test with `=== null` |
| `number` for `NaN` | it is the number type's "failed arithmetic" value (`0 / 0`) |
| `object` for `[]` | arrays are objects; use `Array.isArray` |
| `function` for a class | a class is a function underneath ([§6](/javascript/guide#6-objects-and-prototypes)) |
| `undefined` for an undeclared name | `typeof` is the one read of an undeclared name that doesn't throw, hence `typeof window !== 'undefined'` to detect a browser |
| `true true` | the reliable checks; the global `isNaN('a')` converts first and says `true` |

Exception: `typeof` **does** throw on a `let`/`const` in its temporal dead zone (Q29), because that name is declared, just not ready.

---

**Q34: Why does `'5' - 2` give 3 but `'5' + 2` give `'52'`, and where does `'baNaNa'` come from?**

```js
console.log('5' - 2);
console.log('5' + 2);
console.log('5' * '2');
console.log(+'');
console.log(+'a');
console.log('b' + 'a' + +'a' + 'a');
```

**Output:**
```text
3
52
10
0
NaN
baNaNa
```

**Explanation:**

`+` joins if either side is a string; `-`, `*` and `/` only do maths, so they convert to numbers. A **unary** `+` converts to a number: `+''` is `0` and `+'a'` is `NaN`. So the last line is `'ba' + NaN + 'a'`. The practical version: form inputs and URL params are strings, so `input.value + 1` joins. Convert with `Number(value)` and check with `Number.isNaN`.

---

**Q35: Why does `sort()` put 10 before 3, and why does `map(parseInt)` return `NaN` in the middle?**

```js
console.log([10, 1, 3, 20].sort().join(', '));
console.log([10, 1, 3, 20].sort((a, b) => a - b).join(', '));
console.log(['10', '10', '10'].map(parseInt).join(', '));
console.log(Array(3).length, Array.of(3).length);
```

**Output:**
```text
1, 10, 20, 3
1, 3, 10, 20
10, NaN, 2
3 1
```

**Explanation:**

| Line | Why |
|---|---|
| `1, 10, 20, 3` | with no comparator, `sort` compares items as **strings**, and `'10'` < `'3'` |
| `1, 3, 10, 20` | `(a, b) => a - b` gives a numeric order |
| `10, NaN, 2` | `map` passes `(value, index, array)`, and the second argument, the index, becomes `parseInt`'s **radix**: `parseInt('10', 0)` = 10 (0 means auto), `parseInt('10', 1)` = NaN (no base 1), `parseInt('10', 2)` = 2 |
| `3 1` | `Array(3)` is an empty array of length 3; `Array.of(3)` is `[3]` |

`sort` also mutates the array (`toSorted()` returns a copy), and `['1', '2'].map(Number)` is safe because `Number` takes one argument.

---

### Promises & Generators

The event-loop questions above are about *order*. These are about *values*: what a promise chain or a generator actually hands you back.

**Q36: The chain starts with a rejection, so why does the second `then` run, and with what value?**

```js
Promise.reject(new Error('boom'))
  .then(() => console.log('then 1'))
  .catch((err) => {
    console.log('caught', err.message);
    return 'recovered';
  })
  .then((value) => console.log('then 2', value))
  .finally(() => console.log('finally'));
```

**Output:**
```text
caught boom
then 2 recovered
finally
```

**Explanation:**

The rejection skips `then 1`. A `.catch` that returns normally **recovers** the chain, so its return value becomes the next step's success value, and `.finally` runs either way, passing the value through. The common bug: a helper's `.catch((err) => console.error(err))` returns `undefined`, so every caller's `.then` runs as if the request succeeded. If a `catch` can't really handle the error, `throw err` again.

---

**Q37: Both functions wrap the call in `try/catch`, so why does `withoutAwait` reject while `withAwait` catches the error?**

```js
async function load() {
  throw new Error('network down');
}

async function withoutAwait() {
  try {
    return load();
  } catch {
    return 'caught inside withoutAwait';
  }
}

async function withAwait() {
  try {
    return await load();
  } catch {
    return 'caught inside withAwait';
  }
}

withoutAwait().then(console.log, (err) => console.log('withoutAwait rejected:', err.message));
withAwait().then(console.log);
```

**Output:**
```text
caught inside withAwait
withoutAwait rejected: network down
```

**Explanation:**

`return await load()` waits **inside** the `try`, so the rejection is thrown there and the `catch` runs. `return load()` hands the promise back unawaited: the `try` finishes normally, and the later rejection goes straight to the caller. `withAwait` also settles first, because adopting a returned promise costs `withoutAwait` a couple of extra microtask steps. Outside `try`/`catch`/`finally` the two forms give the same result, though `return await` also gives a clearer stack trace. → [§8.5](/javascript/guide#85-mixing-asyncawait-with-thencatch)

---

**Q38: Why is the first value passed to `next()` ignored, and what does the final `next()` return?**

```js
function* conversation() {
  const first = yield 'What is your name?';
  const second = yield 'Hello, ' + first;
  return 'Done, ' + second;
}

const talk = conversation();
console.log(talk.next('ignored').value);
console.log(talk.next('Asha').value);
console.log(JSON.stringify(talk.next('bye')));
console.log(JSON.stringify(talk.next()));
```

**Output:**
```text
What is your name?
Hello, Asha
{"value":"Done, bye","done":true}
{"done":true}
```

**Explanation:**

`next(value)` resumes the generator and makes the **paused** `yield` evaluate to `value`. The first `next()` has no paused `yield`, so `'ignored'` goes nowhere.

| Line | Why |
|---|---|
| `What is your name?` | the first `next` runs to the first `yield` |
| `Hello, Asha` | `first = 'Asha'`, then runs to the second `yield` |
| `{"value":"Done, bye","done":true}` | `second = 'bye'`; a `return` value is delivered once, with `done: true` |
| `{"done":true}` | finished: `value` is `undefined`, which `JSON.stringify` omits |

This two-way flow is what Redux Saga is built on, and how `async`/`await` was first implemented. `for...of` and `[...gen]` ignore the `return` value, so `'Done, bye'` would never appear in a loop.

---

### Syntax Gotchas

Two rules about how code is *read*, rather than how it runs.

**Q39: Why does passing `name: null` print `null` instead of using the default `'guest'`?**

```js
function greet({ name = 'guest', greeting = 'Hi' } = {}) {
  return greeting + ', ' + name;
}

console.log(greet({ name: undefined }));
console.log(greet({ name: null }));
console.log(greet());
console.log(greet({ greeting: '' }));
```

**Output:**
```text
Hi, guest
Hi, null
Hi, guest
, guest
```

**Explanation:**

Destructuring and parameter defaults apply **only to `undefined`**; `null`, `''`, `0` and `false` are real values. `greet()` works only because of the `= {}` after the pattern; without it, destructuring `undefined` throws. When `null` should also get the default (common with API data), use `input.name ?? 'guest'`, not `||`, which would also replace `0` and `''`.

---

**Q40: Why does `getConfig()` return `undefined`, and why does the second part throw a `TypeError`?**

```js
function getConfig() {
  return
  {
    debug: true;
  }
}

console.log(getConfig());

try {
  const a = 1
  const b = a
  [1, 2].forEach((n) => console.log(n))
} catch (err) {
  console.log(err.name);
}
```

**Output:**
```text
undefined
TypeError
```

**Explanation:**

**Automatic semicolon insertion** (ASI) adds a semicolon after a `return` that ends a line, but **not** before a line starting with `[` or `(`.

| Line | Why |
|---|---|
| `undefined` | the function runs `return;`; the `{ … }` below is a block with a label `debug:`, never reached |
| `TypeError` | the lines join as `const b = a[1, 2].forEach(...)`; the comma operator makes `a[1, 2]` mean `a[2]`, which is `undefined` on the number `1` |

Fixes: keep `return {` on one line; in semicolon-free code, prefix a line that starts with `[`, `(` or a template literal with `;`; or let a formatter such as Prettier add semicolons.

---

### Functions, Classes & Control Flow

Puzzles about the order things happen in: which `return` wins, when a class field exists, and when a promise's code actually runs.

**Q41: Which value does each function return when there is a `finally` block, and where did the error in `swallow()` go?**

```js
function pick() {
  try {
    return 'from try';
  } finally {
    console.log('finally runs first');
  }
}
console.log(pick());

function override() {
  try {
    return 'from try';
  } finally {
    return 'from finally';
  }
}
console.log(override());

function swallow() {
  try {
    throw new Error('lost');
  } finally {
    return 'finally wins';
  }
}
console.log(swallow());
```

**Output:**
```text
finally runs first
from try
from finally
finally wins
```

**Explanation:**

`finally` always runs, even after `return` or `throw`, and a `return` inside it **replaces** whatever the `try` was returning or throwing. In `swallow()` the error simply vanishes, with nothing logged; ESLint's `no-unsafe-finally` flags it. Use `finally` for cleanup only (close a file, hide a spinner) and never `return`, `throw` or `break` from it. `using` declarations ([§9.9](/javascript/guide#99-explicit-resource-management-using-and-await-using)) are the modern form of cleanup.

---

**Q42: Why does the first `describe()` print `label = undefined`, when `label` is set to `'child'` in the class?**

```js
class Base {
  constructor() {
    this.describe();
  }
  describe() {
    console.log('base describe');
  }
}

class Child extends Base {
  label = 'child';
  describe() {
    console.log('child describe, label =', this.label);
  }
}

const c = new Child();
c.describe();
```

**Output:**
```text
child describe, label = undefined
child describe, label = child
```

**Explanation:**

A subclass's fields are initialised **after** `super()` returns. During `new Child()`, `Base`'s constructor calls `this.describe()`, which dispatches to `Child`'s version before `label` exists; only then is `label = 'child'` set. Java behaves the same (C# initialises fields first). Don't call overridable methods such as `this.init()` or `this.render()` from a constructor: let the caller run `init()` afterwards, or pass what the parent needs into `super(...)`.

---

**Q43: Why does `acc['#balance']` give `undefined`, and why doesn't `#balance` appear in `JSON.stringify` or `Object.keys`?**

```js
class Account {
  #balance = 100;
  owner = 'Asha';
  static isAccount(value) {
    return #balance in value;
  }
  get balance() {
    return this.#balance;
  }
}

const acc = new Account();
console.log(acc.balance);
console.log(acc['#balance']);
console.log(JSON.stringify(acc));
console.log(Object.keys(acc).join(', '));
console.log(Account.isAccount(acc), Account.isAccount({ balance: 100 }));
```

**Output:**
```text
100
undefined
{"owner":"Asha"}
owner
true false
```

**Explanation:**

A `#` field is not a property with an odd name; it is a private slot only code inside the class body can reach.

| Line | Why |
|---|---|
| `100` | the getter is inside the class |
| `undefined` | `acc['#balance']` looks for an ordinary property named `"#balance"`. Nothing outside the class reaches `#balance`: not brackets, not `Object.getOwnPropertyNames`, not a subclass |
| `{"owner":"Asha"}` / `owner` | private fields are invisible to `JSON.stringify` and `Object.keys` |
| `true false` | `#balance in value` (the **ergonomic brand check**, ES2022) asks whether this class created the object, which a duck-typed `balance` check can't |

Before ES2022, "private" meant the `_balance` convention, a `WeakMap` or a closure. TypeScript's `private` is compile-time only ([TypeScript tricky Q21](/javascript/typescript-tricky-questions)).

---

### Equality, Numbers & Arrays

Values that do not behave like the ones they look like.

**Q44: Why is `0 === -0` true but `Object.is(0, -0)` false, and why does `includes` find `NaN` when `indexOf` does not?**

```js
console.log(0 === -0);
console.log(Object.is(0, -0));
console.log(Object.is(NaN, NaN));
console.log([NaN].includes(NaN), [NaN].indexOf(NaN));
console.log(1 / -0);
console.log(JSON.stringify(-0), String(-0));
```

**Output:**
```text
true
false
true
true -1
-Infinity
0 0
```

**Explanation:**

JavaScript has three equality algorithms, and they differ only on `NaN` and `+0`/`-0`:

| Comparison | `NaN` equals `NaN`? | `+0` equals `-0`? | Used by |
|---|---|---|---|
| `===` | no | yes | `indexOf`, `switch` |
| SameValueZero | **yes** | yes | `includes`, `Map`, `Set` |
| `Object.is` (SameValue) | **yes** | **no** | React's state comparison |

That explains the first four lines. The sign of zero is real (`1 / -0` is `-Infinity`) but invisible when printed: `JSON.stringify` and `String` both show `0`. `-0` comes from rounding small negatives (`Math.round(-0.4)`) and multiplying by zero.

---

**Q45: What does `arguments` contain in each function, and why does the arrow function see the outer function's arguments?**

```js
function regular() {
  return arguments.length;
}
console.log(regular(1, 2, 3));

function outer() {
  const arrow = () => arguments[0];
  return arrow('ignored');
}
console.log(outer('from outer'));

function withRest(...args) {
  return Array.isArray(args) + ' ' + Array.isArray(arguments);
}
console.log(withRest(1, 2));

function defaults(a, b = 2) {
  return arguments.length;
}
console.log(defaults(1), regular.length, defaults.length);
```

**Output:**
```text
3
from outer
true false
1 0 1
```

**Explanation:**

| Line | Why |
|---|---|
| `3` | `arguments` holds every argument passed, declared or not |
| `from outer` | an arrow has no `arguments` of its own (like `this`), so it reads `outer`'s; `'ignored'` is lost |
| `true false` | a rest parameter is a real array; `arguments` is only array-like (no `map` or `filter`) |
| `1 0 1` | `arguments.length` counts what was **passed**; a function's `.length` counts parameters **before the first default** |

Prefer `...args`: a real array, works in arrows, and visible in the signature. `arguments` survives in older code and polyfills.

---

**Q46: What happens to the array when you set `length`, `delete` an item, or assign to index 9?**

```js
const arr = [1, 2, 3, 4, 5];
arr.length = 2;
console.log(arr.join(','));

const holes = [1, , 3];
console.log(holes.length, 1 in holes);
console.log(holes.map((x) => x * 10).length, holes.filter(() => true).length);

const items = ['a', 'b', 'c'];
delete items[1];
console.log(items.length, items[1]);

const big = [];
big[9] = 'x';
console.log(big.length);
```

**Output:**
```text
1,2
3 false
3 2
3 undefined
10
```

**Explanation:**

`length` is one more than the highest index, and it is writable. Missing indexes are **holes**, which are not the same as `undefined`.

| Line | Why |
|---|---|
| `1,2` | shrinking `length` deletes everything from index 2 on |
| `3 false` | index 1 of `[1, , 3]` is a hole, so `in` finds nothing there |
| `3 2` | `map` keeps the hole, `filter` skips it |
| `3 undefined` | `delete` leaves a hole and doesn't shift or shorten |
| `10` | assigning index 9 makes `length` 10, with holes at 0–8 |

`arr.length = 0` empties an array in place for every reference to it (unlike `arr = []`). Remove items with `splice(index, 1)` or `filter`, never `delete`, and create sized arrays with `Array.from({ length: n }, fn)` or `new Array(n).fill(value)`.

---

**Q47: The object has both `valueOf` and `toString`, so why does `price + 1` use one and `` `${price}` `` use the other?**

```js
const price = {
  valueOf() { return 42; },
  toString() { return 'forty-two'; },
};

console.log(price + 1);
console.log(`${price}`);
console.log(String(price));
console.log(price * 2);
console.log(price > 40);
console.log([1, 2] + [3]);
```

**Output:**
```text
43
forty-two
forty-two
84
true
1,23
```

**Explanation:**

Converting an object to a primitive passes a **hint**. With `"number"` or `"default"`, an ordinary object tries `valueOf` first; with `"string"`, `toString` first.

| Line | Hint | Called | Result |
|---|---|---|---|
| `price + 1` | default | `valueOf` → 42 | `43` |
| `` `${price}` `` | string | `toString` | `forty-two` |
| `String(price)` | string | `toString` | `forty-two` |
| `price * 2` | number | `valueOf` | `84` |
| `price > 40` | number | `valueOf` | `true` |
| `[1, 2] + [3]` | default | an array's `valueOf` returns the array, so it falls back to `toString`: `'1,2'` and `'3'` | `1,23` |

The same mechanism lets `date2 - date1` subtract dates while `` `${date}` `` prints a readable string. A class can control it with `[Symbol.toPrimitive](hint)`, which receives `'number'`, `'string'` or `'default'`.

---

**Q48: Does the executor passed to `new Promise` run now or later, and what happens to the second `resolve` and the `reject`?**

```js
console.log('1. before');

const p = new Promise((resolve, reject) => {
  console.log('2. executor runs immediately');
  resolve('first');
  resolve('second');
  reject(new Error('too late'));
  console.log('3. still running after resolve');
});

p.then((value) => console.log('5. settled with', value));
console.log('4. after');
```

**Output:**
```text
1. before
2. executor runs immediately
3. still running after resolve
4. after
5. settled with first
```

**Explanation:**

The executor runs **synchronously**, inside the `new Promise(...)` call; only `.then` callbacks are deferred, as microtasks ([§1.6](/javascript/guide#16-what-is-the-event-loop)). `resolve` doesn't stop the function, so line 3 still prints. A promise settles **once**, so the second `resolve` and the `reject` are silently ignored. Two consequences: wrapping a slow loop in `new Promise` doesn't make it asynchronous (Q17), and you write `return resolve(value)` when the rest must not run.

---

### Operators & Names

Small syntax features with one surprising rule each.

**Q49: How far does `?.` short-circuit, and why is `null || undefined ?? 'x'` a syntax error?**

```js
const user = { profile: null };

console.log(user.profile?.name);
console.log(user.settings?.theme.color);

let calls = 0;
const nothing = null;
nothing?.method(calls++);
console.log('calls:', calls);

console.log(0 || 'default', 0 ?? 'default');

try {
  new Function("return null || undefined ?? 'x'");
} catch (err) {
  console.log(err.name);
}
```

**Output:**
```text
undefined
undefined
calls: 0
default 0
SyntaxError
```

**Explanation:**

| Line | Why |
|---|---|
| `undefined` | `user.profile` is `null`, so `?.name` gives `undefined` |
| `undefined` | `?.` stops at `user.settings`, and the rest of the chain (`.theme.color`) is **never evaluated** |
| `calls: 0` | the call is skipped, and so are its arguments |
| `default 0` | `\|\|` replaces any falsy value; `??` only `null` and `undefined` |
| `SyntaxError` | the grammar forbids mixing `??` with `\|\|` or `&&` without parentheses: write `(null \|\| undefined) ?? 'x'` |

The short-circuit covers only the current chain: `a?.b.c` stops at `a`, but `(a?.b).c` throws, because the parentheses end it. Don't sprinkle `?.` everywhere; it turns a missing value you should handle into a silent `undefined`. → [§9.2](/javascript/guide#92-optional-chaining-and-nullish-coalescing)

---

**Q50: Why is `fact` usable inside the function but `undefined` outside, and why does assigning to `named` throw?**

```js
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1);
};
console.log(factorial(5));
console.log(typeof fact);

const rename = function named() {
  'use strict';
  try {
    named = 'something else';
  } catch (err) {
    return err.name;
  }
};
console.log(rename());
console.log(JSON.stringify([factorial.name, (() => {}).name, (function () {}).name]));
```

**Output:**
```text
120
undefined
TypeError
["fact","",""]
```

**Explanation:**

A **named function expression**'s name is a read-only binding visible only inside the function.

| Line | Why |
|---|---|
| `120` | inside, `fact` is the function itself, so recursion works |
| `undefined` | outside, only `factorial` exists |
| `TypeError` | assigning the inner name throws in strict mode; in sloppy mode it is silently ignored |
| `["fact","",""]` | `.name` is the given name; anonymous functions used directly have `''` (assigned to a variable, as in `const f = () => {}`, they take its name) |

Naming a function expression lets it refer to itself even if the outer variable is reassigned, and puts a real name in **stack traces** instead of `anonymous`.

---

**Q51: Why is the `Symbol` key missing from `Object.keys` and JSON, and why does the `Map` keep `'1'` and `1` as separate keys?**

```js
const id = Symbol('id');
const user = { name: 'Asha', [id]: 7 };

console.log(Object.keys(user).join(', '));
console.log(JSON.stringify(user));
console.log(user[id], Object.getOwnPropertySymbols(user).length);
console.log(Symbol('id') === Symbol('id'), Symbol.for('id') === Symbol.for('id'));

const m = new Map();
m.set(NaN, 'not a number');
m.set('1', 'string one');
m.set(1, 'number one');
console.log(m.get(NaN), m.size, [...m.keys()].map((k) => typeof k + ' ' + String(k)).join(', '));
```

**Output:**
```text
name
{"name":"Asha"}
7 1
false true
not a number 3 number NaN, string 1, number 1
```

**Explanation:**

| Line | Why |
|---|---|
| `name` / `{"name":"Asha"}` | `Object.keys`, `for...in` and `JSON.stringify` skip symbol keys, so they can hold metadata without clashing |
| `7 1` | the property is still there: read it with the symbol, or list it with `Object.getOwnPropertySymbols` |
| `false true` | every `Symbol()` is unique; `Symbol.for('id')` returns the same symbol from a **global registry** |
| `not a number 3 …` | a `Map` finds a `NaN` key (SameValueZero, Q44) and keeps `'1'` and `1` apart, where a plain object would merge them (Q18) |

Symbols are how the language adds hooks without breaking old code: `Symbol.iterator` enables `for...of`, `Symbol.toPrimitive` controls coercion (Q47). They are hidden, not private; use `#fields` for privacy.

---

### Shared State Across the Event Loop

Two puzzles from a real interview. The order of the logs is only half the question: the other half is **what value** a shared variable has by the time each callback runs.

**Q52: A timer and a promise both increment `count`. What does each log print, and in what order?**

```js
let count = 0;
function increment() {
  setTimeout(() => {
    count++;
    console.log("timeout:", count);
  }, 0);

  Promise.resolve().then(() => {
    count++;
    console.log("promise:", count);
  });
}

increment();

console.log("sync:", count);
```

**Output:**
```text
sync: 0
promise: 1
timeout: 2
```

**Explanation:**

`increment()` only *schedules* the callbacks, so `sync: 0`. The promise callback is a microtask and runs before the timer task, even though the timer was scheduled first ([§1.6](/javascript/guide#16-what-is-the-event-loop)), so it makes `count` 1. The timer then sees 1 and makes it 2. Each callback reads the shared variable when it **runs**, not when it was scheduled.

---

**Q53: Two timers each increment `count`, while `main` awaits them. What are A, B, C and D?**

```js
let count = 0;

function test() {
  return new Promise(resolve => {
    setTimeout(() => {
      count++;
      resolve(count);
    }, 0);
  });
}

async function main() {
  console.log("A", count);

  const p1 = test();

  count++;

  const p2 = test();

  const result1 = await p1;

  console.log("B", result1, count);

  const result2 = await p2;

  console.log("C", result2, count);
}

main();

console.log("D", count);
```

**Output:**
```text
A 0
D 1
B 2 2
C 3 3
```

**Explanation:**

| Step | What runs | `count` |
|---|---|---|
| 1 | `main()` starts and logs **`A 0`** | 0 |
| 2 | `test()` schedules timer 1; `count++`; `test()` schedules timer 2 | 1 |
| 3 | `await p1` returns control to the caller, which logs **`D 1`** | 1 |
| 4 | timer 1: `count++` and resolves `p1` with **2** | 2 |
| 5 | `main` resumes and logs **`B 2 2`** | 2 |
| 6 | timer 2: `count++` and resolves `p2` with **3** | 3 |
| 7 | `main` resumes and logs **`C 3 3`** | 3 |

The two usual mistakes: `D` is `1`, because the `count++` runs synchronously before the first `await` ([§1.5](/javascript/guide#15-why-is-javascript-non-blocking)); and `B` is `2`, because a promise's value is fixed when it **resolves**, after timer 1's own increment, not when `test()` was called.

---

### Key Rules

```
Execution Order:
1. Synchronous code (call stack)
2. Microtasks (Promise.then, await continuation)
3. Macrotasks (setTimeout, setInterval)
```

- `==` performs type coercion, `===` does not
- Objects and arrays compare by reference, not value
- Object keys are strings: any object used as a key becomes `"[object Object]"`
- `var` gives a loop one shared variable; `let` gives each iteration its own
- `+` joins if either side is a string; `-`, `*` and `/` always convert to numbers
- Defaults apply only to `undefined`; use `??` when `null` should get the default too
- Inside `try`, write `return await`, or the `catch` never sees the rejection
- A `return` in `finally` overrides the `try`, and swallows its errors
- Subclass fields don't exist until `super()` returns
- `includes` finds `NaN`; `indexOf` does not
- A promise executor runs synchronously; only the first `resolve`/`reject` counts
- Spread, `Object.assign` and `Object.freeze` all act on one level only
- `await` pauses the async function and schedules the rest as a microtask
- `this` depends on the call site, not where the function is defined
- `var` is function-scoped, `let`/`const` are block-scoped
