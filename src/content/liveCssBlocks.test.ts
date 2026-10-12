import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { parseLiveCss } from '../lib/liveCss';
import LiveCssBlock from '../features/content/LiveCssBlock';

/**
 * Every ```css-live block in every guide: it must split into CSS and HTML, carry no
 * script (the preview is sandboxed, but a block that relies on one would show nothing),
 * and measure at least one element under a label that's unique in that block, because
 * the "was" values are matched by label. The numbers each block's "Try it" line promises
 * are measured in a real browser before shipping, as CLAUDE.md describes.
 */
function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? markdownFiles(join(dir, e.name)) : e.name.endsWith('.md') ? [join(dir, e.name)] : []);
}

const blocks = markdownFiles('src/content').flatMap((file) => {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  return [...text.matchAll(/^```css-live\n([\s\S]*?)^```$/gm)].map((m, i) => ({ id: `${file.replace(/\\/g, '/')} #${i + 1}`, source: m[1] }));
});

describe('css-live blocks', () => {
  it('exist (the CSS Fundamentals guide has 18)', () => {
    expect(blocks.filter((b) => b.id.includes('css-fundamentals-guide.md'))).toHaveLength(18);
  });

  it.each(blocks.map((b) => [b.id, b.source]))('%s is well formed', (_id, source) => {
    const { css, html } = parseLiveCss(source);
    expect(css.length).toBeGreaterThan(0);
    expect(html.length).toBeGreaterThan(0);
    expect(html).not.toMatch(/<script|\son[a-z]+=/i);
    expect(css).not.toMatch(/<\/?style/);
    const labels = [...html.matchAll(/data-measure(?:="([^"]*)")?/g)].map((m) => m[1] ?? '');
    expect(labels.length).toBeGreaterThan(0);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('renders an editable CSS box and a script-free sandboxed preview', () => {
    const html = renderToStaticMarkup(createElement(LiveCssBlock, { source: blocks[0].source }));
    expect(html).toContain('aria-label="CSS for this demo"');
    expect(html).toContain('sandbox="allow-same-origin"');
    expect(html).not.toContain('allow-scripts');
  });
});
