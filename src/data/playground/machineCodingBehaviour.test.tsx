// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { transform } from '@babel/standalone';
import { templateCategories } from './playgroundTemplates';
import { safeRemove, safeSet } from '../../lib/storage';

/**
 * `reactTemplates.test.tsx` proves every template MOUNTS cleanly. That says
 * nothing about whether a template does what its TASK list promises, and the
 * promised behaviour is the whole point of a machine-coding reference: the
 * queue that stops toasts overlapping, the request coalescing that makes rapid
 * likes safe, the ref that makes an in-flight lock hold within one tick.
 * These drive each graded behaviour with real events and fake timers.
 */

const code = (name: string) => {
  const t = templateCategories
    .find((c) => c.label === 'React Machine Coding')
    ?.templates.find((x) => x.name === name);
  if (!t) throw new Error('missing template ' + name);
  return t.code;
};

let host: HTMLDivElement;
let root: Root;
let logs: string[];

async function mount(name: string) {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  logs = [];
  const out = transform(code(name), { presets: [['typescript', { isTSX: true, allExtensions: true }], 'react'] });
  const fakeConsole = { ...console, log: (...a: unknown[]) => { logs.push(a.map(String).join(' ')); } };
  const scope: Record<string, unknown> = {
    React,
    console: fakeConsole,
    render: (el: React.ReactElement) => { root.render(el); },
  };
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the template is the point
  const fn = new Function(...Object.keys(scope), out.code ?? '');
  await act(async () => { fn(...Object.values(scope)); await Promise.resolve(); });
}

const tick = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const buttons = () => [...host.querySelectorAll('button')];
const button = (text: string, orText?: string) => {
  const b = buttons().find((x) =>
    (x.textContent ?? '').includes(text) || x.getAttribute('aria-label') === text ||
    (orText !== undefined && (x.textContent ?? '').includes(orText)));
  if (!b) throw new Error('no button: ' + text);
  return b;
};
const click = (el: Element) => act(async () => { (el as HTMLElement).click(); await Promise.resolve(); });
const key = (el: Element, k: string) =>
  act(async () => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); await Promise.resolve(); });
const type = (input: HTMLInputElement, value: string) =>
  act(async () => {
    // Go through the prototype's setter, as a real keystroke does. Assigning
    // input.value directly updates React's own value tracker, so React would
    // see no change and never fire onChange.
    Reflect.set(HTMLInputElement.prototype, 'value', value, input);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await Promise.resolve();
  });
const submit = (form: Element) =>
  act(async () => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); await Promise.resolve(); });

beforeEach(() => {
  // @ts-expect-error test flag
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  Element.prototype.scrollIntoView = () => {};
});
afterEach(async () => {
  await act(async () => { root.unmount(); await Promise.resolve(); });
  host.remove();
  vi.useRealTimers();
});

describe('Toast / Snackbar', () => {
  it('queues beyond three, dedupes, and keeps the live region mounted when empty', async () => {
    await mount('Toast / Snackbar');
    const region = host.querySelector('[aria-live="polite"]');
    expect(region, 'live region exists before any toast').not.toBeNull();
    expect(region!.children.length).toBe(0);

    await click(button('Burst of 5'));
    expect(host.querySelectorAll('[aria-label="Dismiss notification"]').length).toBe(3);
    expect(region!.textContent).toContain('+2 waiting');

    await tick(3000);   // the first three expire; the queue moves up
    expect(region!.textContent).toContain('Upload 4 of 5');
    expect(region!.textContent).not.toContain('Upload 1 of 5');
  });

  it('does not stack a duplicate, and hovering pauses the countdown', async () => {
    await mount('Toast / Snackbar');
    await click(button('Duplicate test'));
    await click(button('Duplicate test'));
    expect(host.querySelectorAll('[aria-label="Dismiss notification"]').length).toBe(1);

    const toastEl = host.querySelector('.toast-in')!;
    await act(async () => { toastEl.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); await Promise.resolve(); });
    await tick(5000);
    expect(host.textContent).toContain('Same message twice');
    await act(async () => { toastEl.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })); await Promise.resolve(); });
    await tick(3100);
    expect(host.textContent).not.toContain('Same message twice');
  });

  it('can be called from plain code outside React', async () => {
    await mount('Toast / Snackbar');
    await click(button('Save (fails)'));
    await tick(450);
    expect(host.textContent).toContain('Could not save your profile');
  });
});

