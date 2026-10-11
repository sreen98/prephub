import { describe, it, expect } from 'vitest';
import { cardsFor, deckStarts, landingIndex, readingMinutes } from './cardSet';

type Card = { id: string; deck: string; core?: true };
const ALL: Card[] = [
  { id: 'a1', deck: 'a', core: true },
  { id: 'a2', deck: 'a' },
  { id: 'a3', deck: 'a', core: true },
  { id: 'b1', deck: 'b' },          // deck b has no core cards
  { id: 'c1', deck: 'c', core: true },
];
const DECKS = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }];
const CORE = cardsFor(ALL, 'core');

describe('cardsFor', () => {
  it('core keeps only core cards, in order; all keeps everything', () => {
    expect(CORE.map(c => c.id)).toEqual(['a1', 'a3', 'c1']);
    expect(cardsFor(ALL, 'all')).toBe(ALL);
  });
});

describe('deckStarts', () => {
  it('gives each deck its first index in the set and hides a deck with no cards', () => {
    expect(deckStarts(DECKS, ALL).map(d => [d.id, d.start])).toEqual([['a', 0], ['b', 3], ['c', 4]]);
    expect(deckStarts(DECKS, CORE).map(d => [d.id, d.start])).toEqual([['a', 0], ['c', 2]]);
  });
});

describe('landingIndex', () => {
  it('stays on the same card when the new set has it', () => {
    expect(landingIndex(ALL[2], CORE, ALL)).toBe(1);
    expect(landingIndex(CORE[2], ALL, ALL)).toBe(4);
  });

  it('moves to the next card in the full order when the card is not in the new set', () => {
    expect(landingIndex(ALL[1], CORE, ALL)).toBe(1);   // a2 → a3
    expect(landingIndex(ALL[3], CORE, ALL)).toBe(2);   // b1 → c1
  });

  it('falls back to the last card, or 0 for nothing', () => {
    expect(landingIndex({ id: 'z', deck: 'z' }, CORE, [...ALL, { id: 'z', deck: 'z' }])).toBe(2);
    expect(landingIndex(undefined, CORE, ALL)).toBe(0);
    expect(landingIndex(ALL[0], [], ALL)).toBe(0);
  });
});

describe('readingMinutes', () => {
  it('is 20 seconds a card, rounded', () => {
    expect(readingMinutes(30)).toBe(10);
    expect(readingMinutes(48)).toBe(16);
    expect(readingMinutes(0)).toBe(0);
  });
});
