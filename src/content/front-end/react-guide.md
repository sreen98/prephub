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
- [14. Patterns and Best Practices](#14-patterns-and-best-practices)
- [15. React 19 Features](#15-react-19-features)
- [16. Interview Questions & Answers](#16-interview-questions--answers)
- [17. Tricky Output Questions](#17-tricky-output-questions)

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

State is initialized in the constructor or as a class field. Use `this.setState()` to update it — never mutate `this.state` directly. `setState` accepts either an object (shallow merged) or a function for updates that depend on previous state. React batches multiple `setState` calls for performance.

```tsx
interface CounterState {
  count: number;
  lastUpdated: string;
}

class Counter extends React.Component<{}, CounterState> {
  // Class field syntax (no constructor needed)
  state: CounterState = {
    count: 0,
    lastUpdated: new Date().toISOString(),
  };

  // Arrow function to avoid 'this' binding issues
  increment = () => {
    // Object form — merged with current state
    this.setState({ count: this.state.count + 1 });

    // Functional form — use when update depends on previous state
    this.setState((prevState) => ({
      count: prevState.count + 1,
      lastUpdated: new Date().toISOString(),
    }));

    // setState with callback (runs after state is applied)
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

React provides several built-in hooks for different purposes. Here is a quick reference of all hooks available in React 19.

```tsx
// State
const [state, setState] = useState(initialValue);
const [state, dispatch] = useReducer(reducer, initialState);

// Side effects
useEffect(setup, dependencies?);

// Context
const value = useContext(MyContext);

// Refs
const ref = useRef(initialValue);

// Memoization
const memoized = useMemo(() => expensiveComputation(a, b), [a, b]);
const callback = useCallback((arg) => doSomething(arg), [dep]);

// Imperative handle (expose methods to parent)
useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }));

// Layout effect (synchronous, before paint)
useLayoutEffect(setup, dependencies?);

// Debug
useDebugValue(value, formatFn?);

// Sync external store
const snapshot = useSyncExternalStore(subscribe, getSnapshot);

// Unique ID generation
const id = useId();

// Transitions (non-urgent updates)
const [isPending, startTransition] = useTransition();

// Deferred values (keep old value during re-render)
const deferredValue = useDeferredValue(value);
```

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
```

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
| Complex server state (API data) | React Query |
| Complex client state (many updates) | Redux/Zustand |
| Form state | React Hook Form |

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

## 14. Patterns and Best Practices

### 14.1 Compound Components

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

### 14.2 Render Props

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

### 14.3 Custom Hook Pattern (Preferred over Render Props)

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

## 15. React 19 Features

### 15.1 React Compiler

React 19 includes an automatic compiler that handles memoization. You no longer need `useMemo`, `useCallback`, or `React.memo` in most cases — the compiler inserts them automatically.

### 15.2 Actions

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

### 15.3 use() Hook

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

### 15.4 useOptimistic

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

## 16. Interview Questions & Answers

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

## 17. Tricky Output Questions

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
