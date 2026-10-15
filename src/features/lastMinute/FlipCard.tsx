import { useEffect, useRef, type TouchEvent } from 'react';
import { RotateCw } from 'lucide-react';
import type { LastMinuteCard } from '../../data/lastMinuteCards';
import { swipeDirection } from '../../lib/flipDeck';
import CardBack, { InlineText } from './CardBack';

interface FlipCardProps {
  card: LastMinuteCard;
  deckName: string;
  flipped: boolean;
  onFlip: () => void;
  onSwipe: (direction: 'next' | 'prev') => void;
}

/** Swipes that start on something that scrolls sideways (code, tables) belong to that element. */
const SCROLLS_SIDEWAYS = 'pre, .overflow-x-auto';

/** The deck name sits on the card's red header rule, like a topic written on an index card. */
const DeckChip = ({ name }: { name: string }) => (
  <span className="index-card-head block w-full pb-2.5 font-mono text-xs text-muted">{name}</span>
);

/**
 * One two-sided card. Both faces share a grid cell, so the card is as tall as
 * its longer side and nothing jumps when it turns. The hidden face is `inert`
 * (no focus, no screen reader), and focus follows the flip so keyboard users
 * are not dropped back to the top of the page. The 3D turn lives in index.css,
 * where the reduced-motion block makes it instant.
 *
 * Swipes use touch events, not pointer events: once the browser starts a
 * scroll it cancels the pointer stream, but `touchend` still arrives.
 */
export default function FlipCard({ card, deckName, flipped, onFlip, onSwipe }: FlipCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLHeadingElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const shownFlipped = useRef(flipped);

  useEffect(() => {
    if (shownFlipped.current === flipped) return;   // mount, or StrictMode's second run
    shownFlipped.current = flipped;
    const active = document.activeElement;
    const lostFocus = !active || active === document.body || rootRef.current?.contains(active);
    if (lostFocus) (flipped ? backRef.current : frontRef.current)?.focus({ preventScroll: true });
  }, [flipped]);

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    const inScroller = e.target instanceof Element && e.target.closest(SCROLLS_SIDEWAYS);
    touchStart.current = t && !inScroller ? { x: t.clientX, y: t.clientY } : null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current;
    const t = e.changedTouches[0];
    touchStart.current = null;
    if (!start || !t) return;
    const direction = swipeDirection(t.clientX - start.x, t.clientY - start.y);
    if (direction) onSwipe(direction);
  };

  return (
    <div ref={rootRef} className="flip-card" data-flipped={flipped} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flip-card-inner">
        <button
          ref={frontRef}
          type="button"
          onClick={onFlip}
          inert={flipped}
          aria-hidden={flipped}
          className="flip-card-face flex flex-col items-start justify-between gap-6 text-left min-h-[16rem] sm:min-h-[20rem] p-5 sm:p-8 hover:border-accent"
        >
          <DeckChip name={deckName} />
          <span className="font-display text-3xl sm:text-[2.6rem] font-semibold tracking-tight leading-[1.15]"><InlineText text={card.question} /></span>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
            <RotateCw size={14} aria-hidden="true" /> Tap to see the answer
          </span>
        </button>

        <div inert={!flipped} aria-hidden={!flipped} className="flip-card-face flip-card-back p-5 sm:p-7">
          <div className="mb-3"><DeckChip name={deckName} /></div>
          <h2 ref={backRef} tabIndex={-1} className="font-display text-xl font-semibold leading-snug mb-4 focus-visible:outline-none">
            <InlineText text={card.question} />
          </h2>
          <CardBack card={card} />
        </div>
      </div>
    </div>
  );
}
