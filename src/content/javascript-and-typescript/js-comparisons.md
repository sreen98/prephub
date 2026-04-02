# JavaScript Comparison Tables

Quick-reference comparison tables for the "X vs Y" questions interviewers love about JavaScript.

---

## var vs let vs const

| Feature | `var` | `let` | `const` |
|---|---|---|---|
| **Scope** | Function-scoped | Block-scoped | Block-scoped |
| **Hoisting** | Hoisted and initialized to `undefined` | Hoisted but **not** initialized (TDZ) | Hoisted but **not** initialized (TDZ) |
| **Re-declaration** | Allowed in the same scope | Not allowed | Not allowed |
| **Re-assignment** | Allowed | Allowed | **Not allowed** |
| **Temporal Dead Zone** | No | Yes | Yes |
| **Global object property** | Yes (`window.x`) | No | No |

**When to use which:** Default to `const`; switch to `let` only when you need to re-assign. Avoid `var` entirely in modern code.

---

## == vs ===

| Feature | `==` (Loose Equality) | `===` (Strict Equality) |
|---|---|---|
| **Type coercion** | Performs type coercion before comparing | No type coercion — types must match |
| **`null == undefined`** | `true` | `false` |
| **`0 == ""`** | `true` | `false` |
| **`0 == false`** | `true` | `false` |
| **`NaN == NaN`** | `false` | `false` |
| **Predictability** | Low — surprising edge cases | High — no surprises |

**When to use which:** Always use `===` and `!==`.

---

## null vs undefined

| Feature | `null` | `undefined` |
|---|---|---|
| **Meaning** | Intentional absence of value | Variable declared but not assigned |
| **Type** | `typeof null === "object"` (historic bug) | `typeof undefined === "undefined"` |
| **Default function params** | Does **not** trigger defaults | Triggers default parameter values |
| **JSON serialization** | Included (`"key": null`) | **Omitted** |
| **Arithmetic coercion** | Converts to `0` | Converts to `NaN` |
| **Who sets it** | Developer explicitly | JavaScript engine |

**When to use which:** Use `null` for explicit "no value." Leave `undefined` to the engine.

---

## map vs forEach

| Feature | `map()` | `forEach()` |
|---|---|---|
| **Return value** | New array of transformed elements | `undefined` |
| **Chainable** | Yes | No |
| **Purpose** | Transform each element, produce new array | Execute a side effect for each element |
| **Async/await** | Returns array of promises (use `Promise.all`) | Does **not** wait for async callbacks |

**When to use which:** Use `map` when you need a transformed array; use `forEach` for side effects only.

---

## Promise.all vs allSettled vs race vs any

| Feature | `Promise.all` | `Promise.allSettled` | `Promise.race` | `Promise.any` |
|---|---|---|---|---|
| **Resolves when** | All fulfill | All settle | First settles | First **fulfills** |
| **Rejects when** | Any single rejects | Never | First settles (if reject) | All reject |
| **Short-circuits** | Yes, on first rejection | No | Yes, on first settlement | Yes, on first fulfillment |
| **Use case** | All must succeed | Need results regardless | Timeout patterns | Fastest success |

---

## for...in vs for...of

| Feature | `for...in` | `for...of` |
|---|---|---|
| **Iterates over** | Enumerable **property keys** (strings) | **Values** of an iterable |
| **Works on objects** | Yes (primary use case) | No (plain objects not iterable) |
| **Works on arrays** | Yes, but iterates **index strings** | Yes, iterates **values** |
| **Includes prototype** | Yes | No |
| **Works with Map/Set** | No | Yes |

**When to use which:** Use `for...of` for arrays, strings, Maps, Sets. Use `for...in` only for object keys — prefer `Object.keys()` for clarity.

---

## Arrow Functions vs Regular Functions

| Feature | Arrow Function | Regular Function |
|---|---|---|
| **`this` binding** | Lexical (inherits from enclosing scope) | Dynamic (depends on call site) |
| **`arguments` object** | Not available | Available |
| **`new` keyword** | Cannot be constructor | Can be constructor |
| **`prototype` property** | Does not have one | Has `prototype` |
| **Implicit return** | Yes, for single expressions | No |

**When to use which:** Arrow functions for callbacks and short transforms. Regular functions for methods, constructors, generators.

---

## call vs apply vs bind

| Feature | `call` | `apply` | `bind` |
|---|---|---|---|
| **Invokes immediately** | Yes | Yes | **No** — returns a new function |
| **Arguments format** | Comma-separated | Array | Comma-separated (partial application) |
| **Return value** | Result of call | Result of call | A new bound function |
| **Partial application** | No | No | Yes |
| **`this` binding** | Set for that single call | Set for that single call | Permanently bound |

**When to use which:** `call` when args are known; `apply` when args are in an array; `bind` for reusable functions with fixed `this`.
