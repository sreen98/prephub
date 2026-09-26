# React Hooks Cheat Sheet

## useState
```jsx
const [value, setValue] = useState(initialValue);
setValue(newValue);           // direct set
setValue(prev => prev + 1);  // functional update
```

## useEffect
```jsx
useEffect(() => { /* run */ }, []);          // mount only
useEffect(() => { /* run */ }, [dep]);       // when dep changes
useEffect(() => { return () => cleanup() }, [dep]); // cleanup
```

## useRef
```jsx
const ref = useRef(null);    // DOM reference
const countRef = useRef(0);  // mutable value (no re-render)
```

## useMemo & useCallback
```jsx
const computed = useMemo(() => expensiveFn(a, b), [a, b]);
const handler = useCallback((e) => doSomething(e, id), [id]);
```

## useReducer
```jsx
const [state, dispatch] = useReducer(reducer, initialState);
dispatch({ type: 'INCREMENT' });
```

## useContext
```jsx
const ThemeCtx = createContext('light');     // 'light' = value when no provider is above

function Label() {
  const theme = useContext(ThemeCtx);        // reads the nearest provider's value
  return <p>theme: {theme}</p>;
}

render(<ThemeCtx value="dark"><Label /></ThemeCtx>);  // React 19: <Ctx> is the provider
```

## Custom Hook Pattern
```jsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn(p => !p), []);
  return [on, toggle];
}
```

## Rules of Hooks
| Rule | Detail |
|------|--------|
| Top level only | No hooks inside loops, conditions, or nested functions |
| React functions only | Call from components or custom hooks |
| `use` prefix | Custom hooks must start with `use` |
| Order matters | Same order every render |

## Common Patterns

| Pattern | Hook |
|---------|------|
| Form input | `useState` + `onChange` |
| API fetch | `useEffect` + `useState` |
| Debounce | `useEffect` + `useRef` (timer) |
| Previous value | `useRef` updated in `useEffect` |
| Window event | `useEffect` + `addEventListener` + cleanup |
| Interval | `useEffect` + `setInterval` + cleanup |

## Concurrent & Identity Hooks
```jsx
const [isPending, startTransition] = useTransition();
startTransition(() => setFilter(next));      // marks the update non-urgent

const deferred = useDeferredValue(query);    // renders stale value while catching up
const id = useId();                          // SSR-stable unique id for a11y attrs

// subscribe to an external (non-React) store without tearing
const width = useSyncExternalStore(subscribe, () => window.innerWidth, () => 0);
```

## Layout, Refs & Debug
```jsx
// React 19: ref as a normal prop — no forwardRef needed
function Input({ ref, ...props }) {
  const inputRef = useRef(null);
  // expose a narrow API to the parent instead of the raw DOM node
  useImperativeHandle(ref, () => ({ focus: () => inputRef.current.focus() }), []);
  // fires BEFORE paint — for measuring layout only
  useLayoutEffect(() => { console.log('width:', inputRef.current.offsetWidth); }, []);
  return <input ref={inputRef} {...props} />;
}

function useLabel(value) {
  useDebugValue(value);                      // label for React DevTools (custom hooks only)
  return value;
}

function Demo() {
  const ref = useRef(null);
  const label = useLabel('Name');
  return <>{label}: <Input ref={ref} /> <button onClick={() => ref.current.focus()}>Focus</button></>;
}

render(<Demo />);
```

## Form & Action Hooks (React 19)
```jsx
const [state, formAction, isPending] = useActionState(action, initialState);
const [optimistic, addOptimistic] = useOptimistic(items, (cur, next) => [...cur, next]);
const { pending, data } = useFormStatus();   // must be INSIDE the <form>

<form action={formAction}><SubmitButton /></form>
```

## useEffectEvent
```jsx
// stable identity, always-fresh values — lets you drop a dep without staleness
const onVisit = useEffectEvent(() => log(url, theme));
useEffect(() => { onVisit(); }, [url]);      // theme is fresh but not a dep
```

## Dependency Array Rules
```jsx
useEffect(fn)            // NO array → every render
useEffect(fn, [])        // mount only (+ cleanup on unmount)
useEffect(fn, [a, b])    // when a or b changes (Object.is comparison)
```
Deps are compared with `Object.is`, so a **new object/array/function literal each render is always "changed"**. Memoize it, move it inside the effect, or store primitives instead.

## Custom Hook Patterns
```jsx
function useDebouncedValue(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);            // cleanup cancels the pending timer
  }, [value, ms]);
  return v;
}

function useFetch(url) {
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    const ac = new AbortController();
    fetch(url, { signal: ac.signal })
      .then(r => r.json())
      .then(data => setState({ loading: false, data }))
      .catch(e => { if (e.name !== 'AbortError') setState({ loading: false, error: e }); });
    return () => ac.abort();                 // cancels on unmount AND on url change
  }, [url]);
  return state;
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;                        // previous render's value
}
```

## When NOT to use useEffect
| Instead of an effect | Do this |
|---|---|
| Deriving state from props | compute it during render |
| Resetting state when a prop changes | pass a `key` to remount |
| Responding to a user event | put the logic in the handler |
| Fetching data | a query library (TanStack Query) |
| Syncing two state variables | make one derived, not stored |

## Gotchas
- **Stale closures:** an effect or callback captures the values from its render. Missing deps means reading old values — use a functional update (`setX(p => ...)`) or `useEffectEvent`.
- `useState` values are a **snapshot per render**: `setX` schedules a re-render, it does not change `x` in the code that is already running, so reading `x` right after setting it gives the old value.
- An object literal in a `useEffect`/`useMemo`/`useCallback` dependency array re-runs it every render — `{}` !== `{}`.
- `useRef` mutations **do not trigger a re-render**; never store rendered data in a ref.
- **StrictMode double-invokes** effects and renders in development to surface missing cleanup. It is not a bug.
- `useCallback(fn, deps)` is exactly `useMemo(() => fn, deps)` — and memoizing without a `React.memo` child usually costs more than it saves.
- `useLayoutEffect` blocks paint; it warns during SSR. Use `useEffect` unless you must measure before paint.
- `useFormStatus` reads the **nearest parent** `<form>` — called in the component that renders the form, it never sees that form and `pending` stays `false`.
- Calling hooks conditionally breaks the call-order invariant — that's why the lint rule is not optional.
- Cleanup runs **before every re-run**, not just on unmount.
