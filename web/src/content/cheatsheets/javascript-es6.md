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
