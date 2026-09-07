# React — Complete Guide

## Table of Contents

- [1. What is React?](#1-what-is-react)
- [2. JSX](#2-jsx)
- [3. Components](#3-components)
  - [3.1 Function Components](#31-function-components-standard)
  - [3.2 Class Components](#32-class-components)
  - [3.3 Component Composition](#33-component-composition)
  - [3.4 Component Organization](#34-component-organization)
- [4. Props](#4-props)
- [5. State](#5-state)
- [6. Hooks](#6-hooks)
- [7. Effects and Lifecycle](#7-effects-and-lifecycle)
- [8. Event Handling](#8-event-handling)
- [9. Conditional Rendering and Lists](#9-conditional-rendering-and-lists)
- [10. Forms](#10-forms)
- [11. Context API](#11-context-api)
- [12. Refs](#12-refs)
- [13. Performance Optimization](#13-performance-optimization)
  - [13.1 React.memo](#131-reactmemo)
  - [13.2 useMemo and useCallback](#132-usememo-and-usecallback)
  - [13.3 Code Splitting (Lazy Loading)](#133-code-splitting-lazy-loading)
  - [13.4 Virtualization](#134-virtualization-large-lists)
  - [13.5 Concurrent Features](#135-concurrent-features-usetransition-usedeferredvalue)
  - [13.6 Profiling and Measurement](#136-profiling-and-measuring-performance)
  - [13.7 Common Re-render Causes](#137-common-re-render-causes-and-fixes)
  - [13.8 Image and Asset Optimization](#138-image-and-asset-optimization)
  - [13.9 Webpack vs Vite](#139-build-tools--webpack-vs-vite)
  - [13.10 Bundle Analyzers](#1310-bundle-analyzers)
  - [13.11 Tree Shaking and Code Splitting](#1311-tree-shaking-and-code-splitting-at-build-time)
  - [13.12 Server Components, SSR, Streaming](#1312-server-components-ssr-and-streaming)
  - [13.13 Performance Rules](#1313-performance-rules)
- [14. Reconciliation and Fiber](#14-reconciliation-and-fiber)
  - [14.1 Render → Reconcile → Commit](#141-the-render--reconcile--commit-pipeline)
  - [14.2 Diffing algorithm — three rules](#142-the-diffing-algorithm--three-rules)
  - [14.3 Type matching — re-render vs remount](#143-type-matching--when-components-survive-props-changes-vs-get-destroyed)
  - [14.4 Why list keys matter](#144-why-list-keys-matter-at-the-algorithm-level)
  - [14.5 Fiber data structure](#145-fiber--the-data-structure-that-makes-interruption-possible)
  - [14.6 The work loop](#146-the-work-loop--how-react-actually-traverses)
  - [14.7 Practical implications](#147-practical-implications)
- [15. Patterns and Best Practices](#15-patterns-and-best-practices)
- [16. React 19 Features](#16-react-19-features)
- [17. Interview Questions & Answers](#17-interview-questions--answers)
- [18. Tricky Output Questions](#18-tricky-output-questions)

---

## 1. What is React?

React is a **JavaScript library for building user interfaces**, created by Meta. It uses a component-based architecture where UIs are built from small, reusable pieces.

Key concepts:
- **Declarative** — describe what the UI should look like, React handles DOM updates
- **Component-based** — encapsulated pieces that manage their own state
- **Virtual DOM** — efficient diffing algorithm for minimal DOM updates
- **Unidirectional data flow** — data flows down (parent to child via props)
- **JSX** — HTML-like syntax in JavaScript

---

## 2. JSX

JSX is a syntax extension that lets you write HTML-like code in JavaScript. It compiles to `React.createElement()` calls.

```tsx
// JSX
const element = <h1 className="title">Hello, {name}!</h1>;

// Compiles to
const element = React.createElement('h1', { className: 'title' }, `Hello, ${name}!`);
```

### JSX Rules

```tsx
// 1. Single root element (use Fragment for no wrapper)
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
);

// 2. Close all tags
<img src="photo.jpg" />
<br />

// 3. camelCase for HTML attributes
<div className="card" tabIndex={0} onClick={handler} />
//    ^className (not class)    ^camelCase

// 4. JavaScript expressions in curly braces
<p>{user.name}</p>
<p>{isActive ? 'Active' : 'Inactive'}</p>
<p>{items.length > 0 && 'Has items'}</p>

// 5. Style as object
<div style={{ color: 'red', fontSize: '16px' }} />

// 6. Spread props
<Button {...buttonProps} />
```

---

## 3. Components

### 3.1 Function Components (Standard)

Function components are the standard way to write React components. They are plain JavaScript functions that accept props and return JSX.

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

// Arrow function
const Greeting = ({ name }: { name: string }) => {
  return <h1>Hello, {name}!</h1>;
};

// Usage
<Greeting name="Alice" />
```

### 3.2 Class Components

Class components are the older way of writing React components using ES6 classes. While function components with hooks are the modern standard, class components are still found in legacy codebases and are required for error boundaries. Understanding them is important for interviews and maintaining existing code.

#### Basic Class Component

A class component extends `React.Component`, must implement a `render()` method, and accesses props via `this.props`.

```tsx
import React from 'react';

interface GreetingProps {
  name: string;
  age?: number;
}

class Greeting extends React.Component<GreetingProps> {
  render() {
    return (
      <div>
        <h1>Hello, {this.props.name}!</h1>
        {this.props.age && <p>Age: {this.props.age}</p>}
      </div>
    );
  }
}

// Usage
<Greeting name="Alice" age={30} />
```

#### State in Class Components

State is initialized in one of two ways: **inside the constructor** (the original pattern) or as a **class field** (modern syntactic shortcut). Both end up at the same place — `this.state` is set before `render()` runs the first time. Use `this.setState()` to update it; never mutate `this.state` directly. `setState` accepts either an object (shallow-merged) or a function (when the update depends on previous state). React batches multiple `setState` calls inside the same event handler for performance.

##### Style 1 — Constructor-based initialization (classic pattern)

```tsx
interface CounterState {
  count: number;
  lastUpdated: string;
}

class Counter extends React.Component<{}, CounterState> {
  // The classic React 16/17 pattern. Required if you target older toolchains
  // that don't compile class-field syntax, and the only way to do anything
  // OTHER than initialize state on construction (e.g., refs, instance
  // methods that capture props at construction time).
  constructor(props: {}) {
    // super(props) MUST be called before you can use `this`. Two reasons:
    //   1. JavaScript's class spec — derived class constructors must invoke
    //      super() before referencing `this`. Skipping it throws ReferenceError.
    //   2. Passing `props` makes `this.props` available INSIDE the constructor.
    //      If you call super() without props, `this.props` is undefined for
    //      the rest of the constructor (though React still sets it before
    //      render runs). Always pass props to be safe.
    super(props);

    // Now `this` is initialized — assign initial state.
    this.state = {
      count: 0,
      lastUpdated: new Date().toISOString(),
    };

    // The constructor is also where you bind handlers (if you use the
    // method-not-arrow-function style — see "this binding" below) and
    // initialize any instance refs (`this.inputRef = React.createRef()`).
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}
```

**Why is `super(props)` even a thing?** Class components extend `React.Component`. The base `React.Component` constructor does internal setup (creates the updater queue, attaches `this.props`, etc.). Skipping `super()` means none of that happens — `this` doesn't exist as far as JS is concerned. Skipping `super(props)` (calling just `super()`) lets the base class run but leaves `this.props` undefined *inside the constructor body*. React patches `this.props` itself afterwards, so render still works — but any prop-reading code in your constructor will misbehave. The safest, no-think rule: **always write `super(props)` in every class component constructor.**

##### Style 2 — Class-field syntax (no constructor needed)

```tsx
class Counter extends React.Component<{}, CounterState> {
  // Equivalent to setting `this.state = {...}` in a constructor that just
  // calls super(props). Babel / TS compile this to constructor code under
  // the hood. Most modern React codebases prefer this for readability.
  state: CounterState = {
    count: 0,
    lastUpdated: new Date().toISOString(),
  };

  // Arrow-as-class-field auto-binds `this` to the instance — no manual
  // .bind(this) in a constructor needed.
  increment = () => {
    // Object form — merged with current state
    this.setState({ count: this.state.count + 1 });

    // Functional form — use when the update depends on previous state.
    // Critical inside loops or rapid-fire events; the object form would
    // batch and read stale this.state.count.
    this.setState((prevState) => ({
      count: prevState.count + 1,
      lastUpdated: new Date().toISOString(),
    }));

    // setState with callback (runs AFTER state has been applied + render
    // committed). Use sparingly — usually componentDidUpdate is cleaner.
    this.setState(
      (prev) => ({ count: prev.count + 1 }),
      () => console.log('State updated:', this.state.count)
    );
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}
```

**Constructor vs class fields — when to pick which:**

```
| Reason to use constructor                 | Reason to use class fields            |
|-------------------------------------------|---------------------------------------|
| Reading props before initial state        | All state is static / props-free      |
|   (e.g., state: { id: props.initialId })  |   (most components)                   |
| Binding methods you defined as functions  | Using arrow-function methods          |
|   (this.handleClick = this.handleClick    |   (auto-bound, no manual binding)     |
|    .bind(this))                           |                                       |
| Creating refs (this.inputRef = createRef) | createRef in field syntax also works  |
| Old build toolchains without TC39 fields  | Modern build (any Babel/TS since 2018)|
```

In practice, most modern code uses class fields and only reaches for the constructor when initial state derives from props. Both compile to the same thing.

#### Lifecycle Methods

Class components have lifecycle methods that run at specific points during a component's existence. These cover mounting, updating, and unmounting phases.

```tsx
interface DataFetcherProps {
  userId: string;
}

interface DataFetcherState {
  data: User | null;
  prevUserId: string | null;
}

class DataFetcher extends React.Component<DataFetcherProps, DataFetcherState> {
  // 1. Called before render on mount and update. Return new state or null.
  static getDerivedStateFromProps(
    props: DataFetcherProps,
    state: DataFetcherState
  ) {
    if (props.userId !== state.prevUserId) {
      return { prevUserId: props.userId, data: null };
    }
    return null;
  }

  constructor(props: DataFetcherProps) {
    super(props); // Always call super(props)
    this.state = { data: null, prevUserId: null };
  }

  // 2. Runs after first render — fetch data, set up subscriptions
  componentDidMount() {
    this.fetchData(this.props.userId);
    window.addEventListener('resize', this.handleResize);
  }

  // 3. Return false to skip re-render (performance optimization)
  shouldComponentUpdate(nextProps: DataFetcherProps, nextState: DataFetcherState) {
    return nextProps.userId !== this.props.userId || nextState.data !== this.state.data;
  }

  // 4. Called right before DOM update; return value passed to componentDidUpdate
  getSnapshotBeforeUpdate(prevProps: DataFetcherProps, prevState: DataFetcherState) {
    return { scrollPosition: document.documentElement.scrollTop };
  }

  // 5. Runs after every update — compare prev props/state to decide actions
  componentDidUpdate(
    prevProps: DataFetcherProps,
    prevState: DataFetcherState,
    snapshot: { scrollPosition: number }
  ) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchData(this.props.userId);
    }
    // Use snapshot from getSnapshotBeforeUpdate
    console.log('Scroll was at:', snapshot.scrollPosition);
  }

  // 6. Cleanup — runs before component is removed from DOM
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => { /* ... */ };
  fetchData = async (userId: string) => { /* ... */ };

  render() {
    return this.state.data ? <UserCard data={this.state.data} /> : <p>Loading...</p>;
  }
}

// Error Boundary — only possible with class components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  // Update state when a child throws
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  // Log the error (e.g., to an error reporting service)
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <h2>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}
```

#### Lifecycle Diagram

```
Mounting                     Updating                          Unmounting
────────                     ────────                          ──────────
constructor                  getDerivedStateFromProps
    ↓                             ↓
getDerivedStateFromProps     shouldComponentUpdate
    ↓                             ↓ (if true)
render                       render
    ↓                             ↓
componentDidMount            getSnapshotBeforeUpdate           componentWillUnmount
                                  ↓
                             componentDidUpdate

Error Handling (any phase):  getDerivedStateFromError → render → componentDidCatch
```

#### `this` Binding — The Four Ways

Class component event handlers are notorious for `this`-binding bugs. When you pass `this.handleClick` to `onClick`, the function gets called as a free function (not as a method on the instance), so `this` inside it is `undefined` in strict mode. There are four canonical fixes; pick one and stick with it.

```tsx
class Buttons extends React.Component<{}, { count: number }> {
  state = { count: 0 };

  // ---------- Method 1: bind in the constructor ----------
  // Classic. Rebinds the method to the instance once at construction.
  // Verbose but explicit; most "official tutorial" code uses this.
  constructor(props: {}) {
    super(props);
    this.handleClickBound = this.handleClickBound.bind(this);
  }
  handleClickBound() {
    this.setState({ count: this.state.count + 1 });
  }

  // ---------- Method 2: arrow function as a class field (RECOMMENDED) ----------
  // The arrow lexically captures `this` at definition time, so it's
  // permanently bound to the instance. No constructor work, no manual bind.
  // Most modern codebases standardize on this.
  handleClickArrow = () => {
    this.setState({ count: this.state.count + 1 });
  };

  // ---------- Method 3: arrow function inline in JSX ----------
  // Convenient but creates a NEW function reference on every render —
  // breaks `React.memo` / `PureComponent` for child components that
  // receive this as a prop. OK for tiny / non-memoized children.

  // ---------- Method 4: bind in render (anti-pattern) ----------
  // Same allocation-per-render problem as Method 3, plus visually noisy.
  // Avoid: <button onClick={this.handleClickBound.bind(this)}>...

  render() {
    return (
      <div>
        {/* Method 1 */}
        <button onClick={this.handleClickBound}>Bound</button>

        {/* Method 2 (recommended) */}
        <button onClick={this.handleClickArrow}>Arrow</button>

        {/* Method 3 (inline arrow) */}
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Inline
        </button>
      </div>
    );
  }
}
```

**Performance footnote:** Methods 1 and 2 produce one stable function reference per instance — safe to pass to `React.memo`'d children. Methods 3 and 4 produce a fresh function every render, which defeats child memoization. For most leaf components the cost is negligible; for components passing handlers to `React.memo` lists with thousands of items, prefer Methods 1 or 2.

#### Default Props

Default values for missing props. Two equivalent patterns, depending on style:

```tsx
// ---------- Static defaultProps (legacy + still supported) ----------
class Greeting extends React.Component<{ name?: string; greeting?: string }> {
  static defaultProps = {
    greeting: 'Hello',
  };
  render() {
    return <h1>{this.props.greeting}, {this.props.name ?? 'friend'}!</h1>;
  }
}
// React 18 deprecated defaultProps for FUNCTION components in favor of
// destructuring defaults; for class components it remains supported.

// ---------- TypeScript-friendly: destructure defaults in render ----------
class Greeting2 extends React.Component<{ name?: string; greeting?: string }> {
  render() {
    const { name = 'friend', greeting = 'Hello' } = this.props;
    return <h1>{greeting}, {name}!</h1>;
  }
}
```

#### Prop Validation — `PropTypes` Then, TypeScript Now

Pre-2018, class components used `PropTypes` to validate props at runtime in development:

```jsx
import PropTypes from 'prop-types';

class Greeting extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    age:  PropTypes.number,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
  };
  render() { return <h1>Hello {this.props.name}</h1>; }
}
```

This is **legacy**. Modern React (with TypeScript) replaces `PropTypes` entirely — type checking happens at compile time, with no runtime cost, and the type system catches issues `PropTypes` couldn't (literal types, tuples, conditional types). The `prop-types` package was removed from React's recommended setup; you'll only see it in older codebases. Don't add `PropTypes` to new code; use TypeScript.

#### `forceUpdate` — When (Rarely) to Use

`this.forceUpdate()` re-renders the component without a state or prop change. Class components shouldn't normally need it — if your UI depends on data, that data should be in state or props. Two niche cases:

```tsx
class ClockDisplay extends React.Component {
  // Example: subscribing to an external mutable source not tracked in state
  private timer?: number;

  componentDidMount() {
    this.timer = window.setInterval(() => this.forceUpdate(), 1000);
  }
  componentWillUnmount() {
    if (this.timer) window.clearInterval(this.timer);
  }

  render() {
    // Reads Date.now() directly — not in state, but render needs it fresh
    return <p>Time: {new Date().toLocaleTimeString()}</p>;
  }
}
```

**Almost always wrong.** If you're reaching for `forceUpdate`, the right fix is usually to put the data in state (`this.setState({ now: Date.now() })`), or in the function-component world, use `useSyncExternalStore` for external mutable sources. The hooks equivalent (`const [, force] = useReducer(x => x + 1, 0)`) exists for exactly the same niche cases.

#### Deprecated Lifecycle Methods (UNSAFE_*)

Three lifecycles were deprecated in React 16.3 and renamed with the `UNSAFE_` prefix in 16.9. They still work today but will be removed in a future major version. If you encounter them in legacy code, here's why they're problematic and what to use instead:

```
| Deprecated (UNSAFE_)       | Why removed                              | Modern replacement              |
|----------------------------|------------------------------------------|---------------------------------|
| componentWillMount         | Async-rendering safety: may run multiple │ constructor or                  |
|                            │ times in concurrent mode                 │ componentDidMount               │
| componentWillReceiveProps  | Encouraged storing-derived-state pattern │ getDerivedStateFromProps OR     │
|                            │ that becomes stale; inconsistent with    │ derive in render OR             │
|                            │ async rendering                          │ key-based remount               │
| componentWillUpdate        | Same async-safety problem; commonly     │ getSnapshotBeforeUpdate (for   │
|                            │ misused for DOM reads                    │ DOM reads) + componentDidUpdate │
```

The **strict-mode warning** is what prompts the rename in modern React: any of these three names triggers a deprecation log in development. New class code should never use them.

#### Class vs Function Components

| Feature | Class Components | Function Components |
|---------|-----------------|-------------------|
| Syntax | `class Foo extends React.Component` | `function Foo()` or `const Foo = () =>` |
| State | `this.state` / `this.setState()` | `useState()` hook |
| Lifecycle | Lifecycle methods (`componentDidMount`, etc.) | `useEffect()` hook |
| Hooks support | No | Yes |
| `this` binding | Required (arrow fns or `.bind()`) | Not needed |
| Error boundaries | Yes (`componentDidCatch`) | Not supported (must use class) |
| Code verbosity | More boilerplate | Concise |
| Modern usage | Legacy / error boundaries only | Recommended standard |

### 3.3 Component Composition

Composition is React's primary pattern for code reuse. Components can accept `children` as a prop to wrap other components, creating flexible and reusable UI containers.

```tsx
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </Card>
  );
}
```

### 3.4 Component Organization

Follow a consistent file structure to keep your codebase maintainable. One component per file with named exports is the most common convention.

```
// One component per file, named export
// components/user-card.tsx
export function UserCard({ user }: UserCardProps) {
  return (...);
}

// Pages are also components
// pages/users-page.tsx
export function UsersPage() {
  return (...);
}
```

---

## 4. Props

Props are read-only inputs passed from parent to child.

```tsx
// Typing props
interface UserCardProps {
  name: string;
  age: number;
  email?: string;                          // optional
  onEdit: (id: string) => void;            // callback
  children: React.ReactNode;               // children
}

function UserCard({ name, age, email = 'N/A', onEdit, children }: UserCardProps) {
  return (
    <div>
      <h2>{name}, {age}</h2>
      <p>{email}</p>
      <button onClick={() => onEdit(name)}>Edit</button>
      {children}
    </div>
  );
}

// Spread props
function Button({ variant, ...rest }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={variant} {...rest} />;
}
```

### Props vs State

| Props | State |
|-------|-------|
| Passed from parent | Owned by the component |
| Read-only | Can be updated |
| Trigger re-render when changed | Trigger re-render when updated |
| Flow down (parent -> child) | Local to the component |

---

## 5. State

### 5.1 useState

`useState` is the primary hook for adding state to function components. It returns a state value and a setter function that triggers a re-render when called.

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(prev => prev + 1)}>Increment (functional)</button>
    </div>
  );
}
```

### 5.2 State Update Rules

State updates in React have specific rules you must follow to avoid bugs. Understanding batching, immutability, and functional updates is critical.

```tsx
// 1. State updates are asynchronous (batched)
setCount(count + 1);
setCount(count + 1);
// count only increases by 1! Both read the same `count`

// 2. Use functional updates for sequential updates
setCount(prev => prev + 1);
setCount(prev => prev + 1);
// count increases by 2 (each reads the latest pending state)

// 3. Objects and arrays must be replaced, not mutated
const [user, setUser] = useState({ name: 'Alice', age: 30 });

// BAD: mutating (React won't detect the change)
user.name = 'Bob';
setUser(user);

// GOOD: new object
setUser({ ...user, name: 'Bob' });
setUser(prev => ({ ...prev, name: 'Bob' }));

// Arrays
const [items, setItems] = useState<string[]>([]);
setItems([...items, 'new item']);                    // add
setItems(items.filter(item => item !== 'remove'));   // remove
setItems(items.map(item => item === 'old' ? 'new' : item)); // update
```

### 5.3 useReducer (Complex State)

`useReducer` is an alternative to `useState` for complex state logic with multiple sub-values or when the next state depends on the previous one. It follows the Redux reducer pattern.

```tsx
type State = { count: number; step: number };
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; payload: number }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    case 'reset':
      return { count: 0, step: 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

---

## 6. Hooks

### 6.1 Rules of Hooks

1. **Only call hooks at the top level** — not inside loops, conditions, or nested functions
2. **Only call hooks from React functions** — components or custom hooks

### 6.2 Built-in Hooks Reference

React 19 ships with 14 built-in hooks (plus the 3 actions/forms hooks covered in §16). They split into a few mental buckets:

| Bucket | Hooks | Use for |
|---|---|---|
| **State** | `useState`, `useReducer` | Component-local state |
| **Side effects** | `useEffect`, `useLayoutEffect`, `useInsertionEffect` | Synchronizing with the outside world |
| **Context** | `useContext` | Reading values from a Provider |
| **Refs** | `useRef`, `useImperativeHandle` | Mutable values + DOM access |
| **Memoization** | `useMemo`, `useCallback` | Avoid expensive recomputes |
| **Concurrent** | `useTransition`, `useDeferredValue` | Mark updates as non-urgent |
| **External data** | `useSyncExternalStore` | Subscribe to non-React stores |
| **Misc** | `useId`, `useDebugValue` | SSR-safe IDs, devtools labels |

Each hook below shows its signature, what it does, when to reach for it, and the most common mistake.

#### `useState` — basic local state

```tsx
const [state, setState] = useState(initialValue);
```

**What it does.** Stores a value across re-renders and gives you a setter that triggers a re-render when called.

**When to use it.** Any component-local value that affects the UI: form inputs, toggles, counters, fetched data, modals open/closed.

**Pitfall — setters are async-feeling.** `setState(state + 1)` reads a stale `state`. For updates that depend on the previous value, pass a function: `setState(s => s + 1)`. Calling it twice in a row both increment correctly only with the function form.

See §5.1 for a deeper walkthrough including lazy initialization and update batching.

#### `useReducer` — state with a reducer function

```tsx
const [state, dispatch] = useReducer(reducer, initialState);
const [state, dispatch] = useReducer(reducer, initialArg, init);  // lazy init
```

**What it does.** Same job as `useState`, but transitions go through a `(state, action) => newState` function. `dispatch({ type: '...' })` triggers the next state.

**When to use it.** When state has multiple sub-values that update together, when next state depends on previous state in non-trivial ways, or when you want to centralize update logic in one testable function. Forms with many fields, undo/redo, complex toggles.

**Pitfall — don't over-reach for it.** A single boolean does not need a reducer. Reducers earn their complexity only when transitions are coupled.

See §5.3 for examples including the `init` lazy-initializer.

#### `useEffect` — synchronize with external systems

```tsx
useEffect(setup, dependencies?);
useEffect(() => { /* setup */; return () => { /* cleanup */ }; }, [deps]);
```

**What it does.** Runs `setup` after the browser paints. Returns an optional cleanup function that runs before the next setup or on unmount.

**When to use it.** Subscriptions (websockets, event listeners), DOM measurements after layout, integrating non-React libraries. **Not** for deriving state from props (just compute it during render) and **not** for handling user events (use the handler).

**Pitfall — missing cleanup leaks.** Forgetting to return a cleanup that detaches the listener / aborts the fetch leads to leaks and "Can't perform a state update on an unmounted component" warnings.

See §7 for the full effect lifecycle, dependency rules, and the `useEffect` vs derived-state vs handler decision tree (§7.4).

#### `useContext` — read from a Provider

```tsx
const value = useContext(MyContext);
```

**What it does.** Subscribes the component to the nearest `<MyContext.Provider value={...}>` above it. The component re-renders whenever that `value` changes (referentially).

**When to use it.** Cross-cutting concerns: theme, current user, locale, feature flags. Anything that many components need without prop-drilling.

**Pitfall — re-render storms.** Every consumer re-renders on every `value` change. If you put a fast-changing object literal as `value={{ user, setUser }}`, every consumer re-renders on every keystroke. Memoize the value or split state from setters into separate contexts.

```tsx
const ThemeContext = createContext<'light' | 'dark'>('light');
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click</button>;
}
```

#### `useRef` — mutable box that survives re-renders

```tsx
const ref = useRef(initialValue);
ref.current  // read or write — does NOT trigger re-render
```

**What it does.** Returns a stable `{ current }` object. Mutating `current` does **not** trigger a re-render. Two main uses:
1. **DOM references** — `<input ref={inputRef} />`, then `inputRef.current.focus()`.
2. **Instance variables** — store interval IDs, previous values, mutable flags that don't drive UI.

**When to use it.** Anything you need to remember across renders that should NOT cause a re-render when it changes. Setters in event handlers, timeouts, "did this run already" guards.

**Pitfall — don't read `.current` during render.** Doing so makes render impure. Read it inside effects and handlers.

```tsx
const intervalRef = useRef<number | null>(null);
useEffect(() => {
  intervalRef.current = window.setInterval(tick, 1000);
  return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
}, []);
```

#### `useMemo` — cache an expensive computation

```tsx
const value = useMemo(() => expensiveCompute(a, b), [a, b]);
```

**What it does.** Memoizes the result of the function across renders. React only re-runs it when one of the dependencies changes (by `Object.is` comparison).

**When to use it.** Genuinely expensive pure computations (parsing large data, building lookup tables) **or** preserving referential identity of an object/array passed to a memoized child or used in a `useEffect` dep list.

**Pitfall — premature optimization.** Wrapping every value in `useMemo` adds bookkeeping with no benefit. The `() => ...` allocation, dep array allocation, and `Object.is` comparisons can cost more than the computation itself for cheap values. Profile first.

#### `useCallback` — memoize a function reference

```tsx
const onClick = useCallback((id: string) => { selectItem(id); }, [selectItem]);
```

**What it does.** Returns the **same function reference** between renders as long as deps are unchanged. Equivalent to `useMemo(() => fn, deps)` — same identity-stabilizing job, function-shaped.

**When to use it.** When the function is passed to a `React.memo`'d child or used as a dep of `useEffect` / `useMemo`. Without it, a fresh closure each render breaks downstream memoization.

**Pitfall — useless without consumer memoization.** If the child isn't memoized, wrapping the prop in `useCallback` does nothing. Each render still re-renders the child.

#### `useImperativeHandle` — expose methods on a ref

```tsx
useImperativeHandle(ref, () => ({
  focus: () => inputRef.current?.focus(),
  scrollTo: (y: number) => containerRef.current?.scrollTo(0, y),
}), []);
```

**What it does.** When a parent passes a `ref` to your component, this hook lets you customize what `ref.current` exposes — methods, not the DOM node.

**When to use it.** Sparingly. Only when a parent genuinely needs to imperatively command a child (focus an input, scroll a list, play a video). Most of the time, props + state are the right answer.

**Pitfall — bypassing React's data flow.** If you reach for `useImperativeHandle` to "trigger something in a child", you're usually fighting the framework. Ask whether prop-driven state would do the job.

#### `useLayoutEffect` — synchronous effect before paint

```tsx
useLayoutEffect(setup, dependencies?);
```

**What it does.** Same shape as `useEffect`, but runs **synchronously after DOM mutation and before the browser paints**. The user never sees the in-between state.

**When to use it.** When you need to read layout (`getBoundingClientRect`, `scrollHeight`) and mutate the DOM in response, in a way that would flicker if delayed to `useEffect`. Tooltips that need to reposition, auto-scroll-to-bottom on new messages, focus management after a layout change.

**Pitfall — blocks paint.** The browser waits for this to finish before painting. Heavy work here freezes the UI. Default to `useEffect` and only escalate to `useLayoutEffect` when you see a flicker.

#### `useDebugValue` — label a custom hook in DevTools

```tsx
function useOnlineStatus() {
  const isOnline = ...;
  useDebugValue(isOnline ? 'Online' : 'Offline');
  return isOnline;
}
```

**What it does.** Adds a label next to your custom hook in React DevTools.

**When to use it.** In shared custom hooks that ship in libraries. For app-internal hooks, the variable names already tell DevTools enough.

**Pitfall — formatting overhead.** Pass a `formatFn` second argument if formatting is expensive — it only runs when DevTools inspects the hook.

#### `useSyncExternalStore` — subscribe to a non-React store

```tsx
const snapshot = useSyncExternalStore(
  subscribe,         // (callback) => unsubscribe
  getSnapshot,       // () => current value
  getServerSnapshot? // SSR-safe initial value
);
```

**What it does.** Tear-free subscription to any external store: Redux, Zustand, browser APIs (`window.localStorage`, `window.matchMedia`), event emitters. React guarantees consistent reads across concurrent rendering.

**When to use it.** Building a state library, subscribing to a global event source, or wrapping a browser API in a hook. End users of Redux/Zustand never call this directly — the libraries use it under the hood.

**Pitfall — `getSnapshot` must be stable.** It must return `===`-equal values when nothing changed, or React will infinite-loop re-rendering. Don't return a fresh object literal each call.

```tsx
function useWindowWidth() {
  return useSyncExternalStore(
    (cb) => { window.addEventListener('resize', cb); return () => window.removeEventListener('resize', cb); },
    () => window.innerWidth,
    () => 0,  // SSR fallback
  );
}
```

#### `useId` — stable, unique, SSR-safe IDs

```tsx
const id = useId();
return (
  <>
    <label htmlFor={id}>Name</label>
    <input id={id} />
  </>
);
```

**What it does.** Generates a unique ID that's stable across renders and identical between server and client (avoids hydration mismatches).

**When to use it.** Linking labels to inputs, ARIA `aria-describedby`, or any DOM-id attribute. Especially important under SSR — `Math.random()` and counters break hydration; `useId` doesn't.

**Pitfall — don't use it as a list key.** It's not derived from data; it's per-component-instance. Use stable data IDs for `key`.

#### `useTransition` — mark updates as non-urgent

```tsx
const [isPending, startTransition] = useTransition();
startTransition(() => { setExpensiveState(next); });
```

**What it does.** State updates inside `startTransition` are marked low-priority. React keeps the previous UI interactive while the transition renders, and can interrupt the transition if a higher-priority update (e.g., another keystroke) arrives.

**When to use it.** When typing into a search box would freeze the UI because the result list is expensive to render. Wrap the expensive state update in `startTransition`; let the input field update urgently.

**Pitfall — only state, not events.** You can't transition a network call or `setTimeout`. The body of `startTransition` must be synchronous and only call setters.

```tsx
function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [isPending, startTransition] = useTransition();
  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);                    // urgent
        startTransition(() => setResults(filter(e.target.value))); // can be interrupted
      }}
    />
  );
}
```

#### `useDeferredValue` — render a stale value while a fresh one catches up

```tsx
const deferredQuery = useDeferredValue(query);
```

**What it does.** Returns a value that "lags behind" the input. React renders with the stale value first (fast), then re-renders with the fresh value as a low-priority update (which can be interrupted).

**When to use it.** Same problem as `useTransition` from a different angle — you don't own the setter (e.g., it's a prop from above), so you can't wrap the update. Wrap the *value* instead.

**Pitfall — don't pair it with `useTransition`.** Pick one. If you own the setter, use `useTransition`. If you don't, use `useDeferredValue`.

#### React 19 additions (preview)

The action/forms hooks — `useActionState`, `useFormStatus`, `useOptimistic` — are covered in detail in §16.

### 6.3 Custom Hooks

Custom hooks let you extract and reuse stateful logic across components. A custom hook is simply a function that starts with `use` and can call other hooks inside it.

```tsx
// Custom hook for fetching data
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        setLoading(true);
        const data = await api.getUser(userId);
        if (!cancelled) setUser(data);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUser();
    return () => { cancelled = true; };
  }, [userId]);

  return { user, loading, error };
}

// Custom hook for local storage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Custom hook for debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Custom hook for boolean toggle — simplest possible custom hook
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue] as const;
}

// Usage: const [isOpen, toggleOpen] = useToggle();

// Custom hook for data fetching — the canonical "build one live" interview ask.
// Note: in production, use TanStack Query / SWR. This is the teaching version.
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    fetch(url, { signal: ac.signal })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setData, e => { if (e.name !== 'AbortError') setError(e); })
      .finally(() => setLoading(false));
    return () => ac.abort();    // cancel on unmount or url change
  }, [url]);

  return { data, error, loading };
}
```

**The four custom hooks above are the most-asked patterns in interviews** — `useFetch`, `useDebounce`, `useLocalStorage`, `useToggle`. Senior interviewers often follow up with "build one live" — typically `useFetch` with proper cancellation (the `AbortController` cleanup), or `useDebounce` walked through reasoning step by step. Know the cancellation pattern; that's the senior-level signal.

---

## 7. Effects and Lifecycle

### 7.1 useEffect

`useEffect` lets you run side effects (data fetching, subscriptions, DOM manipulation) after React has updated the DOM. The dependency array controls when the effect re-runs.

```tsx
// Runs after every render
useEffect(() => {
  console.log('rendered');
});

// Runs once on mount
useEffect(() => {
  fetchData();
}, []);

// Runs when dependencies change
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// Cleanup (runs before next effect and on unmount)
useEffect(() => {
  const subscription = api.subscribe(userId, handleUpdate);
  return () => {
    subscription.unsubscribe();            // cleanup
  };
}, [userId]);

// Common use cases:
// - API calls
// - Event listeners (add on mount, remove on cleanup)
// - Timers (start on mount, clear on cleanup)
// - DOM manipulation
// - Subscriptions
```

### 7.2 Lifecycle Mapping (Class -> Hooks)

If you're coming from class components, here's how lifecycle methods map to hooks.

```
componentDidMount     -> useEffect(() => { ... }, [])
componentDidUpdate    -> useEffect(() => { ... }, [deps])
componentWillUnmount  -> useEffect(() => { return () => { ... } }, [])
shouldComponentUpdate -> React.memo()
```

### 7.3 Common Pitfalls

These are the most common mistakes developers make with `useEffect`. Understanding them will save hours of debugging.

```tsx
// 1. Missing dependency
const [count, setCount] = useState(0);
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1);                   // BUG: count is stale (closure)
  }, 1000);
  return () => clearInterval(timer);
}, []);                                     // count not in deps

// FIX: use functional update
setCount(prev => prev + 1);

// 2. Object/array in dependency array
useEffect(() => {
  fetchData(filters);
}, [filters]);                             // BUG: new object reference every render

// FIX: use specific values
useEffect(() => {
  fetchData(filters);
}, [filters.search, filters.page]);

// 3. Fetch race condition
useEffect(() => {
  let cancelled = false;
  async function load() {
    const data = await fetchData(id);
    if (!cancelled) setData(data);          // only update if not cancelled
  }
  load();
  return () => { cancelled = true; };
}, [id]);
```

### 7.4 When NOT to Use useEffect

Possibly the highest-leverage senior-level signal in React interviews: knowing that **most uses of `useEffect` you encounter are wrong**. The hook is for *synchronizing with external systems* — DOM APIs, browser APIs, network requests, third-party libraries. It is not for "do this when state changes." Each of the patterns below is something React-newcomers reach for `useEffect` to do; in each case, there is a better answer.

**1. Don't use `useEffect` to derive state from props or other state.**

```tsx
// BAD — runs an extra render cycle just to compute something
const [filtered, setFiltered] = useState<Item[]>([]);
useEffect(() => {
  setFiltered(items.filter(i => i.name.includes(query)));
}, [items, query]);

// GOOD — derive directly during render. No extra render, no out-of-sync risk.
const filtered = items.filter(i => i.name.includes(query));

// If the computation is expensive, memoize:
const filtered = useMemo(
  () => items.filter(i => i.name.includes(query)),
  [items, query],
);
```

**2. Don't use `useEffect` for data fetching.** Use a real query library — TanStack Query, SWR, RTK Query, or your framework's data layer (Next.js `loader`, Remix loaders, RSC). Effect-based fetching gets caching, deduplication, retries, race conditions, refetching-on-focus, and stale-while-revalidate all wrong by default.

```tsx
// BAD — every component re-fetches; no caching, no dedup, race conditions on rapid prop changes
useEffect(() => { fetch(url).then(r => r.json()).then(setData); }, [url]);

// GOOD — TanStack Query handles caching, dedup, retries, focus-refresh, etc.
const { data } = useQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id) });
```

**3. Don't use `useEffect` to "listen" to state changes for UI.** If you find yourself writing `useEffect(() => { if (count === 10) doSomething(); }, [count])`, the action belongs in the *event handler* that incremented `count`, not in an effect that runs after render.

```tsx
// BAD — effect-as-event-listener
useEffect(() => {
  if (formSubmitted) showThankYou();
}, [formSubmitted]);

// GOOD — fire it where it happens
function handleSubmit() {
  setFormSubmitted(true);
  showThankYou();
}
```

**4. Don't reset state with `useEffect`.** Use `key` prop to remount instead.

```tsx
// BAD — runs an extra render to reset
useEffect(() => { setSelected(null); }, [userId]);

// GOOD — `key` change remounts the component with fresh state
<UserProfile key={userId} userId={userId} />
```

**5. DO use `useEffect` for these.** This is its actual job:

- **Subscribing to external stores** that don't already have a React adapter (`useSyncExternalStore` is even better here).
- **DOM APIs** that need to run after layout — manually focusing an input, measuring an element, attaching a non-React event listener.
- **Browser APIs** like `IntersectionObserver`, `MutationObserver`, WebSocket, `setInterval` (with cleanup).
- **Third-party libraries** that need to be initialized and torn down (Mermaid, Mapbox, charts).
- **Server synchronization** that's specifically *not* about user actions — heartbeats, presence pings, telemetry.

The senior-engineer mental model: `useEffect` is the **escape hatch** to leave React's pure-render model. If you can solve the problem inside the render model — derivation, event handlers, `key`-based reset — that's almost always the right answer. Reach for `useEffect` only when you genuinely need to step outside.

The official React docs have an entire page titled *"You Might Not Need an Effect"* — a good signal of how often the wrong pattern shows up in real codebases.

**6. For the effects that survive that question, split reactive from non-reactive logic.** The remaining pain point with a legitimate effect is a value you need to *read* but don't want to *react* to — a theme used in a toast, a callback prop invoked on connect. React 19.2's `useEffectEvent` (§16.7) exists for exactly that: it gives you a function that is stable across renders yet always sees the latest props and state, so the dependency array stays both honest and minimal instead of forcing a choice between a lint suppression and an unwanted re-run.

---

## 8. Event Handling

React uses synthetic events that wrap native browser events for cross-browser consistency. Event handlers are written in camelCase (`onClick`, not `onclick`) and receive a `SyntheticEvent` object.

```tsx
function EventExamples() {
  // Click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('clicked');
  };

  // Input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
  };

  // Keyboard
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  // Passing data to handler
  const handleItemClick = (id: string) => () => {
    console.log('clicked item:', id);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} onKeyDown={handleKeyDown} />
      <button onClick={handleClick}>Submit</button>
      {items.map(item => (
        <div key={item.id} onClick={handleItemClick(item.id)}>{item.name}</div>
      ))}
    </form>
  );
}
```

---

## 9. Conditional Rendering and Lists

### 9.1 Conditional Rendering

React doesn't have built-in directives like `v-if` or `ngIf`. Instead, you use standard JavaScript expressions — ternaries, logical operators, and early returns.

```tsx
// Ternary
{isLoggedIn ? <Dashboard /> : <Login />}

// Logical AND (short-circuit)
{hasError && <ErrorMessage />}

// Early return
function UserCard({ user }: { user: User | null }) {
  if (!user) return <p>No user found</p>;
  return <div>{user.name}</div>;
}

// Switch-like with object map
const statusComponents: Record<string, React.ReactNode> = {
  loading: <Spinner />,
  error: <ErrorMessage />,
  success: <DataView />,
};
return statusComponents[status] ?? <FallBack />;
```

### 9.2 Lists

Render lists by mapping over arrays in JSX. Every list item must have a unique `key` prop so React can efficiently track changes.

```tsx
// Map over array
function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Key rules:
// - Must be unique among siblings
// - Must be stable (don't use index as key if list can reorder)
// - Use IDs from data, not array index
// - Keys help React identify which items changed/added/removed
```

---

## 10. Forms

### 10.1 Controlled Components

In a controlled component, React state is the single source of truth for form values. Every input change flows through a state update.

```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 10.2 Uncontrolled Components (useRef)

Uncontrolled components let the DOM handle form state. Use `useRef` to read values when needed, typically on form submission.

```tsx
function SearchForm() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(inputRef.current?.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="" />
      <button type="submit">Search</button>
    </form>
  );
}
```

### 10.3 React Hook Form + Zod

For complex forms with validation, a form library reduces boilerplate. React Hook Form with Zod provides type-safe validation with minimal re-renders.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+'),
});

type FormData = z.infer<typeof schema>;

function UserForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="number" {...register('age', { valueAsNumber: true })} />
      {errors.age && <span>{errors.age.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 11. Context API

### 11.1 Creating and Using Context

```tsx
// 1. Create context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// 2. Provider component
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Custom hook for consuming
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

// 4. Usage
function Header() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className={theme}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </header>
  );
}

// 5. Wrap app
<ThemeProvider>
  <App />
</ThemeProvider>
```

### 11.2 When to Use Context vs State Management

| Use Case | Solution |
|----------|---------|
| Theme, locale, auth user | Context |
| Simple prop drilling (2-3 levels) | Just pass props |
| Complex server state (API data) | TanStack Query / SWR |
| Complex client state (many updates) | Zustand / Jotai (Redux for legacy) |
| Form state | React Hook Form |

### 11.3 Server State vs Client State — The Most Important Distinction

The single most useful framing for state management in 2026: **server state and client state are fundamentally different problems and should not share a tool.** Most "Redux is bloat" complaints trace back to teams using one global store for both. Once you split the two, the tool choices become obvious.

```
| Property              | Client state                | Server state                       |
|-----------------------|------------------------------|------------------------------------|
| Source of truth       | The browser                  | The server (database, API)         |
| Lifetime              | This tab, this session       | Forever, across users              |
| Sync model            | Set it, it's set             | Cache locally, refresh from server |
| Concerns              | Reducers, atoms, derivation  | Caching, dedup, refetch, retry,    |
|                       |                              |   stale-while-revalidate, focus    |
| Examples              | Selected tab, modal open,    | User profile, product list,        |
|                       |   form input, theme          |   feed, comments, search results   |
| Right tool            | Zustand / Jotai / Context    | TanStack Query / SWR / RTK Query   |
```

The split has three concrete consequences:

1. **Don't put server data in Redux/Zustand.** Caching, deduplication, refetch-on-window-focus, optimistic updates, retry-with-backoff, request cancellation — these are *the entire job* of TanStack Query. Re-implementing them on top of Redux is hundreds of lines of buggy boilerplate.

2. **Client state libraries can be tiny.** Once API data lives in TanStack Query, the remaining "client state" is small — a few booleans, a selected ID, the open modal. Zustand handles this in ~3 KB with no provider tree, no actions, no reducers, no selectors. Atomic libraries (Jotai, Recoil) take the same approach with even smaller scope per atom.

3. **Redux is no longer the default.** Reach for Redux Toolkit only when you have a genuinely large, complex, time-traveled, devtools-required client state — or you're maintaining a legacy codebase. For most new projects in 2026, the stack is **TanStack Query + Zustand** (or Jotai), not Redux.

The interview signal: when asked "what state management would you use," the answer that lands is *"server state goes in TanStack Query, client state in Zustand or Context. Redux only if there's a specific reason."* Whoever blanket-recommends Redux for a greenfield React project in 2026 is signaling they haven't kept up.

---

## 12. Refs

Refs provide a way to access DOM nodes or persist mutable values across renders without causing re-renders. They're useful for managing focus, measuring elements, and storing timers.

```tsx
// 1. DOM reference
function InputFocus() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}

// 2. Mutable value that doesn't trigger re-render
function Timer() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    intervalRef.current = setInterval(() => console.log('tick'), 1000);
  };

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}

// 3. Callback ref (for dynamic elements)
function MeasureElement() {
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      console.log('Height:', node.getBoundingClientRect().height);
    }
  }, []);

  return <div ref={measureRef}>Content</div>;
}

// 4. Forward ref (expose child's ref to parent)
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});

function Parent() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <Input ref={inputRef} />;
}
```

---

## 13. Performance Optimization

### 13.1 React.memo

`React.memo` is a higher-order component that memoizes the rendered output. It skips re-rendering when props haven't changed (shallow comparison by default).

```tsx
// Memoize component — only re-renders when props change
const UserCard = React.memo(function UserCard({ name, age }: Props) {
  return <div>{name}, {age}</div>;
});

// Custom comparison
const UserCard = React.memo(
  function UserCard(props: Props) { return <div>{props.name}</div>; },
  (prevProps, nextProps) => prevProps.name === nextProps.name
);
```

### 13.2 useMemo and useCallback

`useMemo` memoizes expensive computed values, while `useCallback` memoizes function references. Both prevent unnecessary recalculations or child re-renders.

```tsx
// useMemo — memoize expensive computation
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// useCallback — memoize function reference (prevent child re-renders)
const handleDelete = useCallback((id: string) => {
  setItems(prev => prev.filter(item => item.id !== id));
}, []);
```

**The identity that interviewers love to test:**

```ts
useCallback(fn, deps)  ===  useMemo(() => fn, deps)
```

`useCallback` is literally syntactic sugar over `useMemo` for the function-reference case — same dependency-array semantics, same memoization mechanism, same bailout behavior. Knowing the equivalence proves you understand both hooks rather than just memorizing two recipes.

**When NOT to reach for either** (a senior signal — most devs over-apply these):

- **The component renders are already cheap.** Memoization has its own cost (storing the previous value, running the dep comparison, allocating the closure). For a leaf component that renders in <1ms, the memo is a wash or net-negative.
- **The dependencies are unstable.** If `useMemo(() => x, [items])` is called with a new `items` array reference every render, the memo never hits its cache and you've added overhead for nothing.
- **No memoized child consumes the result.** `useCallback(handler, [])` is wasted unless `handler` is passed to a `React.memo`-wrapped child or a hook with stable-reference requirements (`useEffect` deps).
- **The React Compiler (React 19) is enabled.** It memoizes everything automatically; manual `useMemo` / `useCallback` becomes redundant. Don't strip them out preemptively — but don't add new ones either.

**Rule of thumb:** profile first. If the DevTools Profiler shows a child component re-rendering with referentially-equal props, then memoization helps. If not, the memo is dead weight that costs more than it saves.

### 13.3 Code Splitting (Lazy Loading)

Code splitting with `React.lazy` and `Suspense` lets you load components on demand, reducing the initial bundle size.

```tsx
import { lazy, Suspense } from 'react';

// Lazy load component
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### 13.4 Virtualization (Large Lists)

For rendering thousands of items, virtualization renders only the visible items in the viewport. This prevents DOM bloat and keeps scrolling smooth.

**The math.** A virtualizer maintains three numbers — the total list height (sum of every item's height), the current scroll offset, and the visible window height. From those it computes a `[startIndex, endIndex]` range — the items that intersect the viewport — plus an "overscan" buffer (typically 3–5 items) above and below to mask scroll latency. Only items in that range get React elements; everything else is a phantom that contributes its height to the scroll surface but renders nothing.

The DOM trick is two layers: an outer scroll container with the **full virtual height** (so the scrollbar is correctly sized — `5000 items × 50px = 250000px`), and inner items absolutely positioned at `top = item.start`. Scrolling is just CSS — no React work. As the user scrolls, the virtualizer recomputes the visible range and React re-renders only the small set of visible items.

**Fixed-height vs dynamic-height.**

- **Fixed-height** (`react-window`'s `FixedSizeList`, `@tanstack/react-virtual` with `estimateSize: () => 50`) — easiest case. `start = index × itemHeight`, `endIndex = (scrollTop + viewportHeight) / itemHeight`. O(1) range computation; perfect scrollbar accuracy.
- **Dynamic-height** (`VariableSizeList`, the default behavior of `@tanstack/react-virtual` with measured items) — you give an *estimate*, the virtualizer measures real heights as items render, and corrects the offsets. Two complications: (1) the scroll surface height is a sum based on estimates until items have been measured, so the scrollbar can subtly grow as the user scrolls past unmeasured items; (2) jumping to `index = 9000` with no measurements is a guess. Tools cache measurements between renders to keep things stable.

**Library landscape.**

```
| Library                    | Size    | API style    | Strengths                              |
|----------------------------|---------|--------------|----------------------------------------|
| react-window               | ~5 KB   | Component    | Smallest, predictable, fixed/variable  |
| @tanstack/react-virtual    | ~5 KB   | Hook (headless)| Most flexible; works in any container|
| react-virtualized          | ~34 KB  | Component    | Most features (CellMeasurer, AutoSizer)|
| react-virtuoso             | ~30 KB  | Component    | Best dynamic-height + grouped lists    |
```

**Gotchas:**

- **`overscan` matters.** Too small → flicker as you scroll fast. Too large → wasted DOM. Start at 5; tune by feel.
- **`key` must be stable.** If you key by index, scroll-into-view + delete causes content to "stick" to the wrong row.
- **Search/jump-to-item** needs the virtualizer's `scrollToIndex(i)` API; setting `scrollTop` directly skips the measurement cache.
- **Infinite scroll** combines virtualization with a fetch-trigger near the end of the rendered window — `react-window-infinite-loader` or `@tanstack/react-virtual` + an `IntersectionObserver` on a sentinel.
- **CSS `content-visibility: auto`** is the platform-native alternative — the browser skips layout/paint for offscreen elements you've hinted are out of view. Lighter than DOM virtualization for some cases, but doesn't reduce React's render cost (it still renders all elements).

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              height: virtualItem.size,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 13.5 Concurrent Features (`useTransition`, `useDeferredValue`)

React 18's concurrent renderer lets you mark some updates as **non-urgent** so the browser stays responsive while heavy work happens in the background. Without these, a slow filter on every keystroke blocks the input thread; with them, the input stays at 60 fps and the list catches up.

**The mental model — why this matters.** Pre-React-18, every state update was synchronous and committed in the same render. Once React started rendering, it could not be interrupted; the browser's main thread was blocked until the entire tree was reconciled and committed. On a slow render that took 200ms, the keystroke that caused it could not paint until those 200ms were up — the input felt "stuck." React 18 introduced a **concurrent renderer** that can pause, abandon, and restart work, plus a **lane-based scheduler** that assigns each update a priority. There are roughly three priority tiers users care about:

```
| Priority         | Triggered by                                    | Example                  |
|------------------|-------------------------------------------------|--------------------------|
| Sync / discrete  | Direct user input — clicks, keystrokes, focus   | setState in onChange     |
| Default          | Network responses, timers, normal setState      | setState after fetch     |
| Transition       | Wrapped in startTransition, or useDeferredValue | Slow filter, route change|
```

Higher-priority lanes can preempt lower ones. If the user types again while React is mid-transition, React **discards the in-progress render** and starts over with the latest state — the partially-rendered output is thrown away. This is why concurrent features don't make the work itself faster; they make it *interruptible*, so the urgent work (input value, paint) is never starved.

**What `isPending` is actually telling you.** It is `true` from the moment `startTransition` queues the work to the moment that work commits. It lives in the urgent lane (so updating it doesn't block the input), and it lets you show a spinner without re-introducing the lag — the spinner update itself is sync, but the heavy work it announces is not.

**Lanes — the priority bitmap under the hood.** React 18+ replaced the older "expiration time" model with a **31-bit bitmap** where each bit is one priority level. Bitwise operations (`AND`/`OR`) make priority checks cheap — combining lanes, finding the highest-priority pending lane, and clearing a lane after commit are all single CPU instructions. The scheduler picks the highest-priority pending lane on each tick; lower-priority work can be paused, queued behind a higher-priority update, and resumed when the urgent work completes. A practical consequence: a click in the middle of a long transition immediately preempts that transition, and the transition restarts (not resumes) with the latest state — that's why concurrent rendering is described as *interruptible* rather than *resumable*.

**Time slicing — the 5-millisecond yield.** React's renderer doesn't process the entire fiber tree in one synchronous burst. It does work for **~5ms**, then calls `MessageChannel.postMessage` (a microtask-faster-than-`setTimeout`) to yield back to the browser. The browser handles input, paints, runs other tasks, then schedules React's continuation. This is what keeps a 16-frame budget intact during a heavy render — even a 200ms render is invisible to the user because input events get to run between slices.

**Double buffering — current and work-in-progress trees.** React maintains **two fiber trees**: the **current tree** (what's painted on screen) and a **work-in-progress tree** (what's being computed). Every fiber holds an `alternate` pointer to its counterpart in the other tree. When a render completes, React commits by *swapping* the pointers — an O(1) atomic operation. If a higher-priority update interrupts the work-in-progress tree, React can throw it away without affecting what's on screen. Without double buffering, mid-render interruption would corrupt the visible UI.

**`useOptimistic` — concurrent UI updates without waiting for confirmation.** New in React 19. Lets you render an "expected" state while an async action is pending, with automatic rollback on failure:

```tsx
const [optimisticTodos, addOptimistic] = useOptimistic(
  todos,
  (state, newTodo) => [...state, { ...newTodo, pending: true }],
);

async function handleAdd(text: string) {
  addOptimistic({ id: 'temp', text });   // UI updates immediately
  await server.create(text);              // commit happens; if it throws, React rolls back
}
```

This is what powers the "message appears instantly while sending" UX in modern chat apps without manual rollback bookkeeping.

**Tearing — the bug concurrent rendering creates and `useSyncExternalStore` fixes.** Because a render can be paused mid-tree, two parts of the same tree can read different values from an external store (Zustand, Redux without React 18 bindings) — one read happens before a store update, the other after. Result: tree is inconsistent ("torn"). The fix is `useSyncExternalStore`, which subscribes to the external store with React-compatible semantics — React calls the snapshot function once per commit and consistency is guaranteed. Modern Zustand/Redux already wrap this; if you're writing a store from scratch, use it.

```tsx
import { useState, useTransition, useDeferredValue, useMemo } from 'react';

function ProductSearch({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Urgent: input value updates immediately (controlled input stays snappy)
    setQuery(e.target.value);
    // Non-urgent: heavy filter can be interrupted by the next keystroke
    startTransition(() => {
      // ...trigger downstream state update if needed
    });
  }

  // Or: defer derivation rather than the setter
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(
    () => products.filter(p => p.name.includes(deferredQuery)),
    [products, deferredQuery],
  );

  return (
    <>
      <input value={query} onChange={onChange} />
      {isPending && <span>Updating…</span>}
      <ProductList items={filtered} />
    </>
  );
}
```

`useTransition` wraps **state setters** that schedule slow updates. `useDeferredValue` wraps a **value** so a derived computation lags behind the latest input — useful when the slow consumer isn't yours to wrap.

### 13.6 Profiling and Measuring Performance

You can't fix what you can't see. Use the right tool for the layer you're investigating:

```
| Layer                      | Tool                                    |
|----------------------------|-----------------------------------------|
| Component render cost      | React DevTools Profiler (Flamegraph)    |
| Why a component re-rendered| Profiler "Why did this render?" / why-did-you-render |
| Page load (LCP, INP, CLS)  | Lighthouse, Chrome DevTools Performance |
| Real-user metrics          | web-vitals lib + analytics, Sentry      |
| Long tasks blocking input  | DevTools Performance tab → Long Tasks   |
| Bundle size & duplicates   | Bundle analyzer (see 13.10)             |
```

The React DevTools Profiler records a session of renders and shows a flamegraph of how long each component took. Yellow/red components are the slow ones — start there. The "Ranked" view sorts by duration; the "Why did this render?" toggle (in DevTools settings) annotates each render with the prop/state/hook that changed.

**Render vs commit — what the profiler actually measures.** A React update has two phases. The **render phase** is pure: React calls your component functions, builds the new fiber tree, and runs reconciliation. The **commit phase** is when React actually mutates the DOM and runs effects (`useLayoutEffect` synchronously, `useEffect` after paint). The profiler shows you both — the flamegraph bars represent render-phase time per component, and the commit duration sits at the top. A common confusion: "my component is slow" usually means "the render phase is slow"; if your work is in `useEffect`, the profiler bar for that component will look fine because effects run *after* the recorded commit. For effect-heavy bottlenecks, switch to the Chrome Performance tab.

**Actual vs base duration.** Each Profiler bar shows two numbers: *actual duration* (how long this render took) and *base duration* (how long it would take with no memoization). The gap between them is the value memoization is adding — if base ≈ actual, your memoization isn't doing anything (the component is re-rendering anyway), which usually means a reference-equality bug in props.

**Core Web Vitals — what each metric actually represents.**

- **LCP (Largest Contentful Paint)** — when the biggest above-the-fold element (typically the hero image, video, or a large heading) finishes painting. Good ≤ 2.5s, poor > 4s. LCP is dominated by network (TTFB, image size) and render-blocking resources (large CSS/JS).
- **INP (Interaction to Next Paint)** — replaced FID in March 2024. INP measures the **worst-case latency** between any user interaction (click, tap, key) and the next paint, not just the first one. Good ≤ 200ms, poor > 500ms. This is the React-specific killer: long renders, expensive event handlers, and hydration all spike INP. Lighthouse cannot measure INP reliably (it has no real interactions); you only see it via real-user monitoring.
- **CLS (Cumulative Layout Shift)** — sum of unexpected layout shifts during the page's lifetime. Good ≤ 0.1, poor > 0.25. Common causes: images without `width`/`height`, late-loading fonts that change line metrics, banners injected after first paint, and ads without reserved space.

These three are Google's **search ranking signals** as of 2021 (LCP, FID/INP, CLS), so they have business consequences beyond user feel. The `web-vitals` library measures them using the same algorithms Chrome itself ships, then hands you a callback you can wire to any analytics endpoint:

```tsx
// Report Core Web Vitals to your analytics endpoint
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

function send(metric: { name: string; value: number; id: string }) {
  navigator.sendBeacon('/analytics', JSON.stringify(metric));
}

onCLS(send);   // Cumulative Layout Shift  (visual stability)
onINP(send);   // Interaction to Next Paint (responsiveness, replaced FID in 2024)
onLCP(send);   // Largest Contentful Paint (load speed)
onFCP(send);
onTTFB(send);
```

`React.Profiler` is the in-app equivalent — wrap a subtree to programmatically measure render durations, useful for synthetic perf tests:

```tsx
<Profiler id="ProductGrid" onRender={(id, phase, actual, base) => {
  console.log(id, phase, actual, base);
}}>
  <ProductGrid />
</Profiler>
```

### 13.7 Common Re-render Causes (and Fixes)

Most "React is slow" complaints trace back to a small set of patterns. Profile first, but watch for these:

**The underlying cause is almost always reference equality.** React decides whether a component needs to re-run by comparing the *references* of its props, state, and context value to the previous render's. Two object literals with identical contents are not equal under `Object.is`:

```js
{ a: 1 } === { a: 1 }   // false — different references
```

So when you write `<Child style={{ color: 'red' }} />`, you create a brand-new object on every parent render, and any `React.memo` on `Child` will think the prop changed even though the value is identical. The same is true of arrays (`[1, 2, 3]`), inline functions (`() => doSomething()`), and the `value={{...}}` object you hand to a Context Provider. The fixes — `useMemo`, `useCallback`, hoisting constants outside the component, splitting context — all exist to give those references stability across renders.

**By default, React does not memoize.** Every render of a parent re-renders all of its children, transitively. `React.memo` opts a single component into shallow-prop comparison; without it, the parent re-rendering is enough to re-render the child even when nothing meaningful changed. The React Compiler (React 19) flips this default by inserting memoization automatically, but in compiler-less codebases you have to be deliberate.

**Why "the parent re-rendered" is so often the answer.** When the URL changes, when a top-level provider's value changes, or when global state in `Context` updates, every component below fires a render — even leaves that don't read the changed value. The structural fix is to move the state down (co-location) or split the provider so consumers only subscribe to the state they actually use.

```
| Cause                                          | Fix                                              |
|------------------------------------------------|--------------------------------------------------|
| Inline object/array prop: <X style={{...}} />  | Hoist constant, or useMemo it                    |
| Inline callback to memoized child              | useCallback (or move handler to leaf)            |
| Context value changes on every parent render   | useMemo the value object; split into 2 contexts  |
| Anonymous function inside .map() in deps       | Hoist or useCallback                             |
| Updating state with the same value             | React bails out for primitives, NOT for objects  |
| Parent re-renders entire subtree on URL change | Move route boundaries closer to the leaf         |
| Tall provider tree wrapping the whole app      | Co-locate providers; consider Zustand/Jotai     |
```

The classic Context fan-out trap — every consumer re-renders when *any* field of `value` changes:

```tsx
// BAD — value object is new on every render, even if user/theme didn't change
<AppContext.Provider value={{ user, theme, setTheme }}>

// GOOD — memoize, and split unrelated state into separate contexts
const auth = useMemo(() => ({ user }), [user]);
const themeCtx = useMemo(() => ({ theme, setTheme }), [theme]);
<AuthContext.Provider value={auth}>
  <ThemeContext.Provider value={themeCtx}>
```

### 13.8 Image and Asset Optimization

Images are usually the biggest payload on a React page and the dominant LCP element. Quick wins:

**Why images dominate LCP.** A typical landing page ships ~50 KB of HTML, ~200 KB of JS, and ~1 MB of images. The hero image is almost always the Largest Contentful Paint element by area, which means **its download time is your LCP**. Until that image is decoded and painted, Google's measurement is still "loading." Three forces shape image performance — file size (which format and resolution), download priority (browser fetch ordering), and decode/layout cost (how much work the main thread does to paint it). Each attribute below addresses one of those forces.

**What each attribute actually does:**

- **`width` / `height`** — reserves layout space *before* the image loads, preventing CLS. The browser computes the aspect ratio from these and inserts a placeholder box of the right size. Without them, content below the image jumps when it loads.
- **`loading="lazy"`** — defers the network request until the image is near the viewport (the browser uses an internal threshold, ~1500px below the fold). Cheap to apply to every offscreen image; do **not** apply it to the LCP image, since that delays your most important asset.
- **`decoding="async"`** — tells the browser the image can be decoded off the main thread. Decoding a large JPEG can stall input for tens of milliseconds; `async` removes that from the critical path.
- **`fetchpriority="high" / "low"`** — overrides the browser's heuristic for the request priority. Mark the LCP image `high` (browsers default `<img>` to medium); mark below-the-fold and decorative images `low`.
- **`srcSet` / `sizes`** — gives the browser multiple resolutions and a hint about how wide the image will display. The browser picks the smallest file that's still sharp at the user's DPR. A single 1920×1080 hero is wasted bytes for a 400px-wide phone.
- **`<link rel="preload" as="image">`** — fires the request as soon as the HTML parses, in parallel with CSS/JS. Pair with `fetchpriority="high"` for the LCP image; without preload, the request only starts after the browser parses far enough to discover the `<img>` tag in JS-rendered React output.

```tsx
// Native lazy-loading + explicit dimensions to prevent CLS
<img
  src="/hero.webp"
  width={1200}
  height={630}
  loading="lazy"          // defer offscreen images
  decoding="async"        // don't block the main thread on decode
  alt="Hero"
/>

// Responsive images — browser picks the smallest file that fits
<img
  srcSet="/hero-480.webp 480w, /hero-960.webp 960w, /hero-1920.webp 1920w"
  sizes="(max-width: 600px) 480px, 960px"
  src="/hero-960.webp"
  alt="Hero"
/>

// Preload the LCP image so it starts downloading with the HTML
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />
```

Other low-effort wins: serve WebP/AVIF instead of JPEG, set `fetchpriority="high"` on the LCP image and `low` on offscreen ones, and self-host fonts with `font-display: swap` (or use `next/font` / `@fontsource`).

### 13.9 Build Tools — Webpack vs Vite

Modern React apps almost always use one of these. Pick based on dev-experience needs and ecosystem fit, not folklore.

```
| Aspect             | Webpack                              | Vite                                   |
|--------------------|--------------------------------------|----------------------------------------|
| Dev server         | Bundles before serving               | Native ESM — serves source on demand   |
| Cold start         | Seconds-to-minutes on big apps       | Sub-second                             |
| HMR                | Full module graph rebuild            | Per-module, near-instant               |
| Production build   | Webpack itself                       | Rollup (under the hood)                |
| Config             | Verbose, plugin-heavy                | Minimal; sensible defaults             |
| Loader/plugin eco  | Largest in JS tooling                | Growing; compatible with Rollup plugins|
| Best for           | Legacy apps, heavy custom transforms | New apps, fast feedback loops          |
```

**Why Vite's dev server is so much faster.** Webpack's classic model is *bundle then serve*: every time you start the dev server, Webpack walks the entire dependency graph from the entry point, transforms every file (Babel, TypeScript, CSS-in-JS, etc.), and concatenates the result into one or more bundles before the browser sees anything. On a 5,000-module app, that's 30–90 seconds of cold-start. Hot Module Replacement still has to invalidate part of the graph and rebuild. Vite inverts this — it serves your source files **as native ES modules** over HTTP, with the browser doing the import resolution. The first request for `App.tsx` triggers a single-file transform (esbuild, written in Go, ~10–100x faster than Babel); the next file the browser asks for is transformed lazily on demand. Cold start is sub-second regardless of project size because Vite never builds the graph upfront.

There's a catch: ESM in the browser doesn't work for `node_modules`. Vite **pre-bundles** dependencies once with esbuild on first start (cached after that), converting CommonJS packages into a single ESM file per dependency to keep the import waterfall shallow.

For production, Vite uses **Rollup** instead of esbuild, even though esbuild is faster. The trade-off is intentional: Rollup produces smaller, more aggressively tree-shaken output and has a richer plugin ecosystem for production concerns (legacy browser support, advanced code splitting, asset hashing). Build speed matters less in CI than runtime performance for users.

Webpack 5 closed part of the gap with **persistent caching** (the file system cache means the second build is much faster than the first) and **Module Federation** (the canonical answer for micro-frontends). But per-module HMR and the bundle-free dev server are still Vite's structural edge.

A minimal Vite config for a React app (this project's setup):

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy vendor libs into their own chunks for better caching
          react: ['react', 'react-dom', 'react-router-dom'],
          mermaid: ['mermaid'],
        },
      },
    },
  },
});
```

### 13.10 Bundle Analyzers

When the production bundle is bigger than expected, an analyzer tells you *which module* is responsible. Three common choices:

**What an analyzer is actually visualizing.** A modern bundler emits a **stats file** describing every module that ended up in every chunk: the module's source path, its parsed size (after minification), and its gzipped/brotli size (what actually goes over the wire). An analyzer reads that stats file and renders it as a treemap — each rectangle is one module, sized by bytes, nested inside its parent directory or chunk. Visualizing it is critical because intuition is wrong: a 50-line file that imports `moment` is bigger than 500 lines of your own code, and the treemap makes that difference impossible to miss.

**Three sizes you'll see, and which to care about.**

- **Stat size** — raw bytes of the source file before any optimization. Misleading; ignore it for shipping decisions.
- **Parsed size** — bytes after minification, before compression. This is what the browser parses and executes; affects parse/compile time on low-end devices.
- **Gzipped / Brotli size** — bytes on the network. This is what affects download time on slow connections. **This is the number you optimize for.** Brotli is ~15–25% smaller than gzip and supported everywhere.

**`source-map-explorer` vs the native analyzers.** The native analyzers (`webpack-bundle-analyzer`, `rollup-plugin-visualizer`) plug into the build and have the full module graph. `source-map-explorer` works retroactively — it reads the shipped JS plus its source maps and reverse-engineers what each byte came from. Use the native ones during development; use `source-map-explorer` to audit a bundle you didn't build (e.g., a coworker's deploy, or a third-party site you're benchmarking against).

```bash
# Vite / Rollup — interactive treemap
npm i -D rollup-plugin-visualizer
# add to vite.config.js plugins; opens stats.html after build

# Webpack — same idea, Webpack-native
npm i -D webpack-bundle-analyzer

# Any source-map-emitting bundler — analyzes the shipped JS, not the build graph
npm i -D source-map-explorer
npx source-map-explorer 'dist/assets/*.js'
```

```js
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true }),
  ],
});
```

What to look for in the treemap:

```
1. Duplicate copies of the same library (multiple lodash versions, two react copies)
2. Whole libraries imported for one function (lodash → lodash-es with named imports)
3. Moment.js — replace with date-fns or dayjs (10x smaller)
4. Entire icon packs — import only the icons you use
5. Polyfills shipped to modern browsers — check your browserslist
6. Source maps accidentally shipped to production
7. Markdown/MDX content bundled into JS instead of fetched
```

### 13.11 Tree Shaking and Code Splitting at Build Time

#### Tree Shaking — the theory

**Tree shaking** is the bundler's ability to statically analyze your imports and **drop unused exports** from the final bundle. The name comes from physically shaking a tree — leaves you don't reach drop off, leaves you do reach stay. You import `{ debounce }` from a 70 KB library, and only the bytes that `debounce` transitively depends on end up shipped.

**Why ES modules are required.** Tree shaking is only possible because ES modules are **statically analyzable**. The shape of your imports and exports must be determinable at build time, without running the code. Compare:

```js
// ESM — import binding is fixed at parse time. Bundler knows
//   exactly which exports of './lib' are reachable.
import { debounce } from './lib';

// CommonJS — module.exports is a regular object that runtime code
//   can read, mutate, or destructure dynamically. The bundler cannot
//   prove that any given export is unused without running the code.
const { debounce } = require('./lib');
```

CommonJS is fundamentally a runtime construct (`require` is a function call that returns an object), while ESM is a syntactic construct (`import` is a declaration the parser sees before any code runs). That difference is why `lodash` (CommonJS) doesn't tree-shake but `lodash-es` (ESM) does.

**The `sideEffects` field — a contract with the bundler.** A "side effect" in this context means: importing a module causes something to happen *besides* binding its exports — a polyfill registers itself on `window`, a CSS file is injected, a singleton is initialized. If a module has side effects, the bundler **cannot drop it** even when none of its exports are used, because removing the import would change observable program behavior.

By default, bundlers assume every module has side effects (the safe assumption). To enable aggressive tree shaking, library authors declare otherwise in `package.json`:

```json
// "sideEffects: false" — every file in this package is pure.
//   Bundler is free to drop any unreachable export.
{ "sideEffects": false }

// Whitelist the specific files that DO have side effects.
//   Everything else is treated as pure.
{ "sideEffects": ["*.css", "./src/polyfills.ts"] }
```

This applies to **your application** too, not just published libraries. If your app's `package.json` is missing this field, the bundler may keep modules around that you'd think it could drop.

**What concretely breaks tree shaking** (ranked by frequency in real codebases):

```
1. Default-importing a whole namespace:  import _ from 'lodash'
   - You used the whole `_` object; nothing to shake.
2. Importing from a CommonJS-only build of a library
   - lodash, moment, many older react libraries.
   - Fix: lodash → lodash-es; moment → date-fns/dayjs.
3. Missing `sideEffects: false` in package.json
   - Bundler conservatively keeps everything.
4. Babel transpiling ESM down to CommonJS BEFORE the bundler sees it
   - Old Babel preset-env without `modules: false`.
   - Fix: `["@babel/preset-env", { "modules": false }]`
5. Re-exports through barrel files (index.ts) that pull side-effects
   - Cleaner DX, but every consumer drags the whole barrel's import graph.
6. Dynamic property access:  import * as Icons; Icons[name]
   - The bundler can't prove which names are reachable.
7. Accessing exports through a default-exported object:
     export default { a, b, c }   →   import M from './m'; M.a
   - Looks named, behaves like a namespace; bundler keeps b and c.
```

**How to verify it's working.** Run a bundle analyzer (13.10) before and after the import-style change, or simulate it with a probe export:

```js
// In your library (or a test module), add a uniquely-named export
//   that you never actually import:
export const __SHOULD_BE_TREE_SHAKEN__ = '🪓';
```

Build production, search the output for that string. If it's gone, tree shaking works. If it's there, something in the toolchain is preserving it.

#### Code Splitting — the theory

**Code splitting** is the build-time inverse of tree shaking. Tree shaking removes code that's *never* reached; code splitting separates code that *is* reached but doesn't all need to load up-front. The bundler emits multiple **chunks** (separate `.js` files), and the browser fetches each one only when the running app needs it.

**Why this matters for performance.** A single 2 MB bundle blocks the main thread on parse and compile (not just download) before any of your code runs. Splitting that into a 200 KB initial chunk plus 1.8 MB of on-demand chunks turns the worst-case experience into the best-case experience for most users — they may never request the chunks they don't need.

**The three strategies, why each one exists:**

1. **Route-based splitting** — the highest-leverage split. Most users only visit a fraction of your routes per session, so each route's code is a natural boundary. Wrap each top-level route component in `React.lazy` and the bundler emits one chunk per route automatically.

2. **Component-based splitting** — for heavy widgets that only load on user intent. A rich text editor (~500 KB), a map (~300 KB), or a chart library (~200 KB) doesn't need to be in the initial bundle if the user has to click "Edit" or "Show on map" first. Same `React.lazy` mechanism, scoped to a single component instead of a route.

3. **Vendor chunk splitting** — separates long-lived dependencies (React, React Router, etc.) from your application code. Vendor code changes rarely; your app code changes every deploy. Putting them in separate chunks means a deploy invalidates only the app chunk in users' caches — vendor stays cached. See `manualChunks` in 13.9.

```tsx
// 1. Route-based splitting — every route is its own chunk
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings  = lazy(() => import('./pages/Settings'));

// 2. Component-based splitting — heavy widgets only load when needed
const Chart = lazy(() => import('./Chart'));   // ~200KB d3 dependency
function Report() {
  const [show, setShow] = useState(false);
  return show ? <Suspense fallback={<Spinner/>}><Chart /></Suspense>
              : <button onClick={() => setShow(true)}>Show chart</button>;
}

// 3. Vendor chunk — long-lived libs cached separately from app code
//    See manualChunks in 13.9
```

**The waterfall trap.** Naively nested `React.lazy` boundaries serialize the network — child chunks can't begin downloading until the parent chunk is parsed:

```
1. Browser requests A.js                    [200ms]
2. Browser parses A, discovers it imports B
3. Browser requests B.js                    [200ms]
4. Browser parses B, discovers it imports C
5. Browser requests C.js                    [200ms]
                                  total:  ~600ms
```

Compare to parallel loading where A, B, and C all start at t=0:

```
   total: ~200ms (whichever is slowest)
```

**Mitigations:**

- **Preload at the entry**: emit `<link rel="modulepreload" href="/B-abc.js">` in the HTML so the browser fetches B in parallel with A, even though it doesn't *need* B yet.
- **Prefetch on intent**: start the dynamic import on hover or focus, so by the time the user clicks, the chunk is already in the cache.
- **Restructure**: hoist the lazy boundary to the route level, so all the route's lazy children resolve their imports off a single chunk.

**`startTransition` + lazy.** Wrapping a navigation that crosses a Suspense boundary in `startTransition` makes React **keep the previous UI visible** until the new chunk loads, instead of swapping in the fallback. The Suspense fallback only shows if the load takes longer than the transition timeout (~5s by default). This is what turns a flash-of-spinner into a smooth route change.

### 13.12 Server Components, SSR, and Streaming

Sending less JS to the browser is the biggest performance lever there is. React 19 + frameworks like Next.js (App Router), Remix, and TanStack Start make this easier.

**Three rendering models — and how they differ.**

```
| Model       | Where it runs        | What ships to browser              | What the user sees first            |
|-------------|----------------------|-------------------------------------|-------------------------------------|
| CSR (SPA)   | Browser only         | JS bundle + tiny HTML shell        | Blank page until JS loads & renders |
| SSR         | Server, then browser | Pre-rendered HTML + JS for hydration | HTML immediately, interactive after JS |
| RSC + SSR   | Server only (RSC parts) | HTML + JS only for client comps  | HTML immediately; some parts never need JS |
```

**Classic SSR — the hydration tax.** With pure SSR, the server renders the React tree to an HTML string and ships it; the browser shows it immediately (great LCP). But the React tree must then **hydrate** in the browser: React re-renders the same tree to attach event listeners and reconcile with the existing DOM. This means you ship the HTML *and* every component's JS, and the user can see the page but cannot interact with it until hydration finishes (the "uncanny valley" of pre-React-18 SSR).

**React Server Components — what they fix.** RSCs run **only on the server** and never ship their JS to the browser. The output of an RSC is a serialized description of the rendered tree (not HTML, not JSX — a special wire format) that the React runtime in the browser can stitch into the page alongside Client Components. Three consequences:

1. **Zero JS for non-interactive subtrees.** A 50-item product list, a markdown blog post, a sidebar nav — these never needed event handlers anyway. Their code, their dependencies, and their data-fetching logic all stay on the server.
2. **Direct backend access.** Because RSCs run on the server, they can `await db.query(...)`, read environment secrets, and use Node-only APIs. There's no API layer to maintain for "just display this data."
3. **Composability with Client Components.** An RSC can render a `'use client'` Client Component — the framework handles serialization across the boundary. The reverse (Client → Server) requires a navigation or `import()` boundary because client code can't await server code mid-render.

**Streaming SSR — the throughput model.** Even with classic SSR, `renderToPipeableStream` (Node) and `renderToReadableStream` (Edge) flush HTML to the browser as it's generated, rather than buffering the whole document. Pair with `<Suspense>` boundaries: above-the-fold content paints first; the slow data section sends a placeholder HTML, and the real content streams in over the same response when the promise resolves. The browser swaps the placeholder once the stream arrives — no second request, no waterfall. This is why streaming SSR can produce sub-1s LCP on data-heavy pages that would otherwise wait for the slowest query.

**The taxonomy in one place:**

- **Server Components** render on the server and ship only HTML — zero JS for that subtree. Use them for data-heavy, non-interactive UI.
- **Client Components** (`'use client'`) hydrate and run in the browser — keep these for interactive leaves.
- **Streaming SSR** (`renderToPipeableStream` / `renderToReadableStream`) sends HTML in chunks as the data resolves, paired with `<Suspense>` boundaries. The browser paints above-the-fold content before the slow data section finishes.

**Selective Hydration — what React 18 changed.** Pre-18, the server had to wait for *all* data before sending HTML, and the client had to download *all* JS before hydrating *any* component. One slow API blocked the whole page; one heavy bundle blocked all interactivity. React 18 made both pieces concurrent.

On the server, components inside `<Suspense fallback={...}>` boundaries can fall back to their fallback HTML and stream the real markup later as data resolves. On the client, `hydrateRoot` hydrates each Suspense boundary independently — the fast components attach event handlers while the slow ones are still loading. Critically, React **prioritizes hydrating the boundary the user just clicked**: if the user clicks a comment thread before its bundle arrived, React promotes that boundary to the top of the queue, dropping in-flight hydration of less-urgent boundaries. The user sees their click respond as soon as the relevant code arrives, not after every component has hydrated.

```tsx
// Server
<Suspense fallback={<Header />}>          {/* ships immediately */}
  <Header />
</Suspense>
<Suspense fallback={<CommentsSkeleton />}> {/* streams when comments resolve */}
  <Comments postId={42} />
</Suspense>
<Suspense fallback={<RecsSkeleton />}>     {/* streams when recommendations resolve */}
  <Recommendations userId={user.id} />
</Suspense>
```

Each Suspense boundary is also an independent code-split point: React lazy-loads the JS for that boundary on demand. So it's *both* a data-fetch boundary and a hydration boundary. The mental model: design Suspense boundaries around *user goals* — header, content, comments, sidebar — not technical layers.

**Progressive Hydration — older non-React-built-in flavor.** A general technique that pre-dates React's selective hydration: defer hydration of components that aren't visible or aren't interactive yet. Implementations include hydrating on `IntersectionObserver` (when scrolled into view), on first user interaction (click/hover/focus), or on `requestIdleCallback` (during browser idle). Astro's "client directives" (`client:idle`, `client:visible`, `client:only`) are the canonical example. With React 18+, selective hydration covers most of the use cases, but `client:visible`-style hydration is still useful for far-below-the-fold widgets where you'd rather not even download the JS until the user scrolls.

**Islands Architecture — the radical alternative.** Instead of "ship a React tree and hydrate it," islands ship *plain HTML* with isolated interactive components ("islands") sprinkled in. Each island has its own tiny bundle and hydrates independently — there's no big root tree and no monolithic hydration step. Static content (most of a blog post, a marketing page, a product description) ships as raw HTML with zero JS.

Frameworks: **Astro** (the canonical implementation), **Marko** (eBay), **Eleventy + Preact**, **Fresh** (Deno), and **Qwik** (which goes further with "resumability" — no hydration at all, just lazy event listener attachment). Islands suit content-heavy sites where most of the page is static; SPA-heavy apps with thousands of interactive widgets aren't a great fit.

```
| Approach              | Initial JS payload         | Best for                           |
|-----------------------|----------------------------|------------------------------------|
| SPA (CSR)             | Whole app                  | Highly interactive dashboards      |
| SSR + full hydration  | Whole app + serialized data| Mixed-interactive content sites    |
| RSC + selective hyd.  | Only Client Components     | Modern data-heavy apps             |
| Islands               | Only the islands           | Content-first sites (blogs, docs)  |
| Resumable (Qwik)      | ~0KB until interaction     | Same as Islands, even leaner       |
```

**Incremental Static Regeneration (ISR).** Sits between SSG and SSR. The page is pre-rendered at build time (like SSG) but the server can **regenerate** specific pages in the background after a `revalidate` interval, while still serving the cached version to users (stale-while-revalidate). The result: static-fast TTFB plus the ability to update content without a full site rebuild.

```tsx
// Next.js Pages Router
export async function getStaticProps() {
  const post = await fetchPost();
  return {
    props: { post },
    revalidate: 60,    // background-regenerate at most every 60s
  };
}

// Next.js App Router — on-demand revalidation
import { revalidatePath, revalidateTag } from 'next/cache';
revalidatePath('/blog/[slug]', 'page');   // invalidates a single path
revalidateTag('posts');                    // invalidates everything tagged 'posts'
```

ISR shines for blogs, product catalogs, news sites — pages that change occasionally but get massive read traffic. Not appropriate for per-user personalized data (use SSR or RSC instead), and the first user after the revalidation window pays a slightly slower request as the regeneration runs.

**Rendering models on the web — the comparison table.**

```
| Model           | Renders at      | TTFB    | FCP     | TTI/INP  | SEO  | Best for                       |
|-----------------|-----------------|---------|---------|----------|------|--------------------------------|
| CSR (SPA)       | Browser only    | Fast    | Slow    | Slow     | Hard | App shell, dashboards          |
| SSR             | Server per req  | Slower  | Fast    | Hydration| Good | Personalized, dynamic content  |
| SSG             | Build time      | Fastest | Fast    | Fast     | Best | Marketing, docs (static)       |
| ISR             | Build + bg re-gen| Fast   | Fast    | Fast     | Best | High-traffic infrequently changing |
| Streaming SSR   | Server (chunked)| Fast    | Fast    | Hydration| Good | Large pages with slow data     |
| RSC             | Server + client | Fast    | Fast    | Less JS  | Best | Modern data-heavy apps         |
| Islands         | Server + per-island JS| Fast | Fast | Fastest | Best | Content-first sites            |
```

Pick by what dominates your page: **mostly static content** → SSG or Islands. **Personalized per request** → SSR or RSC. **High-traffic catalog with periodic updates** → ISR. **Highly interactive dashboard** → CSR with route-level lazy loading. Most apps end up using *several* of these — RSC for the layout shell, SSG for marketing pages, CSR for the authenticated dashboard, ISR for the public blog.

```tsx
// Server component — runs once on the server, ships zero JS
async function ProductList() {
  const products = await db.products.findMany();   // direct DB access
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}

// app/page.tsx
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ProductList />          {/* streams in when data is ready */}
    </Suspense>
  );
}
```

Even without RSC, plain SSR + hydration improves LCP on content-heavy pages. The trade-off is TTFB — measure before adopting.

### 13.13 Performance Rules

Follow these rules of thumb to keep your React app fast.

```
1.  Don't optimize prematurely — React is fast by default
2.  Profile first — React DevTools Profiler for renders, Lighthouse for load
3.  Avoid creating objects/arrays/functions in render unless they're props to memoized children
4.  Use stable keys in lists (id, not index, when items can reorder or splice)
5.  Move state as close to where it's needed as possible — co-location > global
6.  Memoize Context value objects; split unrelated state into separate contexts
7.  Code-split routes and heavy widgets; preload above-the-fold chunks
8.  Virtualize long lists (1000+ items)
9.  Use useTransition / useDeferredValue for slow state-derived UI
10. Lazy-load offscreen images, set width/height to prevent CLS, preload the LCP image
11. Run a bundle analyzer on every release; chase duplicates and lodash/moment
12. Tree-shake — named ESM imports + sideEffects:false
13. Track INP, LCP, CLS in production with web-vitals → analytics
14. Prefer Server Components for non-interactive, data-heavy UI
```

---

## 14. Reconciliation and Fiber

This section is the "what is actually happening when React renders" deep dive. If you only ever use `useState` and JSX, you can skip it; if you debug perf bugs or get asked "explain reconciliation" in interviews, it's the most useful section in the guide.

### 14.1 The Render → Reconcile → Commit pipeline

Every React update goes through three phases. Conflating them is the #1 source of mental-model bugs:

1. **Render phase** — React calls your component functions, building a *new* tree of plain JS objects (React elements). Pure: no DOM mutation, no effects, no side effects of yours allowed.
2. **Reconciliation** — React compares ("diffs") the new element tree against the previous fiber tree to figure out what actually changed.
3. **Commit phase** — React applies the diff to the real DOM, runs `useLayoutEffect` synchronously, paints, then runs `useEffect` after paint.

The render phase can be **paused, restarted, or thrown away** in concurrent mode (an interrupting urgent update will just discard a half-finished render). The commit phase is **always synchronous and uninterruptible** — once React starts mutating the DOM, it finishes before yielding. This is why side effects in the render body are forbidden: a discarded render must leave no trace.

### 14.2 The diffing algorithm — three rules

A naive tree diff is O(n³). React achieves practical O(n) by making three opinionated assumptions and refusing to handle the cases that violate them:

```
1. Different element types → unmount the old, mount fresh.
   <div> → <span> nukes the entire subtree (including state, refs, DOM).
2. Same type → keep the DOM node, update its props.
   Diff continues recursively into children.
3. Lists are matched by `key`, not by content.
   Same key + same type → reuse. Different key → unmount + remount.
```

The reasoning behind rule #1 is harsh but correct: changing `<div>` to `<span>` is so unusual that it's not worth searching for "did the user maybe mean to keep this node?" If you wanted preservation, you'd use the same type and change the prop. The performance cost of the wrong assumption is bounded (one subtree); the gain on the common case (no type change) is enormous.

### 14.3 Type matching — when components survive props changes vs get destroyed

Two questions get conflated in interviews:

- **"Is the component re-rendered?"** — yes, almost always, when the parent re-renders. This is cheap.
- **"Is the component remounted?"** — almost never. Remount happens only if the element type changes, or if the key changes.

```jsx
// Same type — props update, hooks/state/DOM survive
{isLoggedIn ? <Profile name="Ana" /> : <Profile name="Guest" />}

// Different type at the same position — REMOUNT (state/refs/DOM nuked)
{isLoggedIn ? <Profile /> : <LoginPrompt />}

// Same type, different positions in array
//   Without keys, position is identity → first slot maps to first slot
{[...items, item3].map(i => <Item data={i} />)}    // index keys, fragile
{items.map(i => <Item key={i.id} data={i} />)}     // stable id keys, correct
```

**The conditional-rendering gotcha that catches everyone:**

```jsx
{isCompany ? <Input id="company-id" /> : <Input id="person-id" />}
```

Both branches produce `<Input>` at the same position with the same type. React reuses the DOM node and the component's internal state — so when the user toggles `isCompany`, the half-typed text from one form stays in the *other* form's field. Both branches share the same React fiber.

The fix is to give them different identity:

```jsx
{isCompany ? <Input key="company" id="company-id" /> : <Input key="person" id="person-id" />}
```

Different keys at the same position force React to unmount one and mount the other. The state resets correctly.

### 14.4 Why list keys matter at the algorithm level

Without keys, React matches list items **by position**:

```jsx
{items.map((item, i) => <Row data={item} />)}    // implicit key = index
```

This is correctness-fine **only if items never reorder, splice, or filter**. The moment you do `setItems(prev => [newItem, ...prev])`, React's reconciliation:

1. Sees `Row` at index 0 with new `data` prop → calls it a prop update on the existing Row.
2. Sees `Row` at index 1 with the data that *used to be* at index 0 → another prop update.
3. ...and so on for every row.

The visible result: every row's props "changed," so every memoization is invalidated, every controlled input loses its state, and the whole list re-renders. With `key={item.id}`, React matches by identity — the new item gets a fresh mount, the rest are untouched, and `React.memo` or `useMemo` work as designed.

### 14.5 Fiber — the data structure that makes interruption possible

Pre-React-16, reconciliation was implemented as **recursive synchronous tree traversal**. Each component's render call sat on the JavaScript call stack. The call stack is opaque — you can't pause it, save it, or restart it — so a render had to run to completion or not at all. A 200ms render meant a 200ms blocked main thread.

React 16's Fiber rewrote the call stack as a **linked list of plain JS objects**. Each fiber has pointers to its `child`, `sibling`, and `return` (parent), plus state about its work-in-progress. Walking the tree is now an iterative loop — at any iteration, React can save its position and yield to the browser:

```js
// Conceptual fiber node
{
  type: Profile,                  // function ref or DOM tag
  stateNode: instance | DOMNode,  // the actual instance/DOM
  child, sibling, return,         // tree pointers
  pendingProps, memoizedProps,    // input
  memoizedState,                  // hooks linked list
  alternate,                      // counterpart in the other tree (double-buffer)
  flags,                          // bitmask of work to do (Placement, Update, Deletion...)
  lanes,                          // priority bitmap
}
```

**Why every field matters:**

- **`child`/`sibling`/`return`** — iterative tree walk; React can pause and the next slice picks up at this fiber.
- **`alternate`** — the **double-buffer** pointer. Each fiber in the current tree has an alternate in the work-in-progress tree (and vice versa). When a render completes, React swaps `current = workInProgress` in O(1).
- **`pendingProps` vs `memoizedProps`** — enables the "bail out" optimization. If pending equals memoized (and there are no pending hooks updates), React skips re-rendering this fiber entirely.
- **`flags`** (formerly `effectTag`) — bitmask of what needs to happen at commit time. Placement = insert into DOM, Update = mutate DOM, Deletion = remove. Set during the render phase, applied during commit.
- **`lanes`** — which priority lanes have pending work in this subtree. Used by the scheduler to pick which fiber to work on next.

### 14.6 The work loop — how React actually traverses

Fiber's work loop is two phases per slice — **begin** (descend into a fiber, build its work-in-progress) and **complete** (bubble back up, attach results to parent). Roughly:

```
beginWork(fiber):
  if fiber is bailout-eligible: skip subtree
  else: render the component, create child fibers, descend to first child

completeWork(fiber):
  attach DOM nodes / collect side effects into parent
  if has sibling: switch to sibling, beginWork
  else: bubble up to return, completeWork
```

After roughly 5ms of work, React calls `shouldYield()` (which uses `MessageChannel` for a fast yield-to-browser). The browser handles input/paint, then schedules React's continuation. The interrupted fiber's position is just a pointer in the work-in-progress tree — picking up next time costs nothing.

### 14.7 Practical implications

1. **Don't redeclare components inside other components.** Each parent render creates a *new* function reference, which Fiber sees as a new `type`, which triggers unmount + remount of every instance. The bug looks like "my input loses focus on every keystroke."

   ```jsx
   // BAD
   function Parent() {
     const Input = () => <input />;     // new ref every render → remount
     return <Input />;
   }
   ```

2. **Mounting is expensive; updating is cheap.** A change that flips the type unmounts the entire subtree. If you can preserve the type and just change props, do.

3. **Stable list keys are a correctness rule, not just a perf rule.** Index keys silently corrupt component state when items reorder.

4. **`React.memo` is a fiber-level bailout opt-in.** It compares incoming props against `memoizedProps` shallowly; if equal, the begin phase short-circuits the subtree. Without `memo`, React re-runs the function but the bailout logic in Fiber may still skip some work via `pendingProps === memoizedProps` reference equality.

5. **The Profiler's "actual" vs "base" duration** map to the fiber-level cost: actual is the time React actually spent in the begin phase (after bailouts); base is what it would have cost without any bailout. Gap = your memoization is paying off.

---

## 15. Patterns and Best Practices

### 15.1 Compound Components

The compound component pattern lets related components share implicit state. It's how libraries like Radix UI and Headless UI work.

```tsx
function Tabs({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabList({ children }: { children: React.ReactNode }) {
  return <div className="tab-list">{children}</div>;
};

Tabs.Tab = function Tab({ index, children }: { index: number; children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      className={activeTab === index ? 'active' : ''}
      onClick={() => setActiveTab(index)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function TabPanel({ index, children }: { index: number; children: React.ReactNode }) {
  const { activeTab } = useContext(TabsContext);
  return activeTab === index ? <div>{children}</div> : null;
};

// Usage
<Tabs>
  <Tabs.List>
    <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
    <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel index={0}>Content 1</Tabs.Panel>
  <Tabs.Panel index={1}>Content 2</Tabs.Panel>
</Tabs>
```

### 15.2 Render Props

Render props is a pattern where a component accepts a function as a prop and calls it to determine what to render. It enables flexible code reuse.

```tsx
interface MousePosition { x: number; y: number }

function MouseTracker({ render }: { render: (pos: MousePosition) => React.ReactNode }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return <>{render(position)}</>;
}

// Usage
<MouseTracker render={({ x, y }) => <p>Mouse: {x}, {y}</p>} />
```

### 15.3 Custom Hook Pattern (Preferred over Render Props)

Custom hooks have largely replaced render props and HOCs as the preferred way to share stateful logic between components.

```tsx
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return position;
}

// Usage
function Component() {
  const { x, y } = useMousePosition();
  return <p>Mouse: {x}, {y}</p>;
}
```

---

### 15.4 Higher-Order Components (HOCs)

A HOC is a function that takes a component and returns a new component with extra behaviour. It was the dominant reuse pattern before hooks.

```tsx
function withLogging<P extends object>(Wrapped: React.ComponentType<P>) {
  return function WithLogging(props: P) {
    useEffect(() => { analytics.track('mount', Wrapped.name); }, []);
    return <Wrapped {...props} />;
  };
}
export default withLogging(Dashboard);
```

**Why hooks replaced them for most cases:** HOCs create "wrapper hell" in the component tree, they obscure where a prop came from (three HOCs deep, which one injected `user`?), prop-name collisions are silent, static methods and refs need manual forwarding, and typing them well is genuinely hard.

**Where a HOC is still the right tool:** when the behaviour must wrap the component itself rather than run inside it — an error boundary, a Suspense boundary, an authorization gate that renders something *else*, or injecting a provider. A hook can't stop a component rendering or replace it; a HOC can.

The convention if you write one: name it `withX`, hoist static methods, forward refs, and set `displayName` so DevTools is readable.

---

### 15.5 Presentational vs Container Components

The original split (Dan Abramov, 2015) separated **container** components (fetch data, hold state, know about the outside world) from **presentational** components (take props, render UI, know nothing about where data came from).

```tsx
// Container — knows about data
function UserListContainer() {
  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  if (isLoading) return <Spinner />;
  return <UserList users={data} />;
}

// Presentational — pure, trivially testable, trivially storybook-able
function UserList({ users }: { users: User[] }) {
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

**Abramov later walked the prescription back**, and the reason matters: custom hooks made the split unnecessary as a *rule*, because you can extract the data logic without extracting a component. The mechanical version — a `Container` file for every component — is now considered overkill.

But the **underlying principle survives and is worth stating**: keep components that know about data separate from components that only render, because presentational components are trivially testable, reusable across contexts, and the right thing to put in Storybook. In modern React the seam is usually a **custom hook** (`useUsers()`) rather than a wrapper component, and in an RSC codebase it maps almost exactly onto the **Server Component fetches / Client Component renders** boundary (see the Next.js & RSC guide).

---

### 15.6 Flux and One-Way Data Flow

**Flux** is the architecture Facebook introduced in 2014 to replace two-way binding, and it's the ancestor of Redux, Zustand and `useReducer`:

```
Action  →  Dispatcher  →  Store  →  View
  ↑                                  │
  └──────────────────────────────────┘
        (views dispatch actions, never write to stores)
```

The key constraint is that **data flows in one direction only.** A view cannot mutate a store; it can only *dispatch an action describing what happened*. The store owns the transition. Redux collapsed the dispatcher into a single store with reducers, and `useReducer` is the same idea at component scope.

**Why one-way data flow matters** — this is the actual interview answer, not the diagram:

- **Predictability.** State changes have exactly one path, so "why did this change?" has a findable answer. Two-way binding (Angular 1, Knockout) meant any view could write to any model, and a cascade of updates had no traceable origin.
- **Debuggability.** Because every change is an action, you get a log of them — which is what makes Redux DevTools' time-travel possible.
- **Testability.** A reducer is a pure function: given this state and this action, expect that state.
- **It composes with React's render model.** React re-renders from data, so a single source of truth per piece of state means the UI is always a function of state rather than a set of imperative patches.

In React specifically, one-way flow is why **props flow down and events flow up**: a child never writes to a parent's state, it calls a callback and the parent decides. When two siblings need the same state, you **lift it** to their common ancestor (or a store). And it's why **mutating state directly is a bug** — the reducer/setter is the only sanctioned transition, and mutation bypasses it (see §5).

---

### 15.7 Portals

A portal renders children into a **different DOM node** while keeping them in the same React tree.

```tsx
import { createPortal } from 'react-dom';

function Modal({ children, onClose }) {
  return createPortal(
    <div className="overlay" onClick={onClose}>{children}</div>,
    document.body,                 // rendered here in the DOM
  );
}
```

**The problem it solves** is CSS containment: a modal, dropdown or tooltip rendered deep in the tree gets clipped by an ancestor's `overflow: hidden`, or loses a `z-index` fight because an ancestor created a stacking context (see the Modern CSS guide §11). Portalling to `document.body` escapes both.

**What stays and what moves:**

| Follows the **React** tree | Follows the **DOM** tree |
|---|---|
| Context — a portal still reads providers above it | CSS — styles come from the new parent |
| Event bubbling *in React* — events propagate to React ancestors | Focus/tab order — the node is where you put it |
| Error boundaries | `document.activeElement`, native event listeners on ancestors |

That first row surprises people: a portalled component **still receives context** from where it sits in JSX, and a synthetic event from inside a portal **still bubbles to its React parent** even though the DOM nodes are unrelated. That's usually what you want, and occasionally the source of a "why is my outside-click handler firing?" bug — a click inside a portalled modal bubbles to the React ancestor that owns the "click outside to close" handler.

**The modern alternative is usually better.** `<dialog>` with `showModal()` and the `popover` attribute render in the browser's **top layer**, which is above the entire stacking-context tree, and they bring focus trapping, Escape-to-close and `::backdrop` for free. Reach for a portal when you need one for a non-dialog case or you're supporting a design that predates those.

**Accessibility caveat:** a portal moves the DOM node, so **tab order follows the DOM, not your JSX**. A portalled dropdown appended to `document.body` sits at the end of the tab order regardless of where its trigger is, so you must manage focus explicitly (see the Accessibility guide §6.3).

---

### 15.8 Fragments, and Node vs Element vs Component

**Fragments** group children without adding a DOM node:

```tsx
<>
  <td>Name</td>
  <td>Email</td>
</>
```

They matter for more than tidiness: wrapping `<td>`s or `<li>`s in a `<div>` produces invalid HTML and breaks the parent-child relationships screen readers depend on, and an extra `div` inside a flex or grid container changes the layout. Use the long form `<React.Fragment key={id}>` when you need a `key` — the shorthand can't take one.

**The three terms** get asked as a definition question, and the distinction is real:

| Term | What it is |
|---|---|
| **React Component** | A function (or class) that returns UI. A *blueprint* — `function Button() {…}` |
| **React Element** | The lightweight object a component call or JSX produces. Immutable, describes what to render — `{ type: Button, props: {…}, key, ref }` |
| **React Node** | Anything React can render: an element, a string, a number, `null`, `undefined`, a boolean, or an array of nodes |

```tsx
const Button = () => <button/>;         // Component (blueprint)
const el = <Button />;                  // Element  (a plain object, NOT rendered yet)
const node = [el, 'text', null, 42];    // Node     (all renderable)
```

The practical consequences: **elements are immutable** — you describe a new one rather than mutating an existing one, which is why the render model works. `<Button />` is *not* a call to `Button()`; it's `createElement(Button, …)`, an object React will call *later* and can choose not to call at all. And `React.ReactNode` is the type you want for a `children` prop, because it's the permissive one — `ReactElement` rejects a string child, which is a very common TypeScript mistake.

---

### 15.9 StrictMode

```tsx
<StrictMode><App /></StrictMode>
```

In **development only**, StrictMode deliberately:

- **Double-invokes** component function bodies, initialisers, and reducer/state updater functions — to surface impure renders.
- **Double-runs effects** — mount → unmount → mount — to surface missing cleanup.
- Warns about deprecated APIs and legacy patterns.

None of this happens in production. The double-invoke is not a bug and should not be "fixed" by adding a ref guard — it's a detector. **If double-invoking breaks your component, your component is impure**, which means it will also break under React's concurrent renderer, which is allowed to start, abandon and restart a render.

The two failures it exposes, both real:

```tsx
// Impure render — mutates a prop; StrictMode makes it push twice
function List({ items }) { items.push('extra'); /* … */ }

// Missing cleanup — StrictMode's mount/unmount/mount leaves two subscriptions
useEffect(() => { socket.subscribe(handler); }, []);   // no return
```

It also interacts with React Compiler: the compiler **silently skips** components that violate purity or immutability, so StrictMode is the tool that makes the underlying impurity *visible* (see §16.1).

---

### 15.10 Internationalisation (i18n)

Not a React feature, but a standard interview topic because getting it wrong is expensive to retrofit.

```tsx
// react-i18next / next-intl / FormatJS all follow this shape
const { t } = useTranslation();
<p>{t('cart.items', { count })}</p>          // pluralisation handled by the library
```

The decisions that matter:

- **Never concatenate translated strings.** `t('You have') + count + t('items')` breaks in every language with different word order or grammatical cases. Use **interpolation with named placeholders** and let the library handle **pluralisation** — plural rules vary from two forms (English) to six (Arabic), so `count === 1 ? 'item' : 'items'` is wrong outside English.
- **Use `Intl` for anything formattable.** `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`, `Intl.ListFormat`, `Intl.Collator` for sorting. It's built in, correct, and handles currency, grouping separators and calendars you haven't thought about. With `Temporal` now standard, time-zone-correct date handling is finally straightforward (see the JavaScript guide §9.10).
- **RTL is a layout problem, not a translation problem.** `dir="rtl"` on `<html>` plus **CSS logical properties** (`margin-inline-start`, not `margin-left`) means one stylesheet works for both directions. Retrofitting this is far more expensive than starting with it (see the Modern CSS guide §10.3).
- **Load translations per locale, lazily.** Shipping every language to every user is a needless bundle cost; split by locale and load on demand.
- **Design for text expansion.** German and Finnish routinely run 30–40% longer than English; fixed-width buttons and single-line assumptions break. Test with a pseudo-locale.
- **Locale in the URL** (`/en/…`, `/de/…`) rather than only in a cookie, so pages are shareable, crawlable and cacheable per locale.
- **Translators need context.** Keys like `submit` appear in five places with five correct translations; namespaced keys plus a description field prevent that.

---

### 15.11 Events — Delegation and the Synthetic System

React attaches **one listener per event type at the root container** and dispatches to your handlers by walking the fiber tree. It does not attach a listener per element.

Why: attaching thousands of individual listeners is expensive in memory, and delegation means a handler on a newly-rendered element works immediately with no attach step.

**SyntheticEvent** is React's cross-browser wrapper around the native event, normalising differences in property names and behaviour. `e.nativeEvent` gets you the underlying event.

The consequences that get asked:

- **`e.stopPropagation()` stops propagation within React**, but the native event has already reached the root — so a native listener added with `document.addEventListener` will still fire. Mixing React handlers with manual `document` listeners produces ordering surprises, and this is the usual explanation.
- **React 17 moved the root listener** from `document` to the React root container. That was a real fix for embedding multiple React versions or a React app inside another app, where `stopPropagation` in one tree previously affected the other.
- **Event pooling was removed in React 17.** The old `e.persist()` requirement is gone, so you can read event properties asynchronously.
- **Some events don't bubble** and are attached directly (`scroll`, media events, `focus`/`blur` are exposed as bubbling `onFocus`/`onBlur` via `focusin`/`focusout`).
- **Manual delegation is rarely needed** — React already does it. Attaching one handler to a list container instead of each row is a micro-optimisation that mostly buys nothing, though it can help for very large lists by avoiding thousands of closure allocations per render.

---

## 16. React 19 Features

### 16.1 React Compiler (stable since 1.0)

React Compiler reached **1.0 on 7 October 2025** and is production-ready for both React and React Native. It is a build-time optimising compiler that inserts memoization for you, so `useMemo`, `useCallback` and `React.memo` become unnecessary in most components.

```bash
npm install --save-dev --save-exact babel-plugin-react-compiler@latest
```

```js
// vite.config.js
export default {
  plugins: [react({ babel: { plugins: ['babel-plugin-react-compiler'] } })],
};
```

**How it works.** Despite shipping as a Babel plugin, the compiler is largely decoupled from Babel: it takes Babel's AST and lowers it into its own **HIR** (high-level intermediate representation), runs data-flow analysis to determine exactly which values a component reads and which of those can change, and then emits code that caches each intermediate value in a hidden slot array keyed by its real dependencies. The result is *finer-grained* than hand-written memoization — it can memoize a single JSX subtree or one property access, where `useMemo` only works at whatever boundary you happened to wrap.

Meta's reported results: up to **12% faster** initial load and navigation, and some interactions over **2.5× faster**, with no memory increase.

**The rules it depends on.** This is the part interviewers press on, because the compiler is not magic — it is a *conditional* optimisation. It only compiles a component when it can prove the component follows the Rules of React:

- **Purity** — rendering must be idempotent. Same props and state in, same JSX out, no side effects during render.
- **Immutability** — props, state and hook return values must not be mutated. Pushing into a prop array during render breaks the analysis.
- **Rules of Hooks** — hooks called unconditionally, at the top level, in the same order.

When the compiler cannot prove those hold, it **bails out and skips that component**, silently leaving it unoptimised. So a codebase that violates the rules doesn't crash — it just quietly gets no benefit, which is much harder to notice. This is why compiler adoption is really a *lint* project: the compiler-powered rules ship in **`eslint-plugin-react-hooks` v6** (recommended preset, flat config by default), and they tell you which components bailed out and why. The correct rollout order is lint first, fix violations, then enable the compiler.

**What it does not do.** It does not replace `useTransition`, `useDeferredValue`, virtualization, or code splitting — those solve scheduling and payload problems, not re-render problems. It does not fix a component that re-renders because you recreate a context value every render at the provider. And it does not help across the network boundary.

**Migration guidance:** don't strip existing `useMemo`/`useCallback` calls preemptively — they are harmless once the compiler is on, and removing them in bulk is a large, risky diff for no measurable win. Stop *adding* new ones instead, and delete them opportunistically when you're already editing the file. Two cases still need manual memoization even with the compiler: a value whose referential identity is part of an external contract (a dependency array in a third-party hook), and a genuinely expensive computation you want cached across props changes the compiler considers relevant.

---

### 16.2 Actions and useActionState

`Actions` are React 19's answer to form handling and async mutations — they replace the manual loading/error state patterns most devs have rebuilt a hundred times.

```tsx
function UpdateName() {
  const [error, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const error = await updateName(formData.get('name'));
      if (error) return error;
      redirect('/profile');
      return null;
    },
    null
  );

  return (
    <form action={submitAction}>
      <input name="name" />
      <button disabled={isPending}>Update</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

The contract: pass an async function and an initial state; React gives you back the latest returned state, an action you wire to `<form action>` (or any element accepting an action), and an `isPending` flag. No more `useState` for the loading flag, no more `try/catch` for the error, no more "wait, did I forget to setLoading(false)?". The interview signal: know the *concept* — async transitions tied to form submission — even if the exact API is new to you.

### 16.3 useFormStatus

The companion to `useActionState`. It reads the submission status of the **nearest enclosing `<form>` from inside any descendant component** — without prop-drilling.

```tsx
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}

function ProfileForm() {
  return (
    <form action={updateProfile}>
      <input name="name" />
      <SubmitButton />          {/* knows the form is submitting */}
    </form>
  );
}
```

This is what makes Actions composable. You can build a `<SubmitButton>` once and drop it into any form; it picks up the form's submission state automatically. Pre-19, you'd have prop-drilled the loading flag from the form to every nested button.

The triad to remember as one concept: **`useActionState`** (form-level state machine), **`useFormStatus`** (descendant access to that state), **`useOptimistic`** (instant UI while the action is in flight) — together they're the modern form story.

### 16.4 use() Hook

```tsx
// Read a promise during render (with Suspense)
function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise);
  return comments.map(c => <p key={c.id}>{c.text}</p>);
}

// Read context (can be called conditionally, unlike useContext)
function Theme({ isEnabled }: { isEnabled: boolean }) {
  if (isEnabled) {
    const theme = use(ThemeContext);
    return <div className={theme} />;
  }
  return null;
}
```

### 16.5 useOptimistic

```tsx
function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, { ...newTodo, pending: true }]
  );

  async function addTodo(formData: FormData) {
    const newTodo = { title: formData.get('title') as string };
    addOptimisticTodo(newTodo);              // immediately show
    await api.createTodo(newTodo);           // send to server
  }

  return (
    <form action={addTodo}>
      <input name="title" />
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.title}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

---

### 16.6 `<Activity />` — Hide UI Without Destroying It

Shipped stable in **React 19.2**. `<Activity />` lets you mark a part of the tree as `visible` or `hidden`. A hidden activity **keeps its state** but has its **effects destroyed** — so timers stop, subscriptions close, and nothing keeps running in the background. When it becomes visible again, React restores the saved state and **re-creates the effects**.

```tsx
function App() {
  const [tab, setTab] = useState('home');

  return (
    <>
      <Activity mode={tab === 'home' ? 'visible' : 'hidden'}>
        <HomeTab />
      </Activity>
      <Activity mode={tab === 'search' ? 'visible' : 'hidden'}>
        <SearchTab />   {/* scroll position and input text survive tab switches */}
      </Activity>
    </>
  );
}
```

**Why this is not just `display: none`, and not just conditional rendering.** The three options differ on exactly two axes — does state survive, and do effects keep running:

| Approach | State | Effects | DOM |
|---|---|---|---|
| `{cond && <Tab />}` | **destroyed** | unmounted | removed |
| `style={{ display: cond ? 'block' : 'none' }}` | preserved | **keep running** | kept |
| `<Activity mode={…}>` | **preserved** | **destroyed** | kept, hidden |

Conditional rendering loses the user's scroll position, half-typed input and fetched data on every switch. CSS hiding keeps all of that but leaves intervals ticking, subscriptions open and polling running for a panel nobody can see. `<Activity />` is the combination that was previously impossible to express: **state preserved, effects torn down.**

Two details that matter in practice. First, a hidden activity is **not frozen** — "children still re-render in response to new props, albeit at a lower priority than the rest of the content." So it is cheap, not free, and the low priority is what keeps pre-rendering a likely-next tab from delaying what is on screen. Second, hiding is implemented with `display: none`, which means a component that renders only text produces no DOM output when hidden (there is no element to apply the style to).

The two canonical uses:

1. **Preserving state across navigation** — tabs, wizards, a list you return to from a detail page.
2. **Pre-rendering a likely next screen** so its data and code are already warm when the user arrives.

Traps to watch for. Because effects are destroyed, a hidden `Activity` does **not** keep a WebSocket alive or continue polling — if a hidden panel genuinely must keep receiving data, that subscription belongs *above* the `Activity` boundary. And because effect cleanup is what stops work, any effect inside an `Activity` needs a correct cleanup function or hiding leaks. For teardown that must be tied to the *visual* hide (pausing a video, for instance), use `useLayoutEffect` cleanup so it runs before the frame in which the content disappears.

---

### 16.7 `useEffectEvent` — Non-Reactive Logic Inside Effects

Also stable in **React 19.2**, and the direct answer to the single most common `useEffect` complaint: *"I need to read the latest value of something, but I don't want the effect to re-run when it changes."*

Consider a chat room that connects to a socket and shows a toast on connect:

```tsx
// The problem: theme is used in the callback, so the linter demands it in deps —
// and now changing the theme tears down and rebuilds the connection.
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const conn = createConnection(roomId);
    conn.on('connected', () => showToast('Connected!', theme));
    conn.connect();
    return () => conn.disconnect();
  }, [roomId, theme]);   // ← theme should not be here, but removing it lies to the linter
}
```

Every workaround for this was bad. Omitting `theme` from the deps array suppresses a real warning and captures a stale value. Adding it reconnects the socket on an unrelated UI change. A `useRef` mirror of `theme` works but is three lines of ceremony per value and is easy to get out of sync.

`useEffectEvent` splits the callback into a **reactive** part (the effect) and a **non-reactive** part (the event):

```tsx
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showToast('Connected!', theme);   // always reads the latest theme
  });

  useEffect(() => {
    const conn = createConnection(roomId);
    conn.on('connected', () => onConnected());
    conn.connect();
    return () => conn.disconnect();
  }, [roomId]);   // ← honest and complete: only roomId is reactive
}
```

The function returned by `useEffectEvent` is **stable across renders** (so it never needs to be a dependency) but its body always sees the **latest** props and state (so it is never stale). It gives you the two properties that `useCallback` and `useRef` could only ever give you one of at a time.

Rules that come up as interview questions:

- It may only be **called from inside an effect** (or another effect event), never during render and never passed to a child as a prop. Doing so is a lint error, because a value that is stable *and* always-fresh has no consistent meaning during render.
- The linter in `eslint-plugin-react-hooks` v6 **knows** about it and correctly omits effect events from dependency arrays — that tooling support is what makes it usable rather than another footgun.
- The mental test: *does this logic describe when to synchronise (reactive → dependency), or what to do when something happens (non-reactive → effect event)?* Connecting to `roomId` is synchronisation. Showing a toast is an event.

This complements — not replaces — §7.4's advice. The first question is still "should this be an effect at all?" `useEffectEvent` is for the effects that survive that question.

---

### 16.8 React 19.2's Rendering and SSR Changes

Several 19.2 changes are invisible in application code but are exactly what a senior interview probes.

**Partial Pre-rendering.** A new pair of APIs lets you pre-render the static shell of a page at build time, then *resume* rendering the dynamic parts later — at request time on a server, or during a subsequent build. You `prerender()` with an `AbortController`, which stops rendering at the dynamic boundaries and hands back both the static HTML and a serialisable "postponed" state; later, `resume()` / `resumeToPipeableStream()` (SSR) or `resumeAndPrerender()` (SSG) picks up exactly where it left off.

```js
// Build time — render the static shell, abort at dynamic boundaries
const controller = new AbortController();
const { prelude, postponed } = await prerender(<App />, { signal: controller.signal });

// Request time — resume from the saved state
const stream = await resume(<App />, postponed);
```

The point is that a page no longer has to be *entirely* static or *entirely* dynamic. The shell is served instantly from a CDN, and only the personalised holes are computed per request. This is the primitive underneath Next.js's PPR.

**Batched Suspense reveals in SSR.** Previously, server-rendered `Suspense` boundaries revealed themselves one at a time as each one's HTML arrived, while client-rendered boundaries batched their reveals. That inconsistency produced visible layout thrash on streamed pages, and it made animating a reveal impossible. 19.2 batches server reveals to match client behaviour — fewer, larger paint steps, and a coherent target for `<ViewTransition>` to animate.

**Web Streams in Node.** `renderToReadableStream()` and `prerender()` now work under Node, though the Node Streams APIs remain the recommended choice there. This matters for code that must run on both Node and an edge runtime.

**`cacheSignal()`** (React Server Components only) gives you an `AbortSignal` that fires when a `cache()` lifetime ends, so you can abort in-flight work instead of leaking it:

```js
async function getData(id) {
  return fetch(`/api/${id}`, { signal: cacheSignal() });
}
```

**Performance Tracks.** React now emits custom tracks into the Chrome DevTools performance panel — a **Scheduler** track showing what React was working on at each priority, and a **Components** track showing which components rendered and for how long. Being able to say "I'd open the Scheduler track to see whether the work was being starved by a higher-priority lane, rather than guessing from the flame chart" is a strong performance-debugging answer.

**`useId` prefix change.** The generated prefix moved from `:r:` to `_r_`. The old form contained a colon, which is invalid in XML 1.0 and — more practically — is not a valid `view-transition-name`, so it blocked View Transitions. Only relevant if you had snapshot tests asserting on generated IDs, which is itself a bad idea.

---

### 16.9 Where React Actually Is — Versions and Experimental Status

Interviewers ask this to check whether you track the ecosystem or just repeat blog posts.

| | Status |
|---|---|
| **Latest stable** | React **19.2.x** (19.2 shipped Oct 2025; patch releases through 2026). There is no 19.3 or 20 |
| **React Compiler** | **1.0, stable** (Oct 2025). Production-ready, opt-in |
| **`eslint-plugin-react-hooks`** | **v6** — flat config by default, includes compiler-powered rules |
| **`<Activity />`, `useEffectEvent`, `cacheSignal`, Partial Pre-rendering** | **Stable in 19.2** |
| **`<ViewTransition>`, `addTransitionType`, Fragment Refs** | **Canary only** — still experimental |

That last row is the one worth being careful about. A great deal of 2026 writing treats `<ViewTransition>` as shipped because it appears in React Labs posts and in canary-tracking frameworks. It is not in a stable release. The correct answer to "how would you animate a route transition in React today?" is either the **browser's** View Transitions API (`document.startViewTransition`) driven from your router, or your framework's wrapper — not React's `<ViewTransition>`, unless you have deliberately pinned a canary.

---

## 17. Interview Questions & Answers

### Beginner

---

**Q1: What is the Virtual DOM?**

The Virtual DOM is a lightweight JavaScript representation of the actual DOM. When state changes:
1. React creates a new Virtual DOM tree
2. Diffs it against the previous one (reconciliation)
3. Calculates the minimum set of changes needed
4. Applies only those changes to the real DOM (commit phase)

This is faster than directly manipulating the DOM because DOM operations are expensive, and batching/minimizing them improves performance.

---

**Q2: What is the difference between state and props?**

- **Props**: External data passed from parent to child. Read-only. The child cannot modify them.
- **State**: Internal data owned by the component. Mutable via `setState`/`useState`. Changes trigger re-renders.

Props flow down (parent -> child). State is local. A parent's state often becomes a child's props.

---

**Q3: What is JSX?**

JSX is a syntax extension for JavaScript that looks like HTML. It allows you to write UI structure directly in JavaScript. JSX is compiled to `React.createElement()` calls by tools like Babel or the TypeScript compiler.

```tsx
<h1 className="title">Hello</h1>
// becomes
React.createElement('h1', { className: 'title' }, 'Hello')
```

---

**Q4: What are keys in React and why are they important?**

Keys are unique identifiers for elements in a list. They help React identify which items have changed, been added, or removed during reconciliation.

```tsx
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

Without keys (or with index as key), React may re-render or reorder elements incorrectly, causing bugs with state and performance issues.

---

**Q5: What is the difference between controlled and uncontrolled components?**

- **Controlled**: React state is the single source of truth. Input value is set by state and updated via onChange handler.
- **Uncontrolled**: DOM is the source of truth. Use `ref` to read values when needed.

```tsx
// Controlled
<input value={name} onChange={e => setName(e.target.value)} />

// Uncontrolled
<input ref={inputRef} defaultValue="" />
```

Controlled is preferred for most cases (validation, formatting, conditional disabling).

---

### Intermediate

---

**Q6: Explain the useEffect hook and its dependency array.**

`useEffect` runs side effects after render. The dependency array controls when:

- **No array**: runs after every render
- **Empty array `[]`**: runs once on mount, cleanup on unmount
- **With dependencies `[a, b]`**: runs when a or b changes

```tsx
useEffect(() => {
  const sub = subscribe(userId);
  return () => sub.unsubscribe();          // cleanup
}, [userId]);                               // re-run when userId changes
```

The cleanup function runs before the next effect and on unmount — used for unsubscribing, clearing timers, cancelling requests.

---

**Q7: What is the difference between useMemo and useCallback?**

Both memoize values to avoid unnecessary recalculation:
- `useMemo(() => value, [deps])`: Memoizes a **computed value**
- `useCallback((args) => fn(args), [deps])`: Memoizes a **function reference**

`useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

Use `useMemo` for expensive computations. Use `useCallback` when passing callbacks to memoized children (with React.memo) to prevent unnecessary re-renders.

Note: With the React Compiler (React 19+), manual memoization is often unnecessary.

---

**Q8: How does React reconciliation work?**

Reconciliation is React's algorithm for efficiently updating the DOM:

1. When state/props change, React creates a new Virtual DOM tree
2. Compares it with the previous tree (diffing)
3. Uses heuristics for O(n) complexity:
   - Different element types -> rebuild entire subtree
   - Same element type -> update only changed attributes
   - Keys help match elements in lists (reorder instead of recreate)
4. Batches all DOM updates and applies them in one commit

---

**Q9: Explain the Context API and when to use it.**

Context provides a way to pass data through the component tree without prop drilling. It consists of:
1. `createContext()` — creates the context
2. `Context.Provider` — wraps components that need access
3. `useContext()` — consumes the value

Best for: theme, locale, auth user, feature flags — data that many components need but doesn't change frequently.

Not ideal for: frequently updating data (every consumer re-renders on change). Use state management libraries for that.

---

**Q10: What is the difference between `useEffect` and `useLayoutEffect`?**

- `useEffect`: Runs **asynchronously** after the browser has painted. Non-blocking. Use for most side effects (data fetching, subscriptions, logging).
- `useLayoutEffect`: Runs **synchronously** after DOM mutations but before the browser paints. Blocking. Use when you need to read layout (measurements) or make DOM changes before the user sees them.

```tsx
// useLayoutEffect: measure and position before paint
useLayoutEffect(() => {
  const rect = ref.current.getBoundingClientRect();
  setPosition({ top: rect.top, left: rect.left });
}, []);
```

If you're not sure which to use, use `useEffect`.

---

### Advanced

---

**Q11: How do you prevent unnecessary re-renders?**

1. **React.memo**: Skip re-render if props haven't changed
2. **useMemo/useCallback**: Stabilize references passed as props
3. **State colocation**: Keep state close to where it's used
4. **Component splitting**: Break large components so state changes only affect relevant parts
5. **Context splitting**: Separate frequently-changing context from stable context
6. **Avoid inline objects/arrays in JSX**: `style={{ color: 'red' }}` creates new object every render

Profile with React DevTools Profiler before optimizing — premature optimization is the root of all evil.

---

**Q12: Explain React Fiber architecture.**

Fiber is React's internal reconciliation engine (since React 16). Key concepts:

- **Fiber node**: A unit of work representing a component. Each component has a fiber.
- **Work loop**: Processes fibers incrementally, can pause and resume
- **Priority scheduling**: High-priority updates (user input) interrupt low-priority updates (data fetching)
- **Two phases**:
  - **Render phase**: Builds new fiber tree, calculates changes (can be interrupted)
  - **Commit phase**: Applies changes to DOM (cannot be interrupted, synchronous)

Fiber enables: concurrent rendering, Suspense, transitions, and time-slicing.

---

**Q13: What are React Server Components (RSC)?**

Server Components run on the server and send rendered HTML + serialized data to the client. They:
- Can access server resources directly (database, file system)
- Don't add to the client JavaScript bundle
- Cannot use state, effects, or event handlers
- Can import and render Client Components

```tsx
// Server Component (default in App Router)
async function UserList() {
  const users = await db.users.findAll();   // direct DB access
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// Client Component (opt-in)
'use client';
function Counter() {
  const [count, setCount] = useState(0);    // state requires client
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

---

**Q14: How would you handle global state without Redux?**

Multiple approaches:

1. **Context + useReducer**: Built-in, good for moderate complexity
2. **Zustand**: Minimal, hook-based, no provider needed
3. **Jotai**: Atomic state model, bottom-up approach
4. **React Query**: For server state (API data)
5. **useSyncExternalStore**: Subscribe to external stores

```tsx
// Zustand example
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

function Counter() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}
```

---

**Q15: Explain the difference between `useTransition` and `useDeferredValue`.**

Both mark updates as non-urgent (low priority), allowing urgent updates (like typing) to not be blocked.

- **useTransition**: Wraps a state update to mark it as non-urgent
  ```tsx
  const [isPending, startTransition] = useTransition();
  startTransition(() => setSearchResults(expensiveFilter(query)));
  ```

- **useDeferredValue**: Defers a value — shows the old value while the new one is computing
  ```tsx
  const deferredQuery = useDeferredValue(query);
  // deferredQuery lags behind query, keeping UI responsive
  const results = expensiveFilter(deferredQuery);
  ```

Use `useTransition` when you control the state update. Use `useDeferredValue` when you receive a value from a prop or parent.

---

**Q16: What is Suspense and how does it work?**

Suspense lets components "wait" for something before rendering, showing a fallback in the meantime.

```tsx
<Suspense fallback={<Spinner />}>
  <LazyComponent />                         // code splitting
  <DataComponent />                         // data fetching (with use() or React Query)
</Suspense>
```

How it works internally:
1. A child component "suspends" by throwing a Promise
2. React catches it, shows the fallback
3. When the Promise resolves, React re-renders the child with the data

Use cases: lazy loading, data fetching, nested loading states, streaming SSR.

---

**Q17: How does the React Compiler work?**

The React Compiler (React 19) automatically optimizes components at build time:

1. Analyzes component code at compile time
2. Identifies values that need memoization
3. Inserts `useMemo` and `useCallback` equivalents automatically
4. Memoizes JSX elements that haven't changed

This means you no longer need to manually write `useMemo`, `useCallback`, or `React.memo` — the compiler handles it. It's a Babel plugin that runs during build.

Requirements: Components must follow the rules of React (pure rendering, no side effects during render).

---

**Q18: How would you implement error boundaries?**

Error boundaries catch JavaScript errors in the component tree below them and display a fallback UI instead of crashing the whole app.

```tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error boundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<p>Something went wrong</p>}>
  <RiskyComponent />
</ErrorBoundary>
```

Error boundaries must be class components (no hook equivalent yet). They catch rendering errors, lifecycle errors, and constructor errors — but NOT event handler errors, async errors, or SSR errors.

---

### Performance & Tooling

---

**Q19: What are the Core Web Vitals and which one is most affected by React-specific issues?**

The three Core Web Vitals are **LCP** (Largest Contentful Paint, load speed), **INP** (Interaction to Next Paint, responsiveness — replaced FID in March 2024), and **CLS** (Cumulative Layout Shift, visual stability).

- **LCP** is mostly about network and image work — large bundles delay it because the browser parses JS before painting hydrated content.
- **INP** is the one React apps fail most often. Long tasks triggered by re-renders, expensive event handlers, or hydration block input. Measure it with `web-vitals` in production, not Lighthouse — synthetic tools underestimate INP.
- **CLS** comes from images/embeds without explicit dimensions, late-loading fonts, and dynamically inserted content. Fix with reserved space (`width`/`height`, `aspect-ratio`, skeletons).

Track all three with the `web-vitals` library and ship them to your analytics endpoint.

---

**Q20: How does React DevTools Profiler help you find performance issues?**

The Profiler records a session of renders and shows a flamegraph: each component's bar width = time spent rendering it. Workflow:

1. Start a recording, perform the slow interaction, stop.
2. Switch to the **Ranked** view to sort components by render time.
3. Click a component in the flamegraph — the right panel shows *why* it rendered (props change, state change, hook change, parent re-rendered).
4. Enable "Highlight updates when components render" (settings) for a real-time visual.

It tells you which renders are slow and which are unnecessary, but not why a particular line of code is slow — for that, use the Chrome Performance tab and look at the JS flamechart inside the slow component.

---

**Q21: What is a bundle analyzer and what should you look for?**

A bundle analyzer visualizes the production bundle as a treemap, with each rectangle sized by bytes. It shows which modules are eating the budget. For Vite/Rollup use `rollup-plugin-visualizer`; for Webpack use `webpack-bundle-analyzer`; for any output with source maps use `source-map-explorer`.

Things to chase down on every release:

1. Duplicate copies of the same library (often two React versions or two lodash versions).
2. Whole libraries imported for one helper — `import _ from 'lodash'` ships ~70 KB; use `import { debounce } from 'lodash-es'`.
3. `moment.js` (~70 KB) — replace with `date-fns` (~5 KB tree-shaken) or `dayjs` (~2 KB).
4. Entire icon packs — import only the icons you use.
5. Polyfills shipped to modern browsers (check `browserslist`).
6. Source maps accidentally bundled into JS chunks.

---

**Q22: Webpack vs Vite — when do you pick which?**

| | Webpack | Vite |
|---|---|---|
| Dev server | Bundles before serving | Native ESM, no bundling |
| Cold start | Slow on big apps (seconds-to-minutes) | Sub-second |
| HMR | Module-graph rebuild | Per-module, near-instant |
| Production | Webpack itself | Rollup |
| Config | Verbose, plugin-heavy | Minimal defaults |
| Plugin ecosystem | Largest in JS tooling | Growing (Rollup-compatible) |

**Pick Vite** for new projects, fast feedback loops, and standard React apps — it's the default in 2025+.
**Pick Webpack** when you have heavy custom transforms (legacy Babel pipelines, Module Federation in micro-frontends), or when you're already deep into a Webpack codebase and migration risk outweighs the dev-experience win. Webpack 5's persistent caching narrowed the cold-start gap, but per-module HMR is still Vite's edge.

---

**Q23: How does tree shaking work and what breaks it?**

Tree shaking is the bundler's removal of unused exports from the final bundle. It depends on **static analysis of ES modules** — bundlers must be able to prove an export is unused without running the code.

What breaks it:

1. **CommonJS imports** (`require`) — dynamic by design, not statically analyzable.
2. **Default-importing a whole library**: `import _ from 'lodash'` — there's nothing to shake; you used the whole namespace.
3. **`sideEffects: true`** in `package.json` (the default if absent) — bundler assumes the file mutates global state and keeps it.
4. **Transpiling ESM down to CommonJS** before the bundler sees it (old Babel configs).
5. **Re-exports through barrel files** that re-export modules with side effects.

Fixes: use named ESM imports (`import { debounce } from 'lodash-es'`), set `"sideEffects": false` (or whitelist the few side-effectful files like CSS), and let the bundler consume ESM directly.

---

**Q24: What's the difference between `useTransition` and `useDeferredValue` from a performance perspective?**

Both schedule work as non-urgent so urgent updates (like a controlled input) stay responsive. The difference is **what you wrap**:

- `useTransition` wraps a **state setter call**. You own the slow update and you mark it as non-urgent: `startTransition(() => setQuery(value))`.
- `useDeferredValue` wraps a **value**. You don't control where the slow consumer is — you just hand it a stale-but-recent version of the value, and React will re-render the consumer with the latest value when it has spare time.

Rule of thumb: if the slow work is *your* `setState`, use `useTransition`. If it's a derived computation in a child you can't easily change, pass `useDeferredValue(input)` to it. Both also expose an `isPending` signal (directly from `useTransition`, indirectly via `value !== deferredValue` for `useDeferredValue`) so you can show a spinner without blocking the input.

---

**Q25: How would you reduce a 2 MB initial JS bundle on a React app?**

Walk through this in priority order — each step usually finds at least one offender:

1. **Run a bundle analyzer** to see who's actually big. Don't optimize blind.
2. **Route-based code splitting** with `React.lazy` + `<Suspense>`. The login page should not download the dashboard's chart library.
3. **Component-level splitting** for heavy widgets (rich text editors, charts, maps, video players) — load only when the user clicks the button.
4. **Replace heavy deps**: `moment` → `date-fns`/`dayjs`; `lodash` → `lodash-es` with named imports; `chart.js` is often replaceable with a lighter chart lib.
5. **Tree-shake aggressively**: named ESM imports, `sideEffects: false`, ESM builds of dependencies.
6. **Drop polyfills** the modern browser doesn't need — set `browserslist` to a recent baseline.
7. **Manual chunks** in Vite/Rollup so vendor libs land in a long-lived cached file separate from app code.
8. **Compression on the server** (Brotli > gzip) — not strictly a bundle reduction but cuts ~70% off the wire size.
9. **Server Components / SSR** for content that doesn't need to ship as JS at all.

Measure LCP and INP before/after — bytes saved is a proxy; what users feel is what matters.

---

**Q26: How do you debug an unnecessary re-render that the Profiler flagged?**

Open the Profiler, click the offending render, and read the "Why did this render?" panel — it lists which prop, state, hook, or context value changed. Then:

1. **Prop changed but value looks the same** — the parent is creating a new object/array/function reference each render. Hoist it, `useMemo` it, or `useCallback` the function. The child can be wrapped in `React.memo` to bail out on shallow-equal props.
2. **Context changed** — the provider's `value` is a new object each render. Memoize it, or split the context so unrelated consumers don't fan out.
3. **Hook (state) changed** — the state itself updated; verify it's actually a new value and not `setState` being called with an equal object (primitives bail out automatically; objects don't).
4. **Parent re-rendered** — your component isn't memoized. Wrap with `React.memo` if it's pure and props are stable; or move state down so the parent doesn't re-render in the first place.

The React Compiler (React 19) handles most of this automatically when enabled — but knowing the underlying cause is still essential for debugging compiled output and for codebases that haven't adopted it yet.

---

**Q27: React Compiler 1.0 is stable. Do you still need `useMemo` and `useCallback`, and how would you roll it out on an existing codebase?**

Mostly no, but the interesting part is the exceptions and the rollout.

The compiler analyses each component, lowers it to its own intermediate representation, and emits memoization at a **finer grain** than you can write by hand — it can cache one JSX subtree or a single property access, whereas `useMemo` only works at the boundary you happened to wrap. So for ordinary "this object literal is a new reference every render" problems, it is strictly better than manual memoization.

Two cases still need you:

1. **Referential identity as an external contract.** If a third-party hook takes a dependency array, or an imperative API (an observer, a map instance, an event listener) needs the *same* reference across renders, you want an explicit `useMemo`/`useRef` because the requirement is semantic, not an optimisation the compiler is free to skip.
2. **Genuinely expensive computation** you want cached across changes the compiler considers relevant — the compiler memoizes on *correct* dependencies, which is not always the *coarsest safe* dependency set.

The rollout order is the real answer, and it follows from how the compiler fails. It only compiles a component when it can prove purity, immutability and the Rules of Hooks; when it can't, it **bails out and silently leaves that component unoptimised**. Nothing breaks — you just get no benefit, invisibly. So:

1. **Lint first.** The compiler-powered rules ship in `eslint-plugin-react-hooks` **v6** (recommended preset, flat config by default). They report which components would bail out and why.
2. **Fix the violations** — mutation of props or state during render, side effects in render bodies, conditional hooks.
3. **Then enable the compiler**, and check the build output for remaining bail-outs.
4. **Don't bulk-delete existing `useMemo`/`useCallback`.** They are harmless once the compiler is on, and a mass removal is a large, risky diff for no measurable gain. Stop adding new ones; delete opportunistically while editing.

Finally, name what it does *not* solve: it doesn't replace `useTransition`/`useDeferredValue` (scheduling), virtualization (DOM volume), or code splitting (payload), and it won't save you from recreating a context value at the provider every render.

---

**Q28: What is `<Activity />` and when would you use it over conditional rendering or `display: none`?**

`<Activity mode="visible" | "hidden">` (stable in React 19.2) is a boundary that **preserves state while destroying effects**. That combination was previously impossible to express:

| Approach | State | Effects |
|---|---|---|
| `{cond && <Tab />}` | destroyed | unmounted |
| `display: none` | preserved | **keep running** |
| `<Activity>` | **preserved** | **destroyed** |

Conditional rendering throws away scroll position, half-typed input and fetched data every time the user switches tabs. CSS hiding keeps all of that, but leaves intervals ticking, sockets open and polling running for something nobody can see — which is a battery and bandwidth problem as much as a CPU one.

Use it for tabs, multi-step wizards, and a list you navigate back to from a detail view. The second use is **pre-rendering**: render the screen the user is likely to open next inside a hidden `Activity`, and React renders it at a lower priority so it never competes with visible content.

Details that distinguish a good answer: a hidden activity is not frozen — its children still re-render on new props, just at low priority, so it is cheap rather than free. Hiding uses `display: none`, so a component rendering bare text produces no DOM when hidden. And because *effect cleanup* is the mechanism that stops the work, every effect inside an `Activity` needs a correct cleanup function or hiding leaks. For teardown tied to the visual hide — pausing a video — use `useLayoutEffect` cleanup.

---

**Q29: What problem does `useEffectEvent` solve, and when should you not use it?**

It resolves the tension between an *honest* dependency array and a *fresh* value. Some logic inside an effect is **reactive** (changing it should re-run the effect) and some is not (it should just read the latest value). Before 19.2, the dependency array couldn't express that distinction, so you had three bad options: omit the value and lie to the linter while capturing a stale closure; include it and re-run the effect on an unrelated change; or mirror it into a `useRef` by hand.

```tsx
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => showToast('Connected!', theme));

  useEffect(() => {
    const conn = createConnection(roomId);
    conn.on('connected', () => onConnected());
    conn.connect();
    return () => conn.disconnect();
  }, [roomId]);   // honest AND complete — theme is not reactive here
}
```

The returned function is **stable across renders** (so it never belongs in a dependency array) but its body always reads the **latest** props and state (so it is never stale). `useCallback` gives you stability at the cost of staleness; a plain inline function gives freshness at the cost of stability. `useEffectEvent` is the only thing that gives both.

**When not to use it.** Two situations:

- **When the logic actually is reactive.** Wrapping the connection setup itself in an effect event and leaving `deps` empty means switching rooms never reconnects — a silent bug that looks like a working dependency array. The test to apply: *does this describe when to synchronise, or what to do when something happens?* Synchronisation is reactive and belongs in deps. Events are not.
- **When you shouldn't have an effect at all.** `useEffectEvent` makes awkward effects tolerable, which makes it tempting as a way to keep an effect that should have been derived state, a render-time computation, or an ordinary event handler. §7.4's question comes first.

It also has a hard restriction: effect events may only be called **from inside effects** (or other effect events), never during render and never passed down as a prop. A value that is both stable and always-fresh has no coherent meaning during render, so the linter forbids it.

---

**Q30: What is Partial Pre-rendering and what problem does it solve?**

Before it, a page had to be *entirely* static or *entirely* dynamic. If one component needed per-request data — a user's name in the header, a personalised price — the whole route dropped out of static generation and every visitor paid for a full server render, even though 95% of the markup was identical for everyone.

React 19.2 added the primitives that break that all-or-nothing choice. You `prerender()` with an `AbortController`; rendering stops at the dynamic boundaries and returns both the static HTML **and** a serialisable "postponed" state describing where it stopped:

```js
// Build time
const controller = new AbortController();
const { prelude, postponed } = await prerender(<App />, { signal: controller.signal });

// Request time — resume exactly where it stopped
const stream = await resume(<App />, postponed);
```

`resume()` / `resumeToPipeableStream()` finish the render on a server per request; `resumeAndPrerender()` / `resumeAndPrerenderToNodeStream()` finish it in a later build for SSG.

The user-visible payoff: the static shell ships from a CDN edge immediately — great LCP and no server round trip for the layout — and the personalised holes stream in as `Suspense` boundaries resolve. You get static-site latency with dynamic-page capability. This is the primitive that Next.js's PPR is built on, which is why the framework question and the React question have the same answer underneath.

Related 19.2 change worth pairing it with: server-rendered `Suspense` boundaries now **batch** their reveals to match client behaviour. Previously each boundary revealed as its HTML arrived, causing visible layout thrash on streamed pages; batching means fewer, larger paint steps.

---

### Rapid-Fire Fundamentals

These get asked constantly, usually as a quick screen before the harder questions.

---

**Q31: What is the difference between a React Component, a React Element, and a React Node?**

A **Component** is the blueprint — a function that returns UI. An **Element** is the lightweight, immutable object that a JSX expression produces, describing *what* to render. A **Node** is anything React can render at all.

```tsx
const Button = () => <button/>;         // Component — a function
const el = <Button />;                  // Element   — { type: Button, props: {}, key, ref }
const node = [el, 'text', null, 42];    // Node      — all of these are renderable
```

The consequences that matter. **`<Button />` is not a call to `Button()`** — it's `createElement(Button, …)`, a plain object React will call *later*, and may choose never to call. That's what makes conditional rendering and bailing out possible. **Elements are immutable**: you describe a new one instead of mutating an existing one, which is the foundation of the whole render model. And in TypeScript, `React.ReactNode` is the type you want for `children`, because it's the permissive one — `ReactElement` rejects a string child, which is a very common typing mistake.

---

**Q32: Why should you never mutate state directly?**

Three separate reasons, and interviews usually want more than "React won't re-render."

**Change detection.** React compares by reference for `useState` and in `React.memo`/`useMemo`/`useEffect` dependency checks. `state.items.push(x)` leaves the reference identical, so React concludes nothing changed and skips the re-render. `setState([...state.items, x])` gives a new reference.

**Concurrent rendering correctness.** React may start a render, abandon it, and restart. A mutation during render means the output depends on how many times the component happened to run — StrictMode's double-invoke exists precisely to expose this. React Compiler goes further and **silently skips** components that mutate props or state, so a mutation costs you the optimisation with no error.

**Debuggability.** Immutable updates give you a history of distinct states, which is what makes Redux DevTools time-travel and `useReducer` testing possible.

The modern tools: the ES2023 immutable array methods (`toSorted`, `toReversed`, `toSpliced`, `with`) exist largely to fix this — `arr.sort()` mutates and is a classic React bug, `arr.toSorted()` doesn't. Immer (built into Redux Toolkit) lets you write mutable-looking code that produces an immutable result.

---

**Q33: What are the pitfalls of the Context API, and how do you reduce Context re-renders?**

**The core pitfall: Context has no partial subscription.** Every consumer of a context re-renders when the context *value* changes, regardless of which part of the value they actually read. There's no selector mechanism.

That produces three common problems:

```tsx
// 1. A new object every render → every consumer re-renders every time
<UserContext.Provider value={{ user, setUser }}>     // ✗ new object each render
<UserContext.Provider value={useMemo(() => ({ user, setUser }), [user])}>  // ✓

// 2. Unrelated state bundled together → a theme change re-renders data consumers
// 3. High-frequency data in context → every consumer re-renders on every tick
```

The fixes, in order:

1. **Memoize the provider value** — the single most common bug, and a one-line fix.
2. **Split contexts by change frequency.** A separate `ThemeContext` and `UserContext` means a theme toggle doesn't touch user consumers. The strongest version is splitting **state from dispatch**: `dispatch` is stable, so components that only dispatch never re-render.
3. **Move children out.** Put the provider in a component whose only job is providing, and pass `children` through — then the provider re-rendering doesn't re-render the subtree, because `children` is the same element reference.
4. **Use a store for anything hot.** Zustand, Jotai or `useSyncExternalStore` give **selector-level subscriptions**, so a component re-renders only when its own slice changes. High-frequency data (a ticker, a live cursor position, form keystrokes) should never be in context.

The rule to state: **Context is a dependency-injection mechanism, not a state manager.** It's excellent for values that rarely change — theme, locale, the current user, a service instance. It's the wrong tool for frequently-changing state.

---

**Q34: How do you reset a component's state?**

Change its `key`. React's reconciler treats a different `key` at the same position as a **different component**, so it unmounts the old instance (running cleanup) and mounts a fresh one with initial state.

```tsx
// A new userId gives a completely fresh form — no effect, no manual reset
<UserProfileForm key={userId} userId={userId} />
```

This is the idiomatic answer and it replaces a very common anti-pattern:

```tsx
// ✗ The pattern the docs specifically warn against
useEffect(() => { setDraft(''); setErrors({}); setStep(0); }, [userId]);
```

The effect version renders once with stale state before correcting itself, it's easy to forget a field when someone adds one later, and it's an extra render. The `key` version is declarative and cannot go stale.

Worth adding: `key` works because of the reconciliation rule that identity is `(type, key, position)`. That's the same mechanism behind "why do I need keys in lists" and behind the bug where using an array **index** as a key causes state to be reused by the wrong row after a reorder or deletion. Same rule, three consequences.

---

**Q35: What is hydration, and what causes a hydration mismatch?**

**Hydration** is React attaching to server-rendered HTML: rather than creating DOM nodes, it walks the existing markup, builds its fiber tree against it, and wires up event listeners. That's what gives you fast first paint *and* interactivity.

A **mismatch** is when the client's first render produces different markup than the server sent. React logs an error and, in the worst case, discards the server HTML and re-renders client-side — losing the performance benefit entirely.

The usual causes are all the same underlying mistake — **rendering something that isn't the same on both sides**:

```tsx
new Date().toLocaleTimeString()   // different at server-render time vs hydrate time
Math.random()                     // obviously
localStorage.getItem('theme')     // doesn't exist on the server
window.innerWidth                 // same
navigator.userAgent               // browser-only, or differs
```

Plus **invalid HTML nesting** — a `<div>` inside a `<p>`, or a `<p>` inside a `<p>` — because the browser's parser *rewrites* the DOM to be valid, so what React finds isn't what the server sent. This one is sneaky because your JSX looks fine.

The fixes: read browser-only values in an **effect** (so the first render matches the server), use `useSyncExternalStore` with a server snapshot for external state, `suppressHydrationWarning` for genuinely-unavoidable cases like a timestamp, and `useId` instead of any hand-rolled ID generation. In Next.js, `next/dynamic` with `ssr: false` for a component that fundamentally cannot render on the server. And React's `onRecoverableError` is how you catch these in production — hydration mismatches are a classic low-percentage, environment-dependent bug (see the Frontend Architecture guide §8).

---

**Q36: How do you test a React application?**

Layered, with most of the weight low down.

**Component tests with Testing Library** are the bulk. The guiding principle is to test what the **user** experiences, not implementation details — query by role and accessible name, fire real user interactions, assert on visible output:

```tsx
render(<LoginForm onSubmit={fn} />);
await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
expect(fn).toHaveBeenCalledWith({ email: 'a@b.com' });
```

A real side benefit worth mentioning: `getByRole(..., { name })` **fails if the element has no accessible name**, so writing queries the recommended way turns accessibility failures into test failures.

**Runner:** Vitest for a Vite project (same config, much faster), Jest otherwise. **Network:** MSW to intercept at the network layer rather than mocking your fetch wrapper — that way the test exercises your real data code. **E2E:** Playwright for critical flows only, because they're slow and flaky relative to their coverage. **Accessibility:** `jest-axe` per component, `@axe-core/playwright` on key pages.

What **not** to test: implementation details (state variable names, whether a specific hook was called), snapshot tests of large trees (they fail on every change and get blindly updated, so they assert nothing), and third-party library internals.

For **hooks**, use `renderHook`. For **Server Components**, unit-test the data functions directly and cover the rendered result with E2E — the component-testing story there is still immature, and saying so is more honest than pretending otherwise.

---

**Q37: What are the common pitfalls of data fetching in React?**

The list, roughly in order of how often it appears in real codebases:

1. **`useEffect` fetching at all.** It's a round trip *after* hydration, so it's a guaranteed waterfall. Fetch on the server (RSC/loader) or use a query library. The React docs are explicit that `useEffect` is the wrong tool for this.
2. **No cleanup → race conditions.** Two rapid searches can resolve out of order and render the older result. Fix with an `AbortController` or an `ignore` flag in the cleanup.
3. **Waterfalls from nesting.** A parent fetches, renders a child, and *then* the child fetches. Hoist the requests and run them in parallel, or fetch at the route level.
4. **Missing states.** Loading, empty, error and stale are four distinct states, and most hand-rolled fetching handles two.
5. **Treating server state as client state.** Putting fetched data in Redux or Context means you now own caching, invalidation, deduplication, retry and refetch-on-focus. That's what TanStack Query or RTK Query exist for — this server/client state distinction is the most important one in modern React data handling.
6. **No deduplication.** Three components mounting and each fetching the same endpoint.
7. **Fetching in a loop** — the N+1 problem, client-side.
8. **Storing derived data** in state and letting it drift from its source instead of computing it during render.

```tsx
// The minimum correct hand-rolled version
useEffect(() => {
  let ignore = false;
  const ctrl = new AbortController();
  fetch(url, { signal: ctrl.signal })
    .then(r => r.json())
    .then(d => { if (!ignore) setData(d); })
    .catch(e => { if (e.name !== 'AbortError' && !ignore) setError(e); });
  return () => { ignore = true; ctrl.abort(); };
}, [url]);
```

Which is a good argument for the answer: **don't hand-roll it.** That's the minimum for one request, and it still has no caching, no dedupe and no retry.

---

**Q38: What changed with `forwardRef` in React 19?**

**`ref` is now an ordinary prop** for function components, so `forwardRef` is no longer needed:

```tsx
// React 19
function Input({ ref, ...props }: InputProps & { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}

// Before React 19
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input ref={ref} {...props} />
));
```

`forwardRef` still works and is deprecated rather than removed, with a codemod available. Don't churn a large codebase for it; stop reaching for it in new code.

Two related points worth knowing. **`ref` callbacks can now return a cleanup function**, which replaces the awkward "call the callback with `null` on unmount" pattern:

```tsx
<div ref={(node) => {
  const obs = new ResizeObserver(fn); obs.observe(node);
  return () => obs.disconnect();          // React 19: cleanup from a ref callback
}} />
```

And **`useImperativeHandle`** is unchanged and still the right tool when you want to expose a *narrow* API (`{ focus, scrollIntoView }`) rather than the raw DOM node — which you usually should, because handing consumers the element makes every internal detail part of your public contract.

---

**Q39: When would you use `useReducer` instead of `useState`?**

When the **transitions** matter more than the values. Four concrete signals:

1. **Multiple pieces of state change together.** A fetch sets `loading`, `data` and `error` in a single coherent transition; three `useState` calls let you produce impossible combinations like `loading: true` with `error` set.
2. **The next state depends on the previous state in a non-trivial way** — a multi-step wizard, an undo stack, a form with interdependent validation.
3. **You want the update logic outside the component**, because a reducer is a pure function and therefore trivially unit-testable without rendering anything.
4. **You want to pass `dispatch` down instead of many callbacks.** `dispatch` is **referentially stable**, so it never breaks memoization and never needs to be a dependency — that alone often justifies the switch.

```tsx
type State = { status: 'idle' | 'loading' | 'success' | 'error'; data?: Data; error?: string };
// The union makes impossible states unrepresentable — the real win
```

The last point is the strongest: modelling state as a **discriminated union** in a reducer makes invalid combinations impossible to express, which is a design win rather than an ergonomics one. And `useReducer` plus Context is the standard "Redux-lite" pattern — though for genuinely global state, a store with selector subscriptions (Zustand, Jotai) avoids the Context re-render problem from Q33.

---

**Q40: When do you need `useId`?**

Whenever you need a **stable, unique, SSR-safe** identifier to wire elements together with ARIA or `for`/`id`:

```tsx
function Field({ label, error }) {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-describedby={error ? `${id}-err` : undefined} aria-invalid={!!error} />
      {error && <p id={`${id}-err`} role="alert">{error}</p>}
    </>
  );
}
```

Why not the alternatives: a **hard-coded ID** collides when the component renders twice on a page, which silently breaks the label association and — because `aria-labelledby` resolves to the *first* matching ID — can point at the wrong element. A **`Math.random()` or counter-based ID** produces a different value on the server than on the client, which is a hydration mismatch.

`useId` is generated from the component's position in the tree, so it's identical on both sides. Generate one ID per component and derive related ones by suffix (`${id}-err`) rather than calling `useId` repeatedly.

What it is **not** for: list keys (use your data's identity) or any ID that needs to be meaningful or stable across sessions. And a detail worth knowing: the generated prefix changed from `:r:` to `_r_` in React 19.2, because a colon is not a valid `view-transition-name` — which only matters if you had snapshot tests asserting on generated IDs, itself a bad idea.

---

**Q41: What does "re-rendering" actually mean, and what triggers it?**

A re-render means React **calls your component function again** to produce a new element tree, then diffs it against the previous one and applies only the differences to the DOM. **Re-render ≠ DOM update** — most re-renders produce identical output and touch nothing, which is why "too many re-renders" is only a problem when the render work itself is expensive.

Four triggers, and only four:

1. **Its own state changed** — `setState` with a value that isn't `Object.is`-equal to the current one.
2. **Its parent re-rendered.** This is the one people underestimate: by default a parent re-rendering re-renders **all** of its children transitively, whether or not their props changed. `React.memo` opts a component out via shallow prop comparison.
3. **A context it consumes changed** — and it re-renders regardless of which part of the value it reads (Q33).
4. **A hook it uses signalled a change** — `useSyncExternalStore`, or a library hook wrapping it.

Common causes of *needless* re-renders: a new object, array or function literal in props each render; an unmemoized context value; state held higher in the tree than it needs to be; `key` changing unintentionally. The diagnostic order is **Profiler first** — it tells you which component re-rendered and *why* ("props changed: onClick") — then fix the cause, not the symptom. And React Compiler handles most of the memoization automatically once enabled (§16.1), which changes the calculus: don't add manual memoization preemptively, measure first.

---

**Q42: How do you debug a React app?**

By narrowing which layer is wrong before reaching for a tool.

**React DevTools** is the first stop. The **Components** panel shows the tree with live props, state and hooks (and lets you edit them to test a hypothesis). The **Profiler** records a commit and shows what rendered, how long it took, and **why** each component rendered — "Props changed: `onClick`" is usually the whole answer to an unnecessary-re-render question. Enable "Highlight updates" to see re-renders visually, which finds problems you weren't looking for.

**React 19.2 added Performance Tracks** to the Chrome DevTools performance panel — a **Scheduler** track showing what React was working on at each priority and a **Components** track showing render durations. Being able to say "I'd check the Scheduler track to see whether the work was being starved by a higher-priority lane" is a strong performance answer, because it distinguishes "slow render" from "render never got to run."

**For state bugs:** log or inspect in the Components panel rather than adding `console.log` in the render body, which double-fires under StrictMode and misleads you. Redux DevTools' time-travel if you're using Redux or Zustand's devtools middleware.

**For "it works locally, not in production":** source maps (`hidden-source-map`), error boundaries reporting component stacks, `onRecoverableError` for hydration mismatches, and cohort segmentation — see the Frontend Architecture guide §8, since a bug affecting 1% of users is an observability problem before it's a debugging one.

**The suspects to check early**, because they account for most confusing React bugs: a stale closure in an effect or callback; a missing or wrong dependency array; `key` collisions causing state to be reused by the wrong element; state mutation defeating change detection; and an impure render exposed by StrictMode's double-invoke.

---

## 18. Tricky Output Questions

Practice questions testing your understanding of React rendering behavior, hooks quirks, state batching, and closures.

### State & Batching

---

**Q1: In a click handler that calls `setCount(count + 1)` three times and then `console.log(count)`, what does the console print on the first click and what value ends up rendered?**

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    console.log(count);
  }

  return <button onClick={handleClick}>{count}</button>;
}
```

**Output:** `0` (on first click)

**Rendered value:** `1`

**Explanation:**

This question tests two intertwined mechanisms: closure capture of state variables and React's batching of state updates inside event handlers. When `Counter` renders, React destructures the current state value `0` into the local const `count`. The `handleClick` function is re-created each render and closes over that specific `count = 0`. Because `count` is a plain constant in that render's scope, it cannot change mid-handler — there is no way for `setCount` to mutate it.

Now trace the three calls. `setCount(count + 1)` is identical to `setCount(0 + 1)` three times in a row; React simply queues "set state to 1" three times. These are all direct value updates, not functional updaters, so React does not chain them against any pending state — each call overwrites the previous one's queued value. When the handler finishes, React batches the queued updates and schedules a single re-render with the final queued value, `1`.

The `console.log(count)` runs synchronously inside the same handler, long before the re-render happens. It reads the closed-over `count`, which is still `0` from the render the handler was created in. After the handler returns, React commits the new state and re-renders the component; the button now displays `1`.

**Takeaway:** Direct `setState(value)` calls in the same handler use the stale closure value — to increment correctly, pass a functional updater.

---

**Q2: A click handler calls `setCount(prev => prev + 1)` three times in a row starting from `count = 0`. What value is rendered after the click?**

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
  }

  return <button onClick={handleClick}>{count}</button>;
}
```

**Rendered value after first click:** `3`

**Explanation:**

This is the same shape as Q1 but swaps the direct value for a functional updater, and that single change fixes the staleness problem. When you pass a function to `setState`, React does not queue a value — it queues a transformation. During the next render, React walks the update queue in order, feeding each updater the result of the previous one. The updater itself does not close over `count`; it receives the latest pending state as its `prev` argument, freshly passed in by React at flush time.

Tracing the queue: starting from committed state `0`, the first updater produces `0 + 1 = 1`. React feeds that `1` into the second updater, yielding `2`. The third updater then produces `3`. Only after all three are processed does React schedule a single re-render with the final value `3`. The three calls are still batched — the user sees exactly one render — but because each updater computes from the latest pending value rather than from a captured closure, their effects actually compound.

This is also why functional updaters are the idiomatic fix whenever the new state depends on the previous state, especially inside timers, async callbacks, or any code path where the handler could run against stale data.

**Takeaway:** When new state depends on previous state, always use `setState(prev => ...)` so React feeds you the latest pending value instead of a stale closure.

---

**Q3: A click handler interleaves direct and functional updates — `setCount(count + 1)`, then `setCount(prev => prev + 1)`, then `setCount(count + 1)` — starting from `count = 0`. What is rendered?**

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    setCount(prev => prev + 1);
    setCount(count + 1);
  }

  return <p>{count}</p>;
}
```

**Rendered value after first click:** `1`

**Explanation:**

This one demonstrates how React's update queue treats the two kinds of updates uniformly: each entry is applied in order, but a direct value update ignores whatever pending state came before it, while a functional updater computes from it. The render captured `count = 0`, so both direct calls in this handler are really `setCount(1)` — not `setCount(count + 1)` that somehow re-reads the latest value.

Walk the queue starting from base state `0`:
1. First call enqueues "set to 1". When processed, the pending state becomes `1`.
2. Second call enqueues an updater. When processed, React passes in the current pending state `1`, the updater returns `2`, and pending state becomes `2`.
3. Third call enqueues "set to 1" again (because the closure's `count` is still `0`). When processed, it overwrites the pending state back to `1`.

The final committed value is `1`, and the user sees a single re-render with `1` on screen. The subtle trap is that direct updates silently clobber any accumulated work done by earlier updaters in the same batch. Mixing the two styles in one handler is almost always a bug; pick functional updaters whenever you rely on the previous state.

**Takeaway:** Never mix direct and functional updates for the same piece of state in one handler — direct updates overwrite pending values computed by earlier updaters.

---

**Q4: A click handler runs a `for` loop that calls `setCount(prev => prev + 1)` five times. How many times does the component re-render and what does it log?**

```jsx
function App() {
  const [count, setCount] = useState(0);
  console.log("render", count);

  function handleClick() {
    for (let i = 0; i < 5; i++) {
      setCount(prev => prev + 1);
    }
  }

  return <button onClick={handleClick}>{count}</button>;
}
```

**Output on click:**
```
render 5
```

**Explanation:**

This question tests automatic batching — a foundational optimization in React. In React 18 and later, any synchronous sequence of state updates inside a single "tick" of JavaScript (event handler, effect body, promise continuation, timeout callback, etc.) is collapsed into one re-render. Earlier versions only batched inside React event handlers; 18's concurrent renderer extended batching everywhere.

When the button is clicked, React enters the event handler with its batching lock held. Each `setCount(prev => prev + 1)` appends an updater to the state queue — nothing renders mid-loop. Once the handler returns, React unlocks batching, flushes the queue by feeding each updater the previous pending value (`0 → 1 → 2 → 3 → 4 → 5`), and schedules exactly one re-render with the final value `5`. That single render logs `render 5`.

This is why you should never worry about "too many setState calls" — React already coalesces them for you. The practical rule is to keep updaters pure (no side effects inside the function you pass), because in Strict Mode and during bail-out checks React may invoke them extra times to verify correctness.

**Takeaway:** React 18 automatically batches all state updates in a single tick into one re-render, regardless of how many `setState` calls you make.

---

### useEffect & Lifecycle

**Q5: A component logs `"A"` and `"E"` in its body and has two `useEffect` calls (one with a cleanup, one mount-only) that log `"B"`/`"C"` and `"D"`. In what order do the logs appear on mount?**

```jsx
function App() {
  console.log("A: render");

  useEffect(() => {
    console.log("B: effect");
    return () => console.log("C: cleanup");
  });

  useEffect(() => {
    console.log("D: mount effect");
  }, []);

  console.log("E: render end");

  return <div>Hello</div>;
}
```

**Output on mount:**
```
A: render
E: render end
B: effect
D: mount effect
```

**Explanation:**

React's lifecycle is a sequence of distinct phases, and each kind of work runs in exactly one of them. The render phase is the synchronous execution of the component function itself — it must be pure, so React (or Strict Mode) can call it multiple times safely. All top-level code in the function body, including both `console.log` calls, runs here: first `A`, then the hook calls (which merely register effects; they do not run the effect bodies yet), then `E`.

After the render phase, React commits the result to the DOM, lets the browser paint, and then enters the effect phase. Effects fire in the order they were declared, so `B` runs before `D`. Cleanups are queued alongside effects but only execute before the next effect run or on unmount — there is nothing to clean up on the very first mount, so `C` never appears in this output.

This order matters in practice: if you need to read layout after the browser paints, use `useEffect`; if you need to read or mutate the DOM before paint (to avoid a visible flash), use `useLayoutEffect`, which fires synchronously after commit but before paint. The split between render and effect phases is also why you must never call `setState` in the render body unconditionally — it would loop forever — and why effects are the right place for subscriptions, timers, and data fetching.

**Takeaway:** Render body runs first (top-down), then effects fire after paint in declaration order; cleanups only run before the next effect or on unmount, never on initial mount.

---

**Q6: A `useEffect` with an empty dependency array starts a `setInterval` that logs `count` and calls `setCount(count + 1)` every second. What does the console print over time and what value does the UI display?**

```jsx
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count);
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <p>{count}</p>;
}
```

**Console output:** `0, 0, 0, 0, ...` (repeats forever)

**Rendered value:** Stuck at `1`

**Explanation:**

This is the canonical "stale closure in useEffect" bug, and it hinges on how dependency arrays interact with JavaScript closures. An empty `[]` tells React: "only run this effect once, on mount." React complies — it captures the effect function as it existed on the first render, runs it, and never re-creates it. But that effect function closes over the `count` identifier from the first render's scope, where `count === 0`. Nothing in the effect itself can ever see a newer `count`, because re-renders create new local `count` bindings in new function scopes that this old closure knows nothing about.

Every interval tick thus reads `count` as `0` and calls `setCount(0 + 1)`. The first tick re-renders with `count = 1`, but the interval callback still fires from the original closure. The second tick also calls `setCount(1)` — which is the same value React already has, so React bails out and skips the re-render (see Q12). The log keeps printing `0` forever and the UI is stuck at `1`.

There are two correct fixes. The minimal change is `setCount(prev => prev + 1)` — functional updaters do not need to see `count` at all, so the staleness becomes irrelevant. The more general fix is to add `count` to the dependency array so the effect tears down and re-subscribes whenever `count` changes, but for intervals that is wasteful. When you need the latest value of something inside a long-lived subscription, either use a functional updater or mirror the value into a ref and read `ref.current` inside the callback.

**Takeaway:** Effects with empty deps capture the first render's values forever — use functional updaters or refs to access the latest state inside long-lived callbacks.

---

**Q7: A `useEffect` passes `[{ key: "value" }]` as its dependency array. How often does the effect run as the component re-renders?**

```jsx
function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("effect ran");
  }, [{ key: "value" }]);

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**Output:** `"effect ran"` logs on **every** render.

