import { useState } from 'react';
import { LAST_MINUTE_CARDS } from '../data/lastMinuteCards';
import { CARD_SET_MODES, cardsFor, readingMinutes, type CardSetMode } from '../lib/cardSet';
import { getEnum, safeSet } from '../lib/storage';
import CardDeck from '../features/lastMinute/CardDeck';

/** The Core / All choice. A storage key is a compatibility contract (storageKeys.test.ts). */
const MODE_KEY = 'last-minute-mode';

export default function LastMinutePage() {
  const [mode, setMode] = useState<CardSetMode>(() => getEnum(MODE_KEY, CARD_SET_MODES, 'core'));
  const [startIndex, setStartIndex] = useState(0);
  const cards = cardsFor(LAST_MINUTE_CARDS, mode);

  const changeMode = (next: CardSetMode, nextStart: number) => {
    setStartIndex(nextStart);
    setMode(next);
    safeSet(MODE_KEY, next);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12 text-ink">
      <header className="mb-6">
        <h1 className="page-title">
          Last-minute <span className="hl">cards</span>
        </h1>
        <p className="text-lg text-muted mt-3 leading-relaxed">
          {cards.length} cards, about {readingMinutes(cards.length)} minutes. Say the answer to yourself, then flip the card to check.
          <span className="hidden sm:inline"> Use ← → to move and Space to flip.</span>
          <span className="sm:hidden"> Swipe to move between cards.</span>
        </p>
      </header>

      <CardDeck key={mode} mode={mode} cards={cards} startIndex={startIndex} onModeChange={changeMode} />
    </div>
  );
}
