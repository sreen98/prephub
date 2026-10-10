# JavaScript Comparison Tables

Quick-reference comparison tables for the "X vs Y" questions interviewers love about JavaScript. Each section explains the **why** behind the difference — the runtime behavior that causes the table entries.

---

## var vs let vs const

The trio tells the story of how JavaScript's variable model has evolved. `var` is the legacy form from ES3. `let` and `const` arrived in ES6 to fix its scoping and hoisting issues and are what modern code should use.

| Feature | `var` | `let` | `const` |
|---|---|---|---|
| **Scope** | Function-scoped | Block-scoped | Block-scoped |
| **Hoisting** | Hoisted and initialized to `undefined` | Hoisted but **not** initialized (TDZ) | Hoisted but **not** initialized (TDZ) |
| **Re-declaration** | Allowed in the same scope | Not allowed | Not allowed |
| **Re-assignment** | Allowed | Allowed | **Not allowed** |
| **Temporal Dead Zone** | No | Yes | Yes |
| **Global object property** | Yes (`window.x`) | No | No |

**Why the TDZ exists**: `let` and `const` bindings are technically hoisted to the top of their block, but accessing them before the declaration line throws `ReferenceError`. This is the Temporal Dead Zone. The point is to make "use before declare" a hard error rather than silently returning `undefined` (as `var` does). It's a safety net for a class of bugs the ES6 designers explicitly wanted to eliminate.

**`const` does not mean immutable** — it means the binding can't be reassigned. You can still mutate the object it points to: `const arr = []; arr.push(1)` is valid. For true immutability, use `Object.freeze` or immutable data libraries.

**When to use which**: Default to `const`; switch to `let` only when you genuinely need to re-assign. Avoid `var` entirely in modern code — it causes leak-into-enclosing-function bugs that are hard to diagnose.

---

## == vs ===

Loose equality (`==`) triggers type coercion before comparing; strict equality (`===`) doesn't. The coercion rules are spelled out across 7 steps in the ECMAScript spec (the "Abstract Equality Comparison" algorithm), and they have enough gotchas that Douglas Crockford famously recommended never using `==` at all.

| Feature | `==` (Loose Equality) | `===` (Strict Equality) |
|---|---|---|
| **Type coercion** | Performs type coercion before comparing | No type coercion — types must match |
| **`null == undefined`** | `true` | `false` |
| **`0 == ""`** | `true` | `false` |
| **`0 == false`** | `true` | `false` |
| **`NaN == NaN`** | `false` | `false` |
| **Predictability** | Low — surprising edge cases | High — no surprises |

**Why `null == undefined`**: the spec has a specific carve-out: `null` and `undefined` are loosely equal to each other and to nothing else. This is actually a *useful* pattern: `if (x == null)` checks for both `null` and `undefined` in one shot. It's the one defensible use of `==` — and even then, most style guides prefer the explicit `x === null || x === undefined` or the nullish-coalescing check.

**Why `NaN !== NaN`**: this isn't a JavaScript oddity; it's IEEE 754. `NaN` represents "not a number" and any comparison with it is false by spec. To check if something is `NaN`, use `Number.isNaN(x)` (strict, safer than the legacy global `isNaN`).

**When to use which**: Always use `===` and `!==`. The only exception is the `x == null` idiom for checking null-or-undefined, and even there you can write `x ?? defaultValue` or explicit checks.

---

## null vs undefined

Both represent "no value" but mean different things. `undefined` is what JavaScript returns when a value doesn't exist yet (unassigned variable, missing object property, function without a return). `null` is what you assign when you intentionally want to say "this is empty".

| Feature | `null` | `undefined` |
|---|---|---|
| **Meaning** | Intentional absence of value | Variable declared but not assigned |
| **Type** | `typeof null === "object"` (historic bug) | `typeof undefined === "undefined"` |
| **Default function params** | Does **not** trigger defaults | Triggers default parameter values |
| **JSON serialization** | Included (`"key": null`) | **Omitted** |
| **Arithmetic coercion** | Converts to `0` | Converts to `NaN` |
| **Who sets it** | Developer explicitly | JavaScript engine |

