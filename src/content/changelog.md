# What's New

## v1.1.0 (September 2026)

The largest content release so far: **11 new guides** and a full 2026 freshness pass across the existing ones. **Total guides: 42 &rarr; 53.**

The theory guides were written in April&ndash;May 2026 and a lot had moved since &mdash; React 19.2 shipped new stable hooks, TypeScript's compiler was rewritten in Go, ES2026 landed Temporal, Node started running TypeScript directly, and the whole build toolchain went native. Every affected guide is now current. Alongside that, eleven guides fill the gaps the library never covered: there was no CSS guide at all, no accessibility guide, nothing on SQL, and `Dockerfile` appeared nowhere in 85,000 lines of content.

### New Guide &mdash; AI & LLM Engineering (Back End)

**Total guides: 42 &rarr; 43. Back End: 10 &rarr; 11.**

Written for the **application engineer** who has to ship an AI feature, not the ML engineer who trains models &mdash; no maths, no model training. The framing throughout is that an LLM is "a slow, expensive, non-deterministic network dependency that sometimes lies", and every design rule follows from taking that literally.

- **Fundamentals** &mdash; tokens (and why non-Latin scripts cost 2&ndash;3&times; more, why digits tokenize badly, why models can't do arithmetic), the context window as a shared input+output budget, temperature vs top-p, and why model tiering is the biggest cost lever you have
- **Cost and latency** &mdash; the two budgets, model routing, prompt caching and the prefix layout it requires, TTFT vs total completion time
- **Prompting as engineering** &mdash; roles, the escape hatch that prevents most "hallucination", why prompts are code (versioned, evaluated in CI, model pinned)
- **Structured output** &mdash; the three levels of rigour, schema constraints, and why you validate anyway
- **Streaming to the UI** &mdash; the `fetch` + `ReadableStream` pattern with full server and client code, cancellation propagation, chunk-boundary handling, partial-markdown rendering, mid-stream errors, buffering proxies
- **Tool calling and agents** &mdash; the loop, authorizing inside the tool against the session, and a straight answer on when *not* to build an agent
- **RAG** &mdash; chunking (where most RAG systems actually fail), hybrid search, reranking, grounding and citations, the RAG triad for diagnosis, and RAG vs fine-tuning vs long context
- **Evaluation** &mdash; golden sets, grading methods, LLM-as-judge and its biases, offline gates vs online metrics
- **Security** &mdash; prompt injection, the lethal trifecta, and why a rendered markdown image is an exfiltration channel
- **Production and architecture** &mdash; failure matrix, observability, caching layers, and a reference "chat with our docs" design

**14 interview Q&A + 8 tricky scenario questions + a 40-rule cheat sheet.**

### New Guide &mdash; Frontend Architecture at Scale (Front End)

The Platform UI / frontend architect interview round. The recurring theme is that almost every question here is an **organisational** question wearing a technical costume &mdash; monorepo vs multi-repo is about how teams coordinate, micro-frontends are about deployment independence rather than JavaScript.

- **Multi-product architecture** &mdash; the four layers (products &rarr; features &rarr; shared &rarr; foundation), why dependencies must point downward and how to enforce it mechanically, and the three genuinely different kinds of shared code (UI, business logic, feature packages &mdash; extract on the *third* use, not the second)
- **Monorepo vs multi-repo** &mdash; a five-question decision framework, an honest comparison table, the position that holds up in an interview, and the mandatory tooling (pnpm workspaces, Turborepo/Nx, remote caching, CODEOWNERS, boundary lint, Changesets). Plus the two clarifications candidates miss: "monorepo" &ne; "monolith", and a monorepo without enforced boundaries is a distributed monolith with extra steps
- **Micro-frontends** &mdash; what they actually buy (one thing: independent deployment by independently-owned teams), the six integration approaches compared, what really goes wrong (shared dependency skew, token skew, cross-remote state, error isolation, nobody owning the page), and a clear verdict on when *not* to
- **Design systems** &mdash; tokens as CSS custom properties, versioning, and the breaking-change rollout sequence that actually works (add &rarr; deprecate &rarr; **ship a codemod** &rarr; migrate the biggest consumer yourself &rarr; track remaining usages &rarr; remove)
- **The five caching layers** &mdash; data layer, service worker, browser HTTP, CDN, server &mdash; each with its invalidation story, plus "what breaks first?" and why you can't edge-cache personalised data
- **Real-time UI at thousands of events/sec** &mdash; the key insight that the transport isn't the bottleneck, React is; buffering, coalescing, virtualising, Web Workers, and why server-side aggregation *removes* the problem
- **Debugging the 1%** &mdash; segmentation before theorising, source maps, session replay, trace correlation, and why "I'd add monitoring" is the weak answer

**10 interview Q&A** (including the full Platform UI round-3 question set) **+ 5 tricky questions + a 49-rule cheat sheet.**

### New Guide &mdash; Next.js & React Server Components (Front End)

RSC changed the React mental model more than hooks did, and this is the highest-variance topic in modern React interviews.

- **The RSC mental model** &mdash; starting with the distinction everything else depends on: **RSC is not SSR.** SSR ships your component code to the browser to hydrate; Server Component code never reaches the browser at all
- **The client boundary** &mdash; `'use client'` as an *entry point to the client graph* (not a single component), pushing the boundary down, the serialisation rules, and the security consequence: every prop is serialised into the payload the browser downloads
- **App Router** &mdash; file conventions, layout vs template, route groups, parallel and intercepting routes, and the async `params`/`cookies()`/`headers()` change
- **Rendering strategies** &mdash; CSR/SSR/SSG/ISR/streaming/RSC/PPR compared, with Partial Pre-rendering explained properly
- **The caching model** &mdash; the history (13&ndash;14 cached by default &rarr; 15 stopped &rarr; 16 opt-in only), Cache Components and `"use cache"`, and the three invalidation APIs with genuinely different semantics (`revalidateTag` = eventual consistency, `updateTag` = read-your-writes, `refresh` = uncached data)
- **Server Actions** &mdash; and the thing to say unprompted: **a Server Action is a public HTTP endpoint**
- **Authentication, defence in depth** &mdash; grounded in the real CVE history (CVE-2025-29927, CVE-2026-45109, CVE-2026-64642) that shows why the request-interception layer can't be your authorization boundary, and why a Data Access Layer can
- **Next.js 16** &mdash; everything that changed, including the breaking changes that bite on upgrade
- **When *not* to use it** &mdash; a straight answer, which is what separates having used it from having adopted it

**8 interview Q&A + 4 tricky questions + a 52-rule cheat sheet.**

### New Guide &mdash; Modern CSS (Front End)

There was no CSS guide at all &mdash; only a Flexbox/Grid cheat sheet. CSS questions have got *harder* as the platform absorbed what we used preprocessors and JavaScript for.

- **The cascade, specificity and inheritance** &mdash; still the single most-asked area. Specificity as a tuple compared column by column, why `!important` isn't specificity, and the `:is()` / `:where()` distinction
- **Cascade layers** &mdash; the feature that solves what BEM, ITCSS and `!important` were all reaching for, including the surprising rule that unlayered styles beat all layered styles
- **Nesting and `@scope`** &mdash; donut scope with a lower boundary, and an honest answer to "so what replaced BEM?"
- **Layout** &mdash; Flexbox vs Grid, `flex: 1` vs `flex: auto`, subgrid, and the `min-width: auto` overflow bug in all four of its costumes
- **Container queries** &mdash; why they make a component genuinely portable, and the gotchas (you can't query the element you're styling)
- **`:has()`** and the modern selectors, including `:nth-child(n of S)`
- **`@property`** &mdash; why untyped custom properties can't animate, and what registering a type unlocks
- **OKLCH and `color-mix()`** &mdash; why HSL isn't perceptually uniform, and why `color-mix()` beats Sass's `darken()`
- **Fluid sizing** &mdash; `clamp()` (and the WCAG rule about pure `vw`), the `dvh`/`svh`/`lvh` family, logical properties
- **Stacking contexts and containing blocks** &mdash; the single most common "why is my CSS doing that?" category, with the ancestor-chain diagnostic
- **Anchor positioning, `popover`, `<dialog>`** &mdash; deleting a category of JavaScript
- **View transitions**, motion and `prefers-reduced-motion`, styling architecture in 2026, and performance

**8 interview Q&A + 6 tricky questions + a 64-rule cheat sheet.**

### New Guide &mdash; Accessibility (Front End)

Accessibility stopped being optional in June 2025, when the **European Accessibility Act** became enforceable. It's now a standard part of frontend interviews.

- **The legal landscape** &mdash; EAA, ADA Titles II & III, EN 301 549, and why accessibility overlays lose in court
- **POUR and the WCAG structure**, plus the criterion numbers that come up by number in audits
- **WCAG 2.2** &mdash; all nine new criteria with levels, and the three that change how you build: target size (24&times;24), dragging movements, and accessible authentication &mdash; **blocking paste in an OTP field is a failure**
- **Semantic HTML first** &mdash; and the five rules of ARIA, with the naming priority order and why a broken `aria-labelledby` yields an *empty* name rather than falling through
- **Keyboard and focus** &mdash; roving tabindex for composite widgets, `:focus-visible`, and a table of where focus should go on every state change
- **The accessibility tree** &mdash; what actually removes an element from it, and the `.sr-only` implementation that works
- **Forms, colour and contrast, live regions** &mdash; including the rule that makes live regions work at all (the empty region must exist *before* you write to it)
- **Component patterns** &mdash; modal, tabs, accordion, combobox, toast, table, and the `role="menu"` distinction interviewers love
- **Accessibility in React** and **testing** &mdash; with the number that matters: automated tools catch only ~30&ndash;40%

**8 interview Q&A + 5 tricky questions + a 65-rule cheat sheet.**

### New Guide &mdash; Web Security (Back End)

- **A threat model** &mdash; almost every web vulnerability is confused *identity*, confused *data/code*, or confused *trust*, and the defence follows from which
- **XSS** &mdash; the three types (and why DOM-based defeats server-side defences), contextual output encoding, the `javascript:` URL bug React doesn't catch, and why you sanitise on output with DOMPurify rather than a regex
- **CSP and Trusted Types** &mdash; why host allowlists are obsolete, the nonce + `strict-dynamic` policy, deploying in report-only, and why Trusted Types is the *structural* fix for DOM XSS
- **CSRF** &mdash; why `SameSite` is necessary but not sufficient, and the honest answer about token-based APIs
- **Tokens and sessions** &mdash; the storage question answered by refusing the premise, the BFF pattern, the `__Host-` cookie prefix, refresh rotation with reuse detection, and IDOR
- **Supply chain** &mdash; the attack shapes, and the controls that actually contain them (`--ignore-scripts`, provenance, separated CI privileges)
- **Injection beyond XSS** &mdash; SQL, NoSQL, command, SSRF, path traversal, prototype pollution, ReDoS, open redirect, mass assignment
- **Secrets, authentication hardening**, and a full security-headers reference

**8 interview Q&A + 4 tricky questions + a 58-rule cheat sheet.**

### New Guide &mdash; SQL & Relational Databases (Back End)

The biggest remaining gap: the Database Schema guide was mostly MongoDB, so there was no coverage of joins, indexes, query plans, transactions or isolation &mdash; the things asked in nearly every backend and full-stack loop.

- **Query semantics** &mdash; the logical order of evaluation (which explains most SQL confusion), `WHERE` vs `HAVING`, and why `NULL` is *unknown* rather than a value
- **JOINs** &mdash; including the two most common bugs in production SQL: a `LEFT JOIN` silently becoming an `INNER JOIN` when you filter a right-hand column in `WHERE`, and **row multiplication** when two one-to-many joins hit the same parent and quietly break every aggregate
- **Window functions** &mdash; the highest-value SQL feature most candidates don't know exists, with the canonical "latest row per group" solution
- **Indexes** &mdash; the B-tree model, the **leftmost-prefix rule** (an index on `(a,b,c)` cannot serve `WHERE b = 2`), covering indexes and index-only scans, partial and expression indexes, and the **non-sargable predicates** that silently defeat an index
- **Reading a query plan** &mdash; `EXPLAIN (ANALYZE, BUFFERS)`, and the single most useful diagnostic: comparing *estimated* to *actual* rows, because a bad estimate is the root cause and the plan shape is only the symptom
- **Transactions and isolation** &mdash; all four anomalies, why the defaults differ between Postgres and MySQL, and **write skew** explained properly (two transactions read a set, decide independently, write different rows, and break an invariant neither would have broken alone)
- **Locking and deadlocks** &mdash; the consistent-lock-ordering fix, and why deadlocks are retryable
- **The N+1 problem** &mdash; why it never shows up in a slow-query log, three fixes, and the query-count budget assertion that prevents it permanently
- **Migrations and scaling** &mdash; expand/contract for zero-downtime schema changes, and the scaling order most teams get backwards

**8 interview Q&A + 4 tricky questions + a 63-rule cheat sheet.**

### New Guide &mdash; Docker, Kubernetes & CI/CD (Back End)

`Dockerfile` previously had **zero** mentions anywhere in the library.

- **Container fundamentals** &mdash; namespaces, cgroups and union filesystems; why isolation is weaker than a VM; and the two facts that drive every Dockerfile optimisation (layers are cached, and layers are **additive** so deleting a file doesn't shrink the image)
- **Writing a Dockerfile** &mdash; the canonical multi-stage Node build with every line justified, the frontend/nginx variant, and **signals and PID 1** (shell-form `CMD` means your process never receives `SIGTERM`, so every deploy drops in-flight requests)
- **Image size and security** &mdash; base image trade-offs including the Alpine/musl caveat, distroless, `.dockerignore`, and BuildKit secret mounts
- **Compose** &mdash; and the three details that are the actual interview content, including why `depends_on` alone doesn't wait for readiness
- **Kubernetes** &mdash; declarative reconciliation as the organising idea, the object model, and how traffic actually finds a pod
- **The three probes** &mdash; readiness answers "route to me?", liveness answers "restart me?" &mdash; and the classic mistake of checking a dependency in the liveness probe, which turns a 20-second database blip into a ten-minute self-inflicted outage
- **Requests vs limits** &mdash; and why CPU throttles while memory gets OOMKilled
- **CI/CD** &mdash; build once and promote the same artefact, a real GitHub Actions workflow with the details that are usually missing (OIDC instead of stored keys, pinned actions, explicit permissions), and why speed is a correctness feature
- **Deployment strategies** &mdash; rolling, blue-green, canary; feature flags decoupling deploy from release; and why the database is always the real constraint
- **When *not* to use Kubernetes**

**8 interview Q&A + 3 tricky questions + a 58-rule cheat sheet.**

### New Guide &mdash; Web Performance & Core Web Vitals (Front End)

- **The metrics** &mdash; LCP, INP and CLS with their thresholds, why **INP replaced FID** in 2024, and the diagnostic metrics that tell you *where* the problem is
- **Decomposition** &mdash; the single most useful skill here: LCP splits into TTFB + load delay + load time + render delay, and INP splits into input delay + processing + presentation. Each part has a completely different fix, and teams routinely compress an image when their problem was a slow server
- **Lab vs field** &mdash; field data tells you *what* to fix, lab data helps you *fix* it; why Lighthouse structurally cannot measure INP; and how to set up RUM that's actually useful (attribution, segmentation, percentiles)
- **The loading pipeline** &mdash; what blocks parsing versus what blocks rendering, and the **preload scanner** (which explains why a CSS background image or a JS-inserted hero is a bad LCP element)
- **Resource hints** &mdash; and how each one backfires when misused
- **Images and fonts** &mdash; the two biggest wins, including why `font-display: swap` fixes one problem and causes another
- **JavaScript** &mdash; why you pay for it three times, third-party scripts as usually the biggest cost, and the cost of hydration
- **INP and the main thread**, **layout stability**, and **budgets in CI** that survive contact with a real team

**8 interview Q&A + 4 tricky questions + a 57-rule cheat sheet.**

### New Guide &mdash; Testing Strategy & E2E (Front End)

The Jest & RTL guide covers *how* to write a test. This covers everything after that.

- **The shape of a suite** &mdash; pyramid vs trophy, what they actually agree on, and the ice-cream-cone anti-pattern
- **What to test at each level** &mdash; with the heuristic that settles most arguments: test at the lowest level that can catch the bug
- **Vitest vs Jest**, and why jsdom is not a browser
- **Mocking** &mdash; mock at the **network boundary**, not at your own module boundaries, and why mocking your own modules tests your code against your assumptions about your own code
- **Playwright** &mdash; auto-waiting and web-first assertions, locator priority (which doubles as an accessibility smoke test), `storageState` for auth, network stubbing, and the trace viewer
- **Flake** &mdash; treated as the real enemy, because a flaky test trains the team to ignore red. The full cause/fix table and a quarantine policy that works
- **Visual regression, accessibility testing and contract testing** &mdash; including the gap that causes "all tests green, production broken"
- **Coverage** &mdash; why 100% is the wrong goal, and what to measure instead

**7 interview Q&A + 3 tricky questions + a 51-rule cheat sheet.**

### New Guide &mdash; Low-Level Design & OOD (System Design)

The "design a parking lot" round, which has no LeetCode equivalent and rewards a method rather than a memorised answer.

- **What's actually being tested** &mdash; and the key insight: **the mid-interview requirement change is the exam.** A design where "now support electric vehicles" means adding a class passes; one where it means editing five `if` chains does not
- **The method** &mdash; clarify (the highest-value two minutes) &rarr; find the nouns &rarr; assign responsibilities &rarr; define interfaces at the axes of variation &rarr; sketch &rarr; walk a scenario and attack your own design
- **SOLID, usefully** &mdash; what each principle actually buys you, with the smell that identifies each violation
- **Composition over inheritance**, including the Liskov test and why most LSP violations are really mutability problems
- **Four worked designs**: **parking lot** (with a table showing how each requirement change becomes "add a class"), **rate limiter** (all five algorithms compared, and why token bucket usually wins), **elevator** (the SCAN algorithm and two-sorted-sets model), **vending machine** (the State pattern making illegal transitions inexpressible)
- **Concurrency in LLD** &mdash; including the JavaScript-specific point that races live across `await` boundaries rather than between threads
- **The eleven common mistakes**

**5 interview Q&A + 3 tricky questions + a 44-rule cheat sheet.**

### AI & LLM Engineering &mdash; MCP, Frameworks and Multi-Agent

Major expansion of the guide added last release.

- **MCP (Model Context Protocol)** &mdash; the N&times;M problem it solves, the three primitives and *who decides to use them* (tools = the model, resources = the host, prompts = the user), both transports, the 2026-07-28 spec's move to a **stateless** core and why that matters operationally, a minimal server, the security story (tool poisoning, the confused deputy), and when MCP is over-engineering
- **Multi-agent patterns** &mdash; opening with the counter-evidence, because it's the strongest thing you can say: a single agent matches or beats multi-agent on ~64% of benchmarked tasks. Then the six topologies compared, why orchestrator-worker is the default, and what actually breaks (context loss compounding at every handoff)
- **Frameworks** &mdash; LangChain and LangGraph are not competitors (`create_agent` runs *on* the LangGraph runtime), "LangChain for linear, LangGraph for cyclic", what LangGraph actually buys you (durable execution, HITL interrupts, typed state, time-travel replay), and when the provider SDK is the right answer
- **Beyond naive RAG** &mdash; query rewriting and decomposition, contextual retrieval, agentic RAG, GraphRAG, multimodal &mdash; each framed as fixing a *specific* failure, with an ordered list of what to try first

**4 more interview Q&A + 2 more tricky questions**, and the cheat sheet grew to 50 rules.

### React Guide &mdash; React 19.2 and the Compiler, Brought Current

The React 19 section stopped at `useOptimistic` and described the compiler in a single sentence. It now covers what actually shipped.

- **`<Activity />`** &mdash; the boundary that **preserves state while destroying effects**, which is the combination neither conditional rendering (loses state) nor `display: none` (keeps timers and subscriptions running) could express. Includes the comparison table, the pre-rendering use case, and the traps: a hidden activity still re-renders on new props at low priority, hiding uses `display: none`, and effect cleanup becomes load-bearing rather than good practice
- **`useEffectEvent`** &mdash; the fix for "I need the latest value but don't want the effect to re-run". Walks the chat-room example, explains why `useCallback` gives stability *or* freshness but never both, and covers the restriction that effect events may only be called from inside effects
- **React Compiler 1.0** &mdash; rewritten from a stub. How the HIR and data-flow analysis produce finer-grained memoization than hand-written `useMemo`, the purity and immutability rules it depends on, and the critical failure mode: it **bails out silently** on components that violate the rules, so adoption is a linting project first
- **React 19.2's rendering changes** &mdash; Partial Pre-rendering (`prerender` + `resume`), batched Suspense reveals in SSR, `cacheSignal`, Performance Tracks in Chrome DevTools, the `useId` prefix change
- **Where React actually is** &mdash; a status table, including the correction that `<ViewTransition>` and Fragment Refs are **still Canary-only** despite a great deal of 2026 writing treating them as shipped

**4 new interview Q&A + 4 new tricky questions** (React tricky total: 22 &rarr; 26).

### React Guide &mdash; The Fundamentals Checklist

Filled the gaps against a comprehensive React interview question list. New sections: **Higher-Order Components**, **Presentational vs Container** (including why the original prescription was walked back), **Flux and one-way data flow** (why it matters, not just the diagram), **Portals** (what follows the React tree vs the DOM tree), **Fragments and Node vs Element vs Component**, **StrictMode**, **internationalisation**, and **event delegation and the synthetic event system**.

Plus a **Rapid-Fire Fundamentals** round of **12 new Q&A**: Node vs Element vs Component, why never to mutate state, Context pitfalls and reducing Context re-renders, resetting state with `key`, hydration mismatches, testing strategy, data-fetching pitfalls, `forwardRef` in React 19, `useReducer` vs `useState`, `useId`, what re-rendering actually means, and how to debug a React app.

### TypeScript Guide &mdash; The Go Compiler, and Inference Control

- **TypeScript 6.0 and 7.0** &mdash; the compiler was rewritten in Go and shipped stable on 8 July 2026, 8&ndash;12&times; faster. Covers why Go (native speed, real structs, shared-memory parallelism that Node's worker model cannot do), the two-track release plan, and the upgrade caveat that matters: the programmatic API is not stable in 7.0, so Vue/Svelte/Astro/MDX tooling stays on 6.0
- **Modern compiler flags** &mdash; `erasableSyntaxOnly`, `verbatimModuleSyntax`, `isolatedDeclarations`, `noUncheckedIndexedAccess`, `module: preserve`, with the reasoning behind each rather than a list
- **Controlling inference** &mdash; `const` type parameters (and how they differ from `as const` and `satisfies`), `NoInfer<T>`, and inferred type predicates with the trap that an explicit `: boolean` return type silently defeats the narrowing

**4 new interview Q&A + 3 new tricky questions** (TypeScript tricky total: 16 &rarr; 19).

### JavaScript Guide &mdash; ES2024, ES2025, ES2026

Section 9 stopped at ES2023. It is now "ES6+ and Modern JavaScript" and runs through ES2026, with a table showing which edition shipped what so you can tell what needs a polyfill.

- **Temporal** &mdash; the `Date` replacement, with the full type table and the point interviewers actually test: picking the right type encodes a business decision. A hotel check-in is a `PlainDate`; a meeting is a `ZonedDateTime`; a recurring 9 a.m. standup is a `PlainTime` and storing it as a UTC instant is the bug that makes it drift twice a year
- **Explicit resource management** &mdash; `using` and `await using`, reverse disposal order, `DisposableStack`
- **Iterator helpers** &mdash; lazy `map`/`filter`/`take` on any iterator, why they beat array chains on large data, and the single-use gotcha
- **Grouping and Set methods** &mdash; `Object.groupBy` vs `Map.groupBy` (key stringification, `null` prototype), and the seven new `Set` methods
- **Smaller additions** &mdash; `Promise.withResolvers`, `Array.fromAsync`, `Promise.try`, `Error.isError`, `RegExp.escape`, `Object.hasOwn`, class static blocks, private brand checks, import attributes

**4 new interview Q&A + 5 new tricky questions** (JavaScript tricky total: 11 &rarr; 16).

### JavaScript Guide &mdash; Async Patterns and Global Error Handling

Filled the gaps against a "20 JavaScript questions for frontend developers" list. New sections:

- **Mixing `async`/`await` with `.then()`/`.catch()`** &mdash; the forgotten `await` that escapes your `try`/`catch`, why `.catch()` returning a value turns a rejection into a silently-wrong resolution, where `.then()` is genuinely better, and the `return await` vs `return` distinction inside a `try`
- **Top-level `await`** &mdash; how it makes a module an *async module*, the three genuinely useful patterns, and why `require()` of such a module throws even on Node 24
- **Retrying, cancelling and bounding async work** &mdash; exponential back-off with **jitter** (and why jitter isn't optional), `AbortController` and `AbortSignal.timeout`, and a bounded-concurrency pool
- **Global error handling** &mdash; "error boundaries" outside React: the four browser hooks, why `error` and `unhandledrejection` are separate events, why resource-load failures need the capture phase, why cross-origin scripts give you a useless `"Script error."`, and how this relates to React error boundaries
- **Testing async code without a framework** &mdash; `node:test` and `assert.rejects`, plus the techniques that make async tests reliable

### Node.js Guide &mdash; Node 24 LTS and Node 26

- **A release table** for Node 22 / 24 / 26 with what each one changed, plus the note that Node 26 is the last release on the six-month schedule before annual releases begin
- **`require(esm)`** &mdash; the dual-package nightmare is over, with the two limits: it fails on top-level `await`, and the default export arrives on `.default`
- **Running TypeScript with no build step** &mdash; `node app.ts`, and the crucial point that it **strips types without checking them**, so `tsc --noEmit` is still mandatory and only erasable syntax is allowed
- **Built-ins that removed dependencies** &mdash; `node:sqlite`, the global `WebSocket` client (client only, not a server), `node --run`, the permission model as a supply-chain answer, and `Temporal` as a global in Node 26

**2 new interview Q&A + 2 new tricky questions** (Node tricky total: 12 &rarr; 14).

### Frontend Tooling Guide &mdash; The 2026 Toolchain

A new section on where the toolchain landed, because 2025&ndash;26 was the year every layer got a native rewrite and then started consolidating.

- **Vite 8 and Rolldown** &mdash; Vite used to run esbuild in dev and Rollup in production, which meant two module graphs and the "works in dev, breaks in build" bug class. Vite 8 ships Rolldown as the single bundler for both, 10&ndash;30&times; faster, and unlocks full bundle mode in dev, persistent caching and Module Federation
- **Turbopack** &mdash; Next.js 16 removed webpack as the default, and why both ecosystems reached the same conclusion independently
- **Linting** &mdash; ESLint 10 removed `eslintrc` entirely, plus an honest comparison of ESLint + typescript-eslint vs oxlint vs Biome, including which job each one is actually built for
- **What to actually pick** &mdash; a decision list, and the framing that matters more than the versions

**3 new interview Q&A.**

### Behavioral Guide &mdash; The AI-Assisted Interview

The biggest change to technical hiring in a decade, and it is a behavioural change as much as a technical one. New section covering:

- **What changed and why** &mdash; and a table of what Google, Meta, Canva and Anthropic actually do, including that several now grade "AI fluency, prompt engineering and output validation" explicitly
- **What is being graded** &mdash; direction versus passive acceptance, verification (the highest-weighted signal at most companies), requirement clarification, and communicating while your attention is split between the model and the interviewer
- **A practical playbook** &mdash; clarify before prompting, state which parts you'll delegate and why, prompt like a specification rather than a question, verify actively, push back when the model is wrong, keep narrating
- **Anti-patterns that fail the round** &mdash; paste-and-pray, not reading the generated code, delegating the design decisions, going silent, and assuming AI is allowed without checking
- **Behavioural questions about AI use** &mdash; model answers for "how do you use AI?", "tell me about a time it led you astray", "how do you review AI-generated code?", "how do juniors still learn?", "has it changed your estimates?"
- **What got harder** &mdash; when everyone's code compiles, differentiation moves to architecture, debugging, code review and communication, which changes what's worth practising

**3 new interview Q&A.**

### Rewritten Introduction

The home page now opens with **"The 20 Topics That Actually Come Up"** &mdash; a prioritised roadmap across JavaScript core, React mastery, performance and essential concepts, each linking to where it's covered. Followed by a full, current map of every guide grouped by theme, the interactive tools, and three study plans depending on whether you're interviewing in a week, a month, or just levelling up.

### Totals

**53 guides** across 8 categories. **30 guides** now have "Guess the Output" tricky-question sections, **261 questions** in total &mdash; up 65 this release.

---

---

## v1.0.9 (May 2026)

### Single Number II &mdash; the XOR Follow-up

Added a new Medium challenge that complements **Single Number** (75 &rarr; **76** JS challenges). When every element appears THREE times except one, the classic XOR trick breaks &mdash; XOR is addition mod 2 per bit, so triples leave bits set just like singletons. The fix is **bit-counting mod 3**: for each of the 32 bit positions, count how many numbers have that bit set, take mod 3, reassemble. Two approaches shown: the clear-to-explain 32-pass version and the elegant two-bit state-machine (`ones = (ones ^ x) & ~twos`; `twos = (twos ^ x) & ~ones`) that does it in a single pass.

The original Single Number explanation now also flags this constraint up front &mdash; XOR works ONLY for "exactly twice", and the moment the problem shifts to triples (or any K), you need bit-counting mod K.

### New Theory Guides &mdash; OAuth & SSO, Microservices, Frontend System Design

Three substantial new guides fill long-requested theory gaps. **Total guides: 39 &rarr; 42.**

**OAuth & SSO (Back End)** &mdash; a comprehensive walkthrough of OAuth 2.0, OpenID Connect, SSO, and SAML. Covers all four grant types (Authorization Code, Client Credentials, Implicit-deprecated, ROPC-deprecated), PKCE for mobile/SPA, JWT anatomy and validation, refresh token rotation with theft detection, browser token storage strategies (the BFF pattern recommendation), logout complexity across federated apps, security pitfalls, and Node + SPA implementation recipes using `openid-client` and `msal.js`. **12 interview Q&A + 8 tricky scenario Qs.**

**Microservices (Back End)** &mdash; engineering view of microservices, not the marketing one. Covers when to choose them and when NOT to, the "modular monolith" middle path, service-boundary design (bounded contexts, data ownership), sync vs async communication, API gateway and BFF patterns, service discovery (DNS / client-side / mesh), distributed transactions and the saga pattern (choreography vs orchestration), the outbox pattern for at-least-once event publishing, resilience patterns (circuit breakers, retries with jitter, timeouts), observability (logs, metrics, traces with OpenTelemetry), auth across services, deployment strategies (blue-green, canary, feature flags), the distributed-monolith anti-pattern, and a realistic incremental migration playbook. **12 interview Q&A + 8 tricky scenario Qs.**

**Frontend System Design (System Design)** &mdash; the question style you get in Senior/Staff frontend interviews. Starts with the framework: how to clarify, the architecture pieces, state-management trade-offs (server vs client vs URL state), data fetching, real-time transports, performance/caching, accessibility. Then applies it to seven canonical designs:
- **Netflix** &mdash; video player with adaptive bitrate streaming (HLS/DASH), DRM, hover previews, row virtualization
- **Twitter/Facebook Feed** &mdash; virtualized infinite scroll, cursor pagination, optimistic UI, "3 new tweets" pill
- **Zoom/Google Meet** &mdash; WebRTC with SFU vs mesh topology, simulcast, bandwidth adaptation, echo cancellation
- **WhatsApp-style Chat** &mdash; WebSocket + IndexedDB local-first, offline outbox, read receipts, push notifications
- **Streaming Under Poor Network** &mdash; the ABR algorithm explained, buffer management, Network Information API, audio-first fallback
- **Reusable Tabs Component (HLD)** &mdash; compound components, ARIA, keyboard nav, controlled/uncontrolled, lazy panels

**8 interview Q&A + 8 tricky scenario Qs** covering server-state-vs-Redux, GraphQL pitfalls, SSR migration, real-time presence at scale.

### Polyfills &mdash; Detailed Line-by-Line Walkthroughs

Every polyfill's Explain modal now walks through the implementation **one line at a time**, with deeper annotations on the canonical ones (`Array.map`, `Array.filter`, `Array.reduce`, `Function.bind`, `Promise.all`). Each explanation now opens with a generalized "how to write a polyfill" mental model &mdash; the four parts (validate inputs, walk the data, apply the callback with canonical signature, return the right shape) &mdash; so the technique transfers to any built-in. Line annotations point out the subtle correctness details: the sparse-array `i in this` check, why `new Array(n)` is faster than `push`, the `arguments.length < 2` detection in reduce, the Promise.all closure-index trick that preserves order despite async ordering.

### 14 More String + Array Challenges + Easy-First Default Sort

The playground gained 14 new JS Coding Challenges (50 &rarr; **64**). The set covers common gaps in string parsing, in-place array tricks, bit manipulation, and one classic binary-search variant:

**Mirrors of existing challenges:**
- **Rotate Array Left** &mdash; same three-reversal trick as Rotate Array (right) with the order flipped
- **Reverse Words in a String** &mdash; uses the reverse pattern twice (whole string then each word)

**Strings:**
- **Longest Common Prefix** &mdash; vertical scan
- **Longest Palindromic Substring** &mdash; expand around center
- **Reverse Vowels of a String** &mdash; two-pointer
- **String to Integer (atoi)** &mdash; whitespace, sign, INT32 overflow clamping
- **Letter Combinations of Phone Number** &mdash; backtracking

**Arrays:**
- **Single Number** &mdash; XOR identity
- **Majority Element** &mdash; Boyer&ndash;Moore voting
- **Product of Array Except Self** &mdash; two-pass left/right product trick, no division
- **Plus One** &mdash; digit-array carry walk
- **Subarray Sum Equals K** &mdash; prefix sum + hash map
- **Search in Rotated Sorted Array** &mdash; binary search where one half is always sorted
- **Spiral Matrix** &mdash; four-boundary directional traversal

**Default sort is now Easy &rarr; Medium &rarr; Hard.** When "All" difficulty is selected, the cards order themselves by difficulty within each category so you start with the warmups and ramp up. Other filter selections preserve insertion order.

### Coding Challenges Now Tagged by Algorithmic Pattern

Every JS Coding Challenge is now tagged with the algorithmic pattern(s) it demonstrates &mdash; so studying one challenge teaches you the pattern for every other challenge that shares the tag. **Reverse String** and **Valid Palindrome** both use the **Two Pointer** pattern; learn it once on Reverse String, you've learned it for both.

Each template card now shows its pattern tags below the name. A new **Pattern filter** row in the templates modal (challenges tab) lets you narrow the list to only challenges that use a specific pattern. Clicking **Two Pointer** surfaces 10 challenges all using the same converging-pointer technique:

- Reverse String &middot; Valid Palindrome &middot; Container With Most Water &middot; 3Sum &middot; Trapping Rain Water &middot; Move Zeros &middot; Rotate Array &middot; Sort Colors &middot; Detect Cycle in Linked List &middot; Merge Two Sorted Lists &middot; Merge Sorted Arrays

The 14 patterns are organized into 5 super-categories &mdash; no long horizontal-scrolling row, just five short labeled rows that fit any screen:

- **Linear scans:** Two Pointer · Sliding Window · In-Place
- **Lookup:** Hash Map / Set · Stack
- **Recursive:** Recursion / D&amp;C · Backtracking
- **Optimization:** Dynamic Programming · Greedy · Binary Search
- **Data + Misc:** Sorting · Linked List · Closure / State · Math / Bit

Each chip shows its challenge count, so you can see at a glance which patterns are most-asked.

Distribution highlights:
- **Hash Map / Set** &mdash; 11 challenges (Two Sum, Find Duplicates, EventEmitter, LRU, Memoize, etc.)
- **Two Pointer** &mdash; 10 challenges
- **Recursion / D&amp;C** &mdash; 9 (Quick Sort, Merge Sort, Flatten Array, Deep Clone, Compose &amp; Pipe, Subsets, Permutations, Generate Parentheses, Sum Curry)
- **Closure / State** &mdash; 6 (Debounce, Throttle, Memoize, EventEmitter, Compose &amp; Pipe, Sum Curry)
- **Sorting** &mdash; 6 (Bubble/Quick/Merge Sort plus Group Anagrams, Anagram Check, Top K Frequent)
- **Dynamic Programming** &mdash; 5 (Climbing Stairs, House Robber, Coin Change, Maximum Subarray, Max Profit)

A challenge can have multiple patterns (Quick Sort is both **Sorting** and **Recursion / D&amp;C**; Longest Substring is both **Sliding Window** and **Hash Map / Set**). The intent is that the patterns reflect what techniques you actually need to know to solve the challenge.

### Every Coding Challenge Now Has 2+ Approaches with Elaborate Teaching

Big quality upgrade across all 35 algorithm explanations. Every challenge in the Explain modal now shows **at least two approaches** &mdash; the canonical "best" answer plus an alternative or baseline &mdash; with multi-paragraph intuitions that walk you through the algorithm rather than just stating it.

A representative sample of new second approaches now shipped:

- **Reverse String** &mdash; built-in chain (split &rarr; reverse &rarr; join) alongside the canonical two-pointer
- **Valid Palindrome** &mdash; regex-based strip-and-compare with the regex `/[^a-z0-9]/gi` broken down piece by piece (`[^...]` negation, `a-z` and `0-9` ranges, `g`/`i` flag meanings)
- **FizzBuzz** &mdash; string concatenation with the elegant `s || String(i)` falsy-empty-string trick
- **Max Profit** &mdash; brute-force baseline showing the path to the O(n) one-pass insight
- **Valid Parentheses** &mdash; the cute "replace inner pairs" alternative (O(n&sup2;) but a beautiful constructive proof)
- **Quick Sort** &mdash; three-way partition (Dutch National Flag) for duplicate-heavy inputs
- **Merge Sort** &mdash; bottom-up iterative variant that avoids recursion stack overhead
- **Find Missing Number** &mdash; XOR identity (`a ^ a = 0`) for overflow safety
- **LRU Cache** &mdash; the textbook DLL+Map version alongside the JS Map insertion-order trick
- **Memoize** &mdash; WeakMap variant for object-keyed caches with automatic GC
- **Deep Clone** &mdash; quick `JSON.parse(JSON.stringify())` baseline with all the things it loses (Date, undefined, functions, cycles)
- **Throttle** &mdash; trailing-edge variant that captures the LAST args (vs leading-edge that captures the first)
- **Compose &amp; Pipe** &mdash; async pipe that awaits each step
- **Binary Search** &mdash; recursive variant with the JS-tail-call-not-eliminated caveat
- **Climbing Stairs** &mdash; memoized top-down recursion alongside the O(1) bottom-up

When regex appears in any approach, the regex itself is now explained piece by piece &mdash; what each character class means, what each flag does, why the pattern was chosen.

### New JS & TS Guide &mdash; Regex

A complete, interview-grade Regex guide now lives under JS &amp; TS. Roughly 1,100 lines covering:

- **What regex is** (and emphatically isn't &mdash; HTML, JSON, RFC 5322 emails)
- **The two creation forms** (literal vs constructor) and the double-escape gotcha
- **All 8 flags** &mdash; `g i m s u y d v` &mdash; what each does and when to use it
- **Character classes**, **anchors**, **word boundaries**
- **Greedy vs lazy quantifiers** with a tag-extraction example
- **Groups, captures, named captures, backreferences**
- **All 4 lookarounds** with worked examples (the strong-password regex with stacked positive lookaheads)
- **Unicode handling** &mdash; the `u` flag, `\p{Letter}`, surrogate-pair gotchas with emoji
- **Full JS API** &mdash; test, exec, match, matchAll, replace, replaceAll, search, split &mdash; with the differences between them
- **The `lastIndex` gotcha** &mdash; the #1 source of regex bugs in JS, with three fixes
- **Catastrophic backtracking and ReDoS** &mdash; what makes a regex hangable, why `(a+)+` is dangerous, how to avoid it
- **Commonly used patterns** &mdash; email, URL, phone, IPv4, ISO date, time, HEX color, strong password, username, UUID v4, credit card, slug, whitespace, markdown, HTML
- **Real-world use cases** &mdash; form validation, slug generation, search highlighting, query string parsing, sensitive-data masking, URL extraction, HTML stripping, camelCase&harr;kebab-case, template token replacement
- **Anti-patterns** &mdash; what regex should never be used for
- **Full cheat sheet**
- **8 interview Qs** + **8 tricky Qs** including the `lastIndex` bug, the catastrophic-backtracking pattern, the split-with-capture-group surprise, and the HTML-escape-order subtlety

Total guides: 38 &rarr; **39**. JS &amp; TS section: 3 &rarr; **4**.

### Polyfill Cross-Links in Explain Modal + 7 New Polyfills

The Explain modal now shows you which built-in JavaScript methods each algorithmic approach actually leans on &mdash; with **clickable chips that open the corresponding polyfill template**. Curious how `Array.prototype.reduce` or `JSON.parse` is implemented under the hood? Click the chip in the Flatten Array or Deep Clone explanation, and the polyfill opens in the editor instantly.

Tagged so far:
- **Flatten Array** &rarr; reduce, concat, flat
- **Group Anagrams** &rarr; sort, join
- **Rotate Array** &rarr; reverse, slice, concat
- **Anagram Check** &rarr; sort, join
- **Deep Clone** &rarr; JSON.stringify, JSON.parse
- **Compose &amp; Pipe** &rarr; reduce

**7 new JS polyfills** added to fill commonly-asked gaps in interview prep:

- **JSON.parse** &mdash; full recursive-descent parser, pairing with the existing `JSON.stringify` polyfill
- **Array.isArray** &mdash; including the iframe-cross-realm gotcha that breaks `instanceof Array`
- **Object.create** &mdash; the classic 4-line implementation, descriptors variant, and the null-prototype use case for "true map" objects
- **Object.freeze + deepFreeze** &mdash; shallow native freeze, recursive deep freeze, plus a `WeakSet`-based cycle-safe variant
- **Array.prototype.fill** &mdash; with the shared-reference gotcha (`new Array(3).fill([])` makes three slots pointing to the SAME array)
- **String.prototype.repeat** &mdash; the O(log n) bit-shifting doubling trick, plus the naive baseline
- **Array.prototype.join** &mdash; with `null`/`undefined`/sparse-hole handling

Polyfill count: 24 &rarr; **31**.

### Playground — Auto-Save, Status Tracking, 15 New Challenges, Word Wrap

The biggest playground update yet. Five things shipped together.

**1. Your code is auto-saved per challenge.** Type anything in the editor and it's quietly saved every ~800ms. Close the tab, reload, come back tomorrow — your code is right where you left it. Each challenge has its own slot. When you reopen one, a small toast says "Resumed your saved work in '_X_'" and a **Reset** button lets you revert to the original challenge stub if you want a clean start. Show Solution still confirms before overwriting.

**2. Solved tracking.** When you click Run and every test passes (all ✅), the challenge is marked Solved. The templates modal now shows colored dots on each card — green for solved, amber for in-progress, none for untouched. The playground header shows your overall progress: "**4 / 50 solved**". The pass/fail count appears as a green or red pill near Run after each execution.

**3. Continue last session + Random Challenge.** When you open `/playground`, if you have unfinished work, a pill at the top says **Resume "Two Sum"** with how long ago you edited it. One click takes you back. New **Random** button in the templates modal (challenges tab) opens a randomly chosen unsolved challenge.

**4. Notes scratchpad per challenge.** A collapsible Notes panel below the editor lets you jot down thoughts as you go — approach ideas, gotchas, complexity reasoning. Saved alongside your code. Stays empty for fresh templates.

**5. Word-wrap toggle (default ON).** New **Wrap on / off** pill in the editor toolbar. When the splitter is dragged narrow, long lines now wrap to the next line by default instead of clipping off the right side. Toggle off if you prefer horizontal scroll. Persists across reloads.

### 15 New JavaScript Coding Challenges

Total challenge count: 35 → **50**. New patterns now represented: dynamic programming, backtracking, monotonic stack, greedy, linked list cycle detection.

- **Maximum Subarray (Kadane's)** — classic DP / running sum
- **Trapping Rain Water** — two-pointer, harder
- **3Sum** — sort + two-pointer (extends Two Sum)
- **Generate Parentheses** — backtracking with two counters
- **Subsets** — power-set backtracking
- **Permutations** — backtracking with used-set
- **Min Stack** — implement push/pop/top/getMin all in O(1)
- **Daily Temperatures** — monotonic stack
- **Coin Change** — minimum-coins DP
- **House Robber** — adjacency-constrained DP
- **Jump Game** — greedy reachability
- **Detect Cycle in Linked List** — Floyd's tortoise & hare (helper included)
- **Sort Colors** — Dutch flag three-pointer
- **Top K Frequent Elements** — bucket sort or heap
- **Merge Two Sorted Lists** — linked list splicing (helper included)

### Playground — Resizable Layout + Step-by-Step Explain Modal

Two upgrades to the playground.

**Resizable editor / console split.** The vertical divider between the editor and the Console Output panel is now draggable. Grab it and pull left or right to give the panel that needs more room exactly that &mdash; useful when your test output runs long, or when you're typing a wide function. Your chosen split persists across reloads.

**Explain button (Two Sum, more coming).** Coding Challenges now have a new **Explain** button (Sparkles icon, indigo) next to **Show Solution**. Click it to open a step-by-step walkthrough modal:

- **Intuition** of the approach in one paragraph &mdash; what the algorithm is actually doing.
- **Complexity** with time, space, and a verdict on when to use it.
- **Visual canvas** showing the array, the hash map, and the math being performed at each step. Cells light up to show what i and j are pointing at; map entries highlight when newly added or matched.
- **Pseudocode** alongside the visual, with the current line highlighted as you walk through.
- **Step navigator** at the bottom &mdash; Prev/Next/Reset, click any dot to jump, or hit the Play button to auto-advance. Keyboard shortcuts: &larr;/&rarr; to step, Space to autoplay, Esc to close.

For Two Sum specifically, you can step through both **Brute Force** (4 steps showing the nested-loop comparisons) and the **Hash Map one-pass** approach (5 steps showing how the complement check + map fill works). It's the difference between reading a solution and watching the solution happen.

**Now extended to all 35 JavaScript Coding Challenges.** Every JS challenge in the playground now has its own Explain button with the same step-by-step treatment, tailored to the algorithm:

- **Stack visualizations** for **Valid Parentheses** (push/pop) showing matched openers and closers.
- **Two-pointer animations** for **Reverse String**, **Valid Palindrome**, **Container With Most Water**, **Merge Sorted Arrays** &mdash; pointers light up as they walk inward or merge.
- **Sliding window + set** for **Longest Substring Without Repeating** &mdash; watch the window expand and shrink.
- **Recursion call-stack** for **Quick Sort**, **Merge Sort**, **Flatten Array**, **Sum Curry**, **Deep Clone**, **Compose &amp; Pipe** &mdash; see frames stack up and resolve.
- **Linked-list nodes with arrows** for **Reverse Linked List** &mdash; prev/curr/next markers walk through the reversal.
- **Timeline visualizations** for **Debounce** and **Throttle** &mdash; events appear on a time axis showing which calls fire and which get skipped.
- **Hash map state** for **Group Anagrams**, **Anagram Check**, **First Non-Repeating Character**, **Memoize**, **EventEmitter**, **LRU Cache**, **Balanced Brackets (Count)** &mdash; entries highlight as new or hit.
- **Set state** for **Find Duplicates**, **Remove Duplicates** &mdash; chips light up as values are added or matched.
- **Sorting walkthroughs** for **Bubble Sort** with swap markers per pass.
- **Search visualizations** for **Binary Search** &mdash; low/mid/high pointers shrink in half each step.
- **Math callouts** for **Find Missing Number**, **Climbing Stairs**, **Roman to Integer**, **Second Largest Number** &mdash; running computation shown step by step.

React Machine Coding templates intentionally do **not** have Explain entries &mdash; those are open-ended UI builds, not single-answer algorithms.

### Checkpoints — Pick Up Where You Left Off

Reading a long guide, hitting pause, and trying to remember which section you were on now has a one-click answer.

While reading **any guide**, scroll to wherever you stopped and click the new floating **&ldquo;Save Checkpoint&rdquo;** button (bottom-right, appears once you've scrolled past the top). It auto-detects the nearest heading above your current viewport and remembers it as your reading position for that guide.

When you return to the same guide, an indigo **&ldquo;Continue from 'Hooks'&rdquo;** banner appears at the top &mdash; one click smooth-scrolls you straight back to the section you were last reading. The banner has an &times; to clear the checkpoint when you're done.

**One checkpoint per guide.** Saving a new one replaces the old (you don't need to clean up). Unlike bookmarks (where you save many interesting sections to revisit), a checkpoint is your single &ldquo;you are here&rdquo; marker. The two coexist &mdash; you might bookmark a key section for reference and set a checkpoint somewhere else for resuming.

A new **&ldquo;Checkpoints&rdquo;** entry in the sidebar Tools section opens a global page listing every checkpoint you've saved across all guides, sorted by most recent. Each row shows the guide name, the section heading, when you saved it, and a **Continue &rarr;** button that jumps you straight there.

All checkpoints persist locally in the browser like the rest of PrepHub's state &mdash; nothing leaves your device.

### New Guide — Real-Time Web (Polling, SSE, WebSockets & Beyond)

A new Front End guide covering the architectural question of "how does the server tell the client something happened?" — every transport pattern senior front-end interviews probe.

**What's covered (~1,400 lines, 9 transport patterns):**

- **HTTP is request/response** — the architectural fact every pattern in the guide exists to work around
- **Short polling** — when it's the right answer, exponential back-off, pause-on-hidden-tab
- **Long polling** — Comet-era pattern, still valuable as a fallback; full Express server example with event bus
- **Server-Sent Events** — `EventSource`, frame format (`data:`, `event:`, `id:`, `retry:`, comment heartbeats), `Last-Event-ID` resumption, the ~6-connections-per-origin gotcha + HTTP/2 fix
- **WebSockets** — handshake (with `Sec-WebSocket-Accept` SHA-1 derivation), frame anatomy (FIN, opcode, MASK), why client→server frames are masked (cache-poisoning defense), close codes (1000/1001/1006/1011/4xxx), heartbeats, the half-open connection problem, full reconnection-with-jitter implementation, `ws` Node example, Socket.IO example with rooms + acks
- **HTTP streaming with `fetch` + ReadableStream** — how AI chat UIs (ChatGPT-style) actually work; SSE-over-fetch for endpoints that need `Authorization` headers (which `EventSource` can't send)
- **WebRTC DataChannels** — peer-to-peer with sub-100ms latency; signaling channel responsibilities; when you'd actually reach for it (games, collab editors, P2P file transfer)
- **Push API + Service Workers** — VAPID, subscription endpoints, `web-push` Node example; the "must show a notification" browser policy
- **GraphQL Subscriptions** — `graphql-ws` server + Apollo Client setup; the operational-cost reality check

**Production concerns section** covers auth (token-in-URL vs subprotocol vs cookie vs auth-after-open), reconnection strategy (exponential back-off + full jitter + visibility-aware), message ordering & replay (sequence numbers, `Last-Event-ID`, outbox pattern), backpressure (`ws.bufferedAmount`, SSE `drain`), scaling (sticky sessions + Redis pub/sub fan-out diagram), monitoring metrics, and the WebSocket → SSE → long polling → short polling fallback chain.

**Decision table** comparing all 9 patterns by direction, latency, complexity, browser limits, and when-to-use; plus a 6-question decision tree.

**16 interview Qs** (beginner → advanced) covering why HTTP can't push, short vs long polling, SSE vs WebSocket choice, WebSocket handshake details, why client frames are masked, production reconnection requirements, SSE heartbeat vs WebSocket ping at protocol vs application layer, the 6-tab SSE limit, WebSocket auth strategies, WebSocket scaling with Redis pub/sub, the laptop-sleep half-open connection problem, when to use `fetch` streaming over `EventSource`, HTTP/2 push deprecation, polling as the right answer, and message-ordering with reconnect.

**8 tricky Qs** covering 8-tabs-hang on SSE, corporate-proxy WebSocket failures, out-of-order events despite TCP guarantees, React Strict Mode double-mounting WebSockets (with the singleton-context fix), WebSocket cost-explosion audit questions, Safari-only `fetch` streaming buffering, why "exactly-once" is a marketing lie (and the at-least-once + idempotent pattern that approximates it), and why a WebRTC video-call app still needs a WebSocket (signaling vs media).

Total guides: 37 → 38; tricky Qs across the app: 135 → 143.

### React Guide — Built-in Hooks Reference Now Has Theory

Section 6.2 was a lone code block listing every hook signature with no explanation — useful as a recap, useless if you didn't already know what `useImperativeHandle` was for. It's now a per-hook walkthrough: each of the 14 React 19 built-in hooks gets its own subsection with **what it does**, **when to use it**, and **the most common pitfall**, plus a focused example.

Highlights of what's now properly explained:

- **`useState` and `useReducer`** — when a reducer earns its complexity and when a single boolean really doesn't need one
- **`useEffect`** — what to use it for vs what people mistakenly use it for (deriving state, handling user events) — with a pointer to §7 for the full effect lifecycle
- **`useContext`** — the re-render storm pitfall when `value={{ user, setUser }}` is a fresh object literal every render
- **`useRef`** — DOM ref vs instance variable, and why reading `.current` during render breaks purity
- **`useMemo` vs `useCallback`** — the identity `useCallback(fn, deps) === useMemo(() => fn, deps)`, plus the senior-level "useless without consumer memoization" caveat
- **`useImperativeHandle`** — the "you're probably fighting the framework" warning sign
- **`useLayoutEffect`** — the synchronous-before-paint contract and when the flicker is bad enough to escalate from `useEffect`
- **`useSyncExternalStore`** — the "must return `===`-equal" stable snapshot rule that infinite-loops if you violate it
- **`useId`** — why it's SSR-safe and why you must NOT use it as a list `key`
- **`useTransition` vs `useDeferredValue`** — when to use one vs the other (own the setter / don't own the setter)

Opens with a 7-row mental-model table grouping all 14 hooks into State / Side effects / Context / Refs / Memoization / Concurrent / External data / Misc buckets.

### Playground — Rainbow Brackets + Matching-Pair Highlight

The playground editor now colors brackets by nesting depth — paired `( )`, `[ ]`, and `{ }` share the same color (gold / orchid / azure), cycling every three levels just like VS Code's bracket pair colorization. Makes it instantly obvious which closer belongs to which opener in deeply-nested JSX or callback chains.

When the cursor lands on a bracket, both that bracket **and its match** are outlined and softly highlighted, so you can see at a glance where a pair starts and ends. Strings, comments, and regex literals are intentionally skipped — a `(` inside `"hello ("` is still gray, not a depth color.

### Playground — Auto-Format with Prettier

New **Format** button (also `⌘/Ctrl + Shift + F`) reformats your code with Prettier on demand. The formatter is lazy-loaded on first click — about ~140 KB gzipped split across babel, estree, and the typescript plugin, none of which are paid for unless you actually format. Picks the right parser automatically: pure JS/JSX uses Babel, anything with TypeScript syntax (interfaces, generics, type annotations) uses TypeScript even when the template is marked JSX. If your code has a real syntax error, Prettier surfaces the line and column in the console without overwriting your buffer.

Two more editor niceties shipped alongside it:
- **Auto-indent on Enter** — pressing Enter inside `{`, `[`, or `(` opens a new line with one extra indent and re-aligns the closing bracket on a third line.
- **Bracket auto-close** (toggleable from the toolbar pill, persisted across sessions) — typing `(`, `[`, `{`, `"`, `'`, or `` ` `` inserts the matching closer and places the caret between them. Skipped intelligently when the next character is a word character (so `console.log` doesn't get an extra `)`).

### Playground — Every Challenge Solution Now Multi-Approach

Completed the audit: **all 35 Coding Challenge solutions** now show multiple approaches side by side with a Time / Space / Verdict comparison table and a "When to pick which" footer that explains the trade-offs and _why_ a given approach is used.

Highlights of what's now covered:

- **Sorting:** Bubble Sort (basic / early-exit / cocktail), Quick Sort (three-way partition / Lomuto in-place / random pivot), Merge Sort (top-down / bottom-up iterative)
- **Search:** Binary Search (iterative / recursive / linear baseline), Longest Substring (index-map / Set+shrink), First Non-Repeating Char (two-pass map / one-pass ordered map)
- **Data structures:** EventEmitter (Map of Sets vs Map of Arrays), LRU Cache (Map insertion-order trick vs textbook doubly-linked-list + Map), Memoize (4 cache strategies including WeakMap for object args)
- **Functional:** Debounce (4 variants: trailing-edge / leading-edge / both-edges / cancellable), Throttle (timestamp / timer / both-edges), Compose & Pipe, Sum Curry (empty-call vs valueOf trick), Memoize
- **Cloning / serialization:** Deep Clone (recursion+WeakMap vs `structuredClone` vs JSON round-trip), Group Anagrams (sorted-key vs char-count signature vs prime-product trick)
- **Array manipulation:** Rotate Array (slice+concat / reverse-three-times / cyclic replacement), Move Zeros (write-index / single-pass-swap / filter+pad), Find Missing Number (sum / XOR overflow-safe / Set / sort), Find Duplicates, Remove Duplicates
- **String / classic LeetCode:** Two Sum (hash map vs brute force), FizzBuzz (if/else / string-concat / lookup table), Valid Parentheses (stack canonical / replace-empty-pairs), Roman to Integer (peek / right-to-left / replace-pairs)

Every solution names its **best** approach for performance, **best** for readability, and **don't ship** baselines — and explains _why_ the pattern (sliding window, two-pointer, DLL+Map, etc.) is the right shape for the problem class. The Show Solution toggle in the playground reveals all of them.

### Playground — Multi-Approach Solutions + 2 More Templates

Two new Coding Challenges added:

- **Balanced Brackets (Count)** — count-based parity check for `()`, `[]`, `{}`. Returns true when the number of opens equals closes for each pair. Note: this is _different_ from the existing **Valid Parentheses** template, which validates nesting order (so `([)]` is `false` for that one but `true` for this count-based one).
- **Second Largest Number** — find the second-largest unique value in an array, without using `sort()`.

The "Show Solution" toggle for both new templates reveals **multiple approaches** side by side, with a comparison table showing time / space / verdict, and trailing commentary on when to pick which approach.

Several existing Coding Challenges had their solutions upgraded the same way — multiple approaches with performance commentary instead of one canonical answer:

- **Two Sum** — single-pass hash map (best) · two-pass hash map · brute force O(n²)
- **Reverse String** — two-pointer in-place · split+reverse+join (1-liner) · recursion · for-loop concat
- **Find Missing Number** — sum formula (best) · XOR (overflow-safe) · Set lookup · sort+scan
- **Find Duplicates** — two Sets (best) · frequency map · sort+scan · filter+indexOf
- **Anagram Check** — frequency map (best) · sort+compare · char-code array (ASCII)
- **Climbing Stairs** — bottom-up DP O(1) space (best) · dp array · memoized recursion · naive recursion · Binet's closed-form
- **Container With Most Water** — two-pointer (best) · brute force
- **Binary Search** — iterative (best) · recursive · linear scan

Each shows a Time / Space / Verdict table and "When to pick which" commentary so you can see not just _an_ answer but the _trade-offs_ between answers.

Total templates: 96 → 98. Total solutions: 33 → 35.

## v1.0.8 (May 2026)

### Stripe Integration Guide

A new Back End guide: **Stripe Integration** — full backend-engineer playbook for handling payments. Covers the API key model (publishable / secret / restricted / webhook signing), the client-server split that keeps you out of PCI scope, the three integration paths (Elements, Checkout, Payment Element), the PaymentIntent state machine, webhook handling (signature verification, idempotency, replay protection), idempotency keys and how to scope them to business operations, Customers and saved payment methods (`off_session`), Subscriptions lifecycle and dunning, **Coupons and Promotion Codes including the coupon race-condition deep dive** (defense in depth: Stripe's atomic `max_redemptions` cap, application-side reservations with TTL + UNIQUE constraint, and idempotency keys at the redemption call), Refunds and Disputes, Strong Customer Authentication / 3D Secure, Stripe Connect for marketplaces, PCI scope (SAQ A, A-EP, D), testing with the Stripe CLI. Closes with **16 interview questions** (Beginner / Intermediate / Advanced) and **6 tricky scenario questions** including the coupon race condition, double-click idempotency, why first-failed-invoice shouldn't revoke access, DB / Stripe state divergence, transactional webhook handlers via the outbox pattern, and dispute response strategy.

## v1.0.7

### DSA Guide — Three New Topic Sections

The DSA guide (2297 → 2722 lines, +18%) was audited for canonical interview topics that were absent. Three full sections were added between current §10 (Dynamic Programming) and §11 (Common Patterns Summary), then 11 / 12 renumbered to 14 / 15 with TOC updated:

- **§11 Heaps & Priority Queues** — when to reach for a heap (Top-K, streaming median, merge K sorted lists, scheduling, A\*); full MinHeap implementation with bubble-up/bubble-down; canonical problems: Top-K Frequent Elements, K-th Largest in Stream; 7-row comparison table covering Top K Frequent / K Closest Points / Median Stream / Merge K Sorted / Task Scheduler / Sliding Window Maximum.
- **§12 Tries (Prefix Trees)** — why a trie beats a hash set for prefix queries; TrieNode/Trie class implementation with `insert`, `search`, `startsWith`; autocomplete-via-DFS function; 6-row comparison table (Word Search II, Replace Words, Auto-Complete System, Longest Word in Dictionary, Maximum XOR with binary trie); space trade-off note (dense word lists vs random IDs).
- **§13 Backtracking** — the general template (state + choices + isSolution + isValid pruning); five fully worked problems: Permutations (used-set), Combinations (start-index with prune), Subsets (power set), N-Queens (cols + diag1 + diag2 attack-set tracking), Word Search (DFS with in-place `#` visited mark + restore); 9-row table of canonical problems including Combination Sum, Sudoku Solver, Generate Parentheses, Restore IP Addresses, Palindrome Partitioning; closing performance note that pruning is what makes backtracking practical.

### Playground — JS Polyfills Expansion (15 → 24)

The JS Polyfills category nearly doubled in size. Added the most-asked polyfill exercises that interviewers reach for after the basic map/filter/reduce trio:

- **Array.sort** — implements QuickSort and demonstrates the classic _string-compare default_ gotcha (`[1, 10, 2].sort()` → `[1, 10, 2]`), then walks through ascending/descending/by-key comparators. Includes a stability note for ES2019+ behavior.
- **Array.indexOf / lastIndexOf** — strict equality (`===`), so `[NaN].indexOf(NaN)` → `-1`. Negative `fromIndex`, lastIndexOf reverse search.
- **Array.reverse** — two-pointer in-place swap. Mutation note + ES2023 `toReversed` alternative.
- **Array.slice** — shallow copy with negative-index handling. The shallow-vs-deep clarification (nested object refs are shared).
- **Array.splice** — the three-jobs-in-one method: remove items, insert items, return removed items. All three modes demonstrated.
- **Array.concat** — one-level array flattening (not recursive). Mixed array / non-array args.
- **String.padStart / padEnd** — pad with fill string, truncated to fit. Common time-formatting use case.
- **JSON.stringify** — recursive serialization with the quirks that catch people: `undefined`/function/symbol values dropped from objects, replaced with `null` in arrays; `NaN` and `Infinity` become `null`; `toJSON` hook (Date) honored. Includes equivalence test against native.
- **Object.keys / values / entries** — enumerable-own-string-keyed contract (no prototype, no symbols by default).

Total templates now **96 across 7 categories** (JS Fundamentals 6, JS Interview Topics 7, React Basics 3, React Advanced 3, JS Polyfills **24**, Coding Challenges 33, React Machine Coding 20).

### Playground — 15 More Templates (72 → 87)

- **JS Fundamentals (+2):** Map & Set (modern collections, when to use which), Spread & Rest (the same syntax, opposite jobs)
- **JS Polyfills (+3):** `Array.includes` (with the `NaN` SameValueZero quirk), `Object.assign`, `Array.from` (iterable + array-like + mapFn)
- **Coding Challenges (+5, all with Show Solution):** Binary Search, Roman to Integer, Reverse Linked List, Container With Most Water (two-pointer area-maximization), Climbing Stairs (Fibonacci-pattern DP intro)
- **React Machine Coding (+5):** Stopwatch (start/pause/resume/reset with millisecond display), Calculator (4-function), Auto-suggest / Typeahead (filter + arrow-key nav + click-outside-to-close), Toast / Snackbar (queue with auto-dismiss + 4 severity levels), Carousel / Slider (auto-play + keyboard nav + dots indicator)

### Playground — "Show Solution" Toggle

The playground now has a **Show Solution** button (lightbulb icon) in the toolbar for every Coding Challenges template. Click it to swap the function-stub code for the canonical working solution; click again ("Hide Solution") to restore the original challenge.

- **Confirms before clobbering work** — if you've typed code that differs from the challenge stub, a confirm dialog prevents accidental loss.
- **Active state styling** — when viewing the solution, the button glows amber so you don't forget you're looking at the answer.
- **Solutions match each challenge** — all 28 Coding Challenges have a hand-written canonical solution: Two Sum (hash map), FizzBuzz (modulo 15 first), Bubble / Quick / Merge Sort (early-exit / middle-pivot / divide-and-conquer), Find Duplicates (single-pass two sets), Throttle (timestamp-based), EventEmitter (Map of Set listeners), LRU Cache (Map insertion-order trick), Deep Clone (recursive with WeakMap cycle guard), and so on. Each solution includes the same test cases as the challenge so you can see ✅ across the board.
- **No solution for non-challenge templates** — React Machine Coding and JS Polyfills don't show the button (those aren't single-answer "did I solve it" templates). The button only renders when a matching solution exists.

Solutions live in a separate `src/components/playgroundSolutions.ts` keyed by template name, so they don't bloat the main templates definition.

### Playground — 22 New Templates (49 → 72)

Audited the playground for the most-asked JavaScript and React coding interview templates. Added 22 new templates across two categories:

**Coding Challenges — 17 new (was 10, now 27):**

- **Array mutation classics:** Find Duplicates, Remove Duplicates (without Set), Find Missing Number, Move Zeros, Rotate Array
- **Sort without built-in:** Bubble Sort, Quick Sort, Merge Sort — covers the "sort without using `Array.prototype.sort`" interview ask in three classic styles
- **String puzzles:** Anagram Check, Longest Substring Without Repeating, First Non-Repeating Character
- **Functional patterns:** Sum Curry (`sum(1)(2)(3)()`), Memoize, Deep Clone (without `structuredClone` or JSON tricks), Throttle (companion to existing Debounce), Compose & Pipe
- **Data-structure builds:** EventEmitter (`on`/`off`/`emit`/`once`), LRU Cache (with `Map` insertion-order trick)

Each template follows the established pattern: clear challenge description, constraints, function stub with `// YOUR CODE HERE`, and 4–5 test cases that print ✅/❌ for instant feedback in the playground.

**React Machine Coding — 5 new (was 10, now 15):**

- **Star Rating** — 5-star input with hover preview
- **Tabs** — compound-component pattern (`<Tabs>` / `<Tabs.List>` / `<Tabs.Tab>` / `<Tabs.Panel>` sharing state via Context — the canonical Radix UI / Headless UI shape)
- **Accordion** — single-open and multi-open modes via `allowMultiple` prop
- **OTP Input** — 6-digit input with auto-advance, backspace-to-previous, paste distribution
- **Tic-Tac-Toe** — winner detection across rows/columns/diagonals, draw detection, reset

Total playground templates now **72 across 7 categories** (JS Fundamentals, JS Interview Topics, React Basics, React Advanced, JS Polyfills, Coding Challenges, React Machine Coding).

### Cross-Guide Audit — 2026 Modern-Feature Gaps Closed

A systematic audit ran across every substantive guide (JavaScript, TypeScript, Node.js, Express, MongoDB, API Design, Database Schema, AWS IAM/EC2/S3/Lambda/CloudWatch/Frontend Deployment, Git, DSA, System Design) checking for canonical 2026-relevant topics. Most guides were already strong; three real gaps were patched:

- **JavaScript §7.1 — Modern Array Helpers** — added `at()` (ES2022) for relative indexing including negative offsets, `findLast` / `findLastIndex` (ES2023) for searching from the end, and the ES2023 **immutable array methods** (`toSorted`, `toReversed`, `toSpliced`, `with`) which return new arrays instead of mutating. The immutable variants directly solve the most common accidental-mutation bug in React/Redux code.
- **Node.js §13.4 "Modern Node Built-Ins (No npm Install Required)"** (NEW subsection) — covers what the platform now ships natively that used to require dependencies: native `fetch` (Node 18+, replaces `node-fetch` / `axios` for most cases), the native test runner (`node:test` + `node:assert/strict`, replaces Jest/Mocha for backend code), `node --watch` (replaces nodemon), `node --env-file=.env` (replaces dotenv), and `--inspect-brk` with Chrome DevTools. Establishes the modern framing: start with what the platform gives you; add npm only when there's a specific reason.
- **TypeScript §10.6 — The `satisfies` Operator (TS 4.9+)** (NEW subsection) — promoted from a single interview-Q reference to a full reference subsection. Walks through the three options (annotation widens; `as` skips validation; `satisfies` does both) with concrete code showing why it matters — e.g., `palette.red.toUpperCase()` failing under annotation but working under `satisfies`. Includes the canonical use case: const config objects with shape constraints.

The audit also confirmed that Express (Fastify/Koa/NestJS comparison + Express 5 async errors), MongoDB, AWS IAM (Identity Center / SCP / permissions boundaries), Database Schema, API Design (19 sections), System Design, Git, and DSA were already comprehensive — no additions needed.

### React Guide — 2026 Priority-Map Gaps Closed

The React guide was audited against the "React.js Priority Map for Jobs in 2026" topic list to find what was missing. Five additions:

- **§7.4 "When NOT to Use useEffect"** — the senior-level signal that interviewers grade for. Five concrete patterns of misuse (derive instead of effect, real query libraries instead of effect-fetch, event handlers instead of "effect-as-listener", `key`-based reset instead of effect-reset, and the actual jobs `useEffect` is for: subscribing to external systems, browser APIs, third-party libraries, server sync). Frames `useEffect` as the _escape hatch_ from React's pure-render model rather than the default.
- **§11.3 "Server State vs Client State — The Most Important Distinction"** — explicit comparison table contrasting source-of-truth, lifetime, sync model, concerns, examples, and the right tool for each side. Closes with the modern-stack guidance: TanStack Query + Zustand for greenfield React projects in 2026; Redux only for genuinely complex client state or legacy codebases.
- **§16.3 useFormStatus** — added alongside existing `useActionState` (renamed from "Actions" with deeper explanation) and `useOptimistic`, framing them as the **form-state triad** (form-level state machine + descendant access + instant UI). Renumbered React 19 subsections to 16.1–16.5.
- **§13.2 useMemo / useCallback identity** — added the `useCallback(fn, deps) === useMemo(() => fn, deps)` equivalence interviewers love to test, plus a "when NOT to memoize" senior-signal block (cheap renders, unstable deps, no memoized consumer, React Compiler enabled). The point: profile first, don't sprinkle memoization preemptively.
- **§6.3 Custom Hooks expansion** — added `useFetch` (with `AbortController` cleanup, the canonical "build one live" interview ask) and `useToggle` alongside the existing `useDebounce` and `useLocalStorage`. The four together cover the most-asked custom-hook patterns, with a note that the cancellation pattern is the senior-level signal.
