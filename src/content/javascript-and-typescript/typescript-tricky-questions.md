# TypeScript — Tricky Output Questions

Puzzles on inference, narrowing, variance and the compiler's edge cases. Compile errors are shown as commented lines checked by the real compiler.

Part of the TypeScript series: [TypeScript Guide](/javascript/typescript) · [TypeScript Interview Questions](/javascript/typescript-interview-questions) · **TypeScript Tricky Questions**

---

## Table of Contents

- [16. Tricky Output Questions](#16-tricky-output-questions)

---

## 16. Tricky Output Questions

Practice questions testing your understanding of TypeScript's type inference, narrowing, generics, and compile-time behavior.

### Type Inference & Widening

---

**Q1: What types does TypeScript infer for `typeof x` and `typeof y` given `let x = "hello"` and `const y = "hello"`, and why do they differ?**

```ts
let x = "hello";
const y = "hello";

type X = typeof x;
type Y = typeof y;
```

**Answer:**
- `X` is `string`
- `Y` is `"hello"` (a string-literal type)

**Explanation:**

This is **type widening**: a `let` can later hold any other string (`x = "world"`), so its type must cover every value it could hold, and the literal widens to `string`. A `const` can never be reassigned, so it keeps the literal type. The rule only covers primitive `const` bindings: object properties stay mutable, so they still widen unless you add `as const`:

```ts
const obj = { a: 1 };       // type: { a: number }  — widened
const locked = { a: 1 } as const; // type: { readonly a: 1 }
```

→ Full explanation: [§2.4 Literal Types](/javascript/typescript#24-literal-types)

---

**Q2: How does TypeScript infer the types of these two arrays, and what does adding `as const` change about both the shape and the mutability?**

```ts
const arr = [1, "two", true];
type Arr = typeof arr;

const tuple = [1, "two", true] as const;
type Tuple = typeof tuple;
```

**Answer:**
- `Arr` is `(string | number | boolean)[]`
- `Tuple` is `readonly [1, "two", true]`

**Explanation:**

A plain array literal is assumed to grow, shrink and reorder, so its element type is the union of everything in it and positions are forgotten. `as const` makes the literal deeply immutable and fully specific: arrays become **readonly tuples**, object properties become `readonly`, and primitives keep their literal types. That is what you want for deriving types from values: `typeof tuple[number]` is `1 | "two" | true`, not `string | number | boolean`.

---

**Q3: Why does passing `config.mode` to a function expecting `"production" | "development"` fail to compile, even though the value is literally `"production"`?**

```ts
const config = {
  mode: "production",
  port: 3000,
};

function start(mode: "production" | "development") {}
// start(config.mode);   // ✗ TS2345: Argument of type 'string' is not assignable to parameter of type '"production" | "development"'.
```

**Answer:** Compile error — `Argument of type 'string' is not assignable to parameter of type '"production" | "development"'`.

**Explanation:**

`const` only stops reassigning the binding; `config.mode = "anything"` is still legal, so TypeScript widens the property to `string` (the object-property case of [Q1](/javascript/typescript-tricky-questions)). A `string` might not be one of the two literals. Three fixes:

```ts
function start(mode: "production" | "development") {}

// 1. Lock the whole object as const (deeply readonly, all literals preserved)
const config = { mode: "production", port: 3000 } as const;
start(config.mode);

// 2. Annotate just the property with the narrow type
const configV2: { mode: "production" | "development"; port: number } = { mode: "production", port: 3000 };
start(configV2.mode);

// 3. Assert at the call site (blunt; only use when you know better than the compiler)
const configV3 = { mode: "production", port: 3000 };
start(configV3.mode as "production");
```

---

### Type Narrowing

---

**Q4: What type does TypeScript infer for `value` inside each branch (A, B, C) when narrowing a `string | number | boolean` union with `typeof` checks?**

```ts
function process(value: string | number | boolean) {
  if (typeof value === "string") {
    // A: type of value here?
    value.toUpperCase();
  } else if (typeof value === "number") {
    // B: type of value here?
    value.toFixed(2);
  } else {
    // C: type of value here?
    value;  // what type?
  }
}
```

**Answer:**
- A: `string`
- B: `number`
- C: `boolean`

**Explanation:**

Control-flow analysis treats `typeof` as a type guard and also narrows the **negative** branch: after the `string` check fails, `value` is `number | boolean`, and after the `number` check fails only `boolean` is left, so the last `else` needs no check of its own. `typeof` only distinguishes `"string"`, `"number"`, `"bigint"`, `"boolean"`, `"symbol"`, `"undefined"`, `"object"` and `"function"`; class instances need `instanceof`, and object shapes need `in` or a discriminant property. → [§7.1 Built-in Narrowing](/javascript/typescript#71-built-in-narrowing)

---

**Q5: Why does this `area` function fail to compile, and how can the `never` type be used to make exhaustive-check bugs impossible?**

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {   // ✗ TS2366: Function lacks ending return statement and return type does not include 'undefined'.
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
  }
}
```

**Answer:** Compile error TS2366: the `"triangle"` case falls off the end of the `switch` and returns `undefined`, which the declared return type `number` does not allow. Without a declared return type it compiles, unless `noImplicitReturns` is on, which reports the same gap as TS7030 "Not all code paths return a value".

**Explanation:**

`Shape` is a **discriminated union**, so each `case` narrows `shape` by its `kind`. The robust fix is a `default` branch that assigns `shape` to `never` (the type with no values). When every case is handled, `shape` is `never` there and the assignment compiles; when someone adds a fourth variant, `shape` in `default` is that variant, the assignment fails, and every `switch` that forgot it is flagged:

```ts
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":   return Math.PI * shape.radius ** 2;
    case "square":   return shape.side ** 2;
    case "triangle": return 0.5 * shape.base * shape.height;
    default:
      const _exhaustive: never = shape; // compile-time guard
      return _exhaustive;
  }
}
```

→ [§7.3 Exhaustive Checks](/javascript/typescript#73-exhaustive-checks)

---

**Q6: How does the `in` operator narrow a union of object types, and what is the type of `pet` inside each branch below?**

```ts
type Fish = { swim: () => void };
type Bird = { fly: () => void };
type Pet = Fish | Bird;

