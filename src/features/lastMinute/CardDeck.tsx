import { useEffect, useMemo, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { LAST_MINUTE_CARDS, LAST_MINUTE_DECKS, type DeckId, type LastMinuteCard } from '../../data/lastMinuteCards';
import { flipDeckReducer } from '../../lib/flipDeck';
import { cardsFor, deckStarts, landingIndex, readingMinutes, type CardSetMode } from '../../lib/cardSet';
import FlipCard from './FlipCard';

/** Keys that belong to whatever has focus, not to the deck. */
const OWNS_KEYS = 'input, textarea, select, [contenteditable="true"]';
const OWNS_ENTER = 'button, a, summary';

const deckName = (id: DeckId) => LAST_MINUTE_DECKS.find(d => d.id === id)?.name ?? id;
const SET_LABEL: Record<CardSetMode, string> = { core: 'Core', all: 'All' };

const pill = (active: boolean) =>
  `whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${active ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface text-muted hover:text-ink'}`;
const navButton = 'inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-medium hover:border-accent';

interface CardDeckProps {
  mode: CardSetMode;
  cards: readonly LastMinuteCard[];
  startIndex: number;
  /** Switch sets, landing on `startIndex` in the new one. */
  onModeChange: (mode: CardSetMode, startIndex: number) => void;
}

/**
 * The cards in play, with their navigation. The page keys this component by
 * mode, so a switch remounts it with a reducer sized for the new set (no stale
 * count to clamp against) and starts it on the matching card.
 */
export default function CardDeck({ mode, cards, startIndex, onModeChange }: CardDeckProps) {
  const reduce = useMemo(() => flipDeckReducer(cards.length), [cards.length]);
  const [{ index, flipped }, dispatch] = useReducer(reduce, { index: startIndex, flipped: false });
  const decks = useMemo(() => deckStarts(LAST_MINUTE_DECKS, cards), [cards]);
  const card = cards[index];
  const isLast = index === cards.length - 1;

  // ← → move between cards anywhere on the page; Space or Enter turns the card
  // unless a button or link has focus (it handles those keys itself).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(OWNS_KEYS)) return;
      if (e.key === 'ArrowRight') dispatch({ type: 'next' });
      else if (e.key === 'ArrowLeft') dispatch({ type: 'prev' });
      else if ((e.key === ' ' || e.key === 'Enter') && !target?.closest(OWNS_ENTER)) {
        e.preventDefault();
        dispatch({ type: 'flip' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const switchTo = (next: CardSetMode) => {
    if (next !== mode) onModeChange(next, landingIndex(card, cardsFor(LAST_MINUTE_CARDS, next), LAST_MINUTE_CARDS));
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-4">
        <div role="group" aria-label="Card set" className="inline-flex rounded-lg border border-line bg-surface p-0.5">
          {(['core', 'all'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchTo(m)}
              aria-pressed={m === mode}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${m === mode ? 'bg-accent text-accent-contrast' : 'text-muted hover:text-ink'}`}
            >
              {SET_LABEL[m]} (~{readingMinutes(cardsFor(LAST_MINUTE_CARDS, m).length)} min)
            </button>
          ))}
        </div>
      </div>

      <nav aria-label="Decks" className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto mb-4">
        <ul className="flex gap-2 w-max">
          {decks.map(d => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => dispatch({ type: 'goto', index: d.start })}
                aria-current={d.id === card.deck ? 'true' : undefined}
                className={pill(d.id === card.deck)}
              >
                {d.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex-1 h-2 rounded-full bg-ink/10 overflow-hidden"
          role="progressbar"
          aria-label="Cards"
          aria-valuemin={1}
          aria-valuemax={cards.length}
          aria-valuenow={index + 1}
        >
          <div className="h-full rounded-full bg-pop transition-[width]" style={{ width: `${((index + 1) / cards.length) * 100}%` }} />
        </div>
        <span className="text-sm text-muted tabular-nums" aria-live="polite">{index + 1} / {cards.length}</span>
      </div>

      <FlipCard
        key={card.id}
        card={card}
        deckName={deckName(card.deck)}
        flipped={flipped}
        onFlip={() => dispatch({ type: 'flip' })}
        onSwipe={direction => dispatch({ type: direction })}
      />

      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 mt-5">
        <button
          type="button"
          onClick={() => dispatch({ type: 'prev' })}
          disabled={index === 0}
          aria-label="Previous card"
          className={`${navButton} disabled:opacity-40 disabled:hover:border-line`}
        >
          <ArrowLeft size={16} aria-hidden="true" /><span className="hidden sm:inline">Previous</span>
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'flip' })}
          className="justify-self-center rounded-lg bg-accent text-accent-contrast px-5 py-2.5 text-sm font-semibold hover:bg-accent-strong transition-colors"
        >
          {flipped ? 'Show the question' : 'Show the answer'}
        </button>
        {isLast ? (
          <button type="button" onClick={() => dispatch({ type: 'goto', index: 0 })} aria-label="Start over" className={navButton}>
            <RotateCcw size={16} aria-hidden="true" /><span className="hidden sm:inline">Start over</span>
          </button>
        ) : (
          <button type="button" onClick={() => dispatch({ type: 'next' })} aria-label="Next card" className={navButton}>
            <span className="hidden sm:inline">Next</span><ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {isLast && flipped && (
        <p className="mt-6 text-center text-sm text-muted">
          {mode === 'core'
            ? <>That&apos;s the core set. Switch to <strong className="font-semibold text-ink">All</strong> for {LAST_MINUTE_CARDS.length - cards.length} more cards, or good luck in there.</>
            : <>That&apos;s every card. Good luck in there. For more depth, try the <Link to="/quiz" className="font-medium text-accent hover:text-accent-strong">Quiz</Link>.</>}
        </p>
      )}
    </>
  );
}
