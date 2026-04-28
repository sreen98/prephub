# CLAUDE.md - Project Context for Claude Code

## What is this project?
PrepHub is an interview preparation web app. It renders markdown study guides as a modern React site with interactive features (quiz, playground, spaced repetition, interview simulator). Hosted on GitHub Pages as a static PWA — no backend, all state in localStorage.

## Repository layout
- `/src/` — React app source code (components, hooks, content, styles)
- `/scripts/` — build scripts (`prepare-content.js`, `generate-sitemap.js`)
- `/public/` — static assets (icons, favicon, robots.txt)
- `/src/content/` — markdown study guides loaded at build time
- `.github/workflows/deploy.yml` — CI/CD to GitHub Pages

## Build & run
```bash
npm install
npm run dev          # local dev server at localhost:5173
npm run build        # production build → dist/
```
Build must pass before pushing. The deploy workflow runs `prepare-content.js` then `npm run build`.

## Architecture decisions

### Single-file vs multi-file
- `App.tsx` is large (~1200 lines) because it contains the layout, sidebar, ContentPage, HomePage, and several inline components (ReadingProgress, PreBlock, TableOfContents, MobileToc, SearchModal, BackToTop). Larger features get their own files in `components/`.
- Hooks follow a consistent pattern: useState + localStorage read/write + callback functions. See `useDarkMode.ts` as the canonical example.

### Data flow
- `data.ts` exports `menuStructure` (defines all guide categories/items), `contentFiles` (eager glob of all markdown), and utility functions. This is the single source of truth for content structure.
- Current counts: 8 categories (Front End 11, JS & TS 3, Back End 7, AWS 7, Git 2, DSA 1, Behavioral 1, System Design 2) = 34 guides, plus an Introduction entry. 7 cheat sheets.
- `cheatSheets` array in `data.ts` defines cheat sheet routes separately from guide categories.
- All question extraction happens via `extractQuestions()` which parses two markdown patterns:
  1. **JS output-style** (`## QN` + ` ```…``` ` + `### ✅ Output` + `### 💡 Explanation`) — used only by the JavaScript guide.
  2. **Standard** (`**QN: text**` followed by an answer block, terminated by the next `**Q{N+1}:` marker **or a standalone `---` line**). Everything between the marker and that terminator becomes the Quiz-mode answer — so the explanation for a question must live BEFORE the `---` separator, not after it.
- "Tricky Output Questions" sections currently live in 10 guides: JavaScript (11 Qs), TypeScript (16), React (22 — 16 core + 6 Performance Pitfalls), React Native (16), Redux Saga (10), Redux Toolkit (10), Node.js (12), Express (10), MongoDB (10), Browser APIs (12) — 129 total. All use the standard `**QN: ...**` pattern except the JS guide, which uses both the JS output-style (for its standalone output-style questions) and the `**QN:**` format for its tricky section.

### Content
- Markdown files in `src/content/` are loaded at build time via `import.meta.glob` with eager loading. They're bundled into the JS, not served as separate files.
- Mermaid diagrams use ` ```mermaid ` code blocks in markdown. The `MermaidBlock` component lazy-loads the mermaid library.
- The `prepare-content.js` script can copy root-level markdown folders to `src/content/` with directory name transforms (e.g., "Back End" → "back-end").

### Styling
- Tailwind CSS with custom prose styles in `index.css` (not the @tailwindcss/typography plugin).
- Code blocks always use dark theme (`#22272e` background) regardless of light/dark mode.
- The Code Playground uses a fully dark IDE theme in both modes.

### Key patterns
- **Heading IDs**: `createHeading` in ContentPage generates IDs via `slugify(getTextContent(children))`. Used by TOC, deep links, and bookmarks.
- **Code blocks**: `PreBlock` wraps all `<pre>` elements, adds copy/try-it buttons. Mermaid blocks are detected by `language-mermaid` class and routed to `MermaidBlock`. The "Try it" handler auto-appends `render(<Component />)` when it finds JSX with no render call, so snippets from React guides are runnable without manual edits.
- **JSX in Playground**: Detected via `/<[A-Z]/.test(code) || /render\s*\(/.test(code)`. Transpiled by lazy-loaded `@babel/standalone`. React scope injected via `new Function(...keys, code)(...values)`.
- **Playground console capture**: `console.log/warn/error` are patched once on mount (not per-run) and write into a ref. A flush interval copies the ref into state while a React preview is live, so async logs from intervals/effects keep streaming. The patch is restored on unmount.
- **Playground sidebar toggle**: Playground emits a `prephub:show-sidebar` window event; `App` listens and opens/uncollapses the sidebar. The floating expand button is hidden on `/playground` to avoid overlapping the editor — the playground header has its own inline toggle.
- **Spaced Repetition**: SM-2 algorithm in `useSpacedRepetition.ts`. Quality 4 = "Got It", 1 = "Study Again".

