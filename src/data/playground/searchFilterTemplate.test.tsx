// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { transform } from '@babel/standalone';
import { templateCategories } from './playgroundTemplates';

/**
 * The template's notes make a measurable claim — "the debounced panel runs the
 * filter fewer times" — and a teaching claim is only worth making if it is
 * true. This pins both halves: the debounced value lags, and the INPUT does
 * not (debouncing the input itself is the mistake the template warns about).
 */
describe('Search Filter — both options behave as documented', () => {
  it('instant filters per keystroke; debounced waits for quiet', async () => {
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
    expect(inputs, 'two panels').toHaveLength(2);

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

    const runsOf = (i: number) => {
      const panel = host.querySelectorAll('div[style]')[0].children[i] as HTMLElement;
      const m = /filters run (\d+)/.exec(panel.textContent ?? '');
      return m ? Number(m[1]) : -1;
    };

    await type(inputs[0], 'phone');
    await type(inputs[1], 'phone');
    const instantRuns = runsOf(0);
    const debouncedBefore = runsOf(1);

    // Nothing has settled yet on the debounced side.
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    const debouncedAfter = runsOf(1);

    console.log('instant filter runs      :', instantRuns);
    console.log('debounced runs, mid-type :', debouncedBefore);
    console.log('debounced runs, settled  :', debouncedAfter);
    console.log('input value still live   :', JSON.stringify(inputs[1].value));

    expect(instantRuns).toBeGreaterThan(debouncedBefore);
    expect(inputs[1].value).toBe('phone');       // the INPUT never lagged
    vi.useRealTimers();
  }, 30000);
});
