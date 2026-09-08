# GraphQL Cheat Sheet

## Schema (SDL)
```graphql
scalar DateTime

type Candidate implements Node {
  id: ID!                       # ! = non-null
  name: String!
  email: String                 # nullable: may be hidden by authorization
  applications(first: Int = 10, after: String): ApplicationConnection!
}

interface Node { id: ID! }
enum Status { APPLIED SCREEN OFFER REJECTED }
union SearchResult = Candidate | Role
input CandidateInput { name: String!  email: String }   # inputs are a separate kind

type Query    { candidate(id: ID!): Candidate }
type Mutation { createCandidate(input: CandidateInput!): CreateCandidatePayload! }
type Subscription { statusChanged(id: ID!): Application! }
```

## Nullability — the highest-leverage decision
```
String    nullable
String!   non-null
[String]  nullable list, nullable items
[String!] nullable list, non-null items
[String!]! non-null list, non-null items
```
A failing **non-null** field nulls out the nearest **nullable ancestor** — and if every ancestor is non-null, all of `data` becomes `null`. So over-using `!` turns one flaky field into a total request failure. Non-null for invariants (`id`); nullable for anything remote, permission-gated, or legitimately absent.

## Operations
```graphql
query GetCandidate($id: ID!, $withApps: Boolean!) {   # always use variables
  candidate(id: $id) {
    ...Core
    applications @include(if: $withApps) { role }
  }
}
fragment Core on Candidate { id name }

mutation {
  createCandidate(input: { name: "Ana" }) {
    candidate { id name }        # return the mutated object for cache updates
    errors { field message code }# expected errors as DATA
  }
}
```
Directives: `@include(if:)`, `@skip(if:)`, `@deprecated(reason:)`.

**Root mutation fields run serially**; query fields run in parallel. Serial is **not** transactional.

## Resolvers
```js
const resolvers = {
  Query:     { candidate: (_p, { id }, ctx) => ctx.db.candidate(id) },
  Candidate: {
    applications: (parent, args, ctx) => ctx.loaders.apps.load(parent.id),
    email: (parent, _a, ctx) => ctx.can('read:email', parent) ? parent.email : null,
  },
};
```
`(parent, args, context, info)` — `parent` is what the parent field resolved to. Build **context per request**. Missing resolvers fall back to `parent[fieldName]`.

## DataLoader — the N+1 fix
```js
const loader = new DataLoader(async (ids) => {
  const rows = await db.company.findMany({ where: { id: { in: ids } } });
  const byId = new Map(rows.map(r => [r.id, r]));
  return ids.map(id => byId.get(id) ?? null);   // SAME length, SAME order
});
```
- Batches keys collected within one event-loop tick; 101 queries → 2.
- **Per-request** construction — a shared loader leaks data between users.
- `await` in a loop defeats batching; use `Promise.all`.
- Batch size stuck at 1 in metrics = batching is broken.

## Pagination (Relay connections)
```graphql
type ApplicationConnection {
  edges: [ApplicationEdge!]!
  pageInfo: PageInfo!
  totalCount: Int                 # nullable — often the expensive part
}
type ApplicationEdge { node: Application!  cursor: String! }
type PageInfo { hasNextPage: Boolean!  hasPreviousPage: Boolean!
                startCursor: String  endCursor: String }
```
Cursors are **opaque** (base64 a keyset) — clients must never parse them. `hasNextPage` is cheap: fetch `first + 1`.

## Errors
```json
{ "data": { "candidate": { "name": "Ana", "company": null } },
  "errors": [{ "message": "upstream down",
               "path": ["candidate","company"],
               "extensions": { "code": "UPSTREAM_UNAVAILABLE" } }] }
```
- **`200` even for execution errors**; `400` for invalid/malformed queries.
- `data` and `errors` can **both** be present — never trust `res.ok` alone.
- Exceptional errors → the `errors` array with an `extensions.code`.
- Expected errors → **data**, as a non-null `[UserError!]!` in the payload.

## Caching
| Layer | Mechanism |
|---|---|
| HTTP/CDN | **broken** by default — one URL, one verb |
| Persisted queries + `GET` | restores a cacheable URL |
| Client normalized cache | keyed by type + `id` — always request `id` |
| Server data cache | cache what resolvers fetch, not whole responses |
| DataLoader | per-request memoization |

A response's `maxAge` is the **minimum** of its fields'. Anything user-specific must be scoped `PRIVATE`.

## Security
```
max depth limit           + static COST analysis (depth misses first: 100000)
rate limit on query COST  (aliases and array batching multiply work)
disable introspection in production; persisted-query allow-listing is stronger
cap query length, parse depth, alias count, batch size
identical response for not-found and forbidden (no existence oracle)
require Content-Type: application/json + a CSRF header
disable stack traces; map exceptions in formatError
```

## Authorization
Enforce in the **service layer**, not resolvers alone. Authorize the **type/field returned**, not the entry point — any path can reach any type, so a check on `Query.candidate` does nothing when the type is also reachable via `Company.candidates`. Object-level checks must verify **ownership**, not existence (IDOR).

## Evolution
```
safe      : add a field, add an OPTIONAL argument
breaking  : remove/rename, add a REQUIRED argument
breaking  : nullable → non-null (servers), non-null → nullable (clients)
breaking  : ADD AN ENUM VALUE (clients switching exhaustively)
process   : @deprecated → watch field-usage metrics → remove
CI        : graphql-inspector fails the build on a breaking change
```

## Federation
```graphql
type Candidate @key(fields: "id") { id: ID!  name: String! }   # owning subgraph
type Candidate @key(fields: "id") { id: ID! @external
                                    applications: [Application!]! }  # extending
```
Split subgraphs by **ownership / bounded context**, not technical layer. Composition checks in CI are mandatory.

## Monitoring
Name **every** operation, or your metrics are anonymous. Track per-operation latency, resolver timings, field usage, cost distribution, DataLoader batch sizes. **Alert on responses containing `errors`** — status-code monitors miss them entirely.
