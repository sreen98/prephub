# What's New

## v1.0.5 (April 2026)

### Browser APIs Guide

A new Front End guide: **Browser APIs** — a comprehensive walkthrough of the platform APIs every web developer is expected to know, with comparison tables wherever the platform offers multiple options:

- **DOM and EventTarget** — `addEventListener` options (`once`, `passive`, `signal`, `capture`), custom events, event delegation.
- **Storage APIs** — Cookies (HttpOnly / Secure / SameSite), localStorage, sessionStorage, IndexedDB, Cache API, with a side-by-side comparison and a decision flow for picking the right one.
- **Network APIs** — fetch vs XMLHttpRequest, AbortController and signal composition, WebSockets, Server-Sent Events, plus a WS / SSE / long-polling comparison.
- **Workers** — Web Workers (with transferable objects), Shared Workers, Service Workers (lifecycle + cache strategies + the `skipWaiting`/`clients.claim` deploy pattern).
- **Observers** — IntersectionObserver, MutationObserver, ResizeObserver, PerformanceObserver — when each one replaces a scroll/resize listener.
- **History API and bfcache** — pushState / replaceState / popstate, plus `pageshow`/`pagehide` with `e.persisted`.
- **Performance API** — Navigation Timing, Resource Timing, User Timing (marks/measures), `performance.now()` vs `Date.now()`.
- **Scheduling APIs** — setTimeout vs queueMicrotask vs requestAnimationFrame vs requestIdleCallback, plus the event-loop mental model.
- **File, Blob, and Streams** — File/FileReader, modern Promise-based APIs (`.text()`, `.arrayBuffer()`, `.stream()`), `URL.createObjectURL`, drag-and-drop, ReadableStream piping.
- **Geolocation, Notifications, Clipboard** — permission-gated APIs.
- **Web Crypto** — `crypto.getRandomValues`, `crypto.randomUUID`, SubtleCrypto for hashing/encryption, non-extractable keys, and why `Math.random` is never appropriate for security.
- **Cross-document and cross-tab messaging** — `postMessage`, `BroadcastChannel`, `MessageChannel`, with the security pattern for validating `event.origin` and `event.source`.
- **Page Lifecycle and Visibility** — `visibilitychange`, `pageshow`/`pagehide`, `navigator.sendBeacon`, why `beforeunload` is unreliable.
- **Permissions API** — querying state without triggering prompts.
- **URL and URLSearchParams** — the boring API everyone gets wrong with manual string concatenation.

Closes with **16 interview questions** (Beginner / Intermediate / Advanced) and **12 tricky questions** organized by theme (Storage & Lifecycle, Network & Async, Workers & Threading, DOM & Events, Lifecycle & Performance) covering the storage event firing only in other tabs, why `fetch` doesn't reject on 5xx, the HTTP/1.1 6-connection limit and head-of-line blocking, structured-clone overhead and transferable objects, the Service Worker deploy stale-cache trap, `passive: true` ignoring `preventDefault`, why `beforeunload` analytics get lost, and rAF throttling in hidden tabs. Plus a 15-rule cheat sheet at the end.

### React Guide — Performance & Build-Tooling Expansion

The React guide's Performance section was expanded into a full deep dive on making React apps fast in production. New topics covered:

- **Concurrent Features** — `useTransition` and `useDeferredValue`, with guidance on when to reach for each.
- **Profiling and Measurement** — React DevTools Profiler workflow and Core Web Vitals (LCP, INP, CLS) with the `web-vitals` library.
- **Common Re-render Causes** — the usual offenders (inline objects, Context fan-out, anonymous callbacks) and how to fix them.
- **Image and Asset Optimization** — lazy loading, responsive `srcset`, LCP-image preload, font-display.
- **Webpack vs Vite** — feature comparison and when to pick which.
- **Bundle Analyzers** — `rollup-plugin-visualizer`, `webpack-bundle-analyzer`, `source-map-explorer`, with a checklist of what to chase down on every release.
- **Tree Shaking and Code Splitting** — what breaks tree shaking, waterfall lazy loading, route-based vs component-level splitting.
- **Server Components, SSR, Streaming** — Server Components vs Client Components, streaming SSR with `<Suspense>`.
- **Expanded performance cheat sheet** at the end of the section.

