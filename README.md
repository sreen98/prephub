# PrepHub - Interview Preparation Platform

A comprehensive, modern web app for full-stack developer interview preparation. Built with React 19, deployed on GitHub Pages as a PWA.

**Live site: [sreen98.github.io/prephub](https://sreen98.github.io/prephub/)**

## Features

### Study Content
- **68 guides across 8 categories** — Front End (20: React, Next.js & RSC, Frontend Architecture, Modern CSS, Accessibility (a11y), **Web Performance**, **Testing Strategy & E2E**, React Native & Apps, Play Store Deployment, Redux Toolkit, Redux Saga, TanStack Query, Storybook, Jest & RTL, Frontend Tooling, Browser APIs, Real-Time Web, Design Patterns, Refactoring & Code Review, React Comparisons), JS & TS (4: JavaScript, TypeScript, Regex, JS Comparisons), Back End (14: Node.js, Express, MongoDB, **SQL & Relational DBs**, API Design, Database Schema, CORS, Web Security, OAuth & SSO, Microservices, **Docker/K8s/CI-CD**, Stripe Integration, AI & LLM Engineering, Backend Comparisons), AWS (7: IAM, EC2, S3, Lambda, CloudWatch, Frontend Deployment, AWS Comparisons), Git (2), DSA (1), Behavioral (1), System Design (4: System Design, Frontend System Design, **Low-Level Design (LLD)**, Design Comparisons)
- **14 cheat sheets** — TypeScript, Python, SQL, GraphQL, Regex, Docker & Kubernetes, React Hooks, JS ES6+, Big-O, CSS Flexbox/Grid, HTTP Status Codes, Git Commands, Git Workflows & Advanced, Comparison Tables
- **Mermaid diagrams** — architecture diagrams rendered as interactive visuals
- **Tricky Output Questions** — "Guess the Output" sections in **45 guides** totalling **344 questions**, each paired with a detailed explanation and followed by a cheat-sheet summary. Counts by guide: React 26, TypeScript 19, JavaScript 16, React Native 16, Node.js 14, Browser APIs 12, AI & LLM Engineering 10, Redux Toolkit 10, Redux Saga 10, Play Store Deployment 10, MongoDB 10, Express 10, Frontend System Design 8, Regex 8, Real-Time Web 8, OAuth & SSO 8, Microservices 8, Refactoring & Code Review 7, Modern CSS 6, Stripe 6, Accessibility 5, Frontend Architecture 5, **SQL 4**, **Web Performance 4**, Design Patterns 4, Next.js & RSC 4, Web Security 4, **Docker/K8s/CI-CD 3**, **Testing Strategy 3**, **Low-Level Design 3**
- **Syntax-highlighted code blocks** with copy and "Try it" buttons
- **Reading time estimates** on every guide
- **Table of Contents** — auto-generated from headings, tracks active section while scrolling

### Interactive Tools
- **Quiz Mode** — flashcard-style Q&A extracted from guides, with difficulty filters (Beginner/Intermediate/Advanced)
- **Daily Review** — spaced repetition (SM-2 algorithm) schedules questions for optimal retention
- **Interview Simulator** — timed mock interviews with configurable question count, time limit, and category selection
- **Code Playground** — run JavaScript and React/JSX code in-browser with live preview and streaming console logs; **180 built-in templates** across JS fundamentals (6), JS interview topics (7), React basics + advanced (6), **32 JS polyfills** (Array map/filter/reduce/forEach/find/some/every/flat/includes/from/sort/indexOf/reverse/slice/splice/concat/isArray/fill/join, Function bind/call/apply, Promise all/allSettled/race/any, Object.assign/create/freeze + keys/values/entries, String padStart/padEnd/repeat, JSON.stringify/parse, plus a How-to-Write-a-Polyfill guide), **94 JS coding challenges** and **35 React Machine Coding** challenges for **129 challenges total**. Array/string coverage includes two-pointer, sliding-window (Longest Substring, Minimum Size Subarray Sum, Sliding Window Maximum, Longest Repeating Char Replacement, Minimum Window Substring), interval merging, matrix rotation, in-place permutation, run-length encoding, case conversion and Fisher-Yates shuffling. **88 challenges have a multi-approach "Show Solution"** with a Time/Space/Verdict comparison table, and 35 have a step-by-step **Explain** modal with animated visual walkthroughs; React Machine Coding now covers the LLD components interviewers ask for by name — Counter (re-render optimization), Todo List (localStorage + memo), Search with Debounce + Cancel, Modal (Portal + Focus Trap), Form with Validation, Theme Switcher (dark/light/system), Auto-Complete (ARIA combobox) and Infinite Scroll. templates browser is a centered 2-pane modal with pattern + difficulty filters and status dots (Solved / In-Progress)
- **Auto-saved progress per challenge** — your code is auto-saved every keystroke (debounced) and restored when you come back. Notes scratchpad per challenge for thoughts. Reset Code button to revert to the stub. Test pass/fail summary pill after each Run. "X / 94 solved" counter, status badges, Continue-last-session pill on /playground entry
- **Resizable editor + word-wrap toggle** — drag the divider between editor and output to resize; toggle word-wrap on/off when the pane gets narrow

### Study Effectiveness
- **Progress Tracking** — guides auto-marked as in-progress on visit, manual "Mark Complete" with visual status dots
- **Bookmarks** — bookmark any heading or quiz question, dedicated bookmarks page
- **Checkpoints** — set a "where I left off" marker on any guide; a banner at the top lets you jump back with one click on return. Global `/checkpoints` page lists all of them across guides
- **Study Streak** — daily visit tracking with streak counter and milestone celebrations (confetti at 7, 14, 30, 60, 100 days)
- **Deep Section Links** — click any heading's link icon to copy a shareable URL with anchor

### UX
- **Dark/Light Mode** — system preference detection + manual toggle, persisted
- **Font Size Preferences** — Small/Medium/Large toggle, persisted
- **Full-text Search** (Cmd+K) — searches across all guide content with result snippets and search highlighting
- **PWA** — installable, works offline, auto-updates
- **Responsive** — mobile sidebar, collapsible desktop sidebar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19, React Router 6 |
| Build | Vite 6 |
| Styling | Tailwind CSS 3 |
| Animation | Framer Motion |
| Content | Markdown + react-markdown, remark-gfm, rehype-highlight |
| Diagrams | Mermaid (lazy-loaded) |
| JSX Runtime | @babel/standalone (lazy-loaded) |
| Icons | Lucide React |
| PWA | vite-plugin-pwa + Workbox |
| Deployment | GitHub Pages |

## Project Structure

```
prephub/
  src/
    App.tsx                    # Main app: layout, sidebar, routes, ContentPage, HomePage
    data.ts                    # menuStructure, contentFiles, utilities, cheatSheets
    main.tsx                   # Entry point (BrowserRouter)
    index.css                  # Tailwind + custom styles
    components/
      QuizMode.tsx             # Flashcard quiz with difficulty/guide filters
      ReviewPage.tsx           # Spaced repetition daily review
      InterviewSimulator.tsx   # Timed mock interview (setup/interview/results)
      CodePlayground.tsx       # JS/React code editor with template drawer
      BookmarksPage.tsx        # Saved bookmarks listing
      CheckpointsPage.tsx      # Per-guide "where I left off" listing
      CheatSheetsIndex.tsx     # Cheat sheet card grid
      MermaidBlock.tsx         # Lazy mermaid diagram renderer
      RouteErrorBoundary.tsx   # Catches route render errors (incl. post-deploy chunk failures)
      playgroundAutoClose.ts   # Pure auto-close rules for the editor (JSX tags, bracket pairs)
      StreakCelebration.tsx    # Streak milestone celebration overlay
      Toast.tsx                # Reusable toast notification
    hooks/
      useDarkMode.ts           # Theme toggle (localStorage)
      useReadingPrefs.ts       # Font size S/M/L (localStorage)
      useProgress.ts           # Guide completion tracking (localStorage)
      useBookmarks.ts          # Bookmark management (localStorage)
      useCheckpoints.ts        # One-per-guide reading checkpoint (localStorage)
      useSpacedRepetition.ts   # SM-2 algorithm scheduling (localStorage)
      useStudyStats.ts         # Streak & gamification stats (localStorage)
    content/
      front-end/               # React, React Native & Apps, Play Store Deployment, Redux Toolkit, Redux Saga, TanStack Query, Storybook, Jest & RTL, Frontend Tooling, Browser APIs, Real-Time Web, Design Patterns, Refactoring & Code Review, React Comparisons
      javascript-and-typescript/ # JavaScript, TypeScript, JS Comparisons
      back-end/                # Node.js, Express, MongoDB, API Design, Database Schema, CORS, Backend Comparisons
      aws/                     # IAM, EC2, S3, Lambda, CloudWatch, Frontend Deployment, AWS Comparisons
      git/                     # Git Guide, Git Comparisons
      dsa/                     # Data structures & algorithms
      behavioral/              # STAR method, leadership principles
      system-design/           # System Design Guide, Design Comparisons
      cheatsheets/             # 7 quick reference sheets
      changelog.md
  scripts/                     # prepare-content.js, generate-sitemap.js
  public/                      # PWA icons, favicon
  vite.config.js               # Vite + PWA plugin config
  tailwind.config.js
  .github/workflows/deploy.yml # GitHub Pages CI/CD
```

## Development

```bash
npm install
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run verify:counts  # Check the counts in the docs still match the content
npm run typecheck  # Type-check without emitting
npm run lint       # Lint
```

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `theme` | Light/dark mode |
| `readingFontSize` | Font size preference |
| `lastSeenChangelog` | Changelog version tracking |
| `guide-progress` | Guide completion status |
| `bookmarks` | Saved bookmarks |
| `checkpoints` | One reading-position checkpoint per guide (map keyed by `guidePath`) |
| `playground-progress` | Per-challenge code drafts + notes + solved status (map keyed by template name) |
| `playground-wrap` | Editor word-wrap toggle (`'1'` on / `'0'` off) |
| `playground-last-session` | Most recently edited template name (drives the Resume pill) |
| `playground-split-pct` | Editor / output split percentage |
| `sr-schedule` | Spaced repetition schedule |
| `study-stats` | Streak and gamification data |
| `interview-history` | Past interview sim results |

## Deployment

Push to `main` branch triggers automatic deployment via GitHub Actions:
1. Installs dependencies
2. Runs `prepare-content.js` (copies any root-level markdown to `src/content/`)
3. Builds with Vite
4. Deploys `dist/` to GitHub Pages

---

Built for learning. Good luck with your interviews!
