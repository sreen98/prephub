const e=`# React — Complete Guide\r
\r
## Table of Contents\r
\r
- [1. What is React?](#1-what-is-react)\r
- [2. JSX](#2-jsx)\r
- [3. Components](#3-components)\r
  - [3.1 Function Components](#31-function-components-standard)\r
  - [3.2 Class Components](#32-class-components)\r
  - [3.3 Component Composition](#33-component-composition)\r
  - [3.4 Component Organization](#34-component-organization)\r
- [4. Props](#4-props)\r
- [5. State](#5-state)\r
- [6. Hooks](#6-hooks)\r
- [7. Effects and Lifecycle](#7-effects-and-lifecycle)\r
- [8. Event Handling](#8-event-handling)\r
- [9. Conditional Rendering and Lists](#9-conditional-rendering-and-lists)\r
- [10. Forms](#10-forms)\r
- [11. Context API](#11-context-api)\r
- [12. Refs](#12-refs)\r
- [13. Performance Optimization](#13-performance-optimization)\r
  - [13.1 React.memo](#131-reactmemo)\r
  - [13.2 useMemo and useCallback](#132-usememo-and-usecallback)\r
  - [13.3 Code Splitting (Lazy Loading)](#133-code-splitting-lazy-loading)\r
  - [13.4 Virtualization](#134-virtualization-large-lists)\r
  - [13.5 Concurrent Features](#135-concurrent-features-usetransition-usedeferredvalue)\r
  - [13.6 Profiling and Measurement](#136-profiling-and-measuring-performance)\r
  - [13.7 Common Re-render Causes](#137-common-re-render-causes-and-fixes)\r
  - [13.8 Image and Asset Optimization](#138-image-and-asset-optimization)\r
  - [13.9 Webpack vs Vite](#139-build-tools-webpack-vs-vite)\r
  - [13.10 Bundle Analyzers](#1310-bundle-analyzers)\r
  - [13.11 Tree Shaking and Code Splitting](#1311-tree-shaking-and-code-splitting-at-build-time)\r
  - [13.12 Server Components, SSR, Streaming](#1312-server-components-ssr-and-streaming)\r
  - [13.13 Performance Rules](#1313-performance-rules)\r
- [14. Reconciliation and Fiber](#14-reconciliation-and-fiber)\r
  - [14.1 Render → Reconcile → Commit](#141-the-render-reconcile-commit-pipeline)\r
  - [14.2 Diffing algorithm — three rules](#142-the-diffing-algorithm-three-rules)\r
  - [14.3 Type matching — re-render vs remount](#143-type-matching-when-components-survive-props-changes-vs-get-destroyed)\r
  - [14.4 Why list keys matter](#144-why-list-keys-matter-at-the-algorithm-level)\r
  - [14.5 Fiber data structure](#145-fiber-the-data-structure-that-makes-interruption-possible)\r
  - [14.6 The work loop](#146-the-work-loop-how-react-actually-traverses)\r
  - [14.7 Practical implications](#147-practical-implications)\r
- [15. Patterns and Best Practices](#15-patterns-and-best-practices)\r
- [16. React 19 Features](#16-react-19-features)\r
- [17. Interview Questions & Answers](#17-interview-questions-answers)\r
- [18. Tricky Output Questions](#18-tricky-output-questions)\r
\r
---\r
\r
## 1. What is React?\r
\r
React is a **JavaScript library for building user interfaces**, created by Meta. The one idea behind it: you write a function that says what the screen should look like for the current data, and React works out which DOM changes get the page there. You stop writing "find this element, change its text" code by hand.\r
\r
Key concepts:\r
- **Declarative** — you describe the result ("show this list"), not the steps ("append this \`<li>\`"). When data changes you describe the new result and React applies the difference, so the UI cannot drift out of sync with your data.\r
- **Component-based** — the UI is split into functions (components) that each own their markup, logic and state. You can reason about, test and reuse one piece without reading the whole page.\r
- **Virtual DOM** — a component returns a lightweight JavaScript description of the UI, not real DOM nodes. React compares the new description with the previous one and touches the real DOM only where they differ, because real DOM writes are the expensive part.\r
- **Unidirectional data flow** — data flows down, from parent to child via props. A child that wants to change something calls a function its parent passed in. That makes it easy to answer "where did this value come from?": look upward.\r
- **JSX** — HTML-like syntax inside JavaScript. It is only syntax: each tag compiles to a function call (see §2).\r
\r
---\r
\r
## 2. JSX\r
\r
JSX is a syntax extension that lets you write HTML-like code in JavaScript. It compiles to \`React.createElement()\` calls.\r
\r
\`\`\`tsx\r
const name = 'Alice';\r
\r
// JSX\r
const fromJsx = <h1 className="title">Hello, {name}!</h1>;\r
\r
// Compiles to exactly this\r
const fromCreateElement = React.createElement('h1', { className: 'title' }, \`Hello, \${name}!\`);\r
\`\`\`\r
\r
### JSX Rules\r
\r
\`\`\`tsx\r
const user = { name: 'Alice' };\r
const isActive = true;\r
const items = [1, 2, 3];\r
const handler = () => {};\r
const buttonProps = { type: 'button' as const, disabled: false };\r
const Button = (p: { type?: 'button'; disabled?: boolean }) => <button {...p} />;\r
\r
// 1. Single root element — a Fragment gives you one without a wrapper node\r
function Card() {\r
  return (\r
    <>\r
      <h1>Title</h1>\r
      <p>Content</p>\r
    </>\r
  );\r
}\r
\r
// 2. Close every tag, including void elements\r
const image = <img src="photo.jpg" alt="" />;\r
const brk = <br />;\r
\r
// 3. camelCase for HTML attributes\r
const card = <div className="card" tabIndex={0} onClick={handler} />;\r
//                 ^className (not class)  ^camelCase\r
\r
// 4. JavaScript expressions in curly braces\r
const name = <p>{user.name}</p>;\r
const status = <p>{isActive ? 'Active' : 'Inactive'}</p>;\r
const count = <p>{items.length > 0 && 'Has items'}</p>;\r
\r
// 5. Style is an object, not a string\r
const styled = <div style={{ color: 'red', fontSize: '16px' }} />;\r
\r
// 6. Spread props\r
const spread = <Button {...buttonProps} />;\r
\`\`\`\r
\r
---\r
\r
## 3. Components\r
\r
### 3.1 Function Components (Standard)\r
\r
Function components are the standard way to write React components. They are plain JavaScript functions that accept props and return JSX.\r
\r
\`\`\`tsx\r
// Function declaration\r
function Greeting({ name }: { name: string }) {\r
  return <h1>Hello, {name}!</h1>;\r
}\r
\r
// Arrow function — identical behaviour, different syntax\r
const GreetingArrow = ({ name }: { name: string }) => {\r
  return <h1>Hello, {name}!</h1>;\r
};\r
\r
// Usage\r
const app = <Greeting name="Alice" />;\r
const same = <GreetingArrow name="Alice" />;\r
\r
render(<>{app}{same}</>);\r
\`\`\`\r
\r
### 3.2 Class Components\r
\r
Class components are the older way of writing React components using ES6 classes. Function components with hooks are the modern standard, but you still need to read classes for two reasons: plenty of existing code is written with them, and an error boundary (a component that catches render errors below it) can still only be written as a class.\r
\r
#### Basic Class Component\r
\r
A class component extends \`React.Component\`, must implement a \`render()\` method, and accesses props via \`this.props\`.\r
\r
\`\`\`tsx\r
import React from 'react';\r
\r
interface GreetingProps {\r
  name: string;\r
  age?: number;\r
}\r
\r
class Greeting extends React.Component<GreetingProps> {\r
  render() {\r
    return (\r
      <div>\r
        <h1>Hello, {this.props.name}!</h1>\r
        {this.props.age && <p>Age: {this.props.age}</p>}\r
      </div>\r
    );\r
  }\r
}\r
\r
// Usage\r
<Greeting name="Alice" age={30} />\r
\`\`\`\r
\r
#### State in Class Components\r
\r
State is initialized in one of two ways: **inside the constructor** (the original pattern) or as a **class field** (modern syntactic shortcut). Both end up at the same place — \`this.state\` is set before \`render()\` runs the first time. Use \`this.setState()\` to update it; never mutate \`this.state\` directly. \`setState\` accepts either an object (shallow-merged) or a function (when the update depends on previous state). React batches multiple \`setState\` calls inside the same event handler for performance.\r
\r
##### Style 1 — Constructor-based initialization (classic pattern)\r
\r
\`\`\`tsx\r
interface CounterState {\r
  count: number;\r
  lastUpdated: string;\r
}\r
\r
class Counter extends React.Component<{}, CounterState> {\r
  // The classic React 16/17 pattern. Required if you target older toolchains\r
  // that don't compile class-field syntax, and the only way to do anything\r
  // OTHER than initialize state on construction (e.g., refs, instance\r
  // methods that capture props at construction time).\r
  constructor(props: {}) {\r
    // super(props) MUST be called before you can use \`this\`. Two reasons:\r
    //   1. JavaScript's class spec — derived class constructors must invoke\r
    //      super() before referencing \`this\`. Skipping it throws ReferenceError.\r
    //   2. Passing \`props\` makes \`this.props\` available INSIDE the constructor.\r
    //      If you call super() without props, \`this.props\` is undefined for\r
    //      the rest of the constructor (though React still sets it before\r
    //      render runs). Always pass props to be safe.\r
    super(props);\r
\r
    // Now \`this\` is initialized — assign initial state.\r
    this.state = {\r
      count: 0,\r
      lastUpdated: new Date().toISOString(),\r
    };\r
\r
    // The constructor is also where you bind handlers (if you use the\r
    // method-not-arrow-function style — see "this binding" below) and\r
    // initialize any instance refs (\`this.inputRef = React.createRef()\`).\r
  }\r
\r
  increment = () => {\r
    this.setState({ count: this.state.count + 1 });\r
  };\r
\r
  render() {\r
    return (\r
      <div>\r
        <p>Count: {this.state.count}</p>\r
        <button onClick={this.increment}>Increment</button>\r
      </div>\r
    );\r
  }\r
}\r
\`\`\`\r
\r
**Why is \`super(props)\` even a thing?** Class components extend \`React.Component\`. The base \`React.Component\` constructor does internal setup (creates the updater queue, attaches \`this.props\`, etc.). Skipping \`super()\` means none of that happens — \`this\` doesn't exist as far as JS is concerned. Skipping \`super(props)\` (calling just \`super()\`) lets the base class run but leaves \`this.props\` undefined *inside the constructor body*. React patches \`this.props\` itself afterwards, so render still works — but any prop-reading code in your constructor will misbehave. The safest, no-think rule: **always write \`super(props)\` in every class component constructor.**\r
\r
##### Style 2 — Class-field syntax (no constructor needed)\r
\r
\`\`\`tsx\r
class Counter extends React.Component<{}, CounterState> {\r
  // Equivalent to setting \`this.state = {...}\` in a constructor that just\r
  // calls super(props). Babel / TS compile this to constructor code under\r
  // the hood. Most modern React codebases prefer this for readability.\r
  state: CounterState = {\r
    count: 0,\r
    lastUpdated: new Date().toISOString(),\r
  };\r
\r
  // Arrow-as-class-field auto-binds \`this\` to the instance — no manual\r
  // .bind(this) in a constructor needed.\r
  increment = () => {\r
    // Object form — merged with current state\r
    this.setState({ count: this.state.count + 1 });\r
\r
    // Functional form — use when the update depends on previous state.\r
    // Critical inside loops or rapid-fire events; the object form would\r
    // batch and read stale this.state.count.\r
    this.setState((prevState) => ({\r
      count: prevState.count + 1,\r
      lastUpdated: new Date().toISOString(),\r
    }));\r
\r
    // setState with callback (runs AFTER state has been applied + render\r
    // committed). Use sparingly — usually componentDidUpdate is cleaner.\r
    this.setState(\r
      (prev) => ({ count: prev.count + 1 }),\r
      () => console.log('State updated:', this.state.count)\r
    );\r
  };\r
\r
  render() {\r
    return (\r
      <div>\r
        <p>Count: {this.state.count}</p>\r
        <button onClick={this.increment}>Increment</button>\r
      </div>\r
    );\r
  }\r
}\r
\`\`\`\r
\r
**Constructor vs class fields — when to pick which:**\r
\r
\`\`\`\r
| Reason to use constructor                 | Reason to use class fields            |\r
|-------------------------------------------|---------------------------------------|\r
| Reading props before initial state        | All state is static / props-free      |\r
|   (e.g., state: { id: props.initialId })  |   (most components)                   |\r
| Binding methods you defined as functions  | Using arrow-function methods          |\r
|   (this.handleClick = this.handleClick    |   (auto-bound, no manual binding)     |\r
|    .bind(this))                           |                                       |\r
| Creating refs (this.inputRef = createRef) | createRef in field syntax also works  |\r
| Old build toolchains without TC39 fields  | Modern build (any Babel/TS since 2018)|\r
\`\`\`\r
\r
In practice, most modern code uses class fields and only reaches for the constructor when initial state derives from props. Both compile to the same thing.\r
\r
#### Lifecycle Methods\r
\r
Lifecycle methods are the class-component equivalent of hooks: they let you run code at specific points in a component's existence. Function components have replaced them in new code, but they come up constantly in interviews and in any codebase older than a couple of years.\r
\r
**The order they run in:**\r
\r
\`\`\`\r
MOUNT                    UPDATE                        UNMOUNT\r
constructor              getDerivedStateFromProps      componentWillUnmount\r
getDerivedStateFromProps shouldComponentUpdate\r
render                   render\r
                         getSnapshotBeforeUpdate\r
componentDidMount        componentDidUpdate\r
\r
ERROR (in a child)\r
getDerivedStateFromError → render fallback → componentDidCatch\r
\`\`\`\r
\r
**The distinction that explains everything else** — render phase vs commit phase:\r
\r
| Phase | Methods | Rule |\r
|---|---|---|\r
| **Render** | \`constructor\`, \`getDerivedStateFromProps\`, \`shouldComponentUpdate\`, \`render\`, \`getDerivedStateFromError\` | must be **pure** — React may call them multiple times or throw the work away |\r
| **Commit** | \`getSnapshotBeforeUpdate\`, \`componentDidMount\`, \`componentDidUpdate\`, \`componentWillUnmount\`, \`componentDidCatch\` | run **once** per commit, and may perform side effects |\r
\r
That is why the render-phase ones are \`static\` where possible (no \`this\`, so you can't reach for instance state), and why the three \`UNSAFE_*\` methods are unsafe: they ran in the render phase and people put side effects in them, which breaks under concurrent rendering.\r
\r
---\r
\r
##### \`constructor(props)\`\r
\r
\`\`\`tsx\r
type Props = { userId: string };\r
type State = { data: string | null };\r
\r
class UserProfile extends React.Component<Props, State> {\r
  constructor(props: Props) {\r
    super(props);                       // MUST be first\r
    this.state = { data: null };        // the only place to assign this.state directly\r
    this.handleClick = this.handleClick.bind(this);\r
  }\r
\r
  handleClick() { /* … */ }\r
  render() { return null; }\r
}\r
\`\`\`\r
\r
**What it does:** initialises instance state and binds methods, before the first render.\r
\r
**When to use it:** only when you need constructor-specific work. Class fields (\`state = { … }\`) and arrow-function methods make it unnecessary most of the time.\r
\r
**Most common pitfall:** forgetting \`super(props)\`, which leaves \`this.props\` **undefined** inside the constructor. And never call \`setState\` here — assign \`this.state\` directly. Side effects (fetching, subscriptions) don't belong here either; they go in \`componentDidMount\`, because a constructor can run without the component ever mounting.\r
\r
---\r
\r
##### \`static getDerivedStateFromProps(props, state)\`\r
\r
\`\`\`tsx\r
type Props = { userId: string };\r
type State = { data: string | null; prevUserId?: string };\r
\r
class UserProfile extends React.Component<Props, State> {\r
  state: State = { data: null };\r
\r
  static getDerivedStateFromProps(props: Props, state: State) {\r
    if (props.userId !== state.prevUserId) {\r
      return { prevUserId: props.userId, data: null };   // merged into state\r
    }\r
    return null;                                          // no change\r
  }\r
\r
  render() { return null; }\r
}\r
\`\`\`\r
\r
**What it does:** lets you update state in response to a prop change, immediately before \`render\`. Return an object to merge into state, or \`null\` for no change.\r
\r
**When to use it:** almost never. It exists for the narrow case of resetting state when a prop changes and you cannot use a \`key\`.\r
\r
**Most common pitfall:** two of them. It is **\`static\`**, so there is no \`this\` — you cannot read props/state outside the arguments or call instance methods. And it runs before **every** render, including re-renders caused by state changes and by a parent re-rendering with identical props — not only when the prop actually changed. That is why you must compare against a stored previous value yourself, which is the awkwardness that makes it a last resort.\r
\r
**Prefer instead:** derive the value during \`render\` (no state at all), or reset the component by changing its \`key\` — see §7.4.\r
\r
---\r
\r
##### \`render()\`\r
\r
\`\`\`tsx\r
class UserProfile extends React.Component<{ userId: string }, { data: string | null }> {\r
  state = { data: null as string | null };\r
\r
  render() {\r
    return this.state.data ? <p>{this.state.data}</p> : <p>Loading…</p>;\r
  }\r
}\r
\`\`\`\r
\r
**What it does:** the only **required** method. Returns what to display: elements, a string, a number, a portal, an array, \`null\` or \`false\`.\r
\r
**When to use it:** always.\r
\r
**Most common pitfall:** it must be **pure** — no \`setState\`, no fetching, no DOM mutation, no subscriptions. Calling \`setState\` here is an infinite loop. Under concurrent rendering React may invoke it more than once for a single commit, or discard the result entirely, so anything with an observable effect is a bug.\r
\r
---\r
\r
##### \`componentDidMount()\`\r
\r
\`\`\`tsx\r
class UserProfile extends React.Component<{ userId: string }> {\r
  timer: number | undefined;\r
  handleResize = () => { /* … */ };\r
  tick = () => { /* … */ };\r
  fetchData(_userId: string) { /* … */ }\r
\r
  componentDidMount() {\r
    this.fetchData(this.props.userId);\r
    window.addEventListener('resize', this.handleResize);\r
    this.timer = window.setInterval(this.tick, 1000);\r
  }\r
\r
  render() { return null; }\r
}\r
\`\`\`\r
\r
**What it does:** runs once, after the first render is committed to the DOM. Refs are populated and layout can be measured.\r
\r
**When to use it:** data fetching, subscriptions, timers, event listeners, imperative DOM setup, third-party library init.\r
\r
**Most common pitfall:** setting up something without a matching teardown in \`componentWillUnmount\` — the classic memory leak. Note \`setState\` here is allowed and triggers an extra render **before the browser paints**, so the user sees no flicker, but it is wasted work; prefer initialising in the constructor where you can.\r
\r
**Hook equivalent:** \`useEffect(() => { … }, [])\`.\r
\r
---\r
\r
##### \`shouldComponentUpdate(nextProps, nextState)\`\r
\r
\`\`\`tsx\r
type Props = { userId: string };\r
type State = { data: string | null };\r
\r
class UserProfile extends React.Component<Props, State> {\r
  state: State = { data: null };\r
\r
  shouldComponentUpdate(nextProps: Props, nextState: State) {\r
    return nextProps.userId !== this.props.userId\r
        || nextState.data   !== this.state.data;\r
  }\r
\r
  render() { return null; }\r
}\r
\`\`\`\r
\r
**What it does:** returning \`false\` skips \`render\` **and** the whole subtree's re-render for that update.\r
\r
**When to use it:** as a measured performance fix, not by default.\r
\r
**Most common pitfall:** writing it by hand and getting the comparison wrong, so updates are silently dropped and the UI goes stale — a far worse bug than a slow render. A deep comparison can also cost more than the render it avoids. Use \`React.PureComponent\` (which shallow-compares props and state for you) or, in function components, \`React.memo\`. Note it is **not called** on the initial render, nor when you use \`forceUpdate\`.\r
\r
**Hook equivalent:** \`React.memo()\`.\r
\r
---\r
\r
##### \`getSnapshotBeforeUpdate(prevProps, prevState)\`\r
\r
\`\`\`tsx\r
type Props = { messages: string[] };\r
type Snapshot = { scrollHeight: number; scrollTop: number };\r
\r
class MessageList extends React.Component<Props> {\r
  listRef = React.createRef<HTMLDivElement>();\r
\r
  getSnapshotBeforeUpdate(_prevProps: Props): Snapshot | null {\r
    // read the DOM before React mutates it\r
    const list = this.listRef.current;\r
    if (!list) return null;\r
    return { scrollHeight: list.scrollHeight, scrollTop: list.scrollTop };\r
  }\r
\r
  componentDidUpdate(_prevProps: Props, _prevState: unknown, snapshot: Snapshot | null) {\r
    const list = this.listRef.current;\r
    if (snapshot && list) {\r
      // restore the scroll position now the new items are in\r
      list.scrollTop += list.scrollHeight - snapshot.scrollHeight;\r
    }\r
  }\r
\r
  render() { return <div ref={this.listRef} />; }\r
}\r
\`\`\`\r
\r
**What it does:** runs after \`render\` but **before** React applies changes to the DOM. Its return value is passed as the third argument to \`componentDidUpdate\`.\r
\r
**When to use it:** capturing DOM measurements that the update is about to destroy. The canonical case is a chat window that must stay scrolled to the same message while new items are prepended.\r
\r
**Most common pitfall:** thinking it's a general "before update" hook. It's specifically for reading the pre-mutation DOM, and the value it returns is the *only* way to get that information into \`componentDidUpdate\`.\r
\r
**Hook equivalent:** \`useLayoutEffect\` (which runs after mutation but before paint — close, not identical).\r
\r
---\r
\r
##### \`componentDidUpdate(prevProps, prevState, snapshot)\`\r
\r
\`\`\`tsx\r
type Props = { userId: string };\r
\r
class UserProfile extends React.Component<Props> {\r
  fetchData(_userId: string) { /* … */ }\r
\r
  componentDidUpdate(prevProps: Props) {\r
    if (prevProps.userId !== this.props.userId) {   // GUARD — mandatory\r
      this.fetchData(this.props.userId);\r
    }\r
  }\r
\r
  render() { return null; }\r
}\r
\`\`\`\r
\r
**What it does:** runs after every update is committed (not after the first render).\r
\r
**When to use it:** reacting to a prop or state change — refetching when an id changes, syncing a non-React widget.\r
\r
**Most common pitfall:** **calling \`setState\` unconditionally causes an infinite loop** — the update triggers \`componentDidUpdate\`, which triggers another update. Always compare \`prevProps\`/\`prevState\` first. This is the single most common class-component bug.\r
\r
**Hook equivalent:** \`useEffect(() => { … }, [deps])\` — where the dependency array replaces the manual guard, which is a large part of why hooks are less error-prone here.\r
\r
---\r
\r
##### \`componentWillUnmount()\`\r
\r
\`\`\`tsx\r
class UserProfile extends React.Component {\r
  timer: number | undefined;\r
  controller = new AbortController();\r
  handleResize = () => { /* … */ };\r
\r
  componentWillUnmount() {\r
    window.removeEventListener('resize', this.handleResize);\r
    clearInterval(this.timer);\r
    this.controller.abort();\r
  }\r
\r
  render() { return null; }\r
}\r
\`\`\`\r
\r
**What it does:** runs immediately before the component is removed from the DOM.\r
\r
**When to use it:** tear down exactly what \`componentDidMount\` set up — listeners, timers, subscriptions, in-flight requests, observers.\r
\r
**Most common pitfall:** calling \`setState\` here. The component is being destroyed, so it does nothing and React warns. Also easy to forget one of several subscriptions; keeping setup and teardown symmetrical is what prevents leaks.\r
\r
**Hook equivalent:** the cleanup function returned from \`useEffect\`.\r
\r
---\r
\r
##### \`static getDerivedStateFromError(error)\` and \`componentDidCatch(error, info)\`\r
\r
\`\`\`tsx\r
class ErrorBoundary extends React.Component<\r
  { children: React.ReactNode; fallback?: React.ReactNode },\r
  { hasError: boolean; error: Error | null }\r
> {\r
  state = { hasError: false, error: null };\r
\r
  // RENDER phase: return state to show a fallback. No side effects.\r
  static getDerivedStateFromError(error: Error) {\r
    return { hasError: true, error };\r
  }\r
\r
  // COMMIT phase: side effects are fine — log it.\r
  componentDidCatch(error: Error, info: React.ErrorInfo) {\r
    reportToSentry(error, info.componentStack);\r
  }\r
\r
  render() {\r
    if (this.state.hasError) return this.props.fallback ?? <h2>Something went wrong.</h2>;\r
    return this.props.children;\r
  }\r
}\r
\`\`\`\r
\r
**What they do:** together they form an **error boundary**, catching errors thrown during rendering, in lifecycle methods, and in constructors of the tree **below** them.\r
\r
**When to use them:** wrap route segments or independent widgets so one failure degrades part of the UI instead of blanking the page.\r
\r
**Why there are two:** \`getDerivedStateFromError\` is render-phase, so it must be pure and only returns the state needed to render a fallback; \`componentDidCatch\` is commit-phase, so it's where logging and other side effects belong.\r
\r
**Most common pitfall:** expecting them to catch everything. They do **not** catch errors in event handlers, in \`setTimeout\`/\`Promise\` callbacks, during server-side rendering, or thrown by the boundary itself — use \`try\`/\`catch\` for those. And error boundaries **must be class components**; there is still no hook equivalent, which is the one remaining reason to write a class in React 19.\r
\r
---\r
\r
##### Worked example\r
\r
Putting the update-phase methods together:\r
\r
\`\`\`tsx\r
// stand-ins so this example runs on its own\r
interface User { name: string }\r
const UserCard = ({ data }: { data: User }) => <p>{data.name}</p>;\r
// a fake fetch that answers after 500 ms (the playground has no /api)\r
const fetch = (_url: string, _init?: RequestInit) =>\r
  new Promise<{ json: () => Promise<User> }>((resolve) =>\r
    setTimeout(() => resolve({ json: async () => ({ name: 'Ada Lovelace' }) }), 500));\r
\r
interface DataFetcherProps { userId: string }\r
interface DataFetcherState { data: User | null }\r
\r
class DataFetcher extends React.Component<DataFetcherProps, DataFetcherState> {\r
  state: DataFetcherState = { data: null };\r
  private controller?: AbortController;\r
\r
  componentDidMount() {\r
    this.load(this.props.userId);\r
  }\r
\r
  componentDidUpdate(prevProps: DataFetcherProps) {\r
    if (prevProps.userId !== this.props.userId) {   // guard, or infinite loop\r
      this.load(this.props.userId);\r
    }\r
  }\r
\r
  componentWillUnmount() {\r
    this.controller?.abort();                        // pairs with load()\r
  }\r
\r
  private load = async (userId: string) => {\r
    this.controller?.abort();\r
    this.controller = new AbortController();\r
    try {\r
      const res = await fetch(\`/api/users/\${userId}\`, { signal: this.controller.signal });\r
      this.setState({ data: await res.json() });\r
    } catch (err) {\r
      if ((err as Error).name !== 'AbortError') throw err;\r
    }\r
  };\r
\r
  render() {\r
    return this.state.data ? <UserCard data={this.state.data} /> : <p>Loading…</p>;\r
  }\r
}\r
\r
render(<DataFetcher userId="1" />);\r
\`\`\`\r
\r
The whole thing is roughly ten lines as a function component with \`useEffect\` — the guard becomes the dependency array and the teardown becomes the cleanup return, which is the argument for hooks in one comparison. See §7.2 for the mapping.\r
\r
#### Lifecycle Diagram\r
\r
\`\`\`\r
Mounting                     Updating                          Unmounting\r
────────                     ────────                          ──────────\r
constructor                  getDerivedStateFromProps\r
    ↓                             ↓\r
getDerivedStateFromProps     shouldComponentUpdate\r
    ↓                             ↓ (if true)\r
render                       render\r
    ↓                             ↓\r
componentDidMount            getSnapshotBeforeUpdate           componentWillUnmount\r
                                  ↓\r
                             componentDidUpdate\r
\r
Error Handling (any phase):  getDerivedStateFromError → render → componentDidCatch\r
\`\`\`\r
\r
#### \`this\` Binding — The Four Ways\r
\r
Class component event handlers are notorious for \`this\`-binding bugs. When you pass \`this.handleClick\` to \`onClick\`, the function gets called as a free function (not as a method on the instance), so \`this\` inside it is \`undefined\` in strict mode. There are four canonical fixes; pick one and stick with it.\r
\r
\`\`\`tsx\r
class Buttons extends React.Component<{}, { count: number }> {\r
  state = { count: 0 };\r
\r
  // ---------- Method 1: bind in the constructor ----------\r
  // Classic. Rebinds the method to the instance once at construction.\r
  // Verbose but explicit; most "official tutorial" code uses this.\r
  constructor(props: {}) {\r
    super(props);\r
    this.handleClickBound = this.handleClickBound.bind(this);\r
  }\r
  handleClickBound() {\r
    this.setState({ count: this.state.count + 1 });\r
  }\r
\r
  // ---------- Method 2: arrow function as a class field (RECOMMENDED) ----------\r
  // The arrow lexically captures \`this\` at definition time, so it's\r
  // permanently bound to the instance. No constructor work, no manual bind.\r
  // Most modern codebases standardize on this.\r
  handleClickArrow = () => {\r
    this.setState({ count: this.state.count + 1 });\r
  };\r
\r
  // ---------- Method 3: arrow function inline in JSX ----------\r
  // Convenient but creates a NEW function reference on every render —\r
  // breaks \`React.memo\` / \`PureComponent\` for child components that\r
  // receive this as a prop. OK for tiny / non-memoized children.\r
\r
  // ---------- Method 4: bind in render (anti-pattern) ----------\r
  // Same allocation-per-render problem as Method 3, plus visually noisy.\r
  // Avoid: <button onClick={this.handleClickBound.bind(this)}>...\r
\r
  render() {\r
    return (\r
      <div>\r
        {/* Method 1 */}\r
        <button onClick={this.handleClickBound}>Bound</button>\r
\r
        {/* Method 2 (recommended) */}\r
        <button onClick={this.handleClickArrow}>Arrow</button>\r
\r
        {/* Method 3 (inline arrow) */}\r
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>\r
          Inline\r
        </button>\r
      </div>\r
    );\r
  }\r
}\r
\`\`\`\r
\r
**Performance footnote:** Methods 1 and 2 produce one stable function reference per instance — safe to pass to \`React.memo\`'d children. Methods 3 and 4 produce a fresh function every render, which defeats child memoization. For most leaf components the cost is negligible; for components passing handlers to \`React.memo\` lists with thousands of items, prefer Methods 1 or 2.\r
\r
#### Default Props\r
\r
Default values for missing props. Two equivalent patterns, depending on style:\r
\r
\`\`\`tsx\r
// ---------- Static defaultProps (legacy + still supported) ----------\r
class Greeting extends React.Component<{ name?: string; greeting?: string }> {\r
  static defaultProps = {\r
    greeting: 'Hello',\r
  };\r
  render() {\r
    return <h1>{this.props.greeting}, {this.props.name ?? 'friend'}!</h1>;\r
  }\r
}\r
// React 18 deprecated defaultProps for FUNCTION components in favor of\r
// destructuring defaults; for class components it remains supported.\r
\r
// ---------- TypeScript-friendly: destructure defaults in render ----------\r
class Greeting2 extends React.Component<{ name?: string; greeting?: string }> {\r
  render() {\r
    const { name = 'friend', greeting = 'Hello' } = this.props;\r
    return <h1>{greeting}, {name}!</h1>;\r
  }\r
}\r
\`\`\`\r
\r
#### Prop Validation — \`PropTypes\` Then, TypeScript Now\r
\r
Pre-2018, class components used \`PropTypes\` to validate props at runtime in development:\r
\r
\`\`\`jsx\r
import PropTypes from 'prop-types';\r
\r
class Greeting extends React.Component {\r
  static propTypes = {\r
    name: PropTypes.string.isRequired,\r
    age:  PropTypes.number,\r
    role: PropTypes.oneOf(['admin', 'user']).isRequired,\r
  };\r
  render() { return <h1>Hello {this.props.name}</h1>; }\r
}\r
\`\`\`\r
\r
This is **legacy**. Modern React (with TypeScript) replaces \`PropTypes\` entirely — type checking happens at compile time, with no runtime cost, and the type system catches issues \`PropTypes\` couldn't (literal types, tuples, conditional types). The \`prop-types\` package was removed from React's recommended setup; you'll only see it in older codebases. Don't add \`PropTypes\` to new code; use TypeScript.\r
\r
#### \`forceUpdate\` — When (Rarely) to Use\r
\r
\`this.forceUpdate()\` re-renders the component without a state or prop change. Class components shouldn't normally need it — if your UI depends on data, that data should be in state or props. Two niche cases:\r
\r
\`\`\`tsx\r
class ClockDisplay extends React.Component {\r
  // Example: subscribing to an external mutable source not tracked in state\r
  private timer?: number;\r
\r
  componentDidMount() {\r
    this.timer = window.setInterval(() => this.forceUpdate(), 1000);\r
  }\r
  componentWillUnmount() {\r
    if (this.timer) window.clearInterval(this.timer);\r
  }\r
\r
  render() {\r
    // Reads Date.now() directly — not in state, but render needs it fresh\r
    return <p>Time: {new Date().toLocaleTimeString()}</p>;\r
  }\r
}\r
\`\`\`\r
\r
**Almost always wrong.** If you're reaching for \`forceUpdate\`, the right fix is usually to put the data in state (\`this.setState({ now: Date.now() })\`), or in the function-component world, use \`useSyncExternalStore\` for external mutable sources. The hooks equivalent (\`const [, force] = useReducer(x => x + 1, 0)\`) exists for exactly the same niche cases.\r
\r
#### Deprecated Lifecycle Methods (UNSAFE_*)\r
\r
Three lifecycles were deprecated in React 16.3 and renamed with the \`UNSAFE_\` prefix in 16.9. They still work today but will be removed in a future major version. If you encounter them in legacy code, here's why they're problematic and what to use instead:\r
\r
\`\`\`\r
| Deprecated (UNSAFE_)       | Why removed                              | Modern replacement              |\r
|----------------------------|------------------------------------------|---------------------------------|\r
| componentWillMount         | Async-rendering safety: may run multiple │ constructor or                  |\r
|                            │ times in concurrent mode                 │ componentDidMount               │\r
| componentWillReceiveProps  | Encouraged storing-derived-state pattern │ getDerivedStateFromProps OR     │\r
|                            │ that becomes stale; inconsistent with    │ derive in render OR             │\r
|                            │ async rendering                          │ key-based remount               │\r
| componentWillUpdate        | Same async-safety problem; commonly     │ getSnapshotBeforeUpdate (for   │\r
|                            │ misused for DOM reads                    │ DOM reads) + componentDidUpdate │\r
\`\`\`\r
\r
The **strict-mode warning** is what prompts the rename in modern React: any of these three names triggers a deprecation log in development. New class code should never use them.\r
\r
#### Class vs Function Components\r
\r
| Feature | Class Components | Function Components |\r
|---------|-----------------|-------------------|\r
| Syntax | \`class Foo extends React.Component\` | \`function Foo()\` or \`const Foo = () =>\` |\r
| State | \`this.state\` / \`this.setState()\` | \`useState()\` hook |\r
| Lifecycle | Lifecycle methods (\`componentDidMount\`, etc.) | \`useEffect()\` hook |\r
| Hooks support | No | Yes |\r
| \`this\` binding | Required (arrow fns or \`.bind()\`) | Not needed |\r
| Error boundaries | Yes (\`componentDidCatch\`) | Not supported (must use class) |\r
| Code verbosity | More boilerplate | Concise |\r
| Modern usage | Legacy / error boundaries only | Recommended standard |\r
\r
### 3.3 Component Composition\r
\r
Composition is how React reuses code: instead of one component *inheriting* from another, a component renders other components, or accepts them through the \`children\` prop and places them inside itself. The wrapper (\`Card\` below) owns the frame and styling and knows nothing about what goes inside, so the same \`Card\` works for a user, a product or an error message without a new subclass for each.\r
\r
\`\`\`tsx\r
function Card({ children }: { children: React.ReactNode }) {\r
  return <div className="card">{children}</div>;\r
}\r
\r
interface User { name: string; email: string }\r
\r
function UserCard({ user }: { user: User }) {\r
  return (\r
    <Card>\r
      <h2>{user.name}</h2>\r
      <p>{user.email}</p>\r
    </Card>\r
  );\r
}\r
\r
render(<UserCard user={{ name: 'Alice', email: 'alice@example.com' }} />);\r
\`\`\`\r
\r
### 3.4 Component Organization\r
\r
One component per file with a named export is the most common convention. The file name then tells you where a component lives, and a named export means every import uses the same name, so renames and "find all references" work reliably (a default export can be imported under any name).\r
\r
\`\`\`\r
// One component per file, named export\r
// components/user-card.tsx\r
export function UserCard({ user }: UserCardProps) {\r
  return (...);\r
}\r
\r
// Pages are also components\r
// pages/users-page.tsx\r
export function UsersPage() {\r
  return (...);\r
}\r
\`\`\`\r
\r
---\r
\r
## 4. Props\r
\r
Props are the inputs a parent passes to a child, like arguments to a function. They are read-only: the child must never modify them, because the parent owns that data and would not know it changed. To change a value, the child calls a callback prop (such as \`onEdit\` below) and lets the parent update its own state.\r
\r
\`\`\`tsx\r
// Typing props\r
interface UserCardProps {\r
  name: string;\r
  age: number;\r
  email?: string;                          // optional\r
  onEdit: (id: string) => void;            // callback\r
  children: React.ReactNode;               // children\r
}\r
\r
function UserCard({ name, age, email = 'N/A', onEdit, children }: UserCardProps) {\r
  return (\r
    <div>\r
      <h2>{name}, {age}</h2>\r
      <p>{email}</p>\r
      <button onClick={() => onEdit(name)}>Edit</button>\r
      {children}\r
    </div>\r
  );\r
}\r
\r
// Spread props\r
type ButtonProps = { variant: 'primary' | 'secondary' };\r
\r
function Button({ variant, ...rest }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {\r
  return <button className={variant} {...rest} />;\r
}\r
\r
// Usage\r
render(\r
  <UserCard name="Alice" age={30} onEdit={(id) => console.log('edit', id)}>\r
    <Button variant="primary" onClick={() => console.log('clicked')}>Follow</Button>\r
  </UserCard>\r
);\r
\`\`\`\r
\r
### Props vs State\r
\r
| Props | State |\r
|-------|-------|\r
| Passed from parent | Owned by the component |\r
| Read-only | Can be updated |\r
| Trigger re-render when changed | Trigger re-render when updated |\r
| Flow down (parent -> child) | Local to the component |\r
\r
---\r
\r
## 5. State\r
\r
### 5.1 useState\r
\r
\`useState\` is the primary hook for adding state to function components. It returns a state value and a setter function that triggers a re-render when called.\r
\r
\`\`\`tsx\r
function Counter() {\r
  const [count, setCount] = useState(0);\r
\r
  return (\r
    <div>\r
      <p>Count: {count}</p>\r
      <button onClick={() => setCount(count + 1)}>Increment</button>\r
      <button onClick={() => setCount(prev => prev + 1)}>Increment (functional)</button>\r
    </div>\r
  );\r
}\r
\`\`\`\r
\r
### 5.2 State Update Rules\r
\r
State updates have three rules, and all three fall out of a single idea: **the state variable in a render is a snapshot, not a live value.**\r
\r
When a component renders, React hands it the value state had *at the start of that render*. \`count\` is a \`const\` for the whole of that render pass — nothing that happens later can change it. Event handlers defined during that render close over that snapshot. Calling \`setCount\` does not reach back and edit it; it queues a request for a *new* render with a new value.\r
\r
Almost every state bug is a consequence of expecting the snapshot to be live. The three rules below are how you work with it instead of against it.\r
\r
#### Rule 1 — Updates are batched, so a render sees one fixed value\r
\r
\`setState\` is asynchronous. It doesn't assign; it schedules. React collects every update triggered by the same piece of work, then performs **one** re-render with the final result. This is called **batching**, and it exists for two reasons: the UI never flickers through half-updated intermediate states, and you pay for one render instead of one per call.\r
\r
This is why the classic double-increment doesn't work:\r
\r
\`\`\`tsx\r
// count is 0 in this render\r
setCount(count + 1);   // queues "set count to 0 + 1" → 1\r
setCount(count + 1);   // queues "set count to 0 + 1" → 1  (count is STILL 0 here)\r
// after re-render: count === 1, not 2\r
\`\`\`\r
\r
Both lines read \`count\` from the same snapshot, so both compute \`1\`. The second doesn't overwrite the first so much as duplicate it. The corollary catches people just as often — **you cannot read your own update back**:\r
\r
\`\`\`tsx\r
setCount(count + 1);\r
console.log(count);   // still the old value. The new one exists only in the next render.\r
\`\`\`\r
\r
If you need the new value in the same function, compute it in a plain variable (\`const next = count + 1\`) and use that. If you need to *react* to it, that's what \`useEffect\` on \`[count]\` is for.\r
\r
**React 18 changed the scope of this.** Batching used to apply only inside React event handlers; updates in a \`setTimeout\`, a promise callback or a native event listener each triggered their own render. Since React 18's \`createRoot\`, batching is **automatic everywhere**. On the rare occasion you need a DOM measurement between two updates, \`flushSync\` from \`react-dom\` opts out for that call — it forces a synchronous re-render, and using it routinely defeats the point.\r
\r
#### Rule 2 — State is read-only, so replace instead of mutating\r
\r
React decides whether anything changed by comparing the new value to the old with **\`Object.is\`**. For a number or string that compares the value. For an object or array it compares the **reference** — the identity of the box, not its contents.\r
\r
So if you mutate and hand back the same object, React sees the same reference, concludes nothing changed, and **skips the re-render entirely**. Your data is genuinely different and the screen is genuinely stale:\r
\r
\`\`\`tsx\r
user.name = 'Bob';   // the object changed\r
setUser(user);       // ...but it's the same reference, so Object.is says "equal"\r
                     // → React bails out, no re-render\r
\`\`\`\r
\r
Referential equality is load-bearing in more places than the re-render check, which is why mutation causes symptoms that look unrelated to state:\r
\r
| What relies on a new reference | What mutation does to it |\r
|---|---|\r
| The re-render bail-out | Skips the render — the UI never updates |\r
| \`React.memo\` on a child | Child sees "same props", doesn't re-render |\r
| \`useEffect\` / \`useMemo\` dependency arrays | Dependency looks unchanged, so the effect never re-runs |\r
| React DevTools and Strict Mode | Double-invoked renders expose the mutation as inconsistent output |\r
\r
The fix is always the same shape: **build a new object or array for the parts you changed**, and reuse the rest by reference.\r
\r
\`\`\`tsx\r
setUser({ ...user, name: 'Bob' });          // new object, one field replaced\r
setUser(prev => ({ ...prev, name: 'Bob' })); // same, using the updater form\r
\`\`\`\r
\r
Spreading is *shallow*, so nesting needs a new object at every level along the path you're changing:\r
\r
\`\`\`tsx\r
// Changing user.address.city — address must be recreated too\r
setUser(prev => ({ ...prev, address: { ...prev.address, city: 'Paris' } }));\r
\`\`\`\r
\r
For arrays, the practical rule is to prefer the methods that **return** a new array over the ones that modify in place:\r
\r
| Operation | Don't (mutates) | Do (returns new) |\r
|---|---|---|\r
| Add to end | \`items.push(x)\` | \`[...items, x]\` |\r
| Add to front | \`items.unshift(x)\` | \`[x, ...items]\` |\r
| Remove | \`items.splice(i, 1)\` | \`items.filter((_, idx) => idx !== i)\` |\r
| Replace one | \`items[i] = x\` | \`items.map((it, idx) => idx === i ? x : it)\` |\r
| Insert at \`i\` | \`items.splice(i, 0, x)\` | \`[...items.slice(0, i), x, ...items.slice(i)]\` |\r
| Sort / reverse | \`items.sort()\` | \`items.toSorted()\` (ES2023) or \`[...items].sort()\` |\r
\r
\`sort\` and \`reverse\` are the ones that slip through review, because they look like they return a fresh array — they return the *same* array, mutated. ES2023's \`toSorted\`, \`toReversed\`, \`toSpliced\` and \`with\` exist precisely to remove this trap. If state is deeply nested enough that spreading gets unreadable, that's a signal to either flatten the shape or bring in **Immer** (which \`createSlice\` in Redux Toolkit uses), where you write mutating-looking code and it produces the new object for you.\r
\r
#### Rule 3 — Use an updater function when the next value depends on the current one\r
\r
Passing a **function** to the setter changes where the previous value comes from. Instead of reading the render's snapshot, React calls your function with the **latest value in the queue**, applying each one in order during the next render:\r
\r
\`\`\`tsx\r
setCount(prev => prev + 1);   // queues a function, not a value\r
setCount(prev => prev + 1);\r
// React applies them in order: 0 → 1 → 2. count === 2\r
\`\`\`\r
\r
Tracing both forms side by side is the clearest way to see the difference:\r
\r
| Queue entry | \`setCount(count + 1)\` twice | \`setCount(prev => prev + 1)\` twice |\r
|---|---|---|\r
| 1st | "replace with 1" (\`count\` = 0) | \`0 => 1\` |\r
| 2nd | "replace with 1" (\`count\` = 0) | \`1 => 2\` |\r
| Result | **1** | **2** |\r
\r
Use the updater form whenever the new state is derived from the old. It is not merely tidier — it is *required* in three situations:\r
\r
- **Several updates in one event**, as above.\r
- **Updates from async code** — a \`setTimeout\`, \`setInterval\`, a \`fetch\` callback or a debounced handler. These run long after the render that created them, so their captured snapshot is stale. \`setCount(c => c + 1)\` always sees the current value; \`setCount(count + 1)\` sees whatever \`count\` was when the timer was set. This is the **stale closure** bug, and it's the usual reason a counter driven by \`setInterval\` freezes at 1.\r
- **When you want to keep a dependency array empty.** Because the updater doesn't read \`count\`, a \`useCallback\` or \`useEffect\` that only ever *increments* needs no \`count\` dependency — so the callback identity stays stable and memoised children stop re-rendering.\r
\r
One constraint: **updaters must be pure.** Compute and return the next state, with no side effects, no mutation of \`prev\`, and no requests. React may call an updater more than once — in development Strict Mode deliberately double-invokes it to surface impurity — so anything with a side effect will happen twice.\r
\r
Putting all three together:\r
\r
\`\`\`tsx\r
// 1. State updates are asynchronous (batched)\r
setCount(count + 1);\r
setCount(count + 1);\r
// count only increases by 1! Both read the same \`count\`\r
\r
// 2. Use functional updates for sequential updates\r
setCount(prev => prev + 1);\r
setCount(prev => prev + 1);\r
// count increases by 2 (each reads the latest pending state)\r
\r
// 3. Objects and arrays must be replaced, not mutated\r
const [user, setUser] = useState({ name: 'Alice', age: 30 });\r
\r
// BAD: mutating (React won't detect the change)\r
user.name = 'Bob';\r
setUser(user);\r
\r
// GOOD: new object\r
setUser({ ...user, name: 'Bob' });\r
setUser(prev => ({ ...prev, name: 'Bob' }));\r
\r
// Arrays\r
const [items, setItems] = useState<string[]>([]);\r
setItems([...items, 'new item']);                    // add\r
setItems(items.filter(item => item !== 'remove'));   // remove\r
setItems(items.map(item => item === 'old' ? 'new' : item)); // update\r
\`\`\`\r
\r
### 5.3 useReducer (Complex State)\r
\r
\`useReducer\` is an alternative to \`useState\` for state with several related values. Instead of calling setters directly, a component **dispatches** an action (a plain object such as \`{ type: 'increment' }\` describing what happened), and a **reducer** — a pure function \`(state, action) => newState\` — decides what the next state is. The benefit is that every possible state change lives in one function you can read and unit-test on its own, rather than being spread across event handlers. It is the same pattern Redux uses, scoped to one component.\r
\r
\`\`\`tsx\r
type State = { count: number; step: number };\r
type Action =\r
  | { type: 'increment' }\r
  | { type: 'decrement' }\r
  | { type: 'setStep'; payload: number }\r
  | { type: 'reset' };\r
\r
function reducer(state: State, action: Action): State {\r
  switch (action.type) {\r
    case 'increment':\r
      return { ...state, count: state.count + state.step };\r
    case 'decrement':\r
      return { ...state, count: state.count - state.step };\r
    case 'setStep':\r
      return { ...state, step: action.payload };\r
    case 'reset':\r
      return { count: 0, step: 1 };\r
    default:\r
      return state;\r
  }\r
}\r
\r
function Counter() {\r
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });\r
\r
  return (\r
    <div>\r
      <p>Count: {state.count}</p>\r
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>\r
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>\r
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>\r
    </div>\r
  );\r
}\r
\`\`\`\r
\r
### 5.4 Component Communication\r
\r
How components talk to each other is a screening-round staple. There are five mechanisms and the skill is knowing which one a given relationship needs — reaching for Context or a state library too early is the usual mistake.\r
\r
**1. Parent → child: props.** The default, and it covers most cases.\r
\r
\`\`\`jsx\r
function Parent() {\r
  return <UserCard name="Ana" role="Engineer" />;\r
}\r
function UserCard({ name, role }) {\r
  return <p>{name} — {role}</p>;\r
}\r
\r
render(<Parent />);\r
\`\`\`\r
\r
**2. Child → parent: a callback prop.** Data flows one way in React, so a child cannot "set" the parent's state. The parent passes a function down and the child calls it — the child reports an event, the parent decides what it means.\r
\r
\`\`\`jsx\r
function Parent() {\r
  const [query, setQuery] = useState('');\r
  return (\r
    <>\r
      <SearchBox onSearch={setQuery} />       {/* pass the setter (or a handler) */}\r
      <Results query={query} />\r
    </>\r
  );\r
}\r
\r
function SearchBox({ onSearch }) {\r
  const [value, setValue] = useState('');\r
  return (\r
    <form onSubmit={e => { e.preventDefault(); onSearch(value); }}>\r
      <input value={value} onChange={e => setValue(value => e.target.value)} />\r
    </form>\r
  );\r
}\r
\r
// stand-in so this example runs on its own\r
const Results = ({ query }) => <p>Results for: {query || '(nothing yet)'}</p>;\r
\r
render(<Parent />);\r
\`\`\`\r
\r
Note the child keeps its **own** input state and only notifies the parent on submit. Lifting every keystroke to the parent re-renders the whole subtree on each character — a common and avoidable performance bug.\r
\r
**3. Sibling ↔ sibling: lift the state up.** Siblings cannot see each other, so shared state moves to their **closest common ancestor** and comes back down as props. That is all "lifting state up" means.\r
\r
\`\`\`jsx\r
function Dashboard() {\r
  const [selectedId, setSelectedId] = useState(null);   // lifted: both need it\r
  return (\r
    <>\r
      <JobList onSelect={setSelectedId} selectedId={selectedId} />\r
      <JobDetail id={selectedId} />\r
    </>\r
  );\r
}\r
\r
// stand-ins so this example runs on its own\r
const JobList = ({ onSelect, selectedId }) => (\r
  <ul>\r
    {[1, 2, 3].map(id => (\r
      <li key={id}>\r
        <button onClick={() => onSelect(id)}>{id === selectedId ? '▶ ' : ''}Job {id}</button>\r
      </li>\r
    ))}\r
  </ul>\r
);\r
const JobDetail = ({ id }) => <p>{id ? \`Details for job \${id}\` : 'Pick a job'}</p>;\r
\r
render(<Dashboard />);\r
\`\`\`\r
\r
The trade-off: state placed too high re-renders more of the tree than necessary, so lift it to the **closest** common parent, not to the root.\r
\r
**4. Deeply nested: Context.** When a value must reach a distant descendant and every layer in between would just forward it — "prop drilling" — Context skips the middle.\r
\r
\`\`\`jsx\r
const ThemeContext = createContext('light');\r
\r
function App()   { return <ThemeContext.Provider value="dark"><Page /></ThemeContext.Provider>; }\r
function Button() { const theme = useContext(ThemeContext); /* … */ }\r
\`\`\`\r
\r
Two or three levels of forwarding is not a problem worth solving — prop drilling is only a real smell when intermediate components take props they never use. And Context has a cost: **every consumer re-renders when the value changes**, and an object literal as \`value\` creates a new reference every render, so it changes on *every* parent render. Memoise it, and split rarely-changing config from frequently-changing data into separate contexts. See [§11](#11-context-api) and Q33.\r
\r
**5. Parent → child *imperatively*: refs.** For actions rather than data — focusing an input, playing a video, scrolling a list. In React 19 \`ref\` is a normal prop, so \`forwardRef\` is no longer needed.\r
\r
\`\`\`jsx\r
function Form() {\r
  const inputRef = useRef(null);\r
  return (\r
    <>\r
      <TextInput ref={inputRef} />\r
      <button onClick={() => inputRef.current.focus()}>Focus</button>\r
    </>\r
  );\r
}\r
function TextInput({ ref, ...props }) { return <input ref={ref} {...props} />; }\r
\r
render(<Form />);\r
\`\`\`\r
\r
Use \`useImperativeHandle\` to expose a **narrow** API (\`{ focus, clear }\`) rather than the raw DOM node.\r
\r
**Beyond that: external state.** When unrelated branches of the tree share server or global state, the answer is a store rather than more lifting — **TanStack Query** for server state, **Zustand/Redux** for client state. See [§11.3](#11-context-api) on why that distinction matters.\r
\r
| Relationship | Use | Notes |\r
|---|---|---|\r
| Parent → child | **props** | the default |\r
| Child → parent | **callback prop** | keep transient state local, notify on commit |\r
| Sibling ↔ sibling | **lift state** to the closest common parent | not to the root |\r
| Distant descendant | **Context** | only for genuine prop drilling; memoise the value |\r
| Imperative action | **ref** + \`useImperativeHandle\` | actions, not data |\r
| Unrelated branches | **store** (TanStack Query / Zustand) | server vs client state |\r
\r
---\r
---\r
\r
## 6. Hooks\r
\r
### 6.1 Rules of Hooks\r
\r
1. **Only call hooks at the top level** — not inside loops, conditions, or nested functions\r
2. **Only call hooks from React functions** — components or custom hooks\r
\r
**Why these rules exist:** React does not know your hooks by name. It stores each component's hook state in a list and matches the first \`useState\` call to slot 1, the second to slot 2, and so on, **by call order**. If a hook sits inside an \`if\`, a render where the condition is false skips it, every later hook shifts up one slot, and each one receives another hook's state. Calling hooks at the top level guarantees the same order on every render. The second rule exists because only a component or custom hook runs while React is tracking that list. The linter plugin \`eslint-plugin-react-hooks\` enforces both. Q47 walks through the mechanism in detail.\r
\r
### 6.2 Built-in Hooks Reference\r
\r
React 19 ships with 14 built-in hooks (plus the 3 actions/forms hooks covered in §16). They split into a few mental buckets:\r
\r
| Bucket | Hooks | Use for |\r
|---|---|---|\r
| **State** | \`useState\`, \`useReducer\` | Component-local state |\r
| **Side effects** | \`useEffect\`, \`useLayoutEffect\`, \`useInsertionEffect\` | Synchronizing with the outside world |\r
| **Context** | \`useContext\` | Reading values from a Provider |\r
| **Refs** | \`useRef\`, \`useImperativeHandle\` | Mutable values + DOM access |\r
| **Memoization** | \`useMemo\`, \`useCallback\` | Avoid expensive recomputes |\r
| **Concurrent** | \`useTransition\`, \`useDeferredValue\` | Mark updates as non-urgent |\r
| **External data** | \`useSyncExternalStore\` | Subscribe to non-React stores |\r
| **Misc** | \`useId\`, \`useDebugValue\` | SSR-safe IDs, devtools labels |\r
\r
Each hook below shows its signature, what it does, when to reach for it, and the most common mistake.\r
\r
#### \`useState\` — basic local state\r
\r
\`\`\`tsx\r
const [state, setState] = useState(initialValue);\r
\`\`\`\r
\r
**What it does.** Stores a value across re-renders and gives you a setter that triggers a re-render when called.\r
\r
**When to use it.** Any component-local value that affects the UI: form inputs, toggles, counters, fetched data, modals open/closed.\r
\r
**Pitfall — setters are async-feeling.** \`setState(state + 1)\` reads a stale \`state\`. For updates that depend on the previous value, pass a function: \`setState(s => s + 1)\`. Calling it twice in a row both increment correctly only with the function form.\r
\r
See §5.1 for a deeper walkthrough including lazy initialization and update batching.\r
\r
#### \`useReducer\` — state with a reducer function\r
\r
\`\`\`tsx\r
type State = { count: number };\r
type Action = { type: 'inc' } | { type: 'reset' };\r
\r
const reducer = (s: State, a: Action): State =>\r
  a.type === 'inc' ? { count: s.count + 1 } : { count: 0 };\r
\r
const initialState: State = { count: 0 };\r
const initialArg = 10;\r
const init = (n: number): State => ({ count: n });   // runs once, lazily\r
\r
function Counter() {\r
  // Two forms. The third argument is a lazy initialiser, called with initialArg.\r
  const [state, dispatch] = useReducer(reducer, initialState);\r
  const [lazyState, lazyDispatch] = useReducer(reducer, initialArg, init);\r
\r
  return (\r
    <button onClick={() => { dispatch({ type: 'inc' }); lazyDispatch({ type: 'inc' }); }}>\r
      {state.count} / {lazyState.count}\r
    </button>\r
  );\r
}\r
\`\`\`\r
\r
**What it does.** Same job as \`useState\`, but transitions go through a \`(state, action) => newState\` function. \`dispatch({ type: '...' })\` triggers the next state.\r
\r
**When to use it.** When state has multiple sub-values that update together, when next state depends on previous state in non-trivial ways, or when you want to centralize update logic in one testable function. Forms with many fields, undo/redo, complex toggles.\r
\r
**Pitfall — don't over-reach for it.** A single boolean does not need a reducer. Reducers earn their complexity only when transitions are coupled.\r
\r
See §5.3 for examples including the \`init\` lazy-initializer.\r
\r
#### \`useEffect\` — synchronize with external systems\r
\r
\`\`\`tsx\r
// Signature\r
declare function useEffect(\r
  setup: () => void | (() => void),   // return a cleanup, or nothing\r
  deps?: readonly unknown[],          // omitted = run after every render\r
): void;\r
\r
// Shape in practice\r
const deps: unknown[] = [];\r
useEffect(() => {\r
  /* setup */\r
  return () => { /* cleanup */ };\r
}, [deps]);\r
\`\`\`\r
\r
**What it does.** Runs \`setup\` after the browser paints. Returns an optional cleanup function that runs before the next setup or on unmount.\r
\r
**When to use it.** Subscriptions (websockets, event listeners), DOM measurements after layout, integrating non-React libraries. **Not** for deriving state from props (just compute it during render) and **not** for handling user events (use the handler).\r
\r
**Pitfall — missing cleanup leaks.** Forgetting to return a cleanup that detaches the listener / aborts the fetch leads to leaks and "Can't perform a state update on an unmounted component" warnings.\r
\r
See §7 for the full effect lifecycle, dependency rules, and the \`useEffect\` vs derived-state vs handler decision tree (§7.4).\r
\r
#### \`useContext\` — read from a Provider\r
\r
\`\`\`tsx\r
const value = useContext(MyContext);\r
\`\`\`\r
\r
**What it does.** Subscribes the component to the nearest \`<MyContext.Provider value={...}>\` above it. The component re-renders whenever that \`value\` changes (referentially).\r
\r
**When to use it.** Cross-cutting concerns: theme, current user, locale, feature flags. Anything that many components need without prop-drilling.\r
\r
**Pitfall — re-render storms.** Every consumer re-renders on every \`value\` change. If you put a fast-changing object literal as \`value={{ user, setUser }}\`, every consumer re-renders on every keystroke. Memoize the value or split state from setters into separate contexts.\r
\r
\`\`\`tsx\r
const ThemeContext = createContext<'light' | 'dark'>('light');\r
function ThemedButton() {\r
  const theme = useContext(ThemeContext);\r
  return <button className={theme}>Click</button>;\r
}\r
\`\`\`\r
\r
#### \`useRef\` — mutable box that survives re-renders\r
\r
\`\`\`tsx\r
const ref = useRef(initialValue);\r
ref.current  // read or write — does NOT trigger re-render\r
\`\`\`\r
\r
**What it does.** Returns a stable \`{ current }\` object. Mutating \`current\` does **not** trigger a re-render. Two main uses:\r
1. **DOM references** — \`<input ref={inputRef} />\`, then \`inputRef.current.focus()\`.\r
2. **Instance variables** — store interval IDs, previous values, mutable flags that don't drive UI.\r
\r
**When to use it.** Anything you need to remember across renders that should NOT cause a re-render when it changes: timer ids, the previous value of a prop, "did this run already" guards.\r
\r
**Pitfall — don't read \`.current\` during render.** Doing so makes render impure. Read it inside effects and handlers.\r
\r
\`\`\`tsx\r
const intervalRef = useRef<number | null>(null);\r
useEffect(() => {\r
  intervalRef.current = window.setInterval(tick, 1000);\r
  return () => { if (intervalRef.current) clearInterval(intervalRef.current); };\r
}, []);\r
\`\`\`\r
\r
#### \`useMemo\` — cache an expensive computation\r
\r
\`\`\`tsx\r
const value = useMemo(() => expensiveCompute(a, b), [a, b]);\r
\`\`\`\r
\r
**What it does.** Memoizes the result of the function across renders. React only re-runs it when one of the dependencies changes (by \`Object.is\` comparison).\r
\r
**When to use it.** Genuinely expensive pure computations (parsing large data, building lookup tables) **or** preserving referential identity of an object/array passed to a memoized child or used in a \`useEffect\` dep list.\r
\r
**Pitfall — premature optimization.** Wrapping every value in \`useMemo\` adds bookkeeping with no benefit. The \`() => ...\` allocation, dep array allocation, and \`Object.is\` comparisons can cost more than the computation itself for cheap values. Profile first.\r
\r
#### \`useCallback\` — memoize a function reference\r
\r
\`\`\`tsx\r
const onClick = useCallback((id: string) => { selectItem(id); }, [selectItem]);\r
\`\`\`\r
\r
**What it does.** Returns the **same function reference** between renders as long as deps are unchanged. Equivalent to \`useMemo(() => fn, deps)\` — same identity-stabilizing job, function-shaped.\r
\r
**When to use it.** When the function is passed to a \`React.memo\`'d child or used as a dep of \`useEffect\` / \`useMemo\`. Without it, a fresh closure each render breaks downstream memoization.\r
\r
**Pitfall — useless without consumer memoization.** If the child isn't memoized, wrapping the prop in \`useCallback\` does nothing. Each render still re-renders the child.\r
\r
#### \`useImperativeHandle\` — expose methods on a ref\r
\r
\`\`\`tsx\r
useImperativeHandle(ref, () => ({\r
  focus: () => inputRef.current?.focus(),\r
  scrollTo: (y: number) => containerRef.current?.scrollTo(0, y),\r
}), []);\r
\`\`\`\r
\r
**What it does.** When a parent passes a \`ref\` to your component, this hook lets you customize what \`ref.current\` exposes — methods, not the DOM node.\r
\r
**When to use it.** Sparingly. Only when a parent genuinely needs to imperatively command a child (focus an input, scroll a list, play a video). Most of the time, props + state are the right answer.\r
\r
**Pitfall — bypassing React's data flow.** If you reach for \`useImperativeHandle\` to "trigger something in a child", you're usually fighting the framework. Ask whether prop-driven state would do the job.\r
\r
#### \`useLayoutEffect\` — synchronous effect before paint\r
\r
\`\`\`tsx\r
// Same signature as useEffect — it differs only in WHEN it runs:\r
// synchronously after DOM mutation, before the browser paints.\r
declare function useLayoutEffect(\r
  setup: () => void | (() => void),\r
  deps?: readonly unknown[],\r
): void;\r
\`\`\`\r
\r
**What it does.** Same shape as \`useEffect\`, but runs **synchronously after DOM mutation and before the browser paints**. The user never sees the in-between state.\r
\r
**When to use it.** When you need to read layout (\`getBoundingClientRect\`, \`scrollHeight\`) and mutate the DOM in response, in a way that would flicker if delayed to \`useEffect\`. Tooltips that need to reposition, auto-scroll-to-bottom on new messages, focus management after a layout change.\r
\r
**Pitfall — blocks paint.** The browser waits for this to finish before painting. Heavy work here freezes the UI. Default to \`useEffect\` and only escalate to \`useLayoutEffect\` when you see a flicker.\r
\r
#### \`useDebugValue\` — label a custom hook in DevTools\r
\r
\`\`\`tsx\r
function useOnlineStatus() {\r
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);\r
\r
  useEffect(() => {\r
    const update = () => setIsOnline(navigator.onLine);\r
    window.addEventListener('online', update);\r
    window.addEventListener('offline', update);\r
    return () => {\r
      window.removeEventListener('online', update);\r
      window.removeEventListener('offline', update);\r
    };\r
  }, []);\r
\r
  // Shows "Online" / "Offline" beside the hook in React DevTools.\r
  useDebugValue(isOnline ? 'Online' : 'Offline');\r
  return isOnline;\r
}\r
\`\`\`\r
\r
**What it does.** Adds a label next to your custom hook in React DevTools.\r
\r
**When to use it.** In shared custom hooks that ship in libraries. For app-internal hooks, the variable names already tell DevTools enough.\r
\r
**Pitfall — formatting overhead.** Pass a \`formatFn\` second argument if formatting is expensive — it only runs when DevTools inspects the hook.\r
\r
#### \`useSyncExternalStore\` — subscribe to a non-React store\r
\r
\`\`\`tsx\r
// The third argument is optional, but required for SSR — without it,\r
// hydration throws.\r
declare function useSyncExternalStore<T>(\r
  subscribe: (onStoreChange: () => void) => () => void,\r
  getSnapshot: () => T,\r
  getServerSnapshot?: () => T,\r
): T;\r
\r
// A concrete instance\r
const width = useSyncExternalStore(\r
  (cb) => {\r
    window.addEventListener('resize', cb);\r
    return () => window.removeEventListener('resize', cb);\r
  },\r
  () => window.innerWidth,\r
  () => 1024,                        // server snapshot\r
);\r
\`\`\`\r
\r
**What it does.** Subscribes a component to a store that lives outside React — Redux, Zustand, browser APIs (\`window.localStorage\`, \`window.matchMedia\`), event emitters — and re-renders it when the store changes. The reason it exists instead of "\`useState\` + \`useEffect\`" is **tearing**: under concurrent rendering React can pause a render halfway, and if the store changes during the pause, components rendered before and after the change would show different values on the same screen. \`useSyncExternalStore\` detects that and re-renders consistently.\r
\r
**When to use it.** Building a state library, subscribing to a global event source, or wrapping a browser API in a hook. End users of Redux/Zustand never call this directly — the libraries use it under the hood.\r
\r
**Pitfall — \`getSnapshot\` must be stable.** It must return \`===\`-equal values when nothing changed, or React will infinite-loop re-rendering. Don't return a fresh object literal each call.\r
\r
\`\`\`tsx\r
function useWindowWidth() {\r
  return useSyncExternalStore(\r
    (cb) => { window.addEventListener('resize', cb); return () => window.removeEventListener('resize', cb); },\r
    () => window.innerWidth,\r
    () => 0,  // SSR fallback\r
  );\r
}\r
\`\`\`\r
\r
#### \`useId\` — stable, unique, SSR-safe IDs\r
\r
\`\`\`tsx\r
function NameField() {\r
  const id = useId();\r
  return (\r
    <>\r
      <label htmlFor={id}>Name</label>\r
      <input id={id} />\r
    </>\r
  );\r
}\r
\`\`\`\r
\r
**What it does.** Generates a unique ID that's stable across renders and identical between server and client (avoids hydration mismatches).\r
\r
**When to use it.** Linking labels to inputs, ARIA \`aria-describedby\`, or any DOM-id attribute. Especially important under SSR — \`Math.random()\` and counters break hydration; \`useId\` doesn't.\r
\r
**Pitfall — don't use it as a list key.** It's not derived from data; it's per-component-instance. Use stable data IDs for \`key\`.\r
\r
#### \`useTransition\` — mark updates as non-urgent\r
\r
\`\`\`tsx\r
const [isPending, startTransition] = useTransition();\r
startTransition(() => { setExpensiveState(next); });\r
\`\`\`\r
\r
**What it does.** State updates inside \`startTransition\` are marked low-priority. React keeps the previous UI interactive while the transition renders, and can interrupt the transition if a higher-priority update (e.g., another keystroke) arrives.\r
\r
**When to use it.** When typing into a search box would freeze the UI because the result list is expensive to render. Wrap the expensive state update in \`startTransition\`; let the input field update urgently.\r
\r
**Pitfall — it marks state updates, nothing else.** A transition does not make a network call or a \`setTimeout\` faster or lower-priority; it only changes how React schedules the *state updates* made inside it. In React 18 the callback had to be synchronous. React 19 also accepts an async function (an "Action", see §16), but a \`set\` call that runs after an \`await\` inside it is no longer part of the transition unless you wrap that call in \`startTransition\` again.\r
\r
\`\`\`tsx\r
function Search() {\r
  const [query, setQuery] = useState('');\r
  const [results, setResults] = useState<Item[]>([]);\r
  const [isPending, startTransition] = useTransition();\r
  return (\r
    <input\r
      value={query}\r
      onChange={(e) => {\r
        setQuery(e.target.value);                    // urgent\r
        startTransition(() => setResults(filter(e.target.value))); // can be interrupted\r
      }}\r
    />\r
  );\r
}\r
\`\`\`\r
\r
#### \`useDeferredValue\` — render a stale value while a fresh one catches up\r
\r
\`\`\`tsx\r
const deferredQuery = useDeferredValue(query);\r
\`\`\`\r
\r
**What it does.** Returns a value that "lags behind" the input. React renders with the stale value first (fast), then re-renders with the fresh value as a low-priority update (which can be interrupted).\r
\r
**When to use it.** Same problem as \`useTransition\` from a different angle — you don't own the setter (e.g., it's a prop from above), so you can't wrap the update. Wrap the *value* instead.\r
\r
**Pitfall — don't pair it with \`useTransition\`.** Pick one. If you own the setter, use \`useTransition\`. If you don't, use \`useDeferredValue\`.\r
\r
#### React 19 additions (preview)\r
\r
The action/forms hooks — \`useActionState\`, \`useFormStatus\`, \`useOptimistic\` — are covered in detail in §16.\r
\r
### 6.3 Custom Hooks\r
\r
A custom hook is a function whose name starts with \`use\` and which calls other hooks. That's the whole mechanism — the naming convention is what lets the linter apply the rules of hooks to it.\r
\r
**They share stateful logic, not state.** Two components calling \`useToggle()\` each get their own independent value. If you want shared *state*, you need context or a store; a custom hook shares the *behaviour*.\r
\r
Each hook below is the version to actually write, followed by how to consume it.\r
\r
#### \`useToggle\` — the shape of a custom hook\r
\r
The simplest useful one. It establishes the pattern: private state, a stable action, a tuple return.\r
\r
\`\`\`tsx\r
function useToggle(initial = false) {\r
  const [value, setValue] = useState(initial);\r
  // Functional update, so \`toggle\` never needs \`value\` as a dependency and\r
  // its identity stays stable for the life of the component.\r
  const toggle = useCallback(() => setValue(v => !v), []);\r
  return [value, toggle, setValue] as const;\r
}\r
\`\`\`\r
\r
**Why \`as const\`.** Without it the return type widens to \`(boolean | (() => void))[]\` and destructuring gives you a union in both positions. \`as const\` makes it a tuple, so \`isOpen\` is \`boolean\` and \`toggleOpen\` is callable.\r
\r
**Using it:**\r
\r
\`\`\`tsx\r
// the hook from above, repeated so this example runs on its own\r
function useToggle(initial = false) {\r
  const [value, setValue] = useState(initial);\r
  const toggle = useCallback(() => setValue(v => !v), []);\r
  return [value, toggle, setValue] as const;\r
}\r
// stand-in so this example runs on its own\r
const Details = ({ onClose }: { onClose: () => void }) => (\r
  <p>Some details. <button onClick={onClose}>Close</button></p>\r
);\r
\r
function Panel() {\r
  const [isOpen, toggleOpen, setOpen] = useToggle();\r
\r
  return (\r
    <>\r
      <button onClick={toggleOpen} aria-expanded={isOpen}>\r
        {isOpen ? 'Hide' : 'Show'} details\r
      </button>\r
      {isOpen && <Details onClose={() => setOpen(false)} />}\r
    </>\r
  );\r
}\r
\r
render(<Panel />);\r
\`\`\`\r
\r
#### \`useDebounce\` — delay a fast-changing value\r
\r
Returns a copy of \`value\` that only updates once \`delay\` has passed with no further changes. The classic use is a search box: react to typing, but not on every keystroke.\r
\r
\`\`\`tsx\r
function useDebounce<T>(value: T, delay: number): T {\r
  const [debounced, setDebounced] = useState(value);\r
\r
  useEffect(() => {\r
    const timer = setTimeout(() => setDebounced(value), delay);\r
    // The important line: a new keystroke runs this cleanup, cancelling the\r
    // pending timer before scheduling the next one. Without it you get one\r
    // update per keystroke, just late.\r
    return () => clearTimeout(timer);\r
  }, [value, delay]);\r
\r
  return debounced;\r
}\r
\`\`\`\r
\r
**The cleanup *is* the debounce.** Everything else is bookkeeping — worth saying in an interview. Also worth naming: the first value is returned immediately rather than after \`delay\`, because \`useState(value)\` seeds it, so the initial render is not delayed.\r
\r
**Using it:**\r
\r
\`\`\`tsx\r
// the hook from above, repeated so this example runs on its own\r
function useDebounce<T>(value: T, delay: number): T {\r
  const [debounced, setDebounced] = useState(value);\r
  useEffect(() => {\r
    const timer = setTimeout(() => setDebounced(value), delay);\r
    return () => clearTimeout(timer);\r
  }, [value, delay]);\r
  return debounced;\r
}\r
\r
function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {\r
  const [query, setQuery] = useState('');\r
  const debounced = useDebounce(query, 500);\r
\r
  // Fires 500 ms after typing stops, not on every keystroke.\r
  useEffect(() => { onSearch(debounced); }, [debounced, onSearch]);\r
\r
  // The input stays bound to \`query\`, so typing feels instant.\r
  return <input value={query} onChange={e => setQuery(e.target.value)} />;\r
}\r
\r
function Demo() {\r
  // useCallback keeps onSearch stable, so the effect above only re-runs when \`debounced\` changes.\r
  const onSearch = useCallback((q: string) => console.log('search:', q), []);\r
  return <SearchBox onSearch={onSearch} />;\r
}\r
\r
render(<Demo />);\r
\`\`\`\r
\r
**Note the split.** The input reads \`query\` (immediate, so typing is responsive); the effect reads \`debounced\` (delayed). Binding the input to \`debounced\` would make the field feel broken.\r
\r
#### \`useFetch\` — the canonical "build one live" ask\r
\r
One state object as a discriminated union, and an \`aborted\` guard in both handlers:\r
\r
\`\`\`tsx\r
type FetchState<T> =\r
  | { status: 'loading'; data: null; error: null }\r
  | { status: 'success'; data: T;    error: null }\r
  | { status: 'error';   data: null; error: Error };\r
\r
function useFetch<T>(url: string | null) {\r
  const [state, setState] = useState<FetchState<T>>({\r
    status: 'loading', data: null, error: null,\r
  });\r
\r
  useEffect(() => {\r
    if (!url) return;\r
    const ac = new AbortController();\r
    // Reset on every url change, so a stale payload is never shown as fresh.\r
    setState({ status: 'loading', data: null, error: null });\r
\r
    fetch(url, { signal: ac.signal })\r
      .then(async r => {\r
        if (!r.ok) throw new Error(\`HTTP \${r.status} \${r.statusText}\`);\r
        return (await r.json()) as T;\r
      })\r
      .then(data => {\r
        if (ac.signal.aborted) return;\r
        setState({ status: 'success', data, error: null });\r
      })\r
      .catch(e => {\r
        if (ac.signal.aborted) return;\r
        setState({\r
          status: 'error',\r
          data: null,\r
          error: e instanceof Error ? e : new Error(String(e)),\r
        });\r
      });\r
\r
    return () => ac.abort();\r
  }, [url]);\r
\r
  return state;\r
}\r
\`\`\`\r
\r
**The three things that make it correct**, and the three things an interviewer is listening for:\r
\r
**1. \`if (ac.signal.aborted) return\` in both handlers — not \`.finally\`.** This is the detail that matters most. When \`url\` changes, React runs the old effect's cleanup and the new effect body synchronously in the same commit, and the old promise settles a microtask later:\r
\r
\`\`\`\r
ac.abort()               old request killed\r
setState(loading)        new effect starts\r
--- microtasks flush ---\r
old chain settles        ← still writes state unless guarded\r
\`\`\`\r
\r
A \`.finally(() => setLoading(false))\` runs on **every** settlement, including an abort. So \`loading\` would go false while the new request is still in flight, and the component would render the previous URL's data as if it were fresh. The \`aborted\` guard makes it impossible for a cancelled request to touch state at all.\r
\r
**2. Resetting to \`loading\` at the top of the effect.** Without it, \`data\` and \`error\` from the previous URL survive into the new request — so switching from \`/users/1\` to \`/users/2\` shows user 1 throughout, and a 404 on the first can leave \`error\` set forever while \`data\` is also populated.\r
\r
**3. One state object, not three \`useState\` calls.** Three independent pieces of state can disagree; a union cannot. It also means \`data\` is \`T\` rather than \`T | null\` once you have narrowed on \`status\`, so consumers need no null checks.\r
\r
**Using it.** The union narrows for you:\r
\r
\`\`\`tsx\r
// stand-ins so this example runs on its own: a fake useFetch that "loads" for\r
// 600 ms and returns canned data, plus a Spinner. Use the real hook above in an app.\r
type FetchState<T> =\r
  | { status: 'loading'; data: null; error: null }\r
  | { status: 'success'; data: T;    error: null }\r
  | { status: 'error';   data: null; error: Error };\r
function useFetch<T>(url: string | null): FetchState<T> {\r
  const [data, setData] = useState<T | null>(null);\r
  useEffect(() => {\r
    if (!url) return;\r
    setData(null);\r
    const t = setTimeout(() => setData({ id: 1, name: 'Ada Lovelace', email: 'ada@example.com' } as T), 600);\r
    return () => clearTimeout(t);\r
  }, [url]);\r
  return data === null\r
    ? { status: 'loading', data: null, error: null }\r
    : { status: 'success', data, error: null };\r
}\r
const Spinner = () => <p>Loading…</p>;\r
\r
type User = { id: number; name: string; email: string };\r
\r
function Profile({ id }: { id: number }) {\r
  const { status, data, error } = useFetch<User>(\`/api/users/\${id}\`);\r
\r
  if (status === 'loading') return <Spinner />;\r
  if (status === 'error') return <p role="alert">{error.message}</p>;\r
\r
  return <h1>{data.name}</h1>;   // \`data\` is User here, not User | null\r
}\r
\r
render(<Profile id={1} />);\r
\`\`\`\r
\r
**Composed with \`useDebounce\`** — note \`null\` as the skip signal, and \`encodeURIComponent\`:\r
\r
\`\`\`tsx\r
// stand-ins so this example runs on its own: useDebounce from above, and a fake\r
// useFetch that "loads" for 600 ms and returns canned results.\r
function useDebounce<T>(value: T, delay: number): T {\r
  const [debounced, setDebounced] = useState(value);\r
  useEffect(() => {\r
    const timer = setTimeout(() => setDebounced(value), delay);\r
    return () => clearTimeout(timer);\r
  }, [value, delay]);\r
  return debounced;\r
}\r
type FetchState<T> =\r
  | { status: 'loading'; data: null; error: null }\r
  | { status: 'success'; data: T;    error: null }\r
  | { status: 'error';   data: null; error: Error };\r
type Result = { id: number; title: string };\r
function useFetch<T>(url: string | null): FetchState<T> {\r
  const [data, setData] = useState<T | null>(null);\r
  useEffect(() => {\r
    if (!url) return;\r
    setData(null);\r
    const q = decodeURIComponent(url.split('q=')[1] ?? '');\r
    const results: Result[] = [1, 2, 3].map(id => ({ id, title: \`\${q} result \${id}\` }));\r
    const t = setTimeout(() => setData(results as T), 600);\r
    return () => clearTimeout(t);\r
  }, [url]);\r
  return data === null\r
    ? { status: 'loading', data: null, error: null }\r
    : { status: 'success', data, error: null };\r
}\r
const Spinner = () => <p>Loading…</p>;\r
\r
function Search() {\r
  const [query, setQuery] = useState('');\r
  const debounced = useDebounce(query, 500);\r
\r
  const { status, data } = useFetch<Result[]>(\r
    debounced.trim() ? \`/api/search?q=\${encodeURIComponent(debounced.trim())}\` : null,\r
  );\r
\r
  return (\r
    <>\r
      <input value={query} onChange={e => setQuery(e.target.value)} />\r
      {status === 'loading' && debounced && <Spinner />}\r
      {status === 'success' && <ul>{data.map(r => <li key={r.id}>{r.title}</li>)}</ul>}\r
    </>\r
  );\r
}\r
\r
render(<Search />);\r
\`\`\`\r
\r
**One caveat on that composition.** With \`url === null\` the effect early-returns, so the state keeps whatever it was — clearing the input leaves the last results on screen. If you want an empty query to clear them, add an \`idle\` status:\r
\r
\`\`\`tsx\r
type FetchState<T> =\r
  | { status: 'idle';    data: null; error: null }\r
  | { status: 'loading'; data: null; error: null }\r
  | { status: 'success'; data: T;    error: null }\r
  | { status: 'error';   data: null; error: Error };\r
\`\`\`\r
\r
Then inside the effect, replace the bail-out with one that clears state — \`if (!url) { setState({ status: 'idle', data: null, error: null }); return; }\` — and the consumer gets an \`idle\` branch to render an empty state instead of stale results.\r
\r
**Two smaller things worth mentioning if asked.** \`r.json()\` throws on a \`204\` or an empty body, so guard with \`r.status === 204 ? null : r.json()\` when your API does that. And \`(await r.json()) as T\` is an assertion, not a guarantee — the real answer is to validate at the boundary with Zod or Valibot so \`T\` is earned rather than claimed.\r
\r
**And the honest framing to close on:** in production this is TanStack Query or SWR. They give you caching, request de-duplication, background refetch and retry, none of which this hook has. Writing it by hand is a good interview exercise because it forces you to think about cancellation; shipping it by hand is re-implementing a solved problem badly.\r
\r
#### \`useLocalStorage\` — persist state, safely\r
\r
\`\`\`tsx\r
function safeRead<T>(key: string, fallback: T): T {\r
  try {\r
    const raw = window.localStorage.getItem(key);\r
    return raw === null ? fallback : (JSON.parse(raw) as T);\r
  } catch {\r
    // Unavailable storage, or a corrupt value. Either way: fall back.\r
    return fallback;\r
  }\r
}\r
\r
function useLocalStorage<T>(key: string, initialValue: T) {\r
  const [value, setValue] = useState<T>(() => safeRead(key, initialValue));\r
\r
  // Re-read when the key changes, so we never write one key's value to another.\r
  const keyRef = useRef(key);\r
  if (keyRef.current !== key) {\r
    keyRef.current = key;\r
    setValue(safeRead(key, initialValue));   // render-phase update: allowed, re-renders immediately\r
  }\r
\r
  useEffect(() => {\r
    try {\r
      window.localStorage.setItem(key, JSON.stringify(value));\r
    } catch {\r
      // Quota exceeded, or storage disabled. The app keeps working; the\r
      // preference just will not survive a reload.\r
    }\r
  }, [key, value]);\r
\r
  // Cross-tab sync. The \`storage\` event fires in OTHER tabs, never the one\r
  // that wrote — so there is no feedback loop to guard against.\r
  useEffect(() => {\r
    const onStorage = (e: StorageEvent) => {\r
      if (e.key === key) setValue(safeRead(key, initialValue));\r
    };\r
    window.addEventListener('storage', onStorage);\r
    return () => window.removeEventListener('storage', onStorage);\r
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialValue is\r
    // only a fallback; re-subscribing when its identity changes is pointless.\r
  }, [key]);\r
\r
  return [value, setValue] as const;\r
}\r
\`\`\`\r
\r
**Why every access is wrapped in \`try\`/\`catch\`.** Web storage does not merely return \`null\` when unavailable — **accessing it throws**. In a private window, with site data blocked, or in an embedded context, it raises a \`SecurityError\`. That read sits inside a \`useState\` initialiser, which runs **during render**, so an unguarded throw propagates out of render, React unmounts the tree, and the user gets a blank page. Not a missing preference: a blank page. \`JSON.parse\` on stored data is the same hazard — a half-written or hand-edited value is a \`SyntaxError\` in the same position.\r
\r
**Why the key is re-read.** Without the \`keyRef\` check the state does not follow a changed \`key\`, but the effect still *writes* — so switching from key \`a\` to key \`b\` writes \`a\`'s value into \`b\`.\r
\r
**Using it:**\r
\r
\`\`\`tsx\r
// a short copy of the hook above, so this example runs on its own\r
function useLocalStorage<T>(key: string, initialValue: T) {\r
  const [value, setValue] = useState<T>(() => {\r
    try {\r
      const raw = window.localStorage.getItem(key);\r
      return raw === null ? initialValue : (JSON.parse(raw) as T);\r
    } catch { return initialValue; }\r
  });\r
  useEffect(() => {\r
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }\r
  }, [key, value]);\r
  return [value, setValue] as const;\r
}\r
\r
function ThemeToggle() {\r
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');\r
\r
  useEffect(() => {\r
    document.documentElement.dataset.theme = theme;\r
  }, [theme]);\r
\r
  // The setter is useState's own, so the functional form works as usual.\r
  return (\r
    <button onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}>\r
      Switch to {theme === 'light' ? 'dark' : 'light'}\r
    </button>\r
  );\r
}\r
\r
render(<ThemeToggle />);\r
\`\`\`\r
\r
**The generic is a claim, not a guarantee** — same as in \`useFetch\`. \`JSON.parse(raw) as T\` will happily hand you a number where you promised \`'light' | 'dark'\`. If the value drives anything important, validate it: \`raw === 'dark' || raw === 'light' ? raw : fallback\`.\r
\r
#### \`useMediaQuery\` — subscribe to something outside React\r
\r
The pattern for any external subscription: subscribe in the effect, unsubscribe in the cleanup, and make the dependency array exactly what the subscription depends on.\r
\r
\`\`\`tsx\r
function useMediaQuery(query: string): boolean {\r
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);\r
\r
  useEffect(() => {\r
    const mql = window.matchMedia(query);\r
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);\r
    setMatches(mql.matches);                 // resync in case it changed before we subscribed\r
    mql.addEventListener('change', onChange);\r
    return () => mql.removeEventListener('change', onChange);\r
  }, [query]);\r
\r
  return matches;\r
}\r
\`\`\`\r
\r
**Using it** — the component says nothing about listeners at all:\r
\r
\`\`\`tsx\r
// the hook from above, repeated so this example runs on its own\r
function useMediaQuery(query: string): boolean {\r
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);\r
  useEffect(() => {\r
    const mql = window.matchMedia(query);\r
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);\r
    setMatches(mql.matches);\r
    mql.addEventListener('change', onChange);\r
    return () => mql.removeEventListener('change', onChange);\r
  }, [query]);\r
  return matches;\r
}\r
// stand-ins so this example runs on its own\r
const DesktopNav = () => <nav>Desktop nav (resize the window below 768px)</nav>;\r
const MobileNav = () => <nav>Mobile nav (widen the window past 768px)</nav>;\r
\r
function Nav() {\r
  const isWide = useMediaQuery('(min-width: 768px)');\r
  return isWide ? <DesktopNav /> : <MobileNav />;\r
}\r
\r
render(<Nav />);\r
\`\`\`\r
\r
Every consumer gets the cleanup for free, and the resync-before-subscribe fix was made once. For a value you read *from* an external store rather than an event stream you accumulate, prefer \`useSyncExternalStore\` — see §6.2 and Q50.\r
\r
#### What makes a custom hook worth extracting\r
\r
- The same \`useState\` + \`useEffect\` + cleanup shape appears in more than one component.\r
- A single component's logic is obscuring what it renders. After extracting, does the component read more like a description of its UI?\r
- **Not** when it is used in exactly one place and does not simplify that place — that is indirection for its own sake. And a hook taking eight parameters and returning twelve values is a component that should have been split.\r
\r
The senior signal in all of these is the same: reaching for the **cleanup and the failure path** unprompted, rather than only the happy path.\r
\r
---\r
\r
## 7. Effects and Lifecycle\r
\r
### 7.1 useEffect\r
\r
\`useEffect\` lets you run side effects (data fetching, subscriptions, DOM manipulation) after React has updated the DOM. The dependency array controls when the effect re-runs.\r
\r
\`\`\`tsx\r
// Runs after every render\r
useEffect(() => {\r
  console.log('rendered');\r
});\r
\r
// Runs once on mount\r
useEffect(() => {\r
  fetchData();\r
}, []);\r
\r
// Runs when dependencies change\r
useEffect(() => {\r
  fetchUser(userId);\r
}, [userId]);\r
\r
// Cleanup (runs before next effect and on unmount)\r
useEffect(() => {\r
  const subscription = api.subscribe(userId, handleUpdate);\r
  return () => {\r
    subscription.unsubscribe();            // cleanup\r
  };\r
}, [userId]);\r
\r
// Common use cases:\r
// - API calls\r
// - Event listeners (add on mount, remove on cleanup)\r
// - Timers (start on mount, clear on cleanup)\r
// - DOM manipulation\r
// - Subscriptions\r
\`\`\`\r
\r
### 7.2 Lifecycle Mapping (Class -> Hooks)\r
\r
If you're coming from class components, here's how lifecycle methods map to hooks.\r
\r
\`\`\`\r
componentDidMount     -> useEffect(() => { ... }, [])\r
componentDidUpdate    -> useEffect(() => { ... }, [deps])\r
componentWillUnmount  -> useEffect(() => { return () => { ... } }, [])\r
shouldComponentUpdate -> React.memo()\r
\`\`\`\r
\r
### 7.3 Common Pitfalls\r
\r
Three mistakes account for most \`useEffect\` bugs. All three come from the same fact: an effect is a closure over the render that created it, so it sees that render's values and nothing newer.\r
\r
\`\`\`tsx\r
// 1. Missing dependency\r
const [count, setCount] = useState(0);\r
useEffect(() => {\r
  const timer = setInterval(() => {\r
    setCount(count + 1);                   // BUG: count is stale (closure)\r
  }, 1000);\r
  return () => clearInterval(timer);\r
}, []);                                     // count not in deps\r
\r
// FIX: use functional update\r
setCount(prev => prev + 1);\r
\r
// 2. Object/array in dependency array\r
useEffect(() => {\r
  fetchData(filters);\r
}, [filters]);                             // BUG: new object reference every render\r
\r
// FIX: use specific values\r
useEffect(() => {\r
  fetchData(filters);\r
}, [filters.search, filters.page]);\r
\r
// 3. Fetch race condition\r
useEffect(() => {\r
  let cancelled = false;\r
  async function load() {\r
    const data = await fetchData(id);\r
    if (!cancelled) setData(data);          // only update if not cancelled\r
  }\r
  load();\r
  return () => { cancelled = true; };\r
}, [id]);\r
\`\`\`\r
\r
**What each one is doing:**\r
\r
1. **Stale closure.** With \`[]\` the effect runs once, so the interval callback keeps the \`count\` from the first render (0) forever and sets 1 every second. The updater form \`prev => prev + 1\` asks React for the current value instead of reading the captured one, so the dependency array can honestly stay empty.\r
2. **Object dependency.** React compares dependencies with \`Object.is\`, which for an object means "same reference?". If \`filters\` is built during render (\`const filters = { search, page }\`), it is a new object every render, so the effect re-runs every render — often an infinite fetch loop if the fetch sets state. Depending on the primitive fields compares values instead.\r
3. **Race condition.** If \`id\` changes from 1 to 2 while request 1 is in flight, request 1 can finish *after* request 2 and overwrite the screen with the wrong user. The cleanup runs when \`id\` changes, flips \`cancelled\` for the old effect, and the late response is ignored. An \`AbortController\` does the same job and also cancels the network request.\r
\r
### 7.4 When NOT to Use useEffect\r
\r
Possibly the highest-leverage senior-level signal in React interviews: knowing that **most uses of \`useEffect\` you encounter are wrong**. The hook is for *synchronizing with external systems* — DOM APIs, browser APIs, network requests, third-party libraries. It is not for "do this when state changes." Each of the patterns below is something React-newcomers reach for \`useEffect\` to do; in each case, there is a better answer.\r
\r
**1. Don't use \`useEffect\` to derive state from props or other state.**\r
\r
\`\`\`tsx\r
type Item = { id: number; name: string };\r
const items: Item[] = [{ id: 1, name: 'apple' }, { id: 2, name: 'banana' }];\r
const query = 'an';\r
\r
// BAD — runs an extra render cycle just to compute something\r
function useFilteredBad() {\r
  const [filtered, setFiltered] = useState<Item[]>([]);\r
  useEffect(() => {\r
    setFiltered(items.filter(i => i.name.includes(query)));\r
  }, []);\r
  return filtered;\r
}\r
\r
// GOOD — derive directly during render. No extra render, no out-of-sync risk.\r
function useFilteredGood() {\r
  return items.filter(i => i.name.includes(query));\r
}\r
\r
// If the computation is genuinely expensive, memoize it — still derived,\r
// just cached.\r
function useFilteredMemo() {\r
  return useMemo(() => items.filter(i => i.name.includes(query)), []);\r
}\r
\`\`\`\r
\r
**2. Don't use \`useEffect\` for data fetching.** Use a real query library — TanStack Query, SWR, RTK Query, or your framework's data layer (Next.js \`loader\`, Remix loaders, RSC). Effect-based fetching gets caching, deduplication, retries, race conditions, refetching-on-focus, and stale-while-revalidate all wrong by default.\r
\r
\`\`\`tsx\r
// BAD — every component re-fetches; no caching, no dedup, race conditions on rapid prop changes\r
useEffect(() => { fetch(url).then(r => r.json()).then(setData); }, [url]);\r
\r
// GOOD — TanStack Query handles caching, dedup, retries, focus-refresh, etc.\r
const { data } = useQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id) });\r
\`\`\`\r
\r
**3. Don't use \`useEffect\` to "listen" to state changes for UI.** If you find yourself writing \`useEffect(() => { if (count === 10) doSomething(); }, [count])\`, the action belongs in the *event handler* that incremented \`count\`, not in an effect that runs after render.\r
\r
\`\`\`tsx\r
// BAD — effect-as-event-listener\r
useEffect(() => {\r
  if (formSubmitted) showThankYou();\r
}, [formSubmitted]);\r
\r
// GOOD — fire it where it happens\r
function handleSubmit() {\r
  setFormSubmitted(true);\r
  showThankYou();\r
}\r
\`\`\`\r
\r
**4. Don't reset state with \`useEffect\`.** Use \`key\` prop to remount instead.\r
\r
\`\`\`tsx\r
// BAD — runs an extra render to reset\r
useEffect(() => { setSelected(null); }, [userId]);\r
\r
// GOOD — \`key\` change remounts the component with fresh state\r
<UserProfile key={userId} userId={userId} />\r
\`\`\`\r
\r
**5. DO use \`useEffect\` for these.** This is its actual job:\r
\r
- **Subscribing to external stores** that don't already have a React adapter (\`useSyncExternalStore\` is even better here).\r
- **DOM APIs** that need to run after layout — manually focusing an input, measuring an element, attaching a non-React event listener.\r
- **Browser APIs** like \`IntersectionObserver\`, \`MutationObserver\`, WebSocket, \`setInterval\` (with cleanup).\r
- **Third-party libraries** that need to be initialized and torn down (Mermaid, Mapbox, charts).\r
- **Server synchronization** that's specifically *not* about user actions — heartbeats, presence pings, telemetry.\r
\r
The senior-engineer mental model: \`useEffect\` is the **escape hatch** to leave React's pure-render model. If you can solve the problem inside the render model — derivation, event handlers, \`key\`-based reset — that's almost always the right answer. Reach for \`useEffect\` only when you genuinely need to step outside.\r
\r
The official React docs have an entire page titled *"You Might Not Need an Effect"* — a good signal of how often the wrong pattern shows up in real codebases.\r
\r
**6. For the effects that survive that question, split reactive from non-reactive logic.** The remaining pain point with a legitimate effect is a value you need to *read* but don't want to *react* to — a theme used in a toast, a callback prop invoked on connect. React 19.2's \`useEffectEvent\` (§16.7) exists for exactly that: it gives you a function that is stable across renders yet always sees the latest props and state, so the dependency array stays both honest and minimal instead of forcing a choice between a lint suppression and an unwanted re-run.\r
\r
---\r
\r
## 8. Event Handling\r
\r
React passes your handler a **synthetic event**: a React wrapper around the browser's native event with the same interface (\`target\`, \`preventDefault()\`, \`stopPropagation()\`) that behaves the same in every browser. The native event is still there as \`e.nativeEvent\` if you need it. Handlers are written in camelCase (\`onClick\`, not \`onclick\`) and you pass a function, not a string.\r
\r
One pattern below is worth reading twice: \`handleItemClick(item.id)\` is *called* during render, and it returns the actual click handler. That is how you pass an argument without writing \`onClick={() => handleItemClick(item.id)}\` inline — both create a new function per item per render, so pick whichever reads better.\r
\r
\`\`\`tsx\r
// stand-ins so this example runs on its own\r
const items = [{ id: 'a', name: 'First item' }, { id: 'b', name: 'Second item' }];\r
const submit = () => console.log('submitted with Enter');\r
\r
function EventExamples() {\r
  // Click\r
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {\r
    e.preventDefault();\r
    console.log('clicked');\r
  };\r
\r
  // Input change\r
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {\r
    console.log(e.target.value);\r
  };\r
\r
  // Form submit\r
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {\r
    e.preventDefault();\r
    const formData = new FormData(e.currentTarget);\r
  };\r
\r
  // Keyboard\r
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {\r
    if (e.key === 'Enter') submit();\r
  };\r
\r
  // Passing data to handler\r
  const handleItemClick = (id: string) => () => {\r
    console.log('clicked item:', id);\r
  };\r
\r
  return (\r
    <form onSubmit={handleSubmit}>\r
      <input onChange={handleChange} onKeyDown={handleKeyDown} />\r
      <button onClick={handleClick}>Submit</button>\r
      {items.map(item => (\r
        <div key={item.id} onClick={handleItemClick(item.id)}>{item.name}</div>\r
      ))}\r
    </form>\r
  );\r
}\r
\r
render(<EventExamples />);\r
\`\`\`\r
\r
---\r
\r
## 9. Conditional Rendering and Lists\r
\r
### 9.1 Conditional Rendering\r
\r
React doesn't have built-in directives like \`v-if\` or \`ngIf\`. Instead, you use standard JavaScript expressions — ternaries, logical operators, and early returns.\r
\r
\`\`\`tsx\r
type User = { name: string };\r
const isLoggedIn = true;\r
const hasError = false;\r
const status = 'loading';\r
const Dashboard = () => <p>Dashboard</p>;\r
const Login = () => <p>Login</p>;\r
const ErrorMessage = () => <p role="alert">Something broke</p>;\r
const Spinner = () => <p>Loading…</p>;\r
const DataView = () => <p>Data</p>;\r
const FallBack = () => <p>Unknown state</p>;\r
\r
// Ternary — when there are exactly two outcomes\r
const a = <div>{isLoggedIn ? <Dashboard /> : <Login />}</div>;\r
\r
// Logical AND — render or nothing. Careful: \`0 && <X/>\` renders "0".\r
const b = <div>{hasError && <ErrorMessage />}</div>;\r
\r
// Early return — the clearest option for guard clauses\r
function UserCard({ user }: { user: User | null }) {\r
  if (!user) return <p>No user found</p>;\r
  return <div>{user.name}</div>;\r
}\r
\r
// Object map — replaces a switch when you have several discrete states\r
function StatusView() {\r
  const statusComponents: Record<string, React.ReactNode> = {\r
    loading: <Spinner />,\r
    error: <ErrorMessage />,\r
    success: <DataView />,\r
  };\r
  return statusComponents[status] ?? <FallBack />;\r
}\r
\`\`\`\r
\r
### 9.2 Lists\r
\r
Render lists by mapping over arrays in JSX. Every list item needs a \`key\` prop that identifies it among its siblings. On the next render React matches old and new items **by key**, not by position, so it can tell that an item moved, was inserted or was removed — and keep that item's DOM node and state attached to it. Without a stable key, an item's state (a typed-in input, an open menu) can end up on the wrong row after a reorder. §14.4 shows the algorithm.\r
\r
\`\`\`tsx\r
type User = { id: number; name: string };\r
\r
// Map over array\r
function UserList({ users }: { users: User[] }) {\r
  return (\r
    <ul>\r
      {users.map(user => (\r
        <li key={user.id}>{user.name}</li>\r
      ))}\r
    </ul>\r
  );\r
}\r
\r
// Key rules:\r
// - Must be unique among siblings\r
// - Must be stable (don't use index as key if list can reorder)\r
// - Use IDs from data, not array index\r
// - Keys help React identify which items changed/added/removed\r
\r
render(<UserList users={[{ id: 1, name: 'Ana' }, { id: 2, name: 'Ben' }]} />);\r
\`\`\`\r
\r
---\r
\r
## 10. Forms\r
\r
### 10.1 Controlled Components\r
\r
In a controlled component, React state is the single source of truth for form values: the input shows \`value={email}\` and every keystroke goes through \`setEmail\`. Because the value lives in state, you can validate on every keystroke, disable the submit button, or reformat input as the user types. The cost is a re-render of the component on every keystroke, which is fine for most forms.\r
\r
\`\`\`tsx\r
function LoginForm() {\r
  const [email, setEmail] = useState('');\r
  const [password, setPassword] = useState('');\r
\r
  const handleSubmit = (e: React.FormEvent) => {\r
    e.preventDefault();\r
    login({ email, password });\r
  };\r
\r
  return (\r
    <form onSubmit={handleSubmit}>\r
      <input\r
        type="email"\r
        value={email}\r
        onChange={(e) => setEmail(e.target.value)}\r
      />\r
      <input\r
        type="password"\r
        value={password}\r
        onChange={(e) => setPassword(e.target.value)}\r
      />\r
      <button type="submit">Login</button>\r
    </form>\r
  );\r
}\r
\`\`\`\r
\r
### 10.2 Uncontrolled Components (useRef)\r
\r
Uncontrolled components let the DOM keep the value, the way a plain HTML form does. You set a starting value with \`defaultValue\` (not \`value\`) and read the current value through a ref, typically on submit. Nothing re-renders while the user types, so this suits simple forms, file inputs (which can only be uncontrolled) and wrapping non-React widgets. The trade-off is that you cannot react to the value until you go and read it.\r
\r
\`\`\`tsx\r
function SearchForm() {\r
  const inputRef = useRef<HTMLInputElement>(null);\r
\r
  const handleSubmit = (e: React.FormEvent) => {\r
    e.preventDefault();\r
    console.log(inputRef.current?.value);\r
  };\r
\r
  return (\r
    <form onSubmit={handleSubmit}>\r
      <input ref={inputRef} defaultValue="" />\r
      <button type="submit">Search</button>\r
    </form>\r
  );\r
}\r
\`\`\`\r
\r
### 10.3 React Hook Form + Zod\r
\r
For large forms with validation, a library saves you writing a \`useState\` and an error message per field. **React Hook Form** registers inputs as *uncontrolled* (the \`register\` call attaches a ref), so typing does not re-render the form on every keystroke; it re-renders when form state you actually read, such as \`errors\`, changes. **Zod** is a schema library: you describe the shape once, it validates the data at runtime, and \`z.infer\` derives the TypeScript type from the same schema, so the type and the validation cannot disagree. \`zodResolver\` connects the two.\r
\r
\`\`\`tsx\r
import { useForm } from 'react-hook-form';\r
import { zodResolver } from '@hookform/resolvers/zod';\r
import { z } from 'zod';\r
\r
const schema = z.object({\r
  name: z.string().min(1, 'Required'),\r
  email: z.string().email('Invalid email'),\r
  age: z.number().min(18, 'Must be 18+'),\r
});\r
\r
type FormData = z.infer<typeof schema>;\r
\r
function UserForm() {\r
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({\r
    resolver: zodResolver(schema),\r
  });\r
\r
  const onSubmit = (data: FormData) => {\r
    console.log(data);\r
  };\r
\r
  return (\r
    <form onSubmit={handleSubmit(onSubmit)}>\r
      <input {...register('name')} />\r
      {errors.name && <span>{errors.name.message}</span>}\r
\r
      <input {...register('email')} />\r
      {errors.email && <span>{errors.email.message}</span>}\r
\r
      <input type="number" {...register('age', { valueAsNumber: true })} />\r
      {errors.age && <span>{errors.age.message}</span>}\r
\r
      <button type="submit">Submit</button>\r
    </form>\r
  );\r
}\r
\`\`\`\r
\r
---\r
\r
## 11. Context API\r
\r
### 11.1 Creating and Using Context\r
\r
Context solves exactly one problem: passing a value to a deeply nested component **without threading it through every component in between**. That is prop drilling, and it is tedious rather than fatal — which is worth saying plainly, because Context is routinely reached for as a state manager and it is not one. It is a transport mechanism. The state still lives in a \`useState\` or a \`useReducer\` somewhere; Context only decides who can see it.\r
\r
The shape below is four parts, and two of them are conventions rather than API requirements:\r
\r
\`\`\`tsx\r
// 1. Create context\r
interface ThemeContextType {\r
  theme: 'light' | 'dark';\r
  toggleTheme: () => void;\r
}\r
\r
const ThemeContext = createContext<ThemeContextType | null>(null);\r
\r
// 2. Provider component\r
function ThemeProvider({ children }: { children: React.ReactNode }) {\r
  const [theme, setTheme] = useState<'light' | 'dark'>('light');\r
\r
  const toggleTheme = () => {\r
    setTheme(prev => prev === 'light' ? 'dark' : 'light');\r
  };\r
\r
  return (\r
    <ThemeContext.Provider value={{ theme, toggleTheme }}>\r
      {children}\r
    </ThemeContext.Provider>\r
  );\r
}\r
\r
// 3. Custom hook for consuming\r
function useTheme() {\r
  const context = useContext(ThemeContext);\r
  if (!context) throw new Error('useTheme must be used within ThemeProvider');\r
  return context;\r
}\r
\r
// 4. Usage\r
function Header() {\r
  const { theme, toggleTheme } = useTheme();\r
  return (\r
    <header className={theme}>\r
      <button onClick={toggleTheme}>Toggle Theme</button>\r
    </header>\r
  );\r
}\r
\r
// 5. Wrap app\r
function App() {\r
  return <Header />;   // stand-in for the rest of your app\r
}\r
\r
render(\r
  <ThemeProvider>\r
    <App />\r
  </ThemeProvider>\r
);\r
\`\`\`\r
\r
**Why the context type is \`T | null\` and the hook throws.** \`createContext\` needs a default value, and there is rarely an honest one — a theme provider has no sensible "no provider" theme. Passing \`null\` and typing the context as \`ThemeContextType | null\` makes that explicit, and then the \`useTheme\` hook does two jobs: it converts "you forgot the Provider" from a \`Cannot read properties of null\` several frames away into a named error at the point of use, and it narrows the type so **no consumer has to handle \`null\`**. Without the hook, every component reading the context carries a null check that can never fire in practice.\r
\r
**Always export the hook, never the context.** If \`ThemeContext\` itself is exported, a consumer can call \`useContext(ThemeContext)\` directly and skip the guard — so the one place you centralised the error handling gets bypassed. Exporting only \`ThemeProvider\` and \`useTheme\` makes the safe path the only path.\r
\r
**The performance pitfall is the object literal**, \`value={{ theme, toggleTheme }}\`. It is a brand-new object on every provider render, so every consumer re-renders whether or not anything they use actually changed. It is the single most common Context bug — see §6.2's \`useContext\` entry for the fix (memoise the value, or split state and setters into separate contexts), and §13.7 for the worked example.\r
\r
---\r
\r
### 11.2 When to Use Context vs State Management\r
\r
Context is a way to *deliver* a value, not a state manager: it has no partial subscription, so every consumer re-renders whenever the value changes. That makes it right for data that many components read and that rarely changes, and wrong for anything that updates often.\r
\r
| Use Case | Solution | Why |\r
|----------|---------|-----|\r
| Theme, locale, auth user | Context | Read everywhere, changes rarely, so the re-render-every-consumer cost is seldom paid |\r
| Simple prop drilling (2-3 levels) | Just pass props | Explicit and free; Context would hide the data flow for no gain |\r
| Complex server state (API data) | TanStack Query / SWR | Caching, deduplication, refetching and retries are the whole job ([§11.3](#113-server-state-vs-client-state-the-most-important-distinction)) |\r
| Complex client state (many updates) | Zustand / Jotai (Redux for legacy) | A component subscribes to the slice it reads, so a frequent update does not re-render every consumer |\r
| Form state | React Hook Form | Keeps field values out of React state by default, so typing does not re-render the whole form |\r
\r
### 11.3 Server State vs Client State — The Most Important Distinction\r
\r
The single most useful framing for state management in 2026: **server state and client state are fundamentally different problems and should not share a tool.** Most "Redux is bloat" complaints trace back to teams using one global store for both. Once you split the two, the tool choices become obvious.\r
\r
\`\`\`\r
| Property              | Client state                | Server state                       |\r
|-----------------------|------------------------------|------------------------------------|\r
| Source of truth       | The browser                  | The server (database, API)         |\r
| Lifetime              | This tab, this session       | Forever, across users              |\r
| Sync model            | Set it, it's set             | Cache locally, refresh from server |\r
| Concerns              | Reducers, atoms, derivation  | Caching, dedup, refetch, retry,    |\r
|                       |                              |   stale-while-revalidate, focus    |\r
| Examples              | Selected tab, modal open,    | User profile, product list,        |\r
|                       |   form input, theme          |   feed, comments, search results   |\r
| Right tool            | Zustand / Jotai / Context    | TanStack Query / SWR / RTK Query   |\r
\`\`\`\r
\r
The split has three concrete consequences:\r
\r
1. **Don't put server data in Redux/Zustand.** Caching, deduplication, refetch-on-window-focus, optimistic updates, retry-with-backoff, request cancellation — these are *the entire job* of TanStack Query. Re-implementing them on top of Redux is hundreds of lines of buggy boilerplate.\r
\r
2. **Client state libraries can be tiny.** Once API data lives in TanStack Query, the remaining "client state" is small — a few booleans, a selected ID, the open modal. Zustand handles this in ~3 KB with no provider tree, no actions, no reducers, no selectors. Atomic libraries (Jotai, Recoil) take the same approach with even smaller scope per atom.\r
\r
3. **Redux is no longer the default.** Reach for Redux Toolkit only when you have a genuinely large, complex, time-traveled, devtools-required client state — or you're maintaining a legacy codebase. For most new projects in 2026, the stack is **TanStack Query + Zustand** (or Jotai), not Redux.\r
\r
The interview signal: when asked "what state management would you use," the answer that lands is *"server state goes in TanStack Query, client state in Zustand or Context. Redux only if there's a specific reason."* Whoever blanket-recommends Redux for a greenfield React project in 2026 is signaling they haven't kept up.\r
\r
---\r
\r
## 12. Refs\r
\r
Refs provide a way to access DOM nodes or persist mutable values across renders without causing re-renders. They're useful for managing focus, measuring elements, and storing timers.\r
\r
\`\`\`tsx\r
// 1. DOM reference\r
function InputFocus() {\r
  const inputRef = useRef<HTMLInputElement>(null);\r
\r
  useEffect(() => {\r
    inputRef.current?.focus();\r
  }, []);\r
\r
  return <input ref={inputRef} />;\r
}\r
\r
// 2. Mutable value that doesn't trigger re-render\r
function Timer() {\r
  const intervalRef = useRef<NodeJS.Timeout | null>(null);\r
\r
  const start = () => {\r
    intervalRef.current = setInterval(() => console.log('tick'), 1000);\r
  };\r
\r
  const stop = () => {\r
    if (intervalRef.current) clearInterval(intervalRef.current);\r
  };\r
\r
  return (\r
    <>\r
      <button onClick={start}>Start</button>\r
      <button onClick={stop}>Stop</button>\r
    </>\r
  );\r
}\r
\r
// 3. Callback ref (for dynamic elements)\r
function MeasureElement() {\r
  const measureRef = useCallback((node: HTMLDivElement | null) => {\r
    if (node) {\r
      console.log('Height:', node.getBoundingClientRect().height);\r
    }\r
  }, []);\r
\r
  return <div ref={measureRef}>Content</div>;\r
}\r
\r
// 4. Forward ref (expose child's ref to parent)\r
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {\r
  return <input ref={ref} {...props} />;\r
});\r
\r
function Parent() {\r
  const inputRef = useRef<HTMLInputElement>(null);\r
  return <Input ref={inputRef} />;\r
}\r
\`\`\`\r
\r
**When to use which:** a ref object (pattern 1) is the default. A **callback ref** (pattern 3) is a function React calls with the DOM node when it is attached (and with \`null\` when it is removed, unless in React 19 it returns a cleanup function instead); use it when you need to *do* something the moment the node appears, such as measuring it, especially for elements that mount later or conditionally. Pattern 4 is the pre-React-19 way to let a parent reach a child's DOM node; in React 19 \`ref\` is an ordinary prop, so \`forwardRef\` is no longer needed (§16.9).\r
\r
---\r
\r
## 13. Performance Optimization\r
\r
### 13.1 React.memo\r
\r
\`React.memo\` is a higher-order component that memoizes the rendered output. It skips re-rendering when props haven't changed (shallow comparison by default).\r
\r
\`\`\`tsx\r
type Props = { name: string; age: number };\r
\r
// Memoize a component — it re-renders only when its props change\r
// (shallow comparison by default).\r
const UserCard = React.memo(function UserCard({ name, age }: Props) {\r
  return <div>{name}, {age}</div>;\r
});\r
\r
// Custom comparison — return true to SKIP the re-render. Here the component\r
// deliberately ignores \`age\` changes.\r
const UserCardNameOnly = React.memo(\r
  function UserCardNameOnly(props: Props) {\r
    console.log('UserCardNameOnly rendered');\r
    return <div>{props.name}</div>;\r
  },\r
  (prev, next) => prev.name === next.name,\r
);\r
\r
// Demo: click the button and watch the console. \`age\` changes every click, so\r
// UserCard re-renders each time, but the comparator ignores \`age\`, so\r
// "UserCardNameOnly rendered" is logged only once, on mount.\r
function Demo() {\r
  const [age, setAge] = useState(30);\r
  return (\r
    <>\r
      <button onClick={() => setAge(a => a + 1)}>Birthday</button>\r
      <UserCard name="Ana" age={age} />\r
      <UserCardNameOnly name="Ana" age={age} />\r
    </>\r
  );\r
}\r
\r
render(<Demo />);\r
\`\`\`\r
\r
### 13.2 useMemo and useCallback\r
\r
\`useMemo\` memoizes expensive computed values, while \`useCallback\` memoizes function references. Both prevent unnecessary recalculations or child re-renders.\r
\r
\`\`\`tsx\r
// useMemo — memoize expensive computation\r
const sortedUsers = useMemo(() => {\r
  return users.sort((a, b) => a.name.localeCompare(b.name));\r
}, [users]);\r
\r
// useCallback — memoize function reference (prevent child re-renders)\r
const handleDelete = useCallback((id: string) => {\r
  setItems(prev => prev.filter(item => item.id !== id));\r
}, []);\r
\`\`\`\r
\r
**The identity that interviewers love to test:**\r
\r
\`\`\`ts\r
useCallback(fn, deps)  ===  useMemo(() => fn, deps)\r
\`\`\`\r
\r
Note one bug in the \`useMemo\` example above: \`users.sort(...)\` sorts the array **in place**, so it mutates the \`users\` prop the parent owns. Write \`users.toSorted(...)\` or \`[...users].sort(...)\` (see §5.2 Rule 2).\r
\r
\`useCallback\` is literally syntactic sugar over \`useMemo\` for the function-reference case — same dependency-array semantics, same memoization mechanism, same bailout behavior. Knowing the equivalence proves you understand both hooks rather than just memorizing two recipes.\r
\r
**When NOT to reach for either** (a senior signal — most devs over-apply these):\r
\r
- **The component renders are already cheap.** Memoization has its own cost (storing the previous value, running the dep comparison, allocating the closure). For a leaf component that renders in <1ms, the memo is a wash or net-negative.\r
- **The dependencies are unstable.** If \`useMemo(() => x, [items])\` is called with a new \`items\` array reference every render, the memo never hits its cache and you've added overhead for nothing.\r
- **No memoized child consumes the result.** \`useCallback(handler, [])\` is wasted unless \`handler\` is passed to a \`React.memo\`-wrapped child or a hook with stable-reference requirements (\`useEffect\` deps).\r
- **The React Compiler is enabled *and the component actually compiles*.** Where it applies, manual \`useMemo\` / \`useCallback\` becomes redundant — but it only compiles a component when it can prove purity and immutability, and when it cannot it **bails out and silently leaves that component unoptimised** (§16.1). So "the compiler handles it" is true per-component, not globally: check the \`eslint-plugin-react-hooks\` v6 output for bail-outs before assuming it. Don't strip existing memoization out preemptively, and don't add new ones without profiling.\r
\r
**Rule of thumb:** profile first. If the DevTools Profiler shows a child component re-rendering with referentially-equal props, then memoization helps. If not, the memo is dead weight that costs more than it saves.\r
\r
### 13.3 Code Splitting (Lazy Loading)\r
\r
Code splitting means shipping your app as several JavaScript files instead of one, so the first page load downloads only what the first screen needs. \`React.lazy\` takes a function that calls a dynamic \`import()\`; the bundler turns each dynamic import into a separate file (a "chunk"), and React downloads it the first time the component renders. While it downloads, the component *suspends* and the nearest \`<Suspense>\` shows its \`fallback\`. §13.11 covers the strategies and the traps.\r
\r
\`\`\`tsx\r
import { lazy, Suspense } from 'react';\r
import { Routes, Route } from 'react-router-dom';\r
\r
// Lazy load component\r
const Dashboard = lazy(() => import('./pages/Dashboard'));\r
const Settings = lazy(() => import('./pages/Settings'));\r
\r
function App() {\r
  return (\r
    <Suspense fallback={<Spinner />}>\r
      <Routes>\r
        <Route path="/dashboard" element={<Dashboard />} />\r
        <Route path="/settings" element={<Settings />} />\r
      </Routes>\r
    </Suspense>\r
  );\r
}\r
\`\`\`\r
\r
### 13.4 Virtualization (Large Lists)\r
\r
For rendering thousands of items, virtualization renders only the visible items in the viewport. This prevents DOM bloat and keeps scrolling smooth.\r
\r
**The math.** A virtualizer maintains three numbers — the total list height (sum of every item's height), the current scroll offset, and the visible window height. From those it computes a \`[startIndex, endIndex]\` range — the items that intersect the viewport — plus an "overscan" buffer (typically 3–5 items) above and below to mask scroll latency. Only items in that range get React elements; everything else is a phantom that contributes its height to the scroll surface but renders nothing.\r
\r
The DOM trick is two layers: an outer scroll container with the **full virtual height** (so the scrollbar is correctly sized — \`5000 items × 50px = 250000px\`), and inner items absolutely positioned at \`top = item.start\`. Scrolling is just CSS — no React work. As the user scrolls, the virtualizer recomputes the visible range and React re-renders only the small set of visible items.\r
\r
**Fixed-height vs dynamic-height.**\r
\r
- **Fixed-height** (\`react-window\`'s \`FixedSizeList\`, \`@tanstack/react-virtual\` with \`estimateSize: () => 50\`) — easiest case. \`start = index × itemHeight\`, \`endIndex = (scrollTop + viewportHeight) / itemHeight\`. O(1) range computation; perfect scrollbar accuracy.\r
- **Dynamic-height** (\`VariableSizeList\`, the default behavior of \`@tanstack/react-virtual\` with measured items) — you give an *estimate*, the virtualizer measures real heights as items render, and corrects the offsets. Two complications: (1) the scroll surface height is a sum based on estimates until items have been measured, so the scrollbar can subtly grow as the user scrolls past unmeasured items; (2) jumping to \`index = 9000\` with no measurements is a guess. Tools cache measurements between renders to keep things stable.\r
\r
**Library landscape.**\r
\r
\`\`\`\r
| Library                    | Size    | API style    | Strengths                              |\r
|----------------------------|---------|--------------|----------------------------------------|\r
| react-window               | ~5 KB   | Component    | Smallest, predictable, fixed/variable  |\r
| @tanstack/react-virtual    | ~5 KB   | Hook (headless)| Most flexible; works in any container|\r
| react-virtualized          | ~34 KB  | Component    | Most features (CellMeasurer, AutoSizer)|\r
| react-virtuoso             | ~30 KB  | Component    | Best dynamic-height + grouped lists    |\r
\`\`\`\r
\r
**Gotchas:**\r
\r
- **\`overscan\` matters.** Too small → flicker as you scroll fast. Too large → wasted DOM. Start at 5; tune by feel.\r
- **\`key\` must be stable.** If you key by index, scroll-into-view + delete causes content to "stick" to the wrong row.\r
- **Search/jump-to-item** needs the virtualizer's \`scrollToIndex(i)\` API; setting \`scrollTop\` directly skips the measurement cache.\r
- **Infinite scroll** combines virtualization with a fetch-trigger near the end of the rendered window — \`react-window-infinite-loader\` or \`@tanstack/react-virtual\` + an \`IntersectionObserver\` on a sentinel.\r
- **CSS \`content-visibility: auto\`** is the platform-native alternative — the browser skips layout/paint for offscreen elements you've hinted are out of view. Lighter than DOM virtualization for some cases, but doesn't reduce React's render cost (it still renders all elements).\r
\r
\`\`\`tsx\r
import { useVirtualizer } from '@tanstack/react-virtual';\r
\r
function VirtualList({ items }: { items: Item[] }) {\r
  const parentRef = useRef<HTMLDivElement>(null);\r
\r
  const virtualizer = useVirtualizer({\r
    count: items.length,\r
    getScrollElement: () => parentRef.current,\r
    estimateSize: () => 50,\r
  });\r
\r
  return (\r
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>\r
      <div style={{ height: virtualizer.getTotalSize() }}>\r
        {virtualizer.getVirtualItems().map(virtualItem => (\r
          <div\r
            key={virtualItem.key}\r
            style={{\r
              position: 'absolute',\r
              top: virtualItem.start,\r
              height: virtualItem.size,\r
            }}\r
          >\r
            {items[virtualItem.index].name}\r
          </div>\r
        ))}\r
      </div>\r
    </div>\r
  );\r
}\r
\`\`\`\r
\r
**When not to virtualise.** Virtualisation removes rows from the DOM, and several things depended on them being there: the browser's find-in-page (Ctrl/Cmd+F) cannot find text in rows that are not rendered, screen readers cannot tell how many rows exist unless you add \`aria-rowcount\`/\`aria-setsize\`, rows of different heights need measuring (or the scrollbar jumps), and linking to an item by anchor needs code to scroll the virtualiser first. So virtualise when a list can realistically reach several hundred rows or the Profiler shows the list dominating an interaction; a 30-row list gains nothing and loses all of that.\r
\r
### 13.5 Concurrent Features (\`useTransition\`, \`useDeferredValue\`)\r
\r
React 18's concurrent renderer lets you mark some updates as **non-urgent** so the browser stays responsive while heavy work happens in the background. Without these, a slow filter on every keystroke blocks the input thread; with them, the input stays at 60 fps and the list catches up.\r
\r
**The mental model — why this matters.** Pre-React-18, every state update was synchronous and committed in the same render. Once React started rendering, it could not be interrupted; the browser's main thread was blocked until the entire tree was reconciled and committed. On a slow render that took 200ms, the keystroke that caused it could not paint until those 200ms were up — the input felt "stuck." React 18 introduced a **concurrent renderer** that can pause, abandon, and restart work, plus a **lane-based scheduler** that assigns each update a priority. There are roughly three priority tiers users care about:\r
\r
\`\`\`\r
| Priority         | Triggered by                                    | Example                  |\r
|------------------|-------------------------------------------------|--------------------------|\r
| Sync / discrete  | Direct user input — clicks, keystrokes, focus   | setState in onChange     |\r
| Default          | Network responses, timers, normal setState      | setState after fetch     |\r
| Transition       | Wrapped in startTransition, or useDeferredValue | Slow filter, route change|\r
\`\`\`\r
\r
Higher-priority lanes can preempt lower ones. If the user types again while React is mid-transition, React **discards the in-progress render** and starts over with the latest state — the partially-rendered output is thrown away. This is why concurrent features don't make the work itself faster; they make it *interruptible*, so the urgent work (input value, paint) is never starved.\r
\r
**What \`isPending\` is actually telling you.** It is \`true\` from the moment \`startTransition\` queues the work to the moment that work commits. It lives in the urgent lane (so updating it doesn't block the input), and it lets you show a spinner without re-introducing the lag — the spinner update itself is sync, but the heavy work it announces is not.\r
\r
**Lanes — the priority bitmap under the hood.** React 18+ replaced the older "expiration time" model with a **31-bit bitmap** where each bit is one priority level. Bitwise operations (\`AND\`/\`OR\`) make priority checks cheap — combining lanes, finding the highest-priority pending lane, and clearing a lane after commit are all single CPU instructions. The scheduler picks the highest-priority pending lane on each tick; lower-priority work can be paused, queued behind a higher-priority update, and resumed when the urgent work completes. A practical consequence: a click in the middle of a long transition immediately preempts that transition, and the transition restarts (not resumes) with the latest state — that's why concurrent rendering is described as *interruptible* rather than *resumable*.\r
\r
**Time slicing — the 5-millisecond yield.** React's renderer doesn't process the entire fiber tree in one synchronous burst. It does work for **~5ms**, then yields back to the browser by scheduling its continuation as a new task with \`MessageChannel.postMessage\`. That is a regular task (not a microtask — a microtask would run before the browser got a chance to paint), and React uses it instead of \`setTimeout(fn, 0)\` because nested \`setTimeout\` calls are clamped to a minimum delay of about 4 ms. The browser handles input, paints, runs other tasks, then runs React's continuation. This is what keeps the ~16 ms per-frame budget (60 frames per second) intact during a heavy render — even a 200ms render is invisible to the user because input events get to run between slices.\r
\r
**Double buffering — current and work-in-progress trees.** React maintains **two fiber trees**: the **current tree** (what's painted on screen) and a **work-in-progress tree** (what's being computed). Every fiber holds an \`alternate\` pointer to its counterpart in the other tree. When a render completes, React commits by *swapping* the pointers — an O(1) atomic operation. If a higher-priority update interrupts the work-in-progress tree, React can throw it away without affecting what's on screen. Without double buffering, mid-render interruption would corrupt the visible UI.\r
\r
**\`useOptimistic\` — concurrent UI updates without waiting for confirmation.** New in React 19. Lets you render an "expected" state while an async action is pending, with automatic rollback on failure:\r
\r
\`\`\`tsx\r
const [optimisticTodos, addOptimistic] = useOptimistic(\r
  todos,\r
  (state, newTodo) => [...state, { ...newTodo, pending: true }],\r
);\r
\r
async function handleAdd(text: string) {\r
  addOptimistic({ id: 'temp', text });   // UI updates immediately\r
  await server.create(text);              // commit happens; if it throws, React rolls back\r
}\r
\`\`\`\r
\r
This is what powers the "message appears instantly while sending" UX in modern chat apps without manual rollback bookkeeping.\r
\r
**Tearing — the bug concurrent rendering creates and \`useSyncExternalStore\` fixes.** Because a render can be paused mid-tree, two parts of the same tree can read different values from an external store (Zustand, Redux without React 18 bindings) — one read happens before a store update, the other after. Result: tree is inconsistent ("torn"). The fix is \`useSyncExternalStore\`, which subscribes to the external store with React-compatible semantics — React calls the snapshot function once per commit and consistency is guaranteed. Modern Zustand/Redux already wrap this; if you're writing a store from scratch, use it.\r
\r
\`\`\`tsx\r
import { useState, useTransition, useDeferredValue, useMemo } from 'react';\r
\r
type Product = { name: string };\r
const PRODUCTS: Product[] = Array.from({ length: 5000 }, (_, i) => ({ name: \`Product \${i}\` }));\r
\r
function ProductList({ items }: { items: Product[] }) {\r
  return <ul>{items.slice(0, 50).map(p => <li key={p.name}>{p.name}</li>)}</ul>;\r
}\r
\r
// Option A — useTransition: you own the slow state update.\r
function SearchWithTransition({ products }: { products: Product[] }) {\r
  const [query, setQuery] = useState('');           // urgent: what the input shows\r
  const [filterText, setFilterText] = useState(''); // non-urgent: what the list filters by\r
  const [isPending, startTransition] = useTransition();\r
\r
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {\r
    setQuery(e.target.value);                              // input stays snappy\r
    startTransition(() => setFilterText(e.target.value));  // next keystroke can interrupt this\r
  }\r
\r
  const filtered = useMemo(\r
    () => products.filter(p => p.name.includes(filterText)),\r
    [products, filterText],\r
  );\r
\r
  return (\r
    <>\r
      <input value={query} onChange={onChange} />\r
      {isPending && <span>Updating…</span>}\r
      <ProductList items={filtered} />\r
    </>\r
  );\r
}\r
\r
// Option B — useDeferredValue: defer the value instead of the setter.\r
function SearchWithDeferredValue({ products }: { products: Product[] }) {\r
  const [query, setQuery] = useState('');\r
  const deferredQuery = useDeferredValue(query);   // lags behind query while React is busy\r
  const filtered = useMemo(\r
    () => products.filter(p => p.name.includes(deferredQuery)),\r
    [products, deferredQuery],\r
  );\r
\r
  return (\r
    <>\r
      <input value={query} onChange={e => setQuery(e.target.value)} />\r
      {query !== deferredQuery && <span>Updating…</span>}\r
      <ProductList items={filtered} />\r
    </>\r
  );\r
}\r
\r
function Demo() {\r
  return (\r
    <>\r
      <SearchWithTransition products={PRODUCTS} />\r
      <SearchWithDeferredValue products={PRODUCTS} />\r
    </>\r
  );\r
}\r
\r
render(<Demo />);\r
\`\`\`\r
\r
\`useTransition\` wraps **state setters** that schedule slow updates, which is why Option A needs a second piece of state: one for the input (urgent) and one for the list (non-urgent). \`useDeferredValue\` wraps a **value** so a derived computation lags behind the latest input — useful when the slow consumer isn't yours to wrap. It has no \`isPending\`; comparing \`query !== deferredQuery\` gives you the same signal.\r
\r
### 13.6 Profiling and Measuring Performance\r
\r
You can't fix what you can't see. Use the right tool for the layer you're investigating:\r
\r
\`\`\`\r
| Layer                      | Tool                                    |\r
|----------------------------|-----------------------------------------|\r
| Component render cost      | React DevTools Profiler (Flamegraph)    |\r
| Why a component re-rendered| Profiler "Why did this render?" / why-did-you-render |\r
| Page load (LCP, INP, CLS)  | Lighthouse, Chrome DevTools Performance |\r
| Real-user metrics          | web-vitals lib + analytics, Sentry      |\r
| Long tasks blocking input  | DevTools Performance tab → Long Tasks   |\r
| Bundle size & duplicates   | Bundle analyzer (see 13.10)             |\r
\`\`\`\r
\r
The React DevTools Profiler records a session of renders and shows a flamegraph of how long each component took. Yellow/red components are the slow ones — start there. The "Ranked" view sorts by duration; the "Why did this render?" toggle (in DevTools settings) annotates each render with the prop/state/hook that changed.\r
\r
**A profiling session that finds the real problem:**\r
\r
1. **Record an interaction, not the page load.** Mounting and interacting are different costs with different fixes; the slowness users complain about is usually an interaction (typing, filtering, switching tabs).\r
2. **Rank by render time, not render count.** Forty renders of 1 ms each are not the problem; two renders of 80 ms are.\r
3. **Read *why* each slow component rendered.** A parent re-rendering, a prop whose value is equal but whose reference is new, and a context value changing each have a different fix (§13.7).\r
4. **Check the browser's Performance panel as well.** The Profiler shows React's work only; a long task (over 50 ms) that is layout, style or a third-party script will not appear in it.\r
5. **Change one thing, then record again.** A fix that is not re-measured is a guess, and memoization in particular can make things slower (Q64).\r
\r
**Render vs commit — what the profiler actually measures.** A React update has two phases. The **render phase** is pure: React calls your component functions, builds the new fiber tree, and runs reconciliation. The **commit phase** is when React actually mutates the DOM and runs effects (\`useLayoutEffect\` synchronously, \`useEffect\` after paint). The profiler shows you both — the flamegraph bars represent render-phase time per component, and the commit duration sits at the top. A common confusion: "my component is slow" usually means "the render phase is slow"; if your work is in \`useEffect\`, the profiler bar for that component will look fine because effects run *after* the recorded commit. For effect-heavy bottlenecks, switch to the Chrome Performance tab.\r
\r
**Actual vs base duration.** Each Profiler bar shows two numbers: *actual duration* (how long this render took) and *base duration* (how long it would take with no memoization). The gap between them is the value memoization is adding — if base ≈ actual, your memoization isn't doing anything (the component is re-rendering anyway), which usually means a reference-equality bug in props.\r
\r
**Core Web Vitals — what each metric actually represents.**\r
\r
- **LCP (Largest Contentful Paint)** — when the biggest above-the-fold element (typically the hero image, video, or a large heading) finishes painting. Good ≤ 2.5s, poor > 4s. LCP is dominated by network (TTFB, image size) and render-blocking resources (large CSS/JS).\r
- **INP (Interaction to Next Paint)** — replaced FID in March 2024. INP measures the **worst-case latency** between any user interaction (click, tap, key) and the next paint, not just the first one. Good ≤ 200ms, poor > 500ms. This is the React-specific killer: long renders, expensive event handlers, and hydration all spike INP. Lighthouse cannot measure INP reliably (it has no real interactions); you only see it via real-user monitoring.\r
- **CLS (Cumulative Layout Shift)** — sum of unexpected layout shifts during the page's lifetime. Good ≤ 0.1, poor > 0.25. Common causes: images without \`width\`/\`height\`, late-loading fonts that change line metrics, banners injected after first paint, and ads without reserved space.\r
\r
Google's ranking systems have used Core Web Vitals since the 2021 page experience update (then LCP, FID and CLS; INP took FID's place in March 2024), so they have business consequences beyond user feel. The \`web-vitals\` library measures them using the same algorithms Chrome itself ships, then hands you a callback you can wire to any analytics endpoint:\r
\r
\`\`\`tsx\r
// Report Core Web Vitals to your analytics endpoint\r
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';\r
\r
function send(metric: { name: string; value: number; id: string }) {\r
  navigator.sendBeacon('/analytics', JSON.stringify(metric));\r
}\r
\r
onCLS(send);   // Cumulative Layout Shift  (visual stability)\r
onINP(send);   // Interaction to Next Paint (responsiveness, replaced FID in 2024)\r
onLCP(send);   // Largest Contentful Paint (load speed)\r
onFCP(send);\r
onTTFB(send);\r
\`\`\`\r
\r
\`React.Profiler\` is the in-app equivalent — wrap a subtree to programmatically measure render durations, useful for synthetic perf tests:\r
\r
\`\`\`tsx\r
<Profiler id="ProductGrid" onRender={(id, phase, actual, base) => {\r
  console.log(id, phase, actual, base);\r
}}>\r
  <ProductGrid />\r
</Profiler>\r
\`\`\`\r
\r
### 13.7 Common Re-render Causes (and Fixes)\r
\r
Most "React is slow" complaints trace back to a small set of patterns. Profile first, but watch for these:\r
\r
**The underlying cause is almost always reference equality.** React decides whether a component needs to re-run by comparing the *references* of its props, state, and context value to the previous render's. Two object literals with identical contents are not equal under \`Object.is\`:\r
\r
\`\`\`js\r
console.log({ a: 1 } === { a: 1 });   // false — different references\r
\`\`\`\r
\r
So when you write \`<Child style={{ color: 'red' }} />\`, you create a brand-new object on every parent render, and any \`React.memo\` on \`Child\` will think the prop changed even though the value is identical. The same is true of arrays (\`[1, 2, 3]\`), inline functions (\`() => doSomething()\`), and the \`value={{...}}\` object you hand to a Context Provider. The fixes — \`useMemo\`, \`useCallback\`, hoisting constants outside the component, splitting context — all exist to give those references stability across renders.\r
\r
**By default, React does not memoize.** Every render of a parent re-renders all of its children, transitively. \`React.memo\` opts a single component into shallow-prop comparison; without it, the parent re-rendering is enough to re-render the child even when nothing meaningful changed. The React Compiler (React 19) flips this default by inserting memoization automatically, but in compiler-less codebases you have to be deliberate.\r
\r
**Why "the parent re-rendered" is so often the answer.** When the URL changes, when a top-level provider's value changes, or when global state in \`Context\` updates, every component below fires a render — even leaves that don't read the changed value. The structural fix is to move the state down (co-location) or split the provider so consumers only subscribe to the state they actually use.\r
\r
\`\`\`\r
| Cause                                          | Fix                                              |\r
|------------------------------------------------|--------------------------------------------------|\r
| Inline object/array prop: <X style={{...}} />  | Hoist constant, or useMemo it                    |\r
| Inline callback to memoized child              | useCallback (or move handler to leaf)            |\r
| Context value changes on every parent render   | useMemo the value object; split into 2 contexts  |\r
| Anonymous function inside .map() in deps       | Hoist or useCallback                             |\r
| setState with a new object, same contents      | Pass back the same object; a copy always renders |\r
| Parent re-renders entire subtree on URL change | Move route boundaries closer to the leaf         |\r
| Tall provider tree wrapping the whole app      | Co-locate providers; consider Zustand/Jotai     |\r
\`\`\`\r
\r
A note on the \`setState\` row: React's bail-out compares with \`Object.is\`, so it skips the render whenever you pass back the **same reference**, whether that is a primitive or an unchanged object. What does *not* bail out is a *new* object with identical contents (\`setUser({ ...user })\`), because that is a different reference.\r
\r
The classic Context fan-out trap — every consumer re-renders when *any* field of \`value\` changes:\r
\r
\`\`\`tsx\r
const AppContext = React.createContext<unknown>(null);\r
const AuthContext = React.createContext<unknown>(null);\r
const ThemeContext = React.createContext<unknown>(null);\r
\r
function Bad({ user, theme, setTheme, children }: {\r
  user: string; theme: string; setTheme: (t: string) => void; children: React.ReactNode;\r
}) {\r
  // A new object every render, so EVERY consumer re-renders even when\r
  // user and theme are unchanged.\r
  return <AppContext.Provider value={{ user, theme, setTheme }}>{children}</AppContext.Provider>;\r
}\r
\r
function Good({ user, theme, setTheme, children }: {\r
  user: string; theme: string; setTheme: (t: string) => void; children: React.ReactNode;\r
}) {\r
  // Memoize, and split unrelated state into separate contexts so a theme\r
  // change does not wake up components that only read the user.\r
  const auth = useMemo(() => ({ user }), [user]);\r
  const themeCtx = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);\r
  return (\r
    <AuthContext.Provider value={auth}>\r
      <ThemeContext.Provider value={themeCtx}>{children}</ThemeContext.Provider>\r
    </AuthContext.Provider>\r
  );\r
}\r
\r
// Demo so the example runs on its own\r
function Demo() {\r
  const [theme, setTheme] = useState('light');\r
  return (\r
    <Good user="Ada" theme={theme} setTheme={setTheme}>\r
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Theme: {theme}</button>\r
    </Good>\r
  );\r
}\r
render(<Demo />);\r
\`\`\`\r
\r
### 13.8 Image and Asset Optimization\r
\r
Images are usually the biggest payload on a React page and the dominant LCP element. Quick wins:\r
\r
**Why images dominate LCP.** On a typical page, images are the largest share of the bytes: tens of KB of HTML and a few hundred KB of JS, against roughly 1 MB of images. The hero image is almost always the Largest Contentful Paint element by area, which means **its download time is your LCP**. Until that image is decoded and painted, Google's measurement is still "loading." Three forces shape image performance — file size (which format and resolution), download priority (browser fetch ordering), and decode/layout cost (how much work the main thread does to paint it). Each attribute below addresses one of those forces.\r
\r
**What each attribute actually does:**\r
\r
- **\`width\` / \`height\`** — reserves layout space *before* the image loads, preventing CLS. The browser computes the aspect ratio from these and inserts a placeholder box of the right size. Without them, content below the image jumps when it loads.\r
- **\`loading="lazy"\`** — defers the network request until the image is near the viewport (Chrome starts the fetch about 1250px before the image scrolls into view on a fast connection, and 2500px ahead on 3G or slower). Cheap to apply to every offscreen image; do **not** apply it to the LCP image, since that delays your most important asset.\r
- **\`decoding="async"\`** — tells the browser the image can be decoded off the main thread. Decoding a large JPEG can stall input for tens of milliseconds; \`async\` removes that from the critical path.\r
- **\`fetchpriority="high" / "low"\`** — overrides the browser's heuristic for the request priority. Mark the LCP image \`high\` (browsers default \`<img>\` to medium); mark below-the-fold and decorative images \`low\`.\r
- **\`srcSet\` / \`sizes\`** — gives the browser multiple resolutions and a hint about how wide the image will display. The browser picks the smallest file that's still sharp at the user's DPR. A single 1920×1080 hero is wasted bytes for a 400px-wide phone.\r
- **\`<link rel="preload" as="image">\`** — fires the request as soon as the HTML parses, in parallel with CSS/JS. Pair with \`fetchpriority="high"\` for the LCP image; without preload, the request only starts after the browser parses far enough to discover the \`<img>\` tag in JS-rendered React output.\r
\r
\`\`\`tsx\r
// An OFFSCREEN image: native lazy-loading + explicit dimensions to prevent CLS.\r
// (Not the hero: the LCP image must never be lazy — see the preload below.)\r
const belowTheFold = (\r
  <img\r
    src="/team-photo.webp"\r
    width={1200}\r
    height={630}\r
    loading="lazy"          // defer offscreen images\r
    decoding="async"        // don't block the main thread on decode\r
    alt="Our team"\r
  />\r
);\r
\r
// Responsive images — the browser picks the smallest file that fits\r
const responsive = (\r
  <img\r
    srcSet="/hero-480.webp 480w, /hero-960.webp 960w, /hero-1920.webp 1920w"\r
    sizes="(max-width: 600px) 480px, 960px"\r
    src="/hero-960.webp"\r
    alt="Hero"\r
  />\r
);\r
\r
// Preload the LCP image so it starts downloading with the HTML.\r
// NOTE: never \`loading="lazy"\` on the LCP image — the two work against\r
// each other.\r
const preload = <link rel="preload" as="image" href="/hero.webp" fetchPriority="high" />;\r
\`\`\`\r
\r
Other low-effort wins: serve WebP/AVIF instead of JPEG, set \`fetchpriority="high"\` on the LCP image and \`low\` on offscreen ones, and self-host fonts with \`font-display: swap\` (or use \`next/font\` / \`@fontsource\`).\r
\r
### 13.9 Build Tools — Webpack vs Vite\r
\r
Modern React apps almost always use one of these. Pick based on dev-experience needs and ecosystem fit, not folklore.\r
\r
\`\`\`\r
| Aspect             | Webpack                              | Vite                                   |\r
|--------------------|--------------------------------------|----------------------------------------|\r
| Dev server         | Bundles before serving               | Native ESM — serves source on demand   |\r
| Cold start         | Seconds-to-minutes on big apps       | Sub-second                             |\r
| HMR                | Full module graph rebuild            | Per-module, near-instant               |\r
| Production build   | Webpack itself                       | Rollup up to v7; Rolldown from v8      |\r
| Config             | Verbose, plugin-heavy                | Minimal; sensible defaults             |\r
| Loader/plugin eco  | Largest in JS tooling                | Growing; compatible with Rollup plugins|\r
| Best for           | Legacy apps, heavy custom transforms | New apps, fast feedback loops          |\r
\`\`\`\r
\r
**Why Vite's dev server is so much faster.** Webpack's classic model is *bundle then serve*: every time you start the dev server, Webpack walks the entire dependency graph from the entry point, transforms every file (Babel, TypeScript, CSS-in-JS, etc.), and concatenates the result into one or more bundles before the browser sees anything. On a 5,000-module app, that's 30–90 seconds of cold-start. Hot Module Replacement still has to invalidate part of the graph and rebuild. Vite inverts this — it serves your source files **as native ES modules** over HTTP, with the browser doing the import resolution. The first request for \`App.tsx\` triggers a single-file transform (esbuild, written in Go, ~10–100x faster than Babel); the next file the browser asks for is transformed lazily on demand. Cold start is sub-second regardless of project size because Vite never builds the graph upfront.\r
\r
There's a catch: ESM in the browser doesn't work for \`node_modules\`. Vite **pre-bundles** dependencies once with esbuild on first start (cached after that), converting CommonJS packages into a single ESM file per dependency to keep the import waterfall shallow.\r
\r
For production, Vite uses **Rollup** instead of esbuild, even though esbuild is faster. The trade-off is intentional: Rollup produces smaller, more aggressively tree-shaken output and has a richer plugin ecosystem for production concerns (legacy browser support, advanced code splitting, asset hashing). Build speed matters less in CI than runtime performance for users.\r
\r
**This split describes Vite up to version 7.** Vite 8 replaced both esbuild and Rollup with **Rolldown**, one Rust-based bundler used in development and production, so dev and production no longer run through different tools. The reasoning above is still why the split existed, and what you will see in most existing projects. The [Frontend Tooling guide](/frontend/tooling) covers the 2026 toolchain.\r
\r
Webpack 5 closed part of the gap with **persistent caching** (the file system cache means the second build is much faster than the first) and **Module Federation** (the canonical answer for micro-frontends). But per-module HMR and the bundle-free dev server are still Vite's structural edge.\r
\r
A minimal Vite config for a React app (this project's setup):\r
\r
\`\`\`js\r
// vite.config.js\r
import { defineConfig } from 'vite';\r
import react from '@vitejs/plugin-react';\r
\r
export default defineConfig({\r
  plugins: [react()],\r
  build: {\r
    rollupOptions: {\r
      output: {\r
        manualChunks: {\r
          // Split heavy vendor libs into their own chunks for better caching\r
          react: ['react', 'react-dom', 'react-router-dom'],\r
          mermaid: ['mermaid'],\r
        },\r
      },\r
    },\r
  },\r
});\r
\`\`\`\r
\r
### 13.10 Bundle Analyzers\r
\r
When the production bundle is bigger than expected, an analyzer tells you *which module* is responsible. Three common choices:\r
\r
**What an analyzer is actually visualizing.** A modern bundler emits a **stats file** describing every module that ended up in every chunk: the module's source path, its parsed size (after minification), and its gzipped/brotli size (what actually goes over the wire). An analyzer reads that stats file and renders it as a treemap — each rectangle is one module, sized by bytes, nested inside its parent directory or chunk. Visualizing it is critical because intuition is wrong: a 50-line file that imports \`moment\` is bigger than 500 lines of your own code, and the treemap makes that difference impossible to miss.\r
\r
**Three sizes you'll see, and which to care about.**\r
\r
- **Stat size** — raw bytes of the source file before any optimization. Misleading; ignore it for shipping decisions.\r
- **Parsed size** — bytes after minification, before compression. This is what the browser parses and executes; affects parse/compile time on low-end devices.\r
- **Gzipped / Brotli size** — bytes on the network. This is what affects download time on slow connections. **This is the number you optimize for.** Brotli is ~15–25% smaller than gzip and supported everywhere.\r
\r
**\`source-map-explorer\` vs the native analyzers.** The native analyzers (\`webpack-bundle-analyzer\`, \`rollup-plugin-visualizer\`) plug into the build and have the full module graph. \`source-map-explorer\` works retroactively — it reads the shipped JS plus its source maps and reverse-engineers what each byte came from. Use the native ones during development; use \`source-map-explorer\` to audit a bundle you didn't build (e.g., a coworker's deploy, or a third-party site you're benchmarking against).\r
\r
\`\`\`bash\r
# Vite / Rollup — interactive treemap\r
npm i -D rollup-plugin-visualizer\r
# add to vite.config.js plugins; opens stats.html after build\r
\r
# Webpack — same idea, Webpack-native\r
npm i -D webpack-bundle-analyzer\r
\r
# Any source-map-emitting bundler — analyzes the shipped JS, not the build graph\r
npm i -D source-map-explorer\r
npx source-map-explorer 'dist/assets/*.js'\r
\`\`\`\r
\r
\`\`\`js\r
// vite.config.js\r
import { visualizer } from 'rollup-plugin-visualizer';\r
\r
export default defineConfig({\r
  plugins: [\r
    react(),\r
    visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true }),\r
  ],\r
});\r
\`\`\`\r
\r
What to look for in the treemap:\r
\r
\`\`\`\r
1. Duplicate copies of the same library (multiple lodash versions, two react copies)\r
2. Whole libraries imported for one function (lodash → lodash-es with named imports)\r
3. Moment.js — replace with date-fns or dayjs (10x smaller)\r
4. Entire icon packs — import only the icons you use\r
5. Polyfills shipped to modern browsers — check your browserslist\r
6. Source maps accidentally shipped to production\r
7. Markdown/MDX content bundled into JS instead of fetched\r
\`\`\`\r
\r
### 13.11 Tree Shaking and Code Splitting at Build Time\r
\r
#### Tree Shaking — the theory\r
\r
**Tree shaking** is the bundler's ability to statically analyze your imports and **drop unused exports** from the final bundle. The name comes from physically shaking a tree — leaves you don't reach drop off, leaves you do reach stay. You import \`{ debounce }\` from a 70 KB library, and only the bytes that \`debounce\` transitively depends on end up shipped.\r
\r
**Why ES modules are required.** Tree shaking is only possible because ES modules are **statically analyzable**. The shape of your imports and exports must be determinable at build time, without running the code. Compare:\r
\r
\`\`\`js\r
// ESM — the import binding is fixed at parse time, so the bundler knows\r
//   exactly which exports of './lib' are reachable.\r
import { debounce } from './lib';\r
\r
// CommonJS — module.exports is a regular object that runtime code can read,\r
//   mutate or destructure dynamically. The bundler cannot prove any given\r
//   export is unused without running the code.\r
const { debounce: cjsDebounce } = require('./lib');\r
\`\`\`\r
\r
CommonJS is fundamentally a runtime construct (\`require\` is a function call that returns an object), while ESM is a syntactic construct (\`import\` is a declaration the parser sees before any code runs). That difference is why \`lodash\` (CommonJS) doesn't tree-shake but \`lodash-es\` (ESM) does.\r
\r
**The \`sideEffects\` field — a contract with the bundler.** A "side effect" in this context means: importing a module causes something to happen *besides* binding its exports — a polyfill registers itself on \`window\`, a CSS file is injected, a singleton is initialized. If a module has side effects, the bundler **cannot drop it** even when none of its exports are used, because removing the import would change observable program behavior.\r
\r
By default, bundlers assume every module has side effects (the safe assumption). To enable aggressive tree shaking, library authors declare otherwise in \`package.json\`:\r
\r
\`\`\`json\r
// "sideEffects: false" — every file in this package is pure.\r
//   Bundler is free to drop any unreachable export.\r
{ "sideEffects": false }\r
\r
// Whitelist the specific files that DO have side effects.\r
//   Everything else is treated as pure.\r
{ "sideEffects": ["*.css", "./src/polyfills.ts"] }\r
\`\`\`\r
\r
This applies to **your application** too, not just published libraries. If your app's \`package.json\` is missing this field, the bundler may keep modules around that you'd think it could drop.\r
\r
**What concretely breaks tree shaking** (ranked by frequency in real codebases):\r
\r
\`\`\`\r
1. Default-importing a whole namespace:  import _ from 'lodash'\r
   - You used the whole \`_\` object; nothing to shake.\r
2. Importing from a CommonJS-only build of a library\r
   - lodash, moment, many older react libraries.\r
   - Fix: lodash → lodash-es; moment → date-fns/dayjs, or no library at all:\r
     Intl.DateTimeFormat and Intl.RelativeTimeFormat are built into the browser\r
     and cover most date formatting.\r
3. Missing \`sideEffects: false\` in package.json\r
   - Bundler conservatively keeps everything.\r
4. Babel transpiling ESM down to CommonJS BEFORE the bundler sees it\r
   - Old Babel preset-env without \`modules: false\`.\r
   - Fix: \`["@babel/preset-env", { "modules": false }]\`\r
5. Re-exports through barrel files (index.ts) that pull side-effects\r
   - Cleaner DX, but every consumer drags the whole barrel's import graph.\r
6. Dynamic property access:  import * as Icons; Icons[name]\r
   - The bundler can't prove which names are reachable.\r
7. Accessing exports through a default-exported object:\r
     export default { a, b, c }   →   import M from './m'; M.a\r
   - Looks named, behaves like a namespace; bundler keeps b and c.\r
\`\`\`\r
\r
**How to verify it's working.** Run a bundle analyzer (13.10) before and after the import-style change, or simulate it with a probe export:\r
\r
\`\`\`js\r
// In your library (or a test module), add a uniquely-named export\r
//   that you never actually import:\r
export const __SHOULD_BE_TREE_SHAKEN__ = '🪓';\r
\`\`\`\r
\r
Build production, search the output for that string. If it's gone, tree shaking works. If it's there, something in the toolchain is preserving it.\r
\r
#### Code Splitting — the theory\r
\r
**Code splitting** is the build-time inverse of tree shaking. Tree shaking removes code that's *never* reached; code splitting separates code that *is* reached but doesn't all need to load up-front. The bundler emits multiple **chunks** (separate \`.js\` files), and the browser fetches each one only when the running app needs it.\r
\r
**Why this matters for performance.** A single 2 MB bundle blocks the main thread on parse and compile (not just download) before any of your code runs. Splitting that into a 200 KB initial chunk plus 1.8 MB of on-demand chunks turns the worst-case experience into the best-case experience for most users — they may never request the chunks they don't need.\r
\r
**The three strategies, why each one exists:**\r
\r
1. **Route-based splitting** — the highest-leverage split. Most users only visit a fraction of your routes per session, so each route's code is a natural boundary. Wrap each top-level route component in \`React.lazy\` and the bundler emits one chunk per route automatically.\r
\r
2. **Component-based splitting** — for heavy widgets that only load on user intent. A rich text editor (~500 KB), a map (~300 KB), or a chart library (~200 KB) doesn't need to be in the initial bundle if the user has to click "Edit" or "Show on map" first. Same \`React.lazy\` mechanism, scoped to a single component instead of a route.\r
\r
3. **Vendor chunk splitting** — separates long-lived dependencies (React, React Router, etc.) from your application code. Vendor code changes rarely; your app code changes every deploy. Putting them in separate chunks means a deploy invalidates only the app chunk in users' caches — vendor stays cached. See \`manualChunks\` in 13.9.\r
\r
\`\`\`tsx\r
// 1. Route-based splitting — every route is its own chunk\r
const Dashboard = lazy(() => import('./pages/Dashboard'));\r
const Settings  = lazy(() => import('./pages/Settings'));\r
\r
// 2. Component-based splitting — heavy widgets only load when needed\r
const Chart = lazy(() => import('./Chart'));   // ~200KB d3 dependency\r
function Report() {\r
  const [show, setShow] = useState(false);\r
  return show ? <Suspense fallback={<Spinner/>}><Chart /></Suspense>\r
              : <button onClick={() => setShow(true)}>Show chart</button>;\r
}\r
\r
// 3. Vendor chunk — long-lived libs cached separately from app code\r
//    See manualChunks in 13.9\r
\`\`\`\r
\r
**The waterfall trap.** Naively nested \`React.lazy\` boundaries serialize the network — child chunks can't begin downloading until the parent chunk is parsed:\r
\r
\`\`\`\r
1. Browser requests A.js                    [200ms]\r
2. Browser parses A, discovers it imports B\r
3. Browser requests B.js                    [200ms]\r
4. Browser parses B, discovers it imports C\r
5. Browser requests C.js                    [200ms]\r
                                  total:  ~600ms\r
\`\`\`\r
\r
Compare to parallel loading where A, B, and C all start at t=0:\r
\r
\`\`\`\r
   total: ~200ms (whichever is slowest)\r
\`\`\`\r
\r
**Mitigations:**\r
\r
- **Preload at the entry**: emit \`<link rel="modulepreload" href="/B-abc.js">\` in the HTML so the browser fetches B in parallel with A, even though it doesn't *need* B yet.\r
- **Prefetch on intent**: start the dynamic import on hover or focus, so by the time the user clicks, the chunk is already in the cache.\r
- **Restructure**: hoist the lazy boundary to the route level, so all the route's lazy children resolve their imports off a single chunk.\r
\r
**\`startTransition\` + lazy.** Wrapping a navigation that crosses an already-visible Suspense boundary in \`startTransition\` makes React **keep the previous UI on screen** until the new chunk (and any data) is ready, instead of replacing the page with the fallback. Use \`isPending\` to show a small loading hint meanwhile. This is what turns a flash-of-spinner into a smooth route change.\r
\r
### 13.12 Server Components, SSR, and Streaming\r
\r
Every kilobyte of JavaScript has to be downloaded, parsed and executed before the page responds, and on a mid-range phone the parse-and-execute part is often the slow one. So the most reliable way to speed up a React page is to send less JavaScript. Server-side rendering and React Server Components (RSC, components that run only on the server) are the tools for that; frameworks like Next.js (App Router), Remix and TanStack Start wire them up for you.\r
\r
**Three rendering models — and how they differ.**\r
\r
\`\`\`\r
| Model       | Where it runs        | What ships to browser              | What the user sees first            |\r
|-------------|----------------------|-------------------------------------|-------------------------------------|\r
| CSR (SPA)   | Browser only         | JS bundle + tiny HTML shell        | Blank page until JS loads & renders |\r
| SSR         | Server, then browser | Pre-rendered HTML + JS for hydration | HTML immediately, interactive after JS |\r
| RSC + SSR   | Server only (RSC parts) | HTML + JS only for client comps  | HTML immediately; some parts never need JS |\r
\`\`\`\r
\r
**Classic SSR — the hydration tax.** With pure SSR, the server renders the React tree to an HTML string and ships it; the browser shows it immediately (great LCP). But the React tree must then **hydrate** in the browser: React re-renders the same tree to attach event listeners and reconcile with the existing DOM. This means you ship the HTML *and* every component's JS, and the user can see the page but cannot interact with it until hydration finishes (the "uncanny valley" of pre-React-18 SSR).\r
\r
**React Server Components — what they fix.** RSCs run **only on the server** and never ship their JS to the browser. The output of an RSC is a serialized description of the rendered tree (not HTML, not JSX — a special wire format) that the React runtime in the browser can stitch into the page alongside Client Components. Three consequences:\r
\r
1. **Zero JS for non-interactive subtrees.** A 50-item product list, a markdown blog post, a sidebar nav — these never needed event handlers anyway. Their code, their dependencies, and their data-fetching logic all stay on the server.\r
2. **Direct backend access.** Because RSCs run on the server, they can \`await db.query(...)\`, read environment secrets, and use Node-only APIs. There's no API layer to maintain for "just display this data."\r
3. **Composability with Client Components.** An RSC can render a \`'use client'\` Client Component — the framework handles serialization across the boundary. The reverse (Client → Server) requires a navigation or \`import()\` boundary because client code can't await server code mid-render.\r
\r
**Streaming SSR — the throughput model.** Even with classic SSR, \`renderToPipeableStream\` (Node) and \`renderToReadableStream\` (Edge) flush HTML to the browser as it's generated, rather than buffering the whole document. Pair with \`<Suspense>\` boundaries: above-the-fold content paints first; the slow data section sends a placeholder HTML, and the real content streams in over the same response when the promise resolves. The browser swaps the placeholder once the stream arrives — no second request, no waterfall. This is why streaming SSR can produce sub-1s LCP on data-heavy pages that would otherwise wait for the slowest query.\r
\r
**The taxonomy in one place:**\r
\r
- **Server Components** render on the server and send their rendered output (HTML on the first load, the RSC payload on client-side navigation) but none of their own JavaScript. Use them for data-heavy, non-interactive UI.\r
- **Client Components** (\`'use client'\`) hydrate and run in the browser — keep these for interactive leaves.\r
- **Streaming SSR** (\`renderToPipeableStream\` / \`renderToReadableStream\`) sends HTML in chunks as the data resolves, paired with \`<Suspense>\` boundaries. The browser paints above-the-fold content before the slow data section finishes.\r
\r
**Selective Hydration — what React 18 changed.** Pre-18, the server had to wait for *all* data before sending HTML, and the client had to download *all* JS before hydrating *any* component. One slow API blocked the whole page; one heavy bundle blocked all interactivity. React 18 made both pieces concurrent.\r
\r
On the server, components inside \`<Suspense fallback={...}>\` boundaries can fall back to their fallback HTML and stream the real markup later as data resolves. On the client, \`hydrateRoot\` hydrates each Suspense boundary independently — the fast components attach event handlers while the slow ones are still loading. Critically, React **prioritizes hydrating the boundary the user just clicked**: if the user clicks a comment thread before its bundle arrived, React promotes that boundary to the top of the queue, dropping in-flight hydration of less-urgent boundaries. The user sees their click respond as soon as the relevant code arrives, not after every component has hydrated.\r
\r
\`\`\`tsx\r
const Header = () => <header>Site header</header>;\r
const CommentsSkeleton = () => <p>Loading comments…</p>;\r
const RecsSkeleton = () => <p>Loading recommendations…</p>;\r
const Comments = ({ postId }: { postId: number }) => <p>Comments for {postId}</p>;\r
const Recommendations = ({ userId }: { userId: string }) => <p>Recs for {userId}</p>;\r
const user = { id: 'u1' };\r
\r
// Each boundary streams independently — the shell arrives first, and slow\r
// sections fill in as their data resolves.\r
function Page() {\r
  return (\r
    <>\r
      <Suspense fallback={<Header />}>           {/* ships immediately */}\r
        <Header />\r
      </Suspense>\r
      <Suspense fallback={<CommentsSkeleton />}>  {/* streams when comments resolve */}\r
        <Comments postId={42} />\r
      </Suspense>\r
      <Suspense fallback={<RecsSkeleton />}>      {/* streams when recommendations resolve */}\r
        <Recommendations userId={user.id} />\r
      </Suspense>\r
    </>\r
  );\r
}\r
\`\`\`\r
\r
Each Suspense boundary is also an independent **hydration** unit, and if the code inside it is lazy-loaded, the boundary is where React waits for that chunk. So it is *both* a data-loading boundary and a hydration boundary. The mental model: design Suspense boundaries around *user goals* — header, content, comments, sidebar — not technical layers.\r
\r
**Progressive Hydration — older non-React-built-in flavor.** A general technique that pre-dates React's selective hydration: defer hydration of components that aren't visible or aren't interactive yet. Implementations include hydrating on \`IntersectionObserver\` (when scrolled into view), on first user interaction (click/hover/focus), or on \`requestIdleCallback\` (during browser idle). Astro's "client directives" (\`client:idle\`, \`client:visible\`, \`client:only\`) are the canonical example. With React 18+, selective hydration covers most of the use cases, but \`client:visible\`-style hydration is still useful for far-below-the-fold widgets where you'd rather not even download the JS until the user scrolls.\r
\r
**Islands Architecture — the radical alternative.** Instead of "ship a React tree and hydrate it," islands ship *plain HTML* with isolated interactive components ("islands") sprinkled in. Each island has its own tiny bundle and hydrates independently — there's no big root tree and no monolithic hydration step. Static content (most of a blog post, a marketing page, a product description) ships as raw HTML with zero JS.\r
\r
Frameworks: **Astro** (the canonical implementation), **Marko** (eBay), **Eleventy + Preact**, **Fresh** (Deno), and **Qwik** (which goes further with "resumability" — no hydration at all, just lazy event listener attachment). Islands suit content-heavy sites where most of the page is static; SPA-heavy apps with thousands of interactive widgets aren't a great fit.\r
\r
\`\`\`\r
| Approach              | Initial JS payload         | Best for                           |\r
|-----------------------|----------------------------|------------------------------------|\r
| SPA (CSR)             | Whole app                  | Highly interactive dashboards      |\r
| SSR + full hydration  | Whole app + serialized data| Mixed-interactive content sites    |\r
| RSC + selective hyd.  | Only Client Components     | Modern data-heavy apps             |\r
| Islands               | Only the islands           | Content-first sites (blogs, docs)  |\r
| Resumable (Qwik)      | ~0KB until interaction     | Same as Islands, even leaner       |\r
\`\`\`\r
\r
**Incremental Static Regeneration (ISR).** Sits between SSG and SSR. The page is pre-rendered at build time (like SSG) but the server can **regenerate** specific pages in the background after a \`revalidate\` interval, while still serving the cached version to users (stale-while-revalidate). The result: static-fast TTFB plus the ability to update content without a full site rebuild.\r
\r
\`\`\`tsx\r
// Next.js Pages Router\r
export async function getStaticProps() {\r
  const post = await fetchPost();\r
  return {\r
    props: { post },\r
    revalidate: 60,    // background-regenerate at most every 60s\r
  };\r
}\r
\r
// Next.js App Router — on-demand revalidation\r
import { revalidatePath, revalidateTag } from 'next/cache';\r
revalidatePath('/blog/[slug]', 'page');   // invalidates a single path\r
revalidateTag('posts');                    // invalidates everything tagged 'posts'\r
\`\`\`\r
\r
ISR shines for blogs, product catalogs, news sites — pages that change occasionally but get massive read traffic. Not appropriate for per-user personalized data (use SSR or RSC instead), and the first user after the revalidation window pays a slightly slower request as the regeneration runs.\r
\r
**Rendering models on the web — the comparison table.**\r
\r
\`\`\`\r
| Model           | Renders at      | TTFB    | FCP     | TTI/INP  | SEO  | Best for                       |\r
|-----------------|-----------------|---------|---------|----------|------|--------------------------------|\r
| CSR (SPA)       | Browser only    | Fast    | Slow    | Slow     | Hard | App shell, dashboards          |\r
| SSR             | Server per req  | Slower  | Fast    | Hydration| Good | Personalized, dynamic content  |\r
| SSG             | Build time      | Fastest | Fast    | Fast     | Best | Marketing, docs (static)       |\r
| ISR             | Build + bg re-gen| Fast   | Fast    | Fast     | Best | High-traffic infrequently changing |\r
| Streaming SSR   | Server (chunked)| Fast    | Fast    | Hydration| Good | Large pages with slow data     |\r
| RSC             | Server + client | Fast    | Fast    | Less JS  | Best | Modern data-heavy apps         |\r
| Islands         | Server + per-island JS| Fast | Fast | Fastest | Best | Content-first sites            |\r
\`\`\`\r
\r
Pick by what dominates your page: **mostly static content** → SSG or Islands. **Personalized per request** → SSR or RSC. **High-traffic catalog with periodic updates** → ISR. **Highly interactive dashboard** → CSR with route-level lazy loading. Most apps end up using *several* of these — RSC for the layout shell, SSG for marketing pages, CSR for the authenticated dashboard, ISR for the public blog.\r
\r
\`\`\`tsx\r
// Server component — runs once on the server, ships zero JS\r
async function ProductList() {\r
  const products = await db.products.findMany();   // direct DB access\r
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>;\r
}\r
\r
// app/page.tsx\r
export default function Page() {\r
  return (\r
    <Suspense fallback={<Skeleton />}>\r
      <ProductList />          {/* streams in when data is ready */}\r
    </Suspense>\r
  );\r
}\r
\`\`\`\r
\r
Even without RSC, plain SSR + hydration improves LCP on content-heavy pages. The trade-off is TTFB — measure before adopting.\r
\r
### 13.13 Performance Rules\r
\r
Follow these rules of thumb to keep your React app fast.\r
\r
\`\`\`\r
1.  Don't optimize prematurely — re-rendering is cheap: React only touches the DOM where output changed\r
2.  Profile first — React DevTools Profiler for renders, Lighthouse for load\r
3.  New objects/arrays/functions in render are fine; stabilise them only when they're props to memoized children or effect deps\r
4.  Use stable keys in lists (id, not index, when items can reorder or splice)\r
5.  Move state as close to where it's needed as possible — co-location > global\r
6.  Memoize Context value objects; split unrelated state into separate contexts\r
7.  Code-split routes and heavy widgets; preload above-the-fold chunks\r
8.  Virtualize long lists (1000+ items)\r
9.  Use useTransition / useDeferredValue for slow state-derived UI\r
10. Lazy-load offscreen images, set width/height to prevent CLS, preload the LCP image\r
11. Run a bundle analyzer on every PR that adds a dependency, not just before a release, and enforce a size budget in CI (§15.12); chase duplicates and lodash/moment\r
12. Tree-shake — named ESM imports + sideEffects:false\r
13. Track INP, LCP, CLS in production with web-vitals → analytics\r
14. Prefer Server Components for non-interactive, data-heavy UI\r
\`\`\`\r
\r
---\r
\r
## 14. Reconciliation and Fiber\r
\r
This section is the "what is actually happening when React renders" deep dive. If you only ever use \`useState\` and JSX, you can skip it; if you debug perf bugs or get asked "explain reconciliation" in interviews, it's the most useful section in the guide.\r
\r
### 14.1 The Render → Reconcile → Commit pipeline\r
\r
Every React update goes through three phases. Conflating them is the #1 source of mental-model bugs:\r
\r
1. **Render phase** — React calls your component functions, building a *new* tree of plain JS objects (React elements). Pure: no DOM mutation, no effects, no side effects of yours allowed.\r
2. **Reconciliation** — React compares ("diffs") the new element tree against the previous fiber tree to figure out what actually changed.\r
3. **Commit phase** — React applies the diff to the real DOM, runs \`useLayoutEffect\` synchronously, paints, then runs \`useEffect\` after paint.\r
\r
The render phase can be **paused, restarted, or thrown away** in concurrent mode (an interrupting urgent update will just discard a half-finished render). The commit phase is **always synchronous and uninterruptible** — once React starts mutating the DOM, it finishes before yielding. This is why side effects in the render body are forbidden: a discarded render must leave no trace.\r
\r
### 14.2 The diffing algorithm — three rules\r
\r
A naive tree diff is O(n³). React achieves practical O(n) by making three opinionated assumptions and refusing to handle the cases that violate them:\r
\r
\`\`\`\r
1. Different element types → unmount the old, mount fresh.\r
   <div> → <span> nukes the entire subtree (including state, refs, DOM).\r
2. Same type → keep the DOM node, update its props.\r
   Diff continues recursively into children.\r
3. Lists are matched by \`key\`, not by content.\r
   Same key + same type → reuse. Different key → unmount + remount.\r
\`\`\`\r
\r
The reasoning behind rule #1 is harsh but correct: changing \`<div>\` to \`<span>\` is so unusual that it's not worth searching for "did the user maybe mean to keep this node?" If you wanted preservation, you'd use the same type and change the prop. The performance cost of the wrong assumption is bounded (one subtree); the gain on the common case (no type change) is enormous.\r
\r
### 14.3 Type matching — when components survive props changes vs get destroyed\r
\r
Two questions get conflated in interviews:\r
\r
- **"Is the component re-rendered?"** — yes, almost always, when the parent re-renders. This is cheap.\r
- **"Is the component remounted?"** — almost never. Remount happens only if the element type changes, or if the key changes.\r
\r
\`\`\`jsx\r
// Same type — props update, hooks/state/DOM survive\r
{isLoggedIn ? <Profile name="Ana" /> : <Profile name="Guest" />}\r
\r
// Different type at the same position — REMOUNT (state/refs/DOM nuked)\r
{isLoggedIn ? <Profile /> : <LoginPrompt />}\r
\r
// Same type, different positions in array\r
//   Without keys, position is identity → first slot maps to first slot\r
{[...items, item3].map(i => <Item data={i} />)}    // index keys, fragile\r
{items.map(i => <Item key={i.id} data={i} />)}     // stable id keys, correct\r
\`\`\`\r
\r
**The conditional-rendering gotcha that catches everyone:**\r
\r
\`\`\`jsx\r
{isCompany ? <Input id="company-id" /> : <Input id="person-id" />}\r
\`\`\`\r
\r
Both branches produce \`<Input>\` at the same position with the same type. React reuses the DOM node and the component's internal state — so when the user toggles \`isCompany\`, the half-typed text from one form stays in the *other* form's field. Both branches share the same React fiber.\r
\r
The fix is to give them different identity:\r
\r
\`\`\`jsx\r
{isCompany ? <Input key="company" id="company-id" /> : <Input key="person" id="person-id" />}\r
\`\`\`\r
\r
Different keys at the same position force React to unmount one and mount the other. The state resets correctly.\r
\r
### 14.4 Why list keys matter at the algorithm level\r
\r
Without keys, React matches list items **by position**:\r
\r
\`\`\`jsx\r
{items.map((item, i) => <Row data={item} />)}    // implicit key = index\r
\`\`\`\r
\r
This is correctness-fine **only if items never reorder, splice, or filter**. The moment you do \`setItems(prev => [newItem, ...prev])\`, React's reconciliation:\r
\r
1. Sees \`Row\` at index 0 with new \`data\` prop → calls it a prop update on the existing Row.\r
2. Sees \`Row\` at index 1 with the data that *used to be* at index 0 → another prop update.\r
3. ...and so on for every row.\r
\r
The visible result: every row's props "changed," so every memoization is invalidated and the whole list re-renders. Worse, each row's **local state stays with its position**, not its data: if row 0 had a half-typed input or an open menu, after the prepend that state now sits on the new item, and every other row's state is shifted by one. With \`key={item.id}\`, React matches by identity — the new item gets a fresh mount, the rest are untouched, and \`React.memo\` or \`useMemo\` work as designed.\r
\r
### 14.5 Fiber — the data structure that makes interruption possible\r
\r
Pre-React-16, reconciliation was implemented as **recursive synchronous tree traversal**. Each component's render call sat on the JavaScript call stack. The call stack is opaque — you can't pause it, save it, or restart it — so a render had to run to completion or not at all. A 200ms render meant a 200ms blocked main thread.\r
\r
React 16's Fiber rewrote the call stack as a **linked list of plain JS objects**. Each fiber has pointers to its \`child\`, \`sibling\`, and \`return\` (parent), plus state about its work-in-progress. Walking the tree is now an iterative loop — at any iteration, React can save its position and yield to the browser:\r
\r
\`\`\`js\r
// Conceptual shape of a fiber node (field names are React's, values elided)\r
const fiber = {\r
  type: 'Profile',          // function ref or DOM tag\r
  stateNode: null,          // the actual instance / DOM node\r
  child: null,              // tree pointers\r
  sibling: null,\r
  return: null,             //   ↑ parent\r
  pendingProps: {},         // input for this render\r
  memoizedProps: {},        // input from the last committed render\r
  memoizedState: null,      // the hooks linked list\r
  alternate: null,          // counterpart in the other tree (double-buffering)\r
  flags: 0,                 // bitmask of work to do (Placement, Update, Deletion…)\r
  lanes: 0,                 // priority bitmap\r
};\r
\`\`\`\r
\r
**Why every field matters:**\r
\r
- **\`child\`/\`sibling\`/\`return\`** — iterative tree walk; React can pause and the next slice picks up at this fiber.\r
- **\`alternate\`** — the **double-buffer** pointer. Each fiber in the current tree has an alternate in the work-in-progress tree (and vice versa). When a render completes, React swaps \`current = workInProgress\` in O(1).\r
- **\`pendingProps\` vs \`memoizedProps\`** — enables the "bail out" optimization. If pending equals memoized (and there are no pending hooks updates), React skips re-rendering this fiber entirely.\r
- **\`flags\`** (formerly \`effectTag\`) — bitmask of what needs to happen at commit time. Placement = insert into DOM, Update = mutate DOM, Deletion = remove. Set during the render phase, applied during commit.\r
- **\`lanes\`** — which priority lanes have pending work in this subtree. Used by the scheduler to pick which fiber to work on next.\r
\r
### 14.6 The work loop — how React actually traverses\r
\r
Fiber's work loop is two phases per slice — **begin** (descend into a fiber, build its work-in-progress) and **complete** (bubble back up, attach results to parent). Roughly:\r
\r
\`\`\`\r
beginWork(fiber):\r
  if fiber is bailout-eligible: skip subtree\r
  else: render the component, create child fibers, descend to first child\r
\r
completeWork(fiber):\r
  attach DOM nodes / collect side effects into parent\r
  if has sibling: switch to sibling, beginWork\r
  else: bubble up to return, completeWork\r
\`\`\`\r
\r
After roughly 5ms of work, React calls \`shouldYield()\` (which uses \`MessageChannel\` for a fast yield-to-browser). The browser handles input/paint, then schedules React's continuation. The interrupted fiber's position is just a pointer in the work-in-progress tree — picking up next time costs nothing.\r
\r
### 14.7 Practical implications\r
\r
1. **Don't redeclare components inside other components.** Each parent render creates a *new* function reference, which Fiber sees as a new \`type\`, which triggers unmount + remount of every instance. The bug looks like "my input loses focus on every keystroke."\r
\r
   \`\`\`jsx\r
   // BAD — type a letter: the input loses focus after every keystroke\r
   function Parent() {\r
     const [text, setText] = useState('');\r
     const Input = () => <input value={text} onChange={(e) => setText(e.target.value)} />; // new ref every render → remount\r
     return <Input />;\r
   }\r
   render(<Parent />);\r
   \`\`\`\r
\r
2. **Mounting is expensive; updating is cheap.** A change that flips the type unmounts the entire subtree. If you can preserve the type and just change props, do.\r
\r
3. **Stable list keys are a correctness rule, not just a perf rule.** Index keys silently corrupt component state when items reorder.\r
\r
4. **\`React.memo\` is a fiber-level bailout opt-in.** It compares incoming props against \`memoizedProps\` shallowly; if equal, the begin phase short-circuits the subtree. Without \`memo\`, React re-runs the function but the bailout logic in Fiber may still skip some work via \`pendingProps === memoizedProps\` reference equality.\r
\r
5. **The Profiler's "actual" vs "base" duration** map to the fiber-level cost: actual is the time React actually spent in the begin phase (after bailouts); base is what it would have cost without any bailout. Gap = your memoization is paying off.\r
\r
---\r
\r
## 15. Patterns and Best Practices\r
\r
### 15.1 Compound Components\r
\r
A compound component is a set of components designed to be used together, like \`<select>\` and \`<option>\` in HTML. The parent (\`Tabs\`) holds the state and shares it with its pieces through Context, so the user of the component never passes \`activeTab\` around by hand — they just arrange \`Tabs.Tab\` and \`Tabs.Panel\` in whatever markup they want. The benefit over one big \`<Tabs items={[...]} />\` component with many props is flexibility: the caller controls the layout and content, while the parent still controls the behaviour. Libraries like Radix UI and Headless UI are built this way.\r
\r
\`\`\`tsx\r
const TabsContext = createContext({ activeTab: 0, setActiveTab: (_index: number) => {} });\r
\r
function Tabs({ children }: { children: React.ReactNode }) {\r
  const [activeTab, setActiveTab] = useState(0);\r
\r
  return (\r
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>\r
      <div className="tabs">{children}</div>\r
    </TabsContext.Provider>\r
  );\r
}\r
\r
Tabs.List = function TabList({ children }: { children: React.ReactNode }) {\r
  return <div className="tab-list">{children}</div>;\r
};\r
\r
Tabs.Tab = function Tab({ index, children }: { index: number; children: React.ReactNode }) {\r
  const { activeTab, setActiveTab } = useContext(TabsContext);\r
  return (\r
    <button\r
      className={activeTab === index ? 'active' : ''}\r
      onClick={() => setActiveTab(index)}\r
    >\r
      {children}\r
    </button>\r
  );\r
};\r
\r
Tabs.Panel = function TabPanel({ index, children }: { index: number; children: React.ReactNode }) {\r
  const { activeTab } = useContext(TabsContext);\r
  return activeTab === index ? <div>{children}</div> : null;\r
};\r
\r
// Usage\r
render(\r
  <Tabs>\r
    <Tabs.List>\r
      <Tabs.Tab index={0}>Tab 1</Tabs.Tab>\r
      <Tabs.Tab index={1}>Tab 2</Tabs.Tab>\r
    </Tabs.List>\r
    <Tabs.Panel index={0}>Content 1</Tabs.Panel>\r
    <Tabs.Panel index={1}>Content 2</Tabs.Panel>\r
  </Tabs>\r
);\r
\`\`\`\r
\r
### 15.2 Render Props\r
\r
Render props is a pattern where a component accepts a function as a prop and calls it to decide what to render. The component owns some behaviour (here: tracking the mouse) and hands its data to your function, so the *behaviour* is reused while each caller chooses its own *markup*. It was the standard way to share stateful logic before hooks.\r
\r
\`\`\`tsx\r
interface MousePosition { x: number; y: number }\r
\r
function MouseTracker({ render }: { render: (pos: MousePosition) => React.ReactNode }) {\r
  const [position, setPosition] = useState({ x: 0, y: 0 });\r
\r
  useEffect(() => {\r
    const handler = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });\r
    window.addEventListener('mousemove', handler);\r
    return () => window.removeEventListener('mousemove', handler);\r
  }, []);\r
\r
  return <>{render(position)}</>;\r
}\r
\r
// Usage\r
render(<MouseTracker render={({ x, y }) => <p>Mouse: {x}, {y}</p>} />);\r
\`\`\`\r
\r
### 15.3 Custom Hook Pattern (Preferred over Render Props)\r
\r
Custom hooks have largely replaced render props and HOCs (§15.4) for sharing stateful logic. The same mouse-tracking logic becomes a function that returns a value: no extra component in the tree, no callback nesting when you need two of them, and the data arrives as an ordinary variable you can name however you like.\r
\r
\`\`\`tsx\r
function useMousePosition() {\r
  const [position, setPosition] = useState({ x: 0, y: 0 });\r
\r
  useEffect(() => {\r
    const handler = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });\r
    window.addEventListener('mousemove', handler);\r
    return () => window.removeEventListener('mousemove', handler);\r
  }, []);\r
\r
  return position;\r
}\r
\r
// Usage\r
function Component() {\r
  const { x, y } = useMousePosition();\r
  return <p>Mouse: {x}, {y}</p>;\r
}\r
\`\`\`\r
\r
---\r
\r
### 15.4 Higher-Order Components (HOCs)\r
\r
A HOC is a function that takes a component and returns a new component with extra behaviour. It was the dominant reuse pattern before hooks.\r
\r
\`\`\`tsx\r
// stand-ins so this example runs on its own\r
const analytics = { track: (event: string, name: string) => console.log('track', event, name) };\r
const Dashboard = () => <h2>Dashboard</h2>;\r
\r
function withLogging<P extends object>(Wrapped: React.ComponentType<P>) {\r
  return function WithLogging(props: P) {\r
    useEffect(() => { analytics.track('mount', Wrapped.name); }, []);\r
    return <Wrapped {...props} />;\r
  };\r
}\r
const DashboardWithLogging = withLogging(Dashboard);\r
export default DashboardWithLogging;\r
\r
render(<DashboardWithLogging />);\r
\`\`\`\r
\r
**Why hooks replaced them for most cases:** HOCs create "wrapper hell" in the component tree, they obscure where a prop came from (three HOCs deep, which one injected \`user\`?), prop-name collisions are silent, static methods and refs need manual forwarding, and typing them well is genuinely hard.\r
\r
**Where a HOC is still the right tool:** when the behaviour must wrap the component itself rather than run inside it — an error boundary, a Suspense boundary, an authorization gate that renders something *else*, or injecting a provider. A hook can't stop a component rendering or replace it; a HOC can.\r
\r
The convention if you write one: name it \`withX\`, hoist static methods, forward refs, and set \`displayName\` so DevTools is readable.\r
\r
---\r
\r
### 15.5 Presentational vs Container Components\r
\r
The original split (Dan Abramov, 2015) separated **container** components (fetch data, hold state, know about the outside world) from **presentational** components (take props, render UI, know nothing about where data came from).\r
\r
\`\`\`tsx\r
import { useQuery } from '@tanstack/react-query';\r
\r
// Container — knows about data\r
function UserListContainer() {\r
  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });\r
  if (isLoading) return <Spinner />;\r
  return <UserList users={data} />;\r
}\r
\r
// Presentational — pure, trivially testable, trivially storybook-able\r
function UserList({ users }: { users: User[] }) {\r
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;\r
}\r
\`\`\`\r
\r
**Abramov later walked the prescription back**, and the reason matters: custom hooks made the split unnecessary as a *rule*, because you can extract the data logic without extracting a component. The mechanical version — a \`Container\` file for every component — is now considered overkill.\r
\r
But the **underlying principle survives and is worth stating**: keep components that know about data separate from components that only render, because presentational components are trivially testable, reusable across contexts, and the right thing to put in Storybook. In modern React the seam is usually a **custom hook** (\`useUsers()\`) rather than a wrapper component, and in an RSC codebase it maps almost exactly onto the **Server Component fetches / Client Component renders** boundary (see the Next.js & RSC guide).\r
\r
---\r
\r
### 15.6 Flux and One-Way Data Flow\r
\r
**Flux** is the architecture Facebook introduced in 2014 to replace two-way binding, and it's the ancestor of Redux, Zustand and \`useReducer\`:\r
\r
\`\`\`\r
Action  →  Dispatcher  →  Store  →  View\r
  ↑                                  │\r
  └──────────────────────────────────┘\r
        (views dispatch actions, never write to stores)\r
\`\`\`\r
\r
The key constraint is that **data flows in one direction only.** A view cannot mutate a store; it can only *dispatch an action describing what happened*. The store owns the transition. Redux collapsed the dispatcher into a single store with reducers, and \`useReducer\` is the same idea at component scope.\r
\r
**Why one-way data flow matters** — this is the actual interview answer, not the diagram:\r
\r
- **Predictability.** State changes have exactly one path, so "why did this change?" has a findable answer. Two-way binding (Angular 1, Knockout) meant any view could write to any model, and a cascade of updates had no traceable origin.\r
- **Debuggability.** Because every change is an action, you get a log of them — which is what makes Redux DevTools' time-travel possible.\r
- **Testability.** A reducer is a pure function: given this state and this action, expect that state.\r
- **It composes with React's render model.** React re-renders from data, so a single source of truth per piece of state means the UI is always a function of state rather than a set of imperative patches.\r
\r
In React specifically, one-way flow is why **props flow down and events flow up**: a child never writes to a parent's state, it calls a callback and the parent decides. When two siblings need the same state, you **lift it** to their common ancestor (or a store). And it's why **mutating state directly is a bug** — the reducer/setter is the only sanctioned transition, and mutation bypasses it (see §5).\r
\r
---\r
\r
### 15.7 Portals\r
\r
A portal renders children into a **different DOM node** while keeping them in the same React tree.\r
\r
\`\`\`tsx\r
import { createPortal } from 'react-dom';\r
\r
function Modal({ children, onClose }) {\r
  return createPortal(\r
    <div className="overlay" onClick={onClose}>{children}</div>,\r
    document.body,                 // rendered here in the DOM\r
  );\r
}\r
\`\`\`\r
\r
**The problem it solves** is CSS containment: a modal, dropdown or tooltip rendered deep in the tree gets clipped by an ancestor's \`overflow: hidden\`, or loses a \`z-index\` fight because an ancestor created a stacking context (see the Modern CSS guide §11). Portalling to \`document.body\` escapes both.\r
\r
**What stays and what moves:**\r
\r
| Follows the **React** tree | Follows the **DOM** tree |\r
|---|---|\r
| Context — a portal still reads providers above it | CSS — styles come from the new parent |\r
| Event bubbling *in React* — events propagate to React ancestors | Focus/tab order — the node is where you put it |\r
| Error boundaries | \`document.activeElement\`, native event listeners on ancestors |\r
\r
That first row surprises people: a portalled component **still receives context** from where it sits in JSX, and a synthetic event from inside a portal **still bubbles to its React parent** even though the DOM nodes are unrelated. That's usually what you want, and occasionally the source of a "why is my outside-click handler firing?" bug — a click inside a portalled modal bubbles to the React ancestor that owns the "click outside to close" handler.\r
\r
**The modern alternative is usually better.** \`<dialog>\` with \`showModal()\` and the \`popover\` attribute render in the browser's **top layer**, which is above the entire stacking-context tree, and they bring focus trapping, Escape-to-close and \`::backdrop\` for free. Reach for a portal when you need one for a non-dialog case or you're supporting a design that predates those.\r
\r
**Accessibility caveat:** a portal moves the DOM node, so **tab order follows the DOM, not your JSX**. A portalled dropdown appended to \`document.body\` sits at the end of the tab order regardless of where its trigger is, so you must manage focus explicitly (see the Accessibility guide §6.3).\r
\r
---\r
\r
### 15.8 Fragments, and Node vs Element vs Component\r
\r
**Fragments** group children without adding a DOM node:\r
\r
\`\`\`tsx\r
<>\r
  <td>Name</td>\r
  <td>Email</td>\r
</>\r
\`\`\`\r
\r
They matter for more than tidiness: wrapping \`<td>\`s or \`<li>\`s in a \`<div>\` produces invalid HTML and breaks the parent-child relationships screen readers depend on, and an extra \`div\` inside a flex or grid container changes the layout. Use the long form \`<React.Fragment key={id}>\` when you need a \`key\` — the shorthand can't take one.\r
\r
**The three terms** get asked as a definition question, and the distinction is real:\r
\r
| Term | What it is |\r
|---|---|\r
| **React Component** | A function (or class) that returns UI. A *blueprint* — \`function Button() {…}\` |\r
| **React Element** | The lightweight object a component call or JSX produces. Immutable, describes what to render — \`{ type: Button, props: {…}, key, ref }\` |\r
| **React Node** | Anything React can render: an element, a string, a number, \`null\`, \`undefined\`, a boolean, or an array of nodes |\r
\r
\`\`\`tsx\r
const Button = () => <button/>;         // Component (blueprint)\r
const el = <Button />;                  // Element  (a plain object, NOT rendered yet)\r
const node = [el, 'text', null, 42];    // Node     (all renderable)\r
\`\`\`\r
\r
The practical consequences: **elements are immutable** — you describe a new one rather than mutating an existing one, which is why the render model works. \`<Button />\` is *not* a call to \`Button()\`; it's \`createElement(Button, …)\`, an object React will call *later* and can choose not to call at all. And \`React.ReactNode\` is the type you want for a \`children\` prop, because it's the permissive one — \`ReactElement\` rejects a string child, which is a very common TypeScript mistake.\r
\r
---\r
\r
### 15.9 StrictMode\r
\r
\`\`\`tsx\r
<StrictMode><App /></StrictMode>\r
\`\`\`\r
\r
In **development only**, StrictMode deliberately:\r
\r
- **Double-invokes** component function bodies, initialisers, and reducer/state updater functions — to surface impure renders.\r
- **Double-runs effects** — mount → unmount → mount — to surface missing cleanup.\r
- Warns about deprecated APIs and legacy patterns.\r
\r
None of this happens in production. The double-invoke is not a bug and should not be "fixed" by adding a ref guard — it's a detector. **If double-invoking breaks your component, your component is impure**, which means it will also break under React's concurrent renderer, which is allowed to start, abandon and restart a render.\r
\r
The two failures it exposes, both real:\r
\r
\`\`\`text\r
// Impure render — mutates a prop; StrictMode makes it push twice\r
function List({ items }) { items.push('extra'); /* … */ }\r
\r
// Missing cleanup — StrictMode's mount/unmount/mount leaves two subscriptions\r
useEffect(() => { socket.subscribe(handler); }, []);   // no return\r
\`\`\`\r
\r
It also interacts with React Compiler: the compiler **silently skips** components that violate purity or immutability, so StrictMode is the tool that makes the underlying impurity *visible* (see §16.1).\r
\r
---\r
\r
### 15.10 Internationalisation (i18n)\r
\r
Not a React feature, but a standard interview topic because getting it wrong is expensive to retrofit.\r
\r
\`\`\`tsx\r
// react-i18next / next-intl / FormatJS all follow this shape\r
const { t } = useTranslation();\r
<p>{t('cart.items', { count })}</p>          // pluralisation handled by the library\r
\`\`\`\r
\r
The decisions that matter:\r
\r
- **Never concatenate translated strings.** \`t('You have') + count + t('items')\` breaks in every language with different word order or grammatical cases. Use **interpolation with named placeholders** and let the library handle **pluralisation** — plural rules vary from two forms (English) to six (Arabic), so \`count === 1 ? 'item' : 'items'\` is wrong outside English.\r
- **Use \`Intl\` for anything formattable.** \`Intl.NumberFormat\`, \`Intl.DateTimeFormat\`, \`Intl.RelativeTimeFormat\`, \`Intl.ListFormat\`, \`Intl.Collator\` for sorting. It's built in, correct, and handles currency, grouping separators and calendars you haven't thought about. With \`Temporal\` now standard, time-zone-correct date handling is finally straightforward (see the JavaScript guide §9.10).\r
- **RTL is a layout problem, not a translation problem.** \`dir="rtl"\` on \`<html>\` plus **CSS logical properties** (\`margin-inline-start\`, not \`margin-left\`) means one stylesheet works for both directions. Retrofitting this is far more expensive than starting with it (see the Modern CSS guide §10.3).\r
- **Load translations per locale, lazily.** Shipping every language to every user is a needless bundle cost; split by locale and load on demand.\r
- **Design for text expansion.** German and Finnish routinely run 30–40% longer than English; fixed-width buttons and single-line assumptions break. Test with a pseudo-locale.\r
- **Locale in the URL** (\`/en/…\`, \`/de/…\`) rather than only in a cookie, so pages are shareable, crawlable and cacheable per locale.\r
- **Translators need context.** Keys like \`submit\` appear in five places with five correct translations; namespaced keys plus a description field prevent that.\r
\r
---\r
\r
### 15.11 Events — Delegation and the Synthetic System\r
\r
React attaches **one listener per event type at the root container** and dispatches to your handlers by walking the fiber tree. It does not attach a listener per element.\r
\r
Why: attaching thousands of individual listeners is expensive in memory, and delegation means a handler on a newly-rendered element works immediately with no attach step.\r
\r
**SyntheticEvent** is React's cross-browser wrapper around the native event, normalising differences in property names and behaviour. \`e.nativeEvent\` gets you the underlying event.\r
\r
The consequences that get asked:\r
\r
- **\`e.stopPropagation()\` stops propagation within React**, but the native event has already reached the root — so a native listener added with \`document.addEventListener\` will still fire. Mixing React handlers with manual \`document\` listeners produces ordering surprises, and this is the usual explanation.\r
- **React 17 moved the root listener** from \`document\` to the React root container. That was a real fix for embedding multiple React versions or a React app inside another app, where \`stopPropagation\` in one tree previously affected the other.\r
- **Event pooling was removed in React 17.** The old \`e.persist()\` requirement is gone, so you can read event properties asynchronously.\r
- **Some events don't bubble** and are attached directly (\`scroll\`, media events, \`focus\`/\`blur\` are exposed as bubbling \`onFocus\`/\`onBlur\` via \`focusin\`/\`focusout\`).\r
- **Manual delegation is rarely needed** — React already does it. Attaching one handler to a list container instead of each row is a micro-optimisation that mostly buys nothing, though it can help for very large lists by avoiding thousands of closure allocations per render.\r
\r
---\r
\r
### 15.12 CI/CD — Lint, Type-check and Test on Every Pull Request\r
\r
**CI (continuous integration) runs the same checks on every change, on a clean machine, before it can merge. CD (continuous delivery or deployment) turns the merged code into a release automatically.** The part interviews ask about most is the gate: a pull request (PR) cannot merge until lint, the type checker and the tests pass. Two pieces make that work. The workflow runs the checks, and a repository rule makes their results **required**. Without the rule, a red check is only advice.\r
\r
The npm scripts the workflow calls:\r
\r
\`\`\`json\r
{\r
  "scripts": {\r
    "lint": "eslint . --max-warnings=0",\r
    "typecheck": "tsc --noEmit",\r
    "test": "vitest run",\r
    "build": "vite build"\r
  }\r
}\r
\`\`\`\r
\r
\`--max-warnings=0\` turns warnings into failures; otherwise warnings pile up and nobody reads them. \`tsc --noEmit\` is a separate step because **Vite and esbuild strip types without checking them**, so \`vite build\` succeeds on code with type errors.\r
\r
The workflow, in \`.github/workflows/ci.yml\`:\r
\r
\`\`\`yaml\r
name: CI\r
\r
on:\r
  pull_request:            # every PR, including PRs from forks\r
  push:\r
    branches: [main]       # and every merge, so main is always known-good\r
  merge_group:             # only needed if you turn on the merge queue\r
\r
permissions:\r
  contents: read           # least privilege: CI reads code, it does not push\r
\r
concurrency:\r
  # A new push to a PR cancels that PR's previous, now-pointless run.\r
  # Pushes to main are never cancelled, so every merge gets a full result.\r
  group: ci-\${{ github.ref }}\r
  cancel-in-progress: \${{ github.event_name == 'pull_request' }}\r
\r
jobs:\r
  lint:\r
    runs-on: ubuntu-latest\r
    steps:\r
      - uses: actions/checkout@v7\r
      - uses: actions/setup-node@v7\r
        with:\r
          node-version-file: .nvmrc   # the same Node version as local development\r
          cache: npm                  # reuse the npm download cache between runs\r
      - run: npm ci                   # install exactly what package-lock.json says\r
      - run: npm run lint\r
\r
  typecheck:\r
    runs-on: ubuntu-latest\r
    steps:\r
      - uses: actions/checkout@v7\r
      - uses: actions/setup-node@v7\r
        with: { node-version-file: .nvmrc, cache: npm }\r
      - run: npm ci\r
      - run: npm run typecheck\r
\r
  test:\r
    runs-on: ubuntu-latest\r
    steps:\r
      - uses: actions/checkout@v7\r
      - uses: actions/setup-node@v7\r
        with: { node-version-file: .nvmrc, cache: npm }\r
      - run: npm ci\r
      - run: npm test -- --coverage\r
\r
  build:\r
    runs-on: ubuntu-latest\r
    steps:\r
      - uses: actions/checkout@v7\r
      - uses: actions/setup-node@v7\r
        with: { node-version-file: .nvmrc, cache: npm }\r
      - run: npm ci\r
      - run: npm run build            # catches what the others cannot: a failing bundle\r
\`\`\`\r
\r
**Why four jobs and not one job with four steps:** jobs run in parallel, so the wall-clock time is the slowest check rather than the sum, and each job is a separately named check on the PR, so the author sees *which* thing failed without opening a log. The cost is installing dependencies four times (the npm cache keeps that to seconds). Once the setup steps are copied more than twice, move them into a composite action (a reusable group of steps, in \`.github/actions/setup/action.yml\`).\r
\r
**Blocking the merge.** In the repository's Settings, open **Rules → Rulesets** (or the older **Branches → Branch protection rules**) and create a rule for \`main\`:\r
\r
1. **Require a pull request before merging**, so nobody pushes straight to \`main\`.\r
2. **Require status checks to pass**, and add \`lint\`, \`typecheck\`, \`test\` and \`build\`. The names are the job ids above, which is why they should be short and stable.\r
3. **Require branches to be up to date before merging**, or turn on the **merge queue**, which tests each PR combined with the ones queued ahead of it. The merge queue is why the workflow listens to \`merge_group\`: without that trigger the queue waits for a check that never starts.\r
4. **Block force pushes** to \`main\`.\r
\r
**The mistakes that come up in reviews and interviews:**\r
\r
- **A required check that never runs blocks the PR forever.** If the workflow has a \`paths:\` filter (for example "only run when \`src/\` changes"), a docs-only PR never produces the \`test\` check, and GitHub shows it as *Expected, waiting for status* until someone overrides it. Do not path-filter required workflows. If you need to skip work, let the job run and skip its steps.\r
- **Renaming a job silently breaks the rule.** The ruleset still requires \`test\`, the workflow now reports \`unit-tests\`, and every PR waits. Rename both together.\r
- **\`pull_request_target\` is not a fix for missing secrets.** PRs from forks get no secrets and a read-only token, by design. \`pull_request_target\` runs with the base repository's secrets and write token, so checking out the PR's code in it runs a stranger's code with your credentials. Keep tests on \`pull_request\`.\r
- **Pin third-party actions to a full commit SHA** (\`uses: some-org/action@3f1c…\`), because a tag like \`@v2\` can be moved to point at different code, and let Dependabot propose updates. Official \`actions/*\` pinned by major version is a common, accepted compromise.\r
- **Keep it fast.** Past ten minutes people stop waiting for CI and start merging around it. Cache dependencies, run jobs in parallel, shard slow test suites across machines (\`vitest run --shard=1/3\`), and move end-to-end tests to a separate, non-blocking or nightly workflow if they are slow and flaky.\r
- **Local hooks are a convenience, CI is the gate.** A pre-push hook that runs the same checks catches problems in seconds, but \`--no-verify\` skips it, so only the required check actually guarantees anything. This app does exactly that: \`npm run verify\` runs six gates locally in a pre-push hook, and the deploy workflow runs the same six.\r
\r
**The CD half, briefly:** a \`deploy\` job runs only on \`push\` to \`main\`, declares \`needs: [lint, typecheck, test, build]\`, and targets a GitHub **environment** (\`environment: production\`), which can require a reviewer's approval and holds that environment's secrets. Cloud credentials come from **OIDC** (the cloud trusts GitHub's short-lived identity token), not a long-lived access key stored as a secret. Many teams also deploy a **preview** of every PR to its own URL, so reviewers can click through the change. Interview Q84 walks through the whole pipeline.\r
\r
\r
---\r
\r
## 16. React 19 Features\r
\r
### 16.1 React Compiler (stable since 1.0)\r
\r
**Short answer:** React Compiler is a build step that adds memoization to your components for you. It works out which values in a component can change between renders, and caches everything else, so in the components it can compile you no longer write \`useMemo\`, \`useCallback\` or \`React.memo\` by hand. It reached **1.0 on 7 October 2025**, works with React 17, 18 and 19, and is production-ready for React and React Native.\r
\r
**The problem it solves.** A component re-runs on every render. Objects, arrays and functions created inside it are new each time, so a \`memo\` child sees "new" props and re-renders, and an effect with that value in its dependency array re-runs. The manual fix, wrapping values in \`useMemo\`/\`useCallback\` and children in \`memo\`, is tedious, easy to get subtly wrong (one unstable prop defeats it), and clutters the code (§13.2, Q64). The compiler does that bookkeeping for you, and more precisely.\r
\r
**What it actually outputs.** Take this component:\r
\r
\`\`\`text\r
function Greeting({ user, onLogout }) {\r
  const name = user.firstName + ' ' + user.lastName;\r
  return <Header title={name} onLogout={onLogout} />;\r
}\r
\`\`\`\r
\r
The compiled version (simplified) keeps a small **cache array per component instance**, and recomputes each piece only when the values it depends on have changed:\r
\r
\`\`\`text\r
import { c as _c } from 'react/compiler-runtime';\r
\r
function Greeting({ user, onLogout }) {\r
  const $ = _c(5);                       // a cache with 5 slots, kept between renders\r
  let name;\r
  if ($[0] !== user) {                   // user changed? recompute and store\r
    name = user.firstName + ' ' + user.lastName;\r
    $[0] = user; $[1] = name;\r
  } else {\r
    name = $[1];                          // unchanged: reuse the cached value\r
  }\r
  let header;\r
  if ($[2] !== name || $[3] !== onLogout) {\r
    header = <Header title={name} onLogout={onLogout} />;\r
    $[2] = name; $[3] = onLogout; $[4] = header;\r
  } else {\r
    header = $[4];                        // same element object, so React skips Header\r
  }\r
  return header;\r
}\r
\`\`\`\r
\r
Two things follow from that shape, and they are why it is better than hand-written memoization:\r
\r
- **It is finer-grained.** It caches individual values and individual JSX elements, not just whatever you happened to wrap in a hook. Returning the *same element object* is what lets React skip re-rendering \`Header\`, without \`Header\` being wrapped in \`memo\`.\r
- **It can memoize after an early return.** Hooks cannot be called conditionally, so \`useMemo\` can never come after \`if (!props.items) return null;\`. The compiler is not a hook, so it can.\r
\r
**How it works.** It ships as a Babel plugin but does its own analysis: it turns your code into an internal representation (a control-flow graph, which it calls HIR) and runs data-flow analysis over it to learn which values each piece depends on and which of them can change. That is how it knows \`name\` only depends on \`user\`.\r
\r
**The rules it depends on, and what happens when you break them.** This is the part interviewers press on. The compiler only optimises a component when its analysis shows the component follows the **Rules of React**:\r
\r
- **Pure rendering:** same props and state in, same JSX out; no side effects while rendering.\r
- **No mutation** of props, state or hook return values, such as pushing into a prop array during render.\r
- **Rules of Hooks:** hooks at the top level, in the same order every render (Q47).\r
\r
When it cannot prove a component follows them, it **skips that component and leaves it as it was**. Nothing crashes. The component just gets no benefit, silently, which is easy to miss. That makes adopting the compiler mostly a lint exercise. The compiler's checks are built into **\`eslint-plugin-react-hooks\`** (7.x at the time of writing; its \`recommended\` preset includes them, and \`recommended-latest\` adds newer experimental ones), so the linter points at the code that would be skipped.\r
\r
**Setting it up.** Install it with an exact version:\r
\r
\`\`\`text\r
npm install --save-dev --save-exact babel-plugin-react-compiler@latest\r
\`\`\`\r
\r
\`--save-exact\` is deliberate. A future compiler version may memoize at a different granularity, and if some component quietly breaks the rules, that can change how often an effect fires. Pin the version and upgrade on purpose, with tests.\r
\r
- **Vite 8 (\`@vitejs/plugin-react\` v6, which no longer runs Babel itself):** add Babel back just for the compiler.\r
\r
  \`\`\`text\r
  // vite.config.js\r
  import { defineConfig } from 'vite';\r
  import react, { reactCompilerPreset } from '@vitejs/plugin-react';\r
  import babel from '@rolldown/plugin-babel';   // npm install -D @rolldown/plugin-babel\r
\r
  export default defineConfig({\r
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],\r
  });\r
  \`\`\`\r
\r
- **Older Vite (\`@vitejs/plugin-react\` v5 and earlier):** \`react({ babel: { plugins: ['babel-plugin-react-compiler'] } })\`.\r
- **Next.js:** \`reactCompiler: true\` in \`next.config\`. **Expo SDK 54+:** on by default.\r
- **React 17 or 18:** also install \`react-compiler-runtime\` and set the compiler's \`target\` option to your React version.\r
\r
**Checking that it worked.** In React DevTools, compiled components show a **"Memo ✨"** badge next to their name. A component without the badge was skipped, which is your cue to look at what the linter says about it. To exclude one component on purpose (while you fix it, for example), put the directive \`"use no memo";\` as the first line of its body.\r
\r
**Rolling it out on an existing app:**\r
\r
1. Turn on the lint rules and fix what they report: mutation during render, side effects in render, conditional hooks.\r
2. Enable the compiler, either everywhere or for one directory first.\r
3. Check the ✨ badges on your important screens, and profile before and after (Q20).\r
4. **Leave existing \`useMemo\`/\`useCallback\` alone.** They do no harm with the compiler on, and removing them in bulk is a large, risky diff that can change what gets memoized. Stop adding new ones, and remove old ones only when you are already editing that code.\r
\r
Meta reported that on the Quest Store, initial loads and page navigations became up to **12%** faster and some interactions over **2.5×** faster, with memory use unchanged.\r
\r
**What it does not do.** It does not replace \`useTransition\`/\`useDeferredValue\` (those decide *when* work runs), virtualisation (too many DOM nodes) or code splitting (too much JavaScript). It cannot help a component that re-renders because its parent passes a genuinely new value each time, such as a context provider that builds a fresh object on every render from state that really changed. And \`useMemo\`/\`useRef\` still have a job when an outside API needs the *same* object across renders as a matter of correctness, not speed (Q27).\r
\r
---\r
\r
### 16.2 Actions and useActionState\r
\r
In React 19, an **Action** is an async function that React runs inside a transition — typically the function that handles a form submission or a mutation. Because React is running it, React can track whether it is still pending and what it returned, which replaces the \`isLoading\` / \`error\` \`useState\` pair you would otherwise write by hand for every form. \`useActionState\` is the hook that exposes that tracking.\r
\r
\`\`\`tsx\r
function UpdateName() {\r
  const [error, submitAction, isPending] = useActionState(\r
    async (previousState, formData) => {\r
      const error = await updateName(formData.get('name'));\r
      if (error) return error;\r
      redirect('/profile');\r
      return null;\r
    },\r
    null\r
  );\r
\r
  return (\r
    <form action={submitAction}>\r
      <input name="name" />\r
      <button disabled={isPending}>Update</button>\r
      {error && <p>{error}</p>}\r
    </form>\r
  );\r
}\r
\`\`\`\r
\r
The contract: pass an async function and an initial state; React gives you back the latest returned state, an action you wire to \`<form action>\` (or any element accepting an action), and an \`isPending\` flag. No more \`useState\` for the loading flag, no more \`try/catch\` for the error, no more "wait, did I forget to setLoading(false)?". The interview signal: know the *concept* — async transitions tied to form submission — even if the exact API is new to you.\r
\r
### 16.3 useFormStatus\r
\r
The companion to \`useActionState\`. It reads the submission status of the **nearest enclosing \`<form>\` from inside any descendant component** — without prop-drilling.\r
\r
\`\`\`tsx\r
import { useFormStatus } from 'react-dom';\r
\r
// stand-in so this example runs on its own: a fake server call that takes a second\r
const updateProfile = (formData: FormData) => new Promise((resolve) => setTimeout(resolve, 1000));\r
\r
function SubmitButton() {\r
  const { pending } = useFormStatus();\r
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;\r
}\r
\r
function ProfileForm() {\r
  return (\r
    <form action={updateProfile}>\r
      <input name="name" />\r
      <SubmitButton />          {/* knows the form is submitting */}\r
    </form>\r
  );\r
}\r
\`\`\`\r
\r
This is what makes Actions composable. You can build a \`<SubmitButton>\` once and drop it into any form; it picks up the form's submission state automatically. Pre-19, you'd have prop-drilled the loading flag from the form to every nested button.\r
\r
The triad to remember as one concept: **\`useActionState\`** (form-level state machine), **\`useFormStatus\`** (descendant access to that state), **\`useOptimistic\`** (instant UI while the action is in flight) — together they're the modern form story.\r
\r
### 16.4 use() Hook\r
\r
\`use\` reads a resource — a promise or a context — during render. It is the one API in React that is **not bound by the rules of hooks**: it can be called inside an \`if\`, inside a loop, or after an early return.\r
\r
That exemption is not an inconsistency. The rules exist because \`useState\` and friends are matched to their stored state **by call order** (see Q47), so a conditional hook shifts every slot after it. \`use\` reserves no slot — a promise identifies itself, and a context is looked up on the fiber — so there is no ordering to corrupt.\r
\r
\`\`\`tsx\r
// stand-ins so this example runs on its own\r
const ThemeContext = createContext('dark');\r
const commentsPromise = new Promise<Comment[]>((resolve) =>\r
  setTimeout(() => resolve([{ id: 1, text: 'First!' }, { id: 2, text: 'Great post' }]), 500));\r
\r
// Read a promise during render (with Suspense)\r
function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {\r
  const comments = use(commentsPromise);   // suspends until it resolves\r
  return comments.map(c => <p key={c.id}>{c.text}</p>);\r
}\r
\r
// Read context (can be called conditionally, unlike useContext)\r
function Theme({ isEnabled }: { isEnabled: boolean }) {\r
  if (isEnabled) {\r
    const theme = use(ThemeContext);\r
    return <div className={theme}>Theme: {theme}</div>;\r
  }\r
  return null;\r
}\r
\r
function Demo() {\r
  return (\r
    <Suspense fallback={<p>Loading comments…</p>}>\r
      <Comments commentsPromise={commentsPromise} />\r
      <Theme isEnabled />\r
    </Suspense>\r
  );\r
}\r
render(<Demo />);\r
\`\`\`\r
\r
**With a promise, \`use\` suspends.** The component stops rendering, the nearest \`<Suspense>\` shows its fallback, and React retries when the promise resolves. A rejection propagates to the nearest error boundary. So the loading and error states are the boundaries you already have, not two more pieces of component state.\r
\r
**The pitfall that costs people an afternoon: never create the promise during render.**\r
\r
\`\`\`text\r
// ✗ Infinite loop. A new promise every render, so \`use\` suspends every render.\r
function Comments() {\r
  const comments = use(fetch('/api/comments').then(r => r.json()));\r
  return comments.map(/* … */);\r
}\r
\r
// ✓ The promise is created outside the render — passed in as a prop…\r
<Comments commentsPromise={commentsPromise} />\r
\r
// …or returned from a cache that gives back the SAME promise for the same key\r
const commentsPromise = getCachedComments(postId);\r
\`\`\`\r
\r
React has to be able to recognise the promise it suspended on. A fresh one each render is a different identity every time, so it suspends, re-renders, creates another, and never settles. In practice the promise comes from a Server Component, a framework loader, or a cache — which is why \`use\` feels natural in Next.js and awkward in a bare client component.\r
\r
**Two more limits worth knowing.** \`use\` cannot be called inside \`try\`/\`catch\` — use an error boundary instead. And \`use(Context)\` is otherwise identical to \`useContext(Context)\`; reach for it only when you actually need the conditional call, because \`useContext\` is the more familiar signal to a reader.\r
\r
---\r
\r
### 16.5 useOptimistic\r
\r
\`useOptimistic\` shows a provisional result **immediately**, while the real request is still in flight, and throws that provisional state away automatically once the truth arrives.\r
\r
The automatic part is the whole value. Hand-rolled optimistic UI means holding a second copy of the list, merging it with the real one, and — the part that always rots — unwinding it correctly when the request fails. \`useOptimistic\` reverts on its own, on success *and* on error, because the optimistic value only exists for the lifetime of the action.\r
\r
\`\`\`tsx\r
// stand-in so this example runs on its own: a fake server call\r
const api = { createTodo: (todo: { title: string }) => new Promise((resolve) => setTimeout(resolve, 1000)) };\r
\r
function TodoList({ todos }: { todos: Todo[] }) {\r
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(\r
    todos,\r
    (state, newTodo: Todo) => [...state, { ...newTodo, pending: true }]\r
  );\r
\r
  async function addTodo(formData: FormData) {\r
    const title = formData.get('title') as string;\r
    // A temporary id so the optimistic row has a stable key of its own.\r
    // Without one, key={todo.id} is undefined and React warns on every render.\r
    addOptimisticTodo({ id: \`temp-\${crypto.randomUUID()}\`, title });\r
    await api.createTodo({ title });         // the server assigns the real id\r
  }\r
\r
  return (\r
    <form action={addTodo}>\r
      <input name="title" />\r
      <ul>\r
        {optimisticTodos.map(todo => (\r
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>\r
            {todo.title}\r
          </li>\r
        ))}\r
      </ul>\r
    </form>\r
  );\r
}\r
\r
// The todos prop is never refreshed here, so a new row fades in and then\r
// disappears when the action ends: the failure mode described below.\r
render(<TodoList todos={[{ id: '1', title: 'Read about useOptimistic' }]} />);\r
\`\`\`\r
\r
**How the two arguments work.** The first is the real state — whatever you would render if nothing were pending. The second is a reducer, \`(currentState, optimisticValue) => nextState\`, and it must be pure: return a new array, never push into \`state\`. While no action is running, \`optimisticTodos\` **is** \`todos\`; the reducer is not involved at all.\r
\r
**\`addOptimisticTodo\` only works inside an Action or a transition.** Called outside one — a bare click handler that is not a \`startTransition\`, for instance — the optimistic value is applied and then discarded on the very next render, so the UI flickers and snaps back. Here the \`<form action={addTodo}>\` makes \`addTodo\` an Action, which is what scopes the optimistic state to it.\r
\r
**The failure mode to watch for: the real state never catches up.** The optimistic entry disappears when the action ends, whichever way it ended. If the server succeeded but your \`todos\` prop was not refreshed — no revalidation, no refetch — the row vanishes a moment after it appeared, and it looks exactly like a failed write. The optimistic update is a *bridge* to the real state arriving; if nothing is coming, there is nothing to bridge to.\r
\r
---\r
\r
### 16.6 \`<Activity />\` — Hide UI Without Destroying It\r
\r
Shipped stable in **React 19.2**. \`<Activity />\` lets you mark a part of the tree as \`visible\` or \`hidden\`. A hidden activity **keeps its state** but has its **effects destroyed** — so timers stop, subscriptions close, and nothing keeps running in the background. When it becomes visible again, React restores the saved state and **re-creates the effects**.\r
\r
\`\`\`tsx\r
// stand-ins so this example runs on its own\r
const HomeTab = () => <p>Home</p>;\r
const SearchTab = () => <input placeholder="Type here, switch tabs, come back" />;\r
\r
function App() {\r
  const [tab, setTab] = useState('home');\r
\r
  return (\r
    <>\r
      <button onClick={() => setTab('home')}>Home</button>\r
      <button onClick={() => setTab('search')}>Search</button>\r
      <Activity mode={tab === 'home' ? 'visible' : 'hidden'}>\r
        <HomeTab />\r
      </Activity>\r
      <Activity mode={tab === 'search' ? 'visible' : 'hidden'}>\r
        <SearchTab />   {/* scroll position and input text survive tab switches */}\r
      </Activity>\r
    </>\r
  );\r
}\r
\`\`\`\r
\r
**Why this is not just \`display: none\`, and not just conditional rendering.** The three options differ on exactly two axes — does state survive, and do effects keep running:\r
\r
| Approach | State | Effects | DOM |\r
|---|---|---|---|\r
| \`{cond && <Tab />}\` | **destroyed** | unmounted | removed |\r
| \`style={{ display: cond ? 'block' : 'none' }}\` | preserved | **keep running** | kept |\r
| \`<Activity mode={…}>\` | **preserved** | **destroyed** | kept, hidden |\r
\r
Conditional rendering loses the user's scroll position, half-typed input and fetched data on every switch. CSS hiding keeps all of that but leaves intervals ticking, subscriptions open and polling running for a panel nobody can see. \`<Activity />\` is the combination that was previously impossible to express: **state preserved, effects torn down.**\r
\r
Two details that matter in practice. First, a hidden activity is **not frozen** — "children still re-render in response to new props, albeit at a lower priority than the rest of the content." So it is cheap, not free, and the low priority is what keeps pre-rendering a likely-next tab from delaying what is on screen. Second, hiding is implemented with \`display: none\`, which means a component that renders only text produces no DOM output when hidden (there is no element to apply the style to).\r
\r
The two canonical uses:\r
\r
1. **Preserving state across navigation** — tabs, wizards, a list you return to from a detail page.\r
2. **Pre-rendering a likely next screen** so its data and code are already warm when the user arrives.\r
\r
Traps to watch for. Because effects are destroyed, a hidden \`Activity\` does **not** keep a WebSocket alive or continue polling — if a hidden panel genuinely must keep receiving data, that subscription belongs *above* the \`Activity\` boundary. And because effect cleanup is what stops work, any effect inside an \`Activity\` needs a correct cleanup function or hiding leaks. For teardown that must be tied to the *visual* hide (pausing a video, for instance), use \`useLayoutEffect\` cleanup so it runs before the frame in which the content disappears.\r
\r
---\r
\r
### 16.7 \`useEffectEvent\` — Non-Reactive Logic Inside Effects\r
\r
Also stable in **React 19.2**, and the direct answer to the single most common \`useEffect\` complaint: *"I need to read the latest value of something, but I don't want the effect to re-run when it changes."*\r
\r
Consider a chat room that connects to a socket and shows a toast on connect:\r
\r
\`\`\`tsx\r
// stand-ins so this example runs on its own\r
const createConnection = (roomId) => {\r
  let onConnected = () => {};\r
  return {\r
    on: (_event, fn) => { onConnected = fn; },\r
    connect: () => { console.log('connect', roomId); setTimeout(() => onConnected(), 100); },\r
    disconnect: () => console.log('disconnect', roomId),\r
  };\r
};\r
const showToast = (message, theme) => console.log(message, '(' + theme + ' toast)');\r
\r
// The problem: theme is used in the callback, so the linter demands it in deps —\r
// and now changing the theme tears down and rebuilds the connection.\r
function ChatRoom({ roomId, theme }) {\r
  useEffect(() => {\r
    const conn = createConnection(roomId);\r
    conn.on('connected', () => showToast('Connected!', theme));\r
    conn.connect();\r
    return () => conn.disconnect();\r
  }, [roomId, theme]);   // ← theme should not be here, but removing it lies to the linter\r
}\r
\r
function Demo() {\r
  const [theme, setTheme] = useState('light');\r
  return (\r
    <>\r
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Theme: {theme}</button>\r
      <ChatRoom roomId="general" theme={theme} />\r
    </>\r
  );\r
}\r
render(<Demo />);\r
\`\`\`\r
\r
Every workaround for this was bad. Omitting \`theme\` from the deps array suppresses a real warning and captures a stale value. Adding it reconnects the socket on an unrelated UI change. A \`useRef\` mirror of \`theme\` works but is three lines of ceremony per value and is easy to get out of sync.\r
\r
\`useEffectEvent\` splits the callback into a **reactive** part (the effect) and a **non-reactive** part (the event):\r
\r
\`\`\`tsx\r
// stand-ins so this example runs on its own\r
const createConnection = (roomId) => {\r
  let onConnected = () => {};\r
  return {\r
    on: (_event, fn) => { onConnected = fn; },\r
    connect: () => { console.log('connect', roomId); setTimeout(() => onConnected(), 100); },\r
    disconnect: () => console.log('disconnect', roomId),\r
  };\r
};\r
const showToast = (message, theme) => console.log(message, '(' + theme + ' toast)');\r
\r
function ChatRoom({ roomId, theme }) {\r
  const onConnected = useEffectEvent(() => {\r
    showToast('Connected!', theme);   // always reads the latest theme\r
  });\r
\r
  useEffect(() => {\r
    const conn = createConnection(roomId);\r
    conn.on('connected', () => onConnected());\r
    conn.connect();\r
    return () => conn.disconnect();\r
  }, [roomId]);   // ← honest and complete: only roomId is reactive\r
}\r
\r
function Demo() {\r
  const [theme, setTheme] = useState('light');\r
  return (\r
    <>\r
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Theme: {theme}</button>\r
      <ChatRoom roomId="general" theme={theme} />\r
    </>\r
  );\r
}\r
render(<Demo />);\r
\`\`\`\r
\r
The function returned by \`useEffectEvent\` is **stable across renders** (so it never needs to be a dependency) but its body always sees the **latest** props and state (so it is never stale). It gives you the two properties that \`useCallback\` and \`useRef\` could only ever give you one of at a time.\r
\r
Rules that come up as interview questions:\r
\r
- It may only be **called from inside an effect** (or another effect event), never during render and never passed to a child as a prop. Doing so is a lint error, because a value that is stable *and* always-fresh has no consistent meaning during render.\r
- The linter in \`eslint-plugin-react-hooks\` (6.1 and later) **knows** about it and correctly omits effect events from dependency arrays — that tooling support is what makes it usable rather than another footgun.\r
- The mental test: *does this logic describe when to synchronise (reactive → dependency), or what to do when something happens (non-reactive → effect event)?* Connecting to \`roomId\` is synchronisation. Showing a toast is an event.\r
\r
This complements — not replaces — §7.4's advice. The first question is still "should this be an effect at all?" \`useEffectEvent\` is for the effects that survive that question.\r
\r
---\r
\r
### 16.8 React 19.2's Rendering and SSR Changes\r
\r
Several 19.2 changes are invisible in application code but are exactly what a senior interview probes.\r
\r
**Partial Pre-rendering.** A new pair of APIs lets you pre-render the static shell of a page at build time, then *resume* rendering the dynamic parts later — at request time on a server, or during a subsequent build. You \`prerender()\` with an \`AbortController\`, which stops rendering at the dynamic boundaries and hands back both the static HTML and a serialisable "postponed" state; later, \`resume()\` / \`resumeToPipeableStream()\` (SSR) or \`resumeAndPrerender()\` (SSG) picks up exactly where it left off.\r
\r
\`\`\`jsx\r
// Build time — render the static shell, abort at dynamic boundaries\r
const controller = new AbortController();\r
const { prelude, postponed } = await prerender(<App />, { signal: controller.signal });\r
\r
// Request time — resume from the saved state\r
const stream = await resume(<App />, postponed);\r
\`\`\`\r
\r
The point is that a page no longer has to be *entirely* static or *entirely* dynamic. The shell is served instantly from a CDN, and only the personalised holes are computed per request. This is the primitive underneath Next.js's PPR.\r
\r
**Batched Suspense reveals in SSR.** Previously, server-rendered \`Suspense\` boundaries revealed themselves one at a time as each one's HTML arrived, while client-rendered boundaries batched their reveals. That inconsistency produced visible layout thrash on streamed pages, and it made animating a reveal impossible. 19.2 batches server reveals to match client behaviour — fewer, larger paint steps, and a coherent target for \`<ViewTransition>\` to animate.\r
\r
**Web Streams in Node.** \`renderToReadableStream()\` and \`prerender()\` now work under Node, though the Node Streams APIs remain the recommended choice there. This matters for code that must run on both Node and an edge runtime.\r
\r
**\`cacheSignal()\`** (React Server Components only) gives you an \`AbortSignal\` that fires when a \`cache()\` lifetime ends, so you can abort in-flight work instead of leaking it:\r
\r
\`\`\`js\r
async function getData(id) {\r
  return fetch(\`/api/\${id}\`, { signal: cacheSignal() });\r
}\r
\`\`\`\r
\r
**Performance Tracks.** React now emits custom tracks into the Chrome DevTools performance panel — a **Scheduler** track showing what React was working on at each priority, and a **Components** track showing which components rendered and for how long. Being able to say "I'd open the Scheduler track to see whether the work was being starved by a higher-priority lane, rather than guessing from the flame chart" is a strong performance-debugging answer.\r
\r
**\`useId\` prefix change.** The generated prefix moved from \`:r:\` to \`_r_\`. The old form contained a colon, which is invalid in XML 1.0 and — more practically — is not a valid \`view-transition-name\`, so it blocked View Transitions. Only relevant if you had snapshot tests asserting on generated IDs, which is itself a bad idea.\r
\r
---\r
\r
### 16.9 What React 19 Changed — Removals, Migrations and Behaviour\r
\r
The subsections above cover what React 19 **added**. This one covers what it **changed or removed**, which is what an upgrade actually runs into and what "what's new in React 19?" is usually probing.\r
\r
#### Removed\r
\r
| Removed | Replacement | Codemod |\r
|---|---|---|\r
| **\`findDOMNode\`** | a \`ref\` on the element | — |\r
| **String refs** (\`ref="input"\`) | callback refs — \`ref={el => this.input = el}\` | \`react/19/replace-string-ref\` |\r
| **Legacy context** (\`contextTypes\`, \`getChildContext\`) | \`createContext\` + \`static contextType\` | — |\r
| **\`propTypes\`** | TypeScript. **Silently ignored** in 19 — no warning | \`react/prop-types-typescript\` |\r
| **\`defaultProps\` on function components** | ES6 default parameters. **Classes keep \`defaultProps\`** | — |\r
| **\`ReactDOM.render\`** | \`createRoot(el).render(…)\` | \`react/19/replace-reactdom-render\` |\r
| **\`ReactDOM.hydrate\`** | \`hydrateRoot(el, …)\` | as above |\r
| **\`unmountComponentAtNode\`** | \`root.unmount()\` | as above |\r
| **\`react-test-utils\`** | React Testing Library | — |\r
\r
The two that catch people out: **\`propTypes\` is ignored rather than removed loudly**, so runtime prop validation you thought you had silently stopped working; and **\`defaultProps\` still works on classes** but not on function components, so the same removal bites differently depending on the component kind.\r
\r
#### No lifecycle methods were removed\r
\r
Worth stating plainly, because it's a common assumption. Every class lifecycle method still works in React 19: \`constructor\`, \`getDerivedStateFromProps\`, \`render\`, \`componentDidMount\`, \`shouldComponentUpdate\`, \`getSnapshotBeforeUpdate\`, \`componentDidUpdate\`, \`componentWillUnmount\`, \`getDerivedStateFromError\`, \`componentDidCatch\`. The three \`UNSAFE_*\` methods are still documented too, described as existing "for historical reasons" — see §3 for why they're unsafe under concurrent rendering.\r
\r
React 19 says **"class components are still supported, but we don't recommend using them in new code"** — discouraged, not deprecated. Error boundaries remain the one thing that still *requires* a class.\r
\r
#### Deprecated by replacement\r
\r
Two long-standing APIs now have simpler forms, with the old ones slated for removal:\r
\r
\`\`\`jsx\r
// ref is a normal prop — forwardRef is no longer needed\r
function MyInput({ placeholder, ref }) {\r
  return <input placeholder={placeholder} ref={ref} />;\r
}\r
\r
function Demo() {\r
  const inputRef = useRef(null);\r
  return (\r
    <>\r
      <MyInput placeholder="Name" ref={inputRef} />\r
      <button onClick={() => inputRef.current.focus()}>Focus the input</button>\r
    </>\r
  );\r
}\r
render(<Demo />);\r
\`\`\`\r
\r
Note \`ref\` on a **class** component is still the instance, not a prop.\r
\r
\`\`\`jsx\r
// <Context> is its own provider\r
const ThemeContext = createContext('');\r
\r
function App() {\r
  return (\r
    // not <ThemeContext.Provider>\r
    <ThemeContext value="dark">\r
      <Toolbar />\r
    </ThemeContext>\r
  );\r
}\r
\r
function Toolbar() {\r
  return <p>Theme: {useContext(ThemeContext)}</p>;\r
}\r
render(<App />);\r
\`\`\`\r
\r
Both have codemods, and both old forms (\`forwardRef\`, \`<Context.Provider>\`) will be removed in a future major.\r
\r
#### Ref cleanup functions\r
\r
A ref callback can now **return a cleanup function**, which React calls on unmount:\r
\r
\`\`\`jsx\r
<input\r
  ref={(node) => {\r
    const observer = new ResizeObserver(onResize);\r
    observer.observe(node);\r
    return () => observer.disconnect();      // NEW\r
  }}\r
/>\r
\`\`\`\r
\r
This deprecates the old pattern of React calling your ref with \`null\` on unmount. One TypeScript consequence: **implicit returns are now rejected**, because a returned value is interpreted as a cleanup function — so \`ref={el => (this.input = el)}\` must become \`ref={el => { this.input = el; }}\` with a block body. That's a real upgrade error people hit.\r
\r
#### Behavioural improvements\r
\r
- **Document metadata hoists automatically.** Rendering \`<title>\`, \`<meta>\` or \`<link>\` anywhere in a component moves it to \`<head>\` — client, streaming SSR and Server Components alike. Removes the need for \`react-helmet\` in simple cases.\r
- **Stylesheet precedence.** \`<link rel="stylesheet" precedence="high" />\` lets React manage insertion order and deduplicate across components, which prevents FOUC.\r
- **Async scripts anywhere.** \`<script async src="…" />\` can be rendered in any component and is deduplicated automatically.\r
- **Resource preloading APIs** from \`react-dom\`: \`prefetchDNS\`, \`preconnect\`, \`preload\`, \`preinit\` — prioritised by utility rather than call order. See the [Web Performance guide](/frontend/web-performance) for when each is appropriate, and note a preloaded font needs \`crossorigin\` or it downloads twice.\r
- **Hydration errors now show a diff** in a single consolidated message rather than three vague warnings, so a mismatch tells you which node differed.\r
- **\`useDeferredValue\` takes an \`initialValue\`** — \`useDeferredValue(value, '')\` returns the initial value on first render, then schedules a re-render with the real one.\r
\r
#### Upgrade order that works\r
\r
1. Upgrade to **18.3 first** — it's 18.2 plus the deprecation warnings, so you fix them without a behaviour change.\r
2. Run the codemods: \`npx codemod@latest react/19/migration-recipe\`.\r
3. Replace \`propTypes\` with TypeScript, since it now fails silently.\r
4. Switch \`ReactDOM.render\` → \`createRoot\`, and check for \`findDOMNode\` and string refs in older code.\r
5. Fix TypeScript ref callbacks with implicit returns.\r
6. Only then adopt the new APIs (§16.1–16.8).\r
\r
---\r
\r
### 16.10 Where React Actually Is — Versions and Experimental Status\r
\r
Interviewers ask this to check whether you follow the ecosystem or repeat old blog posts. As of September 2026:\r
\r
| Feature | Status |\r
|---|---|\r
| **Latest stable** | React **19.3** (9 September 2026). Before it, 19.2 (October 2025) and its patch releases |\r
| **\`<ViewTransition>\`, \`addTransitionType\`, Fragment Refs** | **Stable in 19.3** (they were Canary-only through 19.2) |\r
| **\`browser()\` in \`react-dom\`, Trusted Types support** | **New and stable in 19.3** |\r
| **\`<Activity />\`, \`useEffectEvent\`, \`cacheSignal\`, Partial Pre-rendering** | Stable since 19.2 |\r
| **React Compiler** | **1.0, stable** (October 2025). Opt-in; on by default in Expo SDK 54+ |\r
| **\`eslint-plugin-react-hooks\`** | **7.x**. Flat config is the default preset; \`recommended\` includes the compiler-powered rules |\r
| **Governance** | React moved to the **React Foundation**, hosted by the Linux Foundation (February 2026) |\r
\r
**The trap in this area is dates.** A great deal of writing from 2025 and early 2026 correctly said \`<ViewTransition>\` was experimental, and it is now stable. The reverse mistake was just as common before September 2026: treating it as shipped because it appeared in React Labs posts. When you mention a React feature in an interview, say which version it arrived in. §16.11 covers what 19.3 added.\r
\r
---\r
\r
### 16.11 React 19.3 — What's New (September 2026)\r
\r
**Short answer:** 19.3 is mostly about **animation and DOM control**. \`<ViewTransition>\` animates elements as they enter, leave, move or change, using the browser's View Transitions API; Fragment Refs let you reach the DOM nodes of a group of siblings without adding a wrapper element; \`browser()\` marks a component as client-only during server rendering; and React now works with the browser's Trusted Types protection against XSS. There are no removals or breaking changes.\r
\r
#### \`<ViewTransition>\`: animate UI changes\r
\r
Wrap part of the tree in \`<ViewTransition>\` and React animates it when a **Transition** changes it. By default the animation is a cross-fade; you customise it with CSS.\r
\r
\`\`\`tsx\r
// In a real file: import { ViewTransition, startTransition, useState } from 'react';\r
const PHOTOS = [\r
  { id: 'p1', label: 'Mountains', color: '#2563eb' },\r
  { id: 'p2', label: 'Forest', color: '#16a34a' },\r
  { id: 'p3', label: 'Desert', color: '#d97706' },\r
];\r
\r
function Gallery() {\r
  const [index, setIndex] = useState(0);\r
  const photo = PHOTOS[index];\r
  // A Transition, so <ViewTransition> animates it. A plain setIndex would not.\r
  const next = () => startTransition(() => setIndex((i) => (i + 1) % PHOTOS.length));\r
\r
  return (\r
    <div>\r
      {/* A new key means the old slide EXITS and the new one ENTERS, so React cross-fades them. */}\r
      <ViewTransition key={photo.id}>\r
        <div style={{ width: 240, height: 140, borderRadius: 8, background: photo.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20 }}>\r
          {photo.label}\r
        </div>\r
      </ViewTransition>\r
      <button onClick={next} style={{ marginTop: 12 }}>Next</button>\r
    </div>\r
  );\r
}\r
\r
render(<Gallery />);\r
\`\`\`\r
\r
What makes it different from animating by hand:\r
\r
- **It animates four kinds of change:** *enter* (the \`<ViewTransition>\` was added), *exit* (it was removed, and React keeps it on screen long enough to animate it out, which is the part that is hard to do yourself), *update* (its contents changed) and *share* (an element with the same \`name\` disappears in one place and appears in another, such as a thumbnail growing into a full-size image).\r
- **It only runs for updates marked as Transitions:** \`startTransition\`, a \`<Suspense>\` boundary revealing its content, or \`useDeferredValue\`. An ordinary \`setState\` does not animate. That is deliberate: urgent updates such as typing should never wait for an animation.\r
- **It works with Suspense.** A \`<ViewTransition>\` around a \`<Suspense>\` boundary animates the switch from the fallback to the real content. The recommended pattern is: the fallback appears straight away with no animation, and the switch to the loaded content animates.\r
- **\`addTransitionType('next')\`** inside \`startTransition\` labels *why* the change happened, so the same update can slide left for "next" and right for "previous", with \`enter\`/\`exit\` props mapping each type to a CSS class.\r
\r
It is DOM-only for now; React Native support is in progress. Before 19.3, the way to do this was the browser's \`document.startViewTransition()\` driven from your router, which still works and is covered in the Modern CSS guide.\r
\r
#### Fragment Refs: reach a group of elements without a wrapper\r
\r
A component that renders several siblings has no single DOM node to put a ref on, and adding a wrapper \`<div>\` can break a flex or grid layout. In 19.3, \`<Fragment ref={ref}>\` gives you a **FragmentInstance** that acts on its children:\r
\r
\`\`\`tsx\r
// In a real file: import { Fragment, useRef, useEffect } from 'react';\r
function ResultRow({ item }) {\r
  return <button style={{ display: 'block', margin: '4px 0' }}>{item.title}</button>;\r
}\r
\r
function Results({ items }) {\r
  const groupRef = useRef(null);\r
  useEffect(() => {\r
    groupRef.current.focus();                    // focuses the first focusable child: "First result"\r
  }, []);\r
  return (\r
    <Fragment ref={groupRef}>\r
      {items.map((item) => <ResultRow key={item.id} item={item} />)}\r
    </Fragment>\r
  );\r
}\r
\r
render(<Results items={[{ id: 1, title: 'First result' }, { id: 2, title: 'Second result' }]} />);\r
\`\`\`\r
\r
A FragmentInstance can \`addEventListener\`/\`removeEventListener\` on all its children, \`focus()\`/\`focusLast()\`/\`blur()\`, attach an \`IntersectionObserver\` or \`ResizeObserver\` with \`observeUsing()\`, and measure or scroll (\`getClientRects()\`, \`scrollIntoView()\`). The benefit is attaching behaviour to children you did not write, without changing their DOM.\r
\r
#### \`browser()\`: client-only components without hydration errors\r
\r
Some components can only render in the browser: they read \`localStorage\`, \`window\`, or the user's time zone. Rendering them on the server either crashes or produces HTML that does not match the client, which is a hydration mismatch (Q35). The usual workaround was a \`mounted\` flag set in an effect, which renders twice.\r
\r
\`\`\`tsx\r
// In a real file: import { use, Suspense } from 'react'; import { browser } from 'react-dom';\r
function LocalTime() {\r
  use(browser());                                // on the server: suspend, show the Suspense fallback\r
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;\r
  return <p>Your time zone: {zone}</p>;\r
}\r
\r
render(\r
  <Suspense fallback={<p>Loading your time zone…</p>}>\r
    <LocalTime />\r
  </Suspense>\r
);\r
\`\`\`\r
\r
On the server, \`use(browser())\` suspends, so the nearest \`<Suspense>\` fallback is sent in the HTML. On the client it does nothing, and the component renders normally. Like \`use\`, it can be called after an early return or inside a condition.\r
\r
#### Trusted Types\r
\r
Trusted Types is a browser feature that, when a site enables it with a Content Security Policy header, refuses to let raw strings reach dangerous places such as \`innerHTML\`. Only values created by an approved policy are allowed. Until 19.3, React converted every value to a plain string first, which stripped that approval and broke the protection. React now passes \`TrustedHTML\`, \`TrustedScript\` and \`TrustedScriptURL\` through unchanged, so a site can enforce Trusted Types and still use \`dangerouslySetInnerHTML\` safely (the Web Security guide covers Trusted Types).\r
\r
#### Smaller changes worth knowing\r
\r
- **Server Components can render a context directly:** \`<UserContext value={user}>\` from a Server Component, with no separate \`'use client'\` Provider wrapper.\r
- **Transitions render independently** instead of being merged into one render, so a slow transition no longer holds back an unrelated one.\r
- **StrictMode double-invokes effects during hydration** too, matching client-rendered apps, so the Q74 checks now cover server-rendered pages.\r
- **A warning when \`use\` is called incorrectly inside a condition.**\r
- **React DOM:** \`onFullscreenChange\`/\`onFullscreenError\` events, \`onReset\` when React resets a form after an action, \`submit\` events include the \`submitter\`, and \`resize\` updates are batched until the next frame.\r
- Many fixes, including \`useDeferredValue\` getting stuck on an old value and \`useEffectEvent\` reading stale values inside \`memo\` and \`forwardRef\` components.\r
\r
**Upgrading:** 19.3 adds features without removing anything, so moving from 19.2 is a version bump. If you were on a Canary build to use \`<ViewTransition>\`, you can move back to a stable release.\r
\r
---\r
\r
## 17. Interview Questions & Answers\r
\r
### Beginner\r
\r
---\r
\r
**Q1: What is the Virtual DOM?**\r
\r
**Short answer:** the Virtual DOM is the plain JavaScript object tree your components return (React elements) — a cheap description of what the page should look like. React compares the new description with the previous one and changes the real DOM only where they differ.\r
\r
When state changes:\r
1. React calls your components again and gets a new element tree\r
2. Diffs it against the previous one (reconciliation, §14)\r
3. Works out the smallest set of DOM changes that turns the old page into the new one\r
4. Applies only those changes to the real DOM (the commit phase)\r
\r
**Why it exists:** creating and comparing JavaScript objects is cheap; touching the real DOM (and the layout and paint it triggers) is expensive. The Virtual DOM lets you write code as if you re-render the whole screen on every change, while React makes sure only the parts that differ actually hit the DOM.\r
\r
**The nuance worth volunteering:** it is not "faster than the DOM". Carefully hand-written DOM updates can beat it, because React does the diffing work on top of the DOM work. What it buys you is that the simple, declarative code is *fast enough* without you tracking every change by hand.\r
\r
---\r
\r
**Q2: What is the difference between state, props and context?**\r
\r
**Short answer:** **props** are inputs a parent passes to a child, **state** is data a component owns and can change, and **context** is data a component makes available to *everything* below it without passing it through each level.\r
\r
| Question | Props | State | Context |\r
|---|---|---|---|\r
| Who owns it | the parent | the component itself | the nearest \`Provider\` above |\r
| Who can change it | only the parent (the child receives a read-only copy) | the component, with its setter | whoever owns the value given to the Provider |\r
| How it travels | one level down, explicitly | stays put, unless passed down as props | skips levels: any descendant can read it |\r
| Typical use | configuring a child: \`label\`, \`onClick\`, \`items\` | form input, open/closed, selected tab | theme, current user, language |\r
\r
They are not three separate kinds of data. They are three ways the *same* value can reach a component. In the example below, \`theme\` is **state** in \`App\`, it becomes the **context** value, and \`Toolbar\` passes \`label\` down as a **prop**.\r
\r
\`\`\`tsx\r
const ThemeContext = React.createContext('light');\r
\r
function App() {\r
  const [theme, setTheme] = React.useState('dark');       // state: App owns it\r
  return (\r
    <ThemeContext.Provider value={theme}>                  {/* context: offered to everything below */}\r
      <Toolbar />\r
      <button onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}>Switch theme</button>\r
    </ThemeContext.Provider>\r
  );\r
}\r
\r
function Toolbar() {\r
  return <ThemedButton label="Save" />;                   // prop: passed one level down\r
}\r
\r
function ThemedButton({ label }) {\r
  const theme = React.useContext(ThemeContext);           // read directly, no props in between\r
  return <button style={{ background: theme === 'dark' ? '#333' : '#eee', color: theme === 'dark' ? '#fff' : '#000' }}>{label} ({theme})</button>;\r
}\r
\r
render(<App />);\r
\`\`\`\r
\r
**When to use which.** Start with state in the component that needs it. If a child needs it, pass it as a prop. If many components at different depths need it and passing it through every level gets painful ("prop drilling"), move it into context.\r
\r
**The catch with context:** every component that reads a context re-renders whenever its value changes, and there is no way to subscribe to only part of it. That makes it great for values that rarely change (theme, user, locale) and a poor fit for fast-changing data. Q33 covers how to split a context, and the Zustand guide covers stores that let components subscribe to one field.\r
\r
---\r
\r
**Q3: What is JSX?**\r
\r
**Short answer:** JSX is HTML-like syntax inside JavaScript that a compiler (Babel, TypeScript, esbuild) turns into ordinary function calls. Browsers never see it.\r
\r
Each tag becomes a call that creates a React element, a plain object describing what to render. (Modern toolchains call \`jsx()\` from \`react/jsx-runtime\` rather than \`React.createElement\`, which is why you no longer need \`import React\` at the top of every file, but the idea is the same.) Knowing this explains JSX's rules: \`{}\` accepts an *expression* but not an \`if\` statement, because it becomes a function argument; you write \`className\` because the attributes become a JavaScript object and \`class\` is a reserved word; and a component must return a single root because a function returns one value.\r
\r
\`\`\`tsx\r
<h1 className="title">Hello</h1>\r
// becomes\r
React.createElement('h1', { className: 'title' }, 'Hello')\r
\`\`\`\r
\r
---\r
\r
**Q4: What are keys in React, and why are array indices bad keys?**\r
\r
A key tells React **which item a rendered element corresponds to**, so that when the list changes it can match old elements to new ones instead of guessing. Reconciliation compares children position by position by default; keys replace "same position" with "same identity".\r
\r
\`\`\`tsx\r
{items.map(item => <li key={item.id}>{item.name}</li>)}\r
\`\`\`\r
\r
**Why an index is the wrong key** is the part worth being able to explain, because \`key={index}\` silences the warning without doing the job. The index is not a property of the item — it is a property of *where the item currently sits*. Delete the first row of three and the item that was at index 1 is now at index 0, so React concludes that item 0 simply *changed its text*, rather than that an item was removed.\r
\r
For plain text that renders correctly by accident. It breaks the moment an element holds state that React tracks by position:\r
\r
\`\`\`tsx\r
// Three rows, each with an uncontrolled input. Type "hello" in the second one,\r
// then delete the FIRST row.\r
{rows.map((row, i) => <input key={i} defaultValue={row.label} />)}\r
// → "hello" is still on screen, now attached to what used to be the third row.\r
{rows.map(row => <input key={row.id} defaultValue={row.label} />)}\r
// → the right row disappears and the text goes with it.\r
\`\`\`\r
\r
The same applies to focus, scroll position, CSS transitions, \`React.memo\` bailouts and anything held in a child's \`useState\` — all of it follows the key, so a positional key hands it to the wrong item.\r
\r
**When an index is genuinely fine:** the list is never reordered, filtered, or added to except at the end, *and* the items hold no state. A static footer-link list qualifies. If any of those change, it does not.\r
\r
**Two related traps.** \`key={Math.random()}\` is worse than an index — it is different on every render, so React unmounts and remounts every row every time, destroying state and DOM nodes for nothing. And keys only need to be unique **among siblings**, not globally, which is why \`key={item.id}\` is fine even when two different lists on the page share an id.\r
\r
---\r
\r
**Q5: What is the difference between controlled and uncontrolled components?**\r
\r
- **Controlled**: React state is the single source of truth. Input value is set by state and updated via onChange handler.\r
- **Uncontrolled**: DOM is the source of truth. Use \`ref\` to read values when needed.\r
\r
\`\`\`tsx\r
const name = 'Alice';\r
const setName = (v: string) => { void v; };\r
const inputRef = React.createRef<HTMLInputElement>();\r
\r
// Controlled — React owns the value; every keystroke goes through state\r
const controlled = <input value={name} onChange={e => setName(e.target.value)} />;\r
\r
// Uncontrolled — the DOM owns the value; you read it from the ref when needed\r
const uncontrolled = <input ref={inputRef} defaultValue="" />;\r
\`\`\`\r
\r
**Short answer:** in a controlled input React state holds the value; in an uncontrolled input the DOM holds it and you read it when you need it.\r
\r
Controlled is the usual default because the value is always available in state, so you can validate as the user types, reformat input, or disable the submit button without touching the DOM. The cost is a re-render on every keystroke. Uncontrolled suits simple forms read only on submit, file inputs (which are always uncontrolled), and non-React widgets. The mistake to avoid is switching one input between the two, for example by passing \`value={undefined}\` at first and a string later — React warns because it no longer knows who owns the value.\r
\r
---\r
\r
### Intermediate\r
\r
---\r
\r
**Q6: Explain the useEffect hook and its dependency array.**\r
\r
**Short answer:** \`useEffect\` runs code after React has updated the screen, to keep something *outside* React (a subscription, a timer, the document title, a non-React widget) in sync with your props and state. The dependency array lists the values that sync depends on, and React re-runs the effect only when one of them changes.\r
\r
The dependency array controls when it runs:\r
\r
- **No array**: runs after every render\r
- **Empty array \`[]\`**: runs once on mount, cleanup on unmount\r
- **With dependencies \`[a, b]\`**: runs when a or b changes\r
\r
\`\`\`tsx\r
useEffect(() => {\r
  const sub = subscribe(userId);\r
  return () => sub.unsubscribe();          // cleanup\r
}, [userId]);                               // re-run when userId changes\r
\`\`\`\r
\r
The cleanup function runs before the next effect and on unmount — used for unsubscribing, clearing timers, cancelling requests. Think of each run as "connect to \`userId\`" and each cleanup as "disconnect from the old \`userId\`": when \`userId\` changes, React disconnects the old one before connecting the new one.\r
\r
The dependency array must list **every** prop or state value the effect reads. Leaving one out does not mean "don't re-run"; it means the effect keeps using the value from an old render (a stale closure). §7.3 shows the three classic bugs.\r
\r
---\r
\r
**Q7: What is the difference between useMemo and useCallback?**\r
\r
**Short answer:** \`useMemo\` caches the *result* of a function; \`useCallback\` caches the *function itself*. Both return the cached thing until a dependency changes.\r
\r
- \`useMemo(() => value, [deps])\`: Memoizes a **computed value**\r
- \`useCallback((args) => fn(args), [deps])\`: Memoizes a **function reference**\r
\r
\`useCallback(fn, deps)\` is equivalent to \`useMemo(() => fn, deps)\`.\r
\r
Use \`useMemo\` for expensive computations, or to keep an object's reference stable. Use \`useCallback\` when passing a callback to a child wrapped in \`React.memo\`: a function written inline is a new object on every render, so the memoized child would see a "changed" prop and re-render anyway. Without a memoized consumer, \`useCallback\` buys nothing.\r
\r
Note: with the React Compiler enabled, manual memoization is often unnecessary — for the components it manages to compile (§16.1).\r
\r
---\r
\r
**Q8: How does React reconciliation work?**\r
\r
**Short answer:** reconciliation is how React works out what changed. It compares the element tree from this render with the one from the last render and turns the differences into DOM updates. A perfect tree comparison is far too slow, so React takes shortcuts that are right in practice.\r
\r
1. When state/props change, React creates a new Virtual DOM tree\r
2. Compares it with the previous tree (diffing)\r
3. Uses heuristics for O(n) complexity:\r
   - Different element types -> rebuild entire subtree\r
   - Same element type -> update only changed attributes\r
   - Keys help match elements in lists (reorder instead of recreate)\r
4. Batches all DOM updates and applies them in one commit\r
\r
The shortcut with consequences: an element of a different type (say \`<div>\` becoming \`<section>\`, or \`<ProfileA>\` becoming \`<ProfileB>\`) is never compared in detail — React throws away the old subtree, **including its state**, and builds a new one. §14 covers the algorithm and Fiber.\r
\r
---\r
\r
**Q9: Explain the Context API and when to use it.**\r
\r
**Short answer:** Context lets a component make a value available to every component below it, so you do not have to pass it as a prop through each layer in between ("prop drilling"). It consists of:\r
1. \`createContext()\` — creates the context\r
2. \`Context.Provider\` — wraps components that need access\r
3. \`useContext()\` — consumes the value\r
\r
Best for: theme, locale, auth user, feature flags — data that many components need but doesn't change frequently.\r
\r
Not ideal for: frequently updating data. Every component that reads a context re-renders when its value changes, and it cannot subscribe to just one field of it, so a fast-changing value in a big context re-renders a lot of the tree. Stores such as Zustand let each component subscribe to only the field it reads (see Q33 and §11).\r
\r
---\r
\r
**Q10: What is the difference between \`useEffect\` and \`useLayoutEffect\`?**\r
\r
- \`useEffect\`: Runs **asynchronously** after the browser has painted. Non-blocking. Use for most side effects (data fetching, subscriptions, logging).\r
- \`useLayoutEffect\`: Runs **synchronously** after DOM mutations but before the browser paints. Blocking. Use when you need to read layout (measurements) or make DOM changes before the user sees them.\r
\r
\`\`\`tsx\r
// useLayoutEffect: measure and position before paint\r
useLayoutEffect(() => {\r
  const rect = ref.current.getBoundingClientRect();\r
  setPosition({ top: rect.top, left: rect.left });\r
}, []);\r
\`\`\`\r
\r
If you're not sure which to use, use \`useEffect\`.\r
\r
---\r
\r
### Advanced\r
\r
---\r
\r
**Q11: How do you prevent unnecessary re-renders? What if a parent changes often and re-renders all its children?**\r
\r
**Short answer:** first measure, then fix the *structure* before reaching for \`memo\`. Most re-render problems disappear when the fast-changing state is moved to where it is used, so the expensive parts are no longer inside the component that changes.\r
\r
**Why children re-render at all.** When a component's state changes, React re-renders that component **and everything it renders**, whether or not their props changed. That is usually cheap and correct. It becomes a problem when a parent updates often (a timer, a text input, mouse position, a live feed) and one of its children is expensive.\r
\r
**The fixes, in the order to try them:**\r
\r
1. **Measure first.** React DevTools Profiler, with "Highlight updates when components render" switched on, shows what actually re-renders and how long it takes (Q26). Many "unnecessary" renders cost under a millisecond and are not worth any code.\r
2. **Move the state down.** If only a small part of the page uses the changing value, put the state in a small component that owns just that part. The rest of the page no longer re-renders when it changes.\r
3. **Lift the content up, and pass it as \`children\`.** When the state has to stay in a wrapper, pass the expensive part in from outside. The \`children\` element was created by the parent *above* the changing component, so it is the same element on every re-render, and React skips it.\r
4. **\`React.memo\` with stable props.** Wrap the expensive child so it skips a re-render when its props are the same as last time. That only works if the props really are the same: an inline object, array or arrow function is new on every render, so stabilise those with \`useMemo\` and \`useCallback\` (Q7, Q66).\r
5. **Split contexts** by how often they change, so a fast-changing value does not re-render every consumer of a slow one (Q33).\r
6. **React Compiler** memoises automatically when it is enabled, which removes most of the manual \`memo\`/\`useMemo\`/\`useCallback\` work (Q27).\r
\r
Fix 3 surprises people most, so here it is running. Both versions have the same ticking state; only where the child is created differs.\r
\r
\`\`\`tsx\r
function Expensive({ label }) {\r
  console.log('render', label);\r
  return <p>{label}</p>;\r
}\r
\r
function useTicks(count) {\r
  const [tick, setTick] = React.useState(0);\r
  React.useEffect(() => {\r
    if (tick >= count) return;\r
    const id = setTimeout(() => setTick((t) => t + 1), 10);\r
    return () => clearTimeout(id);\r
  }, [tick, count]);\r
  return tick;\r
}\r
\r
// The ticking state and the child live in the same component,\r
// so every tick re-renders the child.\r
function Before() {\r
  const tick = useTicks(3);\r
  return <div>tick {tick} <Expensive label="inside" /></div>;\r
}\r
\r
// Same ticking state, but the child is created ABOVE it and passed in.\r
function Ticker({ children }) {\r
  const tick = useTicks(3);\r
  return <div>tick {tick} {children}</div>;\r
}\r
function After() {\r
  return <Ticker><Expensive label="as children" /></Ticker>;\r
}\r
\r
render(<><Before /><After /></>);\r
\`\`\`\r
\r
\`\`\`text\r
render inside\r
render as children\r
render inside\r
render inside\r
render inside\r
\`\`\`\r
\r
\`inside\` renders four times (once on mount, then once per tick). \`as children\` renders once, even though its wrapper re-rendered three times, and there is no \`memo\` anywhere. This is the cheapest fix there is, and the one interviewers most like to hear.\r
\r
---\r
\r
**Q12: Explain React Fiber architecture. How does it work internally, and why does it improve performance?**\r
\r
**Fiber is React's rendering engine since React 16. It turned rendering from one uninterruptible recursive call into a loop over small units of work that React can pause, prioritise and resume.** The old engine (the "stack reconciler") walked the whole component tree in one go; a big update blocked the main thread until it finished, so typing and clicks waited behind it. Fiber keeps the work in data structures instead of the call stack, which is what makes stopping halfway possible.\r
\r
**How it works internally:**\r
\r
- **A fiber is a plain object, one per component instance or element.** It holds the component \`type\`, its \`key\`, the props it rendered with (\`memoizedProps\`) and the new ones (\`pendingProps\`), its state (for a function component, the linked list of its hooks in \`memoizedState\`), \`flags\` describing what the commit must do (insert, update, delete, run effects), and \`lanes\`, its pending priorities.\r
- **The tree is linked by pointers, not nested calls:** \`child\` (first child), \`sibling\` (next sibling) and \`return\` (parent). Because the position is stored in the object, React can stop after any fiber and later continue from exactly there.\r
- **Double buffering.** There are two trees: \`current\`, which matches the screen, and the **work-in-progress** tree being built. Each fiber points to its twin through \`alternate\`. React builds the new tree off to the side and, when it is complete, swaps the pointer: the work-in-progress tree becomes \`current\` in one step.\r
- **The work loop has two halves per fiber.** \`beginWork\` on the way down calls the component (or skips it: if props, state and context are unchanged it **bails out** and reuses the old subtree), and \`completeWork\` on the way up prepares the DOM changes. Between fibers, in concurrent rendering, the loop asks the scheduler whether its time slice (about 5 ms) is used up; if so, it yields to the browser and resumes on the next task.\r
- **Two phases.** The **render phase** (building the work-in-progress tree) is interruptible and may be thrown away and restarted if a more urgent update arrives, which is why rendering must be pure. The **commit phase** (applying the DOM changes, then running layout effects, then scheduling effects) is synchronous and cannot be interrupted, so the user never sees a half-updated screen.\r
- **Lanes are priorities.** Each update is assigned a lane: discrete input such as a click or keypress gets the synchronous lane, \`startTransition\` gets a transition lane, and hidden or offscreen work gets idle. React always works on the most urgent lanes first, and can abandon a half-finished transition render to handle a keystroke.\r
\r
**Why it improves performance, stated precisely:** Fiber does not make React do *less* work, and a single render is not faster. It makes the work **interruptible and prioritised**, so the page stays responsive while expensive rendering happens: typing stays instant while a filtered list re-renders in a transition. That shows up as better responsiveness (INP, Interaction to Next Paint) rather than a faster total. It is also the foundation for everything concurrent: \`useTransition\`, \`useDeferredValue\`, Suspense, streaming SSR with selective hydration, and \`<Activity>\`.\r
\r
**The caveat worth volunteering:** the benefit only applies to updates rendered concurrently (inside \`startTransition\`, or deferred values). An ordinary \`setState\` from a click still renders synchronously to completion, so a component that takes 300 ms to render still blocks for 300 ms. The fix there is to make it cheaper or mark the update as a transition. §14.5–14.6 go deeper.\r
\r
---\r
\r
**Q13: What are React Server Components (RSC)?**\r
\r
**Short answer:** Server Components are components that run only on the server — at build time or per request — and send their *rendered output* to the browser, never their code. So a component that queries a database or imports a large markdown library adds nothing to the JavaScript bundle. The output travels as the RSC payload (a serialized description of the rendered tree) that React in the browser merges with Client Components.\r
\r
They:\r
- Can access server resources directly (database, file system)\r
- Don't add to the client JavaScript bundle\r
- Cannot use state, effects, or event handlers — those need code running in the browser, which is exactly what a Server Component does not have\r
- Can import and render Client Components (files marked \`'use client'\`), which is how interactive pieces are placed inside server-rendered pages\r
\r
\`\`\`tsx\r
// Server Component (default in App Router)\r
async function UserList() {\r
  const users = await db.users.findAll();   // direct DB access\r
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;\r
}\r
\r
// Client Component (opt-in)\r
'use client';\r
function Counter() {\r
  const [count, setCount] = useState(0);    // state requires client\r
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\r
}\r
\`\`\`\r
\r
---\r
\r
**Q14: How would you handle global state without Redux?**\r
\r
**Short answer:** first split the state by kind. Data that comes from an API is *server state* and belongs in a fetching cache such as TanStack Query (formerly React Query). What is left is usually small, and for that Context + \`useReducer\` or a tiny store like Zustand is enough (§11.3).\r
\r
1. **Context + useReducer**: built in, no dependency. Fine for values that change rarely; every consumer re-renders when the value changes.\r
2. **Zustand**: a store outside React that components read through a hook with a *selector* (\`useStore(s => s.count)\`), so a component re-renders only when the field it selected changes. No Provider needed.\r
3. **Jotai**: state split into many small independent pieces ("atoms"); a component subscribes only to the atoms it reads.\r
4. **TanStack Query**: for server state — caching, refetching, deduplicating requests and retries, which a general store would make you write yourself.\r
5. **useSyncExternalStore**: the React hook the libraries above use to subscribe safely; reach for it directly only if you are writing your own store.\r
\r
\`\`\`tsx\r
// Zustand example\r
import { create } from 'zustand';\r
\r
const useStore = create((set) => ({\r
  count: 0,\r
  increment: () => set((state) => ({ count: state.count + 1 })),\r
}));\r
\r
function Counter() {\r
  const { count, increment } = useStore();\r
  return <button onClick={increment}>{count}</button>;\r
}\r
\`\`\`\r
\r
---\r
\r
**Q15: Explain the difference between \`useTransition\` and \`useDeferredValue\`.**\r
\r
**Short answer:** both let React render an update at low priority, so urgent updates such as typing are never blocked. \`useTransition\` marks a **state update you trigger**; \`useDeferredValue\` marks a **value you receive**.\r
\r
- **useTransition**: Wraps a state update to mark it as non-urgent\r
  \`\`\`tsx\r
  const [isPending, startTransition] = useTransition();\r
  // The callback itself runs immediately; only the state update inside it is low priority.\r
  // So set the filter text here, and let the slow filtering happen in the interruptible render.\r
  startTransition(() => setFilterText(query));\r
  \`\`\`\r
\r
- **useDeferredValue**: Defers a value — shows the old value while the new one is computing\r
  \`\`\`tsx\r
  const deferredQuery = useDeferredValue(query);\r
  // deferredQuery lags behind query, keeping UI responsive\r
  const results = expensiveFilter(deferredQuery);\r
  \`\`\`\r
\r
Use \`useTransition\` when you control the state update. Use \`useDeferredValue\` when you receive a value from a prop or parent.\r
\r
---\r
\r
**Q16: What is Suspense and how does it work?**\r
\r
**Short answer:** \`<Suspense>\` shows a fallback while something inside it is not ready yet (code still downloading, or data still loading), then swaps in the real content once it is.\r
\r
\`\`\`tsx\r
<Suspense fallback={<Spinner />}>\r
  <LazyComponent />                         {/* code splitting */}\r
  <DataComponent />                         {/* data fetching (with use() or React Query) */}\r
</Suspense>\r
\`\`\`\r
\r
How it works internally:\r
1. A child component "suspends": it signals that it is waiting on a Promise. Classically this was done by throwing the Promise during render\r
2. React catches it, shows the nearest fallback\r
3. When the Promise resolves, React re-renders the child with the data\r
\r
You never throw a Promise yourself. \`React.lazy\`, \`use()\` and Suspense-enabled libraries (TanStack Query's \`useSuspenseQuery\`, framework data loaders) do it for you, and the exact mechanism is an internal detail React is free to change.\r
\r
Use cases: lazy loading, data fetching, nested loading states, streaming SSR.\r
\r
---\r
\r
**Q17: How does the React Compiler work?**\r
\r
**Short answer:** it is a build step that analyses each component, works out which values can change between renders, and adds a small cache so everything else is reused instead of recreated. The effect is the memoization you would otherwise write by hand with \`useMemo\`, \`useCallback\` and \`memo\`, applied automatically and more precisely.\r
\r
What it does at build time:\r
\r
1. Turns each component into an internal representation and runs data-flow analysis on it, to learn what each value depends on.\r
2. Emits code that keeps a **cache array per component instance** (\`const $ = _c(n)\`), and recomputes a value or rebuilds a JSX element only when something it depends on has changed.\r
3. Returns the **same element object** when nothing changed, which is what lets React skip re-rendering that child, without the child needing \`memo\`.\r
\r
It is finer-grained than hand-written memoization, and it can memoize after an early return, which \`useMemo\` cannot, because hooks cannot be called conditionally. §16.1 shows the compiled output.\r
\r
The part worth volunteering: it only compiles components that follow the Rules of React (pure rendering, no mutation of props or state, hooks at the top level). A component that breaks them is **silently skipped**, so "we turned the compiler on" does not mean every component got optimised. The lint rules in \`eslint-plugin-react-hooks\` point at the code that causes skips, and React DevTools shows a **"Memo ✨"** badge on the components that were compiled.\r
\r
---\r
\r
\r
**Q18: How would you implement error boundaries?**\r
\r
**Short answer:** write a class component with \`static getDerivedStateFromError\` (to switch to a fallback) and usually \`componentDidCatch\` (to log), and wrap the parts of the tree that can fail. Error boundaries catch JavaScript errors in the component tree below them and display a fallback UI instead of crashing the whole app.\r
\r
\`\`\`tsx\r
class ErrorBoundary extends React.Component<\r
  { children: React.ReactNode; fallback: React.ReactNode },\r
  { hasError: boolean }\r
> {\r
  state = { hasError: false };\r
\r
  static getDerivedStateFromError() {\r
    return { hasError: true };\r
  }\r
\r
  componentDidCatch(error: Error, info: React.ErrorInfo) {\r
    console.error('Error boundary caught:', error, info.componentStack);\r
  }\r
\r
  render() {\r
    if (this.state.hasError) return this.props.fallback;\r
    return this.props.children;\r
  }\r
}\r
\r
// stand-in so this example runs on its own: throws during render once clicked\r
function RiskyComponent() {\r
  const [broken, setBroken] = useState(false);\r
  if (broken) throw new Error('Boom');\r
  return <button onClick={() => setBroken(true)}>Break it</button>;\r
}\r
\r
// Usage\r
render(\r
  <ErrorBoundary fallback={<p>Something went wrong</p>}>\r
    <RiskyComponent />\r
  </ErrorBoundary>\r
);\r
\`\`\`\r
\r
Error boundaries must be class components (no hook equivalent yet). They catch rendering errors, lifecycle errors, and constructor errors — but NOT event handler errors, async errors, or SSR errors.\r
\r
---\r
\r
### Performance & Tooling\r
\r
---\r
\r
**Q19: What are the Core Web Vitals and which one is most affected by React-specific issues?**\r
\r
The three Core Web Vitals are **LCP** (Largest Contentful Paint, load speed), **INP** (Interaction to Next Paint, responsiveness — replaced FID in March 2024), and **CLS** (Cumulative Layout Shift, visual stability).\r
\r
- **LCP** is mostly about network and image work — large bundles delay it because the browser parses JS before painting hydrated content.\r
- **INP** is the one React apps fail most often. Long tasks triggered by re-renders, expensive event handlers, or hydration block input. Measure it with \`web-vitals\` in production, not Lighthouse — synthetic tools underestimate INP.\r
- **CLS** comes from images/embeds without explicit dimensions, late-loading fonts, and dynamically inserted content. Fix with reserved space (\`width\`/\`height\`, \`aspect-ratio\`, skeletons).\r
\r
Track all three with the \`web-vitals\` library and ship them to your analytics endpoint.\r
\r
---\r
\r
**Q20: How does React DevTools Profiler help you find performance issues?**\r
\r
The Profiler records a session of renders and shows a flamegraph: each component's bar width = time spent rendering it. Workflow:\r
\r
1. Start a recording, perform the slow interaction, stop.\r
2. Switch to the **Ranked** view to sort components by render time.\r
3. Click a component in the flamegraph — the right panel shows *why* it rendered (props change, state change, hook change, parent re-rendered).\r
4. Enable "Highlight updates when components render" (settings) for a real-time visual.\r
\r
It tells you which renders are slow and which are unnecessary, but not why a particular line of code is slow — for that, use the Chrome Performance tab and look at the JS flamechart inside the slow component.\r
\r
---\r
\r
**Q21: What is a bundle analyzer and what should you look for?**\r
\r
A bundle analyzer visualizes the production bundle as a treemap, with each rectangle sized by bytes. It shows which modules are eating the budget. For Vite/Rollup use \`rollup-plugin-visualizer\`; for Webpack use \`webpack-bundle-analyzer\`; for any output with source maps use \`source-map-explorer\`.\r
\r
Things to chase down on every release:\r
\r
1. Duplicate copies of the same library (often two React versions or two lodash versions).\r
2. Whole libraries imported for one helper — \`import _ from 'lodash'\` ships ~70 KB; use \`import { debounce } from 'lodash-es'\`.\r
3. \`moment.js\` (~70 KB) — replace with \`date-fns\` (~5 KB tree-shaken) or \`dayjs\` (~2 KB).\r
4. Entire icon packs — import only the icons you use.\r
5. Polyfills shipped to modern browsers (check \`browserslist\`).\r
6. Source maps accidentally bundled into JS chunks.\r
\r
---\r
\r
**Q22: Webpack vs Vite — when do you pick which?**\r
\r
| Aspect | Webpack | Vite |\r
|---|---|---|\r
| Dev server | Bundles before serving | Native ESM, no bundling |\r
| Cold start | Slow on big apps (seconds-to-minutes) | Sub-second |\r
| HMR | Module-graph rebuild | Per-module, near-instant |\r
| Production | Webpack itself | Rollup up to v7; Rolldown from v8 |\r
| Config | Verbose, plugin-heavy | Minimal defaults |\r
| Plugin ecosystem | Largest in JS tooling | Growing (Rollup-compatible) |\r
\r
**Pick Vite** for new projects, fast feedback loops, and standard React apps — it's the default in 2025+.\r
**Pick Webpack** when you have heavy custom transforms (legacy Babel pipelines, Module Federation in micro-frontends), or when you're already deep into a Webpack codebase and migration risk outweighs the dev-experience win. Webpack 5's persistent caching narrowed the cold-start gap, but per-module HMR is still Vite's edge.\r
\r
Vite 8 (March 2026) replaced Rollup, and esbuild in development, with one Rust bundler, Rolldown, so dev and production now run through the same tool (see §13.9).\r
\r
---\r
\r
**Q23: How does tree shaking work and what breaks it?**\r
\r
Tree shaking is the bundler's removal of unused exports from the final bundle. It depends on **static analysis of ES modules** — bundlers must be able to prove an export is unused without running the code.\r
\r
What breaks it:\r
\r
1. **CommonJS imports** (\`require\`) — dynamic by design, not statically analyzable.\r
2. **Default-importing a whole library**: \`import _ from 'lodash'\` — there's nothing to shake; you used the whole namespace.\r
3. **No \`"sideEffects": false\`** in \`package.json\`. Without that field (or with it set to \`true\`), the bundler must assume importing a file can change global state, such as registering a polyfill or injecting CSS, so it keeps the file even when you use none of its exports.\r
4. **Transpiling ESM down to CommonJS** before the bundler sees it (old Babel configs).\r
5. **Re-exports through barrel files** that re-export modules with side effects.\r
\r
Fixes: use named ESM imports (\`import { debounce } from 'lodash-es'\`), set \`"sideEffects": false\` (or whitelist the few side-effectful files like CSS), and let the bundler consume ESM directly.\r
\r
---\r
\r
**Q24: You added \`useDeferredValue\` (or \`startTransition\`) to a slow search list, and typing still lags. Why?**\r
\r
**Short answer:** neither hook makes work faster. They make **rendering** interruptible and low priority, so they only help when the slow part is a render that React can pause and that the urgent update skips. Q15 covers which hook to pick. These are the four reasons it does nothing:\r
\r
1. **The slow child is not memoised.** With \`useDeferredValue\`, React renders twice: first an urgent render that still passes the *old* deferred value, then a background render with the new one. The slow child gets the same prop in the urgent render, but without \`memo\` it re-renders anyway, so the urgent render is as slow as before. The same happens with a transition if the slow component also reads the urgent state directly.\r
2. **The slow work is not in render.** Only rendering can be interrupted. Filtering 50,000 items inside the \`onChange\` handler, or before calling \`startTransition\`, runs synchronously and blocks the keystroke.\r
3. **One component does all the work.** React yields to the browser between components, about every 5 ms, never in the middle of one. A single component that loops for 300 ms blocks for 300 ms. Split the work into child components, or do less of it: \`useMemo\` the filter, or virtualise the list (§13.4).\r
4. **The cost is not React rendering.** The commit (writing to the DOM) is synchronous, so inserting 10,000 DOM nodes blocks however the render was scheduled. A request per keystroke is not helped either. Virtualise the list, and debounce network calls (Q54).\r
\r
Both rules running: the list is memoised, and its cost is spread across 250 row components so React can yield between them. Type quickly and the input keeps up while the results dim and catch up. Remove the \`memo\` and the lag comes back.\r
\r
\`\`\`jsx\r
import { memo, useDeferredValue, useState } from 'react';\r
\r
// Each row burns about 1 ms, so the whole list costs about 250 ms to render\r
function SlowRow({ text }) {\r
  const start = performance.now();\r
  while (performance.now() - start < 1) {\r
    // busy-wait to simulate an expensive row\r
  }\r
  return <li>{text}</li>;\r
}\r
\r
const SlowList = memo(function SlowList({ query }) {\r
  const rows = [];\r
  for (let i = 0; i < 250; i++) rows.push(<SlowRow key={i} text={\`\${query} #\${i}\`} />);\r
  return <ul>{rows}</ul>;\r
});\r
\r
function Search() {\r
  const [query, setQuery] = useState('');\r
  const deferredQuery = useDeferredValue(query);\r
  const isStale = query !== deferredQuery;\r
  return (\r
    <div>\r
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type quickly" />\r
      <div style={{ opacity: isStale ? 0.5 : 1 }}>\r
        <SlowList query={deferredQuery} />\r
      </div>\r
    </div>\r
  );\r
}\r
\`\`\`\r
\r
\`query !== deferredQuery\` is the pending signal for \`useDeferredValue\`, the same job \`isPending\` does for \`useTransition\`. Total CPU work goes **up**, not down, because the list renders again for every value React gets to. What you gain is that the keystroke is never stuck behind it.\r
\r
---\r
\r
**Q25: How would you reduce a 2 MB initial JS bundle on a React app?**\r
\r
Walk through this in priority order — each step usually finds at least one offender:\r
\r
1. **Run a bundle analyzer** to see who's actually big. Don't optimize blind.\r
2. **Route-based code splitting** with \`React.lazy\` + \`<Suspense>\`. The login page should not download the dashboard's chart library.\r
3. **Component-level splitting** for heavy widgets (rich text editors, charts, maps, video players) — load only when the user clicks the button.\r
4. **Replace heavy deps**: \`moment\` → \`date-fns\`/\`dayjs\`; \`lodash\` → \`lodash-es\` with named imports; \`chart.js\` is often replaceable with a lighter chart lib.\r
5. **Tree-shake aggressively**: named ESM imports, \`sideEffects: false\`, ESM builds of dependencies.\r
6. **Drop polyfills** the modern browser doesn't need — set \`browserslist\` to a recent baseline.\r
7. **Manual chunks** in Vite/Rollup so vendor libs land in a long-lived cached file separate from app code.\r
8. **Compression on the server** (Brotli > gzip) — not strictly a bundle reduction but cuts ~70% off the wire size.\r
9. **Server Components / SSR** for content that doesn't need to ship as JS at all.\r
\r
Measure LCP and INP before/after — bytes saved is a proxy; what users feel is what matters.\r
\r
---\r
\r
**Q26: How do you debug an unnecessary re-render that the Profiler flagged?**\r
\r
Open the Profiler, click the offending render, and read the "Why did this render?" panel — it lists which prop, state, hook, or context value changed. Then:\r
\r
1. **Prop changed but value looks the same** — the parent is creating a new object/array/function reference each render. Hoist it, \`useMemo\` it, or \`useCallback\` the function. The child can be wrapped in \`React.memo\` to bail out on shallow-equal props.\r
2. **Context changed** — the provider's \`value\` is a new object each render. Memoize it, or split the context so unrelated consumers don't fan out.\r
3. **Hook (state) changed** — the state itself updated; verify it's actually a new value and not \`setState\` being called with an equal object (primitives bail out automatically; objects don't).\r
4. **Parent re-rendered** — your component isn't memoized. Wrap with \`React.memo\` if it's pure and props are stable; or move state down so the parent doesn't re-render in the first place.\r
\r
The React Compiler (React 19) handles most of this automatically when enabled — but knowing the underlying cause is still essential for debugging compiled output and for codebases that haven't adopted it yet.\r
\r
---\r
\r
**Q27: React Compiler 1.0 is stable. Do you still need \`useMemo\` and \`useCallback\`, and how would you roll it out on an existing codebase?**\r
\r
Mostly no, but the interesting part is the exceptions and the rollout.\r
\r
The compiler analyses each component, lowers it to its own intermediate representation, and emits memoization at a **finer grain** than you can write by hand — it can cache one JSX subtree or a single property access, whereas \`useMemo\` only works at the boundary you happened to wrap. So for ordinary "this object literal is a new reference every render" problems, it is strictly better than manual memoization.\r
\r
Two cases still need you:\r
\r
1. **Referential identity as an external contract.** If a third-party hook takes a dependency array, or an imperative API (an observer, a map instance, an event listener) needs the *same* reference across renders, you want an explicit \`useMemo\`/\`useRef\` because the requirement is semantic, not an optimisation the compiler is free to skip.\r
2. **Genuinely expensive computation** you want cached across changes the compiler considers relevant — the compiler memoizes on *correct* dependencies, which is not always the *coarsest safe* dependency set.\r
\r
The rollout order is the real answer, and it follows from how the compiler fails. It only compiles a component when it can prove purity, immutability and the Rules of Hooks; when it can't, it **bails out and silently leaves that component unoptimised**. Nothing breaks — you just get no benefit, invisibly. So:\r
\r
1. **Lint first.** The compiler-powered rules ship in \`eslint-plugin-react-hooks\` (7.x today; flat config and the \`recommended\` preset since 6.1). They report which components would bail out and why.\r
2. **Fix the violations** — mutation of props or state during render, side effects in render bodies, conditional hooks.\r
3. **Then enable the compiler**, and check the build output for remaining bail-outs.\r
4. **Don't bulk-delete existing \`useMemo\`/\`useCallback\`.** They are harmless once the compiler is on, and a mass removal is a large, risky diff for no measurable gain. Stop adding new ones; delete opportunistically while editing.\r
\r
Finally, name what it does *not* solve: it doesn't replace \`useTransition\`/\`useDeferredValue\` (scheduling), virtualization (DOM volume), or code splitting (payload), and it won't save you from recreating a context value at the provider every render.\r
\r
---\r
\r
**Q28: What is \`<Activity />\` and when would you use it over conditional rendering or \`display: none\`?**\r
\r
\`<Activity mode="visible" | "hidden">\` (stable in React 19.2) is a boundary that **preserves state while destroying effects**. That combination was previously impossible to express:\r
\r
| Approach | State | Effects |\r
|---|---|---|\r
| \`{cond && <Tab />}\` | destroyed | unmounted |\r
| \`display: none\` | preserved | **keep running** |\r
| \`<Activity>\` | **preserved** | **destroyed** |\r
\r
Conditional rendering throws away scroll position, half-typed input and fetched data every time the user switches tabs. CSS hiding keeps all of that, but leaves intervals ticking, sockets open and polling running for something nobody can see — which is a battery and bandwidth problem as much as a CPU one.\r
\r
Use it for tabs, multi-step wizards, and a list you navigate back to from a detail view. The second use is **pre-rendering**: render the screen the user is likely to open next inside a hidden \`Activity\`, and React renders it at a lower priority so it never competes with visible content.\r
\r
Details that distinguish a good answer: a hidden activity is not frozen — its children still re-render on new props, just at low priority, so it is cheap rather than free. Hiding uses \`display: none\`, so a component rendering bare text produces no DOM when hidden. And because *effect cleanup* is the mechanism that stops the work, every effect inside an \`Activity\` needs a correct cleanup function or hiding leaks. For teardown tied to the visual hide — pausing a video — use \`useLayoutEffect\` cleanup.\r
\r
---\r
\r
**Q29: What problem does \`useEffectEvent\` solve, and when should you not use it?**\r
\r
It resolves the tension between an *honest* dependency array and a *fresh* value. Some logic inside an effect is **reactive** (changing it should re-run the effect) and some is not (it should just read the latest value). Before 19.2, the dependency array couldn't express that distinction, so you had three bad options: omit the value and lie to the linter while capturing a stale closure; include it and re-run the effect on an unrelated change; or mirror it into a \`useRef\` by hand.\r
\r
\`\`\`tsx\r
// stand-ins so this example runs on its own\r
const showToast = (msg, theme) => console.log(msg, '(' + theme + ' toast)');\r
function createConnection(roomId) {\r
  let onConnected = () => {};\r
  return {\r
    on: (_event, cb) => { onConnected = cb; },\r
    connect: () => { console.log('connect', roomId); setTimeout(() => onConnected(), 100); },\r
    disconnect: () => console.log('disconnect', roomId),\r
  };\r
}\r
\r
function ChatRoom({ roomId, theme }) {\r
  const onConnected = useEffectEvent(() => showToast('Connected!', theme));\r
\r
  useEffect(() => {\r
    const conn = createConnection(roomId);\r
    conn.on('connected', () => onConnected());\r
    conn.connect();\r
    return () => conn.disconnect();\r
  }, [roomId]);   // honest AND complete — theme is not reactive here\r
\r
  return <p>Room: {roomId}</p>;\r
}\r
\r
// Changing the theme does NOT reconnect; changing the room does.\r
function Demo() {\r
  const [roomId, setRoomId] = useState('general');\r
  const [theme, setTheme] = useState('light');\r
  return (\r
    <>\r
      <button onClick={() => setRoomId(r => (r === 'general' ? 'random' : 'general'))}>Switch room</button>\r
      <button onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}>Toggle theme ({theme})</button>\r
      <ChatRoom roomId={roomId} theme={theme} />\r
    </>\r
  );\r
}\r
\r
render(<Demo />);\r
\`\`\`\r
\r
The returned function is **stable across renders** (so it never belongs in a dependency array) but its body always reads the **latest** props and state (so it is never stale). \`useCallback\` gives you stability at the cost of staleness; a plain inline function gives freshness at the cost of stability. \`useEffectEvent\` is the only thing that gives both.\r
\r
**When not to use it.** Two situations:\r
\r
- **When the logic actually is reactive.** Wrapping the connection setup itself in an effect event and leaving \`deps\` empty means switching rooms never reconnects — a silent bug that looks like a working dependency array. The test to apply: *does this describe when to synchronise, or what to do when something happens?* Synchronisation is reactive and belongs in deps. Events are not.\r
- **When you shouldn't have an effect at all.** \`useEffectEvent\` makes awkward effects tolerable, which makes it tempting as a way to keep an effect that should have been derived state, a render-time computation, or an ordinary event handler. §7.4's question comes first.\r
\r
It also has a hard restriction: effect events may only be called **from inside effects** (or other effect events), never during render and never passed down as a prop. A value that is both stable and always-fresh has no coherent meaning during render, so the linter forbids it.\r
\r
---\r
\r
**Q30: What do React 19.2's \`prerender\` and \`resume\` APIs do, and what problem do they solve?**\r
\r
They are React's building blocks for Partial Pre-rendering (PPR): render the static part of a page ahead of time and the dynamic part per request. Before them, a page had to be *entirely* static or *entirely* dynamic. If one component needed per-request data — a user's name in the header, a personalised price — the whole route dropped out of static generation and every visitor paid for a full server render, even though 95% of the markup was identical for everyone.\r
\r
React 19.2 added the primitives that break that all-or-nothing choice. You \`prerender()\` with an \`AbortController\`; rendering stops at the dynamic boundaries and returns both the static HTML **and** a serialisable "postponed" state describing where it stopped:\r
\r
\`\`\`jsx\r
// Build time\r
const controller = new AbortController();\r
const { prelude, postponed } = await prerender(<App />, { signal: controller.signal });\r
\r
// Request time — resume exactly where it stopped\r
const stream = await resume(<App />, postponed);\r
\`\`\`\r
\r
\`resume()\` / \`resumeToPipeableStream()\` finish the render on a server per request; \`resumeAndPrerender()\` / \`resumeAndPrerenderToNodeStream()\` finish it in a later build for SSG.\r
\r
The user-visible payoff: the static shell ships from a CDN edge immediately — great LCP and no server round trip for the layout — and the personalised holes stream in as \`Suspense\` boundaries resolve. You get static-site latency with dynamic-page capability. This is the primitive that Next.js's PPR is built on. How you opt in to it in Next.js 16 is covered in the [Next.js & RSC guide](/frontend/nextjs-rsc) (Q5).\r
\r
Related 19.2 change worth pairing it with: server-rendered \`Suspense\` boundaries now **batch** their reveals to match client behaviour. Previously each boundary revealed as its HTML arrived, causing visible layout thrash on streamed pages; batching means fewer, larger paint steps.\r
\r
---\r
\r
### Rapid-Fire Fundamentals\r
\r
These get asked constantly, usually as a quick screen before the harder questions.\r
\r
---\r
\r
**Q31: What is the difference between a React Component, a React Element, and a React Node?**\r
\r
A **Component** is the blueprint — a function that returns UI. An **Element** is the lightweight, immutable object that a JSX expression produces, describing *what* to render. A **Node** is anything React can render at all.\r
\r
\`\`\`tsx\r
const Button = () => <button/>;         // Component — a function\r
const el = <Button />;                  // Element   — { type: Button, props: {}, key, ref }\r
const node = [el, 'text', null, 42];    // Node      — all of these are renderable\r
\`\`\`\r
\r
The consequences that matter. **\`<Button />\` is not a call to \`Button()\`** — it's \`createElement(Button, …)\`, a plain object React will call *later*, and may choose never to call. That's what makes conditional rendering and bailing out possible. **Elements are immutable**: you describe a new one instead of mutating an existing one, which is the foundation of the whole render model. And in TypeScript, \`React.ReactNode\` is the type you want for \`children\`, because it's the permissive one — \`ReactElement\` rejects a string child, which is a very common typing mistake.\r
\r
---\r
\r
**Q32: Why should you never mutate state directly?**\r
\r
Three separate reasons, and interviews usually want more than "React won't re-render."\r
\r
**Change detection.** React compares by reference for \`useState\` and in \`React.memo\`/\`useMemo\`/\`useEffect\` dependency checks. \`state.items.push(x)\` leaves the reference identical, so React concludes nothing changed and skips the re-render. \`setState([...state.items, x])\` gives a new reference.\r
\r
**Concurrent rendering correctness.** React may start a render, abandon it, and restart. A mutation during render means the output depends on how many times the component happened to run — StrictMode's double-invoke exists precisely to expose this. React Compiler goes further and **silently skips** components that mutate props or state, so a mutation costs you the optimisation with no error.\r
\r
**Debuggability.** Immutable updates give you a history of distinct states, which is what makes Redux DevTools time-travel and \`useReducer\` testing possible.\r
\r
The modern tools: the ES2023 immutable array methods (\`toSorted\`, \`toReversed\`, \`toSpliced\`, \`with\`) exist largely to fix this — \`arr.sort()\` mutates and is a classic React bug, \`arr.toSorted()\` doesn't. Immer (built into Redux Toolkit) lets you write mutable-looking code that produces an immutable result.\r
\r
---\r
\r
**Q33: What are the pitfalls of the Context API, and how do you reduce Context re-renders?**\r
\r
**The core pitfall: Context has no partial subscription.** Every consumer of a context re-renders when the context *value* changes, regardless of which part of the value they actually read. There's no selector mechanism.\r
\r
That produces three common problems:\r
\r
\`\`\`tsx\r
const UserContext = React.createContext<unknown>(null);\r
\r
function Provider({ user, setUser, children }: {\r
  user: string; setUser: (u: string) => void; children: React.ReactNode;\r
}) {\r
  // 1. A new object every render → every consumer re-renders every time.\r
  const bad = { user, setUser };                                   // ✗\r
  const good = useMemo(() => ({ user, setUser }), [user, setUser]); // ✓\r
\r
  return <UserContext.Provider value={good}>{children}</UserContext.Provider>;\r
}\r
\r
// 2. Unrelated state bundled together → a theme change re-renders data consumers.\r
//    Split into separate contexts instead.\r
// 3. High-frequency data in context → every consumer re-renders on every tick.\r
//    Context has no partial subscription; use a store with selectors.\r
\r
// A consumer and a harness so Try it has something to show\r
function CurrentUser() {\r
  const { user, setUser } = useContext(UserContext) as { user: string; setUser: (u: string) => void };\r
  return <button onClick={() => setUser(user === 'Ana' ? 'Ben' : 'Ana')}>Signed in as {user}</button>;\r
}\r
\r
function Demo() {\r
  const [user, setUser] = useState('Ana');\r
  return <Provider user={user} setUser={setUser}><CurrentUser /></Provider>;\r
}\r
\r
render(<Demo />);\r
\`\`\`\r
\r
The fixes, in order:\r
\r
1. **Memoize the provider value** — the single most common bug, and a one-line fix.\r
2. **Split contexts by change frequency.** A separate \`ThemeContext\` and \`UserContext\` means a theme toggle doesn't touch user consumers. The strongest version is splitting **state from dispatch**: \`dispatch\` is stable, so components that only dispatch never re-render.\r
3. **Move children out.** Put the provider in a component whose only job is providing, and pass \`children\` through — then the provider re-rendering doesn't re-render the subtree, because \`children\` is the same element reference.\r
4. **Use a store for anything hot.** Zustand, Jotai or \`useSyncExternalStore\` give **selector-level subscriptions**, so a component re-renders only when its own slice changes. High-frequency data (a ticker, a live cursor position, form keystrokes) should never be in context.\r
\r
The rule to state: **Context is a dependency-injection mechanism, not a state manager.** It's excellent for values that rarely change — theme, locale, the current user, a service instance. It's the wrong tool for frequently-changing state.\r
\r
---\r
\r
**Q34: How do you reset a component's state?**\r
\r
Change its \`key\`. React's reconciler treats a different \`key\` at the same position as a **different component**, so it unmounts the old instance (running cleanup) and mounts a fresh one with initial state.\r
\r
\`\`\`tsx\r
// A new userId gives a completely fresh form — no effect, no manual reset\r
<UserProfileForm key={userId} userId={userId} />\r
\`\`\`\r
\r
This is the idiomatic answer and it replaces a very common anti-pattern:\r
\r
\`\`\`tsx\r
// ✗ The pattern the docs specifically warn against\r
useEffect(() => { setDraft(''); setErrors({}); setStep(0); }, [userId]);\r
\`\`\`\r
\r
The effect version renders once with stale state before correcting itself, it's easy to forget a field when someone adds one later, and it's an extra render. The \`key\` version is declarative and cannot go stale.\r
\r
Worth adding: \`key\` works because of the reconciliation rule that identity is \`(type, key, position)\`. That's the same mechanism behind "why do I need keys in lists" and behind the bug where using an array **index** as a key causes state to be reused by the wrong row after a reorder or deletion. Same rule, three consequences.\r
\r
---\r
\r
**Q35: What is hydration, and what causes a hydration mismatch?**\r
\r
**Hydration** is React attaching to server-rendered HTML: rather than creating DOM nodes, it walks the existing markup, builds its fiber tree against it, and wires up event listeners. That's what gives you fast first paint *and* interactivity.\r
\r
A **mismatch** is when the client's first render produces different markup than the server sent. React logs an error and, in the worst case, discards the server HTML and re-renders client-side — losing the performance benefit entirely.\r
\r
The usual causes are all the same underlying mistake — **rendering something that isn't the same on both sides**:\r
\r
\`\`\`tsx\r
new Date().toLocaleTimeString()   // different at server-render time vs hydrate time\r
Math.random()                     // obviously\r
localStorage.getItem('theme')     // doesn't exist on the server\r
window.innerWidth                 // same\r
navigator.userAgent               // browser-only, or differs\r
\`\`\`\r
\r
Plus **invalid HTML nesting** — a \`<div>\` inside a \`<p>\`, or a \`<p>\` inside a \`<p>\` — because the browser's parser *rewrites* the DOM to be valid, so what React finds isn't what the server sent. This one is sneaky because your JSX looks fine.\r
\r
The fixes: read browser-only values in an **effect** (so the first render matches the server), use \`useSyncExternalStore\` with a server snapshot for external state, \`suppressHydrationWarning\` for genuinely-unavoidable cases like a timestamp, and \`useId\` instead of any hand-rolled ID generation. In Next.js, \`next/dynamic\` with \`ssr: false\` for a component that fundamentally cannot render on the server. And React's \`onRecoverableError\` is how you catch these in production — hydration mismatches are a classic low-percentage, environment-dependent bug (see the Frontend Architecture guide §8).\r
\r
---\r
\r
**Q36: How do you test a React application?**\r
\r
Layered, with most of the weight low down.\r
\r
**Component tests with Testing Library** are the bulk. The guiding principle is to test what the **user** experiences, not implementation details — query by role and accessible name, fire real user interactions, assert on visible output:\r
\r
\`\`\`tsx\r
render(<LoginForm onSubmit={fn} />);\r
await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');\r
await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));\r
expect(fn).toHaveBeenCalledWith({ email: 'a@b.com' });\r
\`\`\`\r
\r
A real side benefit worth mentioning: \`getByRole(..., { name })\` **fails if the element has no accessible name**, so writing queries the recommended way turns accessibility failures into test failures.\r
\r
**Runner:** Vitest for a Vite project (same config, much faster), Jest otherwise. **Network:** MSW to intercept at the network layer rather than mocking your fetch wrapper — that way the test exercises your real data code. **E2E:** Playwright for critical flows only, because they're slow and flaky relative to their coverage. **Accessibility:** \`jest-axe\` per component, \`@axe-core/playwright\` on key pages.\r
\r
What **not** to test: implementation details (state variable names, whether a specific hook was called), snapshot tests of large trees (they fail on every change and get blindly updated, so they assert nothing), and third-party library internals.\r
\r
For **hooks**, use \`renderHook\`. For **Server Components**, unit-test the data functions directly and cover the rendered result with E2E — the component-testing story there is still immature, and saying so is more honest than pretending otherwise.\r
\r
---\r
\r
**Q37: What are the common pitfalls of data fetching in React?**\r
\r
The list, roughly in order of how often it appears in real codebases:\r
\r
1. **\`useEffect\` fetching at all.** It's a round trip *after* hydration, so it's a guaranteed waterfall. Fetch on the server (RSC/loader) or use a query library. The React docs are explicit that \`useEffect\` is the wrong tool for this.\r
2. **No cleanup → race conditions.** Two rapid searches can resolve out of order and render the older result. Fix with an \`AbortController\` or an \`ignore\` flag in the cleanup.\r
3. **Waterfalls from nesting.** A parent fetches, renders a child, and *then* the child fetches. Hoist the requests and run them in parallel, or fetch at the route level.\r
4. **Missing states.** Loading, empty, error and stale are four distinct states, and most hand-rolled fetching handles two.\r
5. **Treating server state as client state.** Putting fetched data in Redux or Context means you now own caching, invalidation, deduplication, retry and refetch-on-focus. That's what TanStack Query or RTK Query exist for — this server/client state distinction is the most important one in modern React data handling.\r
6. **No deduplication.** Three components mounting and each fetching the same endpoint.\r
7. **Fetching in a loop** — the N+1 problem, client-side.\r
8. **Storing derived data** in state and letting it drift from its source instead of computing it during render.\r
\r
\`\`\`tsx\r
// The minimum correct hand-rolled version\r
useEffect(() => {\r
  let ignore = false;\r
  const ctrl = new AbortController();\r
  fetch(url, { signal: ctrl.signal })\r
    .then(r => r.json())\r
    .then(d => { if (!ignore) setData(d); })\r
    .catch(e => { if (e.name !== 'AbortError' && !ignore) setError(e); });\r
  return () => { ignore = true; ctrl.abort(); };\r
}, [url]);\r
\`\`\`\r
\r
Which is a good argument for the answer: **don't hand-roll it.** That's the minimum for one request, and it still has no caching, no dedupe and no retry.\r
\r
---\r
\r
**Q38: What changed with \`forwardRef\` in React 19?**\r
\r
**\`ref\` is now an ordinary prop** for function components, so \`forwardRef\` is no longer needed:\r
\r
\`\`\`tsx\r
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;\r
\r
// React 19 — \`ref\` is just a prop\r
function Input({ ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {\r
  return <input ref={ref} {...props} />;\r
}\r
\r
// Before React 19 — forwardRef was required to receive one\r
const LegacyInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (\r
  <input ref={ref} {...props} />\r
));\r
\`\`\`\r
\r
\`forwardRef\` still works and is deprecated rather than removed, with a codemod available. Don't churn a large codebase for it; stop reaching for it in new code.\r
\r
Two related points worth knowing. **\`ref\` callbacks can now return a cleanup function**, which replaces the awkward "call the callback with \`null\` on unmount" pattern:\r
\r
\`\`\`tsx\r
<div ref={(node) => {\r
  const obs = new ResizeObserver(fn); obs.observe(node);\r
  return () => obs.disconnect();          // React 19: cleanup from a ref callback\r
}} />\r
\`\`\`\r
\r
And **\`useImperativeHandle\`** is unchanged and still the right tool when you want to expose a *narrow* API (\`{ focus, scrollIntoView }\`) rather than the raw DOM node — which you usually should, because handing consumers the element makes every internal detail part of your public contract.\r
\r
---\r
\r
**Q39: When would you use \`useReducer\` instead of \`useState\`?**\r
\r
When the **transitions** matter more than the values. Four concrete signals:\r
\r
1. **Multiple pieces of state change together.** A fetch sets \`loading\`, \`data\` and \`error\` in a single coherent transition; three \`useState\` calls let you produce impossible combinations like \`loading: true\` with \`error\` set.\r
2. **The next state depends on the previous state in a non-trivial way** — a multi-step wizard, an undo stack, a form with interdependent validation.\r
3. **You want the update logic outside the component**, because a reducer is a pure function and therefore trivially unit-testable without rendering anything.\r
4. **You want to pass \`dispatch\` down instead of many callbacks.** \`dispatch\` is **referentially stable**, so it never breaks memoization and never needs to be a dependency — that alone often justifies the switch.\r
\r
\`\`\`tsx\r
type State = { status: 'idle' | 'loading' | 'success' | 'error'; data?: Data; error?: string };\r
// The union makes impossible states unrepresentable — the real win\r
\`\`\`\r
\r
The last point is the strongest: modelling state as a **discriminated union** in a reducer makes invalid combinations impossible to express, which is a design win rather than an ergonomics one. And \`useReducer\` plus Context is the standard "Redux-lite" pattern — though for genuinely global state, a store with selector subscriptions (Zustand, Jotai) avoids the Context re-render problem from Q33.\r
\r
---\r
\r
**Q40: When do you need \`useId\`?**\r
\r
Whenever you need a **stable, unique, SSR-safe** identifier to wire elements together with ARIA or \`for\`/\`id\`:\r
\r
\`\`\`tsx\r
function Field({ label, error }) {\r
  const id = useId();\r
  return (\r
    <>\r
      <label htmlFor={id}>{label}</label>\r
      <input id={id} aria-describedby={error ? \`\${id}-err\` : undefined} aria-invalid={!!error} />\r
      {error && <p id={\`\${id}-err\`} role="alert">{error}</p>}\r
    </>\r
  );\r
}\r
\`\`\`\r
\r
Why not the alternatives: a **hard-coded ID** collides when the component renders twice on a page, which silently breaks the label association and — because \`aria-labelledby\` resolves to the *first* matching ID — can point at the wrong element. A **\`Math.random()\` or counter-based ID** produces a different value on the server than on the client, which is a hydration mismatch.\r
\r
\`useId\` is generated from the component's position in the tree, so it's identical on both sides. Generate one ID per component and derive related ones by suffix (\`\${id}-err\`) rather than calling \`useId\` repeatedly.\r
\r
What it is **not** for: list keys (use your data's identity) or any ID that needs to be meaningful or stable across sessions. And a detail worth knowing: the generated prefix changed from \`:r:\` to \`_r_\` in React 19.2, because a colon is not a valid \`view-transition-name\` — which only matters if you had snapshot tests asserting on generated IDs, itself a bad idea.\r
\r
---\r
\r
**Q41: What does "re-rendering" actually mean, and what triggers it?**\r
\r
A re-render means React **calls your component function again** to produce a new element tree, then diffs it against the previous one and applies only the differences to the DOM. **Re-render ≠ DOM update** — most re-renders produce identical output and touch nothing, which is why "too many re-renders" is only a problem when the render work itself is expensive.\r
\r
Four triggers, and only four:\r
\r
1. **Its own state changed** — \`setState\` with a value that isn't \`Object.is\`-equal to the current one.\r
2. **Its parent re-rendered.** This is the one people underestimate: by default a parent re-rendering re-renders **all** of its children transitively, whether or not their props changed. \`React.memo\` opts a component out via shallow prop comparison.\r
3. **A context it consumes changed** — and it re-renders regardless of which part of the value it reads (Q33).\r
4. **A hook it uses signalled a change** — \`useSyncExternalStore\`, or a library hook wrapping it.\r
\r
Common causes of *needless* re-renders: a new object, array or function literal in props each render; an unmemoized context value; state held higher in the tree than it needs to be; \`key\` changing unintentionally. The diagnostic order is **Profiler first** — it tells you which component re-rendered and *why* ("props changed: onClick") — then fix the cause, not the symptom. And React Compiler handles most of the memoization automatically once enabled (§16.1), which changes the calculus: don't add manual memoization preemptively, measure first.\r
\r
---\r
\r
**Q42: How do you debug a React app?**\r
\r
By narrowing which layer is wrong before reaching for a tool.\r
\r
**React DevTools** is the first stop. The **Components** panel shows the tree with live props, state and hooks (and lets you edit them to test a hypothesis). The **Profiler** records a commit and shows what rendered, how long it took, and **why** each component rendered — "Props changed: \`onClick\`" is usually the whole answer to an unnecessary-re-render question. Enable "Highlight updates" to see re-renders visually, which finds problems you weren't looking for.\r
\r
**React 19.2 added Performance Tracks** to the Chrome DevTools performance panel — a **Scheduler** track showing what React was working on at each priority and a **Components** track showing render durations. Being able to say "I'd check the Scheduler track to see whether the work was being starved by a higher-priority lane" is a strong performance answer, because it distinguishes "slow render" from "render never got to run."\r
\r
**For state bugs:** log or inspect in the Components panel rather than adding \`console.log\` in the render body, which double-fires under StrictMode and misleads you. Redux DevTools' time-travel if you're using Redux or Zustand's devtools middleware.\r
\r
**For "it works locally, not in production":** source maps (\`hidden-source-map\`), error boundaries reporting component stacks, \`onRecoverableError\` for hydration mismatches, and cohort segmentation — see the Frontend Architecture guide §8, since a bug affecting 1% of users is an observability problem before it's a debugging one.\r
\r
**The suspects to check early**, because they account for most confusing React bugs: a stale closure in an effect or callback; a missing or wrong dependency array; \`key\` collisions causing state to be reused by the wrong element; state mutation defeating change detection; and an impure render exposed by StrictMode's double-invoke.\r
\r
---\r
\r
**Q43: You suspect a memory leak in a React app. How do you confirm it, find it, and fix it?**\r
\r
Confirm first — "the app gets slow after a while" has several causes and only one of them is a leak.\r
\r
**1. Confirm it's actually a leak.** Chrome DevTools → **Memory** → take a heap snapshot, exercise the suspect flow (navigate in and out of a route ten times), force GC, take another snapshot. Then use **Comparison** view and sort by delta. A leak shows as a monotonically rising baseline that survives GC; a sawtooth that returns to its floor is just normal allocation. The **Performance monitor** panel is the quickest first look — watch the JS heap size and the **DOM node count** while you use the app. A DOM node count that only ever climbs is the clearest signal.\r
\r
**2. Find what's retaining it.** In the comparison snapshot, look for **Detached HTMLElement** entries — DOM nodes removed from the document but still referenced by JavaScript, which is the classic React leak. Select one and read the **Retainers** panel: it shows the chain holding the reference, and that chain names your bug. Also sort by "Objects allocated between snapshot 1 and 2" to see what's accumulating.\r
\r
**3. The React-specific causes, in the order I'd check them:**\r
\r
\`\`\`jsx\r
// 1. Missing effect cleanup — the most common by far\r
useEffect(() => {\r
  const id = setInterval(tick, 1000);\r
  window.addEventListener('resize', onResize);\r
  const sub = socket.subscribe(onMessage);\r
  const obs = new IntersectionObserver(cb); obs.observe(el);\r
  return () => {                     // ← every one of these needs undoing\r
    clearInterval(id);\r
    window.removeEventListener('resize', onResize);\r
    sub.unsubscribe();\r
    obs.disconnect();\r
  };\r
}, []);\r
\`\`\`\r
\r
- **\`addEventListener\` with an inline function** and no matching \`removeEventListener\` — and note \`removeEventListener\` needs the *same function reference*, so an inline arrow can never be removed.\r
- **Timers and intervals** without \`clearInterval\`/\`clearTimeout\`.\r
- **Subscriptions and observers** — WebSocket, \`IntersectionObserver\`, \`ResizeObserver\`, \`MutationObserver\`, store subscriptions.\r
- **An unbounded array in state or a ref.** A live-updating list that appends forever is a leak with a nice UI (see the Frontend Architecture guide's real-time section — cap retention with a ring buffer).\r
- **A closure in a long-lived ref or module-level cache** capturing a large object or a whole component scope. A module-level \`Map\` used as a cache with no eviction is a leak by design; use a \`WeakMap\` when the key is an object whose lifetime you don't control.\r
- **Detached DOM held in a ref** — storing a node in a ref and keeping the ref alive after unmount.\r
- **A stale \`setState\` after unmount** doesn't leak in modern React (it's a no-op and the warning was removed), but the *closure that survived to call it* often does — so treat it as a symptom pointing at a missing cleanup, not the leak itself.\r
\r
**4. Things that look like leaks and aren't**, worth ruling out early: a query cache with a long \`gcTime\` (bounded, by design), an unbounded query cache key built from a changing value (that one *is* a leak — every keystroke creates a new cache entry), and simply rendering more DOM as the user scrolls an unvirtualized list.\r
\r
**5. Verify the fix the same way you found it.** Repeat the snapshot-exercise-GC-snapshot cycle and confirm the delta is flat. "It feels better" is not a fix.\r
\r
**Two things that make this cheaper next time.** **StrictMode** double-mounts effects in development specifically to surface missing cleanup — an effect that leaks will leak twice as fast, which is the point. And in production, monitor heap size in your RUM so a leak shows up as a trend rather than as a support ticket about the app being slow after an hour.\r
\r
**Q44: How do components communicate in React? Walk through the options.**\r
\r
**Short answer:** five mechanisms, and the skill is picking the smallest one that fits the relationship. [§5.4](#54-component-communication) walks through each with code; this is the version to say out loud.\r
\r
- **Parent → child: props.** The default, and it covers most cases.\r
- **Child → parent: a callback prop.** Data flows one way, so a child cannot set its parent's state. The parent passes a function down; the child calls it to report an event, and the parent decides what it means.\r
- **Sibling ↔ sibling: lift the state** to their *closest* common ancestor, which passes it back down. Closest matters, because state placed higher than needed re-renders more of the tree.\r
- **Distant descendant: Context**, but only for real prop drilling, where the middle layers would just forward a value. It is not free: every consumer re-renders when the value changes, so memoise the \`value\` object and split rarely-changing data from frequently-changing data.\r
- **Imperative action: a ref**, for actions rather than data (focus an input, play a video). In React 19 \`ref\` is an ordinary prop, so \`forwardRef\` is no longer needed; expose a narrow API with \`useImperativeHandle\` instead of the raw DOM node.\r
\r
When unrelated branches share state, the answer is a store, not more lifting: TanStack Query for server state, Zustand or Redux for client state.\r
\r
One detail worth volunteering, because it is a real performance bug: when a child's input feeds the parent, keep the in-progress value in the child and notify the parent on **commit** (submit or blur). Lifting every keystroke re-renders the whole subtree on each character.\r
\r
**Q45: What did React 19 remove, and how would you approach upgrading a large codebase to it?**\r
\r
The removals are mostly long-deprecated legacy: **\`findDOMNode\`** (use a ref), **string refs** (\`ref="input"\` → a callback ref), **legacy context** (\`contextTypes\`/\`getChildContext\` → \`createContext\` + \`static contextType\`), **\`propTypes\`**, **\`defaultProps\` on function components** (classes keep it), the **\`ReactDOM.render\`/\`hydrate\`/\`unmountComponentAtNode\`** trio in favour of \`createRoot\`/\`hydrateRoot\`/\`root.unmount()\`, and \`react-test-utils\`. Two are worth calling out because they fail quietly rather than loudly: **\`propTypes\` is silently ignored** in 19, so runtime prop validation you believed you had just stopped happening with no warning; and \`defaultProps\` removal applies **only to function components**, so the same change bites differently depending on component kind. Notably **no lifecycle methods were removed** — classes are discouraged, not deprecated, and error boundaries still require one.\r
\r
For the upgrade I'd go to **18.3 first**, which is 18.2 plus the deprecation warnings, so you can fix everything without a behaviour change and with the ability to ship incrementally. Then run the official codemods (\`npx codemod@latest react/19/migration-recipe\`), which handle string refs, the \`ReactDOM.render\` swap and the \`propTypes\`-to-TypeScript conversion. Then the manual work: replace \`propTypes\` properly since it now fails silently, hunt \`findDOMNode\` in older code, and fix **TypeScript ref callbacks with implicit returns** — because a returned value is now treated as a cleanup function, \`ref={el => (this.input = el)}\` must become a block body. Only after the codebase is green would I adopt the new APIs (Compiler, Actions, \`use\`, \`<Activity>\`), since mixing a migration with feature adoption makes a regression impossible to attribute.\r
\r
---\r
\r
**Q46: What is the \`useRef\` hook and when should it be used?**\r
\r
\`useRef\` returns a mutable object — \`{ current: initialValue }\` — whose **identity is stable for the component's whole lifetime**. Two properties follow from that, and they cover every legitimate use:\r
\r
**Mutating \`.current\` does not re-render.** That is the point. State is for values the UI derives from; a ref is for values the UI does *not* depend on. Timer IDs, a "has this already run" flag, the previous value of a prop, an AbortController, a scroll position you only read in a handler — none of those should cause a render when they change.\r
\r
**It persists across renders.** Unlike a plain local variable, which is recreated every render.\r
\r
The two uses in practice:\r
\r
\`\`\`tsx\r
// 1. A handle to a DOM node\r
function SearchField() {\r
  const inputRef = useRef<HTMLInputElement>(null);\r
  useEffect(() => { inputRef.current?.focus(); }, []);   // autofocus on mount\r
  return <input ref={inputRef} />;\r
}\r
\r
// 2. An instance variable that must not trigger a render\r
function Stopwatch({ tick }: { tick: () => void }) {\r
  const timerRef = useRef<number | null>(null);\r
\r
  const start = () => {\r
    if (timerRef.current !== null) return;              // already running\r
    timerRef.current = window.setInterval(tick, 1000);\r
  };\r
\r
  // Clear on unmount, or the interval outlives the component.\r
  useEffect(() => () => {\r
    if (timerRef.current !== null) clearInterval(timerRef.current);\r
  }, []);\r
\r
  return <button onClick={start}>Start</button>;\r
}\r
\r
// Harness: the ticks are counted in state by the parent, which is what repaints\r
function Demo() {\r
  const [ticks, setTicks] = useState(0);\r
  return <><SearchField /><Stopwatch tick={() => setTicks(t => t + 1)} /> {ticks}s</>;\r
}\r
\r
render(<Demo />);\r
\`\`\`\r
\r
**When NOT to use it.** If the value is displayed, it belongs in state — a ref change will not repaint, so the screen goes stale. The classic bug: \`useRef(0)\`, increment it in a click handler, render \`{ref.current}\`, and the number never visibly changes until something *else* triggers a render, at which point it jumps.\r
\r
**The rule about reading it.** Do not read or write \`.current\` during render. It makes the render impure, and under concurrent rendering React may discard that work. Read refs in effects and event handlers.\r
\r
---\r
\r
**Q47: What are the rules of React hooks, and why do they exist?**\r
\r
Two rules:\r
\r
**1. Only call hooks at the top level.** Never inside a condition, a loop, a nested function, or after an early \`return\`.\r
\r
**2. Only call hooks from a React function** — a component, or another hook.\r
\r
**The reason is that hooks are matched by call order, not by name.** React keeps a linked list of hook states per component and walks it in the order the hooks are called. It has no idea that the third \`useState\` is "the one for the name field"; it only knows it is third. Put a hook behind a condition and the positions shift:\r
\r
\`\`\`text\r
// ✗ Broken on purpose — tagged text so there is no Try it button.\r
function Profile({ showName }) {\r
  const [id, setId] = useState(1);           // slot 1\r
  if (showName) {\r
    const [name, setName] = useState('');    // slot 2 — only sometimes!\r
  }\r
  const [age, setAge] = useState(0);         // slot 2 or 3, depending\r
}\r
\`\`\`\r
\r
When \`showName\` flips, \`age\` starts reading the slot that belonged to \`name\`. React detects the count change and throws *"Rendered fewer hooks than expected"* — but in the variants where the count stays the same, it does not throw and you silently get the wrong value.\r
\r
**How to satisfy the rules when you need conditional behaviour:** call the hook unconditionally and put the condition *inside* it.\r
\r
\`\`\`tsx\r
// Instead of conditionally calling the hook…\r
const { data } = useFetch(shouldFetch ? url : null);   // …pass null and bail inside\r
useEffect(() => { if (!enabled) return; /* … */ }, [enabled]);\r
\`\`\`\r
\r
**Enforce it mechanically.** \`eslint-plugin-react-hooks\` catches both rules plus missing dependencies. Treat \`rules-of-hooks\` as an error, never a warning — it is not a style preference, it is a correctness rule.\r
\r
---\r
\r
**Q48: What are React Fragments used for?**\r
\r
A Fragment groups children without adding a DOM node. \`<></>\` is the shorthand; \`<React.Fragment>\` is the full form.\r
\r
Three reasons you need one:\r
\r
**1. A component must return a single root.** Returning two siblings is a syntax error, and wrapping them in a \`<div>\` changes the DOM.\r
\r
**2. That extra \`<div>\` can break layout.** In a flex or grid container, children are laid out by the *direct* parent. Wrapping two grid items in a \`<div>\` makes them one grid item, and the layout collapses. Same with \`display: contents\` workarounds that a Fragment makes unnecessary.\r
\r
**3. Invalid HTML nesting.** A \`<div>\` cannot go between \`<tr>\` and \`<td>\`, or inside \`<ul>\` around \`<li>\`s. A Fragment can:\r
\r
\`\`\`tsx\r
function Columns() {\r
  return (\r
    <>\r
      <td>Name</td>\r
      <td>Email</td>\r
    </>\r
  );\r
}\r
// <tr><Columns /></tr> produces valid markup; a wrapper <div> would not.\r
\r
function Table() {\r
  return (\r
    <table>\r
      <tbody>\r
        <tr><Columns /></tr>\r
      </tbody>\r
    </table>\r
  );\r
}\r
\r
render(<Table />);\r
\`\`\`\r
\r
**The one case that needs the long form: keys.** The shorthand \`<>\` cannot take props, so a Fragment in a list needs \`<React.Fragment key={...}>\`:\r
\r
\`\`\`tsx\r
{rows.map(row => (\r
  <React.Fragment key={row.id}>\r
    <dt>{row.term}</dt>\r
    <dd>{row.definition}</dd>\r
  </React.Fragment>\r
))}\r
\`\`\`\r
\r
That is the only situation where you *must* write it out, and it comes up whenever one item renders multiple siblings.\r
\r
---\r
\r
**Q49: What are custom hooks? Show an example of when to use one.**\r
\r
A custom hook is a function whose name starts with \`use\` and which calls other hooks. There is no special API — the naming convention is what lets the linter apply the rules of hooks to it.\r
\r
**What they are for: sharing stateful logic, not state.** Two components calling \`useCounter()\` each get their own independent counter. If you want shared *state*, you need context or a store; a custom hook shares the *behaviour*.\r
\r
**When to reach for one.** When the same \`useState\` + \`useEffect\` + cleanup shape appears in more than one component, or when a single component's logic is obscuring what it renders. The test: after extracting, does the component read more like a description of its UI? If yes, it was worth it.\r
\r
**A worked example — the reason is the cleanup.** Subscribing to \`window\` events is three lines of setup and one line of teardown, and the teardown is what people forget:\r
\r
\`\`\`tsx\r
function useMediaQuery(query: string): boolean {\r
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);\r
\r
  useEffect(() => {\r
    const mql = window.matchMedia(query);\r
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);\r
    setMatches(mql.matches);                 // resync in case it changed before we subscribed\r
    mql.addEventListener('change', onChange);\r
    return () => mql.removeEventListener('change', onChange);\r
  }, [query]);\r
\r
  return matches;\r
}\r
\r
// stand-ins so this example runs on its own\r
const DesktopNav = () => <nav>Desktop navigation</nav>;\r
const MobileNav = () => <nav>Mobile navigation (resize the window)</nav>;\r
\r
// Consuming it — the component says nothing about listeners at all\r
function Nav() {\r
  const isWide = useMediaQuery('(min-width: 768px)');\r
  return isWide ? <DesktopNav /> : <MobileNav />;\r
}\r
\`\`\`\r
\r
Every consumer now gets the cleanup for free, and the resync-before-subscribe fix was made once.\r
\r
**When NOT to extract one.** If it is used in exactly one place and does not simplify that place, it is indirection for its own sake. And a hook that takes eight parameters and returns twelve values is a component that should have been split.\r
\r
See §6.3 for \`useToggle\`, \`useDebounce\`, \`useFetch\`, \`useLocalStorage\` and \`useMediaQuery\` written out in full, each with a usage example.\r
\r
---\r
\r
**Q50: How would you implement a component that subscribes to an external data source and cleans up correctly?**\r
\r
Two answers, and which one is right depends on whether the source can change *between* React's render and commit.\r
\r
**The general case — \`useEffect\`.** Subscribe in the effect, unsubscribe in the cleanup, and make the dependency array exactly what the subscription identity depends on:\r
\r
\`\`\`tsx\r
function useRoomMessages(roomId: string) {\r
  const [messages, setMessages] = useState<Message[]>([]);\r
\r
  useEffect(() => {\r
    // Reset on roomId change, or you briefly show the old room's messages.\r
    setMessages([]);\r
    const socket = connect(roomId);\r
    socket.on('message', (m: Message) => setMessages(prev => [...prev, m]));\r
    return () => socket.close();      // runs on unmount AND before every re-subscribe\r
  }, [roomId]);\r
\r
  return messages;\r
}\r
\`\`\`\r
\r
The three things that get graded: the cleanup exists; the dependency array causes a *re-subscribe* when \`roomId\` changes rather than leaking the old socket; and stale data is cleared on change.\r
\r
**The correct case for a store — \`useSyncExternalStore\`.** If you are reading from something outside React (a Redux-style store, \`navigator.onLine\`, \`window.innerWidth\`), \`useEffect\` has a real flaw: between render and the effect firing, the external value can change, and your UI shows a value that was already wrong. Under concurrent rendering, two components can even read *different* values in the same commit — that is **tearing**.\r
\r
\`\`\`tsx\r
function useOnlineStatus(): boolean {\r
  return useSyncExternalStore(\r
    (callback) => {                                   // subscribe\r
      window.addEventListener('online', callback);\r
      window.addEventListener('offline', callback);\r
      return () => {\r
        window.removeEventListener('online', callback);\r
        window.removeEventListener('offline', callback);\r
      };\r
    },\r
    () => navigator.onLine,                           // client snapshot\r
    () => true,                                       // server snapshot (SSR)\r
  );\r
}\r
\`\`\`\r
\r
React handles the subscription lifecycle, re-reads the snapshot at the right moments, and guarantees every component in a commit sees the same value. The third argument is required for SSR — without it, hydration throws.\r
\r
**The rule of thumb:** event streams that you accumulate into state → \`useEffect\`. A value you read *from* somewhere → \`useSyncExternalStore\`.\r
\r
---\r
\r
**Q51: What is the difference between client-side and server-side routing?**\r
\r
**Server-side routing** is the browser's default. A link click is a full HTTP request; the server returns a new HTML document; the browser tears down the page and builds a new one.\r
\r
**Client-side routing** intercepts the click, calls \`history.pushState\` to change the URL without a request, and swaps components in the existing page. No document reload, so JavaScript state, open WebSockets and scroll position all survive.\r
\r
| Aspect | Client-side | Server-side |\r
|---|---|---|\r
| Navigation cost | A data fetch at most, often nothing | Full document round-trip |\r
| First paint | Slower — must download and boot the JS | Faster — HTML arrives ready |\r
| State across navigation | Preserved | Lost |\r
| SEO / no-JS | Needs SSR or pre-rendering to work | Works inherently |\r
| Failure mode | A JS error can break all navigation | A broken page does not break the next link |\r
\r
**What a client-side router must reimplement**, and the source of most bugs: scroll restoration, focus management (a screen reader is never told the page changed unless you announce it), the back/forward buttons, and code-splitting per route.\r
\r
**The modern answer is that the distinction has blurred.** Next.js App Router and React Router's framework mode do server-side rendering for the first paint and client-side transitions afterwards — you get the HTML-arrives-ready first load *and* stateful navigation. RSC pushes this further: a navigation fetches a serialised component payload rather than a full document or a JSON blob.\r
\r
**The accessibility point worth raising unprompted:** with server routing the browser moves focus and announces the new page for you. With client routing nothing happens by default — you must move focus to the new content and use a live region, or keyboard and screen-reader users are simply lost.\r
\r
---\r
\r
**Q52: What is the React event system, and how does it differ from native DOM events?**\r
\r
React does not attach a listener to each element. It attaches **one listener per event type at the root container** (since React 17 — before that it was \`document\`), and dispatches to your handlers by walking the fiber tree. What your handler receives is a **\`SyntheticEvent\`**, React's wrapper over the native event.\r
\r
**Why do it this way.** One listener for a list of 10,000 rows instead of 10,000. It also lets React control *when* handlers run relative to rendering, which is what makes batching and concurrent features possible.\r
\r
The practical differences:\r
\r
**1. Handlers are attached in React's tree, not the DOM tree.** This matters for portals: an event from inside a \`createPortal\`'d modal bubbles to the modal's React *parent*, even though the DOM node is elsewhere in the document. That is usually what you want, and it surprises people who expect DOM bubbling.\r
\r
**2. \`e.stopPropagation()\` only stops React's propagation.** A native listener you added yourself with \`addEventListener\` on an ancestor still fires, because it is on a different system. To stop the native one, \`e.nativeEvent.stopPropagation()\`.\r
\r
**3. Names are camelCase, and the value is a function, not a string.** \`onClick={handler}\`, not \`onclick="handler()"\`.\r
\r
**4. Some events are simulated.** \`onChange\` on an input fires on every keystroke, which native \`change\` does not — native \`change\` fires on blur. React's \`onChange\` is really the native \`input\` event.\r
\r
**5. Event pooling is gone.** In React 16 and earlier the synthetic event was recycled, so reading \`e.target\` asynchronously gave you \`null\` and you needed \`e.persist()\`. **Removed in React 17** — the event is a normal object now, and \`e.persist()\` is a no-op. This is a common stale-knowledge trap in interviews.\r
\r
\`\`\`tsx\r
// Reading the event asynchronously — fine in React 17+, broken before it\r
<input onChange={(e) => {\r
  const value = e.target.value;         // still the safer habit\r
  setTimeout(() => console.log(e.target.value), 100);   // works in 17+\r
}} />\r
\`\`\`\r
\r
**6. Not everything is delegated.** Media events (\`play\`, \`ended\`), \`scroll\`, and a few others do not bubble, so React attaches those directly to the node.\r
\r
**When to use a native listener instead:** anything outside React's tree (\`window\`, \`document\`), \`{ passive: true }\` for scroll performance, and \`{ capture: true }\` for resource-load errors, which do not bubble. Add those in a \`useEffect\` with a cleanup.\r
\r
---\r
\r
**Q53: How do you localize a React application?**\r
\r
Localization is more than swapping strings, and interviewers usually probe the parts beyond that.\r
\r
**1. Do not hand-roll it.** \`react-i18next\` is the default; \`react-intl\` (FormatJS) is the other mainstream choice; \`next-intl\` if you are on Next.js. They handle the pieces you would otherwise get wrong.\r
\r
**2. Interpolation and pluralisation, not concatenation.** \`"You have " + n + " items"\` is untranslatable — word order differs by language, and plural rules are not binary. Arabic has six plural forms; Polish has four. Use ICU message format:\r
\r
\`\`\`tsx\r
const { t } = useTranslation();\r
\r
// en.json: { "cart": "{count, plural, =0 {Your cart is empty} one {# item} other {# items}}" }\r
<p>{t('cart', { count })}</p>\r
\`\`\`\r
\r
**3. Format dates, numbers and currency with \`Intl\`, never manually.** The platform already knows every locale's conventions:\r
\r
\`\`\`tsx\r
new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(1234.5);\r
new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date);\r
new Intl.RelativeTimeFormat(locale).format(-3, 'day');   // "3 days ago"\r
\`\`\`\r
\r
**4. Right-to-left is a layout problem, not a text problem.** Set \`dir="rtl"\` on \`<html>\` and use **logical CSS properties** — \`margin-inline-start\` instead of \`margin-left\`, \`padding-inline\`, \`inset-inline-start\`. Then RTL works without a second stylesheet. Hard-coded \`left\`/\`right\` is the thing that breaks.\r
\r
**5. Load translations per locale, lazily.** Shipping every language to every user is dead weight. Split the bundles and fetch the active locale.\r
\r
**6. Decide where the locale lives.** A URL segment (\`/de/products\`) is the SEO-friendly answer and makes pages shareable; a cookie or \`localStorage\` alone means Google indexes one language. With Next.js, the locale is a route segment and the server renders in the right language on first paint.\r
\r
**7. Leave room for text expansion.** German runs 30–35% longer than English. Fixed-width buttons and single-line truncation break. Test with a pseudo-locale that pads every string.\r
\r
**The React-specific pitfall:** do not interpolate translated HTML with \`dangerouslySetInnerHTML\` to get a link inside a sentence — that is an XSS vector through your translation files. Use \`<Trans>\` (i18next) or \`<FormattedMessage>\` with rich-text placeholders, which interpolate *components* safely.\r
\r
---\r
\r
**Q54: Implement a custom hook that debounces an input value.**\r
\r
The wording matters: the *value* is debounced, not the input. The field stays controlled by immediate state so typing is never laggy — only the value that triggers expensive work lags behind.\r
\r
\`\`\`tsx\r
function useDebouncedValue(value, delay = 300) {\r
  const [debounced, setDebounced] = useState(value);\r
\r
  useEffect(() => {\r
    const id = setTimeout(() => setDebounced(value), delay);\r
    // THIS is the debounce: every new value cancels the pending timer, so the\r
    // state only ever settles after \`delay\` of quiet.\r
    return () => clearTimeout(id);\r
  }, [value, delay]);\r
\r
  return debounced;\r
}\r
\r
function Search() {\r
  const [query, setQuery] = useState('');\r
  const debounced = useDebouncedValue(query, 300);\r
  const [searches, setSearches] = useState(0);\r
\r
  useEffect(() => {\r
    if (debounced) setSearches(n => n + 1);   // stands in for the request\r
  }, [debounced]);\r
\r
  return (\r
    <div style={{ fontFamily: 'system-ui' }}>\r
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Type fast…" />\r
      <p>typed: <b>{query}</b> — searched for: <b>{debounced}</b></p>\r
      <p>searches fired: <b>{searches}</b></p>\r
    </div>\r
  );\r
}\r
\r
render(<Search />);\r
\`\`\`\r
\r
Type quickly and the two lines diverge; stop and they converge one tick later. The search counter rises per *pause*, not per keystroke.\r
\r
**The cleanup is the entire mechanism.** It is not tidy-up — it is the algorithm. Each render with a new \`value\` tears down the previous timer before setting a new one, so only the final keystroke of a burst survives to fire.\r
\r
**What follow-ups usually probe:**\r
\r
- **Why not debounce the input itself?** Because the field would lag behind the keyboard, which users read as the page being broken. Debounce the *derived* value.\r
- **Why \`[value, delay]\` rather than \`[]\`?** With an empty array the effect captures the first value forever and the debounced state never updates — the stale-closure bug.\r
- **Debouncing vs throttling.** Debounce waits for quiet and fires once at the end; throttle fires at a fixed maximum rate throughout. Search suggestions want debounce; a scroll or resize handler wants throttle.\r
- **What debouncing does *not* solve.** It reduces how many requests you send, not the order they return in. Two requests still in flight can resolve out of order, so a slow response for \`"re"\` can overwrite a fast one for \`"react"\`. That needs an \`AbortController\` in the fetching effect — see §7.4 and the *Search with Debounce + Cancel* playground template.\r
- **Debouncing a callback instead.** \`useDebouncedCallback\` needs the function in a ref, because a new function identity on every render would otherwise reset the timer continuously. Debouncing a *value* sidesteps that entirely, which is why it is the version to reach for first.\r
\r
---\r
\r
**Q55: Explain CSR, SSR and SSG — when would you use each?**\r
\r
They differ on one axis: **when the HTML is generated.** Everything else follows from that.\r
\r
| Strategy | HTML built | Cost per request | First paint | Data freshness |\r
|---|---|---|---|---|\r
| **CSR** | in the browser, after JS loads | none — static file | slowest; blank until JS runs | always live |\r
| **SSR** | on the server, per request | highest | fast, personalised | live |\r
| **SSG** | at build time | none — served from a CDN | fastest | as old as the last build |\r
| **ISR** | at build, then regenerated in the background | amortised | fastest | stale up to the revalidate window |\r
\r
**Client-side rendering** ships an empty \`<div id="root">\` and builds everything in the browser. It is right for screens behind a login — an internal dashboard, an editor, a tool — where SEO is irrelevant, the content is per-user anyway, and the app is used for long sessions so a slower first load is amortised across the visit.\r
\r
**Server-side rendering** builds the HTML per request. Choose it when the page is both *public* and *personalised or fast-changing*: a product page with live stock, a feed, search results. You pay for it — server cost per request, and TTFB now includes your data fetching, so a slow API becomes a slow first byte.\r
\r
**Static site generation** builds at deploy time and serves from a CDN. This is the default worth defending for marketing pages, documentation and blogs. It is the fastest and cheapest option by a wide margin; the constraint is that content is only as fresh as your last build.\r
\r
**The follow-up is usually "what if the content changes hourly?"** — and the answer is that the three-way choice is a false one. **ISR** regenerates a static page in the background on a revalidate interval, so you get CDN speed with bounded staleness. And modern frameworks let you mix strategies *per route*: static marketing pages, ISR for the catalogue, SSR for the account area, CSR for the admin tool — in one application.\r
\r
**Two things worth volunteering:**\r
\r
- **SSR does not make your app fast on its own.** It improves FCP and LCP because pixels arrive sooner, but the JavaScript still ships and still hydrates; TTI can be *worse* than CSR if you send a large bundle, because the page looks ready while it is not yet interactive.\r
- **React Server Components are a different axis.** RSC is about *where components execute and whether their code ships at all* — it is not "SSR but newer". See §13.12 and the Next.js & RSC guide.\r
\r
---\r
\r
**Q56: Why doesn't an error boundary catch an async failure?**\r
\r
Because an error boundary catches errors thrown **during React's own work** — rendering a component, running a lifecycle method, or running a constructor — and an async failure does not happen there. By the time your \`fetch\` rejects, the render that started it has long since committed and React is no longer on the stack.\r
\r
The mechanism is ordinary JavaScript, not a React limitation. \`componentDidCatch\` is built on a \`try\`/\`catch\` around the render phase, and a \`try\`/\`catch\` only catches what is thrown **synchronously inside it**:\r
\r
\`\`\`jsx\r
function Broken() {\r
  useEffect(() => {\r
    // Rejects LATER. Nothing is on the stack to catch it — not React's\r
    // try/catch, and not one you write around this call either.\r
    fetch('/api/thing').then(r => r.json()).then(data => data.missing.field);\r
  }, []);\r
  return <p>hello</p>;\r
}\r
\`\`\`\r
\r
**Four things boundaries do not catch, and all for the same reason** — the error is thrown when React is not running:\r
\r
| Not caught | Why |\r
|---|---|\r
| Async callbacks (\`fetch\`, \`setTimeout\`, promises) | thrown after the render has committed |\r
| Event handlers | run in response to the browser, outside the render phase |\r
| Server-side rendering | \`componentDidCatch\` is a commit-phase hook; there is no commit on the server |\r
| Errors thrown in the boundary itself | it cannot catch its own failure — it propagates to the boundary above |\r
\r
**So what do you do instead?** Put the failure into state, and let the *render* throw it — which is back inside React's reach:\r
\r
\`\`\`jsx\r
function Safe() {\r
  const [error, setError] = useState(null);\r
  const [data, setData] = useState(null);\r
\r
  useEffect(() => {\r
    let cancelled = false;\r
    fetch('/api/thing')\r
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })\r
      .then(d => { if (!cancelled) setData(d); })\r
      .catch(e => { if (!cancelled) setError(e); });      // capture it\r
    return () => { cancelled = true; };\r
  }, []);\r
\r
  if (error) throw error;        // ✓ thrown during render — the boundary sees it\r
  if (!data) return <Spinner />;\r
  return <Result data={data} />;\r
}\r
\r
// stand-ins so this example runs on its own (the playground has no /api/thing,\r
// so the request fails and the boundary shows it)\r
const Spinner = () => <p>Loading…</p>;\r
const Result = ({ data }) => <pre>{JSON.stringify(data)}</pre>;\r
class Boundary extends React.Component {\r
  state = { error: null };\r
  static getDerivedStateFromError(error) { return { error }; }\r
  render() {\r
    return this.state.error ? <p role="alert">Caught by the boundary: {this.state.error.message}</p> : this.props.children;\r
  }\r
}\r
\r
render(<Boundary><Safe /></Boundary>);\r
\`\`\`\r
\r
That \`if (error) throw error\` line is the whole trick, and it is what data libraries do for you: TanStack Query's \`throwOnError\` and React Router's \`errorElement\` both take a rejected promise and re-throw it during render so a boundary can handle it.\r
\r
**The one that bites in production** is neither of those: an unhandled rejection or a \`setTimeout\` throw escapes the React tree entirely and reaches the window. Boundaries will never see it, so a real app also installs \`window.addEventListener('error', …)\` and \`'unhandledrejection'\` — which is exactly what this playground does, because a throw inside a \`setInterval\` otherwise left the preview blank with nothing in the console.\r
\r
**Takeaway:** boundaries catch what React throws while React is running. Anything asynchronous has to be caught by you and re-thrown during render — or handled at the window.\r
\r
---\r
\r
**Q57: How would you implement a reorderable drag-and-drop list?**\r
\r
The state is smaller than people expect: **the list itself, plus the id of the item currently being dragged, plus the id it is hovering over.** Two ids, not coordinates — the moment you start tracking pixel positions you are reimplementing the browser.\r
\r
\`\`\`jsx\r
function ReorderableList() {\r
  const [items, setItems] = useState([\r
    { id: 'a', label: 'Design' },\r
    { id: 'b', label: 'Build' },\r
    { id: 'c', label: 'Ship' },\r
  ]);\r
  const [dragId, setDragId] = useState(null);\r
\r
  const move = (fromId, toId) => {\r
    if (fromId === toId) return;\r
    setItems(prev => {\r
      const next = [...prev];\r
      const from = next.findIndex(i => i.id === fromId);\r
      const to = next.findIndex(i => i.id === toId);\r
      next.splice(to, 0, next.splice(from, 1)[0]);   // remove, then re-insert\r
      return next;\r
    });\r
  };\r
\r
  return (\r
    <ul>\r
      {items.map(item => (\r
        <li\r
          key={item.id}\r
          draggable\r
          onDragStart={() => setDragId(item.id)}\r
          onDragOver={e => e.preventDefault()}\r
          onDrop={() => { move(dragId, item.id); setDragId(null); }}\r
          style={{ opacity: dragId === item.id ? 0.4 : 1 }}\r
        >\r
          {item.label}\r
        </li>\r
      ))}\r
    </ul>\r
  );\r
}\r
\r
render(<ReorderableList />);\r
\`\`\`\r
\r
**Three things decide whether this answer lands:**\r
\r
- **\`e.preventDefault()\` in \`onDragOver\` is mandatory.** The HTML drag-and-drop default is *reject the drop*, so without cancelling it \`onDrop\` never fires at all. This is the single most common reason a hand-rolled implementation "does nothing", and it is worth volunteering before you are asked.\r
- **Key by id, and reorder immutably.** The list is being reordered, which is precisely the case where an index key makes React reuse the wrong DOM node — you get the right data with the wrong input values, focus or animation attached to it.\r
- **Drag state belongs in a ref if you are tracking movement.** \`dragId\` changes twice per drag so state is fine, but anything that fires on every \`dragover\` or \`pointermove\` must not call \`setState\` — that is a re-render per mouse move. Write to a ref and commit to state on drop.\r
\r
**Accessibility is the part most candidates miss**, and in an interview it is a differentiator rather than a nice-to-have: native HTML drag-and-drop is **mouse-only**, so a keyboard or screen-reader user cannot reorder anything. The accepted pattern is a parallel keyboard affordance — focusable items where <kbd>Space</kbd> picks up, arrows move, <kbd>Space</kbd> drops and <kbd>Esc</kbd> cancels — with an \`aria-live\` region announcing "Build, moved to position 1 of 3". That is also the main argument for reaching for **dnd-kit** in production, which ships the keyboard sensor and the live-region announcements; \`react-beautiful-dnd\` is no longer maintained.\r
\r
**What else changes at scale:** HTML5 drag-and-drop cannot produce a custom drag preview reliably across browsers and does not work on touch, so cross-platform implementations use pointer events instead. And with a virtualised list, the drop target may not be mounted — the library needs to scroll and measure rather than rely on \`onDragOver\` firing.\r
\r
**Takeaway:** track ids rather than positions, cancel \`dragover\` or nothing drops, key by id because you are reordering, keep per-move updates out of state, and treat keyboard support as part of the feature rather than an extra.\r
\r
---\r
\r
**Q58: What is the difference between \`createElement\` and \`cloneElement\`?**\r
\r
\`React.createElement(type, props, ...children)\` **makes** an element — it is what JSX compiles to, so \`<Button size="lg">Save</Button>\` is literally \`createElement(Button, { size: 'lg' }, 'Save')\`. \`React.cloneElement(element, props, ...children)\` takes an element that **already exists** and returns a copy with its props shallow-merged.\r
\r
\`\`\`jsx\r
const original = <button className="btn" onClick={handleA}>Save</button>;\r
\r
const copy = React.cloneElement(original, { onClick: handleB, disabled: true });\r
// same type and children, className kept, onClick REPLACED, disabled added\r
\`\`\`\r
\r
**Three details that get probed:**\r
\r
- **Props are shallow-merged and later wins**, so passing \`onClick\` replaces the original handler rather than running both. If you want both, compose them yourself: \`onClick: (e) => { original.props.onClick?.(e); mine(e); }\`.\r
- **Children are replaced, not merged.** Omit the children argument and the original's children survive; pass any and they take over entirely.\r
- **\`key\` and \`ref\` are taken from the new props** if you supply them, which is how a parent can key children it did not create.\r
\r
**Where it is actually used** is the compound-component pattern — a \`<Tabs>\` that needs to hand each \`<Tab>\` an \`isActive\` and an \`onSelect\` it could not know about at authoring time. That is why you see it inside libraries far more often than in application code.\r
\r
**Why it is discouraged in application code:** it silently couples the parent to the child's prop names, and there is no type safety — clone in a prop the child does not accept and nothing complains until runtime. The modern alternatives are better on both counts: **context** (the \`<Tabs>\` provider sets \`activeId\`, each \`<Tab>\` reads it), or a **render prop / function child**, both of which make the contract explicit. Reach for \`cloneElement\` when you must augment children you were handed and cannot change their API.\r
\r
---\r
\r
**Q59: What are higher-order components, and would you still write one?**\r
\r
A higher-order component is **a function that takes a component and returns a new component** — the component-level equivalent of a higher-order function. It was React's answer to sharing non-visual logic before hooks existed.\r
\r
\`\`\`jsx\r
function withLogging(Wrapped) {\r
  return function WithLogging(props) {\r
    useEffect(() => { console.log('mounted', Wrapped.name); }, []);\r
    return <Wrapped {...props} />;\r
  };\r
}\r
\r
// Using it — defined once, outside render\r
const Profile = ({ name }) => <p>Hello, {name}</p>;\r
const ProfileWithLogging = withLogging(Profile);\r
\r
render(<ProfileWithLogging name="Ada" />);\r
\`\`\`\r
\r
**For most of what HOCs were used for — sharing stateful logic — a custom hook is strictly better**, and that is the answer an interviewer is listening for. Hooks avoid the three real problems HOCs have:\r
\r
- **Wrapper hell.** Compose five HOCs and the React DevTools tree is five anonymous wrappers deep before you reach anything you wrote.\r
- **Prop collisions, invisibly.** Two HOCs that both inject \`data\` and one silently wins. Nothing warns you, and with TypeScript the types are awkward to express.\r
- **The indirection is unexplicit.** Where did \`this.props.user\` come from? You have to read the export line to find out. \`const user = useUser()\` says it in place.\r
\r
**What HOCs still do that hooks cannot:** hooks can only add *behaviour* to a component, not change what it **renders** or whether it renders at all. So an HOC remains the right tool when you are wrapping the element tree — an error boundary wrapper, \`React.memo\` and \`forwardRef\` themselves (both are HOCs), a route guard that renders a redirect instead of the page, or an analytics wrapper applied uniformly across an existing codebase you cannot rewrite.\r
\r
**If you do write one**, the conventions exist for real reasons: forward every prop with \`{...props}\`, hoist static properties, set a \`displayName\` like \`withLogging(Profile)\` so DevTools is readable, forward refs, and **define the HOC outside render** — creating it during render produces a new component type each time, which unmounts and remounts the whole subtree.\r
\r
---\r
\r
**Q60: How does \`useImperativeHandle\` work, and when is it the right call?**\r
\r
It customises **what a parent receives when it reads a ref to your component**. By default a \`ref\` on a DOM element gives the parent the element itself; on a custom component you decide, and \`useImperativeHandle\` is how:\r
\r
\`\`\`jsx\r
function TextField({ ref }) {              // React 19: ref is a normal prop\r
  const inputRef = useRef(null);\r
  useImperativeHandle(ref, () => ({\r
    focus: () => inputRef.current.focus(),\r
    clear: () => { inputRef.current.value = ''; },\r
  }), []);\r
  return <input ref={inputRef} />;\r
}\r
\r
// Parent\r
function Form() {\r
  const field = useRef(null);\r
  return (\r
    <>\r
      <TextField ref={field} />\r
      <button onClick={() => field.current.focus()}>Focus</button>\r
      <button onClick={() => field.current.clear()}>Clear</button>\r
    </>\r
  );                        // only focus and clear exist — not the raw node\r
}\r
\r
render(<Form />);\r
\`\`\`\r
\r
**The point is narrowing, not access.** Handing back the raw DOM node makes every internal detail part of your public API: a consumer can restyle it, read its children, or attach listeners, and you can never change the markup again. Exposing \`{ focus, clear }\` is a contract you can keep.\r
\r
**The dependency array is the part people miss** — it works like \`useMemo\`'s. Omit it and the handle object is recreated on every render, which matters if the parent stores it or compares it. Include stale values and the parent holds methods closing over old state.\r
\r
**When it is right:** genuinely imperative actions that have no declarative expression — focusing an input, selecting text, playing or seeking media, scrolling an element into view, triggering an animation, opening a \`<dialog>\`. Notice they are all *verbs*.\r
\r
**When it is wrong** — and this is what the question is really testing: if you are using it to push *data* into a child, or to make a child re-render, you are working against React's data flow and the answer is props or lifted state. A ref that exposes \`setValue\` is a controlled component wearing a disguise.\r
\r
Two notes on the modern API: in **React 19 \`ref\` is an ordinary prop**, so \`forwardRef\` is no longer needed for this — though it still works. And a ref callback may now return a **cleanup function**, which replaces the old "called with \`null\` on unmount" convention.\r
**Q61: A \`useEffect\` is causing an infinite re-render loop. How do you diagnose and fix it?**\r
\r
The mechanism is always the same sentence: **the effect sets state, the state change re-renders, the re-render produces a dependency React considers different, so the effect runs again.** React compares deps with \`Object.is\`, and a freshly created object, array or function is never \`Object.is\`-equal to the one from the previous render — so a literal in the dependency array guarantees the loop.\r
\r
> The examples below are deliberately tagged as text rather than as runnable code. Pressing **Try it** on a genuine infinite render would lock up the tab: the React preview runs on the main thread, so the playground's worker timeout cannot rescue it.\r
\r
**Shape 1 — a literal in the deps.** The most common by a wide margin.\r
\r
\`\`\`text\r
// Loops forever: { id } is a new object every render.\r
useEffect(() => {\r
  fetchUser({ id }).then(setUser);\r
}, [{ id }]);\r
\`\`\`\r
\r
**Shape 2 — setting state the effect also depends on.**\r
\r
\`\`\`text\r
useEffect(() => {\r
  setCount(count + 1);       // writes the value it watches\r
}, [count]);\r
\`\`\`\r
\r
**Shape 3 — an unstable prop from the parent.** The child looks innocent; the parent re-creates the value each render.\r
\r
\`\`\`text\r
// Parent\r
<Child options={{ sort: 'asc' }} onDone={() => refresh()} />\r
\r
// Child — deps change on every parent render\r
useEffect(() => { load(options); }, [options, onDone]);\r
\`\`\`\r
\r
**Shape 4 — not an effect at all.** \`setState\` called during render throws \`Too many re-renders\` immediately rather than looping quietly. Worth naming, because the error text sends people hunting through their effects when the call is in the component body.\r
\r
#### Fixing it, in the order you should try\r
\r
**1. Ask whether the effect should exist.** Most of these are derived state wearing an effect's clothes. If the value can be computed during render, compute it — no effect, no deps, no loop. This is the senior signal, and §7.4 covers the full case.\r
\r
\`\`\`tsx\r
function Cart({ items }: { items: { price: number }[] }) {\r
  const total = items.reduce((sum, i) => sum + i.price, 0);  // not useEffect + useState\r
  return <p>Total: {total}</p>;\r
}\r
\r
render(<Cart items={[{ price: 12 }, { price: 30 }]} />);\r
\`\`\`\r
\r
**2. Depend on primitives, not on the object.** \`[user.id]\` is stable across renders in a way \`[user]\` is not.\r
\r
**3. Stabilise the producer, not the consumer.** Wrap the value where it is created — \`useMemo\` for objects, \`useCallback\` for functions — so the child receives the same reference. Memoising inside the child cannot help; the new reference has already arrived.\r
\r
**4. Drop the dependency with a functional update.** \`setCount(c => c + 1)\` does not read \`count\`, so \`count\` leaves the array and Shape 2 disappears.\r
\r
**5. Use a ref for values you need but do not render on.** A ref changes without re-rendering, so it never re-triggers an effect.\r
\r
#### The fix that is not a fix\r
\r
Emptying the dependency array stops the loop, and the linter will tell you so. It also freezes every value the effect closed over at first render, so the effect keeps calling a stale function with stale props — a loud bug traded for a silent one. \`useEffectEvent\` (§16.7) exists precisely for the legitimate version of this want: read the latest value without subscribing to it.\r
\r
---\r
\r
**Q62: Map the class lifecycle methods to their hook equivalents. Where does the mapping break down?**\r
\r
The table is the easy half, and the interesting answer is the part underneath it: **lifecycle methods think in *moments*, effects think in *synchronisation*.** A class asks "what happens when I mount, update, unmount?" An effect asks "what external thing must match this state, and what has to be undone when it stops matching?" That is why the mapping is not one-to-one in either direction — one lifecycle method usually becomes several effects split by concern, and one effect usually replaces three lifecycle methods at once.\r
\r
| Class | Hook equivalent | Note |\r
|---|---|---|\r
| \`constructor\` (state init) | \`useState(initial)\`, or \`useState(() => expensive())\` | the lazy form runs the work once, not per render |\r
| \`componentDidMount\` | \`useEffect(fn, [])\` | runs **after paint**, not before — see below |\r
| \`componentDidUpdate\` | \`useEffect(fn, [deps])\` | no \`prevProps\` argument |\r
| \`componentWillUnmount\` | the function **returned** from \`useEffect\` | one cleanup covers unmount *and* every re-run |\r
| \`getDerivedStateFromProps\` | derive during render, or reset with \`key\` | almost never needs a hook |\r
| \`shouldComponentUpdate\` | \`React.memo\` (+ a comparator) | a wrapper, not a hook |\r
| \`getSnapshotBeforeUpdate\` | \`useLayoutEffect\` reading the DOM before the browser repaints | blocks paint, so use it only to measure |\r
| \`render\` | the function body | no lifecycle involved at all |\r
| \`getDerivedStateFromError\` / \`componentDidCatch\` | **no hook exists** | |\r
\r
#### The four places it breaks down\r
\r
**1. \`componentDidMount\` runs before paint; \`useEffect\` runs after it.** If the effect measures the DOM and then writes a style based on that measurement, the user sees one frame of the wrong layout — a visible flicker. \`useLayoutEffect\` is the true equivalent, and it is the right tool for exactly that case: measuring, scroll restoration, positioning a tooltip against its trigger. It also blocks paint, so everything else belongs in \`useEffect\`.\r
\r
**2. There is no \`prevProps\`.** \`componentDidUpdate(prevProps)\` lets you compare old and new; an effect only knows that a dependency changed. Usually that is enough, because the dependency array *is* the comparison. When you genuinely need the previous value, you keep it yourself in a ref — and needing it is often a sign the logic should be derived during render instead.\r
\r
**3. Error boundaries are still class-only.** \`getDerivedStateFromError\` and \`componentDidCatch\` have no hook, in React 19 or otherwise. Every codebase that looks hook-only has one class left, or imports \`react-error-boundary\`. Say this plainly; interviewers ask it precisely because it is the exception people forget.\r
\r
**4. One class method splits into several effects.** A class puts a subscription, an analytics ping and a document-title update in one \`componentDidMount\` because there is only one method to put them in. As hooks they are three effects with three different dependency arrays and three different cleanups — and that separation is the upgrade, not an inconvenience. The reverse is also true: \`componentDidMount\` + \`componentDidUpdate\` + \`componentWillUnmount\` for a single subscription collapse into **one** effect, which is why the class version so often forgot to resubscribe on prop change.\r
\r
\`\`\`jsx\r
class RoomClass extends React.Component {\r
  componentDidMount() { this.conn = connect(this.props.roomId); }\r
  componentDidUpdate(prevProps) {\r
    // The bug this shape invites: forget these five lines and the room never changes.\r
    if (prevProps.roomId !== this.props.roomId) {\r
      this.conn.close();\r
      this.conn = connect(this.props.roomId);\r
    }\r
  }\r
  componentWillUnmount() { this.conn.close(); }\r
  render() { return <p>Room {this.props.roomId}</p>; }\r
}\r
\r
function RoomHook({ roomId }) {\r
  React.useEffect(() => {\r
    const conn = connect(roomId);\r
    return () => conn.close();   // cleanup runs before every re-run AND on unmount\r
  }, [roomId]);\r
  return <p>Room {roomId}</p>;\r
}\r
\r
function connect(id) {\r
  console.log('connect', id);\r
  return { close: () => console.log('close', id) };\r
}\r
\r
function Demo() {\r
  const [room, setRoom] = React.useState('general');\r
  return (\r
    <div>\r
      <RoomHook roomId={room} />\r
      <button onClick={() => setRoom(r => (r === 'general' ? 'random' : 'general'))}>\r
        Switch room\r
      </button>\r
    </div>\r
  );\r
}\r
\r
render(<Demo />);\r
\`\`\`\r
\r
Press **Switch room** and the console reads \`close general\` then \`connect random\` — the cleanup is the \`componentWillUnmount\` *and* the first half of \`componentDidUpdate\`, which is the whole reason the hook version cannot forget to resubscribe.\r
\r
**What to volunteer:** the three \`UNSAFE_*\` methods (\`componentWillMount\`, \`componentWillReceiveProps\`, \`componentWillUpdate\`) have no equivalent because they were removed for being unsafe under concurrent rendering — they could run more than once per commit. And \`useEffect\` runs **twice on mount in development StrictMode**, deliberately, to surface a missing cleanup; a class's \`componentDidMount\` did not, which is why migrating sometimes appears to introduce a bug it is actually revealing.\r
\r
---\r
\r
**Q63: What are React Hooks, and what is each one used for?**\r
\r
Hooks are functions that let a **function component** use React features that used to need a class: state, side effects, context and refs. React stores each hook's data on the component's fiber **by call order**. That is the whole reason for the rules of hooks (Q47): call them at the top level, never inside a condition or loop, so the order is the same on every render.\r
\r
They were added in React 16.8 to fix three problems with classes. Stateful logic could only be reused through HOCs and render props, which wrapped components in layers. Related code was split across lifecycle methods: a subscription set up in \`componentDidMount\` was torn down in \`componentWillUnmount\`. And \`this\` binding was a constant source of bugs. A custom hook fixes the first, \`useEffect\` with a cleanup fixes the second, and a function component has no \`this\` at all.\r
\r
What each one is for, in one line (the full reference with pitfalls is [§6.2](#62-built-in-hooks-reference)):\r
\r
| Hook | Reach for it when |\r
|---|---|\r
| \`useState\` | A value that changes and should update the UI: an input, a toggle, a counter |\r
| \`useReducer\` | Several related state values, or the next state depends on an action type |\r
| \`useEffect\` | Syncing with something outside React: a subscription, a timer, a non-React widget. **Not** for deriving values ([§7.4](#74-when-not-to-use-useeffect)) |\r
| \`useLayoutEffect\` | You must measure or change the DOM **before** the browser paints, to avoid a flicker |\r
| \`useContext\` | Reading a value from a Provider higher up, without passing props through every level |\r
| \`useRef\` | A mutable value that should **not** trigger a re-render (a timer id, the previous value), or a DOM node |\r
| \`useImperativeHandle\` | Exposing a small API (\`focus()\`, \`reset()\`) to a parent's ref instead of the raw DOM node |\r
| \`useMemo\` | An expensive calculation, or an object that must keep the same identity between renders |\r
| \`useCallback\` | A function passed to a \`memo\` child or used in a dependency array, so it keeps the same identity |\r
| \`useTransition\` | Marking an update as non-urgent so typing stays responsive (filtering a big list) |\r
| \`useDeferredValue\` | The same idea when you receive the value and don't own the setter |\r
| \`useSyncExternalStore\` | Subscribing to a store outside React (Redux, Zustand, \`matchMedia\`) without tearing |\r
| \`useId\` | Stable, SSR-safe ids for \`htmlFor\` / \`aria-describedby\` |\r
| \`useDebugValue\` | A label for a custom hook in React DevTools |\r
\r
React 19 added the forms and async hooks: \`use\` (read a promise or context, and it may be called conditionally), \`useActionState\`, \`useFormStatus\` and \`useOptimistic\`, all covered in [§16](#16-react-19-features).\r
\r
\`\`\`tsx\r
function SearchBox() {\r
  const [query, setQuery] = useState('');          // state that drives the UI\r
  const inputRef = useRef<HTMLInputElement>(null);  // DOM node, no re-render\r
\r
  useEffect(() => {                                 // sync with the outside world\r
    inputRef.current?.focus();\r
  }, []);\r
\r
  const upper = query.toUpperCase();               // derived during render, not stored\r
\r
  return (\r
    <div>\r
      <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} />\r
      <p>{upper || 'Type something'}</p>\r
    </div>\r
  );\r
}\r
\r
render(<SearchBox />);\r
\`\`\`\r
\r
**What to volunteer:** the one hook people misuse most is \`useEffect\`. Most "my component loops" and "my data is stale" bugs are an effect doing a job that belongs in render (a derived value) or in an event handler (a response to a click). And when the same combination of hooks appears in two components, pull it into a **custom hook** ([§6.3](#63-custom-hooks), Q49). That is how hooks deliver the reuse classes never had.\r
\r
---\r
\r
**Q64: Memoization was added to improve performance, but the app became slower and used more memory. How is that possible?**\r
\r
Memoization is a trade: you **pay on every render** (store the previous inputs, compare them, keep the cached result) in exchange for **sometimes skipping work**. It only wins when the skipped work costs more than the checking, and when the cache actually gets hits. Each of the usual failures breaks one of those two conditions.\r
\r
**1. The memo never hits, so you pay for both.** \`React.memo\` compares every prop with \`Object.is\`. One inline object, array or arrow function (\`style={{…}}\`, \`onClick={() => …}\`, \`items={list.filter(…)}\`) is a new reference on every render, so the comparison fails every time. The component renders anyway, *plus* the comparison. \`children\` counts too: JSX passed as children is a new element on every render, so a memoized component that takes \`children\` usually re-renders on every parent render.\r
\r
**2. The dependencies change every render.** \`useMemo(() => …, [options])\`, where \`options\` is created during render, recomputes every time. Now it is the original work plus an allocated closure, an allocated dependency array and a comparison.\r
\r
**3. The work was cheap to begin with.** Wrapping \`a + b\`, a string format or a small \`filter\` in \`useMemo\` costs more than recomputing it. Most renders are fast. The expensive part is usually rendering a big subtree, not calculating a value.\r
\r
**4. Memory: caches keep things alive.** Each \`useMemo\` and \`memo\` keeps its last inputs and output for the life of the component. On a list of 10,000 memoized rows that is 10,000 sets of stored props. A hand-written \`memoize\` helper is worse, because it caches *every* input it has ever seen and never forgets any:\r
\r
\`\`\`js\r
function memoize(fn) {\r
  const cache = new Map();\r
  let hits = 0;\r
  const memoized = (key) => {\r
    if (cache.has(key)) { hits++; return cache.get(key); }\r
    const value = fn(key);\r
    cache.set(key, value);\r
    return value;\r
  };\r
  memoized.stats = () => ({ entries: cache.size, hits });\r
  return memoized;\r
}\r
\r
const formatTime = memoize(ts => new Date(ts).toISOString());\r
\r
const base = Date.UTC(2026, 0, 1);\r
for (let i = 0; i < 100000; i++) formatTime(base + i);   // every key is new\r
\r
console.log(formatTime.stats());   // { entries: 100000, hits: 0 }\r
\`\`\`\r
\r
Every timestamp is unique, so the cache has 100,000 entries and **zero hits**. It is pure memory growth, and every call now also does a \`Map\` lookup. The same happens with a memoized selector keyed by a new object, or a cache keyed by request params that include a timestamp.\r
\r
**How to find it.** Use the React DevTools Profiler, recording the same interaction with and without the memo. Turn on "Record why each component rendered" to see which prop changed. That is how you find the one unstable prop defeating a \`memo\`. For memory, take two heap snapshots around the interaction and look for a growing \`Map\` or retained props arrays.\r
\r
**What to do instead.**\r
- Remove memoization the Profiler cannot justify.\r
- Stabilise props so an existing \`memo\` actually works. Move state down to where it is used, or pass components as \`children\` so they aren't re-created.\r
- Bound any cache you write (an LRU with a size limit), and never key one on values that are unique per call.\r
- Let the React Compiler (Q27) do it. It memoizes at a finer grain than people do by hand, and it doesn't forget a dependency.\r
\r
**The sentence that answers the question:** memoization is not free. It is a bet that the inputs repeat and that the skipped work is expensive, and when either part is false you pay the checking cost and the memory cost for nothing.\r
\r
---\r
\r
**Q65: What are SSR and CSR, and how does each one affect SEO and performance?**\r
\r
**CSR (client-side rendering):** the server sends an almost empty HTML page and a JavaScript bundle. The browser downloads and runs the JavaScript, the app fetches its data, and only then does content appear. **SSR (server-side rendering):** the server runs the React components for each request and sends HTML that already contains the content. The browser shows it straight away, and then JavaScript **hydrates** it, attaching event handlers so it becomes interactive. Q55 covers the wider family, including SSG and ISR. This answer is about the two consequences interviewers ask about.\r
\r
**SEO: what does a crawler actually receive?**\r
\r
| Aspect | CSR | SSR |\r
|---|---|---|\r
| First HTML response | \`<div id="root"></div>\` plus script tags | the full content, headings, links and meta tags |\r
| Google | can run JavaScript, but the page is **queued for rendering**, which can delay indexing, and anything that fails or times out while rendering is not indexed | indexes the HTML directly |\r
| Other search engines | JavaScript support varies and is less reliable | fine |\r
| **Link previews** (Slack, LinkedIn, WhatsApp, X, Facebook) | **broken or generic**: these crawlers do not run JavaScript, so they never see per-page \`og:title\` / \`og:image\` tags set by the app | correct per page |\r
\r
The link-preview row is the one people forget, and it is often the real reason a team needs server rendering: a shared product link that shows a blank card costs clicks even if Google indexes the page perfectly. Also, SEO needs more than content in the HTML: a real \`<title>\` and description per URL, proper links (\`<a href>\`, not \`onClick\` navigation), correct status codes (a missing page should return **404**, not a 200 "not found" screen), and a sitemap.\r
\r
**Performance: which metrics each one helps and hurts.**\r
\r
| Aspect | CSR | SSR |\r
|---|---|---|\r
| **TTFB** (time to first byte) | fast: a static file from a CDN | slower: the server renders, and often fetches data, first |\r
| **FCP / LCP** (when content appears) | late: download, parse and run the JS, then fetch data, then render | early: the content is in the first response |\r
| **Interactivity** (INP, TBT) | the page is interactive once it appears | the page can **look ready before it is**: until hydration finishes, clicks do nothing. Hydrating a big page is heavy main-thread work |\r
| Later navigations | fast: only data is fetched, the app is already loaded | fast as well once hydrated, since SSR frameworks navigate on the client too |\r
| Server cost | a static CDN, very cheap | a server running on every request, which needs scaling and caching |\r
\r
So **SSR moves the cost, it does not remove it.** It shows content sooner and makes the server do the work, but the same JavaScript still downloads and runs to hydrate. SSR can therefore give a better LCP and a *worse* INP on a slow phone. Streaming SSR (sending the page in chunks as data arrives) and React Server Components (components that never ship JavaScript to the browser) exist to reduce exactly that hydration cost.\r
\r
**How to choose:**\r
\r
- **Public pages that must be found or shared** (marketing, product pages, articles, docs): server-render them, or generate them at build time (SSG) if the content doesn't change per request. SSG gives the SEO of SSR with CDN-speed TTFB.\r
- **Pages behind a login** (dashboards, admin tools, settings): CSR is fine. Crawlers can't reach them anyway, and returning users have the app cached.\r
- **Most real products mix both**: static or server-rendered public pages, and a client-rendered app behind login. Frameworks like Next.js let you choose per route.\r
\r
**A real example: this app.** PrepHub is a client-rendered single-page app on GitHub Pages, which has no server. Every URL gets a copy of the same HTML shell, so deep links load without a redirect, but that shell is empty: the guide text only appears after JavaScript runs. That is fine for a study tool people use directly. But it means a crawler or a link-preview bot sees the same page for every guide. Fixing that would take pre-rendering each route to HTML at build time, which is the SSG option above.\r
\r
**The sentence that answers the question:** CSR is cheap to host and fast after the first load, but ships an empty page to crawlers and shows content late; SSR sends real content immediately, which is better for SEO and LCP, at the cost of server work and a hydration delay before the page responds.\r
\r
---\r
\r
### Real-World API & Data Scenarios\r
\r
These come from "real-time" interview lists, where the question describes a situation rather than naming an API. Most of them are about data from a server: how it gets to the screen, what the user sees while it is on its way, and what happens when it does not arrive.\r
\r
**Q66: What is \`React.memo\`, and when should you use it?**\r
\r
**Short answer:** \`React.memo\` wraps a component so that React **skips re-rendering it when its props are the same as last time**. Use it for a component that is expensive to render *and* often re-rendered by its parent with unchanged props.\r
\r
"The same" means each prop is compared with \`Object.is\`, one by one (a *shallow* comparison). Numbers and strings compare by value. Objects, arrays and functions compare by **reference**, so one created during the parent's render is new every time, and \`memo\` never skips.\r
\r
\`\`\`tsx\r
function Plain({ label }) {\r
  console.log('Plain renders');\r
  return <p>{label}</p>;\r
}\r
\r
const Memoised = React.memo(function Memoised({ label }) {\r
  console.log('Memoised renders');\r
  return <p>{label}</p>;\r
});\r
\r
const MemoisedWithObject = React.memo(function MemoisedWithObject({ style }) {\r
  console.log('MemoisedWithObject renders');\r
  return <p style={style}>styled</p>;\r
});\r
\r
function Parent() {\r
  const [count, setCount] = React.useState(0);\r
  React.useEffect(() => {\r
    if (count < 2) setCount(count + 1);       // re-render the parent twice more\r
  }, [count]);\r
  return (\r
    <div>\r
      <Plain label="hi" />\r
      <Memoised label="hi" />\r
      <MemoisedWithObject style={{ color: 'tomato' }} />\r
    </div>\r
  );\r
}\r
\r
render(<Parent />);\r
\`\`\`\r
\r
\`\`\`text\r
Plain renders\r
Memoised renders\r
MemoisedWithObject renders\r
Plain renders\r
MemoisedWithObject renders\r
Plain renders\r
MemoisedWithObject renders\r
\`\`\`\r
\r
The parent rendered three times. \`Plain\` followed it every time, \`Memoised\` rendered only once because \`"hi"\` equals \`"hi"\`, and \`MemoisedWithObject\` gained nothing: \`{ color: 'tomato' }\` is a new object on every render. Moving that object outside the component, or wrapping it in \`useMemo\`, would fix it.\r
\r
**Use it when** a list row, chart or large form section is slow to render and its parent re-renders for unrelated reasons. **Skip it when** the component is cheap (the comparison then costs more than it saves), when its props change on nearly every render anyway, or when moving state down fixes the problem without it (Q11). If the project uses React Compiler, it adds this memoisation for you.\r
\r
---\r
\r
**Q67: Two components need to share the same data. How would you design it?**\r
\r
**Short answer:** move the data to the **closest parent they both have** and pass it down as props ("lifting state up"). Reach for context or a store only when that parent is far away or many components need it. And if the data comes from a server, let a query cache share it.\r
\r
\`\`\`tsx\r
function SearchBox({ query, onQueryChange }) {\r
  return <input value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Search" />;\r
}\r
\r
function ResultCount({ query }) {\r
  const fruits = ['apple', 'banana', 'cherry', 'grape'];\r
  const count = fruits.filter((f) => f.includes(query.toLowerCase())).length;\r
  return <p>{count} matching fruits</p>;\r
}\r
\r
// The shared value lives in the nearest common parent.\r
function Page() {\r
  const [query, setQuery] = React.useState('');\r
  return (\r
    <div>\r
      <SearchBox query={query} onQueryChange={setQuery} />\r
      <ResultCount query={query} />\r
    </div>\r
  );\r
}\r
\r
render(<Page />);\r
\`\`\`\r
\r
Neither sibling owns \`query\`. The parent owns it, gives the value to both, and gives the setter to the one that changes it. Data flows one way, so there is exactly one place to look when it is wrong.\r
\r
**When lifting is not enough, pick by what the data is:**\r
\r
| Situation | Use |\r
|---|---|\r
| Siblings, or a few levels apart | lift state to the common parent |\r
| Many components at different depths, value changes rarely (user, theme, locale) | context |\r
| Many components, value changes often, or complex update logic | a store: Zustand, Redux Toolkit |\r
| The data comes from an API | a query cache (TanStack Query, RTK Query): both components ask for the same key and share one request |\r
\r
The last row is the one most often missed. If two components show the same user's profile, neither should own a copy. Both call \`useQuery({ queryKey: ['user', id] })\`, the cache makes one request, and both update together when it refetches.\r
\r
---\r
\r
**Q68: How do you handle loading, success, empty and error states for an API call?**\r
\r
**Short answer:** model the request as **one status value** with four possible states, and render something specific for each. The two that get forgotten are **empty**, which is a success with nothing in it, and **error**, which needs a way to try again.\r
\r
Three separate booleans (\`isLoading\`, \`isError\`, \`hasData\`) allow combinations that make no sense, like loading *and* failed at once. One \`status\` field cannot be in two states. The TypeScript guide's Q25 shows the typed version of the same idea.\r
\r
\`\`\`tsx\r
// A fake API so each state can be tried. Real code would call fetch here.\r
function fetchUsers(outcome) {\r
  return new Promise((resolve, reject) =>\r
    setTimeout(() => {\r
      if (outcome === 'error') reject(new Error('Server returned 500'));\r
      else resolve(outcome === 'empty' ? [] : ['Asha', 'Ravi', 'Meera']);\r
    }, 600)\r
  );\r
}\r
\r
function useUsers(outcome) {\r
  const [state, setState] = React.useState({ status: 'loading' });\r
  const [attempt, setAttempt] = React.useState(0);\r
\r
  React.useEffect(() => {\r
    let ignore = false;\r
    setState({ status: 'loading' });\r
    fetchUsers(outcome)\r
      .then((users) => { if (!ignore) setState({ status: 'success', users }); })\r
      .catch((error) => { if (!ignore) setState({ status: 'error', error }); });\r
    return () => { ignore = true; };            // a newer request replaces this one\r
  }, [outcome, attempt]);\r
\r
  return { state, retry: () => setAttempt((n) => n + 1) };\r
}\r
\r
function UserList({ outcome }) {\r
  const { state, retry } = useUsers(outcome);\r
\r
  if (state.status === 'loading') return <p aria-busy="true">Loading users…</p>;\r
  if (state.status === 'error') {\r
    return (\r
      <div role="alert">\r
        <p>Could not load users. {state.error.message}</p>\r
        <button onClick={retry}>Try again</button>\r
      </div>\r
    );\r
  }\r
  if (state.users.length === 0) return <p>No users yet. Invite someone to get started.</p>;\r
  return <ul>{state.users.map((u) => <li key={u}>{u}</li>)}</ul>;\r
}\r
\r
function Demo() {\r
  const [outcome, setOutcome] = React.useState('success');\r
  return (\r
    <div>\r
      {['success', 'empty', 'error'].map((o) => (\r
        <button key={o} onClick={() => setOutcome(o)} aria-pressed={outcome === o}>{o}</button>\r
      ))}\r
      <UserList outcome={outcome} />\r
    </div>\r
  );\r
}\r
\r
render(<Demo />);\r
\`\`\`\r
\r
**What makes each state good, not just present:**\r
\r
- **Loading.** A **skeleton** (grey shapes where the content will be) beats a spinner for anything with a known layout, because the page does not jump when the data arrives. For requests that are usually fast, wait about 200 ms before showing anything, or users see a flash. When *refetching* data that is already on screen, keep showing the old data with a small "updating" hint rather than blanking it.\r
- **Empty.** Say what is empty and what to do next ("No orders yet. Browse products"). A blank area looks like a bug.\r
- **Error.** Say what failed in plain words, keep the rest of the page working, and offer **Try again**. Distinguish "you are offline" from "the server failed" if you can. \`role="alert"\` makes a screen reader announce it.\r
- **Success.** Only here is the data guaranteed to exist, so only here do you read it.\r
\r
**In practice** TanStack Query and RTK Query give you exactly this status field, plus retries, caching and cancellation, and most teams should not hand-write the hook above. Being able to write it is what the question is testing.\r
\r
---\r
\r
**Q69: An API response takes 10 seconds. What would you show the user?**\r
\r
**Short answer:** feedback that **changes with time**, so the user knows it is still working. Show the page structure immediately, say it is taking longer than usual after a few seconds, and offer a way to cancel. If the operation is *routinely* this slow, the real fix is on the server: turn it into a background job.\r
\r
Research on response times (Jakob Nielsen's classic limits) gives the three thresholds this follows: about **0.1 s** feels instant, about **1 s** keeps the user's train of thought, and beyond about **10 s** people lose focus and start doing something else.\r
\r
| Time waiting | What to show |\r
|---|---|\r
| 0 – 1 s | the page layout with a skeleton where the slow part will go; the rest of the page usable |\r
| 1 – 3 s | a spinner or progress indicator on the slow part only |\r
| about 3 s | a message: "This is taking longer than usual…" |\r
| about 8 s | a **Cancel** button, and if it helps, "You can leave this page, we'll notify you when it's ready" |\r
| a timeout you chose | stop waiting and show an error with **Try again** |\r
\r
If the server can report progress (a percentage, "step 2 of 4"), show it. A real progress bar feels faster than an unknown wait of the same length.\r
\r
\`\`\`tsx\r
// Picks a message based on how long we have been waiting.\r
function useWaitingMessage(isWaiting) {\r
  const [seconds, setSeconds] = React.useState(0);\r
  React.useEffect(() => {\r
    if (!isWaiting) return;\r
    setSeconds(0);\r
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);\r
    return () => clearInterval(id);\r
  }, [isWaiting]);\r
\r
  if (!isWaiting) return null;\r
  if (seconds < 3) return 'Loading your report…';\r
  if (seconds < 8) return 'This is taking longer than usual…';\r
  return 'Still working. You can cancel and try again later.';\r
}\r
\r
function Report() {\r
  const [waiting, setWaiting] = React.useState(true);\r
  const message = useWaitingMessage(waiting);\r
  return (\r
    <div>\r
      <p aria-live="polite">{message || 'Report ready.'}</p>\r
      {waiting && <button onClick={() => setWaiting(false)}>Cancel</button>}\r
    </div>\r
  );\r
}\r
\r
render(<Report />);\r
\`\`\`\r
\r
**Things that make it worse:**\r
\r
- **Blocking the whole page** with a full-screen spinner when only one panel is slow. Load everything else and let the user work.\r
- **No timeout.** A \`fetch\` has none by default and can wait for minutes. Set one with \`AbortSignal.timeout(ms)\`, somewhat longer than the slowest normal response.\r
- **Retrying automatically** on a slow request that has not failed. That adds load to a server that is already struggling.\r
\r
**When 10 seconds is normal (reports, exports, AI generation):** do not keep an HTTP request open for it. The server answers straight away with \`202 Accepted\` and a job id, the browser checks the job's status by polling, Server-Sent Events or a WebSocket, and the user can leave and come back. The API Design guide's Q9 covers the server side.\r
\r
---\r
\r
**Q70: The user navigates away while an API request is still running. What should happen?**\r
\r
**Short answer:** it depends on what the request is for. A request that only **loads data for that page** should be **cancelled**, because nobody will see the result. A request that **changes something** (save, pay, upload) should usually be **allowed to finish**, and its result reported somewhere that is still on screen.\r
\r
**Cancelling a page's data request** is done with an \`AbortController\`. The effect's cleanup function runs when the component unmounts, which is exactly when the user leaves the page.\r
\r
\`\`\`tsx\r
// A fake fetch that honours an AbortSignal, as the real fetch does.\r
function fakeFetch(url, { signal }) {\r
  return new Promise((resolve, reject) => {\r
    const timer = setTimeout(() => resolve({ url, rows: 3 }), 300);\r
    signal.addEventListener('abort', () => {\r
      clearTimeout(timer);\r
      reject(new DOMException('The request was cancelled', 'AbortError'));\r
    });\r
  });\r
}\r
\r
function ReportPage() {\r
  const [data, setData] = React.useState(null);\r
\r
  React.useEffect(() => {\r
    const controller = new AbortController();\r
    fakeFetch('/api/report', { signal: controller.signal })\r
      .then(setData)\r
      .catch((err) => {\r
        if (err.name === 'AbortError') console.log('request cancelled, nothing to show');\r
        else console.log('real failure, show the error state');\r
      });\r
    return () => controller.abort();          // runs when the user leaves this page\r
  }, []);\r
\r
  return <p>{data ? 'Loaded ' + data.rows + ' rows' : 'Loading…'}</p>;\r
}\r
\r
function App() {\r
  const [page, setPage] = React.useState('report');\r
  React.useEffect(() => {\r
    const id = setTimeout(() => {\r
      console.log('user navigates away');\r
      setPage('home');\r
    }, 100);\r
    return () => clearTimeout(id);\r
  }, []);\r
  return page === 'report' ? <ReportPage /> : <p>Home</p>;\r
}\r
\r
render(<App />);\r
\`\`\`\r
\r
\`\`\`text\r
user navigates away\r
request cancelled, nothing to show\r
\`\`\`\r
\r
**Why cancelling matters:**\r
\r
- **It saves work.** The browser stops downloading, and the server may stop too if it watches for the client disconnecting.\r
- **It prevents the real bug, which is stale data landing on the wrong screen.** With a parameter in the URL (say \`/users/1\` then \`/users/2\`), the slow response for user 1 can arrive *after* the fast one for user 2 and overwrite it. Aborting the old request, or ignoring its result as Q68's \`ignore\` flag does, stops that.\r
- It is **not** about a memory leak warning any more. React 18 removed the "can't perform a state update on an unmounted component" warning, because the update is simply ignored. The warning taught people to fear the wrong thing.\r
\r
**Treat the error for what it is.** An \`AbortError\` is not a failure the user should see, so check \`err.name\` and ignore it, as the demo does. Showing "Something went wrong" because the user clicked a link is a common bug.\r
\r
**Do not cancel a save.** Aborting a \`fetch\` stops the browser waiting; it does **not** undo anything on the server, which may already have written the change. So for a mutation, let it finish and report the result through something that outlives the page, such as a toast (the Toast / Snackbar template), or ask "Leave without saving?" when there are unsaved changes.\r
\r
**You often get this for free.** TanStack Query passes a \`signal\` to your query function and cancels it when nothing is using the query any more, and React Router's data loaders receive \`request.signal\`, which is aborted when the user navigates away mid-load.\r
\r
---\r
\r
**Q71: Your backend returns 401 Unauthorized. How would you refresh the token automatically?**\r
\r
**Short answer:** put the logic in **one place**, the function every API call goes through. When a response is a 401, refresh the access token **once**, retry the original request **once** with the new token, and if the refresh itself fails, log the user out. The detail that is graded is making sure several requests that fail at the same moment share **one** refresh.\r
\r
**The flow:**\r
\r
1. A request comes back \`401\`. The access token has expired.\r
2. Call the refresh endpoint. The **refresh token** travels in an \`HttpOnly\` cookie, so JavaScript never reads it (the OAuth & SSO guide's Q5 explains why).\r
3. Store the new access token **in memory** and retry the original request once.\r
4. If the refresh fails, the session is over: clear the user, and send them to the login page with a link back to where they were.\r
\r
**The race.** A page often fires several requests at once. If the token has expired, they all get a 401 together, and a naive handler refreshes several times in parallel. With refresh-token rotation, where each refresh invalidates the previous refresh token, the second refresh uses a token the first one just invalidated, fails, and logs the user out for no reason. The fix is **single-flight**: the first 401 starts the refresh and stores its promise, and every other 401 waits on that same promise.\r
\r
\`\`\`js\r
// ---- a fake server: the token the browser starts with has expired ----\r
let currentValidToken = 'token-2';\r
let refreshCalls = 0;\r
\r
async function server(path, token) {\r
  await new Promise((r) => setTimeout(r, 20));\r
  if (path === '/auth/refresh') {\r
    refreshCalls++;\r
    return { status: 200, body: { accessToken: currentValidToken } };\r
  }\r
  if (token !== currentValidToken) return { status: 401 };\r
  return { status: 200, body: path + ' ok' };\r
}\r
\r
// ---- the client: every request goes through apiFetch ----\r
let accessToken = 'token-1';     // kept in memory, never in localStorage\r
let refreshing = null;           // the ONE refresh in progress, shared by every caller\r
\r
function refreshAccessToken() {\r
  if (!refreshing) {\r
    refreshing = server('/auth/refresh')        // the refresh cookie is sent automatically\r
      .then((res) => {\r
        if (res.status !== 200) throw new Error('Session expired, please log in again');\r
        accessToken = res.body.accessToken;\r
      })\r
      .finally(() => { refreshing = null; });   // the next expiry starts a fresh refresh\r
  }\r
  return refreshing;\r
}\r
\r
async function apiFetch(path, alreadyRetried = false) {\r
  const res = await server(path, accessToken);\r
  if (res.status === 401 && !alreadyRetried) {\r
    await refreshAccessToken();                // everyone with a 401 waits for the same refresh\r
    return apiFetch(path, true);               // retry ONCE, never in a loop\r
  }\r
  if (res.status === 401) throw new Error('Still unauthorised after refreshing: log out');\r
  return res.body;\r
}\r
\r
// Three requests that all hit an expired token at the same moment.\r
Promise.all([apiFetch('/orders'), apiFetch('/profile'), apiFetch('/cart')]).then((results) => {\r
  console.log(results.join(', '));\r
  console.log('refresh calls:', refreshCalls);\r
});\r
\`\`\`\r
\r
\`\`\`text\r
/orders ok, /profile ok, /cart ok\r
refresh calls: 1\r
\`\`\`\r
\r
**Three rules that stop it looping or leaking:**\r
\r
- **Retry once.** The \`alreadyRetried\` flag means a request that still gets a 401 with a fresh token fails, rather than refreshing forever.\r
- **Never run the 401 handler on the refresh call itself.** If \`/auth/refresh\` returns 401, that is the "log out" signal, not a reason to refresh again.\r
- **Only retry after refreshing if the request is safe to repeat.** A \`GET\` always is. A \`POST\` that the server may have half-processed should carry an idempotency key (the Rate-Limited Button template explains it).\r
\r
**With axios** this is a response interceptor: on a 401, await the shared refresh promise, set the new header, and return \`axios(originalConfig)\` with a \`_retry\` flag on the config. Same logic, same three rules.\r
\r
**Across tabs**, each tab has its own memory, so two tabs can still refresh at the same time. \`navigator.locks.request('token-refresh', …)\` makes the refresh single-flight across tabs too, and a \`BroadcastChannel\` can hand the new token to the others. **Proactive refresh**, renewing a minute before the token expires, reduces how often users hit the 401 at all, but you still need the 401 path, because clocks drift and laptops sleep.\r
\r
---\r
\r
**Q72: How would a React app communicate with Spring Boot microservices?**\r
\r
**Short answer:** not directly with each service. The browser talks to **one entry point**, an API gateway (often Spring Cloud Gateway) or a Backend for Frontend (BFF, a small server owned by the frontend team), which routes each request to the right service. On the React side, every call goes through **one API client module** that knows the base URL, attaches authentication, and turns every error into one shape.\r
\r
\`\`\`text\r
Browser (React)\r
   │  https://app.example.com/api/...      one origin, one auth check\r
   ▼\r
API gateway / BFF            Spring Cloud Gateway: routing, JWT check, rate limits, CORS\r
   ├── /api/orders/**   →  order-service     (Spring Boot)\r
   ├── /api/users/**    →  user-service      (Spring Boot)\r
   └── /api/payments/** →  payment-service   (Spring Boot)\r
\`\`\`\r
\r
**Why a single entry point:** the browser does not need to know how many services exist or where they run, authentication is checked in one place, and every call is same-origin, so there are no CORS rules to maintain per service. Services can be split, merged or moved without shipping a new frontend.\r
\r
**The React side, piece by piece:**\r
\r
1. **One API client.** A single module (a small \`fetch\` wrapper or an axios instance) holds the base URL from an environment variable (\`import.meta.env.VITE_API_URL\` in Vite), sends credentials, handles the 401 refresh (Q71), and sets a timeout. Components never call \`fetch\` with a hard-coded URL.\r
2. **Local development without CORS.** Point the dev server's proxy at the backend, so the browser still sees one origin:\r
\r
   \`\`\`text\r
   // vite.config.js\r
   export default defineConfig({\r
     server: {\r
       proxy: { '/api': 'http://localhost:8080' },   // the gateway, or a single service\r
     },\r
   });\r
   \`\`\`\r
\r
3. **CORS, when the frontend really is on a different origin.** Configure it **once, at the gateway**, not with \`@CrossOrigin\` on every controller. With cookies or credentials you must list exact origins (a \`*\` is not allowed with credentials), and any response header the frontend needs to read, such as \`Content-Disposition\` for downloads (Q73), must be listed in \`exposedHeaders\`.\r
4. **Types generated from the backend.** With \`springdoc-openapi\`, each service publishes an OpenAPI description, and tools such as \`openapi-typescript\` or \`orval\` generate TypeScript types or a whole client from it. A renamed field in a Java DTO then fails the frontend build instead of failing in production.\r
5. **One error shape.** Spring Boot returns errors in one of two formats, so convert both at the client boundary:\r
\r
\`\`\`js\r
// Spring Boot errors arrive in one of two shapes. Turn both into one.\r
//  - ProblemDetail (RFC 9457): { type, title, status, detail, instance }\r
//    used when spring.mvc.problemdetails.enabled=true, or returned by your own handlers\r
//  - Boot's default error page: { timestamp, status, error, path }\r
//    where "message" is left out unless server.error.include-message is set\r
function toAppError(status, body = {}) {\r
  const message =\r
    body.detail ||                       // ProblemDetail's human-readable explanation\r
    body.message ||                      // only if the server was configured to include it\r
    body.title ||\r
    body.error ||\r
    'Request failed';\r
  return { status, message, path: body.instance || body.path || null };\r
}\r
\r
console.log(toAppError(404, { type: 'about:blank', title: 'Not Found', status: 404, detail: 'Order 42 does not exist', instance: '/api/orders/42' }).message);\r
console.log(toAppError(500, { timestamp: '2026-09-26T10:00:00Z', status: 500, error: 'Internal Server Error', path: '/api/orders' }).message);\r
console.log(toAppError(502).message);\r
\`\`\`\r
\r
\`\`\`text\r
Order 42 does not exist\r
Internal Server Error\r
Request failed\r
\`\`\`\r
\r
**Three Spring-specific details that trip React developers:**\r
\r
- **Pages start at 0.** Spring Data's \`Pageable\` reads \`?page=0&size=20&sort=name,asc\`, and page 0 is the first page. Your table probably shows "Page 1", so convert at the API client (\`page: uiPage - 1\`) rather than scattering \`- 1\` through components.\r
- **The page response shape.** Returning a Spring Data \`Page\` directly has no guaranteed JSON structure (Spring Data 3.3+ logs a warning about it). With \`@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)\` it becomes a stable \`{ content: [...], page: { size, number, totalElements, totalPages } }\`. Agree on this shape with the backend team once.\r
- **Authentication.** Typically the gateway, or each service as an OAuth 2.0 *resource server*, validates the JWT on every request. If you use a session cookie instead of a bearer token, Spring Security's CSRF protection applies, and the frontend must send the CSRF token back in a header.\r
\r
**Real-time updates** from Spring come as WebSockets (often with the STOMP protocol on top) or Server-Sent Events (\`SseEmitter\`). Those also go through the gateway; the Real-Time Web guide covers the client side.\r
\r
---\r
\r
**Q73: How would you download a CSV or PDF file returned by a Spring Boot API?**\r
\r
**Short answer:** if the browser can reach the file with its cookies, just **link to it** and let the browser download it. If the request needs an \`Authorization\` header, **fetch it as a blob**, create a temporary URL for it, and click a hidden link. In the second case, the gotcha is the file name: it is in the \`Content-Disposition\` header, which JavaScript cannot read cross-origin unless the server exposes it.\r
\r
**Option 1: a plain link (best when it works).** If authentication is a cookie and the API is same-origin (or behind your gateway), an ordinary link is enough:\r
\r
\`\`\`text\r
<a href="/api/reports/42/export?format=csv" download>Download CSV</a>\r
\`\`\`\r
\r
The browser streams the file straight to disk, shows its own progress bar, and never holds the whole file in memory, so it works for a 2 GB export. The server's \`Content-Disposition: attachment; filename="report.csv"\` tells it to save rather than display, and names the file.\r
\r
**Option 2: fetch, blob, temporary link.** Needed when the API expects \`Authorization: Bearer …\`, because a plain link cannot send headers. (It uses \`document\`, so it is shown as text rather than run here.)\r
\r
\`\`\`text\r
async function downloadFile(url, accessToken) {\r
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + accessToken } });\r
\r
  // Check first. A failed request still has a body: the error JSON.\r
  // Skip this and the user downloads "report.pdf" containing {"status":500,...}.\r
  if (!res.ok) throw new Error('Download failed: ' + res.status);\r
\r
  const blob = await res.blob();\r
  const filename = filenameFromDisposition(res.headers.get('Content-Disposition')) || 'download';\r
\r
  const objectUrl = URL.createObjectURL(blob);    // a temporary URL pointing at the blob in memory\r
  const a = document.createElement('a');\r
  a.href = objectUrl;\r
  a.download = filename;                          // "save as this name" instead of navigating\r
  document.body.appendChild(a);\r
  a.click();\r
  a.remove();\r
  URL.revokeObjectURL(objectUrl);                 // free the memory; the download has started\r
}\r
\`\`\`\r
\r
For a PDF you want to **view** rather than save, \`window.open(objectUrl)\` opens it in the browser's PDF viewer instead.\r
\r
**Reading the file name** is the fiddly part. Servers send it in two forms: \`filename="report.csv"\`, and \`filename*=UTF-8''…\` for names with non-ASCII characters, which should win when both are present.\r
\r
\`\`\`js\r
function filenameFromDisposition(header) {\r
  if (!header) return null;\r
  // filename*=UTF-8''na%C3%AFve.csv  (RFC 5987: percent-encoded, preferred when present)\r
  const encoded = /filename\\*\\s*=\\s*([^']*)''([^;]+)/i.exec(header);\r
  if (encoded) return decodeURIComponent(encoded[2].trim());\r
  // filename="report.csv"  or  filename=report.csv\r
  const plain = /filename\\s*=\\s*"?([^";]+)"?/i.exec(header);\r
  return plain ? plain[1].trim() : null;\r
}\r
\r
console.log(filenameFromDisposition('attachment; filename="orders-2026-09.csv"'));\r
console.log(filenameFromDisposition("attachment; filename=\\"naive.csv\\"; filename*=UTF-8''na%C3%AFve.csv"));\r
console.log(filenameFromDisposition('inline'));\r
\`\`\`\r
\r
\`\`\`text\r
orders-2026-09.csv\r
naïve.csv\r
null\r
\`\`\`\r
\r
**The header that silently disappears.** If the frontend and API are on different origins, the browser hides every response header from JavaScript except a short safe list, and \`Content-Disposition\` is not on it. \`res.headers.get('Content-Disposition')\` then returns \`null\` even though the header is visible in DevTools. The server must send \`Access-Control-Expose-Headers: Content-Disposition\`; in Spring that is \`exposedHeaders("Content-Disposition")\` in the CORS configuration. On the Spring side the header itself is easiest to build with \`ContentDisposition.attachment().filename("report.csv", StandardCharsets.UTF_8).build()\`, which also produces the \`filename*\` form.\r
\r
**Two more details worth saying:**\r
\r
- **Large files.** A blob holds the entire file in memory before the save starts. For big exports, prefer option 1, or have the server return a short-lived signed URL (for example an S3 pre-signed URL) that the browser can download directly.\r
- **CSV and Excel.** Excel on Windows guesses the encoding of a CSV and often gets UTF-8 wrong, turning \`é\` into \`Ã©\`. Starting the file with a byte-order mark (\`\uFEFF\`) makes it read UTF-8 correctly.\r
\r
---\r
\r
### Rendering, Patterns and Everyday Pitfalls\r
\r
Questions that come up in almost every React interview, usually phrased as "why does this happen?". Most answers point to a reference section above for depth.\r
\r
**Q74: Why does my effect run twice in development?**\r
\r
**Short answer:** because your app is wrapped in \`<StrictMode>\`. In **development only**, StrictMode mounts every component, immediately unmounts it, and mounts it again, so each effect runs setup → cleanup → setup. It is a test: if your effect's cleanup does not fully undo its setup, the double run exposes the bug now, instead of in production. Production runs everything once.\r
\r
\`\`\`tsx\r
function Chat({ roomId }) {\r
  React.useEffect(() => {\r
    console.log('connect to', roomId);\r
    return () => console.log('disconnect from', roomId);   // the cleanup undoes the setup\r
  }, [roomId]);\r
  return <p>Room: {roomId}</p>;\r
}\r
\r
render(\r
  <React.StrictMode>\r
    <Chat roomId="general" />\r
  </React.StrictMode>\r
);\r
\`\`\`\r
\r
\`\`\`text\r
connect to general\r
disconnect from general\r
connect to general\r
\`\`\`\r
\r
That is the output in a development build. (This app's playground runs React's *production* build, so Try it prints only the first line: StrictMode checks do nothing in production.)\r
\r
Because the cleanup undoes the setup, a connect-disconnect-connect sequence leaves exactly one connection, which is the correct end state. The double run only looks wrong. It becomes a real bug when the cleanup is missing: two subscriptions, two timers, two chat connections.\r
\r
**Why React does this.** React may genuinely unmount and remount a component while keeping its state: with \`<Activity>\` (Q28), fast refresh during development, and features that are still being built. An effect that survives the StrictMode check survives all of those. §15.9 has the full list of what StrictMode double-invokes.\r
\r
**How to respond to it:**\r
\r
- **Subscriptions, timers, listeners, connections:** return a cleanup that undoes them. This is always the fix.\r
- **Data fetching:** ignore or abort the first request in the cleanup (Q68's \`ignore\` flag, Q70's \`AbortController\`). You will see two requests in the Network tab in development; the first is cancelled or ignored. In production there is one.\r
- **Something that must happen once per app load** (analytics init, reading a URL token): do it outside React, at module level or before \`render\`, not in a component's effect.\r
\r
**What not to do:** remove \`<StrictMode>\`, or add a \`useRef\` flag that skips the second run. Both hide the symptom and keep the bug.\r
\r
---\r
\r
**Q75: What is automatic batching, and when would you use \`flushSync\`?**\r
\r
**Short answer:** when you call several state setters in a row, React **batches** them: it waits until your code finishes and then re-renders **once** with all the changes. Since React 18 this happens everywhere, including inside \`setTimeout\`, promises and native event listeners, which is why it is called *automatic* batching. \`flushSync\` is the rare opt-out: it forces React to apply an update and update the DOM **immediately**.\r
\r
\`\`\`tsx\r
function Profile() {\r
  const [name, setName] = React.useState('');\r
  const [age, setAge] = React.useState(0);\r
  console.log('render', JSON.stringify({ name, age }));\r
\r
  React.useEffect(() => {\r
    setTimeout(() => {\r
      setName('Asha');       // no render yet\r
      setAge(30);            // still no render\r
    }, 50);                  // one render after the callback finishes\r
  }, []);\r
\r
  return <p>{name} {age}</p>;\r
}\r
\r
render(<Profile />);\r
\`\`\`\r
\r
\`\`\`text\r
render {"name":"","age":0}\r
render {"name":"Asha","age":30}\r
\`\`\`\r
\r
Two setters, one render. Before React 18 this code would have rendered twice (updates inside a \`setTimeout\` were not batched), and briefly shown a name with the wrong age. The benefit is both speed and correctness: the screen never shows a half-applied update.\r
\r
**The consequence people trip on:** state does not change the moment you call the setter. Reading \`name\` right after \`setName('Asha')\` still gives the old value, because the new one only exists in the *next* render (tricky Q1 walks through it).\r
\r
**When \`flushSync\` is actually needed:** when the next line of code must see the updated DOM, usually to measure it or move focus.\r
\r
\`\`\`tsx\r
// In a real file: import { flushSync } from 'react-dom';\r
function Messages() {\r
  const [items, setItems] = React.useState(['first']);\r
  const listRef = React.useRef(null);\r
\r
  const add = () => {\r
    flushSync(() => {\r
      setItems((list) => [...list, 'message ' + (list.length + 1)]);\r
    });\r
    // The DOM already has the new item here, so this sees it.\r
    console.log('items in the DOM:', listRef.current.children.length);\r
    listRef.current.lastElementChild.scrollIntoView({ block: 'nearest' });\r
  };\r
\r
  return (\r
    <div>\r
      <ul ref={listRef}>{items.map((m) => <li key={m}>{m}</li>)}</ul>\r
      <button onClick={add}>Add</button>\r
    </div>\r
  );\r
}\r
\r
render(<Messages />);\r
\`\`\`\r
\r
Clicking **Add** logs \`items in the DOM: 2\`. Without \`flushSync\` it would log \`1\`, and the scroll would target the item that *used* to be last.\r
\r
Use it sparingly. It forces a synchronous render, skips the scheduling React would otherwise do, and a \`flushSync\` inside a render or an effect is itself a warning. Most "I need the DOM after updating" cases are better handled with an effect or a ref callback.\r
\r
---\r
\r
**Q76: What is a portal, and how do events behave inside one?**\r
\r
**Short answer:** \`createPortal(children, domNode)\` renders children into a **different place in the DOM**, usually \`document.body\`, while keeping them in the **same place in the React tree**. It exists for modals, tooltips and dropdowns that would otherwise be clipped by an ancestor's \`overflow: hidden\` or lose a \`z-index\` fight. §15.7 has the details.\r
\r
**The graded part is what "same place in the React tree" means.** Context still reaches the portalled children, and React events **bubble up the React tree, not the DOM tree**. A click inside a modal that lives in \`document.body\` still reaches an \`onClick\` on the component that rendered the modal.\r
\r
\`\`\`tsx\r
// In a real file: import { createPortal } from 'react-dom';\r
function Page() {\r
  const [target, setTarget] = React.useState(null);   // the DOM node to portal into\r
\r
  return (\r
    <div>\r
      <section onClick={() => console.log('section heard the click')}>\r
        <p>The button below is rendered somewhere else in the DOM.</p>\r
        {target && createPortal(\r
          <button onClick={() => console.log('button clicked')}>Click me</button>,\r
          target\r
        )}\r
      </section>\r
      {/* Outside the section in the DOM. */}\r
      <div ref={setTarget} style={{ marginTop: 20, padding: 10, border: '1px dashed #888' }} />\r
    </div>\r
  );\r
}\r
\r
render(<Page />);\r
\`\`\`\r
\r
Clicking the button prints:\r
\r
\`\`\`text\r
button clicked\r
section heard the click\r
\`\`\`\r
\r
In the DOM, the button is not inside the \`<section>\` at all. React still delivers the click to the section's handler, because in React's tree the button is its child.\r
\r
**Why this matters in practice:**\r
\r
- **"Click outside to close" breaks.** A handler that checks \`sectionRef.current.contains(event.target)\` says the click was *outside*, because in the DOM it was. Check against the portal's own node too.\r
- **A parent's \`onClick\` fires for clicks inside the modal.** If a card opens a modal and the card itself is clickable, clicks in the modal bubble to the card. Call \`event.stopPropagation()\` at the modal's root.\r
- **Accessibility is still your job.** A portal moves the markup; it does not trap focus, restore focus on close, or hide the page behind from screen readers. The Modal (Portal + Focus Trap) template does all three.\r
\r
---\r
\r
**Q77: Why does \`{count && <Badge />}\` show a \`0\` on the screen?**\r
\r
**Short answer:** because \`&&\` returns its **left side** when that side is falsy, and React renders the number \`0\` as text. \`false\`, \`null\` and \`undefined\` render nothing, but \`0\` and \`NaN\` are numbers, so they appear. Use a real boolean, or a ternary.\r
\r
\`\`\`tsx\r
function Badge({ count }) {\r
  return <span> ({count} new)</span>;\r
}\r
\r
function Inbox({ count }) {\r
  return (\r
    <p>\r
      Inbox\r
      {count && <Badge count={count} />}\r
    </p>\r
  );\r
}\r
\r
render(<Inbox count={0} />);\r
\`\`\`\r
\r
This renders \`Inbox0\`. The expression \`0 && <Badge />\` evaluates to \`0\`, and \`0\` is valid content. The same happens with \`{items.length && <List />}\` on an empty list, and with \`NaN\` from a failed calculation.\r
\r
**Three safe forms:**\r
\r
\`\`\`tsx\r
function Inbox({ count }) {\r
  return (\r
    <div>\r
      <p>Inbox {count > 0 && <span>({count} new)</span>}</p>              {/* a real boolean */}\r
      <p>Inbox {count ? <span>({count} new)</span> : null}</p>            {/* a ternary */}\r
      <p>Inbox {Boolean(count) && <span>({count} new)</span>}</p>         {/* explicit conversion */}\r
    </div>\r
  );\r
}\r
\r
render(<Inbox count={0} />);\r
\`\`\`\r
\r
**Two related rules that come up in the same conversation:**\r
\r
- **Conditional rendering unmounts.** \`{isOpen && <Panel />}\` destroys the panel and its state when it closes. If the panel holds a half-filled form, hide it instead: CSS, the \`hidden\` attribute, or \`<Activity mode="hidden">\` in React 19 (Q28).\r
- **The same component in the same position keeps its state**, even across branches of a ternary. \`{isAdmin ? <Form role="admin" /> : <Form role="user" />}\` is one \`Form\` whose props changed, so its state carries over. Give each branch a different \`key\` when that is not what you want (Q34).\r
\r
---\r
\r
**Q78: How would you build a form in React? Compare controlled inputs, a form library and React 19 form actions.**\r
\r
**Short answer:** all three work, and they suit different forms. **Controlled inputs** give you the value on every keystroke, which is right for live validation and inputs that affect other UI. A **form library** such as React Hook Form suits big forms with many validation rules. **React 19 form actions** handle the submit itself (pending state, errors, reset) with very little code.\r
\r
| Aspect | Controlled inputs | React Hook Form | Form actions (React 19) |\r
|---|---|---|---|\r
| Where the values live | React state, one \`useState\` per field or one object | the DOM, read by the library through refs | the DOM, read as \`FormData\` on submit |\r
| Re-renders while typing | every keystroke | almost none | none |\r
| Validation | you write it | rules or a schema (Zod, Yup), per field | on submit, in the action |\r
| Pending and error state | you write it | built in | built in: \`useActionState\`, \`useFormStatus\` |\r
| Best for | small forms, live feedback, dependent fields | large forms, complex validation | submit-centric forms, Server Actions in Next.js |\r
\r
**What form actions look like.** You pass a function to the form's \`action\`. React calls it with the form's data when it is submitted, \`useActionState\` keeps whatever the action returned (usually an error or a success message), and \`isPending\` is true while it runs.\r
\r
\`\`\`tsx\r
// Pretend server call: rejects taken usernames.\r
function saveUsername(name) {\r
  return new Promise((resolve) =>\r
    setTimeout(() => resolve(name === 'admin' ? { error: 'That username is taken' } : { ok: true }), 300)\r
  );\r
}\r
\r
async function signUp(previousState, formData) {\r
  const name = String(formData.get('username') || '').trim();\r
  if (name.length < 3) return { error: 'At least 3 characters', value: name };\r
  const result = await saveUsername(name);\r
  if (result.error) return { error: result.error, value: name };\r
  return { message: 'Welcome, ' + name + '!' };\r
}\r
\r
function SignUpForm() {\r
  const [state, formAction, isPending] = React.useActionState(signUp, {});\r
  return (\r
    <form action={formAction}>\r
      <label>\r
        Username <input name="username" defaultValue={state.value || ''} />\r
      </label>\r
      <button type="submit" disabled={isPending}>{isPending ? 'Saving…' : 'Sign up'}</button>\r
      {state.error && <p role="alert">{state.error}</p>}\r
      {state.message && <p>{state.message}</p>}\r
    </form>\r
  );\r
}\r
\r
render(<SignUpForm />);\r
\`\`\`\r
\r
Try \`ab\`, then \`admin\`, then a real name. Three things happen with no extra code: the button disables itself while the action runs; the error comes back from the action as state, so no \`try/catch\` or error \`useState\` is needed; and after a **successful** submit React **resets the form's uncontrolled inputs**, which is why the failed cases pass the typed value back through \`defaultValue\`.\r
\r
\`useFormStatus()\` (from \`react-dom\`) gives a child component such as a shared \`<SubmitButton>\` the pending state of whichever form it is inside, so the button does not need a prop. It must be called in a component rendered *inside* the \`<form>\`.\r
\r
**How to choose in an interview:** "Uncontrolled plus an action for most submit forms, controlled where the UI reacts while the user types, and React Hook Form with a schema once there are more than a handful of rules." Whichever you pick, validation on the client is for the user's convenience; the server validates again.\r
\r
---\r
\r
**Q79: How do you type React components with TypeScript?**\r
\r
**Short answer:** type **props** with a \`type\` or \`interface\`, **children** as \`React.ReactNode\`, **events** with React's event types, and use **generics** when a component works with items of any type. Let inference do the rest; most hooks need no annotation at all.\r
\r
\`\`\`tsx\r
// 1. Props, with children typed as ReactNode (anything React can render)\r
type CardProps = {\r
  title: string;\r
  footer?: React.ReactNode;           // optional\r
  children: React.ReactNode;\r
};\r
\r
function Card({ title, footer, children }: CardProps) {\r
  return (\r
    <section>\r
      <h3>{title}</h3>\r
      {children}\r
      {footer && <footer>{footer}</footer>}\r
    </section>\r
  );\r
}\r
\r
// 2. Extending a native element: every <button> prop, plus your own\r
type ButtonProps = React.ComponentProps<'button'> & { variant?: 'primary' | 'ghost' };\r
\r
function Button({ variant = 'primary', ...rest }: ButtonProps) {\r
  return <button data-variant={variant} {...rest} />;\r
}\r
\r
// 3. Events and state\r
function Search() {\r
  const [query, setQuery] = React.useState('');                          // inferred: string\r
  const [picked, setPicked] = React.useState<string | null>(null);        // annotate when the start value is not the full type\r
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);\r
  return (\r
    <div>\r
      <input value={query} onChange={onChange} />\r
      <Button onClick={() => setPicked(query)}>Pick</Button>\r
      {picked && <p>Picked: {picked}</p>}\r
    </div>\r
  );\r
}\r
\r
// 4. A generic component: the item type is inferred from the items you pass\r
type ListProps<T> = {\r
  items: T[];\r
  getKey: (item: T) => string;\r
  renderItem: (item: T) => React.ReactNode;\r
};\r
\r
function List<T>({ items, getKey, renderItem }: ListProps<T>) {\r
  return <ul>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;\r
}\r
\r
function App() {\r
  const users = [{ id: 'u1', name: 'Asha' }, { id: 'u2', name: 'Ravi' }];\r
  return (\r
    <Card title="Team" footer={<small>2 people</small>}>\r
      <List items={users} getKey={(u) => u.id} renderItem={(u) => u.name} />\r
      <Search />\r
    </Card>\r
  );\r
}\r
\r
render(<App />);\r
\`\`\`\r
\r
**What each of those buys you**, checked with the TypeScript compiler:\r
\r
- **The generic \`List\`** infers \`T\` as \`{ id: string; name: string }\` from \`items\`, so a typo inside \`renderItem\`, \`(u) => u.nme\`, is a compile error: *Property 'nme' does not exist… Did you mean 'name'?*\r
- **\`React.ComponentProps<'button'>\`** gives \`Button\` every native prop (\`onClick\`, \`disabled\`, \`type\`, \`aria-*\`) with the right types, and \`variant="danger"\` fails because it is not in the union.\r
- **\`React.ChangeEvent<HTMLInputElement>\`** makes \`e.target.value\` a \`string\`. Inline handlers (\`onChange={(e) => …}\`) are inferred and need no annotation.\r
\r
**Two questions that usually follow:**\r
\r
- **\`React.FC\` or a plain function?** Either works. \`React.FC\` used to add a hidden \`children\` prop, which is why many style guides banned it; since React 18's types it no longer does, so \`const Card: React.FC<{ title: string }> = ({ title, children }) => …\` is now an error on \`children\`. Plain functions with typed props are the more common style today.\r
- **Generic arrow functions in \`.tsx\`:** \`const List = <T,>(props: ListProps<T>) => …\` needs the trailing comma, or the parser reads \`<T>\` as a JSX tag.\r
\r
(The playground strips types without checking them, so Try it runs this but cannot show a type error; see the TypeScript guide's Q10.)\r
\r
---\r
\r
**Q80: What patterns do you use to make a component reusable?**\r
\r
**Short answer:** start with **composition through \`children\`**, the simplest and most flexible. When parts of a component need to share state, use **compound components**. When the parent needs to control *what* is rendered, use a **render prop**. And for anything with a value, support both **controlled and uncontrolled** use.\r
\r
**1. Composition with \`children\` and "slot" props.** Instead of a component with fifteen props for every variation, let the caller pass content in. \`<Card title="…" footer={<Actions />}>{body}</Card>\` is easier to extend than \`<Card title body footerText footerButtonLabel onFooterClick />\`.\r
\r
**2. Compound components.** Several components that work together, sharing state through context, so the caller arranges the pieces freely. This is how \`<select>\`/\`<option>\` works, and how most component libraries build tabs, menus and accordions.\r
\r
\`\`\`tsx\r
const DisclosureContext = React.createContext(null);\r
\r
function Disclosure({ children, defaultOpen = false }) {\r
  const [open, setOpen] = React.useState(defaultOpen);\r
  const id = React.useId();\r
  return <DisclosureContext.Provider value={{ open, setOpen, id }}>{children}</DisclosureContext.Provider>;\r
}\r
\r
function useDisclosure() {\r
  const ctx = React.useContext(DisclosureContext);\r
  if (!ctx) throw new Error('Disclosure parts must be inside <Disclosure>');   // a clear error beats a null crash\r
  return ctx;\r
}\r
\r
Disclosure.Button = function DisclosureButton({ children }) {\r
  const { open, setOpen, id } = useDisclosure();\r
  return <button aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{children}</button>;\r
};\r
\r
Disclosure.Panel = function DisclosurePanel({ children }) {\r
  const { open, id } = useDisclosure();\r
  return <div id={id} hidden={!open}>{children}</div>;\r
};\r
\r
function App() {\r
  return (\r
    <Disclosure>\r
      <h3><Disclosure.Button>Shipping details</Disclosure.Button></h3>   {/* the caller decides the markup around it */}\r
      <Disclosure.Panel>Ships in 2 working days.</Disclosure.Panel>\r
    </Disclosure>\r
  );\r
}\r
\r
render(<App />);\r
\`\`\`\r
\r
The caller put the button inside an \`<h3>\`, which \`Disclosure\` never had to know about. With a single \`<Disclosure title body />\` component, that would have needed another prop.\r
\r
**3. Render props.** The component owns the behaviour and calls a function you pass to render it. \`<Autocomplete renderOption={(option, { active }) => …} />\` lets each caller style an option without the component knowing. Custom hooks replaced most render props for sharing *logic* (Q49); they are still the right tool when the component has to decide *where* your markup goes.\r
\r
**4. Controlled and uncontrolled.** A reusable input, tabs or accordion should accept \`value\` plus \`onChange\` (the parent controls it) **or** \`defaultValue\` (the component manages itself). The usual implementation: use the prop when it is given, internal state when it is not. The Frontend System Design guide's tricky Q8 covers what to do when a caller passes both.\r
\r
**What to avoid:** a "god component" with a prop for every case (\`showIcon\`, \`iconPosition\`, \`iconColor\`…), and HOCs for new code (Q59). The test for a good API is whether the next unexpected requirement needs a new prop or can be done by the caller.\r
\r
---\r
\r
**Q81: What is a stale closure in React, and how do you fix one?**\r
\r
**Short answer:** every render creates new functions, and each function remembers the props and state **of the render it was created in**. A function that keeps running after later renders, such as a \`setInterval\` callback or an event listener added once, keeps seeing those old values. That is a stale closure.\r
\r
\`\`\`tsx\r
function Timer() {\r
  const [count, setCount] = React.useState(0);\r
\r
  React.useEffect(() => {\r
    const id = setInterval(() => {\r
      setCount(count + 1);          // "count" is the value from the FIRST render: always 0\r
    }, 1000);\r
    return () => clearInterval(id);\r
  }, []);                            // the effect never re-runs, so the callback is never replaced\r
\r
  return <p>{count}</p>;\r
}\r
\r
render(<Timer />);\r
\`\`\`\r
\r
This shows \`1\` and then stays at \`1\` forever. The interval callback was created during the first render, when \`count\` was \`0\`, so every tick computes \`0 + 1\`. (Tricky Q6 traces it tick by tick.)\r
\r
**The fixes, and when each fits:**\r
\r
| Fix | Code | Use when |\r
|---|---|---|\r
| **Functional update** | \`setCount((c) => c + 1)\` | the new state depends only on the old state. The simplest fix here |\r
| **Correct dependencies** | \`}, [count]);\` | the effect should restart when the value changes. Here that means a new interval every second, which works but is wasteful |\r
| **A ref holding the latest value** | \`latest.current = value\` in an effect, read \`latest.current\` in the callback | a long-lived callback needs the latest value, and restarting is expensive (a socket, a subscription) |\r
| **\`useEffectEvent\`** (React 19.2) | \`const onTick = useEffectEvent(() => …)\` | logic inside an effect needs the latest props and state, without being a reason to re-run the effect (Q29) |\r
\r
**How to spot it:** a value that is right on the first render and never updates; a handler that "remembers" an old filter or an old user; an \`eslint-disable\` above a dependency array. The \`react-hooks/exhaustive-deps\` lint rule catches most of these before they ship, which is why disabling it is a code-review flag.\r
\r
---\r
\r
**Q82: Why does my input lose focus on every keystroke?**\r
\r
**Short answer:** almost always because a **component is defined inside another component**. Each render of the parent creates a brand-new component function, React sees a different component type in that position, and it **unmounts the old one and mounts a new one**, which throws away the input, its focus and its state.\r
\r
\`\`\`tsx\r
function Form() {\r
  const [name, setName] = React.useState('');\r
\r
  // ❌ A new component function on every render of Form\r
  function NameField() {\r
    return <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type here" />;\r
  }\r
\r
  return (\r
    <div>\r
      <NameField />\r
      <p>Hello {name}</p>\r
    </div>\r
  );\r
}\r
\r
render(<Form />);\r
\`\`\`\r
\r
Type one letter: the letter appears, and the input loses focus. \`setName\` re-renders \`Form\`, which defines a new \`NameField\`. To React, \`NameField\` from the previous render and \`NameField\` from this one are two different components (they are two different function objects), so reconciliation (Q8) replaces the whole subtree.\r
\r
**The fix is to define components at the top level** and pass what they need as props:\r
\r
\`\`\`tsx\r
function NameField({ value, onChange }) {\r
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Type here" />;\r
}\r
\r
function Form() {\r
  const [name, setName] = React.useState('');\r
  return (\r
    <div>\r
      <NameField value={name} onChange={setName} />\r
      <p>Hello {name}</p>\r
    </div>\r
  );\r
}\r
\r
render(<Form />);\r
\`\`\`\r
\r
**Other causes of the same symptom**, all of them a remount rather than a re-render:\r
\r
- **A \`key\` that changes every render**, such as \`key={Math.random()}\` or \`key={Date.now()}\`. A new key means a new component.\r
- **Switching the element type**: \`{editing ? <input … /> : <textarea … />}\` swaps the element, so focus is lost by design.\r
- **A parent higher up that remounts**, for example a layout that renders different wrappers on different screen sizes.\r
\r
A quick way to check: add \`React.useEffect(() => { console.log('mounted'); return () => console.log('unmounted'); }, [])\` to the input's component. If typing prints \`unmounted\` then \`mounted\`, it is being remounted, not re-rendered.\r
\r
---\r
\r
**Q83: What is new in React 19.3?**\r
\r
**Short answer:** React 19.3 (September 2026) made \`<ViewTransition>\` and Fragment Refs stable, and added \`browser()\` for client-only components and support for the browser's Trusted Types. It removes nothing, so upgrading from 19.2 is a version bump.\r
\r
The four things to name, with one line each on why they matter:\r
\r
- **\`<ViewTransition>\`** animates elements entering, leaving, moving or changing, using the browser's View Transitions API. It only runs for Transitions (\`startTransition\`, Suspense reveals, \`useDeferredValue\`), so urgent updates such as typing never wait for an animation, and it can animate an element *leaving*, which is the hard part to do by hand.\r
- **Fragment Refs** give a ref to a group of siblings, so you can focus, observe or listen to them without adding a wrapper \`<div>\` that might break a flex or grid layout.\r
- **\`use(browser())\`** makes a component render only in the browser: on the server it suspends and sends the Suspense fallback, avoiding the hydration mismatch that comes from reading \`window\` or \`localStorage\` during server rendering.\r
- **Trusted Types** now work with React, because it stopped converting values to strings before they reach the DOM, so a site can enforce that XSS protection with a Content Security Policy.\r
\r
The answer that shows you follow the ecosystem closely: before 19.3, \`<ViewTransition>\` was Canary-only, and the right way to animate route changes was the browser's \`document.startViewTransition()\` driven from the router. Knowing *when* a feature became stable is part of the answer (§16.10, §16.11).\r
\r
---\r
\r
### Delivery and Scale\r
\r
**Q84: How would you design a CI/CD pipeline for a React application?**\r
\r
**Order the stages so the cheapest checks fail first, build the app once, and promote that same build through each environment.** Full workflow and the merge-blocking rule: §15.12.\r
\r
1. **On every pull request:** install with \`npm ci\` (cached), then lint, type-check, unit and component tests, and a production build, in parallel. All four are **required checks**, so a failure blocks the merge.\r
2. **Budgets in the same run:** a bundle-size check (\`size-limit\`, or a script comparing the build's gzip size with \`main\`) fails the PR if the initial JavaScript grows more than an agreed amount, and an accessibility smoke test (axe on a few key pages) catches regressions no unit test sees.\r
3. **A preview deployment per PR:** the build is deployed to a throwaway URL, and a short Playwright end-to-end suite runs against it. Reviewers click the real thing instead of imagining it from a diff.\r
4. **On merge to \`main\`:** build once, store the output as an artifact, deploy it to staging, run smoke tests, then promote **the same artifact** to production (automatically, or after an approval on the \`production\` environment). Rebuilding for production means shipping something that was never tested.\r
5. **After deploy:** watch error rates and Core Web Vitals from real users for a few minutes, and roll back automatically if they spike.\r
\r
**The details that show you have run one:**\r
\r
- **Build-time environment variables are public.** Anything prefixed \`VITE_\` (or \`NEXT_PUBLIC_\`) is inlined into the JavaScript every visitor downloads, so API keys and secrets never go there. Configuration that differs per environment either comes from a small \`config.json\` fetched at startup (one build, many environments) or requires one build per environment.\r
- **Caching rules make deploys atomic.** Hashed files (\`app-3f9a1c.js\`) are cached for a year; \`index.html\` is never cached. Upload the new hashed files first and switch \`index.html\` last, so no user ever loads an HTML page that points at files that are not there yet.\r
- **Rollback is re-pointing, not rebuilding.** Keep the previous build and switch back to it in seconds.\r
- **Old tabs keep the old version.** After a deploy, a user with the app open requests chunk files that no longer exist, so keep the previous release's files available for a while and catch \`ChunkLoadError\` with a "reload" prompt.\r
- **Feature flags separate deploy from release:** merge unfinished work switched off, and turn it on without deploying.\r
\r
---\r
\r
**Q85: A React app's JavaScript bundle has grown from 500 KB to 5 MB. How would you find the cause and fix it?**\r
\r
**Treat it as a regression with a cause, not as a performance project: a tenfold jump almost never comes from features, so find the change that caused it before optimising anything.** Q25 covers the general ways to shrink a bundle; this question is about diagnosis.\r
\r
**1. Confirm what grew, and measure the right number.** Look at the initial route's JavaScript, compressed (gzip or Brotli), because that is what users download and parse before the page works. Total size across every lazy chunk is a different and much less important number.\r
\r
**2. Compare two builds, not one.** Run a bundle analyzer (\`rollup-plugin-visualizer\` for Vite, \`webpack-bundle-analyzer\`, or \`source-map-explorer\` on any build) on the last good commit and on today's, side by side (§13.10). If you do not know when it happened, bisect: build a commit from the middle of the range, check the size, and repeat. That finds the responsible commit in a handful of builds.\r
\r
**3. Check the usual causes of a jump this size:**\r
\r
| Cause | What it looks like in the analyzer | Fix |\r
|---|---|---|\r
| A development build or inline source maps shipped | React's development build, warning strings everywhere | build with \`NODE_ENV=production\`; source maps as separate files |\r
| A whole library imported for one function | all of \`lodash\`, every icon, every \`date-fns\` or \`moment\` locale | named imports from ESM builds, per-icon imports, load only the locales you use |\r
| Two versions of the same package | \`react\`, \`lodash\` or a UI kit appearing twice | \`npm ls <pkg>\`, then \`npm dedupe\` or align versions |\r
| A lazy boundary broken by a static import | a page that should be its own chunk sits inside the main bundle | find the plain \`import\` of the lazy module and remove it |\r
| Data or assets inlined into JavaScript | a large JSON file, or images as base64 strings | fetch the data at run time; lower the asset-inlining limit |\r
| Polyfills for browsers you no longer support | \`core-js\` in full | update \`browserslist\`, import polyfills by feature |\r
| Server-only code in the client bundle | a database or PDF library in a client chunk | keep it on the server (\`import 'server-only'\` in Next.js) |\r
\r
**4. Then prevent it happening again, which is the part most answers skip.** Add a size budget to CI that fails the pull request when the initial bundle grows by more than an agreed amount, and publish the analyzer report on each PR. The jump from 500 KB to 5 MB happened because nothing measured the bundle on each change; a budget turns it into a red check on the one PR that caused it (§15.12).\r
\r
---\r
\r
**Q86: Explain how code splitting and lazy loading improve performance.**\r
\r
Code splitting is a build-time step: the bundler turns every dynamic \`import()\` into its own file (a chunk). Lazy loading is the run-time half: the chunk is fetched only when something first needs it. In React that is \`React.lazy\`, and \`<Suspense>\` shows a fallback while it downloads (§13.3). The gain is not mainly in download size. It comes from four places:\r
\r
1. **Less JavaScript to parse and run before the first screen works.** On a mid-range phone, parsing and executing JavaScript usually costs more than downloading it. The main thread is busy with that work, so the page is visible but doesn't respond to taps. Shipping only the code for the current route improves LCP (largest contentful paint, when the main content appears) and makes the page interactive sooner.\r
2. **Better caching across deploys.** With one bundle, changing a single line invalidates the whole file. With route and vendor chunks, a deploy changes only the chunks whose code changed, and returning users keep the rest of their cache (§13.11).\r
3. **Code for features nobody opens is never downloaded.** A rich-text editor, a chart library or an admin page costs nothing for the users who never open them.\r
4. **Less memory and less startup work** on the low-end devices where both matter most.\r
\r
The costs, which an interviewer will ask about next:\r
\r
- **A wait at the moment of use.** The first click on a lazy feature now waits for a network round trip. Prefetch on intent (hover, focus or an idle callback) so the chunk is usually cached before the click.\r
- **Request waterfalls.** If a lazy page lazily imports a component that imports another chunk, the browser discovers each file only after the previous one has run. Split at route and big-widget boundaries, not at every component. Let the bundler emit \`modulepreload\` hints for chunks it knows are needed together.\r
- **Too many small chunks** can make navigation feel slower, because every route change is now a fetch (see the [Web Performance guide](/frontend/web-performance), Tricky Q4). Splitting above the fold makes LCP worse (Tricky Q21 below).\r
- **\`ChunkLoadError\` after a deploy**, when an open tab asks for a hashed file that no longer exists. Catch it in an error boundary and offer a reload.\r
\r
Prefetching on intent, with the fallback showing only when the chunk isn't cached yet. \`loadChart\` stands in for \`import('./Chart')\`:\r
\r
\`\`\`jsx\r
import { lazy, Suspense, useState } from 'react';\r
\r
// Stand-in for import('./Chart'): resolves after 800 ms, like a network fetch\r
const loadChart = () =>\r
  new Promise((resolve) =>\r
    setTimeout(() => resolve({ default: () => <p>Chart loaded</p> }), 800)\r
  );\r
\r
// Share one promise, so a hover followed by a click fetches the chunk once\r
let chartPromise = null;\r
const prefetchChart = () => {\r
  if (!chartPromise) chartPromise = loadChart();\r
  return chartPromise;\r
};\r
const Chart = lazy(prefetchChart);\r
\r
function Dashboard() {\r
  const [show, setShow] = useState(false);\r
  return (\r
    <div>\r
      <button onMouseEnter={prefetchChart} onFocus={prefetchChart} onClick={() => setShow(true)}>\r
        Show chart\r
      </button>\r
      <Suspense fallback={<p>Loading chart…</p>}>{show && <Chart />}</Suspense>\r
    </div>\r
  );\r
}\r
\`\`\`\r
\r
Hover for a second and then click: the chart appears at once. Click straight away and you see the fallback for the rest of the 800 ms. Always measure before and after. The number that matters is LCP and INP (interaction to next paint, how quickly the page responds to a tap or click) on a real device, not kilobytes saved.\r
\r
---\r
\r
## 18. Tricky Output Questions\r
\r
Practice questions testing your understanding of React rendering behavior, hooks quirks, state batching, and closures.\r
\r
### State & Batching\r
\r
---\r
\r
**Q1: In a click handler that calls \`setCount(count + 1)\` three times and then \`console.log(count)\`, what does the console print on the first click and what value ends up rendered?**\r
\r
\`\`\`jsx\r
function Counter() {\r
  const [count, setCount] = useState(0);\r
\r
  function handleClick() {\r
    setCount(count + 1);\r
    setCount(count + 1);\r
    setCount(count + 1);\r
    console.log(count);\r
  }\r
\r
  return <button onClick={handleClick}>{count}</button>;\r
}\r
\`\`\`\r
\r
**Output:** \`0\` (on first click)\r
\r
**Rendered value:** \`1\`\r
\r
**Explanation:**\r
\r
**In one line:** \`count\` is a constant captured when this render ran, so all three calls queue "set to 1", and the log still reads that render's \`0\`.\r
\r
This question tests two intertwined mechanisms: closure capture of state variables and React's batching of state updates inside event handlers. When \`Counter\` renders, React destructures the current state value \`0\` into the local const \`count\`. The \`handleClick\` function is re-created each render and closes over that specific \`count = 0\`. Because \`count\` is a plain constant in that render's scope, it cannot change mid-handler — there is no way for \`setCount\` to mutate it.\r
\r
Now trace the three calls. \`setCount(count + 1)\` is identical to \`setCount(0 + 1)\` three times in a row; React simply queues "set state to 1" three times. These are all direct value updates, not functional updaters, so React does not chain them against any pending state — each call overwrites the previous one's queued value. When the handler finishes, React batches the queued updates and schedules a single re-render with the final queued value, \`1\`.\r
\r
The \`console.log(count)\` runs synchronously inside the same handler, long before the re-render happens. It reads the closed-over \`count\`, which is still \`0\` from the render the handler was created in. After the handler returns, React commits the new state and re-renders the component; the button now displays \`1\`.\r
\r
**Takeaway:** Direct \`setState(value)\` calls in the same handler use the stale closure value — to increment correctly, pass a functional updater.\r
\r
---\r
\r
**Q2: A click handler calls \`setCount(prev => prev + 1)\` three times in a row starting from \`count = 0\`. What value is rendered after the click?**\r
\r
\`\`\`jsx\r
function Counter() {\r
  const [count, setCount] = useState(0);\r
\r
  function handleClick() {\r
    setCount(prev => prev + 1);\r
    setCount(prev => prev + 1);\r
    setCount(prev => prev + 1);\r
  }\r
\r
  return <button onClick={handleClick}>{count}</button>;\r
}\r
\`\`\`\r
\r
**Rendered value after first click:** \`3\`\r
\r
**Explanation:**\r
\r
**In one line:** A function passed to \`setCount\` receives the latest pending value, so the three calls chain 0 → 1 → 2 → 3.\r
\r
This is the same shape as Q1 but swaps the direct value for a functional updater, and that single change fixes the staleness problem. When you pass a function to \`setState\`, React does not queue a value — it queues a transformation. During the next render, React walks the update queue in order, feeding each updater the result of the previous one. The updater itself does not close over \`count\`; it receives the latest pending state as its \`prev\` argument, freshly passed in by React at flush time.\r
\r
Tracing the queue: starting from committed state \`0\`, the first updater produces \`0 + 1 = 1\`. React feeds that \`1\` into the second updater, yielding \`2\`. The third updater then produces \`3\`. Only after all three are processed does React schedule a single re-render with the final value \`3\`. The three calls are still batched — the user sees exactly one render — but because each updater computes from the latest pending value rather than from a captured closure, their effects actually compound.\r
\r
This is also why functional updaters are the idiomatic fix whenever the new state depends on the previous state, especially inside timers, async callbacks, or any code path where the handler could run against stale data.\r
\r
**Takeaway:** When new state depends on previous state, always use \`setState(prev => ...)\` so React feeds you the latest pending value instead of a stale closure.\r
\r
---\r
\r
**Q3: A click handler interleaves direct and functional updates — \`setCount(count + 1)\`, then \`setCount(prev => prev + 1)\`, then \`setCount(count + 1)\` — starting from \`count = 0\`. What is rendered?**\r
\r
\`\`\`jsx\r
function Counter() {\r
  const [count, setCount] = useState(0);\r
\r
  function handleClick() {\r
    setCount(count + 1);\r
    setCount(prev => prev + 1);\r
    setCount(count + 1);\r
  }\r
\r
  return <p>{count}</p>;\r
}\r
\`\`\`\r
\r
**Rendered value after first click:** \`1\`\r
\r
**Explanation:**\r
\r
**In one line:** The queue applies 1, then 2, then the last direct call sets it back to \`count + 1\`, which is still \`0 + 1\`: a direct value overwrites whatever came before it.\r
\r
This one demonstrates how React's update queue treats the two kinds of updates uniformly: each entry is applied in order, but a direct value update ignores whatever pending state came before it, while a functional updater computes from it. The render captured \`count = 0\`, so both direct calls in this handler are really \`setCount(1)\` — not \`setCount(count + 1)\` that somehow re-reads the latest value.\r
\r
Walk the queue starting from base state \`0\`:\r
1. First call enqueues "set to 1". When processed, the pending state becomes \`1\`.\r
2. Second call enqueues an updater. When processed, React passes in the current pending state \`1\`, the updater returns \`2\`, and pending state becomes \`2\`.\r
3. Third call enqueues "set to 1" again (because the closure's \`count\` is still \`0\`). When processed, it overwrites the pending state back to \`1\`.\r
\r
The final committed value is \`1\`, and the user sees a single re-render with \`1\` on screen. The subtle trap is that direct updates silently clobber any accumulated work done by earlier updaters in the same batch. Mixing the two styles in one handler is almost always a bug; pick functional updaters whenever you rely on the previous state.\r
\r
**Takeaway:** Never mix direct and functional updates for the same piece of state in one handler — direct updates overwrite pending values computed by earlier updaters.\r
\r
---\r
\r
**Q4: A click handler runs a \`for\` loop that calls \`setCount(prev => prev + 1)\` five times. How many times does the component re-render and what does it log?**\r
\r
\`\`\`jsx\r
function App() {\r
  const [count, setCount] = useState(0);\r
  console.log("render", count);\r
\r
  function handleClick() {\r
    for (let i = 0; i < 5; i++) {\r
      setCount(prev => prev + 1);\r
    }\r
  }\r
\r
  return <button onClick={handleClick}>{count}</button>;\r
}\r
\`\`\`\r
\r
**Output on click:**\r
\`\`\`\r
render 5\r
\`\`\`\r
\r
**Explanation:**\r
\r
**In one line:** All five updates happen inside one event handler, so React batches them and renders once, with the chained result \`5\`.\r
\r
This question tests automatic batching — a foundational optimization in React. In React 18 and later, any synchronous sequence of state updates inside a single "tick" of JavaScript (event handler, effect body, promise continuation, timeout callback, etc.) is collapsed into one re-render. Earlier versions only batched inside React event handlers; 18's concurrent renderer extended batching everywhere.\r
\r
When the button is clicked, React enters the event handler with its batching lock held. Each \`setCount(prev => prev + 1)\` appends an updater to the state queue — nothing renders mid-loop. Once the handler returns, React unlocks batching, flushes the queue by feeding each updater the previous pending value (\`0 → 1 → 2 → 3 → 4 → 5\`), and schedules exactly one re-render with the final value \`5\`. That single render logs \`render 5\`.\r
\r
This is why you should never worry about "too many setState calls" — React already coalesces them for you. The practical rule is to keep updaters pure (no side effects inside the function you pass), because in Strict Mode and during bail-out checks React may invoke them extra times to verify correctness.\r
\r
**Takeaway:** React 18 automatically batches all state updates in a single tick into one re-render, regardless of how many \`setState\` calls you make.\r
\r
---\r
\r
### useEffect & Lifecycle\r
\r
**Q5: A component logs \`"A"\` and \`"E"\` in its body and has two \`useEffect\` calls (one with a cleanup, one mount-only) that log \`"B"\`/\`"C"\` and \`"D"\`. In what order do the logs appear on mount?**\r
\r
\`\`\`jsx\r
function App() {\r
  console.log("A: render");\r
\r
  useEffect(() => {\r
    console.log("B: effect");\r
    return () => console.log("C: cleanup");\r
  });\r
\r
  useEffect(() => {\r
    console.log("D: mount effect");\r
  }, []);\r
\r
  console.log("E: render end");\r
\r
  return <div>Hello</div>;\r
}\r
\`\`\`\r
\r
**Output on mount:**\r
\`\`\`\r
A: render\r
E: render end\r
B: effect\r
D: mount effect\r
\`\`\`\r
\r
**Explanation:**\r
\r
**In one line:** The component body runs top to bottom during render; effects run afterwards in the order they were declared, and a cleanup only runs before the next effect or on unmount, never on first mount.\r
\r
React's lifecycle is a sequence of distinct phases, and each kind of work runs in exactly one of them. The render phase is the synchronous execution of the component function itself — it must be pure, so React (or Strict Mode) can call it multiple times safely. All top-level code in the function body, including both \`console.log\` calls, runs here: first \`A\`, then the hook calls (which merely register effects; they do not run the effect bodies yet), then \`E\`.\r
\r
After the render phase, React commits the result to the DOM, lets the browser paint, and then enters the effect phase. Effects fire in the order they were declared, so \`B\` runs before \`D\`. Cleanups are queued alongside effects but only execute before the next effect run or on unmount — there is nothing to clean up on the very first mount, so \`C\` never appears in this output.\r
\r
This order matters in practice: if you need to read layout after the browser paints, use \`useEffect\`; if you need to read or mutate the DOM before paint (to avoid a visible flash), use \`useLayoutEffect\`, which fires synchronously after commit but before paint. The split between render and effect phases is also why you must never call \`setState\` in the render body unconditionally — it would loop forever — and why effects are the right place for subscriptions, timers, and data fetching.\r
\r
**Takeaway:** Render body runs first (top-down), then effects fire after paint in declaration order; cleanups only run before the next effect or on unmount, never on initial mount.\r
\r
---\r
\r
**Q6: A \`useEffect\` with an empty dependency array starts a \`setInterval\` that logs \`count\` and calls \`setCount(count + 1)\` every second. What does the console print over time and what value does the UI display?**\r
\r
\`\`\`jsx\r
function Timer() {\r
  const [count, setCount] = useState(0);\r
\r
  useEffect(() => {\r
    const id = setInterval(() => {\r
      console.log(count);\r
      setCount(count + 1);\r
    }, 1000);\r
    return () => clearInterval(id);\r
  }, []);\r
\r
  return <p>{count}</p>;\r
}\r
\`\`\`\r
\r
**Console output:** \`0, 0, 0, 0, ...\` (repeats forever)\r
\r
**Rendered value:** Stuck at \`1\`\r
\r
**Explanation:**\r
\r
**In one line:** The effect ran once, so its interval callback forever sees the first render's \`count\` of \`0\`, and keeps setting the state to \`1\`.\r
\r
This is the canonical "stale closure in useEffect" bug, and it hinges on how dependency arrays interact with JavaScript closures. An empty \`[]\` tells React: "only run this effect once, on mount." React complies — it captures the effect function as it existed on the first render, runs it, and never re-creates it. But that effect function closes over the \`count\` identifier from the first render's scope, where \`count === 0\`. Nothing in the effect itself can ever see a newer \`count\`, because re-renders create new local \`count\` bindings in new function scopes that this old closure knows nothing about.\r
\r
Every interval tick thus reads \`count\` as \`0\` and calls \`setCount(0 + 1)\`. The first tick re-renders with \`count = 1\`, but the interval callback still fires from the original closure. The second tick also calls \`setCount(1)\` — which is the same value React already has, so React bails out and skips the re-render (see Q12). The log keeps printing \`0\` forever and the UI is stuck at \`1\`.\r
\r
There are two correct fixes. The minimal change is \`setCount(prev => prev + 1)\` — functional updaters do not need to see \`count\` at all, so the staleness becomes irrelevant. The more general fix is to add \`count\` to the dependency array so the effect tears down and re-subscribes whenever \`count\` changes, but for intervals that is wasteful. When you need the latest value of something inside a long-lived subscription, either use a functional updater or mirror the value into a ref and read \`ref.current\` inside the callback.\r
\r
**Takeaway:** Effects with empty deps capture the first render's values forever — use functional updaters or refs to access the latest state inside long-lived callbacks.\r
\r
---\r
\r
**Q7: A \`useEffect\` passes \`[{ key: "value" }]\` as its dependency array. How often does the effect run as the component re-renders?**\r
\r
\`\`\`jsx\r
function App() {\r
  const [count, setCount] = useState(0);\r
\r
  useEffect(() => {\r
    console.log("effect ran");\r
  }, [{ key: "value" }]);\r
\r
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\r
}\r
\`\`\`\r
\r
**Output:** \`"effect ran"\` logs on **every** render.\r
\r
**Explanation:**\r
\r
**In one line:** A fresh object literal is a new reference on every render, and React compares dependencies by reference, so the effect never sees them as unchanged.\r
\r
React compares dependency arrays with \`Object.is\`, which is essentially strict equality plus correct handling of \`NaN\` and \`-0\`. For primitives like numbers and strings, \`Object.is\` compares by value, so stable values yield stable deps. For objects, arrays, and functions, it compares by reference — two objects with identical keys and values are considered different if they live at different memory addresses.\r
\r
The literal \`{ key: "value" }\` is evaluated fresh inside the component function every single render. Each render produces a brand-new object with a new identity, so when React runs its dependency comparison (\`Object.is(prevDep[0], nextDep[0])\`), the check always returns \`false\`. React concludes the deps changed and re-runs the effect. The behavior is identical to omitting the array entirely.\r
\r
The same trap appears with inline functions (\`useEffect(..., [() => {}])\`) and inline arrays (\`useEffect(..., [[1, 2]])\`). The fixes are: move the value outside the component so it has a stable identity, wrap it in \`useMemo\`/\`useCallback\` so React reuses the reference across renders, or — more commonly — depend on the primitive fields the effect actually uses (for instance \`[config.key]\` instead of \`[config]\`). Exhaustive-deps lint rules exist specifically to surface this kind of mistake.\r
\r
**Takeaway:** Object and function dependencies are compared by reference — a fresh literal in the deps array defeats dependency tracking entirely.\r
\r
---\r
\r
### Closures & Refs\r
\r
**Q8: A click handler calls \`setCount(5)\` and then schedules a \`setTimeout\` that logs \`count\` one second later. What appears in the console and what is rendered?**\r
\r
\`\`\`jsx\r
function App() {\r
  const [count, setCount] = useState(0);\r
\r
  function handleClick() {\r
    setCount(5);\r
    setTimeout(() => {\r
      console.log(count);\r
    }, 1000);\r
  }\r
\r
  return <button onClick={handleClick}>{count}</button>;\r
}\r
\`\`\`\r
\r
**Console output (1s later):** \`0\`\r
\r
**Rendered value:** \`5\`\r
\r
**Explanation:**\r
\r
**In one line:** The timeout callback was created in the render where \`count\` was \`0\`, and state inside a render never changes, so it logs \`0\` even though the screen shows \`5\`.\r
\r
State in React is not a mutable variable you can re-read; it is a snapshot pinned to a specific render. When the component rendered for the first time, \`useState(0)\` returned the value \`0\` and React bound that value to the local const \`count\` in that particular invocation of \`App\`. The \`handleClick\` function defined in that render — and any callback defined inside it, including the \`setTimeout\` one — closes over that specific \`count\`.\r
\r
When the user clicks, \`setCount(5)\` schedules a re-render with the new state, but it does not retroactively change any variable that already exists. React then re-invokes \`App\`, which produces a *new* \`count\` binding (this time equal to \`5\`) and a new \`handleClick\`. The button now displays \`5\`. However, the timeout callback scheduled one second earlier is still the one from the first render, carrying its own \`count = 0\` in its closure. When the timer fires, it logs \`0\`.\r
\r
To read the latest value inside an async callback you have a few options: store the value in a \`useRef\` and read \`ref.current\` in the callback (refs are mutable containers whose identity is stable across renders), schedule the timeout inside a \`useEffect\` that depends on the state so a new closure is captured each time, or refactor so the callback receives the needed value as an argument. This is the same staleness pattern as Q6, just triggered by \`setTimeout\` rather than \`setInterval\`.\r
\r
**Takeaway:** Every async callback captures the state values from the render that created it — use refs or functional updaters when you need the latest value.\r
\r
---\r
\r
**Q9: A component stores a counter in \`useRef(0)\` and renders \`{ref.current}\`. After clicking "Increment ref" three times, what does the screen show? What happens after a subsequent "Force render" click?**\r
\r
\`\`\`jsx\r
function App() {\r
  const ref = useRef(0);\r
  const [, forceRender] = useState(0);\r
\r
  function handleClick() {\r
    ref.current += 1;\r
    console.log("ref:", ref.current);\r
  }\r
\r
  return (\r
    <div>\r
      <p>Ref value: {ref.current}</p>\r
      <button onClick={handleClick}>Increment ref</button>\r
      <button onClick={() => forceRender(n => n + 1)}>Force render</button>\r
    </div>\r
  );\r
}\r
\`\`\`\r
\r
**After clicking "Increment ref" 3 times:**\r
- Console: \`ref: 1\`, \`ref: 2\`, \`ref: 3\`\r
- Screen shows: \`Ref value: 0\` (unchanged)\r
\r
**After then clicking "Force render":**\r
- Screen shows: \`Ref value: 3\`\r
\r
**Explanation:**\r
\r
**In one line:** Changing \`ref.current\` does not ask React to re-render, so the screen only catches up when some other update causes a render.\r
\r
\`useRef\` and \`useState\` look superficially similar — both give you a per-component value that persists across renders — but they plug into two completely different parts of the React runtime. A ref is a mutable container (\`{ current: X }\`) whose identity is preserved across renders; React does not track reads or writes to \`.current\`. A state value, by contrast, is immutable from the component's perspective, and calling its setter is what informs React that it needs to reconcile and re-render.\r
\r
When you click "Increment ref", the handler mutates \`ref.current\` in place. The console correctly shows the updated values because \`console.log\` reads the live object. But nothing told React to re-render, so the DOM still reflects the last committed render where \`ref.current\` was \`0\` at the time JSX was produced. The \`<p>\` node on screen is a frozen snapshot of that moment.\r
\r
When you click "Force render", \`forceRender(n => n + 1)\` changes an unrelated state, which causes React to call \`App\` again. During that new render, the JSX reads \`ref.current\` fresh — and it now sees \`3\` because the underlying object was being mutated all along. So the ref's current value finally reaches the DOM, not because of the ref itself, but because an unrelated state change triggered a render that happened to read the ref.\r
\r
This is precisely why refs are ideal for values that should not trigger UI updates (DOM nodes, timer IDs, previous-value caches, "did I already submit this form" flags) and why reading \`ref.current\` during render is generally discouraged — if you want something reactive, use state instead.\r
\r
**Takeaway:** Mutating \`ref.current\` never schedules a render; the DOM only reflects the ref's value on the next render triggered by something else.\r
\r
---\r
\r
### Rendering & Reconciliation\r
\r
**Q10: A \`Parent\` component re-renders when its own state changes, and renders a \`<Child />\` that takes no props. Does \`Child\` re-render on every parent update?**\r
\r
\`\`\`jsx\r
function Child() {\r
  console.log("Child rendered");\r
  return <p>Child</p>;\r
}\r
\r
function Parent() {\r
  const [count, setCount] = useState(0);\r
  console.log("Parent rendered");\r
\r
  return (\r
    <div>\r
      <button onClick={() => setCount(c => c + 1)}>Click</button>\r
      <Child />\r
    </div>\r
  );\r
}\r
\`\`\`\r
\r
**Output on each click:**\r
\`\`\`\r
Parent rendered\r
Child rendered\r
\`\`\`\r
\r
**Explanation:**\r
\r
**In one line:** Rendering a parent renders all of its children by default, props or not; only \`React.memo\` would let \`Child\` skip.\r
\r
React's reconciliation model is deliberately simple: when a component renders, React walks the entire subtree it produces and re-renders every child, regardless of whether props changed. The reason is that children may read from context, hooks, or other external sources that React cannot inspect — so the safe default is to re-render everything and let the virtual DOM diff figure out what actually needs to touch the real DOM.\r
\r
When \`Parent\` updates, it returns new React elements for its children. Even though \`<Child />\` has no props, it is still a fresh element object referencing the \`Child\` component, and React evaluates it by calling \`Child()\` again. The \`console.log("Child rendered")\` fires. If \`Child\` eventually produces the same JSX structure, React will diff and realize nothing needs to change in the DOM — but the component function itself always runs.\r
\r
To opt out of this behavior, wrap the child in \`React.memo(Child)\`. Memo adds a shallow prop comparison before calling the component: if the new props are referentially equal to the previous ones, React reuses the cached output and skips the render entirely. This only helps when the parent passes stable props (primitives, memoized callbacks, or objects wrapped in \`useMemo\`), and it is almost never worth it for trivial components like this one — the cost of the memo check can exceed the cost of just rendering.\r
\r
**Takeaway:** Children re-render whenever their parent renders, even with no props; use \`React.memo\` only when the render cost is actually measurable and props are referentially stable.\r
\r
---\r
\r
**Q11: A \`Child\` wrapped in \`React.memo\` receives \`style={{ color: "red" }}\` from its parent. When the parent re-renders, does memoization prevent \`Child\` from re-rendering?**\r
\r
\`\`\`jsx\r
const Child = React.memo(({ style }) => {\r
  console.log("Child rendered");\r
  return <p style={style}>Hello</p>;\r
});\r
\r
function Parent() {\r
  const [count, setCount] = useState(0);\r
\r
  return (\r
    <div>\r
      <button onClick={() => setCount(c => c + 1)}>{count}</button>\r
      <Child style={{ color: "red" }} />\r
    </div>\r
  );\r
}\r
\`\`\`\r
\r
**Output on each click:**\r
\`\`\`\r
Child rendered\r
\`\`\`\r
\r
**Explanation:**\r
\r
**In one line:** \`{ color: "red" }\` is a new object each render, so \`React.memo\`'s reference comparison always sees a changed prop.\r
\r
\`React.memo\` compares the new props to the previous props with a shallow equality check: for each key, it runs \`Object.is(prev[key], next[key])\`. If every key matches, it bails out and reuses the last render; if any key differs, it re-renders. For primitives like \`color: "red"\` as a direct prop, this works nicely. But here the prop is the entire \`style\` object.\r
\r
Each time \`Parent\` renders, the JSX expression \`style={{ color: "red" }}\` evaluates fresh, producing a new object literal with a different memory address. Memo compares the old \`style\` object to the new \`style\` object, \`Object.is\` returns \`false\`, and Child re-renders — defeating the entire reason for wrapping it in memo.\r
\r
The fix is to stabilize the reference. You can lift the object outside the component (\`const childStyle = { color: "red" };\` at module scope), wrap it in \`useMemo(() => ({ color: "red" }), [])\` so it is only created once, or pass the individual primitive fields the child needs (\`<Child color="red" />\`). The same trap applies to function props — \`onClick={() => doThing()}\` creates a new function every render and breaks memo; use \`useCallback\` or lift the function out. Memo without stable references is worse than no memo, because you pay the comparison cost and still re-render.\r
\r
**Takeaway:** \`React.memo\` only helps when every non-primitive prop has a stable reference — inline object/function literals create a new identity every render and defeat memoization.\r
\r
---\r
\r
**Q12: A button's click handler calls \`setCount(0)\` while the state is already \`0\`. Does the component re-render?**\r
\r
\`\`\`jsx\r
let renders = 0;\r
\r
function App() {\r
  const [, setCount] = useState(0);\r
  renders++;\r
  console.log("rendered", renders);\r
\r
  return <button onClick={() => setCount(0)}>Click (renders: {renders})</button>;\r
}\r
\r
render(<App />);\r
\`\`\`\r
\r
**Output:** \`rendered 1\` on mount, and **nothing at all** on any click. Press **Try it** and click as many times as you like — the counter never moves.\r
\r
**Explanation:**\r
\r
**In one line:** The new value is \`Object.is\`-equal to the current one and nothing else is pending, so React drops the update at the moment you call \`setCount\`, without rendering.\r
\r
React bails out when the new state is \`Object.is\`-equal to the current state, and the interesting part is *where* it bails out, because there are two different paths.\r
\r
**The eager path, which is what runs here.** \`setCount\` does not blindly schedule a render. If the fiber has **no pending work** — true for an idle component sitting after a completed mount — React computes the next state immediately, inside the dispatch, and compares it to the current one. \`Object.is(0, 0)\` is \`true\`, so it returns then and there. No update is enqueued, no render is scheduled, the component function is never called. That is why the click logs nothing, including the *first* click.\r
\r
**The lazy path, which is where the famous caveat comes from.** React's own documentation warns that it "may still need to render that specific component before bailing out." That happens when the eager comparison is not available — most commonly because there is **already pending work on the fiber**, so React cannot know what the state will be by the time this update is processed. Then it schedules the render, runs your component, discovers the state is unchanged, and bails out of re-rendering the *children*. The component body has already executed, so a \`console.log\` in it fires.\r
\r
So the precise answer is: **usually zero renders, but you cannot depend on zero.** In a quiet component you get the eager bail-out; in a component that is already updating, you get one render and then a bail-out.\r
\r
**Where this actually bites:** the same \`Object.is\` comparison is why mutating an object and calling the setter with the *same reference* does nothing at all.\r
\r
\`\`\`jsx\r
// ✗ Silently does nothing — same reference, so Object.is says "unchanged"\r
user.name = 'Ada';\r
setUser(user);\r
\r
// ✓ New reference, so React sees a change\r
setUser({ ...user, name: 'Ada' });\r
\`\`\`\r
\r
**Takeaway:** setting state to an \`Object.is\`-equal value usually costs nothing — React discards it at dispatch time. Do not write code that *relies* on either a render or no render happening; rely only on the fact that the state will not change.\r
\r
---\r
\r
**Q13: An \`<Input />\` component with its own internal \`text\` state is rendered as \`<Input key={id} />\`. When the parent increments \`id\`, what happens to the input's current value and does \`Input\` log "mounted" again?**\r
\r
\`\`\`jsx\r
function Input() {\r
  const [text, setText] = useState("");\r
  console.log("Input mounted");\r
\r
  return <input value={text} onChange={e => setText(e.target.value)} />;\r
}\r
\r
function App() {\r
  const [id, setId] = useState(1);\r
\r
  return (\r
    <div>\r
      <Input key={id} />\r
      <button onClick={() => setId(id + 1)}>Reset</button>\r
    </div>\r
  );\r
}\r
\`\`\`\r
\r
**On clicking "Reset":** Input field clears, console logs \`Input mounted\`.\r
\r
**Explanation:**\r
\r
**In one line:** A different \`key\` tells React this is a different component, so it unmounts the old \`Input\` (and its state) and mounts a fresh one.\r
\r
React's reconciliation algorithm uses position plus key to decide whether an element in the new render corresponds to an existing instance in the old one. Without an explicit key, React matches by position in the parent's children array — the first \`<Input />\` at position 0 today is treated as the same instance as the first \`<Input />\` at position 0 yesterday, so its hook state, DOM node, and effects are all preserved. With an explicit \`key\`, React uses that key as the identity instead.\r
\r
When the user clicks Reset, \`setId(id + 1)\` changes \`id\` from 1 to 2. On the next render, the JSX produces \`<Input key={2} />\`, but React remembers the previous child had \`key={1}\`. The keys don't match, so React treats this as a different component instance altogether: it unmounts the key-1 Input (running any cleanup effects, destroying the hook state, removing the DOM node) and mounts a fresh key-2 Input (calling the function for the first time, running \`useState("")\`, firing mount effects). The input clears because its internal \`text\` state starts over at \`""\`, and \`console.log("Input mounted")\` fires because the component body executed as a first-time render.\r
\r
This "change the key to reset" pattern is the idiomatic way to reset uncontrolled state without managing it from the parent. The flip side is that overusing dynamic keys (especially \`key={Math.random()}\` or \`key={Date.now()}\`) accidentally remounts on every render, throwing away perfectly good state and DOM nodes — a common performance bug. Keys should be stable and unique for the lifetime of the logical entity they represent.\r
\r
**Takeaway:** Changing a component's \`key\` forces React to unmount the old instance and mount a new one, resetting all internal state and re-running mount effects.\r
\r
---\r
\r
### Hooks Rules & Gotchas\r
\r
**Q14: A component calls \`useState\` inside an \`if (showName)\` branch between two other \`useState\` calls. What goes wrong when \`showName\` toggles from \`true\` to \`false\` across renders?**\r
\r
\`\`\`jsx\r
function App({ showName }) {\r
  const [count, setCount] = useState(0);\r
\r
  if (showName) {\r
    const [name, setName] = useState("React");   // ← the conditional hook\r
  }\r
\r
  const [age, setAge] = useState(25);\r
\r
  return <p>{count} {age}</p>;\r
}\r
\r
// The bug only fires when showName CHANGES, so this harness toggles it.\r
// First render runs 3 hooks; after the click, 2. React throws on that render.\r
function Demo() {\r
  const [showName, setShowName] = useState(true);\r
  return (\r
    <>\r
      <button onClick={() => setShowName(s => !s)}>\r
        showName is {String(showName)} — click to break it\r
      </button>\r
      <App showName={showName} />\r
    </>\r
  );\r
}\r
\r
render(<Demo />);\r
\`\`\`\r
\r
**Output:** renders \`0 25\`, then throws **"Rendered fewer hooks than expected"** the moment you toggle. Press **Try it** and click the button — the error is the point, and it only appears on the *second* render.\r
\r
**Explanation:**\r
\r
**In one line:** React matches \`useState\` calls to stored state by call order, so skipping one on a later render leaves fewer hooks than React stored, and it throws.\r
\r
React does not actually see the names of your hooks. Internally, each component has an array (technically a linked list) of hook slots. On every render, React walks through your component function from top to bottom; each hook call reads the next slot in sequence. The identity of a hook — which state it owns, which effect it is — is determined purely by the order of the call, not by any variable name.\r
\r
On the first render with \`showName = true\`, React records three slots: slot 0 = count state, slot 1 = name state, slot 2 = age state. On the next render with \`showName = false\`, your code calls only two hooks: \`useState(0)\` and \`useState(25)\`. React sees hook #0 (fine — matches count) and hook #1, but now this call is your \`useState(25)\` while slot 1 in memory is holding "React". React detects the mismatch — fewer hook calls than last time — and throws the dev-mode error: "Rendered fewer hooks than expected." The exact wording varies by direction, but the cause is identical: the ordered correspondence between call sites and slots has been broken.\r
\r
This is precisely the reason for the "Rules of Hooks" and the \`eslint-plugin-react-hooks\` rule that forbids hooks in conditionals, loops, or early returns. The fix is to keep all hook calls at the top level unconditionally and push the conditional logic inside the values you compute or the JSX you return. For optional state, simply always create the state and only *use* it conditionally.\r
\r
**Takeaway:** React identifies hooks by call order, so they must be called unconditionally in the same sequence on every render — never put a hook inside \`if\`, \`for\`, or after an early return.\r
\r
---\r
\r
**Q15: A \`useEffect\` with \`[count]\` as its dependency logs \`"setup", count\` and returns a cleanup that logs \`"cleanup", count\`. What logs appear on mount, on the first click, and on the second click?**\r
\r
\`\`\`jsx\r
function App() {\r
  const [count, setCount] = useState(0);\r
\r
  useEffect(() => {\r
    console.log("setup", count);\r
    return () => console.log("cleanup", count);\r
  }, [count]);\r
\r
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\r
}\r
\`\`\`\r
\r
**Output after mount:** \`setup 0\`\r
\r
**Output after first click:**\r
\`\`\`\r
cleanup 0\r
setup 1\r
\`\`\`\r
\r
**Output after second click:**\r
\`\`\`\r
cleanup 1\r
setup 2\r
\`\`\`\r
\r
**Explanation:**\r
\r
**In one line:** Before each re-run, React calls the previous effect's cleanup, which still holds the \`count\` from its own render.\r
\r
A \`useEffect\` with a dependency array is not a "when it changes" handler; it is a "keep this effect synchronized with these values" declaration. Every render where the deps have changed, React first runs the previous render's cleanup function, then runs the new render's effect function. That two-step dance is what keeps subscriptions, timers, and external resources in sync with the current props and state.\r
\r
On mount, there is no previous effect to clean up, so only the setup runs — and the effect closes over the first render's \`count = 0\`, so it logs \`setup 0\`. When \`count\` changes to \`1\`, React re-renders, detects that the \`[count]\` dep changed, and enters the commit phase. Before running the new effect, it invokes the *old* cleanup function, which was created in the render where \`count\` was \`0\`. That cleanup closes over \`count = 0\` and logs \`cleanup 0\`. Then the new effect runs, closing over \`count = 1\`, and logs \`setup 1\`.\r
\r
The second click repeats the pattern: cleanup from the \`count = 1\` render logs \`cleanup 1\`, then the new effect for \`count = 2\` logs \`setup 2\`. Each cleanup sees "its own" state — the state from the render that created it — which is exactly what you want when cleaning up, for example, a subscription that was opened with the previous value. If you forget this, you can accidentally call \`clearInterval(id)\` where \`id\` is from the current render rather than the one you started.\r
\r
**Takeaway:** Each effect's cleanup captures the state from the render that created it and runs *before* the next effect — treat setup/cleanup as paired lifecycles of the dependency snapshot.\r
\r
---\r
\r
**Q16: \`useState(expensiveInit)\` is called with a reference to a function (not its return value). How many times does \`expensiveInit\` run across mount and a subsequent click?**\r
\r
\`\`\`jsx\r
function expensiveInit() {\r
  console.log("init called");\r
  return 42;\r
}\r
\r
function App() {\r
  const [value, setValue] = useState(expensiveInit);\r
  console.log("render", value);\r
\r
  return <button onClick={() => setValue(v => v + 1)}>{value}</button>;\r
}\r
\`\`\`\r
\r
**Output on mount:**\r
\`\`\`\r
init called\r
render 42\r
\`\`\`\r
\r
**Output on click:**\r
\`\`\`\r
render 43\r
\`\`\`\r
\r
**Explanation:**\r
\r
**In one line:** Passing the function itself (not its result) lets React call it only on mount; later renders ignore the initial-state argument.\r
\r
\`useState\` accepts either an initial value or an initializer function. When you pass a non-function value, React stores it as-is the first time and ignores the argument on every subsequent render. When you pass a function, React recognizes the special form — it invokes the function to compute the initial state exactly once, on the first render, and then ignores it forever after. This is called the *lazy initial state* optimization.\r
\r
The distinction matters because the expression you write for the initial value is evaluated on every render. \`useState(expensiveInit())\` (with parentheses) would call \`expensiveInit\` during every single render, do all the work to compute \`42\`, and then React would throw the result away on all renders after the first. By contrast, \`useState(expensiveInit)\` passes the function reference itself; React internally stores that reference, invokes it exactly once to populate the initial state slot, and never calls it again.\r
\r
On mount, React invokes \`expensiveInit\`, which logs \`init called\` and returns \`42\`. Render then logs \`render 42\`. On the click, \`setValue(v => v + 1)\` updates the state to \`43\`, triggering a re-render; React sees that the state slot is already initialized, skips the initializer entirely, and render logs \`render 43\`. No further \`init called\` ever appears. The same pattern works for \`useReducer(reducer, initArg, init)\`, whose third argument is a lazy initializer for the same reason.\r
\r
**Takeaway:** Pass the function reference itself (\`useState(expensiveInit)\`, not \`useState(expensiveInit())\`) whenever the initial value is expensive — React will call it exactly once on mount.\r
\r
---\r
\r
### Performance Pitfalls\r
\r
---\r
\r
**Q17: A \`Child\` is wrapped in \`React.memo\` and the parent passes \`data={users}\` and \`onSelect={handleSelect}\`, where \`handleSelect\` is defined as a regular function inside the parent's body. Why does \`Child\` still re-render every time the parent re-renders, and what is the minimum fix?**\r
\r
\`\`\`jsx\r
const Child = React.memo(function Child({ data, onSelect }) {\r
  console.log("Child render");\r
  return <ul>{data.map(u => <li key={u.id} onClick={() => onSelect(u)}>{u.name}</li>)}</ul>;\r
});\r
\r
function Parent() {\r
  const [count, setCount] = useState(0);\r
  const [users] = useState([{ id: 1, name: "Ana" }]);\r
\r
  function handleSelect(u) { console.log(u); }   // recreated each render\r
\r
  return (\r
    <>\r
      <button onClick={() => setCount(c => c + 1)}>{count}</button>\r
      <Child data={users} onSelect={handleSelect} />\r
    </>\r
  );\r
}\r
\r
render(<Parent />);\r
\`\`\`\r
\r
**Output:** \`Child render\` logs on mount and then **again on every click**, even though \`users\` and the user-visible behaviour of \`handleSelect\` never change. Press **Try it**, click the button, and watch the log repeat — that repetition is the bug \`React.memo\` was supposed to prevent.\r
\r
**Explanation:**\r
\r
\`React.memo\` does a **shallow** compare of props. When the parent re-renders (because \`count\` changed), the function body runs top-to-bottom, including \`function handleSelect(u) { ... }\`. That function declaration creates a fresh function object each render — \`handleSelect_render2 !== handleSelect_render1\` even though the source code is identical. The memo comparator then checks each prop: \`data\` is the same array reference (it lives in \`useState\`, so it survives across renders), but \`onSelect\` is a new reference. Shallow equality fails on \`onSelect\`, the memo bails, and \`Child\` re-renders.\r
\r
\`users\` survives because \`useState\` stores the value across renders and only changes the reference if you call its setter. Inline objects/arrays defined directly in the JSX (\`data={[...]}\`) would have the same problem as \`handleSelect\`.\r
\r
The minimum fix is \`useCallback\`: \`const handleSelect = useCallback((u) => console.log(u), [])\`. This stores a single function reference across renders (until the dependency list changes), so \`onSelect\` stays referentially equal and the memo holds.\r
\r
**The fix — give the callback a stable identity:**\r
\r
\`\`\`jsx\r
const Child = React.memo(function Child({ data, onSelect }) {\r
  console.log("Child render");\r
  return <ul>{data.map(u => <li key={u.id} onClick={() => onSelect(u)}>{u.name}</li>)}</ul>;\r
});\r
\r
function Parent() {\r
  const [count, setCount] = useState(0);\r
  const [users] = useState([{ id: 1, name: "Ana" }]);\r
\r
  // ✓ The same function object across renders, so memo's shallow compare passes.\r
  const handleSelect = useCallback((u) => { console.log(u); }, []);\r
\r
  return (\r
    <>\r
      <button onClick={() => setCount(c => c + 1)}>{count}</button>\r
      <Child data={users} onSelect={handleSelect} />\r
    </>\r
  );\r
}\r
\r
render(<Parent />);\r
\`\`\`\r
\r
\`Child render\` now logs **once**, on mount, however many times you click.\r
\r
Two things decide whether this actually works:\r
\r
- **\`users\` is already stable**, because \`useState\` hands back the same array every render. Written inline as \`<Child data={[{ id: 1, name: "Ana" }]} />\` it would be a new array each time and \`useCallback\` would fix nothing — \`memo\` compares **every** prop, so one unstable prop defeats it entirely.\r
- **The dependency array has to be honest.** \`[]\` is right here only because \`handleSelect\` closes over nothing. The moment it reads \`count\`, \`count\` belongs in the deps — and the identity then changes whenever \`count\` does, which is exactly when the child needs the new value anyway. A dishonest \`[]\` does not buy performance; it buys a stale closure.\r
\r
**Takeaway:** \`React.memo\` is necessary but not sufficient — every function/object/array prop you pass must be referentially stable too, or the memo is wasted work plus an extra equality check.\r
\r
---\r
\r
**Q18: A \`<ThemeProvider>\` wraps the whole app and supplies \`value={{ theme, user, setTheme, setUser }}\`. Theme rarely changes, but \`user\` updates on every page navigation. Why do **all** consumers of \`useTheme()\` re-render on navigation, even ones that never read \`user\`?**\r
\r
\`\`\`jsx\r
const Ctx = createContext(null);\r
\r
function AppProvider({ children }) {\r
  const [theme, setTheme] = useState("dark");\r
  const [user, setUser] = useState(null);\r
\r
  return (\r
    <Ctx.Provider value={{ theme, user, setTheme, setUser }}>\r
      {children}\r
    </Ctx.Provider>\r
  );\r
}\r
\r
function ThemedButton() {\r
  const { theme } = useContext(Ctx);     // only reads theme\r
  console.log('ThemedButton render');    // logged so Try it shows each re-render\r
  return <button className={theme}>Go</button>;\r
}\r
\r
// Harness: a page that reads user. "Navigate" changes only user — watch ThemedButton log anyway\r
function Page() {\r
  const { setUser } = useContext(Ctx);\r
  return <><ThemedButton /><button onClick={() => setUser({ at: Date.now() })}>Navigate</button></>;\r
}\r
\r
render(<AppProvider><Page /></AppProvider>);\r
\`\`\`\r
\r
**Output:** Every \`ThemedButton\` re-renders on user updates, even though it only reads \`theme\`.\r
\r
**Explanation:**\r
\r
Context propagation in React is keyed off the \`value\` **reference**, not the individual fields you destructure inside \`useContext\`. On every render of \`AppProvider\`, the \`{ theme, user, setTheme, setUser }\` object literal creates a new object — even if the *contents* are unchanged. React compares the new value reference to the previous one with \`Object.is\`, sees they differ, and notifies every subscriber to schedule a re-render. The destructuring \`{ theme }\` inside the consumer happens *after* React has already scheduled the work; React doesn't know which fields you read, so it can't be selective.\r
\r
Two compounding problems: (1) the provider's value is a brand-new object on every render, so re-renders fire even when nothing actually changed; (2) when something *does* change (e.g. \`user\`), every consumer re-renders, including ones that only read \`theme\`.\r
\r
**The fix — and the obvious one does not work.**\r
\r
\`\`\`jsx\r
// ✗ useMemo alone does NOT fix the symptom in this question.\r
function AppProvider({ children }) {\r
  const [theme, setTheme] = useState("dark");\r
  const [user, setUser] = useState(null);\r
\r
  const value = useMemo(() => ({ theme, user, setTheme, setUser }), [theme, user]);\r
  //                                                                        ^^^^\r
  // \`user\` is a dependency, so a navigation still produces a NEW value object,\r
  // and every consumer re-renders — including ThemedButton, which reads theme only.\r
\r
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;\r
}\r
\r
// stand-ins so this example runs on its own\r
const Ctx = createContext(null);\r
function ThemedButton() {\r
  const { theme } = useContext(Ctx);\r
  console.log('ThemedButton render');\r
  return <button className={theme}>Go</button>;\r
}\r
function Page() {\r
  const { setUser } = useContext(Ctx);\r
  return <><ThemedButton /><button onClick={() => setUser({ at: Date.now() })}>Navigate</button></>;\r
}\r
\r
render(<AppProvider><Page /></AppProvider>);\r
\`\`\`\r
\r
Measured on React 19: the theme-only consumer re-renders on a \`user\` change **with or without** that \`useMemo\`. What \`useMemo\` does fix is a *different* problem — re-renders caused by the provider's **parent** re-rendering when nothing in the value actually changed. Worth doing, but it is not the answer to this question.\r
\r
\`\`\`jsx\r
// ✓ Split by how often each piece changes. This is what actually fixes it.\r
const ThemeCtx = createContext(null);\r
const UserCtx  = createContext(null);\r
\r
function AppProvider({ children }) {\r
  const [theme, setTheme] = useState("dark");\r
  const [user, setUser] = useState(null);\r
\r
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);\r
  const userValue  = useMemo(() => ({ user, setUser }),  [user]);\r
\r
  return (\r
    <ThemeCtx.Provider value={themeValue}>\r
      <UserCtx.Provider value={userValue}>{children}</UserCtx.Provider>\r
    </ThemeCtx.Provider>\r
  );\r
}\r
\r
// Subscribes to ThemeCtx only, so a user change cannot reach it.\r
const ThemedButton = React.memo(function ThemedButton() {\r
  const { theme } = useContext(ThemeCtx);\r
  console.log('ThemedButton render');    // logged so Try it shows each re-render\r
  return <button className={theme}>Go</button>;\r
});\r
\r
// Harness: a page that reads user. "Navigate" changes only user — ThemedButton no longer logs\r
function Page() {\r
  const { setUser } = useContext(UserCtx);\r
  return <><ThemedButton /><button onClick={() => setUser({ at: Date.now() })}>Navigate</button></>;\r
}\r
\r
render(<AppProvider><Page /></AppProvider>);\r
\`\`\`\r
\r
**\`React.memo\` on the consumer is part of the fix, not an extra.** Splitting stops the *context* notifying it, but \`AppProvider\` still re-renders when \`user\` changes, and re-rendering a parent re-renders its children by default. Only with both does the count reach zero — measured: 1 re-render with the split alone, 0 with the split plus \`memo\`.\r
\r
If you need one logical store with genuine field-level subscription, that is what **Zustand, Jotai or \`useSyncExternalStore\`** are for — a component subscribes to a slice, which Context fundamentally cannot do.\r
\r
\r
**Takeaway:** Context is a *broadcast* mechanism — it's coarse by design. Memoize the value, split unrelated state, and reach for a store library when consumers need field-level subscriptions.\r
\r
---\r
\r
**Q19: A list of 5,000 rows is rendered with \`items.map((item, i) => <Row key={i} {...item} />)\`. The user clicks a button that calls \`setItems(prev => [newItem, ...prev])\`. What goes wrong, and why is it both a correctness *and* a performance bug?**\r
\r
**Output:** Every existing \`Row\` re-renders (or worse, mounts/unmounts), and any internal Row state — like a half-typed input — is wrong: it sticks to the *position* instead of the row's data.\r
\r
**Explanation:**\r
\r
When you use the array index as \`key\`, React's reconciler matches old and new children by position, not identity. Before the prepend, the first row had \`key=0\` and the data for \`oldItems[0]\`. After the prepend, the first row still has \`key=0\` but now holds \`newItem\`. React looks up \`key=0\`, sees a "match," and instead of mounting a new row at the top and shifting the rest, it **reuses** the first DOM node and just updates its props. Every row's props change because every row's data shifted, so every row's hooks/state/DOM are reconciled. With 5,000 rows that's a massive amount of unnecessary work — and any internal Row state (controlled inputs, expanded/collapsed flags) now belongs to the *wrong* item.\r
\r
If you used \`key={item.id}\` instead, the reconciler matches by identity. The new row gets a fresh mount; existing rows keep their identity, their state and their DOM nodes, and React only inserts one node at the top. Their props are unchanged too, so if \`Row\` is wrapped in \`React.memo\`, React skips re-rendering them entirely. (Without \`memo\` the rows still re-run because the parent re-rendered, but they produce identical output and touch no DOM.)\r
\r
The bug compounds with \`React.memo\`: memoization can't help when index keys make every prop look "changed" from the reconciler's point of view.\r
\r
**Takeaway:** Use index keys only for static lists that never reorder, splice, or filter. For everything else, use a stable id — it's a correctness fix first, performance fix second.\r
\r
---\r
\r
**Q20: A search input filters a 50,000-item product list. The user reports the input "feels laggy" — characters lag behind their typing by 300ms. Wrapping the filter call in \`useTransition\` fixes the lag. What does that actually change at the React scheduler level?**\r
\r
\`\`\`jsx\r
function Search({ products }) {\r
  const [query, setQuery] = useState("");\r
  const [filtered, setFiltered] = useState(products);\r
  const [isPending, startTransition] = useTransition();\r
\r
  function onChange(e) {\r
    setQuery(e.target.value);                                  // urgent\r
    startTransition(() => {\r
      setFiltered(products.filter(p => p.name.includes(e.target.value)));   // non-urgent\r
    });\r
  }\r
\r
  return <><input value={query} onChange={onChange} />{isPending && "…"}<List items={filtered}/></>;\r
}\r
\r
// stand-ins so this example runs on its own: 50,000 products, first 50 shown\r
const List = ({ items }) => <p>{items.length} matches: {items.slice(0, 50).map(p => p.name).join(', ')}</p>;\r
const products = Array.from({ length: 50000 }, (_, i) => ({ name: 'product ' + i }));\r
\r
render(<Search products={products} />);\r
\`\`\`\r
\r
**Output:** Without \`useTransition\`, every keystroke schedules one render that re-runs the 50K filter and re-renders the list synchronously — the input value can't update until that render commits. With \`useTransition\`, the input updates on every keystroke at full speed; the filtered list catches up in the background.\r
\r
**Explanation:**\r
\r
In React's concurrent renderer, every state update has a **lane** (priority). By default, \`setState\` calls inside an event handler land in the same lane and are batched into a single render. \`setQuery\` (cheap) and \`setFiltered\` (expensive) get committed together, so the input value can't paint until the whole render — including the 50K-item filter and the list reconciliation — finishes. Result: input lag.\r
\r
\`startTransition(fn)\` tells React "the state updates inside \`fn\` are non-urgent." Those updates go into a transition lane that's lower priority than the default lane. The \`setQuery\` update keeps its urgent priority, so React can paint the new input value first, then start working on the transition. Critically, transitions are **interruptible**: if the user types another character while React is mid-filter, React throws away the in-progress work and starts over with the latest value. That's why concurrent rendering matters here — without it, you'd just be queueing up filter computations and getting further behind.\r
\r
\`isPending\` exposes the "transition in flight" state so you can show a spinner without re-introducing the lag (because the spinner update itself is urgent and lives outside the transition).\r
\r
The same effect can be achieved with \`useDeferredValue(query)\` when you don't own the \`setState\` of the slow consumer — the deferred value lags behind the real value, and React renders the consumer at lower priority.\r
\r
**Takeaway:** \`useTransition\` doesn't make the work faster — it makes the work **interruptible** and **lower-priority**, so urgent UI (input, click feedback) commits without waiting on it.\r
\r
---\r
\r
**Q21: A \`Chart\` component is loaded with \`React.lazy(() => import('./Chart'))\` and rendered inside \`<Suspense fallback={<Spinner />}>\`. The first time the page mounts, the user sees a 200ms flash of the spinner even on a fast connection. Why, and what's the fix if the chart is above the fold?**\r
\r
**Explanation:**\r
\r
\`React.lazy\` triggers the dynamic \`import()\` only the first time the lazy component is rendered. The browser then has to: (1) make a network request for the chunk, (2) wait for it to download, (3) parse and execute it. Meanwhile, \`<Suspense>\` shows the fallback. Even on a fast connection, the round-trip + parse easily takes 100–300ms — so you see the spinner flash.\r
\r
For an above-the-fold chunk, lazy loading is the wrong tool. The whole point of lazy loading is to *delay* work until the user needs it; if the user always needs it on this route, you've added a network round-trip for no benefit, *worsened* LCP, and introduced a layout shift when the spinner is replaced.\r
\r
Fixes, by situation:\r
\r
1. **Don't lazy-load it.** Import it normally. Code splitting is for code the user *might* not need.\r
2. **Preload the chunk** with \`<link rel="modulepreload" href="/assets/Chart-abc123.js">\` in the HTML head — the browser starts fetching in parallel with the main bundle, so by the time React renders \`<Chart>\` the chunk is already in the cache and Suspense never has to wait.\r
3. **Prefetch on hover/intent** for routes one click away — start the import when the user hovers the link, finish by the time they click.\r
4. **\`startTransition\` around the navigation** that triggers the lazy boundary — React will keep showing the previous UI instead of swapping to the fallback, hiding the loading flash.\r
\r
**Takeaway:** \`React.lazy\` is a knob, not a free upgrade. Lazy-load below-the-fold or rarely-used widgets; for above-the-fold code, either ship it eagerly or preload the chunk so the Suspense boundary never trips.\r
\r
---\r
\r
**Q22: A bundle analyzer shows that \`lodash\` is contributing 71 KB to the production bundle, but the team only uses \`debounce\` and \`cloneDeep\`. The lead developer changed \`import _ from 'lodash'\` to \`import { debounce, cloneDeep } from 'lodash'\` — the bundle size barely moved. Why didn't named imports tree-shake?**\r
\r
**Explanation:**\r
\r
Tree shaking depends on the bundler being able to **statically prove** that an export is unused, and that proof relies on the source being **ES modules** that are explicitly side-effect-free. The classic \`lodash\` package on npm ships **CommonJS** — it predates the ESM era. CommonJS uses \`module.exports = require('./debounce')\` etc., which is a runtime construct: the bundler can't prove at build time that \`cloneDeep\` is the only thing reachable, because in CJS any module can dynamically reach into another. Most bundlers fall back to including the whole module.\r
\r
Two complementary fixes:\r
\r
1. **Use the ESM build**: \`import { debounce, cloneDeep } from 'lodash-es'\`. \`lodash-es\` is the same library shipped as ES modules with \`sideEffects: false\` declared, so Rollup/Webpack can shake out everything you don't reference. This single change usually drops 60+ KB.\r
2. **Per-function imports** as a fallback when only the CJS build is available: \`import debounce from 'lodash/debounce'\`. This works because \`lodash/debounce.js\` is a narrow file with only its own dependencies — the bundler ends up with just the dependency closure of debounce, not all of lodash.\r
\r
Same lesson applies to other libraries: \`moment\` doesn't tree-shake well (its locales pull in megabytes); replace with \`date-fns\` (ESM, fully tree-shaken) or \`dayjs\` (~2 KB core). Icon packs ship as one giant file by default — most provide per-icon imports (\`from 'lucide-react/icons/x'\`) that shake correctly.\r
\r
Verify the win in the analyzer, not in your head — module resolution edge cases (transitive deps, dual-package hazards) sometimes mean the "obvious" fix doesn't actually shrink the bundle.\r
\r
**Takeaway:** Tree shaking needs ES modules + \`sideEffects: false\` + named imports. \`lodash\` (CJS) won't shake even with named imports — switch to \`lodash-es\` or per-function paths. Always verify the savings with a bundle analyzer.\r
\r
---\r
\r
### React 19.2 APIs\r
\r
---\r
\r
**Q23: Toggling an \`<Activity>\` from visible to hidden and back — what does the console print, and what is the counter showing at the end?**\r
\r
\`\`\`tsx\r
function Timer() {\r
  const [n, setN] = useState(0);\r
  useEffect(() => {\r
    console.log('effect mount');\r
    const id = setInterval(() => setN(x => x + 1), 1000);\r
    return () => { console.log('effect cleanup'); clearInterval(id); };\r
  }, []);\r
  return <p>Ticks: {n}</p>;\r
}\r
\r
function Panel() {\r
  const [show, setShow] = useState(true);\r
\r
  // The timeline: visible for 3s → hidden for 5s → visible again.\r
  useEffect(() => {\r
    const hide = setTimeout(() => setShow(false), 3000);\r
    const back = setTimeout(() => setShow(true), 8000);\r
    return () => { clearTimeout(hide); clearTimeout(back); };\r
  }, []);\r
\r
  return (\r
    <Activity mode={show ? 'visible' : 'hidden'}>   {/* <- the boundary under test */}\r
      <Timer />\r
    </Activity>\r
  );\r
}\r
\r
render(<Panel />);\r
\`\`\`\r
\r
**Output:**\r
\`\`\`\r
effect mount        (t=0)\r
effect cleanup      (t=3s, on hide)\r
effect mount        (t=8s, on show)\r
\`\`\`\r
and the counter reads **3**, then resumes counting 4, 5, 6…\r
\r
**Explanation:**\r
\r
\`<Activity>\` splits apart two things that had always moved together: **state lifetime** and **effect lifetime**.\r
\r
When the activity is hidden, React "will destroy their Effects, cleaning up any active subscriptions" — so the cleanup runs, \`clearInterval\` fires, and the timer genuinely stops. Nothing ticks during the five hidden seconds. But the component's **state is saved**, not discarded. When the activity becomes visible again, React "will reveal the children with their previous state restored, and re-create their Effects" — hence the second \`effect mount\`, and hence a counter that reads \`3\` rather than \`0\`.\r
\r
That is the whole point, and it is why the count is \`3\` and not \`8\`. Compare the alternatives on the same timeline:\r
\r
- **Conditional rendering** (\`{show && <Timer />}\`): cleanup on hide, mount on show, and the counter resets to **0** — the state is gone.\r
- **CSS \`display: none\`**: no cleanup, no re-mount, the interval keeps ticking while hidden, and the counter reads **8** — you paid for five seconds of invisible work.\r
- **\`<Activity>\`**: cleanup and re-mount, counter reads **3** — work stopped, state survived.\r
\r
Two further subtleties this snippet hides. A hidden activity is **not frozen**: its children still re-render in response to new props, just at a lower priority than visible content — so it is cheap, not free. And because effect *cleanup* is the mechanism that stops work, an effect with a missing or incomplete cleanup function will keep running while hidden; \`<Activity>\` makes correct cleanup load-bearing rather than merely good practice.\r
\r
**Takeaway:** hiding an \`<Activity>\` destroys effects but preserves state, and revealing it restores that state and re-creates the effects — the one combination neither conditional rendering (loses state) nor \`display: none\` (keeps effects running) could give you.\r
\r
---\r
\r
**Q24: \`cbCallback\` and \`cbEvent\` close over the same prop and are called from the same interval. Why do they log different values?**\r
\r
\`\`\`tsx\r
function Ticker({ value }) {\r
  const cbCallback = useCallback(() => console.log('cb', value), []);\r
  const cbEvent = useEffectEvent(() => console.log('ev', value));\r
\r
  useEffect(() => {\r
    const id = setInterval(() => { cbCallback(); cbEvent(); }, 1000);\r
    return () => clearInterval(id);\r
  }, []);\r
\r
  return null;\r
}\r
\r
function Demo() {\r
  const [value, setValue] = useState(0);\r
\r
  // The parent re-renders Ticker with value = 0, then 1, then 2 — once a second.\r
  useEffect(() => {\r
    const id = setInterval(() => setValue(v => v + 1), 1000);\r
    return () => clearInterval(id);\r
  }, []);\r
\r
  return <Ticker value={value} />;\r
}\r
\r
render(<Demo />);\r
\`\`\`\r
\r
**Output:**\r
\`\`\`\r
cb 0   ev 0\r
cb 0   ev 1\r
cb 0   ev 2\r
\`\`\`\r
\r
**Explanation:**\r
\r
This is the staleness-versus-stability trade-off that \`useEffectEvent\` was built to eliminate, shown side by side.\r
\r
\`useCallback(fn, [])\` returns **the same function object** on every render — which is why it can safely be omitted from the effect's dependency array. But "the same function object" means literally the one created during the *first* render, and that function closed over \`value\` as it was then: \`0\`. Every later render creates a fresh candidate function, and \`useCallback\` throws it away because the dependency array says nothing changed. So \`cb\` logs \`0\` forever. This is the classic stale-closure bug, and the usual "fix" — adding \`value\` to the deps — makes \`cbCallback\` a new reference each render, which then makes the \`useEffect\` dependency array dishonest and, once corrected, tears down and recreates the interval every second.\r
\r
\`useEffectEvent\` returns a **stable wrapper around a mutable slot**. The identity of the returned function never changes (so it never needs to be a dependency), but React swaps the underlying implementation on every render, so the body always sees the latest props and state. \`ev\` therefore logs \`0\`, \`1\`, \`2\`.\r
\r
The two properties are what no previous hook could combine:\r
\r
| Callback form | Stable identity | Sees latest values |\r
|---|---|---|\r
| inline \`() => …\` | ✗ | ✓ |\r
| \`useCallback(fn, [])\` | ✓ | ✗ |\r
| \`useCallback(fn, [value])\` | ✗ | ✓ |\r
| \`useEffectEvent(fn)\` | **✓** | **✓** |\r
\r
The restriction that pays for this: effect events may only be **called from inside an effect** (or another effect event) — never during render, and never passed to a child as a prop. A value that is simultaneously stable and always-fresh has no consistent meaning during render, so the linter treats it as an error. Note too that \`eslint-plugin-react-hooks\` v6 knows about effect events and correctly leaves them out of dependency arrays, which is what makes the hook usable rather than a new source of false warnings.\r
\r
**Takeaway:** \`useCallback\` with empty deps is stable but stale; \`useEffectEvent\` is stable *and* fresh, because React keeps the wrapper's identity fixed while replacing the function inside it every render.\r
\r
---\r
\r
**Q25: With React Compiler enabled and StrictMode on in development, what does this render?**\r
\r
\`\`\`jsx\r
function TagList({ tags }) {\r
  tags.push('featured');                 // mutating a prop during render\r
  return <ul>{tags.map((t, i) => <li key={i}>{t}</li>)}</ul>;\r
}\r
\r
function Demo() {\r
  const [n, setN] = useState(0);\r
  const tags = useMemo(() => ['new', 'sale'], []);   // the parent owns this array\r
\r
  return (\r
    <StrictMode>\r
      <button onClick={() => setN(n + 1)}>Re-render ({n})</button>\r
      <TagList tags={tags} />\r
    </StrictMode>\r
  );\r
}\r
\r
render(<Demo />);\r
\`\`\`\r
\r
**Output (development, StrictMode):**\r
\`\`\`\r
new\r
sale\r
featured\r
featured\r
\`\`\`\r
and the component is **silently skipped** by the compiler — no memoization is applied to it.\r
\r
Press **Try it** and click *Re-render*: the list grows by two every click — \`featured\` accumulates without bound, because the array is never recreated. (Running this against a *production* build you would see one \`featured\` per render instead of two, since StrictMode's double-invoke is development-only — the bug is the same, just half as loud.)\r
\r
**Explanation:**\r
\r
Two separate consequences of the same rule violation, and interviewers use this to see whether you understand that the compiler is a *conditional* optimisation rather than a magic switch.\r
\r
**The duplicate \`featured\`** comes from StrictMode, which deliberately invokes component functions twice in development to surface impure renders. Because \`tags.push(...)\` mutates the array the parent owns rather than deriving a new one, the second invocation pushes onto the *already-mutated* array. The render output is now a function of how many times the component happened to run — which is exactly the property React's concurrent renderer is allowed to vary. In production without StrictMode you would see one \`featured\` and conclude the code was fine; the bug would then surface as a duplicate the first time an interrupted render was retried.\r
\r
**The silent bail-out** is the compiler half. React Compiler only emits memoization for a component when its data-flow analysis can prove the component obeys the Rules of React — purity (idempotent rendering, no side effects during render) and immutability (props, state and hook results are not mutated). A \`push\` onto a prop violates both. Faced with that, the compiler does not error and does not produce unsound code: it **skips the component entirely**, leaving it exactly as written.\r
\r
That failure mode is the thing to name out loud. A codebase full of rule violations does not break under the compiler — it just quietly receives none of the benefit, component by component, with no runtime signal. Which is why compiler adoption is really a linting project: the compiler-powered rules in \`eslint-plugin-react-hooks\` v6 report which components bailed out and why, and you fix those *before* turning the compiler on, not after wondering why your benchmarks didn't move.\r
\r
The fix is to derive rather than mutate:\r
\r
\`\`\`jsx\r
function TagList({ tags }) {\r
  const all = [...tags, 'featured'];       // or tags.concat('featured')\r
  return <ul>{all.map(t => <li key={t}>{t}</li>)}</ul>;\r
}\r
\r
render(<TagList tags={['new', 'sale']} />);\r
\`\`\`\r
\r
**Takeaway:** React Compiler bails out silently on components that violate purity or immutability, so rule violations cost you the optimisation rather than producing an error — and StrictMode's double-invoke is the tool that makes the underlying impurity visible.\r
\r
---\r
\r
**Q26: The dependency array is empty and the linter is happy. Why does switching rooms never reconnect?**\r
\r
\`\`\`tsx\r
// stand-in so this example runs on its own\r
function createConnection(roomId) {\r
  return {\r
    on: (_event, cb) => setTimeout(cb, 100),\r
    connect: () => console.log('connect', roomId),\r
    disconnect: () => console.log('disconnect', roomId),\r
  };\r
}\r
\r
function ChatRoom({ roomId }) {\r
  const connect = useEffectEvent(() => {\r
    const conn = createConnection(roomId);\r
    conn.connect();\r
    return conn;\r
  });\r
\r
  useEffect(() => {\r
    const conn = connect();\r
    return () => conn.disconnect();\r
  }, []);        // linter: no warning\r
  return <p>Showing room: {roomId}</p>;\r
}\r
\r
function Demo() {\r
  const [roomId, setRoomId] = useState('general');\r
  return (\r
    <>\r
      <button onClick={() => setRoomId(r => (r === 'general' ? 'random' : 'general'))}>Switch room ({roomId})</button>\r
      <ChatRoom roomId={roomId} />\r
    </>\r
  );\r
}\r
\r
render(<Demo />);\r
\`\`\`\r
\r
**Behaviour:**\r
\`\`\`\r
mount with roomId="general"  → connects to "general"\r
prop changes to "random"     → nothing happens; still connected to "general"\r
\`\`\`\r
\r
**Explanation:**\r
\r
This is \`useEffectEvent\` used backwards, and it is the API's main hazard precisely because the linter *approves* it.\r
\r
Effect events are **non-reactive by design**. Wrapping logic in \`useEffectEvent\` tells React "this code should always see the latest values, but changes to those values must not re-run anything." The linter therefore omits \`connect\` from the dependency array — correctly, per the contract you declared — and since \`roomId\` is no longer read directly inside the effect, it doesn't appear either. The dependency array is now genuinely complete *with respect to what the effect reads*, so there is no warning. The bug is not a missing dependency; it is a **mis-declared reactivity boundary**.\r
\r
The distinction to apply is *what kind of logic this is*:\r
\r
- **Reactive / synchronising** — "the connection must correspond to \`roomId\`." A change in \`roomId\` means the current state of the world is wrong and must be re-synchronised. This belongs **in the effect body, with \`roomId\` in the deps.**\r
- **Non-reactive / event** — "when the connection opens, show a toast in the current theme." A change in \`theme\` doesn't invalidate anything; it just means the next toast should look different. This belongs **in an effect event.**\r
\r
Written correctly, each piece goes where it belongs:\r
\r
\`\`\`tsx\r
// stand-in so this example runs on its own\r
const showToast = (msg, theme) => console.log(msg, '(' + theme + ' toast)');\r
function createConnection(roomId) {\r
  return {\r
    on: (_event, cb) => setTimeout(cb, 100),\r
    connect: () => console.log('connect', roomId),\r
    disconnect: () => console.log('disconnect', roomId),\r
  };\r
}\r
\r
function ChatRoom({ roomId, theme }) {\r
  const onConnected = useEffectEvent(() => showToast('Connected!', theme));  // event\r
\r
  useEffect(() => {                        // synchronisation\r
    const conn = createConnection(roomId);\r
    conn.on('connected', () => onConnected());\r
    conn.connect();\r
    return () => conn.disconnect();\r
  }, [roomId]);                            // honest and complete\r
  return <p>Showing room: {roomId}</p>;\r
}\r
\r
function Demo() {\r
  const [roomId, setRoomId] = useState('general');\r
  return (\r
    <>\r
      <button onClick={() => setRoomId(r => (r === 'general' ? 'random' : 'general'))}>Switch room ({roomId})</button>\r
      <ChatRoom roomId={roomId} theme="dark" />\r
    </>\r
  );\r
}\r
\r
render(<Demo />);\r
\`\`\`\r
\r
The generalisable warning: \`useEffectEvent\` makes awkward effects tolerable, which makes it a tempting way to silence any dependency you find inconvenient. Silencing a dependency you *wanted* to react to converts a loud lint warning into a quiet behavioural bug. The moment you reach for it to make a warning go away rather than to express "this is an event", you are using it wrong.\r
\r
**Takeaway:** \`useEffectEvent\` declares logic *non-reactive*, so putting synchronisation logic inside one removes it from the dependency graph and the effect stops responding to the very prop it depends on — reactive setup stays in the effect body, events go in effect events.\r
\r
---\r
\r
### Key Rules\r
\r
\`\`\`\r
React Output Cheat Sheet:\r
1.  setState with direct value uses the closure value (may be stale)\r
2.  setState with function updater gets the latest pending state\r
3.  React 18+ batches all state updates in event handlers\r
4.  useEffect runs AFTER browser paint, not during render\r
5.  useEffect cleanup captures values from the render it was created in\r
6.  Object/array deps created during render re-run the effect every time (new reference)\r
7.  React.memo does shallow compare — new object refs bypass it\r
8.  Changing \`key\` completely remounts the component\r
9.  Hooks must be called in the same order every render\r
10. useRef mutations don't trigger re-renders\r
11. Inline {object} as Context value re-renders ALL consumers — useMemo it\r
12. Index keys break correctness on prepend/splice; use stable ids\r
13. useTransition makes work non-urgent + interruptible, not faster\r
14. React.lazy adds a network round-trip; preload above-the-fold chunks\r
15. Tree shaking needs ESM + sideEffects:false; CJS lodash won't shake\r
\`\`\`\r
\r
---\r
\r
## References\r
\r
- [React Documentation](https://react.dev) — Official React docs with interactive examples\r
- [React API Reference](https://react.dev/reference/react) — Complete hooks and components API\r
- [React GitHub](https://github.com/facebook/react) — Source code and issue tracker\r
- [Building Performant React Applications](https://anshurajsingh.com/blog/react-performance-optimization) — a worked profiling, Redux Toolkit selector, code-splitting and virtualisation pass on a real dashboard app\r
`;export{e as default};
