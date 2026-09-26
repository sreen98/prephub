import { describe, it, expect, vi, beforeAll } from 'vitest';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { transform } from '@babel/standalone';
import { readFileSync } from 'node:fs';
import { templateCategories } from './playgroundTemplates';
import { reactChecks } from './reactChecks';
import type { ReactCheck } from './reactCheckTypes';
import { buildReactScope } from '../../lib/playgroundScope';
import { runReactChecks } from '../../lib/reactChecks';

/**
 * Every React challenge's behaviour checks must pass against its reference
 * template, or "Check" would fail a reader who copied the answer. Mounted in
 * jsdom with REAL timers: the runner waits the way it does in the browser.
 *
 * REACT_CHECKS_FILE=<json> runs a draft set of checks instead (used while
 * writing them), limited to the challenges in that file.
 */
const reactCategory = templateCategories.find((c) => c.label === 'React Machine Coding')!;
const draftFile = process.env.REACT_CHECKS_FILE;
const checks: Record<string, ReactCheck[]> = draftFile
  ? (JSON.parse(readFileSync(draftFile, 'utf8')) as Record<string, ReactCheck[]>)
  : reactChecks;

export function installJsdomStubs(): void {
beforeAll(() => {
  // @ts-expect-error test flag
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  // jsdom has no layout, so IntersectionObserver never fires on its own. This
  // stub fires it the way a browser would when an element scrolls into view:
  // the `scrollTo` step calls scrollIntoView on its target.
  const observers = new Set<{ cb: IntersectionObserverCallback; els: Set<Element>; self: IntersectionObserver }>();
  class StubObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly scrollMargin = '';
    readonly thresholds: readonly number[] = [];
    private entry: { cb: IntersectionObserverCallback; els: Set<Element>; self: IntersectionObserver };
    constructor(cb: IntersectionObserverCallback) { this.entry = { cb, els: new Set(), self: this }; observers.add(this.entry); }
    observe(el: Element) { this.entry.els.add(el); }
    unobserve(el: Element) { this.entry.els.delete(el); }
    disconnect() { this.entry.els.clear(); observers.delete(this.entry); }
    takeRecords(): IntersectionObserverEntry[] { return []; }
  }
  vi.stubGlobal('IntersectionObserver', StubObserver);
  const hit = (target: Element): IntersectionObserverEntry => {
    const rect = target.getBoundingClientRect();
    return { target, isIntersecting: true, intersectionRatio: 1, time: 0, boundingClientRect: rect, intersectionRect: rect, rootBounds: null };
  };
  Element.prototype.scrollIntoView = function (this: Element) {
    for (const o of observers) {
      const hits = [...o.els].filter((el) => el === this || this.contains(el) || el.contains(this));
      if (hits.length) o.cb(hits.map(hit), o.self);
    }
  };
  vi.stubGlobal('fetch', () => Promise.resolve({
    ok: true, status: 200, json: () => Promise.resolve([]), text: () => Promise.resolve(''),
  }));
});
}

/** Mount a template the way the playground does, returning its host and a remount. */
function mountTemplate(code: string) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  let element: ReactElement | null = null;
  const scope = buildReactScope((el) => { element = el; });
  const out = transform(code, { presets: [['typescript', { isTSX: true, allExtensions: true }], 'react'] });
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const program = new Function(...Object.keys(scope), out.code ?? '');
  let root: Root | null = null;
  // Like the playground's Check: re-run the whole program before each check, so
  // module-level stores start fresh too, then mount what it rendered.
  const reset = async () => {
    root?.unmount();
    host.innerHTML = '';
    element = null;
    (program as (...a: unknown[]) => void)(...Object.values(scope));
    root = createRoot(host, { onUncaughtError: () => {} });
    if (element) root.render(element);
    await new Promise((r) => setTimeout(r, 60));
  };
  const dispose = () => { root?.unmount(); host.remove(); };
  return { host, reset, dispose };
}

/** Register the tests for shard `index` of `count` (the checks run with real timers, so they are split across files to run in parallel). */
export function registerShard(index: number, count: number): void {
describe(`React challenge behaviour checks pass on the reference templates (${index + 1}/${count})`, () => {
  const names = Object.keys(checks).filter((_, i) => i % count === index);
  it.each(names.map((n) => [n] as const))('%s', async (name) => {
    const tpl = reactCategory.templates.find((t) => t.name === name);
    expect(tpl, `${name} is not a React machine-coding template`).toBeTruthy();
    const { host, reset, dispose } = mountTemplate(tpl!.code);
    try {
      const results = await runReactChecks(host, checks[name], reset);
      const failed = results.filter((r) => !r.passed).map((r) => `${r.label} (step ${r.failedStep}): ${r.message}`);
      expect(failed).toEqual([]);
    } finally { dispose(); }
  }, 60000);
});

if (index === 0) describe('coverage', () => {
  it.skipIf(!!draftFile)('every React machine-coding challenge has at least 3 checks', () => {
    const thin = reactCategory.templates.filter((t) => (reactChecks[t.name]?.length ?? 0) < 3).map((t) => t.name);
    expect(thin).toEqual([]);
  });
});
}