**Explanation:**

React compares dependency arrays with `Object.is`, which is essentially strict equality plus correct handling of `NaN` and `-0`. For primitives like numbers and strings, `Object.is` compares by value, so stable values yield stable deps. For objects, arrays, and functions, it compares by reference — two objects with identical keys and values are considered different if they live at different memory addresses.

The literal `{ key: "value" }` is evaluated fresh inside the component function every single render. Each render produces a brand-new object with a new identity, so when React runs its dependency comparison (`Object.is(prevDep[0], nextDep[0])`), the check always returns `false`. React concludes the deps changed and re-runs the effect. The behavior is identical to omitting the array entirely.

The same trap appears with inline functions (`useEffect(..., [() => {}])`) and inline arrays (`useEffect(..., [[1, 2]])`). The fixes are: move the value outside the component so it has a stable identity, wrap it in `useMemo`/`useCallback` so React reuses the reference across renders, or — more commonly — depend on the primitive fields the effect actually uses (for instance `[config.key]` instead of `[config]`). Exhaustive-deps lint rules exist specifically to surface this kind of mistake.

**Takeaway:** Object and function dependencies are compared by reference — a fresh literal in the deps array defeats dependency tracking entirely.

---

### Closures & Refs

**Q8: A click handler calls `setCount(5)` and then schedules a `setTimeout` that logs `count` one second later. What appears in the console and what is rendered?**

