const e=`# JavaScript — Complete Guide

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

\`\`\`js
// 1. String
const name = 'Alice';
const greeting = \`Hello \${name}\`;       // template literal

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
\`\`\`

### 2.2 Reference Types

Reference types (objects, arrays, functions) are stored by reference, meaning variables hold a pointer to the data in memory rather than the data itself. This means multiple variables can point to the same object, and mutations through one reference are visible through all of them.

\`\`\`js
// Object
const user = { name: 'Alice', age: 30 };

// Array (special object)
const nums = [1, 2, 3];

// Function (callable object)
const greet = function() { return 'hi'; };

// Date, RegExp, Map, Set, WeakMap, WeakSet...
\`\`\`

### 2.3 typeof Quirks

The \`typeof\` operator returns a string indicating the type of a value, but it has several well-known quirks that interviewers love to ask about. Understanding these edge cases helps you avoid subtle bugs in type-checking code.

\`\`\`js
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
\`\`\`

### 2.4 Type Coercion

JavaScript automatically converts values between types (implicit coercion) when operators or comparisons expect a different type. Knowing the coercion rules -- especially the difference between \`==\` (loose, coerces) and \`===\` (strict, no coercion) -- is essential for avoiding bugs and answering interview questions.

\`\`\`js
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
\`\`\`

---

## 3. Variables

### 3.1 var vs let vs const

JavaScript has three variable declaration keywords. \`var\` is function-scoped and was the only option before ES6. \`let\` and \`const\` are block-scoped and should be preferred in modern code -- use \`const\` by default and \`let\` only when you need to reassign.

\`\`\`js
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
\`\`\`

### 3.2 Hoisting

Hoisting is JavaScript's behavior of moving declarations to the top of their scope during compilation. \`var\` declarations are hoisted and initialized to \`undefined\`, while \`let\`/\`const\` are hoisted but remain in a "Temporal Dead Zone" until their declaration is reached, causing a \`ReferenceError\` if accessed early.

\`\`\`js
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
\`\`\`

---

## 4. Functions

### 4.1 Function Declarations vs Expressions

Function declarations are hoisted completely (you can call them before they appear in code), while function expressions are assigned to variables and follow that variable's hoisting rules. Named function expressions are useful for recursion and clearer stack traces.

\`\`\`js
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
\`\`\`

### 4.2 Arrow Functions

Arrow functions provide a concise syntax for writing functions and have key behavioral differences from regular functions: they do not have their own \`this\`, \`arguments\`, or \`prototype\`, and they cannot be used as constructors. Their lexical \`this\` binding makes them ideal for callbacks and methods that need to preserve the surrounding context.

\`\`\`js
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
// 1. No own \`this\` - inherits from enclosing scope
// 2. No \`arguments\` object
// 3. Cannot be used as constructors (no \`new\`)
// 4. No \`prototype\` property
\`\`\`

### 4.3 this Keyword

The value of \`this\` in JavaScript depends on how a function is called, not where it is defined (except for arrow functions, which inherit \`this\` lexically). Understanding the four binding rules -- default, implicit (method call), explicit (\`call\`/\`apply\`/\`bind\`), and \`new\` -- is one of the most frequently tested interview topics.

\`\`\`js
// Global context
console.log(this);                // window (browser) or {} (Node module)

// Regular function - \`this\` depends on HOW it's called
const obj = {
  name: 'Alice',
  greet() {
    console.log(this.name);       // 'Alice' (called as method)
  },
};
obj.greet();                      // 'Alice'

const fn = obj.greet;
fn();                             // undefined (called as plain function)

// Arrow function - \`this\` is lexically bound (where it was DEFINED)
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
\`\`\`

### 4.4 Default Parameters, Rest, Spread

ES6 introduced these features for more flexible function signatures. Default parameters provide fallback values, rest parameters (\`...args\`) collect remaining arguments into an array, and spread syntax (\`...\`) expands arrays or objects into individual elements.

\`\`\`js
// Default parameters
function greet(name = 'World') {
  return \`Hello \${name}\`;
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
\`\`\`

### 4.5 Higher-Order Functions

Higher-order functions either take a function as an argument or return a function. They are a cornerstone of functional programming in JavaScript and power common patterns like \`map\`, \`filter\`, and \`reduce\`, enabling more declarative and composable code.

\`\`\`js
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
\`\`\`

---

## 5. Scope and Closures

### 5.1 Scope Chain

When JavaScript encounters a variable, it looks it up starting from the current scope, then moves outward through each enclosing scope until it reaches the global scope. This lookup path is called the scope chain, and understanding it is key to predicting which variable a given reference resolves to.

\`\`\`js
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
  // console.log(innerVar);          // ReferenceError
}
\`\`\`

### 5.2 Closures

A closure is a function that remembers and accesses variables from its outer scope, even after the outer function has returned.

\`\`\`js
function createCounter() {
  let count = 0;                     // "closed over" by inner function
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

const counter = createCounter();
counter.increment();                  // 1
counter.increment();                  // 2
counter.getCount();                   // 2
// \`count\` is private - no direct access from outside
\`\`\`

### 5.3 Classic Closure Gotcha

This is one of the most common interview questions about closures. Because \`var\` is function-scoped, all iterations of a loop share the same variable, so callbacks created inside the loop all see the final value. Using \`let\` (block-scoped) or an IIFE fixes this by giving each iteration its own copy.

\`\`\`js
// Problem: var is function-scoped, shared by all iterations
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 (all reference the same \`i\`)

// Fix 1: Use let (block-scoped - each iteration gets its own \`i\`)
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
\`\`\`

---

## 6. Objects and Prototypes

### 6.1 Object Creation

JavaScript provides several ways to create objects: object literals for simple one-off objects, \`Object.create\` for setting the prototype directly, constructor functions for the classic pattern, and ES6 classes as syntactic sugar. Knowing each approach and its trade-offs is important for interviews.

\`\`\`js
// Object literal
const user = {
  name: 'Alice',
  age: 30,
  greet() { return \`Hi, I'm \${this.name}\`; },
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
User.prototype.greet = function() { return \`Hi \${this.name}\`; };
const u = new User('Alice');

// ES6 Class (syntactic sugar over constructor + prototype)
class UserClass {
  constructor(name) { this.name = name; }
  greet() { return \`Hi \${this.name}\`; }
}
\`\`\`

### 6.2 Prototypal Inheritance

Unlike classical inheritance in languages like Java, JavaScript uses prototypal inheritance: objects inherit directly from other objects via an internal \`[[Prototype]]\` link. When a property is not found on an object, the engine walks up the prototype chain until it finds it or reaches \`null\`.

\`\`\`js
// Every object has an internal [[Prototype]] link
const animal = {
  eat() { return 'eating'; },
};

const dog = Object.create(animal);
dog.bark = function() { return 'woof'; };

dog.bark();              // 'woof' (own property)
dog.eat();               // 'eating' (inherited from animal)

// Prototype chain: dog -> animal -> Object.prototype -> null
\`\`\`

### 6.3 Object Methods

The \`Object\` constructor provides several useful static methods for inspecting and manipulating objects. These are commonly used for iteration (\`keys\`, \`values\`, \`entries\`), merging (\`assign\`, spread), and immutability (\`freeze\`, \`seal\`).

\`\`\`js
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
\`\`\`

### 6.4 Destructuring

Destructuring lets you extract values from objects and arrays into distinct variables using a concise syntax. It supports defaults, renaming, nesting, and rest patterns, and is widely used in function parameters, imports, and everyday assignments.

\`\`\`js
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
  return \`\${name} is \${age}\`;
}
\`\`\`

---

## 7. Arrays and Iteration

### 7.1 Array Methods (Non-Mutating)

Non-mutating methods return a new array or value without modifying the original. These are preferred in modern JavaScript and especially in React/functional code because they avoid side effects and make data flow easier to reason about.

\`\`\`js
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
\`\`\`

**ES2023 immutable array methods** — \`toSorted\`, \`toReversed\`, \`toSpliced\`, \`with\` — return *new* arrays instead of mutating. The single biggest source of accidental React/Redux mutation bugs is \`arr.sort()\` (mutates) used inline; the new \`arr.toSorted()\` solves it cleanly:

\`\`\`js
const nums = [3, 1, 2];
nums.toSorted();                      // [1, 2, 3]  — new array
nums;                                 // [3, 1, 2]  — original untouched

[1, 2, 3].toReversed();               // [3, 2, 1]
[1, 2, 3].with(1, 99);                // [1, 99, 3]  — replace at index
[1, 2, 3].toSpliced(1, 1, 'x', 'y');  // [1, 'x', 'y', 3]
\`\`\`

### 7.2 Array Methods (Mutating)

Mutating methods modify the array in place rather than returning a new one. Be cautious with these in functional or React code, where immutability is expected. Always know which methods mutate -- this is a common interview question.

\`\`\`js
const arr = [1, 2, 3];

arr.push(4);                // [1, 2, 3, 4]     add to end
arr.pop();                  // [1, 2, 3]         remove from end
arr.unshift(0);             // [0, 1, 2, 3]      add to start
arr.shift();                // [1, 2, 3]         remove from start
arr.splice(1, 1, 'a');      // [1, 'a', 3]       remove/insert at index
arr.sort((a, b) => a - b);  // sorts in place
arr.reverse();               // reverses in place
arr.fill(0);                 // [0, 0, 0]
\`\`\`

### 7.3 Iteration

JavaScript offers several loop constructs: \`for...of\` iterates over values of any iterable (arrays, strings, Maps, Sets), \`for...in\` iterates over enumerable property keys (best for objects), and \`forEach\` is an array method that cannot be broken out of early. Choose the right one based on what you are iterating and whether you need \`break\`/\`continue\`.

\`\`\`js
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
\`\`\`

---

## 8. Asynchronous JavaScript

### 8.1 Callbacks

Callbacks were the original pattern for handling asynchronous operations in JavaScript: you pass a function to be called when the work is done. While simple in isolation, deeply nested callbacks lead to "callback hell," making code hard to read, maintain, and debug.

\`\`\`js
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
\`\`\`

### 8.2 Promises

Promises provide a cleaner alternative to callbacks for managing asynchronous operations. A promise represents a value that may not be available yet and can be in one of three states: pending, fulfilled, or rejected. Promises support chaining with \`.then()\` and combinators like \`Promise.all\` for concurrent work.

\`\`\`js
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
\`\`\`

### 8.3 Async/Await

\`async\`/\`await\` is syntactic sugar over promises that lets you write asynchronous code in a synchronous-looking style. An \`async\` function always returns a promise, and \`await\` pauses execution until the awaited promise settles, making complex async flows much easier to read and debug.

\`\`\`js
// async function always returns a promise
async function getUser(id) {
  try {
    const response = await fetch(\`/api/users/\${id}\`);
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
\`\`\`

### 8.4 Microtasks vs Macrotasks

The event loop processes two types of queues: microtasks (promises, \`queueMicrotask\`) and macrotasks (\`setTimeout\`, \`setInterval\`, I/O). Microtasks always run before the next macrotask, which is why promise callbacks execute before \`setTimeout\` callbacks even with a 0ms delay.

\`\`\`js
console.log('1');                           // synchronous

setTimeout(() => console.log('2'), 0);      // macrotask

Promise.resolve().then(() => console.log('3')); // microtask

console.log('4');                           // synchronous

// Output: 1, 4, 3, 2
// Microtasks (promises) run BEFORE macrotasks (setTimeout)
\`\`\`

---

### 8.5 Mixing \`async\`/\`await\` with \`.then()\`/\`.catch()\`

They're the same mechanism — \`await\` consumes a promise, \`.then()\` chains one — so mixing them is legal. It's also where a lot of real bugs live, because the two styles handle errors and sequencing differently.

**The forgotten \`await\`** is the most common. An \`async\` function always returns a promise, so calling one without \`await\` starts the work and moves on:

\`\`\`js
async function save() { throw new Error('boom'); }

async function handler() {
  try {
    save();                     // ✗ no await — the rejection escapes this try/catch
  } catch (e) {
    console.log('caught');      // never runs
  }
  return 'done';                // resolves fine; the error surfaces as
}                               // an unhandled rejection, elsewhere, later
\`\`\`

\`try\`/\`catch\` only catches what the \`await\`ed expression rejects with. Without \`await\`, the promise leaves the \`try\` block before it settles.

**Mixing on the same call** produces a subtler trap:

\`\`\`js
// ✗ Both a .catch() AND a try/catch — the catch handler "handles" it,
//   so the await resolves with undefined and the try block is never entered
try {
  const data = await fetch(url).then(r => r.json()).catch(() => null);
  process(data);               // data is null, not an error — silently wrong
} catch (e) { /* unreachable */ }
\`\`\`

\`.catch()\` returning a value **converts a rejection into a resolution**. That's often what you want, but then the \`try\`/\`catch\` is dead code and the caller has to check for the sentinel. Pick one style per call site.

**Where \`.then()\` is genuinely better** — the case worth knowing, because "always use await" is wrong:

\`\`\`js
// Sequential — 3 round trips, one after another
const a = await getA(); const b = await getB(); const c = await getC();
\`\`\`

\`\`\`js
// Concurrent — start all three, then await. This is the fix for
// the most common async performance bug in real codebases.
const [a, b, c] = await Promise.all([getA(), getB(), getC()]);
\`\`\`

\`\`\`js
// Start early, await late — useful when you need to do other work in between
const userPromise = getUser();        // no await: the request is already in flight
renderSkeleton();
const user = await userPromise;
\`\`\`

Two more rules that come up:

- **\`await\` in a loop is sequential.** \`for (const id of ids) await fetch(id)\` makes N sequential requests. Use \`Promise.all(ids.map(fetch))\` for parallel, or a bounded pool if N is large enough to hammer the server.
- **\`.forEach\` with an \`async\` callback doesn't wait.** \`forEach\` ignores the returned promise, so the loop finishes instantly and the work continues in the background. Use \`for...of\` with \`await\` (sequential) or \`Promise.all(map(...))\` (parallel). This one silently breaks ordering guarantees.
- **\`return await\` vs \`return\`.** Inside a \`try\` block they differ: \`return await p\` catches \`p\`'s rejection locally, \`return p\` hands the promise to the caller and your \`catch\` never sees it. Outside a \`try\` they're equivalent (modern engines don't add a meaningful tick).

---

### 8.6 Top-Level \`await\`

In an **ES module** (ES2022), \`await\` works at the top level, outside any function:

\`\`\`js
// config.js — an ES module
const res = await fetch('/config.json');
export const config = await res.json();
\`\`\`

The mechanism worth understanding: a module containing top-level \`await\` becomes an **async module**, and every module that imports it waits for it to finish evaluating before its own body runs. The \`await\` doesn't block the thread — it blocks the *module graph* beneath it.

That gives you three genuinely useful patterns:

\`\`\`js
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
\`\`\`

And three constraints that get asked:

- **ES modules only.** Not in CommonJS, and not in a classic \`<script>\` — you need \`<script type="module">\` or a \`.mjs\`/\`"type": "module"\` file. A syntax error otherwise.
- **\`require()\` of a module with top-level \`await\` throws**, even on Node 24 where \`require(esm)\` is otherwise supported. \`require\` is synchronous by contract, so there's nothing it can return. \`await import()\` is the only option. This is the single most common real-world limitation.
- **It can delay your whole app.** A slow top-level \`await\` in a widely-imported module blocks every importer, and because it's not in a function there's no obvious place to add a timeout or a loading state. Keep it for genuinely required startup work, and keep it fast.

---

### 8.7 Retrying, Cancelling and Bounding Async Work

Three production patterns that come up as "implement this" questions.

**Retry with exponential back-off and jitter:**

\`\`\`js
async function retry(fn, { retries = 3, base = 300, factor = 2 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !isRetryable(err)) throw err;
      const delay = base * factor ** attempt;
      const jittered = Math.random() * delay;          // full jitter
      await new Promise(r => setTimeout(r, jittered));
    }
  }
}
\`\`\`

Three details interviewers look for. **Only retry retryable failures** — a \`500\`, a timeout or a network error, never a \`400\` or \`422\`, because a validation error will fail identically forever. **Jitter is not optional**: without it, a thousand clients that failed together retry together, and you've built a self-inflicted thundering herd that keeps the service down. And **respect \`Retry-After\`** when the server sends it — your back-off calculation is a guess, that header is not.

**Cancellation with \`AbortController\`:**

\`\`\`js
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
\`\`\`

\`AbortSignal.timeout(ms)\` is the modern shorthand, and \`AbortSignal.any([a, b])\` combines signals — a user-initiated cancel *and* a timeout. The rule: **always distinguish an abort from a real error**, or a user navigating away logs as a failure and pollutes your error rate.

**Bounded concurrency** — the "throttle promises" pattern. \`Promise.all\` over 1,000 URLs opens 1,000 connections; a pool keeps exactly N in flight:

\`\`\`js
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
\`\`\`

Also worth naming: \`Promise.allSettled\` when you want every result regardless of failures (batch jobs, dashboards), \`Promise.any\` for a first-success race across mirrors, and \`Promise.race\` for a timeout — though \`AbortSignal.timeout\` is better, because \`race\` leaves the losing request running and still paying for bandwidth.

---

## 9. ES6+ and Modern JavaScript

### 9.1 Template Literals

Template literals use backticks instead of quotes and support embedded expressions via \`\${...}\`, multiline strings without escape characters, and tagged templates for custom string processing. They are the preferred way to build strings in modern JavaScript.

\`\`\`js
const name = 'Alice';
const greeting = \`Hello \${name}!\`;
const multiline = \`
  Line 1
  Line 2
\`;

// Tagged templates
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? \`<b>\${values[i]}</b>\` : '');
  }, '');
}
highlight\`Hello \${name}, you are \${30} years old\`;
\`\`\`

### 9.2 Optional Chaining and Nullish Coalescing

Optional chaining (\`?.\`) lets you safely access deeply nested properties without checking each level for \`null\`/\`undefined\`. Nullish coalescing (\`??\`) provides a default value only when the left side is \`null\` or \`undefined\`, unlike \`||\` which also triggers on falsy values like \`0\` or \`''\`.

\`\`\`js
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
\`\`\`

### 9.3 Map, Set, WeakMap, WeakSet

ES6 introduced these built-in collection types as alternatives to plain objects and arrays. \`Map\` allows any type as a key (not just strings), \`Set\` stores unique values, and their \`Weak\` variants hold weak references that allow garbage collection -- useful for caching and metadata without causing memory leaks.

\`\`\`js
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
\`\`\`

### 9.4 Iterators and Generators

The iteration protocol defines how objects produce a sequence of values. Any object with a \`Symbol.iterator\` method is iterable and works with \`for...of\`, spread, and destructuring. Generator functions (\`function*\`) provide a simpler way to implement iterators and enable lazy evaluation, producing values on demand with \`yield\`.

\`\`\`js
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
    const response = await fetch(\`\${url}?page=\${page}\`);
    const data = await response.json();
    if (data.items.length === 0) return;
    yield data.items;
    page++;
  }
}
\`\`\`

### 9.5 Proxy and Reflect

\`Proxy\` lets you intercept and customize fundamental operations on objects (property access, assignment, function calls, etc.) by defining handler traps. This is the mechanism behind reactivity systems in frameworks like Vue and is useful for validation, logging, and default values.

\`\`\`js
const handler = {
  get(target, prop) {
    return prop in target ? target[prop] : \`Property \${prop} not found\`;
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
\`\`\`

---

### 9.6 Which Version Shipped What — The Baseline Table

Interviewers rarely ask "what year did X land?", but they do ask "is that safe to use?" and "what would you reach for here?". Knowing the rough vintage of a feature tells you whether it needs a polyfill, a transpiler, or nothing at all.

| Edition | Features you are expected to know |
|---|---|
| **ES2022** | Top-level \`await\`, class static blocks, private fields (\`#x\`) + the \`#x in obj\` brand check, \`Object.hasOwn\`, \`Array.prototype.at\`, \`Error\` \`cause\`, RegExp \`d\` flag (match indices) |
| **ES2023** | \`findLast\` / \`findLastIndex\`, the immutable quartet \`toSorted\` / \`toReversed\` / \`toSpliced\` / \`with\`, hashbang grammar |
| **ES2024** | \`Object.groupBy\` / \`Map.groupBy\`, \`Promise.withResolvers\`, RegExp \`v\` flag (set notation), \`ArrayBuffer.prototype.transfer\` |
| **ES2025** | Iterator helpers, Set methods (\`union\`, \`intersection\`, …), \`Promise.try\`, \`RegExp.escape\`, duplicate named capture groups, import attributes (\`with { type: 'json' }\`) |
| **ES2026** | **Temporal**, explicit resource management (\`using\` / \`await using\`), \`Array.fromAsync\`, \`Error.isError\` |

Everything through ES2024 is available in every current browser and in Node 20+, so it needs no build step. ES2025 and ES2026 features are the ones worth checking against your minimum target — \`using\` in particular needs TypeScript 5.2+ or a transpiler because it is *syntax*, not just a new method.

---

### 9.7 Grouping and the New Set Methods

\`Object.groupBy\` and \`Map.groupBy\` (ES2024) finally give JavaScript the \`groupBy\` that every utility library has shipped for a decade. Both take an iterable and a callback that returns the key for each item.

\`\`\`js
const people = [
  { name: 'Alice', dept: 'eng' },
  { name: 'Bob',   dept: 'sales' },
  { name: 'Cara',  dept: 'eng' },
];

Object.groupBy(people, p => p.dept);
// { eng: [{Alice}, {Cara}], sales: [{Bob}] }
\`\`\`

The difference between the two matters in interviews. \`Object.groupBy\` coerces every key to a **string** and returns a \`null\`-prototype object; \`Map.groupBy\` keeps the key at its original type, so you can group by an object reference or a number without collisions:

\`\`\`js
// Object.groupBy stringifies keys — 1 and '1' collide
Object.groupBy([1, '1'], x => x);        // { '1': [1, '1'] }

// Map.groupBy preserves key identity — no collision
Map.groupBy([1, '1'], x => x);           // Map { 1 => [1], '1' => ['1'] }
\`\`\`

Reach for \`Map.groupBy\` whenever the grouping key is not already a string. The returned object from \`Object.groupBy\` has a \`null\` prototype, which is deliberate — it means a group named \`"toString"\` or \`"__proto__"\` cannot shadow or corrupt anything, but it also means the result has no \`.hasOwnProperty\`, so use \`Object.hasOwn(result, key)\` or the \`in\` operator instead.

**Set methods (ES2025)** replace the old spread-and-filter dance. Seven methods land together: three that return a new \`Set\`, and four that return a boolean.

\`\`\`js
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5]);

a.union(b);                 // Set { 1, 2, 3, 4, 5 }
a.intersection(b);          // Set { 3, 4 }
a.difference(b);            // Set { 1, 2 }        — in a, not in b
a.symmetricDifference(b);   // Set { 1, 2, 5 }     — in exactly one

a.isSubsetOf(b);            // false
a.isSupersetOf(new Set([1, 2]));  // true
a.isDisjointFrom(new Set([9]));   // true
\`\`\`

Two details interviewers probe. First, these methods are **non-mutating** — \`a.union(b)\` returns a new \`Set\` and leaves \`a\` alone, matching the ES2023 immutable-array philosophy. Second, the argument does not have to be a \`Set\`; it only needs to be *set-like*, meaning it has a numeric \`size\`, a \`has\` method, and a \`keys\` method. A \`Map\` satisfies that contract, so \`mySet.intersection(myMap)\` works and compares against the Map's **keys**.

---

### 9.8 Iterator Helpers — Lazy Array Methods for Anything Iterable

Before ES2025, \`.map\` and \`.filter\` lived only on arrays. If you had a generator, a \`Map\`, a \`Set\`, or a \`NodeList\`, you had to materialise it into an array first — allocating the whole thing in memory — before you could transform it. Iterator helpers put those methods on \`Iterator.prototype\`, so they work on **any** iterator, and they evaluate **lazily**.

\`\`\`js
function* naturals() {
  let n = 1;
  while (true) yield n++;      // infinite — an array could never hold this
}

const firstFiveSquares = naturals()
  .map(n => n * n)
  .take(5)
  .toArray();

console.log(firstFiveSquares);   // [1, 4, 9, 16, 25]
\`\`\`

The full set: \`map\`, \`filter\`, \`take\`, \`drop\`, \`flatMap\`, \`reduce\`, \`toArray\`, \`forEach\`, \`some\`, \`every\`, \`find\`. Note that \`reduce\`, \`forEach\`, \`some\`, \`every\`, \`find\` and \`toArray\` are **terminal** — they consume the iterator and produce a value. The rest are lazy and return a new iterator.

Why this matters beyond neat infinite-sequence demos: the array version builds an intermediate array at every step. Chaining \`.filter().map().slice(0, 10)\` over 100,000 records allocates two 100,000-element arrays to hand you ten items. The iterator version pulls exactly the elements it needs and stops.

\`\`\`js
// Array chain — allocates two full intermediate arrays
const arrResult = bigArray.filter(isActive).map(toDto).slice(0, 10);

// Iterator chain — pulls ~10 items through the pipeline and stops
const iterResult = bigArray.values().filter(isActive).map(toDto).take(10).toArray();
\`\`\`

The classic gotcha: **iterators are single-use.** Once consumed, they are exhausted. An array can be iterated forever; an iterator cannot.

\`\`\`js
const it = [1, 2, 3].values();
it.toArray();      // [1, 2, 3]
it.toArray();      // []  — already drained, not an error
\`\`\`

This is also the reason a helper chain has no \`length\` and no \`.sort()\` — sorting is inherently eager, since you cannot know the first element of a sorted sequence without seeing all of them.

---

### 9.9 Explicit Resource Management — \`using\` and \`await using\`

\`try\`/\`finally\` works, but it separates acquisition from cleanup by however many lines the body happens to be, and it nests horribly once you hold three resources. ES2026's explicit resource management adds two new declaration forms that attach cleanup to the *variable's scope* instead.

A resource is any object with a \`[Symbol.dispose]()\` method (sync) or \`[Symbol.asyncDispose]()\` (async). When the block containing the \`using\` declaration exits — by return, by throw, by \`break\`, by anything — the dispose method runs automatically.

\`\`\`js
class FileHandle {
  constructor(path) {
    this.path = path;
    console.log(\`open \${path}\`);
  }
  [Symbol.dispose]() {
    console.log(\`close \${this.path}\`);
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
\`\`\`

\`await using\` is the asynchronous counterpart, and it *awaits* the disposal — which is the whole point for things like database transactions and streams whose teardown is itself async:

\`\`\`js
async function withTransaction(db) {
  await using tx = await db.begin();     // tx has [Symbol.asyncDispose]
  await tx.query('UPDATE …');
  await tx.commit();
  // await tx[Symbol.asyncDispose]() runs and is awaited here
}
\`\`\`

Three rules that show up as interview traps:

1. **Disposal order is reverse of declaration** — it is a stack, exactly like nested \`finally\` blocks. Declare \`using a\`, then \`using b\`, and \`b\` disposes first.
2. **\`using\` bindings are implicitly \`const\`.** You cannot reassign them, because the engine has to be sure the thing it disposes is the thing it acquired.
3. **\`null\` and \`undefined\` are allowed** and are simply skipped, so \`using maybe = condition ? openThing() : null;\` is legal and does the right thing. Any *other* value without a \`[Symbol.dispose]\` method is a \`TypeError\` at declaration time.

\`DisposableStack\` and \`AsyncDisposableStack\` ship alongside for the case where the number of resources is dynamic — you \`.use()\` things into the stack and disposing the stack disposes everything in reverse:

\`\`\`js
using stack = new DisposableStack();
for (const path of paths) stack.use(new FileHandle(path));
// all handles close in reverse order when the block exits
\`\`\`

---

### 9.10 The Temporal API — The Replacement for \`Date\`

\`Date\` has been the language's most-complained-about built-in since 1995: it is mutable, it parses inconsistently, its months are zero-indexed but its days are not, it silently conflates "an instant in time" with "a date on a calendar", and it has no real time-zone support. \`Temporal\` reached Stage 4 in March 2026 and fixes all of it by splitting the single overloaded \`Date\` into several **immutable** types, each of which means exactly one thing.

| Type | What it represents | Example |
|---|---|---|
| \`Temporal.Instant\` | An exact point on the global timeline, no calendar | \`2026-09-07T14:30:00Z\` |
| \`Temporal.ZonedDateTime\` | An instant *plus* a time zone and calendar | \`2026-09-07T10:30-04:00[America/New_York]\` |
| \`Temporal.PlainDate\` | A calendar date with no time and no zone | \`2026-09-07\` (a birthday) |
| \`Temporal.PlainTime\` | A wall-clock time with no date | \`09:00\` (when the shop opens) |
| \`Temporal.PlainDateTime\` | Date + time, still no zone | \`2026-09-07T09:00\` |
| \`Temporal.Duration\` | A length of time | \`P1M2DT3H\` (1 month, 2 days, 3 hours) |
| \`Temporal.PlainYearMonth\` / \`PlainMonthDay\` | Partial dates | \`2026-09\`, \`09-07\` (recurring) |

\`\`\`js
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
\`\`\`

The conceptual point interviewers are testing is **picking the right type**, because that choice encodes a real business decision. A hotel check-in date is a \`PlainDate\` — the guest arrives on the 7th regardless of where they booked from. A meeting is a \`ZonedDateTime\` — it happens at one instant that renders differently per attendee. A recurring 9 a.m. daily standup is a \`PlainTime\` plus a zone, *not* a fixed instant, because the instant shifts when daylight saving changes. Storing a standup as a UTC instant is precisely the bug that makes it drift by an hour twice a year.

Interop with the old world goes through strings and epoch values, so migration is incremental:

\`\`\`js
const instant = legacyDate.toTemporalInstant();      // Date  → Temporal
const backToDate = new Date(instant.epochMilliseconds); // Temporal → Date
\`\`\`

---

### 9.11 Smaller Modern Additions Worth Knowing

**\`Promise.withResolvers\` (ES2024)** removes the "deferred" boilerplate that every codebase reinvented — hoisting \`resolve\` and \`reject\` out of the executor so something *outside* the promise can settle it.

\`\`\`js
// Before — the awkward let-and-assign dance
let resolve, reject;
const p = new Promise((res, rej) => { resolve = res; reject = rej; });
\`\`\`

\`\`\`js
// After
const { promise, resolve, reject } = Promise.withResolvers();
\`\`\`

This is the natural shape for wrapping event-based APIs: create the promise, hand \`resolve\` to the \`onmessage\` handler, return \`promise\`.

**\`Array.fromAsync\` (ES2026)** is \`Array.from\` for async iterables — it drains an async generator or a paginated API into an array and returns a promise. It is the one-line version of a \`for await…of\` accumulation loop.

\`\`\`js
async function* pages() {
  let url = '/api/items';
  while (url) {
    const res = await fetch(url).then(r => r.json());
    yield* res.items;
    url = res.next;
  }
}

const allItems = await Array.fromAsync(pages());
\`\`\`

Note the difference from \`Promise.all(arr.map(f))\`: \`Array.fromAsync\` iterates **sequentially**, awaiting each value before pulling the next. That is what you want for paginated fetches (page 2's URL comes from page 1) and *not* what you want for independent parallel requests.

**\`Promise.try\` (ES2025)** starts a promise chain from a function that might throw synchronously, so a sync throw and an async rejection land in the same \`.catch\`:

\`\`\`js
Promise.try(() => mightThrowSyncOrReturnPromise(input))
  .then(handle)
  .catch(handleBoth);        // catches both failure modes
\`\`\`

**\`Error.isError\` (ES2026)** is a reliable cross-realm error check. \`instanceof Error\` fails for an error thrown inside an iframe or a worker (different realm, different \`Error\` constructor), and duck-typing on \`.stack\` gives false positives on plain objects:

\`\`\`js
Error.isError(new TypeError('x'));       // true
Error.isError({ name: 'Error', message: 'fake' });  // false
\`\`\`

**\`RegExp.escape\` (ES2025)** safely escapes a string for interpolation into a regex — the fix for the "user input broke my dynamic pattern" bug covered in the Regex guide:

\`\`\`js
const term = 'price (USD)';
new RegExp(RegExp.escape(term), 'gi');   // matches the literal text
\`\`\`

**\`Object.hasOwn\` (ES2022)** replaces \`Object.prototype.hasOwnProperty.call(obj, key)\`. Use it whenever the object might have a \`null\` prototype (like a \`Object.groupBy\` result) or an own property literally named \`hasOwnProperty\`.

**Class static blocks and private brand checks (ES2022)** — a \`static { }\` block runs once at class definition time with \`this\` bound to the class, which is where per-class initialisation that needs statements (not just an expression) belongs. And \`#field in obj\` is the only correct way to ask "is this object actually an instance of my class?", because it checks for the private field's presence without throwing:

\`\`\`js
class Counter {
  #count = 0;
  static #registry = new Map();
  static { Counter.#registry.set('default', new Counter()); }

  static isCounter(obj) {
    return #count in obj;      // true brand check, never throws
  }
}
\`\`\`

**Import attributes (ES2025)** declare how a module should be interpreted, which the host uses as a security guarantee rather than a hint — a server cannot smuggle JavaScript in by changing the \`Content-Type\`:

\`\`\`js
import config from './config.json' with { type: 'json' };
const data = await import('./data.json', { with: { type: 'json' } });
\`\`\`

---

## 10. Error Handling

JavaScript uses \`try\`/\`catch\`/\`finally\` for synchronous error handling and \`.catch()\` or \`try\`/\`catch\` inside \`async\` functions for asynchronous errors. You can create custom error classes by extending the built-in \`Error\` to add domain-specific context like field names or HTTP status codes.

\`\`\`js
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
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
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
\`\`\`

---

### 10.1 Global Error Handling — "Error Boundaries" Outside React

An uncaught error anywhere in your app should be *observed*, even where no \`try\`/\`catch\` reaches. The browser gives you four hooks, and knowing which catches what is the interview question.

\`\`\`js
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
\`\`\`

The distinctions that matter:

- **\`error\` and \`unhandledrejection\` are separate events.** Wiring only the first means every unhandled promise rejection goes unreported — and in an \`async\`-heavy codebase that's most of your errors.
- **Resource load failures don't bubble**, so a broken \`<img>\` or a failed \`<script>\` is invisible unless you listen in the **capture** phase and check \`event.target\`.
- **Cross-origin scripts are opaque.** Without \`crossorigin="anonymous"\` on the \`<script>\` tag *and* CORS headers on the response, you get the useless \`"Script error."\` with no message, file or line. This is the reason most teams' error reporting is empty for CDN-served bundles.
- **\`try\`/\`catch\` does not catch async errors** thrown after the synchronous frame exits. A rejection inside a \`setTimeout\` callback, or in a promise you forgot to \`await\`, reaches \`unhandledrejection\` instead.

In **Node**, the equivalents are \`process.on('uncaughtException')\` and \`process.on('unhandledRejection')\` — and the correct behaviour there is different: log, flush, and **exit**. The process is in an undefined state after an uncaught exception, so continuing to serve traffic risks corrupt data. Let your supervisor restart it (see the Node.js guide's graceful-shutdown section).

**The relationship to React error boundaries** is worth stating precisely, because they're often conflated. A React error boundary catches errors thrown **during render, in lifecycle methods, and in constructors** of the tree below it, and lets you render fallback UI. It does **not** catch errors in event handlers, in \`setTimeout\`, in async code, or during server-side rendering. So they're complementary layers: the error boundary preserves the *UI*, and the global handlers catch everything the boundary structurally cannot. You need both.

---

### 10.2 Testing Async Code Without a Framework

Node's built-in test runner (\`node:test\`, stable since Node 20) plus \`node:assert\` covers most of this with zero dependencies:

\`\`\`js
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
\`\`\`

The techniques that make async tests reliable, framework or not:

- **\`assert.rejects\` / \`assert.doesNotReject\`** for expected failures. The alternative — a \`try\`/\`catch\` with a \`assert.fail()\` after the call — is the pattern that silently passes when the function *doesn't* throw, which is the classic false-green async test.
- **Always \`await\` or \`return\` the assertion.** A forgotten \`await\` means the test function returns before the assertion runs, and the test passes regardless. This is the single most common async-test bug.
- **Control the clock rather than sleeping.** \`mock.timers.enable()\` in \`node:test\` (or \`vi.useFakeTimers()\` in Vitest) lets you advance time instantly, so a test for a 30-second back-off runs in a millisecond. Real \`setTimeout\` in tests is the main source of both slowness and flake.
- **\`mock.fn()\`** gives you call counts and arguments without a mocking library.
- **Test the observable behaviour, not the timing.** Asserting "it retried three times" is stable; asserting "it waited 600ms" is flaky on a loaded CI machine.

When you *do* want a framework, the reasons are jsdom for DOM tests, snapshot testing, module mocking, and parallel test orchestration — see the Testing Strategy & E2E guide for how to choose, and the Node.js guide §13.4 for when \`node:test\` is enough.

---

## 11. The Event Loop

\`\`\`
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
\`\`\`

### Execution Order

\`\`\`js
console.log('1');                            // 1. sync -> call stack

setTimeout(() => console.log('2'), 0);       // 4. macrotask queue

Promise.resolve()
  .then(() => console.log('3'))              // 3. microtask queue
  .then(() => console.log('4'));             // 3b. microtask (chained)

console.log('5');                            // 2. sync -> call stack

// Output: 1, 5, 3, 4, 2
\`\`\`

### Why This Matters

- Promises always execute before setTimeout, even with 0ms delay
- Long synchronous code blocks the event loop (freezes UI)
- \`requestAnimationFrame\` runs before paint (use for animations)
- Node.js adds: \`process.nextTick\` (before microtasks), \`setImmediate\` (after I/O)

---

## 12. Modules

### 12.1 ES Modules (ESM) — Modern Standard

ES Modules are the official standard module system for JavaScript, supported in all modern browsers and Node.js. They are statically analyzed at parse time, enabling tree-shaking (dead code elimination) and top-level \`await\`.

\`\`\`js
// Named exports
export const PI = 3.14;
export function add(a, b) { return a + b; }
export class Calculator { /* ... */ }
\`\`\`

\`\`\`js
// Default export (one per module)
export default function main() { /* ... */ }
\`\`\`

\`\`\`js
// Named imports
import { PI, add } from './math.js';
\`\`\`

\`\`\`js
// Default import
import main from './main.js';
\`\`\`

\`\`\`js
// Rename on import
import { add as sum } from './math.js';
\`\`\`

\`\`\`js
// Import all as namespace
import * as math from './math.js';
math.add(1, 2);
\`\`\`

\`\`\`js
// Dynamic import (code splitting)
const module = await import('./heavy-module.js');
\`\`\`

### 12.2 CommonJS (CJS) — Node.js Legacy

CommonJS is the module system that Node.js originally used. Modules are loaded synchronously at runtime with \`require()\`, and exports are assigned to \`module.exports\`. While still widely used in existing Node.js codebases, new projects generally prefer ES Modules.

\`\`\`js
// Export
module.exports = { add, subtract };
// or
exports.add = function(a, b) { return a + b; };

// Import
const { add } = require('./math');
\`\`\`

### 12.3 Key Differences

| Aspect | ESM | CJS |
|---|---|---|
| Syntax | \`import/export\` | \`require/module.exports\` |
| Loading | Static (analyzed at parse time) | Dynamic (evaluated at runtime) |
| Top-level await | Yes | No |
| Tree-shaking | Yes (dead code elimination) | No |
| Default in | Browsers, modern Node.js | Node.js (legacy) |

---

## 13. DOM Manipulation

The Document Object Model (DOM) is the browser's tree representation of an HTML page, and JavaScript can read and modify it to create dynamic user interfaces. Understanding how to select, create, modify, and remove elements -- as well as how event delegation works -- is essential for front-end interviews.

\`\`\`js
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

// Event listeners
el.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  console.log(event.target);                       // element that was clicked
  console.log(event.currentTarget);                // element handler is attached to
});

// Event delegation (attach to parent, handle children)
document.querySelector('ul').addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log('Clicked:', e.target.textContent);
  }
});

// Removing elements
el.remove();
parent.removeChild(child);
\`\`\`

---

## 14. Design Patterns

### 14.1 Module Pattern

The module pattern uses an immediately-invoked function expression (IIFE) and closures to create private state. Variables inside the IIFE are inaccessible from outside, while the returned object exposes only the intended public API.

\`\`\`js
const counter = (() => {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count,
  };
})();
\`\`\`

### 14.2 Observer Pattern

The observer pattern enables event-driven communication: objects subscribe to events and get notified when those events are emitted. This is the foundation of Node.js \`EventEmitter\`, browser DOM events, and many state management libraries.

\`\`\`js
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
\`\`\`

### 14.3 Singleton

The singleton pattern restricts a class to a single instance and provides a global access point to it. This is commonly used for shared resources like database connections, configuration objects, or caches.

\`\`\`js
class Database {
  static instance;
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
\`\`\`

### 14.4 Debounce and Throttle

Debounce and throttle are rate-limiting techniques for controlling how often a function executes. Debounce waits until a pause in activity (e.g., user stops typing), while throttle ensures execution at most once per interval (e.g., scroll handler). Implementing these from scratch is a very common interview coding question.

\`\`\`js
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
\`\`\`

---

## 15. Interview Questions & Answers

### Beginner

---

**Q1: What is the difference between \`==\` and \`===\`?**

\`==\` (loose equality) performs **type coercion** before comparison. \`===\` (strict equality) compares both value and type without coercion.

\`\`\`js
'5' == 5     // true  (string coerced to number)
'5' === 5    // false (different types)
null == undefined   // true
null === undefined  // false
\`\`\`

Always use \`===\` to avoid unexpected coercion bugs.

---

**Q2: What are closures?**

A closure is a function that retains access to variables from its outer (enclosing) scope, even after the outer function has finished executing. The inner function "closes over" the variables.

\`\`\`js
function outer() {
  let count = 0;
  return function inner() {
    return ++count;
  };
}
const inc = outer();
inc(); // 1
inc(); // 2 (count persists because of closure)
\`\`\`

---

**Q3: What is the difference between \`null\` and \`undefined\`?**

- \`undefined\`: Variable declared but not assigned, missing function parameters, missing object properties. Set by JavaScript automatically.
- \`null\`: Intentional absence of value. Set by the programmer explicitly.

\`\`\`js
let x;              // undefined (automatic)
let y = null;       // null (intentional)
typeof undefined    // 'undefined'
typeof null         // 'object' (historical bug)
null == undefined   // true (loose equality)
null === undefined  // false (strict equality)
\`\`\`

---

**Q4: Explain event bubbling and capturing.**

When an event occurs on a DOM element:
1. **Capturing phase**: Event travels DOWN from \`window\` -> \`document\` -> ... -> target's parent
2. **Target phase**: Event reaches the target element
3. **Bubbling phase**: Event travels UP from target -> parent -> ... -> \`document\` -> \`window\`

By default, handlers listen during the **bubbling** phase. Use \`addEventListener(event, fn, true)\` for capturing.

\`event.stopPropagation()\` stops the event from propagating further. \`event.preventDefault()\` prevents the default browser action (e.g., form submission, link navigation).

---

**Q5: What is the difference between \`var\`, \`let\`, and \`const\`?**

| Feature | \`var\` | \`let\` | \`const\` |
|---------|-------|-------|---------|
| Scope | Function | Block | Block |
| Hoisting | Yes (value: undefined) | Yes (TDZ) | Yes (TDZ) |
| Redeclaration | Allowed | Not allowed | Not allowed |
| Reassignment | Allowed | Allowed | Not allowed |

Use \`const\` by default, \`let\` when reassignment is needed, avoid \`var\`.

---

### Intermediate

---

**Q6: What is the event loop? How does JavaScript handle async operations?**

JavaScript is single-threaded with a non-blocking event loop:

1. Synchronous code executes on the **call stack**
2. Async operations (setTimeout, fetch, etc.) are delegated to browser/Node APIs
3. When async operations complete, their callbacks are queued
4. The event loop checks: if the call stack is empty, it dequeues from the **microtask queue** first (promises), then the **macrotask queue** (setTimeout, I/O)
5. This cycle repeats continuously

This allows JavaScript to handle concurrent operations without threads.

---

**Q7: Explain prototypal inheritance.**

Every JavaScript object has an internal \`[[Prototype]]\` link to another object. When you access a property, JavaScript looks up the prototype chain:

1. Check the object itself
2. Check its prototype
3. Check the prototype's prototype
4. Continue until \`null\` (end of chain: \`Object.prototype.__proto__\` is \`null\`)

\`\`\`js
const animal = { eat() { return 'eating'; } };
const dog = Object.create(animal);
dog.bark = function() { return 'woof'; };

dog.bark();  // found on dog itself
dog.eat();   // found on animal (dog's prototype)
dog.toString(); // found on Object.prototype
\`\`\`

ES6 classes are syntactic sugar over this prototypal system.

---

**Q8: What is the difference between \`call\`, \`apply\`, and \`bind\`?**

All three set the \`this\` context for a function:

- \`call(thisArg, arg1, arg2, ...)\` — invokes immediately, args passed individually
- \`apply(thisArg, [args])\` — invokes immediately, args passed as array
- \`bind(thisArg, arg1, ...)\` — returns a NEW function with \`this\` bound (doesn't invoke)

\`\`\`js
function greet(greeting) { return \`\${greeting}, \${this.name}\`; }

greet.call({ name: 'Alice' }, 'Hello');     // 'Hello, Alice'
greet.apply({ name: 'Bob' }, ['Hi']);        // 'Hi, Bob'
const fn = greet.bind({ name: 'Charlie' });
fn('Hey');                                   // 'Hey, Charlie'
\`\`\`

---

**Q9: What is the difference between shallow copy and deep copy?**

- **Shallow copy**: Copies top-level properties. Nested objects are still shared references.
- **Deep copy**: Recursively copies all levels. No shared references.

\`\`\`js
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
\`\`\`

---

**Q10: Explain \`Promise.all\`, \`Promise.allSettled\`, \`Promise.race\`, and \`Promise.any\`.**

| Method | Resolves when | Rejects when |
|--------|-------------|-------------|
| \`Promise.all\` | ALL promises fulfill | ANY promise rejects |
| \`Promise.allSettled\` | ALL promises settle (fulfill or reject) | Never rejects |
| \`Promise.race\` | FIRST promise settles (fulfill or reject) | FIRST promise rejects |
| \`Promise.any\` | FIRST promise fulfills | ALL promises reject (AggregateError) |

\`\`\`js
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
\`\`\`

---

### Advanced

---

**Q11: What is the Temporal Dead Zone (TDZ)?**

The TDZ is the period between entering a scope and the variable's declaration being reached. During TDZ, accessing the variable throws a \`ReferenceError\`.

\`\`\`js
{
  // TDZ for \`x\` starts here
  console.log(x);    // ReferenceError: Cannot access 'x' before initialization
  let x = 10;        // TDZ ends here
}
\`\`\`

\`let\` and \`const\` are hoisted (the engine knows they exist) but they're in the TDZ until the declaration line. \`var\` doesn't have TDZ — it's initialized to \`undefined\` during hoisting.

---

**Q12: Explain generators and when you'd use them.**

Generators are functions that can be paused and resumed. They use \`function*\` syntax and \`yield\` to produce values lazily.

\`\`\`js
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
fib.next(); // { value: 0, done: false }
fib.next(); // { value: 1, done: false }
fib.next(); // { value: 1, done: false }
fib.next(); // { value: 2, done: false }
\`\`\`

Use cases:
- **Lazy evaluation**: Generate values on demand (infinite sequences)
- **Async flow control**: Redux-Saga uses generators to manage async side effects
- **Custom iterables**: Make any object work with \`for...of\`
- **State machines**: Pause between states

---

**Q13: What is \`WeakRef\` and \`FinalizationRegistry\`?**

- \`WeakRef\` holds a weak reference to an object — doesn't prevent garbage collection.
- \`FinalizationRegistry\` lets you register a callback when an object is garbage collected.

\`\`\`js
let obj = { data: 'important' };
const weakRef = new WeakRef(obj);

weakRef.deref();  // { data: 'important' }
obj = null;       // original reference gone
// After GC: weakRef.deref() returns undefined

const registry = new FinalizationRegistry((heldValue) => {
  console.log(\`\${heldValue} was garbage collected\`);
});
registry.register(someObj, 'my-object');
\`\`\`

Use case: Caches where entries should be automatically cleaned up when memory is needed.

---

**Q14: Explain the difference between \`for...in\` and \`for...of\`.**

- \`for...in\` iterates over **enumerable string property keys** (including inherited ones). Best for objects.
- \`for...of\` iterates over **values** of iterable objects (arrays, strings, maps, sets, generators). Cannot be used on plain objects.

\`\`\`js
const arr = ['a', 'b', 'c'];
arr.custom = 'oops';

for (const key in arr) console.log(key);    // '0', '1', '2', 'custom'
for (const val of arr) console.log(val);    // 'a', 'b', 'c'

const obj = { x: 1, y: 2 };
for (const key in obj) console.log(key);    // 'x', 'y'
// for (const val of obj) ...               // TypeError: obj is not iterable
for (const [k, v] of Object.entries(obj));   // works: 'x' 1, 'y' 2
\`\`\`

---

**Q15: What are memory leaks in JavaScript and how do you prevent them?**

Common causes:
1. **Global variables**: Unintentional globals from missing \`let\`/\`const\`
2. **Closures**: Inner functions retaining references to large outer objects
3. **Event listeners**: Not removing listeners when elements are removed
4. **Timers**: \`setInterval\` not cleared
5. **Detached DOM nodes**: Removed from DOM but still referenced in JS

Prevention:
- Use \`let\`/\`const\` (block scope, no accidental globals)
- Remove event listeners in cleanup (\`removeEventListener\`, React's \`useEffect\` return)
- Clear timers (\`clearInterval\`, \`clearTimeout\`)
- Use \`WeakMap\`/\`WeakSet\` for caches that should allow GC
- Use browser DevTools Memory tab to profile heap snapshots

---

**Q16: Implement a debounce function with leading and trailing options.**

\`\`\`js
function debounce(fn, delay, { leading = false, trailing = true } = {}) {
  let timer;
  let lastArgs;

  return function(...args) {
    const callNow = leading && !timer;
    lastArgs = args;

    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
      if (trailing && lastArgs) {
        fn.apply(this, lastArgs);
        lastArgs = null;
      }
    }, delay);

    if (callNow) {
      fn.apply(this, args);
      lastArgs = null;
    }
  };
}

// Usage
const search = debounce(query => fetchResults(query), 300);
const onClick = debounce(handler, 1000, { leading: true, trailing: false });
\`\`\`

---

**Q17: Explain \`Object.freeze\` vs \`Object.seal\` vs \`Object.preventExtensions\`.**

| Method | Add props | Delete props | Modify values |
|--------|-----------|-------------|---------------|
| \`Object.preventExtensions\` | No | Yes | Yes |
| \`Object.seal\` | No | No | Yes |
| \`Object.freeze\` | No | No | No |

All three are **shallow** — nested objects are not affected:
\`\`\`js
const obj = Object.freeze({ nested: { a: 1 } });
obj.nested.a = 99;  // works! nested object is not frozen
\`\`\`

For deep freeze, you need to recursively freeze all nested objects.

---

**Q18: What is currying and how would you implement it?**

Currying transforms a function with multiple arguments into a sequence of functions, each taking one argument.

\`\`\`js
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
\`\`\`

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
- Nullify references when done (\`obj = null\`)
- Use WeakMap/WeakSet for secondary references
- Avoid closures that capture large scopes unnecessarily
- Reuse objects instead of creating new ones in hot loops

---

**Q20: Explain the \`Symbol\` primitive. What are well-known symbols?**

\`Symbol\` creates a unique, immutable value. No two symbols are equal.

\`\`\`js
const s1 = Symbol('description');
const s2 = Symbol('description');
s1 === s2;  // false (always unique)
\`\`\`

**Well-known symbols** customize built-in behavior:
- \`Symbol.iterator\` — makes object iterable (\`for...of\`)
- \`Symbol.toPrimitive\` — customizes type coercion
- \`Symbol.hasInstance\` — customizes \`instanceof\`
- \`Symbol.toStringTag\` — customizes \`Object.prototype.toString()\`

\`\`\`js
class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.amount;
    return \`\${this.amount} \${this.currency}\`;
  }
}

const price = new Money(100, 'USD');
+price;           // 100
\`\${price}\`;       // '100 USD'
\`\`\`

---

**Q21: Why is \`Object.groupBy\` not a drop-in replacement for Lodash's \`groupBy\`, and when should you use \`Map.groupBy\` instead?**

\`Object.groupBy\` (ES2024) coerces every key returned by the callback to a **string**, and it returns an object with a \`null\` prototype. Both facts change behaviour in ways that bite.

\`\`\`js
Object.groupBy([1, '1'], x => x);   // { '1': [1, '1'] }   — collision
Map.groupBy([1, '1'], x => x);      // Map { 1 => [1], '1' => ['1'] }

const g = Object.groupBy([{ id: null }], r => r.id);
Object.keys(g);          // ['null']  — the string 'null', not the value
g.hasOwnProperty;        // undefined — null prototype, no inherited methods
\`\`\`

Use \`Object.groupBy\` when the key is already a string and you want a plain serialisable object (JSON responses, template rendering). Use \`Map.groupBy\` when the key is a number, a boolean, a date, or an object reference — anything where identity matters. The \`null\` prototype is a security feature, not an oversight: a group named \`"__proto__"\` or \`"constructor"\` cannot corrupt the result the way it could with a normal object literal. Just remember to reach for \`Object.hasOwn(g, key)\` rather than \`g.hasOwnProperty(key)\`.

---

**Q22: When would you use an iterator helper chain instead of array methods?**

Iterator helpers (ES2025) put \`map\`, \`filter\`, \`take\`, \`drop\`, \`flatMap\`, \`reduce\`, \`toArray\`, \`forEach\`, \`some\`, \`every\` and \`find\` on \`Iterator.prototype\`, so they work on generators, \`Map\`s, \`Set\`s and DOM collections — and they evaluate **lazily**.

Two situations make them the right call. First, when the source is infinite or expensive to fully enumerate:

\`\`\`js
function* ids() { let n = 0; while (true) yield n++; }
ids().filter(n => n % 7 === 0).take(3).toArray();   // [0, 7, 14]
\`\`\`

Second, when you only need a prefix of a large transformation. \`bigArray.filter(f).map(g).slice(0, 10)\` allocates two full intermediate arrays to give you ten items; \`bigArray.values().filter(f).map(g).take(10).toArray()\` pulls roughly ten items through the pipeline and stops.

The trade-offs to name out loud: iterators are **single-use** (a second \`toArray()\` returns \`[]\`, silently), they have no \`length\`, and there is no \`sort\` because sorting cannot be lazy. For small arrays the array methods are also *faster* — laziness costs one function call per element per stage, which only pays off when you're skipping work.

---

**Q23: What problem do \`using\` and \`await using\` solve that \`try\`/\`finally\` does not?**

Explicit resource management (ES2026) binds cleanup to a variable's **scope** rather than to a hand-written block, which fixes three things.

It removes the distance between acquisition and release — with \`try\`/\`finally\` the two halves can be a hundred lines apart, and a \`return\` added in the middle by a later commit is easy to get wrong. It removes nesting: three resources means three nested \`try\`/\`finally\` blocks, versus three consecutive \`using\` declarations. And it makes the contract *declarative* — a type carrying \`[Symbol.dispose]\` advertises that it must be cleaned up, so forgetting becomes a lint error rather than a leak found in production.

\`\`\`js
async function handler(req) {
  await using tx = await db.begin();      // [Symbol.asyncDispose]
  using span = tracer.startSpan('handler'); // [Symbol.dispose]
  const rows = await tx.query(/* … */);
  return rows;                            // span disposes, then tx — reverse order
}
\`\`\`

Points interviewers look for: disposal runs on **every** exit path including a throw; disposal order is **reverse of declaration** (it's a stack); \`using\` bindings are implicitly \`const\`; \`null\`/\`undefined\` are skipped so conditional acquisition is safe; and \`await using\` *awaits* the disposal, which is the whole reason it exists separately. For a dynamic number of resources, \`DisposableStack\`/\`AsyncDisposableStack\` collect them and dispose the lot in reverse.

---

**Q24: \`Temporal\` has eight main types where \`Date\` had one. How do you choose, and why does the choice matter?**

The choice encodes a business decision, which is exactly why interviewers ask it. The core split is **instant versus calendar**.

- A **\`Temporal.Instant\`** or **\`ZonedDateTime\`** is one exact moment on the global timeline. Use it for anything that happened or will happen *once*: a log entry, a payment, a meeting.
- A **\`PlainDate\`** is a date on a calendar with no instant attached. Use it for a birthday, a hotel check-in date, an invoice due date — the guest arrives on the 7th no matter which time zone they booked from.
- A **\`PlainTime\`** is a wall-clock time. Use it for "the shop opens at 09:00" — which is a *different instant* in summer and winter.
- A **\`Duration\`** is a length of time, and it is deliberately not a number of milliseconds, because "one month" has no fixed millisecond count.

The classic bug this prevents: storing a recurring daily 9 a.m. standup as a fixed UTC instant. It is correct until the daylight-saving switch, then it silently becomes 8 a.m. or 10 a.m. for everyone. Modelled correctly it is a \`PlainTime\` plus a time zone, resolved to an instant per occurrence.

Beyond type safety, \`Temporal\` objects are **immutable** — every arithmetic method returns a new object, so \`date.add({ months: 1 })\` has no effect unless you use the return value. Months are 1-based. Parsing is strict ISO 8601 rather than \`Date\`'s implementation-defined guessing. And month-end arithmetic **clamps** rather than overflowing: \`2026-01-31\` plus one month is \`2026-02-28\`, where \`Date\`'s \`setMonth\` would have rolled over to March 3.

---

## 16. Tricky Output Questions

Practice questions testing your understanding of JavaScript quirks — type coercion, reference types, and the event loop.

### Type Coercion & Comparisons

---

**Q1: Why does the chained comparison \`3 > 2 > 1\` return \`false\` even though 3, 2, and 1 appear to be in strictly decreasing order?**

\`\`\`js
console.log(3 > 2 > 1);
\`\`\`

**Output:** \`false\`

**Explanation:**

Unlike mathematics or languages like Python, JavaScript does **not** support chained relational comparisons as a single "is this value between these two?" operation. Instead, \`>\` is strictly a binary operator and is left-associative, so the expression is evaluated in two separate steps from left to right.

1. First, \`3 > 2\` is evaluated. Both operands are numbers, so no coercion happens. The result is the boolean \`true\`.
2. The expression now becomes \`true > 1\`. Relational operators require numeric operands, so the abstract \`ToNumber\` algorithm converts \`true\` to \`1\`.
3. The comparison reduces to \`1 > 1\`, which is \`false\`.

The trap is that a reader expects JavaScript to interpret the expression as "is 3 greater than 2 AND 2 greater than 1?", but what actually happens is that the boolean result of the first comparison silently participates in the second one as a number. The same pitfall appears in \`1 < 2 < 3\`, which surprisingly also returns \`true\` — not because the math checks out, but because \`true < 3\` is \`1 < 3\`.

**Takeaway:** JavaScript has no chained comparison syntax; write \`3 > 2 && 2 > 1\` explicitly when you mean a range check.

---

**Q2: Why does \`[] == ![]\` evaluate to \`true\` when an empty array is truthy but also appears to be equal to its own negation?**

\`\`\`js
console.log([] == ![]);
\`\`\`

**Output:** \`true\`

**Explanation:**

Two different coercion systems collide here: unary \`!\` uses the *boolean* coercion rules (\`ToBoolean\`), while \`==\` uses the abstract equality algorithm which coerces objects to primitives and then to numbers.

1. \`![]\` evaluates first because \`!\` has higher precedence than \`==\`. The \`!\` operator applies \`ToBoolean\` to its operand. Every object — including an empty array — is truthy in JavaScript, so \`ToBoolean([])\` is \`true\`. Negating it gives \`false\`. So \`![]\` becomes \`false\`.
2. The expression is now \`[] == false\`. The abstract equality algorithm sees an object on the left and a boolean on the right. The rule is: if either side is a boolean, convert the boolean to a number. \`false\` becomes \`0\`, so we now have \`[] == 0\`.
3. The next step: object on the left, number on the right. The algorithm converts the object to a primitive via \`ToPrimitive\` with a \`"number"\` hint, which calls \`[].valueOf()\` (returns the array itself, not a primitive) and then falls back to \`[].toString()\`, which returns the empty string \`""\`.
4. We now have \`"" == 0\`. The string is coerced to a number: \`Number("")\` is \`0\`. Finally, \`0 == 0\` is \`true\`.

The apparent contradiction with "\`[]\` is truthy" is only apparent: truthiness (used by \`!\`, \`if\`, \`&&\`, \`||\`) is a different conversion path than abstract equality (used by \`==\`), so one object can simultaneously be truthy AND loosely equal to \`false\`.

**Takeaway:** \`!\` uses \`ToBoolean\`; \`==\` uses object-to-primitive plus numeric coercion. These are different rule sets, which is exactly why linters forbid \`==\` on mixed types — always prefer \`===\`.

---

**Q3: How can \`null >= 0\` be \`true\` while both \`null > 0\` and \`null == 0\` are \`false\` — isn't that mathematically inconsistent?**

\`\`\`js
console.log(null >= 0);
console.log(null > 0);
console.log(null == 0);
\`\`\`

**Output:**
\`\`\`
true
false
false
\`\`\`

**Explanation:**

This is one of the most famous inconsistencies in the language, and it happens because the relational operators (\`<\`, \`<=\`, \`>\`, \`>=\`) and the equality operators (\`==\`, \`!=\`) use **completely different specification algorithms**.

1. For \`null >= 0\` and \`null > 0\`, JavaScript uses the Abstract Relational Comparison algorithm. This algorithm calls \`ToNumber\` on both operands. \`ToNumber(null)\` is defined to be \`0\`, and \`ToNumber(0)\` is \`0\`. So \`null >= 0\` reduces to \`0 >= 0\` → \`true\`, and \`null > 0\` reduces to \`0 > 0\` → \`false\`.
2. For \`null == 0\`, JavaScript uses the Abstract Equality algorithm, which has a **hard-coded special case**: \`null\` is only loosely equal to \`null\` and \`undefined\`. It does **not** coerce \`null\` to a number. So \`null == 0\` returns \`false\` without any numeric comparison ever happening.

The contradiction — "if \`null >= 0\` is true but \`null == 0\` is false, then \`null > 0\` must be true" — is what mathematicians would call a violation of trichotomy. JavaScript breaks this intentionally because \`==\` treats \`null\` as a distinct nullish sentinel (for the idiomatic \`x == null\` check that catches both \`null\` and \`undefined\`), while the relational operators fell back to blind numeric coercion.

**Takeaway:** \`null\` uses different coercion rules for \`<\`/\`<=\`/\`>\`/\`>=\` (numeric) than for \`==\`/\`!=\` (special-cased). Never rely on relational operators with \`null\`; use explicit \`null\` or \`undefined\` checks.

---

**Q4: Why does \`NaN == NaN\` return \`false\` when every other value in JavaScript is equal to itself?**

\`\`\`js
console.log(NaN == NaN);
\`\`\`

**Output:** \`false\`

**Explanation:**

\`NaN\` (Not-a-Number) is a special floating-point value that represents the result of an undefined or unrepresentable mathematical operation — things like \`0/0\`, \`Math.sqrt(-1)\`, \`parseInt("abc")\`, or \`"foo" * 2\`. The behavior \`NaN !== NaN\` is not a JavaScript quirk; it comes directly from the **IEEE 754** floating-point standard, which JavaScript's \`Number\` type implements.

The reasoning in IEEE 754 is philosophical: \`NaN\` means "the result of a failed computation", and two failed computations aren't necessarily the same failure. \`0/0\` and \`Math.sqrt(-1)\` both yield \`NaN\`, but treating them as equal would be misleading — they represent different undefined outcomes. By design, any comparison involving \`NaN\` (using \`==\`, \`===\`, \`<\`, \`>\`, \`<=\`, \`>=\`) returns \`false\`, except \`!=\` and \`!==\` which return \`true\`.

This means you cannot detect \`NaN\` with equality:

\`\`\`js
const x = NaN;
x === NaN;          // false
x !== x;            // true — the classic self-inequality trick
Number.isNaN(x);    // true — the correct way
isNaN("abc");       // true — but the global isNaN is buggy (coerces first)
Object.is(NaN, NaN); // true — Object.is has special NaN handling
\`\`\`

Note that \`Object.is(NaN, NaN)\` returns \`true\` because \`Object.is\` uses the "SameValue" algorithm, which explicitly treats \`NaN\` as equal to itself. It also distinguishes \`+0\` from \`-0\`, unlike \`===\`.

**Takeaway:** \`NaN\` is the only value not equal to itself; use \`Number.isNaN(x)\` or \`Object.is(x, NaN)\` to test for it, never \`x === NaN\`.

---

**Q5: What does each of \`[] + []\`, \`[] + {}\`, \`{} + []\`, and \`true + true\` produce, and why do two of them look like they should give the same result but don't?**

\`\`\`js
console.log([] + []);
console.log([] + {});
console.log({} + []);
console.log(true + true);
\`\`\`

**Output:**
\`\`\`
""
"[object Object]"
0
2
\`\`\`

**Explanation:**

The binary \`+\` operator in JavaScript has a dual personality: it's both numeric addition and string concatenation. For each operand it calls \`ToPrimitive\` with a \`"default"\` hint; if either resulting primitive is a string, it switches to string concatenation, otherwise it does numeric addition. The surprise here is that **parser context** also changes the meaning of \`{}\`.

1. **\`[] + []\`**: Both operands are arrays. \`ToPrimitive\` on an array calls \`.toString()\`, which joins elements with commas. An empty array joins to \`""\`. So we get \`"" + ""\`, and since at least one side is a string, the result is string concatenation: \`""\`.
2. **\`[] + {}\`**: The left side coerces to \`""\` as above. The right side is an object literal in an **expression** position, so \`ToPrimitive\` is applied: \`({}).toString()\` returns \`"[object Object]"\`. Result: \`"" + "[object Object]"\` → \`"[object Object]"\`.
3. **\`{} + []\`**: At the **start of a statement**, \`{}\` is parsed as an empty block statement, not an object literal. The parser sees \`{}\` (a block that does nothing) followed by \`+[]\`, where \`+\` is now the **unary** plus operator. Unary \`+\` coerces its operand to a number: \`+[]\` calls \`ToNumber([])\`, which first converts to \`""\`, then \`Number("")\` is \`0\`. So the whole line logs \`0\`. (If you wrap it as \`({} + [])\`, the parens force expression context and you get \`"[object Object]"\` instead.)
4. **\`true + true\`**: Neither operand is an object or string, so \`+\` does numeric addition. \`ToNumber(true)\` is \`1\`, so the result is \`1 + 1\` = \`2\`.

The key insight: \`{} + []\` behaves differently from \`[] + {}\` not because \`+\` is non-commutative (it is for strings, but that's not what's happening here), but because the parser decides whether \`{}\` is a block or an object based on position.

**Takeaway:** \`+\` prefers strings when either operand coerces to one, and a leading \`{}\` on a line is parsed as a block — wrap expressions in parentheses if you need object-literal semantics.

---

### Reference Equality

---

**Q6: Why does \`{} === {}\` return \`false\` — aren't two empty objects "the same"?**

\`\`\`js
console.log({} === {});
console.log([] === []);
\`\`\`

**Output:**
\`\`\`
false
false
\`\`\`

**Explanation:**

JavaScript divides its values into two big families: **primitives** (string, number, boolean, null, undefined, symbol, bigint) and **objects** (everything else — plain objects, arrays, functions, dates, maps, etc.). The \`===\` operator compares these families differently.

- For primitives, \`===\` compares **by value**: \`"a" === "a"\` is \`true\`, and \`5 === 5\` is \`true\`, regardless of where those literals appear in source code.
- For objects, \`===\` compares **by reference** (identity): two objects are \`===\` only if they are literally the same object in memory — the same slot on the heap.

Each time you write an object or array literal (\`{}\`, \`[]\`, \`new Date()\`, a function expression, etc.), the engine allocates a **fresh** object on the heap and returns a reference to it. Even if the new object has identical contents to another, they live at different memory addresses, so the references are different, so \`===\` is \`false\`.

\`\`\`js
const a = {};
const b = a;
a === b; // true — same reference

const c = {};
a === c; // false — different references even though both are empty

// To compare contents, you need structural equality:
JSON.stringify(a) === JSON.stringify(c); // true (but brittle — ignores undefined, functions, symbols, circular refs)
\`\`\`

The same applies to arrays, functions, and every other object type. \`[] === []\` is \`false\`, \`(()=>{}) === (()=>{})\` is \`false\`, and so on.

**Takeaway:** Objects and arrays compare by reference, not structure; use a deep-equality helper (lodash \`isEqual\`, \`JSON.stringify\` for simple data) when you need value-based comparison.

---

### Async / Event Loop (Advanced)

These questions test your understanding of the execution order between synchronous code, microtasks (Promises, await), and macrotasks (setTimeout).

---

**Q7: In what order will \`"A"\`, \`"B"\`, and \`"C"\` print when an async function logs \`"A"\`, awaits a resolved promise, then logs \`"B"\`, and the calling code logs \`"C"\` after invoking the function?**

\`\`\`js
async function test() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}
test();
console.log("C");
\`\`\`

**Output:**
\`\`\`
A
C
B
\`\`\`

**Explanation:**

An \`async\` function is **not** asynchronous from the caller's perspective until it hits its first \`await\` (or \`return\`). Up to that point, every statement runs synchronously as part of the call that invoked it.

1. \`test()\` is invoked. Execution enters the function body. \`console.log("A")\` runs immediately and prints \`A\`.
2. \`await Promise.resolve()\` is reached. Even though the promise is already resolved, \`await\` **always suspends** the async function and schedules the continuation (everything after \`await\`) as a microtask. Control returns to the caller. \`test()\` returns an unresolved promise.
3. The next synchronous statement runs: \`console.log("C")\` prints \`C\`.
4. The synchronous portion of the script finishes. The JavaScript runtime now drains the microtask queue before returning control to the event loop. The continuation of \`test\` runs: \`console.log("B")\` prints \`B\`.

The critical rule people miss is step 2: \`await\` suspends **even when the promise is already resolved**. It does not optimize the "already-resolved" case. This is what makes \`await\` different from just reading \`.then()\` callbacks — the code after \`await\` always runs in a later microtask tick.

**Takeaway:** The body of an \`async\` function runs synchronously until the first \`await\`, after which the remainder is scheduled as a microtask — so anything after the \`async\` call but before the event loop yields runs before the post-\`await\` code.

---

**Q8: When a \`console.log(3)\` happens before an \`async\` function is called and \`console.log(4)\` happens after, in what order do \`1\`, \`2\`, \`3\`, and \`4\` appear?**

\`\`\`js
async function test() {
  console.log(1);
  await Promise.resolve();
  console.log(2);
}

console.log(3);
test();
console.log(4);
\`\`\`

**Output:**
\`\`\`
3
1
4
2
\`\`\`

**Explanation:**

The execution walks through one synchronous pass followed by one microtask flush. Here's the step-by-step trace:

1. \`console.log(3)\` runs first because it appears first in source order. Output so far: \`3\`.
2. \`test()\` is invoked. Because \`async\` functions run synchronously up to the first \`await\`, \`console.log(1)\` executes immediately. Output so far: \`3, 1\`.
3. \`await Promise.resolve()\` is reached. The async function suspends and schedules the continuation (\`console.log(2)\`) as a microtask. \`test()\` returns an unresolved promise to the caller, but nothing is done with it.
4. Execution returns to the top-level script. \`console.log(4)\` runs synchronously. Output so far: \`3, 1, 4\`.
5. The synchronous portion is now complete. The runtime drains the microtask queue. The \`test\` continuation resumes and runs \`console.log(2)\`. Final output: \`3, 1, 4, 2\`.

The crucial observation: calling \`test()\` does **not** immediately defer the entire body — only the part **after** \`await\`. So \`1\` prints between \`3\` and \`4\` (synchronous portion), while \`2\` prints after \`4\` (microtask portion).

**Takeaway:** Calling an \`async\` function is a blend of synchronous execution (up to the first \`await\`) and scheduled microtasks (everything after); read each \`await\` as "suspend here and continue in a future microtask tick".

---

**Q9: Given a \`setTimeout\` that internally schedules a Promise, plus a top-level Promise and surrounding synchronous logs, what is the exact printing order?**

\`\`\`js
console.log("A");

setTimeout(() => {
  console.log("B");
  Promise.resolve().then(() => console.log("C"));
}, 0);

Promise.resolve().then(() => console.log("D"));

console.log("E");
\`\`\`

**Output:**
\`\`\`
A
E
D
B
C
\`\`\`

**Explanation:**

The event loop processes work in three tiers with strict priority: **synchronous code** on the call stack finishes first, then the entire **microtask queue** is drained, and only then does the loop pick **one** macrotask (a \`setTimeout\` callback is a macrotask). After each macrotask, the microtask queue is drained again before the next macrotask runs.

1. **Synchronous pass.** \`console.log("A")\` prints \`A\`. \`setTimeout(...)\` registers its callback as a macrotask (it does not run yet, even with \`0ms\` delay). \`Promise.resolve().then(...)\` registers its callback as a microtask. \`console.log("E")\` prints \`E\`.
2. **First microtask drain.** The synchronous script is done. The runtime drains the microtask queue. The \`.then(() => console.log("D"))\` callback fires, printing \`D\`.
3. **First macrotask.** The event loop picks the \`setTimeout\` callback. \`console.log("B")\` prints \`B\`. Inside this callback, \`Promise.resolve().then(() => console.log("C"))\` schedules a new microtask.
4. **Second microtask drain.** The macrotask has finished, so the runtime drains the microtask queue again before the next macrotask. The newly-scheduled callback fires, printing \`C\`.

Final order: \`A, E, D, B, C\`. The lesson is the relative priority of microtasks and macrotasks — even a \`0ms\` \`setTimeout\` runs after every currently-queued microtask, and each macrotask has its own follow-up microtask drain.

**Takeaway:** Microtasks (Promises, \`queueMicrotask\`, \`MutationObserver\`) run to completion between each macrotask (\`setTimeout\`, \`setInterval\`, I/O), so a \`setTimeout(fn, 0)\` is always later than any already-resolved promise.

---

**Q10: When an \`async\` function with \`await\` is called and then a separate \`Promise.then()\` is chained afterwards, which one's callback runs first in the microtask queue?**

\`\`\`js
async function foo() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}

console.log("C");
foo();
Promise.resolve().then(() => console.log("D"));
console.log("E");
\`\`\`

**Output:**
\`\`\`
C
A
E
B
D
\`\`\`

**Explanation:**

This question tests microtask **ordering** — microtasks run in the order they are enqueued (FIFO). Because \`foo()\` is called **before** the \`.then()\` registration, the \`await\` continuation gets queued first.

1. **Synchronous pass begins.** \`console.log("C")\` prints \`C\`.
2. \`foo()\` is invoked. The body runs synchronously until the first \`await\`. \`console.log("A")\` prints \`A\`. The \`await Promise.resolve()\` suspends \`foo\` and enqueues its continuation (\`console.log("B")\`) as **microtask #1**.
3. \`Promise.resolve().then(() => console.log("D"))\` runs. The promise is already resolved, so the \`.then\` callback is enqueued immediately as **microtask #2**.
4. \`console.log("E")\` prints \`E\`.
5. **Synchronous pass is done.** The microtask queue now holds \`[continuation of foo, then-callback]\`. They are dequeued in FIFO order: \`B\` prints first, then \`D\`.

Final order: \`C, A, E, B, D\`. If you had called \`foo()\` **after** the \`.then()\`, the order of the last two would flip to \`D, B\`. This is a common interview trick — the printing of \`D\` and \`B\` is determined purely by the order in which \`await\` and \`.then()\` were reached during the synchronous phase, not by any intrinsic priority of one over the other.

**Takeaway:** The microtask queue is FIFO — whichever microtask was scheduled first runs first; \`await\` and \`.then()\` have equal priority and are ordered solely by when they were encountered during synchronous execution.

---

**Q11: Given a mix of synchronous logs, a \`setTimeout\`, an \`async\` function with \`await\`, and a \`Promise.then\`, what is the full execution order from start to finish?**

\`\`\`js
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
\`\`\`

**Output:**
\`\`\`
1
3
6
4
5
2
\`\`\`

**Explanation:**

This combines everything from the previous questions: synchronous order, microtask FIFO ordering, and the microtask-vs-macrotask priority rule. Walk through each step carefully:

1. **Synchronous phase.** \`console.log("1")\` prints \`1\`. The \`setTimeout\` callback is registered as a **macrotask** (it won't run until the stack and microtask queue are empty).
2. The function declaration \`async function foo() { ... }\` is hoisted and does not produce output.
3. \`foo()\` is called. Inside the async body, \`console.log("3")\` runs synchronously and prints \`3\`. Then \`await Promise.resolve()\` suspends \`foo\` and enqueues its continuation (\`console.log("4")\`) as **microtask #1**.
4. \`Promise.resolve().then(() => console.log("5"))\` runs and enqueues the \`.then\` callback as **microtask #2**.
5. \`console.log("6")\` prints \`6\`. The synchronous phase is now done. Output so far: \`1, 3, 6\`.
6. **Microtask drain.** Queue is \`[foo-continuation, then-callback]\`. FIFO dequeue: \`console.log("4")\` prints \`4\`, then \`console.log("5")\` prints \`5\`.
7. **Macrotask pick.** The microtask queue is empty. The event loop picks the next macrotask — the \`setTimeout\` callback. \`console.log("2")\` prints \`2\`.

Final order: \`1, 3, 6, 4, 5, 2\`. Notice the synchronous logs all happen first (in the source order \`1, 3, 6\`), then all already-queued microtasks drain in FIFO order (\`4, 5\`), and the \`setTimeout\` callback — despite its \`0ms\` delay — is last.

**Takeaway:** Execution order is always: (1) synchronous call stack to completion, (2) entire microtask queue drained FIFO, (3) one macrotask, then repeat — so \`setTimeout(fn, 0)\` always loses to \`await\` and \`.then()\` callbacks queued in the same tick.

---

### Modern JavaScript (ES2022–ES2026)

---

**Q12: Grouping three rows by \`id\` with \`Object.groupBy\` produces only two keys and the result has no \`hasOwnProperty\` — why?**

\`\`\`js
const rows = [{ id: 1 }, { id: '1' }, { id: null }];
const grouped = Object.groupBy(rows, r => r.id);

console.log(Object.keys(grouped));
console.log(grouped['1'].length);
console.log(grouped.hasOwnProperty);
\`\`\`

**Output:**
\`\`\`
[ '1', 'null' ]
2
undefined
\`\`\`

**Explanation:**

Three separate design decisions in \`Object.groupBy\` (ES2024) collide in this one snippet.

1. **Keys are coerced to strings.** The callback returns the number \`1\` for the first row and the string \`'1'\` for the second. Because the result is a plain object, both keys pass through \`ToPropertyKey\`, and the number \`1\` becomes the string \`'1'\`. The two rows land in the same bucket, which is why \`grouped['1'].length\` is \`2\` rather than \`1\`. This is not special to \`groupBy\` — it is the ordinary rule that object keys are strings or symbols — but it is easy to forget when the callback looks like it is returning a number.

2. **\`null\` becomes the string \`'null'\`.** There is no "no group" behaviour and no skipping. \`ToPropertyKey(null)\` produces the four-character string \`'null'\`, so you get a bucket literally named \`null\` sitting next to your real groups. The same happens for \`undefined\`, which becomes \`'undefined'\`. Filter before grouping if you don't want that.

3. **The returned object has a \`null\` prototype.** \`Object.groupBy\` deliberately creates its result via \`OrdinaryObjectCreate(null)\`, so it inherits nothing from \`Object.prototype\`. That means \`grouped.hasOwnProperty\` is \`undefined\`, \`grouped.toString\` is \`undefined\`, and \`String(grouped)\` throws. The reason is safety: if some row's key were \`"__proto__"\` or \`"constructor"\`, a normal object literal would have those assignments either silently ignored or actively corrupting the prototype chain. With a \`null\` prototype every key is just data.

\`Map.groupBy\` avoids the first two problems entirely, because \`Map\` keys are compared with SameValueZero and keep their original type — \`Map.groupBy(rows, r => r.id)\` gives you three distinct entries keyed by \`1\`, \`'1'\` and \`null\`.

**Takeaway:** \`Object.groupBy\` stringifies keys and returns a prototype-less object — use \`Map.groupBy\` for non-string keys, and \`Object.hasOwn(g, k)\` instead of \`g.hasOwnProperty(k)\`.

---

**Q13: Why do the \`map\` and \`filter\` side effects interleave here, instead of all the \`map\` logs coming first?**

\`\`\`js
const chain = [1, 2, 3].values()
  .map(n => { console.log('map', n); return n * 2; })
  .filter(n => { console.log('filter', n); return n > 2; });

console.log('nothing yet');
console.log(chain.take(1).toArray());
\`\`\`

**Output:**
\`\`\`
nothing yet
map 1
filter 2
map 2
filter 4
[ 4 ]
\`\`\`

**Explanation:**

Iterator helpers (ES2025) are **lazy**, which changes both *when* work happens and *in what order*.

The first thing to notice is that \`'nothing yet'\` prints before any \`map\` or \`filter\` log. Building the chain does no work at all — \`.map()\` and \`.filter()\` on an iterator return a new iterator that merely remembers the callback. Nothing is pulled from the source until a terminal operation asks for a value. With arrays this would be impossible: \`[1,2,3].map(f)\` runs \`f\` three times immediately and hands back a finished array.

The second thing is the interleaving. Because evaluation is pull-based, \`toArray()\` asks \`take(1)\` for one value, which asks \`filter\` for a value, which asks \`map\` for a value, which asks the source array's iterator. So each element travels the **entire pipeline** before the next element is touched:

- Pull #1: \`map 1\` logs, produces \`2\`. \`filter 2\` logs, \`2 > 2\` is \`false\` — rejected, so \`filter\` pulls again.
- Pull #2: \`map 2\` logs, produces \`4\`. \`filter 4\` logs, \`4 > 2\` is \`true\` — accepted. \`take(1)\` has its one value and stops.
- The source element \`3\` is **never touched**. No \`map 3\`, no \`filter 6\`.

The equivalent array chain would have printed \`map 1, map 2, map 3\` (all of them, including the wasted third), then \`filter 2, filter 4, filter 6\`, and allocated two three-element intermediate arrays along the way.

There is a further trap hiding here: \`chain\` is now **exhausted for anything past the first accepted value**, and iterators are single-use. Calling \`chain.toArray()\` again returns \`[6]\` — the remaining elements — and a third call returns \`[]\`, with no error to tell you the pipeline is drained.

**Takeaway:** iterator helpers build a pull-based pipeline — nothing runs until a terminal operation (\`toArray\`, \`reduce\`, \`find\`, \`some\`, \`forEach\`), each element flows through every stage before the next one starts, and elements past what you consumed are never evaluated.

---

**Q14: In what order do the disposals run when the function body throws?**

\`\`\`js
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
\`\`\`

**Output:**
\`\`\`
body
dispose b
dispose a
caught boom
\`\`\`

**Explanation:**

\`using\` declarations (ES2026 explicit resource management) register their resource on a per-scope disposal stack, and the engine unwinds that stack when the block exits — **however** it exits.

Two things determine the output. First, disposal is **LIFO**: \`b\` was declared last, so it disposes first. This mirrors nested \`try\`/\`finally\` blocks, and it is the only order that can be correct in general — if \`b\` was constructed using \`a\` (a transaction opened on a connection, a span inside a tracer), then \`a\` must still be alive while \`b\` cleans up.

Second, disposal happens **before the exception propagates out of the function**. The \`throw\` begins unwinding the scope; the scope's exit runs the disposal stack; only then does the error continue to the caller's \`catch\`. So both \`dispose\` logs land before \`caught boom\`. This is exactly the guarantee \`finally\` gives you, which is the point — \`using\` is \`finally\` with the boilerplate removed and the ordering handled for you.

Related traps worth knowing:

- \`using\` bindings are implicitly **\`const\`**. \`using a = …; a = other;\` is a syntax error, because the engine must be certain the value it disposes is the value it acquired.
- \`null\` and \`undefined\` are **skipped silently**, so \`using maybe = flag ? open() : null;\` is legal. Any other value lacking \`[Symbol.dispose]\` is a \`TypeError\` thrown at the declaration.
- If a dispose method itself throws while the scope is already unwinding from an error, the errors are aggregated into a \`SuppressedError\` rather than one silently replacing the other.
- \`await using\` is a distinct form that looks up \`[Symbol.asyncDispose]\` and **awaits** the result. Using plain \`using\` on an async resource does not await the teardown, which is the subtle bug: the transaction rolls back *eventually*, after your response has already gone out.

**Takeaway:** \`using\` disposes in reverse declaration order, on every exit path including a \`throw\`, and always before the error propagates — and \`await using\` is required if the cleanup is itself asynchronous.

---

**Q15: Why does the date not change on the first log, and why is the second result February 28 rather than March 3?**

\`\`\`js
const d = Temporal.PlainDate.from('2026-01-31');
d.add({ months: 1 });
console.log(d.toString());

console.log(Temporal.PlainDate.from('2026-01-31').add({ months: 1 }).toString());

const legacy = new Date(2026, 0, 31);
legacy.setMonth(legacy.getMonth() + 1);
console.log(legacy.toISOString().slice(0, 10));
\`\`\`

**Output:**
\`\`\`
2026-01-31
2026-02-28
2026-03-03
\`\`\`

**Explanation:**

This contrasts the two things \`Temporal\` changed about date arithmetic.

**Immutability.** Every \`Temporal\` type is frozen; \`add\`, \`subtract\`, \`with\`, \`round\` and friends all return a **new** object and never touch the receiver. So \`d.add({ months: 1 })\` on line 2 computes a value and throws it away — \`d\` is still \`2026-01-31\`. This is the single most common \`Temporal\` mistake among developers coming from \`Date\`, where \`setMonth\` mutates in place and returns a timestamp number. The mutation-based API was the source of countless aliasing bugs (two variables pointing at the same \`Date\`, one of them "helpfully" advanced); making the types immutable eliminates the class entirely, at the cost of having to remember to use the return value.

**Clamping instead of overflow.** January 31 plus one month has no obvious answer, because February 31 does not exist. \`Temporal\`'s default \`overflow: 'constrain'\` mode **clamps the day to the last valid day of the target month**, giving \`2026-02-28\`. That matches how humans reason about "a month from the 31st" and how subscription billing works. Legacy \`Date\` instead lets the invalid day **overflow** into the next month: \`setMonth\` builds February 31, which normalises to March 3 (2026 is not a leap year, so February has 28 days, and 31 − 28 = 3). Silent overflow is why "renew one month later" code drifts and occasionally skips a month entirely.

If you actually want the error rather than the clamp, \`Temporal\` lets you ask for it: \`d.add({ months: 1 }, { overflow: 'reject' })\` throws a \`RangeError\` instead of quietly picking a day.

A related asymmetry follows from clamping: date arithmetic is **not** reversible. \`2026-01-31\` plus one month minus one month is \`2026-01-28\`, not \`2026-01-31\`. That is inherent to calendar math, not a \`Temporal\` flaw — but interviewers like it because it forces you to think about whether your business rule wants calendar months or a fixed number of days.

**Takeaway:** \`Temporal\` objects are immutable (use the return value) and clamp out-of-range days to the end of the month, where legacy \`Date\` mutates in place and overflows into the following month.

---

**Q16: Why does this take about 60 ms rather than about 30 ms, and why is the result in source order?**

\`\`\`js
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
\`\`\`

**Output:**
\`\`\`
yield 30
yield 10
yield 20
[ 30, 10, 20 ] true
\`\`\`

**Explanation:**

\`Array.fromAsync\` (ES2026) is often mistaken for "\`Promise.all\` for async iterables". It is not. It drains the async iterable **sequentially**, awaiting each value before requesting the next — it is a \`for await…of\` accumulation loop with the boilerplate removed.

That has to be true, because an async iterator is pull-based and *serial by construction*. \`Array.fromAsync\` cannot ask a generator for its third value without the generator having produced its second — there is nothing to parallelise. So the total time is the **sum** of the delays (30 + 10 + 20 ≈ 60 ms), and the logs appear in source order rather than in fastest-first order.

Contrast the superficially similar \`Promise.all\`:

\`\`\`js
// Sequential: ~60 ms — each await blocks the next pull
await Array.fromAsync(gen());

// Parallel: ~30 ms — all three timers run concurrently
await Promise.all([30, 10, 20].map(ms => new Promise(r => setTimeout(() => r(ms), ms))));
\`\`\`

Both return results in source order — \`Promise.all\` preserves input order regardless of settle order — but only one of them overlaps the waiting.

Which behaviour you want depends on whether the items are independent. Sequential is **required** for paginated fetching, because page 2's cursor comes out of page 1's response; you literally cannot start request *n+1* before request *n* returns. Parallel is what you want for independent requests, and \`Array.fromAsync\` is the wrong tool there — you would \`Promise.all\` a mapped array, or use a bounded concurrency pool if you need to avoid hammering the server.

One more detail: \`Array.fromAsync\` also accepts a **sync** iterable of promises, in which case it awaits each element as it collects it. That makes \`Array.fromAsync([p1, p2, p3])\` behave like a sequential \`Promise.all\` — same result, no concurrency — which is almost never what you meant to write.

**Takeaway:** \`Array.fromAsync\` is a sequential drain of an async iterable (\`for await…of\` in one line), not a concurrent one — reach for \`Promise.all\` or a concurrency pool when the work is independent.

---

### Key Rules

\`\`\`
Execution Order:
1. Synchronous code (call stack)
2. Microtasks (Promise.then, await continuation)
3. Macrotasks (setTimeout, setInterval)
\`\`\`

- \`==\` performs type coercion, \`===\` does not
- Objects and arrays compare by reference, not value
- \`await\` pauses the async function and schedules the rest as a microtask
- \`this\` depends on the call site, not where the function is defined
- \`var\` is function-scoped, \`let\`/\`const\` are block-scoped

---

## References

- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) — Comprehensive JavaScript tutorials and reference
- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference) — Complete API reference for built-in objects
- [ECMAScript Specification](https://tc39.es/ecma262/) — The official language specification
- [JavaScript.info](https://javascript.info) — Modern JavaScript tutorial with detailed explanations
`;export{e as default};
