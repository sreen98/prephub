# JavaScript — Complete Guide

## Table of Contents

- [1. What is JavaScript?](#1-what-is-javascript)
- [2. Data Types](#2-data-types)
- [3. Variables](#3-variables)
- [4. Functions](#4-functions)
- [5. Scope and Closures](#5-scope-and-closures)
- [6. Objects and Prototypes](#6-objects-and-prototypes)
- [7. Arrays and Iteration](#7-arrays-and-iteration)
- [8. Asynchronous JavaScript](#8-asynchronous-javascript)
- [9. ES6+ and Modern JavaScript](#9-es6-and-modern-javascript)
- [10. Error Handling](#10-error-handling)
- [11. The Event Loop](#11-the-event-loop)
- [12. Modules](#12-modules)
- [13. DOM Manipulation](#13-dom-manipulation)
- [14. Design Patterns](#14-design-patterns)
- [15. Interview Questions & Answers](#15-interview-questions-answers)
- [16. Tricky Output Questions](#16-tricky-output-questions)

---

## 1. What is JavaScript?

JavaScript is a **single-threaded**, **dynamically typed**, **interpreted** (JIT-compiled) programming language. It's the language of the web — runs in browsers and on servers (Node.js).

Key characteristics:
- **Single-threaded** — one call stack, one thing at a time
- **Non-blocking** — async operations via event loop
- **Prototype-based** — objects inherit from other objects (not classes)
- **First-class functions** — functions are values, can be passed around
- **Multi-paradigm** — supports OOP, functional, and event-driven programming

---

## 2. Data Types

### 2.1 Primitive Types (7)

Primitives are the most basic data types in JavaScript. They are immutable (cannot be changed in place) and stored by value, meaning assigning one variable to another copies the value rather than creating a shared reference.

```js
// 1. String
const name = 'Alice';
const greeting = `Hello ${name}`;       // template literal

// 2. Number (64-bit floating point, no separate int type)
const age = 30;
const price = 19.99;
const big = 2 ** 53;                     // 9007199254740992

// 3. BigInt (arbitrary precision integers)
const huge = 9007199254740993n;

// 4. Boolean
const isActive = true;

// 5. undefined (declared but not assigned)
let x;
console.log(x);                          // undefined

// 6. null (intentional absence of value)
const empty = null;

// 7. Symbol (unique identifier)
const id = Symbol('id');
const id2 = Symbol('id');
console.log(id === id2);                 // false (always unique)
```

### 2.2 Reference Types

Reference types (objects, arrays, functions) are stored by reference, meaning variables hold a pointer to the data in memory rather than the data itself. This means multiple variables can point to the same object, and mutations through one reference are visible through all of them.

```js
// Object
const user = { name: 'Alice', age: 30 };

// Array (special object)
const nums = [1, 2, 3];

// Function (callable object)
const greet = function() { return 'hi'; };

// Date, RegExp, Map, Set, WeakMap, WeakSet...
```

### 2.3 typeof Quirks

The `typeof` operator returns a string indicating the type of a value, but it has several well-known quirks that interviewers love to ask about. Understanding these edge cases helps you avoid subtle bugs in type-checking code.

```js
typeof 'hello'       // 'string'
typeof 42            // 'number'
typeof true          // 'boolean'
typeof undefined     // 'undefined'
typeof null          // 'object'      <-- historical bug, never fixed
typeof {}            // 'object'
typeof []            // 'object'      <-- arrays are objects
typeof function(){}  // 'function'
typeof Symbol()      // 'symbol'
typeof 42n           // 'bigint'
```

### 2.4 Type Coercion

JavaScript automatically converts values between types (implicit coercion) when operators or comparisons expect a different type. Knowing the coercion rules -- especially the difference between `==` (loose, coerces) and `===` (strict, no coercion) -- is essential for avoiding bugs and answering interview questions.

```js
// Implicit coercion (avoid in production code)
'5' + 3              // '53'     (number -> string)
'5' - 3              // 2        (string -> number)
true + 1             // 2        (boolean -> number)
'5' == 5             // true     (loose equality, coerces)
'5' === 5            // false    (strict equality, no coercion)

// Falsy values (coerce to false)
false, 0, -0, 0n, '', null, undefined, NaN

// Everything else is truthy, including:
'0', 'false', [], {}, function(){}
```

---

## 3. Variables

### 3.1 var vs let vs const

JavaScript has three variable declaration keywords. `var` is function-scoped and was the only option before ES6. `let` and `const` are block-scoped and should be preferred in modern code -- use `const` by default and `let` only when you need to reassign.

```js
// var - function-scoped, hoisted, can be redeclared
var x = 1;
var x = 2;             // OK
if (true) {
  var y = 3;           // y is available outside the if block
}
console.log(y);        // 3

// let - block-scoped, hoisted (but in TDZ), cannot be redeclared
let a = 1;
// let a = 2;          // SyntaxError
if (true) {
  let b = 3;
}
// console.log(b);     // ReferenceError

// const - block-scoped, must be initialized, cannot be reassigned
const c = 1;
// c = 2;              // TypeError

// BUT objects/arrays assigned to const can be mutated
const obj = { name: 'Alice' };
obj.name = 'Bob';      // OK (mutation, not reassignment)
obj.age = 30;          // OK
// obj = {};            // TypeError (reassignment)
```

### 3.2 Hoisting

Hoisting is JavaScript's behavior of moving declarations to the top of their scope during compilation. `var` declarations are hoisted and initialized to `undefined`, while `let`/`const` are hoisted but remain in a "Temporal Dead Zone" until their declaration is reached, causing a `ReferenceError` if accessed early.

```js
// var is hoisted (declaration, not value)
console.log(a);        // undefined (not ReferenceError)
var a = 5;

// let/const are hoisted but in Temporal Dead Zone (TDZ)
// console.log(b);     // ReferenceError: Cannot access 'b' before initialization
let b = 5;

// Function declarations are fully hoisted
greet();               // 'hello' (works before declaration)
function greet() { return 'hello'; }

// Function expressions are NOT fully hoisted
// sayHi();            // TypeError: sayHi is not a function
var sayHi = function() { return 'hi'; };
```

---

## 4. Functions

### 4.1 Function Declarations vs Expressions

Function declarations are hoisted completely (you can call them before they appear in code), while function expressions are assigned to variables and follow that variable's hoisting rules. Named function expressions are useful for recursion and clearer stack traces.

```js
// Declaration (hoisted)
function add(a, b) {
  return a + b;
}

// Expression (not hoisted)
const addV2 = function(a, b) {
  return a + b;
};

// Named expression (useful for recursion/stack traces)
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1);
};
```

### 4.2 Arrow Functions

Arrow functions provide a concise syntax for writing functions and have key behavioral differences from regular functions: they do not have their own `this`, `arguments`, or `prototype`, and they cannot be used as constructors. Their lexical `this` binding makes them ideal for callbacks and methods that need to preserve the surrounding context.

```js
// Full syntax
const add = (a, b) => {
  return a + b;
};

// Concise body (implicit return)
const addV2 = (a, b) => a + b;

// Single parameter (no parens needed)
const double = x => x * 2;

// Returning an object (wrap in parens)
const makeUser = (name) => ({ name, active: true });

// Key differences from regular functions:
// 1. No own `this` - inherits from enclosing scope
// 2. No `arguments` object
// 3. Cannot be used as constructors (no `new`)
// 4. No `prototype` property
```

### 4.3 this Keyword

The value of `this` in JavaScript depends on how a function is called, not where it is defined (except for arrow functions, which inherit `this` lexically). Understanding the four binding rules -- default, implicit (method call), explicit (`call`/`apply`/`bind`), and `new` -- is one of the most frequently tested interview topics.

```js
// Global context
console.log(this);                // window (browser) or {} (Node module)

// Regular function - `this` depends on HOW it's called
const obj = {
  name: 'Alice',
  greet() {
    console.log(this.name);       // 'Alice' (called as method)
  },
};
obj.greet();                      // 'Alice'

const fn = obj.greet;
fn();                             // '' in a browser, undefined in Node — see below

// Arrow function - `this` is lexically bound (where it was DEFINED)
const obj2 = {
  name: 'Bob',
  greet: () => {
    console.log(this.name);       // undefined (inherits outer this)
  },
  delayedGreet() {
    setTimeout(() => {
      console.log(this.name);     // 'Bob' (arrow inherits from delayedGreet)
    }, 100);
  },
};

// Explicit binding
function greet() { console.log(this.name); }
greet.call({ name: 'Alice' });     // 'Alice'
greet.apply({ name: 'Bob' });      // 'Bob'
const bound = greet.bind({ name: 'Charlie' });
bound();                            // 'Charlie'
```

**Why detaching a method loses `this`.** `obj.greet` is just a function; the binding is not stored on it. `this` is decided by the **call site**, and `obj.greet()` supplies a receiver while `fn()` supplies none. In a plain (non-strict) call the receiver falls back to the global object — so `this.name` reads `window.name`, which **exists and is an empty string**, printing a blank line rather than `undefined`. In a Node module there is no such global, so the same code prints `undefined`. Under `'use strict'` (and inside an ES module, which is always strict) `this` is `undefined` and the line throws instead. Three different results for one snippet, which is why "it depends how it is called" is the whole answer.

#### Explicit binding: `call`, `apply` and `bind`

All three set `this` explicitly. They differ on **how arguments arrive** and **when the function runs**.

| Method | Arguments | Calls immediately? | Returns |
|---|---|---|---|
| `call` | listed individually | yes | the function's result |
| `apply` | one array | yes | the function's result |
| `bind` | listed individually (partial) | **no** | a new, permanently bound function |

```js
function introduce(greeting, punctuation) {
  return `${greeting}, I am ${this.name}${punctuation}`;
}
const user = { name: 'Ada' };

introduce.call(user, 'Hello', '!');        // 'Hello, I am Ada!'   — args listed
introduce.apply(user, ['Hello', '!']);     // 'Hello, I am Ada!'   — args in an array

const sayHi = introduce.bind(user, 'Hi');  // nothing runs yet; 'Hi' is pre-filled
sayHi('?');                                 // 'Hi, I am Ada?'     — later, and bound
```

**`call` vs `apply` is only the argument shape.** The mnemonic that sticks: **a**pply takes an **a**rray. Spread syntax has made `apply` largely redundant — `fn(...args)` does the same job more clearly — so its remaining use is forwarding an unknown argument list inside a wrapper, which is exactly what a polyfill or decorator does: `fn.apply(this, args)`.

**`bind` is the one that behaves differently**, and it is what interviews probe:

- **It returns a new function** rather than calling anything. Forgetting the extra `()` is the classic bug: `el.addEventListener('click', this.handle.bind(this))` is right; `…this.handle.bind(this)()` registers the *result* of calling it.
- **The binding is permanent.** A bound function cannot be re-bound — `bound.call(other)` ignores `other` — because `bind` returns an exotic function whose receiver is fixed.
- **It supports partial application.** Arguments passed to `bind` are prepended to whatever the caller passes later, which is the basis of currying.
- **`new` beats it.** Calling a bound function with `new` ignores the bound `this` and uses the fresh instance, though pre-filled arguments still apply. That asymmetry is the detail a `bind` polyfill has to reproduce.
- **Each call creates a new function.** `this.handle.bind(this)` in a React render produces a different reference every time, which defeats `React.memo` and makes `removeEventListener` fail silently — the reason class components bound in the constructor, and the reason arrow-function class fields replaced that.

**When the arrow function is the better answer.** An arrow has no `this` of its own, so it inherits from the enclosing scope permanently — `setTimeout(() => this.tick(), 100)` needs no binding at all. `bind` earns its place when you need a *reusable* bound reference (adding and later removing the same listener) or partial application; otherwise reach for the arrow.

See **Q8** in the interview section for the compressed version, and the **Function.bind** and **Function.call & apply** polyfill templates in the playground to implement all three from scratch.

### 4.4 Default Parameters, Rest, Spread

ES6 introduced these features for more flexible function signatures. Default parameters provide fallback values, rest parameters (`...args`) collect remaining arguments into an array, and spread syntax (`...`) expands arrays or objects into individual elements.

```js
// Default parameters
function greet(name = 'World') {
  return `Hello ${name}`;
}

// Rest parameters (collects remaining args into array)
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4);                    // 10

// Spread (expands array/object)
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4];       // [1, 2, 3, 4]

const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 };     // { a: 1, b: 2 }
```

### 4.5 Higher-Order Functions

Higher-order functions either take a function as an argument or return a function. They are a cornerstone of functional programming in JavaScript and power common patterns like `map`, `filter`, and `reduce`, enabling more declarative and composable code.

```js
// A function that takes or returns another function

// Takes a function
function repeat(n, fn) {
  for (let i = 0; i < n; i++) fn(i);
}
repeat(3, console.log);              // 0, 1, 2

// Returns a function
function multiplier(factor) {
  return (number) => number * factor;
}
const double = multiplier(2);
double(5);                            // 10

// Common HOFs: map, filter, reduce, forEach, sort, find, some, every
```

---

## 5. Scope and Closures

### 5.1 Scope Chain

When JavaScript encounters a variable, it looks it up starting from the current scope, then moves outward through each enclosing scope until it reaches the global scope. This lookup path is called the scope chain, and understanding it is key to predicting which variable a given reference resolves to.

```js
const global = 'I am global';

function outer() {
  const outerVar = 'I am outer';

  function inner() {
    const innerVar = 'I am inner';
    console.log(innerVar);           // own scope
    console.log(outerVar);           // parent scope
    console.log(global);             // global scope
  }

  inner();
  // console.log(innerVar);          // ReferenceError — inner's scope is not visible here
}

outer();                             // ← without this call, nothing runs at all
```

### 5.2 Closures

A closure is a function that remembers and accesses variables from its outer scope, even after the outer function has returned.

```js
function createCounter() {
  let count = 0;                     // "closed over" by inner function
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

const counter = createCounter();
console.log(counter.increment());     // 1
console.log(counter.increment());     // 2
console.log(counter.getCount());      // 2
console.log(counter.count);           // undefined — `count` is private
```

**Reading that example precisely**, because "a function that remembers its outer scope" is the definition and not the mechanism:

**Which functions are the closures?** All three of them — `increment`, `decrement` and `getCount`. Each is defined *inside* `createCounter`, so each carries a reference to the scope it was born in. `createCounter` itself is not a closure here; it is the factory that creates them.

**Which variable are they accessing?** `count`, declared with `let` in `createCounter`'s scope. Not a copy of it — **the binding itself**. That is why `increment` and `getCount` agree: there is exactly one `count`, and all three functions reach the same one.

**When did the outer function return?** Immediately, on the very first line of use:

```js
const counter = createCounter();   // createCounter RUNS and RETURNS here
```

By the time you call `counter.increment()`, `createCounter` has already finished. Its call frame is gone from the stack. Under the rules you would expect from most languages, `count` was a local variable of a function that has returned, so it should be gone too.

**It is not gone, and the reason is reachability.** `count` lives in a variable environment on the heap, not on the stack. The returned object holds three functions; each function holds a reference to that environment; so as long as `counter` is reachable, the environment is reachable, and `count` with it. Garbage collection frees what cannot be reached — and this can be reached.

```
counter ──▶ { increment, decrement, getCount }
                 │          │          │
                 └──────────┴──────────┴──▶ [ scope of createCounter: count = 2 ]
```

**The consequences, which are what interviews actually probe:**

- **`count` is genuinely private.** There is no reference to it from outside — `counter.count` is `undefined`, and no amount of poking at the object reaches it. This is the module pattern, and it was how JavaScript did private state for twenty years before `#private` fields.
- **Each call to `createCounter()` makes a new environment.** Two counters do not share a `count`; they are independent. That is the difference between a closure and a global.
- **State survives without an object holding it.** The value lives in a scope, not a property — which is why `let count` and not `this.count`.
- **And this is also the leak.** The same reachability that keeps `count` alive keeps alive *everything else* in that scope. Hold one of these functions on a global listener and the whole environment is pinned — see **Q25** in the interview section.

Set against `5.1`: there, the scope chain let `inner` *read outward* while `outer` was still running. Here the inner functions outlive their creator and the chain still holds — which is the part that makes it a closure rather than merely nested scope.

### 5.3 Classic Closure Gotcha

This is one of the most common interview questions about closures, and it is really a question about **how many bindings exist**, not about timing.

```js
// Problem: var is function-scoped, shared by all iterations
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 (all reference the same `i`)

// Fix 1: Use let (block-scoped - each iteration gets its own `i`)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2

// Fix 2: IIFE (creates new scope per iteration)
for (var i = 0; i < 3; i++) {
  ((j) => {
    setTimeout(() => console.log(j), 100);
  })(i);
}
// Output: 0, 1, 2
```

#### Why the first one prints 3, 3, 3

Two separate facts combine, and it is worth separating them because most answers only give the first.

**One binding, not three.** `var` is scoped to the enclosing *function*, not to the loop body. So the whole loop — all three iterations — shares a single `i`. The three arrow functions do not capture three different values; they capture **the same binding**, exactly as in §5.2 where `increment` and `getCount` shared one `count`.

**The callbacks run after the loop has finished.** `setTimeout` schedules a macrotask; nothing in it can run until the synchronous call stack is empty, and the loop is part of that synchronous work. By the time the first callback executes, the loop has already run to completion and left `i` at `3` — the value that failed `i < 3`.

**The delay is a red herring.** Change `100` to `0` and it still prints `3, 3, 3`, because 0 ms does not mean "now", it means "after the current synchronous work". Nothing about waiting longer is the cause, which is why "the timeout is too fast" is the wrong diagnosis.

#### How `let` fixes it

`let` in a `for` header gets a rule of its own, and it is genuinely unusual: the spec creates a **fresh binding for every iteration**, and copies the previous iteration's value into it before the update expression runs. Three iterations means three distinct `i` variables that happen to be named the same.

So each arrow captures a *different* binding, each frozen at that iteration's value. Nothing else changed — the callbacks still run later, still capture a binding rather than a value; there are simply three bindings now instead of one.

Two consequences worth knowing:

- **`let` does not leak out of the loop.** After the `var` loop, `i` is `3` and still in scope; after the `let` loop, the variable does not exist at all.
- **`const` works in `for...of` and `for...in`, but not in a classic `for` header** — the update expression `i++` would be assigning to a constant.

#### How the IIFE fixes it

Before `let` existed, this was the only fix. The immediately-invoked function creates a **new function scope on every iteration**, and `i` is passed *as an argument* — which copies the value at that moment into a new parameter binding `j`. The timeout then closes over `j`, which nothing ever mutates.

The key word is **argument**: passing `i` in is what snapshots the value. An IIFE that closed over `i` without taking it as a parameter would fix nothing.

```js
// A third fix worth knowing — setTimeout forwards extra arguments to the callback,
// which snapshots the value the same way the IIFE's parameter does.
for (var k = 0; k < 3; k++) {
  setTimeout(console.log, 0, k);      // 0, 1, 2
}
```

**The unifying idea:** a closure captures a *binding*, never a value. So the fix is never "capture harder" — it is to arrange for there to be a separate binding per iteration, whether by `let`'s per-iteration environment, a function parameter, or an argument passed through an API.

---

### 5.4 Closures in the Wild

Closures are not a trick question — you use them every day, usually without naming them. Each example below notes **what was captured** and **when the outer call returned**, because that is the part that makes it a closure rather than an ordinary function.

#### 1. Function factories — capture configuration once

```js
function createLogger(prefix, minLevel = 0) {
  const levels = { debug: 0, info: 1, error: 2 };
  // `prefix` and `minLevel` are captured. createLogger returns immediately;
  // every later call reads them from the environment it left behind.
  return function log(level, message) {
    if (levels[level] < minLevel) return;
    console.log(`[${prefix}] ${level.toUpperCase()}: ${message}`);
  };
}

const apiLog = createLogger('api', 1);
const dbLog = createLogger('db');

apiLog('debug', 'ignored — below minLevel');   // (nothing)
apiLog('error', 'timeout after 3s');           // [api] ERROR: timeout after 3s
dbLog('debug', 'connection opened');           // [db] DEBUG: connection opened
```

Two loggers, two independent environments. This is the same shape as `bind`'s partial application, and the reason libraries hand you `createClient(config)` rather than making you pass the config to every call.

#### 2. Memoization — the cache lives in the closure

```js
function memoize(fn) {
  const cache = new Map();          // captured: one cache per memoized function

  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log('cache hit', key);
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

let calls = 0;
const slowSquare = (n) => { calls++; return n * n; };
const fastSquare = memoize(slowSquare);

console.log(fastSquare(4));    // 16
console.log(fastSquare(4));    // cache hit [4] → 16
console.log('underlying calls:', calls);   // 1
```

The cache cannot be a local variable of the returned function — it would be recreated on every call — and putting it in module scope would share one cache across every memoized function. The closure is exactly the right lifetime: created once per `memoize()` call, alive as long as the returned function is.

#### 3. Debounce and throttle — the timer handle has to survive between calls

```js
function debounce(fn, delay) {
  let timerId;                       // captured: the ONE handle shared by all calls

  return function (...args) {
    clearTimeout(timerId);           // each call cancels the pending one
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

const search = debounce((q) => console.log('searching for', q), 300);
search('r');
search('re');
search('rea');
search('react');                     // only this one fires, 300ms later
```

This is the clearest case for "why not a local variable": `timerId` must persist *between* invocations of the returned function, and it must be private to this debounced function. A module-level variable would make two debounced functions cancel each other.

#### 4. Private state — the module pattern

```js
function createApiClient(baseUrl) {
  let token = null;                  // captured, and genuinely unreachable outside
  let requestCount = 0;

  return {
    setToken(value) { token = value; },
    request(path) {
      requestCount++;
      const auth = token ? 'Bearer ' + token.slice(0, 4) + '…' : 'none';
      return `GET ${baseUrl}${path} (auth: ${auth})`;
    },
    stats() { return { requestCount }; },
  };
}

const client = createApiClient('https://api.example.com');
client.setToken('secret-abc123');
console.log(client.request('/users'));   // GET …/users (auth: Bearer secr…)
console.log(client.stats());             // { requestCount: 1 }
console.log(client.token);               // undefined — not a property, not reachable
```

`token` is not "private by convention" like a `_token` property — it is private by **reachability**. Nothing outside holds a reference to it, so nothing outside can read or write it, including a debugger inspecting the object.

#### 5. Per-item handlers — a fresh capture for each element

```js
function attachHandlers(items) {
  return items.map((item, index) => {
    // Each callback captures its OWN `item` and `index` — one environment per
    // iteration, which is what `let`/`const` in a loop gives you too (§5.3).
    return function onClick() {
      console.log(`clicked ${item} at position ${index}`);
    };
  });
}

const handlers = attachHandlers(['alpha', 'beta', 'gamma']);
handlers[0]();      // clicked alpha at position 0
handlers[2]();      // clicked gamma at position 2
```

This is §5.3's gotcha in its fixed form. Every real event-handler-per-row, per-tab or per-menu-item works this way: the handler carries the row it belongs to without you threading an id through a data attribute.

#### 6. Where it bites — React's stale closure

```js
function makeRenderCycle() {
  // A crude stand-in for React: each "render" creates fresh bindings, and a
  // callback registered during a render captures THAT render's values.
  let registered = null;
  let count = 0;

  return {
    render() {
      const snapshot = count;                 // this render's value
      registered ??= () => console.log('callback sees count =', snapshot);
      count++;
    },
    fire() { registered(); },
  };
}

const cycle = makeRenderCycle();
cycle.render();     // count is 0 here — callback captures 0
cycle.render();     // count is now 1
cycle.render();     // count is now 2
cycle.fire();       // callback sees count = 0   ← stale
```

The callback is not wrong; it is faithfully reporting the value from the render that created it. That is precisely the React bug: an effect with `[]` deps registers a callback once, and it keeps reading the first render's props forever. The fixes follow from the mechanism — re-register when the value changes (add it to the deps), read through a ref so the capture is a *box* rather than a value, or use the functional `setState` form so you never need the captured value at all.

**The through-line in all six:** a closure is the right tool whenever state must outlive a call but stay private to one instance. Longer than a local variable, narrower than a module global.

## 6. Objects and Prototypes

### 6.1 Object Creation

JavaScript provides several ways to create objects: object literals for simple one-off objects, `Object.create` for setting the prototype directly, constructor functions for the classic pattern, and ES6 classes as syntactic sugar. Knowing each approach and its trade-offs is important for interviews.

```js
// Object literal
const user = {
  name: 'Alice',
  age: 30,
  greet() { return `Hi, I'm ${this.name}`; },
};

// Computed property names
const key = 'email';
const obj = { [key]: 'alice@example.com' };   // { email: 'alice@example.com' }

// Shorthand properties
const name = 'Alice';
const age = 30;
const user2 = { name, age };                  // { name: 'Alice', age: 30 }

// Object.create (set prototype directly)
const proto = { greet() { return 'hi'; } };
const child = Object.create(proto);
child.greet();                                 // 'hi' (inherited)

// Constructor function
function User(name) {
  this.name = name;
}
User.prototype.greet = function() { return `Hi ${this.name}`; };
const u = new User('Alice');

// ES6 Class (syntactic sugar over constructor + prototype)
class UserClass {
  constructor(name) { this.name = name; }
  greet() { return `Hi ${this.name}`; }
}
```

### 6.2 Prototypal Inheritance

Unlike classical inheritance in languages like Java, JavaScript uses prototypal inheritance: objects inherit directly from other objects via an internal `[[Prototype]]` link. When a property is not found on an object, the engine walks up the prototype chain until it finds it or reaches `null`.

```js
// Every object has an internal [[Prototype]] link
const animal = {
  eat() { return 'eating'; },
};

const dog = Object.create(animal);
dog.bark = function() { return 'woof'; };

dog.bark();              // 'woof' (own property)
dog.eat();               // 'eating' (inherited from animal)

// Prototype chain: dog -> animal -> Object.prototype -> null
```

### 6.3 Object Methods

The `Object` constructor provides several useful static methods for inspecting and manipulating objects. These are commonly used for iteration (`keys`, `values`, `entries`), merging (`assign`, spread), and immutability (`freeze`, `seal`).

```js
const obj = { a: 1, b: 2, c: 3 };

Object.keys(obj);                     // ['a', 'b', 'c']
Object.values(obj);                   // [1, 2, 3]
Object.entries(obj);                  // [['a', 1], ['b', 2], ['c', 3]]
Object.fromEntries([['a', 1]]);       // { a: 1 }

Object.assign({}, obj, { d: 4 });     // { a: 1, b: 2, c: 3, d: 4 }
({ ...obj, d: 4 });                   // same as above (parens: a bare { starts a block)

Object.freeze(obj);                   // shallow freeze (no add/modify/delete)
Object.seal(obj);                     // no add/delete, can modify existing
Object.isFrozen(obj);                 // true
```

#### Signatures and parameters

| Method | Signature | Returns | Notes on the parameters |
|---|---|---|---|
| `Object.keys` | `keys(obj)` | `string[]` | own, enumerable, string keys only — no symbols, no inherited |
| `Object.values` | `values(obj)` | `any[]` | same key set as `keys`, in the same order |
| `Object.entries` | `entries(obj)` | `[key, value][]` | the shape `Object.fromEntries` and `new Map()` both accept |
| `Object.fromEntries` | `fromEntries(iterable)` | a new object | takes any iterable of pairs, so a `Map` works directly |
| `Object.assign` | `assign(target, ...sources)` | the **mutated `target`** | later sources win; pass `{}` as target to avoid mutating |
| `Object.freeze` | `freeze(obj)` | the same object | **shallow** — nested objects stay mutable |
| `Object.seal` | `seal(obj)` | the same object | existing properties stay writable; none can be added or deleted |
| `Object.isFrozen` / `isSealed` | `isFrozen(obj)` | boolean | an empty non-extensible object is both |
| `Object.create` | `create(proto, descriptors?)` | a new object | `create(null)` makes a prototype-less "bare" map |
| `Object.getOwnPropertyNames` | `getOwnPropertyNames(obj)` | `string[]` | like `keys`, but **includes non-enumerable** |
| `Object.defineProperty` | `defineProperty(obj, key, descriptor)` | the object | descriptor defaults are all `false` — see below |
| `Object.groupBy` | `groupBy(items, cb(el, i))` | a `null`-prototype object | ES2024; keys are coerced to strings |

**The three qualifiers on `keys`/`values`/`entries` are the exam question:** *own*, *enumerable*, *string-keyed*. Each excludes something real:

```js
const parent = { inherited: 1 };
const obj = Object.create(parent, {
  visible: { value: 2, enumerable: true },
  hidden:  { value: 3, enumerable: false },
});
obj[Symbol('sym')] = 4;

console.log(Object.keys(obj));                   // ['visible']
console.log(Object.getOwnPropertyNames(obj));    // ['visible', 'hidden']
console.log('inherited' in obj);                 // true — but not in keys()
```

**`Object.assign` mutates its first argument and returns it.** `Object.assign(target, src)` changes `target`; `Object.assign({}, a, b)` is the non-mutating merge. It is also a **shallow** copy and it *triggers setters* on the target — which is where it differs from spread, and why cloning a class instance with it can behave unexpectedly.

**`Object.freeze` is shallow, and silent by default.** Assigning to a frozen property fails quietly in sloppy mode and throws only under `'use strict'` (so always throws inside modules and class bodies). For deep immutability you recurse yourself:

```js
const config = Object.freeze({ api: { url: 'https://a.example' } });
config.api.url = 'https://b.example';       // allowed — `api` was never frozen
console.log(config.api.url);                 // 'https://b.example'
```

**`defineProperty`'s descriptor defaults trip people up:** `writable`, `enumerable` and `configurable` all default to **`false`** when you define a property this way, unlike a normal assignment where all three are `true`.

### 6.4 Destructuring

Destructuring lets you extract values from objects and arrays into distinct variables using a concise syntax. It supports defaults, renaming, nesting, and rest patterns, and is widely used in function parameters, imports, and everyday assignments.

```js
// Object destructuring
const { name, age, email = 'n/a' } = user;    // with default
const { name: userName } = user;                // rename

// Nested destructuring
const { address: { city } } = { address: { city: 'NYC' } };

// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4]; // first=1, second=2, rest=[3,4]
const [, , third] = [1, 2, 3];                  // skip elements

// Swap variables
let a = 1, b = 2;
[a, b] = [b, a];

// Function parameter destructuring
function greet({ name, age }) {
  return `${name} is ${age}`;
}
```

---

## 7. Arrays and Iteration

### 7.1 Array Methods (Non-Mutating)

Non-mutating methods return a new array or value without modifying the original. These are preferred in modern JavaScript and especially in React/functional code because they avoid side effects and make data flow easier to reason about.

```js
const nums = [1, 2, 3, 4, 5];

// map - transform each element
nums.map(n => n * 2);                 // [2, 4, 6, 8, 10]

// filter - keep elements that pass test
nums.filter(n => n > 3);              // [4, 5]

// reduce - accumulate to single value
nums.reduce((sum, n) => sum + n, 0);  // 15

// find - first element that passes test
nums.find(n => n > 3);                // 4

// findIndex - index of first match
nums.findIndex(n => n > 3);           // 3

// some - does ANY element pass?
nums.some(n => n > 4);                // true

// every - do ALL elements pass?
nums.every(n => n > 0);               // true

// includes - does array contain value?
nums.includes(3);                      // true

// flat - flatten nested arrays
[1, [2, [3]]].flat(Infinity);         // [1, 2, 3]

// flatMap - map then flat(1)
[1, 2].flatMap(n => [n, n * 2]);      // [1, 2, 2, 4]

// slice - extract portion (non-mutating)
nums.slice(1, 3);                      // [2, 3]

// concat
[1, 2].concat([3, 4]);                // [1, 2, 3, 4]

// at - relative indexing including negative (ES2022)
[10, 20, 30].at(0);                   // 10
[10, 20, 30].at(-1);                  // 30  (cleaner than arr[arr.length - 1])

// findLast / findLastIndex - search from the end (ES2023)
[1, 5, 3, 5, 7].findLast(n => n === 5);       // 5  (last match)
[1, 5, 3, 5, 7].findLastIndex(n => n === 5);  // 3  (last match's index)

// Array.from - convert iterable / array-like to array
Array.from('abc');                    // ['a', 'b', 'c']
Array.from({ length: 3 }, (_, i) => i * 2);  // [0, 2, 4]
```

**ES2023 immutable array methods** — `toSorted`, `toReversed`, `toSpliced`, `with` — return *new* arrays instead of mutating. The single biggest source of accidental React/Redux mutation bugs is `arr.sort()` (mutates) used inline; the new `arr.toSorted()` solves it cleanly:

```js
const nums = [3, 1, 2];
nums.toSorted();                      // [1, 2, 3]  — new array
nums;                                 // [3, 1, 2]  — original untouched

[1, 2, 3].toReversed();               // [3, 2, 1]
[1, 2, 3].with(1, 99);                // [1, 99, 3]  — replace at index
[1, 2, 3].toSpliced(1, 1, 'x', 'y');  // [1, 'x', 'y', 3]
```

#### Signatures and parameters

**Every callback-taking method shares one callback shape**, which is worth memorising once instead of per method:

```text
arr.method(callbackFn, thisArg?)
     callbackFn(element, index, array)   ← index and array are optional to accept
```

That third `array` parameter is why `['1','7','11'].map(parseInt)` famously returns `[1, NaN, 3]`: `parseInt(string, radix)` receives the index as its radix.

| Method | Signature | Returns | Notes on the parameters |
|---|---|---|---|
| `map` | `map(cb(el, i, arr), thisArg?)` | a new array, same length | returning nothing gives `undefined` entries |
| `filter` | `filter(cb(el, i, arr), thisArg?)` | a new array, ≤ length | keeps elements where the callback is **truthy**, not strictly `true` |
| `reduce` | `reduce(cb(acc, el, i, arr), initialValue?)` | the accumulated value | see the `initialValue` note below |
| `reduceRight` | same, right-to-left | the accumulated value | useful for right-associative composition |
| `find` / `findLast` | `find(cb(el, i, arr))` | the **element**, or `undefined` | ES2023 for `findLast` |
| `findIndex` / `findLastIndex` | `findIndex(cb(el, i, arr))` | the **index**, or `-1` | the `-1` is why `if (idx)` is a bug — use `!== -1` |
| `some` / `every` | `some(cb(el, i, arr))` | boolean | short-circuit; `every` on an empty array is `true` |
| `includes` | `includes(searchEl, fromIndex = 0)` | boolean | uses SameValueZero, so it **finds `NaN`** where `indexOf` cannot |
| `indexOf` | `indexOf(searchEl, fromIndex = 0)` | index or `-1` | strict equality, so `NaN` is never found |
| `slice` | `slice(start = 0, end = length)` | a new array | `end` is **exclusive**; negatives count from the end |
| `concat` | `concat(...values)` | a new array | flattens array arguments **one level** only |
| `flat` | `flat(depth = 1)` | a new array | `Infinity` for fully flat; also drops empty slots |
| `flatMap` | `flatMap(cb(el, i, arr))` | a new array | exactly `map()` then `flat(1)` — return `[]` to drop an element |
| `at` | `at(index)` | element or `undefined` | negatives count from the end: `at(-1)` is the last |
| `join` | `join(separator = ',')` | a string | `null` and `undefined` become empty strings |

**`reduce`'s `initialValue` is the parameter that matters.** Omit it and the first element becomes the accumulator, the callback starts at index 1, and **an empty array throws `TypeError`**. Pass it and the callback runs for every element, starting at index 0 — which is why `[].reduce((a, b) => a + b, 0)` is `0` while `[].reduce((a, b) => a + b)` throws.

```js
console.log([1, 2, 3].reduce((a, b) => a + b));      // 6  — starts at index 1
console.log([].reduce((a, b) => a + b, 0));          // 0  — safe
// [].reduce((a, b) => a + b);                        // TypeError: Reduce of empty array
```

### 7.2 Array Methods (Mutating)

Mutating methods modify the array in place rather than returning a new one. Be cautious with these in functional or React code, where immutability is expected. Always know which methods mutate -- this is a common interview question.

```js
const arr = [1, 2, 3];

arr.push(4);                // [1, 2, 3, 4]     add to end
arr.pop();                  // [1, 2, 3]         remove from end
arr.unshift(0);             // [0, 1, 2, 3]      add to start
arr.shift();                // [1, 2, 3]         remove from start
arr.splice(1, 1, 'a');      // [1, 'a', 3]       remove/insert at index
arr.sort((a, b) => a - b);  // sorts in place
arr.reverse();               // reverses in place
arr.fill(0);                 // [0, 0, 0]
```

#### Signatures and parameters

| Method | Signature | Returns | Watch out for |
|---|---|---|---|
| `push` | `push(...items)` | the **new length** | not the array — so it does not chain |
| `pop` | `pop()` | the removed element | `undefined` on an empty array |
| `unshift` | `unshift(...items)` | the new length | O(n): every element is reindexed |
| `shift` | `shift()` | the removed element | also O(n) |
| `splice` | `splice(start, deleteCount?, ...items)` | an array of the **removed** elements | omit `deleteCount` and it removes everything from `start` |
| `sort` | `sort(compareFn?)` | the **same array**, sorted | default compares as **strings** |
| `reverse` | `reverse()` | the same array | |
| `fill` | `fill(value, start = 0, end = length)` | the same array | one shared reference if `value` is an object |
| `copyWithin` | `copyWithin(target, start, end?)` | the same array | rarely used outside typed arrays |

**`sort` without a comparator is the classic trap.** Elements are converted to strings and compared by UTF-16 code unit, so numbers sort lexicographically:

```js
console.log([10, 9, 100].sort());                 // [10, 100, 9]   ← string order
console.log([10, 9, 100].sort((a, b) => a - b));  // [9, 10, 100]   ← numeric
```

The comparator returns a **number**, not a boolean: negative keeps `a` first, positive puts `b` first, `0` treats them as equal. Returning `true`/`false` coerces to `1`/`0` and produces a subtly wrong order.

**`fill` with an object shares one reference**, which is the array equivalent of the shallow-copy trap:

```js
const grid = new Array(3).fill([]);   // all three slots are the SAME array
grid[0].push('x');
console.log(grid);                     // [['x'], ['x'], ['x']]
// Use Array.from({ length: 3 }, () => []) for three distinct arrays.
```

**The immutable counterparts** (ES2023) exist for all of these except `push`/`pop`: `toSorted`, `toReversed`, `toSpliced` and `with` return a new array and leave the original alone — see §7.1.

### 7.3 Iteration

JavaScript offers several loop constructs: `for...of` iterates over values of any iterable (arrays, strings, Maps, Sets), `for...in` iterates over enumerable property keys (best for objects), and `forEach` is an array method that cannot be broken out of early. Choose the right one based on what you are iterating and whether you need `break`/`continue`.

```js
// for...of (iterates values - arrays, strings, maps, sets)
for (const num of [1, 2, 3]) {
  console.log(num);                    // 1, 2, 3
}

// for...in (iterates keys - objects, but also inherited properties)
for (const key in { a: 1, b: 2 }) {
  console.log(key);                    // 'a', 'b'
}

// forEach (no break, no return value)
[1, 2, 3].forEach((num, index) => {
  console.log(num, index);
});
```

---

#### Signatures and parameters

| Construct | Signature | Iterates over | `break` / `continue` | `await` inside |
|---|---|---|---|---|
| `for...of` | `for (const el of iterable)` | **values** of any iterable | yes | yes |
| `for...in` | `for (const key in obj)` | **enumerable string keys**, including inherited | yes | yes |
| `forEach` | `arr.forEach(cb(el, i, arr), thisArg?)` | array elements | **no** | **no** (see below) |
| `for` | `for (init; condition; update)` | whatever you index | yes | yes |
| `while` / `do…while` | `while (condition)` | whatever you advance | yes | yes |
| `for await...of` | `for await (const el of asyncIterable)` | values of an async iterable | yes | it *is* awaiting |
| `arr.entries()` | `entries()` | `[index, value]` pairs | yes (with `for...of`) | yes |
| `Object.entries()` | `entries(obj)` | `[key, value]` pairs | yes (with `for...of`) | yes |

**`forEach` returns `undefined`** — it exists for side effects only. That is also why it cannot be chained, and why reaching for it when you want a result is the tell that `map`/`filter`/`reduce` was the right call.

**The two things `forEach` cannot do**, and both are the usual reason to prefer `for...of`:

```js
// 1. You cannot break out. `return` exits the CALLBACK, not the loop.
[1, 2, 3, 4].forEach(n => {
  if (n === 3) return;      // acts like `continue`, never like `break`
  console.log(n);            // 1, 2, 4
});
```

```js
// 2. It does not await. The callback is async, so forEach fires all three and
//    moves on — "done" prints FIRST.
async function run() {
  [1, 2, 3].forEach(async (n) => {
    await new Promise(r => setTimeout(r, 10));
    console.log('item', n);
  });
  console.log('done');       // prints before any item
}
run();
```

Sequential async work wants `for...of` with `await` inside; parallel work wants `await Promise.all(arr.map(fn))`. `forEach` gives you neither.

**`for...in` is for objects, and even then it needs care.** It walks the prototype chain and yields **string** keys — so on an array you get `'0'`, `'1'`, `'2'`, not numbers:

```js
const arr = ['a', 'b'];
for (const i in arr) console.log(typeof i, i);   // string 0, string 1

Array.prototype.custom = 'oops';                  // anything on the prototype
for (const i in arr) console.log(i);              // 0, 1, custom  ← inherited
delete Array.prototype.custom;
```

Guard with `Object.hasOwn(obj, key)` when you must use it, or prefer `Object.keys(obj)` / `Object.entries(obj)`, which are own-and-enumerable by definition.

**When you need the index with `for...of`**, use `entries()` rather than a manual counter:

```js
for (const [index, value] of ['a', 'b'].entries()) {
  console.log(index, value);        // 0 'a' … 1 'b'
}
```

**One more difference worth knowing: sparse arrays.** `forEach`, `map` and `filter` **skip holes**; `for...of` visits them as `undefined`.

```js
const sparse = [1, , 3];                      // a hole at index 1
const seen = [];
sparse.forEach(v => seen.push(v));
console.log(seen);                             // [1, 3]      — hole skipped
console.log([...sparse]);                      // [1, undefined, 3]  — hole visited
```

## 8. Asynchronous JavaScript

### 8.1 Callbacks

Callbacks were the original pattern for handling asynchronous operations in JavaScript: you pass a function to be called when the work is done. While simple in isolation, deeply nested callbacks lead to "callback hell," making code hard to read, maintain, and debug.

```js
function fetchData(callback) {
  setTimeout(() => {
    callback(null, { id: 1, name: 'Alice' });
  }, 1000);
}

fetchData((err, data) => {
  if (err) return console.error(err);
  console.log(data);
});

// Callback hell (pyramid of doom)
getUser(userId, (err, user) => {
  getOrders(user.id, (err, orders) => {
    getProducts(orders[0].id, (err, products) => {
      // deeply nested, hard to read and maintain
    });
  });
});
```

### 8.2 Promises

Promises provide a cleaner alternative to callbacks for managing asynchronous operations. A promise represents a value that may not be available yet and can be in one of three states: pending, fulfilled, or rejected. Promises support chaining with `.then()` and combinators like `Promise.all` for concurrent work.

```js
// Creating a promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    if (success) resolve({ id: 1 });
    else reject(new Error('Failed'));
  }, 1000);
});

// Consuming a promise
promise
  .then(data => console.log(data))
  .catch(err => console.error(err))
  .finally(() => console.log('done'));

// Chaining (each .then returns a new promise)
fetchUser()
  .then(user => fetchOrders(user.id))
  .then(orders => fetchProducts(orders[0].id))
  .then(products => console.log(products))
  .catch(err => console.error(err));    // catches any error in the chain

// Promise.all - parallel, fails if ANY rejects
Promise.all([fetchA(), fetchB(), fetchC()])
  .then(([a, b, c]) => console.log(a, b, c));

// Promise.allSettled - parallel, never rejects, returns status of each
Promise.allSettled([fetchA(), fetchB()])
  .then(results => {
    // [{ status: 'fulfilled', value: ... }, { status: 'rejected', reason: ... }]
  });

// Promise.race - resolves/rejects with the first to settle
Promise.race([fetchA(), timeout(5000)])
  .then(result => console.log(result));

// Promise.any - resolves with first fulfilled (ignores rejections)
Promise.any([fetchA(), fetchB()])
  .then(first => console.log(first));
```

### 8.3 Async/Await

`async`/`await` is syntactic sugar over promises that lets you write asynchronous code in a synchronous-looking style. An `async` function always returns a promise, and `await` pauses execution until the awaited promise settles, making complex async flows much easier to read and debug.

```js
// async function always returns a promise
async function getUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Not found');
    const user = await response.json();
    return user;
  } catch (error) {
    console.error(error);
    throw error;                        // re-throw so caller can handle
  }
}

// Parallel execution with async/await
async function loadDashboard() {
  // DON'T: Sequential (slow) — the second request waits for the first
  // const kpis = await fetchKPIs();
  // const alerts = await fetchAlerts();

  // DO: Parallel (fast) — both start immediately
  const [kpis, alerts] = await Promise.all([fetchKPIs(), fetchAlerts()]);
}

// Top-level await (ES modules)
const config = await loadConfig();
```

### 8.4 Microtasks vs Macrotasks

The event loop processes two types of queues: microtasks (promises, `queueMicrotask`) and macrotasks (`setTimeout`, `setInterval`, I/O). Microtasks always run before the next macrotask, which is why promise callbacks execute before `setTimeout` callbacks even with a 0ms delay.

```js
console.log('1');                           // synchronous

setTimeout(() => console.log('2'), 0);      // macrotask

Promise.resolve().then(() => console.log('3')); // microtask

console.log('4');                           // synchronous

// Output: 1, 4, 3, 2
// Microtasks (promises) run BEFORE macrotasks (setTimeout)
```

---

### 8.5 Mixing `async`/`await` with `.then()`/`.catch()`

They're the same mechanism — `await` consumes a promise, `.then()` chains one — so mixing them is legal. It's also where a lot of real bugs live, because the two styles handle errors and sequencing differently.

**The forgotten `await`** is the most common. An `async` function always returns a promise, so calling one without `await` starts the work and moves on:

```js
async function save() { throw new Error('boom'); }

async function handler() {
  try {
    save();                     // ✗ no await — the rejection escapes this try/catch
  } catch (e) {
    console.log('caught');      // never runs
  }
  return 'done';                // resolves fine; the error surfaces as
}                               // an unhandled rejection, elsewhere, later
```

`try`/`catch` only catches what the `await`ed expression rejects with. Without `await`, the promise leaves the `try` block before it settles.

**Mixing on the same call** produces a subtler trap:

```js
// ✗ Both a .catch() AND a try/catch — the catch handler "handles" it,
//   so the await resolves with undefined and the try block is never entered
try {
  const data = await fetch(url).then(r => r.json()).catch(() => null);
  process(data);               // data is null, not an error — silently wrong
} catch (e) { /* unreachable */ }
```

`.catch()` returning a value **converts a rejection into a resolution**. That's often what you want, but then the `try`/`catch` is dead code and the caller has to check for the sentinel. Pick one style per call site.

**Where `.then()` is genuinely better** — the case worth knowing, because "always use await" is wrong:

```js
// Sequential — 3 round trips, one after another
const a = await getA(); const b = await getB(); const c = await getC();
```

```js
// Concurrent — start all three, then await. This is the fix for
// the most common async performance bug in real codebases.
const [a, b, c] = await Promise.all([getA(), getB(), getC()]);
```

```js
// Start early, await late — useful when you need to do other work in between
const userPromise = getUser();        // no await: the request is already in flight
renderSkeleton();
const user = await userPromise;
```

Two more rules that come up:

- **`await` in a loop is sequential.** `for (const id of ids) await fetch(id)` makes N sequential requests. Use `Promise.all(ids.map(fetch))` for parallel, or a bounded pool if N is large enough to hammer the server.
- **`.forEach` with an `async` callback doesn't wait.** `forEach` ignores the returned promise, so the loop finishes instantly and the work continues in the background. Use `for...of` with `await` (sequential) or `Promise.all(map(...))` (parallel). This one silently breaks ordering guarantees.
- **`return await` vs `return`.** Inside a `try` block they differ: `return await p` catches `p`'s rejection locally, `return p` hands the promise to the caller and your `catch` never sees it. Outside a `try` they're equivalent (modern engines don't add a meaningful tick).

---

### 8.6 Top-Level `await`

In an **ES module** (ES2022), `await` works at the top level, outside any function:

```js
// config.js — an ES module
const res = await fetch('/config.json');
export const config = await res.json();
```

The mechanism worth understanding: a module containing top-level `await` becomes an **async module**, and every module that imports it waits for it to finish evaluating before its own body runs. The `await` doesn't block the thread — it blocks the *module graph* beneath it.

That gives you three genuinely useful patterns:

```js
// 1. Conditional dynamic import — pick an implementation at load time
const db = process.env.DB === 'pg'
  ? await import('./pg-adapter.js')
  : await import('./sqlite-adapter.js');

// 2. Resource initialisation without an init() function every caller must remember
export const connection = await createConnection();

// 3. Dependency fallback
let lib;
try { lib = await import('./fast-native.js'); }
catch { lib = await import('./pure-js-fallback.js'); }
```

And three constraints that get asked:

- **ES modules only.** Not in CommonJS, and not in a classic `<script>` — you need `<script type="module">` or a `.mjs`/`"type": "module"` file. A syntax error otherwise.
- **`require()` of a module with top-level `await` throws**, even on Node 24 where `require(esm)` is otherwise supported. `require` is synchronous by contract, so there's nothing it can return. `await import()` is the only option. This is the single most common real-world limitation.
- **It can delay your whole app.** A slow top-level `await` in a widely-imported module blocks every importer, and because it's not in a function there's no obvious place to add a timeout or a loading state. Keep it for genuinely required startup work, and keep it fast.

---

### 8.7 Retrying, Cancelling and Bounding Async Work

Three production patterns that come up as "implement this" questions.

**Retry with exponential back-off and jitter:**

**The problem.** A network call fails. Some failures are **permanent** — a 404, a 401, a malformed body — and the identical request will fail identically forever, so retrying only wastes time. Others are **transient**: a server restarting, a rate limit, a dropped connection. The same call would succeed a second later. Retry exists for the second kind, and the first job of the code is to tell them apart.

**But naive retrying makes things worse.** If a service is overloaded and every client retries immediately, you have doubled the load on something already struggling. So each wait gets longer — that is the "back-off" — and each client waits a *different* amount — that is the "jitter".

```js
// The helper the retry loop depends on. Without it, the snippet throws
// ReferenceError on the first failure — it is the most important function here.
function isRetryable(err) {
  if (err.name === 'AbortError') return false;          // the caller cancelled
  if (err.name === 'TypeError') return true;            // fetch's network failure
  const status = err.status ?? err.response?.status;
  if (status === undefined) return true;                // no response = transient
  return status === 408 || status === 429 || status >= 500;
}

async function retry(fn, { retries = 3, base = 300, factor = 2, maxDelay = 10000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !isRetryable(err)) throw err;
      const delay = Math.min(base * factor ** attempt, maxDelay);
      const jittered = Math.random() * delay;          // full jitter
      await new Promise(r => setTimeout(r, jittered));
    }
  }
}
```

**What the delays look like** with the defaults:

| Attempt | Call | Back-off ceiling | Actual wait (full jitter) |
|---|---|---|---|
| 0 | 1st | `300 × 2⁰` = 300 ms | anywhere in 0–300 ms |
| 1 | 2nd | `300 × 2¹` = 600 ms | anywhere in 0–600 ms |
| 2 | 3rd | `300 × 2²` = 1200 ms | anywhere in 0–1200 ms |
| 3 | 4th | — | throws if this fails |

So `retries = 3` means **three retries and four total calls**. `factor ** attempt` is `Math.pow`, and `**` binds tighter than `*`, so no parentheses are needed.

**Three lines that are not obvious:**

- **`for (let attempt = 0; ; attempt++)`** — the empty middle condition makes this an intentional infinite loop. It exits only by returning a success or throwing. Write `attempt < retries` in the header instead and the loop falls out the bottom after the last failure and returns `undefined` — the final error vanishes silently.
- **`return await fn()`** — normally `return await` is redundant. Not here. Without the `await` you return the promise immediately, the `try` block ends, and a later rejection has no `catch` wrapping it, so the retry never fires. This is the one place it is load-bearing.
- **`if (attempt >= retries || !isRetryable(err)) throw err`** — order matters: decide whether to give up *before* sleeping, or you wait 1.2 seconds and throw anyway. And it rethrows the **original** error, so the caller sees the real failure rather than a generic "retries exhausted".

**Now jitter, which is the part people skip.** Back-off alone has its own failure mode. If a service goes down and a thousand clients fail at the same instant, they all wait exactly 300 ms and all retry at the same instant. The server is hit by a synchronised wave, falls over again, and the wave repeats — bigger each time, because the clients stay in lockstep.

```text
No jitter        │█████████│          │█████████│          │█████████│
                 0ms      300ms                900ms               2100ms
                 all 1000 arrive together, every time

Full jitter      │ ▁▃▂▁▃▂▁▂▃ │  ▁▂▁▃▁▂▃▁▂▃▁▂  │ ▁▂▃▁▂▁▃▂▁▃▂▁▃▂▁ │
                 0–300ms        0–600ms            0–1200ms
                 the same retries, spread across a widening window
```

`Math.random() * delay` is what breaks the lockstep: each client picks a random point in `[0, delay)`, so the same number of retries arrives spread out instead of all at once. The window widens each attempt because `delay` is growing.

**Full vs equal jitter** is the follow-up. Equal jitter — `delay/2 + Math.random() * delay/2` — keeps a floor under the wait, so you never retry after 3 ms, but it spreads clients across only half the window. AWS's architecture blog recommends **full jitter** as the default. The trade-off is what you would say if asked: full jitter spreads clients widest but can retry almost immediately; equal jitter guarantees the server some breathing room.

**What is still missing, which is where an interviewer will dig:**

- **No idempotency safeguard — this is the serious one.** Retrying a `GET` is free. Retrying a `POST` that charges a card can charge twice, especially in the case where the request *succeeded* but the response was lost. The server cannot tell it is a retry unless you send an **idempotency key** — see the Stripe guide, which is built around exactly this.
- **No cancellation.** Mid-sleep there is no way to abort: the component unmounts and the retry still fires 1.2 seconds later. Thread an `AbortSignal` through both `fn()` and the `setTimeout` — the same `AbortController` as the next pattern.
- **It ignores `Retry-After`.** A 429 or 503 often tells you exactly how long to wait. Your back-off is a guess; that header is not, so prefer it when present.
- **A cap is necessary, not optional.** `maxDelay` is in the code above for a reason: without it, `retries = 10` reaches `300 × 2⁹` ≈ **154 seconds** for a single wait.
- **No jitter on the first attempt.** The initial call is unjittered by design — you want the happy path to be fast — but if a thousand clients start a poll on the same cron tick, the *first* request is the synchronised one.

**Cancellation with `AbortController`:**

**The problem.** You started work that is no longer wanted. The user navigated away, typed another character in the search box, or the request is simply taking too long. Nothing about a promise lets you stop it — a promise is a *notification* that something finished, not a handle on the work itself. `.then()` cannot be un-called, and `Promise.race` only lets you stop *waiting*; the losing request keeps running.

**Why ignoring the result is not enough.** If you fire a request and discard its answer, three things still go wrong:

| What keeps happening | Consequence |
|---|---|
| The connection stays open | HTTP/1.1 allows ~6 per origin; abandoned requests occupy those slots |
| Bytes keep arriving | real data and battery cost on mobile, for a response nobody reads |
| The response still resolves | a slow *earlier* request can land after a fast later one and overwrite it |

That third one is the out-of-order bug that makes a search box show results for a query the user has already replaced. Cancelling is what removes it at the source, rather than papering over it with a "is this still the current query?" check.

**So what is `AbortController`?** It is the platform's general-purpose **cancellation primitive** — not a `fetch` feature, though that is where most people meet it. It is deliberately two objects:

| Half | Who holds it | What it can do |
|---|---|---|
| `controller` | the code that *starts* the work | `controller.abort(reason?)` — the only way to cancel |
| `controller.signal` | handed to whoever *does* the work | observe only: `aborted`, `reason`, an `abort` event |

That split is the entire design. You can pass the signal to a library, a component, or untrusted code and it can react to cancellation without being able to *cause* it. One controller can feed many operations, so a single `abort()` cancels a whole tree of work.

An `AbortSignal` is an `EventTarget`, which gives it a small but complete surface:

```js
const controller = new AbortController();
const { signal } = controller;

console.log(signal.aborted);                  // false

signal.addEventListener('abort', () => {
  console.log('aborted because:', signal.reason.message);
});

controller.abort(new Error('user navigated away'));
console.log(signal.aborted);                  // true
controller.abort();                           // idempotent — no second event
```

| Member | What it is for |
|---|---|
| `signal.aborted` | a boolean you can check before starting work |
| `signal.reason` | whatever you passed to `abort()`; defaults to an `AbortError` `DOMException` |
| `signal.throwIfAborted()` | the one-liner for "bail out now if we were cancelled" |
| `signal.addEventListener('abort', fn)` | react to cancellation — close a socket, reject a pending promise |
| `AbortSignal.timeout(ms)` | a signal that aborts itself; its reason is a `TimeoutError` |
| `AbortSignal.any([a, b])` | one signal that aborts when **any** of its inputs does |

**With `fetch`, which is where you will actually use it.** This one hits a real endpoint, so pressing **Try it** runs all three cases for real:

```js
const ENDPOINT = 'https://jsonplaceholder.typicode.com/users/1';

async function load(signal) {
  const res = await fetch(ENDPOINT, { signal });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

(async () => {
  // 1. A timeout. 50ms is shorter than the round trip, so this always fires.
  try {
    await load(AbortSignal.timeout(50));
  } catch (err) {
    console.log('1. timeout   →', err.name);        // TimeoutError
  }

  // 2. A user-initiated cancel — the component unmounted, the query changed.
  const controller = new AbortController();
  const pending = load(controller.signal).catch(err => {
    console.log('2. cancelled →', err.name);        // AbortError
  });
  controller.abort();
  await pending;

  // 3. Both at once — whichever aborts first wins. Note this one may SUCCEED:
  //    the connection is warm after the calls above, so 50ms is sometimes enough.
  const user = new AbortController();
  const either = AbortSignal.any([user.signal, AbortSignal.timeout(50)]);
  try {
    await load(either);
    console.log('3. combined  → finished before either signal fired');
  } catch (err) {
    console.log('3. combined  →', err.name);        // whichever aborted first
  }

  // 4. The happy path, for contrast — no signal, so it runs to completion.
  const user1 = await load();
  console.log('4. succeeded →', user1.name);
})();
```

**The detail in that output is the one to take away: a timeout is a `TimeoutError`, not an `AbortError`.** `controller.abort()` rejects with an `AbortError`; `AbortSignal.timeout(ms)` rejects with a `TimeoutError`. Both are `DOMException`s, and code that checks only `err.name === 'AbortError'` will therefore treat a timeout as a genuine failure and log it to your error tracker:

```js
function handleBroken(err) {
  if (err.name === 'AbortError') return null;   // ✗ a timeout falls through
  throw err;                                     //   and lands in your error tracker
}

function handleFixed(err) {
  if (err.name === 'AbortError') return null;                 // user cancelled — silent
  if (err.name === 'TimeoutError') return { error: 'slow' };  // worth surfacing
  throw err;                                                   // a real failure
}

console.log(handleFixed({ name: 'TimeoutError' }));   // { error: 'slow' }
console.log(handleFixed({ name: 'AbortError' }));     // null
```

**Anything can honour a signal — including your own functions.** There is nothing magic about `fetch`; it simply accepts a signal and reacts to it. Yours can too, and this is what interviewers mean by "make it cancellable":

```js
function sleep(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();                          // already cancelled? stop now
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);                                // release the resource
      reject(signal.reason);                           // and reject the promise
    }, { once: true });
  });
}
```

That is the missing piece in the retry pattern above: give `sleep` a signal and a long back-off becomes interruptible.

**The trick worth stealing:** `addEventListener` itself takes a signal, so one `abort()` removes any number of listeners — no `removeEventListener`, and no keeping the original function reference around.

```js
const ac = new AbortController();
window.addEventListener('resize', onResize, { signal: ac.signal });
window.addEventListener('scroll', onScroll, { signal: ac.signal });
ac.abort();     // both listeners removed at once
```

In React that makes effect cleanup a single line regardless of how many listeners the effect added.

```js
async function run() {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 5000);       // or AbortSignal.timeout(5000)

  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') return null;               // distinguish this!
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
```

**Reading it line by line:**

- **`new AbortController()`** gives you two halves of one object: the **controller**, which you keep, and `controller.signal`, which you hand out. Only the holder of the controller can cancel; everyone else merely observes. That split is the whole design — it is why you can pass the signal to untrusted code without giving it the power to abort.
- **`setTimeout(() => ctrl.abort(), 5000)`** is the timeout. `fetch` has no timeout option of its own, which surprises people — this is how you add one.
- **`fetch(url, { signal })`** — passing the signal is what makes the request cancellable. Abort after this point rejects the fetch promise **and** tells the browser to tear down the connection, which is the part `Promise.race` cannot do.
- **`err.name === 'AbortError'`** — an abort surfaces as a rejection, so it lands in the same `catch` as a genuine network failure. The name is the only thing distinguishing them. (The thrown value is a `DOMException`, so `instanceof Error` is true but the class is not `Error`.)
- **`finally { clearTimeout(timeout) }`** — without this, a request that finishes in 50ms leaves a timer armed for another 4.95 seconds, and in Node that keeps the process alive. `finally` runs on success, failure and abort alike, which is exactly the guarantee you want for cleanup.

**`AbortController` vs `Promise.race` for a timeout** — the distinction interviewers probe:

| Aspect | `Promise.race([fetch, timer])` | `AbortController` |
|---|---|---|
| You stop waiting | yes | yes |
| The request stops | **no — it runs to completion** | yes, the connection is torn down |
| Bandwidth after the timeout | still spent | freed |
| The server's work | continues | may still complete, but you stop receiving |
| Composability | one race per call site | one signal, passed to many calls |

`race` is the version people write first because it needs no new API. It solves the symptom — your code moves on — while leaving the cause running, which is why `AbortSignal.timeout(ms)` is the better answer to "add a timeout to this fetch".

**What is still missing here:**

- **The signal is not threaded down.** Anything `run()` calls — a nested fetch, a retry loop, a worker — needs the same signal passed to it, or cancelling the outer call leaves the inner work running. A signal only cancels what was given it.
- **Nothing tells the user.** Returning `null` on abort is fine for a timeout you expect; for a user-initiated cancel you usually want a distinct outcome so the UI can say "cancelled" rather than silently rendering nothing.
- **An aborted request may still have reached the server.** Abort stops *you* listening; it does not undo a mutation the server already committed. That is the same idempotency point as the retry above.

`AbortSignal.timeout(ms)` is the modern shorthand, and `AbortSignal.any([a, b])` combines signals — a user-initiated cancel *and* a timeout. The rule: **always distinguish an abort from a real error**, or a user navigating away logs as a failure and pollutes your error rate.

**Bounded concurrency** — the "throttle promises" pattern.

**The problem.** `Promise.all(urls.map(fetch))` looks like the parallel answer, and for ten URLs it is. For a thousand it is a denial-of-service attack on your own infrastructure: you construct a thousand promises at once, the browser queues most of them anyway (six per origin on HTTP/1.1), the server sees a spike it did not need to, and any rate limit trips immediately. You also hold every pending result in memory at the same time.

What you actually want is **N in flight at all times** — start N, and each time one finishes, start the next:

```text
Promise.all (1000 items)   ████████████████████████  all 1000 launched at t=0
                           ↑ browser queues them, server spikes, limits trip

pool(items, 3, worker)     ▓▓▓───▓▓▓───▓▓▓───▓▓▓───   never more than 3 at once
                           worker A ██──██──███──
                           worker B █████──██──██
                           worker C ██──████──█──     ← a free worker takes the next item
```

A pool keeps exactly N in flight:

```js
async function pool(items, limit, worker) {
  const results = new Array(items.length);
  let i = 0;
  const runners = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++;                        // claim an index atomically (single-threaded)
      results[idx] = await worker(items[idx]);
    }
  });
  await Promise.all(runners);
  return results;                             // order preserved
}
```

**Reading it line by line** — this one is short but the trick is easy to miss:

- **`let i = 0`** is a shared cursor, not a loop counter. Every runner reads and advances the same `i`, which is what makes them cooperate rather than each processing the whole list.
- **`Array.from({ length: limit }, async () => …)`** creates exactly `limit` runners and **starts them immediately** — an `async` function begins executing synchronously up to its first `await`. So you get N workers in flight from the first tick, not N sequential passes.
- **`const idx = i++`** is the claim. Post-increment reads the current value *then* advances, so each runner takes a distinct index. It is safe without a lock because JavaScript is single-threaded and there is no `await` between the read and the write — the two statements cannot interleave. Splitting it into `const idx = i; await …; i++;` would break exactly that property and hand two runners the same item.
- **`while (i < items.length)`** — a runner keeps taking the next unclaimed item until none are left, so a fast item does not leave that worker idle. That is what makes this a *pool* rather than a fixed partition: 100 items and 5 runners does not mean 20 each, it means whoever is free takes the next one.
- **`results[idx] = await worker(...)`** — writing by index is what preserves input order in the output, even though completion order is arbitrary. Pushing to an array instead would return results in the order they *finished*.
- **`await Promise.all(runners)`** waits for all N runner promises. Note the failure mode this inherits: one rejection rejects the whole thing while the other runners keep going. For batch work you want `worker` to catch internally, or `Promise.allSettled` here.

**What it gives you, concretely.** With 8 items, a limit of 3 and workers that finish out of order, the peak number in flight is exactly 3 and the output is still in **input** order — `[10, 20, 30, 40, 50, 60, 70, 80]`, not completion order. Those two properties are the whole point: bounded load, unsurprising results.

**Why not just chunk the array?** Splitting 1,000 items into 200 batches of 5 and awaiting each batch is simpler to write and measurably worse: every batch runs at the speed of its **slowest** member, and the other four workers sit idle waiting for it. A pool has no such barrier — a worker that finishes early immediately takes the next item. On uneven workloads that is often a large difference — nine items where every third one is slow takes **76 ms** through a pool of 3 and **182 ms** in fixed batches of 3, because each batch waits for its own straggler.

**What is still missing here:**

- **One rejection sinks the batch.** `Promise.all(runners)` rejects on the first failed worker while the rest keep running — so you get neither the results nor a clean stop. Catch inside `worker`, or collect `{ status, value }` per item.
- **No cancellation, again.** There is no way to stop the pool half-way; a signal checked at the top of the `while` would let it drain early.
- **`limit` is a guess.** The right number depends on what you are bounding — browser connections per origin (6 over HTTP/1.1), an API's rate limit, or database connections. "Why 5?" is a fair question and "it felt right" is a poor answer.

Also worth naming: `Promise.allSettled` when you want every result regardless of failures (batch jobs, dashboards), `Promise.any` for a first-success race across mirrors, and `Promise.race` for a timeout — though `AbortSignal.timeout` is better, because `race` leaves the losing request running and still paying for bandwidth.

---

## 9. ES6+ and Modern JavaScript

### 9.1 Template Literals

Template literals use backticks instead of quotes and support embedded expressions via `${...}`, multiline strings without escape characters, and tagged templates for custom string processing. They are the preferred way to build strings in modern JavaScript.

```js
const name = 'Alice';
const greeting = `Hello ${name}!`;
const multiline = `
  Line 1
  Line 2
`;

