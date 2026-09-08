#!/usr/bin/env node
/**
 * verify-counts.js — guards the numbers stated in prose against the code.
 *
 * The counts in README.md, CLAUDE.md and src/content/README.md (the app's
 * Introduction page) are hand-written prose, so they drift silently every
 * time content is added. They have drifted twice: the docs once claimed
 * "143 tricky questions across 12 guides" when 20 guides already had them,
 * and the Introduction advertised "120+ templates / 75+ challenges" long
 * after the real figures were 171 and 120.
 *
 * The UI itself is safe — every number rendered on screen is derived
 * (allGuides.length, cat.templates.length, solvedCount / totalJsChallenges).
 * This script covers the prose the UI can't compute.
 *
 * Usage:  npm run verify:counts
 * Exits non-zero on any mismatch, so it can gate a release.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

// ---------------------------------------------------------------- ground truth
const dataTs = read('src/data.ts');
const menu = dataTs.slice(
  dataTs.indexOf('export const menuStructure'),
  dataTs.indexOf('export const cheatSheets'),
);

const categories = {};
for (const m of menu.matchAll(
  /name: '([^']+)',\n\s*icon:[\s\S]*?items: \[([\s\S]*?)\n    \]/g
)) {
  categories[m[1]] = [...m[2].matchAll(/\{ name: '/g)].length;
}

const cheatSheets = [
  ...dataTs.slice(dataTs.indexOf('export const cheatSheets')).matchAll(/\{ name: '/g),
].length;

// Playground templates, per category (8-space indent = inside a category)
const tpl = read('src/components/playgroundTemplates.ts').split('\n');
const labels = [];
tpl.forEach((line, i) => {
  const m = line.match(/^    label: '([^']+)',$/);
  if (m) labels.push([i, m[1]]);
});
labels.push([tpl.length, null]);

const playground = {};
for (let k = 0; k < labels.length - 1; k++) {
  const [start, name] = labels[k];
  const end = labels[k + 1][0];
  playground[name] = tpl
    .slice(start, end)
    .filter((l) => l.startsWith("        name: '")).length;
}

const solutions = [...read('src/components/playgroundSolutions.ts').matchAll(/^  '/gm)].length;
const solutionKeys = [...read('src/components/playgroundSolutionKeys.ts').matchAll(/^  '/gm)].length;

// Tricky questions across all guides
const walk = (dir) =>
  readdirSync(join(root, dir)).flatMap((f) => {
    const p = `${dir}/${f}`;
    return statSync(join(root, p)).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });

let trickyTotal = 0;
let trickyGuides = 0;
for (const f of walk('src/content')) {
  if (f.endsWith('changelog.md')) continue;
  const s = read(f);
  const m = s.match(/^## .*[Tt]ricky/m);
  if (!m) continue;
  const n = [...s.slice(m.index).matchAll(/^\*\*Q\d+:/gm)].length;
  if (n === 0) continue;
  trickyTotal += n;
  trickyGuides++;
}

const truth = {
  guides: Object.values(categories).reduce((a, b) => a + b, 0),
  cheatSheets,
  templates: Object.values(playground).reduce((a, b) => a + b, 0),
  jsChallenges: playground['Coding Challenges'],
  reactChallenges: playground['React Machine Coding'],
  challengesTotal: playground['Coding Challenges'] + playground['React Machine Coding'],
  solutions,
  trickyTotal,
  trickyGuides,
  ...categories,
};

// ---------------------------------------------------------------- claim checks
// Each claim: the value it must equal, and where it must literally appear.
const claims = [
  ['guides',          'README.md',             (n) => `**${n} guides across 8 categories**`],
  ['guides',          'CLAUDE.md',             (n) => `= ${n} guides`],
  ['guides',          'src/content/README.md', (n) => `**${n} guides across 8 categories`],
  ['cheatSheets',     'src/content/README.md', (n) => `${n} cheat sheets`],
  ['Front End',       'src/content/README.md', (n) => `Front End (${n} guides)`],
  ['Back End',        'src/content/README.md', (n) => `Back End (${n} guides)`],
  ['System Design',   'src/content/README.md', (n) => `System Design (${n} guides)`],
  ['templates',       'README.md',             (n) => `**${n} built-in templates**`],
  ['templates',       'src/content/README.md', (n) => `**${n} templates**`],
  ['jsChallenges',    'README.md',             (n) => `**${n} JS coding challenges**`],
  ['jsChallenges',    'src/content/README.md', (n) => `**${n} coding challenges**`],
  ['reactChallenges', 'README.md',             (n) => `**${n} React Machine Coding**`],
  ['reactChallenges', 'src/content/README.md', (n) => `**${n} React machine-coding**`],
  ['challengesTotal', 'README.md',             (n) => `**${n} challenges total**`],
  ['challengesTotal', 'src/content/README.md', (n) => `**${n} challenges** in total`],
  ['trickyTotal',     'README.md',             (n) => `**${n} questions**`],
  ['trickyTotal',     'CLAUDE.md',             (n) => `${n} questions total`],
  ['trickyGuides',    'README.md',             (n) => `**${n} guides**`],
];

console.log('Ground truth');
for (const [k, v] of Object.entries(truth)) console.log(`  ${k.padEnd(18)} ${v}`);

console.log('\nClaim checks');
let failed = 0;
for (const [key, file, build] of claims) {
  const expected = build(truth[key]);
  const ok = read(file).includes(expected);
  if (!ok) failed++;
  console.log(`  ${ok ? '✓' : '✗'} ${file.padEnd(22)} ${expected}`);
}

// Internal consistency that isn't prose
console.log('\nInternal consistency');
const consistency = [
  ['solutions === solutionKeys', solutions === solutionKeys, `${solutions} vs ${solutionKeys}`],
  ['solutions <= jsChallenges',  solutions <= truth.jsChallenges, `${solutions} <= ${truth.jsChallenges}`],
];
for (const [label, ok, detail] of consistency) {
  if (!ok) failed++;
  console.log(`  ${ok ? '✓' : '✗'} ${label.padEnd(28)} ${detail}`);
}

if (failed) {
  console.error(`\n${failed} count claim(s) are stale. Update the prose, or the number in the code.`);
  process.exit(1);
}
console.log('\nAll count claims match the code ✓');
