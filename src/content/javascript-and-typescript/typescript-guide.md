# TypeScript — Core Concepts

The type system from the ground up: how compilation works, basic and advanced types, generics, narrowing, utility types, classes, modules and compiler options.

Part of the TypeScript series: **TypeScript Guide** · [TypeScript Interview Questions](/javascript/typescript-interview-questions) · [TypeScript Tricky Questions](/javascript/typescript-tricky-questions)

---

## Table of Contents

- [1. What is TypeScript?](#1-what-is-typescript)
- [2. Basic Types](#2-basic-types)
- [3. Interfaces and Type Aliases](#3-interfaces-and-type-aliases)
- [4. Functions](#4-functions)
- [5. Generics](#5-generics)
- [6. Union and Intersection Types](#6-union-and-intersection-types)
- [7. Type Narrowing and Guards](#7-type-narrowing-and-guards)
- [8. Utility Types](#8-utility-types)
- [9. Enums](#9-enums)
- [10. Advanced Types](#10-advanced-types)
- [11. Classes](#11-classes)
- [12. Modules and Declaration Files](#12-modules-and-declaration-files)
- [13. Compiler Options](#13-compiler-options)
- [14. Best Practices](#14-best-practices)

---

## 1. What is TypeScript?

TypeScript is a **statically typed superset of JavaScript** that compiles to plain JavaScript. It adds optional type annotations, interfaces, generics and other type-system features that catch errors at compile time rather than runtime.

Key benefits:
- **Type safety** — a typo in a property name or a missing `null` check becomes a compile error instead of a crash in production.
- **Better IDE support** — the editor knows each value's type, so it can autocomplete, rename a symbol everywhere safely, and jump to definitions.
- **Self-documenting** — `getUser(id: string): Promise<User | null>` tells the next reader what to pass and what comes back, and unlike a comment the compiler keeps it true.
- **Gradual adoption** — plain JavaScript is valid input, so you can rename files to `.ts` one at a time and tighten the checks as you go.
- **Compiles to any JS version** — the `target` option sets which JavaScript version the output uses (ES2015, ES2022, ESNext, …), so you write modern syntax and still ship to older runtimes. (`ES5` is deprecated in TypeScript 6.0.)

```bash
# Install
npm install -D typescript

# Compile
npx tsc file.ts

# Initialize tsconfig
npx tsc --init

# Type check only (no output)
npx tsc --noEmit
```

---

## 1.1 TypeScript Compilation — The 3 Core Stages

When you "compile" TypeScript, the compiler (`tsc`) does **three distinct jobs**, and modern toolchains split them across different tools.

### Stage 1: Type Checking (Static Analysis)

The compiler checks your code against annotations, inferred types and constraints, and reports errors **without running the code**.

```typescript
// Type checking catches these at compile time, not runtime:

const age: number = "hello";
// Error: Type 'string' is not assignable to type 'number'

function greet(name: string): string {
  return name.toUpperCase();
}
greet(42);
// Error: Argument of type 'number' is not assignable to parameter of type 'string'

interface User {
  name: string;
  email: string;
}
const user: User = { name: "Alice" };
// Error: Property 'email' is missing in type '{ name: string; }' but required in type 'User'
```

Types are **entirely erased at runtime**, so this is the only stage that knows about them. It is also the **slowest** stage (it analyses the whole type graph), and `tsc --noEmit` runs it alone. The `strict` flag turns on the strictest checking (recommended).

### Stage 2: Transpilation (TypeScript → JavaScript)

The compiler **strips all type annotations** and converts TypeScript-specific syntax into plain JavaScript that browsers or Node.js can execute.

```typescript
// =================== INPUT (TypeScript) ===================
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `Hello ${user.name}, age ${user.age}`;
}

const alice: User = { name: "Alice", age: 30 };
console.log(greet(alice));

enum Direction {
  Up = "UP",
  Down = "DOWN",
}
```

```typescript
// =================== OUTPUT (JavaScript) ===================
// Notice: ALL type annotations are gone. Interfaces are completely erased.

// Names are unchanged: tsc never renames identifiers, it only removes types.

function greet(user) {
  return `Hello ${user.name}, age ${user.age}`;
}

const alice = { name: "Alice", age: 30 };
console.log(greet(alice));

// The enum, unlike the interface, becomes real runtime code:
var Direction;
(function (Direction) {
  Direction["Up"] = "UP";
  Direction["Down"] = "DOWN";
})(Direction || (Direction = {}));
```

**Erased (zero runtime cost):** type annotations (`: string`), interfaces and type aliases, generics (`<T>`), `as` assertions, overload signatures, `readonly`, and access modifiers (`private` is not enforced at runtime).

**Emits runtime JavaScript** (the full list, see also [§13.3](#133-compiler-flags-that-matter-in-2026)):

| Construct | Becomes |
|---|---|
| `enum` | an object |
| `namespace` | an IIFE |
| Constructor parameter properties, `constructor(private x: number)` | an assignment, `this.x = x` |
| `import x = require('…')` | a `require` call |
| Decorators | calls to the decorator functions (standard decorators need no flag since TS 5.0; only legacy ones need `experimentalDecorators`) |

Separately, the `target` option down-levels newer *JavaScript* syntax (classes, `?.`, `??`) for older runtimes, and `module: "commonjs"` turns `import`/`export` into `require`/`module.exports`:

```json
{
  "compilerOptions": {
    "target": "ES2015",    // Output: let/const, arrow functions, classes
    "target": "ES2020",    // Output: optional chaining, nullish coalescing
    "target": "ESNext"     // Output: latest syntax, minimal transformation
  }
}
```

`"target": "ES5"` is deprecated in TypeScript 6.0: it fails with TS5107 unless you add `"ignoreDeprecations": "6.0"`, and it stops working in 7.0.

### Stage 3: Declaration File Generation (`.d.ts`)

The compiler can generate **type declaration files** that describe your code's public API — types only, no implementation. This is how consumers of a JavaScript library get type safety.

```typescript
// =================== SOURCE: math.ts ===================
export function add(a: number, b: number): number {
  return a + b;
}

export interface Vector {
  x: number;
  y: number;
}

export class Calculator {
  private history: number[] = [];

  calculate(a: number, b: number): number {
    const result = a + b;
    this.history.push(result);
    return result;
  }
}
```

```typescript
// =================== GENERATED: math.d.ts ===================
// Contains ONLY type information — no implementation code
export declare function add(a: number, b: number): number;

export interface Vector {
  x: number;
  y: number;
}

export declare class Calculator {
  private history;
  calculate(a: number, b: number): number;
}
```

You need them to publish an npm package, to share types across a monorepo, or to ship types for JavaScript checked via `allowJs` and JSDoc. Application code doesn't: it has the `.ts` sources (PrepHub itself sets `noEmit: true`). Enable with:
```json
{
  "compilerOptions": {
    "declaration": true,       // Generate .d.ts files
    "declarationDir": "./types" // Output directory
  }
}
```

### How Modern Tooling Splits These 3 Stages

Most modern projects (Vite, Next.js) **don't use `tsc` for everything**. They split the work for speed:

| Stage | Tool | Speed | Why |
|-------|------|-------|-----|
| **Type Checking** | `tsc --noEmit` (in the IDE and CI) | Slow (~seconds) | Must analyze entire type graph — only `tsc` can do this |
| **Transpilation** | **esbuild** (Vite), **SWC** (Next.js), or **Babel** | Very fast (~ms) | Just strips types, file by file — no type analysis |
| **Declaration Files** | `tsc --emitDeclarationOnly` | Moderate | Only needed for libraries |

**Why the split?** `tsc` up to 6.x is written in TypeScript and runs as JavaScript on Node, so it is slow at transpiling; 7.x is a native Go port ([§13.2](#132-the-2026-compiler-landscape-typescript-60-70-and-the-go-rewrite)). esbuild (Go) and SWC (Rust) are 10–100× faster because they strip types without analysing them. The trade-off: they catch no type errors, so `tsc` still runs, separately.

### Interview Quick Summary

| Question | Answer |
|----------|--------|
| Does TypeScript run in the browser? | No — it must be compiled to JavaScript first; all types are erased |
| Is there a runtime cost to TypeScript types? | Zero for types. Only the constructs in the table above (enums, namespaces, parameter properties, `import =`, decorators) emit code |
| What's the difference between `tsc` and Babel for TS? | `tsc` type-checks + transpiles. Babel only strips types (no checking) |

---

## 2. Basic Types

### 2.1 Primitives

The primitive types are `string`, `number`, `boolean`, `bigint` and `symbol`.

```ts
let name: string = 'Alice';
let age: number = 30;
let isActive: boolean = true;
let big: bigint = 100n;
let unique: symbol = Symbol('id');
```

### 2.2 Arrays and Tuples

An array type fixes the element type; a tuple fixes the length and the type of each position. Both accept `readonly`.

```ts
// Arrays
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ['Alice', 'Bob'];      // generic syntax

// Readonly array
let frozen: readonly number[] = [1, 2, 3];
// frozen.push(4);   // Error: Property 'push' does not exist

// Tuples (fixed-length, typed positions)
let pair: [string, number] = ['Alice', 30];
let triple: [string, number, boolean] = ['Alice', 30, true];

// Named tuples (documentation only)
type Point = [x: number, y: number];
const origin: Point = [0, 0];

// Optional tuple elements
type Response = [number, string, boolean?];
const ok: Response = [200, 'OK'];
const okFull: Response = [200, 'OK', true];
```

### 2.3 Special Types

`any` disables checking, `unknown` accepts anything but must be narrowed before use, `void` means a function returns nothing, and `never` means no value can occur (a function that always throws).

```ts
// any - opt out of type checking
let anything: any = 42;
anything = 'string';                    // no error
anything.nonExistent.method();          // no error (dangerous!)

// unknown - type-safe any (must narrow before use)
let value: unknown = 42;
// value.toFixed();                     // Error TS18046: 'value' is of type 'unknown'.
if (typeof value === 'number') {
  value.toFixed();                      // OK after narrowing
}

// void - function returns nothing
function log(msg: string): void {
  console.log(msg);
}

// never - function never returns (throws or infinite loop)
function throwError(msg: string): never {
  throw new Error(msg);
}

function infinite(): never {
  while (true) {}
}

// null and undefined
let n: null = null;
let u: undefined = undefined;

// object (any non-primitive)
let obj: object = {};                   // broad
let record: Record<string, unknown> = {};  // better
```

### 2.4 Literal Types

A literal type is one exact value. A union of literals is a precise set of allowed values, and `as const` infers the narrowest literal types for a whole object or array ([interview Q10](/javascript/typescript-interview-questions) covers what its `readonly` does and does not guarantee).

```ts
// String literals
type Direction = 'north' | 'south' | 'east' | 'west';
let dir: Direction = 'north';
// dir = 'up';   // Error

// Numeric literals
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

// Boolean literal
type Yes = true;

// const assertion (narrows to literal type)
const config = {
  port: 3000,
  host: 'localhost',
} as const;
// typeof config = { readonly port: 3000; readonly host: 'localhost' }
```

---

## 3. Interfaces and Type Aliases

### 3.1 Interfaces

An interface names an object shape. It supports optional and readonly properties, `extends`, declaration merging and index signatures.

Two facts do most of the work here. An interface is **structural**: any object with the right properties satisfies it, whether or not anything says `implements User`, because TypeScript compares shapes, not names. And it is **erased**: nothing of `interface User` exists at runtime, so you cannot check `x instanceof User` or loop over its keys. It describes data; it does not validate it ([interview Q27](/javascript/typescript-interview-questions) covers what to do at a boundary like `JSON.parse`).

```ts
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;                          // optional
  readonly createdAt: Date;              // cannot be modified after creation
}

const user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date(),
};

// Extending interfaces
interface Employee extends User {
  department: string;
  salary: number;
}

// Multiple inheritance
interface Manager extends Employee {
  reports: Employee[];
}

// Interface merging (declaration merging)
interface Config {
  port: number;
}
interface Config {
  host: string;
}
// Config now has both port and host

// Index signatures
interface Dictionary {
  [key: string]: string;
}

// Callable interface
interface Formatter {
  (input: string): string;
}
```

### 3.2 Type Aliases

`type` names *any* type: primitives, unions, intersections, tuples, mapped types. An alias cannot be merged.

```ts
type ID = string | number;

type User = {
  id: ID;
  name: string;
  email: string;
};

// Union types (can only be done with type, not interface)
type Status = 'active' | 'inactive' | 'suspended';

// Intersection types
type Employee = User & {
  department: string;
};

// Mapped types
type ReadonlyUser = Readonly<User>;

// Template literal types
type EventName = `on${Capitalize<string>}`;
```

### 3.3 Interface vs Type — When to Use Which

| Feature | Interface | Type |
|---------|-----------|------|
| Object shapes | Yes | Yes |
| Extends/implements | Yes | Yes (via `&`) |
| Declaration merging | Yes | No |
| Union/intersection | No | Yes |
| Mapped types | No | Yes |
| Tuples | No | Yes |
| Primitives | No | Yes |

**Rule of thumb**: Use `interface` for object shapes (especially public APIs). Use `type` for unions, intersections, mapped types, and primitives.

#### Can a `type` be extended like an `interface`?

**Yes — with `&` instead of `extends`**, and the two mix freely in both directions:

```ts
type Animal = { name: string };
interface Pet { owner: string }

interface Dog extends Animal { breed: string }   // interface extending a TYPE alias
type Cat = Pet & { indoor: boolean };            // type intersecting an INTERFACE
```

The `extends` **keyword** is interface-only — `type Dog extends Animal = …` is a syntax error — but the *capability* is not.

**Where they genuinely differ is a conflict**:

```ts
interface IUser { id: number }
interface IAdmin extends IUser { id: string }
// ❌ Error TS2430: Interface 'IAdmin' incorrectly extends interface 'IUser'.
//    Types of property 'id' are incompatible.

type TUser = { id: number };
type TAdmin = TUser & { id: string };
// ✅ No error — but TAdmin['id'] is now `never`, because no value is
//    both a number and a string. The bug surfaces at every USE site
//    instead of at the declaration.
```

`extends` **rejects an incompatible override**; `&` silently produces an impossible type. That is the best argument for `interface` on shapes others will extend: you find out at the declaration, not three files away.

Two more asymmetries: an interface can only extend **an object type (or intersection of them) with statically known members**, so `interface X extends SomeUnion` is an error (TS2312) while `SomeUnion & { … }` is fine; and only interfaces merge, which is why the DOM and Node typings are interfaces you can add to from your own code.

---

## 4. Functions

### 4.1 Type Annotations

The practical rule: **always annotate parameters**, because TypeScript cannot infer them from inside the function, and under `strict` an unannotated parameter is an error (`Parameter 'a' implicitly has an 'any' type`). **Return types are inferred**, so annotating them is optional; the reason to write one on an exported function anyway is that a wrong `return` is then reported inside the function, instead of as a confusing error at every caller.

```ts
// Parameter and return types
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Optional parameters
function greet(name: string, greeting?: string): string {
  return `${greeting ?? 'Hello'}, ${name}`;
}

// Default parameters
function greetV2(name: string, greeting: string = 'Hello'): string {
  return `${greeting}, ${name}`;
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
```

### 4.2 Function Types

A function type describes a whole signature, for callbacks and higher-order functions. Overloads list several call signatures so the return type can depend on the arguments; only the final implementation signature has a body, and callers cannot see it.

```ts
// Type alias for function
type MathFn = (a: number, b: number) => number;

const add: MathFn = (a, b) => a + b;
const subtract: MathFn = (a, b) => a - b;

// Callback typing
function fetchData(url: string, callback: (data: unknown) => void): void {
  // ...
}

// Function overloads
function createElement(tag: 'div'): HTMLDivElement;
function createElement(tag: 'input'): HTMLInputElement;
function createElement(tag: string): HTMLElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

const div = createElement('div');       // type: HTMLDivElement
const input = createElement('input');   // type: HTMLInputElement
```

### 4.3 this Parameter

A fake first parameter named `this` types the call context, so calling a detached method (an event handler, a callback) with the wrong `this` is a compile error. It is erased from the output.

```ts
interface User {
  name: string;
  greet(this: User): string;
}

const user: User = {
  name: 'Alice',
  greet() {
    return `Hi, I'm ${this.name}`;       // `this` is typed as User
  },
};
```

---

## 5. Generics

### 5.1 Generic Functions

A type parameter `<T>` captures the actual type at each call site, so the return type stays precise instead of falling back to `any`.

```ts
// Without generics (loses type info)
function identity(value: any): any {
  return value;
}

// With generics (preserves type info)
function identityV2<T>(value: T): T {
  return value;
}

identityV2<string>('hello');              // type: string
identityV2(42);                           // type: 42 (inferred)
```

### 5.2 Generic Interfaces and Types

Interfaces and type aliases take type parameters too.

```ts
// Generic interface
interface ApiResponse<T> {
  status: number;
  message: string;
  results: T;
}

type UserResponse = ApiResponse<User>;
type UsersResponse = ApiResponse<User[]>;

// Generic type
type Nullable<T> = T | null;
type AsyncResult<T> = Promise<ApiResponse<T>>;
```

### 5.3 Generic Constraints

`extends` limits what `T` may be, which is what lets the body use `.length` or index by a key.

```ts
// Constrain T to objects with a length property
function logLength<T extends { length: number }>(item: T): void {
  console.log(item.length);
}

logLength('hello');                     // OK (string has length)
logLength([1, 2, 3]);                   // OK (array has length)
// logLength(42);                       // Error (number has no length)

// keyof constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };
getProperty(user, 'name');              // type: string
getProperty(user, 'age');               // type: number
// getProperty(user, 'email');          // Error: 'email' not in keyof User
```

### 5.4 Generic Classes

A class takes type parameters, fixed when you instantiate it.

```ts
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
}

const numberStack = new Stack<number>();
numberStack.push(42);
numberStack.push('hello');              // Error: string is not number
```

### 5.5 Multiple Type Parameters

Use several parameters to relate several types, and a default (`T = string`) so callers can omit one.

```ts
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second];
}

const p = pair('hello', 42);           // type: [string, number]

// With defaults
type Container<T = string> = {
  value: T;
};

const c: Container = { value: 'hello' };        // T defaults to string
const n: Container<number> = { value: 42 };
```

---

## 6. Union and Intersection Types

### 6.1 Union Types

`A | B` is one of several types, and you must narrow before using type-specific members. A **discriminated union** gives every member a shared literal property (`kind`), so a `switch` on it narrows automatically.

```ts
// A value that can be one of several types
type ID = string | number;

function printId(id: ID) {
  // Must narrow before using type-specific methods
  if (typeof id === 'string') {
    console.log(id.toUpperCase());       // OK (narrowed to string)
  } else {
    console.log(id.toFixed(2));          // OK (narrowed to number)
  }
}

// Discriminated unions (tagged unions)
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return 0.5 * shape.base * shape.height;
  }
}
```

### 6.2 Intersection Types

`A & B` must satisfy all of its parts, which composes object shapes from small pieces (a conflicting property becomes `never`, see [§3.3](#33-interface-vs-type-when-to-use-which)).

```ts
// Combine multiple types into one (AND)
type HasName = { name: string };
type HasAge = { age: number };
type HasEmail = { email: string };

type Person = HasName & HasAge & HasEmail;

const person: Person = {
  name: 'Alice',
  age: 30,
  email: 'alice@example.com',
};

// Practical: extending API responses
type BaseResponse = { status: number; timestamp: string };
type UserResponse = BaseResponse & { user: User };
type ErrorResponse = BaseResponse & { error: string; code: number };
```

---

## 7. Type Narrowing and Guards

### 7.1 Built-in Narrowing

The compiler follows control flow: after a `typeof`, `instanceof`, `in`, truthiness or equality check, the branch sees the narrower type.

```ts
function process(value: string | number | boolean) {
  // typeof narrowing
  if (typeof value === 'string') {
    value.toUpperCase();                 // string
  }

  // Truthiness narrowing
  if (value) {
    // excludes false, 0, ''
  }

  // Equality narrowing
  if (value === true) {
    // boolean (specifically true)
  }
}

// instanceof narrowing
function logDate(date: Date | string) {
  if (date instanceof Date) {
    date.getTime();                      // Date
  } else {
    Date.parse(date);                    // string
  }
}

// in operator narrowing
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    animal.swim();                       // Fish
  } else {
    animal.fly();                        // Bird
  }
}
```

### 7.2 User-Defined Type Guards

A **type predicate** (`value is T`) narrows inside the `if` that calls it; an **assertion function** (`asserts value is T`) narrows everything after the call and must throw otherwise. TypeScript trusts both without checking the body. Since TS 5.5 a simple predicate can be inferred ([§10.7](#107-controlling-inference-const-type-parameters-noinfer-and-inferred-predicates)).

```ts
// Type predicate (is)
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function process(value: unknown) {
  if (isString(value)) {
    value.toUpperCase();                 // narrowed to string
  }
}

// For discriminated unions
function isCircle(shape: Shape): shape is { kind: 'circle'; radius: number } {
  return shape.kind === 'circle';
}

// Assertion function (asserts)
function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== 'number') {
    throw new Error('Not a number');
  }
}

function calculate(input: unknown) {
  assertIsNumber(input);
  input.toFixed(2);                      // narrowed to number after assertion
}
```

### 7.3 Exhaustive Checks

Assign the value to `never` in the `default` branch: once every member is handled nothing is left, so adding a member without a `case` becomes a compile error.

```ts
type Status = 'active' | 'inactive' | 'suspended';

function handleStatus(status: Status): string {
  switch (status) {
    case 'active': return 'User is active';
    case 'inactive': return 'User is inactive';
    case 'suspended': return 'User is suspended';
    default: {
      // If a new status is added to the union but not handled above,
      // this line will produce a compile error
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
```

---

## 8. Utility Types

### 8.1 Object Utility Types

Built-in utility types **derive** one type from another, so the derived type stays in sync when the original changes. They are mapped types ([§10.1](#101-mapped-types)) you don't have to write.

```ts
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Partial<T> - all properties optional
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; age?: number }

// Required<T> - all properties required
type RequiredUser = Required<PartialUser>;

// Readonly<T> - all properties readonly
type ReadonlyUser = Readonly<User>;
// { readonly id: number; readonly name: string; ... }

// Pick<T, Keys> - select specific properties
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string }

// Omit<T, Keys> - exclude specific properties
type UserWithoutEmail = Omit<User, 'email'>;
// { id: number; name: string; age: number }

// Record<Keys, Value> - construct object type
type Roles = Record<'admin' | 'user' | 'guest', boolean>;
// { admin: boolean; user: boolean; guest: boolean }

type StringMap = Record<string, string>;
// { [key: string]: string }
```

### 8.2 Union Utility Types

These filter the members of a union by assignability (they are conditional types, [§10.2](#102-conditional-types)). Unlike `Pick`/`Omit` they do not touch object properties ([interview Q28](/javascript/typescript-interview-questions)).

```ts
// Exclude<Union, Excluded> - remove types from union
type T1 = Exclude<'a' | 'b' | 'c', 'a'>;
// 'b' | 'c'

// Extract<Union, Extracted> - keep only matching types
type T2 = Extract<'a' | 'b' | 'c', 'a' | 'c'>;
// 'a' | 'c'

// NonNullable<T> - remove null and undefined
type T3 = NonNullable<string | null | undefined>;
// string
```

### 8.3 Function Utility Types

These derive types from an existing function, even one a library does not export types for.

```ts
function createUser(name: string, age: number): User {
  return { id: 1, name, email: '', age };
}

// Parameters<T> - tuple of parameter types
type Params = Parameters<typeof createUser>;
// [string, number]

// ReturnType<T> - return type
type Result = ReturnType<typeof createUser>;
// User

// Awaited<T> - unwrap Promise
type Data = Awaited<Promise<string>>;
// string

type DeepData = Awaited<Promise<Promise<number>>>;
// number
```

### 8.4 String Utility Types

These transform string literal types, usually inside template literal types ([§10.3](#103-template-literal-types)).

```ts
type Upper = Uppercase<'hello'>;           // 'HELLO'
type Lower = Lowercase<'HELLO'>;           // 'hello'
type Cap = Capitalize<'hello'>;            // 'Hello'
type Uncap = Uncapitalize<'Hello'>;        // 'hello'
```

---

## 9. Enums

### 9.1 Numeric Enums

Members auto-increment from 0 (or from a value you set), and numeric enums get a **reverse mapping** from value back to name.

```ts
enum Direction {
  Up,        // 0
  Down,      // 1
  Left,      // 2
  Right,     // 3
}

enum StatusCode {
  OK = 200,
  NotFound = 404,
  ServerError = 500,
}

const dir: Direction = Direction.Up;      // 0
Direction[0];                              // 'Up' (reverse mapping)
```

### 9.2 String Enums

Every member needs an explicit string value. The values are readable when debugging, but there is no reverse mapping.

```ts
enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

// No reverse mapping for string enums
const s: Status = Status.Active;          // 'active'
```

### 9.3 const Enums

A `const enum` is erased and its values are inlined where they are used, so no runtime object exists. It is still enum syntax, so `erasableSyntaxOnly` ([§13.3](#133-compiler-flags-that-matter-in-2026)) rejects it (TS1294); under that flag use an `as const` object instead.

```ts
// Inlined at compile time (no runtime object)
const enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

const c = Color.Red;                      // compiles to: const c = 'red'
```

### 9.4 Enums vs Union Types

Modern TypeScript prefers a union of string literals: it is erased (no runtime code, nothing to tree-shake), simpler, and allowed under `erasableSyntaxOnly`. When you also need the values at runtime, derive the union from an `as const` object. Use an enum only if you need its reverse mapping.

```ts
enum StatusEnum { Active = 'active', Inactive = 'inactive' }   // emits an object

type Status = 'active' | 'inactive';                            // erased

const STATUS = { Active: 'active', Inactive: 'inactive' } as const;
type StatusValue = (typeof STATUS)[keyof typeof STATUS];        // 'active' | 'inactive'
```

---

## 10. Advanced Types

### 10.1 Mapped Types

A mapped type loops over keys: `[P in keyof T]` visits each key and the right-hand side says what the property becomes. This is how `Partial` and `Readonly` are built. An `as` clause renames each key, and a key renamed to `never` is dropped, which is how you filter properties.

```ts
// Create new types by transforming properties of existing types
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};

// With key remapping (as clause)
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

type UserGetters = Getters<User>;
// { getId: () => number; getName: () => string; getEmail: () => string; ... }

// Filter keys
type OnlyStrings<T> = {
  [P in keyof T as T[P] extends string ? P : never]: T[P];
};
```

### 10.2 Conditional Types

`T extends U ? X : Y` is an `if` for types: if `T` is assignable to `U` the result is `X`, otherwise `Y`. `infer R` captures whatever type sits in that position, like a regex capture group, which is how `ReturnType` and `Awaited` are written. Given a union, a conditional on a **naked** `T` runs once per member and unions the results; wrap it as `[T] extends [U]` to test the union as a whole.

```ts
// T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;               // true
type B = IsString<number>;               // false

// Distributive conditional types (distributes over union)
type ToArray<T> = T extends unknown ? T[] : never;
type C = ToArray<string | number>;        // string[] | number[]
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;
type C2 = ToArrayNonDist<string | number>; // (string | number)[]

// infer keyword (extract types)
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

type D = UnpackPromise<Promise<string>>;  // string
type E = UnpackPromise<number>;           // number

// Extract array element type
type ElementOf<T> = T extends (infer E)[] ? E : never;
type F = ElementOf<string[]>;             // string
```

### 10.3 Template Literal Types

Template literal types build string types from other string types. Put a union inside one and TypeScript produces every combination, so a few short unions describe a large set of allowed strings: event names, routes, i18n keys, CSS values.

```ts
type EventName = `${'click' | 'focus' | 'blur'}Event`;
// 'clickEvent' | 'focusEvent' | 'blurEvent'

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = `/${string}`;
type Route = `${HTTPMethod} ${Endpoint}`;
// 'GET /...' | 'POST /...' | 'PUT /...' | 'DELETE /...'

// Practical: event handler types
type PropEventSource<T> = {
  on<K extends string & keyof T>(
    eventName: `${K}Changed`,
    callback: (newValue: T[K]) => void
  ): void;
};

declare function makeWatchedObject<T>(obj: T): T & PropEventSource<T>;

const person = makeWatchedObject({ name: 'Alice', age: 30 });
person.on('nameChanged', (newName) => {});  // newName: string
person.on('ageChanged', (newAge) => {});    // newAge: number
```

### 10.4 Recursive Types

A type may reference itself, which models trees and nested data: JSON values, file systems, deep partials.

```ts
// JSON type
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

// Deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Nested path type
type Path<T, Key extends keyof T = keyof T> =
  Key extends string
    ? T[Key] extends object
      ? Key | `${Key}.${Path<T[Key]>}`
      : Key
    : never;
```

### 10.5 Branded/Opaque Types

Typing is structural, so two types with the same shape are interchangeable. A **brand** is a phantom property that exists only in the type, making `USD` and `EUR` incompatible although both are numbers at runtime.

```ts
// Prevent mixing types that are structurally identical
type Brand<T, B> = T & { __brand: B };

type USD = Brand<number, 'USD'>;
type EUR = Brand<number, 'EUR'>;

function addUSD(a: USD, b: USD): USD {
  return (a + b) as USD;
}

const dollars = 100 as USD;
const euros = 85 as EUR;

addUSD(dollars, dollars);                 // OK
// addUSD(dollars, euros);                // Error: EUR is not USD
```

### 10.6 The `satisfies` Operator (TS 4.9+)

`satisfies` checks that a value matches a type *without losing the value's precise inferred shape*. Before it, you chose between an **annotation** (validates but widens) and an **`as` cast** (keeps the shape but validates nothing).

```ts
type RGB = [number, number, number];
type Colors = Partial<Record<'red' | 'green' | 'blue', string | RGB>>;

// Option 1 — annotation: validates, but widens. Every value is now
// string | RGB | undefined, whatever you actually wrote.
const palette1: Colors = {
  red: [255, 0, 0],
  green: '#00ff00',
};
// palette1.green.toUpperCase();  // ✗ TS18048: 'palette1.green' is possibly 'undefined'.

// Option 2 — `as` cast: keeps going, but validates nothing.
const palette2 = {
  read: [255, 0, 0],             // typo, not reported
  green: '#00ff00',
} as Colors;

// Option 3 — `satisfies`: validates against Colors AND keeps the
// inferred shape (red: tuple, green: string).
const palette3 = {
  red: [255, 0, 0],              // spelt `read`, this is TS2561: "Did you mean to write 'red'?"
  green: '#00ff00',
} satisfies Colors;

palette3.red[0];                 // ✅ number — TS knows red is a tuple
palette3.green.toUpperCase();    // ✅ string — TS knows green is a string
// palette3.blue;                // ✗ TS2339: Property 'blue' does not exist on type '{ red: [number, number, number]; green: string; }'.
palette3.red.push(0);            // compiles: a plain tuple type still has push

// Add `as const` (and allow readonly tuples) to make the values immutable too.
type Palette = Partial<Record<'red' | 'green' | 'blue', string | readonly [number, number, number]>>;
const palette4 = { red: [255, 0, 0] } as const satisfies Palette;
// palette4.red.push(0);         // ✗ TS2339: Property 'push' does not exist on type 'readonly [255, 0, 0]'.

// Const objects with shape constraints — the canonical use case
const config = {
  api: 'https://api.example.com',
  timeout: 5000,
  features: { darkMode: true, beta: false },
} satisfies Record<string, unknown>;

config.api.toUpperCase();        // ✅ string
config.features.darkMode;        // ✅ boolean — exact key preserved
```

The typo is only caught because `Colors` has **fixed keys**: against `Record<string, …>` any key is legal, so `satisfies` would accept `read` too. Use `satisfies` wherever you would otherwise write `as Foo` on a config object; use an annotation when you genuinely want the wider type (a parameter typed `Colors` should accept any `Colors`).

---

### 10.7 Controlling Inference — `const` Type Parameters, `NoInfer`, and Inferred Predicates

Three features from TS 5.0–5.5 steer inference where it is usually right but not always.

**`const` type parameters (TS 5.0)** stop a helper from widening its literals. A type parameter inferred from an array argument normally becomes `string[]`; before 5.0 the only fix was making every *caller* write `as const`.

```ts
// Without `const` — T widens to string[]
function names<T extends readonly string[]>(arg: T): T { return arg; }
const a = names(['alice', 'bob']);
//    ^? string[]  — the literals are gone

// With `const` — the call site is inferred as if it wrote `as const`
function constNames<const T extends readonly string[]>(arg: T): T { return arg; }
const b = constNames(['alice', 'bob']);
//    ^? readonly ['alice', 'bob']
```

The library author writes `const` once, on the type parameter, instead of every caller writing `as const`. Two details: the constraint must permit readonly (`readonly string[]`, not `string[]`), or the inferred readonly tuple won't satisfy it; and it only affects **literal expressions** at the call site, so passing a variable that is already `string[]` still gives `string[]`.

**`NoInfer<T>` (TS 5.4)** stops a parameter position from taking part in inferring `T`. The classic case is a list of options that shouldn't get a vote in what `T` is:

```ts
// Problem: TS infers T from BOTH parameters, producing a union
function createState<T extends string>(initial: T, options: T[]) { /* … */ }
createState('dark', ['light', 'dark']);        // T = 'dark' | 'light' — no error!

// Fix: only the first parameter decides T
function createState2<T extends string>(initial: T, options: NoInfer<T>[]) { /* … */ }
createState2('dark', ['light', 'dark']);       // Error: 'light' not assignable to 'dark'
```

**The `extends string` constraint is load-bearing.** An *unconstrained* `T` inferred from a string widens to `string`, so `['light', 'dark']` is a fine `string[]` and **neither version errors**: `NoInfer` appears to do nothing. Constraining `T` to a primitive is what preserves the literal `'dark'`, giving `NoInfer` something narrower to protect. `NoInfer` is an inference-site marker, not a constraint: it changes *who decides* `T`, not what is assignable.

**Inferred type predicates (TS 5.5)** make the common `filter` idiom narrow without an annotation. Before 5.5 the callback returned `boolean`, so the nulls stayed in the result type:

```ts
const values: (number | null)[] = [1, null, 2, null, 3];

// TS 5.5+: TypeScript infers `v is number` from the body — no annotation needed
const nums = values.filter(v => v !== null);
//    ^? number[]      (was (number | null)[] before 5.5)

// Works on named predicates too, and generically
const isNonNullish = <T,>(x: T) => x != null;
//    ^? <T>(x: T) => x is NonNullable<T>
```

The inference applies **only if all four** hold: **no explicit return type or predicate annotation**; a **single `return` statement** and no implicit returns; **no mutation of the parameter**; and a boolean expression that genuinely refines the parameter.

The first condition is the trap, because annotating return types is normally good practice:

```ts
const a = (v: number | null) => v !== null;             // (v) => v is number
const b = (v: number | null): boolean => v !== null;    // just boolean

values.filter(a);   // number[]
values.filter(b);   // (number | null)[]   — the annotation defeated the inference
```

The second bites too: rewriting the one-liner as `if`/`return true`/`return false`, or adding an early `return false`, drops back to `boolean`. For anything longer than one expression, write `v is T` explicitly.

---

## 11. Classes

### 11.1 Basic Class

TypeScript adds access modifiers (`public`, `private`, `protected`), `readonly` fields and constructor **parameter properties** (`constructor(public email: string)` declares and assigns in one go). These modifiers are compile-time only: use a JavaScript `#private` field for privacy at runtime.

```ts
class User {
  // Properties with access modifiers
  public name: string;
  private password: string;
  protected role: string;
  readonly id: number;

  // Constructor shorthand (declares and assigns)
  constructor(
    public email: string,
    name: string,
    password: string,
  ) {
    this.id = Math.random();
    this.name = name;
    this.password = password;
    this.role = 'user';
  }

  // Method
  greet(): string {
    return `Hi, I'm ${this.name}`;
  }

  // Getter/Setter
  get displayName(): string {
    return this.name.toUpperCase();
  }

  set displayName(value: string) {
    this.name = value.toLowerCase();
  }
}
```

### 11.2 Inheritance and Abstract Classes

An abstract class cannot be instantiated; its abstract methods have no body and every subclass must implement them, while its concrete methods are shared.

```ts
abstract class Shape {
  abstract area(): number;                // must be implemented
  abstract perimeter(): number;

  describe(): string {                    // concrete method
    return `Area: ${this.area()}, Perimeter: ${this.perimeter()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  perimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

// Cannot instantiate abstract class
// const s = new Shape();                 // Error
const c = new Circle(5);
c.describe();                             // 'Area: 78.54, Perimeter: 31.42'
```

### 11.3 Implements

`implements` checks at compile time that a class has every member of one or more interfaces. It adds nothing to the class and does not type its parameters for you.

```ts
interface Serializable {
  serialize(): string;
}

interface Loggable {
  log(): void;
}

class User implements Serializable, Loggable {
  constructor(public name: string) {}

  serialize(): string {
    return JSON.stringify({ name: this.name });
  }

  log(): void {
    console.log(this.name);
  }
}
```

### 11.4 Static Members

Static members belong to the class, not to instances. A `private constructor` plus a static accessor is the singleton pattern.

```ts
class MathUtils {
  static PI = 3.14159;

  static add(a: number, b: number): number {
    return a + b;
  }

  // Private constructor = singleton
  private static instance: MathUtils;
  private constructor() {}

  static getInstance(): MathUtils {
    if (!MathUtils.instance) {
      MathUtils.instance = new MathUtils();
    }
    return MathUtils.instance;
  }
}

MathUtils.PI;                              // 3.14159
MathUtils.add(1, 2);                       // 3
```

---

## 12. Modules and Declaration Files

### 12.1 Module Syntax

Standard ES module syntax, with types exported and re-exported like values (a barrel file re-exports a folder's public API).

```ts
// Named exports
export interface User { name: string; }
export function createUser(name: string): User { return { name }; }
export const MAX_USERS = 100;

// Default export
export default class UserService { /* ... */ }

// Re-exports
export { User } from './user';
export { default as UserService } from './user-service';
export * from './utils';
export type { User } from './user';        // type-only re-export
```

### 12.2 Type-Only Imports

`import type` is always erased, so a module imported only for its types is never loaded at runtime, which avoids accidental runtime circular dependencies. Under `verbatimModuleSyntax` ([§13.3](#133-compiler-flags-that-matter-in-2026)) it is required for types.

```ts
// Import only the type (erased at runtime, no bundle impact)
import type { User } from './types';
```

```ts
// Inline type import
import { createUser, type User } from './user';
```

### 12.3 Declaration Files (.d.ts)

A `.d.ts` file holds types only, for JavaScript that has none: untyped libraries, globals, ambient modules. `declare` says "this exists at runtime; trust me".

```ts
// global.d.ts - declare global types
declare global {
  interface Window {
    analytics: Analytics;
  }
}

// module.d.ts - type a module without types
declare module 'untyped-library' {
  export function doSomething(input: string): number;
}

// Ambient declarations
declare const __DEV__: boolean;
declare function gtag(...args: unknown[]): void;
```

### 12.4 Triple-Slash Directives

Special comments at the very top of a file that pull in extra type files, mostly global types such as `vite/client`.

```ts
/// <reference types="vite/client" />
/// <reference path="./custom-types.d.ts" />
```

---

## 13. Compiler Options

### 13.1 Key tsconfig.json Options

`strict: true` turns on the whole strict family at once (`noImplicitAny` and `strictNullChecks` below are already part of it, listed for clarity).

```jsonc
{
  "compilerOptions": {
    // Type Checking
    "strict": true,                      // enable all strict checks
    "noUncheckedIndexedAccess": true,    // array[i] is T | undefined
    "noImplicitAny": true,               // error on implicit any
    "strictNullChecks": true,            // null/undefined not assignable to other types
    "noUnusedLocals": true,              // error on unused variables
    "noUnusedParameters": true,          // error on unused params

    // Module
    "module": "ESNext",                  // output module system
    "moduleResolution": "bundler",       // how to resolve imports
    "esModuleInterop": true,             // CJS/ESM interop
    "resolveJsonModule": true,           // allow importing .json

    // Output
    "target": "ES2022",                  // JS version to compile to
    "outDir": "./dist",
    "declaration": true,                 // generate .d.ts files
    "sourceMap": true,

    // Path Aliases (relative to this file; `baseUrl` is deprecated in
    // TS 6.0, error TS5101, so don't add it)
    "paths": {
      "@/*": ["./src/*"]
    },

    // JSX
    "jsx": "react-jsx",                 // React 17+ JSX transform

    // Other
    "skipLibCheck": true,                // skip checking .d.ts files
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### 13.2 The 2026 Compiler Landscape — TypeScript 6.0, 7.0, and the Go Rewrite

The compiler was rewritten in **Go** and shipped as **TypeScript 7.0** on 8 July 2026. The language did not change; the build pipeline did.

| Version | Shipped | What it is |
|---|---|---|
| **5.9** | Aug 2025 | `import defer`, `--module node20`, the last routine 5.x |
| **6.0** | 23 Mar 2026 | The **final release built on the original JavaScript codebase**. A bridge release: it turns long-standing deprecations into errors so your code is ready for 7.0 |
| **7.0** | 8 Jul 2026 | The **Go-native compiler** (project codename *Corsa*), 8–12× faster type-checking, same `tsc` binary from the same `typescript` package |

**Why it is faster.** The old compiler ran on Node: every type node was a garbage-collected JavaScript object and the checker ran on one thread. The Go port gets native code, real structs with predictable memory layout, and **shared-memory parallelism**: goroutines check independent files concurrently against one shared type graph, which Node workers cannot do because they cannot share a heap. The biggest effect is in the *editor*: opening a file with an error in the VS Code codebase went from ~17.5 s to under 1.3 s.

**What matters for an upgrade:**

- 7.0 is **behaviourally compatible** with 6.0's type-checking and CLI, so code that compiles cleanly on 6.0 should compile identically on 7.0. Your `tsconfig.json` and types do not change, and there are no new type-system features (no nominal or runtime types).
- `tsgo` was the 2025 preview binary from `@typescript/native-preview`. From the 7.0 RC onward the native build **is** `tsc` in the normal `typescript` package; nightlies are `typescript@next`.
- **7.0 ships no programmatic API at all**, and a *new and different* API is expected in 7.1. Anything that drives the compiler as a library (Vue, Svelte, Astro and MDX language tooling, custom AST transforms, some type-aware ESLint setups) stays on 6.0, which is published as **`@typescript/typescript6`** with a `tsc6` binary so both can be installed side by side.

The upgrade plan and the interview framing are in [interview Q21](/javascript/typescript-interview-questions).

---

### 13.3 Compiler Flags That Matter in 2026

Beyond `strict`, these newer flags come up in code review and interviews.

```jsonc
{
  "compilerOptions": {
    // Reject TS syntax that emits runtime code, so files run under
    // Node's type stripping (Node 22+/24+).
    "erasableSyntaxOnly": true,     // TS 5.8+

    // Never elide imports based on type analysis: emit what you wrote.
    "verbatimModuleSyntax": true,   // TS 5.0+

    // Exports must be annotated well enough to generate .d.ts files
    // per-file, in parallel, without type-checking.
    "isolatedDeclarations": true,   // TS 5.5+

    // arr[0] is T | undefined, not T: the highest-value flag beyond strict.
    "noUncheckedIndexedAccess": true,

    // Resolve the way a bundler does: exports maps, no extension required.
    "moduleResolution": "bundler",
    "module": "preserve"            // TS 5.4+ — emit imports untouched
  }
}
```

**`erasableSyntaxOnly`** ties TypeScript to Node's type stripping ([Node.js guide](/backend/nodejs)). Node runs `.ts` files by *deleting* type annotations, a per-file syntactic transform with no type information, so it only works if every construct in the file can be deleted without changing behaviour. These cannot:

```ts
enum Status { Active, Done }        // emits a real object at runtime
namespace Legacy { export const x = 1; }  // emits an IIFE
class User {
  constructor(private name: string) {}    // parameter property emits an assignment
}
// import Legacy = require('./legacy');  — import-equals emits a require
```

With the flag on, all four are errors (TS1294), including `const enum`. The replacements: an `as const` object plus a derived union instead of `enum`, ES modules instead of `namespace`, and explicit field assignment instead of parameter properties. The payoff: the same source runs unbuilt under Node, Deno and Bun, and transpiles identically through esbuild, SWC and Rolldown. The cost: no enum reverse mapping, no namespace merging, and a few lines of boilerplate per class.

**`verbatimModuleSyntax`** stops TypeScript from guessing about imports. Without it, `tsc` elides an import whose names are all used only as types, but a single-file transpiler (esbuild, SWC, Babel, Node's stripper) cannot see types and must guess. The two wrong guesses:

- **The module never runs.** `import { UserType } from './models'` names only a type, so the whole statement is dropped, and anything `./models` registers as a side effect silently doesn't happen. (A bare `import './polyfills'` is never elided.)
- **A runtime import of a type.** The transpiler keeps `import { UserType }` for a pure interface, and the build fails with "does not provide an export named 'UserType'", often only in the production bundle.

With the flag on, what you write is what is emitted, and importing a type without `type` is an error. It pairs with `isolatedModules` and `module: "preserve"`.

```ts
import { getUser, type User } from './user';   // inline type modifier
import type { Config } from './config';         // whole import is type-only
```

---

## 14. Best Practices

### 14.1 Do's

The reasons: `strict` turns on the checks (null safety above all) you adopted TypeScript for. Discriminated unions make impossible states impossible to write ([interview Q25](/javascript/typescript-interview-questions)). `unknown` forces a check before use, where `any` switches checking off. `as const` keeps literals like `'/about'` so you can derive unions from them. `import type` tells every tool the import vanishes at runtime ([§13.3](#133-compiler-flags-that-matter-in-2026)).

```ts
// 1. Use strict mode
// tsconfig: "strict": true

// 2. Prefer interfaces for object shapes
interface User {
  name: string;
  email: string;
}

// 3. Use discriminated unions for state machines
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error };

// 4. Use `unknown` instead of `any` for truly unknown values
function processInput(input: unknown) {
  if (typeof input === 'string') {
    // safely narrowed
  }
}

// 5. Use `as const` for literal constants
const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  USERS: '/users',
} as const;

// 6. Use type-only imports
import type { User } from './types';
```

### 14.2 Don'ts

The reasons, in order. `any` spreads: anything read off an `any` is also `any`, so one escape hatch turns off checking downstream. An enum emits a runtime object (as do namespaces, parameter properties and `import =`), which rules it out under Node's type stripping and `erasableSyntaxOnly` ([§13.3](#133-compiler-flags-that-matter-in-2026)), while a union of strings does the same job and is erased. `!` is an unchecked promise: if the element is missing you crash later and further from the cause, where an explicit check fails right there. Annotating what TypeScript infers adds noise, and on a `const` it *widens* the type (`string` instead of `'Alice'`). `object` and `Function` are too broad to use safely: `Function` accepts any function and lets you call it with any arguments.

```ts
// 1. Don't use `any` as escape hatch
// BAD
function parseBad(input: any): any { /* … */ }
// GOOD
function parse(input: unknown): Result { /* … */ }

// 2. Don't use enums (prefer union types)
// BAD
enum StatusEnum { Active = 'active', Inactive = 'inactive' }
// GOOD
type Status = 'active' | 'inactive';

// 3. Don't use `!` (non-null assertion) unless truly necessary
// BAD
const elBad = document.getElementById('app')!;
// GOOD
const el = document.getElementById('app');
if (!el) throw new Error('Missing #app');

// 4. Don't over-type (let TypeScript infer)
// BAD
const nameBad: string = 'Alice';
const numbersBad: number[] = [1, 2, 3];
// GOOD
const name = 'Alice';
const numbers = [1, 2, 3];

// 5. Don't use `object` or `Function` types
// BAD
function processBad(obj: object, fn: Function) { /* … */ }
// GOOD
function process(obj: Record<string, unknown>, fn: () => void) { /* … */ }
```

---

## References

- [TypeScript Documentation](https://www.typescriptlang.org/docs) — Official docs and handbook
- [TypeScript Playground](https://www.typescriptlang.org/play) — Try TypeScript in the browser
- [TypeScript GitHub](https://github.com/microsoft/TypeScript) — Source code and issue tracker
- [Type Challenges](https://github.com/type-challenges/type-challenges) — Practice advanced TypeScript types
