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
import { execSync } from 'node:child_process';
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
check('no sub-AA text colours in either theme', () => {
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
  //
  // THE RULE IS SYMMETRIC, and the first version of it was not. It only banned
  // 200/300/400 — the shades that fail on white — and so explicitly permitted a
  // bare `text-slate-500`, which is 4.76:1 on white but only 3.07–4.15:1 on the
  // dark grounds. Lighthouse found 30 of those still failing in dark mode after
  // the light-mode sweep had "fixed" the theme. An unprefixed utility applies in
  // BOTH themes, so it must clear AA in both — which no single slate shade does.
  // Hence: any bare text-slate-* on a light-themed surface needs a `dark:` pair.
  const offenders = [];
  const darkOnly = [];
  for (const f of srcFiles) {
    if (extname(f) !== '.tsx' || f.includes('.test.')) continue;
    if (ALWAYS_DARK.some((p) => f.startsWith(p))) continue;
    read(f).split('\n').forEach((line, i) => {
      // A decorative lucide glyph carries no information on its own.
      if (/size=\{\d+\}/.test(line)) return;
      if (/(?<![\w:-])text-slate-(200|300|400)\b/.test(line)) {
        offenders.push(`${f}:${i + 1}`);
      }
      // Passes on white, fails on the dark ground — needs a dark: counterpart.
      if (/(?<![\w:-])text-slate-(500|600)\b(?! dark:text-slate-)/.test(line)) {
        darkOnly.push(`${f}:${i + 1}`);
      }
      // ...and having a dark: counterpart is not enough if the counterpart is
      // ALSO too dark. `dark:text-slate-500` is 4.15:1 on #0a0a0f, and the
      // table-of-contents shipped 26 nodes of exactly that — the third gap in
      // this one rule, after "light only" and "no dark pair at all". Anything
      // 500 or darker fails on the dark ground; 400 is 7.70:1.
      //
      // Exception: an element that INVERTS in dark mode (the toast is
      // `bg-slate-900 dark:bg-white`) correctly wants dark text on its dark-mode
      // background. Detect that from the element's own dark background rather
      // than guessing — a false positive here would teach people to ignore the
      // rule.
      const invertsInDark = /dark:bg-(white|slate-(50|100|200|300))\b/.test(line);
      if (!invertsInDark
          && /(?<!hover:)(?<![\w-])dark:text-slate-(500|600|700|800|900)\b/.test(line)) {
        darkOnly.push(`${f}:${i + 1}`);
      }
    });
  }
  assert(
    offenders.length === 0,
    'these apply in light mode, where slate-400 is 2.56:1 against white (AA needs '
      + `4.5:1). Use \`text-slate-500 dark:text-slate-400\` — or 600/400 for small `
      + `uppercase labels: ${offenders.slice(0, 8).join(', ')}`,
  );
  assert(
    darkOnly.length === 0,
    'a bare text-slate-500/600 applies in DARK mode too, where it is 3.07-4.15:1 '
      + `(AA needs 4.5:1). Pair it: \`text-slate-500 dark:text-slate-400\`: `
      + `${darkOnly.slice(0, 8).join(', ')}`,
  );
  return 'both themes meet AA';
});

