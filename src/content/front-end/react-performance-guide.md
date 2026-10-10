# React — Performance & Internals

Making React fast and knowing why it is fast: memoisation, code splitting, concurrent features, profiling, and how reconciliation and Fiber work.

Part of the React series: [React Guide](/frontend/react) · **React Performance & Internals** · [React 19 & Patterns](/frontend/react-19-patterns) · [React Interview Questions](/frontend/react-interview-questions) · [React Tricky Questions](/frontend/react-tricky-questions)

---

## Table of Contents

- [13. Performance Optimization](#13-performance-optimization)
  - [13.1 React.memo](#131-reactmemo)
  - [13.2 useMemo and useCallback](#132-usememo-and-usecallback)
  - [13.3 Code Splitting (Lazy Loading)](#133-code-splitting-lazy-loading)
  - [13.4 Virtualization](#134-virtualization-large-lists)
  - [13.5 Concurrent Features](#135-concurrent-features-usetransition-usedeferredvalue)
  - [13.6 Profiling and Measurement](#136-profiling-and-measuring-performance)
  - [13.7 Common Re-render Causes](#137-common-re-render-causes-and-fixes)
  - [13.8 Image and Asset Optimization](#138-image-and-asset-optimization)
  - [13.9 Webpack vs Vite](#139-build-tools-webpack-vs-vite)
  - [13.10 Bundle Analyzers](#1310-bundle-analyzers)
  - [13.11 Tree Shaking and Code Splitting](#1311-tree-shaking-and-code-splitting-at-build-time)
  - [13.12 Server Components, SSR, Streaming](#1312-server-components-ssr-and-streaming)
  - [13.13 Performance Rules](#1313-performance-rules)
- [14. Reconciliation and Fiber](#14-reconciliation-and-fiber)
  - [14.1 Render → Reconcile → Commit](#141-the-render-reconcile-commit-pipeline)
  - [14.2 Diffing algorithm — three rules](#142-the-diffing-algorithm-three-rules)
  - [14.3 Type matching — re-render vs remount](#143-type-matching-when-components-survive-props-changes-vs-get-destroyed)
  - [14.4 Why list keys matter](#144-why-list-keys-matter-at-the-algorithm-level)
  - [14.5 Fiber data structure](#145-fiber-the-data-structure-that-makes-interruption-possible)
  - [14.6 The work loop](#146-the-work-loop-how-react-actually-traverses)
  - [14.7 Practical implications](#147-practical-implications)

---

## 13. Performance Optimization

### 13.1 React.memo

`React.memo` is a higher-order component that memoizes the rendered output. It skips re-rendering when props haven't changed (shallow comparison by default).

```tsx
type Props = { name: string; age: number };

// Memoize a component — it re-renders only when its props change
// (shallow comparison by default).
const UserCard = React.memo(function UserCard({ name, age }: Props) {
  return <div>{name}, {age}</div>;
});

// Custom comparison — return true to SKIP the re-render. Here the component
// deliberately ignores `age` changes.
const UserCardNameOnly = React.memo(
  function UserCardNameOnly(props: Props) {
    console.log('UserCardNameOnly rendered');
    return <div>{props.name}</div>;
  },
  (prev, next) => prev.name === next.name,
);

// Demo: click the button and watch the console. `age` changes every click, so
// UserCard re-renders each time, but the comparator ignores `age`, so
// "UserCardNameOnly rendered" is logged only once, on mount.
function Demo() {
  const [age, setAge] = useState(30);
  return (
    <>
      <button onClick={() => setAge(a => a + 1)}>Birthday</button>
      <UserCard name="Ana" age={age} />
      <UserCardNameOnly name="Ana" age={age} />
    </>
  );
}

render(<Demo />);
```

### 13.2 useMemo and useCallback

`useMemo` memoizes an expensive computed value; `useCallback` memoizes a function reference. Both exist to skip recalculation or to keep a reference stable for a memoized child.

```tsx
// useMemo — memoize expensive computation.
// Copy before sorting: sort() mutates the array, and `users` is the parent's prop (§5.2).
const sortedUsers = useMemo(() => {
  return [...users].sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// useCallback — memoize function reference (prevent child re-renders)
const handleDelete = useCallback((id: string) => {
  setItems(prev => prev.filter(item => item.id !== id));
}, []);
```

**The identity that interviewers love to test:** `useCallback(fn, deps)` is `useMemo(() => fn, deps)`. Same dependency semantics, same cache; `useCallback` is sugar for the function case. ([§5.2](/frontend/react#52-state-update-rules) covers why mutating a prop is a bug.)

**When NOT to reach for either** (most codebases over-apply them):

- **The render is already cheap.** Memoization costs something too (storing the previous value, comparing deps, allocating the closure). For a leaf that renders in under 1 ms it is a wash or a loss.
- **The dependencies are unstable.** If `items` is a new array every render, `useMemo(() => x, [items])` never hits its cache.
- **Nothing consumes the stable reference.** `useCallback(handler, [])` is wasted unless `handler` goes to a `React.memo` child or into an effect's deps.
- **The React Compiler is on.** It memoizes for you, which makes most manual `useMemo`/`useCallback` redundant ([§16.1](/frontend/react-19-patterns#161-react-compiler-stable-since-10)). It does not *prove* your code pure: it assumes the Rules of React, so a component that breaks them may still compile and misbehave, and code it cannot analyse is left uncompiled. The `eslint-plugin-react-hooks` 7.x rules report both cases, so read that output before relying on the compiler. Don't strip existing memoization out preemptively, and don't add new ones without profiling.

**Rule of thumb:** profile first. If the Profiler shows a child re-rendering with referentially-equal props, memoization helps. If not, it is dead weight.

### 13.3 Code Splitting (Lazy Loading)

Code splitting means shipping your app as several JavaScript files instead of one, so the first page load downloads only what the first screen needs. `React.lazy` takes a function that calls a dynamic `import()`; the bundler turns each dynamic import into a separate file (a "chunk"), and React downloads it the first time the component renders. While it downloads, the component *suspends* and the nearest `<Suspense>` shows its `fallback`.

```tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

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

**Where to split.** Routes first (most users visit a fraction of them), then heavy widgets that load on intent (a rich text editor, a map, a chart behind a "Show chart" button). Vendor splitting is a bundler setting, not a React one ([§13.11](#1311-tree-shaking-and-code-splitting-at-build-time)).

**The waterfall trap.** Nested lazy boundaries serialise the network: the browser can't request chunk B until it has downloaded and parsed chunk A that imports it, so three nested chunks at 200 ms each cost about 600 ms instead of 200 ms. Fixes: emit `<link rel="modulepreload">` for chunks you know you'll need, start the `import()` on hover or focus so the chunk is cached by the click, or hoist the lazy boundary to the route so its children come from one chunk.

**`startTransition` + lazy.** Wrapping a navigation that crosses an already-visible Suspense boundary in `startTransition` makes React **keep the previous UI on screen** until the new chunk (and any data) is ready, instead of swapping the page for the fallback. Use `isPending` for a small loading hint. This turns a flash of spinner into a smooth route change.

### 13.4 Virtualization (Large Lists)

For thousands of items, virtualization renders only the rows in the viewport, which keeps the DOM small and scrolling smooth.

**How it works.** The virtualizer tracks three numbers: total list height, scroll offset and viewport height. From them it computes the visible `[startIndex, endIndex]` range plus an "overscan" buffer (3–5 rows) above and below to hide scroll latency. Only rows in that range get React elements. The DOM has two layers: an outer scroll container sized to the **full virtual height** (`5000 items × 50px = 250000px`, so the scrollbar is right) and inner rows absolutely positioned at `top = item.start`. Scrolling is plain CSS; React re-renders only when the visible range changes.

**Fixed vs dynamic height.** With a fixed height, `start = index × itemHeight`, so the range is O(1) and the scrollbar exact. With dynamic heights you give an *estimate*; the virtualizer measures real rows as they render and corrects offsets, so the scrollbar can drift as unmeasured rows come into view, and jumping to row 9,000 is a guess until it is measured.

```
| Library                    | Size    | API style    | Strengths                              |
|----------------------------|---------|--------------|----------------------------------------|
| react-window               | ~5 KB   | Component    | Smallest, predictable, fixed/variable  |
| @tanstack/react-virtual    | ~5 KB   | Hook (headless)| Most flexible; works in any container|
| react-virtualized          | ~34 KB  | Component    | Most features (CellMeasurer, AutoSizer)|
| react-virtuoso             | ~30 KB  | Component    | Best dynamic-height + grouped lists    |
```

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

**Gotchas:**

- **Overscan:** too small flickers on fast scroll, too large wastes DOM. Start at 5.
- **Stable keys:** index keys plus delete make content "stick" to the wrong row ([§14.4](#144-why-list-keys-matter-at-the-algorithm-level)).
- **Jump to item:** use the virtualizer's `scrollToIndex(i)`; setting `scrollTop` directly skips its measurement cache.
- **Infinite scroll:** an `IntersectionObserver` on a sentinel near the end of the rendered window (or `react-window-infinite-loader`).
- **CSS `content-visibility: auto`** is the platform alternative: the browser skips layout and paint for offscreen elements, but React still renders all of them.

**When not to virtualise.** Rows that are not rendered break find-in-page (Ctrl/Cmd+F), hide the row count from screen readers unless you add `aria-rowcount`/`aria-setsize`, and need code before an anchor link can scroll to them. Virtualise when a list can realistically reach several hundred rows or the Profiler shows it dominating an interaction; a 30-row list gains nothing.

### 13.5 Concurrent Features (`useTransition`, `useDeferredValue`)

React 18's concurrent renderer lets you mark some updates as **non-urgent** so the browser stays responsive while heavy rendering happens. Before React 18, a render could not be interrupted: a 200 ms render blocked the keystroke that caused it from painting for 200 ms. The concurrent renderer can pause, abandon and restart work, and a scheduler gives each update a priority:

```
| Priority         | Triggered by                                    | Example                  |
|------------------|-------------------------------------------------|--------------------------|
| Sync / discrete  | Direct user input — clicks, keystrokes, focus   | setState in onChange     |
| Default          | Network responses, timers, normal setState      | setState after fetch     |
| Transition       | Wrapped in startTransition, or useDeferredValue | Slow filter, route change|
```

Higher-priority work preempts lower. If the user types again mid-transition, React **discards the in-progress render** and restarts with the latest state. So concurrent features don't make work faster; they make *rendering* interruptible, so urgent work is never starved. The function you pass to `startTransition` itself still runs synchronously; only the re-render it schedules can be interrupted, which is why the slow work below lives in render (inside `useMemo`), not in the event handler.

**`isPending`** is `true` from the moment `startTransition` queues the work until that work commits. It updates in the urgent lane, so you can show a spinner without bringing the lag back.

**Lanes.** Priorities are bits in a 31-bit bitmap, so merging lanes, finding the highest pending lane and clearing one after commit are single bitwise operations. A click during a long transition preempts it, and the transition then *restarts* rather than resumes, which is why concurrent rendering is called interruptible, not resumable.

**Time slicing — the 5 ms yield.** React renders for about **5 ms**, then yields by scheduling its continuation as a new task with `MessageChannel.postMessage`. That is a regular task, not a microtask (a microtask would run before the browser could paint), and React prefers it to `setTimeout(fn, 0)` because nested timeouts are clamped to about 4 ms. Between slices the browser handles input and paints, so a 200 ms render no longer freezes the page. Interruption is safe because React renders into a separate work-in-progress tree ([§14.5](#145-fiber-the-data-structure-that-makes-interruption-possible)).

```tsx
import { useState, useTransition, useDeferredValue, useMemo } from 'react';

type Product = { name: string };
const PRODUCTS: Product[] = Array.from({ length: 5000 }, (_, i) => ({ name: `Product ${i}` }));

function ProductList({ items }: { items: Product[] }) {
  return <ul>{items.slice(0, 50).map(p => <li key={p.name}>{p.name}</li>)}</ul>;
}

// Option A — useTransition: you own the slow state update.
function SearchWithTransition({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');           // urgent: what the input shows
  const [filterText, setFilterText] = useState(''); // non-urgent: what the list filters by
  const [isPending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);                              // input stays snappy
    startTransition(() => setFilterText(e.target.value));  // next keystroke can interrupt this
  }

  const filtered = useMemo(
    () => products.filter(p => p.name.includes(filterText)),
    [products, filterText],
  );

  return (
    <>
      <input value={query} onChange={onChange} />
      {isPending && <span>Updating…</span>}
      <ProductList items={filtered} />
    </>
  );
}

// Option B — useDeferredValue: defer the value instead of the setter.
function SearchWithDeferredValue({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);   // lags behind query while React is busy
  const filtered = useMemo(
    () => products.filter(p => p.name.includes(deferredQuery)),
    [products, deferredQuery],
  );

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {query !== deferredQuery && <span>Updating…</span>}
      <ProductList items={filtered} />
    </>
  );
}

function Demo() {
  return (
    <>
      <SearchWithTransition products={PRODUCTS} />
      <SearchWithDeferredValue products={PRODUCTS} />
    </>
  );
}

render(<Demo />);
```

`useTransition` wraps **state setters**, which is why Option A needs two pieces of state: one for the input (urgent) and one for the list (non-urgent). `useDeferredValue` wraps a **value**, useful when the slow consumer isn't yours to wrap. It has no `isPending`; `query !== deferredQuery` gives the same signal.

**`useOptimistic` — show the expected result while an action runs.** New in React 19. It only works inside an Action or a transition; called from a plain `async` function, React logs "An optimistic state update occurred outside a transition or action" and the value never shows. When the action finishes, the optimistic value is **always** replaced by the real state, on success and on failure alike. If the save failed, the real state never changed, so the item simply disappears; there is no separate rollback step. Full treatment: [§16.5](/frontend/react-19-patterns#165-useoptimistic).

```tsx
// Stand-in for a real API call: resolves after one second.
const server = { create: (text: string) => new Promise(resolve => setTimeout(resolve, 1000)) };

type Todo = { id: string; text: string; pending?: boolean };
let nextId = 2;

function Todos() {
  const [todos, setTodos] = useState<Todo[]>([{ id: '1', text: 'Buy milk' }]);
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (state: Todo[], newTodo: Todo) => [...state, { ...newTodo, pending: true }],
  );

  function handleAdd() {
    const id = nextId++;
    const text = `Todo ${id}`;
    startTransition(async () => {
      addOptimistic({ id: `temp-${id}`, text });  // shows at once, marked pending
      await server.create(text);
      // State set after an await needs its own transition.
      startTransition(() => setTodos(prev => [...prev, { id: String(id), text }]));
    });
  }

  return (
    <>
      <button onClick={handleAdd}>Add</button>
      <ul>
        {optimisticTodos.map(t => <li key={t.id}>{t.text}{t.pending && ' (sending…)'}</li>)}
      </ul>
    </>
  );
}
```

**Tearing — and why `useSyncExternalStore` exists.** Because a render can pause mid-tree, two components can read an external store (Zustand, Redux) on either side of a store update and show different values: the UI is "torn". `useSyncExternalStore` prevents it. React calls your `getSnapshot` on **every render** (which is why it must return a cached value, not a new object each call), and if the snapshot changes during a concurrent render React re-renders synchronously so every component sees one value. Modern Zustand and React-Redux already use it; reach for it directly only when writing a store ([§6.2](/frontend/react#usesyncexternalstore-subscribe-to-a-non-react-store)).

### 13.6 Profiling and Measuring Performance

You can't fix what you can't see. Use the tool for the layer you're investigating:

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

The React DevTools Profiler records a session of renders as a flamegraph; yellow and red bars are the slow components. "Ranked" sorts by duration, and the "Why did this render?" setting annotates each render with the prop, state or hook that changed.

**A profiling session that finds the real problem:**

1. **Record an interaction, not the page load.** The slowness users complain about is usually typing, filtering or switching tabs.
2. **Rank by render time, not render count.** Forty 1 ms renders are not the problem; two 80 ms renders are.
3. **Read *why* each slow component rendered.** A parent re-render, a new reference with an equal value, and a context change each have a different fix ([§13.7](#137-common-re-render-causes-and-fixes)).
4. **Check the browser's Performance panel too.** The Profiler shows React's work only; a long task (over 50 ms) in layout, style or a third-party script won't appear in it.
5. **Change one thing, then record again.** An unmeasured fix is a guess, and memoization can make things slower (Q64 in [React Interview Questions](/frontend/react-interview-questions)).

**Render vs commit.** The flamegraph bars are **render-phase** time per component (calling your functions and reconciling); the commit duration (DOM mutation, `useLayoutEffect`) sits at the top. Work inside `useEffect` doesn't show on the component's bar, because effects usually run after paint (an Effect caused by a click or keypress can run before it, [§7.1](/frontend/react#71-useeffect)). For effect-heavy bottlenecks use the Chrome Performance tab.

**Actual vs base duration.** *Actual* is how long this render took; *base* is how long the subtree would take with no memoization. If base ≈ actual, your memoization isn't skipping anything, which usually means a reference-equality bug in props.

**Core Web Vitals.** LCP (load), INP (responsiveness, replaced FID in March 2024) and CLS (visual stability) are owned by the [Web Performance guide](/frontend/web-performance#2-the-core-web-vitals). The React-specific point: long renders, expensive handlers and hydration are what spike INP, and Lighthouse can't measure INP because it makes no real interactions, so collect it from real users with the `web-vitals` library:

```tsx
import { onCLS, onINP, onLCP } from 'web-vitals';

function send(metric: { name: string; value: number; id: string }) {
  navigator.sendBeacon('/analytics', JSON.stringify(metric));
}

onCLS(send);
onINP(send);
onLCP(send);
```

`<Profiler>` is the in-app equivalent of the DevTools Profiler: wrap a subtree to measure its render durations in code, useful for synthetic perf tests.

```tsx
// Stand-in for an expensive subtree
function ProductGrid() {
  return <ul>{Array.from({ length: 500 }, (_, i) => <li key={i}>Product {i}</li>)}</ul>;
}

function Demo() {
  return (
    <Profiler id="ProductGrid" onRender={(id, phase, actual, base) => {
      console.log(id, phase, actual, base);
    }}>
      <ProductGrid />
    </Profiler>
  );
}

render(<Demo />);
```

### 13.7 Common Re-render Causes (and Fixes)

Most "React is slow" complaints trace back to a few patterns, and **the underlying cause is almost always reference equality.** React compares props, state and context values with `Object.is`, and two object literals with the same contents are different references:

```js
console.log({ a: 1 } === { a: 1 });   // false — different references
```

So `<Child style={{ color: 'red' }} />` creates a new object on every parent render, and `React.memo` on `Child` sees a changed prop. The same goes for array literals, inline functions and the `value={{...}}` you hand a Context Provider. `useMemo`, `useCallback`, hoisting constants and splitting context all exist to keep those references stable.

**By default, React does not memoize.** A parent re-render re-renders all its children, transitively, whether or not their props changed. `React.memo` opts one component into a shallow prop check; the React Compiler flips the default by inserting memoization for you. When a top-level provider value or route changes, everything below renders, so the structural fix is to move state down (co-location) or split the provider.

```
| Cause                                          | Fix                                              |
|------------------------------------------------|--------------------------------------------------|
| Inline object/array prop: <X style={{...}} />  | Hoist constant, or useMemo it                    |
| Inline callback to memoized child              | useCallback (or move handler to leaf)            |
| Context value changes on every parent render   | useMemo the value object; split into 2 contexts  |
| Anonymous function inside .map() in deps       | Hoist or useCallback                             |
| setState with a new object, same contents      | Pass back the same object; a copy always renders |
| Parent re-renders entire subtree on URL change | Move route boundaries closer to the leaf         |
| Tall provider tree wrapping the whole app      | Co-locate providers; consider Zustand/Jotai     |
```

On the `setState` row: the bail-out uses `Object.is`, so passing back the **same reference** (primitive or unchanged object) skips the render, while a new object with identical contents (`setUser({ ...user })`) does not.

The classic Context fan-out trap — every consumer re-renders when *any* field of `value` changes:

```tsx
const AppContext = React.createContext<unknown>(null);
const AuthContext = React.createContext<unknown>(null);
const ThemeContext = React.createContext<unknown>(null);

function Bad({ user, theme, setTheme, children }: {
  user: string; theme: string; setTheme: (t: string) => void; children: React.ReactNode;
}) {
  // A new object every render, so EVERY consumer re-renders even when
  // user and theme are unchanged.
  return <AppContext.Provider value={{ user, theme, setTheme }}>{children}</AppContext.Provider>;
}

function Good({ user, theme, setTheme, children }: {
  user: string; theme: string; setTheme: (t: string) => void; children: React.ReactNode;
}) {
  // Memoize, and split unrelated state into separate contexts so a theme
  // change does not wake up components that only read the user.
  const auth = useMemo(() => ({ user }), [user]);
  const themeCtx = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return (
    <AuthContext.Provider value={auth}>
      <ThemeContext.Provider value={themeCtx}>{children}</ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

// Demo so the example runs on its own
function Demo() {
  const [theme, setTheme] = useState('light');
  return (
    <Good user="Ada" theme={theme} setTheme={setTheme}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Theme: {theme}</button>
    </Good>
  );
}
render(<Demo />);
```

### 13.8 Image and Asset Optimization

Images are usually the biggest payload on a page and the hero image is usually the LCP element, so its download time is your LCP. The browser-level rules (formats, `srcset`/`sizes`, priorities, preloading) are owned by the Web Performance guide's [§6 Images and Media](/frontend/web-performance#6-images-and-media) and [§5 Resource Hints and Priorities](/frontend/web-performance#5-resource-hints-and-priorities). What each attribute does, in one line:

| Attribute | What it does |
|---|---|
| `width` / `height` | Reserve the box before the image loads, so nothing shifts (CLS) |
| `loading="lazy"` | Defer the fetch until the image nears the viewport. Never on the LCP image |
| `decoding="async"` | Decode off the main thread so a large image doesn't stall input |
| `fetchPriority` | Chrome loads images at Low priority by default and, since Chrome 117, boosts the first five large images to Medium. `"high"` raises the LCP image to High; `"low"` demotes decorative ones |
| `srcSet` / `sizes` | Let the browser pick the smallest file that is sharp at the device's pixel ratio |
| `<link rel="preload" as="image">` | Start the LCP image's request with the HTML, before a client-rendered `<img>` exists |

In JSX the attribute is camelCase, `fetchPriority`.

```tsx
// An OFFSCREEN image: native lazy-loading + explicit dimensions to prevent CLS.
// (Not the hero: the LCP image must never be lazy — see the preload below.)
const belowTheFold = (
  <img
    src="/team-photo.webp"
    width={1200}
    height={630}
    loading="lazy"          // defer offscreen images
    decoding="async"        // don't block the main thread on decode
    alt="Our team"
  />
);

// Responsive images — the browser picks the smallest file that fits
const responsive = (
  <img
    srcSet="/hero-480.webp 480w, /hero-960.webp 960w, /hero-1920.webp 1920w"
    sizes="(max-width: 600px) 480px, 960px"
    src="/hero-960.webp"
    alt="Hero"
  />
);

// Preload the LCP image so it starts downloading with the HTML.
// NOTE: never `loading="lazy"` on the LCP image — the two work against
// each other.
const preload = <link rel="preload" as="image" href="/hero.webp" fetchPriority="high" />;
```

Other low-effort wins: serve WebP/AVIF, and self-host fonts with `font-display: swap` (or use `next/font` / `@fontsource`).

### 13.9 Build Tools — Webpack vs Vite

This is bundler territory, owned by the [Frontend Tooling guide](/frontend/tooling): how Vite serves native ES modules in development ([§3.3](/frontend/tooling#33-why-vite-is-fast-native-es-modules)), pre-bundles dependencies ([§3.4](/frontend/tooling#34-esbuild-pre-bundling)), the side-by-side comparison ([§4](/frontend/tooling#4-webpack-vs-vite-comparison)), and Vite 8 replacing esbuild and Rollup with Rolldown ([§9.1](/frontend/tooling#91-vite-8-and-rolldown-one-bundler-instead-of-two)). The React-specific part is small: `@vitejs/plugin-react` adds JSX transform and **Fast Refresh**, which hot-swaps an edited component while keeping its state, and a `manualChunks` entry for `react`/`react-dom`/the router puts React in its own long-cached vendor chunk.

### 13.10 Bundle Analyzers

An analyzer (`rollup-plugin-visualizer`, `webpack-bundle-analyzer`, `source-map-explorer`) draws the production bundle as a treemap so you can see *which module* is big; optimise for the gzip/Brotli size, which is what goes over the network. How to run one and enforce a budget in CI is in the Web Performance guide ([§8.1](/frontend/web-performance#81-reducing-the-payload), [§13](/frontend/web-performance#13-budgets-and-ci)). In a React app, look for: **two copies of React** (a library that bundles its own, which also breaks hooks), whole icon packs imported for a few icons, `moment` or full `lodash`, a heavy editor/chart/map that should be lazy ([§13.3](#133-code-splitting-lazy-loading)), and markdown or JSON content bundled into JS instead of fetched.

### 13.11 Tree Shaking and Code Splitting at Build Time

#### Tree Shaking — the theory

Tree shaking drops unused exports at build time. It needs ES modules (static `import`, not `require`), a `sideEffects` field in `package.json`, and no barrel file that pulls in everything. Full treatment, including what breaks it: [Frontend Tooling §2.9](/frontend/tooling#29-tree-shaking). For React code, the usual culprits are `import _ from 'lodash'` (use `lodash-es` or native methods) and `import * as Icons` with `Icons[name]`, which the bundler cannot prune.

#### Code Splitting — the theory

Code splitting emits several chunks so the browser fetches each only when needed; in React the split point is a `React.lazy(() => import(...))` ([§13.3](#133-code-splitting-lazy-loading), which also covers the waterfall trap and `startTransition` + lazy). How bundlers create and name chunks, and vendor-chunk configuration: [Frontend Tooling §2.8](/frontend/tooling#28-code-splitting).

### 13.12 Server Components, SSR, and Streaming

Every kilobyte of JavaScript has to be downloaded, parsed and executed before the page responds, and on a mid-range phone parse-and-execute is often the slow part. So the most reliable way to speed up a React page is to send less JavaScript. Server-side rendering and React Server Components (RSC, components that run only on the server) are React's tools for that. Frameworks such as Next.js (App Router), Remix and TanStack Start wire them up; framework specifics such as caching, ISR and file conventions are in the [Next.js & RSC guide](/frontend/nextjs-rsc).

**Three rendering models:**

```
| Model       | Where it runs        | What ships to browser              | What the user sees first            |
|-------------|----------------------|-------------------------------------|-------------------------------------|
| CSR (SPA)   | Browser only         | JS bundle + tiny HTML shell        | Blank page until JS loads & renders |
| SSR         | Server, then browser | Pre-rendered HTML + JS for hydration | HTML immediately, interactive after JS |
| RSC + SSR   | Server only (RSC parts) | HTML + JS only for client comps  | HTML immediately; some parts never need JS |
```

**Classic SSR — the hydration tax.** The server renders the tree to HTML and the browser shows it at once (good LCP). Then React must **hydrate**: re-render the same tree in the browser to attach event listeners to the existing DOM. You ship the HTML *and* every component's JS, and the page is visible but not interactive until hydration finishes.

**React Server Components — what they fix.** RSCs run **only on the server** and never ship their JS. Their output is a serialized description of the rendered tree (the RSC payload, not HTML) that React in the browser stitches together with Client Components. Three consequences:

1. **Zero JS for non-interactive subtrees.** A product list or a markdown post never needed event handlers; its code, dependencies and data fetching stay on the server.
2. **Direct backend access.** An RSC can `await db.query(...)`, read secrets and use Node-only APIs, with no API layer in between.
3. **Composition with Client Components.** A Server Component can render a `'use client'` Client Component. A Client Component can't *import* a Server Component, but it can receive one as `children` (or any prop) from a Server Component parent and render it ([Next.js §2.4](/frontend/nextjs-rsc#24-the-composition-rule)).

```text
// Server component — runs on the server, ships zero JS
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

**Streaming SSR.** `renderToPipeableStream` (Node) and `renderToReadableStream` (Web streams, edge runtimes) flush HTML as it is generated instead of buffering the whole document. Each `<Suspense>` boundary sends its fallback first; when its data resolves, the real markup streams over the same response and React swaps it in. No second request, and the page no longer waits for its slowest query.

**Selective hydration (React 18).** Before 18, the server waited for *all* data and the client hydrated the whole tree in one go, so one slow API or one heavy bundle blocked everything. Now `hydrateRoot` hydrates each Suspense boundary independently, and React **prioritizes the boundary the user just interacted with**: click a comment thread before its code arrives and React moves that boundary to the front of the queue. The click responds as soon as that code is ready, not after the whole page hydrates.

```tsx
const Header = () => <header>Site header</header>;
const CommentsSkeleton = () => <p>Loading comments…</p>;
const RecsSkeleton = () => <p>Loading recommendations…</p>;
const Comments = ({ postId }: { postId: number }) => <p>Comments for {postId}</p>;
const Recommendations = ({ userId }: { userId: string }) => <p>Recs for {userId}</p>;
const user = { id: 'u1' };

// Each boundary streams independently — the shell arrives first, and slow
// sections fill in as their data resolves.
function Page() {
  return (
    <>
      <Suspense fallback={<Header />}>           {/* ships immediately */}
        <Header />
      </Suspense>
      <Suspense fallback={<CommentsSkeleton />}>  {/* streams when comments resolve */}
        <Comments postId={42} />
      </Suspense>
      <Suspense fallback={<RecsSkeleton />}>      {/* streams when recommendations resolve */}
        <Recommendations userId={user.id} />
      </Suspense>
    </>
  );
}
```

Each Suspense boundary is therefore a data-loading unit, a streaming unit and a hydration unit. Design them around *user goals* (header, content, comments, sidebar), not technical layers.

**Beyond React: progressive hydration, islands, resumability.** Progressive hydration defers hydrating a widget until it is visible, idle or touched (Astro's `client:visible`, `client:idle`, and `client:only` to skip server rendering entirely). Islands architecture (Astro, Fresh, Marko) ships plain HTML with small, independently hydrated interactive "islands" and no root React tree; Qwik goes further with *resumability*, attaching listeners lazily with no hydration at all. These suit content-first sites; React's selective hydration covers most of the same ground for app-like pages.

```
| Approach              | Initial JS payload         | Best for                           |
|-----------------------|----------------------------|------------------------------------|
| SPA (CSR)             | Whole app                  | Highly interactive dashboards      |
| SSR + full hydration  | Whole app + serialized data| Mixed-interactive content sites    |
| RSC + selective hyd.  | Only Client Components     | Modern data-heavy apps             |
| Islands               | Only the islands           | Content-first sites (blogs, docs)  |
| Resumable (Qwik)      | ~0KB until interaction     | Same as Islands, even leaner       |
```

**SSG and ISR** are framework features. ISR (incremental static regeneration) is stale-while-revalidate: after the `revalidate` window, the first visitor still gets the cached page immediately while it regenerates in the background, and the *next* visitor gets the fresh one. On demand, `revalidatePath('/blog/my-post')` refreshes one post, while `revalidatePath('/blog/[slug]', 'page')` refreshes every post; in Next.js 16, `revalidateTag('posts', 'max')` takes a cache-profile second argument (the single-argument form is deprecated). The full strategy table, PPR and the three invalidation APIs are in the Next.js guide's [§5](/frontend/nextjs-rsc#5-rendering-strategies) and [§6.3](/frontend/nextjs-rsc#63-the-three-invalidation-apis).

Pick by what dominates the page: **mostly static** → SSG or islands; **personalised per request** → SSR or RSC; **high-traffic catalogue with periodic updates** → ISR; **highly interactive dashboard** → CSR with route-level lazy loading. Most apps mix several. Even without RSC, SSR improves LCP on content-heavy pages at the cost of TTFB, so measure before adopting.

### 13.13 Performance Rules

1. Don't optimise prematurely: re-rendering is cheap, and React only touches the DOM where output changed.
2. Profile an interaction first ([§13.6](#136-profiling-and-measuring-performance)).
3. Stabilise objects and functions only when they feed a memoized child or effect deps ([§13.2](#132-usememo-and-usecallback)).
4. Key lists by stable id ([§14.4](#144-why-list-keys-matter-at-the-algorithm-level)).
5. Co-locate state; memoize and split Context values ([§13.7](#137-common-re-render-causes-and-fixes)).
6. Code-split routes and heavy widgets, and avoid lazy waterfalls ([§13.3](#133-code-splitting-lazy-loading)).
7. Virtualise lists that reach several hundred rows ([§13.4](#134-virtualization-large-lists)).
8. Use `useTransition` / `useDeferredValue` for slow state-derived UI ([§13.5](#135-concurrent-features-usetransition-usedeferredvalue)).
9. Never lazy-load the LCP image; give images dimensions ([§13.8](#138-image-and-asset-optimization)).
10. Run a bundle analyzer when a dependency is added and enforce a size budget in CI ([§13.10](#1310-bundle-analyzers), [§15.12](/frontend/react-19-patterns#1512-cicd-lint-type-check-and-test-on-every-pull-request)).
11. Track INP, LCP and CLS from real users.
12. Prefer Server Components for non-interactive, data-heavy UI ([§13.12](#1312-server-components-ssr-and-streaming)).

---

## 14. Reconciliation and Fiber

This section is the "what is actually happening when React renders" deep dive. If you only ever use `useState` and JSX, you can skip it; if you debug perf bugs or get asked "explain reconciliation" in interviews, it's the most useful section in the guide.

### 14.1 The Render → Reconcile → Commit pipeline

Every React update goes through three phases. Conflating them is the #1 source of mental-model bugs:

1. **Render phase** — React calls your component functions, building a *new* tree of plain JS objects (React elements). Pure: no DOM mutation, no effects, no side effects of yours allowed.
2. **Reconciliation** — React compares ("diffs") the new element tree against the previous fiber tree to figure out what actually changed.
3. **Commit phase** — React applies the diff to the real DOM and runs `useLayoutEffect` synchronously, before the browser paints. `useEffect` usually runs after paint, though an Effect caused by a click or keypress can be flushed before it.

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

The visible result: every row's props "changed," so every memoization is invalidated and the whole list re-renders. Worse, each row's **local state stays with its position**, not its data: if row 0 had a half-typed input or an open menu, after the prepend that state now sits on the new item, and every other row's state is shifted by one. With `key={item.id}`, React matches by identity — the new item gets a fresh mount, the rest are untouched, and `React.memo` or `useMemo` work as designed.

### 14.5 Fiber — the data structure that makes interruption possible

Pre-React-16, reconciliation was implemented as **recursive synchronous tree traversal**. Each component's render call sat on the JavaScript call stack. The call stack is opaque — you can't pause it, save it, or restart it — so a render had to run to completion or not at all. A 200ms render meant a 200ms blocked main thread.

React 16's Fiber rewrote the call stack as a **linked list of plain JS objects**. Each fiber has pointers to its `child`, `sibling`, and `return` (parent), plus state about its work-in-progress. Walking the tree is now an iterative loop — at any iteration, React can save its position and yield to the browser:

```js
// Conceptual shape of a fiber node (field names are React's, values elided)
const fiber = {
  type: 'Profile',          // function ref or DOM tag
  stateNode: null,          // the actual instance / DOM node
  child: null,              // tree pointers
  sibling: null,
  return: null,             //   ↑ parent
  pendingProps: {},         // input for this render
  memoizedProps: {},        // input from the last committed render
  memoizedState: null,      // the hooks linked list
  alternate: null,          // counterpart in the other tree (double-buffering)
  flags: 0,                 // bitmask of work to do (Placement, Update, Deletion…)
  lanes: 0,                 // priority bitmap
};
```

**Why every field matters:**

- **`child`/`sibling`/`return`** — iterative tree walk; React can pause and the next slice picks up at this fiber.
- **`alternate`** — the **double-buffer** pointer. React keeps two trees: the *current* tree (what is on screen) and a *work-in-progress* tree (what is being computed), and each fiber points to its counterpart. When a render completes, React swaps `current = workInProgress` in O(1). If an urgent update interrupts, the work-in-progress tree is simply thrown away and the screen is untouched.
- **`pendingProps` vs `memoizedProps`** — enables the "bail out" optimization. If pending equals memoized (and there are no pending hooks updates), React skips re-rendering this fiber entirely.
- **`flags`** (formerly `effectTag`) — bitmask of what needs to happen at commit time. Placement = insert into DOM, Update = mutate DOM, Deletion = remove. Set during the render phase, applied during commit.
- **`lanes`** — which priority lanes have pending work in this subtree ([§13.5](#135-concurrent-features-usetransition-usedeferredvalue)). Used by the scheduler to pick which fiber to work on next.

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

Between fibers the loop checks `shouldYield()`; after about 5 ms it yields to the browser ([time slicing, §13.5](#135-concurrent-features-usetransition-usedeferredvalue)). The interrupted position is just a pointer in the work-in-progress tree, so picking up next time costs nothing.

### 14.7 Practical implications

1. **Don't redeclare components inside other components.** Each parent render creates a *new* function reference, which Fiber sees as a new `type`, which triggers unmount + remount of every instance. The bug looks like "my input loses focus on every keystroke."

   ```jsx
   // BAD — type a letter: the input loses focus after every keystroke
   function Parent() {
     const [text, setText] = useState('');
     const Input = () => <input value={text} onChange={(e) => setText(e.target.value)} />; // new ref every render → remount
     return <Input />;
   }
   render(<Parent />);
   ```

2. **Mounting is expensive; updating is cheap.** A change that flips the type unmounts the entire subtree. If you can preserve the type and just change props, do.

3. **Stable list keys are a correctness rule, not just a perf rule.** Index keys silently corrupt component state when items reorder.

4. **`React.memo` is a fiber-level bailout opt-in.** It compares incoming props against `memoizedProps` shallowly; if equal, the begin phase short-circuits the subtree. Without `memo`, React re-runs the function but the bailout logic in Fiber may still skip some work via `pendingProps === memoizedProps` reference equality.

5. **The Profiler's "actual" vs "base" duration** ([§13.6](#136-profiling-and-measuring-performance)) map to fiber-level cost: actual is time spent after bailouts, base is the cost with none. The gap is what your memoization saves.
