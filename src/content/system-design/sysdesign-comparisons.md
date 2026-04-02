# System Design Comparison Tables

Quick-reference comparison tables for system design "X vs Y" interview questions.

---

## Vertical vs Horizontal Scaling

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

**When to use which:** Start vertical for simplicity. Move horizontal when approaching hardware limits or needing high availability.

---

## SQL vs NoSQL (System Design Depth)

| Feature | SQL (PostgreSQL, MySQL) | NoSQL — Document (MongoDB, DynamoDB) | NoSQL — Wide-Column (Cassandra) |
|---|---|---|---|
| **CAP focus** | CP | CP or AP (configurable) | AP |
| **Sharding** | Complex | Built-in | Built-in (consistent hashing) |
| **Write throughput** | Single primary bottleneck | High (with sharding) | Very high (distributed writes) |
| **Query flexibility** | Ad-hoc on any column | Index required for non-PK | Must follow partition key design |
| **Transactions** | Full multi-row ACID | Single-document ACID | Lightweight transactions only |
| **Use case** | User profiles, orders, finance | Catalogs, feeds, sessions | Time-series, messaging, logs |

**When to use which:** SQL for complex queries + strong consistency. Document store for flexible schemas. Wide-column for extreme write throughput.

---

## Cache-Aside vs Write-Through vs Write-Behind

| Feature | Cache-Aside | Write-Through | Write-Behind |
|---|---|---|---|
| **Read path** | Check cache → miss → read DB → populate | Always hit (written to cache first) | Always hit |
| **Write path** | Write DB → invalidate cache | Write cache + DB **synchronously** | Write cache → **async** DB write |
| **Consistency** | Eventually consistent | Strong | Eventually consistent |
| **Write latency** | Normal | Higher (two writes) | Lower (cache only) |
| **Data loss risk** | None | None | **Yes** — if cache fails before async write |
| **Best for** | Read-heavy, tolerate staleness | Strict consistency | Write-heavy, accept some data loss |

**When to use which:** Cache-aside for most read-heavy apps. Write-through for strict consistency. Write-behind for write-heavy workloads.

---

## Strong vs Eventual Consistency

| Feature | Strong Consistency | Eventual Consistency |
|---|---|---|
| **Definition** | Every read returns most recent write | Reads may return stale data, converge over time |
| **Latency** | Higher (coordinate across replicas) | Lower (nearest replica) |
| **Availability** | Lower (wait for quorum) | Higher (any replica) |
| **CAP theorem** | Sacrifices Availability (CP) | Sacrifices Consistency (AP) |
| **Implementation** | Sync replication, Raft/Paxos | Async replication, CRDTs, vector clocks |
| **Conflict resolution** | Prevented | Required |
| **Use case** | Banking, inventory, booking | Social feeds, analytics, caching |

**When to use which:** Strong for financial correctness. Eventual for availability and low latency.