Added **8 new interview questions** on Core Web Vitals + INP, DevTools Profiler workflow, bundle analyzer red flags, Webpack vs Vite trade-offs, tree shaking, useTransition vs useDeferredValue, "reduce a 2 MB bundle" walkthrough, and debugging unnecessary re-renders.

Added **6 new tricky questions** on `React.memo` defeated by inline callbacks, Context fan-out from a non-memoized value, index-key bugs on prepend, `useTransition` priorities, `React.lazy` Suspense flash on above-the-fold chunks, and why named imports from CJS `lodash` don't tree-shake.

### Play Store Launch Guide

A new Front End guide: **Play Store Launch** — a practical, end-to-end playbook for shipping any Android app (React Native, native, Flutter — framework agnostic in workflow) to the Google Play Store. Examples use Expo / EAS where they're most concrete, but the Play Console workflow is identical for every framework. Covers the full path from code-side prep through Production Access:

- Code-side prerequisites (privacy-policy alignment, cascade delete, encryption-in-transit, secret rotation)
- `app.json` and EAS Build configuration (proguard, `usesCleartextTraffic`, `autoIncrement` strategy, Sentry sourcemaps)
- Privacy policy + public delete-account URL hosting requirements
- Backend Config collection pattern for runtime-configurable URLs (privacy policy, Play Store, force-update messages)
- Walkthrough of all 11 Play Console dashboard forms (App access, Ads, Content rating, Target audience, Data safety, Government/Financial/Health declarations, Advertising ID)
- Detailed Data Safety form mapping for a typical app: which data types to tick, required-vs-optional, purposes per type
- Store listing assets (icon 512×512, feature graphic 1024×500, screenshot specs) with `sips` resize tip
- Closed Testing setup, the 14-day soak rule for new personal accounts, tester-list management
- Production Access application + staged rollout strategy
- 14 common pitfalls (versionCode collisions, `expo-dev-client` in dependencies, missing crash-logs declaration when using Sentry, hardcoded `secure: false` cookies, etc.)
- A pre-launch checklist covering code, build, Play Console forms, store assets, and post-submission monitoring
- **Android Build Internals deep dive** — APK vs AAB internals, the build pipeline (AAPT2 → R8 → D8 → zipalign → sign), R8 shrinking/obfuscation with keep rules, signature schemes V1–V4, upload key vs app signing key, key reset/upgrade/rotation flows, manifest merger, Hermes + baseline profiles, Dynamic Delivery, OTA-allowed vs Play-required changes
- **React Native / Expo build concerns** — Bridge vs JSI/Fabric/TurboModules/Bridgeless, Managed vs Bare workflow, EAS Build vs local Gradle, sourcemap symbolication, `expo-doctor`
- **Bundletool, Firebase Pre-Launch Report, Internal App Sharing** — local AAB validation and pre-flight tooling
- **24 interview questions** across Beginner / Intermediate / Advanced — APK/AAB, Play App Signing, signature schemes, R8 keep rules, force-update architecture, manifest merger, target SDK floor, sourcemaps, Sentry + Data Safety, cascade delete, New Architecture, ANR debugging, key recovery vs upgrade vs rotation, OTA boundaries, staged rollout, baseline profiles, runtime config
- **10 tricky scenario questions** — versionCode high-water mark across tracks, `autoIncrement` drift, R8-broke-release-but-debug-works, 14-day soak resets when tester list rotates, Sentry tracesSampleRate misses App interactions, anonymize-not-delete cascade gotcha, tablet screenshots even with `supportsTablet: false`, upload-key reset (recoverable) vs app-signing-key loss (not), Managed Publishing app-level vs per-release scope, `blockedPermissions` doesn't disable SDK code
- **20-rule cheat sheet** at the end

---

## v1.0.4 (April 2026)

### Tricky Questions — Rewritten With Detailed Explanations

