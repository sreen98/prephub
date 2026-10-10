# React — Tricky Output Questions

Predict-the-output puzzles on batching, closures, effects and rendering, each with a line-by-line explanation.

Part of the React series: [React Guide](/frontend/react) · [React Performance & Internals](/frontend/react-performance) · [React 19 & Patterns](/frontend/react-19-patterns) · [React Interview Questions](/frontend/react-interview-questions) · **React Tricky Questions**

---

## Table of Contents

- [18. Tricky Output Questions](#18-tricky-output-questions)

---

## 18. Tricky Output Questions

Practice questions testing your understanding of React rendering behavior, hooks quirks, state batching, and closures. Every output below was produced by running the code on React 19.3.

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

**Output:** `0` (on first click). **Rendered value:** `1`

**Why:** `count` is a constant captured when this render ran, so all three calls are `setCount(0 + 1)`: three queued "set to 1" updates, batched into one re-render. The `console.log` runs inside the same handler, before that re-render, and reads this render's `0`. To increment three times, use a functional updater (Q2). → [§5.2 State Update Rules](/frontend/react#52-state-update-rules)

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

**Why:** an updater function doesn't read the closure. React queues the three functions and, during the next render, feeds each one the result of the previous: 0 → 1 → 2 → 3. Still one render, but the updates compound.

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

  return <button onClick={handleClick}>{count}</button>;
}
```

**Rendered value after first click:** `1`

**Why:** React processes the queue in order, starting from `0`:

| Call | Queued as | Pending state after it |
|---|---|---|
| `setCount(count + 1)` | "set to 1" (closure `count` is `0`) | 1 |
| `setCount(prev => prev + 1)` | updater | 2 |
| `setCount(count + 1)` | "set to 1" again | 1 |

A direct value overwrites whatever earlier updaters built up, so don't mix the two styles for one piece of state.

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

**Why:** every update made in one event is batched into a single render, so the five updaters run back to back (0 → 5) and the component renders once. Since React 18 this automatic batching also covers timeouts, promises and native event handlers, not only React event handlers.

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

**Why:** the function body runs top to bottom during render; `useEffect` only *registers* each effect. After the commit, effects run in declaration order (`B`, then `D`). A cleanup runs before the effect's next run or on unmount, so `C` never appears on mount. Effects usually run after the browser paints, but an effect caused by an interaction such as a click may run before paint; if code must run before paint, use `useLayoutEffect`. → [§7.1 useEffect](/frontend/react#71-useeffect)

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

**Console output:** `0, 0, 0, 0, ...` (repeats forever). **Rendered value:** stuck at `1`

**Why:** with `[]` the effect runs once, so the interval callback is the first render's closure, where `count` is `0`. Every tick calls `setCount(1)`; after the first, the value is unchanged and React skips the render (Q12). Fix: `setCount(prev => prev + 1)`, which doesn't need `count` at all, or read the latest value from a ref.

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

**Why:** React compares each dependency with `Object.is`, which compares objects by reference. The literal creates a new object every render, so the dependency always "changed", exactly as if there were no array. Depend on primitives (`[config.key]`), move the object outside the component, or memoise it.

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

**Console output (1s later):** `0`. **Rendered value:** `5`

**Why:** state is a snapshot per render. The timeout callback was created in the render where `count` was `0`; the re-render creates a *new* `count` binding (`5`) but cannot change the old one. To read the latest value in an async callback, keep it in a ref. Same mechanism as Q6.

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

**Why:** writing `ref.current` doesn't tell React anything, so nothing re-renders. The unrelated state update causes a render, which reads the ref and finds `3`. That is why refs suit values that shouldn't drive the UI (timer ids, DOM nodes), and why reading them during render is discouraged.

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

**Why:** rendering a component renders every child it returns, props or no props. The diff then finds nothing to change in the DOM, but `Child()` still runs. Only `React.memo(Child)` lets it skip, and for a component this cheap it isn't worth it. → [§13.1 React.memo](/frontend/react-performance#131-reactmemo)

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

**Why:** `React.memo` compares each prop with `Object.is`. `{ color: "red" }` is a new object every render, so the comparison fails and the memo does nothing except cost a comparison. Lift the object to module scope, `useMemo` it, or pass a primitive (`color="red"`). Inline functions break memo the same way (Q17).

---

**Q12: A button's click handler calls `setCount(0)` while the state is already `0`. Does the component re-render?**

```jsx
let renders = 0;

