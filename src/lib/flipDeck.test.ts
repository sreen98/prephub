import { describe, it, expect } from 'vitest';
import { flipDeckReducer, initialFlipDeck, swipeDirection } from './flipDeck';

describe('flipDeckReducer', () => {
  const reduce = flipDeckReducer(3);

  it('flips and unflips the current card', () => {
    const flipped = reduce(initialFlipDeck, { type: 'flip' });
    expect(flipped).toEqual({ index: 0, flipped: true });
    expect(reduce(flipped, { type: 'flip' })).toEqual({ index: 0, flipped: false });
  });

  it('shows the front of every card it moves to', () => {
    const flipped = reduce(initialFlipDeck, { type: 'flip' });
    expect(reduce(flipped, { type: 'next' })).toEqual({ index: 1, flipped: false });
    expect(reduce({ index: 2, flipped: true }, { type: 'prev' })).toEqual({ index: 1, flipped: false });
    expect(reduce(flipped, { type: 'goto', index: 2 })).toEqual({ index: 2, flipped: false });
  });

  it('stops at both ends without unflipping', () => {
    const first = { index: 0, flipped: true };
    const last = { index: 2, flipped: true };
    expect(reduce(first, { type: 'prev' })).toBe(first);
    expect(reduce(last, { type: 'next' })).toBe(last);
    expect(reduce(first, { type: 'goto', index: 99 })).toEqual({ index: 2, flipped: false });
    expect(reduce(last, { type: 'goto', index: -4 })).toEqual({ index: 0, flipped: false });
  });

  it('copes with an empty deck', () => {
    expect(flipDeckReducer(0)(initialFlipDeck, { type: 'next' })).toBe(initialFlipDeck);
  });
});

describe('swipeDirection', () => {
  it('a left swipe goes forward and a right swipe goes back', () => {
    expect(swipeDirection(-80, 10)).toBe('next');
    expect(swipeDirection(80, -10)).toBe('prev');
  });

  it('ignores taps, short drags and vertical scrolls', () => {
    expect(swipeDirection(0, 0)).toBeNull();
    expect(swipeDirection(-30, 0)).toBeNull();
    expect(swipeDirection(-60, 90)).toBeNull();
  });
});
