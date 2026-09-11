#!/usr/bin/env node
/**
 * Repo-specific architecture invariants that ESLint cannot express.
 *
 * Every check here corresponds to something that actually broke, and several
 * are META-guards: they protect the guards. The most important is #1 — this
 * repo shipped for months with an ESLint glob that matched no application file,
 * so `npm run lint` passed while linting nothing. A rule that can be silently
 * switched off is not a rule.
 *
 * Run: npm run verify:arch
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const failures = [];
const checks = [];

function check(name, fn) {
  try {
    const detail = fn();
    checks.push({ name, ok: true, detail: detail ?? '' });
  } catch (err) {
    checks.push({ name, ok: false, detail: err.message });
    failures.push(`${name}: ${err.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function read(p) {
  return readFileSync(p, 'utf8');
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const srcFiles = walk('src').filter((f) => ['.ts', '.tsx'].includes(extname(f)));

// ---------------------------------------------------------------------------
// 1. META: the lint gate must actually cover the application code
// ---------------------------------------------------------------------------
check('ESLint covers every src .ts/.tsx file', () => {
  const cfg = read('eslint.config.js');
  assert(
    /files:\s*\['src\/\*\*\/\*\.\{ts,tsx\}'\]/.test(cfg),
    "eslint.config.js must lint 'src/**/*.{ts,tsx}'. It once globbed only "
      + '{js,jsx} while all of src/ is TypeScript, so ESLint linted ZERO files '
      + 'and react-hooks never ran.',
  );
  assert(
    /recommendedTypeChecked/.test(cfg),
    'Type-aware linting (recommendedTypeChecked) must stay enabled — it is what '
      + 'catches floating promises and misused async, the bug class that blanked '
      + 'the Review page.',
  );
  assert(
    /'react-hooks\/exhaustive-deps':\s*'error'/.test(cfg),
    "react-hooks/exhaustive-deps must be 'error', not 'warn' or off.",
  );
  return `${srcFiles.length} files in scope`;
});

// ---------------------------------------------------------------------------
// 2. META: the pre-push hook must run the gates
// ---------------------------------------------------------------------------
check('pre-push hook runs every gate', () => {
  const hook = read('.githooks/pre-push');
  for (const gate of ['typecheck', 'lint', 'test', 'verify:counts', 'verify:blocks']) {
    assert(hook.includes(gate), `.githooks/pre-push is missing the '${gate}' gate`);
  }
  return 'all gates present';
});

// ---------------------------------------------------------------------------
// 3. Web storage goes through src/lib/storage.ts
// ---------------------------------------------------------------------------
check('no direct web-storage access outside src/lib/storage.ts', () => {
  const offenders = [];
  for (const f of srcFiles) {
    if (f.includes('lib/storage') || f.startsWith('src/data/') || f.includes('.test.')) continue;
    const body = read(f);
    if (/\b(localStorage|sessionStorage)\s*\./.test(body)) offenders.push(f);
  }
  assert(
    offenders.length === 0,
    `use src/lib/storage.ts instead (storage access throws in private mode and `
      + `blanks the page): ${offenders.join(', ')}`,
  );
  return 'all access is wrapped';
});

// ---------------------------------------------------------------------------
// 4. Layering: dependencies point downward
// ---------------------------------------------------------------------------
check('dependencies point downward', () => {
  // pages → features → components → hooks / lib / data.
  const RULES = [
    { from: 'src/data/',       banned: /from\s+'[^']*(components|features|pages)\//,  label: 'data/ must not import UI' },
    { from: 'src/lib/',        banned: /from\s+'[^']*(components|features|pages)\//,  label: 'lib/ must not import UI' },
    { from: 'src/hooks/',      banned: /from\s+'[^']*(components|features|pages)\//,  label: 'hooks/ must not import UI' },
    { from: 'src/components/', banned: /from\s+'[^']*(features|pages)\//,             label: 'shared components must not import a feature or page' },
    { from: 'src/features/',   banned: /from\s+'[^']*pages\//,                        label: 'features must not import a page' },
  ];
  const offenders = [];
  for (const f of srcFiles) {
    if (f.includes('.test.')) continue;
    const body = read(f);
    for (const r of RULES) {
      if (f.startsWith(r.from) && r.banned.test(body)) offenders.push(`${f} (${r.label})`);
    }
  }
  assert(offenders.length === 0, offenders.join('; '));
  return 'pages → features → components → hooks/lib/data';
});

