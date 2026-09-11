# Microservices — Complete Guide

A microservice is a small, independently-deployable service that owns one bounded slice of a system. Microservices are a *consequence* of organizational and operational pressure, not a goal in themselves — most systems start as monoliths and become microservices when scaling concerns force the split.

This guide is the engineering view: what microservices solve, what they cost, the patterns that make them work, the failures that take them down, and the questions interviewers actually probe. It's deliberately non-zealous — many "microservices are bad" arguments are correct, and so are many "monoliths are bad" arguments. The answer depends on team size, deployment frequency, and traffic patterns.

## Table of Contents

- [1. Why Microservices?](#1-why-microservices)
- [2. Monolith vs Microservice vs "Modular Monolith"](#2-monolith-vs-microservice-vs-modular-monolith)
- [3. Service Boundaries — Where to Cut](#3-service-boundaries-where-to-cut)
- [4. Communication: Sync vs Async](#4-communication-sync-vs-async)
- [5. API Gateway](#5-api-gateway)
- [6. Service Discovery](#6-service-discovery)
- [7. Data Ownership and Distributed Transactions](#7-data-ownership-and-distributed-transactions)
- [8. Sagas and the Outbox Pattern](#8-sagas-and-the-outbox-pattern)
- [9. Resilience — Circuit Breakers, Retries, Timeouts](#9-resilience-circuit-breakers-retries-timeouts)
- [10. Observability — Logs, Metrics, Traces](#10-observability-logs-metrics-traces)
- [11. Authentication & Authorization Across Services](#11-authentication-authorization-across-services)
- [12. Deployment Strategies](#12-deployment-strategies)
- [13. Anti-Patterns (the Distributed Monolith)](#13-anti-patterns-the-distributed-monolith)
- [14. When to Choose Microservices (and When Not To)](#14-when-to-choose-microservices-and-when-not-to)
- [15. Interview Questions & Answers](#15-interview-questions-answers)
- [16. Tricky Questions](#16-tricky-questions)
- [References](#references)

---

## 1. Why Microservices?

Microservices solve problems that monoliths struggle with as a system and team grow:

| Problem | How microservices help |
|---|---|
| **Deploy cadence** — one team's bug fix blocks 200 engineers from shipping | Each service deploys independently. Team A ships hourly without Team B's approval. |
| **Scaling cost** — checkout service is CPU-bound, but you scale the whole app | Scale only the bottleneck service. Run 50 checkout instances and 2 of everything else. |
| **Technology choice** — the whole monolith is locked to one language | Different services can use different stacks (a Python ML service alongside a Go API). |
| **Fault isolation** — a memory leak in one feature crashes the whole app | A crash in service A doesn't crash service B. Blast radius is bounded. |
| **Team autonomy** — 500 engineers in one codebase = constant merge conflicts | Each team owns a service; merge conflicts and code review scale linearly. |

**The trade-off:** you swap "easy local development, hard scaling" for "easy scaling, hard distributed systems." Most startups should NOT start with microservices — they don't yet have the problems microservices solve, and they get hit by every distributed-systems cost.

Conway's Law lurks underneath: an organization that ships a single product through 200 engineers will produce a system that looks like 200 engineers communicating. Microservices align the system architecture with the org chart.

---

## 2. Monolith vs Microservice vs "Modular Monolith"

There are really three points on a spectrum, not two.

| Property | Monolith | Modular Monolith | Microservices |
|---|---|---|---|
| **Deploy unit** | One binary | One binary | N binaries |
| **Database** | One DB, shared schemas | One DB, isolated schemas/modules | N DBs, one per service |
| **In-process calls** | Yes (cheap) | Yes (cheap) | No (network = expensive) |
| **Team size sweet spot** | 1–20 engineers | 20–100 | 100+ |
| **Initial complexity** | Low | Low–medium | High |
| **Scales operationally** | Hard | Medium | Built for it |

**Modular Monolith** is the underrated middle path. A single deployable, but internally split into modules with clean interfaces and isolated data ownership (even within one DB — e.g., one schema per module, no cross-schema queries). When a module needs to become its own service, the boundaries are already drawn — extraction is mechanical.

Shopify, GitHub, and Stack Overflow ran/run as modular monoliths at enormous scale. The microservices argument is real but oversold.

---

## 3. Service Boundaries — Where to Cut

This is the hardest microservices question. Cut wrong and you create a "distributed monolith" — services that can't deploy independently because every change touches three of them.

Three principles:

### 1. Bounded contexts (DDD)

A bounded context is a piece of business logic with its own internal language. "Order" in the shopping context means a cart with line items; "Order" in the warehouse context means a fulfillment manifest. These are different concepts that share a word. They should be different services with different data models.

Domain-Driven Design's exercise: list the nouns the business uses. Group them by which conversations they appear in together. Services align with those groups.

### 2. Data ownership

Each service should own its data. No "ProductService reads the orders table directly." If Service B needs data Service A owns, B asks A via an API. This is non-negotiable — once you cross it, the services are coupled at the schema level, and any DB migration in A affects B.

### 3. Cohesion > size

"Microservice" is a misleading name. Some services are tiny (auth: 200 LOC). Some are large (search: 50k LOC). What matters is internal cohesion — does the service do ONE thing well? — not size.

**Anti-pattern: "nanoservices."** Splitting a service "because it might need to scale separately" before the scale problem exists creates a distributed network of services that all coordinate to do anything. You pay the network and serialization cost for no benefit.

---

## 4. Communication: Sync vs Async

Two services can talk to each other two ways. Both have a place.

### Synchronous (HTTP/REST, gRPC)

Service A calls Service B and waits for a response. The simplest model. Trade-off: A is now coupled to B's availability and latency.

```js
async function run() {
  // Service A
  const user = await fetch(`http://user-service/users/${id}`).then(r => r.json());
  const orders = await fetch(`http://order-service/users/${id}/orders`).then(r => r.json());
  return { user, orders };
}
```

**Failures cascade.** If user-service is down, A's response fails. If user-service is slow, A is slow. This is why circuit breakers and timeouts exist (§9).

**gRPC** is a popular alternative: binary protocol, schema-defined, supports streaming and bidirectional communication. Faster than JSON-over-HTTP for service-to-service.

### Asynchronous (message queue, event stream)

Service A emits an event. Other services subscribe to events they care about. A doesn't know who's listening or care.

```js
// Service A (order service)
await db.transaction(async tx => {
  await tx.orders.insert(order);
  await tx.outbox.insert({
    event: 'OrderCreated',
    payload: order,
    publishedAt: null
  });
});
// A separate process drains outbox → publishes to Kafka

// Service B (email service)
kafka.subscribe('OrderCreated', async (event) => {
  await sendConfirmationEmail(event.order);
});
```

**Decoupling.** B can be down for an hour; messages queue up; B catches up when it returns. A doesn't know B exists.

**Trade-offs:**
- Eventual consistency (B sees the order moments after A commits it).
- Harder to debug (the call graph is implicit in the topic subscriptions, not explicit in code).
- Operational complexity (Kafka/RabbitMQ/SQS is its own beast).

**Rule of thumb:** use **sync** for "B's response is needed to complete A's work" (read sides, request/response). Use **async** for "B should know X happened" (cross-service notifications, fan-out).

---

## 5. API Gateway

The gateway is the single entry point that the outside world (web, mobile, partner integrations) hits. It routes requests to backend services and centralizes cross-cutting concerns.

Responsibilities:
- **Routing:** `/users/*` → user-service, `/orders/*` → order-service.
- **Authentication:** validate JWTs once at the edge, attach a user-id header to downstream calls.
- **Rate limiting:** per-IP, per-user, per-API-key.
- **Request/response transformation:** strip internal headers, version negotiation, optional response aggregation.
- **Observability:** standardized access logs at the edge.

Common implementations: AWS API Gateway, Kong, Envoy, nginx, Traefik, plus cloud provider equivalents.

**BFF (Backend for Frontend) variant.** Sometimes you want a gateway PER client type — one for web, one for mobile, one for partners — because each has different needs (mobile wants a denormalized response; web wants chatty individual calls). The BFF gateway sits between the public internet and the internal services, aggregating per client.

**Anti-pattern: business logic in the gateway.** The gateway is for cross-cutting concerns and routing. The moment it starts doing "if order is canceled, refund the customer," you've made it a god service.

---

## 6. Service Discovery

Service A needs to call Service B. Where is B?

Options:

### DNS-based (simplest)

Each service has a hostname; DNS resolves it. Kubernetes uses this — every service named `order-service` is reachable at `http://order-service.namespace.svc.cluster.local`. Service A doesn't track instances; the DNS + load balancer handles it.

### Client-side discovery

Services register themselves on startup with a registry (Consul, etcd, Eureka). Clients query the registry. The client picks an instance and connects directly. Lower latency (no proxy), but every service needs a client library.

### Server-side discovery

A load balancer in front of the service does the registry lookup. Clients call the LB. Simpler clients but adds a hop.

### Service mesh

Istio, Linkerd. Sidecars (a proxy alongside each service container) handle discovery, retries, mTLS, observability. The service code is oblivious to networking concerns. Powerful, complex, expensive to operate.

For most teams: Kubernetes' built-in DNS discovery is enough. Consider a service mesh only when you have specific cross-cutting concerns (mTLS everywhere, traffic shifting for canary deploys) that justify the overhead.

---

## 7. Data Ownership and Distributed Transactions

The single biggest source of pain in microservices is data.

**The rule:** each service owns its data. Other services CANNOT query that data directly — they ask via the owning service's API.

This means: **no distributed transactions over operational data.** You can't `BEGIN TRANSACTION; UPDATE user_service.users; UPDATE order_service.orders; COMMIT;`. Each service has its own DB; there's no shared transaction manager.

### What this looks like in practice

Old monolith:
```sql
BEGIN;
INSERT INTO orders (...) VALUES (...);
UPDATE inventory SET qty = qty - 1 WHERE sku = ...;
INSERT INTO payments (...) VALUES (...);
COMMIT;
```

Microservices:
```
1. order-service creates order with status: PENDING
2. inventory-service reserves the item
3. payment-service charges the card
4. order-service marks the order CONFIRMED
```

Any of those steps can fail. There's no rollback across services. You need a SAGA (§8).

### Read-side patterns

When Service A needs data Service B owns:

1. **Synchronous API call** at read time — simplest, but couples availability.
2. **Replicate data via events** — A subscribes to B's events and maintains its own copy. Reads become local and fast; consistency is eventual.
3. **CQRS with materialized views** — denormalize for read; the query side may pull from multiple services' event streams.

---

## 8. Sagas and the Outbox Pattern

### Sagas

A saga is a sequence of local transactions across services that together represent a business workflow. Each step has a **compensating action** that "undoes" it if a later step fails.

Example: place order
1. **order-service** creates order PENDING. Compensation: cancel order.
2. **inventory-service** reserves stock. Compensation: release stock.
3. **payment-service** charges card. Compensation: refund.
4. **order-service** marks CONFIRMED.

If step 3 fails, you run compensations for steps 2 and 1 (release stock, cancel order).

Two flavors:

**Choreography:** each service publishes events; other services react. Decentralized, but the workflow is implicit — you have to read every service to see "what's the flow?"

**Orchestration:** a dedicated saga coordinator drives the workflow. Explicit, but introduces a god component.

Most production sagas are orchestrated (Temporal, Camunda, AWS Step Functions). Choreography is fine for simple workflows but becomes unmaintainable past 3–4 steps.

### The Outbox Pattern

A subtle but critical pattern. The problem:

```js
await db.transaction(async tx => {
  await tx.orders.insert(order);   // commits to DB
});
await kafka.publish('OrderCreated', order);   // ❌ what if this fails AFTER commit?
```

If the publish fails after the DB commit, you have an order with no event. Other services never know about it.

Reversing the order is worse — publish before commit, then the commit fails, and you've broadcast an order that doesn't exist.

**Solution:** the outbox table.

```sql
BEGIN;
INSERT INTO orders (...);
INSERT INTO outbox (event_type, payload, published_at) VALUES ('OrderCreated', '{...}', NULL);
COMMIT;
```

A separate process polls the `outbox` table, publishes unpublished events, marks them published. Now:

- Order insert + outbox insert are atomic.
- The publish is retryable until it succeeds.
- The system can crash between commit and publish without losing the event.

This is the canonical fix for "events lost during failures." Every serious microservice that publishes events should use the outbox pattern.

---

## 9. Resilience — Circuit Breakers, Retries, Timeouts

Network calls fail. Services go slow. Without defensive patterns, one slow service brings down its callers.

### Timeouts

Every network call must have a timeout. The default `fetch` in many runtimes has none — it can wait forever. Wrap with `AbortController`:

```js
const ctl = new AbortController();
const timer = setTimeout(() => ctl.abort(), 5000);
try {
  const res = await fetch('http://upstream/data', { signal: ctl.signal });
} finally {
  clearTimeout(timer);
}
```

Timeout values: usually 1–5 seconds for read APIs, longer for known-slow operations.

### Retries with backoff

Transient failures (network blip, brief overload) deserve a retry. Permanent failures (404, validation error) don't.

```js
async function callWithRetry(url, opts, retries = 3) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, opts);
      if (res.ok) return res;
      if (res.status >= 400 && res.status < 500) return res;   // don't retry 4xx
      lastError = new Error(`HTTP ${res.status}`);
    } catch (e) { lastError = e; }
    if (i < retries) {
      const delay = 100 * Math.pow(2, i) + Math.random() * 100;   // exp backoff + jitter
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}
```

**Always use jitter.** Without it, every failing client retries at exactly the same moment after the same delay — a thundering herd.

### Circuit breaker

When a downstream is failing consistently, retries make it WORSE (more load on a struggling service). The circuit breaker pattern fixes this:

```
[CLOSED] → service healthy, requests flow through.
   │
   ▼ (failure rate exceeds threshold)
[OPEN] → all requests fail FAST, no traffic to upstream.
   │
   ▼ (after cooldown period)
[HALF-OPEN] → let a few requests through. Did they succeed?
   ↘ YES → back to CLOSED
   ↘ NO → back to OPEN
```

Libraries: `opossum` for Node, Hystrix (legacy Java), Polly (.NET), Resilience4j (Java).

Combined with timeouts and retries, the breaker prevents cascading failure: when payment-service is overloaded, the breaker trips, order-service fails fast for new payment calls, the user gets an error in 50ms instead of waiting 5s for a timeout.

---

## 10. Observability — Logs, Metrics, Traces

In a monolith, you can throw a stack trace and read the whole call. In microservices, a single user request might touch 8 services and 3 databases. You can't debug what you can't see.

The "three pillars" of observability:

### Logs

Per-service structured logs. Use a logging library that writes JSON: timestamp, level, service name, request id, message.

**Correlation:** every request gets a `request_id` (or `trace_id`). The gateway generates it; every downstream call propagates it as an HTTP header. Logs from every service for that request can be filtered by the id.

```js
// Express middleware to propagate trace ID
app.use((req, res, next) => {
  req.traceId = req.headers['x-trace-id'] || crypto.randomUUID();
  res.setHeader('x-trace-id', req.traceId);
  next();
});

// Inside the handler
logger.info({ traceId: req.traceId, userId, action: 'order.created' });
```

### Metrics

Counters and histograms aggregated over time. Prometheus is the de facto standard. Standard metrics every service should emit:

- **RED metrics:** Rate (requests/sec), Errors (% failing), Duration (p50/p95/p99 latency).
- **USE metrics for infrastructure:** Utilization, Saturation, Errors.

Dashboards: Grafana. Alerting: Alertmanager or PagerDuty integrations.

### Traces

A single user request becomes a "trace" — a tree of spans (one per service hop). You can see "this request took 1200ms; payment-service took 800ms of that; inside payment-service, the Stripe call was 600ms."

Standard: **OpenTelemetry** (OTel). It's the cross-language SDK for emitting traces; backends include Jaeger, Tempo, AWS X-Ray, Datadog APM.

Without traces, you'll spend hours guessing which service slowed down a request. With them, you click and see.

---

## 11. Authentication & Authorization Across Services

How does service B know who the user is when service A calls it?

### Token propagation

The user authenticated to the gateway → got a JWT. The gateway validates the JWT once, passes it (or a derived identity header) to downstream services. Each downstream service validates the JWT signature locally (it's stateless; no DB lookup needed).

```
[User] → [Gateway: validate JWT, get user_id]
            → [order-service: trust user_id from gateway header]
                → [inventory-service: same]
```

### Service-to-service authentication

Service A calls Service B. How does B know it's a legitimate caller and not someone who found the URL?

**mTLS (mutual TLS):** every service has a certificate. The TLS handshake verifies both sides. Standard in service meshes (Istio, Linkerd).

**Service tokens:** each service has a credential (often a JWT signed for service-to-service use). A includes it in the call to B. B validates it.

**Network policies:** at the Kubernetes / firewall level, restrict which services can talk to which. Doesn't authenticate WHO is calling, but prevents external access.

In practice, most production systems combine: network policies for blast-radius limiting, mTLS or service tokens for authentication, JWT propagation for user identity.

---

## 12. Deployment Strategies

Independent deployability is the headline microservices benefit. To realize it:

### Rolling deploys

The default. Replace instances one at a time with the new version. Zero downtime if requests can route around the deploying instance.

### Blue-green

Run TWO complete environments. Deploy new version to green. Smoke-test. Switch the load balancer from blue to green. Roll back instantly by flipping the LB back.

### Canary

Deploy to a small percentage of traffic. Watch metrics. If errors spike, roll back. Otherwise gradually increase.

### Feature flags

Decouple deploy from release. Ship the code; the feature is dark behind a flag. Enable for 1% of users, then 5%, then everyone. Roll back by flipping the flag, not by redeploying.

**LaunchDarkly, GrowthBook, or homegrown.** Every mature microservice org has feature flags integrated into every service.

### Service versioning

When changing a service's API, support BOTH versions for a transition window:

```
/v1/users  ← still served, old contract
/v2/users  ← new contract
```

Callers migrate at their own pace. Old version retires when nobody calls it.

Never make a breaking change to an in-place API. Always introduce a new version.

---

## 13. Anti-Patterns (the Distributed Monolith)

The microservices "lite" failure mode: you split the monolith into N services, but they're still tightly coupled. Every feature change requires deploying 3 services in lockstep. You have all the costs of microservices and none of the benefits.

Signs you have a distributed monolith:

- **Cross-service transactions.** "We need to update the user DB and the order DB atomically." This means you didn't draw boundaries around data ownership.
- **Shared database.** Two services reading/writing the same table. You don't have services; you have functions in a network address.
- **Synchronous chains 5+ deep.** Service A calls B calls C calls D calls E. Any one being slow degrades the whole chain. Reorganize so A talks to fewer things.
- **Coordinated releases.** "We need to deploy A, B, and C in this order." If you can't deploy independently, you don't have microservices.
- **Frontend that needs 12 API calls to render a page.** Either add a BFF or merge services.

The fix is rarely "add more services." It's almost always "redraw boundaries" or "combine these services into one."

---

## 14. When to Choose Microservices (and When Not To)

### Choose microservices when:

- You have **100+ engineers** who can't ship without stepping on each other.
- You need to **scale a specific bottleneck** independently (one CPU-heavy service in an otherwise IO-bound system).
- You have **legitimate technology heterogeneity** (an ML service that must run Python, a real-time service that must run Go).
- You need **fault isolation** between business-critical pieces (payments can't be killed by a recommendations bug).
- Your **organizational structure** is already team-of-teams, each owning a domain.

### Don't choose microservices when:

- You're a **startup of 5 engineers**. The premature distributed system will slow you down more than a monolith ever could.
- Your team **has never operated a single service** in production. The operational debt of N services is N× higher.
- You **can't articulate the boundaries** without hand-waving. Wrong boundaries are far more expensive than no boundaries.
- The system **doesn't have a real scale problem**. Cosmetic microservices add complexity without solving anything.

**Rule of thumb:** start as a modular monolith. Extract the first service when one module's deploy cadence diverges from the rest, OR when scaling needs diverge. The first extraction will teach you what's hard; subsequent extractions get easier.

---

## 15. Interview Questions & Answers

### Beginner

**Q1: What's the difference between a monolith and a microservice?**

A monolith is a single application that holds all the business logic and gets deployed as one unit. Microservices split that application into multiple independently-deployable services, each owning a slice of the business domain and its own data.

The trade-off: monoliths are easier to develop locally (one repo, one runtime, in-process calls are free) but harder to scale operationally and organizationally (one deploy blocks everyone). Microservices invert that — harder local development and operations, easier team autonomy and per-service scaling.

Most systems start as monoliths and become microservices when team size or specific scaling needs justify the cost. The "modular monolith" is a popular middle ground.

---

**Q2: What is an API gateway?**

An API gateway is a single entry point that the outside world hits, sitting in front of all your microservices. It handles cross-cutting concerns: routing requests to the right backend service, authentication (validating JWTs once at the edge), rate limiting, request/response transformation, and logging.

Without a gateway, every backend service has to implement auth, rate limiting, CORS, etc. on its own — duplication that creates inconsistency. With a gateway, those concerns live in one place.

Examples: AWS API Gateway, Kong, Envoy, nginx, Traefik. For client-specific aggregation, the "Backend for Frontend" (BFF) is a variation — one gateway per client type (web, mobile).

---

**Q3: What is a circuit breaker?**

A circuit breaker prevents cascading failures when a downstream service is failing. It tracks the failure rate of calls to a service; if the rate crosses a threshold, the breaker "opens" and subsequent calls fail FAST without hitting the broken service.

States: **Closed** (healthy, all traffic flows), **Open** (failing fast, no traffic to upstream), **Half-Open** (after cooldown, let a few probe requests through to test recovery).

Without a breaker, retries amplify the load on a struggling service, making the outage worse and dragging down the caller. With a breaker, the caller fails fast — users get an error in 50ms instead of waiting 30s for timeouts.

Libraries: `opossum` (Node), Polly (.NET), Resilience4j (Java).

### Intermediate

**Q4: How do microservices handle distributed transactions?**

They don't. There's no global transaction manager across services with separate databases.

Instead, microservices use the **saga pattern**: a sequence of local transactions across services, each with a compensating action that "undoes" it if a later step fails.

Place-order example:
1. order-service: create order (PENDING)
2. inventory-service: reserve stock
3. payment-service: charge card
4. order-service: confirm order

If step 3 fails, you run compensations for 2 and 1 (release stock, cancel order).

Two flavors of saga:
- **Choreography:** each service publishes events, others react. Decentralized.
- **Orchestration:** a dedicated coordinator drives the workflow (Temporal, Camunda, Step Functions).

Both achieve eventual consistency, not strong consistency. The user might briefly see "order placed, awaiting confirmation."

---

**Q5: What is the outbox pattern and what problem does it solve?**

The outbox pattern solves the "dual write" problem: when a service needs to update its DB AND publish an event, doing them as two separate operations risks one succeeding and the other failing.

Without outbox:
```
db.commit(order);           // succeeds
kafka.publish(orderEvent);  // network fails — event lost forever
```

With outbox:
```sql
BEGIN;
  INSERT INTO orders (...);
  INSERT INTO outbox (event_type, payload, published_at) VALUES ('OrderCreated', ..., NULL);
COMMIT;
```

A separate worker polls the `outbox` table and publishes unpublished events. If the publish fails, the row stays unpublished and is retried later.

The atomic DB write of both the order AND the outbox row is the key: you never have an order without an event, or an event without an order. The publish is retryable until durably delivered.

Every production microservice that publishes events to other services should use this pattern. Skipping it = lost events during failures.

---

**Q6: Sync vs async communication — when do you pick each?**

**Synchronous (HTTP/REST, gRPC):** Service A calls B and waits. Use when:
- A NEEDS B's response to complete its work (read joins).
- The operation is fast and B is reliably available.
- The user is waiting (request/response flows).

Trade-off: A is coupled to B's uptime and latency.

**Asynchronous (queue/event stream):** A emits an event; subscribers react. Use when:
- A wants to NOTIFY others, doesn't need their response.
- The work is naturally background (sending emails, updating analytics).
- You want fault isolation (B can be down for an hour; messages queue up).

Trade-off: eventual consistency; debugging is harder (the call graph is implicit).

**Rule of thumb:** sync for read-side fan-in (A needs B's data to render a response). Async for write-side fan-out (A did something; let everyone interested know).

---

**Q7: How do you decide where to draw service boundaries?**

Three intersecting principles:

1. **Bounded contexts (DDD).** Each service should map to a part of the business with its own vocabulary. "Order" in shopping ≠ "Order" in fulfillment — they're different concepts and should be different services.

2. **Data ownership.** Each service owns its data. Other services can't read the DB directly; they ask via API. The boundary is where data ownership cleanly splits.

3. **Independent deployability.** If feature X always requires deploying services A AND B together, A and B are really one service split apart. Combine them.

**Test:** can a team make a change to their service and ship it without coordination with other teams? If yes, the boundary works. If every change needs cross-team approval, the boundary is wrong.

When in doubt, **make the service larger, not smaller**. Wrong-but-large boundaries are easier to refine later than wrong-but-tiny boundaries (which need to be merged).

### Advanced

**Q8: How do you handle authentication across microservices?**

**At the edge (gateway):**
- Gateway validates the JWT once.
- Extracts user_id from the JWT.
- Forwards to downstream services with the JWT (or a signed identity header).

**Per service:**
- Each downstream service validates the JWT signature locally (stateless, no DB).
- Reads user_id from the JWT.
- Performs authorization based on roles/scopes in the JWT.

**Service-to-service (no user):**
- Each service has its own credential (a service-to-service JWT, signed by an internal CA).
- Alternative: mTLS — every service has a certificate; mutual TLS handshake authenticates both sides. Common in service meshes (Istio).
- Combine with network policies: even if a token is stolen, Kubernetes NetworkPolicies can prevent service A from reaching service C directly.

The "zero-trust" model: every service request is authenticated, regardless of network position. No "internal network = trusted."

---

**Q9: What is the difference between choreography and orchestration in sagas?**

**Choreography:** decentralized. Each service publishes events; other services subscribe to events they care about.

```
order-service → emits OrderCreated
                          ↓
                inventory-service reacts, emits ItemReserved
                          ↓
                payment-service reacts, emits PaymentCharged
                          ↓
                order-service reacts, marks order Confirmed
```

Pros: no central coordinator, services are loosely coupled, easy to add new subscribers.
Cons: the workflow is implicit — you can't read code to understand the flow; you have to trace events across services. Hard to debug. Hard to add a new step that depends on multiple prior steps.

**Orchestration:** centralized. A "saga coordinator" drives the workflow, calling each service in order and handling compensations.

```
saga-coordinator:
  call order-service.create()
  call inventory-service.reserve()
  call payment-service.charge()
  call order-service.confirm()
  on failure → run compensations in reverse
```

Pros: workflow is explicit, easy to read, easy to add steps, easy to handle failures.
Cons: the coordinator becomes a god component; if it's down, the workflow stops.

**Rule:** orchestration scales better with workflow complexity. Beyond 3–4 steps, switch from choreography to orchestration (Temporal, Camunda, AWS Step Functions).

---

**Q10: How do you debug a slow request that touches 8 services?**

**Distributed tracing** is the answer. Without it, you'd be guessing.

Every request gets a `trace_id` at the edge. Every service propagates it (via HTTP headers) to downstream calls. Each service emits a **span** — a timed segment representing its work — and reports it to a tracing backend (Jaeger, Tempo, Datadog APM).

The tracing UI shows the trace as a waterfall:
```
[──── gateway 1200ms ──────────────────────────────────────]
  [── order-service 800ms ─────────────────────]
    [─ db query 50ms ─]
    [── inventory-service 300ms ──]
      [── stripe-api 600ms ──────]   ← obvious culprit
```

You can see at a glance: where time went, which downstream was the bottleneck, whether retries are happening (multiple spans per call), where errors started.

Implementation: **OpenTelemetry (OTel)** is the cross-language standard. Each service runs the OTel SDK; spans are sent to a collector that forwards to your backend.

Without tracing, debugging a slow distributed request can take days. With it, minutes.

---

**Q11: A team wants to migrate from a monolith to microservices. What's a sensible incremental approach?**

The "Strangler Fig" pattern. Don't rewrite the whole monolith at once. Extract one capability at a time.

1. **Stabilize the monolith.** Put a load balancer / gateway in front of it. All traffic still goes to the monolith.

2. **Identify a bounded context to extract.** Pick something with clear boundaries and a clear business need (e.g., "we want to scale checkout independently"). Avoid the temptation to start with shared infrastructure code — start with a vertical slice of the domain.

3. **Build the new service in parallel.** It owns its own DB. Initially, it reads from the monolith's DB (via API or replication) and writes to both.

4. **Migrate writes.** Once the new service is reliable, route writes to it. The monolith still serves reads but is updated by the new service via events.

5. **Migrate reads.** Switch the gateway to route the relevant endpoints to the new service.

6. **Decommission the monolith's version.** Drop the unused code and tables.

7. **Repeat for the next capability.**

Critical: **modularize the monolith first.** If the monolith is a tangled ball of yarn, extraction will pull threads from everywhere. Spend time refactoring the monolith into modules with clean interfaces BEFORE extracting anything.

Typical timeline: 12–24 months for a meaningful migration. Many teams pause partway through and stay hybrid permanently — and that's often the right answer.

---

**Q12: What is a service mesh and when do you need one?**

A **service mesh** is infrastructure that handles cross-cutting concerns for service-to-service communication, deployed as **sidecars** alongside each service container.

Sidecars (typically Envoy proxies) handle:
- Service discovery
- mTLS (mutual TLS between services)
- Retries, timeouts, circuit breaking
- Traffic splitting (canary, A/B test)
- Observability (metrics, traces)

Examples: **Istio, Linkerd, Consul Connect**.

**You need a mesh when:**
- You require mTLS between every pair of services (compliance, zero-trust).
- You want sophisticated traffic management (canary deploys at 5% to specific user cohorts).
- You have many services in many languages and want unified networking concerns out of the application code.

**You don't need a mesh when:**
- You have <20 services. The operational cost of running Istio exceeds its benefits.
- Your services are mostly in one language. Libraries (resilience patterns, OTel SDK) handle the same concerns simpler.
- You're using AWS App Mesh / GCP Service Mesh — these add a managed layer but most teams find them overkill.

The mesh is a 2010s solution to "every service code reimplements networking concerns." For most teams, a good HTTP client library + observability stack + Kubernetes networking is sufficient.

---

## 16. Tricky Questions

**Q1: Your team is celebrating a successful migration from monolith to microservices. Three months later, deploys are slower than ever and on-call is a nightmare. What likely went wrong?**

Several possibilities, all common:

1. **You created a distributed monolith.** The service boundaries don't align with deployment boundaries — every feature change still requires deploying 3+ services in lockstep. You have all the network overhead of microservices and none of the independent-deploy benefit. Fix: re-evaluate boundaries; consider re-merging closely-coupled services.

2. **Insufficient operational tooling.** A team operating 1 service can get away with manual deploys and rough monitoring. A team operating 15 services needs proper CI/CD, distributed tracing, runbooks, on-call rotations. Migrating to microservices without investing in this is migrating into permanent operational pain.

3. **Cross-service transactions everywhere.** You preserved monolith-style "update many things atomically" patterns by making synchronous chains across services. Now any service being slow is a cascading failure. Fix: introduce sagas, event-driven flows.

4. **Team-service mismatch.** If 3 teams share 10 services, the on-call burden is bigger than before. Microservices work when EACH team owns 1–3 services, not when teams share services.

The hard truth: a microservices migration that doesn't also rethink ORG STRUCTURE and OPERATIONAL TOOLING usually makes things worse before better — or worse permanently. Conway's Law isn't optional.

---

**Q2: Your event-publishing service crashes mid-process. Half the events for the order got published, half didn't. How do you make sure consumers see a consistent state?**

This is the classic exactly-once delivery problem. Two interlocking patterns:

1. **Outbox pattern (producer side).** Events are written to an outbox table IN THE SAME DB TRANSACTION as the data change. A separate publisher process reads from outbox and publishes — retryable. If the publisher crashes mid-publish, the unpublished rows stay and are retried.

2. **Idempotent consumers.** Each event has a unique ID. Consumers maintain a "processed IDs" set (often Redis with TTL or a DB table). On receiving an event:
   - If ID already processed: ignore (it's a retry).
   - If new: process and mark processed.

The combination guarantees **at-least-once delivery + idempotent processing = effectively-once outcomes**.

What you CAN'T guarantee without a global transaction manager: that all consumers see the same event at the same time. Eventually consistent. If your business rules require strong consistency across services, you've probably drawn boundaries wrong.

---

**Q3: A junior engineer asks "Why don't we just share the database between services?" What do you say?**

Sharing a database makes services tightly coupled at the worst possible layer: the schema. Specifically:

1. **No independent deployment.** Any schema migration requires coordinating with every team that reads or writes that table. The "deploy a service independently" benefit evaporates.

2. **No clear data ownership.** When two services write the same table, neither owns the schema, and there are no constraints on what changes are safe. You'll see bugs where service A changed the meaning of column X without service B noticing.

3. **No isolation of failures.** A long-running query from service A can lock tables and slow down service B. They're now in the same blast radius.

4. **You can't change databases per service.** Maybe inventory wants a key-value store; analytics wants a column store. Shared DB locks you to one technology forever.

What you CAN share: **caches** (Redis), **message queues** (Kafka, RabbitMQ), **observability stack** (Prometheus, Jaeger). These are infrastructure, not data ownership.

If two services genuinely need the same data, ask "are they really one service?" Often the answer is yes, and you should merge them.

---

**Q4: Your microservice consumes 90% of your AWS bill. Senior engineers say "rewrite as a monolith." Is that a good idea?**

Diagnose before prescribing. The microservice being expensive isn't automatically a microservice problem.

Investigate:
1. **What's the actual cost driver?** Compute, network, storage? "Microservices are expensive" is a vibe; the actual bill has line items.
2. **How does it compare to monolith costs?** If the monolith you'd replace it with also needs 100 instances, you've just moved the same cost. Microservices add overhead (proxies, sidecars, cross-AZ network) but the bulk of the bill is usually doing the actual work.
3. **What scales?** Maybe ONE service is 80% of the cost. Then "rewrite as a monolith" is wrong — "right-size or rewrite that one service" is correct.
4. **What architecture changes would save money?** Spot instances? Caching layer? Async processing instead of synchronous? Often you can recover 30–50% of cost without changing the architecture.

If after that the answer is genuinely "the microservices overhead is 30%+ and we'd save by collapsing," then targeted consolidation makes sense. But "rewrite as a monolith" is rarely the right answer for an established product — the org-level coordination cost dwarfs the infra cost.

---

**Q5: A senior architect insists every service should have its own database, even tiny services with 10 rows. How do you push back?**

Polite push-back:

The "one DB per service" rule is shorthand for "each service owns its data" — meaning no other service should read or write that data directly. It doesn't necessarily mean PHYSICALLY separate DB instances.

In practice, you can satisfy data ownership with:
- **Logical separation.** One Postgres instance, but each service has its own schema, and cross-schema queries are forbidden by team norm (and ideally by DB user permissions).
- **Physical separation.** Each service has its own DB instance.

For tiny services, **logical separation is cheaper, easier to operate, and operationally equivalent**. Running 50 separate Postgres instances for 50 services has real costs: backups, monitoring, scaling, version upgrades.

The architect's concern is real (services must own their data), but the prescription (physical separation always) is dogmatic. Cost-benefit each case:
- Services with high traffic or compliance requirements → physical separation makes sense.
- Tiny internal services → logical schema separation is enough.

Frame the conversation as "what problem is physical separation solving here?" If the answer is "principle," propose logical separation as the cost-aware alternative.

---

**Q6: Your team uses Kubernetes. A new engineer asks "Isn't Kubernetes essentially a service mesh? Why do we also need Istio?"**

Kubernetes provides networking primitives:
- Service discovery via DNS (every Service has a DNS name).
- Load balancing via kube-proxy or LoadBalancer services.
- Network policies (NetworkPolicy) for L3/L4 segmentation.

It does NOT provide:
- mTLS between services (you'd have to configure cert management in every service).
- Application-level retries, timeouts, circuit breaking (each service implements its own).
- Traffic splitting by HTTP header / cookie (canary at 5% to users with a specific cohort).
- Application-level observability (distributed tracing, metrics) out of the box.

**A service mesh (Istio, Linkerd) adds these without requiring app code changes**, via sidecar proxies that intercept all service traffic.

Whether you need it depends on what you're missing. If your services already have good HTTP client libraries with retries + circuit breaking, OpenTelemetry for tracing, and you don't need mTLS or sophisticated traffic management, Kubernetes alone is sufficient.

If you have many services in many languages, need uniform mTLS, want sophisticated canary deploys, or need pervasive observability without modifying every service — Istio's complexity earns its keep.

The trap: organizations adopt Istio because it's fashionable, not because it solves a problem they have. Then they're paying ~10% performance overhead and constant operational headaches for capabilities they never use.

---

**Q7: Your services use eventual consistency. Customer support reports "I placed an order but it shows as not-yet-placed in my account page." How do you explain this to product, and what do you do about it?**

The technical reality:
1. order-service committed the order to its DB.
2. order-service published an OrderCreated event.
3. The user-account-service hasn't consumed the event yet (could be milliseconds, could be seconds).
4. The account page is querying user-account-service, which doesn't know about the order yet.

The user sees a "ghost period" between committing and propagation.

**Tell product:** this is a fundamental trade-off of microservices with eventual consistency. The fix isn't to make the propagation instant (impossible across services with separate DBs); it's to make the UX gracefully handle the gap.

**UX fixes:**

1. **Optimistic UI.** After placing the order, immediately show "Order placed!" with the order ID. Don't fetch from user-account-service for this confirmation; trust the order-service response.

2. **Read-your-own-writes** at the gateway / BFF. When a user just placed an order, the gateway can route their next account-page request to a "fresh" data source (the order-service directly), bypassing the user-account-service's possibly-stale view.

3. **Polling with status indicator.** "Your order is being processed... refreshing in 3s." Smooth out the gap visually.

4. **Tighter event propagation.** Reduce the eventual-consistency window from seconds to <100ms by improving event-pipeline latency.

**Don't try to make it strongly consistent across services.** That defeats the point of having separate services. The product needs to design around eventual consistency; the engineering should make the window short enough that users rarely notice.

---

**Q8: A service mesh slows your p99 latency from 50ms to 90ms. Your team wants to remove it. What questions should you ask before pulling the trigger?**

The mesh isn't free — sidecar proxies intercept every call, adding latency. 50→90ms (80% increase) is high; typical Istio overhead is 5–15ms at p99.

Questions before removing:

1. **What problems is the mesh solving?** mTLS everywhere? Traffic splitting? Observability? You need replacement solutions before removing.

2. **Have you measured the source of overhead?** Is it the sidecar's CPU, the extra TCP handshakes, or the control plane (Istio control plane bottlenecks)? Sometimes the overhead is fixable without removing the mesh:
   - Use HTTP/2 between sidecars instead of HTTP/1.1.
   - Move from XDS (Istio's config protocol) updates to fewer, larger pushes.
   - Allocate more CPU to sidecars.

3. **What's the cost of NOT having mTLS?** If your compliance audit requires it, you can't just turn it off. You'd need to put TLS in every service's code — bigger change.

4. **Can you mesh ONLY the latency-critical path?** Istio supports "out of mesh" services for performance-critical components, kept in-mesh elsewhere. Maybe payment-service stays meshed but the read-path opts out.

5. **What's the latency budget for the affected workflow?** 40ms extra is fatal for some workflows (real-time gaming, financial trading) and irrelevant for others (background batch jobs).

The right answer might be "remove from the latency-critical path, keep mesh elsewhere" — a partial removal — rather than a binary "keep" or "remove."

---

## References

- *Building Microservices* by Sam Newman (2nd ed., 2021) — the canonical book
- *Microservices Patterns* by Chris Richardson — pattern catalog
- [microservices.io](https://microservices.io) — Chris Richardson's pattern reference
- [Martin Fowler — Microservices](https://martinfowler.com/articles/microservices.html)
- [The Twelve-Factor App](https://12factor.net) — foundational app design principles
- [Distributed Tracing — OpenTelemetry](https://opentelemetry.io)
- [Istio Documentation](https://istio.io/latest/docs/)
- [Temporal — Saga Orchestration](https://temporal.io)
