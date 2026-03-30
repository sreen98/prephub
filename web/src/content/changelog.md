# What's New

## Latest (March 2026)

### TypeScript Migration
- Entire codebase migrated from JavaScript to TypeScript (`.jsx` → `.tsx`, `.js` → `.ts`)
- All components, hooks, and data files now have full type annotations
- Added `tsconfig.json` with strict configuration

### New Content: Git Category
- **Git Guide** — Complete guide covering internals, branching, merging, rebasing, workflows, cherry-pick, stashing, tags, and advanced topics
- **Git Comparisons** — Merge vs rebase, reset vs revert, fetch vs pull, and more comparison tables
- New sidebar category with `GitCompare` icon

### New Content: Jest & React Testing Library Guide
- Comprehensive guide covering Jest fundamentals, matchers, mocking, and async testing
- React Testing Library patterns for components, hooks, Redux, React Query, forms, and routing
- Best practices and anti-patterns section

### New Cheat Sheet: Git Workflows & Advanced
- Interactive rebase, cherry-pick, bisect, reflog, worktrees
- Git Flow, GitHub Flow, and trunk-based development patterns

### Mermaid Diagram Rendering Fixes
- Added `suppressErrorRendering` to prevent visual glitches on failed renders
- Diagrams now render into an off-screen container ref for cleaner DOM handling
- Automatic cleanup of orphaned Mermaid elements from the DOM after render

### "Try It" Opens in New Tab
- Code playground "Try it" button now opens in a new browser tab instead of navigating away from the current guide

---

## March 2026

### Quiz Difficulty Filters
- Filter quiz questions by **Beginner**, **Intermediate**, or **Advanced**
- Color-coded difficulty badges on each flashcard
- Questions automatically tagged based on guide structure

### Reading Time Estimates
- See estimated reading time on each guide (~X min read)
- Displayed on home page category cards and at the top of each guide

### Mermaid Diagrams
- Architecture diagrams now render as interactive visual diagrams
- Improved readability for system design and Node.js content
- Supports light and dark mode

### Reading Preferences
- Adjustable font size: **Small / Medium / Large**
- Toggle via the font size button in the sidebar
- Your preference is saved across sessions

### Offline Support (PWA)
- Install PrepHub as an app on your device
- All content cached for offline reading
- Auto-updates when new content is available

### Code Playground Enhancements
- "Try it" button on JavaScript code blocks sends code to the playground
- 6 built-in templates for common interview topics
- Console output with color-coded log levels

---

## Initial Release

### Core Features
- 16+ comprehensive interview preparation guides
- Covers Front End, Back End, JavaScript/TypeScript, AWS, and System Design
- Full-text search across all content (Cmd+K)
- Dark mode with system preference detection

### Interactive Tools
- **Quiz Mode** — Flashcard-style Q&A extracted from guides
- **Code Playground** — Run JavaScript directly in the browser
- **Table of Contents** — Auto-generated from headings with scroll tracking

### Reading Experience
- Syntax-highlighted code blocks with copy button
- Reading progress bar
- Back-to-top floating button
- Search result highlighting with auto-scroll
