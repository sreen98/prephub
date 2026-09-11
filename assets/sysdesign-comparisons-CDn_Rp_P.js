const e=`# System Design Comparison Tables

Quick-reference comparison tables for system design "X vs Y" interview questions. Each section explains the **why** — the systems-level tradeoff each decision encodes.

---

## Vertical vs Horizontal Scaling

Vertical scaling (scale-up) adds power to the machine you already have — more CPU, more RAM, faster disks. Horizontal scaling (scale-out) adds *more machines* and distributes the work across them. The tradeoff is simplicity vs. fault tolerance vs. ceiling.

| Feature | Vertical (Scale Up) | Horizontal (Scale Out) |
|---|---|---|
| **Approach** | More power to existing machine | More machines to the pool |
| **Complexity** | Simple — no code changes | Complex — load balancing, partitioning |
| **Cost curve** | Exponential | Linear |
| **Downtime** | Usually requires restart | Zero downtime |
| **Upper limit** | Hardware ceiling | Theoretically unlimited |
| **SPOF** | Yes | No (with redundancy) |
| **State** | Simple (single machine) | Complex (distributed) |
| **Best for** | Databases, early-stage apps | Stateless services, web tier |

**Why the cost curve diverges**: a 2× bigger EC2 instance roughly doubles in price — but an 8× bigger one costs far more than 8× because the hardware at the top end is specialized (high-frequency CPUs, NVMe arrays). Commodity hardware × N is the cheap path. Once you're past the knee of the curve, scaling out is almost always cheaper per unit of work.

**Why vertical is simpler**: your app stays single-node. No distributed locking, no session affinity, no split-brain scenarios, no "which node owns this data?" question. This is why you keep databases vertical for as long as possible — the engineering cost of sharding a database is enormous.

**Why stateless services scale horizontally well**: if any worker can serve any request, you just load-balance. Once workers need to remember state (session, in-memory cache), you need sticky sessions or a shared state store, which adds complexity.

**When to use which**: Start vertical for simplicity. Move horizontal when approaching hardware limits, needing high availability (removing SPOFs), or when the stateless layer of your system (web / app servers) is the bottleneck. Keep databases vertical longer; shard only when you've exhausted read replicas, caching, and query optimization.

---

## SQL vs NoSQL (System Design Depth)

This isn't really SQL vs NoSQL — it's which consistency / scale / query tradeoff you want. Relational DBs default to strong consistency on a single primary with optional async replicas. Document stores (Mongo, DynamoDB) let you pick per-operation consistency and scale horizontally. Wide-column stores (Cassandra) are AP-first — built for extreme write throughput at the cost of strict consistency.

| Feature | SQL (PostgreSQL, MySQL) | NoSQL — Document (MongoDB, DynamoDB) | NoSQL — Wide-Column (Cassandra) |
|---|---|---|---|
| **CAP focus** | CP | CP or AP (configurable) | AP |
| **Sharding** | Complex | Built-in | Built-in (consistent hashing) |
| **Write throughput** | Single primary bottleneck | High (with sharding) | Very high (distributed writes) |
| **Query flexibility** | Ad-hoc on any column | Index required for non-PK | Must follow partition key design |
| **Transactions** | Full multi-row ACID | Single-document ACID | Lightweight transactions only |
| **Use case** | User profiles, orders, finance | Catalogs, feeds, sessions | Time-series, messaging, logs |

**Why "schema-less" is overrated**: document stores don't force a schema at insert time, but every app has an implicit schema — the one the code assumes. Without a DB-enforced schema, that implicit schema drifts across versions and you end up writing migration code anyway. The real NoSQL advantage isn't "no schema" — it's *horizontal scalability* and *predictable access patterns*.

**Why Cassandra writes are so fast**: writes hit an in-memory memtable and a commit log locally, then replicate asynchronously. No primary coordinator to bottleneck. Reads, however, may need to scan multiple SSTables and reconcile — which is why access patterns must be designed around the partition key.

**Why DynamoDB forces access-pattern-first modeling**: queries outside the partition key require a secondary index (GSI / LSI), and each GSI doubles your write cost. So you model your table around the reads you need, sometimes duplicating data across indexes. This is the opposite of "design the schema, write any query".

**When to use which**: SQL for complex queries, strong consistency, and small-to-medium scale where joins and transactions matter (finance, orders, user profiles). Document store for flexible schemas and horizontal scale (catalogs, feeds, sessions). Wide-column for extreme write throughput (time-series, logs, messaging).

---

## Cache-Aside vs Write-Through vs Write-Behind

Three strategies for keeping a cache and a database in sync. The tradeoff is consistency, write latency, and blast radius of a cache failure.

| Feature | Cache-Aside | Write-Through | Write-Behind |
|---|---|---|---|
| **Read path** | Check cache → miss → read DB → populate | Always hit (written to cache first) | Always hit |
| **Write path** | Write DB → invalidate cache | Write cache + DB **synchronously** | Write cache → **async** DB write |
| **Consistency** | Eventually consistent | Strong | Eventually consistent |
| **Write latency** | Normal | Higher (two writes) | Lower (cache only) |
| **Data loss risk** | None | None | **Yes** — if cache fails before async write |
| **Best for** | Read-heavy, tolerate staleness | Strict consistency | Write-heavy, accept some data loss |

**Why cache-aside is the default**: it's the simplest to reason about and the DB is the source of truth. The cache is just an opportunistic speedup. If the cache fails or returns stale data, the app degrades gracefully — it hits the DB. The downside is the "thundering herd" on cold cache (many requests miss simultaneously and hammer the DB); solve with request coalescing or cache warming.

**Why write-through doubles write latency**: every write goes to both the cache and the DB. You pay both costs. But reads are always fast — and consistency is strong because the cache can never be stale (as long as no one bypasses the cache to write to the DB).

**Why write-behind is dangerous**: you acknowledge the write after updating the cache, queueing the DB write for later. Fast — but a cache node crash loses acknowledged writes. Only use when the workload can tolerate some loss (analytics events, non-critical counters) and never for money or inventory.

**Stampede protection**: on cache miss, lock the key so only one request populates it; everyone else waits. Redis has \`SET key value NX PX ttl\` for exactly this.

**When to use which**: Cache-aside for most read-heavy apps — it's the safe default. Write-through when you need strict consistency and can afford the write latency. Write-behind for write-heavy, loss-tolerant workloads.

---

## Strong vs Eventual Consistency

The defining tradeoff in distributed systems. Strong consistency means every reader sees the most recent write, immediately. Eventual consistency means readers might see stale data for a while but all replicas converge eventually. The difference comes from **where the coordination happens**.

| Feature | Strong Consistency | Eventual Consistency |
|---|---|---|
| **Definition** | Every read returns most recent write | Reads may return stale data, converge over time |
| **Latency** | Higher (coordinate across replicas) | Lower (nearest replica) |
| **Availability** | Lower (wait for quorum) | Higher (any replica) |
| **CAP theorem** | Sacrifices Availability (CP) | Sacrifices Consistency (AP) |
| **Implementation** | Sync replication, Raft/Paxos | Async replication, CRDTs, vector clocks |
| **Conflict resolution** | Prevented | Required |
| **Use case** | Banking, inventory, booking | Social feeds, analytics, caching |

**Why strong consistency costs latency**: a write must propagate to enough replicas (a *quorum*) before the system acknowledges it. That's an extra round trip on every write. Protocols like Raft and Paxos make this work correctly in the face of failures, but the round trip is unavoidable.

**Why eventual consistency is everywhere**: most of what we do online doesn't need strong consistency. Seeing a slightly stale friend count, an outdated view of comments, a cached product listing — none of these break the app. Eventual consistency gives you low latency and high availability in exchange for occasional (bounded) staleness.

**CAP theorem's oversimplification**: in reality, it's **PACELC** — if there's a **P**artition, choose **A** or **C**; **E**lse (no partition), choose **L**atency or **C**onsistency. Even without partitions, you're choosing between waiting for coordination (low latency) or getting the freshest value (low latency).

**When to use which**: Strong for financial correctness (money transfers, inventory decrements, seat booking). Eventual for availability and low latency (social feeds, search results, caches, analytics). Most systems are a mix — use strong consistency selectively where it matters.

---

## Monolith vs Microservices

A monolith is one deployable unit — one codebase, one build, one process. Microservices split the same app into independent services that communicate over network calls (HTTP, gRPC, queues). The tradeoff is operational complexity against team autonomy and scale.

| Feature | Monolith | Microservices |
|---|---|---|
| **Deploy unit** | One app | Many independent services |
| **Codebase** | Single repo or monorepo | Many repos or monorepo with domains |
| **Team model** | Works for small teams | Enables independent teams |
| **Scaling** | Scale the whole app | Scale each service independently |
| **Failure isolation** | One bug can crash everything | Failures contained to a service |
| **Network** | In-process calls (fast) | Network calls (slow, unreliable) |
| **Transactions** | ACID easy | Distributed transactions (saga) |
| **Complexity** | Simple to build and deploy | Complex: service mesh, tracing, discovery |
| **Best for** | Small teams, startups, MVPs | Large teams, independent release cadences |

**Why microservices aren't "always better"**: they replace function calls with network calls. That's 1000× slower and 1000× more failure modes (timeouts, partial success, ordering issues). For a 5-engineer team on a new product, splitting a single app into 12 services creates more problems than it solves.

**The real reason companies move to microservices**: **team scaling**, not performance. When you have 200 engineers and everyone commits to the same monolith, deployment coordination becomes a bottleneck. Splitting into services lets teams deploy independently.

**Distributed monolith anti-pattern**: microservices that are tightly coupled — one service's release requires another to be updated, they share databases, their teams are entangled. You've paid the complexity cost of microservices without gaining the autonomy. Watch for this.

**When to use which**: Start with a well-structured monolith. Move to microservices when (a) the team outgrows a single deploy cadence, (b) different parts of the system have genuinely different scaling needs, or (c) domain boundaries are stable and well-understood. "Modular monolith" is often a better destination than microservices for most companies.

---

## Synchronous vs Asynchronous Communication

How services talk to each other. Sync means the caller waits for a response (HTTP request/response, gRPC). Async means the caller fires and forgets — the receiver processes later (queue, event bus).

| Feature | Synchronous (HTTP, gRPC) | Asynchronous (Queue, Event bus) |
|---|---|---|
| **Coupling** | Tight — caller waits for callee | Loose — caller only depends on queue |
| **Latency** | Lower end-to-end if callee is fast | Higher end-to-end (queued) |
| **Availability** | Fails if callee is down | Buffered — callee can be down temporarily |
| **Backpressure** | Caller must retry on overload | Queue absorbs bursts |
| **Ordering** | In-order per connection | Typically unordered (or expensive to order) |
| **Debugging** | Easier — linear trace | Harder — distributed traces |
| **Use case** | User-facing requests, queries | Background jobs, events, notifications |

**Why async buys you resilience**: if the receiver is slow or down, messages pile in the queue instead of cascading failures up the stack. The caller acknowledged "I put the message in", not "the work is done". You also get natural backpressure — queue depth is an observable signal.

**Why sync is required for user-facing flows**: a user clicking "buy" expects a response now, not "we'll tell you later". For anything the UI blocks on, sync is the right choice. For side effects that don't block the user (send confirmation email, update analytics, sync to CRM), async is better.

**The hybrid pattern**: sync for the user-facing request, async for the follow-ups. The API returns immediately with "order created", while in the background an event is published that downstream services subscribe to.

**When to use which**: Sync for user-facing queries and commands where the caller needs an immediate result. Async for background processing, event notifications, fan-out to multiple consumers, and when the caller doesn't need to wait.
`;export{e as default};
