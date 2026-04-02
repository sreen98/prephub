# Comparison Tables — Interview Quick-Reference Guide

A quick-reference guide organized as comparison tables covering the "X vs Y" questions interviewers love. Each section includes a brief intro, a detailed comparison table, and a practical "when to use which" summary.

---

## Table of Contents

1. [JavaScript Comparisons](#1-javascript-comparisons)
   - 1.1 [var vs let vs const](#11-var-vs-let-vs-const)
   - 1.2 [== vs ===](#12--vs-)
   - 1.3 [null vs undefined](#13-null-vs-undefined)
   - 1.4 [map vs forEach](#14-map-vs-foreach)
   - 1.5 [Promise.all vs allSettled vs race vs any](#15-promiseall-vs-allsettled-vs-race-vs-any)
   - 1.6 [for...in vs for...of](#16-forin-vs-forof)
   - 1.7 [Arrow Functions vs Regular Functions](#17-arrow-functions-vs-regular-functions)
   - 1.8 [call vs apply vs bind](#18-call-vs-apply-vs-bind)
2. [React Comparisons](#2-react-comparisons)
   - 2.1 [Class vs Function Components](#21-class-vs-function-components)
   - 2.2 [useState vs useReducer](#22-usestate-vs-usereducer)
   - 2.3 [useMemo vs useCallback](#23-usememo-vs-usecallback)
   - 2.4 [useEffect vs useLayoutEffect](#24-useeffect-vs-uselayouteffect)
   - 2.5 [Controlled vs Uncontrolled Components](#25-controlled-vs-uncontrolled-components)
   - 2.6 [Context API vs Redux vs Zustand](#26-context-api-vs-redux-vs-zustand)
   - 2.7 [Server Components vs Client Components](#27-server-components-vs-client-components)
3. [Backend Comparisons](#3-backend-comparisons)
   - 3.1 [SQL vs NoSQL](#31-sql-vs-nosql)
   - 3.2 [REST vs GraphQL](#32-rest-vs-graphql)
   - 3.3 [Cookie vs Session vs JWT](#33-cookie-vs-session-vs-jwt)
   - 3.4 [Monolith vs Microservices](#34-monolith-vs-microservices)
   - 3.5 [Express vs Fastify vs Koa](#35-express-vs-fastify-vs-koa)
4. [Networking & Web](#4-networking--web)
   - 4.1 [HTTP vs HTTPS](#41-http-vs-https)
   - 4.2 [TCP vs UDP](#42-tcp-vs-udp)
   - 4.3 [WebSocket vs HTTP Polling vs SSE](#43-websocket-vs-http-polling-vs-sse)
   - 4.4 [localStorage vs sessionStorage vs cookies](#44-localstorage-vs-sessionstorage-vs-cookies)
5. [AWS Comparisons](#5-aws-comparisons)
   - 5.1 [EC2 vs Lambda vs ECS](#51-ec2-vs-lambda-vs-ecs)
   - 5.2 [S3 vs EBS vs EFS](#52-s3-vs-ebs-vs-efs)
   - 5.3 [ALB vs NLB](#53-alb-vs-nlb)
   - 5.4 [SQS vs SNS vs EventBridge](#54-sqs-vs-sns-vs-eventbridge)
   - 5.5 [IAM Role vs IAM User vs IAM Group](#55-iam-role-vs-iam-user-vs-iam-group)
6. [System Design Comparisons](#6-system-design-comparisons)
   - 6.1 [Vertical vs Horizontal Scaling](#61-vertical-vs-horizontal-scaling)
   - 6.2 [SQL vs NoSQL (System Design Depth)](#62-sql-vs-nosql-system-design-depth)
   - 6.3 [Cache-Aside vs Write-Through vs Write-Behind](#63-cache-aside-vs-write-through-vs-write-behind)
   - 6.4 [Strong vs Eventual Consistency](#64-strong-vs-eventual-consistency)
7. [References](#references)

---

## 1. JavaScript Comparisons

### 1.1 var vs let vs const

Understanding variable declaration is foundational. Interviewers test this to gauge your knowledge of scoping, hoisting, and modern JavaScript best practices.

| Feature | `var` | `let` | `const` |
|---|---|---|---|
| **Scope** | Function-scoped | Block-scoped | Block-scoped |
| **Hoisting** | Hoisted and initialized to `undefined` | Hoisted but **not** initialized (TDZ) | Hoisted but **not** initialized (TDZ) |
| **Re-declaration** | Allowed in the same scope | Not allowed in the same scope | Not allowed in the same scope |
| **Re-assignment** | Allowed | Allowed | **Not allowed** |
| **Temporal Dead Zone** | No | Yes | Yes |
| **Global object property** | Yes (`window.x` when declared globally) | No | No |
| **Use in loops** | Shares binding across iterations | Creates a fresh binding per iteration | Creates a fresh binding per iteration |
| **Introduced in** | ES1 (original) | ES6 (2015) | ES6 (2015) |

**When to use which:** Default to `const` for everything; switch to `let` only when you need to re-assign. Avoid `var` entirely in modern code — it exists only for legacy compatibility.

---

### 1.2 == vs ===

This is one of the most common interview questions. It tests whether you understand JavaScript's type coercion rules and can predict surprising behaviors.

| Feature | `==` (Loose Equality) | `===` (Strict Equality) |
|---|---|---|
| **Type coercion** | Performs type coercion before comparing | No type coercion — types must match |
| **`null == undefined`** | `true` | `false` |
| **`0 == ""`** | `true` (both coerce to `0`) | `false` |
| **`0 == false`** | `true` | `false` |
| **`"" == false`** | `true` | `false` |
| **`NaN == NaN`** | `false` | `false` |
| **Algorithm** | Abstract Equality Comparison (complex, ~12 steps) | Strict Equality Comparison (simple, 3 steps) |
| **Performance** | Slightly slower due to coercion | Slightly faster |
| **Predictability** | Low — surprising edge cases | High — no surprises |

**When to use which:** Always use `===` and `!==`. The only legitimate use of `==` is checking `value == null` to catch both `null` and `undefined` in a single check — and even that is a style preference.

---

### 1.3 null vs undefined

Interviewers test this to see if you understand JavaScript's two distinct "absence of value" types and the subtle difference in intent.

| Feature | `null` | `undefined` |
|---|---|---|
| **Meaning** | Intentional absence of value | Variable declared but not assigned |
| **Type** | `typeof null === "object"` (historical bug) | `typeof undefined === "undefined"` |
| **Default function params** | Does **not** trigger defaults | Triggers default parameter values |
| **JSON serialization** | Included in JSON (`"key": null`) | **Omitted** from JSON output |
| **Arithmetic coercion** | Converts to `0` (`null + 5 === 5`) | Converts to `NaN` (`undefined + 5 === NaN`) |
| **Equality** | `null == undefined` is `true` | `null === undefined` is `false` |
| **Who sets it** | Developer explicitly | JavaScript engine (uninitialized vars, missing args, missing properties) |
| **In optional chaining** | `obj?.prop` returns `undefined` for both null and undefined `obj` | Same behavior |

**When to use which:** Use `null` when you want to explicitly indicate "no value." Leave `undefined` to the engine for uninitialized state. Avoid explicitly assigning `undefined` to variables.

---

### 1.4 map vs forEach

A classic question that reveals whether you understand functional programming principles and when to produce a new array vs. perform side effects.

| Feature | `map()` | `forEach()` |
|---|---|---|
| **Return value** | New array of transformed elements | `undefined` |
| **Chainable** | Yes (`arr.map(...).filter(...)`) | No (returns `undefined`) |
| **Mutates original** | No (unless you mutate inside callback) | No (unless you mutate inside callback) |
| **Purpose** | Transform each element, produce new array | Execute a side effect for each element |
| **Break early** | No (use `for...of` or `some`/`every` instead) | No |
| **Performance** | Allocates a new array | Slightly faster (no allocation) |
| **Async/await** | Returns array of promises (use `Promise.all`) | Does **not** wait for async callbacks |
| **Use case** | Data transformation | Logging, DOM updates, API calls |

**When to use which:** Use `map` when you need a transformed array; use `forEach` when you only need side effects and don't need a return value.

---

### 1.5 Promise.all vs allSettled vs race vs any

Interviewers use this to test your grasp of concurrent async patterns and error-handling strategies.

| Feature | `Promise.all` | `Promise.allSettled` | `Promise.race` | `Promise.any` |
|---|---|---|---|---|
| **Resolves when** | All promises fulfill | All promises settle (fulfill or reject) | First promise settles | First promise **fulfills** |
| **Rejects when** | Any single promise rejects | Never rejects | First promise settles (if it rejects) | All promises reject |
| **Return value** | Array of fulfilled values | Array of `{status, value/reason}` objects | Value/reason of the first settled | Value of the first fulfilled |
| **Error on rejection** | `AggregateError`? No — rejects with first rejection reason | No error — all results captured | Rejects if first to settle rejects | `AggregateError` (when all reject) |
| **Short-circuits** | Yes, on first rejection | No — always waits for all | Yes, on first settlement | Yes, on first fulfillment |
| **Use case** | Parallel independent tasks where all must succeed | Fire-and-forget; need results regardless of failure | Timeout patterns; fastest response | Fastest successful response from redundant sources |
| **Introduced in** | ES2015 | ES2020 | ES2015 | ES2021 |

**When to use which:** Use `Promise.all` when every result is required; `allSettled` when you want all outcomes regardless of failure; `race` for timeout patterns; `any` when you want the first success from multiple sources.

---

### 1.6 for...in vs for...of

This question tests whether you know the difference between iterating over object keys vs. iterable values — a common source of bugs.

| Feature | `for...in` | `for...of` |
|---|---|---|
| **Iterates over** | Enumerable **property keys** (strings) | **Values** of an iterable object |
| **Works on objects** | Yes (primary use case) | No (plain objects are not iterable by default) |
| **Works on arrays** | Yes, but iterates over **index strings** (`"0"`, `"1"`) | Yes, iterates over **values** |
| **Includes prototype properties** | Yes (use `hasOwnProperty` to filter) | No |
| **Order guaranteed** | Mostly (integer keys first, then insertion order) | Yes (follows iterator protocol) |
| **Works with Map/Set** | No (not enumerable properties) | Yes |
| **Works with strings** | Iterates over character indices | Iterates over characters |
| **Break/continue** | Supported | Supported |

**When to use which:** Use `for...of` for arrays, strings, Maps, Sets, and any iterable. Use `for...in` only for enumerating object keys — and prefer `Object.keys()` or `Object.entries()` for clarity.

---

### 1.7 Arrow Functions vs Regular Functions

A deeper question than it appears — it tests your understanding of `this`, the prototype chain, and function capabilities.

| Feature | Arrow Function | Regular Function |
|---|---|---|
| **`this` binding** | Lexical (inherits from enclosing scope) | Dynamic (depends on how it's called) |
| **`arguments` object** | Not available (use rest params `...args`) | Available |
| **`new` keyword** | Cannot be used as constructor | Can be used as constructor |
| **`prototype` property** | Does not have one | Has `prototype` property |
| **`super` keyword** | Lexical (inherited) | Dynamic |
| **`yield` keyword** | Cannot be a generator | Can be a generator function |
| **Implicit return** | Yes, for single expressions `() => expr` | No, must use explicit `return` |
| **Method definition** | Avoid (wrong `this`) | Preferred for object methods |
| **Event handlers** | Avoid if you need `this` to be the element | Works correctly with DOM `this` |
| **Hoisting** | Not hoisted (same as `let`/`const`) | Function declarations are hoisted |

**When to use which:** Use arrow functions for callbacks, short transformations, and anywhere you want lexical `this`. Use regular functions for object methods, constructors, and generator functions.

---

### 1.8 call vs apply vs bind

This tests your understanding of explicit `this` binding, which is essential for understanding JavaScript's execution context.

| Feature | `call` | `apply` | `bind` |
|---|---|---|---|
| **Invokes immediately** | Yes | Yes | **No** — returns a new function |
| **Arguments format** | Comma-separated: `fn.call(ctx, a, b)` | Array (or array-like): `fn.apply(ctx, [a, b])` | Comma-separated (partial application): `fn.bind(ctx, a, b)` |
| **Return value** | Result of the function call | Result of the function call | A new bound function |
| **Partial application** | No | No | Yes — can pre-fill arguments |
| **`this` binding** | Set for that single call | Set for that single call | Permanently bound in returned function |
| **Performance** | Fastest for known arg count | Useful when args are in an array | Slight overhead (creates new function) |
| **Common use case** | Borrowing methods: `Array.prototype.slice.call(args)` | Spreading array as arguments (pre-ES6) | Event handlers, React class methods, partial application |

**When to use which:** Use `call` when you know the arguments upfront; `apply` when arguments are in an array (less common since spread syntax); `bind` when you need a reusable function with a fixed `this` (e.g., event handlers).

---

## 2. React Comparisons

### 2.1 Class vs Function Components

This comparison reveals whether you are up to date with modern React. Function components with Hooks are now the standard.

| Feature | Class Components | Function Components |
|---|---|---|
| **Syntax** | `class Foo extends React.Component` | `function Foo()` or `const Foo = () => {}` |
| **State** | `this.state` + `this.setState()` | `useState` / `useReducer` Hooks |
| **Lifecycle methods** | `componentDidMount`, `componentDidUpdate`, etc. | `useEffect` Hook |
| **`this` keyword** | Required (source of bugs) | Not used |
| **Code verbosity** | More boilerplate | Concise |
| **Performance** | Slightly heavier (class instance overhead) | Slightly lighter |
| **Error boundaries** | Supported (`componentDidCatch`) | Not supported natively (need class or library) |
| **Logic reuse** | HOCs, render props (complex) | Custom Hooks (simple, composable) |
| **Concurrent features** | Limited support | Full support (Suspense, transitions) |
| **React team recommendation** | Legacy — still supported | Recommended for all new code |

**When to use which:** Use function components for all new code. Use class components only when you need error boundaries (or wrap them with `react-error-boundary` library).

---

### 2.2 useState vs useReducer

This tests whether you can choose the right state management primitive based on complexity.

| Feature | `useState` | `useReducer` |
|---|---|---|
| **Best for** | Simple, independent state values | Complex state logic, multiple sub-values |
| **Update mechanism** | Direct value or updater function | Dispatch actions to a reducer function |
| **State shape** | Any single value | Typically an object with multiple fields |
| **Complex transitions** | Awkward — multiple `setState` calls | Clean — single dispatch triggers coordinated update |
| **Debugging** | Harder to trace updates | Easy — log dispatched actions |
| **Testing** | Test the component | Reducer is pure function — test independently |
| **Performance** | Re-renders on every set call | Can batch related state updates naturally |
| **When state depends on previous state** | Updater function: `setCount(c => c + 1)` | Natural: `case 'increment': return { count: state.count + 1 }` |
| **TypeScript experience** | Simpler types | Better type safety for actions and state shape |

**When to use which:** Start with `useState` for simple values (booleans, strings, numbers). Switch to `useReducer` when you have related state variables that update together or complex state transitions.

---

### 2.3 useMemo vs useCallback

Interviewers love this to test your understanding of memoization and React's rendering model.

| Feature | `useMemo` | `useCallback` |
|---|---|---|
| **Returns** | A **memoized value** (any type) | A **memoized function** |
| **Purpose** | Cache expensive computation results | Cache a function reference |
| **Syntax** | `useMemo(() => computeValue(a, b), [a, b])` | `useCallback((x) => doSomething(x, a), [a])` |
| **Equivalent** | — | `useMemo(() => (x) => doSomething(x, a), [a])` |
| **Recomputes when** | Dependencies change | Dependencies change |
| **Primary use case** | Avoid recalculating derived data on every render | Prevent child re-renders due to new function references |
| **Common with** | Expensive filtering, sorting, formatting | `React.memo` wrapped children, effect dependencies |
| **Overuse concern** | Memory overhead for cached values | Memory overhead for cached functions |
| **When NOT to use** | Cheap computations | Functions not passed as props or deps |

**When to use which:** Use `useMemo` to cache expensive derived values. Use `useCallback` to stabilize function references passed to memoized children or used in dependency arrays. Don't memoize everything — profile first.

---

### 2.4 useEffect vs useLayoutEffect

This tests your knowledge of the browser rendering pipeline and when visual correctness requires synchronous DOM reads.

| Feature | `useEffect` | `useLayoutEffect` |
|---|---|---|
| **Timing** | After paint (asynchronous) | After DOM mutation, **before** paint (synchronous) |
| **Blocks rendering** | No | Yes — delays visual update |
| **Performance impact** | Better (non-blocking) | Can cause jank if slow |
| **Use case** | Data fetching, subscriptions, logging, timers | DOM measurements, scroll position, preventing visual flicker |
| **SSR behavior** | Works fine | Warns in SSR (no DOM to measure) |
| **Equivalent class method** | `componentDidMount` + `componentDidUpdate` (roughly) | `componentDidMount` + `componentDidUpdate` (more accurately) |
| **Cleanup timing** | Async, after new render paints | Sync, before new render paints |
| **Frequency of use** | ~95% of the time | ~5% — only for DOM measurement/mutation |

**When to use which:** Default to `useEffect` for almost everything. Use `useLayoutEffect` only when you need to read DOM layout and synchronously re-render before the browser paints (e.g., measuring element size, adjusting scroll position, tooltip positioning).

---

### 2.5 Controlled vs Uncontrolled Components

A fundamental React patterns question that reveals your understanding of React's data flow philosophy.

| Feature | Controlled Components | Uncontrolled Components |
|---|---|---|
| **State owner** | React component (via `useState`) | DOM itself |
| **Value access** | `value` prop + `onChange` handler | `ref` to read DOM value |
| **Source of truth** | React state | DOM |
| **Validation** | On every keystroke (instant feedback) | On submit (delayed feedback) |
| **Dynamic behavior** | Easy (conditionally disable submit, format input) | Hard |
| **Code amount** | More (handler for every input) | Less (just refs) |
| **Default values** | `value={state}` | `defaultValue="initial"` |
| **Form libraries** | React Hook Form (can do both), Formik (controlled) | React Hook Form (uncontrolled by default) |
| **Performance** | Re-renders on every keystroke | No re-renders on input |
| **File inputs** | Cannot be controlled (always uncontrolled) | Only option for `<input type="file">` |

**When to use which:** Use controlled components when you need real-time validation, conditional rendering based on input, or formatted inputs. Use uncontrolled components for simple forms or when performance is critical (many fields).

---

### 2.6 Context API vs Redux vs Zustand

This tests whether you can choose the right state management tool based on scale, complexity, and team needs.

| Feature | Context API | Redux (Toolkit) | Zustand |
|---|---|---|---|
| **Bundle size** | 0 KB (built-in) | ~11 KB (RTK) | ~1 KB |
| **Boilerplate** | Minimal | Moderate (slices, store config) | Minimal |
| **DevTools** | React DevTools only | Redux DevTools (time-travel) | Redux DevTools (via middleware) |
| **Middleware** | None built-in | Thunk, Saga, custom | Built-in middleware support |
| **Performance** | All consumers re-render on any context change | Selectors prevent unnecessary re-renders | Selectors prevent unnecessary re-renders |
| **Learning curve** | Low | Medium-High | Low |
| **Async handling** | Manual (useEffect) | RTK Query, Thunks, Sagas | Simple async functions in store |
| **Best for** | Theme, locale, auth — low-frequency updates | Large apps, complex state, big teams | Small-to-large apps, simplicity preference |
| **Server state** | Not designed for it | RTK Query | Pair with TanStack Query |
| **Scalability** | Poor for frequent updates | Excellent | Excellent |

**When to use which:** Use Context for low-frequency global data (theme, auth). Use Redux Toolkit for large teams needing strict patterns and powerful DevTools. Use Zustand for a lightweight, flexible store without boilerplate.

---

### 2.7 Server Components vs Client Components

A modern React question (Next.js App Router / React 19+) that tests your understanding of the server-client boundary.

| Feature | Server Components | Client Components |
|---|---|---|
| **Directive** | Default (no directive needed) | `"use client"` at top of file |
| **Runs on** | Server only | Server (SSR) + Client (hydration + interactivity) |
| **Bundle size impact** | Zero — not included in JS bundle | Included in JS bundle |
| **Access to** | Database, file system, env secrets | Browser APIs, DOM, events |
| **State & effects** | Cannot use `useState`, `useEffect`, etc. | Full Hook support |
| **Event handlers** | Cannot have `onClick`, etc. | Full interactivity |
| **Data fetching** | Direct `async/await` in component | `useEffect`, TanStack Query, SWR |
| **Can import** | Server Components + Client Components | Client Components only (not Server Components) |
| **Rendering** | Streamed as RSC payload (non-interactive HTML) | Hydrated into interactive UI |
| **Serialization** | Props must be serializable (no functions) | No restriction |
| **Use case** | Static content, data display, layouts | Forms, interactive widgets, animations |

**When to use which:** Default to Server Components for data fetching and static content to minimize bundle size. Add `"use client"` only when you need interactivity (state, effects, event handlers, browser APIs).

---

## 3. Backend Comparisons

### 3.1 SQL vs NoSQL

One of the most frequently asked backend interview questions. Your answer should demonstrate you understand the trade-offs rather than dogmatically favoring one.

| Feature | SQL (Relational) | NoSQL (Non-Relational) |
|---|---|---|
| **Data model** | Tables with rows and columns | Documents, key-value, graph, wide-column |
| **Schema** | Strict, predefined schema | Flexible / schema-less |
| **Query language** | SQL (standardized) | Database-specific (MongoDB Query, CQL, etc.) |
| **Joins** | Native, powerful | Limited or none — denormalization preferred |
| **ACID compliance** | Full ACID transactions | Varies — some support ACID (MongoDB 4.0+), many favor BASE |
| **Scalability** | Vertical (horizontal with sharding is complex) | Horizontal by design |
| **Consistency** | Strong consistency by default | Eventual consistency by default (tunable) |
| **Examples** | PostgreSQL, MySQL, SQL Server, Oracle | MongoDB, DynamoDB, Cassandra, Redis |
| **Best for** | Complex queries, relationships, transactions | High throughput, flexible schemas, rapid iteration |
| **Normalization** | Normalized (reduce duplication) | Denormalized (optimize for read patterns) |

**When to use which:** Use SQL for transactional systems, complex relationships, and when data integrity is critical (e.g., banking, e-commerce orders). Use NoSQL for high-scale read/write workloads, flexible schemas, and when your access patterns are well-defined.

---

### 3.2 REST vs GraphQL

This tests your understanding of API design trade-offs and when each paradigm shines.

| Feature | REST | GraphQL |
|---|---|---|
| **Architecture** | Resource-based (nouns as endpoints) | Schema-based (single endpoint, typed queries) |
| **Endpoints** | Multiple (`/users`, `/users/1/posts`) | Single (`/graphql`) |
| **Data fetching** | Fixed response shape — over/under-fetching common | Client specifies exact fields — no over-fetching |
| **Versioning** | URL versioning (`/v2/users`) or headers | Schema evolution (deprecate fields) — no versioning needed |
| **Caching** | HTTP caching built-in (ETags, Cache-Control) | Complex — needs persisted queries or CDN-level solutions |
| **Error handling** | HTTP status codes (404, 500, etc.) | Always 200 — errors in response body |
| **File uploads** | Native (multipart/form-data) | Requires special handling (multipart spec or presigned URLs) |
| **Real-time** | Polling or SSE | Subscriptions (WebSocket-based) |
| **Learning curve** | Low | Medium (schema, resolvers, types) |
| **Tooling** | Postman, curl, OpenAPI/Swagger | GraphiQL, Apollo DevTools, codegen |
| **N+1 problem** | Managed at DB/ORM layer | Must use DataLoader pattern |

**When to use which:** Use REST for simple CRUD APIs, public APIs, and when HTTP caching is essential. Use GraphQL when clients have diverse data needs (mobile vs. desktop), when you want to reduce round trips, or when you need a strongly-typed API contract.

---

### 3.3 Cookie vs Session vs JWT

This tests your understanding of authentication and session management — critical for any web application.

| Feature | Cookie-Based Auth | Server Sessions | JWT (JSON Web Token) |
|---|---|---|---|
| **Storage** | Browser cookie | Server memory / DB / Redis | Client (cookie or localStorage) |
| **Stateful/Stateless** | Depends on content | Stateful (server stores session data) | Stateless (self-contained token) |
| **Scalability** | Depends | Requires sticky sessions or shared store | Horizontally scalable (no shared state) |
| **Security** | `HttpOnly`, `Secure`, `SameSite` flags | Server-side — harder to tamper | Signed (integrity) — optionally encrypted |
| **Revocation** | Delete cookie | Delete session from store (instant) | Hard — must maintain a blocklist or wait for expiry |
| **Size** | 4 KB limit | No limit (server-side) | Can grow large (payload + signature) |
| **CSRF vulnerability** | Yes (unless SameSite or CSRF tokens) | Yes (session ID in cookie) | No (if stored in memory/header, not cookie) |
| **XSS vulnerability** | Mitigated with HttpOnly | Mitigated with HttpOnly cookie for session ID | Vulnerable if stored in localStorage |
| **Cross-domain** | Limited (SameSite, domain restrictions) | Same as cookie (session ID is in cookie) | Easy (Authorization header) |
| **Use case** | Traditional web apps | Server-rendered apps with session store | SPAs, microservices, mobile APIs |

**When to use which:** Use server sessions for traditional web apps where you need instant revocation. Use JWTs for stateless APIs serving SPAs and mobile apps. In practice, many systems combine both: a short-lived JWT for API auth plus a refresh token stored in an HttpOnly cookie.

---

### 3.4 Monolith vs Microservices

A system design favorite. Interviewers want to know you understand operational complexity, not just theoretical benefits.

| Feature | Monolith | Microservices |
|---|---|---|
| **Deployment** | Single unit — deploy everything | Independent — deploy each service separately |
| **Codebase** | Single repository (usually) | Multiple repositories or monorepo |
| **Scaling** | Scale the whole application | Scale individual services independently |
| **Technology** | Single tech stack | Polyglot (different languages/frameworks per service) |
| **Data** | Single shared database | Database-per-service pattern |
| **Communication** | In-process function calls | Network calls (HTTP, gRPC, message queues) |
| **Complexity** | Simple to develop, test, deploy initially | Distributed systems complexity (networking, observability) |
| **Latency** | Lower (in-process) | Higher (network hops, serialization) |
| **Team structure** | Single team or overlapping teams | Small autonomous teams per service |
| **Failure isolation** | One bug can crash everything | Failures are isolated to individual services |
| **Testing** | Simple end-to-end testing | Complex integration testing, contract testing |
| **Operational overhead** | Low (one deployment pipeline) | High (container orchestration, service mesh, monitoring) |

**When to use which:** Start with a monolith — it's simpler to build, test, and deploy. Migrate to microservices when you need independent scaling, team autonomy, or your monolith has become too large to iterate on quickly. The "modular monolith" is a strong middle ground.

---

### 3.5 Express vs Fastify vs Koa

This tests your familiarity with the Node.js framework ecosystem and their architectural differences.

| Feature | Express | Fastify | Koa |
|---|---|---|---|
| **Author** | TJ Holowaychuk / community | Matteo Collina, Tomas Della Vedova | TJ Holowaychuk (Express team) |
| **Performance (req/s)** | ~15K (baseline) | ~45K+ (2-3x Express) | ~20K |
| **Architecture** | Middleware chain | Plugin-based with encapsulation | Middleware chain (async/await) |
| **Async support** | Callbacks + manual promise handling | Native async/await, auto error handling | Native async/await (designed for it) |
| **Schema validation** | External (Joi, Zod, etc.) | Built-in JSON Schema validation (Ajv) | External |
| **Serialization** | `JSON.stringify` | `fast-json-stringify` (2-5x faster) | `JSON.stringify` |
| **TypeScript** | Community types (`@types/express`) | First-class TypeScript support | Community types |
| **Ecosystem** | Largest (thousands of middlewares) | Growing — Express-compatible plugin | Smaller, curated |
| **Logging** | External (Morgan, Winston) | Built-in (Pino — very fast) | External |
| **Learning curve** | Low | Medium | Low-Medium |
| **Production readiness** | Battle-tested (10+ years) | Production-ready, used by major companies | Production-ready |

**When to use which:** Use Express for quick prototypes and when you need maximum ecosystem compatibility. Use Fastify for high-performance APIs and when you want built-in validation and logging. Use Koa for a minimal, modern middleware foundation.

---

## 4. Networking & Web

### 4.1 HTTP vs HTTPS

A baseline networking question. Interviewers want to see you understand TLS, the handshake process, and why HTTPS is non-negotiable.

| Feature | HTTP | HTTPS |
|---|---|---|
| **Port** | 80 | 443 |
| **Encryption** | None — plaintext | TLS/SSL encryption |
| **Certificate** | Not required | Requires SSL/TLS certificate |
| **Data integrity** | No protection against tampering | Tamper-proof (message authentication) |
| **Authentication** | No server identity verification | Server identity verified via certificate |
| **Performance** | Slightly faster (no handshake) | TLS handshake adds ~1 RTT (TLS 1.3) or ~2 RTT (TLS 1.2) |
| **HTTP/2 support** | Browsers require HTTPS for HTTP/2 | Full HTTP/2 and HTTP/3 support |
| **SEO** | Penalized by search engines | Ranking boost from Google |
| **Mixed content** | N/A | Browsers block HTTP resources on HTTPS pages |
| **Cost** | Free | Free (Let's Encrypt) to paid (extended validation) |
| **Required for** | Nothing modern | PWAs, Service Workers, Geolocation API, WebRTC |

**When to use which:** Always use HTTPS. There is no legitimate reason to use plain HTTP in production. Even local development benefits from HTTPS for testing Service Workers and secure cookies.

---

### 4.2 TCP vs UDP

A core networking question. Understanding this distinction is essential for system design interviews involving real-time systems.

| Feature | TCP | UDP |
|---|---|---|
| **Connection** | Connection-oriented (3-way handshake) | Connectionless |
| **Reliability** | Guaranteed delivery with ACKs and retransmission | Best-effort — no guarantees |
| **Ordering** | Messages arrive in order | No ordering guarantee |
| **Flow control** | Yes (sliding window) | No |
| **Congestion control** | Yes (slow start, congestion avoidance) | No |
| **Speed** | Slower due to overhead | Faster (no handshake, no ACKs) |
| **Header size** | 20-60 bytes | 8 bytes |
| **Error checking** | Checksum + retransmission | Checksum only (no retransmission) |
| **Use cases** | HTTP, email (SMTP), file transfer (FTP), SSH | DNS, video streaming, gaming, VoIP, IoT |
| **Protocols built on it** | HTTP/1.1, HTTP/2, WebSocket | DNS, QUIC (HTTP/3), DTLS |

**When to use which:** Use TCP when data integrity and ordering matter (web, file transfer, APIs). Use UDP when low latency is more important than reliability (gaming, live video, DNS queries).

---

### 4.3 WebSocket vs HTTP Polling vs SSE

This tests your understanding of real-time communication patterns — essential for system design questions involving chat, notifications, or live data.

| Feature | WebSocket | HTTP Long Polling | Server-Sent Events (SSE) |
|---|---|---|---|
| **Direction** | Full-duplex (bidirectional) | Client-initiated (simulated real-time) | Server-to-client (unidirectional) |
| **Connection** | Persistent, upgraded from HTTP | New HTTP request per poll (or held open) | Persistent HTTP connection |
| **Protocol** | `ws://` or `wss://` | Standard HTTP | Standard HTTP (`text/event-stream`) |
| **Latency** | Very low (persistent connection) | High (polling interval) or medium (long poll) | Low (server pushes immediately) |
| **Browser support** | All modern browsers | Universal | All modern browsers (polyfill for old IE) |
| **Scalability** | Each connection uses a socket | High server load from frequent requests | Moderate — limited to ~6 connections per domain (HTTP/1.1) |
| **Reconnection** | Manual implementation | Built-in (new request) | Built-in (`EventSource` auto-reconnects) |
| **Binary data** | Supported | Yes (standard HTTP) | No (text only, typically JSON) |
| **Firewall/proxy friendly** | Can be blocked (non-HTTP after upgrade) | Fully compatible | Fully compatible (standard HTTP) |
| **Use case** | Chat, gaming, collaborative editing | Legacy compatibility, simple updates | Notifications, live feeds, dashboards |

**When to use which:** Use WebSocket for bidirectional real-time communication (chat, multiplayer). Use SSE for server-to-client push (notifications, live scores) — it's simpler and reconnects automatically. Use long polling only as a fallback when neither is available.

---

### 4.4 localStorage vs sessionStorage vs cookies

A web fundamentals question that reveals your understanding of client-side storage trade-offs and security implications.

| Feature | `localStorage` | `sessionStorage` | Cookies |
|---|---|---|---|
| **Capacity** | ~5-10 MB | ~5-10 MB | ~4 KB per cookie |
| **Lifetime** | Persistent (until manually cleared) | Tab/window session only | Configurable (`Expires` / `Max-Age`) |
| **Sent to server** | No | No | Yes — sent with every HTTP request |
| **Accessible from** | Same origin (JS only) | Same origin, same tab (JS only) | Same origin (JS unless `HttpOnly`) |
| **API** | `getItem`, `setItem`, `removeItem` | Same as localStorage | `document.cookie` (clunky) or Cookie API |
| **Security** | Vulnerable to XSS | Vulnerable to XSS | `HttpOnly` prevents XSS; `Secure` enforces HTTPS; `SameSite` prevents CSRF |
| **Cross-tab** | Shared across tabs (same origin) | Isolated per tab | Shared across tabs |
| **Data type** | Strings only | Strings only | Strings only |
| **Use case** | User preferences, cached data | Single-session wizard/form state | Auth tokens, tracking, server-needed data |
| **SSR access** | Not available on server | Not available on server | Available on server (in request headers) |

**When to use which:** Use cookies for authentication tokens and data the server needs on every request (with `HttpOnly` + `Secure` + `SameSite`). Use `localStorage` for persistent client-side data (theme preference, cached UI state). Use `sessionStorage` for temporary data scoped to a single tab (multi-step forms).

---

## 5. AWS Comparisons

### 5.1 EC2 vs Lambda vs ECS

This tests your understanding of compute options and operational responsibility levels — a must-know for cloud architecture interviews.

| Feature | EC2 | Lambda | ECS (Fargate) |
|---|---|---|---|
| **Model** | IaaS — virtual machines | FaaS — event-driven functions | CaaS — managed containers |
| **Management** | You manage OS, runtime, patching | Fully managed — no server management | You manage containers; AWS manages infra |
| **Scaling** | Manual or Auto Scaling Groups | Automatic (0 to thousands instantly) | Auto Scaling based on tasks/metrics |
| **Pricing** | Per hour/second (always running) | Per request + duration (pay only when executing) | Per vCPU + memory per second |
| **Cold start** | None (always running) | Yes (~100ms to seconds depending on runtime) | Task startup: ~30-60 seconds |
| **Max execution time** | Unlimited | 15 minutes | Unlimited |
| **Memory** | Up to 24 TB | 128 MB - 10 GB | Up to 120 GB per task |
| **State** | Stateful (local disk, in-memory) | Stateless (use external storage) | Stateful within task lifecycle |
| **Use case** | Legacy apps, GPU workloads, long-running processes | Event processing, APIs, cron jobs, glue code | Microservices, batch processing, web apps |
| **Networking** | Full VPC control, Elastic IPs | VPC optional, no fixed IP | Full VPC control |
| **Deployment** | AMIs, user data scripts | ZIP upload or container image | Docker images (ECR) |

**When to use which:** Use Lambda for event-driven, short-lived workloads to minimize operational overhead. Use ECS/Fargate for containerized microservices that need more control or longer runtimes. Use EC2 for full OS control, GPU workloads, or legacy applications that can't be containerized.

---

### 5.2 S3 vs EBS vs EFS

This tests your understanding of AWS storage options and when to use object storage vs. block storage vs. file storage.

| Feature | S3 | EBS | EFS |
|---|---|---|---|
| **Type** | Object storage | Block storage | File storage (NFS) |
| **Access pattern** | HTTP API (any service, any region) | Attached to a single EC2 instance | Mounted by multiple EC2 instances / Lambda |
| **Durability** | 99.999999999% (11 9's) | 99.999% (5 9's) | 99.999999999% (11 9's) |
| **Scalability** | Unlimited objects, unlimited total size | Up to 64 TB per volume | Petabyte scale, auto-scaling |
| **Performance** | High throughput; latency ~50-100ms | Very low latency (~1ms), high IOPS | Low latency; throughput scales with size |
| **Concurrent access** | Unlimited concurrent reads | Single EC2 (multi-attach for io1/io2 only) | Thousands of concurrent connections |
| **Pricing** | ~$0.023/GB/month (Standard) | ~$0.08-0.125/GB/month | ~$0.30/GB/month (Standard) |
| **Use case** | Static assets, backups, data lakes, website hosting | Boot volumes, databases, high-IOPS apps | Shared file systems, CMS, ML training data |
| **Lifecycle management** | Glacier transitions, expiration rules | Snapshots to S3 | Infrequent Access storage class |
| **Encryption** | SSE-S3, SSE-KMS, SSE-C | AES-256 (at rest), KMS | AES-256 (at rest), in-transit |

**When to use which:** Use S3 for static files, backups, and data lakes (cheapest, most durable). Use EBS for databases and applications that need low-latency block storage on a single instance. Use EFS when multiple instances or Lambda functions need shared file access.

---

### 5.3 ALB vs NLB

This tests your understanding of load balancing at different OSI layers and when each is appropriate.

| Feature | ALB (Application Load Balancer) | NLB (Network Load Balancer) |
|---|---|---|
| **OSI layer** | Layer 7 (HTTP/HTTPS) | Layer 4 (TCP/UDP/TLS) |
| **Protocol support** | HTTP, HTTPS, gRPC, WebSocket | TCP, UDP, TLS |
| **Routing** | Path-based, host-based, header-based, query string | Port-based only |
| **Performance** | Moderate latency (~ms added) | Ultra-low latency (~100 microseconds added) |
| **Throughput** | Millions of requests/sec | Millions of packets/sec; handles volatile traffic spikes |
| **Static IP** | No (use Global Accelerator for fixed IPs) | Yes — Elastic IP per AZ |
| **SSL termination** | Yes | Yes (TLS listener) or passthrough |
| **Health checks** | HTTP/HTTPS (path, status code) | TCP, HTTP, HTTPS |
| **Sticky sessions** | Yes (cookie-based) | Yes (source IP-based) |
| **Targets** | Instances, IPs, Lambda functions | Instances, IPs, ALBs |
| **WebSocket** | Native support | Supported (TCP) |
| **Pricing** | Based on LCU (new connections, active connections, bandwidth) | Based on NLCU (similar metrics, lower per-unit cost) |
| **Use case** | Web apps, REST APIs, microservices routing | Gaming, IoT, real-time bidding, TCP/UDP services, extreme performance |

**When to use which:** Use ALB for HTTP-based applications where you need path/host-based routing, authentication integration, or Lambda targets. Use NLB when you need extreme performance, static IPs, TCP/UDP support, or end-to-end TLS passthrough.

---

### 5.4 SQS vs SNS vs EventBridge

This tests your understanding of messaging and event-driven architecture patterns on AWS.

| Feature | SQS | SNS | EventBridge |
|---|---|---|---|
| **Pattern** | Point-to-point (queue) | Publish-subscribe (fan-out) | Event bus (routing + filtering) |
| **Delivery** | Pull-based (consumers poll) | Push-based (to subscribers) | Push-based (to targets) |
| **Ordering** | FIFO queues: guaranteed; Standard: best-effort | FIFO topics: guaranteed; Standard: best-effort | Best-effort (no strict ordering) |
| **Duplicates** | FIFO: exactly-once; Standard: at-least-once | At-least-once | At-least-once |
| **Retention** | 1 min to 14 days (default 4 days) | No retention — immediate delivery or fail | Retry policy + DLQ (24h replay via archive) |
| **Message size** | 256 KB (up to 2 GB with S3 pointer) | 256 KB | 256 KB |
| **Subscribers/Targets** | 1 consumer group per queue | Up to 12.5M subscriptions per topic | Over 20 target types (Lambda, SQS, Step Functions, API Gateway, etc.) |
| **Filtering** | No built-in (filter in consumer code) | Message attribute filtering | Content-based rules (JSON pattern matching) |
| **Dead letter queue** | Built-in DLQ support | DLQ on subscription (SQS) | DLQ support |
| **Cross-account** | Yes | Yes | Yes (including cross-region) |
| **Use case** | Work queues, decoupling, rate buffering | Fan-out notifications, alerts, multi-subscriber broadcast | Event-driven architectures, SaaS integrations, complex routing |

**When to use which:** Use SQS for decoupling producers and consumers with reliable, buffered delivery. Use SNS for fan-out to multiple subscribers. Use EventBridge for complex event routing with content-based filtering and integration with SaaS/AWS service events.

---

### 5.5 IAM Role vs IAM User vs IAM Group

This tests your understanding of AWS identity management and the principle of least privilege.

| Feature | IAM User | IAM Group | IAM Role |
|---|---|---|---|
| **What it represents** | A specific person or service | A collection of IAM users | A set of permissions assumed temporarily |
| **Has credentials** | Yes (password, access keys) | No (groups don't authenticate) | No permanent credentials — temporary via STS |
| **Long-term credentials** | Yes (access keys persist until rotated) | N/A | No — credentials rotate automatically |
| **Policies** | Attached directly or via group | Policies attached to group apply to all members | Policies attached to role |
| **Assumable by** | N/A (is an identity) | N/A (is a container) | EC2, Lambda, users, cross-account, federated users |
| **Cross-account access** | Requires access keys in other account | N/A | Trust policy allows cross-account assume |
| **AWS service integration** | Not recommended for services | N/A | Best practice for EC2, Lambda, ECS |
| **Maximum count** | 5,000 per account | 300 per account | 1,000 per account (can increase) |
| **Best practice** | Only for human users with MFA | Organize users by job function | Use for everything: services, cross-account, temporary access |
| **Security risk** | Key leakage, long-lived credentials | Overly broad permissions if not managed | Low — short-lived, auto-rotated credentials |

**When to use which:** Use IAM Users only for human access (with MFA enforced). Use IAM Groups to organize users by role/team and attach policies at the group level. Use IAM Roles for everything else: EC2 instances, Lambda functions, cross-account access, and federated identity.

---

## 6. System Design Comparisons

### 6.1 Vertical vs Horizontal Scaling

The most fundamental scaling question in system design. Your answer should include when each approach hits its limits.

| Feature | Vertical Scaling (Scale Up) | Horizontal Scaling (Scale Out) |
|---|---|---|
| **Approach** | Add more power to existing machine (CPU, RAM, disk) | Add more machines to the pool |
| **Complexity** | Simple — no code changes needed | Complex — need load balancing, data partitioning |
| **Cost curve** | Exponential (high-end hardware is disproportionately expensive) | Linear (commodity hardware) |
| **Downtime** | Usually requires restart | Zero downtime (add/remove instances) |
| **Upper limit** | Hardware ceiling (largest available instance) | Theoretically unlimited |
| **Single point of failure** | Yes — one machine | No (with proper redundancy) |
| **State management** | Simple (all state on one machine) | Complex (distributed state, sessions, caching) |
| **Data consistency** | Easy (single database) | Hard (distributed transactions, CAP theorem) |
| **Examples** | Upgrading from `db.r5.large` to `db.r5.8xlarge` | Adding more web servers behind a load balancer |
| **Best for** | Databases (often easier to scale up), early-stage apps | Stateless services, web/app tier, read replicas |

**When to use which:** Start with vertical scaling for simplicity (especially databases). Move to horizontal scaling when you approach hardware limits, need high availability, or your workload is stateless and parallelizable.

---

### 6.2 SQL vs NoSQL (System Design Depth)

In a system design context, the database choice has architectural implications beyond the basic comparison. This deeper look focuses on CAP theorem trade-offs and access pattern design.

| Feature | SQL (e.g., PostgreSQL, MySQL) | NoSQL — Document (e.g., MongoDB, DynamoDB) | NoSQL — Wide-Column (e.g., Cassandra, ScyllaDB) |
|---|---|---|---|
| **CAP focus** | CP (Consistency + Partition tolerance) | CP or AP (configurable) | AP (Availability + Partition tolerance) |
| **Sharding** | Complex (application-level or Citus/Vitess) | Built-in (hash/range partitioning) | Built-in (consistent hashing, partition keys) |
| **Read replicas** | Supported (async or sync replication) | Supported | Every node can serve reads and writes |
| **Write throughput** | Single primary bottleneck | High (with sharding) | Very high (distributed writes, no single primary) |
| **Query flexibility** | Ad-hoc queries on any column | Index required for non-primary-key queries | Queries must follow partition key design |
| **Schema migration** | ALTER TABLE (can lock, can be complex) | Schema-less (migration at app level) | ALTER TABLE (online, no downtime) |
| **Multi-region** | Complex (cross-region replication lag) | Global Tables (DynamoDB), Atlas Global Clusters | Built for multi-DC (Cassandra is masterless) |
| **Transactions** | Full multi-row, multi-table ACID | Single-document ACID; multi-doc with limitations | Lightweight transactions (LWT) — limited |
| **Access pattern requirement** | Design schema first, queries are flexible | Design for primary access patterns; secondary indexes | **Must** design table around query patterns |
| **Typical scale ceiling** | Millions of rows/sec with tuning + sharding | Billions of rows, millions of requests/sec | Billions of rows, millions of writes/sec |
| **System design use case** | User profiles, orders, inventory, financial systems | Product catalogs, user feeds, session stores | Time-series data, messaging, activity logs |

**When to use which:** In system design, choose SQL when you need complex queries and strong consistency (e.g., payment systems). Choose a document store when you need flexible schemas and your access patterns are document-centric (e.g., user profiles). Choose a wide-column store when you need extreme write throughput and geo-distribution (e.g., messaging, IoT telemetry).

---

### 6.3 Cache-Aside vs Write-Through vs Write-Behind

Caching strategy questions appear in every system design interview. Knowing these patterns shows you understand the consistency/performance trade-off spectrum.

| Feature | Cache-Aside (Lazy Loading) | Write-Through | Write-Behind (Write-Back) |
|---|---|---|---|
| **Read path** | Check cache -> miss -> read DB -> populate cache | Check cache -> always hit (data written to cache first) | Check cache -> always hit |
| **Write path** | Write DB -> invalidate/delete cache entry | Write cache + DB **synchronously** | Write cache -> **async** write to DB |
| **Consistency** | Eventually consistent (stale reads possible) | Strong (cache always current) | Eventually consistent (cache ahead of DB) |
| **Write latency** | Normal (only DB write) | Higher (two synchronous writes) | Lower (only cache write; DB is async) |
| **Read latency (cache miss)** | Higher on first read (DB + cache write) | Low (data always in cache) | Low (data always in cache) |
| **Cache utilization** | Only requested data is cached | All written data is cached (may cache unused data) | All written data is cached |
| **Data loss risk** | None (DB is source of truth) | None (DB write is synchronous) | **Yes** — if cache fails before async DB write |
| **Complexity** | Simple | Moderate | High (async write queue, failure handling) |
| **Cache invalidation** | Application manages TTL or explicit invalidation | Not needed (always current) | Not needed (always current) |
| **Best for** | Read-heavy workloads with tolerance for staleness | Read-heavy with strict consistency needs | Write-heavy workloads where some data loss is acceptable |

**When to use which:** Use cache-aside for most read-heavy applications — it's the simplest and most common. Use write-through when consistency between cache and database is critical. Use write-behind for write-heavy workloads where you can tolerate potential data loss for better write performance.

---

### 6.4 Strong vs Eventual Consistency

This is a CAP theorem question at heart. Interviewers want to see that you can reason about consistency trade-offs in distributed systems.

| Feature | Strong Consistency | Eventual Consistency |
|---|---|---|
| **Definition** | Every read returns the most recent write | Reads may return stale data, but will converge over time |
| **Latency** | Higher (must coordinate across replicas) | Lower (can read from nearest replica) |
| **Availability** | Lower (must wait for quorum/leader) | Higher (any replica can serve reads) |
| **Throughput** | Lower (coordination overhead) | Higher (no synchronization needed) |
| **CAP theorem** | Sacrifices Availability (CP system) | Sacrifices Consistency (AP system) |
| **Implementation** | Synchronous replication, 2PC, Raft/Paxos consensus | Async replication, CRDTs, vector clocks, last-write-wins |
| **Conflict resolution** | Prevented (only one writer succeeds) | Required (merge strategies, application-level resolution) |
| **Cost** | More expensive (cross-AZ/region coordination) | Cheaper (local reads, async replication) |
| **Examples** | PostgreSQL (single primary), DynamoDB (consistent read), Zookeeper | DynamoDB (default), Cassandra, DNS, S3 |
| **Use case** | Banking, inventory, booking systems, leader election | Social media feeds, analytics, caching, shopping carts |
| **Consistency window** | 0 (immediate) | Milliseconds to seconds (tunable) |

**When to use which:** Use strong consistency when correctness is non-negotiable (financial transactions, inventory counts, booking systems — where double-selling is unacceptable). Use eventual consistency when availability and latency matter more than immediate accuracy (social feeds, analytics dashboards, recommendation engines).

---

## References

- [MDN Web Docs — JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)
- [React Documentation — Hooks API Reference](https://react.dev/reference/react)
- [Node.js Frameworks Benchmark](https://github.com/nicholasgasior/gofr-benchmark)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Documentation — Service Comparisons](https://docs.aws.amazon.com/)
- [Martin Kleppmann — Designing Data-Intensive Applications](https://dataintensive.net/)
- [System Design Primer — GitHub](https://github.com/donnemartin/system-design-primer)
- [CAP Theorem — Brewer's Conjecture](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/)
- [HTTP/2 and HTTPS — Google Developers](https://developers.google.com/web/fundamentals/performance/http2)
- [OWASP — Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
