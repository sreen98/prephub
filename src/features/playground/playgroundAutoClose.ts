// Pure decision helpers for the Code Playground editor's auto-close behaviour.
// They live here rather than inline in the key handler so they can be executed
// and tested directly — the handler itself needs a real textarea and React state.

/** Opening character → the character that closes it. */
export const BRACKET_PAIRS: Record<string, string> = {
  '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`',
};

/** Characters that "smart skip" when you type one that is already at the caret. */
export const CLOSERS = new Set([')', ']', '}', '"', "'", '`']);

/** Tags that cannot have children, so typing `>` must NOT append a closing tag. */
export const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/** True if `s` leaves any `{`, `(` or `[` open — i.e. we're inside an expression. */
function hasUnclosedBracket(s: string): boolean {
  let curly = 0, paren = 0, square = 0;
  for (const ch of s) {
    if (ch === '{') curly++;
    else if (ch === '}') curly--;
    else if (ch === '(') paren++;
    else if (ch === ')') paren--;
    else if (ch === '[') square++;
    else if (ch === ']') square--;
  }
  return curly > 0 || paren > 0 || square > 0;
}

/**
 * Given the text before the caret at the moment `>` is typed, return the closing
 * tag to insert (`"</div>"`, or `"</>"` for a fragment), or `null` if it must not fire.
 *
 * Returns null for: non-JSX code, closing tags (`</div`), self-closing tags
 * (`<Foo /`), void elements (`<br`), and — importantly — TypeScript generics and
 * comparisons. `useState<Props>` and `a < b` both end in `>` but must be left
 * alone; what separates them from a real tag is that the `<` follows an
 * identifier, which is never true of JSX.
 */
export function closingTagFor(before: string, isJSX: boolean): string | null {
  if (!isJSX) return null;
  const open = before.lastIndexOf('<');
  if (open === -1) return null;

  const seg = before.slice(open);
  // Collapse `{...}` so an arrow function inside a prop (`onClick={() => x}`)
  // doesn't read as a stray `>` inside the tag.
  const flat = seg.replace(/\{[^{}]*\}/g, '{}');

  const prev = open > 0 ? before[open - 1] : '';
  if (/[\w$.)\]]/.test(prev)) return null;           // generic or comparison

  // The opening tag must be *finished* apart from its `>`. If a `{`, `(` or `[`
  // is still open inside it, the caret is in the middle of a prop expression and
  // this `>` belongs to that expression — most often the arrow in
  // `onClick={() => …}`. Closing the tag here produced
  // `<button onClick={()></button>}>`, which is the reported corruption.
  if (hasUnclosedBracket(seg)) return null;

  const m = flat.match(/^<([A-Za-z][\w.:-]*)?(?:\s[^<>]*)?$/);
  if (!m) return null;
  if (flat.trimEnd().endsWith('/')) return null;     // already self-closing

  const tag = m[1] ?? '';
  // A fragment is only `<` with the caret right after it. Without this check,
  // `if (a < b` matched as a nameless tag with trailing text and closed to `</>`.
  if (!tag && flat !== '<') return null;
  if (VOID_ELEMENTS.has(tag.toLowerCase())) return null;
  return `</${tag}>`;
}

/**
 * Whether typing an opening bracket or quote should also insert its pair.
 *
 * False when the caret sits immediately before a word character: typing `[` in
 * front of existing text used to produce `[]` and shove that text inside the
 * pair, which is how `const [count, setCount]` became `count[(count, setCount)]`.
 * A non-empty selection is exempt — wrapping a selection in brackets is
 * deliberate.
 */
export function shouldClosePair(code: string, start: number, end: number, key: string): boolean {
  const isQuote = key === "'" || key === '"' || key === '`';
  if (isQuote && /\w/.test(code[start - 1] || '')) return false;   // apostrophe / contraction
  if (start === end && /[\w$]/.test(code[start] || '')) return false;
  return true;
}

/**
 * Whether typing `<` should insert a matching `>`.
 *
 * This can't be answered from the `<` alone, because three different things
 * start with it and only one wants a `>`:
 *
 * - `<div`            → a JSX tag. Wants `>`.
 * - `count < max`     → a comparison. A `>` here is garbage.
 * - `useState<Props`  → a TS generic. The user closes it themselves, and
 *                       auto-closing would fight the tag rule at `>`.
 *
 * What separates them is the token *before* the `<`: a comparison or a generic
 * always follows a value — an identifier, `)`, `]`, a string or a property
 * access. A tag never does; it follows `(`, `{`, `,`, `=>`, `>` or a line start.
 */
export function shouldCloseAngle(before: string, isJSX: boolean): boolean {
  if (!isJSX) return false;
  const prev = before.replace(/[ \t]+$/, '').slice(-1);
  if (prev === '') return true;                      // start of the file
  return !/[\w$)\]'"`.]/.test(prev);
}
