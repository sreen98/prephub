# GraphQL — Interview Guide

GraphQL is a **query language and execution engine for APIs**, not a database and not a replacement for HTTP. The client sends a query describing exactly the shape of data it wants; the server resolves it against whatever backs it and returns that shape.

The two things senior interviews actually dig into are the **N+1 problem** (§6) and **why HTTP caching stops working** (§9). Everything else tends to be schema-design judgement.

## Table of Contents

1. [What GraphQL Is](#1-what-graphql-is)
2. [GraphQL vs REST](#2-graphql-vs-rest)
3. [The Schema and SDL](#3-the-schema-and-sdl)
4. [Queries, Mutations, Subscriptions](#4-queries-mutations-subscriptions)
5. [Resolvers and Execution](#5-resolvers-and-execution)
6. [The N+1 Problem and DataLoader](#6-the-n1-problem-and-dataloader)
7. [Pagination](#7-pagination)
8. [Errors and Partial Failure](#8-errors-and-partial-failure)
9. [Caching](#9-caching)
10. [Security](#10-security)
11. [Authorization](#11-authorization)
12. [Schema Design and Evolution](#12-schema-design-and-evolution)
13. [Federation and Large Graphs](#13-federation-and-large-graphs)
14. [Clients](#14-clients)
15. [Testing and Observability](#15-testing-and-observability)
16. [When Not to Use GraphQL](#16-when-not-to-use-graphql)
17. [Interview Questions and Answers](#17-interview-questions-and-answers)
18. [Tricky Questions](#18-tricky-questions)
19. [Cheat Sheet](#19-cheat-sheet)
20. [References](#20-references)

---

## 1. What GraphQL Is

Three parts, and conflating them causes most confusion:

- **A type system.** The schema declares every type, field and relationship. It is the contract, and it is introspectable.
- **A query language.** Clients ask for a tree of fields. The response mirrors the query's shape exactly.
- **An execution engine.** The server walks the query, calls a **resolver** per field, and assembles the result.

```graphql
# query
{
  candidate(id: "42") {
    name
    applications(first: 2) {
      role
      status
    }
  }
}
```

```json
{ "data": { "candidate": { "name": "Ana",
  "applications": [ { "role": "SDE", "status": "SCREEN" },
                    { "role": "SRE", "status": "REJECTED" } ] } } }
```

What GraphQL is **not**: a database (it has no storage), a replacement for HTTP (it is normally one `POST /graphql`), or automatically faster (it changes *which* round trips you make, not how fast your database is).

---

## 2. GraphQL vs REST

| | REST | GraphQL |
|---|---|---|
| Shape of response | fixed per endpoint | chosen by the client |
| Round trips for a nested view | often several | one |
| Over/under-fetching | common | avoidable by construction |
| Contract | convention + OpenAPI (optional) | schema, mandatory and introspectable |
| HTTP caching | works natively (URL + verb) | **breaks** — see §9 |
| Versioning | `/v2/` | continuous evolution via deprecation |
| Error model | status codes | `200` with an `errors` array |
| Server complexity | low | resolver + N+1 + complexity limits |
| File upload, streaming | native | needs extra spec/plumbing |

The honest framing: GraphQL moves complexity **from the client to the server**. Clients stop assembling data from five endpoints; servers take on batching, depth limiting, cost analysis and cache invalidation. That trade is worth it when you have many heterogeneous clients evolving at different speeds, and a poor trade when you have one client and a simple resource model.

GraphQL's own big win is **removing the endpoint negotiation loop** — the mobile team no longer files a ticket asking backend for "the list endpoint but with avatar URLs".

---

## 3. The Schema and SDL

```graphql
scalar DateTime

type Candidate implements Node {
  id: ID!                          # ! = non-null
  name: String!
  email: String                    # nullable: may be hidden by authorization
  createdAt: DateTime!
  applications(first: Int = 10, after: String): ApplicationConnection!
}

interface Node { id: ID! }

enum Status { APPLIED SCREEN OFFER REJECTED }

union SearchResult = Candidate | Role

input CandidateInput {             # inputs are a separate kind of type
  name: String!
  email: String
}

type Query   { candidate(id: ID!): Candidate }
type Mutation{ createCandidate(input: CandidateInput!): CreateCandidatePayload! }
```

The built-in scalars are `Int`, `Float`, `String`, `Boolean`, `ID`. Everything else is custom (`DateTime`, `EmailAddress`) with your own serialise/parse logic — which is also a **validation** hook, since a custom scalar rejects bad input before any resolver runs.

**Nullability is the single most consequential schema decision.** `String!` promises a value always. If a non-null field's resolver throws or returns null, GraphQL cannot represent that, so it **nulls out the nearest nullable parent** — and if every ancestor is non-null, the entire `data` becomes `null`. So aggressive `!` turns one flaky field into a total request failure. The rule of thumb: non-null for genuinely invariant identity fields (`id`), nullable for anything that depends on a remote call, permissions, or may legitimately be absent. Lists have two positions: `[Role!]!` is a non-null list of non-null items; `[Role]` may be null and may contain nulls.

`interface` for shared fields with polymorphic implementations; `union` for "one of these unrelated types"; `input` types for arguments (they cannot be output types, and vice versa).

---

## 4. Queries, Mutations, Subscriptions

```graphql
query GetCandidate($id: ID!, $withApps: Boolean!) {   # named + variables
  candidate(id: $id) {
    ...CandidateCore                                  # fragment
    applications @include(if: $withApps) { role }     # directive
  }
}

fragment CandidateCore on Candidate { id name }
```

Use **variables**, never string interpolation — variables are typed, validated, and let servers recognise the same query shape for caching and allow-listing.

```graphql
mutation {
  createCandidate(input: { name: "Ana" }) {
    candidate { id name }        # return the mutated object so clients can update caches
    errors { field message }     # expected, recoverable errors as DATA (§8)
  }
}
```

Two rules people miss: **top-level mutation fields run serially** (in the order written) while query fields run in parallel — so `[a, b]` mutations are sequential, but everything *nested under* a mutation resolves in parallel like a query. And mutations should return the affected object plus a payload wrapper, so the client can update its cache without a refetch.

**Subscriptions** deliver a stream of events, normally over WebSocket (`graphql-ws`) or SSE:

```graphql
subscription { applicationStatusChanged(candidateId: "42") { id status } }
```

Subscriptions hold connection state, which is why they scale differently from queries: you need sticky sessions or a shared pub/sub (Redis, Kafka) to fan out across instances. If you only need "refresh when something changes", polling or SSE is usually cheaper to operate.

---

## 5. Resolvers and Execution

A resolver is a function per field with the signature `(parent, args, context, info)`:

```js
const resolvers = {
  Query: {
    candidate: (_parent, { id }, ctx) => ctx.db.candidate(id),
  },
  Candidate: {
    // `parent` is the Candidate returned above
    applications: (parent, args, ctx) => ctx.loaders.appsByCandidate.load(parent.id),
    email: (parent, _args, ctx) =>
      ctx.can('read:email', parent) ? parent.email : null,
  },
};
```

- **`parent`** — the value the parent field resolved to. This is what makes the graph work.
- **`args`** — validated against the schema before your code runs.
- **`context`** — per-request: the authenticated user, DataLoaders, database handles. Build it fresh per request; a context shared across requests leaks data between users via the loader cache.
- **`info`** — the AST of the current field. Powerful for look-ahead (deciding which columns to select), and the usual source of unreadable code.

Execution is **depth-first down the tree, breadth-parallel across sibling fields**. Fields with no resolver fall back to `parent[fieldName]`, which is why returning plain rows from the top-level resolver often "just works".

The `info` argument enables **projection** — inspecting the requested subtree to `SELECT` only needed columns, or to join up front instead of per-field. That is the main alternative to DataLoader for SQL-backed graphs.

---

## 6. The N+1 Problem and DataLoader

This is the question that separates people who have run GraphQL in production from people who have read about it.

```graphql
{ candidates(first: 100) { name company { name } } }
```

Naively: **1** query for the 100 candidates, then **100** more — one per candidate — for each company. That is 101 queries. Nesting one level deeper multiplies again. The cause is structural: a resolver is called **per object per field**, and it has no idea it is one of a hundred siblings.

**DataLoader** fixes it by batching within a tick of the event loop and de-duplicating by key:

```js
import DataLoader from 'dataloader';

const companyLoader = new DataLoader(async (ids) => {
  const rows = await db.company.findMany({ where: { id: { in: ids } } });
  const byId = new Map(rows.map((r) => [r.id, r]));
  // CRITICAL: return results in the SAME ORDER as `ids`, with null for misses
  return ids.map((id) => byId.get(id) ?? null);
});

// resolver
company: (parent, _a, ctx) => ctx.loaders.company.load(parent.companyId)
```

101 queries become 2. The mechanics: `.load(id)` returns a promise and queues the key; on the next microtask tick DataLoader calls your batch function once with all keys collected so far.

Non-negotiable details:

- **Order and arity.** The batch function must return an array the **same length and order** as the keys. Returning DB rows directly is a bug the moment the database omits a missing row or reorders results.
- **One loader set per request.** Loaders cache, so a process-wide loader serves user A's data to user B. Construct them in the context factory.
- **Errors** for individual keys are returned *as* `Error` instances in the array position, not thrown.
- DataLoader solves the **request** N+1. It does not stop a client asking for 10,000 items — that is what pagination (§7) and complexity limits (§10) are for.

Alternatives worth naming: **look-ahead projection** via `info` to build one join; a **CQRS read model** or materialised view for expensive shapes; and in federated setups, entity resolution is already batched by the router.

---

## 7. Pagination

Offset pagination (`skip`/`limit`) has the same problems as in SQL: it gets slower as the offset grows, and it **skips or duplicates rows** when the underlying data changes between pages. GraphQL's convention is therefore cursor-based, standardised by the **Relay Connections spec**:

```graphql
type ApplicationConnection {
  edges: [ApplicationEdge!]!
  pageInfo: PageInfo!
  totalCount: Int            # nullable: often expensive, sometimes impossible
}
type ApplicationEdge {
  node: Application!
  cursor: String!            # opaque
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

```graphql
{ candidate(id:"42") { applications(first: 20, after: "eyJpZCI6MTAwfQ==") {
    edges { cursor node { id status } } pageInfo { hasNextPage endCursor } } } }
```

The `edges`/`node` indirection exists so an edge can carry **relationship** metadata (`addedAt`, `role`) that belongs to neither end. That is the honest justification; if you have no edge metadata, a simpler `items` + `pageInfo` shape is a perfectly defensible choice.

Cursors must be **opaque** — base64 an internal keyset, and clients must never parse them, or you can never change the ordering. Keyset cursors also mean `totalCount` is often the expensive part of the query; make it nullable and let clients opt in.

---

## 8. Errors and Partial Failure

GraphQL returns **HTTP 200 with an `errors` array** for execution errors, because a query can partially succeed:

```json
{
  "data": { "candidate": { "name": "Ana", "company": null } },
  "errors": [ { "message": "Company service unavailable",
                "path": ["candidate","company"],
                "extensions": { "code": "UPSTREAM_UNAVAILABLE" } } ]
}
```

`data` and `errors` can **both** be present — the defining feature and the thing that surprises REST-trained clients. A client that checks only `response.ok` will silently treat a half-failed response as success.

The status codes that *are* used: `400` for malformed or invalid queries (validation happens before execution), `401`/`403` at the transport layer, and `200` for anything that reached execution.

The mature pattern separates two categories:

- **Exceptional** failures (a database is down, a bug) → the `errors` array, with a machine-readable `extensions.code` and no internal details leaked in `message`.
- **Expected, recoverable** failures (validation, "email already taken") → **return them as data** in the mutation payload:

```graphql
type CreateCandidatePayload {
  candidate: Candidate
  errors: [UserError!]!        # non-null list: always present, often empty
}
type UserError { field: String message: String! code: String! }
```

Modelling expected errors as data makes them typed, non-null and impossible for a client to forget — whereas the `errors` array is untyped and easy to ignore. Turn off stack traces in production; `formatError` should map internal exceptions to a safe code.

---

## 9. Caching

**Why HTTP caching breaks.** REST caching keys on URL + method, and GraphQL sends every query as `POST /graphql` with the query in the body. One URL, one verb, infinitely many responses — so browser caches, CDNs and reverse proxies see nothing cacheable. This is the most common "GraphQL made us slower" story.

The layers that replace it:

**1. Client-side normalized cache.** Apollo Client, urql's Graphcache and Relay flatten the response into a store keyed by type + id (`Candidate:42`), so a candidate fetched by one query is reused by another. This requires **stable `id` fields** — always request `id`, or the cache degrades to per-query blobs. The hard part is invalidation after mutations: return the mutated entity so the cache patches itself, or write explicit cache updates for list insertions and deletions, which normalization cannot infer.

**2. Persisted queries / `GET`.** Register the query server-side, then send a hash. With `GET /graphql?extensions={"persistedQuery":{"sha256Hash":"..."}}` you get a real URL back and CDN caching becomes possible again. **Automatic Persisted Queries (APQ)** negotiate this at runtime. This is also the cleanest security control (§10).

**3. Server-side data caching.** Cache what resolvers fetch — Redis in front of expensive calls — rather than whole responses, since response shapes vary infinitely while underlying entities do not. `@cacheControl` hints plus a response cache work when a query's fields agree on a TTL; the whole response takes the **minimum** of its fields' `maxAge`, so one uncacheable field makes the response uncacheable.

**4. Per-request memoization.** DataLoader's cache already de-duplicates the same key inside one request (§6).

Public vs private matters: any field that varies by user must be `scope: PRIVATE`, or a shared cache leaks one user's data to another.

---

## 10. Security

GraphQL's flexibility is also its attack surface: the client, not you, decides the query.

**Depth and complexity limits.** A recursive schema lets a small query cost enormous work:

```graphql
{ candidate(id:"1"){ company { candidates { company { candidates { ... } } } } } }
```

Enforce a **max depth**, and better, **static cost analysis**: assign each field a cost, multiply by pagination arguments, and reject queries over a budget *before executing them* (`graphql-query-complexity`, envelop plugins). Depth alone does not catch a shallow query requesting `first: 100000`.

**Introspection.** Genuinely useful in development and for tooling. In production it hands an attacker your complete schema. Disable it for public APIs — or better, use **persisted query allow-listing**, which makes introspection moot because only registered queries execute at all.

**Batching abuse.** Array-form batched requests and aliasing multiply cost under one HTTP request:

```graphql
{ a: candidate(id:"1"){name} b: candidate(id:"2"){name} ... }   # x1000 aliases
```

So rate limits must count **query cost**, not HTTP requests. Cap batch size and alias count.

**Field-level errors as an oracle.** Distinguishing "not found" from "forbidden" leaks existence. Return the same shape for both.

Also: **disable stack traces**, cap query **length** and parse depth (a deeply nested query can blow the parser before validation), require variables rather than inline literals, set timeouts per resolver, and remember **CSRF applies** — a `GET`-enabled GraphQL endpoint or one accepting `application/x-www-form-urlencoded` can be triggered cross-origin, so require `Content-Type: application/json` and a CSRF-prevention header.

---

## 11. Authorization

**Never in resolvers only, and never in the schema alone.** The reliable pattern is to authorize in the **business layer** the resolvers call, so the same rules apply from a REST endpoint, a queue consumer or a script.

```js
// resolver stays thin; the service enforces
applications: (parent, args, ctx) =>
  ctx.services.applications.listForCandidate(ctx.viewer, parent.id, args)
```

Three levels, used together:

- **Field level** — return `null` (for a nullable field) or an error for `Candidate.email` when the viewer lacks permission. Note this is *why* sensitive fields should be nullable.
- **Object level** — can this viewer see this candidate at all? This is where **IDOR** bugs live: `candidate(id:)` must check ownership, not just existence.
- **Query level** — cost and rate limits per viewer (§10).

The GraphQL-specific hazard is that **any path can reach any type**. A field guarded on `Query.candidate` may be reachable via `Company.candidates` without the check. So authorize on the **type/field being returned**, not on the entry point. Directive-based approaches (`@auth(requires: ADMIN)`) are declarative and nicely visible in the schema, but they only cover coarse role checks — anything data-dependent ("owns this record") still needs the service layer.

---

## 12. Schema Design and Evolution

**GraphQL is designed not to be versioned.** You evolve one schema continuously:

- **Adding** a field or an optional argument is always safe.
- **Removing or renaming** is breaking. Mark it `@deprecated(reason: "Use x")`, watch field-level usage metrics until it hits zero, then remove.
- Making a nullable field **non-null** is breaking for servers (you must always supply it); making a non-null field nullable is breaking for clients.
- Adding an enum value is breaking for clients that exhaustively switch — a real-world trap.

Design guidance that comes up:

- **Model the domain graph, not your tables.** The schema is a product surface. If it mirrors your database, every schema change becomes a migration.
- **Wrap mutation arguments in a single `input`** and return a **payload type**. Both are extensible without breaking signatures.
- **Name mutations as verbs on entities** — `archiveCandidate`, not `updateCandidate(archived: true)` — so intent is explicit and authorization is checkable.
- **Prefer specific types over `JSON` scalars.** A `JSON` field opts out of the type system, which is the one thing GraphQL is for.
- Use `enum` rather than `String` for closed sets, and **check schema changes in CI** with a diff tool (`graphql-inspector`) that fails the build on a breaking change without a deprecation path.

---

## 13. Federation and Large Graphs

One team's schema is fine; fifty teams sharing one file is not. Three approaches:

| Approach | How | Trade-off |
|---|---|---|
| **Monolithic schema** | one service owns everything | simplest; becomes a bottleneck |
| **Schema stitching** | a gateway merges remote schemas | flexible, gateway-side glue code |
| **Federation** (Apollo) | subgraphs declare entities; a router composes | teams own subgraphs; needs governance |

Federation's core idea is the **entity**: a type with a key, owned by one subgraph and extended by others.

```graphql
# candidates subgraph
type Candidate @key(fields: "id") { id: ID!  name: String! }

# applications subgraph — extends the same entity
type Candidate @key(fields: "id") {
  id: ID! @external
  applications: [Application!]!
}
```

The router plans the query, calls each subgraph, and resolves references via `_entities`. What bites in practice: an extra network hop per subgraph, **N+1 across services** (the router batches entity fetches, but a badly split graph still fans out), the need for composition checks in CI so one team cannot break the supergraph, and distributed tracing becoming mandatory to answer "why is this query slow".

Split subgraphs along **ownership boundaries**, the same bounded contexts you would use for microservices — not by technical layer.

---

## 14. Clients

You can call GraphQL with `fetch` — it is just a POST. Libraries earn their weight through caching and request lifecycle:

| Client | Cache | Notes |
|---|---|---|
| **Apollo Client** | normalized | largest ecosystem, biggest bundle, most config |
| **urql** | document cache by default, normalized via Graphcache | smaller, modular via exchanges |
| **Relay** | normalized, compiler-enforced | strictest; requires Relay-spec schema; excellent at scale |
| **TanStack Query** + `graphql-request` | per-key, not normalized | simplest; you manage invalidation |

The real decision is **normalized vs document caching**. Normalized caches share entities across queries, so updating a candidate in one view updates every view — at the cost of configuration and cache-update code for list mutations. Document caches store per-query results, which is trivial to reason about and refetches more. For a small app, TanStack Query plus generated types is often the better engineering trade.

Use **codegen** (`graphql-codegen`) to generate TypeScript types from your schema and operations. This is the highest-value tooling decision in a GraphQL frontend: the schema becomes compile-time-checked, and a breaking server change fails your build instead of production.

---

## 15. Testing and Observability

**Testing layers.** Unit-test resolvers as plain functions with a stubbed context — that is where authorization and mapping logic lives. Integration-test by executing real queries against the schema with a test database, which catches schema/resolver mismatches. Add **schema snapshot** tests so unintended contract changes show up in review, and use `graphql-inspector` in CI to fail on breaking changes.

```js
const res = await executeOperation({
  query: `{ candidate(id:"1"){ name company { name } } }`,
  contextValue: makeContext({ viewer: adminUser }),
});
expect(res.errors).toBeUndefined();
```

Assert on `errors` explicitly — a test checking only `data` will pass on a partially failed response.

**Observability** needs GraphQL-specific instrumentation, because every request is `POST /graphql` and standard HTTP metrics tell you nothing. Track: **resolver-level** timings (to find the slow field), **per-operation-name** latency and error rates (so name every operation), **field usage** (the only safe way to know a deprecated field is dead), **query cost** distribution, and **DataLoader batch sizes and hit rates** — a batch size of 1 means batching is not working.

---

## 16. When Not to Use GraphQL

Say this out loud in an interview; it signals judgement:

- **One client, simple resources.** REST plus OpenAPI is less machinery and caches for free.
- **You need HTTP/CDN caching most** — a public, read-heavy, cacheable API. §9 is a real cost.
- **File uploads and byte streaming.** Both need extra specs and are more natural over plain HTTP.
- **A small team without capacity** for complexity limits, DataLoaders and schema governance — an unprotected public GraphQL endpoint is a denial-of-service waiting to happen.
- **Mostly commands, not queries.** If your API is actions rather than data shapes, GraphQL's strength is unused.
- **Reporting and analytics.** Aggregations over huge datasets fit SQL or a purpose-built endpoint far better.

The strongest case for GraphQL: **many heterogeneous clients** (web, iOS, Android, partners) evolving at different rates over a **richly connected domain**, where the endpoint-negotiation loop is a real organisational cost. A common middle path is a **BFF**: GraphQL for your own clients, REST underneath between services.

---

## 17. Interview Questions and Answers

**Q1: What is GraphQL, and what problem does it solve?**

GraphQL is three things together: a type system that defines the schema, a query language in which clients request a tree of fields, and an execution engine that resolves each field and returns data matching the query's shape. The problem it solves is the **endpoint negotiation loop**: with REST, each view needs an endpoint returning the right shape, so clients either over-fetch, under-fetch and make several round trips, or the backend ships a bespoke endpoint per screen. GraphQL lets the client specify the shape, so a nested view is one request with exactly the fields needed, and adding a field to a mobile screen requires no backend change. It is not a database, not a replacement for HTTP, and not automatically faster — it changes which round trips you make, not how fast your data layer is.

**Q2: What are the main trade-offs of GraphQL versus REST?**

GraphQL moves complexity from the client to the server. You gain client-specified responses, no over-fetching, a single mandatory introspectable contract, and continuous evolution instead of `/v2/`. You take on the N+1 problem, query cost and depth limiting, and the loss of free HTTP caching — because every request is `POST /graphql`, so URL-based caches in browsers, CDNs and proxies see one uncacheable endpoint. You also inherit an error model where a `200` response can contain partial data plus errors, which clients must handle deliberately. REST remains better for a public, read-heavy cacheable API, for file upload and streaming, and for a single client over a simple resource model. GraphQL wins with many heterogeneous clients over a richly connected domain.

**Q3: What is the N+1 problem in GraphQL, and how do you solve it?**

Resolvers run **per object per field**, so a query for 100 candidates each with a `company` calls the company resolver 100 times — one query for the list plus N for the children, hence N+1, and it multiplies with depth. The standard fix is **DataLoader**: `.load(key)` returns a promise and queues the key, then on the next microtask tick your batch function is called once with all collected keys, so 101 queries become 2. Three details are mandatory. The batch function must return an array of the **same length and order** as the keys, with a null or `Error` in the position of any miss — returning database rows directly is a bug the moment a row is missing or reordered. Loaders must be constructed **per request** in the context, because they cache, and a process-wide loader will serve one user's data to another. And DataLoader fixes the request-level N+1 only; it does not stop a client asking for 10,000 items, which is what pagination and complexity limits are for. The alternative is look-ahead projection using the `info` argument to build a single join.

**Q4: Why does HTTP caching break with GraphQL, and what do you use instead?**

HTTP caching keys on URL plus method, and GraphQL sends every operation as `POST /graphql` with the query in the body — one URL, one verb, infinitely many responses — so browser caches, CDNs and reverse proxies find nothing to cache. You replace it with layers. A **client-side normalized cache** (Apollo, Relay, urql Graphcache) flattens responses into a store keyed by type and id, so entities are shared across queries; this needs stable `id` fields, and its hard part is invalidating list membership after mutations, which normalization cannot infer. **Persisted queries** register the operation server-side so the client sends a hash, which restores a real cacheable URL when combined with `GET` and makes CDN caching possible again. **Server-side caching of what resolvers fetch** — Redis in front of expensive calls — works better than caching whole responses, because response shapes vary infinitely while the underlying entities do not. And DataLoader memoizes within a single request. Note a whole-response cache takes the **minimum** `maxAge` of its fields, so one uncacheable field poisons the response, and anything user-specific must be scoped private or a shared cache leaks data across users.

**Q5: How do you handle errors in GraphQL?**

Execution errors return **HTTP 200 with an `errors` array**, and `data` and `errors` can both be present because a query may partially succeed — a client checking only `response.ok` will treat a half-failed response as success. `400` is used for malformed or invalid queries, since validation runs before execution. The mature pattern splits errors in two. **Exceptional** failures — a service is down, a bug — belong in the `errors` array with a machine-readable `extensions.code` and no internal detail in the message. **Expected, recoverable** failures — validation, "email already taken" — should be returned **as data** in the mutation payload, as a non-null `errors: [UserError!]!` list, because that makes them typed, always present and impossible for a client to forget, whereas the top-level array is untyped and easy to ignore. Also disable stack traces in production and map internal exceptions to safe codes in `formatError`.

**Q6: How does nullability work, and why does it matter so much?**

`!` marks a field non-null. If a non-null field's resolver returns null or throws, GraphQL cannot represent that, so it **nulls out the nearest nullable ancestor** — and if every ancestor is non-null, the whole `data` becomes null. So over-using `!` converts one flaky field into a total request failure, which is why nullability is the highest-leverage schema decision. Use non-null for genuinely invariant fields like `id`, and nullable for anything depending on a remote call, on permissions, or that may legitimately be absent — which is also why authorization-gated fields such as `email` should be nullable, so denying access degrades gracefully. Lists have two independent positions: `[Role!]!` is a non-null list of non-null items, while `[Role]` may itself be null and may contain nulls. Note the asymmetry in evolution: making a nullable field non-null is breaking for servers, and making a non-null field nullable is breaking for clients.

**Q7: How do you secure a GraphQL API?**

The client chooses the query, so cost control is the core problem. Enforce a **maximum depth** and, more importantly, **static cost analysis** — assign each field a cost, multiply by pagination arguments, and reject over-budget queries before execution, since depth alone does not catch a shallow query asking for `first: 100000`. **Disable introspection** in production for public APIs, or better use **persisted query allow-listing**, which makes introspection moot because only registered operations run. Rate-limit on **query cost rather than HTTP requests**, because aliasing and array batching multiply work inside one request. Beyond that: cap query length and parse depth (a deeply nested query can exhaust the parser before validation), disable stack traces, set per-resolver timeouts, return identical responses for "not found" and "forbidden" so errors are not an existence oracle, and remember CSRF applies — require `application/json` and a CSRF header, especially if `GET` is enabled.

**Q8: Where should authorization live?**

In the **business layer that resolvers call**, not in the resolvers alone and not in the schema alone, so the same rules apply from a queue consumer or a script. Apply it at three levels together: field level (return null for a nullable sensitive field the viewer cannot see), object level (can this viewer see this record at all — this is where IDOR bugs live, since checking existence is not checking ownership), and query level (cost and rate limits per viewer). The GraphQL-specific hazard is that **any path can reach any type**: a check on `Query.candidate` does nothing if the same type is reachable via `Company.candidates`, so authorize on the **type and field being returned**, not on the entry point. Schema directives like `@auth(requires: ADMIN)` are declarative and visible in the schema but only handle coarse role checks; anything data-dependent still needs the service layer.

**Q9: Why does GraphQL use cursor pagination, and what is the Relay connection spec?**

Offset pagination degrades as the offset grows and **skips or duplicates rows** when data changes between page fetches. Cursor (keyset) pagination encodes a position in the sort order, so it is stable under concurrent writes and stays fast. The Relay Connections spec standardises the shape: a `Connection` with `edges` and `pageInfo`, each `Edge` having a `node` and an opaque `cursor`, and `pageInfo` carrying `hasNextPage`, `hasPreviousPage`, `startCursor` and `endCursor`. The `edges`/`node` indirection exists so an edge can carry **relationship** metadata that belongs to neither end, such as when a candidate was added to a role — that is its honest justification, and if you have no edge metadata a simpler `items` plus `pageInfo` shape is defensible. Cursors must be **opaque** and clients must never parse them, or you can never change the ordering. `totalCount` is usually the expensive part of a keyset query, so make it nullable and let clients opt in.

**Q10: How does GraphQL handle versioning and breaking changes?**

It is designed not to be versioned: you evolve a single schema continuously. Adding a field or an optional argument is always safe. Removing or renaming is breaking, so the process is to mark the field `@deprecated(reason: "Use x")`, watch **field-level usage metrics** until it reaches zero, then remove — which is why per-field usage tracking is not optional at scale. Subtler breaking changes: making a nullable field non-null breaks servers, making a non-null field nullable breaks clients, and **adding an enum value breaks clients that switch exhaustively**. Enforce this in CI with a schema diff tool such as `graphql-inspector`, failing the build on a breaking change that has no deprecation path. Because there is no version boundary, the compensating discipline is that the schema must be designed as a product surface rather than a mirror of your tables — otherwise every database change becomes a client-visible break.

**Q11: What is Apollo Federation, and when would you use it?**

Federation composes one supergraph from independently deployed **subgraphs**, so each team owns and ships its own schema. Its core concept is the **entity**: a type with a `@key`, owned by one subgraph and extendable by others via `@external`, letting the applications team add `Candidate.applications` to a `Candidate` owned by the candidates team. A router plans the query, calls each subgraph, and resolves references through the `_entities` field. Use it when many teams share a graph and a single schema file has become an organisational bottleneck; split subgraphs along **ownership and bounded-context boundaries**, not technical layers. Costs to acknowledge: an extra network hop per subgraph, potential **N+1 across services** if the graph is split badly, mandatory composition checks in CI so one team cannot break the supergraph, and distributed tracing becoming necessary to explain a slow query. Schema stitching is the lighter alternative that keeps merge logic in the gateway.

**Q12: How do subscriptions work, and when would you use something else?**

A subscription is a long-lived operation delivering a stream of events, normally over WebSocket using the `graphql-ws` protocol, sometimes over SSE. The server holds per-connection state, which is why they scale differently from queries: fanning out across instances needs a shared pub/sub such as Redis or Kafka, plus sticky sessions or a connection-aware load balancer, and you must handle authentication at connection time, reconnection with missed-event replay, and backpressure when a client consumes slower than events arrive. Because of that operational weight, prefer something simpler when the requirement is merely "refresh when data changes" — polling is trivially scalable and often sufficient, and SSE gives server push over plain HTTP with automatic reconnection and no new protocol. Reserve subscriptions for genuinely event-driven, low-latency UI such as collaborative editing or live status.

**Q13: What does the `info` argument give you, and when should you use it?**

`info` is the resolver's fourth argument: the AST of the current field plus the schema, the parent type and the path. Its legitimate use is **look-ahead** — inspecting the requested subtree so you can `SELECT` only the columns actually asked for, or build a single join covering nested fields instead of resolving them one at a time. That makes it the main alternative to DataLoader for SQL-backed graphs, and it is how ORM integrations avoid both over-fetching columns and N+1 queries. The caveat is that AST traversal is fiddly and easy to get wrong once fragments, inline fragments, aliases and directives are involved, so it produces the least readable code in a GraphQL server. Use a library that implements projection rather than hand-rolling it, and reach for DataLoader first because it is far simpler to reason about.

**Q14: How do you test a GraphQL API?**

Three layers. **Unit-test resolvers as plain functions** with a stubbed context, since that is where authorization and mapping logic lives. **Integration-test by executing real operations against the schema** with a test database, which is the only thing that catches schema/resolver mismatches and nullability bubbling. And **schema contract tests** — a snapshot so unintended changes surface in review, plus `graphql-inspector` in CI failing on breaking changes without a deprecation path. The GraphQL-specific pitfall is that a test asserting only on `data` will pass on a partially failed response, because errors arrive alongside data under a `200`; always assert `errors` is undefined explicitly. Also test the guardrails themselves: that an over-depth or over-cost query is rejected, and that a field the viewer cannot see returns null rather than leaking.

**Q15: What should you monitor in a GraphQL server?**

Standard HTTP metrics are nearly useless because every request is `POST /graphql` returning `200`, so you need GraphQL-aware instrumentation. Track **per-operation-name** latency and error rates, which requires naming every operation as a convention. Track **resolver-level timings** to find which field is slow rather than which request. Track **field-level usage**, the only safe way to know a deprecated field is dead before removing it. Track the distribution of **query cost and depth** so you can see abuse and set limits from evidence. Track **DataLoader batch sizes and cache hit rates** — a batch size of one means batching is silently not working, usually because loaders were created outside the request context. And alert on the rate of responses containing an `errors` array, since those are invisible to any monitor watching status codes.

---

## 18. Tricky Questions

**Q1: A query returns HTTP 200, but `data.candidate.company` is `null` and there is an `errors` array. Is this a success or a failure, and whose bug is it?**

**It is a partial success, and the client bug is treating `200` as "fine".** GraphQL returns `200` for anything that reached execution, and `data` and `errors` are both present when some fields resolved and others did not — here the company resolver failed while `candidate` succeeded. The response is *correct* GraphQL. Two things follow. Clients must check the `errors` array explicitly, not just the HTTP status, and typed clients should surface it; a naive `if (res.ok)` silently renders a candidate with no company as though the company genuinely does not exist. And on the server side you should decide whether this *should* be an `errors` entry at all: if a missing company is expected and recoverable, model it as data; if it means an upstream is down, the `errors` entry with an `extensions.code` is right, and the field must be nullable or the null would have propagated up and destroyed the whole response.

**Q2: You add DataLoader and the N+1 disappears in tests, but production still shows one query per row. What is the most likely cause?**

**The loader is being created outside the per-request context — or, less often, an `await` is forcing sequential resolution.** DataLoader batches keys collected within one tick of the event loop, so anything that breaks that grouping defeats it. The classic version is constructing the loader inside the resolver, so every call gets a fresh loader with a batch of exactly one; the fix is to build loaders in the context factory, once per request. The subtler version is a resolver that awaits something before calling `.load`, or a loop written as `for (const id of ids) await loader.load(id)` — each `await` yields, the queue flushes with a single key, and you are back to N queries. `Promise.all(ids.map((id) => loader.load(id)))` keeps them in the same tick. Diagnose it by logging batch sizes: a steady batch size of 1 is the signature. Note that a process-wide loader would *also* batch correctly while introducing a far worse bug — cross-user data leakage through the cache.

**Q3: Why can adding a value to an enum be a breaking change, when adding a field never is?**

**Because clients often switch exhaustively over enum values, and a new value has no branch.** Adding a field is safe since no existing query requests it, so no existing response changes. An enum is different: the server can now *return* a value the client has never seen, and a `switch` with no `default`, or a TypeScript exhaustiveness check compiled against the old schema, will fall through — rendering nothing, throwing, or hitting an unreachable branch. This is why enum values should be added with a client migration in mind, why generated client types must be regenerated on schema change, and why clients should always handle an unknown value defensively. The same asymmetry appears elsewhere: adding an **optional** argument is safe, adding a required one is breaking; and `@deprecated` on an enum value does not stop the server returning it.

**Q4: A `first: 10` query is fast, but the same query with `totalCount` takes seconds. Why, and what do you do?**

**Because keyset pagination fetches a bounded page while `totalCount` must count the entire matching set.** Returning ten rows after a cursor is an index range scan bounded by the page size; counting all matches ignores the limit and, for a filtered query, can mean scanning millions of rows, which no cursor optimisation helps. The response is only as fast as its slowest field, so one `totalCount` dominates an otherwise cheap query. The fixes, in order: make `totalCount` **nullable and optional** so clients opt in and pay only when they need it; design UI that needs `hasNextPage` (which is cheap — fetch `first + 1` and check for the extra row) instead of a total; serve an **approximate** count from statistics or a cached counter when a rough number is enough; or maintain a materialised counter for the common filters. This is also why the field should never have been non-null: a non-null expensive field cannot be skipped and cannot fail gracefully.

**Q5: Your public GraphQL endpoint has introspection disabled and a max-depth limit of 10. Is it protected against expensive queries?**

**No — depth limits do not bound breadth or page size.** A completely flat, depth-2 query can be ruinous: `{ candidates(first: 100000) { name } }` passes a depth check trivially, and aliasing multiplies it inside a single request, since `a: candidates(first: 10000) b: candidates(first: 10000) …` repeated a thousand times is still shallow. Array-form request batching stacks more on top. So you need **static cost analysis** that assigns a cost per field and multiplies by pagination arguments, rejecting the query before execution; caps on page size, alias count and batch size; and rate limiting measured in **query cost rather than HTTP requests**. Disabling introspection is worth doing but is obscurity, not a control — an attacker can discover fields by probing error messages, and internal clients' queries leak the schema anyway. The genuinely strong control is **persisted query allow-listing**: only pre-registered operations execute, which bounds cost by construction and makes introspection irrelevant.

**Q6: Two mutations in one request — `[archiveCandidate, sendEmail]`. Do they run in parallel, and does the second run if the first fails?**

**Top-level mutation fields run serially, in written order — but a failure does not necessarily stop the rest.** This is the one place GraphQL deviates from parallel field execution: query fields resolve concurrently, while root mutation fields are sequenced deliberately, because mutations have side effects and order matters. Everything *nested beneath* a mutation resolves in parallel like a normal query. The trap is that serial execution is not a transaction: if `archiveCandidate` errors, the engine records the error and, for a nullable field, continues to `sendEmail` — so you can email about an archive that never happened. GraphQL gives you ordering, not atomicity. If two operations must succeed or fail together, model them as **one mutation** that owns the transaction, rather than relying on the client to sequence them.

---

## 19. Cheat Sheet

**Fundamentals**

1. GraphQL is a type system + query language + execution engine. Not a database.
2. The response mirrors the query's shape exactly.
3. Usually one `POST /graphql`; `200` even for execution errors.
4. Built-in scalars: `Int`, `Float`, `String`, `Boolean`, `ID`. Everything else is custom.
5. Custom scalars are also a validation hook — they reject input before resolvers run.

**Schema**

6. `!` = non-null. A failing non-null field nulls out the nearest nullable ancestor.
7. Over-using `!` turns one flaky field into a whole-request failure.
8. `[T!]!` — non-null list of non-null items; `[T]` — nullable list, nullable items.
9. `input` types for arguments; they cannot be output types.
10. `interface` for shared fields; `union` for unrelated alternatives.
11. Model the domain graph, not your tables.
12. Wrap mutation args in one `input`; return a payload type.
13. Prefer `enum` over `String`; avoid `JSON` scalars.

**Execution**

14. Resolver signature: `(parent, args, context, info)`.
15. `parent` is what the parent field resolved to — this is what makes the graph work.
16. Build `context` **per request**; never share loaders across requests.
17. Sibling fields resolve in parallel; the tree is walked depth-first.
18. **Root mutation fields run serially**; nested fields do not. Serial ≠ transactional.
19. Missing resolvers fall back to `parent[fieldName]`.

**N+1**

20. Resolvers run per object per field — that is the structural cause.
21. DataLoader batches within one event-loop tick and de-dupes by key.
22. The batch function must return **same length, same order**, null/`Error` for misses.
23. One loader set per request, created in the context factory.
24. `await` in a loop defeats batching — use `Promise.all`.
25. A batch size of 1 in metrics means batching is broken.
26. DataLoader fixes request-level N+1 only; use pagination and cost limits for volume.

**Pagination**

27. Prefer cursor/keyset over offset — stable under writes, no skipped rows.
28. Relay: `Connection` → `edges` → `{ node, cursor }` + `pageInfo`.
29. Cursors are **opaque**; never let clients parse them.
30. `totalCount` is often the expensive field — make it nullable.
31. `hasNextPage` is cheap: fetch `first + 1`.

**Errors**

32. `data` and `errors` can both be present. Never trust `res.ok` alone.
33. `400` for invalid/malformed queries (validation precedes execution).
34. Exceptional errors → `errors` array with `extensions.code`.
35. Expected errors → **data**, as a non-null `[UserError!]!` in the payload.
36. Disable stack traces in production; map exceptions in `formatError`.

**Caching**

37. HTTP caching breaks: one URL, one verb, infinite responses.
38. Normalized client caches need stable `id` fields.
39. List membership after a mutation must be updated explicitly.
40. Persisted queries + `GET` restore CDN cacheability.
41. Cache what resolvers fetch, not whole responses.
42. A response's `maxAge` is the **minimum** of its fields'.
43. Anything user-specific must be cache-scoped private.

**Security**

44. Enforce max depth **and** static cost analysis — depth alone misses `first: 100000`.
45. Rate-limit on query cost, not request count; aliases and batching multiply.
46. Disable introspection in production; allow-listing is the stronger control.
47. Cap query length, parse depth, alias count, batch size.
48. Identical responses for not-found and forbidden — no existence oracle.
49. CSRF applies: require `application/json` plus a CSRF header.

**Authorization**

50. Enforce in the service layer, not resolvers alone.
51. Authorize the **type/field returned**, not the entry point — any path reaches any type.
52. Object-level checks must verify ownership, not existence (IDOR).
53. Sensitive fields should be nullable so denial degrades gracefully.

**Evolution**

54. Adding fields and optional args: safe. Removing/renaming: breaking.
55. Nullable → non-null breaks servers; non-null → nullable breaks clients.
56. **Adding an enum value is breaking** for exhaustive clients.
57. `@deprecated` + field-usage metrics + `graphql-inspector` in CI.

**Operations**

58. Name every operation, or your metrics are anonymous.
59. Monitor per-operation latency, resolver timings, field usage, cost, batch sizes.
60. Alert on responses containing `errors` — status-code monitors miss them.
61. Federation: entities with `@key`, composition checks in CI, split by ownership.
62. Use codegen for client types — a schema break should fail the build.

---

## 20. References

- [GraphQL Specification](https://spec.graphql.org/) — the authority on execution, validation and error behaviour.
- [graphql.org — Learn](https://graphql.org/learn/) — schema, queries, execution, best practices.
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/) — pagination, nullability, versioning.
- [Relay Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
- [DataLoader](https://github.com/graphql/dataloader) — read the caveats on ordering and per-request construction.
- [Apollo Server — Security](https://www.apollographql.com/docs/apollo-server/security/authentication/) and [Apollo Federation](https://www.apollographql.com/docs/federation/)
- [OWASP GraphQL Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html) — depth/cost limits, batching abuse, introspection.
- [GraphQL Inspector](https://the-guild.dev/graphql/inspector) and [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)
- [urql](https://commerce.nearform.com/open-source/urql/docs/) and [Relay](https://relay.dev/docs/) documentation for client cache models.
