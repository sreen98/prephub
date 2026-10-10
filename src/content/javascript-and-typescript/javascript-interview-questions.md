# JavaScript — Interview Questions

Interview questions and model answers, from beginner to advanced. Each answer links to the section that explains it in depth.

Part of the JavaScript series: [JavaScript Guide](/javascript/guide) · **JavaScript Interview Questions** · [JavaScript Tricky Questions](/javascript/tricky-questions)

---

## Table of Contents

- [15. Interview Questions & Answers](#15-interview-questions-answers)

---

## 15. Interview Questions & Answers

### Beginner

---

**Q1: What is the difference between `==` and `===`?**

`==` (loose equality) performs **type coercion** before comparison. `===` (strict equality) compares both value and type without coercion.

```js
'5' == 5     // true  (string coerced to number)
'5' === 5    // false (different types)
null == undefined   // true
null === undefined  // false
```

Use `===` by default: `==`'s conversion rules are hard to predict (`'' == 0` and `'0' == 0` are both `true`, yet `'' == '0'` is `false`), and [tricky Q2 and Q3](/javascript/tricky-questions) show where they lead. The one common deliberate use of `==` is `value == null`, which is `true` for both `null` and `undefined` and nothing else. → Full explanation: [§2.4](/javascript/guide#24-type-coercion)

---

**Q2: What are closures?**

A closure is a function that keeps access to the variables of the scope it was created in, even after the outer function has returned.

```js
function outer() {
  let count = 0;
  return function inner() {
    return ++count;
  };
}
const inc = outer();
console.log(inc()); // 1
console.log(inc()); // 2 (count persists because of closure)
```

`count` survives because it lives in a scope object on the heap and `inc` holds a reference to that scope, so the garbage collector cannot free it while `inc` is reachable. Each `outer()` call makes a fresh scope, so two counters never share a `count`. Worth volunteering: closures are how JavaScript gets private state, and the same reference causes stale values and memory leaks (Q25, Q29). → Full explanation: [§5.2](/javascript/guide#52-closures)

---

**Q3: What is the difference between `null` and `undefined`?**

- `undefined`: Variable declared but not assigned, missing function parameters, missing object properties. Set by JavaScript automatically.
- `null`: Intentional absence of value. Set by the programmer explicitly.

```js
let x;              // undefined (automatic)
let y = null;       // null (intentional)
typeof undefined    // 'undefined'
typeof null         // 'object' (historical bug)
null == undefined   // true (loose equality)
null === undefined  // false (strict equality)
```

---

**Q4: Explain event bubbling and capturing.**

An event fires on the element you interacted with **and on every one of its ancestors**. At dispatch the browser builds the chain from `window` down to the target and walks it twice: **capturing** (down from `window`, running only listeners registered with `{ capture: true }`), the **target** itself, then **bubbling** (back up to `window`, running normal listeners). Bubbling is the default. Both exist for a historical reason: **Netscape implemented capturing, Internet Explorer implemented bubbling**, and the W3C standardised both.

Bubbling is what makes **event delegation** work: one listener on a `<ul>` handles every `<li>`, including rows added later, and React's own event system is a single listener at the root container. **Reach for capturing** when an ancestor must see the event *before* the target can stop it (an overlay, an analytics layer, a focus manager): on the way up, a child's `stopPropagation()` means you never hear about it.

→ Full explanation: [§13.1](/javascript/guide#131-the-event-path-capturing-target-bubbling) (the phases), [§13.2](/javascript/guide#132-stopping-things-three-different-verbs) (the three stopping methods) and [§13.3](/javascript/guide#133-delegation-and-what-does-not-bubble) (delegation, and the events that do not bubble)

---

**Q5: What is the difference between `var`, `let`, and `const`?**

| Feature | `var` | `let` | `const` |
|---------|-------|-------|---------|
| Scope | Function | Block | Block |
| Hoisting | Yes (value: undefined) | Yes (TDZ) | Yes (TDZ) |
| Redeclaration | Allowed | Not allowed | Not allowed |
| Reassignment | Allowed | Allowed | Not allowed |

Use `const` by default, `let` when reassignment is needed, and avoid `var`: it leaks out of blocks (the cause of the `setTimeout`-in-a-loop bug in [§5.3](/javascript/guide#53-classic-closure-gotcha)), reading it early gives a silent `undefined` where `let` would throw, and a second `var x` quietly overwrites the first. `const` only stops reassignment of the variable; the object it holds can still change. → Full explanation: [§3.1](/javascript/guide#31-var-vs-let-vs-const)

---

### Intermediate

---

**Q6: What is the event loop? How does JavaScript handle async operations?**

JavaScript runs your code on **one call stack**, so one line of *your* code runs at a time. Slow work (a `fetch`, a timer, a file read) is done by the browser or Node, genuinely in parallel, and its callback waits in a queue. The **event loop** runs the next callback once the stack is empty. One turn: take **one** task, run **every** microtask (including ones queued meanwhile), then render if a frame is due. → From scratch: [§1.4–§1.6](/javascript/guide#16-what-is-the-event-loop); reference diagram: [§11](/javascript/guide#11-the-event-loop)

```js
console.log('1 sync start');

setTimeout(() => console.log('6 timeout 0'), 0);

Promise.resolve().then(() => {
  console.log('4 microtask A');
  Promise.resolve().then(() => console.log('5 microtask queued BY a microtask'));
});

queueMicrotask(() => console.log('4.5 queueMicrotask'));

(async () => {
  console.log('2 async body is SYNC up to the first await');
  await null;
  console.log('4.7 after await = a microtask');
})();

console.log('3 sync end');
```

```text
1 sync start
2 async body is SYNC up to the first await
3 sync end
4 microtask A
4.5 queueMicrotask
4.7 after await = a microtask
5 microtask queued BY a microtask     ← added mid-drain, still runs before the timer
6 timeout 0
```

**Three things that output proves:**

- **An `async` function body runs synchronously** until its first `await`, which is why line 2 prints before line 3.
- **`await x` is `Promise.resolve(x).then(...)` in disguise**, so the code after it is a microtask (`4.7`).
- **A microtask queued during the drain still runs before the next task**: line 5 beats `setTimeout(…, 0)`.

| Microtasks (all drained each turn) | Tasks, also called macrotasks (one per turn) |
|---|---|
| `.then` / `.catch` / `.finally`, code after `await` | `setTimeout`, `setInterval` |
| `queueMicrotask`, `MutationObserver` | I/O callbacks, UI events, `setImmediate` (Node) |

`requestAnimationFrame` is neither: it runs in the render step, before style, layout and paint, which is why it is the place for visual updates.

**The follow-ups interviewers ask:**

- **`setTimeout(fn, 0)` is not "now"**: it waits for the stack and the whole microtask queue (timer clamping: Q42).
- **Microtask starvation**: a microtask that keeps queueing microtasks (`function starve() { Promise.resolve().then(starve); }`) blocks rendering and every timer, with no long function to blame. A loop of tasks does not, since rendering gets a turn between them.
- **Node**: `process.nextTick` drains *before* promise microtasks, and the loop has ordered phases (timers, pending, poll, check, close), so `setTimeout(…, 0)` vs `setImmediate` is unordered at the top level but fixed inside an I/O callback ([Node.js guide](/backend/nodejs)).
- **Why it matters**: one long synchronous function blocks input, animation and rendering. Total Blocking Time measures that; the fixes are `scheduler.yield()`, chunking, or a Worker (the only second thread).

---

**Q7: Explain prototypal inheritance. If a property is missing from an object but is still accessible, what is the complete lookup process?**

Every object has a hidden `[[Prototype]]` link to another object or to `null`. A property read (`[[Get]]`) is a loop: look at the object's **own** properties (for a getter, call it with `this` set to the *original* object); if the key is not there, follow `[[Prototype]]` and repeat; on reaching `null`, return `undefined`. So "missing but still accessible" means *found further up the chain*.

```js
const animal = {
  eats: true,
  get label() { return 'animal named ' + this.name; },
};
const dog = Object.create(animal);
dog.name = 'Rex';

console.log(dog.eats);                              // true, found on animal
console.log(Object.hasOwn(dog, 'eats'), 'eats' in dog); // false true
console.log(dog.label);                             // animal named Rex
console.log(dog.missing);                           // undefined, reached null

dog.eats = false;                                   // a write creates an OWN property
console.log(dog.eats, animal.eats);                 // false true
delete dog.eats;
console.log(dog.eats);                              // true again

const bare = Object.create(null);
console.log('toString' in bare);                    // false: no chain at all
```

**Where interviews go next:** writes do not walk the chain (`dog.eats = false` *shadows* the inherited value), except that an inherited **setter** runs instead and an inherited **non-writable** property makes the write fail (silently in sloppy mode, `TypeError` in strict). `in` and `for...in` walk the chain; `Object.hasOwn` and `Object.keys` do not. `Object.create(null)` has no chain, so user keys like `__proto__` cannot collide (Q21). And `class Dog extends Animal` is the same mechanism: `Dog.prototype` links to `Animal.prototype`, and methods live once on the prototype.

→ Full explanation: [§6.2](/javascript/guide#62-prototypal-inheritance)

---

**Q8: What is the difference between `call`, `apply`, and `bind`?**

All three set `this` explicitly. `call` and `apply` run the function now and differ only in how arguments arrive (**a**pply takes an **a**rray); `bind` runs nothing and returns a new, permanently bound function, optionally with arguments pre-filled. The `bind` facts interviews probe: the binding cannot be overridden (`new` is the one exception), and **every `bind()` returns a new function**, which defeats `React.memo` and makes `removeEventListener` silently fail.

```js
function describe(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}
const alice = { name: 'Alice' };

console.log(describe.call(alice, 'Hello', '!'));        // Hello, Alice!
console.log(describe.apply(alice, ['Hi', '?']));        // Hi, Alice?

// bind runs nothing — it hands back a function, with 'Hey' already supplied
const greetAlice = describe.bind(alice, 'Hey');
console.log(typeof greetAlice);                         // function
console.log(greetAlice('.'));                           // Hey, Alice.

// The binding is PERMANENT — call cannot override it
console.log(greetAlice.call({ name: 'Bob' }, '!'));     // Hey, Alice!   ← not Bob

// Every bind() returns a NEW function object
console.log(describe.bind(alice) === describe.bind(alice));   // false
```

**Arrow functions ignore all three**, because an arrow has no `this` of its own:

```js
function outer() {
  const arrow = () => this.name;
  return arrow.call({ name: 'Bob' });    // the .call does nothing
}
console.log(outer.call({ name: 'Alice' }));   // 'Alice'
```

**`thisArg` is coerced in sloppy mode**: a primitive is boxed and `null`/`undefined` becomes the global object. Under `'use strict'`, and so in every ES module, it is passed through untouched:

```js
function whoAmI() { return this; }
console.log(typeof whoAmI.call('text'));         // 'object' — the string was boxed
console.log(whoAmI.call(null) === globalThis);   // true    — null was replaced
// Under 'use strict': 'string', and this === null
```

In application code, spread replaced `apply` (`Math.max(...nums)`) and arrows replaced most `bind`s; `fn.apply(this, args)` survives in wrappers (decorators, polyfills, memoisers, Q16 and Q26), and `call` in older library code that borrows a method from another prototype (`Array.prototype.slice.call(arguments)`, from before rest parameters), and `Reflect.apply(fn, thisArg, args)` is the spelling a function cannot fool by overwriting its own `apply`. → Full explanation: [§4.3](/javascript/guide#43-this-keyword)

---

**Q9: What is the difference between shallow copy and deep copy? You copied an object with the spread operator, yet updating the copy changed the original state. Where did the shared reference remain?**

`{ ...obj }` copies **one level**: a new outer object whose properties are copied from the old one. A number or string is copied by value, but an object, array, `Date` or `Map` is copied as a **reference**, so the shared reference is every nested object.

```js
const state = {
  user: { name: 'Ana', tags: ['admin'] },
  updatedAt: new Date(0),
};

const copy = { ...state };
copy.user.name = 'Ben';                              // looks like it edits the copy
console.log(state.user.name);                        // Ben
console.log(copy === state, copy.user === state.user); // false true

// Copy every level you change, and only those levels
const next = { ...state, user: { ...state.user, name: 'Cy' } };
console.log(state.user.name, next.user.name);        // Ben Cy
console.log(next.user.tags === state.user.tags);     // true: untouched levels stay shared

// A real deep copy, and what JSON loses
const deep = structuredClone(state);
deep.user.tags.push('editor');
console.log(state.user.tags.length);                 // 1
console.log(deep.updatedAt instanceof Date);         // true
console.log(typeof JSON.parse(JSON.stringify(state)).updatedAt); // string
```

`copy === state` is `false`, which fools people; `copy.user === state.user` is `true`, which is the bug. In React it is worse: React compares references with `Object.is`, so a mutated-but-same `user` makes `memo`, `useMemo` and effect dependencies skip the update, and the "previous" state kept for undo changed too.

**The fix is not a deep copy.** Copy **every level on the path you change**, as `next` does; sharing untouched parts is correct, cheap, and what lets `memo` skip them. Immer (used by Redux Toolkit) writes that copying for you. When you really need a deep copy, use `structuredClone`: it handles nested objects, `Date`, `Map`, `Set` and cycles, but throws on functions and DOM nodes. `JSON.parse(JSON.stringify(x))` loses data: dates become strings, `undefined` and functions vanish, and `Map`/`Set` become `{}`.

---

**Q10: Explain `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any`.**

All four take promises that are already running and return one promise. They differ in **when it settles and what one failure does to it**.

| Method | Resolves when | Rejects when |
|--------|-------------|-------------|
| `Promise.all` | ALL promises fulfill | ANY promise rejects |
| `Promise.allSettled` | ALL promises settle (fulfill or reject) | Never rejects |
| `Promise.race` | the first promise to settle fulfills | the first promise to settle rejects |
| `Promise.any` | FIRST promise fulfills | ALL promises reject (AggregateError, one error holding all the reasons) |

- **`all`**: you need every result and one failure makes the whole useless. It rejects on the first failure, but the others keep running; you just stop hearing about them.
- **`allSettled`**: results are independent and you want to show what worked and report what failed (dashboard widgets, a batch job).
- **`any`**: several sources can give the same answer and you want the first success (mirrors, fallbacks).
- **`race`**: whichever finishes first, success or failure; in practice, a timeout: `Promise.race([fetch(url), new Promise((_, reject) => setTimeout(() => reject('Timeout'), 5000))])`. It does not cancel the loser, so the slow `fetch` keeps downloading; `AbortSignal.timeout(ms)` ([§8.7](/javascript/guide#87-retrying-cancelling-and-bounding-async-work)) stops the request itself.

`allSettled` resolves to `[{ status: 'fulfilled', value }, { status: 'rejected', reason }, …]`, one entry per input. → Examples of all four: [§8.2](/javascript/guide#82-promises)

---

### Advanced

---

**Q11: What is the Temporal Dead Zone (TDZ)?**

The TDZ is the period between entering a scope and the variable's declaration being reached. During TDZ, accessing the variable throws a `ReferenceError`.

```js
{
  // TDZ for `x` starts here
  console.log(x);    // ReferenceError: Cannot access 'x' before initialization
  let x = 10;        // TDZ ends here
}
```

`let` and `const` are hoisted (the engine knows they exist) but stay in the TDZ until the declaration line; `var` is initialised to `undefined` instead. Why: using a variable before it has a value is almost always a bug, silent with `var`, and the TDZ turns it into an immediate error that names the variable. It also keeps `const` honest: otherwise it could be read as `undefined` first and its value later. → Full explanation: [§3.2](/javascript/guide#32-hoisting)

---

**Q12: Explain generators and when you'd use them.**

A generator is a function that can pause and resume. Calling a `function*` runs nothing; it returns an object whose `next()` runs the body to the next `yield`, hands back the value, and freezes there with its locals intact. That is why the infinite `while (true)` below is safe.

```js
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
console.log(fib.next()); // { value: 0, done: false }
console.log(fib.next()); // { value: 1, done: false }
console.log(fib.next()); // { value: 1, done: false }
console.log(fib.next()); // { value: 2, done: false }
```

Use one for **lazy or infinite sequences** ("every page of an API"); **custom iterables**, the shortest way to write a `[Symbol.iterator]`; **async flow control**, since `next(value)` sends a value *back in* as the result of the paused `yield` (Redux-Saga yields effect descriptions, performs them and resumes the saga with the result, so sagas test without real requests); and **step-by-step processes** like a wizard, with no "current step" variable.

For async work `async`/`await` has replaced them. → Full explanation: [§9.4](/javascript/guide#94-iterators-and-generators)

---

**Q13: What is `WeakRef` and `FinalizationRegistry`?**

Both are escape hatches from the normal rule that **any reference you hold keeps an object alive**. `WeakRef` holds a reference that does not count; `FinalizationRegistry` tells you after an object has been freed.

| API | What it gives you | What it costs |
|---|---|---|
| `new WeakRef(obj)` | `.deref()` → the object, **or `undefined`** once it has been collected | the object can disappear between two reads |
| `new FinalizationRegistry(cb)` | `cb(heldValue)` **after** a registered object is collected | the callback may never run at all |

```js
let cacheKey = { id: 42 };
const ref = new WeakRef(cacheKey);

console.log('deref ->', ref.deref());            // { id: 42 }

// Read it into a LOCAL once, then use the local. Two deref() calls can
// disagree — the first can return the object and the second undefined.
const held = ref.deref();
if (held) console.log('read once into a local:', held.id);   // 42

cacheKey = null;      // the last strong reference is gone
console.log('after dropping the strong ref ->', ref.deref()); // still { id: 42 }
```

Dropping the strong reference makes the object **eligible** for collection, not collected: nothing says when, or whether, the collector runs.

```js
const registry = new FinalizationRegistry((heldValue) => {
  console.log(heldValue, 'was collected');   // may never print
});

let user = { name: 'Ada' };
// (target, heldValue, unregisterToken) — the token is held weakly too
registry.register(user, 'user-record', user);
console.log('registered; the callback is not guaranteed to run');

registry.unregister(user);                   // cancels it
console.log('unregistered');
```

**The held value must not be the target.** The registry holds `heldValue` **strongly**, so using the target as its own held value would keep it alive forever. The engine refuses: `registry.register(user, user)` throws `TypeError: … target and holdings must not be same`. Pass something small that says *what* went away, such as `registry.register(user, user.id)`.

**Reach for `WeakMap`/`WeakSet` first**: they attach data to an object without keeping it alive, deterministically. MDN advises avoiding `WeakRef` and `FinalizationRegistry` where you can, since collection timing differs between engines. They fit a **cache that must not keep its keys alive**, a **backstop for non-JS resources** (a WebAssembly allocation, a file handle, a WebGL texture) behind an explicit `close()`/`dispose()` or `using` ([§9.9](/javascript/guide#99-explicit-resource-management-using-and-await-using)), and **leak detection in development**. Correctness must never depend on either.

---

**Q14: Explain the difference between `for...in`, `for...of` and `forEach`.**

`for...in` gives you **keys** (always strings) of any object, including inherited and non-index properties, so it is for plain objects, not arrays. `for...of` gives **values** of anything iterable and supports `break`, `continue` and `await`. `forEach` is an array method for side effects: it returns `undefined`, cannot be stopped (`return` acts like `continue`; `some`/`every`/`find` are the short-circuiting versions), and does not await.

```js
const arr = ['a', 'b', 'c'];
arr.custom = 'oops';                 // a property that is not an index

for (const key in arr) console.log('for...in', JSON.stringify(key));
// "0"  "1"  "2"  "custom"   ← strings, and it found the extra property

for (const val of arr) console.log('for...of', val);
// a  b  c

arr.forEach((val, i) => console.log('forEach ', i, val));
// 0 a   1 b   2 c           ← index is a real number, 'custom' ignored
```

A plain object is **not iterable**: `for (const v of {})` throws `TypeError: … is not iterable`, so loop over `Object.entries(obj)` instead. The `forEach`-does-not-await trap is the one with consequences:

```js
async function run() {
  const ids = [1, 2];

  ids.forEach(async (id) => { await null; console.log('forEach done', id); });
  console.log('forEach did NOT wait');

  for (const id of ids) { await null; console.log('for...of done', id); }
  console.log('for...of waited');
}
run();
```

```text
forEach did NOT wait
forEach done 1
forEach done 2
for...of done 1
for...of done 2
for...of waited
```

`forEach` discards the promises its callbacks return, so a rejection in one becomes an **unhandled rejection**. Use `for...of` for sequential awaits and `await Promise.all(ids.map(fn))` for concurrent ones. On sparse arrays, `forEach` skips holes, `for...of` visits them as `undefined`, and `for...in` omits their keys. → Full explanation: [§7.3](/javascript/guide#73-iteration)

---

**Q15: What are memory leaks in JavaScript and how do you prevent them?**

A memory leak is memory you no longer need that is **still reachable**, so the garbage collector may not free it (Q19). Every leak is something long-lived holding a reference it should have let go:

1. **Accidental globals**: in sloppy mode `total = 0` with no `let` creates a global property; strict mode (default in ES modules) throws instead.
2. **Listeners never removed**: remove with the *same* function reference, or in React's `useEffect` cleanup.
3. **Timers never cleared**: a running `setInterval` holds its callback's closure forever; clear it in cleanup.
4. **Closures holding big objects** somewhere long-lived (Q25).
5. **Detached DOM nodes** still referenced from a variable, array or map, with all their children.
6. **Caches that only grow**: a `Map` keyed by objects keeps them alive; a `WeakMap` does not ([§9.3](/javascript/guide#93-map-set-weakmap-weakset)).

**How to find one:** in DevTools' Memory tab, take a heap snapshot, repeat the suspect action, snapshot again and compare. Objects whose count keeps rising and "Detached" DOM elements are the leak; the Retainers panel shows what holds them.

---

**Q16: Implement a debounce function with leading and trailing options.**

**Debouncing means "wait until the noise stops"**: every call restarts a timer, and the function only runs once `delay` ms pass with no further calls, so 20 keystrokes produce one search request. **Leading** fires on the first call of a burst; **trailing** (the default) fires after it ends; with both, it fires on the first call and again at the end only if more calls arrived. A search box wants trailing; a submit button wants `leading: true, trailing: false` (act on the first click, swallow the double-click).

```js
function debounce(fn, delay, { leading = false, trailing = true } = {}) {
  let timer;                      // the pending timeout, or null/undefined when idle
  let lastArgs;                   // the most recent arguments, kept for the trailing call

  return function (...args) {
    // No timer pending means this call STARTS a burst — the leading edge.
    const callNow = leading && !timer;
    lastArgs = args;              // remember the latest args, overwriting older ones

    clearTimeout(timer);          // cancel the previous timer: this is the whole debounce

    timer = setTimeout(() => {
      timer = null;               // idle again, so the next call counts as leading
      if (trailing && lastArgs) { // lastArgs is null if the leading call already used them
        fn.apply(this, lastArgs); // apply forwards `this` and the arg list unchanged
        lastArgs = null;
      }
    }, delay);

    if (callNow) {
      fn.apply(this, args);
      lastArgs = null;            // consumed — stops a lone call firing twice
    }
  };
}
```

**The three lines that carry it:** `clearTimeout(timer)` on every call *is* the debounce (without it you have a plain delay). `!timer` identifies the leading edge, which is why the callback resets `timer = null`. `lastArgs = null` after firing stops `{ leading: true, trailing: true }` firing twice for one isolated call, matching lodash. `fn.apply(this, args)` forwards the receiver, so a debounced method keeps its `this` ([§4.3](/javascript/guide#43-this-keyword)).

```js
// Same implementation as above, so this block runs on its own.
function debounce(fn, delay, { leading = false, trailing = true } = {}) {
  let timer, lastArgs;
  return function (...args) {
    const callNow = leading && !timer;
    lastArgs = args;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (trailing && lastArgs) { fn.apply(this, lastArgs); lastArgs = null; }
    }, delay);
    if (callNow) { fn.apply(this, args); lastArgs = null; }
  };
}

const fire = (mode) => (ch) => console.log(`${mode} fired with '${ch}'`);

const trailingOnly = debounce(fire('trailing-only'), 100);
const leadingOnly  = debounce(fire('leading-only '), 100, { leading: true, trailing: false });
const both         = debounce(fire('both         '), 100, { leading: true, trailing: true });

console.log("keystrokes 'a','b','c' 30ms apart, delay = 100ms");
['a', 'b', 'c'].forEach((ch, i) => setTimeout(() => {
  trailingOnly(ch);
  leadingOnly(ch);
  both(ch);
}, i * 30));
```

```text
keystrokes 'a','b','c' 30ms apart, delay = 100ms
leading-only  fired with 'a'
both          fired with 'a'
trailing-only fired with 'c'
both          fired with 'c'
```

Leading calls fire at once with the **first** key, trailing calls ~100 ms after the last with the **latest**, and `'b'` never reaches `fn`. **The usual follow-ups:** a `cancel()` (`clearTimeout(timer); timer = null; lastArgs = null;`), which React needs in effect cleanup or the trailing call fires after unmount; a `flush()` that runs the pending call now (on submit); and a return value, which needs a promise because the real call has not happened yet. **Debounce is not throttle**: debounce waits for silence and may never fire under continuous input; throttle fires once per `delay` regardless (scroll, resize). → Both side by side: [§14.4](/javascript/guide#144-debounce-and-throttle)

---

**Q17: Explain `Object.freeze` vs `Object.seal` vs `Object.preventExtensions`.**

Three points on one scale, each a superset of the one before. They flip the object's **`[[Extensible]]`** flag and the property flags **`configurable`** (deletable/redefinable) and **`writable`**.

| Method | Add props | Delete props | Modify values | What it actually does | Check with |
|---|---|---|---|---|---|
| `Object.preventExtensions` | **No** | Yes | Yes | `[[Extensible]] = false` | `Object.isExtensible` → `false` |
| `Object.seal` | **No** | **No** | Yes | the above **+ `configurable: false`** on every own property | `Object.isSealed` |
| `Object.freeze` | **No** | **No** | **No** | the above **+ `writable: false`** on every own data property | `Object.isFrozen` |

```js
const p = Object.preventExtensions({ a: 1 });
p.b = 2;                       // ignored — cannot add
delete p.a;                    // allowed — deleting is still fine

const s = Object.seal({ a: 1 });
s.a = 5;                       // allowed — the value is still writable
delete s.a;                    // ignored — the property is locked in place
console.log(s.a);              // 5

const f = Object.freeze({ a: 1 });
f.a = 99;                      // ignored — nothing about it can change
console.log(f.a);              // 1
```

**Those writes fail silently** in sloppy mode; under `'use strict'`, and so in every ES module, they throw:

```js
'use strict';
const config = Object.freeze({ retries: 3 });
config.retries = 5;   // TypeError: Cannot assign to read only property 'retries'
```

**All three are shallow:**

```js
const obj = Object.freeze({ nested: { a: 1 } });
obj.nested.a = 99;             // works — the INNER object was never frozen
console.log(obj.nested.a);     // 99
```

A deep freeze walks the graph, with a guard against cycles:

```js
function deepFreeze(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object' || seen.has(obj)) return obj;
  seen.add(obj);
  for (const value of Object.values(obj)) deepFreeze(value, seen);
  return Object.freeze(obj);
}

const state = deepFreeze({ user: { name: 'Ada', tags: ['admin'] } });
state.user.name = 'Bob';       // now genuinely ignored
```

**What freeze does not stop:** a **setter** still runs (accessors have no `writable` flag); **`Map`, `Set` and `Date` contents** live in internal slots, so a frozen `Map` still accepts `.set(...)`; and **`const`** freezes the binding, not the value.

**On arrays:** `push` on a frozen *or sealed* array throws a `TypeError` **even in sloppy mode** (`Cannot add property 3, object is not extensible`): both are non-extensible, and `push` must add a new index. A sealed array's `length` stays writable, and `arr[0] = 9` still works.

**Where to use which.** `freeze` for constant configuration and lookup tables, and as a dev-time guard against mutation: `redux-freeze` deep-freezes state in development and Immer freezes what `produce` returns, while `redux-immutable-state-invariant` (the basis of Redux Toolkit's dev check) never freezes; it snapshots state and compares after each action. `seal` and `preventExtensions` are rare, for objects whose *shape* is a contract. For immutable updates use the ES2023 copy methods (`toSorted`, `with`, `toSpliced`, [§7.1](/javascript/guide#71-array-methods-non-mutating)). → Full explanation: [§6.3](/javascript/guide#63-object-methods)

---

**Q18: What is currying and how would you implement it?**

Currying turns `add(a, b)` into `add(a)(b)`: each call returns a new function that remembers the arguments so far in a closure, until it has them all and runs the original.

```js
// Manual currying
const add = (a) => (b) => a + b;
add(2)(3);                                  // 5
const add5 = add(5);
add5(3);                                    // 8

// Generic curry function
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
}

const curriedSum = curry((a, b, c) => a + b + c);
curriedSum(1)(2)(3);                        // 6
curriedSum(1, 2)(3);                        // 6
curriedSum(1)(2, 3);                        // 6
```

`fn.length` is the number of declared parameters (3 here); `curried` collects arguments until it has that many, which is why `curriedSum(1, 2)(3)` works too. **Why you would want it:** fix some arguments once (`const logError = log('error')`) and get a one-argument function that slots into `map`, `filter` or a `compose` pipeline. Fixing several arguments at once, as `bind` does, is *partial application*; currying is the one-at-a-time form. **The gotcha:** `fn.length` does not count a parameter with a default, anything after it, or a rest parameter, so `curry((a, b = 1) => …)` fires after one argument and `curry((...args) => …)` runs immediately.

---

**Q19: How does garbage collection work in JavaScript?**

The engine frees any object your program can no longer **reach**. It does not track whether you still "need" something, only whether a chain of references leads to it.

1. **Mark-and-sweep**: from the roots (the global object and the variables of every function on the call stack), mark everything reachable and sweep the rest, so two objects pointing only at each other are still collected.
2. **Generations, because most objects die young**: V8 allocates in the **young generation** (the "nursery"), collected often by a fast *copying* collector (Scavenge) that copies out the few survivors. Survivors move to the **old generation**, collected less often by mark-sweep plus *compaction*, which slides objects together so free memory is not fragmented.
3. **Incremental and concurrent work**: marking runs in small slices or on background threads, so pauses do not drop frames.

You cannot trigger collection; you control reachability (remove listeners, clear timers, drop references from long-lived caches and globals, use `WeakMap`/`WeakSet` for data on objects you do not own). Nulling a *local* rarely helps, since it dies when the function returns. Leaks: Q15.

---

**Q20: Explain the `Symbol` primitive. What are well-known symbols?**

`Symbol()` creates a guaranteed-unique value, used mainly as a property key that **cannot collide** with any other key, since no other code can produce the same symbol unless you hand it over. Symbol keys are skipped by `Object.keys`, `for...in` and `JSON.stringify`, which suits metadata. The description is only a debugging label:

```js
const s1 = Symbol('description');
const s2 = Symbol('description');
s1 === s2;  // false (always unique)
```

**Well-known symbols** are hooks the language looks for on your objects (as symbols, they cannot clash with your own keys):
- `Symbol.iterator` — read by `for...of`, spread, destructuring and `Array.from`; returns an iterator. A plain object has none, so it is not iterable.
- `Symbol.toPrimitive` — called when the object must become a primitive (`+obj`, `` `${obj}` ``, `obj + 1`, `obj < 5`) with a hint of `'number'`, `'string'` or `'default'`; it beats `valueOf` and `toString`.
- `Symbol.hasInstance` — a static method `x instanceof C` calls instead of walking the prototype chain (`static [Symbol.hasInstance](v) { return typeof v?.amount === 'number'; }`), which is why `instanceof` is not always a prototype check.
- `Symbol.toStringTag` — the name in `Object.prototype.toString.call(obj)`'s `[object …]`: `[object Map]`, or `[object Money]` for a class with `get [Symbol.toStringTag]() { return 'Money'; }`.

```js
class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.amount;
    return `${this.amount} ${this.currency}`;
  }
}

const price = new Money(100, 'USD');
+price;           // 100
`${price}`;       // '100 USD'
```

---

**Q21: Why is `Object.groupBy` not a drop-in replacement for Lodash's `groupBy`, and when should you use `Map.groupBy` instead?**

ES2024's `Object.groupBy` and `Map.groupBy` look like Lodash's `_.groupBy(users, 'role')` but differ in ways that break a find-and-replace:

| Aspect | Lodash `_.groupBy` | `Object.groupBy` (ES2024) | `Map.groupBy` (ES2024) |
|---|---|---|---|
| Naming the key | callback **or** `'prop'` shorthand | callback only | callback only |
| Callback receives | the value | `(element, index)` | `(element, index)` |
| Accepts | arrays, objects, strings, `null` | any **iterable** | any **iterable** |
| Key type | coerced to string | coerced to **string** | **left exactly as returned** |
| Result | plain object | object with a **`null` prototype** | a `Map` |
| Given `null` input | returns `{}` | **throws** `TypeError` | **throws** `TypeError` |

The migration traps: `Object.groupBy(users, 'role')` throws `TypeError: role is not a function`; the extra index argument breaks a callback like `parseInt` (Q46); `result.hasOwnProperty(k)` is `undefined`; and `Object.groupBy(null, fn)` or `Object.groupBy({a: 1}, fn)` throws.

**`Object.groupBy` stringifies your key; `Map.groupBy` does not:**

```js
const values = [1, '1'];

console.log('Object.groupBy ->', JSON.stringify(Object.groupBy(values, x => x)));
// {"1":[1,"1"]}          ← the number and the string collapsed into ONE group

const m = Map.groupBy(values, x => x);
console.log('Map.groupBy keys ->', [...m.keys()].map(k => typeof k).join(', '));
// number, string          ← kept apart, because a Map key can be any value
console.log('Map.groupBy get(1) ->', JSON.stringify(m.get(1)), "get('1') ->", JSON.stringify(m.get('1')));
// [1]  ["1"]

const rows = [{ id: null }, { id: undefined }];
console.log('coerced keys ->', JSON.stringify(Object.keys(Object.groupBy(rows, r => r.id))));
// ["null","undefined"]    ← the STRINGS 'null' and 'undefined', not the values
```

Group by a sometimes-missing field and you get a bucket literally named `"undefined"`; group by objects or `Date`s and they all stringify into one bucket. `Map.groupBy` compares keys by identity.

**The `null` prototype is a feature.** The obvious hand-rolled grouper breaks on inherited keys:

```js
const rows = [{ k: '__proto__', n: 1 }, { k: 'ok', n: 2 }];

const byHand = {};
try {
  for (const r of rows) (byHand[r.k] ||= []).push(r.n);
} catch (err) {
  console.log('hand-rolled ->', err.constructor.name);   // TypeError
}

const safe = Object.groupBy(rows, r => r.k);
console.log('keys ->', JSON.stringify(Object.keys(safe)));      // ["__proto__","ok"]
console.log('safe.constructor ->', typeof safe.constructor);    // undefined
console.log('safe.hasOwnProperty ->', safe.hasOwnProperty);     // undefined
console.log("Object.hasOwn(safe, 'ok') ->", Object.hasOwn(safe, 'ok'));   // true
```

`byHand['__proto__']` is not missing: it reads `Object.prototype`, which is truthy, so `||=` never assigns the array and `.push` does not exist. A `'constructor'` key fails the same visible way (`byHand.constructor.push is not a function`). The *silent* version is a counter: `counts[k] = (counts[k] || 0) + 1` with `k = 'constructor'` reads the inherited `Object` function and stores the string `"function Object() { [native code] }1"`. `Object.groupBy` starts from `Object.create(null)`, so no key collides with anything inherited; the cost is using `Object.hasOwn(result, key)`.

**Which to reach for:** `Object.groupBy` for genuine string keys and a plain, serialisable result; `Map.groupBy` for number, boolean, `Date` or object keys, or for `.size` and insertion order; Lodash only for its shorthand and forgiving input. Both native versions are in Node 21+ and every current browser. → Full explanation: [§9.7](/javascript/guide#97-grouping-and-the-new-set-methods)

---

**Q22: When would you use an iterator helper chain instead of array methods?**

Iterator helpers (ES2025) put `map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray`, `forEach`, `some`, `every` and `find` on `Iterator.prototype`, so they work on generators, `Map`s, `Set`s and DOM collections, **lazily**. Use them when the source is infinite or expensive to enumerate:

```js
function* ids() { let n = 0; while (true) yield n++; }
ids().filter(n => n % 7 === 0).take(3).toArray();   // [0, 7, 14]
```

or when you need only a prefix: `bigArray.filter(f).map(g).slice(0, 10)` builds two full intermediate arrays, while `bigArray.values().filter(f).map(g).take(10).toArray()` pulls about ten items and stops. Trade-offs to name: iterators are **single-use** (a second `toArray()` silently returns `[]`), have no `length` and no `sort`, and for small arrays array methods are *faster*, because laziness costs a function call per element per stage. → Full explanation: [§9.8](/javascript/guide#98-iterator-helpers-lazy-array-methods-for-anything-iterable)

---

**Q23: What problem do `using` and `await using` solve that `try`/`finally` does not?**

Explicit resource management (ES2027) ties cleanup to a variable's **scope**. That fixes three things about `try`/`finally`: acquisition and release can be a hundred lines apart (and a later `return` in the middle is easy to get wrong); three resources need three nested blocks instead of three `using` lines; and the contract becomes *declarative*, since a type with `[Symbol.dispose]` advertises that it must be cleaned up, so forgetting becomes a lint error instead of a leak.

Points interviewers look for: disposal runs on **every** exit path, including a throw; it runs in **reverse order of declaration**; `using` bindings are implicitly `const`; `null`/`undefined` are skipped, so conditional acquisition is safe; `await using` *awaits* an `[Symbol.asyncDispose]`, which is why it exists separately; and `DisposableStack`/`AsyncDisposableStack` handle a dynamic number of resources. → Full explanation and examples: [§9.9](/javascript/guide#99-explicit-resource-management-using-and-await-using)

---

**Q24: `Temporal` has eight main types where `Date` had one. How do you choose, and why does the choice matter?**

The choice encodes a business decision. The core split is **instant versus calendar**: `Temporal.Instant` or `ZonedDateTime` for something that happens once at one moment (a log entry, a payment, a meeting); `PlainDate` for a calendar date with no instant (a birthday, a hotel check-in, an invoice due date); `PlainTime` for a wall-clock time ("the shop opens at 09:00", a different instant in summer and winter); and `Duration` for a length of time, deliberately not milliseconds because "one month" has no fixed length.

The classic bug: a daily 9 a.m. standup stored as a fixed UTC instant drifts to 8 or 10 a.m. after a daylight-saving switch; it is a `PlainTime` plus a zone. Also name: objects are **immutable** (`date.add({ months: 1 })` returns a new one), months are 1-based, parsing is strict ISO 8601, and month-end arithmetic **clamps**: `2026-01-31` plus one month is `2026-02-28`, where `Date`'s `setMonth` rolls over to March 3. → Full explanation: [§9.10](/javascript/guide#910-the-temporal-api-the-replacement-for-date)

---

**Q25: What does a closure actually hold a reference to, and how does that cause a memory leak?**

A closure holds its scope's **variable environment**: the live bindings, not copies of values. V8 keeps only the variables some closure actually reads, but **every closure created in one call shares a single scope object**, so a closure can pin a variable that only a sibling uses. As long as the function is reachable, everything in that shared scope is too.

```js
function attachHandler() {
  const rows = new Array(100000).fill(0).map((_, i) => ({ id: i }));  // ~MBs
  const summary = rows.length;
  const dumpRows = () => console.log(rows);   // a second closure that reads `rows`

  // The handler only reads `summary`, but it shares one scope object with
  // dumpRows, and `rows` is in that scope because dumpRows uses it.
  document.addEventListener('click', () => console.log(summary));
}
attachHandler();
// `rows` can never be collected: listener → closure → shared scope → rows.
// Delete dumpRows and V8 keeps only `summary`, so `rows` is freed.
```

**Describe the chain:** the listener registry holds the closure, the closure its scope, the scope its objects. A never-removed listener, an uncleared `setInterval`, a subscription with no unsubscribe, and a detached DOM node kept in an array (with its subtree) are all this bug. In React, an effect that subscribes without returning a cleanup leaks **once per mount**:

```text
useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);   // ← same reference
}, []);
```

Remove the *same function reference* you added (an inline arrow in both calls removes nothing), and confirm the fix: heap snapshot, exercise the flow, force GC, snapshot again, and look for **Detached HTMLElement** entries and growing retained size in the Retainers panel. → Closures from scratch: [§5.2](/javascript/guide#52-closures)

---

**Q26: Implement `once(fn)` — and say why it is asked.**

`once` runs a function on the first call, caches the result, and returns that result on every later call. It generalises `addEventListener(type, fn, { once: true })` and Node's `emitter.once` to one-time setup (a DB connection, an SDK), a submit handler that must not double-fire, a one-time deprecation warning, or a singleton.

```js
function once(fn) {
  let called = false, result;
  return function (...args) {
    if (called) return result;
    called = true;
    result = fn.apply(this, args);
    fn = null;
    return result;
  };
}

let ran = 0;
const init = once(() => {
  ran++;
  console.log('  expensive setup running...');
  return { ready: true };
});

console.log('1st call ->', JSON.stringify(init()));
console.log('2nd call ->', JSON.stringify(init()));
console.log('3rd call ->', JSON.stringify(init()));
console.log('same object every time ->', init() === init());
console.log('times the original ran ->', ran);
```

```text
  expensive setup running...
1st call -> {"ready":true}
2nd call -> {"ready":true}
3rd call -> {"ready":true}
same object every time -> true
times the original ran -> 1
```

It is asked because those few lines test four things:

- **Closures as private state**: `called` and `result` live in the closure ([§5.2](/javascript/guide#52-closures)); on the function (`wrapper.called = true`) any caller could reset the guard.
- **`this` forwarding**: without `fn.apply(this, args)`, `obj.method = once(obj.method)` loses its receiver, and an **arrow** wrapper has no `this` to forward.
- **Caching the result**: the common wrong answer returns `undefined` after the first call.
- **Releasing the reference**: `fn = null` lets the original and its closure be collected (Q25).

**The async follow-up:** if `fn` is async, three callers arriving before it finishes would each start a request. Cache the **promise**:

```js
function onceAsync(fn) {
  let promise;
  return function (...args) {
    promise ??= fn.apply(this, args);   // only the first call ever invokes fn
    return promise;                     // everyone else awaits the same promise
  };
}

let hits = 0;
const connect = onceAsync(async () => {
  hits++;
  await null;
  return 'connection#' + hits;
});

Promise.all([connect(), connect(), connect()]).then((results) => {
  console.log('all three callers got ->', JSON.stringify(results));
  console.log('underlying calls ->', hits);
});
```

```text
all three callers got -> ["connection#1","connection#1","connection#1"]
underlying calls -> 1
```

**Its trap is failure:** a rejected promise is cached too, so one transient error is returned to every future caller; production versions clear `promise` in a `.catch` so the next call retries. A **`reset()`** can be exposed deliberately (`wrapper.reset = () => { called = false; }`) precisely because nothing else can reach `called`.

---

**Q27: What is the difference between an arrow function and a normal function?**

The real difference is that **an arrow has no `this` of its own**. It also has no `arguments`, `new.target` or `prototype`, and closes over the enclosing scope's like any other variable.

| Aspect | Normal function | Arrow function |
|---|---|---|
| `this` | Set by the **call site** (method call, `call`/`apply`/`bind`, or default) | Inherited from the **enclosing scope**, fixed at definition |
| `arguments` | Its own object | The enclosing function's, or a `ReferenceError` at top level |
| `new` | Constructible | `TypeError: X is not a constructor` |
| `prototype` | Has one | Does not have one |
| Hoisting | Declarations hoist and are callable early | Assigned to a variable, so subject to the temporal dead zone |

```js
const counter = {
  count: 41,
  normal() { return this === counter ? this.count + 1 : "lost this"; },
  arrow: () => (this === counter ? "found it" : "this is NOT the object"),
};
console.log("method :", counter.normal());
console.log("arrow  :", counter.arrow());

function Legacy() {}
const Arrow = () => {};
console.log("normal .prototype :", typeof Legacy.prototype);
console.log("arrow  .prototype :", typeof Arrow.prototype);
try { new Arrow(); } catch (e) { console.log("new Arrow() ->", e.constructor.name); }

function counted() { return arguments.length; }
console.log("normal arguments  :", counted(1, 2, 3));
```

```text
method : 42
arrow  : this is NOT the object
normal .prototype : object
arrow  .prototype : undefined
new Arrow() -> TypeError
normal arguments  : 3
```

`this is NOT the object` is the lesson: an object literal creates no scope, so an arrow written as a property closes over the `this` outside the literal and can never see its object.

#### Where each one is the right answer

**Use a normal function** when the caller supplies `this`: object, class and prototype methods, and callbacks a library calls with a receiver (jQuery-style callbacks, Mocha's `this.timeout()`, a Vue `methods` entry). **Use an arrow** to *keep* the `this` you have, the bug arrows were introduced to remove (pre-ES6 code is full of `const self = this` and `.bind(this)`):

```js
class Poller {
  constructor() { this.hits = 0; }
  start() {
    // Arrow: `this` is still the Poller. A normal function here would get the
    // timer's own `this` (window in a browser, a Timeout object in Node), not the Poller.
    setTimeout(() => { this.hits++; console.log('hits ->', this.hits); }, 0);
  }
}
new Poller().start();
```

```text
hits -> 1
```

**Worth volunteering:** a **class field** (`handleClick = () => {}`) gives a permanently bound handler at the cost of one copy per instance instead of a shared prototype method. Arrows cannot be **generators** and inherit `super` and `new.target`. And the genuine trap: `() => ({ ok: true })` returns an object only when parenthesised; `() => { ok: true }` is a block with a label and returns `undefined`. → Full explanation: [§4.2](/javascript/guide#42-arrow-functions), [§4.3](/javascript/guide#43-this-keyword)

---

**Q28: What is the difference between `map()`, `filter()` and `reduce()`, and how do you choose between them?**

All three walk an array and **return something new without changing the original**; the *shape* of the result is how you choose.

| Method | Returns | Length of result | Callback returns | Use it when |
|---|---|---|---|---|
| `map` | a new array | **always the same** as the input | the new value for this slot | transforming every item: prices to strings, users to `<li>`s |
| `filter` | a new array | **same or shorter** | true/false: keep this item? | selecting a subset: paid orders, active users |
| `reduce` | **anything**: number, object, array, Map | n/a | the new accumulator | combining many items into one: a total, a lookup by id, a count per group |

*Same number of things, changed?* `map`. *Fewer, unchanged?* `filter`. *One thing out of many?* `reduce`. They chain in that order.

```js
const orders = [
  { id: 1, total: 40, paid: true },
  { id: 2, total: 15, paid: false },
  { id: 3, total: 60, paid: true },
];

// Chained: revenue from paid orders
const revenue = orders
  .filter(o => o.paid)
  .map(o => o.total)
  .reduce((sum, t) => sum + t, 0);
console.log(revenue);                                   // 100

// Gotcha 1: map passes (value, index, array)
console.log(['1', '2', '3'].map(parseInt));             // [1, NaN, NaN]

// Gotcha 2: filter(Boolean) also drops 0
console.log([0, 1, 2, null].filter(Boolean));           // [1, 2]

// Gotcha 3: reduce with no initial value throws on an empty array
try {
  [].reduce((a, b) => a + b);
} catch (e) {
  console.log(e.constructor.name);                      // TypeError
}
```

- **`map` passes `(value, index, array)`**, so `map(parseInt)` makes the index the radix (Q46). Write `map(Number)` or `map(s => parseInt(s, 10))`.
- **`filter` keeps anything truthy**: `filter(Boolean)` also drops `0`, `''` and `NaN`. If `0` is valid, write `filter(x => x != null)`.
- **Always give `reduce` an initial value**, or it throws on an empty array and starts with the wrong type when building an object.

**When not to use them:** a `reduce` that needs a comment is clearer as a `for...of` loop; side effects (logging, DOM updates) belong in `forEach` or a loop, not `map`; and in a hot path over large arrays, each chained step is another full pass. → Full explanation: [§7.1](/javascript/guide#71-array-methods-non-mutating)

---

**Q29: A variable captured by a closure keeps returning an outdated value. Why does this happen, and how is it different from a closure retaining memory unnecessarily?**

Both come from a closure keeping a reference to its scope's variables for as long as the closure lives. A **stale closure** holds the *wrong variable*, so it shows an old value. A **retaining closure** holds the *right variable for too long*, so memory is never freed.

```js
// 1. A closure reads the LIVE variable, not a snapshot
let live = 0;
const read = () => live;
live = 5;
console.log('live binding:', read());        // 5

// 2. Stale: each call makes a NEW variable, and the old closure keeps the old one
function render(count) {
  return () => console.log('handler sees', count);
}
const registered = render(0);   // registered once, like an effect with []
render(1);
render(2);                      // newer renders, newer variables, nobody listening
registered();                   // handler sees 0

// 3. Retention: the value is correct, it just lives far too long
function attach() {
  const big = new Array(1_000_000).fill('x');
  return () => big.length;      // keeps all of big alive while this function is reachable
}
const handlers = [attach()];
console.log('still reachable:', handlers[0]());   // 1000000
handlers.length = 0;            // drop the last reference and the array can be collected
```

**Staleness** is not a snapshot (part 1 sees `5`): each call creates a **new variable**, and an old closure stays attached to an old one. Every React render has its own `count`, so a callback registered in the first render (an effect with `[]`, a `setInterval`, a subscription) reads render one's `count` forever. **Retention** is reachability: while something long-lived references the closure, everything it can see stays in memory, including the whole response when you needed one field, and anything a sibling closure from the same scope captured (Q25).

| Aspect | Stale closure | Retained memory |
|---|---|---|
| Symptom | Wrong, old value | Correct value, memory grows |
| Cause | Closure attached to an **old** variable | Closure **still reachable** from something long-lived |
| Where it shows up | Effects, timers and subscriptions in React | Listeners, intervals, caches that are never cleaned up |
| Fix | List it in the dependencies, functional update `setCount(c => c + 1)`, or a ref holding the latest value | Clean up listeners, intervals and subscriptions; copy out only the field you need; null out long-lived references |

---

**Q30: An error thrown inside an asynchronous callback escapes the surrounding `try/catch`. Why, and where should the error be handled?**

`try/catch` only catches errors thrown **while its block is on the call stack**. `setTimeout(cb)`, `.then(cb)` and an event listener only *schedule* `cb`; by the time the event loop calls it from an empty stack, the `try` is long gone, so the error is reported as uncaught (or as an unhandled rejection for a promise).

```text
try {
  setTimeout(() => {
    throw new Error('boom');   // runs later, from a new, empty call stack
  }, 0);
} catch (e) {
  console.log('never runs');   // the try block finished long ago
}

try {
  loadUser();                  // returns a rejected promise; nothing throws here
} catch (e) {
  console.log('never runs');   // missing await: the rejection skips this
}
```

(Tagged as plain text on purpose: running them produces real uncaught errors.) Handle the error where the code actually runs:

```js
async function loadUser() {
  await null;
  throw new Error('network down');
}

// 1. await inside try: the error comes back into this function
async function withAwait() {
  try {
    await loadUser();
  } catch (e) {
    console.log('1 await + try:', e.message);
  }
}

// 2. .catch on the promise
loadUser().catch(e => console.log('2 .catch:', e.message));

// 3. try/catch INSIDE the callback, where the code actually runs
setTimeout(() => {
  try {
    throw new Error('timer failed');
  } catch (e) {
    console.log('3 inside the callback:', e.message);
  }
}, 0);

withAwait();
```

In order of preference: **`await` inside `try`** (the usual bug is a missing `await`); **`.catch()`** at the *end* of the chain outside `async` code (one that returns a value turns the failure into a success); **`try/catch` inside the callback** for timers and listeners; and **global handlers** (`window` `'error'` and `'unhandledrejection'`) as a safety net for reporting, not recovery ([§10.1](/javascript/guide#101-global-error-handling-error-boundaries-outside-react)).

`2` prints before `1` because `withAwait()` is called last and needs one more microtask to resume; the timer prints last because it is a task. The React version: an error boundary is a `try/catch` around rendering, so it cannot catch errors in event handlers or a `fetch` ([React Q56](/frontend/react-interview-questions)).

---

### How JavaScript Works Under the Hood

Short interview answers. The full explanations, with runnable examples, are in [§1](/javascript/guide#1-what-is-javascript).

**Q31: What actually happens when the browser runs your JavaScript?**

An **engine** (V8 in Chrome and Node, SpiderMonkey in Firefox, JavaScriptCore in Safari) parses the code into a syntax tree, turns it into bytecode and starts running it, then compiles the functions that run often into fast machine code (JIT compilation), and throws that code away again if its assumptions stop holding (deoptimisation). The **runtime** around it, the browser or Node, supplies everything that is not the language: timers, `fetch`, the DOM, files, and the event loop. That split is why `setTimeout` exists in both but `document` only in the browser. While it runs, the call stack tracks what is executing, the heap holds objects, and the garbage collector frees what nothing can reach. → Full explanation: [§1.1](/javascript/guide#11-the-engine-and-the-runtime-what-happens-when-your-code-runs)

---

**Q32: What is an execution context, and how does the call stack work?**

Each function call creates an **execution context** (its local variables, its `this`, and a link to the outer scope), which is pushed onto the **call stack**; returning pops it. Only the top one is running. Each context is set up in two phases: a creation phase, where function declarations are stored whole, `var` becomes `undefined` and `let`/`const` are reserved but not ready (the temporal dead zone), then the execution phase. That creation phase is what "hoisting" means. Unbounded recursion overflows the stack with a `RangeError`, and async callbacks only run once the stack is empty. → Full explanation: [§1.2](/javascript/guide#12-execution-context-and-the-call-stack)

---

**Q33: How do function references work? What is the difference between `fn` and `fn()`?**

A function is an object, and its name is a variable holding a **reference** to it. `fn` is the function itself; `fn()` runs it and gives you the result. Three bugs follow from mixing them up: `setTimeout(save(), 1000)` runs `save` immediately; `removeEventListener` with a freshly written arrow removes nothing, because it is a different function object; and passing `user.greet` on its own loses `this`, because the reference does not carry the object with it. → Full explanation: [§1.3](/javascript/guide#13-function-references-functions-are-values)

---

**Q34: What is a Web Worker (a worker thread), and when should you use one?**

A worker is a **second JavaScript thread** with its own call stack, memory and event loop. It cannot touch the DOM, and it talks to the main thread only through `postMessage`, which **copies** the data (large buffers can be *transferred* instead). Use one for CPU-heavy work over roughly 50 ms (parsing, image processing, compression) so the page stays responsive. It does not help with network requests, which are already non-blocking, or with DOM updates. Know the kinds apart: dedicated and shared workers compute; a Service Worker is a network proxy; Node has the same idea as `worker_threads`. → Full explanation: [§1.7](/javascript/guide#17-web-workers-and-worker-threads-real-parallelism)

---

### About the Language Itself

Questions interviewers use to open a conversation, or to check you understand the platform and not just the syntax.

**Q35: Why is JavaScript so popular, and why do most companies use it?**

**Short answer:** it is the only language every browser runs, and Node.js let it run on servers too, which gave it the largest developer community and package ecosystem (npm). It was the most-used language in Stack Overflow's 2025 survey, at 66% of respondents. For a company that means **one language** for web, back end (Node.js), mobile (React Native) and desktop (Electron); easy **hiring**; fast building with npm; and **good enough performance** thanks to JIT compilers and non-blocking I/O. A strong answer also names the trade-offs: permanent quirks, dynamic typing (hence TypeScript), and one thread for your code (hence workers). → Full explanation with the history: [§1.8](/javascript/guide#18-why-javascript-is-everywhere)

---

**Q36: What is the difference between JavaScript and ECMAScript? Who decides what gets added to the language?**

**Short answer:** **ECMAScript** is the *specification* (ECMA-262). **JavaScript** is the language as implemented by engines such as V8, SpiderMonkey and JavaScriptCore, plus whatever the environment adds (the DOM in browsers, `fs` in Node). "ES2015" or "ES2024" names a version of the specification.

It is maintained by **TC39**, an Ecma International committee of browser makers, companies and invited experts. New features go through numbered **stages**:

| Stage | Meaning |
|---|---|
| **0** | an idea someone has proposed |
| **1** | the committee agrees the problem is worth solving |
| **2** | a draft of the solution is chosen |
| **2.7** | the design is approved; tests are being written (this stage was added in 2024) |
| **3** | ready to implement; engines start shipping it, often behind a flag |
| **4** | finished: two engines ship it, and it goes into the next yearly edition |

A new edition comes out every June, but what matters in practice is whether your target engines support a feature, not the edition number ([§9.6](/javascript/guide#96-which-version-shipped-what-the-baseline-table) lists what shipped when). **Two facts people get wrong:** JavaScript has nothing to do with Java apart from a 1995 marketing name, and `setTimeout`, `fetch` and `document` are not ECMAScript at all; they come from the browser or Node ([§1.1](/javascript/guide#11-the-engine-and-the-runtime-what-happens-when-your-code-runs)).

---

**Q37: Is JavaScript compiled or interpreted?**

**Short answer:** both, so "interpreted" is outdated. Engines start by **interpreting** bytecode so code runs immediately, then **compile** hot functions to machine code while the program runs: **just-in-time (JIT) compilation**.

In V8, the Ignition interpreter runs bytecode at once; optimising compilers (Maglev, then TurboFan) compile hot functions using the types seen so far, and a broken assumption (a string where there were always numbers) throws the fast code away (deoptimisation). Unlike C or Go, compiled **ahead of time**, JavaScript ships as source and is compiled on the user's machine every time, which is also why one syntax error stops the whole file before its first line runs. → Full explanation with a runnable example: [§1.1](/javascript/guide#11-the-engine-and-the-runtime-what-happens-when-your-code-runs)

---

**Q38: Why do most teams use TypeScript instead of plain JavaScript today?**

**Short answer:** TypeScript is JavaScript with **type annotations** that are checked before the code runs and then removed. It catches a class of bugs at build time instead of in production and makes large codebases safe to change, with no runtime cost.

It buys mistakes caught in the editor (wrong arguments, a missing property, a forgotten `null`), **safe refactoring** (rename a field and the compiler lists every place to change), documentation that cannot go stale, and **contracts between services**, such as types generated from an OpenAPI description, so a backend change breaks the frontend build rather than the live app. **It does not** check anything at runtime. Data from an API, `JSON.parse` or `localStorage` can still be the wrong shape, so you validate at those boundaries ([TypeScript Q27](/javascript/typescript-interview-questions)). It adds a build step and some learning, which is why small scripts and prototypes often stay in plain JavaScript.

---

**Q39: What are JavaScript's weaknesses, and when would you choose a different language?**

**Short answer:** JavaScript is a poor fit for **CPU-heavy work** and for systems that need **tight performance or memory control**, and it carries **permanent quirks** from its early design.

| Weakness | Why it exists | What people do about it |
|---|---|---|
| Quirks: `==` coercion, `typeof null`, `this` rules | the web can't break old sites, so early mistakes stay forever | `===`, linters, `strict` mode, modern syntax |
| Dynamic typing | designed for small scripts | TypeScript |
| One thread for your code | a simple, safe model for UI code ([§1.4](/javascript/guide#14-why-is-javascript-called-single-threaded)) | workers for CPU-heavy work ([§1.7](/javascript/guide#17-web-workers-and-worker-threads-real-parallelism)) |
| Less predictable performance than compiled languages | JIT compilation and garbage collection | fine for most apps; hot paths can move to WebAssembly or a native service |
| Huge dependency trees | a culture of small packages | lockfiles, auditing, fewer dependencies |

**Pick another language** for heavy computation (**Python** for ML and data libraries, **C++/Rust/Go** for speed), systems programming (**Rust, C, C++**), high-throughput concurrent back ends (**Go, Java, Kotlin, C#**), or native mobile features (**Swift**, **Kotlin**, though React Native covers most apps). **End balanced:** the front end has no real alternative, and for back ends that mostly wait on databases and APIs Node.js is fine. The weakness matters only when the work is computing, not waiting.

---

**Q40: Why do we need closures? What would you use them for?**

**Short answer:** closures let a function **keep data between calls without making it global**. Without them, remembered data would be a global variable or an object property, both of which any code can change. A closure gives a third option: data only the functions created alongside it can reach. Q2 covers *what* a closure is; this is *why*.

```js
// 1. Private state: nothing outside can change `balance` except through the methods.
function createAccount(initial) {
  let balance = initial;
  return {
    deposit(amount) { balance += amount; return balance; },
    getBalance() { return balance; },
  };
}
const account = createAccount(100);
account.deposit(50);
console.log(account.getBalance(), account.balance);

// 2. A function factory: each returned function remembers its own setting.
const multiplier = (factor) => (n) => n * factor;
const double = multiplier(2);
const triple = multiplier(3);
console.log(double(5), triple(5));

// 3. Remembering between calls: a cache that lives as long as the function.
function memoize(fn) {
  const cache = new Map();
  return (n) => {
    if (!cache.has(n)) cache.set(n, fn(n));
    return cache.get(n);
  };
}
let calls = 0;
const slowSquare = (n) => { calls++; return n * n; };
const fastSquare = memoize(slowSquare);
fastSquare(9); fastSquare(9); fastSquare(9);
console.log('computed', calls, 'time');
```

```text
150 undefined
10 15
computed 1 time
```

| Line | What the closure is doing |
|---|---|
| `150 undefined` | **private state.** `balance` is reachable only through `deposit` and `getBalance`; `account.balance` does not exist, so nothing can set it to a million |
| `10 15` | **a function factory.** `double` and `triple` are the same code, each remembering its own `factor` |
| `computed 1 time` | **remembering between calls.** The `cache` lives as long as `fastSquare` does, so the slow work runs once |

**Where you already use them:** event handlers that still know `userId` long after the surrounding function returned; `debounce`, `throttle`, `once` and `memoize` (Q16, Q26); React hooks, where every function in a component closes over that render's props and state (and goes stale, Q29); modules and the module pattern; and partial application and currying (Q18). **The cost:** a long-lived closure can keep large objects in memory (Q25). → More patterns: [§5.4](/javascript/guide#54-closures-in-the-wild)

---

**Q41: What are global and local variables in JavaScript?**

**Short answer:** a **global** variable is declared outside every function and block, so any code can read and change it, and it lives as long as the page. A **local** variable is declared inside a function or block (`{ … }`), visible only there, and created fresh on each call.

```js
let count = 0;                       // global (top level): every function below can see it

function increment() {
  let step = 1;                      // local: exists only while this call runs
  count += step;
  return count;
}

increment();
increment();
console.log(count);
console.log(typeof step);            // step was local to increment, so it is gone

function shadow() {
  let count = 100;                   // a NEW local that hides the global one
  return count;
}
console.log(shadow(), count);

if (true) {
  const blockOnly = 'inside';        // let/const: local to the braces
  var leaksOut = 'function-wide';    // var ignores blocks
}
console.log(typeof blockOnly, leaksOut);

function forgetsDeclaration() {
  'use strict';
  try {
    total = 5;                       // no let, const or var
  } catch (e) {
    console.log(e.name);
  }
}
forgetsDeclaration();
```

```text
2
undefined
100 2
undefined function-wide
ReferenceError
```

| Output | Why |
|---|---|
| `2` | `increment` changed the global `count` twice |
| `undefined` | `step` was local to `increment`; outside it, the name does not exist |
| `100 2` | `shadow`'s own `count` **shadows** (hides) the global one inside the function; the global is untouched |
| `undefined function-wide` | `const` is local to the `if` block, `var` is local to the whole function (or global at top level), so it leaks out of the block |
| `ReferenceError` | assigning to a name that was never declared. Strict mode throws; sloppy mode silently creates a global, which is the accidental-global bug |

- **Where "global" lives.** In a classic `<script>`, top-level `var` and function declarations become properties of the global object (`window`, or `globalThis` anywhere), so `var x = 1` sets `window.x`; top-level `let`/`const` are global but **not** on `window`. In an **ES module** or a Node CommonJS file the top level is the module's own scope, so nothing is global unless you write `globalThis.x = …`.
- **Lookup goes inside out** along the scope chain ([§5.1](/javascript/guide#51-scope-chain)), which is why a local can shadow a global and a closure can read its outer function's locals (Q2).
- **Avoid globals**: any script can overwrite them (two libraries both defining `config`), tests leak state through them, and they live as long as the page. Prefer locals, arguments, module state and closures (Q40).

→ `var` versus `let`/`const` scoping: [§3.1](/javascript/guide#31-var-vs-let-vs-const) and Q5.

---

**Q42: Explain timers in JavaScript.**

**Short answer:** `setTimeout(fn, ms)` runs `fn` once after **at least** `ms` milliseconds, and `setInterval(fn, ms)` runs it every `ms`. Each returns an id for `clearTimeout`/`clearInterval`. The browser or Node provides them (they are not part of the language), and a due callback joins the **task queue**, so it runs only after the current code and all pending Promise callbacks ([§11](/javascript/guide#11-the-event-loop)).

```js
console.log('1 sync');

const id = setTimeout(() => console.log('never runs'), 0);
clearTimeout(id);                                   // cancelled before it was due

setTimeout((name) => console.log('3 timeout, hello ' + name), 0, 'Ada');   // extra args go to the callback

Promise.resolve().then(() => console.log('2 microtask first'));

let ticks = 0;
const intervalId = setInterval(() => {
  ticks++;
  console.log('4 tick', ticks);
  if (ticks === 3) clearInterval(intervalId);       // without this it runs forever
}, 10);
```

```text
1 sync
2 microtask first
3 timeout, hello Ada
4 tick 1
4 tick 2
4 tick 3
```

A `0` ms timeout still runs **after** the Promise callback, and the cancelled timeout never runs.

**The details interviewers look for:**

- **The delay is a minimum.** A busy main thread delays every timer. Timers nested five levels deep get at least 4 ms, and hidden tabs run them at most about once a second (Chrome slows long-hidden pages further). Measure time with `performance.now()` or `Date.now()`, never a timer.
- **`setInterval` does not wait for your work**, so slow or async callbacks can pile up. When each run must finish first, use a **recursive `setTimeout`**:

```js
function poll(times) {
  let n = 0;
  function tick() {
    n++;
    console.log('poll', n);
    if (n < times) setTimeout(tick, 10);   // the next run is scheduled only after this one finished
  }
  setTimeout(tick, 10);
}
poll(3);
```

```text
poll 1
poll 2
poll 3
```

- **Always clear what you start.** An uncleared interval keeps its callback and everything it references alive (Q15, Q25). In React: `useEffect(() => { const id = setInterval(tick, 1000); return () => clearInterval(id); }, [])`.
- **The id differs by platform.** Browsers return a number; Node returns a `Timeout` object with `.unref()`, which lets the process exit while the timer is pending.
- **There is a maximum delay.** Above 2,147,483,647 ms (about 24.8 days) it overflows a 32-bit integer and fires almost immediately.
- **`this` inside a callback.** A plain `function` passed to `setTimeout` does not get your object as `this`. Use an arrow function, or `bind`.

| API | Runs when | Use it for |
|---|---|---|
| `setTimeout` / `setInterval` | after a delay, as a task | delays, polling, debounce |
| `queueMicrotask` / `Promise.then` | right after the current code, before any task | finishing work before the browser paints or handles input |
| `requestAnimationFrame` | just before the next paint (about every 16 ms at 60 Hz) | animation (see the [Browser APIs guide](/frontend/browser-apis), Q10) |
| `requestIdleCallback` | when the browser has nothing else to do | low-priority work such as analytics |
| `setImmediate` (Node only) | after the current I/O phase | yielding inside Node's event loop |

Debounce (Q16) and `once` (Q26) are built on `setTimeout` plus a closure, and [tricky Q27](/javascript/tricky-questions) shows how `var` and `let` change what timer callbacks print.

---

**Q43: Is JavaScript a statically typed or a dynamically typed language?**

**Short answer:** **dynamically typed.** A type belongs to a **value**, not a variable: a variable can hold a number now and a string later, and nothing checks types until the line runs. In a **statically typed** language (Java, C#, Go, Rust, TypeScript) each variable has a fixed type checked by a compiler **before** the program runs.

```js
let value = 42;
console.log(typeof value);
value = 'forty-two';                    // allowed: the variable has no type, the value does
console.log(typeof value);
value = { n: 42 };
console.log(typeof value);

console.log('5' * 2, '5' + 2);          // weak typing: mixed types are converted silently

function shout(text) {
  return text.toUpperCase();
}
console.log(shout('hi'));
try {
  shout(42);                            // nothing objects until this line runs
} catch (e) {
  console.log(e.constructor.name + ': ' + e.message);
}
```

```text
number
string
object
10 52
HI
TypeError: text.toUpperCase is not a function
```

**Follow-up: JavaScript is also weakly typed, a separate question.** Static/dynamic asks **when** types are checked; strong/weak asks **how strictly** the language refuses to mix them. JavaScript converts silently (`'5' * 2` is `10`, `'5' + 2` is `'52'`, [§2.4](/javascript/guide#24-type-coercion)), so it is dynamic **and** weak. Python is dynamic but strong: `'5' + 2` raises a `TypeError`.

| Language | Checked when | Mixing types |
|---|---|---|
| JavaScript | at runtime (dynamic) | converted silently (weak) |
| Python | at runtime (dynamic) | raises an error (strong) |
| TypeScript | before running (static), then erased | follows JavaScript at runtime |
| Java, C#, Go | before running (static) | mostly refused (strong) |

**The trade-off:** dynamic typing is quick and flexible, but `shout(42)` fails only when that line runs, possibly in production. Hence **TypeScript** (Q38), whose types are erased, so the program stays dynamically typed. At runtime you check types with `typeof`, `Array.isArray` and `instanceof` ([tricky Q33](/javascript/tricky-questions) covers `typeof`'s surprises).

---

**Q44: How do you handle `null` in JavaScript?**

**Short answer:** check with `== null` (catches `null` and `undefined` together), default with `??` rather than `||`, read safely with `?.`, and at system boundaries (API responses, user input, storage) fail early with a clear error instead of letting a `null` travel until something crashes. Where you can, design it away: return an empty array instead of `null`, and let TypeScript's `strictNullChecks` find what you forgot.

```js
const user = { name: 'Ada', age: 0, address: null, tags: [] };

// 1. == null is true for null AND undefined, and for nothing else
console.log(user.address == null, user.phone == null, user.age == null);

// 2. || replaces every falsy value (0, '', false); ?? replaces only null and undefined
console.log(user.age || 18, user.age ?? 18);

// 3. ?. stops at null and gives undefined instead of throwing
console.log(user.address?.city);
console.log(user.address?.city ?? 'No city');

// 4. Default parameters fill in undefined, NOT null
function greetBroken(name = 'guest') { return 'Hi ' + name; }
function greet(name) { return 'Hi ' + (name ?? 'guest'); }
console.log(greetBroken(undefined), greetBroken(null));
console.log(greet(null));

// 5. ??= assigns only when the current value is null or undefined
const settings = { theme: null, fontSize: 0 };
settings.theme ??= 'light';
settings.fontSize ??= 16;
console.log(settings);

// 6. At a boundary, fail fast with a message that names the problem
function requireValue(value, label) {
  if (value == null) throw new Error(label + ' is required');
  return value;
}
try {
  requireValue(user.address, 'address');
} catch (e) {
  console.log(e.message);
}
```

```text
true true false
18 0
undefined
No city
Hi guest Hi null
Hi guest
{ theme: 'light', fontSize: 0 }
address is required
```

| Technique | Use it for | The trap it avoids |
|---|---|---|
| `x == null` | "is it missing?" | `=== null` misses `undefined`, and `!x` wrongly rejects `0`, `''` and `false` |
| `a ?? b` | defaults | `a \|\| b` replaces a real `0` or `''` (an age of 0 became 18 above) |
| `a?.b`, `a?.()`, `a?.[i]` | data that is genuinely optional | `Cannot read properties of null` |
| `??=` | filling in missing settings | overwriting a deliberate `0` or `false` |
| Guard clause + `throw` | values that must exist | a `null` that crashes three functions later, far from the cause |

**How to present it:**

- **Decide whether `null` is allowed first.** On required data `?.` hides a bug by turning a crash into a silent `undefined`; check once at the boundary and throw.
- **Avoid producing `null`**: return `[]` for an empty list; the **Null Object pattern** (a harmless stand-in, such as a guest user with no permissions) does the same for objects.
- **Know where it comes from:** `document.querySelector` finding nothing, `localStorage.getItem` for a missing key, `JSON.parse('null')`, a database `NULL`, API fields. `JSON.stringify` keeps `null` but drops `undefined` properties.
- **In TypeScript**, `strictNullChecks` makes `null` part of the type (`string | null`) until you handle it ([TypeScript Q19 and Q29](/javascript/typescript-interview-questions)).

Q3 covers `null` versus `undefined`; [tricky Q39 and Q49](/javascript/tricky-questions) show default parameters ignoring `null` and how far `?.` short-circuits.

---

**Q45: A variable is declared globally, and a variable with the same name is defined again inside a function. There is a `console.log` inside the function and another outside it. What gets printed?**

**Short answer:** it depends on **how** the inner variable is declared and **where** the `console.log` sits:

- **Redeclared with `var`, `let` or `const`, logged after the declaration:** inside prints the local value, outside the global one. This is **shadowing**.
- **Assigned without a keyword:** no new variable, so the global itself changes.
- **Logged before a `var` declaration:** `undefined`, because of hoisting.
- **Logged before a `let`/`const` declaration:** a `ReferenceError`, because of the Temporal Dead Zone (TDZ).

**Case 1: shadowing (declared inside, logged after)**

```js
var name = 'Global';

function show() {
  var name = 'Local';
  console.log(name);
}

show();
console.log(name);
```

```text
Local
Global
```

The inner `name` is a new variable that exists only inside `show`, so the global is never changed. `let` and `const` behave the same way here.

**Case 2: no keyword inside (the global changes)**

```js
var name = 'Global';

function show() {
  name = 'Local';
  console.log(name);
}

show();
console.log(name);
```

```text
Local
Local
```

With no `var`, `let` or `const`, the assignment walks up the scope chain and overwrites the outer `name`.

**Case 3: logged before a `var` declaration (hoisting)**

```js
var name = 'Global';

function show() {
  console.log(name);
  var name = 'Local';
}

show();
console.log(name);
```

```text
undefined
Global
```

**Hoisting** means the engine sets up every declaration in a scope before running its code ([§3.2](/javascript/guide#32-hoisting)). A `var` starts as `undefined`, so `show` really runs like this:

```js
function show() {
  var name;            // hoisted, value is undefined
  console.log(name);   // undefined
  name = 'Local';
}

show();
```

```text
undefined
```

The local `name` exists from the first line, so it hides the global, but has no value yet.

**Case 4: logged before a `let`/`const` declaration (the TDZ)**

```js
let name = 'Global';

function show() {
  console.log(name);
  let name = 'Local';
}

try {
  show();
} catch (e) {
  console.log(e.name + ': ' + e.message);
}
```

```text
ReferenceError: Cannot access 'name' before initialization
```

`let` and `const` are hoisted too, but stay in the **Temporal Dead Zone** (from the start of the scope to the declaration line), and reading them there throws (Q11). The engine does **not** fall back to the global `name`, because the local one already exists. The `try`/`catch` only lets the example finish.

**Case 5 (bonus): block scope, `var` versus `let`**

```js
var a = 'Global';
if (true) {
  var a = 'Block';
}
console.log(a);

let b = 'Global';
if (true) {
  let b = 'Block';
}
console.log(b);
```

```text
Block
Global
```

`var` ignores blocks, so the inner `var a` is the **same** variable; the inner `let b` is a new one that disappears at the closing brace.

**Summary:**

| Inside the function | Log inside | Log outside |
|---|---|---|
| `var`/`let`/`const x = …`, logged after | local value | global value (unchanged) |
| `x = …` (no keyword) | new value | new value (global changed) |
| `var x`, logged before the declaration | `undefined` | global value |
| `let`/`const x`, logged before the declaration | `ReferenceError` (TDZ) | does not run |

In sloppy mode, assigning without a keyword when no outer variable exists silently creates an accidental global (Q41); prefer `const` and `let` so a read-before-declare is a loud error. **Related:** Q5, Q11, Q41, [§3.2](/javascript/guide#32-hoisting) (function declarations versus expressions), and [tricky Q28, Q29 and Q31](/javascript/tricky-questions) for more hoisting, TDZ and `this` puzzles.

---

**Q46: Why does `['1', '2', '3'].map(parseInt)` return `[1, NaN, NaN]`, and how do you avoid the same trap with other functions?**

**Short answer:** `map` calls its callback with **three** arguments: value, index and array. `parseInt` takes two: the string and the **radix** (the number base). So each item's **index** becomes its base, silently producing `NaN`. Pass exactly what you mean: `.map(Number)` or `.map((s) => parseInt(s, 10))`.

```js
console.log(['1', '2', '3'].map(parseInt));
console.log(['10', '10', '10'].map(parseInt));

// What map actually calls for the first array
console.log(parseInt('1', 0), parseInt('2', 1), parseInt('3', 2));

// The fixes
console.log(['1', '2', '3'].map(Number));
console.log(['1', '2', '3'].map((s) => parseInt(s, 10)));
```

```text
[ 1, NaN, NaN ]
[ 10, NaN, 2 ]
1 NaN NaN
[ 1, 2, 3 ]
[ 1, 2, 3 ]
```

| Call that `map` makes | Result | Why |
|---|---|---|
| `parseInt('1', 0)` | `1` | a radix of `0` means "work it out", which is base 10 here |
| `parseInt('2', 1)` | `NaN` | there is no base 1; valid radixes are 2 to 36 |
| `parseInt('3', 2)` | `NaN` | base 2 (binary) only has the digits 0 and 1 |
| `parseInt('10', 2)` | `2` | `10` in binary is two, which is why the second array ends in 2 |

The bug hides well: index 0 always works, so a one-item list (and a test with one ID) passes.

**`Number` and `parseInt(s, 10)` are not the same fix:**

```js
console.log(Number('12px'), parseInt('12px', 10));    // parseInt reads digits until it hits something else
console.log(Number(''), parseInt('', 10));            // an empty string is 0 to Number
console.log(Number('0x1A'), parseInt('0x1A', 10));    // Number understands hex; base 10 stops at the x
```

```text
NaN 12
0 NaN
26 0
```

Use `Number` when the whole string must be a number (IDs, form fields) and `parseInt(s, 10)` for the leading number in text such as `'12px'`. Always give `parseInt` its radix.

**The lesson is bigger than `parseInt`.** Any function with optional extra parameters misbehaves when passed straight to `map`, `filter` or `forEach`:

```js
console.log([1, 2, 3].map(Math.max));                 // Math.max(value, index, array): the array becomes NaN

['a', 'b'].forEach(console.log);                      // logs the index and the array too

// Your own function, months later, gains an optional parameter
function toCents(amount, decimals = 2) {
  return Math.round(Number(amount) * 10 ** decimals);
}
console.log(['1.5', '2.25'].map(toCents));            // the index becomes `decimals`
console.log(['1.5', '2.25'].map((a) => toCents(a)));  // only the argument you meant
```

```text
[ NaN, NaN, NaN ]
a 0 [ 'a', 'b' ]
b 1 [ 'a', 'b' ]
[ 2, 23 ]
[ 150, 225 ]
```

`toCents` is the one that reaches production: adding an optional `decimals` parameter silently broke a `.map(toCents)` caller nobody touched. An arrow wrapper passes only the argument you mean.

**The rule to state:** pass a function reference to `map`, `filter` or `forEach` only when it was written as a callback or takes exactly one argument (`Number`, `String`, `Boolean`, as in `filter(Boolean)`); everything else gets an arrow. `eslint-plugin-unicorn`'s `no-array-callback-reference` rule flags `.map(fn)`.

[Tricky Q35](/javascript/tricky-questions) shows the same trap next to `sort()`'s text ordering, and Q28 compares `map`, `filter` and `reduce`.
