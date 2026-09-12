#!/usr/bin/env node
/**
 * Writes a real index.html at every route path in dist/.
 *
 * WHY
 * ---
 * GitHub Pages has no server-side rewrite, so a deep link like
 * /prephub/frontend/react hits a genuine 404. `public/404.html` catches it and
 * bounces to /prephub/?/frontend/react, which index.html unpacks back into a
 * route. It works, but it costs a full extra round trip on the very first byte:
 * Lighthouse measured **978 ms on mobile / 224 ms on desktop**, and the 404 also
 * logs a console error that fails the Best Practices audit.
 *
 * Every one of those links — from Google, from a bookmark, from a shared URL —
 * paid it. The home page never did, which is exactly why it stayed invisible.
 *
 * Putting the SPA shell at each real path removes the 404 entirely: the server
 * finds a file, serves it, and the router takes over client-side as before.
 *
 * This is NOT pre-rendering. The HTML is the same empty shell, so it does not
 * improve FCP or SEO content — it only removes the redirect. Real pre-rendering
 * would need an SSR build and hydration, which is a much larger change.
 *
 * 404.html stays, and is still the right fallback for paths that genuinely do
 * not exist.
 *
 * Run after `vite build`; wired into `npm run build`.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllRoutes } from './lib/routes.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const shell = join(dist, 'index.html');

if (!existsSync(shell)) {
  console.error('✗ dist/index.html not found — run `vite build` first.');
  process.exit(1);
}

const html = readFileSync(shell, 'utf-8');
let written = 0;

for (const route of getAllRoutes()) {
  if (route === '/') continue;                       // dist/index.html already is this
  const dir = join(dist, route.replace(/^\//, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  written++;
}

console.log(`route shells: ${written} written (plus dist/index.html) — deep links no longer 404`);
