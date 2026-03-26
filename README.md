# PrepHub - Interview Preparation Platform

A comprehensive, modern web app for full-stack developer interview preparation. Built with React 19, deployed on GitHub Pages as a PWA.

**Live site: [sreen98.github.io/interview-prep](https://sreen98.github.io/interview-prep/)**

## Features

### Study Content
- **20+ Guides** across 5 categories: Front End, JS & TS, Back End, AWS, System Design
- **6 Cheat Sheets** — condensed quick reference cards (React Hooks, JS ES6+, Git, Big-O, CSS Flexbox/Grid, HTTP Status Codes)
- **Mermaid Diagrams** — architecture diagrams rendered as interactive visuals
- **Syntax-highlighted code blocks** with copy and "Try it" buttons
- **Reading time estimates** on every guide
- **Table of Contents** — auto-generated from headings, tracks active section while scrolling

### Interactive Tools
- **Quiz Mode** — flashcard-style Q&A extracted from guides, with difficulty filters (Beginner/Intermediate/Advanced)
- **Daily Review** — spaced repetition (SM-2 algorithm) schedules questions for optimal retention
- **Interview Simulator** — timed mock interviews with configurable question count, time limit, and category selection
- **Code Playground** — run JavaScript and React/JSX code in-browser with live preview, 16+ templates across JS fundamentals, interview topics, React basics, and polyfills

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
interview-prep/
  web/
    src/
      App.jsx                    # Main app: layout, sidebar, routes, ContentPage, HomePage
      data.js                    # menuStructure, contentFiles, utilities, cheatSheets
      main.jsx                   # Entry point (BrowserRouter)
      index.css                  # Tailwind + custom styles
      components/
        QuizMode.jsx             # Flashcard quiz with difficulty/guide filters
        ReviewPage.jsx           # Spaced repetition daily review
        InterviewSimulator.jsx   # Timed mock interview (setup/interview/results)
        CodePlayground.jsx       # JS/React code editor with template drawer
        BookmarksPage.jsx        # Saved bookmarks listing
        CheatSheetsIndex.jsx     # Cheat sheet card grid
        MermaidBlock.jsx         # Lazy mermaid diagram renderer
        StreakCelebration.jsx    # Streak milestone celebration overlay
        Toast.jsx                # Reusable toast notification
        TTSControls.jsx          # Text-to-speech playback controls
      hooks/
        useDarkMode.js           # Theme toggle (localStorage)
        useReadingPrefs.js       # Font size S/M/L (localStorage)
        useProgress.js           # Guide completion tracking (localStorage)
        useBookmarks.js          # Bookmark management (localStorage)
        useSpacedRepetition.js   # SM-2 algorithm scheduling (localStorage)
        useStudyStats.js         # Streak & gamification stats (localStorage)
        useTextToSpeech.js       # Web Speech API wrapper
      content/
        front-end/               # React, Redux, TanStack Query, Storybook guides
        javascript-and-typescript/
        back-end/                # Node.js, Express, MongoDB, API Design guides
        aws/                     # IAM, EC2, S3, Lambda, CloudWatch guides
        system-design/
        cheatsheets/             # 6 quick reference sheets
        changelog.md
    public/                      # PWA icons, favicon
    vite.config.js               # Vite + PWA plugin config
    tailwind.config.js
  .github/workflows/deploy.yml   # GitHub Pages CI/CD
```

## Development

```bash
cd web
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
1. Copies markdown content to `web/src/content/`
2. Builds with Vite
3. Deploys `dist/` to GitHub Pages

---

Built for learning. Good luck with your interviews!