// ---------------------------------------------------------------------------
// 12. Nothing on the first-paint path may load the whole corpus
// ---------------------------------------------------------------------------
check('no always-mounted module pulls the full content corpus', () => {
  // `loadAllContent()` downloads every guide. That is correct for Search, Quiz,
  // Review and the Interview Simulator — all lazy routes or gated on the user
  // opening them. It is NOT correct for anything that mounts on first paint.
  //
  // The sidebar's Daily Review badge did exactly that via `getAllQuestions()`,
  // and it was invisible locally: `requestIdleCallback` delays when the fetch
  // starts, not what it costs. Lighthouse caught the HOME PAGE pulling 64 guide
  // chunks — 1.6 MB at High priority — to size one number, which on a throttled
  // connection saturated the network and pushed simulated LCP to 12.8 s.
  // `getDueCount` only ever read `q.id`, so `totalQuestionCount` (computed at
  // build time) replaced it.
  const ALWAYS_MOUNTED = ['src/App.tsx', 'src/main.tsx', 'src/components/Sidebar.tsx'];
  const offenders = [];
  for (const f of ALWAYS_MOUNTED) {
    const body = read(f)
      .split('\n')
      .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))   // ignore the explanatory comments
      .join('\n');
    if (/\b(loadAllContent|getAllQuestions)\s*\(/.test(body)) offenders.push(f);
  }
  assert(
    offenders.length === 0,
    `${offenders.join(', ')} calls loadAllContent/getAllQuestions, which downloads every `
      + 'guide on first paint. Use the build-time totalQuestionCount, or move the work behind '
      + 'a lazy route or an explicit user action.',
  );
  return 'first paint stays off the corpus';
});

// ---------------------------------------------------------------------------
// 13. A button whose children are only icons needs an accessible name
// ---------------------------------------------------------------------------
check('icon-only buttons carry an aria-label', () => {
  // Lighthouse found 6 buttons announcing as just "button": both theme toggles,
  // search, font size, the mobile hamburger and the sidebar close.
  //
  // NOTE ON PRECISION. A first attempt asked the looser question "does this
  // button have any text?" and got 3 false positives out of 6 — `{isRunning ?
  // 'Running…' : 'Run'}` reads as textless once tags are stripped — while also
  // MISSING the hamburger. So this asks a narrower question with an exact
  // answer: after removing JSX comments, self-closing elements and whitespace,
  // is there nothing left at all? Such a button cannot have a name.
  //
  // Known blind spot, accepted deliberately: `{cond ? <A /> : <B />}` leaves
  // `{cond?:}` behind and is not flagged, because separating a string used as a
  // CONDITION from one used as CONTENT is not something a regex can do. The
  // rule catches the common shape with zero noise; axe via Lighthouse remains
  // the backstop.
  const offenders = [];
  for (const f of srcFiles) {
    if (extname(f) !== '.tsx' || f.includes('.test.')) continue;
    const src = read(f);
    let i = 0;
    while ((i = src.indexOf('<button', i)) !== -1) {
      const close = src.indexOf('</button>', i);
      if (close === -1) break;
      const el = src.slice(i, close);
      // The opening tag does NOT end at the first `>`: an arrow function in a
      // handler (`onClick={() => …}`) contains one. A probe caught this — the
      // naive version silently passed with the label removed. Track brace depth
      // and quotes, and take the first `>` outside both.
      let gt = -1, depth = 0, quote = '';
      for (let k = 0; k < el.length; k++) {
        const ch = el[k];
        if (quote) { if (ch === quote) quote = ''; continue; }
        if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
        else if (ch === '>' && depth === 0) { gt = k; break; }
      }
      if (gt === -1) { i = close + 9; continue; }
      const openTag = el.slice(0, gt + 1);
      const inner = el
        .slice(gt + 1)
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')     // JSX comments
        .replace(/<[A-Za-z][^>]*\/>/g, '')        // <Icon />
        .replace(/\s+/g, '');
      i = close + 9;
      if (/aria-label|aria-labelledby|title=/.test(openTag)) continue;
      if (inner === '') offenders.push(`${f}:${src.slice(0, i).split('\n').length}`);
    }
  }
  assert(
    offenders.length === 0,
    'a button containing only icons announces as "button" to a screen reader. Add an '
      + 'aria-label, and make it track state where the meaning flips (a theme toggle '
      + `should say "Switch to dark theme", not "Dark mode"): ${offenders.slice(0, 8).join(', ')}`,
  );
  return 'all icon-only buttons are named';
});

