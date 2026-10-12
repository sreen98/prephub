// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { act, createElement, StrictMode, useEffect, useState, type FC } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { LAST_MINUTE_CARDS } from './lastMinuteCards';

/**
 * The cards whose claims are about the DOM or React's runtime, executed in
 * jsdom with the card's own code. Data-only claims live in lastMinuteCards.test.ts.
 */

const source = (id: string) => {
  const code = LAST_MINUTE_CARDS.find(c => c.id === id)?.code?.source;
  if (!code) throw new Error(`no code on card ${id}`);
  return code;
};

/** Every snippet is compiled here, once: running the card's own code is the point. */
function compile(...paramsAndBody: string[]): (...args: unknown[]) => unknown {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- running the card's own snippet is the point
  return new Function(...paramsAndBody) as (...args: unknown[]) => unknown;
}

beforeAll(() => {
  // @ts-expect-error test flag
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = '';
  vi.useRealTimers();
});

function renderInto(node: Parameters<Root['render']>[0]) {
  const host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(node));
  return host;
}

describe('batching card', () => {
  const [snapshotLine, updaterLine] = source('batching').split('\n');

  it('two setCount(count + 1) add 1; two updaters add 2', () => {
    const handler = (line: string) => compile('setCount', 'count', line.replace(/\/\/.*$/, '')) as
      (set: (v: number | ((c: number) => number)) => void, count: number) => void;
    function Counter() {
      const [count, setCount] = useState(0);
      return (
        <>
          <button id="snapshot" onClick={() => handler(snapshotLine)(setCount, count)} />
          <button id="updater" onClick={() => handler(updaterLine)(setCount, count)} />
          <output>{count}</output>
        </>
      );
    }
    const host = renderInto(<Counter />);
    const out = () => host.querySelector('output')?.textContent;
    act(() => host.querySelector<HTMLButtonElement>('#snapshot')?.click());
    expect(out()).toBe('1');
    act(() => host.querySelector<HTMLButtonElement>('#updater')?.click());
    expect(out()).toBe('3');
  });
});

describe('event delegation card', () => {
  it('one listener on the list handles clicks inside items, including items added later', () => {
    document.body.innerHTML = '<ul id="todos"><li data-id="1"><span id="label">Buy milk</span></li></ul>';
    const logs: unknown[][] = [];
    compile('console', 'document', source('event-delegation'))({ log: (...a: unknown[]) => logs.push(a) }, document);

    document.getElementById('label')?.click();                 // e.target is the <span>, closest('li') finds the item
    expect(logs).toEqual([['clicked', '1']]);

    const later = document.createElement('li');
    later.dataset.id = '2';
    document.getElementById('todos')?.append(later);
    later.click();
    expect(logs).toEqual([['clicked', '1'], ['clicked', '2']]);

    document.getElementById('todos')?.click();                 // on the list itself, not an item
    expect(logs).toHaveLength(2);
  });
});

describe('custom hooks card', () => {
  it('useDebounce only reports the value once it has been still for ms', () => {
    vi.useFakeTimers();
    const useDebounce = compile('useState', 'useEffect', `${source('custom-hooks')}\nreturn useDebounce;`)(useState, useEffect) as
      (value: string, ms: number) => string;
    const Search: FC<{ value: string }> = ({ value }) => <output>{useDebounce(value, 300)}</output>;
    const host = renderInto(<Search value="" />);
    const out = () => host.querySelector('output')?.textContent;
    for (const v of ['r', 're', 'rea', 'react']) {
      act(() => root?.render(<Search value={v} />));
      act(() => { vi.advanceTimersByTime(100); });
    }
    expect(out()).toBe('');
    act(() => { vi.advanceTimersByTime(199); });
    expect(out()).toBe('');
    act(() => { vi.advanceTimersByTime(1); });
    expect(out()).toBe('react');
  });
});

describe('fetch in effect card', () => {
  /** A fetch whose responses resolve when the test says so, in any order. */
  function controlledFetch() {
    const pending = new Map<string, (user: { name: string }) => void>();
    const fetch = (url: string) => new Promise(resolve => {
      pending.set(url, user => resolve({ json: () => Promise.resolve(user) }));
    });
    return { fetch, respond: (url: string, name: string) => pending.get(url)?.({ name }) };
  }

  const userComponent = (effect: string, fetch: unknown) => compile('useState', 'useEffect', 'fetch',
    `return function User({ id }) {\n  const [user, setUser] = useState(null);\n${effect}\n  return user ? user.name : 'none';\n};`,
  )(useState, useEffect, fetch) as FC<{ id: number }>;

  async function raceOutcome(effect: string) {
    const { fetch, respond } = controlledFetch();
    const User = userComponent(effect, fetch);
    const host = renderInto(createElement(User, { id: 1 }));
    act(() => root?.render(createElement(User, { id: 2 })));
    // Each act drains the response's .then chain before the next one arrives.
    await act(async () => { respond('/api/users/2', 'Bob'); await Promise.resolve(); });   // the newer request answers first…
    await act(async () => { respond('/api/users/1', 'Ann'); await Promise.resolve(); });   // …and the older one last
    return host.textContent;
  }

  it('the ignore flag keeps the newest response when an older one arrives last', async () => {
    expect(await raceOutcome(source('fetch-in-effect'))).toBe('Bob');
  });

  it('control: without the flag, the stale response wins (so the test can fail)', async () => {
    const unguarded = source('fetch-in-effect').replace('if (!ignore) ', '');
    expect(unguarded).not.toBe(source('fetch-in-effect'));
    expect(await raceOutcome(unguarded)).toBe('Ann');
  });
});

describe('StrictMode double effect card', () => {
  function track() {
    const log: string[] = [];
    let open = 0;
    const createConnection = (roomId: string) => ({
      connect: () => { open++; log.push(`connect ${roomId}`); },
      disconnect: () => { open--; log.push(`disconnect ${roomId}`); },
    });
    const Room = compile('useEffect', 'createConnection',
      `return function Room({ roomId }) {\n${source('strict-mode-double-effect')}\nreturn null;\n};`,
    )(useEffect, createConnection) as FC<{ roomId: string }>;
    return { log, open: () => open, Room };
  }

  it('StrictMode runs setup → cleanup → setup on mount; with cleanup, one connection stays open', () => {
    const { log, open, Room } = track();
    renderInto(<StrictMode><Room roomId="general" /></StrictMode>);
    expect(log).toEqual(['connect general', 'disconnect general', 'connect general']);
    expect(open()).toBe(1);
  });

  it('without StrictMode the effect runs once', () => {
    const { log, Room } = track();
    renderInto(<Room roomId="general" />);
    expect(log).toEqual(['connect general']);
  });
});

describe('HTML & CSS cards: DOM claims', () => {
  it('semantic-html: the <a> is in the tab order, the clickable <span> is not', () => {
    document.body.innerHTML = source('semantic-html');
    expect(document.querySelector('nav a')).toHaveProperty('tabIndex', 0);
    expect(document.querySelector('.nav span')).toHaveProperty('tabIndex', -1);
  });

  it('id-vs-class: a duplicate id is not an error, and getElementById returns the first', () => {
    document.body.innerHTML = '<p id="x">first</p><p id="x">second</p>';
    expect(document.getElementById('x')?.textContent).toBe('first');
    expect(LAST_MINUTE_CARDS.find(c => c.id === 'id-vs-class')?.watch).toMatch(/\*\*first\*\*/);
  });
});
