#!/usr/bin/env node
/**
 * Generates `src/generated/playground-index.json` — the template modal's
 * metadata, with the `code` bodies stripped out.
 *
 * Why: `playgroundTemplates.ts` is 360 KB, and it was statically imported by
 * CodePlayground, which is why that chunk was 428 KB. The modal only needs
 * each template's name, tag, kind, category, patterns and difficulty; the code
 * body is needed solely when a template is actually opened. So the metadata
 * ships eagerly (~25 KB) and the bodies load on demand, the same shape as
 * `playgroundSolutionKeys.ts` + the lazy `playgroundSolutions.ts`.
 *
 * How: the templates module has ZERO imports — it is pure data and types — so
 * esbuild can transpile it and Node can execute it directly. That matters: it
 * means this generator never has to parse or rewrite the 180 template literals,
 * whose backtick escaping has silently broken before and which `tsc` does not
 * catch.
 *
 * Generated, gitignored, and rebuilt by `npm run dev` / `npm run build`.
 */
import { mkdirSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'src/data/playground/playgroundTemplates.ts');
const OUT = join(root, 'src/generated/playground-index.json');
const TMP = join(root, 'src/generated/.playground-templates.mjs');

mkdirSync(dirname(OUT), { recursive: true });

await build({
  entryPoints: [SOURCE],
  outfile: TMP,
  format: 'esm',
  platform: 'node',
  bundle: false,
  logLevel: 'error',
});

const mod = await import(pathToFileURL(TMP).href);
rmSync(TMP, { force: true });

const { templateCategories, blankStarters, ALL_PATTERNS, PATTERN_GROUPS } = mod;
if (!Array.isArray(templateCategories) || templateCategories.length === 0) {
  console.error('✗ playgroundTemplates.ts exported no templateCategories');
  process.exit(1);
}

/** Everything except `code`. */
const index = {
  allPatterns: ALL_PATTERNS,
  patternGroups: PATTERN_GROUPS,
  categories: templateCategories.map((cat) => ({
    label: cat.label,
    tag: cat.tag,
    kind: cat.kind ?? 'template',
    templates: cat.templates.map((t) => ({
      name: t.name,
      ...(t.lang ? { lang: t.lang } : {}),
      ...(t.jsx ? { jsx: true } : {}),
      ...(t.patterns ? { patterns: t.patterns } : {}),
      ...(t.difficulty ? { difficulty: t.difficulty } : {}),
    })),
  })),
  // Three tiny snippets. They stay eager so the playground always has
  // something runnable on first paint without waiting on a fetch.
  blankStarters,
};

const total = index.categories.reduce((n, c) => n + c.templates.length, 0);
const names = index.categories.flatMap((c) => c.templates.map((t) => t.name));
const dupes = names.filter((n, i) => names.indexOf(n) !== i);
if (dupes.length) {
  // Names are the lookup key for loading a body, and for saved progress.
  console.error(`✗ duplicate template names: ${[...new Set(dupes)].join(', ')}`);
  process.exit(1);
}

writeFileSync(OUT, `${JSON.stringify(index, null, 0)}\n`);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(
  `✅ playground-index.json — ${total} templates in ${index.categories.length} categories, `
  + `${kb(statSync(OUT).size)} (source ${kb(statSync(SOURCE).size)})`,
);