// Tagged templates
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? `<b>${values[i]}</b>` : '');
  }, '');
}
highlight`Hello ${name}, you are ${30} years old`;
```

### 9.2 Optional Chaining and Nullish Coalescing

Optional chaining (`?.`) lets you safely access deeply nested properties without checking each level for `null`/`undefined`. Nullish coalescing (`??`) provides a default value only when the left side is `null` or `undefined`, unlike `||` which also triggers on falsy values like `0` or `''`.

```js
// Optional chaining (?.)
const city = user?.address?.city;         // undefined if any part is null/undefined
const first = arr?.[0];                   // safe array access
const result = obj?.method?.();           // safe method call

// Nullish coalescing (??) - only null/undefined trigger fallback
const port = config.port ?? 3000;         // 0 is kept (unlike ||)
const name = user.name ?? 'Anonymous';

// Comparison with ||
0 || 'default'                            // 'default' (0 is falsy)
0 ?? 'default'                            // 0 (0 is not null/undefined)
'' || 'default'                           // 'default'
'' ?? 'default'                           // ''
```

### 9.3 Map, Set, WeakMap, WeakSet

ES6 introduced these built-in collection types as alternatives to plain objects and arrays. `Map` allows any type as a key (not just strings), `Set` stores unique values, and their `Weak` variants hold weak references that allow garbage collection -- useful for caching and metadata without causing memory leaks.

```js
// Map - key-value pairs (any type as key)
const map = new Map();
map.set('name', 'Alice');
map.set(42, 'answer');
map.set(objRef, 'metadata');
map.get('name');                           // 'Alice'
map.has(42);                               // true
map.size;                                  // 3
map.delete(42);
for (const [key, value] of map) { /* ... */ }