**Why `typeof null === "object"`**: a bug from JavaScript's first implementation (1995). Values were tagged with a type in their low bits; object was type `0x000`, and `null` happened to be the all-zero pointer, so `typeof` misread it. Fixing it would break the web. It's been there for ~30 years.

**JSON behavior matters for APIs**: `JSON.stringify({ a: null, b: undefined })` produces `{"a":null}`. The `b` key is dropped entirely. This is why APIs typically use `null` for "intentional absence" — `undefined` just won't make it across the wire.

**Default-parameter semantics**: `function greet(name = 'Alice') {}` — calling `greet(undefined)` uses the default "Alice"; calling `greet(null)` sets `name` to `null`. This is often a trip-up in forms where "cleared" values arrive as `null` but you expected the default.

**When to use which**: Use `null` for explicit "no value." Leave `undefined` to the engine. If your data layer returns `null` for "empty", stick to `null` throughout; don't mix both conventions.

---

## map vs forEach

Both iterate an array, but they communicate different intent and return different things. `map` is a transformation that returns a new array; `forEach` is a side-effect loop that returns `undefined`.

| Feature | `map()` | `forEach()` |
|---|---|---|
| **Return value** | New array of transformed elements | `undefined` |
| **Chainable** | Yes | No |
| **Purpose** | Transform each element, produce new array | Execute a side effect for each element |
| **Async/await** | Returns array of promises (use `Promise.all`) | Does **not** wait for async callbacks |

**Why `forEach` doesn't await async**: `forEach` calls the callback for each element and moves on — it doesn't chain the returned promises. If you pass an `async` callback, you fire them all in parallel and the outer code continues before any resolve. Use a `for...of` loop with `await`, or `Promise.all(arr.map(async ...))` if you want parallel, or a `reduce`-based sequential pattern.

**Common anti-pattern**: using `forEach` to build a new array imperatively (`const out = []; arr.forEach(x => out.push(x * 2))`). That's `map` written backwards.

**When to use which**: Use `map` when you need a transformed array; use `forEach` for side effects only. If you're iterating and collecting, reach for `map`, `filter`, `reduce`, or `flatMap`.

---

## Promise.all vs allSettled vs race vs any

Four combinators for coordinating multiple promises. Each one answers a different question about a group of async operations.

| Feature | `Promise.all` | `Promise.allSettled` | `Promise.race` | `Promise.any` |
|---|---|---|---|---|
| **Resolves when** | All fulfill | All settle | First settles | First **fulfills** |
| **Rejects when** | Any single rejects | Never | First settles (if reject) | All reject |
| **Short-circuits** | Yes, on first rejection | No | Yes, on first settlement | Yes, on first fulfillment |
| **Use case** | All must succeed | Need results regardless | Timeout patterns | Fastest success |

**`all` is fail-fast**: if one promise rejects, the whole `Promise.all` rejects immediately with that reason, and you lose the results of any that already fulfilled. If you want partial results, use `allSettled`.

**`allSettled` is what you want for "gather all outcomes"**: returns an array of `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }`. Perfect for dashboards that load from multiple sources and want to show what succeeded while marking what failed.

**`race` vs `any`**: `race` cares about *settlement* (fulfill or reject); `any` cares about *fulfillment only*. Classic use case for `race`: `Promise.race([fetch(url), delay(5000).then(() => { throw new Error('timeout'); })])` for a timeout. Classic `any` use case: try three mirror servers, take whichever responds first successfully.

---

## for...in vs for...of

Both are looping constructs but iterate different things. `for...in` walks enumerable property keys; `for...of` walks the values of an iterable.

