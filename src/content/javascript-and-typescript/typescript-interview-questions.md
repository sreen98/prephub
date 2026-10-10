# TypeScript — Interview Questions

Interview questions and model answers, from beginner to advanced. Each answer links to the section that explains it in depth.

Part of the TypeScript series: [TypeScript Guide](/javascript/typescript) · **TypeScript Interview Questions** · [TypeScript Tricky Questions](/javascript/typescript-tricky-questions)

---

## Table of Contents

- [15. Interview Questions & Answers](#15-interview-questions-answers)

---

## 15. Interview Questions & Answers

### Beginner

---

**Q1: What is TypeScript and how does it differ from JavaScript?**

**Short answer:** TypeScript is JavaScript plus a type system that is checked before the code runs and then deleted. Any valid JavaScript is already valid TypeScript ("superset"), so you can adopt it one file at a time.

The difference that matters is *when* you find out about a mistake. In JavaScript, `user.nmae` fails when that line runs, possibly in production, and only on the paths you exercise; in TypeScript the compiler reports it while you type. TS must be compiled to JS before a browser or Node can run it, and the types are erased in that step, so they cost nothing at runtime and protect nothing at runtime either. A few constructs (enums, namespaces, parameter properties) do emit code.

→ Full explanation: [§1](/javascript/typescript#1-what-is-typescript) and [§1.1](/javascript/typescript#11-typescript-compilation-the-3-core-stages)

---

**Q2: What is the difference between `interface` and `type`?**

Both describe object shapes. An `interface` can be **merged** (redeclare it to add fields) and uses `extends`, which **rejects** an incompatible override; a `type` can name anything (unions, tuples, mapped types, primitives), cannot be merged, and combines with `&`, which silently turns a conflicting property into `never`. Use `interface` for object shapes and public APIs, `type` for everything else.

```ts
// Only type can do:
type ID = string | number;
type Pair = [string, number];

// Only interface can do:
interface Window { analytics: Analytics; }  // merges with existing Window
```

→ Full explanation: [§3.3](/javascript/typescript#33-interface-vs-type-when-to-use-which)

---

**Q3: What is the `any` type and why should you avoid it?**

`any` disables type checking for that value.

```ts
let x: any = 42;
x.nonExistent.method(); // no error at compile time, crashes at runtime
```

The real danger is that `any` spreads: anything read off it is also `any`, and it is assignable to every type, so one untyped value switches off checking for everything it touches. Use `unknown` instead (Q5).

---

**Q4: What are generics?**

Generics are type parameters: like function parameters, but for types. They let one function or type work with many types while keeping the actual type at each call site.

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

first([1, 2, 3]);        // returns number
first(['a', 'b']);        // returns string
```

Without generics you'd use `any` and lose the return type. → Full explanation: [§5](/javascript/typescript#5-generics)

---

**Q5: What is the difference between `unknown` and `any`?**

**Short answer:** both accept any value, but `any` switches checking off, while `unknown` forces you to check the value before use, which makes it the safe choice for data whose shape you do not know yet.

```ts
let a: any = 'hello';
// a.toFixed();           // no compile error, but a TypeError at runtime

let b: unknown = 'hello';
// b.toFixed();           // Error TS18046: 'b' is of type 'unknown'.
if (typeof b === 'string') {
  b.toUpperCase();        // OK after narrowing
}
```

→ Full explanation: [§2.3](/javascript/typescript#23-special-types)

---

### Intermediate

---

**Q6: Explain union types and discriminated unions.**

A **union** (`string | number`) is a value that can be one of several types. A **discriminated union** gives every member a common literal property, the discriminant, and checking it narrows to one member:

```ts
type Result =
  | { status: 'success'; data: User }
  | { status: 'error'; error: string };

function handle(result: Result) {
  if (result.status === 'success') {
    result.data;     // TypeScript knows this is the success branch
  } else {
    result.error;    // TypeScript knows this is the error branch
  }
}
```

The discriminant must be a literal type (`status: string` narrows nothing), and a `never` default makes the `switch` exhaustive. → Full explanation: [§6.1](/javascript/typescript#61-union-types), [§7.3](/javascript/typescript#73-exhaustive-checks)

---

**Q7: What are utility types? Name 5 commonly used ones.**

Utility types are built-in generic types that **derive** one type from another: `Partial<User>` for an update form stays in sync when someone adds a field to `User`, while a hand-written copy silently drifts.

| Kind | Utility types |
|---|---|
| Object properties | `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record` |
| Union members | `Exclude`, `Extract`, `NonNullable` |
| Functions and promises | `ReturnType`, `Parameters`, `Awaited` |

→ Full explanation: [§8](/javascript/typescript#8-utility-types)

---

**Q8: What is type narrowing? List different ways to narrow types.**

Narrowing is the compiler following your control flow: inside `if (typeof x === 'string')` it knows `x` is a string, and in the `else` it knows `x` is whatever is left. That is what makes a union usable without casts.

Ways to narrow: `typeof`, `instanceof`, `'swim' in animal`, truthiness (`if (x)` excludes `null`, `undefined`, `0`, `''`, `false`), equality (`x === 'active'`), a discriminant (`shape.kind === 'circle'`), a type predicate (`x is string`) and an assertion function (`asserts x is string`). → Full explanation: [§7](/javascript/typescript#7-type-narrowing-and-guards)

---

**Q9: Explain `keyof` and indexed access types.**

`keyof T` is the union of `T`'s property keys:

```ts
interface User { name: string; age: number; email: string; }
type UserKeys = keyof User;  // 'name' | 'age' | 'email'
```

Indexed access `T[K]` is the type of that property:

```ts
type NameType = User['name'];              // string
type NameOrAge = User['name' | 'age'];     // string | number
```

Together they give type-safe property access, `getValue<T, K extends keyof T>(obj: T, key: K): T[K]` ([§5.3](/javascript/typescript#53-generic-constraints)).

---

**Q10: What is `as const` and when would you use it?**

`as const` narrows a value to its most specific literal types and makes it readonly, all the way down:

```ts
// Without as const
const config = { port: 3000, host: 'localhost' };
// type: { port: number; host: string }

// With as const
const configV2 = { port: 3000, host: 'localhost' } as const;
// type: { readonly port: 3000; readonly host: 'localhost' }
```

**`readonly` means "the compiler will refuse the assignment", nothing more.** It is erased, so nothing is frozen at runtime:

```ts
const cfg = { port: 3000, host: 'localhost' } as const;
cfg.port = 4000;
// Error TS2540: Cannot assign to 'port' because it is a read-only property.
```

Compile that and the emitted JavaScript is:

```js
const cfg = { port: 3000, host: "localhost" };   // `as const` is gone
cfg.port = 4000;                                 // and this just works
```

So the transpiled output, or a playground that strips types without checking them (**including "Try it" on this page**), mutates happily. **TypeScript protects you while you write the code, not while it runs.** A runtime guarantee needs `Object.freeze`, which is shallow and fails silently outside strict mode.

- **`as const` is deep; `Readonly<T>` is shallow.** `Readonly<{ db: { port: number } }>` still permits `x.db.port = 1`.
- **`readonly` does not survive an alias.** Assign the value to a mutable type and the protection is gone.
- **Uses:** config objects, route maps, action types, and arrays as a union source: `const STATUSES = ['active', 'inactive'] as const; type Status = typeof STATUSES[number];`

---

### Advanced

---

**Q11: Explain conditional types and the `infer` keyword.**

**Short answer:** a conditional type, `T extends U ? X : Y`, is an `if`/`else` for types: if `T` is assignable to `U` the result is `X`, otherwise `Y`. `infer R` captures whatever type sits in a position, like a regex capture group, and is available in the true branch. That is how `ReturnType` and `Awaited` are written, and why you can get a library function's return type without the library exporting it:

```ts
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;
type A = ReturnOf<() => string>;           // string
```

→ Full explanation: [§10.2](/javascript/typescript#102-conditional-types)

---

**Q12: What are mapped types? How do you remap keys?**

A mapped type is a loop over keys: `[P in keyof T]` visits each key and the right-hand side says what the property becomes, which is how `Partial` and `Readonly` are built. An `as` clause renames each key (`name` → `getName` with `` `get${Capitalize<string & K>}` ``), and a key renamed to `never` is dropped, which is how you filter:

```ts
type StringProps<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface User { name: string; age: number; email: string; }
type StringUserProps = StringProps<User>;
// { name: string; email: string }
```

→ Full explanation: [§10.1](/javascript/typescript#101-mapped-types)

---

**Q13: How do distributive conditional types work?**

When a conditional type tests a **naked** type parameter (the bare `T`, not `[T]` or `T[]`) and receives a union, it runs once per member and unions the results: `ToArray<string | number>` is `string[] | number[]`. That is how `Exclude` removes union members. To test the union *as a whole*, wrap both sides in a tuple, `[T] extends [unknown]`, which gives `(string | number)[]`. One consequence worth naming: `never` is the empty union, so a distributive conditional given `never` returns `never`. → Full explanation: [§10.2](/javascript/typescript#102-conditional-types)

---

**Q14: Explain declaration merging.**

Two declarations with the same name in the same scope combine into one instead of clashing. It exists for **extending types you don't own**: you cannot edit Express's `Request` or the DOM's `Window`, but you can redeclare the interface and add a field (module augmentation, below).

```ts
// Interface merging
interface Box { width: number; }
interface Box { height: number; }
// Box = { width: number; height: number }

// Namespace merging with function
function buildLabel(name: string): string { return name; }
namespace buildLabel {
  export const prefix = 'Mr.';
}
buildLabel('Alice');          // function call
buildLabel.prefix;            // 'Mr.'

// Module augmentation
declare module 'express' {
  interface Request {
    user?: User;              // adds user to Express Request
  }
}
```

Types (type aliases) do NOT merge — redeclaring is an error.

---

**Q15: What is structural typing (duck typing) in TypeScript?**

Compatibility depends on the shape of a type, not its name or where it was declared.

```ts
interface Point { x: number; y: number; }
interface Coordinate { x: number; y: number; }

const p: Point = { x: 1, y: 2 };
const c: Coordinate = p;                  // OK! Same shape

// Extra properties are fine when the value is not a fresh object literal
class Pixel {
  constructor(public x: number, public y: number, public color: string) {}
}

function logPoint(point: Point) {
  console.log(point.x, point.y);
}

logPoint(new Pixel(1, 2, 'red'));          // OK! Pixel has x and y
```

In nominal typing (Java, C#) `Point` and `Coordinate` would be incompatible. When you need that, use a brand ([§10.5](/javascript/typescript#105-brandedopaque-types)).

---

**Q16: How would you implement a type-safe event emitter?**

The design rests on **one map type from event name to payload type**. `keyof EventMap` is the set of legal names and `EventMap['click']` that event's payload, so each method is generic over a *single* key (`K extends keyof Events`) inferred from the `event` argument, and the payload type follows. A `string`-based emitter cannot relate the name to what it carries.

```ts
type EventMap = {
  click: { x: number; y: number };
  change: { value: string };
  load: undefined;
};

class TypedEmitter<Events extends Record<string, unknown>> {
  private handlers = new Map<keyof Events, Set<Function>>();

  on<K extends keyof Events>(
    event: K,
    handler: Events[K] extends undefined
      ? () => void
      : (payload: Events[K]) => void
  ): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  emit<K extends keyof Events>(
    event: K,
    ...args: Events[K] extends undefined ? [] : [Events[K]]
  ): void {
    this.handlers.get(event)?.forEach(fn => fn(...args));
  }
}

const emitter = new TypedEmitter<EventMap>();
emitter.on('click', ({ x, y }) => {});     // payload typed as { x, y }
emitter.on('load', () => {});               // no payload
emitter.emit('click', { x: 1, y: 2 });
emitter.emit('load');
// emitter.emit('click');                   // Error: missing payload
```

**The part an interviewer grades is `emit`'s rest parameter:**

```text
...args: Events[K] extends undefined ? [] : [Events[K]]
```

A rest parameter can be typed as a **tuple**, and a conditional type picks which: `[]` means no further arguments, `[Events[K]]` exactly one. So the **arity itself** depends on the event name. `payload?: Events[K]` would make the argument optional for *every* event.

```ts
emitter.emit('click', { x: 1, y: 2 });   // ok
emitter.emit('click');                   // Error: Expected 2 arguments, but got 1
emitter.emit('load');                    // ok
emitter.emit('load', { x: 1 });          // Error: Expected 1 arguments, but got 2
```

**Two things worth volunteering.** The typing lives only at the `on`/`emit` boundary: handlers are stored as `Set<Function>`, so `fn(...args)` is unchecked. And for `off`, removing a listener needs the *same function reference*, so an inline arrow can never be removed; have `on` return an unsubscribe closure.

---

**Q17: What are template literal types and how are they useful?**

They are template literal syntax at the type level, and interpolating a union produces every combination, so the compiler knows the full set of legal strings. They are useful whenever a string follows a pattern and a typo would otherwise only show up at runtime: handler names (`` `on${Capitalize<EventName>}` `` gives `'onClick' | 'onFocus'`), API routes (`'GET /users'` but not `'GTE /users'`), i18n keys such as `'checkout.title'` (a missing key fails to compile instead of rendering the raw key), and CSS property names (`'backgroud-color'` is rejected).

```ts
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type RequestKey = `${HTTPMethod} /${string}`;   // 'GET /...' | 'POST /...' | …

// Combined with a mapped type's key remapping:
type Setters<T> = {
  [K in keyof T & string as `set${Capitalize<K>}`]: (value: T[K]) => void;
};
```

→ Full explanation: [§10.3](/javascript/typescript#103-template-literal-types)

---

**Q18: Explain the difference between `type` assertions and type declarations.**

```text
// Type declaration (annotation) - TS verifies the value matches
const user: User = { name: 'Alice', email: 'a@b.com' };
// Error if value doesn't match User shape

// Type assertion (as) - you tell TS "trust me"
const userV2 = { name: 'Alice' } as User;
// No error even though email is missing (dangerous!)

// When assertions are valid:
// 1. DOM elements
const input = document.querySelector('#email') as HTMLInputElement;

// 2. API responses — compiles, but nothing checks it at runtime.
//    response.json() returns any; prefer unknown + a type guard (see Q27).
const data = await response.json() as ApiResponse;

// 3. When narrowing doesn't work and you know better
const x = someValue as string;

// Double assertion (escape hatch - almost never use)
const xBroken = someValue as unknown as TargetType;
```

Prefer annotations: an assertion bypasses checking. Only the DOM case is a claim you can usually back up; for data that crosses a boundary (network, storage), a cast is an unchecked promise, so validate it instead (Q27). An assertion is only allowed between types that overlap, which is why the double assertion through `unknown` exists, and why it is a red flag in review.

---

**Q19: How does TypeScript's type system handle `null` and `undefined`?**

**Short answer:** with `strictNullChecks` on (it is part of `strict`), `null` and `undefined` are their own types, so a value that might be missing must say so (`string | null`) and the compiler makes you handle that case before use. With it off, they are silently allowed everywhere, which is how "cannot read properties of null" errors get past the compiler.

```ts
function getLength(s: string | null): number {
  // return s.length;              // Error: s might be null
  return s?.length ?? 0;           // OK: handled null case
}

// Non-null assertion (use sparingly)
function process(s: string | null) {
  const len = s!.length;           // tells TS "s is not null" (unsafe)
}

// Optional chaining + nullish coalescing
const user: { address?: { city?: string } } | undefined = undefined;   // stand-in
const city = user?.address?.city ?? 'Unknown';
```

→ See also [§2.3](/javascript/typescript#23-special-types) and Q29 below (`null` versus `unknown`).

---

**Q20: What is the `satisfies` operator?**

`satisfies` (TS 4.9+) checks a value against a type **without widening it**. An annotation validates but widens (every value of a `Record<string, string | RGB>` becomes `string | RGB`), and `as` keeps the shape but validates nothing. `satisfies` does both: `green: true` is an error, and afterwards `palette.red` is still known to be the tuple.

The non-obvious point: it only catches a misspelt key if the target type has **fixed keys**; against `Record<string, …>` every key is legal. And it does not make anything readonly; combine it as `as const satisfies T` for that. Use it where you would otherwise write `as Foo` on a config object.

→ Full explanation: [§10.6](/javascript/typescript#106-the-satisfies-operator-ts-49)

---

**Q21: TypeScript 7.0 rewrote the compiler in Go. What actually changed, and how would you plan the upgrade for a large codebase?**

Nothing about the language changed: the type system, syntax and `tsconfig.json` are identical. The compiler and language service were reimplemented in Go (project *Corsa*, stable 8 July 2026), and type-checking is roughly 8–12× faster, mostly thanks to **shared-memory parallelism** that Node workers cannot have. The effect is biggest in the editor.

The upgrade sequence:

1. **Go to 6.0 first.** It is the bridge release: it turns long-standing deprecations (such as `target: "ES5"` and `baseUrl`) into errors. Fix them there, with the tooling you know.
2. **Then bump to 7.0.** It is behaviourally compatible with 6.0's checking and CLI, so this is a dependency change, not a code change.
3. **Audit everything that uses the compiler as a library**, because 7.0 ships no programmatic API (a new one is expected in 7.1). Vue, Svelte, Astro and MDX language tooling, custom AST transforms and some type-aware ESLint setups stay on 6.0 (`@typescript/typescript6`, binary `tsc6`) until they catch up.

Step 3 is what interviewers listen for. The framing worth adding: bundling went native years ago (esbuild, SWC, Rolldown), so `tsc --noEmit` and the language server were the last JavaScript-speed steps in a front-end build, and TypeScript 7 makes the "use `transpileOnly` and type-check in a separate CI job" workaround unnecessary.

→ Full explanation: [§13.2](/javascript/typescript#132-the-2026-compiler-landscape-typescript-60-70-and-the-go-rewrite)

---

**Q22: What is a `const` type parameter, and how is it different from `as const` and `satisfies`?**

All three preserve literal types, but they are written in different places by different people. **`as const`** is written by the **caller**, on a value, and makes it deeply readonly with literal types. **`satisfies`** is written on a value too, and validates it against a type *without* widening. A **`const` type parameter** (TS 5.0) is written once by the **library author**, on the generic, and makes inference behave as though every caller had written `as const`:

```ts
// Old way — every caller must remember `as const`
function pick<T extends readonly string[]>(keys: T): T { return keys; }
pick(['a', 'b']);              // string[]            — literals lost
pick(['a', 'b'] as const);     // readonly ['a','b']  — caller had to opt in

// TS 5.0 — the author opts in once, on the type parameter
function pick2<const T extends readonly string[]>(keys: T): T { return keys; }
pick2(['a', 'b']);             // readonly ['a','b']  — no caller ceremony
```

Two details show depth: the constraint must permit readonly (`extends readonly string[]`), and `const` only affects **literal expressions at the call site**, so an existing `string[]` variable still yields `string[]`. The design point is where the cost lands: `as const` burdens every consumer and fails silently when one forgets; `const T` pays once in the signature, which is why route builders and form schemas use it.

→ Full explanation: [§10.7](/javascript/typescript#107-controlling-inference-const-type-parameters-noinfer-and-inferred-predicates)

---

**Q23: Node can now run `.ts` files directly. What does that mean for TypeScript features, and what is `erasableSyntaxOnly` for?**

Node's type stripping is purely **syntactic**: it deletes type annotations file by file, with no type information. That only works if every construct can be deleted without changing behaviour, and four cannot, because they *generate code*: `enum`, `namespace`, constructor parameter properties (`constructor(private name: string)`) and `import x = require()`. Node rejects them rather than guess.

`erasableSyntaxOnly` (TS 5.8) makes the type-checker enforce the same rule, so you find out in the editor, not at runtime. You move to an `as const` object plus a derived union instead of `enum`, ES modules instead of `namespace`, and explicit fields instead of parameter properties. The payoff is portability: the same source runs unbuilt under Node, Deno and Bun and transpiles identically through esbuild, SWC and Rolldown. The trade-off to name: no enum reverse mapping, no namespace merging, and a little boilerplate per class; since enums were already discouraged, most teams lose little.

→ Full explanation: [§13.3](/javascript/typescript#133-compiler-flags-that-matter-in-2026)

---

**Q24: What does `verbatimModuleSyntax` do, and what bug class does it prevent?**

Without it, TypeScript **elides** an import whose names are only used as types. That is fine when `tsc` emits, but esbuild, SWC, Babel and Node's stripper work one file at a time with no type information, so they must guess whether `import { Foo }` is a type or a value. Guess wrong one way and a module imported only for a type never runs, so its side effects vanish (a bare `import './polyfills'` is never elided); guess wrong the other way and a pure interface is imported at runtime: "does not provide an export named 'UserType'", often only in the production bundle.

`verbatimModuleSyntax` (TS 5.0) removes the guessing: what you write is what is emitted, and importing a type without `type` is an error. It is a high-signal flag to raise because it shows you know a modern build has *two* tools with different information (`tsc` checks with full knowledge, a native transpiler emits with almost none), and that many "works in dev, breaks in prod" module errors live in that gap.

→ Full explanation: [§13.3](/javascript/typescript#133-compiler-flags-that-matter-in-2026)

---

**Q25: A dashboard uses `isLoading`, `error` and `data`, and invalid states keep slipping through. Refactor the type.**

Three independent fields describe **eight** combinations when the domain has four, and every consumer has to defend against the states that should not exist.

```ts
// ✗ Eight combinations, four of them meaningless.
interface State {
  isLoading: boolean;
  error: Error | null;
  data: User | null;
}
```

Model the states themselves, as a discriminated union:

```ts
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: User };
```

Now the illegal states are **unrepresentable**, and narrowing on the discriminant makes the data available without a null check:

```ts
function render(state: State) {
  switch (state.status) {
    case 'idle':    return 'Nothing yet';
    case 'loading': return 'Loading…';
    case 'error':   return state.error.message;   // `error` exists here
    case 'success': return state.data.name;       // `data` exists here, no `?.`
  }
}
```

**To make it a senior answer:** add a `default: const _never: never = state;` so a new `'refreshing'` state makes every unhandled `switch` a compile error ([§7.3](/javascript/typescript#73-exhaustive-checks)); note that the discriminant must be a literal type (`status: string` narrows nothing); and name the trade-off: it is more verbose than three booleans, worth it when invalid combinations cause bugs, and ceremony for a genuinely independent pair of flags.

---

**Q26: Type a button that can behave like a link or a real button, but never both.**

The naive version makes both optional, which permits the thing you are trying to forbid:

```ts
// ✗ Allows { href, onClick } together, and allows neither.
interface ButtonProps {
  href?: string;
  onClick?: () => void;
}
```

A plain union of the two shapes is not enough: object types are not exact, and excess-property checking accepts a key that exists in **any** member of a union, so even an inline `{ href, onClick }` literal compiles. Declare the *absent* key as optional `never` in each arm:

```tsx
type ButtonProps =
  | { href: string; onClick?: never; children: React.ReactNode }
  | { href?: never; onClick: () => void; children: React.ReactNode };

function Button(props: ButtonProps) {
  // Narrowing on presence, which is what the union encodes.
  return 'href' in props
    ? <a href={props.href}>{props.children}</a>
    : <button onClick={props.onClick}>{props.children}</button>;
}
```

`<Button href="/x" onClick={fn} />` is now an error, and so is `<Button />`.

**Why `never` rather than omitting the key:** excess-property checking does *not* catch this with a union, and it never applies to a variable anyway, because assignability is structural. `onClick?: never` makes the exclusion part of the type.

**The generalised form** is an `XOR` helper:

```ts
type Without<T, U> = { [K in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (Without<T, U> & U) | (Without<U, T> & T);
```

**Say the caveat.** Two hand-written arms read better than a helper the next engineer has to decode, and errors from deep generic helpers are famously bad; reach for `XOR` only when there are several mutually exclusive groups.

---

**Q27: You read JSON out of `localStorage`. How do you type it?**

`JSON.parse` returns `any`, which switches off checking for everything downstream. First stop it spreading:

```ts
const raw: unknown = JSON.parse(stored);   // NOT any
```

`unknown` accepts everything and is assignable to nothing (but `unknown` and `any`), so the compiler forces a check. Then narrow with a real predicate:

```ts
interface Settings { theme: 'light' | 'dark'; fontSize: number }

function isSettings(v: unknown): v is Settings {
  return (
    typeof v === 'object' && v !== null &&
    'theme' in v && (v.theme === 'light' || v.theme === 'dark') &&
    'fontSize' in v && typeof v.fontSize === 'number'
  );
}

const settings = isSettings(raw) ? raw : DEFAULTS;
```

**The point to make out loud:** `as Settings` would also compile, and it is a lie. Persisted JSON is **untrusted input** (written by an older app version, edited by the user, corrupted), and a cast's failure surfaces later as `undefined is not a function` somewhere unrelated.

- **`JSON.parse` throws** on malformed input, so it needs its own `try`/`catch`, separate from the shape check.
- **The accessor throws too.** `localStorage.getItem` raises in a private window or with site data blocked, a crash during render if read in a `useState` initialiser.
- **At real size, use a schema library.** Zod or Valibot derive the predicate and the type from one declaration, so they cannot drift; a hand-written guard that forgets a new field compiles and lies.

**The senior framing:** this is a **boundary**. Parse, validate and default at the edge (storage, network, URL params) so everything inside can trust its types.

---

**Q28: Why can't you use `Pick` and `Omit` instead of `Extract` and `Exclude`?**

Because they filter on different axes. **`Pick` and `Omit` select properties by key from an object type; `Extract` and `Exclude` filter members of a union by assignability.**

| Aspect | `Pick` / `Omit` | `Extract` / `Exclude` |
|---|---|---|
| Operate on | an **object type** | a **union of any types** |
| Select by | **property key** | **assignability** |
| Constraint | `Pick<T, K>` requires `K extends keyof T` | none — any union, any filter |

Swap them and the error explains itself:

```ts
type Letters = 'a' | 'b' | 'c';

type Kept = Extract<Letters, 'a' | 'c'>;   // 'a' | 'c'
type Gone = Exclude<Letters, 'a'>;         // 'b' | 'c'

// type Nope = Pick<Letters, 'a'>;
// Error TS2344: Type '"a"' does not satisfy the constraint
//   'number | "toString" | "charAt" | …'
```

`keyof ('a' | 'b' | 'c')` is **not** `'a' | 'b' | 'c'`: it is the `string` *methods* the members share, because union members are not keys.

In reverse, `Exclude` tests whole types, so pointed at an object it removes no property:

```ts
type User = { id: number; name: string; email: string };
type Oops = Exclude<User, { id: number }>;   // never — User IS assignable to { id: number }
```

**They are related, though:** `Omit` is *built from* `Exclude`. The standard-library definition is

```ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

`keyof T` is a union of keys, `Exclude` filters it, and `Pick` turns the survivors back into an object type. **The gotcha that follows:** `Pick` constrains `K` to `keyof T`, but `Omit` only to `keyof any`, so a typo is caught in one and silently ignored in the other:

```ts
type A = Pick<User, 'nope'>;   // Error: '"nope"' does not satisfy 'keyof User'
type B = Omit<User, 'nope'>;   // No error — B is just User, unchanged
```

Rename a field and forget an `Omit`, and nothing tells you. Some codebases define `type StrictOmit<T, K extends keyof T> = Omit<T, K>;` for exactly this reason. → See also [§8](/javascript/typescript#8-utility-types)

---

**Q29: What are `null` and `unknown` in TypeScript, and how are they different?**

**Short answer:** `null` is a **value** meaning "deliberately empty", and its type contains only that value. `unknown` is a **type** meaning "this could be anything, and I have not checked yet". `string | null` says you **know** the value is a string or empty; `unknown` says you do **not know** what it is.

```ts
function displayName(name: string | null): string {
  // return name.toUpperCase();          // ✗ TS18047: 'name' is possibly 'null'.
  return name === null ? 'Anonymous' : name.toUpperCase();
}

function inspectValue(value: unknown): string {
  // return value.toUpperCase();         // ✗ TS18046: 'value' is of type 'unknown'.
  if (typeof value === 'string') return 'string ' + value.toUpperCase();
  if (typeof value === 'object') {
    if (value === null) return 'null';   // typeof null is 'object', so check it first
    return 'object ' + Object.keys(value).join(',');
  }
  return typeof value;
}

const anything: unknown = null;          // every value fits in unknown, null included
// const label: string | null = anything;  // ✗ TS2322: Type 'unknown' is not assignable to type 'string | null'.

console.log(displayName(null), displayName('ada'));
console.log(inspectValue('hi'), inspectValue(anything), inspectValue({ a: 1, b: 2 }), inspectValue(42));
```

```text
Anonymous ADA
string HI null object a,b number
```

| Aspect | `null` | `unknown` |
|---|---|---|
| What it is | a value, and a type with that single value | a type that every value belongs to (the **top type**) |
| Means | "known to be empty" | "not checked yet" |
| What you may assign to it | only `null` (and `any`) | anything |
| Where it can go | only into types that include `null` (with `strictNullChecks`) | only into `unknown` or `any`, until you narrow it |
| How you make it usable | `!== null`, `?.`, `??` | narrow with `typeof`, `instanceof`, `in`, or a type guard |
| Typical source | your own models: an optional field, "no result" | the outside world: `JSON.parse`, `catch (e)`, `response.json()` |


- **`null` only means something with `strictNullChecks` on** (part of `strict`). With it off, `null` is silently allowed in every type (Q19).
- **`unknown` contains `null`.** Narrowing an `unknown` with `typeof value === 'object'` still leaves `object | null`, so rule out `null` before calling `Object.keys` ([tricky Q26](/javascript/typescript-tricky-questions)).
- **`unknown` is the safe twin of `any`** (Q5). Use it at every boundary where data enters the program (Q27), and in `catch` clauses, where `useUnknownInCatchVariables` makes the error `unknown` ([tricky Q28](/javascript/typescript-tricky-questions)).
- **`null` versus `undefined`.** Many codebases use `undefined` for optional things (`name?: string`) and keep `null` for "explicitly cleared", such as a JSON field or a database `NULL`. Pick one convention ([JavaScript interview Q3 and Q44](/javascript/interview-questions) cover handling both at runtime).
