// Guide callouts: a blockquote whose first line is a marker such as `> [!FOLLOWUP]`.
//
// The syntax is GitHub's alert syntax, so the markdown still reads well on GitHub and
// in any renderer that doesn't know it. NOTE, TIP and WARNING are GitHub's own kinds;
// FOLLOWUP, TRAP and KEY are interview-specific:
//
//   > [!FOLLOWUP]
//   > What happens if two tabs write at the same time?      <- first paragraph: the question
//   >
//   > The last write wins, so ...                            <- the rest: the hidden answer
//
//   > [!TRAP]  the mistake most candidates make, and the fix
//   > [!KEY]   the one line to say out loud in the interview

export const CALLOUT_KINDS = ['FOLLOWUP', 'TRAP', 'KEY', 'NOTE', 'TIP', 'WARNING'] as const;
export type CalloutKind = (typeof CALLOUT_KINDS)[number];

/** Matches the marker at the very start of a blockquote's first line. */
export const CALLOUT_MARKER = /^\[!([A-Z]+)\][ \t]*\n?/;

export function isCalloutKind(value: string): value is CalloutKind {
  return (CALLOUT_KINDS as readonly string[]).includes(value);
}

/**
 * Splits a leading `[!KIND]` marker off the text. Returns null when there is no
 * marker or the kind is unknown, so an unknown marker renders as a plain quote
 * (and the content test reports it).
 */
export function parseCalloutMarker(text: string): { kind: CalloutKind; rest: string } | null {
  const match = CALLOUT_MARKER.exec(text);
  if (!match || !isCalloutKind(match[1])) return null;
  return { kind: match[1], rest: text.slice(match[0].length) };
}
