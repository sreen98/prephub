// Answers "why PostgreSQL and not MySQL?" — a fair question, since MySQL is at
// least as common in interviews. The short version is that PGlite is the only
// production-ready SQL engine that compiles to WebAssembly, and with no backend
// there is nothing else to run a query against. Pure prose, extracted from
// QueryPlayground because it pushed that component past the complexity limit.

export default function DialectNote() {
  return (
      <div className="mt-3 px-3 py-2.5 rounded-xl bg-sky-950/25 border border-sky-900/50 text-[13px] text-slate-300 max-w-3xl">
        <p className="mb-2">
          <strong className="text-sky-300">Because it is the one that runs in a browser.</strong>{' '}
          This page executes a real PostgreSQL build compiled to WebAssembly. There is no
          equivalent production-ready MySQL build, and the app has no backend to send
          queries to — so PostgreSQL is what makes checking your answer possible at all.
        </p>
        <p className="mb-2">
          <strong>For interview SQL the two are now largely the same.</strong> MySQL 8.0
          added window functions and CTEs, which were the big gaps. Joins, <code>GROUP BY</code>,{' '}
          <code>HAVING</code>, subqueries, <code>RANK</code>/<code>DENSE_RANK</code>/<code>ROW_NUMBER</code>,{' '}
          <code>WITH RECURSIVE</code> and the <code>NOT IN</code>-with-NULL trap all behave identically.
        </p>
        <p className="mb-1">Where they diverge, each question says so under its explanation. The differences worth carrying into an interview:</p>
        <ul className="list-disc pl-5 space-y-0.5 text-slate-400">
          <li><code>DISTINCT ON</code> and <code>FILTER (WHERE …)</code> are PostgreSQL-only — use <code>ROW_NUMBER()</code> and <code>SUM(CASE WHEN …)</code> for portable answers.</li>
          <li>String concat is <code>||</code> in Postgres, <code>CONCAT()</code> in MySQL — where <code>||</code> means OR.</li>
          <li><code>STRING_AGG</code> vs <code>GROUP_CONCAT</code>, and MySQL silently truncates at 1024 bytes.</li>
          <li>Dates: <code>to_char</code>/<code>date_trunc</code> vs <code>DATE_FORMAT</code>; date subtraction vs <code>DATEDIFF</code>.</li>
          <li>Upsert is <code>ON CONFLICT</code> vs <code>ON DUPLICATE KEY UPDATE</code>; <code>RETURNING</code> is Postgres-only.</li>
        </ul>
      </div>
  );
}
