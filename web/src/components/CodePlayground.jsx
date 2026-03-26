import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Link } from 'react-router-dom';
import { Play, Trash2, ArrowLeft, AlertTriangle, Loader2, X, Search, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== Templates ====================

const templateCategories = [
  {
    label: 'JavaScript Fundamentals',
    tag: 'JS',
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
    ],
  },
  {
    label: 'JS Interview Topics',
    tag: 'JS',
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
      <h2 style={{ fontSize: 48, margin: 0 }}>⏱ {seconds}s</h2>
      <button onClick={() => setRunning(r => !r)} style={{ marginTop: 16 }}>
        {running ? "⏸ Pause" : "▶ Resume"}
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
        Values persist in localStorage — try re-running!
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
            <button onClick={() => dispatch({ type: "delete", id: t.id })} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>✕</button>
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
        code: `// Theme context — no prop drilling
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
      <button onClick={theme.toggle}>{theme.dark ? "☀️ Light" : "🌙 Dark"}</button>
    </div>
  );
}

function Content() {
  const theme = useTheme();
  return (
    <div style={{ padding: 16 }}>
      <p>Theme is: <strong>{theme.dark ? "Dark" : "Light"}</strong></p>
      <p style={{ color: "#888", fontSize: 13 }}>Header and Content both read from ThemeContext — no props passed!</p>
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
// WITH compiler — just write plain code:

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
console.log("flat(∞):", [1, [2, [3, [4, [5]]]]].myFlat(Infinity));

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

// Test: race — first to settle wins
Promise.myRace([
  new Promise(r => setTimeout(() => r("slow"), 100)),
  new Promise(r => setTimeout(() => r("fast"), 10)),
]).then(v => console.log("Race winner:", v));

// Test: any — first to fulfill wins (ignores rejections)
Promise.myAny([
  Promise.reject("err1"),
  new Promise(r => setTimeout(() => r("success"), 50)),
  Promise.reject("err2"),
]).then(v => console.log("Any winner:", v));

// Test: any — all reject
Promise.myAny([
  Promise.reject("a"),
  Promise.reject("b"),
]).catch(e => console.log("All rejected:", e.message));`,
      },
    ],
  },
];

// Flatten for easy access
const allTemplates = templateCategories.flatMap(cat =>
  cat.templates.map(t => ({ ...t, category: cat.label, tag: cat.tag }))
);

// ==================== Helpers ====================

function formatValue(val) {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return val;
  if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
  if (val instanceof Error) return `${val.name}: ${val.message}`;
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
}