describe('Nested Comments (recursive replies)', () => {
  it('renders replies recursively and re-renders only the parent and the new reply', async () => {
    await mount('Nested Comments (recursive replies)');
    expect(host.textContent).toContain('Only if someone owns updating them.');   // depth 2
    logs.length = 0;

    const meera = [...host.querySelectorAll('li')].find((li) => li.textContent?.startsWith('Meera'))!;
    await click([...meera.querySelectorAll('button')].find((b) => b.textContent === 'Reply')!);
    const input = meera.querySelector('input')!;
    await type(input, 'I can own it.');
    logs.length = 0;
    await submit(meera.querySelector('form')!);

    expect(host.textContent).toContain('I can own it.');
    expect([...logs].sort()).toEqual(['rendered c100', 'rendered c3']);
  });

  it('collapses a branch', async () => {
    await mount('Nested Comments (recursive replies)');
    const hide = buttons().find((b) => b.textContent === 'Hide replies')!;
    expect(hide.getAttribute('aria-expanded')).toBe('true');
    await click(hide);
    expect(host.textContent).not.toContain('Yes, one set keeps');
    expect(host.textContent).toContain('Show 2 replies');
  });
});

describe('Sidebar Navigation (responsive + submenus)', () => {
  const link = (text: string) => [...host.querySelectorAll('a')].find((a) => a.textContent === text)!;
  const submenu = (label: string) => host.querySelector('#submenu-' + label.toLowerCase()) as HTMLElement;

  it('opens the section holding the current page, and hides collapsed links from Tab', async () => {
    await mount('Sidebar Navigation (responsive + submenus)');
    await click(button('desktop'));
    expect(link('Roles').getAttribute('aria-current')).toBe('page');
    expect(submenu('Team').style.visibility).toBe('visible');
    expect(submenu('Projects').style.visibility).toBe('hidden');
  });

  it('on mobile: the drawer opens, Escape closes it, and navigating closes it', async () => {
    await mount('Sidebar Navigation (responsive + submenus)');
    await click(button('mobile'));
    const aside = host.querySelector('aside')!;
    expect(aside.style.visibility).toBe('hidden');

    await click(button('Open menu'));
    expect(aside.style.visibility).toBe('visible');
    await key(document.body, 'Escape');
    expect(aside.style.visibility).toBe('hidden');

    await click(button('Open menu'));
    await click(link('Dashboard'));
    expect(aside.style.visibility).toBe('hidden');
    expect(host.textContent).toContain('You are on /dashboard');
  });
});

describe('Tabs', () => {
  it('arrow keys move selection and focus; removing the active tab falls back', async () => {
    await mount('Tabs');
    const tabs = () => [...host.querySelectorAll('[role="tab"]')] as HTMLElement[];
    expect(tabs().map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(tabs().map((t) => t.tabIndex)).toEqual([0, -1, -1]);

    await key(tabs()[0], 'ArrowRight');
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs()[1]);
    await key(tabs()[1], 'End');
    expect(tabs()[2].getAttribute('aria-selected')).toBe('true');
    await key(tabs()[2], 'ArrowRight');   // wraps
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');

    const panel = host.querySelector('[role="tabpanel"]')!;
    expect(panel.getAttribute('aria-labelledby')).toBe(tabs()[0].id);

    await click(button('Remove active tab'));
    expect(tabs().length).toBe(2);
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
  });
});

describe('Data Table (sort + filter + paginate)', () => {
  const firstCells = () => [...host.querySelectorAll('tbody tr')].map((tr) => tr.children[3]?.textContent);
  const header = (text: string) => [...host.querySelectorAll('th')].find((th) => th.textContent?.includes(text))!;

  it('cycles sort asc -> desc -> off and reports it with aria-sort', async () => {
    await mount('Data Table (sort + filter + paginate)');
    const th = header('Open tickets');
    await click(th.querySelector('button')!);
    expect(th.getAttribute('aria-sort')).toBe('ascending');
    const asc = firstCells().map(Number);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(asc[0]).toBe(0);
    await click(th.querySelector('button')!);
    expect(th.getAttribute('aria-sort')).toBe('descending');
    expect(Number(firstCells()[0])).toBe(Math.max(...Array.from({ length: 60 }, (_, i) => (i * 37) % 90)));
    await click(th.querySelector('button')!);
    expect(th.hasAttribute('aria-sort')).toBe(false);
  });

  it('a filter change returns to page 1', async () => {
    await mount('Data Table (sort + filter + paginate)');
    await click(button('Next'));
    await click(button('Next'));
    expect(host.textContent).toContain('Page 3 of 6');
    await type(host.querySelector('input')!, 'asha');
    expect(host.textContent).toMatch(/Page 1 of 1 \(5 rows\)/);
    expect(host.textContent).toContain('q=asha');
  });
});