// Set - unique values
const set = new Set([1, 2, 2, 3]);        // Set(3) { 1, 2, 3 }
set.add(4);
set.has(2);                                // true
set.delete(2);
set.size;                                  // 3
const unique = [...new Set(array)];        // deduplicate array

// WeakMap - keys must be objects, allows garbage collection
const weakMap = new WeakMap();
let obj = {};
weakMap.set(obj, 'data');
obj = null;                                // entry can be garbage collected

// WeakSet - same but for values
```

### 9.4 Iterators and Generators

The iteration protocol defines how objects produce a sequence of values. Any object with a `Symbol.iterator` method is iterable and works with `for...of`, spread, and destructuring. Generator functions (`function*`) provide a simpler way to implement iterators and enable lazy evaluation, producing values on demand with `yield`.

```js
// Iterable protocol - any object with Symbol.iterator
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        return i < 3
          ? { value: i++, done: false }
          : { done: true };
      },
    };
  },
};
for (const val of iterable) console.log(val); // 0, 1, 2

// Generator function (simpler way to create iterables)
function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}
for (const n of range(1, 4)) console.log(n); // 1, 2, 3

// Generator with delegation
function* concat(a, b) {
  yield* a;
  yield* b;
}

// Async generator
async function* fetchPages(url) {
  let page = 1;
  while (true) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();
    if (data.items.length === 0) return;
    yield data.items;
    page++;
  }
}
```

### 9.5 Proxy and Reflect

`Proxy` lets you intercept and customize fundamental operations on objects (property access, assignment, function calls, etc.) by defining handler traps. This is the mechanism behind reactivity systems in frameworks like Vue and is useful for validation, logging, and default values.

```js
const handler = {
  get(target, prop) {
    return prop in target ? target[prop] : `Property ${prop} not found`;
  },
  set(target, prop, value) {
    if (typeof value !== 'string') throw new TypeError('Must be string');
    target[prop] = value;
    return true;
  },
};

