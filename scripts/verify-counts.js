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
  /name: '([^']+)',\n\s*icon:[\s\S]*?items: \[([\s\S]*?)\n {4}\]/g
)) {
  categories[m[1]] = [...m[2].matchAll(/\{ name: '/g)].length;
}

const cheatSheets = [
  ...dataTs.slice(dataTs.indexOf('export const cheatSheets')).matchAll(/\{ name: '/g),
].length;

// Playground templates, per category (8-space indent = inside a category)
const tpl = read('src/data/playground/playgroundTemplates.ts').split('\n');
const labels = [];
tpl.forEach((line, i) => {
  const m = line.match(/^ {4}label: '([^']+)',$/);
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

const solutions = [...read('src/data/playground/playgroundSolutions.ts').matchAll(/^ {2}'/gm)].length;
const solutionKeys = [...read('src/data/playground/playgroundSolutionKeys.ts').matchAll(/^ {2}'/gm)].length;

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

// In-page TOC anchors. These broke silently across 49 guides once: authors write
// GitHub-style slugs, where "A & B" becomes `a--b`, but the app's slugify()
// collapses `-+` to a single dash, so every heading containing "&" had a dead
// TOC link. Nothing surfaces that in a build, hence this check.
console.log('\nIn-page anchors');
const slugify = (s) => s.toLowerCase()
  .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
  .replace(/-+/g, '-').replace(/^-|-$/g, '');

function mdFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? mdFiles(join(dir, e.name))
      : (e.name.endsWith('.md') ? [join(dir, e.name)] : []));
}

let anchorTotal = 0;
const deadAnchors = [];
for (const file of mdFiles(join(root, 'src/content'))) {
  const body = readFileSync(file, 'utf8');
  const heads = new Set(
    [...body.matchAll(/^#{1,6} (.+)$/gm)].map((m) => slugify(m[1])));
  for (const m of body.matchAll(/\]\(#([^)]+)\)/g)) {
    anchorTotal++;
    if (!heads.has(m[1])) {
      deadAnchors.push(`${file.replace(root + '/', '')} -> #${m[1]}`);
    }
  }
}
if (deadAnchors.length) {
  failed++;
  console.log(`  ✗ ${deadAnchors.length} of ${anchorTotal} in-page anchors point at no heading`);
  for (const d of deadAnchors.slice(0, 15)) console.log(`      ${d}`);
  if (deadAnchors.length > 15) console.log(`      … and ${deadAnchors.length - 15} more`);
} else {
  console.log(`  ✓ all ${anchorTotal} in-page anchors resolve`);
}

if (failed) {
  console.error(`\n${failed} check(s) failed. Update the prose, the anchor, or the number in the code.`);
  process.exit(1);
}
console.log('\nAll count claims match the code ✓');
