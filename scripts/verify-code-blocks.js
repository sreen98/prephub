#!/usr/bin/env node
/**
 * Every fenced code block tagged with a runnable language gets a **"Try it"**
 * button in the app (`isRunnable` in `src/features/content/PreBlock.tsx`), which
 * loads it straight into the Code Playground. A block that cannot even be
 * parsed therefore ships a button that is guaranteed to fail — the reader
 * clicks it and gets a `SyntaxError` instead of a lesson.
 *
 * **This is now a CLEAN GATE: the baseline is empty and every one of the 1,670
 * runnable blocks parses.** It began as a ratchet over ~188 pre-existing broken
 * blocks; those were swept in six mechanical classes (see CLAUDE.md), and
 * because a file absent from the baseline must be at zero, an empty baseline
 * means any newly-broken block fails the build.
 *
 * The ratchet machinery is deliberately kept rather than deleted, as the escape
 * valve for a future bulk import: record the count, then work it back down.
 *
 *   - A file's count may DROP (fix blocks, then lower its number, or delete
 *     the entry once it reaches zero).
 *   - A file's count may never RISE, and a file not in the baseline must have
 *     zero — so new content cannot add broken blocks.
 *
 * Run: npm run verify:blocks
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as babel from '@babel/standalone';

const RUNNABLE = new Set(['tsx', 'jsx', 'ts', 'typescript', 'js', 'javascript']);
const BASELINE_PATH = 'scripts/code-block-baseline.json';

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith('.md')) out.push(full);
  }
  return out;
}

/** Parse-check every runnable block in one file. Returns the failures. */
function checkFile(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const failures = [];
  let total = 0;

  for (let i = 0; i < lines.length; i++) {
    const fence = /^```(\w+)\s*$/.exec(lines[i].trim());
    if (!fence || !RUNNABLE.has(fence[1])) continue;

    let end = i + 1;
    while (end < lines.length && lines[end].trim() !== '```') end++;
    const body = lines.slice(i + 1, end).join('\n');
    total++;

    const lang = fence[1];
    const isTS = lang === 'ts' || lang === 'tsx' || lang === 'typescript';
    const isJSX = lang === 'tsx' || lang === 'jsx';
    const presets = [];
    if (isTS) presets.push(['typescript', { isTSX: isJSX, allExtensions: true }]);
    if (isJSX) presets.push('react');

    try {
      // Mirror `transpileSource` in src/lib/playgroundRunner.ts exactly — this
      // gate is only meaningful if it compiles the way the playground does.
      babel.transform(body, {
        presets,
        plugins: [['proposal-decorators', { version: 'legacy' }]],
        filename: `block.${isTS ? 'tsx' : 'jsx'}`,
      });
    } catch (err) {
      failures.push({
        line: i + 1,
        lang,
        message: String(err.message).split('\n')[0].replace(/^[^:]*: /, ''),
      });
    }
    i = end;
  }
  return { total, failures };
}

const files = walk('src/content').sort();
const results = new Map();
let grandTotal = 0;
let grandBad = 0;

for (const file of files) {
  const key = relative('.', file);
  const { total, failures } = checkFile(file);
  grandTotal += total;
  grandBad += failures.length;
  if (failures.length) results.set(key, failures);
}

// --- baseline handling -----------------------------------------------------
let baseline = {};
try {
  baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
} catch {
  baseline = {};
}

if (process.argv.includes('--update-baseline')) {
  const next = {};
  for (const [file, failures] of [...results].sort()) next[file] = failures.length;
  writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`\n✅ baseline written: ${Object.keys(next).length} files, ${grandBad} blocks\n`);
  process.exit(0);
}

const regressions = [];
const improvements = [];

for (const [file, failures] of results) {
  const allowed = baseline[file] ?? 0;
  if (failures.length > allowed) {
    regressions.push({ file, allowed, actual: failures.length, failures });
  }
}
for (const [file, allowed] of Object.entries(baseline)) {
  const actual = results.get(file)?.length ?? 0;
  if (actual < allowed) improvements.push({ file, allowed, actual });
}

console.log('\nRunnable code blocks (every one gets a "Try it" button)\n');
console.log(`  ${grandTotal - grandBad}/${grandTotal} parse across ${files.length} guides`);
console.log(`  ${grandBad} do not, in ${results.size} files (baseline allows ${
  Object.values(baseline).reduce((a, b) => a + b, 0)})`);

if (improvements.length) {
  console.log('\n  Improved — lower these numbers in the baseline:');
  for (const i of improvements) {
    console.log(`    ${i.file}: ${i.allowed} → ${i.actual}`);
  }
}

if (regressions.length) {
  console.error('\n✗ New non-parsing code blocks:\n');
  for (const r of regressions) {
    console.error(`  ${r.file} — allows ${r.allowed}, found ${r.actual}`);
    for (const f of r.failures.slice(0, 6)) {
      console.error(`      L${f.line} [${f.lang}] ${f.message}`);
    }
  }
  console.error(
    '\n  Every runnable block loads into the Code Playground, so a block that '
    + 'cannot parse\n  ships a button that always fails. Fix the block — or, if it '
    + 'is genuinely prose,\n  retag the fence to a non-runnable language such as '
    + '`text`.\n',
  );
  process.exit(1);
}

console.log('\nNo new non-parsing code blocks ✓\n');