const proxy = new Proxy({}, handler);
proxy.name = 'Alice';                      // OK
// proxy.name = 42;                        // TypeError
console.log(proxy.missing);               // 'Property missing not found'
```

---

### 9.6 Which Version Shipped What — The Baseline Table

Interviewers rarely ask "what year did X land?", but they do ask "is that safe to use?" and "what would you reach for here?". Knowing the rough vintage of a feature tells you whether it needs a polyfill, a transpiler, or nothing at all.

| Edition | Features you are expected to know |
|---|---|
| **ES2022** | Top-level `await`, class static blocks, private fields (`#x`) + the `#x in obj` brand check, `Object.hasOwn`, `Array.prototype.at`, `Error` `cause`, RegExp `d` flag (match indices) |
| **ES2023** | `findLast` / `findLastIndex`, the immutable quartet `toSorted` / `toReversed` / `toSpliced` / `with`, hashbang grammar |
| **ES2024** | `Object.groupBy` / `Map.groupBy`, `Promise.withResolvers`, RegExp `v` flag (set notation), `ArrayBuffer.prototype.transfer` |
| **ES2025** | Iterator helpers, Set methods (`union`, `intersection`, …), `Promise.try`, `RegExp.escape`, duplicate named capture groups, import attributes (`with { type: 'json' }`) |
| **ES2026** | **Temporal**, explicit resource management (`using` / `await using`), `Array.fromAsync`, `Error.isError` |

Everything through ES2024 is available in every current browser and in Node 20+, so it needs no build step. ES2025 and ES2026 features are the ones worth checking against your minimum target — `using` in particular needs TypeScript 5.2+ or a transpiler because it is *syntax*, not just a new method.

---

### 9.7 Grouping and the New Set Methods

`Object.groupBy` and `Map.groupBy` (ES2024) finally give JavaScript the `groupBy` that every utility library has shipped for a decade. Both take an iterable and a callback that returns the key for each item.

```js
const people = [
  { name: 'Alice', dept: 'eng' },
  { name: 'Bob',   dept: 'sales' },
  { name: 'Cara',  dept: 'eng' },
];

Object.groupBy(people, p => p.dept);
// { eng: [{Alice}, {Cara}], sales: [{Bob}] }
```

The difference between the two matters in interviews. `Object.groupBy` coerces every key to a **string** and returns a `null`-prototype object; `Map.groupBy` keeps the key at its original type, so you can group by an object reference or a number without collisions:

```js
// Object.groupBy stringifies keys — 1 and '1' collide
Object.groupBy([1, '1'], x => x);        // { '1': [1, '1'] }

// Map.groupBy preserves key identity — no collision
Map.groupBy([1, '1'], x => x);           // Map { 1 => [1], '1' => ['1'] }
```

Reach for `Map.groupBy` whenever the grouping key is not already a string. The returned object from `Object.groupBy` has a `null` prototype, which is deliberate — it means a group named `"toString"` or `"__proto__"` cannot shadow or corrupt anything, but it also means the result has no `.hasOwnProperty`, so use `Object.hasOwn(result, key)` or the `in` operator instead.

**Set methods (ES2025)** replace the old spread-and-filter dance. Seven methods land together: three that return a new `Set`, and four that return a boolean.

```js
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5]);

a.union(b);                 // Set { 1, 2, 3, 4, 5 }
a.intersection(b);          // Set { 3, 4 }
a.difference(b);            // Set { 1, 2 }        — in a, not in b
a.symmetricDifference(b);   // Set { 1, 2, 5 }     — in exactly one

a.isSubsetOf(b);            // false
a.isSupersetOf(new Set([1, 2]));  // true
a.isDisjointFrom(new Set([9]));   // true
```

Two details interviewers probe. First, these methods are **non-mutating** — `a.union(b)` returns a new `Set` and leaves `a` alone, matching the ES2023 immutable-array philosophy. Second, the argument does not have to be a `Set`; it only needs to be *set-like*, meaning it has a numeric `size`, a `has` method, and a `keys` method. A `Map` satisfies that contract, so `mySet.intersection(myMap)` works and compares against the Map's **keys**.

---

### 9.8 Iterator Helpers — Lazy Array Methods for Anything Iterable

Before ES2025, `.map` and `.filter` lived only on arrays. If you had a generator, a `Map`, a `Set`, or a `NodeList`, you had to materialise it into an array first — allocating the whole thing in memory — before you could transform it. Iterator helpers put those methods on `Iterator.prototype`, so they work on **any** iterator, and they evaluate **lazily**.

```js
function* naturals() {
  let n = 1;
  while (true) yield n++;      // infinite — an array could never hold this
}

const firstFiveSquares = naturals()
  .map(n => n * n)
  .take(5)
  .toArray();

console.log(firstFiveSquares);   // [1, 4, 9, 16, 25]
```

The full set: `map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray`, `forEach`, `some`, `every`, `find`. Note that `reduce`, `forEach`, `some`, `every`, `find` and `toArray` are **terminal** — they consume the iterator and produce a value. The rest are lazy and return a new iterator.

Why this matters beyond neat infinite-sequence demos: the array version builds an intermediate array at every step. Chaining `.filter().map().slice(0, 10)` over 100,000 records allocates two 100,000-element arrays to hand you ten items. The iterator version pulls exactly the elements it needs and stops.

```js
// Array chain — allocates two full intermediate arrays
const arrResult = bigArray.filter(isActive).map(toDto).slice(0, 10);

// Iterator chain — pulls ~10 items through the pipeline and stops
const iterResult = bigArray.values().filter(isActive).map(toDto).take(10).toArray();
```

The classic gotcha: **iterators are single-use.** Once consumed, they are exhausted. An array can be iterated forever; an iterator cannot.

```js
const it = [1, 2, 3].values();
it.toArray();      // [1, 2, 3]
it.toArray();      // []  — already drained, not an error
```

This is also the reason a helper chain has no `length` and no `.sort()` — sorting is inherently eager, since you cannot know the first element of a sorted sequence without seeing all of them.

---

### 9.9 Explicit Resource Management — `using` and `await using`

`try`/`finally` works, but it separates acquisition from cleanup by however many lines the body happens to be, and it nests horribly once you hold three resources. ES2026's explicit resource management adds two new declaration forms that attach cleanup to the *variable's scope* instead.

A resource is any object with a `[Symbol.dispose]()` method (sync) or `[Symbol.asyncDispose]()` (async). When the block containing the `using` declaration exits — by return, by throw, by `break`, by anything — the dispose method runs automatically.

```js
class FileHandle {
  constructor(path) {
    this.path = path;
    console.log(`open ${path}`);
  }
  [Symbol.dispose]() {
    console.log(`close ${this.path}`);
  }
}

function readConfig() {
  using file = new FileHandle('config.json');
  console.log('reading');
  return 'contents';
  // no finally block — dispose runs here, on the way out
}

readConfig();
// open config.json
// reading
// close config.json
```

`await using` is the asynchronous counterpart, and it *awaits* the disposal — which is the whole point for things like database transactions and streams whose teardown is itself async:

```js
async function withTransaction(db) {
  await using tx = await db.begin();     // tx has [Symbol.asyncDispose]
  await tx.query('UPDATE …');
  await tx.commit();
  // await tx[Symbol.asyncDispose]() runs and is awaited here
}
```

Three rules that show up as interview traps:

1. **Disposal order is reverse of declaration** — it is a stack, exactly like nested `finally` blocks. Declare `using a`, then `using b`, and `b` disposes first.
2. **`using` bindings are implicitly `const`.** You cannot reassign them, because the engine has to be sure the thing it disposes is the thing it acquired.
3. **`null` and `undefined` are allowed** and are simply skipped, so `using maybe = condition ? openThing() : null;` is legal and does the right thing. Any *other* value without a `[Symbol.dispose]` method is a `TypeError` at declaration time.

`DisposableStack` and `AsyncDisposableStack` ship alongside for the case where the number of resources is dynamic — you `.use()` things into the stack and disposing the stack disposes everything in reverse:

```js
using stack = new DisposableStack();
for (const path of paths) stack.use(new FileHandle(path));
// all handles close in reverse order when the block exits
```

---

### 9.10 The Temporal API — The Replacement for `Date`

`Date` has been the language's most-complained-about built-in since 1995: it is mutable, it parses inconsistently, its months are zero-indexed but its days are not, it silently conflates "an instant in time" with "a date on a calendar", and it has no real time-zone support. `Temporal` reached Stage 4 in March 2026 and fixes all of it by splitting the single overloaded `Date` into several **immutable** types, each of which means exactly one thing.

| Type | What it represents | Example |
|---|---|---|
| `Temporal.Instant` | An exact point on the global timeline, no calendar | `2026-09-07T14:30:00Z` |
| `Temporal.ZonedDateTime` | An instant *plus* a time zone and calendar | `2026-09-07T10:30-04:00[America/New_York]` |
| `Temporal.PlainDate` | A calendar date with no time and no zone | `2026-09-07` (a birthday) |
| `Temporal.PlainTime` | A wall-clock time with no date | `09:00` (when the shop opens) |
| `Temporal.PlainDateTime` | Date + time, still no zone | `2026-09-07T09:00` |
| `Temporal.Duration` | A length of time | `P1M2DT3H` (1 month, 2 days, 3 hours) |
| `Temporal.PlainYearMonth` / `PlainMonthDay` | Partial dates | `2026-09`, `09-07` (recurring) |

```js
// Current instant, and the same instant in two zones
const now = Temporal.Now.instant();
const nyc = now.toZonedDateTimeISO('America/New_York');
const tokyo = now.toZonedDateTimeISO('Asia/Tokyo');

// Arithmetic returns a NEW object — nothing mutates
const date = Temporal.PlainDate.from('2026-09-07');
const later = date.add({ months: 1, days: 3 });
console.log(date.toString());    // '2026-09-07'  — unchanged
console.log(later.toString());   // '2026-10-10'

// Months are 1-based, as any human would expect
console.log(date.month);         // 9  (Date would have said 8)

// Differences are typed Durations, not milliseconds
const diff = date.until('2026-12-25', { largestUnit: 'day' });
console.log(diff.days);          // 109
```

The conceptual point interviewers are testing is **picking the right type**, because that choice encodes a real business decision. A hotel check-in date is a `PlainDate` — the guest arrives on the 7th regardless of where they booked from. A meeting is a `ZonedDateTime` — it happens at one instant that renders differently per attendee. A recurring 9 a.m. daily standup is a `PlainTime` plus a zone, *not* a fixed instant, because the instant shifts when daylight saving changes. Storing a standup as a UTC instant is precisely the bug that makes it drift by an hour twice a year.

Interop with the old world goes through strings and epoch values, so migration is incremental:

```js
const instant = legacyDate.toTemporalInstant();      // Date  → Temporal
const backToDate = new Date(instant.epochMilliseconds); // Temporal → Date
```

---

### 9.11 Smaller Modern Additions Worth Knowing

**`Promise.withResolvers` (ES2024)** removes the "deferred" boilerplate that every codebase reinvented — hoisting `resolve` and `reject` out of the executor so something *outside* the promise can settle it.

```js
// Before — the awkward let-and-assign dance
let resolve, reject;
const p = new Promise((res, rej) => { resolve = res; reject = rej; });
```

```js
// After
const { promise, resolve, reject } = Promise.withResolvers();
```

This is the natural shape for wrapping event-based APIs: create the promise, hand `resolve` to the `onmessage` handler, return `promise`.

**`Array.fromAsync` (ES2026)** is `Array.from` for async iterables — it drains an async generator or a paginated API into an array and returns a promise. It is the one-line version of a `for await…of` accumulation loop.

```js
async function* pages() {
  let url = '/api/items';
  while (url) {
    const res = await fetch(url).then(r => r.json());
    yield* res.items;
    url = res.next;
  }
}

const allItems = await Array.fromAsync(pages());
```