function move(pet: Pet) {
  if ("swim" in pet) {
    pet;  // what type?
  } else {
    pet;  // what type?
  }
}
```

**Answer:**
- Inside the `if` block: `Fish`
- Inside the `else` block: `Bird`

**Explanation:**

`"swim" in pet` keeps the union members that declare `swim` (only `Fish`), and the `else` gets the rest. It works on the presence of a property, so it suits types with no shared discriminant field, such as third-party types. The gotcha: if `Fish` had an *optional* `swim?: () => void`, the `if` branch would still be `Fish`, but `in` only proves the key exists, not that its value is defined, so you would still check `pet.swim !== undefined` before calling it.

---

### Generics & Utility Types

---

**Q7: Why does this generic `getLength` function fail to compile, and what is the right way to constrain `T` so it works?**

```ts
function getLength<T>(value: T): number {
  return value.length;   // ✗ TS2339: Property 'length' does not exist on type 'T'.
}
```

**Answer:** Compile error — `Property 'length' does not exist on type 'T'`.

**Explanation:**

An unconstrained `T` could be `number`, `null` or anything else, so inside the body it behaves like `unknown`. A **generic constraint** (`extends`) promises a minimum shape the body can rely on:

```ts
// Only accept types that have a numeric length property
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}

getLength("hello");      // OK — strings have .length
getLength([1, 2, 3]);    // OK — arrays have .length
getLength({ length: 5 });// OK — structural match
getLength(42);           // ✗ TS2345: Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.
```

Typing the parameter as `{ length: number }` would also compile; the generic form is worth it when the signature must hand the caller's exact type back (for example, returning `T`). → [§5.3 Generic Constraints](/javascript/typescript#53-generic-constraints)

---

**Q8: What shape does `OptionalUser` resolve to, and how does the mapped-type syntax `[K in keyof T]?: T[K]` actually produce that shape?**

```ts
type User = {
  name: string;
  age: number;
  email: string;
};

type Optional<T> = {
  [K in keyof T]?: T[K];
};

type OptionalUser = Optional<User>;
```

**Answer:** `OptionalUser` is `{ name?: string; age?: number; email?: string }` — which is exactly what the built-in `Partial<User>` produces.

**Explanation:**

A mapped type is a loop over keys: `K` takes each member of `keyof User` (`"name" | "age" | "email"`), and the **indexed access type** `T[K]` looks up that property's type. The `?` modifier makes each one optional; `readonly` adds immutability, and `-?` / `-readonly` remove the modifiers, which is all the built-ins need:

```ts
type Required<T> = { [K in keyof T]-?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };
```

Key remapping with `as` (TS 4.1+) and conditional types extend the same loop to renaming and filtering keys. → [§10.1 Mapped Types](/javascript/typescript#101-mapped-types)

---

**Q9: What do `A`, `B`, `C`, and `D` resolve to, and why does `IsString<string | number>` produce a union instead of a single branch?**

```ts
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<string>;
type B = IsString<number>;
type C = IsString<"hello">;
type D = IsString<string | number>;
```

**Answer:**
- `A` is `"yes"`
- `B` is `"no"`
- `C` is `"yes"` (the literal `"hello"` is a subtype of `string`)
- `D` is `"yes" | "no"` (conditional types distribute over unions!)

**Explanation:**

When the checked type is a **naked type parameter** (`T` alone on the left of `extends`), a conditional type **distributes**: `IsString<string | number>` becomes `IsString<string> | IsString<number>`, which is `"yes" | "no"`. That is how `Exclude` and `Extract` filter unions (members mapped to `never` drop out). To compare the union as one unit, wrap both sides in a 1-tuple:

```ts
type IsStringAll<T> = [T] extends [string] ? "yes" : "no";
type E = IsStringAll<string | number>; // "no" — the union as a whole doesn't extend string
```

→ [§10.2 Conditional Types](/javascript/typescript#102-conditional-types)

---

**Q10: Why does `keyof` of a string-indexed dictionary return `string | number`, while `keyof` of a number-indexed one returns only `number`?**

```ts
type Dict = { [key: string]: number };
type DictKeys = keyof Dict;

