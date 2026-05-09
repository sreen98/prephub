# PrepHub - Interview Preparation Platform

A comprehensive, modern web app for full-stack developer interview preparation. Built with React 19, deployed on GitHub Pages as a PWA.

**Live site: [sreen98.github.io/prephub](https://sreen98.github.io/prephub/)**

## Features

### Study Content
- **39 guides across 8 categories** — Front End (14: React, React Native & Apps, Play Store Launch, Redux Toolkit, Redux Saga, TanStack Query, Storybook, Jest & RTL, Frontend Tooling, Browser APIs, Real-Time Web, Design Patterns, Refactoring & Code Review, React Comparisons), JS & TS (4: JavaScript, TypeScript, **Regex**, JS Comparisons), Back End (8: Node.js, Express, MongoDB, API Design, Database Schema, CORS, Stripe Integration, Backend Comparisons), AWS (7: IAM, EC2, S3, Lambda, CloudWatch, Frontend Deployment, AWS Comparisons), Git (2), DSA (1), Behavioral (1), System Design (2)
- **7 cheat sheets** — React Hooks, JS ES6+, Git Commands, Git Workflows & Advanced, Big-O, CSS Flexbox/Grid, HTTP Status Codes
- **Mermaid diagrams** — architecture diagrams rendered as interactive visuals
- **Tricky Output Questions** — "Guess the Output" sections in 12 guides (JavaScript, TypeScript, React, React Native, Redux Saga, Redux Toolkit, Node.js, Express, MongoDB, Browser APIs, Stripe, Real-Time Web) totalling 143 questions, each paired with a detailed explanation and followed by a cheat-sheet summary (React's 22 are split into 16 core + 6 Performance Pitfalls; Browser APIs has 12; Stripe has 6 scenario questions; Real-Time Web has 8 scenario questions covering SSE/WebSocket/WebRTC failure modes)
- **Syntax-highlighted code blocks** with copy and "Try it" buttons
- **Reading time estimates** on every guide
- **Table of Contents** — auto-generated from headings, tracks active section while scrolling

### Interactive Tools
- **Quiz Mode** — flashcard-style Q&A extracted from guides, with difficulty filters (Beginner/Intermediate/Advanced)
- **Daily Review** — spaced repetition (SM-2 algorithm) schedules questions for optimal retention
- **Interview Simulator** — timed mock interviews with configurable question count, time limit, and category selection
- **Code Playground** — run JavaScript and React/JSX code in-browser with live preview and streaming console logs; **120 built-in templates** across JS fundamentals (6), JS interview topics (7), React basics + advanced (6), **31 JS polyfills** (Array map/filter/reduce/forEach/find/some/every/flat/includes/from/sort/indexOf/reverse/slice/splice/concat/isArray/fill/join, Function bind/call/apply, Promise all/allSettled/race/any, Object.assign/create/freeze + keys/values/entries, String padStart/padEnd/repeat, JSON.stringify/parse), **50 JS coding challenges** (Two Sum, FizzBuzz, sorts, anagrams, throttle, EventEmitter, LRU cache, Binary Search, Roman to Integer, Linked List ops, **Maximum Subarray, Trapping Rain Water, 3Sum, Generate Parentheses, Subsets, Permutations, Min Stack, Daily Temperatures, Coin Change, House Robber, Jump Game, Sort Colors, Top K Frequent, Detect Cycle, Merge Two Sorted Lists** etc.) plus **20 React Machine Coding** challenges (Star Rating, Tabs, Accordion, OTP Input, Tic-Tac-Toe, Stopwatch, Calculator, Auto-suggest, Toast, Carousel and more) for **70 challenges total**; 33 challenges include a "Show Solution" toggle and 35 have a step-by-step **Explain** modal with animated visual walkthrough plus clickable polyfill cross-links; templates browser is a centered 2-pane modal with status dots (Solved / In-Progress) and a Random Challenge button
- **Auto-saved progress per challenge** — your code is auto-saved every keystroke (debounced) and restored when you come back. Notes scratchpad per challenge for thoughts. Reset Code button to revert to the stub. Test pass/fail summary pill after each Run. "X / 50 solved" counter, status badges, Continue-last-session pill on /playground entry
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
      front-end/               # React, React Native & Apps, Play Store Launch, Redux Toolkit, Redux Saga, TanStack Query, Storybook, Jest & RTL, Frontend Tooling, Browser APIs, Real-Time Web, Design Patterns, Refactoring & Code Review, React Comparisons
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