```jsx
function App() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(5);
    setTimeout(() => {
      console.log(count);
    }, 1000);
  }

  return <button onClick={handleClick}>{count}</button>;
}
```

**Console output (1s later):** `0`

**Rendered value:** `5`

**Explanation:**

State in React is not a mutable variable you can re-read; it is a snapshot pinned to a specific render. When the component rendered for the first time, `useState(0)` returned the value `0` and React bound that value to the local const `count` in that particular invocation of `App`. The `handleClick` function defined in that render — and any callback defined inside it, including the `setTimeout` one — closes over that specific `count`.

When the user clicks, `setCount(5)` schedules a re-render with the new state, but it does not retroactively change any variable that already exists. React then re-invokes `App`, which produces a *new* `count` binding (this time equal to `5`) and a new `handleClick`. The button now displays `5`. However, the timeout callback scheduled one second earlier is still the one from the first render, carrying its own `count = 0` in its closure. When the timer fires, it logs `0`.

To read the latest value inside an async callback you have a few options: store the value in a `useRef` and read `ref.current` in the callback (refs are mutable containers whose identity is stable across renders), schedule the timeout inside a `useEffect` that depends on the state so a new closure is captured each time, or refactor so the callback receives the needed value as an argument. This is the same staleness pattern as Q6, just triggered by `setTimeout` rather than `setInterval`.

