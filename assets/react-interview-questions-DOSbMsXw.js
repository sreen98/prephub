const e=`# React — Interview Questions

Interview questions and model answers, from beginner to advanced. Each answer links to the section that explains it in depth.

Part of the React series: [React Guide](/frontend/react) · [React Performance & Internals](/frontend/react-performance) · [React 19 & Patterns](/frontend/react-19-patterns) · **React Interview Questions** · [React Tricky Questions](/frontend/react-tricky-questions)

---

## Table of Contents

- [17. Interview Questions & Answers](#17-interview-questions-answers)

---

## 17. Interview Questions & Answers

### Beginner

---

**Q1: What is the Virtual DOM?**

**Short answer:** the Virtual DOM is the tree of plain JavaScript objects (React elements) that your components return, a cheap description of what the screen should show. On every update React builds a new tree, compares it with the previous one (reconciliation), and writes only the differences to the real DOM (the commit phase).

**The nuance worth volunteering:** it is not "faster than the DOM". Careful hand-written DOM updates can beat it, because React does its diffing *on top of* the DOM work. What it buys you is that simple declarative code, written as if the whole screen re-renders, is fast enough without tracking every change by hand.

→ Full explanation: [§14.1](/frontend/react-performance#141-the-render-reconcile-commit-pipeline)

---

**Q2: What is the difference between state, props and context?**

**Short answer:** **props** are inputs a parent passes to a child, **state** is data a component owns and can change, and **context** is data a component makes available to *everything* below it without passing it through each level.

| Question | Props | State | Context |
|---|---|---|---|
| Who owns it | the parent | the component itself | the nearest \`Provider\` above |
| Who can change it | only the parent (the child receives a read-only copy) | the component, with its setter | whoever owns the value given to the Provider |
| How it travels | one level down, explicitly | stays put, unless passed down as props | skips levels: any descendant can read it |
| Typical use | configuring a child: \`label\`, \`onClick\`, \`items\` | form input, open/closed, selected tab | theme, current user, language |

They are not three separate kinds of data. They are three ways the *same* value can reach a component. In the example below, \`theme\` is **state** in \`App\`, it becomes the **context** value, and \`Toolbar\` passes \`label\` down as a **prop**.

\`\`\`tsx
const ThemeContext = React.createContext('light');

function App() {
  const [theme, setTheme] = React.useState('dark');       // state: App owns it
  return (
    <ThemeContext.Provider value={theme}>                  {/* context: offered to everything below */}
      <Toolbar />
      <button onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}>Switch theme</button>
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return <ThemedButton label="Save" />;                   // prop: passed one level down
}

function ThemedButton({ label }) {
  const theme = React.useContext(ThemeContext);           // read directly, no props in between
  return <button style={{ background: theme === 'dark' ? '#333' : '#eee', color: theme === 'dark' ? '#fff' : '#000' }}>{label} ({theme})</button>;
}

render(<App />);
\`\`\`

**When to use which.** Start with state in the component that needs it. If a child needs it, pass it as a prop. If many components at different depths need it and passing it through every level gets painful ("prop drilling"), move it into context. **The catch:** every component that reads a context re-renders whenever its value changes, and it cannot subscribe to only part of it, so context suits values that rarely change (theme, user, locale). Q33 covers splitting a context.

→ Full explanation: [Props vs State](/frontend/react#props-vs-state), [§11.1](/frontend/react#111-creating-and-using-context)

---

**Q3: What is JSX?**

**Short answer:** JSX is HTML-like syntax inside JavaScript that a compiler (Babel, TypeScript, esbuild) turns into function calls that create React elements, plain objects describing what to render. Browsers never see it.

Since React 17 the default ("automatic") transform calls \`jsx()\` from \`react/jsx-runtime\`, which is why you no longer need \`import React\` in every file. The older "classic" transform called \`React.createElement\`. Babel's output for both:

\`\`\`text
<h1 className="title">Hello</h1>

// automatic transform (the default)
_jsx("h1", { className: "title", children: "Hello" });

// classic transform
React.createElement("h1", { className: "title" }, "Hello");
\`\`\`

That explains JSX's rules: \`{}\` takes an *expression*, not an \`if\` statement, because it becomes a function argument; you write \`className\` because attributes become object keys and \`class\` is a reserved word; and a component returns one root because a function returns one value.

→ Full explanation: [§2](/frontend/react#2-jsx)

---

**Q4: What are keys in React, and why are array indices bad keys?**

**Short answer:** a key tells React **which item** an element belongs to, so when a list changes it matches old and new elements by identity instead of by position. An index describes *where* an item sits, not *which* item it is: delete the first of three rows and React concludes that row 0 changed its text, so anything React tracks per element (an uncontrolled input's text, focus, a child's \`useState\`, a \`memo\` bailout) is handed to the wrong row.

\`\`\`tsx
// Three rows, each with an uncontrolled input. Type "hello" in the second one,
// then delete the FIRST row.
{rows.map((row, i) => <input key={i} defaultValue={row.label} />)}
// → "hello" is still on screen, now attached to what used to be the third row.
{rows.map(row => <input key={row.id} defaultValue={row.label} />)}
// → the right row disappears and the text goes with it.
\`\`\`

An index is fine only when the list is never reordered, filtered or inserted into except at the end, *and* the items hold no state. \`key={Math.random()}\` is worse than an index: it changes every render, so every row is unmounted and remounted every time. Keys only need to be unique among siblings.

→ Full explanation: [§14.4](/frontend/react-performance#144-why-list-keys-matter-at-the-algorithm-level)

---

**Q5: What is the difference between controlled and uncontrolled components?**

**Short answer:** in a **controlled** input React state holds the value (\`value\` plus \`onChange\`); in an **uncontrolled** input the DOM holds it and you read it through a ref or \`FormData\` when you need it.

Controlled is the usual default because the value is always in state, so you can validate as the user types, reformat input or disable the submit button. The cost is a re-render per keystroke. Uncontrolled suits simple forms read on submit, file inputs (always uncontrolled) and non-React widgets. The mistake to avoid is switching one input between the two, for example \`value={undefined}\` at first and a string later: React warns because it no longer knows who owns the value.

→ Full explanation: [§10.1](/frontend/react#101-controlled-components), [§10.2](/frontend/react#102-uncontrolled-components-useref)

---

### Intermediate

---

**Q6: Explain the useEffect hook and its dependency array.**

**Short answer:** \`useEffect\` runs code after React commits an update, to keep something *outside* React (a subscription, a timer, the document title, a non-React widget) in sync with props and state. With no array it runs after every render, with \`[]\` once after mount, and with \`[a, b]\` whenever \`a\` or \`b\` changed. The function it returns is the cleanup, which runs before the next run and on unmount.

Think of each run as "connect to \`userId\`" and each cleanup as "disconnect from the old \`userId\`". The array must list **every** prop or state value the effect reads: leaving one out does not mean "don't re-run", it means the effect keeps a value from an old render (a stale closure, Q81).

→ Full explanation: [§7.1](/frontend/react#71-useeffect), [§7.3](/frontend/react#73-common-pitfalls)

---

**Q7: What is the difference between useMemo and useCallback?**

**Short answer:** \`useMemo\` caches the *result* of a function; \`useCallback\` caches the *function itself*. \`useCallback(fn, deps)\` is the same as \`useMemo(() => fn, deps)\`.

Use \`useMemo\` for an expensive calculation, or to keep an object's reference stable. Use \`useCallback\` when a function goes to a child wrapped in \`React.memo\` or into a dependency array: an inline function is new every render, so the memoised child would re-render anyway. Without a consumer that compares references, \`useCallback\` buys nothing. The React Compiler adds most of this for you (Q27).

→ Full explanation: [§13.2](/frontend/react-performance#132-usememo-and-usecallback)

---

**Q8: How does React reconciliation work?**

**Short answer:** reconciliation is how React works out what changed: it compares the element tree from this render with the previous one and turns the differences into DOM updates. A full tree diff is O(n³), so React uses two shortcuts that make it O(n): elements of a **different type** are never compared in detail, and **keys** match children in a list.

The shortcut with consequences: when \`<div>\` becomes \`<section>\`, or \`<ProfileA>\` becomes \`<ProfileB>\`, React throws away the old subtree **including its state** and builds a new one. That one rule explains state resets with \`key\` (Q34) and the input that loses focus (Q82).

→ Full explanation: [§14.2](/frontend/react-performance#142-the-diffing-algorithm-three-rules), [§14.3](/frontend/react-performance#143-type-matching-when-components-survive-props-changes-vs-get-destroyed)

---

**Q9: Explain the Context API and when to use it.**

**Short answer:** context lets a component make a value available to every component below it without passing it through each layer ("prop drilling"). You create it with \`createContext()\`, provide it with \`<Context value={…}>\` (or \`<Context.Provider>\`), and read it with \`useContext()\` or \`use()\`.

It suits data many components need that rarely changes: theme, locale, the signed-in user, feature flags. It is a poor fit for fast-changing data, because every consumer re-renders when the value changes and none can subscribe to one field. Stores such as Zustand let each component subscribe to only what it reads (Q33, Q14).

→ Full explanation: [§11.1](/frontend/react#111-creating-and-using-context), [§11.2](/frontend/react#112-when-to-use-context-vs-state-management)

---

**Q10: What is the difference between \`useEffect\` and \`useLayoutEffect\`?**

**Short answer:** \`useLayoutEffect\` runs synchronously after React updates the DOM and **before the browser paints**, so it can measure layout and adjust it without a visible flicker; it blocks paint while it runs. \`useEffect\` does not block paint and usually runs after it, which is right for almost everything else (subscriptions, logging, timers).

The detail worth knowing: "after paint" is the usual case, not a guarantee. When an update comes from a discrete user interaction such as a click, React may flush its effects before the browser paints. Code that must run before paint belongs in \`useLayoutEffect\`, and code that must run after paint cannot rely on \`useEffect\`'s timing. If you are not sure which to use, use \`useEffect\`.

→ Full explanation: [§6.2](/frontend/react#62-built-in-hooks-reference)

---

### Advanced

---

**Q11: How do you prevent unnecessary re-renders? What if a parent changes often and re-renders all its children?**

**Short answer:** measure first, then fix the *structure* before reaching for \`memo\`. When a component's state changes, React re-renders it **and everything it renders**, whether or not their props changed. That is usually cheap; it hurts when a parent updates often (a timer, a text input, mouse position) and a child is expensive.

**The fixes, in the order to try them:**

1. **Measure.** The DevTools Profiler shows what re-renders and how long it takes (Q26). Many renders cost under a millisecond.
2. **Move the state down** into a small component that owns just the part that uses it.
3. **Lift the content up, and pass it as \`children\`.** The \`children\` element was created *above* the changing component, so it is the same element on every re-render, and React skips it.
4. **\`React.memo\` with stable props**, stabilising inline objects and functions with \`useMemo\`/\`useCallback\` (Q66).
5. **Split contexts** by how often they change (Q33).
6. **React Compiler**, which memoises automatically when enabled (Q27).

Fix 3 surprises people most, so here it is running. Both versions have the same ticking state; only where the child is created differs.

\`\`\`tsx
function Expensive({ label }) {
  console.log('render', label);
  return <p>{label}</p>;
}

function useTicks(count) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (tick >= count) return;
    const id = setTimeout(() => setTick((t) => t + 1), 10);
    return () => clearTimeout(id);
  }, [tick, count]);
  return tick;
}

// The ticking state and the child live in the same component,
// so every tick re-renders the child.
function Before() {
  const tick = useTicks(3);
  return <div>tick {tick} <Expensive label="inside" /></div>;
}

// Same ticking state, but the child is created ABOVE it and passed in.
function Ticker({ children }) {
  const tick = useTicks(3);
  return <div>tick {tick} {children}</div>;
}
function After() {
  return <Ticker><Expensive label="as children" /></Ticker>;
}

render(<><Before /><After /></>);
\`\`\`

\`\`\`text
render inside
render as children
render inside
render inside
render inside
\`\`\`

\`inside\` renders four times (once on mount, then once per tick). \`as children\` renders once, even though its wrapper re-rendered three times, and there is no \`memo\` anywhere. This is the cheapest fix there is, and the one interviewers most like to hear.

→ Full explanation: [§13.7](/frontend/react-performance#137-common-re-render-causes-and-fixes)

---

**Q12: Explain React Fiber architecture. How does it work internally, and why does it improve performance?**

**Short answer:** Fiber (React 16+) turned rendering from one uninterruptible recursive walk into a loop over small units of work that React can pause, prioritise and resume. Each component instance has a **fiber**, a plain object holding its type, props, hook state and pending work, linked to the others by \`child\`, \`sibling\` and \`return\` pointers rather than nested calls, so React can stop after any fiber and continue later from exactly there.

React builds a work-in-progress tree beside the \`current\` one and swaps it in when complete. That **render phase** is interruptible and may be thrown away (so rendering must be pure); the **commit phase** that writes the DOM is synchronous, so nobody sees half an update. Each update gets a priority **lane**: a click is synchronous, \`startTransition\` is a transition lane.

**Stated precisely:** Fiber does not make a render faster. It makes work **interruptible and prioritised**, so typing stays responsive while a list re-renders in a transition (better INP, not a faster total). A plain \`setState\` from a click still renders to completion.

→ Full explanation: [§14.5](/frontend/react-performance#145-fiber-the-data-structure-that-makes-interruption-possible), [§14.6](/frontend/react-performance#146-the-work-loop-how-react-actually-traverses)

---

**Q13: What are React Server Components (RSC)?**

**Short answer:** Server Components run only on the server, at build time or per request, and send their *rendered output* to the browser, never their code. A component that queries a database or imports a large markdown library therefore adds nothing to the bundle. They cannot use state, effects or event handlers, because those need code running in the browser; for interactivity they render Client Components, which live in files that start with \`'use client'\`.

The directive must be the first statement of its file, so the two kinds live in two files:

\`\`\`text
// app/users/page.tsx (a Server Component, the default in the App Router)
import Counter from './Counter';

export default async function UserList() {
  const users = await db.users.findAll();   // direct database access
  return (
    <>
      <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
      <Counter />
    </>
  );
}

// app/users/Counter.tsx (a Client Component)
'use client';
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);    // state needs the browser
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

The point to volunteer: RSC is not "SSR but newer". SSR decides *when HTML is produced*; RSC decides *where a component runs and whether its code ships at all*.

→ Full explanation: [§13.12](/frontend/react-performance#1312-server-components-ssr-and-streaming), and the [Next.js & RSC guide](/frontend/nextjs-rsc)

---

**Q14: How would you handle global state without Redux?**

**Short answer:** first split the state by kind. Data from an API is *server state* and belongs in a fetching cache such as TanStack Query, which handles caching, refetching and deduplication. What is left is usually small: Context + \`useReducer\` for values that change rarely, or a small store such as Zustand or Jotai, where a component subscribes through a **selector** and re-renders only when its slice changes.

\`\`\`tsx
// Zustand: select each field you use, so a change to anything else in the store does not re-render this component
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

function Counter() {
  const count = useStore((s) => s.count);
  const increment = useStore((s) => s.increment);
  return <button onClick={increment}>{count}</button>;
}
\`\`\`

Calling \`useStore()\` with no selector subscribes to the whole store, which brings back the context re-render problem. \`useSyncExternalStore\` is the hook these libraries use underneath; reach for it directly only when writing your own store.

→ Full explanation: [§11.3](/frontend/react#113-server-state-vs-client-state-the-most-important-distinction), and the [Zustand guide](/frontend/zustand)

---

**Q15: Explain the difference between \`useTransition\` and \`useDeferredValue\`.**

**Short answer:** both render an update at low priority so urgent updates such as typing are never blocked. \`useTransition\` marks a **state update you trigger** (\`startTransition(() => setFilter(q))\`) and gives you \`isPending\`; \`useDeferredValue\` marks a **value you receive** (\`const deferred = useDeferredValue(query)\`) and lags behind it.

The non-obvious point: the callback you pass to \`startTransition\` runs immediately. Only the re-render caused by the state update inside it is low priority, so slow work must happen in that render, not in the callback. Q24 covers why it sometimes does nothing.

→ Full explanation: [§13.5](/frontend/react-performance#135-concurrent-features-usetransition-usedeferredvalue)

---

**Q16: What is Suspense and how does it work?**

**Short answer:** \`<Suspense fallback={…}>\` shows a fallback while something inside it is not ready (code still downloading through \`React.lazy\`, or data read with \`use()\` or a Suspense-enabled library), then swaps in the content when it is. A component "suspends" by signalling that it is waiting on a promise; React shows the nearest boundary's fallback and retries the render when the promise settles.

You never throw a promise yourself: \`React.lazy\`, \`use()\` and libraries (TanStack Query's \`useSuspenseQuery\`, framework loaders) do it, and the mechanism is an internal detail. Boundaries also define the chunks that streaming SSR sends as they become ready.

→ Full explanation: [§16.4](/frontend/react-19-patterns#164-use-hook), [§13.3](/frontend/react-performance#133-code-splitting-lazy-loading)

---

**Q17: How does the React Compiler work?**

**Short answer:** it is a build step that analyses each component and hook, works out which values can change between renders, and adds a small per-instance cache (\`const $ = _c(n)\`) so everything else is reused. The effect is the memoisation you would write by hand with \`useMemo\`, \`useCallback\` and \`memo\`, applied automatically and more finely: it can cache a single JSX subtree, and it can memoise after an early return, which a hook cannot. Returning the **same element object** is what lets React skip a child without \`memo\`.

The part worth volunteering: it assumes your code follows the Rules of React. When it *detects* a violation it skips that component, without a build error by default; when it does not detect one, it compiles the component anyway, and code that mutates during render can then behave differently. So turn on the compiler lint rules in \`eslint-plugin-react-hooks\` first, and check DevTools' **"Memo ✨"** badge to see what was compiled.

→ Full explanation: [§16.1](/frontend/react-19-patterns#161-react-compiler-stable-since-10)

---

**Q18: How would you implement error boundaries?**

**Short answer:** a class component with \`static getDerivedStateFromError\` (switch to a fallback) and usually \`componentDidCatch\` (log the error), wrapped around the parts of the tree that can fail. There is still no hook for this, so most codebases use one small class or the \`react-error-boundary\` package.

\`\`\`tsx
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

// stand-in so this example runs on its own: throws during render once clicked
function RiskyComponent() {
  const [broken, setBroken] = useState(false);
  if (broken) throw new Error('Boom');
  return <button onClick={() => setBroken(true)}>Break it</button>;
}

// Usage
render(
  <ErrorBoundary fallback={<p>Something went wrong</p>}>
    <RiskyComponent />
  </ErrorBoundary>
);
\`\`\`

A boundary catches errors thrown while React renders, runs lifecycle methods or constructs components below it. It does **not** catch errors in event handlers, async code or server rendering, nor its own errors; Q56 explains why and how to route an async failure into one.

→ Full explanation: [§3.2](/frontend/react#32-class-components)

---

### Performance & Tooling

---

**Q19: What are the Core Web Vitals and which one is most affected by React-specific issues?**

**Short answer:** **LCP** (Largest Contentful Paint, loading), **INP** (Interaction to Next Paint, responsiveness; it replaced FID in March 2024) and **CLS** (Cumulative Layout Shift, visual stability). INP is the one React apps fail most often: long tasks from expensive re-renders, heavy event handlers and hydration block input.

LCP suffers from big bundles and late images; CLS from media without dimensions, late fonts and inserted content. Measure all three from real users with the \`web-vitals\` library, because a lab page-load test such as a default Lighthouse run has no real interactions and cannot report INP.

→ Full explanation: [§13.6](/frontend/react-performance#136-profiling-and-measuring-performance)

---

**Q20: How does React DevTools Profiler help you find performance issues?**

**Short answer:** it records the renders during an interaction and shows, per commit, which components rendered, how long each took (flamegraph and ranked views) and **why** each rendered: props, state, hooks, context, or the parent re-rendering. That tells you which renders are slow and which are unnecessary. It does not tell you which *line* is slow; for that, use the Chrome Performance panel on the same interaction.

→ Full explanation: [§13.6](/frontend/react-performance#136-profiling-and-measuring-performance)

---

**Q21: What is a bundle analyzer and what should you look for?**

**Short answer:** a treemap of the production bundle, each module sized by bytes (\`rollup-plugin-visualizer\` for Vite, \`webpack-bundle-analyzer\`, or \`source-map-explorer\` for any build). Look for duplicate copies of a library, a whole library imported for one helper (\`lodash\`, every icon, every \`moment\` locale), polyfills for browsers you no longer support, and code that should be in a lazy chunk sitting in the main one.

→ Full explanation: [§13.10](/frontend/react-performance#1310-bundle-analyzers)

---

**Q22: Webpack vs Vite — when do you pick which?**

**Short answer:** Vite for new projects: its dev server serves native ES modules without bundling, so it starts in under a second and hot-reloads per module. Webpack when you depend on what only it does well (Module Federation for micro-frontends, heavy custom loaders), or when a large existing Webpack setup makes migration risk outweigh the faster feedback loop.

Worth knowing: Vite 8 (March 2026) replaced Rollup, and esbuild in development, with one Rust bundler, Rolldown, so development and production now run through the same tool.

→ Full explanation: [§13.9](/frontend/react-performance#139-build-tools-webpack-vs-vite)

---

**Q23: How does tree shaking work and what breaks it?**

**Short answer:** the bundler removes exports nothing imports, which only works when it can *prove* that statically, so it depends on ES module \`import\`/\`export\`. It breaks with CommonJS (\`require\` is dynamic), default-importing a whole library (\`import _ from 'lodash'\`), a package without \`"sideEffects": false\` (the bundler must keep any file whose import might change global state), and a toolchain that converts ESM to CommonJS before the bundler sees it. Fix with named ESM imports (\`import { debounce } from 'lodash-es'\`) and an accurate \`sideEffects\` field.

→ Full explanation: [§13.11](/frontend/react-performance#1311-tree-shaking-and-code-splitting-at-build-time)

---

**Q24: You added \`useDeferredValue\` (or \`startTransition\`) to a slow search list, and typing still lags. Why?**

**Short answer:** neither hook makes work faster. They make **rendering** interruptible and low priority, so they only help when the slow part is a render React can pause and the urgent update skips. Four reasons it does nothing:

1. **The slow child is not memoised.** \`useDeferredValue\` first renders urgently with the *old* value, then in the background with the new one. Without \`memo\`, the slow child re-renders in the urgent pass anyway.
2. **The slow work is not in render.** Filtering 50,000 items in \`onChange\`, or inside the \`startTransition\` callback, runs synchronously and blocks the keystroke.
3. **One component does all the work.** React yields between components (about every 5 ms), never inside one, so a component that loops for 300 ms blocks for 300 ms. Split it into rows, \`useMemo\` the filter, or virtualise.
4. **The cost is not rendering.** The commit is synchronous, so inserting 10,000 DOM nodes blocks regardless; a request per keystroke needs debouncing (Q54), not a transition.

Total CPU work goes **up**, because the list renders for intermediate values too. What you gain is that the keystroke is never stuck behind it.

→ Full explanation: [§13.5](/frontend/react-performance#135-concurrent-features-usetransition-usedeferredvalue)

---

**Q25: How would you reduce a 2 MB initial JS bundle on a React app?**

**Short answer:** measure with a bundle analyzer first, then work in order of payoff:

1. **Split by route** with \`React.lazy\` and \`<Suspense>\`, then split heavy widgets (editors, charts, maps) so they load on use.
2. **Replace or trim heavy dependencies:** \`moment\` → \`date-fns\`/\`dayjs\`, \`lodash\` → named imports from \`lodash-es\`, per-icon imports.
3. **Make tree shaking work** (Q23) and **drop polyfills** your \`browserslist\` no longer needs.
4. **Cache well:** vendor code in its own long-lived chunk, Brotli compression on the server.
5. **Ship less JavaScript at all** with Server Components or static rendering for content that does not need to be interactive.

Judge the result by LCP and INP on a real device; bytes saved are only a proxy. Q85 covers diagnosing a sudden jump.

→ Full explanation: [§13.3](/frontend/react-performance#133-code-splitting-lazy-loading), [§13.11](/frontend/react-performance#1311-tree-shaking-and-code-splitting-at-build-time)

---

**Q26: How do you debug an unnecessary re-render that the Profiler flagged?**

**Short answer:** read the Profiler's "why did this render?" for that commit, then fix the cause it names:

| Reason shown | Usual cause | Fix |
|---|---|---|
| Props changed, but look the same | parent creates a new object, array or function each render | hoist it, \`useMemo\`/\`useCallback\` it, and \`memo\` the child |
| Context changed | the provider's \`value\` is a new object each render | memoise the value, or split the context |
| Hook changed | state really updated (often a new object with equal contents) | set state only when the value differs |
| Parent rendered | the component is not memoised | move state down, pass as \`children\`, or \`memo\` it |

With the React Compiler on, most of these are handled for you, but you still need the cause to debug what the compiler skipped.

→ Full explanation: [§13.7](/frontend/react-performance#137-common-re-render-causes-and-fixes)

---

**Q27: React Compiler 1.0 is stable. Do you still need \`useMemo\` and \`useCallback\`, and how would you roll it out on an existing codebase?**

**Short answer:** mostly no. The compiler memoises at a finer grain than you would by hand. Two cases still need you: when **reference identity is an external contract** (a third-party hook's dependency array, an imperative API that needs the same object every time), and when you deliberately want a coarser cache than the compiler would choose.

**The rollout is the real answer:**

1. **Lint first.** The compiler-powered rules ship in \`eslint-plugin-react-hooks\` 7.x and point at code that breaks the Rules of React.
2. **Fix the violations:** mutating props or state during render, side effects in render, conditional hooks. This matters because the compiler only skips the violations it *detects*; one it misses gets compiled, and mutating code can then change behaviour.
3. **Enable it** (per directory first, if the codebase is large) and check DevTools' "Memo ✨" badges and your tests.
4. **Don't bulk-delete existing \`useMemo\`/\`useCallback\`.** They are harmless; stop adding new ones and remove them while editing.

It does not replace \`useTransition\` (scheduling), virtualisation (DOM volume) or code splitting (payload).

→ Full explanation: [§16.1](/frontend/react-19-patterns#161-react-compiler-stable-since-10)

---

**Q28: What is \`<Activity />\` and when would you use it over conditional rendering or \`display: none\`?**

**Short answer:** \`<Activity mode="visible" | "hidden">\` (stable in React 19.2) hides UI while **keeping its state and tearing down its effects**, a combination neither alternative gives you:

| Approach | State | Effects |
|---|---|---|
| \`{cond && <Tab />}\` | destroyed | unmounted |
| \`display: none\` | preserved | **keep running** |
| \`<Activity mode="hidden">\` | **preserved** | **cleaned up** |

Use it for tabs, wizards and a list you return to from a detail view, and for pre-rendering the screen the user will probably open next at low priority. The catch: since hiding works by running effect cleanups, every effect inside needs a correct cleanup or hiding leaks.

→ Full explanation: [§16.6](/frontend/react-19-patterns#166-activity-hide-ui-without-destroying-it)

---

**Q29: What problem does \`useEffectEvent\` solve, and when should you not use it?**

**Short answer:** some logic inside an effect is **reactive** (a change should re-run the effect) and some only needs to *read* the latest value. Before React 19.2 the dependency array could not express that, so you either left the value out (a stale closure), put it in (the effect re-ran on an unrelated change), or mirrored it in a ref by hand. \`useEffectEvent\` returns a function that is stable, so it never goes in the dependency array, but always sees the latest props and state.

\`\`\`text
const onConnected = useEffectEvent(() => showToast('Connected!', theme));

useEffect(() => {
  const conn = createConnection(roomId);
  conn.on('connected', () => onConnected());   // reads the current theme
  conn.connect();
  return () => conn.disconnect();
}, [roomId]);   // changing the theme does not reconnect
\`\`\`

**When not to use it:** when the logic really is reactive (wrapping the connection itself means switching rooms never reconnects), and when you should not have an effect at all. It may only be called from inside effects, never during render or passed as a prop.

→ Full explanation: [§16.7](/frontend/react-19-patterns#167-useeffectevent-non-reactive-logic-inside-effects)

---

**Q30: What do React 19.2's \`prerender\` and \`resume\` APIs do, and what problem do they solve?**

**Short answer:** they are the primitives for Partial Pre-rendering: render the static part of a page ahead of time and fill in the dynamic part per request. Before them, one per-request value (a user's name in the header) made the whole route dynamic. \`prerender()\` with an abort signal stops at the dynamic Suspense boundaries and returns the static HTML **plus** a serialisable \`postponed\` state; \`resume()\` finishes the render per request from that state.

\`\`\`text
// Build time
const { prelude, postponed } = await prerender(<App />, { signal: controller.signal });

// Request time: continue exactly where it stopped
const stream = await resume(<App />, postponed);
\`\`\`

The payoff: the static shell comes from a CDN immediately, and the personalised parts stream in. Next.js's PPR is built on this.

→ Full explanation: [§16.8](/frontend/react-19-patterns#168-react-192s-rendering-and-ssr-changes)

---

### Rapid-Fire Fundamentals

These get asked constantly, usually as a quick screen before the harder questions.

---

**Q31: What is the difference between a React Component, a React Element, and a React Node?**

**Short answer:** a **component** is the blueprint, a function that returns UI. An **element** is the small immutable object a JSX expression produces, describing *what* to render. A **node** is anything React can render: elements, strings, numbers, arrays, \`null\`, booleans.

\`\`\`tsx
const Button = () => <button />;        // Component: a function
const el = <Button />;                  // Element:   { type: Button, key: null, props: {} }
const node = [el, 'text', null, 42];    // Node:      all of these are renderable
\`\`\`

The consequence that matters: \`<Button />\` is **not a call to \`Button()\`**. It creates an object that React calls *later*, and may never call, which is what makes bailing out possible. (In React 19 \`ref\` is an ordinary prop, so it sits in \`props\` too; reading \`element.ref\` warns.) In TypeScript, type \`children\` as \`React.ReactNode\`; \`ReactElement\` rejects a string child.

→ Full explanation: [§15.8](/frontend/react-19-patterns#158-fragments-and-node-vs-element-vs-component)

---

**Q32: Why should you never mutate state directly?**

**Short answer:** three reasons, and interviewers want more than "it won't re-render".

1. **Change detection.** React compares state, \`memo\` props and dependencies by reference. \`state.items.push(x)\` keeps the same reference, so React concludes nothing changed. \`setItems([...items, x])\` gives a new one.
2. **Concurrent rendering.** React may render, discard and render again. A mutation during render makes the output depend on how often the component ran, which is what StrictMode's double render exposes. The React Compiler also assumes you do not mutate: a mutation it fails to detect can make a compiled component show stale values.
3. **Debuggability.** Distinct state objects give you a history, which is what Redux DevTools' time travel and reducer tests rely on.

The tools: ES2023's \`toSorted\`, \`toReversed\`, \`toSpliced\` and \`with\` return copies (\`arr.sort()\` mutating state is a classic bug), and Immer, built into Redux Toolkit, turns mutable-looking code into an immutable update.

→ Full explanation: [§5.2](/frontend/react#52-state-update-rules)

---

**Q33: What are the pitfalls of the Context API, and how do you reduce Context re-renders?**

**Short answer:** context has **no partial subscription**. Every consumer re-renders when the value changes, whatever part of it the consumer reads. The fixes, in order:

1. **Memoise the provider value.** \`value={{ user, setUser }}\` is a new object every render, so every consumer re-renders every time; \`useMemo(() => ({ user, setUser }), [user])\` fixes it. This is the most common bug.
2. **Split contexts by how often they change.** A theme toggle should not re-render user consumers. The strongest split is **state from dispatch**: \`dispatch\` never changes, so components that only dispatch never re-render.
3. **Keep the provider in its own component and pass \`children\` through.** When the provider's state changes, \`children\` is the same element, so the subtree is skipped and only consumers re-render.
4. **Use a store for anything hot.** Zustand, Jotai or \`useSyncExternalStore\` give selector-level subscriptions. A ticker, a cursor position or keystrokes should never live in context.

The sentence to say: **context is a dependency-injection mechanism, not a state manager.**

→ Full explanation: [§11.2](/frontend/react#112-when-to-use-context-vs-state-management), [§13.7](/frontend/react-performance#137-common-re-render-causes-and-fixes)

---

**Q34: How do you reset a component's state?**

**Short answer:** change its \`key\`. A different key at the same position is a **different component** to React, so it unmounts the old instance (running its cleanups) and mounts a fresh one with initial state.

\`\`\`text
// A new userId gives a completely fresh form: no effect, no manual reset
<UserProfileForm key={userId} userId={userId} />
\`\`\`

This replaces the anti-pattern of an effect that resets every field when \`userId\` changes, which renders once with stale state, costs an extra render, and silently misses any field added later. The same identity rule (type, key, position) is why index keys hand state to the wrong row (Q4).

→ Full explanation: [§14.3](/frontend/react-performance#143-type-matching-when-components-survive-props-changes-vs-get-destroyed)

---

**Q35: What is hydration, and what causes a hydration mismatch?**

**Short answer:** **hydration** is React attaching to server-rendered HTML: instead of creating DOM nodes it walks the existing markup, builds its tree against it and wires up event handlers. A **mismatch** is when the client's first render differs from what the server sent; React reports an error and may re-render that part on the client, losing the benefit of SSR.

The causes are all one mistake, rendering something that differs between server and client: \`new Date()\`, \`Math.random()\`, \`localStorage\`, \`window.innerWidth\`, \`navigator.userAgent\`. A sneaky extra one is **invalid HTML nesting** (a \`<div>\` inside a \`<p>\`), which the browser's parser rewrites, so the DOM React finds is not what the server sent.

**The fixes:** read browser-only values in an effect; \`useSyncExternalStore\` with a server snapshot; \`useId\` for ids; \`suppressHydrationWarning\` for an unavoidable timestamp; and in 19.3, \`use(browser())\` for a browser-only component (Q83). Report mismatches in production with \`onRecoverableError\`.

→ Full explanation: [§13.12](/frontend/react-performance#1312-server-components-ssr-and-streaming)

---

**Q36: How do you test a React application?**

**Short answer:** in layers, with most of the weight on **component tests with Testing Library** that test what the user experiences: query by role and accessible name, interact with \`userEvent\`, and assert on visible output, not on state or hook calls.

A side benefit: \`getByRole(…, { name })\` fails when an element has no accessible name, so the recommended queries double as accessibility checks.

- **Runner:** Vitest in a Vite project, Jest otherwise. **Hooks:** \`renderHook\`.
- **Network:** MSW intercepts requests, so tests exercise your real data code instead of a mocked wrapper.
- **End to end:** Playwright for critical flows only. **Accessibility:** \`jest-axe\` per component, \`@axe-core/playwright\` on key pages.
- **Don't test:** implementation details, large snapshots (they get updated blindly), or library internals.
- **Server Components:** unit-test the data functions and cover the rendered page end to end.

→ Full explanation: the [Jest & React Testing Library guide](/frontend/jest-react-testing-library)

---

**Q37: What are the common pitfalls of data fetching in React?**

**Short answer:** the biggest one is hand-rolling it in \`useEffect\` at all. An effect fetches only after render (and after hydration), which creates waterfalls, and the minimum correct version is already long:

\`\`\`text
useEffect(() => {
  let ignore = false;
  const ctrl = new AbortController();
  fetch(url, { signal: ctrl.signal })
    .then(r => r.json())
    .then(d => { if (!ignore) setData(d); })
    .catch(e => { if (e.name !== 'AbortError' && !ignore) setError(e); });
  return () => { ignore = true; ctrl.abort(); };
}, [url]);
\`\`\`

And it still has no caching, deduplication or retry. The other usual pitfalls:

1. **Race conditions** when there is no cleanup: an older, slower response overwrites a newer one (Q70).
2. **Waterfalls from nesting:** a child fetches only after its parent's data arrives. Fetch in parallel at the route level.
3. **Missing states:** loading, empty, error and stale are four states; most hand-rolled code handles two (Q68).
4. **Server state stored as client state** in Redux or context, so you now own caching, invalidation and refetching. That is what TanStack Query and RTK Query are for.
5. **Duplicate requests** from several components mounting at once, and **derived data stored in state** that drifts from its source.

→ Full explanation: [§7.4](/frontend/react#74-when-not-to-use-useeffect), [§11.3](/frontend/react#113-server-state-vs-client-state-the-most-important-distinction)

---

**Q38: What changed with \`forwardRef\` in React 19?**

**Short answer:** \`ref\` is now an ordinary prop for function components, so \`forwardRef\` is no longer needed. It still works and is deprecated rather than removed, with a codemod available; stop using it in new code rather than churning old code.

\`\`\`tsx
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

// React 19 — \`ref\` is just a prop
function Input({ ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}

// Before React 19 — forwardRef was required to receive one
const LegacyInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input ref={ref} {...props} />
));
\`\`\`

Two related changes: a **ref callback can return a cleanup function**, replacing the "called with \`null\` on unmount" convention, and \`useImperativeHandle\` is unchanged (Q60).

→ Full explanation: [§12](/frontend/react#12-refs), [§16.9](/frontend/react-19-patterns#169-what-react-19-changed-removals-migrations-and-behaviour)

---

**Q39: When would you use \`useReducer\` instead of \`useState\`?**

**Short answer:** when the **transitions** matter more than the values. Signals: several values change together (a fetch's \`status\`, \`data\` and \`error\`); the next state depends on the previous one in non-trivial ways (a wizard, an undo stack); you want the update logic as a pure, testable function; or you want to pass \`dispatch\` down instead of many callbacks, since \`dispatch\` is stable and never breaks memoisation.

The strongest version models state as a **discriminated union**, such as \`{ status: 'loading' } | { status: 'success'; data } | { status: 'error'; error }\`, so impossible combinations cannot be written. That is a design win, not just ergonomics.

→ Full explanation: [§5.3](/frontend/react#53-usereducer-complex-state)

---

**Q40: When do you need \`useId\`?**

**Short answer:** whenever you need a **stable, unique, SSR-safe** id to connect elements: \`htmlFor\`/\`id\`, \`aria-describedby\`, \`aria-labelledby\`. A hard-coded id collides when the component renders twice on a page; a counter or \`Math.random()\` id differs between server and client and causes a hydration mismatch. \`useId\` derives the id from the component's position in the tree, so both sides agree.

Call it once per component and derive related ids by suffix (\`\${id}-error\`). It is **not** for list keys. The generated format has changed twice, from \`:r:\` to \`«r»\` in React 19.1 and to \`_r_\` in 19.2, which only matters if a snapshot test asserts on generated ids.

→ Full explanation: [§6.2](/frontend/react#62-built-in-hooks-reference)

---

**Q41: What does "re-rendering" actually mean, and what triggers it?**

**Short answer:** a re-render means React **calls your component function again**, diffs the result with the previous output and applies only the differences. **A re-render is not a DOM update**: most produce identical output and touch nothing, so they only matter when the render itself is expensive.

There are four triggers: the component's own state changed (to a value that is not \`Object.is\`-equal); its **parent re-rendered** (the one people underestimate: all children re-render by default, props changed or not); a context it reads changed; or an external store it subscribes to changed. Measure with the Profiler before fixing anything.

→ Full explanation: [§13.7](/frontend/react-performance#137-common-re-render-causes-and-fixes)

---

**Q42: How do you debug a React app?**

**Short answer:** narrow down which layer is wrong before picking a tool.

- **React DevTools:** the Components panel shows (and lets you edit) live props, state and hooks; the Profiler shows what rendered, for how long, and **why**.
- **React 19.2's Performance Tracks** in Chrome DevTools: Scheduler and Components tracks that separate "the render was slow" from "the render never got to run".
- **State bugs:** inspect in DevTools rather than logging in render, which runs twice under StrictMode.
- **Production-only bugs:** source maps, boundaries that report component stacks, \`onRecoverableError\` for hydration mismatches.

The suspects to check first: a stale closure, a wrong dependency array, a key collision handing state to the wrong element, mutated state, and an impure render exposed by StrictMode.

→ Full explanation: [§13.6](/frontend/react-performance#136-profiling-and-measuring-performance)

---

**Q43: You suspect a memory leak in a React app. How do you confirm it, find it, and fix it?**

**Short answer:** confirm it is a leak, find what retains the memory, fix the missing cleanup, and verify with the same measurement.

**1. Confirm.** In Chrome DevTools' **Memory** panel, take a heap snapshot, repeat the suspect flow (open and leave a route ten times), force garbage collection and take another. A leak is a baseline that keeps rising after GC; a sawtooth that returns to its floor is normal. The **Performance monitor**'s DOM node count is the quickest signal: a count that only climbs is a leak.

**2. Find it.** In the snapshot **Comparison** view, look for **Detached** DOM elements (removed from the page but still referenced). The **Retainers** panel shows the chain holding each one, and that chain names your bug.

**3. The React causes, in the order to check them:**

\`\`\`text
// 1. A missing effect cleanup: by far the most common
useEffect(() => {
  const id = setInterval(tick, 1000);
  window.addEventListener('resize', onResize);
  const sub = socket.subscribe(onMessage);
  const obs = new IntersectionObserver(cb); obs.observe(el);
  return () => {                     // every one of these needs undoing
    clearInterval(id);
    window.removeEventListener('resize', onResize);
    sub.unsubscribe();
    obs.disconnect();
  };
}, []);
\`\`\`

- \`removeEventListener\` needs the **same function reference**, so an inline-arrow listener can never be removed.
- **An array in state or a ref that only grows** (a live feed), or a **module-level cache with no eviction** (use a cap, or a \`WeakMap\` for object keys).
- **A DOM node kept in a ref or closure** that outlives the component.
- A query cache with a long \`gcTime\` is bounded, so not a leak; a query key built from every keystroke *is* one.

**4. Verify** with the same snapshot cycle and a flat delta. StrictMode's double mount in development surfaces missing cleanups early.

---

**Q44: How do components communicate in React? Walk through the options.**

**Short answer:** five mechanisms, and the skill is picking the smallest one that fits. [§5.4](/frontend/react#54-component-communication) walks through each with code; this is the version to say out loud.

- **Parent → child: props.** The default.
- **Child → parent: a callback prop.** The child reports an event; the parent decides what it means.
- **Sibling ↔ sibling: lift the state** to the *closest* common ancestor. Higher than needed re-renders more of the tree.
- **Distant descendant: context**, for real prop drilling only, with a memoised \`value\`.
- **Imperative action: a ref**, for actions rather than data (focus, play). Expose a narrow API with \`useImperativeHandle\`.

When unrelated branches share state, use a store, not more lifting: TanStack Query for server state, Zustand or Redux for client state. One detail worth volunteering: when a child's input feeds the parent, keep the in-progress value in the child and notify the parent on submit or blur, or every keystroke re-renders the parent's subtree.

---

**Q45: What did React 19 remove, and how would you approach upgrading a large codebase to it?**

**Short answer:** mostly long-deprecated legacy: \`findDOMNode\`, string refs, legacy context, \`propTypes\` and \`defaultProps\` on function components, \`ReactDOM.render\`/\`hydrate\`/\`unmountComponentAtNode\` (use \`createRoot\`/\`hydrateRoot\`), and \`react-test-utils\`. Two fail quietly: **\`propTypes\` is ignored without a warning**, so validation you thought you had stopped; and \`defaultProps\` still works on classes. No lifecycle methods were removed.

**The upgrade:** move to **18.3** first (18.2 plus deprecation warnings) and fix every warning while shipping incrementally. Run the official codemods (\`npx codemod@latest react/19/migration-recipe\`). Then the manual work: replace \`propTypes\` with TypeScript, remove \`findDOMNode\`, and fix ref callbacks with an implicit return, because a returned value is now treated as a cleanup (\`ref={el => (this.input = el)}\` needs a block body). Adopt the new APIs only once that is green, so a regression can be traced to one change.

→ Full explanation: [§16.9](/frontend/react-19-patterns#169-what-react-19-changed-removals-migrations-and-behaviour)

---

**Q46: What is the \`useRef\` hook and when should it be used?**

**Short answer:** \`useRef\` returns a mutable \`{ current }\` object that is the **same object for the component's whole life**, and changing \`.current\` **does not re-render**. That gives it two uses: a handle to a DOM node (\`<input ref={inputRef} />\`, then \`inputRef.current.focus()\`), and an instance variable the UI does not display (a timer id, an \`AbortController\`, a "has run" flag, the previous value).

**When not to use it:** if the value is shown on screen it belongs in state, because a ref change does not repaint. Incrementing \`ref.current\` in a click handler and rendering it shows a number that only jumps when something else re-renders. And don't read or write \`.current\` during render; do it in effects and handlers.

→ Full explanation: [§12](/frontend/react#12-refs)

---

**Q47: What are the rules of React hooks, and why do they exist?**

**Short answer:** call hooks **only at the top level** (never in a condition, loop, nested function or after an early \`return\`), and **only from components or other hooks**. The reason: React matches hook state by **call order**, not by name. It keeps a list of hook slots per component and walks it in order, so a conditional hook shifts every slot after it:

\`\`\`text
// ✗ Broken on purpose, tagged text so there is no Try it button.
function Profile({ showName }) {
  const [id, setId] = useState(1);           // slot 1
  if (showName) {
    const [name, setName] = useState('');    // slot 2, only sometimes!
  }
  const [age, setAge] = useState(0);         // slot 2 or 3, depending
}
\`\`\`

React throws "Rendered fewer hooks than expected" when the count changes; when it doesn't, you silently read the wrong slot. To branch, call the hook unconditionally and put the condition inside it. Enforce both rules with \`eslint-plugin-react-hooks\` as errors.

→ Full explanation: [§6.1](/frontend/react#61-rules-of-hooks)

---

**Q48: What are React Fragments used for?**

**Short answer:** grouping children without adding a DOM node. You need one when a component returns several siblings, when a wrapper \`<div>\` would break layout (a grid or flex container lays out its *direct* children, and a Fragment makes \`display: contents\` workarounds on a wrapper unnecessary), and when a wrapper would be invalid HTML (a \`<div>\` between \`<tr>\` and \`<td>\`). The shorthand \`<>\` cannot take props, so a fragment in a list needs the long form with a key:

\`\`\`tsx
{rows.map(row => (
  <React.Fragment key={row.id}>
    <dt>{row.term}</dt>
    <dd>{row.definition}</dd>
  </React.Fragment>
))}
\`\`\`

→ Full explanation: [§15.8](/frontend/react-19-patterns#158-fragments-and-node-vs-element-vs-component)

---

**Q49: What are custom hooks? Show an example of when to use one.**

**Short answer:** a function whose name starts with \`use\` and that calls other hooks. The name is the only special thing: it tells the linter to apply the rules of hooks. Custom hooks share **stateful logic, not state**: two components calling \`useMediaQuery()\` each get their own state.

Extract one when the same \`useState\` + \`useEffect\` + cleanup shape appears in several components, or when it hides what a component renders. The classic example is subscribing to \`window.matchMedia\`: the setup is easy, the cleanup is what people forget, and a \`useMediaQuery(query)\` hook writes it once so every consumer gets it free. Don't extract a hook used in one place that does not make that place clearer.

→ Full explanation, with \`useMediaQuery\`, \`useDebounce\`, \`useFetch\` and more written out: [§6.3](/frontend/react#63-custom-hooks)

---

**Q50: How would you implement a component that subscribes to an external data source and cleans up correctly?**

**Short answer:** for an **event stream** you accumulate into state (socket messages), subscribe in \`useEffect\`, unsubscribe in its cleanup, and list exactly what the subscription depends on (\`[roomId]\`), so a change re-subscribes instead of leaking the old one; reset stale data when it changes. For a **value you read** from outside React (a store, \`navigator.onLine\`, \`matchMedia\`), use \`useSyncExternalStore\`:

\`\`\`tsx
function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    (callback) => {                                   // subscribe
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine,                           // client snapshot
    () => true,                                       // server snapshot (SSR)
  );
}
\`\`\`

With an effect, the value can change between render and the effect running, and under concurrent rendering two components can show different values in one commit (**tearing**). \`useSyncExternalStore\` guarantees one consistent value per render. The third argument is the server snapshot: without it, **server rendering throws** ("Missing getServerSnapshot").

→ Full explanation: [§6.2](/frontend/react#62-built-in-hooks-reference)

---

**Q51: What is the difference between client-side and server-side routing?**

**Short answer:** with **server-side routing** (the browser's default), a link click requests a new HTML document and the page is rebuilt. With **client-side routing**, the router intercepts the click, changes the URL with \`history.pushState\`, and swaps components in the existing page, so JavaScript state, open connections and scroll position survive.

| Aspect | Client-side | Server-side |
|---|---|---|
| Navigation cost | a data fetch at most | a full document round trip |
| First paint | slower: the JavaScript must load first | faster: the HTML arrives ready |
| State across navigation | preserved | lost |
| SEO without JavaScript | needs SSR or pre-rendering | works |

A client router must reimplement scroll restoration, the back button, and **focus and announcements**: nothing tells a screen reader the page changed unless you move focus and announce it. Modern frameworks blur the line: server-render the first page, navigate on the client after.

→ Full explanation: the [React Router guide](/frontend/react-router)

---

**Q52: What is the React event system, and how does it differ from native DOM events?**

**Short answer:** React attaches **one listener per event type at the root container** (since React 17; before that, \`document\`) and dispatches to your handlers by walking its own tree. Handlers receive a \`SyntheticEvent\`, a cross-browser wrapper around the native event. The practical differences:

1. **Events bubble through the React tree**, so a click inside a portal reaches the portal's React parent (Q76).
2. **\`e.stopPropagation()\` stops React's propagation only.** By the time your handler runs, the native event has already bubbled to the root, so native listeners on elements between the target and the root have *already fired*. \`e.nativeEvent.stopPropagation()\` only stops native listeners above the root, such as \`document\` and \`window\`.
3. **\`onChange\` fires on every keystroke** (it is really the native \`input\` event; native \`change\` fires on blur).
4. **Event pooling is gone** since React 17: reading \`e.target\` later works, and \`e.persist()\` does nothing. A common stale-knowledge trap.

Use a native listener in an effect, with cleanup, for \`window\`/\`document\`, for \`{ passive: true }\` scroll listeners, and for events that do not bubble.

→ Full explanation: [§15.11](/frontend/react-19-patterns#1511-events-delegation-and-the-synthetic-system), [§8](/frontend/react#8-event-handling)

---

**Q53: How do you localize a React application?**

**Short answer:** with a library (\`react-i18next\`, \`react-intl\`, or \`next-intl\` on Next.js), not by hand, because the hard parts are not string lookup:

- **Plurals and word order:** use ICU messages (\`{count, plural, one {# item} other {# items}}\`), never \`"You have " + n + " items"\`. Polish has four plural forms; Arabic has six.
- **Dates, numbers and currency:** \`Intl.NumberFormat\`, \`Intl.DateTimeFormat\`, \`Intl.RelativeTimeFormat\`, never manual formatting.
- **Right-to-left:** set \`dir="rtl"\` and use logical CSS properties (\`margin-inline-start\`, not \`margin-left\`).
- **Locale in the URL** (\`/de/products\`), so pages are shareable and indexable, with only that locale's translations loaded.
- **Text expansion:** German runs about a third longer than English; test with a pseudo-locale.

**The React-specific pitfall:** never inject translated HTML with \`dangerouslySetInnerHTML\` to put a link in a sentence, which turns translation files into an XSS vector. Use \`<Trans>\` or \`<FormattedMessage>\` with component placeholders.

→ Full explanation: [§15.10](/frontend/react-19-patterns#1510-internationalisation-i18n)

---

**Q54: Implement a custom hook that debounces an input value.**

**Short answer:** debounce the **value**, not the input. The field stays controlled by immediate state so typing never lags; only the value that triggers expensive work waits for a pause.

\`\`\`tsx
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    // THIS is the debounce: every new value cancels the pending timer, so the
    // state only ever settles after \`delay\` of quiet.
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

function Search() {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 300);
  const [searches, setSearches] = useState(0);

  useEffect(() => {
    if (debounced) setSearches(n => n + 1);   // stands in for the request
  }, [debounced]);

  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Type fast…" />
      <p>typed: <b>{query}</b> — searched for: <b>{debounced}</b></p>
      <p>searches fired: <b>{searches}</b></p>
    </div>
  );
}

render(<Search />);
\`\`\`

Type quickly and the two lines diverge; stop and they converge. The counter rises per *pause*, not per keystroke.

**The cleanup is the whole mechanism:** each new \`value\` clears the previous timer before setting a new one, so only the last keystroke of a burst fires. Follow-ups that usually come next:

- **Why \`[value, delay]\`, not \`[]\`?** With \`[]\` the effect keeps the first value forever (a stale closure).
- **Debounce vs throttle:** debounce fires once after quiet (search suggestions); throttle fires at a capped rate throughout (scroll, resize).
- **What it does not solve:** out-of-order responses. A slow response for \`"re"\` can still overwrite one for \`"react"\`, so the fetching effect needs an \`AbortController\` (Q70).
- **Debouncing a callback instead** (a \`useDebouncedCallback\` hook) needs the function in a ref, or a new function identity each render resets the timer. Debouncing a value avoids that.

→ Full explanation: [§6.3](/frontend/react#63-custom-hooks)

---

**Q55: Explain CSR, SSR and SSG — when would you use each?**

**Short answer:** they differ in **when the HTML is generated**, and everything else follows.

| Strategy | HTML built | Cost per request | First paint | Data freshness |
|---|---|---|---|---|
| **CSR** | in the browser, after JS loads | none (a static file) | slowest | always live |
| **SSR** | on the server, per request | highest | fast, personalised | live |
| **SSG** | at build time | none (served from a CDN) | fastest | as old as the last build |
| **ISR** | at build, then regenerated in the background | amortised | fastest | stale up to the revalidate window |

**CSR** fits apps behind a login, where SEO is irrelevant and long sessions amortise the slow first load. **SSR** fits pages that are public *and* personalised or fast-changing (live stock, search results), at the cost of server work and a TTFB that includes data fetching. **SSG** is the default for marketing pages, docs and blogs, and **ISR** covers content that changes hourly. Frameworks mix them per route.

Worth volunteering: SSR alone doesn't make an app fast, since the JavaScript still ships and hydrates (Q65), and Server Components are a different axis (Q13).

→ Full explanation: [§13.12](/frontend/react-performance#1312-server-components-ssr-and-streaming)

---

**Q56: Why doesn't an error boundary catch an async failure?**

**Short answer:** a boundary catches errors thrown **while React is rendering** (a component, a lifecycle method, a constructor). When a \`fetch\` rejects, the render that started it committed long ago and React is not on the stack. It is ordinary JavaScript: a \`try\`/\`catch\` only catches what is thrown synchronously inside it.

| Not caught | Why |
|---|---|
| Async callbacks (\`fetch\`, \`setTimeout\`, promises) | thrown after the render has committed |
| Event handlers | run in response to the browser, outside rendering |
| Server-side rendering | boundaries do not run on the server; streaming SSR sends the nearest Suspense fallback and the client retries the render |
| Errors in the boundary itself | it cannot catch its own failure; the boundary above does |

**The fix:** put the failure into state and throw it **during render**, where the boundary can see it:

\`\`\`jsx
function Safe() {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/thing')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e); });      // capture it
    return () => { cancelled = true; };
  }, []);

  if (error) throw error;        // ✓ thrown during render — the boundary sees it
  if (!data) return <Spinner />;
  return <Result data={data} />;
}

// stand-ins so this example runs on its own (the playground has no /api/thing,
// so the request fails and the boundary shows it)
const Spinner = () => <p>Loading…</p>;
const Result = ({ data }) => <pre>{JSON.stringify(data)}</pre>;
class Boundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    return this.state.error ? <p role="alert">Caught by the boundary: {this.state.error.message}</p> : this.props.children;
  }
}

render(<Boundary><Safe /></Boundary>);
\`\`\`

That \`if (error) throw error\` line is what TanStack Query's \`throwOnError\` and React Router's \`errorElement\` do for you. An error that escapes React entirely (an unhandled rejection, a throw inside \`setTimeout\`) needs window-level \`error\` and \`unhandledrejection\` listeners; this site's playground installs both.

---

**Q57: How would you implement a reorderable drag-and-drop list?**

**Short answer:** the state is the list, the id of the item being dragged, and (for a hover indicator) the id it is over. Ids, not coordinates: once you track pixels you are reimplementing the browser.

\`\`\`jsx
function ReorderableList() {
  const [items, setItems] = useState([
    { id: 'a', label: 'Design' },
    { id: 'b', label: 'Build' },
    { id: 'c', label: 'Ship' },
  ]);
  const [dragId, setDragId] = useState(null);

  const move = (fromId, toId) => {
    if (fromId === toId) return;
    setItems(prev => {
      const next = [...prev];
      const from = next.findIndex(i => i.id === fromId);
      const to = next.findIndex(i => i.id === toId);
      next.splice(to, 0, next.splice(from, 1)[0]);   // remove, then re-insert
      return next;
    });
  };

  return (
    <ul>
      {items.map(item => (
        <li
          key={item.id}
          draggable
          onDragStart={() => setDragId(item.id)}
          onDragOver={e => e.preventDefault()}
          onDrop={() => { move(dragId, item.id); setDragId(null); }}
          style={{ opacity: dragId === item.id ? 0.4 : 1 }}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}

render(<ReorderableList />);
\`\`\`

**Three things decide whether this answer lands:**

- **\`e.preventDefault()\` in \`onDragOver\` is mandatory.** HTML drag and drop rejects drops by default, so without it \`onDrop\` never fires. This is the most common reason a hand-rolled version "does nothing".
- **Key by id and reorder immutably.** Reordering is exactly when an index key attaches the wrong DOM node, input value or focus to an item.
- **Per-move updates belong in a ref.** \`dragId\` changes twice per drag, so state is fine, but anything updated on every \`dragover\` or \`pointermove\` should go in a ref and be committed on drop.

**Accessibility is the differentiator:** native drag and drop is mouse-only. Add a keyboard path (<kbd>Space</kbd> picks up, arrows move, <kbd>Space</kbd> drops, <kbd>Esc</kbd> cancels) and an \`aria-live\` announcement ("Build, moved to position 1 of 3"). That, plus touch support, which HTML5 drag and drop lacks, is the argument for **dnd-kit** in production (\`react-beautiful-dnd\` is no longer maintained).

---

**Q58: What is the difference between \`createElement\` and \`cloneElement\`?**

**Short answer:** \`React.createElement(type, props, ...children)\` **makes** a new element. It is what the classic JSX transform produced; the default (automatic) transform calls \`jsx()\` instead, but the result is the same kind of element (Q3). \`React.cloneElement(element, props, ...children)\` copies an element that **already exists**, shallow-merging new props over the old ones.

\`\`\`text
const original = <button className="btn" onClick={handleA}>Save</button>;
const copy = React.cloneElement(original, { onClick: handleB, disabled: true });
// same type and children, className kept, onClick REPLACED, disabled added
\`\`\`

**Details that get probed:** later props win, so a new \`onClick\` *replaces* the old one (compose them yourself to keep both); passing children replaces them entirely; and you can supply a new \`key\` or \`ref\`.

**Where it is used:** libraries, typically a compound \`<Tabs>\` handing each \`<Tab>\` an \`isActive\` prop. In application code it is discouraged, because it silently couples the parent to the child's prop names with no type checking. Context or a render prop makes the contract explicit (Q80).

---

**Q59: What are higher-order components, and would you still write one?**

**Short answer:** an HOC is a **function that takes a component and returns a new one** (\`const ProfileWithLogging = withLogging(Profile)\`). It was React's way to share logic before hooks. For sharing stateful logic, a **custom hook is better** and is the answer interviewers want: no wrapper layers in DevTools, no props silently colliding when two HOCs inject the same name, and \`const user = useUser()\` shows where a value comes from.

HOCs still fit when you need to change **what renders** or whether it renders, which a hook cannot: an error boundary wrapper, a route guard that renders a redirect, \`React.memo\` itself. If you write one: forward all props, set a \`displayName\`, and **create it outside render**, or each render makes a new component type and remounts the subtree.

→ Full explanation: [§15.4](/frontend/react-19-patterns#154-higher-order-components-hocs)

---

**Q60: How does \`useImperativeHandle\` work, and when is it the right call?**

**Short answer:** it decides **what a parent gets when it reads a ref to your component**. Instead of the raw DOM node, you hand back a small object of methods:

\`\`\`jsx
function TextField({ ref }) {              // React 19: ref is a normal prop
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ''; },
  }), []);
  return <input ref={inputRef} />;
}

// Parent
function Form() {
  const field = useRef(null);
  return (
    <>
      <TextField ref={field} />
      <button onClick={() => field.current.focus()}>Focus</button>
      <button onClick={() => field.current.clear()}>Clear</button>
    </>
  );                        // only focus and clear exist — not the raw node
}

render(<Form />);
\`\`\`

**The point is narrowing:** exposing the DOM node makes every internal detail part of your public API, while \`{ focus, clear }\` is a contract you can keep. Its dependency array works like \`useMemo\`'s.

**Right** for imperative *verbs* with no declarative form: focus, select text, play or seek media, scroll into view, open a \`<dialog>\`. **Wrong** for pushing *data* into a child or forcing it to re-render; a ref that exposes \`setValue\` is a controlled component in disguise, so use props.

→ Full explanation: [§6.2](/frontend/react#62-built-in-hooks-reference)

---

**Q61: A \`useEffect\` is causing an infinite re-render loop. How do you diagnose and fix it?**

**Short answer:** the loop is always the same sentence: **the effect sets state, the state change re-renders, and the re-render produces a dependency React considers changed, so the effect runs again.** React compares dependencies with \`Object.is\`, and an object, array or function created during render is never equal to last render's.

The usual shapes (tagged text, because pressing Try it on a real infinite render would lock up the tab):

\`\`\`text
// 1. A literal in the dependency array: { id } is new on every render
useEffect(() => { fetchUser({ id }).then(setUser); }, [{ id }]);

// 2. Writing the value the effect watches
useEffect(() => { setCount(count + 1); }, [count]);

// 3. An unstable prop from the parent
<Child options={{ sort: 'asc' }} onDone={() => refresh()} />
useEffect(() => { load(options); }, [options, onDone]);   // in Child
\`\`\`

A fourth shape is not an effect at all: \`setState\` called directly in the component body throws "Too many re-renders" at once.

#### Fixing it, in the order you should try

1. **Ask whether the effect should exist.** Most loops are derived state in disguise: compute the value during render instead.
2. **Depend on primitives:** \`[user.id]\`, not \`[user]\`.
3. **Stabilise the value where it is created** (\`useMemo\`/\`useCallback\` in the parent); memoising inside the child is too late.
4. **Use a functional update:** \`setCount(c => c + 1)\` no longer reads \`count\`.
5. **Use a ref** for a value you need but do not render.

#### The fix that is not a fix

Emptying the dependency array stops the loop by freezing every value the effect captured, trading a loud bug for a silent stale one. \`useEffectEvent\` (Q29) is the honest version.

→ Full explanation: [§7.3](/frontend/react#73-common-pitfalls), [§7.4](/frontend/react#74-when-not-to-use-useeffect)

---

**Q62: Map the class lifecycle methods to their hook equivalents. Where does the mapping break down?**

**Short answer:** lifecycle methods think in *moments* (mount, update, unmount); effects think in *synchronisation* (what must match this state, and what to undo when it stops matching). So one effect usually replaces three methods, and one method usually splits into several effects.

| Class | Hook equivalent | Note |
|---|---|---|
| \`constructor\` (state init) | \`useState(initial)\` or \`useState(() => expensive())\` | the lazy form runs once |
| \`componentDidMount\` | \`useEffect(fn, [])\` | not the same timing: see below |
| \`componentDidUpdate\` | \`useEffect(fn, [deps])\` | no \`prevProps\` argument |
| \`componentWillUnmount\` | the cleanup returned from \`useEffect\` | it also runs before every re-run |
| \`getDerivedStateFromProps\` | derive during render, or reset with \`key\` | rarely needs a hook |
| \`shouldComponentUpdate\` | \`React.memo\` | a wrapper, not a hook |
| \`getSnapshotBeforeUpdate\` | \`useLayoutEffect\` | reads the DOM before paint |
| \`getDerivedStateFromError\` / \`componentDidCatch\` | **no hook exists** | error boundaries are still classes |

#### The four places it breaks down

1. **Timing.** \`componentDidMount\` runs synchronously in the commit, before the browser paints. \`useEffect\` usually runs after paint, so measuring the DOM and then adjusting it flickers for a frame; \`useLayoutEffect\` is the true equivalent for that case.
2. **No \`prevProps\`.** The dependency array *is* the comparison; when you really need the previous value, keep it in a ref.
3. **Error boundaries** still need a class (or \`react-error-boundary\`).
4. **Splitting and merging.** A class crams a subscription, analytics and a title update into one \`componentDidMount\`; hooks give each its own effect and cleanup. The reverse is the bigger win: one subscription needs \`componentDidMount\`, a \`componentDidUpdate\` that compares \`prevProps.roomId\` and reconnects (the part people forget), and \`componentWillUnmount\`. As a hook it is one effect, whose cleanup is both the unmount *and* the first half of the update:

\`\`\`text
useEffect(() => {
  const conn = connect(roomId);
  return () => conn.close();   // runs before every re-run AND on unmount
}, [roomId]);
\`\`\`

**What to volunteer:** the old \`componentWillMount\`, \`componentWillReceiveProps\` and \`componentWillUpdate\` have no hook equivalent. They are deprecated, not removed: renamed to \`UNSAFE_componentWillMount\`, \`UNSAFE_componentWillReceiveProps\` and \`UNSAFE_componentWillUpdate\`, because under concurrent rendering they can run more than once per commit. Both spellings still run in React 19, and the unprefixed names log a "has been renamed" warning in development, StrictMode or not. Also, StrictMode runs effects twice on mount in development to expose missing cleanups, which \`componentDidMount\` never did, so a migration can appear to *introduce* a bug it is really revealing.

→ Full explanation: [§7.2](/frontend/react#72-lifecycle-mapping-class-hooks), [§3.2](/frontend/react#32-class-components)

---

**Q63: What are React Hooks, and what is each one used for?**

**Short answer:** hooks are functions that let a **function component** use React features that once needed a class: state, effects, context and refs. React stores each hook's data on the component's fiber **by call order**, which is why the rules of hooks exist (Q47). They arrived in React 16.8 to fix three class problems: logic could only be shared through HOCs and render props, related code was split across lifecycle methods, and \`this\` binding caused bugs.

React 19 added \`use\`, \`useActionState\`, \`useFormStatus\` and \`useOptimistic\`, and 19.2 added \`useEffectEvent\`. **What to volunteer:** \`useEffect\` is the most misused. Most loops and stale-data bugs are an effect doing work that belongs in render (a derived value) or in an event handler. Repeated hook combinations become a custom hook (Q49).

→ Full explanation: [§6.2](/frontend/react#62-built-in-hooks-reference), [§16](/frontend/react-19-patterns#16-react-19-features)

---

**Q64: Memoization was added to improve performance, but the app became slower and used more memory. How is that possible?**

**Short answer:** memoisation is a trade. You **pay on every render** (store the inputs, compare them, keep the result) to **sometimes skip work**. It only wins when the cache gets hits and the skipped work costs more than the checking. Each usual failure breaks one of those:

1. **The memo never hits.** One inline object, array or function prop (\`style={{…}}\`, \`onClick={() => …}\`) is new every render, so \`React.memo\`'s comparison always fails and you pay for the render *and* the comparison. JSX passed as \`children\` is new every render too.
2. **The dependencies change every render**, so \`useMemo\` recomputes every time and adds a closure, an array and a comparison.
3. **The work was cheap.** Memoising \`a + b\` or a small \`filter\` costs more than recomputing it.
4. **Caches keep things alive.** Every \`memo\`/\`useMemo\` keeps its last inputs and output. A hand-written \`memoize\` helper is worse, because it caches every input forever:

\`\`\`js
function memoize(fn) {
  const cache = new Map();
  let hits = 0;
  const memoized = (key) => {
    if (cache.has(key)) { hits++; return cache.get(key); }
    const value = fn(key);
    cache.set(key, value);
    return value;
  };
  memoized.stats = () => ({ entries: cache.size, hits });
  return memoized;
}

const formatTime = memoize(ts => new Date(ts).toISOString());

const base = Date.UTC(2026, 0, 1);
for (let i = 0; i < 100000; i++) formatTime(base + i);   // every key is new

console.log(formatTime.stats());   // { entries: 100000, hits: 0 }
\`\`\`

Every timestamp is unique, so the cache holds 100,000 entries with **zero hits**: pure memory growth plus a \`Map\` lookup per call.

**How to find it:** profile the same interaction with and without the memo, with "Record why each component rendered" on to find the unstable prop; for memory, compare two heap snapshots and look for a growing \`Map\`. **What to do instead:** remove memoisation the Profiler cannot justify, stabilise props so the remaining \`memo\`s hit, bound any cache you write (an LRU), and let the React Compiler (Q27) handle the rest.

→ Full explanation: [§13.2](/frontend/react-performance#132-usememo-and-usecallback)

---

**Q65: What are SSR and CSR, and how does each one affect SEO and performance?**

**Short answer:** with **CSR** the server sends an almost empty page plus JavaScript, and content appears after the JavaScript runs and fetches data. With **SSR** the server sends HTML that already holds the content, and JavaScript then **hydrates** it. Q55 covers SSG and ISR; this answer is about SEO and performance.

**SEO: what does a crawler receive?**

| Aspect | CSR | SSR |
|---|---|---|
| First HTML response | \`<div id="root"></div>\` plus script tags | the full content, headings, links and meta tags |
| Google | runs JavaScript, but **queues the page for rendering**, which delays indexing; whatever fails or times out is not indexed | indexes the HTML directly |
| Other search engines | JavaScript support varies and is less reliable | fine |
| **Link previews** (Slack, LinkedIn, WhatsApp, X) | **generic**: these bots run no JavaScript, so never see per-page \`og:\` tags | correct per page |

The link-preview row is the one people forget, and often the real reason a team needs server rendering. SEO also needs a real \`<title>\` and description per URL, real \`<a href>\` links, correct status codes (a missing page returns **404**, not a 200 "not found" screen) and a sitemap.

**Performance: which metrics each one helps and hurts.**

| Aspect | CSR | SSR |
|---|---|---|
| **TTFB** (time to first byte) | fast: a static file from a CDN | slower: the server renders, and often fetches data, first |
| **FCP / LCP** (when content appears) | late: download, parse and run the JS, then fetch data, then render | early: the content is in the first response |
| **Interactivity** (INP, TBT) | interactive once it appears | can **look ready before it is**: clicks do nothing until hydration finishes, which is heavy main-thread work |
| Later navigations | fast | fast too, since SSR frameworks navigate on the client |
| Server cost | a static CDN, very cheap | a server per request, needing scaling and caching |

So **SSR moves the cost, it does not remove it**: content appears sooner, but the same JavaScript still downloads and hydrates, so SSR can give a better LCP and a *worse* INP on a slow phone. Streaming SSR and Server Components exist to cut that hydration cost.

**How to choose:** public pages that must be found or shared are server-rendered, or generated at build time (SSG: the SEO of SSR with CDN-speed TTFB). Pages behind a login can be CSR. Most products mix both per route.

**A real example: this app.** PrepHub is client-rendered on GitHub Pages, which has no server. Every URL gets a copy of the same empty HTML shell, so a link-preview bot sees the same page for every guide; pre-rendering each route at build time (SSG) would fix that.

---

### Real-World API & Data Scenarios

Scenario questions that describe a situation rather than name an API. Most are about server data: how it reaches the screen, what the user sees while it travels, and what happens when it does not arrive.

**Q66: What is \`React.memo\`, and when should you use it?**

**Short answer:** \`React.memo\` wraps a component so that React **skips re-rendering it when its props are the same as last time**. Use it for a component that is expensive to render *and* often re-rendered by its parent with unchanged props.

"The same" means each prop is compared with \`Object.is\` (a *shallow* comparison): strings and numbers by value, objects, arrays and functions by **reference**, so one created during the parent's render is new every time.

\`\`\`tsx
function Plain({ label }) {
  console.log('Plain renders');
  return <p>{label}</p>;
}

const Memoised = React.memo(function Memoised({ label }) {
  console.log('Memoised renders');
  return <p>{label}</p>;
});

const MemoisedWithObject = React.memo(function MemoisedWithObject({ style }) {
  console.log('MemoisedWithObject renders');
  return <p style={style}>styled</p>;
});

function Parent() {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (count < 2) setCount(count + 1);       // re-render the parent twice more
  }, [count]);
  return (
    <div>
      <Plain label="hi" />
      <Memoised label="hi" />
      <MemoisedWithObject style={{ color: 'tomato' }} />
    </div>
  );
}

render(<Parent />);
\`\`\`

\`\`\`text
Plain renders
Memoised renders
MemoisedWithObject renders
Plain renders
MemoisedWithObject renders
Plain renders
MemoisedWithObject renders
\`\`\`

The parent rendered three times. \`Plain\` followed it every time, \`Memoised\` rendered once because \`"hi"\` equals \`"hi"\`, and \`MemoisedWithObject\` gained nothing, because \`{ color: 'tomato' }\` is a new object every render (hoist it or \`useMemo\` it).

**Use it when** a list row, chart or large form section is slow and its parent re-renders for unrelated reasons. **Skip it when** the component is cheap, its props change on nearly every render anyway, or moving state down fixes the problem (Q11). The React Compiler adds this memoisation for you.

→ Full explanation: [§13.1](/frontend/react-performance#131-reactmemo)

---

**Q67: Two components need to share the same data. How would you design it?**

**Short answer:** move the data to the **closest parent they both have** and pass it down as props ("lifting state up"). Reach for context or a store only when that parent is far away or many components need it. And if the data comes from a server, let a query cache share it.

\`\`\`tsx
function SearchBox({ query, onQueryChange }) {
  return <input value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Search" />;
}

function ResultCount({ query }) {
  const fruits = ['apple', 'banana', 'cherry', 'grape'];
  const count = fruits.filter((f) => f.includes(query.toLowerCase())).length;
  return <p>{count} matching fruits</p>;
}

// The shared value lives in the nearest common parent.
function Page() {
  const [query, setQuery] = React.useState('');
  return (
    <div>
      <SearchBox query={query} onQueryChange={setQuery} />
      <ResultCount query={query} />
    </div>
  );
}

render(<Page />);
\`\`\`

The parent owns \`query\`, gives the value to both, and gives the setter to the one that changes it, so there is one place to look when it is wrong.

**When lifting is not enough, pick by what the data is:**

| Situation | Use |
|---|---|
| Siblings, or a few levels apart | lift state to the common parent |
| Many components at different depths, value changes rarely (user, theme, locale) | context |
| Many components, value changes often, or complex update logic | a store: Zustand, Redux Toolkit |
| The data comes from an API | a query cache (TanStack Query, RTK Query): both components ask for the same key and share one request |

The last row is the one most often missed: if two components show the same profile, both call \`useQuery({ queryKey: ['user', id] })\`, the cache makes one request, and both update together.

→ Full explanation: [§5.4](/frontend/react#54-component-communication)

---

**Q68: How do you handle loading, success, empty and error states for an API call?**

**Short answer:** model the request as **one status value** with four possible states, and render something specific for each. The two that get forgotten are **empty**, which is a success with nothing in it, and **error**, which needs a way to try again.

Three booleans (\`isLoading\`, \`isError\`, \`hasData\`) allow nonsense such as loading *and* failed at once; one \`status\` field cannot be in two states (the TypeScript guide's Q25 types it).

\`\`\`tsx
// A fake API so each state can be tried. Real code would call fetch here.
function fetchUsers(outcome) {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (outcome === 'error') reject(new Error('Server returned 500'));
      else resolve(outcome === 'empty' ? [] : ['Asha', 'Ravi', 'Meera']);
    }, 600)
  );
}

function useUsers(outcome) {
  const [state, setState] = React.useState({ status: 'loading' });
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    let ignore = false;
    setState({ status: 'loading' });
    fetchUsers(outcome)
      .then((users) => { if (!ignore) setState({ status: 'success', users }); })
      .catch((error) => { if (!ignore) setState({ status: 'error', error }); });
    return () => { ignore = true; };            // a newer request replaces this one
  }, [outcome, attempt]);

  return { state, retry: () => setAttempt((n) => n + 1) };
}

function UserList({ outcome }) {
  const { state, retry } = useUsers(outcome);

  if (state.status === 'loading') return <p aria-busy="true">Loading users…</p>;
  if (state.status === 'error') {
    return (
      <div role="alert">
        <p>Could not load users. {state.error.message}</p>
        <button onClick={retry}>Try again</button>
      </div>
    );
  }
  if (state.users.length === 0) return <p>No users yet. Invite someone to get started.</p>;
  return <ul>{state.users.map((u) => <li key={u}>{u}</li>)}</ul>;
}

function Demo() {
  const [outcome, setOutcome] = React.useState('success');
  return (
    <div>
      {['success', 'empty', 'error'].map((o) => (
        <button key={o} onClick={() => setOutcome(o)} aria-pressed={outcome === o}>{o}</button>
      ))}
      <UserList outcome={outcome} />
    </div>
  );
}

render(<Demo />);
\`\`\`

**What makes each state good, not just present:**

- **Loading.** A **skeleton** beats a spinner when the layout is known, because nothing jumps when data arrives. For usually-fast requests, wait about 200 ms before showing it. When *refetching*, keep the old data on screen with a small "updating" hint.
- **Empty.** Say what is empty and what to do next ("No orders yet. Browse products"). A blank area looks like a bug.
- **Error.** Say what failed in plain words, keep the rest of the page working, offer **Try again**, and use \`role="alert"\` so a screen reader announces it.
- **Success.** Only here is the data guaranteed to exist, so only here do you read it.

**In practice** TanStack Query and RTK Query give you this status field plus retries, caching and cancellation. Being able to write the hook is what the question tests.

---

**Q69: An API response takes 10 seconds. What would you show the user?**

**Short answer:** feedback that **changes with time**, so the user knows it is still working. Show the page structure immediately, say it is taking longer than usual after a few seconds, and offer a way to cancel. If the operation is *routinely* this slow, the real fix is on the server: turn it into a background job.

Jakob Nielsen's classic response-time limits set the thresholds: about **0.1 s** feels instant, about **1 s** keeps the train of thought, and beyond about **10 s** people lose focus.

| Time waiting | What to show |
|---|---|
| 0 – 1 s | the page layout with a skeleton where the slow part will go; the rest of the page usable |
| 1 – 3 s | a spinner or progress indicator on the slow part only |
| about 3 s | a message: "This is taking longer than usual…" |
| about 8 s | a **Cancel** button, and if it helps, "You can leave this page, we'll notify you when it's ready" |
| a timeout you chose | stop waiting and show an error with **Try again** |

If the server can report progress ("step 2 of 4"), show it: a real progress bar feels faster than an unknown wait.

\`\`\`tsx
// Picks a message based on how long we have been waiting.
function useWaitingMessage(isWaiting) {
  const [seconds, setSeconds] = React.useState(0);
  React.useEffect(() => {
    if (!isWaiting) return;
    setSeconds(0);
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isWaiting]);

  if (!isWaiting) return null;
  if (seconds < 3) return 'Loading your report…';
  if (seconds < 8) return 'This is taking longer than usual…';
  return 'Still working. You can cancel and try again later.';
}

function Report() {
  const [waiting, setWaiting] = React.useState(true);
  const message = useWaitingMessage(waiting);
  return (
    <div>
      <p aria-live="polite">{message || 'Report ready.'}</p>
      {waiting && <button onClick={() => setWaiting(false)}>Cancel</button>}
    </div>
  );
}

render(<Report />);
\`\`\`

**Things that make it worse:**

- **A full-screen spinner** when only one panel is slow. Load everything else and let the user work.
- **No timeout.** \`fetch\` has none by default. Set one with \`AbortSignal.timeout(ms)\`, a little longer than the slowest normal response.
- **Retrying automatically** on a request that is slow but has not failed, which adds load to a struggling server.

**When 10 seconds is normal (reports, exports, AI generation),** don't hold an HTTP request open: the server answers \`202 Accepted\` with a job id, the browser follows the job by polling, Server-Sent Events or a WebSocket, and the user can leave and come back (the API Design guide's Q9 covers the server side).

---

**Q70: The user navigates away while an API request is still running. What should happen?**

**Short answer:** it depends on what the request is for. A request that only **loads data for that page** should be **cancelled**, because nobody will see the result. A request that **changes something** (save, pay, upload) should usually be **allowed to finish**, and its result reported somewhere that is still on screen.

**Cancel a page's data request** with an \`AbortController\` aborted in the effect's cleanup, which runs when the component unmounts, that is, when the user leaves.

\`\`\`tsx
// A fake fetch that honours an AbortSignal, as the real fetch does.
function fakeFetch(url, { signal }) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve({ url, rows: 3 }), 300);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('The request was cancelled', 'AbortError'));
    });
  });
}

function ReportPage() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    const controller = new AbortController();
    fakeFetch('/api/report', { signal: controller.signal })
      .then(setData)
      .catch((err) => {
        if (err.name === 'AbortError') console.log('request cancelled, nothing to show');
        else console.log('real failure, show the error state');
      });
    return () => controller.abort();          // runs when the user leaves this page
  }, []);

  return <p>{data ? 'Loaded ' + data.rows + ' rows' : 'Loading…'}</p>;
}

function App() {
  const [page, setPage] = React.useState('report');
  React.useEffect(() => {
    const id = setTimeout(() => {
      console.log('user navigates away');
      setPage('home');
    }, 100);
    return () => clearTimeout(id);
  }, []);
  return page === 'report' ? <ReportPage /> : <p>Home</p>;
}

render(<App />);
\`\`\`

\`\`\`text
user navigates away
request cancelled, nothing to show
\`\`\`

**Why cancelling matters:**

- **It saves work:** the browser stops downloading, and the server may stop too.
- **It prevents stale data landing on the wrong screen.** Go from \`/users/1\` to \`/users/2\` and the slow response for user 1 can arrive *after* user 2's and overwrite it. Aborting (or ignoring, as Q68's \`ignore\` flag does) stops that.
- It is **not** about a warning any more: React 18 removed "can't perform a state update on an unmounted component", because that update is simply ignored.

**An \`AbortError\` is not a failure**, so check \`err.name\` and ignore it, as the demo does. Showing "Something went wrong" because the user clicked a link is a common bug.

**Do not cancel a save.** Aborting stops the browser waiting; it does **not** undo anything the server already wrote. Let a mutation finish and report it through something that outlives the page (a toast), or ask "Leave without saving?".

**You often get this for free:** TanStack Query passes a \`signal\` to your query function and aborts unused queries, and React Router loaders receive \`request.signal\`, aborted on navigation.

---

**Q71: Your backend returns 401 Unauthorized. How would you refresh the token automatically?**

**Short answer:** put the logic in **one place**, the function every API call goes through. On a 401, refresh the access token **once** (the refresh token travels in an \`HttpOnly\` cookie JavaScript never reads; the OAuth & SSO guide's Q5 explains why), keep the new access token **in memory**, and retry the original request **once**. If the refresh fails, the session is over: clear the user and send them to login with a link back.

**The graded detail is the race.** A page fires several requests at once; when the token has expired they all get a 401 together, and a naive handler refreshes several times in parallel. With refresh-token rotation, the second refresh uses a token the first just invalidated, fails, and logs the user out for nothing. The fix is **single-flight**: the first 401 starts the refresh and stores its promise, and every other 401 awaits that same promise.

\`\`\`js
// ---- a fake server: the token the browser starts with has expired ----
let currentValidToken = 'token-2';
let refreshCalls = 0;

async function server(path, token) {
  await new Promise((r) => setTimeout(r, 20));
  if (path === '/auth/refresh') {
    refreshCalls++;
    return { status: 200, body: { accessToken: currentValidToken } };
  }
  if (token !== currentValidToken) return { status: 401 };
  return { status: 200, body: path + ' ok' };
}

// ---- the client: every request goes through apiFetch ----
let accessToken = 'token-1';     // kept in memory, never in localStorage
let refreshing = null;           // the ONE refresh in progress, shared by every caller

function refreshAccessToken() {
  if (!refreshing) {
    refreshing = server('/auth/refresh')        // the refresh cookie is sent automatically
      .then((res) => {
        if (res.status !== 200) throw new Error('Session expired, please log in again');
        accessToken = res.body.accessToken;
      })
      .finally(() => { refreshing = null; });   // the next expiry starts a fresh refresh
  }
  return refreshing;
}

async function apiFetch(path, alreadyRetried = false) {
  const res = await server(path, accessToken);
  if (res.status === 401 && !alreadyRetried) {
    await refreshAccessToken();                // everyone with a 401 waits for the same refresh
    return apiFetch(path, true);               // retry ONCE, never in a loop
  }
  if (res.status === 401) throw new Error('Still unauthorised after refreshing: log out');
  return res.body;
}

// Three requests that all hit an expired token at the same moment.
Promise.all([apiFetch('/orders'), apiFetch('/profile'), apiFetch('/cart')]).then((results) => {
  console.log(results.join(', '));
  console.log('refresh calls:', refreshCalls);
});
\`\`\`

\`\`\`text
/orders ok, /profile ok, /cart ok
refresh calls: 1
\`\`\`

**Three rules that stop it looping or leaking:**

- **Retry once.** The \`alreadyRetried\` flag makes a request that still gets a 401 fail instead of refreshing forever.
- **Never run the 401 handler on the refresh call itself.** A 401 from \`/auth/refresh\` means "log out".
- **Retry only requests that are safe to repeat.** A \`GET\` is; a \`POST\` the server may have half-processed needs an idempotency key (see the Rate-Limited Button template).

**With axios** the same logic is a response interceptor that awaits the shared promise and returns \`axios(originalConfig)\` with a \`_retry\` flag. **Across tabs**, \`navigator.locks.request('token-refresh', …)\` makes the refresh single-flight too. **Proactive refresh** a minute before expiry cuts how often users hit the 401, but you still need the 401 path, because clocks drift and laptops sleep.

---

**Q72: How would a React app communicate with Spring Boot microservices?**

**Short answer:** not directly with each service. The browser talks to **one entry point**, an API gateway (often Spring Cloud Gateway) or a Backend for Frontend (BFF, a small server owned by the frontend team), which routes each request to the right service. On the React side, every call goes through **one API client module** that knows the base URL, attaches authentication, and turns every error into one shape.

\`\`\`text
Browser (React)
   │  https://app.example.com/api/...      one origin, one auth check
   ▼
API gateway / BFF            Spring Cloud Gateway: routing, JWT check, rate limits, CORS
   ├── /api/orders/**   →  order-service     (Spring Boot)
   ├── /api/users/**    →  user-service      (Spring Boot)
   └── /api/payments/** →  payment-service   (Spring Boot)
\`\`\`

**Why one entry point:** the browser doesn't need to know how many services exist, authentication is checked once, every call is same-origin (no per-service CORS), and services can be split or moved without a frontend release.

**The React side:**

1. **One API client** module holds the base URL (\`import.meta.env.VITE_API_URL\`), sends credentials, handles the 401 refresh (Q71) and sets a timeout. Components never \`fetch\` a hard-coded URL.
2. **Local development without CORS:** proxy \`/api\` from the dev server (\`server.proxy: { '/api': 'http://localhost:8080' }\` in \`vite.config.js\`), so the browser still sees one origin.
3. **CORS, when the origins really differ:** configure it **once, at the gateway**, not with \`@CrossOrigin\` per controller. With credentials, list exact origins (no \`*\`), and list any header the frontend reads, such as \`Content-Disposition\` (Q73), in \`exposedHeaders\`.
4. **Generated types:** \`springdoc-openapi\` publishes each service's OpenAPI description, and \`openapi-typescript\` or \`orval\` generate TypeScript from it, so a renamed DTO field fails the frontend build instead of production.
5. **One error shape.** Spring Boot errors come in two formats; convert both at the client boundary:

\`\`\`js
// Spring Boot errors arrive in one of two shapes. Turn both into one.
//  - ProblemDetail (RFC 9457): { type, title, status, detail, instance }
//    used when spring.mvc.problemdetails.enabled=true, or returned by your own handlers
//  - Boot's default error page: { timestamp, status, error, path }
//    where "message" is left out unless server.error.include-message is set
function toAppError(status, body = {}) {
  const message =
    body.detail ||                       // ProblemDetail's human-readable explanation
    body.message ||                      // only if the server was configured to include it
    body.title ||
    body.error ||
    'Request failed';
  return { status, message, path: body.instance || body.path || null };
}

console.log(toAppError(404, { type: 'about:blank', title: 'Not Found', status: 404, detail: 'Order 42 does not exist', instance: '/api/orders/42' }).message);
console.log(toAppError(500, { timestamp: '2026-09-26T10:00:00Z', status: 500, error: 'Internal Server Error', path: '/api/orders' }).message);
console.log(toAppError(502).message);
\`\`\`

\`\`\`text
Order 42 does not exist
Internal Server Error
Request failed
\`\`\`

**Three Spring-specific details that trip React developers:**

- **Pages start at 0.** Spring Data's \`Pageable\` reads \`?page=0&size=20&sort=name,asc\`. Convert once in the API client (\`page: uiPage - 1\`), not in every component.
- **The page response shape.** A Spring Data \`Page\` returned directly has no guaranteed JSON structure (Spring Data 3.3+ warns about it); \`@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)\` makes it a stable \`{ content: [...], page: { size, number, totalElements, totalPages } }\`.
- **Authentication.** The gateway, or each service as an OAuth 2.0 *resource server*, validates the JWT. With a session cookie instead, Spring Security's CSRF protection applies and the frontend must echo the CSRF token in a header.

**Real-time updates** come as WebSockets (often STOMP) or Server-Sent Events (\`SseEmitter\`), also through the gateway; see the [Real-Time Web guide](/frontend/realtime-web).

---

**Q73: How would you download a CSV or PDF file returned by a Spring Boot API?**

**Short answer:** if the browser can reach the file with its cookies, **link to it**. If the request needs an \`Authorization\` header, **fetch it as a blob**, make a temporary URL, and click a hidden link. The gotcha in the second case is the file name: it is in \`Content-Disposition\`, which JavaScript cannot read cross-origin unless the server exposes it.

**Option 1: a plain link (best when it works),** when authentication is a cookie and the API is same-origin:

\`\`\`text
<a href="/api/reports/42/export?format=csv" download>Download CSV</a>
\`\`\`

The browser streams it to disk with its own progress bar and never holds it all in memory, so it works for a 2 GB export. \`Content-Disposition: attachment; filename="report.csv"\` says save rather than display, and names the file.

**Option 2: fetch, blob, temporary link,** when the API expects \`Authorization: Bearer …\`, which a link cannot send. (It uses \`document\`, so it is shown as text.)

\`\`\`text
async function downloadFile(url, accessToken) {
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + accessToken } });

  // Check first. A failed request still has a body: the error JSON.
  // Skip this and the user downloads "report.pdf" containing {"status":500,...}.
  if (!res.ok) throw new Error('Download failed: ' + res.status);

  const blob = await res.blob();
  const filename = filenameFromDisposition(res.headers.get('Content-Disposition')) || 'download';

  const objectUrl = URL.createObjectURL(blob);    // a temporary URL pointing at the blob in memory
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;                          // "save as this name" instead of navigating
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);                 // free the memory; the download has started
}
\`\`\`

To **view** a PDF instead, \`window.open(objectUrl)\`. **Reading the file name** is the fiddly part: servers send \`filename="report.csv"\` and, for non-ASCII names, \`filename*=UTF-8''…\`, which wins when both are present.

\`\`\`js
function filenameFromDisposition(header) {
  if (!header) return null;
  // filename*=UTF-8''na%C3%AFve.csv  (RFC 5987: percent-encoded, preferred when present)
  const encoded = /filename\\*\\s*=\\s*([^']*)''([^;]+)/i.exec(header);
  if (encoded) return decodeURIComponent(encoded[2].trim());
  // filename="report.csv"  or  filename=report.csv
  const plain = /filename\\s*=\\s*"?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : null;
}

console.log(filenameFromDisposition('attachment; filename="orders-2026-09.csv"'));
console.log(filenameFromDisposition("attachment; filename=\\"naive.csv\\"; filename*=UTF-8''na%C3%AFve.csv"));
console.log(filenameFromDisposition('inline'));
\`\`\`

\`\`\`text
orders-2026-09.csv
naïve.csv
null
\`\`\`

**The header that silently disappears.** Cross-origin, the browser hides every response header except a short safe list, and \`Content-Disposition\` is not on it, so \`res.headers.get('Content-Disposition')\` returns \`null\` although DevTools shows the header. The server must send \`Access-Control-Expose-Headers: Content-Disposition\` (\`exposedHeaders("Content-Disposition")\` in Spring's CORS config). Spring's \`ContentDisposition.attachment().filename("report.csv", StandardCharsets.UTF_8).build()\` also produces the \`filename*\` form.

**Two more details:** a blob holds the whole file in memory, so for big exports prefer option 1 or a short-lived signed URL (such as an S3 pre-signed URL); and Excel on Windows often misreads a UTF-8 CSV (\`é\` becomes \`Ã©\`) unless the file starts with a byte-order mark (\`\uFEFF\`).

---

### Rendering, Patterns and Everyday Pitfalls

Questions that come up in almost every React interview, usually phrased as "why does this happen?".

**Q74: Why does my effect run twice in development?**

**Short answer:** because your app is wrapped in \`<StrictMode>\`. In **development only**, StrictMode mounts every component, immediately unmounts it, and mounts it again, so each effect runs setup → cleanup → setup. It is a test: if your effect's cleanup does not fully undo its setup, the double run exposes the bug now, instead of in production. Production runs everything once.

\`\`\`tsx
function Chat({ roomId }) {
  React.useEffect(() => {
    console.log('connect to', roomId);
    return () => console.log('disconnect from', roomId);   // the cleanup undoes the setup
  }, [roomId]);
  return <p>Room: {roomId}</p>;
}

render(
  <React.StrictMode>
    <Chat roomId="general" />
  </React.StrictMode>
);
\`\`\`

\`\`\`text
connect to general
disconnect from general
connect to general
\`\`\`

That is the development output. (This app's playground runs React's *production* build, so Try it prints only the first line.)

Connect, disconnect, connect leaves exactly one connection, the correct end state. It becomes a real bug only when the cleanup is missing: two subscriptions, two timers. React checks this because it may genuinely unmount and remount a component while keeping its state, with \`<Activity>\` (Q28) and fast refresh.

**How to respond:**

- **Subscriptions, timers, listeners:** return a cleanup that undoes them. Always the fix.
- **Data fetching:** ignore or abort the first request in the cleanup (Q68, Q70). Development shows two requests; production one.
- **Once per app load** (analytics init, reading a URL token): do it at module level, not in an effect.

**What not to do:** remove \`<StrictMode>\`, or add a \`useRef\` flag that skips the second run. Both hide the bug.

→ Full explanation: [§15.9](/frontend/react-19-patterns#159-strictmode)

---

**Q75: What is automatic batching, and when would you use \`flushSync\`?**

**Short answer:** when you call several state setters in a row, React **batches** them: it waits until your code finishes and then re-renders **once** with all the changes. Since React 18 this happens everywhere, including inside \`setTimeout\`, promises and native event listeners, which is why it is called *automatic* batching. \`flushSync\` is the rare opt-out: it forces React to apply an update and update the DOM **immediately**.

\`\`\`tsx
function Profile() {
  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState(0);
  console.log('render', JSON.stringify({ name, age }));

  React.useEffect(() => {
    setTimeout(() => {
      setName('Asha');       // no render yet
      setAge(30);            // still no render
    }, 50);                  // one render after the callback finishes
  }, []);

  return <p>{name} {age}</p>;
}

render(<Profile />);
\`\`\`

\`\`\`text
render {"name":"","age":0}
render {"name":"Asha","age":30}
\`\`\`

Two setters, one render. Before React 18 updates inside a \`setTimeout\` were not batched, so this rendered twice and briefly showed a name with the wrong age. **The consequence people trip on:** reading \`name\` right after \`setName('Asha')\` still gives the old value, because the new one only exists in the *next* render ([Tricky Q1](/frontend/react-tricky-questions#state-batching)).

**When \`flushSync\` is needed:** when the next line must see the updated DOM, usually to measure it or move focus.

\`\`\`tsx
// In a real file: import { flushSync } from 'react-dom';
function Messages() {
  const [items, setItems] = React.useState(['first']);
  const listRef = React.useRef(null);

  const add = () => {
    flushSync(() => {
      setItems((list) => [...list, 'message ' + (list.length + 1)]);
    });
    // The DOM already has the new item here, so this sees it.
    console.log('items in the DOM:', listRef.current.children.length);
    listRef.current.lastElementChild.scrollIntoView({ block: 'nearest' });
  };

  return (
    <div>
      <ul ref={listRef}>{items.map((m) => <li key={m}>{m}</li>)}</ul>
      <button onClick={add}>Add</button>
    </div>
  );
}

render(<Messages />);
\`\`\`

Clicking **Add** logs \`items in the DOM: 2\`. Without \`flushSync\` it would log \`1\`, and the scroll would target the item that *used* to be last.

Use it sparingly: it forces a synchronous render, and calling it inside a render or an effect is itself a warning. Most "I need the DOM after updating" cases fit an effect or a ref callback better.

→ Full explanation: [§5.2](/frontend/react#52-state-update-rules)

---

**Q76: What is a portal, and how do events behave inside one?**

**Short answer:** \`createPortal(children, domNode)\` renders children into a **different place in the DOM**, usually \`document.body\`, while keeping them in the **same place in the React tree**. It exists for modals, tooltips and dropdowns that an ancestor's \`overflow: hidden\` or \`z-index\` would otherwise clip.

**The graded part is "same place in the React tree":** context still reaches the portalled children, and React events **bubble up the React tree, not the DOM tree**.

\`\`\`tsx
// In a real file: import { createPortal } from 'react-dom';
function Page() {
  const [target, setTarget] = React.useState(null);   // the DOM node to portal into

  return (
    <div>
      <section onClick={() => console.log('section heard the click')}>
        <p>The button below is rendered somewhere else in the DOM.</p>
        {target && createPortal(
          <button onClick={() => console.log('button clicked')}>Click me</button>,
          target
        )}
      </section>
      {/* Outside the section in the DOM. */}
      <div ref={setTarget} style={{ marginTop: 20, padding: 10, border: '1px dashed #888' }} />
    </div>
  );
}

render(<Page />);
\`\`\`

Clicking the button prints:

\`\`\`text
button clicked
section heard the click
\`\`\`

In the DOM the button is not inside the \`<section>\`, yet the section's handler runs, because in React's tree the button is its child. **Why it matters:**

- **"Click outside to close" breaks:** \`sectionRef.current.contains(event.target)\` says *outside*, because in the DOM it was. Check the portal's node too.
- **A clickable card that opens a modal receives the modal's clicks.** Call \`event.stopPropagation()\` at the modal's root.
- **Accessibility is still your job:** a portal does not trap focus, restore it on close, or hide the page behind from screen readers (the Modal (Portal + Focus Trap) template does all three).

→ Full explanation: [§15.7](/frontend/react-19-patterns#157-portals)

---

**Q77: Why does \`{count && <Badge />}\` show a \`0\` on the screen?**

**Short answer:** because \`&&\` returns its **left side** when that side is falsy, and React renders the number \`0\` as text. \`false\`, \`null\` and \`undefined\` render nothing, but \`0\` and \`NaN\` are numbers, so they appear. Use a real boolean, or a ternary.

\`\`\`tsx
function Badge({ count }) {
  return <span> ({count} new)</span>;
}

function Inbox({ count }) {
  return (
    <p>
      Inbox
      {count && <Badge count={count} />}
    </p>
  );
}

render(<Inbox count={0} />);
\`\`\`

This renders \`Inbox0\`: \`0 && <Badge />\` evaluates to \`0\`, which is valid content. \`{items.length && <List />}\` on an empty list does the same.

**Three safe forms:**

\`\`\`tsx
function Inbox({ count }) {
  return (
    <div>
      <p>Inbox {count > 0 && <span>({count} new)</span>}</p>              {/* a real boolean */}
      <p>Inbox {count ? <span>({count} new)</span> : null}</p>            {/* a ternary */}
      <p>Inbox {Boolean(count) && <span>({count} new)</span>}</p>         {/* explicit conversion */}
    </div>
  );
}

render(<Inbox count={0} />);
\`\`\`

**Two related rules from the same conversation:** conditional rendering **unmounts**, so \`{isOpen && <Panel />}\` loses a half-filled form when it closes (hide it with \`<Activity mode="hidden">\` instead, Q28); and the same component in the same position **keeps its state** across ternary branches, so \`{isAdmin ? <Form role="admin" /> : <Form role="user" />}\` is one \`Form\` unless each branch gets its own \`key\` (Q34).

→ Full explanation: [§9.1](/frontend/react#91-conditional-rendering)

---

**Q78: How would you build a form in React? Compare controlled inputs, a form library and React 19 form actions.**

**Short answer:** all three work, and they suit different forms. **Controlled inputs** give you the value on every keystroke, which is right for live validation and inputs that affect other UI. A **form library** such as React Hook Form suits big forms with many validation rules. **React 19 form actions** handle the submit itself (pending state, errors, reset) with very little code.

| Aspect | Controlled inputs | React Hook Form | Form actions (React 19) |
|---|---|---|---|
| Where the values live | React state, one \`useState\` per field or one object | the DOM, read by the library through refs | the DOM, read as \`FormData\` on submit |
| Re-renders while typing | every keystroke | almost none | none |
| Validation | you write it | rules or a schema (Zod, Yup), per field | on submit, in the action |
| Pending and error state | you write it | built in | built in: \`useActionState\`, \`useFormStatus\` |
| Best for | small forms, live feedback, dependent fields | large forms, complex validation | submit-centric forms, Server Actions in Next.js |

**Form actions:** pass a function to the form's \`action\`. React calls it with the form's data on submit, \`useActionState\` keeps what it returned (an error or a success message), and \`isPending\` is true while it runs.

\`\`\`tsx
// Pretend server call: rejects taken usernames.
function saveUsername(name) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(name === 'admin' ? { error: 'That username is taken' } : { ok: true }), 300)
  );
}

async function signUp(previousState, formData) {
  const name = String(formData.get('username') || '').trim();
  if (name.length < 3) return { error: 'At least 3 characters', value: name };
  const result = await saveUsername(name);
  if (result.error) return { error: result.error, value: name };
  return { message: 'Welcome, ' + name + '!' };
}

function SignUpForm() {
  const [state, formAction, isPending] = React.useActionState(signUp, {});
  return (
    <form action={formAction}>
      <label>
        Username <input name="username" defaultValue={state.value || ''} />
      </label>
      <button type="submit" disabled={isPending}>{isPending ? 'Saving…' : 'Sign up'}</button>
      {state.error && <p role="alert">{state.error}</p>}
      {state.message && <p>{state.message}</p>}
    </form>
  );
}

render(<SignUpForm />);
\`\`\`

Try \`ab\`, then \`admin\`, then a real name. With no extra code the button disables itself while the action runs, the error arrives as state (no \`try/catch\`, no error \`useState\`), and after a **successful** submit React **resets the form's uncontrolled inputs**, which is why the failed cases pass the typed value back through \`defaultValue\`. \`useFormStatus()\` gives a shared \`<SubmitButton>\` rendered *inside* the form its pending state without a prop.

**How to choose:** "Uncontrolled plus an action for most submit forms, controlled where the UI reacts while the user types, React Hook Form with a schema once there are more than a handful of rules." Client validation is a convenience; the server validates again.

→ Full explanation: [§10.3](/frontend/react#103-react-hook-form-zod), [§16.2](/frontend/react-19-patterns#162-actions-and-useactionstate)

---

**Q79: How do you type React components with TypeScript?**

**Short answer:** type **props** with a \`type\` or \`interface\`, **children** as \`React.ReactNode\`, **events** with React's event types, and use **generics** when a component works with items of any type. Let inference do the rest; most hooks need no annotation at all.

\`\`\`tsx
// 1. Props, with children typed as ReactNode (anything React can render)
type CardProps = {
  title: string;
  footer?: React.ReactNode;           // optional
  children: React.ReactNode;
};

function Card({ title, footer, children }: CardProps) {
  return (
    <section>
      <h3>{title}</h3>
      {children}
      {footer && <footer>{footer}</footer>}
    </section>
  );
}

// 2. Extending a native element: every <button> prop, plus your own
type ButtonProps = React.ComponentProps<'button'> & { variant?: 'primary' | 'ghost' };

function Button({ variant = 'primary', ...rest }: ButtonProps) {
  return <button data-variant={variant} {...rest} />;
}

// 3. Events and state
function Search() {
  const [query, setQuery] = React.useState('');                          // inferred: string
  const [picked, setPicked] = React.useState<string | null>(null);        // annotate when the start value is not the full type
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);
  return (
    <div>
      <input value={query} onChange={onChange} />
      <Button onClick={() => setPicked(query)}>Pick</Button>
      {picked && <p>Picked: {picked}</p>}
    </div>
  );
}

// 4. A generic component: the item type is inferred from the items you pass
type ListProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
};

function List<T>({ items, getKey, renderItem }: ListProps<T>) {
  return <ul>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;
}

function App() {
  const users = [{ id: 'u1', name: 'Asha' }, { id: 'u2', name: 'Ravi' }];
  return (
    <Card title="Team" footer={<small>2 people</small>}>
      <List items={users} getKey={(u) => u.id} renderItem={(u) => u.name} />
      <Search />
    </Card>
  );
}

render(<App />);
\`\`\`

**What each buys you** (checked with the TypeScript compiler): the generic \`List\` infers \`T\` from \`items\`, so \`renderItem={(u) => u.nme}\` is a compile error (*Did you mean 'name'?*); \`React.ComponentProps<'button'>\` gives \`Button\` every native prop with the right types, and \`variant="danger"\` fails; \`React.ChangeEvent<HTMLInputElement>\` makes \`e.target.value\` a \`string\`, while inline handlers are inferred.

**Two follow-ups:**

- **\`React.FC\` or a plain function?** Either. \`React.FC\` used to add a hidden \`children\` prop, which is why style guides banned it; since React 18's types it doesn't, so \`React.FC<{ title: string }>\` with \`children\` is now an error. Plain typed functions are more common.
- **Generic arrow functions in \`.tsx\`** need a trailing comma, \`<T,>(props: ListProps<T>) => …\`, or \`<T>\` parses as a JSX tag.

(The playground strips types without checking them, so Try it runs this but cannot show a type error; see the TypeScript guide's Q10.)

---

**Q80: What patterns do you use to make a component reusable?**

**Short answer:** start with **composition through \`children\`**, the simplest and most flexible. When parts of a component need to share state, use **compound components**. When the parent needs to control *what* is rendered, use a **render prop**. And for anything with a value, support both **controlled and uncontrolled** use.

**1. Composition with \`children\` and "slot" props.** \`<Card title="…" footer={<Actions />}>{body}</Card>\` extends more easily than \`<Card title body footerText footerButtonLabel onFooterClick />\`.

**2. Compound components:** parts that share state through context, so the caller arranges them freely, as with \`<select>\`/\`<option>\` and most libraries' tabs and accordions.

\`\`\`tsx
const DisclosureContext = React.createContext(null);

function Disclosure({ children, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();
  return <DisclosureContext.Provider value={{ open, setOpen, id }}>{children}</DisclosureContext.Provider>;
}

function useDisclosure() {
  const ctx = React.useContext(DisclosureContext);
  if (!ctx) throw new Error('Disclosure parts must be inside <Disclosure>');   // a clear error beats a null crash
  return ctx;
}

Disclosure.Button = function DisclosureButton({ children }) {
  const { open, setOpen, id } = useDisclosure();
  return <button aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{children}</button>;
};

Disclosure.Panel = function DisclosurePanel({ children }) {
  const { open, id } = useDisclosure();
  return <div id={id} hidden={!open}>{children}</div>;
};

function App() {
  return (
    <Disclosure>
      <h3><Disclosure.Button>Shipping details</Disclosure.Button></h3>   {/* the caller decides the markup around it */}
      <Disclosure.Panel>Ships in 2 working days.</Disclosure.Panel>
    </Disclosure>
  );
}

render(<App />);
\`\`\`

The caller put the button inside an \`<h3>\` without \`Disclosure\` knowing; a single \`<Disclosure title body />\` would have needed another prop.

**3. Render props:** the component owns the behaviour and calls your function to render, as in \`<Autocomplete renderOption={(option, { active }) => …} />\`. Hooks replaced most render props for sharing *logic* (Q49); they remain right when the component decides *where* your markup goes.

**4. Controlled and uncontrolled:** accept \`value\` plus \`onChange\` **or** \`defaultValue\`, using the prop when given and internal state when not (the Frontend System Design guide's tricky Q8 covers a caller passing both).

**What to avoid:** a "god component" with a prop for every case (\`showIcon\`, \`iconPosition\`, \`iconColor\`…), and HOCs in new code (Q59). The test of an API: can the next unexpected requirement be met by the caller, without a new prop?

→ Full explanation: [§15.1](/frontend/react-19-patterns#151-compound-components), [§15.2](/frontend/react-19-patterns#152-render-props)

---

**Q81: What is a stale closure in React, and how do you fix one?**

**Short answer:** every render creates new functions, and each function remembers the props and state **of the render it was created in**. A function that keeps running after later renders, such as a \`setInterval\` callback or an event listener added once, keeps seeing those old values. That is a stale closure.

\`\`\`tsx
function Timer() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);          // "count" is the value from the FIRST render: always 0
    }, 1000);
    return () => clearInterval(id);
  }, []);                            // the effect never re-runs, so the callback is never replaced

  return <p>{count}</p>;
}

render(<Timer />);
\`\`\`

This shows \`1\` and stays there: the callback was created in the first render, when \`count\` was \`0\`, so every tick computes \`0 + 1\` ([Tricky Q6](/frontend/react-tricky-questions#useeffect-lifecycle) traces it).

**The fixes, and when each fits:**

| Fix | Code | Use when |
|---|---|---|
| **Functional update** | \`setCount((c) => c + 1)\` | the new state depends only on the old state. The simplest fix here |
| **Correct dependencies** | \`}, [count]);\` | the effect should restart when the value changes. Here that means a new interval every second, which works but is wasteful |
| **A ref holding the latest value** | \`latest.current = value\` in an effect, read \`latest.current\` in the callback | a long-lived callback needs the latest value, and restarting is expensive (a socket, a subscription) |
| **\`useEffectEvent\`** (React 19.2) | \`const onTick = useEffectEvent(() => …)\` | logic inside an effect needs the latest props and state, without being a reason to re-run the effect (Q29) |

**How to spot it:** a value right on the first render that never updates, a handler that "remembers" an old filter, or an \`eslint-disable\` above a dependency array. \`react-hooks/exhaustive-deps\` catches most of these, which is why disabling it is a review flag.

→ Full explanation: [§5.2](/frontend/react#52-state-update-rules)

---

**Q82: Why does my input lose focus on every keystroke?**

**Short answer:** almost always because a **component is defined inside another component**. Each render of the parent creates a brand-new component function, React sees a different component type in that position, and it **unmounts the old one and mounts a new one**, which throws away the input, its focus and its state.

\`\`\`tsx
function Form() {
  const [name, setName] = React.useState('');

  // ❌ A new component function on every render of Form
  function NameField() {
    return <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type here" />;
  }

  return (
    <div>
      <NameField />
      <p>Hello {name}</p>
    </div>
  );
}

render(<Form />);
\`\`\`

Type one letter and the input loses focus: \`setName\` re-renders \`Form\`, which creates a new \`NameField\` function, a different component type to React, so reconciliation (Q8) replaces the subtree. **Define components at the top level** and pass what they need as props:

\`\`\`tsx
function NameField({ value, onChange }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Type here" />;
}

function Form() {
  const [name, setName] = React.useState('');
  return (
    <div>
      <NameField value={name} onChange={setName} />
      <p>Hello {name}</p>
    </div>
  );
}

render(<Form />);
\`\`\`

**Other causes, all remounts rather than re-renders:** a \`key\` that changes every render (\`key={Math.random()}\`), switching element type (\`<input>\` ↔ \`<textarea>\`), or a parent higher up that remounts. To check, log in a mount effect's setup and cleanup: if typing prints \`unmounted\` then \`mounted\`, it is a remount.

---

**Q83: What is new in React 19.3?**

**Short answer:** React 19.3 (September 2026) made \`<ViewTransition>\` and Fragment Refs stable, and added \`browser()\` for client-only components and support for the browser's Trusted Types. It removes nothing, so upgrading from 19.2 is a version bump.

The four things to name, with one line each on why they matter:

- **\`<ViewTransition>\`** animates elements entering, leaving, moving or changing, using the browser's View Transitions API. It only runs for Transitions (\`startTransition\`, Suspense reveals, \`useDeferredValue\`), so urgent updates such as typing never wait for an animation, and it can animate an element *leaving*, which is the hard part to do by hand.
- **Fragment Refs** give a ref to a group of siblings, so you can focus, observe or listen to them without adding a wrapper \`<div>\` that might break a flex or grid layout.
- **\`use(browser())\`** makes a component render only in the browser: on the server it suspends and sends the Suspense fallback, avoiding the hydration mismatch that comes from reading \`window\` or \`localStorage\` during server rendering.
- **Trusted Types** now work with React, because it stopped converting values to strings before they reach the DOM, so a site can enforce that XSS protection with a Content Security Policy.

The answer that shows you follow the ecosystem: before 19.3 \`<ViewTransition>\` was Canary-only, and route animations used the browser's \`document.startViewTransition()\` from the router.

→ Full explanation: [§16.11](/frontend/react-19-patterns#1611-react-193-whats-new-september-2026), [§16.10](/frontend/react-19-patterns#1610-where-react-actually-is-versions-and-experimental-status)

---

### Delivery and Scale

**Q84: How would you design a CI/CD pipeline for a React application?**

**Short answer:** order the stages so the cheapest checks fail first, build once, and promote that same build through every environment.

1. **Every pull request:** \`npm ci\` (cached), then lint, type-check, tests and a production build in parallel, all **required checks**, plus a bundle-size budget (\`size-limit\`, or a script comparing the build's gzip size with \`main\`) and an axe smoke test.
2. **A preview deployment per PR** with a short Playwright suite against it, so reviewers click the real thing.
3. **On merge:** build once, store the artifact, deploy to staging, smoke-test, then promote **the same artifact** to production. Rebuilding for production ships something never tested.
4. **After deploy:** watch error rates and Core Web Vitals from real users, and roll back automatically on a spike.

**The details that show you have run one:**

- **Build-time variables are public.** Anything prefixed \`VITE_\` (or \`NEXT_PUBLIC_\`) is inlined into the JavaScript every visitor downloads, so never put secrets there. Per-environment config comes from a \`config.json\` fetched at startup, or needs one build per environment.
- **Deploys are atomic through caching:** hashed files cached for a year, \`index.html\` never; upload the hashed files first and switch \`index.html\` last.
- **Rollback is re-pointing**, not rebuilding.
- **Old tabs request chunks that no longer exist,** so keep the previous release's files for a while and catch \`ChunkLoadError\` with a reload prompt.
- **Feature flags separate deploy from release.**

→ Full explanation: [§15.12](/frontend/react-19-patterns#1512-cicd-lint-type-check-and-test-on-every-pull-request)

---

**Q85: A React app's JavaScript bundle has grown from 500 KB to 5 MB. How would you find the cause and fix it?**

**Treat it as a regression with a cause, not as a performance project: a tenfold jump almost never comes from features, so find the change that caused it before optimising anything.** Q25 covers the general ways to shrink a bundle; this question is about diagnosis.

**1. Measure the right number:** the initial route's JavaScript, compressed, which users download and parse before the page works. The total across lazy chunks matters much less.

**2. Compare two builds, not one.** Run a bundle analyzer on the last good commit and on today's, side by side ([§13.10](/frontend/react-performance#1310-bundle-analyzers)). If you don't know when it happened, bisect the commit range by building and checking the size.

**3. Check the usual causes of a jump this size:**

| Cause | What it looks like in the analyzer | Fix |
|---|---|---|
| A development build or inline source maps shipped | React's development build, warning strings everywhere | build with \`NODE_ENV=production\`; source maps as separate files |
| A whole library imported for one function | all of \`lodash\`, every icon, every \`date-fns\` or \`moment\` locale | named imports from ESM builds, per-icon imports, load only the locales you use |
| Two versions of the same package | \`react\`, \`lodash\` or a UI kit appearing twice | \`npm ls <pkg>\`, then \`npm dedupe\` or align versions |
| A lazy boundary broken by a static import | a page that should be its own chunk sits inside the main bundle | find the plain \`import\` of the lazy module and remove it |
| Data or assets inlined into JavaScript | a large JSON file, or images as base64 strings | fetch the data at run time; lower the asset-inlining limit |
| Polyfills for browsers you no longer support | \`core-js\` in full | update \`browserslist\`, import polyfills by feature |
| Server-only code in the client bundle | a database or PDF library in a client chunk | keep it on the server (\`import 'server-only'\` in Next.js) |

**4. Prevent it, the part most answers skip.** A size budget in CI fails the pull request that grows the initial bundle past an agreed amount, turning a silent 10× drift into a red check on the one PR that caused it ([§15.12](/frontend/react-19-patterns#1512-cicd-lint-type-check-and-test-on-every-pull-request)).

---

**Q86: Explain how code splitting and lazy loading improve performance.**

**Short answer:** code splitting is the build-time half (the bundler turns each dynamic \`import()\` into its own chunk); lazy loading is the run-time half (\`React.lazy\` fetches the chunk when first rendered, with \`<Suspense>\` showing a fallback). The gain is not mainly download size:

1. **Less JavaScript to parse and run before the first screen works.** On a mid-range phone, executing JavaScript costs more than downloading it, and a busy main thread leaves the page visible but unresponsive.
2. **Better caching across deploys:** a one-line change invalidates only its chunk, not the whole bundle.
3. **Features nobody opens are never downloaded** (an editor, a chart library, an admin page).
4. **Less memory and startup work** on low-end devices.

**The costs, asked next:** the first use of a lazy feature waits for a round trip (prefetch on hover, focus or idle); chained lazy imports create request waterfalls (split at routes and big widgets, not every component); too many small chunks make navigation slower (the [Web Performance guide](/frontend/web-performance), Tricky Q4), and splitting above the fold hurts LCP ([Tricky Q21](/frontend/react-tricky-questions#performance-pitfalls)); and an open tab after a deploy gets \`ChunkLoadError\` (catch it and offer a reload).

Prefetching on intent, so the fallback shows only when the chunk isn't cached yet. \`loadChart\` stands in for \`import('./Chart')\`:

\`\`\`jsx
import { lazy, Suspense, useState } from 'react';

// Stand-in for import('./Chart'): resolves after 800 ms, like a network fetch
const loadChart = () =>
  new Promise((resolve) =>
    setTimeout(() => resolve({ default: () => <p>Chart loaded</p> }), 800)
  );

// Share one promise, so a hover followed by a click fetches the chunk once
let chartPromise = null;
const prefetchChart = () => {
  if (!chartPromise) chartPromise = loadChart();
  return chartPromise;
};
const Chart = lazy(prefetchChart);

function Dashboard() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button onMouseEnter={prefetchChart} onFocus={prefetchChart} onClick={() => setShow(true)}>
        Show chart
      </button>
      <Suspense fallback={<p>Loading chart…</p>}>{show && <Chart />}</Suspense>
    </div>
  );
}
\`\`\`

Hover for a second and then click: the chart appears at once. Click straight away and you see the fallback for the rest of the 800 ms. Judge the result by LCP and INP on a real device, not kilobytes saved.

→ Full explanation: [§13.3](/frontend/react-performance#133-code-splitting-lazy-loading), [§13.11](/frontend/react-performance#1311-tree-shaking-and-code-splitting-at-build-time)
`;export{e as default};