Note the difference from `Promise.all(arr.map(f))`: `Array.fromAsync` iterates **sequentially**, awaiting each value before pulling the next. That is what you want for paginated fetches (page 2's URL comes from page 1) and *not* what you want for independent parallel requests.

**`Promise.try` (ES2025)** starts a promise chain from a function that might throw synchronously, so a sync throw and an async rejection land in the same `.catch`:

```js
Promise.try(() => mightThrowSyncOrReturnPromise(input))
  .then(handle)
  .catch(handleBoth);        // catches both failure modes
```

**`Error.isError` (ES2026)** is a reliable cross-realm error check. `instanceof Error` fails for an error thrown inside an iframe or a worker (different realm, different `Error` constructor), and duck-typing on `.stack` gives false positives on plain objects:

```js
Error.isError(new TypeError('x'));       // true
Error.isError({ name: 'Error', message: 'fake' });  // false
```

**`RegExp.escape` (ES2025)** safely escapes a string for interpolation into a regex — the fix for the "user input broke my dynamic pattern" bug covered in the Regex guide:

```js
const term = 'price (USD)';
new RegExp(RegExp.escape(term), 'gi');   // matches the literal text
```

**`Object.hasOwn` (ES2022)** replaces `Object.prototype.hasOwnProperty.call(obj, key)`. Use it whenever the object might have a `null` prototype (like a `Object.groupBy` result) or an own property literally named `hasOwnProperty`.

**Class static blocks and private brand checks (ES2022)** — a `static { }` block runs once at class definition time with `this` bound to the class, which is where per-class initialisation that needs statements (not just an expression) belongs. And `#field in obj` is the only correct way to ask "is this object actually an instance of my class?", because it checks for the private field's presence without throwing:

```js
class Counter {
  #count = 0;
  static #registry = new Map();
  static { Counter.#registry.set('default', new Counter()); }

  static isCounter(obj) {
    return #count in obj;      // true brand check, never throws
  }
}
```

**Import attributes (ES2025)** declare how a module should be interpreted, which the host uses as a security guarantee rather than a hint — a server cannot smuggle JavaScript in by changing the `Content-Type`:

```js
import config from './config.json' with { type: 'json' };
const data = await import('./data.json', { with: { type: 'json' } });
```

---

## 10. Error Handling

JavaScript uses `try`/`catch`/`finally` for synchronous error handling and `.catch()` or `try`/`catch` inside `async` functions for asynchronous errors. You can create custom error classes by extending the built-in `Error` to add domain-specific context like field names or HTTP status codes.

```js
// try/catch/finally
try {
  const data = JSON.parse(invalidJson);
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error('Invalid JSON:', error.message);
  } else {
    throw error;                           // re-throw unknown errors
  }
} finally {
  cleanup();                               // always runs
}

// Custom error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

throw new ValidationError('Required', 'email');

// Async error handling
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}

// Unhandled rejections (global handler)
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled:', event.reason);
});
```

---

### 10.1 Global Error Handling — "Error Boundaries" Outside React

An uncaught error anywhere in your app should be *observed*, even where no `try`/`catch` reaches. The browser gives you four hooks, and knowing which catches what is the interview question.

```js
// 1. Uncaught synchronous errors and errors thrown in callbacks
window.addEventListener('error', (event) => {
  report({ message: event.message, source: event.filename,
           line: event.lineno, col: event.colno, error: event.error });
});

// 2. Promise rejections with no .catch() — a DIFFERENT event
window.addEventListener('unhandledrejection', (event) => {
  report({ reason: event.reason });
  event.preventDefault();               // suppress the console warning if you've handled it
});

// 3. Failed resource loads (img, script, link) — these do NOT bubble,
//    so you need the capture phase and they don't reach window 'error' otherwise
window.addEventListener('error', (event) => {
  if (event.target !== window) report({ failedResource: event.target.src });
}, true);                               // ← capture

// 4. A rejection that later gets handled (useful for tuning noise)
window.addEventListener('rejectionhandled', (event) => { /* … */ });
```

The distinctions that matter:

- **`error` and `unhandledrejection` are separate events.** Wiring only the first means every unhandled promise rejection goes unreported — and in an `async`-heavy codebase that's most of your errors.
- **Resource load failures don't bubble**, so a broken `<img>` or a failed `<script>` is invisible unless you listen in the **capture** phase and check `event.target`.
- **Cross-origin scripts are opaque.** Without `crossorigin="anonymous"` on the `<script>` tag *and* CORS headers on the response, you get the useless `"Script error."` with no message, file or line. This is the reason most teams' error reporting is empty for CDN-served bundles.
- **`try`/`catch` does not catch async errors** thrown after the synchronous frame exits. A rejection inside a `setTimeout` callback, or in a promise you forgot to `await`, reaches `unhandledrejection` instead.

In **Node**, the equivalents are `process.on('uncaughtException')` and `process.on('unhandledRejection')` — and the correct behaviour there is different: log, flush, and **exit**. The process is in an undefined state after an uncaught exception, so continuing to serve traffic risks corrupt data. Let your supervisor restart it (see the Node.js guide's graceful-shutdown section).

**The relationship to React error boundaries** is worth stating precisely, because they're often conflated. A React error boundary catches errors thrown **during render, in lifecycle methods, and in constructors** of the tree below it, and lets you render fallback UI. It does **not** catch errors in event handlers, in `setTimeout`, in async code, or during server-side rendering. So they're complementary layers: the error boundary preserves the *UI*, and the global handlers catch everything the boundary structurally cannot. You need both.

---

### 10.2 Testing Async Code Without a Framework

Node's built-in test runner (`node:test`, stable since Node 20) plus `node:assert` covers most of this with zero dependencies:

```js
import { test, describe, mock } from 'node:test';
import assert from 'node:assert/strict';

test('resolves with the parsed body', async () => {
  const result = await getUser('1');              // just await it
  assert.deepEqual(result, { id: '1', name: 'Ada' });
});

test('rejects on a 404', async () => {
  await assert.rejects(() => getUser('nope'), { message: /not found/ });
});

test('retries three times then throws', async () => {
  const fn = mock.fn(() => Promise.reject(new Error('boom')));
  await assert.rejects(() => retry(fn, { retries: 2, base: 0 }));
  assert.equal(fn.mock.callCount(), 3);           // initial + 2 retries
});
```

The techniques that make async tests reliable, framework or not:

- **`assert.rejects` / `assert.doesNotReject`** for expected failures. The alternative — a `try`/`catch` with a `assert.fail()` after the call — is the pattern that silently passes when the function *doesn't* throw, which is the classic false-green async test.
- **Always `await` or `return` the assertion.** A forgotten `await` means the test function returns before the assertion runs, and the test passes regardless. This is the single most common async-test bug.
- **Control the clock rather than sleeping.** `mock.timers.enable()` in `node:test` (or `vi.useFakeTimers()` in Vitest) lets you advance time instantly, so a test for a 30-second back-off runs in a millisecond. Real `setTimeout` in tests is the main source of both slowness and flake.
- **`mock.fn()`** gives you call counts and arguments without a mocking library.
- **Test the observable behaviour, not the timing.** Asserting "it retried three times" is stable; asserting "it waited 600ms" is flaky on a loaded CI machine.

When you *do* want a framework, the reasons are jsdom for DOM tests, snapshot testing, module mocking, and parallel test orchestration — see the Testing Strategy & E2E guide for how to choose, and the Node.js guide §13.4 for when `node:test` is enough.

---

## 11. The Event Loop

```
+-------------------------------------+
|           Call Stack                 |
|  (executes synchronous code)        |
+-------------------------------------+
                |
                | When stack is empty,
                | check queues:
                v
+-------------------------------------+
|      Microtask Queue (priority)     |
|  Promise.then, queueMicrotask,      |
|  MutationObserver                   |
+-------------------------------------+
                |
                | When microtask queue is empty:
                v
+-------------------------------------+
|      Macrotask Queue                |
|  setTimeout, setInterval,           |
|  I/O callbacks, UI rendering        |
+-------------------------------------+
```

### Execution Order

```js
console.log('1');                            // 1. sync -> call stack

setTimeout(() => console.log('2'), 0);       // 4. macrotask queue

Promise.resolve()
  .then(() => console.log('3'))              // 3. microtask queue
  .then(() => console.log('4'));             // 3b. microtask (chained)

console.log('5');                            // 2. sync -> call stack

// Output: 1, 5, 3, 4, 2
```

### Why This Matters

- Promises always execute before setTimeout, even with 0ms delay
- Long synchronous code blocks the event loop (freezes UI)
- `requestAnimationFrame` runs before paint (use for animations)
- Node.js adds: `process.nextTick` (before microtasks), `setImmediate` (after I/O)

---

## 12. Modules

### 12.1 ES Modules (ESM) — Modern Standard

ES Modules are the official standard module system for JavaScript, supported in all modern browsers and Node.js. They are statically analyzed at parse time, enabling tree-shaking (dead code elimination) and top-level `await`.

```js
// Named exports
export const PI = 3.14;
export function add(a, b) { return a + b; }
export class Calculator { /* ... */ }
```

```js
// Default export (one per module)
export default function main() { /* ... */ }
```

```js
// Named imports
import { PI, add } from './math.js';
```

```js
// Default import
import main from './main.js';
```

```js
// Rename on import
import { add as sum } from './math.js';
```

```js
// Import all as namespace
import * as math from './math.js';
math.add(1, 2);
```

```js
// Dynamic import (code splitting)
const module = await import('./heavy-module.js');
```

### 12.2 CommonJS (CJS) — Node.js Legacy

CommonJS is the module system that Node.js originally used. Modules are loaded synchronously at runtime with `require()`, and exports are assigned to `module.exports`. While still widely used in existing Node.js codebases, new projects generally prefer ES Modules.

```js
// Export
module.exports = { add, subtract };
// or
exports.add = function(a, b) { return a + b; };

// Import
const { add } = require('./math');
```

### 12.3 Key Differences

| Aspect | ESM | CJS |
|---|---|---|
| Syntax | `import/export` | `require/module.exports` |
| Loading | Static (analyzed at parse time) | Dynamic (evaluated at runtime) |
| Top-level await | Yes | No |
| Tree-shaking | Yes (dead code elimination) | No |
| Default in | Browsers, modern Node.js | Node.js (legacy) |

---

## 13. DOM Manipulation

The Document Object Model (DOM) is the browser's tree representation of an HTML page, and JavaScript can read and modify it to create dynamic user interfaces. Understanding how to select, create, modify, and remove elements -- as well as how event delegation works -- is essential for front-end interviews.

```js
// Selecting elements
const el = document.getElementById('app');
const el2 = document.querySelector('.class');
const els = document.querySelectorAll('li');       // NodeList

// Creating elements
const div = document.createElement('div');
div.textContent = 'Hello';
div.className = 'card';
div.setAttribute('data-id', '123');
document.body.appendChild(div);

// Modifying elements
el.innerHTML = '<strong>Bold</strong>';            // XSS risk with user input
el.textContent = 'Safe text';                      // safe
el.classList.add('active');
el.classList.remove('hidden');
el.classList.toggle('open');
el.style.color = 'red';

// Event listeners — see 13.1-13.3 for the propagation model
el.addEventListener('click', (event) => {
  console.log(event.target);                       // element that was clicked
  console.log(event.currentTarget);                // element handler is attached to
});

// Removing elements
el.remove();
parent.removeChild(child);
```

### 13.1 The Event Path — Capturing, Target, Bubbling

Every event travels the same route: the browser computes the **propagation path** — the ancestor chain from `window` to the target — and walks it down, then back up.

```text
      CAPTURING  ↓                                  ↑  BUBBLING
      window                                           window
        document                                     document
          <body>                                     <body>
            <div id="outer">                   <div id="outer">
              <div id="inner">               <div id="inner">
                        <button>  ← TARGET →
```

```jsx
function PhaseDemo() {
  const log = (msg) => console.log(msg);

  useEffect(() => {
    const outer = document.getElementById('outer');
    const inner = document.getElementById('inner');
    const btn = document.getElementById('btn');
    const phase = ['', 'CAPTURE', 'TARGET', 'BUBBLE'];

    // `true` (or { capture: true }) registers for the DOWNWARD trip.
    outer.addEventListener('click', (e) => log('outer ' + phase[e.eventPhase]), true);
    inner.addEventListener('click', (e) => log('inner ' + phase[e.eventPhase]), true);
    btn.addEventListener('click', (e) => log('button ' + phase[e.eventPhase]));
    // No third argument = the UPWARD trip.
    inner.addEventListener('click', (e) => log('inner ' + phase[e.eventPhase]));
    outer.addEventListener('click', (e) => log('outer ' + phase[e.eventPhase]));

    document.getElementById('btn').click();     // fire it once on mount
  }, []);

  return (
    <div id="outer" style={{ padding: 16, border: '1px solid #888' }}>
      outer
      <div id="inner" style={{ padding: 16, border: '1px solid #888' }}>
        inner
        <button id="btn">click me</button>
      </div>
    </div>
  );
}

render(<PhaseDemo />);
```

```text
outer CAPTURE     ← down
inner CAPTURE
button TARGET     ← arrived
inner BUBBLE      ← back up
outer BUBBLE
```

**Registering for capture:** `addEventListener(type, fn, true)` is the old positional form; `{ capture: true }` is the modern one and is preferable because that options object also carries `once`, `passive` and `signal`. The capture flag is **part of the listener's identity** — `removeEventListener` must be given the same flag or it removes nothing.

**At the target, both kinds fire.** A capture listener on the target itself is not skipped; the phase is simply reported as `AT_TARGET`. Do not depend on the relative order of capture- and bubble-registered listeners on the target.

**The path is fixed before dispatch begins.** Remove the target from the document inside its own handler and the event still travels through its former ancestors:

```jsx
function PathIsFixed() {
  useEffect(() => {
    const parent = document.getElementById('p');
    const child = document.getElementById('c');

    child.addEventListener('click', () => {
      console.log('target fired');
      parent.remove();                       // detach the whole subtree, mid-dispatch
      console.log('parent removed from the document');
    });
    parent.addEventListener('click', () => console.log('parent STILL fires'));
    document.addEventListener('click', () => console.log('document STILL fires'), { once: true });

    child.click();
  }, []);

  return <div id="p"><button id="c">click</button></div>;
}

render(<PathIsFixed />);
```

`event.composedPath()` returns that list — for a button in a div, `button → div → body → html → #document → Window`.

#### `target` vs `currentTarget`

```jsx
function TargetVsCurrentTarget() {
  const onClick = (e) => {
    console.log('target       =', e.target.tagName);        // the deepest element clicked
    console.log('currentTarget=', e.currentTarget.tagName); // where the listener lives
  };

  useEffect(() => { document.getElementById('word').click(); }, []);

  return (
    <ul onClick={onClick}>
      <li><span id="word">click the span</span></li>
    </ul>
  );
}

render(<TargetVsCurrentTarget />);
```

```text
target       = SPAN
currentTarget= UL
```

`currentTarget` is only valid **during** dispatch; read it in an async callback and it is `null`. `e.target.closest('li')` is the reliable way to find the row that was clicked, because the user may have hit a nested icon.

---

### 13.2 Stopping Things — Three Different Verbs

| Method | What it stops | What it does not stop |
|---|---|---|
| `stopPropagation()` | the journey to **other elements** | other listeners on the *same* element |
| `stopImmediatePropagation()` | the journey **and** remaining listeners on this element | the default action |
| `preventDefault()` | the **browser's default action** (navigation, submit, scroll) | propagation — the event keeps travelling |

They are orthogonal, which is the exam question. `preventDefault()` on a link stops navigation but the click still bubbles to `document`; `stopPropagation()` stops the bubbling but the browser still navigates.

#### Where `preventDefault()` is used

Every use is "the browser has a built-in behaviour here and I want my own instead":

| Scenario | The default being cancelled |
|---|---|
| Submitting a form with `fetch` instead of a page post | full page navigation and reload |
| A client-side router intercepting `<a>` clicks | navigating away and destroying your app's state |
| `dragover` on a drop zone | rejecting the drop — **without this, `drop` never fires at all** |
| ⌘K opening your search palette | the browser's own find/bookmark shortcut |
| Space or arrows in a custom listbox or menu | scrolling the page |
| A custom right-click menu | the browser's context menu |
| Sanitising pasted content | inserting the raw HTML from the clipboard |
| Blocking invalid characters in a number field | typing the character |

```jsx
function SearchForm() {
  const [q, setQ] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();          // ← without this the page reloads and the SPA dies
    console.log('searching for', q);
  };

  return (
    <form onSubmit={onSubmit}>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <button>Search</button>
    </form>
  );
}

render(<SearchForm />);
```

That form is the example to have ready: a `<form>` posts and reloads by default, which in a single-page app throws away every piece of state you hold. It is also why a drop zone calls `preventDefault` on `dragover` — the *default* there is "reject this drop", so cancelling it is what makes dropping possible at all.

#### Where `stopPropagation()` is used

Every use is "this element sits inside something else that is also clickable":

| Scenario | The ancestor you are stopping |
|---|---|
| Clicking inside a modal panel | the backdrop's "click anywhere to close" |
| Clicking inside an open dropdown | the `document` listener that closes it on outside clicks |
| A Delete button inside a clickable card or table row | the row's "open this item" handler |
| A checkbox or toggle inside an accordion header | the header's expand/collapse |
| A nested menu item inside a parent menu item | the parent's select handler |

```jsx
function Modal({ onClose }) {
  return (
    <div
      onClick={onClose}                       // backdrop: any click closes
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}  // ← the panel must NOT close it
        style={{ background: '#fff', margin: '10vh auto', padding: 24, maxWidth: 360 }}
      >
        <h3>Confirm</h3>
        <p>Clicking this text does not close the dialog. Clicking outside does.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function App() {
  const [open, setOpen] = useState(true);
  return open ? <Modal onClose={() => setOpen(false)} /> : <button onClick={() => setOpen(true)}>Open</button>;
}

render(<App />);
```

**Both at once** is common enough to recognise — a link inside a clickable card, where `preventDefault` alone still opens the card and `stopPropagation` alone still navigates away:

```jsx
function Card({ onOpen }) {
  const onShare = (e) => {
    e.preventDefault();      // do not follow the href
    e.stopPropagation();     // and do not open the card either
    console.log('sharing instead');
  };

  return (
    <div onClick={onOpen} style={{ border: '1px solid #888', padding: 16, cursor: 'pointer' }}>
      <h4>A clickable card</h4>
      <a href="/share" onClick={onShare}>Share</a>
    </div>
  );
}

render(<Card onOpen={() => console.log('card opened')} />);
```

#### Prefer letting the ancestor decide

`stopPropagation` fixes your problem by breaking everyone else's: the `document` listener it silences might be analytics, a focus manager, or a click-outside handler you did not write, and nothing points at your code. Where you can, decide in the ancestor instead:

```jsx
function Row({ onOpen, onDelete }) {
  const onClick = (e) => {
    // The parent asks "was this the delete button?" rather than the button
    // shouting "nobody else may hear this".
    if (e.target.closest('[data-action="delete"]')) return onDelete();
    onOpen();
  };

  return (
    <div onClick={onClick} style={{ border: '1px solid #888', padding: 12 }}>
      <span>Invoice #1041</span>
      <button data-action="delete">Delete</button>
    </div>
  );
}

render(<Row onOpen={() => console.log('open row')} onDelete={() => console.log('delete row')} />);
```

For "click outside to close", the robust version is the same idea — check `!panelRef.current.contains(e.target)` in the `document` handler rather than calling `stopPropagation` inside the panel. That keeps working when a third component starts listening too.

**One React-specific trap.** React attaches its listeners at the root container, so `e.stopPropagation()` on a React `onClick` stops *React's* synthetic propagation — it does not stop a native listener you added with `addEventListener` on `document`. Mixing the two and expecting one to stop the other is a reliable source of "the dropdown closes immediately after opening".

---

### 13.3 Delegation, and What Does Not Bubble

Bubbling is what makes delegation possible: one listener on a parent handles any number of children, including ones that do not exist yet.

```jsx
function Delegated() {
  const onClick = (e) => {
    const row = e.target.closest('[data-id]');     // works for nested spans too
    if (row) console.log('clicked row', row.dataset.id);
  };
  return (
    <ul onClick={onClick}>
      <li data-id="1"><span>first</span></li>
      <li data-id="2"><span>second</span></li>
    </ul>
  );
}

render(<Delegated />);
```

One listener instead of N means less memory, no rebinding when the list changes, and it survives rows added later.

**But not everything bubbles:**

| Event | Bubbles | Use instead |
|---|---|---|
| `focus` / `blur` | **no** | `focusin` / `focusout`, which do |
| `mouseenter` / `mouseleave` | **no** | `mouseover` / `mouseout`, which do |
| `scroll` on an element | **no** | listen on the element itself (`scroll` on `document` does fire) |
| `load`, `error` on `<img>` | **no** | attach directly, or use capture |

Those are not arbitrary. `mouseenter` means "entered this element", whereas `mouseover` fires again every time the pointer crosses into a child — so delegation works with `mouseover` and not with `mouseenter`, which is the usual reason someone's hover delegation misbehaves.

**One last option worth knowing:** `{ passive: true }` promises you will not call `preventDefault()`, which lets the browser scroll without waiting for your handler. It is already the default for `touchstart` and `wheel` on the document in modern browsers, and it is the fix when a scroll listener makes scrolling feel sticky.

---

## 14. Design Patterns

### 14.1 Module Pattern

The module pattern uses an immediately-invoked function expression (IIFE) and closures to create private state. Variables inside the IIFE are inaccessible from outside, while the returned object exposes only the intended public API.

```js
const counter = (() => {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count,
  };
})();
```

### 14.2 Observer Pattern

The observer pattern enables event-driven communication: objects subscribe to events and get notified when those events are emitted. This is the foundation of Node.js `EventEmitter`, browser DOM events, and many state management libraries.

```js
class EventEmitter {
  constructor() { this.events = {}; }
  on(event, fn) {
    (this.events[event] ||= []).push(fn);
  }
  emit(event, ...args) {
    (this.events[event] || []).forEach(fn => fn(...args));
  }
  off(event, fn) {
    this.events[event] = (this.events[event] || []).filter(f => f !== fn);
  }
}
```

### 14.3 Singleton

The singleton pattern restricts a class to a single instance and provides a global access point to it. This is commonly used for shared resources like database connections, configuration objects, or caches.

```js
class Database {
  static instance;
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
```

### 14.4 Debounce and Throttle

Debounce and throttle are rate-limiting techniques for controlling how often a function executes. Debounce waits until a pause in activity (e.g., user stops typing), while throttle ensures execution at most once per interval (e.g., scroll handler). Implementing these from scratch is a very common interview coding question.

```js
// Debounce: execute after N ms of inactivity
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Throttle: execute at most once per N ms
function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

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

Always use `===` to avoid unexpected coercion bugs.

---

**Q2: What are closures?**

A closure is a function that retains access to variables from its outer (enclosing) scope, even after the outer function has finished executing. The inner function "closes over" the variables.

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

An event fires on the element you interacted with **and on every one of its ancestors**. Clicking a `<button>` inside a `<div>` is physically a click on both, and the DOM reflects that: at dispatch the browser builds the chain of ancestors from `window` down to the target, then walks that chain **twice**.

1. **Capturing** — down from `window` to the target's parent, invoking only listeners registered with `{ capture: true }`.
2. **Target** — the element itself.
3. **Bubbling** — back up to `window`, invoking normally-registered listeners. Named for the way a bubble rises.

**Bubbling is the default**, so `addEventListener(type, fn)` listens on the way up; pass `{ capture: true }` to listen on the way down. Both directions exist for a historical reason worth knowing: **Netscape implemented capturing, Internet Explorer implemented bubbling**, and the W3C standardised both rather than pick a winner.

**Why it matters in practice** is event delegation: because clicks bubble, one listener on a `<ul>` can handle every `<li>`, including rows added later. React's own event system works exactly this way — a single listener at the root container.

**Reach for capturing** when an ancestor must see the event *before* the target can stop it — an overlay, an analytics layer, a focus manager. Register on the way up and a child calling `stopPropagation()` means you never hear about it.

See **§13.1–13.3** for the phase-by-phase walkthrough, the three stopping methods and where each is actually used, and the events that do not bubble.

**Q5: What is the difference between `var`, `let`, and `const`?**

| Feature | `var` | `let` | `const` |
|---------|-------|-------|---------|
| Scope | Function | Block | Block |
| Hoisting | Yes (value: undefined) | Yes (TDZ) | Yes (TDZ) |
| Redeclaration | Allowed | Not allowed | Not allowed |
| Reassignment | Allowed | Allowed | Not allowed |

Use `const` by default, `let` when reassignment is needed, avoid `var`.

---

### Intermediate

---

**Q6: What is the event loop? How does JavaScript handle async operations?**

**Start with what "single-threaded" actually means**, because the phrase causes the confusion. JavaScript has **one call stack**, so exactly one line of *your* code runs at a time. It does **not** mean one thing happens at a time: a `fetch` is performed by the browser's networking code, a timer by the platform's timer, a file read by Node's thread pool. Those run elsewhere, genuinely in parallel. What is single-threaded is the part that runs your callbacks.

The event loop is the piece that decides **which callback runs next, and when**.

```text
   ┌─────────────────────────────┐
   │        CALL STACK           │  ← your code; only ever one frame deep at the top
   └──────────────┬──────────────┘
                  │ when it is EMPTY:
                  ▼
   ┌─────────────────────────────┐
   │   MICROTASK QUEUE           │  promises, await, queueMicrotask, MutationObserver
   │   drained COMPLETELY        │  ← including any added while draining
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │   render (browser only)     │  style, layout, paint — roughly once per frame
   └──────────────┬──────────────┘
                  ▼
   ┌─────────────────────────────┐
   │   MACROTASK QUEUE           │  setTimeout, setInterval, I/O, UI events
   │   exactly ONE per turn      │
   └─────────────────────────────┘
```

**The rule that answers most interview questions:** after each macrotask, the engine drains the **entire** microtask queue before taking the next one — including microtasks queued *by* those microtasks. Macrotasks get one per turn; microtasks get all of them.

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

- **An `async` function body runs synchronously** until its first `await`. Calling one does not defer anything; only the code *after* an `await` becomes a microtask. This is why line 2 prints before line 3.
- **`await x` is `Promise.resolve(x).then(...)` in disguise**, so everything after it is a microtask — which is why `4.7` lands with the promise callbacks and not with the timer.
- **A microtask queued during the drain still runs before the macrotask.** Line 5 was created while line 4 was executing, and it still beats `setTimeout(…, 0)`.

**Which queue is which:**

| Microtasks (all drained each turn) | Macrotasks (one per turn) |
|---|---|
| `.then` / `.catch` / `.finally` | `setTimeout`, `setInterval` |
| code after `await` | `setImmediate` (Node) |
| `queueMicrotask` | I/O callbacks, UI events |
| `MutationObserver` | `requestAnimationFrame`* |

\* `requestAnimationFrame` is not strictly a macrotask — it runs in the render step, *before* the next task, which is why it is the right place for visual updates and `setTimeout` is not.

**`setTimeout(fn, 0)` does not mean "now".** It means "queue this as a macrotask", so it waits for the stack to empty *and* the whole microtask queue to drain. Browsers also clamp nested timers to ~4 ms after five levels of nesting, and a background tab clamps to ~1 s or stops entirely.

**Microtask starvation is the failure mode worth naming.** Because microtasks are drained *completely*, a microtask that queues another microtask forever blocks rendering and every timer — the page freezes with no long function to blame:

```js
function starve() { Promise.resolve().then(starve); }   // never yields. Do not run this.
```

An infinite loop of macrotasks does not do this: the browser gets its render step between each one.

**Node differs in two ways worth knowing.** `process.nextTick` has its own queue that drains *before* promise microtasks, and Node's loop has ordered phases (timers, pending, poll, check, close), which is why `setTimeout(…, 0)` and `setImmediate` have no guaranteed order at the top level but a fixed one inside an I/O callback — see the Node.js guide.

**Why any of this matters in practice:** the loop can only take the next task when the stack is empty, so one long synchronous function blocks input, animation and rendering alike. That is what Total Blocking Time measures, and why the fix is to break work up — `scheduler.yield()`, chunking, or moving it to a Worker, which is the only way to get a second thread.

**Q7: Explain prototypal inheritance.**

Every JavaScript object has an internal `[[Prototype]]` link to another object. When you access a property, JavaScript looks up the prototype chain:

1. Check the object itself
2. Check its prototype
3. Check the prototype's prototype
4. Continue until `null` (end of chain: `Object.prototype.__proto__` is `null`)

```js
const animal = { eat() { return 'eating'; } };
const dog = Object.create(animal);
dog.bark = function() { return 'woof'; };

dog.bark();  // found on dog itself
dog.eat();   // found on animal (dog's prototype)
dog.toString(); // found on Object.prototype
```

ES6 classes are syntactic sugar over this prototypal system.

---

**Q8: What is the difference between `call`, `apply`, and `bind`?**

All three do the same job — **decide `this` explicitly** — because `this` is otherwise chosen by the *call site*, and a detached method (`const fn = obj.greet`) has no call site to take it from. They differ in how arguments arrive and whether the function runs.

| Method | Arguments | Runs now? | Returns |
|---|---|---|---|
| `call(thisArg, a, b)` | listed individually | yes | the function's result |
| `apply(thisArg, [a, b])` | one array | yes | the function's result |
| `bind(thisArg, a)` | listed individually, **pre-filled** | **no** | a new, permanently bound function |

The mnemonic that sticks: **a**pply takes an **a**rray. That is the *only* difference between `call` and `apply`.

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

**The three `bind` facts interviews actually probe** are all visible above: it returns a function instead of calling one (forgetting the later `()` is the classic bug), the binding cannot be changed afterwards, and **each call produces a new reference** — which is why `this.handle.bind(this)` inside a React render defeats `React.memo`, and why `removeEventListener` silently fails when you bind again at removal time. Two more: `bind` **pre-fills arguments** (partial application, the basis of currying), and **`new` beats it** — constructing a bound function ignores the bound `this`, though the pre-filled arguments still apply.

**Arrow functions ignore all three.** An arrow has no `this` of its own, so there is nothing to set:

```js
function outer() {
  const arrow = () => this.name;
  return arrow.call({ name: 'Bob' });    // the .call does nothing
}
console.log(outer.call({ name: 'Alice' }));   // 'Alice'
```

**`thisArg` is coerced in sloppy mode.** A primitive gets boxed and `null`/`undefined` is replaced by the global object; under `'use strict'` — and therefore in every ES module — the value is passed through untouched:

```js
function whoAmI() { return this; }
console.log(typeof whoAmI.call('text'));         // 'object' — the string was boxed
console.log(whoAmI.call(null) === globalThis);   // true    — null was replaced
// Under 'use strict': 'string', and this === null
```

**Where you actually meet them.** `call` and `apply` mostly survive in *library* code: borrowing a method from another prototype (`Array.prototype.slice.call(arguments)`, from before rest parameters), and forwarding an unknown argument list inside a wrapper — `fn.apply(this, args)` is the line at the heart of every decorator, polyfill and memoiser. In application code, **spread replaced `apply`** (`Math.max(...nums)` instead of `Math.max.apply(null, nums)`) and **arrow functions replaced most of `bind`**. `bind` still earns its place when you need one *stable* reference to add and later remove as a listener, or for partial application. `Reflect.apply(fn, thisArg, args)` is the modern spelling that cannot be fooled by a function that has overwritten its own `apply`.

See **§4.3** for how `this` is resolved in the first place, which is what makes all of this necessary.

**Q9: What is the difference between shallow copy and deep copy?**

- **Shallow copy**: Copies top-level properties. Nested objects are still shared references.
- **Deep copy**: Recursively copies all levels. No shared references.

```js
const original = { a: 1, nested: { b: 2 } };

// Shallow copy methods
const shallow1 = { ...original };
const shallow2 = Object.assign({}, original);
shallow1.nested.b = 99;
console.log(original.nested.b);            // 99 (shared reference!)

// Deep copy methods
const deep1 = structuredClone(original);   // modern (best)
const deep2 = JSON.parse(JSON.stringify(original)); // loses functions, dates, etc.
deep1.nested.b = 99;
console.log(original.nested.b);            // 2 (independent copy)
```

---

**Q10: Explain `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any`.**

| Method | Resolves when | Rejects when |
|--------|-------------|-------------|
| `Promise.all` | ALL promises fulfill | ANY promise rejects |
| `Promise.allSettled` | ALL promises settle (fulfill or reject) | Never rejects |
| `Promise.race` | FIRST promise settles (fulfill or reject) | FIRST promise rejects |
| `Promise.any` | FIRST promise fulfills | ALL promises reject (AggregateError) |

```js
// all: parallel fetch, fail-fast
const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);

// allSettled: parallel fetch, get all results regardless
const results = await Promise.allSettled([fetchA(), fetchB()]);
// [{ status: 'fulfilled', value: ... }, { status: 'rejected', reason: ... }]

// race: timeout pattern
const data = await Promise.race([
  fetch('/api/data'),
  new Promise((_, reject) => setTimeout(() => reject('Timeout'), 5000)),
]);

// any: fastest successful response
const fastest = await Promise.any([fetchFromCDN1(), fetchFromCDN2()]);
```

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

`let` and `const` are hoisted (the engine knows they exist) but they're in the TDZ until the declaration line. `var` doesn't have TDZ — it's initialized to `undefined` during hoisting.

---

**Q12: Explain generators and when you'd use them.**

Generators are functions that can be paused and resumed. They use `function*` syntax and `yield` to produce values lazily.

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

Use cases:
- **Lazy evaluation**: Generate values on demand (infinite sequences)
- **Async flow control**: Redux-Saga uses generators to manage async side effects
- **Custom iterables**: Make any object work with `for...of`
- **State machines**: Pause between states

---

**Q13: What is `WeakRef` and `FinalizationRegistry`?**

Both are escape hatches from JavaScript's normal memory rule. Normally **any reference you hold keeps an object alive** — the garbage collector frees an object only when nothing reachable points at it. These two APIs let you hold a reference that does *not* count (`WeakRef`), and be told after an object has been freed (`FinalizationRegistry`).

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

That last line is the point most answers miss: dropping the strong reference makes the object **eligible** for collection, not collected. Nothing in the language says when — or whether — the collector runs, so `deref()` keeps returning the object until it happens to.

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

**The trap that makes the whole thing useless:** the `heldValue` must never be the target object itself. The registry holds `heldValue` **strongly**, so `registry.register(user, user)` keeps `user` alive forever and the callback can never fire. Pass an id, a key, or a handle — something small that tells the callback *what* went away.

**Why they are rarely the right answer.** `WeakMap` and `WeakSet` solve the common case — metadata attached to an object, without keeping it alive — with no `deref()` and no non-determinism, so reach for them first. MDN's own guidance is to avoid `WeakRef` and `FinalizationRegistry` where you can: collection timing differs between engines and versions, so code that *depends* on a callback firing is code that works on your laptop and not in production.

**Where they genuinely earn their place:**

- **A cache that must not be the reason an object stays in memory** — an image or parsed-document cache keyed by an object, where a miss simply means recompute.
- **Releasing a non-JS resource** the collector knows nothing about: a WebAssembly allocation, a file handle, a WebGL texture. The registry is the *backstop*; an explicit `close()`/`dispose()` (or `using` from §9.9) is still the primary path.
- **Leak detection in development** — register an object and log if the callback never arrives after a component unmounts.

The rule for both: **treat the callback and the `deref()` as best-effort**. Correctness must never depend on either.

**Q14: Explain the difference between `for...in`, `for...of` and `forEach`.**

They differ in **what they hand you**, **what they walk**, and **what you are allowed to do inside**.

| Aspect | `for...in` | `for...of` | `forEach` |
|---|---|---|---|
| Gives you | **keys**, always strings | **values** | value, index, whole array |
| Works on | any object | anything **iterable** (array, string, `Map`, `Set`, generator, `NodeList`) | arrays and array-likes with the method |
| Walks the prototype chain | **yes** | no | no |
| Sees non-index properties | **yes** | no | no |
| `break` / `continue` | yes | yes | **no** |
| `await` inside pauses the loop | yes | **yes** | **no** |
| Skips holes in a sparse array | yes | **no** | yes |
| Returns | — | — | `undefined` |

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

**`for...in` is for objects, and the two surprises above are why it is wrong for arrays**: the keys are strings (`'2' + 1` is `'21'`), and it enumerates *every* enumerable property — including anything added to the prototype by an old library. If you must use it, guard with `Object.hasOwn(obj, key)`; in practice `Object.keys` / `Object.entries` are the better answer, and they work with `for...of`:

```js
const obj = { x: 1, y: 2 };
for (const key in obj) console.log(key);              // 'x', 'y'
// for (const val of obj) …                           // TypeError: obj is not iterable
for (const [k, v] of Object.entries(obj)) console.log(k, v);   // x 1, y 2
```

A plain object is **not iterable** — that `TypeError` is the single most common surprise here. Arrays, strings, `Map`, `Set`, `arguments` and DOM collections all implement `Symbol.iterator`; `{}` does not.

**`forEach` is the one that gives up control.** It exists for side effects, returns `undefined`, and therefore cannot be chained — reaching for it when you want a result is the tell that `map`/`filter`/`reduce` was the right call. Two things it genuinely cannot do:

- **You cannot stop it.** `return` inside the callback only ends *that* iteration — it behaves like `continue`, never `break`. `some`/`every`/`find` are the short-circuiting versions; otherwise use `for...of`.
- **It does not await.** The callback is an ordinary function, so `forEach` fires them all and moves on:

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

`forEach` returned before a single callback had finished — and because it discards the promises each callback returns, a rejection inside one becomes an **unhandled rejection** nobody catches. When you need sequential awaits use `for...of`; when you want them concurrent use `await Promise.all(ids.map(fn))`, which keeps the promises.

**One last difference: sparse arrays.** `[1, , 3]` has a *hole*, which is not the same as `undefined`. `forEach` (and `map`, `filter`) skip holes; `for...of` visits them as `undefined`; `for...in` omits their keys.

**The rule of thumb:** `for...of` by default — it reads well, breaks, and awaits. `forEach` when the body is a one-line side effect and you know the array is dense. `for...in` only on plain objects, and prefer `Object.entries` even then. See **§7.3** for the full signatures and their parameters.

**Q15: What are memory leaks in JavaScript and how do you prevent them?**

Common causes:
1. **Global variables**: Unintentional globals from missing `let`/`const`
2. **Closures**: Inner functions retaining references to large outer objects
3. **Event listeners**: Not removing listeners when elements are removed
4. **Timers**: `setInterval` not cleared
5. **Detached DOM nodes**: Removed from DOM but still referenced in JS

Prevention:
- Use `let`/`const` (block scope, no accidental globals)
- Remove event listeners in cleanup (`removeEventListener`, React's `useEffect` return)
- Clear timers (`clearInterval`, `clearTimeout`)
- Use `WeakMap`/`WeakSet` for caches that should allow GC
- Use browser DevTools Memory tab to profile heap snapshots

---

**Q16: Implement a debounce function with leading and trailing options.**

**Debouncing means "wait until the noise stops".** Every call restarts a timer, and the wrapped function only runs once `delay` milliseconds have passed with no further calls — so a burst of 20 keystrokes produces one search request instead of 20.

**Leading and trailing name the two edges of that burst:**

| Option | When `fn` runs | Reads as |
|---|---|---|
| `trailing: true` (the default) | **after** the burst ends | "tell me once they've stopped typing" |
| `leading: true` | **immediately** on the first call of a burst | "act now, then ignore the rest" |
| both | on the first call **and** again at the end (only if more calls arrived) | responsive *and* final |
| neither | never — a pointless configuration | — |

```text
calls:     ▼   ▼ ▼        (a, b, c — 30ms apart)
           │
leading    ● a                                  ← fires on the FIRST call
trailing              ● c                       ← fires 100ms after the LAST call
both       ● a        ● c
           └── burst ──┘└─ delay ─┘
```

The everyday split: a **search box** wants trailing (you only care what they finally typed), a **submit button** wants `leading: true, trailing: false` (act on the first click, swallow the double-click).

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

**The three lines that carry the whole thing:**

1. **`clearTimeout(timer)` on every call** is the debounce. Without it you have a plain delay, not a debounce, and every keystroke would eventually fire.
2. **`!timer` identifies the leading edge.** A pending timer means a burst is already running; no timer means this call begins one. Setting `timer = null` *inside* the callback (not just letting it expire) is what makes the next call leading again.
3. **`lastArgs = null` after firing** is what stops `{ leading: true, trailing: true }` firing twice for a single isolated call: the leading call consumes the arguments, so when the timer expires there is nothing left to send. A trailing call only happens if *more* calls arrived during the wait — which is exactly the behaviour lodash has.

`fn.apply(this, args)` rather than `fn(...args)` is deliberate: it forwards the receiver, so `el.onclick = debounce(obj.method, 200)` still sees the right `this` (see **§4.3**).

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

The two leading calls fire straight away with the **first** character; the two trailing calls fire ~100 ms after the last keystroke with the **latest** one. `'b'` never reaches `fn` at all — that is the point.

**What this implementation still lacks**, and what a follow-up question usually asks for:

- **`cancel()`** — `clearTimeout(timer); timer = null; lastArgs = null;` exposed on the returned function. Essential in React: call it in the effect cleanup or the trailing call fires after the component has unmounted.
- **`flush()`** — run the pending trailing call immediately (on form submit, say).
- **A return value.** The debounced function returns `undefined`, because at call time the real call has not happened. If the caller needs the result, the wrapper has to return a promise resolved by the eventual call.

**Debounce is not throttle.** Debounce waits for silence, so under continuous input it may never fire; throttle guarantees one call every `delay` regardless. Resize and scroll want throttle; search input and autosave want debounce. See **§14.4** for both side by side.

**Q17: Explain `Object.freeze` vs `Object.seal` vs `Object.preventExtensions`.**

They are three points on one scale, and each is a strict superset of the one above it. Two invisible switches do all the work: the object's own **`[[Extensible]]`** flag (may new properties be added?) and, on every property, the descriptor flags **`configurable`** (may it be deleted or redefined?) and **`writable`** (may its value change?).

| Method | Add props | Delete props | Modify values | What it actually does | Check with |
|---|---|---|---|---|---|
| `Object.preventExtensions` | **No** | Yes | Yes | `[[Extensible]] = false` | `Object.isExtensible` → `false` |
| `Object.seal` | **No** | **No** | Yes | the above **+ `configurable: false`** on every own property | `Object.isSealed` |
| `Object.freeze` | **No** | **No** | **No** | the above **+ `writable: false`** on every own data property | `Object.isFrozen` |

Read down the "What it actually does" column and the whole answer falls out: **seal is preventExtensions plus non-configurable; freeze is seal plus non-writable.** That is why every frozen object is also sealed, and every sealed object is also non-extensible — but not the reverse.

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

**The dangerous part is that those writes fail *silently*.** In sloppy mode an assignment to a frozen property is simply discarded — no error, no warning, and the bug surfaces later as a value that "didn't update". Under `'use strict'`, and therefore **inside every ES module**, the same line throws:

```js
'use strict';
const config = Object.freeze({ retries: 3 });
config.retries = 5;   // TypeError: Cannot assign to read only property 'retries'
```

**All three are shallow.** They act on the object you pass and on nothing it points at:

```js
const obj = Object.freeze({ nested: { a: 1 } });
obj.nested.a = 99;             // works — the INNER object was never frozen
console.log(obj.nested.a);     // 99
```

A deep freeze has to walk the graph, and needs a guard against cycles or it recurses forever:

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

**Three things freeze does *not* stop**, each a favourite follow-up:

- **A setter still runs.** Freezing makes data properties non-writable, but an accessor has no `writable` flag — assigning to it still invokes the setter, which can happily mutate something else.
- **`Map`, `Set` and `Date` contents are untouched.** Their data lives in internal slots, not in properties, so `Object.freeze(new Map())` still accepts `.set(...)`. The same is true of a frozen object holding a `Map`.
- **`const` is a different thing entirely.** `const` freezes the **binding** — you cannot reassign the variable; `Object.freeze` freezes the **value** — you cannot mutate the object. `const o = {}; o.x = 1` is legal precisely because those are separate guarantees.

**On arrays**, freezing is stronger than it looks: `arr.push(...)` throws a `TypeError` **even in sloppy mode**, because `push` defines a new index property rather than assigning to an existing one. A *sealed* array still allows `arr[0] = 9` but not `push`, since its length cannot grow.

**Where to use which.** `Object.freeze` for genuinely constant configuration and lookup tables, and as a development-time guard that catches accidental mutation of state you intend to be immutable (Redux's `redux-immutable-state-invariant` does exactly this, in dev only — deep-freezing a large state tree on every action is real work). `seal` and `preventExtensions` are rare in application code; they mostly appear where an object's *shape* is a contract but its values are meant to change. For everyday immutable updates, the ES2023 copy methods (`toSorted`, `with`, `toSpliced` — see **§7.1**) are the practical tool, because they return a new array rather than forbidding changes to an old one.

**Q18: What is currying and how would you implement it?**

Currying transforms a function with multiple arguments into a sequence of functions, each taking one argument.

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

Use cases: partial application, creating specialized functions from generic ones, functional composition.

---

**Q19: How does garbage collection work in JavaScript?**

Modern JS engines (V8) use **generational garbage collection**:

1. **Mark-and-sweep** (primary): Starts from "roots" (global object, call stack). Marks all reachable objects. Sweeps (frees) unmarked objects.

2. **Generational hypothesis**: Most objects die young.
   - **Young generation** (nursery): Newly created objects. Collected frequently with Scavenge (copying GC).
   - **Old generation**: Objects that survived multiple young-gen collections. Collected less frequently with Mark-Sweep-Compact.

3. **Incremental/concurrent**: GC runs in small increments to avoid long pauses (important for 60fps UI).

You can't control GC directly, but you can help:
- Nullify references when done (`obj = null`)
- Use WeakMap/WeakSet for secondary references
- Avoid closures that capture large scopes unnecessarily
- Reuse objects instead of creating new ones in hot loops

---

**Q20: Explain the `Symbol` primitive. What are well-known symbols?**

`Symbol` creates a unique, immutable value. No two symbols are equal.

```js
const s1 = Symbol('description');
const s2 = Symbol('description');
s1 === s2;  // false (always unique)
```

**Well-known symbols** customize built-in behavior:
- `Symbol.iterator` — makes object iterable (`for...of`)
- `Symbol.toPrimitive` — customizes type coercion
- `Symbol.hasInstance` — customizes `instanceof`
- `Symbol.toStringTag` — customizes `Object.prototype.toString()`

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

**Grouping means "bucket these items by something they have in common"** — orders by status, users by role, log lines by day. For years the only way to do it was Lodash's `_.groupBy`, and ES2024 finally added the language's own version. They look interchangeable and are not.

**What Lodash does**, for reference — this is the call almost everyone has written:

```text
_.groupBy(users, 'role')
// { admin: [ {name:'a',…}, {name:'c',…} ], user: [ {name:'b',…} ] }

_.groupBy(users, u => u.role)      // the callback form does the same
```

Two things there are doing quiet work: **`'role'` is a string, not a function** (Lodash's "iteratee shorthand"), and the result is an **ordinary object**, so `result.hasOwnProperty('admin')` works like it does anywhere else.

| Aspect | Lodash `_.groupBy` | `Object.groupBy` (ES2024) | `Map.groupBy` (ES2024) |
|---|---|---|---|
| Naming the key | callback **or** `'prop'` shorthand | callback only | callback only |
| Callback receives | the value | `(element, index)` | `(element, index)` |
| Accepts | arrays, objects, strings, `null` | any **iterable** | any **iterable** |
| Key type | coerced to string | coerced to **string** | **left exactly as returned** |
| Result | plain object | object with a **`null` prototype** | a `Map` |
| Given `null` input | returns `{}` | **throws** `TypeError` | **throws** `TypeError` |

**So the four things that break a straight find-and-replace:**

1. **`Object.groupBy(users, 'role')` throws `TypeError: role is not a function`.** Every shorthand has to become `u => u.role`.
2. **The callback signature differs.** Lodash passes just the value; the native version also passes the index — harmless until your callback is a function like `parseInt` that reads its second argument.
3. **The result has no prototype**, so `result.hasOwnProperty(k)`, `result.toString()` and anything else inherited from `Object.prototype` is `undefined`. Code that probes the result with those methods breaks.
4. **Non-arrays are no longer accepted.** Lodash happily groups a plain object or a `null`; `Object.groupBy` needs something iterable, so `Object.groupBy(null, fn)` and `Object.groupBy({a: 1}, fn)` both throw.

**Now the part that decides between the two native ones — `Object.groupBy` stringifies your key.** Object property keys can only ever be strings (or symbols), so whatever the callback returns is converted:

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

That last line is the one that bites in real code: group by a field that is sometimes missing and you get a bucket literally named `"undefined"`. Grouping by an object — a user record, a `Date` — is worse, because every object stringifies to `"[object Object]"` and they all land in the same bucket. **`Map.groupBy` has no such problem**: a `Map` key can be any value, compared by identity.

**And the `null` prototype is a feature, not an oversight.** The obvious hand-rolled grouper has a real vulnerability:

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

The hand-rolled version throws because `byHand['__proto__']` is not missing — it reads `Object.prototype`, which is truthy, so `||=` never assigns the array and `.push` does not exist. Swap the key for `'constructor'` and you get the same class of bug silently. `Object.groupBy` starts from `Object.create(null)`, so **no key can collide with something inherited** — which is exactly why grouping user-supplied values is safe. The cost is that you must use **`Object.hasOwn(result, key)`** instead of `result.hasOwnProperty(key)`.

**Which to reach for:**

- **`Object.groupBy`** when the key is genuinely a string and you want a plain, serialisable object — a JSON response, template rendering, `Object.entries(groups).map(…)`.
- **`Map.groupBy`** when the key is a number, boolean, `Date`, or an object reference — anything where identity matters — or when you need insertion order and a `.size` without converting.
- **Lodash** only if you are already depending on it for the shorthand and its forgiving input handling. Both native versions are in Node 21+ and every current browser; neither has a shorthand, and that is the line most migrations trip over.

**Q22: When would you use an iterator helper chain instead of array methods?**

Iterator helpers (ES2025) put `map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray`, `forEach`, `some`, `every` and `find` on `Iterator.prototype`, so they work on generators, `Map`s, `Set`s and DOM collections — and they evaluate **lazily**.

Two situations make them the right call. First, when the source is infinite or expensive to fully enumerate:

```js
function* ids() { let n = 0; while (true) yield n++; }
ids().filter(n => n % 7 === 0).take(3).toArray();   // [0, 7, 14]
```

Second, when you only need a prefix of a large transformation. `bigArray.filter(f).map(g).slice(0, 10)` allocates two full intermediate arrays to give you ten items; `bigArray.values().filter(f).map(g).take(10).toArray()` pulls roughly ten items through the pipeline and stops.

The trade-offs to name out loud: iterators are **single-use** (a second `toArray()` returns `[]`, silently), they have no `length`, and there is no `sort` because sorting cannot be lazy. For small arrays the array methods are also *faster* — laziness costs one function call per element per stage, which only pays off when you're skipping work.

---

**Q23: What problem do `using` and `await using` solve that `try`/`finally` does not?**

Explicit resource management (ES2026) binds cleanup to a variable's **scope** rather than to a hand-written block, which fixes three things.

It removes the distance between acquisition and release — with `try`/`finally` the two halves can be a hundred lines apart, and a `return` added in the middle by a later commit is easy to get wrong. It removes nesting: three resources means three nested `try`/`finally` blocks, versus three consecutive `using` declarations. And it makes the contract *declarative* — a type carrying `[Symbol.dispose]` advertises that it must be cleaned up, so forgetting becomes a lint error rather than a leak found in production.

```js
async function handler(req) {
  await using tx = await db.begin();      // [Symbol.asyncDispose]
  using span = tracer.startSpan('handler'); // [Symbol.dispose]
  const rows = await tx.query(/* … */);
  return rows;                            // span disposes, then tx — reverse order
}
```

Points interviewers look for: disposal runs on **every** exit path including a throw; disposal order is **reverse of declaration** (it's a stack); `using` bindings are implicitly `const`; `null`/`undefined` are skipped so conditional acquisition is safe; and `await using` *awaits* the disposal, which is the whole reason it exists separately. For a dynamic number of resources, `DisposableStack`/`AsyncDisposableStack` collect them and dispose the lot in reverse.

---

**Q24: `Temporal` has eight main types where `Date` had one. How do you choose, and why does the choice matter?**

The choice encodes a business decision, which is exactly why interviewers ask it. The core split is **instant versus calendar**.

- A **`Temporal.Instant`** or **`ZonedDateTime`** is one exact moment on the global timeline. Use it for anything that happened or will happen *once*: a log entry, a payment, a meeting.
- A **`PlainDate`** is a date on a calendar with no instant attached. Use it for a birthday, a hotel check-in date, an invoice due date — the guest arrives on the 7th no matter which time zone they booked from.
- A **`PlainTime`** is a wall-clock time. Use it for "the shop opens at 09:00" — which is a *different instant* in summer and winter.
- A **`Duration`** is a length of time, and it is deliberately not a number of milliseconds, because "one month" has no fixed millisecond count.

The classic bug this prevents: storing a recurring daily 9 a.m. standup as a fixed UTC instant. It is correct until the daylight-saving switch, then it silently becomes 8 a.m. or 10 a.m. for everyone. Modelled correctly it is a `PlainTime` plus a time zone, resolved to an instant per occurrence.

Beyond type safety, `Temporal` objects are **immutable** — every arithmetic method returns a new object, so `date.add({ months: 1 })` has no effect unless you use the return value. Months are 1-based. Parsing is strict ISO 8601 rather than `Date`'s implementation-defined guessing. And month-end arithmetic **clamps** rather than overflowing: `2026-01-31` plus one month is `2026-02-28`, where `Date`'s `setMonth` would have rolled over to March 3.

---

**Q25: What does a closure actually hold a reference to, and how does that cause a memory leak?**

A closure keeps the **variable environment** of the scope it was created in — not a copy of the values, and not only the variables it uses. Most engines optimise away bindings the function provably never reads, but you cannot rely on that, and the practical model is: as long as the function is reachable, everything its scope captured is reachable too.

That is the leak. The closure is small; what it pins can be enormous.

```js
function attachHandler() {
  const rows = new Array(100000).fill(0).map((_, i) => ({ id: i }));  // ~MBs
  const summary = rows.length;

  // This closure only reads `summary` — but it was created in a scope that
  // also holds `rows`, and the handler is registered globally.
  document.addEventListener('click', () => console.log(summary));
}
attachHandler();
// `rows` can never be collected: listener → closure → scope → rows.
```

**The chain is what to describe in an interview:** a live reference (the listener registry) holds the closure, the closure holds its scope, and the scope holds every object created in it. Garbage collection is reachability, so one live handler pins the whole graph.

**The four shapes this takes in a single-page app**, all the same bug:

| Shape | What stays reachable |
|---|---|
| A listener added on mount and never removed | the component's props, state and DOM nodes |
| `setInterval` that is never cleared | everything its callback closed over, forever |
| A subscription to a store or socket with no unsubscribe | the whole subscriber closure per mount |
| A detached DOM node held by a closure in an array or map | the node **and its entire subtree** |

The React version is the one interviewers want: an effect that subscribes without returning a cleanup leaks **once per mount**, so navigating back and forth ten times leaves ten live closures each pinning a render's worth of objects.

```js
// The fix is the cleanup, and it is the whole fix.
useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);   // ← same reference
}, []);
```

**Two details that make the answer senior.** Remove the *same function reference* you added — an inline arrow in both calls removes nothing. And confirm it rather than asserting it: take a heap snapshot, exercise the flow, force GC, snapshot again, and look for **Detached HTMLElement** entries and a growing retained size, using the Retainers panel to find what is holding them.

---

**Q26: Implement `once(fn)` — and say why it is asked.**

**`once` wraps a function so it can only ever run once.** The first call runs it and remembers what it returned; every call after that skips the function entirely and hands back that same first result. It is a *higher-order function* — it takes a function and returns a new one with extra behaviour wrapped around it.

You have already used the idea: `el.addEventListener('click', fn, { once: true })` is the browser's built-in version, and Node's `emitter.once(event, fn)` is the same thing for events. You write your own when the thing being guarded is not an event:

- **one-time setup** — connect to a database, read a config file, initialise an SDK; call it from ten places and it still happens once,
- **a submit handler** that must not fire twice on a double-click,
- **a warning** you want logged the first time a deprecated function is used and never again,
- **a singleton** — the returned value *is* the shared instance.

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

The setup line prints **once** even though `init()` was called five times, and every caller got the identical object back — which is what makes this a singleton rather than just a guard.

**How the four lines work.** `called` and `result` are created when `once(fn)` runs and then captured by the returned function — so they survive after `once` has returned, and there is exactly one pair of them per wrapper (see **§5.2**). The `if (called) return result` line is the whole gate. `fn.apply(this, args)` forwards both the receiver and the arguments unchanged, and `fn = null` drops the wrapper's last reference to the original function so it can be garbage collected.

It is asked because those four lines expose four separate things:

- **Closures as private state.** `called` and `result` live in the closure, invisible and untamperable from outside — the same mechanism as a module private. Put them on the returned function instead (`wrapper.called = true`) and any caller can reset your guard.
- **`this` forwarding.** `fn.apply(this, args)` rather than `fn(...args)`, or `obj.method = once(obj.method)` silently loses its receiver. A candidate who writes an **arrow function** as the wrapper has introduced that bug, because an arrow has no `this` of its own to forward (see **§4.3**).
- **Caching the result, not just the call.** The common wrong answer guards the call but returns `undefined` afterwards. Real `once` returns the first result every time — that is what makes it usable for lazy initialisation, where callers two through ten still need the value.
- **Releasing the reference.** Setting `fn = null` lets the original function and everything it closed over be collected. It is the same reasoning as **Q25**, applied deliberately: a wrapper that never calls `fn` again has no reason to keep holding it.

**The follow-up to expect is the async one**, because the simple version does not solve it: if `fn` is async, three callers arriving before the first finishes would each start their own request. Cache the **promise**, not the result:

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

All three callers share one in-flight request — the memoised-singleton pattern behind most "get the DB connection" helpers. **Its trap is failure:** a rejected promise is cached too, so one transient error means every future caller gets that same rejection forever. Production versions clear `promise` in a `.catch` so the next call retries.

The other follow-up is **`reset()`**, and answering it is what forces you to say why the state lives in the closure: `reset` can be exposed deliberately (`wrapper.reset = () => { called = false; }`) precisely *because* nothing else can reach `called` — you choose what to expose, rather than leaving it writable by anyone who has the function.

---

**Q27: What is the difference between an arrow function and a normal function?**

They differ in five ways, but only the first is a real difference — **an arrow function has no `this` of its own.** The other four fall out of the same design decision: arrows were specified as lightweight function *expressions*, so they were given none of the machinery a callable object carries. A normal function receives `this`, `arguments`, `new.target` and a `prototype` at call time; an arrow receives none of them and closes over the enclosing scope for all of them, the same way it closes over any other variable.

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

**`this is NOT the object` is the whole lesson.** Writing `arrow` as a property of `counter` looks like it defines a method on it, and it does not — the arrow closed over whatever `this` was where the object literal was *written*, and an object literal creates no scope. So a method written as an arrow can never see its own object, no matter how it is called.

#### Where each one is the right answer

**Use a normal function** whenever the caller is supposed to supply `this`: object methods, class methods, prototype methods, and anything a library invokes with a bound receiver — jQuery-style callbacks, Mocha's `this.timeout()`, a Vue `methods` entry.

**Use an arrow** whenever you want to *keep* the `this` you already have. That is the bug arrows were introduced to remove: a callback inside a method used to lose `this`, which is why pre-ES6 code is full of `const self = this` and `.bind(this)`.

```js
class Poller {
  constructor() { this.hits = 0; }
  start() {
    // Arrow: `this` is still the Poller. A normal function here would get
    // `undefined` (strict) or the global object (sloppy), and `this.hits` would throw.
    setTimeout(() => { this.hits++; console.log('hits ->', this.hits); }, 0);
  }
}
new Poller().start();
```

```text
hits -> 1
```

**What to volunteer.** A **class field** (`handleClick = () => {}`) is the standard way to get a permanently bound handler, and the cost is that it is a per-instance property rather than a shared prototype method. Arrows also cannot be **generators**, and they have no `super` or `new.target` of their own — they inherit those too. And the one that is a genuine trap rather than trivia: an arrow's concise body **returns an object literal only if you parenthesise it** — `() => ({ ok: true })`, because `() => { ok: true }` is a block with a label in it and returns `undefined`.


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

Unlike mathematics or languages like Python, JavaScript does **not** support chained relational comparisons as a single "is this value between these two?" operation. Instead, `>` is strictly a binary operator and is left-associative, so the expression is evaluated in two separate steps from left to right.

1. First, `3 > 2` is evaluated. Both operands are numbers, so no coercion happens. The result is the boolean `true`.
2. The expression now becomes `true > 1`. Relational operators require numeric operands, so the abstract `ToNumber` algorithm converts `true` to `1`.
3. The comparison reduces to `1 > 1`, which is `false`.

The trap is that a reader expects JavaScript to interpret the expression as "is 3 greater than 2 AND 2 greater than 1?", but what actually happens is that the boolean result of the first comparison silently participates in the second one as a number. The same pitfall appears in `1 < 2 < 3`, which surprisingly also returns `true` — not because the math checks out, but because `true < 3` is `1 < 3`.

**Takeaway:** JavaScript has no chained comparison syntax; write `3 > 2 && 2 > 1` explicitly when you mean a range check.

---

**Q2: Why does `[] == ![]` evaluate to `true` when an empty array is truthy but also appears to be equal to its own negation?**

```js
console.log([] == ![]);
```

**Output:** `true`

**Explanation:**

Two different coercion systems collide here: unary `!` uses the *boolean* coercion rules (`ToBoolean`), while `==` uses the abstract equality algorithm which coerces objects to primitives and then to numbers.

1. `![]` evaluates first because `!` has higher precedence than `==`. The `!` operator applies `ToBoolean` to its operand. Every object — including an empty array — is truthy in JavaScript, so `ToBoolean([])` is `true`. Negating it gives `false`. So `![]` becomes `false`.
2. The expression is now `[] == false`. The abstract equality algorithm sees an object on the left and a boolean on the right. The rule is: if either side is a boolean, convert the boolean to a number. `false` becomes `0`, so we now have `[] == 0`.
3. The next step: object on the left, number on the right. The algorithm converts the object to a primitive via `ToPrimitive` with a `"number"` hint, which calls `[].valueOf()` (returns the array itself, not a primitive) and then falls back to `[].toString()`, which returns the empty string `""`.
4. We now have `"" == 0`. The string is coerced to a number: `Number("")` is `0`. Finally, `0 == 0` is `true`.

The apparent contradiction with "`[]` is truthy" is only apparent: truthiness (used by `!`, `if`, `&&`, `||`) is a different conversion path than abstract equality (used by `==`), so one object can simultaneously be truthy AND loosely equal to `false`.

**Takeaway:** `!` uses `ToBoolean`; `==` uses object-to-primitive plus numeric coercion. These are different rule sets, which is exactly why linters forbid `==` on mixed types — always prefer `===`.

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

This is one of the most famous inconsistencies in the language, and it happens because the relational operators (`<`, `<=`, `>`, `>=`) and the equality operators (`==`, `!=`) use **completely different specification algorithms**.

1. For `null >= 0` and `null > 0`, JavaScript uses the Abstract Relational Comparison algorithm. This algorithm calls `ToNumber` on both operands. `ToNumber(null)` is defined to be `0`, and `ToNumber(0)` is `0`. So `null >= 0` reduces to `0 >= 0` → `true`, and `null > 0` reduces to `0 > 0` → `false`.
2. For `null == 0`, JavaScript uses the Abstract Equality algorithm, which has a **hard-coded special case**: `null` is only loosely equal to `null` and `undefined`. It does **not** coerce `null` to a number. So `null == 0` returns `false` without any numeric comparison ever happening.

The contradiction — "if `null >= 0` is true but `null == 0` is false, then `null > 0` must be true" — is what mathematicians would call a violation of trichotomy. JavaScript breaks this intentionally because `==` treats `null` as a distinct nullish sentinel (for the idiomatic `x == null` check that catches both `null` and `undefined`), while the relational operators fell back to blind numeric coercion.

**Takeaway:** `null` uses different coercion rules for `<`/`<=`/`>`/`>=` (numeric) than for `==`/`!=` (special-cased). Never rely on relational operators with `null`; use explicit `null` or `undefined` checks.

---

**Q4: Why does `NaN == NaN` return `false` when every other value in JavaScript is equal to itself?**

```js
console.log(NaN == NaN);
```

**Output:** `false`

**Explanation:**

`NaN` (Not-a-Number) is a special floating-point value that represents the result of an undefined or unrepresentable mathematical operation — things like `0/0`, `Math.sqrt(-1)`, `parseInt("abc")`, or `"foo" * 2`. The behavior `NaN !== NaN` is not a JavaScript quirk; it comes directly from the **IEEE 754** floating-point standard, which JavaScript's `Number` type implements.

The reasoning in IEEE 754 is philosophical: `NaN` means "the result of a failed computation", and two failed computations aren't necessarily the same failure. `0/0` and `Math.sqrt(-1)` both yield `NaN`, but treating them as equal would be misleading — they represent different undefined outcomes. By design, any comparison involving `NaN` (using `==`, `===`, `<`, `>`, `<=`, `>=`) returns `false`, except `!=` and `!==` which return `true`.

This means you cannot detect `NaN` with equality:

```js
const x = NaN;
x === NaN;          // false
x !== x;            // true — the classic self-inequality trick
Number.isNaN(x);    // true — the correct way
isNaN("abc");       // true — but the global isNaN is buggy (coerces first)
Object.is(NaN, NaN); // true — Object.is has special NaN handling
```

Note that `Object.is(NaN, NaN)` returns `true` because `Object.is` uses the "SameValue" algorithm, which explicitly treats `NaN` as equal to itself. It also distinguishes `+0` from `-0`, unlike `===`.

**Takeaway:** `NaN` is the only value not equal to itself; use `Number.isNaN(x)` or `Object.is(x, NaN)` to test for it, never `x === NaN`.

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

Binary `+` has a dual personality: it is both numeric addition and string concatenation. For each operand it calls `ToPrimitive` with a `"default"` hint; if either result is a string it concatenates, otherwise it adds. On top of that, **parser context** changes what `{}` even means.

1. **`[] + []` → `""`**. `ToPrimitive` on an array calls `.toString()`, which joins with commas — an empty array joins to `""`. So this is `"" + ""`, and because a string is involved, the result is string concatenation: the empty string.
2. **`[] + {}` → `"[object Object]"`**. The left side becomes `""` as above; the right side is an object literal, and `({}).toString()` is `"[object Object]"`.
3. **`{} + []` → `"[object Object]"` *here*, but `0` in the `eval`.** This is the whole point of the question, and it is the one people get wrong. **Inside `console.log(...)` the `{}` sits in an argument position, which is an expression**, so it is an ordinary object literal and you get exactly the same answer as case 2. The famous `0` only appears when `{}` begins a *statement* — typed into a REPL, or `eval`'d as above. There the parser reads `{}` as an empty **block**, and the `+` that follows is **unary**: `+[]` is `ToNumber([])`, which goes via `""` to `0`.
4. **`true + true` → `2`**. Neither operand is an object or a string, so `+` adds: `ToNumber(true)` is `1`.

So `[] + {}` and `{} + []` are not evidence that `+` is order-dependent for objects — written as expressions they give the *same* result. The asymmetry everyone repeats is a **parsing** artefact, not a coercion one, and it disappears the moment you put the expression anywhere a value is expected: an argument, an assignment, or inside parentheses.

**Takeaway:** `+` prefers strings when either operand coerces to one, and a leading `{}` on a line is parsed as a block, not an object — which is why the famous `{} + []` → `0` only reproduces at statement position, and `console.log({} + [])` prints `"[object Object]"`.

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

JavaScript divides its values into two big families: **primitives** (string, number, boolean, null, undefined, symbol, bigint) and **objects** (everything else — plain objects, arrays, functions, dates, maps, etc.). The `===` operator compares these families differently.

- For primitives, `===` compares **by value**: `"a" === "a"` is `true`, and `5 === 5` is `true`, regardless of where those literals appear in source code.
- For objects, `===` compares **by reference** (identity): two objects are `===` only if they are literally the same object in memory — the same slot on the heap.

Each time you write an object or array literal (`{}`, `[]`, `new Date()`, a function expression, etc.), the engine allocates a **fresh** object on the heap and returns a reference to it. Even if the new object has identical contents to another, they live at different memory addresses, so the references are different, so `===` is `false`.

```js
const a = {};
const b = a;
a === b; // true — same reference

