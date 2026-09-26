/**
 * Challenge templates used to open with a comment block restating the problem
 * (title, description, examples, constraints). The Problem panel shows that now,
 * so the block was removed from the templates, but a reader's SAVED draft still
 * has it, because an edited draft is never replaced by a newer template.
 *
 * This removes exactly that leading block from a draft and nothing else: the
 * same rules that were used on the templates. It only acts when the code STARTS
 * with the old header, so a reader's own comments are never touched.
 *   - JS (`// ===== CHALLENGE: … =====`, or with `═════`): every leading comment
 *     line, then the blank lines after it.
 *   - React (`// ===== MACHINE CODING: … =====`): the intro paragraph up to the
 *     first bare `//`, then a `// TASK` list if one follows. The design notes
 *     after it are kept, as they were in the templates.
 */
const HEADER = /^\/\/ (?:=====|═════) (CHALLENGE|MACHINE CODING): /;

export function stripChallengeHeader(code: string): string {
  const match = HEADER.exec(code);
  if (!match) return code;
  const lines = code.split('\n');
  let end = 0;
  while (end < lines.length && lines[end].startsWith('//')) end++;   // the header block
  let cut = end;
  if (match[1] === 'MACHINE CODING') {
    const isBare = (i: number) => lines[i].trim() === '//';
    cut = 0;
    while (cut < end && !isBare(cut)) cut++;
    if (cut < end) cut++;
    if (cut < end && lines[cut].trim() === '// TASK') {
      while (cut < end && !isBare(cut)) cut++;
      if (cut < end) cut++;
    }
  }
  let rest = lines.slice(cut, end);
  while (rest.length && rest[rest.length - 1].trim() === '//') rest = rest.slice(0, -1);
  let after = end;
  if (rest.length === 0) while (after < lines.length && lines[after].trim() === '') after++;
  return [...rest, ...lines.slice(after)].join('\n');
}
