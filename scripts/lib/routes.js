/**
 * The single list of routes this app serves — used by BOTH the sitemap and the
 * route-shell generator, so the two cannot disagree about what exists.
 *
 * Routes live in two places by design: content routes are data (`menuStructure`
 * and `cheatSheets` in src/data.ts), tool routes are declared as JSX in App.tsx.
 * Reading both is deliberate; hard-coding either list is how `/query-playground`
 * and `/checkpoints` came to be missing from the sitemap.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Never emit a shell or a sitemap entry for these.
 * `/admin` is local-development only and deliberately undiscoverable — giving it
 * a real URL on disk would advertise it. `*` is the catch-all.
 */
const EXCLUDED = new Set(['/admin', '*']);

export function getAllRoutes() {
  const data = readFileSync(join(root, 'src/data.ts'), 'utf-8');
  const app = readFileSync(join(root, 'src/App.tsx'), 'utf-8');

  // Content routes: `path: '/frontend/react'` in the menu/cheat-sheet data.
  // Anchored on quotes so it cannot run across lines into a type declaration.
  const content = [...data.matchAll(/\bpath:\s*'(\/[^']*)'/g)].map((m) => m[1]);

  // Tool routes: `<Route path="/quiz" …>` in App.tsx.
  const tools = [...app.matchAll(/\bpath="([^"]+)"/g)].map((m) => m[1]);

  const all = [...new Set([...content, ...tools])]
    .filter((p) => p.startsWith('/') && !EXCLUDED.has(p))
    .filter((p) => !p.includes(':'))        // no dynamic segments in this app
    .sort();

  if (!all.includes('/')) all.unshift('/');
  return all;
}
