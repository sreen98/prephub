/**
 * Slice the lines a build step is about out of the template it belongs to.
 *
 * Walkthrough steps point at the template by anchor rather than restating the
 * code, so what the reader sees in the modal is always the code they have open
 * in the editor. Returns null when the anchor does not match, which the test
 * suite treats as a build failure rather than letting the modal render nothing.
 */
export function sliceExcerpt(
  source: string,
  from: string,
  lines = 6,
): string | null {
  const all = source.split('\n');
  const start = all.findIndex((l) => l.includes(from));
  if (start === -1) return null;

  const picked = all.slice(start, start + lines);
  // Drop trailing blank lines so the block does not end in whitespace.
  while (picked.length && !picked[picked.length - 1].trim()) picked.pop();

  // Re-indent to the shallowest line so a deeply nested excerpt reads flush.
  const indents = picked.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length);
  const shift = indents.length ? Math.min(...indents) : 0;
  return picked.map((l) => l.slice(shift)).join('\n');
}
