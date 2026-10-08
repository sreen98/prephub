// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import type React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { transform } from '@babel/standalone';
import { templateCategories, blankStarters } from './playgroundTemplates';
import { buildReactScope } from '../../lib/playgroundScope';
import { isHidden, scopesOf } from '../../lib/reactChecks';

/**
 * The React preview pane is always WHITE (`bg-white` in OutputPanel.tsx), while
 * the editor beside it is always dark. Templates written as if the page were
 * dark set `color: "#fff"` on their root and shipped white headings on a white
 * pane: unreadable, and invisible to every other test because nothing measured
 * colour. This mounts every React template and blank starter and measures the
 * WCAG contrast of each visible text run against the background it really
 * sits on.
 *
 * jsdom inherits `color` but not the browser defaults that matter here, so they
 * are modelled: a <button>/<input>/<select>/<textarea> resets text to black
 * and paints its own background, and h1-h3 count as large text.
 */

type RGBA = [number, number, number, number];
const PREVIEW_BG: RGBA = [255, 255, 255, 1];
const BLACK: RGBA = [0, 0, 0, 1];
const BUTTON_FACE: RGBA = [239, 239, 239, 1];
const CONTROLS = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']);

function parse(c: string): RGBA | null {
  const m = c.match(/^rgba?\(([^)]+)\)$/);
  if (!m) return c === 'transparent' ? [0, 0, 0, 0] : null;
  const p = m[1].split(',').map((x) => Number(x.trim()));
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
}
const over = (top: RGBA, under: RGBA): RGBA => {
  const a = top[3];
  return [top[0] * a + under[0] * (1 - a), top[1] * a + under[1] * (1 - a), top[2] * a + under[2] * (1 - a), 1];
};
const lum = ([r, g, b]: RGBA) => {
  const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: RGBA, b: RGBA) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const hex = (c: RGBA) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** Text colour: the nearest element that declares one; a form control without one resets to black. */
function textColour(el: Element): RGBA | null {
  for (let n: Element | null = el; n; n = n.parentElement) {
    const own = (n as HTMLElement).style?.color;
    if (own?.includes('var(')) return null;                             // a CSS variable: jsdom cannot resolve it
    const parent = n.parentElement;
    const declared = own || (parent && getComputedStyle(n).color !== getComputedStyle(parent).color);
    if (declared) return parse(getComputedStyle(n).color);
    if (CONTROLS.has(n.tagName)) return BLACK;
  }
  return BLACK;
}

/** Background: blend translucent layers down to the first opaque one, or the white pane. */
function background(el: Element): RGBA | null {
  const layers: RGBA[] = [];
  for (let n: Element | null = el; n; n = n.parentElement) {
    const s = getComputedStyle(n);
    const inline = (n as HTMLElement).style;
    if (inline && (inline.background + inline.backgroundColor).includes('var(')) return null;
    if (s.backgroundImage && s.backgroundImage !== 'none') return null;   // a gradient or image: not measurable
    let c = parse(s.backgroundColor);
    if (!c) return null;                                                  // var(--x) and friends
    if (c[3] === 0 && n.tagName === 'BUTTON' && !(n as HTMLElement).style.background) c = BUTTON_FACE;
    if (c[3] === 0 && CONTROLS.has(n.tagName) && n.tagName !== 'BUTTON' && !(n as HTMLElement).style.background) c = PREVIEW_BG;
    if (c[3] > 0) layers.push(c);
    if (c[3] >= 1) break;
  }
  return layers.reduceRight<RGBA>((under, top) => over(top, under), PREVIEW_BG);
}

function opacity(el: Element): number {
  let o = 1;
  for (let n: Element | null = el; n; n = n.parentElement) {
    const v = Number((n as HTMLElement).style?.opacity || 1);
    if (!Number.isNaN(v)) o *= v;
  }
  return o;
}