type NumDict = { [key: number]: string };
type NumDictKeys = keyof NumDict;
```

**Answer:**
- `DictKeys` is `string | number`
- `NumDictKeys` is `number`

**Explanation:**

At runtime JavaScript converts a numeric key to a string (`obj[5]` reads `obj["5"]`), so a type that accepts every string key also accepts numeric keys, and `keyof` says so. A number index signature promises nothing about arbitrary strings, so its `keyof` stays `number`. For the same reason, a type with both signatures must make the number index's value type assignable to the string index's:

```ts
type Mixed = {
  [key: string]: string | number;
  [key: number]: number; // OK — number is assignable to string | number
};
```

---

### Structural Typing & Compatibility

---

**Q11: Why does assigning an object literal with an extra property fail, but assigning that same object through a variable succeeds?**

```ts
interface Point {
  x: number;
  y: number;
}

const point1: Point = { x: 1, y: 2, z: 3 };   // ✗ TS2353: Object literal may only specify known properties, and 'z' does not exist in type 'Point'.

const obj = { x: 1, y: 2, z: 3 };
const point2: Point = obj;
```

**Answer:**
- `point1`: Compile error — the excess property check catches `z`.
- `point2`: Compiles fine.

**Explanation:**

Assignability is **structural**: having at least the required properties is enough, and extras are ignored. The **excess property check** is an extra safety net that runs only on a **fresh object literal** assigned straight to a typed target, to catch typos like `colour` for `color`. Once the literal is stored in a variable it is no longer fresh, and only the structural rule applies. Ways to opt out on purpose:

```ts
const p1: Point = { x: 1, y: 2, z: 3 } as Point;       // type assertion
const p2: Point = { x: 1, y: 2, z: 3 } as { x: number; y: number; z: number }; // widening
interface Point { x: number; y: number; [key: string]: number } // add an index signature
```

---

**Q12: Which of these three assignments compile under `strictFunctionTypes`, and why does variance of function parameters behave the way it does?**

```ts
type Handler = (event: MouseEvent) => void;

const handler1: Handler = (e: Event) => {};
const handler2: Handler = (e: MouseEvent) => {};
const handler3: Handler = () => {};
```

**Answer:**
- `handler1`: Compiles fine! `Event` is a **supertype** of `MouseEvent`, and function parameters are **contravariant** — a function that accepts the wider type is safe where the narrower type is expected.
- `handler2`: Compiles fine — identical parameter types.
- `handler3`: Compiles fine — a function that ignores parameters is always safe to pass where more parameters are expected.

**Explanation:**

Think from the caller's side: whoever calls a `Handler` passes a `MouseEvent`, and every `MouseEvent` is an `Event`, so `handler1` copes. The reverse (a handler that needs a narrower type than the caller provides) could read fields that are not there; `strictFunctionTypes` rejects it. Without the flag, parameters are checked **bivariantly** (both directions allowed, which is unsound). One exception survives even with the flag on: a member written with **method syntax** (`handle(e: MouseEvent): void`), as opposed to the property form `handle: (e: MouseEvent) => void`, is still checked bivariantly. Return types go the other way: they may be the same or **narrower** (covariant).

---

### Tricky Edges

---

**Q13: Which of lines A, B, C, and D compile, and what is the fundamental difference in how `any` and `unknown` interact with the type checker?**

```ts
let a: any = 10;
let b: unknown = 10;

// a.foo.bar;       // (A) compiles, but throws a TypeError when it runs: 10 has no foo
// b.foo.bar;       // ✗ TS18046: 'b' is of type 'unknown'.   (B)

let s1: string = a;  // (C) compiles
// let s2: string = b;   // ✗ TS2322: Type 'unknown' is not assignable to type 'string'.   (D)
console.log(typeof s1, s1);
```

**Answer:**
- A: Compiles (and crashes at runtime) — `any` disables type checking.
- B: Compile error — you cannot access properties on an `unknown` value.
- C: Compiles — `any` is assignable *to* every other type.
- D: Compile error — `unknown` is not assignable to anything other than `unknown` or `any` without first being narrowed.

**Explanation:**

Both are **top types** (anything can be assigned to them); the difference is what you can do afterwards. `any` switches checking off, and the switch-off spreads to everything you read from it. `unknown` accepts any value but lets you do nothing with it until you narrow it with `typeof`, `instanceof`, `in` or a type predicate:

```ts
if (typeof b === "object" && b !== null && "foo" in b) {
  // b is narrowed; property access is safe
}
```

That makes `unknown` the right type at boundaries: parsed JSON, external input, and `catch` variables under `useUnknownInCatchVariables` ([Q28](/javascript/typescript-tricky-questions)). → [§2.3 Special Types](/javascript/typescript#23-special-types)

---

**Q14: What does each of these three `console.log` calls print, and why does a numeric enum let you look up its value in two opposite directions?**

```ts
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