### localStorage schema
All persistence is in localStorage. Key schemas are documented in README.md. Important: never store sensitive data — this is a public study tool.

### What NOT to do
- Don't add a backend. Everything must work as a static site on GitHub Pages.
- Don't use `@tailwindcss/typography` — prose styles are custom in `index.css`.
- Don't import `Github` from lucide-react (it doesn't exist in this version) — use the inline `GithubIcon` SVG component.
- Don't make the Code Playground light-themed — it's intentionally always dark like an IDE.
- Don't add new dependencies without considering bundle size. Lazy-load heavy libs (mermaid, babel) via dynamic `import()`.

### Deployment
- Base path is `/prephub/` (configured in `vite.config.js` and BrowserRouter basename).
- PWA configured via `vite-plugin-pwa` with `autoUpdate` registration.
- Icons in `public/` (pwa-192x192.png, pwa-512x512.png).

### Testing
There are no automated tests. Verify changes by:
1. `npm run build` must succeed
2. `npm run dev` and manually check the affected feature
3. Check both light and dark mode
4. Check mobile responsive layout

## After making changes — MANDATORY
**Every change, no matter how small, MUST check and update these three files before finishing. Do NOT wait for the user to remind you. This is a blocking requirement — do it automatically as the final step of every task.**

1. **`CLAUDE.md`** — Update if the change affects architecture, patterns, content structure, or instructions (e.g., new categories, new components, new conventions, repo structure).
2. **`README.md`** — Update if the change is user-facing (new features, new guides, updated counts, tech stack changes, project structure, dev commands).
3. **`src/content/changelog.md`** — Update if the change is something the end user should see (new content, new features, UI changes, bug fixes). This powers the in-app "What's New" modal.

## Versioning
- Uses semantic versioning. Current version is in `package.json`.
- Version `1.0.0` marks the first stable release with the repo rename to `prephub`.