**Takeaway:** Every async callback captures the state values from the render that created it — use refs or functional updaters when you need the latest value.

---

**Q9: A component stores a counter in `useRef(0)` and renders `{ref.current}`. After clicking "Increment ref" three times, what does the screen show? What happens after a subsequent "Force render" click?**

```jsx
function App() {
  const ref = useRef(0);
  const [, forceRender] = useState(0);

  function handleClick() {
    ref.current += 1;
    console.log("ref:", ref.current);
  }

  return (
    <div>
      <p>Ref value: {ref.current}</p>
      <button onClick={handleClick}>Increment ref</button>
      <button onClick={() => forceRender(n => n + 1)}>Force render</button>
    </div>
  );
}
```

**After clicking "Increment ref" 3 times:**
- Console: `ref: 1`, `ref: 2`, `ref: 3`
- Screen shows: `Ref value: 0` (unchanged)

**After then clicking "Force render":**
- Screen shows: `Ref value: 3`

**Explanation:**

`useRef` and `useState` look superficially similar — both give you a per-component value that persists across renders — but they plug into two completely different parts of the React runtime. A ref is a mutable container (`{ current: X }`) whose identity is preserved across renders; React does not track reads or writes to `.current`. A state value, by contrast, is immutable from the component's perspective, and calling its setter is what informs React that it needs to reconcile and re-render.

