/**
 * Which flip cards are in play: the "core" pass (about 10 minutes) or all of
 * them. Kept generic so it is testable without the real card data.
 */
export type CardSetMode = 'core' | 'all';

export const CARD_SET_MODES: readonly CardSetMode[] = ['core', 'all'];

/** About 20 seconds a card: read the question, say the answer, flip, check. */
export const readingMinutes = (cardCount: number): number => Math.round((cardCount * 20) / 60);

export function cardsFor<T extends { core?: true }>(cards: readonly T[], mode: CardSetMode): readonly T[] {
  return mode === 'all' ? cards : cards.filter(c => c.core);
}

/** Each deck that has cards in this set, with the index of its first card. Decks with none are left out. */
export function deckStarts<D extends { id: string }>(
  decks: readonly D[],
  cards: readonly { deck: string }[],
): (D & { start: number })[] {
  return decks
    .map(d => ({ ...d, start: cards.findIndex(c => c.deck === d.id) }))
    .filter(d => d.start >= 0);
}

/**
 * Where to land after switching sets: the same card when the new set has it,
 * otherwise the next card after it in the full order (or the last card).
 * `all` is the full ordered list; both sets are subsequences of it.
 */
export function landingIndex<T extends { id: string }>(
  current: T | undefined,
  next: readonly T[],
  all: readonly T[],
): number {
  if (!current || next.length === 0) return 0;
  const same = next.findIndex(c => c.id === current.id);
  if (same >= 0) return same;
  const position = all.findIndex(c => c.id === current.id);
  const after = next.findIndex(c => all.findIndex(a => a.id === c.id) > position);
  return after >= 0 ? after : next.length - 1;
}
