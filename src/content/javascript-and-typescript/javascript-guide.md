# JavaScript — Core Concepts

The language itself: data types, scope and closures, functions, objects and prototypes, async code and the event loop, modules, the DOM, and patterns.

Part of the JavaScript series: **JavaScript Guide** · [JavaScript Interview Questions](/javascript/interview-questions) · [JavaScript Tricky Questions](/javascript/tricky-questions)

---
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

---

## 1. What is JavaScript?

JavaScript is a **single-threaded**, **dynamically typed**, **JIT-compiled** programming language. It's the language of the web: it runs in browsers, and on servers through Node.js.

Key characteristics:
- **Single-threaded**: one call stack, so one piece of your code runs at a time (§1.4)
- **Non-blocking**: slow work such as network requests is handed off, and your code carries on (§1.5), with results delivered by the event loop (§1.6)
- **Prototype-based**: objects inherit from other objects, not from classes (§6)
- **First-class functions**: functions are values that can be stored and passed around (§1.3)
- **Multi-paradigm**: supports object-oriented, functional and event-driven programming

### 1.1 The Engine and the Runtime — What Happens When Your Code Runs

An **engine** reads your code, turns it into instructions, runs them, and speeds up the parts that run often. The **browser (or Node)** around the engine supplies everything that is not the language itself: timers, network requests, the page. People mix the two up:

| Piece | What it is | Examples | What it gives you |
|---|---|---|---|
| **Engine** | the program that understands JavaScript | V8 (Chrome, Edge, Node), SpiderMonkey (Firefox), JavaScriptCore (Safari) | variables, functions, objects, promises, the call stack, the memory heap |
| **Runtime** (the host) | the program the engine lives inside | the browser, Node.js | `setTimeout`, `fetch`, `document`, `console`, `fs`, the event loop |

`setTimeout` is **not part of the JavaScript language**; the browser provides it, and Node provides its own. That is why the same code has a `document` in the browser and not in Node: same engine, different host.

**What the engine does with your file:**

