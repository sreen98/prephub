// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { transform } from '@babel/standalone';
import { templateCategories } from './playgroundTemplates';

/**
 * The template debounces the value that drives the filter, not the input. This
 * pins both halves: the list waits for a pause (and says so), and the INPUT
 * does not lag (debouncing the input itself is the mistake the Tips warn about).
 */
describe('Search Filter — the debounced value lags, the input does not', () => {
  it('filters once typing pauses, and flags the stale list meanwhile', async () => {
    vi.useFakeTimers();
    // @ts-expect-error test flag
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    const code = templateCategories
      .find(c => c.label === 'React Machine Coding')!
      .templates.find(t => t.name === 'Search Filter')!.code;

    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host, { onUncaughtError: () => {} });
    const out = transform(code, { presets: [['typescript', { isTSX: true, allExtensions: true }], 'react'] });
    const scope: Record<string, unknown> = {
      React, useState: React.useState, useEffect: React.useEffect,
      useMemo: React.useMemo, useRef: React.useRef,
      render: (el: React.ReactElement) => { void act(() => { root.render(el); }); },
    };
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(...Object.keys(scope), out.code ?? '');
    await act(async () => { fn(...Object.values(scope)); await Promise.resolve(); });

    const inputs = [...host.querySelectorAll('input')];
    expect(inputs, 'one search box').toHaveLength(1);

    const type = async (el: HTMLInputElement, text: string) => {
      for (const ch of text) {
        const next = el.value + ch;
        await act(async () => {
          // React installs its own `value` setter on the input instance, so
          // assigning el.value directly is invisible to it — go through the
          // prototype descriptor, then dispatch the event React listens for.
          // eslint-disable-next-line @typescript-eslint/unbound-method -- applied to `el` explicitly on the next line
          const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (setValue) Reflect.apply(setValue, el, [next]);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          await Promise.resolve();
        });
      }
    };

    const count = () => /Showing (\d+) of 12/.exec(host.textContent ?? '')?.[1];

    await type(inputs[0], 'phone');
    const midType = { count: count(), stale: host.textContent?.includes('searching') };
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    const settled = { count: count(), stale: host.textContent?.includes('searching') };

    console.log('mid-type :', midType);
    console.log('settled  :', settled);
    console.log('input    :', JSON.stringify(inputs[0].value));

    expect(midType).toEqual({ count: '12', stale: true });   // still the old list, flagged
    expect(settled).toEqual({ count: '3', stale: false });
    expect(inputs[0].value).toBe('phone');                     // the INPUT never lagged
    vi.useRealTimers();
  }, 30000);
});