describe('Like Button (optimistic + rollback)', () => {
  const like = () => button('Like');

  it('rapid clicks follow instantly but send at most two requests, ending on the last choice', async () => {
    await mount('Like Button (optimistic + rollback)');
    for (let i = 0; i < 5; i++) await click(like());
    expect(like().getAttribute('aria-pressed')).toBe('true');   // odd number of clicks
    expect(like().textContent).toContain('42');
    await tick(2000);
    expect(host.textContent).toContain('Requests sent: 1');
    expect(like().textContent).toContain('42');

    // A second burst: the first click sends at once, the other three only change
    // what the user wants, so one catch-up request settles it. Two, not four.
    for (let i = 0; i < 4; i++) await click(like());
    await tick(2000);
    expect(like().getAttribute('aria-pressed')).toBe('true');
    expect(like().textContent).toContain('42');
    expect(host.textContent).toContain('Requests sent: 3');
  });

  it('rolls back to the last confirmed state on failure', async () => {
    await mount('Like Button (optimistic + rollback)');
    await click(button('Make the next request fail'));
    await click(like());
    expect(like().getAttribute('aria-pressed')).toBe('true');
    await tick(700);
    expect(like().getAttribute('aria-pressed')).toBe('false');
    expect(like().textContent).toContain('41');
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('undone');
  });
});

describe('Rate-Limited Button (throttle vs lock)', () => {
  const calls = (label: string) =>
    Number([...host.querySelectorAll('span')].find((s) => s.textContent?.startsWith(label + ':'))!.querySelector('strong')!.textContent);

  it('five fast clicks: 5 calls unguarded, 1 throttled, 1 locked', async () => {
    await mount('Rate-Limited Button (throttle vs lock)');
    for (let i = 0; i < 5; i++) {
      await click(button('Save (no guard)'));
      await click(button('Refresh (throttle 1 s)'));
      await click(button('Pay (in-flight lock)', 'Saving'));
      await tick(100);
    }
    expect(calls('No guard')).toBe(5);
    expect(calls('Throttled')).toBe(1);
    expect(calls('Locked')).toBe(1);
  });

  it('the lock holds for two clicks in the same tick, before any re-render', async () => {
    await mount('Rate-Limited Button (throttle vs lock)');
    const pay = button('Pay (in-flight lock)');
    await act(async () => { pay.click(); pay.click(); await Promise.resolve(); });
    await tick(900);
    expect(calls('Locked')).toBe(1);
  });
});

describe('Chat App', () => {
  it('loads history, sends with status, receives without duplicates, and shows typing', async () => {
    await mount('Chat App');
    expect(host.textContent).toContain('Loading messages…');
    await tick(650);
    expect(host.textContent).toContain('Did the deploy go out?');

    const input = host.querySelector('input[aria-label="Message"]') as HTMLInputElement;
    await type(input, 'Ship it');
    await submit(host.querySelector('form')!);
    expect(host.textContent).toContain('Sending…');
    await tick(450);
    expect(host.textContent).toContain('Sent');
    await tick(400);
    expect(host.textContent).toContain('Alex is typing…');
    await tick(1200);
    expect(host.textContent).toContain('Got it: Ship it');
    expect(host.textContent).not.toContain('is typing');
    expect(host.textContent.split('Ship it').length - 1).toBe(2);   // our bubble + Alex's echo, once each
  });

  it('a failed send shows Retry, and retrying reuses the same bubble', async () => {
    await mount('Chat App');
    await tick(650);
    await click(button('Make the next message fail'));
    await type(host.querySelector('input[aria-label="Message"]') as HTMLInputElement, 'Hello?');
    await submit(host.querySelector('form')!);
    await tick(450);
    expect(host.textContent).toContain('Not sent.');
    await click(button('Retry'));
    await tick(450);
    expect(host.textContent).not.toContain('Not sent.');
    expect(host.textContent.split('Hello?').length - 1).toBe(1);
  });
});

describe('Accordion', () => {
  it('single-open closes the others; closed panels are hidden from Tab; arrows move focus', async () => {
    await mount('Accordion');
    const [single] = [...host.querySelectorAll('h2 + div')] as HTMLElement[];
    const headers = () => [...single.querySelectorAll('button[aria-expanded]')] as HTMLElement[];
    const panels = () => [...single.querySelectorAll('[role="region"]')] as HTMLElement[];

    expect(headers().map((h) => h.getAttribute('aria-expanded'))).toEqual(['true', 'false', 'false']);
    expect(panels().map((p) => p.style.visibility)).toEqual(['visible', 'hidden', 'hidden']);

    await click(headers()[1]);
    expect(headers().map((h) => h.getAttribute('aria-expanded'))).toEqual(['false', 'true', 'false']);

    headers()[0].focus();
    await key(headers()[0], 'ArrowUp');   // wraps to the last
    expect(document.activeElement).toBe(headers()[2]);
  });

  it('multi-open keeps several open', async () => {
    await mount('Accordion');
    const multi = ([...host.querySelectorAll('h2 + div')] as HTMLElement[])[1];
    const headers = [...multi.querySelectorAll('button[aria-expanded]')] as HTMLElement[];
    await click(headers[0]);
    await click(headers[2]);
    expect(headers.map((h) => h.getAttribute('aria-expanded'))).toEqual(['true', 'false', 'true']);
  });
});

