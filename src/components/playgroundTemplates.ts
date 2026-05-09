// Code Playground templates. Extracted from CodePlayground.tsx so the main
// component file stays compact. Add new templates here, not in the component.

// ==================== Types ====================

export type TemplateLang = 'js' | 'ts' | 'jsx' | 'tsx';
export type CategoryKind = 'template' | 'challenge';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

/** Algorithmic patterns — tagged on Coding Challenges so users can find
 *  challenges that share the same underlying technique. A challenge may
 *  belong to more than one pattern (e.g. Quick Sort is Sorting + Recursion). */
export type Pattern =
  | 'Two Pointer'
  | 'Sliding Window'
  | 'Hash Map / Set'
  | 'Stack'
  | 'Recursion / D&C'
  | 'Dynamic Programming'
  | 'Greedy'
  | 'Binary Search'
  | 'Backtracking'
  | 'Math / Bit'
  | 'Sorting'
  | 'Linked List'
  | 'Closure / State'
  | 'In-Place';

/** Canonical list — used for filter chips in the templates modal. */
export const ALL_PATTERNS: Pattern[] = [
  'Two Pointer',
  'Sliding Window',
  'Hash Map / Set',
  'Stack',
  'Recursion / D&C',
  'Dynamic Programming',
  'Greedy',
  'Binary Search',
  'Backtracking',
  'Math / Bit',
  'Sorting',
  'Linked List',
  'Closure / State',
  'In-Place',
];

/** Patterns grouped into super-categories for the modal filter UI.
 *  Avoids the "long horizontal row" UX problem — chips lay out in a
 *  small number of well-named rows that fit the screen vertically. */
export const PATTERN_GROUPS: { label: string; patterns: Pattern[] }[] = [
  { label: 'Linear scans',  patterns: ['Two Pointer', 'Sliding Window', 'In-Place'] },
  { label: 'Lookup',        patterns: ['Hash Map / Set', 'Stack'] },
  { label: 'Recursive',     patterns: ['Recursion / D&C', 'Backtracking'] },
  { label: 'Optimization',  patterns: ['Dynamic Programming', 'Greedy', 'Binary Search'] },
  { label: 'Data + Misc',   patterns: ['Sorting', 'Linked List', 'Closure / State', 'Math / Bit'] },
];

export interface Template {
  name: string;
  code: string;
  /** Whether the snippet uses JSX (legacy alias — prefer `lang`). */
  jsx?: boolean;
  /** Source language for the runner. Defaults to 'jsx' if jsx===true, else 'js'. */
  lang?: TemplateLang;
  /** Algorithmic patterns this challenge demonstrates. Used for cross-discovery —
   *  studying one challenge with pattern X teaches you the technique for every
   *  other challenge with the same tag. */
  patterns?: Pattern[];
  /** Subjective difficulty rating, roughly aligned with LeetCode conventions. */
  difficulty?: Difficulty;
}

export interface TemplateCategory {
  label: string;
  tag: string;
  /** 'template' = teaching reference; 'challenge' = problem to solve. */
  kind?: CategoryKind;
  templates: Template[];
}

export interface FlatTemplate extends Template {
  category: string;
  tag: string;
  kind: CategoryKind;
}

// ==================== Templates ====================


