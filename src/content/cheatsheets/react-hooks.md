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
const ThemeCtx = createContext('light');
const theme = useContext(ThemeCtx);
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
