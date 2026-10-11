/**
 * The inline markup used in hand-written card text: `code` and **bold**, nothing
 * else. Bold may contain code spans (`**the `x` queue**`); a `**` inside a code
 * span is literal. An unclosed marker stays plain text rather than swallowing
 * the rest of the line.
 */
export type InlineToken =
  | { kind: 'text'; value: string }
  | { kind: 'code'; value: string }
  | { kind: 'bold'; children: InlineToken[] };

const PATTERN = /`([^`]+)`|\*\*((?:`[^`]*`|[^*`])+)\*\*/g;

export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let last = 0;
  for (const m of text.matchAll(PATTERN)) {
    const at = m.index;
    if (at > last) tokens.push({ kind: 'text', value: text.slice(last, at) });
    if (m[1] !== undefined) tokens.push({ kind: 'code', value: m[1] });
    else tokens.push({ kind: 'bold', children: parseInline(m[2]) });
    last = at + m[0].length;
  }
  if (last < text.length) tokens.push({ kind: 'text', value: text.slice(last) });
  return tokens;
}
