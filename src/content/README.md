# 📚 PrepHub — Interview Preparation

A comprehensive collection of guides covering everything a full-stack developer gets asked in interviews — from JavaScript fundamentals to frontend architecture, accessibility, security and AI engineering.

**68 guides across 8 categories, plus 14 cheat sheets and an interactive Code Playground.**

---

## 🎯 Start Here — The 20 Topics That Actually Come Up

If you have limited time, this is the list. These twenty topics account for the overwhelming majority of questions in a typical frontend or full-stack loop. Everything else in this collection is depth on top of them.

### JavaScript Core

| # | Topic | Where |
|---|---|---|
| 1 | **Closures & Scope** | [JavaScript Guide §5](/javascript/guide) |
| 2 | **The Event Loop & Async** | [JavaScript Guide §11](/javascript/guide) |
| 3 | **Promises & async/await** | [JavaScript Guide §8](/javascript/guide) |
| 4 | **Hoisting & `this`** | [JavaScript Guide §3–4](/javascript/guide) |
| 5 | **Prototypes & Inheritance** | [JavaScript Guide §6](/javascript/guide) |

### React Mastery

| # | Topic | Where |
|---|---|---|
| 6 | **`useState` & `useEffect`** (and when *not* to use an effect) | [React Guide §6–7](/frontend/react) |
| 7 | **Context API — and its re-render pitfalls** | [React Guide §11](/frontend/react) |
| 8 | **Custom Hooks** | [React Guide §6.3](/frontend/react) |
| 9 | **Component Lifecycle & Reconciliation** | [React Guide §14](/frontend/react) |
| 10 | **State Management** (Redux Toolkit / Zustand / server state) | [React Guide §11.3](/frontend/react) |

### Performance & Optimization

| # | Topic | Where |
|---|---|---|
| 11 | **Code Splitting & Lazy Loading** | [React Guide §13.3](/frontend/react) |
| 12 | **Memoization** (`useMemo`, `useCallback`, React Compiler) | [React Guide §13.2, §16.1](/frontend/react) |
| 13 | **Virtual DOM & Reconciliation** | [React Guide §14](/frontend/react) |
| 14 | **Bundle Optimization** | [Frontend Tooling](/frontend/tooling) |
| 15 | **Core Web Vitals** (LCP, **INP**, CLS) | [React Guide §13.6](/frontend/react) |

### Essential Concepts

| # | Topic | Where |
|---|---|---|
| 16 | **Event Delegation & Bubbling** | [React Guide §15.11](/frontend/react) |
| 17 | **Debouncing & Throttling** | [Playground — implement both from scratch](/playground) |
| 18 | **Error Boundaries & Error Handling** | [React Guide §17 Q18](/frontend/react) |
| 19 | **Browser Storage** (localStorage, sessionStorage, IndexedDB) | [Browser APIs Guide](/frontend/browser-apis) |
| 20 | **REST APIs & HTTP Methods** | [API Design Guide](/backend/api-design) |

> **A note on how these are tested in 2026.** Because AI assistants can produce standard implementations instantly, interviewers have moved past definitions. Expect to be asked *why* rather than *what* — why a closure causes this memory leak, why this `useEffect` runs twice, why this memoization does nothing. The [Tricky Output Questions](/quiz) sections across the guides are built for exactly that, and the [Code Playground](/playground) has 120 challenges where you implement these from scratch.

---

## 🗂️ What's In Here

### 🎨 Front End (23 guides)

**Core React** — [React Guide](/frontend/react) (hooks, reconciliation and Fiber, performance, React 19/19.2), [Redux Toolkit](/frontend/redux-toolkit), [Redux Saga](/frontend/redux-saga), [TanStack Query](/frontend/tanstack-query)

**Architecture & Platform** — [Frontend Architecture at Scale](/frontend/architecture) (monorepo vs multi-repo, micro-frontends, design systems, caching layers, real-time at scale, debugging the 1%), [Next.js & React Server Components](/frontend/nextjs-rsc) (the RSC model, App Router, the Next 16 caching model, auth defence-in-depth), [Design Patterns](/frontend/design-patterns), [Refactoring & Code Review](/frontend/refactoring-code-review)

