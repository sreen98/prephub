#!/usr/bin/env node
/**
 * generate-content-meta.js — precomputes the per-guide metadata the app needs
 * at first paint, so the markdown itself can be lazy-loaded.
 *
 * WHY THIS EXISTS
 * ---------------
 * `contentFiles` used to be an EAGER `import.meta.glob`, which inlined every
 * guide into the main chunk — 4.6 MB of markdown, ~90% of a 4.9 MB bundle, so
 * every visitor downloaded all 68 guides to read one.
 *
 * Making the glob lazy is blocked by the few things that need data about
 * *every* guide before any guide is opened: reading times on the home page,
 * the category totals, and the related-guides strip. Those are all derived
 * numbers, not the text — so we compute them at build time into a small JSON
 * (single-digit KB) and the markdown becomes per-guide chunks.
 *
 * Search, Quiz and the Interview Simulator genuinely need full text, so they
 * load it on demand via loadAllContent() rather than being precomputed here.
 *
 * Run before the build; wired into `npm run build`.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src/content');
const outFile = join(root, 'src/generated/content-meta.json');

/** Mirrors estimateReadingTime() in src/data.ts — keep the two in step. */
function readingTime(markdown) {
  if (!markdown) return 1;
  let codeWords = 0;
  const proseOnly = markdown.replace(/```[\s\S]*?```/g, (match) => {
    codeWords += match.split(/\s+/).length;
    return '';
  });
  const proseWords = proseOnly.split(/\s+/).filter(Boolean).length;
  // Prose at 200 wpm, code at 60 wpm — code is slower to read than prose.
  return Math.max(1, Math.ceil(proseWords / 200 + codeWords / 60));
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'private') return [];      // never index private content
      return walk(full);
    }
    return name.endsWith('.md') ? [full] : [];
  });
}

const meta = {};
for (const file of walk(contentDir)) {
  const markdown = readFileSync(file, 'utf-8');
  // Key by the same string data.ts uses: './content/<relative path>'
  const key = './content/' + relative(contentDir, file).split('\\').join('/');
  meta[key] = {
    readMin: readingTime(markdown),
    bytes: Buffer.byteLength(markdown),
  };
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(meta, null, 0) + '\n');

const kb = (Buffer.byteLength(JSON.stringify(meta)) / 1024).toFixed(1);
console.log(`content-meta.json: ${Object.keys(meta).length} files, ${kb} KB`);