| Feature | `for...in` | `for...of` |
|---|---|---|
| **Iterates over** | Enumerable **property keys** (strings) | **Values** of an iterable |
| **Works on objects** | Yes (primary use case) | No (plain objects not iterable) |
| **Works on arrays** | Yes, but iterates **index strings** | Yes, iterates **values** |
| **Includes prototype** | Yes | No |
| **Works with Map/Set** | No | Yes |

**Why `for...in` on arrays is dangerous**: it iterates *all* enumerable keys including any added to `Array.prototype`. It also gives you string keys (`"0"`, `"1"`), which can surprise you in arithmetic contexts. Use `for...of`, `forEach`, or a classical `for` loop for arrays.

**Iterables vs iterators**: `for...of` works with anything that implements the iterable protocol (`[Symbol.iterator]()`). Arrays, strings, Maps, Sets, generators, and DOM NodeLists are iterable. Plain objects aren't — use `Object.entries(obj)` and iterate the returned array.

**When to use which**: Use `for...of` for arrays, strings, Maps, Sets. Use `for...in` only for object keys — and even then, prefer `Object.keys()` / `Object.entries()` for clarity and to avoid accidental prototype walks.

---

## Arrow Functions vs Regular Functions

Arrow functions look like a shorter syntax for regular functions, but they behave differently in ways that matter — especially around `this`, `arguments`, and use as constructors.

| Feature | Arrow Function | Regular Function |
|---|---|---|
| **`this` binding** | Lexical (inherits from enclosing scope) | Dynamic (depends on call site) |
| **`arguments` object** | Not available | Available |
| **`new` keyword** | Cannot be constructor | Can be constructor |
| **`prototype` property** | Does not have one | Has `prototype` |
| **Implicit return** | Yes, for single expressions | No |

**Why lexical `this` is the key feature**: before arrow functions, callbacks passed to `setTimeout`, `map`, or event handlers got their own `this`, which usually wasn't what you wanted inside a method. The workaround was `const self = this;` or `.bind(this)`. Arrow functions capture `this` from the enclosing scope, eliminating the problem:

```js
class Timer {
  start() {
    // 'this' refers to the Timer instance inside the arrow
    setTimeout(() => this.tick(), 1000);
  }
}
```

**Why arrows can't be constructors**: they don't have an internal `[[Construct]]` slot. Trying `new MyArrow()` throws `TypeError: MyArrow is not a constructor`. This is intentional — they're designed as value-carrying expressions, not factories.

**When to use which**: Arrow functions for callbacks, short transforms, and anywhere you want `this` to be lexical. Regular functions for object methods (especially when the method uses `this`), constructors, and generators.

---

## call vs apply vs bind

Three methods on every function that let you control what `this` is when the function runs. `call` and `apply` invoke immediately; `bind` returns a new function with `this` permanently set.

| Feature | `call` | `apply` | `bind` |
|---|---|---|---|
| **Invokes immediately** | Yes | Yes | **No** — returns a new function |
| **Arguments format** | Comma-separated | Array | Comma-separated (partial application) |
| **Return value** | Result of call | Result of call | A new bound function |
| **Partial application** | No | No | Yes |
| **`this` binding** | Set for that single call | Set for that single call | Permanently bound |

**Why these exist**: before arrow functions, controlling `this` was a constant chore. `bind` especially — you'd bind class methods in the constructor so they could be passed as callbacks without losing their context (`this.handleClick = this.handleClick.bind(this)`). In modern code, class fields (`handleClick = () => {}`) or arrow functions solve this cleanly, so `bind` is less common.

**`call` vs `apply` mnemonic**: **A**pply takes an **A**rray, **C**all takes **C**ommas. The practical difference is only how you supply arguments.

**Partial application with `bind`**: `const addFive = add.bind(null, 5)` — `addFive(10)` now calls `add(5, 10)`. Useful for pre-filling arguments of a reusable function.

**When to use which**: `call` when args are known at the call site, `apply` when args are in an array (rare now that spread exists: `fn(...args)`), `bind` for creating pre-bound callbacks or partially applying arguments.