**Platform & Standards** — [Modern CSS](/frontend/modern-css) (cascade layers, container queries, `:has()`, `@scope`, OKLCH, anchor positioning, view transitions), [Accessibility](/frontend/accessibility) (WCAG 2.2, ARIA, keyboard and focus, testing), [Browser APIs](/frontend/browser-apis), [Real-Time Web](/frontend/realtime-web) (SSE, WebSockets, WebRTC, streaming)

**Performance & Quality** — [Web Performance](/frontend/web-performance) (Core Web Vitals, the loading pipeline, INP and the main thread, budgets in CI), [Testing Strategy & E2E](/frontend/testing-strategy) (the pyramid vs the trophy, Playwright, flake, contract testing, coverage)

**Tooling & Delivery** — [Frontend Tooling](/frontend/tooling) (Webpack, Vite 8/Rolldown, package managers, the 2026 toolchain), [Jest & React Testing Library](/frontend/jest-react-testing-library), [Storybook](/frontend/storybook)

**Mobile** — [React Native & Apps](/frontend/react-native) (New Architecture, navigation, lists, in-app purchases, crash reporting, background tasks, app size), [Play Store Deployment](/frontend/play-store-deployment) (AAB and signing, the Data Safety form, closed testing, the 14-day soak), [iOS & App Store Deployment](/frontend/ios-app-store-deployment) (code signing, TestFlight, privacy manifests, App Review rejections, phased release), [Mobile Accessibility](/frontend/mobile-accessibility) (VoiceOver and TalkBack, grouping, Dynamic Type, touch targets, WCAG for mobile), [Mobile App Security](/frontend/mobile-app-security) (Keychain/Keystore, biometrics done right, PKCE, pinning, attestation, receipt validation)

### 💻 JavaScript & TypeScript (4 guides)

[JavaScript Guide](/javascript/guide) (closures, prototypes, the event loop, ES2026 — Temporal, `using`, iterator helpers), [TypeScript Guide](/javascript/typescript) (generics, conditional and mapped types, the Go-native compiler), [Regex Guide](/javascript/regex), [JS Comparisons](/javascript/comparisons)

### ⚙️ Back End (18 guides)

**Runtime & Frameworks** — [Node.js](/backend/nodejs) (event loop, streams, Node 24/26), [Express.js](/backend/expressjs), [Python](/backend/python) (the GIL, asyncio, decorators, and Python for LLM services), [FastAPI](/backend/fastapi) (`async def` vs `def`, dependency injection, streaming), [MongoDB](/backend/mongodb)

**API & Data** — [API Design](/backend/api-design), [GraphQL](/backend/graphql) (schema design, the N+1 problem and DataLoader, why HTTP caching breaks, cost limits), [SQL & Relational DBs](/backend/sql) (joins, indexes, query plans, transactions and isolation, the N+1 problem), [PostgreSQL](/backend/postgresql) (MVCC and VACUUM, pooling, replication, pgvector), [MySQL](/backend/mysql) (the clustered index, gap locks, online DDL), [Database Schema](/backend/database-schema), [CORS](/backend/cors)

**Security & Identity** — [Web Security](/backend/web-security) (XSS, CSP, CSRF, token theft, supply chain, injection), [OAuth & SSO](/backend/oauth-sso)

**Architecture & Delivery** — [Microservices](/backend/microservices), [Docker, K8s & CI/CD](/backend/docker-kubernetes) (images and layers, orchestration, pipelines, deployment strategies), [Stripe Integration](/backend/stripe), [AI & LLM Engineering](/backend/ai-llm-engineering) (tokens, streaming, RAG, tool calling, MCP, agents, evals, prompt-injection security)

### ♾️ DevOps (15 guides)

**Linux & Networking** — [SSH & Linux Administration](/devops/ssh-linux) (key auth, tunnels, bastions, systemd, diagnosing a sick server, text processing)

**AWS** — [IAM & Security](/aws/iam), [EC2 & Networking](/aws/ec2), [S3 & Storage](/aws/s3), [Lambda](/aws/lambda), [CloudWatch](/aws/cloudwatch), [Frontend Deployment](/aws/frontend-deployment), [AWS Comparisons](/aws/comparisons)

**Containers & Orchestration** — [Docker, K8s & CI/CD](/backend/docker-kubernetes) (multi-stage builds, the three probes, requests vs limits, GitHub Actions), [Helm & GitOps](/devops/helm-gitops) (charts and templating, Argo CD, prune and selfHeal, promotion, progressive delivery)

