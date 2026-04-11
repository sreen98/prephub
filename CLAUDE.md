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
- `cheatSheets` array in `data.ts` defines cheat sheet routes separately from guide categories.
- All question extraction happens via `extractQuestions()` which parses two markdown patterns (JS output-style `## QN` and standard `**QN: text**`).

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
- **Code blocks**: `PreBlock` wraps all `<pre>` elements, adds copy/try-it buttons. Mermaid blocks are detected by `language-mermaid` class and routed to `MermaidBlock`.
- **JSX in Playground**: Detected via `/<[A-Z]/.test(code) || /render\s*\(/.test(code)`. Transpiled by lazy-loaded `@babel/standalone`. React scope injected via `new Function(...keys, code)(...values)`.
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