console.log(Direction.Up);
console.log(Direction[0]);
console.log(Direction["Up"]);
```

**Output:**
```
0
Up
0
```

**Explanation:**

A numeric enum compiles to a real object holding both name → number and number → name entries:

```js
var Direction;
(function (Direction) {
  Direction[Direction["Up"] = 0] = "Up";
  Direction[Direction["Down"] = 1] = "Down";
  // ...
})(Direction || (Direction = {}));
```

`Direction["Up"] = 0` evaluates to `0`, which then becomes the key for `Direction[0] = "Up"`. **String enums get no reverse mapping**: a value can collide with a member name (in `enum E { A = "B", B = "A" }` the reverse entries would overwrite the forward ones), so for `enum Direction { Up = "UP" }`, `Direction["UP"]` is `undefined`.

The reverse entries make numeric enums heavier than an `as const` object. If you don't need them, use an `as const` object, or a `const enum`, which inlines the values and emits no object, but is rejected under `erasableSyntaxOnly` (TS1294, see [Q19](/javascript/typescript-tricky-questions)). → [§9 Enums](/javascript/typescript#9-enums)

---

**Q15: What do `A`, `B`, and `C` resolve to, and what property of `never` makes it disappear in unions but absorb intersections?**

```ts
type A = string | never;
type B = string & never;

type C = never extends string ? "yes" : "no";
```

**Answer:**
- `A` is `string` — `never` is the identity element of unions; it disappears.
- `B` is `never` — `never` is the zero element of intersections; it absorbs everything.
- `C` is `"yes"` — `never` is the bottom type, so it is a subtype of every type, including `string`.

**Explanation:**

Read types as sets of values: `never` is the **empty set**. Union with the empty set changes nothing, intersection with it is empty, and "every value of `never` is also a `string`" is vacuously true. The non-obvious trap: `type NonNever<T> = T extends never ? never : T` does not detect `never`, because a naked `never` distributes over an empty union and the conditional is never evaluated (the result is `never`). Write `[T] extends [never]` instead.

---

**Q16: What does `ClassName` resolve to, and how do template literal types combine with union types to produce every possible string combination?**

```ts
type Color = "red" | "blue";
type Size = "sm" | "lg";
type ClassName = `${Size}-${Color}`;
```

**Answer:** `ClassName` is `"sm-red" | "sm-blue" | "lg-red" | "lg-blue"` — the full cross product of `Size` and `Color`.

**Explanation:**

Template literal types (TS 4.1+) distribute over every union slot, so 2 × 2 slots give 4 strings. They combine with the intrinsic string types `Uppercase`, `Lowercase`, `Capitalize` and `Uncapitalize`:

```ts
type Event = "click" | "focus";
type HandlerName = `on${Capitalize<Event>}`; // "onClick" | "onFocus"
```

With `infer` they can also **parse** strings at compile time:

```ts
type Split<S extends string, Sep extends string> =
  S extends `${infer H}${Sep}${infer T}` ? [H, ...Split<T, Sep>] : [S];
type Parts = Split<"a.b.c", ".">; // ["a", "b", "c"]
```

The cross product grows fast (three 4-member unions give 64 members), and TypeScript gives up with an error at around 100,000. → [§10.3 Template Literal Types](/javascript/typescript#103-template-literal-types)

---

### Modern TypeScript (5.x–7.0)

---

**Q17: Both predicates look identical, so why does only one of them narrow the array?**

```ts
const values: (number | null)[] = [1, null, 2, null, 3];

const a = (v: number | null) => v !== null;
const b = (v: number | null): boolean => v !== null;

const x = values.filter(a);
const y = values.filter(b);
```

**Output (inferred types):**
```
a: (v: number | null) => v is number
b: (v: number | null) => boolean

x: number[]
y: (number | null)[]
```

**Explanation:**

TypeScript 5.5 **infers type predicates**: `a` is inferred as `v is number`, so `filter`'s predicate overload returns `number[]`. Writing `: boolean` on `b` pins the return type, so `filter` uses its plain overload and `y` keeps the `null`. The irony: annotating return types is normally good practice.

The inference fires only when the function has **no return-type annotation**, a **single `return`**, **does not reassign its parameter**, and returns a **pure refinement** of it. Each of these falls back to `boolean`:

```ts
const c = (v: number | null) => { if (v === null) return false; return true; };  // two returns
const d = (v: number | null) => { v = v ?? null; return v !== null; };            // reassigns its parameter
const e = (v: number | null) => v !== null && Math.random() > 0.5;                // not a pure refinement
```

Aliasing the check in a `const` (`(v) => { const ok = v !== null; return ok; }`) still infers `v is number`, and an inline `values.filter(v => v !== null)` gives `number[]` too: it is the function's shape that matters, not whether it is named. When a predicate needs more than one statement, write `v is T` yourself. → [§10.7](/javascript/typescript#107-controlling-inference-const-type-parameters-noinfer-and-inferred-predicates)

---

**Q18: Why does the first call type-check when it clearly shouldn't, and what does `NoInfer` change?**

```ts
function createState<T extends string>(initial: T, allowed: T[]) {}
function createState2<T extends string>(initial: T, allowed: NoInfer<T>[]) {}