function App() {
  const [, setCount] = useState(0);
  renders++;
  console.log("rendered", renders);

  return <button onClick={() => setCount(0)}>Click (renders: {renders})</button>;
}

render(<App />);
```

**Output:** `rendered 1` on mount, and **nothing at all** on any click.

**Why:** when the component has no pending work, `setCount` computes the next state at once, inside the call, and `Object.is(0, 0)` lets it drop the update: nothing is queued or rendered. If the component already has pending updates, React can't compare early, so it renders the component, sees the state is unchanged, and skips the children. That is why the docs say React "may still need to render that specific component". So: usually zero renders, but don't rely on either outcome.

The same `Object.is` check is why mutating an object and passing the same reference does nothing:

```text
// ✗ Silently does nothing — same reference, so Object.is says "unchanged"
user.name = 'Ada';
setUser(user);

// ✓ New reference, so React sees a change
setUser({ ...user, name: 'Ada' });
```

---

**Q13: An `<Input />` component with its own internal `text` state is rendered as `<Input key={id} />`. When the parent increments `id`, what happens to the input's current value and does `Input` log "mounted" again?**

```jsx
function Input() {
  const [text, setText] = useState("");
  useEffect(() => { console.log("Input mounted"); }, []);

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

**On clicking "Reset":** the input field clears, and the console logs `Input mounted` again.

**Why:** a different `key` means a different component instance. React unmounts the `key={1}` Input (its state and DOM node go) and mounts a fresh `key={2}` one, so `text` starts at `""` and the mount effect runs again. Changing the key is the idiomatic way to reset a subtree; `key={Math.random()}` does it on every render by accident. → [§9.2 Lists](/frontend/react#92-lists)

---

### Hooks Rules & Gotchas

**Q14: A component calls `useState` inside an `if (showName)` branch between two other `useState` calls. What goes wrong when `showName` toggles from `true` to `false` across renders?**

```jsx
function App({ showName }) {
  const [count, setCount] = useState(0);

  if (showName) {
    const [name, setName] = useState("React");   // ← the conditional hook
  }

  const [age, setAge] = useState(25);

  return <p>{count} {age}</p>;
}

// The bug only fires when showName CHANGES, so this harness toggles it.
// First render runs 3 hooks; after the click, 2. React throws on that render.
function Demo() {
  const [showName, setShowName] = useState(true);
  return (
    <>
      <button onClick={() => setShowName(s => !s)}>
        showName is {String(showName)} — click to break it
      </button>
      <App showName={showName} />
    </>
  );
}

render(<Demo />);
```

**Output:** renders `0 25`, then throws **"Rendered fewer hooks than expected"** when you toggle. Press **Try it** and click the button; the error is the point.

**Why:** React identifies hooks by call order, not by name. The first render stores three slots (count, name, age); the second calls only two, so React detects the mismatch and throws. Keep every hook call unconditional and put the condition inside the value or the JSX. → [§6.1 Rules of Hooks](/frontend/react#61-rules-of-hooks)

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

**Why:** when a dependency changes, React runs the *previous* effect's cleanup, then the new effect. Each cleanup closes over the `count` of the render that created it, so it cleans up exactly what that render set up.

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

**Why:** passing the function itself is *lazy initial state*: React calls it once, on mount, and ignores it afterwards. `useState(expensiveInit())` would call it on every render and throw the result away. `useReducer`'s third argument works the same way.

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

render(<Parent />);
```

**Output:** `Child render` logs on mount and then **again on every click**.

**Why:** `data` is stable (state keeps the same array), but `handleSelect` is a new function object every render, so memo's shallow compare fails on `onSelect`. The minimum fix is `useCallback`:

```jsx
const Child = React.memo(function Child({ data, onSelect }) {
  console.log("Child render");
  return <ul>{data.map(u => <li key={u.id} onClick={() => onSelect(u)}>{u.name}</li>)}</ul>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [users] = useState([{ id: 1, name: "Ana" }]);

  // ✓ The same function object across renders, so memo's shallow compare passes.
  const handleSelect = useCallback((u) => { console.log(u); }, []);

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <Child data={users} onSelect={handleSelect} />
    </>
  );
}

render(<Parent />);
```

`Child render` now logs **once**, on mount. Two conditions: *every* prop must be stable (an inline `data={[...]}` would defeat it again), and the deps must be honest (`[]` is right only because `handleSelect` reads nothing from render). → [§13.2 useMemo and useCallback](/frontend/react-performance#132-usememo-and-usecallback)

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
  console.log('ThemedButton render');    // logged so Try it shows each re-render
  return <button className={theme}>Go</button>;
}

// Harness: a page that reads user. "Navigate" changes only user — watch ThemedButton log anyway
function Page() {
  const { setUser } = useContext(Ctx);
  return <><ThemedButton /><button onClick={() => setUser({ at: Date.now() })}>Navigate</button></>;
}

render(<AppProvider><Page /></AppProvider>);
```

**Output:** `ThemedButton render` logs again on every Navigate click, although it only reads `theme`.

**Why:** a context notifies every consumer whenever its `value` changes by `Object.is`. React doesn't know which fields a consumer destructures, so a new `user` means a new value object and every consumer re-renders. Wrapping the value in `useMemo(..., [theme, user])` doesn't help here (measured: ThemedButton still re-renders), because `user` is a dependency; it only stops re-renders caused by the provider's *parent*.

The fix is to split the context by how often each piece changes, *and* keep the `UserCtx` read out of ThemedButton's parent:

```jsx
const ThemeCtx = createContext(null);
const UserCtx  = createContext(null);

function AppProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);

  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
  const userValue  = useMemo(() => ({ user, setUser }),  [user]);

  return (
    <ThemeCtx.Provider value={themeValue}>
      <UserCtx.Provider value={userValue}>{children}</UserCtx.Provider>
    </ThemeCtx.Provider>
  );
}

function ThemedButton() {
  const { theme } = useContext(ThemeCtx);
  console.log('ThemedButton render');
  return <button className={theme}>Go</button>;
}

// Only this small component reads UserCtx, so only it re-renders on navigation.
function NavigateButton() {
  const { setUser } = useContext(UserCtx);
  return <button onClick={() => setUser({ at: Date.now() })}>Navigate</button>;
}

function Page() {
  return <><ThemedButton /><NavigateButton /></>;
}

render(<AppProvider><Page /></AppProvider>);
```

`ThemedButton render` now logs only on mount. Splitting alone is not enough if `Page` itself reads `UserCtx` (as in the question): `Page` re-renders on every user change and takes ThemedButton with it. AppProvider's own re-render is harmless, because `<Page />` arrives as `children`, an element created by AppProvider's parent, which React reuses. So either move the `UserCtx` read into a small component, as above, or wrap ThemedButton in `React.memo`. For real field-level subscriptions, use a store (`useSyncExternalStore`, Zustand, Jotai). → [§13.7 Common Re-render Causes](/frontend/react-performance#137-common-re-render-causes-and-fixes)

---

**Q19: A list of 5,000 rows is rendered with `items.map((item, i) => <Row key={i} {...item} />)`. The user clicks a button that calls `setItems(prev => [newItem, ...prev])`. What goes wrong, and why is it both a correctness *and* a performance bug?**

Scaled down to two rows, each with internal state set on mount:

```jsx
const Row = memo(function Row({ name }) {
  const [note] = useState(() => 'note for ' + name);   // internal state, set once on mount
  useEffect(() => { console.log('mount', name); }, []);
  console.log('render', name);
  return <li>{name}: {note}</li>;
});

function App() {
  const [items, setItems] = useState([{ id: 1, name: 'A' }, { id: 2, name: 'B' }]);
  return (
    <>
      <button onClick={() => setItems(prev => [{ id: 3, name: 'NEW' }, ...prev])}>Prepend</button>
      <ul>{items.map((item, i) => <Row key={i} {...item} />)}</ul>
    </>
  );
}

render(<App />);
```

**Output on Prepend:**
```
render NEW
render A
render B
mount B
```
and the list reads `NEW: note for A`, `A: note for B`, `B: note for B`.

**Why:** with index keys React matches rows by position. Key `0` used to be A and now gets NEW's props, so *every* row gets new props and re-renders (even under `memo`), only the last key is mounted as new, and each row's state stays at its position instead of following its data. With `key={item.id}` only the NEW row renders and mounts, and every note stays with its row. At 5,000 rows that is 5,000 needless renders plus wrong state. Index keys are fine only for lists that never reorder, insert or filter. → [§14.4 Why list keys matter](/frontend/react-performance#144-why-list-keys-matter-at-the-algorithm-level)

---

**Q20: A search input filters a 50,000-item product list, and typing feels laggy. A developer wraps the filter in `startTransition`, as below. When does the filter run, and does the transition make it any cheaper?**

```jsx
function Search({ products }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(products);
  const [isPending, startTransition] = useTransition();

  function onChange(e) {
    const q = e.target.value;
    setQuery(q);                                                // urgent
    console.log("1. before startTransition");
    startTransition(() => {
      console.log("2. inside the callback");
      setFiltered(products.filter(p => p.name.includes(q)));   // the filter runs right here
    });
    console.log("3. after startTransition");
  }

  return <><input value={query} onChange={onChange} />{isPending && "…"}<List items={filtered} /></>;
}

// stand-ins so this example runs on its own: 50,000 products, first 50 shown
const List = ({ items }) => <p>{items.length} matches: {items.slice(0, 50).map(p => p.name).join(', ')}</p>;
const products = Array.from({ length: 50000 }, (_, i) => ({ name: 'product ' + i }));

render(<Search products={products} />);
```

**Output on each keystroke:**
```
1. before startTransition
2. inside the callback
3. after startTransition
```

**Why:** `startTransition` calls its callback immediately and synchronously, so the filter still runs inside the keystroke handler, exactly as before. The transition only marks the *update* `setFiltered` as low priority, so the re-render it causes can be interrupted. Here that render shows 50 items and is cheap, and an `includes` filter over 50,000 strings takes about 1–2 ms, so neither is a source of noticeable lag. Typing lag comes from an expensive *render*, and a transition helps only when that expensive work happens during render:

```jsx
// The expensive part is the render, so it is the part a deferred value can interrupt.
const SlowList = memo(function SlowList({ query, products }) {
  const items = useMemo(() => products.filter(p => p.name.includes(query)), [products, query]);
  console.log(`list render for "${query}"`);
  return <ul>{items.slice(0, 50).map(p => <SlowRow key={p.name} name={p.name} />)}</ul>;
});

function SlowRow({ name }) {
  const end = performance.now() + 2;            // stand-in for a costly row: 2 ms each
  while (performance.now() < end) {}
  return <li>{name}</li>;
}

function Search({ products }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query); // lags behind query while the list catches up

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {query !== deferredQuery && " updating…"}
      <SlowList query={deferredQuery} products={products} />
    </>
  );
}

const products = Array.from({ length: 50000 }, (_, i) => ({ name: 'product ' + i }));

render(<Search products={products} />);
```

**Output** (mount, then typing `12` in one input event):
```
list render for ""
list render for "12"
```

The urgent render updates the input and skips `SlowList` (same props, so `memo` bails out); the list then re-renders in the background with the deferred value, and a newer keystroke interrupts that render. A transition doesn't make work faster; it makes the render interruptible. → [§13.5 Concurrent Features](/frontend/react-performance#135-concurrent-features-usetransition-usedeferredvalue)

---

**Q21: A `Chart` component is loaded with `React.lazy(() => import('./Chart'))` and rendered inside `<Suspense fallback={<Spinner />}>`. The first time the page mounts, the user sees a 200ms flash of the spinner even on a fast connection. Why, and what's the fix if the chart is above the fold?**

**Why:** `React.lazy` starts the `import()` only when the component first renders, so the chunk's request, download and parse all happen after the page has rendered, and Suspense shows the fallback meanwhile. For code every visitor needs on first paint, that is an extra round trip, a worse LCP and a layout shift when the spinner is replaced.

Fixes, by situation:

1. **Don't lazy-load it.** Import it normally. Code splitting is for code the user *might* not need.
2. **Preload the chunk** with `<link rel="modulepreload" href="/assets/Chart-abc123.js">` so it downloads in parallel with the main bundle and is cached before React renders `<Chart>`.
3. **Prefetch on intent** for routes one click away: start the import on hover.
4. **Wrap the navigation in `startTransition`** when the chart appears after an update: React keeps showing the previous UI instead of the fallback.

→ [§13.3 Code Splitting](/frontend/react-performance#133-code-splitting-lazy-loading)

---

**Q22: A bundle analyzer shows that `lodash` is contributing 71 KB to the production bundle, but the team only uses `debounce` and `cloneDeep`. The lead developer changed `import _ from 'lodash'` to `import { debounce, cloneDeep } from 'lodash'` — the bundle size barely moved. Why didn't named imports tree-shake?**

**Why:** tree shaking needs the bundler to prove an export is unused, which requires static ES module `import`/`export`. The `lodash` package ships **CommonJS**, one module that builds the whole library at runtime, so named imports still pull in all of it.

Fixes:

1. **`lodash-es`**: the same library as ES modules with `"sideEffects": false`, so `import { debounce, cloneDeep } from 'lodash-es'` keeps only what you use.
2. **Per-function paths** when you must stay on the CJS build: `import debounce from 'lodash/debounce'` bundles only debounce and its own dependencies.

Check the result in the analyzer afterwards: transitive dependencies and dual CJS/ESM packages sometimes keep the old code in. → [§13.11 Tree Shaking](/frontend/react-performance#1311-tree-shaking-and-code-splitting-at-build-time)

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
  return <p>Ticks: {n}</p>;
}

function Panel() {
  const [show, setShow] = useState(true);

  // The timeline: visible for 3.5s → hidden for 5s → visible again.
  useEffect(() => {
    const hide = setTimeout(() => setShow(false), 3500);
    const back = setTimeout(() => setShow(true), 8500);
    return () => { clearTimeout(hide); clearTimeout(back); };
  }, []);

  return (
    <Activity mode={show ? 'visible' : 'hidden'}>   {/* <- the boundary under test */}
      <Timer />
    </Activity>
  );
}

render(<Panel />);
```

**Output:**
```
effect mount        (t=0)
effect cleanup      (t=3.5s, on hide)
effect mount        (t=8.5s, on show)
```
and the counter reads **3** when it reappears, then resumes counting 4, 5, 6…

**Why:** hiding an `<Activity>` destroys its children's effects (the cleanup clears the interval, so nothing ticks while hidden) but **keeps their state**; showing it restores the state and re-creates the effects. The hide is at 3.5 s, between ticks, so exactly three ticks happened; with a hide at exactly 3 s the result would race the third tick.

| Hiding with | Effects while hidden | Counter on return |
|---|---|---|
| `{show && <Timer />}` | cleaned up | starts again from 0 (state lost) |
| CSS `display: none` | keep running | kept ticking while hidden |
| `<Activity mode="hidden">` | cleaned up | 3 (state kept) |

A hidden Activity still re-renders on new props, at low priority, and an effect without a proper cleanup keeps running while hidden. → [§16.6 Activity](/frontend/react-19-patterns#166-activity-hide-ui-without-destroying-it)

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

function Demo() {
  const [value, setValue] = useState(0);

  // The parent re-renders Ticker with value = 0, then 1, then 2 — once a second.
  useEffect(() => {
    const id = setInterval(() => setValue(v => v + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <Ticker value={value} />;
}

render(<Demo />);
```

**Output:**
```
cb 0   ev 0
cb 0   ev 1
cb 0   ev 2
```

**Why:** `useCallback(fn, [])` keeps the *first* render's function forever, and that function closed over `value = 0`. `useEffectEvent` returns a wrapper whose identity never changes but whose body React swaps every render, so it always sees the latest props.

| Callback form | Stable identity | Sees latest values |
|---|---|---|
| inline `() => …` | ✗ | ✓ |
| `useCallback(fn, [])` | ✓ | ✗ |
| `useCallback(fn, [value])` | ✗ | ✓ |
| `useEffectEvent(fn)` | **✓** | **✓** |

The price: an effect event may only be called from inside effects, never during render or passed to a child. `eslint-plugin-react-hooks` 7.x knows this, so it doesn't ask for `cbEvent` in the deps (it does warn about `cbCallback` and its missing `value`). → [§16.7 useEffectEvent](/frontend/react-19-patterns#167-useeffectevent-non-reactive-logic-inside-effects)

---

**Q25: `TagList` mutates its prop during render. With StrictMode on in development, what does it render on mount and after two clicks, first with React Compiler off and then with React Compiler 1.0 on?**

```jsx
function TagList({ tags }) {
  tags.push('featured');                 // mutating a prop during render
  return <ul>{tags.map((t, i) => <li key={i}>{t}</li>)}</ul>;
}

function Demo() {
  const [n, setN] = useState(0);
  const tags = useMemo(() => ['new', 'sale'], []);   // the parent owns this array

  return (
    <StrictMode>
      <button onClick={() => setN(n + 1)}>Re-render ({n})</button>
      <TagList tags={tags} />
    </StrictMode>
  );
}

render(<Demo />);
```

**Output:**

| Moment | Compiler off (what **Try it** runs) | Compiler 1.0 on |
|---|---|---|
| Mount | `new, sale, featured, featured` | `new, sale, featured` |
| After click 1 | 4 × `featured` | `new, sale, featured` |
| After click 2 | 6 × `featured` | `new, sale, featured` |

**Why:** *compiler off:* StrictMode renders each component twice in development, and each render pushes onto the same array the parent owns, so every click adds two. *Compiler on:* the compiler does **not** bail out; it compiles both components (no diagnostic, and the `eslint-plugin-react-hooks` 7.0.1 rules report nothing either). `Demo` caches the `<TagList tags={tags} />` element because `tags` never changes, so clicks don't re-render TagList at all, and inside TagList the mapped list is cached by the `tags` reference, so StrictMode's second render reuses the first one's output even though the array already holds `featured` twice.

The bug is still there; memoisation only hides it. An impure render gives output that depends on how often the component happened to run, and the compiler assumes components follow the Rules of React rather than proving it. Derive instead of mutating:

```jsx
function TagList({ tags }) {
  const all = [...tags, 'featured'];       // or tags.concat('featured')
  return <ul>{all.map(t => <li key={t}>{t}</li>)}</ul>;
}

render(<TagList tags={['new', 'sale']} />);
```

→ [§16.1 React Compiler](/frontend/react-19-patterns#161-react-compiler-stable-since-10)

---

**Q26: The dependency array is empty and the linter is happy. Why does switching rooms never reconnect?**

```tsx
// stand-in so this example runs on its own
function createConnection(roomId) {
  return {
    on: (_event, cb) => setTimeout(cb, 100),
    connect: () => console.log('connect', roomId),
    disconnect: () => console.log('disconnect', roomId),
  };
}

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
  return <p>Showing room: {roomId}</p>;
}

function Demo() {
  const [roomId, setRoomId] = useState('general');
  return (
    <>
      <button onClick={() => setRoomId(r => (r === 'general' ? 'random' : 'general'))}>Switch room ({roomId})</button>
      <ChatRoom roomId={roomId} />
    </>
  );
}

render(<Demo />);
```

**Output:** `connect general` on mount, then nothing when you switch rooms: the screen says `random` but the connection is still to `general`.

**Why:** an effect event is *non-reactive* by design. The effect no longer reads `roomId` directly, so its `[]` is genuinely complete and the linter is right not to warn. The bug is putting synchronisation logic ("the connection must match `roomId`") in an effect event. Synchronisation belongs in the effect body with its dependencies; only logic that should *not* re-run, such as a toast in the current theme, belongs in an effect event:

```tsx
// stand-in so this example runs on its own
const showToast = (msg, theme) => console.log(msg, '(' + theme + ' toast)');
function createConnection(roomId) {
  return {
    on: (_event, cb) => setTimeout(cb, 100),
    connect: () => console.log('connect', roomId),
    disconnect: () => console.log('disconnect', roomId),
  };
}

function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => showToast('Connected!', theme));  // event

  useEffect(() => {                        // synchronisation
    const conn = createConnection(roomId);
    conn.on('connected', () => onConnected());
    conn.connect();
    return () => conn.disconnect();
  }, [roomId]);                            // honest and complete
  return <p>Showing room: {roomId}</p>;
}

function Demo() {
  const [roomId, setRoomId] = useState('general');
  return (
    <>
      <button onClick={() => setRoomId(r => (r === 'general' ? 'random' : 'general'))}>Switch room ({roomId})</button>
      <ChatRoom roomId={roomId} theme="dark" />
    </>
  );
}

render(<Demo />);
```

**Output** (mount, then one switch):
```
connect general
Connected! (dark toast)
disconnect general
connect random
Connected! (dark toast)
```

If you reach for `useEffectEvent` to make a dependency warning go away rather than to express "this is an event", you are turning a loud lint warning into a quiet bug. → [§16.7 useEffectEvent](/frontend/react-19-patterns#167-useeffectevent-non-reactive-logic-inside-effects)

---

### Key Rules

```
React Output Cheat Sheet:
1.  setState with direct value uses the closure value (may be stale)
2.  setState with function updater gets the latest pending state
3.  React 18+ batches all state updates in one event into one render
4.  useEffect runs after commit, usually after paint (an effect caused by a click may run before paint)
5.  useEffect cleanup captures values from the render it was created in
6.  Object/array deps created during render re-run the effect every time (new reference)
7.  React.memo does shallow compare — new object refs bypass it
8.  Changing `key` completely remounts the component
9.  Hooks must be called in the same order every render
10. useRef mutations don't trigger re-renders
11. Every context consumer re-renders when the value changes — split contexts by update rate
12. Index keys break correctness on prepend/splice; use stable ids
13. startTransition runs its callback now; only the render it causes is interruptible
14. React.lazy adds a network round-trip; preload above-the-fold chunks
15. Tree shaking needs ESM + sideEffects:false; CJS lodash won't shake
```
