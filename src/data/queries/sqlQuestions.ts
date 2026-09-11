import type { QueryQuestion } from './types';

/**
 * PostgreSQL interview questions.
 *
 * Chosen for what actually gets asked: the second-highest-salary trick, LEFT
 * JOIN vs INNER for "has never ordered", GROUP BY with HAVING, window
 * functions for per-group ranking, self-joins for org charts, and the
 * `WHERE`-on-a-LEFT-JOIN trap. Each explanation names the mistake the question
 * is designed to catch, not just the syntax.
 */
export const SQL_QUESTIONS: QueryQuestion[] = [
  {
    id: 'sql-select-filter',
    engine: 'postgres',
    title: 'Filter and sort',
    prompt: 'List the `name` and `salary` of every employee earning more than 100000, highest paid first.',
    datasetId: 'hr',
    difficulty: 'Easy',
    topics: ['SELECT', 'WHERE', 'ORDER BY'],
    orderMatters: true,
    starter: 'SELECT name, salary\nFROM employees\n',
    solution: `SELECT name, salary
FROM employees
WHERE salary > 100000
ORDER BY salary DESC;`,
    explanation: `The warm-up. Two things worth noticing even here.

**\`WHERE\` filters rows before grouping or ordering.** The logical order of evaluation is \`FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY\`, which is why you cannot reference a \`SELECT\` alias in \`WHERE\` — the alias does not exist yet.

**\`ORDER BY\` is the only thing that guarantees order.** Without it a database may return rows in any sequence, and the sequence can change as the data or the plan changes. Never rely on "it came back sorted" from a query with no \`ORDER BY\`.`,
    followUp: 'What would change if `salary` could be NULL? (`NULL > 100000` is NULL, not true — those rows would be excluded.)',
    mysqlNote: 'Identical.',
  },
  {
    id: 'sql-count-by-group',
    engine: 'postgres',
    title: 'Count per group',
    prompt: 'For each department, return the department `name` and the number of employees as `headcount`. Include departments with no employees. Order by `name`.',
    datasetId: 'hr',
    difficulty: 'Medium',
    topics: ['LEFT JOIN', 'GROUP BY', 'COUNT'],
    orderMatters: true,
    solution: `SELECT d.name, COUNT(e.id) AS headcount
FROM departments d
LEFT JOIN employees e ON e.dept_id = d.id
GROUP BY d.name
ORDER BY d.name;`,
    explanation: `Two traps in one question, and both are extremely common.

**\`COUNT(*)\` would be wrong here.** With a \`LEFT JOIN\`, a department with no employees still produces one row — with NULLs on the employee side. \`COUNT(*)\` counts that row and reports **1**. \`COUNT(e.id)\` counts non-NULL values only, so it correctly reports **0**. This is the single most common mistake on this question.

**The join must be \`LEFT\`, and \`departments\` must be on the left.** An \`INNER JOIN\` silently drops Legal, which has no employees — and "include the empty ones" is exactly what the question is testing.`,
    followUp: 'How would you also include employees with no department? (A `FULL OUTER JOIN`, or a second query — Margaret Hamilton has `dept_id` NULL.)',
    mysqlNote: 'Identical — the `COUNT(e.id)` vs `COUNT(*)` distinction is standard SQL.',
  },
  {
    id: 'sql-having',
    engine: 'postgres',
    title: 'HAVING vs WHERE',
    prompt: 'Return `dept_id` and the average salary as `avg_salary` for departments whose average salary is above 120000.',
    datasetId: 'hr',
    difficulty: 'Medium',
    topics: ['GROUP BY', 'HAVING', 'AVG'],
    orderMatters: false,
    solution: `SELECT dept_id, AVG(salary) AS avg_salary
FROM employees
GROUP BY dept_id
HAVING AVG(salary) > 120000;`,
    explanation: `**\`WHERE\` filters rows; \`HAVING\` filters groups.** You cannot write \`WHERE AVG(salary) > 120000\` — at the time \`WHERE\` runs, no grouping has happened and the aggregate does not exist. That error is the point of the question.

The distinction matters for performance too: \`WHERE\` reduces rows *before* the aggregation does its work, so a filter that can go in \`WHERE\` should never be put in \`HAVING\`. Use \`HAVING\` only for conditions on aggregates.

Note the NULL \`dept_id\` group: Margaret Hamilton has no department, and \`GROUP BY\` puts all NULLs into a single group rather than discarding them.`,
    mysqlNote: 'Identical syntax, but MySQL has a history here: before 8.0 it let you `SELECT` non-aggregated columns that were not in the `GROUP BY`, returning an arbitrary row\'s value. `ONLY_FULL_GROUP_BY` is on by default since 5.7.5 and makes MySQL behave like Postgres — if you meet a legacy database with it disabled, treat any such query as a bug.',
  },
  {
    id: 'sql-second-highest',
    engine: 'postgres',
    title: 'Second-highest salary',
    prompt: 'Return the second-highest **distinct** salary from `employees`, in a column named `second_highest`.',
    datasetId: 'hr',
    difficulty: 'Medium',
    topics: ['DISTINCT', 'OFFSET', 'subquery'],
    orderMatters: false,
    solution: `SELECT DISTINCT salary AS second_highest
FROM employees
ORDER BY second_highest DESC
OFFSET 1 LIMIT 1;`,
    explanation: `A classic, and the word **distinct** is why.

Two employees earn 210000, the top salary. \`ORDER BY salary DESC OFFSET 1 LIMIT 1\` without \`DISTINCT\` returns the *second row*, which is the other 210000 — so the answer comes back as the highest salary again. Deduplicating first is what makes it correct.

**Other ways to write it, and their trade-offs:**

\`\`\`sql
-- Correlated subquery — works, reads clearly, O(n²) in the worst case
SELECT MAX(salary) FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- Window function — generalises to Nth, and to per-group
SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS r
  FROM employees
) t WHERE r = 2;
\`\`\`

**\`DENSE_RANK\`, not \`RANK\`.** With a tie at the top, \`RANK\` skips 2 entirely and returns nothing, while \`DENSE_RANK\` gives the true second-highest. Knowing that difference is usually what the interviewer is after.`,
    followUp: 'What should the query return when there is no second salary? (`NULL` from the subquery form; no rows from the LIMIT/OFFSET form — a real difference worth stating.)',
    mysqlNote: 'Identical. MySQL also accepts the older `LIMIT 1, 1` comma form, which means `LIMIT offset, count` — the reverse order of everything else, and a classic source of off-by-one bugs.',
  },
  {
    id: 'sql-top-per-group',
    engine: 'postgres',
    title: 'Highest paid per department',
    prompt: 'For each department, return `dept_id`, the employee `name` and their `salary` for the highest-paid employee in that department. Break ties by the lower `id`. Order by `dept_id`.',
    datasetId: 'hr',
    difficulty: 'Hard',
    topics: ['window functions', 'DISTINCT ON', 'ROW_NUMBER'],
    orderMatters: true,
    solution: `SELECT DISTINCT ON (dept_id) dept_id, name, salary
FROM employees
WHERE dept_id IS NOT NULL
ORDER BY dept_id, salary DESC, id;`,
    explanation: `**Top-N-per-group** — probably the most-asked "hard" SQL question.

\`DISTINCT ON\` is Postgres-specific and the most direct answer: it keeps the first row per \`dept_id\` according to the \`ORDER BY\`, so the ordering clause *is* the tie-break rule. The leading \`ORDER BY\` column must match the \`DISTINCT ON\` column, which trips people up.

**The portable version uses a window function:**

\`\`\`sql
SELECT dept_id, name, salary FROM (
  SELECT dept_id, name, salary,
         ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC, id) AS rn
  FROM employees WHERE dept_id IS NOT NULL
) t WHERE rn = 1 ORDER BY dept_id;
\`\`\`

**Why \`ROW_NUMBER\` and not \`RANK\`:** with two people tied on salary, \`RANK\` gives both rank 1 and you get two rows per department. \`ROW_NUMBER\` always produces exactly one. Choosing between them *is* the question — "what if there's a tie?" is the follow-up you should answer before being asked.

The \`WHERE dept_id IS NOT NULL\` is not incidental either: without it the NULL department forms its own group.`,
    mysqlNote: '**This is the biggest dialect gap in the set.** `DISTINCT ON` is PostgreSQL-only — MySQL has no equivalent. Use the `ROW_NUMBER()` version shown above, which works on both (MySQL 8.0+).',
  },
  {
    id: 'sql-never-ordered',
    engine: 'postgres',
    title: 'Customers who never ordered',
    prompt: 'Return the `name` of every customer who has never placed an order.',
    datasetId: 'shop',
    difficulty: 'Medium',
    topics: ['LEFT JOIN', 'NOT EXISTS', 'NULL'],
    orderMatters: false,
    solution: `SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;`,
    explanation: `The **anti-join**. Three ways to write it, and the differences matter.

\`\`\`sql
-- 1. LEFT JOIN … IS NULL  (above) — the classic
-- 2. NOT EXISTS — usually the best plan, and NULL-safe
SELECT name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- 3. NOT IN — DANGEROUS
SELECT name FROM customers
WHERE id NOT IN (SELECT customer_id FROM orders);
\`\`\`

**\`NOT IN\` is the trap.** If the subquery returns even one NULL, \`NOT IN\` evaluates to NULL for every row and the query returns **nothing at all** — silently. That is three-valued logic: \`id NOT IN (1, NULL)\` is \`id <> 1 AND id <> NULL\`, and \`x <> NULL\` is unknown, never true. \`NOT EXISTS\` has no such problem.

For the \`LEFT JOIN\` form, the \`IS NULL\` check must be on a column that is **never NULL in a matched row** — a primary key. Testing a nullable column would wrongly include matched rows.`,
    followUp: 'Which of the three would you write in production? (`NOT EXISTS` — correct with NULLs and usually planned as an anti-join.)',
    mysqlNote: 'Identical, including the `NOT IN` + NULL trap — that is three-valued logic from the SQL standard, not a Postgres quirk.',
  },
  {
    id: 'sql-left-join-where-trap',
    engine: 'postgres',
    title: 'The LEFT JOIN / WHERE trap',
    prompt: 'Return every customer `name` together with the number of their **shipped** orders as `shipped_orders` — including customers with none. Order by `name`.',
    datasetId: 'shop',
    difficulty: 'Hard',
    topics: ['LEFT JOIN', 'ON vs WHERE', 'conditional aggregate'],
    orderMatters: true,
    solution: `SELECT c.name, COUNT(o.id) AS shipped_orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'
GROUP BY c.name
ORDER BY c.name;`,
    explanation: `**The condition has to go in \`ON\`, not \`WHERE\`.** This is one of the highest-value SQL facts there is.

\`\`\`sql
-- WRONG — silently turns the LEFT JOIN into an INNER JOIN
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'shipped'
\`\`\`

A \`LEFT JOIN\` produces a row with NULLs for unmatched customers. The \`WHERE\` then tests \`NULL = 'shipped'\`, which is unknown, so those rows are filtered out — and Radia, who has no orders at all, disappears. You asked for "including customers with none" and got the opposite.

**The rule:** a condition on the *right* table of a LEFT JOIN belongs in \`ON\`. A condition on the *left* table belongs in \`WHERE\`. Putting a right-table condition in \`WHERE\` cancels the outerness.

**The alternative** is a conditional aggregate, which some find clearer:

\`\`\`sql
SELECT c.name, COUNT(*) FILTER (WHERE o.status = 'shipped') AS shipped_orders
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.name ORDER BY c.name;
\`\`\`

\`FILTER\` is standard SQL and supported by Postgres; elsewhere you would write \`SUM(CASE WHEN … THEN 1 ELSE 0 END)\`.`,
    mysqlNote: 'The `ON`-vs-`WHERE` rule is standard SQL and behaves identically on MySQL. Only the `FILTER` alternative is Postgres-only; use `SUM(CASE WHEN … THEN 1 ELSE 0 END)` on MySQL.',
  },
  {
    id: 'sql-order-totals',
    engine: 'postgres',
    title: 'Revenue per customer',
    prompt: 'Return customer `name` and total revenue as `revenue` from **shipped** orders only, highest first. Exclude customers with no shipped revenue.',
    datasetId: 'shop',
    difficulty: 'Medium',
    topics: ['JOIN', 'SUM', 'GROUP BY'],
    orderMatters: true,
    solution: `SELECT c.name, SUM(oi.qty * oi.unit_price) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'
JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.name
ORDER BY revenue DESC;`,
    explanation: `A three-table join with an aggregate over a computed expression.

**Row multiplication is the thing to understand.** Joining \`orders\` to \`order_items\` multiplies each order row by its number of items. That is correct here — you *want* one row per item so the sum is right — but it becomes a bug the moment you also aggregate something from \`orders\` in the same query. \`SUM(o.shipping_cost)\` alongside this join would count the shipping once per item.

**When you need both, aggregate separately** and join the results:

\`\`\`sql
SELECT c.name, i.revenue, o.shipping
FROM customers c
JOIN (SELECT order_id, SUM(qty * unit_price) revenue FROM order_items GROUP BY order_id) i ON …
\`\`\`

Here an \`INNER JOIN\` is right: the prompt says exclude customers with no shipped revenue, so dropping unmatched rows is the requirement rather than an accident.`,
    mysqlNote: 'Identical.',
  },
  {
    id: 'sql-running-total',
    engine: 'postgres',
    title: 'Running total',
    prompt: 'For customer_id 1, list each order `id`, its `placed_at` date, and a running total of order count as `orders_so_far`, ordered by date.',
    datasetId: 'shop',
    difficulty: 'Hard',
    topics: ['window functions', 'frame clause'],
    orderMatters: true,
    solution: `SELECT id, placed_at,
       COUNT(*) OVER (ORDER BY placed_at, id) AS orders_so_far
FROM orders
WHERE customer_id = 1
ORDER BY placed_at, id;`,
    explanation: `A window function with an implicit frame.

**\`OVER (ORDER BY …)\` without a frame clause defaults to \`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\`** — which is exactly a running total. Writing it explicitly is optional but worth knowing.

**The subtlety is \`RANGE\` vs \`ROWS\`.** The default is \`RANGE\`, which includes **all peer rows with the same ORDER BY value**. If two orders shared a date, a \`RANGE\` frame would count both at each of them, so the running total would jump by 2 and repeat. \`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\` counts strictly row by row. When ties are possible and you want a strict sequence, say \`ROWS\`.

Adding \`id\` to the \`ORDER BY\` makes the order deterministic, which matters as soon as two rows share a date.`,
    followUp: 'How would you make it a running total per customer, all in one query? (Add `PARTITION BY customer_id` to the OVER clause.)',
    mysqlNote: 'Identical on MySQL 8.0+, frame clause included. On 5.7 there are no window functions at all and this needs a self-join or user variables.',
  },
  {
    id: 'sql-self-join',
    engine: 'postgres',
    title: 'Employees and their managers',
    prompt: 'Return each employee\'s `name` as `employee` and their manager\'s `name` as `manager`. Include employees with no manager (manager should be NULL). Order by `employee`.',
    datasetId: 'hr',
    difficulty: 'Medium',
    topics: ['self join', 'LEFT JOIN'],
    orderMatters: true,
    solution: `SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id
ORDER BY employee;`,
    explanation: `A **self-join**: the same table on both sides, distinguished only by the aliases.

The aliases are not cosmetic — without \`e\` and \`m\` the query is ambiguous and will not run. Think of \`m\` as a second, independent copy of the table.

**\`LEFT JOIN\`, not \`INNER\`.** Barbara Liskov has \`manager_id\` NULL. An inner join drops the CEO, which is the classic wrong answer.

The join direction reads backwards to some people: you match \`m.id = e.manager_id\`, i.e. "find the row whose id equals my manager_id". Saying that sentence aloud usually settles it.`,
    followUp: 'How would you list the whole reporting chain to the top? (A `WITH RECURSIVE` CTE — the natural follow-up.)',
    mysqlNote: 'Identical.',
  },
  {
    id: 'sql-recursive-cte',
    engine: 'postgres',
    title: 'Reporting chain (recursive CTE)',
    prompt: 'Starting from Barbara Liskov, return every employee in her reporting tree: `name` and `depth`, where Barbara is depth 0. Order by `depth`, then `name`.',
    datasetId: 'hr',
    difficulty: 'Hard',
    topics: ['WITH RECURSIVE', 'CTE', 'hierarchy'],
    orderMatters: true,
    solution: `WITH RECURSIVE chain AS (
  SELECT id, name, 0 AS depth
  FROM employees
  WHERE name = 'Barbara Liskov'
  UNION ALL
  SELECT e.id, e.name, c.depth + 1
  FROM employees e
  JOIN chain c ON e.manager_id = c.id
)
SELECT name, depth FROM chain ORDER BY depth, name;`,
    explanation: `A recursive CTE has exactly two halves joined by \`UNION ALL\`:

1. **The anchor** — the starting row(s). Here, Barbara at depth 0.
2. **The recursive term** — references the CTE by name and produces the next level. It runs repeatedly against only the rows the *previous* iteration produced, until an iteration returns nothing.

**\`UNION ALL\`, not \`UNION\`.** \`UNION\` deduplicates, which costs a sort on every iteration and can mask a genuine cycle.

**Always consider a depth guard.** Real org data contains cycles (A manages B manages A) often enough that an unbounded recursive query is a production incident waiting to happen:

\`\`\`sql
  ... JOIN chain c ON e.manager_id = c.id
  WHERE c.depth < 10          -- bounds the recursion
\`\`\`

Postgres also has \`CYCLE\` detection built in (\`CYCLE id SET is_cycle USING path\`) if you need the real thing.`,
    mysqlNote: 'MySQL 8.0+ supports `WITH RECURSIVE` with the same syntax. Two differences worth knowing: MySQL enforces `cte_max_recursion_depth` (1000 by default) and errors when exceeded, which is arguably safer than Postgres looping forever; and Postgres has built-in `CYCLE` detection that MySQL lacks.',
  },
  {
    id: 'sql-duplicates',
    engine: 'postgres',
    title: 'Find duplicate values',
    prompt: 'Find every `salary` that more than one employee earns. Return `salary` and the number of employees as `n`.',
    datasetId: 'hr',
    difficulty: 'Easy',
    topics: ['GROUP BY', 'HAVING', 'COUNT'],
    orderMatters: false,
    solution: `SELECT salary, COUNT(*) AS n
FROM employees
GROUP BY salary
HAVING COUNT(*) > 1;`,
    explanation: `The canonical duplicate-detection shape: **group by the thing that should be unique, then \`HAVING COUNT(*) > 1\`**.

It generalises directly. To find duplicate rows across several columns, group by all of them:

\`\`\`sql
SELECT email, dept_id, COUNT(*) FROM employees
GROUP BY email, dept_id HAVING COUNT(*) > 1;
\`\`\`

**To delete duplicates but keep one**, the window-function version is the one to know:

\`\`\`sql
DELETE FROM employees WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY salary ORDER BY id) rn FROM employees
  ) t WHERE rn > 1
);
\`\`\`

And the real answer to "how do we stop duplicates": a \`UNIQUE\` constraint. Detecting them after the fact is treating the symptom.`,
    mysqlNote: 'Identical. The `DELETE` variant differs though: MySQL cannot delete from a table it selects from in a subquery, so you need an extra layer — `DELETE FROM t WHERE id IN (SELECT id FROM (SELECT …) AS tmp)`.',
  },
  {
    id: 'sql-more-than-manager',
    engine: 'postgres',
    title: 'Employees earning more than their manager',
    prompt: 'Return the `name` of every employee whose salary is higher than their manager\'s.',
    datasetId: 'hr',
    difficulty: 'Medium',
    topics: ['self join', 'comparison'],
    orderMatters: false,
    solution: `SELECT e.name
FROM employees e
JOIN employees m ON m.id = e.manager_id
WHERE e.salary > m.salary;`,
    explanation: `A **self-join with a comparison** — one of the most-asked SQL questions there is.

The join brings the manager's row alongside the employee's row, so both salaries are available in the same row and can be compared. Without the join you would need a correlated subquery:

\`\`\`sql
SELECT name FROM employees e
WHERE salary > (SELECT salary FROM employees m WHERE m.id = e.manager_id);
\`\`\`

Both are correct. The join usually plans better, and it reads more clearly once you are used to aliases.

**\`INNER JOIN\` is right here**, and that is the subtlety worth stating: an employee with no manager cannot earn *more than* their manager, so dropping those rows is the requirement rather than an accident. Compare with the "employees and their managers" question, where the CEO must be kept and a \`LEFT JOIN\` is mandatory. Knowing *which* join a question needs, and why, is the actual skill.`,
    mysqlNote: 'Identical on MySQL 8.0 — self-joins and comparisons are standard SQL.',
  },
  {
    id: 'sql-rank-variants',
    engine: 'postgres',
    title: 'RANK vs DENSE_RANK vs ROW_NUMBER',
    prompt: 'For every employee return `name`, `salary`, and three columns — `rnk`, `dense`, `rn` — using RANK, DENSE_RANK and ROW_NUMBER over salary descending. Order by salary descending then id.',
    datasetId: 'hr',
    difficulty: 'Medium',
    topics: ['window functions', 'ranking', 'ties'],
    orderMatters: true,
    solution: `SELECT name, salary,
       RANK()       OVER (ORDER BY salary DESC) AS rnk,
       DENSE_RANK() OVER (ORDER BY salary DESC) AS dense,
       ROW_NUMBER() OVER (ORDER BY salary DESC, id) AS rn
FROM employees
ORDER BY salary DESC, id;`,
    explanation: `The three ranking functions differ **only when there are ties**, and this dataset has two: 210000 and 150000.

| | Behaviour on a tie | Sequence here |
|---|---|---|
| \`ROW_NUMBER\` | Always distinct — arbitrary tie-break unless you add one | 1, 2, 3, 4, … |
| \`RANK\` | Ties share a rank, then it **skips** | 1, 1, 3, 4, … |
| \`DENSE_RANK\` | Ties share a rank, **no gap** | 1, 1, 2, 3, … |

**Choosing between them is what interviewers actually test.**

- "Nth highest **distinct** salary" → \`DENSE_RANK\`. With \`RANK\` and a tie at the top, rank 2 may not exist at all and the query returns nothing.
- "Give me exactly one row per group" (top-N-per-group) → \`ROW_NUMBER\`. \`RANK\` returns two rows when two people tie.
- "Competition-style placing" → \`RANK\`, because that is how sport works: two golds, no silver.

**Always give \`ROW_NUMBER\` a deterministic tie-break** (here \`, id\`). Without one, the same query can return different results on different runs, which is a genuinely painful bug to chase.`,
    mysqlNote: 'Identical on MySQL 8.0+, which added window functions. On MySQL 5.7 none of these exist and you would emulate ranking with user variables — worth knowing if a job mentions a legacy stack.',
  },
  {
    id: 'sql-pivot',
    engine: 'postgres',
    title: 'Pivot rows into columns',
    prompt: 'For each customer `name`, return `shipped`, `pending` and `cancelled` — the number of orders in each status. Include customers with no orders (zeros). Order by `name`.',
    datasetId: 'shop',
    difficulty: 'Medium',
    topics: ['conditional aggregation', 'CASE', 'FILTER', 'pivot'],
    orderMatters: true,
    solution: `SELECT c.name,
       COUNT(*) FILTER (WHERE o.status = 'shipped')   AS shipped,
       COUNT(*) FILTER (WHERE o.status = 'pending')   AS pending,
       COUNT(*) FILTER (WHERE o.status = 'cancelled') AS cancelled
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.name
ORDER BY c.name;`,
    explanation: `**Pivoting** — turning row values into columns — is conditional aggregation, and it comes up constantly in reporting work.

\`FILTER (WHERE …)\` is standard SQL and the clearest way to write it. The portable form is a \`CASE\` inside the aggregate:

\`\`\`sql
SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS shipped
\`\`\`

**Use \`SUM(CASE …)\`, not \`COUNT(CASE …)\`.** \`COUNT\` counts non-NULL values, so \`COUNT(CASE WHEN … THEN 1 ELSE 0 END)\` counts the zeros too and returns the total every time. Either drop the \`ELSE\` (so non-matches are NULL) or use \`SUM\`. This is one of the most common silent bugs in reporting SQL.

The \`LEFT JOIN\` keeps Radia, who has no orders — her three columns are all 0 because \`COUNT\` of nothing is 0.

**The limitation to name:** the columns have to be known when you write the query. A genuinely dynamic pivot needs the column list built in application code, or Postgres's \`crosstab\` from the \`tablefunc\` extension.`,
    mysqlNote: 'MySQL has no `FILTER` clause — use the `SUM(CASE WHEN … THEN 1 ELSE 0 END)` form, which works on both.',
  },
  {
    id: 'sql-group-by-month',
    engine: 'postgres',
    title: 'Group by month',
    prompt: 'Return `month` as text in `YYYY-MM` form and `orders`, the number of orders placed in each month. Order by `month`.',
    datasetId: 'shop',
    difficulty: 'Medium',
    topics: ['dates', 'GROUP BY', 'to_char'],
    orderMatters: true,
    solution: `SELECT to_char(placed_at, 'YYYY-MM') AS month, COUNT(*) AS orders
FROM orders
GROUP BY month
ORDER BY month;`,
    explanation: `Time-bucketing is in almost every analytics question.

**\`to_char(date, 'YYYY-MM')\`** formats the date as a string, and grouping by that string buckets by month. The format is sortable as text, which is why \`YYYY-MM\` is the right choice — \`MM-YYYY\` would sort January 2025 before February 2024.

**\`date_trunc('month', placed_at)\`** is the alternative and is usually better for real work: it returns a \`timestamp\` rather than text, so it keeps type information, sorts correctly by definition, and can use an index on the date column. Use \`to_char\` when you want a label, \`date_trunc\` when you want a value.

**The thing that bites people:** grouping by a raw \`timestamp\` column groups by the *instant*, not the day — every row lands in its own group. And with \`timestamptz\`, "which month" depends on the time zone, so specify it (\`date_trunc('month', placed_at AT TIME ZONE 'UTC')\`) rather than inheriting the server's.`,
    mysqlNote: "MySQL uses `DATE_FORMAT(placed_at, '%Y-%m')` instead of `to_char`, and has no `date_trunc`. The grouping idea is identical.",
  },
  {
    id: 'sql-string-agg',
    engine: 'postgres',
    title: 'Aggregate strings into a list',
    prompt: 'For each department `name`, return `members` — the employees in it as a single comma-separated string, alphabetical within the department. Only departments that have employees. Order by department name.',
    datasetId: 'hr',
    difficulty: 'Medium',
    topics: ['STRING_AGG', 'GROUP BY', 'ordered aggregate'],
    orderMatters: true,
    solution: `SELECT d.name, STRING_AGG(e.name, ', ' ORDER BY e.name) AS members
FROM departments d
JOIN employees e ON e.dept_id = d.id
GROUP BY d.name
ORDER BY d.name;`,
    explanation: `**\`STRING_AGG(expr, delimiter ORDER BY …)\`** collapses a group into one delimited string.

**The \`ORDER BY\` goes *inside* the aggregate call.** That is unusual syntax and the part people forget. Without it the order within each string is whatever the plan produced, so the same query can return \`'Ada, Grace'\` one day and \`'Grace, Ada'\` the next — which breaks tests and diffs in a way that is very annoying to track down.

The same inside-the-parentheses ordering works for \`ARRAY_AGG\`, \`JSON_AGG\` and the other ordered-set aggregates.

**When not to use it:** returning a delimited string to an application that then splits it is usually a mistake — you have invented a fragile serialisation format, and any name containing a comma breaks it. Prefer \`ARRAY_AGG\` (or \`JSON_AGG\`) and let the driver hand you a real array.`,
    mysqlNote: 'MySQL calls it `GROUP_CONCAT(e.name ORDER BY e.name SEPARATOR \', \')`. Note MySQL truncates the result at `group_concat_max_len` (1024 bytes by default) **without raising an error** — a genuine data-loss trap that Postgres does not have.',
  },
  {
    id: 'sql-coalesce',
    engine: 'postgres',
    title: 'Handling NULLs',
    prompt: 'Return every department `name` and its `budget`, substituting 0 where the budget is NULL. Order by `name`.',
    datasetId: 'hr',
    difficulty: 'Easy',
    topics: ['NULL', 'COALESCE'],
    orderMatters: true,
    solution: `SELECT name, COALESCE(budget, 0) AS budget
FROM departments
ORDER BY name;`,
    explanation: `\`COALESCE\` returns its first non-NULL argument. It takes any number of them, so \`COALESCE(a, b, c, 0)\` walks the list.

**Why this matters more than it looks.** NULL is not a value, it is the *absence* of one, and it propagates through arithmetic: \`budget * 2\` is NULL, \`budget + 100\` is NULL, and \`WHERE budget <> 500\` excludes NULL rows rather than including them. Any calculation touching a nullable column needs a decision about NULL, and \`COALESCE\` is how you make it explicit.

**The related functions worth knowing:**
- \`NULLIF(a, b)\` — returns NULL when \`a = b\`. The classic use is \`x / NULLIF(y, 0)\` to turn a division-by-zero error into NULL.
- \`IS DISTINCT FROM\` — NULL-safe inequality. \`a <> b\` is NULL when either side is; \`a IS DISTINCT FROM b\` is a real true/false.

**And the aggregate behaviour:** \`COUNT(budget)\` skips NULLs while \`COUNT(*)\` does not, and \`AVG(budget)\` divides by the number of *non-NULL* rows — so an average silently ignores missing data rather than treating it as zero. Whether that is right is a product question, not a SQL one.`,
    mysqlNote: 'Identical. MySQL also has `IFNULL(a, b)` for the two-argument case, but `COALESCE` is standard and works on both.',
  },
  {
    id: 'sql-lead-lag',
    engine: 'postgres',
    title: 'Compare a row to the previous one',
    prompt: 'For customer_id 1, list each order `id`, `placed_at`, and `days_since_previous` — the number of days since their previous order (NULL for the first). Order by `placed_at`.',
    datasetId: 'shop',
    difficulty: 'Hard',
    topics: ['window functions', 'LAG', 'dates'],
    orderMatters: true,
    solution: `SELECT id, placed_at,
       placed_at - LAG(placed_at) OVER (ORDER BY placed_at) AS days_since_previous
FROM orders
WHERE customer_id = 1
ORDER BY placed_at;`,
    explanation: `**\`LAG\` reaches backwards, \`LEAD\` reaches forwards** — they give a row access to its neighbours without a self-join.

Before window functions this required joining the table to itself on "the row with the next-smallest date", which is both slow and fiddly. \`LAG(col) OVER (ORDER BY …)\` is one clause.

**The signature is \`LAG(expr, offset, default)\`.** The offset defaults to 1, and the default value defaults to NULL — which is why the first row here is NULL. Pass a third argument when you want something else: \`LAG(placed_at, 1, placed_at)\` would make the first gap zero.

**Subtracting two \`date\` values in Postgres yields an integer number of days.** Subtracting two \`timestamp\` values yields an \`interval\` instead, which is a different type and formats differently — a common surprise when a column type changes.

**Where this is used in practice:** month-over-month change, detecting gaps in a sequence, finding rows where a status flipped, and session-ising events by looking for a gap larger than N minutes. Add \`PARTITION BY customer_id\` to do it for every customer at once rather than filtering to one.`,
    followUp: 'How would you find every customer whose orders ever had a gap of more than 60 days? (`PARTITION BY customer_id`, then filter the result in an outer query — you cannot filter on a window function in `WHERE`.)',
    mysqlNote: 'Identical on MySQL 8.0+. Date subtraction differs though: MySQL needs `DATEDIFF(placed_at, LAG(placed_at) OVER (...))` rather than the `-` operator.',
  },
  {
    id: 'sql-union',
    engine: 'postgres',
    title: 'UNION vs UNION ALL',
    prompt: 'Return a single `country` column listing every country that appears in `customers`, with no duplicates. Order by `country`.',
    datasetId: 'shop',
    difficulty: 'Easy',
    topics: ['UNION', 'DISTINCT', 'set operations'],
    orderMatters: true,
    solution: `SELECT DISTINCT country FROM customers ORDER BY country;`,
    explanation: `The answer here is \`DISTINCT\`, but the question is really about knowing when a set operation is the right tool.

**\`UNION\` removes duplicates; \`UNION ALL\` does not.** That difference is not free: deduplication requires a sort or a hash of the whole result, so on large sets \`UNION\` is dramatically slower.

**The rule: default to \`UNION ALL\`,** and use \`UNION\` only when you actually need deduplication. A great many queries written with \`UNION\` combine sets that cannot overlap — say this year's orders and last year's — and pay for a deduplication that removes nothing.

\`\`\`sql
-- Combining genuinely disjoint sets: UNION ALL is both faster and clearer
SELECT id, 'archived' AS src FROM archived_orders
UNION ALL
SELECT id, 'live'     AS src FROM orders;
\`\`\`

**The rules for any set operation:** both sides need the same number of columns with compatible types, the column names come from the *first* branch, and a single \`ORDER BY\` at the very end applies to the combined result — you cannot order the branches individually without wrapping them in subqueries.

\`INTERSECT\` and \`EXCEPT\` complete the family, and both deduplicate by default too.`,
    mysqlNote: 'MySQL 8.0 supports `UNION`/`UNION ALL` identically. `INTERSECT` and `EXCEPT` arrived only in MySQL 8.0.31 — on anything older you emulate them with joins or `NOT EXISTS`.',
  },
];