function fontPx(el: Element): number {
  for (let n: Element | null = el; n; n = n.parentElement) {
    const v = (n as HTMLElement).style?.fontSize;
    if (v && v.endsWith('px')) return parseFloat(v);
    if (/^H[1-3]$/.test(n.tagName)) return n.tagName === 'H3' ? 18.72 : 24;
  }
  return 16;
}
const bold = (el: Element) => {
  for (let n: Element | null = el; n; n = n.parentElement) {
    const w = (n as HTMLElement).style?.fontWeight;
    if (w) return w === 'bold' || Number(w) >= 700;
    if (/^(H[1-6]|B|STRONG|TH)$/.test(n.tagName)) return true;
  }
  return false;
};

const disabled = (el: Element) => !!el.closest(':disabled, [aria-disabled="true"]');

export interface ContrastFailure { text: string; fg: string; bg: string; ratio: number }

function audit(host: Element): ContrastFailure[] {
  const out: ContrastFailure[] = [];
  for (const scope of scopesOf(host)) {
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      const text = (t.textContent ?? '').trim();
      const el = t.parentElement;
      if (!text || !el || isHidden(el) || disabled(el) || ['STYLE', 'SCRIPT'].includes(el.tagName)) continue;
      const bg = background(el);
      const fgRaw = textColour(el);
      if (!bg || !fgRaw) continue;
      const fg = over([fgRaw[0], fgRaw[1], fgRaw[2], fgRaw[3] * opacity(el)], bg);
      const need = fontPx(el) >= 24 || (fontPx(el) >= 18.66 && bold(el)) ? 3 : 4.5;
      const r = ratio(fg, bg);
      if (r < need) out.push({ text: text.slice(0, 40), fg: hex(fg), bg: hex(bg), ratio: Math.round(r * 100) / 100 });
    }
  }
  return out;
}

async function mountAndAudit(code: string): Promise<ContrastFailure[]> {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host, { onUncaughtError: () => {} });
  const orig = console.error;
  console.error = () => {};
  try {
    const out = transform(code, { presets: [['typescript', { isTSX: true, allExtensions: true }], 'react'] });
    const scope = buildReactScope((el: React.ReactElement) => { void act(() => { root.render(el); }); });
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(...Object.keys(scope), out.code ?? '');
    await act(async () => { fn(...Object.values(scope)); await Promise.resolve(); });
    // Long enough for fake fetches and staged loads to land, so loaded content is measured too.
    await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
    return audit(host);
  } finally {
    console.error = orig;
    try { await act(async () => { root.unmount(); await Promise.resolve(); }); } catch { /* ignore */ }
    host.remove();
  }
}

describe('React previews are readable on the white preview pane', () => {
  it('every visible text run meets WCAG AA contrast (4.5:1, or 3:1 for large text)', async () => {
    // @ts-expect-error test flag
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = () => {};
    vi.stubGlobal('IntersectionObserver', class {
      observe() {} unobserve() {} disconnect() {} takeRecords() { return []; }
      root = null; rootMargin = ''; thresholds = [];
    });
    vi.stubGlobal('fetch', () => Promise.resolve({
      ok: true, status: 200, json: () => Promise.resolve([]), text: () => Promise.resolve(''),
    }));

    const sources = [
      ...templateCategories.flatMap((c) => c.templates).filter((t) => t.jsx).map((t) => ({ name: t.name, code: t.code })),
      ...blankStarters.filter((b) => b.lang === 'jsx').map((b) => ({ name: `blank starter: ${b.name}`, code: b.code })),
    ];
    expect(sources.length).toBeGreaterThan(40);

    const report: string[] = [];
    for (const s of sources) {
      const fails = await mountAndAudit(s.code);
      const seen = new Set<string>();
      for (const f of fails) {
        const key = `${f.fg} on ${f.bg}`;
        if (seen.has(key)) continue;
        seen.add(key);
        report.push(`${s.name}: "${f.text}" ${key} = ${f.ratio}:1`);
      }
    }
    vi.useRealTimers();
    expect(report).toEqual([]);
  }, 240000);
});
