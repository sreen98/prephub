const e=`# React — Core Concepts

The foundations: JSX, components, props, state, hooks, effects, events, lists, forms, context and refs.

Part of the React series: **React Guide** · [React Performance & Internals](/frontend/react-performance) · [React 19 & Patterns](/frontend/react-19-patterns) · [React Interview Questions](/frontend/react-interview-questions) · [React Tricky Questions](/frontend/react-tricky-questions)

---

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

---

## 1. What is React?

React is a **JavaScript library for building user interfaces**, created by Meta. The one idea behind it: you write a function that says what the screen should look like for the current data, and React works out which DOM changes get the page there. You stop writing "find this element, change its text" code by hand.

Key concepts:
- **Declarative** — you describe the result ("show this list"), not the steps ("append this \`<li>\`"). When data changes you describe the new result and React applies the difference, so the UI cannot drift out of sync with your data.
- **Component-based** — the UI is split into functions (components) that each own their markup, logic and state. You can reason about, test and reuse one piece without reading the whole page.
- **Virtual DOM** — a component returns a lightweight JavaScript description of the UI, not real DOM nodes. React compares the new description with the previous one and touches the real DOM only where they differ, because real DOM writes are the expensive part.
- **Unidirectional data flow** — data flows down, from parent to child via props. A child that wants to change something calls a function its parent passed in. That makes it easy to answer "where did this value come from?": look upward.
- **JSX** — HTML-like syntax inside JavaScript. It is only syntax: each tag compiles to a function call (see §2).

---

## 2. JSX

JSX is a syntax extension that lets you write HTML-like code in JavaScript. Each tag compiles to a function call that returns a plain object describing the element. Since React 17 the default ("automatic") transform calls \`jsx()\`/\`jsxs()\` from \`react/jsx-runtime\`; the older "classic" transform called \`React.createElement()\`. Either way, text and expressions become **separate children**, not one string ([Q3](/frontend/react-interview-questions) has the details).

\`\`\`tsx
const name = 'Alice';

// JSX
const fromJsx = <h1 className="title">Hello, {name}!</h1>;

// Automatic transform (React 17+) emits:
//   _jsxs('h1', { className: 'title', children: ['Hello, ', name, '!'] })
// Classic transform emits the equivalent:
const fromCreateElement = React.createElement('h1', { className: 'title' }, 'Hello, ', name, '!');
\`\`\`

### JSX Rules

\`\`\`tsx
const user = { name: 'Alice' };
const isActive = true;
const items = [1, 2, 3];
const handler = () => {};
const buttonProps = { type: 'button' as const, disabled: false };
const Button = (p: { type?: 'button'; disabled?: boolean }) => <button {...p} />;

// 1. Single root element — a Fragment gives you one without a wrapper node
function Card() {
  return (
    <>
      <h1>Title</h1>
      <p>Content</p>
    </>
  );
}

// 2. Close every tag, including void elements
const image = <img src="photo.jpg" alt="" />;
const brk = <br />;

// 3. camelCase for HTML attributes
const card = <div className="card" tabIndex={0} onClick={handler} />;
//                 ^className (not class)  ^camelCase

// 4. JavaScript expressions in curly braces
const name = <p>{user.name}</p>;
const status = <p>{isActive ? 'Active' : 'Inactive'}</p>;
const count = <p>{items.length > 0 && 'Has items'}</p>;

// 5. Style is an object, not a string
const styled = <div style={{ color: 'red', fontSize: '16px' }} />;

// 6. Spread props
const spread = <Button {...buttonProps} />;
\`\`\`

---

## 3. Components

### 3.1 Function Components (Standard)

Function components are the standard way to write React components. They are plain JavaScript functions that accept props and return JSX.

\`\`\`tsx
// Function declaration
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

// Arrow function — identical behaviour, different syntax
const GreetingArrow = ({ name }: { name: string }) => {
  return <h1>Hello, {name}!</h1>;
};

// Usage
const app = <Greeting name="Alice" />;
const same = <GreetingArrow name="Alice" />;

render(<>{app}{same}</>);
\`\`\`

### 3.2 Class Components

Class components are the older way of writing components, with ES6 classes. Function components with hooks are the standard now, but you still need to read classes: plenty of existing code uses them, and an **error boundary** (a component that catches render errors below it) can still only be written as a class.

A class extends \`React.Component\`, implements \`render()\`, reads props from \`this.props\` and keeps state in \`this.state\`. The example below uses the three lifecycle methods you will meet most often:

\`\`\`tsx
// stand-in so this example runs on its own: a fake API that answers after 300 ms
const fetchUser = (id: number) =>
  new Promise<string>((resolve) => setTimeout(() => resolve(\`User #\${id}\`), 300));

type State = { id: number; name: string | null };

class UserLoader extends React.Component<{}, State> {
  state: State = { id: 1, name: null };   // class field: no constructor needed
  unmounted = false;

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(_prevProps: {}, prevState: State) {
    if (prevState.id !== this.state.id) this.load();   // the guard; without it, an infinite loop
  }

  componentWillUnmount() {
    this.unmounted = true;                              // tear down what mount set up
  }

  load = async () => {
    const id = this.state.id;
    this.setState({ name: null });
    const name = await fetchUser(id);
    // ignore an answer that arrives after unmount or after the id moved on
    if (!this.unmounted && id === this.state.id) this.setState({ name });
  };

  // Arrow-function class field: \`this\` stays bound when React calls it.
  next = () => this.setState((prev) => ({ id: prev.id + 1 }));

  render() {
    return (
      <div>
        <p>{this.state.name ?? 'Loading…'}</p>
        <button onClick={this.next}>Next user</button>
      </div>
    );
  }
}
\`\`\`

Three details worth knowing:

- **\`setState\`** shallow-merges an object into state. When the next value depends on the current one, pass an updater (\`prev => …\`), as \`next\` does. An optional second argument is a callback that runs after the update is committed.
- **\`this\` binding.** \`onClick={this.handleClick}\` passes the method without its instance, so \`this\` is \`undefined\` when React calls it. Define handlers as arrow-function class fields (as above), or bind them in the constructor: \`this.handleClick = this.handleClick.bind(this)\`.
- **The constructor** is optional with class fields. If you write one, call \`super(props)\` first: JavaScript forbids touching \`this\` before \`super()\`, and passing \`props\` makes \`this.props\` available inside the constructor.

#### Lifecycle methods and their hook equivalents

\`\`\`
MOUNT                     UPDATE                      UNMOUNT
constructor               getDerivedStateFromProps    componentWillUnmount
getDerivedStateFromProps  shouldComponentUpdate
render                    render
componentDidMount         getSnapshotBeforeUpdate
                          componentDidUpdate

ERROR (in a child): getDerivedStateFromError → render fallback → componentDidCatch
\`\`\`

The split that explains the rules is **render phase vs commit phase**. Render-phase methods (\`constructor\`, \`getDerivedStateFromProps\`, \`shouldComponentUpdate\`, \`render\`, \`getDerivedStateFromError\`) must be pure, because React may call them more than once or throw the work away. Commit-phase methods run once per commit and may have side effects.

| Method | When it runs | Hook equivalent | The mistake to avoid |
|---|---|---|---|
| \`constructor(props)\` | Before the first render | \`useState\` initialiser, \`useRef\` | Side effects (it can run without a mount); \`setState\` here (assign \`this.state\`) |
| \`static getDerivedStateFromProps\` | Before **every** render | Compute during render, or reset with \`key\` (§7.4) | Assuming it runs only when a prop changed; it has no \`this\` |
| \`render()\` | Every render | The function body | \`setState\` or fetching here (impure; \`setState\` loops) |
| \`componentDidMount()\` | Once, after the first commit | \`useEffect(fn, [])\` | Setting something up without a matching teardown |
| \`shouldComponentUpdate\` | Before a re-render (not the first, not \`forceUpdate\`) | \`React.memo\` | A hand-written comparison that drops real updates; use \`PureComponent\` |
| \`getSnapshotBeforeUpdate\` | After render, before the DOM changes | \`useLayoutEffect\` (close, not identical) | Its return value is the only way to pass pre-update DOM reads (scroll position) to \`componentDidUpdate\` |
| \`componentDidUpdate(prevProps, prevState, snapshot)\` | After every update commit | \`useEffect(fn, [deps])\` | Unconditional \`setState\` here: an infinite loop. Compare with \`prevProps\` first |
| \`componentWillUnmount()\` | Just before removal | The \`useEffect\` cleanup | Forgetting one of several subscriptions. A \`setState\` here is simply ignored (no warning since React 18) |
| \`getDerivedStateFromError\` + \`componentDidCatch\` | A child threw | None: still class-only | See below |

\`this.forceUpdate()\` re-renders without a state change. Needing it usually means data that belongs in state is not there (in function components, \`useSyncExternalStore\` covers external mutable sources).

#### Error boundaries

\`getDerivedStateFromError\` runs in the render phase and only returns the state needed to show a fallback. \`componentDidCatch\` runs in the commit phase, so logging goes there.

\`\`\`tsx
// stand-in for Sentry or similar
const logError = (error: Error, stack?: string | null) => console.log('logged:', error.message);

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError(error, info.componentStack);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function Bomb() {
  const [broken, setBroken] = useState(false);
  if (broken) throw new Error('Kaboom');
  return <button onClick={() => setBroken(true)}>Break it</button>;
}

render(
  <ErrorBoundary fallback={<p role="alert">Something went wrong.</p>}>
    <Bomb />
  </ErrorBoundary>
);
\`\`\`

A boundary catches errors thrown while rendering, in lifecycle methods and in constructors **below** it. It does **not** catch errors in event handlers, in \`setTimeout\` or promise callbacks, during server rendering, or in the boundary itself; use \`try\`/\`catch\` for those. Wrap route segments and independent widgets so one failure degrades part of the page instead of blanking it.

#### Legacy APIs you will still meet

- **\`static defaultProps\`** still works on classes. React 19 removed it for function components (use default parameter values), see [§16.9](/frontend/react-19-patterns#169-what-react-19-changed-removals-migrations-and-behaviour).
- **\`propTypes\`** are ignored by React 19: a failing validator logs nothing. Use TypeScript.
- **\`componentWillMount\`, \`componentWillReceiveProps\`, \`componentWillUpdate\`** are deprecated, not removed: they still run in React 19. They ran in the render phase and invited side effects that break under concurrent rendering. Under the old names React logs a "has been renamed" warning in development; the \`UNSAFE_\`-prefixed names warn only inside StrictMode. Replace them with \`componentDidMount\` (or the constructor), deriving during render or a \`key\` reset, and \`getSnapshotBeforeUpdate\` + \`componentDidUpdate\` respectively.

#### Class vs function components

| Feature | Class | Function |
|---|---|---|
| State | \`this.state\` / \`this.setState()\` | \`useState\`, \`useReducer\` |
| Side effects | \`componentDidMount\` / \`DidUpdate\` / \`WillUnmount\` | \`useEffect\` with deps and cleanup |
| \`this\` binding | Required | Not needed |
| Error boundaries | Yes | No (wrap in a class) |
| Modern usage | Legacy code and error boundaries | The standard |

**Migrating one:** move each state field to \`useState\` (or the lot to \`useReducer\`), turn instance fields such as timers into \`useRef\`, and replace the mount/update/unmount trio with one \`useEffect\` **per concern**, whose dependency array replaces the \`prevProps\` guard and whose cleanup replaces \`componentWillUnmount\`. The \`UserLoader\` above becomes about ten lines that way. Keep error boundaries as classes.

### 3.3 Component Composition

Composition is how React reuses code: instead of one component *inheriting* from another, a component renders other components, or accepts them through the \`children\` prop and places them inside itself. The wrapper (\`Card\` below) owns the frame and styling and knows nothing about what goes inside, so the same \`Card\` works for a user, a product or an error message without a new subclass for each.

\`\`\`tsx
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

interface User { name: string; email: string }

function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </Card>
  );
}

render(<UserCard user={{ name: 'Alice', email: 'alice@example.com' }} />);
\`\`\`

### 3.4 Component Organization

One component per file with a named export is the most common convention. The file name then tells you where a component lives, and a named export means every import uses the same name, so renames and "find all references" work reliably (a default export can be imported under any name).

\`\`\`
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
\`\`\`

---

## 4. Props

Props are the inputs a parent passes to a child, like arguments to a function. They are read-only: the child must never modify them, because the parent owns that data and would not know it changed. To change a value, the child calls a callback prop (such as \`onEdit\` below) and lets the parent update its own state.

\`\`\`tsx
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
type ButtonProps = { variant: 'primary' | 'secondary' };

function Button({ variant, ...rest }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={variant} {...rest} />;
}

// Usage
render(
  <UserCard name="Alice" age={30} onEdit={(id) => console.log('edit', id)}>
    <Button variant="primary" onClick={() => console.log('clicked')}>Follow</Button>
  </UserCard>
);
\`\`\`

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

\`useState\` is the primary hook for adding state to function components. It returns a state value and a setter function that triggers a re-render when called.

\`\`\`tsx
function loadSavedDraft() {
  console.log('reading the draft');   // imagine an expensive parse here
  return 'Hello';
}

function Counter() {
  const [count, setCount] = useState(0);
  // Lazy initialiser: pass the function itself, and React calls it on the first render only.
  // useState(loadSavedDraft()) would call it on every render and throw the result away.
  const [draft, setDraft] = useState(loadSavedDraft);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(prev => prev + 1)}>Increment (functional)</button>
      <input value={draft} onChange={e => setDraft(e.target.value)} />
    </div>
  );
}
\`\`\`

### 5.2 State Update Rules

State updates have three rules, and all three fall out of a single idea: **the state variable in a render is a snapshot, not a live value.**

When a component renders, React hands it the value state had *at the start of that render*. \`count\` is a \`const\` for the whole render, and event handlers defined during it close over that snapshot. Calling \`setCount\` does not edit it; it queues a request for a *new* render with a new value. Almost every state bug comes from expecting the snapshot to be live.

#### Rule 1 — Updates are batched, so a render sees one fixed value

\`setState\` doesn't assign; it schedules. React collects every update triggered by the same piece of work, then performs **one** re-render with the final result. This is **batching**: the UI never flickers through half-updated states, and you pay for one render instead of one per call. It is why the classic double-increment doesn't work:

\`\`\`tsx
// count is 0 in this render
setCount(count + 1);   // queues "set count to 0 + 1" → 1
setCount(count + 1);   // queues "set count to 0 + 1" → 1  (count is STILL 0 here)
// after re-render: count === 1, not 2
\`\`\`

Both lines read \`count\` from the same snapshot, so both compute \`1\`. The second doesn't overwrite the first so much as duplicate it. The corollary catches people just as often — **you cannot read your own update back**:

\`\`\`tsx
setCount(count + 1);
console.log(count);   // still the old value. The new one exists only in the next render.
\`\`\`

If you need the new value in the same function, compute it in a plain variable (\`const next = count + 1\`) and use that. If you need to *react* to it, that's what \`useEffect\` on \`[count]\` is for.

**React 18 changed the scope of this.** Batching used to apply only inside React event handlers; updates in a \`setTimeout\`, a promise callback or a native event listener each triggered their own render. Since React 18's \`createRoot\`, batching is **automatic everywhere**. On the rare occasion you need a DOM measurement between two updates, \`flushSync\` from \`react-dom\` opts out for that call — it forces a synchronous re-render, and using it routinely defeats the point.

#### Rule 2 — State is read-only, so replace instead of mutating

React decides whether anything changed by comparing the new value to the old with **\`Object.is\`**. For a number or string that compares the value. For an object or array it compares the **reference** — the identity of the box, not its contents.

So if you mutate and hand back the same object, React sees the same reference, concludes nothing changed, and **skips the re-render entirely**. Your data is genuinely different and the screen is genuinely stale:

\`\`\`tsx
user.name = 'Bob';   // the object changed
setUser(user);       // ...but it's the same reference, so Object.is says "equal"
                     // → React bails out, no re-render
\`\`\`

Referential equality is load-bearing in more places than the re-render check, which is why mutation causes symptoms that look unrelated to state:

| What relies on a new reference | What mutation does to it |
|---|---|
| The re-render bail-out | Skips the render — the UI never updates |
| \`React.memo\` on a child | Child sees "same props", doesn't re-render |
| \`useEffect\` / \`useMemo\` dependency arrays | Dependency looks unchanged, so the effect never re-runs |
| React DevTools and Strict Mode | Double-invoked renders expose the mutation as inconsistent output |

The fix is always the same shape: **build a new object or array for the parts you changed**, and reuse the rest by reference.

\`\`\`tsx
setUser({ ...user, name: 'Bob' });          // new object, one field replaced
setUser(prev => ({ ...prev, name: 'Bob' })); // same, using the updater form
\`\`\`

Spreading is *shallow*, so nesting needs a new object at every level along the path you're changing:

\`\`\`tsx
// Changing user.address.city — address must be recreated too
setUser(prev => ({ ...prev, address: { ...prev.address, city: 'Paris' } }));
\`\`\`

For arrays, the practical rule is to prefer the methods that **return** a new array over the ones that modify in place:

| Operation | Don't (mutates) | Do (returns new) |
|---|---|---|
| Add to end | \`items.push(x)\` | \`[...items, x]\` |
| Add to front | \`items.unshift(x)\` | \`[x, ...items]\` |
| Remove | \`items.splice(i, 1)\` | \`items.filter((_, idx) => idx !== i)\` |
| Replace one | \`items[i] = x\` | \`items.map((it, idx) => idx === i ? x : it)\` |
| Insert at \`i\` | \`items.splice(i, 0, x)\` | \`[...items.slice(0, i), x, ...items.slice(i)]\` |
| Sort / reverse | \`items.sort()\` | \`items.toSorted()\` (ES2023) or \`[...items].sort()\` |

\`sort\` and \`reverse\` slip through review because they return the *same* array, mutated; ES2023's \`toSorted\`, \`toReversed\`, \`toSpliced\` and \`with\` remove the trap. If spreading nested state gets unreadable, flatten the shape or use **Immer** (which Redux Toolkit's \`createSlice\` uses): you write mutating-looking code and it produces the new object.

#### Rule 3 — Use an updater function when the next value depends on the current one

Passing a **function** to the setter changes where the previous value comes from. Instead of reading the render's snapshot, React calls your function with the **latest value in the queue**, applying each one in order during the next render:

| Queue entry | \`setCount(count + 1)\` twice | \`setCount(prev => prev + 1)\` twice |
|---|---|---|
| 1st | "replace with 1" (\`count\` = 0) | \`0 => 1\` |
| 2nd | "replace with 1" (\`count\` = 0) | \`1 => 2\` |
| Result | **1** | **2** |

Use the updater form whenever the new state is derived from the old. It is not merely tidier — it is *required* in three situations:

- **Several updates in one event**, as above.
- **Updates from async code** — a \`setTimeout\`, \`setInterval\`, a \`fetch\` callback or a debounced handler. These run long after the render that created them, so their captured snapshot is stale. \`setCount(c => c + 1)\` always sees the current value; \`setCount(count + 1)\` sees whatever \`count\` was when the timer was set. This is the **stale closure** bug, and it's the usual reason a counter driven by \`setInterval\` freezes at 1.
- **When you want to keep a dependency array empty.** Because the updater doesn't read \`count\`, a \`useCallback\` or \`useEffect\` that only ever *increments* needs no \`count\` dependency — so the callback identity stays stable and memoised children stop re-rendering.

One constraint: **updaters must be pure.** Compute and return the next state, with no side effects, no mutation of \`prev\`, and no requests. React may call an updater more than once — in development Strict Mode deliberately double-invokes it to surface impurity — so anything with a side effect will happen twice.

### 5.3 useReducer (Complex State)

\`useReducer\` is an alternative to \`useState\` for state with several related values. Instead of calling setters directly, a component **dispatches** an action (a plain object such as \`{ type: 'increment' }\` describing what happened), and a **reducer** — a pure function \`(state, action) => newState\` — decides what the next state is. The benefit is that every possible state change lives in one function you can read and unit-test on its own, rather than being spread across event handlers. It is the same pattern Redux uses, scoped to one component.

\`\`\`tsx
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
\`\`\`

### 5.4 Component Communication

There are five mechanisms, and the skill is knowing which one a relationship needs; reaching for Context or a state library too early is the usual mistake.

**1. Parent → child: props.** The default, and it covers most cases.

\`\`\`jsx
function Parent() {
  return <UserCard name="Ana" role="Engineer" />;
}
function UserCard({ name, role }) {
  return <p>{name} — {role}</p>;
}

render(<Parent />);
\`\`\`

**2. Child → parent: a callback prop.** Data flows one way in React, so a child cannot "set" the parent's state. The parent passes a function down and the child calls it — the child reports an event, the parent decides what it means.

\`\`\`jsx
function Parent() {
  const [query, setQuery] = useState('');
  return (
    <>
      <SearchBox onSearch={setQuery} />       {/* pass the setter (or a handler) */}
      <Results query={query} />
    </>
  );
}

function SearchBox({ onSearch }) {
  const [value, setValue] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onSearch(value); }}>
      <input value={value} onChange={e => setValue(value => e.target.value)} />
    </form>
  );
}

// stand-in so this example runs on its own
const Results = ({ query }) => <p>Results for: {query || '(nothing yet)'}</p>;

render(<Parent />);
\`\`\`

Note the child keeps its **own** input state and only notifies the parent on submit. Lifting every keystroke to the parent re-renders the whole subtree on each character — a common and avoidable performance bug.

**3. Sibling ↔ sibling: lift the state up.** Siblings cannot see each other, so shared state moves to their **closest common ancestor** and comes back down as props. That is all "lifting state up" means.

\`\`\`jsx
function Dashboard() {
  const [selectedId, setSelectedId] = useState(null);   // lifted: both need it
  return (
    <>
      <JobList onSelect={setSelectedId} selectedId={selectedId} />
      <JobDetail id={selectedId} />
    </>
  );
}

// stand-ins so this example runs on its own
const JobList = ({ onSelect, selectedId }) => (
  <ul>
    {[1, 2, 3].map(id => (
      <li key={id}>
        <button onClick={() => onSelect(id)}>{id === selectedId ? '▶ ' : ''}Job {id}</button>
      </li>
    ))}
  </ul>
);
const JobDetail = ({ id }) => <p>{id ? \`Details for job \${id}\` : 'Pick a job'}</p>;

render(<Dashboard />);
\`\`\`

The trade-off: state placed too high re-renders more of the tree than necessary, so lift it to the **closest** common parent, not to the root.

**4. Deeply nested: Context.** When a value must reach a distant descendant and every layer in between would just forward it — "prop drilling" — Context skips the middle.

\`\`\`jsx
const ThemeContext = createContext('light');

function App()   { return <ThemeContext.Provider value="dark"><Page /></ThemeContext.Provider>; }
function Button() { const theme = useContext(ThemeContext); /* … */ }
\`\`\`

Two or three levels of forwarding is not worth solving; prop drilling is a smell only when intermediate components take props they never use. Context has a cost (every consumer re-renders when the value changes), covered in [§11](#11-context-api) and [Q33](/frontend/react-interview-questions).

**5. Parent → child *imperatively*: refs.** For actions rather than data — focusing an input, playing a video, scrolling a list. In React 19 \`ref\` is a normal prop, so \`forwardRef\` is no longer needed.

\`\`\`jsx
function Form() {
  const inputRef = useRef(null);
  return (
    <>
      <TextInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </>
  );
}
function TextInput({ ref, ...props }) { return <input ref={ref} {...props} />; }

render(<Form />);
\`\`\`

Use \`useImperativeHandle\` to expose a **narrow** API (\`{ focus, clear }\`) rather than the raw DOM node.

**Beyond that: external state.** When unrelated branches of the tree share server or global state, the answer is a store rather than more lifting — **TanStack Query** for server state, **Zustand/Redux** for client state. See [§11.3](#113-server-state-vs-client-state-the-most-important-distinction) on why that distinction matters.

| Relationship | Use | Notes |
|---|---|---|
| Parent → child | **props** | the default |
| Child → parent | **callback prop** | keep transient state local, notify on commit |
| Sibling ↔ sibling | **lift state** to the closest common parent | not to the root |
| Distant descendant | **Context** | only for genuine prop drilling; memoise the value |
| Imperative action | **ref** + \`useImperativeHandle\` | actions, not data |
| Unrelated branches | **store** (TanStack Query / Zustand) | server vs client state |

---

## 6. Hooks

### 6.1 Rules of Hooks

1. **Only call hooks at the top level** — not inside loops, conditions, or nested functions
2. **Only call hooks from React functions** — components or custom hooks

**Why these rules exist:** React does not know your hooks by name. It stores each component's hook state in a list and matches the first \`useState\` call to slot 1, the second to slot 2, and so on, **by call order**. If a hook sits inside an \`if\`, a render where the condition is false skips it, every later hook shifts up one slot, and each one receives another hook's state. Calling hooks at the top level guarantees the same order on every render. The second rule exists because only a component or custom hook runs while React is tracking that list. The linter plugin \`eslint-plugin-react-hooks\` enforces both. [Q47](/frontend/react-interview-questions) walks through the mechanism in detail.

### 6.2 Built-in Hooks Reference

The built-in hooks fall into a few buckets:

| Bucket | Hooks | Use for |
|---|---|---|
| **State** | \`useState\`, \`useReducer\` | Component-local state |
| **Side effects** | \`useEffect\`, \`useLayoutEffect\`, \`useInsertionEffect\`, \`useEffectEvent\` | Synchronizing with the outside world |
| **Context** | \`useContext\` | Reading values from a Provider |
| **Refs** | \`useRef\`, \`useImperativeHandle\` | Mutable values + DOM access |
| **Memoization** | \`useMemo\`, \`useCallback\` | Avoid expensive recomputes |
| **Concurrent** | \`useTransition\`, \`useDeferredValue\` | Mark updates as non-urgent |
| **External data** | \`useSyncExternalStore\` | Subscribe to non-React stores |
| **Misc** | \`useId\`, \`useDebugValue\` | SSR-safe IDs, devtools labels |
| **Actions and forms** (React 19) | \`useActionState\`, \`useFormStatus\`, \`useOptimistic\`, plus the \`use()\` API | Covered in [§16](/frontend/react-19-patterns#16-react-19-features) |

Each entry below gives what the hook does, when to reach for it, and the most common mistake.

#### \`useState\` — basic local state

\`const [state, setState] = useState(initialValue)\` stores a value across re-renders and returns a setter that triggers a re-render. Use it for any component-local value that affects the UI. **Pitfall:** \`setState(state + 1)\` reads the render's snapshot, so for updates that depend on the previous value pass a function, \`setState(s => s + 1)\`. See [§5.1](#51-usestate) (including the lazy initialiser) and [§5.2](#52-state-update-rules).

#### \`useReducer\` — state with a reducer function

\`\`\`tsx
type State = { count: number };
type Action = { type: 'inc' } | { type: 'reset' };

const reducer = (s: State, a: Action): State =>
  a.type === 'inc' ? { count: s.count + 1 } : { count: 0 };

const init = (n: number): State => ({ count: n });   // runs once, lazily

function Counter() {
  // Two forms. The third argument is a lazy initialiser, called with the second.
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  const [lazyState, lazyDispatch] = useReducer(reducer, 10, init);

  return (
    <button onClick={() => { dispatch({ type: 'inc' }); lazyDispatch({ type: 'inc' }); }}>
      {state.count} / {lazyState.count}
    </button>
  );
}
\`\`\`

**What it does.** Same job as \`useState\`, but every transition goes through a \`(state, action) => newState\` function, triggered by \`dispatch({ type: '...' })\`.

**When to use it.** When several sub-values update together, when the next state depends on the previous one in non-trivial ways, or when you want the update logic in one testable function (forms with many fields, undo/redo). **Pitfall:** a single boolean does not need a reducer. See [§5.3](#53-usereducer-complex-state).

#### \`useEffect\` — synchronize with external systems

\`\`\`text
useEffect(setup, deps?)
  setup: () => void | (() => void)   // return a cleanup, or nothing
  deps:  unknown[]                   // omitted = run after every render
\`\`\`

**What it does.** Runs \`setup\` after React commits the render, usually after the browser paints (an effect caused by a discrete interaction such as a click can be flushed before paint). The optional cleanup runs before the next setup and on unmount.

**When to use it.** Subscriptions, listeners, timers, integrating non-React libraries. **Not** for deriving state from props (compute it during render) and **not** for responding to user events (use the handler).

**Pitfall — a missing cleanup.** Without one you leak listeners and timers, stack up duplicate subscriptions each time the effect re-runs, and let a slow old request overwrite newer data (a race condition). See [§7](#7-effects-and-lifecycle), and [§7.4](#74-when-not-to-use-useeffect) for when not to use it.

#### \`useContext\` — read from a Provider

\`const value = useContext(MyContext)\` subscribes the component to the nearest Provider above it, and re-renders it whenever that \`value\` changes by reference. Use it for cross-cutting values many components read: theme, current user, locale. **Pitfall:** an object literal as \`value\` is new on every provider render, so every consumer re-renders every time. See [§11](#11-context-api).

#### \`useRef\` — mutable box that survives re-renders

\`const ref = useRef(initialValue)\` returns a stable \`{ current }\` object. Writing \`ref.current\` does **not** re-render. Two uses: DOM references (\`<input ref={inputRef} />\`) and instance variables that don't drive the UI (timer ids, previous values, "already ran" flags). **Pitfall:** reading or writing \`.current\` during render makes render impure; do it in effects and handlers. See [§12](#12-refs).

#### \`useMemo\` and \`useCallback\` — keep a value or function between renders

\`useMemo(() => compute(a, b), [a, b])\` caches a result until a dependency changes (by \`Object.is\`). \`useCallback(fn, deps)\` is the same thing for a function: \`useMemo(() => fn, deps)\`. Use them for genuinely expensive pure computations, or to keep the identity of an object or function stable for a \`React.memo\` child or a dependency array. **Pitfalls:** wrapping cheap values adds bookkeeping for nothing, and \`useCallback\` does nothing unless the receiver is memoised. See [§13.2](/frontend/react-performance#132-usememo-and-usecallback).

#### \`useImperativeHandle\` — expose methods on a ref

\`\`\`text
useImperativeHandle(ref, () => ({
  focus: () => inputRef.current?.focus(),
  scrollTo: (y) => containerRef.current?.scrollTo(0, y),
}), []);
\`\`\`

**What it does.** When a parent passes a \`ref\` to your component, this hook customises what \`ref.current\` exposes: a few methods instead of the DOM node. Use it sparingly, for genuine commands (focus, scroll, play). **Pitfall:** using it to "trigger something in a child" usually means prop-driven state would do the job.

#### \`useLayoutEffect\` — synchronous effect before paint

Same signature as \`useEffect\`, but runs **synchronously after DOM mutation and before the browser paints**, so the user never sees the in-between state. Use it to read layout (\`getBoundingClientRect\`, \`scrollHeight\`) and adjust the DOM where \`useEffect\` would flicker: positioning a tooltip, scrolling a chat to the bottom. **Pitfall:** it blocks paint, so heavy work here freezes the UI. Default to \`useEffect\` and switch only when you see a flicker.

#### \`useDebugValue\` — label a custom hook in DevTools

\`\`\`tsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  // Shows "Online" / "Offline" beside the hook in React DevTools.
  useDebugValue(isOnline ? 'Online' : 'Offline');
  return isOnline;
}
\`\`\`

Worth adding in shared hooks that ship in libraries; for app-internal hooks the variable names already tell DevTools enough. If formatting the label is expensive, pass a \`formatFn\` as the second argument: it runs only when DevTools inspects the hook.

#### \`useSyncExternalStore\` — subscribe to a non-React store

\`\`\`tsx
function useWindowWidth() {
  return useSyncExternalStore(
    (onChange) => {                                  // subscribe; return an unsubscribe
      window.addEventListener('resize', onChange);
      return () => window.removeEventListener('resize', onChange);
    },
    () => window.innerWidth,                         // getSnapshot
    () => 1024,                                      // getServerSnapshot: without it, server rendering throws
  );
}

function Width() {
  return <p>Window width: {useWindowWidth()}px</p>;
}
\`\`\`

**What it does.** Subscribes a component to a store that lives outside React (Redux, Zustand, \`matchMedia\`, an event emitter) and re-renders it when the store changes. It exists instead of "\`useState\` + \`useEffect\`" because of **tearing**: under concurrent rendering React can pause a render halfway, and if the store changes during the pause, components rendered before and after would show different values on one screen. \`useSyncExternalStore\` detects that and re-renders consistently.

**When to use it.** Building a state library or wrapping a browser API in a hook. Users of Redux or Zustand never call it directly; the libraries do. **Pitfall:** \`getSnapshot\` must return the same (\`===\`) value while nothing changed, so never build a fresh object in it, or React re-renders forever.

#### \`useId\` — stable, unique, SSR-safe IDs

\`\`\`tsx
function NameField() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Name</label>
      <input id={id} />
    </>
  );
}
\`\`\`

Generates an ID that is stable across renders and identical on server and client, so linking labels to inputs or \`aria-describedby\` never causes a hydration mismatch (\`Math.random()\` and counters do). **Pitfall:** it is per component instance, not per data item, so never use it as a list \`key\`.

#### \`useTransition\` — mark updates as non-urgent

\`const [isPending, startTransition] = useTransition()\` marks the state updates made inside \`startTransition\` as low priority. React keeps the current UI responsive while the transition renders, and abandons that render if an urgent update (another keystroke) arrives.

**The non-obvious part:** the callback you pass to \`startTransition\` runs **immediately and synchronously**. Only the *render* it schedules is interruptible. So \`startTransition(() => setResults(filter(query)))\` does not help: the filter still blocks every keystroke. Put the expensive work in the render instead:

\`\`\`tsx
// stand-in data so this example runs on its own
const ITEMS = Array.from({ length: 20000 }, (_, i) => \`Item \${i}\`);

function Search() {
  const [query, setQuery] = useState('');              // urgent: drives the input
  const [filterQuery, setFilterQuery] = useState('');  // non-urgent: drives the list
  const [isPending, startTransition] = useTransition();

  // Runs during the transition's render, which React can throw away for a newer keystroke.
  const results = useMemo(
    () => ITEMS.filter((item) => item.includes(filterQuery)).slice(0, 200),
    [filterQuery],
  );

  return (
    <>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          startTransition(() => setFilterQuery(e.target.value));
        }}
      />
      <ul style={{ opacity: isPending ? 0.5 : 1 }}>
        {results.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </>
  );
}
\`\`\`

A transition does not make a network call or a timer faster either; it only changes how React schedules state updates. React 19 also accepts an async function (an "Action", see [§16.2](/frontend/react-19-patterns#162-actions-and-useactionstate)), but a \`set\` call after an \`await\` inside it is no longer part of the transition unless you wrap it in \`startTransition\` again. [§13.5](/frontend/react-performance#135-concurrent-features-usetransition-usedeferredvalue) covers both concurrent hooks in depth.

#### \`useDeferredValue\` — render a stale value while a fresh one catches up

\`const deferredQuery = useDeferredValue(query)\` returns a value that lags behind its input: React renders with the old value first, then re-renders with the new one at low priority. It solves the same problem as \`useTransition\` when you don't own the setter (the value is a prop): you defer the *value* instead of wrapping the update. **Pitfall:** don't stack both on the same update; pick one.

### 6.3 Custom Hooks

A custom hook is a function whose name starts with \`use\` and which calls other hooks. The naming convention is what lets the linter apply the rules of hooks to it.

**They share stateful logic, not state.** Two components calling \`useToggle()\` each get their own independent value. For shared *state* you need context or a store.

Each block below is the hook to actually write, followed by a component that uses it.

#### \`useToggle\` — the shape of a custom hook

The simplest useful one. It establishes the pattern: private state, a stable action, a tuple return.

\`\`\`tsx
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  // Functional update, so \`toggle\` never needs \`value\` as a dependency and
  // its identity stays stable for the life of the component.
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue] as const;
}

function Panel() {
  const [isOpen, toggleOpen, setOpen] = useToggle();
  return (
    <>
      <button onClick={toggleOpen} aria-expanded={isOpen}>
        {isOpen ? 'Hide' : 'Show'} details
      </button>
      {isOpen && <p>Some details. <button onClick={() => setOpen(false)}>Close</button></p>}
    </>
  );
}
\`\`\`

**Why \`as const\`.** Without it the return type widens to \`(boolean | (() => void))[]\` and destructuring gives you a union in both positions. \`as const\` makes it a tuple, so \`isOpen\` is \`boolean\` and \`toggleOpen\` is callable.

#### \`useDebounce\` — delay a fast-changing value

Returns a copy of \`value\` that only updates once \`delay\` has passed with no further changes. The classic use is a search box: react to typing, but not on every keystroke.

\`\`\`tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // The important line: a new keystroke runs this cleanup, cancelling the
    // pending timer before scheduling the next one.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 500);

  // Fires 500 ms after typing stops, not on every keystroke.
  useEffect(() => { onSearch(debounced); }, [debounced, onSearch]);

  // The input stays bound to \`query\`, so typing feels instant.
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}

function Demo() {
  // useCallback keeps onSearch stable, so the effect above only re-runs when \`debounced\` changes.
  const onSearch = useCallback((q: string) => console.log('search:', q), []);
  return <SearchBox onSearch={onSearch} />;
}
\`\`\`

**The cleanup *is* the debounce**: without it you get one update per keystroke, just late. The first value is returned immediately, because \`useState(value)\` seeds it. And note the split: the input reads \`query\` (immediate), the effect reads \`debounced\`. Binding the input to \`debounced\` would make the field feel broken.

#### \`useFetch\` — the canonical "build one live" ask

One state object as a discriminated union, and an \`aborted\` guard in both handlers:

\`\`\`tsx
// stand-in so this example runs on its own: a fake fetch that answers after 600 ms
const fetch = (url: string, _init?: { signal?: AbortSignal }) =>
  new Promise<Response>((resolve) => setTimeout(() =>
    resolve(new Response(JSON.stringify({ id: 1, name: \`Ada (from \${url})\` }))), 600));

type FetchState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T;    error: null }
  | { status: 'error';   data: null; error: Error };

function useFetch<T>(url: string | null) {
  const [state, setState] = useState<FetchState<T>>({
    status: 'loading', data: null, error: null,
  });

  useEffect(() => {
    if (!url) return;
    const ac = new AbortController();
    // Reset on every url change, so a stale payload is never shown as fresh.
    setState({ status: 'loading', data: null, error: null });

    fetch(url, { signal: ac.signal })
      .then(async r => {
        if (!r.ok) throw new Error(\`HTTP \${r.status} \${r.statusText}\`);
        return (await r.json()) as T;
      })
      .then(data => {
        if (ac.signal.aborted) return;
        setState({ status: 'success', data, error: null });
      })
      .catch(e => {
        if (ac.signal.aborted) return;
        setState({ status: 'error', data: null, error: e instanceof Error ? e : new Error(String(e)) });
      });

    return () => ac.abort();
  }, [url]);

  return state;
}

type User = { id: number; name: string };

function Profile({ id }: { id: number }) {
  const { status, data, error } = useFetch<User>(\`/api/users/\${id}\`);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'error') return <p role="alert">{error.message}</p>;
  return <h1>{data.name}</h1>;   // \`data\` is User here, not User | null
}

render(<Profile id={1} />);
\`\`\`

**The three things an interviewer is listening for:**

1. **\`if (ac.signal.aborted) return\` in both handlers, not \`.finally\`.** When \`url\` changes, React runs the old effect's cleanup and the new effect body in the same commit, and the old promise settles a microtask later:

   \`\`\`
   ac.abort()               old request killed
   setState(loading)        new effect starts
   --- microtasks flush ---
   old chain settles        ← still writes state unless guarded
   \`\`\`

   A \`.finally(() => setLoading(false))\` runs on **every** settlement, including an abort, so \`loading\` would go false while the new request is in flight and the previous URL's data would render as fresh. The guard stops a cancelled request from touching state at all.
2. **Resetting to \`loading\` at the top of the effect.** Otherwise \`data\` and \`error\` from the previous URL survive into the new request: switching from user 1 to user 2 shows user 1 throughout.
3. **One state object, not three \`useState\` calls.** Three pieces of state can disagree; a union cannot. And once you narrow on \`status\`, \`data\` is \`T\`, not \`T | null\`.

**Composed with \`useDebounce\`**, pass \`null\` as the skip signal and encode the query:

\`\`\`text
const debounced = useDebounce(query, 500);
const { status, data } = useFetch<Result[]>(
  debounced.trim() ? \`/api/search?q=\${encodeURIComponent(debounced.trim())}\` : null,
);
\`\`\`

With \`url === null\` the effect returns early and the state keeps whatever it was, so clearing the input leaves the last results on screen. To clear them, add an \`idle\` status and set it in the bail-out: \`if (!url) { setState({ status: 'idle', data: null, error: null }); return; }\`.

**If asked for more:** \`r.json()\` throws on a \`204\` or empty body, so guard with \`r.status === 204 ? null : r.json()\`. \`(await r.json()) as T\` is an assertion, not a guarantee; validate at the boundary with Zod or Valibot. And in production this is TanStack Query or SWR, which add caching, de-duplication, background refetch and retry. Writing it by hand is a good exercise in cancellation; shipping it by hand re-implements a solved problem.

#### \`useLocalStorage\` — persist state, safely

\`\`\`tsx
function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    // Unavailable storage, or a corrupt value. Either way: fall back.
    return fallback;
  }
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => safeRead(key, initialValue));

  // Re-read when the key changes, so we never write one key's value to another.
  const keyRef = useRef(key);
  if (keyRef.current !== key) {
    keyRef.current = key;
    setValue(safeRead(key, initialValue));   // render-phase update: allowed, re-renders immediately
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded, or storage disabled. The app keeps working; the
      // preference just will not survive a reload.
    }
  }, [key, value]);

  // Cross-tab sync. The \`storage\` event fires in OTHER tabs, never the one
  // that wrote, so there is no feedback loop to guard against.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setValue(safeRead(key, initialValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialValue is
    // only a fallback; re-subscribing when its identity changes is pointless.
  }, [key]);

  return [value, setValue] as const;
}

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('demo-theme', 'light');
  // The setter is useState's own, so the functional form works as usual.
  return (
    <button onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}>
      Theme: {theme} (click to switch)
    </button>
  );
}
\`\`\`

**Why every access is wrapped in \`try\`/\`catch\`.** Web storage does not return \`null\` when unavailable: **accessing it throws** a \`SecurityError\` in a private window, with site data blocked, or in some embedded contexts. That read sits in a \`useState\` initialiser, which runs **during render**, so an unguarded throw unmounts the tree and the user gets a blank page. \`JSON.parse\` on a half-written or hand-edited value is the same hazard.

**Why the key is re-read.** Without the \`keyRef\` check the state does not follow a changed \`key\`, but the effect still *writes*, so switching from key \`a\` to key \`b\` writes \`a\`'s value into \`b\`.

**The generic is a claim, not a guarantee**, as in \`useFetch\`: \`JSON.parse(raw) as T\` will happily hand you a number. If the value matters, validate it: \`raw === 'dark' || raw === 'light' ? raw : fallback\`.

#### \`useMediaQuery\` — subscribe to something outside React

The pattern for any external subscription: subscribe in the effect, unsubscribe in the cleanup, and make the dependency array exactly what the subscription depends on.

\`\`\`tsx
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);                 // resync in case it changed before we subscribed
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

function Nav() {
  const isWide = useMediaQuery('(min-width: 768px)');
  return <nav>{isWide ? 'Desktop nav (narrow the window below 768px)' : 'Mobile nav (widen the window past 768px)'}</nav>;
}
\`\`\`

The component says nothing about listeners, and every consumer gets the cleanup and the resync for free. For a value you read *from* an external store rather than an event stream, prefer [\`useSyncExternalStore\`](#usesyncexternalstore-subscribe-to-a-non-react-store).

#### What makes a custom hook worth extracting

- The same \`useState\` + \`useEffect\` + cleanup shape appears in more than one component.
- A component's logic obscures what it renders, and extracting it makes the component read like a description of its UI.
- **Not** when it is used once and does not simplify that place, and not as an eight-parameter hook returning twelve values (that is a component that should have been split).

The senior signal in all of these is reaching for the **cleanup and the failure path** unprompted.

---

## 7. Effects and Lifecycle

### 7.1 useEffect

\`useEffect\` runs side effects (subscriptions, timers, network requests, DOM work) after React has committed the render. The dependency array controls when it re-runs.

\`\`\`text
useEffect(() => { console.log('rendered'); });          // after every render
useEffect(() => { connect(); }, []);                    // once, after mount
useEffect(() => { fetchUser(userId); }, [userId]);      // when userId changes

useEffect(() => {
  const subscription = api.subscribe(userId, handleUpdate);
  return () => subscription.unsubscribe();              // cleanup: before the next run and on unmount
}, [userId]);
\`\`\`

### 7.2 Lifecycle Mapping (Class -> Hooks)

\`componentDidMount\` → \`useEffect(fn, [])\`, \`componentDidUpdate\` → \`useEffect(fn, [deps])\`, \`componentWillUnmount\` → the effect's cleanup, \`shouldComponentUpdate\` → \`React.memo\`. The full table, with the mistake each method invites, is in [§3.2](#lifecycle-methods-and-their-hook-equivalents).

### 7.3 Common Pitfalls

Three mistakes account for most \`useEffect\` bugs. All three come from the same fact: an effect is a closure over the render that created it, so it sees that render's values and nothing newer.

\`\`\`text
// 1. Missing dependency
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1);                   // BUG: count is stale (closure)
  }, 1000);
  return () => clearInterval(timer);
}, []);                                     // count not in deps
// FIX: setCount(prev => prev + 1);

// 2. Object/array in dependency array
useEffect(() => {
  fetchData(filters);
}, [filters]);                             // BUG: new object reference every render
// FIX: depend on the fields: [filters.search, filters.page]

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
\`\`\`

1. **Stale closure.** With \`[]\` the effect runs once, so the interval callback keeps the \`count\` from the first render (0) forever and sets 1 every second. The updater form asks React for the current value instead, so the dependency array can honestly stay empty.
2. **Object dependency.** React compares dependencies with \`Object.is\`, which for an object means "same reference?". A \`filters\` object built during render is new every render, so the effect re-runs every render (an infinite fetch loop if the fetch sets state). Depending on the primitive fields compares values instead.
3. **Race condition.** If \`id\` changes from 1 to 2 while request 1 is in flight, request 1 can finish *after* request 2 and overwrite the screen with the wrong user. The cleanup flips \`cancelled\` for the old effect, so the late response is ignored. An \`AbortController\` does the same and also cancels the request.

### 7.4 When NOT to Use useEffect

Knowing that **most \`useEffect\` calls you meet are unnecessary** is a strong senior signal. The hook is an escape hatch for *synchronizing with external systems* (browser APIs, network, third-party libraries), not for "do this when state changes". The React docs have a whole page on it, *You Might Not Need an Effect*.

**1. Don't use \`useEffect\` to derive state from props or other state.**

\`\`\`tsx
type Item = { id: number; name: string };
const items: Item[] = [{ id: 1, name: 'apple' }, { id: 2, name: 'banana' }];
const query = 'an';

// BAD — runs an extra render cycle just to compute something
function useFilteredBad() {
  const [filtered, setFiltered] = useState<Item[]>([]);
  useEffect(() => {
    setFiltered(items.filter(i => i.name.includes(query)));
  }, []);
  return filtered;
}

// GOOD — derive directly during render. No extra render, no out-of-sync risk.
function useFilteredGood() {
  return items.filter(i => i.name.includes(query));
}

// If the computation is genuinely expensive, memoize it — still derived, just cached.
function useFilteredMemo() {
  return useMemo(() => items.filter(i => i.name.includes(query)), []);
}
\`\`\`

**2. Don't use \`useEffect\` for data fetching** in an app. A query library (TanStack Query, SWR, RTK Query) or your framework's data layer (Remix/React Router loaders, or fetching inside Server Components in the Next.js App Router) handles caching, de-duplication, retries, race conditions and refetch-on-focus, which hand-written effect fetching gets wrong by default.

\`\`\`text
// BAD — every component re-fetches; no caching, no dedup, races on rapid prop changes
useEffect(() => { fetch(url).then(r => r.json()).then(setData); }, [url]);

// GOOD — TanStack Query handles caching, dedup, retries, focus-refresh
const { data } = useQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id) });
\`\`\`

**3. Don't use \`useEffect\` to react to an event.** If you write \`useEffect(() => { if (formSubmitted) showThankYou(); }, [formSubmitted])\`, the action belongs in the event handler that set \`formSubmitted\`.

\`\`\`text
function handleSubmit() {
  setFormSubmitted(true);
  showThankYou();          // fire it where it happens
}
\`\`\`

**4. Don't reset state with \`useEffect\`.** Instead of \`useEffect(() => { setSelected(null); }, [userId])\`, which renders once with stale state and then again, give the component a \`key\`: \`<UserProfile key={userId} userId={userId} />\` remounts it with fresh state.

**5. Do use \`useEffect\` for its actual job:** subscribing to external stores without a React adapter (\`useSyncExternalStore\` is better still), DOM work after layout (focusing, measuring, non-React listeners), browser APIs (\`IntersectionObserver\`, WebSocket, \`setInterval\` with cleanup), third-party widgets that need init and teardown (charts, maps), and server sync that isn't a user action (heartbeats, presence, telemetry).

**6. For the effects that survive, split reactive from non-reactive logic.** The remaining pain point is a value you need to *read* but don't want to *react* to: a theme used in a toast, a callback prop invoked on connect. React 19.2's \`useEffectEvent\` ([§16.7](/frontend/react-19-patterns#167-useeffectevent-non-reactive-logic-inside-effects)) gives you a function that is stable across renders yet always sees the latest props and state, so the dependency array stays honest without a lint suppression or an unwanted re-run.

---

## 8. Event Handling

React passes your handler a **synthetic event**: a React wrapper around the browser's native event with the same interface (\`target\`, \`preventDefault()\`, \`stopPropagation()\`) that behaves the same in every browser. The native event is still there as \`e.nativeEvent\` if you need it. Handlers are written in camelCase (\`onClick\`, not \`onclick\`) and you pass a function, not a string.

One pattern below is worth reading twice: \`handleItemClick(item.id)\` is *called* during render, and it returns the actual click handler. That is how you pass an argument without writing \`onClick={() => handleItemClick(item.id)}\` inline — both create a new function per item per render, so pick whichever reads better.

\`\`\`tsx
// stand-ins so this example runs on its own
const items = [{ id: 'a', name: 'First item' }, { id: 'b', name: 'Second item' }];
const submit = () => console.log('submitted with Enter');

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

render(<EventExamples />);
\`\`\`

---

## 9. Conditional Rendering and Lists

### 9.1 Conditional Rendering

React doesn't have built-in directives like \`v-if\` or \`ngIf\`. Instead, you use standard JavaScript expressions — ternaries, logical operators, and early returns.

\`\`\`tsx
type User = { name: string };
const isLoggedIn = true;
const hasError = false;
const status = 'loading';
const Dashboard = () => <p>Dashboard</p>;
const Login = () => <p>Login</p>;
const ErrorMessage = () => <p role="alert">Something broke</p>;
const Spinner = () => <p>Loading…</p>;
const DataView = () => <p>Data</p>;
const FallBack = () => <p>Unknown state</p>;

// Ternary — when there are exactly two outcomes
const a = <div>{isLoggedIn ? <Dashboard /> : <Login />}</div>;

// Logical AND — render or nothing. Careful: \`0 && <X/>\` renders "0".
const b = <div>{hasError && <ErrorMessage />}</div>;

// Early return — the clearest option for guard clauses
function UserCard({ user }: { user: User | null }) {
  if (!user) return <p>No user found</p>;
  return <div>{user.name}</div>;
}

// Object map — replaces a switch when you have several discrete states
function StatusView() {
  const statusComponents: Record<string, React.ReactNode> = {
    loading: <Spinner />,
    error: <ErrorMessage />,
    success: <DataView />,
  };
  return statusComponents[status] ?? <FallBack />;
}
\`\`\`

### 9.2 Lists

Render lists by mapping over arrays in JSX. Every list item needs a \`key\` prop that identifies it among its siblings. On the next render React matches old and new items **by key**, not by position, so it can tell that an item moved, was inserted or was removed — and keep that item's DOM node and state attached to it. Without a stable key, an item's state (a typed-in input, an open menu) can end up on the wrong row after a reorder. [§14.4](/frontend/react-performance#144-why-list-keys-matter-at-the-algorithm-level) shows the algorithm.

\`\`\`tsx
type User = { id: number; name: string };

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

// Keys: unique among siblings, stable across renders (IDs from data, not the
// array index when the list can reorder, filter or insert)

render(<UserList users={[{ id: 1, name: 'Ana' }, { id: 2, name: 'Ben' }]} />);
\`\`\`

---

## 10. Forms

### 10.1 Controlled Components

In a controlled component, React state is the single source of truth for form values: the input shows \`value={email}\` and every keystroke goes through \`setEmail\`. Because the value lives in state, you can validate on every keystroke, disable the submit button, or reformat input as the user types. The cost is a re-render of the component on every keystroke, which is fine for most forms.

\`\`\`tsx
// stand-in so this example runs on its own
const login = (credentials: { email: string; password: string }) => console.log('login', credentials.email);

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
\`\`\`

### 10.2 Uncontrolled Components (useRef)

Uncontrolled components let the DOM keep the value, the way a plain HTML form does. You set a starting value with \`defaultValue\` (not \`value\`) and read the current value through a ref, typically on submit. Nothing re-renders while the user types, so this suits simple forms, file inputs (which can only be uncontrolled) and wrapping non-React widgets. The trade-off is that you cannot react to the value until you go and read it.

\`\`\`tsx
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
\`\`\`

### 10.3 React Hook Form + Zod

For large forms with validation, a library saves you writing a \`useState\` and an error message per field. **React Hook Form** registers inputs as *uncontrolled* (the \`register\` call attaches a ref), so typing does not re-render the form on every keystroke; it re-renders when form state you actually read, such as \`errors\`, changes. **Zod** is a schema library: you describe the shape once, it validates the data at runtime, and \`z.infer\` derives the TypeScript type from the same schema, so the type and the validation cannot disagree. \`zodResolver\` connects the two.

\`\`\`tsx
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
\`\`\`

---

## 11. Context API

### 11.1 Creating and Using Context

Context solves exactly one problem: passing a value to a deeply nested component **without threading it through every component in between**. That is prop drilling, and it is tedious rather than fatal — which is worth saying plainly, because Context is routinely reached for as a state manager and it is not one. It is a transport mechanism. The state still lives in a \`useState\` or a \`useReducer\` somewhere; Context only decides who can see it.

The shape below is four parts, and two of them are conventions rather than API requirements:

\`\`\`tsx
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
function App() {
  return <Header />;   // stand-in for the rest of your app
}

render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
\`\`\`

**Why the context type is \`T | null\` and the hook throws.** \`createContext\` needs a default value, and there is rarely an honest one — a theme provider has no sensible "no provider" theme. Passing \`null\` and typing the context as \`ThemeContextType | null\` makes that explicit, and then the \`useTheme\` hook does two jobs: it converts "you forgot the Provider" from a \`Cannot read properties of null\` several frames away into a named error at the point of use, and it narrows the type so **no consumer has to handle \`null\`**. Without the hook, every component reading the context carries a null check that can never fire in practice.

**Always export the hook, never the context.** If \`ThemeContext\` itself is exported, a consumer can call \`useContext(ThemeContext)\` directly and skip the guard — so the one place you centralised the error handling gets bypassed. Exporting only \`ThemeProvider\` and \`useTheme\` makes the safe path the only path.

**The performance pitfall is the object literal**, \`value={{ theme, toggleTheme }}\`. It is a brand-new object on every provider render, so every consumer re-renders whether or not anything they use actually changed. It is the single most common Context bug. The fix is to memoise the value (\`useMemo(() => ({ theme, toggleTheme }), [theme])\`, with \`toggleTheme\` from \`useCallback\`) or to split rarely-changing values and setters into separate contexts; [§13.7](/frontend/react-performance#137-common-re-render-causes-and-fixes) has the worked example.

---

### 11.2 When to Use Context vs State Management

Context is a way to *deliver* a value, not a state manager: it has no partial subscription, so every consumer re-renders whenever the value changes. That makes it right for data that many components read and that rarely changes, and wrong for anything that updates often.

| Use Case | Solution | Why |
|----------|---------|-----|
| Theme, locale, auth user | Context | Read everywhere, changes rarely, so the re-render-every-consumer cost is seldom paid |
| Simple prop drilling (2-3 levels) | Just pass props | Explicit and free; Context would hide the data flow for no gain |
| Complex server state (API data) | TanStack Query / SWR | Caching, deduplication, refetching and retries are the whole job ([§11.3](#113-server-state-vs-client-state-the-most-important-distinction)) |
| Complex client state (many updates) | Zustand / Jotai (Redux for legacy) | A component subscribes to the slice it reads, so a frequent update does not re-render every consumer |
| Form state | React Hook Form | Keeps field values out of React state by default, so typing does not re-render the whole form |

### 11.3 Server State vs Client State — The Most Important Distinction

The most useful framing for state management: **server state and client state are different problems and should not share a tool.** Most "Redux is bloat" complaints trace back to one global store holding both.

\`\`\`
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
\`\`\`

The split has three concrete consequences:

1. **Don't put server data in Redux/Zustand.** Caching, de-duplication, refetch-on-focus, optimistic updates, retry and cancellation are *the entire job* of TanStack Query; rebuilding them on Redux is a lot of buggy boilerplate.
2. **Client state libraries can be tiny.** Once API data lives in TanStack Query, the remaining client state is a few booleans, a selected ID, the open modal. Zustand handles that in about 3 KB with no provider tree, actions or reducers; atomic libraries (Jotai) scope it per atom.
3. **Redux is no longer the default.** Reach for Redux Toolkit for a genuinely large, complex client state that benefits from its devtools and conventions, or in a codebase that already uses it.

So the answer that lands to "what state management would you use?" is: *server state in TanStack Query, client state in Zustand or Context, Redux only for a specific reason.*

---

## 12. Refs

Refs provide a way to access DOM nodes or persist mutable values across renders without causing re-renders. They're useful for managing focus, measuring elements, and storing timers.

\`\`\`tsx
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
\`\`\`

**When to use which:** a ref object (pattern 1) is the default. A **callback ref** (pattern 3) is a function React calls with the DOM node when it is attached (and with \`null\` when it is removed, unless in React 19 it returns a cleanup function instead); use it when you need to *do* something the moment the node appears, such as measuring it, especially for elements that mount later or conditionally. Pattern 4 is the pre-React-19 way to let a parent reach a child's DOM node; in React 19 \`ref\` is an ordinary prop, so \`forwardRef\` is no longer needed ([§16.9](/frontend/react-19-patterns#169-what-react-19-changed-removals-migrations-and-behaviour)).

---

## References

- [React Documentation](https://react.dev) — Official React docs with interactive examples
- [React API Reference](https://react.dev/reference/react) — Complete hooks and components API
- [React GitHub](https://github.com/facebook/react) — Source code and issue tracker
- [Building Performant React Applications](https://anshurajsingh.com/blog/react-performance-optimization) — a worked profiling, Redux Toolkit selector, code-splitting and virtualisation pass on a real dashboard app
`;export{e as default};