export const templateCategories: TemplateCategory[] = [
  {
    label: 'JavaScript Fundamentals',
    tag: 'JS',
    kind: 'template',
    templates: [
      {
        name: 'Hello World',
        code: '// Welcome to the Code Playground!\nconsole.log("Hello, World!");\nconsole.log("Start coding here...");',
      },
      {
        name: 'Array Methods',
        code: `const fruits = ["apple", "banana", "cherry", "date", "elderberry"];

// map - transform each element
console.log("Uppercase:", fruits.map(f => f.toUpperCase()));

// filter - keep elements that match
console.log("Long names:", fruits.filter(f => f.length > 5));

// reduce - accumulate a result
console.log("Total chars:", fruits.reduce((sum, f) => sum + f.length, 0));

// find - get first match
console.log("First with 'a':", fruits.find(f => f.includes("a")));`,
      },
      {
        name: 'Closures',
        code: `function createCounter(start = 0) {
  let count = start;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.decrement()); // 11
console.log(counter.getCount());  // 11`,
      },
      {
        name: 'Promises & Async',
        code: `// Note: async results appear after sync code

function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

console.log("Start");

delay(100, "First").then(v => console.log(v));
delay(50, "Second").then(v => console.log(v));

Promise.all([
  delay(10, "A"),
  delay(20, "B"),
  delay(5, "C"),
]).then(results => console.log("All:", results));

console.log("End (sync)");`,
      },
      {
        name: 'Map & Set',
        code: `// Map and Set are the modern alternatives to plain objects/arrays
// for keyed lookups and unique-value collections.

// ===== Map =====
// Like an object, but: any key type, preserves insertion order,
// has a size property, and is iterable directly.
const m = new Map();
m.set("name", "Ana");
m.set(42, "answer");          // numeric key — impossible with plain objects
m.set({ id: 1 }, "obj-key");  // even objects as keys

console.log("Map size:", m.size);                  // 3
console.log("Get name:", m.get("name"));           // "Ana"
console.log("Has 42:", m.has(42));                 // true

// Iteration: for...of gives [key, value] pairs
for (const [k, v] of m) console.log("  ", k, "->", v);

// ===== Set =====
// Unique values, any type. Common use: dedupe an array.
const nums = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(nums)];
console.log("Unique:", unique);                    // [1, 2, 3, 4]

const s = new Set();
s.add("a").add("b").add("a");                      // chainable
console.log("Set size:", s.size);                  // 2 ("a" not added twice)

// ===== When to use which =====
// Object  — fixed keys, JSON-friendly, simplest case
// Map     — many additions/removals, non-string keys, need .size
// Array   — ordered, indexed
// Set     — uniqueness checks, dedup`,
      },
      {
        name: 'Spread & Rest',
        code: `// Same syntax (...), opposite jobs:
//   spread  EXPANDS an iterable into individual elements
//   rest    COLLECTS individual arguments into an array

// ===== Spread — expand =====
const a = [1, 2, 3];
const b = [4, 5];

console.log([...a, ...b]);              // [1, 2, 3, 4, 5]   array concat
console.log(Math.max(...a));            // 3                 spread args

const obj1 = { x: 1, y: 2 };
const obj2 = { ...obj1, z: 3 };         // shallow merge
console.log(obj2);                      // { x: 1, y: 2, z: 3 }

// Important: shallow only — nested objects share references
const orig = { nested: { val: 1 } };
const copy = { ...orig };
copy.nested.val = 999;
console.log(orig.nested.val);           // 999  (mutated through shared ref!)

// ===== Rest — collect =====
function sum(...nums) {                 // collects args into an array
  return nums.reduce((a, b) => a + b, 0);
}
console.log(sum(1, 2, 3, 4));           // 10

// Rest in destructuring
const [first, ...others] = [10, 20, 30, 40];
console.log(first, others);             // 10  [20, 30, 40]

const { name, ...rest } = { name: "Ana", age: 30, role: "dev" };
console.log(name);                      // "Ana"
console.log(rest);                      // { age: 30, role: "dev" }

// Common pitfall: rest must be last
// const [...all, last] = [1, 2, 3];   // SyntaxError`,
      },
    ],
  },
  {
    label: 'JS Interview Topics',
    tag: 'JS',
    kind: 'template',
    templates: [
      {
        name: 'Event Loop & Microtasks',
        code: `// Predict the output order!

console.log("1: sync");

setTimeout(() => console.log("2: setTimeout (macro)"), 0);

Promise.resolve().then(() => console.log("3: Promise (micro)"));

queueMicrotask(() => console.log("4: queueMicrotask (micro)"));

console.log("5: sync");

// Answer: 1, 5, 3, 4, 2
// Microtasks (Promise, queueMicrotask) run before macrotasks (setTimeout)`,
      },
      {
        name: 'this Keyword',
        code: `const obj = {
  name: "Alice",
  greet() {
    return \`Hi, I'm \${this.name}\`;
  },
  greetArrow: () => {
    return \`Hi, I'm \${typeof this?.name}\`;  // arrow inherits outer 'this'
  },
};

console.log("Method call:", obj.greet());         // "Alice"
console.log("Arrow call:", obj.greetArrow());     // "undefined"

// Lost context
const greet = obj.greet;
try {
  console.log("Detached:", greet());              // "undefined"
} catch(e) {
  console.log("Error:", e.message);
}

// Explicit binding
console.log("call():", greet.call({ name: "Bob" }));     // "Bob"
console.log("bind():", greet.bind({ name: "Eve" })());   // "Eve"`,
      },
      {
        name: 'Debounce & Throttle',
        code: `function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}

// Demo: debounce — only last call fires
const debouncedLog = debounce((x) => console.log("debounced:", x), 200);
debouncedLog("a");
debouncedLog("b");
debouncedLog("c"); // only "c" fires after 200ms

// Demo: throttle — at most once per interval
const throttledLog = throttle((x) => console.log("throttled:", x), 100);
throttledLog("1");
throttledLog("2"); // skipped (too soon)

console.log("Check console after ~200ms for debounce result");`,
      },
      {
        name: 'Currying',
        code: `// Currying: transform f(a, b, c) into f(a)(b)(c)

const curry = (fn) => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
};

const add = curry((a, b, c) => a + b + c);

console.log(add(1)(2)(3));    // 6
console.log(add(1, 2)(3));    // 6
console.log(add(1)(2, 3));    // 6

// Practical use: create reusable functions
const multiply = curry((a, b) => a * b);
const double = multiply(2);
const triple = multiply(3);

console.log(double(5));   // 10
console.log(triple(5));   // 15
console.log([1,2,3,4].map(double)); // [2,4,6,8]`,
      },
      {
        name: 'Prototypes & Classes',
        code: `class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return \`\${this.name} makes a sound.\`;
  }
}

class Dog extends Animal {
  speak() {
    return \`\${this.name} barks!\`;
  }
}

const dog = new Dog("Rex");
console.log(dog.speak());
console.log(dog instanceof Animal);  // true
console.log(dog instanceof Dog);     // true

// Prototype chain
console.log(Object.getPrototypeOf(dog) === Dog.prototype);       // true
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype); // true`,
      },
      {
        name: 'Destructuring Deep Dive',
        code: `// Nested destructuring
const { data: { users: [first, ...rest] } } = {
  data: { users: ["Alice", "Bob", "Charlie"] }
};
console.log("First:", first, "Rest:", rest);

// Default values + rename
const { name: userName = "Anonymous", age = 0 } = { name: "Sree" };
console.log("Name:", userName, "Age:", age);

// Swap variables
let a = 1, b = 2;
[a, b] = [b, a];
console.log("Swapped:", a, b);

// Function parameter destructuring
function greet({ name, role = "developer" }) {
  console.log(\`Hello \${name}, you are a \${role}\`);
}
greet({ name: "Alice" });
greet({ name: "Bob", role: "designer" });

// Rest in objects
const { x, y, ...remaining } = { x: 1, y: 2, z: 3, w: 4 };
console.log("Remaining:", remaining);`,
      },
      {
        name: 'Tricky Interview Q',
        code: `// Classic interview gotchas

// 1. typeof null
console.log("typeof null:", typeof null);  // "object" (historic bug)

// 2. == vs ===
console.log("0 == '':", 0 == "");    // true (coercion)
console.log("0 === '':", 0 === "");  // false (strict)

// 3. NaN
console.log("NaN === NaN:", NaN === NaN);  // false!
console.log("Number.isNaN(NaN):", Number.isNaN(NaN)); // true

// 4. Array quirks
console.log("[] == []:", [] == []);     // false (different refs)
console.log("[1] + [2]:", [1] + [2]);   // "12" (string concat)

// 5. Hoisting
console.log("typeof undeclared:", typeof undeclaredVar); // "undefined" (no error)

// 6. Closure in loop
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var loop:", i), 10);
}
// Prints 3, 3, 3 (var is function-scoped)

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let loop:", j), 20);
}
// Prints 0, 1, 2 (let is block-scoped)`,
      },
    ],
  },
  {
    label: 'React Basics',
    tag: 'React',
    kind: 'template',
    templates: [
      {
        name: 'useState Counter',
        jsx: true,
        code: `function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ textAlign: "center", padding: 24, fontFamily: "system-ui" }}>
      <h2 style={{ fontSize: 48, margin: 0 }}>{count}</h2>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
        <button onClick={() => setCount(c => c - 1)}>-1</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount(c => c + 1)}>+1</button>
      </div>
    </div>
  );
}

render(<Counter />);`,
      },
      {
        name: 'useEffect Lifecycle',
        jsx: true,
        code: `function Timer() {
  const [seconds, setSeconds] = React.useState(0);
  const [running, setRunning] = React.useState(true);

  React.useEffect(() => {
    if (!running) return;
    console.log("Effect: timer started");
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => {
      clearInterval(id);
      console.log("Cleanup: timer stopped");
    };
  }, [running]);

  return (
    <div style={{ textAlign: "center", padding: 24, fontFamily: "system-ui" }}>
      <h2 style={{ fontSize: 48, margin: 0 }}>\u23F1 {seconds}s</h2>
      <button onClick={() => setRunning(r => !r)} style={{ marginTop: 16 }}>
        {running ? "\u23F8 Pause" : "\u25B6 Resume"}
      </button>
      <p style={{ color: "#888", fontSize: 13, marginTop: 8 }}>Check console for lifecycle logs</p>
    </div>
  );
}

render(<Timer />);`,
      },
      {
        name: 'Custom Hook',
        jsx: true,
        code: `// Custom hook: useLocalStorage
function useLocalStorage(key, initial) {
  const [value, setValue] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; }
    catch { return initial; }
  });

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function App() {
  const [name, setName] = useLocalStorage("playground-demo-name", "");
  const [color, setColor] = useLocalStorage("playground-demo-color", "#6366f1");

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h3 style={{ marginTop: 0 }}>Custom Hook: useLocalStorage</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Type your name..."
          style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="color" value={color} onChange={e => setColor(e.target.value)} />
          <span style={{ color }}>Favorite color</span>
        </div>
      </div>
      <p style={{ color: "#888", fontSize: 12, marginTop: 16 }}>
        Values persist in localStorage \u2014 try re-running!
      </p>
    </div>
  );
}

render(<App />);`,
      },
    ],
  },
  {
    label: 'React Advanced',
    tag: 'React',
    kind: 'template',
    templates: [
      {
        name: 'useReducer Todo',
        jsx: true,
        code: `function todosReducer(state, action) {
  switch (action.type) {
    case "add":
      return [...state, { id: Date.now(), text: action.text, done: false }];
    case "toggle":
      return state.map(t => t.id === action.id ? { ...t, done: !t.done } : t);
    case "delete":
      return state.filter(t => t.id !== action.id);
    default:
      return state;
  }
}

function TodoApp() {
  const [todos, dispatch] = React.useReducer(todosReducer, []);
  const [text, setText] = React.useState("");

  const handleAdd = () => {
    if (text.trim()) {
      dispatch({ type: "add", text });
      setText("");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 400, fontFamily: "system-ui" }}>
      <h3 style={{ marginTop: 0 }}>useReducer Todo</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Add todo..."
          style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
      <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
        {todos.map(t => (
          <li key={t.id} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 0",
            textDecoration: t.done ? "line-through" : "none",
            opacity: t.done ? 0.5 : 1
          }}>
            <input type="checkbox" checked={t.done} onChange={() => dispatch({ type: "toggle", id: t.id })} />
            <span style={{ flex: 1 }}>{t.text}</span>
            <button onClick={() => dispatch({ type: "delete", id: t.id })} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>\u2715</button>
          </li>
        ))}
      </ul>
      {todos.length === 0 && <p style={{ color: "#999", textAlign: "center" }}>No todos yet</p>}
    </div>
  );
}

render(<TodoApp />);`,
      },
      {
        name: 'Context API',
        jsx: true,
        code: `// Theme context \u2014 no prop drilling
const ThemeContext = React.createContext();

function ThemeProvider({ children }) {
  const [dark, setDark] = React.useState(false);
  const theme = {
    bg: dark ? "#1a1a2e" : "#ffffff",
    text: dark ? "#e0e0e0" : "#1a1a1a",
    accent: dark ? "#6366f1" : "#4f46e5",
    toggle: () => setDark(d => !d),
    dark,
  };
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  return React.useContext(ThemeContext);
}

function Header() {
  const theme = useTheme();
  return (
    <div style={{ padding: 16, borderBottom: "1px solid " + (theme.dark ? "#333" : "#eee"), display: "flex", justifyContent: "space-between" }}>
      <strong style={{ color: theme.accent }}>Context Demo</strong>
      <button onClick={theme.toggle}>{theme.dark ? "\u2600\uFE0F Light" : "\u{1F319} Dark"}</button>
    </div>
  );
}

function Content() {
  const theme = useTheme();
  return (
    <div style={{ padding: 16 }}>
      <p>Theme is: <strong>{theme.dark ? "Dark" : "Light"}</strong></p>
      <p style={{ color: "#888", fontSize: 13 }}>Header and Content both read from ThemeContext \u2014 no props passed!</p>
    </div>
  );
}

function App() {
  const theme = useTheme();
  return (
    <div style={{ background: theme.bg, color: theme.text, borderRadius: 12, overflow: "hidden", fontFamily: "system-ui", transition: "all 0.3s" }}>
      <Header />
      <Content />
    </div>
  );
}

render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);`,
      },
      {
        name: 'React Compiler Patterns',
        jsx: true,
        code: `// React Compiler automatically memoizes computations
// that you'd manually wrap with useMemo/useCallback/React.memo.
//
// WITHOUT compiler:
//   const filtered = useMemo(() => items.filter(...), [items, query]);
//
// WITH compiler \u2014 just write plain code:

function ExpensiveList({ items, query }) {
  // Compiler auto-memoizes this computation
  const filtered = items.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  console.log("ExpensiveList rendered with", filtered.length, "items");

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {filtered.map((item, i) => (
        <li key={i} style={{ padding: "4px 0", borderBottom: "1px solid #eee" }}>{item}</li>
      ))}
      {filtered.length === 0 && <li style={{ color: "#999" }}>No matches</li>}
    </ul>
  );
}

function App() {
  const [query, setQuery] = React.useState("");
  const [count, setCount] = React.useState(0);

  // Compiler knows this array is stable
  const items = [
    "React", "Redux", "Router", "TanStack Query",
    "Next.js", "Remix", "Vite", "TypeScript",
    "Node.js", "Express", "MongoDB", "PostgreSQL",
  ];

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 400 }}>
      <h3 style={{ marginTop: 0 }}>React Compiler Demo</h3>
      <p style={{ color: "#888", fontSize: 13 }}>
        Compiler auto-memoizes the filtered list.
        Clicking "Count" won't re-filter. Check console!
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter technologies..."
          style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </button>
      </div>
      <ExpensiveList items={items} query={query} />
    </div>
  );
}

render(<App />);`,
      },
    ],
  },
  {
    label: 'JS Polyfills',
    tag: 'JS',
    kind: 'template',
    templates: [
      {
        name: 'Array.map',
        code: `// Polyfill: Array.prototype.map
Array.prototype.myMap = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result.push(callback.call(thisArg, this[i], i, this));
    }
  }
  return result;
};

// Test
const nums = [1, 2, 3, 4, 5];
console.log("Native map:", nums.map(n => n * 2));
console.log("Polyfill:  ", nums.myMap(n => n * 2));

// With index and array access
console.log("With index:", nums.myMap((val, idx) => \`\${idx}:\${val}\`));

// With thisArg
const multiplier = { factor: 10 };
console.log("thisArg:   ", nums.myMap(function(n) { return n * this.factor; }, multiplier));`,
      },
      {
        name: 'Array.filter',
        code: `// Polyfill: Array.prototype.filter
Array.prototype.myFilter = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

// Test
const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log("Native filter:", nums.filter(n => n % 2 === 0));
console.log("Polyfill:     ", nums.myFilter(n => n % 2 === 0));

// Filter with index
console.log("Even index:", nums.myFilter((_, i) => i % 2 === 0));

// Filter objects
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 17 },
  { name: "Charlie", age: 30 },
];
console.log("Adults:", users.myFilter(u => u.age >= 18).myMap(u => u.name));`,
      },
      {
        name: 'Array.reduce',
        code: `// Polyfill: Array.prototype.reduce
Array.prototype.myReduce = function(callback, initialValue) {
  let accumulator;
  let startIndex;

  if (arguments.length >= 2) {
    accumulator = initialValue;
    startIndex = 0;
  } else {
    if (this.length === 0) throw new TypeError("Reduce of empty array with no initial value");
    accumulator = this[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this);
    }
  }
  return accumulator;
};

// Test: sum
const nums = [1, 2, 3, 4, 5];
console.log("Native sum:", nums.reduce((a, b) => a + b, 0));
console.log("Polyfill:  ", nums.myReduce((a, b) => a + b, 0));

// Without initial value
console.log("No init:   ", nums.myReduce((a, b) => a + b));

// Build an object
const fruits = ["apple", "banana", "apple", "cherry", "banana", "apple"];
const count = fruits.myReduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
console.log("Frequency:", count);

// Flatten nested arrays
const nested = [[1, 2], [3, 4], [5]];
console.log("Flatten:", nested.myReduce((a, b) => a.concat(b), []));`,
      },
      {
        name: 'Array.forEach',
        code: `// Polyfill: Array.prototype.forEach
Array.prototype.myForEach = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      callback.call(thisArg, this[i], i, this);
    }
  }
};

// Test
const fruits = ["apple", "banana", "cherry"];

console.log("--- Native forEach ---");
fruits.forEach((fruit, i) => console.log(\`\${i}: \${fruit}\`));

console.log("--- Polyfill ---");
fruits.myForEach((fruit, i) => console.log(\`\${i}: \${fruit}\`));

// Key difference: forEach returns undefined, cannot break
const result = fruits.myForEach(f => f);
console.log("Return value:", result); // undefined`,
      },
      {
        name: 'Array.find & findIndex',
        code: `// Polyfill: Array.prototype.find
Array.prototype.myFind = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return this[i];
    }
  }
  return undefined;
};

// Polyfill: Array.prototype.findIndex
Array.prototype.myFindIndex = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return i;
    }
  }
  return -1;
};

// Test
const users = [
  { id: 1, name: "Alice", role: "admin" },
  { id: 2, name: "Bob", role: "user" },
  { id: 3, name: "Charlie", role: "user" },
];

console.log("find admin:", users.myFind(u => u.role === "admin"));
console.log("find index:", users.myFindIndex(u => u.name === "Charlie"));
console.log("not found: ", users.myFind(u => u.name === "Dave"));
console.log("not found: ", users.myFindIndex(u => u.name === "Dave")); // -1`,
      },
      {
        name: 'Array.some & every',
        code: `// Polyfill: Array.prototype.some
Array.prototype.mySome = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return true;
    }
  }
  return false;
};

// Polyfill: Array.prototype.every
Array.prototype.myEvery = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && !callback.call(thisArg, this[i], i, this)) {
      return false;
    }
  }
  return true;
};

// Test
const nums = [2, 4, 6, 8, 10];

console.log("some > 5:", nums.mySome(n => n > 5));    // true
console.log("some > 20:", nums.mySome(n => n > 20));   // false
console.log("every even:", nums.myEvery(n => n % 2 === 0)); // true
console.log("every > 5:", nums.myEvery(n => n > 5));   // false

// Practical: form validation
const fields = [
  { name: "email", valid: true },
  { name: "password", valid: true },
  { name: "age", valid: false },
];
console.log("All valid:", fields.myEvery(f => f.valid));
console.log("Any valid:", fields.mySome(f => f.valid));`,
      },
      {
        name: 'Array.flat & flatMap',
        code: `// Polyfill: Array.prototype.flat
Array.prototype.myFlat = function(depth = 1) {
  const result = [];
  const flatten = (arr, d) => {
    for (let i = 0; i < arr.length; i++) {
      if (i in arr) {
        if (Array.isArray(arr[i]) && d > 0) {
          flatten(arr[i], d - 1);
        } else {
          result.push(arr[i]);
        }
      }
    }
  };
  flatten(this, depth);
  return result;
};

// Polyfill: Array.prototype.flatMap
Array.prototype.myFlatMap = function(callback, thisArg) {
  return this.myMap(callback, thisArg).myFlat(1);
};

// Test flat
const nested = [1, [2, 3], [4, [5, 6]]];
console.log("flat(1):", nested.myFlat());
console.log("flat(2):", nested.myFlat(2));
console.log("flat(\u221E):", [1, [2, [3, [4, [5]]]]].myFlat(Infinity));

// Test flatMap
const sentences = ["Hello World", "Foo Bar"];
console.log("flatMap:", sentences.myFlatMap(s => s.split(" ")));

// Practical: expand data
const orders = [
  { id: 1, items: ["shirt", "hat"] },
  { id: 2, items: ["shoes"] },
];
console.log("All items:", orders.myFlatMap(o => o.items));`,
      },
      {
        name: 'Function.bind',
        code: `// Polyfill: Function.prototype.bind
Function.prototype.myBind = function(thisArg, ...boundArgs) {
  const fn = this;
  return function(...callArgs) {
    return fn.apply(thisArg, [...boundArgs, ...callArgs]);
  };
};

// Test: basic binding
const user = { name: "Alice" };
function greet(greeting, punctuation) {
  return \`\${greeting}, \${this.name}\${punctuation}\`;
}

const greetAlice = greet.myBind(user, "Hello");
console.log(greetAlice("!"));   // "Hello, Alice!"
console.log(greetAlice("?"));   // "Hello, Alice?"

// Test: partial application
function multiply(a, b) {
  return a * b;
}
const double = multiply.myBind(null, 2);
const triple = multiply.myBind(null, 3);
console.log("double(5):", double(5));  // 10
console.log("triple(5):", triple(5));  // 15

// Test: compare with native
const nativeBound = greet.bind(user, "Hi");
const polyBound = greet.myBind(user, "Hi");
console.log("Native:", nativeBound("."));
console.log("Poly:  ", polyBound("."));`,
      },
      {
        name: 'Function.call & apply',
        code: `// Polyfill: Function.prototype.call
Function.prototype.myCall = function(thisArg, ...args) {
  thisArg = thisArg ?? globalThis;
  thisArg = Object(thisArg);
  const sym = Symbol("fn");
  thisArg[sym] = this;
  const result = thisArg[sym](...args);
  delete thisArg[sym];
  return result;
};

// Polyfill: Function.prototype.apply
Function.prototype.myApply = function(thisArg, argsArray = []) {
  return this.myCall(thisArg, ...argsArray);
};

// Test
function introduce(greeting, age) {
  return \`\${greeting}, I'm \${this.name}, \${age} years old\`;
}

const person = { name: "Alice" };

console.log("Native call: ", introduce.call(person, "Hello", 25));
console.log("Polyfill call:", introduce.myCall(person, "Hello", 25));

console.log("Native apply: ", introduce.apply(person, ["Hi", 30]));
console.log("Polyfill apply:", introduce.myApply(person, ["Hi", 30]));

// Borrow methods
const arrayLike = { 0: "a", 1: "b", 2: "c", length: 3 };
const arr = Array.prototype.slice.myCall(arrayLike);
console.log("Array-like to array:", arr);

// Math.max with apply
const nums = [3, 1, 4, 1, 5, 9];
console.log("Max:", Math.max.myApply(null, nums));`,
      },
      {
        name: 'Promise.all',
        code: `// Polyfill: Promise.all
Promise.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let remaining = 0;

    const iterable = [...promises];
    if (iterable.length === 0) return resolve([]);

    iterable.forEach((p, i) => {
      remaining++;
      Promise.resolve(p).then(
        (value) => {
          results[i] = value;
          remaining--;
          if (remaining === 0) resolve(results);
        },
        reject  // reject on first failure
      );
    });
  });
};

// Test: all resolve
Promise.myAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
]).then(r => console.log("All resolved:", r)); // [1, 2, 3]

// Test: mixed values and promises
Promise.myAll([
  42,
  Promise.resolve("hello"),
  new Promise(r => setTimeout(() => r("delayed"), 50)),
]).then(r => console.log("Mixed:", r));

// Test: one rejects
Promise.myAll([
  Promise.resolve("ok"),
  Promise.reject("fail"),
  Promise.resolve("ok2"),
]).catch(e => console.log("Rejected:", e)); // "fail"

// Test: empty array
Promise.myAll([]).then(r => console.log("Empty:", r)); // []`,
      },
      {
        name: 'Promise.allSettled',
        code: `// Polyfill: Promise.allSettled
Promise.myAllSettled = function(promises) {
  return new Promise((resolve) => {
    const results = [];
    let remaining = 0;

    const iterable = [...promises];
    if (iterable.length === 0) return resolve([]);

    iterable.forEach((p, i) => {
      remaining++;
      Promise.resolve(p).then(
        (value) => {
          results[i] = { status: "fulfilled", value };
          if (--remaining === 0) resolve(results);
        },
        (reason) => {
          results[i] = { status: "rejected", reason };
          if (--remaining === 0) resolve(results);
        }
      );
    });
  });
};

// Test: mix of resolved and rejected
Promise.myAllSettled([
  Promise.resolve("success"),
  Promise.reject("error"),
  Promise.resolve(42),
]).then(results => {
  console.log("Results:");
  results.forEach((r, i) => {
    console.log(\`  [\${i}] \${r.status}: \${r.value ?? r.reason}\`);
  });
});

// Practical: fetch multiple APIs (some may fail)
const apis = [
  Promise.resolve({ users: 10 }),
  Promise.reject(new Error("503 Service Unavailable")),
  Promise.resolve({ posts: 25 }),
];
Promise.myAllSettled(apis).then(results => {
  const successes = results.filter(r => r.status === "fulfilled");
  const failures = results.filter(r => r.status === "rejected");
  console.log(\`\\n\${successes.length} succeeded, \${failures.length} failed\`);
});`,
      },
      {
        name: 'Promise.race & any',
        code: `// Polyfill: Promise.race
Promise.myRace = function(promises) {
  return new Promise((resolve, reject) => {
    for (const p of promises) {
      Promise.resolve(p).then(resolve, reject);
    }
  });
};

// Polyfill: Promise.any
Promise.myAny = function(promises) {
  return new Promise((resolve, reject) => {
    const errors = [];
    let remaining = 0;

    const iterable = [...promises];
    if (iterable.length === 0) {
      return reject(new AggregateError([], "All promises were rejected"));
    }

    iterable.forEach((p, i) => {
      remaining++;
      Promise.resolve(p).then(resolve, (err) => {
        errors[i] = err;
        if (--remaining === 0) {
          reject(new AggregateError(errors, "All promises were rejected"));
        }
      });
    });
  });
};

// Test: race \u2014 first to settle wins
Promise.myRace([
  new Promise(r => setTimeout(() => r("slow"), 100)),
  new Promise(r => setTimeout(() => r("fast"), 10)),
]).then(v => console.log("Race winner:", v));

// Test: any \u2014 first to fulfill wins (ignores rejections)
Promise.myAny([
  Promise.reject("err1"),
  new Promise(r => setTimeout(() => r("success"), 50)),
  Promise.reject("err2"),
]).then(v => console.log("Any winner:", v));

// Test: any \u2014 all reject
Promise.myAny([
  Promise.reject("a"),
  Promise.reject("b"),
]).catch(e => console.log("All rejected:", e.message));`,
      },
      {
        name: 'Array.includes',
        code: `// Polyfill for Array.prototype.includes
// Spec quirks vs indexOf:
//   includes uses SameValueZero — so NaN includes NaN === true
//   indexOf uses strict ===     — so [NaN].indexOf(NaN) === -1

Array.prototype.myIncludes = function (target, fromIndex = 0) {
  const len = this.length;
  let start = fromIndex < 0 ? Math.max(len + fromIndex, 0) : fromIndex;
  for (let i = start; i < len; i++) {
    if (this[i] === target) return true;
    if (Number.isNaN(this[i]) && Number.isNaN(target)) return true;   // SameValueZero
  }
  return false;
};

// Tests
console.log([1, 2, 3].myIncludes(2));           // true
console.log([1, 2, 3].myIncludes(4));           // false
console.log([1, 2, 3].myIncludes(2, 2));        // false (start at index 2)
console.log([1, 2, 3].myIncludes(3, -1));       // true (negative fromIndex)
console.log([NaN].myIncludes(NaN));             // true — the SameValueZero difference`,
      },
      {
        name: 'Object.assign',
        code: `// Polyfill for Object.assign
// Copies enumerable own properties from sources to target.
// Later sources OVERWRITE earlier ones for the same key.

Object.myAssign = function (target, ...sources) {
  if (target == null) throw new TypeError("Cannot convert undefined/null to object");
  const result = Object(target);
  for (const source of sources) {
    if (source == null) continue;          // null/undefined sources are skipped
    for (const key of Object.keys(source)) {
      result[key] = source[key];
    }
  }
  return result;
};

// Tests
const merged = Object.myAssign({}, { a: 1 }, { b: 2 }, { a: 99 });
console.log(merged);                                    // { a: 99, b: 2 }

// Mutates target — returns same reference
const target = { x: 1 };
const ret = Object.myAssign(target, { y: 2 });
console.log(ret === target);                            // true
console.log(target);                                    // { x: 1, y: 2 }

// Important — only OWN enumerable props (not prototype, not symbols by default in our version)
console.log(Object.myAssign({}, "hello"));              // { 0: 'h', 1: 'e', 2: 'l', 3: 'l', 4: 'o' }`,
      },
      {
        name: 'Array.from',
        code: `// Polyfill for Array.from
// Converts iterables and array-likes into real arrays.
// Optional mapFn applied during creation (more efficient than .map after).

Array.myFrom = function (input, mapFn, thisArg) {
  const result = [];

  // Iterable case (Set, Map, generators, strings, ...)
  if (input != null && typeof input[Symbol.iterator] === "function") {
    let i = 0;
    for (const item of input) {
      result.push(mapFn ? mapFn.call(thisArg, item, i) : item);
      i++;
    }
    return result;
  }

  // Array-like case ({ length: N, 0: ..., 1: ... })
  if (input != null && typeof input.length === "number") {
    for (let i = 0; i < input.length; i++) {
      result.push(mapFn ? mapFn.call(thisArg, input[i], i) : input[i]);
    }
    return result;
  }

  return result;
};

// Tests
console.log(Array.myFrom("abc"));                         // ['a', 'b', 'c']
console.log(Array.myFrom(new Set([1, 2, 2, 3])));         // [1, 2, 3]
console.log(Array.myFrom({ length: 3 }, (_, i) => i * 2)); // [0, 2, 4]
console.log(Array.myFrom([1, 2, 3], x => x * 10));        // [10, 20, 30]
console.log(Array.myFrom(new Map([["a", 1], ["b", 2]]))); // [['a', 1], ['b', 2]]`,
      },
      {
        name: 'Array.sort',
        code: `// Polyfill for Array.prototype.sort
// Implementation here = QuickSort (V8 used to use this; modern V8 uses TimSort).
// Default comparator converts to string and compares — that's why
// [1, 10, 2].sort() returns [1, 10, 2] (string order)!

Array.prototype.mySort = function (compareFn) {
  // Default: lexicographic (string) compare
  const cmp = compareFn || ((a, b) => String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);

  // In-place QuickSort — sort returns the same array, mutated.
  const quickSort = (arr, low, high) => {
    if (low >= high) return;
    const pivot = arr[Math.floor((low + high) / 2)];
    let i = low, j = high;
    while (i <= j) {
      while (cmp(arr[i], pivot) < 0) i++;
      while (cmp(arr[j], pivot) > 0) j--;
      if (i <= j) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++; j--;
      }
    }
    quickSort(arr, low, j);
    quickSort(arr, i, high);
  };

  quickSort(this, 0, this.length - 1);
  return this;
};

// Tests
console.log([3, 1, 2].mySort());                        // [1, 2, 3]
console.log([1, 10, 2, 11].mySort());                   // [1, 10, 11, 2] — string compare!
console.log([1, 10, 2, 11].mySort((a, b) => a - b));    // [1, 2, 10, 11] — numeric
console.log([1, 10, 2, 11].mySort((a, b) => b - a));    // [11, 10, 2, 1] — descending

// Sort objects by a key
const users = [{ age: 30 }, { age: 25 }, { age: 35 }];
users.mySort((a, b) => a.age - b.age);
console.log(users);                                      // [{age:25}, {age:30}, {age:35}]

// Stability note: this implementation is NOT stable.
// Native sort has been stable since ES2019.`,
      },
      {
        name: 'Array.indexOf / lastIndexOf',
        code: `// Polyfill for Array.prototype.indexOf and lastIndexOf
// Strict equality (===), so [NaN].indexOf(NaN) === -1.
// (Use .includes if you need NaN-aware search — see the includes polyfill.)

Array.prototype.myIndexOf = function (target, fromIndex = 0) {
  const len = this.length;
  let start = fromIndex < 0 ? Math.max(len + fromIndex, 0) : fromIndex;
  for (let i = start; i < len; i++) {
    if (this[i] === target) return i;
  }
  return -1;
};

Array.prototype.myLastIndexOf = function (target, fromIndex = this.length - 1) {
  const len = this.length;
  let start = fromIndex < 0 ? len + fromIndex : Math.min(fromIndex, len - 1);
  for (let i = start; i >= 0; i--) {
    if (this[i] === target) return i;
  }
  return -1;
};

// Tests
console.log([1, 2, 3, 2, 1].myIndexOf(2));         // 1   (first match)
console.log([1, 2, 3, 2, 1].myLastIndexOf(2));     // 3   (last match)
console.log([1, 2, 3].myIndexOf(99));              // -1  (not found)
console.log([1, 2, 3, 2, 1].myIndexOf(2, 2));      // 3   (start search at index 2)
console.log([1, 2, 3, 2, 1].myLastIndexOf(2, 2));  // 1   (search backwards from index 2)
console.log([1, 2, 3].myIndexOf(3, -1));           // 2   (negative fromIndex)
console.log([NaN].myIndexOf(NaN));                 // -1  — strict equality gotcha`,
      },
      {
        name: 'Array.reverse',
        code: `// Polyfill for Array.prototype.reverse
// Mutates in place. Two-pointer swap from outside inward.

Array.prototype.myReverse = function () {
  let left = 0, right = this.length - 1;
  while (left < right) {
    [this[left], this[right]] = [this[right], this[left]];
    left++;
    right--;
  }
  return this;
};

// Tests
console.log([1, 2, 3, 4, 5].myReverse());          // [5, 4, 3, 2, 1]
console.log([].myReverse());                       // []
console.log(["a"].myReverse());                    // ["a"]
console.log([1, 2].myReverse());                   // [2, 1]

// Mutation — original array changes
const arr = [1, 2, 3];
const reversed = arr.myReverse();
console.log(arr === reversed);                     // true — same reference
console.log(arr);                                  // [3, 2, 1]

// For NON-mutating, ES2023 has toReversed():
//   const sorted = arr.toReversed();   // returns a new array`,
      },
      {
        name: 'Array.slice',
        code: `// Polyfill for Array.prototype.slice
// Returns a SHALLOW copy of a portion. Does NOT mutate the source.
// Negative indices count from the end.

Array.prototype.mySlice = function (start = 0, end = this.length) {
  const len = this.length;
  const from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
  const to = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
  const result = [];
  for (let i = from; i < to; i++) {
    result.push(this[i]);
  }
  return result;
};

// Tests
const arr = [1, 2, 3, 4, 5];

console.log(arr.mySlice(1, 3));        // [2, 3]
console.log(arr.mySlice(2));           // [3, 4, 5]   (no end)
console.log(arr.mySlice());            // [1, 2, 3, 4, 5]   (full copy)
console.log(arr.mySlice(-2));          // [4, 5]      (last 2)
console.log(arr.mySlice(1, -1));       // [2, 3, 4]   (negative end)
console.log(arr.mySlice(10));          // []          (out of range)
console.log(arr === arr.mySlice());    // false — slice returns a new array

// SHALLOW — nested objects share references with the source
const nested = [{ x: 1 }, { x: 2 }];
const copy = nested.mySlice();
copy[0].x = 999;
console.log(nested[0].x);              // 999 — same object!`,
      },
      {
        name: 'Array.splice',
        code: `// Polyfill for Array.prototype.splice
// MUTATES the array. Three jobs in one method:
//   1. Remove items from start to start+deleteCount
//   2. Insert new items at that position
//   3. Return the removed items

Array.prototype.mySplice = function (start, deleteCount, ...items) {
  const len = this.length;
  const from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
  const removeCount = deleteCount === undefined
    ? len - from
    : Math.max(0, Math.min(deleteCount, len - from));

  // Capture removed items
  const removed = [];
  for (let i = 0; i < removeCount; i++) removed.push(this[from + i]);

  // Build the new tail with inserted items
  const tail = this.slice(from + removeCount);

  // Truncate to start position, then append items + tail
  this.length = from;
  for (const item of items) this.push(item);
  for (const item of tail) this.push(item);

  return removed;
};

// Tests
const arr1 = [1, 2, 3, 4, 5];
const removed1 = arr1.mySplice(1, 2);
console.log(arr1);                              // [1, 4, 5]
console.log(removed1);                          // [2, 3]

const arr2 = [1, 2, 3];
arr2.mySplice(1, 0, 'a', 'b');                  // insert without removing
console.log(arr2);                              // [1, 'a', 'b', 2, 3]

const arr3 = [1, 2, 3, 4, 5];
arr3.mySplice(1, 2, 'a', 'b', 'c');             // remove 2, insert 3
console.log(arr3);                              // [1, 'a', 'b', 'c', 4, 5]

const arr4 = [1, 2, 3];
arr4.mySplice(-1);                              // remove last
console.log(arr4);                              // [1, 2]`,
      },
      {
        name: 'Array.concat',
        code: `// Polyfill for Array.prototype.concat
// Returns a new array combining the receiver with arguments.
// Each argument: array → spread its elements; non-array → push as-is.
// Notably does NOT recurse — only one level of array spreading.

Array.prototype.myConcat = function (...args) {
  const result = [];
  // Push receiver elements
  for (const item of this) result.push(item);
  // Push each arg (or its elements if it's an array)
  for (const arg of args) {
    if (Array.isArray(arg)) {
      for (const item of arg) result.push(item);
    } else {
      result.push(arg);
    }
  }
  return result;
};

// Tests
console.log([1, 2].myConcat([3, 4]));                  // [1, 2, 3, 4]
console.log([1, 2].myConcat([3, 4], [5, 6]));          // [1, 2, 3, 4, 5, 6]
console.log([1, 2].myConcat(3, 4));                    // [1, 2, 3, 4]   non-array args
console.log([1, 2].myConcat([3], 4, [5, 6]));          // [1, 2, 3, 4, 5, 6]   mixed

// Only one level of flattening — nested arrays stay nested
console.log([1].myConcat([[2, 3], [4]]));              // [1, [2, 3], [4]]

// Returns a NEW array; does not mutate
const arr = [1, 2];
const concatenated = arr.myConcat([3]);
console.log(arr);                                       // [1, 2]   unchanged
console.log(concatenated);                              // [1, 2, 3]`,
      },
      {
        name: 'String.padStart / padEnd',
        code: `// Polyfill for String.prototype.padStart and padEnd
// Pads a string to a target length with a fill string (default: space).
// Returns the original if already at or above target length.

String.prototype.myPadStart = function (targetLength, padString = " ") {
  if (this.length >= targetLength) return String(this);
  if (padString === "") return String(this);
  let pad = "";
  const needed = targetLength - this.length;
  while (pad.length < needed) pad += padString;
  return pad.slice(0, needed) + this;
};

String.prototype.myPadEnd = function (targetLength, padString = " ") {
  if (this.length >= targetLength) return String(this);
  if (padString === "") return String(this);
  let pad = "";
  const needed = targetLength - this.length;
  while (pad.length < needed) pad += padString;
  return this + pad.slice(0, needed);
};

// Tests
console.log("5".myPadStart(3, "0"));            // "005"
console.log("5".myPadStart(3));                 // "  5"
console.log("hello".myPadStart(3));             // "hello"  (already long enough)
console.log("hi".myPadStart(8, "ab"));          // "abababhi"
console.log("hi".myPadStart(7, "ab"));          // "ababahi" (truncated to fit)

console.log("5".myPadEnd(3, "0"));              // "500"
console.log("hi".myPadEnd(6, "."));             // "hi...."

// Common use case: time formatting
console.log(\`\${"5".myPadStart(2, "0")}:\${"7".myPadStart(2, "0")}\`);  // "05:07"`,
      },
      {
        name: 'JSON.stringify',
        code: `// Polyfill for JSON.stringify
// Recursive serialization with type-specific formatting.
// (Simplified — does not handle indent / replacer / circular detection.)

JSON.myStringify = function (value) {
  if (value === null) return "null";
  if (value === undefined) return undefined;             // top-level undefined → undefined return

  const t = typeof value;
  if (t === "number") return Number.isFinite(value) ? String(value) : "null";   // NaN/Inf → null
  if (t === "boolean") return String(value);
  if (t === "string") return '"' + value.replace(/\\\\/g, "\\\\\\\\").replace(/"/g, '\\\\"') + '"';
  if (t === "function" || t === "symbol") return undefined;                     // skipped

  if (Array.isArray(value)) {
    const items = value.map(v => {
      const serialized = JSON.myStringify(v);
      return serialized === undefined ? "null" : serialized;
    });
    return "[" + items.join(",") + "]";
  }

  if (t === "object") {
    // Use toJSON if defined (e.g., Date)
    if (typeof value.toJSON === "function") return JSON.myStringify(value.toJSON());

    const pairs = [];
    for (const key of Object.keys(value)) {
      const serialized = JSON.myStringify(value[key]);
      if (serialized !== undefined) {        // skip undefined / fn / symbol values
        pairs.push(JSON.myStringify(key) + ":" + serialized);
      }
    }
    return "{" + pairs.join(",") + "}";
  }

  return undefined;
};

// Tests
console.log(JSON.myStringify({ a: 1, b: "hi" }));            // {"a":1,"b":"hi"}
console.log(JSON.myStringify([1, 2, 3]));                    // [1,2,3]
console.log(JSON.myStringify({ x: null, y: undefined }));    // {"x":null}  — undefined dropped!
console.log(JSON.myStringify([1, undefined, 2]));            // [1,null,2]  — undefined → null
console.log(JSON.myStringify(NaN));                          // null        — NaN/Inf serialized as null
console.log(JSON.myStringify({ a: function () {} }));        // {}          — fn dropped
console.log(JSON.myStringify(new Date(0)));                  // "1970-01-01T00:00:00.000Z" via toJSON

// Compare to native
console.log(JSON.myStringify({ a: 1, b: [1, 2] }) === JSON.stringify({ a: 1, b: [1, 2] }));   // true`,
      },
      {
        name: 'Object.keys / values / entries',
        code: `// Polyfill for Object.keys, Object.values, Object.entries
// All three iterate ENUMERABLE OWN string-keyed properties.
// (Not symbols, not inherited, not non-enumerable.)

Object.myKeys = function (obj) {
  if (obj == null) throw new TypeError("Cannot convert null/undefined to object");
  const keys = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) keys.push(key);
  }
  return keys;
};

Object.myValues = function (obj) {
  return Object.myKeys(obj).map(k => obj[k]);
};

Object.myEntries = function (obj) {
  return Object.myKeys(obj).map(k => [k, obj[k]]);
};

// Tests
const user = { name: "Ana", age: 30, role: "dev" };

console.log(Object.myKeys(user));        // ["name", "age", "role"]
console.log(Object.myValues(user));      // ["Ana", 30, "dev"]
console.log(Object.myEntries(user));     // [["name", "Ana"], ["age", 30], ["role", "dev"]]

// Reconstruct an object from entries
const entries = Object.myEntries(user);
const restored = Object.fromEntries(entries);
console.log(restored);                    // { name: "Ana", age: 30, role: "dev" }

// Filter keys, then rebuild
const safe = Object.fromEntries(
  Object.myEntries(user).filter(([k]) => k !== "age")
);
console.log(safe);                        // { name: "Ana", role: "dev" }

// Inherited props are NOT included
const proto = { inherited: "yes" };
const child = Object.create(proto);
child.own = "yes";
console.log(Object.myKeys(child));        // ["own"]   — proto skipped`,
      },

      // ===== Newly added polyfills (commonly asked) =====

      {
        name: 'JSON.parse',
        code: `// Polyfill for JSON.parse — recursive descent parser.
// (The native is a hand-written state machine; this is a teaching version
// that covers strings, numbers, true/false/null, arrays, objects.)

JSON.myParse = function (text) {
  let i = 0;
  const skipWs = () => { while (i < text.length && /\\s/.test(text[i])) i++; };

  function parseValue() {
    skipWs();
    const ch = text[i];
    if (ch === '"') return parseString();
    if (ch === '{') return parseObject();
    if (ch === '[') return parseArray();
    if (ch === 't' || ch === 'f') return parseBool();
    if (ch === 'n') return parseNull();
    return parseNumber();
  }

  function parseString() {
    i++; // opening "
    let out = "";
    while (i < text.length && text[i] !== '"') {
      if (text[i] === '\\\\') {                  // escape
        i++;
        const esc = text[i++];
        out += esc === 'n' ? '\\n' : esc === 't' ? '\\t' : esc === '"' ? '"' : esc;
      } else out += text[i++];
    }
    i++; // closing "
    return out;
  }

  function parseNumber() {
    const start = i;
    while (i < text.length && /[0-9eE+\\-.]/.test(text[i])) i++;
    return Number(text.slice(start, i));
  }

  function parseBool() { const t = text.slice(i, i + 4); if (t === 'true')  { i += 4; return true; } i += 5; return false; }
  function parseNull() { i += 4; return null; }

  function parseArray() {
    i++; const out = []; skipWs();
    if (text[i] === ']') { i++; return out; }
    while (true) {
      out.push(parseValue());
      skipWs();
      if (text[i] === ',') { i++; continue; }
      if (text[i] === ']') { i++; return out; }
    }
  }

  function parseObject() {
    i++; const out = {}; skipWs();
    if (text[i] === '}') { i++; return out; }
    while (true) {
      skipWs();
      const key = parseString();
      skipWs(); i++; // colon
      out[key] = parseValue();
      skipWs();
      if (text[i] === ',') { i++; continue; }
      if (text[i] === '}') { i++; return out; }
    }
  }

  return parseValue();
};

// Tests
console.log(JSON.myParse('"hello"'));                                  // "hello"
console.log(JSON.myParse('42'));                                       // 42
console.log(JSON.myParse('-3.14'));                                    // -3.14
console.log(JSON.myParse('true'));                                     // true
console.log(JSON.myParse('null'));                                     // null
console.log(JSON.myParse('[1, 2, 3]'));                                // [1, 2, 3]
console.log(JSON.myParse('{"a": 1, "b": [true, null]}'));              // { a: 1, b: [true, null] }
console.log(JSON.myParse('{"name":"Ana","tags":["dev","js"],"age":30}'));`,
      },
      {
        name: 'Array.isArray',
        code: `// Polyfill for Array.isArray — the most reliable test.
// typeof [] === 'object' (same as object/null), so we need a smarter check.

Array.myIsArray = function (val) {
  // Object.prototype.toString tag is the historically reliable check —
  // it works across iframes (where instanceof Array fails) and survives
  // proxies. The string form is "[object Array]" for arrays only.
  return Object.prototype.toString.call(val) === '[object Array]';
};

// Tests
console.log(Array.myIsArray([]));               // true
console.log(Array.myIsArray([1, 2, 3]));        // true
console.log(Array.myIsArray("not an array"));   // false
console.log(Array.myIsArray({ length: 0 }));    // false  (array-like ≠ array)
console.log(Array.myIsArray(null));             // false
console.log(Array.myIsArray(undefined));        // false
console.log(Array.myIsArray(new Array(3)));     // true

// instanceof fails across iframes (separate Array constructor):
// const iframeArray = iframe.contentWindow.Array;
// const arr = new iframeArray(1, 2);
// arr instanceof Array        // false  ← classic gotcha
// Array.isArray(arr)          // true   ← correct

// Why typeof doesn't work:
console.log(typeof []);          // "object"
console.log(typeof null);        // "object"  — and null is not an array
console.log(typeof {});          // "object"`,
      },
      {
        name: 'Object.create',
        code: `// Polyfill for Object.create — creates an object with the given prototype.
// The classic 4-line implementation. Foundation of pre-class OOP in JS.

Object.myCreate = function (proto, props) {
  if (proto !== null && typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError("Object prototype may only be an Object or null");
  }
  function F() {}              // empty constructor
  F.prototype = proto;          // its prototype is what we want
  const obj = new F();          // new instance inherits from proto

  // Optional second argument — property descriptors map.
  if (props) Object.defineProperties(obj, props);
  return obj;
};

// Tests
const animal = {
  speak() { return \`\${this.name} makes a sound\`; }
};

const dog = Object.myCreate(animal);
dog.name = "Rex";
console.log(dog.speak());                          // "Rex makes a sound"
console.log(Object.getPrototypeOf(dog) === animal); // true

// With property descriptors
const cat = Object.myCreate(animal, {
  name:  { value: "Whiskers", writable: true, enumerable: true, configurable: true },
  legs:  { value: 4 },          // not writable / not enumerable / not configurable
});
console.log(cat.speak());                          // "Whiskers makes a sound"
console.log(cat.legs);                             // 4
cat.legs = 99;                                     // silently ignored
console.log(cat.legs);                             // 4

// Common use: prototype-based inheritance pre-class
function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return this.name + " sounds"; };

function Dog(name) { Animal.call(this, name); }
Dog.prototype = Object.myCreate(Animal.prototype);   // ← THE classic line
Dog.prototype.constructor = Dog;

const rex = new Dog("Rex");
console.log(rex.speak());                          // "Rex sounds"

// Object.create(null) makes a prototype-less object — useful as a true map
const dict = Object.myCreate(null);
dict.toString = "no inheritance";
console.log(dict.toString);                        // "no inheritance"   (no [object Object] inherited)`,
      },
      {
        name: 'Object.freeze + deepFreeze',
        code: `// Polyfill for Object.freeze — and the deepFreeze variant interviewers love.
// Native Object.freeze is shallow: nested objects can still be mutated.

Object.myFreeze = function (obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  // Make every own property non-writable + non-configurable.
  for (const key of Object.getOwnPropertyNames(obj)) {
    Object.defineProperty(obj, key, {
      writable: false,
      configurable: false,
    });
  }
  // Mark as non-extensible (no new props can be added).
  Object.preventExtensions(obj);
  return obj;
};

// Tests — shallow freeze
const user = Object.myFreeze({ name: "Ana", age: 30 });
user.name = "Bob";                  // silently ignored (strict mode would throw)
console.log(user.name);             // "Ana"
delete user.age;                    // ignored
console.log(user.age);              // 30
user.role = "dev";                  // ignored
console.log(user.role);             // undefined
console.log(Object.isFrozen(user)); // true

// Shallow freeze gotcha — nested object is still mutable
const nested = Object.myFreeze({ name: "Outer", inner: { value: 1 } });
nested.inner.value = 999;           // works! inner was not frozen
console.log(nested.inner.value);    // 999

// === deepFreeze — recursive freeze ===
function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  // Freeze nested values FIRST so freezing the parent doesn't lock us out
  // of further descents (defineProperty on a frozen object throws).
  for (const key of Object.getOwnPropertyNames(obj)) {
    deepFreeze(obj[key]);
  }
  return Object.freeze(obj);
}

const config = deepFreeze({ env: "prod", db: { host: "x", port: 5432 } });
config.db.host = "y";                // ignored — host is now frozen
console.log(config.db.host);         // "x"

// Beware cycles — naive recursion would infinite-loop.
function deepFreezeCycleSafe(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object' || seen.has(obj)) return obj;
  seen.add(obj);
  for (const key of Object.getOwnPropertyNames(obj)) deepFreezeCycleSafe(obj[key], seen);
  return Object.freeze(obj);
}
const a = { name: "A" }; a.self = a;
deepFreezeCycleSafe(a);
console.log(Object.isFrozen(a));     // true`,
      },
      {
        name: 'Array.prototype.fill',
        code: `// Polyfill for Array.prototype.fill(value, start?, end?).
// Mutates the array in place. Negative indices count from the end.
// Common interview ask alongside Array.from.

Array.prototype.myFill = function (value, start = 0, end = this.length) {
  const len = this.length;

  // Normalize negative indices.
  let i = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
  const last = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);

  while (i < last) {
    this[i++] = value;
  }
  return this;
};

// Tests
console.log([1, 2, 3, 4].myFill(0));            // [0, 0, 0, 0]
console.log([1, 2, 3, 4].myFill(7, 1, 3));      // [1, 7, 7, 4]
console.log([1, 2, 3, 4].myFill('x', -2));      // [1, 2, 'x', 'x']
console.log([1, 2, 3, 4].myFill('x', 1, -1));   // [1, 'x', 'x', 4]

// Common pattern: pre-allocate then fill
const empty = new Array(5).myFill(null);
console.log(empty);                              // [null, null, null, null, null]

// Gotcha — object reference is SHARED across all slots:
const grid = new Array(3).myFill([]);
grid[0].push("a");
console.log(grid);                               // [['a'], ['a'], ['a']]   — same array!

// Fix: use Array.from with a factory function
const realGrid = Array.from({ length: 3 }, () => []);
realGrid[0].push("a");
console.log(realGrid);                           // [['a'], [], []]   — distinct arrays`,
      },
      {
        name: 'String.prototype.repeat',
        code: `// Polyfill for String.prototype.repeat — short but classic.
// Throws on negative or non-finite count.

String.prototype.myRepeat = function (count) {
  if (this == null) throw new TypeError("Cannot call repeat on null/undefined");
  const n = Math.floor(count);
  if (n < 0 || n === Infinity) throw new RangeError("Invalid count");
  if (n === 0) return "";

  // Doubling trick — O(log n) string concatenations instead of O(n).
  // Each iteration squares the segment until we have enough, then
  // sprinkle the remaining shifted bits.
  let result = "";
  let segment = String(this);
  let i = n;
  while (i > 0) {
    if (i & 1) result += segment;     // bit set → add current segment
    i = i >>> 1;                      // halve i
    if (i > 0) segment += segment;    // double segment for next bit
  }
  return result;
};

// Tests
console.log("ab".myRepeat(3));                        // "ababab"
console.log("-".myRepeat(10));                        // "----------"
console.log("".myRepeat(5));                          // ""
console.log("x".myRepeat(0));                         // ""
console.log("hi".myRepeat(2.9));                      // "hihi"   (floored)

// RangeError tests
try { "x".myRepeat(-1); } catch (e) { console.log("caught:", e.message); }
try { "x".myRepeat(Infinity); } catch (e) { console.log("caught:", e.message); }

// Naive O(n) version — works fine for small n but bad for large n
String.prototype.myRepeatSimple = function (n) {
  let r = "";
  for (let i = 0; i < n; i++) r += this;
  return r;
};
console.log("ha".myRepeatSimple(3));                  // "hahaha"

// Practical use — padding (modern code uses padStart/padEnd, but historically:)
const padLeft = (s, width, char = " ") => char.myRepeat(Math.max(0, width - s.length)) + s;
console.log(padLeft("42", 5, "0"));                   // "00042"`,
      },
      {
        name: 'Array.prototype.join',
        code: `// Polyfill for Array.prototype.join(separator).
// Default separator is ",". null/undefined become empty strings.

Array.prototype.myJoin = function (separator = ",") {
  if (this == null) throw new TypeError("Cannot call join on null/undefined");
  const sep = String(separator);
  let result = "";
  for (let i = 0; i < this.length; i++) {
    if (i > 0) result += sep;
    const item = this[i];
    if (item != null) result += String(item);   // null/undefined → empty
  }
  return result;
};

// Tests
console.log([1, 2, 3].myJoin());              // "1,2,3"
console.log([1, 2, 3].myJoin("-"));           // "1-2-3"
console.log(["a", "b", "c"].myJoin(""));      // "abc"
console.log([].myJoin(","));                  // ""
console.log([42].myJoin(","));                // "42"

// null / undefined behave specially — they're omitted (rendered as "")
console.log([1, null, 3, undefined, 5].myJoin(","));   // "1,,3,,5"

// Sparse arrays — holes also render as ""
const sparse = [1, , , 4];                    // length 4 with two holes
console.log(sparse.myJoin(","));              // "1,,,4"

// Useful idiom — join + split is the canonical "replace all"
const text = "hello world hello";
console.log(text.split("hello").myJoin("hi")); // "hi world hi"

// Native vs polyfill output match:
const arr = [1, "two", null, true];
console.log(arr.myJoin(" | ") === arr.join(" | "));   // true`,
      },
    ],
  },
  {
    label: 'Coding Challenges',
    tag: 'JS',
    kind: 'challenge',
    templates: [
      {
        name: 'Two Sum',
        patterns: ['Hash Map / Set'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Two Sum =====
// Given an array of integers and a target,
// return indices of the two numbers that add up to target.
//
// Example: twoSum([2, 7, 11, 15], 9) \u2192 [0, 1]
//
// Constraints:
// - Each input has exactly one solution
// - You may not use the same element twice

function twoSum(nums, target) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "\u2705" : "\u274C", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Example 1", twoSum([2, 7, 11, 15], 9), [0, 1]);
test("Example 2", twoSum([3, 2, 4], 6), [1, 2]);
test("Example 3", twoSum([3, 3], 6), [0, 1]);`,
      },
      {
        name: 'Reverse String',
        patterns: ['Two Pointer'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Reverse String =====
// Reverse a string without using the built-in reverse() method.
//
// Example: reverseString("hello") \u2192 "olleh"
// Example: reverseString("world") \u2192 "dlrow"
//
// Constraints:
// - Do not use Array.prototype.reverse()
// - Try to do it in place (treat string as char array)

function reverseString(str) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "\u2705" : "\u274C", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Simple word", reverseString("hello"), "olleh");
test("Another word", reverseString("world"), "dlrow");
test("Single char", reverseString("a"), "a");
test("Empty string", reverseString(""), "");
test("Palindrome", reverseString("racecar"), "racecar");`,
      },
      {
        name: 'Valid Palindrome',
        patterns: ['Two Pointer'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Valid Palindrome =====
// Check if a string is a palindrome, considering only
// alphanumeric characters and ignoring case.
//
// Example: isPalindrome("A man, a plan, a canal: Panama") \u2192 true
// Example: isPalindrome("race a car") \u2192 false
//
// Constraints:
// - Ignore non-alphanumeric characters
// - Case insensitive comparison

function isPalindrome(s) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "\u2705" : "\u274C", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Classic palindrome", isPalindrome("A man, a plan, a canal: Panama"), true);
test("Not a palindrome", isPalindrome("race a car"), false);
test("Empty string", isPalindrome(""), true);
test("Single char", isPalindrome("a"), true);
test("With numbers", isPalindrome("0P"), false);`,
      },
      {
        name: 'FizzBuzz',
        patterns: ['Math / Bit'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: FizzBuzz =====
// Return an array of strings from 1 to n where:
// - Multiples of 3 are replaced with "Fizz"
// - Multiples of 5 are replaced with "Buzz"
// - Multiples of both 3 and 5 are replaced with "FizzBuzz"
// - Other numbers are converted to strings
//
// Example: fizzBuzz(5) \u2192 ["1", "2", "Fizz", "4", "Buzz"]
//
// Constraints:
// - Return array of strings, not print them

function fizzBuzz(n) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "\u2705" : "\u274C", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("First 5", fizzBuzz(5), ["1", "2", "Fizz", "4", "Buzz"]);
test("First 15", fizzBuzz(15), ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]);
test("Just 1", fizzBuzz(1), ["1"]);
test("FizzBuzz at 30", fizzBuzz(30).slice(-1), ["FizzBuzz"]);`,
      },
      {
        name: 'Max Profit',
        patterns: ['Greedy', 'Dynamic Programming'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Max Profit (Best Time to Buy & Sell Stock) =====
// Given an array of prices where prices[i] is the price on day i,
// find the maximum profit from one transaction (buy then sell).
// If no profit is possible, return 0.
//
// Example: maxProfit([7, 1, 5, 3, 6, 4]) \u2192 5  (buy at 1, sell at 6)
// Example: maxProfit([7, 6, 4, 3, 1]) \u2192 0  (prices only decrease)
//
// Constraints:
// - You must buy before you sell
// - Only one transaction allowed

function maxProfit(prices) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "\u2705" : "\u274C", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Normal case", maxProfit([7, 1, 5, 3, 6, 4]), 5);
test("Decreasing prices", maxProfit([7, 6, 4, 3, 1]), 0);
test("Single day", maxProfit([5]), 0);
test("Two days profit", maxProfit([1, 2]), 1);
test("Buy first sell last", maxProfit([1, 4, 2, 7]), 6);`,
      },
      {
        name: 'Valid Parentheses',
        patterns: ['Stack'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Valid Parentheses =====
// Given a string containing just '(', ')', '{', '}', '[' and ']',
// determine if the input string is valid.
//
// A string is valid if:
// - Open brackets are closed by the same type
// - Open brackets are closed in the correct order
//
// Example: isValid("()[]{}") \u2192 true
// Example: isValid("(]") \u2192 false
//
// Constraints:
// - String contains only bracket characters

function isValid(s) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "\u2705" : "\u274C", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Simple pair", isValid("()"), true);
test("Multiple types", isValid("()[]{}"), true);
test("Mismatched", isValid("(]"), false);
test("Nested valid", isValid("{[()]}"), true);
test("Wrong order", isValid("([)]"), false);
test("Empty string", isValid(""), true);`,
      },
      {
        name: 'Merge Sorted Arrays',
        patterns: ['Two Pointer'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Merge Sorted Arrays =====
// Given two sorted arrays, merge them into one sorted array.
//
// Example: mergeSorted([1, 3, 5], [2, 4, 6]) \u2192 [1, 2, 3, 4, 5, 6]
//
// Constraints:
// - Both input arrays are already sorted in ascending order
// - Do not simply concatenate and sort
// - Aim for O(n + m) time complexity

function mergeSorted(arr1, arr2) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "\u2705" : "\u274C", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Equal length", mergeSorted([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]);
test("Different lengths", mergeSorted([1, 2], [3, 4, 5, 6]), [1, 2, 3, 4, 5, 6]);
test("One empty", mergeSorted([], [1, 2, 3]), [1, 2, 3]);
test("Both empty", mergeSorted([], []), []);
test("With duplicates", mergeSorted([1, 3, 3], [2, 3, 4]), [1, 2, 3, 3, 3, 4]);`,
      },
      {
        name: 'Flatten Array',
        patterns: ['Recursion / D&C'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: Flatten Array =====
// Flatten a deeply nested array without using Array.prototype.flat().
//
// Example: flatten([1, [2, [3, [4]], 5]]) \u2192 [1, 2, 3, 4, 5]
//
// Constraints:
// - Do not use .flat() or .flatMap()
// - Handle arbitrary nesting depth
// - Return a new array (don't modify the original)

function flatten(arr) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "\u2705" : "\u274C", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Nested", flatten([1, [2, [3, [4]], 5]]), [1, 2, 3, 4, 5]);
test("Already flat", flatten([1, 2, 3]), [1, 2, 3]);
test("Deep nesting", flatten([[[[1]]]]), [1]);
test("Mixed", flatten([1, [2, 3], [4, [5, 6]]]), [1, 2, 3, 4, 5, 6]);
test("Empty arrays", flatten([[], [1], [], [2, []], 3]), [1, 2, 3]);`,
      },
      {
        name: 'Debounce',
        patterns: ['Closure / State'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: Debounce =====
// Implement a debounce function that delays invoking the provided
// function until after 'delay' milliseconds have elapsed since
// the last time it was invoked.
//
// Example:
//   const debouncedFn = debounce(fn, 300);
//   debouncedFn(); // starts timer
//   debouncedFn(); // resets timer
//   // fn is called once, 300ms after the last call
//
// Constraints:
// - Returns a new function
// - Resets the timer on each call
// - Passes arguments to the original function

function debounce(fn, delay) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
let callCount = 0;
let lastArgs = null;
const trackedFn = (...args) => { callCount++; lastArgs = args; };

const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "\u2705" : "\u274C", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

// Test: multiple rapid calls only trigger once
callCount = 0;
const debounced = debounce(trackedFn, 100);
debounced("a");
debounced("b");
debounced("c");

test("Not called immediately", callCount, 0);

setTimeout(() => {
  test("Called once after delay", callCount, 1);
  test("Called with last args", lastArgs, ["c"]);
}, 150);

// Test: separate calls with enough gap
let count2 = 0;
const debounced2 = debounce(() => count2++, 50);
debounced2();
setTimeout(() => {
  debounced2();
  setTimeout(() => {
    test("Two separate calls", count2, 2);
  }, 80);
}, 80);`,
      },
      {
        name: 'Group Anagrams',
        patterns: ['Hash Map / Set', 'Sorting'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: Group Anagrams =====
// Given an array of strings, group the anagrams together.
// An anagram is a word formed by rearranging the letters of another.
//
// Example: groupAnagrams(["eat","tea","tan","ate","nat","bat"])
//   \u2192 [["eat","tea","ate"], ["tan","nat"], ["bat"]]
//
// Constraints:
// - Order of groups doesn't matter
// - Order within groups doesn't matter
// - All inputs are lowercase letters

function groupAnagrams(strs) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  // Sort inner arrays and outer array for comparison
  const normalize = (arr) =>
    arr.map(g => [...g].sort()).sort((a, b) => a.join(",").localeCompare(b.join(",")));
  const pass = JSON.stringify(normalize(actual)) === JSON.stringify(normalize(expected));
  console.log(pass ? "\u2705" : "\u274C", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed anagrams", groupAnagrams(["eat","tea","tan","ate","nat","bat"]), [["eat","tea","ate"],["tan","nat"],["bat"]]);
test("Single string", groupAnagrams(["a"]), [["a"]]);
test("Empty string", groupAnagrams([""]), [[""]]);
test("No anagrams", groupAnagrams(["abc","def","ghi"]), [["abc"],["def"],["ghi"]]);`,
      },
      {
        name: 'Find Duplicates',
        patterns: ['Hash Map / Set'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Find Duplicates =====
// Return an array of all duplicate values in the input array.
// A duplicate appears more than once.
//
// Example: findDuplicates([1, 2, 3, 2, 4, 3, 5]) → [2, 3]
// Example: findDuplicates(["a", "b", "a", "c"]) → ["a"]
//
// Constraints:
// - Each duplicate should appear once in the result
// - Order of result doesn't matter (tests sort before comparing)
// - Aim for O(n) time, O(n) space using a hash map

function findDuplicates(arr) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const sortIfArr = (a) => Array.isArray(a) ? [...a].sort() : a;
  const pass = JSON.stringify(sortIfArr(actual)) === JSON.stringify(sortIfArr(expected));
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Numbers", findDuplicates([1, 2, 3, 2, 4, 3, 5]), [2, 3]);
test("Strings", findDuplicates(["a", "b", "a", "c"]), ["a"]);
test("No duplicates", findDuplicates([1, 2, 3, 4]), []);
test("All same", findDuplicates([7, 7, 7]), [7]);
test("Triple duplicate", findDuplicates([1, 1, 1, 2, 2]), [1, 2]);`,
      },
      {
        name: 'Remove Duplicates',
        patterns: ['Hash Map / Set'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Remove Duplicates =====
// Remove duplicate values from an array, preserving original order.
// Implement WITHOUT using Set or filter+indexOf (do it manually).
//
// Example: removeDuplicates([1, 2, 1, 3, 2, 4]) → [1, 2, 3, 4]
//
// Constraints:
// - Preserve first-seen order
// - Do NOT use new Set() or [...new Set(arr)]
// - Aim for O(n) time using a hash map

function removeDuplicates(arr) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Numbers", removeDuplicates([1, 2, 1, 3, 2, 4]), [1, 2, 3, 4]);
test("Strings", removeDuplicates(["a", "b", "a", "c", "b"]), ["a", "b", "c"]);
test("Already unique", removeDuplicates([1, 2, 3]), [1, 2, 3]);
test("All same", removeDuplicates([5, 5, 5, 5]), [5]);
test("Empty", removeDuplicates([]), []);`,
      },
      {
        name: 'Find Missing Number',
        patterns: ['Math / Bit'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Find Missing Number =====
// An array contains n distinct numbers from the range [0, n].
// Find the one number that is missing.
//
// Example: findMissing([3, 0, 1]) → 2  (range is 0..3, missing 2)
// Example: findMissing([0, 1, 3]) → 2  (range is 0..3, missing 2)
//
// Constraints:
// - Numbers are distinct, in [0, n], one is missing
// - O(n) time, O(1) space — use the sum trick: n*(n+1)/2 - sum(arr)

function findMissing(nums) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Missing 2", findMissing([3, 0, 1]), 2);
test("Missing last", findMissing([0, 1]), 2);
test("Missing first", findMissing([1, 2]), 0);
test("Single missing 0", findMissing([1]), 0);
test("Larger array", findMissing([9, 6, 4, 2, 3, 5, 7, 0, 1]), 8);`,
      },
      {
        name: 'Move Zeros',
        patterns: ['Two Pointer', 'In-Place'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Move Zeros to End =====
// Move all zeros to the end of the array, keeping non-zero
// elements in their original order. Modify in-place if you can.
//
// Example: moveZeros([0, 1, 0, 3, 12]) → [1, 3, 12, 0, 0]
//
// Constraints:
// - Preserve relative order of non-zero elements
// - Try to do it with a two-pointer approach: O(n) time, O(1) space

function moveZeros(nums) {
  // YOUR CODE HERE

  return nums;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed", moveZeros([0, 1, 0, 3, 12]), [1, 3, 12, 0, 0]);
test("All zeros", moveZeros([0, 0, 0]), [0, 0, 0]);
test("No zeros", moveZeros([1, 2, 3]), [1, 2, 3]);
test("Single zero", moveZeros([0]), [0]);
test("Zeros first", moveZeros([0, 0, 1, 2]), [1, 2, 0, 0]);`,
      },
      {
        name: 'Rotate Array',
        patterns: ['Two Pointer', 'In-Place'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: Rotate Array =====
// Rotate the array to the right by k steps.
// k may be larger than the array length — rotate by k % n.
//
// Example: rotate([1, 2, 3, 4, 5], 2) → [4, 5, 1, 2, 3]
// Example: rotate([1, 2], 5)          → [2, 1]    (5 % 2 = 1)
//
// Constraints:
// - Return the rotated array (don't print it)
// - Pure (don't mutate input) — return a new array
// - Try the slice + concat approach OR the reverse-three-times trick

function rotate(nums, k) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Rotate by 2", rotate([1, 2, 3, 4, 5], 2), [4, 5, 1, 2, 3]);
test("k > length",  rotate([1, 2], 5), [2, 1]);
test("k = 0",        rotate([1, 2, 3], 0), [1, 2, 3]);
test("k = length",   rotate([1, 2, 3], 3), [1, 2, 3]);
test("Single",       rotate([1], 5), [1]);`,
      },
      {
        name: 'Bubble Sort',
        patterns: ['Sorting'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Bubble Sort (Custom Sort, No Built-In) =====
// Sort an array of numbers ascending WITHOUT using
// Array.prototype.sort or any built-in sort.
//
// Example: bubbleSort([5, 1, 4, 2, 8]) → [1, 2, 4, 5, 8]
//
// Bubble Sort: repeatedly swap adjacent out-of-order pairs.
// Time: O(n²) worst/average, O(n) best with early-exit.
// Space: O(1) — sorts in place.

function bubbleSort(arr) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed",       bubbleSort([5, 1, 4, 2, 8]), [1, 2, 4, 5, 8]);
test("Reversed",    bubbleSort([5, 4, 3, 2, 1]), [1, 2, 3, 4, 5]);
test("Sorted",      bubbleSort([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
test("With duplicates", bubbleSort([3, 1, 2, 3, 1]), [1, 1, 2, 3, 3]);
test("Empty",       bubbleSort([]), []);`,
      },
      {
        name: 'Quick Sort',
        patterns: ['Sorting', 'Recursion / D&C'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: Quick Sort =====
// Sort using the Quick Sort algorithm. Pick a pivot, partition
// into less-than and greater-than-pivot, recursively sort each.
//
// Example: quickSort([3, 6, 1, 4, 8, 2]) → [1, 2, 3, 4, 6, 8]
//
// Average: O(n log n). Worst: O(n²) on already-sorted input
// with naive pivot. Use middle/random pivot to avoid the worst case.

function quickSort(arr) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed",      quickSort([3, 6, 1, 4, 8, 2]), [1, 2, 3, 4, 6, 8]);
test("Reversed",   quickSort([9, 7, 5, 3, 1]), [1, 3, 5, 7, 9]);
test("Sorted",     quickSort([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);
test("Single",     quickSort([42]), [42]);
test("Duplicates", quickSort([3, 1, 3, 2, 1]), [1, 1, 2, 3, 3]);`,
      },
      {
        name: 'Merge Sort',
        patterns: ['Sorting', 'Recursion / D&C'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: Merge Sort =====
// Sort using the Merge Sort algorithm. Recursively split the
// array in half, sort each half, then merge sorted halves.
//
// Example: mergeSort([5, 2, 8, 1, 9, 3]) → [1, 2, 3, 5, 8, 9]
//
// Time: O(n log n) — guaranteed, even on worst case.
// Space: O(n) — needs auxiliary arrays for merging.
// Stable: yes (preserves order of equal elements).

function mergeSort(arr) {
  // YOUR CODE HERE — split, recurse, merge

}

function merge(left, right) {
  // YOUR CODE HERE — combine two sorted arrays into one

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed",     mergeSort([5, 2, 8, 1, 9, 3]), [1, 2, 3, 5, 8, 9]);
test("Reversed",  mergeSort([5, 4, 3, 2, 1]), [1, 2, 3, 4, 5]);
test("Sorted",    mergeSort([1, 2, 3]), [1, 2, 3]);
test("Empty",     mergeSort([]), []);
test("Big",       mergeSort([10, -5, 7, 0, 3, 7]), [-5, 0, 3, 7, 7, 10]);`,
      },
      {
        name: 'Anagram Check',
        patterns: ['Hash Map / Set', 'Sorting'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Anagram Check =====
// Determine if two strings are anagrams of each other.
// Anagrams contain exactly the same letters in different order.
//
// Example: isAnagram("listen", "silent") → true
// Example: isAnagram("hello", "world")   → false
//
// Constraints:
// - Case-insensitive
// - Ignore spaces
// - O(n) time using a frequency map (NOT sort+compare)

function isAnagram(s1, s2) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Classic anagram",   isAnagram("listen", "silent"), true);
test("Not anagram",       isAnagram("hello", "world"),  false);
test("Different lengths", isAnagram("abc", "abcd"),     false);
test("Case insensitive",  isAnagram("Astronomer", "Moon starer"), true);
test("Empty strings",     isAnagram("", ""),             true);`,
      },
      {
        name: 'Longest Substring',
        patterns: ['Sliding Window', 'Hash Map / Set'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: Longest Substring Without Repeating =====
// Given a string, find the length of the longest substring
// without repeating characters.
//
// Example: lengthOfLongestSubstring("abcabcbb") → 3  ("abc")
// Example: lengthOfLongestSubstring("bbbbb")    → 1  ("b")
// Example: lengthOfLongestSubstring("pwwkew")   → 3  ("wke")
//
// Constraints:
// - Use the sliding window pattern with a Map/Set
// - O(n) time, O(min(n, charset)) space

function lengthOfLongestSubstring(s) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("abcabcbb", lengthOfLongestSubstring("abcabcbb"), 3);
test("bbbbb",    lengthOfLongestSubstring("bbbbb"), 1);
test("pwwkew",   lengthOfLongestSubstring("pwwkew"), 3);
test("Empty",    lengthOfLongestSubstring(""), 0);
test("Unique",   lengthOfLongestSubstring("abcdef"), 6);`,
      },
      {
        name: 'First Non-Repeating Char',
        patterns: ['Hash Map / Set'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: First Non-Repeating Character =====
// Return the first character in a string that does NOT repeat,
// or null if every character repeats.
//
// Example: firstNonRepeating("leetcode")     → "l"
// Example: firstNonRepeating("loveleetcode") → "v"
// Example: firstNonRepeating("aabb")         → null
//
// Constraints:
// - Two-pass: count then scan, OR one-pass with order-preserving map

function firstNonRepeating(s) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("leetcode",     firstNonRepeating("leetcode"), "l");
test("loveleetcode", firstNonRepeating("loveleetcode"), "v");
test("All repeat",   firstNonRepeating("aabb"), null);
test("Single char",  firstNonRepeating("z"), "z");
test("Empty",        firstNonRepeating(""), null);`,
      },
      {
        name: 'Sum Curry',
        patterns: ['Closure / State', 'Recursion / D&C'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: Sum Curry — sum(1)(2)(3)... =====
// Implement an infinitely curryable sum function.
// Calling it without arguments (or coercing to number) returns the total.
//
// Example: sum(1)(2)(3)()       → 6
// Example: sum(1)(2)(3)(4)(5)() → 15
//
// Constraints:
// - Must work with any number of curried calls
// - Final empty () returns the accumulated sum
// - Hint: return a function that captures the running total in closure

function sum(a) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Two args",     sum(1)(2)(),          3);
test("Three args",   sum(1)(2)(3)(),       6);
test("Five args",    sum(1)(2)(3)(4)(5)(), 15);
test("Single arg",   sum(42)(),            42);
test("With zero",    sum(0)(0)(5)(),       5);`,
      },
      {
        name: 'Memoize',
        patterns: ['Closure / State', 'Hash Map / Set'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: Memoize =====
// Implement a higher-order function that caches results of
// expensive function calls. Subsequent calls with the same
// arguments return the cached result.
//
// Example:
//   const slowAdd = (a, b) => { /* heavy work */ return a + b; };
//   const fastAdd = memoize(slowAdd);
//   fastAdd(1, 2);  // computes, returns 3
//   fastAdd(1, 2);  // cached, returns 3 instantly
//
// Constraints:
// - Cache key must distinguish different argument sets
// - JSON.stringify(args) is the simplest key strategy

function memoize(fn) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
let computeCount = 0;
const slowDouble = (n) => { computeCount++; return n * 2; };
const fastDouble = memoize(slowDouble);

console.log(fastDouble(5));   // 10  (computed)
console.log(fastDouble(5));   // 10  (cached)
console.log(fastDouble(7));   // 14  (computed)
console.log(fastDouble(5));   // 10  (cached)

console.log(computeCount === 2 ? "✅" : "❌", "Cache hit count: expected 2 computes, got", computeCount);`,
      },
      {
        name: 'Deep Clone',
        patterns: ['Recursion / D&C'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: Deep Clone =====
// Implement a deep clone function for plain JS objects/arrays.
// Modifying the clone must NOT affect the original.
//
// Example:
//   const obj = { a: { b: { c: 1 } } };
//   const copy = deepClone(obj);
//   copy.a.b.c = 999;
//   obj.a.b.c === 1  (unchanged)
//
// Constraints:
// - Handle plain objects, arrays, primitives
// - Bonus: handle Date, RegExp
// - Do NOT use structuredClone() or JSON.parse(JSON.stringify())

function deepClone(value) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

const original = { a: 1, b: { c: 2, d: [3, 4, { e: 5 }] } };
const cloned = deepClone(original);
cloned.b.c = 999;
cloned.b.d[2].e = 999;

test("Top level unchanged", original.b.c, 2);
test("Nested array unchanged", original.b.d[2].e, 5);
test("Cloned mutation works", cloned.b.c, 999);
test("Cloned array mutation works", cloned.b.d[2].e, 999);
test("Different reference", original === cloned, false);`,
      },
      {
        name: 'Throttle',
        patterns: ['Closure / State'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: Throttle =====
// Throttle ensures a function is called AT MOST once every \`limit\` ms.
// (Compare to Debounce: debounce delays until pause; throttle caps rate.)
//
// Use case: scroll/resize handlers — fire every 100ms, not 60 times/second.
//
// Example:
//   const onScroll = throttle(() => console.log("fire"), 100);
//   // 10 calls in 50ms => fires once at t=0
//   // call at t=110 => fires
//
// Constraints:
// - First call should fire immediately
// - Subsequent calls within the window should be ignored

function throttle(fn, limit) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
let count = 0;
const throttled = throttle(() => count++, 100);

throttled();  // fires (count=1)
throttled();  // throttled
throttled();  // throttled

setTimeout(() => {
  throttled();  // fires (count=2) — past the window
  setTimeout(() => {
    console.log(count === 2 ? "✅" : "❌", \`Expected 2 calls, got \${count}\`);
  }, 50);
}, 150);`,
      },
      {
        name: 'EventEmitter',
        patterns: ['Closure / State', 'Hash Map / Set'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: EventEmitter =====
// Implement a basic event emitter (pub/sub).
//
//   on(event, fn)    — register a listener
//   off(event, fn)   — remove that listener
//   emit(event, ...args) — call all listeners for event
//   once(event, fn)  — fire fn at most once
//
// Example:
//   const ee = new EventEmitter();
//   ee.on("data", (x) => console.log("got", x));
//   ee.emit("data", 42);  // got 42

class EventEmitter {
  constructor() {
    // YOUR CODE HERE
  }

  on(event, fn) {
    // YOUR CODE HERE
  }

  off(event, fn) {
    // YOUR CODE HERE
  }

  emit(event, ...args) {
    // YOUR CODE HERE
  }

  once(event, fn) {
    // YOUR CODE HERE
  }
}

// ===== TEST CASES =====
const ee = new EventEmitter();
let calls = [];
const handler = (x) => calls.push(x);

ee.on("evt", handler);
ee.emit("evt", 1);
ee.emit("evt", 2);
ee.off("evt", handler);
ee.emit("evt", 3);  // no longer registered

console.log(JSON.stringify(calls) === "[1,2]" ? "✅" : "❌", "on/off/emit:", calls);

let onceCount = 0;
ee.once("solo", () => onceCount++);
ee.emit("solo");
ee.emit("solo");
ee.emit("solo");

console.log(onceCount === 1 ? "✅" : "❌", \`once should fire 1x, fired \${onceCount}x\`);`,
      },
      {
        name: 'LRU Cache',
        patterns: ['Hash Map / Set', 'Linked List'],
        difficulty: 'Hard',
        code: `// ===== CHALLENGE: LRU Cache =====
// Least-Recently-Used cache with capacity \`n\`.
//   get(key)      — return value or -1, mark as most-recently-used
//   put(key, val) — insert/update, evict LRU if full
//
// Both operations should be O(1).
// Hint: JavaScript Map preserves insertion order — that's the trick.

class LRUCache {
  constructor(capacity) {
    // YOUR CODE HERE
  }

  get(key) {
    // YOUR CODE HERE
  }

  put(key, value) {
    // YOUR CODE HERE
  }
}

// ===== TEST CASES =====
const cache = new LRUCache(2);
cache.put(1, "a");
cache.put(2, "b");
console.log(cache.get(1));    // "a" — now most-recent
cache.put(3, "c");            // evicts key 2
console.log(cache.get(2));    // -1 (evicted)
console.log(cache.get(3));    // "c"
cache.put(4, "d");            // evicts key 1 (since 3 is most-recent)
console.log(cache.get(1));    // -1
console.log(cache.get(3));    // "c"
console.log(cache.get(4));    // "d"`,
      },
      {
        name: 'Compose & Pipe',
        patterns: ['Recursion / D&C', 'Closure / State'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: Compose & Pipe =====
// Functional composition.
//   compose(f, g, h)(x) = f(g(h(x)))   — right to left
//   pipe(f, g, h)(x)    = h(g(f(x)))   — left to right
//
// Used in libraries like Redux (compose) and RxJS (pipe).

function compose(...fns) {
  // YOUR CODE HERE

}

function pipe(...fns) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

const double = (x) => x * 2;
const addOne = (x) => x + 1;
const square = (x) => x * x;

test("compose right-to-left", compose(double, addOne)(3), 8);     // (3+1)*2 = 8
test("pipe left-to-right",    pipe(double, addOne)(3), 7);        // 3*2+1 = 7
test("Three fns compose",     compose(square, double, addOne)(2), 36); // ((2+1)*2)² = 36
test("Three fns pipe",        pipe(square, double, addOne)(2), 9); // 2²*2+1 = 9
test("Single fn",             compose(double)(5), 10);`,
      },
      {
        name: 'Binary Search',
        patterns: ['Binary Search'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Binary Search =====
// Given a SORTED array and a target, return the index of the target
// or -1 if not found. O(log n).
//
// Example: binarySearch([-1, 0, 3, 5, 9, 12], 9) → 4
// Example: binarySearch([-1, 0, 3, 5, 9, 12], 2) → -1

function binarySearch(nums, target) {
  // YOUR CODE HERE — left/right pointers, narrow the range each step

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Found in middle",  binarySearch([-1, 0, 3, 5, 9, 12], 9), 4);
test("Not found",        binarySearch([-1, 0, 3, 5, 9, 12], 2), -1);
test("First element",    binarySearch([1, 2, 3, 4, 5], 1), 0);
test("Last element",     binarySearch([1, 2, 3, 4, 5], 5), 4);
test("Empty array",      binarySearch([], 5), -1);
test("Single element",   binarySearch([42], 42), 0);`,
      },
      {
        name: 'Roman to Integer',
        patterns: ['Math / Bit'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Roman to Integer =====
// Convert a Roman numeral to an integer.
// Symbols: I=1, V=5, X=10, L=50, C=100, D=500, M=1000
// Subtraction rules: IV=4, IX=9, XL=40, XC=90, CD=400, CM=900
//
// Example: romanToInt("III")    → 3
// Example: romanToInt("LVIII")  → 58
// Example: romanToInt("MCMXCIV") → 1994

function romanToInt(s) {
  // YOUR CODE HERE
  // Hint: if current symbol < next symbol, subtract; else add

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("III",     romanToInt("III"),     3);
test("LVIII",   romanToInt("LVIII"),   58);
test("MCMXCIV", romanToInt("MCMXCIV"), 1994);
test("IV",      romanToInt("IV"),      4);
test("XL",      romanToInt("XL"),      40);`,
      },
      {
        name: 'Reverse Linked List',
        patterns: ['Linked List'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Reverse Linked List =====
// Reverse a singly linked list. Each node = { val, next }.
// Return the new head.
//
// Example: 1 -> 2 -> 3 -> null   becomes   3 -> 2 -> 1 -> null
//
// Constraints:
// - O(n) time, O(1) space iterative is the canonical answer
// - Recursive is also valid

function reverseList(head) {
  // YOUR CODE HERE — three pointers: prev, curr, next

}

// ===== HELPERS (build/render lists for testing) =====
function fromArray(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) head = { val: arr[i], next: head };
  return head;
}
function toArray(head) {
  const out = [];
  while (head) { out.push(head.val); head = head.next; }
  return out;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("1->2->3",     toArray(reverseList(fromArray([1, 2, 3]))), [3, 2, 1]);
test("Single node", toArray(reverseList(fromArray([42]))),     [42]);
test("Empty list",  toArray(reverseList(null)),                 []);
test("Long list",   toArray(reverseList(fromArray([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1]);`,
      },
      {
        name: 'Container With Most Water',
        patterns: ['Two Pointer', 'Greedy'],
        difficulty: 'Medium',
        code: `// ===== CHALLENGE: Container With Most Water =====
// Given an array of heights, find two lines that together with
// the x-axis form a container holding the most water.
// Return the maximum amount of water it can store.
//
// Example: maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]) → 49
//
// Constraints:
// - Two-pointer approach: O(n) time, O(1) space
// - Move the pointer with the smaller height inward each step

function maxArea(heights) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Standard",  maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]), 49);
test("Two bars",  maxArea([1, 1]),                       1);
test("Same",      maxArea([4, 4, 4, 4]),                 12);
test("Increasing", maxArea([1, 2, 3, 4, 5]),             6);
test("Single",    maxArea([5]),                          0);`,
      },
      {
        name: 'Climbing Stairs',
        patterns: ['Dynamic Programming'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Climbing Stairs =====
// You're climbing a staircase with n steps. Each move you can take
// either 1 step or 2 steps. How many distinct ways can you reach
// the top?
//
// Example: climbStairs(2) → 2  (1+1, or 2)
// Example: climbStairs(3) → 3  (1+1+1, 1+2, 2+1)
// Example: climbStairs(4) → 5
//
// Recognize the pattern: it's Fibonacci!
// f(n) = f(n-1) + f(n-2)
//
// Constraints:
// - O(n) time, O(1) space — track only the last two values

function climbStairs(n) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("n = 1",  climbStairs(1), 1);
test("n = 2",  climbStairs(2), 2);
test("n = 3",  climbStairs(3), 3);
test("n = 4",  climbStairs(4), 5);
test("n = 5",  climbStairs(5), 8);
test("n = 10", climbStairs(10), 89);`,
      },
      {
        name: 'Balanced Brackets (Count)',
        patterns: ['Math / Bit'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Balanced Brackets — Count Match =====
// Given a string with parens (), square brackets [], and curly braces {},
// return true if EACH PAIR has equal counts of opening and closing.
//
// Note: this is COUNT-BASED — it does NOT check nesting order.
//   "(([]))" → true   (2 of '(', 2 of ')', 1 of '[', 1 of ']')
//   "([)]"   → true   (counts match — though not properly nested!)
//   ")(["    → false  (1 ')' but no '(', 1 '[' but no ']')
//
// For ORDER-AWARE validation, see the "Valid Parentheses" template.
//
// Constraints:
// - Each pair must have equal opening + closing counts
// - Other characters (letters, digits, spaces) are ignored
//
// Show Solution covers multiple approaches:
//   - Counters per pair (best — O(n) time, O(1) space)
//   - Hash map of bracket counts (cleaner for many bracket types)
//   - Stack-based (uses more memory; not strictly needed)
//   - Regex / split+filter (most concise; multiple passes)

function isBalancedByCount(str) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Properly nested",       isBalancedByCount("(([]))"), true);
test("Unordered but balanced", isBalancedByCount("([)]"),  true);
test("Unbalanced parens",     isBalancedByCount("(("),     false);
test("Unbalanced brackets",   isBalancedByCount("[(])"),   false);
test("All three pairs",        isBalancedByCount("({[]})"), true);
test("Letters mixed in",       isBalancedByCount("a(b[c]d)e"), true);
test("Empty string",           isBalancedByCount(""),       true);
test("Reversed order",         isBalancedByCount(")("),     true);  // counts match!`,
      },
      {
        name: 'Second Largest Number',
        patterns: ['Greedy'],
        difficulty: 'Easy',
        code: `// ===== CHALLENGE: Second Largest Number =====
// Given an array of numbers, return the second largest UNIQUE value.
// If no second largest exists (e.g., array of all duplicates), return null.
//
// Example: secondLargest([3, 1, 4, 1, 5, 9, 2, 6])    → 6
// Example: secondLargest([5, 5, 5])                    → null
// Example: secondLargest([10, 5])                      → 5
//
// Constraints:
// - Do NOT use sort() — that's the whole point
// - Aim for O(n) time, O(1) space (single pass tracking top two)
//
// Show Solution covers multiple approaches:
//   - Single-pass two-variable tracking (BEST — O(n) time, O(1) space)
//   - Two-pass: find max, then find max != max
//   - Set + reduce (cleaner; O(n) time, O(n) space)
//   - Min-heap of size 2 (overkill here, useful when k > 2)

function secondLargest(nums) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Basic",                secondLargest([3, 1, 4, 1, 5, 9, 2, 6]), 6);
test("Two distinct",          secondLargest([10, 5]),                  5);
test("All duplicates",        secondLargest([5, 5, 5]),                null);
test("Two of largest",        secondLargest([7, 7, 3]),                3);
test("Negatives",             secondLargest([-1, -3, -2, -5]),         -2);
test("With zero",             secondLargest([0, 0, 0, 1]),             0);
test("Single element",        secondLargest([42]),                     null);
test("Empty",                 secondLargest([]),                       null);`,
      },

      // ===== Newly added (DP / two-pointer / backtracking / monotonic stack / linked list) =====

      {
        name: 'Maximum Subarray',
        patterns: ['Dynamic Programming', 'Greedy'],
        difficulty: 'Medium',
        code: `// ═════ CHALLENGE: Maximum Subarray (Kadane's) ═════
// Given an integer array, find the contiguous subarray with the
// largest sum and return that sum.
//
// Example: maxSubArray([-2,1,-3,4,-1,2,1,-5,4]) → 6  ([4,-1,2,1])
//
// Hint: at each i, the best subarray ending here is either
// (a) just nums[i], or (b) nums[i] + best ending at i-1.

function maxSubArray(nums) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed",        maxSubArray([-2,1,-3,4,-1,2,1,-5,4]),  6);
test("All negative", maxSubArray([-3,-1,-2]),               -1);
test("Single",       maxSubArray([5]),                       5);
test("All positive", maxSubArray([1,2,3,4]),                10);`,
      },
      {
        name: 'Trapping Rain Water',
        patterns: ['Two Pointer'],
        difficulty: 'Hard',
        code: `// ═════ CHALLENGE: Trapping Rain Water ═════
// Given an array of non-negative integers representing bar heights
// of unit width, compute how much rainwater the structure can trap.
//
// Example: trap([0,1,0,2,1,0,1,3,2,1,2,1]) → 6
//
// Hint: water above index i = min(maxLeft, maxRight) - height[i].
// The two-pointer trick computes this in O(1) extra space.

function trap(height) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Classic",  trap([0,1,0,2,1,0,1,3,2,1,2,1]),  6);
test("Plateau", trap([4,2,0,3,2,5]),               9);
test("Tiny",     trap([1,0,1]),                    1);
test("Flat",     trap([2,2,2]),                    0);`,
      },
      {
        name: '3Sum',
        patterns: ['Two Pointer', 'Sorting'],
        difficulty: 'Medium',
        code: `// ═════ CHALLENGE: 3Sum ═════
// Given an integer array, return all unique triplets [a, b, c]
// such that a + b + c === 0. The triplets themselves should NOT
// duplicate (order within a triplet must be ascending).
//
// Example: threeSum([-1,0,1,2,-1,-4]) → [[-1,-1,2], [-1,0,1]]
//
// Hint: sort the array, then for each i fix nums[i] and use a
// two-pointer scan on the right slice to find pairs summing to -nums[i].

function threeSum(nums) {
  // YOUR CODE HERE — return Array<[number, number, number]> sorted ascending
}

// ═════ TEST CASES ═════
const norm = (arrs) => arrs.map(a => [...a].sort((x,y)=>x-y)).map(a => JSON.stringify(a)).sort();
const test = (name, actual, expected) => {
  const pass = JSON.stringify(norm(actual)) === JSON.stringify(norm(expected));
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Two triplets", threeSum([-1,0,1,2,-1,-4]), [[-1,-1,2], [-1,0,1]]);
test("All zeros",    threeSum([0,0,0,0]),         [[0,0,0]]);
test("No triplets",  threeSum([1,2,3]),           []);
test("With duplicates", threeSum([-2,0,1,1,2]),   [[-2,0,2], [-2,1,1]]);`,
      },
      {
        name: 'Generate Parentheses',
        patterns: ['Backtracking', 'Recursion / D&C'],
        difficulty: 'Medium',
        code: `// ═════ CHALLENGE: Generate Parentheses ═════
// Given n pairs of parentheses, return all combinations of
// well-formed parentheses.
//
// Example: generate(3) →
//   ["((()))","(()())","(())()","()(())","()()()"]
//
// Hint: backtrack with two counters (open, close). Add '(' if
// open < n; add ')' if close < open.

function generate(n) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("n=1", generate(1), ["()"]);
test("n=2", generate(2), ["(())", "()()"]);
test("n=3", generate(3), ["((()))","(()())","(())()","()(())","()()()"]);
test("n=0", generate(0), [""]);`,
      },
      {
        name: 'Subsets',
        patterns: ['Backtracking', 'Recursion / D&C'],
        difficulty: 'Medium',
        code: `// ═════ CHALLENGE: Subsets (Power Set) ═════
// Given an array of distinct integers, return all possible subsets
// (the power set). Order of subsets in your answer does not matter
// but each subset itself should be in input order.
//
// Example: subsets([1,2,3]) → [[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]
//
// Hint: backtracking is the cleanest. Iterative bit-mask works too.

function subsets(nums) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const norm = (arrs) => [...arrs].map(a => JSON.stringify(a)).sort();
const test = (name, actual, expected) => {
  const pass = JSON.stringify(norm(actual)) === JSON.stringify(norm(expected));
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("[1,2,3]", subsets([1,2,3]), [[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]);
test("[0]",     subsets([0]),     [[], [0]]);
test("[]",      subsets([]),      [[]]);`,
      },
      {
        name: 'Permutations',
        patterns: ['Backtracking', 'Recursion / D&C'],
        difficulty: 'Medium',
        code: `// ═════ CHALLENGE: Permutations ═════
// Given an array of distinct integers, return all possible
// permutations. n! results.
//
// Example: permute([1,2,3]) →
//   [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
//
// Hint: backtracking with a "used" set, OR swap-based recursion
// in place.

function permute(nums) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const norm = (arrs) => [...arrs].map(a => JSON.stringify(a)).sort();
const test = (name, actual, expected) => {
  const pass = JSON.stringify(norm(actual)) === JSON.stringify(norm(expected));
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("[1,2,3]", permute([1,2,3]),
  [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]);
test("[0,1]",   permute([0,1]),   [[0,1],[1,0]]);
test("[1]",     permute([1]),     [[1]]);`,
      },
      {
        name: 'Min Stack',
        patterns: ['Stack'],
        difficulty: 'Medium',
        code: `// ═════ CHALLENGE: Min Stack (O(1) min) ═════
// Implement a stack with: push(x), pop(), top(), getMin().
// All operations must be O(1).
//
// Hint: keep a parallel "min stack" that tracks the running minimum
// at each level — push the new min when it's <= current min.

class MinStack {
  constructor() {
    // YOUR CODE HERE
  }
  push(x) {}
  pop() {}
  top() {}
  getMin() {}
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

const s = new MinStack();
s.push(-2); s.push(0); s.push(-3);
test("getMin after pushes", s.getMin(), -3);
s.pop();
test("top after pop",       s.top(),     0);
test("getMin after pop",    s.getMin(), -2);
s.push(-5); s.push(-5);
test("getMin two equal",    s.getMin(), -5);
s.pop();
test("getMin one popped",   s.getMin(), -5);`,
      },
      {
        name: 'Daily Temperatures',
        patterns: ['Stack'],
        difficulty: 'Medium',
        code: `// ═════ CHALLENGE: Daily Temperatures ═════
// Given an array of daily temperatures, return an array where
// answer[i] = number of days you'd have to wait until a warmer
// temperature. If never, answer[i] = 0.
//
// Example: dailyTemperatures([73,74,75,71,69,72,76,73])
//          →          [1, 1, 4, 2, 1, 1, 0, 0]
//
// Hint: monotonic decreasing stack of indices. Pop while the new
// temp is warmer than what's on top.

function dailyTemperatures(t) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed", dailyTemperatures([73,74,75,71,69,72,76,73]), [1,1,4,2,1,1,0,0]);
test("Increasing", dailyTemperatures([30,40,50,60]),         [1,1,1,0]);
test("Decreasing", dailyTemperatures([90,80,70]),            [0,0,0]);`,
      },
      {
        name: 'Coin Change',
        patterns: ['Dynamic Programming'],
        difficulty: 'Medium',
        code: `// ═════ CHALLENGE: Coin Change ═════
// Given coin denominations and an amount, return the FEWEST coins
// needed to make up that amount. -1 if impossible. Unlimited supply
// of each coin.
//
// Example: coinChange([1,2,5], 11) → 3   (5 + 5 + 1)
//
// Hint: classic 1D DP. dp[i] = min coins for amount i.

function coinChange(coins, amount) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Standard",   coinChange([1,2,5], 11),  3);
test("Impossible", coinChange([2], 3),      -1);
test("Zero",       coinChange([1], 0),       0);
test("Single",     coinChange([1,2,5], 5),   1);`,
      },
      {
        name: 'House Robber',
        patterns: ['Dynamic Programming'],
        difficulty: 'Medium',
        code: `// ═════ CHALLENGE: House Robber ═════
// Each house holds money. You cannot rob two adjacent houses
// (alarms connect). Return the max amount you can rob.
//
// Example: rob([1,2,3,1]) → 4   (rob house 0 and 2: 1 + 3)
//
// Hint: dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Two scalars
// suffice — O(1) space.

function rob(nums) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Standard",     rob([1,2,3,1]),       4);
test("Larger",       rob([2,7,9,3,1]),    12);
test("Single",       rob([5]),             5);
test("Empty",        rob([]),              0);`,
      },
      {
        name: 'Jump Game',
        patterns: ['Greedy'],
        difficulty: 'Medium',
        code: `// ═════ CHALLENGE: Jump Game ═════
// Each element nums[i] is the MAX jump length from index i.
// Return true if you can reach the last index from index 0.
//
// Example: canJump([2,3,1,1,4]) → true
//          canJump([3,2,1,0,4]) → false   (stuck at index 3)
//
// Hint: greedy. Track the farthest reachable index. If you ever
// reach an index farther than that, return false.

function canJump(nums) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Reachable",   canJump([2,3,1,1,4]), true);
test("Stuck",       canJump([3,2,1,0,4]), false);
test("Single",      canJump([0]),         true);
test("Zero start",  canJump([0,1]),       false);`,
      },
      {
        name: 'Detect Cycle in Linked List',
        patterns: ['Linked List', 'Two Pointer'],
        difficulty: 'Easy',
        code: `// ═════ CHALLENGE: Detect Cycle in Linked List ═════
// Given the head of a singly linked list, return true if a cycle
// exists, otherwise false.
//
// Example: 3 → 2 → 0 → -4 ↻ (back to 2)  → true
//
// Hint: Floyd's tortoise & hare. Slow moves 1, fast moves 2; if
// they ever meet, cycle exists. O(n) time, O(1) space.

function hasCycle(head) {
  // YOUR CODE HERE
}

// ═════ LIST HELPERS (for tests) ═════
class ListNode {
  constructor(val) { this.val = val; this.next = null; }
}
const fromArray = (arr, cycleAtIdx = -1) => {
  if (!arr.length) return null;
  const nodes = arr.map(v => new ListNode(v));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
  if (cycleAtIdx >= 0) nodes[nodes.length - 1].next = nodes[cycleAtIdx];
  return nodes[0];
};

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("With cycle",     hasCycle(fromArray([3,2,0,-4], 1)),  true);
test("No cycle",       hasCycle(fromArray([1,2,3,4])),      false);
test("Self loop",      hasCycle(fromArray([1], 0)),         true);
test("Empty",          hasCycle(null),                      false);`,
      },
      {
        name: 'Sort Colors',
        patterns: ['Two Pointer', 'In-Place'],
        difficulty: 'Medium',
        code: `// ═════ CHALLENGE: Sort Colors (Dutch Flag) ═════
// Given an array with values 0, 1, 2 only, sort them IN PLACE
// in one pass without using a sort built-in.
//
// Example: sortColors([2,0,2,1,1,0]) → [0,0,1,1,2,2]
//
// Hint: three pointers — low (next 0 slot), mid (cursor),
// high (next 2 slot). Move mid forward, swap as needed.

function sortColors(nums) {
  // YOUR CODE HERE — mutate nums; no return needed
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

const a1 = [2,0,2,1,1,0]; sortColors(a1);
test("Mixed",    a1, [0,0,1,1,2,2]);

const a2 = [2,0,1]; sortColors(a2);
test("Tiny",     a2, [0,1,2]);

const a3 = [0]; sortColors(a3);
test("Single",   a3, [0]);

const a4 = [1,1,1]; sortColors(a4);
test("All same", a4, [1,1,1]);`,
      },
      {
        name: 'Top K Frequent Elements',
        patterns: ['Hash Map / Set', 'Sorting'],
        difficulty: 'Medium',
        code: `// ═════ CHALLENGE: Top K Frequent Elements ═════
// Given an integer array and integer k, return the k most frequent
// elements. Order of the returned k elements does not matter.
//
// Example: topK([1,1,1,2,2,3], 2) → [1, 2]
//
// Hint: bucket sort by frequency runs in O(n). Heap-of-size-k is
// O(n log k). Sort all entries is O(n log n) and acceptable.

function topK(nums, k) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("k=2", topK([1,1,1,2,2,3], 2),     [1, 2]);
test("k=1", topK([1], 1),               [1]);
test("All distinct", topK([4,5,6], 2),  [4, 5]);
test("All same", topK([7,7,7], 1),      [7]);`,
      },
      {
        name: 'Merge Two Sorted Lists',
        patterns: ['Linked List', 'Two Pointer'],
        difficulty: 'Easy',
        code: `// ═════ CHALLENGE: Merge Two Sorted Lists ═════
// Given heads of two sorted singly linked lists, splice them
// together into one sorted list and return its head.
//
// Example: mergeTwoLists(1→2→4, 1→3→4) → 1→1→2→3→4→4
//
// Hint: dummy head + tail pointer. Walk both, picking the smaller
// each step. When one runs out, splice the rest of the other.

function mergeTwoLists(l1, l2) {
  // YOUR CODE HERE
}

// ═════ LIST HELPERS ═════
class ListNode {
  constructor(val) { this.val = val; this.next = null; }
}
const fromArray = (arr) => {
  if (!arr.length) return null;
  const head = new ListNode(arr[0]);
  let cur = head;
  for (let i = 1; i < arr.length; i++) { cur.next = new ListNode(arr[i]); cur = cur.next; }
  return head;
};
const toArray = (head) => {
  const out = []; let cur = head;
  while (cur) { out.push(cur.val); cur = cur.next; }
  return out;
};

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Standard",  toArray(mergeTwoLists(fromArray([1,2,4]), fromArray([1,3,4]))), [1,1,2,3,4,4]);
test("L1 empty",  toArray(mergeTwoLists(null, fromArray([0]))),                    [0]);
test("Both empty",toArray(mergeTwoLists(null, null)),                              []);
test("Disjoint",  toArray(mergeTwoLists(fromArray([1,2,3]), fromArray([4,5,6]))), [1,2,3,4,5,6]);`,
      },
    ],
  },
  {
    label: 'React Machine Coding',
    tag: 'React',
    kind: 'challenge',
    templates: [
      {
        name: 'Pagination',
        jsx: true,
        code: `// ===== MACHINE CODING: Pagination Component =====
// Build a paginated list that fetches data from a simulated API.
// - Display items for the current page
// - Show page navigation (prev/next + page numbers)
// - Handle loading state
// - Highlight the active page

// Simulated API
const ALL_ITEMS = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: \`Item #\${i + 1}\`,
  desc: \`Description for item \${i + 1}\`,
}));

function fakeFetch(page, perPage = 5) {
  return new Promise(resolve =>
    setTimeout(() => resolve({
      data: ALL_ITEMS.slice((page - 1) * perPage, page * perPage),
      total: ALL_ITEMS.length,
    }), 300)
  );
}

function Pagination() {
  const [items, setItems] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const perPage = 5;

  React.useEffect(() => {
    setLoading(true);
    fakeFetch(page, perPage).then(res => {
      setItems(res.data);
      setTotalPages(Math.ceil(res.total / perPage));
      setLoading(false);
    });
  }, [page]);

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 420 }}>
      <h3 style={{ marginTop: 0 }}>Paginated List</h3>
      {loading ? (
        <p style={{ color: "#888" }}>Loading...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map(item => (
            <li key={item.id} style={{
              padding: "10px 12px", marginBottom: 6, background: "#f5f5f5",
              borderRadius: 8, border: "1px solid #e0e0e0"
            }}>
              <strong>{item.title}</strong>
              <div style={{ fontSize: 13, color: "#666" }}>{item.desc}</div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: "flex", gap: 4, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
          style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc", cursor: page === 1 ? "default" : "pointer" }}>
          Prev
        </button>
        {pageNums.map(n => (
          <button key={n} onClick={() => setPage(n)}
            style={{
              padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc",
              background: n === page ? "#4f46e5" : "#fff",
              color: n === page ? "#fff" : "#333",
              fontWeight: n === page ? 700 : 400, cursor: "pointer",
            }}>
            {n}
          </button>
        ))}
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
          style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc", cursor: page === totalPages ? "default" : "pointer" }}>
          Next
        </button>
      </div>
      <p style={{ color: "#999", fontSize: 12, marginTop: 8 }}>
        Page {page} of {totalPages} ({ALL_ITEMS.length} items)
      </p>
    </div>
  );
}

render(<Pagination />);`,
      },
      {
        name: 'Search Filter',
        jsx: true,
        code: `// ===== MACHINE CODING: Real-time Search Filter =====
// Build a search filter for a product list.
// - Filter items as the user types (real-time)
// - Case-insensitive matching on name and category
// - Show match count
// - Highlight "no results" state

const PRODUCTS = [
  { id: 1, name: "MacBook Pro", category: "Laptops", price: 1999 },
  { id: 2, name: "iPhone 15", category: "Phones", price: 999 },
  { id: 3, name: "AirPods Pro", category: "Audio", price: 249 },
  { id: 4, name: "iPad Air", category: "Tablets", price: 599 },
  { id: 5, name: "Apple Watch", category: "Wearables", price: 399 },
  { id: 6, name: "Samsung Galaxy S24", category: "Phones", price: 849 },
  { id: 7, name: "Sony WH-1000XM5", category: "Audio", price: 349 },
  { id: 8, name: "Dell XPS 15", category: "Laptops", price: 1499 },
  { id: 9, name: "Google Pixel 8", category: "Phones", price: 699 },
  { id: 10, name: "Nintendo Switch", category: "Gaming", price: 299 },
  { id: 11, name: "Steam Deck", category: "Gaming", price: 449 },
  { id: 12, name: "Kindle Paperwhite", category: "Tablets", price: 139 },
];

function SearchFilter() {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 460 }}>
      <h3 style={{ marginTop: 0 }}>Product Search</h3>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by name or category..."
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 8,
          border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box",
        }}
      />
      <p style={{ fontSize: 13, color: "#888", margin: "8px 0" }}>
        Showing {filtered.length} of {PRODUCTS.length} products
      </p>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32, color: "#999" }}>
          No products match "{query}"
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(p => (
            <div key={p.id} style={{
              padding: "10px 14px", background: "#f8f8f8", borderRadius: 8,
              border: "1px solid #eee", display: "flex", justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <strong>{p.name}</strong>
                <div style={{ fontSize: 12, color: "#888" }}>{p.category}</div>
              </div>
              <span style={{ fontWeight: 600, color: "#4f46e5" }}>\${p.price}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

render(<SearchFilter />);`,
      },
      {
        name: 'Chat App',
        jsx: true,
        code: `// ===== MACHINE CODING: Real-time Chat Application =====
// Build a chat app with multiple users.
// - Switch between users
// - Send messages
// - Messages appear in real-time
// - Auto-scroll to latest message
// - Simulated bot replies

function ChatApp() {
  const [messages, setMessages] = React.useState([
    { id: 1, user: "Alice", text: "Hey! Ready for the interview prep?", time: "10:00 AM" },
    { id: 2, user: "Bob", text: "Yes! Let's discuss React patterns.", time: "10:01 AM" },
  ]);
  const [input, setInput] = React.useState("");
  const [currentUser, setCurrentUser] = React.useState("Alice");
  const bottomRef = React.useRef(null);
  const users = ["Alice", "Bob", "Charlie"];

  const userColors = { Alice: "#4f46e5", Bob: "#059669", Charlie: "#d97706" };

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, {
      id: Date.now(), user: currentUser, text: input.trim(), time,
    }]);
    setInput("");

    // Simulate a reply from another user
    const others = users.filter(u => u !== currentUser);
    const replier = others[Math.floor(Math.random() * others.length)];
    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const replies = ["That's a great point!", "I agree!", "Can you elaborate?", "Interesting approach!", "Let me think about that..."];
      setMessages(prev => [...prev, {
        id: Date.now(), user: replier,
        text: replies[Math.floor(Math.random() * replies.length)], time: replyTime,
      }]);
    }, 1000 + Math.random() * 1500);
  };

  return (
    <div style={{ fontFamily: "system-ui", maxWidth: 440, border: "1px solid #e0e0e0", borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", background: "#4f46e5", color: "#fff" }}>
        <strong>Chat Room</strong>
        <div style={{ fontSize: 12, opacity: 0.8 }}>{users.length} participants</div>
      </div>

      {/* User switcher */}
      <div style={{ display: "flex", gap: 4, padding: "8px 12px", background: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
        {users.map(u => (
          <button key={u} onClick={() => setCurrentUser(u)}
            style={{
              padding: "4px 12px", borderRadius: 16, border: "none", fontSize: 12,
              background: u === currentUser ? userColors[u] : "#e0e0e0",
              color: u === currentUser ? "#fff" : "#333", cursor: "pointer",
            }}>
            {u}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ height: 280, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map(msg => {
          const isMe = msg.user === currentUser;
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
              <span style={{ fontSize: 11, color: userColors[msg.user], fontWeight: 600, marginBottom: 2 }}>
                {msg.user}
              </span>
              <div style={{
                padding: "8px 12px", borderRadius: 12, maxWidth: "75%", fontSize: 14,
                background: isMe ? "#4f46e5" : "#f0f0f0",
                color: isMe ? "#fff" : "#333",
              }}>
                {msg.text}
              </div>
              <span style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{msg.time}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #e0e0e0" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={\`Message as \${currentUser}...\`}
          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}
        />
        <button onClick={sendMessage}
          style={{ padding: "8px 16px", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none", cursor: "pointer" }}>
          Send
        </button>
      </div>
    </div>
  );
}

render(<ChatApp />);`,
      },
      {
        name: 'Modal Component',
        jsx: true,
        code: `// ===== MACHINE CODING: Reusable Modal Component =====
// Build a reusable modal that:
// - Can be triggered by different buttons
// - Handles different content types (text, form, confirmation)
// - Has a close button and backdrop click to dismiss
// - Supports keyboard (Escape to close)
// - Animates in/out

function Modal({ isOpen, onClose, title, children }) {
  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 12, padding: 24, minWidth: 320,
        maxWidth: "90%", maxHeight: "80vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)", animation: "slideUp 0.2s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999", padding: 4 }}>
            x
          </button>
        </div>
        {children}
      </div>
      <style>{\`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      \`}</style>
    </div>
  );
}

function App() {
  const [activeModal, setActiveModal] = React.useState(null);
  const [formData, setFormData] = React.useState({ name: "", email: "" });

  const close = () => setActiveModal(null);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h3 style={{ marginTop: 0 }}>Reusable Modal</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setActiveModal("info")}
          style={{ padding: "8px 16px", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none", cursor: "pointer" }}>
          Info Modal
        </button>
        <button onClick={() => setActiveModal("form")}
          style={{ padding: "8px 16px", borderRadius: 8, background: "#059669", color: "#fff", border: "none", cursor: "pointer" }}>
          Form Modal
        </button>
        <button onClick={() => setActiveModal("confirm")}
          style={{ padding: "8px 16px", borderRadius: 8, background: "#dc2626", color: "#fff", border: "none", cursor: "pointer" }}>
          Confirm Modal
        </button>
      </div>
      <p style={{ color: "#888", fontSize: 13 }}>Press Escape or click backdrop to close</p>

      {/* Info Modal */}
      <Modal isOpen={activeModal === "info"} onClose={close} title="Information">
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          This is a reusable modal component. It supports different content types,
          keyboard dismissal (Escape), and backdrop click to close.
        </p>
        <button onClick={close}
          style={{ padding: "8px 20px", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none", cursor: "pointer" }}>
          Got it
        </button>
      </Modal>

      {/* Form Modal */}
      <Modal isOpen={activeModal === "form"} onClose={close} title="Contact Form">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Name" value={formData.name}
            onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          <input placeholder="Email" value={formData.email}
            onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
          <button onClick={() => { console.log("Submitted:", formData); close(); }}
            style={{ padding: "10px 20px", borderRadius: 8, background: "#059669", color: "#fff", border: "none", cursor: "pointer" }}>
            Submit
          </button>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal isOpen={activeModal === "confirm"} onClose={close} title="Are you sure?">
        <p style={{ color: "#555" }}>This action cannot be undone. Do you want to proceed?</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={close}
            style={{ padding: "8px 20px", borderRadius: 8, background: "#e5e5e5", border: "none", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={() => { console.log("Confirmed!"); close(); }}
            style={{ padding: "8px 20px", borderRadius: 8, background: "#dc2626", color: "#fff", border: "none", cursor: "pointer" }}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

render(<App />);`,
      },
      {
        name: 'Image Gallery + Lazy Load',
        jsx: true,
        code: `// ===== MACHINE CODING: Image Gallery with Lazy Loading =====
// Build an image gallery that:
// - Lazy loads images as they enter the viewport
// - Uses IntersectionObserver for efficient loading
// - Shows placeholder while loading
// - Displays in a responsive grid

function LazyImage({ src, alt, style }) {
  const [loaded, setLoaded] = React.useState(false);
  const [inView, setInView] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      ...style, background: loaded ? "transparent" : "#e0e0e0",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", position: "relative",
    }}>
      {!loaded && (
        <div style={{ color: "#999", fontSize: 13 }}>Loading...</div>
      )}
      {inView && (
        <img
          src={src} alt={alt}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease",
          }}
        />
      )}
    </div>
  );
}

function ImageGallery() {
  // Generate placeholder image URLs with different colors
  const images = Array.from({ length: 24 }, (_, i) => {
    const hue = (i * 37) % 360;
    const id = i + 10;
    return {
      id: i,
      src: \`https://picsum.photos/seed/\${id}/400/300\`,
      alt: \`Photo \${i + 1}\`,
      color: \`hsl(\${hue}, 60%, 70%)\`,
    };
  });

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h3 style={{ marginTop: 0 }}>Lazy-Loaded Image Gallery</h3>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
        Scroll down to see images load as they enter the viewport
      </p>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 8, maxHeight: 400, overflowY: "auto", padding: 4,
      }}>
        {images.map(img => (
          <LazyImage
            key={img.id}
            src={img.src}
            alt={img.alt}
            style={{
              height: 120, borderRadius: 8, background: img.color,
              border: "1px solid #e0e0e0",
            }}
          />
        ))}
      </div>
    </div>
  );
}

render(<ImageGallery />);`,
      },
      {
        name: 'Drag and Drop',
        jsx: true,
        code: `// ===== MACHINE CODING: Drag-and-Drop Interface =====
// Build a drag-and-drop interface to:
// - Reorder items within a list
// - Drag items between two lists
// - Visual feedback during drag

function DragDropApp() {
  const [todo, setTodo] = React.useState([
    { id: "1", text: "Learn React hooks" },
    { id: "2", text: "Build a portfolio" },
    { id: "3", text: "Study system design" },
    { id: "4", text: "Practice algorithms" },
  ]);
  const [done, setDone] = React.useState([
    { id: "5", text: "Setup dev environment" },
    { id: "6", text: "Read React docs" },
  ]);
  const [dragItem, setDragItem] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);

  const handleDragStart = (item, source) => {
    setDragItem({ ...item, source });
  };

  const handleDrop = (target) => {
    if (!dragItem) return;
    const { source } = dragItem;
    const item = { id: dragItem.id, text: dragItem.text };

    // Remove from source
    if (source === "todo") setTodo(prev => prev.filter(i => i.id !== item.id));
    else setDone(prev => prev.filter(i => i.id !== item.id));

    // Add to target
    if (target === "todo") setTodo(prev => [...prev, item]);
    else setDone(prev => [...prev, item]);

    setDragItem(null);
    setDragOver(null);
  };

  const renderList = (items, listId, title, color) => (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(listId); }}
      onDragLeave={() => setDragOver(null)}
      onDrop={() => handleDrop(listId)}
      style={{
        flex: 1, minWidth: 180, padding: 12, borderRadius: 12,
        background: dragOver === listId ? \`\${color}22\` : "#f8f8f8",
        border: \`2px dashed \${dragOver === listId ? color : "#e0e0e0"}\`,
        transition: "all 0.2s ease",
      }}
    >
      <h4 style={{ margin: "0 0 12px", color, display: "flex", justifyContent: "space-between" }}>
        {title}
        <span style={{
          background: color, color: "#fff", borderRadius: 12,
          padding: "2px 10px", fontSize: 13,
        }}>
          {items.length}
        </span>
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 60 }}>
        {items.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(item, listId)}
            onDragEnd={() => { setDragItem(null); setDragOver(null); }}
            style={{
              padding: "10px 12px", background: "#fff", borderRadius: 8,
              border: "1px solid #e0e0e0", cursor: "grab", fontSize: 14,
              opacity: dragItem?.id === item.id ? 0.5 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {item.text}
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", color: "#bbb", fontSize: 13 }}>
            Drop items here
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h3 style={{ marginTop: 0 }}>Drag & Drop Lists</h3>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
        Drag items between the two lists
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {renderList(todo, "todo", "To Do", "#d97706")}
        {renderList(done, "done", "Done", "#059669")}
      </div>
    </div>
  );
}

render(<DragDropApp />);`,
      },
      {
        name: 'Product List Sort & Filter',
        jsx: true,
        code: `// ===== MACHINE CODING: Product List with Sorting & Filtering =====
// Build a product list with:
// - Sort by price or rating (asc/desc)
// - Filter by category and price range
// - Show active filters and clear option

const PRODUCTS = [
  { id: 1, name: "Wireless Headphones", category: "Audio", price: 79, rating: 4.5 },
  { id: 2, name: "Bluetooth Speaker", category: "Audio", price: 49, rating: 4.2 },
  { id: 3, name: "USB-C Hub", category: "Accessories", price: 35, rating: 4.0 },
  { id: 4, name: "Mechanical Keyboard", category: "Peripherals", price: 129, rating: 4.7 },
  { id: 5, name: "Gaming Mouse", category: "Peripherals", price: 59, rating: 4.4 },
  { id: 6, name: "Webcam HD", category: "Accessories", price: 69, rating: 3.9 },
  { id: 7, name: "Monitor Stand", category: "Accessories", price: 45, rating: 4.1 },
  { id: 8, name: "Noise Cancelling Earbuds", category: "Audio", price: 149, rating: 4.6 },
  { id: 9, name: "Laptop Stand", category: "Accessories", price: 39, rating: 4.3 },
  { id: 10, name: "Wireless Mouse", category: "Peripherals", price: 29, rating: 3.8 },
  { id: 11, name: "Desk Pad", category: "Accessories", price: 25, rating: 4.0 },
  { id: 12, name: "Studio Mic", category: "Audio", price: 199, rating: 4.8 },
];

const categories = [...new Set(PRODUCTS.map(p => p.category))];

function ProductList() {
  const [sortBy, setSortBy] = React.useState("name");
  const [sortDir, setSortDir] = React.useState("asc");
  const [category, setCategory] = React.useState("all");
  const [maxPrice, setMaxPrice] = React.useState(200);

  const filtered = React.useMemo(() => {
    let items = PRODUCTS.filter(p => p.price <= maxPrice);
    if (category !== "all") items = items.filter(p => p.category === category);
    items.sort((a, b) => {
      const va = a[sortBy], vb = b[sortBy];
      const cmp = typeof va === "string" ? va.localeCompare(vb) : va - vb;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return items;
  }, [sortBy, sortDir, category, maxPrice]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("asc"); }
  };

  const clearFilters = () => { setCategory("all"); setMaxPrice(200); setSortBy("name"); setSortDir("asc"); };

  return (
    <div style={{ padding: 20, fontFamily: "system-ui", maxWidth: 480 }}>
      <h3 style={{ marginTop: 0 }}>Product List</h3>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <select value={category} onChange={e => setCategory(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd" }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13 }}>Max $</span>
          <input type="range" min={0} max={200} value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: 100 }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>\${maxPrice}</span>
        </div>
        <button onClick={clearFilters}
          style={{ padding: "6px 12px", borderRadius: 6, background: "#f0f0f0", border: "1px solid #ddd", cursor: "pointer", fontSize: 12 }}>
          Clear
        </button>
      </div>

      {/* Sort buttons */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {[["name", "Name"], ["price", "Price"], ["rating", "Rating"]].map(([key, label]) => (
          <button key={key} onClick={() => toggleSort(key)}
            style={{
              padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              background: sortBy === key ? "#4f46e5" : "#f0f0f0",
              color: sortBy === key ? "#fff" : "#333",
              border: sortBy === key ? "1px solid #4f46e5" : "1px solid #ddd",
            }}>
            {label} {sortBy === key ? (sortDir === "asc" ? " \\u2191" : " \\u2193") : ""}
          </button>
        ))}
      </div>

      {/* Product cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", padding: 20 }}>No products match your filters</p>
        ) : filtered.map(p => (
          <div key={p.id} style={{
            padding: "10px 14px", background: "#f8f8f8", borderRadius: 8,
            border: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <strong>{p.name}</strong>
              <div style={{ fontSize: 12, color: "#888" }}>{p.category}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 600, color: "#4f46e5" }}>\${p.price}</div>
              <div style={{ fontSize: 12, color: "#f59e0b" }}>{"\\u2605".repeat(Math.round(p.rating))} {p.rating}</div>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>{filtered.length} products shown</p>
    </div>
  );
}

render(<ProductList />);`,
      },
      {
        name: 'Responsive Navbar',
        jsx: true,
        code: `// ===== MACHINE CODING: Responsive Navbar =====
// Build a responsive navbar that:
// - Shows full menu on desktop
// - Collapses to hamburger menu on mobile
// - Smooth slide-in mobile menu
// - Active link highlighting
// - Resize to see it adapt!

function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [active, setActive] = React.useState("Home");
  const [width, setWidth] = React.useState(400);

  const links = ["Home", "About", "Services", "Portfolio", "Blog", "Contact"];

  const isMobile = width < 500;

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <p style={{ fontSize: 13, color: "#888", margin: "0 0 8px", padding: "0 8px" }}>
        Drag slider to simulate viewport: {width}px
      </p>
      <input type="range" min={280} max={700} value={width}
        onChange={e => { setWidth(Number(e.target.value)); setMenuOpen(false); }}
        style={{ width: "100%", marginBottom: 12 }} />

      {/* Simulated viewport */}
      <div style={{ width, margin: "0 auto", border: "2px solid #ddd", borderRadius: 12, overflow: "hidden", transition: "width 0.3s" }}>
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "#1a1a2e", color: "#fff", position: "relative",
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#818cf8" }}>PrepHub</div>

          {/* Desktop links */}
          {!isMobile && (
            <div style={{ display: "flex", gap: 4 }}>
              {links.map(link => (
                <button key={link} onClick={() => setActive(link)}
                  style={{
                    background: active === link ? "#4f46e5" : "transparent",
                    color: "#fff", border: "none", padding: "6px 12px",
                    borderRadius: 6, cursor: "pointer", fontSize: 13,
                    transition: "background 0.2s",
                  }}>
                  {link}
                </button>
              ))}
            </div>
          )}

          {/* Hamburger */}
          {isMobile && (
            <button onClick={() => setMenuOpen(m => !m)}
              style={{
                background: "none", border: "none", color: "#fff",
                fontSize: 22, cursor: "pointer", padding: 4, lineHeight: 1,
              }}>
              {menuOpen ? "\\u2715" : "\\u2630"}
            </button>
          )}
        </nav>

        {/* Mobile menu */}
        {isMobile && (
          <div style={{
            maxHeight: menuOpen ? links.length * 48 : 0,
            overflow: "hidden", background: "#16162a",
            transition: "max-height 0.3s ease",
          }}>
            {links.map(link => (
              <button key={link}
                onClick={() => { setActive(link); setMenuOpen(false); }}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "12px 20px", background: active === link ? "#4f46e5" : "transparent",
                  color: "#fff", border: "none", borderTop: "1px solid #2a2a4a",
                  cursor: "pointer", fontSize: 14,
                }}>
                {link}
              </button>
            ))}
          </div>
        )}

        {/* Page content */}
        <div style={{ padding: 24, background: "#fff", minHeight: 120 }}>
          <h2 style={{ margin: "0 0 8px", color: "#1a1a2e" }}>{active}</h2>
          <p style={{ color: "#888", fontSize: 14, margin: 0 }}>
            This is the {active.toLowerCase()} page content. Resize the viewport above to see the navbar adapt.
          </p>
        </div>
      </div>
    </div>
  );
}

render(<Navbar />);`,
      },
      {
        name: 'Infinite Scroll',
        jsx: true,
        code: `// ===== MACHINE CODING: Infinite Scrolling List =====
// Build an infinite scrolling list that:
// - Loads more items when scrolling near the bottom
// - Uses IntersectionObserver (no scroll event listener)
// - Shows loading indicator
// - Handles "no more data" state

function fakeAPI(page) {
  const totalPages = 8;
  return new Promise(resolve =>
    setTimeout(() => {
      if (page > totalPages) return resolve({ items: [], hasMore: false });
      const items = Array.from({ length: 10 }, (_, i) => ({
        id: (page - 1) * 10 + i + 1,
        title: \`Post #\${(page - 1) * 10 + i + 1}\`,
        body: \`This is the content for post \${(page - 1) * 10 + i + 1}. It was loaded on page \${page}.\`,
        author: ["Alice", "Bob", "Charlie", "Diana"][((page - 1) * 10 + i) % 4],
      }));
      resolve({ items, hasMore: page < totalPages });
    }, 500 + Math.random() * 500)
  );
}

function InfiniteScroll() {
  const [items, setItems] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const sentinelRef = React.useRef(null);

  const loadMore = React.useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    fakeAPI(page).then(res => {
      setItems(prev => [...prev, ...res.items]);
      setHasMore(res.hasMore);
      setPage(p => p + 1);
      setLoading(false);
    });
  }, [page, loading, hasMore]);

  // Initial load
  React.useEffect(() => { loadMore(); }, []);

  // IntersectionObserver for sentinel element
  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const colors = { Alice: "#4f46e5", Bob: "#059669", Charlie: "#d97706", Diana: "#dc2626" };

  return (
    <div style={{ padding: 20, fontFamily: "system-ui", maxWidth: 440 }}>
      <h3 style={{ marginTop: 0 }}>Infinite Scroll Feed</h3>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
        {items.length} items loaded. {hasMore ? "Scroll down for more." : "All items loaded!"}
      </p>
      <div style={{ maxHeight: 400, overflowY: "auto", borderRadius: 12, border: "1px solid #e0e0e0" }}>
        {items.map(item => (
          <div key={item.id} style={{
            padding: "12px 16px", borderBottom: "1px solid #f0f0f0",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: 14 }}>{item.title}</strong>
              <span style={{
                fontSize: 11, padding: "2px 8px", borderRadius: 10,
                background: colors[item.author] + "18", color: colors[item.author],
                fontWeight: 600,
              }}>
                {item.author}
              </span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{item.body}</p>
          </div>
        ))}

        {/* Sentinel element for IntersectionObserver */}
        {hasMore && (
          <div ref={sentinelRef} style={{ padding: 20, textAlign: "center" }}>
            {loading && <span style={{ color: "#888" }}>Loading more...</span>}
          </div>
        )}

        {!hasMore && items.length > 0 && (
          <div style={{ padding: 16, textAlign: "center", color: "#999", fontSize: 13 }}>
            You've reached the end!
          </div>
        )}
      </div>
    </div>
  );
}

render(<InfiniteScroll />);`,
      },
      {
        name: 'Notifications',
        jsx: true,
        code: `// ===== MACHINE CODING: Real-time Notifications =====
// Build a notifications system that:
// - Shows toast notifications dynamically
// - Supports different types (success, error, warning, info)
// - Auto-dismiss after timeout
// - Manual dismiss with close button
// - Stacked positioning with animation

function useNotifications() {
  const [notifications, setNotifications] = React.useState([]);

  const add = React.useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = React.useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, add, dismiss };
}

function Toast({ notification, onDismiss }) {
  const colors = {
    success: { bg: "#ecfdf5", border: "#059669", icon: "\\u2705" },
    error:   { bg: "#fef2f2", border: "#dc2626", icon: "\\u274C" },
    warning: { bg: "#fffbeb", border: "#d97706", icon: "\\u26A0\\uFE0F" },
    info:    { bg: "#eff6ff", border: "#3b82f6", icon: "\\u2139\\uFE0F" },
  };
  const c = colors[notification.type] || colors.info;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: 8, marginBottom: 8,
      background: c.bg, borderLeft: \`4px solid \${c.border}\`,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      animation: "slideIn 0.3s ease", minWidth: 260,
    }}>
      <span style={{ fontSize: 16 }}>{c.icon}</span>
      <span style={{ flex: 1, fontSize: 13, color: "#333" }}>{notification.message}</span>
      <button onClick={() => onDismiss(notification.id)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 16, padding: 2 }}>
        x
      </button>
    </div>
  );
}

function App() {
  const { notifications, add, dismiss } = useNotifications();
  const [autoCount, setAutoCount] = React.useState(0);

  // Simulate real-time notifications
  React.useEffect(() => {
    const events = [
      { msg: "New message from Alice", type: "info" },
      { msg: "Deployment successful!", type: "success" },
      { msg: "High memory usage detected", type: "warning" },
      { msg: "Build failed on main branch", type: "error" },
    ];
    const interval = setInterval(() => {
      setAutoCount(c => {
        if (c < 3) {
          const evt = events[c % events.length];
          add(evt.msg, evt.type);
        }
        return c + 1;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <style>{\`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      \`}</style>

      <h3 style={{ marginTop: 0 }}>Notification System</h3>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
        Click buttons or wait for auto-notifications. They dismiss after 3s.
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        <button onClick={() => add("Operation completed!", "success")}
          style={{ padding: "6px 14px", borderRadius: 6, background: "#059669", color: "#fff", border: "none", cursor: "pointer" }}>
          Success
        </button>
        <button onClick={() => add("Something went wrong!", "error")}
          style={{ padding: "6px 14px", borderRadius: 6, background: "#dc2626", color: "#fff", border: "none", cursor: "pointer" }}>
          Error
        </button>
        <button onClick={() => add("Please check your input", "warning")}
          style={{ padding: "6px 14px", borderRadius: 6, background: "#d97706", color: "#fff", border: "none", cursor: "pointer" }}>
          Warning
        </button>
        <button onClick={() => add("You have 3 new updates", "info")}
          style={{ padding: "6px 14px", borderRadius: 6, background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer" }}>
          Info
        </button>
        <button onClick={() => add("This one stays! Click x to dismiss.", "info", 0)}
          style={{ padding: "6px 14px", borderRadius: 6, background: "#6b7280", color: "#fff", border: "none", cursor: "pointer" }}>
          Persistent
        </button>
      </div>

      {/* Notification container */}
      <div style={{ position: "relative" }}>
        {notifications.length === 0 ? (
          <p style={{ color: "#ccc", fontSize: 13 }}>No notifications. Click a button or wait...</p>
        ) : (
          notifications.map(n => <Toast key={n.id} notification={n} onDismiss={dismiss} />)
        )}
      </div>
    </div>
  );
}

render(<App />);`,
      },
      {
        name: 'Star Rating',
        jsx: true,
        code: `// ===== MACHINE CODING: Star Rating =====
// 5-star rating component with hover preview.
// - Click to set rating
// - Hover to preview the rating
// - Half-stars optional (basic version: whole stars only)

function StarRating({ totalStars = 5, initialRating = 0, onChange }) {
  const [rating, setRating] = React.useState(initialRating);
  const [hover, setHover] = React.useState(0);

  function handleSelect(value) {
    setRating(value);
    onChange?.(value);
  }

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: totalStars }, (_, i) => {
        const value = i + 1;
        const filled = value <= (hover || rating);
        return (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 32, padding: 0, lineHeight: 1,
              color: filled ? "#fbbf24" : "#444",
              transition: "color 0.15s",
            }}
            aria-label={\`Rate \${value} of \${totalStars}\`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

function App() {
  const [rating, setRating] = React.useState(0);
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Star Rating</h2>
      <StarRating onChange={setRating} />
      <p style={{ marginTop: 16, color: "#aaa" }}>
        Current rating: <strong style={{ color: "#fbbf24" }}>{rating}/5</strong>
      </p>
    </div>
  );
}

render(<App />);`,
      },
      {
        name: 'Tabs',
        jsx: true,
        code: `// ===== MACHINE CODING: Tabs Component =====
// Compound component pattern: <Tabs> + <Tabs.Tab> + <Tabs.Panel>
// share state via Context. The user composes; the library wires it.

const TabsContext = React.createContext(null);

function Tabs({ children, defaultIndex = 0 }) {
  const [active, setActive] = React.useState(defaultIndex);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #444" }}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabList({ children }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #444", background: "#222" }}>
      {children}
    </div>
  );
};

Tabs.Tab = function Tab({ index, children }) {
  const { active, setActive } = React.useContext(TabsContext);
  const isActive = active === index;
  return (
    <button
      onClick={() => setActive(index)}
      style={{
        flex: 1, padding: "12px 16px", border: "none", cursor: "pointer",
        background: isActive ? "#1e293b" : "transparent",
        color: isActive ? "#60a5fa" : "#aaa",
        borderBottom: isActive ? "2px solid #60a5fa" : "2px solid transparent",
        fontWeight: isActive ? 600 : 400, fontSize: 14, transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function Panel({ index, children }) {
  const { active } = React.useContext(TabsContext);
  if (active !== index) return null;
  return <div style={{ padding: 20, color: "#ddd", background: "#1e293b" }}>{children}</div>;
};

function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Tabs Component</h2>
      <Tabs defaultIndex={0}>
        <Tabs.List>
          <Tabs.Tab index={0}>Profile</Tabs.Tab>
          <Tabs.Tab index={1}>Settings</Tabs.Tab>
          <Tabs.Tab index={2}>Billing</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel index={0}>
          <h3>Profile</h3><p>Manage your profile information.</p>
        </Tabs.Panel>
        <Tabs.Panel index={1}>
          <h3>Settings</h3><p>App preferences and notifications.</p>
        </Tabs.Panel>
        <Tabs.Panel index={2}>
          <h3>Billing</h3><p>Subscription and payment methods.</p>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

render(<App />);`,
      },
      {
        name: 'Accordion',
        jsx: true,
        code: `// ===== MACHINE CODING: Accordion =====
// Expand/collapse panels. Supports single-open or multi-open mode.
// - allowMultiple={true}: many panels open at once
// - allowMultiple={false}: only one open at a time (radio-like)

function Accordion({ items, allowMultiple = false }) {
  const [openIds, setOpenIds] = React.useState(new Set());

  function toggle(id) {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div style={{ border: "1px solid #444", borderRadius: 8, overflow: "hidden" }}>
      {items.map(item => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id} style={{ borderBottom: "1px solid #333" }}>
            <button
              onClick={() => toggle(item.id)}
              style={{
                width: "100%", padding: "14px 16px", border: "none", cursor: "pointer",
                background: isOpen ? "#1e293b" : "#222", color: "#fff",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontSize: 15, fontWeight: 500, textAlign: "left",
              }}
            >
              <span>{item.title}</span>
              <span style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.2s", color: "#60a5fa",
              }}>▼</span>
            </button>
            {isOpen && (
              <div style={{ padding: "14px 16px", background: "#0f172a", color: "#cbd5e1", fontSize: 14 }}>
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function App() {
  const items = [
    { id: 1, title: "What is React?", content: "A JavaScript library for building user interfaces." },
    { id: 2, title: "What are hooks?", content: "Functions that let you use state and lifecycle in function components." },
    { id: 3, title: "What is reconciliation?", content: "React's algorithm for diffing the virtual DOM and updating the real DOM efficiently." },
  ];
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Accordion (single-open)</h2>
      <Accordion items={items} allowMultiple={false} />
      <h2 style={{ marginTop: 24 }}>Accordion (multi-open)</h2>
      <Accordion items={items} allowMultiple={true} />
    </div>
  );
}

render(<App />);`,
      },
      {
        name: 'OTP Input',
        jsx: true,
        code: `// ===== MACHINE CODING: OTP Input =====
// 6-digit OTP input that:
// - Auto-advances to next field on input
// - Backspace moves to previous field when current is empty
// - Accepts digits only
// - Paste support: distributes digits across fields

function OTPInput({ length = 6, onComplete }) {
  const [digits, setDigits] = React.useState(Array(length).fill(""));
  const refs = React.useRef([]);

  React.useEffect(() => {
    if (digits.every(d => d !== "")) onComplete?.(digits.join(""));
  }, [digits]);

  function handleChange(i, value) {
    if (!/^\\d?$/.test(value)) return;   // digits only, single char
    const next = [...digits];
    next[i] = value;
    setDigits(next);
    if (value && i < length - 1) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div style={{ display: "flex", gap: 8 }} onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
          style={{
            width: 44, height: 52, textAlign: "center",
            fontSize: 22, fontWeight: 600, border: "1px solid #444",
            background: "#1e293b", color: "#fff", borderRadius: 8,
            outline: "none", caretColor: "#60a5fa",
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [otp, setOtp] = React.useState("");
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>OTP Input</h2>
      <p style={{ color: "#aaa", marginBottom: 16 }}>
        Enter the 6-digit code (or paste it):
      </p>
      <OTPInput onComplete={setOtp} />
      {otp && (
        <p style={{ marginTop: 20, color: "#10b981", fontWeight: 600 }}>
          ✓ Submitted: {otp}
        </p>
      )}
    </div>
  );
}

render(<App />);`,
      },
      {
        name: 'Tic-Tac-Toe',
        jsx: true,
        code: `// ===== MACHINE CODING: Tic-Tac-Toe =====
// Classic 3x3 tic-tac-toe.
// - Two players (X and O) alternate
// - Detect winner across rows, columns, diagonals
// - Detect draw
// - Reset button

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],     // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],     // cols
  [0, 4, 8], [2, 4, 6],                // diagonals
];

function calculateWinner(squares) {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

function Square({ value, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 70, height: 70, fontSize: 32, fontWeight: 700,
        background: highlight ? "#10b981" : "#1e293b",
        color: value === "X" ? "#60a5fa" : value === "O" ? "#f87171" : "#fff",
        border: "1px solid #444", cursor: value ? "default" : "pointer",
        transition: "background 0.2s",
      }}
    >
      {value}
    </button>
  );
}

function App() {
  const [squares, setSquares] = React.useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = React.useState(true);

  const result = calculateWinner(squares);
  const winner = result?.winner;
  const isDraw = !winner && squares.every(Boolean);

  function handleClick(i) {
    if (squares[i] || winner) return;
    const next = squares.slice();
    next[i] = xIsNext ? "X" : "O";
    setSquares(next);
    setXIsNext(!xIsNext);
  }

  function reset() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  const status = winner
    ? \`🏆 Winner: \${winner}\`
    : isDraw
    ? "🤝 Draw"
    : \`Turn: \${xIsNext ? "X" : "O"}\`;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff", textAlign: "center" }}>
      <h2>Tic-Tac-Toe</h2>
      <p style={{ fontSize: 18, color: winner ? "#10b981" : "#aaa", margin: "12px 0 20px" }}>
        {status}
      </p>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 70px)",
        gap: 4, justifyContent: "center", marginBottom: 20,
      }}>
        {squares.map((value, i) => (
          <Square
            key={i}
            value={value}
            onClick={() => handleClick(i)}
            highlight={result?.line.includes(i)}
          />
        ))}
      </div>
      <button
        onClick={reset}
        style={{
          padding: "10px 20px", background: "#3b82f6", color: "#fff",
          border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600,
        }}
      >
        Reset
      </button>
    </div>
  );
}

render(<App />);`,
      },
      {
        name: 'Stopwatch',
        jsx: true,
        code: `// ===== MACHINE CODING: Stopwatch =====
// Start, pause, resume, reset. Display HH:MM:SS.ms.
// Uses requestAnimationFrame for smooth millisecond updates.

function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor((ms % 1000) / 10);
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  return \`\${pad(hours)}:\${pad(minutes)}:\${pad(seconds)}.\${pad(millis)}\`;
}

function App() {
  const [elapsed, setElapsed] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const startRef = React.useRef(0);
  const baseRef = React.useRef(0);
  const rafRef = React.useRef(null);

  React.useEffect(() => {
    if (!running) return;
    const tick = () => {
      setElapsed(baseRef.current + (Date.now() - startRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  function start() {
    startRef.current = Date.now();
    setRunning(true);
  }
  function pause() {
    baseRef.current = elapsed;
    setRunning(false);
  }
  function reset() {
    baseRef.current = 0;
    setElapsed(0);
    setRunning(false);
  }

  const btnStyle = (color) => ({
    padding: "10px 20px", border: "none", borderRadius: 8,
    color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
    background: color, marginRight: 8,
  });

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff", textAlign: "center" }}>
      <h2>Stopwatch</h2>
      <div style={{
        fontSize: 48, fontFamily: "monospace", margin: "24px 0",
        background: "#0f172a", padding: "20px 24px", borderRadius: 12,
        color: "#60a5fa", letterSpacing: 2,
      }}>
        {formatTime(elapsed)}
      </div>
      {!running ? (
        <button onClick={start} style={btnStyle("#10b981")}>
          {elapsed > 0 ? "Resume" : "Start"}
        </button>
      ) : (
        <button onClick={pause} style={btnStyle("#f59e0b")}>Pause</button>
      )}
      <button onClick={reset} style={btnStyle("#475569")}>Reset</button>
    </div>
  );
}

render(<App />);`,
      },
      {
        name: 'Calculator',
        jsx: true,
        code: `// ===== MACHINE CODING: Calculator =====
// Standard 4-function calculator with display, digits, ops, equals, clear.

function App() {
  const [display, setDisplay] = React.useState("0");
  const [previous, setPrevious] = React.useState(null);
  const [op, setOp] = React.useState(null);
  const [overwrite, setOverwrite] = React.useState(false);

  function inputDigit(d) {
    if (overwrite) {
      setDisplay(d);
      setOverwrite(false);
    } else {
      setDisplay(display === "0" ? d : display + d);
    }
  }

  function inputDot() {
    if (overwrite) { setDisplay("0."); setOverwrite(false); return; }
    if (!display.includes(".")) setDisplay(display + ".");
  }

  function chooseOp(nextOp) {
    const value = parseFloat(display);
    if (previous == null) {
      setPrevious(value);
    } else if (op) {
      const result = compute(previous, value, op);
      setDisplay(String(result));
      setPrevious(result);
    }
    setOp(nextOp);
    setOverwrite(true);
  }

  function compute(a, b, op) {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b === 0 ? 0 : a / b;
      default: return b;
    }
  }

  function equals() {
    if (op == null || previous == null) return;
    const value = parseFloat(display);
    setDisplay(String(compute(previous, value, op)));
    setPrevious(null);
    setOp(null);
    setOverwrite(true);
  }

  function clear() {
    setDisplay("0"); setPrevious(null); setOp(null); setOverwrite(false);
  }

  const btn = (label, onClick, bg = "#1e293b") => (
    <button
      onClick={onClick}
      style={{
        padding: 16, fontSize: 18, border: "none", borderRadius: 8,
        background: bg, color: "#fff", cursor: "pointer", fontWeight: 600,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Calculator</h2>
      <div style={{
        background: "#0f172a", padding: 20, borderRadius: 12,
        fontSize: 36, textAlign: "right", color: "#60a5fa",
        fontFamily: "monospace", marginBottom: 12, minHeight: 60,
      }}>
        {display}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {btn("C", clear, "#dc2626")}
        {btn("/", () => chooseOp("/"), "#f59e0b")}
        {btn("*", () => chooseOp("*"), "#f59e0b")}
        {btn("-", () => chooseOp("-"), "#f59e0b")}
        {btn("7", () => inputDigit("7"))}{btn("8", () => inputDigit("8"))}{btn("9", () => inputDigit("9"))}
        {btn("+", () => chooseOp("+"), "#f59e0b")}
        {btn("4", () => inputDigit("4"))}{btn("5", () => inputDigit("5"))}{btn("6", () => inputDigit("6"))}
        {btn("=", equals, "#10b981")}
        {btn("1", () => inputDigit("1"))}{btn("2", () => inputDigit("2"))}{btn("3", () => inputDigit("3"))}
        {btn(".", inputDot)}
        {btn("0", () => inputDigit("0"))}
      </div>
    </div>
  );
}

render(<App />);`,
      },
      {
        name: 'Auto-suggest',
        jsx: true,
        code: `// ===== MACHINE CODING: Auto-suggest / Typeahead =====
// Filter a list as the user types. Keyboard navigation (arrow keys + Enter).
// Click outside to close the dropdown.

const ALL_FRUITS = [
  "Apple", "Apricot", "Avocado", "Banana", "Blackberry", "Blueberry",
  "Cherry", "Coconut", "Cranberry", "Date", "Dragonfruit", "Durian",
  "Fig", "Grape", "Grapefruit", "Guava", "Kiwi", "Lemon", "Lime",
  "Mango", "Melon", "Orange", "Papaya", "Peach", "Pear", "Pineapple",
  "Plum", "Raspberry", "Strawberry", "Watermelon",
];

function App() {
  const [query, setQuery] = React.useState("");
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  const matches = React.useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return ALL_FRUITS.filter(f => f.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  React.useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleKeyDown(e) {
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(matches[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function select(item) {
    setQuery(item);
    setOpen(false);
    setHighlightIndex(0);
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Auto-suggest</h2>
      <div ref={containerRef} style={{ position: "relative", maxWidth: 320 }}>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlightIndex(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type a fruit..."
          style={{
            width: "100%", padding: "10px 14px", fontSize: 15,
            background: "#1e293b", color: "#fff", border: "1px solid #444",
            borderRadius: 8, outline: "none",
          }}
        />
        {open && matches.length > 0 && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "#0f172a", border: "1px solid #444", borderTop: "none",
            borderRadius: "0 0 8px 8px", maxHeight: 240, overflowY: "auto",
            zIndex: 10,
          }}>
            {matches.map((item, i) => (
              <div
                key={item}
                onMouseEnter={() => setHighlightIndex(i)}
                onClick={() => select(item)}
                style={{
                  padding: "10px 14px", cursor: "pointer",
                  background: i === highlightIndex ? "#1e293b" : "transparent",
                  color: i === highlightIndex ? "#60a5fa" : "#cbd5e1",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
      <p style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
        Type · Arrow keys to navigate · Enter to select · Esc to close
      </p>
    </div>
  );
}

render(<App />);`,
      },
      {
        name: 'Toast / Snackbar',
        jsx: true,
        code: `// ===== MACHINE CODING: Toast / Snackbar =====
// Toast queue with auto-dismiss. Stack multiple toasts.
// Trigger by calling a function (typical pattern: useToast hook).

function useToast() {
  const [toasts, setToasts] = React.useState([]);

  const show = React.useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}

function ToastContainer({ toasts, dismiss }) {
  const colors = {
    info:    { bg: "#1e293b", border: "#3b82f6", icon: "ℹ" },
    success: { bg: "#064e3b", border: "#10b981", icon: "✓" },
    error:   { bg: "#7f1d1d", border: "#ef4444", icon: "✕" },
    warn:    { bg: "#78350f", border: "#f59e0b", icon: "⚠" },
  };

  return (
    <div style={{
      position: "fixed", top: 20, right: 20, display: "flex",
      flexDirection: "column", gap: 8, zIndex: 1000,
    }}>
      {toasts.map((t) => {
        const c = colors[t.type] || colors.info;
        return (
          <div
            key={t.id}
            style={{
              minWidth: 280, padding: "12px 16px", background: c.bg,
              borderLeft: \`4px solid \${c.border}\`, borderRadius: 6,
              color: "#fff", display: "flex", alignItems: "center", gap: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              animation: "slideIn 0.2s ease",
            }}
          >
            <span style={{ fontSize: 18, color: c.border }}>{c.icon}</span>
            <span style={{ flex: 1, fontSize: 14 }}>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 16 }}
            >
              ×
            </button>
          </div>
        );
      })}
      <style>{\`@keyframes slideIn { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }\`}</style>
    </div>
  );
}

function App() {
  const { toasts, show, dismiss } = useToast();

  const btnStyle = (color) => ({
    padding: "10px 16px", border: "none", borderRadius: 6,
    background: color, color: "#fff", cursor: "pointer", marginRight: 8,
    fontSize: 14, fontWeight: 600,
  });

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Toast / Snackbar</h2>
      <p style={{ color: "#888" }}>Click a button to fire a toast (auto-dismiss in 3s).</p>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => show("Saved successfully", "success")} style={btnStyle("#10b981")}>Success</button>
        <button onClick={() => show("Heads up!", "warn")} style={btnStyle("#f59e0b")}>Warning</button>
        <button onClick={() => show("Something broke", "error")} style={btnStyle("#ef4444")}>Error</button>
        <button onClick={() => show("Here's some info", "info")} style={btnStyle("#3b82f6")}>Info</button>
      </div>
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}

render(<App />);`,
      },
      {
        name: 'Carousel / Slider',
        jsx: true,
        code: `// ===== MACHINE CODING: Carousel / Slider =====
// Image carousel with prev/next, dots, keyboard nav, auto-play.

const SLIDES = [
  { color: "#3b82f6", title: "Slide 1", subtitle: "Blue ocean" },
  { color: "#10b981", title: "Slide 2", subtitle: "Green meadow" },
  { color: "#f59e0b", title: "Slide 3", subtitle: "Golden sunset" },
  { color: "#ef4444", title: "Slide 4", subtitle: "Red sunrise" },
  { color: "#8b5cf6", title: "Slide 5", subtitle: "Purple dusk" },
];

function App() {
  const [index, setIndex] = React.useState(0);
  const [autoPlay, setAutoPlay] = React.useState(true);

  const next = React.useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);
  const prev = React.useCallback(() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length), []);

  React.useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [autoPlay, next]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") setAutoPlay((a) => !a);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Carousel</h2>
      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          display: "flex",
          transform: \`translateX(\${-index * 100}%)\`,
          transition: "transform 0.4s ease",
        }}>
          {SLIDES.map((s, i) => (
            <div key={i} style={{
              flex: "0 0 100%", height: 240, display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: s.color, color: "#fff",
            }}>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{s.title}</div>
              <div style={{ fontSize: 16, opacity: 0.85, marginTop: 4 }}>{s.subtitle}</div>
            </div>
          ))}
        </div>
        <button onClick={prev} style={{
          position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
          width: 36, height: 36, borderRadius: "50%", fontSize: 18, cursor: "pointer",
        }}>‹</button>
        <button onClick={next} style={{
          position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
          width: 36, height: 36, borderRadius: "50%", fontSize: 18, cursor: "pointer",
        }}>›</button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            style={{
              width: 10, height: 10, borderRadius: "50%", border: "none",
              background: i === index ? "#60a5fa" : "#444", cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
      <button
        onClick={() => setAutoPlay(!autoPlay)}
        style={{
          marginTop: 12, padding: "8px 14px", background: "#1e293b",
          color: "#fff", border: "1px solid #444", borderRadius: 6, cursor: "pointer",
        }}
      >
        {autoPlay ? "Pause" : "Play"} (Space)
      </button>
    </div>
  );
}

render(<App />);`,
      },
    ],
  },
];

// Flatten for easy access
export const allTemplates: FlatTemplate[] = templateCategories.flatMap(cat =>
  cat.templates.map(t => ({ ...t, category: cat.label, tag: cat.tag, kind: cat.kind ?? 'template' }))
);

// ==================== Blank Starters ====================
// Three starter snippets for users who want to start fresh in JS / TS / React.
// Surfaced via the "Blank" tab in the templates modal.

export interface BlankStarter {
  name: string;
  lang: TemplateLang;
  description: string;
  code: string;
}

export const blankStarters: BlankStarter[] = [
  {
    name: 'JavaScript',
    lang: 'js',
    description: 'Plain JavaScript editor.',
    code: `// JavaScript playground — start fresh!

console.log("Hello, JavaScript!");

// Try anything: variables, functions, async/await, etc.
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("World"));`,
  },
  {
    name: 'TypeScript',
    lang: 'ts',
    description: 'Type-stripped TS via Babel — runs as JS.',
    code: `// TypeScript playground — types are stripped at runtime.

interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

const ana: User = { name: "Ana", age: 30 };
console.log(greet(ana));`,
  },
  {
    name: 'React',
    lang: 'jsx',
    description: 'React component sandbox with live preview.',
    code: `// React playground — your component renders to the right.

function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Hello, React!</h2>
      <p>You clicked {count} times.</p>
      <button
        onClick={() => setCount(count + 1)}
        style={{
          padding: "8px 16px", borderRadius: 6, border: "none",
          background: "#3b82f6", color: "#fff", cursor: "pointer",
        }}
      >
        Click me
      </button>
    </div>
  );
}

render(<App />);`,
  },
];
