const e=`# Design Patterns — Complete Guide

Design patterns are **named, reusable solutions to recurring design problems**. They're not algorithms or libraries — they're vocabulary. Once a team knows "we'll use a Strategy here," nobody has to draw the diagram or argue about the structure; the name carries the design.

This guide covers the canonical Gang of Four (GoF) catalog from *Design Patterns: Elements of Reusable Object-Oriented Software* (1994), adapted to JavaScript and React. The original patterns assume class-heavy OO; idiomatic JS often expresses the same patterns with closures, modules, or higher-order functions instead. We cover both forms.

The 23 GoF patterns split into three families: **Creational** (how objects come into existence), **Structural** (how objects compose), and **Behavioral** (how objects communicate). Beyond GoF, modern frontend has its own canon — Container/Presentational, HOC, Render Props, Hooks, Compound Components — which we cover at the end.

## Table of Contents

- [1. Why Design Patterns Matter](#1-why-design-patterns-matter)
- [2. SOLID — The Principles the Patterns Serve](#2-solid-the-principles-the-patterns-serve)
  - [2.1 S — Single Responsibility](#21-s-single-responsibility)
  - [2.2 O — Open/Closed](#22-o-openclosed)
  - [2.3 L — Liskov Substitution](#23-l-liskov-substitution)
  - [2.4 I — Interface Segregation](#24-i-interface-segregation)
  - [2.5 D — Dependency Inversion](#25-d-dependency-inversion)
  - [2.6 When SOLID Becomes the Problem](#26-when-solid-becomes-the-problem)
- [3. Creational Patterns](#3-creational-patterns)
  - [3.1 Factory Method](#31-factory-method)
  - [3.2 Abstract Factory](#32-abstract-factory)
  - [3.3 Builder](#33-builder)
  - [3.4 Prototype](#34-prototype)
  - [3.5 Singleton](#35-singleton)
- [4. Structural Patterns](#4-structural-patterns)
  - [4.1 Adapter](#41-adapter)
  - [4.2 Bridge](#42-bridge)
  - [4.3 Composite](#43-composite)
  - [4.4 Decorator](#44-decorator)
  - [4.5 Facade](#45-facade)
  - [4.6 Flyweight](#46-flyweight)
  - [4.7 Proxy](#47-proxy)
- [5. Behavioral Patterns](#5-behavioral-patterns)
  - [5.1 Chain of Responsibility](#51-chain-of-responsibility)
  - [5.2 Command](#52-command)
  - [5.3 Iterator](#53-iterator)
  - [5.4 Mediator](#54-mediator)
  - [5.5 Memento](#55-memento)
  - [5.6 Observer](#56-observer)
  - [5.7 State](#57-state)
  - [5.8 Strategy](#58-strategy)
  - [5.9 Template Method](#59-template-method)
  - [5.10 Visitor](#510-visitor)
- [6. React-Specific Patterns](#6-react-specific-patterns)
- [7. Anti-Patterns](#7-anti-patterns)
- [8. Comparisons — Which Pattern When?](#8-comparisons-which-pattern-when)
- [9. Interview Questions & Answers](#9-interview-questions-answers)
- [10. Tricky Questions](#10-tricky-questions)
- [References](#references)

---

## 1. Why Design Patterns Matter

Three concrete reasons, beyond the obvious "they're reusable solutions":

1. **Vocabulary compresses communication.** "Wrap this in an Adapter" is ten words shorter than "create an intermediate class that exposes the interface our code expects and translates it to the third-party library's interface." Every senior engineer reading "Adapter" loads the full design from memory.

2. **Patterns guide trade-offs you'd otherwise have to discover the hard way.** The GoF catalog is the codified outcome of thousands of programmers making the same mistakes. "Singleton makes testing hard" isn't an opinion; it's a documented consequence the catalog discusses upfront.

3. **They're a vocabulary for *not* using them.** "We considered a Strategy here but the cases will never grow past two — chose a switch" is a more rigorous design conversation than "we just wrote a switch." The patterns set the bar; deciding *not* to apply one is its own kind of insight.

The frequent failure mode is the opposite: applying patterns mechanically, before there's a problem they solve. **Speculative Generality** (a code smell — see the Refactoring guide) is what you get when someone reads the GoF book and decides every class needs a Factory. The right framing is *"the pattern is a solution to a problem; first identify the problem."*

---

## 2. SOLID — The Principles the Patterns Serve

The GoF catalog can look like twenty-three unrelated recipes. It isn't. Almost every pattern in this guide exists to resolve one specific tension, and SOLID is the set of names for those tensions. Learn the principles and the patterns stop being a list to memorise — you derive them.

The five were collected by Robert Martin in the late 1990s from principles already circulating (Barbara Liskov's substitution rule dates to a 1987 keynote; Bertrand Meyer coined open/closed in 1988). The acronym came later, and the ordering is a mnemonic, not a ranking.

| Principle | The tension it names | Patterns it leads you to |
|---|---|---|
| **S**ingle Responsibility | One class, many reasons to change | Facade, Mediator |
| **O**pen/Closed | Adding a case means editing existing code | Strategy, Factory Method, Decorator, Chain of Responsibility |
| **L**iskov Substitution | A subclass that can't stand in for its parent | Composition — Strategy, Decorator, Composite |
| **I**nterface Segregation | Implementations forced to stub methods they don't want | Adapter, role interfaces |
| **D**ependency Inversion | Business logic wired directly to I/O | Abstract Factory, Strategy, Observer |

The **Low-Level Design guide** works each principle through a full design (parking lot, rate limiter, elevator, vending machine) and is the place to go for that. What follows is the shorter question this guide cares about: *which pattern does each principle point at, and how do you spot the violation?*

---

### 2.1 S — Single Responsibility

**"A class should have one reason to change."** The common misreading is "a class should do one thing", which is unfalsifiable — you can always describe any class as doing one sufficiently vague thing. The useful test is about *change*: how many different people, for how many different reasons, can demand an edit to this file?

An \`Invoice\` class that calculates tax, renders HTML and writes to the database has three: the finance team, the design team, and whoever owns persistence. A tax-rate change and a redesign land in the same file and conflict in the same pull request.

**The smell:** a class name containing "And", or — more reliably — an import list spanning unrelated domains. If the top of the file pulls in both \`stripe\` and \`react-dom\`, something is wrong.

\`\`\`js
// One reason to change each. The Facade below restores the convenient call site.
class InvoiceCalculator { total(invoice) { /* tax rules */ } }
class InvoiceRenderer   { toHtml(invoice) { /* markup */ } }
class InvoiceRepository { save(invoice) { /* persistence */ } }
\`\`\`

**Where it leads:** splitting is the easy half; the hard half is that callers now need three objects instead of one. That is exactly what **Facade** is for — one entry point over a decomposed subsystem — and what **Mediator** does when the pieces need to talk to each other without knowing about each other.

---

### 2.2 O — Open/Closed

**"Open for extension, closed for modification."** Adding a new case should mean *adding* code, not editing code that already works and already has tests.

This is the principle interviewers actually probe, because the violation is so easy to demonstrate: the \`switch\` on a type field that you have to edit every single time a type is added.

\`\`\`js
// ✗ Every new shipping method edits this function — and every function like it.
function shippingCost(order) {
  if (order.method === 'standard') return 5;
  if (order.method === 'express')  return 15;
  if (order.method === 'overnight') return 30;   // and next quarter: 'freight'? 'pickup'?
}

// ✓ A new method is a new entry. Nothing existing is touched.
const shipping = {
  standard:  (order) => 5,
  express:   (order) => 15,
  overnight: (order) => 30,
};
function shippingCostOpen(order) {
  const rate = shipping[order.method];
  if (!rate) throw new Error(\`Unknown shipping method: \${order.method}\`);
  return rate(order);
}
\`\`\`

**The smell:** the same \`if\`/\`switch\` on a type field, repeated across several functions. One conditional is fine. The same conditional in four places is the signal — every new type means four edits, and missing one is a bug that only shows up for that type.

**Where it leads:** **Strategy** (swap the algorithm), **Factory Method** (swap what gets constructed), **Decorator** (add behaviour without touching the original), **Chain of Responsibility** (add a handler to the chain). In JavaScript a plain object map, as above, is often the whole pattern — you rarely need a class hierarchy to get the benefit.

**The honest caveat:** you cannot be open to *every* axis of change. Guessing wrong produces indirection that buys nothing. Wait until a second case arrives, then generalise along the axis that actually varied.

---

### 2.3 L — Liskov Substitution

**"A subtype must be usable anywhere its supertype is, without the caller noticing."** Not "is-a" in the taxonomic sense — substitutable in *behaviour*.

The canonical counter-example is the one that sounds most obviously fine. A square is a rectangle, mathematically. But \`Rectangle\` has independent \`setWidth\` and \`setHeight\`, and \`Square\` cannot honour both — setting one must change the other. Any caller that does \`setWidth(5); setHeight(4)\` and expects an area of 20 gets 16.

\`\`\`js
class Rectangle {
  setWidth(w)  { this.w = w; }
  setHeight(h) { this.h = h; }
  area() { return this.w * this.h; }
}
class Square extends Rectangle {
  setWidth(w)  { this.w = this.h = w; }   // breaks the caller's expectation
  setHeight(h) { this.w = this.h = h; }
}
\`\`\`

Nothing here throws. The types check. The caller is simply wrong about what it is holding — which is why this is a *design* bug rather than a type-system one.

**The three tells**, in rough order of how often they show up:

1. **\`instanceof\` checks in the caller.** If code has to ask which subclass it has before it can act, substitutability has already failed.
2. **A subclass that throws on an inherited method.** \`ReadOnlyList extends List\` with \`add()\` throwing means \`List\` was the wrong abstraction — that is Interface Segregation leaking in.
3. **A subclass that strengthens a precondition or weakens a postcondition.** The parent accepts any integer, the child rejects negatives. Every existing caller is now conditionally broken.

**Where it leads:** away from inheritance. Model the varying behaviour as an object you compose in — **Strategy**, **Decorator**, **Composite** — rather than a subclass you inherit from. Inheritance is justified only when the "is-a" is stable *and* every parent method makes sense unchanged on the child.

---

### 2.4 I — Interface Segregation

**"No client should be forced to depend on methods it does not use."** Several small role-based interfaces beat one large capability-based one.

**The smell is unmissable once you know it:** implementations littered with \`throw new Error('not supported')\` or methods whose body is a bare \`return null\`. Each one is an interface promising something this implementation cannot deliver.

\`\`\`ts
// ✗ Every storage backend must implement all of it, whether or not it can.
interface Storage {
  read(key: string): string;
  write(key: string, value: string): void;
  watch(key: string, cb: () => void): void;   // localStorage can't; S3 can't
}

// ✓ Roles, composed only where they apply.
interface Readable { read(key: string): string }
interface Writable { write(key: string, value: string): void }
interface Watchable { watch(key: string, cb: () => void): void }
\`\`\`

A consumer that only reads now depends on \`Readable\` alone. It cannot accidentally call \`watch\`, and it can be handed a test double with one method instead of three.

**Where it leads:** **Adapter**, when you must consume a fat third-party interface but want to expose only the slice your code needs. In TypeScript this also plays directly into structural typing — a function taking \`{ read(k: string): string }\` accepts anything with that shape, no \`implements\` required.

---

### 2.5 D — Dependency Inversion

**"Depend on abstractions, not concretions"** — and, the half that gets dropped, *high-level policy must not import low-level detail; both should depend on an abstraction owned by the policy.*

**The smell:** a \`new\` of an I/O class inside business logic. \`new StripeClient()\` or \`new PostgresPool()\` in the middle of a pricing function means that function can never be tested without a network.

\`\`\`js
// ✗ The policy reaches out and grabs its own dependencies.
class OrderService {
  async place(order) {
    const stripe = new StripeClient(process.env.STRIPE_KEY);
    await stripe.charge(order.total);
  }
}

// ✓ The dependency is handed in. The test passes a fake; nothing else changes.
class OrderServiceInverted {
  constructor(payments) { this.payments = payments; }
  async place(order) { await this.payments.charge(order.total); }
}
\`\`\`

**Where it leads:** **Abstract Factory** when a whole family of related objects must swap together, **Strategy** when it is one behaviour, **Observer** when the dependency is "tell me when something happens". Dependency-injection containers are just automation for the constructor argument above.

Of the five, this is the one that pays back fastest, and the payback is measurable: **the test suite stops needing a database.** If mentioning SOLID in an interview, this is the principle to have a concrete story about.

---

### 2.6 When SOLID Becomes the Problem

Every principle here trades directness for flexibility, and flexibility you never use is just indirection.

A \`UserService\` shattered into six single-method classes with an interface each is *worse* than the version you started with: more files, more indirection, and a reader who must open five of them to follow one request. The principles were written as a response to observed pain in large, long-lived object-oriented codebases — they are a description of how such code decays, not a checklist to apply to a module on day one.

Two corrections worth carrying into an interview:

- **They are heuristics, not rules.** "This violates SRP" is not an argument on its own. "This file changes for both billing rules and page layout, so those teams keep colliding in it" is.
- **They assume an OO context.** In JavaScript, a module of pure functions satisfies most of SOLID trivially, and closures often replace Strategy and Dependency Inversion outright. Reaching for a class hierarchy to demonstrate a principle is the mistake, not the demonstration.

The honest summary: apply Open/Closed and Dependency Inversion early, because they are cheap and pay off immediately. Let the other three be diagnostic — reasons you can *name* a problem you have already felt.

---

## 3. Creational Patterns

These patterns deal with **how objects are constructed**. They abstract the instantiation process so callers don't have to know which concrete class is being created or how.

### 3.1 Factory Method

**Intent:** Define an interface for creating an object, but let subclasses (or a function) decide which class to instantiate.

**Use when:** You have multiple variants of a thing and the choice depends on runtime data; you want to centralize the creation logic so callers don't construct concrete classes directly.

\`\`\`ts
// Class form
abstract class Notification {
  abstract send(msg: string): void;
}
class Email extends Notification { send(msg: string) { /* SMTP */ } }
class SMS extends Notification { send(msg: string) { /* Twilio */ } }

function createNotification(type: 'email' | 'sms'): Notification {
  switch (type) {
    case 'email': return new Email();
    case 'sms': return new SMS();
  }
}

// Idiomatic JS form — no classes, just functions
const notifiers = {
  email: (msg: string) => sendEmail(msg),
  sms:   (msg: string) => sendSMS(msg),
};
function notify(type: keyof typeof notifiers, msg: string) {
  return notifiers[type](msg);
}
\`\`\`

**Real-world examples:** \`document.createElement(tag)\` is a Factory Method in the DOM. \`Array.from\`, \`Promise.resolve\` are Factory Methods on built-ins. React's \`React.createElement\` (and JSX) is a factory for elements.

### 3.2 Abstract Factory

**Intent:** Provide an interface for creating *families* of related objects without specifying their concrete classes.

**Use when:** You need to create groups of objects that work together — multiple Factory Methods bundled into a coherent interface.

\`\`\`ts
interface UIFactory {
  button(): Button;
  textfield(): TextField;
  modal(): Modal;
}

class MaterialFactory implements UIFactory {
  button() { return new MaterialButton(); }
  textfield() { return new MaterialTextField(); }
  modal() { return new MaterialModal(); }
}

class IOSFactory implements UIFactory {
  button() { return new IOSButton(); }
  textfield() { return new IOSTextField(); }
  modal() { return new IOSModal(); }
}

const factory: UIFactory = isIOS ? new IOSFactory() : new MaterialFactory();
const ok = factory.button();   // gets the right family automatically
\`\`\`

**Real-world examples:** Cross-platform UI toolkits (React Native components that switch styling per platform). Database driver libraries that produce a connection, a transaction, and a query builder for each backend (Postgres / MySQL / SQLite).

### 3.3 Builder

**Intent:** Construct complex objects step-by-step. Particularly useful when an object has many optional configuration parameters.

**Use when:** A constructor would have a long parameter list, especially with many optional values; you want a fluent API for object creation.

\`\`\`ts
class QueryBuilder {
  private parts: string[] = [];
  select(cols: string[]) { this.parts.push(\`SELECT \${cols.join(',')}\`); return this; }
  from(table: string)    { this.parts.push(\`FROM \${table}\`);            return this; }
  where(cond: string)    { this.parts.push(\`WHERE \${cond}\`);            return this; }
  limit(n: number)       { this.parts.push(\`LIMIT \${n}\`);               return this; }
  build()                { return this.parts.join(' '); }
}

const sql = new QueryBuilder()
  .select(['id', 'name'])
  .from('users')
  .where('active = true')
  .limit(10)
  .build();
\`\`\`

**Real-world examples:** Knex/Prisma query builders, axios request config, jQuery's chained API. In React, Apollo's \`gql\` query construction. Any "fluent API" is usually a Builder.

### 3.4 Prototype

**Intent:** Create new objects by cloning existing ones, rather than instantiating from a class.

**Use when:** Object construction is expensive (e.g., needs DB queries, file I/O), but you have a template instance that's already configured. Also useful when classes are unavailable at compile time.

\`\`\`js
// JavaScript has prototypes built into the language
const userTemplate = { role: 'guest', preferences: { theme: 'light' }, permissions: [] };

const newUser = structuredClone(userTemplate);   // deep clone
newUser.role = 'admin';

// Object.create — actual prototypal inheritance
const adminProto = { canAccess(resource) { return true } };
const admin = Object.create(adminProto);
admin.name = 'Ana';
\`\`\`

**Real-world examples:** \`Array.prototype.slice()\` clones the receiver. Redux Toolkit's Immer-based reducers are essentially Prototype operations on state.

### 3.5 Singleton

**Intent:** Ensure a class has only one instance and provide a global access point to it.

**Use when:** Genuinely truly globally unique resources — a logger, a database connection pool, a feature-flag store. Be very suspicious of this pattern; most things you think need to be singletons don't.

\`\`\`ts
class Logger {
  private static instance: Logger;
  static getInstance() {
    if (!this.instance) this.instance = new Logger();
    return this.instance;
  }
  log(msg: string) { console.log(\`[\${Date.now()}]\`, msg); }
}

// Idiomatic JS — modules ARE singletons
// logger.ts
export const logger = { log: (msg: string) => console.log(msg) };
// any module that imports it gets the same instance, automatically.
\`\`\`

**Why so controversial.** Singletons are global state in disguise. They make code hard to test (can't swap with a fake), hard to reason about (callers don't see the dependency), and hard to scale (the "one instance per process" assumption breaks under multi-tenancy). The community consensus is *use dependency injection instead* — pass the logger in as a parameter so callers see the dependency and tests can substitute.

**Real-world examples:** A poorly-justified Singleton: most "service locator" classes. A justified one: \`console\`, \`Math\`, \`JSON\` — language-level globals where there's only ever one. In React, \`React\` itself is effectively a singleton; the \`Context\` mechanism lets you simulate per-tree singletons without making them truly global.

---

## 4. Structural Patterns

These patterns are about **how objects compose into larger structures**.

### 4.1 Adapter

**Intent:** Convert the interface of a class into another interface clients expect. Lets classes work together that couldn't otherwise because of incompatible interfaces.

**Use when:** You're integrating a third-party library whose API doesn't match your code's expectations, or when you swap one implementation for another and don't want to touch every call site.

\`\`\`ts
// Third-party API
class StripeAPI {
  charge(amountInCents: number, cardToken: string) { /* ... */ }
}

// Your domain wants this
interface PaymentProcessor {
  pay(amount: Money, method: PaymentMethod): Receipt;
}

// Adapter
class StripeAdapter implements PaymentProcessor {
  constructor(private stripe: StripeAPI) {}
  pay(amount: Money, method: PaymentMethod): Receipt {
    const cents = amount.toCents();
    const token = method.toStripeToken();
    return this.stripe.charge(cents, token);
  }
}

// Usage — code only knows about PaymentProcessor
const processor: PaymentProcessor = new StripeAdapter(new StripeAPI());
\`\`\`

**Real-world examples:** Any "wrapper around fetch" library (axios, ky). Database ORMs adapt SQL to ActiveRecord-style APIs. React hooks like \`useQuery\` adapt async data fetching to React's render model.

### 4.2 Bridge

**Intent:** Decouple an abstraction from its implementation so they can vary independently. Splits a class hierarchy into two: one for the abstraction, one for the implementation.

**Use when:** You have two orthogonal axes of variation — e.g., shapes (Circle, Square) crossed with rendering backends (Canvas, SVG, WebGL). Without Bridge, you'd need 6 classes; with Bridge, 3 + 3.

\`\`\`ts
// Implementation hierarchy
interface Renderer {
  drawCircle(r: number): void;
  drawSquare(s: number): void;
}
class CanvasRenderer implements Renderer { /* ... */ }
class SVGRenderer    implements Renderer { /* ... */ }

// Abstraction hierarchy
abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): void;
}
class Circle extends Shape { constructor(r: Renderer, private rad: number) { super(r); } draw() { this.renderer.drawCircle(this.rad); } }
class Square extends Shape { /* ... */ }

new Circle(new CanvasRenderer(), 10).draw();
new Square(new SVGRenderer(),  20).draw();
\`\`\`

**Real-world examples:** React's renderers — the same React component model runs against \`react-dom\`, \`react-native\`, \`react-three-fiber\`. The "abstraction" is the component tree; the "implementation" is the host platform.

### 4.3 Composite

**Intent:** Treat individual objects and compositions of objects uniformly. Both implement the same interface, so client code doesn't care whether it's holding a leaf or a tree.

**Use when:** You're modeling tree structures (filesystems, UI hierarchies, ASTs) and want recursive operations to work transparently.

\`\`\`ts
interface FileSystemNode {
  name: string;
  size(): number;
}

class File implements FileSystemNode {
  constructor(public name: string, private bytes: number) {}
  size() { return this.bytes; }
}

class Folder implements FileSystemNode {
  constructor(public name: string, private children: FileSystemNode[] = []) {}
  size() { return this.children.reduce((sum, c) => sum + c.size(), 0); }
  add(child: FileSystemNode) { this.children.push(child); }
}

// File and Folder share the same interface — recursion is free
const root = new Folder('/', [
  new File('readme.md', 1200),
  new Folder('src', [new File('app.tsx', 5000)]),
]);
console.log(root.size());   // 6200, recursively summed
\`\`\`

**Real-world examples:** React itself is a Composite — every component renders either DOM nodes (leaves) or other components (composites), and they're all \`ReactNode\`s. The DOM is a Composite. Menu systems, file browsers, org charts.

### 4.4 Decorator

**Intent:** Attach additional responsibilities to an object dynamically, without modifying the underlying class. A flexible alternative to subclassing.

**Use when:** You want to add cross-cutting features (logging, caching, retries, auth) to existing objects without touching their code or creating a combinatorial explosion of subclasses.

\`\`\`ts
interface DataSource {
  read(): string;
  write(data: string): void;
}

class FileDataSource implements DataSource {
  read()  { /* read from disk */ return ''; }
  write(d: string) { /* write to disk */ }
}

// Decorator: same interface, wraps another instance
class EncryptedDataSource implements DataSource {
  constructor(private wrapped: DataSource) {}
  read()  { return decrypt(this.wrapped.read()); }
  write(d: string) { this.wrapped.write(encrypt(d)); }
}

class CompressedDataSource implements DataSource {
  constructor(private wrapped: DataSource) {}
  read()  { return decompress(this.wrapped.read()); }
  write(d: string) { this.wrapped.write(compress(d)); }
}

// Compose freely — file → compress → encrypt
const src = new EncryptedDataSource(new CompressedDataSource(new FileDataSource()));
\`\`\`

**Real-world examples:** TypeScript decorators (\`@Component\`, \`@Inject\`). Express/Koa middleware (each adds behavior to the request). React's HOCs (\`withAuth(Component)\` is a decorator). Python's \`@functools.lru_cache\`.

### 4.5 Facade

**Intent:** Provide a simplified, unified interface to a complex subsystem.

**Use when:** A library or subsystem has many low-level entry points, but most callers only need a small subset. The Facade hides the complexity behind a single high-level API.

\`\`\`ts
// Complex subsystem
class VideoFile { /* ... */ }
class AudioCodec { /* ... */ }
class VideoCodec { /* ... */ }
class BitrateReader { /* ... */ }
class AudioMixer { /* ... */ }

// Facade
class VideoConverter {
  convert(file: string, format: string): VideoFile {
    const video = new VideoFile();
    const audio = new AudioCodec();
    const codec = new VideoCodec();
    const reader = new BitrateReader();
    // ... orchestrate the messy details ...
    return new VideoFile();
  }
}

// Caller only knows the simple API
const out = new VideoConverter().convert('input.mp4', 'avi');
\`\`\`

**Real-world examples:** \`fetch\` is a Facade over \`XMLHttpRequest\` (and the lower-level network stack). \`console.log\` hides terminal/devtools complexity. jQuery was famously a Facade over the inconsistent DOM APIs of its era.

### 4.6 Flyweight

**Intent:** Use sharing to support large numbers of fine-grained objects efficiently. Separate the *intrinsic* state (shareable) from the *extrinsic* state (per-instance).

**Use when:** You're rendering thousands or millions of objects with mostly-shared data (forest of trees with the same texture, characters in a text editor with the same font glyph, particles in a game).

\`\`\`ts
// Intrinsic — shared
class TreeType {
  constructor(readonly name: string, readonly color: string, readonly texture: Buffer) {}
  draw(canvas: any, x: number, y: number) { /* ... */ }
}

// Flyweight factory
const treeTypes = new Map<string, TreeType>();
function getTreeType(name: string, color: string, texture: Buffer): TreeType {
  const key = \`\${name}:\${color}\`;
  if (!treeTypes.has(key)) treeTypes.set(key, new TreeType(name, color, texture));
  return treeTypes.get(key)!;
}

// Extrinsic — per-instance
class Tree {
  constructor(readonly x: number, readonly y: number, readonly type: TreeType) {}
  draw(canvas: any) { this.type.draw(canvas, this.x, this.y); }
}

// 100,000 trees, only ~10 TreeType instances
const forest = Array.from({ length: 100000 }, () => 
  new Tree(rand(), rand(), getTreeType('oak', 'green', oakTexture))
);
\`\`\`

**Real-world examples:** Browser's text rendering (one glyph object per font/size, used for every occurrence). Game engines (sprite sheets are flyweights). React's element pool — JSX expressions create lightweight \`ReactElement\` objects, not heavy DOM nodes.

### 4.7 Proxy

**Intent:** Provide a placeholder or surrogate for another object to control access to it. Same interface as the wrapped object, but with extra logic.

**Use when:** Lazy initialization, access control, logging, caching, or remote object representation.

\`\`\`js
// JavaScript has Proxy as a built-in
const target = { name: 'Ana', age: 30 };
const guarded = new Proxy(target, {
  get(obj, prop) {
    if (prop.startsWith('_')) throw new Error('private field');
    return obj[prop];
  },
  set(obj, prop, value) {
    if (prop === 'age' && typeof value !== 'number') throw new TypeError('age must be number');
    obj[prop] = value;
    return true;
  },
});

guarded.name = 'Bob';     // works
guarded._secret;          // throws — access control via proxy
\`\`\`

**Real-world examples:** Vue 3's reactivity (built on \`Proxy\`). Mobx's observables. ORM lazy-loading (the proxy fetches the row only when a field is accessed). HTTP service clients in service-mesh setups.

**Proxy vs Decorator vs Adapter:** All three wrap an object. The intent differs — Proxy *controls access* to the same interface, Decorator *adds behavior* to the same interface, Adapter *changes the interface*.

---

## 5. Behavioral Patterns

These patterns are about **how objects communicate and distribute responsibility**.

### 5.1 Chain of Responsibility

**Intent:** Pass a request along a chain of handlers; each handler decides to process or pass on.

**Use when:** Request handling has multiple stages and each stage may or may not apply (authentication → authorization → logging → caching → handler).

\`\`\`ts
abstract class Handler {
  protected next?: Handler;
  setNext(h: Handler) { this.next = h; return h; }
  handle(req: Request): Response | null {
    if (this.next) return this.next.handle(req);
    return null;
  }
}

class AuthHandler extends Handler {
  handle(req: Request) {
    if (!req.user) return { status: 401 };
    return super.handle(req);
  }
}
class CacheHandler extends Handler {
  handle(req: Request) {
    const cached = cache.get(req.url);
    if (cached) return cached;
    return super.handle(req);
  }
}

const chain = new AuthHandler();
chain.setNext(new CacheHandler()).setNext(new ApiHandler());
chain.handle(request);
\`\`\`

**Real-world examples:** Express middleware (\`app.use\` chain). DOM event bubbling itself is a Chain of Responsibility. Logging libraries with handler chains. Redux middleware (each can short-circuit or pass on).

### 5.2 Command

**Intent:** Encapsulate a request as an object, letting you parameterize callers with different requests, queue/log requests, and support undo.

**Use when:** You need undo/redo, command queueing, macro recording, or remote-procedure-call style decoupling between sender and receiver.

\`\`\`ts
interface Command {
  execute(): void;
  undo(): void;
}

class AddTextCommand implements Command {
  constructor(private editor: Editor, private text: string) {}
  execute() { this.editor.append(this.text); }
  undo()    { this.editor.removeLast(this.text.length); }
}

class History {
  private stack: Command[] = [];
  do(cmd: Command) { cmd.execute(); this.stack.push(cmd); }
  undo()           { this.stack.pop()?.undo(); }
}
\`\`\`

**Real-world examples:** Undo/redo in editors. Redux actions are Commands (each is an object describing a state change). Job queues (Sidekiq, BullMQ — each job is a Command). Keyboard shortcuts mapped to operations.

### 5.3 Iterator

**Intent:** Provide a way to access elements of a collection sequentially without exposing its underlying representation.

**Use when:** You need to traverse different data structures uniformly, support multiple traversal strategies, or hide the internals of a collection.

\`\`\`ts
// JavaScript has it built-in via the iterable protocol
class Range {
  constructor(public start: number, public end: number) {}
  *[Symbol.iterator]() {
    for (let i = this.start; i < this.end; i++) yield i;
  }
}

for (const n of new Range(1, 5)) console.log(n);   // 1, 2, 3, 4
const arr = [...new Range(1, 5)];                  // [1, 2, 3, 4]
\`\`\`

**Real-world examples:** Every \`for...of\`, \`[...spread]\`, and \`Array.from\` consumes an Iterator. \`Map\`, \`Set\`, generators are all iterables. Database cursors. React's Children API (\`React.Children.map\`) is an iterator over children.

### 5.4 Mediator

**Intent:** Define an object that encapsulates how a set of objects interact. Promotes loose coupling by keeping objects from referring to each other explicitly.

**Use when:** You have many objects with many-to-many relationships and the coupling is hard to manage. The Mediator becomes the hub through which they all communicate.

\`\`\`ts
class ChatRoom {
  private users = new Set<User>();
  add(user: User) { this.users.add(user); user.room = this; }
  send(from: User, msg: string) {
    for (const u of this.users) if (u !== from) u.receive(msg);
  }
}

class User {
  room?: ChatRoom;
  send(msg: string) { this.room?.send(this, msg); }
  receive(msg: string) { /* show */ }
}
\`\`\`

**Real-world examples:** Redux store is a Mediator (components dispatch through it; the store distributes). React Context is a lightweight Mediator. Air-traffic-control systems are the classic example. Event buses are degenerate Mediators (no logic, just routing).

### 5.5 Memento

**Intent:** Capture and externalize an object's internal state without violating encapsulation, so the object can be restored to that state later.

**Use when:** You need undo/snapshots/checkpoints. Often paired with Command.

\`\`\`ts
class Editor {
  private content = '';
  type(text: string) { this.content += text; }
  save(): EditorMemento { return new EditorMemento(this.content); }
  restore(m: EditorMemento) { this.content = m.state; }
}

class EditorMemento {
  constructor(readonly state: string) {}
}
\`\`\`

**Real-world examples:** Game save states. Database transactions (snapshot before, restore on rollback). React DevTools' time-travel debugging. Browser's \`history.state\` is a Memento for navigation.

### 5.6 Observer

**Intent:** Define a one-to-many dependency between objects so that when one object changes state, all dependents are notified automatically.

**Use when:** You have an object whose state others care about, and you don't want the object to know about its observers concretely.

\`\`\`ts
class EventEmitter<T = unknown> {
  private listeners = new Set<(data: T) => void>();
  subscribe(fn: (data: T) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);  // unsubscribe
  }
  emit(data: T) { this.listeners.forEach(fn => fn(data)); }
}

const stockPrice = new EventEmitter<number>();
const unsub = stockPrice.subscribe(price => updateChart(price));
stockPrice.emit(99.50);
unsub();
\`\`\`

**Real-world examples:** DOM \`addEventListener\`. RxJS Observables. React's \`useEffect\` is consumer-side observer of dependency-array changes. Redux subscribers. Vue/Mobx reactivity. WebSocket onmessage. Pub/sub messaging systems.

### 5.7 State

**Intent:** Allow an object to alter its behavior when its internal state changes. The object appears to change its class.

**Use when:** A class has many conditionals on a state field and the conditionals are spread across many methods.

\`\`\`ts
interface OrderState {
  pay(order: Order): void;
  ship(order: Order): void;
  cancel(order: Order): void;
}

class Pending implements OrderState {
  pay(o: Order)    { o.state = new Paid(); }
  ship(o: Order)   { throw new Error('cannot ship unpaid order'); }
  cancel(o: Order) { o.state = new Cancelled(); }
}
class Paid implements OrderState {
  pay(o: Order)    { throw new Error('already paid'); }
  ship(o: Order)   { o.state = new Shipped(); }
  cancel(o: Order) { o.state = new Refunded(); }
}
class Shipped implements OrderState  { /* etc */ }
class Cancelled implements OrderState{ /* etc */ }
class Refunded implements OrderState { /* etc */ }

class Order {
  state: OrderState = new Pending();
  pay()    { this.state.pay(this); }
  ship()   { this.state.ship(this); }
  cancel() { this.state.cancel(this); }
}
\`\`\`

**Real-world examples:** Workflow engines, order/payment state machines, game character states (idle/walking/running/attacking). XState library is State + Strategy made into a framework. React's reducers are a flat State pattern.

**State vs Strategy.** Mechanically identical (delegate to a swappable object). Different *intent*: Strategy chooses the algorithm at construction; State changes the behavior over time as conditions evolve.

### 5.8 Strategy

**Intent:** Define a family of interchangeable algorithms; encapsulate each one and make them substitutable.

**Use when:** A class has multiple variants of a behavior (sorting strategies, pricing rules, validation logic) and you want to switch between them without touching the consumer.

\`\`\`ts
interface PricingStrategy {
  price(items: Item[]): number;
}
class StandardPricing implements PricingStrategy { price(i) { /* ... */ return 0; } }
class BlackFridayPricing implements PricingStrategy { price(i) { /* 30% off */ return 0; } }
class MemberPricing implements PricingStrategy { price(i) { /* member discount */ return 0; } }

class Cart {
  constructor(private pricing: PricingStrategy) {}
  total(items: Item[]) { return this.pricing.price(items); }
}

new Cart(new BlackFridayPricing()).total(items);

// JS-idiomatic — strategies are just functions
const pricers = {
  standard: (items) => items.reduce((s, i) => s + i.price, 0),
  blackFriday: (items) => items.reduce((s, i) => s + i.price * 0.7, 0),
};
function total(items, strategy = 'standard') { return pricers[strategy](items); }
\`\`\`

**Real-world examples:** \`Array.prototype.sort(compareFn)\` — \`compareFn\` is a strategy. Validation libraries (Yup/Zod use schemas as strategies). Authentication strategies in Passport.js. Test runners selecting between Jest/Vitest/Mocha config strategies.

### 5.9 Template Method

**Intent:** Define the skeleton of an algorithm in a base class, deferring some steps to subclasses. Subclasses redefine certain steps without changing the algorithm's structure.

**Use when:** Multiple variants share a high-level process but differ in specific steps. Template Method is the "inheritance" answer to what Strategy does with composition.

\`\`\`ts
abstract class ReportGenerator {
  generate() {
    const data = this.fetchData();
    const filtered = this.filterData(data);
    const formatted = this.formatData(filtered);
    return formatted;
  }
  abstract fetchData(): unknown;
  abstract formatData(data: unknown): string;
  protected filterData(data: unknown) { return data; }   // default impl
}

class PDFReport extends ReportGenerator {
  fetchData()  { /* ... */ return []; }
  formatData(d) { return /* PDF bytes */ ''; }
}
\`\`\`

**Real-world examples:** React class lifecycle methods (\`componentDidMount\`, \`render\`) override steps in React's Template Method. Express \`Router.use\` middleware overrides. Django/Rails framework methods.

### 5.10 Visitor

**Intent:** Represent an operation to be performed on elements of an object structure. Lets you define a new operation without changing the classes of the elements.

**Use when:** You have a stable hierarchy (AST nodes, file types) and you keep adding new operations on it. Visitor moves the operations out of the elements and into separate classes.

\`\`\`ts
interface Visitor {
  visitFile(f: File): void;
  visitFolder(f: Folder): void;
}

class File {
  accept(v: Visitor) { v.visitFile(this); }
}
class Folder {
  children: (File | Folder)[] = [];
  accept(v: Visitor) {
    v.visitFolder(this);
    this.children.forEach(c => c.accept(v));
  }
}

// New operations without touching File/Folder
class TotalSizeVisitor implements Visitor {
  total = 0;
  visitFile(f) { this.total += /* ... */ 0; }
  visitFolder(f) { /* fold-through */ }
}

class FindByNameVisitor implements Visitor { /* ... */ }
\`\`\`

**Real-world examples:** AST traversal — Babel and ESLint plugins are Visitors over the JS AST. SQL query planners visit tree nodes. The Composite + Visitor combination is one of the most common pattern pairings.

---

## 6. React-Specific Patterns

React has its own canon that doesn't map cleanly to GoF.

### Higher-Order Component (HOC)

**Intent:** A function that takes a component and returns a new enhanced component. Same idea as the Decorator pattern.

\`\`\`jsx
function withAuth(Component) {
  return function AuthGated(props) {
    const user = useUser();
    if (!user) return <LoginPrompt />;
    return <Component {...props} user={user} />;
  };
}
const ProtectedDashboard = withAuth(Dashboard);
\`\`\`

Rare in modern React — hooks made HOCs largely obsolete for state injection. Still useful for **structural** wrapping (error boundaries, suspense boundaries, theme providers).

### Render Props

**Intent:** Share code by passing a function as a child or prop that receives state and returns JSX.

\`\`\`jsx
function MouseTracker({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>{children(pos)}</div>;
}

<MouseTracker>{pos => <p>{pos.x}, {pos.y}</p>}</MouseTracker>
\`\`\`

Largely replaced by custom hooks (\`useMouse()\` instead). Still common in libraries that need to render custom JSX based on internal state (Headless UI, Radix UI primitives use a hybrid of compound + render-prop patterns).

### Custom Hook

**Intent:** Share stateful logic between components without component nesting. The modern React way to do what HOCs and render props used to.

\`\`\`jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetch(url).then(r => r.json()).then(d => !cancelled && setData(d), setError);
    return () => { cancelled = true; };
  }, [url]);
  return { data, error };
}
\`\`\`

The dominant React pattern post-2019. Most modern libraries (TanStack Query, Zustand, React Hook Form) expose hooks as their primary API.

### Compound Components

**Intent:** Multiple components that work together to express one concept (Tabs / Tab / TabPanel) and share implicit state via Context.

\`\`\`jsx
const TabsContext = createContext();
function Tabs({ children, defaultIndex = 0 }) {
  const [active, setActive] = useState(defaultIndex);
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;
}
Tabs.List = ({ children }) => <div className="tabs-list">{children}</div>;
Tabs.Tab = ({ index, children }) => {
  const { active, setActive } = useContext(TabsContext);
  return <button className={active === index ? 'active' : ''} onClick={() => setActive(index)}>{children}</button>;
};
Tabs.Panel = ({ index, children }) => {
  const { active } = useContext(TabsContext);
  return active === index ? <div>{children}</div> : null;
};

<Tabs>
  <Tabs.List><Tabs.Tab index={0}>One</Tabs.Tab><Tabs.Tab index={1}>Two</Tabs.Tab></Tabs.List>
  <Tabs.Panel index={0}>Content 1</Tabs.Panel>
  <Tabs.Panel index={1}>Content 2</Tabs.Panel>
</Tabs>
\`\`\`

**Real-world:** Radix UI, Headless UI, React Aria — every modern component library uses this pattern. The user composes; the library wires the Context.

### Container / Presentational

**Intent:** Separate components that *manage state* from components that *render UI*. The original React design pattern (Dan Abramov, 2015).

Largely deprecated by hooks — the same separation now happens via custom hooks (state lives in \`useFoo()\`, presentational component renders the result). Still useful as a *concept*: a leaf component with no logic is easier to test, memoize, and reuse.

### Provider Pattern

**Intent:** A top-level component that owns state and exposes it to a subtree via Context.

\`\`\`jsx
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
\`\`\`

Universal React pattern. Combine with custom hooks (\`useTheme()\`) for the consumer side.

### Reducer Pattern (with \`useReducer\`)

**Intent:** Centralize complex state transitions in a pure function (reducer) that takes (state, action) and returns the new state.

\`\`\`jsx
function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + 1 };
    case 'reset':     return { count: 0 };
  }
}
function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return <button onClick={() => dispatch({ type: 'increment' })}>{state.count}</button>;
}
\`\`\`

Same as GoF Command + Mediator combined. Redux is this scaled up to a global store.

---

## 7. Anti-Patterns

Patterns become anti-patterns when applied wrong:

- **Singleton-as-global-state.** Most "Singletons" you see are just globals dressed up. Pass dependencies explicitly.
- **Factory of one.** A factory that produces only one type, called from one place — delete it; just use \`new\`.
- **God component / God object.** One component or class doing 10 things. Extract.
- **Prop drilling 5+ levels.** When you find yourself passing a prop through 5 components that don't use it, lift to Context or state library.
- **HOC pyramid.** \`withAuth(withTheme(withRouter(withTracking(Component))))\` — replace with hooks.
- **Premature abstraction.** Building a Strategy interface for one strategy. Inline until you have three concrete cases.
- **Anemic domain model.** A class with only getters/setters and no behavior — Data Class smell.
- **Service Locator.** A global registry where everyone goes to find services. Hides dependencies; makes testing miserable.

---

## 8. Comparisons — Which Pattern When?

\`\`\`
| If you want to...                                 | Use                       |
|---------------------------------------------------|---------------------------|
| Build a complex object step-by-step               | Builder                   |
| Pick which class to instantiate at runtime        | Factory Method            |
| Pick a family of related objects                  | Abstract Factory          |
| Wrap a third-party API in your own interface      | Adapter                   |
| Add cross-cutting features without subclassing    | Decorator                 |
| Hide a complex subsystem behind a simple API      | Facade                    |
| Control access (lazy load, cache, log)            | Proxy                     |
| Treat tree and leaf uniformly                     | Composite                 |
| Decouple two axes of variation                    | Bridge                    |
| Share lots of fine-grained data                   | Flyweight                 |
| Notify many things when one changes               | Observer                  |
| Pick algorithm at runtime                         | Strategy                  |
| Behavior changes based on object state            | State                     |
| Encapsulate request as object (queueable, undo)   | Command                   |
| Save/restore state without exposing internals     | Memento                   |
| Many-to-many becomes many-to-one-to-many          | Mediator                  |
| Add new operations to a stable hierarchy          | Visitor                   |
| Process request through pipeline of handlers      | Chain of Responsibility   |
| Define algorithm skeleton; subclass fills steps   | Template Method           |
| Share stateful logic between React components     | Custom Hook               |
| Multi-component widget with shared internal state | Compound Components       |
\`\`\`

**Pattern combinations you'll see often:**

- Observer + Command = event-sourced systems (every state change is a Command emitted through an Observer)
- Composite + Visitor = AST traversal (Babel, ESLint)
- Strategy + Factory = "give me the strategy object for this configuration"
- Mediator + Observer = Redux (store mediates; components observe)
- Decorator stack = Express middleware chain

---

## 9. Interview Questions & Answers

### Beginner

---

**Q1: What is a design pattern and why are they useful?**

A design pattern is a **named, reusable solution to a recurring design problem**. The original Gang of Four catalog (1994) collected 23 such patterns from across object-oriented codebases of the era — Factory, Observer, Strategy, etc. — each with a specific intent, context, and trade-off profile.

Three reasons they're useful:

1. **Vocabulary.** "Use a Strategy here" is enormously cheaper than describing the structure from scratch every code review.
2. **Trade-off awareness.** Each pattern's catalog entry documents its drawbacks alongside its benefits. You learn that Singleton makes testing hard *before* you ship one.
3. **Consistency.** A codebase that consistently uses Strategy for "swappable algorithm" is easier to navigate than one with five different ad-hoc shapes for the same idea.

The frequent failure mode is *applying patterns prematurely* — building a Factory before you have multiple things to construct, or a Strategy before you have multiple algorithms. Patterns solve problems; first identify the problem.

---

**Q2: What's the difference between a class and a design pattern?**

A class is a code-level construct — a template for objects, with fields and methods. A design pattern is a *structural recipe* that may involve multiple classes (and interfaces, and relationships between them) cooperating to achieve a goal.

Strategy isn't a single class — it's the *triple* of (1) a context that uses a strategy, (2) a strategy interface, (3) two or more concrete strategies. The pattern names the *relationship*, not any one class.

Patterns are language-independent in concept. The same Observer pattern applies in Java (interface + implements), JavaScript (function + closure), and Smalltalk (block + selector) — same shape, different syntax.

---

**Q3: Explain Singleton, when to use it, and why it's controversial.**

Singleton ensures a class has exactly one instance and provides global access to it. Classic use case: a logger, a config store, a database connection pool — anywhere there's truly one of something.

Why controversial:

1. **It's global state in disguise.** Functions that use a Singleton don't declare it as a dependency. Reading the function signature, you can't tell what it depends on.
2. **It makes testing hard.** Tests that swap a Singleton's behavior need a mechanism to inject a fake — most Singleton implementations don't support that without test-only escape hatches.
3. **The "one instance per process" assumption breaks.** Multi-tenancy, multi-user, hot reload, server-side rendering — all violate it.

The community consensus is to **use dependency injection instead**: pass the logger / config / connection pool as a parameter. Dependencies are visible; tests can substitute.

In JavaScript, modules are *already* singletons — every \`import\` returns the same instance. So \`export const logger = ...\` is the idiomatic way to have "one logger" without writing a Singleton class.

---

**Q4: What's the difference between Factory Method and Abstract Factory?**

Both centralize object creation. The difference is **scope**:

- **Factory Method** creates *one* kind of object. \`createButton(theme)\` returns a Button.
- **Abstract Factory** creates a *family* of related objects. \`createUIKit(theme)\` returns an object with \`button\`, \`textfield\`, \`modal\`, all matching the theme.

Abstract Factory is essentially "Factory Methods bundled together." Use Factory Method when you have one type with variants; use Abstract Factory when you need to ensure several types are constructed *consistently with each other* (a Material-design button paired with a Material-design modal).

---

**Q5: Explain Observer with a JS example.**

Observer is a one-to-many notification mechanism. The **subject** holds a list of subscribers; when its state changes, it notifies each.

\`\`\`js
class Emitter {
  listeners = new Set();
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(value) { this.listeners.forEach(fn => fn(value)); }
}

const price = new Emitter();
const off = price.on(p => console.log('price now', p));
price.emit(100);
price.emit(105);
off();   // unsubscribe
\`\`\`

Idiomatic JS examples: \`addEventListener\`, RxJS, EventEmitter (Node). React's \`useEffect(() => { ... }, [dep])\` is the consumer side of an observer for \`dep\` changes. Redux's \`store.subscribe\` is a classic Observer.

The pattern's strengths are **decoupling** (the subject doesn't know what observers do) and **flexibility** (any number of observers). Its weaknesses are **debug difficulty** (notification cascades are hard to trace) and **memory leaks** (forgotten subscriptions outlive the things that created them — always return an unsubscribe function).

---

### Intermediate

---

**Q6: When would you use Strategy vs polymorphism with class hierarchies?**

Both let you swap behavior by type. The choice is about whether the *relationship between the variants* is a real "is-a" or just "behaves-like."

Use **class hierarchies (inheritance)** when:
- Variants share data fields and lifecycle.
- Variants are conceptually subtypes of one parent thing.
- The variants are stable — you won't be adding or removing them frequently.

Use **Strategy (composition)** when:
- The variants only differ in one specific behavior.
- You want to swap the behavior at runtime (a hierarchy fixes the type at construction).
- Multiple orthogonal axes of variation need to combine — three sort orders × two display formats = 6 subclasses with inheritance, but 3 + 2 strategies with composition.

The general advice "favor composition over inheritance" exists because Strategy scales to combinations linearly while inheritance scales exponentially. Inheritance also locks in the variants at compile time; Strategy can be swapped at runtime.

In FP/JS-land, "Strategy" usually just means "pass a function" — \`Array.sort(compareFn)\`, \`array.filter(predicate)\`, validation rule arrays.

---

**Q7: How does the Decorator pattern compare to JavaScript's \`@decorator\` syntax?**

The Decorator *pattern* is a structural pattern — wrap an object with another object that implements the same interface and adds behavior:

\`\`\`ts
class TextLogger { log(msg) { console.log(msg); } }
class TimestampedLogger {
  constructor(private inner: TextLogger) {}
  log(msg) { this.inner.log(\`[\${Date.now()}] \${msg}\`); }
}
\`\`\`

JavaScript/TypeScript's \`@decorator\` *syntax* is a meta-programming feature that lets you annotate classes, methods, fields, or accessors with a function that runs at definition time. It's *named* after the pattern but is broader — decorators can also do things the pattern doesn't (modify class structure, register metadata, register routes):

\`\`\`ts
@Component({ selector: 'app-foo' })   // decorator syntax — runs at class declaration
class FooComponent { }
\`\`\`

Many uses of the decorator *syntax* implement the decorator *pattern* (e.g., \`@measure\`, \`@retry\`, \`@cached\` wrap a method to add behavior). But not all — \`@inject('UserService')\` is registration, not wrapping. The terminology overlap is unfortunate.

---

**Q8: How would you implement undo/redo using design patterns?**

Two patterns combine cleanly:

1. **Command** — encapsulate each user action (\`AddText\`, \`DeleteRange\`, \`Format\`) as an object with \`execute()\` and \`undo()\`.
2. **Memento** (optional, if \`undo()\` can't be computed) — alongside the Command, snapshot the state before the action so you can restore it.

\`\`\`ts
interface Command {
  execute(): void;
  undo(): void;
}

class History {
  private done: Command[] = [];
  private undone: Command[] = [];
  do(c: Command) { c.execute(); this.done.push(c); this.undone = []; }
  undo() {
    const c = this.done.pop();
    if (c) { c.undo(); this.undone.push(c); }
  }
  redo() {
    const c = this.undone.pop();
    if (c) { c.execute(); this.done.push(c); }
  }
}
\`\`\`

A separate decision: **inverse-on-the-fly** (the Command computes its own undo from the action — works for "type 'h'" because undo is "delete one char") vs **snapshot** (Memento — record the entire document before the action, restore it on undo). Inverse is memory-efficient but only works when the inverse is computable; snapshot is always possible but consumes memory.

Real editors usually combine both: snapshot at coarse boundaries (every paragraph break, every save), inverse for fine actions in between.

---

### Advanced

---

**Q9: Explain how Redux is a combination of multiple GoF patterns.**

Redux's architecture combines four patterns:

1. **Mediator** — the store sits between components and state. Components don't talk to each other directly; they all dispatch to the store.
2. **Command** — actions are Commands. Each is a plain object \`{ type, payload }\` that describes a state change. The reducer is the receiver that knows how to execute each Command.
3. **Observer** — components subscribe to the store via \`useSelector\`/\`subscribe\`. When state changes, observers re-render.
4. **Memento** — the immutable state model is one big Memento per dispatch. Time-travel debugging in Redux DevTools restores prior Mementos.

Redux's design is famously elegant because each of these patterns exists for a reason and the combination is genuinely greater than the sum. The cost — boilerplate, indirection — is the price of that uniformity.

---

**Q10: When would you reach for Mediator over Observer?**

Both decouple objects. The difference is **directionality and structure**:

- **Observer** is one-to-many *broadcast*: subject changes, observers react. Observers don't talk back to the subject (or to each other) through the pattern.
- **Mediator** centralizes many-to-many *coordination*: every object asks the mediator about every other object. The mediator orchestrates.

Use Observer when one source has many passive consumers (DOM event → handlers, store change → components).

Use Mediator when N objects need to coordinate: a chat room (each user must see every other user's messages, plus the room must enforce moderation, presence, history). Without the Mediator, you'd have N×N edges; with it, N edges to one hub.

A Redux store is a Mediator. An EventEmitter is an Observer. A chat room is a Mediator (because it has business logic — moderation, presence — that an EventEmitter doesn't).

Real-world: when your event bus starts growing logic ("if event X comes from user Y, also fire event Z"), it's promoting itself from Observer to Mediator. That's a sign you should consider modeling the coordinator explicitly.

---

**Q11: How does the Visitor pattern relate to AST tools like Babel and ESLint?**

A JavaScript AST is a **Composite** — every node has children, each of which is itself a node (Identifier, BinaryExpression, etc.). The standard way to operate on a Composite is a **Visitor**: define operations *outside* the node classes, in dedicated visitor objects, instead of bloating each node class with every possible operation.

Babel plugins are Visitors:

\`\`\`js
module.exports = function() {
  return {
    visitor: {
      Identifier(path) {
        if (path.node.name === 'foo') path.node.name = 'bar';
      },
      BinaryExpression(path) {
        // operate on every binary expression in the tree
      },
    },
  };
};
\`\`\`

Babel's traversal walks the AST and calls each registered visitor as it encounters matching nodes. ESLint rules are visitors over the same AST — different output (a lint message instead of a tree mutation) but the same shape.

The pattern's payoff is exactly what Visitor sells: adding a new operation (a new lint rule, a new transform) is a new Visitor — no changes to the node classes. Adding a new node type, however, requires updating *every* visitor that cares about it. Visitor optimizes for "stable hierarchy, growing operations," which is the AST-tooling case exactly.

---

**Q12: How do SOLID and the GoF patterns relate to each other?**

The patterns are largely *solutions* to the tensions SOLID *names*. Open/Closed says "adding a case shouldn't mean editing existing code"; Strategy, Factory Method, Decorator and Chain of Responsibility are four different ways to achieve that, depending on what varies. Dependency Inversion says "policy shouldn't import detail"; Abstract Factory and Observer are two ways to invert it.

That's why learning the principles first makes the catalog smaller — you stop memorising twenty-three recipes and start deriving which one fits from the axis of change in front of you.

The relationship isn't one-to-one, though, and claiming it is gets you caught out. Some patterns exist for reasons SOLID doesn't cover at all: **Flyweight** is a memory optimisation, **Iterator** is about traversal decoupling, **Memento** is about state capture. And several patterns serve more than one principle — Decorator gives you Open/Closed *and* is the composition answer to a Liskov problem.

The historical ordering also runs the other way from how it's usually taught: *Design Patterns* was published in 1994 and SOLID was assembled from existing principles in the late 1990s and named in the 2000s. The principles were, in part, an attempt to explain what the patterns already had in common.

---

**Q13: Give an example of SOLID being applied badly.**

The common failure is treating the principles as a checklist to satisfy upfront rather than a diagnosis of pain you've actually felt.

The concrete version: a \`UserService\` with five methods gets "SRP-ified" into \`UserCreator\`, \`UserUpdater\`, \`UserDeleter\`, \`UserFinder\` and \`UserValidator\`, each with an interface, each registered in a DI container. Nothing was gained — those five methods always changed together, for the same reason, at the request of the same team. What was lost is real: following one request now means opening six files, and the abstraction boundaries are guesses nobody validated.

Speculative Open/Closed is the same mistake in a different costume. Introducing a Strategy interface for a rule that has exactly one implementation, on the theory that more will arrive, gives you indirection today for flexibility you may never need — and when the second case does arrive, it usually varies along a *different* axis than the one you generalised.

**The signal an interviewer is listening for** is that you can argue the trade-off in both directions. "This violates SRP" is not an argument. "This file changes for both billing rules and page layout, so those two teams keep colliding in it" is — it names the cost. If you can't name the cost, the principle isn't the reason you want the change.

A JavaScript-specific version worth mentioning: reaching for class hierarchies and interfaces to *demonstrate* SOLID, when a module of pure functions already satisfies most of it and a closure replaces Strategy outright. The principles were written for large object-oriented codebases; applying their OO mechanics literally to idiomatic JS is itself a misapplication.

---

## 10. Tricky Questions

Practice questions on the subtle aspects of pattern selection and trade-offs.

### Pattern Diagnoses

---

**Q1: A function takes a database connection, fetches a row, formats it, and writes a log entry. The function does all this directly. The team wants to make it easier to test. Which pattern fits, and why is "just mock the dependencies" not the same answer?**

**Output:** Strategy (or Dependency Injection — the same idea expressed differently).

**Explanation:**

The diagnosis: the function has *hard-coded dependencies* — it imports \`db\`, imports \`logger\`, and constructs them implicitly. Testing it requires either monkey-patching globals (fragile, leaks between tests) or running against real systems (slow, flaky, requires fixtures).

The pattern fix is to **invert the dependencies**: pass them in as parameters. Each parameter is a strategy — the function commits to *what* it needs (a "fetch row" capability, a "log message" capability) without committing to *how*:

\`\`\`ts
type Fetcher = (id: string) => Promise<Row>;
type Logger  = (msg: string) => void;

async function processRecord(id: string, fetch: Fetcher, log: Logger) {
  const row = await fetch(id);
  const formatted = format(row);
  log(\`processed \${id}\`);
  return formatted;
}

// production
processRecord('123', db.fetchRow, console.log);
// test
processRecord('123', async () => fakeRow, mockLog);
\`\`\`

This is *Strategy* in the GoF sense (pluggable behavior) and *Dependency Injection* in the architectural sense — they're the same mechanism viewed at different scales.

The "just mock the dependencies" answer is technically possible but qualitatively worse:

1. **Mocks are external machinery.** \`jest.mock('./db')\` works, but it requires the test runner to support module mocking, and the test now depends on the import path of the module being mocked. Renaming \`db.ts\` breaks the mock. Strategy/DI doesn't have this fragility — refactor freely.
2. **Mocks hide dependencies.** Reading the function signature, you have no idea it uses \`db\` and \`logger\` until you read the body. Strategy makes them part of the contract — the type system documents the dependencies.
3. **Mocks can't substitute partial behavior cleanly.** With injected strategies, you can pass a real \`fetch\` and a fake \`log\` in the same test. With module mocks, you have to mock everything or nothing.

The deeper principle: dependencies should be **explicit** in the type signature, not implicit in the import graph. That's true regardless of testing — it makes the code easier to reason about even outside tests.

**Takeaway:** Hard-coded dependencies want Strategy / Dependency Injection. Module mocking is a workaround for code that didn't follow the pattern; the pattern itself is the fix.

---

**Q2: A team is building a CSV parser, JSON parser, and XML parser. Each parser produces the same domain model (\`Record[]\`). The feature requirements are: each parser handles its own validation, error reporting, and progress tracking. Which pattern best organizes this, and what's a common mistake?**

**Explanation:**

This is a **Strategy** with a side of **Template Method**, depending on whether the steps are uniform or vary.

The setup matches Strategy: same input contract (a string or stream), same output contract (\`Record[]\`), interchangeable algorithms behind a common interface. A single \`Parser\` interface with three implementations is the canonical shape:

\`\`\`ts
interface Parser {
  parse(input: string): { records: Record[]; errors: ParseError[]; progress?: (pct: number) => void };
}
class CSVParser  implements Parser { /* ... */ }
class JSONParser implements Parser { /* ... */ }
class XMLParser  implements Parser { /* ... */ }
\`\`\`

If the three parsers share **non-trivial structure** — they all stream the input, run validation, emit progress events, accumulate errors — and only differ in the format-specific tokenization, then **Template Method** is even better: an abstract base class implements the shared skeleton (open input → tokenize → validate → close), and subclasses fill in just the tokenize step.

\`\`\`ts
abstract class StreamingParser implements Parser {
  parse(input: string) {
    const tokens = this.tokenize(input);          // abstract
    const records = this.validate(tokens);
    return { records, errors: this.errors };
  }
  protected abstract tokenize(input: string): Token[];   // varies
  protected validate(tokens: Token[]) { /* shared */ return []; }
}

class CSVParser extends StreamingParser { protected tokenize(s: string) { /* CSV-specific */ return []; } }
\`\`\`

**The common mistake:** designing this as a **god switch** — one big \`parse(format, input)\` function that handles all three formats with \`if/else\` everywhere:

\`\`\`ts
function parse(format: 'csv' | 'json' | 'xml', input: string) {
  if (format === 'csv') { /* ... */ }
  else if (format === 'json') { /* ... */ }
  else { /* ... */ }
}
\`\`\`

This conflates three distinct algorithms into one function, makes adding a fourth format require editing every line, and prevents per-parser optimization (memoization, streaming buffers). The Strategy/Template Method split is one of the highest-ROI refactors you can do — pulling apart this kind of god function pays back the first time you add the fourth format.

A subtler mistake: **over-templating**. If the three parsers truly share *no* structure (they don't all stream, don't all validate the same way), forcing a Template Method abstract class creates **Refused Bequest** — JSON parser inheriting from a base class whose "validate" step doesn't apply to JSON. In that case, plain Strategy with a thin interface is correct; the shared skeleton was speculative.

**Takeaway:** Multiple algorithms with the same interface = Strategy. Multiple algorithms with shared structure and varying steps = Template Method. The wrong move is one god function that switches on a format tag — it's the smell Replace Conditional with Polymorphism is named after.

---

**Q3: A senior engineer says "we should add a Builder for our \`User\` class — its constructor takes 3 required and 2 optional parameters." A junior says "5 parameters is fine, why complicate things?" Who's right?**

**Explanation:**

The junior is right, with a caveat. Builder is overkill for 5 parameters; the right tool is **Introduce Parameter Object** with optional fields:

\`\`\`ts
// Don't add a Builder for this.
class User {
  constructor(opts: {
    name: string;
    email: string;
    role: 'admin' | 'user';
    theme?: 'light' | 'dark';
    timezone?: string;
  }) { /* ... */ }
}

new User({ name: 'Ana', email: 'a@b.com', role: 'user' });
new User({ name: 'Ana', email: 'a@b.com', role: 'user', theme: 'dark' });
\`\`\`

Object parameters with optional fields give you everything Builder buys (named parameters, easy optionals, future extensibility) at a fraction of the code. JavaScript and TypeScript don't suffer the original Java pain point Builder solves — Java has no named-parameter syntax, so Builder is the workaround. JS/TS can pass an object literal and skip the workaround entirely.

When is Builder actually justified?

1. **Genuinely complex objects** with 10+ parameters, conditional construction logic, multi-step validation between steps. Think: a query builder where each method (\`select()\`, \`from()\`, \`where()\`) checks the current state and emits an error if called in the wrong order.
2. **Fluent APIs** that chain naturally (Knex, Apollo's \`gql\`, Cypress's \`cy.get().contains()\`).
3. **Step-by-step construction** where intermediate states are themselves valid (a "draft" object you build up over multiple user interactions, then \`.build()\` at the end).

For the User example, none of those apply. The senior's instinct ("Builder for 5 parameters") is the **Speculative Generality** smell — designing for a complexity that isn't there yet. The junior's "5 is fine" is correct. The compromise the senior should accept is "use a parameter object instead of positional args" — that's the actual win to extract from the conversation.

A meta-lesson: **patterns aren't always the answer**. Sometimes the language already has a feature (object parameters, optional fields, default values) that obviates the pattern. Apply the GoF catalog to languages that need it; don't backport patterns to languages that solved the underlying problem differently.

**Takeaway:** Builder is for genuinely complex construction with conditional logic or step-by-step validation. For "constructor with 5 parameters," use a parameter object — same wins, less code.

---

### Subtle Trade-offs

---

**Q4: A reviewer asks: "Why is your Observer's \`unsubscribe\` function returned from \`subscribe\` instead of being a separate \`unsubscribe(fn)\` call?" Why does this design choice matter?**

**Explanation:**

Two concerns drive this choice — **memory safety** and **API ergonomics**.

The "return an unsubscriber" form (\`const off = emitter.on(fn)\`) wins on both:

\`\`\`ts
class Emitter {
  on(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

const off = emitter.on(handler);
// later
off();
\`\`\`

vs the alternative \`emitter.off(fn)\`:

\`\`\`ts
emitter.on(handler);
// later
emitter.off(handler);   // need to keep \`handler\` reference around
\`\`\`

**The memory issue with \`off(fn)\`:** the caller has to hold a reference to the exact listener function in order to remove it later. If the listener was an arrow function (\`emitter.on(() => { ... })\`), there's no way to ever remove it — the function reference is gone. With \`off(fn)\`-style APIs, this leads to predictable bugs: people store handlers in fields just to be able to remove them later, every component has a \`_handler = ...; bind(this)\` ceremony, and forgetting one is a leak.

The "return unsubscriber" form gives you a closure that already captures the necessary reference. The caller stores the *result* of \`on\` (a small function), not the listener itself, and calling that closure does the right thing.

**The ergonomic issue:** "return an unsubscriber" composes naturally with React's \`useEffect\`:

\`\`\`jsx
useEffect(() => {
  const off = emitter.on(handler);
  return off;          // cleanup runs on unmount or dep change
}, [dep]);
\`\`\`

vs the awkward:

\`\`\`jsx
useEffect(() => {
  emitter.on(handler);
  return () => emitter.off(handler);
}, [dep]);
\`\`\`

The first form is one line; the second has the listener-reference-capture concern lurking inside it.

**The historical context:** \`addEventListener\` / \`removeEventListener\` are the OG \`off(fn)\`-style API and they predate this design wisdom. The DOM is stuck with them. Modern APIs (\`AbortController\` is the standard now — pass a \`signal\` and call \`signal.abort()\` to remove all listeners attached with it) have learned the lesson. The signal pattern is even better than the unsubscriber form because **one signal can cancel many listeners at once** — perfect for cleanup at component unmount.

So the modern Observer-pattern advice is actually three layers:

1. Old: \`emitter.on(fn)\` + \`emitter.off(fn)\` — works, but has the reference-capture footgun.
2. Better: \`const off = emitter.on(fn); off()\` — no reference issue.
3. Best: \`emitter.on(fn, { signal })\` + \`controller.abort()\` — bulk cleanup, composes with \`fetch\`, matches the platform's modern primitive.

**Takeaway:** Observer subscribers should return an unsubscribe function (or accept an \`AbortSignal\`). The \`off(fn)\` form forces callers to keep listener references alive, which is a memory-leak factory and a poor fit for modern lifecycle hooks.

---

### Pattern Cheat Sheet

\`\`\`
1.  Pattern is a name for a structural recipe — vocabulary, not code.
2.  Apply patterns reactively (problem first), not proactively.
3.  Creational: Factory, Abstract Factory, Builder, Prototype, Singleton.
4.  Structural: Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy.
5.  Behavioral: Chain, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template, Visitor.
6.  In JS, prefer functions and modules over Java-style class patterns.
7.  Modules are singletons — most "Singleton" classes shouldn't exist in JS.
8.  Decorator pattern ≠ JS @decorator syntax — overlapping name, different scope.
9.  State and Strategy share mechanics; differ by intent (long-lived vs configured).
10. "Favor composition over inheritance" comes from Strategy beating Template Method on combinatorial axes.
11. Observer + Mediator + Command + Memento = Redux.
12. Composite + Visitor = AST tools (Babel, ESLint).
13. Builder for construction with logic; Parameter Object for "5 parameters."
14. React's modern equivalents: Custom Hooks > HOC > Render Props.
15. Anti-pattern: applying patterns before identifying the problem.
\`\`\`

---

## References

- [Refactoring.guru — Design Patterns](https://refactoring.guru/design-patterns) — visual catalog with code examples in multiple languages
- *Design Patterns: Elements of Reusable Object-Oriented Software* (Gamma, Helm, Johnson, Vlissides — "Gang of Four", 1994) — the original
- *Head First Design Patterns* (Freeman & Robson) — friendlier introduction to the same catalog
- [Patterns.dev](https://www.patterns.dev) — modern web-focused patterns (HOC, Render Props, Hooks, Container/Presentational, plus rendering patterns)
- *Refactoring* (Fowler, 2nd ed.) — patterns and the refactorings that lead to them, in the same vocabulary
`;export{e as default};
