// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * CSS Fundamentals Tricky Q9 is a selector-matching claim, which jsdom can check. The
 * guide's size and position claims need a layout engine; they were measured in headless
 * Edge (Blink) before shipping, as CLAUDE.md describes.
 */
const guide = readFileSync('src/content/front-end/css-fundamentals-guide.md', 'utf8').replace(/\r\n/g, '\n');

/** The fenced block of `lang` containing `marker`. */
function block(lang: string, marker: string): string {
  const i = guide.indexOf(marker);
  expect(i, `marker not found: ${marker}`).toBeGreaterThan(-1);
  expect(guide.indexOf(marker, i + 1), `marker is not unique: ${marker}`).toBe(-1);
  const start = guide.lastIndexOf('```' + lang + '\n', i) + lang.length + 4;
  return guide.slice(start, guide.indexOf('```', start));
}

describe('CSS Fundamentals — Tricky Q9', () => {
  const page = new DOMParser().parseFromString(block('html', '<p class="a">First paragraph</p>'), 'text/html');
  const css = block('css', '.intro p:first-child   { color: red; }');
  const selectors = [...css.matchAll(/^(\S.*?)\s*\{/gm)].map((m) => m[1]);

  it('the guide declares the two rules being compared', () => {
    expect(selectors).toEqual(['.intro p:first-child', '.intro p:first-of-type']);
  });

  it('p:first-child matches nothing, because the h2 comes first', () => {
    expect(page.querySelectorAll(selectors[0])).toHaveLength(0);
  });

  it('p:first-of-type matches paragraph a', () => {
    expect([...page.querySelectorAll(selectors[1])].map((p) => p.className)).toEqual(['a']);
  });

  // :nth-child(1 of p) is measured in Blink only: jsdom's selector engine doesn't support `of S`.
  it('the h2 + p alternative matches paragraph a too', () => {
    expect(page.querySelector('.intro h2 + p')?.className).toBe('a');
  });
});