const c = {};
a === c; // false — different references even though both are empty

// To compare contents, you need structural equality:
JSON.stringify(a) === JSON.stringify(c); // true (but brittle — ignores undefined, functions, symbols, circular refs)
```

The same applies to arrays, functions, and every other object type. `[] === []` is `false`, `(()=>{}) === (()=>{})` is `false`, and so on.

**Takeaway:** Objects and arrays compare by reference, not structure; use a deep-equality helper (lodash `isEqual`, `JSON.stringify` for simple data) when you need value-based comparison.

---

### Async / Event Loop (Advanced)

These questions test your understanding of the execution order between synchronous code, microtasks (Promises, await), and macrotasks (setTimeout).

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

An `async` function is **not** asynchronous from the caller's perspective until it hits its first `await` (or `return`). Up to that point, every statement runs synchronously as part of the call that invoked it.

1. `test()` is invoked. Execution enters the function body. `console.log("A")` runs immediately and prints `A`.
2. `await Promise.resolve()` is reached. Even though the promise is already resolved, `await` **always suspends** the async function and schedules the continuation (everything after `await`) as a microtask. Control returns to the caller. `test()` returns an unresolved promise.
3. The next synchronous statement runs: `console.log("C")` prints `C`.
4. The synchronous portion of the script finishes. The JavaScript runtime now drains the microtask queue before returning control to the event loop. The continuation of `test` runs: `console.log("B")` prints `B`.

The critical rule people miss is step 2: `await` suspends **even when the promise is already resolved**. It does not optimize the "already-resolved" case. This is what makes `await` different from just reading `.then()` callbacks — the code after `await` always runs in a later microtask tick.

**Takeaway:** The body of an `async` function runs synchronously until the first `await`, after which the remainder is scheduled as a microtask — so anything after the `async` call but before the event loop yields runs before the post-`await` code.

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

The execution walks through one synchronous pass followed by one microtask flush. Here's the step-by-step trace:

1. `console.log(3)` runs first because it appears first in source order. Output so far: `3`.
2. `test()` is invoked. Because `async` functions run synchronously up to the first `await`, `console.log(1)` executes immediately. Output so far: `3, 1`.
3. `await Promise.resolve()` is reached. The async function suspends and schedules the continuation (`console.log(2)`) as a microtask. `test()` returns an unresolved promise to the caller, but nothing is done with it.
4. Execution returns to the top-level script. `console.log(4)` runs synchronously. Output so far: `3, 1, 4`.
5. The synchronous portion is now complete. The runtime drains the microtask queue. The `test` continuation resumes and runs `console.log(2)`. Final output: `3, 1, 4, 2`.

The crucial observation: calling `test()` does **not** immediately defer the entire body — only the part **after** `await`. So `1` prints between `3` and `4` (synchronous portion), while `2` prints after `4` (microtask portion).

**Takeaway:** Calling an `async` function is a blend of synchronous execution (up to the first `await`) and scheduled microtasks (everything after); read each `await` as "suspend here and continue in a future microtask tick".

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

The event loop processes work in three tiers with strict priority: **synchronous code** on the call stack finishes first, then the entire **microtask queue** is drained, and only then does the loop pick **one** macrotask (a `setTimeout` callback is a macrotask). After each macrotask, the microtask queue is drained again before the next macrotask runs.

1. **Synchronous pass.** `console.log("A")` prints `A`. `setTimeout(...)` registers its callback as a macrotask (it does not run yet, even with `0ms` delay). `Promise.resolve().then(...)` registers its callback as a microtask. `console.log("E")` prints `E`.
2. **First microtask drain.** The synchronous script is done. The runtime drains the microtask queue. The `.then(() => console.log("D"))` callback fires, printing `D`.
3. **First macrotask.** The event loop picks the `setTimeout` callback. `console.log("B")` prints `B`. Inside this callback, `Promise.resolve().then(() => console.log("C"))` schedules a new microtask.
4. **Second microtask drain.** The macrotask has finished, so the runtime drains the microtask queue again before the next macrotask. The newly-scheduled callback fires, printing `C`.

Final order: `A, E, D, B, C`. The lesson is the relative priority of microtasks and macrotasks — even a `0ms` `setTimeout` runs after every currently-queued microtask, and each macrotask has its own follow-up microtask drain.

**Takeaway:** Microtasks (Promises, `queueMicrotask`, `MutationObserver`) run to completion between each macrotask (`setTimeout`, `setInterval`, I/O), so a `setTimeout(fn, 0)` is always later than any already-resolved promise.

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

This question tests microtask **ordering** — microtasks run in the order they are enqueued (FIFO). Because `foo()` is called **before** the `.then()` registration, the `await` continuation gets queued first.

1. **Synchronous pass begins.** `console.log("C")` prints `C`.
2. `foo()` is invoked. The body runs synchronously until the first `await`. `console.log("A")` prints `A`. The `await Promise.resolve()` suspends `foo` and enqueues its continuation (`console.log("B")`) as **microtask #1**.
3. `Promise.resolve().then(() => console.log("D"))` runs. The promise is already resolved, so the `.then` callback is enqueued immediately as **microtask #2**.
4. `console.log("E")` prints `E`.
5. **Synchronous pass is done.** The microtask queue now holds `[continuation of foo, then-callback]`. They are dequeued in FIFO order: `B` prints first, then `D`.

Final order: `C, A, E, B, D`. If you had called `foo()` **after** the `.then()`, the order of the last two would flip to `D, B`. This is a common interview trick — the printing of `D` and `B` is determined purely by the order in which `await` and `.then()` were reached during the synchronous phase, not by any intrinsic priority of one over the other.

**Takeaway:** The microtask queue is FIFO — whichever microtask was scheduled first runs first; `await` and `.then()` have equal priority and are ordered solely by when they were encountered during synchronous execution.

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

This combines everything from the previous questions: synchronous order, microtask FIFO ordering, and the microtask-vs-macrotask priority rule. Walk through each step carefully:

1. **Synchronous phase.** `console.log("1")` prints `1`. The `setTimeout` callback is registered as a **macrotask** (it won't run until the stack and microtask queue are empty).
2. The function declaration `async function foo() { ... }` is hoisted and does not produce output.
3. `foo()` is called. Inside the async body, `console.log("3")` runs synchronously and prints `3`. Then `await Promise.resolve()` suspends `foo` and enqueues its continuation (`console.log("4")`) as **microtask #1**.
4. `Promise.resolve().then(() => console.log("5"))` runs and enqueues the `.then` callback as **microtask #2**.
5. `console.log("6")` prints `6`. The synchronous phase is now done. Output so far: `1, 3, 6`.
6. **Microtask drain.** Queue is `[foo-continuation, then-callback]`. FIFO dequeue: `console.log("4")` prints `4`, then `console.log("5")` prints `5`.
7. **Macrotask pick.** The microtask queue is empty. The event loop picks the next macrotask — the `setTimeout` callback. `console.log("2")` prints `2`.

Final order: `1, 3, 6, 4, 5, 2`. Notice the synchronous logs all happen first (in the source order `1, 3, 6`), then all already-queued microtasks drain in FIFO order (`4, 5`), and the `setTimeout` callback — despite its `0ms` delay — is last.

**Takeaway:** Execution order is always: (1) synchronous call stack to completion, (2) entire microtask queue drained FIFO, (3) one macrotask, then repeat — so `setTimeout(fn, 0)` always loses to `await` and `.then()` callbacks queued in the same tick.

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

**First, what `Object.groupBy` is.** Added in ES2024, it takes a list and a callback, calls the callback on every item to get a *group name*, and returns an object whose keys are those names and whose values are arrays of the items that produced them. `Object.groupBy(people, p => p.city)` gives you `{ London: [...], Paris: [...] }`. It replaces the `reduce` everyone used to hand-write for this.

**Line by line:**

| Line | Prints | Why |
|---|---|---|
| `Object.keys(grouped)` | `[ '1', 'null' ]` | three rows, but only **two** groups — the number `1` and the string `'1'` produced the *same* key |
| `grouped['1'].length` | `2` | so that one group holds **both** of those rows |
| `grouped.hasOwnProperty` | `undefined` | the returned object has **no prototype**, so it inherits none of the usual object methods |

Three separate design decisions in `Object.groupBy` collide to produce that.

1. **Keys are coerced to strings.** The callback returns the number `1` for the first row and the string `'1'` for the second. Because the result is a plain object, both keys pass through `ToPropertyKey`, and the number `1` becomes the string `'1'`. The two rows land in the same bucket, which is why `grouped['1'].length` is `2` rather than `1`. This is not special to `groupBy` — it is the ordinary rule that object keys are strings or symbols — but it is easy to forget when the callback looks like it is returning a number.

2. **`null` becomes the string `'null'`.** There is no "no group" behaviour and no skipping. `ToPropertyKey(null)` produces the four-character string `'null'`, so you get a bucket literally named `null` sitting next to your real groups. The same happens for `undefined`, which becomes `'undefined'`. Filter before grouping if you don't want that.

3. **The returned object has a `null` prototype**, which is what makes `grouped.hasOwnProperty` `undefined`. Normally every object inherits from `Object.prototype`, which is where `hasOwnProperty`, `toString` and `valueOf` come from — you never declare them, they are just there. `Object.groupBy` deliberately creates its result with **no prototype at all** (`Object.create(null)`), so it inherits nothing: `grouped.hasOwnProperty` is `undefined`, `grouped.toString` is `undefined`, and `String(grouped)` throws because there is no `toString` to call.

    The reason is safety. If a row's group name happened to be `"__proto__"` or `"constructor"`, writing it into a normal object would either be silently ignored or corrupt the prototype chain — and the hand-written `reduce` version this API replaces has exactly that bug. With no prototype, **every key is just data** and no key can collide with something inherited. The cost is that you use `Object.hasOwn(grouped, key)` instead of `grouped.hasOwnProperty(key)`.

`Map.groupBy` avoids the first two problems entirely, because `Map` keys are compared with SameValueZero and keep their original type — `Map.groupBy(rows, r => r.id)` gives you three distinct entries keyed by `1`, `'1'` and `null`.

**Takeaway:** `Object.groupBy` stringifies keys and returns a prototype-less object — use `Map.groupBy` for non-string keys, and `Object.hasOwn(g, k)` instead of `g.hasOwnProperty(k)`.

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

**First, what is being used here.** `[1, 2, 3].values()` returns an **iterator** rather than an array. ES2025 added `map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray` and friends *to iterators*, so you can chain them the way you chain array methods — except iterators are **lazy**. The array versions do all the work immediately and hand back a finished array; the iterator versions build a pipeline that does nothing until something asks it for a value.

**Line by line:**

| Prints | Why |
|---|---|
| `nothing yet` | building the chain ran **no callbacks at all** — `.map()` and `.filter()` just recorded them |
| `map 1` / `filter 2` | `toArray()` finally asks for a value: `1` goes through `map` → `2`, then `filter` rejects it (`2 > 2` is false) |
| `map 2` / `filter 4` | so it pulls the next one: `2` → `4`, and `filter` accepts it |
| `[ 4 ]` | `take(1)` has its single value and stops — **`3` is never touched**, so there is no `map 3` |

An array chain would instead have printed `map 1, map 2, map 3` first, then `filter 2, filter 4, filter 6` — all six callbacks, including work on an element the final answer never needed.

The first thing to notice is that `'nothing yet'` prints before any `map` or `filter` log. Building the chain does no work at all — `.map()` and `.filter()` on an iterator return a new iterator that merely remembers the callback. Nothing is pulled from the source until a terminal operation asks for a value. With arrays this would be impossible: `[1,2,3].map(f)` runs `f` three times immediately and hands back a finished array.

The second thing is the interleaving. Because evaluation is pull-based, `toArray()` asks `take(1)` for one value, which asks `filter` for a value, which asks `map` for a value, which asks the source array's iterator. So each element travels the **entire pipeline** before the next element is touched:

- Pull #1: `map 1` logs, produces `2`. `filter 2` logs, `2 > 2` is `false` — rejected, so `filter` pulls again.
- Pull #2: `map 2` logs, produces `4`. `filter 4` logs, `4 > 2` is `true` — accepted. `take(1)` has its one value and stops.
- The source element `3` is **never touched**. No `map 3`, no `filter 6`.

The equivalent array chain would have printed `map 1, map 2, map 3` (all of them, including the wasted third), then `filter 2, filter 4, filter 6`, and allocated two three-element intermediate arrays along the way.

There is a further trap hiding here: **`chain` is now dead.** Iterators are single-use, and `take(1)` does not merely stop pulling — on reaching its limit it *closes* the iterator underneath it. Calling `chain.toArray()` again returns `[]`, not the remaining `[6]`, and nothing warns you. (Closing propagates because iterator helpers implement a `return()` method; a bare array iterator does not, which is why `[1,2,3].values()` survives the same treatment. Do not rely on either.)

**Takeaway:** iterator helpers build a pull-based pipeline — nothing runs until a terminal operation (`toArray`, `reduce`, `find`, `some`, `forEach`), each element flows through every stage before the next one starts, and elements past what you consumed are never evaluated.

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

**First, what `using` is.** ES2026 added *explicit resource management*: declare a variable with `using` instead of `const`, and when the surrounding block ends, JavaScript automatically calls that object's `[Symbol.dispose]()` method. It is the language-level version of Python's `with` or C#'s `using` — a way to guarantee cleanup (close the file, release the lock, roll back the transaction) without writing `try`/`finally` by hand.

So `make('a')` returns an object whose only job is to log when it is disposed, and `using a = make('a')` says "clean this up when `run()` exits".

**Line by line:**

| Prints | Why |
|---|---|
| `body` | the ordinary statement runs first |
| `dispose b` | `throw` starts unwinding the scope — cleanup runs **before** the error leaves the function, and **`b` goes first** because it was declared last |
| `dispose a` | then the one declared before it |
| `caught boom` | only now does the error reach the caller's `catch` |

The two surprises are the **order** (last declared, first disposed) and the **timing** (cleanup completes before the exception escapes). Both are deliberate.

Two things determine the output. First, disposal is **LIFO**: `b` was declared last, so it disposes first. This mirrors nested `try`/`finally` blocks, and it is the only order that can be correct in general — if `b` was constructed using `a` (a transaction opened on a connection, a span inside a tracer), then `a` must still be alive while `b` cleans up.

Second, disposal happens **before the exception propagates out of the function**. The `throw` begins unwinding the scope; the scope's exit runs the disposal stack; only then does the error continue to the caller's `catch`. So both `dispose` logs land before `caught boom`. This is exactly the guarantee `finally` gives you, which is the point — `using` is `finally` with the boilerplate removed and the ordering handled for you.

Related traps worth knowing:

- `using` bindings are implicitly **`const`**. `using a = …; a = other;` is a syntax error, because the engine must be certain the value it disposes is the value it acquired.
- `null` and `undefined` are **skipped silently**, so `using maybe = flag ? open() : null;` is legal. Any other value lacking `[Symbol.dispose]` is a `TypeError` thrown at the declaration.
- If a dispose method itself throws while the scope is already unwinding from an error, the errors are aggregated into a `SuppressedError` rather than one silently replacing the other.
- `await using` is a distinct form that looks up `[Symbol.asyncDispose]` and **awaits** the result. Using plain `using` on an async resource does not await the teardown, which is the subtle bug: the transaction rolls back *eventually*, after your response has already gone out.

**Takeaway:** `using` disposes in reverse declaration order, on every exit path including a `throw`, and always before the error propagates — and `await using` is required if the cleanup is itself asynchronous.

---

**Q15: Why does the date not change on the first log, and why is the second result February 28 rather than March 3?**

```js
const d = Temporal.PlainDate.from('2026-01-31');
d.add({ months: 1 });
console.log(d.toString());

