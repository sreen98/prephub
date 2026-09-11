import type { ResultRow } from '../../data/queries/types';

export interface CheckResult {
  correct: boolean;
  /** Human-readable reason, written to be actionable rather than just "wrong". */
  reason: string;
  /** Set when the shape is right but values differ, so the UI can diff them. */
  detail?: { expectedRow?: ResultRow; actualRow?: ResultRow; index?: number };
}

/**
 * Normalises a single cell before comparison.
 *
 * This exists because the engines disagree about representation in ways that
 * have nothing to do with whether the answer is right:
 *   - PGlite returns `numeric`/`bigint` columns as STRINGS ("150000"), while a
 *     hand-written expected value is a number.
 *   - `count(*)` comes back as a string in Postgres but a number in mingo.
 *   - Dates arrive as Date objects from one and ISO strings from the other.
 * Marking a correct query wrong over "150000" vs 150000 would make the whole
 * feature untrustworthy, so normalise rather than compare raw.
 */
export function normaliseCell(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'number') return Number.isInteger(value) ? value : Number(value.toFixed(6));
  if (typeof value === 'string') {
    const trimmed = value.trim();
    // A numeric-looking string from Postgres compares equal to the number.
    if (trimmed !== '' && !Number.isNaN(Number(trimmed))) {
      const n = Number(trimmed);
      return Number.isInteger(n) ? n : Number(n.toFixed(6));
    }
    // Postgres DATE columns serialise as ISO timestamps; keep just the day.
    const isoDay = /^(\d{4}-\d{2}-\d{2})T00:00:00/.exec(trimmed);
    if (isoDay) return isoDay[1];
    return trimmed;
  }
  if (Array.isArray(value)) return value.map(normaliseCell);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value).sort()) {
      out[k] = normaliseCell((value as Record<string, unknown>)[k]);
    }
    return out;
  }
  return value;
}

/** A row reduced to a comparable, key-order-independent form. */
function normaliseRow(row: ResultRow): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(row).sort()) out[key] = normaliseCell(row[key]);
  return out;
}

const stable = (row: ResultRow) => JSON.stringify(normaliseRow(row));

/**
 * Compares a user's result set against the expected one.
 *
 * Column ORDER never matters — `SELECT name, dept` and `SELECT dept, name`
 * are the same answer. Row order matters only when the question says so
 * (`orderMatters`), so a correct un-ordered query is not failed for returning
 * rows in a different sequence than the reference solution happened to.
 */
export function checkAnswer(
  actual: ResultRow[],
  expected: ResultRow[],
  orderMatters: boolean,
): CheckResult {
  if (actual.length !== expected.length) {
    return {
      correct: false,
      reason: `Expected ${expected.length} row${expected.length === 1 ? '' : 's'}, got ${actual.length}.`
        + (actual.length > expected.length
          ? ' Check your filter — something is letting extra rows through.'
          : ' Check your filter or JOIN — rows are being excluded.'),
    };
  }

  if (expected.length === 0) return { correct: true, reason: 'Correct — both result sets are empty.' };

  const expectedCols = Object.keys(expected[0]).sort();
  const actualCols = Object.keys(actual[0]).sort();
  if (expectedCols.join('|') !== actualCols.join('|')) {
    const missing = expectedCols.filter((c) => !actualCols.includes(c));
    const extra = actualCols.filter((c) => !expectedCols.includes(c));
    const parts: string[] = [];
    if (missing.length) parts.push(`missing ${missing.map((c) => `\`${c}\``).join(', ')}`);
    if (extra.length) parts.push(`unexpected ${extra.map((c) => `\`${c}\``).join(', ')}`);
    return {
      correct: false,
      reason: `Column mismatch: ${parts.join('; ')}. Aliases matter — name the columns exactly as asked.`,
    };
  }

  if (orderMatters) {
    for (let i = 0; i < expected.length; i++) {
      if (stable(actual[i]) !== stable(expected[i])) {
        return {
          correct: false,
          reason: `Row ${i + 1} differs. This question depends on ordering, so check your ORDER BY.`,
          detail: { expectedRow: expected[i], actualRow: actual[i], index: i },
        };
      }
    }
    return { correct: true, reason: 'Correct — rows match, in the required order.' };
  }

  // Order-insensitive: compare as multisets so duplicates still have to match.
  const counts = new Map<string, number>();
  for (const row of expected) counts.set(stable(row), (counts.get(stable(row)) ?? 0) + 1);
  for (const [i, row] of actual.entries()) {
    const key = stable(row);
    const n = counts.get(key) ?? 0;
    if (n === 0) {
      return {
        correct: false,
        reason: 'The columns are right but at least one row\'s values are wrong.',
        detail: { actualRow: row, index: i },
      };
    }
    counts.set(key, n - 1);
  }
  return { correct: true, reason: 'Correct — all rows match.' };
}
