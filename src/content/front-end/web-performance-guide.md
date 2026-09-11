# Web Performance & Core Web Vitals — Complete Guide

Performance questions used to be "how do you make a site faster?" — a grab-bag answer about minification and CDNs was enough. They aren't any more, because the metrics became standardised, measurable in the field, and tied to revenue. The modern question is "your LCP is 4.2 seconds at p75, what do you do?" and it wants a diagnostic method, not a checklist.

The React guide covers React-specific optimisation (memoisation, virtualisation, reconciliation). This guide covers the platform: what the metrics actually measure, how the loading pipeline works, and how to find and fix the thing that's actually slow.

---

## Table of Contents

- [1. Why This Is a Product Requirement](#1-why-this-is-a-product-requirement)
- [2. The Core Web Vitals](#2-the-core-web-vitals)
- [3. Lab vs Field Data](#3-lab-vs-field-data)
- [4. The Loading Pipeline](#4-the-loading-pipeline)
- [5. Resource Hints and Priorities](#5-resource-hints-and-priorities)
- [6. Images and Media](#6-images-and-media)
- [7. Fonts](#7-fonts)
- [8. JavaScript — Payload and Execution](#8-javascript-payload-and-execution)
- [9. INP and the Main Thread](#9-inp-and-the-main-thread)
- [10. Layout Stability](#10-layout-stability)
- [11. Network and Caching](#11-network-and-caching)
- [12. Rendering Strategy](#12-rendering-strategy)
- [13. Budgets and CI](#13-budgets-and-ci)
- [14. Interview Questions & Answers](#14-interview-questions-answers)
- [15. Tricky Questions](#15-tricky-questions)
- [16. Cheat Sheet](#16-cheat-sheet)
- [17. References](#17-references)

---

## 1. Why This Is a Product Requirement

Three things made performance a first-class requirement rather than an engineering preference:

**It's measurable in the field.** Chrome ships real-user metrics to the Chrome UX Report, so your performance is a public number aggregated across actual users on actual devices — not a score from your laptop.

**It's a ranking signal.** Core Web Vitals feed into Google Search ranking. That converts a technical concern into a commercial one, which is what gets it prioritised.

**The correlation with revenue is well documented.** Slower pages produce measurably lower conversion and higher bounce across published case studies. The direction is never in dispute; only the magnitude varies by product.

The framing that matters for interviews: **performance is a distribution, not a number.** Your median user may be fine while p75 is broken, and Core Web Vitals are assessed at **p75** precisely because averages hide the users having a bad time. Any answer that starts with "I'd check the average" is starting wrong.

---

## 2. The Core Web Vitals

Three metrics, each covering a different phase of the experience:

| Metric | Measures | Good (p75) | Needs work | Poor |
|---|---|---|---|---|
| **LCP** — Largest Contentful Paint | **loading** — when the main content appeared | **≤ 2.5 s** | ≤ 4.0 s | > 4.0 s |
| **INP** — Interaction to Next Paint | **responsiveness** — how quickly the UI responds | **≤ 200 ms** | ≤ 500 ms | > 500 ms |
| **CLS** — Cumulative Layout Shift | **visual stability** — how much things jump | **≤ 0.1** | ≤ 0.25 | > 0.25 |

**INP replaced FID in March 2024**, and knowing why is a good signal. FID measured only the delay before the *first* interaction's handler began — so a page could score a perfect FID while every subsequent click took a second to produce a visible update. INP measures the **full** latency of (almost) every interaction, from input to the next paint, and reports roughly the worst one. It's a much harder and much more honest metric.

An INP is the sum of three phases, and knowing which one dominates tells you what to fix:

```
input delay        →  processing time      →  presentation delay
(main thread busy     (your event handler      (style, layout, paint
 when input arrived)   running)                 of the resulting frame)
```

- **High input delay** → the main thread was blocked by something else. Break up long tasks, defer third-party scripts.
- **High processing time** → your handler is doing too much. Move work off the critical path, or into a Worker.
- **High presentation delay** → the resulting render is expensive. Too much DOM, expensive layout, huge re-render.

### 2.1 The Diagnostic Metrics

Core Web Vitals tell you *that* something is wrong. These tell you *where*:

| Metric | Measures | Target |
|---|---|---|
| **TTFB** | Time to First Byte — server + network | ≤ 800 ms |
| **FCP** | First Contentful Paint — first pixel of content | ≤ 1.8 s |
| **TBT** | Total Blocking Time — main-thread blocking (lab proxy for INP) | ≤ 200 ms |
| **Long tasks** | any task > 50 ms on the main thread | minimise |

**LCP decomposes into four parts**, and this decomposition is the single most useful diagnostic in the whole discipline:

```
LCP = TTFB  +  resource load delay  +  resource load time  +  element render delay
      │          │                      │                     │
      server &   time before the        downloading it        time from loaded
      network    browser STARTS                               to painted
                 fetching the LCP
                 resource
```

Each part has completely different fixes:

- **TTFB dominant** → server, database, CDN, cache-hit rate. Not a frontend problem.
- **Load delay dominant** → the browser found out about the resource late. Late discovery: an image inserted by JavaScript, a CSS background image, no `preload`, low priority.
- **Load time dominant** → the resource is too big or the connection is slow. Compress, resize, use modern formats.
- **Render delay dominant** → the resource arrived but couldn't paint. Render-blocking CSS, a font blocking text, or client-side rendering waiting on hydration.

Measure the split before optimising. Teams routinely compress an image when their problem was a 1.5-second TTFB.

---

## 3. Lab vs Field Data

The distinction interviewers probe, because acting on the wrong one wastes weeks.

| | **Lab (synthetic)** | **Field (RUM)** |
|---|---|---|
| Source | Lighthouse, WebPageTest, CI | real users; CrUX, your own RUM |
| Conditions | one simulated device and network | every device, network and locale you serve |
| Interaction | none (so no real INP) | actual clicks and taps |
| Good for | **debugging**, regression gates, comparing changes | **knowing the truth**, prioritising |
| Weakness | isn't your users | can't tell you *why* |

**Field data tells you what to fix; lab data helps you fix it.** Both, in that order.

```js
// Real-user monitoring with the web-vitals library
import { onLCP, onINP, onCLS, onTTFB } from 'web-vitals';

const send = (metric) => {
  navigator.sendBeacon('/rum', JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,              // 'good' | 'needs-improvement' | 'poor'
    // The attribution build tells you WHICH element and WHICH phase
    target: metric.attribution?.element ?? metric.attribution?.largestShiftTarget,
    // Segment, or the data is much less useful
    connection: navigator.connection?.effectiveType,
    deviceMemory: navigator.deviceMemory,
    route: location.pathname,
    buildSha: __BUILD_SHA__,
  }));
};

onLCP(send); onINP(send); onCLS(send); onTTFB(send);
```

Three things make RUM actually useful rather than decorative:

1. **Use the attribution build** (`web-vitals/attribution`). Knowing "LCP is 4s" is nearly useless; knowing "LCP is 4s and the element is the hero image, with 2.8s of it in load delay" is actionable.
2. **Segment everything** — by route, device class, connection type, country, and **build SHA**. Aggregate numbers hide the cohort that's broken, and this is the same argument as debugging the 1% in the Frontend Architecture guide.
3. **Report percentiles, never averages.** Track p75 (the CWV threshold) and p95. An average is dragged down by fast desktop users and tells you nothing about who's suffering.

**`sendBeacon`** matters because it survives page unload — a `fetch` on `visibilitychange` may be cancelled as the page goes away, silently losing exactly the sessions you most want to measure.

Note that **CrUX (and therefore Search) uses Chrome users who opted into reporting**, so it excludes Safari and Firefox entirely. Your own RUM is the only way to see those.

---

## 4. The Loading Pipeline

Understanding the critical path is what lets you reason about a waterfall instead of guessing.

```
1. DNS lookup              ─┐
2. TCP + TLS handshake      ├─ connection setup (~100-300ms on a fresh origin)
3. HTTP request            ─┘
4. Server processing        → TTFB ends here
5. HTML streams in
6. Parser hits <script>     → BLOCKS parsing (unless async/defer/module)
7. Parser hits <link rel=stylesheet> → BLOCKS RENDERING (not parsing)
8. CSSOM + DOM → render tree → layout → paint  → FCP
9. Fonts, images load       → LCP
10. JS executes, hydrates   → interactive (INP now measurable)
```

**The two blocking behaviours are different and often confused:**

- **A synchronous `<script>` blocks HTML parsing.** The parser stops dead until the script is fetched and executed, because the script might `document.write`. `defer` fetches in parallel and runs after parsing, in order; `async` fetches in parallel and runs whenever it arrives, out of order; `type="module"` is deferred by default.
- **A stylesheet blocks *rendering*, not parsing.** The browser continues parsing HTML (and the preload scanner keeps discovering resources), but it won't paint until the CSSOM is complete — because painting with incomplete styles would flash unstyled content.

**The preload scanner** is a secondary parser that races ahead of the main one looking for resources to fetch early. Understanding it explains a lot of "why is this resource discovered late?":

```html
<!-- ✓ The preload scanner finds this immediately, even while a script blocks -->
<img src="/hero.webp">

<!-- ✗ INVISIBLE to the preload scanner — the URL only exists after JS runs -->
<div id="hero"></div>
<script>document.getElementById('hero').innerHTML = '<img src="/hero.webp">';</script>

<!-- ✗ Also invisible — CSS must be downloaded AND parsed first -->
<style>.hero { background-image: url('/hero.webp'); }</style>
```

That's why a CSS background image is a poor choice for your LCP element, and why a JS-inserted hero image is worse: the browser can't start fetching until much later in the pipeline. **Put your LCP element in the initial HTML as an `<img>`.**

---

## 5. Resource Hints and Priorities

```html
<!-- Establish the connection early (DNS + TCP + TLS) for a critical third party -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://analytics.example.com">   <!-- DNS only, cheaper -->

<!-- Fetch a resource you KNOW you need but the browser will discover late -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

<!-- Raise or lower a resource's priority -->
<img src="/hero.webp" fetchpriority="high" alt="">
<img src="/below-fold.webp" loading="lazy" fetchpriority="low" alt="">
<script src="/analytics.js" defer fetchpriority="low"></script>

<!-- Prefetch a resource for the NEXT navigation (low priority, idle time) -->
<link rel="prefetch" href="/next-page-data.json">
```

The rules that keep these from backfiring:

- **`preconnect` is expensive — use it for two or three origins at most.** Each one holds a connection open speculatively; a dozen of them competes with the resources you actually need. `dns-prefetch` is the cheap fallback for the rest.
- **`crossorigin` on font preloads is mandatory.** Fonts are fetched in CORS mode, so a preload without `crossorigin` creates a *separate* cache entry and the font is downloaded **twice**. This is one of the most common preload bugs, and it makes things slower while looking like an optimisation.
- **Preload only what's genuinely critical.** Preloading is a priority *reallocation*, not free bandwidth — every preload steals from something else. Preloading five things preloads nothing.
- **`fetchpriority="high"` on the LCP image** is often a bigger win than a preload, because images default to Low priority until layout determines they're in the viewport.
- **Never `loading="lazy"` your LCP image.** It's the single most common self-inflicted LCP regression: lazy loading defers the fetch until layout, adding hundreds of milliseconds to the element that defines your LCP. Lazy-load below-the-fold images only.
- **Speculation Rules API** is the modern successor to `prefetch` for navigations, and can *prerender* a whole next page:

```html
<script type="speculationrules">
{ "prerender": [{ "where": { "href_matches": "/products/*" }, "eagerness": "moderate" }] }
</script>
```

---

## 6. Images and Media

Images are usually the largest bytes on a page and very often the LCP element, so this is where the biggest wins live.

```html
<img
  src="/hero-800.webp"
  srcset="/hero-400.webp 400w, /hero-800.webp 800w, /hero-1600.webp 1600w"
  sizes="(max-width: 600px) 100vw, 800px"
  width="1600" height="900"
  alt="Product overview"
  fetchpriority="high"
>
```

Every attribute is load-bearing:

- **`srcset` + `sizes`** let the browser pick the right file for the viewport and DPR. **`sizes` is the part people get wrong** — it describes the *rendered* width, and if it's inaccurate the browser confidently picks the wrong resource. Getting `sizes` wrong is worse than omitting `srcset`.
- **`width` and `height`** (or `aspect-ratio`) reserve space, which is how you avoid CLS. The browser computes the aspect ratio from these and holds the box before the image arrives.
- **`fetchpriority="high"`** for the LCP image; **`loading="lazy"`** for everything below the fold, and **never** for the LCP image.
- **Formats:** AVIF (best compression) → WebP (universal) → JPEG/PNG fallback via `<picture>`. AVIF typically saves 30–50% over JPEG at equivalent quality, though it encodes slowly.
- **`decoding="async"`** avoids blocking the main thread on image decode, which matters for large images on low-end devices.

```html
<picture>
  <source type="image/avif" srcset="/hero.avif">
  <source type="image/webp" srcset="/hero.webp">
  <img src="/hero.jpg" width="1600" height="900" alt="">
</picture>
```

**Use an image CDN** (Cloudinary, imgix, Vercel/Next Image, Cloudflare Images) rather than committing five sizes of every asset. It handles format negotiation via `Accept`, resizing, and quality — and `next/image` or an equivalent framework component generates all of the above correctly, which is a strong argument for using one.

**Video:** never autoplay a video as your hero if LCP matters — use a poster image. `preload="metadata"` (not `auto`) unless playback is imminent, and prefer a short muted looping video encoded in modern codecs over a GIF, which can be an order of magnitude larger.

---

## 7. Fonts

Fonts are uniquely damaging because they sit on the critical path for **text**, which is often the LCP element, and they cause layout shift when they swap.

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2-variations');
  font-weight: 100 900;              /* one variable file covers every weight */
  font-display: swap;                /* show fallback text immediately, swap when ready */
  unicode-range: U+0000-00FF;        /* subset: only load what you need */
  /* Match the fallback's metrics so the swap causes NO layout shift */
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
}
```

**`font-display` is the trade-off dial**, and knowing the options is a standard question:

| Value | Behaviour |
|---|---|
| `block` | invisible text for up to ~3s, then fallback (FOIT — bad for LCP) |
| **`swap`** | fallback immediately, swap when loaded (**FOUT** — good LCP, causes CLS) |
| `fallback` | ~100ms invisible, then fallback; swaps only if it loads within ~3s |
| **`optional`** | ~100ms invisible, then fallback **permanently** for this page load — **zero CLS** |

`swap` is the usual default because invisible text is worse than a font swap. But `swap` *causes* CLS unless you fix the metrics — which is what `size-adjust`, `ascent-override` and `descent-override` are for. Match the fallback font's metrics to the web font and the swap becomes invisible. Tools like Fontaine and `next/font` generate these automatically, which is the practical answer.

The rest of the checklist:

- **`woff2` only.** Every browser you support handles it; shipping `woff` and `ttf` as well just adds bytes to your CSS.
- **Self-host.** A third-party font host means an extra DNS + TCP + TLS handshake, and browser cache partitioning means there's no longer any cross-site cache benefit — the historical argument for a font CDN is gone.
- **Variable fonts** replace 4–8 static files with one, usually smaller in total.
- **Subset aggressively** with `unicode-range`. Latin-only is a fraction of a full font.
- **Preload the one or two faces used above the fold** — with `crossorigin` (§5).
- **Consider a system font stack** for body text. Zero bytes, zero CLS, instant render.


---

## 8. JavaScript — Payload and Execution

JavaScript is uniquely expensive because you pay for it **three times**: download, parse/compile, and execute. A 200 KB image and 200 KB of JavaScript cost wildly different amounts of main-thread time — the image decodes off-thread, the JavaScript must be compiled and run.

### 8.1 Reducing the Payload

- **Code-split by route** (`React.lazy` + `Suspense`, or your framework's router). The first paint shouldn't ship the settings page.
- **Split by interaction** — a modal, a chart library, a rich-text editor, a date picker all load on demand.
- **Audit with a bundle analyzer** (`rollup-plugin-visualizer`, `webpack-bundle-analyzer`, `source-map-explorer`). Look for: a single dependency that's disproportionately large, duplicate copies of the same library at different versions, and a polyfill bundle you no longer need.
- **Replace heavy dependencies.** `moment` → `date-fns`/`Temporal`; `lodash` → individual imports or native methods; a full charting library → a small one or hand-rolled SVG.
- **Check tree shaking actually works.** It needs ES modules, `sideEffects: false` in `package.json`, and no barrel-file re-exports that defeat static analysis. A `import { x } from './index'` where `index.ts` re-exports fifty modules often pulls in all fifty.
- **Ship modern syntax.** Transpiling to ES5 for browsers nobody uses inflates bundles substantially — async/await alone becomes a large state machine. Set a realistic `browserslist`.
- **Move work to the server.** A Server Component using a 300 KB markdown parser ships none of it (see the Next.js & RSC guide). This is often the largest single win available.

### 8.2 Third-Party Scripts

Usually the biggest performance problem in a real application, and the one engineers have least control over:

- **They're often the dominant blocking cost** — tag managers, chat widgets, A/B tools, session replay, ad scripts. And they arrive without review.
- **`async`/`defer` everything** non-critical, and load on interaction where possible (a chat widget can load when the user clicks the bubble — a facade pattern).
- **Sandbox in a Worker** with **Partytown** for scripts that don't need DOM access (most analytics).
- **Measure the cost**: Lighthouse's third-party summary, or block them and re-measure. "Our vendor script costs 900ms of TBT" is a number that changes conversations.
- **Set an explicit budget** for third-party bytes and blocking time, and make marketing requests go through it.

Note that a slow third party is also a **reliability** risk — a synchronously-loaded script from a down host blocks your page entirely.

### 8.3 The Cost of Hydration

For SSR/SSG apps, the page **looks** ready long before it is: HTML paints, then the framework downloads, parses, executes and hydrates. That gap is measurable and it's exactly where INP fails.

The mitigations, in ascending order of structural change: code-split so less JS hydrates; **defer hydration** of below-the-fold components (React 19.2's `<Activity>` renders hidden subtrees at lower priority); **islands architecture** (Astro, Qwik) where only interactive components ever ship JS; and **RSC**, where non-interactive components ship no JavaScript at all.

---

## 9. INP and the Main Thread

The browser is single-threaded for JavaScript, layout, style and paint. A task longer than **50 ms** is a "long task", and while it runs nothing else can happen — including responding to a click.

### 9.1 Breaking Up Long Tasks

```js
// ✗ One 400ms task. Any interaction during it waits.
function processAll(items) { for (const item of items) expensiveWork(item); }
```

```js
// ✓ Yield to the main thread so pending input can be handled
async function processAll(items) {
  for (const item of items) {
    expensiveWork(item);
    if (navigator.scheduling?.isInputPending?.()) await scheduler.yield();
  }
}
```

`scheduler.yield()` is the modern primitive — it yields but keeps your continuation at a *higher* priority than new tasks, unlike `setTimeout(0)` which puts you at the back of the queue. `scheduler.postTask()` lets you schedule work at explicit priorities (`user-blocking`, `user-visible`, `background`).

### 9.2 Getting Work Off the Thread Entirely

**Web Workers** are the real answer for genuinely heavy computation — parsing large JSON, filtering or sorting thousands of rows, image processing, cryptography. Post back only what's needed for render. The constraint is that Workers have no DOM access, and `postMessage` uses structured cloning (so very large payloads have a real serialisation cost — use transferables or `SharedArrayBuffer` when it matters).

**`requestIdleCallback`** for genuinely deferrable work: analytics, prefetching, warming caches.

### 9.3 The Common INP Culprits

- **A `setState` cascade** on every keystroke re-rendering a large tree. Fix with `useDeferredValue`/`useTransition`, debouncing, or virtualisation.
- **Layout thrash** — reading a layout property (`offsetHeight`, `getBoundingClientRect`) after a write forces a synchronous layout. In a loop, that's a forced reflow per iteration. **Batch all reads, then all writes.**
- **Huge DOM.** Style recalculation and layout scale with node count; a 10,000-node page is slow to update regardless of your JavaScript. Virtualise long lists.
- **Expensive CSS** — a deep `:has()` across a huge tree, or animating a layout-affecting property (`width`, `top`) instead of `transform`/`opacity`.
- **Third-party scripts** occupying the thread when the user clicks.
- **`content-visibility: auto`** is the cheapest large win for long pages — it skips rendering work for off-screen subtrees entirely. Pair with `contain-intrinsic-size` to avoid scrollbar jump.

The diagnostic sequence: Chrome DevTools **Performance** panel → record an interaction → find the long task → look at whether the time is in **scripting** (your code or a third party), **rendering** (style/layout), or **painting**. These have completely different fixes, and guessing which one it is wastes the most time.

---

## 10. Layout Stability

CLS is the sum of layout-shift scores for **unexpected** shifts (a shift within 500 ms of a user interaction is excused, which is why opening an accordion doesn't count against you).

The causes, and all of them are preventable:

1. **Images and iframes without dimensions.** Always set `width`/`height` or `aspect-ratio`.
2. **A web font swapping** at different metrics. Fix with `size-adjust`/`ascent-override` (§7), or `font-display: optional`.
3. **Content injected above existing content** — a cookie banner, a promo bar, an error message. Reserve the space, or overlay it rather than pushing content down.
4. **Ads and embeds** with variable size. Reserve a minimum height.
5. **Lazily-loaded content without a skeleton** of the same dimensions.
6. **Animating layout properties.** Animate `transform` and `opacity`, which don't trigger layout.
7. **Late-arriving CSS** repositioning already-painted content.

```css
/* Reserve the box before the content arrives */
.hero { aspect-ratio: 16 / 9; }
.card-image { aspect-ratio: 1; object-fit: cover; }
.skeleton { min-height: 200px; }        /* match the real content's height */
```

Debug with the Performance panel's layout-shift regions, which show you *what* moved rather than making you guess. And note that CLS is often much worse in the field than in the lab, because slow connections stretch out the arrival of the things that cause shifts — another reason field data is the source of truth.

---

## 11. Network and Caching

The full caching model is in the Frontend Architecture guide §6. The performance-specific points:

- **Compression:** **Brotli** for text (typically 15–20% smaller than gzip); serve pre-compressed at the highest level for static assets since you pay the cost once at build. Don't compress already-compressed formats (images, video, `woff2`) — it wastes CPU for nothing.
- **HTTP/2 and HTTP/3.** H2 multiplexes many requests over one connection, which removed the old advice to bundle everything into one file — moderate splitting is now better for caching. **H3 (QUIC over UDP)** additionally removes TCP head-of-line blocking, which is a real win on lossy mobile networks.
- **Cache immutably.** Hashed filenames + `Cache-Control: public, max-age=31536000, immutable`; `index.html` as `no-cache`. Getting this backwards is the classic post-deploy incident.
- **`stale-while-revalidate`** at the CDN lets the edge serve instantly while refreshing in the background — the single highest-leverage header for perceived performance on read-heavy pages.
- **Serve from the edge.** For a global audience, geographic distance is unavoidable latency; a CDN or edge rendering removes a round trip that no amount of frontend optimisation can.
- **Early Hints (103)** let the server send resource hints before the full response is ready, which effectively parallelises server think-time with resource fetching.

---

## 12. Rendering Strategy

The strategy choice sets a ceiling on your metrics, so it's a performance decision as much as an architectural one:

| Strategy | LCP | INP | Notes |
|---|---|---|---|
| **CSR** (SPA) | poor — blank until JS runs | good once loaded | worst LCP; fine behind a login |
| **SSR** | good FCP; LCP gated by TTFB | hydration cost | TTFB depends on your slowest query |
| **SSG** | **excellent** | hydration cost | rebuild to update |
| **Streaming SSR** | **excellent** — shell paints immediately | hydration cost | slow sections fill in |
| **RSC** | excellent | **excellent** — less JS ships | needs the framework |
| **PPR** | **excellent** — static shell from the edge | excellent | the best of both (see Next.js guide) |
| **Islands** (Astro, Qwik) | excellent | **excellent** — near-zero JS | limited interactivity model |

The pattern: **the less JavaScript required before the page is usable, the better both metrics get.** That's why the whole ecosystem moved toward server rendering plus selective hydration.

---

## 13. Budgets and CI

Performance without a gate regresses, reliably — every feature adds a little, nobody adds a lot, and six months later you're 2 MB heavier.

```js
// lighthouserc.js — fail the build on a regression
module.exports = {
  ci: {
    collect: { url: ['https://staging.example.com/'], numberOfRuns: 3 },
    assert: {
      assertions: {
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'total-blocking-time':      ['error', { maxNumericValue: 200 }],
        'cumulative-layout-shift':  ['error', { maxNumericValue: 0.1 }],
        'resource-summary:script:size': ['error', { maxNumericValue: 300000 }],
      },
    },
  },
};
```

What actually works in practice:

- **Bundle-size budgets in CI**, reported as a diff on the PR ("+42 KB"). A number in a code review changes behaviour; a dashboard nobody opens does not.
- **Lighthouse CI on a stable environment**, several runs, comparing against the base branch rather than an absolute score — Lighthouse is noisy, so absolute thresholds cause flaky builds and get disabled.
- **Field-data alerting** on p75 CWV per route, with the **build SHA** attached so a regression points at a deploy.
- **Ratchet for an existing problem**: snapshot the current numbers and fail only on *increases*, so you stop the bleeding without blocking every PR on historical debt.
- **Own it explicitly.** Performance is cross-cutting, so without a named owner and a budget it belongs to nobody.

---

## 14. Interview Questions & Answers

### Beginner

---

**Q1: What are the Core Web Vitals and what do they measure?**

Three metrics covering three different phases of the experience, all assessed at **p75** of real users:

- **LCP (Largest Contentful Paint)** — **loading**. When the largest content element in the viewport painted. Good: **≤ 2.5 s**.
- **INP (Interaction to Next Paint)** — **responsiveness**. The latency from an interaction to the next visual update, across (almost) all interactions on the page. Good: **≤ 200 ms**.
- **CLS (Cumulative Layout Shift)** — **visual stability**. The sum of unexpected layout-shift scores. Good: **≤ 0.1**.

Two things worth volunteering. **INP replaced FID in March 2024**, and the reason matters: FID measured only the delay before the *first* interaction's handler started, so a page could score perfectly while every click after the first took a second. INP measures the full input-to-paint latency of essentially every interaction and reports roughly the worst — much harder and much more honest.

And **p75 is deliberate.** Core Web Vitals are a distribution, not a number, because an average is dragged down by fast desktop users and hides the cohort having a bad time. Any performance answer that starts with the average is starting wrong.

I'd also mention the diagnostic metrics that tell you *where* the problem is, since the vitals only tell you *that* there is one: **TTFB** (≤800ms), **FCP** (≤1.8s), **TBT** (the lab proxy for INP), and long tasks.

---

**Q2: What's the difference between lab and field data, and which do you trust?**

**Lab** (synthetic) data comes from a controlled run — Lighthouse, WebPageTest, CI — on one simulated device and network. **Field** data (RUM) comes from real users, via CrUX or your own instrumentation.

**Field data tells you what to fix; lab data helps you fix it.** In that order.

Lab data's weaknesses are structural: it isn't your users' devices or networks, and because there's no real interaction it **cannot measure INP at all** — TBT is only a proxy. Its strength is that it's repeatable and debuggable, which is exactly what you want in CI and in a Performance panel recording.

Field data is the truth about who's suffering, but it can't tell you *why* — which is why you use the **attribution build** of the `web-vitals` library, so you get "LCP is 4s, the element is the hero image, and 2.8s of it was load delay" rather than just a number.

Three things that make RUM actually useful: **segment** by route, device class, connection type and **build SHA** (aggregate numbers hide the broken cohort); report **percentiles, not averages**; and use **`sendBeacon`**, because a `fetch` on unload can be cancelled and you'd silently lose exactly the sessions you most want.

One gap to know: **CrUX only covers Chrome users who opted into reporting**, so Safari and Firefox are invisible to it — and to Search. Your own RUM is the only way to see them.

---

**Q3: How do you optimise images for performance?**

Images are usually the largest bytes on a page and very often the LCP element, so this is where the biggest wins are.

```html
<img src="/hero-800.webp"
     srcset="/hero-400.webp 400w, /hero-800.webp 800w, /hero-1600.webp 1600w"
     sizes="(max-width: 600px) 100vw, 800px"
     width="1600" height="900"
     fetchpriority="high" alt="Product overview">
```

- **Modern formats** — AVIF (30–50% smaller than JPEG) → WebP → JPEG fallback via `<picture>`.
- **`srcset` + `sizes`** so the browser picks the right file for the viewport and DPR. **`sizes` is what people get wrong** — it describes the *rendered* width, and an inaccurate value makes the browser confidently choose the wrong resource. Getting it wrong is worse than omitting `srcset`.
- **`width`/`height` or `aspect-ratio`** always, to reserve space and avoid CLS.
- **`fetchpriority="high"`** on the LCP image, because images default to Low priority until layout confirms they're in the viewport.
- **`loading="lazy"` below the fold — and NEVER on the LCP image.** That's the single most common self-inflicted LCP regression.
- **An image CDN** rather than committing five sizes of everything.

The subtler point I'd raise: **how the browser discovers the image matters as much as its size.** A CSS `background-image` or a JS-inserted `<img>` is invisible to the **preload scanner**, so the fetch can't start until CSS is parsed or JS has run — adding hundreds of milliseconds of *load delay* before a single byte is requested. Put the LCP element in the initial HTML as a real `<img>`.

---

### Intermediate

---

**Q4: Your LCP is 4.2s at p75. Walk me through diagnosing it.**

I'd start by **decomposing LCP into its four parts**, because each has a completely different fix and this is the single most useful diagnostic here:

```
LCP = TTFB + resource load delay + resource load time + element render delay
```

Get that split from the `web-vitals` attribution build in field data, or the Performance panel in the lab. Then:

**If TTFB dominates** (say 1.5s of it) — this isn't a frontend problem. Server processing, a slow database query, CDN cache-miss rate, or geographic distance. Fix with caching, query optimisation, or edge rendering.

**If load delay dominates** — the browser found out about the resource late. The usual causes: the LCP image is a CSS `background-image` or inserted by JavaScript, so the **preload scanner can't see it**; or it's `loading="lazy"`; or it's competing with higher-priority requests. Fixes: put it in the HTML as an `<img>`, add `fetchpriority="high"`, `preconnect` to its origin, remove the lazy attribute.

**If load time dominates** — the file is too big or the connection is slow. Modern format, correct `srcset`/`sizes`, an image CDN, Brotli for text resources.

**If render delay dominates** — it arrived but couldn't paint. Render-blocking CSS or a blocking font (if the LCP element is text), or client-side rendering waiting on hydration. Fixes: inline critical CSS, `font-display: swap` with metric overrides, or move to server rendering.

Then I'd **check the cohorts** — is it everyone, or one route, one country, one device class? A global p75 of 4.2s often means one slow route dragging the aggregate.

And I'd confirm **which element** is actually the LCP. It's frequently not what people assume — a large background, a heading rendered after hydration, or a cookie banner. Optimising the wrong element is the most common wasted effort here.

The framing to close on: **measure the split before optimising.** Teams routinely spend a sprint compressing images when 1.5 seconds of their LCP was TTFB.

---

**Q5: What is INP, and how do you fix a poor score?**

INP measures the latency from an interaction to the next paint, across essentially every interaction, reporting roughly the worst. It replaced FID because FID only measured the delay before the *first* handler started — a much easier and much less representative bar.

The fix depends on which of **three phases** dominates, and that's the diagnostic:

```
input delay  →  processing time  →  presentation delay
(thread busy    (your handler       (style/layout/paint
 on arrival)     running)            of the resulting frame)
```

- **Input delay high** → something else was occupying the main thread when the click arrived. Usually a long task from a third-party script or a big hydration chunk. Break up long tasks with `scheduler.yield()`, defer non-critical scripts, sandbox analytics in a Worker (Partytown).
- **Processing time high** → your handler does too much. Move heavy computation into a **Web Worker**, debounce, or split the work and yield between chunks.
- **Presentation delay high** → the resulting render is expensive. Too much DOM (virtualise), expensive style recalculation, or a large React re-render. `content-visibility: auto` is the cheapest big win on long pages.

The specific React culprits I'd check: a `setState` cascade on every keystroke re-rendering a large tree (fix with `useDeferredValue`/`useTransition`), **layout thrash** from reading `offsetHeight` after a write in a loop (batch reads then writes), and a huge unvirtualised list.

The diagnostic method: Performance panel, record the interaction, find the long task, and determine whether the time is in **scripting**, **rendering** or **painting** — because guessing which of those it is wastes the most time. And note that **INP can't be measured in the lab**, so TBT is your proxy in CI and field data is the source of truth.

---

**Q6: How do you prevent layout shift?**

CLS is the sum of *unexpected* layout shifts — shifts within 500 ms of an interaction are excused, which is why opening an accordion doesn't count.

Every cause is preventable, and it's essentially a list of "reserve the space before the content arrives":

1. **Images and iframes without dimensions** → always `width`/`height` or `aspect-ratio`.
2. **Web font swap at different metrics** → this is the one people miss. `font-display: swap` avoids invisible text but *causes* CLS unless you match the fallback's metrics with `size-adjust`, `ascent-override` and `descent-override`. `next/font` and Fontaine generate these automatically. `font-display: optional` gives zero CLS at the cost of sometimes not using your font.
3. **Content injected above existing content** — cookie banners, promo bars, error messages. Reserve the space or overlay instead of pushing content down.
4. **Ads and embeds** with variable size → reserve a minimum height.
5. **Lazy-loaded content without a matching skeleton.**
6. **Animating layout properties** → animate `transform` and `opacity`, never `width`/`height`/`top`.

Debug with the Performance panel's layout-shift regions, which show you *what* moved instead of making you guess.

The point I'd add: **CLS is usually much worse in the field than in the lab**, because slow connections stretch out the arrival of the things that shift. A clean local CLS with a poor field CLS is the normal case, not an anomaly — which is another reason field data is the source of truth.

---

### Advanced

---

**Q7: You've been asked to improve performance on a large existing React app. Where do you start, and how do you keep it from regressing?**

I'd resist starting with fixes, because the most common failure here is optimising the wrong thing.

**1. Instrument first.** If there's no RUM, that's step one: `web-vitals` with the **attribution** build, segmented by route, device class, connection and build SHA, reporting p75 and p95 via `sendBeacon`. Without field data you're guessing about a distribution you can't see.

**2. Find the worst *cohort*, not the worst average.** A global p75 usually hides one bad route or one device class. Ranking routes by (traffic × badness) tells you where the effort pays.

**3. Diagnose each metric properly.** Decompose LCP into TTFB / load delay / load time / render delay. Split INP into input delay / processing / presentation. Identify the actual LCP element — it's frequently not what the team assumes.

**4. Then the fixes, in rough order of return for a typical React app:**
- **Third-party scripts.** Usually the single biggest blocking cost, and the least examined. Measure them, defer them, load on interaction, Partytown the analytics.
- **The LCP image.** Real `<img>` in the HTML, `fetchpriority="high"`, not lazy, modern format, correct `sizes`.
- **Route-level code splitting**, then interaction-level splitting for heavy components.
- **Fonts** — self-host, `woff2`, subset, variable, preload with `crossorigin`, metric overrides.
- **Long tasks** — break them up, Workers for heavy computation, virtualise long lists, `content-visibility` for long pages.
- **Rendering strategy** if the ceiling is structural — a CSR SPA has a hard LCP floor that no micro-optimisation fixes.

**5. Prevent regression, which is the half that actually matters long-term.** Performance decays reliably: every feature adds a little, nobody adds a lot, and six months later you're 2 MB heavier. So: **bundle-size budgets in CI reported as a diff on the PR** ("+42 KB") — a number in code review changes behaviour where a dashboard doesn't; **Lighthouse CI** comparing against the base branch rather than an absolute score, since Lighthouse noise makes absolute thresholds flaky and then disabled; **field alerting on p75 per route with the build SHA** so a regression points at a deploy; and a **ratchet** for existing debt — fail only on increases.

And name an owner. Performance is cross-cutting, so without a named owner and an explicit budget it belongs to nobody.

---

**Q8: A vendor script is destroying your INP but the business requires it. What do you do?**

I'd treat it as a negotiation backed by data rather than a technical dead end.

**1. Quantify it precisely.** Block the script and re-measure; use Lighthouse's third-party summary and the Performance panel to attribute long tasks. "This script costs 850 ms of Total Blocking Time and moves our INP from 180 ms to 520 ms at p75" is a sentence that changes decisions. "It feels slow" is not.

**2. Then work through the technical mitigations**, in ascending order of how much they change:

- **`async`/`defer`** so it doesn't block parsing, and `fetchpriority="low"`.
- **Load on interaction (the facade pattern).** A chat widget doesn't need to load on page load — render a static button that looks like the widget and load the real thing on click. This is often a complete fix, and it's invisible to the business requirement.
- **Load after the page is interactive** — on `requestIdleCallback`, or after the LCP has been reported, so it can't compete with the critical path.
- **Partytown** — run it in a Web Worker. Works well for analytics and tag managers that don't need synchronous DOM access; won't work for scripts that manipulate the page.
- **Server-side alternative.** Many analytics vendors offer a server-side tagging or CAPI option that removes the client script entirely. This is frequently the best answer and rarely considered.
- **Self-host and pin the script** if the vendor allows it — you control caching and it can't change under you (though you then own updating it, and it interacts with SRI as discussed in the Web Security guide).
- **Gate it.** Load it only for the cohorts that need it — e.g. session replay for 5% of sessions, not 100%.

**3. Make the trade-off explicit and owned.** If none of the above is sufficient, the decision is a business one: this script costs X in conversion via degraded performance and delivers Y in value. My job is to make X visible and give the business a real number, not to quietly absorb it. Setting a **third-party performance budget** turns each future request into an explicit trade rather than a default yes.

**4. And flag the reliability dimension**, which people forget: a synchronously-loaded third-party script from a host that's down blocks your page. Even setting performance aside, that's a single point of failure you don't control — which is often the argument that actually wins the conversation.


---

**Q9: How do you explain performance metrics like FCP, TTI and CLS to non-technical stakeholders?**

Translate each metric into **the moment the user experiences**, then attach it to a number the business already cares about. Never lead with the acronym.

| Metric | Say this instead | The user's question it answers |
|---|---|---|
| **TTFB** | "how long the server takes to start replying" | — |
| **FCP** | "when they see *something* — the page stops being blank" | "is it working?" |
| **LCP** | "when they see **the thing they came for** — the article, the product photo" | "has it loaded?" |
| **TTI / INP** | "when the page actually **responds** to a tap" | "is it broken?" |
| **CLS** | "how much the page **jumps around** while loading" | "why did I tap the wrong thing?" |

The framing that lands: **"there are three separate promises a page makes — I can see it, I can trust it won't move, and I can use it. Each metric measures one of those, and they can fail independently."** That explains why a page can score well on one and badly on another, which is otherwise the confusing part.

**Then make it concrete, because abstractions don't get prioritised:**

- **Demonstrate, don't describe.** Record a screen capture on a throttled connection and play it next to a competitor's. Thirty seconds of that does more than any slide. For CLS especially — showing someone the page shifting under their thumb as they try to tap "Buy" makes the case instantly.
- **Use their number.** "Our checkout page's LCP is 4.2 seconds at the 75th percentile. That means a quarter of the people trying to give us money wait more than four seconds to see the page." Then, if you have the data, tie it to conversion for that cohort. Performance work gets funded when it's a revenue line, not an engineering score.
- **Explain p75 with an analogy, because "the average is fine" is the objection you'll get.** "The average is fine because it includes everyone on fast laptops. The 75th percentile is the *slowest quarter* of our customers — and on mobile, that's most of our traffic. Optimising the average means optimising for the people who were already fine."
- **Give them a threshold, not a score.** Google publishes good/needs-work/poor bands (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1). "Good/needs work/poor" is a language stakeholders already speak, and it stops the conversation becoming "why isn't it 100?"
- **Name the SEO consequence once**, plainly: Core Web Vitals feed into Search ranking. That converts a technical concern into a commercial one, which is often what unblocks the work.

**And the two things not to do.** Don't show a Lighthouse score as the headline — it's a lab number on a simulated device, it's noisy run to run, and once someone has anchored on "we need 100" you'll spend a quarter optimising a harness instead of the experience. And don't present the full metric set; pick the **one** metric that's actually failing and the **one** journey it's failing on. A dashboard with eleven acronyms gets ignored; "checkout is slow for a quarter of mobile users, here's the fix and here's what it costs" gets scheduled.

**If they ask what it'll take**, give the honest shape: the diagnosis is cheap and fast, the fixes vary enormously — an image format change is an afternoon, and "our rendering strategy puts a floor under LCP" is a quarter. Being clear about which one you're in is what makes the next conversation easier.

---
---

## 15. Tricky Questions

---

**Q1: You added `loading="lazy"` to every image to improve performance. LCP got 800ms worse. Why?**

**Answer:** The LCP image is now lazy-loaded, so its fetch is deferred until layout determines it's in the viewport — adding a large chunk of *load delay* to the exact element that defines your LCP.

**Explanation:**

Native lazy loading is genuinely valuable — for images **below the fold**. Applied to the hero image, it's actively harmful, and the mechanism explains why:

```
Eager image:  HTML parsed → PRELOAD SCANNER finds it → fetch starts immediately
Lazy image:   HTML parsed → … layout must run … → in viewport? → fetch starts
```

The **preload scanner** races ahead of the main parser looking for resources to fetch early. A `loading="lazy"` image is deliberately excluded from that early fetch, because the whole point is to avoid downloading images the user may never scroll to. So the browser waits until it has computed layout — which requires CSS to be downloaded and parsed — before it even *starts* requesting your most important image.

Fix the LCP image specifically:

```html
<img src="/hero.webp" width="1600" height="900" fetchpriority="high" alt="">
<!-- no loading="lazy" — and fetchpriority raises it above the default Low -->

<img src="/below-fold.webp" loading="lazy" width="800" height="600" alt="">
```

`fetchpriority="high"` matters on its own: images are fetched at **Low** priority until layout confirms they're in the viewport, so even an eager hero image is initially deprioritised behind scripts and stylesheets. Setting it high is often a bigger win than a `preload`.

**Three more ways to accidentally hide your LCP element from the preload scanner** — all the same root cause:

```html
<!-- CSS background: the browser must download AND parse CSS first -->
<div class="hero"></div>  <style>.hero { background-image: url(/hero.webp) }</style>

<!-- JS-inserted: the URL doesn't exist until the bundle runs -->
<script>root.innerHTML = '<img src="/hero.webp">'</script>

<!-- Client-side rendered: nothing in the initial HTML at all -->
<div id="root"></div>
```

Each adds hundreds of milliseconds of *load delay* before a single byte is requested. **Put the LCP element in the initial HTML as a real `<img>`.**

The generalisable lesson: **a blanket optimisation applied uniformly is usually a pessimisation somewhere.** Lazy loading, code splitting and deferring scripts are all correct *selectively* and harmful when applied to whatever is on the critical path. Measure the split (§2.1) before and after.

**Takeaway:** `loading="lazy"` excludes an image from the preload scanner and defers its fetch until after layout — never apply it to the LCP image, and add `fetchpriority="high"` there instead, since images default to Low priority.

---

**Q2: Lighthouse gives you 98. Your field data says LCP is 5.1s at p75 and INP is "poor". How is that possible?**

**Answer:** Lighthouse is one synthetic run on one simulated device and network from one location, with **no real interaction** — so it can't measure INP at all, and its LCP reflects conditions your users don't have.

**Explanation:**

Four independent reasons the gap opens, and a good answer names several:

**1. Lighthouse cannot measure INP.** There are no interactions in a synthetic run, so Lighthouse reports **TBT** as a proxy. TBT correlates with INP but misses entirely: a slow handler on a specific button, a `setState` cascade on typing, or an expensive re-render triggered by a click. A perfect TBT with a poor INP is completely normal.

**2. The device and network aren't your users'.** Lighthouse's mobile preset simulates a mid-tier device on throttled 4G. Your real p75 might be a low-end Android on unreliable mobile data — where JavaScript parse and execute time is several times slower. **CPU is the usual culprit**: a bundle that costs 400 ms to execute on a test machine can cost 2 s on a cheap phone.

**3. Cold vs warm, and the cache.** Lighthouse tests a single cold load of one URL. Real sessions include client-side navigations, a populated cache, service workers, and — critically — **real third-party scripts** that a lab run may block or that behave differently without a real user profile, consent state, or ad auctions.

**4. p75 across all routes and locales, versus one URL.** You tested the homepage from a nearby region. Your p75 aggregates every route (including the slow search page), every country (including ones far from your only origin), and every device class.

**How to resolve it:**

```js
import { onLCP, onINP } from 'web-vitals/attribution';   // ← attribution build
onINP(m => report({
  value: m.value,
  target: m.attribution.interactionTarget,   // WHICH element
  inputDelay: m.attribution.inputDelay,      // WHICH phase
  processingDuration: m.attribution.processingDuration,
  presentationDelay: m.attribution.presentationDelay,
}));
```

Then **segment** by route, device class, connection type, country and build SHA, and look at p75/p95 rather than the average. That turns "INP is poor" into "INP is 640 ms on the product page, on low-end Android, and 480 ms of it is processing time in the filter handler" — which is a fixable statement.

**The role each data source should play:** field data decides **what to fix and for whom**; lab data helps you **fix it** and gates regressions in CI. Lighthouse's real value is as a *differential* tool — compare a change against the base branch — not as an absolute score. Chasing 100 is a well-known trap: it's achievable on a page that's slow for real users, and it optimises for the harness rather than the humans.

One more gap: **CrUX only includes Chrome users who opted into reporting.** Safari and Firefox never appear in it, or in Search's assessment, so your own RUM is the only view of those users.

**Takeaway:** Lighthouse is one cold synthetic run with no interactions, so it cannot measure INP and its LCP reflects a device and network your users may not have — use field data (segmented, at p75, with attribution) to decide what to fix, and lab data to debug and gate regressions.

---

**Q3: You self-hosted your fonts and added a preload. The font now downloads twice and FCP got worse. What went wrong?**

**Answer:** The `<link rel="preload" as="font">` is missing `crossorigin`. Fonts are always fetched in CORS mode, so the preload without it creates a *separate* cache entry that the actual `@font-face` request can't reuse.

**Explanation:**

```html
<!-- ✗ Downloads twice: once for the preload, once for @font-face -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2">

<!-- ✓ Same cache entry, one download -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

The mechanism: the CSS Fonts spec requires font requests to use CORS mode (anonymous), **even same-origin**. A preload without `crossorigin` issues a *no-cors* request, and the browser's cache keys on the request mode — so the two requests are distinct entries. You've doubled the bytes and added contention on the critical path, which is why FCP got *worse* rather than better.

DevTools makes this diagnosable: you'll see the same URL twice in the Network panel, and a console warning that the preloaded resource "was not used within a few seconds."

**Three more ways preloading backfires**, all worth knowing because they share a theme:

1. **Preloading too much.** A preload is a priority *reallocation*, not extra bandwidth. Preload five things and you've stolen priority from each other plus from your CSS and LCP image — preloading everything preloads nothing.
2. **Preloading a font you don't use above the fold.** You've fetched a bold italic at high priority that first paint never needed.
3. **`preconnect` sprawl.** Each `preconnect` speculatively holds a DNS + TCP + TLS handshake open. Two or three to genuinely critical origins is right; a dozen competes with real requests. `dns-prefetch` is the cheap alternative for the rest.

While we're here — the other half of the self-hosting decision is worth stating, because it's the reason this was a good idea despite the bug: **browser cache partitioning removed the cross-site cache benefit** that used to justify a shared font CDN. A visitor no longer arrives with your Google-hosted font already cached from another site, so a third-party font host is now strictly worse — an extra DNS + TCP + TLS handshake for no cache upside. Self-hosting is correct; it just needs `crossorigin` on the preload.

And the CLS half: `font-display: swap` fixes invisible text but *causes* layout shift when the swap happens, unless you match the fallback's metrics with `size-adjust`, `ascent-override` and `descent-override` — which `next/font` and Fontaine generate for you.

**Takeaway:** font preloads require `crossorigin` because fonts are fetched in CORS mode and the cache keys on request mode — without it you download the font twice; and preloads are a priority reallocation, so preloading many things helps none of them.

---

**Q4: You code-split aggressively and the initial bundle dropped 60%. LCP improved, but INP got worse and users report the app feels janky when navigating. Why?**

**Answer:** You traded one large upfront cost for many small runtime costs. Each navigation now fetches, parses and executes a chunk *during* an interaction — which is exactly when the main thread must be free.

**Explanation:**

Code splitting moves work; it doesn't remove it. The initial load improved because less JavaScript is parsed and executed before first paint. But now:

```
User clicks a link
  → route chunk request starts (network latency: 100-500ms)
  → chunk downloads
  → PARSE + COMPILE + EXECUTE on the main thread   ← blocks input
  → component renders, effects fire, data fetch starts
  → another waterfall if the chunk itself imports more chunks
```

Every one of those steps happens *after* the interaction, so it lands directly in INP and in perceived jank. And if the lazy component imports its own lazy dependencies, you've built a **request waterfall** — chunk A must execute before the browser learns it needs chunk B.

**The fixes, and the point is that splitting needs a strategy rather than maximalism:**

1. **Prefetch on intent.** Start fetching the chunk on hover or focus of the link, or when it enters the viewport — so by click time it's already cached. This is the single biggest win and most routers support it.

```jsx
<Link to="/settings" onMouseEnter={() => import('./Settings')}>Settings</Link>
```
   Or declaratively with the **Speculation Rules API**, which can prerender the whole next page.

2. **Split at the right granularity.** Per-route is usually right. Per-component is usually too fine — dozens of tiny chunks mean HTTP overhead, more waterfalls, and worse compression than a few well-sized ones. Under HTTP/2 multiplexing the old "bundle everything" advice is dead, but so is "split everything."

3. **Don't split what's always needed.** Shared UI, the design system and the router belong in the main bundle; splitting them just adds a round trip to every route.

4. **Use `useTransition`** so the navigation doesn't block input while the chunk loads, and render a meaningful `Suspense` fallback that matches the final layout's dimensions (or you've also introduced CLS).

5. **Flatten the waterfall.** Ensure a route chunk's data fetch starts in parallel with the chunk load, not after it — that's what route loaders (React Router, TanStack Router) and RSC do for you.

The general principle worth stating: **there is no single "performance" metric to optimise.** LCP, INP and CLS pull in different directions, and a change that helps one routinely hurts another — lazy loading helps bytes and hurts LCP if misapplied; code splitting helps LCP and hurts INP if unmanaged; `font-display: swap` helps LCP and hurts CLS. Always measure the **whole set** before and after, in the **field**, and know which metric matters most for the journey you're changing.

**Takeaway:** code splitting relocates parse and execute cost from load time into interaction time, so aggressive splitting improves LCP while degrading INP — prefetch on intent, split per-route rather than per-component, and always measure LCP, INP and CLS together because they trade against each other.

---

## 16. Cheat Sheet

```
THE METRICS (all assessed at p75 of REAL users)
 1. LCP ≤ 2.5s (loading) · INP ≤ 200ms (responsiveness) · CLS ≤ 0.1 (stability).
 2. INP replaced FID in March 2024 — FID only measured the delay before the FIRST
    handler started. INP measures full input→paint for nearly every interaction.
 3. Diagnostics: TTFB ≤ 800ms, FCP ≤ 1.8s, TBT ≤ 200ms (the LAB proxy for INP),
    long task = >50ms.
 4. PERFORMANCE IS A DISTRIBUTION. p75 is deliberate — averages hide the broken
    cohort. Never start an answer with "the average".

DECOMPOSE BEFORE OPTIMISING
 5. LCP = TTFB + load DELAY + load TIME + render DELAY. Each has a different fix.
    TTFB → server/CDN. Delay → late discovery. Time → too big. Render → blocked.
 6. INP = input delay + processing + presentation. Delay → thread busy.
    Processing → your handler. Presentation → expensive render.
 7. Confirm WHICH element is the LCP — it's often not what the team assumes.

LAB vs FIELD
 8. FIELD tells you WHAT to fix; LAB helps you FIX it. In that order.
 9. Lighthouse CANNOT measure INP (no interactions) — TBT is only a proxy.
10. Use web-vitals/attribution, sendBeacon (survives unload), segment by route ×
    device × connection × country × BUILD SHA, report p75/p95.
11. CrUX = opted-in Chrome users only. Safari/Firefox are invisible to it and to Search.
12. Lighthouse is a DIFFERENTIAL tool (vs base branch), not an absolute score.
    Chasing 100 optimises the harness, not the humans.

THE LOADING PIPELINE
13. A sync <script> blocks PARSING. A stylesheet blocks RENDERING (not parsing).
14. defer = parallel fetch, runs after parse, IN ORDER. async = runs whenever,
    OUT of order. type=module = deferred by default.
15. The PRELOAD SCANNER races ahead to find resources. It CANNOT see:
    CSS background-images, JS-inserted <img>, or client-rendered content.
    → put the LCP element in the initial HTML as a real <img>.

HINTS & PRIORITIES
16. preconnect: 2-3 origins MAX (each holds a speculative handshake).
    dns-prefetch is the cheap alternative.
17. FONT PRELOADS REQUIRE crossorigin — fonts fetch in CORS mode and the cache keys
    on request mode. Without it the font downloads TWICE.
18. A preload is a priority REALLOCATION, not free bandwidth. Preload everything
    → preload nothing.
19. fetchpriority="high" on the LCP image (images default to LOW until layout).
20. NEVER loading="lazy" on the LCP image — it's excluded from the preload scanner
    and waits for layout. The #1 self-inflicted LCP regression.
21. Speculation Rules API can prefetch AND prerender the next navigation.

IMAGES
22. AVIF → WebP → JPEG via <picture>. AVIF ≈ 30-50% smaller than JPEG.
23. srcset + sizes. `sizes` describes the RENDERED width — wrong sizes is worse
    than no srcset.
24. ALWAYS width/height or aspect-ratio (this is the CLS fix).
25. decoding="async"; use an image CDN rather than committing five sizes.
26. Never autoplay video as a hero — use a poster. preload="metadata", not auto.

FONTS
27. woff2 only. Self-host (cache partitioning killed the shared-CDN benefit).
    Variable fonts. Subset with unicode-range.
28. font-display: swap = good LCP, CAUSES CLS. Fix with size-adjust /
    ascent-override / descent-override (next/font and Fontaine generate them).
    `optional` = zero CLS, may not use your font.
29. Consider a system font stack for body text: zero bytes, zero CLS.

JAVASCRIPT
30. You pay THREE times: download, parse/compile, execute. 200KB of JS ≠ 200KB
    of image — the image decodes off-thread.
31. Split per ROUTE (and per heavy interaction). Per-component is usually too fine
    → HTTP overhead + waterfalls + worse compression.
32. Code splitting MOVES cost from load into INTERACTION → prefetch on hover/focus,
    or INP suffers. LCP and INP trade against each other.
33. Ship modern syntax — transpiling to ES5 for nobody inflates bundles a lot.
34. Tree shaking needs ESM + sideEffects:false + no barrel-file re-exports.
35. THIRD PARTIES are usually the biggest blocking cost. Measure by blocking them.
    async/defer, load on interaction (facade pattern), Partytown into a Worker,
    or a server-side tagging alternative. Set a third-party budget.
36. A sync third-party script from a down host blocks your page — a reliability
    risk, not just a perf one.
37. Move work to the server: an RSC using a 300KB parser ships none of it.

INP & THE MAIN THREAD
38. scheduler.yield() keeps your continuation at HIGHER priority than new tasks
    (unlike setTimeout(0), which goes to the back of the queue).
39. Web Workers for heavy computation; post back only render-ready data.
40. LAYOUT THRASH: reading offsetHeight/getBoundingClientRect after a write forces
    synchronous layout. Batch ALL reads, then ALL writes.
41. content-visibility: auto (+ contain-intrinsic-size) — cheapest big win on
    long pages.
42. Virtualise long lists — style recalc and layout scale with node count.
43. Animate ONLY transform and opacity (compositor). width/height/top = layout
    every frame.

CLS
44. Causes: no image dimensions · font metric mismatch on swap · content injected
    ABOVE existing content · ads/embeds · lazy content without a matching skeleton
    · animating layout properties · late CSS.
45. Shifts within 500ms of an interaction are EXCUSED (so accordions are fine).
46. CLS is usually WORSE in the field than the lab — slow connections stretch out
    the arrival of everything that shifts.

NETWORK
47. Brotli for text (~15-20% better than gzip); pre-compress static assets.
    Don't compress images/video/woff2.
48. H2 multiplexing killed "bundle everything"; H3/QUIC removes TCP head-of-line
    blocking (a real mobile win).
49. Hashed assets: max-age=31536000, immutable. index.html: no-cache.
    stale-while-revalidate at the CDN is the highest-leverage single header.
50. Early Hints (103) parallelise server think-time with resource fetching.

STRATEGY & PROCESS
51. The less JS needed before the page is usable, the better BOTH LCP and INP.
    CSR has a hard LCP floor no micro-optimisation fixes.
52. Bundle-size budget in CI, reported as a DIFF on the PR ("+42 KB"). A number in
    code review changes behaviour; a dashboard nobody opens does not.
53. Lighthouse CI vs the BASE BRANCH, multiple runs (absolute thresholds are flaky
    → they get disabled).
54. Field alerting on p75 per route WITH the build SHA, so a regression points at
    a deploy.
55. RATCHET existing debt: fail only on increases.
56. Name an owner. Performance is cross-cutting, so otherwise it belongs to nobody.
57. A blanket optimisation applied uniformly is a pessimisation somewhere. Measure
    LCP, INP and CLS TOGETHER, before and after, in the field.
```

---

## 17. References

- [web.dev — Core Web Vitals](https://web.dev/articles/vitals) — the authoritative definitions and thresholds
- [web.dev — Optimize LCP](https://web.dev/articles/optimize-lcp) — including the four-part decomposition
- [web.dev — Optimize INP](https://web.dev/articles/optimize-inp) and [Long tasks](https://web.dev/articles/optimize-long-tasks)
- [web.dev — Optimize CLS](https://web.dev/articles/optimize-cls)
- [`web-vitals` library](https://github.com/GoogleChrome/web-vitals) — and read the **attribution** docs, not just the basic API
- [Chrome UX Report](https://developer.chrome.com/docs/crux) — field data for any origin, including your competitors'
- [PageSpeed Insights](https://pagespeed.web.dev) — lab and field side by side, which is the useful comparison
- [WebPageTest](https://www.webpagetest.org) — filmstrips, waterfalls and real-device testing; better than Lighthouse for diagnosis
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) — regression gates in your pipeline
- [web.dev — Resource hints](https://web.dev/learn/performance/resource-hints) — `preconnect`, `preload`, `prefetch` and their failure modes
- [Partytown](https://partytown.builder.io) — third-party scripts in a Web Worker
- [Fontaine](https://github.com/unjs/fontaine) — automatic font metric overrides to eliminate swap CLS
- [Speculation Rules API](https://developer.chrome.com/docs/web-platform/prerender-pages) — prefetch and prerender the next navigation
- [Addy Osmani — The Cost of JavaScript](https://medium.com/dev-channel/the-cost-of-javascript-in-2018-7d8950fbb5d4) — the parse/compile/execute framing, still the clearest statement of it
