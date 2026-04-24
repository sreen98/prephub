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
- [15. Interview Questions & Answers](#15-interview-questions--answers)
- [16. Tricky Output Questions](#16-tricky-output-questions)

---

## 1. What is TypeScript?

TypeScript is a **statically typed superset of JavaScript** that compiles to plain JavaScript. It adds optional type annotations, interfaces, generics, and other type-system features that catch errors at compile time rather than runtime.

Key benefits:
- **Type safety** — catch bugs before running code
- **Better IDE support** — autocompletion, refactoring, go-to-definition
- **Self-documenting** — types serve as documentation
- **Gradual adoption** — any valid JS is valid TS
- **Compiles to any JS version** — target ES5, ES6, ESNext, etc.

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

// =================== OUTPUT (JavaScript) ===================
// Notice: ALL type annotations are gone. Interfaces are completely erased.

function greet(user) {
  return `Hello ${user.name}, age ${user.age}`;
}

const alice = { name: "Alice", age: 30 };
console.log(greet(alice));

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

---

## 4. Functions

### 4.1 Type Annotations

TypeScript lets you annotate function parameters and return values to ensure callers pass the correct types and the function returns what is expected. It also supports optional parameters, default values, and rest parameters with full type safety.

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
function greet(name: string, greeting: string = 'Hello'): string {
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
function identity<T>(value: T): T {
  return value;
}

identity<string>('hello');              // type: string
identity(42);                           // type: 42 (inferred)
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

// Union type (preferred in modern TS)
type Status = 'active' | 'inactive';

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

Template literal types use backtick syntax at the type level to construct string types from other string literal types. Combined with unions, they can generate large sets of allowed string patterns, which is powerful for typing event names, routes, and CSS properties.

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

## 14. Best Practices

### 14.1 Do's

These are recommended TypeScript patterns that improve type safety, readability, and maintainability. Following them helps you get the most out of the type system while keeping your code clean.

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

These are common TypeScript anti-patterns that weaken type safety or add unnecessary complexity. Avoiding them will help you write more robust code and let TypeScript's inference do the heavy lifting.

```ts
// 1. Don't use `any` as escape hatch
// BAD
function parse(input: any): any { ... }
// GOOD
function parse(input: unknown): Result { ... }

// 2. Don't use enums (prefer union types)
// BAD
enum Status { Active = 'active', Inactive = 'inactive' }
// GOOD
type Status = 'active' | 'inactive';

// 3. Don't use `!` (non-null assertion) unless truly necessary
// BAD
const el = document.getElementById('app')!;
// GOOD
const el = document.getElementById('app');
if (!el) throw new Error('Missing #app');

// 4. Don't over-type (let TypeScript infer)
// BAD
const name: string = 'Alice';
const numbers: number[] = [1, 2, 3];
// GOOD
const name = 'Alice';
const numbers = [1, 2, 3];

// 5. Don't use `object` or `Function` types
// BAD
function process(obj: object, fn: Function) { ... }
// GOOD
function process(obj: Record<string, unknown>, fn: () => void) { ... }
```

---

## 15. Interview Questions & Answers

### Beginner

---

**Q1: What is TypeScript and how does it differ from JavaScript?**

TypeScript is a statically typed superset of JavaScript. It adds optional type annotations, interfaces, generics, and compile-time type checking. All valid JavaScript is valid TypeScript.

Key differences:
- **Type checking**: TS catches type errors at compile time; JS catches them at runtime
- **Type annotations**: TS has explicit types; JS is dynamically typed
- **Compilation**: TS compiles to JS; JS runs directly
- **IDE support**: TS provides much better autocompletion and refactoring
- **Features**: TS adds interfaces, generics, enums, access modifiers, etc.

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

Use `unknown` instead — it's type-safe and requires narrowing before use.

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

Both accept any value, but:
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

Utility types are built-in generic types that transform other types:

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

Type narrowing is the process of refining a broad type to a more specific one within a code block.

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
const config = { port: 3000, host: 'localhost' } as const;
// type: { readonly port: 3000; readonly host: 'localhost' }
```

Use cases:
- Configuration objects with literal values
- Defining route maps or action types
- Array constants used as union source: `const STATUSES = ['active', 'inactive'] as const; type Status = typeof STATUSES[number];`

---

### Advanced

---

**Q11: Explain conditional types and the `infer` keyword.**

Conditional types follow the pattern `T extends U ? X : Y`:

```ts
type IsString<T> = T extends string ? 'yes' : 'no';
type A = IsString<string>;    // 'yes'
type B = IsString<number>;    // 'no'
```

`infer` declares a type variable inside a conditional type, letting you extract types:

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

Mapped types create new types by iterating over keys:

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

When a conditional type acts on a **naked** (unboxed) type parameter that is a union, it distributes over each member:

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

Declaration merging combines multiple declarations with the same name:

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

---

**Q17: What are template literal types and how are they useful?**

Template literal types use template literal syntax at the type level:

```ts
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type APIRoute = `/${string}`;
type RequestKey = `${HTTPMethod} ${APIRoute}`;
// 'GET /...' | 'POST /...' | 'PUT /...' | 'DELETE /...'
```

Practical uses:
- Type-safe CSS property names
- Event handler naming conventions
- API route typing
- i18n key typing

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
const user = { name: 'Alice' } as User;
// No error even though email is missing (dangerous!)

// When assertions are valid:
// 1. DOM elements
const input = document.querySelector('#email') as HTMLInputElement;

// 2. API responses you know the shape of
const data = await response.json() as ApiResponse;

// 3. When narrowing doesn't work and you know better
const x = someValue as string;

// Double assertion (escape hatch - almost never use)
const x = someValue as unknown as TargetType;
```

Rule: prefer declarations (annotations) over assertions. Assertions bypass type checking.

---

**Q19: How does TypeScript's type system handle `null` and `undefined`?**

With `strictNullChecks: true` (recommended):
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
const colors = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies Colors;
colors.red;    // type: [number, number, number] (specific!)
colors.green;  // type: string

// catches errors too:
const colors = {
  red: [255, 0, 0],
  green: true,             // Error: boolean doesn't satisfy Colors
} satisfies Colors;
```

Use `satisfies` when you want type validation but don't want to lose type inference.

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
start(config.mode);
```

**Answer:** Compile error — `Argument of type 'string' is not assignable to parameter of type '"production" | "development"'`.

**Explanation:**

Even though `config` is declared with `const`, the `const` keyword in JavaScript only prevents reassigning the binding itself — it does nothing to prevent mutating the object's properties. You can still write `config.mode = "anything"` at any point, and TypeScript has to account for that. Because the property is mutable, the compiler widens the inferred type of `mode` from the literal `"production"` to the broader `string` when it builds the type of `config`.

So `config.mode` has type `string`, and `string` is not assignable to the narrower union `"production" | "development"` — the compiler has no guarantee that the runtime value is still one of those two literals. This is a common footgun when extracting values out of config objects to feed into functions with literal-union parameters.

There are three standard fixes, each with different tradeoffs:

```ts
// 1. Lock the whole object as const (deeply readonly, all literals preserved)
const config = { mode: "production", port: 3000 } as const;

// 2. Annotate just the property with the narrow type
const config: { mode: "production" | "development"; port: number } = { ... };

// 3. Assert at the call site (blunt; only use when you know better than the compiler)
start(config.mode as "production");
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

function area(shape: Shape): number {
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
  return value.length;
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
getLength(42);           // error — number has no .length
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

const point1: Point = { x: 1, y: 2, z: 3 };

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

Going the other direction would be unsafe: a function declared to take a narrower type (`(e: MouseButtonEvent) => ...`) could try to access fields the caller isn't required to provide. Under `strictFunctionTypes`, TypeScript checks parameters contravariantly and rejects that case. Without `strictFunctionTypes` (the default for method syntax is still bivariant for legacy reasons), parameters are checked **bivariantly** — both directions are allowed, which is unsound but convenient. Function parameter lists with **fewer** parameters are always allowed because extras simply aren't used.

**Takeaway:** With `strictFunctionTypes`, a function is assignable if its parameters are the **same or wider** (contravariant) and its return is the **same or narrower** (covariant); fewer parameters are always fine.

---

### Tricky Edges

---

**Q13: Which of lines A, B, C, and D compile, and what is the fundamental difference in how `any` and `unknown` interact with the type checker?**

```ts
let a: any = 10;
let b: unknown = 10;

a.foo.bar;        // A
b.foo.bar;        // B

let s1: string = a;  // C
let s2: string = b;  // D
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
"Up"
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

This reverse mapping is **not** created for string-valued enums. String enums emit only the forward mapping (`{ Up: "UP" }`), because the compiler can't safely reverse an enum where multiple members could share the same value. So for string enums, `SomeEnum["UP"]` works but `SomeEnum["UP_VALUE"]` won't give you back the name.

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
```

---

## References

- [TypeScript Documentation](https://www.typescriptlang.org/docs) — Official docs and handbook
- [TypeScript Playground](https://www.typescriptlang.org/play) — Try TypeScript in the browser
- [TypeScript GitHub](https://github.com/microsoft/TypeScript) — Source code and issue tracker
- [Type Challenges](https://github.com/type-challenges/type-challenges) — Practice advanced TypeScript types
