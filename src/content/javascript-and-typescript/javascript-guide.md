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

JavaScript is a **single-threaded**, **dynamically typed**, **JIT-compiled** programming language. It's the language of the web: it runs in browsers, and on servers through Node.js.

Key characteristics:
- **Single-threaded**: one call stack, so one piece of your code runs at a time (§1.4)
- **Non-blocking**: slow work such as network requests is handed off, and your code carries on (§1.5), with results delivered by the event loop (§1.6)
- **Prototype-based**: objects inherit from other objects, not from classes (§6)
- **First-class functions**: functions are values that can be stored and passed around (§1.3)
- **Multi-paradigm**: supports object-oriented, functional and event-driven programming

The subsections below are how JavaScript actually runs your code, in the order the pieces fit together: the engine that runs it (§1.1), what happens when a function is called (§1.2), what a function actually is (§1.3), why there is one thread (§1.4), how that one thread avoids waiting (§1.5), the loop that ties it together (§1.6), how to get a second thread when you need one (§1.7), and why the language ended up everywhere (§1.8).

### 1.1 The Engine and the Runtime — What Happens When Your Code Runs

An **engine** reads your code, turns it into instructions, runs them, and speeds up the parts that run often. The **browser (or Node)** around the engine supplies everything that is not the language itself: timers, network requests, the page.

**Two pieces, and people mix them up.**

| Piece | What it is | Examples | What it gives you |
|---|---|---|---|
| **Engine** | the program that understands JavaScript | V8 (Chrome, Edge, Node), SpiderMonkey (Firefox), JavaScriptCore (Safari) | variables, functions, objects, promises, the call stack, the memory heap |
| **Runtime** (the host) | the program the engine lives inside | the browser, Node.js | `setTimeout`, `fetch`, `document`, `console`, `fs`, the event loop |

`setTimeout` is **not part of the JavaScript language**. The browser provides it, and Node provides its own version. That is why the same code can have a `document` in the browser and not in Node: same engine, different host.

**What the engine does with your file, step by step:**

1. **Parse.** It reads the text and builds a tree that describes the code, called an **AST** (abstract syntax tree). If there is a syntax error *anywhere*, it stops here and **not one line runs**, not even the lines above the mistake.
2. **Interpret.** It turns the tree into **bytecode**, a compact list of simple instructions, and starts running it straight away. In V8 this part is called *Ignition*.
3. **Optimise the hot parts.** While running, it watches which functions are called a lot and what types they receive. Those "hot" functions get compiled into fast machine code. This is **JIT compilation** (just-in-time: compiled while the program runs, not ahead of time). V8's optimising compilers are called *Maglev* and *TurboFan*.
4. **Undo when a guess is wrong.** The fast code is built on assumptions, like "this function always gets numbers". If it suddenly gets a string, the engine throws the fast code away and goes back to bytecode. This is called **deoptimisation**.

You can see step 1 happen: the first line of this code is never run, because the whole snippet fails to parse first.

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

**Where things are kept while it runs.** A simple model that answers most interview questions:

- The **call stack** tracks *which function is running right now* and what called it (§1.2).
- The **heap** is a large area of memory where objects, arrays and functions live. Your variables hold **references** to them, like an address, not the objects themselves.
- The **garbage collector** frees heap objects that nothing can reach any more (interview Q19).

(Real engines are cleverer than "primitives on the stack, objects on the heap". For example, a variable captured by a closure lives on the heap. The model is still the right one for reasoning about code.)

**The practical takeaway interviewers like:** the optimiser rewards *predictable* code. A function that always receives the same types, and objects that are always created with the same properties in the same order, stay on the fast path. Code that mixes types in one hot function keeps getting deoptimised. This only matters in genuinely hot code; for everything else, write for readability.

---

### 1.2 Execution Context and the Call Stack

Each time a function is called, the engine creates an **execution context**: a small record holding that call's local variables, its `this`, and a link to the scope outside it. The contexts are kept on the **call stack**. A call puts one on top; a return takes it off. Only the top one is running.

Think of a stack of plates. Calling a function puts a plate on top. The function on the top plate is the only one running. When it returns, its plate is removed and the one underneath carries on from where it stopped.

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

The message is "Maximum call stack size exceeded", which is a **stack overflow**. The exact limit depends on the engine and on how much each call stores: about 10,000 calls in Node, and it varies between browsers.

**Why the call stack matters for async code:** a callback from `setTimeout` or a promise can only run when the stack is **empty**, meaning every function currently running has returned. That rule is the heart of the event loop (§1.6).

---

### 1.3 Function References — Functions Are Values

In JavaScript a function is a **value**, an object like any other. Its name is just a variable that holds a reference to it. `fn` means "the function itself", and `fn()` means "run it now and give me what it returns".

A recipe and a dish are a good picture: `fn` is the recipe card, which you can copy, hand to someone, or store for later. `fn()` is cooking it, and what you get back is the dish.

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

The last line is the one people get wrong. `saved = handler` copied the **reference** at that moment. Pointing `handler` at a new function later does not change what `saved` already holds.

**Three bugs that all come from mixing up `fn` and `fn()`, or from references not matching.**

**1. Calling a function when you meant to pass it.** `setTimeout(save(), 1000)` runs `save` **immediately** and passes its *return value* to `setTimeout`. Pass the function (`setTimeout(save, 1000)`), or wrap it when it needs arguments (`setTimeout(() => save(id), 1000)`). The same mistake in React is `onClick={handleClick()}`, which runs on every render instead of on click.

**2. Removing a listener with a different function.** `removeEventListener` only removes a listener if you give it the **same reference** you added. An arrow written out again is a new function, so nothing matches.

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

This is how listener memory leaks start (interview Q15): a component adds an inline arrow, tries to remove it on cleanup, and the original stays attached forever.

**3. Passing a method loses its object.** `user.greet` is a reference to the function only. The object it came from is not attached to it, so when it is called on its own, `this` is not `user`.

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

This is exactly what happens with `setTimeout(user.greet, 0)` or `button.addEventListener('click', this.handleClick)`: the function travels without its object. Fix it with `bind`, or wrap it in an arrow (`() => user.greet()`). Without `'use strict'`, `this` would be the global object instead, which is worse because nothing throws (interview Q8 covers `call`, `apply` and `bind`).

**Why this matters in React:** a function created inside a component is a **new reference on every render**. A `memo` child compares props by reference, so it sees a "new" `onClick` each time and re-renders. `useCallback` exists to keep the same reference between renders (React Q17).

---

### 1.4 Why Is JavaScript Called Single-Threaded?

**Your JavaScript code runs on one thread, with one call stack, so exactly one piece of it runs at any moment.** Two of your functions can never run at the same instant, and a function is never interrupted halfway through by another one of yours.

A thread is one line of work a computer can carry out. A program with several threads can do several things at literally the same time, one per CPU core. Java, C# and Go let your own code start threads freely. JavaScript, by default, gives your code exactly one: in the browser it is called the **main thread**.

**Why it was designed this way.** JavaScript was created in 1995 to make web pages interactive, and the page is the thing every script touches. If two threads could change the same button at the same time, every line of UI code would need locks to stop them corrupting each other, which is where most multithreading bugs come from. With one thread, a function can read the page, decide and update it, knowing nothing else changes underneath it. That guarantee is also why the async code in §8 is much easier to reason about than threaded code.

**What "single-threaded" does NOT mean.** It describes *your code*, not the browser or Node. Around your one thread, the host is busy in parallel:

| Running in parallel, outside your thread | Examples |
|---|---|
| Network requests | `fetch` downloads while your code keeps running |
| Timers | the host counts down `setTimeout` for you |
| Parts of rendering | image decoding, scrolling and some animations on the compositor |
| Node's I/O | reading files, DNS lookups and some crypto run on a hidden thread pool (libuv's, 4 threads by default) |
| Workers | real extra JavaScript threads you start yourself (§1.7) |

So JavaScript can wait for many things at once. It just can't *run your code* for more than one of them at once.

**The cost of one thread: a long task blocks everything.** The main thread also handles clicks, typing and painting the page. While one of your functions runs, none of those can happen. Here a timer is due after 0 ms, but it cannot run until the loop gives the thread back:

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

In a real page, a click during those 300 ms would also wait, and the screen would not update. Browsers flag any task over **50 ms** as a "long task", because that is roughly where people start to notice lag. The fixes are to split the work into smaller pieces that give the thread back in between (tricky Q17 shows how), or to move it to a worker (§1.7).

---

### 1.5 Why Is JavaScript Non-Blocking?

**When your code asks for something slow, such as a network request, a timer or a file, JavaScript does not stop and wait for it.** It hands the job to the host (the browser or Node), carries on with the next line, and runs your callback later, when the result is ready. Waiting happens *outside* your thread, so the thread stays free.

"Blocking" means the thread sits idle until an operation finishes. With only one thread, a blocking network call would freeze the whole page for as long as the server took to answer. So JavaScript's APIs for slow operations are built the other way round: you start the operation and say what to do with the result, and the call returns immediately.

A restaurant with one waiter is a good picture. The waiter takes your order to the kitchen and goes straight to the next table, instead of standing at the kitchen door until your food is ready. When it is ready, the kitchen rings a bell, and the waiter brings it over as soon as they are free.

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

Even with a delay of 0, line 3 prints last. `setTimeout` hands the job to the host and returns at once. The callback can only run once the code that is running now has finished and the call stack is empty.

**How you receive the result** has changed over the years, but the idea is the same: callbacks, then promises, then `async`/`await` (§8). `await` *looks* like waiting, but it only pauses that one `async` function. The thread is released and other code runs in the meantime.

```text
// Node.js, the same job both ways
const data = fs.readFileSync('big.csv');                 // BLOCKING: the thread waits; nothing else runs
fs.readFile('big.csv', (err, data) => { /* later */ });  // NON-BLOCKING: returns at once; the callback runs later
const data2 = await fs.promises.readFile('big.csv');     // non-blocking, written to look sequential
```

This is why one Node.js process can serve thousands of connections: while it waits for one database query, it handles other requests, instead of needing one thread per connection.

