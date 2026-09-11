const e=`# SQL & Relational Databases — Complete Guide

The Database Schema guide covers *modelling*. This one covers everything else: writing queries that don't fall over, understanding what the planner does with them, indexes, transactions and isolation, locking and deadlocks, and the ORM pathologies that turn a fast schema into a slow application.

SQL is asked in almost every backend and full-stack loop, and it's the area where candidates most often know the syntax but not the **execution model** — which is exactly what separates a passing answer from a good one.

---

## Table of Contents

- [1. The Relational Model](#1-the-relational-model)
- [2. Querying — the Parts That Get Asked](#2-querying-the-parts-that-get-asked)
- [3. JOINs](#3-joins)
- [4. Aggregation, Grouping and Window Functions](#4-aggregation-grouping-and-window-functions)
- [5. CTEs and Subqueries](#5-ctes-and-subqueries)
- [6. Indexes — How They Actually Work](#6-indexes-how-they-actually-work)
- [7. Reading a Query Plan](#7-reading-a-query-plan)
- [8. Transactions and ACID](#8-transactions-and-acid)
- [9. Isolation Levels and the Anomalies](#9-isolation-levels-and-the-anomalies)
- [10. Locking and Deadlocks](#10-locking-and-deadlocks)
- [11. The N+1 Problem and ORMs](#11-the-n1-problem-and-orms)
- [12. Migrations](#12-migrations)
- [13. Scaling a Relational Database](#13-scaling-a-relational-database)
- [14. Postgres vs MySQL](#14-postgres-vs-mysql)
- [15. Interview Questions & Answers](#15-interview-questions-answers)
- [16. Tricky Questions](#16-tricky-questions)
- [17. Cheat Sheet](#17-cheat-sheet)
- [18. References](#18-references)

---

## 1. The Relational Model

### 1.1 Keys and Constraints

\`\`\`sql
CREATE TABLE users (
  id          BIGSERIAL PRIMARY KEY,          -- surrogate key
  email       TEXT        NOT NULL UNIQUE,    -- natural key, enforced
  org_id      BIGINT      NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','suspended','deleted')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
\`\`\`

**Surrogate vs natural keys.** A surrogate key (an auto-generated \`id\`) is stable and opaque; a natural key (an email, an ISBN) carries meaning. The standard advice is a surrogate primary key *plus* a \`UNIQUE\` constraint on the natural key — you get stable foreign keys and enforced business uniqueness. Natural primary keys hurt when the value changes (people change email addresses) because every referencing row must change too.

**Sequential vs UUID primary keys** is the question behind that:

| | Sequential (\`BIGSERIAL\`/\`AUTO_INCREMENT\`) | UUIDv4 | UUIDv7 |
|---|---|---|---|
| Index locality | **excellent** — appends to the right edge | **poor** — random inserts fragment the B-tree | good — time-ordered |
| Enumerable by an attacker | **yes** | no | partially (timestamp) |
| Generatable client-side | no | **yes** | **yes** |
| Size | 8 bytes | 16 bytes | 16 bytes |

The practical answer in 2026: **UUIDv7** if you need client-generated or non-enumerable IDs, because it's time-ordered and therefore doesn't destroy index locality the way v4 does. Random UUIDs as a clustered primary key on a large, write-heavy table is a well-documented performance mistake (worse on MySQL/InnoDB, where the primary key *is* the physical row order).

**Constraints belong in the database.** \`NOT NULL\`, \`UNIQUE\`, \`CHECK\` and \`FOREIGN KEY\` are the last line of defence, and unlike application validation they hold under concurrency, across every code path, and for the intern running an ad-hoc \`UPDATE\`. "We validate in the application" is not a substitute — see §10.4 on why a check-then-insert is a race and a \`UNIQUE\` constraint isn't.

### 1.2 Normalization, Briefly

The Database Schema guide covers this in depth; the interview-shaped summary:

- **1NF** — atomic values, no repeating groups. No comma-separated lists in a column.
- **2NF** — no partial dependency on part of a composite key.
- **3NF** — no transitive dependency: non-key columns depend on the key, *the whole key, and nothing but the key*.

**Denormalize deliberately, not accidentally.** Legitimate reasons: a counter you'd otherwise compute over millions of rows, a materialised aggregate, a copy of a value that must be historically frozen (the price *at time of order*, which is not denormalisation at all — it's correct modelling). Every denormalised copy needs a documented update path, and the usual mechanism is a trigger, a materialised view, or an explicit job — never "the application remembers to update both."

---

## 2. Querying — the Parts That Get Asked

### 2.1 Logical Order of Evaluation

This single list explains a large fraction of SQL confusion:

\`\`\`
1. FROM / JOIN        →  build the working set
2. WHERE              →  filter individual rows
3. GROUP BY           →  collapse into groups
4. HAVING             →  filter groups
5. SELECT             →  compute output expressions (aliases created HERE)
6. DISTINCT
7. ORDER BY           →  can use SELECT aliases
8. LIMIT / OFFSET
\`\`\`

Two consequences that come up constantly:

- **You can't use a \`SELECT\` alias in \`WHERE\`**, because \`WHERE\` runs first. You can in \`ORDER BY\`, because that runs later. (MySQL is more permissive here than the standard; Postgres is strict.)
- **\`WHERE\` filters rows, \`HAVING\` filters groups.** \`WHERE amount > 100\` discards rows before aggregation; \`HAVING SUM(amount) > 100\` discards groups after. Putting an aggregate in \`WHERE\` is an error, and putting a row condition in \`HAVING\` works but scans more than it needs to.

### 2.2 \`NULL\` Is Not a Value

\`NULL\` means *unknown*, and it propagates through three-valued logic (\`TRUE\`/\`FALSE\`/\`UNKNOWN\`):

\`\`\`sql
NULL = NULL          -- UNKNOWN, not TRUE
NULL <> 5            -- UNKNOWN
1 + NULL             -- NULL
'a' || NULL          -- NULL  (Postgres; MySQL CONCAT is the same)

WHERE col = NULL     -- matches NOTHING. Use IS NULL.
WHERE col NOT IN (1, 2, NULL)   -- matches NOTHING, ever. See below.
\`\`\`

That last one is the classic trap. \`col NOT IN (1, 2, NULL)\` expands to \`col <> 1 AND col <> 2 AND col <> NULL\`, and the final comparison is \`UNKNOWN\` — so the whole \`AND\` can never be \`TRUE\`. **A \`NOT IN\` against a subquery that can return a \`NULL\` silently returns zero rows.** Use \`NOT EXISTS\`, which is \`NULL\`-safe and usually plans better anyway.

Other \`NULL\` behaviours worth knowing: aggregates **ignore** \`NULL\` (so \`COUNT(col)\` < \`COUNT(*)\` when nulls exist, and \`AVG\` divides by the non-null count); \`UNIQUE\` constraints permit multiple \`NULL\`s in most engines because two unknowns aren't equal; \`ORDER BY\` sorts nulls last by default in Postgres, first in MySQL — use \`NULLS FIRST\`/\`NULLS LAST\` explicitly.

### 2.3 Pagination

\`\`\`sql
-- ✗ OFFSET pagination: the database must scan and discard 100,000 rows
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 100000;

-- ✓ Keyset ("cursor") pagination: uses the index, constant time at any depth
SELECT * FROM posts
WHERE (created_at, id) < ('2026-09-01 10:00:00+00', 918273)   -- last row of previous page
ORDER BY created_at DESC, id DESC
LIMIT 20;
\`\`\`

\`OFFSET\` is O(offset) — page 5,000 is genuinely slow, and it also **skips or duplicates rows** when data changes between page fetches, because the offset refers to a position in a shifting result set. Keyset pagination is O(log n) and stable.

The tie-breaker matters: ordering by a non-unique column alone gives a non-deterministic order for equal values, so rows can appear on two pages. Always include a unique column (\`id\`) as the final sort key, and compare the **tuple**.

The trade-off to name: keyset pagination can't jump to an arbitrary page number. That's usually fine — infinite scroll and "next/previous" don't need it — but a UI with numbered pages needs \`OFFSET\`, or a hybrid.

---

## 3. JOINs

\`\`\`sql
-- INNER: only matching rows from both sides
SELECT u.email, o.total FROM users u JOIN orders o ON o.user_id = u.id;

-- LEFT: all users, NULLs where they have no orders
SELECT u.email, o.total FROM users u LEFT JOIN orders o ON o.user_id = u.id;

-- Users with NO orders — the anti-join
SELECT u.email FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;

-- CROSS: cartesian product. Deliberate for generating series, a bug otherwise.
SELECT * FROM sizes CROSS JOIN colours;
\`\`\`

### 3.1 The Trap: \`WHERE\` vs \`ON\` in a \`LEFT JOIN\`

\`\`\`sql
-- ✗ Silently becomes an INNER JOIN.
SELECT u.email, o.total
FROM users u LEFT JOIN orders o ON o.user_id = u.id
WHERE o.status = 'paid';        -- discards the NULL rows the LEFT JOIN just produced

-- ✓ Filter in the ON clause so unmatched users survive
SELECT u.email, o.total
FROM users u LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid';
\`\`\`

The \`ON\` clause decides **what counts as a match**; \`WHERE\` filters the **result** of the join. Since an unmatched left row has \`NULL\` for every right column, any \`WHERE\` condition on a right-hand column (other than \`IS NULL\`) eliminates it. This is one of the most common SQL bugs in production code and a favourite interview question.

### 3.2 Row Multiplication

A join is not a lookup — it's a **product filtered by a predicate**. If a user has 3 orders, joining users to orders produces 3 rows for that user. Aggregating naively then double-counts:

\`\`\`sql
-- ✗ user.credit_limit is summed once per order row
SELECT u.id, SUM(o.total), SUM(u.credit_limit) FROM users u JOIN orders o ON …
GROUP BY u.id;

-- ✓ Aggregate first, then join — one row per user
SELECT u.id, u.credit_limit, o.total
FROM users u
LEFT JOIN (SELECT user_id, SUM(total) AS total FROM orders GROUP BY user_id) o
  ON o.user_id = u.id;
\`\`\`

The general rule: **joining two one-to-many relationships to the same parent multiplies them.** Joining users→orders and users→addresses in one query gives you \`orders × addresses\` rows per user, and every aggregate is wrong. Aggregate in subqueries, or use \`COUNT(DISTINCT …)\` as a patch, or run separate queries.

### 3.3 \`EXISTS\` vs \`IN\` vs \`JOIN\`

\`\`\`sql
-- EXISTS: semi-join. Stops at the first match. NULL-safe. Usually the best choice
-- for "does a related row exist?"
SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- IN with a subquery: fine, but NOT IN is NULL-unsafe (§2.2)
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);

-- JOIN: multiplies rows if the right side has duplicates — needs DISTINCT,
-- which then forces a sort or hash. Prefer EXISTS for existence checks.
SELECT DISTINCT u.* FROM users u JOIN orders o ON o.user_id = u.id;
\`\`\`

Modern planners often rewrite \`IN\` and \`EXISTS\` into the same semi-join, so the performance difference is smaller than folklore suggests. What *is* reliably true: **\`NOT EXISTS\` is safe where \`NOT IN\` is not**, and \`EXISTS\` expresses intent better than \`JOIN\` + \`DISTINCT\`.

---

## 4. Aggregation, Grouping and Window Functions

### 4.1 \`GROUP BY\` Rules

Every column in \`SELECT\` must be either in \`GROUP BY\` or inside an aggregate. Postgres enforces this; **MySQL historically didn't** (with \`ONLY_FULL_GROUP_BY\` disabled it picks an arbitrary value from the group, which is a silent correctness bug — this is a real portability gotcha when moving MySQL code to Postgres).

Postgres relaxes it correctly for functional dependency: if you \`GROUP BY users.id\` and \`id\` is the primary key, you can select any \`users.*\` column, because it's uniquely determined.

### 4.2 Window Functions — The Highest-Value SQL Feature to Know

A window function computes across a set of rows **without collapsing them**. That's the whole point, and it's what candidates most often don't know exists.

\`\`\`sql
SELECT
  user_id,
  created_at,
  total,
  SUM(total)   OVER (PARTITION BY user_id ORDER BY created_at)          AS running_total,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC)     AS recency_rank,
  LAG(total)   OVER (PARTITION BY user_id ORDER BY created_at)          AS prev_total,
  total - LAG(total) OVER (PARTITION BY user_id ORDER BY created_at)    AS delta,
  AVG(total)   OVER (PARTITION BY user_id
                     ORDER BY created_at
                     ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)          AS rolling_7
FROM orders;
\`\`\`

The canonical interview problem — **"get the most recent order per user"** — is a window function:

\`\`\`sql
-- The idiomatic solution
SELECT * FROM (
  SELECT o.*, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
  FROM orders o
) t WHERE rn = 1;

-- Postgres has a shortcut that's usually faster with the right index
SELECT DISTINCT ON (user_id) * FROM orders ORDER BY user_id, created_at DESC;
\`\`\`

Know the difference between the three ranking functions, because it's a standard follow-up: \`ROW_NUMBER()\` is always distinct (1,2,3,4), \`RANK()\` leaves gaps after ties (1,2,2,4), \`DENSE_RANK()\` doesn't (1,2,2,3).

And \`ROWS\` vs \`RANGE\` in a frame clause: \`ROWS\` counts physical rows, \`RANGE\` groups peers with equal \`ORDER BY\` values. The default frame when you specify \`ORDER BY\` without a frame is \`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\`, which surprises people when duplicate timestamps make a "running total" jump.

---

## 5. CTEs and Subqueries

\`\`\`sql
WITH recent_orders AS (
  SELECT * FROM orders WHERE created_at > now() - interval '30 days'
), totals AS (
  SELECT user_id, SUM(total) AS spend FROM recent_orders GROUP BY user_id
)
SELECT u.email, t.spend FROM totals t JOIN users u ON u.id = t.user_id
WHERE t.spend > 1000;
\`\`\`

CTEs are for readability and for breaking a query into named steps. Two things to know:

**Materialisation.** Postgres before v12 always materialised a CTE — an **optimisation fence** that could be much slower than an equivalent subquery, because predicates couldn't be pushed down into it. Since v12 it inlines them when safe, and \`MATERIALIZED\` / \`NOT MATERIALIZED\` let you force either. Occasionally you *want* the fence, to compute something expensive exactly once.

**Recursive CTEs** handle hierarchies — the standard answer for trees and graphs in SQL:

\`\`\`sql
WITH RECURSIVE subordinates AS (
  SELECT id, manager_id, name, 1 AS depth
  FROM employees WHERE id = 42                    -- anchor
  UNION ALL
  SELECT e.id, e.manager_id, e.name, s.depth + 1  -- recursive term
  FROM employees e JOIN subordinates s ON e.manager_id = s.id
  WHERE s.depth < 10                              -- ALWAYS bound the recursion
)
SELECT * FROM subordinates;
\`\`\`

Always add a depth guard: a cycle in the data (an employee who manages their own manager) makes an unbounded recursive CTE run until it exhausts memory.


---

## 6. Indexes — How They Actually Work

### 6.1 The B-Tree Mental Model

A B-tree index is a sorted, balanced structure mapping key values to row locations. Two properties follow, and they explain almost every index question:

1. **Lookups are O(log n)** — a few page reads instead of scanning the table.
2. **The index is sorted**, so it can also satisfy \`ORDER BY\`, range scans (\`BETWEEN\`, \`>\`, \`<\`), and \`LIKE 'prefix%'\` — but **not** \`LIKE '%suffix'\`, because a suffix has no position in the sort order.

\`\`\`sql
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);
\`\`\`

### 6.2 Composite Indexes and the Leftmost-Prefix Rule

This is the most commonly-tested index concept. A composite index on \`(a, b, c)\` is sorted by \`a\`, then \`b\` within equal \`a\`, then \`c\`. So it can serve:

\`\`\`
WHERE a = 1                        ✓  leftmost prefix
WHERE a = 1 AND b = 2              ✓
WHERE a = 1 AND b = 2 AND c = 3    ✓
WHERE a = 1 AND c = 3              ⚠  uses \`a\` only, then filters c
WHERE b = 2                        ✗  cannot use the index at all
WHERE b = 2 AND c = 3              ✗
\`\`\`

The analogy that makes it stick: a phone book sorted by (surname, first name) lets you find "Smith", and "Smith, John" — but it's useless for finding everyone named John.

**Column order rules:** equality columns before range columns, because a range scan stops the index being usable for anything after it. An index on \`(status, created_at)\` serves \`WHERE status = 'x' AND created_at > y\` well; \`(created_at, status)\` does not, because after the range on \`created_at\` the \`status\` values are scattered.

**Cardinality matters less than people think** for a *leading* column — a low-cardinality leading column (\`status\`) is fine if it's always in the predicate. What's genuinely useless is indexing a column with two values and querying for the one that matches 90% of rows, because a scan is cheaper than an index lookup plus 90% of the table's random reads.

### 6.3 Covering Indexes and Index-Only Scans

If every column the query needs is in the index, the database never touches the table:

\`\`\`sql
CREATE INDEX idx_covering ON orders (user_id, created_at) INCLUDE (total, status);
--                                   ^^^ key columns          ^^^ payload only (Postgres)
SELECT total, status FROM orders WHERE user_id = 1 ORDER BY created_at;
-- → Index Only Scan. Often 10x faster because it avoids the random heap reads.
\`\`\`

This is one of the highest-return optimisations for a hot read path. In MySQL/InnoDB, secondary indexes implicitly include the primary key, so \`(user_id, created_at)\` covers a query also selecting \`id\`.

### 6.4 The Other Index Types (Postgres)

| Type | For |
|---|---|
| **B-tree** | the default — equality, ranges, sorting, prefix \`LIKE\` |
| **GIN** | \`jsonb\` containment, array membership, **full-text search** |
| **GiST** | geometric data, ranges, nearest-neighbour |
| **BRIN** | very large, naturally-ordered tables (time-series) — tiny index, coarse filtering |
| **Hash** | equality only; rarely worth it over B-tree |

Plus two modifiers that are frequently the actual answer:

\`\`\`sql
-- Partial index: only index the rows you query. Much smaller, much faster.
CREATE INDEX idx_active_users ON users (email) WHERE status = 'active';

-- Expression index: needed when you query a transformed value
CREATE INDEX idx_lower_email ON users (LOWER(email));
-- Without it, WHERE LOWER(email) = '…' CANNOT use an index on email.
\`\`\`

**A predicate wrapped in a function can't use a plain index on that column.** \`WHERE LOWER(email) = 'a@b.com'\`, \`WHERE DATE(created_at) = '2026-09-01'\` and \`WHERE amount::text = '100'\` all defeat the index. Either index the expression, or rewrite the predicate to be **sargable** — \`created_at >= '2026-09-01' AND created_at < '2026-09-02'\` uses the index; \`DATE(created_at) = …\` does not.

### 6.5 The Cost of Indexes

Every index is written on every \`INSERT\`, \`UPDATE\` (of an indexed column) and \`DELETE\`. So:

- **Indexes slow down writes** and consume disk and cache. A table with 12 indexes has a genuinely expensive insert path.
- **Unused indexes are pure cost.** \`pg_stat_user_indexes\` (\`idx_scan = 0\`) tells you which ones have never been used.
- **Redundant indexes** are common: an index on \`(a)\` is redundant if you already have \`(a, b)\`, because the leftmost prefix serves it.
- **Build them without downtime**: \`CREATE INDEX CONCURRENTLY\` in Postgres avoids the \`ACCESS EXCLUSIVE\` lock that would otherwise block all writes to the table for the duration.

---

## 7. Reading a Query Plan

\`EXPLAIN\` shows the plan; **\`EXPLAIN ANALYZE\` runs it and shows actual times and row counts.** Always use the second one when diagnosing — the estimates are what the planner *believed*, and the gap between estimate and actual is usually the bug.

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS) SELECT … ;
\`\`\`

\`\`\`
Nested Loop  (cost=0.43..842.11 rows=1 width=64) (actual time=0.03..412.7 rows=8241 loops=1)
  ->  Seq Scan on orders  (cost=0.00..18.5 rows=1 width=32) (actual … rows=8241 …)
        Filter: (status = 'paid')
        Rows Removed by Filter: 191759
  ->  Index Scan using users_pkey on users  (actual time=0.04..0.04 rows=1 loops=8241)
\`\`\`

**How to read it:** innermost/most-indented nodes run first, and each node's actual time is cumulative including its children. The three things to look for, in order:

1. **\`rows\` estimated vs actual.** Here the planner expected 1 row and got 8,241 — a 8000× underestimate. That's *why* it chose a Nested Loop, and it's the root cause. Bad estimates come from stale statistics (\`ANALYZE\` the table), correlated columns the planner assumes are independent, or an expression it can't estimate.
2. **\`Seq Scan\` on a large table with a selective \`Filter\`** plus a high **\`Rows Removed by Filter\`** — a missing index, almost always.
3. **\`loops=N\` on an inner node** — the node ran N times. \`loops=8241\` on an index scan means 8,241 random lookups; a Hash Join would have done one pass.

**Join strategies** and when each is right:

| Strategy | Good when | Bad when |
|---|---|---|
| **Nested Loop** | the outer side is tiny and the inner has an index | the outer side is large — cost is O(n×m) |
| **Hash Join** | one side fits in \`work_mem\`; no useful index | the hash spills to disk |
| **Merge Join** | both inputs are already sorted (or indexed in that order) | requires an expensive sort first |

A \`Seq Scan\` is **not automatically bad** — reading a whole small table, or a query returning 60% of a large one, is genuinely faster sequentially than via an index, because sequential I/O beats thousands of random reads. Saying that unprompted signals you understand the planner rather than pattern-matching on keywords.

Other red flags: \`Sort\` with \`Sort Method: external merge Disk\` (raise \`work_mem\` or add an index that provides the order), \`Bitmap Heap Scan\` with a high \`lossy\` recheck, and \`Materialize\`/\`Memoize\` nodes appearing unexpectedly.

---

## 8. Transactions and ACID

\`\`\`sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;   -- or ROLLBACK
\`\`\`

| Property | Means | Provided by |
|---|---|---|
| **Atomicity** | all statements or none | the write-ahead log / undo log |
| **Consistency** | constraints hold before and after | constraints, triggers, your schema |
| **Isolation** | concurrent transactions don't corrupt each other | MVCC and/or locking (§9) |
| **Durability** | a committed transaction survives a crash | WAL flushed to disk (\`fsync\`) |

**Consistency is the one candidates misstate.** It does *not* mean "the data is correct" in a business sense — it means the database's declared constraints are never violated by a committed transaction. If your business rule isn't expressed as a constraint, ACID doesn't protect it.

Two practical notes. **Durability is tunable and often traded away**: Postgres's \`synchronous_commit = off\` makes commits much faster at the cost of losing the last fraction of a second on a crash — sometimes correct for analytics ingest, never for payments. And **keep transactions short**: a long-running transaction holds locks, and in Postgres it prevents vacuum from reclaiming dead tuples, which causes table bloat well after the transaction ends. Never hold a transaction open across a network call to a third party.

---

## 9. Isolation Levels and the Anomalies

The anomalies, in the order the levels prevent them:

| Anomaly | What happens |
|---|---|
| **Dirty read** | you read another transaction's *uncommitted* write |
| **Non-repeatable read** | you read the same row twice and get different values |
| **Phantom read** | you re-run the same query and new *rows* appear |
| **Write skew** | two transactions each read a set, decide independently, and their combined writes violate an invariant neither would have broken alone |

| Level | Dirty | Non-repeatable | Phantom | Write skew |
|---|---|---|---|---|
| **Read Uncommitted** | possible | possible | possible | possible |
| **Read Committed** | prevented | possible | possible | possible |
| **Repeatable Read** | prevented | prevented | possible* | possible |
| **Serializable** | prevented | prevented | prevented | prevented |

\\* In **Postgres**, Repeatable Read is implemented with snapshot isolation and *does* prevent phantom reads — but still permits **write skew**. In **MySQL/InnoDB**, Repeatable Read prevents phantoms for locking reads via next-key locks. This divergence between engines at the same named level is exactly the kind of thing a senior interview probes.

**The defaults differ and it matters:** Postgres and Oracle default to **Read Committed**; MySQL/InnoDB defaults to **Repeatable Read**; SQL Server defaults to Read Committed. Code written against one default can behave differently on another.

### 9.1 Write Skew — The One Worth Understanding

Two on-call engineers, and a rule that at least one must remain on call:

\`\`\`sql
-- Transaction A                          -- Transaction B (concurrently)
BEGIN;                                    BEGIN;
SELECT count(*) FROM oncall               SELECT count(*) FROM oncall
  WHERE on_call = true;   -- reads 2        WHERE on_call = true;   -- reads 2
-- "2 > 1, safe to remove myself"         -- "2 > 1, safe to remove myself"
UPDATE oncall SET on_call = false         UPDATE oncall SET on_call = false
  WHERE id = 'alice';                       WHERE id = 'bob';
COMMIT;                                   COMMIT;
-- Result: nobody is on call. Neither transaction did anything wrong alone.
\`\`\`

Each transaction read a consistent snapshot and wrote a *different row*, so there's no write-write conflict for Repeatable Read to detect. The fixes:

1. **\`SERIALIZABLE\`** isolation. Postgres uses Serializable Snapshot Isolation, which detects the dangerous read-write dependency and aborts one transaction with a serialisation failure — so **your application must be prepared to retry** on \`40001\`. That retry loop is the price of serialisable, and forgetting it is the usual reason teams say "serializable broke our app."
2. **Materialise the conflict** — take an explicit lock on a row both transactions must touch (\`SELECT … FOR UPDATE\` on a shared "schedule" row), turning the write skew into a write-write conflict the engine already handles.
3. **Express it as a constraint** where possible, so the database enforces the invariant regardless of isolation.

### 9.2 Optimistic vs Pessimistic Concurrency

\`\`\`sql
-- Pessimistic: lock the row for the duration. Blocks others; risks deadlock.
BEGIN;
SELECT * FROM inventory WHERE id = 1 FOR UPDATE;
UPDATE inventory SET qty = qty - 1 WHERE id = 1;
COMMIT;

-- Optimistic: no lock; detect conflict on write via a version column
UPDATE inventory SET qty = qty - 1, version = version + 1
WHERE id = 1 AND version = 7;
-- 0 rows affected → someone else updated it → re-read and retry
\`\`\`

Pessimistic suits short, high-contention critical sections (inventory decrement at checkout). Optimistic suits low contention and long think-time (a user editing a form for five minutes — you cannot hold a lock for that).

And the simplest option is often the right one: \`UPDATE inventory SET qty = qty - 1 WHERE id = 1 AND qty > 0\` is atomic in a single statement, needs no explicit lock, and returns 0 rows when it would have gone negative. **Prefer a single atomic statement to a read-modify-write whenever you can express it.**

Also know \`FOR UPDATE SKIP LOCKED\`, which is how you build a work queue in SQL — each worker grabs rows nobody else has locked, with no blocking:

\`\`\`sql
SELECT * FROM jobs WHERE status = 'pending'
ORDER BY created_at LIMIT 10
FOR UPDATE SKIP LOCKED;
\`\`\`

---

## 10. Locking and Deadlocks

### 10.1 What Takes What

\`SELECT\` in Postgres takes no row locks (MVCC gives it a snapshot instead — **readers don't block writers and writers don't block readers**, which is the single biggest practical advantage of MVCC). \`UPDATE\`/\`DELETE\` take a row-level exclusive lock until commit. \`SELECT … FOR UPDATE\` takes one explicitly. DDL takes table-level locks — \`ALTER TABLE\` can take \`ACCESS EXCLUSIVE\`, which blocks *everything*, including reads.

### 10.2 Deadlocks

Two transactions each holding a lock the other wants:

\`\`\`
T1: UPDATE accounts WHERE id = 1   -- holds lock on row 1
T2: UPDATE accounts WHERE id = 2   -- holds lock on row 2
T1: UPDATE accounts WHERE id = 2   -- waits for T2
T2: UPDATE accounts WHERE id = 1   -- waits for T1  → deadlock
\`\`\`

The database detects the cycle and kills one transaction (Postgres: \`40P01 deadlock detected\`). You cannot prevent deadlocks entirely, so the answer has two halves:

**Reduce them:**
- **Acquire locks in a consistent order** everywhere — e.g. always update accounts in ascending \`id\` order. This single convention eliminates the majority of real deadlocks.
- **Keep transactions short**, and do reads/computation *before* \`BEGIN\`.
- **Touch fewer rows**: one atomic \`UPDATE … WHERE\` instead of a loop of updates.
- **Avoid escalation**: an un-indexed \`WHERE\` in an \`UPDATE\` can lock far more rows than you intended, because the engine must examine them.

**Handle them:** deadlocks are a **retryable** error. Catch \`40P01\` (and \`40001\` for serialisation failures) and retry the whole transaction with back-off. A transaction that can't be safely retried is a design problem — which is why side effects (emails, payments, webhooks) belong *outside* the transaction or behind an outbox.

### 10.3 Lock-Free Migrations

The classic outage: \`ALTER TABLE users ADD COLUMN … NOT NULL DEFAULT 'x'\` on a large table. On older Postgres this rewrote the whole table under an exclusive lock; modern versions handle a constant default without a rewrite, but plenty of operations still don't. And even a fast \`ALTER\` must **wait for the exclusive lock**, so a single long-running query can queue every subsequent request behind it — an outage caused by lock queueing, not by the migration itself.

Safer patterns: add columns nullable, backfill in batches, add the \`NOT NULL\` afterwards via a validated \`CHECK\`; use \`CREATE INDEX CONCURRENTLY\`; add foreign keys as \`NOT VALID\` then \`VALIDATE CONSTRAINT\` separately; and always set a short \`lock_timeout\` so a migration fails fast instead of queueing traffic behind it.

### 10.4 Why a \`UNIQUE\` Constraint Beats a Check-Then-Insert

\`\`\`js
async function registerUser(email) {
  // ✗ A race. Two concurrent requests both see "no existing user" and both insert.
  const existing = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (!existing.rows.length) await db.query('INSERT INTO users (email) VALUES ($1)', [email]);

  // ✓ Let the database arbitrate; handle the violation
  try {
    await db.query('INSERT INTO users (email) VALUES ($1)', [email]);
  } catch (e) {
    if (e.code === '23505') return { error: 'Email already registered' };   // unique_violation
    throw e;
  }
}
\`\`\`

Or make it declarative, and let the database do the whole job:

\`\`\`sql
INSERT INTO users (email) VALUES ($1) ON CONFLICT (email) DO NOTHING;
\`\`\`

The general principle: **any check-then-act across two statements is a race unless it's inside a transaction with adequate isolation, or the invariant is a constraint.** Constraints are checked atomically at the storage layer, which is a guarantee your application logic cannot reproduce.


---

## 11. The N+1 Problem and ORMs

The most common performance bug in application code, and it's invisible in the schema:

\`\`\`js
const posts = await Post.findAll({ limit: 20 });          // 1 query
for (const post of posts) {
  post.author = await User.findByPk(post.authorId);       // 20 more queries
}
\`\`\`

21 round trips where 2 would do. Each is fast, so nothing looks slow in the database's slow-query log — the cost is **latency × N**, which is why it shows up as a slow endpoint with a fast database.

**The fixes:**

\`\`\`js
// 1. Eager loading — the ORM does a JOIN or a second batched query
await Post.findAll({ limit: 20, include: [User] });
await prisma.post.findMany({ take: 20, include: { author: true } });

// 2. Manual batching — two queries, then stitch in memory
const posts  = await db.query('SELECT * FROM posts LIMIT 20');
const ids    = [...new Set(posts.map(p => p.author_id))];
const users  = await db.query('SELECT * FROM users WHERE id = ANY($1)', [ids]);
const byId   = new Map(users.map(u => [u.id, u]));
posts.forEach(p => { p.author = byId.get(p.author_id); });

// 3. DataLoader — batches and dedupes within a tick. The GraphQL answer.
const userLoader = new DataLoader(ids =>
  db.query('SELECT * FROM users WHERE id = ANY($1)', [ids])
    .then(rows => ids.map(id => rows.find(r => r.id === id)))   // MUST preserve order
);
\`\`\`

Note the trade-off in eager loading: **\`JOIN\`-based eager loading multiplies rows** (§3.2), so \`include\`-ing two one-to-many relations at once can produce a huge result set — the "cartesian explosion." Most mature ORMs issue separate batched queries per relation instead, which is why Prisma's \`include\` is usually safe and Sequelize's nested \`include\` sometimes isn't.

**How to catch N+1 before production:** log every query with the request ID and assert a query-count budget in integration tests. A test that fails when an endpoint issues more than 5 queries catches this permanently — much better than noticing it in a flame graph six months later.

### 11.1 The Rest of the ORM Pathologies

- **\`SELECT *\` by default.** ORMs fetch every column, including large \`TEXT\`/\`jsonb\` blobs you don't need — which also defeats index-only scans. Select explicitly on hot paths.
- **Lazy loading in a loop** — the N+1 above, but implicit, triggered by a property access. Prefer explicit loading; some ORMs can be configured to throw on lazy access.
- **Losing the ability to write real SQL.** Window functions, CTEs, \`DISTINCT ON\`, \`FOR UPDATE SKIP LOCKED\` and \`ON CONFLICT\` are frequently the right answer and awkward through an ORM. Every good ORM has a raw-query escape hatch — use it, with **parameterisation** (\`$queryRaw\` with bound values, never string interpolation — see the Web Security guide).
- **Transactions not spanning what you think.** Two ORM calls are two transactions unless you explicitly wrap them.
- **Migrations generated from a diff** can produce a locking DDL statement that's fine on your laptop and an outage on a 100M-row table (§10.3). Read every generated migration.

The balanced position for an interview: ORMs are excellent for CRUD, mapping and migrations, and they remove a large class of SQL-injection bugs by parameterising. They're poor at complex reads. **Use the ORM for writes and simple reads; drop to SQL (or a query builder) for reporting and anything with window functions or unusual joins.**

---

## 12. Migrations

Rules for changing a schema that's serving traffic:

**Every migration must be backwards-compatible with the currently-deployed code**, because during a rolling deploy both versions run simultaneously. That forces the **expand/contract** pattern:

\`\`\`
Renaming a column, safely:
1. EXPAND    add the new column; write to BOTH; read from the old
2. BACKFILL  copy existing data in batches (not one UPDATE over 50M rows)
3. SWITCH    deploy code that reads from the new column
4. CONTRACT  stop writing the old column; drop it in a later release
\`\`\`

Four steps and at least three deploys for a rename. That's the cost of zero downtime, and candidates who propose a single \`ALTER TABLE … RENAME\` haven't operated a live system.

Other rules:
- **Additive first.** Adding a nullable column or a new table is safe. Dropping or renaming is not.
- **Backfill in batches** with a bounded loop and a sleep, so you don't hold a long transaction or saturate I/O.
- **Separate DDL from data migration.** DDL takes locks; a long data migration inside the same transaction holds those locks for its whole duration.
- **Always write the down migration**, and actually test it. An untested rollback is not a rollback.
- **\`lock_timeout\` and \`statement_timeout\`** on migration connections, so a blocked migration fails instead of queueing all traffic behind it.
- **Version-control migrations, never edit a shipped one.** Fix forward with a new migration.

---

## 13. Scaling a Relational Database

The order matters — most teams reach for the last item when the first four would have done.

1. **Fix the queries and indexes.** Genuinely most "we need to scale" situations are one missing index or one N+1. Measure first (\`pg_stat_statements\`).
2. **Connection pooling.** Each Postgres connection is a process with real memory cost, and hundreds of idle connections from serverless functions will exhaust the server. **PgBouncer** (transaction pooling) is the standard answer, and it's mandatory in front of Lambda-style workloads. Note transaction pooling breaks session-level features (\`SET\`, advisory locks, prepared statements) — a real constraint to mention.
3. **Caching.** Redis in front of expensive reads, or a materialised view refreshed on a schedule for a heavy aggregate.
4. **Read replicas.** Send reads to replicas, writes to the primary. The thing to name unprompted: **replication lag** means a read replica can serve stale data, so a user who just wrote and immediately reads may not see their own write. Route read-your-writes traffic to the primary, or use a causality token.
5. **Partitioning** (declarative in Postgres). Split one logical table into physical partitions by range (time) or list (tenant). Wins: dropping old data becomes an instant \`DROP TABLE\` instead of a huge \`DELETE\`, and queries with the partition key in the predicate scan far less. Only helps if your queries **include the partition key** — otherwise every partition is scanned and you've made things worse.
6. **Sharding.** Split data across independent databases by a shard key. This is the last resort because it costs you cross-shard joins, cross-shard transactions, and a permanent operational burden — and the shard key is nearly impossible to change later. See the System Design guide.

A useful framing: **vertical scaling is underrated.** Modern hardware runs a very large Postgres instance, and "buy a bigger machine" buys years of runway for a fraction of the engineering cost of sharding.

---

## 14. Postgres vs MySQL

| | **PostgreSQL** | **MySQL (InnoDB)** |
|---|---|---|
| Default isolation | Read Committed | **Repeatable Read** |
| MVCC | row versions in the heap; needs \`VACUUM\` | undo log; no vacuum problem |
| Primary key storage | heap + separate indexes | **clustered** — PK *is* the row order |
| \`JOIN\` support | full, incl. \`FULL OUTER\` | no \`FULL OUTER JOIN\` |
| JSON | **\`jsonb\`** — binary, indexable with GIN | \`JSON\` — functional, less powerful |
| Types | rich: arrays, ranges, \`ENUM\`, custom, extensions | narrower |
| Full-text search | built in (\`tsvector\` + GIN) | built in, weaker |
| Extensions | **PostGIS, pgvector, TimescaleDB, pg_cron** | limited |
| DDL transactions | **transactional** — a failed migration rolls back | mostly not (atomic DDL since 8.0, not transactional) |
| Replication | logical + physical | mature, long-established |

**When Postgres:** complex queries, \`jsonb\`, geospatial, vector search (pgvector — see the AI & LLM guide), correctness-sensitive work, transactional migrations. It's the default recommendation for new projects in 2026.

**When MySQL:** an existing MySQL estate and expertise, or a workload dominated by simple primary-key reads where the clustered index is a genuine advantage.

The two consequences of the storage difference worth knowing. Because InnoDB **clusters on the primary key**, a random UUIDv4 PK causes page splits and fragmentation on insert — much worse than in Postgres. And because Postgres keeps old row versions in the heap, \`UPDATE\`-heavy tables **bloat** and depend on autovacuum keeping up; a long-running transaction blocking vacuum is a classic Postgres incident with no MySQL equivalent.

---

## 15. Interview Questions & Answers

### Beginner

---

**Q1: What's the difference between \`WHERE\` and \`HAVING\`?**

\`WHERE\` filters **rows before grouping**; \`HAVING\` filters **groups after aggregation**. That follows from the logical order of evaluation:

\`\`\`
FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT
\`\`\`

\`\`\`sql
SELECT user_id, SUM(total) AS spend
FROM orders
WHERE status = 'paid'          -- discard unpaid ROWS first
GROUP BY user_id
HAVING SUM(total) > 1000;      -- then discard GROUPS below the threshold
\`\`\`

You cannot use an aggregate in \`WHERE\` (the groups don't exist yet), and while you *can* put a row-level condition in \`HAVING\`, it's slower — you'd be aggregating rows you're about to throw away.

Two related facts from the same ordering: **you can't reference a \`SELECT\` alias in \`WHERE\`** because \`SELECT\` runs later (Postgres enforces this strictly; MySQL is more permissive), but you *can* in \`ORDER BY\`.

---

**Q2: Explain the JOIN types, and what's the most common JOIN bug you've seen?**

\`INNER JOIN\` returns only matching rows. \`LEFT JOIN\` returns all left rows with \`NULL\`s where there's no match. \`RIGHT\` is the mirror. \`FULL OUTER\` returns unmatched rows from both sides (Postgres has it; MySQL doesn't). \`CROSS JOIN\` is the cartesian product.

The most common bug is **a \`LEFT JOIN\` silently becoming an \`INNER JOIN\`**:

\`\`\`sql
-- ✗ WHERE on a right-hand column discards the NULL rows the LEFT JOIN produced
FROM users u LEFT JOIN orders o ON o.user_id = u.id
WHERE o.status = 'paid'

-- ✓ Filter in ON, so unmatched users survive
FROM users u LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid'
\`\`\`

\`ON\` decides what counts as a match; \`WHERE\` filters the join's result. Since unmatched left rows have \`NULL\` in every right column, any \`WHERE\` predicate on a right column (except \`IS NULL\`) eliminates them.

The second most common is **row multiplication**. A join isn't a lookup — it's a filtered product. Joining users→orders *and* users→addresses in one query gives \`orders × addresses\` rows per user, and every \`SUM\` is then wrong. Aggregate in subqueries first, or run separate queries.

---

**Q3: What is an index, and when does one *not* help?**

A B-tree index is a sorted, balanced structure mapping key values to row locations, giving O(log n) lookups instead of a full scan. Because it's **sorted**, it also serves \`ORDER BY\`, range predicates, and prefix \`LIKE 'abc%'\`.

Cases where an index doesn't help — this is the more interesting half:

- **\`LIKE '%suffix'\`** — a suffix has no position in the sort order. You need a trigram index (\`pg_trgm\`) or full-text search.
- **A function or cast wrapping the column.** \`WHERE LOWER(email) = …\`, \`WHERE DATE(created_at) = …\` and \`WHERE id::text = …\` all defeat a plain index. Either index the expression, or rewrite the predicate to be **sargable**: \`created_at >= '2026-09-01' AND created_at < '2026-09-02'\`.
- **Low selectivity.** If the predicate matches most of the table, a sequential scan is genuinely faster — thousands of random index-then-heap reads cost more than one sequential pass. The planner knows this, which is why a \`Seq Scan\` isn't automatically a bug.
- **Not a leftmost prefix of a composite index.** An index on \`(a, b, c)\` cannot serve \`WHERE b = 2\`. Like a phone book sorted by surname — useless for finding everyone named John.
- **Small tables**, where the whole thing is one or two pages.

And the cost side: every index is maintained on every write, consumes cache, and can be redundant — an index on \`(a)\` is redundant if \`(a, b)\` already exists. \`pg_stat_user_indexes\` with \`idx_scan = 0\` finds the ones earning nothing.

---

### Intermediate

---

**Q4: A query is slow. Walk me through diagnosing it.**

**1. Confirm it's the query.** \`pg_stat_statements\` ranks by total time — the real problem is often a fast query called 10,000 times (an N+1) rather than one slow query, and those need completely different fixes.

**2. \`EXPLAIN (ANALYZE, BUFFERS)\`.** Not plain \`EXPLAIN\` — I need actuals, not estimates.

**3. Compare estimated vs actual rows.** This is the first thing I look at. A large gap is usually the root cause: the planner chose a Nested Loop because it expected 1 row and got 8,000. Causes: stale statistics (run \`ANALYZE\`), correlated columns the planner assumes are independent (fix with extended statistics), or an expression it can't estimate.

**4. Look for the specific red flags:** a \`Seq Scan\` on a large table with a selective \`Filter\` and high \`Rows Removed by Filter\` (missing index); \`loops=N\` on an inner node (N random lookups — a Hash Join would do one pass); \`Sort Method: external merge Disk\` (raise \`work_mem\` or add an index providing the order).

**5. Check sargability.** Is a function wrapping an indexed column? Is the predicate a leftmost prefix of the composite index I think it's using?

**6. Consider a covering index** for a hot read path — if every selected column is in the index, you get an Index Only Scan and skip the heap entirely, often a 10× win.

**7. Then question the query itself.** Does it need \`SELECT *\`? Is it \`OFFSET 100000\` (O(offset) — switch to keyset pagination)? Could it be a window function instead of a self-join? Is the work better done once in a materialised view?

The framing I'd add: I'd also check **what changed**. A query that was fast last week and is slow now usually means data growth crossing a planner threshold, statistics going stale, or an index that got dropped or bloated — not a bad query.

---

**Q5: Explain isolation levels and what each one prevents.**

Four anomalies, and each level prevents progressively more:

| Level | Dirty read | Non-repeatable | Phantom | Write skew |
|---|---|---|---|---|
| Read Uncommitted | ✗ | ✗ | ✗ | ✗ |
| Read Committed | ✓ | ✗ | ✗ | ✗ |
| Repeatable Read | ✓ | ✓ | ✓ in PG* | ✗ |
| Serializable | ✓ | ✓ | ✓ | ✓ |

**Dirty read** — reading uncommitted data. **Non-repeatable read** — the same row read twice gives different values. **Phantom read** — the same *query* run twice returns new rows. **Write skew** — two transactions read overlapping sets, decide independently, and their combined writes break an invariant neither would have broken alone.

Two things to volunteer. **The defaults differ**: Postgres and Oracle default to Read Committed, MySQL/InnoDB to Repeatable Read — so identical code behaves differently across engines. And **implementations diverge at the same named level**: Postgres's Repeatable Read is snapshot isolation and *does* prevent phantoms, but still permits write skew; InnoDB uses next-key locks so locking reads don't see phantoms either.

**Write skew is the one worth explaining**, because it's the reason Serializable exists. Two on-call engineers, a rule that one must stay on call: both read \`count = 2\`, both conclude it's safe to remove themselves, both write *different rows*, and nobody is on call. No write-write conflict, so snapshot isolation can't detect it. Fixes: \`SERIALIZABLE\` (Postgres uses SSI and aborts one with \`40001\` — **so you must implement a retry loop**, which is the part teams forget), materialise the conflict with \`SELECT … FOR UPDATE\` on a shared row, or express the invariant as a constraint.

---

**Q6: What is the N+1 problem and how do you fix it?**

One query to fetch a list, then one more per item to fetch a relation:

\`\`\`js
const posts = await Post.findAll({ limit: 20 });               // 1
for (const p of posts) p.author = await User.findByPk(p.authorId);  // +20
\`\`\`

21 round trips instead of 2. It's insidious because **each query is fast**, so nothing appears in the slow-query log — the cost is \`latency × N\`, presenting as a slow endpoint with a healthy-looking database.

Fixes: **eager loading** (\`include: [User]\` / \`include: { author: true }\`), **manual batching** (collect the IDs, one \`WHERE id = ANY($1)\`, stitch with a \`Map\`), or **DataLoader**, which batches and dedupes within a tick and is the standard GraphQL answer — noting that its batch function **must return results in the same order as the input keys**.

The caveat on eager loading: \`JOIN\`-based eager loading **multiplies rows**, so including two one-to-many relations at once can cause a cartesian explosion. Mature ORMs issue separate batched queries per relation instead.

The part that distinguishes an experienced answer: **prevent it structurally.** Log every query with its request ID and add a **query-count budget assertion** to integration tests — a test that fails when an endpoint issues more than N queries catches this permanently, instead of you finding it in a flame graph months later.

---

### Advanced

---

**Q7: Design the schema and queries for a multi-tenant SaaS app. How do you keep tenants isolated?**

Three isolation models, and the choice is driven by compliance and tenant size rather than by technology:

| Model | Isolation | Cost | Fits |
|---|---|---|---|
| **Shared schema, \`tenant_id\` column** | logical | lowest | most SaaS; thousands of small tenants |
| **Schema per tenant** | stronger | medium | tens to low hundreds of tenants |
| **Database per tenant** | strongest | highest | enterprise, strict compliance, or one huge tenant |

**My default is shared schema with \`tenant_id\`**, and then the whole answer is about making leakage impossible:

1. **\`tenant_id\` as the leading column of every index**, and in the primary key of every tenant-scoped table. This gives locality (a tenant's rows sit together) and makes every query naturally partition-pruned.
2. **Row-Level Security in Postgres** — this is the control that actually holds, because it's enforced by the database rather than remembered by developers:

\`\`\`sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON invoices
  USING (tenant_id = current_setting('app.tenant_id')::bigint);
-- then per request/transaction:  SET LOCAL app.tenant_id = '42';
\`\`\`
   A forgotten \`WHERE tenant_id = …\` now returns zero rows instead of another tenant's data. Without RLS you're relying on every query in the codebase forever, which is the failure mode that produces the headline breach.
3. **Set the tenant in a transaction-scoped \`SET LOCAL\`**, so it can't leak across pooled connections. This interacts with PgBouncer — transaction pooling is fine with \`SET LOCAL\`, session pooling is not.
4. **A data-access layer** that takes the tenant from the authenticated session and never from a request parameter — otherwise you've built IDOR at the tenant level (see the Web Security guide).
5. **Partition by \`tenant_id\`** (list or hash) once volume justifies it, which also makes "delete a tenant's data" a \`DROP TABLE\`.

Then the operational realities to raise unprompted: **noisy neighbours** (one huge tenant degrading everyone — mitigate with per-tenant rate limits and the option to promote a big tenant to its own database), **per-tenant backup and restore** (very hard in a shared schema — restoring one tenant means extracting rows, not restoring a snapshot), and **migrations** (one migration for shared schema versus N for schema-per-tenant, which is a strong argument for the shared model at scale).

---

**Q8: When would you *not* use a relational database?**

Genuine cases, and I'd start by saying that Postgres now absorbs several workloads that used to require a specialist store — \`jsonb\` for document data, \`pgvector\` for embeddings, PostGIS for geospatial, TimescaleDB for time-series, \`tsvector\` for full-text, \`LISTEN/NOTIFY\` and \`SKIP LOCKED\` for queues. So the bar for adding a second datastore is higher than it was, and **"we already run Postgres" is a strong argument** given the operational cost of another system.

Where something else genuinely wins:

- **Caching and ephemeral state** → **Redis.** Sub-millisecond, TTLs, atomic counters, sorted sets for leaderboards and rate limiting. Not a system of record.
- **Event streaming with replay and many independent consumers** → **Kafka.** A durable, ordered, replayable log is a genuinely different abstraction from a table.
- **Very high write volume of independent records** with simple access patterns → a wide-column store (**Cassandra**, **DynamoDB**). You trade joins, transactions and ad-hoc querying for linear write scalability and predictable latency at any size.
- **Full-text search at scale** with relevance tuning, faceting, aggregations → **Elasticsearch/OpenSearch.** Postgres full-text is fine for moderate corpora and much simpler to operate.
- **Graph traversal as the primary access pattern** — many-hop queries over a deeply connected graph → **Neo4j**. Recursive CTEs handle hierarchies well; arbitrary-depth traversal over billions of edges is where they stop being pleasant.
- **Genuinely schemaless, rapidly-changing documents** → a document store. Though \`jsonb\` covers most of this while keeping transactions and joins.
- **Analytics over billions of rows** → a **columnar** store (ClickHouse, BigQuery, Snowflake). This is the clearest case: row-oriented storage is the wrong physical layout for scanning two columns of a billion rows, and the difference is orders of magnitude.

The framing I'd end on: **the question is usually not "instead of" but "in addition to."** A typical system is Postgres as the system of record, Redis for cache and rate limits, and a columnar warehouse for analytics fed by CDC. The failure mode to avoid is picking a specialist store for a workload a relational database handles fine, then discovering you need transactions and joins after all — which is far more common than the reverse.


---

## 16. Tricky Questions

---

**Q1: The \`users\` table has 1,000 rows and \`orders\` has 500 non-null \`user_id\` values. How many rows does each query return?**

\`\`\`sql
-- A
SELECT count(*) FROM users WHERE id NOT IN (SELECT user_id FROM orders);
-- B
SELECT count(*) FROM users u WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
\`\`\`

**Answer:** If \`orders.user_id\` contains **even one \`NULL\`**, query A returns **0** and query B returns the correct count. If there are no \`NULL\`s, both are correct.

**Explanation:**

\`NOT IN\` against a subquery expands into a chain of inequality comparisons:

\`\`\`sql
id <> 1 AND id <> 7 AND id <> 12 AND … AND id <> NULL
\`\`\`

\`id <> NULL\` evaluates to **\`UNKNOWN\`**, not \`TRUE\` or \`FALSE\`. And in three-valued logic, \`TRUE AND UNKNOWN\` is \`UNKNOWN\` — so the whole predicate can never be \`TRUE\` for any row. \`WHERE\` only keeps rows where the predicate is \`TRUE\`, so **zero rows** come back. Silently. No error, no warning.

\`NOT EXISTS\` is unaffected because it asks a different question: "does the correlated subquery produce any row?" A row where \`o.user_id IS NULL\` simply doesn't match \`o.user_id = u.id\`, so it contributes nothing rather than poisoning the logic.

This is one of the most damaging SQL traps because it fails *quietly* and only when the data contains a \`NULL\` — so it passes in development, passes in staging with seeded data, and returns an empty report in production the day someone inserts a row with a nullable foreign key.

The related \`NULL\` behaviours worth knowing in the same breath:

\`\`\`sql
NULL = NULL                     -- UNKNOWN. Use IS NULL.
count(*) vs count(col)          -- aggregates IGNORE NULLs, so these differ
AVG(col)                        -- divides by the NON-NULL count, not row count
UNIQUE constraint               -- permits MULTIPLE NULLs (two unknowns aren't equal)
ORDER BY col                    -- nulls LAST in Postgres, FIRST in MySQL
'a' || NULL                     -- NULL, not 'a'
\`\`\`

**The rules:** prefer \`NOT EXISTS\` over \`NOT IN\` unconditionally for subqueries, add \`NOT NULL\` to columns that shouldn't be nullable, and use \`COALESCE\` at boundaries where a \`NULL\` would propagate through arithmetic or concatenation.

**Takeaway:** \`NOT IN\` with a subquery that can yield \`NULL\` always returns zero rows because \`x <> NULL\` is \`UNKNOWN\` — use \`NOT EXISTS\`, which is \`NULL\`-safe and usually plans better.

---

**Q2: This index exists. Why is the query still doing a sequential scan?**

\`\`\`sql
CREATE INDEX idx_users_email ON users (email);

SELECT * FROM users WHERE LOWER(email) = 'ada@example.com';
SELECT * FROM users WHERE created_at::date = '2026-09-01';
SELECT * FROM orders WHERE user_id = '42';        -- user_id is BIGINT
\`\`\`

**Answer:** All three predicates are **non-sargable** — a function, a cast, or an implicit type conversion is applied to the indexed column, so the index's sort order no longer corresponds to the values being compared.

**Explanation:**

An index on \`email\` stores the **actual values**, sorted. \`LOWER(email)\` is a *different* value, and the index has no idea where \`'ada@example.com'\` would sit in a lowercased ordering. The database can't use the index, so it computes the function for every row — a full scan.

Same for \`created_at::date\`: the index is sorted by timestamp, not by the truncated date. And the third one is the sneakiest — comparing a \`BIGINT\` column to a string literal forces a conversion, and depending on the direction the engine picks, it may cast the *column* rather than the literal, defeating the index.

**Two fixes for each shape.** Either index the expression:

\`\`\`sql
CREATE INDEX idx_users_lower_email ON users (LOWER(email));
\`\`\`

Or rewrite the predicate to be sargable, which is usually better because it needs no extra index:

\`\`\`sql
-- ✓ Range predicate on the raw column — uses the plain index
WHERE created_at >= '2026-09-01' AND created_at < '2026-09-02'

-- ✓ Match the column's type
WHERE user_id = 42

-- ✓ For case-insensitive matching, consider the type instead of a function
ALTER TABLE users ALTER COLUMN email TYPE citext;   -- Postgres citext extension
\`\`\`

The other classic non-sargable patterns to recognise:

\`\`\`sql
WHERE email LIKE '%@example.com'      -- leading wildcard: no sort position. Needs pg_trgm.
WHERE amount + 0 > 100                -- arithmetic on the column
WHERE EXTRACT(year FROM created_at) = 2026
WHERE COALESCE(deleted_at, '9999-01-01') > now()   -- wrap the LITERAL, not the column
\`\`\`

And the diagnostic habit: \`EXPLAIN (ANALYZE, BUFFERS)\` and look for \`Seq Scan\` with a high **\`Rows Removed by Filter\`**. That combination means "I read everything and threw most of it away," which is the signature of a defeated index.

One honest caveat: a \`Seq Scan\` is **not always wrong.** If the predicate matches most of the table, or the table is small, sequential I/O genuinely beats thousands of random index-then-heap reads, and the planner is making the right call. Check the row counts before assuming the index is the problem.

**Takeaway:** wrapping an indexed column in a function, a cast, or an implicit type conversion makes the predicate non-sargable — index the expression, or rewrite the predicate to compare the raw column against a converted literal.

---

**Q3: Two concurrent transactions run this at \`REPEATABLE READ\`. Both commit successfully. What's the final balance, and what went wrong?**

\`\`\`sql
-- Both T1 and T2, concurrently:
BEGIN;
  SELECT balance FROM accounts WHERE id = 1;        -- both read 100
  -- application computes: 100 - 60 = 40
  UPDATE accounts SET balance = 40 WHERE id = 1;
COMMIT;
\`\`\`

**Answer:** The final balance is **40**, not −20. One withdrawal of 60 was silently lost. This is a **lost update**, and \`REPEATABLE READ\` does not prevent it when the write is a blind overwrite computed in application code.

**Explanation:**

The critical detail is that the application **read a value, computed outside the database, and wrote back an absolute number.** Both transactions read \`100\`, both computed \`40\`, and both wrote \`40\`. In Postgres's snapshot isolation, T2's \`UPDATE\` blocks until T1 commits, then re-checks — and because the row's *new* value doesn't invalidate T2's \`WHERE id = 1\` predicate, T2 proceeds and overwrites. Two withdrawals of 60 happened; the balance dropped by 60 once.

(MySQL/InnoDB behaves similarly here. In Postgres, \`REPEATABLE READ\` would raise a serialisation failure if T2's \`UPDATE\` conflicted with a concurrently-updated row — but the classic trap is that many applications retry blindly or use \`READ COMMITTED\`, where T2 simply re-reads the fresh row and still overwrites with its stale computation.)

**Four fixes, roughly in order of preference:**

\`\`\`sql
-- 1. BEST: make it a single atomic statement. No read-modify-write at all.
UPDATE accounts SET balance = balance - 60 WHERE id = 1 AND balance >= 60;
-- 0 rows affected → insufficient funds. Atomic, no lock needed, no race.

-- 2. Pessimistic lock: serialise the critical section explicitly
BEGIN;
  SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;   -- ← blocks the other txn
  UPDATE accounts SET balance = $computed WHERE id = 1;
COMMIT;

-- 3. Optimistic locking with a version column
UPDATE accounts SET balance = 40, version = version + 1
WHERE id = 1 AND version = 7;         -- 0 rows → conflict → re-read and retry

-- 4. SERIALIZABLE isolation — plus a retry loop on 40001
\`\`\`

Option 1 is the answer to give first, because it eliminates the class of bug rather than guarding against it: the read and the write happen in one statement, inside the engine, and the \`balance >= 60\` guard replaces the application's check. **Prefer a single atomic statement to a read-modify-write whenever the operation can be expressed relatively.**

The generalisable lesson: **isolation levels protect what the database can see.** A computation performed in your application, between a \`SELECT\` and an \`UPDATE\`, is invisible to the engine — so no isolation level can reason about it. Either keep the computation inside the statement, or tell the database about the dependency with an explicit lock or a version predicate.

**Takeaway:** a read-modify-write in application code is a lost-update race that \`REPEATABLE READ\` won't catch, because the engine can't see your computation — express it as a single relative \`UPDATE\` (\`balance = balance - 60 AND balance >= 60\`), or use \`FOR UPDATE\` or a version column.

---

**Q4: This endpoint got 20× slower after a data migration. The query is unchanged, the index exists, and \`EXPLAIN\` shows it being used. Why?**

**Answer:** Most likely stale statistics after the bulk load, so the planner is choosing a bad *strategy* with the right index — or the index has bloated. Both are invisible if you only check "is the index used?"

**Explanation:**

"The index is used" is a much weaker signal than people assume. Several things can go wrong while the index still appears in the plan:

**1. Stale statistics after a bulk load** — the most common cause. The planner's row estimates come from a sample collected by \`ANALYZE\`. A migration that inserts 10 million rows leaves those statistics describing the *old* table, so the planner might expect 100 rows and get 100,000. With a wrong estimate it picks a **Nested Loop** (correct for 100 rows, catastrophic for 100,000) over a **Hash Join**, and uses the index 100,000 times instead of once.

\`\`\`sql
ANALYZE orders;                             -- fix: refresh statistics
EXPLAIN (ANALYZE) …                          -- verify: estimated vs actual rows
\`\`\`

The diagnostic is comparing **estimated \`rows\` against actual \`rows\`** in \`EXPLAIN ANALYZE\`. A large gap is the root cause; the plan shape is only the symptom.

**2. Index or table bloat.** In Postgres, \`UPDATE\`s and \`DELETE\`s leave dead tuples that autovacuum reclaims. A large migration can outpace autovacuum, or a long-running transaction can block it entirely — leaving an index physically much larger than its live contents, so each lookup reads more pages. Fix: \`REINDEX CONCURRENTLY\`, and investigate why autovacuum fell behind.

**3. The data distribution changed.** If the migration made a previously-selective column unselective (a \`status\` column that was 50/50 and is now 99% one value), the same index is now a poor choice for that value — and worse, a **plan that's right for one parameter value is wrong for another**. This is the parameter-sniffing family of problems.

**4. The working set no longer fits in cache.** The table grew past available memory, so reads that were served from \`shared_buffers\`/page cache are now hitting disk. Nothing about the plan changed; the physics did. \`EXPLAIN (ANALYZE, BUFFERS)\` shows this as a shift from \`shared hit\` to \`read\`.

**5. It's not this query.** Row growth may have pushed a *different* query into contention, or the migration left a long-running transaction open, blocking vacuum and holding locks.

**The order I'd work in:** \`EXPLAIN (ANALYZE, BUFFERS)\` and compare estimates to actuals → \`ANALYZE\` the touched tables and re-check → look at buffer hit ratio → check \`pg_stat_user_tables\` for dead tuples and last autovacuum → check \`pg_stat_activity\` for long-running transactions.

And the process lesson worth stating: **run \`ANALYZE\` as the final step of every bulk migration.** It's one line and it prevents this entire category of post-migration performance incident.

**Takeaway:** "the index is being used" doesn't mean the plan is good — stale statistics after a bulk load cause row-estimate errors that select the wrong join strategy, so \`ANALYZE\` after every migration and always compare estimated against actual rows.

---

## 17. Cheat Sheet

\`\`\`
QUERY SEMANTICS
 1. Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT
    → ORDER BY → LIMIT. Aliases exist from SELECT onward (usable in ORDER BY, not WHERE).
 2. WHERE filters ROWS (pre-aggregation), HAVING filters GROUPS (post-aggregation).
 3. NULL is UNKNOWN, not a value. NULL = NULL is UNKNOWN. Use IS NULL.
 4. NOT IN (subquery with a NULL) returns ZERO ROWS, always. Use NOT EXISTS.
 5. Aggregates IGNORE NULLs → count(*) ≠ count(col); AVG divides by non-null count.
 6. UNIQUE permits multiple NULLs. ORDER BY puts nulls last in PG, first in MySQL.

JOINS
 7. A LEFT JOIN + a WHERE on a right-hand column = a silent INNER JOIN.
    Filter in ON to keep unmatched rows.
 8. A join is a filtered PRODUCT, not a lookup. Two one-to-many joins to the same
    parent multiply each other and break every aggregate.
 9. Aggregate in a subquery, then join. Or COUNT(DISTINCT) as a patch.
10. EXISTS for "does a related row exist" — semi-join, short-circuits, NULL-safe.
    NOT EXISTS > NOT IN, always.

WINDOWS & CTEs
11. Window functions compute across rows WITHOUT collapsing them. Highest-value
    SQL feature most candidates don't know.
12. "Latest row per group" = ROW_NUMBER() OVER (PARTITION BY … ORDER BY … DESC) = 1,
    or Postgres DISTINCT ON.
13. ROW_NUMBER (1,2,3,4) vs RANK (1,2,2,4) vs DENSE_RANK (1,2,2,3).
14. Default frame with ORDER BY is RANGE … CURRENT ROW — duplicate sort keys make
    a "running total" jump. Use ROWS when you mean physical rows.
15. Postgres inlines CTEs since v12; MATERIALIZED / NOT MATERIALIZED force it.
16. ALWAYS bound a RECURSIVE CTE with a depth guard, or a data cycle runs forever.

INDEXES
17. B-tree = sorted → serves equality, ranges, ORDER BY, and LIKE 'prefix%'.
    NOT LIKE '%suffix' (no sort position).
18. LEFTMOST PREFIX RULE: an index on (a,b,c) cannot serve WHERE b = 2.
    Phone book sorted by surname: useless for finding all the Johns.
19. Equality columns before range columns. A range stops the index being usable
    for anything after it.
20. Covering index (INCLUDE) → Index Only Scan, skips the heap. Often 10x.
21. NON-SARGABLE kills indexes: LOWER(col), col::date, EXTRACT(), col + 0,
    implicit type casts. Index the expression, or rewrite as a range on the raw column.
22. Partial index (WHERE status='active') is smaller and faster when you always
    filter that way.
23. Every index costs writes, cache and disk. (a) is redundant if (a,b) exists.
    pg_stat_user_indexes idx_scan = 0 finds dead weight.
24. CREATE INDEX CONCURRENTLY, or you take ACCESS EXCLUSIVE and block all writes.

QUERY PLANS
25. EXPLAIN (ANALYZE, BUFFERS) — never plain EXPLAIN when diagnosing.
26. FIRST thing to check: estimated rows vs ACTUAL rows. A big gap is the root cause;
    the plan shape is the symptom.
27. Seq Scan + high "Rows Removed by Filter" on a big table = missing index.
28. loops=N on an inner node = N random lookups; a Hash Join would do one pass.
29. Sort Method: external merge Disk → raise work_mem or add an ordering index.
30. A Seq Scan is NOT automatically bad — it wins on small tables and low selectivity.
31. Nested Loop (tiny outer + indexed inner) / Hash Join (no index, fits work_mem)
    / Merge Join (both already sorted).
32. RUN \`ANALYZE\` AS THE LAST STEP OF EVERY BULK MIGRATION.

TRANSACTIONS & ISOLATION
33. ACID's "Consistency" = your declared CONSTRAINTS hold. Not business correctness.
34. Anomalies: dirty read → non-repeatable read → phantom → WRITE SKEW.
35. Defaults DIFFER: Postgres/Oracle = Read Committed, MySQL/InnoDB = Repeatable Read.
36. Postgres Repeatable Read = snapshot isolation: prevents phantoms, ALLOWS write skew.
37. Write skew: both read a set, both decide, both write DIFFERENT rows, invariant
    broken. No write-write conflict to detect.
38. SERIALIZABLE requires an application RETRY LOOP on 40001. That's the price.
39. Prefer ONE ATOMIC STATEMENT to read-modify-write:
    UPDATE t SET qty = qty - 1 WHERE id = 1 AND qty > 0
40. Isolation cannot protect a computation done in your application between
    SELECT and UPDATE — the engine can't see it.
41. FOR UPDATE = pessimistic. Version column = optimistic. FOR UPDATE SKIP LOCKED
    = a work queue in SQL.
42. Keep transactions SHORT. In Postgres a long transaction blocks vacuum → bloat.
    Never hold one across a third-party network call.

LOCKING
43. Postgres MVCC: readers don't block writers, writers don't block readers.
44. Deadlock fix #1: acquire locks in a CONSISTENT ORDER (e.g. ascending id).
45. Deadlocks (40P01) and serialisation failures (40001) are RETRYABLE. Side effects
    (email, payment) belong outside the transaction or behind an outbox.
46. Migrations: additive first; add columns nullable then backfill in BATCHES;
    CREATE INDEX CONCURRENTLY; FK as NOT VALID then VALIDATE; set lock_timeout so
    a blocked migration fails instead of queueing all traffic behind it.
47. UNIQUE constraint > check-then-insert. Any check-then-act across two statements
    is a race. Handle 23505, or use ON CONFLICT.

ORMs & N+1
48. N+1 = 1 query for the list + 1 per item. Each is FAST, so it never shows in the
    slow-query log — the cost is latency × N.
49. Fix: eager loading, manual batching (WHERE id = ANY($1) + a Map), or DataLoader
    (whose batch fn MUST preserve input order).
50. JOIN-based eager loading MULTIPLIES rows — two one-to-many includes = cartesian
    explosion.
51. Assert a QUERY-COUNT BUDGET in integration tests. That's what prevents regressions.
52. ORM for writes and simple reads; raw SQL (parameterised!) for window functions,
    CTEs, DISTINCT ON, SKIP LOCKED, ON CONFLICT.

SCALING (in this order)
53. Fix queries and indexes first. Most "we need to scale" is one index or one N+1.
54. Connection pooling (PgBouncer) — mandatory in front of serverless. Transaction
    pooling breaks SET / advisory locks / prepared statements.
55. Cache (Redis, materialised views).
56. Read replicas — and REPLICATION LAG means read-your-writes must go to the primary.
57. Partitioning only helps if queries include the PARTITION KEY.
58. Sharding last: no cross-shard joins or transactions, and the shard key is
    near-impossible to change.
59. Vertical scaling is underrated. A big Postgres box buys years for less than
    the engineering cost of sharding.

KEYS & ENGINES
60. Surrogate PK + UNIQUE on the natural key. Natural PKs hurt when values change.
61. UUIDv4 as a PK destroys index locality (worst on InnoDB, where the PK IS the row
    order). Use UUIDv7 (time-ordered) or BIGSERIAL.
62. Postgres: heap + VACUUM, jsonb, full JOINs, transactional DDL, extensions
    (PostGIS/pgvector/TimescaleDB). MySQL: clustered PK, no FULL OUTER JOIN.
63. Multi-tenant: tenant_id as the LEADING index column + Row-Level Security +
    SET LOCAL per transaction. RLS is what makes a forgotten WHERE return zero rows
    instead of another tenant's data.
\`\`\`

---

## 18. References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/) — genuinely one of the best technical manuals in software
- [Use The Index, Luke!](https://use-the-index-luke.com) — the definitive free resource on indexing and SQL performance
- [PostgreSQL — Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html) and [explain.dave.cx](https://explain.dalibo.com) for visualising plans
- [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html) — the authoritative account of what each level guarantees
- [Jepsen — Consistency Models](https://jepsen.io/consistency) — rigorous definitions of the isolation and consistency landscape
- [Designing Data-Intensive Applications](https://dataintensive.net) — Kleppmann; the reference for isolation, replication and partitioning
- [SQL Style Guide](https://www.sqlstyle.guide) — a sane formatting convention
- [pgMustard — EXPLAIN glossary](https://www.pgmustard.com/docs/explain) — what every plan node actually means
- [Postgres Weekly](https://postgresweekly.com) — for keeping current
- [MySQL Documentation — InnoDB Locking](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html) — next-key locks and the gap-lock model
- [Strong Random Values / UUID v7](https://uuid7.com) — why time-ordered IDs matter for index locality
`;export{e as default};
