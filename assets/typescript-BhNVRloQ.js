const n=`# TypeScript Cheat Sheet

## Basic Types
\`\`\`ts
let s: string; let n: number; let b: boolean;
let ids: number[];            let tuple: [string, number];
let any_: any;                // opts OUT of checking — avoid
let unknown_: unknown;        // safe any: must narrow before use
let never_: never;            // never returns / impossible
let maybe: string | null;     // union
let x = 'a' as const;         // literal type 'a', not string
\`\`\`

## Objects, Interfaces & Type Aliases
\`\`\`ts
interface User { id: number; name?: string; readonly email: string; }
interface Admin extends User { role: 'admin'; }   // interfaces MERGE if redeclared

type Point = { x: number; y: number };
type Handler = (e: Event) => void;
type Keys = keyof User;                    // 'id' | 'name' | 'email'
type Name = User['name'];                  // indexed access
\`\`\`
Use \`interface\` for object shapes you may extend; \`type\` for unions, functions, mapped/conditional types.

## Narrowing
\`\`\`ts
if (typeof v === 'string')  { }      // typeof guard
if (v instanceof Date)      { }      // instanceof
if ('id' in obj)            { }      // in operator
if (v !== null)             { }      // truthiness / equality
// custom type predicate
function isUser(v: unknown): v is User { return !!v && typeof v === 'object' && 'id' in v; }
// discriminated union — the workhorse
type Result = { ok: true; data: string } | { ok: false; error: Error };
if (res.ok) res.data; else res.error;
\`\`\`

## Generics
\`\`\`ts
function first<T>(xs: T[]): T | undefined { return xs[0]; }
function pick<T, K extends keyof T>(o: T, k: K): T[K] { return o[k]; }
class Box<T> { constructor(public value: T) {} }
const f = <const T extends readonly string[]>(x: T) => x;   // const type param
\`\`\`

## Utility Types
\`\`\`ts
Partial<T>        // all optional
Required<T>       // all required
Readonly<T>       // all readonly
Pick<T, K>        // keep listed keys
Omit<T, K>        // drop listed keys
Record<K, V>      // { [k in K]: V }
Exclude<U, X>     // remove members from a union
Extract<U, X>     // keep matching members
NonNullable<T>    // drop null | undefined
ReturnType<F>     // function's return type
Parameters<F>     // tuple of parameter types
Awaited<T>        // unwrap Promise
NoInfer<T>        // block inference at this site
\`\`\`

## Mapped & Conditional Types
\`\`\`ts
type Optional<T> = { [K in keyof T]?: T[K] };
type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type IsArray<T> = T extends unknown[] ? true : false;
\`\`\`

## \`satisfies\` vs \`:\` vs \`as\`
\`\`\`ts
const a: Record<string, string> = { x: 'y' };  // widens — a.x is string, keys lost
const b = { x: 'y' } as Record<string, string>;// cast: no checking, unsafe
const c = { x: 'y' } satisfies Record<string, string>; // checks AND keeps { x: 'y' }
\`\`\`

## Functions
\`\`\`ts
function f(a: number, b = 0, ...rest: string[]): void {}
function g(cb: (v: string) => void): void {}
// overloads
function h(x: string): string;
function h(x: number): number;
function h(x: any): any { return x; }
\`\`\`

## Classes
\`\`\`ts
class A {
  private secret = 1;        #real = 2;      // #real is truly private at runtime
  protected shared = 3;      readonly id: number;
  constructor(public name: string) { this.id = 1; }
  static make() { return new A('x'); }
  get upper() { return this.name.toUpperCase(); }
}
abstract class B { abstract run(): void; }
\`\`\`

## Modules
\`\`\`ts
import type { User } from './types';       // erased at compile time
export type { User };
import { type A, b } from './m';           // inline type modifier
declare global { interface Window { gtag: (...a: any[]) => void } }
declare module '*.svg' { const c: string; export default c; }
\`\`\`

## tsconfig flags that matter
\`\`\`jsonc
{
  "strict": true,                    // turn this on first
  "noUncheckedIndexedAccess": true,  // arr[0] is T | undefined
  "erasableSyntaxOnly": true,        // only syntax Node can strip
  "verbatimModuleSyntax": true,      // predictable import emit
  "isolatedDeclarations": true,      // enables fast parallel .d.ts
  "noImplicitOverride": true,
  "exactOptionalPropertyTypes": true
}
\`\`\`

## Gotchas
- Types are **erased at runtime** — no type-based branching without a guard.
- \`any\` disables checking; \`unknown\` forces narrowing. Prefer \`unknown\`.
- \`as\` never checks — it silences the compiler, it does not validate.
- Excess-property checks apply to object **literals** only, not to variables.
- \`interface\` declarations merge; \`type\` aliases collide.
- \`enum\` emits runtime code; prefer a union of literals or \`as const\`.
- \`Function\`, \`Object\` and \`{}\` are near-useless types — be specific.
- Arrays are covariant here, so unsound assignments compile.
`;export{n as default};