createState('dark', ['light', 'dark']);     // ?
createState2('dark', ['light', 'dark']);    // ?
```

**Output:**
```
createState('dark', ['light', 'dark']);    // OK — no error (T = 'dark' | 'light')
createState2('dark', ['light', 'dark']);   // Error: Type '"light"' is not
                                           // assignable to type '"dark"'
```

**Explanation:**

In `createState`, both parameters are inference sites. The candidates `'dark'`, `'light'` and `'dark'` are all literals of the same primitive, and the `extends string` constraint keeps them literal, so `T` becomes their union `'dark' | 'light'` and the "initial must be one of allowed" check passes vacuously. `NoInfer<T>` (TS 5.4) removes `allowed` from inference without changing what it must accept: `T` is decided by `initial` alone (`'dark'`), and then `'light'` fails against `'dark'[]`. It is an inference-site marker, not a constraint, with no runtime or assignability meaning of its own. Before 5.4 the workarounds were a second parameter (`<T, U extends T>`), the `T & {}` trick, or an explicit type argument at every call.

Two limits on that union rule:

- **Without `extends string`**, `T` inferred from string literals widens to `string`, so neither call errors and `NoInfer` looks like a no-op.
- **Candidates with different base types do not merge into a union.** For `function f<T>(a: T, b: T)`, the call `f(1, 'x')` does not give `T = number | string`: TypeScript picks `T = 1` from the first argument and reports TS2345 (`Argument of type '"x"' is not assignable to parameter of type '1'`).

→ [§10.7](/javascript/typescript#107-controlling-inference-const-type-parameters-noinfer-and-inferred-predicates)

---

**Q19: Which of these four declarations are errors under `erasableSyntaxOnly`, and why does that flag exist?**

```ts
// tsconfig: { "erasableSyntaxOnly": true }

enum Status { Active, Done }
declare enum Ambient { A, B }
namespace Types { export type Id = string; }
namespace Runtime { export const x = 1; }
class User { constructor(private name: string) {} }
```

**Output:**
```
enum Status      → Error: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
declare enum     → OK    — ambient, emits nothing
namespace Types  → OK    — contains only types, emits nothing
namespace Runtime→ Error: emits an IIFE
private name     → Error: parameter properties emit an assignment
```

**Explanation:**

The rule is **"nothing that generates runtime code."** `enum Status` emits an object ([Q14](/javascript/typescript-tricky-questions)); `declare enum` is ambient and emits nothing. A type-only `namespace` emits nothing, but one holding a `const` emits an IIFE. `constructor(private name: string)` desugars into `this.name = name`, so half of that syntax is code. `import x = require()` is rejected too.

The flag (TS 5.8) exists because Node, Deno, Bun, esbuild, SWC and Rolldown run or transpile `.ts` by **stripping types syntactically**, one file at a time with no type information. That is only sound when every TypeScript construct is erasable, and the flag makes the type checker enforce it. The replacements:

```ts
// instead of enum
const Status = { Active: 'active', Done: 'done' } as const;
type Status = typeof Status[keyof typeof Status];   // 'active' | 'done'

// instead of a runtime namespace — just use a module
export const x = 1;

// instead of a parameter property
class User {
  private name: string;
  constructor(name: string) { this.name = name; }
}
```

You give up enum reverse mapping, `namespace` declaration merging and some constructor boilerplate; in return the same file runs unbuilt everywhere. → [§13.3](/javascript/typescript#133-compiler-flags-that-matter-in-2026)

---

### Types vs Runtime

TypeScript's types are **erased**: the compiler checks them and then deletes them, so none of them exist when the code runs. Most TypeScript surprises come from forgetting that. (The playground strips types without checking them, so Try it shows the runtime output but never a compile error; the ✗ lines show what `tsc` reports.)

**Q20: The value was asserted `as number`, so why does `n + 1` give `'51'`?**

```ts
const input: unknown = '5';
const n = input as number;
console.log(n + 1);
console.log(typeof n);

const real = Number(input);
console.log(real + 1);
```

**Output:**
```text
51
string
6
```

**Explanation:**

`as` is a promise you make to the compiler, not a conversion; it compiles to `const n = input;`.

| Line | Why |
|---|---|
| `51` | at runtime `n` is the string `'5'`, and `'5' + 1` joins strings ([JavaScript tricky Q34](/javascript/tricky-questions)) |
| `string` | `typeof` looks at the real value, which the assertion never touched |
| `6` | `Number(input)` actually converts, so this is real arithmetic |

A direct `'5' as number` is rejected because the types do not overlap; going through `unknown` or `any` removes even that check, which is why `as unknown as X` is a code smell. To get the type you want, convert (`Number`, `String`, `new Date`) or validate with a type guard or a schema library such as Zod.

---

**Q21: `pin` is `private`, so why can the code still read it, and why does it show up in `JSON.stringify` when `#secret` does not?**

