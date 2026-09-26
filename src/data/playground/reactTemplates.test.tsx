// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import type React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { transform } from '@babel/standalone';
import { templateCategories } from './playgroundTemplates';
import { buildReactScope } from '../../lib/playgroundScope';

/** Mounts, lets the fake session resolve, then clicks a nav button by label. */
async function mount(code: string, clickLabel?: string): Promise<string[]> {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host, { onUncaughtError: () => {} });
  const msgs: string[] = [];
  const orig = console.error;
  console.error = (...a: unknown[]) => { msgs.push(String(a[0])); };
  try {
    const out = transform(code, { presets: [['typescript', { isTSX: true, allExtensions: true }], 'react'] });
    // The playground's REAL scope. A hand-written one here hid that `Client Cache`
    // declared `const cache`, which collides with React's own `cache` export
    // (a SyntaxError the moment the reader pressed Run).
    const scope = buildReactScope((el: React.ReactElement) => { void act(() => { root.render(el); }); });
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(...Object.keys(scope), out.code ?? '');
    await act(async () => { fn(...Object.values(scope)); await Promise.resolve(); });
    // The template restores a fake session on a 700ms timer; until it settles
    // the gate renders "Checking session…" and never reaches the redirect.
    await act(async () => { await vi.advanceTimersByTimeAsync(800); });
    if (clickLabel) {
      const btn = [...host.querySelectorAll('button')].find(b => b.textContent?.includes(clickLabel));
      if (!btn) throw new Error('no button matching ' + clickLabel);
      await act(async () => { btn.click(); await Promise.resolve(); });
    }
  } finally {
    console.error = orig;
    try { await act(async () => { root.unmount(); await Promise.resolve(); }); } catch { /* ignore */ }
    host.remove();
  }
  return msgs;
}

/**
 * Mounting every React machine-coding template and asserting the console stays
 * clean. This is the React counterpart of `playgroundExecutable.test.ts`, which
 * runs every JS solution — and it exists because a reader hit
 * "Cannot update a component (App) while rendering a different component
 * (Protected)" in the Protected Route template. That block parsed fine, so
 * `verify:blocks` passed; it only misbehaves once mounted and interacted with.
 *
 * jsdom gaps are stubbed rather than tolerated: scrollIntoView and
 * IntersectionObserver simply do not exist there, and without stubs three
 * templates throw for reasons that say nothing about the template.
 */
describe('every React template mounts without console errors', () => {
  it('sweeps the whole category', async () => {
    // @ts-expect-error test flag
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    Element.prototype.scrollIntoView = () => {};
    vi.stubGlobal('IntersectionObserver', class {
      observe() {} unobserve() {} disconnect() {} takeRecords() { return []; }
      root = null; rootMargin = ''; thresholds = [];
    });
    vi.stubGlobal('fetch', () => Promise.resolve({
      ok: true, status: 200, json: () => Promise.resolve([]), text: () => Promise.resolve(''),
    }));

    const cat = templateCategories.find(c => c.label === 'React Machine Coding');
    expect(cat, 'React Machine Coding category').toBeTruthy();

    const noisy: string[] = [];
    for (const t of cat?.templates ?? []) {
      const msgs = await mount(t.code);
      const real = msgs.filter(m => !/not wrapped in act/.test(m));
      if (real.length) noisy.push(`${t.name}: ${[...new Set(real)][0].slice(0, 160)}`);
    }
    expect(noisy).toEqual([]);
  }, 180000);
});

describe('Protected Route — the redirect-during-render fix', () => {
  // @ts-expect-error test flag
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  const code = templateCategories
    .find(c => c.label === 'React Machine Coding')!
    .templates.find(t => t.name === 'Protected Route (Auth + RBAC)')!.code;

  it('warns when the redirect is called during render (the reported bug)', async () => {
    // Reverse the fix in memory — never on disk.
    const broken = code.replace(
      "if (status === 'anonymous') return <Redirect to=\"login\" onRedirect={onRedirect} />;",
      "if (status === 'anonymous') { onRedirect('login'); return null; }",
    );
    expect(broken, 'reversal must actually apply').not.toBe(code);
    const msgs = await mount(broken, 'Admin');
    expect(msgs.join('\n')).toMatch(/Cannot update a component/);
  }, 30000);

  it('is silent as shipped', async () => {
    const msgs = await mount(code, 'Admin');
    expect(msgs.filter(m => !/not wrapped in act/.test(m))).toEqual([]);
  }, 30000);
});
