const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/babel-DgCu6knF.js","assets/react-DjIRecv2.js"])))=>i.map(i=>d[i]);
import{j as qt,T as Yt,_ as we}from"./index-LHmrrBW2.js";import{j as e,H as Fe,b as _t,t as Vt,x as Kt}from"./markdown-DCXN5FX8.js";import{a as Xt,g as Qt,r,R as ee,L as Zt}from"./react-DjIRecv2.js";import{p as en,X as ot,q as Nt,r as tn,R as Dt,f as nn,s as sn,P as Pt,g as it,B as At,t as vt,a as an,u as rn,A as on,L as tt,S as ln,v as cn,w as dn,x as un,h as pn,y as mn,z as gn,W as fn,D as hn}from"./icons-Cxc8BmlI.js";import{A as Mt,m as lt}from"./motion-UAUgaN-E.js";var _={},Rt;function yn(){if(Rt)return _;Rt=1;var n=_&&_.__assign||function(){return n=Object.assign||function(C){for(var g,j=1,L=arguments.length;j<L;j++){g=arguments[j];for(var O in g)Object.prototype.hasOwnProperty.call(g,O)&&(C[O]=g[O])}return C},n.apply(this,arguments)},a=_&&_.__createBinding||(Object.create?(function(C,g,j,L){L===void 0&&(L=j);var O=Object.getOwnPropertyDescriptor(g,j);(!O||("get"in O?!g.__esModule:O.writable||O.configurable))&&(O={enumerable:!0,get:function(){return g[j]}}),Object.defineProperty(C,L,O)}):(function(C,g,j,L){L===void 0&&(L=j),C[L]=g[j]})),i=_&&_.__setModuleDefault||(Object.create?(function(C,g){Object.defineProperty(C,"default",{enumerable:!0,value:g})}):function(C,g){C.default=g}),h=_&&_.__importStar||function(C){if(C&&C.__esModule)return C;var g={};if(C!=null)for(var j in C)j!=="default"&&Object.prototype.hasOwnProperty.call(C,j)&&a(g,C,j);return i(g,C),g},p=_&&_.__rest||function(C,g){var j={};for(var L in C)Object.prototype.hasOwnProperty.call(C,L)&&g.indexOf(L)<0&&(j[L]=C[L]);if(C!=null&&typeof Object.getOwnPropertySymbols=="function")for(var O=0,L=Object.getOwnPropertySymbols(C);O<L.length;O++)g.indexOf(L[O])<0&&Object.prototype.propertyIsEnumerable.call(C,L[O])&&(j[L[O]]=C[L[O]]);return j};Object.defineProperty(_,"__esModule",{value:!0});var v=h(Xt()),S=89,b=90,J=77,M=57,w=219,m=222,d=192,R=100,y=3e3,T=typeof window<"u"&&"navigator"in window&&/Win/i.test(navigator.platform),c=typeof window<"u"&&"navigator"in window&&/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform),f="npm__react-simple-code-editor__textarea",z=`
/**
 * Reset the text fill color so that placeholder is visible
 */
.`.concat(f,`:empty {
  -webkit-text-fill-color: inherit !important;
}

/**
 * Hack to apply on some CSS on IE10 and IE11
 */
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  /**
    * IE doesn't support '-webkit-text-fill-color'
    * So we use 'color: transparent' to make the text transparent on IE
    * Unlike other browsers, it doesn't affect caret color in IE
    */
  .`).concat(f,` {
    color: transparent !important;
  }

  .`).concat(f,`::selection {
    background-color: #accef7 !important;
    color: transparent !important;
  }
}
`),te=v.forwardRef(function(g,j){var L=g.autoFocus,O=g.disabled,dt=g.form,W=g.highlight,ze=g.ignoreTabKey,Le=ze===void 0?!1:ze,B=g.insertSpaces,Ie=B===void 0?!0:B,I=g.maxLength,Q=g.minLength,Be=g.name,De=g.onBlur,ut=g.onClick,pt=g.onFocus,Pe=g.onKeyDown,mt=g.onKeyUp,xe=g.onValueChange,$e=g.padding,H=$e===void 0?0:$e,We=g.placeholder,Ue=g.preClassName,gt=g.readOnly,Ge=g.required,ft=g.style,ue=g.tabSize,ve=ue===void 0?2:ue,pe=g.textareaClassName,Me=g.textareaId,qe=g.value,Y=p(g,["autoFocus","disabled","form","highlight","ignoreTabKey","insertSpaces","maxLength","minLength","name","onBlur","onClick","onFocus","onKeyDown","onKeyUp","onValueChange","padding","placeholder","preClassName","readOnly","required","style","tabSize","textareaClassName","textareaId","value"]),D=v.useRef({stack:[],offset:-1}),ke=v.useRef(null),Ye=v.useState(!0),me=Ye[0],ht=Ye[1],_e={paddingTop:typeof H=="object"?H.top:H,paddingRight:typeof H=="object"?H.right:H,paddingBottom:typeof H=="object"?H.bottom:H,paddingLeft:typeof H=="object"?H.left:H},ie=W(qe),ae=function(o,N){return o.substring(0,N).split(`
`)},Ce=v.useCallback(function(o,N){var x,k,A;N===void 0&&(N=!1);var $=D.current,V=$.stack,le=$.offset;if(V.length&&le>-1){D.current.stack=V.slice(0,le+1);var he=D.current.stack.length;if(he>R){var ce=he-R;D.current.stack=V.slice(ce,he),D.current.offset=Math.max(D.current.offset-ce,0)}}var K=Date.now();if(N){var re=D.current.stack[D.current.offset];if(re&&K-re.timestamp<y){var ye=/[^a-z0-9]([a-z0-9]+)$/i,G=(x=ae(re.value,re.selectionStart).pop())===null||x===void 0?void 0:x.match(ye),Se=(k=ae(o.value,o.selectionStart).pop())===null||k===void 0?void 0:k.match(ye);if(G!=null&&G[1]&&(!((A=Se==null?void 0:Se[1])===null||A===void 0)&&A.startsWith(G[1]))){D.current.stack[D.current.offset]=n(n({},o),{timestamp:K});return}}}D.current.stack.push(n(n({},o),{timestamp:K})),D.current.offset++},[]),Ve=v.useCallback(function(){var o=ke.current;if(o){var N=o.value,x=o.selectionStart,k=o.selectionEnd;Ce({value:N,selectionStart:x,selectionEnd:k})}},[Ce]),He=function(o){var N=ke.current;N&&(N.value=o.value,N.selectionStart=o.selectionStart,N.selectionEnd=o.selectionEnd,xe==null||xe(o.value))},ge=function(o){var N=ke.current,x=D.current.stack[D.current.offset];x&&N&&(D.current.stack[D.current.offset]=n(n({},x),{selectionStart:N.selectionStart,selectionEnd:N.selectionEnd})),Ce(o),He(o)},fe=function(){var o=D.current,N=o.stack,x=o.offset,k=N[x-1];k&&(He(k),D.current.offset=Math.max(x-1,0))},Oe=function(){var o=D.current,N=o.stack,x=o.offset,k=N[x+1];k&&(He(k),D.current.offset=Math.min(x+1,N.length-1))},Ne=function(o){if(!(Pe&&(Pe(o),o.defaultPrevented))){o.key==="Escape"&&o.currentTarget.blur();var N=o.currentTarget,x=N.value,k=N.selectionStart,A=N.selectionEnd,$=(Ie?" ":"	").repeat(ve);if(o.key==="Tab"&&!Le&&me)if(o.preventDefault(),o.shiftKey){var V=ae(x,k),le=V.length-1,he=ae(x,A).length-1,ce=x.split(`
`).map(function(Ee,Te){return Te>=le&&Te<=he&&Ee.startsWith($)?Ee.substring($.length):Ee}).join(`
`);if(x!==ce){var K=V[le];ge({value:ce,selectionStart:K!=null&&K.startsWith($)?k-$.length:k,selectionEnd:A-(x.length-ce.length)})}}else if(k!==A){var V=ae(x,k),re=V.length-1,ye=ae(x,A).length-1,K=V[re];ge({value:x.split(`
`).map(function(Qe,Ze){return Ze>=re&&Ze<=ye?$+Qe:Qe}).join(`
`),selectionStart:K&&/\S/.test(K)?k+$.length:k,selectionEnd:A+$.length*(ye-re+1)})}else{var G=k+$.length;ge({value:x.substring(0,k)+$+x.substring(A),selectionStart:G,selectionEnd:G})}else if(o.key==="Backspace"){var Se=k!==A,Ae=x.substring(0,k);if(Ae.endsWith($)&&!Se){o.preventDefault();var G=k-$.length;ge({value:x.substring(0,k-$.length)+x.substring(A),selectionStart:G,selectionEnd:G})}}else if(o.key==="Enter"){if(k===A){var Re=ae(x,k).pop(),oe=Re==null?void 0:Re.match(/^\s+/);if(oe!=null&&oe[0]){o.preventDefault();var Xe=`
`+oe[0],G=k+Xe.length;ge({value:x.substring(0,k)+Xe+x.substring(A),selectionStart:G,selectionEnd:G})}}}else if(o.keyCode===M||o.keyCode===w||o.keyCode===m||o.keyCode===d){var se=void 0;o.keyCode===M&&o.shiftKey?se=["(",")"]:o.keyCode===w?o.shiftKey?se=["{","}"]:se=["[","]"]:o.keyCode===m?o.shiftKey?se=['"','"']:se=["'","'"]:o.keyCode===d&&!o.shiftKey&&(se=["`","`"]),k!==A&&se&&(o.preventDefault(),ge({value:x.substring(0,k)+se[0]+x.substring(k,A)+se[1]+x.substring(A),selectionStart:k,selectionEnd:A+2}))}else(c?o.metaKey&&o.keyCode===b:o.ctrlKey&&o.keyCode===b)&&!o.shiftKey&&!o.altKey?(o.preventDefault(),fe()):(c?o.metaKey&&o.keyCode===b&&o.shiftKey:T?o.ctrlKey&&o.keyCode===S:o.ctrlKey&&o.keyCode===b&&o.shiftKey)&&!o.altKey?(o.preventDefault(),Oe()):o.keyCode===J&&o.ctrlKey&&(!c||o.shiftKey)&&(o.preventDefault(),ht(function(Ee){return!Ee}))}},Ke=function(o){var N=o.currentTarget,x=N.value,k=N.selectionStart,A=N.selectionEnd;Ce({value:x,selectionStart:k,selectionEnd:A},!0),xe(x)};return v.useEffect(function(){Ve()},[Ve]),v.useImperativeHandle(j,function(){return{get session(){return{history:D.current}},set session(o){D.current=o.history}}},[]),v.createElement("div",n({},Y,{style:n(n({},ne.container),ft)}),v.createElement("pre",n({className:Ue,"aria-hidden":"true",style:n(n(n({},ne.editor),ne.highlight),_e)},typeof ie=="string"?{dangerouslySetInnerHTML:{__html:ie+"<br />"}}:{children:ie})),v.createElement("textarea",{ref:function(o){return ke.current=o},style:n(n(n({},ne.editor),ne.textarea),_e),className:f+(pe?" ".concat(pe):""),id:Me,value:qe,onChange:Ke,onKeyDown:Ne,onClick:ut,onKeyUp:mt,onFocus:pt,onBlur:De,disabled:O,form:dt,maxLength:I,minLength:Q,name:Be,placeholder:We,readOnly:gt,required:Ge,autoFocus:L,autoCapitalize:"off",autoComplete:"off",autoCorrect:"off",spellCheck:!1,"data-gramm":!1}),v.createElement("style",{dangerouslySetInnerHTML:{__html:z}}))}),ne={container:{position:"relative",textAlign:"left",boxSizing:"border-box",padding:0,overflow:"hidden"},textarea:{position:"absolute",top:0,left:0,height:"100%",width:"100%",resize:"none",color:"inherit",overflow:"hidden",MozOsxFontSmoothing:"grayscale",WebkitFontSmoothing:"antialiased",WebkitTextFillColor:"transparent"},highlight:{position:"relative",pointerEvents:"none"},editor:{margin:0,border:0,background:"none",boxSizing:"inherit",display:"inherit",fontFamily:"inherit",fontSize:"inherit",fontStyle:"inherit",fontVariantLigatures:"inherit",fontWeight:"inherit",letterSpacing:"inherit",lineHeight:"inherit",tabSize:"inherit",textIndent:"inherit",textRendering:"inherit",textTransform:"inherit",whiteSpace:"pre-wrap",wordBreak:"keep-all",overflowWrap:"break-word"}};return _.default=te,_}var bn=yn();const xn=Qt(bn),vn=["Two Pointer","Sliding Window","Hash Map / Set","Stack","Recursion / D&C","Dynamic Programming","Greedy","Binary Search","Backtracking","Math / Bit","Sorting","Linked List","Closure / State","In-Place"],Sn=[{label:"Linear scans",patterns:["Two Pointer","Sliding Window","In-Place"]},{label:"Lookup",patterns:["Hash Map / Set","Stack"]},{label:"Recursive",patterns:["Recursion / D&C","Backtracking"]},{label:"Optimization",patterns:["Dynamic Programming","Greedy","Binary Search"]},{label:"Data + Misc",patterns:["Sorting","Linked List","Closure / State","Math / Bit"]}],Ct=[{label:"JavaScript Fundamentals",tag:"JS",kind:"template",templates:[{name:"Hello World",code:`// Welcome to the Code Playground!
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

render(<App />);`}]},{label:"JS Polyfills",tag:"JS",kind:"template",templates:[{name:"How to Write a Polyfill",code:`// ═══════════════════════════════════════════════════════════════
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

// (a) Don't overwrite the native:
Array.prototype.map = function () {};   // ❌ breaks every library
Array.prototype.myMap = function () {}; // ✅ safe, opt-in

// (b) Don't use the built-in inside your polyfill — that's cheating:
Array.prototype.myMap = function (cb) {
  return this.map(cb);   // ❌ defeats the point
};

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
// noted in the comments — that's the spec talking back to you.`},{name:"Array.map",code:`// Polyfill: Array.prototype.map
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
console.log("thisArg:   ", nums.myMap(function(n) { return n * this.factor; }, multiplier));`},{name:"Array.filter",code:`// Polyfill: Array.prototype.filter
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
console.log("Adults:", users.myFilter(u => u.age >= 18).myMap(u => u.name));`},{name:"Array.reduce",code:`// Polyfill: Array.prototype.reduce
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
console.log("Flatten:", nested.myReduce((a, b) => a.concat(b), []));`},{name:"Array.forEach",code:`// Polyfill: Array.prototype.forEach
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
console.log("Return value:", result); // undefined`},{name:"Array.find & findIndex",code:`// Polyfill: Array.prototype.find
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
console.log("not found: ", users.myFindIndex(u => u.name === "Dave")); // -1`},{name:"Array.some & every",code:`// Polyfill: Array.prototype.some
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
console.log("Any valid:", fields.mySome(f => f.valid));`},{name:"Array.flat & flatMap",code:`// Polyfill: Array.prototype.flat
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
console.log("All items:", orders.myFlatMap(o => o.items));`},{name:"Function.bind",code:`// Polyfill: Function.prototype.bind
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
console.log("Poly:  ", polyBound("."));`},{name:"Function.call & apply",code:`// Polyfill: Function.prototype.call
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
console.log("Max:", Math.max.myApply(null, nums));`},{name:"Promise.all",code:`// Polyfill: Promise.all
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
Promise.myAll([]).then(r => console.log("Empty:", r)); // []`},{name:"Promise.allSettled",code:`// Polyfill: Promise.allSettled
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
});`},{name:"Promise.race & any",code:`// Polyfill: Promise.race
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
]).catch(e => console.log("All rejected:", e.message));`},{name:"Array.includes",code:`// Polyfill for Array.prototype.includes
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
console.log([NaN].myIncludes(NaN));             // true — the SameValueZero difference`},{name:"Object.assign",code:`// Polyfill for Object.assign
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
console.log(Object.myAssign({}, "hello"));              // { 0: 'h', 1: 'e', 2: 'l', 3: 'l', 4: 'o' }`},{name:"Array.from",code:`// Polyfill for Array.from
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
console.log(Array.myFrom(new Map([["a", 1], ["b", 2]]))); // [['a', 1], ['b', 2]]`},{name:"Array.sort",code:`// Polyfill for Array.prototype.sort
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
// Native sort has been stable since ES2019.`},{name:"Array.indexOf / lastIndexOf",code:`// Polyfill for Array.prototype.indexOf and lastIndexOf
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
console.log([NaN].myIndexOf(NaN));                 // -1  — strict equality gotcha`},{name:"Array.reverse",code:`// Polyfill for Array.prototype.reverse
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
//   const sorted = arr.toReversed();   // returns a new array`},{name:"Array.slice",code:`// Polyfill for Array.prototype.slice
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
console.log(nested[0].x);              // 999 — same object!`},{name:"Array.splice",code:`// Polyfill for Array.prototype.splice
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
console.log(arr4);                              // [1, 2]`},{name:"Array.concat",code:`// Polyfill for Array.prototype.concat
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
console.log(concatenated);                              // [1, 2, 3]`},{name:"String.padStart / padEnd",code:`// Polyfill for String.prototype.padStart and padEnd
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
console.log(\`\${"5".myPadStart(2, "0")}:\${"7".myPadStart(2, "0")}\`);  // "05:07"`},{name:"JSON.stringify",code:`// Polyfill for JSON.stringify
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
console.log(JSON.myStringify({ a: 1, b: [1, 2] }) === JSON.stringify({ a: 1, b: [1, 2] }));   // true`},{name:"Object.keys / values / entries",code:`// Polyfill for Object.keys, Object.values, Object.entries
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
console.log(Object.myKeys(child));        // ["own"]   — proto skipped`},{name:"JSON.parse",code:`// Polyfill for JSON.parse — recursive descent parser.
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
console.log(JSON.myParse('{"name":"Ana","tags":["dev","js"],"age":30}'));`},{name:"Array.isArray",code:`// Polyfill for Array.isArray — the most reliable test.
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
console.log(typeof {});          // "object"`},{name:"Object.create",code:`// Polyfill for Object.create — creates an object with the given prototype.
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
console.log(dict.toString);                        // "no inheritance"   (no [object Object] inherited)`},{name:"Object.freeze + deepFreeze",code:`// Polyfill for Object.freeze — and the deepFreeze variant interviewers love.
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
console.log(Object.isFrozen(a));     // true`},{name:"Array.prototype.fill",code:`// Polyfill for Array.prototype.fill(value, start?, end?).
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
console.log(realGrid);                           // [['a'], [], []]   — distinct arrays`},{name:"String.prototype.repeat",code:`// Polyfill for String.prototype.repeat — short but classic.
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
console.log(padLeft("42", 5, "0"));                   // "00042"`},{name:"Array.prototype.join",code:`// Polyfill for Array.prototype.join(separator).
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
console.log(arr.myJoin(" | ") === arr.join(" | "));   // true`}]},{label:"Coding Challenges",tag:"JS",kind:"challenge",templates:[{name:"Two Sum",patterns:["Hash Map / Set"],difficulty:"Easy",code:`// ===== CHALLENGE: Two Sum =====
// Given an array of integers and a target,
// return indices of the two numbers that add up to target.
//
// Example: twoSum([2, 7, 11, 15], 9) → [0, 1]
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
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Example 1", twoSum([2, 7, 11, 15], 9), [0, 1]);
test("Example 2", twoSum([3, 2, 4], 6), [1, 2]);
test("Example 3", twoSum([3, 3], 6), [0, 1]);`},{name:"Reverse String",patterns:["Two Pointer"],difficulty:"Easy",code:`// ===== CHALLENGE: Reverse String =====
// Reverse a string without using the built-in reverse() method.
//
// Example: reverseString("hello") → "olleh"
// Example: reverseString("world") → "dlrow"
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
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Simple word", reverseString("hello"), "olleh");
test("Another word", reverseString("world"), "dlrow");
test("Single char", reverseString("a"), "a");
test("Empty string", reverseString(""), "");
test("Palindrome", reverseString("racecar"), "racecar");`},{name:"Valid Palindrome",patterns:["Two Pointer"],difficulty:"Easy",code:`// ===== CHALLENGE: Valid Palindrome =====
// Check if a string is a palindrome, considering only
// alphanumeric characters and ignoring case.
//
// Example: isPalindrome("A man, a plan, a canal: Panama") → true
// Example: isPalindrome("race a car") → false
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
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Classic palindrome", isPalindrome("A man, a plan, a canal: Panama"), true);
test("Not a palindrome", isPalindrome("race a car"), false);
test("Empty string", isPalindrome(""), true);
test("Single char", isPalindrome("a"), true);
test("With numbers", isPalindrome("0P"), false);`},{name:"FizzBuzz",patterns:["Math / Bit"],difficulty:"Easy",code:`// ===== CHALLENGE: FizzBuzz =====
// Return an array of strings from 1 to n where:
// - Multiples of 3 are replaced with "Fizz"
// - Multiples of 5 are replaced with "Buzz"
// - Multiples of both 3 and 5 are replaced with "FizzBuzz"
// - Other numbers are converted to strings
//
// Example: fizzBuzz(5) → ["1", "2", "Fizz", "4", "Buzz"]
//
// Constraints:
// - Return array of strings, not print them

function fizzBuzz(n) {
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
test("FizzBuzz at 30", fizzBuzz(30).slice(-1), ["FizzBuzz"]);`},{name:"Max Profit",patterns:["Greedy","Dynamic Programming"],difficulty:"Easy",code:`// ===== CHALLENGE: Max Profit (Best Time to Buy & Sell Stock) =====
// Given an array of prices where prices[i] is the price on day i,
// find the maximum profit from one transaction (buy then sell).
// If no profit is possible, return 0.
//
// Example: maxProfit([7, 1, 5, 3, 6, 4]) → 5  (buy at 1, sell at 6)
// Example: maxProfit([7, 6, 4, 3, 1]) → 0  (prices only decrease)
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
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Normal case", maxProfit([7, 1, 5, 3, 6, 4]), 5);
test("Decreasing prices", maxProfit([7, 6, 4, 3, 1]), 0);
test("Single day", maxProfit([5]), 0);
test("Two days profit", maxProfit([1, 2]), 1);
test("Buy first sell last", maxProfit([1, 4, 2, 7]), 6);`},{name:"Valid Parentheses",patterns:["Stack"],difficulty:"Easy",code:`// ===== CHALLENGE: Valid Parentheses =====
// Given a string containing just '(', ')', '{', '}', '[' and ']',
// determine if the input string is valid.
//
// A string is valid if:
// - Open brackets are closed by the same type
// - Open brackets are closed in the correct order
//
// Example: isValid("()[]{}") → true
// Example: isValid("(]") → false
//
// Constraints:
// - String contains only bracket characters

function isValid(s) {
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
test("Empty string", isValid(""), true);`},{name:"Merge Sorted Arrays",patterns:["Two Pointer"],difficulty:"Easy",code:`// ===== CHALLENGE: Merge Sorted Arrays =====
// Given two sorted arrays, merge them into one sorted array.
//
// Example: mergeSorted([1, 3, 5], [2, 4, 6]) → [1, 2, 3, 4, 5, 6]
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
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Equal length", mergeSorted([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]);
test("Different lengths", mergeSorted([1, 2], [3, 4, 5, 6]), [1, 2, 3, 4, 5, 6]);
test("One empty", mergeSorted([], [1, 2, 3]), [1, 2, 3]);
test("Both empty", mergeSorted([], []), []);
test("With duplicates", mergeSorted([1, 3, 3], [2, 3, 4]), [1, 2, 3, 3, 3, 4]);`},{name:"Flatten Array",patterns:["Recursion / D&C"],difficulty:"Medium",code:`// ===== CHALLENGE: Flatten Array =====
// Flatten a deeply nested array without using Array.prototype.flat().
//
// Example: flatten([1, [2, [3, [4]], 5]]) → [1, 2, 3, 4, 5]
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
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Nested", flatten([1, [2, [3, [4]], 5]]), [1, 2, 3, 4, 5]);
test("Already flat", flatten([1, 2, 3]), [1, 2, 3]);
test("Deep nesting", flatten([[[[1]]]]), [1]);
test("Mixed", flatten([1, [2, 3], [4, [5, 6]]]), [1, 2, 3, 4, 5, 6]);
test("Empty arrays", flatten([[], [1], [], [2, []], 3]), [1, 2, 3]);`},{name:"Debounce",patterns:["Closure / State"],difficulty:"Medium",code:`// ===== CHALLENGE: Debounce =====
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
}, 80);`},{name:"Group Anagrams",patterns:["Hash Map / Set","Sorting"],difficulty:"Medium",code:`// ===== CHALLENGE: Group Anagrams =====
// Given an array of strings, group the anagrams together.
// An anagram is a word formed by rearranging the letters of another.
//
// Example: groupAnagrams(["eat","tea","tan","ate","nat","bat"])
//   → [["eat","tea","ate"], ["tan","nat"], ["bat"]]
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
  console.log(pass ? "✅" : "❌", name, pass ? "" : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);
};

test("Mixed anagrams", groupAnagrams(["eat","tea","tan","ate","nat","bat"]), [["eat","tea","ate"],["tan","nat"],["bat"]]);
test("Single string", groupAnagrams(["a"]), [["a"]]);
test("Empty string", groupAnagrams([""]), [[""]]);
test("No anagrams", groupAnagrams(["abc","def","ghi"]), [["abc"],["def"],["ghi"]]);`},{name:"Find Duplicates",patterns:["Hash Map / Set"],difficulty:"Easy",code:`// ===== CHALLENGE: Find Duplicates =====
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
test("Triple duplicate", findDuplicates([1, 1, 1, 2, 2]), [1, 2]);`},{name:"Remove Duplicates",patterns:["Hash Map / Set"],difficulty:"Easy",code:`// ===== CHALLENGE: Remove Duplicates =====
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
test("Empty", removeDuplicates([]), []);`},{name:"Find Missing Number",patterns:["Math / Bit"],difficulty:"Easy",code:`// ===== CHALLENGE: Find Missing Number =====
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
test("Larger array", findMissing([9, 6, 4, 2, 3, 5, 7, 0, 1]), 8);`},{name:"Move Zeros",patterns:["Two Pointer","In-Place"],difficulty:"Easy",code:`// ===== CHALLENGE: Move Zeros to End =====
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
test("Zeros first", moveZeros([0, 0, 1, 2]), [1, 2, 0, 0]);`},{name:"Rotate Array",patterns:["Two Pointer","In-Place"],difficulty:"Medium",code:`// ===== CHALLENGE: Rotate Array =====
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
test("Single",       rotate([1], 5), [1]);`},{name:"Bubble Sort",patterns:["Sorting"],difficulty:"Easy",code:`// ===== CHALLENGE: Bubble Sort (Custom Sort, No Built-In) =====
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
test("Empty",       bubbleSort([]), []);`},{name:"Quick Sort",patterns:["Sorting","Recursion / D&C"],difficulty:"Medium",code:`// ===== CHALLENGE: Quick Sort =====
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
test("Duplicates", quickSort([3, 1, 3, 2, 1]), [1, 1, 2, 3, 3]);`},{name:"Merge Sort",patterns:["Sorting","Recursion / D&C"],difficulty:"Medium",code:`// ===== CHALLENGE: Merge Sort =====
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
test("Big",       mergeSort([10, -5, 7, 0, 3, 7]), [-5, 0, 3, 7, 7, 10]);`},{name:"Anagram Check",patterns:["Hash Map / Set","Sorting"],difficulty:"Easy",code:`// ===== CHALLENGE: Anagram Check =====
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
test("Empty strings",     isAnagram("", ""),             true);`},{name:"Longest Substring",patterns:["Sliding Window","Hash Map / Set"],difficulty:"Medium",code:`// ===== CHALLENGE: Longest Substring Without Repeating =====
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
test("Unique",   lengthOfLongestSubstring("abcdef"), 6);`},{name:"First Non-Repeating Char",patterns:["Hash Map / Set"],difficulty:"Easy",code:`// ===== CHALLENGE: First Non-Repeating Character =====
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
test("Empty",        firstNonRepeating(""), null);`},{name:"Sum Curry",patterns:["Closure / State","Recursion / D&C"],difficulty:"Medium",code:`// ===== CHALLENGE: Sum Curry — sum(1)(2)(3)... =====
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
test("With zero",    sum(0)(0)(5)(),       5);`},{name:"Memoize",patterns:["Closure / State","Hash Map / Set"],difficulty:"Medium",code:`// ===== CHALLENGE: Memoize =====
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

console.log(computeCount === 2 ? "✅" : "❌", "Cache hit count: expected 2 computes, got", computeCount);`},{name:"Deep Clone",patterns:["Recursion / D&C"],difficulty:"Medium",code:`// ===== CHALLENGE: Deep Clone =====
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
test("Different reference", original === cloned, false);`},{name:"Throttle",patterns:["Closure / State"],difficulty:"Medium",code:`// ===== CHALLENGE: Throttle =====
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
}, 150);`},{name:"EventEmitter",patterns:["Closure / State","Hash Map / Set"],difficulty:"Medium",code:`// ===== CHALLENGE: EventEmitter =====
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

console.log(onceCount === 1 ? "✅" : "❌", \`once should fire 1x, fired \${onceCount}x\`);`},{name:"LRU Cache",patterns:["Hash Map / Set","Linked List"],difficulty:"Hard",code:`// ===== CHALLENGE: LRU Cache =====
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
console.log(cache.get(4));    // "d"`},{name:"Compose & Pipe",patterns:["Recursion / D&C","Closure / State"],difficulty:"Medium",code:`// ===== CHALLENGE: Compose & Pipe =====
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
test("Single fn",             compose(double)(5), 10);`},{name:"Binary Search",patterns:["Binary Search"],difficulty:"Easy",code:`// ===== CHALLENGE: Binary Search =====
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
test("Single element",   binarySearch([42], 42), 0);`},{name:"Roman to Integer",patterns:["Math / Bit"],difficulty:"Easy",code:`// ===== CHALLENGE: Roman to Integer =====
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
test("XL",      romanToInt("XL"),      40);`},{name:"Reverse Linked List",patterns:["Linked List"],difficulty:"Easy",code:`// ===== CHALLENGE: Reverse Linked List =====
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
test("Long list",   toArray(reverseList(fromArray([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1]);`},{name:"Container With Most Water",patterns:["Two Pointer","Greedy"],difficulty:"Medium",code:`// ===== CHALLENGE: Container With Most Water =====
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
test("Single",    maxArea([5]),                          0);`},{name:"Climbing Stairs",patterns:["Dynamic Programming"],difficulty:"Easy",code:`// ===== CHALLENGE: Climbing Stairs =====
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
test("n = 10", climbStairs(10), 89);`},{name:"Balanced Brackets (Count)",patterns:["Math / Bit"],difficulty:"Easy",code:`// ===== CHALLENGE: Balanced Brackets — Count Match =====
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
test("Unordered but balanced", isBalancedByCount("([)]"),  true);   // counts match — order is NOT checked
test("Unbalanced parens",     isBalancedByCount("(("),     false);
test("Mismatched bracket totals", isBalancedByCount("[[(]"), false); // 2 '[' but only 1 ']'
test("All three pairs",        isBalancedByCount("({[]})"), true);
test("Letters mixed in",       isBalancedByCount("a(b[c]d)e"), true);
test("Empty string",           isBalancedByCount(""),       true);
test("Reversed order",         isBalancedByCount(")("),     true);  // counts match!`},{name:"Second Largest Number",patterns:["Greedy"],difficulty:"Easy",code:`// ===== CHALLENGE: Second Largest Number =====
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
test("Empty",                 secondLargest([]),                       null);`},{name:"Maximum Subarray",patterns:["Dynamic Programming","Greedy"],difficulty:"Medium",code:`// ═════ CHALLENGE: Maximum Subarray (Kadane's) ═════
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
test("All positive", maxSubArray([1,2,3,4]),                10);`},{name:"Trapping Rain Water",patterns:["Two Pointer"],difficulty:"Hard",code:`// ═════ CHALLENGE: Trapping Rain Water ═════
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
test("Flat",     trap([2,2,2]),                    0);`},{name:"3Sum",patterns:["Two Pointer","Sorting"],difficulty:"Medium",code:`// ═════ CHALLENGE: 3Sum ═════
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
test("With duplicates", threeSum([-2,0,1,1,2]),   [[-2,0,2], [-2,1,1]]);`},{name:"Generate Parentheses",patterns:["Backtracking","Recursion / D&C"],difficulty:"Medium",code:`// ═════ CHALLENGE: Generate Parentheses ═════
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
test("n=0", generate(0), [""]);`},{name:"Subsets",patterns:["Backtracking","Recursion / D&C"],difficulty:"Medium",code:`// ═════ CHALLENGE: Subsets (Power Set) ═════
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
test("[]",      subsets([]),      [[]]);`},{name:"Permutations",patterns:["Backtracking","Recursion / D&C"],difficulty:"Medium",code:`// ═════ CHALLENGE: Permutations ═════
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
test("[1]",     permute([1]),     [[1]]);`},{name:"Min Stack",patterns:["Stack"],difficulty:"Medium",code:`// ═════ CHALLENGE: Min Stack (O(1) min) ═════
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
test("getMin one popped",   s.getMin(), -5);`},{name:"Daily Temperatures",patterns:["Stack"],difficulty:"Medium",code:`// ═════ CHALLENGE: Daily Temperatures ═════
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
test("Decreasing", dailyTemperatures([90,80,70]),            [0,0,0]);`},{name:"Coin Change",patterns:["Dynamic Programming"],difficulty:"Medium",code:`// ═════ CHALLENGE: Coin Change ═════
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
test("Single",     coinChange([1,2,5], 5),   1);`},{name:"House Robber",patterns:["Dynamic Programming"],difficulty:"Medium",code:`// ═════ CHALLENGE: House Robber ═════
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
test("Empty",        rob([]),              0);`},{name:"Jump Game",patterns:["Greedy"],difficulty:"Medium",code:`// ═════ CHALLENGE: Jump Game ═════
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
test("Zero start",  canJump([0,1]),       false);`},{name:"Detect Cycle in Linked List",patterns:["Linked List","Two Pointer"],difficulty:"Easy",code:`// ═════ CHALLENGE: Detect Cycle in Linked List ═════
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
test("Empty",          hasCycle(null),                      false);`},{name:"Sort Colors",patterns:["Two Pointer","In-Place"],difficulty:"Medium",code:`// ═════ CHALLENGE: Sort Colors (Dutch Flag) ═════
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
test("All same", a4, [1,1,1]);`},{name:"Top K Frequent Elements",patterns:["Hash Map / Set","Sorting"],difficulty:"Medium",code:`// ═════ CHALLENGE: Top K Frequent Elements ═════
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
test("All same", topK([7,7,7], 1),      [7]);`},{name:"Merge Two Sorted Lists",patterns:["Linked List","Two Pointer"],difficulty:"Easy",code:`// ═════ CHALLENGE: Merge Two Sorted Lists ═════
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
test("Disjoint",  toArray(mergeTwoLists(fromArray([1,2,3]), fromArray([4,5,6]))), [1,2,3,4,5,6]);`},{name:"Rotate Array Left",patterns:["Two Pointer","In-Place"],difficulty:"Medium",code:`// ═════ CHALLENGE: Rotate Array Left ═════
// Rotate the array LEFT by k positions, in place.
//
// Example: rotateLeft([1,2,3,4,5,6,7], 3) → [4,5,6,7,1,2,3]
//
// Hint 1: rotating LEFT by k is the same as rotating RIGHT by n-k.
// Hint 2: three-reversal trick — reverse first k, reverse the rest,
//         then reverse the whole array.
//         (Same three reversals as right-rotation, opposite order.)

function rotateLeft(nums, k) {
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
test("Single",     rotateLeft([42], 1),            [42]);`},{name:"Reverse Words in a String",patterns:["Two Pointer"],difficulty:"Medium",code:`// ═════ CHALLENGE: Reverse Words in a String ═════
// Reverse the ORDER of words in a string. Words are separated by one
// or more spaces. Leading/trailing whitespace and multiple inner
// spaces should be collapsed to single spaces.
//
// Example: reverseWords("  hello   world  ") → "world hello"
//          reverseWords("the sky is blue")   → "blue is sky the"
//
// Hint 1: split on whitespace, filter empty tokens, reverse, join.
// Hint 2: The "two-reversal trick" — reverse the WHOLE string, then
//         reverse each word in place. Pairs with Reverse String.

function reverseWords(s) {
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
test("Punctuated",      reverseWords("a good   example"),      "example good a");`},{name:"Longest Common Prefix",difficulty:"Easy",code:`// ═════ CHALLENGE: Longest Common Prefix ═════
// Write a function to find the longest common prefix string amongst
// an array of strings. If there is no common prefix, return "".
//
// Example: longestCommonPrefix(["flower","flow","flight"]) → "fl"
//          longestCommonPrefix(["dog","racecar","car"])    → ""
//
// Hint: vertical scan — walk character index i from 0 upward; check
// that strs[0][i] matches every strs[j][i]. Stop on first mismatch
// or when any string runs out.

function longestCommonPrefix(strs) {
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
test("One empty", longestCommonPrefix(["", "abc"]),                 "");`},{name:"Longest Palindromic Substring",patterns:["Two Pointer","Dynamic Programming"],difficulty:"Medium",code:`// ═════ CHALLENGE: Longest Palindromic Substring ═════
// Given a string s, return the longest palindromic substring in s.
//
// Example: longestPalindrome("babad") → "bab" (or "aba", both valid)
//          longestPalindrome("cbbd")  → "bb"
//
// Hint: expand-around-center. For each index i, expand outward as
// long as left and right characters match. Handle BOTH odd-length
// (single center) and even-length (two-character center) cases.

function longestPalindrome(s) {
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
test("None",      longestPalindrome("abcde"), ["a","b","c","d","e"]);`},{name:"Reverse Vowels of a String",patterns:["Two Pointer"],difficulty:"Easy",code:`// ═════ CHALLENGE: Reverse Vowels of a String ═════
// Reverse only the vowels (a, e, i, o, u — both cases) in the
// string. All other characters stay in place.
//
// Example: reverseVowels("hello")    → "holle"
//          reverseVowels("leetcode") → "leotcede"
//
// Hint: two-pointer. Advance left until it lands on a vowel,
// advance right backward to a vowel, swap, step inward.

function reverseVowels(s) {
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
test("Empty",        reverseVowels(""),         "");`},{name:"String to Integer (atoi)",difficulty:"Medium",code:`// ═════ CHALLENGE: String to Integer (atoi) ═════
// Convert a string to a 32-bit signed integer, following these rules:
//   1. Skip leading whitespace.
//   2. Read an optional + or − sign.
//   3. Read digits until a non-digit or end of string.
//   4. Clamp to [-2³¹, 2³¹ − 1] on overflow.
//   5. Return 0 if no digits were read.
//
// Example: myAtoi("42")             → 42
//          myAtoi("   -42")         → -42
//          myAtoi("4193 with words") → 4193
//          myAtoi("words 987")       → 0
//          myAtoi("91283472332")     → 2147483647 (clamped to INT_MAX)

function myAtoi(s) {
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
test("Empty",           myAtoi(""),                 0);`},{name:"Letter Combinations of Phone Number",patterns:["Backtracking","Recursion / D&C"],difficulty:"Medium",code:`// ═════ CHALLENGE: Letter Combinations of Phone Number ═════
// Given a string of digits 2..9, return all letter combinations the
// digits could represent on a classic phone keypad.
//
// Mapping:
//   2 → "abc"   3 → "def"   4 → "ghi"   5 → "jkl"
//   6 → "mno"   7 → "pqrs"  8 → "tuv"   9 → "wxyz"
//
// Example: letterCombinations("23") →
//   ["ad","ae","af","bd","be","bf","cd","ce","cf"]
//
// Hint: backtracking. For each digit, branch into 3–4 child letters
// and recurse for the rest of the digits.

function letterCombinations(digits) {
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
]);`},{name:"Single Number",patterns:["Math / Bit"],difficulty:"Easy",code:`// ═════ CHALLENGE: Single Number ═════
// Every element appears TWICE in the array except for ONE element
// that appears exactly once. Find that one. O(n) time and O(1) space.
//
// Example: singleNumber([2,2,1])      → 1
//          singleNumber([4,1,2,1,2])  → 4
//
// Hint: XOR. \`a ^ a = 0\` and \`a ^ 0 = a\`. XOR every number; the
// duplicates cancel and the single one survives.

function singleNumber(nums) {
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
test("Negative",singleNumber([-1,-1,-2]), -2);`},{name:"Single Number II",patterns:["Math / Bit"],difficulty:"Medium",code:`// ═════ CHALLENGE: Single Number II ═════
// Every element appears THREE TIMES in the array except for ONE
// element that appears exactly once. Find that one.
// O(n) time and O(1) space.
//
// Example: singleNumberII([2,2,3,2])         → 3
//          singleNumberII([0,1,0,1,0,1,99])  → 99
//
// Follow-up to "Single Number". The XOR trick from that problem
// FAILS here — XOR cancels pairs (mod 2), but here we have triples.
//
// Hint: Think bit-by-bit. For each of the 32 bits, count how many
// numbers have that bit set. Modulo 3 isolates the lone element's
// bit pattern: triples contribute 0 mod 3; the singleton contributes 1.
//
// Two clean approaches:
//   1. Bit-counting mod 3 (32 passes) — easy to explain
//   2. Two-bit state machine (ones/twos) — single pass, harder to derive
// Solution shows both.

function singleNumberII(nums) {
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
test("Large bit",  singleNumberII([1,1,1,2147483646]), 2147483646);`},{name:"Majority Element",patterns:["Math / Bit"],difficulty:"Easy",code:`// ═════ CHALLENGE: Majority Element ═════
// Given an array of size n, return the element that appears more
// than ⌊n/2⌋ times. You may assume one always exists.
//
// Example: majorityElement([3,2,3])        → 3
//          majorityElement([2,2,1,1,1,2,2]) → 2
//
// Hint: Boyer–Moore voting algorithm. Keep a candidate and a count.
// On match, increment count; on mismatch, decrement count; on count
// 0, swap the candidate. Runs in O(n) time, O(1) space.

function majorityElement(nums) {
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
test("All same", majorityElement([5,5,5,5]),       5);`},{name:"Product of Array Except Self",difficulty:"Medium",code:`// ═════ CHALLENGE: Product of Array Except Self ═════
// Given an array nums, return an array where output[i] is the
// product of all elements of nums EXCEPT nums[i]. You may NOT use
// division. Target O(n) time and O(1) extra space (the output
// array does not count).
//
// Example: productExceptSelf([1,2,3,4]) → [24,12,8,6]
//
// Hint: two passes. First pass fills output[i] with the product of
// everything LEFT of i. Second pass walks right-to-left with a
// running "right product" and multiplies it into output[i].

function productExceptSelf(nums) {
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
test("Pair",      productExceptSelf([3,5]),           [5,3]);`},{name:"Plus One",difficulty:"Easy",code:`// ═════ CHALLENGE: Plus One ═════
// You are given a non-negative integer represented as an array of
// digits (most-significant first). Increment by one and return the
// resulting digit array.
//
// Example: plusOne([1,2,3])  → [1,2,4]
//          plusOne([9,9,9])  → [1,0,0,0]
//          plusOne([0])      → [1]
//
// Hint: walk from right to left. If the digit is < 9, increment and
// return. If it is 9, set to 0 and carry. If you walk off the left
// end with a carry, prepend a 1.

function plusOne(digits) {
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
test("Zero",      plusOne([0]),             [1]);`},{name:"Subarray Sum Equals K",patterns:["Hash Map / Set"],difficulty:"Medium",code:`// ═════ CHALLENGE: Subarray Sum Equals K ═════
// Given an integer array and an integer k, return the number of
// contiguous subarrays whose sum equals k.
//
// Example: subarraySum([1,1,1], 2)  → 2   ([1,1] twice)
//          subarraySum([1,2,3], 3)  → 2   ([1,2] and [3])
//
// Hint: prefix sums + hash map. Walk the array maintaining a running
// sum S. At each index, the count of subarrays ending here with sum k
// equals the count of times \`S − k\` has appeared as a prior prefix.
// Store prefix-sum frequencies in a Map.

function subarraySum(nums, k) {
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
test("Single match",  subarraySum([5], 5),           1);`},{name:"Search in Rotated Sorted Array",patterns:["Binary Search"],difficulty:"Medium",code:`// ═════ CHALLENGE: Search in Rotated Sorted Array ═════
// You are given a sorted-then-rotated array of distinct integers
// (e.g. [4,5,6,7,0,1,2] which was [0..7] rotated). Find the index
// of target, or -1 if not present. Must run in O(log n).
//
// Example: searchRotated([4,5,6,7,0,1,2], 0)  → 4
//          searchRotated([4,5,6,7,0,1,2], 3)  → -1
//
// Hint: modified binary search. At each step, ONE half of the
// mid-split is guaranteed to be sorted (compare nums[lo] with
// nums[mid] to find which). Check if target lies within that
// sorted half; if yes, search there; otherwise search the other.

function searchRotated(nums, target) {
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
test("Rotated by 1",         searchRotated([5,1,2,3,4], 1),     1);`},{name:"Spiral Matrix",difficulty:"Medium",code:`// ═════ CHALLENGE: Spiral Matrix ═════
// Given an m × n matrix, return all elements in spiral order
// (start top-left, go right → down → left → up → repeat inward).
//
// Example: spiralOrder([[1,2,3],[4,5,6],[7,8,9]]) → [1,2,3,6,9,8,7,4,5]
//
// Hint: maintain four boundaries (top, bottom, left, right).
// After traversing each edge, shrink the corresponding boundary
// inward by 1. Stop when top > bottom or left > right.

function spiralOrder(matrix) {
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
test("1x1",       spiralOrder([[42]]),                                     [42]);`},{name:"Find Maximum in Array",patterns:["Greedy"],difficulty:"Easy",code:`// ═════ CHALLENGE: Find Maximum in Array ═════
// Return the largest number in the array. Return null if the
// array is empty.
//
// Example: findMax([3, 7, 1, 9, 4]) → 9
//
// Hint: single pass with a running max. Start at -Infinity (so
// any real number wins) — or use the first element as the seed.

function findMax(nums) {
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
test("Empty",        findMax([]),                    null);`},{name:"Find Min and Max",patterns:["Greedy"],difficulty:"Easy",code:`// ═════ CHALLENGE: Find Min and Max (Single Pass) ═════
// Return both the smallest and largest numbers in the array as
// an object { min, max }. Return { min: null, max: null } if
// the array is empty.
//
// Example: findMinMax([3, 7, 1, 9, 4]) → { min: 1, max: 9 }
//
// Hint: track two running variables — currentMin (start at +∞)
// and currentMax (start at -∞). One pass, O(n). The naive
// approach uses 2n comparisons; the pair-wise trick achieves
// roughly 3n/2 by comparing pairs first, then comparing the
// smaller of the pair with min and the larger with max.

function findMinMax(nums) {
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
test("Empty",        findMinMax([]),                 { min: null, max: null });`},{name:"Third Largest Number",patterns:["Greedy"],difficulty:"Easy",code:`// ═════ CHALLENGE: Third Largest Number ═════
// Return the third DISTINCT largest number in the array. If
// fewer than three distinct numbers exist, return the maximum.
//
// Example: thirdLargest([3, 2, 1])       → 1
//          thirdLargest([1, 2])          → 2  (only two distinct)
//          thirdLargest([2, 2, 3, 1])    → 1  (distinct: 3,2,1)
//
// Hint: extend the Second Largest pattern. Track first, second,
// third with -Infinity sentinels. On each x: skip if equal to
// any of first/second/third (must be DISTINCT). Otherwise
// cascade-shift values down as needed.

function thirdLargest(nums) {
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
test("Single",          thirdLargest([42]),            42);`},{name:"Kth Largest Element",patterns:["Sorting"],difficulty:"Medium",code:`// ═════ CHALLENGE: Kth Largest Element ═════
// Return the k-th largest element in the array (k is 1-indexed:
// k=1 means the largest, k=2 the second largest, etc.). The k-th
// largest is the element that would be at index n-k if the array
// were sorted ascending. Duplicates count.
//
// Example: kthLargest([3,2,1,5,6,4], 2)         → 5
//          kthLargest([3,2,3,1,2,4,5,5,6], 4)   → 4
//
// Three classic approaches:
//   1. Sort + index   — O(n log n) time, simplest
//   2. Heap of size k — O(n log k) time, better for streaming
//   3. Quickselect    — O(n) average, the optimal-asymptotic

function kthLargest(nums, k) {
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
test("Single",         kthLargest([42], 1),                  42);`},{name:"Find Peak Element",patterns:["Binary Search"],difficulty:"Medium",code:`// ═════ CHALLENGE: Find Peak Element ═════
// A peak element is one strictly greater than its neighbors.
// Given an array where adjacent elements differ, return the
// INDEX of ANY peak (multiple peaks may exist; any valid index
// is accepted). nums[-1] and nums[n] are treated as -∞.
//
// Example: findPeak([1, 2, 3, 1])    → 2   (value 3 is a peak)
//          findPeak([1, 2, 1, 3, 5, 6, 4]) → 1 OR 5 (two peaks)
//
// Hint: binary search runs in O(log n). At mid: if nums[mid] >
// nums[mid+1], a peak lies on the LEFT half (including mid).
// Else a peak lies on the RIGHT half (excluding mid). The
// answer is always inside the surviving half because the
// edges are -∞.

function findPeak(nums) {
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
test("Two elements",  findPeak([1, 2]),                       [1]);`},{name:"Auto-Retry for Promises",patterns:["Closure / State"],difficulty:"Medium",code:`// ═════ CHALLENGE: Auto-Retry for Promises ═════
// Wrap a function that returns a Promise. If it rejects, retry up to
// 'retries' times with exponential backoff between attempts.
//
// Example:
//   const flaky = autoRetry(unreliableFn, 3, 100);
//   await flaky();   // retries 3 times before giving up
//
// Hint:
//  - async/await + try/catch in a for loop
//  - back-off: delay * 2^attempt (or full-jitter)
//  - throw the LAST error if all retries exhausted
//  - common in production HTTP clients, queue workers, etc.

function autoRetry(fn, retries = 3, delay = 100) {
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
run();`},{name:"Batch Promises by Concurrency",patterns:["Closure / State"],difficulty:"Medium",code:`// ═════ CHALLENGE: Throttle Promises by Batching ═════
// Given an array of async task functions, run them with a CONCURRENCY
// CAP — at most N in flight at once. Preserve the order of results.
//
// Example: 100 API calls, but only fire 5 at a time.
//
// Hint:
//  - Don't just chunk into Math.ceil(n/k) batches and Promise.all each
//    batch — that wastes the time when one task finishes early but its
//    batch-mates are still running.
//  - Better: an "always-N-in-flight" pool. Workers pull from a shared
//    index until tasks run out.

async function batchPromises(tasks, concurrency) {
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
run();`},{name:"Async Tasks in Series",patterns:["Closure / State"],difficulty:"Easy",code:`// ═════ CHALLENGE: Execute Async Tasks in Series ═════
// Given an array of async functions, run them ONE AT A TIME (not
// concurrently). Return an array of results in order.
//
// This is the "do A, wait, then do B with A's result, etc." pattern.
//
// Example:
//   const tasks = [() => fetchUser(), () => fetchPosts(), () => fetchComments()];
//   const [user, posts, comments] = await runInSeries(tasks);
//
// Hint: a simple for-of loop with await is the most readable form.
// Avoid Promise.all (that's parallel). Avoid forEach + await (broken).

async function runInSeries(tasks) {
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
run();`},{name:"Implement useState (Basic)",patterns:["Closure / State"],difficulty:"Medium",code:`// ═════ CHALLENGE: Implement useState (Basic) ═════
// Write a tiny version of React's useState that supports:
//   - get the current value
//   - set the value, which triggers a re-render
//   - functional update form: setState(prev => prev + 1)
//
// We won't have the full React reconciler, so model the "render cycle"
// as a function the user passes in. Each setState call invokes the
// renderer with the new value.
//
// Example:
//   const [getCount, setCount] = createState(0, render);
//   setCount(c => c + 1);   // triggers render(1)
//   setCount(5);            // triggers render(5)
//
// Hint: closure holds the current value. The setter is a function
// that updates the closure variable and calls the renderer.

function createState(initial, render) {
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
test("Independent slot 2", getCount(), 12);   // unchanged`},{name:"JSON Prettifier",patterns:["Recursion / D&C"],difficulty:"Medium",code:`// ═════ CHALLENGE: JSON Prettifier ═════
// Given a JavaScript value, return a pretty-printed JSON string with
// the specified indentation. Match JSON.stringify(value, null, indent).
//
// Example: prettify({a:1, b:[2,3]}, 2) →
//   {
//     "a": 1,
//     "b": [
//       2,
//       3
//     ]
//   }
//
// Hint: recursive descent. Handle each type — null, boolean, number,
// string (escape!), array, object — and emit indented lines.

function prettify(value, indent = 2) {
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
}\`);`},{name:"Task Runner with Concurrency Control",patterns:["Closure / State"],difficulty:"Hard",code:`// ═════ CHALLENGE: Task Runner with Concurrency Control ═════
// Build a class that manages async tasks with a concurrency cap. Tasks
// can be added at any time; the runner processes at most N in flight.
//
// API:
//   const runner = new TaskRunner(2);          // max 2 concurrent
//   const p = runner.add(() => fetchUser(id)); // returns a Promise
//   await p;
//
// Tasks added past the cap are queued and started as slots free up.
// Each .add(fn) returns a promise resolving to fn's result.
//
// Hint: keep a counter of running tasks + a queue of pending tasks.
// When a task finishes, dequeue the next one and start it.

class TaskRunner {
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
run();`},{name:"Merge Intervals",patterns:["Sorting","Greedy"],difficulty:"Medium",code:`// ===== CHALLENGE: Merge Intervals =====
// Given a list of intervals, merge all overlapping ones and
// return the result sorted by start time.
//
// Example: merge([[1,3],[2,6],[8,10],[15,18]]) → [[1,6],[8,10],[15,18]]
//          merge([[1,4],[4,5]])                → [[1,5]]   (touching counts as overlap)
//
// Constraints:
// - Two intervals overlap if the next start <= the current end
// - Sort by start first, then sweep once: O(n log n) time, O(n) space
// - Don't mutate the input

function merge(intervals) {
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
test("Empty",           merge([]),                           []);`},{name:"Minimum Size Subarray Sum",patterns:["Sliding Window","Two Pointer"],difficulty:"Medium",code:`// ===== CHALLENGE: Minimum Size Subarray Sum =====
// Find the length of the SHORTEST contiguous subarray whose sum is >= target.
// Return 0 if no such subarray exists.
//
// Example: minSubArrayLen(7, [2,3,1,2,4,3]) → 2    ([4,3])
//          minSubArrayLen(11, [1,1,1,1])    → 0    (total is only 4)
//
// Constraints:
// - All numbers are positive (this is what makes the window valid)
// - Grow the window from the right, shrink from the left while the sum
//   still qualifies: O(n) time, O(1) space
// - The brute-force O(n²) works but the window is the expected answer

function minSubArrayLen(target, nums) {
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
test("Empty",           minSubArrayLen(1,  []),            0);`},{name:"Sliding Window Maximum",patterns:["Sliding Window","Stack"],difficulty:"Hard",code:`// ===== CHALLENGE: Sliding Window Maximum =====
// Return the maximum of every contiguous window of size k.
//
// Example: maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3) → [3,3,5,5,6,7]
//
//   [1  3  -1] -3  5  3  6  7   → 3
//    1 [3  -1  -3] 5  3  6  7   → 3
//    1  3 [-1  -3  5] 3  6  7   → 5
//    ...
//
// Constraints:
// - The naive answer re-scans each window: O(n·k). Aim for O(n).
// - Use a MONOTONIC DEQUE of INDICES, kept in decreasing value order.
//   The front is always the current window's max.
// - Two rules per step: drop indices that fell out of the window,
//   and pop from the back while the incoming value is larger.

function maxSlidingWindow(nums, k) {
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
test("Empty",        maxSlidingWindow([], 3),                  []);`},{name:"Longest Consecutive Sequence",patterns:["Hash Map / Set"],difficulty:"Medium",code:`// ===== CHALLENGE: Longest Consecutive Sequence =====
// Find the length of the longest run of consecutive integers.
// The numbers may be in any order and may contain duplicates.
//
// Example: longestConsecutive([100,4,200,1,3,2]) → 4    (1,2,3,4)
//          longestConsecutive([0,3,7,2,5,8,4,6,0,1]) → 9 (0..8)
//
// Constraints:
// - Sorting gives O(n log n). Aim for O(n) with a Set.
// - The trick: only START counting from a number whose predecessor
//   (n - 1) is NOT in the set — that's a sequence start. Every element
//   is then visited at most twice overall.

function longestConsecutive(nums) {
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
test("Empty",        longestConsecutive([]),                       0);`},{name:"Next Permutation",patterns:["In-Place","Two Pointer"],difficulty:"Medium",code:`// ===== CHALLENGE: Next Permutation =====
// Rearrange the numbers into the next lexicographically greater
// permutation. If none exists (already the largest), return the
// smallest permutation instead (i.e. fully sorted ascending).
//
// Example: nextPermutation([1,2,3]) → [1,3,2]
//          nextPermutation([3,2,1]) → [1,2,3]   (wrapped around)
//          nextPermutation([1,1,5]) → [1,5,1]
//
// Constraints:
// - In-place, O(n) time, O(1) extra space
// - Three steps: (1) scan from the right for the first i where
//   nums[i] < nums[i+1] — the "pivot"; (2) find the rightmost element
//   greater than the pivot and swap; (3) reverse the suffix.

function nextPermutation(nums) {
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
test("Two swap",      nextPermutation([2,3,1]),   [3,1,2]);`},{name:"Rotate Matrix 90°",patterns:["In-Place","Two Pointer"],difficulty:"Medium",code:`// ===== CHALLENGE: Rotate Matrix 90° Clockwise =====
// Rotate an n x n matrix 90 degrees clockwise, in place.
//
// Example:  [[1,2,3],        [[7,4,1],
//            [4,5,6],   →     [8,5,2],
//            [7,8,9]]         [9,6,3]]
//
// Constraints:
// - In-place: O(1) extra space (no new matrix)
// - The elegant trick: TRANSPOSE (swap across the main diagonal),
//   then REVERSE each row. Two simple passes beat index gymnastics.
// - Anticlockwise is the same but reverse the rows FIRST (or reverse
//   the column order after transposing).

function rotate(matrix) {
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
            [[13,9,5,1],[14,10,6,2],[15,11,7,3],[16,12,8,4]]);`},{name:"Shuffle Array (Fisher-Yates)",patterns:["Math / Bit","In-Place"],difficulty:"Easy",code:`// ===== CHALLENGE: Shuffle an Array (Fisher-Yates) =====
// Return a UNIFORMLY random permutation — every ordering equally likely.
//
// The classic wrong answer is arr.sort(() => Math.random() - 0.5).
// It is NOT uniform: the comparator is inconsistent, so the result
// depends on the engine's sort algorithm and some orderings are far
// more likely than others. Interviewers ask this to see if you know.
//
// Constraints:
// - O(n) time, O(1) extra space if shuffling in place
// - Walk from the END backwards; for each i pick j in [0, i] and swap
// - Note the range is INCLUSIVE of i — picking from [0, i-1] gives you
//   Sattolo's algorithm (only cyclic permutations), a classic off-by-one

function shuffle(arr) {
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
test("All positions reachable", positionSeen.every(s => s.size === 5), true);`},{name:"Array Intersection & Union",patterns:["Hash Map / Set"],difficulty:"Easy",code:`// ===== CHALLENGE: Array Intersection, Union & Difference =====
// Implement the three set operations on arrays, WITHOUT the ES2025
// Set methods (.intersection/.union/.difference) — build them yourself.
//
// Example: intersection([1,2,3,4], [2,4,6]) → [2,4]
//          union([1,2], [2,3])              → [1,2,3]
//          difference([1,2,3], [2])         → [1,3]
//
// Constraints:
// - Results must be DEDUPLICATED and preserve first-seen order
// - O(n + m) with a Set — the nested-loop version is O(n·m)
// - difference(a, b) = "in a but not in b" (not symmetric)

function intersection(a, b) {
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
test("Empty inputs",        union([], []),                    []);`},{name:"Chunk Array",patterns:["In-Place","Math / Bit"],difficulty:"Easy",code:`// ===== CHALLENGE: Chunk an Array =====
// Split an array into groups of at most \`size\`. The last chunk holds
// the remainder. This is lodash's _.chunk, and it comes up constantly
// in real work — batching API calls, paginating, grid layouts.
//
// Example: chunk([1,2,3,4,5], 2) → [[1,2],[3,4],[5]]
//          chunk([1,2,3], 5)     → [[1,2,3]]
//
// Constraints:
// - Don't mutate the input
// - size < 1 (or non-integer) should return [] rather than loop forever
// - O(n) time; try both a slice-based and a reduce-based version

function chunk(arr, size) {
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
test("Negative guard",   chunk([1,2], -1),      []);`},{name:"String Compression (RLE)",patterns:["Two Pointer","In-Place"],difficulty:"Medium",code:`// ===== CHALLENGE: String Compression (Run-Length Encoding) =====
// Compress a string by replacing runs of the same character with the
// character followed by the run length. Runs of length 1 keep no count.
// If the "compressed" result isn't shorter, return the ORIGINAL.
//
// Example: compress("aabcccccaaa") → "a2bc5a3"
//          compress("abc")         → "abc"    (compression would be longer)
//          compress("aabb")        → "aabb"   ("a2b2" is the same length)
//
// Constraints:
// - Counts of 10+ are multi-digit: "aaaaaaaaaaaa" → "a12"
// - O(n) time, single pass with a run counter
// - The "return original if not shorter" rule is the part people miss

function compress(str) {
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
test("Empty",          compress(""),             "");`},{name:"Integer to Roman",patterns:["Greedy","Hash Map / Set"],difficulty:"Medium",code:`// ===== CHALLENGE: Integer to Roman =====
// Convert an integer (1..3999) to a Roman numeral.
// This is the mirror of the existing "Roman to Integer" challenge.
//
// Example: intToRoman(3)    → "III"
//          intToRoman(58)   → "LVIII"    (50 + 5 + 3)
//          intToRoman(1994) → "MCMXCIV"  (1000 + 900 + 90 + 4)
//
// Constraints:
// - The whole trick is including the SIX subtractive pairs
//   (900=CM, 400=CD, 90=XC, 40=XL, 9=IX, 4=IV) in your value table.
//   With those present, a simple greedy descent works and no special
//   cases are needed.
// - O(1) time — the table has a fixed 13 entries

function intToRoman(num) {
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
test("One",          intToRoman(1),    "I");`},{name:"Reverse Integer",patterns:["Math / Bit"],difficulty:"Medium",code:`// ===== CHALLENGE: Reverse Integer =====
// Reverse the digits of a signed integer. If the result overflows the
// 32-bit signed range [-2^31, 2^31 - 1], return 0.
//
// Example: reverse(123)  → 321
//          reverse(-123) → -321
//          reverse(120)  → 21     (trailing zeros vanish)
//          reverse(1534236469) → 0  (overflows)
//
// Constraints:
// - Keep the sign; reverse only the digits
// - The overflow check is the real content of this question.
//   JS numbers are doubles so you won't wrap like C would — you must
//   check the bounds EXPLICITLY (INT32 range is ±2147483648).
// - Try it with arithmetic (% and /) rather than string reversal

function reverse(x) {
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
test("Palindromic",    reverse(1221),       1221);`},{name:"Isomorphic Strings",patterns:["Hash Map / Set"],difficulty:"Easy",code:`// ===== CHALLENGE: Isomorphic Strings =====
// Two strings are isomorphic if the characters of s can be replaced
// to get t, with a CONSISTENT ONE-TO-ONE mapping. No two characters
// may map to the same character, and a character maps to only one.
//
// Example: isIsomorphic("egg", "add")   → true   (e→a, g→d)
//          isIsomorphic("foo", "bar")   → false  (o would map to both a and r)
//          isIsomorphic("badc", "baba") → false  (d and c both map to a)
//
// Constraints:
// - The trap is checking only ONE direction. "badc"/"baba" passes a
//   one-way check and is still wrong — you need BOTH mappings.
// - O(n) time with two maps (or one map plus a set of used targets)

function isIsomorphic(s, t) {
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
test("Empty",       isIsomorphic("", ""),         true);`},{name:"Longest Repeating Char Replacement",patterns:["Sliding Window","Hash Map / Set"],difficulty:"Medium",code:`// ===== CHALLENGE: Longest Repeating Character Replacement =====
// You may change at most k characters. Return the length of the longest
// substring containing a single repeated character after those changes.
//
// Example: characterReplacement("ABAB", 2)     → 4  (change both B→A)
//          characterReplacement("AABABBA", 1)  → 4  ("AABA" → "AAAA")
//
// Constraints:
// - The key insight: a window is VALID when
//     (window length) - (count of the most frequent char in it) <= k
//   because everything that isn't the majority char must be changed.
// - Grow right, shrink left while invalid: O(n) time, O(26) space
// - You do NOT need to recompute maxCount when shrinking — the answer
//   only ever grows, so a stale maxCount is harmless. Worth understanding
//   why, because interviewers ask.

function characterReplacement(s, k) {
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
test("Empty",         characterReplacement("", 2),         0);`},{name:"Minimum Window Substring",patterns:["Sliding Window","Hash Map / Set"],difficulty:"Hard",code:`// ===== CHALLENGE: Minimum Window Substring =====
// Find the SHORTEST substring of s containing every character of t,
// including duplicates. Return "" if there isn't one.
//
// Example: minWindow("ADOBECODEBANC", "ABC") → "BANC"
//          minWindow("a", "aa")              → ""     (needs two a's)
//
// Constraints:
// - Counts matter: t = "AABC" needs TWO A's in the window
// - Grow right until valid, then shrink left while still valid,
//   recording the best: O(|s| + |t|) time
// - Track a "missing" counter rather than comparing whole maps on every
//   step — comparing maps makes it O(n·k) and is the usual slow answer

function minWindow(s, t) {
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
test("Empty t",       minWindow("abc", ""),              "");`},{name:"Case Converter (camel/snake/kebab)",patterns:["Hash Map / Set"],difficulty:"Easy",code:`// ===== CHALLENGE: Case Converter =====
// Convert between the three casings you actually meet in real code:
// API responses in snake_case, CSS in kebab-case, JS in camelCase.
//
// Example: toCamel("user_first_name")  → "userFirstName"
//          toSnake("userFirstName")    → "user_first_name"
//          toKebab("userFirstName")    → "user-first-name"
//
// Constraints:
// - toCamel must handle BOTH snake_case and kebab-case input
// - Consecutive separators and leading/trailing ones shouldn't produce
//   empty segments or stray capitals
// - Already-converted input should pass through unchanged (idempotent)
// - Bonus: deepCamelize(obj) — recursively convert every key of a
//   nested object/array. This is the version you write at work.

function toCamel(str) {
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
test("Empty",            toCamel(""),                 "");`},{name:"First Repeating Character",patterns:["Hash Map / Set"],difficulty:"Easy",code:`// ===== CHALLENGE: First Repeating Character =====
// Return the first character that appears more than once, scanning
// left to right. Return null if every character is unique.
//
// This is the MIRROR of "First Non-Repeating Char" — and note the
// two questions want different scans, which is the point.
//
// Example: firstRepeating("success")  → "c"   (s repeats later, but c
//                                              is the first char we SEE twice)
//          firstRepeating("abcdef")   → null
//
// Constraints:
// - "First" means the earliest SECOND occurrence, not the earliest
//   character that happens to repeat. In "success": s appears at 0 and 3,
//   c at 2 and 3... walk it carefully — the answer is the first index
//   at which you encounter an already-seen character.
// - O(n) time, one pass with a Set — no second pass needed

function firstRepeating(str) {
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
test("Spaces count", firstRepeating("a b a"),    " ");`},{name:"Sum Without Loops",patterns:["Recursion / D&C","Math / Bit"],difficulty:"Easy",code:`// ===== CHALLENGE: Sum an Array Without Loops =====
// Sum the numbers in an array WITHOUT for / while / do-while.
// A frequent warm-up: interviewers use it to see which tools you reach
// for and whether you know their limits.
//
// Write FOUR versions:
//   sumReduce   — Array.prototype.reduce
//   sumRecursive — head + recurse on the tail
//   sumTail      — tail-recursive with an accumulator
//   sumNested    — handles arbitrarily nested arrays: [1,[2,[3,[4]]]] → 10
//
// Constraints:
// - No for / while / do-while anywhere
// - Handle the empty array (should be 0, not undefined or NaN)
// - Know the catch: JS engines do NOT implement tail-call optimisation
//   (despite it being in the ES2015 spec), so deep recursion still
//   overflows the stack. reduce is the production answer.

function sumReduce(arr) {
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
test("nested mixed",     sumNested([1,[2,3],[[4],5]]),15);`}]},{label:"React Machine Coding",tag:"React",kind:"challenge",templates:[{name:"Display Data from a JSON Prop",jsx:!0,code:`// ===== MACHINE CODING: Display Data from a JSON Prop =====
// The classic screening exercise: you are handed a JSON file, pass it to a
// component as a prop, access the data, and render what's asked for.
//
// TASK
//   1. Pass \`data\` into <TeamDirectory /> as a prop
//   2. Render each member's name, role and location
//   3. Show the total headcount
//   4. Handle the empty case
//
// WHAT INTERVIEWERS ACTUALLY CHECK
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
//    A fetch — see the "JSON -> API -> React fetch" template for that version.`},{name:"JSON → API → React fetch",jsx:!0,code:`// ===== MACHINE CODING: JSON file -> Express endpoint -> React fetch -> UI =====
// The full-stack version of the exercise above. The playground has no server,
// so the Express half is shown as reference and the fetch is stubbed with the
// SAME contract — the React code below is exactly what you'd ship.
//
// ---------------------------------------------------------------------------
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
//    retries, dedup and stale-while-revalidate for free — say so.`},{name:"Pagination",jsx:!0,code:`// ===== MACHINE CODING: Pagination Component =====
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

render(<Pagination />);`},{name:"Search Filter",jsx:!0,code:`// ===== MACHINE CODING: Real-time Search Filter =====
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

render(<SearchFilter />);`},{name:"Chat App",jsx:!0,code:`// ===== MACHINE CODING: Real-time Chat Application =====
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

render(<ChatApp />);`},{name:"Modal Component",jsx:!0,code:`// ===== MACHINE CODING: Reusable Modal Component =====
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

render(<App />);`},{name:"Image Gallery + Lazy Load",jsx:!0,code:`// ===== MACHINE CODING: Image Gallery with Lazy Loading =====
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

render(<ImageGallery />);`},{name:"Drag and Drop",jsx:!0,code:`// ===== MACHINE CODING: Drag-and-Drop Interface =====
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

render(<DragDropApp />);`},{name:"Product List Sort & Filter",jsx:!0,code:`// ===== MACHINE CODING: Product List with Sorting & Filtering =====
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

render(<ProductList />);`},{name:"Responsive Navbar",jsx:!0,code:`// ===== MACHINE CODING: Responsive Navbar =====
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

render(<Navbar />);`},{name:"Infinite Scroll",jsx:!0,code:`// ===== MACHINE CODING: Infinite Scrolling List =====
// Build an infinite scrolling list that:
// - Loads more items when scrolling near the bottom
// - Uses IntersectionObserver (no scroll event listener)
// - Shows loading indicator
// - Handles "no more data" state
// - HANDLES FAILURE with a retry (the half most implementations skip —
//   an infinite list that silently stops on a network blip looks like
//   "no more data" to the user, which is a much worse bug than an error)

function fakeAPI(page) {
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

render(<InfiniteScroll />);`},{name:"Notifications",jsx:!0,code:`// ===== MACHINE CODING: Real-time Notifications =====
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

render(<App />);`},{name:"Star Rating",jsx:!0,code:`// ===== MACHINE CODING: Star Rating =====
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

render(<App />);`},{name:"Tabs",jsx:!0,code:`// ===== MACHINE CODING: Tabs Component =====
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

render(<App />);`},{name:"Accordion",jsx:!0,code:`// ===== MACHINE CODING: Accordion =====
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

render(<App />);`},{name:"OTP Input",jsx:!0,code:`// ===== MACHINE CODING: OTP Input =====
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

render(<App />);`},{name:"Tic-Tac-Toe",jsx:!0,code:`// ===== MACHINE CODING: Tic-Tac-Toe =====
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

render(<App />);`},{name:"Stopwatch",jsx:!0,code:`// ===== MACHINE CODING: Stopwatch =====
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

render(<App />);`},{name:"Calculator",jsx:!0,code:`// ===== MACHINE CODING: Calculator =====
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

render(<App />);`},{name:"Auto-Complete (ARIA combobox)",jsx:!0,code:`// ===== MACHINE CODING: Auto-Complete (ARIA Combobox) =====
// Search suggestions as you type. This one question combines FOUR
// things, and interviewers grade all four:
//   1. Debouncing so you don't fire per keystroke
//   2. Cancelling the previous request (or results arrive out of order)
//   3. Keyboard navigation — ↓ ↑ Enter Esc Home End
//   4. Accessibility — the ARIA combobox pattern
//
// THE MECHANISM THAT MATTERS: aria-activedescendant. DOM focus stays in
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

render(<AutoComplete />);`},{name:"Toast / Snackbar",jsx:!0,code:`// ===== MACHINE CODING: Toast / Snackbar =====
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

render(<App />);`},{name:"Carousel / Slider",jsx:!0,code:`// ===== MACHINE CODING: Carousel / Slider =====
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

render(<App />);`},{name:"Todo List (localStorage + memo)",jsx:!0,code:`// ===== MACHINE CODING: Todo List — localStorage + Re-render Optimization =====
// The classic "build a to-do list" ask — but the follow-up is always
// "now make sure typing in the input doesn't re-render all 500 items."
// That follow-up is the actual interview. Open the React DevTools
// Profiler with "Highlight updates" on and watch which parts flash.
//
// The four techniques, and why each one matters:
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

render(<TodoApp />);`},{name:"Counter (optimized re-renders)",jsx:!0,code:`// ===== MACHINE CODING: Counter, done properly =====
// Every React interview opens with this, and the real question is the
// follow-up: "now optimize the re-renders and handle the edge cases."
//
// The five things they're actually checking:
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

render(<Counter initial={0} step={1} min={-10} max={10} />);`},{name:"Search with Debounce + Cancel",jsx:!0,code:`// ===== MACHINE CODING: Debounced Search with Request Cancellation =====
// "Build a search input that doesn't fire an API call on every keystroke."
// Debouncing is the easy half. The half that separates candidates is
// CANCELLING the in-flight request, because without it you get a race:
//
//   type "re"  → request A starts (slow)
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

render(<SearchBox />);`},{name:"Modal (Portal + Focus Trap)",jsx:!0,code:`// ===== MACHINE CODING: Accessible Modal =====
// "Build a reusable modal triggerable from anywhere." They're testing
// portals, focus management, event bubbling and accessibility.
//
// The FIVE things a correct modal must do, and the order matters:
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

  // ReactDOM.createPortal renders into a different DOM node while staying
  // in the React tree — so context still flows in, and React events still
  // bubble to React ancestors even though the DOM nodes are unrelated.
  return ReactDOM.createPortal(
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

render(<App />);`},{name:"Form with Validation",jsx:!0,code:`// ===== MACHINE CODING: Form with Real-Time Validation =====
// Tests controlled vs uncontrolled, validation timing, and — the part
// most people skip — the ACCESSIBILITY of error messages.
//
// The UX rule that matters most: DON'T validate on every keystroke from
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

render(<SignupForm />);`},{name:"Theme Switcher (dark/light)",jsx:!0,code:`// ===== MACHINE CODING: Theme Switcher =====
// "Dark/light toggle that persists across sessions." Tests Context API,
// CSS variables, system preferences — and the one they always mention:
// THE FLASH OF WRONG THEME on reload.
//
// THREE states, not two. This is the part most implementations get wrong:
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
);`}]}],q=Ct.flatMap(n=>n.templates.map(a=>({...a,category:n.label,tag:n.tag,kind:n.kind??"template"}))),St=[{name:"JavaScript",lang:"js",description:"Plain JavaScript editor.",code:`// JavaScript playground — start fresh!

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

render(<App />);`}];function En({output:n,hasPreview:a,previewRef:i}){return e.jsxs("div",{className:"flex-1 flex flex-col min-h-0",children:[e.jsxs("div",{className:a?"flex-1 flex flex-col min-h-[160px] basis-0":"flex-1 flex flex-col min-h-[100px]",children:[e.jsxs("div",{className:"px-4 py-2 h-10 text-xs font-medium text-slate-500 border-b border-[#2d333b] bg-[#22272e] shrink-0 flex items-center gap-2",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-500"}),"Console Output",n.length>0&&e.jsxs("span",{className:"ml-1 text-[10px] text-slate-600",children:["(",n.length,")"]})]}),e.jsx("div",{className:"flex-1 overflow-auto p-4 bg-[#1e1e2e] font-mono text-sm min-h-0",children:n.length===0&&!a?e.jsx("div",{className:"text-slate-500 italic",children:'Click "Run" or press ⌘+Enter to execute your code...'}):n.length===0?e.jsx("div",{className:"text-slate-600 italic text-xs",children:"No console output yet — logs will appear here."}):n.map((h,p)=>e.jsx(wn,{entry:h},p))})]}),e.jsxs("div",{className:a?"flex-1 flex flex-col min-h-[160px] basis-0 border-t border-[#2d333b]":"h-0 overflow-hidden",children:[e.jsxs("div",{className:"px-4 py-2 h-10 text-xs font-medium text-slate-500 border-b border-[#2d333b] bg-[#22272e] shrink-0 flex items-center gap-2",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-blue-500"}),"React Preview"]}),e.jsx("div",{ref:i,className:"flex-1 overflow-auto bg-white text-slate-900 p-2 min-h-0"})]})]})}const wn=r.memo(function({entry:a}){const i=a.type==="error"?"text-red-400":a.type==="warn"?"text-yellow-400":a.type==="result"?"text-blue-400":"text-[#a6e3a1]";return e.jsxs("div",{className:`py-1 border-b border-slate-800/50 last:border-0 ${i}`,children:[a.type==="error"&&e.jsx(en,{size:12,className:"inline mr-2"}),e.jsx("span",{className:"whitespace-pre-wrap",children:a.text})]})}),kn=r.memo(En),Cn=new Set(["Two Sum","Reverse String","Valid Palindrome","FizzBuzz","Max Profit","Valid Parentheses","Merge Sorted Arrays","Flatten Array","Debounce","Group Anagrams","Find Duplicates","Remove Duplicates","Find Missing Number","Move Zeros","Rotate Array","Bubble Sort","Quick Sort","Merge Sort","Anagram Check","Longest Substring","First Non-Repeating Char","Sum Curry","Memoize","Deep Clone","Throttle","EventEmitter","LRU Cache","Binary Search","Roman to Integer","Reverse Linked List","Container With Most Water","Climbing Stairs","Balanced Brackets (Count)","Second Largest Number","Compose & Pipe","Maximum Subarray","Trapping Rain Water","3Sum","Generate Parentheses","Subsets","Permutations","Min Stack","Daily Temperatures","Coin Change","House Robber","Jump Game","Detect Cycle in Linked List","Sort Colors","Top K Frequent Elements","Merge Two Sorted Lists","Rotate Array Left","Reverse Words in a String","Longest Common Prefix","Longest Palindromic Substring","Reverse Vowels of a String","String to Integer (atoi)","Letter Combinations of Phone Number","Single Number","Single Number II","Majority Element","Product of Array Except Self","Plus One","Subarray Sum Equals K","Search in Rotated Sorted Array","Spiral Matrix","Find Maximum in Array","Find Min and Max","Third Largest Number","Kth Largest Element","Find Peak Element","Merge Intervals","Minimum Size Subarray Sum","Sliding Window Maximum","Longest Consecutive Sequence","Next Permutation","Rotate Matrix 90°","Shuffle Array (Fisher-Yates)","Array Intersection & Union","Chunk Array","String Compression (RLE)","Integer to Roman","Reverse Integer","Isomorphic Strings","Longest Repeating Char Replacement","Minimum Window Substring","Case Converter (camel/snake/kebab)","First Repeating Character","Sum Without Loops"]),Ht="playground-progress",Et="playground-last-session";function nt(){try{return JSON.parse(localStorage.getItem(Ht))||{}}catch{return{}}}function On(){const[n,a]=r.useState(nt),[i,h]=r.useState(()=>localStorage.getItem(Et)||null),p=r.useCallback(y=>{localStorage.setItem(Ht,JSON.stringify(y)),a(y)},[]),v=r.useCallback(y=>n[y]??null,[n]),S=r.useCallback((y,T)=>{if(!y)return;const c=nt(),z={...c[y]??{code:"",status:"in-progress",updatedAt:new Date().toISOString()},...T,updatedAt:new Date().toISOString()};p({...c,[y]:z})},[p]),b=r.useCallback(y=>{if(!y)return;const T=nt(),c=T[y];if((c==null?void 0:c.status)==="solved")return;const f={code:(c==null?void 0:c.code)??"",notes:c==null?void 0:c.notes,status:"solved",updatedAt:new Date().toISOString(),solvedAt:(c==null?void 0:c.solvedAt)??new Date().toISOString()};p({...T,[y]:f})},[p]),J=r.useCallback(y=>{const T=nt();if(!(y in T))return;const{[y]:c,...f}=T;p(f)},[p]),M=r.useCallback(()=>p({}),[p]),w=r.useCallback(y=>{y&&(localStorage.setItem(Et,y),h(y))},[]),m=r.useCallback(()=>{localStorage.removeItem(Et),h(null)},[]),{solvedCount:d,inProgressCount:R}=r.useMemo(()=>{let y=0,T=0;for(const c of Object.values(n))c.status==="solved"?y++:T++;return{solvedCount:y,inProgressCount:T}},[n]);return{progress:n,getEntry:v,saveEntry:S,markSolved:b,clearEntry:J,clearAll:M,solvedCount:d,inProgressCount:R,lastSessionName:i,setLastSession:w,clearLastSession:m}}function Nn({open:n,explanation:a,onClose:i,onLoadTemplate:h}){const[p,v]=r.useState(0),[S,b]=r.useState(0),[J,M]=r.useState(!1),w=(a==null?void 0:a.approaches[p])??null,m=(w==null?void 0:w.steps.length)??0,d=(w==null?void 0:w.steps[S])??null;r.useEffect(()=>{b(0),M(!1)},[p,a]),r.useEffect(()=>{n||(v(0),b(0),M(!1))},[n]),r.useEffect(()=>{if(!n)return;const c=f=>{f.key==="Escape"?i():f.key==="ArrowRight"?b(z=>Math.min(m-1,z+1)):f.key==="ArrowLeft"?b(z=>Math.max(0,z-1)):f.key===" "&&(f.preventDefault(),M(z=>!z))};return window.addEventListener("keydown",c),()=>window.removeEventListener("keydown",c)},[n,i,m]),r.useEffect(()=>{if(!J)return;const c=window.setInterval(()=>{b(f=>f>=m-1?(M(!1),f):f+1)},1500);return()=>clearInterval(c)},[J,m]);const R=r.useCallback(()=>b(c=>Math.min(m-1,c+1)),[m]),y=r.useCallback(()=>b(c=>Math.max(0,c-1)),[]),T=r.useCallback(()=>{b(0),M(!1)},[]);return!a||!w||!d?null:e.jsx(Mt,{children:n&&e.jsx(lt.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4",onClick:i,children:e.jsxs(lt.div,{initial:{scale:.96,opacity:0},animate:{scale:1,opacity:1},exit:{scale:.96,opacity:0},transition:{duration:.15},onClick:c=>c.stopPropagation(),className:"w-full max-w-5xl max-h-[90vh] bg-white dark:bg-[#0f1117] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden",children:[e.jsxs("div",{className:"flex items-start justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0",children:[e.jsxs("div",{children:[e.jsxs("h2",{className:"text-xl font-bold",children:[a.problem," — Explained"]}),e.jsx("p",{className:"text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed",children:a.problemStatement})]}),e.jsx("button",{onClick:i,className:"p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0","aria-label":"Close",children:e.jsx(ot,{size:18})})]}),e.jsx("div",{className:"flex gap-2 px-6 pt-4 border-b border-slate-200 dark:border-slate-800 shrink-0",children:a.approaches.map((c,f)=>e.jsxs("button",{onClick:()=>v(f),className:"inline-flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-colors "+(f===p?"border-indigo-500 text-indigo-600 dark:text-indigo-400":"border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"),children:[c.badge==="best"&&e.jsx(Nt,{size:14,className:"text-amber-500"}),c.name]},c.id))}),e.jsxs("div",{className:"flex-1 overflow-y-auto px-6 py-5",children:[e.jsxs("div",{className:"grid md:grid-cols-3 gap-4 mb-5",children:[e.jsxs("div",{className:"md:col-span-2 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40",children:[e.jsx("div",{className:"text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1.5",children:"Intuition"}),e.jsx("p",{className:"text-sm text-slate-700 dark:text-slate-300 leading-relaxed",children:w.intuition})]}),e.jsxs("div",{className:"p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800",children:[e.jsx("div",{className:"text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2",children:"Complexity"}),e.jsx(Tt,{label:"Time",value:w.complexity.time}),e.jsx(Tt,{label:"Space",value:w.complexity.space}),e.jsx("div",{className:"text-xs mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 italic",children:w.complexity.verdict})]})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2 mb-4 text-xs",children:[e.jsx("span",{className:"px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-500 font-medium",children:"Example"}),e.jsx("code",{className:"px-2 py-1 rounded-md bg-slate-900 text-emerald-300 font-mono",children:w.example.input}),e.jsx("span",{className:"text-slate-400",children:"→"}),e.jsx("code",{className:"px-2 py-1 rounded-md bg-slate-900 text-amber-300 font-mono",children:w.example.output})]}),e.jsxs("div",{className:"grid md:grid-cols-[1fr_1.2fr] gap-4 mb-4",children:[w.pseudocodeCompare&&w.pseudocodeCompare.length>0?e.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[e.jsxs("div",{className:"rounded-xl border border-indigo-300 dark:border-indigo-700/60 bg-[#0f1117] overflow-hidden",children:[e.jsxs("div",{className:"px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-indigo-400 border-b border-slate-800",children:[w.pseudocodeLabel??"Primary"," ",e.jsx("span",{className:"text-slate-500",children:"· this one"})]}),e.jsx("pre",{className:"p-2 text-[11px] leading-relaxed font-mono",children:w.pseudocode.map((c,f)=>e.jsx("div",{className:"px-1.5 py-0.5 rounded transition-colors "+(f===d.pseudoLine?"bg-indigo-500/20 text-indigo-200 border-l-2 border-indigo-400 -ml-0.5":"text-slate-400 border-l-2 border-transparent -ml-0.5"),children:c||" "},f))})]}),w.pseudocodeCompare.map(c=>e.jsxs("div",{className:"rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0f1117] overflow-hidden",children:[e.jsxs("div",{className:"px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-800",children:[c.label," ",e.jsx("span",{className:"text-slate-600",children:"· compare"})]}),e.jsx("pre",{className:"p-2 text-[11px] leading-relaxed font-mono",children:c.lines.map((f,z)=>e.jsx("div",{className:"px-1.5 py-0.5 rounded transition-colors "+(z===c.highlightLine?"bg-amber-500/15 text-amber-200 border-l-2 border-amber-500/60 -ml-0.5":"text-slate-500 border-l-2 border-transparent -ml-0.5"),children:f||" "},z))})]},c.label))]}):e.jsxs("div",{className:"rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0f1117] overflow-hidden",children:[e.jsx("div",{className:"px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-800",children:"Pseudocode"}),e.jsx("pre",{className:"p-3 text-xs leading-relaxed font-mono",children:w.pseudocode.map((c,f)=>e.jsx("div",{className:"px-2 py-0.5 rounded transition-colors "+(f===d.pseudoLine?"bg-indigo-500/20 text-indigo-200 border-l-2 border-indigo-400 -ml-0.5":"text-slate-400 border-l-2 border-transparent -ml-0.5"),children:c||" "},f))})]}),e.jsxs("div",{className:"rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 flex flex-col gap-4",children:[d.array&&e.jsx(An,{array:d.array}),d.linkedList&&e.jsx(Mn,{snapshot:d.linkedList}),d.dualArray&&e.jsx(Dn,{snapshot:d.dualArray}),d.computation&&e.jsx(jn,{c:d.computation}),d.lookupOutcome&&e.jsx(Fn,{outcome:d.lookupOutcome}),d.map&&e.jsx(Rn,{snapshot:d.map}),d.set&&e.jsx(In,{snapshot:d.set}),d.stack&&e.jsx(Ln,{snapshot:d.stack}),d.callStack&&e.jsx(Pn,{snapshot:d.callStack}),d.timeline&&e.jsx(Hn,{snapshot:d.timeline}),d.note&&e.jsx("div",{className:"px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300",children:d.note}),d.result&&e.jsx("div",{className:"mt-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 "+(d.result.found?"bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300":"bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"),children:d.result.found?e.jsxs(e.Fragment,{children:[e.jsx(Nt,{size:14})," Result: ",e.jsx("code",{className:"font-mono",children:d.result.value})]}):e.jsxs(e.Fragment,{children:[e.jsx(tn,{size:14})," No solution found"]})}),!d.array&&!d.linkedList&&!d.dualArray&&!d.computation&&!d.lookupOutcome&&!d.map&&!d.set&&!d.stack&&!d.callStack&&!d.timeline&&!d.note&&!d.result&&e.jsx("div",{className:"text-xs text-slate-500 dark:text-slate-500 italic flex items-center justify-center text-center min-h-[120px]",children:"No visual change this step — read the title and the highlighted pseudocode line."})]})]}),e.jsxs("div",{className:"mt-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800",children:[e.jsx("div",{className:"flex items-center gap-2 mb-1.5",children:e.jsxs("span",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-500",children:["Step ",S+1," of ",m]})}),e.jsx("p",{className:"text-sm font-medium text-slate-900 dark:text-slate-100",children:d.title}),d.detail&&e.jsx("p",{className:"text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed",children:d.detail})]}),w.usesPolyfills&&w.usesPolyfills.length>0&&e.jsxs("div",{className:"mt-4 p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20",children:[e.jsx("div",{className:"text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2",children:"Built-ins used (peek under the hood)"}),e.jsx("p",{className:"text-xs text-slate-600 dark:text-slate-400 mb-3",children:"This approach leans on the following array/object built-ins. Click any chip to open its polyfill template and study how it's implemented internally."}),e.jsx("div",{className:"flex flex-wrap gap-2",children:w.usesPolyfills.map(c=>e.jsxs("button",{onClick:()=>{h&&(h(c.templateName),i())},disabled:!h,className:"group inline-flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-900/60 border border-amber-200 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-sm transition-all disabled:cursor-default disabled:hover:border-amber-200 disabled:hover:shadow-none",title:h?`Open the ${c.templateName} polyfill template`:void 0,children:[e.jsx("code",{className:"text-xs font-mono text-amber-700 dark:text-amber-300 group-hover:text-amber-900 dark:group-hover:text-amber-200",children:c.builtin}),c.why&&e.jsx("span",{className:"text-[10px] text-slate-500 dark:text-slate-400 leading-tight",children:c.why})]},c.builtin))})]}),e.jsxs("details",{className:"mt-4 rounded-xl border border-slate-200 dark:border-slate-800",children:[e.jsx("summary",{className:"px-4 py-2.5 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300",children:"When to pick this approach"}),e.jsx("p",{className:"px-4 pb-3 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed",children:w.tradeoffs})]})]}),e.jsxs("div",{className:"flex items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 shrink-0",children:[e.jsxs("button",{onClick:T,className:"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors","aria-label":"Reset",children:[e.jsx(Dt,{size:12})," Reset"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{onClick:y,disabled:S===0,className:"p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors","aria-label":"Previous step",children:e.jsx(nn,{size:16})}),e.jsx("div",{className:"flex gap-1.5 px-2",children:w.steps.map((c,f)=>e.jsx("button",{onClick:()=>b(f),className:"w-2 h-2 rounded-full transition-all "+(f===S?"bg-indigo-500 w-4":f<S?"bg-indigo-300 dark:bg-indigo-800":"bg-slate-300 dark:bg-slate-700"),"aria-label":`Go to step ${f+1}`},f))}),e.jsx("button",{onClick:()=>M(c=>!c),className:"p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors","aria-label":J?"Pause":"Auto-play",title:J?"Pause":"Auto-play (Space)",children:J?e.jsx(sn,{size:14}):e.jsx(Pt,{size:14})}),e.jsx("button",{onClick:R,disabled:S>=m-1,className:"p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors","aria-label":"Next step",children:e.jsx(it,{size:16})})]}),e.jsx("span",{className:"text-[10px] text-slate-400 hidden md:inline",children:"← → arrows · Space to play"})]})]})})})}function Tt({label:n,value:a}){return e.jsxs("div",{className:"flex items-baseline justify-between text-xs py-0.5",children:[e.jsx("span",{className:"text-slate-500",children:n}),e.jsx("code",{className:"font-mono text-slate-900 dark:text-slate-200 font-semibold",children:a})]})}function An({array:n}){return e.jsxs("div",{children:[e.jsx("div",{className:"text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2",children:"Array"}),e.jsx("div",{className:"flex gap-1.5 flex-wrap",children:n.cells.map((a,i)=>e.jsx(Je,{index:i,cell:a},i))}),n.pointers&&n.pointers.length>0&&e.jsx("div",{className:"flex gap-1.5 mt-1 flex-wrap","aria-hidden":!0,children:n.cells.map((a,i)=>{const h=n.pointers.filter(p=>p.index===i);return e.jsx("div",{className:"w-12 flex flex-col items-center gap-0.5 min-h-[1.5rem]",children:h.map((p,v)=>e.jsxs("span",{className:"text-[10px] font-bold "+(p.color==="red"?"text-red-500":p.color==="amber"?"text-amber-500":p.color==="emerald"?"text-emerald-500":"text-indigo-500"),children:["↑ ",p.label]},v))},i)})})]})}function Je({index:n,cell:a}){const i="border-2",h=(()=>{switch(a.highlight){case"i":return"border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300";case"j":return"border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300";case"compare":return"border-blue-400 bg-blue-50 dark:bg-blue-950/30";case"found":return"border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-md";case"hit":return"border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";case"new":return"border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30";default:return"border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"}})();return e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsxs("span",{className:"text-[10px] text-slate-400 font-mono",children:["[",n,"]"]}),e.jsx("div",{className:`w-12 h-12 rounded-lg ${i} ${h} flex items-center justify-center font-mono text-sm font-semibold transition-all`,children:a.value})]})}function Rn({snapshot:n}){return e.jsxs("div",{children:[e.jsx("div",{className:"text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2",children:"Hash Map"}),n.entries.length===0?e.jsxs("div",{className:"px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic",children:["{ }"," (empty)"]}):e.jsx("div",{className:"flex flex-wrap gap-1.5",children:n.entries.map((a,i)=>e.jsx(Tn,{entry:a},i))})]})}function Tn({entry:n}){const a=n.highlight==="hit"?"border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200 shadow-md":n.highlight==="new"?"border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-200":"border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300";return e.jsx("div",{className:`px-2.5 py-1.5 rounded-lg border-2 ${a} transition-all`,children:e.jsxs("code",{className:"font-mono text-xs",children:[n.key," ",e.jsx("span",{className:"text-slate-400",children:"→"})," ",n.value]})})}function jn({c:n}){return e.jsxs("div",{children:[e.jsx("div",{className:"text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5",children:n.label}),e.jsxs("div",{className:"flex items-center gap-2 font-mono text-sm flex-wrap",children:[n.lhs&&e.jsx("span",{className:"px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700",children:n.lhs}),n.op&&e.jsx("span",{className:"text-slate-500",children:n.op}),n.rhs&&e.jsx("span",{className:"px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700",children:n.rhs}),n.result&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"text-slate-500",children:"="}),e.jsx("span",{className:"px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-300 dark:border-indigo-800",children:n.result})]})]})]})}function Ln({snapshot:n}){const a=n.items.length-1;return e.jsxs("div",{children:[e.jsxs("div",{className:"text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2",children:["Stack ",n.action&&e.jsxs("span",{className:"ml-1 text-indigo-500",children:["· ",n.action]})]}),n.items.length===0?e.jsx("div",{className:"px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic",children:"[ ] (empty)"}):e.jsx("div",{className:"flex flex-col-reverse gap-1 w-fit",children:n.items.map((i,h)=>e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Je,{index:h,cell:i}),h===a&&e.jsx("span",{className:"text-[10px] text-indigo-500 font-bold",children:"← top"})]},h))})]})}function In({snapshot:n}){return e.jsxs("div",{children:[e.jsx("div",{className:"text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2",children:"Set"}),n.items.length===0?e.jsxs("div",{className:"px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic",children:["{ }"," (empty)"]}):e.jsx("div",{className:"flex flex-wrap gap-1.5",children:n.items.map((a,i)=>{const h=a.highlight==="hit"?"border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200":a.highlight==="new"?"border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-200":"border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300";return e.jsx("div",{className:`px-2.5 py-1 rounded-full border-2 ${h}`,children:e.jsx("code",{className:"font-mono text-xs",children:a.value})},i)})})]})}function Dn({snapshot:n}){return e.jsxs("div",{className:"flex flex-col gap-3",children:[[n.left,n.right].map((a,i)=>e.jsxs("div",{children:[e.jsx("div",{className:"text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5",children:a.label}),e.jsx("div",{className:"flex gap-1.5 flex-wrap",children:a.cells.map((h,p)=>e.jsx(Je,{index:p,cell:h},p))}),typeof a.pointer=="number"&&e.jsx("div",{className:"flex gap-1.5 mt-1 flex-wrap",children:a.cells.map((h,p)=>e.jsx("div",{className:"w-12 flex justify-center",children:p===a.pointer&&e.jsx("span",{className:"text-[10px] font-bold text-indigo-500",children:"↑"})},p))})]},i)),n.result&&e.jsxs("div",{children:[e.jsx("div",{className:"text-[10px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5",children:n.result.label}),e.jsx("div",{className:"flex gap-1.5 flex-wrap",children:n.result.cells.length===0?e.jsx("div",{className:"px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic",children:"[ ]"}):n.result.cells.map((a,i)=>e.jsx(Je,{index:i,cell:a},i))})]})]})}function Pn({snapshot:n}){return e.jsxs("div",{children:[e.jsx("div",{className:"text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2",children:"Call Stack"}),e.jsx("div",{className:"flex flex-col-reverse gap-1",children:n.frames.map((a,i)=>{const h=a.status==="active"?"border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-200":a.status==="returned"?"border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300":"border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400";return e.jsxs("div",{className:`px-3 py-1.5 rounded-md border-2 ${h} font-mono text-xs flex items-center justify-between`,children:[e.jsx("span",{children:a.call}),a.returns!==void 0&&e.jsxs("span",{className:"text-emerald-600 dark:text-emerald-400 ml-2",children:["→ ",a.returns]})]},i)})})]})}function Mn({snapshot:n}){return e.jsxs("div",{children:[e.jsx("div",{className:"text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2",children:"Linked List"}),n.nodes.length===0?e.jsx("div",{className:"px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 italic",children:"null (empty)"}):e.jsxs("div",{className:"flex items-center gap-1.5 flex-wrap",children:[n.nodes.map((a,i)=>e.jsxs(ee.Fragment,{children:[e.jsxs("div",{className:"flex flex-col items-center gap-0.5",children:[a.label&&e.jsx("span",{className:"text-[10px] font-bold text-indigo-500",children:a.label}),e.jsx(Je,{index:i,cell:{value:a.value,highlight:a.highlight}})]}),i<n.nodes.length-1&&e.jsx("span",{className:"text-slate-400 font-mono",children:"→"})]},i)),e.jsxs("span",{className:"text-slate-400 font-mono",children:["→ ",n.tail??"null"]})]})]})}function Hn({snapshot:n}){const a=Math.max(1,...n.events.map(i=>i.t));return e.jsxs("div",{children:[e.jsxs("div",{className:"text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2",children:["Timeline ",n.windowMs&&e.jsxs("span",{className:"ml-1 text-indigo-500",children:["· window ",n.windowMs,"ms"]})]}),e.jsxs("div",{className:"relative h-12 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800",children:[e.jsx("div",{className:"absolute inset-x-2 top-1/2 h-px bg-slate-300 dark:bg-slate-700"}),n.events.map((i,h)=>{const p=`${i.t/a*100}%`,v=i.kind==="fire"?"bg-emerald-500 text-white":i.kind==="input"?"bg-indigo-500 text-white":i.kind==="skip"?"bg-slate-300 dark:bg-slate-700 text-slate-500":"bg-amber-400 text-white";return e.jsx("div",{style:{left:p},className:`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold ${v} whitespace-nowrap`,children:i.label},h)})]})]})}function Fn({outcome:n}){return n.kind==="hit"?e.jsxs("div",{className:"px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-medium",children:["✓ ",e.jsx("code",{className:"font-mono mx-1",children:n.key})," is in the map (at index ",e.jsx("code",{className:"font-mono",children:n.at}),")"]}):e.jsxs("div",{className:"px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-medium",children:["✕ ",e.jsx("code",{className:"font-mono mx-1",children:n.key})," is not in the map — store the current number and continue"]})}const Jn=new Set(["Two Sum","Reverse String","Valid Palindrome","FizzBuzz","Max Profit","Valid Parentheses","Merge Sorted Arrays","Flatten Array","Debounce","Group Anagrams","Find Duplicates","Remove Duplicates","Find Missing Number","Move Zeros","Rotate Array","Bubble Sort","Quick Sort","Merge Sort","Anagram Check","Longest Substring","First Non-Repeating Char","Sum Curry","Memoize","Deep Clone","Throttle","EventEmitter","LRU Cache","Compose & Pipe","Binary Search","Roman to Integer","Reverse Linked List","Container With Most Water","Climbing Stairs","Balanced Brackets (Count)","Second Largest Number","Maximum Subarray","Trapping Rain Water","3Sum","Generate Parentheses","Subsets","Permutations","Min Stack","Daily Temperatures","Coin Change","House Robber","Jump Game","Detect Cycle in Linked List","Merge Two Sorted Lists","Sort Colors","Top K Frequent Elements","Subarray Sum Equals K","Single Number","Single Number II","Majority Element","Product of Array Except Self","Plus One","Longest Common Prefix","Longest Palindromic Substring","Reverse Vowels of a String","String to Integer (atoi)","Letter Combinations of Phone Number","Reverse Words in a String","Rotate Array Left","Spiral Matrix","Search in Rotated Sorted Array","Find Maximum in Array","Find Min and Max","Third Largest Number","Kth Largest Element","Find Peak Element","Hello World","Array Methods","Closures","Promises & Async","Map & Set","Spread & Rest","Event Loop & Microtasks","this Keyword","Debounce & Throttle","Currying","Prototypes & Classes","Destructuring Deep Dive","Tricky Interview Q","useState Counter","useEffect Lifecycle","Custom Hook","useReducer Todo","Context API","React Compiler Patterns","Array.map","Array.filter","Array.reduce","Array.forEach","Array.find & findIndex","Array.some & every","Array.flat & flatMap","Function.bind","Function.call & apply","Promise.all","Promise.allSettled","Promise.race & any","Array.includes","Object.assign","Array.from","Array.sort","Array.indexOf / lastIndexOf","Array.reverse","Array.slice","Array.splice","Array.concat","String.padStart / padEnd","JSON.stringify","Object.keys / values / entries","JSON.parse","Array.isArray","Object.create","Object.freeze + deepFreeze","Array.prototype.fill","String.prototype.repeat","Array.prototype.join"]);Fe.registerLanguage("javascript",_t);Fe.registerLanguage("typescript",Vt);Fe.registerLanguage("xml",Kt);function zn(n,a){try{return Fe.highlight(n,{language:a,ignoreIllegals:!0}).value}catch{return Fe.highlight(n,{language:"javascript",ignoreIllegals:!0}).value}}const ct={"(":")","[":"]","{":"}"},Ot={")":"(","]":"[","}":"{"};function Bn(n){const a=[],i=new Map;let h=null,p=!1,v=!1;for(let S=0;S<n.length;S++){const b=n[S],J=n[S+1];if(p){b===`
`&&(p=!1);continue}if(v){b==="*"&&J==="/"&&(v=!1,S++);continue}if(h){if(b==="\\"){S++;continue}b===h&&(h=null);continue}if(b==="/"&&J==="/"){p=!0,S++;continue}if(b==="/"&&J==="*"){v=!0,S++;continue}if(b==='"'||b==="'"||b==="`"){h=b;continue}if(b in ct)a.push({ch:b,pos:S});else if(b in Ot){const M=a.pop();M&&ct[M.ch]===b&&(i.set(M.pos,S),i.set(S,M.pos))}}return i}function $n(n,a,i){if(a<0)return null;const h=a>0?[a-1,a]:[a];for(const p of h){if(p<0||p>=n.length)continue;const v=n[p];if(!(v in ct)&&!(v in Ot))continue;const S=i.get(p);if(S!==void 0)return[Math.min(p,S),Math.max(p,S)]}return null}const jt=["hljs-string","hljs-comment","hljs-regexp","hljs-meta-string"];function Wn(n,a,i){if(typeof document>"u")return n;const h=Bn(a),p=$n(a,i,h),v=document.createElement("div");v.innerHTML=n;let S=0,b=0;const J=m=>{let d=m;for(;d;){for(const R of jt)if(d.classList.contains(R))return!0;d=d.parentElement}return!1},M=m=>{const d=Array.from(m.childNodes);for(const R of d)if(R.nodeType===3){const y=R.nodeValue||"";if(J(R.parentElement)){S+=y.length;continue}w(R,y)}else if(R.nodeType===1){const y=R;let T=!1;for(const c of jt)if(y.classList.contains(c)){T=!0;break}if(T){S+=(y.textContent||"").length;continue}M(y)}},w=(m,d)=>{if(!/[(){}\[\]]/.test(d)){S+=d.length;return}const R=m.parentNode,y=document.createDocumentFragment();let T="";const c=()=>{T&&(y.appendChild(document.createTextNode(T)),T="")};for(let f=0;f<d.length;f++){const z=d[f],te=S+f,ne=z in ct,C=z in Ot;if(!ne&&!C){T+=z;continue}c();let g;ne?(g=b,b++):(b=Math.max(0,b-1),g=b);const j=document.createElement("span"),L=[`bd-${g%3}`];p&&(p[0]===te||p[1]===te)&&L.push("bd-match"),j.className=L.join(" "),j.textContent=z,y.appendChild(j)}c(),R.replaceChild(y,m),S+=d.length};return M(v),v.innerHTML}let st=null;async function Un(){if(st)return st;const[n,a,i,h]=await Promise.all([we(()=>import("./standalone-Bbiu-iPQ.js"),[]),we(()=>import("./babel-BDuGyvJ-.js"),[]),we(()=>import("./estree-DNtOLT3f.js"),[]),we(()=>import("./typescript-B8L4dAC6.js"),[])]);return st={format:n.format,plugins:[a.default??a,i.default??i,h.default??h]},st}async function Gn(n,a){const{format:i,plugins:h}=await Un(),v=a==="ts"||a==="tsx"||Ft(n)?"typescript":"babel";return i(n,{parser:v,plugins:h,tabWidth:2,useTabs:!1,semi:!0,singleQuote:!0,trailingComma:"all",printWidth:80,arrowParens:"always",bracketSpacing:!0})}const Lt={"(":")","[":"]","{":"}",'"':'"',"'":"'","`":"`"},qn=new Set([")","]","}",'"',"'","`"]);let at=null;async function Yn(){return at||(at=(await we(()=>import("./playgroundExplanations-DfuU4bX5.js"),[])).playgroundExplanations,at)}let rt=null;async function _n(){return rt||(rt=(await we(()=>import("./playgroundSolutions-kT_swTNO.js"),[])).playgroundSolutions,rt)}function wt(n){if(n===null)return"null";if(n===void 0)return"undefined";if(typeof n=="string")return n;if(typeof n=="function")return`[Function: ${n.name||"anonymous"}]`;if(n instanceof Error)return`${n.name}: ${n.message}`;try{return JSON.stringify(n,null,2)}catch{return String(n)}}function It(n){return!!(/render\s*\(/.test(n)||/<[A-Z][A-Za-z0-9]*/.test(n)||/return\s*\(?\s*<[a-zA-Z]/.test(n)||/\b(useState|useEffect|useRef|useMemo|useCallback|useReducer|useContext|useLayoutEffect)\s*\(/.test(n))}const Vn=`
function formatVal(v) {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return v;
  if (typeof v === 'function') return '[Function: ' + (v.name || 'anonymous') + ']';
  if (v instanceof Error) return v.name + ': ' + v.message;
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}
const post = (type, text) => self.postMessage({ kind: 'log', type, text });
const origConsole = self.console;
self.console = {
  ...origConsole,
  log:   (...a) => post('log',   a.map(formatVal).join(' ')),
  warn:  (...a) => post('warn',  a.map(formatVal).join(' ')),
  error: (...a) => post('error', a.map(formatVal).join(' ')),
};
self.onmessage = (e) => {
  try {
    const result = new Function(e.data)();
    if (result !== undefined) post('result', '→ ' + formatVal(result));
  } catch (err) {
    post('error', (err && err.name ? err.name : 'Error') + ': ' + (err && err.message ? err.message : String(err)));
  }
  self.postMessage({ kind: 'sync-done' });
};
`;function Kn(n,a=3e3){return new Promise(i=>{const h=new Blob([Vn],{type:"application/javascript"}),p=URL.createObjectURL(h),v=new Worker(p),S=[];let b=!1,J=!1,M=null;const w=()=>{try{v.terminate()}catch{}try{URL.revokeObjectURL(p)}catch{}},m=R=>{b||(b=!0,clearTimeout(d),M!==null&&clearTimeout(M),w(),i({logs:S,timedOut:R}))},d=window.setTimeout(()=>{J||(S.push({type:"error",text:`⏱️ Execution timed out after ${a/1e3}s — your code is likely stuck in an infinite loop. The worker was force-stopped.`}),m(!0))},a);v.onmessage=R=>{const y=R.data;y.kind==="log"?S.push({type:y.type,text:y.text}):y.kind==="sync-done"&&(J=!0,M=window.setTimeout(()=>m(!1),400))},v.onerror=R=>{S.push({type:"error",text:R.message||"Worker error"}),m(!1)},v.postMessage(n)})}let kt=null;async function Xn(n,a){kt||(kt=await we(()=>import("./babel-DgCu6knF.js").then(p=>p.b),__vite__mapDeps([0,1])));const i=[];return a.ts&&i.push(["typescript",{isTSX:a.jsx,allExtensions:!0}]),a.jsx&&i.push("react"),kt.transform(n,{presets:i,filename:a.ts?a.jsx?"playground.tsx":"playground.ts":"playground.jsx"}).code}function Ft(n){return/\binterface\s+[A-Z]/.test(n)||/:\s*(string|number|boolean|any|unknown|void|never|object|Array|Record|Map|Set|Promise)\b/.test(n)||/\bas\s+(string|number|boolean|const|unknown)\b/.test(n)||/<[A-Za-z][\w]*\s*,\s*[A-Za-z]/.test(n)}function Qn(n){const a=n;let i=n.replace(/^[ \t]*import\s+[\s\S]*?\s+from\s*['"][^'"]+['"]\s*;?[ \t]*$/gm,"").replace(/^[ \t]*import\s*['"][^'"]+['"]\s*;?[ \t]*$/gm,"").replace(/^[ \t]*export\s*\{[^}]*\}\s*(?:from\s*['"][^'"]+['"])?\s*;?[ \t]*$/gm,"").replace(/^[ \t]*export\s+\*\s+from\s*['"][^'"]+['"]\s*;?[ \t]*$/gm,"").replace(/^([ \t]*)export\s+default\s+/gm,"$1").replace(/^([ \t]*)export\s+(?=(?:async\s+)?(?:function|class|const|let|var)\b)/gm,"$1");return i=i.replace(/\n{3,}/g,`

`),{code:i,stripped:i!==a}}function as(){const n=(()=>{const t=sessionStorage.getItem("playground-code");if(t)return{code:t,selectedName:null,lang:"js"};const s=localStorage.getItem("playground-last-session");if(s){const l=q.find(E=>E.name===s);if(l)try{const E=JSON.parse(localStorage.getItem("playground-progress")||"{}"),P=E==null?void 0:E[s];return{code:P&&typeof P.code=="string"&&P.code||l.code,selectedName:s,lang:l.lang??(l.jsx?"jsx":"js")}}catch{return{code:l.code,selectedName:s,lang:l.lang??(l.jsx?"jsx":"js")}}}const u=q[0];return{code:u.code,selectedName:u.name,lang:u.lang??(u.jsx?"jsx":"js")}})(),[a,i]=r.useState(n.code),[h,p]=r.useState([]),[v,S]=r.useState(!1),[b,J]=r.useState(!1),[M,w]=r.useState(!1),[m,d]=r.useState(n.selectedName),[R,y]=r.useState(!1),[T,c]=r.useState(""),[f,z]=r.useState("all"),[te,ne]=r.useState("all"),[C,g]=r.useState("all"),[j,L]=r.useState("all"),[O,dt]=r.useState("templates"),[W,ze]=r.useState(n.lang),Le=r.useRef(null),B=r.useRef(null),Ie=r.useRef(null),I=r.useRef([]),Q=r.useRef(null),Be=r.useRef(null),[De,ut]=r.useState(()=>{const t=parseFloat(localStorage.getItem("playground-split-pct")||"");return Number.isFinite(t)&&t>=20&&t<=80?t:50}),[pt,Pe]=r.useState(!1),[mt,xe]=r.useState(-1),$e=On(),{getEntry:H,saveEntry:We,markSolved:Ue,clearEntry:gt,setLastSession:Ge,solvedCount:ft,lastSessionName:ue}=$e,[ve,pe]=r.useState(""),[Me,qe]=r.useState(!1),[Y,D]=r.useState(null),[ke,Ye]=r.useState(!1),[me,ht]=r.useState(()=>(typeof window<"u"&&localStorage.getItem("playground-wrap"))!=="0"),[_e,ie]=r.useState(null),ae=It(a)||W==="jsx"||W==="tsx",Ce=W==="ts"||W==="tsx"?"typescript":"javascript",Ve=W==="tsx"?"React TSX":W==="ts"?"TypeScript":W==="jsx"||ae?"React JSX":"JavaScript",He=r.useMemo(()=>q.filter(t=>t.kind==="challenge"&&t.tag==="JS").length,[]),ge=r.useMemo(()=>["all",...[...new Set(Ct.map(s=>s.tag))].map(s=>s.toLowerCase())],[]),fe=r.useMemo(()=>{const t=O==="challenges"?"challenge":"template";return Ct.filter(s=>(s.kind??"template")===t).filter(s=>f==="all"||s.tag.toLowerCase()===f).map(s=>{const u=s.templates.filter(l=>!(!l.name.toLowerCase().includes(T.toLowerCase())||te!=="all"&&(!l.patterns||!l.patterns.includes(te))||C!=="all"&&l.difficulty!==C));if(C==="all"&&O==="challenges"){const l={Easy:1,Medium:2,Hard:3},E=[...u].sort((P,F)=>{const X=P.difficulty?l[P.difficulty]:99,U=F.difficulty?l[F.difficulty]:99;return X-U});return{...s,templates:E}}return{...s,templates:u}}).filter(s=>s.templates.length>0)},[T,f,O,te,C]),Oe=r.useMemo(()=>{const t={Easy:0,Medium:0,Hard:0};for(const s of q)s.kind!=="challenge"||!s.difficulty||t[s.difficulty]++;return t},[]),Ne=r.useMemo(()=>{const t=Object.fromEntries(vn.map(s=>[s,0]));for(const s of q)if(!(s.kind!=="challenge"||!s.patterns))for(const u of s.patterns)t[u]=(t[u]||0)+1;return t},[]);r.useEffect(()=>{sessionStorage.removeItem("playground-code")},[]),r.useEffect(()=>{if(!m)return;const t=H(m);t&&t.code&&t.code!==a?(i(t.code),pe(t.notes??"")):t!=null&&t.notes&&pe(t.notes)},[]),r.useEffect(()=>{if(!m||R)return;const t=window.setTimeout(()=>{We(m,{code:a,notes:ve})},800);return()=>window.clearTimeout(t)},[a,ve,m,R,We]),r.useEffect(()=>{localStorage.setItem("playground-split-pct",String(De))},[De]),r.useEffect(()=>{localStorage.setItem("playground-wrap",me?"1":"0")},[me]);const Ke=r.useCallback(t=>{t.preventDefault();const s=Be.current;if(!s)return;Pe(!0),document.body.style.cursor="col-resize",document.body.style.userSelect="none";const u=F=>{const X=s.getBoundingClientRect(),U=(F-X.left)/X.width*100;ut(Math.max(20,Math.min(80,U)))},l=F=>u(F.clientX),E=F=>{F.touches.length&&u(F.touches[0].clientX)},P=()=>{document.removeEventListener("mousemove",l),document.removeEventListener("mouseup",P),document.removeEventListener("touchmove",E),document.removeEventListener("touchend",P),document.body.style.cursor="",document.body.style.userSelect="",Pe(!1)};document.addEventListener("mousemove",l),document.addEventListener("mouseup",P),document.addEventListener("touchmove",E,{passive:!1}),document.addEventListener("touchend",P)},[]);r.useEffect(()=>{const t=()=>{const s=document.getElementById("playground-editor");s&&(document.activeElement===s?xe(s.selectionStart??-1):xe(-1))};return document.addEventListener("selectionchange",t),()=>document.removeEventListener("selectionchange",t)},[]),r.useEffect(()=>{const t=console.log,s=console.warn,u=console.error,l=E=>{I.current=[...I.current,E]};return console.log=(...E)=>{l({type:"log",text:E.map(wt).join(" ")})},console.warn=(...E)=>{l({type:"warn",text:E.map(wt).join(" ")})},console.error=(...E)=>{l({type:"error",text:E.map(wt).join(" ")})},()=>{if(console.log=t,console.warn=s,console.error=u,Q.current!==null&&(window.clearInterval(Q.current),Q.current=null),B.current){try{B.current.unmount()}catch{}B.current=null}}},[]);const o=r.useCallback(async()=>{if(J(!0),I.current=[],p([]),B.current){try{B.current.unmount()}catch{}B.current=null}w(!1),Q.current!==null&&(window.clearInterval(Q.current),Q.current=null);let t=!1;try{let l=a;const E=It(a)||W==="jsx"||W==="tsx",P=W==="ts"||W==="tsx"||Ft(a),{code:F,stripped:X}=Qn(a);X&&(I.current=[...I.current,{type:"warn",text:"import/export statements were ignored — the playground runs a script, not a module. React, useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext, memo, Fragment and render are already in scope."}]);let U=F;if(E&&!(/(?:^|\n|;)\s*render\s*\(\s*</.test(U)||/ReactDOM\.(render|createRoot)/.test(U))){const Z=U.match(/class\s+([A-Z][A-Za-z0-9_]*)\s+extends/)||U.match(/function\s+([A-Z][A-Za-z0-9_]*)\s*\(/)||U.match(/(?:const|let|var)\s+([A-Z][A-Za-z0-9_]*)\s*=/);Z&&(U=`${U.replace(/\s+$/,"")}

render(<${Z[1]} />);`)}if(E||P?l=await Xn(U,{jsx:E,ts:P}):l=U,E){const be=bt=>{if(Le.current){if(B.current)try{B.current.unmount()}catch{}B.current=qt.createRoot(Le.current),B.current.render(bt),w(!0),t=!0}},Z={React:ee,useState:ee.useState,useEffect:ee.useEffect,useRef:ee.useRef,useMemo:ee.useMemo,useCallback:ee.useCallback,useReducer:ee.useReducer,useContext:ee.useContext,createContext:ee.createContext,memo:ee.memo,Fragment:ee.Fragment,render:be},je=Object.keys(Z),de=Object.values(Z);new Function(...je,l)(...de),t||(I.current=[...I.current,{type:"error",text:"No render() call detected. For React components, end your code with: render(<YourComponent />);"}])}else{const{logs:be,timedOut:Z}=await Kn(l,3e3);I.current=[...I.current,...be],Z&&ie("Execution timed out — infinite loop killed")}}catch(l){I.current=[...I.current,{type:"error",text:`${l.name}: ${l.message}`}]}finally{J(!1)}p([...I.current]);const s=I.current.filter(l=>l.text.includes("✅")).length,u=I.current.filter(l=>l.text.includes("❌")).length;s+u>0?(D({pass:s,fail:u}),u===0&&m&&(A==null?void 0:A.kind)==="challenge"&&(A==null?void 0:A.tag)==="JS"&&Ue(m)):D(null),t?Q.current=window.setInterval(()=>{p(l=>l.length!==I.current.length?[...I.current]:l)},250):window.setTimeout(()=>p([...I.current]),600)},[a,W,m,Ue]);r.useEffect(()=>{const t=s=>{(s.metaKey||s.ctrlKey)&&s.key==="Enter"&&(s.preventDefault(),o()),s.key==="Escape"&&v&&S(!1)};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[o,v]);const N=r.useCallback(()=>{Q.current!==null&&(window.clearInterval(Q.current),Q.current=null)},[]),x=r.useCallback(t=>{if(N(),B.current){try{B.current.unmount()}catch{}B.current=null}I.current=[];const s=H(t.name),u=s&&s.code&&s.code!==t.code;i(u?s.code:t.code),pe((s==null?void 0:s.notes)??""),u&&ie(`Resumed your saved work in "${t.name}"`),ze(t.lang??(t.jsx?"jsx":"js")),p([]),w(!1),d(t.name),y(!1),S(!1),c(""),D(null),Ge(t.name)},[N,H,Ge]),k=r.useCallback(t=>{x({name:`Blank ${t.name}`,code:t.code,lang:t.lang})},[x]),A=r.useMemo(()=>m?q.find(t=>t.name===m)??null:null,[m]),$=!!(m&&Cn.has(m)),V=!!(m&&Jn.has(m)),[le,he]=r.useState(!1),[ce,K]=r.useState(!1),[re,ye]=r.useState(!1),[G,Se]=r.useState(null),[Ae,Re]=r.useState(!1),[oe,Xe]=r.useState(()=>(typeof window<"u"&&localStorage.getItem("playground-bracket-autoclose"))!=="0"),se=r.useCallback(async()=>{if(!(!A||!$)){if(R){const t=H(A.name);i((t==null?void 0:t.code)??A.code),y(!1);return}he(!0);try{const s=(await _n())[m];s&&(i(s),y(!0))}finally{he(!1)}}},[A,$,R,m,H]),Ee=r.useCallback(async()=>{if(!(!V||!m)){K(!0);try{const s=(await Yn())[m]||null;Se(s),s&&ye(!0)}finally{K(!1)}}},[V,m]),Te=r.useCallback(async()=>{if(!Ae){Re(!0);try{const s=(await Gn(a,W)).replace(/\n$/,"");s!==a&&(i(s),I.current=[...I.current,{type:"log",text:"Formatted with Prettier."}],p([...I.current]))}catch(t){I.current=[...I.current,{type:"error",text:`Couldn't format: ${(t==null?void 0:t.message)??String(t)}`}],p([...I.current])}finally{Re(!1)}}},[a,W,Ae]),Qe=r.useCallback(()=>{Xe(t=>{const s=!t;try{localStorage.setItem("playground-bracket-autoclose",s?"1":"0")}catch{}return s})},[]),Ze=r.useCallback(t=>{var U;const s=t;if((s.metaKey||s.ctrlKey)&&s.shiftKey&&(s.key==="f"||s.key==="F")){s.preventDefault(),Te();return}const u=s.currentTarget,l=u.selectionStart,E=u.selectionEnd,P=a.substring(0,l),F=a.substring(E),X=a.substring(l,E);if(s.key==="Enter"&&!s.shiftKey&&!s.metaKey&&!s.ctrlKey){const be=P.lastIndexOf(`
`)+1,Z=P.substring(be),je=((U=Z.match(/^[ \t]*/))==null?void 0:U[0])??"",de=Z.trimEnd(),bt=de.endsWith("{")||de.endsWith("[")||de.endsWith("(")||de.endsWith("=>")?"  ":"",$t=de.endsWith("{")&&F.startsWith("}"),Wt=de.endsWith("[")&&F.startsWith("]"),Ut=de.endsWith("(")&&F.startsWith(")"),Gt=$t||Wt||Ut;if(s.preventDefault(),Gt){const et=`
${je}  
${je}`;i(P+et+F);const xt=l+1+je.length+2;requestAnimationFrame(()=>{u.selectionStart=u.selectionEnd=xt})}else{const et=`
${je}${bt}`;i(P+et+F);const xt=l+et.length;requestAnimationFrame(()=>{u.selectionStart=u.selectionEnd=xt})}return}if(oe){if(qn.has(s.key)&&a[l]===s.key&&l===E){s.preventDefault(),requestAnimationFrame(()=>{u.selectionStart=u.selectionEnd=l+1});return}if(Lt[s.key]){const be=Lt[s.key];if((s.key==="'"||s.key==='"'||s.key==="`")&&/\w/.test(a[l-1]||""))return;s.preventDefault();const Z=P+s.key+X+be+F;i(Z),requestAnimationFrame(X?()=>{u.selectionStart=l+1,u.selectionEnd=E+1}:()=>{u.selectionStart=u.selectionEnd=l+1});return}}},[a,oe,Te]),Jt=r.useCallback(()=>{if(N(),B.current){try{B.current.unmount()}catch{}B.current=null}I.current=[],p([]),w(!1)},[N]),zt=r.useCallback(()=>{S(!0),c(""),z("all"),L("all"),setTimeout(()=>{var t;return(t=Ie.current)==null?void 0:t.focus()},200)},[]),yt=r.useCallback(()=>{S(!1)},[]);return e.jsxs("div",{className:"flex flex-col h-[calc(100vh-3.5rem)] md:h-screen relative",children:[e.jsx(Mt,{children:v&&e.jsxs(e.Fragment,{children:[e.jsx(lt.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]",onClick:yt}),e.jsxs(lt.div,{initial:{opacity:0,scale:.97,y:8},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.97,y:8},transition:{type:"spring",damping:26,stiffness:320},className:"fixed inset-0 m-auto w-[min(960px,94vw)] h-[min(620px,88vh)] bg-white dark:bg-[#0f0f1a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-[90] flex flex-col overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20",children:e.jsx(At,{size:16,className:"text-white"})}),e.jsxs("div",{children:[e.jsx("h2",{className:"font-bold text-base leading-tight",children:O==="templates"?"Templates":O==="challenges"?"Coding Challenges":"Blank Starters"}),e.jsx("span",{className:"text-[11px] text-slate-400",children:O==="blank"?"Start fresh in JS, TS, or React":O==="challenges"?`${q.filter(t=>t.kind==="challenge").length} challenges to solve`:`${q.filter(t=>t.kind==="template").length} reference snippets`})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-[260px]",children:[e.jsx(vt,{size:13,className:"text-slate-400 shrink-0"}),e.jsx("input",{ref:Ie,value:T,onChange:t=>c(t.target.value),onKeyDown:t=>t.key==="Escape"&&yt(),placeholder:"Search templates...",className:"flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"}),T&&e.jsx("button",{onClick:()=>{var t;c(""),(t=Ie.current)==null||t.focus()},className:"text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors",children:e.jsx(ot,{size:13})})]}),e.jsx("button",{onClick:yt,className:"p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",children:e.jsx(ot,{size:16})})]})]}),e.jsxs("div",{className:"flex items-center gap-1 px-5 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20",children:[[{id:"templates",label:"Templates",count:q.filter(t=>t.kind==="template").length},{id:"challenges",label:"Challenges",count:q.filter(t=>t.kind==="challenge").length},{id:"blank",label:"Blank",count:St.length}].map(({id:t,label:s,count:u})=>e.jsxs("button",{onClick:()=>dt(t),className:"flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors "+(O===t?"bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300":"text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 dark:text-slate-400"),children:[s,e.jsx("span",{className:"text-[10px] px-1.5 py-0.5 rounded-md "+(O===t?"bg-indigo-100 dark:bg-indigo-900/60":"bg-slate-100 dark:bg-slate-800"),children:u})]},t)),O==="challenges"&&e.jsxs("button",{onClick:()=>{const t=q.filter(u=>{var l;return u.kind==="challenge"&&u.tag==="JS"&&((l=H(u.name))==null?void 0:l.status)!=="solved"});if(t.length===0){ie("All challenges solved 🎉");return}const s=t[Math.floor(Math.random()*t.length)];x(s)},className:"ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors",title:"Open a random unsolved challenge",children:[e.jsx(an,{size:12}),"Random"]})]}),O==="blank"?e.jsxs("div",{className:"flex-1 overflow-auto p-8 bg-slate-50/40 dark:bg-slate-900/20",children:[e.jsx("p",{className:"text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xl",children:"Pick a language and start with a tiny scaffold — no template content. Run, edit, experiment."}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:St.map(t=>{const s=t.lang==="jsx"||t.lang==="tsx";return e.jsxs("button",{onClick:()=>k(t),className:"group text-left p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx("span",{className:"text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider "+(s?"bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300":t.lang==="ts"?"bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300":"bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"),children:t.lang.toUpperCase()}),e.jsx("span",{className:"font-semibold text-base",children:t.name})]}),e.jsx("p",{className:"text-xs text-slate-500 dark:text-slate-400 leading-relaxed",children:t.description}),e.jsxs("div",{className:"mt-3 inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity",children:["Start ",e.jsx(it,{size:11})]})]},t.name)})})]}):e.jsxs("div",{className:"flex-1 flex min-h-0",children:[e.jsxs("div",{className:"w-[220px] shrink-0 border-r border-slate-100 dark:border-slate-800 py-3 overflow-y-auto sidebar-scroll bg-slate-50/60 dark:bg-slate-900/40",children:[e.jsx("div",{className:"px-3 pb-3 flex gap-1.5 flex-wrap",children:ge.map(t=>{const s=O==="challenges"?"challenge":"template",u=q.filter(E=>(E.kind??"template")===s),l=t==="all"?u.length:u.filter(E=>E.tag.toLowerCase()===t).length;return e.jsxs("button",{onClick:()=>z(t),className:["px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all capitalize flex items-center gap-1",f===t?"bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300":"bg-white dark:bg-slate-800/70 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"].join(" "),children:[t==="all"?"All":t,e.jsx("span",{className:"text-[9px] opacity-60",children:l})]},t)})}),e.jsx("div",{className:"px-2",children:O==="challenges"?e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:()=>ne("all"),className:["w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between",te==="all"?"bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium":"text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"].join(" "),children:[e.jsxs("span",{className:"flex items-center gap-2",children:[te==="all"&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-indigo-500"}),e.jsx("span",{children:"All patterns"})]}),e.jsx("span",{className:"text-[10px] text-slate-400",children:q.filter(t=>!(t.kind!=="challenge"||f!=="all"&&t.tag.toLowerCase()!==f||T&&!t.name.toLowerCase().includes(T.toLowerCase()))).length})]}),Sn.map(t=>{const s=t.patterns.filter(u=>Ne[u]>0);return s.length===0?null:e.jsxs("div",{className:"mt-3",children:[e.jsx("div",{className:"px-3 mb-1 text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500",children:t.label}),s.map(u=>{const l=te===u;return e.jsxs("button",{onClick:()=>ne(l?"all":u),className:["w-full text-left px-3 py-1.5 mt-0.5 rounded-lg text-[12.5px] transition-colors flex items-center justify-between gap-2",l?"bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium":"text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"].join(" "),title:`${Ne[u]} challenge${Ne[u]===1?"":"s"} use this pattern`,children:[e.jsxs("span",{className:"truncate flex items-center gap-2",children:[l&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"}),u]}),e.jsx("span",{className:"text-[10px] text-slate-400 shrink-0",children:Ne[u]})]},u)})]},t.label)})]}):e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:()=>L("all"),className:["w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between",j==="all"?"bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium":"text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"].join(" "),children:[e.jsx("span",{children:"All categories"}),e.jsx("span",{className:"text-[10px] text-slate-400",children:fe.reduce((t,s)=>t+s.templates.length,0)})]}),fe.map(t=>{const s=j===t.label;return e.jsxs("button",{onClick:()=>L(t.label),className:["w-full text-left px-3 py-2 mt-0.5 rounded-lg text-[13px] transition-colors flex items-center justify-between gap-2",s?"bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium":"text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"].join(" "),children:[e.jsxs("span",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("span",{className:["text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0",t.tag==="React"?"bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400":t.tag==="Polyfills"?"bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400":"bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"].join(" "),children:t.tag}),e.jsx("span",{className:"truncate",children:t.label})]}),e.jsx("span",{className:"text-[10px] text-slate-400 shrink-0",children:t.templates.length})]},t.label)})]})})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto sidebar-scroll p-4",children:[e.jsxs("div",{className:"sm:hidden mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700",children:[e.jsx(vt,{size:13,className:"text-slate-400 shrink-0"}),e.jsx("input",{value:T,onChange:t=>c(t.target.value),placeholder:"Search templates...",className:"flex-1 bg-transparent outline-none text-sm"})]}),O==="challenges"&&e.jsxs("div",{className:"flex items-center gap-1.5 mb-3 flex-wrap",children:[e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1",children:"Difficulty:"}),["all","Easy","Medium","Hard"].map(t=>{const s=C===t,u=t==="all"?Oe.Easy+Oe.Medium+Oe.Hard:Oe[t],l=t==="Easy"?s?"bg-emerald-600 text-white":"bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40":t==="Medium"?s?"bg-amber-600 text-white":"bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40":t==="Hard"?s?"bg-red-600 text-white":"bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40":s?"bg-indigo-600 text-white":"bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700";return e.jsxs("button",{onClick:()=>g(s&&t!=="all"?"all":t),className:"inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors "+l,children:[t==="all"?"All":t,e.jsx("span",{className:"text-[9px] px-1 rounded "+(s?"bg-white/20":"bg-white/40 dark:bg-slate-900/40"),children:u})]},t)})]}),fe.length===0?e.jsxs("div",{className:"h-full flex flex-col items-center justify-center py-12 text-slate-400",children:[e.jsx(vt,{size:32,className:"mb-3 opacity-40"}),e.jsx("p",{className:"text-sm font-medium",children:"No templates found"}),e.jsx("p",{className:"text-xs mt-1",children:"Try a different search or filter"})]}):(j==="all"?fe:fe.filter(t=>t.label===j)).map(t=>e.jsxs("div",{className:"mb-5 last:mb-0",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2.5",children:[e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400",children:t.label}),e.jsx("span",{className:["text-[9px] px-1.5 py-0.5 rounded-full font-semibold",t.tag==="React"?"bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400":t.tag==="Polyfills"?"bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400":"bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"].join(" "),children:t.tag})]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2",children:t.templates.map(s=>{var P,F;const u=m===s.name,l=H(s.name),E=(l==null?void 0:l.status)==="solved"?"bg-emerald-500":l?"bg-amber-400":"";return e.jsxs("button",{onClick:()=>x(s),className:["text-left px-3 py-2.5 rounded-xl text-[13px] transition-all flex items-center gap-2 group border",u?"bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm":"bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-slate-700 dark:text-slate-300"].join(" "),title:(l==null?void 0:l.status)==="solved"?"Solved":l?"In progress":void 0,children:[E&&e.jsx("span",{className:`w-2 h-2 rounded-full shrink-0 ${E}`,"aria-hidden":!0}),e.jsxs("div",{className:"flex-1 min-w-0 flex flex-col gap-0.5",children:[e.jsx("span",{className:"truncate",children:s.name}),(((P=s.patterns)==null?void 0:P.length)||s.difficulty)&&e.jsxs("div",{className:"flex flex-wrap gap-0.5 items-center",children:[s.difficulty&&e.jsx("span",{className:"text-[9px] px-1 py-0 rounded font-semibold leading-tight "+(s.difficulty==="Easy"?"bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400":s.difficulty==="Medium"?"bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400":"bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"),title:`Difficulty: ${s.difficulty}`,children:s.difficulty}),(F=s.patterns)==null?void 0:F.map(X=>e.jsx("span",{className:"text-[9px] px-1 py-0 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 leading-tight",title:`Pattern: ${X}`,children:X},X))]})]}),s.jsx&&e.jsx("span",{className:"text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 shrink-0",children:"JSX"}),e.jsx(it,{size:12,className:"text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0"})]},s.name)})})]},t.label))]})]}),e.jsxs("div",{className:"px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between",children:[e.jsx("p",{className:"text-[11px] text-slate-400",children:O==="blank"?`${St.length} starters`:`${fe.reduce((t,s)=>t+s.templates.length,0)} matching`}),e.jsxs("p",{className:"text-[11px] text-slate-400",children:["Press ",e.jsx("kbd",{className:"px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono mx-0.5",children:"Esc"})," to close"]})]})]})]})}),e.jsxs("div",{className:"flex items-center justify-between px-4 py-3 border-b border-[#2d333b] bg-[#1c2028] shrink-0 text-slate-200",children:[e.jsxs("div",{className:"flex items-center gap-3 min-w-0",children:[e.jsx("button",{onClick:()=>window.dispatchEvent(new Event("prephub:show-sidebar")),className:"text-slate-400 hover:text-white transition-colors shrink-0 hidden md:flex p-1.5 rounded-lg hover:bg-[#2d333b]",title:"Show sidebar",children:e.jsx(rn,{size:16})}),e.jsx(Zt,{to:"/",className:"text-slate-400 hover:text-white transition-colors shrink-0",title:"Back to home",children:e.jsx(on,{size:18})}),e.jsx("h1",{className:"text-lg font-bold shrink-0 text-white",children:"Playground"}),m&&e.jsxs("span",{className:"text-sm text-slate-500 font-normal truncate hidden sm:inline",children:["— ",m]}),ae&&e.jsx("span",{className:"text-[10px] px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-400 font-semibold shrink-0",children:"React"}),e.jsxs("span",{className:"ml-auto md:ml-3 text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 font-medium shrink-0 hidden sm:inline",title:"JS coding challenges where every test (✅) passed. React Machine Coding has no test runner, so it's not counted here.",children:[ft," / ",He," JS solved"]})]}),e.jsxs("div",{className:"flex items-center gap-2 shrink-0",children:[e.jsxs("button",{onClick:zt,className:"flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-[#3d444d] text-slate-300 hover:bg-[#2d333b] hover:text-white transition-colors",children:[e.jsx(At,{size:14})," Templates"]}),V&&e.jsxs("button",{onClick:Ee,disabled:ce,className:"flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-indigo-500/50 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors disabled:opacity-60",title:"Step-by-step explanation with visual walkthrough",children:[ce?e.jsx(tt,{size:14,className:"animate-spin"}):e.jsx(ln,{size:14}),"Explain"]}),$&&e.jsxs("button",{onClick:se,disabled:le,className:"flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors disabled:opacity-60 "+(R?"border-amber-500 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20":"border-[#3d444d] text-slate-300 hover:bg-[#2d333b] hover:text-white"),title:R?"Switch back to the challenge":"Reveal the solution",children:[le?e.jsx(tt,{size:14,className:"animate-spin"}):e.jsx(cn,{size:14}),le?"Loading…":R?"Hide Solution":"Show Solution"]}),m&&A&&H(m)&&e.jsxs("button",{onClick:()=>{window.confirm("Reset to the original challenge stub? Your saved code for this challenge will be lost.")&&(i(A.code),pe(""),gt(m),D(null),ie(`Reset "${m}" to the original challenge stub`))},className:"flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-[#3d444d] text-slate-400 hover:text-white hover:bg-[#2d333b] transition-colors",title:"Reset code to the original challenge stub",children:[e.jsx(Dt,{size:14}),"Reset"]}),Y&&Y.pass+Y.fail>0&&e.jsxs("div",{className:"flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium "+(Y.fail===0?"bg-emerald-500/15 text-emerald-300 border border-emerald-500/40":"bg-red-500/15 text-red-300 border border-red-500/40"),title:"Tests detected from console ✅/❌ markers",children:[Y.fail===0?e.jsx(dn,{size:13}):e.jsx(un,{size:13}),Y.fail===0?`${Y.pass}/${Y.pass} passed`:`${Y.pass}/${Y.pass+Y.fail} — ${Y.fail} failed`]}),e.jsx("button",{onClick:Jt,className:"p-2 rounded-xl border border-[#3d444d] text-slate-400 hover:text-white hover:bg-[#2d333b] transition-colors",title:"Clear output",children:e.jsx(pn,{size:16})}),e.jsxs("button",{onClick:o,disabled:b,className:"flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm",children:[b?e.jsx(tt,{size:14,className:"animate-spin"}):e.jsx(Pt,{size:14}),b?"Running...":"Run"]})]})]}),!ke&&ue&&ue!==m&&(()=>{const t=H(ue);if(!t||t.status!=="in-progress")return null;const s=q.find(l=>l.name===ue);if(!s)return null;const u=(()=>{const l=Date.now()-new Date(t.updatedAt).getTime(),E=Math.round(l/6e4);if(E<1)return"just now";if(E<60)return`${E} min ago`;const P=Math.round(E/60);return P<24?`${P} hr ago`:`${Math.round(P/24)} d ago`})();return e.jsxs("div",{className:"px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/40 text-xs flex items-center gap-2 shrink-0",children:[e.jsx("span",{className:"text-indigo-300/80",children:"▶"}),e.jsxs("button",{onClick:()=>x(s),className:"text-indigo-300 hover:text-indigo-200 hover:underline font-medium",children:['Resume "',ue,'"']}),e.jsxs("span",{className:"text-slate-500",children:["— last edited ",u]}),e.jsx("button",{onClick:()=>Ye(!0),className:"ml-auto text-slate-500 hover:text-slate-300","aria-label":"Dismiss",title:"Dismiss for this session",children:e.jsx(ot,{size:12})})]})})(),e.jsxs("div",{ref:Be,className:"flex-1 flex flex-col md:flex-row min-h-0",children:[e.jsxs("div",{style:{"--editor-pct":`${De}%`},className:"flex flex-col min-h-0 border-b md:border-b-0 border-[#2d333b] w-full md:w-[var(--editor-pct)] flex-1 md:flex-none",children:[e.jsxs("div",{className:"px-4 py-2 h-10 text-xs font-medium text-slate-500 border-b border-[#2d333b] bg-[#22272e] shrink-0 flex items-center justify-between gap-2",children:[e.jsx("span",{children:Ve}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{onClick:Qe,className:"inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors "+(oe?"border-emerald-700/50 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30":"border-[#3d444d] text-slate-500 hover:bg-[#2d333b] hover:text-slate-300"),title:oe?"Bracket auto-close: ON (click to disable)":"Bracket auto-close: OFF (click to enable)",children:[e.jsx(mn,{size:11}),oe?"Auto-close on":"Auto-close off"]}),e.jsxs("button",{onClick:()=>ht(t=>!t),className:"inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors "+(me?"border-indigo-700/50 bg-indigo-900/20 text-indigo-300 hover:bg-indigo-900/30":"border-[#3d444d] text-slate-500 hover:bg-[#2d333b] hover:text-slate-300"),title:me?"Word wrap: ON (long lines break visually)":"Word wrap: OFF (long lines scroll horizontally)",children:[e.jsx(gn,{size:11}),me?"Wrap on":"Wrap off"]}),e.jsxs("button",{onClick:Te,disabled:Ae,className:"inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border border-[#3d444d] text-slate-300 hover:bg-[#2d333b] hover:text-white transition-colors disabled:opacity-60",title:"Format with Prettier (⌘⇧F)",children:[Ae?e.jsx(tt,{size:11,className:"animate-spin"}):e.jsx(fn,{size:11}),"Format"]}),e.jsxs("span",{className:"text-slate-600",children:[a.split(`
`).length," lines"]})]})]}),e.jsx("div",{className:`flex-1 overflow-auto bg-[#1e1e2e] min-h-[200px] playground-editor-wrap${me?" wrap-on":""}`,children:e.jsx(xn,{value:a,onValueChange:i,onKeyDown:Ze,highlight:t=>Wn(zn(t,Ce),t,mt),padding:16,tabSize:2,insertSpaces:!0,textareaId:"playground-editor",textareaClassName:"playground-editor-textarea",preClassName:"playground-editor-pre",style:{fontFamily:'"Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',fontSize:14,lineHeight:1.6,color:"#cdd6f4",caretColor:"#fff",minHeight:"100%"}})}),m&&e.jsxs("div",{className:"border-t border-[#2d333b] bg-[#1a1c25] shrink-0",children:[e.jsxs("button",{onClick:()=>qe(t=>!t),className:"w-full flex items-center justify-between px-4 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#22272e] transition-colors",title:Me?"Collapse notes":"Expand notes",children:[e.jsxs("span",{className:"inline-flex items-center gap-2",children:[e.jsx(hn,{size:12}),"Notes",ve.length>0&&e.jsxs("span",{className:"text-[10px] text-amber-400/80",children:["· ",ve.length," chars"]})]}),e.jsx(it,{size:12,className:Me?"rotate-90 transition-transform":"transition-transform"})]}),Me&&e.jsx("textarea",{value:ve,onChange:t=>pe(t.target.value),placeholder:"Scratchpad for thoughts on this challenge — approach, gotchas, time complexity ideas. Saved with your code.",className:"w-full h-32 px-4 py-2 bg-[#1e1e2e] text-slate-200 text-sm font-mono resize-none outline-none border-t border-[#2d333b]",spellCheck:!1})]})]}),e.jsx("div",{onMouseDown:Ke,onTouchStart:Ke,role:"separator","aria-orientation":"vertical","aria-label":"Resize editor and output panels",className:"hidden md:flex items-center justify-center shrink-0 w-1.5 cursor-col-resize transition-colors group "+(pt?"bg-indigo-500":"bg-[#2d333b] hover:bg-indigo-500/70"),children:e.jsx("div",{className:"w-0.5 h-8 rounded-full bg-slate-600 group-hover:bg-white transition-colors"})}),e.jsx(kn,{output:h,hasPreview:M,previewRef:Le})]}),e.jsx(Nn,{open:re,explanation:G,onClose:()=>ye(!1),onLoadTemplate:t=>{const s=q.find(u=>u.name===t);s&&x(s)}}),e.jsx(Yt,{message:_e,onClose:()=>ie(null)})]})}export{as as default};