All 111 "Tricky Output Questions" across 9 guides were rewritten. The old answers were often 2-3 lines and skipped the "why" — now every question has:

- **A clear, self-contained question sentence** that works as a standalone flashcard in Quiz mode.
- **The original code**, unchanged — the buggy behavior is still the lesson.
- **The exact output or answer**, clearly labeled.
- **A detailed `Explanation` block** (typically 8-14 lines) that walks through the specific language / runtime / library mechanism at play — event-loop phases for Node, Immer's draft semantics for Redux Toolkit, generator `yield`/`next` exchange for Redux Saga, contravariance under `strictFunctionTypes` for TypeScript, reconciliation-keys and closure capture for React, Yoga layout and native-driver limits for React Native, router-stack arity dispatch for Express, aggregation-pipeline stage semantics for MongoDB, widening/boxing/coercion rules for JavaScript.
- **A one-sentence `Takeaway`** — the single rule to remember.

Counts per guide: JavaScript 11, TypeScript 16, React 16, React Native 16, Redux Saga 10, Redux Toolkit 10, Node.js 12, Express 10, MongoDB 10. Answer length per question grew roughly 5-6× on average.

The rewrite also preserved the Quiz-mode parser contract (`**Q{N}: ...**` marker + answer block + trailing `---`), so every new explanation is picked up in Quiz Mode, Daily Review, and the Interview Simulator.

### Documentation Cleanup

- README counts corrected (20+ guides → 32 guides across 8 categories; 84 tricky Qs → 111; 60+ templates → 49; AWS roster now lists Frontend Deployment; System Design lists Comparisons).
- CLAUDE.md now documents the parser's `---` terminator behavior so future edits don't accidentally cut off an explanation.

- **Console output now visible with React preview** — output pane is split evenly so console and preview share space instead of the console collapsing to a sliver. Console logs from React `useEffect` / intervals keep streaming in live (previously silent after the first tick).
- **"Try it" auto-inserts `render()`** — when you try a React snippet from a guide that defines a component but no `render()` call, the playground now detects the component and appends `render(<YourComponent />)` so it runs immediately.
- **Templates redesigned** — the side drawer is replaced with a centered 2-pane modal: category list on the left, snippets as cards on the right. Searching and switching categories is no longer a wall of names.
- **Sidebar toggle no longer overlaps the editor** — the floating expand button is hidden on the Playground route; an equivalent toggle is built into the Playground header instead.

---

## v1.0.3 (April 2026)

### New Content: React Native & Mobile Apps Guide

A full guide to building native mobile apps with React Native, added to the Front End section:

- **Core mobile concepts** — React Native vs hybrid/Flutter/native, JS thread vs UI thread, how the platform bridge works
- **Expo vs bare CLI** — when to use each, EAS Build, Expo Prebuild, `app.json` config
- **Core components** — `View`, `Text`, `Image`, `ScrollView`, `TextInput`, `Pressable`, `Modal`
- **Styling & Flexbox** — `StyleSheet`, platform differences from web (column default, no cascade, dp units, shadows)
- **Lists** — `FlatList`/`SectionList` performance (`getItemLayout`, `windowSize`, memoized `renderItem`), FlashList
- **Navigation** — React Navigation (Stack, Tab, Drawer), typed params, Expo Router file-based routing
- **Platform APIs** — `Platform`, `Dimensions`, `StatusBar`, `SafeAreaView`, `KeyboardAvoidingView`, `BackHandler`, `Linking`
- **Storage** — AsyncStorage, MMKV, SecureStore, SQLite, Realm, WatermelonDB — when to pick which
- **Animations & gestures** — `Animated` API + `useNativeDriver`, Reanimated worklets, `react-native-gesture-handler`
- **Native modules & New Architecture** — JSI, Fabric, TurboModules, Hermes, Bridgeless mode
- **Permissions, push notifications, deep linking** (URL schemes, Universal Links, App Links)
- **Build & release** — EAS Build, signing, App Store / Play Store, EAS Update / CodePush OTA
- **Accessibility, i18n & RTL, offline patterns**
- **30 interview questions** across beginner / intermediate / advanced
- **16 tricky questions** — `flex: 1` gotchas, `flexDirection` default, `useNativeDriver` limitations, stale `setState` in intervals, Android shadows, `SafeAreaView` platform differences, AsyncStorage startup flash, and more

