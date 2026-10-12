import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';

/**
 * Frontend Deployment Q22 claims a lookup keyed by `Function.name` works as written and
 * breaks once minified, and that keying by reference survives. esbuild is the minifier
 * Vite's production build uses, so the claim is checked against the real thing.
 */
const guide = readFileSync('src/content/aws/aws-frontend-deployment-guide.md', 'utf8').replace(/\r\n/g, '\n');

/** The ```js block containing `marker`. */
function block(marker: string): string {
  const i = guide.indexOf(marker);
  expect(i, `marker not found: ${marker}`).toBeGreaterThan(-1);
  expect(guide.indexOf(marker, i + 1), `marker is not unique: ${marker}`).toBe(-1);
  const start = guide.lastIndexOf('```js\n', i) + 6;
  return guide.slice(start, guide.indexOf('```', start));
}

/** Runs a snippet the way production would ship it, or as written. */
function run(snippet: string, minify: boolean): string[] {
  const code = minify ? transformSync(snippet, { minify: true, format: 'iife' }).code : snippet;
  const logs: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- running the guide's own snippet is the point
  new Function('console', code)({ log: (...a: unknown[]) => logs.push(a.join(' ')) });
  return logs;
}

describe('Frontend Deployment Q22 — the minification trap', () => {
  const broken = block('function titleForBroken(Component) {');
  const fixed = block('const titles = new Map([[AdminPanel');

  it('a lookup by Function.name works as written and misses once minified', () => {
    expect(run(broken, false)).toEqual(['Admin']);
    expect(run(broken, true)).toEqual(['Untitled']);
  });

  it('a lookup by reference survives minification', () => {
    expect(run(fixed, false)).toEqual(['Admin']);
    expect(run(fixed, true)).toEqual(['Admin']);
  });
});
