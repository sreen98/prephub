// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { buildReactScope } from '../lib/playgroundScope';
import { transform } from '@babel/standalone';

/**
 * React Q2, Q11, Q66–Q83, §16.11 (React 19.3) and Redux Q19 each carry a runnable example, and most
 * state what it prints. These pull each block out of the markdown by a marker
 * line and run it — the JSX ones mounted in jsdom the way the playground mounts
 * them — so an answer can never claim an output its own Try it button disproves.
 */

const reactGuide = readFileSync('src/content/front-end/react-guide.md', 'utf8');
const reduxGuide = readFileSync('src/content/front-end/redux-toolkit-guide.md', 'utf8');

/** The fenced block containing `marker`. */
function block(md: string, marker: string): string {
  const i = md.indexOf(marker);
  if (i < 0) throw new Error('marker not found: ' + marker);
  if (md.indexOf(marker, i + 1) >= 0) throw new Error('marker is not unique: ' + marker);
  const fence = md.lastIndexOf('\n```', i);
  const start = md.indexOf('\n', fence + 1) + 1;
  return md.slice(start, md.indexOf('\n```', i));
}

let logs: string[];
let errors: string[];
const fakeConsole = () => ({
  log: (...a: unknown[]) => { logs.push(a.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ')); },
  error: (...a: unknown[]) => { errors.push(String(a[0])); },
  warn: () => {},
});

function runJs(src: string) {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- running the guide's own snippet is the point
  new Function('console', src)(fakeConsole());
}

let host: HTMLDivElement | undefined;
let root: Root | undefined;

async function mountTsx(src: string) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  host = el;
  const r = createRoot(el);
  root = r;
  const out = transform(src, { presets: [['typescript', { isTSX: true, allExtensions: true }], 'react'] });
  // Exactly the names the playground's Try it provides, plus a captured console.
  const scope: Record<string, unknown> = {
    ...buildReactScope((node: React.ReactElement) => { r.render(node); }),
    console: fakeConsole(),
  };
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- mounting the guide's own snippet is the point
  const fn = new Function(...Object.keys(scope), out.code ?? '');
  await act(async () => { fn(...Object.values(scope)); await Promise.resolve(); });
}

const tick = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
/** Advance in small steps, each in its own act, so React commits and schedules
 *  the next effect between timers. One big advance runs only the first timer. */
const settle = async (ms: number, step = 10) => { for (let t = 0; t < ms; t += step) await tick(step); };
const click = (text: string) => act(async () => {
  const b = [...host!.querySelectorAll('button')].find((x) => x.textContent === text);
  if (!b) throw new Error('no button ' + text);
  b.click();
  await Promise.resolve();
});

beforeEach(() => {
  // @ts-expect-error test flag
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  logs = [];
  errors = [];
});
afterEach(async () => {
  const mounted = root;
  if (mounted) await act(async () => { mounted.unmount(); await Promise.resolve(); });
  host?.remove();
  root = undefined;
  host = undefined;
  vi.useRealTimers();
  expect(errors, 'no console.error from the example').toEqual([]);
});

describe('React guide — examples print what the answers claim', () => {
  it('Q2 — state, context and props in one example mounts cleanly', async () => {
    await mountTsx(block(reactGuide, "const ThemeContext = React.createContext('light');"));
    expect(host!.textContent).toContain('Save (dark)');
    await click('Switch theme');
    expect(host!.textContent).toContain('Save (light)');
  });

  it('Q11 — a child passed as children skips its wrapper\'s re-renders', async () => {
    await mountTsx(block(reactGuide, 'function Ticker({ children }) {'));
    await settle(200);
    expect(logs).toEqual(['render inside', 'render as children', 'render inside', 'render inside', 'render inside']);
  });

  it('Q66 — memo skips equal primitives, and an inline object defeats it', async () => {
    await mountTsx(block(reactGuide, 'const MemoisedWithObject = React.memo('));
    await settle(50);
    expect(logs).toEqual([
      'Plain renders', 'Memoised renders', 'MemoisedWithObject renders',
      'Plain renders', 'MemoisedWithObject renders',
      'Plain renders', 'MemoisedWithObject renders',
    ]);
  });

  it('Q67 — lifted state is shared by both siblings', async () => {
    await mountTsx(block(reactGuide, 'function ResultCount({ query }) {'));
    expect(host!.textContent).toContain('4 matching fruits');
    const input = host!.querySelector('input')!;
    await act(async () => {
      Reflect.set(HTMLInputElement.prototype, 'value', 'ap', input);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
    });
    expect(host!.textContent).toContain('2 matching fruits');   // apple, grape
  });

  it('Q68 — each of the four states renders, and Try again reloads', async () => {
    await mountTsx(block(reactGuide, 'function useUsers(outcome) {'));
    expect(host!.textContent).toContain('Loading users…');
    await tick(650);
    expect(host!.textContent).toContain('Meera');
    await click('empty');
    await tick(650);
    expect(host!.textContent).toContain('No users yet');
    await click('error');
    await tick(650);
    expect(host!.querySelector('[role="alert"]')?.textContent).toContain('Server returned 500');
    await click('Try again');
    expect(host!.textContent).toContain('Loading users…');
  });

  it('Q69 — the waiting message changes at 3 s and 8 s, and Cancel ends it', async () => {
    await mountTsx(block(reactGuide, 'function useWaitingMessage(isWaiting) {'));
    expect(host!.textContent).toContain('Loading your report…');
    await tick(3100);
    expect(host!.textContent).toContain('taking longer than usual');
    await tick(5000);
    expect(host!.textContent).toContain('Still working');
    await click('Cancel');
    expect(host!.textContent).toContain('Report ready.');
  });

  it('Q70 — leaving the page aborts the request, and the AbortError is not shown as a failure', async () => {
    await mountTsx(block(reactGuide, 'function ReportPage() {'));
    await settle(500);
    expect(logs).toEqual(['user navigates away', 'request cancelled, nothing to show']);
    expect(host!.textContent).toBe('Home');
  });

  it('Q71 — three simultaneous 401s share one refresh', async () => {
    runJs(block(reactGuide, 'let refreshing = null;'));
    await vi.advanceTimersByTimeAsync(200);
    expect(logs).toEqual(['/orders ok, /profile ok, /cart ok', 'refresh calls: 1']);
  });

  it('Q72 — both Spring Boot error shapes become one message', () => {
    runJs(block(reactGuide, 'function toAppError(status, body = {}) {'));
    expect(logs).toEqual(['Order 42 does not exist', 'Internal Server Error', 'Request failed']);
  });

  it('Q73 — Content-Disposition parsing prefers filename*', () => {
    runJs(block(reactGuide, 'function filenameFromDisposition(header) {'));
    expect(logs).toEqual(['orders-2026-09.csv', 'naïve.csv', 'null']);
  });
});

describe('Redux Toolkit guide Q19 — the flow prints in order', () => {
  it('prints steps 1 to 5', () => {
    runJs(block(reduxGuide, "function cartReducer(state = { items: 0 }, action) {"));
    expect(logs).toEqual([
      '1. user clicks "Add to cart"',
      '2. dispatch cart/itemAdded',
      '3. reducer computes the next state',
      '4. store now holds {"items":2}',
      '5. component re-renders showing 2 items',
    ]);
  });
});

describe('React guide Q74–Q82 — rendering, patterns and everyday pitfalls', () => {
  const typeInto = (input: HTMLInputElement, value: string) => act(async () => {
    Reflect.set(HTMLInputElement.prototype, 'value', value, input);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await Promise.resolve();
  });

  it('Q74 — StrictMode runs setup, cleanup, setup in development', async () => {
    await mountTsx(block(reactGuide, "console.log('connect to', roomId);"));
    expect(logs).toEqual(['connect to general', 'disconnect from general', 'connect to general']);
  });

  it('Q75 — two setters in a timeout produce one render', async () => {
    await mountTsx(block(reactGuide, "setName('Asha');       // no render yet"));
    await settle(100);
    expect(logs).toEqual(['render {"name":"","age":0}', 'render {"name":"Asha","age":30}']);
  });

  it('Q75 — flushSync makes the new item visible to the next line', async () => {
    Element.prototype.scrollIntoView = () => {};
    await mountTsx(block(reactGuide, "// In a real file: import { flushSync } from 'react-dom';"));
    await click('Add');
    expect(logs).toEqual(['items in the DOM: 2']);
  });

  it('Q76 — a click inside a portal bubbles to its React parent, not its DOM parent', async () => {
    await mountTsx(block(reactGuide, "console.log('section heard the click')"));
    const button = [...host!.querySelectorAll('button')].find((b) => b.textContent === 'Click me')!;
    expect(host!.querySelector('section')!.contains(button)).toBe(false);   // elsewhere in the DOM
    await click('Click me');
    expect(logs).toEqual(['button clicked', 'section heard the click']);
  });

  it('Q77 — count && renders 0; the three safe forms do not', async () => {
    await mountTsx(block(reactGuide, '{count && <Badge count={count} />}'));
    expect(host!.textContent).toBe('Inbox0');
    await act(async () => { root!.unmount(); await Promise.resolve(); });
    host!.remove();
    await mountTsx(block(reactGuide, '{/* a real boolean */}'));
    expect(host!.textContent).not.toContain('0');
  });

  it('Q78 — the action returns errors as state and resets the form after success', async () => {
    await mountTsx(block(reactGuide, 'async function signUp(previousState, formData) {'));
    const form = host!.querySelector('form')!;
    const input = () => host!.querySelector('input[name="username"]') as HTMLInputElement;
    const submitWith = async (value: string) => {
      await typeInto(input(), value);
      await act(async () => { form.requestSubmit(); await Promise.resolve(); });
      await settle(400, 50);
    };
    await submitWith('ab');
    expect(host!.querySelector('[role="alert"]')?.textContent).toBe('At least 3 characters');
    await submitWith('admin');
    expect(host!.querySelector('[role="alert"]')?.textContent).toBe('That username is taken');
    expect(input().value).toBe('admin');           // passed back through defaultValue
    await submitWith('Asha');
    expect(host!.textContent).toContain('Welcome, Asha!');
    expect(input().value).toBe('');                // reset after a successful action
  });

  it('Q79 — the typed example runs once types are stripped', async () => {
    await mountTsx(block(reactGuide, 'type ListProps<T> = {'));
    expect(host!.textContent).toContain('Asha');
    expect(host!.textContent).toContain('2 people');
  });

  it('Q80 — compound components share state through context', async () => {
    await mountTsx(block(reactGuide, 'const DisclosureContext = React.createContext(null);'));
    const panel = () => host!.querySelector('[hidden]');
    expect(panel()).not.toBeNull();
    await click('Shipping details');
    expect(panel()).toBeNull();
    expect(host!.querySelector('h3 button')!.getAttribute('aria-expanded')).toBe('true');
  });

  it('Q81 — the stale interval sticks at 1', async () => {
    await mountTsx(block(reactGuide, 'setCount(count + 1);          // "count" is the value from the FIRST render'));
    await settle(3500, 100);
    expect(host!.textContent).toBe('1');
  });

  it('Q82 — a component defined inside another remounts its input; the top-level one does not', async () => {
    await mountTsx(block(reactGuide, '// ❌ A new component function on every render of Form'));
    let before = host!.querySelector('input')!;
    before.focus();
    await typeInto(before, 'a');
    expect(host!.querySelector('input')).not.toBe(before);      // a brand-new element
    expect(document.activeElement).not.toBe(host!.querySelector('input'));
    await act(async () => { root!.unmount(); await Promise.resolve(); });
    host!.remove();

    await mountTsx(block(reactGuide, 'function NameField({ value, onChange }) {'));
    before = host!.querySelector('input')!;
    before.focus();
    await typeInto(before, 'a');
    expect(host!.querySelector('input')).toBe(before);
    expect(document.activeElement).toBe(before);
    expect(host!.textContent).toContain('Hello a');
  });
});

describe('React guide §16.11 — the React 19.3 examples run on the installed React', () => {
  it('is actually React 19.3 or later', () => {
    const [major, minor] = React.version.split('.').map(Number);
    expect(major > 19 || (major === 19 && minor >= 3), `React ${React.version}`).toBe(true);
  });

  it('<ViewTransition> + startTransition: Next moves to the next slide', async () => {
    // jsdom gap, stubbed rather than tolerated: every browser has CSS.escape and
    // React's ViewTransition uses it to build view-transition names. jsdom has no
    // document.startViewTransition either, so React commits without animating.
    if (typeof globalThis.CSS === 'undefined' || typeof globalThis.CSS.escape !== 'function') {
      vi.stubGlobal('CSS', { escape: (v: string) => String(v).replace(/[^a-zA-Z0-9_-]/g, (c) => '\\' + c) });
    }
    await mountTsx(block(reactGuide, "const PHOTOS = ["));
    expect(host!.textContent).toContain('Mountains');
    await click('Next');
    await settle(100);
    expect(host!.textContent).toContain('Forest');
    expect(host!.textContent).not.toContain('Mountains');
  });

  it('Fragment ref: focus() lands on the first focusable child', async () => {
    await mountTsx(block(reactGuide, 'function Results({ items }) {'));
    await settle(20);
    expect(document.activeElement?.textContent).toBe('First result');
  });

  it('use(browser()) does not suspend in the browser', async () => {
    await mountTsx(block(reactGuide, 'function LocalTime() {'));
    await settle(20);
    expect(host!.textContent).toContain('Your time zone:');
    expect(host!.textContent).not.toContain('Loading your time zone');
  });
});
