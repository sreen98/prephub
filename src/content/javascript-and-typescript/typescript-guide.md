# TypeScript — Complete Guide

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
- [15. Interview Questions & Answers](#15-interview-questions-answers)
- [16. Tricky Output Questions](#16-tricky-output-questions)

---

## 1. What is TypeScript?

TypeScript is a **statically typed superset of JavaScript** that compiles to plain JavaScript. It adds optional type annotations, interfaces, generics, and other type-system features that catch errors at compile time rather than runtime.

Key benefits:
- **Type safety** — a typo in a property name or a missing `null` check becomes a compile error instead of a crash in production.
- **Better IDE support** — because the editor knows each value's type, it can offer accurate autocompletion, rename a symbol everywhere safely, and jump to where something is defined.
- **Self-documenting** — a signature like `getUser(id: string): Promise<User | null>` tells the next reader what to pass and what can come back, and unlike a comment it cannot silently go out of date, because the compiler checks it.
- **Gradual adoption** — plain JavaScript is valid input, so you can rename files to `.ts` one at a time and tighten the checks as you go.
- **Compiles to any JS version** — the `target` option sets which JavaScript version the output uses (ES5, ES2015, ESNext, …), so you write modern syntax and still ship to older runtimes.

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

When you "compile" TypeScript, the compiler (`tsc`) performs **three distinct jobs**. Understanding these is essential — interviewers test this to see if you truly know what TypeScript does under the hood versus what's marketing.

### Stage 1: Type Checking (Static Analysis)

The compiler analyzes your code against all type annotations, inferred types, and type constraints. It reports errors **without running the code** — this is the primary reason TypeScript exists.

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

**Key facts:**
- Type checking is **entirely erased at runtime** — JavaScript has no concept of TypeScript types
- The `strict` flag in `tsconfig.json` enables the strictest checking (recommended)
- Type checking is the **slowest** part of compilation (must analyze the entire type graph)
- You can run type checking alone with `tsc --noEmit` (no output files, just error reporting)

### Stage 2: Transpilation (TypeScript → JavaScript)

After type checking, the compiler **strips all type annotations** and converts TypeScript-specific syntax into plain JavaScript that browsers or Node.js can execute.

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

function greetV2(user) {
  return `Hello ${user.name}, age ${user.age}`;
}

const aliceV2 = { name: "Alice", age: 30 };
console.log(greetV2(aliceV2));
```

```typescript
// Enums are one of the few TS features that produce runtime code:
var Direction;
(function (Direction) {
  Direction["Up"] = "UP";
  Direction["Down"] = "DOWN";
})(Direction || (Direction = {}));
```

**What gets erased (zero runtime cost):**
- Type annotations (`: string`, `: number`, etc.)
- Interfaces and type aliases
- Generics (`<T>`)
- `as` type assertions
- Function overload signatures
- `readonly` modifiers
- Access modifiers (`public`, `private`, `protected`) — in terms of actual enforcement

**What produces runtime JavaScript:**
- Enums → become objects
- Decorators → wrapper functions (experimental)
- `class` features → constructor patterns (when targeting older ES versions)
- `import`/`export` → `require`/`module.exports` (when targeting CommonJS)

**Target configuration** — the `target` in `tsconfig.json` controls what JavaScript version the output uses:

```json
{
  "compilerOptions": {
    "target": "ES5",       // Output: var, function(), no arrow functions
    "target": "ES2015",    // Output: let/const, arrow functions, classes
    "target": "ES2020",    // Output: optional chaining, nullish coalescing
    "target": "ESNext"     // Output: latest syntax, minimal transformation
  }
}
```

### Stage 3: Declaration File Generation (`.d.ts`)

The compiler can generate **type declaration files** that describe the public API of your code — types only, no implementation. This is how TypeScript projects consume JavaScript libraries with type safety.

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

**When declaration files are needed:**
- Publishing an npm package (so consumers get type support)
- Sharing types across a monorepo
- Using `allowJs` to type-check JavaScript files with JSDoc comments

**When they're NOT needed:**
- Application code (not a library) — you already have the source `.ts` files
- Our PrepHub app doesn't generate `.d.ts` files (`noEmit: true`)

Enable with:
```json
{
  "compilerOptions": {
    "declaration": true,       // Generate .d.ts files
    "declarationDir": "./types" // Output directory
  }
}
```

### How Modern Tooling Splits These 3 Stages

In practice, most modern projects **don't use `tsc` for everything**. They split the work across specialized tools for speed:

| Stage | Tool | Speed | Why |
|-------|------|-------|-----|
| **Type Checking** | `tsc --noEmit` (or IDE) | Slow (~seconds) | Must analyze entire type graph — only `tsc` can do this |
| **Transpilation** | **esbuild** (Vite), **SWC** (Next.js), or **Babel** | Very fast (~ms) | Just strips types — no type analysis needed |
| **Declaration Files** | `tsc --emitDeclarationOnly` | Moderate | Only needed for libraries |

```
Traditional (tsc does everything):
  .ts → [tsc] → type check + transpile + emit .d.ts → .js + .d.ts

Modern (split pipeline, used by Vite/Next.js):
  .ts → [esbuild/SWC] → strip types only (instant) → .js
  .ts → [tsc --noEmit] → type check only (in IDE / CI)
  .ts → [tsc --emitDeclarationOnly] → .d.ts (libraries only)
```

**Why the split?** `tsc` is written in JavaScript and is fundamentally slow for transpilation. esbuild (Go) and SWC (Rust) are 10-100x faster because they only strip types without analyzing them. The trade-off: they can't catch type errors — so you still need `tsc` for checking, but it runs separately (in your IDE or CI pipeline).

### Interview Quick Summary

| Question | Answer |
|----------|--------|
| What does TypeScript compile to? | Plain JavaScript — all types are erased at runtime |
| Does TypeScript run in the browser? | No — it must be compiled to JavaScript first |
| What are the 3 compilation outputs? | Type errors (checking), `.js` files (transpilation), `.d.ts` files (declarations) |
| Is there a runtime cost to TypeScript types? | Zero — types are completely erased. Only enums and decorators produce runtime code |
| Why do projects use esbuild/SWC instead of tsc? | 10-100x faster transpilation. Type checking is separate (`tsc --noEmit` in CI) |
| What's the difference between `tsc` and Babel for TS? | `tsc` type-checks + transpiles. Babel only strips types (no checking) |

---

## 2. Basic Types

### 2.1 Primitives

TypeScript lets you annotate variables with primitive types such as `string`, `number`, `boolean`, `bigint`, and `symbol`. These annotations are checked at compile time, catching type mismatches before your code runs.

```ts
let name: string = 'Alice';
let age: number = 30;
let isActive: boolean = true;
let big: bigint = 100n;
let unique: symbol = Symbol('id');
```

### 2.2 Arrays and Tuples

Arrays in TypeScript can be typed to hold elements of a specific type, while tuples let you define fixed-length arrays where each position has its own type. Both support `readonly` modifiers to prevent mutation.

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

TypeScript provides several special types: `any` disables type checking entirely, `unknown` is the type-safe alternative that requires narrowing before use, `void` indicates a function returns nothing, and `never` represents values that can never occur (such as functions that always throw).

```ts
// any - opt out of type checking
let anything: any = 42;
anything = 'string';                    // no error
anything.nonExistent.method();          // no error (dangerous!)

// unknown - type-safe any (must narrow before use)
let value: unknown = 42;
// value.toFixed();                     // Error: Object is of type 'unknown'
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

Literal types narrow a variable to an exact value rather than a broad type. Combined with unions, they let you define precise sets of allowed values, and `as const` assertions automatically infer the narrowest literal types for objects and arrays.

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

Interfaces define the shape of an object by specifying property names and their types. They support optional and readonly properties, extension via `extends`, declaration merging, and index signatures, making them ideal for defining contracts in your code.

Two facts do most of the work here. An interface is **structural**: any object with the right properties satisfies it, whether or not anything says `implements User`, because TypeScript compares shapes, not names. And it is **erased**: nothing of `interface User` exists at runtime, so you cannot check `x instanceof User` or loop over its keys. It describes data; it does not validate it (interview Q27 covers what to do at a boundary like `JSON.parse`).

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

The `type` keyword creates a named alias for any type, including primitives, unions, intersections, tuples, and mapped types. Unlike interfaces, type aliases cannot be merged but are more versatile for composing complex types.

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

**Where they genuinely differ is what happens on a conflict**, and this is the part interviews probe:

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

`extends` **checks compatibility and rejects an incompatible override**; `&` just combines, and silently produces an impossible type. That is the strongest practical argument for `interface` on object shapes you expect other people to extend — you find out at the declaration rather than three files away.

Two more asymmetries follow from the same place: an interface can only extend **an object type or an intersection of object types with statically known members**, so `interface X extends SomeUnion` is an error (TS2312) while `SomeUnion & { … }` is fine; and only interfaces participate in declaration merging, which is why the DOM and Node type definitions are interfaces — you can add to them from your own code, and you cannot do that with a type alias.

---

## 4. Functions

### 4.1 Type Annotations

TypeScript lets you annotate function parameters and return values to ensure callers pass the correct types and the function returns what is expected. It also supports optional parameters, default values, and rest parameters with full type safety.

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

You can describe a function's entire signature as a type, which is useful for typing callbacks, higher-order functions, and function overloads. Function overloads let you define multiple call signatures so TypeScript can return different types based on the arguments provided.

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

TypeScript allows you to explicitly type the `this` parameter in a function or method. This prevents bugs caused by calling a method with the wrong context and is especially useful for event handlers and detached callbacks.

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

Generics let you write functions that work with any type while preserving type information through the call. Instead of falling back to `any`, a generic type parameter `<T>` captures the actual type at each call site, so the return type stays precise.

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

Interfaces and type aliases can also accept type parameters, letting you define reusable data structures like API response wrappers or nullable containers that work with any inner type.

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

You can constrain a generic type parameter using `extends` to limit what types are accepted. This ensures the generic has certain properties or structure, enabling you to safely access members like `.length` or specific object keys within the function body.

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

Classes can accept type parameters just like functions, allowing you to build type-safe data structures such as stacks, queues, or collections where the element type is specified at instantiation time.

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

Generics can accept more than one type parameter, which is useful when a function or type relates two or more independent types. You can also provide default type values so callers can omit the parameter when the default is sufficient.

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

A union type (`A | B`) means a value can be one of several types. You must narrow the type before using type-specific operations. Discriminated unions add a shared literal property (like `kind`) so TypeScript can narrow automatically in switch statements.

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

An intersection type (`A & B`) combines multiple types into one, requiring the resulting value to satisfy all of them. This is useful for composing object shapes from smaller, reusable type building blocks.

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

TypeScript automatically narrows types within control flow branches using checks like `typeof`, `instanceof`, the `in` operator, truthiness, and equality comparisons. After a narrowing check, TypeScript knows the more specific type and allows type-specific operations.

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

When built-in narrowing is not enough, you can write custom type guard functions using `is` (type predicates) or `asserts` (assertion functions). These tell TypeScript that after the check passes, the value is guaranteed to be a specific type.

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

Assigning to a `never` type in the `default` branch of a switch statement ensures that every member of a union is handled. If a new variant is added to the union but not handled, TypeScript produces a compile error, preventing missed cases.

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

TypeScript ships with built-in utility types that transform object types without writing custom mapped types. `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, and `Record` cover the most common object type transformations you will need.

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

`Exclude` removes specific members from a union, `Extract` keeps only the matching members, and `NonNullable` strips `null` and `undefined`. These are essential for filtering and refining union types.

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

`Parameters` extracts a function's parameter types as a tuple, `ReturnType` extracts the return type, and `Awaited` unwraps `Promise` types to their resolved values. These are invaluable when you need to derive types from existing functions without duplicating definitions.

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

TypeScript provides built-in types for transforming string literal types: `Uppercase`, `Lowercase`, `Capitalize`, and `Uncapitalize`. These are especially useful when combined with template literal types for generating consistent naming conventions.

```ts
type Upper = Uppercase<'hello'>;           // 'HELLO'
type Lower = Lowercase<'HELLO'>;           // 'hello'
type Cap = Capitalize<'hello'>;            // 'Hello'
type Uncap = Uncapitalize<'Hello'>;        // 'hello'
```

---

## 9. Enums

### 9.1 Numeric Enums

Numeric enums assign auto-incrementing numeric values to each member starting from 0 (or from a custom starting value). They also support reverse mapping, so you can look up the member name from its numeric value.

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

String enums require each member to be explicitly initialized with a string value. They provide readable runtime values and are easier to debug than numeric enums, but they do not support reverse mapping.

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

A `const enum` is completely erased at compile time and its values are inlined wherever they are used. This eliminates the runtime object overhead of regular enums, making them a good choice when you only need compile-time constants.

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

In modern TypeScript, string literal union types are generally preferred over enums because they produce no runtime code, are simpler to use, and tree-shake better. Use enums only when you specifically need reverse mapping or a runtime object to iterate over.

```ts
// Enum
enum Status {
  Active = 'active',
  Inactive = 'inactive',
}
```

```ts
// Union type (preferred in modern TS)
type Status = 'active' | 'inactive';
```

```ts
// Why prefer unions:
// - No runtime overhead (unions are erased)
// - Simpler, more idiomatic
// - Better tree-shaking
// - No namespace pollution
```

---

## 10. Advanced Types

### 10.1 Mapped Types

Mapped types iterate over the keys of an existing type to create a new type, optionally transforming each property's type or modifier. The `as` clause allows key remapping, enabling patterns like generating getter methods or filtering properties by type.

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

Conditional types use the syntax `T extends U ? X : Y` to choose a type based on a condition. The `infer` keyword lets you extract sub-types from within a conditional, and when applied to union type parameters, conditional types distribute over each union member automatically.

```ts
// T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;               // true
type B = IsString<number>;               // false

// Distributive conditional types (distributes over union)
type ToArray<T> = T extends unknown ? T[] : never;
type C = ToArray<string | number>;        // string[] | number[]

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

Template literal types use backtick syntax at the type level to construct string types from other string literal types. Put a union inside one and TypeScript produces every combination, so a few short unions describe a large set of allowed strings. That is how you type event names, routes and CSS values without listing each one by hand.

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

A recursive type references itself in its own definition, which is necessary for modeling tree-like or deeply nested data structures such as JSON values, file systems, or deeply partial objects.

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

TypeScript uses structural typing, so two types with the same shape are interchangeable. Branded types add a phantom property to create nominal-like distinctions, preventing you from accidentally mixing structurally identical but semantically different types like USD and EUR amounts.

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

`satisfies` is the answer to a long-standing TypeScript dilemma: how do you check that a value matches a type *without losing the precise inferred shape* of that value? Before `satisfies`, you had to choose between **type annotation** (validates but widens) or **`as` cast** (preserves the shape but skips validation). `satisfies` does both — validates *and* preserves.

```ts
type Colors = Record<string, string | RGB>;
type RGB = [number, number, number];

// Option 1 — type annotation: validates, but widens. The compiler
// forgets that 'red' is a tuple specifically; it now thinks every
// value could be string | RGB.
const palette1: Colors = {
  red: [255, 0, 0],
  green: '#00ff00',
};
palette1.red.toUpperCase();      // ❌ Error — could be RGB tuple
palette1.green.toUpperCase();    // ❌ Error — could be RGB tuple

// Option 2 — `as` cast: preserves shape, but no validation.
// Typo? Wrong type? You won't find out.
const palette2 = {
  read: [255, 0, 0],             // typo not caught
  green: '#00ff00',
} as Colors;

// Option 3 — `satisfies`: validates the value matches Colors AND
// preserves the exact inferred shape (red: tuple, green: string).
const palette3 = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies Colors;

palette3.red[0];                 // ✅ number — TS knows red is a tuple
palette3.green.toUpperCase();    // ✅ string — TS knows green is a string
// palette3.blue;                // ❌ Error: doesn't exist
// palette3.red.push(0);         // ❌ Error: tuple has fixed length

// Const objects with shape constraints — the canonical use case
const config = {
  api: 'https://api.example.com',
  timeout: 5000,
  features: { darkMode: true, beta: false },
} satisfies Record<string, unknown>;

config.api.toUpperCase();        // ✅ string
config.features.darkMode;        // ✅ boolean — exact key preserved
```

**Why interviewers ask about it:** `satisfies` is the cleanest distillation of TypeScript's tension between *type checking* and *type inference*. Knowing it shows you understand how widening works under type annotations, which is a deeper conceptual point than just "I used the operator."

Use `satisfies` whenever you'd otherwise write `as Foo` for a const config object — you get the same shape preservation plus actual validation. Use `:` annotation when you genuinely want widening (e.g., a function parameter typed as `Colors` should accept any `Colors` value, not just one specific shape).

---

### 10.7 Controlling Inference — `const` Type Parameters, `NoInfer`, and Inferred Predicates

Three features added between TS 5.0 and 5.5 all address the same theme: TypeScript's inference is usually right, and these give you the steering wheel for the cases where it isn't. They come up constantly in interviews for library-flavoured roles.

**`const` type parameters (TS 5.0)** solve the "my helper widened my literals" problem. Normally, a generic parameter inferred from an argument widens: an array argument becomes `string[]`, not a readonly tuple of literals. Before TS 5.0 the only fix was making every *caller* write `as const`, which is easy to forget and clutters the call site.

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

The `const` modifier goes on the *type parameter*, meaning the library author pays the cost once instead of every consumer paying it forever. Note the constraint must permit readonly (`readonly string[]`, not `string[]`), or the inferred readonly tuple won't satisfy it. And it only affects inference from literal expressions — passing a variable that is already `string[]` still gives you `string[]`, because there are no literals left to preserve.

**`NoInfer<T>` (TS 5.4)** blocks a type parameter from being inferred at a particular position. The classic case is a default value that shouldn't get a vote in what `T` is:

```ts
// Problem: TS infers T from BOTH parameters, producing a union
function createState<T extends string>(initial: T, options: T[]) { /* … */ }
createState('dark', ['light', 'dark']);        // T = 'dark' | 'light' — no error!

// Fix: only the first parameter decides T
function createState2<T extends string>(initial: T, options: NoInfer<T>[]) { /* … */ }
createState2('dark', ['light', 'dark']);       // Error: 'light' not assignable to 'dark'
```

**The `extends string` constraint is load-bearing, and leaving it off is the mistake to avoid.** An *unconstrained* `T` inferred from a string argument widens to `string`, so `T` is `string` in both functions, `['light', 'dark']` is a perfectly good `string[]`, and **neither version errors** — `NoInfer` appears to do nothing. Constraining `T` to a primitive type is what makes TypeScript preserve the literal `'dark'`, and only then is there a narrower type for `NoInfer` to protect. It is the same rule behind the `const` type parameter above.

`NoInfer` doesn't change assignability — it changes *who gets to decide* `T`. Say out loud in an interview that it is an inference-site marker, not a constraint, and you've demonstrated the distinction most candidates miss.

**Inferred type predicates (TS 5.5)** finally make the single most common `filter` idiom work without a manual annotation. Before 5.5, a predicate function returned `boolean`, so `filter` had no way to know the result was narrower than the input and the nulls stayed in the type:

```ts
const values: (number | null)[] = [1, null, 2, null, 3];

// TS 5.5+: TypeScript infers `v is number` from the body — no annotation needed
const nums = values.filter(v => v !== null);
//    ^? number[]      (was (number | null)[] before 5.5)

// Works on named predicates too, and generically
const isNonNullish = <T,>(x: T) => x != null;
//    ^? <T>(x: T) => x is NonNullable<T>
```

The inference kicks in **only if all four** of these hold: the function has **no explicit return type or predicate annotation**; it has a **single `return` statement** and no implicit returns; it does **not mutate its parameter**; and it returns a boolean expression that is genuinely a refinement of the parameter.

That first condition is the interview trap, because annotating return types is normally considered good practice — and here it silently costs you the narrowing:

```ts
const a = (v: number | null) => v !== null;             // (v) => v is number
const b = (v: number | null): boolean => v !== null;    // just boolean

values.filter(a);   // number[]
values.filter(b);   // (number | null)[]   — the annotation defeated the inference
```

The second condition bites too: refactoring the one-liner into an `if`/`return true`/`return false` shape, or adding an early `return false` guard, drops you back to `boolean`. When you need a predicate that is more than one expression, write the `v is T` annotation explicitly rather than relying on inference.

---

## 11. Classes

### 11.1 Basic Class

TypeScript enhances JavaScript classes with access modifiers (`public`, `private`, `protected`), `readonly` properties, constructor parameter shorthand for automatic property declaration, and typed getters/setters.

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

Abstract classes define a contract that subclasses must fulfill: abstract methods have no implementation and must be overridden, while concrete methods provide shared behavior. Abstract classes cannot be instantiated directly.

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

The `implements` keyword ensures that a class satisfies the shape defined by one or more interfaces. This provides a compile-time check that all required properties and methods are present with the correct types.

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

Static properties and methods belong to the class itself rather than to instances. They are accessed via the class name and are commonly used for utility functions, constants, and patterns like singletons.

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

TypeScript uses the standard ES module `import`/`export` syntax with full type support. You can export interfaces, types, functions, classes, and constants, and re-export them from barrel files to organize your public API.

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

Using `import type` ensures the import is completely erased at runtime, producing no JavaScript output. This avoids importing modules solely for their types, which can reduce bundle size and prevent circular dependency issues.

```ts
// Import only the type (erased at runtime, no bundle impact)
import type { User } from './types';
```

```ts
// Inline type import
import { createUser, type User } from './user';
```

### 12.3 Declaration Files (.d.ts)

Declaration files (`.d.ts`) provide type information for JavaScript code that has no built-in types, such as third-party libraries, global variables, or ambient modules. They let TypeScript understand external code without modifying it.

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

Triple-slash directives are special comments that instruct the compiler to include additional type files or reference other declaration files. They must appear at the top of the file and are primarily used when configuring global type references.

```ts
/// <reference types="vite/client" />
/// <reference path="./custom-types.d.ts" />
```

---

## 13. Compiler Options

### 13.1 Key tsconfig.json Options

The `tsconfig.json` file controls how the TypeScript compiler behaves, including strictness levels, module resolution strategy, output target, and path aliases. Enabling `strict: true` is strongly recommended as it activates all strict type-checking options at once.

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

    // Path Aliases
    "baseUrl": ".",
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

TypeScript's biggest change in a decade happened in 2026 and it is not a type-system feature. The compiler was rewritten from scratch in **Go**, shipping as **TypeScript 7.0** on 8 July 2026. Interviewers ask about it because it changes how you think about build pipelines, not because the syntax changed — the syntax didn't.

**The two-track release.** Microsoft split the transition deliberately:

| Version | Shipped | What it is |
|---|---|---|
| **5.9** | Aug 2025 | `import defer`, `--module node20`, the last routine 5.x |
| **6.0** | 23 Mar 2026 | The **final release built on the original JavaScript codebase**. A bridge release: it turns long-standing deprecations into errors so your code is ready for 7.0 |
| **7.0** | 8 Jul 2026 | The **Go-native compiler** (project codename *Corsa*), 8–12× faster type-checking, same `tsc` binary from the same `typescript` package |

**Why Go, and why 10×.** The original compiler was written in TypeScript and ran on Node, which means every type node was a garbage-collected JavaScript object and the whole checker ran on one thread. The Go port gets three things at once: native code speed, real structs with predictable memory layout instead of hashmap-backed objects, and **shared-memory parallelism** — Go goroutines can check independent files concurrently against one shared type graph, which is impossible with Node's worker model because workers cannot share a heap. The user-visible effect is on the *editor*, not just CI: opening a file with an error in the VS Code codebase went from ~17.5 s to under 1.3 s.

**What you have to know for an upgrade conversation:**

- 7.0 is **behaviourally compatible** with 6.0's type-checking and CLI. Code that compiles cleanly on 6.0 should compile identically on 7.0. The migration is a dependency bump, not a code change.
- The old `tsgo` name was the 2025 preview binary shipped via `@typescript/native-preview`. From the 7.0 RC onward, the native build **is** `tsc` inside the normal `typescript` package; `tsgo` now refers only to the nightly channel.
- **7.0 ships no programmatic API at all** — not merely an unstable one. The release notes say so plainly, and that a *new and different* API is expected in 7.1. So anything that drives the compiler as a library — the Vue, Svelte, Astro and MDX language tooling, plus custom AST transforms and some type-aware ESLint setups — has to stay on 6.0 until it catches up, and 6.0 is published as **`@typescript/typescript6`** with a `tsc6` binary precisely so the two can be installed side by side. This is the single most important caveat and the thing an interviewer probes for: "we upgraded" is the wrong answer if half your toolchain consumes the API.
- Nothing about your `tsconfig.json` or your types changes. If you were hoping the rewrite would bring nominal types or a runtime type system, it does not — it is the same type system, checked faster.

**The framing that scores well:** the rewrite is an admission that type-checking had become the slowest step in modern front-end builds. Bundling was already native (esbuild, SWC, Rolldown), so `tsc --noEmit` in CI and the editor language server were the remaining bottlenecks. TypeScript 7 closes that gap, and it is why the "just use `transpileOnly` and check types in a separate CI job" workaround is becoming unnecessary.

---

### 13.3 Compiler Flags That Matter in 2026

Beyond `strict`, a handful of newer flags come up in real code review and in interviews.

```jsonc
{
  "compilerOptions": {
    // Refuse TS syntax that emits runtime code — required if you plan to
    // run .ts files directly under Node's type stripping (Node 22+/24+).
    "erasableSyntaxOnly": true,     // TS 5.8+

    // Never rewrite or elide imports based on type analysis. Makes the
    // emit predictable for esbuild/SWC/Node, which strip types per-file
    // and cannot see whether an import was type-only.
    "verbatimModuleSyntax": true,   // TS 5.0+

    // Every exported declaration must be annotated well enough that .d.ts
    // files can be generated per-file, in parallel, without type-checking.
    "isolatedDeclarations": true,   // TS 5.5+

    // arr[0] is T | undefined, not T. The single highest-value strictness
    // flag beyond `strict` itself.
    "noUncheckedIndexedAccess": true,

    // Resolve the way a bundler does: exports maps, no extension required.
    "moduleResolution": "bundler",
    "module": "preserve"            // TS 5.4+ — emit imports untouched
  }
}
```

**`erasableSyntaxOnly` is the one to understand conceptually,** because it connects TypeScript to the Node change described in the Node.js guide. Node can now run `.ts` files by *stripping* type annotations — a purely syntactic, per-file transform with no type information available. That works only if every TypeScript construct in the file is erasable. These are **not**:

```ts
enum Status { Active, Done }        // emits a real object at runtime
namespace Legacy { export const x = 1; }  // emits an IIFE
class User {
  constructor(private name: string) {}    // parameter property emits an assignment
}
// import Legacy = require('./legacy');  — import-equals emits a require
```

Turn `erasableSyntaxOnly` on and all four become errors, pushing you toward `const` objects with `as const` instead of `enum`, ES modules instead of `namespace`, and explicit field assignment instead of parameter properties. The payoff is that your source runs unbuilt under Node, Deno, Bun and every native bundler identically.

**`verbatimModuleSyntax` catches a subtle class of bug.** Without it, TypeScript elides imports it believes are types-only — but a single-file transpiler (esbuild, SWC, Node's stripper) has no type information and cannot make that call. The result is either a dropped side-effecting import or a runtime "export not found" error that only appears in the production build. With the flag on, you must write `import type { … }` explicitly, and what you wrote is what you get.

---

## 14. Best Practices

### 14.1 Do's

Each of these exists for a concrete reason. `strict` turns on the checks (null safety above all) that catch the bugs you adopted TypeScript for. Discriminated unions make impossible states impossible to write (see Q25). `unknown` forces a check before use, where `any` silently switches checking off. `as const` keeps literal values like `'/about'` instead of widening them to `string`, so you can derive union types from them. And `import type` tells every tool in the build that the import vanishes at runtime, so none of them has to guess (see Q24).

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

The reasons, in order. `any` does not stay put: anything you read off an `any` value is also `any`, so one escape hatch quietly turns off checking downstream. Enums are the one TypeScript feature that emits a runtime object, which rules them out under Node's type stripping and `erasableSyntaxOnly` (§13.3), while a union of strings does the same job and is erased. `!` is a promise to the compiler that nothing checks at runtime; if the element really is missing, you crash later and further from the cause, whereas an explicit check fails right there with a clear message. Annotating what TypeScript already infers adds noise, and for a `const` it can make the type *wider* (`string` instead of `'Alice'`). And `object` and `Function` are so broad that you cannot safely use what you receive: `Function` accepts any function and lets you call it with any arguments.

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

## 15. Interview Questions & Answers

### Beginner

---

**Q1: What is TypeScript and how does it differ from JavaScript?**

**Short answer:** TypeScript is JavaScript plus a type system that is checked before the code runs and then deleted. "Superset" means any valid JavaScript is already valid TypeScript, so you can adopt it one file at a time.

The difference that matters is *when* you find out about a mistake. In JavaScript, calling `user.nmae` or passing a number where a string was expected fails when that line runs, possibly in production. In TypeScript the compiler reports it while you type. Everything else follows from that:

- **Type checking**: TS catches type errors at compile time; JS catches them at runtime, and only on the code paths you actually exercise.
- **Type annotations**: in TS you can state what a variable holds (`name: string`); JS is dynamically typed, so a variable can hold anything at any moment.
- **Compilation**: TS must be turned into JS before a browser or Node can run it; JS runs directly. The types are erased in that step, so they cost nothing at runtime and protect nothing at runtime either.
- **IDE support**: because the editor knows the type of every value, it can offer accurate autocompletion and rename a symbol safely across the whole project.
- **Features**: TS adds type-only constructs (interfaces, generics, access modifiers) and a few that emit real code (enums).

---

**Q2: What is the difference between `interface` and `type`?**

Both can describe object shapes, but they differ:
- `interface`: Supports declaration merging (can be extended by redeclaring). Best for object shapes and public APIs. Uses `extends` for inheritance.
- `type`: More flexible — supports unions, intersections, mapped types, tuples, and primitives. Cannot be merged. Uses `&` for combining.

```ts
// Only type can do:
type ID = string | number;
type Pair = [string, number];

// Only interface can do:
interface Window { analytics: Analytics; }  // merges with existing Window
```

---

**Q3: What is the `any` type and why should you avoid it?**

`any` disables type checking for that value — anything is allowed. It's like opting out of TypeScript.

```ts
let x: any = 42;
x.nonExistent.method(); // no error at compile time, crashes at runtime
```

The real danger is that `any` spreads. Anything you read off an `any` value is also `any`, and an `any` can be assigned to any other type, so one untyped value quietly switches off checking for everything it touches.

Use `unknown` instead: it also accepts any value, but the compiler makes you check what it is (narrow it) before you can use it. See Q5.

---

**Q4: What are generics?**

Generics let you write reusable code that works with multiple types while preserving type information. They're type parameters (like function parameters, but for types).

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

first([1, 2, 3]);        // returns number
first(['a', 'b']);        // returns string
```

Without generics, you'd use `any` and lose type safety.

---

**Q5: What is the difference between `unknown` and `any`?**

**Short answer:** both accept any value, but `any` switches type checking off, while `unknown` forces you to check what the value is before you use it. That makes `unknown` the safe choice for data whose shape you do not know yet.

In detail:
- `any`: Disables all type checking. You can do anything with it.
- `unknown`: Type-safe. You MUST narrow the type before using it.

```ts
let a: any = 'hello';
a.toFixed();              // no error (but crashes at runtime)

let b: unknown = 'hello';
// b.toFixed();           // Error: Object is of type 'unknown'
if (typeof b === 'string') {
  b.toUpperCase();        // OK after narrowing
}
```

---

### Intermediate

---

**Q6: Explain union types and discriminated unions.**

**Union type**: A value can be one of several types: `type ID = string | number`.

**Discriminated union** (tagged union): A union where each member has a common literal property (the "discriminant") that TypeScript uses for narrowing:

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

The `status` field is the discriminant. It enables exhaustive type narrowing in switch/if statements.

---

**Q7: What are utility types? Name 5 commonly used ones.**

Utility types are built-in generic types that take one type and produce a related one. Their point is to **derive types instead of copying them**: if an update form needs "a `User` with every field optional", `Partial<User>` stays in sync when someone adds a field to `User`, while a hand-written copy silently drifts.

1. `Partial<T>` — makes all properties optional
2. `Required<T>` — makes all properties required
3. `Pick<T, K>` — selects specific properties
4. `Omit<T, K>` — excludes specific properties
5. `Record<K, V>` — creates object type with keys K and values V
6. `Readonly<T>` — makes all properties readonly
7. `ReturnType<T>` — extracts function return type
8. `Parameters<T>` — extracts function parameter types as tuple
9. `NonNullable<T>` — removes null/undefined from union
10. `Awaited<T>` — unwraps Promise type

---

**Q8: What is type narrowing? List different ways to narrow types.**

Type narrowing is TypeScript following your `if` checks. The compiler reads your control flow, so inside `if (typeof x === 'string')` it knows `x` is a string, and in the `else` it knows `x` is whatever is left. That is what makes a union like `string | number` usable: you check, and the compiler lets you use the specific type in that branch without a cast.

Methods:
1. **typeof**: `if (typeof x === 'string')`
2. **instanceof**: `if (x instanceof Date)`
3. **in operator**: `if ('swim' in animal)`
4. **Truthiness**: `if (x)` (excludes null/undefined/0/''/false)
5. **Equality**: `if (x === 'active')`
6. **Discriminated union**: `if (shape.kind === 'circle')`
7. **Type predicate**: `function isString(x: unknown): x is string`
8. **Assertion function**: `function assert(x: unknown): asserts x is string`

---

**Q9: Explain `keyof` and indexed access types.**

`keyof T` produces a union of all property keys of T:

```ts
interface User { name: string; age: number; email: string; }
type UserKeys = keyof User;  // 'name' | 'age' | 'email'
```

Indexed access `T[K]` gets the type of a property:

```ts
type NameType = User['name'];              // string
type NameOrAge = User['name' | 'age'];     // string | number
```

Combined pattern (type-safe property access):

```ts
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

---

**Q10: What is `as const` and when would you use it?**

`as const` is a const assertion that narrows types to their most specific literal form and makes everything readonly:

```ts
// Without as const
const config = { port: 3000, host: 'localhost' };
// type: { port: number; host: string }

// With as const
const configV2 = { port: 3000, host: 'localhost' } as const;
// type: { readonly port: 3000; readonly host: 'localhost' }
```

**`readonly` here means "the compiler will refuse the assignment" — nothing more.** It is a *type-level* constraint, checked while you write code and then erased. Nothing is frozen at runtime:

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

So if you run the transpiled output — or paste the snippet into a playground that strips types instead of type-checking them, **including the "Try it" button on this page** — the mutation succeeds and logs `{ port: 4000, … }`. That is not a broken example; it is what `readonly` is. **TypeScript protects you while you are writing the code, not while it is running.** For a runtime guarantee you need `Object.freeze`, which is a real JavaScript operation — and note that it is shallow, and fails silently outside strict mode.

Three more properties worth knowing:

- **`as const` is deep.** Nested objects and arrays become readonly all the way down.
- **`Readonly<T>` is shallow.** `Readonly<{ db: { port: number } }>` still permits `x.db.port = 1`. The two are not interchangeable.
- **`readonly` does not survive an alias.** Assign the value to a mutable type and the protection is gone — it guards against accident, not against a determined caller.

Use cases:
- Configuration objects with literal values
- Defining route maps or action types
- Array constants used as union source: `const STATUSES = ['active', 'inactive'] as const; type Status = typeof STATUSES[number];`

---

### Advanced

---

**Q11: Explain conditional types and the `infer` keyword.**

**Short answer:** a conditional type is an `if`/`else` for types, and `infer` lets you pull a piece out of a type while you test it. Together they let you compute a type from another type instead of writing it by hand.

The pattern is `T extends U ? X : Y`, read as "if `T` is assignable to `U`, the result is `X`, otherwise `Y`":

```ts
type IsString<T> = T extends string ? 'yes' : 'no';
type A = IsString<string>;    // 'yes'
type B = IsString<number>;    // 'no'
```

`infer R` means "whatever type sits in this position, call it `R`". It works like a capture group in a regular expression: you describe the shape (a function returning something, a `Promise` of something), and if the type matches, the captured part is available in the `true` branch. This is how the built-in `ReturnType` and `Awaited` are written, and why you can get a library function's return type without the library exporting it:

```ts
// Extract return type
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;
type A = ReturnOf<() => string>;           // string

// Extract Promise inner type
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type B = Unwrap<Promise<number>>;          // number

// Extract array element type
type ElementOf<T> = T extends (infer E)[] ? E : never;
type C = ElementOf<string[]>;              // string
```

---

**Q12: What are mapped types? How do you remap keys?**

A mapped type is a loop over the keys of another type: `[P in keyof T]` visits each key, and the right-hand side says what each property becomes. That is how `Partial`, `Readonly` and friends are built. Key remapping adds an `as` clause that renames each key as you go — for example turning `name` into `getName`. If the `as` clause produces `never` for a key, that key is dropped, which is how you filter properties:

```ts
// Basic mapped type
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Optional<T> = { [P in keyof T]?: T[P] };

// Remap keys with `as`
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

// Filter keys
type StringProps<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface User { name: string; age: number; email: string; }
type StringUserProps = StringProps<User>;
// { name: string; email: string }
```

---

**Q13: How do distributive conditional types work?**

When a conditional type tests a **naked** type parameter (the bare `T`, not wrapped in something like `[T]` or `T[]`) and you pass it a union, TypeScript runs the conditional once per union member and unions the results. This is usually what you want — it is how `Exclude` removes members from a union — but it is wrong when you mean to test the union *as a whole*, which is when you wrap it to switch distribution off:

```ts
type ToArray<T> = T extends unknown ? T[] : never;

// Distributes:
type A = ToArray<string | number>;
// = (string extends unknown ? string[] : never) | (number extends unknown ? number[] : never)
// = string[] | number[]

// Prevent distribution by wrapping in tuple:
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;
type B = ToArrayNonDist<string | number>;
// = (string | number)[]
```

---

**Q14: Explain declaration merging.**

Declaration merging means that when TypeScript sees two declarations with the same name in the same scope, it combines them into one instead of reporting a duplicate. The practical reason it exists is **extending types you don't own**: you cannot edit Express's `Request` or the DOM's `Window`, but you can declare the same interface again in your own code and add a field to it, which is what the module augmentation example below does.

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

TypeScript uses structural typing — type compatibility is based on the shape (structure) of the type, not its name or declaration.

```ts
interface Point { x: number; y: number; }
interface Coordinate { x: number; y: number; }

const p: Point = { x: 1, y: 2 };
const c: Coordinate = p;                  // OK! Same shape

// Even works with extra properties in certain contexts
class Pixel {
  constructor(public x: number, public y: number, public color: string) {}
}

function logPoint(point: Point) {
  console.log(point.x, point.y);
}

logPoint(new Pixel(1, 2, 'red'));          // OK! Pixel has x and y
```

This is different from nominal typing (Java, C#) where `Point` and `Coordinate` would be incompatible despite having the same structure.

---

**Q16: How would you implement a type-safe event emitter?**

The whole design rests on **one map type from event name to payload type**. Once `EventMap` exists, `keyof EventMap` is the set of legal event names and `EventMap['click']` is that event's payload, so every method just becomes a lookup: make it generic over a *single* key (`K extends keyof Events`), infer `K` from the `event` argument, and the payload type follows automatically. That is what a `string`-based emitter can never do — it has no way to relate the name to the thing it carries.

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

**The clever part is `emit`'s rest parameter, and it is what an interviewer is actually grading:**

```text
...args: Events[K] extends undefined ? [] : [Events[K]]
```

A rest parameter can be typed as a **tuple**, and a conditional type can pick which one — an empty tuple means "no further arguments", a one-element tuple means "exactly one, of this type". So the **arity itself** depends on the event name. `payload?: Events[K]` would not work: it makes the argument optional for *every* event, including the ones that require it.

That single line is what produces all of this:

```ts
emitter.emit('click', { x: 1, y: 2 });   // ok
emitter.emit('click');                   // Error: Expected 2 arguments, but got 1
emitter.emit('load');                    // ok
emitter.emit('load', { x: 1 });          // Error: Expected 1 arguments, but got 2
```

**Two things worth volunteering.** The typing lives entirely at the `on`/`emit` boundary — internally the handlers are stored as `Set<Function>`, so `fn(...args)` is unchecked, which is an acceptable trade but not a secret. And the obvious follow-up is `off`: removing a listener needs the *same function reference*, so an inline arrow can never be removed — the usual fix is to have `on` return an unsubscribe closure.

**Q17: What are template literal types and how are they useful?**

Template literal types use template literal syntax at the type level:

```ts
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type APIRoute = `/${string}`;
type RequestKey = `${HTTPMethod} ${APIRoute}`;
// 'GET /...' | 'POST /...' | 'PUT /...' | 'DELETE /...'
```

They are useful whenever a string follows a pattern and a typo would otherwise only show up at runtime. When you interpolate a union, you get every combination, so the compiler knows the full set of legal strings and rejects anything else:

- **Event handler names**: `on${Capitalize<EventName>}` gives `'onClick' | 'onFocus'`, and a misspelt handler prop is a compile error.
- **API routes**: `'GET /users'` is allowed; `'GTE /users'` is not.
- **i18n keys** (translation keys such as `'checkout.title'`): a key that doesn't exist fails to compile instead of rendering the raw key on screen.
- **CSS property names**: a misspelt property such as `'backgroud-color'` is rejected instead of silently doing nothing.

Combined with mapped types:
```ts
type Setters<T> = {
  [K in keyof T & string as `set${Capitalize<K>}`]: (value: T[K]) => void;
};
```

---

**Q18: Explain the difference between `type` assertions and type declarations.**

```ts
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

Rule: prefer declarations (annotations) over assertions. Assertions bypass type checking. Of the cases above, only the DOM one is a claim you can usually back up; for data that crosses a boundary (network, storage), a cast is an unchecked promise, so validate it instead (Q27).

---

**Q19: How does TypeScript's type system handle `null` and `undefined`?**

**Short answer:** with `strictNullChecks` on, `null` and `undefined` are their own types, so a value that might be missing must say so in its type (`string | null`) and the compiler makes you handle that case before use. With it off, they are silently allowed everywhere, which is how "cannot read properties of null" errors get past the compiler.

With `strictNullChecks: true` (recommended, and included in `strict`):
- `null` and `undefined` are separate types, not assignable to other types
- You must explicitly handle them

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
const city = user?.address?.city ?? 'Unknown';
```

Without `strictNullChecks`: `null` and `undefined` are assignable to everything (bad, enables many bugs).

---

**Q20: What is the `satisfies` operator?**

`satisfies` (TS 4.9+) validates that a value matches a type without widening it:

```ts
type Colors = Record<string, [number, number, number] | string>;

// With `as` - loses specificity
const colors = {
  red: [255, 0, 0],
  green: '#00ff00',
} as Colors;
colors.red;    // type: [number, number, number] | string (widened)

// With `satisfies` - validates AND preserves literal types
const colorsV2 = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies Colors;
colorsV2.red;    // type: [number, number, number] (specific!)
colorsV2.green;  // type: string

// catches errors too:
const colorsV2V2 = {
  red: [255, 0, 0],
  green: true,             // Error: boolean doesn't satisfy Colors
} satisfies Colors;
```

Use `satisfies` when you want type validation but don't want to lose type inference.

---

**Q21: TypeScript 7.0 rewrote the compiler in Go. What actually changed, and how would you plan the upgrade for a large codebase?**

Nothing about the language changed. The type system, the syntax and `tsconfig.json` are identical — what changed is the *implementation*. The compiler and language service were reimplemented in Go (project *Corsa*), shipping stable on 8 July 2026, and type-checking got roughly 8–12× faster.

The speedup comes from three things the old design could not have. Native compiled code instead of JavaScript on Node; real structs with predictable memory layout instead of garbage-collected objects for every type node; and **shared-memory parallelism**, where goroutines check independent files concurrently against one shared type graph. That last one is the part Node fundamentally could not do, because workers cannot share a heap. The effect shows up most in the editor rather than CI — opening an errored file in the VS Code codebase dropped from about 17.5 seconds to under 1.3.

For the upgrade plan, the sequence matters:

1. **Go to 6.0 first.** TypeScript 6.0 (March 2026) was the last release on the original JavaScript codebase and exists specifically as a bridge — it turns long-standing deprecations into errors. Fix those on 6.0, where the error messages and tooling you know still apply.
2. **Then bump to 7.0.** It is behaviourally compatible with 6.0's checking and CLI, so for most codebases this is a dependency change, not a code change.
3. **Audit anything that consumes the compiler's programmatic API** (tools that call the compiler as a library rather than running `tsc`), because 7.0 ships no such API at all — a new one is expected in 7.1 (see §13.2). Vue, Svelte, Astro and MDX language tooling, custom AST transforms, and some type-aware ESLint setups all drive the compiler as a library and need to stay on 6.0 until they catch up.

Step 3 is the answer interviewers are actually listening for. "We upgraded and it was fine" is the wrong response if half the toolchain talks to the API. The broader framing worth adding: bundling went native years ago (esbuild, SWC, Rolldown), so `tsc --noEmit` and the language server were the last JavaScript-speed steps in a front-end build. TypeScript 7 is what makes the old "use `transpileOnly` and type-check in a separate CI job" workaround unnecessary.

---

**Q22: What is a `const` type parameter, and how is it different from `as const` and `satisfies`?**

All three preserve literal types, but they act at different points and belong to different people.

**`as const`** is written by the **caller**, on a value, and makes that value deeply readonly with literal types. **`satisfies`** is also written on a value by whoever owns it, and validates the value against a type *without* widening it. A **`const` type parameter** (TS 5.0) is written by the **library author**, on a generic parameter, and makes inference behave as though every caller had written `as const`:

```ts
// Old way — every caller must remember `as const`
function pick<T extends readonly string[]>(keys: T): T { return keys; }
pick(['a', 'b']);              // string[]            — literals lost
pick(['a', 'b'] as const);     // readonly ['a','b']  — caller had to opt in

// TS 5.0 — the author opts in once, on the type parameter
function pick2<const T extends readonly string[]>(keys: T): T { return keys; }
pick2(['a', 'b']);             // readonly ['a','b']  — no caller ceremony
```

Two details show depth. First, the constraint has to permit readonly — `extends readonly string[]`, not `extends string[]`, or the inferred readonly tuple won't satisfy it. Second, `const` only affects inference from **literal expressions at the call site**; passing an existing `string[]` variable still yields `string[]`, because there are no literals left to preserve.

The design point is about where the cost lands. `as const` puts the burden on every consumer forever and fails silently when someone forgets. `const T` moves it into the signature once. This is why it appears throughout modern library types — route builders, form schemas, and anything that needs to turn an array of strings into a union of keys.

---

**Q23: Node can now run `.ts` files directly. What does that mean for TypeScript features, and what is `erasableSyntaxOnly` for?**

Node's type stripping is purely **syntactic**: it removes type annotations from each file independently and has no type information and no cross-file view. So it works only if every TypeScript construct in the file can be deleted without changing runtime behaviour. Four common constructs cannot:

```ts
enum Status { Active, Done }              // emits a real bidirectional object
namespace Legacy { export const x = 1; }  // emits an IIFE
class User {
  constructor(private name: string) {}    // parameter property emits this.name = name
}
// import Legacy = require('./legacy');  — import-equals emits a require call
```

Each of these *generates code*, so stripping the types would silently change what the program does — hence Node rejects them rather than guessing.

`erasableSyntaxOnly` (TS 5.8) is the flag that makes the type-checker enforce the same rule, so you find out at compile time in your editor instead of at runtime in production. Turning it on pushes you toward the modern equivalents: a `const` object with `as const` plus a derived union type instead of `enum`, ES modules instead of `namespace`, and explicit field declarations instead of parameter properties.

The payoff is portability. With `erasableSyntaxOnly` on, the same source runs unbuilt under Node, Deno and Bun, and transpiles identically through esbuild, SWC and Rolldown — because none of those tools type-check either. The trade-off to name: you give up `enum`'s reverse mapping and `namespace`'s declaration merging, and parameter properties cost you a few lines of boilerplate per class. In practice `enum` was already discouraged (it is the one TypeScript feature with no JavaScript equivalent, and `as const` unions are more flexible), so most teams lose little.

---

**Q24: What does `verbatimModuleSyntax` do, and what bug class does it prevent?**

Without it, TypeScript **elides** imports it determines are used only in type positions — the import statement disappears from the emitted JavaScript. That was reasonable when `tsc` did all the emitting, because `tsc` has the whole type graph and knows the difference.

It breaks as soon as a single-file transpiler is in the pipeline. esbuild, SWC, Babel and Node's type stripper process one file at a time with no type information, so they cannot tell whether `import { Foo } from './foo'` refers to a type or a value. They have to guess, and the two possible wrong guesses are both bad:

- **Drop an import that had a side effect.** `import './register-polyfills'` re-exported through a barrel file vanishes, and something is mysteriously unregistered in the production bundle only.
- **Keep an import of something that doesn't exist at runtime.** The bundler emits a real `import { UserType }` for a pure interface, and you get `SyntaxError: The requested module does not provide an export named 'UserType'` — again, usually only in the built output.

`verbatimModuleSyntax` (TS 5.0) removes the guessing entirely: what you write is exactly what is emitted, and TypeScript errors if you import a type without saying so.

```ts
import { getUser, type User } from './user';   // inline type modifier — clear
import type { Config } from './config';         // whole import is type-only
```

```ts
// With the flag on, this is an error if `User` is a type:
import { User } from './user';
```

This is one of the higher-signal flags to bring up unprompted, because it demonstrates that you understand a modern build has *two* tools with different amounts of information — `tsc` type-checks with full knowledge, and a native transpiler emits with almost none — and that most confusing "works in dev, breaks in prod" module errors live in that gap. It pairs naturally with `isolatedModules` and `module: "preserve"`.

---

**Q25: A dashboard uses `isLoading`, `error` and `data`, and invalid states keep slipping through. Refactor the type.**

The problem is that three independent fields describe **eight** combinations when the domain has four. Nothing stops `isLoading: true` arriving with an `error`, or both being absent with no `data` — and every consumer has to defend against states that should not exist.

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

Now the illegal states are **unrepresentable** — not guarded against, but impossible to construct. And the payoff is at the use site, where narrowing on the discriminant makes the data available without a null check:

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

**Three things to add that turn a correct answer into a senior one:**

- **Exhaustiveness.** Add a `default: const _never: never = state;` — then adding a `'refreshing'` case makes every unhandled `switch` a compile error rather than a silent fall-through.
- **The discriminant must be a literal type.** `status: string` narrows nothing; it needs to be a union of literals, which is what `as const` or the union declaration gives you.
- **Name the trade-off.** This is more verbose than three booleans, and it is worth it exactly when invalid combinations are causing bugs. For a genuinely independent pair of flags, a union is ceremony.

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

A union of the two shapes is closer, but on its own TypeScript still allows the other key through, because object types are not exact. The fix is to declare the *absent* key as `never` (or optional-never) in each arm:

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

**Why `never` rather than omitting the key:** with excess-property checking, a *literal* passed inline would be caught anyway — but a variable of a wider type assigned to the prop would not, because assignability is structural. Declaring `onClick?: never` makes the constraint part of the type rather than a side effect of literal checking.

**The generalised form** is an `XOR` helper, and it is worth knowing but not worth reaching for first:

```ts
type Without<T, U> = { [K in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (Without<T, U> & U) | (Without<U, T> & T);
```

**Say the caveat.** Two hand-written arms read better than a conditional-type helper the next engineer has to decode; reach for `XOR` when there are several mutually exclusive groups, not for one. And the resulting error messages from deep generic helpers are famously bad, which is a real maintenance cost.

---

**Q27: You read JSON out of `localStorage`. How do you type it?**

`JSON.parse` returns `any`, and `any` is the one type that silently switches off checking for everything downstream. So the first move is to stop it spreading:

```ts
const raw: unknown = JSON.parse(stored);   // NOT any
```

`unknown` is assignable from everything and assignable *to* nothing, so the compiler forces a check before use. Then narrow with a real predicate:

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

**The point worth making out loud:** `as Settings` would also compile, and it is a lie. Persisted JSON is **untrusted input** — it was written by an older version of your app, or edited by the user, or corrupted. A cast asserts a shape you have not checked, and the failure surfaces later as `undefined is not a function` somewhere unrelated.

**Three details that matter in practice:**

- **`JSON.parse` throws** on malformed input, so it needs its own `try`/`catch` — separate from the shape check.
- **The accessor throws too.** `localStorage.getItem` raises in a private window or with site data blocked, which is a crash during render if you read it in a `useState` initialiser.
- **At any real size, use a schema library.** Zod or Valibot give you the predicate and the TypeScript type from one declaration, so they cannot drift — a hand-written guard that forgets a new field compiles perfectly and lies.

**The senior framing:** this is a **boundary**. Parsing, validation and defaulting belong at the edge of the system — storage, network, URL params — so that everything inside can trust its types. `unknown` at the boundary is what makes "the types are true" an invariant rather than a hope.

---

**Q28: Why can't you use `Pick` and `Omit` instead of `Extract` and `Exclude`?**

Because they filter on different axes. **`Pick` and `Omit` select properties by key from an object type; `Extract` and `Exclude` filter members of a union by assignability.** The four are not alternatives to each other — they operate on different kinds of type.

| Aspect | `Pick` / `Omit` | `Extract` / `Exclude` |
|---|---|---|
| Operate on | an **object type** | a **union of any types** |
| Select by | **property key** | **assignability** |
| Constraint | `Pick<T, K>` requires `K extends keyof T` | none — any union, any filter |

Trying to swap them fails immediately, and the error message is the whole explanation:

```ts
type Letters = 'a' | 'b' | 'c';

type Kept = Extract<Letters, 'a' | 'c'>;   // 'a' | 'c'
type Gone = Exclude<Letters, 'a'>;         // 'b' | 'c'

// type Nope = Pick<Letters, 'a'>;
// Error TS2344: Type '"a"' does not satisfy the constraint
//   'number | "toString" | "charAt" | …'
```

`keyof ('a' | 'b' | 'c')` is **not** `'a' | 'b' | 'c'`. A union of string literals has no properties of its own, so `keyof` gives you the `string` *methods* they all share — there is nothing for `Pick` to select, because union members are not keys.

The reverse fails for the mirror reason. `Exclude` tests whole types for assignability, so pointing it at an object does not remove a property:

```ts
type User = { id: number; name: string; email: string };
type Oops = Exclude<User, { id: number }>;   // never — User IS assignable to { id: number }
```

**They are related, though, and this is the part worth saying out loud:** `Omit` is *built from* `Exclude`. The standard-library definition is

```ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

`keyof T` produces a union of keys, `Exclude` does the union filtering on it, and `Pick` turns the surviving keys back into an object type. So `Exclude` is not something `Omit` could replace — `Omit` depends on it. The same shape appears throughout the standard library: the object helpers are built on the union helpers.

**One gotcha falls straight out of that definition.** `Pick` constrains `K` to `keyof T`, but `Omit` constrains it only to `keyof any`, so a typo is caught in one and silently ignored in the other:

```ts
type A = Pick<User, 'nope'>;   // Error: '"nope"' does not satisfy 'keyof User'
type B = Omit<User, 'nope'>;   // No error — B is just User, unchanged
```

Rename a field and forget to update an `Omit`, and nothing tells you. Some codebases define a constrained wrapper for exactly this reason:

```ts
type StrictOmit<T, K extends keyof T> = Omit<T, K>;
```

**Takeaway:** `Pick`/`Omit` work on keys of an object; `Extract`/`Exclude` work on members of a union. `Omit` is `Pick` + `Exclude`, which is why one cannot stand in for the other — and unlike `Pick`, `Omit` does not validate its keys.

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

TypeScript applies a process called **type widening** at the binding site. Because a `let` binding can legally be reassigned to any other `string` later on (`x = "world"` is perfectly valid), the compiler deliberately widens the inferred type from the narrow literal `"hello"` up to the broader `string`. The inferred type has to describe every value the variable could ever hold during its lifetime, not just the one it holds at the moment of declaration.

A `const` binding, by contrast, can never be reassigned. The value it holds today is the only value it will ever hold, so there is no need to widen — TypeScript keeps the literal type `"hello"` exactly. This is why `const` bindings are often preferred when you want the compiler to preserve precise literal types for things like enum-like strings or config keys.

Note that this literal-preservation rule only applies to primitive `const` bindings. Object properties are still widened even when the enclosing object is `const`, because the properties themselves remain mutable:

```ts
const obj = { a: 1 };       // type: { a: number }  — widened
const locked = { a: 1 } as const; // type: { readonly a: 1 }
```

**Takeaway:** `let` widens literal primitives to their base type; `const` preserves them. Use `as const` to lock literal types on object properties.

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

When TypeScript sees a plain array literal, it makes two simplifying assumptions: (1) the array may grow, shrink, or be reordered, so length and position don't matter, and (2) any element could appear at any index, so the element type is the union of all the element types it sees. The result for `arr` is therefore a mutable, variable-length array whose element type is `string | number | boolean`. You lose the knowledge that index 0 is specifically a number, index 1 is specifically a string, and so on.

The `as const` assertion changes both of those assumptions at once. It tells the compiler: "treat this literal as a deeply immutable, fully specific value." Concretely this means: array literals become **readonly tuples** (so `arr[0]` is a `number` with literal value `1`, not just "some element of the union"), object properties become `readonly`, and primitive values keep their literal types instead of being widened. That's why `Tuple` is `readonly [1, "two", true]` — a fixed-length tuple whose positions and literal values are both preserved.

This matters whenever you want to derive other types from a value — for example, `type Vals = typeof tuple[number]` now gives you `1 | "two" | true` instead of the useless `string | number | boolean`.

**Takeaway:** A plain array literal is inferred as a mutable union array; `as const` locks it into a readonly tuple of literals, which is what you want for deriving unions and enum-like constants.

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

Even though `config` is declared with `const`, the `const` keyword in JavaScript only prevents reassigning the binding itself — it does nothing to prevent mutating the object's properties. You can still write `config.mode = "anything"` at any point, and TypeScript has to account for that. Because the property is mutable, the compiler widens the inferred type of `mode` from the literal `"production"` to the broader `string` when it builds the type of `config`.

So `config.mode` has type `string`, and `string` is not assignable to the narrower union `"production" | "development"` — the compiler has no guarantee that the runtime value is still one of those two literals. This is a common footgun when extracting values out of config objects to feed into functions with literal-union parameters.

There are three standard fixes, each with different tradeoffs:

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

**Takeaway:** Object property types are widened because properties are mutable; use `as const` or an explicit literal-union annotation to preserve literal types through a property access.

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

TypeScript's control-flow analysis tracks the type of a variable as execution moves through branches. When you write a `typeof value === "string"` check, the compiler recognizes `typeof` as a **built-in type guard** and narrows `value` to `string` inside the `if` block — because that's the only way the branch could have been entered.

Critically, narrowing is also applied to the **negative** case. When the `if` branch is not taken, the compiler removes `string` from the union, so by the time we reach `else if (typeof value === "number")`, `value` is already `number | boolean`. The `number` check then narrows it further to `number` inside that branch and leaves only `boolean` for the final `else`.

This cumulative narrowing is what makes discriminated unions ergonomic: you don't need an explicit `typeof value === "boolean"` check in the final branch, because by elimination nothing else is possible. `typeof` guards work for the primitive types JavaScript's `typeof` can distinguish: `"string"`, `"number"`, `"bigint"`, `"boolean"`, `"symbol"`, `"undefined"`, `"object"`, and `"function"`. For class instances you need `instanceof`, and for object shapes you need the `in` operator or a discriminant property.

**Takeaway:** TypeScript narrows unions as you eliminate cases with `typeof`; the final `else` receives whatever types are left, so exhaustive branches need no explicit check for the last one.

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

**Answer:** Compile error (with `noImplicitReturns` or when the declared return type is `number`): not all code paths return a value because the `"triangle"` case is missing.

**Explanation:**

`Shape` is a **discriminated union** — each member has a `kind` property with a unique literal value, so TypeScript can narrow `shape` inside each `case` clause based on the discriminant. Inside `case "circle"`, `shape` is narrowed to `{ kind: "circle"; radius: number }`; inside `case "square"`, it's narrowed to the square variant; and so on.

The reason this function fails to compile is that after both `case` clauses, there's still an unhandled execution path: when `shape.kind === "triangle"`, control falls off the end of the switch and the function returns `undefined`. Because the declared return type is `number`, the compiler rejects it.

The more robust pattern is to add a `default` branch that asserts exhaustiveness using the `never` type. `never` is the bottom type — it has no values, and only a value of type `never` is assignable to `never`. If you've handled every case, the compiler narrows `shape` in the default branch to `never` and everything type-checks. But if someone later adds a fourth variant to the `Shape` union, `shape` in the default branch will be narrowed to that new variant — which is **not** assignable to `never` — and the compiler will flag every `switch` that forgot to handle it:

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

**Takeaway:** Use a `default` branch with `const _: never = value` to turn "forgot a case" bugs into compile errors that surface every time the union grows.

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

TypeScript recognizes the JavaScript `in` operator as a built-in type guard for object shapes. When the expression `"swim" in pet` is true, the compiler knows the value must be one of the union members that has a `swim` property — in this case only `Fish` qualifies, so `pet` is narrowed to `Fish` inside the `if` branch. In the `else` branch the compiler subtracts `Fish` from the union, leaving only `Bird`.

The `in` operator is especially useful for narrowing objects that **don't** have a shared discriminant field. Unlike discriminated unions (which rely on a literal tag like `kind: "circle"`), `in` works purely on the structural presence of a property. That makes it the right tool when you're working with third-party types you can't modify, or when the types naturally differ by which methods they expose.

A subtle gotcha: `in` narrowing considers a property present if *any* union member declares it, even as `optional`. So if `Fish` had `swim?: () => void`, the narrowing would still include `Fish` in the `if` branch — the guard proves the key exists, but it doesn't prove the value is non-`undefined`. You'd still need to check `pet.swim !== undefined` before calling it.

**Takeaway:** `"prop" in obj` narrows a union to the members that declare that property; reach for it when members don't share a discriminant tag you can switch on.

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

When you write `<T>` with no constraint, you're telling the compiler "accept any type at all — `number`, `boolean`, `null`, a custom class, anything." Since many of those types have no `.length` property, the compiler cannot guarantee that `value.length` is safe, so it refuses the access. This is the right call: if you allowed it, `getLength(42)` would pass type-checking and then blow up at runtime with `undefined` (or throw, depending on the value).

To make the function compile, you need to give the compiler a promise about what `T` looks like. That promise is called a **generic constraint**, and you write it with `extends`:

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

You could also just type the parameter as `{ length: number }` directly, but the generic form preserves the specific input type for use elsewhere in the signature — for example, returning `T` as a result so callers don't lose the narrow type they passed in. Constraints are the "contract" portion of a generic: the generic parameter lets the caller pick the type, but the constraint lets the function body rely on a minimum shape.

**Takeaway:** If a generic function accesses properties of its type parameter, constrain the parameter with `extends` — unconstrained `T` is effectively `unknown` to the function body.

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

A **mapped type** is TypeScript's way of transforming one object type into another by iterating over its keys. The syntax `[K in keyof T]` is the type-level equivalent of a `for...in` loop: `keyof User` evaluates to the union `"name" | "age" | "email"`, and `K` takes on each member of that union in turn. For each key, the right-hand side `T[K]` (an **indexed access type**) looks up the original property type — so for `K = "name"`, `T[K]` is `string`; for `K = "age"`, it's `number`; and so on.

The `?` token after the bracket is a **modifier**: it adds optionality to every property in the resulting type. Mapped types also support adding `readonly`, and removing modifiers with `-?` or `-readonly`. These modifiers are what give mapped types their power — you can define `Required<T>`, `Readonly<T>`, and `Partial<T>` with just a few characters each:

```ts
type Required<T> = { [K in keyof T]-?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };
```

You can also remap keys with `as` (TS 4.1+), filter keys with conditional types, or transform values by referencing `T[K]` through helpers. That combination is how libraries build type utilities like "all optional except these" or "rename all `on*` handlers to camelCase."

**Takeaway:** Mapped types are compile-time loops over keys; combine `keyof`, indexed access `T[K]`, and the `?`/`readonly`/`-?` modifiers to transform object shapes systematically.

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

A **conditional type** `T extends U ? X : Y` reads like a ternary at the type level: if `T` is assignable to `U`, choose branch `X`; otherwise choose `Y`. For the first three cases this is straightforward — `string` extends `string`, `number` does not, and `"hello"` extends `string` because literal types are subtypes of their base types.

The surprising case is `D`. When the type being checked is a **naked type parameter** (i.e., the parameter appears alone on the left of `extends`, not wrapped in another type), TypeScript applies **distribution** to unions: it splits the union, evaluates the conditional on each member independently, and unions the results back together. So `IsString<string | number>` becomes `IsString<string> | IsString<number>`, which evaluates to `"yes" | "no"`.

This distribution is a feature, not a quirk — it's what makes utility types like `Exclude<T, U>` and `Extract<T, U>` work. It also lets you filter unions cleanly: `type Strings<T> = T extends string ? T : never` on `string | number | boolean` yields `string` (because `never` disappears from unions).

If you want to **disable** distribution and compare the whole union as one unit, wrap both sides in a 1-tuple:

```ts
type IsStringAll<T> = [T] extends [string] ? "yes" : "no";
type E = IsStringAll<string | number>; // "no" — the union as a whole doesn't extend string
```

**Takeaway:** A naked type parameter on the left of `extends` causes the conditional to distribute over unions; wrap it in `[T]` to treat the union atomically.

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

At first glance this looks inconsistent — shouldn't `keyof { [k: string]: number }` just be `string`? The reason for the `number` being included comes from JavaScript's actual runtime behavior: object property keys are always strings (or Symbols) at runtime, and when you write `obj[5]`, JavaScript silently coerces the numeric index `5` into the string `"5"` before the lookup. So `obj[5]` and `obj["5"]` access the exact same slot.

Because a string-indexed type accepts any string key, and because `obj[5]` is effectively a lookup with key `"5"`, TypeScript has to allow numeric indexers too. To reflect this, `keyof` of a string index signature is widened to `string | number` — both forms of indexing are legal and safe.

A number index signature is stricter: it only promises the mapping holds for numeric keys. Arbitrary string keys are not guaranteed to be present, so `keyof` stays at just `number`. This is also why TypeScript lets you declare **both** index signatures on one type, but requires the number index's value type to be a subtype of the string index's value type:

```ts
type Mixed = {
  [key: string]: string | number;
  [key: number]: number; // OK — number is assignable to string | number
};
```

**Takeaway:** `keyof` of `{ [k: string]: V }` is `string | number` because numeric indices are coerced to strings at runtime; this asymmetry is a reflection of JavaScript's own key-coercion semantics.

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

TypeScript has two different rules for checking whether a value is assignable to a type. The default rule is **structural compatibility**: a value is assignable if it has at least the required properties with compatible types. Having extra properties doesn't break structural compatibility — they're just ignored.

On top of that, there is an **excess property check** that applies only when you assign a **fresh object literal** directly to a target with a known type. This is a deliberate ergonomic safety net — it's designed to catch typos like `{ x: 1, y: 2, colour: "red" }` where you meant `color`, because the author almost certainly didn't mean to add a field the target type doesn't know about. The check is a warning against a likely mistake, not a true type-system rule.

The moment you introduce a variable, the "freshness" of the object literal is lost. `obj` has the type `{ x: number; y: number; z: number }`, and the question "is `obj` assignable to `Point`?" is answered by the normal structural rule: it has `x: number` and `y: number`, so yes. The extra `z` is invisible to the type system at the assignment site.

There are three common ways to opt out of the check when you genuinely want extra properties:

```ts
const p1: Point = { x: 1, y: 2, z: 3 } as Point;       // type assertion
const p2: Point = { x: 1, y: 2, z: 3 } as { x: number; y: number; z: number }; // widening
interface Point { x: number; y: number; [key: string]: number } // add an index signature
```

**Takeaway:** Excess property checks fire only on fresh object literals assigned directly to a typed target; assigning through a variable falls back to plain structural compatibility where extras are allowed.

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

Function-type assignability is governed by variance rules that might feel backwards the first time you encounter them. The key intuition: a function type describes a contract about what callers can pass **in** and what they'll get **out**. If you substitute one function for another, the substitute must honor the contract from the caller's perspective.

A caller of `Handler` will pass in a `MouseEvent`. Can `handler1` — which declares its parameter as `Event` — accept that? Yes: every `MouseEvent` is also an `Event` (MouseEvent extends Event), so `handler1` will happily handle whatever MouseEvent the caller passes. This is **contravariance**: parameter types in a subtype function can be *wider* than the supertype's.

The common confusion: what if `MouseEvent` had a `clientX` property that `handler1` tries to access? It can't — `handler1` only knows about `Event`, so it only accesses `Event` members. So passing a `MouseEvent` to a function expecting `Event` is always safe, because the callee doesn't know the extra fields exist.

Going the other direction would be unsafe: a function declared to take a narrower type (`(e: MouseButtonEvent) => ...`) could try to access fields the caller isn't required to provide. Under `strictFunctionTypes`, TypeScript checks parameters contravariantly and rejects that case. Without `strictFunctionTypes`, parameters are checked **bivariantly** — both directions are allowed, which is unsound but convenient. One exception survives even with the flag on: a method written with method syntax (`handle(e: MouseEvent): void` inside an interface, as opposed to the property form `handle: (e: MouseEvent) => void`) is still checked bivariantly, for compatibility with older code. Function parameter lists with **fewer** parameters are always allowed because extras simply aren't used.

**Takeaway:** With `strictFunctionTypes`, a function is assignable if its parameters are the **same or wider** (contravariant) and its return is the **same or narrower** (covariant); fewer parameters are always fine.

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

Both `any` and `unknown` are **top types** in TypeScript — every value is assignable to them. The critical difference is what you can do with them afterwards.

`any` is an **escape hatch**. A value of type `any` is simultaneously treated as "every type and none" — you can access any property, call it as a function, pass it where any other type is expected, and the compiler will stay silent. This is exactly why it's dangerous: a bug in your typing quietly propagates. Line A accesses `foo.bar` on a number, the compiler happily accepts it, and the program crashes at runtime with "Cannot read properties of undefined."

`unknown` is the **type-safe** version of the top type. The compiler accepts any value going in (so `b: unknown = 10` works), but refuses to let you do anything with it until you narrow it. You can't read properties, call it, or assign it to a narrower type — the compiler demands proof of what the value actually is first. That proof can come from any of TypeScript's narrowing mechanisms: `typeof`, `instanceof`, `in`, custom type predicates (`value is Foo`), or explicit casts.

```ts
if (typeof b === "object" && b !== null && "foo" in b) {
  // b is narrowed; property access is safe
}
```

This makes `unknown` the correct choice for values at API boundaries (parsed JSON, `catch` clause errors under `useUnknownInCatchVariables`, external inputs), where you want the compiler to force you to validate before trusting the value.

**Takeaway:** Use `unknown` instead of `any` whenever you're describing "a value I don't know the shape of yet" — it forces you to narrow before use, turning a runtime crash into a compile error.

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

A numeric enum in TypeScript compiles down to a real JavaScript object at runtime. The compiler writes forward entries (name → number) **and** reverse entries (number → name) into the same object. Roughly, the emitted JS looks like:

```js
var Direction;
(function (Direction) {
  Direction[Direction["Up"] = 0] = "Up";
  Direction[Direction["Down"] = 1] = "Down";
  // ...
})(Direction || (Direction = {}));
```

The trick `Direction[Direction["Up"] = 0] = "Up"` does two assignments: first it sets `Direction["Up"] = 0` (forward entry), then uses that returned value as the key for `Direction[0] = "Up"` (reverse entry). That's why `Direction.Up` and `Direction["Up"]` both give you `0`, while `Direction[0]` gives you the string `"Up"`.

This reverse mapping is **not** created for string-valued enums. String enums emit only the forward mapping (`{ Up: "UP" }`). A reverse entry would be keyed by the value, and a string value can collide with a member name — in `enum E { A = "B", B = "A" }` the reverse entries would overwrite the forward ones. So for a string enum, `Direction["Up"]` gives `"UP"`, but `Direction["UP"]` is `undefined`: there is no way back from the value to the name.

Reverse mappings are why numeric enums inflate bundle size more than `as const` objects. If you don't need the reverse lookup and want maximum tree-shakability, `const enum` (inlines values, no object at all) or a plain `as const` object literal are leaner alternatives.

**Takeaway:** Numeric enums get a two-way runtime object so you can look up name → number and number → name; string enums are one-way (forward only).

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

`never` is the **bottom type** in TypeScript's type system — the type with no values at all. Nothing inhabits `never`; no runtime value has type `never`. This single property explains all three behaviors above.

If you think of a type as a set of possible values, a union `A | B` is the set union and an intersection `A & B` is the set intersection. `never` corresponds to the empty set. The union of any set with the empty set is the original set (nothing new was added), so `string | never` collapses to `string`. The intersection of any set with the empty set is the empty set (no value is in both), so `string & never` collapses to `never`. This is why utility types like `Exclude<T, U>` rely on `never` disappearing — they map unwanted union members to `never`, and the result naturally drops them.

The `extends` behavior in `C` flows from the same foundation. Subtype relations require "every value of the subtype is also a value of the supertype." Since `never` has no values, that condition is **vacuously true** for every type — there are no counterexamples. So `never extends X` is true for any `X`, which is why the conditional in `C` picks the `"yes"` branch.

One practical consequence: writing a helper like `type NonNever<T> = T extends never ? never : T` doesn't do what you think, because `never` passed as a naked type parameter distributes over the empty union and the conditional is never evaluated at all. To detect `never`, wrap it: `[T] extends [never]`.

**Takeaway:** `never` is the empty set — identity in unions, absorbing in intersections, and a subtype of every type — which is why it both "disappears" and "infects" depending on the operator.

---

**Q16: What does `ClassName` resolve to, and how do template literal types combine with union types to produce every possible string combination?**

```ts
type Color = "red" | "blue";
type Size = "sm" | "lg";
type ClassName = `${Size}-${Color}`;
```

**Answer:** `ClassName` is `"sm-red" | "sm-blue" | "lg-red" | "lg-blue"` — the full cross product of `Size` and `Color`.

**Explanation:**

Template literal types (TS 4.1+) let you build string-literal types using the same backtick-and-`${}` syntax as JavaScript template strings, but at the type level. When the interpolated slots are single literal types, the result is a single literal string. When the interpolated slots are unions, TypeScript **distributes** the template over every combination of union members and produces the union of all resulting strings. With a 2-member `Size` and a 2-member `Color`, that's 2 × 2 = 4 combinations.

This makes template literal types excellent for constraining strings to a known schema — event names, CSS class families, route paths, Tailwind-like class constructors, etc. You can combine them with helpers like `Uppercase<T>`, `Lowercase<T>`, `Capitalize<T>`, and `Uncapitalize<T>` (which are built-in intrinsic string-manipulation types) to enforce naming conventions:

```ts
type Event = "click" | "focus";
type HandlerName = `on${Capitalize<Event>}`; // "onClick" | "onFocus"
```

They also pair with conditional types and the `infer` keyword to **parse** strings. You can write types that extract parts of a path, split by a delimiter, or validate a format — all at compile time:

```ts
type Split<S extends string, Sep extends string> =
  S extends `${infer H}${Sep}${infer T}` ? [H, ...Split<T, Sep>] : [S];
type Parts = Split<"a.b.c", ".">; // ["a", "b", "c"]
```

Beware of combinatorial explosion: a template with three 4-member unions produces 64 combinations. TypeScript has a per-type size limit (around 100,000 combinations) before it bails out with an error.

**Takeaway:** Template literal types distribute over their union slots to generate the cross product of combinations; they're the compile-time equivalent of programmatic string building, and pair well with `infer` to parse structured strings.

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

TypeScript 5.5 added **inferred type predicates**: when a function's body is recognisably a refinement of its parameter, TypeScript infers the return type as `v is number` rather than `boolean`. `Array.prototype.filter` has an overload that accepts a predicate `(value: T) => value is S` and returns `S[]`, so an inferred predicate makes the narrowing flow through automatically. That is why `x` is `number[]` with no annotation anywhere.

The inference fires **only if all four** of these hold:

1. The function has **no explicit return type** or predicate annotation.
2. It has a **single `return` statement** and no implicit returns.
3. It does **not mutate its parameter**.
4. It returns a boolean expression that is genuinely a refinement of the parameter.

`b` violates the first condition. Writing `: boolean` is not a no-op — it *pins* the return type, so TypeScript stops at `boolean`, `filter` matches its plain `(value: T) => unknown` overload, and the result stays `(number | null)[]`. The irony is that annotating return types is normally the recommended habit, and here it silently costs you type safety.

Conditions 2–4 are the other easy ways to lose it. All three of these fall back to `boolean`:

```ts
const c = (v: number | null) => { if (v === null) return false; return true; };  // two returns
const d = (v: number | null) => { v = v ?? null; return v !== null; };            // reassigns its parameter
const e = (v: number | null) => v !== null && Math.random() > 0.5;                // not a pure refinement
```

Storing the check in a local first does **not** break it: `(v) => { const ok = v !== null; return ok; }` still infers `v is number`, because control-flow analysis follows a `const` that aliases a condition.

Note that an **inline** arrow works fine — `values.filter(v => v !== null)` gives `number[]` — so this is not about named versus anonymous functions. It is about the shape of the function.

**Takeaway:** inferred type predicates (TS 5.5+) are defeated by an explicit `: boolean` return type or by anything other than a single refining `return` expression — when your predicate needs more than one statement, write the `v is T` annotation yourself.

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

In the first signature, `T` appears in **two inference positions**, and TypeScript collects candidates from both before deciding. The first argument contributes the candidate `'dark'`; the second contributes `'light'` and `'dark'`. Faced with multiple candidates, inference **widens to their union**, so `T` becomes `'dark' | 'light'`. Both arguments then check successfully against that union, and the constraint you were trying to express — "the initial value must be one of the allowed values" — is silently satisfied by making `T` big enough to include everything. The check is vacuous.

`NoInfer<T>` (TS 5.4) marks a position as **non-inferring**. `allowed: NoInfer<T>[]` still requires the argument to be assignable to `T[]`, but it no longer *votes* on what `T` is. So `T` is decided solely by `initial` — it is `'dark'` — and then `['light', 'dark']` is checked against `'dark'[]`, which correctly fails on `'light'`.

The crucial distinction to state out loud: `NoInfer` is an **inference-site marker, not a constraint**. It does not narrow, validate or transform anything; it only removes a position from the candidate-collection phase. This is why it is a utility type rather than a keyword, and why it has no runtime or assignability meaning of its own.

Before 5.4 the workarounds were all awkward: a second type parameter with a mutual constraint (`<T, U extends T>`), or the intersection trick `T & {}`, or an explicit type argument at every call site. `NoInfer` says the thing directly.

**Why `extends string` is in both signatures, and what happens without it.** Drop the constraint and there is no puzzle left to demonstrate: an unconstrained `T` inferred from a string argument **widens to `string`**, so `T` is `string` in both functions, `['light', 'dark']` is an unremarkable `string[]`, and **neither call errors** — `NoInfer` looks like it does nothing. Constraining `T` to a primitive is what makes TypeScript keep the literal types, and literals are the only thing `NoInfer` has to protect here. Getting this wrong is an easy way to "disprove" `NoInfer` to yourself.

The generalisable rule: **any type parameter that appears in more than one parameter position will widen to a union of candidates.** If one of those positions is meant to be *validated against* the other rather than to help decide the type, wrap it in `NoInfer`.

**Takeaway:** a type parameter inferred from multiple arguments widens to their union, which quietly makes "must be one of" checks pass — `NoInfer<T>` strips a position's vote so one argument decides the type and the rest are merely checked against it.

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

The rule is not "no enums and no namespaces" — it is **"nothing that generates runtime code."** Work through each case with that lens and the pattern is obvious.

`enum Status` compiles to a real object with both forward and reverse mappings (`Status.Active === 0` *and* `Status[0] === 'Active'`), so deleting the declaration changes behaviour. Error. But `declare enum` is ambient — it asserts that something exists elsewhere and emits nothing at all, so it is fine. Likewise, a `namespace` containing only type declarations emits nothing and is allowed, while one containing a `const` emits an IIFE and is not. Parameter properties are rejected because `constructor(private name: string)` desugars into a real `this.name = name` statement — the type annotation and the field initialisation are fused into one piece of syntax, and you cannot erase half of it.

The flag (TS 5.8) exists because of a change *outside* TypeScript. Node — and Deno, Bun, esbuild, SWC and Rolldown before it — can now run or transpile `.ts` files by **stripping types syntactically**, one file at a time, with no type information whatsoever. That is enormously faster than a real compile, but it is only sound when every TypeScript-specific construct is erasable. `erasableSyntaxOnly` makes the type-checker enforce the same restriction, so you get an editor squiggle instead of a runtime failure.

The migrations it pushes you toward are the ones modern codebases had mostly adopted anyway:

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

What you give up: `enum`'s reverse mapping, `namespace` declaration merging, and a few lines of constructor boilerplate. What you gain: the same source file runs unbuilt under every runtime and transpiles identically through every tool, because none of them need to understand your types.

**Takeaway:** `erasableSyntaxOnly` forbids exactly the TypeScript constructs that emit runtime code — `enum`, runtime `namespace`, parameter properties, `import =` — because single-file type stripping cannot erase them safely; ambient and type-only forms of the same syntax stay legal.

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

**In one line:** `as` is a promise *you* make to the compiler, not a conversion. It changes what TypeScript believes about the value and changes nothing at runtime, so the string `'5'` is still a string.

| Line | Why |
|---|---|
| `51` | at runtime `n` is the string `'5'`, and `'5' + 1` joins strings (JavaScript tricky Q34) |
| `string` | `typeof` looks at the real value, which the assertion never touched |
| `6` | `Number(input)` actually converts, so this is real arithmetic |

After compilation the second line is just `const n = input;`. The type checker was happy, because it believed you, and the bug happens anyway.

A plain `'5' as number` would be rejected, because TypeScript refuses assertions between types that obviously do not overlap. Going through `unknown` (or `any`) removes even that check, which is why `value as unknown as Something` is such a strong code smell.

**Takeaway:** `as` never converts. To turn data into the type you want, convert it (`Number`, `String`, `new Date`) or validate it with a type guard or a schema library such as Zod.

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

**In one line:** `private` is a **compile-time** rule that TypeScript erases; `#secret` is a real JavaScript **private field** that the engine enforces at runtime.

| Line | Why |
|---|---|
| (✗ line) | `w.pin` is rejected by the compiler: that is all `private` does |
| `1234` | `w['pin']` compiles, because TypeScript deliberately allows bracket access to private members as an escape hatch, and at runtime `pin` is an ordinary property |
| `{"pin":1234}` | `JSON.stringify` sees normal properties, so the "private" PIN is serialised. `#secret` is not a property at all, so it never appears |
| `pin` | same for `Object.keys` |
| `hidden` | code inside the class can read `#secret`; nothing outside can, not even with brackets, and a typo in `#secret` would be an error at runtime too |

**Which to use:** `#private` when the value must genuinely be unreachable (tokens, internal state a library's users must not depend on). TypeScript's `private` when you only want the compiler to stop accidental use, or when you need to reach the field from tests or subclasses (`protected`). Remember that anything TypeScript-`private` is visible in the browser's dev tools, in logs and in serialised output.

**Takeaway:** `private` hides a field from the type checker; `#private` hides it from JavaScript.

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

**In one line:** TypeScript compares objects by **shape** (structural typing), not by class name, so anything with a `name` and a `speak()` counts as a `Cat`. A **`private` member** is the exception: it makes a class match only itself.

| Line | Why |
|---|---|
| `false beep` | `pet` compiled as a `Cat` because `Robot` has the same shape, but at runtime it is still a `Robot`: `instanceof Cat` is `false`, and `speak()` says `beep` |
| (✗ line) | `Dollars` and `Euros` have the same public shape, but each declares its own `private currency`. TypeScript treats private members as tied to the class that declared them, so the two are incompatible |

Structural typing is usually what you want: any object literal with the right fields can be passed where an interface is expected, without inheriting from anything. It becomes a problem when two types have the same shape but different *meanings*, like two currencies, or a `UserId` and an `OrderId` that are both strings.

The `private` trick shown here is one way to make a type **nominal** (matched by name). For plain values, the usual technique is a **branded type**: `type UserId = string & { readonly __brand: 'UserId' }`, which cannot be assigned from a plain string or another brand.

**Takeaway:** TypeScript checks shapes, not class names, so `instanceof` and the type system can disagree. Use a private member or a brand when two same-shaped types must not mix.

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

**In one line:** because of structural typing, a value typed `Point` may have **more** properties than `x` and `y`, so TypeScript cannot promise that `Object.keys` returns only `'x'` and `'y'`.

| Line | Why |
|---|---|
| (✗ line) | `key` is a plain `string`, and `Point` has no index signature, so `p[key]` is not allowed |
| `103` | `point3d` has an extra `z: 100`. It is still a valid `Point` (it has `x` and `y`), so it can be passed in, and `Object.keys` returns all three keys at runtime: 1 + 2 + 100 |

This is the most-asked "why is TypeScript being annoying?" question, and the output is the answer: typing `Object.keys` as `(keyof T)[]` would be a lie, and the sum shows exactly what that lie would hide. (An object *literal* passed directly would be rejected for the extra property, tricky Q11, but a variable is not checked that way.)

**What to do instead:**

- Loop over the keys you actually know: `(['x', 'y'] as const).forEach((k) => total += p[k])`.
- If you really want every key and accept the risk, cast deliberately and locally: `(Object.keys(p) as (keyof Point)[])`.
- For dictionary-style data, type it as a dictionary from the start: `Record<string, number>` or a `Map`.

**Takeaway:** `Object.keys` returns `string[]` on purpose, because an object can always carry extra properties. Iterate over known keys, or model the data as a record.

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

**In one line:** by default TypeScript assumes that indexing an array or a record **always finds something**. That is convenient and wrong, and the `noUncheckedIndexedAccess` compiler option fixes it.

| Line | Why |
|---|---|
| `undefined` | the array has two items, so index 2 is empty, but its type is still `string` |
| `undefined` | `?.` protected us here; `third.toUpperCase()` would also compile and would crash at runtime |
| `NaN` | `scores.ravi` has type `number` because of the `Record<string, number>` type, but there is no `ravi`, so it is `undefined + 1` |

With `"noUncheckedIndexedAccess": true` in `tsconfig.json`, both `names[2]` and `scores.ravi` become `string | undefined` / `number | undefined`, and the compiler makes you handle the missing case. It is not part of `strict`, because it adds friction to every index access, but many teams now turn it on, especially for code that handles records keyed by user input or API data.

Loops such as `for (const name of names)` and methods such as `map` are unaffected, because they only visit items that exist.

**Takeaway:** without `noUncheckedIndexedAccess`, `arr[i]` and `record[key]` are typed as if they always exist. Turn it on, or treat index access as possibly `undefined` yourself.

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

**In one line:** a **function type** with a `void` return means "the caller will ignore whatever you return", so a function that returns something is still allowed. A **function declaration** annotated `: void` is different: it must not return a value.

| Line | Why |
|---|---|
| `42` | `cb` has the type `() => void`, but the function assigned to it returns `42`. That is allowed, and at runtime the value is still returned. The type only says nobody *should* use it |
| (✗ line) | `function log(): void` declares that this function itself returns nothing, so `return 42` is an error |
| `1,2,3 undefined` | `forEach` accepted the `push` callback even though `push` returns the new length |

This rule exists so that ordinary code works. `arr.forEach((n) => other.push(n))` is common, and rejecting it because `push` returns a number would force people to write braces everywhere. `forEach` does nothing with the return value, so allowing it is safe.

The catch: `void` is **not** a promise that the value is `undefined`. If you call a `() => void` function yourself and use its result, TypeScript types that result as `void`, which you cannot use as anything, but at runtime it might be `42`.

**Takeaway:** `() => void` as a *type* means "return value ignored", not "returns nothing". Annotate the function itself with `: void` when it must not return a value.

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

**In one line:** in JavaScript `typeof null` is `'object'` (JavaScript tricky Q33), and TypeScript knows it, so a `typeof` check for `'object'` does **not** remove `null` from the type.

| Line | Why |
|---|---|
| (✗ line) | inside the `if`, `value` is still `string[] \| null`, because `null` also passes `typeof … === 'object'` |
| `0 1` | at runtime `size(null)` enters that branch, which is exactly the crash the compiler just prevented; the `?.` and `??` version handles it |

This is TypeScript doing its job well: the check *looks* sufficient, and in plain JavaScript it is a real, common crash (`Cannot read properties of null`).

**The idiomatic fixes:** check for `null` directly (`if (value !== null)`), use `Array.isArray(value)` when you mean an array, or write `if (value)`, which rules out `null` and `undefined` (but also `0` and `''`, so be deliberate with non-objects).

**Takeaway:** `typeof x === 'object'` includes `null`. Narrow with `x !== null` or `Array.isArray`.

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

**In one line:** `keyof` lists the keys you can **safely read**. From "a Book *or* a Product" you can only rely on the keys they share; from "a Book *and* a Product" you have all of them.

| Type | Result | Why |
|---|---|---|
| `keyof (Book \| Product)` | `'id'` | a value of this type might be either one, so only `id` is guaranteed to exist |
| `keyof (Book & Product)` | `'id' \| 'title' \| 'price'` | a value of this type has everything from both |

So the union and the intersection flip when you take their keys: a **union of types** gives an **intersection of keys**, and an **intersection of types** gives a **union of keys**. The ✗ line shows it: `'title'` is not a key you can use on "a Book or a Product".

This is why reading a property on a union fails unless every member has it, and why the fix is to **narrow** first (with `in`, a discriminant field, or a type guard) to one member, whose keys are all available (tricky Q6).

**Takeaway:** `keyof` a union is the keys every member shares; `keyof` an intersection is all the keys.

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

**In one line:** anything can be thrown in JavaScript, not only `Error` objects, so under `strict` TypeScript types the `catch` variable as **`unknown`** and makes you check what it is first.

| Line | Why |
|---|---|
| (✗ line) | `err` is `unknown`, so reading `.message` is not allowed without narrowing |
| `SyntaxError` | after `err instanceof Error`, TypeScript knows it is an `Error`, and this one is the `SyntaxError` from the bad JSON |
| `object` | the real value at runtime |

`throw 'oops'`, `throw 404` and `throw { code: 1 }` are all legal JavaScript, and libraries do all of them. Code that assumes `err.message` then shows "undefined" to the user, or crashes inside its own error handler. The `useUnknownInCatchVariables` option, part of `strict` since TypeScript 4.4, is what types it as `unknown`; without it, `err` is `any` and nothing is checked.

A common helper for the other case: `const message = err instanceof Error ? err.message : String(err);`.

**Takeaway:** treat a caught value as `unknown`. Check `instanceof Error` before reading `message`.

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

**In one line:** callers only see the **overload signatures**, and each one is checked on its own. `string | number` does not fit the `string` overload or the `number` overload, and the wider implementation signature is invisible from outside.

| Line | Why |
|---|---|
| `number string` | `parse('42')` matched the first overload, so `a` is a `number`; `parse(42)` matched the second, so `b` is a `string` |
| (✗ line) | `either` could be a string or a number. Neither overload accepts that union, and TypeScript does not try the implementation signature `(input: string \| number)`, because callers cannot see it |

That hidden implementation signature is the part people miss. The last `function parse(input: string | number)` line is only there for the function body; it is not one of the ways you are allowed to call `parse`.

**The fixes:** add an overload that accepts the union (`function parse(input: string | number): string | number;`), or replace the overloads with a **conditional return type**: `function parse<T extends string | number>(input: T): T extends string ? number : string`. Overloads are clearest when there are two or three genuinely different call shapes; beyond that, a conditional or generic type is usually easier to maintain.

**Takeaway:** only the overload signatures are callable, each checked separately. A union argument needs an overload that accepts the union.

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

**In one line:** `?` means the property **may be missing**; `| undefined` means the property **must be there**, but its value may be `undefined`.

| Line | Why |
|---|---|
| (✗ line) | `WithUndefined` requires the key to be present, and `{}` does not have it |
| `false true` | at runtime the difference is real: `'nickname' in a` is `false` (the key does not exist), while `c` has the key, set to `undefined` |

The difference matters wherever code checks for the *presence* of a key: `in`, `Object.keys`, `hasOwnProperty`, spreading one object over another (`{ ...defaults, ...overrides }` copies an explicit `undefined` and wipes out the default), and APIs where "missing" means "leave unchanged" but `undefined` or `null` means "clear it".

By default, an optional property also accepts an explicit `undefined`. The `exactOptionalPropertyTypes` option makes `nickname?: string` mean only "missing or a string", so writing `{ nickname: undefined }` becomes an error, which catches exactly the spreading bug above.

**Takeaway:** use `?` when a key can be left out, and `| undefined` when it must always be present. `exactOptionalPropertyTypes` stops the two blurring together.

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

**In one line:** a closure might run later, so TypeScript keeps a narrowing inside it only if the variable **cannot be reassigned after the closure is created**. In the second function it is reassigned on the next line.

| Line | Why |
|---|---|
| `GUEST` | in `greeter`, the last assignment to `name` is before the arrow function is created, so whenever the arrow runs, `name` is still a `string` |
| (✗ line) | in `laterReassigned`, `name = input` comes *after* the arrow is created. The arrow might run after that line, when `name` could be `undefined` again, so TypeScript drops the narrowing |

This was improved in **TypeScript 5.4**: before that, TypeScript forgot narrowings inside closures for any `let` variable or parameter, and the first function needed a `const` copy (`const safe = name;`) to compile. Now it looks at where the last assignment is.

The general rule behind it: narrowing is a fact about the value **at a point in the code**, and a callback runs at an unknown later point. The easy way to keep a narrowing is to capture the narrowed value in a `const`.

**Takeaway:** a narrowing survives into a callback only if nothing reassigns the variable afterwards. When in doubt, copy it into a `const`.

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

---

## References

- [TypeScript Documentation](https://www.typescriptlang.org/docs) — Official docs and handbook
- [TypeScript Playground](https://www.typescriptlang.org/play) — Try TypeScript in the browser
- [TypeScript GitHub](https://github.com/microsoft/TypeScript) — Source code and issue tracker
- [Type Challenges](https://github.com/type-challenges/type-challenges) — Practice advanced TypeScript types
