/**
 * Navigation state for a stack of flip cards. Moving to another card always
 * shows its front, so the answer is never revealed before you have tried.
 */
export interface FlipDeckState { index: number; flipped: boolean }

export type FlipDeckAction =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'flip' }
  | { type: 'goto'; index: number };

export const initialFlipDeck: FlipDeckState = { index: 0, flipped: false };

export function flipDeckReducer(count: number) {
  const clamp = (i: number) => Math.min(Math.max(i, 0), Math.max(count - 1, 0));
  const moveTo = (state: FlipDeckState, i: number): FlipDeckState => {
    const index = clamp(i);
    return index === state.index ? state : { index, flipped: false };
  };
  return (state: FlipDeckState, action: FlipDeckAction): FlipDeckState => {
    switch (action.type) {
      case 'next': return moveTo(state, state.index + 1);
      case 'prev': return moveTo(state, state.index - 1);
      case 'flip': return { ...state, flipped: !state.flipped };
      case 'goto': return moveTo(state, action.index);
    }
  };
}

/** A horizontal swipe of at least `min` px that is more sideways than vertical. */
export function swipeDirection(dx: number, dy: number, min = 50): 'next' | 'prev' | null {
  if (Math.abs(dx) < min || Math.abs(dx) <= Math.abs(dy)) return null;
  return dx < 0 ? 'next' : 'prev';
}
