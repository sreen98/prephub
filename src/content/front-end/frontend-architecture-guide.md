# Frontend Architecture at Scale — Complete Guide

The interview round that asks "how would you design a frontend for five products, forty engineers and one login" is a different exam from the one that asks you to reverse a string. This guide covers that round: **Platform UI / Frontend Architect** questions about repository strategy, shared code, micro-frontends, caching layers, real-time load, and debugging problems you cannot reproduce.

The recurring theme is that almost every question here is really an **organisational** question wearing a technical costume. Monorepo versus multi-repo is about how teams coordinate. Micro-frontends are about deployment independence, not about JavaScript. The strongest answers name the organisational force first and then pick the technology that serves it.

---

## Table of Contents

- [1. What "Platform UI" Actually Means](#1-what-platform-ui-actually-means)
- [2. Multi-Product Architecture](#2-multi-product-architecture)
- [3. Monorepo vs Multi-Repo](#3-monorepo-vs-multi-repo)
- [4. Micro-Frontends](#4-micro-frontends)
- [5. Design Systems and Versioning](#5-design-systems-and-versioning)
- [6. The Caching Layers](#6-the-caching-layers)
- [7. Real-Time UI Under Load](#7-real-time-ui-under-load)
- [8. Observability — Debugging the 1%](#8-observability-debugging-the-1)
- [9. Deployment, Versioning and Rollout](#9-deployment-versioning-and-rollout)
- [10. Interview Questions & Answers](#10-interview-questions-answers)
- [11. Tricky Questions](#11-tricky-questions)
- [12. Cheat Sheet](#12-cheat-sheet)
- [13. References](#13-references)

---

## 1. What "Platform UI" Actually Means

A Platform UI (or Frontend Platform, or Web Foundations) team does not ship product features. It ships **the things product teams build on**: the component library, the build and deploy pipeline, the auth integration, the shared API client, the observability wiring, the lint and type configuration, and the conventions that stop five teams inventing five different ways to do the same thing.

That changes what "good" means. A product engineer optimises for shipping a feature. A platform engineer optimises for **the cost of the hundredth feature** built by someone they have never met. Concretely, they are graded on:

| Concern | The question behind it |
|---|---|
| **Consistency** | Do all five products look, feel and behave like one company's software? |
| **Leverage** | Does fixing something once fix it everywhere? |
| **Autonomy** | Can a product team ship on Friday without asking the platform team for anything? |
| **Safety** | When something breaks, how small is the blast radius and how fast is the rollback? |
| **Migration cost** | When React majors, or the design system v2 lands, how does that roll out? |

The last row is the one candidates underweight, and interviewers care about most. Any architecture can be *built*; the question is whether it can be *changed*. A design that requires a coordinated big-bang upgrade across forty repositories is a design that will never be upgraded.

---

## 2. Multi-Product Architecture

> *"How would you design a frontend architecture that supports multiple products with shared UI components, reusable business logic, and centralized authentication?"*

Split the problem into four layers, because they have genuinely different versioning, ownership and failure characteristics.

```
┌──────────────────────────────────────────────────────────────┐
│  Products     admin-console   billing-app   customer-portal  │
│               (own routes, own deploy, own team)             │
├──────────────────────────────────────────────────────────────┤
│  Features     @acme/feature-invoices  @acme/feature-users    │
│               (domain logic + UI, owned by product teams)    │
├──────────────────────────────────────────────────────────────┤
│  Shared       @acme/ui        @acme/api-client   @acme/auth   │
│               @acme/tokens    @acme/hooks        @acme/i18n   │
├──────────────────────────────────────────────────────────────┤
│  Foundation   @acme/eslint-config  @acme/tsconfig  @acme/vite │
└──────────────────────────────────────────────────────────────┘
```

**Rule: dependencies point downward only.** A shared package must never import from a product, and `@acme/ui` must never import from `@acme/feature-invoices`. Enforce it mechanically — ESLint `no-restricted-imports`, Nx module boundary rules, or dependency-cruiser in CI — because it will not hold by convention alone. The first upward import is the moment the architecture starts degrading into a distributed monolith.

### 2.1 The Three Kinds of Shared Code

These are not interchangeable, and conflating them is the most common design mistake.

**Shared UI (`@acme/ui`)** — presentational, generic, no business knowledge. A `Button` knows about variants and disabled states; it does not know what an invoice is. The test: could you open-source this package without leaking your domain? If not, it belongs a layer up.

**Shared business logic (`@acme/api-client`, `@acme/hooks`)** — domain-aware but UI-agnostic. Request/response types generated from your OpenAPI or GraphQL schema, retry and auth-header wiring, query keys, permission helpers, currency and date formatting for your domain's rules. This is the highest-leverage shared code and the most under-invested: five teams each writing their own `useCurrentUser` with slightly different caching is a real and common failure.

**Shared *feature* code** — a whole slice of domain UI (an invoice table, a user picker) used by more than one product. Genuinely useful, but the trap here is premature extraction: two products using something *similarly* is not the same as using it *identically*, and a shared feature package with eleven boolean props to satisfy both consumers is worse than two copies. **Extract on the third use, not the second.**

### 2.2 Centralised Authentication

One identity provider, one session, one library. The details are in the OAuth & SSO guide; the architecture-level decisions are:

- **A single `@acme/auth` package** wrapping the IdP SDK, exposing `useSession()`, `useHasPermission(perm)`, a `<RequireAuth>` boundary and a token-attaching fetch wrapper. Product teams never touch the IdP SDK directly, so an IdP migration is one package's problem.
- **Cookie-based sessions on a shared parent domain** (`.acme.com`) so `admin.acme.com` and `billing.acme.com` share a session without a token-passing dance. `HttpOnly`, `Secure`, `SameSite=Lax`.
- **Silent SSO for cross-product navigation** — the user who lands on billing from admin should not see a login screen. Authorization Code + PKCE with an existing IdP session redirects back without a prompt.
- **Permissions resolved server-side and shipped as claims**, with the client using them only to *hide* UI. The client is a convenience layer; every API independently authorises. A hidden button is a UX decision, not a security control.
- **One logout that actually logs out** — federated logout across products plus refresh-token revocation. Getting this wrong is a common audit finding.

---

## 3. Monorepo vs Multi-Repo

> *"How would you decide between Monorepo and Multi-repo architecture for a large-scale frontend organization?"*

The single most common architecture question in platform interviews, and the answer that fails is a list of pros and cons. What interviewers want is a **decision framework** plus a real position.

### 3.1 What Each One Actually Optimises

| | **Monorepo** | **Multi-repo** |
|---|---|---|
| Atomic cross-project change | **Yes** — one PR, one CI run, always consistent | No — coordinated PRs, version bumps, a migration window |
| Discoverability & refactoring | **Excellent** — global search, IDE rename across everything | Poor — you cannot see who consumes your API |
| Dependency versions | Single version policy → one React, no duplicates | Per-repo freedom → drift, duplicate deps in bundles |
| Team autonomy | Requires tooling to protect it (CODEOWNERS, affected-only CI) | **Native** — separate repo, separate pipeline |
| CI cost / speed | Needs affected-graph + remote caching or it becomes unusable | Naturally scoped, simple pipelines |
| Access control | Coarse — path-based, harder to restrict | **Fine-grained** — per-repo permissions |
| Onboarding | Clone one thing, everything works | Clone six things, wire them together, guess versions |
| Tooling burden | **High upfront** — Nx/Turborepo, remote cache, boundary rules | Low upfront, high ongoing coordination cost |

### 3.2 The Decision Framework

Ask these in order. The first one that gives a clear answer usually decides it.

1. **How often does a change need to span projects?** Design-system tweak plus consumer updates, a shared type change, a coordinated API migration. If that's weekly, a monorepo pays for itself immediately; the multi-repo tax is a version bump plus N PRs plus a window where things are inconsistent. If it's twice a year, that tax is affordable.
2. **Do the projects share code, or just a company?** Genuinely shared UI, types and API clients pull hard toward a monorepo. A React app, a marketing Astro site and an unrelated internal tool sharing nothing gain almost nothing from co-location.
3. **Is release cadence coupled or independent?** Products that must ship together want one repo. Products with genuinely independent, sometimes-months-apart release trains are happier apart.
4. **What is the compliance and access story?** If a subset of code needs restricted access — payments, healthcare data, a customer-specific fork — per-repo permissions are far simpler than trying to partition a monorepo.
5. **Can you afford the tooling?** A monorepo without an affected-graph and remote caching becomes a 40-minute CI run on every one-line change, and then people start skipping CI. If nobody will own Nx/Turborepo, don't choose a monorepo.

### 3.3 The Position That Holds Up

**Default to a monorepo for one organisation's related frontend products** — one React version, one design system, atomic refactors, one onboarding step. That's where most large frontend orgs have converged, and it is the answer that matches how the tooling has evolved.

**Split out a repo when there is a concrete reason**: a genuinely different release train, a compliance boundary, an open-source package with external contributors, or a technology that fights your toolchain.

Then immediately name the thing that makes the monorepo answer credible — **the tooling is not optional:**

```
pnpm workspaces        → one node_modules, strict deps, no phantom dependencies
Turborepo or Nx        → task graph, affected-only builds, remote caching
CODEOWNERS             → ownership without repo boundaries
Module boundary lint   → enforce the dependency direction from §2
Changesets             → versioning and changelogs for published packages
Single version policy  → one React, one TypeScript, resolved centrally
```

The nuance worth adding: **"monorepo" and "monolith" are unrelated.** A monorepo can contain twelve independently-deployed applications; what's shared is the repository and the tooling, not the deployment artifact. Candidates who conflate them are the ones who reject monorepos for the wrong reason.

And the failure mode to name: a monorepo without enforced module boundaries becomes a **distributed monolith with extra steps** — everything imports everything, nothing can be extracted, and CI takes forever because the affected graph is "all of it."

---

## 4. Micro-Frontends

### 4.1 What Problem They Actually Solve

Micro-frontends let **independently-owned teams deploy parts of one page independently**. That is the entire value proposition, and it is organisational.

The tooling matured around 2024–25, and the industry's collective conclusion was that micro-frontends are **not a default architecture** — they solve a specific organisational problem, and adopting them without that problem imports all the cost and none of the benefit.

The honest test: **can your teams already deploy independently?** If your products are separate apps on separate routes with separate pipelines, you have deployment independence and you do not need micro-frontends. Micro-frontends are for when **multiple teams must compose into a single page or a single shell** and cannot coordinate releases.

### 4.2 Integration Approaches

| Approach | How | Trade-off |
|---|---|---|
| **Build-time (packages)** | Consume each other as npm packages | Simplest, best DX, **no deployment independence** — shell must rebuild |
| **Route-level / multi-zone** | Reverse proxy or framework routing maps paths to separate apps | Simple, robust, full independence — but a full page load between zones |
| **Runtime — Module Federation** | Host loads remote modules at run time, shares `react` etc. | **True runtime independence**, shared deps — the mainstream choice; version-skew risk |
| **iframes** | Isolated documents | Bulletproof isolation, painful UX (routing, sizing, focus, a11y, auth) — but right for third-party or legacy embeds |
| **Web Components** | Custom elements as the boundary | Framework-agnostic; awkward props/events, styling and SSR |
| **Server-side composition / SSI / ESI** | Edge or server stitches HTML fragments | Great performance, works without JS; needs infrastructure support |

**Module Federation** is the mainstream runtime answer. Module Federation 2.0 is the pick for greenfield (better DX, type safety); **single-spa** remains better for brownfield integration with legacy code. **Native Federation** is the standards-and-portability variant built on import maps and esbuild, notable in the Angular ecosystem. And the bundler picture moved: **Rspack** (Rust, webpack-drop-in, ~10× faster builds) became production-viable in 2026, and **Vite 8's single Rolldown graph** supports Module Federation — which removed the last strong reason micro-frontend teams stayed on webpack.

### 4.3 What Actually Goes Wrong

- **Shared dependency skew.** Two remotes on different React majors either duplicate React (bundle bloat, two reconcilers, broken context across the boundary) or crash. You need a **single version policy for the shared runtime**, enforced in CI, which quietly removes much of the independence you adopted them for.
- **Design-system version skew.** Remote A on tokens v2 and remote B on v1 means one page with two visual languages. Ship tokens as **CSS custom properties from the shell**, not as a bundled JS dependency, so theming is shared even when component versions differ.
- **Bundle duplication.** Every remote brings its own copy of date libraries, icons, form libraries. Auditing this across independently-deployed remotes is genuinely hard.
- **Cross-remote state.** Shared state across a federation boundary is the hardest part. The workable pattern is a **thin, versioned event bus or the URL** as the contract — never a shared mutable store, and never React context across remotes.
- **Error isolation.** One remote failing to load must not white-screen the shell. Every mount point needs an error boundary plus a loading and a failed state. This is the thing most demos skip.
- **Debugging and observability.** A stack trace spanning three independently-built bundles with three source-map sets. You need distributed tracing and per-remote version reporting from day one.
- **Nobody owns the whole page.** Performance, accessibility and consistency are cross-cutting and fall between teams. Someone must own the shell's budget and audit it.

### 4.4 The Verdict To Give

**For 5–15 engineers on one product: don't.** Build a well-modularised app in a monorepo, use CODEOWNERS for ownership, deploy from one pipeline. You get most of the organisational benefit and none of the runtime cost.

**Adopt micro-frontends when** you have many teams (realistically 40+ engineers across 5+ teams) that must compose into one shell, genuinely cannot align release trains, or you're incrementally strangling a legacy app — that last one is the strongest, least-disputed use case, because the boundary is temporary and the payoff is immediate.

The sharpest diagnostic to offer: **if your teams cannot agree on integration contracts — the React major, shared design tokens, who owns error boundaries, rollback procedure — then micro-frontends will not save you.** You are not ready for distributed frontends; you are ready for a monorepo and stricter CI. Coordination problems do not get better when you add a network boundary; they get harder to see.


---

## 5. Design Systems and Versioning

A component library is easy to build and hard to *evolve*. The architecture questions are all about the second part.

### 5.1 The Three Layers

```
Tokens      →  Primitives      →  Patterns
--color-*      Button, Input       DataTable, PageHeader
--space-*      Stack, Text         FormField, EmptyState
```

**Tokens** ship as **CSS custom properties**, not as a JavaScript object. This is the single highest-leverage decision in a design system, and the reasoning is worth stating: CSS variables cascade, so theming, dark mode and per-product branding become a matter of overriding a value on a container — no re-render, no context, no prop drilling, no JS bundle cost. And critically, tokens delivered as CSS can be **shared across independently-deployed remotes** that are on different component-library versions.

**Primitives** are generic and domain-free. **Patterns** compose primitives into recurring layouts.

### 5.2 Versioning Strategy

For a monorepo where everything ships together, **the internal package can live at `workspace:*`** — no versions, no publishing, atomic changes. This is a real advantage of monorepos that candidates forget to mention.

Once the library has external or independently-deployed consumers, you need real semver, and the rules are:

- **Changesets** for versioning and changelogs — each PR declares its own impact, so releases are derived rather than negotiated.
- **Deprecate, don't break.** Add the new API, mark the old one deprecated with a console warning in dev and a codemod, remove it a major later. A breaking change with no migration path does not roll out; it forks.
- **Ship codemods with breaking changes.** A `jscodeshift`/`ts-morph` script that does 90% of the migration is the difference between "adopted in two weeks" and "three products stuck on v1 forever."
- **Visual regression testing is the actual safety net.** Unit tests do not catch a 2px padding change across 300 usages. Storybook plus Chromatic (or Playwright screenshots) is what lets you refactor confidently.
- **One canonical version per page.** Two versions of the design system on one page means two visual languages; enforce a single version in the resolution config.

### 5.3 The API-Design Rules That Prevent Rewrites

- **Composition over configuration.** A `<Modal>` with `title`, `subtitle`, `icon`, `showClose`, `footerAlign`, `size`, `variant` props will grow forever. Compound components (`<Modal.Header>`, `<Modal.Body>`, `<Modal.Footer>`) let consumers compose what you didn't anticipate.
- **Support controlled *and* uncontrolled.** Accept `value`/`onChange` and fall back to internal state. Consumers need both.
- **Forward refs and spread the rest.** A component that swallows `aria-*`, `data-*` and `ref` cannot be used in the situations you didn't plan for, and forces a fork.
- **Accessible by default, not by option.** Keyboard navigation, focus management and ARIA belong inside the component. If a11y is a prop, it will be forgotten — and a design system is the single best place to make accessibility the path of least resistance across every product at once (see the Accessibility guide).
- **`className`/`style` escape hatch on the root.** Purity loses to reality; without an escape hatch consumers copy-paste the component.

---

## 6. The Caching Layers

> *"How would you design a frontend caching strategy across browser cache, CDN cache, service workers, and API cache?"*

The framing that scores: these are **five** layers with different lifetimes, different invalidation mechanisms and different owners. Name each layer, say what belongs in it, and — most importantly — say **how it is invalidated**, because an uninvalidatable cache is a bug with a delay.

```
┌─ 1. In-memory / data layer ──── TanStack Query, RTK Query, Apollo
│     lifetime: tab session    invalidate: mutation → invalidateQueries
├─ 2. Service Worker cache ────── Cache API, offline shell, background sync
│     lifetime: until you evict  invalidate: SW version + activate cleanup
├─ 3. HTTP browser cache ─────── Cache-Control, ETag, immutable assets
│     lifetime: max-age          invalidate: content-hashed filenames
├─ 4. CDN / edge cache ────────── s-maxage, stale-while-revalidate, tags
│     lifetime: s-maxage         invalidate: purge by tag / surrogate key
└─ 5. Server / API cache ──────── Redis, framework data cache, DB query cache
      lifetime: TTL              invalidate: explicit key/tag invalidation
```

### 6.1 The Rules Per Layer

**Static assets — hashed and immutable.** Content-hashed filenames plus `Cache-Control: public, max-age=31536000, immutable`. Invalidation is free because a changed file has a new name. The corollary: `index.html` must be `no-cache` (or short + `must-revalidate`), because it is the document that points at the hashed assets. Getting this backwards — cached HTML referencing purged assets — is the classic "users stuck on the old version, or worse, a white screen after deploy" incident.

**API responses — `ETag` plus conditional requests.** Return an `ETag`; the browser sends `If-None-Match`; you answer `304` with no body. Cheap, correct, and it works for personalised data where a shared cache cannot.

**CDN — `s-maxage` and `stale-while-revalidate`.** `Cache-Control: public, s-maxage=60, stale-while-revalidate=600` lets the edge serve slightly-stale content instantly while it refreshes behind the scenes. This is the highest-leverage single header for perceived performance on read-heavy pages. Prefer **tag-based purging** (surrogate keys) over path purging, so "invalidate everything touching product 42" is one call.

**Service Worker — precache the shell, runtime-cache the rest.** Cache-first for hashed static assets, network-first (or stale-while-revalidate) for API data, and an offline fallback document. Two hard rules: **never cache-first an unhashed URL**, and **clean up old caches in `activate`** or you leak storage until the origin is evicted.

**Data layer — this is where most "caching" actually happens in a modern SPA.** TanStack Query or RTK Query with sensible `staleTime`, plus explicit invalidation on mutation. The mental model that keeps this sane is the server-state/client-state split: server state belongs to a query cache with a TTL, client state belongs in component state or a store, and conflating them is the root of most stale-UI bugs.

### 6.2 The Two Questions That Separate Answers

**"What breaks first?"** Almost always **a cached `index.html`**, or a service worker serving an old shell that references purged chunks. Practical mitigations: `no-cache` on the document, a `vite-plugin-pwa`-style `autoUpdate` registration with a "new version available" prompt, and — importantly — **retain old hashed chunks for a deploy or two** so a client mid-session doesn't 404 on a lazy chunk it only now needs. That last one causes real, hard-to-reproduce "ChunkLoadError" reports.

**"How do you invalidate personalised data at the edge?"** You mostly don't. Personalised responses need `Cache-Control: private`, and the edge caches only the shared shell. This is exactly what Partial Pre-rendering exists for: static shell at the edge, personalised holes streamed per request (see the Next.js & RSC guide). Candidates who propose caching a per-user response at the CDN are describing a data leak.

---

## 7. Real-Time UI Under Load

> *"How would you design a real-time UI receiving thousands of events per second?"*

The key insight, and the thing to say first: **the transport is not the bottleneck — React is.** A WebSocket delivering 5,000 messages a second is fine. Calling `setState` 5,000 times a second is not; you will produce more renders than frames and the tab will lock up.

So the architecture is a **decoupling of ingest rate from render rate.**

```
socket → normalise → buffer (ref, not state) → flush on rAF/interval → render windowed slice
```

### 7.1 The Techniques, In Order Of Impact

**1. Buffer in a ref, flush on a timer.** Accumulate incoming events in a `useRef` (which does not trigger renders), then flush into state once per animation frame or on a 100–250 ms interval. You have decoupled 5,000 events/sec from ~10–60 renders/sec, and this alone usually solves the problem.

```tsx
const buffer = useRef<Event[]>([]);
const [visible, setVisible] = useState<Event[]>([]);

useEffect(() => {
  socket.onmessage = (e) => { buffer.current.push(JSON.parse(e.data)); };
  const id = setInterval(() => {
    if (!buffer.current.length) return;          // don't render for nothing
    setVisible(prev => merge(prev, buffer.current).slice(-MAX_ROWS));
    buffer.current = [];
  }, 100);
  return () => { clearInterval(id); socket.onmessage = null; };
}, []);
```

**2. Cap what you retain.** An append-only list is an unbounded memory leak with a nice UI. Keep the last N (a ring buffer), and page or archive the rest.

**3. Virtualise the list.** Render only what's on screen — `@tanstack/react-virtual` or `react-window`. 10,000 rows of DOM is slow regardless of how you got there.

**4. Coalesce by key.** For a price ticker or presence list, event 400 for symbol X supersedes event 399. Reduce the buffer into a `Map` keyed by entity and render the map — this turns thousands of events into dozens of actual changes.

**5. Move work off the main thread.** Parsing, filtering, aggregating and sorting thousands of messages belongs in a **Web Worker**; post only the render-ready slice back. If the payload is large, a `SharedArrayBuffer` or a binary format avoids the structured-clone cost.

**6. Server-side aggregation is the real answer at extreme rates.** If the UI only displays a chart at one-second granularity, the server should not send 5,000 events/sec — it should send one aggregate per second. **Push the aggregation to where the data is**, and name this in the interview, because it is the answer that scales and most candidates skip it in favour of client-side heroics.

**7. Subscribe narrowly.** Server-side filtering and topic-based subscriptions so a client receives only what it renders. Fan-out is cheaper to reduce than to absorb.

**8. Backpressure and reconnection.** Watch `bufferedAmount` before sending; on reconnect use exponential back-off with jitter and a sequence number so you can request a replay rather than a full refetch. Also handle the tab going background — throttle or unsubscribe on `visibilitychange`, because a hidden tab rendering a ticker is pure battery cost. (Transport details are in the Real-Time Web guide.)

### 7.2 The State-Management Consequence

High-frequency data does **not** belong in a global store that many components subscribe to — every update notifies every subscriber. Use a store with **selector-level subscriptions** (Zustand, Jotai, or `useSyncExternalStore` over your own store) so a row re-renders only when *its* datum changes, and keep the hot path out of React context entirely, since context has no partial-subscription mechanism.

---

## 8. Observability — Debugging the 1%

> *"How would you debug a production issue where only 1% of users experience a React rendering problem?"*

The trap is jumping to a fix. A 1% issue you cannot reproduce is an **observability problem before it is a debugging problem**, and the answer should be a funnel from "I have nothing" to "I have a reproduction."

**1. Segment before you theorise.** 1% is a *population*, and populations have shared properties. Slice your error and RUM data by browser and version, OS, device class, locale, timezone, network type, screen size, feature-flag cohort, app version, account type, and — often the winner — data shape. Genuinely random 1% is rare; "1% of users" is usually "100% of Safari 16 on iOS with an RTL locale" or "every account with more than 500 line items."

**2. Get real errors with real stack traces.** Sentry or equivalent, with **source maps uploaded on every deploy** and served as `hidden-source-map` so traces are readable to you and not to the public. Wrap the tree in error boundaries that report component stacks — a React rendering bug without a component stack is a guess. Add `onRecoverableError` to catch hydration mismatches, which are a classic low-percentage, environment-dependent rendering failure.

**3. Capture the sequence, not just the crash.** Breadcrumbs (route changes, clicks, network calls, console) and **session replay** for the affected cohort. For a rendering bug, replay is often decisive because it shows the interaction order you'd never have guessed.

**4. Correlate frontend to backend.** Propagate a trace ID from the browser through your API calls so a frontend error links to the exact server responses that produced it. Frequently the "rendering bug" is a malformed or unexpectedly-null API response, and this correlation is what proves it.

**5. Measure, don't intuit.** Real-user monitoring on INP, LCP and CLS **segmented by cohort**. A p50 that looks fine hides a p99 that is broken; 1% issues live in the tail by definition.

**6. Form a hypothesis and test it cheaply.** Once you have a suspected cohort, reproduce deliberately: that browser version via BrowserStack, that locale, that account's data shape in a seeded environment. React-specific suspects worth checking early — StrictMode double-invoke surfacing an impure render, a race between two effects, `key` collisions producing wrong state reuse, hydration mismatch from `Date`/`Math.random`/`localStorage` read during render, and a stale closure in an effect.

**7. Ship the fix behind a flag** and watch the cohort's error rate. A feature flag turns a risky fix into a measured experiment, and gives you instant rollback without a deploy.

**The habit to state explicitly:** every one of these has to be in place *before* the incident. "I would add monitoring" is a worse answer than "our error reporting already segments by cohort and uploads source maps, so I'd start by slicing the affected population." Interviewers are checking whether you have lived through this.

---

## 9. Deployment, Versioning and Rollout

- **Independent deploys per product**, with the shared packages versioned (or `workspace:*` in a monorepo, shipped atomically).
- **Affected-only CI.** Nx/Turborepo compute the dependency graph so a change to `@acme/ui` tests and builds only its consumers. Remote caching makes a repeat build near-instant. Without these, monorepo CI collapses under its own weight.
- **Immutable, atomic deploys.** Upload hashed assets first, flip the document last — never the other way round, or a user gets HTML referencing assets that do not exist yet. **Keep the previous deploy's chunks alive** for a release or two so mid-session clients can still lazy-load.
- **Feature flags decouple deploy from release**, which is what makes trunk-based development safe: merge continuously, ship dark, enable per cohort. They are also your rollback mechanism for behaviour, where a redeploy is your rollback for code.
- **Canary by cohort**, watching error rate and INP for the canary group specifically, not the aggregate.
- **Version reporting from the client.** Every error and metric carries the build SHA, so "is this fixed?" is answerable. In a federated setup, report the version of every loaded remote.

---

## 10. Interview Questions & Answers

These are the questions a Platform UI / frontend architecture round actually asks. Each answer is written the way you'd *say* it, not the way a reference manual would state it.

---

**Q1: How would you design a frontend architecture that supports multiple products with shared UI components, reusable business logic, and centralized authentication?**

Four layers, with dependencies pointing strictly downward: **products** (own routes, own deploy, own team) → **features** (domain slices) → **shared** (`@acme/ui`, `@acme/api-client`, `@acme/auth`, `@acme/tokens`) → **foundation** (eslint, tsconfig, build presets).

The important part is that the three kinds of shared code are **not interchangeable**:

- **`@acme/ui`** is presentational and domain-free. A `Button` knows about variants; it does not know what an invoice is. Test: could you open-source it without leaking your domain?
- **`@acme/api-client` / `@acme/hooks`** is domain-aware but UI-agnostic — types generated from your OpenAPI/GraphQL schema, auth and retry wiring, query keys, permission helpers. This is the **highest-leverage and most under-invested** layer; five teams each writing a slightly different `useCurrentUser` is a real and common failure.
- **Shared feature packages** are genuinely useful but invite premature extraction. Two products using something *similarly* is not using it *identically*. **Extract on the third use, not the second** — a shared component with eleven boolean props to satisfy two consumers is worse than two copies.

For **auth**, one `@acme/auth` package wraps the IdP SDK and exposes `useSession()`, `useHasPermission()`, `<RequireAuth>` and a token-attaching fetch wrapper, so product teams never touch the IdP directly and an IdP migration is one package's problem. Session as an `HttpOnly; Secure; SameSite=Lax` cookie on the shared parent domain (`.acme.com`) so products share a session; silent SSO (Authorization Code + PKCE against an existing IdP session) so cross-product navigation never shows a login screen; permissions resolved server-side and shipped as claims, with the client using them only to **hide** UI while every API independently authorises.

Two things to say unprompted, because they're what distinguishes a platform answer. **Enforce the dependency direction mechanically** — ESLint `no-restricted-imports`, Nx boundary rules or dependency-cruiser in CI — because the first upward import is where the architecture starts rotting into a distributed monolith. And **design for migration**: any architecture can be built, but one that requires a coordinated big-bang upgrade across forty repos is one that will never be upgraded.

---

**Q2: How would you decide between Monorepo and Multi-repo architecture for a large-scale frontend organization?**

I'd ask five questions in order, and the first one with a clear answer usually decides it:

1. **How often does a change need to span projects?** Weekly (design-system change plus consumers, shared type change) → monorepo pays for itself immediately. Twice a year → the multi-repo tax of version-bump-plus-N-PRs is affordable.
2. **Do the projects share code, or just a company?** Shared UI, types and API clients pull hard toward a monorepo. A React app, a marketing site and an unrelated internal tool gain almost nothing from co-location.
3. **Is release cadence coupled or independent?**
4. **Is there a compliance or access boundary?** Per-repo permissions are far simpler than partitioning a monorepo.
5. **Can you afford the tooling?** A monorepo without an affected-graph and remote caching becomes a 40-minute CI run on a one-line change, and then people route around CI.

**My default: a monorepo for one organisation's related frontend products** — one React version, one design system, atomic refactors, one onboarding step. Split out a repo for a concrete reason: a genuinely different release train, a compliance boundary, an open-source package with external contributors, or a technology that fights the toolchain.

Then I'd immediately name the tooling, because it's what makes that answer credible: **pnpm workspaces** (strict deps, no phantom dependencies), **Turborepo or Nx** (task graph, affected-only builds, remote cache), **CODEOWNERS** (ownership without repo boundaries), **module-boundary lint** (enforce dependency direction), **Changesets** (versioning for published packages), and a **single version policy** for React and TypeScript.

Two clarifications worth volunteering. **"Monorepo" and "monolith" are unrelated** — a monorepo can hold twelve independently-deployed apps; what's shared is the repository and tooling, not the deployment artifact. And the failure mode: **a monorepo without enforced boundaries is a distributed monolith with extra steps** — everything imports everything, nothing can be extracted, and CI is slow because the affected graph is "all of it."

---

**Q3: How would you design a frontend caching strategy across browser cache, CDN cache, service workers, and API cache?**

Five layers with different lifetimes, different invalidation mechanisms and different owners. The discipline is to state, for each one, **how it is invalidated** — an uninvalidatable cache is a bug with a delay.

| Layer | Holds | Invalidated by |
|---|---|---|
| **Data layer** (TanStack/RTK Query) | server state for this tab | `invalidateQueries` on mutation |
| **Service Worker** (Cache API) | offline shell, runtime responses | SW version + cleanup in `activate` |
| **HTTP browser cache** | hashed static assets | content-hashed filenames (free) |
| **CDN / edge** | shared, non-personalised responses | tag/surrogate-key purge |
| **Server / API** (Redis) | expensive computations | explicit key/tag invalidation |

The specific rules: hashed assets get `max-age=31536000, immutable`; **`index.html` must be `no-cache`**, because it's the pointer to those assets. API responses get `ETag` + `If-None-Match` → `304`. The CDN gets `s-maxage=60, stale-while-revalidate=600`, which is the highest-leverage single header for perceived performance on read-heavy pages. The Service Worker precaches the shell cache-first and runtime-caches API data network-first — **never cache-first an unhashed URL**.

Then the two follow-ups I'd pre-empt:

**"What breaks first?"** A cached `index.html`, or a service worker serving an old shell that references purged chunks. Mitigations: `no-cache` on the document, an `autoUpdate` SW registration with a "new version available" prompt, and **retain the previous deploy's hashed chunks for a release or two** so a mid-session client doesn't hit `ChunkLoadError` on a lazy chunk it only now needs.

**"How do you cache personalised data at the edge?"** You mostly don't — personalised responses are `Cache-Control: private`, and the edge caches only the shared shell. Partial Pre-rendering exists precisely for this: static shell at the edge, personalised holes streamed per request. Proposing a CDN-cached per-user response is describing a data leak.

---

**Q4: How would you design an authentication system supporting SSO, OAuth, JWT rotation, and role-based permissions?**

**One IdP, one session, one client library.** Products integrate with `@acme/auth`, never the IdP SDK.

**Flow:** Authorization Code + **PKCE** for every browser and mobile client. Never the implicit flow (deprecated — tokens in the URL fragment end up in history and logs), never ROPC.

**Token storage** is where most designs fail. `localStorage` is XSS-readable, so a single injected script exfiltrates every session. The pattern I'd default to is the **BFF**: the browser holds an `HttpOnly; Secure; SameSite=Lax` session cookie, and the backend-for-frontend holds the actual OAuth tokens and attaches them server-side. The browser never sees an access token. If a BFF isn't possible, access token in memory only and refresh token in an `HttpOnly` cookie scoped to the refresh endpoint.

**Rotation:** short-lived access tokens (5–15 min), **refresh token rotation** — each refresh issues a new refresh token and invalidates the old one. Then the part that makes it a real answer: **reuse detection.** If an already-used refresh token is presented, that means theft, so revoke the entire token family and force re-authentication. Also handle the **concurrent-refresh race** — two tabs refreshing simultaneously must not each rotate and invalidate the other; use a single-flight lock (a shared promise, or a `BroadcastChannel`/`navigator.locks` coordination across tabs).

**SSO across products:** shared parent-domain cookie plus silent authorization so cross-product navigation never shows a login prompt. **Logout must be federated** — end the IdP session, revoke refresh tokens, and clear per-product sessions; a "logout" that only clears local state is a common audit finding.

**RBAC/permissions:** resolve server-side, ship as claims in the session, and use them on the client **only to hide UI**. Every API independently authorises on every request. A hidden button is a UX decision; the server is the security boundary. For fine-grained needs, prefer permission strings (`invoice:write`) over role names, so adding a role doesn't require a frontend deploy.

Details in the OAuth & SSO guide; the token-theft and XSS side is in the Web Security guide.

---

**Q5: How would you debug a production issue where only 1% of users experience a React rendering problem?**

It's an observability problem before it's a debugging problem, so I'd work a funnel:

**Segment first.** 1% is a *population*, and genuinely random 1% is rare. Slice errors and RUM by browser+version, OS, device class, locale, timezone, network type, feature-flag cohort, app version, account type, and **data shape**. "1% of users" is usually "100% of Safari 16 on iOS with an RTL locale" or "every account with 500+ line items."

**Get real stack traces.** Source maps uploaded on every deploy, served as `hidden-source-map`. Error boundaries that report **component stacks** — a React rendering bug without one is a guess. Add `onRecoverableError` to catch hydration mismatches, which are a textbook low-percentage environment-dependent failure.

**Capture the sequence.** Breadcrumbs and **session replay** for the affected cohort. For rendering bugs replay is often decisive, because it shows an interaction order you'd never have guessed.

**Correlate to the backend.** Propagate a trace ID from browser through API so an error links to the exact responses that produced it. Frequently the "rendering bug" is an unexpectedly-null field, and this is what proves it.

**Then hypothesise and reproduce deliberately** — that browser via BrowserStack, that locale, that account's data seeded locally. React suspects I'd check early: StrictMode double-invoke exposing an impure render, a race between two effects, `key` collisions causing wrong state reuse, hydration mismatch from reading `Date`/`Math.random`/`localStorage` during render, and a stale closure in an effect.

**Ship the fix behind a flag** and watch that cohort's error rate, so the fix is a measured experiment with instant rollback.

The framing that matters: all of this has to exist *before* the incident. "I would add monitoring" is a much weaker answer than "our error reporting already segments by cohort and uploads source maps, so I'd start by slicing the affected population."

---

**Q6: How would you design a frontend security architecture against XSS, CSRF, token theft, and supply chain attacks?**

Four different threats needing four different controls — the mistake is treating them as one "security" bucket.

**XSS** — the root fix is never injecting unsanitised HTML: no `dangerouslySetInnerHTML` with untrusted input, DOMPurify when you genuinely must render user HTML, and treat markdown and LLM output as untrusted. Then **defence in depth with a strict CSP**: `script-src 'self' 'nonce-<random>'; object-src 'none'; base-uri 'self'`, ideally strict-dynamic rather than a host allowlist. Add **Trusted Types** to make DOM-sink injection a runtime error rather than a code-review hope.

**CSRF** — `SameSite=Lax` (or `Strict`) cookies removes most of it, but not all: it doesn't protect same-site subdomains, and `Lax` still allows top-level `GET` navigation. So also require an anti-CSRF token (double-submit or synchroniser) on state-changing requests, validate `Origin`, and never make a `GET` mutate state.

**Token theft** — the honest statement is that *any* token JavaScript can read is XSS-exfiltratable, so the fix is architectural rather than obfuscatory: **BFF pattern**, `HttpOnly` cookies, tokens never in `localStorage`. Plus short-lived access tokens, refresh rotation with **reuse detection**, and a strict CSP restricting `connect-src`/`img-src` so exfiltration is blocked even if injection succeeds.

**Supply chain** — the one candidates skip, and the one that's most current. Lockfiles committed and `npm ci` in CI; **provenance/attestation** verification; `--ignore-scripts` by default so a postinstall script can't run; Dependabot/Renovate with a review gate rather than auto-merge; **Subresource Integrity** on any third-party script you must load from a CDN; and a CSP that constrains what an injected script could reach. Structurally: minimise dependency count, prefer platform APIs, and lazy-load third-party tags through a tag manager you control rather than inline `<script>` tags added by marketing.

Cross-cutting: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options`/`frame-ancestors` for clickjacking, `Referrer-Policy`, and a `Permissions-Policy` denying what you don't use. Full treatment in the Web Security guide.

---

**Q7: How would you handle authentication in Next.js App Router with Server Components?**

**Defence in depth, and never trust Proxy/middleware alone** — this is the whole answer, and it's grounded in real CVEs.

In Next.js 16 `middleware.ts` became **`proxy.ts`**. It runs before route processing and is the right place to cheaply redirect unauthenticated requests at the edge. It is explicitly **not** an authorization solution, and the CVE history proves why: **CVE-2025-29927** let a crafted `x-middleware-subrequest` header skip middleware entirely — taking every middleware-based authorization check with it. **CVE-2026-45109** followed an incomplete fix for a segment-prefetch bypass (patched in 15.5.18 / 16.2.6), and the July 2026 release patched **CVE-2026-64642**, a bypass affecting App Router builds on Turbopack.

So the layers:

1. **Proxy** — cheap redirect for obviously-unauthenticated requests. UX optimisation, not a security boundary.
2. **A Data Access Layer** — every function that reads or writes sensitive data calls `verifySession()` itself, right next to the data. This is the actual boundary, and it's the layer the CVEs cannot bypass because it isn't in the request pipeline.
3. **Every Server Action and Route Handler authenticates and authorises independently.** Server Actions are **public HTTP endpoints** — the fact that no UI calls one doesn't mean nobody can. This is the most commonly missed point.
4. **Never pass a session object as a prop into a Client Component** unless you intend it to be public; RSC props are serialised into the payload the browser receives.

Practically: session in an `HttpOnly; Secure; SameSite=Lax` cookie, read with `cookies()` in a `verifySession()` helper wrapped in React's `cache()` so one request doesn't re-verify ten times, and `import 'server-only'` on the data-access module so it can never be pulled into a client bundle. Then keep Next patched — this class of bypass has recurred, so pinning an old minor is itself the risk.

Full detail in the Next.js & React Server Components guide.

---

**Q8: How would you design a real-time UI receiving thousands of events per second?**

The first thing to say: **the transport isn't the bottleneck — React is.** A WebSocket at 5,000 msg/sec is fine; 5,000 `setState` calls per second produces more renders than frames and locks the tab. So the design is about **decoupling ingest rate from render rate**:

```
socket → normalise → buffer in a ref → flush on rAF/interval → render a windowed slice
```

In order of impact:

1. **Buffer in a `useRef`, flush on a 100 ms interval or rAF.** Refs don't trigger renders, so this alone converts 5,000 events/sec into ~10–60 renders/sec and usually solves it outright.
2. **Cap retention** — a ring buffer of the last N. An append-only list is an unbounded memory leak with a nice UI.
3. **Virtualise** with `@tanstack/react-virtual` — 10,000 DOM rows is slow however you got there.
4. **Coalesce by key.** For a ticker or presence list, event 400 for symbol X supersedes 399; reduce the buffer into a `Map` keyed by entity, so thousands of events become dozens of visible changes.
5. **Move parsing/filtering/aggregation into a Web Worker** and post back only the render-ready slice.
6. **Aggregate server-side** — if the chart renders at one-second granularity, the server should send one aggregate per second, not 5,000 events. **Push aggregation to where the data is.** This is the answer that actually scales, and most candidates skip it for client-side heroics.
7. **Subscribe narrowly** — server-side filtering and topic subscriptions so a client receives only what it renders.
8. **Backpressure and reconnection** — check `bufferedAmount`, reconnect with exponential back-off + jitter, use sequence numbers to request a replay rather than a full refetch, and throttle or unsubscribe on `visibilitychange` so a background tab isn't burning battery.

One state-management consequence worth volunteering: high-frequency data must **not** live in React context or a store that broadcasts to all subscribers, because every update notifies everyone. Use selector-level subscriptions (Zustand, Jotai, or `useSyncExternalStore`) so a row re-renders only when its own datum changes.

---

**Q9: Design a scalable Accordion component in React that handles single and multiple item expansion with customizable UI behavior.**

I'd answer with the **API** first, because that's what "scalable" means for a component — the implementation is easy and the API is what you're stuck with.

**Compound components** rather than a config object, so consumers compose what I didn't anticipate:

```tsx
<Accordion type="single" collapsible defaultValue="a">
  <Accordion.Item value="a">
    <Accordion.Trigger>Billing</Accordion.Trigger>
    <Accordion.Content>…</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

**The design decisions I'd call out:**

- **`type="single" | "multiple"`** with the state shape following it — `string | null` versus `string[]`. Modelling both with one array and a flag leaks awkwardness into every consumer.
- **Controlled and uncontrolled both.** Accept `value`/`onValueChange`, fall back to internal state via `defaultValue`. Consumers need both, and supporting only one forces forks.
- **Context for coordination, not for data.** The `Accordion` provides `{ openItems, toggle, type }`; each `Item` provides its own `value` and generated IDs. This is what lets `Trigger` and `Content` be arbitrarily nested in the consumer's markup.
- **`collapsible`** — in single mode, may the open item be closed, or must exactly one always be open?
- **Accessibility is built in, not a prop.** Trigger is a real `<button>` with `aria-expanded` and `aria-controls`; content has `role="region"` and `aria-labelledby`; `useId` for the ID pairing; Home/End and arrow-key navigation between triggers. If a11y is optional it will be forgotten, and a design system is the best place in the whole codebase to make it the default.
- **Animation without breaking a11y.** Height animation needs a measured height (`ResizeObserver` or the `grid-template-rows: 0fr → 1fr` technique); content must be genuinely removed or `hidden` when closed so it's out of the tab order and the accessibility tree — `height: 0` alone leaves focusable content reachable, which is a real bug.
- **Escape hatches** — forward refs, spread `...rest`, accept `className` on every part, and support `asChild`-style polymorphism so a `Trigger` can render as an `<h3><button>`. Heading level is the consumer's decision, not the library's.
- **Lazy content** via a `forceMount` opt-out, so heavy panels don't render until opened.

**Scale considerations:** for hundreds of items, keep state as a `Set` of open values rather than a per-item boolean, memoize the context value so opening one item doesn't re-render all triggers, and virtualise if the list is genuinely long. A working implementation with single and multi-open modes is in the Code Playground under React Machine Coding.

---

**Q10: A breaking change to the design system needs to roll out across five products owned by five teams. How?**

The answer is that **you don't do a breaking rollout** — you do an additive one, and the "breaking" part happens last and cheaply.

1. **Ship the new API alongside the old one.** Both work. No consumer is blocked, and adoption can be incremental and per-component rather than per-product.
2. **Deprecate loudly but locally** — a dev-only `console.warn`, a `@deprecated` JSDoc tag so editors strike it through, and an ESLint rule so it surfaces in review rather than in a migration meeting.
3. **Ship a codemod with the change.** A `jscodeshift`/`ts-morph` script doing 90% of the mechanical work is the difference between "adopted in two weeks" and "three products on v1 forever." Not shipping one is how you get a fork.
4. **Migrate the highest-traffic consumer yourself.** It proves the codemod, surfaces the cases you didn't think of, and gives the other teams a reference PR to copy. It also means the platform team eats its own migration cost first, which is what buys credibility.
5. **Track adoption with a number** — a dashboard of remaining old-API usages per product, from a lint rule or a simple grep in CI. "Please migrate" without a count never finishes.
6. **Visual regression tests are the safety net.** Unit tests do not catch a 2px padding change across 300 usages; Storybook + Chromatic (or Playwright screenshots) is what makes this safe.
7. **Remove the old API in the next major**, once adoption is at zero — which by then is a formality.

In a **monorepo** steps 1–7 compress dramatically: you can do the atomic codemod-and-consumers change in a single PR with one CI run, which is the clearest concrete argument for monorepos in a design-system-heavy org. In **multi-repo** the same sequence is right, but each step is a separate PR per repo, which is precisely the coordination tax from Q2.

---

**Q11: Design a highly performant web app that renders large data tables with real-time updates.**

Two problems stacked, and they fight each other: a table is a lot of DOM, and real-time means it keeps changing. Solve them separately.

**The rendering side — the DOM is the cost.** 10,000 rows × 12 columns is 120,000 cells, and no amount of memoization makes that cheap because style recalculation and layout scale with node count. So **virtualize**: render only the ~30 visible rows plus a small overscan buffer, with `@tanstack/react-virtual`. For a wide table, virtualize **both axes**. Fixed row heights are dramatically simpler than measured ones — if rows must vary, use `estimateSize` plus a `ResizeObserver` and accept the scrollbar jitter.

Then the things that undo virtualization if you get them wrong: **stable keys from the row's ID**, never the index, or scrolling reuses the wrong row's state. `React.memo` on the row with **primitive props** — pass `row.name` and `row.status`, not a freshly-created object each render. And `content-visibility: auto` on rows if you're not virtualizing, as the cheap 80% version.

**The real-time side — the transport isn't the bottleneck, React is.** This is the §7 argument: 5,000 messages/sec is fine for a WebSocket and fatal for `setState`. So decouple ingest rate from render rate:

```
socket → normalise → buffer in a ref → flush on rAF/100ms → render the visible slice
```

**Coalesce by key** — for a table, update 400 for row X supersedes update 399, so reduce the buffer into a `Map` keyed by row ID and apply one change per row per frame. That turns thousands of events into a handful of actual cell updates.

**Then the part specific to tables**, which is where candidates stop short:

- **Sorting and filtering must not happen on the client for large sets.** Server-side sort, filter and pagination with a cursor; the client sends intent and renders what comes back. Client-side sorting 100,000 rows blocks the main thread for hundreds of milliseconds every time a header is clicked.
- **A row updating while the user is scrolled or has a cell in edit mode.** If a live update reorders rows under the cursor, the user loses their place. The usual answer is to **buffer updates for rows currently in view** and show a "3 rows updated — refresh" affordance, rather than reordering underneath them. This is a product decision you should raise, not a technical one you can decide alone.
- **Cell-level updates, not row-level.** If one field changes, only that cell should re-render. Selector-level subscriptions (Zustand/Jotai/`useSyncExternalStore`) let a cell subscribe to its own datum — Context can't, because it has no partial subscription.
- **Aggregate on the server.** If the header shows a total across 100,000 rows, computing it client-side on every tick is the actual bottleneck.

**Accessibility, which almost nobody mentions:** a virtualized table must use `aria-rowcount` and `aria-rowindex` so a screen-reader user is told the real total rather than "row 3 of 30". Sortable headers need `aria-sort`, and announcing "table updated" needs a throttled live region — announcing every tick makes the page unusable.

**And the honest framing to close on:** for anything beyond a moderate grid I'd evaluate **TanStack Table** (headless — you keep control of rendering, it handles sorting/filtering/grouping state) or AG Grid for the enterprise feature set. Writing a performant, accessible, virtualized, sortable, editable data grid from scratch is a genuine multi-month project, and choosing to buy that is the senior call.

---

**Q12: Design a system for client-side caching, API retries and error boundaries.**

Three layers with three different jobs, and the interesting part is what each one must *not* do.

**Caching — use a query library, and know why.** TanStack Query (or RTK Query) gives you the request deduplication, `staleTime`/`gcTime`, background refetch, refetch-on-focus and cache invalidation that you'd otherwise hand-write badly:

```js
useQuery({
  queryKey: ['invoices', orgId, filters],   // the key IS the cache identity
  queryFn: fetchInvoices,
  staleTime: 60_000,        // don't refetch for a minute
  gcTime: 5 * 60_000,       // keep it in cache 5 min after nothing uses it
});
```

The framing that matters: **server state and client state are different problems.** Putting fetched data in Redux means you now own caching, invalidation, dedupe and retry — that's the mistake this whole layer exists to avoid. And the cache key must include **every input that changes the result**, `orgId` included, or one tenant sees another's cached data.

Above it sit the HTTP and CDN layers (§6) and below it your own in-memory memoization. Five layers, each with an invalidation story.

**Retries — the details are the answer.** Retry only what's **retryable**: a `5xx`, a timeout, a network error. Never a `400`, `401`, `404` or `422` — a validation error will fail identically forever, and retrying a `401` can lock an account. Then **exponential back-off with jitter**, because without jitter a thousand clients that failed together retry together and you've built a thundering herd that keeps the service down. Honour `Retry-After` when the server sends it — your back-off is a guess, that header is not.

```js
retry: (failureCount, error) => error.status >= 500 && failureCount < 3,
retryDelay: (attempt) => Math.random() * Math.min(30_000, 1000 * 2 ** attempt),
```

**And mutations are not queries.** A failed `GET` is safe to retry; a failed `POST` may have succeeded server-side before the response was lost. Retrying it double-charges someone. So mutations need an **idempotency key** before they're safe to retry at all — otherwise don't retry them, surface the failure and let the user decide.

**Error boundaries — and their limits.** A boundary catches errors thrown during **render, in lifecycle methods and in constructors** of the tree below it. It does **not** catch errors in event handlers, in `setTimeout`, in async code, or during SSR. So boundaries are one layer, and the global `error` / `unhandledrejection` handlers are the other; you need both.

Placement is the real skill: **one boundary per independent region**, not one at the root. A root-only boundary turns any component error into a white screen. A boundary around each dashboard widget means a failing chart shows "couldn't load this chart" while the rest of the page works. Pair with `useQueryErrorResetBoundary` so the boundary's `reset()` also clears the failed query, or retry re-renders the same error.

**How the three compose** is the answer to the question as asked:

```
query library      → dedupe, cache, background refresh, retry policy
   ↓ throws on exhausted retries
error boundary     → per-region fallback UI with a reset action
   ↓ reports
global handlers    → error + unhandledrejection → your error tracker
```

Plus the states that make it feel deliberate rather than defensive: **stale-while-revalidate** so a refetch shows cached data instead of a spinner, **optimistic updates with a rollback path** for mutations, and an **offline** state — `navigator.onLine` plus a failed request means "you're offline, we'll retry", not "something went wrong".

---

**Q13: How do you manage global state efficiently in a React app that multiple teams contribute to?**

The multi-team part changes the answer, so start there: with one team, any consistent choice works. With several, **the failure mode is that global state becomes a shared mutable namespace nobody owns** — team A adds a slice, team B reads it, and now A can't change it without breaking B, except nobody knows B depends on it.

**So the first move is to minimise what's global at all.** Most state people put in a global store isn't global:

| Kind of state | Where it belongs |
|---|---|
| Server data (lists, entities, details) | **a query cache** — TanStack Query. Not the store |
| URL-shaped state (filters, tab, page, sort) | **the URL** — shareable, back-button-correct, free persistence |
| Form state | the form library, local to the form |
| Component UI state (open/closed, hover) | `useState`, local |
| **Genuinely global** | session/user, permissions, theme, feature flags, toasts |

That last row is short, and that's the point. **The biggest efficiency win isn't a faster store — it's having far less in it.** Server state in a query cache also removes the caching and invalidation code teams would otherwise each write differently.

**Then, for what is genuinely global:** a store with **selector-level subscriptions** — Zustand, Jotai, or `useSyncExternalStore` over your own. Context is the wrong tool here because it has no partial subscription: every consumer re-renders when the value changes, regardless of which field it reads. Redux Toolkit is fine and still the right call if the org already knows it, with `createSelector` for memoized derivations.

**And the multi-team structure, which is what's actually being asked:**

- **Slice ownership with a CODEOWNERS entry.** Every slice has one owning team. Cross-team reads go through an **exported selector**, not a raw path into the state shape — so the owner can restructure internals without breaking consumers. That's the same encapsulation argument as a public API.
- **Feature-sliced structure**, so a team's state lives with its feature rather than in a central `store/` folder every team edits. A central folder is a permanent merge-conflict surface and an ownership vacuum.
- **Nothing writes to another team's slice.** Writes go through actions the owner exposes. Otherwise you can't reason about who changed what.
- **Type the store and generate the API types from a schema**, so a shape change is a compile error in every consumer rather than a runtime surprise.
- **Enforce boundaries mechanically** — ESLint `no-restricted-imports` or Nx module boundaries, so `feature-a` can't reach into `feature-b/store/internals`. Conventions don't survive contact with a deadline.
- **DevTools and a documented shape.** With several teams, "what's in the store and who owns it" has to be answerable without reading the code.

**The trade-off to name:** all of that is process overhead that a two-person team should skip. The reason it pays at scale is that global state is the most common place a large frontend accumulates coupling nobody intended — and the cheapest fix is having less of it, not governing more of it.

---

## 11. Tricky Questions

---

**Q1: What will this print, and why?**

```js
function createCounter() {
  let obj = {
    value: 0
  };
  return {
    increment() {
      obj.value++;
    },
    getValue() {
      return obj.value;
    }
  };
}

const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.getValue());
```

**Output:** `2`

**Explanation:**

The answer is unsurprising; what the question is really testing is whether you can explain the mechanism precisely, because the same setup with one detail changed does *not* behave this way.

`createCounter` runs once and creates one binding, `obj`, in its local scope. It returns an object whose two methods were both **defined inside that scope**, so both close over the *same* `obj` binding — not a copy of it, and not one copy each. `increment` mutates `obj.value`; `getValue` reads `obj.value`; they are talking about the same object. Two increments give `2`.

Three things worth naming to show you understand *why* rather than just *what*:

**The closure captures the variable, not the value.** This is the point people get wrong. `getValue` doesn't hold a snapshot of `obj.value` from when the function was created — it holds a live reference to the `obj` binding, and reads it on each call. That's why the reads see the mutations.

**Each `createCounter()` call gets a fresh scope.** So two counters are genuinely independent:

```js
const a = createCounter(); const b = createCounter();
a.increment(); a.increment();
console.log(a.getValue(), b.getValue());   // 2 0
```

This is the closure-as-privacy pattern (the module pattern): `obj` is unreachable from outside — `counter.obj` is `undefined` — so the only way to change the value is through the methods. That encapsulation is the actual reason to write it this way.

**The `let obj` versus `let value` distinction is a red herring here, but not always.** Because the state lives in an object property rather than in the variable itself, the methods mutate through the reference. Had it been `let value = 0` with `value++`, the behaviour would be **identical** — closures capture bindings, so reassignment is visible too. Where it *would* differ is if `increment` reassigned `obj = { value: obj.value + 1 }`; that still works here, but it would break if you had destructured or exported `obj` elsewhere, because the outside reference would still point at the old object.

The variant interviewers use as a follow-up is the one that breaks:

```js
function broken() {
  let obj = { value: 0 };
  return { increment: () => obj.value++, getValue: () => obj.value, obj };
  //                                                              ^^^ leaked
}
const c = broken();
c.obj.value = 100;      // encapsulation gone — external code can now mutate state
c.increment();
console.log(c.getValue());   // 101
```

**Takeaway:** closures capture the *binding*, not a snapshot of the value, so all methods defined in the same scope share one live piece of state — which is what makes this the canonical private-state pattern, and what breaks the moment you leak the internal reference.

---

**Q2: Two Module Federation remotes both declare `react` as shared and both load successfully. But a React context provided by the shell is `undefined` inside one remote. Why?**

**Answer:** Two copies of React are running. `shared` only deduplicates when the version ranges are *satisfiable by one instance* — otherwise each remote silently loads its own, and each React instance has its own separate context registry.

**Explanation:**

React context is not a global lookup by name. `createContext()` returns an object, and a `Provider`/`useContext` pair only connect if they are working with **the same context object inside the same React instance** — because the current value is stored on React's internal fiber tree, and each React copy has its own tree and its own dispatcher.

So when the shell renders `<ThemeContext.Provider>` using React instance A, and a remote calls `useContext(ThemeContext)` under React instance B, instance B walks *its* tree, finds no matching provider, and returns the context's **default value** — which is usually `undefined`. There's no error, because from React's point of view nothing is wrong: you asked for a context that was never provided in this tree.

Why it happens despite `shared: ['react']`:

```js
// Shell               remote-a                  remote-b
// react ^18.2.0       react ^18.2.0             react ^19.0.0   ← incompatible
// → shell + remote-a share one instance; remote-b loads its own copy
```

Module Federation's sharing is **version-negotiated at runtime**, not enforced. If the ranges don't overlap, it does the safe thing — gives the remote the version it asked for — and you get two Reacts. The other common causes are forgetting `singleton: true` (so even compatible versions can end up with separate instances), and a remote bundling React because it wasn't listed as shared in *its* config, only in the shell's.

```js
shared: {
  react:       { singleton: true, requiredVersion: '^19.0.0', strictVersion: true },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0', strictVersion: true },
}
```

`singleton: true` says "there must be exactly one"; `strictVersion: true` turns a mismatch into a **loud error at load time** instead of a silent duplicate — which is what you want, because a build-time failure is infinitely cheaper than debugging an `undefined` context in production.

The same duplication produces a family of symptoms that all look unrelated until you know the cause: "Invalid hook call" errors, `useState` throwing about being called outside a component, two independent Suspense boundaries that don't coordinate, `instanceof` checks failing across the boundary, and roughly double the React bytes in the bundle.

The architectural lesson is the uncomfortable one: **a single version policy for the shared runtime is mandatory in a federated setup** — which quietly removes a chunk of the deployment independence you adopted micro-frontends to get. Teams can deploy independently, but they cannot independently choose a React major. That constraint is worth stating out loud in a design discussion, because it's the hidden cost.

**Takeaway:** `shared` is a runtime version negotiation, not a guarantee — set `singleton: true` and `strictVersion: true` so an incompatible range fails loudly, because two React instances break context, hooks and Suspense while looking like a data bug.

---

**Q3: After every deploy, a small number of users get `ChunkLoadError` — but only users who were already on the site, and only when they navigate to a lazily-loaded route. What's happening?**

**Answer:** Their already-loaded `index.html` references the *old* build's chunk names, and the deploy deleted those files. Nothing is wrong with the code; the deploy strategy is wrong.

**Explanation:**

A user who loaded the app before the deploy has the old document and the old module graph in memory. That graph contains the old hashed filenames — `Settings-a1b2c3.js`. When they click through to `/settings` an hour later, the browser requests exactly that file. If the deploy replaced the asset directory, that filename no longer exists, the request 404s, and `React.lazy`'s dynamic `import()` rejects with `ChunkLoadError`.

It only affects *already-loaded* sessions, which is why it looks like a rare, unreproducible bug: anyone who loads the page after the deploy gets the new document with the new hashes and is fine. It's a real 100% failure for a small, invisible population.

Three fixes, and you want all three:

**1. Keep old chunks alive.** Deploys should be **additive** — upload new hashed assets, and retain the previous one or two builds' files rather than syncing-with-delete. Storage is cheap; this eliminates the failure at the root. (`aws s3 sync --delete` is the specific footgun.)

**2. Flip the document last, and don't cache it.** Upload assets *first*, then the new `index.html`. If you flip the document first, new visitors get HTML pointing at assets that aren't uploaded yet — the same failure with a wider blast radius. And `index.html` must be `no-cache`, or a cached document keeps pointing at whatever it pointed at when it was cached.

**3. Handle it gracefully anyway**, because you cannot retain chunks forever:

```js
const Settings = lazy(() =>
  import('./Settings').catch((err) => {
    // A failed chunk load after a deploy is not recoverable in-page —
    // the running app's module graph is stale. Reload once.
    if (!sessionStorage.getItem('chunk-reload')) {
      sessionStorage.setItem('chunk-reload', '1');
      window.location.reload();
    }
    throw err;
  })
);
```

The `sessionStorage` guard matters: without it, a genuinely missing chunk (a bad deploy, an offline user) produces an infinite reload loop, which is a much worse bug than the one you were fixing.

The better version of #3 is proactive: poll a `version.json` or a build-SHA header, and when it changes, show a non-blocking "A new version is available — reload" prompt. That converts a hard error into a user-controlled refresh, and it's what a `vite-plugin-pwa` `autoUpdate` registration gives you for the service-worker case.

A related variant with the same root cause: a **service worker** serving a cached old shell that references purged chunks. Same fix — version the SW, clean up old caches in `activate`, and prompt rather than silently swap.

**Takeaway:** hashed filenames make caching safe but make deletion dangerous — retain previous builds' chunks, upload assets before the document, keep `index.html` uncached, and add a guarded one-shot reload for the residual case.

---

**Q4: Your monorepo's CI takes 35 minutes on every PR, including a one-line change to a single product's README. Nx/Turborepo are configured and the affected graph is working. What's wrong?**

**Answer:** Almost certainly a root-level file is an input to every task, so the affected graph correctly concludes that everything is affected. The graph isn't broken — it's telling you the truth about a dependency you didn't mean to create.

**Explanation:**

Affected-graph tooling computes "what changed → what depends on it." That works beautifully until something at the root is an implicit dependency of every project. Then every change touches every project, the tool dutifully rebuilds all of it, and it looks like the caching is broken when in fact it's being obeyed.

The usual culprits, roughly in order of how often they're the answer:

- **The lockfile.** Any dependency change invalidates every project — which is *correct*, but it means "did we add a dependency?" is a much more expensive question than people realise.
- **Root `tsconfig.json` / `eslint.config.mjs` / `.env` files** listed in `globalDependencies` (Turborepo) or `implicitDependencies`/`namedInputs` (Nx). A formatting tweak to the root ESLint config rebuilds the world.
- **Overly broad `inputs`.** If a task's inputs default to the whole project directory, then `README.md`, docs and test snapshots all invalidate the build cache. Builds should declare inputs precisely and exclude what can't affect output.
- **A barrel file at the root of a shared package.** If `@acme/ui/index.ts` re-exports everything, then *any* change inside `@acme/ui` changes the module every consumer imports, so every consumer is affected. This is the subtle one: the dependency graph is at file granularity only if your imports are.
- **Everything depending on a `@acme/types` or `@acme/utils` grab-bag package.** A single kitchen-sink package that all projects import makes the graph a star, and the centre invalidates everything.

The fixes:

```jsonc
// turbo.json — declare inputs precisely
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "package.json", "tsconfig.json", "!**/*.test.*", "!**/*.md"],
      "outputs": ["dist/**"]
    }
  },
  "globalDependencies": ["pnpm-lock.yaml"]   // keep this list as short as honestly possible
}
```

Plus: **remote caching** so a rebuild that another CI run or a colleague already did is a download rather than a build; **split kitchen-sink packages** so consumers depend on what they use; **avoid root barrel files** in shared packages, or use subpath exports; and **check that caching is actually hitting** — `turbo build --dry-run` and Nx's project graph visualiser will show you exactly which projects are considered affected and why, which converts this from guesswork into a five-minute investigation.

The meta-point worth making: **this is the failure mode that makes teams abandon monorepos**, and it's a configuration problem rather than a fundamental one. But it's also why "can you afford the tooling?" belongs in the monorepo decision framework — the tooling isn't optional, and it needs an owner.

**Takeaway:** when affected-only CI rebuilds everything, look for a root-level input (lockfile, root config, over-broad `inputs`) or a barrel/grab-bag package that every project depends on — the graph is usually correct about a dependency you didn't intend.

---

**Q5: You buffer WebSocket events in a ref, flush every 100 ms, and virtualise the list. The tab still janks badly at 3,000 events/sec. What did you miss?**

**Answer:** The flush is cheap but the *work per flush* isn't — you're still processing 300 events per flush on the main thread, and probably re-creating a large array and re-rendering every row because the data identity changes.

**Explanation:**

Buffering fixes the *render count*. It does nothing about three other costs, and any one of them will still jank the frame:

**1. Per-flush processing on the main thread.** Parsing 300 JSON payloads, filtering, sorting and aggregating them happens in the flush callback, which runs on the main thread and blocks paint. At 10 flushes/sec you have ~16 ms of budget per frame and you're spending it on data work. **Fix: move parse/filter/sort/aggregate into a Web Worker** and post back only the render-ready slice. `JSON.parse` alone on a large batch is frequently the single biggest cost.

**2. The whole list re-renders even though it's virtualised.** Virtualisation limits how many rows are *mounted*, but if every flush produces a brand-new array of brand-new objects, every visible row gets new props and re-renders — 30 rows × 10 flushes/sec, each doing real work. **Fix: coalesce by key into a stable `Map`** so unchanged entities keep referential identity, memoize rows with `React.memo`, and pass primitives rather than freshly-created objects. Then only the rows whose datum actually changed re-render.

**3. Layout thrash and unbounded growth.** If rows have variable height, each flush triggers measurement, which forces synchronous layout — the classic read-write-read pattern that serialises on the main thread. And if you're appending rather than capping, the array and the DOM both grow until GC pauses become visible. **Fix:** fixed or estimated row heights where possible, `content-visibility: auto`, and a ring buffer capping retention.

The order to attack it in, since this is really a diagnosis question:

```
1. Profile first — React DevTools Profiler + Performance panel.
   Is the time in scripting (your data work), in React commit (re-renders),
   or in layout/paint? These have completely different fixes and you cannot
   guess which one it is.
2. Worker for the data work            → removes scripting from the main thread
3. Coalesce by key + memo rows         → removes needless commits
4. Cap retention, stabilise row height → removes layout and GC pressure
5. Aggregate server-side               → removes the problem
```

Step 5 is the one to end on. If the UI displays a chart at one-second granularity or a table of the top 50 entities, then sending 3,000 events/sec to the browser is the actual bug — the server should send one aggregate per second, or a coalesced diff. **Every client-side technique above is mitigation for a fan-out decision made upstream**, and saying so is what distinguishes an architect's answer from an optimiser's.

**Takeaway:** buffering fixes render *frequency*, not the cost per flush — profile to separate scripting from commit from layout, move data work to a Worker, coalesce by key so referential identity is stable, and remember that server-side aggregation removes the problem rather than mitigating it.

---

## 12. Cheat Sheet

```
ORGANISATIONAL FIRST
 1. Almost every architecture question here is an org question in technical clothing.
    Name the org force, then pick the technology that serves it.
 2. Platform teams optimise for the cost of the 100th feature by a stranger.
 3. Any architecture can be built. Ask whether it can be CHANGED — a design needing
    a coordinated big-bang upgrade across 40 repos will never be upgraded.

LAYERING
 4. products → features → shared → foundation. Dependencies point DOWN only.
 5. Enforce direction mechanically (no-restricted-imports / Nx boundaries /
    dependency-cruiser). The first upward import starts the rot.
 6. Three kinds of shared code, not interchangeable: UI (domain-free),
    business logic (domain-aware, UI-free), features (both — extract on the 3rd use).

MONOREPO vs MULTI-REPO
 7. Decide with: cross-project change frequency → shared code? → release cadence
    → compliance boundary? → can you afford the tooling?
 8. Default: monorepo for one org's related frontend products. Split for a
    concrete reason (release train, compliance, OSS, hostile toolchain).
 9. "Monorepo" ≠ "monolith". A monorepo holds N independently-deployed apps.
10. Mandatory tooling: pnpm workspaces + Turborepo/Nx + remote cache + CODEOWNERS
    + boundary lint + Changesets + single version policy.
11. A monorepo without enforced boundaries = distributed monolith with extra steps.

MICRO-FRONTENDS
12. They buy ONE thing: independent deployment by independently-owned teams.
13. Already deploy independently (separate apps, separate routes)? You don't need them.
14. 5-15 engineers on one product → don't. Modular monorepo + CODEOWNERS instead.
15. Best-justified use case: incrementally strangling a legacy app.
16. Can't agree on integration contracts (React major, tokens, error boundaries,
    rollback)? You're ready for a monorepo and stricter CI, not distributed frontends.
17. Module Federation: singleton:true + strictVersion:true, or you get two Reacts
    and silently broken context/hooks/Suspense.
18. Ship design tokens as CSS custom properties, so remotes on different component
    versions still share one visual language.
19. Every mount point needs an error boundary + loading + failed state.
20. Cross-remote state: a versioned event bus or the URL. Never a shared store,
    never React context across a remote boundary.

DESIGN SYSTEMS
21. tokens (CSS vars) → primitives (domain-free) → patterns (composed).
22. Composition over configuration. Compound components, not 11 boolean props.
23. Controlled AND uncontrolled. Forward refs. Spread ...rest. className escape hatch.
24. Accessible by default, never by prop — the design system is the cheapest place
    to fix a11y for every product at once.
25. Breaking changes: add new → deprecate old → SHIP A CODEMOD → migrate the biggest
    consumer yourself → track remaining usages with a number → remove next major.
26. Visual regression testing is the actual safety net. Unit tests miss 2px.

CACHING (5 layers, each needs an invalidation story)
27. data layer → service worker → HTTP browser → CDN/edge → server/API.
28. Hashed assets: max-age=31536000, immutable. index.html: no-cache. Never reversed.
29. API: ETag + If-None-Match → 304. CDN: s-maxage + stale-while-revalidate.
30. Prefer tag/surrogate-key purging over path purging.
31. Never cache-first an unhashed URL in a service worker. Clean old caches in activate.
32. Personalised data is Cache-Control: private. Edge-caching a per-user response
    is a data leak. Static shell + streamed personalised holes (PPR) instead.
33. RETAIN the previous deploy's chunks for a release or two → no ChunkLoadError.
    Upload assets BEFORE flipping the document.

REAL-TIME AT SCALE
34. The transport isn't the bottleneck — React is. Decouple ingest rate from render rate.
35. Buffer in a ref → flush on rAF/100ms → cap retention → virtualise → coalesce by key.
36. Move parse/filter/sort/aggregate to a Web Worker; post back the render-ready slice.
37. Selector-level subscriptions (Zustand/Jotai/useSyncExternalStore). Never context
    for hot data — context has no partial subscription.
38. Server-side aggregation REMOVES the problem. Everything else mitigates it.
39. Throttle or unsubscribe on visibilitychange.

OBSERVABILITY
40. A 1% bug is an observability problem before a debugging problem.
41. Segment first: browser+version, OS, device, locale, network, flag cohort,
    app version, DATA SHAPE. Random 1% is rare.
42. Source maps on every deploy (hidden-source-map). Error boundaries reporting
    component stacks. onRecoverableError for hydration mismatches.
43. Session replay + breadcrumbs for the cohort. Trace ID from browser through API.
44. RUM on INP/LCP/CLS segmented by cohort — 1% issues live in the tail.
45. Ship the fix behind a flag and watch that cohort. All of this must exist BEFORE
    the incident; "I'd add monitoring" is the weak answer.

DEPLOY
46. Affected-only CI + remote caching, or monorepo CI collapses.
47. Immutable atomic deploys. Feature flags decouple deploy from release and are
    your behavioural rollback.
48. Canary by cohort, watching that cohort's errors and INP — not the aggregate.
49. Every error and metric carries the build SHA (and every remote's version).
```

---

## 13. References

- [Monorepo Tools](https://monorepo.tools) — comparison of Nx, Turborepo, Bazel, Lerna and friends
- [Turborepo Docs](https://turborepo.com/docs) — task graph, inputs/outputs, remote caching
- [Nx Docs — Module Boundaries](https://nx.dev/features/enforce-module-boundaries) — enforcing the dependency direction
- [Changesets](https://github.com/changesets/changesets) — versioning and changelogs for workspace packages
- [micro-frontends.org](https://micro-frontends.org) — Michael Geers' original catalogue of integration approaches
- [Martin Fowler — Micro Frontends](https://martinfowler.com/articles/micro-frontends.html) — the canonical write-up, including the costs
- [Module Federation Docs](https://module-federation.io) — shared dependency negotiation, `singleton`, `strictVersion`
- [single-spa](https://single-spa.js.org) — the brownfield-friendly router/orchestrator
- [MDN — HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching) — the authoritative reference on `Cache-Control` semantics
- [web.dev — Love your cache](https://web.dev/articles/love-your-cache) — practical caching strategy for the whole stack
- [Workbox](https://developer.chrome.com/docs/workbox) — service worker caching strategies without hand-rolling them
- [TanStack Virtual](https://tanstack.com/virtual) — list virtualisation for large and streaming data sets
- [web.dev — INP](https://web.dev/articles/inp) — the responsiveness metric that high-frequency UIs fail
