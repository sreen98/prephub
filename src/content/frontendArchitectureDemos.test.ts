import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Frontend Architecture §2.3 (BFF) claims an exact response shape for its
 * aggregation demo. Run the block from the markdown and hold it to that claim,
 * so the example the reader presses Try it on cannot drift from the text.
 */
const md = readFileSync('src/content/front-end/frontend-architecture-guide.md', 'utf8');

function block(marker: string): string {
  const i = md.indexOf(marker);
  if (i < 0) throw new Error('marker not found: ' + marker);
  if (md.indexOf(marker, i + 1) >= 0) throw new Error('marker is not unique: ' + marker);
  const start = md.lastIndexOf('```js\n', i) + 6;
  return md.slice(start, md.indexOf('```', start));
}

describe('Frontend Architecture §2.3 — the BFF home-screen demo', () => {
  it('returns one trimmed response and degrades the failing optional service to null', async () => {
    const logs: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- running the guide's own snippet is the point
    new Function('console', block('async function homeScreen(userId) {'))({
      log: (...a: unknown[]) => { logs.push(a.map(String).join(' ')); },
    });
    await new Promise((r) => setTimeout(r, 300));
    expect(logs).toEqual([
      '{"user":{"name":"Asha","avatar":"/a.png"},"recentOrders":[{"id":"o1","total":"$49.99","status":"shipped"}],"recommendations":null}',
    ]);
  });
});
