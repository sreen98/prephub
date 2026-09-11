const e=`# Low-Level Design (LLD) & Object-Oriented Design — Complete Guide

The LLD round — "design a parking lot", "design a rate limiter", "design an elevator system" — sits between the coding round and the system-design round. It's not about algorithms and it's not about scaling to a million users. It's about whether you can turn a vague requirement into **classes with clear responsibilities and interfaces that survive a change in requirements.**

It's also the round candidates most often go into unprepared, because it has no LeetCode equivalent and it rewards a *method* rather than a memorised answer.

This guide covers the method, the principles that actually get graded, and several worked designs. The Design Patterns guide covers the full GoF catalogue; the System Design guide covers distributed concerns.

---

## Table of Contents

- [1. What This Round Actually Tests](#1-what-this-round-actually-tests)
- [2. The Method](#2-the-method)
- [3. SOLID, Usefully](#3-solid-usefully)
- [4. Composition Over Inheritance](#4-composition-over-inheritance)
- [5. The Patterns That Come Up](#5-the-patterns-that-come-up)
- [6. Worked Design — Parking Lot](#6-worked-design-parking-lot)
- [7. Worked Design — Rate Limiter](#7-worked-design-rate-limiter)
- [8. Worked Design — Elevator System](#8-worked-design-elevator-system)
- [9. Worked Design — Vending Machine](#9-worked-design-vending-machine)
- [10. Concurrency in LLD](#10-concurrency-in-lld)
- [11. Common Mistakes](#11-common-mistakes)
- [12. Interview Questions & Answers](#12-interview-questions-answers)
- [13. Tricky Questions](#13-tricky-questions)
- [14. Cheat Sheet](#14-cheat-sheet)
- [15. References](#15-references)

---

## 1. What This Round Actually Tests

Four things, and only one of them is code:

| Signal | What the interviewer is watching for |
|---|---|
| **Requirement clarification** | do you ask, or do you assume? |
| **Decomposition** | are your responsibilities single and obvious, or is one class doing everything? |
| **Extensibility** | when they change a requirement mid-interview — *and they will* — does your design absorb it or need a rewrite? |
| **Communication** | can you explain a trade-off and defend a choice? |

**The mid-interview requirement change is the whole exam.** "Now support electric vehicles with charging." "Now pricing varies by time of day." "Now there are multiple floors with different rules." A design where that means adding a class passes; one where it means editing five \`if\` chains does not. Everything in §3 and §4 exists to make you pass that moment.

What is *not* being tested: memorising all 23 GoF patterns, writing compilable code, or handling distributed systems concerns. If you find yourself talking about sharding in an LLD round, you've drifted into the wrong interview.

---

## 2. The Method

Follow this out loud. The structure itself is a signal.

### Step 1 — Clarify and scope (2–3 minutes, non-negotiable)

The prompt is deliberately vague. Ask:

- **Scope**: single site or multiple? One process or a service? Is persistence in scope?
- **Scale**: 10 slots or 10,000? This changes data structures, not architecture.
- **Actors**: who uses this? Customer, attendant, admin — each is a different API.
- **Core operations**: what must it *do*? This becomes your interface.
- **Explicitly out of scope**: payments gateway integration, auth, UI. Say it, get agreement.

Then **state your assumptions and write them down.** "I'll assume a single site, in-memory state, and no payment-provider integration — tell me if you'd rather I cover any of those." That converts ambiguity into an agreed contract, and it's the single highest-value two minutes of the round.

### Step 2 — Find the nouns (the entities)

Read the requirements and list the nouns. They're your candidate classes.

> "A parking lot has multiple **floors**. Each floor has **spots** of different **sizes**. A **vehicle** arrives, gets a **ticket**, parks, and pays a **fee** on exit."

→ \`ParkingLot\`, \`Floor\`, \`Spot\`, \`Vehicle\`, \`Ticket\`, \`FeeCalculator\`

Then find the **verbs** — they're the methods, and the ones that don't belong to any noun are telling you a class is missing. "Calculate the fee" doesn't belong to \`Ticket\` or \`Vehicle\`, so \`FeeStrategy\` needs to exist.

### Step 3 — Assign responsibilities

One reason to change per class. The test: **can you describe the class in one sentence without using "and"?** "\`Ticket\` records when a vehicle entered and which spot it took" — fine. "\`ParkingLot\` finds spots and calculates fees and processes payments and manages floors" — four classes wearing one name.

### Step 4 — Define interfaces before implementations

Design the *seams* first — the points where requirements are most likely to change:

\`\`\`ts
interface FeeStrategy    { calculate(ticket: Ticket, exitTime: Date): Money; }
interface SpotAllocator  { findSpot(vehicle: Vehicle, floors: Floor[]): Spot | null; }
interface PaymentMethod  { pay(amount: Money): PaymentResult; }
\`\`\`

This is where you win the requirement-change moment: hourly, flat-rate and weekend pricing become three implementations of \`FeeStrategy\` rather than three branches in a method.

### Step 5 — Sketch it, then write the core

A class diagram (even ASCII) is faster than code and easier to change. Then write **only the interesting parts** — the strategy interface, the allocation logic, the state machine. Nobody needs to see your getters, and time spent typing them is time not spent discussing design.

### Step 6 — Walk a scenario, then stress it

Trace a request end to end, then attack your own design: "What if two cars arrive simultaneously for the last spot?" "What if the fee strategy needs to change while cars are parked?" Volunteering the weakness is much stronger than having it found.

---

## 3. SOLID, Usefully

SOLID gets recited and rarely applied. What each principle actually buys you:

### S — Single Responsibility

One reason to change. The practical test is the one-sentence description above.

\`\`\`ts
// ✗ Three reasons to change: parking rules, pricing, notifications
class ParkingLotBroken {
  park(v: Vehicle) {}
  calculateFee(t: Ticket) {}
  sendReceiptEmail(t: Ticket) {}
}

// ✓ Each changes for its own reason
class ParkingLot     { park(v: Vehicle): Ticket {} }
class FeeCalculator  { calculate(t: Ticket): Money {} }
class Notifier       { send(t: Ticket): void {} }
\`\`\`

### O — Open/Closed

Open to extension, closed to modification. **This is the one the requirement-change moment tests**, and it's almost always achieved with a strategy interface and a registry, replacing a conditional chain:

\`\`\`ts
// ✗ Every new type means editing this method — and every other method like it
class FeeCalculator {
  calculateFee(ticket: Ticket): number {
    if (ticket.type === 'car')   return hours * 2;
    if (ticket.type === 'bike')  return hours * 1;
    if (ticket.type === 'truck') return hours * 5;   // and now electric? and weekends?
  }
}

// ✓ A new type is a new class, registered. Nothing existing is edited.
const strategies = new Map<VehicleType, FeeStrategy>([
  ['car', new HourlyFee(2)], ['bike', new HourlyFee(1)], ['truck', new HourlyFee(5)],
]);
class StrategyFeeCalculator {
  calculateFee(t: Ticket) { return strategies.get(t.type)!.calculate(t); }
}
\`\`\`

**How to spot the violation:** a \`switch\` or \`if\`/\`else\` chain on a type field, repeated in more than one place. That's the smell that says "polymorphism goes here."

### L — Liskov Substitution

A subtype must be usable wherever the base type is, **without the caller knowing**. The canonical violation:

\`\`\`ts
class Rectangle { setWidth(w) {} setHeight(h) {} }
class Square extends Rectangle {
  setWidth(w)  { this.w = this.h = w; }   // breaks the caller's expectation
  setHeight(h) { this.w = this.h = h; }
}
// Any caller doing setWidth(5); setHeight(4); expects area 20 and gets 16.
\`\`\`

The lesson isn't about rectangles — it's that **"is-a" in English is not "is-a" in code.** A square *is* a rectangle mathematically and is not a substitutable \`Rectangle\` if \`Rectangle\` promises independent dimensions. Practical tell: if a subclass throws \`UnsupportedOperationException\`, narrows an accepted input, or strengthens a precondition, it's violating LSP and the hierarchy is wrong.

### I — Interface Segregation

Don't force implementers to depend on methods they don't use.

\`\`\`ts
// ✗ A basic spot must implement charging it doesn't have
interface Spot { park(v); vacate(); startCharging(); getChargeLevel(); }

// ✓ Capabilities are separate and composable
interface Spot        { park(v: Vehicle): void; vacate(): void; }
interface Chargeable  { startCharging(): void; getChargeLevel(): number; }
class ElectricSpot implements Spot, Chargeable {}
\`\`\`

The tell: an implementation full of \`throw new Error('not supported')\`.

### D — Dependency Inversion

Depend on abstractions, and **inject** them rather than constructing them:

\`\`\`ts
// ✗ ParkingLot is welded to one fee strategy and one repository
class ParkingLotBroken {
  private fees = new HourlyFeeCalculator();      // untestable, unswappable
}

// ✓ Injected — testable with a fake, swappable per deployment
class ParkingLot {
  constructor(
    private fees: FeeStrategy,
    private spots: SpotAllocator,
    private repo: TicketRepository,
  ) {}
}
\`\`\`

The immediate practical payoff is **testability**: you can unit-test \`ParkingLot\` with an in-memory repository and a stub fee strategy, no database, no clock. If a class is hard to test, it's almost always because it constructs its own dependencies — which is why "how would you test this?" is a good self-check on any LLD design.

---

## 4. Composition Over Inheritance

Inheritance couples you to a hierarchy you must predict up front. Requirements rarely cooperate.

\`\`\`ts
// ✗ The combinatorial explosion. Now add "electric" and it doubles again.
class VehicleBroken {}
class Car extends VehicleBroken {}
class ElectricCar extends Car {}
class LargeElectricCar extends ElectricCar {}
class LargeElectricCarWithTrailer extends LargeElectricCar {}   // …

// ✓ Compose capabilities
class Vehicle {
  constructor(
    public readonly size: Size,
    public readonly capabilities: Set<Capability> = new Set(),
  ) {}
  has(c: Capability) { return this.capabilities.has(c); }
}
const v = new Vehicle(Size.LARGE, new Set([Capability.ELECTRIC, Capability.TRAILER]));
\`\`\`

**Use inheritance when** there's a genuine, stable "is-a" that satisfies Liskov and you want to share an implementation — and even then prefer a shallow hierarchy (one level). **Use composition when** you're modelling *capabilities*, *behaviours* or *variations*, which is most of the time.

Two heuristics worth saying out loud: **"has-a" beats "is-a" whenever the answer isn't obvious**, and **more than two levels of inheritance is a smell** — by level three, nobody can predict which method actually runs.

Also relevant in a JavaScript/TypeScript interview: JS is prototypal, not classical, and the ecosystem strongly favours composition (functions, closures, hooks) over class hierarchies. Modelling an LLD problem with plain objects, closures and discriminated unions is a perfectly good answer here — and arguably a more idiomatic one — as long as the **responsibilities and seams** are just as clear.

---

## 5. The Patterns That Come Up

You don't need all 23. These are the ones that genuinely appear in LLD rounds, with the signal that calls for each:

| Pattern | Reach for it when | Appears in |
|---|---|---|
| **Strategy** | one behaviour has interchangeable variants | pricing, allocation, eviction, rate-limit algorithms |
| **Factory** | creation logic depends on input and should live in one place | \`VehicleFactory\`, \`NotificationFactory\` |
| **Observer** | one change must notify N interested parties | display boards, event systems, notifications |
| **State** | behaviour depends on a mode, with legal transitions | vending machine, elevator, order lifecycle |
| **Command** | you need to queue, log, retry or undo an action | elevator requests, job queues, undo stacks |
| **Singleton** | genuinely one instance (**use sparingly**) | a config or registry — usually better as an injected dependency |
| **Decorator** | you need to layer optional behaviour at runtime | pricing add-ons, middleware, logging |
| **Repository** | you want to hide persistence behind an interface | \`TicketRepository\`, testable with an in-memory fake |
| **Builder** | an object has many optional construction parameters | complex config objects |

**Strategy and State are the two highest-value patterns for this round**, because between them they absorb most requirement changes an interviewer will throw at you.

A word on **Singleton**: naming it is fine, defaulting to it is not. It's global mutable state — it makes testing harder (no isolation between tests), hides dependencies, and creates concurrency problems. If you propose one, say why an injected single instance wouldn't do. Volunteering that trade-off scores better than the pattern itself.


---

## 6. Worked Design — Parking Lot

The most-asked LLD problem. Here's the full method applied.

### 6.1 Clarify

> Multiple floors? **Yes.** Vehicle types? **Bike, car, truck — and I'd design for more.** Pricing? **Hourly, varying by vehicle type; assume it may change.** Payment? **Assume an interface; the gateway is out of scope.** Reservations? **Out of scope.** Scale? **A few thousand spots, single site, in-memory.** Concurrency? **Yes — multiple entry gates.**

### 6.2 Entities and Seams

\`\`\`
ParkingLot ──has──▶ Floor[] ──has──▶ Spot[]
     │                                  │
     │ uses                             │ holds
     ▼                                  ▼
SpotAllocator (interface)            Vehicle
FeeStrategy   (interface)
TicketRepository (interface)
     │
     ▼
Ticket ──references──▶ Spot, Vehicle, entryTime
\`\`\`

The three interfaces are the seams — the places requirements change.

### 6.3 The Code That Matters

\`\`\`ts
enum Size { BIKE, CAR, TRUCK }
type Capability = 'ELECTRIC' | 'HANDICAP';

class Vehicle {
  constructor(
    readonly plate: string,
    readonly size: Size,
    readonly capabilities: Set<Capability> = new Set(),
  ) {}
}

class Spot {
  private vehicle: Vehicle | null = null;
  constructor(
    readonly id: string,
    readonly floor: number,
    readonly size: Size,
    readonly capabilities: Set<Capability> = new Set(),
  ) {}

  get isFree() { return this.vehicle === null; }

  /** A spot fits a vehicle if it's big enough AND offers every capability needed. */
  fits(v: Vehicle): boolean {
    return this.size >= v.size &&
           [...v.capabilities].every(c => this.capabilities.has(c));
  }

  occupy(v: Vehicle) {
    if (!this.isFree) throw new Error(\`Spot \${this.id} is occupied\`);
    this.vehicle = v;
  }
  vacate() { this.vehicle = null; }
}

// ---- Seam 1: allocation ---------------------------------------------------
interface SpotAllocator { findSpot(v: Vehicle, floors: Floor[]): Spot | null; }

class NearestFirstAllocator implements SpotAllocator {
  findSpot(v: Vehicle, floors: Floor[]) {
    for (const floor of floors) {                 // floors are ordered by proximity
      const spot = floor.findFreeSpot(v);
      if (spot) return spot;
    }
    return null;
  }
}
// A BestFitAllocator (smallest spot that fits) is a second implementation.
// Nothing else changes.

// ---- Seam 2: pricing -----------------------------------------------------
interface FeeStrategy { calculate(ticket: Ticket, exit: Date): Money; }

class HourlyFee implements FeeStrategy {
  constructor(private ratesBySize: Map<Size, number>) {}
  calculate(ticket: Ticket, exit: Date): Money {
    const hours = Math.ceil((+exit - +ticket.entryTime) / 3_600_000);
    return Money.of(hours * this.ratesBySize.get(ticket.spot.size)!);
  }
}

/** Layered pricing via Decorator — weekend surcharge on top of ANY strategy. */
class WeekendSurcharge implements FeeStrategy {
  constructor(private inner: FeeStrategy, private multiplier = 1.5) {}
  calculate(ticket: Ticket, exit: Date): Money {
    const base = this.inner.calculate(ticket, exit);
    const isWeekend = [0, 6].includes(ticket.entryTime.getDay());
    return isWeekend ? base.times(this.multiplier) : base;
  }
}

// ---- The orchestrator ----------------------------------------------------
class ParkingLot {
  constructor(
    private floors: Floor[],
    private allocator: SpotAllocator,
    private fees: FeeStrategy,
    private tickets: TicketRepository,
  ) {}

  park(vehicle: Vehicle): Ticket {
    const spot = this.allocator.findSpot(vehicle, this.floors);
    if (!spot) throw new LotFullError(vehicle.size);
    spot.occupy(vehicle);                          // see §10 on concurrency
    const ticket = new Ticket(crypto.randomUUID(), vehicle, spot, new Date());
    this.tickets.save(ticket);
    return ticket;
  }

  unpark(ticketId: string, payment: PaymentMethod): Receipt {
    const ticket = this.tickets.find(ticketId) ?? (() => { throw new Error('No ticket'); })();
    const amount = this.fees.calculate(ticket, new Date());
    const result = payment.pay(amount);
    if (!result.ok) throw new PaymentFailedError(result.reason);
    ticket.spot.vacate();                          // only AFTER payment succeeds
    this.tickets.close(ticket);
    return new Receipt(ticket, amount, result.transactionId);
  }
}
\`\`\`

### 6.4 Absorbing the Requirement Changes

This is the part to rehearse, because it's what the interviewer will ask:

| "Now also support…" | Change required |
|---|---|
| **Electric vehicles with charging** | add \`ELECTRIC\` to \`Capability\`; \`fits()\` already handles it. Add a \`ChargingSpot implements Spot, Chargeable\`. **No change to \`ParkingLot\`.** |
| **Time-of-day pricing** | a new \`FeeStrategy\` implementation, or wrap the existing one in a decorator. **No change to \`ParkingLot\`.** |
| **Handicap spots reserved near lifts** | a \`Capability\` plus a \`PriorityAllocator\`. **No change to \`ParkingLot\`.** |
| **Monthly pass holders** | a \`SubscriptionFee implements FeeStrategy\` returning zero, selected per ticket. |
| **A display board showing free spots per floor** | \`Observer\` — \`Floor\` publishes occupancy events; the board subscribes. |
| **Multiple sites** | \`ParkingLot\` becomes one aggregate under a \`Site\`; the seams are unchanged. |

Every row is "add a class" rather than "edit a method." That's Open/Closed doing its job, and it's the outcome the design was arranged to produce.

---

## 7. Worked Design — Rate Limiter

A favourite because it's small enough to finish and rich enough to discuss algorithms *and* design.

### 7.1 Clarify

> Per user, per IP, or per API key? **Configurable key.** Distributed or single-process? **Design the interface so both are possible; implement in-memory.** Which algorithm? **I'll make it a strategy — the choice depends on whether bursts are acceptable.** Behaviour on limit? **Reject with a retry-after; queueing is out of scope.**

### 7.2 The Algorithms — and the Trade-off

\`\`\`ts
interface RateLimiter {
  /** Returns whether the request is allowed, plus retry guidance. */
  tryAcquire(key: string, cost?: number): Decision;
}
type Decision = { allowed: true; remaining: number }
              | { allowed: false; retryAfterMs: number };
\`\`\`

**Fixed window** — simplest, and has a real flaw:

\`\`\`ts
class FixedWindowLimiter implements RateLimiter {
  private counts = new Map<string, { windowStart: number; count: number }>();
  constructor(private limit: number, private windowMs: number, private clock: Clock) {}

  tryAcquire(key: string): Decision {
    const now = this.clock.now();
    const windowStart = Math.floor(now / this.windowMs) * this.windowMs;
    const entry = this.counts.get(key);

    if (!entry || entry.windowStart !== windowStart) {
      this.counts.set(key, { windowStart, count: 1 });
      return { allowed: true, remaining: this.limit - 1 };
    }
    if (entry.count < this.limit) {
      entry.count++;
      return { allowed: true, remaining: this.limit - entry.count };
    }
    return { allowed: false, retryAfterMs: windowStart + this.windowMs - now };
  }
}
\`\`\`

**The boundary-burst flaw**, which you should raise yourself: with a limit of 100/minute, a client can send 100 requests at 11:59:59 and 100 more at 12:00:00 — **200 requests in one second**, twice the intended rate. That's the reason the other algorithms exist.

**Sliding window log** — exact, but memory grows with the limit:

\`\`\`ts
class SlidingWindowLogLimiter implements RateLimiter {
  private log = new Map<string, number[]>();     // timestamps
  tryAcquire(key: string): Decision {
    const now = this.clock.now();
    const cutoff = now - this.windowMs;
    const times = (this.log.get(key) ?? []).filter(t => t > cutoff);   // evict old
    if (times.length >= this.limit) {
      return { allowed: false, retryAfterMs: times[0] + this.windowMs - now };
    }
    times.push(now);
    this.log.set(key, times);
    return { allowed: true, remaining: this.limit - times.length };
  }
}
\`\`\`

**Token bucket** — the usual production choice, because it **allows controlled bursts** while bounding the average rate:

\`\`\`ts
class TokenBucketLimiter implements RateLimiter {
  private buckets = new Map<string, { tokens: number; lastRefill: number }>();
  constructor(
    private capacity: number,          // max burst
    private refillPerSec: number,      // sustained rate
    private clock: Clock,
  ) {}

  tryAcquire(key: string, cost = 1): Decision {
    const now = this.clock.now();
    const b = this.buckets.get(key) ?? { tokens: this.capacity, lastRefill: now };

    // Lazy refill — no background timer needed, which is the elegant part
    const elapsedSec = (now - b.lastRefill) / 1000;
    b.tokens = Math.min(this.capacity, b.tokens + elapsedSec * this.refillPerSec);
    b.lastRefill = now;

    if (b.tokens >= cost) {
      b.tokens -= cost;
      this.buckets.set(key, b);
      return { allowed: true, remaining: Math.floor(b.tokens) };
    }
    this.buckets.set(key, b);
    const deficit = cost - b.tokens;
    return { allowed: false, retryAfterMs: (deficit / this.refillPerSec) * 1000 };
  }
}
\`\`\`

| Algorithm | Memory per key | Bursts | Precision |
|---|---|---|---|
| Fixed window | O(1) | **2× at boundaries** | poor |
| Sliding window log | **O(limit)** | none | exact |
| Sliding window counter | O(1) | slight | good approximation |
| **Token bucket** | O(1) | **controlled, by design** | good |
| Leaky bucket | O(1) | smoothed output | good |

### 7.3 The Design Points to Volunteer

- **\`Clock\` is injected.** Without it you cannot test a rate limiter without \`sleep\`, and tests with real sleeps are slow and flaky (see the Testing Strategy guide). This one detail signals real experience.
- **\`cost\` as a parameter** lets one endpoint consume more budget than another — useful and nearly free.
- **Memory is unbounded** as written: a map keyed by user grows forever. Needs LRU eviction or TTL expiry. Raising this before you're asked is a strong move.
- **Going distributed** changes the problem, not the interface: the state must be shared, so it moves to Redis, and the read-modify-write must be **atomic** — a Lua script or \`INCR\` with \`EXPIRE\`, never \`GET\` then \`SET\`, which is the lost-update race from the SQL guide. Mention that per-instance limiting means N instances allow N× the limit.
- **Fail open or closed?** If Redis is down, do you reject everything (safe, but an availability outage) or allow everything (available, but unprotected)? There's no universal answer — for a login endpoint, closed; for a read API, open. Naming the choice is the point.

---

## 8. Worked Design — Elevator System

The classic **State pattern** problem, and the one where candidates most often jump to code too early.

### 8.1 Clarify

> How many lifts and floors? **3 lifts, 10 floors.** Are there two kinds of request? **Yes — external (hall call: floor + direction) and internal (car call: destination).** Optimisation goal? **Minimise average wait; I'll make the dispatch strategy pluggable.** Capacity limits, express lifts, fire mode? **Out of scope, but I'll note where they'd slot in.**

The two-kinds-of-request distinction is the insight that makes this design work, and it's the thing to surface in clarification rather than discover halfway through.

### 8.2 The Model

\`\`\`ts
enum Direction { UP, DOWN, IDLE }
enum DoorState { OPEN, CLOSED }

class Elevator {
  private currentFloor = 1;
  private direction = Direction.IDLE;
  private door = DoorState.CLOSED;
  // Two sorted sets: floors to visit going up, and going down.
  // This IS the SCAN/elevator algorithm, and it's why the design is simple.
  private upStops = new SortedSet<number>();
  private downStops = new SortedSet<number>();

  constructor(readonly id: string) {}

  addStop(floor: number) {
    if (floor > this.currentFloor) this.upStops.add(floor);
    else if (floor < this.currentFloor) this.downStops.add(floor);
    else this.openDoor();
  }

  /** One tick of movement. Called by the controller. */
  step() {
    if (this.door === DoorState.OPEN) { this.closeDoor(); return; }

    const next = this.nextStop();
    if (next === null) { this.direction = Direction.IDLE; return; }

    this.direction = next > this.currentFloor ? Direction.UP : Direction.DOWN;
    this.currentFloor += this.direction === Direction.UP ? 1 : -1;

    if (this.currentFloor === next) {
      (this.direction === Direction.UP ? this.upStops : this.downStops).delete(next);
      this.openDoor();
    }
  }

  /** Keep going in the current direction until there's nothing left that way. */
  private nextStop(): number | null {
    if (this.direction === Direction.UP)   return this.upStops.min() ?? this.downStops.max() ?? null;
    if (this.direction === Direction.DOWN) return this.downStops.max() ?? this.upStops.min() ?? null;
    return this.upStops.min() ?? this.downStops.max() ?? null;
  }

  /** Used by the dispatcher to score this lift for a request. */
  costFor(floor: number, dir: Direction): number {
    if (this.direction === Direction.IDLE) return Math.abs(this.currentFloor - floor);
    const sameDirection = this.direction === dir;
    const onTheWay = dir === Direction.UP ? floor >= this.currentFloor : floor <= this.currentFloor;
    if (sameDirection && onTheWay) return Math.abs(this.currentFloor - floor);
    return Math.abs(this.currentFloor - floor) + PENALTY;   // must reverse first
  }
}

// ---- The seam: dispatch strategy -----------------------------------------
interface DispatchStrategy { select(request: HallCall, lifts: Elevator[]): Elevator; }

class NearestCarStrategy implements DispatchStrategy {
  select(req: HallCall, lifts: Elevator[]) {
    return lifts.reduce((best, l) =>
      l.costFor(req.floor, req.direction) < best.costFor(req.floor, req.direction) ? l : best);
  }
}

class ElevatorController {
  constructor(private lifts: Elevator[], private dispatch: DispatchStrategy) {}

  requestFromFloor(floor: number, direction: Direction) {      // external / hall call
    this.dispatch.select({ floor, direction }, this.lifts).addStop(floor);
  }
  requestFromCar(liftId: string, floor: number) {              // internal / car call
    this.lifts.find(l => l.id === liftId)!.addStop(floor);
  }
  tick() { this.lifts.forEach(l => l.step()); }
}
\`\`\`

### 8.3 What to Discuss

**The SCAN (elevator) algorithm** is the core insight: keep travelling in one direction, serving every stop on the way, then reverse. Two sorted sets express it directly, and that's why the code above is short. A naive FIFO queue produces absurd behaviour — a lift at floor 1 with requests for 10 then 2 goes 1→10→2 instead of 1→2→10.

**Dispatch is the interesting seam.** Nearest-car is simple and starves nobody badly; a "minimise total system wait" strategy is better under load; zoning (lifts assigned to floor bands) is what real buildings use in skyscrapers. Making it an interface means you can discuss all three without redesigning.

**Where the out-of-scope features slot in**, which is worth stating: capacity is a check in \`addStop\`; express lifts are a \`DispatchStrategy\` that filters eligible floors; fire mode is a **State** on the controller that overrides normal dispatch and sends every lift to the ground floor. Each is an addition, not an edit.

---

## 9. Worked Design — Vending Machine

The cleanest illustration of the **State pattern**, and much better as a state machine than as a pile of booleans.

\`\`\`ts
interface VendingState {
  insertCoin(m: Machine, coin: Coin): void;
  selectItem(m: Machine, code: string): void;
  dispense(m: Machine): void;
  refund(m: Machine): void;
}

class IdleState implements VendingState {
  insertCoin(m: Machine, coin: Coin) { m.addCredit(coin); m.setState(new HasCreditState()); }
  selectItem(m: Machine)  { m.display('Insert coin first'); }
  dispense(m: Machine)    { m.display('Nothing selected'); }
  refund(m: Machine)      { m.display('No credit'); }
}

class HasCreditState implements VendingState {
  insertCoin(m: Machine, coin: Coin) { m.addCredit(coin); }
  selectItem(m: Machine, code: string) {
    const item = m.inventory.get(code);
    if (!item)              return m.display('Invalid selection');
    if (item.stock === 0)   return m.display('Sold out');
    if (m.credit < item.price) return m.display(\`Need \${item.price - m.credit} more\`);
    m.select(item);
    m.setState(new DispensingState());
  }
  dispense(m: Machine) { m.display('Select an item'); }
  refund(m: Machine)   { m.returnCredit(); m.setState(new IdleState()); }
}

class DispensingState implements VendingState {
  insertCoin(m: Machine, c: Coin) { m.returnCoin(c); }          // reject during dispense
  selectItem(m: Machine)          { m.display('Please wait'); }
  dispense(m: Machine) {
    m.releaseItem();
    m.returnChange();
    m.setState(new IdleState());
  }
  refund(m: Machine) { m.display('Too late to refund'); }
}
\`\`\`

**Why this beats the alternative.** Without State, \`selectItem\` becomes a thicket of \`if (this.credit > 0 && !this.dispensing && this.selected === null)\` conditions repeated in every method — and every new state (maintenance mode, out-of-change mode) multiplies them. With State, each class answers "what does *this* operation mean while I'm in *this* mode?", **illegal transitions are impossible to express**, and a new state is a new class.

The general signal: **when behaviour depends on a mode and there are rules about which transitions are legal, that's the State pattern.** Order lifecycles, payment flows, document approval, media players, connection state — all the same shape.


---

## 10. Concurrency in LLD

Most LLD problems have a concurrency dimension, and raising it unprompted is a strong signal — most candidates never mention it.

**The classic: two cars, one spot.**

\`\`\`ts
// ✗ Check-then-act is a race
const spot = allocator.findSpot(vehicle, floors);   // both threads see the same free spot
spot.occupy(vehicle);                               // one silently overwrites the other
\`\`\`

The fixes, and which one you pick depends on the runtime:

\`\`\`ts
// 1. Make the check-and-claim atomic inside the entity
class Spot {
  private vehicle: Vehicle | null = null;
  tryOccupy(v: Vehicle): boolean {
    if (this.vehicle !== null) return false;        // atomic in a single-threaded runtime
    this.vehicle = v;
    return true;
  }
}
// The allocator then retries with the next candidate on failure.

// 2. In a genuinely multi-threaded runtime: a lock, or a concurrent structure
//    (Java: AtomicReference.compareAndSet, ConcurrentHashMap, or a per-floor lock)

// 3. Distributed: push the arbitration to the store —
//    a conditional UPDATE (… WHERE spot_id = $1 AND occupied = false),
//    a UNIQUE constraint, or Redis SETNX. Zero rows affected = someone won the race.
\`\`\`

**The JavaScript-specific point worth making**, and it's a genuinely good answer in a JS/TS interview: **JavaScript is single-threaded, so there is no preemption between statements** — a synchronous check-then-act cannot interleave. But \`await\` **is** a yield point, so this *is* racy:

\`\`\`ts
class ParkingLot {
  async park(v: Vehicle) {
    const spot = this.find(v);              // spot is free
    await this.repo.reserve(spot.id);       // ← another request runs during this await
    spot.occupy(v);                         // may now be occupied
  }
}
\`\`\`

So in Node the race isn't between threads, it's **across \`await\` boundaries** — and the fix is to make the claim atomic in whatever holds the state (a single conditional database update, or a synchronous claim before the first \`await\`).

Concurrency points to raise in the other designs: the rate limiter's read-modify-write must be atomic (Redis Lua, not \`GET\`/\`SET\`); the vending machine must reject coins mid-dispense (which the State pattern already handles); the elevator's stop set is mutated by both the dispatcher and the movement loop.

And the general principles, which transfer everywhere: **prefer a single atomic operation to a lock**; **hold locks for the shortest possible time**; **acquire multiple locks in a consistent order** (the deadlock fix from the SQL guide); and **make the invariant enforceable by the store** rather than by convention.

---

## 11. Common Mistakes

- **Coding before clarifying.** Two minutes of questions is the highest-value part of the round, and skipping it means you design the wrong thing confidently.
- **A god class.** \`ParkingLotManager\` that finds spots, prices tickets, takes payments and sends emails. Apply the one-sentence test.
- **Anaemic classes plus a service that does everything** — the opposite failure. Data-only classes with all logic in a \`Service\` is procedural code in class clothing; \`Spot.fits(vehicle)\` belongs on \`Spot\`.
- **Primitive obsession.** \`number\` for money (floating-point rounding on currency is a real bug), \`string\` for IDs and states. A \`Money\` type and enums prevent a whole class of error and read better.
- **\`if\`/\`switch\` chains on a type field**, repeated in several methods. That's the Open/Closed violation and the thing the requirement-change moment will punish.
- **Deep inheritance** as the extension mechanism. Compose.
- **Over-engineering.** Six patterns and an abstract factory for a problem with two variants. Design for the extension points the requirements *imply*, not every conceivable future.
- **Ignoring errors.** What happens when the lot is full, payment fails, or the ticket is lost? Naming the failure modes is part of the design.
- **Never mentioning concurrency**, testing, or persistence boundaries.
- **Silence.** An unexplained diagram scores far worse than a narrated trade-off, because the round is substantially a communication exercise.

---

## 12. Interview Questions & Answers

### Beginner

---

**Q1: How do you approach an LLD question like "design a parking lot"?**

With a fixed method, narrated out loud, because the structure is itself part of what's graded.

**1. Clarify for two or three minutes.** The prompt is deliberately vague. Scope (one site or many, is persistence in scope), scale (10 spots or 10,000 — this changes data structures, not architecture), actors (customer, attendant, admin — each is a different API), core operations, and what's explicitly **out** of scope. Then **state my assumptions** so ambiguity becomes an agreed contract.

**2. Find the nouns** — they're the candidate classes. \`ParkingLot\`, \`Floor\`, \`Spot\`, \`Vehicle\`, \`Ticket\`. Then the **verbs**; the ones that don't belong to any noun are telling me a class is missing — "calculate the fee" doesn't belong to \`Ticket\` or \`Vehicle\`, so \`FeeStrategy\` needs to exist.

**3. Assign responsibilities**, one reason to change each. My test is whether I can describe the class in one sentence **without using "and."**

**4. Define the interfaces before the implementations**, specifically at the points requirements are most likely to change — \`FeeStrategy\`, \`SpotAllocator\`, \`PaymentMethod\`, \`TicketRepository\`.

**5. Sketch a class diagram**, then write only the interesting code. Nobody needs my getters.

**6. Walk a scenario end to end, then attack my own design** — "what if two cars arrive for the last spot?"

The step that matters most is **4**, because the interviewer *will* change a requirement — electric vehicles, weekend pricing, monthly passes — and the whole point of putting the seams in first is that each of those becomes "add a class" rather than "edit five methods." Volunteering that I've designed for a specific change I expect scores well.

---

**Q2: Explain SOLID with an example of where it actually helps.**

I'd focus on the two that earn their keep in this round.

**Open/Closed is the one that gets tested**, because it's what survives a requirement change. The violation is always the same shape — a conditional chain on a type field:

\`\`\`ts
// ✗ Every new vehicle type edits this method. And every method like it.
function calculateFee(type: VehicleType, hours: number): number {
  if (type === 'car') return hours * 2;
  if (type === 'bike') return hours * 1;
  return 0;
}

// ✓ A new type is a new class, registered. Nothing existing is touched.
const strategies = new Map<VehicleType, FeeStrategy>([
  ['car', new HourlyFee(2)],
  ['bike', new HourlyFee(1)],
]);
\`\`\`

**Dependency Inversion pays off immediately in testability**, which is the practical argument rather than the abstract one. A \`ParkingLot\` that does \`new HourlyFeeCalculator()\` internally can't be tested without that calculator, or with a fixed clock. Inject it and I can unit-test with a stub. **If a class is hard to test, it's usually because it constructs its own dependencies** — so "how would I test this?" is a useful self-check on any design.

The other three, briefly: **Single Responsibility** — one reason to change, tested by the one-sentence rule. **Liskov** — a subtype must work wherever the base does *without the caller knowing*; the tell is a subclass that throws "not supported" or narrows an accepted input, which means the hierarchy is wrong. **Interface Segregation** — don't force implementers to depend on methods they don't use; the tell is implementations full of \`throw new Error('not supported')\`.

The caveat I'd add: SOLID is a set of heuristics for **managing change**, not laws. Applying all five to a two-variant problem produces indirection with no payoff. The question to keep asking is "what's likely to change here?" and put the seam there.

---

### Intermediate

---

**Q3: Design a rate limiter. Which algorithm and why?**

I'd start with an interface, then argue the algorithm:

\`\`\`ts
interface RateLimiter { tryAcquire(key: string, cost?: number): Decision; }
type Decision = { allowed: true; remaining: number }
              | { allowed: false; retryAfterMs: number };
\`\`\`

Then the algorithms, and the trade-off is about **bursts**:

**Fixed window** is simplest and has a flaw I'd raise myself: with 100/minute, a client can send 100 requests at 11:59:59 and 100 more at 12:00:00 — **200 in one second**, double the intended rate. That boundary burst is why the others exist.

**Sliding window log** is exact but stores a timestamp per request, so memory is O(limit) per key — fine for small limits, bad for large ones.

**Token bucket** is what I'd pick for most APIs, because it **allows controlled bursts by design** while bounding the sustained rate — which matches real client behaviour, where a page load fires eight requests at once and then goes quiet. The implementation is elegant: refill **lazily** based on elapsed time when a request arrives, so there's no background timer.

\`\`\`ts
const elapsedSec = (now - b.lastRefill) / 1000;
b.tokens = Math.min(capacity, b.tokens + elapsedSec * refillPerSec);
\`\`\`

Design points I'd volunteer, because they're what distinguish this from a textbook answer:

- **Inject the clock.** Otherwise you cannot test a rate limiter without \`sleep\`, and sleep-based tests are slow and flaky.
- **\`cost\` as a parameter**, so an expensive endpoint can consume more budget.
- **The map is unbounded** — it grows per key forever. Needs TTL expiry or LRU eviction.
- **Distributed changes the state, not the interface.** It moves to Redis, and the read-modify-write **must be atomic** — a Lua script or \`INCR\`+\`EXPIRE\`, never \`GET\` then \`SET\`, which is a lost-update race. Also: per-instance limiting means N instances allow N× the limit, which is a common production surprise.
- **Fail open or closed when Redis is down?** For a login endpoint, closed. For a read API, open. There's no universal answer, and naming the choice is the point.

---

**Q4: When would you use inheritance over composition?**

Rarely, and I'd want a specific justification.

**Composition by default**, because inheritance couples you to a hierarchy you must predict up front, and requirements don't cooperate:

\`\`\`ts
// ✗ Combinatorial explosion — and "electric" doubles it again.
//   (Not even expressible: JavaScript has single inheritance.)
//   class LargeElectricCarWithTrailer extends ElectricCar extends Car extends Vehicle

// ✓ Capabilities composed at runtime
new Vehicle(Size.LARGE, new Set([Capability.ELECTRIC, Capability.TRAILER]))
\`\`\`

**Inheritance is justified when** there's a genuine, stable "is-a" that satisfies **Liskov** — a subtype usable anywhere the base is, without the caller knowing — *and* you want to share an implementation, not just an interface. Even then I'd keep it to one level.

The heuristics: **"has-a" beats "is-a" whenever the answer isn't obvious**, and **more than two levels of inheritance is a smell**, because by level three nobody can predict which method actually runs.

The Liskov test is the useful discriminator, and the square/rectangle case shows why: a square *is* a rectangle mathematically, and is *not* a substitutable \`Rectangle\` if \`Rectangle\` promises independent width and height. **"Is-a" in English is not "is-a" in code.**

Two things I'd add for a JS/TS interview specifically. JavaScript is **prototypal**, not classical, and the ecosystem strongly favours composition — functions, closures, hooks. Modelling an LLD problem with plain objects, discriminated unions and closures is a perfectly idiomatic answer here, as long as the responsibilities and seams are just as clear. And in TypeScript, **\`interface\` + composition gives you the polymorphism without the coupling**, which is usually what people actually wanted from inheritance.

---

### Advanced

---

**Q5: Design a notification system supporting email, SMS and push, with user preferences, retries and rate limiting.**

The design is mostly about identifying the **five independent axes of variation**, because that's what determines where the seams go:

\`\`\`
WHAT (content) × HOW (channel) × WHETHER (preferences) × WHEN (scheduling) × RELIABILITY (retry)
\`\`\`

\`\`\`ts
// 1. Channel — the obvious strategy
interface Channel {
  readonly type: ChannelType;
  send(recipient: Recipient, message: RenderedMessage): Promise<SendResult>;
}
class EmailChannel implements Channel {}
class SmsChannel   implements Channel {}
class PushChannel  implements Channel {}

// 2. Content — templates rendered per channel (SMS needs 160 chars, email needs HTML)
interface Template { render(channel: ChannelType, data: unknown): RenderedMessage; }

// 3. Preferences — the policy layer that decides IF and WHERE
interface PreferenceService {
  channelsFor(userId: string, type: NotificationType): ChannelType[];
}

// 4. The orchestrator — depends only on abstractions
class NotificationService {
  constructor(
    private channels: Map<ChannelType, Channel>,
    private prefs: PreferenceService,
    private templates: TemplateRegistry,
    private queue: JobQueue,
    private limiter: RateLimiter,
  ) {}

  async notify(userId: string, type: NotificationType, data: unknown) {
    const channels = await this.prefs.channelsFor(userId, type);   // may be empty
    for (const ch of channels) {
      // ENQUEUE, don't send inline — see below
      await this.queue.enqueue({ userId, type, channel: ch, data,
                                 idempotencyKey: \`\${userId}:\${type}:\${hash(data)}\` });
    }
  }
}
\`\`\`

**The decisions that matter, and the ones I'd lead with:**

**1. Queue, don't send inline.** A notification send is a slow, failure-prone third-party call. Doing it in the request path makes your API's latency and availability depend on Twilio's. Enqueue and return; a worker sends. This is the single most important architectural point and the one candidates most often miss.

**2. Idempotency is essential.** Retries and at-least-once queues mean the same job can be processed twice, and a duplicate SMS is a user-visible defect. An idempotency key derived from (user, type, content) plus a store of recently-sent keys makes redelivery safe.

**3. Retry with exponential back-off *and jitter*.** Without jitter, a provider outage produces a synchronised retry storm when it recovers. And **only retry retryable failures** — a \`500\` or a timeout, never an invalid phone number, which will fail identically forever. Non-retryable failures go to a **dead-letter queue** for inspection rather than being dropped.

**4. Rate limit on two axes.** Per **user** (don't send someone 50 emails because a batch job misfired — this is a real incident shape) and per **provider** (respect their limits, or you get throttled or banned). Token bucket for both.

**5. Preferences include the hard cases**: per-type and per-channel opt-outs, quiet hours in the **user's** timezone, digest-instead-of-immediate, and a **global unsubscribe that legally must be honoured** regardless of type. That last one is a compliance requirement, not a feature, and mentioning it signals product awareness.

**6. Templates render per channel.** The same notification is 160 characters of plain text on SMS, HTML with a footer on email, and a title plus body on push. One template with channel-specific rendering, not three duplicated copies that drift.

**Where I'd extend it if asked:** a \`Decorator\` on \`Channel\` for logging and metrics; \`Observer\` for delivery-status webhooks from providers; a scheduling layer for digests; and a fallback chain (push → SMS if not delivered in 5 minutes), which is a strategy over channels rather than a change to any of them.

**And the failure modes I'd name unprompted**: a provider outage (queue absorbs it, back-off handles recovery), a poison message (dead-letter after N attempts), a template bug producing thousands of wrong notifications (why a canary or a send-rate cap matters), and duplicate delivery (idempotency).


---

## 13. Tricky Questions

---

**Q1: You've designed a \`ParkingLot\` class with \`park()\`, \`calculateFee()\`, \`processPayment()\` and \`sendReceipt()\`. The interviewer says "now we support monthly subscribers who don't pay per visit." What breaks, and what should the design have been?**

**Answer:** Everything, because pricing is welded into the orchestrator. A subscriber isn't a pricing tweak — it changes whether payment happens at all — so with fees and payment inside \`ParkingLot\`, you're editing the class that also handles parking.

**Explanation:**

The original design has **four reasons to change** in one class: parking rules, pricing rules, payment provider, and notification channel. A change to any one of them touches the same file, and they'll conflict.

Concretely, "monthly subscriber" forces you to add conditionals to \`calculateFee\` **and** \`processPayment\` **and** probably \`park\` (to check the pass is valid), so a single requirement fans out into three methods:

\`\`\`ts
// The shape this degenerates into
class ParkingLot {
  processPayment(ticket) {
    if (ticket.vehicle.hasSubscription) { /* skip */ }
    else if (ticket.isValidated) { /* discount */ }
    else if (isWeekend) { /* surcharge */ }
    // …and every future requirement adds another branch, in every method
  }
}
\`\`\`

**What it should have been** — seams at the axes of variation:

\`\`\`ts
interface FeeStrategy    { calculate(ticket: Ticket, exit: Date): Money; }
interface PaymentMethod  { pay(amount: Money): PaymentResult; }
interface Notifier       { send(receipt: Receipt): void; }

class ParkingLot {
  constructor(
    private allocator: SpotAllocator,
    private feeResolver: (t: Ticket) => FeeStrategy,   // ← resolve per ticket
    private tickets: TicketRepository,
  ) {}
  park(v: Vehicle): Ticket { /* allocation only */ }
}
\`\`\`

Now a subscriber is a **new class**:

\`\`\`ts
class SubscriptionFee implements FeeStrategy {
  calculate() { return Money.zero(); }        // already paid monthly
}
// And the resolver picks it:
const feeResolver = (t: Ticket) =>
  t.vehicle.subscription?.isActiveOn(t.entryTime)
    ? new SubscriptionFee()
    : new WeekendSurcharge(new HourlyFee(rates));
\`\`\`

\`ParkingLot\` is untouched. That's Open/Closed producing its actual payoff.

**The diagnostic to internalise** — how you'd have spotted this before the interviewer did:

1. **Describe the class in one sentence.** If you need "and", it's more than one class. "\`ParkingLot\` parks vehicles **and** calculates fees **and** takes payments **and** sends receipts."
2. **Ask "what's likely to change?"** during design. Pricing always changes. Payment providers get swapped. Notification channels get added. Parking *rules* rarely change. So the seams go around pricing, payment and notification — not around allocation.
3. **Watch for a conditional chain on a type or flag.** That's the Open/Closed smell, and it's the thing the requirement-change moment punishes.

The broader point: **an LLD round is graded on the mid-interview requirement change**, so the design work is anticipating *which* requirement will change. You don't need to predict the specific feature — you need to notice that pricing is a variation axis and put an interface there.

**Takeaway:** a class you can't describe in one sentence without "and" has too many reasons to change — put interfaces at the axes of variation you expect (pricing, payment, notification), so a new requirement becomes a new class rather than another branch in three methods.

---

**Q2: Your rate limiter passes every test. In production with 4 server instances, clients get 4× their limit. Then you move the state to Redis and clients still occasionally exceed it. What are the two bugs?**

**Answer:** First, per-instance in-memory state means each instance enforces the limit independently. Second, moving to Redis doesn't help if the read-modify-write isn't **atomic** — it's a lost-update race.

**Explanation:**

**Bug 1 — the state was local.**

\`\`\`ts
class TokenBucketLimiter {
  private buckets = new Map<string, Bucket>();   // ← per PROCESS
}
\`\`\`

With 4 instances behind a load balancer, a client's requests are distributed across them, and each instance sees roughly a quarter of the traffic while enforcing the full limit. Effective limit: 4×. It gets worse with autoscaling, because the multiplier changes with your replica count — so the limit silently loosens under exactly the load you were protecting against.

(An adjacent partial fix people propose is sticky sessions so a client always hits one instance. It "works" and it's fragile: it breaks on rescale, unbalances load, and fails entirely for clients behind a shared NAT.)

**Bug 2 — the Redis operation wasn't atomic.**

\`\`\`ts
// ✗ Two requests can interleave between GET and SET — classic lost update
const tokens = await redis.get(key);
if (tokens > 0) await redis.set(key, tokens - 1);
\`\`\`

Two concurrent requests both read \`1\`, both decide they're allowed, both write \`0\`. Two requests were permitted where one should have been. This is exactly the read-modify-write race from the SQL guide, and the fix is the same principle — **make the check and the mutation one operation**:

\`\`\`lua
-- Atomic in Redis: the whole script runs without interleaving
local tokens = tonumber(redis.call('GET', KEYS[1]) or ARGV[1])
if tokens >= 1 then
  redis.call('SET', KEYS[1], tokens - 1, 'PX', ARGV[2])
  return 1
end
return 0
\`\`\`

Or, for a fixed window, the built-in atomic primitive:

\`\`\`ts
async function run() {
  const count = await redis.incr(key);            // atomic
  if (count === 1) await redis.expire(key, windowSec);
  return count <= limit;
}
\`\`\`

**The remaining subtlety worth volunteering**, because it's the one nobody mentions: even with atomic Redis operations, \`INCR\` then \`EXPIRE\` as two commands has a window where a crash between them leaves a key with **no TTL** — permanently blocking that client. Use \`SET key val EX n NX\`, a Lua script, or a pipeline/\`MULTI\` so both happen together.

**And the operational questions** the design now raises:

- **Latency**: every request costs a Redis round trip. A local token bucket sized at \`limit / instanceCount\` as a fast pre-filter, with Redis as the authority, is the usual compromise.
- **Fail open or closed** when Redis is unavailable? Login endpoint: closed. Read API: open. No universal answer; naming the choice is the point.
- **Redis is now a single point of failure** for every request. That's a real availability trade for a correctness gain.

**Takeaway:** rate limiting is only correct with shared state *and* atomic check-and-mutate — per-instance memory multiplies the limit by your replica count, and \`GET\`-then-\`SET\` on Redis is a lost-update race, so use a Lua script or \`INCR\`+\`EXPIRE\` set atomically.

---

**Q3: Your \`Square extends Rectangle\` code compiles, all its own tests pass, and it breaks a caller that worked fine with \`Rectangle\`. Why is this a design error rather than a bug?**

**Answer:** It violates the **Liskov Substitution Principle** — \`Square\` is not usable everywhere \`Rectangle\` is, because it silently strengthens a precondition the caller relied on. The class is correct in isolation and wrong as a subtype.

**Explanation:**

\`\`\`ts
class Rectangle {
  constructor(protected w: number, protected h: number) {}
  setWidth(w: number)  { this.w = w; }
  setHeight(h: number) { this.h = h; }
  area() { return this.w * this.h; }
}

class Square extends Rectangle {
  setWidth(w: number)  { this.w = this.h = w; }   // must stay square
  setHeight(h: number) { this.w = this.h = h; }
}

function resizeAndCheck(r: Rectangle) {
  r.setWidth(5);
  r.setHeight(4);
  console.assert(r.area() === 20);   // holds for Rectangle, FAILS for Square (16)
}
\`\`\`

Nothing here is a coding mistake. \`Square\` correctly maintains its own invariant, and its own unit tests pass. The error is in the **type relationship**: \`Rectangle\`'s implicit contract is that width and height are **independent**, and \`Square\` cannot honour that. So \`Square\` is not a subtype of \`Rectangle\` in the substitutability sense, whatever geometry says.

**The generalisable rule: "is-a" in English is not "is-a" in code.** Subtyping is about **substitutable behaviour**, not about taxonomy. A square is a rectangle; a mutable \`Square\` is not a mutable \`Rectangle\`.

**The tells that a hierarchy violates Liskov**, which is the reusable part:

| Tell | Example |
|---|---|
| A subclass **throws** on an inherited method | \`ReadOnlyList.add()\` → \`throw new Error('unsupported')\` |
| A subclass **narrows** accepted input | base takes any number, subclass rejects negatives |
| A subclass **strengthens a precondition** | \`Square.setWidth\` requires you not to care about height |
| A subclass **weakens a postcondition** | base guarantees a sorted result, subclass doesn't |
| Callers need \`instanceof\` to behave correctly | the type system has stopped helping |

**The fixes**, and which you choose says something about your judgement:

1. **Make it immutable.** With no setters there's no way to violate the contract — \`withWidth()\` returns a new instance. This resolves the whole class of problem and is why immutable value objects are so common in well-designed domains.
2. **Don't inherit.** A common \`Shape\` interface with \`area()\`, and \`Square\` and \`Rectangle\` as independent implementations. No false substitutability claim.
3. **Compose.** \`Square\` *has a* \`Rectangle\` internally and exposes only \`setSide()\`.

Option 1 is usually best, and it generalises: **most LSP violations are really mutability problems.** The contract that breaks is almost always about *how state can change*, so removing the ability to mutate removes the contract to violate.

**Takeaway:** Liskov is about substitutable behaviour, not taxonomy — a subclass that throws, narrows an input, strengthens a precondition or forces callers to use \`instanceof\` is a design error, and the usual fix is immutability or composition rather than a cleverer override.

---

## 14. Cheat Sheet

\`\`\`
THE ROUND
 1. Graded on: requirement clarification · decomposition · EXTENSIBILITY · communication.
 2. THE MID-INTERVIEW REQUIREMENT CHANGE IS THE EXAM. A design where it means
    "add a class" passes; "edit five if-chains" does not.
 3. NOT tested: all 23 GoF patterns, compilable code, distributed systems.
    Talking about sharding means you've drifted into the wrong interview.

THE METHOD
 4. CLARIFY for 2-3 minutes: scope · scale · actors · core operations · what's OUT.
    Then STATE YOUR ASSUMPTIONS. Highest-value two minutes of the round.
 5. NOUNS → candidate classes. VERBS → methods. A verb belonging to no noun means
    a class is MISSING ("calculate the fee" → FeeStrategy).
 6. One reason to change per class. TEST: describe it in one sentence WITHOUT "and".
 7. DEFINE INTERFACES BEFORE IMPLEMENTATIONS, at the axes of variation.
    This is where you win the requirement-change moment.
 8. Sketch a diagram, then write only the INTERESTING code. Skip the getters.
 9. Walk a scenario, then ATTACK YOUR OWN DESIGN. Volunteering a weakness beats
    having it found.

SOLID (what each one buys)
10. S — one reason to change. The one-sentence test.
11. O — THE ONE THAT GETS TESTED. Violation smell: an if/switch chain on a type
    field, repeated in several methods. Fix: strategy interface + registry.
12. L — substitutable behaviour, NOT taxonomy. "Is-a" in English ≠ "is-a" in code.
    Tells: throws on an inherited method · narrows input · strengthens a
    precondition · callers need instanceof.
13. I — don't force implementers to depend on unused methods. Tell: implementations
    full of "not supported".
14. D — inject dependencies, don't construct them. THE PAYOFF IS TESTABILITY:
    if a class is hard to test, it usually constructs its own dependencies.
15. SOLID is heuristics for managing CHANGE, not laws. Ask "what will change here?"
    and put the seam there. Five principles on a two-variant problem is indirection
    with no payoff.

COMPOSITION
16. Composition by DEFAULT. Inheritance couples you to a hierarchy you must predict.
17. Inheritance only for a stable "is-a" that satisfies LISKOV and shares an
    IMPLEMENTATION. Keep it to one level.
18. "Has-a" beats "is-a" whenever the answer isn't obvious.
    >2 levels of inheritance = a smell (nobody can predict which method runs).
19. Most LSP violations are really MUTABILITY problems → immutable value objects
    resolve the whole class.
20. JS is prototypal; plain objects + closures + discriminated unions is an
    idiomatic answer here, if the responsibilities and seams are just as clear.

PATTERNS THAT ACTUALLY COME UP
21. STRATEGY — interchangeable variants of one behaviour (pricing, allocation,
    eviction, rate-limit algorithm). Highest value.
22. STATE — behaviour depends on a mode WITH LEGAL TRANSITIONS (vending machine,
    elevator, order lifecycle). Makes illegal transitions inexpressible.
23. FACTORY (creation in one place) · OBSERVER (one → N notifications) ·
    COMMAND (queue/log/retry/undo) · DECORATOR (layer optional behaviour) ·
    REPOSITORY (hide persistence, testable with an in-memory fake) ·
    BUILDER (many optional params).
24. SINGLETON: naming it is fine, DEFAULTING to it is not. It's global mutable
    state — harder to test, hides dependencies, concurrency problems. Prefer an
    injected single instance.

WORKED-DESIGN KEY INSIGHTS
25. PARKING LOT: seams at FeeStrategy / SpotAllocator / PaymentMethod /
    TicketRepository. \`spot.fits(vehicle)\` = size >= AND has every needed capability.
    Vacate the spot only AFTER payment succeeds.
26. RATE LIMITER: fixed window has a 2x BOUNDARY BURST. Sliding log is exact but
    O(limit) memory. TOKEN BUCKET is the production default — bursts by design,
    LAZY refill (no timer). INJECT THE CLOCK or you can't test it without sleep.
27. ELEVATOR: two request kinds (hall call = floor+direction, car call = destination).
    SCAN algorithm via two sorted sets (upStops / downStops). Dispatch is the seam.
28. VENDING MACHINE: State pattern. Without it, every method grows the same
    conditional thicket and each new mode multiplies them.
29. NOTIFICATIONS: QUEUE, DON'T SEND INLINE (or your API's availability becomes
    Twilio's). Idempotency key (retries + at-least-once = duplicates). Back-off
    WITH JITTER. Retry only retryable failures; dead-letter the rest. Rate limit
    per USER and per PROVIDER. Global unsubscribe is a legal requirement.

CONCURRENCY
30. Check-then-act is a race. Make the claim ATOMIC inside the entity
    (tryOccupy returns bool), or push arbitration to the store (conditional UPDATE,
    UNIQUE constraint, SETNX).
31. JS-SPECIFIC: single-threaded means no preemption BETWEEN STATEMENTS — but
    \`await\` IS a yield point, so races live across await boundaries.
32. Distributed rate limiting needs shared state AND atomic check-and-mutate
    (Lua or INCR+EXPIRE). Per-instance memory = limit × replica count.
33. INCR then EXPIRE as two commands leaves a TTL-less key on a crash → block
    forever. Set both atomically.
34. Prefer one atomic operation to a lock · hold locks briefly · acquire multiple
    locks in a CONSISTENT ORDER · let the store enforce the invariant.
35. Decide FAIL OPEN vs FAIL CLOSED explicitly. Login → closed. Read API → open.

MISTAKES
36. Coding before clarifying.
37. A god class (ParkingLotManager doing everything).
38. The opposite: anaemic data classes + a service with all the logic = procedural
    code in class clothing. \`spot.fits(vehicle)\` belongs on Spot.
39. Primitive obsession: \`number\` for money (floating-point currency bugs are real),
    \`string\` for IDs and states. Use a Money type and enums.
40. Deep inheritance as the extension mechanism.
41. Over-engineering: six patterns for two variants. Design for the extension points
    the requirements IMPLY.
42. Ignoring failure modes: lot full, payment declined, lost ticket, provider down.
43. Never mentioning concurrency, testing or persistence boundaries.
44. SILENCE. An unexplained diagram scores far worse than a narrated trade-off.
\`\`\`

---

## 15. References

- [Refactoring Guru — Design Patterns](https://refactoring.guru/design-patterns) — the clearest pattern catalogue, with the "when to use" framing that matters here
- [Refactoring Guru — Code Smells](https://refactoring.guru/refactoring/smells) — the smells that signal a missing abstraction
- *Clean Code* and *Clean Architecture* — Robert C. Martin; the source of the SOLID framing (read critically)
- *Design Patterns* — Gamma, Helm, Johnson, Vlissides; the original GoF catalogue
- *Refactoring* — Martin Fowler; the definitive treatment of improving a design incrementally
- *Domain-Driven Design* — Eric Evans, or *Implementing DDD* by Vernon for the practical version — entities, value objects, aggregates
- [Martin Fowler — Anemic Domain Model](https://martinfowler.com/bliki/AnemicDomainModel.html) — the mistake in §11
- [Liskov Substitution Principle — the original paper framing](https://en.wikipedia.org/wiki/Liskov_substitution_principle)
- [Stripe — Designing robust and predictable APIs with idempotency](https://stripe.com/blog/idempotency) — the reasoning behind idempotency keys
- [Cloudflare — How we built rate limiting](https://blog.cloudflare.com/counting-things-a-lot-of-different-things/) — the sliding-window-counter approach in production
- [awesome-low-level-design](https://github.com/ashishps1/awesome-low-level-design) — a large set of practice problems with worked solutions
- [Grokking the Object Oriented Design Interview](https://www.designgurus.io/course/grokking-the-object-oriented-design-interview) — structured practice in this exact format
`;export{e as default};
