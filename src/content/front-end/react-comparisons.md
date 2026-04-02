# React Comparison Tables

Quick-reference comparison tables for the "X vs Y" questions interviewers love about React.

---

## Class vs Function Components

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

## useState vs useReducer

| Feature | `useState` | `useReducer` |
|---|---|---|
| **Best for** | Simple, independent state values | Complex state logic, multiple sub-values |
| **Update mechanism** | Direct value or updater function | Dispatch actions to a reducer function |
| **State shape** | Any single value | Typically an object with multiple fields |
| **Complex transitions** | Awkward — multiple `setState` calls | Clean — single dispatch triggers coordinated update |
| **Debugging** | Harder to trace updates | Easy — log dispatched actions |
| **Testing** | Test the component | Reducer is pure function — test independently |
| **Performance** | Re-renders on every set call | Can batch related state updates naturally |
| **TypeScript experience** | Simpler types | Better type safety for actions and state shape |

**When to use which:** Start with `useState` for simple values (booleans, strings, numbers). Switch to `useReducer` when you have related state variables that update together or complex state transitions.

---

## useMemo vs useCallback

| Feature | `useMemo` | `useCallback` |
|---|---|---|
| **Returns** | A **memoized value** (any type) | A **memoized function** |
| **Purpose** | Cache expensive computation results | Cache a function reference |
| **Syntax** | `useMemo(() => computeValue(a, b), [a, b])` | `useCallback((x) => doSomething(x, a), [a])` |
| **Equivalent** | — | `useMemo(() => (x) => doSomething(x, a), [a])` |
| **Recomputes when** | Dependencies change | Dependencies change |
| **Primary use case** | Avoid recalculating derived data on every render | Prevent child re-renders due to new function references |
| **Common with** | Expensive filtering, sorting, formatting | `React.memo` wrapped children, effect dependencies |
| **When NOT to use** | Cheap computations | Functions not passed as props or deps |

**When to use which:** Use `useMemo` to cache expensive derived values. Use `useCallback` to stabilize function references passed to memoized children. Don't memoize everything — profile first.

---

## useEffect vs useLayoutEffect

| Feature | `useEffect` | `useLayoutEffect` |
|---|---|---|
| **Timing** | After paint (asynchronous) | After DOM mutation, **before** paint (synchronous) |
| **Blocks rendering** | No | Yes — delays visual update |
| **Performance impact** | Better (non-blocking) | Can cause jank if slow |
| **Use case** | Data fetching, subscriptions, logging, timers | DOM measurements, scroll position, preventing visual flicker |
| **SSR behavior** | Works fine | Warns in SSR (no DOM to measure) |
| **Cleanup timing** | Async, after new render paints | Sync, before new render paints |
| **Frequency of use** | ~95% of the time | ~5% — only for DOM measurement/mutation |

**When to use which:** Default to `useEffect` for almost everything. Use `useLayoutEffect` only when you need to read DOM layout and synchronously re-render before the browser paints.

---

## Controlled vs Uncontrolled Components

| Feature | Controlled Components | Uncontrolled Components |
|---|---|---|
| **State owner** | React component (via `useState`) | DOM itself |
| **Value access** | `value` prop + `onChange` handler | `ref` to read DOM value |
| **Source of truth** | React state | DOM |
| **Validation** | On every keystroke (instant feedback) | On submit (delayed feedback) |
| **Code amount** | More (handler for every input) | Less (just refs) |
| **Performance** | Re-renders on every keystroke | No re-renders on input |
| **File inputs** | Cannot be controlled (always uncontrolled) | Only option for `<input type="file">` |

**When to use which:** Use controlled components when you need real-time validation or conditional rendering based on input. Use uncontrolled components for simple forms or when performance is critical.

---

## Context API vs Redux vs Zustand

| Feature | Context API | Redux (Toolkit) | Zustand |
|---|---|---|---|
| **Bundle size** | 0 KB (built-in) | ~11 KB (RTK) | ~1 KB |
| **Boilerplate** | Minimal | Moderate (slices, store config) | Minimal |
| **DevTools** | React DevTools only | Redux DevTools (time-travel) | Redux DevTools (via middleware) |
| **Performance** | All consumers re-render on any context change | Selectors prevent unnecessary re-renders | Selectors prevent unnecessary re-renders |
| **Learning curve** | Low | Medium-High | Low |
| **Best for** | Theme, locale, auth — low-frequency updates | Large apps, complex state, big teams | Small-to-large apps, simplicity preference |

**When to use which:** Use Context for low-frequency global data (theme, auth). Use Redux Toolkit for large teams needing strict patterns. Use Zustand for a lightweight, flexible store.

---

## Server Components vs Client Components

| Feature | Server Components | Client Components |
|---|---|---|
| **Directive** | Default (no directive needed) | `"use client"` at top of file |
| **Runs on** | Server only | Server (SSR) + Client (hydration + interactivity) |
| **Bundle size impact** | Zero — not included in JS bundle | Included in JS bundle |
| **Access to** | Database, file system, env secrets | Browser APIs, DOM, events |
| **State & effects** | Cannot use `useState`, `useEffect`, etc. | Full Hook support |
| **Data fetching** | Direct `async/await` in component | `useEffect`, TanStack Query, SWR |
| **Use case** | Static content, data display, layouts | Forms, interactive widgets, animations |

**When to use which:** Default to Server Components for data fetching and static content. Add `"use client"` only when you need interactivity.
