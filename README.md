# PrepHub - Interview Preparation Platform

A comprehensive, modern web app for full-stack developer interview preparation. Built with React 19, deployed on GitHub Pages as a PWA.

**Live site: [sreen98.github.io/prephub](https://sreen98.github.io/prephub/)**

## Features

### Study Content
- **32 guides across 8 categories** — Front End (9: React, React Native & Apps, Redux Toolkit, Redux Saga, TanStack Query, Storybook, Jest & RTL, Frontend Tooling, React Comparisons), JS & TS (3), Back End (7: Node.js, Express, MongoDB, API Design, Database Schema, CORS, Backend Comparisons), AWS (7: IAM, EC2, S3, Lambda, CloudWatch, Frontend Deployment, AWS Comparisons), Git (2), DSA (1), Behavioral (1), System Design (2)
- **7 cheat sheets** — React Hooks, JS ES6+, Git Commands, Git Workflows & Advanced, Big-O, CSS Flexbox/Grid, HTTP Status Codes
- **Mermaid diagrams** — architecture diagrams rendered as interactive visuals
- **Tricky Output Questions** — "Guess the Output" sections in 9 guides (JavaScript, TypeScript, React, React Native, Redux Saga, Redux Toolkit, Node.js, Express, MongoDB) totalling 111 questions, each paired with a detailed explanation and followed by a cheat-sheet summary
- **Syntax-highlighted code blocks** with copy and "Try it" buttons
- **Reading time estimates** on every guide
- **Table of Contents** — auto-generated from headings, tracks active section while scrolling

### Interactive Tools
- **Quiz Mode** — flashcard-style Q&A extracted from guides, with difficulty filters (Beginner/Intermediate/Advanced)
- **Daily Review** — spaced repetition (SM-2 algorithm) schedules questions for optimal retention
- **Interview Simulator** — timed mock interviews with configurable question count, time limit, and category selection
- **Code Playground** — run JavaScript and React/JSX code in-browser with live preview and streaming console logs; 49 built-in templates across JS fundamentals, interview topics, React basics, polyfills, coding challenges, and React machine coding questions; templates browser is a centered 2-pane modal (categories + snippet cards)

### Study Effectiveness
- **Progress Tracking** — guides auto-marked as in-progress on visit, manual "Mark Complete" with visual status dots
- **Bookmarks** — bookmark any heading or quiz question, dedicated bookmarks page
- **Study Streak** — daily visit tracking with streak counter and milestone celebrations (confetti at 7, 14, 30, 60, 100 days)
- **Deep Section Links** — click any heading's link icon to copy a shareable URL with anchor
- **Text-to-Speech** — read guides aloud with play/pause, speed control, and paragraph highlighting

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
      CheatSheetsIndex.tsx     # Cheat sheet card grid
      MermaidBlock.tsx         # Lazy mermaid diagram renderer
      StreakCelebration.tsx    # Streak milestone celebration overlay
      Toast.tsx                # Reusable toast notification
      TTSControls.tsx          # Text-to-speech playback controls
    hooks/
      useDarkMode.ts           # Theme toggle (localStorage)
      useReadingPrefs.ts       # Font size S/M/L (localStorage)
      useProgress.ts           # Guide completion tracking (localStorage)
      useBookmarks.ts          # Bookmark management (localStorage)
      useSpacedRepetition.ts   # SM-2 algorithm scheduling (localStorage)
      useStudyStats.ts         # Streak & gamification stats (localStorage)
      useTextToSpeech.ts       # Web Speech API wrapper
    content/
      front-end/               # React, React Native & Apps, Redux Toolkit, Redux Saga, TanStack Query, Storybook, Jest & RTL, Frontend Tooling, React Comparisons
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
| `sr-schedule` | Spaced repetition schedule |
| `study-stats` | Streak and gamification data |
| `interview-history` | Past interview sim results |
| `tts-prefs` | Text-to-speech speed |

## Deployment

Push to `main` branch triggers automatic deployment via GitHub Actions:
1. Installs dependencies
2. Runs `prepare-content.js` (copies any root-level markdown to `src/content/`)
3. Builds with Vite
4. Deploys `dist/` to GitHub Pages

---

Built for learning. Good luck with your interviews!
