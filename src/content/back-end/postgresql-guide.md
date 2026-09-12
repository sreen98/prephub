# PostgreSQL — Interview Guide

This guide is about **Postgres the engine**. The SQL language itself — joins, window functions, indexes, query plans, isolation levels, the N+1 problem — is covered in the [SQL & Relational Databases guide](/backend/sql); this one covers what makes Postgres behave the way it does, and the operational knowledge interviews probe once you claim Postgres experience.

The three things that come up most: **MVCC and why `VACUUM` exists** (§2), **connection handling** (§8), and **why your index isn't being used** (§5).

## Table of Contents

1. [Architecture](#1-architecture)
2. [MVCC, Bloat and VACUUM](#2-mvcc-bloat-and-vacuum)
3. [The WAL](#3-the-wal)
4. [Transactions and Isolation in Postgres](#4-transactions-and-isolation-in-postgres)
5. [Indexes](#5-indexes)
6. [Reading EXPLAIN in Postgres](#6-reading-explain-in-postgres)
7. [JSONB](#7-jsonb)
8. [Connections and Pooling](#8-connections-and-pooling)
9. [Replication and High Availability](#9-replication-and-high-availability)
10. [Partitioning](#10-partitioning)
11. [Extensions and pgvector](#11-extensions-and-pgvector)
12. [Schema Migrations Without Downtime](#12-schema-migrations-without-downtime)
13. [Postgres vs MySQL](#13-postgres-vs-mysql)
14. [Interview Questions and Answers](#14-interview-questions-and-answers)
15. [Tricky Questions](#15-tricky-questions)
16. [Cheat Sheet](#16-cheat-sheet)
17. [References](#17-references)

---

## 1. Architecture

Postgres is **process-per-connection**, not thread-per-connection. A supervisor (`postmaster`) forks a backend process for each client, plus background workers:

| Process | Job |
|---|---|
| `postmaster` | listens, forks backends |
| backend | one per connection, runs your queries |
| **checkpointer** | flushes dirty pages, bounds crash recovery |
| **WAL writer** | writes the write-ahead log |
| **autovacuum launcher/workers** | reclaims dead tuples (§2) |
| background writer | trickles dirty buffers out |

Shared memory holds **`shared_buffers`**, the page cache. Data lives in 8 KB **pages**; a table is a "heap" of pages, and a row version is a **tuple**.

The process model has one consequence that dominates operations: **a connection is expensive** — a whole OS process plus its own memory. That is why pooling is not optional (§8), and it differs sharply from MySQL's thread-per-connection model.

---

## 2. MVCC, Bloat and VACUUM

This is the most Postgres-specific thing there is, and the source of most surprises.

**MVCC** (Multi-Version Concurrency Control) means writers never block readers and readers never block writers. Postgres achieves it by **never updating a row in place**:

- `UPDATE` writes a **new tuple** and marks the old one dead.
- `DELETE` only marks the tuple dead.
- Each tuple carries `xmin` (the transaction that created it) and `xmax` (the transaction that deleted it).
- A transaction sees a tuple if `xmin` is committed and visible to its snapshot, and `xmax` is not.

So a table accumulates **dead tuples**, and this is what "bloat" means: pages full of row versions nobody can see any more. Consequences that trip people up:

- A table that only ever receives `UPDATE`s still grows.
- `DELETE` does **not** free disk space. `SELECT count(*)` can be slow on a bloated table because it still walks the pages.
- `SELECT count(*)` has no shortcut in Postgres regardless — there is no stored row count, because a count is snapshot-dependent.

**`VACUUM`** reclaims dead tuples for reuse. **Autovacuum** does it automatically, triggered when dead tuples exceed a fraction of the table (`autovacuum_vacuum_scale_factor`, default 0.2 — i.e. 20%). Points that matter:

- Plain `VACUUM` marks space **reusable by the table**; it does not return it to the OS. `VACUUM FULL` does, but takes an `ACCESS EXCLUSIVE` lock and rewrites the whole table — never run it on a live hot table. Use `pg_repack` for online compaction.
- `VACUUM` also updates the **visibility map**, which is what enables index-only scans.
- `ANALYZE` updates **planner statistics**; a plan regression after a bulk load is usually stale stats.
- On huge, frequently updated tables the default 20% threshold is far too lax — tune the scale factor down per table.

**What blocks vacuum** is the classic production incident: a **long-running transaction**, an **idle-in-transaction** connection, an unused **replication slot**, or a **prepared transaction** holds the oldest visible snapshot, so vacuum cannot remove any tuple newer than it. Bloat then grows without bound while autovacuum runs and reclaims nothing. Watch `pg_stat_activity` for `state = 'idle in transaction'` and set `idle_in_transaction_session_timeout`.

**Transaction ID wraparound.** XIDs are 32-bit. Postgres must "freeze" old tuples before the counter wraps, and if it cannot — usually because vacuum is blocked — it starts warning, then refuses writes entirely to protect data. That is one of the few ways to take a Postgres cluster fully read-only, and it is always the same root cause: vacuum was prevented from running.

---

## 3. The WAL

Every change is written to the **write-ahead log** before the data pages are updated. Durability comes from the WAL, not from flushing pages: on `COMMIT`, the WAL record must hit disk, and page writes can lag.

This buys three things at once: crash recovery (replay the WAL from the last checkpoint), **streaming replication** (ship WAL to replicas, §9), and **point-in-time recovery** (a base backup plus archived WAL replayed to a chosen moment).

A **checkpoint** flushes all dirty buffers and records a WAL position; recovery starts there. Frequent checkpoints mean fast recovery and more I/O; infrequent means the reverse. `synchronous_commit = off` makes commits return before the WAL is flushed — a large throughput gain in exchange for possibly losing the last fraction of a second of committed transactions on a crash. That is a legitimate trade for analytics ingestion and a bad one for payments.

---

## 4. Transactions and Isolation in Postgres

Postgres implements three of the four SQL isolation levels; **`READ UNCOMMITTED` behaves as `READ COMMITTED`** because MVCC gives no way to see uncommitted data.

| Level | Dirty read | Non-repeatable read | Phantom | Serialization anomaly |
|---|---|---|---|---|
| Read Committed **(default)** | no | possible | possible | possible |
| Repeatable Read | no | no | **no** | possible |
| Serializable | no | no | no | no |

Two Postgres-specific facts worth stating:

- **The default is `READ COMMITTED`**, and each *statement* gets a fresh snapshot. So two identical `SELECT`s in one transaction can return different data.
- **Postgres's `REPEATABLE READ` also prevents phantom reads**, which the SQL standard does not require — it is implemented as full snapshot isolation. But snapshot isolation still permits **write skew**: two transactions each read a condition, each write, and the combination violates an invariant neither could see being broken. The classic case is two doctors both dropping off-call because each sees one other on call.
- **`SERIALIZABLE`** uses Serializable Snapshot Isolation, which detects dangerous read/write dependencies and aborts one transaction with a serialization failure (`40001`) rather than locking. So the application **must be prepared to retry**; that is the price of using it.

```sql
-- explicit row locks when you need them
SELECT * FROM jobs WHERE state = 'queued'
ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 10;   -- the queue-worker idiom
```

`FOR UPDATE SKIP LOCKED` is how you build a work queue in Postgres: each worker grabs rows nobody else has locked instead of blocking behind them. `NOWAIT` fails immediately instead of waiting.

---

## 5. Indexes

**B-tree** is the default and covers equality, ranges and ordering. The others exist for specific shapes:

| Type | Use for |
|---|---|
| **B-tree** | `=`, `<`, `>`, `BETWEEN`, `ORDER BY`, unique constraints |
| **GIN** | containment over composite values — `jsonb`, arrays, full-text |
| **GiST** | geometric, ranges, nearest-neighbour |
| **BRIN** | very large naturally-ordered tables (append-only time series) |
| **Hash** | equality only; rarely worth it over B-tree |

Postgres-specific index features that come up:

```sql
-- partial: index only the rows you query
CREATE INDEX ON orders (created_at) WHERE status = 'pending';

-- expression: makes a non-sargable predicate sargable
CREATE INDEX ON users (lower(email));      -- for WHERE lower(email) = $1

-- covering: extra columns stored in the index for index-only scans
CREATE INDEX ON orders (customer_id) INCLUDE (total);

-- build without locking out writes — ALWAYS use this in production
CREATE INDEX CONCURRENTLY ON orders (customer_id);
```

**Why your index isn't used** — the list to run through:

1. **Non-sargable predicate.** Wrapping the column in a function (`WHERE lower(email) = …`, `WHERE date(created_at) = …`) defeats a plain index. Fix with an expression index, or rewrite as a range.
2. **Leftmost-prefix rule.** An index on `(a, b, c)` serves `a`, `(a,b)`, `(a,b,c)` — not `b` alone.
3. **Type mismatch.** Comparing a `varchar` column to an integer, or a `timestamptz` to a `timestamp`, can force a cast on the column side.
4. **Low selectivity.** If the predicate matches a large fraction of the table, a sequential scan genuinely is cheaper. The planner is right.
5. **Stale statistics** — run `ANALYZE`.
6. **The table is tiny.** A seq scan on one page always wins.
7. `CREATE INDEX CONCURRENTLY` **failed**, leaving an `INVALID` index. Check `pg_index.indisvalid`; drop and rebuild.

Note `CONCURRENTLY` cannot run inside a transaction block, takes two table passes, and on failure leaves that invalid index behind — a real gotcha in migration tooling that wraps everything in a transaction.

---

## 6. Reading EXPLAIN in Postgres

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) SELECT …;
```

`EXPLAIN` alone shows the *estimated* plan; `ANALYZE` executes and shows actuals. `BUFFERS` shows cache hits versus disk reads, which is how you tell "slow because of I/O" from "slow because of CPU".

The single most useful signal: **compare estimated `rows` against actual `rows`.** A large divergence is the root cause of most bad plans, and it points at stale statistics, correlated columns the planner assumes are independent, or a predicate it cannot estimate. Fix with `ANALYZE`, raising `default_statistics_target` for that column, or `CREATE STATISTICS` for correlated columns.

Node types to recognise: `Seq Scan`, `Index Scan`, `Index Only Scan` (satisfied entirely from the index — needs the visibility map, hence vacuum), `Bitmap Heap Scan` (many scattered matches), `Nested Loop` (good for few rows, catastrophic for many), `Hash Join` (big unsorted sets), `Merge Join` (both inputs sorted). Watch for `Rows Removed by Filter` (an index that isn't selective enough) and external `Sort` spilling to disk (raise `work_mem`).

Timing caveat: `EXPLAIN ANALYZE` **executes the query**, including `INSERT`/`UPDATE`/`DELETE` — wrap those in a transaction you roll back.

---

## 7. JSONB

`json` stores the text verbatim; **`jsonb` stores a parsed binary form** — slightly slower to write, far faster to read, supports indexing, and de-duplicates keys while not preserving key order. Use `jsonb` unless you need the exact original text.

```sql
SELECT data->'address'->>'city' FROM users;   -- -> returns jsonb, ->> returns text
SELECT * FROM users WHERE data @> '{"plan":"pro"}';        -- containment
CREATE INDEX ON users USING GIN (data);                    -- all keys/values
CREATE INDEX ON users USING GIN (data jsonb_path_ops);     -- smaller, @> only
CREATE INDEX ON users ((data->>'email'));                  -- one hot key, B-tree
```

The judgement question is **when to use it**. Good: genuinely schemaless attributes, third-party payloads you store verbatim, sparse per-tenant custom fields. Bad: as a way to avoid designing a schema. The costs are real — no constraints or foreign keys inside a document, no type checking, planner estimates on jsonb predicates are weak, and updating one key rewrites the **whole document** (MVCC, §2), so a large document under frequent partial updates generates heavy bloat. A hybrid schema — real columns for what you query and constrain, `jsonb` for the long tail — is usually the right answer.

---

## 8. Connections and Pooling

Because each connection is an OS process with its own memory, Postgres handles **hundreds** of connections, not tens of thousands. Exceeding capacity does not queue gracefully; it degrades badly and then refuses connections (`max_connections`).

So a pooler is mandatory at any scale:

- **Application-side pool** (HikariCP, `pg` Pool, SQLAlchemy) — reuses connections within one process. Necessary but insufficient when you run many processes: 50 pods × 20 connections = 1,000 connections.
- **PgBouncer / RDS Proxy** — an external pooler multiplexing many client connections onto few server connections. In **transaction** pooling mode a server connection is assigned only for the duration of a transaction, which is what makes high client counts possible.

The catch with transaction pooling: anything relying on **session state** breaks, because you are not guaranteed the same backend between statements — session-level `SET`, `LISTEN`/`NOTIFY`, advisory locks, `WITH HOLD` cursors, and server-side prepared statements. `session` pooling mode keeps state but loses most of the multiplexing benefit.

**Serverless makes this worse**: each Lambda container holds its own pool, so N concurrent invocations open N pools. Pool size 1–2 per container, short idle timeouts, and a proxy in front (§18.8 of the [Python guide](/backend/python)).

Also watch **`idle in transaction`**: a connection that opened a transaction and went quiet holds locks and blocks vacuum (§2). Set `idle_in_transaction_session_timeout` and `statement_timeout` as defence.

---

## 9. Replication and High Availability

**Physical (streaming) replication** ships WAL to replicas that replay it byte-for-byte. Replicas are read-only and identical to the primary — the standard HA and read-scaling mechanism.

- **Asynchronous** (default): the primary commits without waiting. Fast, but a failover can lose the last transactions.
- **Synchronous** (`synchronous_commit = on` plus `synchronous_standby_names`): commit waits for a standby to confirm. No data loss, higher latency, and if the sole synchronous standby is down, **commits block** — so configure a quorum, not a single standby.

**Replica lag** is the thing that causes application bugs: a user writes, then reads from a replica and doesn't see their own write. Fixes are read-your-writes routing (send a user's reads to the primary for a short window), or `synchronous_commit = remote_apply` at the cost of latency. Monitor lag in bytes and seconds.

**Logical replication** replicates row-level changes for selected tables via publications and subscriptions. Use it for cross-version upgrades, selective replication and CDC into other systems. It does not replicate DDL, and a **replication slot whose consumer is gone will retain WAL forever** and block vacuum — a frequent cause of a disk filling up.

Failover needs an external tool: **Patroni**, `repmgr`, or a managed service. Postgres does not elect a new primary by itself, and two primaries accepting writes (split brain) is the failure to design against.

---

## 10. Partitioning

Declarative partitioning splits one logical table into physical children:

```sql
CREATE TABLE events (id bigserial, created_at timestamptz NOT NULL, payload jsonb)
  PARTITION BY RANGE (created_at);

CREATE TABLE events_2026_09 PARTITION OF events
  FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
```

`RANGE` (time series), `LIST` (tenant or region), `HASH` (even spread).

The real wins are **cheap bulk deletion** — `DROP TABLE events_2026_01` is instant where `DELETE` would generate enormous bloat and WAL — plus **partition pruning** so queries touch only relevant children, smaller per-partition indexes, and per-partition maintenance.

Costs: the **partition key must be in the query** or pruning cannot happen and you scan everything; a unique constraint must include the partition key; too many partitions slows planning; and cross-partition queries can be slower than one well-indexed table. Partition when a table is genuinely large *and* has a natural key you always filter on — usually time. It is not a general performance fix.

---

## 11. Extensions and pgvector

Extensions are Postgres's real differentiator — the engine is pluggable in ways MySQL is not:

| Extension | Purpose |
|---|---|
| **`pg_stat_statements`** | aggregated query statistics — **enable this everywhere** |
| `pgvector` | vector similarity search |
| `PostGIS` | geospatial |
| `pg_trgm` | trigram fuzzy matching and `LIKE '%x%'` indexing |
| `pg_partman` | automated partition management |
| `pgcrypto` | hashing and encryption functions |

`pg_stat_statements` is the first thing to turn on: it tells you which normalised queries consume the most total time, which is nearly always where the win is.

### pgvector — RAG on the database you already run

```sql
CREATE EXTENSION vector;

CREATE TABLE chunks (
  id bigserial PRIMARY KEY,
  document_id bigint NOT NULL REFERENCES documents(id),
  content text NOT NULL,
  embedding vector(1536) NOT NULL           -- dimension is fixed at declaration
);

-- HNSW: better recall/latency, slower build, more memory
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);

-- nearest neighbours by cosine distance
SELECT id, content, embedding <=> $1 AS distance
FROM chunks
WHERE document_id = ANY($2)                 -- metadata filter
ORDER BY embedding <=> $1
LIMIT 10;
```

Operators: `<->` L2, `<=>` cosine, `<#>` negative inner product. **The operator in `ORDER BY` must match the index's opclass**, or the index is ignored and you get a full scan — the single most common pgvector mistake.

Index choice: **HNSW** (graph-based) gives better recall at a given latency and doesn't need training data, at the cost of build time and memory; **IVFFlat** builds faster and uses less memory but needs representative data present before building and is sensitive to the `lists` parameter. Both are **approximate** — tune `hnsw.ef_search` or `ivfflat.probes` to trade recall against speed, and measure recall against exact search rather than assuming.

Why choose pgvector over a dedicated vector database: **one system to operate**, real transactions, and — the decisive one — you can **filter and join on relational metadata in the same query**, which is exactly what production RAG needs (tenant scoping, permissions, date ranges, hybrid search combining `tsvector` full-text with vector distance). Where it struggles: very large corpora (tens of millions of vectors and up), where index build times, memory and the interaction between filtering and approximate search push you toward purpose-built stores. Note that a highly selective metadata filter can make approximate search return fewer than `LIMIT` rows, because the filter is applied after the index traversal — the reason **iterative index scans** were added in pgvector 0.8.

---

## 12. Schema Migrations Without Downtime

Postgres DDL is transactional, which is a genuine advantage — but **lock strength** is what determines whether a migration is safe.

Safe and effectively instant (metadata-only):

```sql
ALTER TABLE t ADD COLUMN c text;                       -- nullable, no default
ALTER TABLE t ADD COLUMN c int NOT NULL DEFAULT 0;     -- instant since PG 11
ALTER TABLE t DROP COLUMN c;                           -- marks it dropped
CREATE INDEX CONCURRENTLY …;                           -- no write lock
ALTER TABLE t VALIDATE CONSTRAINT c;                   -- after adding NOT VALID
```

Dangerous — rewrites the table or blocks everything:

```sql
ALTER TABLE t ALTER COLUMN c TYPE bigint;   -- full rewrite, ACCESS EXCLUSIVE
ALTER TABLE t ADD CONSTRAINT … CHECK (…);   -- scans the whole table
VACUUM FULL;                                -- rewrites, exclusive lock
```

Two rules that prevent most incidents. First, **use the two-step pattern** for constraints: `ADD CONSTRAINT … NOT VALID` (instant, applies to new rows), then `VALIDATE CONSTRAINT` (scans without an exclusive lock). Second, and most important, **always set a short `lock_timeout`**. A DDL statement waiting for an `ACCESS EXCLUSIVE` lock **queues behind** every existing query *and blocks every new one behind it* — so one slow `SELECT` turns a "instant" migration into a full outage. `SET lock_timeout = '3s'` makes the migration fail fast instead.

Column removal follows expand/contract: stop writing it, deploy, stop reading it, deploy, then drop.

---

## 13. Postgres vs MySQL

| Aspect | PostgreSQL | MySQL (InnoDB) |
|---|---|---|
| Connections | process per connection; pooler required | thread per connection; cheaper |
| Row storage | heap; indexes point at tuples | **clustered by primary key** |
| Secondary index lookup | index → heap | index → PK → clustered index (double lookup) |
| MVCC | new tuple versions in the heap; needs `VACUUM` | undo log; purge thread |
| Default isolation | **Read Committed** | **Repeatable Read** |
| Phantom prevention | at Repeatable Read (snapshot isolation) | via **next-key/gap locks** |
| DDL transactional | **yes** | mostly no (atomic DDL, but not rollback-able in a txn) |
| Extensions | first-class (`pgvector`, PostGIS) | limited |
| JSON | `jsonb` binary + GIN indexing | `JSON` type, functional indexes |
| Strictness | strict types by default | historically lenient; strict mode now default |

The short version: Postgres favours **correctness, extensibility and complex queries**; MySQL favours **simple high-throughput primary-key access** and cheap connections. Choose Postgres for a rich domain model, complex queries, JSON plus relational, or vector search alongside your data. See the [MySQL guide](/backend/mysql) for the InnoDB side, including why the clustered index makes primary-key choice so consequential.

---

## 14. Interview Questions and Answers

**Q1: How does MVCC work in Postgres, and why does `VACUUM` exist?**

Postgres never updates a row in place. An `UPDATE` writes a **new tuple** and marks the old one dead; a `DELETE` just marks it dead. Each tuple carries `xmin` and `xmax` — the creating and deleting transaction IDs — and a transaction sees a tuple only if `xmin` is visible to its snapshot and `xmax` is not. That is what lets readers never block writers and writers never block readers. The consequence is **dead tuples accumulate**, so a table that only receives updates still grows, and `DELETE` frees no disk space. `VACUUM` reclaims those dead tuples for reuse and updates the visibility map that enables index-only scans; autovacuum runs it when dead tuples exceed a fraction of the table. Plain `VACUUM` makes space reusable **by the table** but does not return it to the OS — `VACUUM FULL` does, at the cost of an exclusive lock and a full rewrite, so use `pg_repack` online instead.

**Q2: Autovacuum is running but a table keeps bloating. What is wrong?**

Something is **holding an old snapshot**, so vacuum runs but is not permitted to remove any tuple newer than the oldest transaction that might still see it. The usual culprits are a long-running transaction, a connection sitting `idle in transaction`, an **abandoned replication slot** whose consumer is gone, or a stuck prepared transaction. Diagnose from `pg_stat_activity` (look for old `xact_start` and `state = 'idle in transaction'`) and `pg_replication_slots`. Mitigate with `idle_in_transaction_session_timeout` and `statement_timeout`, dropping unused slots, and tuning `autovacuum_vacuum_scale_factor` down for large hot tables where the 20% default is far too lax. This matters beyond disk: if freezing cannot proceed, you eventually approach **transaction ID wraparound**, where Postgres warns and then refuses writes to protect data — and the root cause is always that vacuum was blocked.

**Q3: What is the default isolation level, and what anomaly can still occur at `REPEATABLE READ`?**

The default is **`READ COMMITTED`**, where each *statement* takes a fresh snapshot — so two identical `SELECT`s in one transaction can legitimately return different rows. `READ UNCOMMITTED` exists in name only and behaves as `READ COMMITTED`, because MVCC provides no way to read uncommitted data. Postgres's `REPEATABLE READ` is implemented as full **snapshot isolation**, so it prevents phantom reads too, which the SQL standard does not require. What it still permits is **write skew**: two transactions each read a condition, each write based on it, and the combination breaks an invariant neither saw being violated — the canonical example being two doctors each going off-call because each sees the other still on. Preventing that needs `SERIALIZABLE`, which uses Serializable Snapshot Isolation to detect dangerous dependencies and aborts one transaction with `40001`, meaning the application **must implement retry**.

**Q4: Why might Postgres ignore your index?**

Run through seven causes. A **non-sargable predicate** — wrapping the column in a function like `lower(email)` or `date(created_at)` — defeats a plain index; fix with an expression index or a range rewrite. The **leftmost-prefix rule**: an index on `(a,b,c)` cannot serve a query filtering only on `b`. A **type mismatch** forcing a cast on the column side. **Low selectivity** — if the predicate matches a large fraction of rows, a sequential scan really is cheaper and the planner is correct. **Stale statistics**, fixed by `ANALYZE`. A **tiny table**, where one page is always faster to scan. And an **invalid index** left behind by a failed `CREATE INDEX CONCURRENTLY`, which you find via `pg_index.indisvalid`. Confirm with `EXPLAIN (ANALYZE, BUFFERS)` and compare estimated against actual rows — a big divergence is the usual root cause of a bad plan.

**Q5: How do you read `EXPLAIN ANALYZE` output?**

`EXPLAIN` shows the estimated plan; `ANALYZE` executes it and reports actuals; add `BUFFERS` to distinguish I/O-bound from CPU-bound. The most valuable single signal is the **ratio of estimated to actual rows** — a large divergence explains most bad plans and points at stale statistics, correlated columns the planner assumes independent, or an inestimable predicate. Then look for specific smells: a `Nested Loop` driving many rows (fine for a few, catastrophic for many), high `Rows Removed by Filter` meaning an index isn't selective enough, an external `Sort` spilling to disk (raise `work_mem`), and `Seq Scan` on a large table with a selective predicate. `Index Only Scan` is the best case and depends on the visibility map, which links plan quality back to vacuum. Remember `EXPLAIN ANALYZE` actually runs the statement, so wrap writes in a transaction you roll back.

**Q6: When should you use `jsonb`, and what does it cost?**

`jsonb` stores a parsed binary representation — slower to write, much faster to read, indexable with GIN, and it de-duplicates keys without preserving order; prefer it over `json` unless you need the byte-exact original. Reach for it for genuinely schemaless attributes, verbatim third-party payloads, and sparse per-tenant custom fields. The costs are real: no constraints or foreign keys inside the document, no type checking, weak planner estimates on jsonb predicates, and — the one people miss — updating a single key rewrites the **entire document** because of MVCC, so a large document under frequent partial updates produces heavy bloat. Index deliberately: GIN over the whole column, `jsonb_path_ops` for a smaller containment-only index, or a plain B-tree expression index on one hot key. The usual right answer is hybrid: real columns for anything you query, filter or constrain, `jsonb` for the long tail.

**Q7: Why does Postgres need connection pooling more than other databases?**

Because Postgres is **process-per-connection**: every client gets a forked OS process with its own memory, so connections are expensive and the practical ceiling is hundreds, not tens of thousands. Exceeding `max_connections` doesn't degrade gracefully — it refuses connections. An application-side pool reuses connections within a process but is insufficient when you run many processes, since 50 pods × 20 connections is 1,000 connections. So you add an external pooler — **PgBouncer** or RDS Proxy — in **transaction** mode, where a backend is assigned only for a transaction's duration. The trade-off to state: transaction pooling breaks anything depending on **session state**, because consecutive statements may hit different backends — session-level `SET`, `LISTEN`/`NOTIFY`, advisory locks, and server-side prepared statements. Serverless amplifies all of this, since each container holds its own pool; use pool size 1–2 and a proxy.

**Q8: Compare physical and logical replication, and name the operational hazard of each.**

**Physical (streaming)** replication ships WAL and replays it byte-for-byte, producing read-only replicas identical to the primary; it is the standard mechanism for HA and read scaling. Its hazard is **replica lag** causing read-your-writes bugs — a user writes, reads from a replica, and doesn't see their own change — mitigated by routing a user's reads to the primary briefly or by `remote_apply` at a latency cost. Synchronous replication removes data loss but **blocks commits if the only synchronous standby is down**, so configure a quorum. **Logical** replication replicates row-level changes for selected tables via publications and subscriptions, which is what you use for cross-version upgrades, selective replication and CDC; it does not replicate DDL. Its hazard is that a **replication slot with no consumer retains WAL indefinitely**, filling the disk and blocking vacuum. Neither does automatic failover — that needs Patroni, repmgr or a managed service, and split brain is the thing to design against.

**Q9: When does partitioning help, and when does it hurt?**

It helps when a table is genuinely large **and** has a natural key you always filter on — almost always time. The decisive win is usually not read speed but **cheap bulk deletion**: dropping a monthly partition is instant, where a `DELETE` of the same rows generates enormous WAL and bloat. You also get partition pruning, smaller per-partition indexes, and per-partition maintenance. It hurts when the **partition key isn't in the query**, because pruning cannot happen and you scan every child; when you create too many partitions, which slows planning; and for cross-partition queries, which can be slower than one well-indexed table. Also note a unique constraint must include the partition key, which often forces a composite key. Partitioning is a data-lifecycle tool, not a general performance fix.

**Q10: How would you build RAG on Postgres with pgvector, and when would you not?**

Store chunks with an `embedding vector(n)` column alongside their relational metadata, index with **HNSW** using the opclass matching your distance metric, and query with `ORDER BY embedding <=> $1 LIMIT k` plus metadata predicates in the same `WHERE`. The operator in `ORDER BY` **must match the index opclass** or the index is silently skipped — the most common pgvector mistake. HNSW gives better recall per unit latency and needs no training data; IVFFlat builds faster and uses less memory but needs representative data present at build time. Both are approximate, so tune `hnsw.ef_search` and measure recall against exact search. The reason to choose it over a dedicated vector database is that you can **filter and join on relational metadata in the same transaction** — tenant scoping, permissions, date ranges, and hybrid search combining `tsvector` with vector distance — while operating one system. Move to a purpose-built store at very large scale, where build time, memory and the interaction between selective filters and approximate search become the constraint; note a highly selective filter can return fewer than `LIMIT` rows because filtering happens after index traversal.

**Q11: Which schema migrations are safe on a live Postgres table, and which are not?**

Safe and metadata-only: adding a nullable column, adding a `NOT NULL` column **with a default** (instant since PG 11), dropping a column, `CREATE INDEX CONCURRENTLY`, and validating a previously `NOT VALID` constraint. Dangerous: changing a column's type (a full table rewrite under `ACCESS EXCLUSIVE`), adding a `CHECK` or foreign key directly (scans the whole table), and `VACUUM FULL`. Use the two-step pattern — `ADD CONSTRAINT … NOT VALID` then `VALIDATE CONSTRAINT` — to avoid the long exclusive lock. The most important operational rule is to **always set a short `lock_timeout`**, because a statement waiting on an `ACCESS EXCLUSIVE` lock queues behind every running query *and blocks every new query behind it*, so one slow `SELECT` turns an instant migration into an outage. Postgres DDL being transactional is a real advantage, but `CREATE INDEX CONCURRENTLY` cannot run in a transaction block and leaves an invalid index behind on failure.

**Q12: What are the main differences between Postgres and MySQL that would affect your design?**

Four that actually change decisions. **Connection model**: Postgres forks a process per connection so a pooler is mandatory, while MySQL's threads are cheaper. **Row storage**: InnoDB clusters rows by primary key, so a secondary index lookup goes index → PK → clustered index and primary-key choice is hugely consequential; Postgres uses a heap with indexes pointing at tuples, which makes secondary indexes uniform but requires vacuum. **MVCC implementation**: Postgres keeps old versions in the heap and needs `VACUUM`, InnoDB keeps them in an undo log with a purge thread. **Default isolation**: Read Committed in Postgres versus Repeatable Read in MySQL, and MySQL prevents phantoms with next-key/gap locks, which introduces a different deadlock profile. Beyond that, Postgres has transactional DDL and a first-class extension ecosystem — `pgvector`, PostGIS — which is often the deciding factor. Choose Postgres for a rich domain model, complex queries and extensions; MySQL for simple high-throughput primary-key access.

---

## 15. Tricky Questions

**Q1: You `DELETE` half a large table and disk usage doesn't drop. Then `SELECT count(*)` is still slow. Why?**

**Because `DELETE` only marks tuples dead — it frees no space, and the pages are still there to be read.** Under MVCC a delete sets `xmax` so the row becomes invisible to new snapshots, but the tuple physically remains until vacuum reclaims it, and even then plain `VACUUM` only marks the space **reusable by that table** rather than returning it to the OS. So the file stays the same size, and `count(*)` still walks all those pages — which is also why Postgres has no O(1) row count, since a count is snapshot-dependent and there is no stored total. To actually shrink the file you need `VACUUM FULL` (exclusive lock, full rewrite — never on a live hot table) or `pg_repack` online. If the space is going to be refilled by new rows anyway, the right answer is usually to do nothing: let vacuum mark it reusable. And if vacuum *isn't* reclaiming it, look for something holding an old snapshot (§2).

**Q2: A migration adding a column ran in 5 ms in staging and took the site down in production. What happened?**

**The `ALTER TABLE` didn't take long — it spent its time *waiting* for a lock, and while waiting it blocked everything behind it.** `ADD COLUMN` needs `ACCESS EXCLUSIVE`, which conflicts with every other lock including the `ACCESS SHARE` held by ordinary `SELECT`s. In production a long-running query held that lock, so the DDL queued — and crucially, a pending exclusive lock request **blocks all subsequent lock requests behind it**, so every new query piled up behind a migration that hadn't started. Staging had no concurrent traffic, so it was instant. The fixes: always `SET lock_timeout = '3s'` before DDL so it fails fast instead of stalling the queue, run migrations when long queries aren't active, keep `statement_timeout` set so no query can hold a lock indefinitely, and retry the migration rather than letting it wait. The lesson generalises: for Postgres DDL, **lock acquisition time is the risk, not execution time**.

**Q3: `ORDER BY embedding <-> $1` with an HNSW index built for cosine returns correct results but scans the whole table. Why?**

**The distance operator must match the index's opclass.** The index was created `USING hnsw (embedding vector_cosine_ops)`, which only answers `<=>` (cosine). The query uses `<->` (L2), so the planner cannot use that index and falls back to a sequential scan computing exact distances for every row — which is why the results are still *correct*, just slow, making this fail silently rather than loudly. `EXPLAIN` showing `Seq Scan` on a table with a vector index is the tell. Fix by matching the operator to the index, or build a second index with `vector_l2_ops` if you genuinely need both metrics. The related trap: if your embeddings are normalised, cosine and inner product rank identically, so people mix operators assuming it "doesn't matter" — it doesn't for ordering, but it absolutely does for index usage.

**Q4: Two identical `SELECT`s inside one transaction return different rows, and no one else committed between them — except they did. Which isolation level, and how do you stop it?**

**`READ COMMITTED`, the default — and it takes a fresh snapshot per *statement*, not per transaction.** So any transaction that committed between your two statements becomes visible to the second one. This is not a bug; it is exactly what Read Committed promises, and it is the anomaly called a non-repeatable read. It bites reporting code that runs several queries expected to be mutually consistent, producing totals that don't reconcile. The fix is `BEGIN ISOLATION LEVEL REPEATABLE READ`, which takes one snapshot at the first statement and holds it for the whole transaction — in Postgres that is full snapshot isolation, so it also prevents phantoms. Two caveats: a long Repeatable Read transaction holds an old snapshot and therefore **blocks vacuum** (§2), and snapshot isolation still permits write skew, so if you are enforcing an invariant across rows you need `SERIALIZABLE` plus retry on `40001`.

**Q5: Your worker fleet processes the same job twice occasionally. The query is `SELECT … WHERE state='queued' LIMIT 10 FOR UPDATE`. What's wrong?**

**`FOR UPDATE` without `SKIP LOCKED` makes workers block on each other, and under Read Committed the re-evaluated rows can be picked up twice.** With plain `FOR UPDATE`, worker B blocks waiting for worker A's locks; when A commits, B's statement **re-evaluates** the `WHERE` clause against the new snapshot in Read Committed, and depending on how the rows were updated it can end up claiming rows it shouldn't, while the blocking itself destroys throughput. The idiomatic Postgres queue is `FOR UPDATE SKIP LOCKED`, where each worker takes rows nobody else has locked and never waits. You also need the claim and the state change in **one transaction** — select-then-update in separate transactions reintroduces the race — plus `ORDER BY id` for deterministic ordering, and idempotent job handlers, because at-least-once delivery is the only guarantee any queue gives you across a crash.

---

## 16. Cheat Sheet

**Architecture**

1. Process per connection — connections are expensive; a pooler is mandatory.
2. 8 KB pages; `shared_buffers` is the page cache.
3. Enable `pg_stat_statements` on every cluster.

**MVCC and vacuum**

4. Updates write a new tuple; deletes only mark dead. Nothing is updated in place.
5. `UPDATE`-only tables still grow; `DELETE` frees no disk space.
6. `count(*)` is always a scan — there is no stored row count.
7. Plain `VACUUM` makes space reusable by the table; `VACUUM FULL` returns it to the OS but locks exclusively.
8. Use `pg_repack` for online compaction, never `VACUUM FULL` on a hot table.
9. `ANALYZE` updates planner stats — run it after bulk loads.
10. Vacuum is blocked by long transactions, `idle in transaction`, orphaned replication slots, prepared transactions.
11. Set `idle_in_transaction_session_timeout` and `statement_timeout`.
12. Blocked vacuum eventually means XID wraparound and refused writes.
13. Tune `autovacuum_vacuum_scale_factor` down for big hot tables — 20% is too lax.

**Transactions**

14. Default is **Read Committed**, with a fresh snapshot **per statement**.
15. `READ UNCOMMITTED` behaves as Read Committed.
16. Postgres `REPEATABLE READ` = snapshot isolation, so no phantoms — but write skew is possible.
17. `SERIALIZABLE` aborts with `40001`; you must retry.
18. `FOR UPDATE SKIP LOCKED` is the queue-worker idiom; `NOWAIT` to fail fast.

**Indexes**

19. B-tree default; GIN for jsonb/arrays/FTS; GiST for ranges/geo; BRIN for huge ordered tables.
20. Always `CREATE INDEX CONCURRENTLY` in production — not inside a transaction block.
21. A failed `CONCURRENTLY` build leaves an **invalid** index; check `indisvalid`.
22. Partial indexes for a hot subset; expression indexes make functions sargable.
23. `INCLUDE` columns enable index-only scans (which need the visibility map, hence vacuum).
24. Leftmost-prefix rule applies to composite indexes.

**Plans**

25. `EXPLAIN (ANALYZE, BUFFERS)`; compare **estimated vs actual rows** first.
26. `EXPLAIN ANALYZE` executes writes — wrap in a rolled-back transaction.
27. Watch `Rows Removed by Filter`, external `Sort`, and Nested Loops over many rows.
28. `CREATE STATISTICS` for correlated columns the planner assumes independent.

**JSONB**

29. `jsonb` (binary, indexable) over `json` (text) unless you need the exact bytes.
30. `->` returns jsonb, `->>` returns text; `@>` is containment.
31. Updating one key rewrites the **whole document** — bloat risk.
32. No constraints or FKs inside a document. Hybrid schemas win.

**Connections**

33. Hundreds of connections, not thousands. `max_connections` refuses, it doesn't queue.
34. PgBouncer **transaction** mode for scale; it breaks session state (`SET`, `LISTEN`, advisory locks, prepared statements).
35. Serverless: pool size 1–2 per container plus a proxy.

**Replication**

36. Physical = byte-for-byte WAL replay, read-only replicas.
37. Async can lose data on failover; sync blocks commits if the only standby is down — use a quorum.
38. Replica lag causes read-your-writes bugs.
39. Logical replication: per-table, no DDL, good for upgrades and CDC.
40. An orphaned replication slot retains WAL forever and blocks vacuum.
41. Failover needs Patroni/repmgr/managed — Postgres won't elect a primary.

**Partitioning and migrations**

42. Biggest win is instant `DROP` of old partitions, not read speed.
43. The partition key must appear in the query or pruning can't happen.
44. Unique constraints must include the partition key.
45. Safe DDL: nullable column, `NOT NULL` + default (PG 11+), drop column, `CONCURRENTLY`, `VALIDATE`.
46. Unsafe: type change, direct `CHECK`/FK, `VACUUM FULL`.
47. Two-step constraints: `NOT VALID` then `VALIDATE CONSTRAINT`.
48. **Always `SET lock_timeout`** — a pending exclusive lock blocks every query behind it.

**pgvector**

49. `vector(n)` with fixed dimension; `<->` L2, `<=>` cosine, `<#>` inner product.
50. **The `ORDER BY` operator must match the index opclass** or the index is skipped silently.
51. HNSW: better recall/latency, slower build, more memory. IVFFlat: faster build, needs representative data.
52. Both are approximate — tune `ef_search`/`probes` and measure recall against exact search.
53. Its advantage is filtering and joining relational metadata in the same query.
54. A selective filter can return fewer than `LIMIT` rows — hence iterative index scans.

---

## 17. References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/) — the primary source.
- [Concurrency Control / MVCC](https://www.postgresql.org/docs/current/mvcc.html) and [Routine Vacuuming](https://www.postgresql.org/docs/current/routine-vacuuming.html)
- [Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html) — read the write-skew examples.
- [Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [Index Types](https://www.postgresql.org/docs/current/indexes-types.html) and [JSON Types](https://www.postgresql.org/docs/current/datatype-json.html)
- [Logical Replication](https://www.postgresql.org/docs/current/logical-replication.html) and [Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html)
- [pgvector](https://github.com/pgvector/pgvector) — index types, operators and tuning.
- [PgBouncer documentation](https://www.pgbouncer.org/features.html) — pooling modes and their limitations.
- [Patroni](https://patroni.readthedocs.io/) for HA; [pg_repack](https://reorg.github.io/pg_repack/) for online compaction.