check('nothing imports App', () => {
  const offenders = srcFiles.filter(
    (f) => f !== 'src/main.tsx' && /from\s+'[^']*\/App'/.test(read(f)),
  );
  assert(offenders.length === 0, `only main.tsx may import App: ${offenders.join(', ')}`);
  return 'App is a leaf';
});

// ---------------------------------------------------------------------------
// 5. Bulk content data belongs in src/data/, not src/components/
// ---------------------------------------------------------------------------
check('no bulk data modules under src/components/', () => {
  const LIMIT = 1200;
  const offenders = [];
  for (const f of srcFiles) {
    const inUi = f.startsWith('src/components/') || f.startsWith('src/features/') || f.startsWith('src/pages/');
    if (!inUi || extname(f) !== '.ts') continue;
    const lines = read(f).split('\n').length;
    if (lines > LIMIT) offenders.push(`${f} (${lines} lines)`);
  }
  assert(
    offenders.length === 0,
    `content data belongs in src/data/: ${offenders.join(', ')}`,
  );
  return 'components/ holds components';
});

// ---------------------------------------------------------------------------
// 6. Guide markdown must stay lazily loaded
// ---------------------------------------------------------------------------
check('content glob is NOT eager', () => {
  const data = read('src/data.ts');
  const glob = /const contentLoaders = import\.meta\.glob<string>\(([\s\S]*?)\);/.exec(data);
  assert(glob, 'could not find contentLoaders in src/data.ts');
  assert(
    !/eager:\s*true/.test(glob[1]),
    'contentLoaders must never be eager — that inlined 4.6 MB of markdown into '
      + 'the main chunk, so every visitor downloaded all 69 guides to read one.',
  );
  return 'lazy';
});

// ---------------------------------------------------------------------------
// 7. Service-worker precache invariants
// ---------------------------------------------------------------------------
check('vendor chunks are named vendor-* and registration stays manual', () => {
  const cfg = read('vite.config.js');
  assert(
    /injectRegister:\s*null/.test(cfg),
    'injectRegister must stay null — the plugin\'s auto-injected registerSW does '
      + 'not reload on activate, which is why every release needed a hard refresh.',
  );
  assert(
    /entryFileNames:\s*'assets\/app-\[hash\]\.js'/.test(cfg)
      && /'assets\/app-\*\.js'/.test(cfg),
    "the app entry must be named `app-[hash].js` and precached as `assets/app-*.js`. "
      + 'Vite\'s default `index-[hash].js` collides with PGlite, whose internal modules '
      + 'are also called index.js — `assets/index-*.js` swept 627 KB of WASM loader into '
      + 'the precache. Same mistake as `react-*` matching `react-guide-*`.',
  );
  assert(
    !/'assets\/index-\*\.js'/.test(cfg),
    'the precache glob must not be `assets/index-*.js` — it matches third-party chunks.',
  );
  const vendorKeys = [...cfg.matchAll(/^\s*'?(vendor-[a-z]+)'?:/gm)].map((m) => m[1]);
  assert(
    vendorKeys.length >= 3,
    'vendor chunks must keep the vendor-* prefix so the precache glob can match '
      + 'them without also matching content chunks (a bare `react` key produced '
      + 'react-<hash>.js, which react-* could not tell from react-guide-<hash>.js).',
  );
  return `${vendorKeys.length} vendor chunks`;
});