When you click "Increment ref", the handler mutates `ref.current` in place. The console correctly shows the updated values because `console.log` reads the live object. But nothing told React to re-render, so the DOM still reflects the last committed render where `ref.current` was `0` at the time JSX was produced. The `<p>` node on screen is a frozen snapshot of that moment.

When you click "Force render", `forceRender(n => n + 1)` changes an unrelated state, which causes React to call `App` again. During that new render, the JSX reads `ref.current` fresh — and it now sees `3` because the underlying object was being mutated all along. So the ref's current value finally reaches the DOM, not because of the ref itself, but because an unrelated state change triggered a render that happened to read the ref.

This is precisely why refs are ideal for values that should not trigger UI updates (DOM nodes, timer IDs, previous-value caches, "did I already submit this form" flags) and why reading `ref.current` during render is generally discouraged — if you want something reactive, use state instead.

**Takeaway:** Mutating `ref.current` never schedules a render; the DOM only reflects the ref's value on the next render triggered by something else.

---

### Rendering & Reconciliation

**Q10: A `Parent` component re-renders when its own state changes, and renders a `<Child />` that takes no props. Does `Child` re-render on every parent update?**

```jsx
function Child() {
  console.log("Child rendered");
  return <p>Child</p>;
}

function Parent() {
  const [count, setCount] = useState(0);
  console.log("Parent rendered");

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Click</button>
      <Child />
    </div>
  );
}
```