// ---------------------------------------------------------------------------
// 14. Markdown tables must label their first column
// ---------------------------------------------------------------------------
check('no table ships an empty header cell', () => {
  // `| | Webpack | Vite |` renders a <th> with no text, so every cell in that
  // column has no header — which is what axe's td-has-header flags on tables
  // larger than 3x3, and it cost 3 failures on the deployed React guide. 43 of
  // these had accumulated. It is also just worse writing: the first column
  // always means something ("Aspect", "Approach", "Method type").
  const offenders = [];
  const walkMd = (dir, out = []) => {
    for (const e of readdirSync(dir)) {
      const full = join(dir, e);
      if (statSync(full).isDirectory()) walkMd(full, out);
      else if (full.endsWith('.md')) out.push(full);
    }
    return out;
  };
  for (const file of walkMd('src/content')) {
    const lines = read(file).split('\n');
    let inFence = false;
    lines.forEach((line, i) => {
      if (line.trimStart().startsWith('```')) { inFence = !inFence; return; }
      if (inFence || i === 0) return;
      // A separator row (|---|---|) means the line above it is the header row.
      if (!/^\s*\|[\s:|-]+\|\s*$/.test(line) || !line.includes('-')) return;
      const cells = lines[i - 1].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      if (cells.some((c) => c === '')) offenders.push(`${file}:${i}`);
    });
  }
  assert(
    offenders.length === 0,
    'an empty header cell leaves that column\'s data cells with no header (axe: '
      + `td-has-header). Name the column — "Aspect" for a comparison, or what the `
      + `rows actually are: ${offenders.slice(0, 6).join(', ')}`,
  );
  return 'every table column is labelled';
});

// ---------------------------------------------------------------------------
// 15. Never write changelog notes into an already-released section
// ---------------------------------------------------------------------------
check('no released changelog section has been edited', () => {
  // This has happened FIVE times: work done after a release gets appended under
  // the heading of the version that already shipped, so the notes claim to be
  // part of a build that never contained them. It is invisible in review — the
  // diff looks like ordinary changelog additions.
  //
  // The invariant: a section whose version is tagged must be byte-identical to
  // the tagged copy. New notes belong under a new heading, which means bumping
  // package.json first.
  //
  // RATCHET. These four diverged before the check existed — they are the
  // historical mis-attributions that were repaired after the fact (see the
  // v1.5.0 note in CLAUDE.md). The list may shrink, never grow.
  const ALREADY_DIVERGED = new Set(['1.5.0', '1.2.0', '1.0.9', '1.0.7']);

  const changelog = read('src/content/changelog.md');
  const sectionFor = (text, v) => {
    const lines = text.split('\n');
    const start = lines.findIndex((l) => l.startsWith(`## v${v}`));
    if (start === -1) return null;
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
      if (/^## v\d+\.\d+\.\d+/.test(lines[i])) { end = i; break; }
    }
    return lines.slice(start, end).join('\n').trim();
  };

  const versions = [...changelog.matchAll(/^## v(\d+\.\d+\.\d+)/gm)].map((m) => m[1]);
  assert(versions.length > 0, 'changelog has no `## vX.Y.Z` heading');

  const edited = [];
  let checked = 0;
  for (const v of versions) {
    if (ALREADY_DIVERGED.has(v)) continue;
    let tagged;
    try {
      tagged = execSync(`git show v${v}:src/content/changelog.md`,
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
      continue;                       // untagged: the version being worked on
    }
    checked++;
    if (sectionFor(changelog, v) !== sectionFor(tagged, v)) edited.push(`v${v}`);
  }

  assert(
    edited.length === 0,
    `${edited.join(', ')} is already tagged, but its changelog section differs from `
      + 'the tagged copy. Notes for work done after a release belong under a NEW '
      + 'heading: bump package.json, add `## vX.Y.Z` above, and move the entries there.',
  );
  return `${checked} released section(s) match their tags`;
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