1. **Parse.** It builds a tree describing the code, an **AST** (abstract syntax tree). A syntax error *anywhere* stops it here, and **not one line runs**, not even those above the mistake.
2. **Interpret.** It turns the tree into **bytecode**, a compact list of simple instructions, and runs it straight away (V8's *Ignition*).
3. **Optimise the hot parts.** Functions called a lot are compiled into fast machine code based on the types they have received. This is **JIT compilation** (just-in-time: compiled while the program runs); V8's optimising compilers are *Maglev* and *TurboFan*.
4. **Undo when a guess is wrong.** If a function built for numbers suddenly gets a string, the engine throws the fast code away and goes back to bytecode: **deoptimisation**.

You can see step 1: the first line of this code never runs, because the snippet fails to parse first.

```js
const source = "console.log('line 1 ran'); let x = ;";

try {
  new Function(source);   // parse the code, but do not run it
} catch (err) {
  console.log(err.name);
}
console.log('line 1 never printed');
```

```text
SyntaxError
line 1 never printed
```

**Where things are kept while it runs.** The **call stack** tracks which function is running right now and what called it (§1.2). The **heap** holds objects, arrays and functions; your variables hold **references** to them, not the objects themselves. The **garbage collector** frees heap objects that nothing can reach any more. (Real engines are subtler, e.g. a variable captured by a closure lives on the heap, but the model holds for reasoning.)

**The practical takeaway:** the optimiser rewards *predictable* code (same argument types, objects built with the same properties in the same order). It only matters in genuinely hot code.

---

### 1.2 Execution Context and the Call Stack

Each time a function is called, the engine creates an **execution context**: a small record holding that call's local variables, its `this`, and a link to the scope outside it. The contexts are kept on the **call stack**, like a stack of plates: a call puts one on top, a return takes it off, and only the top one is running. When it returns, the one underneath carries on from where it stopped.

```js
function third() {
  console.log('3. in third: the stack is global > first > second > third');
}
function second() {
  console.log('2. in second');
  third();
  console.log('4. back in second, because third was taken off the stack');
}
function first() {
  console.log('1. in first');
  second();
  console.log('5. back in first');
}

first();
console.log('6. back in the global context');
```

```text
1. in first
2. in second
3. in third: the stack is global > first > second > third
4. back in second, because third was taken off the stack
5. back in first
6. back in the global context
```

**Every context is set up in two phases, and this is what "hoisting" really is.**

1. **Creation phase.** Before any line runs, the engine scans the code and makes room for every variable and function it declares.
   - A **function declaration** is stored complete, so it can be called before the line where it is written.
   - A **`var`** is created and set to `undefined`.
   - A **`let` or `const`** is created but marked "not ready". Touching it before its line throws a `ReferenceError`. That gap is the *temporal dead zone* (interview Q11).
2. **Execution phase.** The code then runs top to bottom, filling in values as it reaches each line.

```js
console.log(typeof greet);   // the function exists already
console.log(count);          // the var exists, but is still empty

try {
  console.log(total);        // the let exists, but is not ready yet
} catch (err) {
  console.log(err.name);
}

function greet() {}
var count = 1;
let total = 2;
```

```text
function
undefined
ReferenceError
```

Nothing was physically moved to the top of the file. "Hoisting" is just the name for the creation phase having set these up before the first line ran.

**The stack has a size limit.** Recursion with no stopping point keeps adding plates until the engine refuses:

```js
let depth = 0;
function dive() {
  depth++;
  dive();          // no base case, so this never stops by itself
}

try {
  dive();
} catch (err) {
  console.log(err.name, depth > 1000);
}
```

```text
RangeError true
```

The message is "Maximum call stack size exceeded", a **stack overflow**. The limit depends on the engine and on how much each call stores (about 10,000 calls in Node).

**Why the call stack matters for async code:** a callback from `setTimeout` or a promise can only run when the stack is **empty**. That rule is the heart of the event loop (§1.6).

---

### 1.3 Function References — Functions Are Values

In JavaScript a function is a **value**, an object like any other, and its name is just a variable holding a reference to it. `fn` means "the function itself" (the recipe card, which you can copy or hand on); `fn()` means "run it now and give me what it returns" (the dish).

```js
function sayHi() {
  return 'hi';
}

const alias = sayHi;              // no (): copy the reference, do not run it
console.log(alias === sayHi);     // the same function object
console.log(alias());
console.log(typeof sayHi, typeof sayHi());

sayHi.calls = 0;                  // a function is an object, so it can hold properties
console.log(alias.calls);         // alias sees it: there is only one object

const lookalike = function sayHi() { return 'hi'; };
console.log(lookalike === sayHi); // same code, different object

let handler = () => 'old';
const saved = handler;            // saved holds the old function
handler = () => 'new';            // handler now points somewhere else
console.log(saved());
```

```text
true
hi
function string
0
false
old
```

The last line is the one people get wrong: `saved = handler` copied the **reference** at that moment, and pointing `handler` elsewhere later does not change what `saved` holds.

**Three bugs from mixing up `fn` and `fn()`, or from references not matching:**

**1. Calling a function when you meant to pass it.** `setTimeout(save(), 1000)` runs `save` **immediately** and passes its *return value*. Pass the function (`setTimeout(save, 1000)`), or wrap it (`setTimeout(() => save(id), 1000)`). In React the same mistake is `onClick={handleClick()}`, which runs on every render.

**2. Removing a listener with a different function.** `removeEventListener` only removes the **same reference** you added. An arrow written out again is a new function, so nothing matches.

```js
const button = new EventTarget();
let clicks = 0;

button.addEventListener('click', () => clicks++);
button.removeEventListener('click', () => clicks++);   // a NEW function: nothing matches
button.dispatchEvent(new Event('click'));
console.log('after removing a lookalike:', clicks);    // still listening

const onClick = () => clicks++;
const other = new EventTarget();
other.addEventListener('click', onClick);
other.removeEventListener('click', onClick);           // the SAME reference: removed
other.dispatchEvent(new Event('click'));
console.log('after removing the reference:', clicks);  // no change
```

```text
after removing a lookalike: 1
after removing the reference: 1
```

This is how listener memory leaks start: a component adds an inline arrow, tries to remove it on cleanup, and the original stays attached forever.

**3. Passing a method loses its object.** `user.greet` is a reference to the function only, so when it is called on its own, `this` is not `user`.

```js
'use strict';

const user = {
  name: 'Asha',
  greet() {
    return this === undefined ? 'this is undefined' : 'Hi, ' + this.name;
  },
};

console.log(user.greet());           // called ON user, so this = user
const detached = user.greet;         // just the function
console.log(detached());             // called on nothing
const bound = user.greet.bind(user); // a new function with this fixed to user
console.log(bound());
```

```text
Hi, Asha
this is undefined
Hi, Asha
```

This is what happens with `setTimeout(user.greet, 0)` or `addEventListener('click', this.handleClick)`: the function travels without its object. Fix it with `bind` or an arrow (`() => user.greet()`). Without `'use strict'`, `this` would be the global object instead, which is worse because nothing throws (§4.3 has the full rules).

**Why this matters in React:** a function created inside a component is a **new reference on every render**, so a `memo` child sees a "new" `onClick` each time and re-renders. `useCallback` keeps the same reference between renders.

---

### 1.4 Why Is JavaScript Called Single-Threaded?

**Your JavaScript code runs on one thread, with one call stack, so exactly one piece of it runs at any moment.** Two of your functions never run at the same instant, and a function is never interrupted halfway through by another one of yours.

A thread is one line of work; several can run at the same time, one per CPU core. Java, C# and Go let your code start threads freely; JavaScript gives it one, the browser's **main thread**.

**Why it was designed this way.** JavaScript was made in 1995 to script web pages. If two threads could change the same button at once, all UI code would need locks, the source of most multithreading bugs. With one thread, a function can read the page, decide and update it, knowing nothing changes underneath it.

**What "single-threaded" does NOT mean.** It describes *your code*, not the browser or Node. Around your one thread, the host is busy in parallel:

| Running in parallel, outside your thread | Examples |
|---|---|
| Network and timers | `fetch` downloads and `setTimeout` counts down while your code runs |
| Parts of rendering | image decoding, scrolling, compositor animations |
| Node's I/O | file reads, DNS and some crypto on libuv's thread pool (4 threads by default) |
| Workers | extra JavaScript threads you start yourself (§1.7) |

So JavaScript can wait for many things at once; it just can't *run your code* for more than one at once.

**The cost of one thread: a long task blocks everything.** The main thread also handles clicks, typing and painting, and none of those can happen while your function runs. Here a timer is due after 0 ms, but it cannot run until the loop gives the thread back:

```js
const start = Date.now();

setTimeout(() => {
  console.log('timer ran after', Date.now() - start >= 300 ? '300 ms or more' : 'less than 300 ms');
}, 0);

while (Date.now() - start < 300) {}   // 300 ms of work on the only thread
console.log('loop finished');
```

```text
loop finished
timer ran after 300 ms or more
```

In a real page, a click during those 300 ms would also wait, and the screen would not update. Browsers flag any task over **50 ms** as a "long task", roughly where people notice lag. The fixes are to split the work into pieces that give the thread back in between ([tricky questions](/javascript/tricky-questions) show how), or to move it to a worker (§1.7).

---

### 1.5 Why Is JavaScript Non-Blocking?

**When your code asks for something slow, such as a network request, a timer or a file, JavaScript does not stop and wait for it.** It hands the job to the host (the browser or Node), carries on with the next line, and runs your callback later, when the result is ready. Waiting happens *outside* your thread, so the thread stays free. ("Blocking" means the thread sits idle until an operation finishes; with one thread, a blocking network call would freeze the page for as long as the server took.)

Picture a restaurant with one waiter: they take your order to the kitchen and go straight to the next table, and bring your food when the kitchen rings the bell and they are free.

```js
console.log('1. order coffee');
setTimeout(() => console.log('3. coffee is ready'), 0);   // handed off; it waits in the queue
console.log('2. find a seat');
```

```text
1. order coffee
2. find a seat
3. coffee is ready
```

Even with a delay of 0, line 3 prints last: the callback can only run once the running code has finished and the call stack is empty.

**How you receive the result** has changed (callbacks, then promises, then `async`/`await`, §8), but the idea is the same. `await` *looks* like waiting, but it only pauses that one `async` function; the thread is released meanwhile.

```text
// Node.js, the same job both ways
const data = fs.readFileSync('big.csv');                 // BLOCKING: the thread waits; nothing else runs
fs.readFile('big.csv', (err, data) => { /* later */ });  // NON-BLOCKING: returns at once; the callback runs later
const data2 = await fs.promises.readFile('big.csv');     // non-blocking, written to look sequential
```

This is why one Node.js process can serve thousands of connections: while it waits for one database query, it handles other requests.

**Non-blocking is about WAITING, not computing.** A loop that crunches numbers for two seconds still blocks, however you wrap it: a promise or `async` function changes *when* it runs, not *where* (§1.4). A few APIs really do block and should stay off the main thread: `alert()`, `confirm()`, synchronous `XMLHttpRequest`, and Node's `*Sync` functions inside a server.

---

### 1.6 What Is the Event Loop?

**The event loop is how "later" gets turned back into "now".** When a timer fires or a response arrives, the host does not interrupt your code. It puts your callback in a **queue**. The event loop waits until the call stack is empty (nothing of yours is running), takes the next callback from the queue and runs it, and repeats forever.

One turn of the loop in a browser (the script that first loads the page counts as a task too):

```text
while (the page is open) {
  1. take ONE task from the task queue and run it to the end
       (a timer callback, a click handler, a message from a worker ...)
  2. run EVERY microtask in the microtask queue, including ones added meanwhile
       (promise .then callbacks, the code after an await, queueMicrotask)
  3. if it is time for a new frame, update the screen
       (requestAnimationFrame callbacks, then style, layout and paint)
}
```

**Where rendering happens:** after a task *and all of its microtasks* have finished, and only if a frame is due. Rendering is a step of the loop, not a task waiting in a queue.

There are **two queues**, and that is the detail interviewers ask about:

| Queue | What goes in it | How much runs per turn |
|---|---|---|
| **Task queue** (also called the macrotask queue) | `setTimeout`, `setInterval`, UI events, network callbacks, `postMessage` | **one** task |
| **Microtask queue** | promise callbacks, code after `await`, `queueMicrotask`, `MutationObserver` | **all** of them, until it is empty |

So promise callbacks always run before the next timer, even a timer with a delay of 0:

```js
console.log('1. synchronous');
setTimeout(() => console.log('4. timer (a task)'), 0);
Promise.resolve().then(() => console.log('3. promise callback (a microtask)'));
console.log('2. still synchronous');
```

```text
1. synchronous
2. still synchronous
3. promise callback (a microtask)
4. timer (a task)
```

Lines 1 and 2 are the running task; only when it ends is the stack empty. Step 2 then runs every microtask (line 3), and only the next turn takes the timer task (line 4).

**Three consequences worth remembering:**

- **Nothing interrupts a running function.** A timer or click waits until the stack is empty (§1.4's demo), which is why long functions freeze the page.
- **The screen only updates between tasks.** Change the DOM ten times in one function and the browser paints once, after the task and its microtasks. If a task never ends, it never paints. `requestAnimationFrame` callbacks run just before that paint, which is why animations use them.
- **Microtasks can starve the page.** The microtask queue is drained completely, so promises that keep queueing more promises delay rendering and every timer until they stop.

Node.js has an event loop too, run by libuv, with extra queues: `process.nextTick` callbacks run before promise microtasks, and `setImmediate` runs in its own phase after I/O. §11 is a one-screen recap; the [interview](/javascript/interview-questions) and [tricky](/javascript/tricky-questions) questions have ordering puzzles to practise on.

---

### 1.7 Web Workers and Worker Threads — Real Parallelism

A worker is a **second JavaScript thread** with its own call stack, memory and event loop, so heavy work can run there without freezing the page. It cannot touch the page, and it talks to the main thread only by messages, like a helper in another room who swaps notes with you.

**Why you need one.** A 2-second function on the main thread freezes clicks, scrolling and painting for 2 seconds, and promises do not help (they change *when* code runs, not *where*). A worker is the only way to run JavaScript elsewhere.

| Ability | Main thread | Worker |
|---|---|---|
| Can use the DOM (`document`, elements) | yes | **no** |
| Has `window` | yes | no (it has `self`) |
| Can use `fetch`, timers, `IndexedDB` | yes | yes |
| Shares variables with the other thread | no | no |
| How they talk | `postMessage` and a `message` event | same |

**The basic shape** (two files, so it is shown as text rather than as a runnable block):

```text
// main.js
const worker = new Worker('worker.js');

worker.onmessage = (event) => {
  console.log('result from worker:', event.data);
};

worker.postMessage({ numbers: [1, 2, 3, 4] });   // send the job
// the page stays responsive while the worker is busy

// worker.js
self.onmessage = (event) => {
  const total = event.data.numbers.reduce((sum, n) => sum + n, 0);
  self.postMessage(total);                        // send the answer back
};
```

**Messages are copied, not shared.** `postMessage` copies the data with the *structured clone* algorithm (the one `structuredClone` uses), so neither side can change the other's data and no locks are needed, but copying a very large array takes time. For big binary data, **transfer** it instead: `worker.postMessage(buffer, [buffer])` hands over ownership with no copy, and the sender's buffer becomes empty. True shared memory (`SharedArrayBuffer` with `Atomics`) is only allowed on cross-origin-isolated pages, and it brings back the usual threading bugs.

**How a worker works.** Two separate JavaScript "worlds", each with its own event loop (§1.6), connected only by a message channel:

```text
MAIN THREAD                                   WORKER THREAD (own global `self`, heap, stack, loop; no document)
1. new Worker('worker.js')   ── starts ──▶    loads worker.js and runs its top level
2. worker.postMessage(job)   ── copy ──▶      arrives as a "message" TASK; self.onmessage runs
   (returns at once)                          3. the heavy work blocks only this thread
4. worker.onmessage (a TASK) ◀── copy ──      self.postMessage(result)
5. worker.terminate() (or self.close() inside) ends the thread and frees its memory
```

The worker script is its own file (or a Blob URL) with a fresh global scope. A worker keeps its thread and memory until terminated, so reuse one for many jobs; starting a thread takes a few milliseconds.

**When to use a worker:** CPU-heavy work over roughly 50 ms: parsing or searching a big file, image and video processing, compression, encryption, heavy data transforms. **When it does NOT help:** network requests (`fetch` already waits outside your thread), updating the page (a worker has no DOM), and small jobs (for a 5 ms task, the start-up and copying cost more than the work).

**The kinds of worker, which interviewers like to mix up:**

| Kind | What it is for |
|---|---|
| **Dedicated Web Worker** | background computation for one page. This is the usual answer |
| **Shared Worker** | one worker shared by several tabs of the same site |
| **Service Worker** | a network proxy for offline support, caching and push notifications, *not* for heavy computation (Browser APIs Q11) |
| **Node `worker_threads`** | the same idea on the server: CPU work off the main thread so the server keeps answering requests (Node.js Q12) |

In Node, `require('node:worker_threads')` gives the same model: `new Worker(file, { workerData })` on the main thread, `parentPort.postMessage(result)` inside the worker.

**A real example:** this app's Code Playground runs plain JavaScript in a Web Worker. If your code gets stuck in `while (true) {}`, only the worker is stuck, and after 3 seconds the playground calls `worker.terminate()`. On the main thread, the same loop would freeze the tab for good.

---

### 1.8 Why JavaScript Is Everywhere

**Short answer:** JavaScript is the **only programming language every web browser runs natively**, so everyone who builds for the web knows it. Node.js then took it to servers, and the ecosystem, tools and jobs kept feeding each other. In Stack Overflow's 2025 developer survey it was again the most-used language, by **66%** of respondents, a position it has held for well over a decade.

**Why the browser matters so much.** Every browser on every device ships a JavaScript engine, and no other language can be sent to a browser and expected to run everywhere. (WebAssembly runs compiled languages in browsers too, but it still needs JavaScript to reach the DOM.) JavaScript did not win a contest between languages; it was the only entrant.

**How it got here, briefly:**

| When | What happened |
|---|---|
| 1995 | Brendan Eich writes it at Netscape in about ten days; it is named after Java for marketing, though the languages are unrelated |
| 1997 | standardised as **ECMAScript** (ECMA-262): one language across browsers |
| 2004–2005 | Gmail and Google Maps (**Ajax**) show a page can feel like an app |
| 2008 | Chrome's **V8** compiles JavaScript to machine code (§1.1), fast enough for serious work |
| 2009–2010 | **Node.js** runs V8 on servers; **npm** follows |
| 2012 onwards | **TypeScript** adds static types, making large codebases manageable |
| 2015 | **ES2015** (ES6): classes, modules, arrows, promises, `let`/`const`; a new edition every year since |

A good answer gives both sides:

| Why teams keep choosing it | The honest downsides |
|---|---|
| **One language across the stack**: browser, server (Node.js, Deno, Bun), mobile (React Native), desktop (Electron) and edge | **Quirks from 1995 that can never be removed** (`==` coercion, `typeof null`, call-site `this`); linters and `===` cover most |
| **The largest package ecosystem** (npm) | **Dynamic typing hurts large codebases**, which is why TypeScript is now the default |
| **Nothing to install**: every browser has a console | **One thread for your code** (§1.4): CPU-heavy work needs workers |
| **It never breaks old websites**, and TC39 adds a few features every year | **Ecosystem churn and supply-chain risk** from hundreds of dependencies |
| **Fast enough**: JIT engines (§1.1) and non-blocking I/O (§1.5) | |

---

## 2. Data Types

### 2.1 Primitive Types (7)

**A primitive is a single, immutable value; everything else is an object.** No operation changes a primitive in place (`str.toUpperCase()` returns a new string), so after `let b = a`, changing `b` can never affect `a`. There are exactly seven primitive types:

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

**A variable holding an object holds a reference to it, not a copy.** Arrays, functions, dates, maps and sets are all objects. So `const b = a` gives two names for one object, and `{} === {}` is `false` because `===` on objects compares identity, not contents. This explains most "why did my original change?" bugs, including shallow copies with spread.

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

`typeof` returns a string naming a value's type, with two traps. `typeof null` is `'object'`, a bug from the first implementation that can never be fixed, so check `value === null`. And `typeof []` is `'object'`; use `Array.isArray(value)`.

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

When an operator gets a type it did not expect, JavaScript silently converts the value (implicit coercion). `+` prefers strings, joining if either side is a string (`'5' + 3` is `'53'`); the other arithmetic operators convert both sides to numbers (`'5' - 3` is `2`). `==` converts before comparing and `===` never does, which is why `===` is the safe default.

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

`var` is function-scoped and was the only option before ES6. `let` and `const` are block-scoped: use `const` by default and `let` only when you need to reassign.

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

Hoisting is why some names can be used before the line that declares them. Nothing is moved: the engine sets up every declaration before the scope runs, which is the creation phase explained in [§1.2](#12-execution-context-and-the-call-stack). Functions are ready, `var` is `undefined`, and `let`/`const` throw until their line runs (the Temporal Dead Zone, TDZ).

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

Declarations are hoisted complete; expressions follow their variable's hoisting rules (§3.2). Naming an expression helps recursion and stack traces.

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

Arrow functions are a concise syntax with real behavioural differences: they have no own `this`, `arguments` or `prototype`, and cannot be used with `new`. Because an arrow takes `this` from the code around it, it is ideal for a callback *inside* a method, such as `setTimeout(() => this.save())`. For the same reason, do not write an object's method itself as an arrow: it would take `this` from outside the object (§4.3).

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
```

### 4.3 this Keyword

`this` depends on how a function is called, not where it is defined (arrows excepted: they inherit it). The four binding rules are default, implicit (method call), explicit (`call`/`apply`/`bind`) and `new`.

```js
// Top level: depends on how the file is loaded (see the rule below)
console.log(this);

// Regular function - `this` depends on HOW it's called
const obj = {
  name: 'Alice',
  greet() {
    console.log(this.name);       // 'Alice' (called as method)
  },
};
obj.greet();                      // 'Alice'

const fn = obj.greet;
fn();                             // no receiver — see below

// Arrow function - `this` is lexically bound (where it was DEFINED)
const obj2 = {
  name: 'Bob',
  greet: () => {
    console.log(this.name);       // the TOP-LEVEL this, not obj2
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

**Top-level `this` follows one rule, set by how the file is loaded:**

| How the code is loaded | Top-level `this` |
|---|---|
| ES module (`<script type="module">`, `.mjs`) | `undefined` |
| Classic browser `<script>` | `window` |
| Node CommonJS (`.cjs`, or `.js` without `"type": "module"`) | `module.exports` (starts as `{}`) |

`'use strict'` does **not** change top-level `this`; it changes what a function called with no receiver gets.

**Why detaching a method loses `this`.** `obj.greet` is just a function; the binding is not stored on it. `this` is decided by the **call site**: `obj.greet()` supplies a receiver, `fn()` supplies none. In sloppy code a missing receiver falls back to the global object, so in a classic browser script `this.name` reads `window.name`, which **exists and is an empty string** (a blank line, not `undefined`), and in Node CommonJS it prints `undefined`. In strict code, which includes every ES module, `this` is `undefined` and the line throws a `TypeError`.

The arrow `obj2.greet` takes the top-level `this` from the table: in a classic browser script it prints `''` (`window.name`), in CommonJS `undefined` (`module.exports.name`), and in an ES module it throws a `TypeError`.

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

**`call` vs `apply` is only the argument shape** (**a**pply takes an **a**rray). Spread has made `apply` largely redundant (`fn(...args)`); its remaining use is forwarding an unknown argument list in a wrapper or polyfill: `fn.apply(this, args)`.

**`bind` is the one that behaves differently**, and it is what interviews probe:

- **It returns a new function** rather than calling anything. `addEventListener('click', this.handle.bind(this))` is right; adding `()` after `bind(this)` registers the *result* of calling it.
- **The binding is permanent.** `bound.call(other)` ignores `other`.
- **It supports partial application.** Arguments passed to `bind` are prepended to whatever the caller passes later.
- **`new` beats it.** Calling a bound function with `new` ignores the bound `this` (pre-filled arguments still apply), which a `bind` polyfill has to reproduce.
- **Each call creates a new function**, so `this.handle.bind(this)` in a render defeats `React.memo` and makes `removeEventListener` fail silently. That is why class components bound in the constructor.

**When the arrow is the better answer.** An arrow inherits `this` from the enclosing scope, so `setTimeout(() => this.tick(), 100)` needs no binding. `bind` earns its place for a *reusable* bound reference (adding and later removing the same listener) or partial application. The playground's **Function.bind** and **Function.call & apply** polyfill templates implement all three.

### 4.4 Default Parameters, Rest, Spread

Default parameters provide fallback values, rest parameters (`...args`) collect the remaining arguments into an array, and spread (`...`) expands an array or object into its elements.

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

A higher-order function takes a function as an argument or returns one, which works because functions are values (§1.3). `map` owns the loop and you pass only what changes; returning a function fixes settings once, as `multiplier(2)` does below.

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

A variable is looked up in the current scope, then outward through each enclosing scope up to the global scope. That lookup path is the scope chain.

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

**Reading that example precisely**, because "remembers its outer scope" is the definition, not the mechanism:

- **The closures** are `increment`, `decrement` and `getCount`: each is defined inside `createCounter` and carries a reference to the scope it was born in. `createCounter` is the factory, not a closure.
- **They access `count` itself, not a copy** (the binding). That is why `increment` and `getCount` agree: there is exactly one `count`.
- **The outer function has already returned.** `const counter = createCounter()` runs and returns `createCounter`; its call frame is gone from the stack before `counter.increment()` is ever called.

**`count` survives because of reachability.** It lives in a variable environment on the heap, not on the stack. The returned object holds three functions, each holding a reference to that environment, so as long as `counter` is reachable, so is `count`. Garbage collection frees only what cannot be reached.

```
counter ──▶ { increment, decrement, getCount }
                 │          │          │
                 └──────────┴──────────┴──▶ [ scope of createCounter: count = 2 ]
```

**The consequences, which are what interviews actually probe:**

- **`count` is private.** `counter.count` is `undefined`, and no other code can reach the variable. This is the module pattern, JavaScript's private state for twenty years before `#private` fields.
- **Each call to `createCounter()` makes a new environment**, so two counters are independent. That is the difference between a closure and a global.
- **This is also the leak.** The reachability that keeps `count` alive keeps alive what the closures use from that scope; hold one of these functions on a global listener and it is pinned (the [interview questions](/javascript/interview-questions) cover closure leaks).

Compared with §5.1, where `inner` read outward while `outer` was still running, here the inner functions outlive their creator and the chain still holds. That is what makes it a closure rather than merely nested scope.

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

Two facts combine, and most answers only give the first.

**One binding, not three.** `var` is scoped to the enclosing *function*, so all three iterations share a single `i`, and the three arrows capture **the same binding** (as `increment` and `getCount` shared one `count` in §5.2).

**The callbacks run after the loop has finished.** `setTimeout` schedules a task that cannot run until the synchronous loop is done, which leaves `i` at `3`, the value that failed `i < 3`. The delay is a red herring: with `0` it still prints `3, 3, 3`.

#### How `let` fixes it

`let` in a `for` header has an unusual rule: the spec creates a **fresh binding for every iteration** and copies the previous value into it before the update runs. So each arrow captures a *different* binding. The callbacks still run later and still capture a binding rather than a value; there are just three bindings now. (`let` also does not leak out of the loop, and `const` works in `for...of`/`for...in` but not in a classic `for` header, where `i++` would assign to a constant.)

#### How the IIFE fixes it

Before `let`, this was the only fix. The immediately-invoked function creates a **new function scope per iteration**, and passing `i` *as an argument* copies its current value into a new parameter `j`, which nothing mutates. An IIFE that closed over `i` without taking it as a parameter would fix nothing.

```js
// A third fix worth knowing — setTimeout forwards extra arguments to the callback,
// which snapshots the value the same way the IIFE's parameter does.
for (var k = 0; k < 3; k++) {
  setTimeout(console.log, 0, k);      // 0, 1, 2
}
```

**The unifying idea:** a closure captures a *binding*, never a value, so every fix arranges a separate binding per iteration.

---

### 5.4 Closures in the Wild

You use closures every day, usually without naming them. Each example notes **what was captured**, because that is what makes it a closure rather than an ordinary function.

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

Two loggers, two independent environments. This is why libraries hand you `createClient(config)` rather than making you pass the config to every call.

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

A local variable of the returned function would be recreated on every call, and module scope would share one cache across every memoized function. The closure has exactly the right lifetime: one per `memoize()` call.

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

`timerId` must persist *between* calls and be private to this debounced function; a module-level variable would make two debounced functions cancel each other. Throttle is the same shape with a flag instead of a timer (§14.4).

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

`token` is not "private by convention" like a `_token` property; it is private by **reachability**. No other code holds a reference to it, so no other code can read or write it. It is hidden from other code, though not from DevTools, which shows closure variables under the function's `[[Scopes]]`.

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

This is §5.3's gotcha in its fixed form: each per-row handler carries its own row.

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

The callback faithfully reports the render that created it: the React bug where an effect with `[]` deps keeps reading the first render's props. Fixes: add the value to the deps, read through a ref (a *box*, not a value), or use functional `setState`.

**The through-line:** a closure is the right tool whenever state must outlive a call but stay private to one instance.

## 6. Objects and Prototypes

### 6.1 Object Creation

The four ways to create an object differ in where shared methods live: an **object literal** (methods on that one object), **`Object.create(proto)`** (you choose the prototype; `null` for none), a **constructor function + `new`** (methods on `User.prototype`, shared by every instance), and **`class`**, syntactic sugar for the constructor version and what you write today for many instances.

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

Objects inherit directly from other objects through an internal `[[Prototype]]` link. When a property is not found on an object, the engine walks up the prototype chain until it finds it or reaches `null`.

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

`Object`'s static methods cover iteration (`keys`, `values`, `entries`), merging (`assign`) and immutability (`freeze`, `seal`).

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

**`keys`/`values`/`entries` are *own*, *enumerable* and *string-keyed***, and each qualifier excludes something:

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

**`Object.assign` mutates and returns its first argument**, so `Object.assign({}, a, b)` is the non-mutating merge. It is **shallow** and *triggers setters* on the target, which is where it differs from spread.

**`Object.freeze` is shallow, and silent by default.** Assigning to a frozen property fails quietly in sloppy mode and throws only in strict code (modules and class bodies included). Deep immutability means recursing yourself:

```js
const config = Object.freeze({ api: { url: 'https://a.example' } });
config.api.url = 'https://b.example';       // allowed — `api` was never frozen
console.log(config.api.url);                 // 'https://b.example'
```

**`defineProperty`'s descriptor flags** (`writable`, `enumerable`, `configurable`) all default to **`false`**, unlike a normal assignment where all three are `true`.

### 6.4 Destructuring

Destructuring unpacks object properties and array elements into variables, with defaults, renaming, nesting and rest patterns.

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

Non-mutating methods return a new array or value and leave the original alone, which is why React and functional code prefer them.

```js
const nums = [1, 2, 3, 4, 5];

nums.map(n => n * 2);                 // [2, 4, 6, 8, 10]
nums.filter(n => n > 3);              // [4, 5]
nums.reduce((sum, n) => sum + n, 0);  // 15
nums.find(n => n > 3);                // 4
nums.findIndex(n => n > 3);           // 3
nums.some(n => n > 4);                // true
nums.every(n => n > 0);               // true
nums.includes(3);                      // true
[1, [2, [3]]].flat(Infinity);         // [1, 2, 3]
[1, 2].flatMap(n => [n, n * 2]);      // [1, 2, 2, 4]
nums.slice(1, 3);                      // [2, 3]
[1, 2].concat([3, 4]);                // [1, 2, 3, 4]
[10, 20, 30].at(0);                   // 10
[10, 20, 30].at(-1);                  // 30  (cleaner than arr[arr.length - 1])
[1, 5, 3, 5, 7].findLast(n => n === 5);       // 5  (last match)
[1, 5, 3, 5, 7].findLastIndex(n => n === 5);  // 3  (last match's index)
Array.from('abc');                    // ['a', 'b', 'c']
Array.from({ length: 3 }, (_, i) => i * 2);  // [0, 2, 4]
```

**ES2023 immutable array methods** (`toSorted`, `toReversed`, `toSpliced`, `with`) return *new* arrays. An inline `arr.sort()`, which mutates, is a classic React/Redux mutation bug; `arr.toSorted()` fixes it:

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

That shape is why `['1','7','11'].map(parseInt)` famously returns `[1, NaN, 3]`: the second parameter, the index, becomes `parseInt(string, radix)`'s radix (`parseInt('7', 1)` is `NaN`; `parseInt('11', 2)` is `3`).

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

**`reduce`'s `initialValue` is the parameter that matters.** Omit it and the first element becomes the accumulator, the callback starts at index 1, and **an empty array throws `TypeError`**; pass it and the callback runs for every element.

```js
console.log([1, 2, 3].reduce((a, b) => a + b));      // 6  — starts at index 1
console.log([].reduce((a, b) => a + b, 0));          // 0  — safe
// [].reduce((a, b) => a + b);                        // TypeError: Reduce of empty array
```

### 7.2 Array Methods (Mutating)

Mutating methods change the array in place. React and Redux detect change by reference, so `items.push(x); setItems(items)` looks like "nothing changed" and the screen does not update. Copy first (`[...items, x]`), or use the non-mutating versions in §7.1.

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

The comparator returns a **number**, not a boolean: negative keeps `a` first, positive puts `b` first, `0` means equal. Returning `true`/`false` gives a subtly wrong order.

**`fill` with an object shares one reference**, which is the array equivalent of the shallow-copy trap:

```js
const grid = new Array(3).fill([]);   // all three slots are the SAME array
grid[0].push('x');
console.log(grid);                     // [['x'], ['x'], ['x']]
// Use Array.from({ length: 3 }, () => []) for three distinct arrays.
```

### 7.3 Iteration

`for...of` iterates the values of any iterable (arrays, strings, Maps, Sets), `for...in` iterates enumerable property keys (for objects), and `forEach` is an array method you cannot break out of.

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

**`forEach` returns `undefined`**: it is for side effects only, so if you want a result, `map`/`filter`/`reduce` was the right call. **Two things it cannot do**, the usual reasons to prefer `for...of`:

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

Use `for...of` with `await` for sequential work, `await Promise.all(arr.map(fn))` for parallel.

**`for...in` is for objects, and even then needs care.** It walks the prototype chain and yields **string** keys, so on an array you get `'0'`, `'1'`, not numbers:

```js
const arr = ['a', 'b'];
for (const i in arr) console.log(typeof i, i);   // string 0, string 1

Array.prototype.custom = 'oops';                  // anything on the prototype
for (const i in arr) console.log(i);              // 0, 1, custom  ← inherited
delete Array.prototype.custom;
```

Guard with `Object.hasOwn(obj, key)`, or prefer `Object.keys`/`Object.entries`, which are own-only.

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

Callbacks were the original async pattern: you pass a function to be called when the work is done. Nested callbacks become "callback hell", hard to read and to handle errors in.

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

A promise represents a value that may not be available yet, in one of three states: pending, fulfilled or rejected. Promises chain with `.then()` and combine with `Promise.all` and friends for concurrent work.

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

`async`/`await` is syntactic sugar over promises. An `async` function always returns a promise, and `await` pauses *that function* until the promise settles; the thread is not blocked, and the function resumes later as a microtask (§8.4). The win is readability, with ordinary `try`/`catch` for errors.

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
```

### 8.4 Microtasks vs Macrotasks

**Promise callbacks run before timers, even a 0 ms timer.** Microtasks (promise callbacks, code after `await`, `queueMicrotask`) are drained completely after each macrotask (`setTimeout`, I/O, UI events). The full explanation is [§1.6 What Is the Event Loop?](#16-what-is-the-event-loop); the short version:

```js
console.log('1');                           // synchronous

setTimeout(() => console.log('2'), 0);      // macrotask

Promise.resolve().then(() => console.log('3')); // microtask

console.log('4');                           // synchronous

// Output: 1, 4, 3, 2
```

---

### 8.5 Mixing `async`/`await` with `.then()`/`.catch()`

They're the same mechanism (`await` consumes a promise, `.then()` chains one), so mixing them is legal, and it is where many real bugs live.

**The forgotten `await`** is the most common. Calling an `async` function without `await` starts the work and moves on:

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
// ✗ Both a .catch() AND a try/catch — the .catch() handler "handles" it,
//   so the await resolves with null and the catch block is never entered
try {
  const data = await fetch(url).then(r => r.json()).catch(() => null);
  process(data);               // data is null, not an error — silently wrong
} catch (e) { /* unreachable */ }
```

`.catch()` returning a value **converts a rejection into a resolution**, so the `try`/`catch` is dead code and the caller must check for the sentinel. Pick one style per call site.

**Awaiting each call in turn runs independent work one after another:**

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

Three more rules that come up:

- **`await` in a loop is sequential.** `for (const id of ids) await fetch(id)` makes N requests in turn. Use `Promise.all(ids.map(fetch))` for parallel, or a bounded pool (§8.7) when N is large.
- **`.forEach` with an `async` callback doesn't wait** (§7.3).
- **`return await` vs `return`.** Inside a `try` block, `return await p` catches `p`'s rejection locally, while `return p` hands the promise to the caller and your `catch` never sees it. Outside a `try` they're equivalent.

---

### 8.6 Top-Level `await`

In an **ES module** (ES2022), `await` works at the top level, outside any function:

```js
// config.js — an ES module
const res = await fetch('/config.json');
export const config = await res.json();
```

A module containing top-level `await` becomes an **async module**: every module that imports it waits for it to finish evaluating before its own body runs. The `await` doesn't block the thread; it blocks the *module graph* beneath it. Three useful patterns:

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

- **ES modules only.** Not in CommonJS or a classic `<script>`; elsewhere it is a syntax error.
- **`require()` of a module with top-level `await` throws**, even on Node 24 where `require(esm)` otherwise works, because `require` is synchronous by contract. Use `await import()`.
- **It can delay your whole app.** A slow top-level `await` in a widely imported module blocks every importer, with no obvious place for a timeout or loading state. Keep it for required, fast startup work.

---

### 8.7 Retrying, Cancelling and Bounding Async Work

Three "implement this" patterns: **retry** a temporary failure, **cancel** unwanted work, and **bound** how many calls run at once. Each ends with what the simple version still gets wrong, which is where interviewers push.

**Retry with exponential back-off and jitter:**

**The problem.** Some failures are **permanent** (a 404, a 401, a malformed body) and will fail identically forever. Others are **transient** (a server restarting, a rate limit, a dropped connection) and would succeed a second later. Retry is for the second kind, so the code's first job is to tell them apart. Naive retrying also makes an overloaded service worse, so each wait gets longer (the "back-off") and each client waits a *different* amount (the "jitter").

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

So `retries = 3` means **three retries and four total calls**.

**Three lines that are not obvious:**

- **`for (let attempt = 0; ; attempt++)`**: the empty condition makes an intentional infinite loop that exits only by returning or throwing. With `attempt < retries` in the header, the loop falls out after the last failure and returns `undefined`, and the final error vanishes.
- **`return await fn()`**: without the `await`, the promise is returned immediately, the `try` ends, and a later rejection never reaches the `catch`, so the retry never fires (§8.5).
- **`if (attempt >= retries || !isRetryable(err)) throw err`**: decide to give up *before* sleeping, and rethrow the **original** error so the caller sees the real failure.

**Jitter is the part people skip.** If a thousand clients fail at the same instant and all wait exactly 300 ms, they all retry at the same instant: a synchronised wave that knocks the server over again, repeating in lockstep.

`Math.random() * delay` breaks the lockstep: each client picks a random point in `[0, delay)`, and the window widens as `delay` grows. **Equal jitter** (`delay/2 + Math.random() * delay/2`) keeps a floor under the wait but spreads clients over only half the window; AWS's architecture blog recommends **full jitter** as the default.

**What is still missing, which is where an interviewer will dig:**

- **No idempotency safeguard, the serious one.** Retrying a `POST` that charges a card can charge twice when the request *succeeded* but the response was lost. The server can only tell it is a retry if you send an **idempotency key** (the Stripe guide is built around this).
- **No cancellation.** The component unmounts and the retry still fires later. Thread an `AbortSignal` through `fn()` and the sleep (the next pattern).
- **It ignores `Retry-After`.** A 429 or 503 often says exactly how long to wait; prefer it to your guess.
- **The cap is necessary.** Without `maxDelay`, `retries = 10` reaches `300 × 2⁹` ≈ **154 seconds** for one wait.

**Cancellation with `AbortController`:**

**The problem.** The user navigated away, typed another character, or the request is taking too long. A promise is a *notification* that something finished, not a handle on the work, so nothing about it lets you stop the work; `Promise.race` only stops you *waiting*. Ignoring the result is not enough either:

the connection stays open (HTTP/1.1 allows about six per origin), bytes keep arriving (data and battery on mobile), and a slow *earlier* response can land after a fast later one and overwrite it, the bug where a search box shows results for a query the user already replaced. Cancelling removes all three at the source.

**`AbortController`** is the platform's general-purpose **cancellation primitive**, not a `fetch` feature, and it is deliberately two objects:

| Half | Who holds it | What it can do |
|---|---|---|
| `controller` | the code that *starts* the work | `controller.abort(reason?)` — the only way to cancel |
| `controller.signal` | handed to whoever *does* the work | observe only: `aborted`, `reason`, an `abort` event |

You can pass the signal to a library or untrusted code and it can react to cancellation without being able to *cause* it, and one controller can feed many operations. An `AbortSignal` is an `EventTarget`:

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
| `signal.aborted` / `signal.reason` | whether it fired, and why (default reason: an `AbortError` `DOMException`) |
| `signal.throwIfAborted()` | "bail out now if we were cancelled" |
| `signal.addEventListener('abort', fn)` | react to cancellation: close a socket, reject a pending promise |
| `AbortSignal.timeout(ms)` | a signal that aborts itself; its reason is a `TimeoutError` |
| `AbortSignal.any([a, b])` | aborts when **any** input does (a user cancel or a timeout) |

**With `fetch`.** This hits a real endpoint, so **Try it** runs every case for real:

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

  // 3. The happy path, for contrast — no signal, so it runs to completion.
  const user1 = await load();
  console.log('3. succeeded →', user1.name);
})();
```

**The detail to take away: a timeout is a `TimeoutError`, not an `AbortError`.** Both are `DOMException`s, so code that checks only `err.name === 'AbortError'` treats a timeout as a genuine failure:

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

**Your own functions can honour a signal too**, which is what "make it cancellable" means:

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

That is the missing piece in the retry above: give `sleep` a signal and a long back-off becomes interruptible.

**The trick worth stealing:** `addEventListener` takes a signal, so one `abort()` removes any number of listeners, with no need to keep the original function references (in React, a one-line effect cleanup).

```js
const ac = new AbortController();
window.addEventListener('resize', onResize, { signal: ac.signal });
window.addEventListener('scroll', onScroll, { signal: ac.signal });
ac.abort();     // both listeners removed at once
```

A fetch with a hand-rolled timeout puts the pieces together:

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

`fetch` has no timeout option, so the `setTimeout` adds one (with `AbortSignal.timeout(5000)` instead, check for `TimeoutError` too). The abort lands in the same `catch` as a network failure, so the name is the only way to tell them apart, and `finally` clears the timer so a fast request does not leave it armed (in Node, that keeps the process alive).

**`AbortController` vs `Promise.race` for a timeout:**

| Aspect | `Promise.race([fetch, timer])` | `AbortController` |
|---|---|---|
| You stop waiting | yes | yes |
| The request stops | **no, it runs to completion and spends bandwidth** | yes, the connection is torn down |
| Composability | one race per call site | one signal, passed to many calls |

`race` solves the symptom (your code moves on) while leaving the cause running, so `AbortSignal.timeout(ms)` is the better answer to "add a timeout to this fetch".

**What is still missing here:**

- **The signal is not threaded down.** A nested fetch, retry loop or worker needs the same signal, or cancelling leaves it running.
- **Nothing tells the user.** A user-initiated cancel usually wants a distinct "cancelled" outcome, not a silent `null`.
- **An aborted request may still have reached the server.** Abort stops *you* listening; it does not undo a committed mutation (the idempotency point again).

**Always distinguish an abort (and a timeout) from a real error**, or a user navigating away logs as a failure.

**Bounded concurrency**: the "throttle promises" pattern.

**The problem.** `Promise.all(urls.map(fetch))` is fine for ten URLs. For a thousand it attacks your own infrastructure: a thousand requests at once, most queued by the browser anyway (six per origin on HTTP/1.1), a server spike, tripped rate limits, and every result held in memory. You want **N in flight at all times**: start N, and each time one finishes, start the next:

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

**Reading it line by line:**

- **`let i = 0`** is a shared cursor: every runner reads and advances the same `i`, so they cooperate instead of each processing the whole list.
- **`Array.from({ length: limit }, async () => …)`** creates `limit` runners and **starts them immediately**, since an `async` function runs synchronously up to its first `await`.
- **`const idx = i++`** is the claim. It is safe without a lock because there is no `await` between the read and the write, so two runners can never take the same index. Splitting it into `const idx = i; await …; i++;` would break that.
- **`while (i < items.length)`**: whoever is free takes the next item, which makes it a *pool* rather than a fixed partition.
- **`results[idx] = await worker(...)`**: writing by index preserves input order; pushing would give completion order.

With 8 items, a limit of 3 and workers that finish out of order, the peak in flight is exactly 3 and the output is in **input** order, `[10, 20, 30, 40, 50, 60, 70, 80]`.

**Why not just chunk the array?** Every batch runs at the speed of its **slowest** member while the other workers sit idle; a pool's free worker takes the next item at once. With nine items where each group of three holds one 60 ms item and two 5 ms items, a pool of 3 finishes in about **76 ms** and fixed batches of 3 take about **182 ms**.

**What is still missing here:**

- **One rejection sinks the batch.** `Promise.all(runners)` rejects on the first failure while the other runners keep going. Catch inside `worker`, or collect `{ status, value }` per item.
- **No cancellation, again.** A signal checked at the top of the `while` would let it stop early.
- **`limit` is a guess.** It depends on what you are bounding: connections per origin, an API's rate limit, database connections.

Related combinators: `Promise.allSettled` for every result regardless of failures, `Promise.any` for a first-success race across mirrors.

---

## 9. ES6+ and Modern JavaScript

### 9.1 Template Literals

Template literals use backticks; they interpolate any expression with `${...}` and span lines without `\n`. A **tagged template** puts a function in front of the backtick: it receives the literal text pieces as an array and the `${}` values as arguments, and decides how to join them, which is how libraries escape values for HTML or SQL.

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

Optional chaining (`?.`) stops and returns `undefined` at the first `null`/`undefined` in a chain. Nullish coalescing (`??`) falls back only on `null` or `undefined`, unlike `||`, which also replaces `0` and `''`.

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

`Map` allows any type as a key (a plain object turns every key into a string), and `Set` stores each value once. The `Weak` versions exist to attach data to an object without keeping it alive: a `Map` entry holds its key strongly, so the key can never be garbage collected while the map exists, whereas a `WeakMap` entry disappears when nothing else points at its key. The price is no `size` and no iteration, because entries can vanish at any moment.

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

Any object with a `Symbol.iterator` method is iterable and works with `for...of`, spread and destructuring. Generator functions (`function*`) are the easy way to write iterators, producing values lazily with `yield`.

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

`Proxy` intercepts fundamental operations on an object (property reads, writes, calls) through handler "traps". It is the mechanism behind Vue 3's reactivity (a read records who depends on a property, a write tells them to update), and it gives validation, logging and defaults without changing the calling code. `Reflect` has one method per trap that performs the normal operation, so a trap does its extra work and then calls, say, `Reflect.set(target, prop, value)`.

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

A feature's vintage answers "is that safe to use?": does it need a polyfill, a transpiler, or nothing?

| Edition | Features you are expected to know |
|---|---|
| **ES2022** | Top-level `await`, class static blocks, private fields (`#x`) + the `#x in obj` brand check, `Object.hasOwn`, `Array.prototype.at`, `Error` `cause`, RegExp `d` flag (match indices) |
| **ES2023** | `findLast` / `findLastIndex`, the immutable quartet `toSorted` / `toReversed` / `toSpliced` / `with`, hashbang grammar |
| **ES2024** | `Object.groupBy` / `Map.groupBy`, `Promise.withResolvers`, RegExp `v` flag (set notation), `ArrayBuffer.prototype.transfer` |
| **ES2025** | Iterator helpers, Set methods (`union`, `intersection`, …), `Promise.try`, `RegExp.escape`, `Float16Array`, duplicate named capture groups, import attributes (`with { type: 'json' }`) |
| **ES2026** | `Array.fromAsync`, `Error.isError`, `Math.sumPrecise`, `Uint8Array` base64/hex, iterator sequencing (`Iterator.concat`), `Map` upsert (`getOrInsert`), `JSON.parse` source text access (`JSON.rawJSON`) |
| **ES2027** | **Temporal**, explicit resource management (`using` / `await using`), both finished after the ES2026 snapshot was cut |

Everything through ES2024 is available in every current browser and in Node 22+, so it needs no build step. Check ES2025 and later against your minimum target. `using` is *syntax*, not a new method, so a target without it cannot be polyfilled: it runs natively in Chrome 134+, Firefox 141+ and Node 24+, has no support in stable Safari, and needs TypeScript 5.2+ or another transpiler for older targets.

---

### 9.7 Grouping and the New Set Methods

`Object.groupBy` and `Map.groupBy` (ES2024) give JavaScript the `groupBy` utility libraries have shipped for a decade. Both take an iterable and a callback that returns each item's key.

```js
const people = [
  { name: 'Alice', dept: 'eng' },
  { name: 'Bob',   dept: 'sales' },
  { name: 'Cara',  dept: 'eng' },
];

Object.groupBy(people, p => p.dept);
// { eng: [{Alice}, {Cara}], sales: [{Bob}] }
```

`Object.groupBy` coerces every key to a **string** and returns a `null`-prototype object; `Map.groupBy` keeps each key's type, so you can group by an object or a number without collisions:

```js
// Object.groupBy stringifies keys — 1 and '1' collide
Object.groupBy([1, '1'], x => x);        // { '1': [1, '1'] }

// Map.groupBy preserves key identity — no collision
Map.groupBy([1, '1'], x => x);           // Map { 1 => [1], '1' => ['1'] }
```

Reach for `Map.groupBy` whenever the key is not already a string. The `null` prototype is deliberate: a group named `"toString"` or `"__proto__"` cannot shadow or corrupt anything. It also means no `.hasOwnProperty`, so use `Object.hasOwn(result, key)` or `in`.

**Set methods (ES2025)** replace the spread-and-filter dance: four return a new `Set`, three return a boolean.

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

Two details interviewers probe. These methods are **non-mutating**: `a.union(b)` leaves `a` alone. And the argument only needs to be *set-like* (a numeric `size`, plus `has` and `keys` methods), so `mySet.intersection(myMap)` works and compares against the Map's **keys**.

---

### 9.8 Iterator Helpers — Lazy Array Methods for Anything Iterable

Before ES2025, `.map` and `.filter` lived only on arrays, so a generator, `Map`, `Set` or `NodeList` had to be copied into an array first. Iterator helpers put those methods on `Iterator.prototype`, so they work on **any** iterator, **lazily**.

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

The full set: `map`, `filter`, `take`, `drop` and `flatMap` are lazy and return a new iterator; `reduce`, `toArray`, `forEach`, `some`, `every` and `find` are **terminal**, consuming the iterator to produce a value.

Beyond infinite sequences, laziness saves allocation: `.filter().map().slice(0, 10)` over 100,000 records builds full intermediate arrays to hand you ten items, while the iterator chain pulls only what it needs.

```js
// Array chain — allocates two full intermediate arrays
const arrResult = bigArray.filter(isActive).map(toDto).slice(0, 10);

// Iterator chain — pulls ~10 items through the pipeline and stops
const iterResult = bigArray.values().filter(isActive).map(toDto).take(10).toArray();
```

The classic gotcha: **iterators are single-use.** Once consumed, they are exhausted.

```js
const it = [1, 2, 3].values();
it.toArray();      // [1, 2, 3]
it.toArray();      // []  — already drained, not an error
```

There is no `length` and no `.sort()`: sorting is inherently eager, since the first sorted element needs every element seen.

---

### 9.9 Explicit Resource Management — `using` and `await using`

`try`/`finally` separates acquisition from cleanup by the length of the body, and nests badly once you hold three resources. Explicit resource management (ES2027) attaches cleanup to the *variable's scope* instead. A resource is any object with a `[Symbol.dispose]()` (sync) or `[Symbol.asyncDispose]()` (async) method, and when the block holding the `using` declaration exits, by return, throw, `break` or anything else, it runs automatically. (Support is in §9.6.)

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

`await using` *awaits* the disposal, for transactions and streams whose teardown is itself async:

```js
async function withTransaction(db) {
  await using tx = await db.begin();     // tx has [Symbol.asyncDispose]
  await tx.query('UPDATE …');
  await tx.commit();
  // await tx[Symbol.asyncDispose]() runs and is awaited here
}
```

Three rules that show up as interview traps:

1. **Disposal is in reverse order of declaration**, like nested `finally` blocks: `using a` then `using b` disposes `b` first.
2. **`using` bindings are implicitly `const`**, so the thing disposed is the thing acquired.
3. **`null` and `undefined` are skipped**, so `using maybe = cond ? openThing() : null;` is legal. Any *other* value without `[Symbol.dispose]` is a `TypeError` at declaration.

`DisposableStack` and `AsyncDisposableStack` handle a dynamic number of resources: `.use()` each one, and disposing the stack disposes them all in reverse:

```js
using stack = new DisposableStack();
for (const path of paths) stack.use(new FileHandle(path));
// all handles close in reverse order when the block exits
```

---

### 9.10 The Temporal API — The Replacement for `Date`

`Date` is mutable, parses inconsistently, has zero-indexed months but not days, conflates "an instant in time" with "a date on a calendar", and has no real time-zone support. `Temporal` reached Stage 4 (finished) in March 2026, too late for the ES2026 snapshot, so it is part of ES2027. It splits `Date` into several **immutable** types, each meaning exactly one thing.

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

What interviewers test is **picking the right type**, because it encodes a business decision. A hotel check-in is a `PlainDate` (the guest arrives on the 7th wherever they booked from). A meeting is a `ZonedDateTime` (one instant, rendered per attendee). A daily 9 a.m. standup is a `PlainTime` plus a zone, *not* a fixed instant; storing it as a UTC instant makes it drift by an hour twice a year with daylight saving.

Interop goes through epoch values, so migration can be incremental:

```js
const instant = legacyDate.toTemporalInstant();      // Date  → Temporal
const backToDate = new Date(instant.epochMilliseconds); // Temporal → Date
```

---

### 9.11 Smaller Modern Additions Worth Knowing

**`Promise.withResolvers` (ES2024)** removes the "deferred" boilerplate of hoisting `resolve` and `reject` out of the executor so code *outside* the promise can settle it.

```js
// Before — the awkward let-and-assign dance
let resolve, reject;
const p = new Promise((res, rej) => { resolve = res; reject = rej; });
```

```js
// After
const { promise, resolve, reject } = Promise.withResolvers();
```

It is the natural shape for wrapping event-based APIs: hand `resolve` to the `onmessage` handler and return `promise`.

**`Array.fromAsync` (ES2026)** is `Array.from` for async iterables: it drains an async generator or paginated API into an array, the one-line version of a `for await…of` loop.

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

Unlike `Promise.all`, `Array.fromAsync` **awaits each value before pulling the next**. That suits pagination, where page 2's URL comes from page 1. It does not make already-started promises run one by one, though: given an array of promises, they are all in flight already, and it simply has no fail-fast.

**`Promise.try` (ES2025)** starts a chain from a function that might throw synchronously, so a sync throw and an async rejection land in the same `.catch`:

```js
Promise.try(() => mightThrowSyncOrReturnPromise(input))
  .then(handle)
  .catch(handleBoth);        // catches both failure modes
```

**`Error.isError` (ES2026)** is a reliable cross-realm error check. `instanceof Error` fails for an error created in an iframe (a different realm with its own `Error` constructor), and duck-typing on `.stack` gives false positives on plain objects. (An error posted from a worker is structured-cloned into your realm, so `instanceof Error` does work for it.)

```js
Error.isError(new TypeError('x'));       // true
Error.isError({ name: 'Error', message: 'fake' });  // false
```

**`RegExp.escape` (ES2025)** escapes a string for use inside a regex, the fix for "user input broke my dynamic pattern":

```js
const term = 'price (USD)';
new RegExp(RegExp.escape(term), 'gi');   // matches the literal text
```

**`Object.hasOwn` (ES2022)** replaces `Object.prototype.hasOwnProperty.call(obj, key)` and works on `null`-prototype objects such as an `Object.groupBy` result.

**Class static blocks and private brand checks (ES2022).** A `static { }` block runs once at class definition with `this` bound to the class, for initialisation that needs statements. `#field in obj` asks "is this really an instance of my class?" by checking for the private field without throwing:

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

**Import attributes (ES2025)** declare how a module must be interpreted, so a server cannot smuggle in JavaScript by changing the `Content-Type`:

```js
import config from './config.json' with { type: 'json' };
const data = await import('./data.json', { with: { type: 'json' } });
```

---

## 10. Error Handling

`try`/`catch`/`finally` handles synchronous errors, and `.catch()` or `try`/`catch` around `await` handles asynchronous ones. Extend `Error` to add context such as a field name or HTTP status.

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

```

---

### 10.1 Global Error Handling — "Error Boundaries" Outside React

An uncaught error should be *observed* even where no `try`/`catch` reaches. The browser gives you four hooks, and which catches what is the interview question.

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

- **Wiring only `error`** leaves every unhandled promise rejection unreported, which in `async`-heavy code is most errors.
- **Cross-origin scripts are opaque.** Without `crossorigin="anonymous"` on the tag *and* CORS headers on the response, you get just `"Script error."`, with no message, file or line.
- **`try`/`catch` does not catch async errors** thrown after the synchronous frame exits: a throw in a `setTimeout` callback reaches window `error`; a rejection you forgot to `await` reaches `unhandledrejection`.

In **Node**, the equivalents are `process.on('uncaughtException')` and `process.on('unhandledRejection')`, and the right behaviour is to log, flush and **exit**: the process is in an undefined state, so let your supervisor restart it.

**React error boundaries** catch errors thrown **during render, in lifecycle methods and in constructors** of the tree below, and render fallback UI. They do **not** catch errors in event handlers, timers, async code or server rendering. The boundary preserves the *UI*; the global handlers catch what it structurally cannot. You need both.

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

- **`assert.rejects`** (and `assert.doesNotReject`) for expected outcomes. A hand-written `try`/`catch` easily passes when the function *doesn't* throw: the classic false-green async test.
- **Always `await` or `return` the assertion.** Otherwise the test returns before the assertion runs and passes regardless, the most common async-test bug.
- **Control the clock rather than sleeping.** `mock.timers.enable()` (or Vitest's `vi.useFakeTimers()`) advances time instantly, so a 30-second back-off test runs in a millisecond.
- **Test the observable behaviour, not the timing.** "It retried three times" is stable; "it waited 600 ms" is flaky on a loaded CI machine.

You want a framework for jsdom, snapshots, module mocking and parallel orchestration; the Testing Strategy & E2E guide covers the choice.

---

## 11. The Event Loop

A recap; the full explanation is [§1.6 What Is the Event Loop?](#16-what-is-the-event-loop). Each turn of the loop runs **one task** (a script, timer callback or event handler) to completion, then **every microtask** (promise callbacks, code after `await`, `queueMicrotask`), and then, if a frame is due, **renders** (`requestAnimationFrame` callbacks, then style, layout and paint). So rendering happens after a task and all its microtasks, never in the middle of either.

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

Promise callbacks beat a 0 ms timer, long synchronous code freezes the UI, and Node adds `process.nextTick` (before promise microtasks) and `setImmediate` (after I/O). The consequences are spelled out in §1.6.

---

## 12. Modules

### 12.1 ES Modules (ESM) — Modern Standard

ES Modules are the standard module system, supported in all modern browsers and Node.js. `import` and `export` are written at the top level with fixed names, so tools can see every import and export without running the code. That makes **tree-shaking** possible: a bundler can prove an export is never imported and drop it. CommonJS's `require()` is an ordinary function call, possibly with a computed name, so a bundler cannot be sure what is used.

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

CommonJS is Node's original module system: modules load synchronously at runtime with `require()`, and exports are assigned to `module.exports`. New projects generally prefer ES Modules.

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

The Document Object Model (DOM) is the browser's tree of objects representing the page; changing them changes the screen. The line to remember is the `innerHTML` one: assigning user input to `innerHTML` lets it run as code (XSS, cross-site scripting), while `textContent` always inserts plain text.

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

The browser computes the **propagation path** (the ancestor chain from `window` to the target) and walks it down, then back up.

```text
CAPTURING ↓  window → document → <body> → #outer → #inner → <button> (TARGET)
BUBBLING  ↑  <button> → #inner → #outer → <body> → document → window
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

**Registering for capture:** `{ capture: true }` (or the old positional `true`). The flag is **part of the listener's identity**, so `removeEventListener` needs it too.

**At the target, both kinds fire**, with the phase reported as `AT_TARGET`.

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

`currentTarget` is only valid **during** dispatch (`null` in a later callback). Use `e.target.closest('li')` to find the clicked row, since the user may have hit a nested icon.

---

### 13.2 Stopping Things — Three Different Verbs

| Method | What it stops | What it does not stop |
|---|---|---|
| `stopPropagation()` | the journey to **other elements** | other listeners on the *same* element |
| `stopImmediatePropagation()` | the journey **and** remaining listeners on this element | the default action |
| `preventDefault()` | the **browser's default action** (navigation, submit, scroll) | propagation — the event keeps travelling |

They are orthogonal, which is the exam question: `preventDefault()` on a link stops navigation but the click still bubbles; `stopPropagation()` stops the bubbling but the browser still navigates.

#### Where `preventDefault()` is used

Every use is "the browser has a built-in behaviour and I want my own":

| Scenario | The default being cancelled |
|---|---|
| Submitting a form with `fetch` | full page navigation and reload |
| A client-side router intercepting `<a>` clicks | navigating away and losing app state |
| `dragover` on a drop zone | rejecting the drop (**without this, `drop` never fires**) |
| ⌘K, Space or arrows in your own widgets | the browser's shortcut, or scrolling the page |
| A custom right-click menu, or sanitising a paste | the context menu, or inserting raw clipboard HTML |

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

A `<form>` posts and reloads by default, which in a single-page app throws away all your state. Likewise the *default* on `dragover` is "reject this drop", so cancelling it is what makes dropping possible.

#### Where `stopPropagation()` is used

Every use is "this element sits inside something else that is also clickable":

| Scenario | The ancestor you are stopping |
|---|---|
| Clicking inside a modal panel | the backdrop's "click anywhere to close" |
| A Delete button inside a clickable row, or a toggle in an accordion header | the row's "open" or the header's expand handler |

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

**Both at once**: a link inside a clickable card, where `preventDefault` alone still opens the card and `stopPropagation` alone still navigates:

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

`stopPropagation` fixes your problem by silencing everyone else's listeners (analytics, focus managers, click-outside handlers). Where you can, decide in the ancestor:

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

For "click outside to close", the robust version is the same idea: check `!panelRef.current.contains(e.target)` in the `document` handler rather than calling `stopPropagation` inside the panel.

**React and `document` listeners.** Up to React 16, React attached its listeners to `document`, so `e.stopPropagation()` in a React `onClick` could not stop another native `document` listener. Since **React 17** it attaches them to the root container, so the native event is still bubbling when React's handler runs, and `e.stopPropagation()` **does** stop `document` bubble-phase listeners (not capture-phase ones, which already ran).

The trap that remains is the reverse: a dropdown opens on click and, in an effect, adds a `document` click listener to close it on outside clicks. That listener can be attached while the opening click is still bubbling up from the root, so it receives the *same* click and the dropdown closes immediately. The workaround from the React 17 announcement is to register the listener for the capture phase, which that click has already passed:

```text
useEffect(() => {
  if (!open) return;
  const close = (e) => { if (!panelRef.current.contains(e.target)) setOpen(false); };
  document.addEventListener('click', close, { capture: true });
  return () => document.removeEventListener('click', close, { capture: true });
}, [open]);
```

---

### 13.3 Delegation, and What Does Not Bubble

Bubbling makes delegation possible: one listener on a parent handles any number of children, including ones added later.

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

**But not everything bubbles:**

| Event | Bubbles | Use instead |
|---|---|---|
| `focus` / `blur` | **no** | `focusin` / `focusout`, which do |
| `mouseenter` / `mouseleave` | **no** | `mouseover` / `mouseout`, which do |
| `scroll` on an element | **no** | listen on the element itself (`scroll` on `document` does fire) |
| `load`, `error` on `<img>` | **no** | attach directly, or use capture |

`mouseenter` means "entered this element", while `mouseover` fires again whenever the pointer crosses into a child, so hover delegation works with `mouseover` and not `mouseenter`.

**`{ passive: true }`** promises you will not call `preventDefault()`, so the browser can scroll without waiting for your handler. It is the default for `touchstart` and `wheel` on the document, and the fix when a scroll listener makes scrolling feel sticky.

---

## 14. Design Patterns

### 14.1 Module Pattern

Private variables through a closure: an IIFE (immediately-invoked function expression) runs once and returns functions that close over its locals, as in `const counter = (() => { let count = 0; return { increment: () => ++count }; })()`. It is taught in [§5.2 Closures](#52-closures) and [§5.4 Closures in the Wild](#54-closures-in-the-wild) ("Private state"). ES modules made it less necessary, since unexported top-level variables are already private. Other classic patterns are in the [Design Patterns guide](/frontend/design-patterns).

### 14.2 Observer Pattern

**One object announces that something happened without knowing who is listening.** Listeners register with `on`, and `emit` calls them all, so the code that emits `'saved'` never imports the toast, logger or analytics that react to it. The same shape sits under Node's `EventEmitter`, `addEventListener` and store subscriptions. `off` needs the **same function reference** passed to `on` (§1.3). More in the [Design Patterns guide](/frontend/design-patterns#56-observer).

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

A singleton restricts a class to one shared instance, such as a connection pool or config. In JavaScript you rarely need the class below: a module runs once however many files import it, so `export const db = createPool()` is already a singleton. Either form is hidden global state that every test shares.

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

Both limit how often a function runs when events fire faster than you need. **Debounce** waits for a *pause* (run once, after typing stops for `delay` ms); **throttle** runs at a steady *rate* (at most once per `limit` ms, for scroll and resize). Both work by closing over one shared timer or flag. The implementation and why the timer must live in a closure are in [§5.4 Closures in the Wild](#54-closures-in-the-wild) (example 3); the [interview questions](/javascript/interview-questions) build a full debounce with leading and trailing options, and the playground has Debounce and Throttle challenges.

```js
// Throttle: the same shape as §5.4's debounce, with a flag instead of a timer handle
function throttle(fn, limit) {
  let inThrottle = false;
  return (...args) => {
    if (inThrottle) return;
    fn(...args);
    inThrottle = true;
    setTimeout(() => (inThrottle = false), limit);
  };
}
```

---

## References

- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) — Comprehensive JavaScript tutorials and reference
- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference) — Complete API reference for built-in objects
- [ECMAScript Specification](https://tc39.es/ecma262/) — The official language specification
- [JavaScript.info](https://javascript.info) — Modern JavaScript tutorial with detailed explanations
