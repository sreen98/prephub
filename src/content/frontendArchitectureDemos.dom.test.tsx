// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { buildReactScope } from '../lib/playgroundScope';
import { transform } from '@babel/standalone';

/**
 * Frontend Architecture §7 says its live-prices demo receives thousands of
 * events but renders about ten times a second. Mount the block the way Try it
 * does (the playground appends render(<LastComponent />)) and hold it to that.
 */
const md = readFileSync('src/content/front-end/frontend-architecture-guide.md', 'utf8').replace(/\r\n/g, '\n');

function block(marker: string): string {
  const i = md.indexOf(marker);
  if (i < 0) throw new Error('marker not found: ' + marker);
  if (md.indexOf(marker, i + 1) >= 0) throw new Error('marker is not unique: ' + marker);
  const fence = md.lastIndexOf('\n```', i);
  const start = md.indexOf('\n', fence + 1) + 1;
  return md.slice(start, md.indexOf('\n```', i));
}

let host: HTMLDivElement | undefined;
let root: Root | undefined;
let errors: string[];

beforeEach(() => {
  // @ts-expect-error test flag
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
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

describe('Frontend Architecture §7 — the live-prices demo', () => {
  it('receives thousands of events but renders about ten times a second', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    host = el;
    const r = createRoot(el);
    root = r;
    const src = block('function LivePrices() {') + '\nrender(<LivePrices />);';
    const out = transform(src, { presets: ['react'] });
    const scope: Record<string, unknown> = {
      ...buildReactScope((node: ReactElement) => { r.render(node); }),
      console: { log: () => {}, warn: () => {}, error: (...a: unknown[]) => { errors.push(String(a[0])); } },
    };
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- mounting the guide's own snippet is the point
    const fn = new Function(...Object.keys(scope), out.code ?? '');
    await act(async () => { fn(...Object.values(scope)); await Promise.resolve(); });

    // One simulated second, in small steps so React commits between timers.
    for (let t = 0; t < 1000; t += 10) await act(async () => { await vi.advanceTimersByTimeAsync(10); });

    const m = /(\d+) events received, (\d+) renders/.exec(el.textContent ?? '');
    expect(m, 'the counter line rendered').not.toBeNull();
    const [events, renders] = [Number(m![1]), Number(m![2])];
    expect(events).toBeGreaterThan(1500);
    expect(renders).toBeGreaterThanOrEqual(8);
    expect(renders).toBeLessThanOrEqual(11);
    expect(el.querySelectorAll('li')).toHaveLength(4);
  });
});
