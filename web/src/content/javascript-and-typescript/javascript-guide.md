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
- [9. ES6+ Features](#9-es6-features)
- [10. Error Handling](#10-error-handling)
- [11. The Event Loop](#11-the-event-loop)
- [12. Modules](#12-modules)
- [13. DOM Manipulation](#13-dom-manipulation)
- [14. Design Patterns](#14-design-patterns)
- [15. Interview Questions & Answers](#15-interview-questions--answers)
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
const add = function(a, b) {
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
const add = (a, b) => a + b;

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
fn();                             // undefined (called as plain function)

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
  // console.log(innerVar);          // ReferenceError
}
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
counter.increment();                  // 1
counter.increment();                  // 2
counter.getCount();                   // 2
// `count` is private - no direct access from outside
```

### 5.3 Classic Closure Gotcha

This is one of the most common interview questions about closures. Because `var` is function-scoped, all iterations of a loop share the same variable, so callbacks created inside the loop all see the final value. Using `let` (block-scoped) or an IIFE fixes this by giving each iteration its own copy.

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

---

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
{ ...obj, d: 4 };                     // same as above

Object.freeze(obj);                   // shallow freeze (no add/modify/delete)
Object.seal(obj);                     // no add/delete, can modify existing
Object.isFrozen(obj);                 // true
```

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
  // DON'T: Sequential (slow)
  const kpis = await fetchKPIs();
  const alerts = await fetchAlerts();

  // DO: Parallel (fast)
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

## 9. ES6+ Features

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

// Default export (one per module)
export default function main() { /* ... */ }

// Named imports
import { PI, add } from './math.js';

// Default import
import main from './main.js';

// Rename on import
import { add as sum } from './math.js';

// Import all as namespace
import * as math from './math.js';
math.add(1, 2);

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

| | ESM | CJS |
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
```

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
inc(); // 1
inc(); // 2 (count persists because of closure)
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

When an event occurs on a DOM element:
1. **Capturing phase**: Event travels DOWN from `window` -> `document` -> ... -> target's parent
2. **Target phase**: Event reaches the target element
3. **Bubbling phase**: Event travels UP from target -> parent -> ... -> `document` -> `window`

By default, handlers listen during the **bubbling** phase. Use `addEventListener(event, fn, true)` for capturing.

`event.stopPropagation()` stops the event from propagating further. `event.preventDefault()` prevents the default browser action (e.g., form submission, link navigation).

---

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

JavaScript is single-threaded with a non-blocking event loop:

1. Synchronous code executes on the **call stack**
2. Async operations (setTimeout, fetch, etc.) are delegated to browser/Node APIs
3. When async operations complete, their callbacks are queued
4. The event loop checks: if the call stack is empty, it dequeues from the **microtask queue** first (promises), then the **macrotask queue** (setTimeout, I/O)
5. This cycle repeats continuously

This allows JavaScript to handle concurrent operations without threads.

---

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

All three set the `this` context for a function:

- `call(thisArg, arg1, arg2, ...)` — invokes immediately, args passed individually
- `apply(thisArg, [args])` — invokes immediately, args passed as array
- `bind(thisArg, arg1, ...)` — returns a NEW function with `this` bound (doesn't invoke)

```js
function greet(greeting) { return `${greeting}, ${this.name}`; }

greet.call({ name: 'Alice' }, 'Hello');     // 'Hello, Alice'
greet.apply({ name: 'Bob' }, ['Hi']);        // 'Hi, Bob'
const fn = greet.bind({ name: 'Charlie' });
fn('Hey');                                   // 'Hey, Charlie'
```

---

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
fib.next(); // { value: 0, done: false }
fib.next(); // { value: 1, done: false }
fib.next(); // { value: 1, done: false }
fib.next(); // { value: 2, done: false }
```

Use cases:
- **Lazy evaluation**: Generate values on demand (infinite sequences)
- **Async flow control**: Redux-Saga uses generators to manage async side effects
- **Custom iterables**: Make any object work with `for...of`
- **State machines**: Pause between states

---

**Q13: What is `WeakRef` and `FinalizationRegistry`?**

- `WeakRef` holds a weak reference to an object — doesn't prevent garbage collection.
- `FinalizationRegistry` lets you register a callback when an object is garbage collected.

```js
let obj = { data: 'important' };
const weakRef = new WeakRef(obj);

weakRef.deref();  // { data: 'important' }
obj = null;       // original reference gone
// After GC: weakRef.deref() returns undefined

const registry = new FinalizationRegistry((heldValue) => {
  console.log(`${heldValue} was garbage collected`);
});
registry.register(someObj, 'my-object');
```

Use case: Caches where entries should be automatically cleaned up when memory is needed.

---

**Q14: Explain the difference between `for...in` and `for...of`.**

- `for...in` iterates over **enumerable string property keys** (including inherited ones). Best for objects.
- `for...of` iterates over **values** of iterable objects (arrays, strings, maps, sets, generators). Cannot be used on plain objects.

```js
const arr = ['a', 'b', 'c'];
arr.custom = 'oops';

for (const key in arr) console.log(key);    // '0', '1', '2', 'custom'
for (const val of arr) console.log(val);    // 'a', 'b', 'c'

const obj = { x: 1, y: 2 };
for (const key in obj) console.log(key);    // 'x', 'y'
// for (const val of obj) ...               // TypeError: obj is not iterable
for (const [k, v] of Object.entries(obj))   // works: 'x' 1, 'y' 2
```

---

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

```js
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
```

---

**Q17: Explain `Object.freeze` vs `Object.seal` vs `Object.preventExtensions`.**

| Method | Add props | Delete props | Modify values |
|--------|-----------|-------------|---------------|
| `Object.preventExtensions` | No | Yes | Yes |
| `Object.seal` | No | No | Yes |
| `Object.freeze` | No | No | No |

All three are **shallow** — nested objects are not affected:
```js
const obj = Object.freeze({ nested: { a: 1 } });
obj.nested.a = 99;  // works! nested object is not frozen
```

For deep freeze, you need to recursively freeze all nested objects.

---

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

## 16. Tricky Output Questions

Practice questions testing your understanding of JavaScript quirks — type coercion, reference types, and the event loop.

### Type Coercion & Comparisons

---

**Q1: What does `3 > 2 > 1` return?**

```js
console.log(3 > 2 > 1);
```

**Output:** `false`

`3 > 2` evaluates to `true`, then `true` is coerced to `1`, and `1 > 1` is `false`.

---

**Q2: Why is `[] == ![]` true?**

```js
console.log([] == ![]);
```

**Output:** `true`

`![]` is `false` (arrays are truthy). Then `[] == false` — both sides coerce to `0`, so `0 == 0` is `true`.

---

**Q3: Null comparison quirks**

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

`>=` and `>` coerce `null` to `0`, so `0 >= 0` is `true` but `0 > 0` is `false`. However, `==` has special rules — `null` only equals `undefined`, not `0`.

---

**Q4: NaN is not equal to itself**

```js
console.log(NaN == NaN);
```

**Output:** `false`

`NaN` is the only value in JavaScript that is not equal to itself. Use `Number.isNaN()` to check for NaN.

---

**Q5: Array and object coercion with `+`**

```js
console.log([] + []);
console.log([] + {});
console.log({} + []);
console.log(true + true);
```

**Output:**
```
""
"[object Object]"
0
2
```

- `[] + []`: Both arrays coerce to `""`, so `"" + ""` = `""`.
- `[] + {}`: `[]` becomes `""`, `{}` becomes `"[object Object]"`.
- `{} + []`: `{}` is parsed as empty block, so it becomes `+[]` which is `0`.
- `true + true`: Both coerce to `1`, so `1 + 1` = `2`.

---

### Reference Equality

---

**Q6: Objects and arrays are compared by reference**

```js
console.log({} === {});
console.log([] === []);
```

**Output:**
```
false
false
```

Two separate object/array literals create two different references in memory, so they are never equal.

---

### Async / Event Loop (Advanced)

These questions test your understanding of the execution order between synchronous code, microtasks (Promises, await), and macrotasks (setTimeout).

---

**Q7: async/await execution order**

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

`"A"` prints synchronously. `await` pauses the function and schedules the rest as a microtask. `"C"` prints next (synchronous). Then `"B"` runs from the microtask queue.

---

**Q8: async function interleaved with synchronous code**

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

`3` is synchronous. `test()` is called — `1` prints synchronously, then `await` pauses. `4` prints. Then `2` runs from the microtask queue.

---

**Q9: setTimeout with nested Promise**

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

Sync: `A`, `E`. Microtask: `D`. Macrotask: `B`, then its nested microtask: `C`.

---

**Q10: async function vs Promise.then ordering**

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

Sync: `C`, `A` (foo starts synchronously), `E`. Then microtasks in order: `B` (from await), `D` (from .then).

---

**Q11: Complex combined scenario**

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

Sync: `1`, `3` (foo starts), `6`. Microtasks: `4` (from await), `5` (from .then). Macrotask: `2` (from setTimeout).

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