```ts
class Wallet {
  private pin = 1234;
  #secret = 'hidden';
  reveal() {
    return this.#secret;
  }
}

const w = new Wallet();
// console.log(w.pin);   // ✗ TS2341: Property 'pin' is private and only accessible within class 'Wallet'.
console.log(w['pin']);
console.log(JSON.stringify(w));
console.log(Object.keys(w).join(', '));
console.log(w.reveal());
```

**Output** (the lines marked ✗ are compile errors, commented out so the code runs):
```text
1234
{"pin":1234}
pin
hidden
```

**Explanation:**

`private` is a compile-time rule that is erased; `#secret` is a JavaScript **private field** the engine enforces.

| Line | Why |
|---|---|
| (✗ line) | `w.pin` is rejected by the compiler: that is all `private` does |
| `1234` | bracket access to a private member is a deliberate TypeScript escape hatch, and at runtime `pin` is an ordinary property |
| `{"pin":1234}` | `JSON.stringify` serialises the "private" PIN; `#secret` is not a property at all |
| `pin` | same for `Object.keys` |
| `hidden` | only code inside the class can read `#secret`, not even brackets reach it from outside |

Use `#private` when the value must be unreachable; use TypeScript `private` (or `protected`) when you only want to stop accidental use and may need access from tests or subclasses. TypeScript-`private` values still show in dev tools, logs and serialised output.

---

**Q22: A `Robot` is not a `Cat`, so why can one be assigned to a `Cat` variable, while `Euros` cannot be assigned to `Dollars`?**

```ts
class Cat {
  name = 'Tom';
  speak() { return 'meow'; }
}
class Robot {
  name = 'R2';
  speak() { return 'beep'; }
}

const pet: Cat = new Robot();
console.log(pet instanceof Cat, pet.speak());

class Dollars {
  private readonly currency = 'USD';
  constructor(public amount: number) {}
}
class Euros {
  private readonly currency = 'EUR';
  constructor(public amount: number) {}
}
// const wallet: Dollars = new Euros(5);   // ✗ TS2322: Type 'Euros' is not assignable to type 'Dollars'. Types have separate declarations of a private property 'currency'.
```

**Output** (the lines marked ✗ are compile errors, commented out so the code runs):
```text
false beep
```

**Explanation:**

TypeScript compares classes by **shape**, not name; a `private` member is the exception, because it ties the type to the class that declared it.

| Line | Why |
|---|---|
| `false beep` | `Robot` has `Cat`'s shape, so the assignment compiles, but at runtime it is still a `Robot` |
| (✗ line) | same public shape, but each class declares its own `private currency`, so they are incompatible |

