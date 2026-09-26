const s=["Two Pointer","Sliding Window","Hash Map / Set","Stack","Recursion / D&C","Dynamic Programming","Greedy","Binary Search","Backtracking","Math / Bit","Sorting","Linked List","Closure / State","In-Place","Tree Traversal"],o=[{label:"Linear scans",patterns:["Two Pointer","Sliding Window","In-Place"]},{label:"Lookup",patterns:["Hash Map / Set","Stack"]},{label:"Recursive",patterns:["Recursion / D&C","Backtracking","Tree Traversal"]},{label:"Optimization",patterns:["Dynamic Programming","Greedy","Binary Search"]},{label:"Data + Misc",patterns:["Sorting","Linked List","Closure / State","Math / Bit"]}],n=[{label:"JavaScript Fundamentals",tag:"JS",kind:"template",templates:[{name:"Hello World",code:`// Welcome to the JavaScript Playground!
console.log("Hello, World!");
console.log("Start coding here...");`},{name:"Array Methods",code:`const fruits = ["apple", "banana", "cherry", "date", "elderberry"];

// map - transform each element
console.log("Uppercase:", fruits.map(f => f.toUpperCase()));

// filter - keep elements that match
console.log("Long names:", fruits.filter(f => f.length > 5));

// reduce - accumulate a result
console.log("Total chars:", fruits.reduce((sum, f) => sum + f.length, 0));

// find - get first match
console.log("First with 'a':", fruits.find(f => f.includes("a")));`},{name:"Closures",code:`function createCounter(start = 0) {
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
console.log(counter.getCount());  // 11`},{name:"Promises & Async",code:`// Note: async results appear after sync code

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

console.log("End (sync)");`},{name:"Map & Set",code:`// Map and Set are the modern alternatives to plain objects/arrays
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
// Set     — uniqueness checks, dedup`},{name:"Spread & Rest",code:`// Same syntax (...), opposite jobs:
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
// const [...all, last] = [1, 2, 3];   // SyntaxError`}]},{label:"JS Interview Topics",tag:"JS",kind:"template",templates:[{name:"Event Loop & Microtasks",code:`// Predict the output order!

console.log("1: sync");

setTimeout(() => console.log("2: setTimeout (macro)"), 0);

Promise.resolve().then(() => console.log("3: Promise (micro)"));

queueMicrotask(() => console.log("4: queueMicrotask (micro)"));

console.log("5: sync");

// Answer: 1, 5, 3, 4, 2
// Microtasks (Promise, queueMicrotask) run before macrotasks (setTimeout)`},{name:"this Keyword",code:`const obj = {
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
console.log("bind():", greet.bind({ name: "Eve" })());   // "Eve"`},{name:"Debounce & Throttle",code:`function debounce(fn, ms) {
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

console.log("Check console after ~200ms for debounce result");`},{name:"Currying",code:`// Currying: transform f(a, b, c) into f(a)(b)(c)

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
console.log([1,2,3,4].map(double)); // [2,4,6,8]`},{name:"Prototypes & Classes",code:`class Animal {
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
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype); // true`},{name:"Destructuring Deep Dive",code:`// Nested destructuring
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
console.log("Remaining:", remaining);`},{name:"Tricky Interview Q",code:`// Classic interview gotchas

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
// Prints 0, 1, 2 (let is block-scoped)`}]},{label:"React Basics",tag:"React",kind:"template",templates:[{name:"useState Counter",jsx:!0,code:`function Counter() {
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

render(<Counter />);`},{name:"useEffect Lifecycle",jsx:!0,code:`function Timer() {
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

render(<Timer />);`},{name:"Custom Hook",jsx:!0,code:`// Custom hook: useLocalStorage
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

render(<App />);`}]},{label:"React Advanced",tag:"React",kind:"template",templates:[{name:"useReducer Todo",jsx:!0,code:`function todosReducer(state, action) {
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

render(<TodoApp />);`},{name:"Context API",jsx:!0,code:`// Theme context — no prop drilling
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
);`},{name:"React Compiler Patterns",jsx:!0,code:`// React Compiler automatically memoizes computations
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

render(<App />);`}]},{label:"Spec Polyfills",tag:"JS",kind:"template",templates:[{name:"How to Write a Polyfill",difficulty:"Easy",code:`// ═══════════════════════════════════════════════════════════════
// HOW TO WRITE A POLYFILL — the meta-template
// ═══════════════════════════════════════════════════════════════
//
// A POLYFILL is a re-implementation of a built-in API for environments
// that don't have it (old browsers, older Node versions, JS engines
// embedded in tools). Interviewers ask for them to test whether you
// understand the contract beneath the syntax.
//
// 5-STEP RECIPE for writing any polyfill:
//
//   1. READ THE SPEC — pin down the contract. Inputs, outputs, edge
//      cases, what throws. MDN's "Specifications" section links to it.
//
//   2. PICK THE RIGHT PROTOTYPE — instance methods go on
//      \`Type.prototype\` (e.g., \`Array.prototype.myMap\`). Static
//      methods go on the type itself (e.g., \`Object.myAssign\`).
//
//   3. USE \`this\` CORRECTLY — for prototype methods, \`this\` is the
//      instance. Don't write arrow functions for the polyfill body —
//      they steal \`this\` from the outer scope.
//
//   4. HANDLE EDGE CASES — empty input, null/undefined, NaN, sparse
//      arrays, non-function callbacks, missing args. The spec lists
//      every TypeError it should throw.
//
//   5. NAME IT \`myX\` (not \`x\`) — never overwrite the native built-in.
//      Replacing native methods breaks every other library on the page.
//
// ═══════════════════════════════════════════════════════════════
// PATTERN: instance method polyfill (most common)
// ═══════════════════════════════════════════════════════════════

Array.prototype.myExample = function (callback, thisArg) {
  // 1. Guard: spec usually throws TypeError on null/undefined this.
  if (this == null) {
    throw new TypeError("called on null or undefined");
  }
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  // 2. Use 'this' — refers to the array .myExample() was called on.
  //    NEVER use an arrow function here; it would lose 'this'.
  const arr = Object(this);
  const len = arr.length >>> 0;   // coerce to uint32 (spec quirk)

  const out = [];
  for (let i = 0; i < len; i++) {
    // 3. Respect sparse arrays — only call callback on existing slots.
    if (i in arr) {
      // 4. Forward thisArg correctly using .call (the spec's "call(thisArg, ...)").
      out.push(callback.call(thisArg, arr[i], i, arr));
    }
  }
  return out;
};

// ═══════════════════════════════════════════════════════════════
// PATTERN: static method polyfill
// ═══════════════════════════════════════════════════════════════

Object.myExampleStatic = function (target, ...sources) {
  if (target == null) throw new TypeError("target cannot be null/undefined");
  // ... copy own enumerable props from each source into target ...
  return target;
};

// ═══════════════════════════════════════════════════════════════
// CONVENTIONS — what interviewers expect
// ═══════════════════════════════════════════════════════════════

// (a) Don't overwrite the native. These two lines are deliberately INERT —
//     assigning to Array.prototype.map really would break every library on the
//     page, including the rest of this very snippet, so they are shown rather
//     than run. That is the whole lesson: the damage is global and immediate.
//
//        Array.prototype.map   = function () {};   ❌ breaks every library
//        Array.prototype.myMap = function () {};   ✅ safe, opt-in

// (b) Don't use the built-in inside your polyfill — that's cheating:
//
//        Array.prototype.myMap = function (cb) {
//          return this.map(cb);   ❌ defeats the point
//        };

// (c) For Promise-based polyfills, return a thenable:
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => { /* ... */ });
}

// (d) Test against the native: same input → same output. The polyfill
// must match the native's edge-case behavior, not just the happy path.
const native  = [1, 2, 3].map(x => x * 2);
const myImpl  = [1, 2, 3].myExample(x => x * 2);
console.log(JSON.stringify(native) === JSON.stringify(myImpl));   // true

// ═══════════════════════════════════════════════════════════════
// COMMON GOTCHAS by category
// ═══════════════════════════════════════════════════════════════
//
//  Array methods:
//   - Sparse arrays: \`new Array(3)\` has length 3, holes at 0,1,2.
//     map/filter/forEach SKIP holes; the polyfill must too.
//   - NaN equality: indexOf returns -1 for NaN; includes returns true.
//
//  Function methods (bind/call/apply):
//   - The bound function must work with \`new\` (constructor case).
//   - apply receives args as an ARRAY, call as separate args.
//
//  Object methods:
//   - Only own ENUMERABLE STRING-KEYED properties get copied (Object.assign).
//   - Symbols are NOT included by default — most polyfills skip them.
//
//  Promise methods:
//   - Promise.all: fail-fast on first rejection.
//   - Promise.allSettled: never rejects.
//   - Promise.race: first to settle (either way) wins.
//   - Promise.any: first to FULFILL wins; AggregateError if all reject.
//
// ═══════════════════════════════════════════════════════════════
// Now open any other polyfill template (Array.map, Promise.all, etc.)
// and you'll see this pattern applied. Each one has its own quirks
// noted in the comments — that's the spec talking back to you.`},{name:"Array.map",difficulty:"Medium",code:`// Polyfill: Array.prototype.map
Array.prototype.myMap = function(callback, thisArg) {
  // Preallocate: map returns an array of the SAME length, with holes left as
  // holes. Using result.push() instead would collapse them and shorten the
  // array — [1, , 3].map(x => x * 2) is [2, hole, 6], not [2, 6].
  const len = this.length;   // captured ONCE: pushing during iteration must
  const result = new Array(len);  // not extend the loop, and truncating must
  for (let i = 0; i < len; i++) { // not shorten it
    if (i in this) {                       // skip holes: the callback never runs for them
      result[i] = callback.call(thisArg, this[i], i, this);
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
console.log("thisArg:   ", nums.myMap(function(n) { return n * this.factor; }, multiplier));`},{name:"Array.filter",difficulty:"Easy",code:`// Polyfill: Array.prototype.filter
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
console.log("Adults:", users.myFilter(u => u.age >= 18).map(u => u.name));`},{name:"Array.reduce",difficulty:"Medium",code:`// Polyfill: Array.prototype.reduce
Array.prototype.myReduce = function(callback, initialValue) {
  let accumulator;
  let startIndex;

  if (arguments.length >= 2) {
    accumulator = initialValue;
    startIndex = 0;
  } else {
    // With no initial value the accumulator is the first PRESENT element, not
    // this[0] — [ , , 3].reduce(fn) starts at 3. And an array with no present
    // elements at all throws, which is why the scan is a loop and not a
    // length check: [ , , ].reduce(fn) is empty as far as reduce is concerned.
    startIndex = 0;
    while (startIndex < this.length && !(startIndex in this)) startIndex++;
    if (startIndex >= this.length) {
      throw new TypeError("Reduce of empty array with no initial value");
    }
    accumulator = this[startIndex];
    startIndex++;
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
console.log("Flatten:", nested.myReduce((a, b) => a.concat(b), []));`},{name:"Array.forEach",difficulty:"Easy",code:`// Polyfill: Array.prototype.forEach
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
console.log("Return value:", result); // undefined`},{name:"Array.find & findIndex",difficulty:"Easy",code:`// Polyfill: Array.prototype.find
Array.prototype.myFind = function(callback, thisArg) {
  // NOTE: find and findIndex do NOT skip holes — unlike map/filter/forEach,
  // they visit every index and pass undefined for a hole. So there is no
  // "i in this" guard here, and that difference is deliberate.
  for (let i = 0; i < this.length; i++) {
    if (callback.call(thisArg, this[i], i, this)) {
      return this[i];
    }
  }
  return undefined;
};

// Polyfill: Array.prototype.findIndex
Array.prototype.myFindIndex = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {      // holes visited, same as find
    if (callback.call(thisArg, this[i], i, this)) {
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
console.log("not found: ", users.myFindIndex(u => u.name === "Dave")); // -1`},{name:"Array.some & every",difficulty:"Easy",code:`// Polyfill: Array.prototype.some
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
console.log("Any valid:", fields.mySome(f => f.valid));`},{name:"Array.flat & flatMap",difficulty:"Medium",code:`// Polyfill: Array.prototype.flat
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
  // flatMap IS map followed by a single level of flatten — that is the whole
  // definition. Native map is used here so this template runs on its own;
  // every snippet in the playground is executed standalone.
  return this.map(callback, thisArg).myFlat(1);
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
console.log("All items:", orders.myFlatMap(o => o.items));`},{name:"Function.bind",difficulty:"Hard",code:`// Polyfill: Function.prototype.bind
Function.prototype.myBind = function(thisArg, ...boundArgs) {
  const fn = this;
  function bound(...callArgs) {
    // new bound() must IGNORE the bound thisArg and use the fresh instance,
    // while still applying the pre-filled arguments. this instanceof bound
    // is how you detect construction — it is only true under new.
    const target = this instanceof bound ? this : thisArg;
    return fn.apply(target, [...boundArgs, ...callArgs]);
  }
  // Inherit the target's prototype so new bound() instanceof fn is true.
  bound.prototype = Object.create(fn.prototype || null);
  return bound;
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
console.log("Poly:  ", polyBound("."));`},{name:"Function.call & apply",difficulty:"Medium",code:`// Polyfill: Function.prototype.call
// CAVEAT: this technique cannot match the native behaviour exactly. Assigning
// the function as a property requires an object, so Object(thisArg) BOXES a
// primitive — fn.myCall('s') sees a String object where strict-mode native
// call would pass the primitive through. Likewise null becomes globalThis,
// which is sloppy-mode behaviour; under 'use strict' native keeps it as null.
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
console.log("Max:", Math.max.myApply(null, nums));`},{name:"Promise.all",difficulty:"Medium",code:`// Polyfill: Promise.all
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
Promise.myAll([]).then(r => console.log("Empty:", r)); // []`},{name:"Promise.allSettled",difficulty:"Medium",code:`// Polyfill: Promise.allSettled
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
});`},{name:"Promise.race & any",difficulty:"Medium",code:`// Polyfill: Promise.race
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
]).catch(e => console.log("All rejected:", e.message));`},{name:"Array.includes",difficulty:"Easy",code:`// Polyfill for Array.prototype.includes
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
console.log([NaN].myIncludes(NaN));             // true — the SameValueZero difference`},{name:"Object.assign",difficulty:"Easy",code:`// Polyfill for Object.assign
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
console.log(Object.myAssign({}, "hello"));              // { 0: 'h', 1: 'e', 2: 'l', 3: 'l', 4: 'o' }`},{name:"Array.from",difficulty:"Medium",code:`// Polyfill for Array.from
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
console.log(Array.myFrom(new Map([["a", 1], ["b", 2]]))); // [['a', 1], ['b', 2]]`},{name:"Array.sort",difficulty:"Hard",code:`// Polyfill for Array.prototype.sort
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
// Native sort has been stable since ES2019.`},{name:"Array.indexOf / lastIndexOf",difficulty:"Easy",code:`// Polyfill for Array.prototype.indexOf and lastIndexOf
// Strict equality (===), so [NaN].indexOf(NaN) === -1.
// (Use .includes if you need NaN-aware search — see the includes polyfill.)

Array.prototype.myIndexOf = function (target, fromIndex = 0) {
  const len = this.length;
  let start = fromIndex < 0 ? Math.max(len + fromIndex, 0) : fromIndex;
  for (let i = start; i < len; i++) {
    // The i-in-this check skips holes: [ , 1].indexOf(undefined) is -1,
    // because a hole is an ABSENT index rather than one holding undefined.
    if (i in this && this[i] === target) return i;
  }
  return -1;
};

Array.prototype.myLastIndexOf = function (target, fromIndex = this.length - 1) {
  const len = this.length;
  let start = fromIndex < 0 ? len + fromIndex : Math.min(fromIndex, len - 1);
  for (let i = start; i >= 0; i--) {
    if (i in this && this[i] === target) return i;   // holes skipped, as above
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
console.log([NaN].myIndexOf(NaN));                 // -1  — strict equality gotcha`},{name:"Array.reverse",difficulty:"Easy",code:`// Polyfill for Array.prototype.reverse
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
//   const sorted = arr.toReversed();   // returns a new array`},{name:"Array.slice",difficulty:"Easy",code:`// Polyfill for Array.prototype.slice
// Returns a SHALLOW copy of a portion. Does NOT mutate the source.
// Negative indices count from the end.

// Note: holes are preserved. Copying with push() would turn a hole into an
// explicit undefined, changing the result of a later in-operator check.
Array.prototype.mySlice = function (start = 0, end = this.length) {
  const len = this.length;
  const from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
  const to = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
  const result = new Array(Math.max(to - from, 0));
  for (let i = from; i < to; i++) {
    if (i in this) result[i - from] = this[i];   // a hole stays a hole
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
console.log(nested[0].x);              // 999 — same object!`},{name:"Array.splice",difficulty:"Medium",code:`// Polyfill for Array.prototype.splice
// MUTATES the array. Three jobs in one method:
//   1. Remove items from start to start+deleteCount
//   2. Insert new items at that position
//   3. Return the removed items

Array.prototype.mySplice = function (start, deleteCount, ...items) {
  const len = this.length;
  // splice() with NO arguments removes nothing and returns []. Without this,
  // start is undefined, from becomes NaN, and setting length to NaN throws
  // a RangeError instead of doing nothing.
  if (arguments.length === 0) return [];
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
console.log(arr4);                              // [1, 2]`},{name:"Array.concat",difficulty:"Easy",code:`// Polyfill for Array.prototype.concat
// Returns a new array combining the receiver with arguments.
// Each argument: array → spread its elements; non-array → push as-is.
// Notably does NOT recurse — only one level of array spreading.
// Two simplifications vs the real thing: for...of reads holes as undefined,
// where native concat preserves them as holes; and Symbol.isConcatSpreadable
// (which lets a non-array opt INTO spreading, or an array opt out) is ignored.

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
console.log(concatenated);                              // [1, 2, 3]`},{name:"String.padStart / padEnd",difficulty:"Easy",code:`// Polyfill for String.prototype.padStart and padEnd
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
console.log(\`\${"5".myPadStart(2, "0")}:\${"7".myPadStart(2, "0")}\`);  // "05:07"`},{name:"JSON.stringify",difficulty:"Hard",code:`// Polyfill for JSON.stringify
// Recursive serialization with type-specific formatting.
// (Simplified — does not handle indent / replacer / circular detection.)

JSON.myStringify = function (value) {
  if (value === null) return "null";
  if (value === undefined) return undefined;             // top-level undefined → undefined return

  const t = typeof value;
  if (t === "number") return Number.isFinite(value) ? String(value) : "null";   // NaN/Inf → null
  if (t === "boolean") return String(value);
  // Strings need more than backslash and quote escaped: a raw control
  // character is ILLEGAL inside a JSON string, so an unescaped newline or tab
  // produced output that JSON.parse would reject.
  if (t === "string") {
    const NAMED = {
      "\\n": "\\\\n", "\\t": "\\\\t", "\\r": "\\\\r", "\\b": "\\\\b", "\\f": "\\\\f",
    };
    const escaped = value.replace(/[\\\\"\\u0000-\\u001F]/g, (ch) => {
      if (ch === "\\\\") return "\\\\\\\\";
      if (ch === '"') return '\\\\"';
      return NAMED[ch] || "\\\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0");
    });
    return '"' + escaped + '"';
  }
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
console.log(JSON.myStringify({ a: 1, b: [1, 2] }) === JSON.stringify({ a: 1, b: [1, 2] }));   // true`},{name:"Object.keys / values / entries",difficulty:"Easy",code:`// Polyfill for Object.keys, Object.values, Object.entries
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
console.log(Object.myKeys(child));        // ["own"]   — proto skipped`},{name:"JSON.parse",difficulty:"Hard",code:`// Polyfill for JSON.parse — recursive descent parser.
// (The native is a hand-written state machine; this is a teaching version
// that covers strings, numbers, true/false/null, arrays, objects.)

JSON.myParse = function (text) {
  let i = 0;
  const skipWs = () => { while (i < text.length && /\\s/.test(text[i])) i++; };
  // Every parser needs a way to give up. Without one, malformed input walks off
  // the end of the string: every character test then compares against
  // undefined, nothing matches, nothing advances i, and the loops below spin
  // FOREVER instead of reporting the problem.
  const fail = (msg) => { throw new SyntaxError(msg + ' at position ' + i); };

  function parseValue() {
    skipWs();
    if (i >= text.length) fail('Unexpected end of JSON input');
    const ch = text[i];
    if (ch === '"') return parseString();
    if (ch === '{') return parseObject();
    if (ch === '[') return parseArray();
    if (ch === 't' || ch === 'f') return parseBool();
    if (ch === 'n') return parseNull();
    return parseNumber();
  }

  function parseString() {
    if (text[i] !== '"') fail('Expected a string');
    i++; // opening "
    let out = "";
    while (i < text.length && text[i] !== '"') {
      if (text[i] === '\\\\') {                  // escape
        i++;
        const esc = text[i++];
        if (esc === 'u') {                       // \\u0041 is the letter A
          out += String.fromCharCode(parseInt(text.slice(i, i + 4), 16));
          i += 4;
        } else {
          out += esc === 'n' ? '\\n' : esc === 't' ? '\\t' : esc === 'r' ? '\\r'
            : esc === 'b' ? '\\b' : esc === 'f' ? '\\f' : esc;   // \\\\ and \\" fall through
        }
      } else out += text[i++];
    }
    if (i >= text.length) fail('Unterminated string');
    i++; // closing "
    return out;
  }

  function parseNumber() {
    const start = i;
    while (i < text.length && /[0-9eE+\\-.]/.test(text[i])) i++;
    // Consuming nothing means this was never a number. Without the guard,
    // Number('') is 0 and the parser silently invents a value.
    if (i === start) fail('Unexpected token ' + (text[i] ?? 'end of input'));
    const n = Number(text.slice(start, i));
    if (Number.isNaN(n)) fail('Invalid number');
    return n;
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
      fail("Expected ',' or ']'");            // <- the line that ends the infinite loop
    }
  }

  function parseObject() {
    i++; const out = {}; skipWs();
    if (text[i] === '}') { i++; return out; }
    while (true) {
      skipWs();
      const key = parseString();
      skipWs();
      if (text[i] !== ':') fail("Expected ':'");
      i++;                                     // colon
      out[key] = parseValue();
      skipWs();
      if (text[i] === ',') { i++; continue; }
      if (text[i] === '}') { i++; return out; }
      fail("Expected ',' or '}'");
    }
  }

  const value = parseValue();
  skipWs();
  if (i < text.length) fail('Unexpected trailing characters');
  return value;
};

// Tests
console.log(JSON.myParse('"hello"'));                                  // "hello"
console.log(JSON.myParse('42'));                                       // 42
console.log(JSON.myParse('-3.14'));                                    // -3.14
console.log(JSON.myParse('true'));                                     // true
console.log(JSON.myParse('null'));                                     // null
console.log(JSON.myParse('[1, 2, 3]'));                                // [1, 2, 3]
console.log(JSON.myParse('{"a": 1, "b": [true, null]}'));              // { a: 1, b: [true, null] }
console.log(JSON.myParse('{"name":"Ana","tags":["dev","js"],"age":30}'));`},{name:"Array.isArray",difficulty:"Easy",code:`// Polyfill for Array.isArray — the most reliable test.
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
console.log(typeof {});          // "object"`},{name:"Object.create",difficulty:"Medium",code:`// Polyfill for Object.create — creates an object with the given prototype.
// The classic 4-line implementation. Foundation of pre-class OOP in JS.

Object.myCreate = function (proto, props) {
  if (proto !== null && typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError("Object prototype may only be an Object or null");
  }
  // new F() cannot produce a NULL-prototype object: setting F.prototype to
  // null makes the instance fall back to Object.prototype, so
  // Object.create(null) would quietly hand back an ordinary object. The
  // null case therefore needs the real primitive.
  let obj;
  if (proto === null) {
    obj = { __proto__: null };
  } else {
    function F() {}              // empty constructor
    F.prototype = proto;          // its prototype is what we want
    obj = new F();                // new instance inherits from proto
  }

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
console.log(dict.toString);                        // "no inheritance"   (no [object Object] inherited)`},{name:"Object.freeze + deepFreeze",difficulty:"Medium",code:`// Polyfill for Object.freeze — and the deepFreeze variant interviewers love.
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
console.log(Object.isFrozen(a));     // true`},{name:"Array.prototype.fill",difficulty:"Easy",code:`// Polyfill for Array.prototype.fill(value, start?, end?).
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
console.log(realGrid);                           // [['a'], [], []]   — distinct arrays`},{name:"String.prototype.repeat",difficulty:"Easy",code:`// Polyfill for String.prototype.repeat — short but classic.
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
console.log(padLeft("42", 5, "0"));                   // "00042"`},{name:"Array.prototype.join",difficulty:"Easy",code:`// Polyfill for Array.prototype.join(separator).
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
console.log(arr.myJoin(" | ") === arr.join(" | "));   // true`}]},{label:"Utility Implementations",tag:"JS",kind:"template",templates:[{name:"once",difficulty:"Easy",code:`// Utility: once(fn) — run a function at most once, cache its result.
// Not a spec method. This is the "hand-rolled utility" family, and in
// interviews it is asked more often than half the spec polyfills.
//
// The four things being graded:
//   1. closure privacy — called/result are unreachable from outside
//   2. this forwarding via apply — an arrow function here would be a BUG,
//      because it would capture the defining scope instead
//   3. caching the RESULT, not just suppressing the call
//   4. nulling fn afterwards, so whatever it closed over can be collected

function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (called) return result;
    called = true;
    result = fn.apply(this, args);
    fn = null;                 // release the closure; the result is kept
    return result;
  };
}

const init = once((n) => { console.log("  (side effect ran)"); return n * 2; });
console.log("first  :", init(21));
console.log("second :", init(99));   // 42 — the argument is ignored
console.log("third  :", init(1));    // 42 — still the cached result

// this is forwarded, which an arrow function would break:
const counter = { n: 5, bump: once(function () { return this.n + 1; }) };
console.log("this forwarded:", counter.bump());   // 6`},{name:"curry",difficulty:"Medium",code:`// Utility: curry(fn) — collect arguments until fn.length is satisfied.
//
// NOTE: this is a different question from the "Sum Curry" challenge
// (sum(1)(2)(3)()), which accumulates an unbounded list and settles on an
// empty call. This one is arity-driven: it knows when to fire because
// fn.length tells it how many parameters were declared.
//
// The follow-ups:
//   - fn.length counts only parameters BEFORE the first default or rest,
//     so curry cannot work on (a, b = 1) or (...args). Say so.
//   - partial application must work in any grouping: f(1)(2)(3),
//     f(1, 2)(3) and f(1)(2, 3) all have to land the same.

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...rest) => curried.apply(this, [...args, ...rest]);
  };
}

const add3 = curry((a, b, c) => a + b + c);
console.log("one at a time :", add3(1)(2)(3));
console.log("two then one  :", add3(1, 2)(3));
console.log("one then two  :", add3(1)(2, 3));
console.log("all at once   :", add3(1, 2, 3));

// The arity limit, stated honestly:
const withDefault = (a, b = 2) => a + b;
console.log("fn.length with a default:", withDefault.length);  // 1, not 2`},{name:"deepEqual",difficulty:"Medium",code:`// Utility: deepEqual(a, b) — structural equality.
// The sibling of deepClone, and asked about as often.
//
// What separates a real answer from a shallow one:
//   - Object.is for primitives, so NaN equals NaN and +0 does NOT equal -0
//   - a WeakMap so a cycle does not recurse forever
//   - prototype check, so [1,2] is not equal to {0:1, 1:2, length:2}
//   - Date, RegExp, Map and Set need their own comparisons

function deepEqual(a, b, seen = new WeakMap()) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (seen.get(a) === b) return true;        // already comparing this pair
  seen.set(a, b);

  if (a instanceof Date)   return a.getTime() === b.getTime();
  if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags;

  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) {
      if (!b.has(k) || !deepEqual(v, b.get(k), seen)) return false;
    }
    return true;
  }
  if (a instanceof Set) {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;   // shallow for set members
    return true;
  }

  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!deepEqual(a[k], b[k], seen)) return false;
  }
  return true;
}

console.log("nested       :", deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }));  // true
console.log("NaN === NaN  :", deepEqual(NaN, NaN));                                    // true
console.log("+0 vs -0     :", deepEqual(0, -0));                                       // false
console.log("Map          :", deepEqual(new Map([["k", 1]]), new Map([["k", 1]])));    // true
console.log("array vs bag :", deepEqual([1, 2], { 0: 1, 1: 2, length: 2 }));           // false

const x = { n: 1 }; x.self = x;
const y = { n: 1 }; y.self = y;
console.log("cycles       :", deepEqual(x, y));                                        // true`},{name:"promisify",difficulty:"Medium",code:`// Utility: promisify(fn) — turn a Node-style callback API into a promise.
//
// The contract being reproduced: the callback is the LAST argument and is
// called as (err, value). A truthy err rejects, otherwise it resolves.
//
// The details people miss:
//   - this must be forwarded, or promisifying a method loses its receiver
//   - the original arguments must be spread BEFORE the callback is appended
//   - a callback fired twice must not settle twice (promises already
//     ignore the second settle, which is worth pointing out)

function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, value) => {
        if (err) reject(err);
        else resolve(value);
      });
    });
  };
}

// A callback-style API to convert:
function readish(name, cb) {
  setTimeout(() => {
    if (name) cb(null, "contents of " + name);
    else cb(new Error("name is required"));
  }, 5);
}

const readAsync = promisify(readish);

readAsync("notes.txt").then((v) => console.log("resolved:", v));
readAsync("").catch((e) => console.log("rejected:", e.message));

console.log("promisify returns a function:", typeof readAsync);`},{name:"Promise.prototype.finally",difficulty:"Medium",code:`// Polyfill: Promise.prototype.finally
// A spec method, but it lives here because the interesting part is the
// same closure/chaining reasoning as the utilities around it.
//
// The rule that catches people: finally is PASS-THROUGH. It must not
// change the settled value, and it must not swallow a rejection. The only
// way it can affect the chain is by throwing or returning a rejected
// promise of its own.
//
// It also has to WAIT for a thenable returned by the callback, which is
// why each arm wraps the result in Promise.resolve before continuing.

Promise.prototype.myFinally = function (onFinally) {
  const C = this.constructor || Promise;
  return this.then(
    (value)  => C.resolve(onFinally()).then(() => value),
    (reason) => C.resolve(onFinally()).then(() => { throw reason; }),
  );
};

Promise.resolve("ok")
  .myFinally(() => console.log("cleanup ran (fulfilled path)"))
  .then((v) => console.log("value passed through:", v));

Promise.reject(new Error("boom"))
  .myFinally(() => console.log("cleanup ran (rejected path)"))
  .catch((e) => console.log("rejection passed through:", e.message));

// A value RETURNED from finally is ignored — this still prints 1, not 99:
Promise.resolve(1)
  .myFinally(() => 99)
  .then((v) => console.log("return value ignored:", v));`},{name:"myInstanceof (prototype chain)",difficulty:"Medium",code:`// Utility: myInstanceof(obj, Ctor) — walk the prototype chain by hand.
//
// instanceof does not compare constructors. It asks a single question:
// is Ctor.prototype anywhere on obj's prototype chain? Everything about
// inheritance in JavaScript follows from that one sentence.
//
// The edge cases that are the actual question:
//   - primitives are never instances of anything
//   - the right-hand side must be callable, or it throws a TypeError
//   - Object.create(null) makes an object with NO chain at all

function myInstanceof(obj, Ctor) {
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) return false;
  if (typeof Ctor !== "function") throw new TypeError("Right-hand side is not callable");

  const target = Ctor.prototype;
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === target) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}

class Animal {}
class Dog extends Animal {}
const rex = new Dog();

console.log("Dog    :", myInstanceof(rex, Dog));      // true
console.log("Animal :", myInstanceof(rex, Animal));   // true — one step further up
console.log("Object :", myInstanceof(rex, Object));   // true — the chain ends there
console.log("Array  :", myInstanceof(rex, Array));    // false
console.log("number :", myInstanceof(1, Object));     // false — primitives have no chain

// Print the chain itself, which is the thing worth being able to draw:
let node = Object.getPrototypeOf(rex);
const chain = [];
while (node !== null) { chain.push(node.constructor ? node.constructor.name : "null-proto"); node = Object.getPrototypeOf(node); }
console.log("chain  :", chain.join(" -> ") + " -> null");`},{name:"myNew (the new operator)",difficulty:"Medium",code:`// Utility: myNew(Ctor, ...args) — what the new operator actually does.
//
// Four steps, and step four is the one that surprises people:
//   1. create a fresh object whose prototype is Ctor.prototype
//   2. call Ctor with this bound to that object
//   3. if the constructor returned an OBJECT, that object wins
//   4. otherwise return the object from step 1
//
// Step 3 is why a constructor can hijack its own result, and it is the
// mechanism behind the singleton pattern written as a class.

function myNew(Ctor, ...args) {
  if (typeof Ctor !== "function") throw new TypeError("not a constructor");
  const obj = Object.create(Ctor.prototype);       // steps 1
  const returned = Ctor.apply(obj, args);          // step 2
  const isObject = returned !== null && (typeof returned === "object" || typeof returned === "function");
  return isObject ? returned : obj;                // steps 3 and 4
}

function Point(x, y) { this.x = x; this.y = y; }
Point.prototype.sum = function () { return this.x + this.y; };

const p = myNew(Point, 2, 3);
console.log("sum via prototype :", p.sum());          // 5
console.log("instanceof Point  :", p instanceof Point);  // true

// A primitive return is IGNORED:
function ReturnsNumber() { this.a = 1; return 42; }
console.log("primitive ignored :", JSON.stringify(myNew(ReturnsNumber)));   // {"a":1}

// An object return REPLACES the instance:
function ReturnsObject() { this.a = 1; return { b: 2 }; }
console.log("object wins       :", JSON.stringify(myNew(ReturnsObject)));   // {"b":2}`},{name:"retry with exponential backoff",difficulty:"Medium",code:`// Utility: retry(task, options) — re-run a failing async task with
// exponentially growing waits.
//
// There is a CHALLENGE version of this in Coding Challenges called
// "Auto-Retry for Promises" if you want to write it yourself. This is the
// reference implementation with the production concerns attached.
//
// Why the delay grows: a fixed delay hammers a service that is already
// struggling. Doubling gives it room to recover.
//
// Why the JITTER matters, and this is the part interviews probe: without
// it, every client that failed at the same moment retries at the same
// moment, and you rebuild the spike you were backing off from. Randomising
// the wait spreads the herd. Full jitter — a random point in [0, delay) —
// is the variant AWS recommends.
//
// Retry only IDEMPOTENT work. Retrying a POST that already charged a card
// charges it twice.

function retry(task, options = {}) {
  const attempts = options.attempts ?? 4;
  const baseMs   = options.baseMs   ?? 100;
  const factor   = options.factor   ?? 2;
  const jitter   = options.jitter   ?? true;
  const signal   = options.signal;

  return new Promise((resolve, reject) => {
    let attempt = 0;
    const run = () => {
      if (signal && signal.aborted) return reject(new Error("aborted"));
      attempt++;
      // Promise.resolve().then(task) so a SYNCHRONOUS throw inside task
      // becomes a rejection instead of escaping retry entirely.
      Promise.resolve().then(task).then(resolve, (err) => {
        if (attempt >= attempts) return reject(err);
        const flat = baseMs * Math.pow(factor, attempt - 1);
        const wait = jitter ? Math.random() * flat : flat;
        console.log("  attempt " + attempt + " failed, waiting ~" + Math.round(wait) + "ms");
        setTimeout(run, wait);
      });
    };
    run();
  });
}

// Demo: fails twice, then succeeds. Short delays so it finishes here.
let calls = 0;
const flaky = () => {
  calls++;
  if (calls < 3) return Promise.reject(new Error("503 on call " + calls));
  return "succeeded on call " + calls;
};

retry(flaky, { attempts: 5, baseMs: 10 }).then((v) => console.log("resolved:", v));

// Exhausting the budget rejects with the LAST error, not a generic one:
retry(() => Promise.reject(new Error("always down")), { attempts: 2, baseMs: 5 })
  .catch((e) => console.log("gave up:", e.message));`},{name:"Promise from scratch",difficulty:"Hard",code:`// Utility: a Promise implementation with the full then-chaining state
// machine. This is the standard senior-level async question, and the
// natural step after writing Promise.all.
//
// The four things it has to get right:
//   1. a state machine that settles ONCE — pending to fulfilled/rejected,
//      never back, never twice
//   2. callbacks queued while pending, flushed on settle
//   3. then returns a NEW promise, and the handler result resolves it,
//      which is what makes chaining work
//   4. the resolution procedure: resolving with a thenable adopts its
//      state rather than wrapping it
//
// Every callback runs in a MICROTASK (queueMicrotask). Running them
// synchronously is the classic wrong answer — it makes ordering depend on
// whether a promise happened to be already settled.

class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.callbacks = [];

    const settle = (state, value) => {
      if (this.state !== "pending") return;       // settle once, ever
      this.state = state;
      this.value = value;
      queueMicrotask(() => {
        this.callbacks.forEach((cb) => cb());
        this.callbacks = [];
      });
    };

    const resolve = (value) => {
      // The resolution procedure: adopt a thenable instead of wrapping it.
      if (value && (typeof value === "object" || typeof value === "function")) {
        let then;
        try { then = value.then; } catch (e) { return settle("rejected", e); }
        if (typeof then === "function") {
          let done = false;                        // a thenable may call back twice
          try {
            then.call(value,
              (v) => { if (!done) { done = true; resolve(v); } },
              (r) => { if (!done) { done = true; settle("rejected", r); } });
          } catch (e) {
            if (!done) settle("rejected", e);
          }
          return;
        }
      }
      settle("fulfilled", value);
    };

    try { executor(resolve, (r) => settle("rejected", r)); }
    catch (e) { settle("rejected", e); }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handle = () => {
        const handler = this.state === "fulfilled" ? onFulfilled : onRejected;
        if (typeof handler !== "function") {
          // Pass through, so .then(null).catch(...) still sees the rejection.
          if (this.state === "fulfilled") resolve(this.value);
          else reject(this.value);
          return;
        }
        try { resolve(handler(this.value)); } catch (e) { reject(e); }
      };
      if (this.state === "pending") this.callbacks.push(handle);
      else queueMicrotask(handle);
    });
  }

  catch(onRejected) { return this.then(undefined, onRejected); }

  static resolve(v) { return v instanceof MyPromise ? v : new MyPromise((res) => res(v)); }
  static reject(r)  { return new MyPromise((_, rej) => rej(r)); }
}

new MyPromise((resolve) => resolve(1))
  .then((v) => { console.log("step 1:", v); return v + 1; })
  .then((v) => { console.log("step 2:", v); return new MyPromise((r) => r(v * 10)); })
  .then((v) => console.log("adopted a returned promise:", v));

new MyPromise((_, reject) => reject(new Error("failed")))
  .then((v) => console.log("never runs", v))
  .catch((e) => console.log("caught after pass-through:", e.message));

console.log("constructor runs synchronously, handlers do not");`},{name:"React from Scratch (createElement + useState)",difficulty:"Hard",code:`// Utility: React from scratch — createElement, components, and useState.
//
// "Build a mini React" is a reference question, not a trick. It is asked
// because the answer explains three things people otherwise memorise:
// why JSX needs React in scope, why a component is just a function, and
// why hooks must be called in the same order every time.
//
// This one produces an HTML STRING rather than touching the DOM, so it
// runs anywhere and the output is inspectable. A real reconciler diffs
// two trees and patches the DOM; that part is noted at the end.

// ---------- 1. createElement: JSX is sugar for this call ----------
// <div id="a">hi</div>  compiles to  h("div", { id: "a" }, "hi")
// Children are variadic and flattened, which is why an array of children
// is legal in JSX. That is the entire mystery of "JSX needs React".
function h(type, props, ...children) {
  return { type, props: { ...(props || {}), children: children.flat() } };
}

// ---------- 2. The hook slots ----------
// The whole hook mechanism is ONE array and ONE cursor. A hook does not
// know its own name; it knows its POSITION. That is the rule of hooks,
// stated as data rather than as a lint rule.
let slots = [];
let cursor = 0;
let redrawScheduled = null;

function useState(initial) {
  const i = cursor++;                       // claim this slot, then advance
  if (!(i in slots)) slots[i] = initial;    // first draw only
  const set = (next) => {
    slots[i] = typeof next === "function" ? next(slots[i]) : next;
    if (redrawScheduled) redrawScheduled();      // a set triggers a redraw
  };
  return [slots[i], set];
}

// ---------- 3. toHTML: walk the tree, call the functions ----------
function toHTML(node) {
  if (node === null || node === undefined || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toHTML).join("");

  // A COMPONENT is a function that returns a tree. There is nothing else
  // to it — no class, no registry, no instance. Calling it is "rendering".
  if (typeof node.type === "function") {
    return toHTML(node.type(node.props));
  }

  const { children, ...attrs } = node.props;
  const attrString = Object.entries(attrs)
    .filter(([, v]) => v !== false && v !== null && v !== undefined)
    .map(([k, v]) => " " + (k === "className" ? "class" : k) + '="' + v + '"')
    .join("");
  return "<" + node.type + attrString + ">" + toHTML(children) + "</" + node.type + ">";
}

// ---------- 4. The mount: reset the cursor before every draw ----------
// This single line is why hook order matters. Every draw walks the same
// slots from index 0, so slot 2 must be the same hook it was last time.
function mount(component) {
  const draw = () => {
    cursor = 0;
    const html = toHTML(h(component, null));
    console.log("  " + html);
    return html;
  };
  redrawScheduled = draw;
  return draw();
}

// ---------- 5. Use it ----------
let bump;                                        // stand-in for an onClick

function Counter() {
  const [count, setCount] = useState(0);
  const [label] = useState("clicks");
  bump = () => setCount((c) => c + 1);
  return h("div", { className: "counter" },
    h("span", null, label, ": ", count),
    h("button", { type: "button" }, "+1")
  );
}

console.log("first draw:");
mount(Counter);

console.log("after two state updates:");
bump();
bump();

// ---------- 6. Why the rules of hooks exist ----------
// Put a hook behind a condition and the SLOT NUMBERS shift. Slot 1 was
// "clicks"; on the next draw it becomes whatever the new first-called
// hook is, and the state of one variable silently lands in another.
slots = [];
cursor = 0;
redrawScheduled = null;

function Broken(props) {
  if (props && props.showTitle) {
    useState("a title");          // only SOMETIMES claims slot 0
  }
  const [name] = useState("Ada");
  return h("p", null, "name is: " + name);
}

cursor = 0;
console.log("with the conditional hook taken:  " + toHTML(h(Broken, { showTitle: true })));
cursor = 0;
console.log("with the conditional hook skipped:" + toHTML(h(Broken, { showTitle: false })));
console.log("slots are now:", JSON.stringify(slots));

// The second draw read slot 0, which holds "a title", so name is wrong.
// React cannot detect this, because a hook never tells it which hook it is.

// ---------- What this deliberately leaves out ----------
//   - Reconciliation: real React diffs the previous tree against the new
//     one and patches only what changed. This throws the string away.
//   - Keys: they exist so the diff can match children across reorders.
//     With no diff there is nothing for a key to do.
//   - Fibers, lanes and scheduling: React splits the work into units it
//     can pause. Here toHTML is one recursive, uninterruptible call.
//   - Effects: useEffect queues a callback to run AFTER the commit.
//     There is no commit here, only a string.`}]},{label:"Coding Challenges",tag:"JS",kind:"challenge",templates:[{name:"Two Sum",patterns:["Hash Map / Set"],difficulty:"Easy",code:`function twoSum(nums, target) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Example 1", twoSum([2, 7, 11, 15], 9), [0, 1]);
test("Example 2", twoSum([3, 2, 4], 6), [1, 2]);
test("Example 3", twoSum([3, 3], 6), [0, 1]);`},{name:"Reverse String",patterns:["Two Pointer"],difficulty:"Easy",code:`function reverseString(str) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Simple word", reverseString("hello"), "olleh");
test("Another word", reverseString("world"), "dlrow");
test("Single char", reverseString("a"), "a");
test("Empty string", reverseString(""), "");
test("Palindrome", reverseString("racecar"), "racecar");`},{name:"Valid Palindrome",patterns:["Two Pointer"],difficulty:"Easy",code:`function isPalindrome(s) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Classic palindrome", isPalindrome("A man, a plan, a canal: Panama"), true);
test("Not a palindrome", isPalindrome("race a car"), false);
test("Empty string", isPalindrome(""), true);
test("Single char", isPalindrome("a"), true);
test("With numbers", isPalindrome("0P"), false);`},{name:"FizzBuzz",patterns:["Math / Bit"],difficulty:"Easy",code:`function fizzBuzz(n) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("First 5", fizzBuzz(5), ["1", "2", "Fizz", "4", "Buzz"]);
test("First 15", fizzBuzz(15), ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]);
test("Just 1", fizzBuzz(1), ["1"]);
test("FizzBuzz at 30", fizzBuzz(30).slice(-1), ["FizzBuzz"]);`},{name:"Max Profit",patterns:["Greedy","Dynamic Programming"],difficulty:"Easy",code:`function maxProfit(prices) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Normal case", maxProfit([7, 1, 5, 3, 6, 4]), 5);
test("Decreasing prices", maxProfit([7, 6, 4, 3, 1]), 0);
test("Single day", maxProfit([5]), 0);
test("Two days profit", maxProfit([1, 2]), 1);
test("Buy first sell last", maxProfit([1, 4, 2, 7]), 6);`},{name:"Valid Parentheses",patterns:["Stack"],difficulty:"Easy",code:`function isValid(s) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Simple pair", isValid("()"), true);
test("Multiple types", isValid("()[]{}"), true);
test("Mismatched", isValid("(]"), false);
test("Nested valid", isValid("{[()]}"), true);
test("Wrong order", isValid("([)]"), false);
test("Empty string", isValid(""), true);`},{name:"Merge Sorted Arrays",patterns:["Two Pointer"],difficulty:"Easy",code:`function mergeSorted(arr1, arr2) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Equal length", mergeSorted([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]);
test("Different lengths", mergeSorted([1, 2], [3, 4, 5, 6]), [1, 2, 3, 4, 5, 6]);
test("One empty", mergeSorted([], [1, 2, 3]), [1, 2, 3]);
test("Both empty", mergeSorted([], []), []);
test("With duplicates", mergeSorted([1, 3, 3], [2, 3, 4]), [1, 2, 3, 3, 3, 4]);`},{name:"Flatten Array",patterns:["Recursion / D&C"],difficulty:"Medium",code:`function flatten(arr) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Nested", flatten([1, [2, [3, [4]], 5]]), [1, 2, 3, 4, 5]);
test("Already flat", flatten([1, 2, 3]), [1, 2, 3]);
test("Deep nesting", flatten([[[[1]]]]), [1]);
test("Mixed", flatten([1, [2, 3], [4, [5, 6]]]), [1, 2, 3, 4, 5, 6]);
test("Empty arrays", flatten([[], [1], [], [2, []], 3]), [1, 2, 3]);`},{name:"Debounce",patterns:["Closure / State"],difficulty:"Medium",code:`function debounce(fn, delay) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
let callCount = 0;
let lastArgs = null;
const trackedFn = (...args) => { callCount++; lastArgs = args; };

const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
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
}, 80);`},{name:"Group Anagrams",patterns:["Hash Map / Set","Sorting"],difficulty:"Medium",code:`function groupAnagrams(strs) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  // Sort inner arrays and outer array for comparison
  const normalize = (arr) =>
    arr.map(g => [...g].sort()).sort((a, b) => a.join(",").localeCompare(b.join(",")));
  const pass = JSON.stringify(normalize(actual)) === JSON.stringify(normalize(expected));
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed anagrams", groupAnagrams(["eat","tea","tan","ate","nat","bat"]), [["eat","tea","ate"],["tan","nat"],["bat"]]);
test("Single string", groupAnagrams(["a"]), [["a"]]);
test("Empty string", groupAnagrams([""]), [[""]]);
test("No anagrams", groupAnagrams(["abc","def","ghi"]), [["abc"],["def"],["ghi"]]);`},{name:"Find Duplicates",patterns:["Hash Map / Set"],difficulty:"Easy",code:`function findDuplicates(arr) {
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
test("Triple duplicate", findDuplicates([1, 1, 1, 2, 2]), [1, 2]);`},{name:"Remove Duplicates",patterns:["Hash Map / Set"],difficulty:"Easy",code:`function removeDuplicates(arr) {
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
test("Empty", removeDuplicates([]), []);`},{name:"Clean Mixed Array",patterns:["Hash Map / Set","Sorting"],difficulty:"Easy",code:`function cleanNumbers(arr) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
};

test("Numbers and letters", cleanNumbers([5, "a", 3, 5, "b", 1, 3]), [1, 3, 5]);
test("Sorts numerically, not as text", cleanNumbers([10, 9, "x", 1, 100]), [1, 9, 10, 100]);
test("Negatives and decimals", cleanNumbers([-2, "z", 0.5, -2, 3]), [-2, 0.5, 3]);
test("NaN is not a usable number", cleanNumbers([NaN, 4, "n", NaN, 2]), [2, 4]);
test("Numeric strings are characters", cleanNumbers(["7", 7, "3"]), [7]);
test("Booleans, null and undefined", cleanNumbers([true, 2, null, undefined, 1, false]), [1, 2]);
test("Nothing numeric", cleanNumbers(["a", "b"]), []);
test("Empty", cleanNumbers([]), []);
const input = [3, "a", 1, 3];
cleanNumbers(input);
test("Does not change the input", input, [3, "a", 1, 3]);`},{name:"Find Missing Number",patterns:["Math / Bit"],difficulty:"Easy",code:`function findMissing(nums) {
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
test("Larger array", findMissing([9, 6, 4, 2, 3, 5, 7, 0, 1]), 8);`},{name:"Find All Missing Numbers",patterns:["Hash Map / Set","In-Place"],difficulty:"Medium",code:`function findAllMissing(nums) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Two missing", findAllMissing([4, 3, 2, 7, 8, 2, 3, 1]), [5, 6]);
test("One missing", findAllMissing([1, 1]), [2]);
test("Nothing missing", findAllMissing([1, 2, 3, 4]), []);
test("Only one value present", findAllMissing([2, 2, 2, 2]), [1, 3, 4]);
test("Single element", findAllMissing([1]), []);`},{name:"First Missing Positive",patterns:["In-Place","Hash Map / Set"],difficulty:"Hard",code:`function firstMissingPositive(nums) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Missing 3", firstMissingPositive([1, 2, 0]), 3);
test("Negatives ignored", firstMissingPositive([3, 4, -1, 1]), 2);
test("All values too large", firstMissingPositive([7, 8, 9, 11]), 1);
test("Empty array", firstMissingPositive([]), 1);
test("Duplicates", firstMissingPositive([1, 1, 2, 2]), 3);
test("Perfect run", firstMissingPositive([1, 2, 3, 4]), 5);`},{name:"Missing Term in Arithmetic Sequence",patterns:["Binary Search","Math / Bit"],difficulty:"Medium",code:`function findMissingTerm(seq) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Missing near the end", findMissingTerm([2, 5, 8, 14]), 11);
test("Missing in the middle", findMissingTerm([5, 7, 11, 13]), 9);
test("Descending sequence", findMissingTerm([15, 12, 6, 3]), 9);
test("Crosses zero", findMissingTerm([-4, -2, 2, 4]), 0);
test("Missing right after first", findMissingTerm([1, 5, 7, 9]), 3);
test("Missing just before last", findMissingTerm([1, 3, 5, 9]), 7);`},{name:"Move Zeros",patterns:["Two Pointer","In-Place"],difficulty:"Easy",code:`function moveZeros(nums) {
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
test("Zeros first", moveZeros([0, 0, 1, 2]), [1, 2, 0, 0]);`},{name:"Rotate Array",patterns:["Two Pointer","In-Place"],difficulty:"Medium",code:`function rotate(nums, k) {
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
test("Single",       rotate([1], 5), [1]);`},{name:"Bubble Sort",patterns:["Sorting"],difficulty:"Easy",code:`function bubbleSort(arr) {
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
test("Empty",       bubbleSort([]), []);`},{name:"Quick Sort",patterns:["Sorting","Recursion / D&C"],difficulty:"Medium",code:`function quickSort(arr) {
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
test("Duplicates", quickSort([3, 1, 3, 2, 1]), [1, 1, 2, 3, 3]);`},{name:"Merge Sort",patterns:["Sorting","Recursion / D&C"],difficulty:"Medium",code:`function mergeSort(arr) {
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
test("Big",       mergeSort([10, -5, 7, 0, 3, 7]), [-5, 0, 3, 7, 7, 10]);`},{name:"Anagram Check",patterns:["Hash Map / Set","Sorting"],difficulty:"Easy",code:`function isAnagram(s1, s2) {
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
test("Empty strings",     isAnagram("", ""),             true);`},{name:"Longest Substring",patterns:["Sliding Window","Hash Map / Set"],difficulty:"Medium",code:`function lengthOfLongestSubstring(s) {
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
test("Unique",   lengthOfLongestSubstring("abcdef"), 6);`},{name:"First Non-Repeating Char",patterns:["Hash Map / Set"],difficulty:"Easy",code:`function firstNonRepeating(s) {
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
test("Empty",        firstNonRepeating(""), null);`},{name:"Sum Curry",patterns:["Closure / State","Recursion / D&C"],difficulty:"Medium",code:`function sum(a) {
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
test("With zero",    sum(0)(0)(5)(),       5);`},{name:"Memoize",patterns:["Closure / State","Hash Map / Set"],difficulty:"Medium",code:`function memoize(fn) {
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

console.log(computeCount === 2 ? "✅" : "❌", "Cache hit count: expected 2 computes, got", computeCount);`},{name:"Deep Clone",patterns:["Recursion / D&C"],difficulty:"Medium",code:`function deepClone(value) {
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
test("Different reference", original === cloned, false);`},{name:"Throttle",patterns:["Closure / State"],difficulty:"Medium",code:`function throttle(fn, limit) {
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
}, 150);`},{name:"EventEmitter",patterns:["Closure / State","Hash Map / Set"],difficulty:"Medium",code:`class EventEmitter {
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

console.log(onceCount === 1 ? "✅" : "❌", \`once should fire 1x, fired \${onceCount}x\`);`},{name:"LRU Cache",patterns:["Hash Map / Set","Linked List"],difficulty:"Hard",code:`class LRUCache {
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
console.log(cache.get(4));    // "d"`},{name:"Compose & Pipe",patterns:["Recursion / D&C","Closure / State"],difficulty:"Medium",code:`function compose(...fns) {
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
test("Single fn",             compose(double)(5), 10);`},{name:"Binary Search",patterns:["Binary Search"],difficulty:"Easy",code:`function binarySearch(nums, target) {
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
test("Single element",   binarySearch([42], 42), 0);`},{name:"Roman to Integer",patterns:["Math / Bit"],difficulty:"Easy",code:`function romanToInt(s) {
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
test("XL",      romanToInt("XL"),      40);`},{name:"Reverse Linked List",patterns:["Linked List"],difficulty:"Easy",code:`function reverseList(head) {
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
test("Long list",   toArray(reverseList(fromArray([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1]);`},{name:"Container With Most Water",patterns:["Two Pointer","Greedy"],difficulty:"Medium",code:`function maxArea(heights) {
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
test("Single",    maxArea([5]),                          0);`},{name:"Climbing Stairs",patterns:["Dynamic Programming"],difficulty:"Easy",code:`function climbStairs(n) {
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
test("n = 10", climbStairs(10), 89);`},{name:"Balanced Brackets (Count)",patterns:["Math / Bit"],difficulty:"Easy",code:`function isBalancedByCount(str) {
  // YOUR CODE HERE

}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Properly nested",       isBalancedByCount("(([]))"), true);
test("Unordered but balanced", isBalancedByCount("([)]"),  true);   // counts match — order is NOT checked
test("Unbalanced parens",     isBalancedByCount("(("),     false);
test("Mismatched bracket totals", isBalancedByCount("[[(]"), false); // 2 '[' but only 1 ']'
test("All three pairs",        isBalancedByCount("({[]})"), true);
test("Letters mixed in",       isBalancedByCount("a(b[c]d)e"), true);
test("Empty string",           isBalancedByCount(""),       true);
test("Reversed order",         isBalancedByCount(")("),     true);  // counts match!`},{name:"Second Largest Number",patterns:["Greedy"],difficulty:"Easy",code:`function secondLargest(nums) {
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
test("Empty",                 secondLargest([]),                       null);`},{name:"Maximum Subarray",patterns:["Dynamic Programming","Greedy"],difficulty:"Medium",code:`function maxSubArray(nums) {
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
test("All positive", maxSubArray([1,2,3,4]),                10);`},{name:"Trapping Rain Water",patterns:["Two Pointer"],difficulty:"Hard",code:`function trap(height) {
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
test("Flat",     trap([2,2,2]),                    0);`},{name:"3Sum",patterns:["Two Pointer","Sorting"],difficulty:"Medium",code:`function threeSum(nums) {
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
test("With duplicates", threeSum([-2,0,1,1,2]),   [[-2,0,2], [-2,1,1]]);`},{name:"Generate Parentheses",patterns:["Backtracking","Recursion / D&C"],difficulty:"Medium",code:`function generate(n) {
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
test("n=0", generate(0), [""]);`},{name:"Subsets",patterns:["Backtracking","Recursion / D&C"],difficulty:"Medium",code:`function subsets(nums) {
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
test("[]",      subsets([]),      [[]]);`},{name:"Permutations",patterns:["Backtracking","Recursion / D&C"],difficulty:"Medium",code:`function permute(nums) {
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
test("[1]",     permute([1]),     [[1]]);`},{name:"Min Stack",patterns:["Stack"],difficulty:"Medium",code:`class MinStack {
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
test("getMin one popped",   s.getMin(), -5);`},{name:"Daily Temperatures",patterns:["Stack"],difficulty:"Medium",code:`function dailyTemperatures(t) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed", dailyTemperatures([73,74,75,71,69,72,76,73]), [1,1,4,2,1,1,0,0]);
test("Increasing", dailyTemperatures([30,40,50,60]),         [1,1,1,0]);
test("Decreasing", dailyTemperatures([90,80,70]),            [0,0,0]);`},{name:"Coin Change",patterns:["Dynamic Programming"],difficulty:"Medium",code:`function coinChange(coins, amount) {
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
test("Single",     coinChange([1,2,5], 5),   1);`},{name:"House Robber",patterns:["Dynamic Programming"],difficulty:"Medium",code:`function rob(nums) {
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
test("Empty",        rob([]),              0);`},{name:"Jump Game",patterns:["Greedy"],difficulty:"Medium",code:`function canJump(nums) {
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
test("Zero start",  canJump([0,1]),       false);`},{name:"Detect Cycle in Linked List",patterns:["Linked List","Two Pointer"],difficulty:"Easy",code:`function hasCycle(head) {
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
test("Empty",          hasCycle(null),                      false);`},{name:"Sort Colors",patterns:["Two Pointer","In-Place"],difficulty:"Medium",code:`function sortColors(nums) {
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
test("All same", a4, [1,1,1]);`},{name:"Top K Frequent Elements",patterns:["Hash Map / Set","Sorting"],difficulty:"Medium",code:`function topK(nums, k) {
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
test("All same", topK([7,7,7], 1),      [7]);`},{name:"Merge Two Sorted Lists",patterns:["Linked List","Two Pointer"],difficulty:"Easy",code:`function mergeTwoLists(l1, l2) {
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
test("Disjoint",  toArray(mergeTwoLists(fromArray([1,2,3]), fromArray([4,5,6]))), [1,2,3,4,5,6]);`},{name:"Rotate Array Left",patterns:["Two Pointer","In-Place"],difficulty:"Medium",code:`function rotateLeft(nums, k) {
  // YOUR CODE HERE — mutate nums; return nums for test ergonomics
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Standard",   rotateLeft([1,2,3,4,5,6,7], 3), [4,5,6,7,1,2,3]);
test("k > n",      rotateLeft([1,2,3], 5),         [3,1,2]);   // 5 % 3 = 2
test("k = n",      rotateLeft([1,2,3,4], 4),       [1,2,3,4]); // no change
test("k = 0",      rotateLeft([1,2,3], 0),         [1,2,3]);
test("Empty",      rotateLeft([], 3),              []);
test("Single",     rotateLeft([42], 1),            [42]);`},{name:"Reverse Words in a String",patterns:["Two Pointer"],difficulty:"Medium",code:`function reverseWords(s) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Standard",        reverseWords("the sky is blue"),       "blue is sky the");
test("Trim + collapse", reverseWords("  hello   world  "),     "world hello");
test("Single word",     reverseWords("hello"),                 "hello");
test("Empty",           reverseWords(""),                      "");
test("All spaces",      reverseWords("    "),                  "");
test("Punctuated",      reverseWords("a good   example"),      "example good a");`},{name:"Longest Common Prefix",difficulty:"Easy",code:`function longestCommonPrefix(strs) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Standard",  longestCommonPrefix(["flower","flow","flight"]), "fl");
test("No common", longestCommonPrefix(["dog","racecar","car"]),    "");
test("Single",    longestCommonPrefix(["alone"]),                  "alone");
test("Identical", longestCommonPrefix(["abc","abc","abc"]),        "abc");
test("Empty",     longestCommonPrefix([]),                          "");
test("One empty", longestCommonPrefix(["", "abc"]),                 "");`},{name:"Longest Palindromic Substring",patterns:["Two Pointer","Dynamic Programming"],difficulty:"Medium",code:`function longestPalindrome(s) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
// We accept any valid longest palindrome (some inputs have ties).
const isPalin = x => x === [...x].reverse().join("");
const test = (name, actual, possibleAnswers) => {
  const pass = isPalin(actual) && possibleAnswers.some(p => p.length === actual.length);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Got \${JSON.stringify(actual)}, expected one of \${JSON.stringify(possibleAnswers)}\`);
};

test("babad",     longestPalindrome("babad"), ["bab", "aba"]);
test("cbbd",      longestPalindrome("cbbd"),  ["bb"]);
test("All same",  longestPalindrome("aaaa"),  ["aaaa"]);
test("Single",    longestPalindrome("a"),     ["a"]);
test("None",      longestPalindrome("abcde"), ["a","b","c","d","e"]);`},{name:"Reverse Vowels of a String",patterns:["Two Pointer"],difficulty:"Easy",code:`function reverseVowels(s) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("hello",        reverseVowels("hello"),    "holle");
test("leetcode",     reverseVowels("leetcode"), "leotcede");
test("Mixed case",   reverseVowels("aA"),       "Aa");
test("No vowels",    reverseVowels("bcdfg"),    "bcdfg");
test("All vowels",   reverseVowels("aeiou"),    "uoiea");
test("Empty",        reverseVowels(""),         "");`},{name:"String to Integer (atoi)",difficulty:"Medium",code:`function myAtoi(s) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Basic",           myAtoi("42"),               42);
test("With spaces",     myAtoi("   -42"),           -42);
test("Trailing words",  myAtoi("4193 with words"),  4193);
test("Leading words",   myAtoi("words 987"),        0);
test("Overflow",        myAtoi("91283472332"),      2147483647);
test("Underflow",       myAtoi("-91283472332"),     -2147483648);
test("Plus sign",       myAtoi("+1"),               1);
test("Just sign",       myAtoi("-"),                0);
test("Empty",           myAtoi(""),                 0);`},{name:"Letter Combinations of Phone Number",patterns:["Backtracking","Recursion / D&C"],difficulty:"Medium",code:`function letterCombinations(digits) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("23",     letterCombinations("23"),  ["ad","ae","af","bd","be","bf","cd","ce","cf"]);
test("Single", letterCombinations("2"),    ["a","b","c"]);
test("Empty",  letterCombinations(""),     []);
test("Three",  letterCombinations("234"),  [
  "adg","adh","adi","aeg","aeh","aei","afg","afh","afi",
  "bdg","bdh","bdi","beg","beh","bei","bfg","bfh","bfi",
  "cdg","cdh","cdi","ceg","ceh","cei","cfg","cfh","cfi",
]);`},{name:"Single Number",patterns:["Math / Bit"],difficulty:"Easy",code:`function singleNumber(nums) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Three",   singleNumber([2,2,1]),     1);
test("Five",    singleNumber([4,1,2,1,2]), 4);
test("Single",  singleNumber([1]),         1);
test("Negative",singleNumber([-1,-1,-2]), -2);`},{name:"Single Number II",patterns:["Math / Bit"],difficulty:"Medium",code:`function singleNumberII(nums) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Four",       singleNumberII([2,2,3,2]),        3);
test("Seven",      singleNumberII([0,1,0,1,0,1,99]), 99);
test("Single",     singleNumberII([7]),              7);
test("Negative",   singleNumberII([-2,-2,1,1,-3,1,-3,-3,-4,-2]), -4);
test("Large bit",  singleNumberII([1,1,1,2147483646]), 2147483646);`},{name:"Majority Element",patterns:["Math / Bit"],difficulty:"Easy",code:`function majorityElement(nums) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Three",    majorityElement([3,2,3]),         3);
test("Seven",    majorityElement([2,2,1,1,1,2,2]), 2);
test("Single",   majorityElement([42]),            42);
test("All same", majorityElement([5,5,5,5]),       5);`},{name:"Product of Array Except Self",difficulty:"Medium",code:`function productExceptSelf(nums) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Standard",  productExceptSelf([1,2,3,4]),       [24,12,8,6]);
test("With zero", productExceptSelf([-1,1,0,-3,3]),  [0,0,9,0,0]);
test("Two zeros", productExceptSelf([0,0,1,2]),       [0,0,0,0]);
test("Pair",      productExceptSelf([3,5]),           [5,3]);`},{name:"Plus One",difficulty:"Easy",code:`function plusOne(digits) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Simple",    plusOne([1,2,3]),         [1,2,4]);
test("All nines", plusOne([9,9,9]),         [1,0,0,0]);
test("Single 9",  plusOne([9]),             [1,0]);
test("Trailing 9",plusOne([1,2,9]),         [1,3,0]);
test("Zero",      plusOne([0]),             [1]);`},{name:"Subarray Sum Equals K",patterns:["Hash Map / Set"],difficulty:"Medium",code:`function subarraySum(nums, k) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Standard",      subarraySum([1,1,1], 2),       2);
test("Pair sum",      subarraySum([1,2,3], 3),       2);
test("All k",         subarraySum([1,1,1,1], 2),     3);
test("Negatives",     subarraySum([1,-1,0], 0),      3);
test("None",          subarraySum([1,2,3], 7),       0);
test("Single match",  subarraySum([5], 5),           1);`},{name:"Search in Rotated Sorted Array",patterns:["Binary Search"],difficulty:"Medium",code:`function searchRotated(nums, target) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Rotated, right half",  searchRotated([4,5,6,7,0,1,2], 0), 4);
test("Rotated, left half",   searchRotated([4,5,6,7,0,1,2], 5), 1);
test("Not found",            searchRotated([4,5,6,7,0,1,2], 3), -1);
test("Empty",                searchRotated([], 1),              -1);
test("Single, hit",          searchRotated([1], 1),             0);
test("Not rotated",          searchRotated([1,2,3,4,5], 3),     2);
test("Rotated by 1",         searchRotated([5,1,2,3,4], 1),     1);`},{name:"Spiral Matrix",difficulty:"Medium",code:`function spiralOrder(matrix) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("3x3",       spiralOrder([[1,2,3],[4,5,6],[7,8,9]]),                 [1,2,3,6,9,8,7,4,5]);
test("3x4",       spiralOrder([[1,2,3,4],[5,6,7,8],[9,10,11,12]]),        [1,2,3,4,8,12,11,10,9,5,6,7]);
test("Single row",spiralOrder([[1,2,3,4]]),                                [1,2,3,4]);
test("Single col",spiralOrder([[1],[2],[3]]),                              [1,2,3]);
test("Empty",     spiralOrder([]),                                         []);
test("1x1",       spiralOrder([[42]]),                                     [42]);`},{name:"Find Maximum in Array",patterns:["Greedy"],difficulty:"Easy",code:`function findMax(nums) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Mixed",        findMax([3, 7, 1, 9, 4]),       9);
test("All negative", findMax([-5, -2, -8, -1]),      -1);
test("Single",       findMax([42]),                  42);
test("All same",     findMax([5, 5, 5]),             5);
test("With negatives", findMax([-3, 0, 5, -1]),      5);
test("Empty",        findMax([]),                    null);`},{name:"Max Consecutive Ones",patterns:["Sliding Window","Greedy"],difficulty:"Easy",code:`function maxConsecutiveOnes(nums) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Interview array",  maxConsecutiveOnes([1,1,1,1,1,1,0,0,1,0,1,1,1,1,1,0]), 6);
test("Longest run is not the total", maxConsecutiveOnes([1,1,0,1,1,1]), 3);
test("Run at the very end", maxConsecutiveOnes([0,0,1,1,1]),       3);
test("All ones",         maxConsecutiveOnes([1,1,1,1]),             4);
test("All zeros",        maxConsecutiveOnes([0,0,0]),               0);
test("Empty",            maxConsecutiveOnes([]),                    0);`},{name:"Find Min and Max",patterns:["Greedy"],difficulty:"Easy",code:`function findMinMax(nums) {
  // YOUR CODE HERE — return { min, max }
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed",        findMinMax([3, 7, 1, 9, 4]),    { min: 1, max: 9 });
test("All negative", findMinMax([-5, -2, -8, -1]),   { min: -8, max: -1 });
test("Single",       findMinMax([42]),               { min: 42, max: 42 });
test("All same",     findMinMax([5, 5, 5]),          { min: 5, max: 5 });
test("Two elements", findMinMax([10, 3]),            { min: 3, max: 10 });
test("Empty",        findMinMax([]),                 { min: null, max: null });`},{name:"Third Largest Number",patterns:["Greedy"],difficulty:"Easy",code:`function thirdLargest(nums) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("Three distinct",  thirdLargest([3, 2, 1]),       1);
test("Fewer than 3",    thirdLargest([1, 2]),          2);
test("With duplicates", thirdLargest([2, 2, 3, 1]),    1);
test("All same",        thirdLargest([5, 5, 5]),       5);
test("Larger array",    thirdLargest([1, 2, 2, 5, 3, 5]), 2);
test("Single",          thirdLargest([42]),            42);`},{name:"Kth Largest Element",patterns:["Sorting"],difficulty:"Medium",code:`function kthLargest(nums, k) {
  // YOUR CODE HERE
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${expected}, got \${actual}\`);
};

test("k=2",            kthLargest([3,2,1,5,6,4], 2),         5);
test("k=4 with dups",  kthLargest([3,2,3,1,2,4,5,5,6], 4),   4);
test("k=1 (largest)",  kthLargest([3,2,1], 1),               3);
test("k=n (smallest)", kthLargest([3,2,1], 3),               1);
test("Negatives",      kthLargest([-1, -2, -3], 2),         -2);
test("Single",         kthLargest([42], 1),                  42);`},{name:"Find Peak Element",patterns:["Binary Search"],difficulty:"Medium",code:`function findPeak(nums) {
  // YOUR CODE HERE — return any valid peak INDEX
}

// ═════ TEST CASES ═════
const test = (name, actual, validIndices) => {
  const pass = validIndices.includes(actual);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Got \${actual}, expected one of \${JSON.stringify(validIndices)}\`);
};

test("Single peak",   findPeak([1, 2, 3, 1]),                [2]);
test("Two peaks",     findPeak([1, 2, 1, 3, 5, 6, 4]),       [1, 5]);
test("Single",        findPeak([42]),                         [0]);
test("Strictly inc",  findPeak([1, 2, 3, 4, 5]),              [4]);
test("Strictly dec",  findPeak([5, 4, 3, 2, 1]),              [0]);
test("Two elements",  findPeak([1, 2]),                       [1]);`},{name:"Auto-Retry for Promises",patterns:["Closure / State"],difficulty:"Medium",code:`function autoRetry(fn, retries = 3, delay = 100) {
  // YOUR CODE HERE — return an async function with same signature as fn
}

// ═════ TEST CASES ═════
// Simulate a flaky function that succeeds on the Nth call.
function makeFlaky(failsBefore, returnValue) {
  let calls = 0;
  return async () => {
    calls++;
    if (calls <= failsBefore) throw new Error(\`fail \${calls}\`);
    return { value: returnValue, attempts: calls };
  };
}

async function run() {
  const test = (name, actual, expected) => {
    const pass = JSON.stringify(actual) === JSON.stringify(expected);
    console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
  };

  const succeedsOnSecond = autoRetry(makeFlaky(1, "OK"), 3, 5);
  test("retries once then succeeds", await succeedsOnSecond(), { value: "OK", attempts: 2 });

  const succeedsOnThird = autoRetry(makeFlaky(2, "yes"), 3, 5);
  test("retries twice then succeeds", await succeedsOnThird(), { value: "yes", attempts: 3 });

  try {
    const allFail = autoRetry(makeFlaky(10, ""), 2, 5);
    await allFail();
    console.log("❌ should have thrown after retries exhausted");
  } catch (e) {
    console.log("✅ throws after retries exhausted:", e.message);
  }
}
run();`},{name:"Batch Promises by Concurrency",patterns:["Closure / State"],difficulty:"Medium",code:`async function batchPromises(tasks, concurrency) {
  // YOUR CODE HERE — return array of results in same order as tasks
}

// ═════ TEST CASES ═════
const wait = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const test = (name, actual, expected) => {
    const pass = JSON.stringify(actual) === JSON.stringify(expected);
    console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
  };

  // 5 tasks each returning their index after a small delay
  const tasks = [1, 2, 3, 4, 5].map(n => async () => { await wait(10); return n; });
  test("All preserve order", await batchPromises(tasks, 2), [1, 2, 3, 4, 5]);

  // Single task
  test("Single task", await batchPromises([async () => 42], 3), [42]);

  // Empty
  test("Empty",       await batchPromises([], 3), []);

  // Concurrency >= tasks.length — effectively Promise.all
  const ts = [1, 2, 3].map(n => async () => n);
  test("Concurrency > n", await batchPromises(ts, 10), [1, 2, 3]);
}
run();`},{name:"Async Tasks in Series",patterns:["Closure / State"],difficulty:"Easy",code:`async function runInSeries(tasks) {
  // YOUR CODE HERE — return array of results in order
}

// ═════ TEST CASES ═════
const wait = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const test = (name, actual, expected) => {
    const pass = JSON.stringify(actual) === JSON.stringify(expected);
    console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
  };

  // Verify ORDER: track call times.
  const calls = [];
  const tasks = [1, 2, 3].map(n => async () => {
    calls.push(\`start \${n}\`);
    await wait(5);
    calls.push(\`end \${n}\`);
    return n * 10;
  });
  test("Results in order", await runInSeries(tasks), [10, 20, 30]);
  test("Truly sequential", calls, ["start 1","end 1","start 2","end 2","start 3","end 3"]);

  test("Empty", await runInSeries([]), []);
}
run();`},{name:"Implement useState (Basic)",patterns:["Closure / State"],difficulty:"Medium",code:`function createState(initial, render) {
  // YOUR CODE HERE — return [getValue, setValue]
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

const renders = [];
const [getCount, setCount] = createState(0, v => renders.push(v));
test("Initial value", getCount(), 0);

setCount(5);
test("After set(5)", getCount(), 5);
test("Render called", renders, [5]);

setCount(c => c + 1);
test("Functional update", getCount(), 6);
test("Two renders",      renders,    [5, 6]);

setCount(c => c * 2);
test("Functional doubles", getCount(), 12);
test("Three renders",      renders,    [5, 6, 12]);

// Independent state slots — each createState call gets its own closure.
const renders2 = [];
const [getName, setName] = createState("Alice", v => renders2.push(v));
setName("Bob");
test("Independent slot 1", getName(),  "Bob");
test("Independent slot 2", getCount(), 12);   // unchanged`},{name:"JSON Prettifier",patterns:["Recursion / D&C"],difficulty:"Medium",code:`function prettify(value, indent = 2) {
  // YOUR CODE HERE — produce the indented JSON string
}

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = actual === expected;
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected:\\n\${expected}\\nGot:\\n\${actual}\`);
};

test("Number",    prettify(42),                     "42");
test("String",    prettify("hi"),                   '"hi"');
test("Boolean",   prettify(true),                   "true");
test("Null",      prettify(null),                   "null");
test("Empty obj", prettify({}),                     "{}");
test("Empty arr", prettify([]),                     "[]");
test("Flat obj",  prettify({a: 1, b: 2}),
\`{
  "a": 1,
  "b": 2
}\`);
test("Nested",    prettify({a: 1, b: [2, 3]}),
\`{
  "a": 1,
  "b": [
    2,
    3
  ]
}\`);
test("Tab indent", prettify({x: 1}, 4),
\`{
    "x": 1
}\`);`},{name:"Task Runner with Concurrency Control",patterns:["Closure / State"],difficulty:"Hard",code:`class TaskRunner {
  constructor(concurrency) {
    // YOUR CODE HERE
  }
  add(taskFn) {
    // YOUR CODE HERE — return a Promise resolving with taskFn's result
  }
}

// ═════ TEST CASES ═════
const wait = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const test = (name, actual, expected) => {
    const pass = JSON.stringify(actual) === JSON.stringify(expected);
    console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
  };

  // 4 tasks, concurrency 2 → at most 2 running at once.
  const runner = new TaskRunner(2);
  const inFlight = { now: 0, max: 0 };
  const make = n => async () => {
    inFlight.now++;
    inFlight.max = Math.max(inFlight.max, inFlight.now);
    await wait(20);
    inFlight.now--;
    return n;
  };

  const results = await Promise.all([
    runner.add(make(1)),
    runner.add(make(2)),
    runner.add(make(3)),
    runner.add(make(4)),
  ]);

  test("All results returned",       results.sort(), [1, 2, 3, 4]);
  test("Concurrency cap respected",  inFlight.max,    2);

  // Late adds work too
  const late = await runner.add(async () => "late");
  test("Late add resolves",          late,            "late");
}
run();`},{name:"Merge Intervals",patterns:["Sorting","Greedy"],difficulty:"Medium",code:`function merge(intervals) {
  // YOUR CODE HERE

  return [];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Overlapping",     merge([[1,3],[2,6],[8,10],[15,18]]), [[1,6],[8,10],[15,18]]);
test("Touching",        merge([[1,4],[4,5]]),                [[1,5]]);
test("Fully contained", merge([[1,10],[2,3],[4,8]]),         [[1,10]]);
test("Unsorted input",  merge([[5,6],[1,3],[2,4]]),          [[1,4],[5,6]]);
test("Single",          merge([[1,4]]),                      [[1,4]]);
test("Empty",           merge([]),                           []);`},{name:"Minimum Size Subarray Sum",patterns:["Sliding Window","Two Pointer"],difficulty:"Medium",code:`function minSubArrayLen(target, nums) {
  // YOUR CODE HERE

  return 0;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Standard",        minSubArrayLen(7,  [2,3,1,2,4,3]), 2);
test("Impossible",      minSubArrayLen(11, [1,1,1,1]),     0);
test("Whole array",     minSubArrayLen(11, [1,2,3,4,5]),   3);
test("Single element",  minSubArrayLen(4,  [1,4,4]),       1);
test("Exact match",     minSubArrayLen(6,  [1,2,3]),       3);
test("Empty",           minSubArrayLen(1,  []),            0);`},{name:"Sliding Window Maximum",patterns:["Sliding Window","Stack"],difficulty:"Hard",code:`function maxSlidingWindow(nums, k) {
  // YOUR CODE HERE

  return [];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Standard",     maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3), [3,3,5,5,6,7]);
test("k = 1",        maxSlidingWindow([1,3,-1], 1),            [1,3,-1]);
test("k = length",   maxSlidingWindow([4,2,12,3], 4),          [12]);
test("Decreasing",   maxSlidingWindow([5,4,3,2,1], 2),         [5,4,3,2]);
test("Increasing",   maxSlidingWindow([1,2,3,4], 2),           [2,3,4]);
test("Empty",        maxSlidingWindow([], 3),                  []);`},{name:"Longest Consecutive Sequence",patterns:["Hash Map / Set"],difficulty:"Medium",code:`function longestConsecutive(nums) {
  // YOUR CODE HERE

  return 0;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Standard",     longestConsecutive([100,4,200,1,3,2]),        4);
test("Longer run",   longestConsecutive([0,3,7,2,5,8,4,6,0,1]),    9);
test("Duplicates",   longestConsecutive([1,2,2,3]),                3);
test("No sequence",  longestConsecutive([10,30,20]),               1);
test("Negatives",    longestConsecutive([-2,-1,0,1]),              4);
test("Empty",        longestConsecutive([]),                       0);`},{name:"Next Permutation",patterns:["In-Place","Two Pointer"],difficulty:"Medium",code:`function nextPermutation(nums) {
  // YOUR CODE HERE

  return nums;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Simple",        nextPermutation([1,2,3]),   [1,3,2]);
test("Wrap around",   nextPermutation([3,2,1]),   [1,2,3]);
test("Duplicates",    nextPermutation([1,1,5]),   [1,5,1]);
test("Longer suffix", nextPermutation([1,3,2]),   [2,1,3]);
test("Single",        nextPermutation([1]),       [1]);
test("Two swap",      nextPermutation([2,3,1]),   [3,1,2]);`},{name:"Rotate Matrix 90°",patterns:["In-Place","Two Pointer"],difficulty:"Medium",code:`function rotate(matrix) {
  // YOUR CODE HERE

  return matrix;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("3x3", rotate([[1,2,3],[4,5,6],[7,8,9]]), [[7,4,1],[8,5,2],[9,6,3]]);
test("2x2", rotate([[1,2],[3,4]]),              [[3,1],[4,2]]);
test("1x1", rotate([[1]]),                      [[1]]);
test("4x4", rotate([[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]),
            [[13,9,5,1],[14,10,6,2],[15,11,7,3],[16,12,8,4]]);`},{name:"Shuffle Array (Fisher-Yates)",patterns:["Math / Bit","In-Place"],difficulty:"Easy",code:`function shuffle(arr) {
  // YOUR CODE HERE

  return arr;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

// Statistical tests — a shuffle can't be checked by a single equality.
const input = [1, 2, 3, 4, 5];
const out = shuffle([...input]);

test("Same length",     out.length,                       5);
test("Same elements",   [...out].sort((a,b) => a-b),       [1,2,3,4,5]);
test("Single element",  shuffle([7]),                      [7]);
test("Empty",           shuffle([]),                      []);

// Every element should reach every position over many runs.
const positionSeen = [0,1,2,3,4].map(() => new Set());
for (let t = 0; t < 2000; t++) {
  shuffle([1,2,3,4,5]).forEach((v, i) => positionSeen[i].add(v));
}
test("All positions reachable", positionSeen.every(s => s.size === 5), true);`},{name:"Array Intersection & Union",patterns:["Hash Map / Set"],difficulty:"Easy",code:`function intersection(a, b) {
  // YOUR CODE HERE
  return [];
}

function union(a, b) {
  // YOUR CODE HERE
  return [];
}

function difference(a, b) {
  // YOUR CODE HERE
  return [];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Intersection",        intersection([1,2,3,4], [2,4,6]), [2,4]);
test("Intersection dedupe", intersection([1,2,2,3], [2,2]),   [2]);
test("Intersection none",   intersection([1,2], [3,4]),       []);
test("Union",               union([1,2], [2,3]),              [1,2,3]);
test("Union dedupe",        union([1,1,2], [2,3,3]),          [1,2,3]);
test("Difference",          difference([1,2,3], [2]),         [1,3]);
test("Difference all",      difference([1,2], [1,2]),         []);
test("Empty inputs",        union([], []),                    []);`},{name:"Chunk Array",patterns:["In-Place","Math / Bit"],difficulty:"Easy",code:`function chunk(arr, size) {
  // YOUR CODE HERE

  return [];
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Uneven remainder", chunk([1,2,3,4,5], 2), [[1,2],[3,4],[5]]);
test("Exact fit",        chunk([1,2,3,4], 2),   [[1,2],[3,4]]);
test("Size > length",    chunk([1,2,3], 5),     [[1,2,3]]);
test("Size 1",           chunk([1,2], 1),       [[1],[2]]);
test("Empty array",      chunk([], 3),          []);
test("Size 0 guard",     chunk([1,2], 0),       []);
test("Negative guard",   chunk([1,2], -1),      []);`},{name:"String Compression (RLE)",patterns:["Two Pointer","In-Place"],difficulty:"Medium",code:`function compress(str) {
  // YOUR CODE HERE

  return str;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Standard",       compress("aabcccccaaa"),  "a2bc5a3");
test("No gain",        compress("abc"),          "abc");
test("Equal length",   compress("aabb"),         "aabb");
test("Multi-digit",    compress("aaaaaaaaaaaa"), "a12");
test("Single char",    compress("a"),            "a");
test("All same",       compress("aaaa"),         "a4");
test("Empty",          compress(""),             "");`},{name:"Integer to Roman",patterns:["Greedy","Hash Map / Set"],difficulty:"Medium",code:`function intToRoman(num) {
  // YOUR CODE HERE

  return "";
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Three",        intToRoman(3),    "III");
test("Fifty-eight",  intToRoman(58),   "LVIII");
test("1994",         intToRoman(1994), "MCMXCIV");
test("Four",         intToRoman(4),    "IV");
test("Nine",         intToRoman(9),    "IX");
test("Forty",        intToRoman(40),   "XL");
test("Max",          intToRoman(3999), "MMMCMXCIX");
test("One",          intToRoman(1),    "I");`},{name:"Reverse Integer",patterns:["Math / Bit"],difficulty:"Medium",code:`function reverse(x) {
  // YOUR CODE HERE

  return 0;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Positive",       reverse(123),        321);
test("Negative",       reverse(-123),      -321);
test("Trailing zero",  reverse(120),        21);
test("Zero",           reverse(0),          0);
test("Overflow +",     reverse(1534236469), 0);
test("Overflow -",     reverse(-2147483648),0);
test("Single digit",   reverse(7),          7);
test("Palindromic",    reverse(1221),       1221);`},{name:"Isomorphic Strings",patterns:["Hash Map / Set"],difficulty:"Easy",code:`function isIsomorphic(s, t) {
  // YOUR CODE HERE

  return false;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("egg/add",     isIsomorphic("egg", "add"),   true);
test("foo/bar",     isIsomorphic("foo", "bar"),   false);
test("badc/baba",   isIsomorphic("badc", "baba"), false);
test("paper/title", isIsomorphic("paper","title"),true);
test("Same string", isIsomorphic("abc", "abc"),   true);
test("Diff length", isIsomorphic("ab", "abc"),    false);
test("Empty",       isIsomorphic("", ""),         true);`},{name:"Longest Repeating Char Replacement",patterns:["Sliding Window","Hash Map / Set"],difficulty:"Medium",code:`function characterReplacement(s, k) {
  // YOUR CODE HERE

  return 0;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("ABAB k=2",      characterReplacement("ABAB", 2),     4);
test("AABABBA k=1",   characterReplacement("AABABBA", 1),  4);
test("k=0 no change", characterReplacement("ABCD", 0),     1);
test("All same",      characterReplacement("AAAA", 2),     4);
test("k >= length",   characterReplacement("ABC", 5),      3);
test("Empty",         characterReplacement("", 2),         0);`},{name:"Minimum Window Substring",patterns:["Sliding Window","Hash Map / Set"],difficulty:"Hard",code:`function minWindow(s, t) {
  // YOUR CODE HERE

  return "";
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Standard",      minWindow("ADOBECODEBANC", "ABC"), "BANC");
test("Insufficient",  minWindow("a", "aa"),              "");
test("Exact match",   minWindow("ab", "ab"),             "ab");
test("Duplicates",    minWindow("aa", "aa"),             "aa");
test("Single char",   minWindow("a", "a"),               "a");
test("Not present",   minWindow("abc", "xyz"),           "");
test("Empty t",       minWindow("abc", ""),              "");`},{name:"Case Converter (camel/snake/kebab)",patterns:["Hash Map / Set"],difficulty:"Easy",code:`function toCamel(str) {
  // YOUR CODE HERE
  return str;
}

function toSnake(str) {
  // YOUR CODE HERE
  return str;
}

function toKebab(str) {
  // YOUR CODE HERE
  return str;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("snake → camel",    toCamel("user_first_name"),  "userFirstName");
test("kebab → camel",    toCamel("user-first-name"),  "userFirstName");
test("camel idempotent", toCamel("userFirstName"),    "userFirstName");
test("double sep",       toCamel("a__b"),             "aB");
test("camel → snake",    toSnake("userFirstName"),    "user_first_name");
test("snake idempotent", toSnake("user_first_name"),  "user_first_name");
test("camel → kebab",    toKebab("userFirstName"),    "user-first-name");
test("single word",      toCamel("name"),             "name");
test("Empty",            toCamel(""),                 "");`},{name:"First Repeating Character",patterns:["Hash Map / Set"],difficulty:"Easy",code:`function firstRepeating(str) {
  // YOUR CODE HERE

  return null;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("success",      firstRepeating("success"),  "c");
test("All unique",   firstRepeating("abcdef"),   null);
test("Immediate",    firstRepeating("aab"),      "a");
test("Last pair",    firstRepeating("abcca"),    "c");
test("Single char",  firstRepeating("a"),        null);
test("Empty",        firstRepeating(""),         null);
test("Spaces count", firstRepeating("a b a"),    " ");`},{name:"Sum Without Loops",patterns:["Recursion / D&C","Math / Bit"],difficulty:"Easy",code:`function sumReduce(arr) {
  // YOUR CODE HERE
  return 0;
}

function sumRecursive(arr) {
  // YOUR CODE HERE
  return 0;
}

function sumTail(arr, acc = 0) {
  // YOUR CODE HERE
  return 0;
}

function sumNested(arr) {
  // YOUR CODE HERE — [1,[2,[3,[4]]]] → 10
  return 0;
}

// ===== TEST CASES =====
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("reduce",           sumReduce([1,2,3,4]),        10);
test("reduce empty",     sumReduce([]),               0);
test("recursive",        sumRecursive([1,2,3,4]),     10);
test("recursive empty",  sumRecursive([]),            0);
test("tail",             sumTail([1,2,3,4]),          10);
test("negatives",        sumReduce([-1,-2,3]),        0);
test("nested",           sumNested([1,[2,[3,[4]]]]),  10);
test("nested empty",     sumNested([[],[[]]]),        0);
test("nested mixed",     sumNested([1,[2,3],[[4],5]]),15);`},{name:"DOM Tree Height",patterns:["Tree Traversal","Recursion / D&C"],difficulty:"Easy",code:`function treeHeight(node) {
  // YOUR CODE HERE

}

// ═════ TREE HELPER (plain objects standing in for DOM nodes) ═════
const el = (tag, ...children) => ({ tag, children });

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
};
const page = el("html",
  el("head", el("title")),
  el("body",
    el("header", el("nav", el("ul", el("li"), el("li")))),
    el("main", el("p"))));

test("Nested page", treeHeight(page), 6);
test("Single node", treeHeight(el("div")), 1);
test("Empty tree", treeHeight(null), 0);
test("Wide but shallow", treeHeight(el("ul", el("li"), el("li"), el("li"), el("li"))), 2);
test("Deepest branch is the last child", treeHeight(el("div", el("p"), el("p"), el("section", el("div", el("span"))))), 4);`},{name:"Invert Binary Tree",patterns:["Tree Traversal","Recursion / D&C"],difficulty:"Easy",code:`function invertTree(root) {
  // YOUR CODE HERE

}

// ═════ TREE HELPERS ═════
const node = (val, left = null, right = null) => ({ val, left, right });
// A tree as nested [val, left, right] arrays, so a test can compare a whole tree at once.
const shape = (n) => (n ? [n.val, shape(n.left), shape(n.right)] : null);

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
};
const full = node(4, node(2, node(1), node(3)), node(7, node(6), node(9)));
test("Full tree", shape(invertTree(full)), [4, [7, [9, null, null], [6, null, null]], [2, [3, null, null], [1, null, null]]]);
test("Single node", shape(invertTree(node(1))), [1, null, null]);
test("Empty tree", invertTree(null), null);
test("Left chain becomes a right chain", shape(invertTree(node(1, node(2, node(3))))), [1, null, [2, null, [3, null, null]]]);
const same = node(5, node(3), node(8));
test("Returns the same root, mirrored in place", invertTree(same) === same && same.left.val === 8, true);`},{name:"Level-Order Traversal",patterns:["Tree Traversal"],difficulty:"Medium",code:`function levelOrder(root) {
  // YOUR CODE HERE

}

// ═════ TREE HELPER (plain objects standing in for DOM nodes) ═════
const el = (tag, ...children) => ({ tag, children });

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
};
const page = el("body",
  el("header", el("h1"), el("nav")),
  el("main", el("article", el("p"), el("p"))),
  el("footer"));

test("Page", levelOrder(page), [["body"], ["header", "main", "footer"], ["h1", "nav", "article"], ["p", "p"]]);
test("Single node", levelOrder(el("div")), [["div"]]);
test("Empty tree", levelOrder(null), []);
test("A chain", levelOrder(el("a", el("b", el("c")))), [["a"], ["b"], ["c"]]);
test("Left to right across different parents", levelOrder(el("r", el("x", el("x1")), el("y"), el("z", el("z1"), el("z2")))), [["r"], ["x", "y", "z"], ["x1", "z1", "z2"]]);`},{name:"getElementsByClassName from Scratch",patterns:["Tree Traversal"],difficulty:"Medium",code:`function getElementsByClassName(root, classNames) {
  // YOUR CODE HERE

}

// ═════ TREE HELPERS (plain objects standing in for DOM nodes) ═════
const el = (id, className, ...children) => ({ tag: "div", id, className, children });
const ids = (nodes) => nodes && nodes.map((n) => n.id);

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
};
const root = el("root", "app",
  el("a", "card big",
    el("a1", "card"),
    el("a2", "big card featured")),
  el("b", "cardboard"),
  el("c", "  card   big  "),
  el("d", "", el("d1", "card big")));

test("One class, document order", ids(getElementsByClassName(root, "card")), ["a", "a1", "a2", "c", "d1"]);
test("Every class must match, in any order", ids(getElementsByClassName(root, "big card")), ["a", "a2", "c", "d1"]);
test("Whole class names only", ids(getElementsByClassName(root, "car")), []);
test("The root itself is not included", ids(getElementsByClassName(root, "app")), []);
test("Extra spaces in the query", ids(getElementsByClassName(root, "  featured ")), ["a2"]);
test("Empty query matches nothing", ids(getElementsByClassName(root, "")), []);`},{name:"Find Matching Node in Identical Tree",patterns:["Tree Traversal"],difficulty:"Medium",code:`function findCorrespondingNode(rootA, rootB, target) {
  // YOUR CODE HERE

}

// ═════ TREE HELPERS (plain objects standing in for DOM nodes) ═════
const el = (tag, ...children) => ({ tag, parent: null, children });
// Sets every node's parent pointer, the way the DOM's parentNode works.
const withParents = (node, parent = null) => {
  node.parent = parent;
  for (const child of node.children) withParents(child, node);
  return node;
};
const makePage = () => withParents(
  el("div",
    el("p"),
    el("p", el("span"), el("span")),
    el("p")));

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
};
const A = makePage();
const B = makePage();

test("Root maps to root", findCorrespondingNode(A, B, A) === B, true);
test("A leaf", findCorrespondingNode(A, B, A.children[0]) === B.children[0], true);
test("Two levels down", findCorrespondingNode(A, B, A.children[1].children[1]) === B.children[1].children[1], true);
test("Same tag as its siblings: position decides, not the tag", findCorrespondingNode(A, B, A.children[2]) === B.children[2], true);
test("A node that is not in tree A", findCorrespondingNode(A, B, makePage().children[0]), null);`},{name:"Lowest Common Ancestor of Two Nodes",patterns:["Tree Traversal","Hash Map / Set"],difficulty:"Medium",code:`function lowestCommonAncestor(a, b) {
  // YOUR CODE HERE

}

// ═════ TREE HELPERS (plain objects standing in for DOM nodes) ═════
const el = (id, ...children) => ({ id, parent: null, children });
// Sets every node's parent pointer, the way the DOM's parentNode works.
const withParents = (node, parent = null) => {
  node.parent = parent;
  for (const child of node.children) withParents(child, node);
  return node;
};
// null stays null, so a function that returns nothing (undefined) does not pass.
const idOf = (n) => (n === null ? null : n && n.id);

// ═════ TEST CASES ═════
const test = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
};
const root = withParents(
  el("root",
    el("a",
      el("a1", el("a1x")),
      el("a2")),
    el("b", el("b1"))));
const [a, b] = root.children;
const [a1, a2] = a.children;
const a1x = a1.children[0];
const b1 = b.children[0];

test("Siblings", idOf(lowestCommonAncestor(a1, a2)), "a");
test("Different depths", idOf(lowestCommonAncestor(a1x, a2)), "a");
test("Different subtrees", idOf(lowestCommonAncestor(a1x, b1)), "root");
test("One is an ancestor of the other", idOf(lowestCommonAncestor(a, a1x)), "a");
test("The same node twice", idOf(lowestCommonAncestor(b1, b1)), "b1");
test("Nodes in different trees", idOf(lowestCommonAncestor(a1, withParents(el("other", el("x"))).children[0])), null);`}]},{label:"TypeScript Challenges",tag:"JS",kind:"challenge",templates:[{name:"MyPick and MyOmit",lang:"ts",difficulty:"Easy",code:`type MyPick<T, K> = any; // YOUR CODE HERE

type MyOmit<T, K> = any; // YOUR CODE HERE

function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): MyPick<T, K> {
  // YOUR CODE HERE
}

function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): MyOmit<T, K> {
  // YOUR CODE HERE
}

// ===== TYPE TESTS (checked by the TypeScript type checker when you press Run) =====
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

interface Todo {
  readonly id: number;
  title: string;
  description?: string;
  completed: boolean;
}

type _pick1 = Expect<Equal<MyPick<Todo, "title">, { title: string }>>;
type _pick2 = Expect<Equal<MyPick<Todo, "title" | "completed">, { title: string; completed: boolean }>>;
type _pick3 = Expect<Equal<MyPick<Todo, "id" | "description">, { readonly id: number; description?: string }>>;
type _omit1 = Expect<Equal<MyOmit<Todo, "description" | "completed">, { readonly id: number; title: string }>>;
type _omit2 = Expect<Equal<MyOmit<Todo, "id" | "title">, { description?: string; completed: boolean }>>;

// These must NOT compile: a key that Todo does not have is a mistake.
// @ts-expect-error
type _bad1 = MyPick<Todo, "nope">;
// @ts-expect-error
type _bad2 = MyOmit<Todo, "nope">;

// ===== RUNTIME TESTS =====
const test = (name: string, actual: unknown, expected: unknown) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
};

const todo: Todo = { id: 1, title: "Write tests", description: "for pick and omit", completed: false };
test("pick one key", pick(todo, ["title"]), { title: "Write tests" });
test("pick two keys", pick(todo, ["id", "completed"]), { id: 1, completed: false });
test("omit one key", omit(todo, ["description"]), { id: 1, title: "Write tests", completed: false });
test("omit two keys", omit(todo, ["id", "title"]), { description: "for pick and omit", completed: false });
test("omit does not change the input", todo, { id: 1, title: "Write tests", description: "for pick and omit", completed: false });`},{name:"Model an API Response",lang:"ts",difficulty:"Easy",code:`interface User {
  id: number;
  name: string;
}

type RequestState<T> = any; // YOUR CODE HERE

function describeState(state: RequestState<User>): string {
  // YOUR CODE HERE
}

// ===== TYPE TESTS (checked by the TypeScript type checker when you press Run) =====
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

type _status = Expect<Equal<RequestState<User>["status"], "loading" | "success" | "error">>;
type _data = Expect<Equal<Extract<RequestState<User>, { status: "success" }>["data"], User>>;
type _error = Expect<Equal<Extract<RequestState<User>, { status: "error" }>["error"], string>>;

// These must NOT compile: each one is a state the UI should never be in.
// @ts-expect-error success with no data
const bad1: RequestState<User> = { status: "success" };
// @ts-expect-error loading does not carry data yet
const bad2: RequestState<User> = { status: "loading", data: { id: 1, name: "Ada" } };
// @ts-expect-error an error needs its message
const bad3: RequestState<User> = { status: "error" };
// @ts-expect-error there is no "idle" state in this model
const bad4: RequestState<User> = { status: "idle" };

// ===== RUNTIME TESTS =====
const test = (name: string, actual: unknown, expected: unknown) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
};

test("loading", describeState({ status: "loading" }), "Loading...");
test("success", describeState({ status: "success", data: { id: 1, name: "Ada" } }), "Hello, Ada");
test("error", describeState({ status: "error", error: "Network timeout" }), "Failed: Network timeout");`},{name:"DeepReadonly<T>",lang:"ts",difficulty:"Medium",code:`type DeepReadonly<T> = any; // YOUR CODE HERE

function deepFreeze<T>(value: T): DeepReadonly<T> {
  // YOUR CODE HERE
}

// ===== TYPE TESTS (checked by the TypeScript type checker when you press Run) =====
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

interface Config {
  name: string;
  server: { host: string; port: number; tls: { enabled: boolean } };
  tags: string[];
  onReady: () => void;
}

type _prim = Expect<Equal<DeepReadonly<string>, string>>;
type _fn = Expect<Equal<DeepReadonly<(x: number) => string>, (x: number) => string>>;
type _arr = Expect<Equal<DeepReadonly<{ id: number }[]>, readonly { readonly id: number }[]>>;
type _deep = Expect<Equal<DeepReadonly<Config>, {
  readonly name: string;
  readonly server: { readonly host: string; readonly port: number; readonly tls: { readonly enabled: boolean } };
  readonly tags: readonly string[];
  readonly onReady: () => void;
}>>;

// These must NOT compile: every level is read-only. This function is never
// called, so the checker reads these lines and the runtime never runs them.
function mutations(cfg: DeepReadonly<Config>) {
  // @ts-expect-error top level
  cfg.name = "other";
  // @ts-expect-error two levels down
  cfg.server.port = 8080;
  // @ts-expect-error three levels down
  cfg.server.tls.enabled = false;
  // @ts-expect-error arrays become readonly arrays, which have no push
  cfg.tags.push("new");
  cfg.onReady(); // functions are left alone, so calling one is fine
}

// ===== RUNTIME TESTS: deepFreeze is the runtime twin of DeepReadonly =====
const test = (name: string, actual: unknown, expected: unknown) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
};

const config: Config = {
  name: "api",
  server: { host: "localhost", port: 3000, tls: { enabled: true } },
  tags: ["a", "b"],
  onReady: () => {},
};
const frozen = deepFreeze(config);
test("returns the same object", frozen === config, true);
test("top level is frozen", Object.isFrozen(config), true);
test("nested object is frozen", Object.isFrozen(config.server), true);
test("deepest object is frozen", Object.isFrozen(config.server.tls), true);
test("arrays are frozen", Object.isFrozen(config.tags), true);
test("primitives pass through", deepFreeze(42), 42);`},{name:"Type-safe groupBy",lang:"ts",difficulty:"Medium",code:`function groupBy(items: any[], key: (item: any) => any): any {
  // YOUR CODE HERE
}

// ===== TYPE TESTS (checked by the TypeScript type checker when you press Run) =====
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

interface User {
  name: string;
  role: "admin" | "editor" | "viewer";
  age: number;
}

const users: User[] = [
  { name: "Ada", role: "admin", age: 36 },
  { name: "Linus", role: "editor", age: 28 },
  { name: "Grace", role: "admin", age: 45 },
  { name: "Tim", role: "viewer", age: 28 },
];

const byRole = groupBy(users, (u) => u.role);
const byParity = groupBy([1, 2, 3, 4, 5], (n) => (n % 2 === 0 ? "even" : "odd"));
const byAge = groupBy(users, (u) => u.age);

type _role = Expect<Equal<typeof byRole, Record<"admin" | "editor" | "viewer", User[]>>>;
type _parity = Expect<Equal<typeof byParity, Record<"even" | "odd", number[]>>>;
type _age = Expect<Equal<typeof byAge, Record<number, User[]>>>;
type _item = Expect<Equal<typeof byRole.admin, User[]>>;

// These must NOT compile. This function is never called, so the checker
// reads these lines and the runtime never runs them.
function misuse() {
  // @ts-expect-error there is no "owner" group: the key type is exactly the role union
  byRole.owner;
  // @ts-expect-error an object cannot be a property key
  groupBy(users, (u) => ({ role: u.role }));
  // @ts-expect-error the callback gets a User, which has no email
  groupBy(users, (u) => u.email);
}

// ===== RUNTIME TESTS =====
const test = (name: string, actual: unknown, expected: unknown) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
};

test("group by role", byRole?.admin?.map((u) => u.name), ["Ada", "Grace"]);
test("every role present", Object.keys(byRole ?? {}).sort(), ["admin", "editor", "viewer"]);
test("keeps input order in each group", byAge?.[28]?.map((u) => u.name), ["Linus", "Tim"]);
test("computed string keys", byParity, { odd: [1, 3, 5], even: [2, 4] });
test("empty input", groupBy([], (x: number) => x), {});
test("a key named __proto__ is just a key", groupBy(["__proto__", "a"], (s) => s)?.["__proto__"], ["__proto__"]);`},{name:"Typed EventEmitter",lang:"ts",difficulty:"Medium",code:`class TypedEmitter<Events> {
  on(event: any, listener: (payload: any) => void): void {
    // YOUR CODE HERE
  }

  off(event: any, listener: (payload: any) => void): void {
    // YOUR CODE HERE
  }

  emit(event: any, payload: any): void {
    // YOUR CODE HERE
  }
}

// ===== TYPE TESTS (checked by the TypeScript type checker when you press Run) =====
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

type AppEvents = {
  login: { user: string };
  logout: { reason: string };
  message: { from: string; text: string };
};

const emitter = new TypedEmitter<AppEvents>();
const log: string[] = [];

// The listener's parameter type comes from the event name.
emitter.on("message", (m) => {
  type _payload = Expect<Equal<typeof m, { from: string; text: string }>>;
  log.push(m.from + ": " + m.text);
});

// These must NOT compile. This function is never called, so the checker
// reads these lines and the runtime never runs them.
function misuse() {
  // @ts-expect-error "logni" is not an event
  emitter.emit("logni", { user: "ada" });
  // @ts-expect-error login's payload needs a user
  emitter.emit("login", { name: "ada" });
  // @ts-expect-error logout's payload is { reason }, not a string
  emitter.emit("logout", "bye");
  // @ts-expect-error a login listener receives { user }, which has no text
  emitter.on("login", (p) => log.push(p.text));
  // @ts-expect-error off must name a real event too
  emitter.off("nope", () => {});
}

// ===== RUNTIME TESTS =====
const test = (name: string, actual: unknown, expected: unknown) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
};

emitter.emit("message", { from: "ada", text: "hi" });
test("listener receives the payload", log, ["ada: hi"]);

const seen: string[] = [];
const onLogin = (p: { user: string }) => seen.push("first " + p.user);
emitter.on("login", onLogin);
emitter.on("login", (p) => seen.push("second " + p.user));
emitter.emit("login", { user: "grace" });
test("every listener runs, in order", seen, ["first grace", "second grace"]);

emitter.off("login", onLogin);
emitter.emit("login", { user: "tim" });
test("off removes only that listener", seen, ["first grace", "second grace", "second tim"]);

let threw = false;
try { emitter.emit("logout", { reason: "idle" }); } catch { threw = true; }
test("emit with no listeners does nothing", threw, false);
test("events do not leak into each other", log, ["ada: hi"]);`},{name:"Paths<T> (dotted keys)",lang:"ts",difficulty:"Hard",code:`type Paths<T> = any; // YOUR CODE HERE

type PathValue<T, P> = any; // YOUR CODE HERE

function get(obj: any, path: string): any {
  // YOUR CODE HERE
}

// ===== TYPE TESTS (checked by the TypeScript type checker when you press Run) =====
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

interface Settings {
  theme: string;
  server: { host: string; port: number; tls: { enabled: boolean } };
  tags: string[];
}

type _flat = Expect<Equal<Paths<{ a: number; b: string }>, "a" | "b">>;
type _nested = Expect<Equal<Paths<{ a: { b: { c: number } } }>, "a" | "a.b" | "a.b.c">>;
type _settings = Expect<Equal<Paths<Settings>,
  "theme" | "server" | "server.host" | "server.port" | "server.tls" | "server.tls.enabled" | "tags">>;
type _value = Expect<Equal<PathValue<Settings, "server.tls">, { enabled: boolean }>>;

const settings: Settings = {
  theme: "dark",
  server: { host: "localhost", port: 8080, tls: { enabled: true } },
  tags: ["a", "b"],
};

// get returns the type AT the path, not unknown.
const port = get(settings, "server.port");
const tls = get(settings, "server.tls.enabled");
type _port = Expect<Equal<typeof port, number>>;
type _tls = Expect<Equal<typeof tls, boolean>>;

// These must NOT compile. This function is never called, so the checker
// reads these lines and the runtime never runs them.
function misuse() {
  // @ts-expect-error no such key under server
  get(settings, "server.nope");
  // @ts-expect-error a path cannot end in a dot
  get(settings, "server.");
  // @ts-expect-error arrays are leaves: the path stops at tags
  get(settings, "tags.length");
  // @ts-expect-error the value at server.port is a number, not a string
  const s: string = get(settings, "server.port");
}

// ===== RUNTIME TESTS =====
const test = (name: string, actual: unknown, expected: unknown) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(pass ? "✅" : "❌", name, pass ? "" : "Expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
};

test("top-level key", get(settings, "theme"), "dark");
test("two levels", port, 8080);
test("three levels", tls, true);
test("path to an object", get(settings, "server.tls"), { enabled: true });
test("path to an array", get(settings, "tags"), ["a", "b"]);`}]},{label:"React Machine Coding",tag:"React",kind:"challenge",templates:[{name:"Responsive Images (srcset / AVIF)",jsx:!0,code:`function ResolutionSwitching() {
  return (
    <figure style={{ margin: 0 }}>
      {/* srcset = candidates; sizes = how WIDE the image will DISPLAY.
          The browser picks using sizes + DPR, and it decides BEFORE CSS is
          applied — which is why sizes must be given, not inferred. */}
      <img
        src="/img/hero-800.jpg"
        srcSet="/img/hero-400.jpg 400w, /img/hero-800.jpg 800w, /img/hero-1600.jpg 1600w"
        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 600px"
        alt="A team collaborating around a whiteboard"
        loading="eager"
        fetchPriority="high"
        width={800}
        height={450}
        style={{ width: '100%', height: 'auto', borderRadius: 8, background: '#222' }}
      />
      <figcaption style={{ fontSize: 12, color: '#888' }}>
        srcset + sizes — resolution switching, same image
      </figcaption>
    </figure>
  );
}

function FormatNegotiation() {
  return (
    <figure style={{ margin: 0 }}>
      {/* Order matters: the browser takes the FIRST source it supports.
          AVIF (smallest) → WebP → jpg fallback in the img. */}
      <picture>
        <source type="image/avif" srcSet="/img/hero-800.avif 800w, /img/hero-1600.avif 1600w" sizes="600px" />
        <source type="image/webp" srcSet="/img/hero-800.webp 800w, /img/hero-1600.webp 1600w" sizes="600px" />
        <img
          src="/img/hero-800.jpg"
          alt="A team collaborating around a whiteboard"
          width={800}
          height={450}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: 'auto', borderRadius: 8, background: '#222' }}
        />
      </picture>
      <figcaption style={{ fontSize: 12, color: '#888' }}>
        picture + type — format negotiation with fallback
      </figcaption>
    </figure>
  );
}

function AspectRatioBox() {
  return (
    <figure style={{ margin: 0 }}>
      {/* aspect-ratio reserves the box before the bytes arrive, so nothing
          below jumps when the image loads. This is the CLS fix. */}
      <div style={{ aspectRatio: '16 / 9', background: '#222', borderRadius: 8, display: 'grid', placeItems: 'center' }}>
        <span style={{ color: '#666', fontSize: 12 }}>space reserved via aspect-ratio</span>
      </div>
      <figcaption style={{ fontSize: 12, color: '#888' }}>
        width/height attrs or aspect-ratio — prevents layout shift
      </figcaption>
    </figure>
  );
}

function App() {
  // Paths above are illustrative — the playground has no image server, so the
  // boxes render as placeholders. The MARKUP is the deliverable.
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 520, display: 'grid', gap: 22 }}>
      <ResolutionSwitching />
      <FormatNegotiation />
      <AspectRatioBox />
      <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
        <strong>For the LCP image specifically:</strong> loading="eager",
        fetchpriority="high", and NO lazy attribute. Lazy-loading your hero
        delays the very metric you are measured on.
      </div>
    </div>
  );
}

render(<App />);

// ===== WHAT'S BEING GRADED =====
// 1. srcset vs sizes — the one people get wrong. srcset lists CANDIDATES with
//    their intrinsic widths (400w); sizes tells the browser how wide the image
//    will actually DISPLAY. Omit sizes and the browser assumes 100vw and
//    downloads something far too large. It chooses before CSS applies, so it
//    cannot infer the layout.
// 2. srcset+sizes = resolution switching (same image). <picture>+type =
//    format or art-direction switching. Different jobs; know which you need.
// 3. width + height attributes (or aspect-ratio) to reserve space. Without
//    them the image is 0px tall until it loads and everything below jumps —
//    that is CLS.
// 4. NEVER lazy-load the LCP image. loading="lazy" on the hero directly
//    regresses LCP; use loading="eager" + fetchpriority="high", and preload it
//    if it is discovered late (a CSS background or JS-inserted <img> is
//    invisible to the preload scanner).
// 5. decoding="async" keeps decode off the main thread.
// 6. AVIF ~50% smaller than JPEG, WebP ~30%, both with wide support in 2026 —
//    but always keep a fallback in the <img>.
// 7. alt text describes the image's PURPOSE. Decorative images take alt=""
//    so screen readers skip them — not a missing alt attribute.`},{name:"Protected Route (Auth + RBAC)",jsx:!0,code:`const AuthContext = React.createContext(null);

// Fake session restore — in a real app this validates a token with the server.
function restoreSession() {
  return new Promise(resolve => setTimeout(() => resolve(null), 700));
}

function AuthProvider({ children }) {
  // 'loading' is a THIRD state, distinct from logged-in and logged-out.
  const [status, setStatus] = React.useState('loading');
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    restoreSession().then(session => {
      if (cancelled) return;
      setUser(session);
      setStatus(session ? 'authenticated' : 'anonymous');
    });
    return () => { cancelled = true; };
  }, []);

  const login = (role) => { setUser({ name: 'Ana', role }); setStatus('authenticated'); };
  const logout = () => { setUser(null); setStatus('anonymous'); };

  const value = React.useMemo(() => ({ status, user, login, logout }), [status, user]);
  return <AuthContext value={value}>{children}</AuthContext>;
}

const useAuth = () => React.useContext(AuthContext);

// ---------- redirecting is a SIDE EFFECT ----------
// Calling the parent's setState from inside Protected's render is what produces
// "Cannot update a component (App) while rendering a different component
// (Protected)". React is part-way through rendering one component; scheduling
// an update to another one is not something it can honour there.
//
// The fix is to RENDER the redirect rather than perform it. This is exactly why
// react-router gives you <Navigate to="/login" replace /> as a COMPONENT
// instead of a navigate() you call inline — it runs in an effect, after commit.
function Redirect({ to, onRedirect }) {
  const fired = React.useRef(false);
  React.useEffect(() => {
    // Fire once. onRedirect is re-created on every parent render, so without
    // the guard a redirect that does not unmount this component immediately
    // would re-fire on every render — an infinite loop. It also makes the
    // effect idempotent under StrictMode's double-invoke in development.
    if (fired.current) return;
    fired.current = true;
    onRedirect(to);
  }, [to, onRedirect]);

  return <p style={{ color: '#888' }}>Redirecting…</p>;
}

// ---------- the gate ----------
function Protected({ requireRole, onRedirect, children }) {
  const { status, user } = useAuth();

  // 1. Session unknown — render nothing decisive. Redirecting here logs out
  //    every user on every refresh, which is the bug this state prevents.
  if (status === 'loading') return <p style={{ color: '#888' }}>Checking session…</p>;

  // 2. Not authenticated → send to login, remembering the destination.
  //    Rendered, not called: see the note on Redirect above.
  if (status === 'anonymous') return <Redirect to="login" onRedirect={onRedirect} />;

  // 3. Authenticated but not authorized → 403, NOT a redirect to login.
  //    Bouncing an authorized-but-insufficient user to login is confusing and
  //    is a common mistake.
  if (requireRole && user.role !== requireRole) {
    return (
      <div style={{ color: '#f87171' }}>
        <strong>403 — Forbidden.</strong>
        <p style={{ fontSize: 13, color: '#aaa' }}>
          Signed in as {user.name} ({user.role}); this page needs "{requireRole}".
        </p>
      </div>
    );
  }
  return children;
}

function App() {
  const [page, setPage] = React.useState('home');
  const [intended, setIntended] = React.useState(null);
  const { status, user, login, logout } = useAuth();

  const go = (p) => setPage(p);
  const redirectToLogin = (target) => { setIntended(page); setPage(target); };

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 480 }}>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => go('home')}>Home</button>
        <button onClick={() => go('dashboard')}>Dashboard (auth)</button>
        <button onClick={() => go('admin')}>Admin (role)</button>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>
          {status === 'loading' ? '…' : user ? user.name + ' (' + user.role + ')' : 'signed out'}
        </span>
        {user && <button onClick={logout}>Sign out</button>}
      </nav>

      <div style={{ padding: 12, border: '1px solid #333', borderRadius: 8, minHeight: 90 }}>
        {page === 'home' && <p style={{ margin: 0 }}>Public home page.</p>}

        {page === 'login' && (
          <div>
            <p style={{ marginTop: 0 }}>Sign in to continue{intended ? ' to ' + intended : ''}.</p>
            <button onClick={() => { login('user'); setPage(intended || 'home'); }}>as user</button>{' '}
            <button onClick={() => { login('admin'); setPage(intended || 'home'); }}>as admin</button>
          </div>
        )}

        {page === 'dashboard' && (
          <Protected onRedirect={redirectToLogin}>
            <p style={{ margin: 0 }}>Dashboard — any signed-in user.</p>
          </Protected>
        )}

        {page === 'admin' && (
          <Protected requireRole="admin" onRedirect={redirectToLogin}>
            <p style={{ margin: 0 }}>Admin panel — admins only.</p>
          </Protected>
        )}
      </div>
    </div>
  );
}

function Root() { return <AuthProvider><App /></AuthProvider>; }
render(<Root />);

// ===== WHAT'S BEING GRADED =====
// 1. THE LOADING STATE. Treating "not yet known" as "logged out" redirects
//    every user to login on refresh. This is the single most common bug here.
// 2. 401 vs 403: unauthenticated → login; authenticated-but-wrong-role → a
//    forbidden page. Don't send an authorized user back to login.
// 3. Remember the intended destination and return there after login.
// 4. THE SECURITY POINT, and say it unprompted: this is UX only. Anyone can
//    edit client state, so every protected route must be backed by
//    server-side authorization on the API. A hidden button is not a
//    permission — see the Web Security and OAuth guides.
// 5. Don't put the role check in fifty components; one declarative gate.
// 6. A redirect is a side effect. Calling the parent's setState during render
//    warns "Cannot update a component while rendering a different component",
//    and it is why react-router's answer is <Navigate /> — a component that
//    navigates in an effect — rather than a function you call inline.`},{name:"Mini Redux Store",jsx:!0,code:`// ---------- 1. the store — ~20 lines, no dependencies ----------
function createStore(reducer, initialState, middleware) {
  let state = reducer(initialState, { type: '@@INIT' });
  const listeners = new Set();

  const baseDispatch = (action) => {
    state = reducer(state, action);          // pure: (state, action) -> newState
    listeners.forEach(l => l());             // notify, don't pass state
    return action;
  };

  const store = {
    getState: () => state,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    dispatch: baseDispatch,
  };

  // Middleware wraps dispatch — that is the whole extension mechanism.
  if (middleware) store.dispatch = middleware(store)(baseDispatch);
  return store;
}

const logger = (store) => (next) => (action) => {
  console.log('dispatch', action.type, '->', JSON.stringify(reducer(store.getState(), action)));
  return next(action);
};

// ---------- 2. reducer ----------
const initial = { count: 0, todos: [], filter: 'all' };

function reducer(state = initial, action) {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + 1 };
    case 'addTodo':   return { ...state, todos: [...state.todos, action.payload] };
    case 'setFilter': return { ...state, filter: action.payload };
    default:          return state;
  }
}

const store = createStore(reducer, initial, logger);

// ---------- 3. React binding ----------
const StoreContext = React.createContext(null);

// useSyncExternalStore is the correct primitive: it subscribes, reads a
// snapshot, and — crucially — avoids TEARING under concurrent rendering,
// where two components could otherwise read different versions of the state.
function useSelector(selector) {
  const s = React.useContext(StoreContext);
  return React.useSyncExternalStore(
    s.subscribe,
    () => selector(s.getState()),
    () => selector(s.getState())
  );
}

function useDispatch() {
  return React.useContext(StoreContext).dispatch;
}

// ---------- 4. components — each re-renders only for its own slice ----------
let counterRenders = 0, todoRenders = 0;

function Counter() {
  const count = useSelector(s => s.count);
  const dispatch = useDispatch();
  counterRenders++;
  return (
    <p style={{ margin: '0 0 8px' }}>
      count: <strong>{count}</strong>{' '}
      <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
      <span style={{ color: '#888', fontSize: 12 }}>  renders: {counterRenders}</span>
    </p>
  );
}

function TodoCount() {
  const n = useSelector(s => s.todos.length);
  const dispatch = useDispatch();
  todoRenders++;
  return (
    <p style={{ margin: '0 0 8px' }}>
      todos: <strong>{n}</strong>{' '}
      <button onClick={() => dispatch({ type: 'addTodo', payload: 'item ' + (n + 1) })}>add</button>
      <span style={{ color: '#888', fontSize: 12 }}>  renders: {todoRenders}</span>
    </p>
  );
}

function App() {
  return (
    <StoreContext value={store}>
      <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 460 }}>
        <Counter />
        <TodoCount />
        <p style={{ fontSize: 12, color: '#888', marginTop: 10 }}>
          Click +1 and watch: only Counter's render count moves. That selector
          isolation is what Context alone does NOT give you.
        </p>
      </div>
    </StoreContext>
  );
}

render(<App />);

// ===== WHAT'S BEING GRADED =====
// 1. The three-method contract: getState, dispatch, subscribe. The reducer is
//    PURE — same input, same output, no side effects, no mutation.
// 2. useSyncExternalStore, not useState + useEffect. It is the purpose-built
//    primitive and it prevents TEARING under concurrent rendering.
// 3. SELECTOR ISOLATION is the real answer to "why not just Context?".
//    A Context value change re-renders EVERY consumer; a selector re-renders
//    only components whose slice actually changed. That is why Redux/Zustand
//    exist alongside Context.
// 4. Middleware is dispatch wrapping: store => next => action. That signature
//    is how thunk, saga and the devtools all hook in.
// 5. Selectors returning a NEW object each call (s => ({...})) defeat the
//    equality check and re-render every time — hence reselect / useShallow.
// 6. When asked what you would actually use: Redux Toolkit for large shared
//    client state, Zustand for something lighter, and TanStack Query for
//    SERVER state — which is most of what people wrongly put in Redux.`},{name:"Client Cache (stale-while-revalidate)",jsx:!0,code:`// ---------- a tiny cache with request de-duplication ----------
// Named queryCache, not cache: React exports a function called cache, and the
// playground puts every React export in scope, so a const cache would not compile.
const queryCache = new Map();     // key -> { data, updatedAt }
const inflight = new Map();  // key -> Promise   (de-dupe)

const STALE_MS = 5000;

function fetchUser(id) {
  // stand-in for the network
  return new Promise(resolve =>
    setTimeout(() => resolve({ id, name: 'User ' + id, fetchedAt: new Date().toLocaleTimeString() }), 800)
  );
}

function getOrFetch(key, fetcher) {
  // Two callers mounting at once must share ONE request, not fire two.
  if (inflight.has(key)) return inflight.get(key);
  const p = fetcher()
    .then(data => { queryCache.set(key, { data, updatedAt: Date.now() }); return data; })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

function useCachedUser(id) {
  const key = 'user:' + id;
  const entry = queryCache.get(key);

  // Initialise FROM CACHE, so a revisit renders data on the first frame.
  const [data, setData] = React.useState(entry ? entry.data : null);
  const [isRevalidating, setRevalidating] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    const cached = queryCache.get(key);
    setData(cached ? cached.data : null);
    setError(null);

    const isStale = !cached || Date.now() - cached.updatedAt > STALE_MS;
    if (!isStale) return;                    // fresh enough — no request at all

    setRevalidating(true);
    getOrFetch(key, () => fetchUser(id))
      .then(fresh => { if (!cancelled) setData(fresh); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setRevalidating(false); });

    return () => { cancelled = true; };
  }, [key, id]);

  return { data, isRevalidating, error, isCachedHit: Boolean(entry) };
}

function UserPanel({ id }) {
  const { data, isRevalidating, error } = useCachedUser(id);
  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!data) return <p style={{ color: '#888' }}>Loading user {id}…</p>;
  return (
    <p style={{ margin: 0 }}>
      <strong>{data.name}</strong>
      <span style={{ color: '#888', fontSize: 12 }}> · fetched {data.fetchedAt}</span>
      {isRevalidating && <span style={{ color: '#fbbf24', fontSize: 12 }}>  refreshing…</span>}
    </p>
  );
}

function App() {
  const [id, setId] = React.useState(1);
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 480 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[1, 2, 3].map(n => (
          <button key={n} onClick={() => setId(n)}
                  style={{ fontWeight: id === n ? 700 : 400 }}>User {n}</button>
        ))}
      </div>
      <UserPanel id={id} />
      {/* Mounted twice on purpose: proves the two share ONE request */}
      <div style={{ marginTop: 12, opacity: 0.7 }}><UserPanel id={id} /></div>
      <p style={{ fontSize: 12, color: '#888', marginTop: 14 }}>
        Switch users, then switch back within 5s — instant, no request.
        After 5s the entry is stale: cached data shows immediately and refreshes behind it.
      </p>
    </div>
  );
}

render(<App />);

// ===== WHAT'S BEING GRADED =====
// 1. STALE-WHILE-REVALIDATE: render the cached value immediately AND refetch.
//    Showing a spinner over data you already have is the thing to avoid.
// 2. REQUEST DE-DUPLICATION via the inflight map — two components mounting
//    with the same key must share one request. Forgetting this is why naive
//    hooks fire N requests for N consumers.
// 3. Initialise state FROM the cache, not to null, or you flash a loader on
//    every revisit even though the data was already there.
// 4. Cancellation, so a fast second switch cannot be overwritten by a slow
//    first response landing late (the out-of-order race).
// 5. Know what you are NOT building: TanStack Query adds retries, window-focus
//    revalidation, garbage collection, pagination helpers and devtools. Say
//    that rather than claiming a 40-line hook replaces it.`},{name:"WebSocket Live Feed",jsx:!0,code:`// ---------- stand-in with the real WebSocket surface ----------
class FakeSocket {
  constructor() {
    this.readyState = 0;                       // CONNECTING
    this.onopen = this.onmessage = this.onclose = this.onerror = null;
    this._timer = null;
    setTimeout(() => {
      this.readyState = 1;                     // OPEN
      this.onopen && this.onopen();
      let n = 0;
      this._timer = setInterval(() => {
        if (this.readyState !== 1) return;
        n++;
        this.onmessage && this.onmessage({
          data: JSON.stringify({ id: n, price: (100 + Math.random() * 10).toFixed(2), at: new Date().toLocaleTimeString() }),
        });
        if (n === 6) this._drop();             // simulate a drop, to prove reconnect
      }, 900);
    }, 600);
  }
  _drop() {
    clearInterval(this._timer);
    this.readyState = 3;                       // CLOSED
    this.onclose && this.onclose({ code: 1006, wasClean: false });
  }
  close() { clearInterval(this._timer); this.readyState = 3; }
}

const MAX_MESSAGES = 8;

function useLiveFeed() {
  const [status, setStatus] = React.useState('connecting');
  const [messages, setMessages] = React.useState([]);
  const socketRef = React.useRef(null);
  const attemptRef = React.useRef(0);
  const retryRef = React.useRef(null);
  const closedByUs = React.useRef(false);

  React.useEffect(() => {
    closedByUs.current = false;

    const connect = () => {
      setStatus(attemptRef.current === 0 ? 'connecting' : 'reconnecting');
      // Real code: const socket = new WebSocket('wss://example.com/feed');
      const socket = new FakeSocket();
      socketRef.current = socket;

      socket.onopen = () => {
        attemptRef.current = 0;                // reset backoff on success
        setStatus('open');
      };

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        // Bounded buffer — an unbounded array is a slow memory leak.
        setMessages(prev => [msg, ...prev].slice(0, MAX_MESSAGES));
      };

      socket.onclose = () => {
        if (closedByUs.current) return;        // unmount, not a failure
        setStatus('closed');
        const attempt = ++attemptRef.current;
        // Exponential backoff with FULL JITTER, capped — without jitter every
        // client reconnects in lockstep and stampedes the server.
        const delay = Math.random() * Math.min(30000, 500 * 2 ** (attempt - 1));
        retryRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      closedByUs.current = true;               // suppress the reconnect
      clearTimeout(retryRef.current);
      socketRef.current && socketRef.current.close();
    };
  }, []);

  return { status, messages };
}

const COLOURS = { open: '#34d399', connecting: '#fbbf24', reconnecting: '#fbbf24', closed: '#f87171' };

function App() {
  const { status, messages } = useLiveFeed();
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 420 }}>
      <p style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: COLOURS[status] }} />
        <span aria-live="polite" style={{ fontSize: 13 }}>{status}</span>
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
        {messages.map(m => (
          <li key={m.id} style={{ padding: '4px 0', borderBottom: '1px solid #333', fontSize: 13 }}>
            #{m.id} — {m.price} <span style={{ color: '#888' }}>{m.at}</span>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 12, color: '#888', marginTop: 12 }}>
        The feed drops after 6 messages on purpose — watch it reconnect.
      </p>
    </div>
  );
}

render(<App />);

// ===== WHAT'S BEING GRADED =====
// 1. CLEANUP on unmount, and a flag so your own close() doesn't trigger the
//    reconnect path. Without it you leak a socket per mount and reconnect
//    forever after navigating away — the classic version of this bug.
// 2. RECONNECT with exponential backoff and FULL JITTER, capped. No jitter
//    means every client retries in lockstep and DDoSes your own server.
// 3. Reset the attempt counter on a successful open, or backoff grows forever.
// 4. A BOUNDED buffer. Real feeds run for hours; an unbounded array is a leak.
// 5. Visible connection status with aria-live, so the state is not colour-only.
// 6. Beyond this: heartbeats to detect a half-open connection (TCP can stay
//    "open" with nothing flowing), message sequence numbers to detect gaps and
//    replay after a reconnect, and batching high-frequency updates into rAF so
//    1000 messages/sec doesn't cause 1000 renders.`},{name:"Optimistic UI Updates",jsx:!0,code:`// Two implementations below: React 19's useOptimistic, and the manual
// rollback you would write in React 18. Know both — interviewers ask why
// useOptimistic exists.

// Fake server: rejects anything containing "fail" so you can test the sad path.
function saveTodo(text) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (text.toLowerCase().includes('fail')) reject(new Error('Server rejected: ' + text));
      else resolve({ id: Date.now(), text });
    }, 900);
  });
}

// ---------- Approach 1: useOptimistic (React 19) ----------
function OptimisticTodos() {
  const [todos, setTodos] = React.useState([{ id: 1, text: 'Real todo from server' }]);
  const [error, setError] = React.useState(null);

  // optimisticTodos = todos + whatever is in flight. React discards the
  // optimistic entry automatically when the transition settles, so there is
  // no rollback code to write — that is the whole point of the hook.
  const [optimisticTodos, addOptimistic] = React.useOptimistic(
    todos,
    (current, pendingText) => [...current, { id: 'pending', text: pendingText, pending: true }]
  );

  // A form ACTION receives the FormData, not an event: there is nothing to
  // preventDefault, and React 19 resets the uncontrolled form itself once the
  // action finishes.
  async function onSubmit(formData) {
    const text = formData.get('text');
    if (!text) return;
    setError(null);

    // MUST be inside a transition/action, or React warns and discards it.
    addOptimistic(text);
    try {
      const saved = await saveTodo(text);
      setTodos(prev => [...prev, saved]);
    } catch (err) {
      setError(err.message);   // optimistic entry vanishes on its own
    }
  }

  return (
    <section style={{ marginBottom: 28 }}>
      <h4 style={{ margin: '0 0 8px' }}>useOptimistic (React 19)</h4>
      <form action={onSubmit} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input name="text" placeholder='try "fail" to see rollback'
               style={{ flex: 1, padding: 6 }} />
        <button type="submit">Add</button>
      </form>
      {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {optimisticTodos.map(t => (
          <li key={t.id} style={{ opacity: t.pending ? 0.45 : 1 }}>
            {t.text}{t.pending ? '  (saving…)' : ''}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Approach 2: manual rollback (works on any version) ----------
function ManualOptimisticTodos() {
  const [todos, setTodos] = React.useState([{ id: 1, text: 'Real todo from server' }]);
  const [error, setError] = React.useState(null);

  async function add(text) {
    const tempId = 'temp-' + Date.now();
    const snapshot = todos;                                  // keep for rollback
    setTodos(prev => [...prev, { id: tempId, text, pending: true }]);
    setError(null);
    try {
      const saved = await saveTodo(text);
      // Replace the temp entry rather than appending, or you get a duplicate.
      setTodos(prev => prev.map(t => (t.id === tempId ? saved : t)));
    } catch (err) {
      setTodos(snapshot);                                    // ROLL BACK
      setError(err.message);
    }
  }

  return (
    <section>
      <h4 style={{ margin: '0 0 8px' }}>Manual rollback (React 18 style)</h4>
      <form
        onSubmit={e => { e.preventDefault(); const v = e.target.elements.text.value; e.target.reset(); if (v) add(v); }}
        style={{ display: 'flex', gap: 8, marginBottom: 10 }}
      >
        <input name="text" placeholder='try "fail"' style={{ flex: 1, padding: 6 }} />
        <button type="submit">Add</button>
      </form>
      {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {todos.map(t => (
          <li key={t.id} style={{ opacity: t.pending ? 0.45 : 1 }}>
            {t.text}{t.pending ? '  (saving…)' : ''}
          </li>
        ))}
      </ul>
    </section>
  );
}

function App() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 460 }}>
      <OptimisticTodos />
      <ManualOptimisticTodos />
    </div>
  );
}

render(<App />);

// ===== WHAT'S BEING GRADED =====
// 1. THE ROLLBACK. Anyone can render early; the question is what happens on
//    failure. Snapshot before mutating, restore on catch.
// 2. Replace the temp item by id — appending the server response leaves a
//    duplicate, which is the most common bug in the manual version.
// 3. A visible pending state, so the UI is honest about what isn't saved.
// 4. useOptimistic must be called inside a transition or form action; outside
//    one React warns and drops the update.
// 5. Don't be optimistic about everything. It suits high-success, low-stakes
//    actions (likes, todos, reordering). For a payment, show real pending
//    state — a rolled-back charge is far worse than a spinner.`},{name:"Suspense + Lazy (Code Splitting)",jsx:!0,code:`// In a real app the lazy factory is a dynamic import:
//     const Heavy = React.lazy(() => import('./HeavyChart'));
// which is what makes the bundler emit a separate chunk. The playground has
// no module system, so we resolve a component directly — the API and the
// Suspense behaviour are identical.

// ---------- 1. Lazy component ----------
function HeavyPanel() {
  return (
    <div style={{ padding: 12, border: '1px solid #444', borderRadius: 8 }}>
      <strong>Heavy panel loaded.</strong>
      <p style={{ fontSize: 13, color: '#aaa', margin: '6px 0 0' }}>
        In a real app this component and its dependencies live in their own chunk.
      </p>
    </div>
  );
}

// Stand-in for () => import('./HeavyPanel') — same shape: a promise of { default }
const LazyPanel = React.lazy(() =>
  new Promise(resolve => setTimeout(() => resolve({ default: HeavyPanel }), 1200))
);

// ---------- 2. Error boundary — Suspense does NOT catch load failures ----------
class LoadErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color: '#f87171' }}>
          Failed to load. <button onClick={() => this.setState({ error: null })}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------- 3. Suspense for DATA (the throw-a-promise pattern) ----------
function createResource(promise) {
  let status = 'pending', result;
  const suspender = promise.then(
    v => { status = 'success'; result = v; },
    e => { status = 'error'; result = e; }
  );
  return {
    read() {
      if (status === 'pending') throw suspender;   // Suspense catches this
      if (status === 'error') throw result;        // the error boundary catches this
      return result;
    },
  };
}

const userResource = createResource(
  new Promise(resolve => setTimeout(() => resolve({ name: 'Ana', role: 'Engineer' }), 1800))
);

function UserCard() {
  const user = userResource.read();
  return <p style={{ margin: 0 }}>{user.name} — {user.role}</p>;
}

function App() {
  const [show, setShow] = React.useState(false);
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 460, display: 'grid', gap: 20 }}>
      <section>
        <h4 style={{ margin: '0 0 8px' }}>Lazy component</h4>
        <button onClick={() => setShow(true)} disabled={show}>Load panel</button>
        <div style={{ marginTop: 10 }}>
          {show && (
            <LoadErrorBoundary>
              <React.Suspense fallback={<p style={{ color: '#888' }}>Loading panel…</p>}>
                <LazyPanel />
              </React.Suspense>
            </LoadErrorBoundary>
          )}
        </div>
      </section>

      <section>
        <h4 style={{ margin: '0 0 8px' }}>Suspense for data</h4>
        <LoadErrorBoundary>
          <React.Suspense fallback={<p style={{ color: '#888' }}>Loading user…</p>}>
            <UserCard />
          </React.Suspense>
        </LoadErrorBoundary>
      </section>
    </div>
  );
}

render(<App />);

// ===== WHAT'S BEING GRADED =====
// 1. Suspense handles the PENDING state only. A failed chunk load throws, so
//    you need an error boundary — and a retry, because a chunk can fail from
//    a network blip or a deploy that removed the old file (ChunkLoadError).
// 2. React.lazy needs a module with a DEFAULT export. A named export means
//    () => import('./x').then(m => ({ default: m.Named })).
// 3. Split at ROUTE boundaries first — that is where the payoff is. Splitting
//    a small component adds a request for almost no saving.
// 4. Don't put the Suspense boundary so high that the whole page blanks; place
//    it around the part that is actually loading.
// 5. useTransition avoids showing the fallback at all when you would rather
//    keep the old UI visible during an update.`},{name:"Display Data from a JSON Prop",jsx:!0,code:`// WHAT INTERVIEWERS ACTUALLY CHECK
//   - a stable \`key\` that is NOT the array index
//   - destructuring props rather than \`props.data.members\`
//   - defensive access: the shape may not be what you assume
//   - the empty state, which most candidates forget

// ---- the "JSON file" you were given ----
const data = {
  team: 'Platform',
  members: [
    { id: 'u1', name: 'Ana Silva',    role: 'Engineer',      location: 'Lisbon' },
    { id: 'u2', name: 'Brij Patel',   role: 'Senior Engineer', location: 'Pune' },
    { id: 'u3', name: 'Chen Wei',     role: 'Tech Lead',     location: 'Singapore' },
  ],
};

function TeamDirectory({ data }) {
  // Optional chaining + a default: the prop may be missing or malformed.
  const members = data?.members ?? [];

  if (members.length === 0) {
    return <p style={{ color: '#888' }}>No team members to show.</p>;
  }

  return (
    <section>
      <h3 style={{ margin: '0 0 4px' }}>{data.team} team</h3>
      <p style={{ margin: '0 0 12px', color: '#888', fontSize: 13 }}>
        {members.length} {members.length === 1 ? 'member' : 'members'}
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {members.map(({ id, name, role, location }) => (
          // key = a stable id from the data, never the array index
          <li key={id} style={{ padding: '8px 0', borderBottom: '1px solid #333' }}>
            <strong>{name}</strong>
            <div style={{ fontSize: 13, color: '#aaa' }}>{role} · {location}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function App() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <TeamDirectory data={data} />

      {/* the empty case — prove you handled it */}
      <hr style={{ margin: '20px 0', borderColor: '#333' }} />
      <TeamDirectory data={{ team: 'Design', members: [] }} />
    </div>
  );
}

render(<App />);

// ===== FOLLOW-UPS THEY USUALLY ASK =====
// Q: Why not use the array index as a key?
//    On reorder/insert/delete React reuses the wrong DOM node and component
//    state sticks to the wrong row (a typed input value follows the index).
//
// Q: What if the JSON is nested deeper?
//    Optional chaining all the way down, or normalise it once at the boundary
//    rather than scattering \`?.\` through the JSX.
//
// Q: Where would this data normally come from?
//    A fetch — see the "JSON -> API -> React fetch" template for that version.`},{name:"JSON → API → React fetch",jsx:!0,code:`// ---------------------------------------------------------------------------
// BACKEND (reference — this is the code you'd write in the interview)
// ---------------------------------------------------------------------------
// import express from 'express';
// import cors from 'cors';
// import { readFile } from 'node:fs/promises';
//
// const app = express();
// app.use(cors({ origin: 'http://localhost:5173' }));
//
// // Read ONCE at startup, not per request. Fail fast if it's broken.
// const jobs = JSON.parse(await readFile('./data/jobs.json', 'utf-8'));
//
// app.get('/api/jobs', (req, res) => res.json(jobs));   // res.json sets the header
// app.get('/api/jobs/:id', (req, res) => {
//   const job = jobs.find(j => String(j.id) === req.params.id);
//   if (!job) return res.status(404).json({ error: 'not found' });
//   res.json(job);
// });
//
// app.listen(3000);
// ---------------------------------------------------------------------------

// ---- stub standing in for the network (same shape as the endpoint above) ----
const FAKE_JOBS = [
  { id: 1, title: 'Frontend Engineer', company: 'Acme',   location: 'Remote' },
  { id: 2, title: 'Backend Engineer',  company: 'Globex', location: 'Berlin' },
  { id: 3, title: 'Platform Engineer', company: 'Initech', location: 'London' },
];

function fakeFetch(url, { signal } = {}) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      resolve({ ok: true, status: 200, json: () => Promise.resolve(FAKE_JOBS) });
    }, 700);
    // Honour cancellation, exactly as a real fetch does.
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
    });
  });
}

function useJobs() {
  const [state, setState] = React.useState({ status: 'loading', data: null, error: null });

  React.useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fakeFetch('/api/jobs', { signal: controller.signal });
        // fetch does NOT reject on 4xx/5xx — you must check ok yourself.
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        setState({ status: 'success', data: await res.json(), error: null });
      } catch (err) {
        // An abort is not a failure — it's us cancelling. Don't show an error.
        if (err.name === 'AbortError') return;
        setState({ status: 'error', data: null, error: err.message });
      }
    })();

    return () => controller.abort();   // cancel on unmount / dependency change
  }, []);

  return state;
}

function JobList() {
  const { status, data, error } = useJobs();

  if (status === 'loading') return <p style={{ color: '#888' }}>Loading jobs…</p>;
  if (status === 'error')   return <p style={{ color: '#f87171' }}>Failed: {error}</p>;
  if (!data.length)         return <p style={{ color: '#888' }}>No jobs found.</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {data.map(job => (
        <li key={job.id} style={{ padding: '8px 0', borderBottom: '1px solid #333' }}>
          <strong>{job.title}</strong>
          <div style={{ fontSize: 13, color: '#aaa' }}>{job.company} · {job.location}</div>
        </li>
      ))}
    </ul>
  );
}

function App() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h3 style={{ margin: '0 0 12px' }}>Jobs</h3>
      <JobList />
    </div>
  );
}

render(<App />);

// ===== WHAT'S BEING GRADED =====
// 1. THREE states, not one: loading / error / empty / success. Most candidates
//    render only the success path.
// 2. A single \`status\` field beats three booleans — isLoading + isError can
//    represent impossible combinations.
// 3. \`if (!res.ok) throw\` — fetch only rejects on network failure, so a 500
//    resolves happily and you'd render garbage.
// 4. AbortController cleanup, and treating AbortError as NOT an error. Without
//    it you get a state update after unmount and a race where a slow first
//    response overwrites a fast second one.
// 5. In production this belongs in TanStack Query, which gives you caching,
//    retries, dedup and stale-while-revalidate for free — say so.`},{name:"Fetch Users from an API",jsx:!0,code:`const API = 'https://jsonplaceholder.typicode.com/users';

function Users() {
  // ONE status field, not three booleans. isLoading + isError can represent
  // combinations that cannot happen; this cannot.
  const [status, setStatus] = useState('loading');   // loading | error | done
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);         // bump to refetch

  useEffect(() => {
    const ac = new AbortController();
    setStatus('loading');
    setError(null);

    fetch(API, { signal: ac.signal })
      .then(res => {
        // fetch does NOT reject on 404 or 500 — only a network failure rejects.
        // Without this check a 500 resolves happily and you parse an error page.
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();          // parsing is a SECOND async step
      })
      .then(data => {
        setUsers(data);
        setStatus('done');
      })
      .catch(err => {
        // Our own cleanup aborting the request is not a failure. Without this
        // guard, navigating away mid-request flashes an error message.
        if (err.name === 'AbortError') return;
        setError(err.message);
        setStatus('error');
      });

    // Cancels an in-flight request on unmount or before a retry. This removes
    // the state-update-after-unmount warning AND the race where a slow first
    // response lands after a fast second one and overwrites it.
    return () => ac.abort();
  }, [attempt]);

  const box = { border: '1px solid #333', borderRadius: 8, padding: 14, maxWidth: 460 };

  if (status === 'loading') {
    return <div style={box}><p>Loading users…</p></div>;
  }

  if (status === 'error') {
    return (
      <div style={box}>
        <p style={{ color: '#f87171', margin: 0 }}>Could not load users — {error}</p>
        <button onClick={() => setAttempt(n => n + 1)} style={{ marginTop: 10 }}>
          Try again
        </button>
      </div>
    );
  }

  // Empty is a THIRD outcome, distinct from loading and from failure.
  // An empty list with no message looks identical to a broken component.
  if (users.length === 0) {
    return <div style={box}><p>No users found.</p></div>;
  }

  return (
    <div style={box}>
      <p style={{ marginTop: 0 }}>
        <strong>{users.length}</strong> users
      </p>
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {/* key comes from the DATA (u.id), never the array index */}
        {users.map(u => (
          <li key={u.id} style={{ marginBottom: 10 }}>
            <strong>{u.name}</strong>{' '}
            <span style={{ color: '#888', fontSize: 12 }}>@{u.username}</span>
            <div style={{ color: '#9aa4b2', fontSize: 12 }}>{u.email}</div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>{u.company.name}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <Users />
    </div>
  );
}

render(<App />);

// ===== WHAT'S BEING GRADED =====
// 1. FOUR states, not one: loading / error / empty / success. Rendering only
//    the success path is the most common omission in this exercise, and it is
//    what an interviewer checks by throttling the network in devtools.
// 2. \`if (!res.ok) throw\`. fetch rejects only on a network failure, so a 404
//    or a 500 resolves with ok === false. Not knowing this is the single most
//    common misconception about the API, and the symptom is a confusing error
//    about an unexpected token "<" when you try to parse the error page.
// 3. ONE status field rather than isLoading + isError. Separate booleans can
//    be true at the same time, which is how a spinner and an error message end
//    up on screen together.
// 4. AbortController in the effect cleanup, with AbortError excluded from the
//    error path. It fixes the update-after-unmount warning and the out-of-order
//    race at once — and aborting without the guard is worse than neither,
//    because every navigation then flashes a failure.
// 5. A stable key from the data. \`u.id\` is right there in the response;
//    falling back to the index breaks as soon as the list is sorted or
//    filtered.
// 6. A retry path. A failed request the user cannot retry means a reload is
//    the only way out.
// 7. What you would do in production: this belongs behind TanStack Query,
//    which adds caching, de-duplication, retries with backoff and
//    stale-while-revalidate — the things a hand-rolled hook gets wrong as it
//    accumulates requirements.`},{name:"Pagination",jsx:!0,code:`// Simulated API
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
            aria-label={"Page " + n} aria-current={n === page ? "page" : undefined}
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

render(<Pagination />);`},{name:"Search Filter",jsx:!0,code:`// BOTH versions are below, side by side, with counters. Type in each and watch
// the numbers — then read WHAT'S BEING GRADED, because for a local array the
// debounced one is measurably WORSE, and saying so is the stronger answer.

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

// Shared predicate, so the two versions differ only in WHEN they run it.
function filterProducts(query) {
  const q = query.toLowerCase().trim();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
}

// ---------------------------------------------------------------------------
// OPTION 1 — instant. Derive during render. No timer, no extra state.
// ---------------------------------------------------------------------------
function SearchFilter() {
  const [query, setQuery] = useState("");
  const [keystrokes, setKeystrokes] = useState(0);
  const runs = useRef(0);                    // instrumentation only

  const filtered = useMemo(() => {
    runs.current += 1;
    return filterProducts(query);
  }, [query]);

  return (
    <Panel
      title="1 · Instant"
      subtitle="filters on every keystroke"
      query={query}
      onChange={(v) => { setQuery(v); setKeystrokes(n => n + 1); }}
      keystrokes={keystrokes}
      runs={runs.current}
      filtered={filtered}
      stale={false}
    />
  );
}

// ---------------------------------------------------------------------------
// OPTION 2 — debounced. The VALUE lags; the input never does.
// ---------------------------------------------------------------------------
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    // THIS cleanup is the debounce: each new keystroke cancels the pending
    // timer, so the value only settles after \`delay\` of quiet.
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

function SearchFilterDebounced({ delay = 400 }) {
  const [query, setQuery] = useState("");           // drives the INPUT — instant
  const [keystrokes, setKeystrokes] = useState(0);
  const debounced = useDebouncedValue(query, delay); // drives the WORK — lagged
  const runs = useRef(0);

  const filtered = useMemo(() => {
    runs.current += 1;
    return filterProducts(debounced);
  }, [debounced]);

  return (
    <Panel
      title={"2 · Debounced (" + delay + "ms)"}
      subtitle="filters only after you pause"
      query={query}
      onChange={(v) => { setQuery(v); setKeystrokes(n => n + 1); }}
      keystrokes={keystrokes}
      runs={runs.current}
      filtered={filtered}
      // The list on screen belongs to an OLDER query. Saying so is part of the
      // feature — a stale list presented as current is a small lie.
      stale={query !== debounced}
    />
  );
}

// ---------------------------------------------------------------------------
// One presentation component, so the comparison is honest
// ---------------------------------------------------------------------------
function Panel({ title, subtitle, query, onChange, keystrokes, runs, filtered, stale }) {
  return (
    <div style={{ flex: 1, minWidth: 300, fontFamily: "system-ui" }}>
      <h3 style={{ margin: "0 0 2px" }}>{title}</h3>
      <p style={{ margin: "0 0 10px", fontSize: 12, color: "#888" }}>{subtitle}</p>

      <input
        value={query}
        onChange={e => onChange(e.target.value)}
        placeholder="Search by name or category..."
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 8,
          border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box",
        }}
      />

      <p style={{ fontSize: 12, color: "#888", margin: "8px 0" }}>
        keystrokes <b>{keystrokes}</b> · filters run <b>{runs}</b>
        {stale && <span style={{ color: "#d97706" }}> · waiting…</span>}
      </p>

      <p style={{ fontSize: 13, color: "#888", margin: "8px 0" }}>
        Showing {filtered.length} of {PRODUCTS.length} products
      </p>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 24, color: "#999" }}>
          No products match "{query}"
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(p => (
            <div key={p.id} style={{
              padding: "8px 12px", background: "#f8f8f8", borderRadius: 8,
              border: "1px solid #eee", display: "flex", justifyContent: "space-between",
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

function App() {
  return (
    <div style={{ display: "flex", gap: 24, padding: 20, flexWrap: "wrap" }}>
      <SearchFilter />
      <SearchFilterDebounced delay={400} />
    </div>
  );
}

render(<App />);

// ===== WHAT'S BEING GRADED =====
// 1. THE FILTERED LIST IS DERIVED, NEVER STORED. Both versions compute during
//    render. Keeping a \`filtered\` array in state needs an effect to resync it,
//    gives you one render where the list and the query disagree, and goes stale
//    when the source data changes without the query changing.
//
// 2. WHEN ASKED TO DEBOUNCE, DEBOUNCE THE VALUE — NOT THE INPUT. The field stays
//    controlled by \`query\` so typing is never laggy; only \`debounced\`, which
//    drives the work, trails behind. Debouncing the input itself is the version
//    that makes a search box feel broken.
//
// 3. THE CLEANUP IS THE ALGORITHM. \`return () => clearTimeout(id)\` is not
//    tidy-up — it is what cancels the pending timer on each keystroke so only
//    the last one survives. Without it every keystroke fires after \`delay\`.
//
// 4. SAY THAT THIS LIST DOES NOT NEED IT, AND WHY. Filtering 12 local objects
//    costs ~0.0025 ms; a frame is 16.67 ms. A 400 ms debounce adds 400 ms of
//    lag to save a fraction of a microsecond. Watch the counters: the debounced
//    panel runs the filter fewer times and feels slower, because the work it
//    skipped was free. Debouncing belongs where a keystroke costs something you
//    do not control — a network request, most often.
//
// 5. FOR EXPENSIVE LOCAL WORK, THE ANSWER IS useDeferredValue, NOT DEBOUNCE.
//    It keeps the input responsive while the list catches up, and it yields
//    based on actual work rather than a timer you guessed. Reach for it when
//    rendering the results is the cost (tens of thousands of rows), not when
//    computing them is.
//
// 6. DEBOUNCING DOES NOT FIX OUT-OF-ORDER RESPONSES. It reduces how many
//    requests you send; it says nothing about the order they return in. A slow
//    response for "re" can still land after a fast one for "react" and
//    overwrite it. That needs an AbortController — see the
//    "Search with Debounce + Cancel" template.`},{name:"Chat App",jsx:!0,code:`// WEBSOCKET OR POLLING?
//   Polling (ask "anything new?" every few seconds) is simple and works through
//   every proxy, but messages arrive late and most requests return nothing.
//   A WebSocket keeps one connection open in both directions, so the server
//   pushes messages and typing events the moment they happen. Chat needs the
//   client to send often too (messages, typing), which is exactly what a
//   WebSocket is for. Real apps still keep polling as a fallback.
//
// The playground has no server, so FakeSocket below behaves like one: it
// confirms your messages, and "Alex" types and replies. Swap in
// new WebSocket(url) and send/onmessage keep the same shape.

class FakeSocket {
  constructor() {
    this.onmessage = null;
    this.dropNext = false;           // flip on to see a failed send
  }
  receive(data) {
    if (this.onmessage) this.onmessage({ data: JSON.stringify(data) });
  }
  send(raw) {
    const msg = JSON.parse(raw);
    if (msg.type !== "message") return;          // typing events need no reply
    const failThis = this.dropNext;
    this.dropNext = false;
    setTimeout(() => {
      if (failThis) {
        this.receive({ type: "error", clientId: msg.clientId });
        return;
      }
      // The server confirms with its own id, and echoes the clientId back.
      this.receive({ type: "ack", clientId: msg.clientId, id: "s" + Date.now(), at: Date.now() });
      // Then Alex starts typing, and replies.
      setTimeout(() => this.receive({ type: "typing", user: "Alex" }), 300);
      setTimeout(() => this.receive({
        type: "message", id: "s" + (Date.now() + 1), user: "Alex", text: "Got it: " + msg.text, at: Date.now(),
      }), 1500);
    }, 400);
  }
  close() { this.onmessage = null; }
}

// History, as a REST call would return it.
function fetchHistory() {
  return new Promise((resolve) => setTimeout(() => resolve([
    { id: "s1", user: "Alex", text: "Morning! Did the deploy go out?", at: Date.now() - 60000, status: "sent" },
    { id: "s2", user: "You", text: "Yes, about ten minutes ago.", at: Date.now() - 50000, status: "sent" },
  ]), 600));
}

const TYPING_SEND_EVERY = 2000;   // tell the server at most once per 2 s while typing
const TYPING_EXPIRES = 3000;      // hide "is typing" if no update arrives for 3 s

function useChat() {
  const [messages, setMessages] = React.useState(null);   // null = still loading
  const [typingUser, setTypingUser] = React.useState(null);
  const socketRef = React.useRef(null);
  const typingTimer = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;
    const socket = new FakeSocket();
    socketRef.current = socket;

    fetchHistory().then((history) => {
      // Merge rather than replace: a pushed message may have arrived first.
      if (!cancelled) setMessages((current) => mergeById(history, current || []));
    });

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "typing") {
        setTypingUser(data.user);
        // Typing indicators must expire on their own. If the "stopped typing"
        // event is lost, the indicator would otherwise stay forever.
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTypingUser(null), TYPING_EXPIRES);
      }
      if (data.type === "message") {
        setTypingUser(null);
        setMessages((current) => mergeById(current || [], [{ ...data, status: "sent" }]));
      }
      if (data.type === "ack") {
        // Match on clientId: the server's id did not exist when we sent it.
        setMessages((current) => current.map((m) =>
          m.clientId === data.clientId ? { ...m, id: data.id, status: "sent" } : m));
      }
      if (data.type === "error") {
        setMessages((current) => current.map((m) =>
          m.clientId === data.clientId ? { ...m, status: "failed" } : m));
      }
    };

    return () => {
      cancelled = true;
      clearTimeout(typingTimer.current);
      socket.close();
    };
  }, []);

  const send = (text, retryOf) => {
    // A clientId made on this device is the message's identity until the
    // server assigns one. It is also what stops a retry being shown twice.
    const clientId = retryOf ? retryOf.clientId : "c" + Date.now() + Math.random().toString(36).slice(2, 6);
    const message = { clientId, id: clientId, user: "You", text, at: Date.now(), status: "sending" };
    setMessages((current) => retryOf
      ? current.map((m) => (m.clientId === clientId ? message : m))
      : [...(current || []), message]);
    socketRef.current.send(JSON.stringify({ type: "message", clientId, text }));
  };

  const lastTypingSent = React.useRef(0);
  const notifyTyping = () => {
    const now = Date.now();
    if (now - lastTypingSent.current < TYPING_SEND_EVERY) return;   // throttle
    lastTypingSent.current = now;
    socketRef.current.send(JSON.stringify({ type: "typing" }));
  };

  return { messages, typingUser, send, notifyTyping, socketRef };
}

// Adds incoming messages, skipping any whose id is already in the list.
function mergeById(existing, incoming) {
  const seen = new Set(existing.map((m) => m.id));
  return [...existing, ...incoming.filter((m) => !seen.has(m.id))].sort((a, b) => a.at - b.at);
}

function ChatApp() {
  const { messages, typingUser, send, notifyTyping, socketRef } = useChat();
  const [draft, setDraft] = React.useState("");
  const endRef = React.useRef(null);

  React.useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ block: "end" });
  }, [messages, typingUser]);

  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim() || !messages) return;
    send(draft.trim());
    setDraft("");
  };

  return (
    <div style={{ width: 380, border: "1px solid #334155", borderRadius: 10, overflow: "hidden", background: "#0f172a" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #334155", fontWeight: 600 }}>Alex</div>

      <div role="log" aria-live="polite" aria-label="Messages" style={{ height: 260, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {messages === null && <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading messages…</p>}
        {messages && messages.map((m) => {
          const mine = m.user === "You";
          return (
            // key = clientId for our own messages, so the bubble keeps its
            // identity when the server id arrives. Changing the key would
            // remount it and restart any animation.
            <div key={m.clientId || m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
              <div style={{ padding: "8px 12px", borderRadius: 12, fontSize: 14, background: mine ? "#2563eb" : "#1e293b", opacity: m.status === "sending" ? 0.6 : 1 }}>
                {m.text}
              </div>
              {mine && (
                <div style={{ fontSize: 11, color: m.status === "failed" ? "#fca5a5" : "#94a3b8", textAlign: "right", marginTop: 2 }}>
                  {m.status === "sending" && "Sending…"}
                  {m.status === "sent" && "Sent"}
                  {m.status === "failed" && (
                    <span>
                      Not sent.{" "}
                      <button onClick={() => send(m.text, m)} style={{ background: "none", border: "none", color: "#93c5fd", cursor: "pointer", fontSize: 11, padding: 0 }}>Retry</button>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {typingUser && <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", margin: 0 }}>{typingUser} is typing…</p>}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} style={{ display: "flex", gap: 6, padding: 10, borderTop: "1px solid #334155" }}>
        <input
          value={draft}
          onChange={(e) => { setDraft(e.target.value); notifyTyping(); }}
          placeholder={messages ? "Type a message" : "Loading…"}
          aria-label="Message"
          disabled={!messages}
          style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #475569", background: "#1e293b", color: "#fff" }}
        />
        <button type="submit" style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}>Send</button>
      </form>
      <button
        onClick={() => { socketRef.current.dropNext = true; }}
        style={{ margin: "0 10px 10px", background: "none", border: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer", padding: 0, textDecoration: "underline" }}
      >
        Make the next message fail
      </button>
    </div>
  );
}

function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Live chat</h2>
      <ChatApp />
    </div>
  );
}

render(<App />);

// FOLLOW-UPS INTERVIEWERS ASK
//   - Reconnecting: after a dropped connection, reconnect with backoff and ask
//     for everything after the last message id you have, or messages sent
//     while offline are lost. See the "WebSocket Live Feed" template.
//   - Offline sending: keep unsent messages in an outbox (IndexedDB) and send
//     them in order when the connection returns.
//   - Long histories: load older messages when scrolling up, and keep the
//     scroll position still while they are inserted above.
//   - Auto-scroll only when the user is already near the bottom. If they have
//     scrolled up to read, show a "New messages" button instead.`},{name:"Modal Component",jsx:!0,code:`function Modal({ isOpen, onClose, title, children }) {
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
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title} style={{
        background: "#fff", borderRadius: 12, padding: 24, minWidth: 320,
        maxWidth: "90%", maxHeight: "80vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)", animation: "slideUp 0.2s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} aria-label="Close"
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

render(<App />);`},{name:"Image Gallery + Lazy Load",jsx:!0,code:`function LazyImage({ src, alt, style }) {
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

render(<ImageGallery />);`},{name:"Drag and Drop",jsx:!0,code:`function DragDropApp() {
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

render(<DragDropApp />);`},{name:"Product List Sort & Filter",jsx:!0,code:`const PRODUCTS = [
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

render(<ProductList />);`},{name:"Responsive Navbar",jsx:!0,code:`function Navbar() {
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
              aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}
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
          // inert while closed: a height of 0 hides the links visually, but they
          // would still be reachable with Tab and read out by a screen reader.
          <div inert={!menuOpen} style={{
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

render(<Navbar />);`},{name:"Infinite Scroll",jsx:!0,code:`function fakeAPI(page) {
  const totalPages = 8;
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (page > totalPages) return resolve({ items: [], hasMore: false });
      // Fail page 3 once, so the error + retry path is reachable in the demo.
      if (page === 3 && !fakeAPI.failedOnce) {
        fakeAPI.failedOnce = true;
        return reject(new Error("Network error loading page 3"));
      }
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
  const [error, setError] = React.useState(null);
  const sentinelRef = React.useRef(null);

  const loadMore = React.useCallback(() => {
    // Guard on error too, or the observer retries in a tight loop while
    // the sentinel stays on screen — a self-inflicted request storm.
    if (loading || !hasMore || error) return;
    setLoading(true);
    setError(null);
    fakeAPI(page)
      .then(res => {
        setItems(prev => [...prev, ...res.items]);
        setHasMore(res.hasMore);
        setPage(p => p + 1);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, loading, hasMore, error]);

  // Clearing the error re-enables the observer, which fires again if the
  // sentinel is still visible — so retry needs no separate fetch call.
  const retry = React.useCallback(() => setError(null), []);

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

        {/* Error state with an explicit retry. Note the sentinel is NOT
            rendered while an error is showing — otherwise the observer
            keeps firing and hammers the failing endpoint. */}
        {error && (
          <div role="alert" style={{
            padding: 16, textAlign: "center", background: "#78350f",
            color: "#fbbf24", borderRadius: 8, fontSize: 13,
          }}>
            <p style={{ margin: "0 0 10px" }}>⚠ {error}</p>
            <button onClick={retry} style={{
              padding: "7px 14px", borderRadius: 6, border: "none",
              background: "#f59e0b", color: "#1c1917", cursor: "pointer", fontSize: 13,
            }}>
              Retry
            </button>
          </div>
        )}

        {/* Sentinel element for IntersectionObserver */}
        {hasMore && !error && (
          <div ref={sentinelRef} style={{ padding: 20, textAlign: "center" }}>
            {/* aria-live so a screen-reader user hears that more arrived */}
            <span aria-live="polite">
              {loading && <span style={{ color: "#888" }}>Loading more...</span>}
            </span>
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

render(<InfiniteScroll />);`},{name:"Notifications",jsx:!0,code:`function useNotifications() {
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

render(<App />);`},{name:"Star Rating",jsx:!0,code:`function StarRating({ totalStars = 5, initialRating = 0, onChange }) {
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

render(<App />);`},{name:"Tabs",jsx:!0,code:`// WHICH ANIMATION TOOL?
//   CSS transitions + keyframes (used here): a slide and a fade need nothing
//     else, and cost zero bytes of JavaScript.
//   Framer Motion (now called Motion): worth it for EXIT animations (the old
//     panel fading out before it unmounts) and for layout animation, where
//     layoutId moves the underline between tabs without measuring anything.
//     It adds a few tens of KB.
//   react-transition-group (CSSTransition): adds enter/exit class names at the
//     right moments so plain CSS can animate a component that is unmounting.
//   Rule of thumb: CSS until you need exit or layout animations.

const INITIAL_TABS = [
  { id: "profile", label: "Profile", content: "Your name, photo and contact details." },
  { id: "security", label: "Security", content: "Password, two-factor login and active sessions." },
  { id: "billing", label: "Billing", content: "Plan, invoices and payment methods." },
];

function Tabs({ tabs, activeId, onChange }) {
  const base = React.useId();                 // unique ids, even with two Tabs on one page
  const tabRefs = React.useRef(new Map());    // id -> button element, for focus and measuring
  const [indicator, setIndicator] = React.useState({ left: 0, width: 0 });

  // Measure the active tab and move the underline to it. useLayoutEffect runs
  // after the DOM updates but BEFORE the browser paints, so the underline never
  // shows in the old place for a frame.
  React.useLayoutEffect(() => {
    const el = tabRefs.current.get(activeId);
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeId, tabs]);

  const onKeyDown = (e) => {
    const index = tabs.findIndex((t) => t.id === activeId);
    let next = null;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(tabs[next].id);
    tabRefs.current.get(tabs[next].id).focus();   // focus follows selection
  };

  const active = tabs.find((t) => t.id === activeId);

  return (
    <div style={{ border: "1px solid #334155", borderRadius: 8, overflow: "hidden" }}>
      <div role="tablist" aria-label="Account settings" onKeyDown={onKeyDown}
        style={{ position: "relative", display: "flex", background: "#0f172a" }}>
        {tabs.map((tab) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => { if (el) tabRefs.current.set(tab.id, el); else tabRefs.current.delete(tab.id); }}
              role="tab"
              id={base + "-tab-" + tab.id}
              aria-selected={selected}
              aria-controls={base + "-panel-" + tab.id}
              tabIndex={selected ? 0 : -1}      // one Tab stop for the whole list; arrows move inside it
              onClick={() => onChange(tab.id)}
              style={{
                padding: "12px 18px", background: "none", border: "none", cursor: "pointer", fontSize: 14,
                color: selected ? "#60a5fa" : "#94a3b8", fontWeight: selected ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          );
        })}
        <span
          aria-hidden="true"
          className="tabs-anim"
          style={{
            position: "absolute", bottom: 0, height: 2, background: "#60a5fa",
            left: 0, width: indicator.width, transform: "translateX(" + indicator.left + "px)",
            transition: "transform 0.25s ease, width 0.25s ease",   // transform animates on the GPU; left would not
          }}
        />
      </div>
      {active && (
        <div
          // key = the tab id, so switching tabs mounts a NEW panel and the
          // fade-in keyframe plays again. Without it React reuses the div.
          key={active.id}
          className="tab-panel tabs-anim"
          role="tabpanel"
          id={base + "-panel-" + active.id}
          aria-labelledby={base + "-tab-" + active.id}
          tabIndex={0}
          style={{ padding: 20, color: "#cbd5e1", background: "#1e293b", minHeight: 60 }}
        >
          {active.content}
        </div>
      )}
    </div>
  );
}

function App() {
  const [tabs, setTabs] = React.useState(INITIAL_TABS);
  const [activeId, setActiveId] = React.useState("profile");

  // If the active tab is removed, fall back to the first one. Derived during
  // render, not fixed up in an effect afterwards.
  const safeActiveId = tabs.some((t) => t.id === activeId) ? activeId : tabs[0] && tabs[0].id;

  const addTab = () => {
    const n = tabs.length + 1;
    const id = "custom-" + Date.now();
    setTabs([...tabs, { id, label: "Tab " + n, content: "Content for tab " + n + "." }]);
    setActiveId(id);
  };
  const removeActive = () => {
    if (tabs.length > 1) setTabs(tabs.filter((t) => t.id !== safeActiveId));
  };

  const btn = { padding: "6px 12px", borderRadius: 6, border: "1px solid #475569", background: "#334155", color: "#fff", cursor: "pointer" };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <style>{
        "@keyframes tab-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }" +
        ".tab-panel { animation: tab-fade 0.2s ease-out; }" +
        "@media (prefers-reduced-motion: reduce) { .tabs-anim { animation: none !important; transition: none !important; } }"
      }</style>
      <h2>Tabs</h2>
      <p style={{ color: "#94a3b8", fontSize: 14 }}>Click a tab, or focus one and use the arrow keys.</p>
      <Tabs tabs={tabs} activeId={safeActiveId} onChange={setActiveId} />
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button style={btn} onClick={addTab}>Add tab</button>
        <button style={btn} onClick={removeActive} disabled={tabs.length <= 1}>Remove active tab</button>
      </div>
    </div>
  );
}

render(<App />);

// FOLLOW-UPS INTERVIEWERS ASK
//   - Keep hidden panels mounted? Unmounting (done here) resets their state and
//     keeps the DOM small. If a panel holds a half-filled form, keep it mounted
//     with the hidden attribute, or use React 19's <Activity mode="hidden">.
//   - The URL: store the active tab in the query string (?tab=billing) so it
//     survives a refresh and can be linked to.
//   - Resizing: the underline is measured once per change. If tab widths can
//     change (fonts loading, window resize), re-measure with a ResizeObserver.`},{name:"Accordion",jsx:!0,code:`// SINGLE OR MULTIPLE?
//   Single-open keeps a long page short and suits FAQs, where people read one
//   answer. Multi-open suits settings or filters, where people compare
//   sections. Support both with one prop; the only difference is one line in
//   toggle(). Storing the open ids in a Set makes both cases the same code.
//
// THE NATIVE OPTION
//   <details><summary> gives you open/close, keyboard support and
//   screen-reader state with no JavaScript, and several <details> sharing a
//   name="..." attribute behave as single-open. Use it when you do not need a
//   custom animation.

function Accordion({ items, allowMultiple = false, defaultOpenIds = [] }) {
  const [openIds, setOpenIds] = React.useState(() => new Set(defaultOpenIds));
  const base = React.useId();
  const headerRefs = React.useRef([]);

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();     // the ONLY line that differs between the modes
        next.add(id);
      }
      return next;
    });
  };

  // Arrow keys move focus between headers. Tab still moves out normally.
  const onHeaderKeyDown = (e, index) => {
    const last = items.length - 1;
    let target = null;
    if (e.key === "ArrowDown") target = index === last ? 0 : index + 1;
    else if (e.key === "ArrowUp") target = index === 0 ? last : index - 1;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = last;
    if (target === null) return;
    e.preventDefault();
    headerRefs.current[target].focus();
  };

  return (
    <div style={{ border: "1px solid #334155", borderRadius: 8, overflow: "hidden" }}>
      {items.map((item, index) => {
        const isOpen = openIds.has(item.id);
        const headerId = base + "-header-" + item.id;
        const panelId = base + "-panel-" + item.id;
        return (
          <div key={item.id} style={{ borderBottom: index === items.length - 1 ? "none" : "1px solid #334155" }}>
            {/* The button sits inside a heading, so headings navigation still finds it. */}
            <h3 style={{ margin: 0 }}>
              <button
                ref={(el) => { headerRefs.current[index] = el; }}
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => onHeaderKeyDown(e, index)}
                style={{
                  width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px", border: "none", cursor: "pointer", textAlign: "left",
                  background: isOpen ? "#1e293b" : "#0f172a", color: "#fff", fontSize: 15, fontWeight: 500,
                }}
              >
                <span>{item.title}</span>
                <span aria-hidden="true" className="acc-anim" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "#60a5fa" }}>▼</span>
              </button>
            </h3>
            {/* Animating height: height: auto cannot be transitioned, but a
                one-row grid going from 0fr to 1fr can, and it needs no
                measuring. The panel stays mounted so it can animate closed.
                visibility: hidden is what takes the closed content out of the
                Tab order and the accessibility tree; the grid alone only makes
                it look empty. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className="acc-anim"
              style={{
                display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr",
                visibility: isOpen ? "visible" : "hidden",
                transition: "grid-template-rows 0.25s ease, visibility 0.25s",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div style={{ padding: "14px 16px", background: "#0b1220", color: "#cbd5e1", fontSize: 14 }}>
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function App() {
  const items = [
    { id: "react", title: "What is React?", content: <p style={{ margin: 0 }}>A library for building user interfaces from components. <a href="#docs" style={{ color: "#93c5fd" }}>A link, to test Tab</a>.</p> },
    { id: "hooks", title: "What are hooks?", content: "Functions that let function components use state, effects and context." },
    { id: "recon", title: "What is reconciliation?", content: "How React compares the new element tree with the old one to decide the smallest set of DOM changes." },
  ];
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <style>{"@media (prefers-reduced-motion: reduce) { .acc-anim { transition: none !important; } }"}</style>
      <h2>Accordion (single-open)</h2>
      <Accordion items={items} defaultOpenIds={["react"]} />
      <h2 style={{ marginTop: 24 }}>Accordion (multi-open)</h2>
      <Accordion items={items} allowMultiple />
    </div>
  );
}

render(<App />);

// FOLLOW-UPS INTERVIEWERS ASK
//   - Controlled version: accept openIds + onChange props so a parent can open
//     a section from outside (for example from a URL hash). Fall back to the
//     internal state when they are not passed.
//   - Search inside closed sections: hidden="until-found" lets the browser's
//     find-in-page open a section that contains the match (Chromium only).
//   - Heavy panels: mounting them only when first opened, then keeping them,
//     saves work on a long FAQ.`},{name:"OTP Input",jsx:!0,code:`function OTPInput({ length = 6, onComplete }) {
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

render(<App />);`},{name:"Tic-Tac-Toe",jsx:!0,code:`const LINES = [
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

render(<App />);`},{name:"Stopwatch",jsx:!0,code:`function formatTime(ms) {
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

render(<App />);`},{name:"Calculator",jsx:!0,code:`function App() {
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

render(<App />);`},{name:"Auto-Complete (ARIA combobox)",jsx:!0,code:`// THE MECHANISM THAT MATTERS: aria-activedescendant. DOM focus stays in
// the INPUT while a "virtual" focus moves through the options. If you
// move real focus onto the <li>s, typing stops working — that's the
// single most common way this component is built wrong.

const CITIES = ["London","Lisbon","Los Angeles","Lagos","Lahore","Leeds",
  "Lima","Lyon","Madrid","Manchester","Melbourne","Mumbai","Munich",
  "Nairobi","Nantes","Naples","New York","Nice"];

function fakeSearch(q, signal) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      if (q.toLowerCase() === "err") reject(new Error("Suggestion service failed"));
      else resolve(CITIES.filter(c => c.toLowerCase().includes(q.toLowerCase())));
    }, 150 + Math.random() * 450);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

function useDebouncedValue(value, delay = 250) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);   // a new keystroke cancels the pending timer
  }, [value, delay]);
  return v;
}

function AutoComplete() {
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);   // VIRTUAL focus index
  const [status, setStatus] = React.useState("idle");
  const [error, setError] = React.useState(null);
  const [selected, setSelected] = React.useState(null);

  const debounced = useDebouncedValue(query, 250);
  const listId = "ac-listbox";
  const listRef = React.useRef(null);

  React.useEffect(() => {
    if (!debounced.trim()) { setOptions([]); setStatus("idle"); setOpen(false); return; }

    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    fakeSearch(debounced, controller.signal)
      .then(res => {
        setOptions(res);
        setStatus(res.length ? "success" : "empty");
        setOpen(true);
        setActive(-1);           // reset virtual focus on a new result set
      })
      .catch(err => {
        if (err.name === "AbortError") return;   // never surface a cancellation
        setError(err.message);
        setStatus("error");
        setOpen(true);
      });

    return () => controller.abort();   // cancel the in-flight request
  }, [debounced]);

  function commit(index) {
    const value = options[index];
    if (!value) return;
    setSelected(value);
    setQuery(value);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e) {
    // ↓ on a closed list should REOPEN it — a small detail people miss.
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      if (options.length) { setOpen(true); return; }
    }
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();   // stop the caret jumping to end of input
        setActive(i => (i + 1) % Math.max(options.length, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive(i => (i <= 0 ? options.length - 1 : i - 1));
        break;
      case "Home": e.preventDefault(); setActive(0); break;
      case "End":  e.preventDefault(); setActive(options.length - 1); break;
      case "Enter":
        if (active >= 0) { e.preventDefault(); commit(active); }
        break;
      case "Escape":
        // First Esc closes the list; a second clears the input.
        if (open) setOpen(false);
        else setQuery("");
        break;
      case "Tab":
        setOpen(false);   // Tab accepts and moves on — never traps focus
        break;
      default: break;
    }
  }

  // Keep the virtually-focused option scrolled into view.
  React.useEffect(() => {
    if (active < 0 || !listRef.current) return;
    listRef.current.children[active]?.scrollIntoView?.({ block: "nearest" });
  }, [active]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#e2e8f0", maxWidth: 420 }}>
      <h2 style={{ marginTop: 0 }}>Auto-Complete</h2>

      <label htmlFor="ac-input" style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
        City
      </label>

      <div style={{ position: "relative" }}>
        <input
          id="ac-input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          // The whole trick: DOM focus stays here, virtual focus is an id.
          aria-activedescendant={active >= 0 ? \`ac-opt-\${active}\` : undefined}
          autoComplete="off"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
          onKeyDown={onKeyDown}
          onBlur={() => setOpen(false)}
          placeholder='Type "l", or "err" for the error state'
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 6, fontSize: 15,
            border: "1px solid #334155", background: "#1e293b", color: "#fff",
          }}
        />

        {status === "loading" && (
          <span style={{ position: "absolute", right: 12, top: 11, color: "#64748b", fontSize: 13 }}>
            …
          </span>
        )}

        {open && (
          <ul
            id={listId}
            role="listbox"
            ref={listRef}
            aria-label="City suggestions"
            style={{
              listStyle: "none", margin: "4px 0 0", padding: 4, position: "absolute",
              width: "100%", maxHeight: 200, overflowY: "auto", zIndex: 10,
              background: "#0f172a", border: "1px solid #334155", borderRadius: 6,
            }}
          >
            {status === "error" && (
              <li role="alert" style={{ padding: "8px 10px", color: "#f87171", fontSize: 13 }}>
                ⚠ {error}
              </li>
            )}
            {status === "empty" && (
              <li style={{ padding: "8px 10px", color: "#94a3b8", fontSize: 13 }}>
                No matches for “{debounced}”.
              </li>
            )}
            {options.map((opt, i) => (
              <li
                key={opt}
                id={\`ac-opt-\${i}\`}
                role="option"
                aria-selected={i === active}
                // onMouseDown, not onClick: onClick fires after onBlur has
                // already closed the list, so the selection is lost.
                onMouseDown={(e) => { e.preventDefault(); commit(i); }}
                onMouseEnter={() => setActive(i)}
                style={{
                  padding: "8px 10px", borderRadius: 4, cursor: "pointer",
                  background: i === active ? "#3b82f6" : "transparent",
                  color: i === active ? "#fff" : "#e2e8f0",
                }}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Announce the result count — a sighted user sees the list appear,
          a screen-reader user needs to be told. */}
      <div aria-live="polite" aria-atomic="true" style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
        {status === "success" && \`\${options.length} suggestion\${options.length === 1 ? "" : "s"} available\`}
        {status === "empty" && "No suggestions"}
      </div>

      {selected && (
        <p style={{ marginTop: 12, color: "#4ade80", fontSize: 14 }}>✓ Selected: {selected}</p>
      )}

      <details style={{ marginTop: 20, fontSize: 13, color: "#94a3b8" }}>
        <summary style={{ cursor: "pointer" }}>The five details that get graded</summary>
        <ul style={{ lineHeight: 1.8 }}>
          <li><b>aria-activedescendant</b> keeps DOM focus in the input while
              virtual focus moves through the options. Moving real focus to the
              &lt;li&gt;s breaks typing — the classic wrong implementation.</li>
          <li><b>Cancel the previous request.</b> Without AbortController, a slow
              response for "l" can land after a fast one for "lo" and overwrite it.</li>
          <li><b>onMouseDown, not onClick,</b> on the options — onClick fires after
              onBlur has closed the list, so the click never registers.</li>
          <li><b>preventDefault on ↑/↓</b> or the caret jumps to the start/end of
              the input while you're navigating.</li>
          <li><b>Five states:</b> idle / loading / success / empty / error. And
              announce the count in a live region.</li>
          <li><b>In production</b> use React Aria's useComboBox or Radix — this
              pattern has a long tail of screen-reader edge cases, and the honest
              answer is that you'd style a tested primitive rather than maintain
              your own.</li>
        </ul>
      </details>
    </div>
  );
}

render(<AutoComplete />);`},{name:"Toast / Snackbar",jsx:!0,code:`// CONTEXT, REDUX OR AN EVENT SYSTEM?
//   Context   works, but toast() can only be called from inside a component,
//             and every consumer re-renders whenever the list changes.
//   Redux     works, but it puts timers and throwaway UI into the global store.
//   A tiny store (used here): a plain object with subscribe + getSnapshot.
//             Anything can call it, and only the <Toaster> re-renders.
//             React reads it with useSyncExternalStore. Libraries such as
//             react-hot-toast and sonner are built the same way.

const MAX_VISIBLE = 3;

// ---------- the store: plain JavaScript, no React ----------
function createToastStore() {
  let toasts = [];                 // every toast not yet dismissed, oldest first
  let nextId = 1;
  const listeners = new Set();
  const emit = () => listeners.forEach((listener) => listener());

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return toasts;               // same array until something changes
    },
    add(message, type, duration) {
      // Already showing or queued? Do not stack a second copy.
      if (toasts.some((t) => t.message === message && t.type === type)) return null;
      const id = nextId++;
      toasts = [...toasts, { id, message, type, duration }];
      emit();
      return id;
    },
    dismiss(id) {
      toasts = toasts.filter((t) => t.id !== id);
      emit();
    },
  };
}

const toastStore = createToastStore();

// ---------- the public API: plain functions, callable from anywhere ----------
const toast = {
  info: (message) => toastStore.add(message, "info", 3000),
  success: (message) => toastStore.add(message, "success", 3000),
  error: (message) => toastStore.add(message, "error", 6000),   // errors stay longer
  dismiss: (id) => toastStore.dismiss(id),
};

// ---------- React side ----------
function useToasts() {
  return React.useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot);
}

const COLORS = { info: "#2563eb", success: "#16a34a", error: "#dc2626" };

function ToastItem({ item }) {
  const [paused, setPaused] = React.useState(false);
  const remaining = React.useRef(item.duration);

  // The countdown only starts once the toast is ON SCREEN, because only
  // visible toasts are mounted. A queued toast never expires unseen.
  React.useEffect(() => {
    if (paused) return;
    const startedAt = Date.now();
    const timer = setTimeout(() => toastStore.dismiss(item.id), remaining.current);
    return () => {
      clearTimeout(timer);                              // no timer outlives its toast
      remaining.current -= Date.now() - startedAt;      // keep the time that was left
    };
  }, [paused, item.id]);

  return (
    <div
      className="toast-in"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
        borderRadius: 8, background: "#1e293b", color: "#f1f5f9", fontSize: 14,
        borderLeft: "4px solid " + COLORS[item.type], boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      <span style={{ flex: 1 }}>{item.message}</span>
      <button
        onClick={() => toast.dismiss(item.id)}
        aria-label="Dismiss notification"
        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}
      >
        ×
      </button>
    </div>
  );
}

function Toaster() {
  const toasts = useToasts();
  const visible = toasts.slice(0, MAX_VISIBLE);
  const waiting = toasts.length - visible.length;

  // The live region is ALWAYS mounted, even with nothing in it. A region that
  // appears at the same moment as its text is usually not announced at all.
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ position: "absolute", right: 16, bottom: 16, width: 280, display: "flex", flexDirection: "column", gap: 8 }}
    >
      {visible.map((item) => <ToastItem key={item.id} item={item} />)}
      {waiting > 0 && (
        <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "right" }}>+{waiting} waiting</div>
      )}
    </div>
  );
}

// Plain code outside React, calling toast() directly. No hook, no context.
function saveProfile(shouldFail) {
  return new Promise((resolve) => setTimeout(resolve, 400)).then(() => {
    if (shouldFail) toast.error("Could not save your profile. Please try again.");
    else toast.success("Profile saved");
  });
}

function App() {
  const burst = () => {
    for (let i = 1; i <= 5; i++) toast.info("Upload " + i + " of 5 finished");
  };

  const btn = { padding: "8px 14px", borderRadius: 6, border: "1px solid #475569", background: "#334155", color: "#fff", cursor: "pointer" };

  return (
    <div style={{ position: "relative", minHeight: 340, padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <style>{
        "@keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }" +
        ".toast-in { animation: toast-in 0.2s ease-out; }" +
        "@media (prefers-reduced-motion: reduce) { .toast-in { animation: none; } }"
      }</style>
      <h2>Toast notifications</h2>
      <p style={{ color: "#94a3b8", fontSize: 14 }}>Hover a toast to pause it. Click "Burst" to see the queue.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={btn} onClick={() => saveProfile(false)}>Save (success)</button>
        <button style={btn} onClick={() => saveProfile(true)}>Save (fails)</button>
        <button style={btn} onClick={burst}>Burst of 5</button>
        <button style={btn} onClick={() => toast.info("Same message twice")}>Duplicate test</button>
      </div>
      <Toaster />
    </div>
  );
}

render(<App />);

// FOLLOW-UPS INTERVIEWERS ASK
//   - Where does <Toaster> go? Once, near the root, so it is never unmounted
//     by a page change.
//   - Errors: a second region with role="alert" (assertive) interrupts the
//     screen reader, which is right for an error and wrong for "Saved".
//   - Actions ("Undo"): give the toast a button and an onAction callback, and
//     keep it on screen longer. A toast that needs a decision should not
//     disappear on its own.
//   - Position and stacking are CSS. The queue is what stops overlap.`},{name:"Carousel / Slider",jsx:!0,code:`const SLIDES = [
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
      {/* A labelled region, and each slide says which one it is: without these a
          screen reader hears five slides at once and no way to tell the current one. */}
      <div role="region" aria-roledescription="carousel" aria-label="Featured"
           style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          display: "flex",
          transform: \`translateX(\${-index * 100}%)\`,
          transition: "transform 0.4s ease",
        }}>
          {SLIDES.map((s, i) => (
            <div key={i} role="group" aria-roledescription="slide"
                 aria-label={(i + 1) + " of " + SLIDES.length} aria-hidden={i !== index}
                 style={{
              flex: "0 0 100%", height: 240, display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: s.color, color: "#fff",
            }}>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{s.title}</div>
              <div style={{ fontSize: 16, opacity: 0.85, marginTop: 4 }}>{s.subtitle}</div>
            </div>
          ))}
        </div>
        <button onClick={prev} aria-label="Previous slide" style={{
          position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
          width: 36, height: 36, borderRadius: "50%", fontSize: 18, cursor: "pointer",
        }}>‹</button>
        <button onClick={next} aria-label="Next slide" style={{
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
            aria-label={"Go to slide " + (i + 1)}
            aria-current={i === index ? "true" : undefined}
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

render(<App />);`},{name:"Todo List (localStorage + memo)",jsx:!0,code:`// The four techniques, and why each one matters:
//   1. Isolate the input's state in its own component, so keystrokes
//      re-render ONE component instead of the whole list.
//   2. React.memo on the row, so unchanged rows bail out.
//   3. Stable callback identity (useCallback), or memo() is defeated —
//      a new function prop every render fails the shallow compare.
//   4. Functional setState updates, so the callbacks don't need
//      \`todos\` in their dependency array and stay stable forever.

// ---------------------------------------------------------------------
// 1. The input owns its own draft state. The parent never re-renders
//    while you type — it only hears about it on submit.
// ---------------------------------------------------------------------
const TodoInput = React.memo(function TodoInput({ onAdd }) {
  const [draft, setDraft] = React.useState("");

  function submit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft("");
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="What needs doing?"
        aria-label="New todo"
        style={{
          flex: 1, padding: "8px 12px", borderRadius: 6,
          border: "1px solid #334155", background: "#1e293b", color: "#fff",
        }}
      />
      <button type="submit" style={btn}>Add</button>
    </form>
  );
});

// ---------------------------------------------------------------------
// 2. React.memo means a row only re-renders when ITS OWN props change.
//    The render counter proves it — toggle one item and watch that only
//    one row's count goes up.
// ---------------------------------------------------------------------
const TodoItem = React.memo(function TodoItem({ todo, onToggle, onDelete }) {
  const renders = React.useRef(0);
  renders.current++;

  return (
    <li style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
      borderRadius: 6, background: "#1e293b", marginBottom: 6,
    }}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        aria-label={\`Mark "\${todo.text}" as \${todo.done ? "not done" : "done"}\`}
      />
      <span style={{
        flex: 1,
        textDecoration: todo.done ? "line-through" : "none",
        opacity: todo.done ? 0.5 : 1,
      }}>
        {todo.text}
      </span>
      <span style={{ fontSize: 11, color: "#64748b" }}>
        renders: {renders.current}
      </span>
      <button onClick={() => onDelete(todo.id)} style={{ ...btn, background: "#7f1d1d" }}>
        ✕
      </button>
    </li>
  );
});

const STORAGE_KEY = "todos";
const SEED = [
  { id: 1, text: "Read the React docs on memo", done: false },
  { id: 2, text: "Profile a list render", done: true },
  { id: 3, text: "Ship the feature", done: false },
];

// localStorage can THROW, not merely return null — Safari private mode,
// blocked cookies, a full quota. It can also contain garbage from an older
// version of your app. Both need handling, and "most people forget the
// disabled case" is exactly what gets probed here.
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    // VALIDATE the shape. Trusting persisted data is how you get a
    // white screen after a deploy that changed the schema.
    if (!Array.isArray(parsed)) return SEED;
    return parsed.filter(
      (t) => t && typeof t.id === "number" && typeof t.text === "string",
    );
  } catch {
    return SEED;   // unavailable or malformed — degrade, never crash
  }
}

function TodoApp() {
  // Lazy initialiser: the function form runs ONCE, not on every render.
  // useState(loadTodos()) would hit localStorage on every single render.
  const [todos, setTodos] = React.useState(loadTodos);
  const [filter, setFilter] = React.useState("all");
  const [storageOk, setStorageOk] = React.useState(true);
  const nextId = React.useRef(
    todos.reduce((max, t) => Math.max(max, t.id), 0) + 1,
  );

  // Persist on change. Writing in the effect (not in the handlers) means
  // one place to maintain and it can't drift out of sync with state.
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      setStorageOk(true);
    } catch {
      setStorageOk(false);   // tell the user their work isn't being saved
    }
  }, [todos]);

  // ---------------------------------------------------------------------
  // 3 + 4. useCallback with an EMPTY dep array. This only works because
  //    every updater is FUNCTIONAL — setTodos(prev => ...) rather than
  //    reading \`todos\` from the closure. Reading \`todos\` directly would
  //    force it into the deps, a new function every render, and memo()
  //    on the rows would never bail out. This pairing is the whole trick.
  // ---------------------------------------------------------------------
  const addTodo = React.useCallback((text) => {
    setTodos((prev) => [...prev, { id: nextId.current++, text, done: false }]);
  }, []);

  const toggleTodo = React.useCallback((id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }, []);

  const deleteTodo = React.useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Derived state — computed during render, NOT stored in state.
  // Storing a filtered copy in state is the classic bug: two sources of
  // truth that drift. useMemo here is about skipping the filter work,
  // not about correctness.
  const visible = React.useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "done") return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const remaining = React.useMemo(
    () => todos.filter((t) => !t.done).length,
    [todos],
  );

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#e2e8f0", maxWidth: 520 }}>
      <h2 style={{ marginTop: 0 }}>Todo List</h2>
      <p style={{ fontSize: 13, color: "#94a3b8" }}>
        Type in the input — no row re-renders. Toggle one — only that row does.
        Reload the page — your list persists.
      </p>

      {!storageOk && (
        <p role="alert" style={{
          fontSize: 13, color: "#fbbf24", background: "#78350f",
          padding: "8px 10px", borderRadius: 6,
        }}>
          ⚠ Storage unavailable — changes won't be saved for your next visit.
        </p>
      )}

      <TodoInput onAdd={addTodo} />

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {["all", "active", "done"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            style={{ ...btn, background: filter === f ? "#3b82f6" : "#334155" }}
          >
            {f}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "#94a3b8" }}>
          {remaining} left
        </span>
      </div>

      {visible.length === 0 ? (
        <p style={{ color: "#64748b", fontStyle: "italic" }}>Nothing here.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {visible.map((todo) => (
            // key = stable ID, never the array index. An index key makes
            // React reuse the wrong row's state after a delete or reorder.
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </ul>
      )}

      <details style={{ marginTop: 20, fontSize: 13, color: "#94a3b8" }}>
        <summary style={{ cursor: "pointer" }}>What to say about scaling this</summary>
        <ul style={{ lineHeight: 1.7 }}>
          <li><b>500+ items:</b> memo isn't enough — the DOM is the cost.
              Virtualize with @tanstack/react-virtual so only visible rows mount.</li>
          <li><b>React Compiler:</b> it inserts this memoization automatically,
              so the useCallback/memo scaffolding becomes unnecessary — but the
              functional-update discipline still matters, because mutating state
              makes the compiler bail out silently.</li>
          <li><b>Server persistence:</b> todos become server state → TanStack
              Query, with useOptimistic for instant feedback and a rollback path.</li>
          <li><b>Don't store derived state.</b> \`visible\` and \`remaining\` are
              computed, not stored. Two sources of truth is the bug this avoids.</li>
          <li><b>localStorage throws, it doesn't just return null.</b> Safari
              private mode and blocked cookies raise on access. Wrap every read
              AND write, and tell the user when persistence is unavailable.</li>
          <li><b>Validate what you load.</b> Persisted data outlives your schema —
              a deploy that renames a field shouldn't white-screen returning users.</li>
          <li><b>Lazy state initialiser.</b> useState(loadTodos) not
              useState(loadTodos()) — the latter reads storage on every render.</li>
          <li><b>Multi-tab sync</b> is the follow-up: listen for the \`storage\`
              event (it fires in OTHER tabs, never the one that wrote) and
              reconcile. useSyncExternalStore is the modern way to subscribe.</li>
        </ul>
      </details>
    </div>
  );
}

const btn = {
  padding: "8px 14px", borderRadius: 6, border: "none",
  background: "#334155", color: "#fff", cursor: "pointer", fontSize: 13,
};

render(<TodoApp />);`},{name:"Counter (optimized re-renders)",jsx:!0,code:`// The five things they're actually checking:
//   1. FUNCTIONAL UPDATES — setCount(c => c + 1), not setCount(count + 1).
//      Batched updates and stale closures both break the second form.
//   2. useCallback with an EMPTY dep array — only possible because of (1).
//   3. React.memo on children, so a re-render of the parent doesn't
//      cascade. Pointless without (2), since a fresh function prop
//      fails memo's shallow compare every time.
//   4. Bounds / step as props, and the disabled states that follow.
//   5. The stale-closure trap in setInterval.

// ---------------------------------------------------------------------
// A memoized child. Watch its render counter: it should stay at 1 while
// the count changes, because none of ITS props change.
// ---------------------------------------------------------------------
const CounterControls = React.memo(function CounterControls({
  onIncrement, onDecrement, onReset, canIncrement, canDecrement,
}) {
  const renders = React.useRef(0);
  renders.current++;

  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onDecrement} disabled={!canDecrement} style={btn}>−</button>
        <button onClick={onIncrement} disabled={!canIncrement} style={btn}>+</button>
        <button onClick={onReset} style={{ ...btn, background: "#475569" }}>Reset</button>
      </div>
      <p style={hint}>Controls rendered {renders.current}× (stays low — memo + stable callbacks)</p>
    </div>
  );
});

function Counter({ initial = 0, step = 1, min = -10, max = 10 }) {
  const [count, setCount] = React.useState(initial);
  const renders = React.useRef(0);
  renders.current++;

  // FUNCTIONAL UPDATES are what let these deps be empty. If we wrote
  // setCount(count + step) we'd need \`count\` in the deps, the callbacks
  // would be new on every render, and React.memo above would never bail out.
  const increment = React.useCallback(
    () => setCount((c) => Math.min(max, c + step)),
    [step, max],
  );
  const decrement = React.useCallback(
    () => setCount((c) => Math.max(min, c - step)),
    [step, min],
  );
  const reset = React.useCallback(() => setCount(initial), [initial]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#e2e8f0", maxWidth: 460 }}>
      <h2 style={{ marginTop: 0 }}>Counter</h2>

      <p style={{ fontSize: 48, margin: "8px 0", fontVariantNumeric: "tabular-nums" }}
         aria-live="polite" aria-atomic="true">
        {count}
      </p>
      <p style={hint}>range {min}…{max}, step {step} · parent rendered {renders.current}×</p>

      <CounterControls
        onIncrement={increment}
        onDecrement={decrement}
        onReset={reset}
        canIncrement={count + step <= max}
        canDecrement={count - step >= min}
      />

      <AutoCounter />

      <details style={{ marginTop: 20, fontSize: 13, color: "#94a3b8" }}>
        <summary style={{ cursor: "pointer" }}>The three traps they probe</summary>
        <ol style={{ lineHeight: 1.8 }}>
          <li><b>Batching.</b> Calling setCount(count + 1) twice in one handler
              increments by ONE, because both reads see the same \`count\`.
              With setCount(c => c + 1) it increments by two. Try it.</li>
          <li><b>Stale closure in an interval.</b> See AutoCounter below —
              an empty-dep useEffect captures \`count\` once, forever.
              The functional updater is the fix; a ref is the alternative.</li>
          <li><b>memo without stable props is a no-op.</b> Remove the
              useCallback wrappers and the Controls render count climbs with
              every click. That's the pairing most candidates miss.</li>
        </ol>
      </details>
    </div>
  );
}

// ---------------------------------------------------------------------
// The stale-closure demo. The functional updater means this interval is
// set up ONCE and still always increments from the latest value.
// ---------------------------------------------------------------------
function AutoCounter() {
  const [n, setN] = React.useState(0);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    if (!running) return;
    // setN(n + 1) here would freeze at 1 forever — \`n\` is captured once.
    const id = setInterval(() => setN((prev) => prev + 1), 500);
    return () => clearInterval(id);   // cleanup, or intervals stack up
  }, [running]);

  return (
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #334155" }}>
      <p style={{ margin: "0 0 8px" }}>Auto: <b>{n}</b></p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setRunning((r) => !r)} style={btn}>
          {running ? "Stop" : "Start"}
        </button>
        <button onClick={() => setN(0)} style={{ ...btn, background: "#475569" }}>Clear</button>
      </div>
      <p style={hint}>Interval set once; functional updater keeps it fresh.</p>
    </div>
  );
}

const btn = {
  padding: "10px 18px", borderRadius: 6, border: "none", background: "#3b82f6",
  color: "#fff", cursor: "pointer", fontSize: 15, minWidth: 44,
};
const hint = { fontSize: 12, color: "#64748b", margin: "6px 0 0" };

render(<Counter initial={0} step={1} min={-10} max={10} />);`},{name:"Search with Debounce + Cancel",jsx:!0,code:`//   type "re"  → request A starts (slow)
//   type "rea" → request B starts (fast) → renders results for "rea"
//   request A finally resolves          → OVERWRITES with results for "re"
//
// The UI now shows stale results for a query the user already changed.
// This is the single most common real-world search bug.

// ---------------------------------------------------------------------
// The custom hook they want to see you extract.
// ---------------------------------------------------------------------
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    // Cleanup runs on every change, so a new keystroke cancels the
    // pending timer. THIS is the debounce — not the setTimeout.
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

// Fake API with a deliberately variable delay, so the race is reproducible.
const ALL = ["react", "react router", "react query", "redux", "redux saga",
             "recoil", "remix", "rxjs", "vue", "svelte", "angular", "solid"];

function fakeSearch(query, signal) {
  return new Promise((resolve, reject) => {
    const delay = 200 + Math.random() * 600;
    const id = setTimeout(() => {
      if (query === "fail") reject(new Error("Search service unavailable"));
      else resolve(ALL.filter((x) => x.includes(query.toLowerCase())));
    }, delay);

    // The signal is what makes cancellation work.
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

function SearchBox() {
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  const [results, setResults] = React.useState([]);
  const [status, setStatus] = React.useState("idle"); // idle|loading|success|error|empty
  const [error, setError] = React.useState(null);
  const [callCount, setCallCount] = React.useState(0);

  React.useEffect(() => {
    if (!debouncedQuery.trim()) {
      setStatus("idle");
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    setError(null);
    setCallCount((c) => c + 1);

    fakeSearch(debouncedQuery, controller.signal)
      .then((data) => {
        setResults(data);
        setStatus(data.length ? "success" : "empty");
      })
      .catch((err) => {
        // ALWAYS distinguish an abort from a real failure. Treating an
        // abort as an error shows a spurious message and pollutes your
        // error rate with cancelled requests.
        if (err.name === "AbortError") return;
        setError(err.message);
        setStatus("error");
      });

    // Cleanup aborts the previous request whenever the query changes
    // or the component unmounts. This is what kills the race.
    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#e2e8f0", maxWidth: 480 }}>
      <h2 style={{ marginTop: 0 }}>Search</h2>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Try "re", or "fail" to see the error state'
        aria-label="Search frameworks"
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 6, fontSize: 15,
          border: "1px solid #334155", background: "#1e293b", color: "#fff",
        }}
      />

      <p style={hint}>
        keystrokes: {query.length} · API calls: {callCount} · debounced to “{debouncedQuery || "—"}”
      </p>

      {/* Live region so screen readers hear the result count change. */}
      <div aria-live="polite" aria-atomic="true" style={{ marginTop: 12, minHeight: 120 }}>
        {status === "loading" && <p style={{ color: "#94a3b8" }}>Searching…</p>}
        {status === "error"   && <p role="alert" style={{ color: "#f87171" }}>{error}</p>}
        {status === "empty"   && <p style={{ color: "#94a3b8" }}>No results for “{debouncedQuery}”.</p>}
        {status === "idle"    && <p style={{ color: "#64748b" }}>Start typing to search.</p>}
        {status === "success" && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {results.map((r) => (
              <li key={r} style={{
                padding: "8px 10px", background: "#1e293b",
                borderRadius: 6, marginBottom: 6,
              }}>{r}</li>
            ))}
          </ul>
        )}
      </div>

      <details style={{ marginTop: 16, fontSize: 13, color: "#94a3b8" }}>
        <summary style={{ cursor: "pointer" }}>Debounce vs throttle, and what to say next</summary>
        <ul style={{ lineHeight: 1.8 }}>
          <li><b>Debounce</b> waits for a pause — right for search, because you
              only care about the final query. <b>Throttle</b> fires at a fixed
              rate — right for scroll and resize, where you want steady updates.</li>
          <li><b>Five states, not two.</b> idle / loading / success / empty / error.
              Most implementations ship loading and success and call it done —
              "no results" rendered as a blank panel is a bug report.</li>
          <li><b>In production use TanStack Query.</b> It gives you the
              cancellation, caching, deduplication, retry and stale-while-revalidate
              for free. Say this — hand-rolling it is the interview exercise,
              not the recommendation.</li>
          <li><b>Don't debounce the request, debounce the VALUE.</b> Debouncing a
              callback that closes over state reintroduces stale-closure bugs;
              debouncing the value and reacting in an effect does not.</li>
        </ul>
      </details>
    </div>
  );
}

const hint = { fontSize: 12, color: "#64748b", margin: "8px 0 0" };

render(<SearchBox />);`},{name:"Modal (Portal + Focus Trap)",jsx:!0,code:`// The FIVE things a correct modal must do, and the order matters:
//   1. Render in a portal (or the top layer) so an ancestor's
//      overflow:hidden or transform can't clip it.
//   2. Move focus INTO the modal on open.
//   3. TRAP focus — Tab from the last element wraps to the first.
//   4. RETURN focus to the trigger on close. Most-forgotten step.
//   5. Escape to close, aria-modal, and lock background scroll.
//
// Two implementations below: the hand-rolled portal version (what they
// ask for) and the <dialog> version (what you should actually ship).

function Modal({ isOpen, onClose, title, children }) {
  const panelRef = React.useRef(null);
  const openerRef = React.useRef(null);

  // Remember what had focus BEFORE we opened, and restore it on close.
  // Doing this in the effect's cleanup means it also runs on unmount.
  React.useEffect(() => {
    if (!isOpen) return;
    openerRef.current = document.activeElement;

    // Focus the panel itself (tabIndex={-1}) rather than guessing at the
    // first control — announces the dialog and works when it's empty.
    panelRef.current?.focus();

    return () => openerRef.current?.focus?.();
  }, [isOpen]);

  // Escape to close + focus trap. One keydown listener on the panel.
  React.useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;

      // Recompute each time — the focusable set can change while open.
      const focusables = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll while open.
  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen) return null;

  // createPortal (from react-dom; in scope here as a bare name) renders into a different DOM node while staying
  // in the React tree — so context still flows in, and React events still
  // bubble to React ancestors even though the DOM nodes are unrelated.
  return createPortal(
    <div
      onClick={onClose}                       // click the backdrop to dismiss
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
        display: "grid", placeItems: "center", zIndex: 1000,
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        // STOP PROPAGATION so a click inside doesn't hit the backdrop
        // handler above. This is the event-bubbling bit they're testing.
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1e293b", color: "#e2e8f0", padding: 24, borderRadius: 10,
          minWidth: 320, maxWidth: 480, outline: "2px solid #3b82f6",
        }}
      >
        <h3 id="modal-title" style={{ margin: "0 0 12px" }}>{title}</h3>
        {children}
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={btn}>Confirm</button>
          <button onClick={onClose} style={{ ...btn, background: "#475569" }}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------
// The version to actually ship: <dialog> gives you the TOP LAYER, a real
// focus trap, Escape, and inert-ing of the rest of the page — for free.
// ---------------------------------------------------------------------
function NativeDialog({ title, children }) {
  const ref = React.useRef(null);
  return (
    <>
      <button onClick={() => ref.current?.showModal()} style={btn}>
        Open &lt;dialog&gt;
      </button>
      <dialog
        ref={ref}
        aria-labelledby="native-title"
        style={{
          background: "#1e293b", color: "#e2e8f0", border: "none",
          borderRadius: 10, padding: 24, maxWidth: 420,
        }}
      >
        <h3 id="native-title" style={{ marginTop: 0 }}>{title}</h3>
        {children}
        {/* method="dialog" closes the dialog with no JS at all */}
        <form method="dialog" style={{ marginTop: 16 }}>
          <button style={btn}>Close</button>
        </form>
      </dialog>
    </>
  );
}

function App() {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#e2e8f0" }}>
      <h2 style={{ marginTop: 0 }}>Modal</h2>

      {/* Deliberately inside a transformed ancestor — with position:fixed
          and no portal, the modal would be clipped to THIS box. */}
      <div style={{
        transform: "translateZ(0)", overflow: "hidden",
        border: "1px dashed #475569", borderRadius: 8, padding: 16, maxWidth: 320,
      }}>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 0 }}>
          This box has <code>transform</code> + <code>overflow:hidden</code>.
          The portal is what lets the modal escape it.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setOpen(true)} style={btn}>Open portal modal</button>
          <NativeDialog title="Native dialog">
            <p>Top layer, real focus trap, Escape — all built in.</p>
          </NativeDialog>
        </div>
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Delete project?">
        <p>This cannot be undone.</p>
        <input placeholder="Tab between me and the buttons" aria-label="Test input"
               style={{
                 width: "100%", padding: 8, borderRadius: 6, marginTop: 8,
                 border: "1px solid #334155", background: "#0f172a", color: "#fff",
               }} />
      </Modal>

      <details style={{ marginTop: 20, fontSize: 13, color: "#94a3b8" }}>
        <summary style={{ cursor: "pointer" }}>What to say about this</summary>
        <ul style={{ lineHeight: 1.8 }}>
          <li><b>Portals keep the REACT tree, move the DOM node.</b> So context
              still flows in and React events still bubble to React ancestors —
              but CSS and TAB ORDER follow the DOM. That last part is why focus
              management is manual.</li>
          <li><b>Use &lt;dialog&gt; in real code.</b> Top layer beats z-index,
              and the focus trap is where hand-rolled modals fail audits. You
              still add scroll lock and focus return.</li>
          <li><b>stopPropagation on the panel</b> is what stops a click inside
              from reaching the backdrop's close handler.</li>
          <li><b>"Triggerable from anywhere"</b> → a ModalProvider with context
              exposing openModal(content), so any component can call it without
              prop-drilling an isOpen flag.</li>
          <li><b>Don't render the modal when closed.</b> Returning null keeps
              its content out of the tab order and the accessibility tree —
              hiding with CSS leaves focusable content reachable.</li>
        </ul>
      </details>
    </div>
  );
}

const btn = {
  padding: "9px 16px", borderRadius: 6, border: "none", background: "#3b82f6",
  color: "#fff", cursor: "pointer", fontSize: 14,
};

render(<App />);`},{name:"Form with Validation",jsx:!0,code:`// The UX rule that matters most: DON'T validate on every keystroke from
// the start. Telling someone their email is invalid after they've typed
// "a" is hostile. Validate on BLUR, then live-update once the field has
// been touched. That single decision is what interviewers are listening
// for, more than the regex.

const validators = {
  name: (v) => (!v.trim() ? "Name is required" : v.trim().length < 2 ? "Name is too short" : ""),
  email: (v) =>
    !v.trim() ? "Email is required"
    // Deliberately simple. A "full" RFC 5322 regex is a red flag —
    // say you'd validate loosely and confirm by sending a real email.
    : !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(v) ? "Enter an email like name@example.com"
    : "",
  password: (v) =>
    !v ? "Password is required"
    : v.length < 8 ? "Use at least 8 characters"
    : !/[0-9]/.test(v) ? "Include at least one number"
    : "",
  confirm: (v, all) => (v !== all.password ? "Passwords don't match" : ""),
};

function useForm(initial) {
  const [values, setValues] = React.useState(initial);
  const [touched, setTouched] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  // Errors are DERIVED during render, never stored in state. Storing them
  // creates a second source of truth that drifts out of sync with values —
  // the classic bug in hand-rolled forms.
  const errors = React.useMemo(() => {
    const out = {};
    for (const key of Object.keys(validators)) {
      const msg = validators[key](values[key] ?? "", values);
      if (msg) out[key] = msg;
    }
    return out;
  }, [values]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (key) => (e) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const handleBlur = (key) => () =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  // Show an error only once the field has been touched OR we've submitted.
  const showError = (key) => Boolean(touched[key] && errors[key]);

  return { values, errors, touched, setTouched, isValid, submitting,
           setSubmitting, handleChange, handleBlur, showError };
}

function Field({ id, label, type = "text", value, error, show, onChange, onBlur, autoComplete }) {
  const errorId = \`\${id}-error\`;
  return (
    <div style={{ marginBottom: 16 }}>
      {/* A real <label htmlFor> — not a placeholder. Placeholders vanish
          on input, usually fail contrast, and aren't reliably announced. */}
      <label htmlFor={id} style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={show || undefined}
        aria-describedby={show ? errorId : undefined}
        style={{
          width: "100%", padding: "9px 12px", borderRadius: 6, fontSize: 15,
          background: "#0f172a", color: "#fff",
          border: \`1px solid \${show ? "#f87171" : "#334155"}\`,
        }}
      />
      {show && (
        // role="alert" so it's announced; the message says how to FIX it,
        // not just that something is wrong. Colour is never the only signal.
        <p id={errorId} role="alert" style={{ color: "#f87171", fontSize: 13, margin: "6px 0 0" }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

function SignupForm() {
  const f = useForm({ name: "", email: "", password: "", confirm: "" });
  const [done, setDone] = React.useState(false);
  const summaryRef = React.useRef(null);

  async function onSubmit(e) {
    e.preventDefault();

    if (!f.isValid) {
      // Mark everything touched so all errors appear at once…
      f.setTouched({ name: true, email: true, password: true, confirm: true });
      // …then move focus to the first invalid field. Users don't hunt.
      const firstBad = Object.keys(validators).find((k) => f.errors[k]);
      document.getElementById(firstBad)?.focus();
      return;
    }

    f.setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    f.setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div style={wrap}>
        <p role="status" style={{ color: "#4ade80" }}>✓ Account created for {f.values.email}</p>
      </div>
    );
  }

  const errorCount = Object.keys(f.errors).filter((k) => f.touched[k]).length;

  return (
    <form onSubmit={onSubmit} noValidate style={wrap}>
      <h2 style={{ marginTop: 0 }}>Create account</h2>

      {/* An error summary at the top is a WCAG-friendly pattern for longer
          forms — it gives a screen-reader user the count before the fields. */}
      {errorCount > 0 && (
        <p ref={summaryRef} aria-live="polite" style={{ color: "#f87171", fontSize: 13 }}>
          {errorCount} field{errorCount > 1 ? "s" : ""} need attention.
        </p>
      )}

      <Field id="name" label="Full name" autoComplete="name"
        value={f.values.name} error={f.errors.name} show={f.showError("name")}
        onChange={f.handleChange("name")} onBlur={f.handleBlur("name")} />

      <Field id="email" label="Email" type="email" autoComplete="email"
        value={f.values.email} error={f.errors.email} show={f.showError("email")}
        onChange={f.handleChange("email")} onBlur={f.handleBlur("email")} />

      <Field id="password" label="Password" type="password" autoComplete="new-password"
        value={f.values.password} error={f.errors.password} show={f.showError("password")}
        onChange={f.handleChange("password")} onBlur={f.handleBlur("password")} />

      <Field id="confirm" label="Confirm password" type="password" autoComplete="new-password"
        value={f.values.confirm} error={f.errors.confirm} show={f.showError("confirm")}
        onChange={f.handleChange("confirm")} onBlur={f.handleBlur("confirm")} />

      {/* aria-disabled rather than disabled: the button stays focusable so a
          keyboard user can reach it and discover WHY it won't submit. */}
      <button type="submit" aria-disabled={f.submitting} style={{
        ...btn, width: "100%", opacity: f.submitting ? 0.6 : 1,
      }}>
        {f.submitting ? "Creating…" : "Create account"}
      </button>

      <details style={{ marginTop: 20, fontSize: 13, color: "#94a3b8" }}>
        <summary style={{ cursor: "pointer" }}>The decisions being graded</summary>
        <ul style={{ lineHeight: 1.8 }}>
          <li><b>Validation timing.</b> On blur, then live once touched. Validating
              from the first keystroke is hostile; validating only on submit is
              slow feedback.</li>
          <li><b>Controlled vs uncontrolled.</b> Controlled (value + onChange) gives
              you live validation and derived state — the cost is a re-render per
              keystroke. Uncontrolled (refs / FormData) is faster and fine for
              submit-only validation. React Hook Form is popular precisely because
              it's uncontrolled under the hood.</li>
          <li><b>Errors are DERIVED, not stored.</b> useMemo over values — storing
              them in state creates a second source of truth that drifts.</li>
          <li><b>Accessibility is the differentiator here.</b> Real &lt;label
              htmlFor&gt;, aria-invalid, aria-describedby linking the message,
              role="alert", focus the first invalid field on failed submit,
              and autoComplete tokens.</li>
          <li><b>In production:</b> React Hook Form + Zod. One schema validates on
              the client AND the server, and you infer the TypeScript type from it.</li>
        </ul>
      </details>
    </form>
  );
}

const wrap = { padding: 24, fontFamily: "system-ui", color: "#e2e8f0", maxWidth: 420 };
const btn = {
  padding: "11px 18px", borderRadius: 6, border: "none", background: "#3b82f6",
  color: "#fff", cursor: "pointer", fontSize: 15,
};

render(<SignupForm />);`},{name:"Form with Dynamic Fields",jsx:!0,code:`let nextId = 3;

function DynamicFieldsForm() {
  // One array IS the form state. Each row carries its own id so React can
  // track it across inserts and removals.
  const [rows, setRows] = React.useState([
    { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
    { id: 2, name: "", email: "" },
  ]);
  const [touched, setTouched] = React.useState({});
  const [submitted, setSubmitted] = React.useState(null);

  const addRow = () => setRows(prev => [...prev, { id: nextId++, name: "", email: "" }]);

  const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

  // Functional update + map by id: no index arithmetic anywhere.
  const updateRow = (id, field, value) =>
    setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));

  // Errors are DERIVED on every render, never stored. Storing them means
  // keeping two things in sync, and they will drift.
  const errorsFor = (row) => {
    const e = {};
    if (!row.name.trim()) e.name = "Name is required";
    if (!row.email.trim()) e.email = "Email is required";
    else if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(row.email)) e.email = "Enter a valid email";
    return e;
  };

  const allErrors = rows.map(errorsFor);
  const isValid = allErrors.every(e => Object.keys(e).length === 0) && rows.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Reveal every error at once when someone submits a pristine form.
    const all = {};
    rows.forEach(r => { all[r.id + ":name"] = true; all[r.id + ":email"] = true; });
    setTouched(all);
    if (isValid) setSubmitted(rows);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20, fontFamily: "system-ui", maxWidth: 560 }}>
      <h3 style={{ marginTop: 0 }}>Team members</h3>

      {rows.map((row, i) => {
        const errs = allErrors[i];
        return (
          <div key={row.id} style={rowStyle}>
            <div style={{ flex: 1 }}>
              <input
                value={row.name}
                placeholder="Name"
                aria-label={"Name for member " + (i + 1)}
                aria-invalid={touched[row.id + ":name"] && !!errs.name}
                onChange={e => updateRow(row.id, "name", e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, [row.id + ":name"]: true }))}
                style={inputStyle(touched[row.id + ":name"] && errs.name)}
              />
              {touched[row.id + ":name"] && errs.name && (
                <p role="alert" style={errStyle}>{errs.name}</p>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <input
                value={row.email}
                placeholder="Email"
                aria-label={"Email for member " + (i + 1)}
                aria-invalid={touched[row.id + ":email"] && !!errs.email}
                onChange={e => updateRow(row.id, "email", e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, [row.id + ":email"]: true }))}
                style={inputStyle(touched[row.id + ":email"] && errs.email)}
              />
              {touched[row.id + ":email"] && errs.email && (
                <p role="alert" style={errStyle}>{errs.email}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeRow(row.id)}
              disabled={rows.length === 1}
              aria-label={"Remove member " + (i + 1)}
              style={removeStyle}
            >
              Remove
            </button>
          </div>
        );
      })}

      <button type="button" onClick={addRow} style={addStyle}>+ Add member</button>

      <div style={{ marginTop: 16 }}>
        <button type="submit" disabled={!isValid} style={submitStyle(isValid)}>
          Submit {rows.length} member{rows.length === 1 ? "" : "s"}
        </button>
      </div>

      {submitted && (
        <pre style={outStyle}>{JSON.stringify(submitted, null, 2)}</pre>
      )}

      <details style={{ marginTop: 20, fontSize: 13, color: "#555" }}>
        <summary style={{ cursor: "pointer" }}>Why key by id and not by index?</summary>
        <p>
          Remove the FIRST row while the second has text in it. With
          <code> key=&#123;index&#125; </code> React reuses the first row&apos;s DOM node for
          what is now a different object, so the input keeps the old value and
          the wrong row appears to have been deleted. Uncontrolled inputs,
          focus and animation state are all tied to identity, and the index is
          not an identity — it changes when the list does.
        </p>
      </details>
    </form>
  );
}

const rowStyle = {
  display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10,
};
const inputStyle = (bad) => ({
  width: "100%", padding: "8px 10px", borderRadius: 6, fontSize: 14,
  border: "1px solid " + (bad ? "#ef4444" : "#d4d4d8"), boxSizing: "border-box",
});
const errStyle = { color: "#ef4444", fontSize: 12, margin: "4px 0 0" };
const removeStyle = {
  padding: "8px 12px", borderRadius: 6, border: "1px solid #d4d4d8",
  background: "#fff", cursor: "pointer", fontSize: 13,
};
const addStyle = {
  padding: "8px 12px", borderRadius: 6, border: "1px dashed #9ca3af",
  background: "#fff", cursor: "pointer", fontSize: 14,
};
const submitStyle = (ok) => ({
  padding: "10px 18px", borderRadius: 6, border: "none", fontSize: 15,
  background: ok ? "#3b82f6" : "#cbd5e1", color: "#fff",
  cursor: ok ? "pointer" : "not-allowed",
});
const outStyle = {
  marginTop: 16, background: "#f4f4f5", padding: 12, borderRadius: 8,
  fontSize: 12, overflowX: "auto",
};

render(<DynamicFieldsForm />);`},{name:"Multi-Step Form (Wizard)",jsx:!0,code:`const STEPS = ["Account", "Profile", "Review"];

// Validation lives per step, so "can I advance?" is one lookup.
const validators = [
  (d) => {
    const e = {};
    if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(d.email)) e.email = "Enter a valid email";
    if (d.password.length < 8) e.password = "At least 8 characters";
    return e;
  },
  (d) => {
    const e = {};
    if (!d.fullName.trim()) e.fullName = "Name is required";
    if (d.country === "") e.country = "Pick a country";
    return e;
  },
  () => ({}),
];

function Wizard() {
  const [step, setStep] = React.useState(0);
  // ONE object for every step. The step components are unmounted as you move
  // on, so state cannot live inside them or it is lost on Back.
  const [data, setData] = React.useState({
    email: "", password: "", fullName: "", country: "",
  });
  const [showErrors, setShowErrors] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const set = (field) => (e) => setData(d => ({ ...d, [field]: e.target.value }));

  const errors = validators[step](data);
  const canAdvance = Object.keys(errors).length === 0;

  const next = () => {
    if (!canAdvance) { setShowErrors(true); return; }
    setShowErrors(false);
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };
  // Back never validates — the user is retreating, not committing.
  const back = () => { setShowErrors(false); setStep(s => Math.max(s - 1, 0)); };

  const submit = () => setDone(true);

  if (done) {
    return (
      <div style={wrap}>
        <h3 style={{ marginTop: 0 }}>Submitted</h3>
        <pre style={pre}>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <ol style={bar}>
        {STEPS.map((label, i) => (
          <li key={label} style={pill(i, step)} aria-current={i === step ? "step" : undefined}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div>
          <Field label="Email" value={data.email} onChange={set("email")}
                 error={showErrors && errors.email} />
          <Field label="Password" type="password" value={data.password}
                 onChange={set("password")} error={showErrors && errors.password} />
        </div>
      )}

      {step === 1 && (
        <div>
          <Field label="Full name" value={data.fullName} onChange={set("fullName")}
                 error={showErrors && errors.fullName} />
          <label style={{ display: "block", marginBottom: 12 }}>
            <span style={lbl}>Country</span>
            <select value={data.country} onChange={set("country")} style={input(showErrors && errors.country)}>
              <option value="">Select…</option>
              <option value="in">India</option>
              <option value="uk">United Kingdom</option>
              <option value="us">United States</option>
            </select>
            {showErrors && errors.country && <p role="alert" style={err}>{errors.country}</p>}
          </label>
        </div>
      )}

      {step === 2 && (
        <div>
          <p style={{ color: "#555", fontSize: 14 }}>Check everything before submitting:</p>
          <pre style={pre}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={back} disabled={step === 0} style={btn(step !== 0)}>Back</button>
        {step < STEPS.length - 1
          ? <button onClick={next} style={btn(true)}>Next</button>
          : <button onClick={submit} style={btn(true)}>Submit</button>}
      </div>

      {showErrors && !canAdvance && (
        <p role="alert" style={{ ...err, marginTop: 12 }}>Fix the fields above to continue.</p>
      )}
    </div>
  );
}

function Field({ label, value, onChange, error, type }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={lbl}>{label}</span>
      <input type={type || "text"} value={value} onChange={onChange}
             aria-invalid={!!error} style={input(error)} />
      {error && <p role="alert" style={err}>{error}</p>}
    </label>
  );
}

const wrap = { padding: 20, fontFamily: "system-ui", maxWidth: 460 };
const bar = { display: "flex", gap: 8, listStyle: "none", padding: 0, margin: "0 0 20px" };
const pill = (i, step) => ({
  flex: 1, textAlign: "center", fontSize: 13, padding: "6px 4px", borderRadius: 999,
  background: i === step ? "#3b82f6" : i < step ? "#dbeafe" : "#f4f4f5",
  color: i === step ? "#fff" : i < step ? "#1d4ed8" : "#9ca3af",
});
const lbl = { display: "block", fontSize: 13, marginBottom: 4, color: "#374151" };
const input = (bad) => ({
  width: "100%", padding: "8px 10px", borderRadius: 6, fontSize: 14, boxSizing: "border-box",
  border: "1px solid " + (bad ? "#ef4444" : "#d4d4d8"),
});
const err = { color: "#ef4444", fontSize: 12, margin: "4px 0 0" };
const btn = (on) => ({
  padding: "9px 16px", borderRadius: 6, border: "none", fontSize: 14,
  background: on ? "#3b82f6" : "#cbd5e1", color: "#fff",
  cursor: on ? "pointer" : "not-allowed",
});
const pre = { background: "#f4f4f5", padding: 12, borderRadius: 8, fontSize: 12, overflowX: "auto" };

render(<Wizard />);`},{name:"Theme Switcher (dark/light)",jsx:!0,code:`// THREE states, not two. This is the part most implementations get wrong:
//   'light'  — user explicitly chose light
//   'dark'   — user explicitly chose dark
//   'system' — follow the OS, and KEEP following it if the OS changes
// A boolean isDark cannot represent "system", so the user's explicit
// choice gets lost the moment their OS switches at sunset.

const STORAGE_KEY = "theme-preference";

// ---------------------------------------------------------------------
// THE FOUC FIX. In a real app this goes in index.html as a BLOCKING
// inline <script> in <head>, before any CSS or JS. It must run before
// first paint — a useEffect runs AFTER, which is exactly why the flash
// happens. This is the single most-asked follow-up on this question.
//
//   <script>
//     (function () {
//       try {
//         var s = localStorage.getItem('theme-preference');
//         var dark = s === 'dark' ||
//           ((!s || s === 'system') &&
//            matchMedia('(prefers-color-scheme: dark)').matches);
//         document.documentElement.dataset.theme = dark ? 'dark' : 'light';
//       } catch (e) {}   // localStorage can throw — see readStored()
//     })();
//   <\/script>
//
// It's inline (not a module) and blocking BY DESIGN. It costs ~1ms of
// render-blocking time to avoid a visible flash, which is the right trade.
// ---------------------------------------------------------------------

// localStorage can THROW, not just return null: Safari private mode,
// blocked cookies, or a full quota. Every access needs a try/catch.
function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    return "system";   // storage unavailable — degrade, don't crash
  }
}

function writeStored(value) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch { /* ignore */ }
}

const ThemeContext = React.createContext(null);

function ThemeProvider({ children }) {
  // Lazy initialiser so localStorage is read ONCE, not on every render.
  const [preference, setPreference] = React.useState(readStored);
  const [systemDark, setSystemDark] = React.useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
  );

  // Keep following the OS while preference is 'system'. Without this
  // listener the theme is only correct at page load.
  React.useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;

  React.useEffect(() => {
    // Set an attribute on the ROOT and let CSS variables do the work.
    // No re-render of consumers, no inline styles, and it cascades into
    // shadow DOM — which a JS theme object cannot do.
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved; // native controls
    writeStored(preference);
  }, [resolved, preference]);

  // Memoized so consumers don't re-render on every provider render.
  const value = React.useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const ctx = React.useContext(ThemeContext);
  // Throwing here beats returning undefined — the error names the mistake.
  if (!ctx) throw new Error("useTheme must be used inside a ThemeProvider");
  return ctx;
}

function ThemeToggle() {
  const { preference, resolved, setPreference } = useTheme();
  const options = ["light", "system", "dark"];

  return (
    <div role="radiogroup" aria-label="Colour theme" style={{ display: "flex", gap: 6 }}>
      {options.map((opt) => (
        <button
          key={opt}
          role="radio"
          aria-checked={preference === opt}
          onClick={() => setPreference(opt)}
          style={{
            ...btn,
            background: preference === opt ? "var(--accent)" : "var(--surface-2)",
            color: preference === opt ? "#fff" : "var(--text)",
          }}
        >
          {opt === "light" ? "☀ Light" : opt === "dark" ? "☾ Dark" : "⚙ System"}
        </button>
      ))}
      <span style={{ fontSize: 12, color: "var(--muted)", alignSelf: "center", marginLeft: 8 }}>
        resolved: <b>{resolved}</b>
      </span>
    </div>
  );
}

function Demo() {
  const { resolved } = useTheme();

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", background: "var(--bg)", color: "var(--text)", minHeight: 320 }}>
      {/* Tokens defined on :root, redefined per [data-theme]. Components
          reference SEMANTIC names (--bg, --text), never raw colours. */}
      <style>{\`
        :root {
          --bg: #ffffff; --surface: #f1f5f9; --surface-2: #e2e8f0;
          --text: #0f172a; --muted: #64748b; --accent: #2563eb;
        }
        :root[data-theme="dark"] {
          --bg: #0f172a; --surface: #1e293b; --surface-2: #334155;
          --text: #e2e8f0; --muted: #94a3b8; --accent: #3b82f6;
        }
        /* No transition on load, or you animate the initial paint. */
        body { transition: background-color .2s ease, color .2s ease; }
      \`}</style>

      <h2 style={{ marginTop: 0 }}>Theme Switcher</h2>
      <ThemeToggle />

      <div style={{
        marginTop: 20, padding: 16, borderRadius: 8,
        background: "var(--surface)", border: "1px solid var(--surface-2)",
      }}>
        <p style={{ margin: 0 }}>Currently rendering the <b>{resolved}</b> palette.</p>
        <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 13 }}>
          Pick “System”, then change your OS appearance — it follows live.
        </p>
      </div>

      <details style={{ marginTop: 20, fontSize: 13, color: "var(--muted)" }}>
        <summary style={{ cursor: "pointer" }}>The four things they probe</summary>
        <ul style={{ lineHeight: 1.8 }}>
          <li><b>The flash (FOUC).</b> A useEffect runs after first paint, so you
              see the wrong theme for a frame. Fix: a blocking inline script in
              &lt;head&gt; that sets data-theme before any CSS loads. See the
              comment block at the top.</li>
          <li><b>Three states, not a boolean.</b> light / dark / <i>system</i>.
              With isDark you can't represent "follow the OS", so the user's
              choice breaks when their OS switches.</li>
          <li><b>CSS variables, not a JS theme object.</b> Variables cascade,
              cost no re-render, need no context in leaf components, and pierce
              shadow DOM. Switching theme is one attribute on &lt;html&gt;.</li>
          <li><b>localStorage can THROW.</b> Safari private mode and blocked
              cookies raise on access — not return null. Wrap every read and
              write in try/catch and render correctly with no stored value.</li>
          <li><b>Also:</b> set <code>color-scheme</code> so native scrollbars and
              form controls follow; memoize the context value or every consumer
              re-renders; and don't transition on first paint.</li>
        </ul>
      </details>
    </div>
  );
}

const btn = {
  padding: "8px 14px", borderRadius: 6, border: "1px solid var(--surface-2)",
  cursor: "pointer", fontSize: 13,
};

render(
  <ThemeProvider>
    <Demo />
  </ThemeProvider>
);`},{name:"Button (variants + sizes)",jsx:!0,code:`const VARIANTS = {
  primary:   { background: "#4f46e5", color: "#fff",     border: "1px solid #4f46e5" },
  secondary: { background: "#fff",    color: "#1e293b",  border: "1px solid #cbd5e1" },
  ghost:     { background: "transparent", color: "#4f46e5", border: "1px solid transparent" },
  danger:    { background: "#dc2626", color: "#fff",     border: "1px solid #dc2626" },
};

const SIZES = {
  sm: { fontSize: 12, padding: "5px 10px",  borderRadius: 6,  gap: 5 },
  md: { fontSize: 14, padding: "8px 14px",  borderRadius: 8,  gap: 6 },
  lg: { fontSize: 16, padding: "11px 20px", borderRadius: 10, gap: 8 },
};

// A lookup, not a switch. Adding a variant is one line and cannot forget
// a branch; an if-chain silently falls through to the default instead.
function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  iconOnly = false,
  as: Tag = "button",
  children,
  style,
  ref,
  onClick,
  type,
  ...rest                      // everything else reaches the DOM node
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  // Disabled and loading look the same but are not the same thing:
  // loading means "your click was accepted, wait", disabled means "not
  // available". Both must block activation; only loading is aria-busy.
  const inert = disabled || loading;

  // A native <button> gets the disabled attribute. Anything else does not
  // have one, so it needs the ARIA equivalent plus a guarded handler.
  const isNative = Tag === "button";

  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: s.gap,
    fontSize: s.fontSize,
    fontWeight: 600,
    fontFamily: "inherit",
    lineHeight: 1.2,
    padding: iconOnly ? s.padding.split(" ")[0] + " " + s.padding.split(" ")[0] : s.padding,
    borderRadius: s.borderRadius,
    cursor: inert ? "not-allowed" : "pointer",
    opacity: inert ? 0.6 : 1,
    textDecoration: "none",
    transition: "filter 120ms ease",
  };

  // rest is spread FIRST so the guarded handler below cannot be clobbered
  // by a consumer passing onClick. Spread it last and disabled stops working
  // on any element that has no native disabled attribute.
  return (
    <Tag
      ref={ref}
      {...rest}
      // A <button> inside a <form> defaults to type="submit". Forgetting
      // this is the single most common bug in a hand-rolled Button: every
      // secondary action in the form submits it.
      type={isNative ? type || "button" : undefined}
      disabled={isNative ? inert : undefined}
      aria-disabled={!isNative && inert ? true : undefined}
      aria-busy={loading || undefined}
      onClick={(e) => {
        if (inert) { e.preventDefault(); return; }
        if (onClick) onClick(e);
      }}
      style={{ ...base, ...v, ...style }}
    >
      {loading && <Spinner size={s.fontSize} />}
      {children}
    </Tag>
  );
}

function Spinner({ size }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size, height: size, flexShrink: 0,
        border: "2px solid currentColor",
        borderTopColor: "transparent",
        borderRadius: "50%",
        display: "inline-block",
        animation: "btn-spin 700ms linear infinite",
      }}
    />
  );
}

function Demo() {
  const [busy, setBusy] = React.useState(false);
  const [log, setLog] = React.useState([]);
  const firstRef = React.useRef(null);
  const nextId = React.useRef(0);

  // An id, not the array index — the list is PREPENDED, so index is not identity.
  const say = (m) => setLog((l) => [{ id: nextId.current++, text: m }, ...l].slice(0, 4));

  const submit = () => {
    setBusy(true);
    say("submitting…");
    setTimeout(() => { setBusy(false); say("done"); }, 900);
  };

  const row = { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 20, maxWidth: 620 }}>
      <style>{"@keyframes btn-spin { to { transform: rotate(360deg) } }"}</style>

      <div style={row}>
        <Button ref={firstRef} onClick={() => say("primary clicked")}>Primary</Button>
        <Button variant="secondary" onClick={() => say("secondary clicked")}>Secondary</Button>
        <Button variant="ghost" onClick={() => say("ghost clicked")}>Ghost</Button>
        <Button variant="danger" onClick={() => say("danger clicked")}>Delete</Button>
      </div>

      <div style={row}>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      <div style={row}>
        <Button disabled onClick={() => say("SHOULD NOT FIRE")}>Disabled</Button>
        <Button loading={busy} onClick={submit}>{busy ? "Saving" : "Save"}</Button>
        {/* Icon-only: without aria-label a screen reader announces "button". */}
        <Button variant="secondary" iconOnly aria-label="Add item" onClick={() => say("icon clicked")}>
          <span aria-hidden="true">+</span>
        </Button>
      </div>

      <div style={row}>
        {/* Same visual component, real anchor semantics: middle-click,
            open-in-new-tab and the status bar all work, which a
            <button onClick={navigate}> throws away. */}
        <Button as="a" href="#demo" variant="ghost" onClick={() => say("navigated")}>
          Link that looks like a button
        </Button>
        <Button onClick={() => firstRef.current && firstRef.current.focus()} variant="secondary" size="sm">
          Focus the first button (ref works)
        </Button>
      </div>

      <div style={{ fontSize: 12, color: "#475569", borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
        {log.length === 0 ? "Click something." : log.map((l) => <div key={l.id}>{l.text}</div>)}
      </div>
    </div>
  );
}

render(<Demo />);

// WHAT AN INTERVIEWER IS LISTENING FOR
//   - "variant and size are closed sets" — a union type, resolved by lookup.
//     The TS version is Record<Variant, CSSProperties>, so adding a variant
//     without styling it is a compile error rather than a silent default.
//   - ...rest and ref, so the component is a drop-in for <button>. A Button
//     that cannot take data-testid or onMouseEnter gets forked within a month.
//   - loading is not disabled. Announce it with aria-busy, keep the label
//     stable, and do not let the width jump when the spinner appears.
//   - type="button" by default.
//   - The polymorphic escape hatch: a link is a link. Production libraries
//     use asChild (Radix) or a render prop rather than "as", because "as"
//     cannot merge props onto a component the consumer already built.`},{name:"Nested Comments (recursive replies)",jsx:!0,code:`// THE KEY DECISION IS THE DATA SHAPE.
//   Nested (replies inside replies): easy to render, painful to update. Adding
//     a reply means copying every object on the path down to it, and finding a
//     comment by id means searching the whole tree.
//   Flat, keyed by id (used here, often called "normalised"):
//     byId:    { c1: { id, author, text, parentId, childIds: ["c2"] }, ... }
//     rootIds: ["c1", "c4"]
//   Adding a reply touches exactly two entries: the new comment and its parent.
//   Servers usually send comments flat with a parentId anyway.

// What an API typically returns: a flat list, each with its parent's id.
const FROM_SERVER = [
  { id: "c1", parentId: null, author: "Asha",  text: "Should the design system ship its own icons?" },
  { id: "c2", parentId: "c1", author: "Ravi",  text: "Yes, one set keeps every product consistent." },
  { id: "c3", parentId: "c2", author: "Meera", text: "Only if someone owns updating them." },
  { id: "c4", parentId: "c1", author: "Sam",   text: "We could wrap an open-source set instead." },
  { id: "c5", parentId: null, author: "Lena",  text: "Separate question: do we need dark mode tokens first?" },
];

function normalise(list) {
  const byId = {};
  const rootIds = [];
  for (const c of list) byId[c.id] = { ...c, childIds: [] };
  for (const c of list) {
    if (c.parentId) byId[c.parentId].childIds.push(c.id);
    else rootIds.push(c.id);
  }
  return { byId, rootIds };
}

// A tiny store, so each <Comment> can subscribe to ITS OWN entry.
// When a reply is added, only the parent's entry changes, so only the parent
// re-renders. Passing the whole byId object down as a prop would re-render
// every comment on every change.
function createCommentStore(list) {
  let state = normalise(list);
  let nextId = 100;
  const listeners = new Set();

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getComment: (id) => state.byId[id],
    getRootIds: () => state.rootIds,
    addReply(parentId, author, text) {
      const id = "c" + nextId++;       // a real app gets the id from the server
      const reply = { id, parentId, author, text, childIds: [] };
      const parent = state.byId[parentId];
      state = {
        rootIds: state.rootIds,
        byId: {
          ...state.byId,
          [id]: reply,
          [parentId]: { ...parent, childIds: [...parent.childIds, id] },   // a NEW object only for the parent
        },
      };
      listeners.forEach((listener) => listener());
    },
  };
}

const store = createCommentStore(FROM_SERVER);

function useComment(id) {
  return React.useSyncExternalStore(store.subscribe, () => store.getComment(id));
}

const MAX_INDENT_DEPTH = 4;   // deeper replies stop indenting so text never gets squeezed

// Recursive: a Comment renders its children as Comments.
// memo + a single string prop means a comment only re-renders when its own
// entry in the store changes.
const Comment = React.memo(function Comment({ id, depth }) {
  const comment = useComment(id);
  const [collapsed, setCollapsed] = React.useState(false);
  const [replying, setReplying] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  // Watch the console: replying logs only the parent and the new reply.
  React.useEffect(() => {
    console.log("rendered", id);
  });

  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    store.addReply(id, "You", draft.trim());
    setDraft("");
    setReplying(false);
  };

  const replies = comment.childIds.length;
  const small = { background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: 12, padding: 0 };

  return (
    <li style={{ listStyle: "none", marginTop: 10 }}>
      <div style={{ borderLeft: "2px solid #334155", paddingLeft: 10 }}>
        <div style={{ fontSize: 13, color: "#94a3b8" }}>{comment.author}</div>
        <div style={{ fontSize: 14, margin: "2px 0 4px" }}>{comment.text}</div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={small} onClick={() => setReplying((r) => !r)}>Reply</button>
          {replies > 0 && (
            <button style={small} aria-expanded={!collapsed} onClick={() => setCollapsed((c) => !c)}>
              {collapsed ? "Show " + replies + (replies === 1 ? " reply" : " replies") : "Hide replies"}
            </button>
          )}
        </div>
        {replying && (
          <form onSubmit={submit} style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={"Reply to " + comment.author}
              placeholder={"Reply to " + comment.author}
              autoFocus
              style={{ flex: 1, padding: 6, borderRadius: 4, border: "1px solid #475569", background: "#0f172a", color: "#fff" }}
            />
            <button type="submit" style={{ padding: "6px 10px" }}>Post</button>
          </form>
        )}
      </div>
      {replies > 0 && !collapsed && (
        <ul style={{ margin: 0, paddingLeft: depth < MAX_INDENT_DEPTH ? 20 : 0 }}>
          {comment.childIds.map((childId) => (
            // key = the comment's id, never the array index. With index keys,
            // a new reply inserted above others would hand its neighbours'
            // collapsed/draft state to the wrong comment.
            <Comment key={childId} id={childId} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
});

function Thread() {
  const rootIds = React.useSyncExternalStore(store.subscribe, store.getRootIds);
  return (
    <ul style={{ margin: 0, padding: 0 }}>
      {rootIds.map((id) => <Comment key={id} id={id} depth={0} />)}
    </ul>
  );
}

function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff", maxWidth: 560 }}>
      <h2>Comments</h2>
      <Thread />
    </div>
  );
}

render(<App />);

// FOLLOW-UPS INTERVIEWERS ASK
//   - Very deep threads: stop at a depth and show "Continue this thread",
//     which loads that branch on its own page (what Reddit does).
//   - Thousands of comments: load replies on demand ("Show 24 replies" fetches
//     them), and virtualise the top level.
//   - Optimistic posting: add the reply with a temporary id and a "sending"
//     state, then swap in the server id. See the Optimistic UI template.
//   - Recursion limit: rendering is recursive, but the data is not. A cycle in
//     the data (a comment that is its own ancestor) would recurse forever, so
//     validate parentIds when normalising.`},{name:"Sidebar Navigation (responsive + submenus)",jsx:!0,code:`// CSS OR JAVASCRIPT FOR "RESPONSIVE"?
//   Layout (widths, hiding, stacking) belongs in CSS media queries.
//   Use a JavaScript media query only where BEHAVIOUR differs: here, the
//   drawer has open/closed state, a backdrop and Escape handling that the
//   desktop sidebar does not need. With server rendering, remember the server
//   cannot know the screen width, so render the desktop version by default
//   and let the client switch after mounting.
//
// The preview pane is narrower than your window, so use the toggle at the top
// to see the mobile layout.

const NAV = [
  { label: "Dashboard", path: "/dashboard" },
  {
    label: "Projects",
    children: [
      { label: "All projects", path: "/projects" },
      { label: "Archived", path: "/projects/archived" },
    ],
  },
  {
    label: "Team",
    children: [
      { label: "Members", path: "/team/members" },
      { label: "Roles", path: "/team/roles" },
    ],
  },
  { label: "Settings", path: "/settings" },
];

// Which section contains this path? Used to open the right submenu.
function sectionFor(path) {
  const section = NAV.find((item) => item.children && item.children.some((c) => c.path === path));
  return section ? section.label : null;
}

// Subscribes to a CSS media query. useSyncExternalStore keeps it in step with
// the browser, and the typeof guards keep it safe where matchMedia is missing
// (server rendering, some test environments).
function useMediaQuery(query) {
  const subscribe = React.useCallback((onChange) => {
    if (typeof window.matchMedia !== "function") return () => {};
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  const getSnapshot = () => typeof window.matchMedia === "function" && window.matchMedia(query).matches;
  return React.useSyncExternalStore(subscribe, getSnapshot, () => true);
}

// In a real app this is react-router's <NavLink>, which sets aria-current for you.
function NavItem({ item, currentPath, onNavigate, indent }) {
  const active = item.path === currentPath;
  return (
    <a
      href={item.path}
      aria-current={active ? "page" : undefined}
      onClick={(e) => {
        e.preventDefault();          // the router handles it; no full page load
        onNavigate(item.path);
      }}
      style={{
        display: "block", padding: "8px 12px", paddingLeft: indent ? 28 : 12, borderRadius: 6,
        textDecoration: "none", fontSize: 14,
        color: active ? "#fff" : "#cbd5e1", background: active ? "#2563eb" : "transparent",
      }}
    >
      {item.label}
    </a>
  );
}

function Section({ section, open, onToggle, currentPath, onNavigate }) {
  const id = "submenu-" + section.label.toLowerCase();
  return (
    <li>
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", padding: "8px 12px",
          background: "none", border: "none", color: "#cbd5e1", fontSize: 14, cursor: "pointer", borderRadius: 6,
        }}
      >
        {section.label}
        <span aria-hidden="true" className="nav-anim" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
      </button>
      {/* Height animation without measuring: a one-row grid goes from 0fr to 1fr.
          visibility:hidden when closed matters as much as the animation. Without
          it, the collapsed links are still reachable with Tab, and focus vanishes
          into something the user cannot see. */}
      <div
        id={id}
        className="nav-anim"
        style={{
          display: "grid", gridTemplateRows: open ? "1fr" : "0fr",
          visibility: open ? "visible" : "hidden",
          transition: "grid-template-rows 0.2s ease, visibility 0.2s",
        }}
      >
        <ul style={{ overflow: "hidden", margin: 0, padding: 0, listStyle: "none" }}>
          {section.children.map((child) => (
            <li key={child.path}>
              <NavItem item={child} currentPath={currentPath} onNavigate={onNavigate} indent />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function SidebarNav({ currentPath, onNavigate }) {
  // Start with the current page's section open. Lazy initial state: computed once.
  const [openSections, setOpenSections] = React.useState(() => new Set([sectionFor(currentPath)]));

  const toggle = (label) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  const navigate = (path) => {
    // Opening the new page's section happens HERE, in the event, not in an
    // effect that watches the path. Same result, one render, no flicker.
    const section = sectionFor(path);
    if (section) setOpenSections((prev) => new Set(prev).add(section));
    onNavigate(path);
  };

  return (
    <nav aria-label="Main">
      <ul style={{ margin: 0, padding: 8, listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((item) =>
          item.children ? (
            <Section
              key={item.label}
              section={item}
              open={openSections.has(item.label)}
              onToggle={() => toggle(item.label)}
              currentPath={currentPath}
              onNavigate={navigate}
            />
          ) : (
            <li key={item.path}>
              <NavItem item={item} currentPath={currentPath} onNavigate={navigate} />
            </li>
          )
        )}
      </ul>
    </nav>
  );
}

function Layout({ isDesktop, path, setPath }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const drawerVisible = isDesktop || drawerOpen;

  // Escape closes the drawer. The listener exists only while it is open.
  React.useEffect(() => {
    if (isDesktop || !drawerOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isDesktop, drawerOpen]);

  const onNavigate = (next) => {
    setPath(next);
    setDrawerOpen(false);            // on mobile, picking a page closes the drawer
  };

  return (
    <div style={{ position: "relative", display: "flex", height: 360, overflow: "hidden", border: "1px solid #334155", borderRadius: 8 }}>
      <aside
        className="nav-anim"
        style={{
          width: 220, flexShrink: 0, background: "#0f172a", borderRight: "1px solid #334155", zIndex: 2,
          // Desktop: part of the layout. Mobile: slides in over the page.
          position: isDesktop ? "relative" : "absolute", top: 0, bottom: 0, left: 0,
          transform: drawerVisible ? "none" : "translateX(-100%)",
          visibility: drawerVisible ? "visible" : "hidden",      // off-screen links must not take focus
          transition: "transform 0.25s ease, visibility 0.25s",
        }}
      >
        <SidebarNav currentPath={path} onNavigate={onNavigate} />
      </aside>

      {!isDesktop && drawerOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", border: "none", zIndex: 1, cursor: "pointer" }}
        />
      )}

      <main style={{ flex: 1, padding: 16, color: "#e2e8f0" }}>
        {!isDesktop && (
          <button
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-label="Open menu"
            style={{ fontSize: 20, background: "none", border: "1px solid #475569", color: "#fff", borderRadius: 6, padding: "2px 10px", cursor: "pointer" }}
          >
            ☰
          </button>
        )}
        <h3>You are on {path}</h3>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Open "Projects", pick a page, and watch the highlight and the submenus follow.</p>
      </main>
    </div>
  );
}

function App() {
  const wideScreen = useMediaQuery("(min-width: 768px)");
  const [preview, setPreview] = React.useState("auto");   // the preview pane is not your screen
  const [path, setPath] = React.useState("/team/roles");  // lives above Layout, so the key below does not reset it
  const isDesktop = preview === "auto" ? wideScreen : preview === "desktop";

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <style>{"@media (prefers-reduced-motion: reduce) { .nav-anim { transition: none !important; } }"}</style>
      <h2>Sidebar navigation</h2>
      <div role="group" aria-label="Preview layout" style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {["auto", "desktop", "mobile"].map((mode) => (
          <button
            key={mode}
            aria-pressed={preview === mode}
            onClick={() => setPreview(mode)}
            style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #475569", cursor: "pointer", background: preview === mode ? "#2563eb" : "#1e293b", color: "#fff" }}
          >
            {mode}
          </button>
        ))}
      </div>
      {/* key: switching layouts starts the drawer closed rather than half-open */}
      <Layout key={isDesktop ? "desktop" : "mobile"} isDesktop={isDesktop} path={path} setPath={setPath} />
    </div>
  );
}

render(<App />);`},{name:"Data Table (sort + filter + paginate)",jsx:!0,code:`// CLIENT-SIDE OR SERVER-SIDE?
//   Client-side (used here): every row is already in the browser, up to a few
//     thousand. Filter, then sort, then slice out one page, all in useMemo.
//   Server-side: too many rows to send. Keep the SAME state object, but turn it
//     into query parameters (?q=ali&status=active&sort=name&dir=asc&page=2&size=10)
//     and let the server return one page plus the total count. The header,
//     rows and pagination components do not change at all. The request that
//     server-side mode would send is printed under the table.

const NAMES = ["Asha", "Ravi", "Meera", "Sam", "Lena", "Omar", "Priya", "Chen", "Ines", "Tom", "Yuki", "Kofi"];
const TEAMS = ["Design", "Platform", "Payments", "Growth"];
const STATUSES = ["active", "invited", "suspended"];

// 60 predictable rows, so sorting and filtering are easy to check by eye.
const ROWS = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  name: NAMES[i % NAMES.length] + " " + String.fromCharCode(65 + (i % 26)) + ".",
  team: TEAMS[(i * 7) % TEAMS.length],
  status: STATUSES[(i * 5) % STATUSES.length],
  tickets: (i * 37) % 90,
}));

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "team", label: "Team" },
  { key: "status", label: "Status" },
  { key: "tickets", label: "Open tickets", numeric: true },
];

// ---------- all table state in one reducer ----------
// Resetting the page is part of each transition, so "filtered to 3 rows but
// still on page 5" cannot happen.
const initialState = { query: "", status: "all", sort: null, page: 1, pageSize: 10 };

function tableReducer(state, action) {
  switch (action.type) {
    case "query": return { ...state, query: action.value, page: 1 };
    case "status": return { ...state, status: action.value, page: 1 };
    case "pageSize": return { ...state, pageSize: action.value, page: 1 };
    case "page": return { ...state, page: action.value };
    case "sort": {
      // off -> ascending -> descending -> off
      const s = state.sort;
      if (!s || s.key !== action.key) return { ...state, sort: { key: action.key, dir: "asc" } };
      if (s.dir === "asc") return { ...state, sort: { key: action.key, dir: "desc" } };
      return { ...state, sort: null };
    }
    default: return state;
  }
}

// ---------- pure data pipeline: filter -> sort -> paginate ----------
function useTableRows(rows, state) {
  const filtered = React.useMemo(() => {
    const q = state.query.trim().toLowerCase();
    return rows.filter((r) =>
      (state.status === "all" || r.status === state.status) &&
      (q === "" || r.name.toLowerCase().includes(q) || r.team.toLowerCase().includes(q))
    );
  }, [rows, state.query, state.status]);

  const sorted = React.useMemo(() => {
    if (!state.sort) return filtered;
    const { key, dir } = state.sort;
    const sign = dir === "asc" ? 1 : -1;
    // Copy before sorting: sort() changes the array in place.
    return [...filtered].sort((a, b) =>
      typeof a[key] === "number" ? (a[key] - b[key]) * sign : String(a[key]).localeCompare(String(b[key])) * sign
    );
  }, [filtered, state.sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / state.pageSize));
  const page = Math.min(state.page, pageCount);        // never past the last page
  const start = (page - 1) * state.pageSize;
  return { pageRows: sorted.slice(start, start + state.pageSize), total: sorted.length, page, pageCount };
}

// ---------- presentational pieces: props in, events out ----------
function TableHeader({ columns, sort, onSort }) {
  return (
    <thead>
      <tr>
        {columns.map((col) => {
          const dir = sort && sort.key === col.key ? sort.dir : null;
          return (
            // aria-sort tells a screen reader which column is sorted and how.
            <th key={col.key} aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : undefined}
              style={{ textAlign: col.numeric ? "right" : "left", padding: 0, borderBottom: "1px solid #475569" }}>
              {/* A real <button> inside the header: focusable and keyboard-operable for free. */}
              <button onClick={() => onSort(col.key)}
                style={{ width: "100%", textAlign: "inherit", padding: "8px 10px", background: "none", border: "none", color: "#e2e8f0", fontWeight: 600, cursor: "pointer" }}>
                {col.label} <span aria-hidden="true">{dir === "asc" ? "▲" : dir === "desc" ? "▼" : "↕"}</span>
              </button>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

const TableRow = React.memo(function TableRow({ row, columns }) {
  return (
    <tr>
      {columns.map((col) => (
        <td key={col.key} style={{ padding: "6px 10px", textAlign: col.numeric ? "right" : "left", borderBottom: "1px solid #1e293b" }}>
          {row[col.key]}
        </td>
      ))}
    </tr>
  );
});

function Pagination({ page, pageCount, pageSize, total, onPage, onPageSize }) {
  const btn = { padding: "4px 10px", borderRadius: 4, border: "1px solid #475569", background: "#1e293b", color: "#fff", cursor: "pointer" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, fontSize: 13, color: "#cbd5e1", flexWrap: "wrap" }}>
      <button style={btn} onClick={() => onPage(page - 1)} disabled={page <= 1}>Previous</button>
      <span aria-live="polite">Page {page} of {pageCount} ({total} rows)</span>
      <button style={btn} onClick={() => onPage(page + 1)} disabled={page >= pageCount}>Next</button>
      <label style={{ marginLeft: "auto" }}>
        Rows per page{" "}
        <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
          {[5, 10, 20].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
    </div>
  );
}

// What server-side mode would request. Same state, different transport.
function toQueryString(state) {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.status !== "all") params.set("status", state.status);
  if (state.sort) { params.set("sort", state.sort.key); params.set("dir", state.sort.dir); }
  params.set("page", String(state.page));
  params.set("size", String(state.pageSize));
  return "/api/users?" + params.toString();
}

function DataTable({ rows, columns }) {
  const [state, dispatch] = React.useReducer(tableReducer, initialState);
  const { pageRows, total, page, pageCount } = useTableRows(rows, state);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={state.query}
          onChange={(e) => dispatch({ type: "query", value: e.target.value })}
          placeholder="Search name or team"
          aria-label="Search name or team"
          style={{ flex: 1, padding: 6, borderRadius: 4, border: "1px solid #475569", background: "#0f172a", color: "#fff" }}
        />
        <select aria-label="Filter by status" value={state.status} onChange={(e) => dispatch({ type: "status", value: e.target.value })}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <TableHeader columns={columns} sort={state.sort} onSort={(key) => dispatch({ type: "sort", key })} />
        <tbody>
          {pageRows.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 16, textAlign: "center", color: "#94a3b8" }}>No rows match these filters.</td></tr>
          ) : (
            // key = the row's id. With index keys, sorting would reuse the
            // wrong row's DOM and any row-level state would jump rows.
            pageRows.map((row) => <TableRow key={row.id} row={row} columns={columns} />)
          )}
        </tbody>
      </table>

      <Pagination
        page={page} pageCount={pageCount} pageSize={state.pageSize} total={total}
        onPage={(p) => dispatch({ type: "page", value: p })}
        onPageSize={(n) => dispatch({ type: "pageSize", value: n })}
      />
      <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>Server-side mode would request: {toQueryString({ ...state, page })}</p>
    </div>
  );
}

function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Team members</h2>
      <DataTable rows={ROWS} columns={COLUMNS} />
    </div>
  );
}

render(<App />);

// FOLLOW-UPS INTERVIEWERS ASK
//   - 10,000+ rows in the browser: paginating keeps the DOM small, but if you
//     must show one long list, virtualise it (render only the visible rows).
//   - Typing lag on a big dataset: wrap the query in useDeferredValue so the
//     input stays responsive while the filter catches up, or debounce it.
//     In server-side mode, debounce AND cancel stale requests (see the
//     "Search with Debounce + Cancel" template).
//   - Put the state in the URL so a filtered, sorted page can be shared and
//     survives a refresh.
//   - Sorting by several columns: sort becomes an array of { key, dir }, and
//     the comparator walks it until one key breaks the tie.`},{name:"Like Button (optimistic + rollback)",jsx:!0,code:`// NUMBER 3 IS THE TRAP.
//   The naive version sends one request per click. Three clicks means three
//   requests, which can come back in ANY order, so an old response can
//   overwrite a newer click, and a failed old request can "roll back" a change
//   the user made after it.
//   The fix here: at most ONE request in flight. Clicks made while it is
//   running just change what the user WANTS. When the request finishes, if
//   the server state still differs from what they want, send one more.
//   Five fast clicks become at most two requests, and they cannot overtake
//   each other.
//
//   Also: send the STATE (liked: true), not the action ("toggle"). Repeating
//   "set liked to true" is harmless; repeating "toggle" flips it back.

// ---------- a fake server: 600 ms per request, can be told to fail ----------
const api = {
  state: { liked: false, count: 41 },
  failNext: false,
  setLiked(liked) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (api.failNext) {
          api.failNext = false;
          reject(new Error("500 Internal Server Error"));
          return;
        }
        if (api.state.liked !== liked) {
          api.state = { liked, count: api.state.count + (liked ? 1 : -1) };
        }
        resolve({ ...api.state });          // the server's truth, count included
      }, 600);
    });
  },
};

function useOptimisticLike(initial) {
  const [shown, setShown] = React.useState(initial);   // what the user sees
  const [error, setError] = React.useState(null);
  const [requests, setRequests] = React.useState(0);

  // Refs, not state: these are read by an async loop, which must see the
  // latest value right now, not the value from the render that started it.
  const confirmed = React.useRef(initial);        // last state the server confirmed
  const wanted = React.useRef(initial.liked);     // what the user wants right now
  const inFlight = React.useRef(false);

  const sync = async () => {
    inFlight.current = true;
    try {
      while (wanted.current !== confirmed.current.liked) {
        setRequests((n) => n + 1);
        confirmed.current = await api.setLiked(wanted.current);
      }
      setShown(confirmed.current);                // settle on the server's real count
    } catch {
      wanted.current = confirmed.current.liked;   // roll back to what we KNOW is saved
      setShown(confirmed.current);
      setError("Could not save your like, so it was undone. Please try again.");
    } finally {
      inFlight.current = false;
    }
  };

  const toggle = () => {
    setError(null);
    wanted.current = !wanted.current;
    const liked = wanted.current;
    setShown((prev) => ({ liked, count: prev.count + (liked ? 1 : -1) }));   // optimistic
    if (!inFlight.current) sync();                // otherwise the running loop picks it up
  };

  return { shown, error, requests, toggle };
}

function LikeButton() {
  const { shown, error, requests, toggle } = useOptimisticLike({ liked: false, count: 41 });

  return (
    <div>
      <button
        onClick={toggle}
        aria-pressed={shown.liked}           // the label stays "Like"; the state is pressed or not
        aria-label="Like"
        style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999,
          border: "1px solid #475569", background: shown.liked ? "#be123c" : "#1e293b", color: "#fff",
          fontSize: 16, cursor: "pointer",
        }}
      >
        <span aria-hidden="true">{shown.liked ? "♥" : "♡"}</span>
        <span>{shown.count}</span>
      </button>
      <p style={{ fontSize: 13, color: "#94a3b8" }}>Requests sent: {requests}</p>
      {error && <p role="alert" style={{ color: "#fca5a5", fontSize: 14 }}>{error}</p>}
    </div>
  );
}

function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Like button</h2>
      <p style={{ color: "#94a3b8", fontSize: 14 }}>
        Click fast, several times: the heart follows every click, but only one or two requests go out.
      </p>
      <LikeButton />
      <button
        onClick={() => { api.failNext = true; }}
        style={{ marginTop: 8, padding: "6px 12px", borderRadius: 6, border: "1px solid #7f1d1d", background: "#450a0a", color: "#fecaca", cursor: "pointer" }}
      >
        Make the next request fail
      </button>
    </div>
  );
}

render(<App />);

// FOLLOW-UPS INTERVIEWERS ASK
//   - React 19 has useOptimistic for this: the optimistic value is shown while
//     an action runs and is dropped automatically when it ends, so there is no
//     manual rollback. See the "Optimistic UI Updates" template.
//   - With TanStack Query: onMutate saves the old cache value and writes the
//     new one, onError puts the saved value back, onSettled refetches.
//   - The count others see: after success we show the SERVER's count, which
//     includes other people's likes, rather than trusting our own arithmetic.
//   - Leaving the page mid-request: the request still completes on the server.
//     Nothing to undo, and React ignores state updates after unmount.`},{name:"Rate-Limited Button (throttle vs lock)",jsx:!0,code:`// WHICH TOOL FOR A BUTTON?
//   Debounce: waits until the clicks STOP, then runs once. Right for a search
//     box. Wrong for a button: the first click appears to do nothing, so people
//     click again.
//   Throttle: runs on the first click, then ignores clicks for a fixed time.
//     Right for "Refresh" or "Load more", where repeating is fine but not
//     ten times a second.
//   In-flight lock: runs on the first click and ignores clicks until THAT
//     request finishes. Right for Submit, Pay, Save: the goal is "exactly once",
//     and no fixed time window can promise that, because the request may take
//     longer than the window.
//
// lodash or custom? lodash's throttle/debounce are fine, but in React you must
//   create them ONCE (useMemo or useRef), or every render makes a new throttled
//   function with a fresh timer, which throttles nothing. Cancel them on unmount.

// A fake API that takes 800 ms and counts every call it receives.
function createApi() {
  let calls = 0;
  return {
    get calls() { return calls; },
    save() {
      calls++;
      return new Promise((resolve) => setTimeout(resolve, 800));
    },
  };
}

// ---------- throttle, leading edge: first call runs, the rest are dropped for ms milliseconds ----------
function useThrottledCallback(fn, ms) {
  const fnRef = React.useRef(fn);
  const lastRun = React.useRef(0);
  React.useEffect(() => { fnRef.current = fn; });   // always call the latest fn

  // useCallback with [ms]: the SAME throttled function on every render.
  return React.useCallback(() => {
    const now = Date.now();
    if (now - lastRun.current < ms) return;          // too soon: drop this click
    lastRun.current = now;
    fnRef.current();
  }, [ms]);
}

// ---------- in-flight lock: ignore clicks until the request settles ----------
function useInFlightLock(fn) {
  const busyRef = React.useRef(false);    // the real guard
  const [busy, setBusy] = React.useState(false);   // only for showing it on screen

  const run = React.useCallback(async () => {
    // A ref, not the busy state: two clicks can land before React re-renders,
    // and both would still read busy === false. The ref changes immediately.
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await fn();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [fn]);

  return [run, busy];
}

function Counter({ label, calls }) {
  return <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}: <strong style={{ color: "#fff" }}>{calls}</strong> API calls</span>;
}

const btn = { padding: "8px 14px", borderRadius: 6, border: "1px solid #475569", background: "#334155", color: "#fff", cursor: "pointer", minWidth: 150 };

function NaiveButton() {
  const [api] = React.useState(createApi);
  const [, bump] = React.useReducer((n) => n + 1, 0);
  const onClick = () => { api.save(); bump(); };
  return <Row button={<button style={btn} onClick={onClick}>Save (no guard)</button>} counter={<Counter label="No guard" calls={api.calls} />} />;
}

function ThrottledButton() {
  const [api] = React.useState(createApi);
  const [, bump] = React.useReducer((n) => n + 1, 0);
  const throttled = useThrottledCallback(() => { api.save(); bump(); }, 1000);
  return <Row button={<button style={btn} onClick={throttled}>Refresh (throttle 1 s)</button>} counter={<Counter label="Throttled" calls={api.calls} />} />;
}

function LockedButton() {
  const [api] = React.useState(createApi);
  const save = React.useCallback(() => api.save(), [api]);
  const [run, busy] = useInFlightLock(save);
  return (
    <Row
      button={
        // aria-disabled instead of disabled: a disabled button drops keyboard
        // focus in some browsers, and the lock already ignores extra clicks.
        <button style={{ ...btn, opacity: busy ? 0.6 : 1 }} onClick={run} aria-disabled={busy} aria-busy={busy}>
          {busy ? "Saving…" : "Pay (in-flight lock)"}
        </button>
      }
      counter={<Counter label="Locked" calls={api.calls} />}
    />
  );
}

function Row({ button, counter }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>{button}{counter}</div>;
}

function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff" }}>
      <h2>Rapid clicks vs the API</h2>
      <p style={{ color: "#94a3b8", fontSize: 14 }}>Click each button five times, fast.</p>
      <NaiveButton />
      <ThrottledButton />
      <LockedButton />
    </div>
  );
}

render(<App />);

// THE PART THAT IS NOT A FRONTEND PROBLEM
//   Every guard above lives in one browser tab. Two tabs, a retry after a
//   timeout, or a slow network that resends can still deliver the same
//   request twice. For anything that must happen once (payments, orders),
//   send an idempotency key: a unique id generated once per user action and
//   sent with every retry, so the server can recognise a repeat and return
//   the first result instead of charging twice. The frontend guard is for the
//   user's experience; the idempotency key is the guarantee.`},{name:"Shopping Cart (reducer + derived totals)",jsx:!0,code:`// THREE DECISIONS THAT MAKE IT CORRECT
//   Store only { productId, quantity }. Never store the price or the total:
//     prices change, and a total you store is a total that can disagree with
//     the items. Look the price up from the catalogue and COMPUTE the totals.
//   Work in cents (whole numbers). 0.1 + 0.2 is 0.30000000000000004 in
//     JavaScript, and money must never drift by a cent.
//   One reducer owns every change, so the rules (max stock, no quantity 0)
//     live in one place instead of in every button.

// The catalogue. In a real app this comes from the API.
const PRODUCTS = {
  p1: { id: "p1", name: "Wireless Mouse", priceCents: 1999, stock: 5 },
  p2: { id: "p2", name: "Mechanical Keyboard", priceCents: 8950, stock: 2 },
  p3: { id: "p3", name: "USB-C Cable", priceCents: 799, stock: 10 },
};
const DISCOUNT_CODES = { SAVE10: 10 };   // percent off
const TAX_RATE = 0.08;
const STORAGE_KEY = "demo-cart";

// ---------- the reducer: every cart rule in one place ----------
function cartReducer(state, action) {
  switch (action.type) {
    case "add": {
      const existing = state.items.find((i) => i.productId === action.productId);
      const stock = PRODUCTS[action.productId].stock;
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.productId ? { ...i, quantity: Math.min(i.quantity + 1, stock) } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { productId: action.productId, quantity: 1 }] };
    }
    case "setQuantity": {
      const stock = PRODUCTS[action.productId].stock;
      const quantity = Math.max(1, Math.min(action.quantity, stock));   // clamp: 1 .. stock
      return {
        ...state,
        items: state.items.map((i) => (i.productId === action.productId ? { ...i, quantity } : i)),
      };
    }
    case "remove":
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
    case "applyCode":
      return { ...state, code: DISCOUNT_CODES[action.code] ? action.code : null };
    case "clear":
      return { items: [], code: null };
    default:
      return state;
  }
}

// ---------- totals are DERIVED, never stored ----------
function computeTotals(cart) {
  const lines = cart.items
    .filter((i) => PRODUCTS[i.productId])                 // skip products that no longer exist
    .map((i) => {
      const product = PRODUCTS[i.productId];
      return { ...i, product, lineCents: product.priceCents * i.quantity };
    });
  const subtotalCents = lines.reduce((sum, l) => sum + l.lineCents, 0);
  const discountCents = cart.code ? Math.round((subtotalCents * DISCOUNT_CODES[cart.code]) / 100) : 0;
  const taxCents = Math.round((subtotalCents - discountCents) * TAX_RATE);
  const totalCents = subtotalCents - discountCents + taxCents;
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { lines, subtotalCents, discountCents, taxCents, totalCents, count };
}

const formatMoney = (cents) => "$" + (cents / 100).toFixed(2);

// ---------- persistence: read once, validate, and never let storage crash the app ----------
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    // Saved data can be old, edited or from a previous version: check its shape.
    if (saved && Array.isArray(saved.items) && saved.items.every((i) => typeof i.productId === "string" && i.quantity > 0)) {
      return { items: saved.items, code: typeof saved.code === "string" ? saved.code : null };
    }
  } catch {
    // Private mode, blocked storage or corrupt JSON: start with an empty cart.
  }
  return { items: [], code: null };
}

// ---------- context: one cart, shared by the header and the page ----------
const CartContext = React.createContext(null);

function CartProvider({ children }) {
  const [cart, dispatch] = React.useReducer(cartReducer, undefined, loadCart);   // lazy: read storage once

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage full or blocked: the cart still works for this visit.
    }
  }, [cart]);

  const totals = React.useMemo(() => computeTotals(cart), [cart]);
  const value = React.useMemo(() => ({ cart, totals, dispatch }), [cart, totals]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function useCart() {
  const value = React.useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside <CartProvider>");
  return value;
}

// ---------- UI ----------
const btn = { padding: "6px 10px", borderRadius: 6, border: "1px solid #475569", background: "#334155", color: "#fff", cursor: "pointer" };

function HeaderBadge() {
  const { totals } = useCart();
  return <span aria-label={"Cart, " + totals.count + " items"} style={{ background: "#2563eb", borderRadius: 999, padding: "2px 10px" }}>🛒 {totals.count}</span>;
}

function ProductList() {
  const { cart, dispatch } = useCart();
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {Object.values(PRODUCTS).map((p) => {
        const inCart = cart.items.find((i) => i.productId === p.id);
        const atLimit = inCart && inCart.quantity >= p.stock;
        return (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1e293b", padding: 10, borderRadius: 8 }}>
            <span>{p.name} <span style={{ color: "#94a3b8" }}>{formatMoney(p.priceCents)}</span></span>
            <button style={btn} disabled={atLimit} onClick={() => dispatch({ type: "add", productId: p.id })}>
              {atLimit ? "Max in cart" : "Add to cart"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function CartView() {
  const { totals, cart, dispatch } = useCart();
  const [code, setCode] = React.useState("");

  if (totals.lines.length === 0) return <p style={{ color: "#94a3b8" }}>Your cart is empty.</p>;

  return (
    <div>
      {totals.lines.map((line) => (
        <div key={line.productId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #334155" }}>
          <span style={{ flex: 1 }}>{line.product.name}</span>
          <button style={btn} aria-label={"Decrease " + line.product.name}
            onClick={() => dispatch({ type: "setQuantity", productId: line.productId, quantity: line.quantity - 1 })}>−</button>
          <span aria-label={line.product.name + " quantity"}>{line.quantity}</span>
          <button style={btn} aria-label={"Increase " + line.product.name}
            onClick={() => dispatch({ type: "setQuantity", productId: line.productId, quantity: line.quantity + 1 })}>+</button>
          <span style={{ width: 80, textAlign: "right" }}>{formatMoney(line.lineCents)}</span>
          <button style={btn} aria-label={"Remove " + line.product.name}
            onClick={() => dispatch({ type: "remove", productId: line.productId })}>×</button>
        </div>
      ))}

      <form
        onSubmit={(e) => { e.preventDefault(); dispatch({ type: "applyCode", code: code.trim().toUpperCase() }); }}
        style={{ display: "flex", gap: 6, marginTop: 10 }}
      >
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Discount code (try SAVE10)" aria-label="Discount code"
          style={{ flex: 1, padding: 6, borderRadius: 4, border: "1px solid #475569", background: "#0f172a", color: "#fff" }} />
        <button style={btn} type="submit">Apply</button>
      </form>

      <dl style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 4, marginTop: 10, fontSize: 14 }}>
        <dt>Subtotal</dt><dd style={{ margin: 0 }}>{formatMoney(totals.subtotalCents)}</dd>
        {totals.discountCents > 0 && (<><dt>Discount ({cart.code})</dt><dd style={{ margin: 0 }}>−{formatMoney(totals.discountCents)}</dd></>)}
        <dt>Tax (8%)</dt><dd style={{ margin: 0 }}>{formatMoney(totals.taxCents)}</dd>
        <dt style={{ fontWeight: 700 }}>Total</dt><dd style={{ margin: 0, fontWeight: 700 }} data-testid="total">{formatMoney(totals.totalCents)}</dd>
      </dl>
      <button style={{ ...btn, marginTop: 10 }} onClick={() => dispatch({ type: "clear" })}>Clear cart</button>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff", maxWidth: 560 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Shop</h2>
          <HeaderBadge />
        </div>
        <ProductList />
        <h3>Cart</h3>
        <CartView />
      </div>
    </CartProvider>
  );
}

render(<App />);

// FOLLOW-UPS INTERVIEWERS ASK
//   - Logged-in users: keep the cart on the server so it follows them across
//     devices. A guest cart in localStorage is MERGED into the server cart at
//     login, rather than one silently replacing the other.
//   - Prices change while the item sits in the cart: the server recalculates
//     the total at checkout and the UI shows "the price of X changed".
//     The client total is a preview; the server's total is the one charged.
//   - Several tabs: listen for the "storage" event to pick up changes made in
//     another tab.
//   - Why Context and not Redux here: one cart, a handful of consumers, and a
//     reducer already holds the rules. The same reducer moves into a Redux
//     slice or a Zustand store unchanged if the app grows.`},{name:"File Upload (progress + cancel)",jsx:!0,code:`// WHY XMLHttpRequest AND NOT fetch?
//   fetch has no upload progress events. XMLHttpRequest does:
//   xhr.upload.onprogress fires with how many bytes have been SENT so far
//   (event.loaded) out of the total (event.total). axios uses XHR in the
//   browser, which is why its onUploadProgress works.
//
// The playground has no server, so FakeXHR below behaves like one: it
// reports progress in steps and fails files with "fail" in the name. Swap in
// the real XMLHttpRequest (the default for createXHR) and nothing else changes.
//
// SPRING BOOT SIDE: the controller takes @RequestParam("file") MultipartFile.
// Its defaults are 1 MB per file and 10 MB per request
// (spring.servlet.multipart.max-file-size / max-request-size). A bigger file
// is rejected, so raise both, and handle 413 Payload Too Large in the UI.

const MAX_BYTES = 5 * 1024 * 1024;                        // 5 MB, matching the server limit
const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];

// ---------- a fake server with the XMLHttpRequest surface we use ----------
class FakeXHR {
  constructor() {
    this.upload = { onprogress: null };
    this.onload = null;
    this.onerror = null;
    this.onabort = null;
    this.status = 0;
    this.timer = null;
  }
  open(method, url) { this.url = url; }
  send(formData) {
    const file = formData.get("file");
    const total = file.size;
    let loaded = 0;
    this.timer = setInterval(() => {
      loaded = Math.min(total, loaded + Math.ceil(total / 5));
      if (this.upload.onprogress) this.upload.onprogress({ lengthComputable: true, loaded, total });
      if (loaded >= total) {
        clearInterval(this.timer);
        this.status = file.name.includes("fail") ? 500 : 201;
        if (this.onload) this.onload();
      }
    }, 150);
  }
  abort() {
    clearInterval(this.timer);
    if (this.onabort) this.onabort();
  }
}

// ---------- the upload function: a promise, plus progress and cancel ----------
function uploadFile(file, { url, onProgress, signal, createXHR = () => new XMLHttpRequest() }) {
  return new Promise((resolve, reject) => {
    const xhr = createXHR();
    const form = new FormData();
    form.append("file", file);                 // the field name Spring's @RequestParam expects

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300
      ? resolve(xhr.status)
      : reject(new Error(xhr.status === 413 ? "File is too large for the server" : "Upload failed (" + xhr.status + ")")));
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));

    // The same AbortController pattern as fetch, so callers cancel both the same way.
    signal.addEventListener("abort", () => xhr.abort());

    xhr.open("POST", url);
    // Do NOT set Content-Type yourself. The browser adds
    // "multipart/form-data; boundary=..." and the boundary is required.
    xhr.send(form);
  });
}

function validate(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return "Only PNG, JPEG or PDF files";
  if (file.size > MAX_BYTES) return "Larger than 5 MB";
  return null;
}

// ---------- React: one row of state per file ----------
function useUploads(createXHR) {
  const [uploads, setUploads] = React.useState([]);
  const controllers = React.useRef(new Map());      // id -> AbortController

  const update = (id, patch) =>
    setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const start = (id, file) => {
    const controller = new AbortController();
    controllers.current.set(id, controller);
    update(id, { status: "uploading", progress: 0, error: null });
    uploadFile(file, {
      url: "/api/files",
      signal: controller.signal,
      createXHR,
      onProgress: (progress) => update(id, { progress }),
    })
      .then(() => update(id, { status: "done", progress: 100 }))
      .catch((err) =>
        update(id, err.name === "AbortError" ? { status: "cancelled" } : { status: "failed", error: err.message }))
      .finally(() => controllers.current.delete(id));
  };

  const addFiles = (files) => {
    const added = files.map((file, i) => ({
      id: Date.now() + "-" + i + "-" + file.name,
      file,
      progress: 0,
      error: validate(file),
      status: validate(file) ? "rejected" : "queued",
    }));
    setUploads((list) => [...list, ...added]);
    added.filter((u) => u.status === "queued").forEach((u) => start(u.id, u.file));
  };

  // Leaving the page cancels whatever is still uploading.
  React.useEffect(() => {
    const map = controllers.current;
    return () => map.forEach((c) => c.abort());
  }, []);

  return {
    uploads,
    addFiles,
    cancel: (id) => { const c = controllers.current.get(id); if (c) c.abort(); },
    retry: (u) => start(u.id, u.file),
  };
}

function UploadRow({ upload, onCancel, onRetry }) {
  const colour = { done: "#16a34a", failed: "#dc2626", rejected: "#dc2626", cancelled: "#64748b" }[upload.status] || "#2563eb";
  return (
    <li style={{ listStyle: "none", background: "#1e293b", borderRadius: 8, padding: 10, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
        <span>{upload.file.name}</span>
        <span style={{ color: "#94a3b8" }}>{upload.status === "uploading" ? upload.progress + "%" : upload.status}</span>
      </div>
      {upload.status !== "rejected" && (
        <div
          role="progressbar"
          aria-label={"Uploading " + upload.file.name}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={upload.progress}
          style={{ height: 6, background: "#334155", borderRadius: 3, marginTop: 6, overflow: "hidden" }}
        >
          <div style={{ width: upload.progress + "%", height: "100%", background: colour, transition: "width 0.15s" }} />
        </div>
      )}
      {upload.error && <p style={{ color: "#fca5a5", fontSize: 13, margin: "6px 0 0" }}>{upload.error}</p>}
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        {upload.status === "uploading" && <button onClick={() => onCancel(upload.id)}>Cancel</button>}
        {(upload.status === "failed" || upload.status === "cancelled") && <button onClick={() => onRetry(upload)}>Retry</button>}
      </div>
    </li>
  );
}

function Uploader() {
  // FakeXHR in the playground. In a real app, drop the argument.
  const { uploads, addFiles, cancel, retry } = useUploads(() => new FakeXHR());

  const sample = (name, type, kb) => new File([new Uint8Array(kb * 1024)], name, { type });

  return (
    <div>
      <label style={{ display: "block", marginBottom: 10 }}>
        Choose files{" "}
        <input type="file" multiple onChange={(e) => { addFiles([...e.target.files]); e.target.value = ""; }} />
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={() => addFiles([sample("photo.png", "image/png", 300)])}>Sample image</button>
        <button onClick={() => addFiles([sample("will-fail.pdf", "application/pdf", 200)])}>File the server rejects</button>
        <button onClick={() => addFiles([sample("notes.txt", "text/plain", 1)])}>Wrong file type</button>
      </div>
      <ul style={{ padding: 0, margin: 0 }}>
        {uploads.map((u) => <UploadRow key={u.id} upload={u} onCancel={cancel} onRetry={retry} />)}
      </ul>
    </div>
  );
}

function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#fff", maxWidth: 520 }}>
      <h2>File upload</h2>
      <Uploader />
    </div>
  );
}

render(<App />);

// FOLLOW-UPS INTERVIEWERS ASK
//   - Very large files (hundreds of MB): split them into chunks and upload
//     each separately, so a dropped connection only retries one chunk, and the
//     upload can resume. Or upload straight to storage with a pre-signed URL
//     (S3, GCS) so the file never passes through your Spring Boot service.
//   - Many files at once: limit how many upload at the same time (two or three)
//     and queue the rest, or they compete for bandwidth and all finish late.
//   - Validation on the client is for the user's convenience only. The server
//     must check type and size again, and should check the file's contents,
//     not trust its name or the type the browser reported.
//   - Progress reaching 100% means the bytes were SENT, not that the server
//     finished processing them. Show "Processing…" until the response arrives.`}]}],a=n.flatMap(e=>e.templates.map(t=>({...t,category:e.label,tag:e.tag,kind:e.kind??"template"}))),r=[{name:"JavaScript",lang:"js",description:"Plain JavaScript editor.",code:`// JavaScript playground — start fresh!

console.log("Hello, JavaScript!");

// Try anything: variables, functions, async/await, etc.
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("World"));`},{name:"TypeScript",lang:"ts",description:"Type-stripped TS via Babel — runs as JS.",code:`// TypeScript playground — types are stripped at runtime.

interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

const ana: User = { name: "Ana", age: 30 };
console.log(greet(ana));`},{name:"React",lang:"jsx",description:"React component sandbox with live preview.",code:`// React playground — your component renders to the right.

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

render(<App />);`}];export{s as ALL_PATTERNS,o as PATTERN_GROUPS,a as allTemplates,r as blankStarters,n as templateCategories};