**Infrastructure as Code** — [Terraform](/devops/terraform) (state, `for_each` vs `count`, `moved` blocks, plan safety), [Ansible](/devops/ansible) (idempotence, handlers, Vault, rolling waves)

**CI/CD** — [Jenkins](/devops/jenkins) (declarative pipelines, agents, credentials, the security model), [AWS CodePipeline & CodeBuild](/devops/aws-cicd) (buildspec, CodeDeploy blue/green, cross-account, IAM)

**Observability & SRE** — [Observability & SRE](/devops/observability-sre) (Prometheus and PromQL, cardinality, SLIs/SLOs and error budgets, burn-rate alerting, incidents and postmortems)

### 🏗️ System Design (4 guides)

[System Design Guide](/system-design/guide), [Frontend System Design](/system-design/frontend) (Netflix, Twitter feed, Zoom, WhatsApp, and more), [Low-Level Design (LLD)](/system-design/low-level-design) (the method, SOLID applied, worked designs: parking lot, rate limiter, elevator, vending machine), [Design Comparisons](/system-design/comparisons)

### 🔀 Git (2), 🧠 DSA (1), 🗣️ Behavioral (1)

[Git Guide](/git/guide) & [Git Comparisons](/git/comparisons) · [DSA Guide](/dsa/guide) (arrays through backtracking, heaps and tries) · [Behavioral Guide](/behavioral/guide) (STAR, company cultures, salary negotiation, and the AI-assisted interview)

---

## 🛠️ Interactive Tools

- **[Code Playground](/playground)** — **173 templates**: JS fundamentals and interview topics, **31 polyfills** written from scratch, **94 coding challenges** tagged by pattern and difficulty, and **28 React machine-coding** challenges — **122 challenges** in total. **88 have a multi-approach solution** with a Time/Space/Verdict comparison, and 35 have a step-by-step **Explain** modal with animated visual walkthroughs.
- **[Quiz Mode](/quiz)** — flashcard Q&A pulled from every guide, filterable by difficulty.
- **[Daily Review](/review)** — spaced repetition (SM-2) so what you learn actually sticks.
- **[Interview Simulator](/interview)** — timed mock rounds with configurable scope.
- **[Cheat Sheets](/cheatsheets)** — 14 printable quick-reference cards: [TypeScript](/cheatsheets/typescript), [Python](/cheatsheets/python), [SQL](/cheatsheets/sql), [GraphQL](/cheatsheets/graphql), [Regex](/cheatsheets/regex), [Docker & Kubernetes](/cheatsheets/docker-kubernetes), [React Hooks](/cheatsheets/react-hooks), [JS ES6+](/cheatsheets/javascript-es6), [Big-O](/cheatsheets/big-o-notation), [CSS Flexbox/Grid](/cheatsheets/css-flexbox-grid), [HTTP Status Codes](/cheatsheets/http-status-codes), [Git Commands](/cheatsheets/git-commands), [Git Workflows](/cheatsheets/git-workflows) and [Comparison Tables](/cheatsheets/comparison-tables).
- **Bookmarks & Checkpoints** — save any heading, or drop a "where I left off" marker on any guide.

---

## 🚦 How To Use This

**Interviewing in a week?** Work the 20 topics above, then do the Tricky Output Questions for your stack. They're the highest-yield thing here because they test the *why*.

**Interviewing in a month?** Read the guides for your stack front to back, do the Playground challenges for the patterns you're weakest on, and use Daily Review to keep it. Add [Frontend System Design](/system-design/frontend) and [Frontend Architecture](/frontend/architecture) if you're going for senior or above.

**Levelling up generally?** Pick the guides on things you use daily but have never read properly — most engineers find [Modern CSS](/frontend/modern-css), [Accessibility](/frontend/accessibility), [Web Security](/backend/web-security) and [SQL](/backend/sql) are the biggest gaps, because they're rarely taught and increasingly asked.

**Every guide has the same shape:** concepts → practical examples → best practices → **Interview Questions & Answers** → **Tricky Output Questions** (guess-the-output with detailed explanations) → a cheat sheet → references.

---

_Content current as of September 2026._