---

## v1.0.2 (April 2026)

### Tricky Output Questions — 7 Guides

Added "Guess the Output" sections with code snippets and detailed explanations to 7 guides:

- **React** (16 questions) — State batching, stale closures, useEffect timing, refs, reconciliation, hooks rules
- **TypeScript** (16 questions) — Type inference & widening, narrowing, generics, conditional types, structural typing, `any` vs `unknown`
- **Node.js** (12 questions) — Event loop ordering (`nextTick` vs `Promise` vs `setTimeout` vs `setImmediate`), streams, modules, circular deps
- **Redux Saga** (10 questions) — Generator step-by-step, `call` vs `fork`, `takeLatest` cancellation, `race`, `all`, error propagation
- **Express.js** (10 questions) — Middleware execution chain, error handling flow, `next('route')`, async errors, double response
- **MongoDB** (10 questions) — Query behavior, dot notation vs exact match, `$push` vs `$addToSet`, aggregation pipeline order, `$unwind`, `$lookup`
- **Redux Toolkit** (10 questions) — Immer mutations, state references, selector memoization, `createAsyncThunk` lifecycle, middleware order, serializability

Each section includes a 10-rule cheat sheet summary.

---

## v1.0.0 (April 2026)

### Repo Renamed to PrepHub

- Repository renamed from `interview-prep` to `prephub`
- Live site URL is now **sreen98.github.io/prephub**
- Started semantic versioning at v1.0.0

### Production Polish

- Custom **Open Graph image** (1200x630) for better social media previews
- **DNS prefetch** for Google Analytics for faster page loads
- **PWA screenshots** and categories in manifest for richer install prompts
- Fixed `robots.txt` sitemap URL to point to new repo name

### New Content: CORS Guide

- Comprehensive guide covering **Same-Origin Policy, CORS headers, preflight requests, credentialed requests**, and security best practices
- **Express.js CORS configuration** — using the `cors` middleware and manual setup with dynamic origin allowlists
- **CORS in production environments** — AWS API Gateway, Nginx, Cloudflare Workers, and dev server proxies (Vite, CRA)
- **Debugging guide** — common error messages, curl commands for testing, and a debugging checklist
- **CORS vs JSONP, proxies, postMessage** — when to use each cross-origin mechanism
- **15 interview questions** across beginner, intermediate, and advanced levels

### New Content: Frontend Tooling Guide

- Comprehensive guide covering **Webpack, Vite, and bundler fundamentals** — why React needs a bundler, how webpack works (loaders, plugins, code splitting), how Vite leverages native ES modules
- **Webpack vs Vite comparison** — dev speed, config complexity, ecosystem, migration steps from CRA
- **Other bundlers overview** — Rollup, esbuild, Parcel, Turbopack, SWC
- **Package managers** — npm vs yarn vs pnpm deep dive with resolution strategies, speed, and monorepo support
- **package.json deep dive** — dependencies vs devDependencies vs peerDependencies, semver, scripts, entry points
- **20 interview questions** across beginner, intermediate, and advanced levels

---

## March 2026

### React Machine Coding Challenges in Playground

- **10 new interactive templates** — frequently asked React machine coding interview questions
- Pagination, Search Filter, Real-time Chat, Modal, Image Gallery with Lazy Loading, Drag-and-Drop, Product List with Sort & Filter, Responsive Navbar, Infinite Scroll, and Notifications
- All challenges are fully functional and runnable in the playground with live preview
- New "React Machine Coding" category in the template drawer

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

## March 2026

### Quiz Difficulty Filters

- Filter quiz questions by **Beginner**, **Intermediate**, or **Advanced**
- Color-coded difficulty badges on each flashcard
- Questions automatically tagged based on guide structure

### Reading Time Estimates

- See estimated reading time on each guide (~X min read)
- Displayed on home page category cards and at the top of each guide

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
