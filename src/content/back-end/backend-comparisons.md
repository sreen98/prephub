# Backend & Networking Comparison Tables

Quick-reference comparison tables for backend and networking "X vs Y" interview questions.

---

## SQL vs NoSQL

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

**When to use which:** SQL for transactional systems and complex relationships. NoSQL for high-scale workloads and flexible schemas.

---

## REST vs GraphQL

| Feature | REST | GraphQL |
|---|---|---|
| **Endpoints** | Multiple (`/users`, `/posts`) | Single (`/graphql`) |
| **Data fetching** | Fixed response — over/under-fetching | Client specifies exact fields |
| **Caching** | HTTP caching built-in | Complex — needs special solutions |
| **Error handling** | HTTP status codes | Always 200 — errors in body |
| **Real-time** | Polling or SSE | Subscriptions (WebSocket) |
| **Learning curve** | Low | Medium |

**When to use which:** REST for simple CRUD APIs and public APIs. GraphQL when clients have diverse data needs.

---

## Cookie vs Session vs JWT

| Feature | Cookie-Based | Server Sessions | JWT |
|---|---|---|---|
| **Storage** | Browser cookie | Server memory/DB/Redis | Client (cookie or localStorage) |
| **Stateful/Stateless** | Depends | Stateful | Stateless |
| **Scalability** | Depends | Requires sticky sessions | Horizontally scalable |
| **Revocation** | Delete cookie | Delete from store (instant) | Hard — must blocklist or wait for expiry |
| **CSRF risk** | Yes | Yes | No (if in header, not cookie) |
| **XSS risk** | Mitigated with HttpOnly | Mitigated with HttpOnly | Vulnerable if in localStorage |

**When to use which:** Server sessions for instant revocation. JWTs for stateless APIs. Combine both in practice: short-lived JWT + refresh token in HttpOnly cookie.

---

## Monolith vs Microservices

| Feature | Monolith | Microservices |
|---|---|---|
| **Deployment** | Single unit | Independent per service |
| **Scaling** | Scale the whole app | Scale individual services |
| **Technology** | Single stack | Polyglot |
| **Data** | Single shared database | Database-per-service |
| **Communication** | In-process function calls | Network calls (HTTP, gRPC, queues) |
| **Complexity** | Simple initially | Distributed systems complexity |
| **Failure isolation** | One bug can crash all | Isolated to individual services |

**When to use which:** Start monolith. Migrate to microservices when you need independent scaling or team autonomy.

---

## Express vs Fastify vs Koa

| Feature | Express | Fastify | Koa |
|---|---|---|---|
| **Performance (req/s)** | ~15K | ~45K+ | ~20K |
| **Async support** | Callbacks + manual | Native async/await | Native async/await |
| **Validation** | External (Joi, Zod) | Built-in JSON Schema | External |
| **TypeScript** | Community types | First-class | Community types |
| **Ecosystem** | Largest | Growing | Smaller |

**When to use which:** Express for ecosystem. Fastify for performance + built-in validation. Koa for minimal async foundation.

---

## HTTP vs HTTPS

| Feature | HTTP | HTTPS |
|---|---|---|
| **Port** | 80 | 443 |
| **Encryption** | None | TLS/SSL |
| **Required for** | Nothing modern | PWAs, Service Workers, Geolocation |

**Always use HTTPS in production.**

---

## TCP vs UDP

| Feature | TCP | UDP |
|---|---|---|
| **Connection** | Connection-oriented (3-way handshake) | Connectionless |
| **Reliability** | Guaranteed delivery | Best-effort |
| **Ordering** | In order | No guarantee |
| **Speed** | Slower (overhead) | Faster |
| **Use cases** | HTTP, email, file transfer | DNS, gaming, streaming, VoIP |

---

## WebSocket vs HTTP Polling vs SSE

| Feature | WebSocket | HTTP Long Polling | SSE |
|---|---|---|---|
| **Direction** | Full-duplex | Client-initiated | Server-to-client |
| **Latency** | Very low | High/medium | Low |
| **Reconnection** | Manual | Built-in | Built-in (auto-reconnect) |
| **Binary data** | Yes | Yes | No (text only) |
| **Use case** | Chat, gaming | Legacy fallback | Notifications, live feeds |

---

## localStorage vs sessionStorage vs cookies

| Feature | `localStorage` | `sessionStorage` | Cookies |
|---|---|---|---|
| **Capacity** | ~5-10 MB | ~5-10 MB | ~4 KB |
| **Lifetime** | Persistent | Tab session only | Configurable |
| **Sent to server** | No | No | Yes — every request |
| **Security** | XSS vulnerable | XSS vulnerable | `HttpOnly` prevents XSS |
| **Cross-tab** | Shared | Isolated | Shared |

**When to use which:** Cookies for auth tokens the server needs. localStorage for persistent client data. sessionStorage for temporary tab-scoped data.