**Non-blocking is about WAITING, not about computing.** The host can wait for a network or disk in parallel, but only your one thread can run your JavaScript. A loop that crunches numbers for two seconds still blocks, however you wrap it: putting it in a promise or an `async` function changes *when* it runs, not *where* (§1.4's demo, and tricky Q17). A few APIs really are blocking and should be avoided on the main thread: `alert()`, `confirm()`, synchronous `XMLHttpRequest`, and Node's `*Sync` functions inside a server.

---

### 1.6 What Is the Event Loop?

**The event loop is how "later" gets turned back into "now".** When a timer fires or a response arrives, the host does not interrupt your code. It puts your callback in a **queue**, a waiting line. The event loop is a simple loop that waits until the call stack is empty (nothing of yours is running), then takes the next callback from the queue and runs it. Then it does the same again, forever.

In rough code, one turn of the loop in a browser looks like this:

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

Lines 1 and 2 are the code that is already running. Only when it ends is the stack empty. Then step 2 of the loop runs every microtask (line 3), and only then does the next turn take the timer task (line 4).

**Three consequences worth remembering:**

- **Nothing interrupts a running function.** A timer or click waits until the stack is empty (§1.4's demo). That is what makes JavaScript safe to reason about, and why long functions freeze the page.
- **The screen only updates between tasks.** If you change the DOM ten times in one function, the browser paints once, at the end. If a task never ends, it never paints.
- **Microtasks can starve the page.** Because the microtask queue is drained completely, a chain of promises that keeps queueing more promises delays rendering and every timer until it stops (tricky Q17).

Node.js has an event loop too, run by its libuv library, with a few extra queues: `process.nextTick` callbacks go before promise microtasks, and `setImmediate` runs in its own phase after I/O. §11 has the reference diagram, interview Q6 goes deeper, and tricky Q7 to Q11 are ordering puzzles to practise on.

---

### 1.7 Web Workers and Worker Threads — Real Parallelism

A worker is a **second JavaScript thread**. It has its own call stack, its own memory and its own event loop, so heavy work can run there without freezing the page. It cannot touch the page, and it talks to the main thread only by sending messages.

**Why you need one.** In the browser, your JavaScript runs on the **main thread**, and that same thread also handles clicks, scrolling and painting the screen. If a function takes 2 seconds, the page is frozen for 2 seconds: no clicks, no scrolling, no animation. Promises do not help here, because a promise changes *when* code runs, not *where* (tricky Q17). A worker is the only way to run JavaScript somewhere else.

Picture a helper working in another room. You pass them a note with the job, they get on with it while you keep serving customers, and they pass a note back with the answer. They cannot reach into your room, and you cannot reach into theirs.

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

**Messages are copied, not shared.** `postMessage` copies the data with the same algorithm as `structuredClone` (tricky Q24). That is safe, since neither side can change the other's data, but copying a very large array takes time on the main thread. For big binary data, **transfer** it instead: `worker.postMessage(buffer, [buffer])` hands over ownership with no copy, and the sender's buffer becomes empty (Browser APIs tricky Q7). True shared memory exists (`SharedArrayBuffer` with `Atomics`), but browsers only allow it on pages sent with special security headers (cross-origin isolation), and it brings back all the usual threading bugs.

**How a worker works, step by step.** It helps to picture two separate JavaScript "worlds", each with its own event loop (§1.6), connected only by a message channel:

```text
MAIN THREAD                                        WORKER THREAD
───────────                                        ─────────────
1. new Worker('worker.js')  ──── starts ────▶      a new thread loads worker.js and runs its
                                                   top level: its own global (self), heap,
                                                   call stack and event loop. No document.

2. worker.postMessage(job)  ── copy of job ──▶     the copy arrives as a "message" TASK in the
   (returns immediately;                           worker's task queue; its event loop runs
    the page stays usable)                         self.onmessage when its stack is empty

                                                   3. the heavy work runs HERE, blocking only
                                                      the worker's thread

4. worker.onmessage runs    ◀── copy of result ──  self.postMessage(result)
   as a TASK on the main
   thread's event loop

5. worker.terminate()  (or self.close() from inside) ends the thread and frees its memory
```

Each step in words:

1. **Creating it** starts a real operating-system thread. The browser loads the script separately, so it must be its own file (or a Blob URL), and it runs in a fresh global scope: none of the main thread's variables exist there.
2. **Sending a message** makes a copy of the data (the *structured clone* algorithm, the same one `structuredClone` uses) and queues it on the other side. The two threads never share an object, which is why there are no locks and no race conditions to worry about.
3. **The work** blocks only the worker. The main thread keeps handling clicks and painting.
4. **The reply** is another copied message, delivered as a task, so your `onmessage` handler runs between other tasks like any event.
5. **Ending it**: a worker keeps its thread (and its memory) until you stop it. Terminate workers you no longer need, or reuse one for many jobs rather than starting a new one each time, because starting a thread takes a few milliseconds.

**When to use a worker:** CPU-heavy work that takes more than roughly 50 ms, which is where users start to feel lag. Parsing or searching a big file, image and video processing, compression, encryption, heavy data transforms, syntax highlighting a large document.

**When a worker does NOT help:**

- **Network requests.** `fetch` already happens outside your thread. Waiting for a slow API in a worker is no faster.
- **Updating the page.** The worker cannot touch the DOM, so it can only send results back for the main thread to render.
- **Small jobs.** Starting a worker and copying data costs time. For a 5 ms task, that overhead is bigger than the work.

**The kinds of worker, which interviewers like to mix up:**

| Kind | What it is for |
|---|---|
| **Dedicated Web Worker** | background computation for one page. This is the usual answer |
| **Shared Worker** | one worker shared by several tabs of the same site |
| **Service Worker** | a network proxy for offline support, caching and push notifications, *not* for heavy computation (Browser APIs Q11) |
| **Node `worker_threads`** | the same idea on the server: CPU work off the main thread so the server keeps answering requests (Node.js Q12) |

A Node version of the same idea, for comparison:

```text
// Node: a worker defined in the same file
const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');

if (isMainThread) {
  const worker = new Worker(__filename, { workerData: 40 });
  worker.on('message', (result) => console.log('fib(40) =', result));
} else {
  const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
  parentPort.postMessage(fib(workerData));   // slow, but it does not block the main thread
}
```

**A real example you have already used:** this app's Code Playground runs plain JavaScript inside a Web Worker. If your code gets stuck in `while (true) {}`, only the worker is stuck, so the page stays usable, and after 3 seconds the playground calls `worker.terminate()` to stop it. On the main thread, the same loop would freeze the whole tab and nothing could stop it.

---

### 1.8 Why JavaScript Is Everywhere

**Short answer:** JavaScript is the **only programming language every web browser runs natively**. Anyone who builds for the web has to know it, so it has the largest pool of developers of any language. Node.js then took it to servers, and the same people could build the whole product in one language. After that, the ecosystem, the tools and the jobs kept feeding each other. In Stack Overflow's 2025 developer survey it was again the most-used language, by **66%** of respondents, a position it has held for well over a decade.

**Why the browser matters so much.** A website is delivered as HTML, CSS and JavaScript, and every browser on every device ships a JavaScript engine. There is no other language you can send to a browser and expect to run everywhere without a plugin. (WebAssembly lets compiled languages run in browsers too, but it cannot touch the page directly: it still needs JavaScript to reach the DOM.) So JavaScript did not win a contest between languages. It was the only entrant.

**How it got here, briefly:**

| When | What happened | Why it mattered |
|---|---|---|
| 1995 | Brendan Eich writes the first version at Netscape in about ten days; it is renamed JavaScript to ride on Java's popularity | the two languages are unrelated apart from the name and some syntax |
| 1997 | standardised as **ECMAScript** (ECMA-262), so every browser could implement the same language | one language across browsers, instead of one per vendor |
| 2004–2005 | Gmail and Google Maps show that a web page can feel like an app; the technique gets a name, **Ajax** | JavaScript goes from "form validation" to "the whole user interface" |
| 2008 | Google's **V8** engine in Chrome compiles JavaScript to machine code (§1.1) | JavaScript becomes fast enough for serious work |
| 2009–2010 | **Node.js** runs V8 outside the browser; **npm** follows | the same language on the server, and a way to share code |
| 2015 | **ES2015** (ES6): classes, modules, arrow functions, promises, `let`/`const` | the language finally feels modern, and gets a new version every year from then on |
| 2012 onwards | **TypeScript** adds static types on top | large codebases become manageable, removing the biggest objection |

**Why developers and companies keep choosing it:**

- **One language across the whole stack.** Browser, server (Node.js, Deno, Bun), mobile (React Native), desktop (Electron, the base of VS Code, Slack and Discord) and edge functions all run JavaScript. A small team can share code, types and people across all of them.
- **The largest package ecosystem.** npm is the biggest software registry in the world, with millions of packages, so almost any problem has a library already.
- **Nothing to install to start.** Every browser has a console and a JavaScript engine. A beginner can write their first program in the browser they already use, which is a big reason so many people learn it first.
- **It never breaks old websites.** Browsers keep code from the 1990s working ("don't break the web"). That makes the language slow to fix old mistakes, but it means what you write keeps running.
- **It keeps improving, predictably.** A committee called TC39 adds a small set of features every year (Q36), rather than big disruptive rewrites.
- **It is fast enough.** JIT-compiling engines (§1.1) make typical JavaScript fast for web servers and UIs, and its non-blocking model (§1.5) suits programs that spend most of their time waiting on the network.
- **Jobs and hiring.** Because the web needs it, there are more JavaScript and TypeScript jobs than for almost any other language, and companies can hire for it easily. Popularity feeds itself.

**The honest downsides**, which a good answer mentions too:

- **Quirks from 1995 that can never be removed**, such as `==` coercion, `typeof null === 'object'` and `this` depending on how a function is called. Linters and `===` work around most of them.
- **Dynamic typing hurts large codebases.** A renamed property breaks code at runtime, not at build time. This is the main reason TypeScript is now the default for serious projects (Q38).
- **One thread for your code** (§1.4). CPU-heavy work, such as video encoding or number crunching, needs workers or another language.
- **Ecosystem churn and supply-chain risk.** Frameworks and tools change often, and a typical project pulls in hundreds of third-party packages, each one a security risk (the Web Security guide covers supply-chain attacks).

---

## 2. Data Types

### 2.1 Primitive Types (7)

**A primitive is a single, immutable value; everything else is an object.** Immutable means no operation can change a primitive in place: `str.toUpperCase()` returns a new string and leaves `str` alone. That is why primitives behave as if they are copied: after `let b = a`, changing `b` can never affect `a`, because the only way to "change" `b` is to point it at a different value. There are exactly seven primitive types:

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

**A variable holding an object holds a reference to it, not a copy of it.** Arrays, functions, dates, maps and sets are all objects. So `const b = a` gives you two names for one object, and `b.name = 'Bob'` is visible through `a` too. It is also why `{} === {}` is `false`: `===` on objects compares identity (is it the same object?), not contents. This one fact explains most "why did my original change?" bugs, including shallow copies with spread (tricky Q20).

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

`typeof` returns a string naming a value's type. It gets two cases wrong, and both break real type checks. `typeof null` is `'object'` because of a bug in the very first implementation that can never be fixed without breaking existing pages, so check for null with `value === null`. And an array is an object, so `typeof []` is `'object'` too; use `Array.isArray(value)` to tell arrays apart.

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

When an operator gets a type it did not expect, JavaScript silently converts the value instead of throwing. This is called implicit coercion. The rules below explain most surprises: `+` prefers strings, so if either side is a string it joins them (`'5' + 3` is `'53'`); the other arithmetic operators only work on numbers, so they convert both sides to numbers (`'5' - 3` is `2`). `==` (loose equality) also converts before comparing, while `===` (strict equality) never does, which is why `===` is the safe default.

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

Hoisting is the name for why some variables and functions can be used before the line that declares them. Nothing is physically moved: before a scope runs, the engine sets up every declaration in it (the creation phase in §1.2). A function declaration is set up complete, so you can call it early. A `var` is set up as `undefined`, so reading it early gives `undefined` instead of an error. A `let`/`const` is set up but marked "not ready" until its line runs, and reading it before then throws a `ReferenceError`. That not-ready gap is the Temporal Dead Zone (TDZ, interview Q11).

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

Arrow functions provide a concise syntax for writing functions and have key behavioral differences from regular functions: they do not have their own `this`, `arguments`, or `prototype`, and they cannot be used as constructors. Because an arrow takes `this` from the code around it, it is ideal for a callback *inside* a method, such as `setTimeout(() => this.save())`, where a normal function would lose `this`. For the same reason, do not write an object's method itself as an arrow: it would take `this` from outside the object, not the object (interview Q27).

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

A higher-order function either takes a function as an argument or returns one. This works because functions are values (§1.3). The point is separating *how* from *what*: `map` owns the loop, and you pass in only the part that changes, what to do with each item. Returning a function lets you fix some settings once and reuse the result, as `multiplier(2)` does below.

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

There are four ways to create an object, and the difference between them is how the object gets its shared methods:

- **Object literal** for a one-off object. Its methods live on that object only.
- **`Object.create(proto)`** when you want to choose the prototype yourself, or `Object.create(null)` for an object with no prototype at all.
- **Constructor function + `new`**, the pre-2015 way to make many objects of one kind. Methods go on `User.prototype`, so every instance shares one copy instead of carrying its own.
- **`class`**, which does exactly what the constructor-function version does, with clearer syntax ("syntactic sugar"). This is what you write today when you need many instances.

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

Mutating methods change the array in place rather than returning a new one. That matters in React and Redux: they detect a change by comparing references, and a mutated array is still the same reference, so `items.push(x); setItems(items)` looks like "nothing changed" and the screen does not update. Copy first (`[...items, x]`), or use the non-mutating versions in §7.1.

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

`async`/`await` is syntactic sugar over promises that lets you write asynchronous code in a synchronous-looking style. An `async` function always returns a promise, and `await` pauses *that function* until the awaited promise settles. The thread is not blocked: other code runs while the function waits, and it resumes later as a microtask (§8.4). The win is readability, since errors can be handled with an ordinary `try`/`catch`.

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

**Promise callbacks run before timers, even a timer with a 0 ms delay.** A *microtask* is a small job the engine runs as soon as the current code finishes (promise `.then` callbacks, the code after an `await`, `queueMicrotask`). A *macrotask* is a whole unit of work the event loop picks up one at a time (`setTimeout`, `setInterval`, I/O, UI events). After each macrotask the engine empties the microtask queue completely, so every pending promise callback gets in first. §1.6 explains the loop step by step and §11 has the diagram; this is the short version:

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

**Where awaiting each call in turn is wrong** — the case worth knowing, because putting `await` in front of every call runs independent work one after another:

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

Three production patterns that come up as "implement this" questions: **retry** a call that failed for a temporary reason, **cancel** work nobody needs any more, and **bound** how many calls run at once. Each part ends with what the simple version still gets wrong, because that is where interviewers push.

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

- **`setTimeout(() => ctrl.abort(), 5000)`** is the timeout. `fetch` has no timeout option of its own, which surprises people — this is how you add one. If you swap in `AbortSignal.timeout(5000)` as the comment suggests, the rejection becomes a `TimeoutError` rather than an `AbortError`, so the `catch` below must check for that name too (see `handleFixed` above).
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

The rule to take away: **always distinguish an abort (and a timeout) from a real error**, or a user navigating away logs as a failure and pollutes your error rate.

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

**Why not just chunk the array?** Splitting 1,000 items into 200 batches of 5 and awaiting each batch is simpler to write and measurably worse: every batch runs at the speed of its **slowest** member, and the other four workers sit idle waiting for it. A pool has no such barrier — a worker that finishes early immediately takes the next item. On uneven workloads the difference is large. Take nine items where every group of three holds one 60 ms item and two 5 ms items: a pool of 3 finishes in about **76 ms**, while fixed batches of 3 take about **182 ms** — three batches, each waiting 60 ms for its own straggler.

**What is still missing here:**

- **One rejection sinks the batch.** `Promise.all(runners)` rejects on the first failed worker while the rest keep running — so you get neither the results nor a clean stop. Catch inside `worker`, or collect `{ status, value }` per item.
- **No cancellation, again.** There is no way to stop the pool half-way; a signal checked at the top of the `while` would let it drain early.
- **`limit` is a guess.** The right number depends on what you are bounding — browser connections per origin (6 over HTTP/1.1), an API's rate limit, or database connections. "Why 5?" is a fair question and "it felt right" is a poor answer.

Also worth naming: `Promise.allSettled` when you want every result regardless of failures (batch jobs, dashboards), `Promise.any` for a first-success race across mirrors, and `Promise.race` for a timeout — though `AbortSignal.timeout` is better, because `race` leaves the losing request running and still paying for bandwidth.

---

## 9. ES6+ and Modern JavaScript

### 9.1 Template Literals

Template literals use backticks instead of quotes. They let you drop any expression into a string with `${...}` and write a string across several lines without `\n`. A **tagged template** puts a function name in front of the backtick: the function receives the literal text pieces as an array and the `${}` values as separate arguments, and decides how to join them. That is how libraries escape values before inserting them into HTML or SQL.

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

ES6 introduced these built-in collection types as alternatives to plain objects and arrays. `Map` allows any type as a key (a plain object turns every key into a string), and `Set` stores each value only once. The `Weak` versions exist for one job: attaching data to an object without keeping that object alive. A normal `Map` entry holds its key strongly, so an object used as a key can never be garbage collected while the map exists, which is a leak. A `WeakMap` entry does not count as a reference, so when nothing else points at the key object, the entry disappears with it. The price is that a `WeakMap` or `WeakSet` has no `size` and cannot be looped over, because its contents can vanish at any moment.

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

`Proxy` lets you intercept and customize fundamental operations on objects (property access, assignment, function calls, etc.) by defining handler traps. This is the mechanism behind reactivity in Vue 3: reading a property through the proxy records who depends on it, and writing to it tells them to update. The same idea gives you validation, logging and default values without changing the code that uses the object.

`Reflect` is its companion: it has one method per trap (`Reflect.get`, `Reflect.set`, and so on) that performs the normal, un-intercepted operation. Inside a trap you do your extra work and then call `Reflect.set(target, prop, value)` to carry out the default behaviour, instead of re-implementing it by hand.

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
| **ES2026** | `Array.fromAsync`, `Error.isError`, `Math.sumPrecise`, `Uint8Array` base64/hex, iterator sequencing (`Iterator.concat`), `Map` upsert (`getOrInsert`) |
| **ES2027** | **Temporal**, explicit resource management (`using` / `await using`) — both finished after the ES2026 snapshot was cut, so they land in the following edition |

Everything through ES2024 is available in every current browser and in Node 22+ (Node 20 lacks `Object.groupBy` and `Promise.withResolvers`), so it needs no build step. ES2025 and later features are the ones worth checking against your minimum target — `using` in particular needs TypeScript 5.2+ or a transpiler because it is *syntax*, not just a new method.

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

`try`/`finally` works, but it separates acquisition from cleanup by however many lines the body happens to be, and it nests horribly once you hold three resources. Explicit resource management (ES2027) adds two new declaration forms that attach cleanup to the *variable's scope* instead.

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

`Date` has been the language's most-complained-about built-in since 1995: it is mutable, it parses inconsistently, its months are zero-indexed but its days are not, it silently conflates "an instant in time" with "a date on a calendar", and it has no real time-zone support. `Temporal` reached Stage 4 (finished) in March 2026, too late for the ES2026 snapshot, so it is part of ES2027. It fixes all of it by splitting the single overloaded `Date` into several **immutable** types, each of which means exactly one thing.

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
- **`try`/`catch` does not catch async errors** thrown after the synchronous frame exits. An error thrown inside a `setTimeout` callback reaches the window `error` event; a rejection from a promise you forgot to `await` reaches `unhandledrejection` (interview Q30 explains why).

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

A one-screen reference; §1.6 explains the event loop from scratch and interview Q6 goes deeper. Read the diagram top to bottom as one turn of the loop: run the synchronous code, drain every microtask, take one macrotask, and — if a frame is due — update the screen. Rendering is a step between tasks, not a task waiting in the queue.

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
|  I/O callbacks, UI events           |
+-------------------------------------+
                |
                | Between tasks, if a frame is due:
                v
+-------------------------------------+
|      Render step (not a queue)      |
|  requestAnimationFrame callbacks,   |
|  then style, layout, paint          |
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

ES Modules are the official standard module system for JavaScript, supported in all modern browsers and Node.js. `import` and `export` must be written at the top level with fixed names, so a tool can see every import and export by reading the code, without running it. That is what makes **tree-shaking** possible: a bundler can prove an export is never imported and leave it out of the bundle. CommonJS's `require()` is an ordinary function call that can happen anywhere, with a computed name, so a bundler cannot be sure what is used.

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

The Document Object Model (DOM) is the browser's tree of objects representing the HTML page. Changing those objects from JavaScript changes what is on screen. The reference below covers selecting, creating, modifying and removing elements. The one line to remember is the `innerHTML` comment: assigning a string that contains user input to `innerHTML` lets that input run as code (XSS, cross-site scripting), while `textContent` always inserts plain text.

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

**The module pattern gives you private variables without a class.** An IIFE (immediately-invoked function expression — a function that is defined and called in one expression) runs once, and the object it returns keeps a closure over its local variables. Outside code can call the returned functions but has no way to reach `count` itself. ES modules made this less necessary, since a module's top-level variables are already private unless exported, but the pattern still shows up in older code and in interviews. §5.4 ("Private state") walks through why the closure keeps the variable alive.

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

**The observer pattern lets one object announce that something happened without knowing who is listening.** Listeners register a function with `on`; the subject calls every registered function with `emit`. The point is decoupling: the code that emits a `'saved'` event does not import or call the toast, the logger or the analytics code that react to it. The same shape sits under Node's `EventEmitter`, DOM `addEventListener`, and store subscriptions in state libraries. Note that `off` needs the **same function reference** that was passed to `on`, so an inline arrow can never be removed.

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

The singleton pattern restricts a class to a single instance and provides a global access point to it, for things that must be shared rather than duplicated, such as a database connection pool or a configuration object. In JavaScript you rarely need the class below: an ES module runs only once however many files import it, so `export const db = createPool()` is already a singleton. The cost of either form is the same, hidden global state, which makes tests harder because every test shares the one instance.

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

**Both limit how often a function runs when events fire far faster than you need.** Debounce waits for a *pause*: it runs once, after the user has stopped typing for `delay` ms. Throttle runs at a steady *rate*: at most once per `limit` ms while the events keep coming, which suits scroll and resize handlers. Both work because the returned function closes over one shared timer or flag (§5.4). The minimal versions below drop `this` and, for throttle, the last call in each window; interview Q16 builds a full debounce with leading and trailing options.

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

Use `===` by default: `==`'s conversion rules are hard to predict (`'' == 0` and `'0' == 0` are both `true`, yet `'' == '0'` is `false`), and tricky Q2 and Q3 show where they lead. The one common deliberate use of `==` is `value == null`, which is `true` for both `null` and `undefined` and nothing else.

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

Why `count` survives: it lives in a scope object on the heap, and `inc` keeps a reference to that scope, so the garbage collector cannot free it while `inc` is reachable. Each `outer()` call makes a fresh scope, so two counters never share a `count`. Worth volunteering: closures are how JavaScript gets private state (nothing outside can reach `count`), and the same reference is what causes stale values and memory leaks (Q25, Q29). §5.2 walks through the mechanism in full.

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

Use `const` by default, `let` when reassignment is needed, avoid `var`. The reasons to avoid `var`: it ignores blocks, so a variable declared inside an `if` or a loop leaks out of it (the cause of the `setTimeout`-in-a-loop bug in §5.3); reading it before its line gives a silent `undefined` where `let` would throw and point you at the mistake; and redeclaring it is allowed, so a second `var x` quietly overwrites the first. `const` only stops reassignment of the variable; the object it holds can still be changed (§3.1).

---

### Intermediate

---

**Q6: What is the event loop? How does JavaScript handle async operations?**

**The simple version first.** JavaScript runs your code on one thread. Slow work (timers, network requests) is handed to the browser or Node, and your code carries on. When the work finishes, its callback waits in a queue, and the **event loop** runs it as soon as the call stack is empty, meaning nothing of yours is still running. §1.4 to §1.6 explain this from scratch with examples; this answer covers the details interviewers go on to ask about, starting with the fact that there are **two** queues and one of them always goes first.

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

**Q7: Explain prototypal inheritance. If a property is missing from an object but is still accessible, what is the complete lookup process?**

Every object has a hidden `[[Prototype]]` link to another object, or to `null`. Reading a property (the spec calls it `[[Get]]`) is a loop:

1. **Look at the object's own properties.** If the key is there as a **data property**, return its value. If it is an **accessor** (a getter), call the getter with `this` set to the *original* object, not the one where the getter was found.
2. **If it is not there, follow `[[Prototype]]`** and repeat step 1 on that object.
3. **If you reach `null`, return `undefined`.** A missing property is not an error. It just means the walk found nothing.

So "missing from the object itself but still accessible" simply means *found further up the chain*. `dog.eats` below is not on `dog`, it is on `animal`. And `dog.toString()` is found two levels up, on `Object.prototype`.

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

**What the chain does not do, and where interviews go next:**

- **Writes do not walk the chain the same way.** `dog.eats = false` creates a new **own** property on `dog`. It *shadows* the inherited one, and `animal.eats` stays `true`. Delete the own property and the inherited value shows through again. Two exceptions: if the prototype has a **setter** for that key, the setter runs instead of creating a property; and if the prototype's property is **non-writable**, the write fails (silently in sloppy mode, with a `TypeError` in strict mode).
- **Own vs inherited is a separate question.** `'eats' in dog` is `true` because `in` walks the chain. `Object.hasOwn(dog, 'eats')` is `false` because it checks only the object itself. `for...in` also walks the chain, while `Object.keys` returns own properties only. That difference is the usual source of "where did this extra key come from?"
- **`Object.create(null)` has no chain at all.** There's no `toString` and no `hasOwnProperty`, which is exactly why it is used for dictionaries whose keys come from users: a key called `__proto__` or `constructor` cannot collide with anything.
- **Classes are the same mechanism.** `class Dog extends Animal` sets `Dog.prototype`'s `[[Prototype]]` to `Animal.prototype`. Methods live on the prototype once, not on every instance, which is why they are shared.

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

**Q9: What is the difference between shallow copy and deep copy? You copied an object with the spread operator, yet updating the copy changed the original state. Where did the shared reference remain?**

`{ ...obj }` copies **one level**. It creates a new outer object and copies each top-level property into it. For a number or string, that copies the value. For an object, array, `Date` or `Map`, it copies the **reference**, so the new outer object points at the *same* inner object. The shared reference is therefore every nested object, one level down and below.

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

Line by line: `copy === state` is `false`, so the spread did make a new object, and that is what fools people. `copy.user === state.user` is `true`, and that is where the bug lives. `copy.user.name = 'Ben'` walks into the shared `user` object and changes it for both.

**Why this is a React bug, not just a JavaScript one.** React decides whether to re-render by comparing references with `Object.is`. Mutating `state.user.name` in place, then calling `setState` with an object whose `user` is the same reference, gives two results, both bad. Components that receive `user` see an unchanged reference and skip the update (`memo`, `useMemo`, effect dependencies). And the "previous" state you kept for undo or comparison was changed too, because it is the same object.

**The fix is not a deep copy.** Copy **every level on the path you change** and nothing else, as `next` does above: new outer object, new `user`, and the untouched `tags` array stays shared. Sharing unchanged parts is correct and cheap, and it is what lets `memo` skip the parts that did not change. For deep updates, Immer (which Redux Toolkit uses) writes this copying for you from code that looks like a mutation.

**When you really do need a deep copy**, use `structuredClone`. It handles nested objects, arrays, `Date`, `Map`, `Set` and circular references, but it throws on functions and DOM nodes. `JSON.parse(JSON.stringify(x))` is the older trick and it loses data: dates become strings, `undefined` and functions vanish, and `Map`/`Set` become `{}`.

---

**Q10: Explain `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any`.**

Short answer: all four take several promises that are already running and give you one promise back. They differ only in **when that one promise settles and what one failure does to it**. Choose by asking "do I need every result, or just the first?" and "should one failure sink the rest?"

| Method | Resolves when | Rejects when |
|--------|-------------|-------------|
| `Promise.all` | ALL promises fulfill | ANY promise rejects |
| `Promise.allSettled` | ALL promises settle (fulfill or reject) | Never rejects |
| `Promise.race` | the first promise to settle fulfills | the first promise to settle rejects |
| `Promise.any` | FIRST promise fulfills | ALL promises reject (AggregateError, one error holding all the reasons) |

- **`all`** when you need every result and one failure makes the whole thing useless (a page that needs both the user and their settings). It rejects as soon as one fails, but the others keep running; you just stop hearing about them.
- **`allSettled`** when each result is independent and you want to show what worked and report what failed (a dashboard of widgets, a batch job).
- **`any`** when several sources can give the same answer and you want the first that succeeds (mirrors, fallbacks). A failure only matters if they all fail.
- **`race`** when you care about whichever finishes first, success or failure; in practice, a timeout. Note it does not cancel the loser: the slow `fetch` below keeps downloading. `AbortSignal.timeout(ms)` (§8.7) stops the request itself.

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

Why the language does this: using a variable before it has a value is almost always a bug. With `var` that bug is silent, because you just get `undefined` and the code carries on with a wrong value. The TDZ turns the same mistake into an immediate error that names the variable. It also keeps `const` honest: a `const` that could be read as `undefined` first and as its value later would effectively have two values.

---

**Q12: Explain generators and when you'd use them.**

A generator is a function that can pause in the middle and be resumed later. Calling a `function*` does not run its body; it returns an object with a `next()` method. Each `next()` runs the body until the next `yield`, hands back the yielded value, and freezes there with all its local variables intact. That is why the infinite `while (true)` below is safe: it only advances one step each time you ask.

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

Where you would use one:
- **Lazy or infinite sequences.** Values are computed only when asked for, so you can describe "all Fibonacci numbers" or "every page of an API" without building the whole list first.
- **Custom iterables.** A generator is the shortest way to give an object a `[Symbol.iterator]` so it works with `for...of` and spread (§9.4). Writing the iterator by hand needs an object with `next()` and manual state; the generator keeps that state in ordinary local variables.
- **Async flow control.** `next(value)` also sends a value *back in* as the result of the paused `yield`. Redux-Saga uses this: your saga yields a description of an effect ("call this API"), the library performs it and resumes the generator with the result, which makes sagas testable without running real requests.
- **Step-by-step processes.** Each `yield` marks a point where the function can stop and wait for the next step, such as a wizard or a turn-based game, without a separate variable tracking which step you are on.

In everyday code, `async`/`await` has replaced generators for async work; they remain the tool for lazy sequences and custom iteration.

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

Short answer: a memory leak is memory you no longer need that is **still reachable**, so the garbage collector is not allowed to free it. The collector only frees what nothing can reach (Q19), so every leak is something long-lived holding a reference it should have let go. Each common cause is just a different long-lived holder:

1. **Accidental globals.** In sloppy mode, assigning to an undeclared name (`total = 0` with no `let`) creates a property on the global object, which lives as long as the page. Prevent it with `let`/`const` and strict mode, which ES modules are by default, where the same line throws instead.
2. **Event listeners never removed.** The browser keeps every listener you add, and the listener keeps everything its closure can see. Remove it in cleanup (`removeEventListener` with the *same* function reference, or React's `useEffect` return).
3. **Timers never cleared.** A running `setInterval` is held by the browser forever, along with its callback and whatever that callback closed over. Call `clearInterval`/`clearTimeout` in cleanup.
4. **Closures holding big objects.** A small callback stored somewhere long-lived keeps its whole scope alive, including large data it does not even use (Q25).
5. **Detached DOM nodes.** An element removed from the page but still stored in a JavaScript variable, array or map cannot be freed, and neither can its children.
6. **Caches that only grow.** A `Map` used as a cache keyed by objects keeps those objects alive forever. A `WeakMap` does not, because its keys do not count as references (§9.3).

**How to find one:** in DevTools' Memory tab, take a heap snapshot, repeat the suspect action a few times, take another, and compare. Objects whose count keeps rising, and "Detached" DOM elements, are the leak; the Retainers panel shows what is holding them.

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

Short answer: currying turns a function that takes several arguments, `add(a, b)`, into a chain of functions that each take one, `add(a)(b)`. Each call returns a new function that remembers the arguments so far in a closure, until it has them all and runs the original.

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

**How the generic `curry` works.** `fn.length` is the number of parameters `fn` declares (3 here). Each call adds its arguments to the ones collected so far; once there are at least that many, it calls `fn` with all of them, otherwise it returns another function waiting for more. That is why `curriedSum(1, 2)(3)` works as well as `curriedSum(1)(2)(3)`.

**Why you would want it.** You fix some arguments once and get back a specialised function to reuse: `const add5 = add(5)`, or `const logError = log('error')`. Those one-argument functions then slot straight into `map`, `filter` or a `compose` pipeline, which is where functional-style code uses it. (Fixing some arguments at once, as `bind` does, is called partial application; currying is the one-argument-at-a-time form of it.)

**The gotcha to volunteer:** `fn.length` does not count a parameter with a default value, anything after it, or a rest parameter. So `curry((a, b = 1) => …)` sees a length of 1 and calls the function after the first argument, and a function written as `(...args)` has length 0 and runs immediately.

---

**Q19: How does garbage collection work in JavaScript?**

Short answer: the engine frees any object your program can no longer **reach**. It does not track whether you still "need" something, only whether any chain of references leads to it from a starting point. Engines like V8 add a generational split on top of that, so the common case is cheap.

1. **Mark-and-sweep, the core idea.** Start from the "roots", the things that are always reachable: the global object and the variables of every function currently on the call stack. Follow every reference from them and mark each object you reach. Anything left unmarked cannot be reached by any code, so it is swept (freed). This is why two objects that point at each other are still collected once nothing else points at them.

2. **Generations, because most objects die young.** Most objects are temporary: the array built inside one function call, the object returned and immediately destructured. So V8 splits the heap in two:
   - **Young generation** (the "nursery"): new objects go here, and it is collected often with a fast *copying* collector (V8 calls it Scavenge), which copies the few survivors out and treats the rest of the space as free in one go.
   - **Old generation**: objects that survived a couple of young collections move here. It is collected less often with mark-sweep plus *compaction*, which slides surviving objects together so free memory is not left in scattered small gaps.

3. **Incremental and concurrent work.** Marking a large heap in one go would freeze the page, so much of it is done in small slices between your code, or on background threads, to keep pauses short enough not to drop animation frames.

You cannot trigger or control collection from JavaScript. What you control is reachability: remove listeners and clear timers you no longer need, drop references held by long-lived objects (a module-level cache, a global array), and use `WeakMap`/`WeakSet` when attaching data to objects you do not own. Setting a *local* variable to `null` rarely helps, because it becomes unreachable when the function returns anyway. Q15 covers the leaks that follow when this goes wrong.

---

**Q20: Explain the `Symbol` primitive. What are well-known symbols?**

Short answer: `Symbol()` creates a value that is guaranteed to be unique, and its main use is as an object property key that **cannot collide** with any other key. A string key like `'id'` can clash with a property someone else adds; a symbol key cannot, because no other code can produce the same symbol unless you hand it over. Symbol keys are also skipped by `Object.keys`, `for...in` and `JSON.stringify`, so they suit metadata you do not want showing up in normal use. The text passed in (`'description'`) is only a label for debugging; it does not make two symbols equal.

```js
const s1 = Symbol('description');
const s2 = Symbol('description');
s1 === s2;  // false (always unique)
```

**Well-known symbols** are symbols the language itself looks for on your objects. They are hooks: define a method under one of these keys and built-in operations call it. Because they are symbols, adding them can never clash with your own property names, which is exactly why the language used symbols for them.
- `Symbol.iterator` — read by `for...of`, spread (`[...obj]`), destructuring and `Array.from`. It must return an iterator (an object with a `next()` method). Arrays, strings, `Map` and `Set` already have one, which is why they work in `for...of` and a plain object does not.
- `Symbol.toPrimitive` — called whenever the object has to become a primitive: `+obj`, `` `${obj}` ``, `obj + 1`, `obj < 5`. It receives a hint (`'number'`, `'string'` or `'default'`) saying what the operation wants, and it takes priority over `valueOf` and `toString`. The `Money` example below uses it.
- `Symbol.hasInstance` — a static method that `x instanceof C` calls instead of walking the prototype chain. It lets a class decide membership by shape (`static [Symbol.hasInstance](v) { return typeof v?.amount === 'number'; }`). Rarely a good idea in application code, because it makes `instanceof` lie, but it explains why `instanceof` is not always a prototype check.
- `Symbol.toStringTag` — a string that `Object.prototype.toString.call(obj)` puts in its `[object …]` output. That is why `Object.prototype.toString.call(new Map())` prints `[object Map]`, and why a class with `get [Symbol.toStringTag]() { return 'Money'; }` prints `[object Money]` instead of `[object Object]`.

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

Explicit resource management (ES2027) binds cleanup to a variable's **scope** rather than to a hand-written block, which fixes three things.

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

**Q28: What is the difference between `map()`, `filter()` and `reduce()`, and how do you choose between them?**

All three walk an array, call your callback once per element, and **return something new without changing the original**. The difference is the *shape* of what comes back, and that shape is how you choose:

| Method | Returns | Length of result | Callback returns | Use it when |
|---|---|---|---|---|
| `map` | a new array | **always the same** as the input | the new value for this slot | transforming every item: prices to strings, users to `<li>`s |
| `filter` | a new array | **same or shorter** | true/false: keep this item? | selecting a subset: paid orders, active users |
| `reduce` | **anything**: number, object, array, Map | n/a | the new accumulator | combining many items into one: a total, a lookup by id, a count per group |

A quick way to decide: *same number of things, changed?* `map`. *Fewer things, unchanged?* `filter`. *One thing out of many?* `reduce`. They chain naturally in that order: filter what you need, map it to the shape you want, reduce it to an answer.

```js
const orders = [
  { id: 1, total: 40, paid: true },
  { id: 2, total: 15, paid: false },
  { id: 3, total: 60, paid: true },
];

// map: same length, each item transformed
console.log(orders.map(o => o.id));                     // [1, 2, 3]

// filter: same items, fewer of them
console.log(orders.filter(o => o.paid).length);         // 2

// reduce: many items in, one value out
console.log(orders.reduce((sum, o) => sum + o.total, 0)); // 115

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

**The three gotchas that come up in interviews**, all in the demo above:

- **`map` passes three arguments, `(value, index, array)`.** `['1','2','3'].map(parseInt)` calls `parseInt('2', 1)` and `parseInt('3', 2)`, and those radixes are invalid for those digits, so you get `NaN`. Write `map(s => parseInt(s, 10))` or `map(Number)`.
- **`filter` keeps anything *truthy*.** `filter(Boolean)` is a handy way to drop `null` and `undefined`, but it also drops `0`, `''` and `NaN`. If `0` is a valid value, say what you mean: `filter(x => x != null)`.
- **Always give `reduce` an initial value.** Without one it uses the first element as the starting accumulator, which throws a `TypeError` on an empty array and gives the wrong type when you are building an object from an array of objects.

**When not to use them.** `reduce` can do anything, and that is its weakness: a `reduce` that builds three things at once is harder to read than a `for...of` loop. If the callback needs a comment to explain it, a loop is usually clearer. Use `forEach` (or a loop) for side effects such as logging or DOM updates. Using `map` there builds an array nobody reads, and says "transform" when you mean "do". And a long chain walks the array once per step. That does not matter for hundreds of items, but in a hot path over large arrays a single loop is faster.

---

**Q29: A variable captured by a closure keeps returning an outdated value. Why does this happen, and how is it different from a closure retaining memory unnecessarily?**

Both problems come from the same fact: **a closure keeps a reference to the variables of the scope it was created in**, for as long as the closure itself is alive. The two symptoms are opposite. A **stale closure** holds on to the *wrong variable*, so it shows an old value. A **retaining closure** holds on to the *right variable for too long*, so memory is never freed.

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

**Why a closure can go stale when it reads live variables.** Part 1 shows that a closure does *not* take a snapshot: change `live` and the closure sees `5`. Staleness happens when the code creates a **new variable** each time, and an old closure is still attached to an old one. That is exactly how a React component works: every render calls the function again, so every render has its own `count`. A callback registered during the first render (an effect with `[]`, a `setInterval`, a subscription) is permanently attached to render one's `count`, so it logs `0` forever. The closure isn't broken. It is faithfully reading a variable nobody updates any more.

**Fixes for stale values:** list the value in the dependency array so the callback is recreated; use the functional update `setCount(c => c + 1)`, which asks React for the current value instead of reading a captured one; or keep the latest value in a ref when the callback must stay the same function.

**Why retention is different.** In part 3 the value is correct. The problem is *reachability*: as long as something long-lived (a `window` listener, an interval, a cache, a global array) references the closure, everything the closure can see stays in memory, including `big`. Two details make this worse than it looks. The closure keeps the whole variable, so a closure that needs one field of a large response keeps the entire response. And in V8, closures created in the same scope share **one** environment, so a tiny callback can keep `big` alive because a *sibling* closure in that scope used it.

**Fixes for retention:** remove the listener, clear the interval, or unsubscribe in the cleanup; copy out only the field you need before creating the closure; and set long-lived references to `null` when you are done. Q25 covers the leak side in depth.

| Aspect | Stale closure | Retained memory |
|---|---|---|
| Symptom | Wrong, old value | Correct value, memory grows |
| Cause | Closure attached to an **old** variable | Closure **still reachable** from something long-lived |
| Where it shows up | Effects, timers and subscriptions in React | Listeners, intervals, caches that are never cleaned up |
| Fix | Dependencies, functional updates, refs | Cleanup, unsubscribe, narrower captures |

---

**Q30: An error thrown inside an asynchronous callback escapes the surrounding `try/catch`. Why, and where should the error be handled?**

`try/catch` only catches errors thrown **while the code in its block is running**, meaning while its stack frame is on the call stack. An asynchronous callback does not run then. `setTimeout(cb)`, `fetch(...).then(cb)` and an event listener only *schedule* `cb`. The `try` block finishes and its frame is gone. Later, the event loop calls `cb` from an empty stack, so when it throws there is no `try` above it anywhere. The error is reported as uncaught (for a thrown error) or as an unhandled rejection (for a promise).

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

(These two are tagged as plain text on purpose: running them would produce real uncaught errors.)

**Handle the error where the code actually runs.** There are four places, from most to least preferred:

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

1. **`await` inside `try`**. `await` resumes the function *inside* the `try` block, so a rejection is thrown right there and the `catch` works. This is the normal answer, and the most common bug is simply forgetting the `await`.
2. **`.catch()` on the promise**, when you are not in an `async` function. Attach it to the *end* of the chain, and remember a `.catch` that returns a value turns the failure into a success.
3. **`try/catch` inside the callback** for timers, event listeners and other non-promise callbacks, because that is the stack the error is thrown on.
4. **Global handlers as a safety net**: `window.addEventListener('error', …)` and `'unhandledrejection'` for reporting what the first three missed (see §10.1). They are for logging, not for recovery, because by then you've lost the context of what failed.

Why the demo prints `2` before `1`: the `.catch` call starts first, because `withAwait()` is only called on the last line, and `withAwait` then needs one more microtask to resume after its own `await`. The timer prints last because it is a task, and every microtask runs before the next task.

**The React version of the same question**: an error boundary is effectively a `try/catch` around rendering, so it cannot catch an error in an event handler or a `fetch`. See React Q56.

---

### How JavaScript Works Under the Hood

Short interview answers. The full explanations, with runnable examples, are in §1.

**Q31: What actually happens when the browser runs your JavaScript?**

An **engine** (V8 in Chrome and Node, SpiderMonkey in Firefox, JavaScriptCore in Safari) parses the code into a syntax tree, turns it into bytecode and starts running it, then compiles the functions that run often into fast machine code (JIT compilation), and throws that code away again if its assumptions stop holding (deoptimisation). The **runtime** around it, the browser or Node, supplies everything that is not the language: timers, `fetch`, the DOM, files, and the event loop. That split is why `setTimeout` exists in both but `document` only in the browser. While it runs, the call stack tracks what is executing, the heap holds objects, and the garbage collector frees what nothing can reach. Full explanation: §1.1.

---

**Q32: What is an execution context, and how does the call stack work?**

Each function call creates an **execution context** (its local variables, its `this`, and a link to the outer scope), which is pushed onto the **call stack**; returning pops it. Only the top one is running. Each context is set up in two phases: a creation phase, where function declarations are stored whole, `var` becomes `undefined` and `let`/`const` are reserved but not ready (the temporal dead zone), then the execution phase. That creation phase is what "hoisting" means. Unbounded recursion overflows the stack with a `RangeError`, and async callbacks only run once the stack is empty. Full explanation: §1.2.

---

**Q33: How do function references work? What is the difference between `fn` and `fn()`?**

A function is an object, and its name is a variable holding a **reference** to it. `fn` is the function itself; `fn()` runs it and gives you the result. Three bugs follow from mixing them up: `setTimeout(save(), 1000)` runs `save` immediately; `removeEventListener` with a freshly written arrow removes nothing, because it is a different function object; and passing `user.greet` on its own loses `this`, because the reference does not carry the object with it. Full explanation: §1.3.

---

**Q34: What is a Web Worker (a worker thread), and when should you use one?**

A worker is a **second JavaScript thread** with its own call stack, memory and event loop. It cannot touch the DOM, and it talks to the main thread only through `postMessage`, which **copies** the data (large buffers can be *transferred* instead). Use one for CPU-heavy work over roughly 50 ms (parsing, image processing, compression) so the page stays responsive. It does not help with network requests, which are already non-blocking, or with DOM updates. Know the kinds apart: dedicated and shared workers compute; a Service Worker is a network proxy; Node has the same idea as `worker_threads`. Full explanation: §1.7.

---

### About the Language Itself

Questions interviewers use to open a conversation, or to check you understand the platform and not just the syntax.

**Q35: Why is JavaScript so popular, and why do most companies use it?**

**Short answer:** because it is the only language every browser runs, so everyone building for the web must use it, and Node.js later let the same language run on servers. That gave it the largest developer community, and the largest package ecosystem (npm), and the two feed each other. It was the most-used language in Stack Overflow's 2025 survey, at 66% of respondents.

**For a company, the practical reasons are:**

- **One language for the whole product:** web front end, back end (Node.js), mobile (React Native) and desktop (Electron). Teams can share code, types and people.
- **Hiring:** there are more JavaScript and TypeScript developers than for almost any other language.
- **Speed of building:** npm has a package for almost everything, and there is nothing to install to start.
- **Good enough performance** for most web servers and UIs, thanks to JIT compilers and its non-blocking I/O.

**What makes the answer strong:** naming the trade-offs too. JavaScript has quirks it can never remove, dynamic typing that hurts big codebases (hence TypeScript), and a single thread for your code (hence workers for CPU-heavy work). Full explanation with the history: §1.8.

---

**Q36: What is the difference between JavaScript and ECMAScript? Who decides what gets added to the language?**

**Short answer:** **ECMAScript** is the *specification*, the official document that defines the language (ECMA-262). **JavaScript** is the language you use, as implemented by engines such as V8, SpiderMonkey and JavaScriptCore, plus whatever the environment adds (the DOM in browsers, `fs` in Node). "ES2015" or "ES2024" names a version of the specification.

The specification is maintained by **TC39**, a committee of Ecma International made up of browser makers, companies and invited experts. New features go through numbered **stages**:

| Stage | Meaning |
|---|---|
| **0** | an idea someone has proposed |
| **1** | the committee agrees the problem is worth solving |
| **2** | a draft of the solution is chosen |
| **2.7** | the design is approved; tests are being written (this stage was added in 2024) |
| **3** | ready to implement; engines start shipping it, often behind a flag |
| **4** | finished: two engines ship it, and it goes into the next yearly edition |

A new edition comes out every June (ES2024, ES2025 …). That is why you can use a feature like `Object.groupBy` before your team says "we're on ES2024": what matters in practice is whether the engines you target support it, not the edition number (§9.6 lists what shipped when).

**Two related facts people get wrong:** JavaScript has nothing to do with Java apart from the name, which was a 1995 marketing decision; and `setTimeout`, `fetch` and `document` are not part of ECMAScript at all. They come from the browser or Node (§1.1).

---

**Q37: Is JavaScript compiled or interpreted?**

**Short answer:** both, which is why "interpreted" is an outdated answer. Modern engines start by **interpreting** bytecode so the code runs immediately, then **compile** the functions that run often into machine code while the program is running. That is called **just-in-time (JIT) compilation**.

In V8: the source is parsed into a syntax tree, turned into bytecode that its interpreter (Ignition) starts running at once, and hot functions are compiled by optimising compilers (Maglev, then TurboFan) using the types they have seen so far. If those assumptions stop holding, for example a function that always got numbers suddenly gets a string, the engine throws the fast code away and goes back to bytecode (deoptimisation).

**How it differs from a language like C or Go:** those are compiled **ahead of time**, into a machine-code file, before they run. JavaScript is shipped as source code (or minified source) and compiled on the user's machine, every time. That is also why a syntax error anywhere in a file stops the whole file before its first line runs: the engine parses everything first.

Full explanation with a runnable example: §1.1.

---

**Q38: Why do most teams use TypeScript instead of plain JavaScript today?**

**Short answer:** TypeScript is JavaScript with **type annotations** that are checked before the code runs, and then removed. It catches a whole class of bugs at build time instead of in production, and it makes large codebases safe to change. It adds no runtime cost, because what runs in the browser is still plain JavaScript.

**What it buys a team:**

- **Mistakes caught while typing.** Calling a function with the wrong arguments, reading a property that doesn't exist, forgetting that a value can be `null`: TypeScript reports these in the editor, before anyone runs the code.
- **Safe refactoring.** Rename a field and the compiler lists every place that must change. In plain JavaScript you find out when a user hits the page you missed.
- **Code that explains itself.** A function's type is documentation that cannot go out of date, and editors use it for autocomplete.
- **Contracts between teams and services,** for example types generated from an API's OpenAPI description, so a backend change breaks the frontend build rather than the live app.

**What it does not do**, and it is worth saying: it does **not** check anything at runtime. Data from an API, `JSON.parse` or `localStorage` can still be the wrong shape, so you still validate at those boundaries (the TypeScript guide's Q27). It adds a build step and some learning, which is why small scripts and quick prototypes often stay in plain JavaScript.

---

**Q39: What are JavaScript's weaknesses, and when would you choose a different language?**

**Short answer:** JavaScript is a poor fit for **CPU-heavy work**, for systems where **every bit of performance or memory control matters**, and it carries **permanent quirks** from its early design. Choose something else when the job is mainly heavy computation, very low-level, or when the ecosystem you need lives elsewhere.

**The weaknesses, and how teams live with them:**

| Weakness | Why it exists | What people do about it |
|---|---|---|
| Quirks: `==` coercion, `typeof null`, `this` rules | the web can't break old sites, so early mistakes stay forever | `===`, linters, `strict` mode, modern syntax |
| Dynamic typing | designed for small scripts | TypeScript |
| One thread for your code | a simple, safe model for UI code (§1.4) | workers for CPU-heavy work (§1.7) |
| Less predictable performance than compiled languages | JIT compilation and garbage collection | fine for most apps; hot paths can move to WebAssembly or a native service |
| Huge dependency trees | a culture of small packages | lockfiles, auditing, fewer dependencies |

**When a different language is the better choice:**

- **Heavy computation:** machine learning, data processing, video: **Python** for its libraries, or **C++/Rust/Go** for speed.
- **Systems programming,** where you need control over memory: **Rust, C, C++**.
- **High-throughput back ends** where teams want strong concurrency and simple deployment: **Go, Java, Kotlin, C#**.
- **Native mobile features** or the smoothest possible mobile UI: **Swift** and **Kotlin**, although React Native covers most apps.

**The balanced line to end on:** for the front end there is no real alternative, and for back ends that mostly wait on databases and APIs, Node.js is a perfectly good choice. The weakness matters only when the work is mostly computing, not waiting.

---

**Q40: Why do we need closures? What would you use them for?**

**Short answer:** closures are how a function **keeps data between calls without making it global**. Every time you need a function that remembers something (a setting, a counter, a cache, a timer) and you don't want anything else to be able to change it, a closure is the tool. Q2 covers *what* a closure is; this is *why* the language needs them.

Without closures you would have two bad options for remembered data: a **global variable**, which any code can change by accident, or an **object property**, which anyone can also read and overwrite. A closure gives you a third: data that only the functions created alongside it can reach.

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

**Where you already use closures every day:**

- **Event handlers and callbacks** remember the variables around them when they run later: `button.addEventListener('click', () => save(userId))` still knows `userId` long after the surrounding function returned.
- **`debounce`, `throttle`, `once` and `memoize`** each keep their timer, flag or cache in a closure (Q16 and Q26 build two of them).
- **React hooks:** every function inside a component closes over that render's props and state. That is why a handler sees the right value, and also why a stale closure shows an old one (Q29).
- **Modules and the module pattern:** values declared inside a module (or an older immediately-invoked function) stay private unless exported.
- **Partial application and currying:** `const add5 = (x) => add(5, x)` fixes one argument now and takes the rest later (Q18).

**The cost to mention:** a closure keeps everything it references alive, so a long-lived closure (an event listener that is never removed, an interval that is never cleared) can hold large objects in memory. Q25 covers that leak.

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

**Why they interleave.** Evaluation is *pull-based*: `toArray()` asks `take(1)` for a value, which asks `filter`, which asks `map`, which asks the source iterator for one element. So each element travels the **entire pipeline** before the next one is touched, and the pulling stops the moment `take(1)` is satisfied. An array chain works the other way round: `[1, 2, 3].map(f)` runs `f` on every element at once and builds a finished array, so it would have printed `map 1, map 2, map 3`, then `filter 2, filter 4, filter 6`, including work on an element the answer never needed.

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

**First, what `using` is.** ES2027 adds *explicit resource management*: declare a variable with `using` instead of `const`, and when the surrounding block ends, JavaScript automatically calls that object's `[Symbol.dispose]()` method. It is the language-level version of Python's `with` or C#'s `using` — a way to guarantee cleanup (close the file, release the lock, roll back the transaction) without writing `try`/`finally` by hand.

So `make('a')` returns an object whose only job is to log when it is disposed, and `using a = make('a')` says "clean this up when `run()` exits".

**Line by line:**

| Prints | Why |
|---|---|
| `body` | the ordinary statement runs first |
| `dispose b` | `throw` starts unwinding the scope — cleanup runs **before** the error leaves the function, and **`b` goes first** because it was declared last |
| `dispose a` | then the one declared before it |
| `caught boom` | only now does the error reach the caller's `catch` |

The two surprises are the **order** (last declared, first disposed) and the **timing** (cleanup completes before the exception escapes). Both are deliberate.

The order is **LIFO** (last in, first out): `b` was declared last, so it disposes first. This mirrors nested `try`/`finally` blocks, and it is the only order that can be correct in general — if `b` was constructed using `a` (a transaction opened on a connection, a span inside a tracer), then `a` must still be alive while `b` cleans up.

The timing: disposal happens **before the exception propagates out of the function**. The `throw` begins unwinding the scope; the scope's exit runs the disposal stack; only then does the error continue to the caller's `catch`. So both `dispose` logs land before `caught boom`. This is exactly the guarantee `finally` gives you, which is the point — `using` is `finally` with the boilerplate removed and the ordering handled for you.

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

**First, what `Temporal` is.** It is the ES2027 replacement for the `Date` object, added because `Date` has been the language's worst-designed API for thirty years — it mutates in place, conflates a date with a timestamp, and handles time zones badly. `Temporal.PlainDate` is exactly what the name says: a calendar date with no time and no time zone, which is the right type for a birthday or an invoice date.

This snippet puts the old and new APIs side by side on the same question — *what is one month after January 31?* — and they disagree.

**Line by line:**

| Prints | Why |
|---|---|
| `2026-01-31` | `d.add(...)` returned a **new** date and we ignored it — `Temporal` objects can never be modified, so `d` is untouched |
| `2026-02-28` | using the return value this time: February has no 31st, so `Temporal` **clamps** to the last valid day |
| `2026-03-03` | legacy `Date` instead **overflows** — it builds "February 31", which rolls forward into March |

So the first line is about *immutability* and the difference between the second and third is about *what a calendar should do with an impossible date*.

**Immutability.** Every `Temporal` type is frozen; `add`, `subtract`, `with`, `round` and friends all return a **new** object and never touch the receiver. So `d.add({ months: 1 })` on line 2 computes a value and throws it away — `d` is still `2026-01-31`. This is the single most common `Temporal` mistake among developers coming from `Date`, where `setMonth` mutates in place and returns a timestamp number. The mutation-based API was the source of countless aliasing bugs (two variables pointing at the same `Date`, one of them "helpfully" advanced); making the types immutable eliminates the class entirely, at the cost of having to remember to use the return value.

**Clamping instead of overflow.** January 31 plus one month has no obvious answer, because February 31 does not exist. `Temporal`'s default `overflow: 'constrain'` mode **clamps the day to the last valid day of the target month**, giving `2026-02-28`. That matches how humans reason about "a month from the 31st" and how subscription billing works. Legacy `Date` instead lets the invalid day **overflow** into the next month: `setUTCMonth` builds February 31, which normalises to March 3 (2026 is not a leap year, so February has 28 days, and 31 − 28 = 3). The demo uses the UTC methods on purpose: `new Date(2026, 0, 31)` is local midnight, and `toISOString()` prints UTC, so east of Greenwich (India, for example) the same code prints `2026-03-02`, a day early — a second `Date` trap on top of the first. Silent overflow is why "renew one month later" code drifts and occasionally skips a month entirely.

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

"Asynchronous" means *later*, not *somewhere else*. A `.then` callback still runs on the **main thread**, the same thread that handles clicks, runs timers and paints the screen. The promise only decides *when* the callback runs.

That "when" is the **microtask queue**, and it has one rule that causes this: after each task, the engine runs **every** microtask in the queue, including any queued while it is running, before it does anything else. Each `.then` step here queues the next one as a microtask, so all 20 steps run back to back with no gap between them. The timer was due at 0 ms and waits the full 200 ms. A click handler, a scroll or a paint would wait exactly the same way. From the user's side, the page is frozen, even though no single function ran for more than 10 ms.

The extreme case is a microtask that queues itself (`function starve() { Promise.resolve().then(starve); }`). It never ends, so the page never paints again, and there is no long function in the profiler to blame, just an endless run of tiny ones.

**The fix is to give the browser a turn**, which means going back to the *task* queue, not the microtask queue:

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

Same 200 ms of total work, but now each step ends with `await` on a `setTimeout`, which is a *task*, so the browser can handle input, timers and a paint between steps. The timer now fires after about one step. In modern Chromium, `await scheduler.yield()` does the same thing and puts your work back at the front of the queue rather than the back. When the work is genuinely heavy (parsing a large file, image processing), move it to a **Web Worker**, which really is a different thread.

**Takeaway:** promises change *when* code runs, not *where*. A long run of microtasks blocks the page as surely as one long function; yield to the task queue, or move the work off the main thread.

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

| Line | Why |
|---|---|
| `456` | `a[b]` and `a[c]` are the **same** key, so the second assignment overwrote the first |
| `["[object Object]"]` | both objects became the string `"[object Object]"` when used as a key |

A plain object's keys can only be **strings or symbols**. When you use anything else in square brackets, JavaScript converts it to a string first. A plain object converts to `"[object Object]"`, whatever is inside it, so `b` and `c` produce the identical key. `a[b] = 123` stores under `"[object Object]"`, `a[c] = 456` overwrites it, and `a[b]` reads that same slot back.

The same conversion is why `obj[1]` and `obj['1']` are one property, and why `obj[[1, 2]]` is `obj['1,2']`.

**When you need objects as keys, use a `Map`**, which compares keys by identity and never converts them:

```js
const m = new Map();
const b = { key: 'b' };
const c = { key: 'c' };
m.set(b, 123);
m.set(c, 456);
console.log(m.get(b), m.size); // 123 2
```

**Takeaway:** object keys are strings (or symbols). Any object used as a key becomes `"[object Object]"`, so different objects collide. Use a `Map` when the key is an object.

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

Key order is defined by the language, and it is **not** simply insertion order. `Object.keys` (and `for...in`, `JSON.stringify` and `Object.entries`) list keys in three groups:

1. **Integer-like keys**, in ascending numeric order: `"1"`, `"2"`.
2. **Every other string key**, in the order they were added: `"b"`, `"a"`, `"-1"`, `"01"`.
3. **Symbol keys**, in insertion order (only `Reflect.ownKeys` and `Object.getOwnPropertySymbols` show these).

So `2` and `1` jump to the front and swap, even though `b` was written first.

The surprising part is what counts as "integer-like". A key qualifies only if it is a **canonical** non-negative integer, meaning converting it to a number and back gives the same string. `"-1"` is negative, so it is not. `"01"` converts to `1`, which prints back as `"1"`, not `"01"`, so it is not either. Both stay in insertion order with the ordinary strings.

This bites in practice when an object is used as a lookup keyed by id. `{ 30: …, 10: …, 20: … }` comes back as `10, 20, 30`, so any UI that relies on "the order the server sent them" is silently re-sorted. If order matters, use an array or a `Map`, both of which keep insertion order for every key.

**Takeaway:** integer-like keys come first in ascending order, then string keys in insertion order. Do not rely on object key order to mean "the order I added them".

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
| `Asha` | `name` is a string, so the copy got its own value; reassigning it touches only the copy |
| `Delhi` | `address` was copied as a **reference**; both objects point at the same `{ city }` |
| `2` | `tags` is the same array in both, so `push` changed the one array they share |
| `true` | proof: the two `address` properties are the same object |

Spread makes a **shallow** copy. It creates a new outer object and copies each top-level property across. For a primitive (string, number, boolean) that copies the value itself. For an object or array, the "value" is a reference, so the copy gets another reference to the **same** nested object.

The rule for predicting these: **assigning a property of the copy is safe, mutating something the copy points to is not.** `copy.name = 'Ravi'` replaces a property on the new outer object. `copy.address.city = 'Delhi'` first reads `copy.address`, which is the shared object, and changes that.

To change a nested value without touching the original, copy each level on the path you change, which is how React and Redux state updates are written:

```js
const original = { name: 'Asha', address: { city: 'Pune' } };
const updated = { ...original, address: { ...original.address, city: 'Delhi' } };
console.log(original.address.city, updated.address.city); // Pune Delhi
```

For a full independent copy of plain data, use `structuredClone(original)` (see Q24).

**Takeaway:** spread copies one level. Nested objects and arrays are still shared, so mutating them through the copy changes the original.

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

JavaScript passes every argument **by value**, and for an object that value is a **reference**. This is often called *pass by sharing*. Inside `update`, the parameter `user` starts as a second reference to the same object as `person`.

- `user.age = 30` follows that reference and changes the shared object. `person` sees it.
- `user = { name: 'New', age: 99 }` does **not** touch the shared object. It points the local variable `user` at a brand-new object. `person` still points at the original.
- `user.age = 100` changes the new object, which nothing outside the function can reach. It is thrown away when the function returns.

So the original was changed exactly once, by the first line, and prints `Asha 30`.

The two operations look alike and are completely different: **mutating** (`user.age = …`) changes the object both variables share, while **reassigning** (`user = …`) only changes where one variable points. This is also why a function cannot replace the caller's object for them. If you want a new object, `return` it and let the caller assign it.

**Takeaway:** a function receives a copy of the reference. Changing properties through it affects the caller's object; reassigning the parameter does not.

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

| Line | Why |
|---|---|
| `1 1` | `fill` put the **same** object in all three slots, so there was only ever one `count` |
| `0 0` | `Array.from` called the arrow function three times, making three separate objects |

`fill(value)` evaluates its argument **once**, then writes that one value into every slot. For a number that is harmless. For `{ count: 0 }` it means every slot holds a reference to the same object, so incrementing through `grid[0]` changes what `grid[1]` and `grid[2]` show.

The same mistake appears with a nested array: `new Array(3).fill([])` gives three references to one inner array, so pushing into "row 0" pushes into every row. It is the classic cause of a 2D grid where setting one cell sets the whole column.

`Array.from({ length: 3 }, () => ({ count: 0 }))` passes a **function**, and `Array.from` calls it once per slot, so each call creates a new object. `new Array(3).fill().map(() => ({ count: 0 }))` works for the same reason. The parentheses around `{ count: 0 }` are needed because an arrow followed by a bare `{` reads it as a function body, not an object.

**Takeaway:** `fill` with an object shares that one object across every slot. Use `Array.from` with a factory function when each slot needs its own object or array.

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
| `string` | a `Date` is written as an ISO string and never turned back into a `Date` |
| `false` | a property whose value is `undefined` is **dropped** entirely |
| `null null` | `NaN` and `Infinity` are not valid JSON numbers, so they become `null` |
| `undefined` | functions (including methods) are dropped |
| `{}` | a `Map` has no enumerable own properties, so it becomes an empty object |
| `[null,null]` | inside an **array**, `undefined` and functions cannot be dropped (it would shift the indexes), so they become `null` |

The round trip copies only what JSON can express: strings, finite numbers, booleans, `null`, plain objects and arrays. Everything else is converted or lost **without any error**, which is what makes it dangerous. The clone looks fine until someone calls `clone.when.getTime()` and gets `TypeError: clone.when.getTime is not a function`.

It also fails loudly in two cases: a circular reference throws `TypeError: Converting circular structure to JSON`, and a `BigInt` throws `TypeError: Do not know how to serialize a BigInt`.

It is still fine for data that is already JSON-shaped, like an API response you have just parsed. For anything else, `structuredClone` (Q24) is the built-in answer.

**Takeaway:** the JSON round trip silently turns `Date` into a string, drops `undefined` and functions, turns `NaN`/`Infinity` into `null`, and empties `Map`/`Set`. Use it only on plain JSON data.

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
| `false` | the clone is a new object, not the original |
| `true` | the cycle was **recreated inside the copy**: `copy.self` points to `copy`, not back to `node` |
| `true true` | `Date` and `Set` come back as a real `Date` and a real `Set` |
| `DataCloneError` | functions cannot be cloned, so it throws instead of silently dropping them |

`structuredClone` is the built-in deep copy (browsers and Node 17+). It uses the same algorithm the browser uses to send data to a Web Worker with `postMessage`, which is why it understands far more types than JSON: `Date`, `Map`, `Set`, `RegExp`, typed arrays, `Blob`, `Error` and more.

It keeps a record of every object it has already copied. When it meets `node` a second time (through `node.self`), it reuses the copy it already made instead of looping forever. So a cycle in the original becomes the same cycle in the clone, and shared references stay shared.

What it will not copy, and the three things to say in an interview:

- **Functions and DOM nodes throw** `DataCloneError`. That is better than JSON's silent drop, because you find out immediately.
- **Class instances lose their class.** `structuredClone(new User())` returns a plain object with the same fields, so `instanceof User` is `false` and its methods are gone.
- **Getters are run, not copied.** The copy gets the value the getter returned at clone time.

**Takeaway:** `structuredClone` is the right deep copy for data. It preserves cycles, `Date`, `Map` and `Set`, but throws on functions and does not keep class prototypes.

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
| `prod-db` | `Object.freeze` is **shallow**: `db` is a separate object, and it is not frozen |
| `true` | writing to a frozen property throws a `TypeError` in strict mode |
| `3000` | the write to `port` never happened |

`Object.freeze(config)` locks the properties **of `config` itself**: none can be added, removed or reassigned. `config.db` is one of those properties, so you cannot point it at a different object. But the object it points to is untouched by the freeze, so `config.db.host = 'prod-db'` is an ordinary write to an ordinary object.

**The `'use strict'` line matters.** In strict mode (every ES module and every `class` body is strict), writing to a frozen property throws. In sloppy mode the same write fails **silently**: no error, and the value just does not change. Remove the first line and the `true` disappears, while `3000` stays the same. The silent version is the one that wastes an afternoon.

To freeze all the way down, walk the object and freeze every nested object too. Interview Q17 in §15 has a `deepFreeze` that does this. In TypeScript, `as const` gives the deep version at compile time only; nothing stops the write at runtime.

**Takeaway:** `Object.freeze` only freezes the top level. Nested objects stay writable unless you freeze them too, and a blocked write only throws in strict mode.

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
| `read #1 read #1` | the copy holds the plain value the getter returned, so reading it runs nothing |
| `read #2` | the original still has the getter, so reading it runs the getter again |
| `undefined` | the copy's `stamp` is a data property, with no `get` function |

Spread (and `Object.assign`) copies properties by **reading** each one from the source and **writing** the result into the target. Reading an accessor property calls its getter, so what gets copied is the value at that moment, not the getter. The copy is a snapshot: `copy.stamp` will say `read #1` forever.

That matters whenever a getter computes something live: a `get total()` on a cart, a `get isExpired()` on a token, a lazily computed value. After a spread, the copy stops updating. It also means spreading an object whose getter throws will throw.

To copy the getter itself, copy the **property descriptors** instead of the values:

```js
let reads = 0;
const source = { get stamp() { reads++; return 'read #' + reads; } };
const live = Object.defineProperties({}, Object.getOwnPropertyDescriptors(source));
console.log(live.stamp, live.stamp); // read #1 read #2
```

**Takeaway:** spread and `Object.assign` run getters and copy their current values. Use `Object.getOwnPropertyDescriptors` when the copy must keep the getter.

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

**In one line:** `var` makes **one** variable for the whole loop, while `let` makes a **new** variable for every iteration, and each arrow function remembers the variable, not the value it had.

The timers run after the loop has finished (§1.6: a `setTimeout` callback waits until the running code is done). By then:

| Loop | How many variables | What each timer sees when it finally runs |
|---|---|---|
| `var i` | one `i`, shared by all three callbacks (`var` is function-scoped, not block-scoped) | that single `i`, which the loop left at `3` |
| `let j` | a fresh `j` for each iteration (`let` is block-scoped, and a `for` loop creates a new binding each time round) | its own `j`: `0`, `1` and `2` |

Before `let` existed (2015), the fix was to create a new scope by hand for each iteration, for example with an immediately-invoked function: `(function (k) { setTimeout(() => console.log(k)); })(i)`. Today the fix is simply `let`. §5.3 walks through the same gotcha in more depth.

**Takeaway:** a closure captures a *variable*. Use `let` in loops so each iteration has its own.

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

**In one line:** before any code in a scope runs, JavaScript sets up its declarations (hoisting, §1.2): function declarations are ready to use, and `var`s exist but are `undefined`. Assignments then happen as each line runs.

| Line | Why |
|---|---|
| `function` | in the setup phase the **function declaration** wins, so before any line runs `greet` is the function |
| `string` | the line `var greet = 'hello'` then runs and replaces it with the string (the `var` part was already set up; only the assignment happens now) |
| `undefined` | inside `show`, the `var x` declaration is hoisted to the top of **`show`**, so this `x` is `show`'s own local variable, not the outer `x = 1`. At the `console.log` it exists but has not been assigned yet |

The second case is the one that causes real bugs: declaring a variable anywhere in a function **shadows** (hides) an outer variable with the same name for the *whole* function, even the lines above the declaration. With `let` or `const` the same code would throw instead of printing `undefined` (the next question), which is the safer failure.

(At the top level of an ES module, the first half would not even run: modules reject a `var` and a function declaration with the same name as a `SyntaxError`. That is why the demo puts it inside a function.)

**Takeaway:** declarations are set up before the code runs; assignments happen in place. Declare variables at the top of their scope, and prefer `let`/`const`.

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

**In one line:** the inner `let color` is hoisted to the top of the block but **not initialised**, so from the start of the block until that line, `color` means the *inner* variable, and touching it throws. That gap is the **temporal dead zone** (TDZ).

| Line | Why |
|---|---|
| `ReferenceError` | the block has its own `color`, which hides the outer one for the whole block. The inner one is not ready until its `let` line runs |
| `blue` | after the `let` line, the inner `color` has its value |
| `red` | outside the block, the outer `color` was never touched |

This is the same shadowing as `var` in the previous question, with one crucial difference: `var` gives you a silent `undefined`, and `let`/`const` give you an error pointing at the line. The error is the better outcome, because the bug shows up immediately instead of as a wrong value somewhere else.

**Takeaway:** `let` and `const` are hoisted too, but reading them before their line throws. A variable declared in a block hides any outer variable with the same name for the entire block.

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

**In one line:** a closure keeps a live link to the **variable**, not a copy of its value; and each call to `makeCounter` creates a **new** variable.

| Line | Why |
|---|---|
| `2` | `read` was created when `count` was `1`, but it looks `count` up when it is *called*. By then `count` is `2` |
| `3 1` | `a` and `b` came from two separate calls to `makeCounter`, and each call created its own `n`. `a` was called twice before, so this third call gives `3`; `b`'s `n` is untouched, so its first call gives `1` |

These two facts explain almost every closure question. The first is why closures show **fresh** values (and why they keep objects in memory, interview Q25). The second is how closures give each instance **private state**, which is the basis of the module pattern and of how React hooks keep state per component.

The opposite case, a closure that shows an *old* value, happens when the closure is attached to an old variable that has since been replaced, such as state from a previous React render (interview Q29).

**Takeaway:** closures read variables live, and every call to the outer function makes new variables.

---

### `this`

`this` is decided by **how a function is called**, not where it is written, except in arrow functions, which never have their own. The demo uses strict mode so the output is the same everywhere.

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

**Output:**
```text
Asha
undefined
undefined
["undefined","Asha"]
```

**Explanation:**

**In one line:** a normal function gets `this` from the object **before the dot at the call site**; an arrow function has no `this` of its own and uses the one from **where it was written**.

| Call | What `this` is | Why |
|---|---|---|
| `user.regular()` | `user`, so `Asha` | called as `user.something()`, so `this` is `user` |
| `user.arrow()` | `undefined` | an arrow takes `this` from the surrounding code. An object literal is not a scope, so the surrounding `this` is the top-level one, which in strict mode is `undefined` |
| `detached()` | `undefined` | the same function, but called on its own, with no object before the dot |
| `inner()` inside `later` | `undefined` | a plain call again: `inner` is a normal function called by itself |
| `innerArrow()` inside `later` | `user`, so `Asha` | the arrow uses `later`'s `this`, and `later` was called as `user.later()` |

The last row is why arrow functions were added: a callback inside a method (`array.map(...)`, `setTimeout(...)`) can use the method's `this` without `const self = this` or `.bind(this)`.

Without `'use strict'`, a plain call gets the global object as `this` instead of `undefined`, so the result depends on whether there happens to be a global `name`. In a browser there usually is (`window.name`, often an empty string), which produces confusing output rather than an error. Modules and classes are always strict.

**Takeaway:** never use an arrow function as an object method that needs `this`; do use arrows for callbacks *inside* methods. A method passed around on its own loses its object (§1.3).

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

**In one line:** JavaScript numbers are 64-bit floating point (the IEEE 754 standard), which stores numbers in binary with a fixed number of digits. Most decimal fractions cannot be written exactly in binary, and whole numbers above 2⁵³ cannot all be stored exactly either.

| Line | Why |
|---|---|
| `0.30000000000000004` | `0.1` and `0.2` are each stored as the nearest binary value, which is very slightly off; the tiny errors add up and become visible |
| `false` | so the sum is not exactly equal to the stored `0.3` |
| `true` | the usual way to compare: check the difference is smaller than `Number.EPSILON`, the gap between 1 and the next representable number |
| `9007199254740992` | above 2⁵³, not every whole number can be represented, so this one is rounded to its even neighbour |
| `9007199254740991` | `Number.MAX_SAFE_INTEGER`: up to here, every whole number is exact |
| `9007199254740994n` | a `BigInt` (the `n` suffix) stores whole numbers of any size exactly |

This is not a JavaScript bug. Python, Java and C behave the same way with floating-point numbers.

**What to do in real code:** for **money**, store whole cents (`1999`, not `19.99`) and format as a decimal only for display, which is what the Shopping Cart template does. For **IDs** from a database that can exceed 2⁵³, keep them as strings or use `BigInt`, because `JSON.parse` silently rounds large numbers.

**Takeaway:** never compare decimal results with `===`, keep money in integers, and treat very large IDs as strings.

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

**In one line:** `typeof` has a few answers that look wrong but are fixed forever for compatibility, and it is the one way to read an undeclared name without throwing.

| Line | Why |
|---|---|
| `object` for `null` | a bug from JavaScript's first version (1995). Fixing it would break existing websites, so it stays. Check for null with `value === null` |
| `number` for `NaN` | "Not a Number" is still a value of the number type: it is what failed arithmetic produces, such as `0 / 0` |
| `object` for `[]` | arrays are objects. Use `Array.isArray(value)` to detect them |
| `function` for a class | a class is a special kind of function under the hood (§6) |
| `undefined` for an undeclared name | reading an undeclared variable normally throws a `ReferenceError`, but `typeof` returns `'undefined'` instead. That is why older code checks `typeof window !== 'undefined'` to detect a browser |
| `true true` | the reliable checks: `Array.isArray` for arrays and `Number.isNaN` for NaN (the older global `isNaN('a')` converts first and says `true`) |

One exception to the undeclared-name rule: `typeof` does throw for a `let` or `const` variable in its temporal dead zone (Q29), because that variable *is* declared, just not ready yet.

**Takeaway:** `typeof` is for primitives and functions. For `null`, arrays and `NaN`, use `=== null`, `Array.isArray` and `Number.isNaN`.

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

**In one line:** `+` means **both** addition and joining strings, and if either side is a string it joins. Every other arithmetic operator (`-`, `*`, `/`) only does maths, so it converts strings to numbers.

| Line | Why |
|---|---|
| `3` | `-` only works on numbers, so `'5'` becomes `5` |
| `52` | `+` with a string on one side joins them: `'5' + '2'` |
| `10` | `*` converts both strings to numbers |
| `0` | a **unary** `+` (a `+` with nothing on its left) converts to a number; an empty string becomes `0` |
| `NaN` | `'a'` is not a number, so converting it gives `NaN` |
| `baNaNa` | read left to right: `'b' + 'a'` is `'ba'`; then `+'a'` (unary plus) is `NaN`, and `'ba' + NaN` joins to `'baNaN'`; then `+ 'a'` gives `'baNaNa'` |

The last line is a famous joke, but the rule behind it is practical: values from form inputs and URLs are **strings**, so `input.value + 1` joins instead of adding. Convert explicitly with `Number(value)` before doing maths, and check the result with `Number.isNaN`.

**Takeaway:** `+` joins if either side is a string; the other operators always convert to numbers. Convert user input with `Number()` yourself.

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

**In one line:** both are **defaults** doing something reasonable that is not what you meant: `sort` compares as text unless you give it a comparison, and `map` passes more arguments than `parseInt` expects.

| Line | Why |
|---|---|
| `1, 10, 20, 3` | with no comparison function, `sort` converts every item to a **string** and sorts alphabetically: `'10'` comes before `'3'` because `'1'` comes before `'3'` |
| `1, 3, 10, 20` | `(a, b) => a - b` returns a negative, zero or positive number, which tells `sort` the numeric order |
| `10, NaN, 2` | `map` calls its callback with `(value, index, array)`, and `parseInt`'s second parameter is the **radix** (the number base). So the calls are `parseInt('10', 0)` = 10 (0 means "work it out"), `parseInt('10', 1)` = NaN (there is no base 1), and `parseInt('10', 2)` = 2 (binary 10) |
| `3 1` | `Array(3)` with a single number creates an **empty array of length 3**, not `[3]`. `Array.of(3)` always means "an array containing these items", so it is `[3]`, length 1 |

Two more facts worth knowing: `sort` changes the array it is called on (use `toSorted()` for a sorted copy), and `['1', '2', '3'].map(Number)` is the safe way to convert, because `Number` takes only one argument.

**Takeaway:** always pass a comparison to `sort` for numbers, and never pass `parseInt` straight to `map`.

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

**In one line:** a `.catch` that returns normally **recovers** the chain: the value it returns becomes the next step's result, exactly like a `try/catch` that handles an error and carries on.

| Line | Why |
|---|---|
| (no `then 1`) | the promise is rejected, so `.then(onFulfilled)` is skipped and the rejection passes down the chain |
| `caught boom` | `.catch` handles the rejection |
| `then 2 recovered` | `.catch` returned `'recovered'` without throwing, so the chain carries on as a success with that value |
| `finally` | `.finally` runs either way and passes the value through unchanged |

This is useful when intended (a fallback value when a request fails), and a bug when not. A common version: a helper does `.catch((err) => console.error(err))`, which returns `undefined`, so every caller's `.then` runs with `undefined` as though the request had succeeded. If a `catch` cannot actually handle the error, **throw it again** (`throw err`) so the chain stays rejected.

**Takeaway:** in a promise chain, `.catch` turns a failure into a success unless it throws again. Put `.catch` where you can genuinely handle the error, usually at the end.

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

**In one line:** `return load()` hands back the promise **without waiting for it**, so the function has already left its `try` block by the time the promise rejects. `return await load()` waits **inside** the `try`, so the rejection is thrown there and the `catch` runs.

| Line | Why |
|---|---|
| `caught inside withAwait` | `await` pauses *inside* the `try`. When `load()` rejects, the `await` throws at that point, the `catch` runs, and its return value becomes the result |
| `withoutAwait rejected: network down` | `return load()` returns the promise straight away. The `try` block finishes normally (nothing has been thrown *yet*), and when the promise rejects later, the rejection goes straight to the caller |

The order is worth noticing too: `withAwait` settles first, because `withoutAwait`'s result has to follow the returned promise, which takes a couple of extra steps in the microtask queue.

Outside a `try` block, `return promise` and `return await promise` give the same result. Inside `try`, `catch` or `finally`, the `await` changes the behaviour, and it also gives a clearer stack trace in errors (§8.5 covers mixing `async` with `.then`).

**Takeaway:** inside a `try` block, write `return await`, or the `catch` will never see the error.

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

**In one line:** calling `next(value)` **resumes** the generator and makes the paused `yield` evaluate to `value`. The first `next()` has no paused `yield` to resume, so whatever you pass to it is thrown away.

| Line | Why |
|---|---|
| `What is your name?` | the first `next` starts the generator, which runs to the first `yield` and hands out its value. `'ignored'` goes nowhere: nothing was waiting for it |
| `Hello, Asha` | `next('Asha')` resumes the first `yield`, which evaluates to `'Asha'`, so `first = 'Asha'`; the generator runs on to the second `yield` |
| `{"value":"Done, bye","done":true}` | `next('bye')` makes `second = 'bye'`, and the generator reaches `return`. A `return` value is delivered once, with `done: true` |
| `{"done":true}` | the generator has finished, so every later `next()` gives `done: true` and `value: undefined` (which `JSON.stringify` leaves out) |

So a generator is a conversation: each `yield` sends a value **out**, and the next `next(value)` sends a value **in**. This two-way flow is what Redux Saga is built on, and how `async`/`await` was originally implemented on top of generators.

One more detail: `for...of` and spreading (`[...gen]`) ignore the `return` value. They stop as soon as they see `done: true`, so `'Done, bye'` would never appear in a `for...of` loop.

**Takeaway:** the first `next()` only starts the generator; a value passed to `next` becomes the result of the `yield` that was paused.

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

**In one line:** default values in destructuring and parameters apply **only when the value is `undefined`**. `null`, `''`, `0` and `false` are real values, so the default is not used.

| Line | Why |
|---|---|
| `Hi, guest` | `name` is `undefined`, so the default applies |
| `Hi, null` | `null` is a value, so no default |
| `Hi, guest` | nothing was passed, so the parameter default `= {}` applies, and `name` inside it is `undefined` |
| `, guest` | `greeting: ''` is a value (an empty string), so it is used as it is |

This matters most with API data, where a missing field often arrives as `null`. When both should mean "use the default", use the **nullish coalescing** operator, which treats `null` and `undefined` alike: `const name = input.name ?? 'guest'`. Avoid `||` for this, because it also replaces `0` and `''`, which are often valid values.

Note the `= {}` after the destructuring pattern: without it, calling `greet()` with no argument would throw, because you cannot destructure `undefined`.

**Takeaway:** defaults cover `undefined` only. Use `??` when `null` should get the default too.

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

**In one line:** JavaScript adds some semicolons for you (**automatic semicolon insertion**, ASI). It adds one after a `return` that ends a line, and it does **not** add one before a line that starts with `[` or `(`.

| Line | Why |
|---|---|
| `undefined` | a line break right after `return` ends the statement, so the function runs `return;`. The `{ … }` below is then read as a block containing a label (`debug:`) and the expression `true`, and never runs |
| `TypeError` | no semicolon is added before a line starting with `[`, so the last two lines are read as `const b = a[1, 2].forEach(...)`. The comma operator makes `a[1, 2]` mean `a[2]`, which on the number `1` is `undefined`, and `undefined.forEach` throws |

Both are real bugs that pass code review, because the code *looks* fine.

**The fixes:** put the opening `{` on the same line as `return` (`return {`), which is the standard style anyway. If you write without semicolons, start any line that begins with `[`, `(` or a template literal with a semicolon (`;[1, 2].forEach(...)`). Or use semicolons and a formatter such as Prettier, which adds them for you.

**Takeaway:** never put a line break right after `return`, and don't start a line with `[` or `(` in semicolon-free code.

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

**In one line:** a `finally` block **always runs**, even after a `return` or a `throw`. If `finally` itself returns, that return **replaces** whatever the `try` was returning or throwing.

| Line | Why |
|---|---|
| `finally runs first` | the `try` has decided to return `'from try'`, but before the function actually exits, `finally` runs |
| `from try` | `finally` did not return anything, so the `try`'s value goes through |
| `from finally` | a `return` in `finally` overrides the `try`'s return |
| `finally wins` | the `try` threw, but the `return` in `finally` replaced the exception, so **the error vanished** with no trace |

The third case is the dangerous one. An error that should have reached the caller is silently thrown away, and nothing is logged. Linters flag it (ESLint's `no-unsafe-finally` rule).

**Use `finally` for cleanup only:** closing a file, hiding a spinner, releasing a lock. Never `return`, `throw` or `break` from it. (`using` declarations, §9.9, are the modern way to do cleanup that cannot forget.)

**Takeaway:** `finally` always runs, and a `return` inside it overrides both the `try`'s return and any error. Keep `finally` for cleanup.

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

**In one line:** a subclass's **fields are set after the parent constructor has finished**. `Base`'s constructor calls `this.describe()`, which runs `Child`'s version, before `Child` has had a chance to set `label`.

What happens during `new Child()`, in order:

1. `Child` has no constructor of its own, so it calls `Base`'s constructor (through `super()`).
2. `Base`'s constructor calls `this.describe()`. `this` is the new `Child` object, so **`Child`'s** `describe` runs. `label` does not exist yet: it prints `undefined`.
3. `Base`'s constructor returns, and only then are `Child`'s class fields initialised: `label = 'child'`.
4. The second `c.describe()` prints `child`.

Java behaves the same way (C# does not: it initialises fields before calling the base constructor). The rule of thumb is the same everywhere: **don't call overridable methods from a constructor**. The parent is running code that belongs to a child that has not been built yet.

This bites in real code when a base class calls `this.render()` or `this.init()` in its constructor and a subclass relies on its own fields there. The fix is to let the caller run `init()` after construction, or to pass the values the parent needs into `super(...)`.

**Takeaway:** subclass fields do not exist until `super()` returns. Never call a method that subclasses override from a constructor.

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

**In one line:** a `#` field is not a property with an unusual name; it is a **genuinely private slot** attached to the object, which only code inside the class body can reach.

| Line | Why |
|---|---|
| `100` | the `balance` getter is inside the class, so it can read `this.#balance` |
| `undefined` | `acc['#balance']` looks for an ordinary property literally called `"#balance"`, which does not exist. There is no way to reach `#balance` from outside, not with brackets, not with `Object.getOwnPropertyNames` and not from a subclass |
| `{"owner":"Asha"}` | private fields are invisible to `JSON.stringify` |
| `owner` | and to `Object.keys` |
| `true false` | `#balance in value` (the **ergonomic brand check**, ES2022) asks "was this object created by this class?". A plain object with a `balance` property fails it, which a `typeof value.balance === 'number'` check would not |

Before `#` fields (ES2022), "private" meant a naming convention (`_balance`) that nothing enforced, or a `WeakMap` or closure trick. TypeScript's `private` keyword is also only a compile-time check (TypeScript tricky Q21).

**Takeaway:** `#fields` are truly private: invisible to brackets, `Object.keys`, JSON and subclasses. Use `#x in obj` to check that an object really is an instance of your class.

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

**In one line:** JavaScript has **three** ways to compare values, and they disagree on exactly two cases: `NaN`, and `+0` versus `-0`.

| Line | Why |
|---|---|
| `true` | `===` treats `+0` and `-0` as equal |
| `false` | `Object.is` uses **SameValue**, which tells them apart |
| `true` | and treats `NaN` as equal to itself (`NaN === NaN` is `false`, tricky Q4) |
| `true -1` | `includes` uses **SameValueZero**: like `Object.is`, but `+0` equals `-0`. So it finds `NaN`. `indexOf` uses `===`, which never matches `NaN` |
| `-Infinity` | the sign of zero is real: dividing by `-0` gives negative infinity |
| `0 0` | but it is invisible when printed: `JSON.stringify` and `String` both show `-0` as `0` |

| Comparison | `NaN` equals `NaN`? | `+0` equals `-0`? | Used by |
|---|---|---|---|
| `===` | no | yes | `indexOf`, `switch` |
| SameValueZero | **yes** | yes | `includes`, `Map`, `Set` |
| `Object.is` (SameValue) | **yes** | **no** | React's state comparison |

`-0` appears from rounding tiny negative numbers (`Math.round(-0.4)`) and from multiplying by zero. It usually does not matter, but it is why `Object.is` exists, and it is the comparison React uses to decide whether state changed.

**Takeaway:** use `includes` (not `indexOf`) to search for `NaN`, and `Object.is` when you need to tell `-0` from `0`.

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

**In one line:** `arguments` is an array-like object holding every argument a **normal function** was called with. Arrow functions don't have their own; like `this`, they use the one from the surrounding function.

| Line | Why |
|---|---|
| `3` | `regular` was called with three arguments. Even though it declares no parameters, `arguments` holds them all |
| `from outer` | the arrow has no `arguments` of its own, so `arguments[0]` is `outer`'s first argument. `'ignored'` was passed to the arrow and is lost |
| `true false` | a rest parameter (`...args`) is a **real array**; `arguments` only looks like one, so it has no `map` or `filter` |
| `1 0 1` | `arguments.length` counts what was **passed** (`defaults(1)` passed one). A function's own `.length` counts the parameters *before the first default*: `regular` declares none, and `defaults(a, b = 2)` stops counting at `b` |

`arguments` comes from before ES2015. Modern code uses **rest parameters** instead: they are real arrays, they work in arrow functions, and the function's signature says what it accepts. You still meet `arguments` in older code and in polyfills.

**Takeaway:** prefer `...args` over `arguments`. Arrow functions have no `arguments` of their own, and `fn.length` counts parameters only up to the first default.

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

**In one line:** an array's `length` is just a number one higher than its highest index, and **you can change it directly**. Setting it smaller deletes items; skipping indexes creates **holes** (empty slots, which are different from `undefined`).

| Line | Why |
|---|---|
| `1,2` | setting `length = 2` permanently removes every item from index 2 onwards |
| `3 false` | `[1, , 3]` has length 3, but index 1 is a hole: the `in` operator shows no element exists there |
| `3 2` | `map` keeps the hole (length stays 3), while `filter` skips it (length 2). Array methods treat holes inconsistently |
| `3 undefined` | `delete` removes the element but **does not shift** the others or change `length`, leaving a hole |
| `10` | assigning to index 9 of an empty array makes `length` 10, with indexes 0 to 8 as holes |

`arr.length = 0` is a legitimate, fast way to empty an array **in place**, so every reference to that array sees it empty (unlike `arr = []`, which only rebinds one variable).

To remove an item, use `splice(index, 1)` or `filter`, never `delete`. And create arrays of a given size with `Array.from({ length: n }, fn)` or `new Array(n).fill(value)`, so they have real values rather than holes.

**Takeaway:** `length` is writable, `delete` leaves holes, and holes are not `undefined`. Remove items with `splice` or `filter`.

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

**In one line:** when JavaScript needs a primitive from an object, it asks for a **hint**: `+`, `*` and `>` prefer a number, so they call **`valueOf` first**; template literals and `String()` want a string, so they call **`toString` first**.

| Line | Hint | Called | Result |
|---|---|---|---|
| `price + 1` | default (treated like number) | `valueOf` → 42 | `43` |
| `` `${price}` `` | string | `toString` | `forty-two` |
| `String(price)` | string | `toString` | `forty-two` |
| `price * 2` | number | `valueOf` | `84` |
| `price > 40` | number | `valueOf` | `true` |
| `[1, 2] + [3]` | default | arrays' `valueOf` returns the array itself (not a primitive), so it falls back to `toString`: `'1,2'` and `'3'` | `1,23` |

This is the mechanism behind every "weird" coercion result: `[] + {}` is `'' + '[object Object]'`, and a `Date` becomes a number in `date2 - date1` (so you can subtract dates) but a readable string in `` `${date}` ``. A class can control all of this precisely with `[Symbol.toPrimitive](hint)`, which receives `'number'`, `'string'` or `'default'`.

**Takeaway:** objects become primitives through `valueOf` (maths and comparisons) or `toString` (strings and templates). If a result looks odd, work out which one was called.

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

**In one line:** the executor runs **immediately and synchronously**, inside the `new Promise(...)` call. Only the `.then` callbacks are delayed. And a promise can settle **only once**: every later `resolve` or `reject` is silently ignored.

| Line | Why |
|---|---|
| `1. before` | ordinary synchronous code |
| `2. executor runs immediately` | the function you pass to `new Promise` is called right away, before `new Promise` returns |
| `3. still running after resolve` | `resolve` does not stop the function. It records the result, and the code carries on |
| `4. after` | synchronous code after the promise was created |
| `5. settled with first` | `.then` callbacks always run later, as a microtask (§1.6). The value is `'first'`: the second `resolve` and the `reject` came after the promise had already settled, so they did nothing |

Two practical consequences:

- **Heavy work inside an executor still blocks.** Wrapping a slow loop in `new Promise` does not make it asynchronous, because the executor runs on the spot (tricky Q17).
- **Guard code after `resolve`.** Since `resolve` does not stop execution, write `return resolve(value)` when the rest of the function must not run.

**Takeaway:** the executor is synchronous; only `.then` is deferred. The first `resolve` or `reject` wins, and the rest are ignored without any error.

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

**In one line:** optional chaining stops the **whole rest of the expression** as soon as it meets `null` or `undefined`, including any function call and its arguments. And `??` cannot be mixed with `||` or `&&` without parentheses.

| Line | Why |
|---|---|
| `undefined` | `user.profile` is `null`, so `?.name` returns `undefined` instead of throwing |
| `undefined` | `user.settings` is `undefined`, so `?.` stops there, and `.theme.color` is **never evaluated** (otherwise `.color` on `undefined` would throw) |
| `calls: 0` | `nothing?.method(calls++)` stops before the call, so the argument `calls++` never runs either |
| `default 0` | `\|\|` replaces any *falsy* value (so `0` becomes `'default'`); `??` replaces only `null` and `undefined`, so `0` stays |
| `SyntaxError` | mixing `??` with `\|\|` without brackets is forbidden by the grammar, because it is unclear which should apply first. Write `(null \|\| undefined) ?? 'x'` |

The short-circuit reaches only as far as the **current chain**: `a?.b.c` stops at `a`, but `(a?.b).c` would throw, because the parentheses end the chain.

A common mistake is sprinkling `?.` everywhere. It turns a missing value you should have handled into a silent `undefined` further down the line. Use it where a value is genuinely optional.

**Takeaway:** `?.` skips the rest of the chain, including calls and their arguments. Use `??` for defaults when `0` or `''` are valid, and bracket it when mixed with `||` or `&&`.

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

**In one line:** a **named function expression**'s name exists **only inside that function**, so it can call itself, and that name is **read-only**.

| Line | Why |
|---|---|
| `120` | inside the function, `fact` refers to the function itself, so the recursion works |
| `undefined` | outside, there is no variable called `fact`. The function is stored in `factorial`; `fact` is not a variable in the surrounding scope |
| `TypeError` | the inner name is a constant binding. In strict mode, assigning to it throws. In sloppy mode it fails **silently**: the assignment is ignored, and `typeof named` would still be `'function'` |
| `["fact","",""]` | a function's `.name` is its given name. Anonymous functions called directly have an empty name. (Assigning one to a variable, as in `const f = () => {}`, gives it the variable's name) |

**Why name a function expression at all?** Two good reasons: it can refer to itself reliably, even if the outer variable is later reassigned, and the name appears in **stack traces**, which makes errors much easier to read than a list of `anonymous`.

**Takeaway:** a function expression's own name is visible only inside it and cannot be reassigned. Name your callbacks when you want readable stack traces.

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

**In one line:** `Symbol` keys are **deliberately hidden** from ordinary key listing and from JSON, so they can hold metadata without clashing with normal properties. A `Map` compares keys **by value and type**, while plain objects turn every key into a string.

| Line | Why |
|---|---|
| `name` | `Object.keys` (and `for...in`) skip symbol keys |
| `{"name":"Asha"}` | so does `JSON.stringify` |
| `7 1` | the symbol property is still there: read it with the symbol itself, or list symbols with `Object.getOwnPropertySymbols` |
| `false true` | every `Symbol()` call creates a unique value, even with the same description. `Symbol.for('id')` looks it up in a **global registry**, so both calls return the same symbol |
| `not a number 3 …` | a `Map` finds a `NaN` key (it uses SameValueZero, tricky Q44), and keeps the string `'1'` and the number `1` as **different** keys. In a plain object they would be one key, because object keys are converted to strings (tricky Q18) |

Symbols are how JavaScript adds hooks without breaking existing code: `Symbol.iterator` makes an object work with `for...of`, `Symbol.toPrimitive` controls coercion (tricky Q47), and libraries use private symbols to tag objects without their keys colliding with yours.

**Takeaway:** symbol keys are hidden from `Object.keys` and JSON but not truly private (use `#fields` for that). Use a `Map` when keys are not strings or must keep their type.

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

**In one line:** the synchronous code runs first, then every promise callback (a microtask), then the timer (a task), and each callback sees the value `count` has **at the moment it runs**, not when it was scheduled.

| Line | Why |
|---|---|
| `sync: 0` | `increment()` only *schedules* the two callbacks and returns. Nothing has incremented `count` yet when the last line runs |
| `promise: 1` | once the synchronous code finishes, the microtask queue runs first: the promise callback increments `count` to 1 |
| `timeout: 2` | the timer is a task, so it runs after all microtasks. By then `count` is already 1, so it becomes 2 |

The trap is expecting `timeout: 1`, because the timer was written first. It was *scheduled* first, but a promise callback always runs before the next task (§1.6). Both callbacks share one `count`, so the order they run in decides what each one sees.

**Takeaway:** order is synchronous code, then microtasks, then tasks; and a callback reads shared variables when it runs, not when it was created.

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

**In one line:** everything up to the first `await` runs immediately, including the `count++` between the two `test()` calls. The two timers then fire in the order they were created, each incrementing the shared `count`, and each `await` resumes only after its timer has fired.

Step by step:

| Step | What runs | `count` |
|---|---|---|
| 1 | `main()` starts and logs **`A 0`** | 0 |
| 2 | `test()` schedules timer 1; then `count++`; then `test()` schedules timer 2 | 1 |
| 3 | `await p1`: `main` pauses and returns to the caller, which logs **`D 1`** | 1 |
| 4 | timer 1 fires: `count++` (to 2) and resolves `p1` with **2** | 2 |
| 5 | `main` resumes and logs **`B 2 2`** | 2 |
| 6 | timer 2 fires: `count++` (to 3) and resolves `p2` with **3** | 3 |
| 7 | `main` resumes and logs **`C 3 3`** | 3 |

Two details most people get wrong:

- **`D` prints `1`, not `0`.** The `count++` between the two `test()` calls is synchronous and runs *before* the first `await`, so by the time control returns to the last line, `count` is already 1. An `async` function runs synchronously until its first `await` (§1.5).
- **`B` is `2`, not `1`.** Each timer resolves with `count` *after its own increment*, and timer 1 runs after the synchronous `count++`, so it sees 1 and makes it 2. The value a promise resolves with is decided when it resolves, not when `test()` was called.

**Takeaway:** trace the shared variable, not just the log order: synchronous code before the first `await` runs immediately, and each timer reads and changes the variable at the moment it fires.

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

---

## References

- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) — Comprehensive JavaScript tutorials and reference
- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference) — Complete API reference for built-in objects
- [ECMAScript Specification](https://tc39.es/ecma262/) — The official language specification
- [JavaScript.info](https://javascript.info) — Modern JavaScript tutorial with detailed explanations