console.log(Temporal.PlainDate.from('2026-01-31').add({ months: 1 }).toString());

const legacy = new Date(2026, 0, 31);
legacy.setMonth(legacy.getMonth() + 1);
console.log(legacy.toISOString().slice(0, 10));
```

**Output:**
```
2026-01-31
2026-02-28
2026-03-03
```

**Explanation:**

**First, what `Temporal` is.** It is the ES2026 replacement for the `Date` object, added because `Date` has been the language's worst-designed API for thirty years — it mutates in place, conflates a date with a timestamp, and handles time zones badly. `Temporal.PlainDate` is exactly what the name says: a calendar date with no time and no time zone, which is the right type for a birthday or an invoice date.

This snippet puts the old and new APIs side by side on the same question — *what is one month after January 31?* — and they disagree.

**Line by line:**

| Prints | Why |
|---|---|
| `2026-01-31` | `d.add(...)` returned a **new** date and we ignored it — `Temporal` objects can never be modified, so `d` is untouched |
| `2026-02-28` | using the return value this time: February has no 31st, so `Temporal` **clamps** to the last valid day |
| `2026-03-03` | legacy `Date` instead **overflows** — it builds "February 31", which rolls forward into March |

So the first line is about *immutability* and the difference between the second and third is about *what a calendar should do with an impossible date*.

**Immutability.** Every `Temporal` type is frozen; `add`, `subtract`, `with`, `round` and friends all return a **new** object and never touch the receiver. So `d.add({ months: 1 })` on line 2 computes a value and throws it away — `d` is still `2026-01-31`. This is the single most common `Temporal` mistake among developers coming from `Date`, where `setMonth` mutates in place and returns a timestamp number. The mutation-based API was the source of countless aliasing bugs (two variables pointing at the same `Date`, one of them "helpfully" advanced); making the types immutable eliminates the class entirely, at the cost of having to remember to use the return value.

**Clamping instead of overflow.** January 31 plus one month has no obvious answer, because February 31 does not exist. `Temporal`'s default `overflow: 'constrain'` mode **clamps the day to the last valid day of the target month**, giving `2026-02-28`. That matches how humans reason about "a month from the 31st" and how subscription billing works. Legacy `Date` instead lets the invalid day **overflow** into the next month: `setMonth` builds February 31, which normalises to March 3 (2026 is not a leap year, so February has 28 days, and 31 − 28 = 3). Silent overflow is why "renew one month later" code drifts and occasionally skips a month entirely.

If you actually want the error rather than the clamp, `Temporal` lets you ask for it: `d.add({ months: 1 }, { overflow: 'reject' })` throws a `RangeError` instead of quietly picking a day.

A related asymmetry follows from clamping: date arithmetic is **not** reversible. `2026-01-31` plus one month minus one month is `2026-01-28`, not `2026-01-31`. That is inherent to calendar math, not a `Temporal` flaw — but interviewers like it because it forces you to think about whether your business rule wants calendar months or a fixed number of days.

**Takeaway:** `Temporal` objects are immutable (use the return value) and clamp out-of-range days to the end of the month, where legacy `Date` mutates in place and overflows into the following month.

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
console.log(out, Date.now() - t >= 60);
```