**Output on each click:**
```
Parent rendered
Child rendered
```

**Explanation:**

React's reconciliation model is deliberately simple: when a component renders, React walks the entire subtree it produces and re-renders every child, regardless of whether props changed. The reason is that children may read from context, hooks, or other external sources that React cannot inspect — so the safe default is to re-render everything and let the virtual DOM diff figure out what actually needs to touch the real DOM.

When `Parent` updates, it returns new React elements for its children. Even though `<Child />` has no props, it is still a fresh element object referencing the `Child` component, and React evaluates it by calling `Child()` again. The `console.log("Child rendered")` fires. If `Child` eventually produces the same JSX structure, React will diff and realize nothing needs to change in the DOM — but the component function itself always runs.

To opt out of this behavior, wrap the child in `React.memo(Child)`. Memo adds a shallow prop comparison before calling the component: if the new props are referentially equal to the previous ones, React reuses the cached output and skips the render entirely. This only helps when the parent passes stable props (primitives, memoized callbacks, or objects wrapped in `useMemo`), and it is almost never worth it for trivial components like this one — the cost of the memo check can exceed the cost of just rendering.

**Takeaway:** Children re-render whenever their parent renders, even with no props; use `React.memo` only when the render cost is actually measurable and props are referentially stable.

---

**Q11: A `Child` wrapped in `React.memo` receives `style={{ color: "red" }}` from its parent. When the parent re-renders, does memoization prevent `Child` from re-rendering?**

