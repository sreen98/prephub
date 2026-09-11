const n=`# SQL Cheat Sheet

## Logical Order of Evaluation
\`\`\`
FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT
\`\`\`
This is why a \`SELECT\` alias can't be used in \`WHERE\` (it doesn't exist yet) but can in \`ORDER BY\`.

## Joins
\`\`\`sql
SELECT * FROM a INNER JOIN b ON a.id = b.a_id;   -- matches only
SELECT * FROM a LEFT  JOIN b ON a.id = b.a_id;   -- all of a, NULLs for missing b
SELECT * FROM a RIGHT JOIN b ON a.id = b.a_id;
SELECT * FROM a FULL  JOIN b ON a.id = b.a_id;
SELECT * FROM a CROSS JOIN b;                    -- cartesian product
SELECT * FROM a JOIN a AS a2 ON a.mgr = a2.id;   -- self join
\`\`\`
**The LEFT JOIN trap:** a filter on the right table must go in \`ON\`, not \`WHERE\` — \`WHERE b.x = 1\` discards the NULL rows and silently turns it into an INNER JOIN.

## NULL
\`\`\`sql
WHERE x IS NULL         -- never \`= NULL\`
NULL = NULL             -- NULL, not TRUE
COALESCE(x, y, 0)       -- first non-null
NULLIF(a, b)            -- NULL when a = b
count(*)                -- counts rows
count(col)              -- SKIPS NULLs
\`\`\`
\`NOT IN (subquery)\` returns no rows if the subquery yields a single NULL — use \`NOT EXISTS\`.

## Aggregates & Grouping
\`\`\`sql
SELECT dept, count(*) AS n, avg(salary) AS avg_sal
FROM emp
WHERE active                       -- filters ROWS (before grouping)
GROUP BY dept
HAVING count(*) > 5                -- filters GROUPS (after)
ORDER BY n DESC
LIMIT 10;

count(*) sum() avg() min() max()
count(DISTINCT col)
string_agg(name, ',')              -- Postgres;  GROUP_CONCAT in MySQL
filter (WHERE cond)                -- Postgres conditional aggregate
\`\`\`

## Window Functions
\`\`\`sql
SELECT name, dept, salary,
  row_number() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn,
  rank()       OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk,
  dense_rank() OVER (PARTITION BY dept ORDER BY salary DESC) AS drnk,
  lag(salary)  OVER (ORDER BY hired)  AS prev,
  lead(salary) OVER (ORDER BY hired)  AS next,
  sum(salary)  OVER (ORDER BY hired ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running,
  avg(salary)  OVER (PARTITION BY dept) AS dept_avg   -- no collapse, unlike GROUP BY
FROM emp;
\`\`\`
\`row_number\` always unique; \`rank\` leaves gaps after ties; \`dense_rank\` doesn't. Windows run **after** \`WHERE\`, so filter on them via a subquery or CTE.

## CTEs
\`\`\`sql
WITH recent AS (
  SELECT * FROM orders WHERE created_at > now() - interval '7 days'
), totals AS (
  SELECT customer_id, sum(amount) AS total FROM recent GROUP BY customer_id
)
SELECT * FROM totals WHERE total > 100;

WITH RECURSIVE tree AS (
  SELECT id, parent_id, 1 AS depth FROM node WHERE parent_id IS NULL
  UNION ALL
  SELECT n.id, n.parent_id, t.depth + 1
  FROM node n JOIN tree t ON n.parent_id = t.id
  WHERE t.depth < 100                        -- always guard the depth
)
SELECT * FROM tree;
\`\`\`

## Upsert
\`\`\`sql
-- Postgres
INSERT INTO t (id, v) VALUES (1, 'a')
ON CONFLICT (id) DO UPDATE SET v = EXCLUDED.v;
-- MySQL
INSERT INTO t (id, v) VALUES (1, 'a')
ON DUPLICATE KEY UPDATE v = VALUES(v);
\`\`\`
A \`UNIQUE\` constraint plus upsert beats check-then-insert, which is racy.

## Pagination
\`\`\`sql
-- OFFSET: slows as offset grows, skips/duplicates rows under concurrent writes
SELECT * FROM t ORDER BY id LIMIT 20 OFFSET 10000;
-- KEYSET (cursor): stable and fast
SELECT * FROM t WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 20;
\`\`\`

## Indexes
\`\`\`sql
CREATE INDEX idx ON t (a, b);            -- serves a, (a,b) — NOT b alone
CREATE UNIQUE INDEX ON t (email);
CREATE INDEX ON t (lower(email));        -- expression → makes a function sargable
CREATE INDEX ON t (a) WHERE deleted_at IS NULL;   -- partial (Postgres)
CREATE INDEX ON t (a) INCLUDE (b);       -- covering (Postgres)
CREATE INDEX CONCURRENTLY ...;           -- Postgres: no write lock
\`\`\`
**Non-sargable** (index unusable): \`WHERE date(created_at) = …\`, \`WHERE lower(x) = …\` without an expression index, \`LIKE '%x'\`, and a type mismatch that casts the column.

## Transactions & Isolation
\`\`\`sql
BEGIN; ... COMMIT; / ROLLBACK;
SET TRANSACTION ISOLATION LEVEL READ COMMITTED | REPEATABLE READ | SERIALIZABLE;
SELECT ... FOR UPDATE;             -- exclusive row lock
SELECT ... FOR UPDATE SKIP LOCKED; -- the queue-worker idiom
SELECT ... FOR UPDATE NOWAIT;      -- fail instead of waiting
\`\`\`

| Level | Dirty | Non-repeatable | Phantom | Write skew |
|---|---|---|---|---|
| Read Committed | no | yes | yes | yes |
| Repeatable Read | no | no | PG: no / MySQL: no | **yes** |
| Serializable | no | no | no | no |

Postgres defaults to **Read Committed**, MySQL to **Repeatable Read**.

## EXPLAIN
\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;   -- Postgres
EXPLAIN ANALYZE SELECT ...;              -- MySQL 8.0.18+
\`\`\`
First thing to check: **estimated rows vs actual rows**. A big divergence explains most bad plans → run \`ANALYZE\`. Watch for \`Seq Scan\`/\`ALL\` on a big table with a selective filter, \`Using filesort\`/external \`Sort\`, and Nested Loops over many rows.

## Set Operations
\`\`\`sql
SELECT a FROM t1 UNION     SELECT a FROM t2;   -- de-duplicates (sorts!)
SELECT a FROM t1 UNION ALL SELECT a FROM t2;   -- keeps duplicates, faster
SELECT a FROM t1 INTERSECT SELECT a FROM t2;
SELECT a FROM t1 EXCEPT    SELECT a FROM t2;   -- MINUS in Oracle
\`\`\`

## Gotchas
- \`WHERE\` filters rows, \`HAVING\` filters groups.
- A JOIN multiplies rows — aggregate over a one-to-many join and your sums double.
- \`SELECT *\` with a JOIN duplicates columns and breaks index-only scans.
- \`count(col)\` skips NULLs; \`count(*)\` doesn't.
- \`ORDER BY\` without a tiebreaker is non-deterministic across pages.
- \`LIMIT\` without \`ORDER BY\` returns arbitrary rows.
- N+1: one query per row in a loop — batch with \`WHERE id = ANY($1)\` or a join.
- Store timestamps in UTC (\`timestamptz\` in Postgres).
- Deadlocks are normal — acquire locks in a consistent order and retry.
`;export{n as default};