**Output:**
```
yield 30
yield 10
yield 20
[ 30, 10, 20 ] true
```

**Explanation:**

`Array.fromAsync` (ES2026) is often mistaken for "`Promise.all` for async iterables". It is not. It drains the async iterable **sequentially**, awaiting each value before requesting the next — it is a `for await…of` accumulation loop with the boilerplate removed.

That has to be true, because an async iterator is pull-based and *serial by construction*. `Array.fromAsync` cannot ask a generator for its third value without the generator having produced its second — there is nothing to parallelise. So the total time is the **sum** of the delays (30 + 10 + 20 ≈ 60 ms), and the logs appear in source order rather than in fastest-first order.

Contrast the superficially similar `Promise.all`:

```js
// Sequential: ~60 ms — each await blocks the next pull
await Array.fromAsync(gen());

// Parallel: ~30 ms — all three timers run concurrently
await Promise.all([30, 10, 20].map(ms => new Promise(r => setTimeout(() => r(ms), ms))));
```

Both return results in source order — `Promise.all` preserves input order regardless of settle order — but only one of them overlaps the waiting.

Which behaviour you want depends on whether the items are independent. Sequential is **required** for paginated fetching, because page 2's cursor comes out of page 1's response; you literally cannot start request *n+1* before request *n* returns. Parallel is what you want for independent requests, and `Array.fromAsync` is the wrong tool there — you would `Promise.all` a mapped array, or use a bounded concurrency pool if you need to avoid hammering the server.

One more detail: `Array.fromAsync` also accepts a **sync** iterable of promises, in which case it awaits each element as it collects it. That makes `Array.fromAsync([p1, p2, p3])` behave like a sequential `Promise.all` — same result, no concurrency — which is almost never what you meant to write.

**Takeaway:** `Array.fromAsync` is a sequential drain of an async iterable (`for await…of` in one line), not a concurrent one — reach for `Promise.all` or a concurrency pool when the work is independent.

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
- `await` pauses the async function and schedules the rest as a microtask
- `this` depends on the call site, not where the function is defined
- `var` is function-scoped, `let`/`const` are block-scoped

---

## References

- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) — Comprehensive JavaScript tutorials and reference
- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference) — Complete API reference for built-in objects
- [ECMAScript Specification](https://tc39.es/ecma262/) — The official language specification
- [JavaScript.info](https://javascript.info) — Modern JavaScript tutorial with detailed explanations
