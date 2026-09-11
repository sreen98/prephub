const e=`# React Comparison Tables

Quick-reference comparison tables for the "X vs Y" questions interviewers love about React. Each section includes the **why** behind the tradeoff — not just which to pick, but what's actually different under the hood.

---

## Class vs Function Components

This comparison reveals whether you are up to date with modern React. Function components with Hooks are now the standard, and have been since React 16.8 (Feb 2019).

The core difference isn't syntax — it's how **logic is composed**. Class components express stateful logic as lifecycle methods (\`componentDidMount\`, \`componentDidUpdate\`, \`componentWillUnmount\`), which scatters a single concern across multiple methods and couples it to the class instance. Function components express logic as hooks, which package one concern (subscribe to something, track a value, load data) as a reusable unit that can be composed and extracted.

| Feature | Class Components | Function Components |
|---|---|---|
| **Syntax** | \`class Foo extends React.Component\` | \`function Foo()\` or \`const Foo = () => {}\` |
| **State** | \`this.state\` + \`this.setState()\` | \`useState\` / \`useReducer\` Hooks |
| **Lifecycle methods** | \`componentDidMount\`, \`componentDidUpdate\`, etc. | \`useEffect\` Hook |
| **\`this\` keyword** | Required (source of bugs) | Not used |
| **Code verbosity** | More boilerplate | Concise |
| **Performance** | Slightly heavier (class instance overhead) | Slightly lighter |
| **Error boundaries** | Supported (\`componentDidCatch\`) | Not supported natively (need class or library) |
| **Logic reuse** | HOCs, render props (complex) | Custom Hooks (simple, composable) |
| **Concurrent features** | Limited support | Full support (Suspense, transitions) |
| **React team recommendation** | Legacy — still supported | Recommended for all new code |

**Why function components win**: \`this\` binding bugs (method loses its context when passed as a callback), logic duplication across lifecycles (the same setup in \`componentDidMount\` and \`componentDidUpdate\`), and the inability to extract reusable stateful logic without HOCs or render props all disappear with hooks. A custom hook is a plain function — composition is just function calls.

**When to use which**: Use function components for all new code. You still need class components for error boundaries (or use \`react-error-boundary\` which gives you a hook-friendly API), and you'll maintain them in legacy codebases.

---

## useState vs useReducer

Both manage state, but they model updates differently. \`useState\` holds a value and exposes a setter; \`useReducer\` holds a value and exposes a dispatch that routes actions through a reducer. The underlying mechanism is the same — React stores a value keyed by hook position — so the choice is really about **how you want to describe the transitions**.

| Feature | \`useState\` | \`useReducer\` |
|---|---|---|
| **Best for** | Simple, independent state values | Complex state logic, multiple sub-values |
| **Update mechanism** | Direct value or updater function | Dispatch actions to a reducer function |
| **State shape** | Any single value | Typically an object with multiple fields |
| **Complex transitions** | Awkward — multiple \`setState\` calls | Clean — single dispatch triggers coordinated update |
| **Debugging** | Harder to trace updates | Easy — log dispatched actions |
| **Testing** | Test the component | Reducer is pure function — test independently |
| **Performance** | Re-renders on every set call | Can batch related state updates naturally |
| **TypeScript experience** | Simpler types | Better type safety for actions and state shape |

**Why \`useReducer\` shines for complex logic**: when multiple fields update together (e.g., a form that sets \`isLoading: true\`, clears \`error\`, and stores a pending request), \`useState\` forces three separate setter calls and three closures. \`useReducer\` expresses the whole transition as a single action, which reads like a single event: \`dispatch({ type: 'submit' })\` triggers one reducer branch that updates all fields at once. Actions also become a log of user intent — much easier to reason about than a trail of setter calls.

**When to use which**: Start with \`useState\` for simple values (booleans, strings, numbers, primitives). Switch to \`useReducer\` when you have related state variables that update together, complex transitions with many branches, or when you want the reducer to be unit-testable as a pure function.

---

## useMemo vs useCallback

Both are memoization hooks, and both exist purely for **referential stability** — preserving the same object identity across renders so downstream comparisons (React.memo, effect deps) don't see a change. The difference is *what* they memoize.

| Feature | \`useMemo\` | \`useCallback\` |
|---|---|---|
| **Returns** | A **memoized value** (any type) | A **memoized function** |
| **Purpose** | Cache expensive computation results | Cache a function reference |
| **Syntax** | \`useMemo(() => computeValue(a, b), [a, b])\` | \`useCallback((x) => doSomething(x, a), [a])\` |
| **Equivalent** | — | \`useMemo(() => (x) => doSomething(x, a), [a])\` |
| **Recomputes when** | Dependencies change | Dependencies change |
| **Primary use case** | Avoid recalculating derived data on every render | Prevent child re-renders due to new function references |
| **Common with** | Expensive filtering, sorting, formatting | \`React.memo\` wrapped children, effect dependencies |
| **When NOT to use** | Cheap computations | Functions not passed as props or deps |

**Why they exist**: every render creates new object and function references. \`{ color: 'red' }\` and \`() => handleClick(id)\` are structurally identical between renders but referentially different. \`React.memo\`, \`useEffect\`, and React's built-in comparisons all use \`Object.is\` (reference equality), so a new reference always looks like a change. Memoization pins the reference in place until the dependencies change.

**Why over-memoizing is worse than under-memoizing**: each \`useMemo\`/\`useCallback\` has overhead — React still runs the hook, compares deps, and stores the value. If the memoized computation is cheap and the result isn't passed to a memoized child, the hook costs more than it saves. React 19's compiler automates this via static analysis, which is why the React team recommends writing plain code and letting the compiler decide.

**When to use which**: Use \`useMemo\` to cache expensive derived values (sort, filter, aggregate) *and* to stabilize object/array references passed to memoized children. Use \`useCallback\` specifically for function references passed to memoized children or declared as effect deps. Don't memoize everything — profile first, or rely on the React Compiler.

---

## useEffect vs useLayoutEffect

They look identical; their **timing** relative to the browser paint is what differs. \`useEffect\` runs after the browser paints (asynchronous, non-blocking). \`useLayoutEffect\` runs after React commits the DOM but *before* the browser paints (synchronous, blocking). That tiny scheduling difference matters when you're reading layout and writing back — \`useLayoutEffect\` lets you adjust before the user sees anything.

| Feature | \`useEffect\` | \`useLayoutEffect\` |
|---|---|---|
| **Timing** | After paint (asynchronous) | After DOM mutation, **before** paint (synchronous) |
| **Blocks rendering** | No | Yes — delays visual update |
| **Performance impact** | Better (non-blocking) | Can cause jank if slow |
| **Use case** | Data fetching, subscriptions, logging, timers | DOM measurements, scroll position, preventing visual flicker |
| **SSR behavior** | Works fine | Warns in SSR (no DOM to measure) |
| **Cleanup timing** | Async, after new render paints | Sync, before new render paints |
| **Frequency of use** | ~95% of the time | ~5% — only for DOM measurement/mutation |

**Canonical \`useLayoutEffect\` case**: a tooltip that positions itself above a button by measuring both elements. If you use \`useEffect\`, the tooltip renders at a default position → paints → then jumps to the correct spot. Users see a flicker. \`useLayoutEffect\` runs before paint, so positioning is done before the user sees anything — no flicker.

**Why \`useEffect\` is the default**: blocking the paint is bad for perceived performance. Frameworks and React itself warn when you use \`useLayoutEffect\` without a clear reason, and it warns in SSR because there's no DOM to measure.

**When to use which**: Default to \`useEffect\` for essentially everything (fetching, subscriptions, logging, timers). Use \`useLayoutEffect\` only when you need to read DOM layout and synchronously re-render before the browser paints.

---

## Controlled vs Uncontrolled Components

In a **controlled** component, React state is the source of truth — every keystroke flows into a setter, and the input's displayed value comes from state. In an **uncontrolled** component, the DOM is the source of truth — you read the value via a \`ref\` when you need it. The mental model is "who owns the current value of the field".

| Feature | Controlled Components | Uncontrolled Components |
|---|---|---|
| **State owner** | React component (via \`useState\`) | DOM itself |
| **Value access** | \`value\` prop + \`onChange\` handler | \`ref\` to read DOM value |
| **Source of truth** | React state | DOM |
| **Validation** | On every keystroke (instant feedback) | On submit (delayed feedback) |
| **Code amount** | More (handler for every input) | Less (just refs) |
| **Performance** | Re-renders on every keystroke | No re-renders on input |
| **File inputs** | Cannot be controlled (always uncontrolled) | Only option for \`<input type="file">\` |

**Why this tradeoff matters at scale**: A controlled form with 30 fields triggers 30 re-renders of the parent component on every keystroke unless you localize state carefully. This is why libraries like **react-hook-form** default to uncontrolled (refs + subscribed renders) — they scale better. Controlled forms are fine for small forms, input masking, or when you need to conditionally render based on value.

**When to use which**: Use controlled components when you need real-time validation, conditional rendering based on input, input masking, or when state is needed elsewhere in the tree. Use uncontrolled components for simple forms, file inputs (forced), or when profiling shows keystroke renders hurt performance.

---

## Context API vs Redux vs Zustand

These all solve "share state across the component tree without prop-drilling" but pick different tradeoffs. Context is the built-in primitive and is purpose-built for **low-frequency** values (theme, locale, auth user). Redux and Zustand are full state managers with selector-based subscriptions that avoid the "every consumer re-renders" problem Context has.

| Feature | Context API | Redux (Toolkit) | Zustand |
|---|---|---|---|
| **Bundle size** | 0 KB (built-in) | ~11 KB (RTK) | ~1 KB |
| **Boilerplate** | Minimal | Moderate (slices, store config) | Minimal |
| **DevTools** | React DevTools only | Redux DevTools (time-travel) | Redux DevTools (via middleware) |
| **Performance** | All consumers re-render on any context change | Selectors prevent unnecessary re-renders | Selectors prevent unnecessary re-renders |
| **Learning curve** | Low | Medium-High | Low |
| **Best for** | Theme, locale, auth — low-frequency updates | Large apps, complex state, big teams | Small-to-large apps, simplicity preference |

**Why Context isn't a state manager**: Context re-renders **every consumer** whenever the value reference changes. A single global "app state" context that updates often will tank performance. Splitting into many small contexts works but becomes unwieldy. Redux / Zustand / Jotai solve this by exposing a selector API: components subscribe to a *slice* and only re-render when that slice changes, using \`Object.is\` comparison internally.

**Why Redux Toolkit over classic Redux**: RTK ships with \`createSlice\` (auto-generates action creators + reducers), \`configureStore\` (DevTools + middleware set up automatically), and built-in Immer for immutable updates. It cuts boilerplate 80% without giving up any Redux power.

**Why Zustand is the trendy middle ground**: Single store, hook-based API, no providers needed, ~1 KB. No action types or dispatch — you mutate state directly via setters. Gets you 90% of Redux's benefits with 10% of the code.

**When to use which**: Use Context for low-frequency global data (theme, locale, auth user object). Use Redux Toolkit when you have complex state flows, want time-travel debugging, or need the strict patterns a large team benefits from. Use Zustand when you want a lightweight global store without ceremony. For server data, reach for **TanStack Query** instead of any of these — it's purpose-built for that and handles caching, revalidation, and deduping automatically.

---

## Server Components vs Client Components

Introduced with React 18 and popularized by Next.js App Router, **React Server Components (RSC)** are components that render **only on the server**. Their JavaScript is never shipped to the browser — only the rendered output. Client Components are the traditional interactive React components you've always written, now requiring an explicit \`"use client"\` directive to opt in.

| Feature | Server Components | Client Components |
|---|---|---|
| **Directive** | Default (no directive needed) | \`"use client"\` at top of file |
| **Runs on** | Server only | Server (SSR) + Client (hydration + interactivity) |
| **Bundle size impact** | Zero — not included in JS bundle | Included in JS bundle |
| **Access to** | Database, file system, env secrets | Browser APIs, DOM, events |
| **State & effects** | Cannot use \`useState\`, \`useEffect\`, etc. | Full Hook support |
| **Data fetching** | Direct \`async/await\` in component | \`useEffect\`, TanStack Query, SWR |
| **Use case** | Static content, data display, layouts | Forms, interactive widgets, animations |

**Why this split is the future**: most of a typical app's UI is static or data-driven — product cards, article pages, navigation, layouts. Shipping that logic and the data-fetching libraries that support it to every user is waste. RSC lets you render it once on the server, send HTML, and leave only the genuinely interactive parts as JS. The result: smaller bundles, faster initial loads, direct DB access without a separate API layer.

**The mental model**: think of components as **default server, opt-in client**. You put \`"use client"\` at the top of the file for interactivity (state, effects, event handlers, browser APIs). Server Components can import Client Components but not the reverse — because server code can't run in the browser. Props passed from server to client must be **serializable** (no functions, no class instances).

**When to use which**: Default to Server Components for everything static or data-driven. Add \`"use client"\` only when you need interactivity — forms, modals, filters, animations. Wrap islands of interactivity in Client Components and keep the surrounding layout, data display, and structure on the server. This is the Next.js App Router model; SvelteKit and others are converging on the same pattern.
`;export{e as default};
