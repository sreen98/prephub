/**
 * Side-by-side line diff for "Compare with reference": the reader's code on
 * the left, the reference on the right, aligned so the lines that match sit on
 * the same row. A plain LCS over lines: the inputs are a few hundred lines at
 * most, so O(n·m) is instant and the result is the minimal edit.
 *
 * Whitespace-only differences are treated as equal (indentation and trailing
 * spaces are not what a reader wants to compare), but each side shows its own text.
 */
export type DiffRow =
  | { kind: 'same'; left: string; right: string; leftNo: number; rightNo: number }
  | { kind: 'removed'; left: string; leftNo: number }
  | { kind: 'added'; right: string; rightNo: number };

const key = (line: string): string => line.trim().replace(/\s+/g, ' ');

export function diffLines(leftText: string, rightText: string): DiffRow[] {
  const a = leftText.split('\n');
  const b = rightText.split('\n');
  const ka = a.map(key), kb = b.map(key);
  const n = a.length, m = b.length;
  // lcs[i][j] = length of the LCS of a[i..] and b[j..]
  const lcs: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = ka[i] === kb[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const rows: DiffRow[] = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && ka[i] === kb[j]) { rows.push({ kind: 'same', left: a[i], right: b[j], leftNo: i + 1, rightNo: j + 1 }); i++; j++; }
    else if (j < m && (i === n || lcs[i][j + 1] >= lcs[i + 1][j])) { rows.push({ kind: 'added', right: b[j], rightNo: j + 1 }); j++; }
    else { rows.push({ kind: 'removed', left: a[i], leftNo: i + 1 }); i++; }
  }
  return rows;
}

/** Counts for the modal header: how much of the reference the reader's code shares. */
export function diffStats(rows: DiffRow[]): { same: number; removed: number; added: number } {
  return {
    same: rows.filter((r) => r.kind === 'same' && r.left.trim() !== '').length,
    removed: rows.filter((r) => r.kind === 'removed').length,
    added: rows.filter((r) => r.kind === 'added').length,
  };
}

/**
 * Pair adjacent removed/added runs into one row each, so a changed line shows
 * as left-vs-right on one row instead of two half-empty rows.
 */
export type PairedRow = { left?: { text: string; no: number; changed: boolean }; right?: { text: string; no: number; changed: boolean } };

export function pairRows(rows: DiffRow[]): PairedRow[] {
  const out: PairedRow[] = [];
  let k = 0;
  while (k < rows.length) {
    const r = rows[k];
    if (r.kind === 'same') { out.push({ left: { text: r.left, no: r.leftNo, changed: false }, right: { text: r.right, no: r.rightNo, changed: false } }); k++; continue; }
    const removed: Extract<DiffRow, { kind: 'removed' }>[] = [];
    const added: Extract<DiffRow, { kind: 'added' }>[] = [];
    while (k < rows.length && rows[k].kind !== 'same') {
      const x = rows[k];
      if (x.kind === 'removed') removed.push(x); else if (x.kind === 'added') added.push(x);
      k++;
    }
    for (let p = 0; p < Math.max(removed.length, added.length); p++) {
      out.push({
        left: removed[p] ? { text: removed[p].left, no: removed[p].leftNo, changed: true } : undefined,
        right: added[p] ? { text: added[p].right, no: added[p].rightNo, changed: true } : undefined,
      });
    }
  }
  return out;
}