```jsx
const Child = React.memo(({ style }) => {
  console.log("Child rendered");
  return <p style={style}>Hello</p>;
});

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <Child style={{ color: "red" }} />
    </div>
  );
}
```

**Output on each click:**
```
Child rendered
```

**Explanation:**

`React.memo` compares the new props to the previous props with a shallow equality check: for each key, it runs `Object.is(prev[key], next[key])`. If every key matches, it bails out and reuses the last render; if any key differs, it re-renders. For primitives like `color: "red"` as a direct prop, this works nicely. But here the prop is the entire `style` object.

Each time `Parent` renders, the JSX expression `style={{ color: "red" }}` evaluates fresh, producing a new object literal with a different memory address. Memo compares the old `style` object to the new `style` object, `Object.is` returns `false`, and Child re-renders — defeating the entire reason for wrapping it in memo.

The fix is to stabilize the reference. You can lift the object outside the component (`const childStyle = { color: "red" };` at module scope), wrap it in `useMemo(() => ({ color: "red" }), [])` so it is only created once, or pass the individual primitive fields the child needs (`<Child color="red" />`). The same trap applies to function props — `onClick={() => doThing()}` creates a new function every render and breaks memo; use `useCallback` or lift the function out. Memo without stable references is worse than no memo, because you pay the comparison cost and still re-render.

**Takeaway:** `React.memo` only helps when every non-primitive prop has a stable reference — inline object/function literals create a new identity every render and defeat memoization.

---

**Q12: A button's click handler calls `setCount(0)` while the state is already `0`. Does the component re-render, and does it behave differently on the first click vs subsequent clicks?**

```jsx
function App() {
  const [count, setCount] = useState(0);
  console.log("rendered");

  return <button onClick={() => setCount(0)}>Click</button>;
}
```

**Output on first click:** `rendered`
**Output on second click:** (nothing)

**Explanation:**

This question exposes React's "bail-out" optimization. When you call a state setter, React compares the new value to the current value using `Object.is`. If they match, React may skip re-rendering — but only if it can confirm that nothing else would change. The subtlety is that this bail-out check itself sometimes requires a partial render to verify, especially for the first update after a mount.

On the first click, React enqueues the update, begins reconciliation, confirms via `Object.is(0, 0)` that the value is unchanged, and may still call the component function once to verify nothing else needs updating. After that verification render, React discards the result if it matches the previous output. The `console.log("rendered")` fires because the component body executed. From this point on React has cached the no-op result, so subsequent `setCount(0)` calls are skipped entirely — no re-render, no log.

The same bail-out applies when you update state to a value that is `Object.is`-equal to the existing one: setting an object state to a referentially identical object, setting a string to the same string, etc. This is why you must always create new objects/arrays when updating object state — mutating in place and calling the setter with the same reference would silently do nothing. In Strict Mode, React double-invokes render functions during development, which can make this first-render behavior appear twice but does not affect production output.

**Takeaway:** Setting state to the same value bails out of re-rendering — but React may still run one verification render the first time, and you must pass a new reference to update object state.

---

**Q13: An `<Input />` component with its own internal `text` state is rendered as `<Input key={id} />`. When the parent increments `id`, what happens to the input's current value and does `Input` log "mounted" again?**

```jsx
function Input() {
  const [text, setText] = useState("");
  console.log("Input mounted");

  return <input value={text} onChange={e => setText(e.target.value)} />;
}

function App() {
  const [id, setId] = useState(1);

  return (
    <div>
      <Input key={id} />
      <button onClick={() => setId(id + 1)}>Reset</button>
    </div>
  );
}
```

**On clicking "Reset":** Input field clears, console logs `Input mounted`.

**Explanation:**

React's reconciliation algorithm uses position plus key to decide whether an element in the new render corresponds to an existing instance in the old one. Without an explicit key, React matches by position in the parent's children array — the first `<Input />` at position 0 today is treated as the same instance as the first `<Input />` at position 0 yesterday, so its hook state, DOM node, and effects are all preserved. With an explicit `key`, React uses that key as the identity instead.

When the user clicks Reset, `setId(id + 1)` changes `id` from 1 to 2. On the next render, the JSX produces `<Input key={2} />`, but React remembers the previous child had `key={1}`. The keys don't match, so React treats this as a different component instance altogether: it unmounts the key-1 Input (running any cleanup effects, destroying the hook state, removing the DOM node) and mounts a fresh key-2 Input (calling the function for the first time, running `useState("")`, firing mount effects). The input clears because its internal `text` state starts over at `""`, and `console.log("Input mounted")` fires because the component body executed as a first-time render.

This "change the key to reset" pattern is the idiomatic way to reset uncontrolled state without managing it from the parent. The flip side is that overusing dynamic keys (especially `key={Math.random()}` or `key={Date.now()}`) accidentally remounts on every render, throwing away perfectly good state and DOM nodes — a common performance bug. Keys should be stable and unique for the lifetime of the logical entity they represent.

**Takeaway:** Changing a component's `key` forces React to unmount the old instance and mount a new one, resetting all internal state and re-running mount effects.

---

### Hooks Rules & Gotchas

**Q14: A component calls `useState` inside an `if (showName)` branch between two other `useState` calls. What goes wrong when `showName` toggles from `true` to `false` across renders?**

```jsx
function App({ showName }) {
  const [count, setCount] = useState(0);

  if (showName) {
    const [name, setName] = useState("React");
  }

  const [age, setAge] = useState(25);

  return <p>{count} {age}</p>;
}
```

**Output:** Runtime error when `showName` toggles.

**Explanation:**

React does not actually see the names of your hooks. Internally, each component has an array (technically a linked list) of hook slots. On every render, React walks through your component function from top to bottom; each hook call reads the next slot in sequence. The identity of a hook — which state it owns, which effect it is — is determined purely by the order of the call, not by any variable name.

On the first render with `showName = true`, React records three slots: slot 0 = count state, slot 1 = name state, slot 2 = age state. On the next render with `showName = false`, your code calls only two hooks: `useState(0)` and `useState(25)`. React sees hook #0 (fine — matches count) and hook #1, but now this call is your `useState(25)` while slot 1 in memory is holding "React". React detects the mismatch — fewer hook calls than last time — and throws the dev-mode error: "Rendered fewer hooks than expected." The exact wording varies by direction, but the cause is identical: the ordered correspondence between call sites and slots has been broken.