When same-shaped types must not mix (two currencies, a `UserId` and an `OrderId`), make them **nominal**: a private member for classes, or a **branded type** for values, such as `type UserId = string & { readonly __brand: 'UserId' }`. → [§10.5 Branded Types](/javascript/typescript#105-brandedopaque-types)

---

**Q23: Why does `Object.keys(p)` give you `string[]` instead of `('x' | 'y')[]`, and why does the sum come out as 103?**

```ts
interface Point {
  x: number;
  y: number;
}

function sum(p: Point) {
  let total = 0;
  for (const key of Object.keys(p)) {
    // total += p[key];   // ✗ TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Point'.
    total += (p as unknown as Record<string, number>)[key];
  }
  return total;
}

const point3d = { x: 1, y: 2, z: 100 };
console.log(sum(point3d));
```

**Output** (the lines marked ✗ are compile errors, commented out so the code runs):
```text
103
```

**Explanation:**

Because of structural typing, a `Point` may carry **more** keys than `x` and `y`, so typing `Object.keys` as `(keyof T)[]` would be a lie, and the sum shows what it would hide.

| Line | Why |
|---|---|
| (✗ line) | `key` is a plain `string`, and `Point` has no index signature |
| `103` | `point3d` is a valid `Point` with an extra `z: 100`; a variable skips the excess property check ([Q11](/javascript/typescript-tricky-questions)), and `Object.keys` returns all three keys: 1 + 2 + 100 |

Instead: loop over the keys you know (`(['x', 'y'] as const).forEach((k) => total += p[k])`), cast deliberately and locally (`Object.keys(p) as (keyof Point)[]`), or model dictionary data as `Record<string, number>` or a `Map` from the start.

---

**Q24: `names[2]` is typed as `string`, so why is it `undefined`, and why does `scores.ravi + 1` compile at all?**

```ts
const names = ['Asha', 'Ravi'];
const third = names[2];
console.log(third);
console.log(third?.toUpperCase());

const scores: Record<string, number> = { asha: 9 };
console.log(scores.ravi + 1);
```

**Output:**
```text
undefined
undefined
NaN
```

**Explanation:**

By default TypeScript assumes an index into an array or record **always finds something**.

| Line | Why |
|---|---|
| `undefined` | index 2 is empty, but its type is still `string` |
| `undefined` | `?.` saved us; `third.toUpperCase()` would also compile and crash at runtime |
| `NaN` | `scores.ravi` is typed `number`, but it is `undefined`, so this is `undefined + 1` |

`"noUncheckedIndexedAccess": true` makes both `string | undefined` / `number | undefined`. It is not part of `strict` because it adds friction to every index access, but many teams enable it, especially for records keyed by user input or API data. `for...of` and `map` are unaffected, since they only visit items that exist.

---

**Q25: `forEach` expects a callback that returns `void`, so why is `push` (which returns a number) allowed, and why does `cb()` print 42?**

```ts
const items: number[] = [];
[1, 2, 3].forEach((n) => items.push(n));

type Callback = () => void;
const cb: Callback = () => 42;
console.log(cb());

function log(): void {
  // return 42;   // ✗ TS2322: Type 'number' is not assignable to type 'void'.
}
console.log(items.join(','), log());
```

**Output** (the lines marked ✗ are compile errors, commented out so the code runs):
```text
42
1,2,3 undefined
```

**Explanation:**

A `void` return in a **function type** means "the caller ignores the result", so a function that returns something still fits. A **declaration** annotated `: void` must not return a value.

| Line | Why |
|---|---|
| `42` | assigning `() => 42` to `() => void` is allowed, and at runtime the value is still returned |
| (✗ line) | `function log(): void` itself promises to return nothing |
| `1,2,3 undefined` | `forEach` accepted `push`, which returns the new length |

The rule exists so that `arr.forEach((n) => other.push(n))` compiles without braces. The catch: `void` does not mean `undefined`. The result of calling a `() => void` yourself is typed `void` (unusable), but at runtime it might be `42`.

---

**Q26: `typeof value === 'object'` checked that it is an array, so why is `value` still `possibly 'null'`?**

```ts
function size(value: string[] | null) {
  if (typeof value === 'object') {
    // return value.length;   // ✗ TS18047: 'value' is possibly 'null'.
    return value?.length ?? 0;
  }
  return -1;
}
console.log(size(null), size(['a']));
```

**Output** (the lines marked ✗ are compile errors, commented out so the code runs):
```text
0 1
```

**Explanation:**

`typeof null` is `'object'` ([JavaScript tricky Q33](/javascript/tricky-questions)), and TypeScript knows it, so this check does not remove `null`.

| Line | Why |
|---|---|
| (✗ line) | inside the `if`, `value` is still `string[] \| null` |
| `0 1` | `size(null)` really does enter that branch; without `?.` and `??` it would throw `Cannot read properties of null` |

Fix it with `value !== null`, `Array.isArray(value)` when you mean an array, or `if (value)`, which also rules out `undefined` (and `0` and `''`, so be deliberate with non-objects).

---

### Types That Behave Differently Than They Look

Type-level results that most people get backwards the first time.

**Q27: Why does `keyof (Book | Product)` give only `'id'`, while `keyof (Book & Product)` gives every key?**

```ts
type Book = { id: number; title: string };
type Product = { id: number; price: number };

type KeysOfEither = keyof (Book | Product);
type KeysOfBoth = keyof (Book & Product);

const a: KeysOfEither = 'id';
// const b: KeysOfEither = 'title';   // ✗ TS2322: Type '"title"' is not assignable to type '"id"'.
const c: KeysOfBoth = 'price';
console.log(a, c);
```

**Output** (the lines marked ✗ are compile errors, commented out so the code runs):
```text
id price
```

**Explanation:**

`keyof` lists the keys you can **safely read**.

| Type | Result | Why |
|---|---|---|
| `keyof (Book \| Product)` | `'id'` | the value might be either, so only shared keys are guaranteed |
| `keyof (Book & Product)` | `'id' \| 'title' \| 'price'` | the value has everything from both |

A union of types gives an intersection of keys, and vice versa. That is why reading a property on a union fails unless every member has it, and why you **narrow** first (`in`, a discriminant, or a type guard; see [Q6](/javascript/typescript-tricky-questions)). → [§6](/javascript/typescript#6-union-and-intersection-types)

---

**Q28: Why can't you read `err.message` inside `catch`?**

```ts
try {
  JSON.parse('{bad json');
} catch (err) {
  // console.log(err.message);   // ✗ TS18046: 'err' is of type 'unknown'.
  if (err instanceof Error) console.log(err.name);
  console.log(typeof err);
}
```

**Output** (the lines marked ✗ are compile errors, commented out so the code runs):
```text
SyntaxError
object
```

**Explanation:**

JavaScript can throw anything (`throw 'oops'`, `throw 404`, `throw { code: 1 }`), so under `strict` the `catch` variable is **`unknown`**. The option responsible is `useUnknownInCatchVariables`, part of `strict` since TypeScript 4.4; without it `err` is `any`.

| Line | Why |
|---|---|
| (✗ line) | reading `.message` on `unknown` needs narrowing first |
| `SyntaxError` | after `instanceof Error`, `err` is an `Error`; this one is the `SyntaxError` from the bad JSON |
| `object` | the real value at runtime |

A common helper: `const message = err instanceof Error ? err.message : String(err);`.

---

**Q29: Both overloads accept the value on its own, so why does `parse(either)` fail with 'No overload matches this call'?**

```ts
function parse(input: string): number;
function parse(input: number): string;
function parse(input: string | number) {
  return typeof input === 'string' ? Number(input) : String(input);
}

const a = parse('42');
const b = parse(42);
console.log(typeof a, typeof b);

const either: string | number = Math.random() > 0.5 ? 'x' : 1;
// parse(either);   // ✗ TS2769: No overload matches this call.
```

**Output** (the lines marked ✗ are compile errors, commented out so the code runs):
```text
number string
```

**Explanation:**

Callers see only the **overload signatures**, each checked on its own; the implementation signature `(input: string | number)` exists for the body and is invisible from outside.

| Line | Why |
|---|---|
| `number string` | `parse('42')` matched the first overload, `parse(42)` the second |
| (✗ line) | `string \| number` fits neither overload on its own |

Fix it with an overload that accepts the union (`function parse(input: string | number): string | number;`), or replace the overloads with a conditional return type: `function parse<T extends string | number>(input: T): T extends string ? number : string`. Overloads are clearest for two or three genuinely different call shapes.

---

**Q30: `nickname?: string` and `nickname: string | undefined` look the same, so why does `{}` fit one and not the other?**

```ts
type WithOptional = { nickname?: string };
type WithUndefined = { nickname: string | undefined };

const a: WithOptional = {};
// const b: WithUndefined = {};   // ✗ TS2741: Property 'nickname' is missing in type '{}' but required in type 'WithUndefined'.
const c: WithUndefined = { nickname: undefined };
console.log('nickname' in a, 'nickname' in c);
```

**Output** (the lines marked ✗ are compile errors, commented out so the code runs):
```text
false true
```

**Explanation:**

`?` means the key **may be missing**; `| undefined` means the key **must be present**, with a value that may be `undefined`.

| Line | Why |
|---|---|
| (✗ line) | `WithUndefined` requires the key, and `{}` lacks it |
| `false true` | at runtime `a` has no key, while `c` has the key set to `undefined` |

The difference shows wherever code checks for presence: `in`, `Object.keys`, `hasOwnProperty`, spreading (`{ ...defaults, ...overrides }` copies an explicit `undefined` over the default), and APIs where "missing" means "leave unchanged" but `undefined` or `null` means "clear it". By default `?` also accepts an explicit `undefined`; `exactOptionalPropertyTypes` makes `{ nickname: undefined }` an error for `nickname?: string`, which catches the spreading bug.

---

**Q31: Why is `name` narrowed to `string` inside the first arrow function, but `possibly 'undefined'` inside the second?**

```ts
function greeter(name: string | undefined) {
  if (!name) name = 'guest';
  return () => name.toUpperCase();
}
console.log(greeter(undefined)());

function laterReassigned(input: string | undefined) {
  let name = input;
  if (!name) name = 'guest';
  // const shout = () => name.toUpperCase();   // ✗ TS18048: 'name' is possibly 'undefined'.
  name = input;
}
```

**Output** (the lines marked ✗ are compile errors, commented out so the code runs):
```text
GUEST
```

**Explanation:**

A closure may run later, so TypeScript keeps a narrowing inside it only if the variable **cannot be reassigned after the closure is created**.

| Line | Why |
|---|---|
| `GUEST` | in `greeter`, the last assignment comes before the arrow is created |
| (✗ line) | in `laterReassigned`, `name = input` comes after, so the arrow might see `undefined` |

Since **TypeScript 5.4** the compiler checks where the last assignment is; before that, any `let` or parameter lost its narrowing in a closure, and `greeter` needed a `const` copy. Copying the narrowed value into a `const` is still the simple way to keep it.

---

### Key Rules

```
TypeScript Output Cheat Sheet:
1. `let` widens to base type, `const` preserves literal type
2. `as const` makes everything readonly + literal
3. Object literals get excess property checks, variables don't
4. Conditional types distribute over unions
5. `keyof` string index returns `string | number`
6. `never` disappears from unions, absorbs intersections
7. `any` bypasses all checks; `unknown` requires narrowing
8. Function params are contravariant (strict mode)
9. Numeric enums have reverse mapping, string enums don't
10. Template literal types distribute over unions
11. Types are erased: `as` never converts, `private` is compile-time only, `#private` is real
12. Classes match by shape; a `private` member makes a class match only itself
13. `Object.keys` returns `string[]` because objects can carry extra keys
14. `arr[i]` and `record[key]` are assumed to exist unless `noUncheckedIndexedAccess` is on
15. `() => void` means "return value ignored", not "returns nothing"
16. `typeof x === 'object'` does not exclude `null`
17. `keyof (A | B)` = shared keys; `keyof (A & B)` = all keys
18. `catch (err)` is `unknown` under `strict`
19. Only overload signatures are callable, each checked on its own
20. `?:` may be missing; `| undefined` must be present
21. Narrowing survives into a closure only if the variable is not reassigned after it
```
