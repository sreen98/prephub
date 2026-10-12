// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import LastMinutePage from './LastMinutePage';
import FlipCard from '../features/lastMinute/FlipCard';
import { LAST_MINUTE_CARDS } from '../data/lastMinuteCards';
import { cardsFor } from '../lib/cardSet';
import { safeGet, safeRemove, safeSet } from '../lib/storage';

const MODE_KEY = 'last-minute-mode';
const CORE = cardsFor(LAST_MINUTE_CARDS, 'core');
const ALL = LAST_MINUTE_CARDS;
/** A question as it reads on screen: the inline markup is rendered, not shown. */
const shown = (q = '') => q.replace(/`|\*\*/g, '');

beforeAll(() => {
  // @ts-expect-error test flag
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;
let host: HTMLDivElement | null = null;
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  safeRemove(MODE_KEY);
});

function mount() {
  act(() => root?.unmount());
  host?.remove();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(<MemoryRouter><LastMinutePage /></MemoryRouter>));
  const el = host;
  const card = () => el.querySelector('.flip-card');
  const buttons = () => [...el.querySelectorAll('button')];
  const label = (b: HTMLButtonElement) => b.getAttribute('aria-label') ?? b.textContent?.trim() ?? '';
  const button = (name: string) => {
    const found = buttons().find(b => label(b) === name || label(b).startsWith(`${name} (`));
    if (!found) throw new Error(`no button "${name}"`);
    return found;
  };
  const has = (name: string) => buttons().some(b => label(b) === name);
  const counter = () => el.querySelector('[aria-live="polite"]')?.textContent;
  const subtitle = () => el.querySelector('header p')?.textContent ?? '';
  const key = (k: string) => act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); });
  return { card, button, has, counter, subtitle, key, click: (b: HTMLElement) => act(() => b.click()) };
}

describe('LastMinutePage', () => {
  it('opens on the core set, first card, question side up, with the answer inert', () => {
    const { card, counter, subtitle, button } = mount();
    expect(counter()).toBe(`1 / ${CORE.length}`);
    expect(subtitle()).toContain(`${CORE.length} cards, about 10 minutes`);
    expect(button('Core').getAttribute('aria-pressed')).toBe('true');
    expect(button('Core').textContent).toBe('Core (~10 min)');
    expect(button('All').textContent).toBe('All (~19 min)');
    expect(card()?.getAttribute('data-flipped')).toBe('false');
    expect(card()?.textContent).toContain(shown(CORE[0].question));
    expect(card()?.querySelector('.flip-card-back')?.hasAttribute('inert')).toBe(true);
  });

  it('flips from the card, the button and the keyboard, and the button label follows', () => {
    const { card, button, click, key } = mount();
    click(button('Show the answer'));
    expect(card()?.getAttribute('data-flipped')).toBe('true');
    expect(card()?.querySelector('.flip-card-back')?.hasAttribute('inert')).toBe(false);
    click(button('Show the question'));
    expect(card()?.getAttribute('data-flipped')).toBe('false');
    const front = card()?.querySelector('button');
    if (front) click(front);
    expect(card()?.getAttribute('data-flipped')).toBe('true');
    key(' ');
    expect(card()?.getAttribute('data-flipped')).toBe('false');
  });

  it('moves with the arrow keys through the core set and always lands on the question side', () => {
    const { card, counter, button, click, key } = mount();
    click(button('Show the answer'));
    key('ArrowRight');
    expect(counter()).toBe(`2 / ${CORE.length}`);
    expect(card()?.getAttribute('data-flipped')).toBe('false');
    expect(card()?.textContent).toContain(shown(CORE[1].question));
    key('ArrowLeft');
    key('ArrowLeft');
    expect(counter()).toBe(`1 / ${CORE.length}`);
    expect(button('Previous card').disabled).toBe(true);
  });

  it('deck tabs jump to the first card of the deck in the active set', () => {
    const { counter, button, click } = mount();
    click(button('HTML & CSS'));
    expect(counter()).toBe(`${CORE.findIndex(c => c.deck === 'css') + 1} / ${CORE.length}`);
    expect(button('HTML & CSS').getAttribute('aria-current')).toBe('true');
    expect(button('JavaScript').hasAttribute('aria-current')).toBe(false);
  });

  it('hides a deck with no core cards in Core, and shows it in All', () => {
    expect(CORE.some(c => c.deck === 'rapid')).toBe(false);
    const { has, button, click } = mount();
    expect(has('Rapid fire')).toBe(false);
    click(button('All'));
    expect(has('Rapid fire')).toBe(true);
  });

  it('switching to All keeps the current card, updates the counts and persists the choice', () => {
    const { counter, subtitle, card, button, click, key } = mount();
    key('ArrowRight');                         // core card 2
    const current = CORE[1];
    click(button('All'));
    expect(button('All').getAttribute('aria-pressed')).toBe('true');
    expect(counter()).toBe(`${ALL.findIndex(c => c.id === current.id) + 1} / ${ALL.length}`);
    expect(card()?.textContent).toContain(shown(current.question));
    expect(subtitle()).toContain(`${ALL.length} cards, about 19 minutes`);
    expect(safeGet(MODE_KEY)).toBe('all');

    const again = mount();                     // a fresh visit reads the stored choice
    expect(again.counter()).toBe(`1 / ${ALL.length}`);
  });

  it('switching to Core from a non-core card lands on the next core card', () => {
    safeSet(MODE_KEY, 'all');
    const { counter, card, button, click, key } = mount();
    const firstExtra = ALL.findIndex(c => !c.core);
    for (let i = 0; i < firstExtra; i++) key('ArrowRight');
    expect(card()?.textContent).toContain(shown(ALL[firstExtra].question));
    click(button('Core'));
    const landing = ALL.slice(firstExtra).find(c => c.core);
    expect(card()?.textContent).toContain(shown(landing?.question));
    expect(counter()).toBe(`${CORE.findIndex(c => c.id === landing?.id) + 1} / ${CORE.length}`);
  });

  it('offers Start over on the last card of the set', () => {
    const { counter, button, click, key } = mount();
    for (let i = 0; i < CORE.length + 3; i++) key('ArrowRight');
    expect(counter()).toBe(`${CORE.length} / ${CORE.length}`);
    click(button('Start over'));
    expect(counter()).toBe(`1 / ${CORE.length}`);
  });

  it('ignores a stored value that is not a mode', () => {
    safeSet(MODE_KEY, 'everything');
    expect(mount().counter()).toBe(`1 / ${CORE.length}`);
  });

  it('renders every card, both sides', () => {
    for (const c of ALL) {
      const html = renderToStaticMarkup(<FlipCard card={c} deckName="Deck" flipped onFlip={() => {}} onSwipe={() => {}} />);
      expect(html, c.id).toContain('flip-card-back');
      if (c.code && c.code.lang !== 'text') expect(html, c.id).toContain('hljs');
    }
  });
});