## What's New (Latest Changes)
- **Browser APIs guide (v1.0.5)** — New Front End guide covering DOM/EventTarget, Storage APIs (cookies, localStorage, sessionStorage, IndexedDB, Cache API + comparison table), Network (fetch, XHR, AbortController, WebSockets, SSE + WS/SSE/Polling comparison), Workers (Web/Shared/Service + comparison), Observers (Intersection, Mutation, Resize, Performance), History API + bfcache, Performance API, Scheduling (setTimeout / queueMicrotask / rAF / rIC), File/Blob/Streams, Geolocation/Notifications/Clipboard, Web Crypto, Cross-tab messaging (postMessage / BroadcastChannel / MessageChannel), Page Lifecycle, Permissions, URL/URLSearchParams. Closes with **16 interview questions** (Beginner/Intermediate/Advanced) and **12 tricky questions** (storage/lifecycle, network/async, workers/threading, DOM/events, lifecycle/perf), plus a 15-rule cheat sheet. Total tricky questions across the app: 117 → 129.
- **React Performance & Build-Tooling expansion (v1.0.5)** — React guide section 13 grew from 5 short subsections (memo, useMemo/useCallback, lazy, virtualization, rules) to a 13-subsection deep dive: added Concurrent Features (useTransition/useDeferredValue), Profiling & Measurement (DevTools Profiler + Core Web Vitals + `web-vitals` library), Common Re-render Causes table, Image/Asset Optimization, Webpack vs Vite comparison, Bundle Analyzers (`rollup-plugin-visualizer`, `webpack-bundle-analyzer`, `source-map-explorer`), Tree Shaking + Code Splitting strategies, Server Components / SSR / Streaming, plus an expanded 14-rule cheat sheet. Added **8 interview Qs (Q19–Q26)** and **6 tricky Qs (Q17–Q22, "Performance Pitfalls")** in the standard `**Q{N}: ...**` + answer-before-`---` format.
- **Play Store Launch guide expansion (v1.0.5)** — Beyond the original launch playbook, the guide now includes a deep-dive "Android Build Internals" section (AAB vs APK, the build pipeline, R8 shrinking/obfuscation with keep rules, signature schemes V1–V4, upload key vs app signing key, key recovery/upgrade/rotation, manifest merger, Hermes + baseline profiles, Dynamic Delivery, OTA boundaries), a "React Native and Expo Build Concerns" section (JSI/Fabric/TurboModules/Bridgeless, Managed vs Bare workflow, EAS vs local Gradle, sourcemaps, expo-doctor), and a "Bundletool / Pre-Launch Report / Internal App Sharing" section. Closed with **24 interview questions** (Beginner/Intermediate/Advanced) and **10 tricky scenario questions** in the standard `**Q{N}: ...**` + answer + `---` format so Quiz Mode picks them up. Final 20-rule cheat sheet section at the end.
- **Tricky-section rewrite (v1.0.5)** — All 111 Tricky Output Questions across 9 guides were rewritten to state the question clearly in one sentence and follow with a detailed teaching-style explanation (not the previous 2-3 line summaries). Parser contract preserved: each Q stays in the `**Q{N}: text**` + answer-block + `---` format, with the full explanation placed BEFORE the `---` separator so Quiz mode still captures it.
- **Playground fixes (v1.0.4)** — Console output now splits space evenly with the React preview (no more collapsed sliver). Console patch is persistent so async logs from intervals/effects keep flowing. "Try it" from React guides auto-appends `render(<Component />)`. Templates UI redesigned as a centered 2-pane modal (categories + snippet cards) instead of the cluttered drawer. On `/playground`, the floating sidebar expand button is hidden and replaced by an inline toggle in the playground header to stop it overlapping the editor.
- **React Native & Apps guide** — New Front End guide covering core components, Flexbox (platform differences), `FlatList`/`SectionList` perf, React Navigation + Expo Router, platform APIs, SafeArea/Keyboard, storage (AsyncStorage/MMKV/SecureStore/SQLite), animations (Animated + Reanimated), gestures, native modules, New Architecture (JSI/Fabric/TurboModules/Hermes), push notifications, deep linking, OTA updates (EAS Update / CodePush), accessibility, i18n. 30 interview Qs (split by difficulty) + 16 tricky output/conceptual questions with a cheat sheet.
- **Tricky Output Questions** — "Guess the Output" sections added to 7 guides: React (16Q), TypeScript (16Q), Node.js (12Q), Redux Saga (10Q), Express.js (10Q), MongoDB (10Q), Redux Toolkit (10Q). Each follows the `**QN: text**` + `**Output:**` format with a cheat sheet at the end. JS guide already had this section.
- **v1.0.0** — Repo renamed from `interview-prep` to `prephub`. Base path updated to `/prephub/` across all configs.
- **CORS guide** — New Back End guide covering Same-Origin Policy, CORS headers, preflight, credentialed requests, Express.js configuration, debugging, and 15 interview Q&A
- **Flattened repo structure** — Moved app from `web/` subfolder to root. All configs, `src/`, `scripts/`, `public/` now live at the repo root.
- **Frontend Tooling guide** — New Front End guide covering Webpack, Vite, npm/yarn/pnpm, bundler comparisons, package.json, npx, and 20 interview Q&A
- **React Machine Coding challenges** — 10 new playground templates: Pagination, Search Filter, Chat App, Modal, Image Gallery + Lazy Load, Drag-and-Drop, Product List Sort & Filter, Responsive Navbar, Infinite Scroll, Notifications
- **TypeScript migration** — All `.jsx`/`.js` files converted to `.tsx`/`.ts` with type annotations and `tsconfig.json`
- **Git category** — New sidebar section with Git Guide (internals, branching, rebasing, workflows) and Git Comparisons
- **Jest & React Testing Library guide** — Added to Front End section covering Jest, RTL patterns, hooks, Redux, forms, routing
- **Git Workflows cheat sheet** — Interactive rebase, cherry-pick, bisect, reflog, Git Flow, GitHub Flow
- **Mermaid rendering fixes** — `suppressErrorRendering`, off-screen container ref, DOM cleanup for orphaned elements
- **"Try it" opens in new tab** — Code playground button uses `window.open()` instead of `navigate()` to preserve reading context
