# MySQL — Interview Guide

This guide covers **MySQL and InnoDB specifically**. The SQL language — joins, window functions, query plans, the N+1 problem — is in the [SQL & Relational Databases guide](/backend/sql), and the engine-level comparison is in the [PostgreSQL guide](/backend/postgresql).

Almost everything distinctive about MySQL follows from one design decision: **InnoDB clusters every row by its primary key**. Understand that (§2) and most of the rest — index cost, primary-key choice, lock behaviour — follows.

## Table of Contents

1. [Architecture and Storage Engines](#1-architecture-and-storage-engines)
2. [The Clustered Index](#2-the-clustered-index)
3. [The Buffer Pool, Redo and Undo](#3-the-buffer-pool-redo-and-undo)
4. [Transactions and Isolation](#4-transactions-and-isolation)
5. [Locking and Deadlocks](#5-locking-and-deadlocks)
6. [Indexes](#6-indexes)
7. [Reading EXPLAIN in MySQL](#7-reading-explain-in-mysql)
8. [Replication](#8-replication)
9. [Online Schema Changes](#9-online-schema-changes)
10. [Character Sets and Collation](#10-character-sets-and-collation)
11. [MySQL 8 Features Worth Knowing](#11-mysql-8-features-worth-knowing)
12. [Configuration Gotchas](#12-configuration-gotchas)
13. [MySQL vs PostgreSQL](#13-mysql-vs-postgresql)
14. [Interview Questions and Answers](#14-interview-questions-and-answers)
15. [Tricky Questions](#15-tricky-questions)
16. [Cheat Sheet](#16-cheat-sheet)
17. [References](#17-references)

---

## 1. Architecture and Storage Engines

MySQL is **thread-per-connection**: a connection is a thread, not an OS process, so connections are much cheaper than in Postgres — thousands are routine. A thread cache reuses them.

Above the storage layer sit the connection handler, the parser, the optimizer and the executor. Below is a **pluggable storage engine** API, which is MySQL's historical distinguishing feature:

| Engine | Status |
|---|---|
| **InnoDB** | the default since 5.5, and the only one you should use — transactional, row-level locking, crash-safe, foreign keys |
| MyISAM | legacy: table-level locks, no transactions, not crash-safe |
| MEMORY | volatile, table locks |
| Archive / CSV / NDB | niche |

"MySQL supports multiple engines" is now mostly historical trivia. **Assume InnoDB.** The one place it still matters: MySQL's internal system tables and, in older versions, temporary tables used MyISAM, and mixing engines breaks transactional guarantees silently — a `ROLLBACK` will not undo a write to a MyISAM table.

Note the query cache was **removed in MySQL 8.0**; it was a global-mutex bottleneck. Caching belongs in the application or in a layer like ProxySQL.

---

## 2. The Clustered Index

**In InnoDB, the table *is* its primary-key index.** Rows are stored in the leaf pages of a B+ tree ordered by primary key — there is no separate heap. Consequences that drive most MySQL design decisions:

**1. Primary-key lookups are the fastest possible access.** You reach the row in one tree traversal, because the row lives in the leaf.

**2. Secondary indexes require two lookups.** A secondary index's leaves store the **primary key**, not a row pointer. So `WHERE email = ?` traverses the email index to find the PK, then traverses the clustered index to find the row. This double lookup is why **covering indexes matter more in MySQL** — if the index contains every column the query needs, the second traversal is skipped entirely.

**3. Primary-key choice affects everything.** Every secondary index stores a copy of the PK, so a wide PK inflates *every* index on the table. And because rows are physically ordered by PK, insert order matters enormously:

```sql
-- GOOD: monotonically increasing → appends to the rightmost page
id BIGINT AUTO_INCREMENT PRIMARY KEY

-- BAD: random → inserts land in random pages, causing page splits,
-- fragmentation, and a working set that won't stay in the buffer pool
id CHAR(36) PRIMARY KEY            -- UUIDv4 as text: 36 bytes AND random
```

A random UUID primary key is the classic MySQL performance mistake. It causes page splits on insert, fragments the clustered index, and destroys buffer-pool locality because inserts touch pages scattered across the whole tree. The fixes: use `AUTO_INCREMENT` as the PK and keep the UUID as a `UNIQUE BINARY(16)` secondary key, or use a **time-ordered UUID** (UUIDv7, or v1 rearranged via `UUID_TO_BIN(uuid, 1)` which swaps the timestamp bytes to the front to restore ordering).

**4. If you declare no primary key**, InnoDB uses the first `UNIQUE NOT NULL` index, and failing that generates a hidden 6-byte row ID — which you cannot use, which is global (a contention point on inserts), and which makes replication and some tooling behave badly. Always declare a primary key.

---

## 3. The Buffer Pool, Redo and Undo

The **buffer pool** (`innodb_buffer_pool_size`) caches data and index pages. It is the single most important setting — target roughly 70–80% of RAM on a dedicated server. It uses a modified LRU with a young/old sublist so a large table scan cannot evict the entire working set.

Writes go through the **redo log** (`ib_logfile*`) — InnoDB's write-ahead log — using a mechanism called write-ahead logging exactly as Postgres does: commit makes the redo record durable, and dirty pages are flushed later by background threads. `innodb_flush_log_at_trx_commit` controls the trade: `1` (default) flushes on every commit and is ACID-durable; `2` writes to the OS but doesn't fsync, losing data only if the OS crashes; `0` flushes once a second and can lose a second of commits. Anything but `1` sacrifices durability for throughput.

The **undo log** stores previous row versions, and this is how InnoDB implements MVCC — the important structural contrast with Postgres, which keeps old versions in the table itself. Because old versions live in undo rather than in the table, InnoDB does not accumulate dead tuples in the data pages and **does not need `VACUUM`**; a background **purge** thread discards undo records once no transaction can see them. The equivalent failure mode does exist though: a long-running transaction prevents purge, the **undo log (history list) grows without bound**, and reads get slower because they walk longer version chains.

Also present: the **doublewrite buffer** (protects against torn pages) and the **change buffer** (defers secondary-index maintenance for non-unique indexes).

---

## 4. Transactions and Isolation

**MySQL's default isolation level is `REPEATABLE READ`** — different from Postgres's `READ COMMITTED`, and a common source of cross-database confusion.

| Level | Dirty read | Non-repeatable read | Phantom |
|---|---|---|---|
| READ UNCOMMITTED | possible | possible | possible |
| READ COMMITTED | no | possible | possible |
| **REPEATABLE READ** (default) | no | no | prevented by gap locks |
| SERIALIZABLE | no | no | no |

Unlike Postgres, MySQL genuinely implements `READ UNCOMMITTED`.

Under `REPEATABLE READ`, a **consistent read** takes a snapshot at the first read of the transaction and reuses it, so plain `SELECT`s are repeatable. The behaviour that surprises everyone:

```sql
-- session A
BEGIN;
SELECT balance FROM accounts WHERE id = 1;   -- 100 (snapshot taken here)
-- session B updates it to 500 and commits
SELECT balance FROM accounts WHERE id = 1;   -- still 100 (consistent read)
UPDATE accounts SET balance = balance + 10 WHERE id = 1;
SELECT balance FROM accounts WHERE id = 1;   -- 510, not 110
```

The `UPDATE` is a **locking read** that sees the *latest committed* row, not the snapshot. So a write inside a Repeatable Read transaction can be based on data your `SELECT`s never showed you. This mix of snapshot reads and current-version writes is InnoDB-specific and is why read-modify-write logic must use `SELECT … FOR UPDATE` rather than a plain `SELECT`.

MySQL's `REPEATABLE READ` prevents phantoms not through snapshot isolation but through **gap locking** (§5), which is a materially different mechanism with different deadlock behaviour. Many high-throughput shops deliberately run `READ COMMITTED` to avoid gap locks — it is also what row-based replication makes safe.

---

## 5. Locking and Deadlocks

InnoDB takes **row-level locks**, but on **index records**, not on rows in the abstract. That distinction explains most surprising lock behaviour.

- **Record lock** — on an index record.
- **Gap lock** — on the gap *between* index records, preventing inserts there.
- **Next-key lock** — a record lock plus the gap before it. This is the default under `REPEATABLE READ`, and it is how phantoms are prevented.
- **Insert intention lock** — a gap lock signalling intent to insert, so non-conflicting inserts into the same gap don't block each other.

The consequence that bites: **a query with no usable index locks far more than you expect.** If `UPDATE t SET x=1 WHERE unindexed_col = 5` cannot use an index, InnoDB scans and locks **every row it examines** — effectively the whole table. So a missing index is not just a performance problem, it is a **concurrency** problem.

**Deadlocks** are normal and expected in InnoDB; it detects them and rolls back the cheaper transaction with error 1213. Your application must retry. Common causes and fixes:

- **Inconsistent ordering** — transactions touching rows in different orders. Fix by always acquiring locks in a consistent order (e.g. sort IDs before updating).
- **Gap locks under Repeatable Read** — two inserts into the same gap. Fix by switching to `READ COMMITTED` where feasible, which removes gap locks for most statements.
- **Unindexed `WHERE` clauses** widening the lock footprint.
- Long transactions holding locks — keep them short and never hold a lock across a network call or user interaction.

Diagnose with `SHOW ENGINE INNODB STATUS` (the `LATEST DETECTED DEADLOCK` section) and `innodb_print_all_deadlocks = ON`. Note `SELECT … FOR SHARE` (shared) versus `FOR UPDATE` (exclusive), and that a plain `SELECT` takes no locks at all under Repeatable Read — a consistent read is lock-free.

---

## 6. Indexes

InnoDB indexes are B+ trees. What's MySQL-specific:

**Leftmost prefix rule.** An index on `(a, b, c)` serves `a`, `(a,b)` and `(a,b,c)`, plus a range on the last used column. It cannot serve `b` alone. Column *order* is therefore the main design decision — put equality predicates before range predicates, since a range stops the index being usable for columns after it.

**Covering index.** Because secondary lookups cost a second traversal into the clustered index (§2), an index containing every column the query touches is dramatically faster. `EXPLAIN` shows `Using index` when this happens. MySQL 8 supports functional key parts, and unlike Postgres there is no `INCLUDE` clause — you add the columns to the key itself.

**Prefix index.** For long text columns you can index a prefix:

```sql
CREATE INDEX idx_url ON pages (url(64));
```

Cheaper, but it **cannot be used for a covering index** or for `ORDER BY`, and choosing the length is a selectivity trade-off.

**Index Condition Pushdown (ICP)** lets the storage engine evaluate `WHERE` conditions on indexed columns before fetching the row, reducing clustered-index lookups. `EXPLAIN` shows `Using index condition`.

**Invisible indexes** (8.0) let you mark an index unused by the optimizer without dropping it — the right way to test whether an index is needed before deleting it:

```sql
ALTER TABLE t ALTER INDEX idx_old INVISIBLE;   -- watch, then DROP or make VISIBLE
```

**Why an index isn't used**: a non-sargable predicate (a function on the column, or a leading wildcard `LIKE '%x'`), the leftmost-prefix rule, an implicit type conversion, low selectivity where a scan is genuinely cheaper, or stale statistics (`ANALYZE TABLE`). The implicit-conversion case is especially nasty in MySQL and is covered in §15.

---

## 7. Reading EXPLAIN in MySQL

```sql
EXPLAIN SELECT …;                      -- estimated plan
EXPLAIN ANALYZE SELECT …;              -- 8.0.18+: actual execution, with timings
EXPLAIN FORMAT=JSON SELECT …;          -- costs and much more detail
```

The columns that matter:

- **`type`** — the access method, best to worst: `system`, `const`, `eq_ref`, `ref`, `range`, `index`, **`ALL`**. `ALL` is a full table scan. Note `index` is also a full scan — of the index — so it is not the win the name suggests.
- **`key`** — the index actually chosen. `NULL` here with a large `rows` is the red flag.
- **`rows`** — estimated rows examined. Compare it against the rows returned; a large gap means poor filtering.
- **`filtered`** — the percentage of examined rows surviving the `WHERE`. Low values mean the index isn't selective.
- **`Extra`** — the most informative column. `Using index` (covering — good), `Using where` (filtering after fetch), `Using filesort` (a sort that couldn't use an index), `Using temporary` (a temp table, common with `GROUP BY` on an unindexed column).

`Using filesort` and `Using temporary` together on a large result set is the classic slow-query signature. Prefer `EXPLAIN ANALYZE` when available, since estimates can be far from reality; `FORMAT=JSON` exposes the cost model when you need to understand *why* the optimizer chose badly.

For finding what to fix, enable the **slow query log** and the `performance_schema` statement digests (`events_statements_summary_by_digest`), which is MySQL's equivalent of `pg_stat_statements`.

---

## 8. Replication

MySQL replication is **logical**, based on the **binary log** (binlog) of changes — structurally different from Postgres's byte-level WAL shipping. That is why MySQL replicas can run a different version or even a different schema, and why replication is more flexible but less exact.

**Binlog formats:**

| Format | Logs | Notes |
|---|---|---|
| `STATEMENT` | the SQL text | compact, but **non-deterministic statements break replicas** (`NOW()`, `UUID()`, `LIMIT` without `ORDER BY`) |
| **`ROW`** (default in 8.0) | the actual row changes | safe and deterministic; larger logs |
| `MIXED` | statement, switching to row when unsafe | compromise |

Use `ROW`. It is also what makes `READ COMMITTED` safe and what CDC tools (Debezium) consume.

**GTIDs** (Global Transaction Identifiers) give every transaction a cluster-unique ID, which makes failover far simpler — a replica can be repointed at a new primary without hand-computing binlog file and position. Enable them.

**Durability modes:** asynchronous by default (the primary doesn't wait — fast, can lose transactions on failover); **semi-synchronous** waits for at least one replica to *acknowledge receipt* (not apply), reducing but not eliminating loss; **Group Replication / InnoDB Cluster** provides a consensus-based, self-healing group with automatic primary election — MySQL's built-in HA answer, unlike Postgres which needs external tooling.

**Replication lag** is MySQL's classic operational pain. Historically replicas applied the binlog single-threaded, so one slow write on the primary could put a replica minutes behind. Multi-threaded appliers (`replica_parallel_workers` with `LOGICAL_CLOCK` or `WRITESET`) largely fix it. Application impact is the same read-your-writes problem as anywhere: route a user's reads to the primary briefly after a write, and monitor `SHOW REPLICA STATUS` (`Seconds_Behind_Source`) plus a heartbeat table, since `Seconds_Behind_Source` is unreliable during network stalls.

---

## 9. Online Schema Changes

MySQL 8 supports **`ALGORITHM=INSTANT`** for a set of operations — adding a column at the end of the row, renaming a column, adding or dropping a virtual column, changing a default — which are metadata-only and effectively free. `ALGORITHM=INPLACE` rebuilds the table but generally permits concurrent DML. `ALGORITHM=COPY` copies the whole table and **blocks writes**.

```sql
ALTER TABLE t ADD COLUMN c INT, ALGORITHM=INSTANT;   -- fails loudly if not possible
```

**Always state the algorithm explicitly.** If you don't, MySQL silently picks the best it can — and if that turns out to be `COPY`, you have taken an outage. Naming it means the statement errors instead.

For anything not `INSTANT` on a large table, use an **external online schema change tool**:

- **`gh-ost`** — creates a ghost table and replays changes from the **binlog**, so it imposes no triggers on the original and is pausable and throttleable.
- **`pt-online-schema-change`** — uses **triggers** to copy changes; older, and the triggers add write overhead and lock interaction.

Both work by copying into a new table and swapping, which means you need the disk space and the operation takes as long as it takes. `gh-ost` is generally preferred for its lower impact and ability to be throttled or aborted mid-flight.

DDL in MySQL 8 is **atomic** (it won't leave a half-changed dictionary) but is still not transactional in the Postgres sense — you cannot wrap DDL in a transaction and roll it back.

---

## 10. Character Sets and Collation

This is MySQL's most notorious legacy trap.

**`utf8` in MySQL is not UTF-8.** The alias `utf8` historically meant `utf8mb3` — a maximum of **three** bytes per character — which cannot represent anything outside the Basic Multilingual Plane. So emoji and many CJK extension characters fail or get mangled. The correct charset is **`utf8mb4`**, which is the default in MySQL 8.0.

```sql
CREATE TABLE t (…) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

**Collation** determines comparison and sorting. `utf8mb4_0900_ai_ci` (the 8.0 default) is accent-insensitive and case-insensitive; `utf8mb4_bin` is byte-exact. Two things follow: string comparisons are **case-insensitive by default**, which surprises people coming from Postgres (where they are case-sensitive), and **a join between columns with different collations cannot use an index** — the column gets converted, which is a silent, hard-to-find performance cliff. Keep the charset and collation uniform across the server, database, table and column, and check `information_schema.COLUMNS` when a join is inexplicably slow.

Also note the index length limit: with `utf8mb4` at 4 bytes per character, a 767-byte prefix limit (older row formats) means a `VARCHAR(255)` unique index can fail — use `DYNAMIC` row format, which allows 3072 bytes.

---

## 11. MySQL 8 Features Worth Knowing

If your mental model of MySQL is from 5.6, it is out of date:

- **CTEs** (`WITH`, including `WITH RECURSIVE`) — no more self-join gymnastics.
- **Window functions** — `ROW_NUMBER()`, `RANK()`, `LAG()`, `SUM() OVER (…)`.
- **Atomic DDL** — no half-applied schema changes after a crash.
- **Roles** — grantable bundles of privileges.
- **Invisible indexes** (§6) — test removal safely.
- **Functional key parts** — `INDEX ((LOWER(email)))`, MySQL's answer to expression indexes.
- **Descending indexes** — actually stored descending, which helps mixed-direction `ORDER BY`.
- **`utf8mb4` by default** and the modern `_0900_` collations.
- **Instant `ADD COLUMN`** (§9).
- **JSON improvements** — `JSON_TABLE` to turn JSON into rows, and multi-valued indexes on arrays.
- **`SELECT … FOR UPDATE SKIP LOCKED` / `NOWAIT`** — the queue-worker idiom, finally available.
- **Removed:** the query cache.

CTEs, window functions and `SKIP LOCKED` are the ones most likely to change how you write queries.

---

## 12. Configuration Gotchas

- **`sql_mode`.** Historically MySQL silently coerced bad data — truncating strings, turning invalid dates into `0000-00-00`, accepting a `GROUP BY` missing columns. MySQL 8 defaults to a strict mode including `STRICT_TRANS_TABLES` and `ONLY_FULL_GROUP_BY`. Never relax these to make legacy queries pass; `ONLY_FULL_GROUP_BY` in particular is catching a genuine bug — selecting a non-aggregated column not in the `GROUP BY` returns an arbitrary row.
- **`autocommit` is ON by default**, so every statement is its own transaction unless you `BEGIN`.
- **`innodb_buffer_pool_size`** is the setting that matters most (§3).
- **`max_connections`** — cheap threads make it tempting to set this high, but each connection still consumes per-thread buffers (`sort_buffer_size`, `join_buffer_size`), so a high limit multiplied by large per-thread buffers is a memory-exhaustion recipe.
- **`innodb_flush_log_at_trx_commit`** — leave at `1` for anything that matters.
- **Time zones** — `TIMESTAMP` is stored UTC and converted per session; `DATETIME` is not converted at all. Mixing them causes off-by-hours bugs. Store UTC and be explicit.

---

## 13. MySQL vs PostgreSQL

| | MySQL (InnoDB) | PostgreSQL |
|---|---|---|
| Connections | thread per connection — cheap | process per connection — pooler required |
| Row storage | **clustered by primary key** | heap |
| Secondary index | index → PK → clustered index | index → heap tuple |
| MVCC | undo log + purge thread | versions in the heap + `VACUUM` |
| Default isolation | **Repeatable Read** | **Read Committed** |
| Phantom prevention | next-key / gap locks | snapshot isolation |
| Replication | logical, binlog-based; flexible | physical WAL, byte-exact; also logical |
| Built-in HA | Group Replication / InnoDB Cluster | needs Patroni/repmgr |
| Transactional DDL | no (atomic, not rollback-able) | **yes** |
| Extensions | limited | first-class (`pgvector`, PostGIS) |
| Strings | case-insensitive collation by default | case-sensitive |

Choose **MySQL** for high-throughput primary-key-centric OLTP, cheap connection counts, and its mature replication and HA tooling. Choose **Postgres** for complex queries, a rich type system, transactional DDL and extensions. Both are excellent; the differences that actually change your design are the clustered index, the connection model, and the default isolation level.

---

## 14. Interview Questions and Answers

**Q1: What does it mean that InnoDB uses a clustered index, and why does it matter?**

The table **is** the primary-key B+ tree — rows live in its leaf pages, ordered by primary key, with no separate heap. Four consequences. Primary-key lookups are the fastest possible access, since one traversal reaches the row. **Secondary indexes store the primary key**, not a row pointer, so a secondary lookup costs two traversals — which is why covering indexes matter more in MySQL than elsewhere. Every secondary index contains a copy of the PK, so a wide primary key inflates every index on the table. And because rows are physically ordered by PK, **insert order matters**: a monotonically increasing key appends to the rightmost page, while a random key scatters inserts, causing page splits, fragmentation and a working set that won't stay in the buffer pool. That is why a random UUID primary key is the classic MySQL performance mistake, and why the fix is an `AUTO_INCREMENT` PK with the UUID as a `UNIQUE BINARY(16)`, or a time-ordered UUIDv7.

**Q2: What is MySQL's default isolation level, and what surprising behaviour does it produce?**

**`REPEATABLE READ`** — unlike Postgres, which defaults to Read Committed. Plain `SELECT`s are **consistent reads** from a snapshot taken at the transaction's first read, so they are repeatable. The surprise is that a **locking read or a write sees the latest committed row, not the snapshot**: you can `SELECT` a balance of 100, have another session commit 500, `SELECT` again and still see 100, then `UPDATE balance = balance + 10` and end up with 510 rather than 110. So a write inside a Repeatable Read transaction can be based on data your reads never showed you, which is exactly why read-modify-write logic must use `SELECT … FOR UPDATE` rather than a plain `SELECT`. MySQL also prevents phantoms here not via snapshot isolation but via **gap locking**, a different mechanism with a different deadlock profile — which is why many high-throughput deployments deliberately run `READ COMMITTED`.

**Q3: Explain InnoDB's locking model and why a missing index is a concurrency problem.**

InnoDB locks **index records**, not rows in the abstract. It has record locks (on an index entry), gap locks (on the space between entries, preventing inserts), next-key locks (a record lock plus the preceding gap — the default under Repeatable Read, and how phantoms are prevented), and insert intention locks. The critical consequence: if a statement has **no usable index**, InnoDB must scan and it **locks every row it examines**, which for `UPDATE t SET x=1 WHERE unindexed_col=5` is effectively the whole table. So a missing index doesn't just make a query slow, it serialises your writes. Deadlocks are normal and InnoDB rolls back the cheaper transaction with error 1213, so applications must retry; the usual causes are inconsistent lock ordering across transactions, gap-lock conflicts between inserts under Repeatable Read, unindexed predicates widening the footprint, and long transactions. Diagnose from `SHOW ENGINE INNODB STATUS`.

**Q4: How does InnoDB implement MVCC, and why doesn't MySQL need `VACUUM`?**

Old row versions go to the **undo log**, not into the table's data pages, and a read reconstructs the version visible to its snapshot by walking the undo chain. Because the data pages themselves are not littered with dead versions, InnoDB does not accumulate dead tuples the way Postgres does, so there is nothing for a `VACUUM` to reclaim — a background **purge** thread simply discards undo records once no transaction can see them. But the equivalent failure mode absolutely exists: a **long-running transaction prevents purge**, the undo log's history list grows without bound, disk fills, and reads get progressively slower because they traverse longer version chains. So the operational discipline — keep transactions short, don't leave sessions idle inside a transaction — is the same as in Postgres even though the mechanism differs.

**Q5: What do you look at in MySQL's `EXPLAIN` output?**

Start with **`type`**, the access method, ranked `const` → `eq_ref` → `ref` → `range` → `index` → `ALL`; `ALL` is a full table scan, and note `index` is also a full scan of the index, so it isn't the win the name suggests. Then **`key`**, the index actually chosen — `NULL` with a large `rows` is the red flag. Compare **`rows`** examined against rows returned, and check **`filtered`**, the percentage surviving the `WHERE`, since a low value means the index isn't selective. The most informative column is **`Extra`**: `Using index` means a covering index (good), `Using filesort` a sort that couldn't use an index, and `Using temporary` an internal temp table — those last two together on a large result set are the classic slow-query signature. Prefer `EXPLAIN ANALYZE` (8.0.18+) for actual timings, and `FORMAT=JSON` when you need the cost model. To find *what* to optimise, use the slow query log and `performance_schema` statement digests.

**Q6: How does MySQL replication work, and what are the binlog formats?**

Replication is **logical**, driven by the **binary log** of committed changes, which a replica fetches and applies — structurally different from Postgres's byte-level WAL shipping, and why MySQL replicas can differ in version or even schema. The formats are `STATEMENT` (logs SQL text; compact but **non-deterministic statements like `NOW()`, `UUID()` or an unordered `LIMIT` corrupt replicas**), **`ROW`** (logs actual row changes — the 8.0 default, deterministic, larger, and what CDC tools like Debezium consume), and `MIXED`. Use `ROW`. Enable **GTIDs** so every transaction has a cluster-unique ID and failover doesn't require hand-computing binlog positions. Durability is asynchronous by default (can lose transactions on failover), **semi-synchronous** waits for a replica to acknowledge receipt but not apply, and **Group Replication / InnoDB Cluster** gives consensus-based HA with automatic primary election — MySQL's built-in answer where Postgres needs external tooling. The classic pain is replication lag from a single-threaded applier, largely fixed by multi-threaded appliers with `WRITESET`.

**Q7: How do you change the schema of a large table without downtime?**

First try **`ALGORITHM=INSTANT`**, which covers adding a trailing column, renaming a column, and default changes as metadata-only operations. **Always name the algorithm explicitly** — if you omit it MySQL silently falls back to whatever it can, and if that is `ALGORITHM=COPY` you have blocked writes and taken an outage; naming it makes the statement fail loudly instead. `INPLACE` rebuilds but usually allows concurrent DML. For anything else on a large table, use an external tool: **`gh-ost`**, which builds a ghost table and replays changes from the **binlog**, adding no triggers and being pausable and throttleable, or `pt-online-schema-change`, which uses triggers and is older and heavier. Both copy into a new table and swap, so plan for the disk space and duration. Remember DDL in MySQL 8 is **atomic but not transactional** — you cannot roll it back inside a transaction as you can in Postgres.

**Q8: What is the `utf8` versus `utf8mb4` problem?**

MySQL's `utf8` is **not** UTF-8: it was an alias for `utf8mb3`, storing at most **three** bytes per character, so it cannot represent anything outside the Basic Multilingual Plane — emoji and various CJK extension characters get rejected or mangled. Real UTF-8 is **`utf8mb4`**, which is finally the default in MySQL 8.0. Two related traps. **Collation** decides comparison and sorting, and the default `utf8mb4_0900_ai_ci` is accent- and case-**insensitive**, so string comparisons behave differently from Postgres where they are case-sensitive. And **a join between columns with different collations cannot use an index**, because one side gets converted — a silent, hard-to-diagnose performance cliff, so keep charset and collation uniform across server, database, table and column. Also watch index length: at 4 bytes per character a `VARCHAR(255)` unique index can exceed the older 767-byte prefix limit, which the `DYNAMIC` row format's 3072 bytes resolves.

**Q9: Why is a random UUID a bad primary key in InnoDB, and what do you do instead?**

Because the table is physically ordered by primary key, so a **random** key makes every insert land in an arbitrary page. That causes page splits, fragments the clustered index, and destroys buffer-pool locality — instead of repeatedly touching one hot rightmost page, inserts dirty pages scattered across the whole tree, so the working set stops fitting in memory and write throughput collapses as the table grows. Stored as `CHAR(36)` it is also 36 bytes rather than 16, and **every secondary index carries a copy of the primary key**, so it inflates every index on the table. The fixes: keep an `AUTO_INCREMENT BIGINT` as the primary key and put the UUID in a `UNIQUE BINARY(16)` secondary index, or use a **time-ordered** UUID — UUIDv7, or v1 rearranged with `UUID_TO_BIN(uuid, 1)`, which moves the timestamp bytes to the front so inserts are sequential again. The general principle: in InnoDB, primary keys should be small and monotonically increasing.

**Q10: When would you choose MySQL over PostgreSQL?**

For **high-throughput OLTP dominated by primary-key access**, where the clustered index makes point lookups optimal; when you need **very high connection counts** without a pooler, since threads are far cheaper than Postgres's per-connection processes; and when you want **mature built-in replication and HA** — Group Replication and InnoDB Cluster provide automatic primary election, where Postgres needs Patroni or a managed service. Its replication being logical and binlog-based also makes cross-version upgrades and CDC pipelines straightforward. I would choose Postgres instead for complex analytical queries, a rich type system with real constraints, transactional DDL, and the extension ecosystem — `pgvector` for embeddings or PostGIS for geospatial are often decisive on their own. Both are excellent; the differences that genuinely change a design are the clustered index, the connection model, and the default isolation level.

---

## 15. Tricky Questions

**Q1: `WHERE phone = 1234567890` on an indexed `VARCHAR` column is doing a full table scan. Why?**

**Implicit type conversion.** Comparing a string column to a numeric literal makes MySQL convert **the column** to a number for every row, following its type-coercion rules — and a function applied to the column side makes the predicate non-sargable, so the index cannot be used. It is worse than slow: the conversion is lossy and surprising, so `'01234567890'`, `'1234567890abc'` and `' 1234567890'` can all compare equal to `1234567890`, meaning you may get wrong rows as well as a scan. The fix is to quote the literal — `WHERE phone = '1234567890'` — so the comparison happens as strings and the index is usable. The inverse case is safe: comparing a numeric column to a quoted string converts the *literal*, not the column, so the index still works. Look for `Warning: Truncated incorrect DOUBLE value` after the query, which is the giveaway that a column-side conversion happened.

**Q2: Inside a `REPEATABLE READ` transaction you `SELECT` a counter as 5, then `UPDATE counter = counter + 1`, then `SELECT` again and see 11. How?**

**Another session committed `counter = 10` between your statements, and the `UPDATE` — a locking read — used that latest committed value rather than your snapshot.** Under Repeatable Read a plain `SELECT` is a consistent read served from the snapshot taken at your first read, so it kept showing 5. But writes must operate on the current row to avoid lost updates, so `counter + 1` was computed from 10, giving 11, and your subsequent `SELECT` sees your own uncommitted change. This mixture of snapshot reads and current-version writes is specific to InnoDB and is the reason read-modify-write logic must never be based on a plain `SELECT`: use `SELECT … FOR UPDATE` so the read takes the lock and sees the current version, or do the arithmetic in a single atomic `UPDATE`. It also explains a whole class of "the number is wrong but no query looks wrong" bugs.

**Q3: Two concurrent `INSERT`s into a table with a unique index deadlock, even though they insert different keys. Why?**

**Gap locks under `REPEATABLE READ`.** When an insert must check a unique index, InnoDB takes locks on index records and the **gaps between** them — a next-key lock. Two inserts whose keys fall into the same gap therefore contend, and if each has already acquired a lock the other needs (commonly after a failed insert or a preceding `SELECT … FOR UPDATE`, or when the inserts arrive in different orders), they deadlock even though the final key values never collide. This is a MySQL-specific consequence of preventing phantoms with locks rather than with snapshot isolation — Postgres, using snapshot isolation, does not behave this way. Mitigations: run `READ COMMITTED`, which removes gap locks for most statements, insert in a consistent key order, use `INSERT … ON DUPLICATE KEY UPDATE` rather than check-then-insert, keep transactions short, and always retry on error 1213 since InnoDB deadlocks are expected rather than exceptional.

**Q4: You add a column with `ALTER TABLE t ADD COLUMN c INT;` and it takes an hour and blocks writes, but the same statement on another table was instant. What differs?**

**One qualified for `ALGORITHM=INSTANT` and the other silently fell back to `COPY`.** Instant `ADD COLUMN` has conditions — notably that the column is added **at the end** of the row, and that the table hasn't exhausted its instant-change budget or use an incompatible row format. Add the column with `AFTER some_col` (positioning it mid-row), or hit any other disqualifying condition, and MySQL quietly chooses a rebuild; `COPY` blocks writes for the duration. Because the fallback is silent, the identical-looking DDL behaves completely differently on two tables. The discipline is to **always specify the algorithm explicitly** — `ALTER TABLE t ADD COLUMN c INT, ALGORITHM=INSTANT;` errors out rather than degrading, so you learn at deploy-plan time instead of during an outage. For tables that can't take it, run the change through `gh-ost`.

**Q5: A `JOIN` between two indexed `VARCHAR` columns won't use the index, and both columns are `utf8mb4`. What else could it be?**

**Different collations.** Charset equality isn't enough — if one column is `utf8mb4_0900_ai_ci` and the other `utf8mb4_general_ci` or `utf8mb4_bin`, the join predicate requires a conversion, and converting the column side makes it non-sargable exactly like a function call. It is a common outcome of tables created years apart, or a database default differing from a column-level override, and it is invisible in a schema diagram. Diagnose by querying `information_schema.COLUMNS` for `COLLATION_NAME` on both columns; fix by converting one column to match with `ALTER TABLE … MODIFY … COLLATE …`, and prevent recurrence by pinning charset and collation at the server level so new tables inherit consistently. The same mechanism explains inexplicably slow joins after a partial `utf8` → `utf8mb4` migration where only some tables were converted.

---

## 16. Cheat Sheet

**Architecture**

1. Thread per connection — connections are cheap (contrast Postgres).
2. Assume **InnoDB**; MyISAM has no transactions and isn't crash-safe.
3. Mixing engines silently breaks rollback.
4. The query cache was **removed** in 8.0.

**Clustered index**

5. The table **is** the primary-key B+ tree; rows live in the leaves.
6. Secondary index → primary key → clustered index: **two traversals**.
7. Covering indexes matter more in MySQL; `EXPLAIN` shows `Using index`.
8. Every secondary index stores a copy of the PK — keep the PK narrow.
9. PK should be **small and monotonically increasing**.
10. Random UUID PK = page splits, fragmentation, lost buffer-pool locality.
11. Fix: `AUTO_INCREMENT` PK + `UNIQUE BINARY(16)` UUID, or UUIDv7 / `UUID_TO_BIN(u,1)`.
12. Always declare a PK, or InnoDB invents a hidden global row ID.

**Storage internals**

13. `innodb_buffer_pool_size` ≈ 70–80% of RAM — the setting that matters most.
14. Redo log = WAL. `innodb_flush_log_at_trx_commit=1` for durability.
15. MVCC lives in the **undo log**, so no `VACUUM` — but a long transaction blocks **purge** and the history list grows.

**Transactions and locks**

16. Default isolation is **REPEATABLE READ**.
17. `READ UNCOMMITTED` is genuinely implemented (unlike Postgres).
18. Plain `SELECT` = consistent read from the snapshot; **writes see the latest committed row**.
19. So read-modify-write needs `SELECT … FOR UPDATE`.
20. Phantoms are prevented by **gap / next-key locks**, not snapshot isolation.
21. Locks are on **index records** — no usable index means locking every row examined.
22. Deadlocks are normal: error 1213, cheaper transaction rolled back, **retry required**.
23. Consistent lock ordering prevents most deadlocks; `READ COMMITTED` removes most gap locks.
24. Diagnose with `SHOW ENGINE INNODB STATUS`; enable `innodb_print_all_deadlocks`.
25. `autocommit` is ON — every statement is its own transaction.

**Indexes**

26. Leftmost-prefix rule; equality columns before range columns.
27. No `INCLUDE` clause — covering columns go in the key.
28. Prefix indexes (`url(64)`) can't cover or serve `ORDER BY`.
29. Invisible indexes let you test removal before dropping.
30. Functional key parts (8.0) are MySQL's expression indexes.
31. `ANALYZE TABLE` refreshes statistics.

**EXPLAIN**

32. `type`: `const` > `eq_ref` > `ref` > `range` > `index` > `ALL`. `index` is still a full scan.
33. `key = NULL` with big `rows` is the red flag; low `filtered` means poor selectivity.
34. `Extra`: `Using index` good; `Using filesort` + `Using temporary` is the slow-query signature.
35. `EXPLAIN ANALYZE` (8.0.18+) for actuals; `performance_schema` digests to find offenders.

**Replication**

36. Logical, binlog-based — replicas can differ in version/schema.
37. Use **`ROW`** format; `STATEMENT` breaks on `NOW()`, `UUID()`, unordered `LIMIT`.
38. Enable **GTIDs** for sane failover.
39. Async by default; semi-sync acks receipt not apply; Group Replication for built-in HA.
40. Lag came from a single-threaded applier — use parallel workers with `WRITESET`.
41. `Seconds_Behind_Source` is unreliable; use a heartbeat table.

**Schema changes**

42. Try `ALGORITHM=INSTANT`; **always name the algorithm** or MySQL silently uses `COPY`.
43. Instant `ADD COLUMN` needs the column at the **end** of the row.
44. `gh-ost` (binlog-based, no triggers, throttleable) over `pt-online-schema-change`.
45. DDL is atomic but **not** transactional — no rollback inside a transaction.

**Charset and types**

46. `utf8` = `utf8mb3` = **not UTF-8**. Use **`utf8mb4`**.
47. Default collation is case- and accent-**insensitive**.
48. **Mismatched collations prevent index use on joins** — check `information_schema.COLUMNS`.
49. Quote string literals — comparing a `VARCHAR` to a number converts the column and kills the index.
50. `TIMESTAMP` converts by session time zone; `DATETIME` does not. Store UTC.
51. Keep `sql_mode` strict — `ONLY_FULL_GROUP_BY` is catching a real bug.
52. High `max_connections` × large per-thread buffers = memory exhaustion.

---

## 17. References

- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/) — the primary source.
- [InnoDB Locking and Transaction Model](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-transaction-model.html) — gap locks, next-key locks, deadlocks.
- [Clustered and Secondary Indexes](https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html)
- [Optimizing Queries with EXPLAIN](https://dev.mysql.com/doc/refman/8.0/en/using-explain.html)
- [Online DDL Operations](https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl-operations.html) — which algorithms apply where.
- [Replication Formats](https://dev.mysql.com/doc/refman/8.0/en/replication-formats.html) and [Group Replication](https://dev.mysql.com/doc/refman/8.0/en/group-replication.html)
- [Character Sets and Collations](https://dev.mysql.com/doc/refman/8.0/en/charset.html) — the `utf8mb3`/`utf8mb4` history.
- [gh-ost](https://github.com/github/gh-ost) and [pt-online-schema-change](https://docs.percona.com/percona-toolkit/pt-online-schema-change.html)
