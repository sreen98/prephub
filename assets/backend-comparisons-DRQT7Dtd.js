const e=`# Backend & Networking Comparison Tables

Quick-reference comparison tables for backend and networking "X vs Y" interview questions. Each section adds the **why** — the underlying behavior that produces the tradeoff.

---

## SQL vs NoSQL

Not a religious war — a tradeoff between strict consistency + rich queries (SQL) and horizontal scale + schema flexibility (NoSQL). Most real systems use both.

| Feature | SQL (Relational) | NoSQL (Non-Relational) |
|---|---|---|
| **Data model** | Tables with rows and columns | Documents, key-value, graph, wide-column |
| **Schema** | Strict, predefined | Flexible / schema-less |
| **Query language** | SQL (standardized) | Database-specific |
| **Joins** | Native, powerful | Limited — denormalization preferred |
| **ACID compliance** | Full ACID transactions | Varies — some support ACID, many favor BASE |
| **Scalability** | Vertical (horizontal complex) | Horizontal by design |
| **Consistency** | Strong by default | Eventual by default (tunable) |
| **Best for** | Complex queries, relationships, transactions | High throughput, flexible schemas |

**Why SQL's joins are powerful but hard to scale**: a join across two tables potentially requires reading from both on every query. Sharding a relational DB across machines means joins across shards, which is very expensive. That's why sharded SQL systems (Vitess, Citus) impose join restrictions or require all joined rows to live on the same shard.

**Why NoSQL encourages denormalization**: without joins, you embed related data in the document. Faster reads but now you have duplication — updating a user's name means updating every document that contains it. NoSQL schemas are designed around *read patterns*: what does each screen need, and can we fetch it with one query?

**BASE vs ACID**: BASE = Basically Available, Soft state, Eventual consistency. It's the NoSQL counterpoint to ACID — sacrifice immediate consistency for availability and scale. Many NoSQL DBs now support ACID within a single document or partition (DynamoDB transactions, MongoDB multi-document transactions) but reject the idea that every operation must be consistent across the entire data set.

**When to use which**: SQL for transactional systems, finance, inventory, and anywhere you need complex queries or strong consistency. NoSQL for high-scale workloads, flexible schemas, and well-understood access patterns. Many stacks use SQL for the transactional core and NoSQL (DynamoDB, Redis, Elasticsearch) for scale / search / cache layers.

---

## REST vs GraphQL

REST treats each resource as a URL; you get whatever fields the server decided to include. GraphQL exposes a single endpoint where the client describes the exact shape of data it wants. The tradeoff is simplicity and caching vs. flexibility and bandwidth.

| Feature | REST | GraphQL |
|---|---|---|
| **Endpoints** | Multiple (\`/users\`, \`/posts\`) | Single (\`/graphql\`) |
| **Data fetching** | Fixed response — over/under-fetching | Client specifies exact fields |
| **Caching** | HTTP caching built-in | Complex — needs special solutions |
| **Error handling** | HTTP status codes | Always 200 — errors in body |
| **Real-time** | Polling or SSE | Subscriptions (WebSocket) |
| **Learning curve** | Low | Medium |

**Why GraphQL exists**: mobile apps and rich web UIs often need data from multiple related resources. In REST, that's multiple round trips (\`GET /users/42\` then \`GET /users/42/posts\` then \`GET /users/42/followers\`) — over the network this is slow. In GraphQL, one query fetches exactly what you need across the graph in a single roundtrip.

**Why GraphQL caching is harder**: HTTP caches key on URL; with GraphQL every query goes to the same \`/graphql\`. You need client-side caches that understand the schema (Apollo Client, Relay, urql) or persisted queries (the server assigns an ID to each known query and you pass the ID, allowing HTTP caching to work).

**The N+1 query problem in GraphQL**: naive resolvers fetch the parent, then per-item fetch children, turning one query into many DB queries. DataLoader is the standard fix — it batches child lookups into a single DB query per tick.

**When to use which**: REST for simple CRUD APIs, public APIs, and when HTTP caching matters (CDN-friendly endpoints). GraphQL when clients have diverse data needs (mobile + web + internal tools all consuming the same API), when you need aggressive over/under-fetch avoidance, or when the data has a strongly graph shape.

---

## Cookie vs Session vs JWT

Three approaches to "who is this user" across requests. Cookies are a *transport* — the others describe what's carried. Session cookies store an opaque ID pointing to server-side state; JWTs store a self-verifying payload signed by the server.

| Feature | Cookie-Based | Server Sessions | JWT |
|---|---|---|---|
| **Storage** | Browser cookie | Server memory/DB/Redis | Client (cookie or localStorage) |
| **Stateful/Stateless** | Depends | Stateful | Stateless |
| **Scalability** | Depends | Requires sticky sessions | Horizontally scalable |
| **Revocation** | Delete cookie | Delete from store (instant) | Hard — must blocklist or wait for expiry |
| **CSRF risk** | Yes | Yes | No (if in header, not cookie) |
| **XSS risk** | Mitigated with HttpOnly | Mitigated with HttpOnly | Vulnerable if in localStorage |

**Why JWTs are trendy but overused**: they're stateless — any server with the signing key can verify a token, so you don't need a shared session store. Great for microservices and horizontal scaling. Downside: **you can't easily revoke them**. If a token is stolen or the user is banned, they remain valid until expiry (typically 15min–24h). To revoke, you need a blocklist — at which point you've reintroduced server-side state.

**Why server sessions are often the right call**: small apps don't have the scale problem JWTs solve. Sessions backed by Redis give you instant revocation (delete the key), lower token size (just an ID), and a place to put last-activity, roles cache, etc.

**The modern hybrid**: short-lived JWT (access token, 5–15 min) + long-lived refresh token stored in an \`HttpOnly; Secure; SameSite=Strict\` cookie. The access token is stateless for verification; the refresh flow gives you a chance to revoke. This gets most of both worlds.

**Why storing JWTs in localStorage is risky**: any XSS vulnerability steals the token. An \`HttpOnly\` cookie isn't readable by JS, so XSS can't exfiltrate it (but you get CSRF risk in return, mitigated by \`SameSite=Strict\`).

**When to use which**: Server sessions for instant revocation and small-to-medium scale. JWTs for stateless APIs that span services and need horizontal scale. In practice: combine — short-lived JWT + refresh token in HttpOnly cookie.

---

## Monolith vs Microservices

Monolith = one deployable app. Microservices = many small services each owning a bounded context, communicating over network. The tradeoff is simplicity vs. team autonomy + independent scaling.

| Feature | Monolith | Microservices |
|---|---|---|
| **Deployment** | Single unit | Independent per service |
| **Scaling** | Scale the whole app | Scale individual services |
| **Technology** | Single stack | Polyglot |
| **Data** | Single shared database | Database-per-service |
| **Communication** | In-process function calls | Network calls (HTTP, gRPC, queues) |
| **Complexity** | Simple initially | Distributed systems complexity |
| **Failure isolation** | One bug can crash all | Isolated to individual services |

**Why database-per-service is the key microservices rule**: sharing a DB across services re-couples them — one service's schema change breaks another. The whole point of microservices is independent evolution, which means services own their data and expose APIs, not tables.

**Why network calls change everything**: in-process calls are ~1ns. HTTP across a network is ~1ms. That's a 1,000,000× slowdown. It also introduces failure modes that didn't exist: timeouts, partial failures, retries, ordering issues, cascading outages. Patterns like circuit breakers, retries with jitter, and bulkheads exist to manage this.

**The "distributed monolith" trap**: microservices that are tightly coupled — they must be deployed together, share a DB, or one's release waits on another's. You paid the microservices tax without getting the benefits. Watch for this.

**When to use which**: Start with a well-structured monolith. Move to microservices when (a) the team is large enough that a single deploy cadence is a bottleneck, (b) parts of the system have genuinely different scaling profiles, or (c) you need true failure isolation between domains. A *modular monolith* — one deploy, clear internal boundaries — is often the right middle ground.

---

## Express vs Fastify vs Koa

Three popular Node.js server frameworks. Express is the original default (2010, enormous ecosystem). Koa (by the same team) is a modern async/await redesign. Fastify is the performance-and-types-first alternative.

| Feature | Express | Fastify | Koa |
|---|---|---|---|
| **Performance (req/s)** | ~15K | ~45K+ | ~20K |
| **Async support** | Callbacks + manual | Native async/await | Native async/await |
| **Validation** | External (Joi, Zod) | Built-in JSON Schema | External |
| **TypeScript** | Community types | First-class | Community types |
| **Ecosystem** | Largest | Growing | Smaller |

**Why Fastify is 3× faster than Express**: three things. (1) It uses \`find-my-way\` for routing — a radix tree that's faster than Express's regex-based lookup. (2) It uses JSON Schema to compile serializers at startup — stringifying responses is often faster than \`JSON.stringify\`. (3) It's built for Node's async model from the start; no legacy callback patches.

**Why Express still dominates**: the ecosystem. Almost every middleware, every tutorial, every "how do I..." answer is in Express. For most small-to-medium APIs, the framework is not the bottleneck — the DB is — so the performance difference is academic.

**Why Koa is smaller**: it's a minimalist async middleware base. No router, no body parser, nothing "batteries included". You compose what you need. Popular for building custom frameworks on top, less so for straight API work.

**When to use which**: Express for ecosystem, familiarity, and existing codebases. Fastify for performance, built-in validation, and first-class TypeScript. Koa when you want a minimal foundation to compose middleware around.

---

## HTTP vs HTTPS

HTTPS is HTTP over TLS. It encrypts the traffic end-to-end, authenticates the server via certificate, and (with HSTS / MTLS) can also authenticate the client.

| Feature | HTTP | HTTPS |
|---|---|---|
| **Port** | 80 | 443 |
| **Encryption** | None | TLS/SSL |
| **Required for** | Nothing modern | PWAs, Service Workers, Geolocation |

**Why HTTPS is no longer optional**: browsers mark HTTP pages as "Not Secure", HTTP/2 and HTTP/3 practically require TLS, Service Workers / PWAs / Geolocation / camera APIs all refuse to run on HTTP, and Let's Encrypt made certificates free. There's no reason to run HTTP in production.

**TLS termination**: in practice your load balancer or CDN (CloudFront, Cloudflare, ALB) terminates TLS. The backend servers speak HTTP on a private network. This is fine — the public path is encrypted, the private path is isolated. For end-to-end encryption (payment systems, healthcare), terminate TLS at the app instead.

**Always use HTTPS in production.**

---

## TCP vs UDP

The two transport-layer protocols. TCP gives you a reliable, in-order byte stream at the cost of latency and overhead. UDP gives you fire-and-forget packets with no guarantees but almost no overhead.

| Feature | TCP | UDP |
|---|---|---|
| **Connection** | Connection-oriented (3-way handshake) | Connectionless |
| **Reliability** | Guaranteed delivery | Best-effort |
| **Ordering** | In order | No guarantee |
| **Speed** | Slower (overhead) | Faster |
| **Use cases** | HTTP, email, file transfer | DNS, gaming, streaming, VoIP |

**Why TCP's reliability costs latency**: the sender must wait for ACKs, retransmit lost packets, and reorder out-of-order arrivals. The 3-way handshake alone is one RTT before any data flows. TLS adds another. For a short request on a long-latency link (mobile, satellite), you might pay hundreds of ms of handshake before the actual bytes.

**Why UDP is right for real-time**: if a voice packet from 100ms ago arrives now, it's useless — the listener is already past that point. UDP lets you drop stale packets and keep going. TCP would stall everything waiting to retransmit.

**QUIC (HTTP/3) is UDP with reliability built in**: Google designed QUIC to get TCP's reliability semantics *on top of* UDP so it can be improved without waiting for kernel upgrades. It reduces handshake roundtrips (0-RTT resumption) and avoids head-of-line blocking on lost packets. Modern browsers + CDNs default to HTTP/3 where available.

---

## WebSocket vs HTTP Polling vs SSE

Three approaches to "server needs to push to client". WebSockets are full-duplex. SSE is one-way server-to-client over HTTP. Polling is the lowest-common-denominator fallback.

| Feature | WebSocket | HTTP Long Polling | SSE |
|---|---|---|---|
| **Direction** | Full-duplex | Client-initiated | Server-to-client |
| **Latency** | Very low | High/medium | Low |
| **Reconnection** | Manual | Built-in | Built-in (auto-reconnect) |
| **Binary data** | Yes | Yes | No (text only) |
| **Use case** | Chat, gaming | Legacy fallback | Notifications, live feeds |

**Why SSE is underrated**: it's just HTTP. Browsers handle reconnection and last-event-ID replay automatically. Proxies, CDNs, and auth all work unchanged. Perfect for notifications, live feeds, progress updates, and anywhere you only need server → client. WebSockets shine when you genuinely need bidirectional real-time (collaborative editing, games).

**Why polling persists**: some environments block long-lived connections (corporate proxies, serverless platforms with short timeouts). Polling every N seconds always works. Long polling (hold the request open until data arrives or timeout) gets most of the latency benefit.

---

## localStorage vs sessionStorage vs cookies

Browser storage options. \`localStorage\` and \`sessionStorage\` are pure client APIs — the server never sees them. Cookies are sent with every request to the matching domain.

| Feature | \`localStorage\` | \`sessionStorage\` | Cookies |
|---|---|---|---|
| **Capacity** | ~5-10 MB | ~5-10 MB | ~4 KB |
| **Lifetime** | Persistent | Tab session only | Configurable |
| **Sent to server** | No | No | Yes — every request |
| **Security** | XSS vulnerable | XSS vulnerable | \`HttpOnly\` prevents XSS |
| **Cross-tab** | Shared | Isolated | Shared |

**Why cookies are still essential for auth**: only cookies can be \`HttpOnly\` (not readable by JS). That's how you protect auth tokens from XSS. \`localStorage\` is readable by any script — an XSS bug hands over your tokens.

**Why localStorage/sessionStorage are synchronous**: small mercy — they block the main thread. This is fine for small values but noticeable if you're storing a lot. IndexedDB is the async alternative for large structured data.

**Cookies are size-limited**: 4 KB per cookie, ~20 per domain, 4 KB total per request. Don't store big JSON blobs. Use a short session ID + server-side storage, or split across cookies.

**When to use which**: Cookies for auth tokens (server needs them, benefits from \`HttpOnly\`). \`localStorage\` for persistent client-only data (preferences, drafts, cache). \`sessionStorage\` for tab-scoped temporary state. For structured or large data, reach for IndexedDB.
`;export{e as default};
