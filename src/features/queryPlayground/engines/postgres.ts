import type { ResultRow } from '../../../data/queries/types';

/**
 * PostgreSQL in the browser, via PGlite (Postgres compiled to WebAssembly).
 *
 * It is ~5 MB gzipped, so it is imported dynamically and only when someone
 * actually opens a Postgres question. That size buys real Postgres semantics:
 * window functions, `DISTINCT ON`, `FILTER`, `ILIKE`, recursive CTEs and
 * arrays all behave exactly as they would on a server. A SQLite build would be
 * 17x smaller but would quietly fail on half of those, which for an
 * interview-prep tool is worse than being large.
 */

// PGlite ships its own types — use them rather than a local guess, so a
// signature change surfaces at build time instead of at runtime.
type PGliteModule = typeof import('@electric-sql/pglite');
type PGliteClass = PGliteModule['PGlite'];
type PGliteInstance = InstanceType<PGliteClass>;

let enginePromise: Promise<PGliteClass> | null = null;

function loadEngine(): Promise<PGliteClass> {
  enginePromise ??= import('@electric-sql/pglite').then((m) => m.PGlite);
  return enginePromise;
}

/** True once the engine is in memory, so the UI can skip the download notice. */
export function isPostgresReady(): boolean {
  return enginePromise !== null;
}

// One database per dataset, reused across questions and runs.
const databases = new Map<string, Promise<PGliteInstance>>();

function getDatabase(datasetId: string, setup: string): Promise<PGliteInstance> {
  let db = databases.get(datasetId);
  if (!db) {
    db = loadEngine().then(async (PGlite) => {
      const instance = new PGlite();
      await instance.exec(setup);
      return instance;
    });
    databases.set(datasetId, db);
  }
  return db;
}

export interface QueryRunResult {
  rows: ResultRow[];
  /** Column order as the engine returned it, for table headers. */
  columns: string[];
  error?: string;
  elapsedMs: number;
}

/**
 * Runs one statement and returns its rows. The database is shared across runs
 * for speed; `resetDataset` exists for when someone experiments with an UPDATE.
 */
export async function runPostgres(
  datasetId: string,
  setup: string,
  sql: string,
): Promise<QueryRunResult> {
  const started = performance.now();
  try {
    const db = await getDatabase(datasetId, setup);
    // PGlite's query() is generic over the row shape.
    const result = await db.query<ResultRow>(sql);
    const rows = result.rows ?? [];
    const columns = result.fields?.map((f) => f.name)
      ?? (rows.length > 0 ? Object.keys(rows[0]) : []);
    return { rows, columns, elapsedMs: performance.now() - started };
  } catch (err) {
    return {
      rows: [],
      columns: [],
      // Postgres errors are multi-line with position markers; the first line
      // is the useful part ("column \"nope\" does not exist").
      error: err instanceof Error ? err.message.split('\n')[0] : String(err),
      elapsedMs: performance.now() - started,
    };
  }
}

/** Throws away a dataset's database so the next run re-seeds it. */
export async function resetDataset(datasetId: string): Promise<void> {
  const existing = databases.get(datasetId);
  databases.delete(datasetId);
  if (existing) {
    try { await (await existing).close(); } catch { /* already gone */ }
  }
}