describe('Shopping Cart (reducer + derived totals)', () => {
  const add = (name: string) => {
    const row = [...host.querySelectorAll('div')].find((d) => d.firstElementChild?.textContent?.startsWith(name) && d.querySelector('button'));
    return click(row!.querySelector('button')!);
  };
  const total = () => host.querySelector('[data-testid="total"]')!.textContent;

  beforeEach(() => { safeRemove('demo-cart'); });

  it('merges repeat adds, clamps to stock, and totals in cents', async () => {
    await mount('Shopping Cart (reducer + derived totals)');
    await add('Wireless Mouse');
    await add('Wireless Mouse');
    expect(host.querySelector('[aria-label="Wireless Mouse quantity"]')!.textContent).toBe('2');
    expect(host.querySelector('[aria-label^="Cart,"]')!.getAttribute('aria-label')).toBe('Cart, 2 items');

    await add('Mechanical Keyboard');
    await add('Mechanical Keyboard');
    await add('Mechanical Keyboard');   // stock is 2
    expect(host.querySelector('[aria-label="Mechanical Keyboard quantity"]')!.textContent).toBe('2');
    expect(button('Max in cart')).toBeTruthy();

    // 2 × 19.99 + 2 × 89.50 = 218.98; tax 8% = 17.52 (rounded once); total 236.50
    expect(total()).toBe('$236.50');

    await type(host.querySelector('input[aria-label="Discount code"]') as HTMLInputElement, 'save10');
    await submit(host.querySelector('form')!);
    // discount 21.90 → 197.08; tax 15.77 → 212.85
    expect(total()).toBe('$212.85');

    await click(button('Decrease Wireless Mouse'));
    await click(button('Decrease Wireless Mouse'));   // cannot go below 1
    expect(host.querySelector('[aria-label="Wireless Mouse quantity"]')!.textContent).toBe('1');
  });

  it('survives a reload, and ignores corrupt saved data', async () => {
    await mount('Shopping Cart (reducer + derived totals)');
    await add('USB-C Cable');
    await act(async () => { root.unmount(); await Promise.resolve(); });
    host.remove();

    await mount('Shopping Cart (reducer + derived totals)');
    expect(host.querySelector('[aria-label="USB-C Cable quantity"]')!.textContent).toBe('1');
    await act(async () => { root.unmount(); await Promise.resolve(); });
    host.remove();

    safeSet('demo-cart', '{not json');
    await mount('Shopping Cart (reducer + derived totals)');
    expect(host.textContent).toContain('Your cart is empty.');
  });
});

describe('File Upload (progress + cancel)', () => {
  const row = (name: string) => [...host.querySelectorAll('li')].find((li) => li.textContent?.includes(name))!;

  it('reports progress, finishes, and rejects a wrong type without uploading', async () => {
    await mount('File Upload (progress + cancel)');
    await click(button('Sample image'));
    await tick(160);
    const bar = () => row('photo.png').querySelector('[role="progressbar"]')!;
    expect(bar().getAttribute('aria-valuenow')).toBe('20');
    await tick(1000);
    expect(bar().getAttribute('aria-valuenow')).toBe('100');
    expect(row('photo.png').textContent).toContain('done');

    await click(button('Wrong file type'));
    expect(row('notes.txt').textContent).toContain('Only PNG, JPEG or PDF files');
    expect(row('notes.txt').querySelector('[role="progressbar"]')).toBeNull();
  });

  it('cancel stops it without an error; a server failure offers Retry', async () => {
    await mount('File Upload (progress + cancel)');
    await click(button('Sample image'));
    await tick(160);
    await click(button('Cancel'));
    expect(row('photo.png').textContent).toContain('cancelled');
    expect(row('photo.png').textContent).not.toContain('failed');

    await click(button('File the server rejects'));
    await tick(1000);
    expect(row('will-fail.pdf').textContent).toContain('Upload failed (500)');
    expect(row('will-fail.pdf').querySelector('button')!.textContent).toBe('Retry');
  });
});
