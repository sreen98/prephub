# Next.js & React Server Components — Complete Guide

React Server Components changed the React mental model more than hooks did, and Next.js is where most engineers meet them. That makes this the highest-variance topic in modern React interviews: candidates who have shipped App Router code sound completely different from candidates who have read about it.

This guide covers the model (what RSC actually is and where the boundary sits), the framework (App Router, caching, Server Actions, streaming), the security (which has a real CVE history worth knowing), and what changed in **Next.js 16**.

---

## Table of Contents

- [1. Why This Dominates React Interviews](#1-why-this-dominates-react-interviews)
- [2. React Server Components — The Mental Model](#2-react-server-components-the-mental-model)
- [3. The Client Boundary](#3-the-client-boundary)
- [4. App Router — Files and Routing](#4-app-router-files-and-routing)
- [5. Rendering Strategies](#5-rendering-strategies)
- [6. Data Fetching and the Caching Model](#6-data-fetching-and-the-caching-model)
- [7. Server Actions](#7-server-actions)
- [8. Streaming and Suspense](#8-streaming-and-suspense)
- [9. Authentication — Defence in Depth](#9-authentication-defence-in-depth)
- [10. proxy.ts](#10-proxyts)
- [11. Next.js 16 — What Changed](#11-nextjs-16-what-changed)
- [12. Performance](#12-performance)
- [13. Common Pitfalls](#13-common-pitfalls)
- [14. Interview Questions & Answers](#14-interview-questions-answers)
- [15. Tricky Questions](#15-tricky-questions)
- [16. Cheat Sheet](#16-cheat-sheet)
- [17. References](#17-references)

---

## 1. Why This Dominates React Interviews

Next.js is the default way React is shipped in production, so an App Router question is really four questions at once: do you understand the **server/client boundary**, do you understand **caching**, can you reason about **security** in a framework where the same file can run in two places, and do you know when *not* to reach for it.

The single most valuable thing to internalise: **RSC is not SSR.** Server-side rendering runs your components on the server to produce HTML, then ships the same component code to the browser to hydrate. Server Components run on the server and their code **never reaches the browser at all**. That distinction drives every other answer in this guide, and confusing the two is the fastest way to fail this round.

---

## 2. React Server Components — The Mental Model

### 2.1 What Actually Happens

```
┌─ Server ──────────────────────────────────────────────┐
│ 1. Render Server Components → they can await data     │
│ 2. Output the RSC payload: a serialised tree of       │
│    - rendered host elements (div, p, …)               │
│    - "holes" pointing at Client Component bundles     │
│    - serialised props for those Client Components     │
│ 3. Stream that payload (plus HTML for first load)     │
└───────────────────────┬───────────────────────────────┘
                        ▼
┌─ Browser ─────────────────────────────────────────────┐
│ 4. React reconstructs the tree from the payload       │
│ 5. Downloads and hydrates only the Client Components  │
│    Server Component code is NEVER downloaded          │
└───────────────────────────────────────────────────────┘
```

The RSC payload is not HTML — it's a serialised React tree in a streaming wire format. That's what makes client-side navigation work: navigating to a new route fetches a *new payload*, and React reconciles it into the existing tree, so client state in unaffected Client Components survives.

### 2.2 What You Gain

- **Zero client bundle for server code.** A Server Component using a 300 KB markdown parser or a date library ships **none** of it. This is the largest practical win, and it's why moving a heavy component to the server is a bundle-size fix rather than a rendering trick.
- **Direct data access.** `await db.query(...)` inside a component. No API route, no loading state, no `useEffect` waterfall.
- **Secrets stay server-side.** API keys and database credentials live in code that never leaves the server.
- **Automatic request-level dedupe.** React's `cache()` and Next's `fetch` dedupe identical requests within one render pass, so ten components asking for the current user cause one query.

### 2.3 What You Lose

Server Components **cannot**:

- use `useState`, `useReducer`, `useEffect`, or any hook that needs a client runtime
- use event handlers (`onClick`, `onChange`)
- use browser APIs (`window`, `localStorage`, `IntersectionObserver`)
- use Context (they can *read* a value passed as a prop, but not consume a client Context)
- be `React.memo`'d — memoization is a client-render concept

They render **once per request** and then they're done. There is no re-render, no interactivity, no lifecycle.

### 2.4 The Composition Rule

```
Server Component  →  can render  →  Server or Client Components
Client Component  →  can render  →  Client Components only
                                     (and Server Components passed as `children`)
```

A Client Component cannot `import` a Server Component — the import would pull server code into the client bundle. But it **can** render one that was passed to it as a prop, because the server rendered it and only the resulting payload crosses the boundary:

```tsx
// ✅ This works — the server renders <ServerChart/> and passes the result through
// app/page.tsx (Server Component)
<ClientTabs>
  <ServerChart />        {/* rendered on the server, passed as children */}
</ClientTabs>
```

This "server content in a client shell" pattern is the single most useful thing to know, because it's how you keep interactive wrappers thin while the heavy data-driven content stays on the server.

---

## 3. The Client Boundary

### 3.1 `'use client'`

```tsx
'use client';   // must be the first statement in the file

import { useState } from 'react';
export function Counter() { const [n, setN] = useState(0); /* … */ }
```

`'use client'` marks an **entry point into the client graph**, not a single component. Everything that file imports — and everything *those* files import — becomes part of the client bundle. That's the property people misjudge: adding `'use client'` to a layout at the top of your tree makes the whole subtree client-rendered and defeats the point of RSC.

**Components are Server Components by default** in the App Router. You opt *into* the client, not out of it.

### 3.2 Pushing the Boundary Down

The core discipline: put `'use client'` on the **smallest** component that genuinely needs interactivity, as deep in the tree as possible.

```tsx
// ❌ Whole page becomes client-rendered for one button
'use client';
export default function ProductPage({ product }) {
  const [qty, setQty] = useState(1);
  return (
    <div>
      <ProductGallery product={product} />     {/* now client code */}
      <ProductDescription product={product} /> {/* now client code */}
      <button onClick={() => setQty(qty + 1)}>+</button>
    </div>
  );
}
```

```tsx
// ✅ Only the interactive bit is client
// app/product/page.tsx — Server Component
export default async function ProductPage({ params }) {
  const product = await getProduct((await params).id);
  return (
    <div>
      <ProductGallery product={product} />      {/* stays server */}
      <ProductDescription product={product} />  {/* stays server */}
      <QuantityPicker productId={product.id} /> {/* 'use client' — small */}
    </div>
  );
}
```

### 3.3 Serialisation — The Boundary Is a Wire

Props crossing from a Server Component to a Client Component are **serialised**, so they must be serialisable. This is enforced at runtime and it's a very common source of errors.

| Can cross | Cannot cross |
|---|---|
| primitives, `null`, `undefined` | functions (except Server Actions) |
| plain objects and arrays | class instances (a Mongoose document, a `Decimal`) |
| `Date`, `Map`, `Set`, `BigInt`, `RegExp` | Symbols (except well-known) |
| Promises (React will unwrap them) | anything with methods you intend to call |
| JSX / React elements | Node streams, `fs` handles, DB clients |
| **Server Actions** (a special reference) | |

The most frequent real-world failure is passing an ORM object straight through — it looks like a plain object but carries a prototype full of methods. The fix is to map to a plain DTO at the boundary, which is good practice anyway because it stops you accidentally shipping fields the client shouldn't see.

**And that's the security point**: every prop you pass to a Client Component is **serialised into the payload the browser receives.** Passing an entire `user` record because you only need `user.name` leaks the password hash into the page source. This is not theoretical — it's one of the most common RSC data-leak bugs.

### 3.4 `server-only` and `client-only`

```ts
// lib/db.ts
import 'server-only';   // build-time error if this is ever imported into a client bundle
export const db = createClient(process.env.DATABASE_URL!);
```

This turns "I hope nobody imports this on the client" into a build failure. Put it on every module touching secrets, the database, or your session verification. It is the cheapest security control available in this stack and most codebases don't use it.

---

## 4. App Router — Files and Routing

### 4.1 File Conventions

```
app/
├── layout.tsx            root layout (required) — persists across navigation
├── page.tsx              the route's UI
├── loading.tsx           Suspense fallback for this segment
├── error.tsx             error boundary (must be a Client Component)
├── global-error.tsx      catches errors in the root layout
├── not-found.tsx         404 UI
├── template.tsx          like layout, but REMOUNTS on navigation
├── route.ts              API endpoint (cannot coexist with page.tsx)
├── default.tsx           required fallback for every parallel-route slot
├── blog/[slug]/page.tsx  dynamic segment
├── shop/[...cats]/       catch-all
├── docs/[[...path]]/     optional catch-all
├── (marketing)/          route group — organises without affecting the URL
├── @modal/               parallel route slot
└── (.)photo/[id]/        intercepting route (modal over the current page)
```

**Layout vs template** is a common question: a `layout` **persists** across navigations within its segment — its state survives, and it doesn't re-render. A `template` remounts on every navigation, which you want when you need an enter animation or per-navigation state reset.

**Route groups** `(name)` organise files and let you have multiple root layouts without adding a URL segment. **Parallel routes** `@slot` render several pages into one layout simultaneously. **Intercepting routes** `(.)` are how you get "clicking a photo opens a modal, but the URL is shareable and a direct visit renders a full page."

### 4.2 Params Are Async Now

A Next.js 16 breaking change that trips up everyone upgrading:

```tsx
// ❌ Next 14
export default function Page({ params, searchParams }) {
  return <div>{params.slug}</div>;
}
```

```tsx
// ✅ Next 15+/16 — params and searchParams are Promises
export default async function Page({ params, searchParams }) {
  const { slug } = await params;
  const { q } = await searchParams;
  return <div>{slug}</div>;
}
```

The same applies to `cookies()`, `headers()` and `draftMode()` — all async, all must be awaited. The reason is Partial Pre-rendering: making them async lets Next render the static shell without them and suspend only where dynamic data is actually read.

### 4.3 Route Handlers

```ts
// app/api/items/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return Response.json(await getItems(searchParams.get('q')));
}
export async function POST(request: Request) { /* … */ }
```

Route Handlers use Web `Request`/`Response`. Worth knowing when you still need them, given Server Components can fetch directly: **webhooks, third-party callbacks, OAuth redirects, file uploads, anything a non-browser client consumes, and anything needing a specific response type** (an RSS feed, a PDF, an OG image). If it's just "get data for my own page," a Server Component is simpler and one less network hop.

---

## 5. Rendering Strategies

| Strategy | When HTML is produced | Use for | Trade-off |
|---|---|---|---|
| **CSR** | in the browser | dashboards behind auth, highly interactive tools | poor LCP, bad SEO |
| **SSR** | per request | personalised pages needing fresh data | TTFB depends on your slowest query |
| **SSG** | at build | marketing, docs, blogs | rebuild to update |
| **ISR** | at build, revalidated in background | large catalogues that change | brief staleness window |
| **Streaming SSR** | per request, in chunks | pages with one slow section | more complex to reason about |
| **RSC** | per request on the server, no client code | reducing bundle size, direct data access | no interactivity without a client boundary |
| **PPR** | static shell at build + dynamic holes per request | pages that are mostly static with personalised bits | the newest, most nuanced model |

**Partial Pre-rendering is the one to be able to explain**, because it dissolves the choice. Before PPR, one personalised element — a user's name in the header — forced the entire route to be dynamic, so every visitor paid for a full server render of markup that was identical for everyone.

With PPR, Next renders the static shell at build time, stopping at your `Suspense` boundaries. That shell ships from the CDN edge immediately; the dynamic holes stream in per request. You get static latency with dynamic capability. Underneath, this is React 19.2's `prerender`/`resume` API (see the React guide §16.8).

```tsx
export default function Page() {
  return (
    <>
      <StaticHeader />                            {/* prerendered, edge-cached */}
      <Suspense fallback={<UserSkeleton />}>
        <PersonalisedGreeting />                  {/* streams per request */}
      </Suspense>
    </>
  );
}
```

In Next.js 16 the standalone `experimental.ppr` flag was **removed** — PPR is now part of the **Cache Components** model (§6).


---

## 6. Data Fetching and the Caching Model

### 6.1 The History Matters

Caching is the part of Next.js that has changed most, and interviewers ask about it partly to find out how recently you've actually used it.

| Version | Default |
|---|---|
| **13–14** | `fetch` was **cached by default** (`force-cache`), plus an implicit Router Cache, Full Route Cache and Data Cache. Powerful, and a notorious source of "why is my data stale?" |
| **15** | `fetch` became **uncached by default**. GET Route Handlers and client router cache defaults also flipped to uncached |
| **16** | **Cache Components** — caching is **entirely opt-in** via the `"use cache"` directive. All dynamic code in a page, layout or route runs at request time by default |

The direction of travel is the answer to give: Next moved from **implicit caching that surprised you** to **explicit caching you ask for**. Saying that shows you understand the *why*, not just the current API.

### 6.2 Cache Components and `"use cache"`

```ts
// next.config.ts
const nextConfig = { cacheComponents: true };
export default nextConfig;
```

The `"use cache"` directive can be applied to a **function, a component, or a whole file**, and the compiler generates the cache key from the closed-over values and arguments automatically:

```tsx
async function getProducts(category: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(`products-${category}`);
  return db.products.findMany({ where: { category } });
}

// Or cache a whole component's render output
async function ProductGrid({ category }: { category: string }) {
  'use cache';
  const products = await getProducts(category);
  return <Grid items={products} />;
}
```

`cacheLife` sets the freshness profile (built-in names like `'max'`, `'days'`, `'hours'`, or a custom profile in `next.config`); `cacheTag` attaches tags you can later invalidate.

### 6.3 The Three Invalidation APIs

Next.js 16 split invalidation into three APIs with genuinely different semantics, and knowing which to use is a good discriminating question:

```ts
import { revalidateTag, updateTag, refresh } from 'next/cache';

// 1. revalidateTag(tag, profile) — stale-while-revalidate.
//    Users get cached data immediately; Next revalidates in the background.
//    The profile argument is now REQUIRED (the single-arg form is deprecated).
revalidateTag('blog-posts', 'max');

// 2. updateTag(tag) — Server Actions only. READ-YOUR-WRITES:
//    expires the cache and reads fresh data within the same request,
//    so the user sees their own change immediately.
'use server';
export async function updateProfile(id: string, data: Profile) {
  await db.users.update(id, data);
  updateTag(`user-${id}`);
}

// 3. refresh() — Server Actions only. Refreshes UNCACHED data only;
//    doesn't touch the cache at all. For live counters, status indicators.
export async function markRead(id: string) {
  await db.notifications.markAsRead(id);
  refresh();
}
```

The distinction to state: **`revalidateTag` is eventual consistency** (good for content that can be briefly stale), **`updateTag` is read-your-writes** (essential for forms and settings, where a user who doesn't see their own change assumes it failed), and **`refresh` is for data that was never cached.** Using `revalidateTag` where you needed `updateTag` produces the classic "I saved it but it still shows the old value" bug.

### 6.4 Request Deduplication and `cache()`

Within a single render pass, React dedupes identical `fetch` calls, so you can fetch the same data in three components without three requests. For non-`fetch` work — a database query, a session lookup — wrap it in React's `cache()`:

```ts
import { cache } from 'react';
export const getUser = cache(async (id: string) => db.users.findUnique({ where: { id } }));
```

This is the idiomatic replacement for prop-drilling data down from a layout: each component that needs the user just calls `getUser(id)`, and only one query runs. It's also how `verifySession()` avoids re-verifying ten times per request (§9).

### 6.5 Avoiding Waterfalls

```tsx
// ❌ Sequential — total time is the sum
const user = await getUser(id);
const posts = await getPosts(id);
```

```tsx
// ✅ Parallel — total time is the max
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

```tsx
// ✅ Better still — start both, stream each in as it resolves
export default function Page({ params }) {
  const userPromise = getUser(params.id);     // no await
  const postsPromise = getPosts(params.id);
  return (
    <>
      <Suspense fallback={<UserSkeleton />}><User promise={userPromise} /></Suspense>
      <Suspense fallback={<PostsSkeleton />}><Posts promise={postsPromise} /></Suspense>
    </>
  );
}
```

The third pattern is worth knowing well: **start the fetch without awaiting, pass the promise down, and unwrap it with `use()` inside a Suspense boundary.** Requests overlap, and each section renders the moment its own data is ready rather than waiting for the slowest.

A structural waterfall to watch for: a nested layout that awaits data before its child page can render. Layouts and pages render in parallel where possible, but an `await` in a layout blocks the segments beneath it.

---

## 7. Server Actions

```tsx
// app/actions.ts
'use server';

import { z } from 'zod';

const Schema = z.object({ name: z.string().min(1), email: z.string().email() });

export async function updateProfile(prevState: unknown, formData: FormData) {
  // 1. AUTHENTICATE — this is a public HTTP endpoint
  const session = await verifySession();
  if (!session) return { error: 'Unauthorised' };

  // 2. VALIDATE — never trust the payload
  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten() };

  // 3. AUTHORISE — may THIS user change THIS record?
  if (!can(session, 'profile:write', parsed.data.id)) return { error: 'Forbidden' };

  // 4. Mutate, then invalidate with read-your-writes semantics
  await db.users.update(session.userId, parsed.data);
  updateTag(`user-${session.userId}`);
  return { success: true };
}
```

```tsx
'use client';
import { useActionState } from 'react';

export function ProfileForm() {
  const [state, action, pending] = useActionState(updateProfile, null);
  return (
    <form action={action}>
      <input name="name" />
      <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
      {state?.error && <p role="alert">{String(state.error)}</p>}
    </form>
  );
}
```

### 7.1 The Thing To Say Unprompted

**A Server Action is a public HTTP endpoint.** Next generates an ID for it and the client posts to it. The fact that no UI calls it, or that the button is hidden, or that the page requires login, means **nothing** — anyone who can find the action ID can invoke it directly with any arguments.

So every Server Action must independently **authenticate, validate and authorise**, exactly like a REST endpoint. This is the single most common Server Actions security failure, and volunteering it is a strong signal.

Other properties worth knowing:

- **They work without JavaScript.** A `<form action={serverAction}>` progressively enhances — it submits as a native form post before hydration. This is a genuine advantage over a `fetch`-based handler.
- **Actions are queued, not parallel.** Next serialises action invocations to avoid interleaved mutations, so firing ten actions is sequential. Don't use them for bulk parallel work.
- **They can be passed as props** across the server/client boundary — the only "function" that can be serialised, because what crosses is a reference, not the code.
- **Return values must be serialisable**, same rules as props (§3.3).
- **Not for reads.** Use them for mutations. Fetching via an action bypasses caching and adds a round trip; read in a Server Component instead.
- **Pair with `useOptimistic`** for instant feedback, and remember to handle the rollback path when the action fails.

---

## 8. Streaming and Suspense

```tsx
// loading.tsx wraps the segment in Suspense automatically
export default function Loading() { return <Skeleton />; }

// Or place boundaries manually for finer control
<Suspense fallback={<Skeleton />}><SlowSection /></Suspense>
```

Streaming means the server sends HTML in chunks as each Suspense boundary resolves, so the shell paints immediately and slow sections fill in. The practical effect is a **fast TTFB and LCP even when one query is slow** — the page no longer waits for its slowest data.

Points that come up:

- **Boundary placement is a UX decision.** Too coarse and the user stares at one big skeleton; too fine and the page flickers as a dozen pieces pop in. Put boundaries around genuinely independent slow sections.
- **React 19.2 batches SSR Suspense reveals** to match client behaviour, so streamed pages produce fewer, larger paint steps instead of visible layout thrash.
- **A streamed error can't change the status code.** Once the shell has been sent with a 200, an error in a later boundary can only be rendered as UI — which is why `error.tsx` matters and why SEO-critical error states need to happen before the stream starts.
- **`error.tsx` must be a Client Component** (it needs an error boundary, which is client-only) and it receives a `reset()` function to retry the segment.
- **Layout shift is the risk.** Skeletons should match the final content's dimensions, or you trade a slow LCP for a bad CLS.

---

## 9. Authentication — Defence in Depth

This is the most security-consequential section in the guide, and it has a real CVE history that makes the argument for you.

### 9.1 Never Trust the Proxy/Middleware Layer Alone

| CVE | What happened |
|---|---|
| **CVE-2025-29927** | A crafted `x-middleware-subrequest` header let a request **skip middleware entirely** — taking every middleware-based authorization check with it |
| **CVE-2026-45109** | An incomplete fix for a **segment-prefetch bypass**; patched in 15.5.18 / 16.2.6 |
| **CVE-2026-64642** | A **proxy bypass** affecting App Router builds on Turbopack; patched in 16.2.11 (July 2026) |

The pattern is unmistakable: **the request-interception layer has been bypassable more than once.** Next's own documentation says middleware/proxy is not a complete authorization solution. So the design has to be resilient to that layer failing entirely.

### 9.2 The Layers

```
1. proxy.ts            cheap early redirect for obviously-unauthenticated requests
                       → a UX optimisation, NOT a security boundary
2. Data Access Layer   every function reading/writing sensitive data verifies the
                       session ITSELF, right next to the data
3. Server Actions &    each one authenticates and authorises independently
   Route Handlers      (they are public HTTP endpoints)
4. The payload         never pass secrets as props to Client Components
```

```ts
// lib/dal.ts
import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';

// cache() so one request verifies once even if ten components ask
export const verifySession = cache(async () => {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;
  return decryptAndValidate(token);   // signature, expiry, revocation
});

export async function getInvoices() {
  const session = await verifySession();
  if (!session) throw new Error('Unauthorised');
  // Scope the QUERY to the session — never take an id from the caller alone
  return db.invoices.findMany({ where: { orgId: session.orgId } });
}
```

The Data Access Layer is the actual boundary, and the reason is structural: **it isn't in the request pipeline, so a pipeline bypass cannot skip it.** That's what makes it robust against the whole CVE class above.

### 9.3 The Mistakes

- **Authorising only in `proxy.ts`.** See §9.1.
- **Trusting an ID from the client.** `getInvoice(params.id)` without checking the invoice belongs to the session's org is a textbook IDOR. Scope the query, don't validate the parameter.
- **Passing the session object into a Client Component.** RSC props are serialised into the payload the browser receives — so this publishes it. Pass only what the UI needs.
- **Assuming a Server Action is private** because no UI calls it.
- **Using `localStorage` for tokens.** Any token JavaScript can read is XSS-exfiltratable. `HttpOnly; Secure; SameSite=Lax` cookies, and prefer a session cookie with the tokens held server-side (the BFF pattern — see the OAuth & SSO and Web Security guides).
- **Not patching.** Given the history, pinning an old minor is itself the risk.

### 9.4 Layouts Do Not Re-Render on Every Navigation

A subtle and important one: an auth check in a **layout** runs when the layout renders, and a layout **persists** across navigations within its segment. So it does not re-verify on every client-side navigation to a child route. Authorization checks belong in the data layer and the page/action, not in a layout you assume runs each time.

---

## 10. `proxy.ts`

Next.js 16 renamed `middleware.ts` to **`proxy.ts`** to make the network boundary explicit, and it runs on the **Node.js runtime**.

```ts
// proxy.ts
import { NextResponse, type NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const session = request.cookies.get('session');
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*'] };
```

Migration is mechanical: rename the file and rename the exported function to `proxy`. `middleware.ts` still works for Edge-runtime cases but is **deprecated** and will be removed.

**What it's good for:** cheap redirects, rewrites, locale detection, A/B bucketing, adding headers, and rejecting obviously-bad requests before they reach a route. **What it must not be:** your only authorization check, or a place for heavy work — it runs on every matched request, so keep the `matcher` tight and the logic trivial.

---

## 11. Next.js 16 — What Changed

Released **21 October 2025**. The headline items:

- **Cache Components** with `"use cache"` — caching is now entirely opt-in, and PPR is folded into this model. The `experimental.ppr` flag and `export const experimental_ppr` were **removed**; `experimental.dynamicIO` was renamed to `cacheComponents`.
- **Turbopack is stable and the default bundler** for all apps: 2–5× faster production builds, up to 10× faster Fast Refresh. Opt out with `next dev --webpack` / `next build --webpack`. Filesystem caching is available in beta behind `experimental.turbopackFileSystemCacheForDev`.
- **`proxy.ts`** replaces `middleware.ts` (§10).
- **React Compiler support is stable** via `reactCompiler: true` — promoted out of `experimental`, though **not on by default**, and it increases build time because it runs through Babel.
- **React 19.2** features available in the App Router: `useEffectEvent`, `<Activity />`, View Transitions.
- **New caching APIs**: `updateTag()`, `refresh()`, and `revalidateTag(tag, profile)` — the single-argument form is deprecated.
- **Routing overhaul**: layout deduplication when prefetching (a page with 50 links downloads the shared layout once, not 50 times) and incremental prefetching that cancels requests when a link leaves the viewport.
- **Next.js DevTools MCP** — a Model Context Protocol integration giving AI agents access to your app's routing, caching and rendering behaviour, unified browser and server logs, and error stack traces.

**Breaking changes that bite on upgrade:**

- **`params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are all async** and must be awaited.
- **Node.js 20.9+**, **TypeScript 5.1+**, and a raised browser baseline (Chrome/Edge/Firefox 111+, Safari 16.4+).
- **`next lint` was removed** — run ESLint or Biome directly; `next build` no longer lints. Codemod: `npx @next/codemod@canary next-lint-to-eslint-cli .`
- **AMP support removed.** `serverRuntimeConfig`/`publicRuntimeConfig` removed — use env files.
- **Every parallel-route slot now requires an explicit `default.js`**; builds fail without one.
- **`next/image` defaults changed**: `minimumCacheTTL` 60s → 4 hours, `qualities` `[1..100]` → `[75]`, `16` removed from `imageSizes`, `maximumRedirects` capped at 3, local IP optimisation blocked by default, and local `src` with query strings now needs `images.localPatterns` (an enumeration-attack fix). `images.domains` is deprecated in favour of `remotePatterns`.
- **`@next/eslint-plugin-next` defaults to flat config**, aligning with ESLint dropping legacy config.

Use the codemod: `npx @next/codemod@canary upgrade latest`.

---

## 12. Performance

- **Push `'use client'` down.** The most effective bundle-size lever in the whole framework. Audit with `@next/bundle-analyzer` and look for a `'use client'` high in the tree.
- **`next/image`** — automatic responsive `srcset`, modern formats, lazy loading, and reserved space (no CLS). Set `priority` on your LCP image and `sizes` accurately, or you serve a needlessly large file.
- **`next/font`** — self-hosts the font at build time, so no third-party round trip, and injects fallback metrics to eliminate swap-induced layout shift.
- **`next/dynamic`** for genuinely heavy client components (a chart library, a rich text editor), with `ssr: false` where the component can't render server-side.
- **Don't fetch in a Client Component with `useEffect`** — that's a round trip *after* hydration, which is the waterfall RSC exists to remove. Fetch on the server, or use TanStack Query if the data is genuinely client-owned and interactive.
- **`Promise.all` or promise-passing** to overlap independent requests (§6.5).
- **Cache deliberately.** With Cache Components everything is dynamic by default, so a page that could be static and isn't is now an explicit omission rather than a default.

---

## 13. Common Pitfalls

- **`'use client'` at the top of the tree**, defeating RSC entirely.
- **Passing an ORM object across the boundary** — it has a prototype and won't serialise; map to a DTO.
- **Over-passing props** — the whole `user` record when you needed `user.name`, leaking the rest into the page payload.
- **Forgetting `await`** on `params`, `searchParams`, `cookies()`, `headers()`.
- **`useEffect` data fetching** in a Client Component when a Server Component would do.
- **Authorising in `proxy.ts` only** (§9).
- **Assuming a Server Action is private.**
- **`revalidateTag` where you needed `updateTag`** — the "I saved it but it shows the old value" bug.
- **Reaching for a Route Handler** when a Server Component could fetch directly.
- **Assuming a layout's auth check runs on every navigation** — layouts persist.
- **Using RSC for a heavily interactive app.** A real-time trading dashboard or a design tool is mostly client state; RSC adds ceremony and gives little back. Be willing to say Next.js isn't always the answer.


---

## 14. Interview Questions & Answers

### Beginner

---

**Q1: What is the difference between Server Components and SSR?**

They're different mechanisms that both involve a server, and conflating them is the fastest way to lose this round.

**SSR** runs your component on the server to produce **HTML**, sends that HTML for a fast first paint, and then **ships the same component code to the browser** so React can hydrate and make it interactive. The JavaScript for that component is in your bundle.

**Server Components** run on the server and their **code never reaches the browser at all**. The output isn't HTML — it's the **RSC payload**, a serialised React tree containing rendered host elements plus "holes" pointing at Client Component bundles and their serialised props.

The practical consequences:

- **Bundle size.** A Server Component using a 300 KB markdown parser ships **none** of it. An SSR'd component using the same library ships all of it. This is why moving a component to the server is a bundle fix rather than a rendering trick.
- **Interactivity.** An SSR'd component hydrates and can hold state. A Server Component renders **once per request** and is then finished — no state, no effects, no event handlers.
- **Data access.** A Server Component can `await db.query(...)` directly. No API route, no loading state.
- **Navigation.** A client-side navigation fetches a *new payload* which React reconciles into the existing tree, so client state elsewhere survives.

They compose: Next.js SSRs the initial page (so there's HTML for the first paint and for crawlers) *and* uses RSC to decide what code the browser ever downloads.

---

**Q2: What does `'use client'` actually do?**

It marks an **entry point into the client graph** — not a single component.

Everything that file imports, and everything *those* files import transitively, becomes part of the client bundle. That's the property people misjudge: putting `'use client'` on a layout near the top of the tree pulls the whole subtree into the client bundle and defeats the point of RSC.

Two related facts: components in the App Router are **Server Components by default**, so you opt *into* the client rather than out of it. And the directive must be the **first statement in the file**.

The discipline that follows is to push the boundary **down** — put `'use client'` on the smallest component that genuinely needs state, an effect, an event handler or a browser API, as deep in the tree as possible. Then use the composition trick: a Client Component can't `import` a Server Component, but it **can render one passed as `children`**, because the server rendered it and only the payload crosses the boundary. That's how you keep an interactive shell thin while the heavy data-driven content stays on the server.

---

**Q3: How has caching in Next.js changed, and what's the model now?**

The direction of travel is the answer: Next moved from **implicit caching that surprised you** to **explicit caching you ask for**.

- **Next 13–14**: `fetch` was cached by default, on top of an implicit Router Cache, Full Route Cache and Data Cache. Powerful, and a notorious source of "why is my data stale?"
- **Next 15**: `fetch` became **uncached** by default.
- **Next 16**: **Cache Components.** Caching is entirely opt-in via the `"use cache"` directive; all dynamic code in a page, layout or route runs at request time by default.

```ts
async function getProducts(category: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(`products-${category}`);
  return db.products.findMany({ where: { category } });
}
```

`"use cache"` works on a function, a component or a whole file, and the compiler derives the cache key automatically. `cacheLife` sets the freshness profile; `cacheTag` attaches invalidation tags.

Then the three invalidation APIs, which have genuinely different semantics:

- **`revalidateTag(tag, profile)`** — stale-while-revalidate. Users get cached data immediately, revalidation happens in the background. The profile argument is now required.
- **`updateTag(tag)`** — Server Actions only, **read-your-writes**: expires and re-reads within the same request, so the user sees their own change immediately.
- **`refresh()`** — Server Actions only, refreshes **uncached** data without touching the cache.

Getting this wrong produces a specific, recognisable bug: using `revalidateTag` where you needed `updateTag` gives you "I saved it but it still shows the old value," because SWR served the stale copy back.

---

### Intermediate

---

**Q4: How would you handle authentication in the App Router with Server Components?**

**Defence in depth, and never trust the proxy layer alone.** That's the whole answer, and the CVE history makes the argument for me.

`middleware.ts` became **`proxy.ts`** in Next 16. It runs before route processing and is the right place for a cheap early redirect. It is explicitly **not** an authorization solution, and it has been bypassable more than once: **CVE-2025-29927** let a crafted `x-middleware-subrequest` header skip middleware entirely, taking every middleware-based check with it; **CVE-2026-45109** was an incomplete fix for a segment-prefetch bypass; **CVE-2026-64642** was a proxy bypass on Turbopack App Router builds, patched in 16.2.11.

So the layers:

1. **`proxy.ts`** — cheap redirect for obviously-unauthenticated requests. A UX optimisation.
2. **A Data Access Layer** — every function that reads or writes sensitive data calls `verifySession()` itself, right next to the data. **This is the actual boundary**, and it's robust precisely because it isn't in the request pipeline, so a pipeline bypass can't skip it.
3. **Every Server Action and Route Handler** authenticates and authorises independently.
4. **The payload** — never pass a session or secret as a prop to a Client Component.

```ts
import 'server-only';
export const verifySession = cache(async () => {
  const token = (await cookies()).get('session')?.value;
  return token ? decryptAndValidate(token) : null;
});

export async function getInvoices() {
  const session = await verifySession();
  if (!session) throw new Error('Unauthorised');
  return db.invoices.findMany({ where: { orgId: session.orgId } });  // scope the QUERY
}
```

Three details that distinguish a good answer. Wrap `verifySession` in React's **`cache()`** so one request verifies once even if ten components ask. Use **`import 'server-only'`** so the module can never be pulled into a client bundle — that turns a hope into a build error. And **scope the query to the session** rather than validating an ID from the caller, because `getInvoice(params.id)` without an ownership check is a textbook IDOR.

One subtle trap worth volunteering: **layouts persist across navigations**, so an auth check in a layout does *not* re-run on every client-side navigation to a child route. Authorization belongs in the data layer, not in a layout you assume runs each time.

---

**Q5: What is Partial Pre-rendering and what problem does it solve?**

Before PPR, a route had to be entirely static or entirely dynamic. One personalised element — the user's name in the header — forced the whole route dynamic, so every visitor paid for a full server render of markup that was identical for everyone.

PPR dissolves that. Next renders the **static shell** at build time, stopping at your `Suspense` boundaries, and that shell ships from the CDN edge immediately. The **dynamic holes stream in per request**.

```tsx
export default function Page() {
  return (
    <>
      <StaticHeader />                     {/* prerendered, edge-cached */}
      <Suspense fallback={<UserSkeleton />}>
        <PersonalisedGreeting />           {/* streams per request */}
      </Suspense>
    </>
  );
}
```

You get static-site latency with dynamic-page capability — excellent LCP with no server round trip for the layout.

Two things to add. Underneath, this is React 19.2's `prerender`/`resume` API: `prerender()` with an `AbortController` returns the static HTML plus a serialisable "postponed" state, and `resume()` finishes the render later. So the React question and the framework question have the same answer. And in **Next.js 16 the standalone `experimental.ppr` flag was removed** — PPR is folded into the **Cache Components** model, so the way you opt in now is `cacheComponents: true` plus `"use cache"` where you want caching, with everything else dynamic by default.

This is also the answer to "how do you cache personalised data at the CDN?" — you don't. The shell is cacheable and public; the personalised part is `private` and streams per request.

---

**Q6: What are the rules for passing props from a Server Component to a Client Component?**

The boundary is a **wire**, so props are **serialised**. They must be serialisable, and the enforcement is at runtime.

**Can cross:** primitives, `null`/`undefined`, plain objects and arrays, `Date`, `Map`, `Set`, `BigInt`, `RegExp`, JSX elements, Promises (React unwraps them), and **Server Actions** — the one "function" that can cross, because what's serialised is a reference rather than the code.

**Cannot cross:** functions, class instances, Symbols, and anything with methods you intend to call.

The most frequent real failure is passing an **ORM object** straight through — a Mongoose document or Prisma result with a `Decimal` looks like a plain object but carries a prototype full of methods. Map to a plain DTO at the boundary.

Then the point I'd make unprompted, because it's a security issue rather than a typing one: **every prop you pass is serialised into the payload the browser downloads.** Passing the whole `user` record because you needed `user.name` publishes the email, the role and possibly the password hash into the page source, where anyone can read it. Mapping to a DTO isn't just about serialisability — it's how you avoid leaking fields the client should never see.

Two related mechanics: a Client Component can't `import` a Server Component but can render one passed as `children`; and `import 'server-only'` gives you a build-time error if a server module ever ends up in the client graph.

---

### Advanced

---

**Q7: When would you *not* use Next.js or RSC?**

Being able to answer this is what separates someone who has used it from someone who has adopted it.

**Heavily interactive applications.** A trading dashboard, a design tool, a collaborative editor, a video editor — these are almost entirely client state, with real-time updates and complex local interaction. RSC gives you very little (there's no meaningful server-rendered content to stream) and costs you ceremony: every component needs `'use client'`, and you're paying for a framework whose main advantage you can't use. A Vite SPA is simpler and faster to develop.

**Applications behind a login with no SEO requirement**, where the first paint isn't commercially critical. The main RSC wins — crawlability, fast LCP for anonymous visitors, streaming a mostly-static page — mostly don't apply. Bundle-size reduction still does, so it's a judgement call rather than a clear no.

**When you need to self-host on constrained infrastructure.** Next runs anywhere, but the good experience (edge caching, ISR, image optimisation, streaming) assumes infrastructure that resembles Vercel's. Teams that self-host on a single container often find they're maintaining a lot of framework for features they've disabled.

**When the team doesn't have the model.** The server/client boundary, the caching semantics and the serialisation rules are genuine new concepts. A team shipping a straightforward CRUD app on a deadline will move faster with a Vite SPA plus TanStack Query than they will learning three caching APIs. That's an engineering-management answer, and interviewers respect it.

**A mostly-static content site** may be better served by Astro, which ships zero JS by default and treats interactivity as the exception rather than the rule.

What I *would* use it for: content-heavy and commerce sites where SEO and LCP are revenue, apps with a large amount of server-owned data and modest interactivity, and anywhere the bundle-size win from keeping heavy dependencies server-side is material.

---

**Q8: Your App Router page has a 4-second TTFB. Walk me through diagnosing and fixing it.**

TTFB in the App Router is almost always **waiting on data**, so I'd work from the request timeline inward.

**1. Find where the time goes.** Next 16's dev logs split each request into *Compile* and *Render*, which immediately tells me whether it's my code or the build. In production I'd want tracing — a span per data fetch — because "the page is slow" and "one query is slow" need different fixes.

**2. Look for waterfalls.** The most common cause is sequential awaits:

```tsx
const user = await getUser(id);      // 800ms
const posts = await getPosts(id);    // 900ms  → 1.7s total
const stats = await getStats(id);    // 1.2s   → 2.9s total
```

Fix in two stages. `Promise.all` makes the total the *max* rather than the sum. Better still, **start the fetches without awaiting and pass the promises down** into separate `Suspense` boundaries — then the shell paints immediately and each section streams in when its own data is ready, which fixes the *perceived* problem even if total time is unchanged.

**3. Check for a blocking layout.** An `await` in a nested layout blocks every segment beneath it. Layouts and pages render in parallel where they can, but data fetched in a layout gates its children.

**4. Check whether anything is cached.** With Cache Components everything is dynamic by default, so a page that could be cached and isn't is now an explicit omission. Add `"use cache"` with an appropriate `cacheLife` to the genuinely cacheable parts, and consider whether the page should be PPR-shaped: static shell at the edge, personalised holes streaming.

**5. Check the data layer itself.** A missing index, an N+1 from a per-row query inside a `.map`, or a slow third-party API. `cache()` around a repeated query — a session lookup called by ten components — collapses it to one call.

**6. Check the runtime and placement.** A cold serverless start on a heavy bundle, or a function in a region far from the database. Co-locating compute with data often halves TTFB on its own, and that's frequently the real answer for a self-hosted or multi-region setup.

The framing I'd end on: **streaming changes the goal.** With `Suspense`, you don't need the whole page fast — you need the *shell* fast. Often the correct fix isn't making the 4-second query faster, it's making sure the user sees a complete, useful page in 200 ms with one section still loading.

---

## 15. Tricky Questions

---

**Q1: This builds fine and throws at runtime. What's the error and why?**

```tsx
// app/dashboard/page.tsx  (Server Component)
export default async function Page() {
  const user = await db.users.findUnique({ where: { id: 1 } });
  return <Profile user={user} onSave={(d) => db.users.update(d)} />;
}

// components/Profile.tsx
'use client';
export function Profile({ user, onSave }) { /* … */ }
```

**Answer:** `Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".` And separately, passing the whole `user` object leaks every field into the page payload.

**Explanation:**

Two bugs, and the second is worse.

**The error** comes from the boundary being a **wire**. Props from a Server Component to a Client Component are serialised into the RSC payload, and a function has no serialisation — its closure lives in server memory. The only "function" that can cross is a **Server Action**, and what actually crosses is a *reference* (an ID the client posts back to), not the code:

```tsx
// app/actions.ts
'use server';
export async function saveUser(data: FormData) {
  const session = await verifySession();          // it's a PUBLIC endpoint
  if (!session) throw new Error('Unauthorised');
  /* validate, authorise, mutate */
}

// page.tsx — now serialisable
<Profile user={toDto(user)} onSave={saveUser} />
```

**The silent bug** is `user={user}`. Everything you pass is serialised into the payload the browser downloads, so if `Profile` renders only `user.name`, you have still published `user.email`, `user.role`, `user.stripeCustomerId` and quite possibly `user.passwordHash` into the page source. View-source reveals all of it. This is one of the most common RSC data leaks, and nothing warns you — it works perfectly.

The fix is to map to a DTO at the boundary, which also solves a *third* problem lurking here: an ORM result is a **class instance** with a prototype (and possibly `Decimal` fields), so it often fails to serialise anyway.

```tsx
const dto = { id: user.id, name: user.name };   // exactly what the UI needs
```

Worth adding: `import 'server-only'` in your data module turns "I hope nobody imports this client-side" into a build error, and it's the cheapest security control in this stack.

**Takeaway:** the server/client boundary serialises props, so functions can't cross (only Server Actions, as references) — and because every prop is serialised into the payload the browser receives, passing whole records leaks fields the UI never renders.

---

**Q2: A user updates their profile. The action succeeds, the database is correct, and the page still shows the old name. `revalidateTag` is being called. Why?**

```ts
'use server';
export async function updateProfile(id: string, data: Profile) {
  await db.users.update(id, data);
  revalidateTag(`user-${id}`, 'max');
  return { ok: true };
}
```

**Answer:** `revalidateTag` gives **stale-while-revalidate** semantics — the user is served the cached (stale) copy immediately while revalidation happens in the background. For read-your-writes you need `updateTag`.

**Explanation:**

The three Next.js 16 invalidation APIs look interchangeable and are not:

| API | Semantics | Where |
|---|---|---|
| `revalidateTag(tag, profile)` | **stale-while-revalidate** — serve stale now, refresh in background | anywhere |
| `updateTag(tag)` | **read-your-writes** — expire and re-read *in the same request* | Server Actions only |
| `refresh()` | refresh **uncached** data only; doesn't touch the cache | Server Actions only |

`revalidateTag` is designed for **eventual consistency**: perfect for a blog post or a product catalogue, where a few seconds of staleness is invisible and you want every reader to get an instant response. It is exactly wrong for the user's *own* mutation, because the one person who must see the change immediately is the person who made it — and SWR hands them the stale copy.

```ts
'use server';
export async function updateProfile(id: string, data: Profile) {
  await db.users.update(id, data);
  updateTag(`user-${id}`);        // expire + re-read now
  return { ok: true };
}
```

The user-visible symptom is worth recognising because it's so specific: **"I saved it, the page reloaded, and it shows the old value — but if I refresh again it's correct."** That second refresh is the background revalidation having landed.

Two related notes. The **single-argument `revalidateTag(tag)` form is deprecated** in Next 16 — the `cacheLife` profile is now required, and `'max'` is the recommended default for long-lived content. And `refresh()` is the right choice when the thing you need to update was never cached at all: a notification count, a live status indicator. Reaching for `revalidateTag` there does nothing useful, because there's no cache entry to invalidate.

**Takeaway:** `revalidateTag` is eventual consistency (stale-while-revalidate), `updateTag` is read-your-writes within the same request, and `refresh()` is for uncached data — using the first where you needed the second is the "I saved it but it shows the old value" bug.

---

**Q3: Your `proxy.ts` correctly redirects unauthenticated users away from `/admin`. A penetration test still reads admin data. How?**

**Answer:** The request-interception layer is bypassable, and it has been bypassed by real CVEs more than once. If `proxy.ts` is the only check, bypassing it removes *all* authorization.

**Explanation:**

Next's own documentation says middleware/proxy is not a complete authorization solution, and the history shows why:

| CVE | Bypass |
|---|---|
| **CVE-2025-29927** | A crafted `x-middleware-subrequest` header made a request **skip middleware entirely** |
| **CVE-2026-45109** | Incomplete fix for a **segment-prefetch** bypass — patched in 15.5.18 / 16.2.6 |
| **CVE-2026-64642** | **Proxy bypass** on App Router builds using Turbopack — patched in 16.2.11 |

But even with every patch applied, the architecture is wrong. `proxy.ts` guards *route navigation*. It does not guard:

- **Server Actions**, which are public HTTP endpoints reachable by their generated ID. No UI needs to call one for an attacker to invoke it.
- **Route Handlers** that don't match your `matcher`.
- **RSC payload requests** for a segment, which are a distinct request shape.
- Anything reached by a path your `matcher` regex didn't anticipate.

The fix is to make authorization **not live in the request pipeline at all**:

```ts
// lib/dal.ts
import 'server-only';
export const verifySession = cache(async () => { /* … */ });

export async function getAdminStats() {
  const session = await verifySession();
  if (session?.role !== 'admin') throw new Error('Forbidden');   // THE boundary
  return db.stats.aggregate();
}
```

Now a pipeline bypass reaches a route whose data functions still refuse to return anything. `proxy.ts` becomes what it should be — **a UX optimisation** that saves an unauthenticated user a wasted page load — and the Data Access Layer is the security boundary.

Two more things I'd check on that pen-test finding. **Is the query scoped to the session, or is it trusting an ID from the caller?** `getInvoice(params.id)` with no ownership check is an IDOR regardless of how well the route is guarded. And **is anything sensitive being passed as a prop to a Client Component?** Those props are serialised into the payload the browser downloads, so a perfectly-guarded route can still publish admin data into the page source.

And given the history: **keep Next patched.** Pinning an old minor is itself the risk here.

**Takeaway:** `proxy.ts`/middleware guards route navigation and has been bypassable by multiple CVEs, and it never covered Server Actions or RSC payload requests — put authorization in a Data Access Layer that every read and write calls, so a pipeline bypass reaches functions that still say no.

---

**Q4: Moving a component behind `'use client'` for one `onClick` grew the bundle by 180 KB. The component is 40 lines. Why?**

**Answer:** `'use client'` marks an **entry point into the client graph**, not a single component. Everything the file imports — transitively — is pulled into the client bundle.

**Explanation:**

```tsx
'use client';                                    // ← entry point to the client graph

import { formatDate } from 'date-fns';           // pulled in
import { parseMarkdown } from 'marked';          // pulled in
import { ProductTable } from './ProductTable';   // pulled in — AND its imports
import { chartConfig } from '../lib/charts';     // pulled in — AND its imports

export function ProductPanel({ data }) {
  const [open, setOpen] = useState(false);
  return <button onClick={() => setOpen(!open)}>…</button>;
}
```

The 40 lines are irrelevant. The transitive import graph is what ships, and one `'use client'` file that imports a chart library and a markdown parser sends both to every visitor — even though the only client-side behaviour needed was a boolean toggle.

Worse, this **cascades downward**: every component rendered by a `'use client'` file is now part of the client graph too, whether or not it needs to be. Putting the directive on a layout near the root converts the entire subtree to client rendering and eliminates the main benefit of RSC.

The fix is to **push the boundary down** to the smallest interactive unit and use the composition pattern:

```tsx
// app/product/page.tsx — Server Component; heavy imports stay server-side
import { parseMarkdown } from 'marked';

export default async function Page({ params }) {
  const data = await getProduct((await params).id);
  return (
    <Disclosure>                                       {/* 'use client', ~1 KB */}
      <ProductTable rows={data.rows} />                {/* stays SERVER */}
      <div dangerouslySetInnerHTML={{ __html: parseMarkdown(data.body) }} />
    </Disclosure>
  );
}
```

A Client Component can't `import` a Server Component, but it **can render one passed as `children`** — the server renders it and only the payload crosses the boundary. So `Disclosure` owns the `useState` and ships a kilobyte; `marked` and `ProductTable` never reach the browser.

How to find these: `@next/bundle-analyzer`, looking for a `'use client'` high in the tree. The heuristic that catches most of it — **the directive belongs on leaves, not on branches.**

**Takeaway:** `'use client'` is an entry point to the client graph, so the whole transitive import tree ships and every descendant becomes client-rendered — put it on the smallest interactive leaf and pass server-rendered content in as `children`.

---

## 16. Cheat Sheet

```
THE MODEL
 1. RSC ≠ SSR. SSR renders on the server AND ships the component code to hydrate.
    Server Component code NEVER reaches the browser.
 2. The RSC payload is a serialised React tree, not HTML — which is why client-side
    navigation preserves client state.
 3. Server Components render ONCE per request. No state, no effects, no handlers,
    no context consumption, no React.memo.
 4. Components are Server Components BY DEFAULT in the App Router.

THE BOUNDARY
 5. 'use client' is an ENTRY POINT to the client graph — the whole transitive import
    tree ships, and every descendant becomes client-rendered.
 6. Put it on LEAVES, not branches. Audit with @next/bundle-analyzer.
 7. A Client Component cannot IMPORT a Server Component, but CAN render one passed
    as children. This is the most useful composition pattern in the framework.
 8. Props are SERIALISED. No functions (except Server Actions), no class instances
    (map ORM results to DTOs), no symbols.
 9. Every prop is serialised into the payload the BROWSER DOWNLOADS. Passing a whole
    user record leaks every field into the page source.
10. import 'server-only' → build error if a server module reaches the client graph.
    Cheapest security control in the stack.

ROUTING
11. layout persists across navigation (state survives, doesn't re-render);
    template REMOUNTS every navigation.
12. params, searchParams, cookies(), headers(), draftMode() are ALL ASYNC — await them.
13. Route groups (name) organise without a URL segment. @slot = parallel routes.
    (.)path = intercepting routes (modal with a shareable URL).
14. Every parallel-route slot needs an explicit default.js in Next 16 or the build fails.
15. Route Handlers for webhooks, OAuth callbacks, uploads, non-browser clients, and
    specific response types. Not for "get data for my own page."

CACHING (the direction: implicit → explicit)
16. Next 13-14 cached fetch by default. Next 15 stopped. Next 16 = opt-in only.
17. cacheComponents: true, then "use cache" on a function, component, or file.
    cacheLife('hours') for freshness, cacheTag('x') for invalidation.
18. revalidateTag(tag, profile) = stale-while-revalidate (eventual consistency).
    The single-argument form is DEPRECATED.
19. updateTag(tag) = READ-YOUR-WRITES, Server Actions only. Use for forms/settings.
20. refresh() = refresh uncached data only, Server Actions only.
21. Wrong choice → "I saved it but it shows the old value" (revalidateTag where
    updateTag was needed).
22. cache() from react around non-fetch work (session lookup, DB query) dedupes it
    per request.
23. Promise.all to overlap; better, pass promises into separate Suspense boundaries
    so each section streams when its own data is ready.
24. An await in a nested LAYOUT blocks every segment beneath it.

SERVER ACTIONS
25. A SERVER ACTION IS A PUBLIC HTTP ENDPOINT. Authenticate, validate, authorise in
    EVERY one. Hidden UI is not access control.
26. They progressively enhance — <form action={fn}> works before hydration.
27. They're queued, not parallel. Not for bulk work. Not for reads.
28. Pair with useActionState (pending/error) and useOptimistic (instant feedback +
    a rollback path).

AUTH — DEFENCE IN DEPTH
29. proxy.ts (was middleware.ts, Next 16, Node runtime) = cheap early redirect.
    A UX OPTIMISATION, NOT A SECURITY BOUNDARY.
30. CVE-2025-29927 (x-middleware-subrequest skipped middleware entirely),
    CVE-2026-45109 (segment-prefetch bypass), CVE-2026-64642 (Turbopack App Router
    proxy bypass). The pipeline has been bypassable more than once.
31. THE boundary is a Data Access Layer: every read/write calls verifySession()
    itself, wrapped in cache(), in a module marked 'server-only'.
32. SCOPE THE QUERY to the session. Don't validate an ID from the caller (IDOR).
33. Layouts PERSIST — an auth check in a layout does not re-run on every navigation.
34. HttpOnly; Secure; SameSite=Lax cookies. Never localStorage for tokens.
35. Keep Next patched. Given the CVE history, pinning an old minor IS the risk.

RENDERING
36. PPR: static shell at build (stops at Suspense boundaries) + dynamic holes
    streamed per request. Static latency, dynamic capability.
37. Underneath PPR is React 19.2's prerender() + resume().
38. Next 16 REMOVED experimental.ppr and export const experimental_ppr —
    it's folded into Cache Components.
39. Streaming changes the goal: you need the SHELL fast, not the whole page.
40. error.tsx must be a Client Component and gets reset(). A streamed error cannot
    change the status code — the 200 is already sent.

NEXT 16
41. Turbopack is stable and DEFAULT (2-5x builds, up to 10x Fast Refresh).
    Opt out: next build --webpack.
42. reactCompiler: true is stable but NOT on by default (adds Babel build time).
43. Layout deduplication on prefetch + incremental prefetching (cancels on
    viewport exit).
44. Next.js DevTools MCP for AI-assisted debugging.
45. Removed: next lint, AMP, serverRuntimeConfig/publicRuntimeConfig.
    Node 20.9+, TypeScript 5.1+, Safari 16.4+ baseline.
46. next/image defaults changed: minimumCacheTTL 60s → 4h, qualities → [75],
    maximumRedirects → 3, local IPs blocked, images.domains deprecated.
47. Upgrade with npx @next/codemod@canary upgrade latest.

WHEN NOT TO USE IT
48. Heavily interactive apps (trading dashboards, editors, design tools) — almost
    all client state, RSC gives little and costs ceremony. Use a Vite SPA.
49. Behind-login apps with no SEO need — the main wins don't apply (bundle size
    still does, so it's a judgement call).
50. Constrained self-hosting — the good experience assumes Vercel-like infrastructure.
51. A team on a deadline without the mental model will ship faster with Vite +
    TanStack Query. That's a legitimate engineering answer.
52. A mostly-static content site may be better with Astro (zero JS by default).
```

---

## 17. References

- [Next.js Docs — App Router](https://nextjs.org/docs/app) — the authoritative reference
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16) — Cache Components, Turbopack, `proxy.ts`, breaking changes
- [Next.js — Authentication Guide](https://nextjs.org/docs/app/guides/authentication) — the Data Access Layer pattern
- [Next.js — Upgrading to Version 16](https://nextjs.org/docs/app/guides/upgrading/version-16) — the migration checklist
- [React Docs — Server Components](https://react.dev/reference/rsc/server-components)
- [React Docs — `'use client'`](https://react.dev/reference/rsc/use-client) and [`'use server'`](https://react.dev/reference/rsc/use-server)
- [React Docs — `cache()`](https://react.dev/reference/react/cache) — request-level memoisation
- [Making Sense of React Server Components](https://www.joshwcomeau.com/react/server-components/) — the clearest conceptual explanation available
- [CVE-2025-29927 — Next.js middleware bypass](https://nvd.nist.gov/vuln/detail/CVE-2025-29927) — the authorization lesson, in primary-source form
- [Vercel Security Changelog](https://vercel.com/changelog) — where the Next.js security releases are announced
- [Partial Prerendering](https://nextjs.org/docs/app/getting-started/partial-prerendering)
