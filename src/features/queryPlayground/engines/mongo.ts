import type { ResultRow } from '../../../data/queries/types';
import type { QueryRunResult } from './postgres';

/**
 * MongoDB aggregation in the browser, via mingo — a JS implementation of the
 * MongoDB query language (~100 KB). Still dynamically imported to keep it off
 * the route's first paint.
 */

let enginePromise: Promise<typeof import('mingo')> | null = null;

function loadEngine(): Promise<typeof import('mingo')> {
  enginePromise ??= import('mingo');
  return enginePromise;
}

export function isMongoReady(): boolean {
  return enginePromise !== null;
}

/**
 * Parses a pipeline written as JSON, accepting the relaxed form people
 * actually type — unquoted keys, single quotes, trailing commas — because
 * requiring strict JSON would make this a JSON exercise rather than a MongoDB
 * one.
 */
export function parsePipeline(text: string): { pipeline?: ResultRow[]; error?: string } {
  const trimmed = text.trim();
  if (!trimmed) return { error: 'Write an aggregation pipeline — an array of stages.' };

  const attempt = (s: string): unknown => JSON.parse(s);
  let parsed: unknown;
  try {
    parsed = attempt(trimmed);
  } catch {
    try {
      parsed = attempt(
        trimmed
          .replace(/'/g, '"')
          .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
          .replace(/,(\s*[}\]])/g, '$1'),
      );
    } catch (err) {
      return { error: `Could not parse the pipeline as JSON: ${err instanceof Error ? err.message : String(err)}` };
    }
  }
  if (!Array.isArray(parsed)) {
    return { error: 'A pipeline must be an array of stages, e.g. [ { "$match": … } ].' };
  }
  return { pipeline: parsed as ResultRow[] };
}

export async function runMongo(
  collections: Record<string, ResultRow[]>,
  collection: string,
  pipelineText: string,
): Promise<QueryRunResult> {
  const started = performance.now();
  const { pipeline, error } = parsePipeline(pipelineText);
  if (error || !pipeline) {
    return { rows: [], columns: [], error, elapsedMs: performance.now() - started };
  }

  try {
    const mingo = await loadEngine();
    const docs = collections[collection] ?? [];
    // Stages that name another collection by string — `$lookup`, `$graphLookup`,
    // `$out`, `$merge` — resolve through mingo's collectionResolver. Doing it
    // here rather than rewriting each stage means every such operator works;
    // an ad-hoc `$lookup.from` substitution missed `$graphLookup` entirely.
    const rows = new mingo.Aggregator(pipeline, {
      collectionResolver: (name: string) => collections[name] ?? [],
    }).run(docs);
    const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))];
    return { rows, columns, elapsedMs: performance.now() - started };
  } catch (err) {
    return {
      rows: [],
      columns: [],
      error: err instanceof Error ? err.message.split('\n')[0] : String(err),
      elapsedMs: performance.now() - started,
    };
  }
}