function detectJSX(code) {
  return /render\s*\(/.test(code) || /<[A-Z]/.test(code);
}

let babelModule = null;
async function transpileJSX(code) {
  if (!babelModule) {
    babelModule = await import('@babel/standalone');
  }
  const result = babelModule.transform(code, {
    presets: ['react'],
    filename: 'playground.jsx',
  });
  return result.code;
}

// ==================== Component ====================

export default function CodePlayground() {
  const initialCode = sessionStorage.getItem('playground-code') || allTemplates[0].code;

  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasPreview, setHasPreview] = useState(false);
  const [selectedName, setSelectedName] = useState(sessionStorage.getItem('playground-code') ? null : 'Hello World');
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerFilter, setDrawerFilter] = useState('all');
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const reactRootRef = useRef(null);
  const drawerSearchRef = useRef(null);
  const isJSX = detectJSX(code);

  // Unique tags for filter pills
  const tagOptions = useMemo(() => {
    const tags = [...new Set(templateCategories.map(c => c.tag))];
    return ['all', ...tags.map(t => t.toLowerCase())];
  }, []);

  // Filtered templates
  const filteredCategories = useMemo(() => {
    return templateCategories
      .filter(cat => drawerFilter === 'all' || cat.tag.toLowerCase() === drawerFilter)
      .map(cat => ({
        ...cat,
        templates: cat.templates.filter(t =>
          t.name.toLowerCase().includes(drawerSearch.toLowerCase())
        )
      }))
      .filter(cat => cat.templates.length > 0);
  }, [drawerSearch, drawerFilter]);

  // Clear sessionStorage code after loading
  useEffect(() => {
    sessionStorage.removeItem('playground-code');
  }, []);

  // Cleanup React root on unmount
  useEffect(() => {
    return () => {
      if (reactRootRef.current) {
        try { reactRootRef.current.unmount(); } catch { /* ignore */ }
        reactRootRef.current = null;
      }
    };
  }, []);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    const logs = [];
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;

    console.log = (...args) => logs.push({ type: 'log', text: args.map(formatValue).join(' ') });
    console.warn = (...args) => logs.push({ type: 'warn', text: args.map(formatValue).join(' ') });
    console.error = (...args) => logs.push({ type: 'error', text: args.map(formatValue).join(' ') });

    // Unmount previous React render
    if (reactRootRef.current) {
      try { reactRootRef.current.unmount(); } catch { /* ignore */ }
      reactRootRef.current = null;
    }
    setHasPreview(false);

    try {
      let execCode = code;
      const needsJSX = detectJSX(code);

      if (needsJSX) {
        execCode = await transpileJSX(code);
      }

      if (needsJSX) {
        // Inject React scope and render function
        const renderFn = (element) => {
          if (previewRef.current) {
            if (reactRootRef.current) {
              try { reactRootRef.current.unmount(); } catch { /* ignore */ }
            }
            reactRootRef.current = ReactDOM.createRoot(previewRef.current);
            reactRootRef.current.render(element);
            setHasPreview(true);
          }
        };

        const scope = {
          React,
          useState: React.useState,
          useEffect: React.useEffect,
          useRef: React.useRef,
          useMemo: React.useMemo,
          useCallback: React.useCallback,
          useReducer: React.useReducer,
          useContext: React.useContext,
          createContext: React.createContext,
          memo: React.memo,
          Fragment: React.Fragment,
          render: renderFn,
        };

        const scopeKeys = Object.keys(scope);
        const scopeValues = Object.values(scope);
        const fn = new Function(...scopeKeys, execCode);
        fn(...scopeValues);
      } else {
        // Plain JS execution
        const result = new Function(execCode)();
        if (result !== undefined) {
          logs.push({ type: 'result', text: `\u2192 ${formatValue(result)}` });
        }
      }
    } catch (err) {
      logs.push({ type: 'error', text: `${err.name}: ${err.message}` });
    } finally {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
      setIsRunning(false);
    }

    const syncLogs = [...logs];
    setOutput(syncLogs);

    // Collect async logs
    setTimeout(() => {
      if (logs.length > syncLogs.length) {
        setOutput([...logs]);
      }
    }, 600);
  }, [code]);

  // Cmd+Enter to run, Escape to close drawer
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [runCode, isDrawerOpen]);

  const handleTemplate = (template) => {
    if (reactRootRef.current) {
      try { reactRootRef.current.unmount(); } catch { /* ignore */ }
      reactRootRef.current = null;
    }
    setCode(template.code);
    setOutput([]);
    setHasPreview(false);
    setSelectedName(template.name);
    setIsDrawerOpen(false);
    setDrawerSearch('');
  };

  const handleClear = () => {
    if (reactRootRef.current) {
      try { reactRootRef.current.unmount(); } catch { /* ignore */ }
      reactRootRef.current = null;
    }
    setOutput([]);
    setHasPreview(false);
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
    setDrawerSearch('');
    setDrawerFilter('all');
    setTimeout(() => drawerSearchRef.current?.focus(), 200);
  };

  // Handle tab key in textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      setCode(code.substring(0, start) + '  ' + code.substring(end));
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen relative">
      {/* Template Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[340px] max-w-[90vw] bg-white dark:bg-[#0f0f1a] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-40 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <BookOpen size={15} className="text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm leading-tight">Templates</h2>
                      <span className="text-[11px] text-slate-400">{allTemplates.length} snippets</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 focus-within:border-indigo-300 dark:focus-within:border-indigo-700 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    ref={drawerSearchRef}
                    value={drawerSearch}
                    onChange={(e) => setDrawerSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && setIsDrawerOpen(false)}
                    placeholder="Search templates..."
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
                  />
                  {drawerSearch && (
                    <button onClick={() => { setDrawerSearch(''); drawerSearchRef.current?.focus(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="mt-3 flex gap-1.5 overflow-x-auto">
                  {tagOptions.map(tag => {
                    const count = tag === 'all' ? allTemplates.length : allTemplates.filter(t => t.tag.toLowerCase() === tag).length;
                    return (
                      <button
                        key={tag}
                        onClick={() => setDrawerFilter(tag)}
                        className={[
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap flex items-center gap-1.5",
                          drawerFilter === tag
                            ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80"
                        ].join(' ')}
                      >
                        {tag === 'all' ? 'All' : tag}
                        <span className={[
                          "text-[10px] min-w-[18px] text-center rounded-full px-1",
                          drawerFilter === tag
                            ? "bg-indigo-200/80 dark:bg-indigo-800/60 text-indigo-800 dark:text-indigo-200"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                        ].join(' ')}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4" />

              {/* Template List */}
              <div className="flex-1 overflow-y-auto px-3 py-3 sidebar-scroll">
                {filteredCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Search size={32} className="mb-3 opacity-40" />
                    <p className="text-sm font-medium">No templates found</p>
                    <p className="text-xs mt-1">Try a different search or filter</p>
                  </div>
                ) : (
                  filteredCategories.map(cat => (
                    <div key={cat.label} className="mb-3">
                      <div className="px-2 py-2 flex items-center gap-2 sticky top-0 bg-white/95 dark:bg-[#0f0f1a]/95 backdrop-blur-sm z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {cat.label}
                        </span>
                        <span className={[
                          "text-[9px] px-1.5 py-0.5 rounded-full font-semibold",
                          cat.tag === 'React' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          cat.tag === 'Polyfills' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                          'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        ].join(' ')}>
                          {cat.tag}
                        </span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-600">{cat.templates.length}</span>
                      </div>
                      <div className="space-y-0.5">
                        {cat.templates.map(t => {
                          const isActive = selectedName === t.name;
                          return (
                            <button
                              key={t.name}
                              onClick={() => handleTemplate(t)}
                              className={[
                                "w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-all flex items-center gap-3 group relative",
                                isActive
                                  ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              ].join(' ')}
                            >
                              {/* Active indicator bar */}
                              {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-indigo-500" />
                              )}
                              <span className="flex-1 truncate">{t.name}</span>
                              {t.jsx && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100/80 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                                  JSX
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-[11px] text-slate-400 text-center">
                  Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono mx-0.5">Esc</kbd> to close
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header — always dark like an IDE */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d333b] bg-[#1c2028] shrink-0 text-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold shrink-0 text-white">Playground</h1>
          {selectedName && (
            <span className="text-sm text-slate-500 font-normal truncate hidden sm:inline">
              — {selectedName}
            </span>
          )}
          {isJSX && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-400 font-semibold shrink-0">
              React
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openDrawer}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-[#3d444d] text-slate-300 hover:bg-[#2d333b] hover:text-white transition-colors"
          >
            <BookOpen size={14} /> Templates
          </button>

          <button
            onClick={handleClear}
            className="p-2 rounded-xl border border-[#3d444d] text-slate-400 hover:text-white hover:bg-[#2d333b] transition-colors"
            title="Clear output"
          >
            <Trash2 size={16} />
          </button>

          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {isRunning ? 'Running...' : 'Run'}
            <kbd className="hidden sm:inline text-[10px] opacity-70 ml-1">⌘↵</kbd>
          </button>
        </div>
      </div>

      {/* Editor + Output — always dark */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-[#2d333b]">
          <div className="px-4 py-2 text-xs font-medium text-slate-500 border-b border-[#2d333b] bg-[#22272e] shrink-0 flex items-center justify-between">
            <span>{isJSX ? 'React JSX' : 'JavaScript'}</span>
            <span className="text-slate-600">
              {code.split('\n').length} lines
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-4 font-mono text-sm leading-relaxed bg-[#1e1e2e] text-[#cdd6f4] resize-none outline-none min-h-[200px]"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="Write your JavaScript or React code here..."
          />
        </div>

        {/* Output Panel */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Console */}
          <div className="px-4 py-2 text-xs font-medium text-slate-500 border-b border-[#2d333b] bg-[#22272e] shrink-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Console Output
          </div>
          <div className={`overflow-auto p-4 bg-[#1e1e2e] font-mono text-sm ${hasPreview ? 'max-h-[30vh]' : 'flex-1 min-h-[100px]'}`}>
            {output.length === 0 && !hasPreview ? (
              <div className="text-slate-500 italic">
                Click "Run" or press ⌘+Enter to execute your code...
              </div>
            ) : (
              output.map((entry, i) => (
                <div
                  key={i}
                  className={`py-1 border-b border-slate-800/50 last:border-0 ${
                    entry.type === 'error' ? 'text-red-400' :
                    entry.type === 'warn' ? 'text-yellow-400' :
                    entry.type === 'result' ? 'text-blue-400' :
                    'text-[#a6e3a1]'
                  }`}
                >
                  {entry.type === 'error' && <AlertTriangle size={12} className="inline mr-2" />}
                  <span className="whitespace-pre-wrap">{entry.text}</span>
                </div>
              ))
            )}
          </div>

          {/* React Preview — always mounted, toggled via CSS */}
          <div className={hasPreview ? 'flex-1 flex flex-col min-h-0' : 'h-0 overflow-hidden'}>
            <div className="px-4 py-2 text-xs font-medium text-slate-500 border-y border-[#2d333b] bg-[#22272e] shrink-0 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              React Preview
            </div>
            <div
              ref={previewRef}
              className="flex-1 overflow-auto bg-white text-slate-900 min-h-[120px] p-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