// ---------------------------------------------------------------------------
// 8. The Introduction page must not be overwritten by the repo README
// ---------------------------------------------------------------------------
check('prepare-content.js does not clobber src/content/README.md', () => {
  const script = read('scripts/prepare-content.js');
  assert(
    !/README\.md['"]?\s*\),\s*['"]?src\/content/.test(script)
      && !/copyFileSync\([^)]*README/.test(script),
    'prepare-content.js must not copy the repo README over src/content/README.md '
      + '— that silently replaced the app Introduction with the project README.',
  );
  return 'Introduction is safe';
});

// ---------------------------------------------------------------------------
// 9. The playground template index stays metadata-only
// ---------------------------------------------------------------------------
check('playground index carries no template code bodies', () => {
  const pkg = JSON.parse(read('package.json'));
  for (const script of ['dev', 'build']) {
    assert(
      pkg.scripts[script].includes('generate-playground-index'),
      `npm run ${script} must regenerate the playground index — it is gitignored and imported by src/`,
    );
  }
  let index;
  try {
    index = JSON.parse(read('src/generated/playground-index.json'));
  } catch {
    throw new Error('src/generated/playground-index.json missing — run `npm run playground:index`');
  }
  const withCode = index.categories.flatMap((c) =>
    c.templates.filter((t) => 'code' in t).map((t) => t.name));
  assert(
    withCode.length === 0,
    `the index must hold metadata only — the 360 KB of code bodies load on demand. `
      + `Found bodies on: ${withCode.slice(0, 3).join(', ')}`,
  );
  // CodePlayground must not statically import the heavy module again.
  const cp = read('src/features/playground/CodePlayground.tsx');
  assert(
    !/^import \{[^}]*\} from '\.\.\/data\/playground\/playgroundTemplates';$/m.test(cp)
      || /^import type \{/m.test(cp),
    'CodePlayground must import values from templateIndex, not playgroundTemplates '
      + '(a value import pulls all 360 KB back into the route chunk).',
  );
  const total = index.categories.reduce((n, c) => n + c.templates.length, 0);
  return `${total} templates, metadata only`;
});

// ---------------------------------------------------------------------------
// 10. Tests must exist and be wired up
// ---------------------------------------------------------------------------
check('a test suite exists and npm test runs it', () => {
  const pkg = JSON.parse(read('package.json'));
  assert(pkg.scripts?.test && !/no test specified/.test(pkg.scripts.test), 'package.json needs a real `test` script');
  const tests = srcFiles.filter((f) => /\.(test|spec)\.tsx?$/.test(f));
  assert(tests.length >= 3, `expected at least 3 test files, found ${tests.length}`);
  return `${tests.length} test files`;
});

// ---------------------------------------------------------------------------
// 11. Light-mode text must actually be readable
// ---------------------------------------------------------------------------
check('no sub-AA text colours in the light theme', () => {
  // On white, slate-400 is 2.56:1 and slate-300 is 1.48:1 — both far below the
  // 4.5:1 WCAG AA floor for body text. A class with no `dark:` prefix applies in
  // BOTH themes, so `text-slate-400` on its own is a light-mode bug; 400 belongs
  // in the `dark:` slot, where it measures 7.7:1. The repo had 36 of these,
  // including two pairs written backwards (`text-slate-400 dark:text-slate-600`
  // gave the lighter value to the light theme and the darker to the dark one,
  // failing at both ends).
  //
  // The playground and query playground are deliberately always-dark IDE
  // surfaces, so light greys are correct there and they are exempt.
  const ALWAYS_DARK = [
    'src/features/playground/', 'src/features/queryPlayground/', 'src/pages/QueryPlayground.tsx',
  ];
  const offenders = [];
  for (const f of srcFiles) {
    if (extname(f) !== '.tsx' || f.includes('.test.')) continue;
    if (ALWAYS_DARK.some((p) => f.startsWith(p))) continue;
    read(f).split('\n').forEach((line, i) => {
      // A decorative lucide glyph carries no information on its own.
      if (/size=\{\d+\}/.test(line)) return;
      if (/(?<![\w:-])text-slate-(200|300|400)\b/.test(line)) {
        offenders.push(`${f}:${i + 1}`);
      }
    });
  }
  assert(
    offenders.length === 0,
    'these apply in light mode, where slate-400 is 2.56:1 against white (AA needs '
      + `4.5:1). Use \`text-slate-500 dark:text-slate-400\` — or 600/400 for small `
      + `uppercase labels: ${offenders.slice(0, 8).join(', ')}`,
  );
  return 'light theme meets AA';
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const pad = Math.max(...checks.map((c) => c.name.length));
console.log('\nArchitecture invariants\n');
for (const c of checks) {
  const mark = c.ok ? '✓' : '✗';
  console.log(`  ${mark} ${c.name.padEnd(pad)}  ${c.detail}`);
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} architecture check(s) failed:\n`);
  for (const f of failures) console.error(`  - ${f}\n`);
  process.exit(1);
}
console.log('\nAll architecture invariants hold ✓\n');
