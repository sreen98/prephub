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

**Q1: What type does TypeScript infer?**

```ts
let x = "hello";
const y = "hello";

type X = typeof x;
type Y = typeof y;
```

**Answer:**
- `X` is `string`
- `Y` is `"hello"` (string literal type)

`let` variables are widened because they can be reassigned. `const` variables retain their literal type since they can never change.

---

**Q2: Array inference — mutable vs readonly**

```ts
const arr = [1, "two", true];
type Arr = typeof arr;

const tuple = [1, "two", true] as const;
type Tuple = typeof tuple;
```

**Answer:**
- `Arr` is `(string | number | boolean)[]`
- `Tuple` is `readonly [1, "two", true]`

Without `as const`, TypeScript widens to a union array. With `as const`, it infers a readonly tuple with literal types.

---

**Q3: Object property widening**

```ts
const config = {
  mode: "production",
  port: 3000,
};

function start(mode: "production" | "development") {}
start(config.mode);
```

**Answer:** Compile error: `Argument of type 'string' is not assignable to parameter of type '"production" | "development"'`

`config.mode` is inferred as `string` (not the literal `"production"`) because object properties are mutable. Fix with `as const` on the object or the property.

---

### Type Narrowing

---

**Q4: Narrowing with `typeof` — what's the type inside each branch?**

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

TypeScript narrows the type at each branch. The `else` block contains whatever remains after the previous checks.

---

**Q5: Discriminated union — exhaustive check**

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

**Answer:** Compile error (with `noImplicitReturns`): not all code paths return a value.

Without the `"triangle"` case, TypeScript knows the function might fall through. Adding `default: const _exhaustive: never = shape;` would also catch this at compile time — `shape` would be `{ kind: "triangle"; ... }` which isn't assignable to `never`.

---

**Q6: The `in` operator narrows**

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
- Inside `if`: `Fish`
- Inside `else`: `Bird`

The `in` operator acts as a type guard. TypeScript narrows based on which properties exist.

---

### Generics & Utility Types

---

**Q7: Generic constraint — does this compile?**

```ts
function getLength<T>(value: T): number {
  return value.length;
}
```

**Answer:** Compile error: `Property 'length' does not exist on type 'T'`

`T` is unconstrained — it could be anything. Fix: `<T extends { length: number }>` or `<T extends string | any[]>`.

---

**Q8: Mapped type — what's the result?**

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

**Answer:** `OptionalUser` is `{ name?: string; age?: number; email?: string; }`

This is exactly what the built-in `Partial<T>` does. Mapped types iterate over each key and apply transformations.

---

**Q9: Conditional type — what does this resolve to?**

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
- `C` is `"yes"` (`"hello"` extends `string`)
- `D` is `"yes" | "no"` (distributive!)

When a union is passed to a conditional type, it **distributes** — each member is evaluated separately and the results are unioned. `IsString<string | number>` becomes `IsString<string> | IsString<number>` = `"yes" | "no"`.

---

**Q10: `keyof` with index signatures**

```ts
type Dict = { [key: string]: number };
type DictKeys = keyof Dict;

type NumDict = { [key: number]: string };
type NumDictKeys = keyof NumDict;
```

**Answer:**
- `DictKeys` is `string | number`
- `NumDictKeys` is `number`

Surprising: `keyof` of a string index signature returns `string | number` because JavaScript coerces numeric keys to strings, so both are valid.

---

### Structural Typing & Compatibility

---

**Q11: Extra properties — does this compile?**

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
- `point1`: Compile error — excess property check catches `z`
- `point2`: Compiles fine!

TypeScript only applies excess property checks on **object literals** assigned directly. When assigned from a variable, structural compatibility is used — `obj` has all required `Point` fields, so extra properties are allowed.

---

**Q12: Function parameter bivariance**

```ts
type Handler = (event: MouseEvent) => void;

const handler1: Handler = (e: Event) => {};
const handler2: Handler = (e: MouseEvent) => {};
const handler3: Handler = () => {};
```

**Answer:**
- `handler1`: Compile error (with `strictFunctionTypes`) — `Event` is wider than `MouseEvent`
- `handler2`: Compiles fine
- `handler3`: Compiles fine — fewer parameters are always allowed

Function parameters are **contravariant** in strict mode. A handler expecting `MouseEvent` can't accept a handler that only knows about `Event` (it might miss mouse-specific properties). But a handler that ignores parameters entirely is safe.

---

### Tricky Edges

---

**Q13: `any` vs `unknown` — what compiles?**

```ts
let a: any = 10;
let b: unknown = 10;

a.foo.bar;        // A
b.foo.bar;        // B

let s1: string = a;  // C
let s2: string = b;  // D
```

**Answer:**
- A: Compiles (and crashes at runtime) — `any` disables all checks
- B: Compile error — can't access properties on `unknown`
- C: Compiles — `any` is assignable to everything
- D: Compile error — `unknown` requires narrowing first

`unknown` is the type-safe counterpart of `any`. Both accept any value, but `unknown` forces you to check before using.

---

**Q14: Enum values at runtime**

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

Numeric enums create a **reverse mapping**: `Direction[0]` returns the name `"Up"`. `Direction.Up` returns the numeric value `0`. This reverse mapping does NOT exist for string enums.

---

**Q15: `never` in unions and intersections**

```ts
type A = string | never;
type B = string & never;

type C = never extends string ? "yes" : "no";
```

**Answer:**
- `A` is `string` — `never` disappears from unions (it's the empty set)
- `B` is `never` — `never` absorbs intersections (intersecting with empty = empty)
- `C` is `"never"` — wait, actually `"yes"`. `never` extends everything because it's the bottom type (a subtype of all types)

---

**Q16: Template literal types**

```ts
type Color = "red" | "blue";
type Size = "sm" | "lg";
type ClassName = `${Size}-${Color}`;
```

**Answer:** `ClassName` is `"sm-red" | "sm-blue" | "lg-red" | "lg-blue"`

TypeScript distributes template literal types over unions, producing all combinations.

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