This is precisely the reason for the "Rules of Hooks" and the `eslint-plugin-react-hooks` rule that forbids hooks in conditionals, loops, or early returns. The fix is to keep all hook calls at the top level unconditionally and push the conditional logic inside the values you compute or the JSX you return. For optional state, simply always create the state and only *use* it conditionally.

**Takeaway:** React identifies hooks by call order, so they must be called unconditionally in the same sequence on every render — never put a hook inside `if`, `for`, or after an early return.

---

**Q15: A `useEffect` with `[count]` as its dependency logs `"setup", count` and returns a cleanup that logs `"cleanup", count`. What logs appear on mount, on the first click, and on the second click?**

```jsx
function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("setup", count);
    return () => console.log("cleanup", count);
  }, [count]);

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**Output after mount:** `setup 0`

**Output after first click:**
```
cleanup 0
setup 1
```

**Output after second click:**
```
cleanup 1
setup 2
```

**Explanation:**

A `useEffect` with a dependency array is not a "when it changes" handler; it is a "keep this effect synchronized with these values" declaration. Every render where the deps have changed, React first runs the previous render's cleanup function, then runs the new render's effect function. That two-step dance is what keeps subscriptions, timers, and external resources in sync with the current props and state.

On mount, there is no previous effect to clean up, so only the setup runs — and the effect closes over the first render's `count = 0`, so it logs `setup 0`. When `count` changes to `1`, React re-renders, detects that the `[count]` dep changed, and enters the commit phase. Before running the new effect, it invokes the *old* cleanup function, which was created in the render where `count` was `0`. That cleanup closes over `count = 0` and logs `cleanup 0`. Then the new effect runs, closing over `count = 1`, and logs `setup 1`.

The second click repeats the pattern: cleanup from the `count = 1` render logs `cleanup 1`, then the new effect for `count = 2` logs `setup 2`. Each cleanup sees "its own" state — the state from the render that created it — which is exactly what you want when cleaning up, for example, a subscription that was opened with the previous value. If you forget this, you can accidentally call `clearInterval(id)` where `id` is from the current render rather than the one you started.

**Takeaway:** Each effect's cleanup captures the state from the render that created it and runs *before* the next effect — treat setup/cleanup as paired lifecycles of the dependency snapshot.

---

**Q16: `useState(expensiveInit)` is called with a reference to a function (not its return value). How many times does `expensiveInit` run across mount and a subsequent click?**

```jsx
function expensiveInit() {
  console.log("init called");
  return 42;
}

function App() {
  const [value, setValue] = useState(expensiveInit);
  console.log("render", value);

  return <button onClick={() => setValue(v => v + 1)}>{value}</button>;
}
```

**Output on mount:**
```
init called
render 42
```

**Output on click:**
```
render 43
```

**Explanation:**

`useState` accepts either an initial value or an initializer function. When you pass a non-function value, React stores it as-is the first time and ignores the argument on every subsequent render. When you pass a function, React recognizes the special form — it invokes the function to compute the initial state exactly once, on the first render, and then ignores it forever after. This is called the *lazy initial state* optimization.

The distinction matters because the expression you write for the initial value is evaluated on every render. `useState(expensiveInit())` (with parentheses) would call `expensiveInit` during every single render, do all the work to compute `42`, and then React would throw the result away on all renders after the first. By contrast, `useState(expensiveInit)` passes the function reference itself; React internally stores that reference, invokes it exactly once to populate the initial state slot, and never calls it again.

On mount, React invokes `expensiveInit`, which logs `init called` and returns `42`. Render then logs `render 42`. On the click, `setValue(v => v + 1)` updates the state to `43`, triggering a re-render; React sees that the state slot is already initialized, skips the initializer entirely, and render logs `render 43`. No further `init called` ever appears. The same pattern works for `useReducer(reducer, initArg, init)`, whose third argument is a lazy initializer for the same reason.

**Takeaway:** Pass the function reference itself (`useState(expensiveInit)`, not `useState(expensiveInit())`) whenever the initial value is expensive — React will call it exactly once on mount.

---

### Performance Pitfalls

---

**Q17: A `Child` is wrapped in `React.memo` and the parent passes `data={users}` and `onSelect={handleSelect}`, where `handleSelect` is defined as a regular function inside the parent's body. Why does `Child` still re-render every time the parent re-renders, and what is the minimum fix?**

```jsx
const Child = React.memo(function Child({ data, onSelect }) {
  console.log("Child render");
  return <ul>{data.map(u => <li key={u.id} onClick={() => onSelect(u)}>{u.name}</li>)}</ul>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [users] = useState([{ id: 1, name: "Ana" }]);

  function handleSelect(u) { console.log(u); }   // recreated each render

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <Child data={users} onSelect={handleSelect} />
    </>
  );
}
```

**Output:** `Child render` logs on every parent render, even though `users` and the user-visible output of `handleSelect` are unchanged.

**Explanation:**

`React.memo` does a **shallow** compare of props. When the parent re-renders (because `count` changed), the function body runs top-to-bottom, including `function handleSelect(u) { ... }`. That function declaration creates a fresh function object each render — `handleSelect_render2 !== handleSelect_render1` even though the source code is identical. The memo comparator then checks each prop: `data` is the same array reference (it lives in `useState`, so it survives across renders), but `onSelect` is a new reference. Shallow equality fails on `onSelect`, the memo bails, and `Child` re-renders.

`users` survives because `useState` stores the value across renders and only changes the reference if you call its setter. Inline objects/arrays defined directly in the JSX (`data={[...]}`) would have the same problem as `handleSelect`.

The minimum fix is `useCallback`: `const handleSelect = useCallback((u) => console.log(u), [])`. This stores a single function reference across renders (until the dependency list changes), so `onSelect` stays referentially equal and the memo holds.

**Takeaway:** `React.memo` is necessary but not sufficient — every function/object/array prop you pass must be referentially stable too, or the memo is wasted work plus an extra equality check.

---

**Q18: A `<ThemeProvider>` wraps the whole app and supplies `value={{ theme, user, setTheme, setUser }}`. Theme rarely changes, but `user` updates on every page navigation. Why do **all** consumers of `useTheme()` re-render on navigation, even ones that never read `user`?**

```jsx
const Ctx = createContext(null);

function AppProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);

  return (
    <Ctx.Provider value={{ theme, user, setTheme, setUser }}>
      {children}
    </Ctx.Provider>
  );
}

function ThemedButton() {
  const { theme } = useContext(Ctx);     // only reads theme
  return <button className={theme}>Go</button>;
}
```

**Output:** Every `ThemedButton` re-renders on user updates, even though it only reads `theme`.

**Explanation:**

Context propagation in React is keyed off the `value` **reference**, not the individual fields you destructure inside `useContext`. On every render of `AppProvider`, the `{ theme, user, setTheme, setUser }` object literal creates a new object — even if the *contents* are unchanged. React compares the new value reference to the previous one with `Object.is`, sees they differ, and notifies every subscriber to schedule a re-render. The destructuring `{ theme }` inside the consumer happens *after* React has already scheduled the work; React doesn't know which fields you read, so it can't be selective.

Two compounding problems: (1) the provider's value is a brand-new object on every render, so re-renders fire even when nothing actually changed; (2) when something *does* change (e.g. `user`), every consumer re-renders, including ones that only read `theme`.

Fixes, in order of escalation:
1. **`useMemo` the value** so the reference is stable when its dependencies haven't changed: `const value = useMemo(() => ({ theme, user, setTheme, setUser }), [theme, user])`. Cheap; fixes problem (1).
2. **Split the context** into independent providers (`<ThemeProvider>` and `<UserProvider>`) so unrelated state lives in unrelated subscriptions. Fixes problem (2).
3. **Use a state library** (Zustand, Jotai) or `useSyncExternalStore` if you need field-level subscription with one logical store.

**Takeaway:** Context is a *broadcast* mechanism — it's coarse by design. Memoize the value, split unrelated state, and reach for a store library when consumers need field-level subscriptions.

---

**Q19: A list of 5,000 rows is rendered with `items.map((item, i) => <Row key={i} {...item} />)`. The user clicks a button that calls `setItems(prev => [newItem, ...prev])`. What goes wrong, and why is it both a correctness *and* a performance bug?**

**Output:** Every existing `Row` re-renders (or worse, mounts/unmounts), and any internal Row state — like a half-typed input — is wrong: it sticks to the *position* instead of the row's data.

**Explanation:**

When you use the array index as `key`, React's reconciler matches old and new children by position, not identity. Before the prepend, the first row had `key=0` and the data for `oldItems[0]`. After the prepend, the first row still has `key=0` but now holds `newItem`. React looks up `key=0`, sees a "match," and instead of mounting a new row at the top and shifting the rest, it **reuses** the first DOM node and just updates its props. Every row's props change because every row's data shifted, so every row's hooks/state/DOM are reconciled. With 5,000 rows that's a massive amount of unnecessary work — and any internal Row state (controlled inputs, expanded/collapsed flags) now belongs to the *wrong* item.

If you used `key={item.id}` instead, the reconciler matches by identity. The new row gets a fresh mount; existing rows keep their identity, their state, and — crucially — React doesn't re-render them at all because their props haven't changed.

The bug compounds with `React.memo`: memoization can't help when index keys make every prop look "changed" from the reconciler's point of view.

**Takeaway:** Use index keys only for static lists that never reorder, splice, or filter. For everything else, use a stable id — it's a correctness fix first, performance fix second.

---

**Q20: A search input filters a 50,000-item product list. The user reports the input "feels laggy" — characters lag behind their typing by 300ms. Wrapping the filter call in `useTransition` fixes the lag. What does that actually change at the React scheduler level?**

```jsx
function Search({ products }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(products);
  const [isPending, startTransition] = useTransition();

  function onChange(e) {
    setQuery(e.target.value);                                  // urgent
    startTransition(() => {
      setFiltered(products.filter(p => p.name.includes(e.target.value)));   // non-urgent
    });
  }

  return <><input value={query} onChange={onChange} />{isPending && "…"}<List items={filtered}/></>;
}
```

**Output:** Without `useTransition`, every keystroke schedules one render that re-runs the 50K filter and re-renders the list synchronously — the input value can't update until that render commits. With `useTransition`, the input updates on every keystroke at full speed; the filtered list catches up in the background.

**Explanation:**

In React's concurrent renderer, every state update has a **lane** (priority). By default, `setState` calls inside an event handler land in the same lane and are batched into a single render. `setQuery` (cheap) and `setFiltered` (expensive) get committed together, so the input value can't paint until the whole render — including the 50K-item filter and the list reconciliation — finishes. Result: input lag.

`startTransition(fn)` tells React "the state updates inside `fn` are non-urgent." Those updates go into a transition lane that's lower priority than the default lane. The `setQuery` update keeps its urgent priority, so React can paint the new input value first, then start working on the transition. Critically, transitions are **interruptible**: if the user types another character while React is mid-filter, React throws away the in-progress work and starts over with the latest value. That's why concurrent rendering matters here — without it, you'd just be queueing up filter computations and getting further behind.

`isPending` exposes the "transition in flight" state so you can show a spinner without re-introducing the lag (because the spinner update itself is urgent and lives outside the transition).

The same effect can be achieved with `useDeferredValue(query)` when you don't own the `setState` of the slow consumer — the deferred value lags behind the real value, and React renders the consumer at lower priority.

**Takeaway:** `useTransition` doesn't make the work faster — it makes the work **interruptible** and **lower-priority**, so urgent UI (input, click feedback) commits without waiting on it.

---

**Q21: A `Chart` component is loaded with `React.lazy(() => import('./Chart'))` and rendered inside `<Suspense fallback={<Spinner />}>`. The first time the page mounts, the user sees a 200ms flash of the spinner even on a fast connection. Why, and what's the fix if the chart is above the fold?**

**Explanation:**

`React.lazy` triggers the dynamic `import()` only the first time the lazy component is rendered. The browser then has to: (1) make a network request for the chunk, (2) wait for it to download, (3) parse and execute it. Meanwhile, `<Suspense>` shows the fallback. Even on a fast connection, the round-trip + parse easily takes 100–300ms — so you see the spinner flash.

For an above-the-fold chunk, lazy loading is the wrong tool. The whole point of lazy loading is to *delay* work until the user needs it; if the user always needs it on this route, you've added a network round-trip for no benefit, *worsened* LCP, and introduced a layout shift when the spinner is replaced.

Fixes, by situation:

1. **Don't lazy-load it.** Import it normally. Code splitting is for code the user *might* not need.
2. **Preload the chunk** with `<link rel="modulepreload" href="/assets/Chart-abc123.js">` in the HTML head — the browser starts fetching in parallel with the main bundle, so by the time React renders `<Chart>` the chunk is already in the cache and Suspense never has to wait.
3. **Prefetch on hover/intent** for routes one click away — start the import when the user hovers the link, finish by the time they click.
4. **`startTransition` around the navigation** that triggers the lazy boundary — React will keep showing the previous UI instead of swapping to the fallback, hiding the loading flash.

**Takeaway:** `React.lazy` is a knob, not a free upgrade. Lazy-load below-the-fold or rarely-used widgets; for above-the-fold code, either ship it eagerly or preload the chunk so the Suspense boundary never trips.

---

**Q22: A bundle analyzer shows that `lodash` is contributing 71 KB to the production bundle, but the team only uses `debounce` and `cloneDeep`. The lead developer changed `import _ from 'lodash'` to `import { debounce, cloneDeep } from 'lodash'` — the bundle size barely moved. Why didn't named imports tree-shake?**

**Explanation:**

Tree shaking depends on the bundler being able to **statically prove** that an export is unused, and that proof relies on the source being **ES modules** that are explicitly side-effect-free. The classic `lodash` package on npm ships **CommonJS** — it predates the ESM era. CommonJS uses `module.exports = require('./debounce')` etc., which is a runtime construct: the bundler can't prove at build time that `cloneDeep` is the only thing reachable, because in CJS any module can dynamically reach into another. Most bundlers fall back to including the whole module.

Two complementary fixes:

1. **Use the ESM build**: `import { debounce, cloneDeep } from 'lodash-es'`. `lodash-es` is the same library shipped as ES modules with `sideEffects: false` declared, so Rollup/Webpack can shake out everything you don't reference. This single change usually drops 60+ KB.
2. **Per-function imports** as a fallback when only the CJS build is available: `import debounce from 'lodash/debounce'`. This works because `lodash/debounce.js` is a narrow file with only its own dependencies — the bundler ends up with just the dependency closure of debounce, not all of lodash.

Same lesson applies to other libraries: `moment` doesn't tree-shake well (its locales pull in megabytes); replace with `date-fns` (ESM, fully tree-shaken) or `dayjs` (~2 KB core). Icon packs ship as one giant file by default — most provide per-icon imports (`from 'lucide-react/icons/x'`) that shake correctly.

Verify the win in the analyzer, not in your head — module resolution edge cases (transitive deps, dual-package hazards) sometimes mean the "obvious" fix doesn't actually shrink the bundle.

**Takeaway:** Tree shaking needs ES modules + `sideEffects: false` + named imports. `lodash` (CJS) won't shake even with named imports — switch to `lodash-es` or per-function paths. Always verify the savings with a bundle analyzer.

---

### React 19.2 APIs

---

**Q23: Toggling an `<Activity>` from visible to hidden and back — what does the console print, and what is the counter showing at the end?**

```tsx
function Timer() {
  const [n, setN] = useState(0);
  useEffect(() => {
    console.log('effect mount');
    const id = setInterval(() => setN(x => x + 1), 1000);
    return () => { console.log('effect cleanup'); clearInterval(id); };
  }, []);
  return <p>{n}</p>;
}

// Timer is rendered inside <Activity mode={show ? 'visible' : 'hidden'}>
// Timeline: show=true for 3s → show=false for 5s → show=true again
```

**Output:**
```
effect mount        (t=0)
effect cleanup      (t=3s, on hide)
effect mount        (t=8s, on show)
```
and the counter reads **3**, then resumes counting 4, 5, 6…

**Explanation:**

`<Activity>` splits apart two things that had always moved together: **state lifetime** and **effect lifetime**.

When the activity is hidden, React "will destroy their Effects, cleaning up any active subscriptions" — so the cleanup runs, `clearInterval` fires, and the timer genuinely stops. Nothing ticks during the five hidden seconds. But the component's **state is saved**, not discarded. When the activity becomes visible again, React "will reveal the children with their previous state restored, and re-create their Effects" — hence the second `effect mount`, and hence a counter that reads `3` rather than `0`.

That is the whole point, and it is why the count is `3` and not `8`. Compare the alternatives on the same timeline:

- **Conditional rendering** (`{show && <Timer />}`): cleanup on hide, mount on show, and the counter resets to **0** — the state is gone.
- **CSS `display: none`**: no cleanup, no re-mount, the interval keeps ticking while hidden, and the counter reads **8** — you paid for five seconds of invisible work.
- **`<Activity>`**: cleanup and re-mount, counter reads **3** — work stopped, state survived.

Two further subtleties this snippet hides. A hidden activity is **not frozen**: its children still re-render in response to new props, just at a lower priority than visible content — so it is cheap, not free. And because effect *cleanup* is the mechanism that stops work, an effect with a missing or incomplete cleanup function will keep running while hidden; `<Activity>` makes correct cleanup load-bearing rather than merely good practice.

**Takeaway:** hiding an `<Activity>` destroys effects but preserves state, and revealing it restores that state and re-creates the effects — the one combination neither conditional rendering (loses state) nor `display: none` (keeps effects running) could give you.

---

**Q24: `cbCallback` and `cbEvent` close over the same prop and are called from the same interval. Why do they log different values?**

```tsx
function Ticker({ value }) {
  const cbCallback = useCallback(() => console.log('cb', value), []);
  const cbEvent = useEffectEvent(() => console.log('ev', value));

  useEffect(() => {
    const id = setInterval(() => { cbCallback(); cbEvent(); }, 1000);
    return () => clearInterval(id);
  }, []);

  return null;
}

// The parent re-renders Ticker with value = 0, then 1, then 2 (once per second)
```

**Output:**
```
cb 0   ev 0
cb 0   ev 1
cb 0   ev 2
```

**Explanation:**

This is the staleness-versus-stability trade-off that `useEffectEvent` was built to eliminate, shown side by side.

`useCallback(fn, [])` returns **the same function object** on every render — which is why it can safely be omitted from the effect's dependency array. But "the same function object" means literally the one created during the *first* render, and that function closed over `value` as it was then: `0`. Every later render creates a fresh candidate function, and `useCallback` throws it away because the dependency array says nothing changed. So `cb` logs `0` forever. This is the classic stale-closure bug, and the usual "fix" — adding `value` to the deps — makes `cbCallback` a new reference each render, which then makes the `useEffect` dependency array dishonest and, once corrected, tears down and recreates the interval every second.

`useEffectEvent` returns a **stable wrapper around a mutable slot**. The identity of the returned function never changes (so it never needs to be a dependency), but React swaps the underlying implementation on every render, so the body always sees the latest props and state. `ev` therefore logs `0`, `1`, `2`.

The two properties are what no previous hook could combine:

| | Stable identity | Sees latest values |
|---|---|---|
| inline `() => …` | ✗ | ✓ |
| `useCallback(fn, [])` | ✓ | ✗ |
| `useCallback(fn, [value])` | ✗ | ✓ |
| `useEffectEvent(fn)` | **✓** | **✓** |

The restriction that pays for this: effect events may only be **called from inside an effect** (or another effect event) — never during render, and never passed to a child as a prop. A value that is simultaneously stable and always-fresh has no consistent meaning during render, so the linter treats it as an error. Note too that `eslint-plugin-react-hooks` v6 knows about effect events and correctly leaves them out of dependency arrays, which is what makes the hook usable rather than a new source of false warnings.

**Takeaway:** `useCallback` with empty deps is stable but stale; `useEffectEvent` is stable *and* fresh, because React keeps the wrapper's identity fixed while replacing the function inside it every render.

---

**Q25: With React Compiler enabled and StrictMode on in development, what does this render?**

```jsx
function TagList({ tags }) {
  tags.push('featured');          // mutating a prop during render
  return <ul>{tags.map(t => <li key={t}>{t}</li>)}</ul>;
}

// <TagList tags={['new', 'sale']} />
```

**Output (development, StrictMode):**
```
new
sale
featured
featured
```
and the component is **silently skipped** by the compiler — no memoization is applied to it.

**Explanation:**

Two separate consequences of the same rule violation, and interviewers use this to see whether you understand that the compiler is a *conditional* optimisation rather than a magic switch.

**The duplicate `featured`** comes from StrictMode, which deliberately invokes component functions twice in development to surface impure renders. Because `tags.push(...)` mutates the array the parent owns rather than deriving a new one, the second invocation pushes onto the *already-mutated* array. The render output is now a function of how many times the component happened to run — which is exactly the property React's concurrent renderer is allowed to vary. In production without StrictMode you would see one `featured` and conclude the code was fine; the bug would then surface as a duplicate the first time an interrupted render was retried.

**The silent bail-out** is the compiler half. React Compiler only emits memoization for a component when its data-flow analysis can prove the component obeys the Rules of React — purity (idempotent rendering, no side effects during render) and immutability (props, state and hook results are not mutated). A `push` onto a prop violates both. Faced with that, the compiler does not error and does not produce unsound code: it **skips the component entirely**, leaving it exactly as written.

That failure mode is the thing to name out loud. A codebase full of rule violations does not break under the compiler — it just quietly receives none of the benefit, component by component, with no runtime signal. Which is why compiler adoption is really a linting project: the compiler-powered rules in `eslint-plugin-react-hooks` v6 report which components bailed out and why, and you fix those *before* turning the compiler on, not after wondering why your benchmarks didn't move.

The fix is to derive rather than mutate:

```jsx
function TagList({ tags }) {
  const all = [...tags, 'featured'];       // or tags.concat('featured')
  return <ul>{all.map(t => <li key={t}>{t}</li>)}</ul>;
}
```

**Takeaway:** React Compiler bails out silently on components that violate purity or immutability, so rule violations cost you the optimisation rather than producing an error — and StrictMode's double-invoke is the tool that makes the underlying impurity visible.

---

**Q26: The dependency array is empty and the linter is happy. Why does switching rooms never reconnect?**

```tsx
function ChatRoom({ roomId }) {
  const connect = useEffectEvent(() => {
    const conn = createConnection(roomId);
    conn.connect();
    return conn;
  });

  useEffect(() => {
    const conn = connect();
    return () => conn.disconnect();
  }, []);        // linter: no warning
}
```

**Behaviour:**
```
mount with roomId="general"  → connects to "general"
prop changes to "random"     → nothing happens; still connected to "general"
```

**Explanation:**

This is `useEffectEvent` used backwards, and it is the API's main hazard precisely because the linter *approves* it.

Effect events are **non-reactive by design**. Wrapping logic in `useEffectEvent` tells React "this code should always see the latest values, but changes to those values must not re-run anything." The linter therefore omits `connect` from the dependency array — correctly, per the contract you declared — and since `roomId` is no longer read directly inside the effect, it doesn't appear either. The dependency array is now genuinely complete *with respect to what the effect reads*, so there is no warning. The bug is not a missing dependency; it is a **mis-declared reactivity boundary**.

The distinction to apply is *what kind of logic this is*:

- **Reactive / synchronising** — "the connection must correspond to `roomId`." A change in `roomId` means the current state of the world is wrong and must be re-synchronised. This belongs **in the effect body, with `roomId` in the deps.**
- **Non-reactive / event** — "when the connection opens, show a toast in the current theme." A change in `theme` doesn't invalidate anything; it just means the next toast should look different. This belongs **in an effect event.**

Written correctly, each piece goes where it belongs:

```tsx
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => showToast('Connected!', theme));  // event

  useEffect(() => {                        // synchronisation
    const conn = createConnection(roomId);
    conn.on('connected', () => onConnected());
    conn.connect();
    return () => conn.disconnect();
  }, [roomId]);                            // honest and complete
}
```

The generalisable warning: `useEffectEvent` makes awkward effects tolerable, which makes it a tempting way to silence any dependency you find inconvenient. Silencing a dependency you *wanted* to react to converts a loud lint warning into a quiet behavioural bug. The moment you reach for it to make a warning go away rather than to express "this is an event", you are using it wrong.

**Takeaway:** `useEffectEvent` declares logic *non-reactive*, so putting synchronisation logic inside one removes it from the dependency graph and the effect stops responding to the very prop it depends on — reactive setup stays in the effect body, events go in effect events.

---

### Key Rules

```
React Output Cheat Sheet:
1.  setState with direct value uses the closure value (may be stale)
2.  setState with function updater gets the latest pending state
3.  React 18+ batches all state updates in event handlers
4.  useEffect runs AFTER browser paint, not during render
5.  useEffect cleanup captures values from the render it was created in
6.  Object/array deps in useEffect always trigger re-runs (reference equality)
7.  React.memo does shallow compare — new object refs bypass it
8.  Changing `key` completely remounts the component
9.  Hooks must be called in the same order every render
10. useRef mutations don't trigger re-renders
11. Inline {object} as Context value re-renders ALL consumers — useMemo it
12. Index keys break correctness on prepend/splice; use stable ids
13. useTransition makes work non-urgent + interruptible, not faster
14. React.lazy adds a network round-trip; preload above-the-fold chunks
15. Tree shaking needs ESM + sideEffects:false; CJS lodash won't shake
```

---

## References

- [React Documentation](https://react.dev) — Official React docs with interactive examples
- [React API Reference](https://react.dev/reference/react) — Complete hooks and components API
- [React GitHub](https://github.com/facebook/react) — Source code and issue tracker
