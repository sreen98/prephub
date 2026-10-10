# CLAUDE.md — PrepHub

PrepHub is an interview-prep web app: markdown study guides rendered as a React site, with
Quiz, Code Playground, Query Playground, spaced repetition and an interview simulator. It is a
static PWA on GitHub Pages at `https://prephub.sreenathp.com/` (domain root). There is **no backend**; all state lives in
localStorage.

> **Why is each rule here?** The incident, audit or measurement behind every rule is in
> `docs/engineering-notes.md` (the full former CLAUDE.md). Grep it when you need the reason
> before relaxing something. It is not loaded automatically.

## Commands
```bash
npm install          # also sets core.hooksPath=.githooks via `prepare`
npm run dev          # localhost:5173 (regenerates content-meta + playground index)
npm run build        # → dist/, then writes route shells + sitemap
npm run verify       # THE GATE. Run it before calling any task done.
npm run content:meta      # after adding/removing a **QN:** marker or a guide
npm run playground:index  # after changing playground templates
```
`verify` runs six checks in order, and the pre-push hook and the deploy workflow run the same six:
`typecheck` (tsc) → `lint` (type-aware ESLint over all of `src/`) → `test` (Vitest) →
`verify:counts` (figures in prose + in-page anchors) → `verify:arch` (repo invariants ESLint
cannot express) → `verify:blocks` (every runnable guide code block parses).
Pre-commit runs `verify:arch` and `verify:counts` (a second or two). If a gate blocks you, fix the code. Do **not**
disable the rule, widen a ratchet or add a cast.
**Gates must pass on a Windows checkout too** (`core.autocrlf=true` gives CRLF files and `\`
paths). A script or test that reads a file normalises it with `.replace(/\r\n/g, '\n')`,
and a path walker normalises `\` to `/` before matching prefixes. Never run `git config` in
a temporary worktree: worktrees share `.git/config`, so it changes the main checkout.
`.gitattributes` (`* text=auto`) keeps the repository itself LF; don't remove it.

## Git: things you must never do
- **Never commit, tag or push unless the user explicitly asks.** The working tree *is* the work.
- **Never** run `git stash`, `git checkout -- <file>` (naming the file does not make it safe),
  `git checkout -- .`, `git reset --hard` or `git clean`. To compare with HEAD use
  `git show HEAD:path`. To undo a temporary probe edit, capture the original text first and
  write it back.
- Commits carry no Claude co-author trailer. This is a public portfolio repo.
- Re-run `npm run typecheck` after `eslint --fix`. It has removed a load-bearing type before.

## Layout and layering
```
src/pages/        one per route (the composition layer)
src/features/     content/, playground/, queryPlayground/ (feature-owned UI)
src/components/   genuinely shared UI only (Toast, MermaidBlock, RouteErrorBoundary, Sidebar…)
src/hooks/        stateful logic
src/lib/          pure helpers (storage, playgroundRunner, editorHighlight, challengeJudge…)
src/data/         content, playground data, query data
src/content/      markdown guides + cheat sheets; src/content/README.md is the `/` Introduction
src/generated/    content-meta.json, playground-index.json (generated, gitignored)
scripts/          verify-*, generate-*, lib/routes.js (single route list), dev/ authoring tools
```
**Imports only point down this list.** `verify:arch` enforces every edge. `data/`, `lib/` and
`hooks/` import no UI. `components/` imports no feature or page. `features/` imports no page.
Only `main.tsx` imports `App`. If two features need a component, move it *down*, never sideways.

## Enforced code rules
The numbering is referenced from code comments, so keep it stable.

1. **No casts around the type system.** `any`, `as any` and `as unknown as X` are banned. When
   the types fight you, make the function generic, narrow with a guard, or model the data as a
   discriminated union.
2. **Async is checked** (`no-floating-promises`, `no-misused-promises`, `await-thenable`,
   `require-await`). `getAllQuestions()`, `loadContent()` and `loadAllContent()` return
   Promises. Every `.then()` needs a `.catch()` that sets a terminal UI state.
3. **Hooks rules are errors**, including `exhaustive-deps` and `set-state-in-effect`. There are
   8 justified `set-state-in-effect` disables. Don't add a ninth; prefer `key`-based reset or
   deriving during render.
4. **Size limits:** `max-lines` 400, `max-lines-per-function` 300, `complexity` 20,
   `max-depth` 5. `LEGACY_LARGE_FILES` in `eslint.config.js` has one entry,
   `CodePlayground.tsx` at **780**. It may shrink, never grow, so new props there go on one line.
5. **Web storage only through `src/lib/storage.ts`** (`safeGet`/`safeSet`/`getJSON`/`setJSON`/
   `getEnum`/`safeRemove`), tests included. The accessor *throws* in private mode, often during
   render. **Key names are a compatibility contract** (user progress), pinned by
   `storageKeys.test.ts`. Renaming one needs a migration.
6. **Layering** as above.
7. **Bulk data lives in `src/data/`.** `verify:arch` fails on a `.ts` file over 1,200 lines under
   `components/`, `features/` or `pages/`.
8. **`verify:arch` guards the guards.** It pins that the lint glob covers `.ts/.tsx`,
   type-aware linting and `exhaustive-deps: error` stay on, the pre-push hook keeps every gate,
   the content glob is never `eager`, vendor chunks keep the `vendor-*` prefix, the app entry
   stays `app-*`, `injectRegister` stays `null`, and `prepare-content.js` never overwrites the
   Introduction, and that no file under `src/`/`scripts/` is gitignored (check #19; the
   personal-document patterns `*resume*`/`*Resume*` once hid `ResumeBanner.tsx` from CI),
   and that the admin document ships only encrypted (check #20).
   **Probe every new guard by reintroducing the bug it guards.** Several guards
   here passed green while being unable to fail.
9. **Tests are the gate for anything `tsc` cannot see.** `import.meta.glob` only resolves
   under Vite, so data-layer tests run in Vitest. Write a test for anything in `src/lib/`,
   anything pure in `data.ts`, every editor/text rule (replay keystrokes, as in
   `playgroundAutoClose.test.ts`), and every invariant a reference solution relies on.
   Component tests use `renderToStaticMarkup` or jsdom. There is no `@testing-library/react`.
   - **9a.** Async tests must drain timers before reading output, and must fail a run that
     printed nothing. Otherwise they pass having checked nothing.
   - **9b.** Solutions must feature-detect APIs newer than ~2023 (e.g. the ES2025 `Set` methods).
     `playgroundExecutable.test.ts` deletes those methods and re-runs every solution. Guide
     prose is exempt.
   - **9c.** Nothing on the first-paint path (`App.tsx`, `main.tsx`, `Sidebar.tsx`) may call
     `loadAllContent`/`getAllQuestions`. The badge uses `totalQuestionCount` from content-meta.
   - **9d. Contrast is symmetric.** A bare `text-slate-*` applies in both themes, and no single
     shade passes AA on both. House pairs: `text-slate-500 dark:text-slate-400` and
     `text-slate-600 dark:text-slate-400` (small labels). `text-slate-400 dark:text-slate-600`
     is inverted. The playground surfaces are always dark and exempt.
   - **9e.** Icon-only buttons need an `aria-label`. State-dependent labels must flip with the
     state.
   - **9f.** `isBuildExplanation` lives in `explanationKind.ts`. Importing it from
     `playgroundExplanations.ts` pulls 10k lines into the playground chunk. Type imports are
     fine.
   - **9g.** Every React Machine Coding template is mounted in jsdom
     (`reactTemplates.test.tsx`, which uses the real `buildReactScope`) and fails on any
     `console.error`. A redirect must be *rendered* (a `<Redirect>`-style component with a
     fire-once ref), never performed during render.
10. **Playground data: metadata eager, code bodies lazy.** `CodePlayground` imports values from
    `templateIndex.ts`, never `playgroundTemplates.ts`. `playgroundTemplates.ts` must keep
    **zero imports**, because the index generator executes it. A saved draft outranks the
    template only when it was edited: `ProgressEntry.baseHash` + `resolveOpenCode()`.
11. **The playground preview must never fail silently.** Keep all three: `PreviewErrorBoundary`,
    `createRoot({ onUncaughtError })`, and the window `error`/`unhandledrejection` listeners
    while a preview is live (`usePreviewMount`).
12. **Editor internals live in `src/lib/`.** `playgroundScope.ts` is *derived* from
    `Object.entries(React)` plus `createPortal`/`flushSync`/`browser`/`useFormStatus` from
    react-dom. Never hand-list it. There is no `ReactDOM` in scope, so guide blocks call the
    bare names. Filter state lives in the `useTemplateFilters` reducer. Tag/mode changes clear
    pattern and difficulty *inside the transition*, and `reset` does too. Picker display is
    derived by `buildTemplateCatalog`.
13. **Explain has two shapes.** `Explanation` (algorithm: complexity, pseudocode, visual steps)
    and `BuildExplanation` (React: brief → build steps → graded points). A build step
    **quotes its template by anchor** (`excerpt: { from, lines }`) and never restates code.
    `buildExplanationAnchors.test.ts` enforces this.

**Deliberate exceptions:** `src/data/**` is exempt from `max-lines`/`no-console`. `*.test.ts`
may cast and run long. `CodePlayground.tsx` has one `no-implied-eval` disable (`new Function`
is its purpose) and a scoped `no-console` disable around the console patch.
**Known lint gap:** `varsIgnorePattern: '^[A-Z_]'` hides unused PascalCase imports.

**When lifting JSX out of a component, check what it read from enclosing scope.** A bare
`location`, `history`, `name`, `status`, `length`, `top`, `parent`, `origin` or `event`
silently resolves to a `window` global and typechecks.

## Content and data
- **`data.ts` is the source of truth.** It holds `menuStructure` (categories → items), the
  `cheatSheets` array, and the loaders. Current counts: 10 categories (Front End 29, JS & TS 8,
  Back End 17, AI Engineering 6, AI-Augmented Development 1, DevOps 15, Git 2, DSA 1,
  Behavioral 1, System Design 4) = 84 guides, plus the Introduction, plus 14 cheat sheets.
  Recount guides by counting `{ name: '` inside each `items: [...]`.
- **Routes are a compatibility contract** (deep links, bookmarks, checkpoints, SEO). Category
  membership and URL are independent. AWS guides stay at `/aws/*` under DevOps, Docker/K8s at
  `/backend/docker-kubernetes`, and the AI & LLM guide at `/backend/ai-llm-engineering`.
  Don't move a shipped route.
- **React, JavaScript and TypeScript are guide series.** React (v1.7.14) is five guides:
  `react-guide.md` (§1–12, `/frontend/react`), `react-performance-guide.md` (§13–14),
  `react-19-patterns-guide.md` (§15–16), `react-interview-questions.md` (§17) and
  `react-tricky-questions.md` (§18). JavaScript and TypeScript (v1.7.15) are three each: the
  core guide (§1–14), `*-interview-questions.md` (§15) and `*-tricky-questions.md` (§16).
  - Section numbers continue across a series, so "§13.5" and every heading anchor stay valid.
    A link into another part is `/<route>#anchor`; markdown links starting with `/` render as
    router `Link`s (no reload), and `verify:counts` fails on a link whose route or heading
    doesn't exist.
  - Pre-split question ids, bookmarks, checkpoints and deep links to moved sections are
    migrated at start-up by `src/lib/guideSplitMigration.ts` from `src/data/guideSplits.ts`
    (generated by `scripts/dev/gen-guide-splits.cjs` from the v1.7.12 originals). A Tricky Qn
    was suffixed `-2` only when the Q&A also had a Qn, so the migration uses each guide's
    deployed `qaMax`. **Renaming a heading in a moved section means updating `movedAnchors`**;
    `guideSplitMigration.test.ts` pins every entry to the files.
  - Content tests read a whole series with `readSeries('react' | 'javascript' | 'typescript')`
    from `src/content/guideSeries.ts`, so a pinned block's marker works in any part.
  - Never renumber or remove a question in a series; append to the end of a sequence.
- **Sidebar groups:** `MenuItem.group` makes a heading. Every category with 4+ items is
  grouped, and heading order follows first appearance in `items`. When a guide set changes,
  update that category's `description` too, because homepage cards don't derive it.
- **Adding a category** means editing the hard-coded category number in three claim templates
  in `verify-counts.js` and adding a per-category claim. `scripts/lib/routes.js` picks up the
  route automatically.
- **Markdown is lazy-loaded, one chunk per guide.** Never set `eager: true` on
  `contentLoaders`. For a guide you haven't loaded, use `readMinFor(file)` /
  `estimatedHeightFor(file)` from content-meta, never `estimateReadingTime(content)`.
  `loadAllContent()` is memoised and only for Search, Quiz, Review and Interview Simulator,
  each of which has a loading state.
- Don't reinstate the README → Introduction copy in `prepare-content.js`.

### Questions (`extractQuestions`)
- Two patterns. The JS guide's output style is `## QN` + fence + `### ✅ Output` +
  `### 💡 Explanation`. The standard pattern is `**QN: text**` followed by an answer that ends
  at the next `**Q{N+1}:` or a standalone `---`, so **the explanation goes before the `---`**.
- **N must be a plain integer.** `**Q20b:` silently vanishes from Quiz.
- Ids are `${guide}-q${N}`, and most guides have two sequences (interview + Tricky).
  `dedupeIds()` suffixes the 2nd+ occurrences. **Never renumber**: ids key SM-2 review
  history. Append new questions at the *end* of a sequence, and rewrite existing ones in place
  so the id is unchanged.
- Tricky Output sections: 53 guides, 441 questions total. Recount with:
  `for f in $(grep -rl --include="*.md" -i '^## .*Tricky' src/content); do awk '/^## .*[Tt]ricky/{flag=1} flag' "$f" | grep -c '^\*\*Q[0-9]*:'; done`
- After adding a `**QN:**` marker, run `npm run content:meta`, or the `totalQuestionCount`
  parity test fails and names the guide.

### Writing guide content (house rules)
- **Every `js/jsx/ts/tsx` block gets a Try it button** (`isRunnable` + `canRunInPlayground` in
  `PreBlock`), so a block must **parse and run standalone**. A block must not continue an
  earlier one (repeat the code instead), must not call helpers it never defines (add a marked
  stand-in), and must not use top-level `ws.send` before `open`.
  - A block that would hang or crash the tab (an infinite render, a deliberate throw) or that is
    a lone signature or fragment gets the tag **`text`**. Data shapes get `json`. Two-file
    examples get `text`.
  - `PreBlock` auto-appends `render(<LastComponent />)` **with no props**. Give prop-taking
    components a `Demo` harness plus an explicit `render()`.
  - The playground runs a **sloppy script**, not a module, on React's **production** build
    **without StrictMode**. For claims about `this`, `arguments` or strictness, verify both as a
    module and under `new Function`, or use `'use strict'`.
  - A block that imports anything other than `react`/`react-dom` loses its button. That is the
    honest fix for a library-dependent example.
  - In BAD-vs-GOOD pairs, rename the **bad** one (`…Broken`) so the copyable name stays clean.
- **An `**Output:**` claim must be executed, never written by hand.** Pin it in a test
  (`interviewAnswerDemos.test.ts`, `reactApiScenarioDemos.test.tsx`, `typescriptGuideTypes.test.ts`,
  etc.). Test markers must be unique in the whole guide.
- **TypeScript guide:** Try it cannot show type errors. A compile error is a commented line
  ending `// ✗ TSnnnn: message`, checked by the compiler in `typescriptGuideTypes.test.ts`.
  Verify type claims with the compiler, not by eye.
- **A nested fence must be indented to match its list item** (check #17).
- **Tables need a first-column header**, never `| |` (check #14).
- **Anchors** follow `slugify()` in `data.ts`, which collapses runs of dashes, so `A — B`
  becomes `a-b`. `verify:counts` checks every in-page anchor.
- **Style:** define jargon inline at first use, never in a glossary table. Reference sections
  (§1–§N) stay scannable, and "why X not Y"/"which would you pick" goes in the Q&A section. When
  a reader wants more depth on a question, add it to the numbered section and link from the
  answer. An answer must engage every proper noun the question names. Open a tricky question on
  an unfamiliar API with two sentences on what the API is, then a line-by-line output table.
  Explanations carry the core idea plus the one non-obvious mechanism, not every step. Show the
  fixed code, not just prose about the fix.
- **Interview-question audits:** first extract every `**Qn:**` and template name, then regex each
  candidate against question *text* (not prose), read the borderline hits, and split into
  covered / gap before writing. Search for the distinctive mechanism, not the topic word.
- **Volatile facts** (versions, dates, specs, CVEs) are web-verified against primary sources,
  not recalled. When adding a "what's new" section, sweep the guide for claims it supersedes
  (`as of 20\d\d|latest version`).
- Don't bulk-add prose to code-first reference sections. Judge each section separately.

## Playground
- **Routes:** `/playground` (JS) and `/playground/react` share one `CodePlayground`, split by
  `src/lib/playgroundFlavor.ts`. The routes need `key="js"`/`key="react"`. Resume keys are per
  flavour, while drafts and solved state share `playground-progress`.
- **Runner** (`playgroundRunner.ts`): plain JS runs in a Worker with a 3 s timeout, and
  JSX/React runs on the main thread. TypeScript is **always** on in the Babel transpile, so
  don't reintroduce TS detection there. `stripModuleSyntax` removes import/export. Top-level
  `await` retries as an `AsyncFunction`. `detectJSX` strips comments first and ignores
  self-defined hooks, and is skipped for `lang: 'ts'`. **Keep `playgroundRunner.ts` and
  `scripts/verify-code-blocks.js` compiling identically** (e.g. legacy decorators).
- **Grading:** "solved" means all visible tests + all hidden tests + (for TS challenges) the type
  check pass. The logic lives in one place, `src/lib/challengeJudge.ts`. Hidden-test outputs are
  generated by the reference solution (`scripts/dev/verify-hidden-tests.cjs` →
  `build-hidden-tests.cjs`), and every hidden test must fail on the stub. React checks target
  role, name or text, never class names (`scripts/dev/build-react-checks.cjs`). They run in four
  jsdom shards.
- **Template authoring hazards:**
  - `code:` values are template literals. **Write no backticks in template comments.**
    `verify:arch` catches an unescaped backtick. Inside the literal, escape `` \` `` and `\${`
    with ONE backslash, and write a `\n` inside a string as `\\n`.
  - Plain-JS templates must avoid `render(`, `<[A-Z]` and `rerender`, which route them to the
    React path.
  - Every snippet runs standalone, so never call a method defined in another template.
  - Never execute code that clobbers a built-in (it poisons the Vitest worker). If a test run
    hangs, suspect prototype pollution, and check `ps` for runaway vitest processes.
  - A solution must obey its own challenge's bans in **every** approach labelled as satisfying
    them.
  - Don't name things `cache`, which collides with React's `cache` in scope.
  - **The React preview pane is white**, even though the editor is dark. A template that
    sets light text on its root must also set its own dark background.
    `previewContrast.test.tsx` mounts every React template and the blank starter and fails on
    any visible text under WCAG AA (4.5:1, 3:1 for large text). It models what jsdom can't:
    buttons and inputs reset text to black, and `var()` colours are skipped.
  - Challenge templates carry no `CHALLENGE:` header or `// TASK` block, because the Problem
    panel shows the statement.
  - **Typecheck is not enough.** Extract and run after editing templates or solutions.
- **Adding a JS Coding Challenge:** template (`patterns` + `difficulty`), solution (2+
  approaches), `playgroundSolutionKeys.ts`, explanation + registry entry (2+ approaches, a visual
  key on every step, because `DEPTH_DEBT` is a ratchet), `playgroundExplanationKeys.ts`, a
  `challengeProblems.ts` entry (every example has a `run` snippet), 4+ hidden tests, `EXPECTED`
  in `playgroundContent.test.ts`, **`totalJsChallenges` in `useTemplateCatalog.test.ts`**,
  README + Introduction counts, and the changelog. A TypeScript challenge instead needs its stub
  to have ≥1 diagnostic and its solution 0.
- **Adding a React Machine Coding template:** template, a `playgroundBuildExplanations.ts`
  walkthrough, `playgroundExplanationKeys.ts`, ≥3 checks in `reactChecks.ts`, the challenge
  track (`challengeTracks.ts`), `EXPECTED` counts, and prose counts. Rebuild existing templates
  in place (same name) so progress keys survive.
- Then run `npm run playground:index && npm run content:meta && npm run verify`.
- **Explain walkthroughs trace the example one iteration per step** (or one call, pop, tick,
  render). Never merge iterations or write "Continue...", and give every step a visual frame.
  If the trace is too long, shrink the example. Take every value from running the code.
  `playgroundContent.test.ts` fails on an out-of-range `pseudoLine` and on skip phrases.
  `computation` renders `lhs op rhs = result`, so don't put `=` in `op`. `result: { found:
  false }` renders its `value` (or "No solution found") as a warning. Polyfill walkthroughs
  pass a `trace` (9th arg of `polyfillExplanation`). Explanation prose is rendered through
  `explanationViews/RichText.tsx` (blank-line paragraphs, `•`/`-`/`1.` lists, `**bold**`,
  `*italic*`, `` `code` ``). Put any new text field in the Explain modals through `RichText` or
  `InlineText`, never a bare `{string}`.
- Editor behaviours (auto-close, bracket rules, Reset gating) live in
  `playgroundAutoClose.ts` and are tested by keystroke replay. Read that test before changing
  them.

## Query Playground (`/query-playground`)
Real PostgreSQL (PGlite, ~5 MB, dynamically imported) and mingo for MongoDB. The engine must
never reach the eager payload. `checkAnswer.ts` ignores column order and treats numeric strings
as numbers. `solutions.test.ts` runs every reference solution and asserts that the classic
wrong answer is rejected. **When adding a question, add the dataset row that makes the wrong
answer wrong.** Every SQL question has a `mysqlNote`.

## Styling
Tailwind with custom prose styles in `index.css`. No `@tailwindcss/typography`. Code blocks are
always dark (`#22272e`), and the Code Playground is always dark like an IDE. When raising a base
colour, check that its `:hover` still differs. There is no `Github` icon in this lucide version,
so use the inline `GithubIcon`.
- **Design tokens** (v1.7.13, "Focused & vivid"): `canvas` (soft grey page), `surface` (white
  cards), `ink`, `muted`, `line`, `accent` (indigo-violet: actions, links, focus, plus
  `-strong`/`-soft`/`-contrast`) and `pop` (coral: progress, streaks, highlights, plus
  `-ink`/`-soft`) are RGB triples on `:root` and `.dark` in `index.css`, mapped in
  `tailwind.config.js`. UI code uses tokens (`bg-surface text-ink`), not raw slate/indigo, so a
  palette change is one edit. **Coral is a fill: put ink on it, never white** (2.7:1). Status
  colours (emerald/amber/red) and the per-category tags in `HomePage` are the only other hues.
  No gradients, glow shadows or `backdrop-blur`. The playground and query playground surfaces
  stay always-dark and use fixed teal/slate shades, not tokens: a token's light-mode value
  would be dark-on-dark there.
- **Font is a system stack.** No web font, so nothing blocks first paint. Don't reintroduce Inter.
- **Motion:** `<MotionConfig reducedMotion="user">` in `main.tsx` and the
  `prefers-reduced-motion` block in `index.css` must stay. No entrance animations on content, no
  hover lifts.
- **Focus:** a global `:focus-visible` ring in the accent. An input with `outline-none` needs a
  visible focus style on itself or its container.
- **Active links are marked `aria-current="page"`**, which is also what `Sidebar.test.tsx` checks.
- `/privacy` and `/terms` (`LegalPage.tsx`) are drafts with an "Open items" list. Describe only
  what the site does (localStorage, GA4, GitHub Pages); never add a commitment it doesn't keep.

## Performance and deployment
- **Domain:** `prephub.sreenathp.com`, a Cloudflare DNS `CNAME` to `sreen98.github.io`, set as
  the repo's GitHub Pages custom domain. The deploy step's `cname:` input writes the `CNAME`
  file on every deploy; never remove it, or the domain is dropped and the root-based asset
  paths 404 on `sreen98.github.io/prephub/`. GitHub 301-redirects the old address.
- **Base path `/`** is set once, as `base` in `vite.config.js`. The router reads it through
  `import.meta.env.BASE_URL`, and `AdminPage` builds its fetch URL from it. If the base ever
  changes, also change the PWA `scope`/`start_url`, the runtime-cache `urlPattern`,
  `pathSegmentsToKeep` in `public/404.html`, and the absolute URLs (`index.html` meta,
  `robots.txt`, `SITE_URL` in `generate-sitemap.js`).
- `scripts/generate-route-shells.js` writes `dist/<route>/index.html`
  for every route so deep links return 200. `/admin` is excluded. `public/404.html` stays.
- **`/admin` is encrypted, not passcode-gated.** A check in the browser hides nothing on a
  static site. The plain document is the gitignored `private/admin-prep.md`, and only
  `public/admin-prep.enc.json` ships (AES-GCM, key from the passphrase by PBKDF2). After
  editing the document, run `ADMIN_PASSPHRASE=… npm run admin:encrypt` and commit the
  `.enc.json`. Never import `private/` from `src/` (a local build would bundle it), and never
  put the passphrase in the repo. `src/lib/adminCrypto.ts` and
  `scripts/encrypt-admin-prep.js` must stay format-compatible (`adminCrypto.test.ts`).
- The service worker precaches the shell only (`app-*`, `vendor-*`). Guide chunks are
  runtime-cached. It is registered by `src/pwa.ts` (`injectRegister: null`), which polls for
  updates. `onNeedRefresh` is inert in `autoUpdate` mode.
- The theme is resolved by a blocking inline script in `index.html`. Keep it inline and
  synchronous.
- The sidebar shows `v{APP_VERSION}` from `package.json`. Don't use Vite `define` for it,
  because it breaks in dev.
- Don't add `content-visibility: auto` to guides, because it breaks anchor scroll targets.
- `ContentPage` memoises the rendered `<ReactMarkdown>` body on `[content, markdownComponents]`.
  Parsing a long guide takes ~900 ms, so keep that memo, and keep everything that feeds
  `markdownComponents` stable (a new function per render re-parses the guide on every click).
- Lazy-load heavy libraries (mermaid, babel, prettier, the TS worker) with `import()`, and weigh
  bundle size before adding any dependency. A heavy module leaking into a small chunk has
  happened four times, so watch Rollup's warnings.
- CI runs Node 24, and `engines.node` is `>=22`. When a version pin is doing safety work by
  accident, make the safety explicit before changing the pin.

## Releases and the changelog
Semantic versioning, from `package.json`. **Bump `package.json` and add the new `## vX.Y.Z`
heading to `src/content/changelog.md` before writing any notes.** Check #15 fails if a released
(tagged) section changes. The changelog feeds the in-app "What's New" modal, so it holds
user-facing notes only (content, features, fixes). Put sizes, refactors and internals here or in
`docs/engineering-notes.md`.

## After every change (mandatory, do it without being asked)
1. **`CLAUDE.md`**: update it if architecture, conventions or instructions changed. Keep it
   operative: record the rule here and the incident or measurement in
   `docs/engineering-notes.md`.
2. **`README.md`**: update it for user-facing changes (features, guides, counts, commands).
3. **`src/content/changelog.md`**: add a user-visible note.
4. `npm run verify`, then check by hand what tests can't see: `npm run dev`, light and dark
   mode, mobile width.
