const e=`# Frontend System Design — Complete Guide

Frontend system design interviews ask: given a product like Netflix, Twitter, Zoom, or Google Meet, design the **client-side** architecture. The interviewer wants to see how you think about UI architecture, state management, data fetching, performance, caching, real-time updates, offline behavior, and engineering trade-offs at scale.

This guide walks the framework, then applies it to seven canonical designs and a Tabs HLD plus dedicated sections on live messaging and streaming under poor network — exactly the kind of asks Senior/Staff frontend interviews end on.

## Table of Contents

- [1. The Framework](#1-the-framework)
- [2. Requirements Gathering — What to Ask](#2-requirements-gathering-what-to-ask)
- [3. High-Level Architecture Pieces](#3-high-level-architecture-pieces)
- [4. State Management Trade-offs](#4-state-management-trade-offs)
- [5. Data Fetching Patterns](#5-data-fetching-patterns)
- [6. Real-Time Patterns](#6-real-time-patterns)
- [7. Performance and Caching](#7-performance-and-caching)
- [8. Accessibility, i18n, Theming](#8-accessibility-i18n-theming)
- [9. Design: Netflix — Video Streaming Frontend](#9-design-netflix-video-streaming-frontend)
- [10. Design: Twitter / Facebook Feed](#10-design-twitter-facebook-feed)
- [11. Design: Zoom / Google Meet — Video Conferencing](#11-design-zoom-google-meet-video-conferencing)
- [12. Design: Live Chat / Messaging (WhatsApp-style)](#12-design-live-chat-messaging-whatsapp-style)
- [13. Design: Streaming Under Poor Network](#13-design-streaming-under-poor-network)
- [14. Design: Pinterest — A Masonry Image Grid](#14-design-pinterest-a-masonry-image-grid)
- [15. HLD: A Reusable Tabs Component](#15-hld-a-reusable-tabs-component)
- [16. Interview Questions & Answers](#16-interview-questions-answers)
- [17. Tricky Scenarios](#17-tricky-scenarios)
- [References](#references)

---

## 1. The Framework

Frontend system design interviews follow a predictable rhythm. Use it.

1. **Clarify the problem.** Don't dive into "I'll use React" before asking what we're building. Ask about users, devices, scale, key features, and non-functional requirements.
2. **Define functional + non-functional requirements.** Pick 3–5 functional asks. List the non-functionals (performance budgets, offline behavior, a11y, i18n).
3. **High-level architecture.** Draw the boxes: client app, API layer, real-time transport (if any), CDN, third-party services.
4. **Data model.** What does the client store? Normalized? Cached?
5. **Component hierarchy.** Sketch the top 3 levels of components.
6. **State management.** Server state vs client state vs URL state vs form state.
7. **Data fetching strategy.** REST vs GraphQL, polling vs SSE vs WebSocket, optimistic UI, caching.
8. **Performance optimizations.** Code splitting, virtualization, image strategy, prefetch, debounce, memoization.
9. **Cross-cutting concerns.** Auth, error handling, accessibility, i18n, analytics, A/B testing.
10. **Trade-offs and what you'd do at scale.** Be explicit about why you chose X over Y.

The trap most candidates fall into: spending 30 minutes on the boxes-and-arrows diagram and never getting to performance, real-time, or trade-offs. Aim for **5 min clarify, 10 min architecture, 25 min everything else.**

---

## 2. Requirements Gathering — What to Ask

A senior signal is asking the right questions FIRST. A junior signal is jumping to a tech stack.

**Functional questions:**
- Who are the users? (Logged-in users, anonymous browsers, both?)
- What's the primary device? (Desktop, mobile web, tablet, smart TV?)
- What are the top 3 features in scope? (Feed scroll, post creation, comments? Or just the feed?)
- Read-heavy or write-heavy?
- Real-time or eventual-consistency okay?

**Non-functional questions:**
- Scale: how many DAU (daily active users), requests per second, content size?
- Latency budget: 200ms FCP (First Contentful Paint — when anything first appears)? 1s LCP (Largest Contentful Paint — when the main content appears)? Measured at p95 (the time 95% of users beat), not the average?
- Offline support needed?
- Geographic distribution (CDN regions)?
- Accessibility level (WCAG 2.1 AA?)
- i18n (single-locale, RTL, dozens of languages)?
- Browsers/devices supported? (Modern only or IE11?)

**Constraints:**
- Is there a server team building the API, or do I design both?
- What's the existing stack (forces a particular framework)?

Spend 4–5 minutes here. Without these, you'll design the wrong system.

---

## 3. High-Level Architecture Pieces

Every frontend system design touches some subset of the pieces below. Name the ones your design needs and say why; the "why" is what separates a design from a list.

- **The app shell** — bundled JS/CSS served via CDN, with lazy-loaded routes, so the first visit downloads only the code for the page it lands on.
- **A state layer** — server state (cache) + client state (UI) + URL state. They are split because each has a different owner and lifetime (see §4).
- **An API layer** — REST or GraphQL. May go through a BFF (Backend for Frontend — a thin server owned by the frontend team) that aggregates several backend calls into the one shape a screen needs, so the client makes one round trip instead of five.
- **A real-time channel** — WebSocket (two-way), SSE (Server-Sent Events, one-way server-to-client over plain HTTP), or polling. Pick the simplest one that meets the latency and direction the feature needs (see §6).
- **A CDN** — for static assets and (often) cached API responses, because serving from an edge server near the user cuts network round-trip time, which no amount of client code can reduce.
- **Service worker** — a script the browser runs in the background, between your page and the network, so it can answer requests from a cache. It is what makes offline mode, installable PWAs (progressive web apps) and push notifications possible.
- **Third-party services** — analytics, error tracking, A/B testing, feature flags, payments, video infrastructure.

Draw these as boxes connecting to the client. Be specific about which transport sits between the client and each box.

---

## 4. State Management Trade-offs

The most important slide in any frontend system design. Five flavors:

| State type | Examples | Best tool |
|---|---|---|
| **Server state** | Cached API responses, user profile, tweets, video metadata | TanStack Query, SWR, Apollo (GraphQL) |
| **Client state (UI)** | Modal open, sidebar collapsed, selected tab | React state, Zustand, Jotai |
| **URL state** | Active page, filter params, deep-link sharing | React Router params, \`URLSearchParams\` |
| **Form state** | Input values, validation, submit progress | React Hook Form, Formik, native \`<form>\` |
| **Real-time state** | Live cursor positions, presence, incoming messages | WebSocket subscription → cache |

**Senior signal:** distinguishing server state from client state. Server state has a server source of truth, async fetches, staleness, retries, background refresh, dedup. Client state is just "is this modal open?" These belong in DIFFERENT systems. Putting server state in Redux (the 2017 stack) is what TanStack Query exists to fix.

For most modern frontend system designs, the right answer is:
- **TanStack Query** (or Apollo for GraphQL) for server state — it gives you caching, request deduplication, background refetch and retries, which you would otherwise hand-write in a general store.
- **Zustand** or component state for UI state — UI state is small and synchronous, so it needs no middleware, and Zustand's selectors re-render only the components that read the changed value (plain Context re-renders every consumer).
- **React Router** for URL state — keeping filters and the active page in the URL makes them shareable, bookmarkable and survive a refresh for free.
- **React Hook Form** for forms — it keeps inputs uncontrolled by default, so typing does not re-render the whole form on every keystroke.

Redux is fine if existing infrastructure is heavily invested in it, but greenfield rarely justifies it.

---

## 5. Data Fetching Patterns

Decide three things:

### 1. Transport

- **REST** — simplest, cacheable at HTTP layer, well-tooled. Default choice.
- **GraphQL** — when clients need many different shapes of the same data (mobile wants compact response, web wants nested). Solves over-fetching/under-fetching at the cost of operational complexity.
- **gRPC-Web** — a browser version of gRPC, which sends compact binary messages defined by a shared schema instead of JSON. Worth it when payload size and latency are critical and you control both ends; the cost is that responses are no longer readable in the Network tab or cacheable by ordinary HTTP caches.

### 2. Strategy

- **Fetch-on-render** — request when component mounts. Easy but causes waterfalls (parent fetches → renders child → child fetches).
- **Fetch-then-render** — fetch all data first, then render. Slower TTI (Time to Interactive — when the page first responds to input), because nothing shows until the slowest request finishes, but no waterfalls.
- **Render-as-you-fetch** — start fetching at navigation (Route loaders, React Router data API, Suspense). Best UX; aligns with React Server Components.

### 3. Optimistic UI

For writes (post tweet, send message, like): update UI BEFORE the server confirms. Roll back on error. Critical for perceived latency in feeds and messaging.

\`\`\`js
// TanStack Query optimistic mutation
useMutation({
  mutationFn: (newTweet) => api.postTweet(newTweet),
  onMutate: async (newTweet) => {
    await queryClient.cancelQueries({ queryKey: ['tweets'] });
    const previous = queryClient.getQueryData(['tweets']);
    queryClient.setQueryData(['tweets'], (old) => [newTweet, ...old]);
    return { previous };
  },
  onError: (err, _newTweet, ctx) => queryClient.setQueryData(['tweets'], ctx.previous),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['tweets'] }),
});
\`\`\`

---

## 6. Real-Time Patterns

Five transports to know, when to pick each:

| Transport | Direction | Use case |
|---|---|---|
| **Short polling** | Client → Server | Simple, no server changes, but wasteful |
| **Long polling** | Server → Client | Server-push without WebSocket complexity (legacy fallback) |
| **SSE (Server-Sent Events)** | Server → Client only | Push-only feeds (notifications, live scoreboards). Auto-reconnect. |
| **WebSocket** | Bi-directional | Chat, multiplayer, real-time collaboration |
| **WebRTC DataChannel** | P2P | Sub-100ms latency, no server hop (video conferencing, real-time games) |

**Rule:** start with the simplest that fits. (Short polling asks "anything new?" on a timer; long polling asks and the server holds the request open until it has something to say.) SSE is almost always preferred over WebSocket when communication is one-way server-to-client, because it is an ordinary HTTP response that stays open: the browser reconnects automatically, it passes through proxies and load balancers that already understand HTTP, and your existing cookie auth applies. A WebSocket buys two-way messaging at the price of handling reconnection, heartbeats and auth yourself.

For chat-like fan-out at scale, the server has its own complexity (pub/sub fan-out, sticky sessions), but the client side is: open WebSocket → on message, update local cache → on disconnect, reconnect with exponential back-off + jitter → on reconnect, replay missed messages from a checkpoint.

See the Real-Time Web guide for the full transport comparison and reconnection patterns.

---

## 7. Performance and Caching

Don't recite this whole list in an interview. Pick the three or four items that attack your design's actual bottleneck — for a feed that is virtualization and images, for a dashboard it is bundle size and data fetching — and say what each one costs. The list is here so you can find them:

### Asset performance

- **Code splitting** — route-level and component-level. \`React.lazy\` + \`Suspense\`. Each route is its own chunk.
- **Tree shaking** — the bundler drops code you import but never call. It only works on ES modules (\`import\`/\`export\`), because those can be analysed without running them; that is why plain \`lodash\` (CommonJS) ships whole while \`lodash-es\` or per-method imports ship only what you use.
- **Image optimization** — WebP/AVIF, responsive \`srcset\`, lazy loading via \`loading="lazy"\`, image CDN (Cloudinary, Imgix).
- **Font strategy** — \`font-display: swap\` shows fallback text immediately instead of invisible text while the font loads; subsetting strips characters you never use; preload the fonts the first screen needs; a variable font replaces several weight files with one.
- **Critical CSS** — inline the CSS needed for the first screen in the HTML and load the rest later, because a stylesheet \`<link>\` blocks rendering until it downloads.
- **Bundle budget** — set explicit budgets (e.g., 170 KB JS gzipped at the route level).

### Runtime performance

- **Virtualization** — for long lists (feeds, comments), use \`react-window\` or \`@tanstack/react-virtual\`. Render only visible items.
- **Memoization** — \`useMemo\` / \`useCallback\` / \`React.memo\` to prevent unnecessary re-renders. Don't over-apply; profile first.
- **Concurrent features** — \`useTransition\` for non-urgent updates (filter typing while a heavy list re-renders), \`useDeferredValue\` to defer.
- **Debounce / throttle** — for search inputs, scroll handlers, resize listeners.
- **Web Workers** — for CPU-heavy work (JSON parsing of 5 MB payloads, image processing) off the main thread.

### Network performance

- **HTTP/2 or HTTP/3** — multiplexed requests over a single connection.
- **CDN** — for static assets and (when applicable) API responses.
- **Service Worker caching** — cache-first for build assets (when the filename carries a content hash, a new version gets a new name, so a cached copy is never out of date), network-first for API data (fresh when online, cached copy as the offline fallback), stale-while-revalidate for data where a slightly old answer now beats a fresh one later (serve the cache, update it in the background).
- **Compression** — Brotli > gzip.
- **Prefetch / preconnect** — \`<link rel="prefetch">\` for next-likely navigation, \`<link rel="preconnect">\` for third-party origins.

### Caching layers

\`\`\`
[Browser memory cache] (TanStack Query / Apollo)
        ↓
[Browser disk cache] (Cache API via Service Worker)
        ↓
[CDN edge cache]
        ↓
[Origin server / DB]
\`\`\`

Each layer has different invalidation rules. The closer to the user, the faster but harder to invalidate. Use cache headers (\`Cache-Control: max-age=...\`, \`ETag\`, \`Last-Modified\`) to coordinate.

---

## 8. Accessibility, i18n, Theming

Senior interviews probe these. Treat the list as a checklist to name in your design; the one-line reason after each item is what to say if asked "why".

- **Accessibility (WCAG 2.1 AA):** semantic HTML, proper heading order, \`alt\` text, keyboard navigation (focus management, focus traps in modals), ARIA attributes (only when semantic HTML isn't enough), color contrast ≥4.5:1 for body text, screen reader testing. Automated tools catch only part of this, which is why manual keyboard and screen-reader passes stay on the list.
- **i18n:** \`react-i18next\` or \`next-intl\` for translations, locale-aware date/number formatting (\`Intl.DateTimeFormat\`, \`Intl.NumberFormat\`), RTL support via \`dir="rtl"\` + logical CSS properties (\`margin-inline-start\` instead of \`margin-left\`), so one stylesheet flips correctly for right-to-left languages instead of needing a mirrored copy.
- **Theming:** CSS variables for colors, \`prefers-color-scheme\` for OS-based theme, persistent user preference in localStorage. CSS variables are the key choice: switching theme changes a few values on the root element instead of re-rendering components.

---

## 9. Design: Netflix — Video Streaming Frontend

**Problem:** design Netflix's home page and video player.

### Functional requirements

- Browse rows of videos grouped by category (Trending, Continue Watching, "Because you watched X").
- Click to view video detail / start playback.
- Search.
- Adaptive video playback that adjusts quality based on bandwidth.
- Multi-device: TV, mobile, web.

### Non-functional

- Time to interactive < 2s.
- Playback start < 1s after click.
- No buffering during steady playback.
- Works on slow 3G with degraded but usable experience.

### High-level architecture

\`\`\`
[CDN — static assets]      [Video CDN — HLS/DASH segments]
        │                          │
    [Client app] ──── REST/GraphQL ───→ [BFF API]
        │                                  │
    [Service worker]              [Recommendation service]
                                  [Catalog service]
                                  [Playback license service (DRM)]
\`\`\`

### Key design decisions

**Row-based feed rendering.** Each row is a horizontal carousel. Render only visible rows (vertical virtualization) and only visible thumbnails in a row (horizontal virtualization). On 4K TV with 50 rows × 30 items, that's 1500 thumbnails — without virtualization, the page would freeze.

**Hover preview.** Hovering a card after 500ms starts a low-res preview clip. Use \`IntersectionObserver\` to know which cards are visible; use a timeout-on-hover; preload preview metadata for visible cards only.

**Video player — adaptive bitrate (ABR).** This is THE Netflix engineering signal. The player downloads short video segments (2–10s) and chooses bitrate based on:
- Current network throughput (measured from prior segments).
- Buffer health (how many seconds of video are buffered ahead).

Standards: **HLS** (HTTP Live Streaming, Apple-driven, .m3u8 manifest) or **MPEG-DASH** (more flexible, .mpd manifest). Libraries: \`hls.js\`, \`shaka-player\`.

\`\`\`
Manifest:
  240p — 400 kbps
  480p — 1200 kbps
  720p — 2500 kbps
  1080p — 5000 kbps
  4K — 15000 kbps

Player:
  Start at low quality for fast playback start.
  Measure throughput from segment 1.
  Upgrade to higher quality if throughput sustains and buffer is healthy.
  Drop down if buffer drains.
\`\`\`

**DRM (Digital Rights Management).** The video segments are encrypted, and the player must fetch a license (the decryption key, issued only to an authorised user) before it can play them. Widevine, FairPlay and PlayReady are the DRM systems built into different browsers and devices (Google's, Apple's and Microsoft's respectively), so a service that plays everywhere supports all three. In the browser, the \`MediaSource\` API lets JavaScript feed segments to the \`<video>\` element, and EME (Encrypted Media Extensions) is the API that connects the player to the browser's built-in DRM module.

**Image strategy.** Each video has ~10 thumbnail sizes for different rows / breakpoints. Image CDN with \`srcset\`. Preload thumbnails for the next visible row. Use \`decoding="async"\` on \`<img>\` to avoid blocking.

**Pre-fetching the next item.** When the user hovers a card, prefetch the detail-page data. When they're 80% through an episode, prefetch the next episode's manifest.

**Continue Watching.** Server stores playback position per user-per-video. Client posts position every 10 seconds during playback. On reopen, resume from stored position.

**Trade-offs to mention:**
- Many small HTTP requests (segments) vs single large download — small requests enable ABR but add overhead. HTTP/2 multiplexing mitigates.
- DRM adds a hop before playback starts — careful sequencing to keep start time fast.
- Hover previews are expensive — disable on data-saver connections (Network Information API).

---

## 10. Design: Twitter / Facebook Feed

**Problem:** design Twitter's home timeline.

### Functional requirements

- Infinite scroll feed of tweets.
- Compose new tweet.
- Like / Retweet / Reply / Bookmark (write actions with optimistic UI).
- Real-time notifications for new tweets above the fold ("3 new tweets — click to refresh").
- Pull-to-refresh on mobile.

### Architecture

\`\`\`
[Client app] ──── GraphQL/REST ──→ [API Gateway / BFF]
       │                                  │
       │                              [Timeline service]
   [WebSocket / SSE]                  [Tweet write service]
       │                              [Media upload service]
   [Notification service]
\`\`\`

### Key design decisions

**Feed rendering: virtualized infinite scroll.**

\`@tanstack/react-virtual\` is the modern pick — it supports variable height (each tweet has different content length, optional images/video).

Two strategies:

1. **Window virtualization** (default). Render only the visible viewport + a small buffer above/below. Memory stays constant regardless of how far the user scrolls.

2. **Lazy load + cleanup**. Keep DOM nodes for a window (~50 tweets); recycle as user scrolls. Drop offscreen tweets from the DOM after a threshold.

Both work; virtualization is the canonical answer.

**Pagination — cursor-based, not offset.**

\`\`\`
GET /feed?cursor=abc123&limit=20
→ { tweets: [...], nextCursor: 'xyz789' }
\`\`\`

Offset pagination (\`?page=2\`) breaks when items are inserted at the top (every page shifts). Cursor pagination is stable.

**Optimistic UI for actions.**

Like a tweet → immediately flip the heart, increment count, update local cache. Server confirms in background. On failure, roll back and toast an error.

For posting a tweet: insert at top of feed with a "Posting…" indicator and a temporary client-side ID. Replace with the server's ID + timestamp once confirmed.

**Real-time "new tweets" pill.**

WebSocket or SSE pushes "new tweet IDs available." Don't auto-insert (scroll jumps are jarring). Show a pill: "3 new tweets — click to refresh." Click → prepend new tweets, smooth scroll to top.

**Caching the timeline.**

TanStack Query with \`staleTime: 30s\`. On focus, refetch in background. On navigating away and back, show stale data immediately, refetch silently.

For deep links to a tweet, fetch that tweet directly. Don't require loading the full timeline.

**Media uploads.**

Upload to a presigned S3 URL directly from the client (don't pipe through your API). Show upload progress with \`XMLHttpRequest\` (fetch doesn't support upload progress yet). On completion, POST the tweet with the S3 URL.

**Trade-offs to mention:**
- Push (WebSocket) vs pull (poll every 30s for new tweets) — push is more efficient at scale but requires connection management; pull is simpler. For 100M concurrent users, push wins; for a small product, pull is fine.
- Server-rendered (SSR) first paint vs client-rendered — feed apps benefit hugely from SSR for SEO (Twitter cards) and first paint, then hydrate.

---

## 11. Design: Zoom / Google Meet — Video Conferencing

**Problem:** design the frontend of a video conferencing app.

### Functional requirements

- Multi-party video + audio (4–50 participants).
- Screen sharing.
- Chat sidebar.
- Reactions (raise hand, emojis).
- Mute / camera toggle.

### Non-functional

- Sub-200ms audio/video latency.
- Survives flaky networks (drop video, keep audio).
- Echo cancellation, noise suppression.
- Works on weak devices (low-end laptops).

### Architecture

\`\`\`
[Client A] ←──── WebRTC P2P ─────→ [Client B]   (for 1:1 or small groups)
              (audio + video + data)

For larger groups (4+):
[Client] ←─ WebRTC ─→ [SFU server] ─ WebRTC ─→ [Other clients]
                          │
                  (Selective Forwarding Unit:
                   relays streams without
                   transcoding)

Plus:
[WebSocket signaling] — for connection setup, room state, chat
\`\`\`

### Key design decisions

**Why WebRTC.**

WebRTC gives you sub-100ms peer-to-peer audio/video without server-side video processing. Browsers handle the codec (Opus for audio, VP9/H.264/AV1 for video), echo cancellation, noise suppression, jitter buffer, congestion control.

The browser API:
\`\`\`js
const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
stream.getTracks().forEach(track => pc.addTrack(track, stream));
// Exchange SDP via signaling server
\`\`\`

**Signaling.**

WebRTC doesn't define how peers find each other. You provide a signaling channel (WebSocket) that exchanges:
- SDP (Session Description Protocol) offers and answers — what codecs each peer supports.
- ICE candidates — possible network paths between the two peers. Most devices sit behind a NAT (the router that shares one public IP address among a home or office network), so they don't know their own public address. A STUN server tells each peer what its public address looks like; when two NATs still refuse a direct connection, a TURN server relays the media instead, which always works but costs you server bandwidth.

**SFU vs mesh.**

For a 5-person meeting:
- **Mesh:** every peer connects to every other peer, so each person encodes and uploads their video once per other participant — 4 uploads each in a 5-person call — and the meeting as a whole carries 5×4=20 streams. Home upload bandwidth and laptop CPU run out first, which is why mesh is terrible past about 4 participants.
- **SFU (Selective Forwarding Unit):** each peer connects to a central server and uploads its video once. The server forwards each peer's stream to all others. Each client's upload stays constant however big the call gets. **This is what Zoom, Meet, and most production apps use.**

The frontend talks to ONE peer connection (the SFU); the SFU multiplexes streams. Open source SFUs: mediasoup, Janus, LiveKit, Jitsi.

**Adaptive video — simulcast.**

Each client uploads multiple resolutions of their stream (e.g., 180p, 360p, 720p). The SFU decides which resolution to send to each receiver based on the receiver's downlink. A receiver on weak network gets 180p of others; on strong network, 720p.

Without simulcast, a single weak receiver forces all senders to drop quality. With simulcast, each receiver gets what their connection can handle.

**Bandwidth adaptation.**

Monitor \`RTCStatsReport\`:
- Lost packets
- Round-trip time
- Available outgoing bitrate

When degraded:
1. Reduce video resolution (subscribe to lower simulcast layer).
2. Drop FPS (30 → 15).
3. Disable video, keep audio.

Audio is much smaller (Opus at 32 kbps) than video (300+ kbps). Killing video first is the correct degradation order.

**Screen share.**

\`\`\`js
const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
\`\`\`

Screen share is typically a separate stream/track from camera. Higher resolution, lower FPS (24fps is fine — screen content isn't motion-heavy).

**Echo cancellation, noise suppression.**

Browser does these automatically when \`getUserMedia\` is called with \`{ audio: true }\`. For better noise suppression, libraries like **RNNoise** (open source, ML-based) run a WASM model on the audio stream.

**UI considerations.**

- **Grid layout** — \`CSS Grid\` with \`grid-template-columns: repeat(auto-fit, minmax(...))\`. Or fixed layouts based on participant count.
- **Speaker view vs grid** — toggle between active-speaker (large video of whoever is speaking) and gallery view.
- **Pinning** — user can pin a participant; that pinned video is always large.
- **Network warning** — show a "Reconnecting…" overlay if WebRTC connection drops.

**Trade-offs:**
- P2P mesh is the simplest but doesn't scale past 4 participants.
- SFU is the production answer but requires server infrastructure.
- MCU (Multipoint Control Unit) transcodes all streams into one — minimizes bandwidth for receivers but is CPU-expensive and adds latency. Rarely used now; modern apps, Zoom included, use an SFU, which forwards each stream without decoding it (see "SFU vs mesh" above). MCUs survive mainly for recording and for bridging legacy SIP/H.323 room systems.

---

## 12. Design: Live Chat / Messaging (WhatsApp-style)

**Problem:** design the frontend of a real-time messaging app.

### Functional requirements

- 1:1 and group conversations.
- Send text, images, links.
- Typing indicators.
- Read receipts (sent → delivered → read).
- Offline support: messages queue while offline, send when back online.
- Push notifications when app is closed.

### Architecture

\`\`\`
[Client app] ←─── WebSocket ───→ [WS Gateway] → [Message service]
       │                                              │
   [IndexedDB]                                  [DB + outbox]
   (local message store)                              │
       │                                       [Pub/sub fan-out]
   [Service Worker]
   (Push API for closed-app notifications)
\`\`\`

### Key design decisions

**Message lifecycle (with status).**

\`\`\`
[User types and hits send]
     ↓
[1. Optimistically render in chat with status="sending"]
     ↓
[2. Send over WebSocket]
     ↓ (server ack with server message id)
[status="sent"]
     ↓ (recipient's WebSocket delivers message)
[status="delivered"]
     ↓ (recipient app opens chat)
[status="read"]
\`\`\`

Each transition pushes a status update over the WebSocket. The client updates the local message record.

**Local-first storage (IndexedDB).**

Messages stored locally in IndexedDB. The chat scrolls show local messages — no API call needed for navigation. Server is the source of truth for *new* messages, but reading old messages is offline-capable.

A library like **Dexie** wraps IndexedDB pleasantly:
\`\`\`js
import Dexie from 'dexie';
const db = new Dexie('chat');
db.version(1).stores({
  messages: '++id, conversationId, timestamp, status',
  conversations: '++id, name, lastMessageAt'
});
\`\`\`

**Offline outbox.**

When offline, the message is saved with status \`pending\`. A background worker (or \`online\` event listener) drains the pending queue when connectivity returns.

\`\`\`js
window.addEventListener('online', async () => {
  const pending = await db.messages.where('status').equals('pending').toArray();
  for (const msg of pending) await send(msg);
});
\`\`\`

**Typing indicators.**

On \`input\` event in the message composer, debounce 300ms, send a \`typing\` event over WebSocket. Server fans out to the conversation. Receiver client shows "X is typing…" with a 3s timeout — if no new \`typing\` event arrives, hide.

**Read receipts.**

When a message becomes visible in the receiver's viewport (use \`IntersectionObserver\`), send a \`read\` event with the message ID. Server forwards to the sender.

Privacy consideration: read receipts can be toggled off per user preference.

**Reconnection.**

Exponential back-off with jitter. On reconnect, send the highest local message ID; server replies with all newer messages.

\`\`\`js
let attempt = 0;
function connect() {
  ws = new WebSocket(url);
  ws.onopen = () => {
    attempt = 0;
    ws.send(JSON.stringify({ type: 'sync', lastMessageId: getMaxLocalId() }));
  };
  ws.onclose = () => {
    const delay = Math.min(30000, 1000 * Math.pow(2, attempt)) + Math.random() * 1000;
    setTimeout(connect, delay);
    attempt++;
  };
}
\`\`\`

**Push notifications when app is closed.**

Service Worker subscribes to push (using VAPID + the Push API). Server pushes a notification when a message arrives for an offline user.

\`\`\`js
// In service worker
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.from, {
    body: data.preview,
    badge: '/icon.png',
    tag: data.conversationId,
  });
});
\`\`\`

**Media (images, videos).**

Upload to presigned S3 URL. Send a message containing the URL (not the binary). Receiver downloads on demand (or eagerly for small images).

**End-to-end encryption (optional, WhatsApp-level).**

Use the Signal Protocol. Each user has a long-term identity key + ephemeral session keys. Messages encrypted client-side before sending; server can't read content. Library: Signal's own \`libsignal\` (TypeScript binding \`@signalapp/libsignal-client\`). Note it ships as a native Node module, not a browser build — the old browser port, \`libsignal-protocol-javascript\`, was archived in 2021 — so a pure web client needs a WebAssembly build or a third-party implementation.

**Trade-offs:**
- WebSocket vs SSE+POST: WebSocket is bidirectional, more efficient at scale. SSE+POST is simpler but has more HTTP overhead per send.
- E2E encryption complicates server features (search, abuse detection). Most products start without it.
- IndexedDB can hit storage quotas on long-lived chats; need eviction strategy (drop messages older than N months from local cache).

---

## 13. Design: Streaming Under Poor Network

**Problem:** design a video (or audio) streaming player optimized for unreliable networks (e.g., mobile users in emerging markets, train commute, congested cafe WiFi).

### Functional requirements

- Start playback fast even on slow connections.
- Adapt quality up/down as bandwidth changes.
- Survive brief disconnects without restarting.
- Show meaningful UI when buffering.
- Optionally support offline / pre-downloaded content.

### Strategy

**Adaptive Bitrate Streaming (ABR) — the core technique.**

The video is encoded at multiple bitrates (180p, 360p, 720p, 1080p, 4K). The server provides a **manifest** (HLS .m3u8 or DASH .mpd) listing available qualities.

Client downloads short segments (2–10s) sequentially. After each segment, the player measures throughput. Algorithm picks the highest bitrate sustainable.

\`\`\`
[Start playback]
     ↓
[Pick lowest bitrate — playback starts fast]
     ↓ (download segment, measure time)
[Estimate throughput]
     ↓
[Upgrade to higher bitrate if throughput >> bitrate × safety margin]
     ↓
[Repeat]
     ↓ (throughput drops below current bitrate)
[Downgrade]
\`\`\`

Two common ABR algorithms:

- **Throughput-based** (simple): pick the bitrate that's, say, 0.7× recent average throughput.
- **Buffer-based** (newer, used by Netflix): factor in how much video is buffered. When the buffer is full, prioritize quality. When buffer drains, prioritize stability.

**Smart start.**

Start at low quality so playback begins fast. Once buffer is healthy, upgrade. The user sees "video starts in 1s but quality improves over the first 10 seconds" rather than "loading… loading… loading… HD playback."

**Buffer management.**

Maintain a target buffer (e.g., 30 seconds ahead). Below 10 seconds = aggressive low-quality; above 30 = relax, fetch in background.

If buffer reaches 0, show a spinner. If buffer stays empty for 10s, prompt to retry / switch to lowest quality / suggest audio-only.

**Network Information API.**

On supporting browsers:
\`\`\`js
const connection = navigator.connection;
console.log(connection.effectiveType); // 'slow-2g', '2g', '3g', '4g'
console.log(connection.downlink); // Mbps
console.log(connection.saveData); // boolean — data saver enabled
\`\`\`

Use this to:
- Pre-set initial bitrate.
- Disable autoplay on slow connections.
- Show "Data Saver mode" UI.
- Skip hover-preview / autoplay on next-episode.

**Reconnect strategy.**

Network blip during playback → buffer drains → spinner appears. Player should:
1. Retry the failed segment with exponential back-off (1s, 2s, 4s).
2. After 3 failures, drop to lower bitrate (segment is smaller, more likely to succeed).
3. After 30s of no progress, surface "Connection lost. Tap to retry."

**Audio-first mode.**

For very slow connections, drop video entirely and play audio only. Audio is much smaller (~32–128 kbps) and provides continuity for podcasts / music videos.

**Pre-download for offline viewing.**

Many platforms (Netflix, Spotify) allow downloading content while on Wi-Fi for later offline playback. On the client:

\`\`\`js
// Service Worker caches segments to Cache API
caches.open('downloads').then(cache => {
  cache.addAll(segmentUrls);
});

// At playback time, MediaSource feeds from cached blob
\`\`\`

Note: encrypted content with DRM requires storing the license too, which is more complex.

**HLS vs DASH on the client.**

- Safari supports HLS natively via \`<video src="manifest.m3u8">\`. No JS library needed.
- Chrome / Firefox / Edge need a JS library. **\`hls.js\`** for HLS, **\`shaka-player\`** or **\`dash.js\`** for DASH.
- Most production apps ship \`hls.js\` because Safari is HLS-native and \`hls.js\` handles other browsers.

**Image / poster loading.**

While the video is buffering, show a low-quality placeholder (poster image, or a blurhash). Once the first frame is rendered, the placeholder fades out.

**UI signals.**

- Show a network quality indicator (a small wifi icon with bars).
- When auto-degrading quality, briefly toast "Switched to 480p to maintain playback."
- Show estimated remaining buffer time only if it's healthy (saying "Buffering… 2s left" while it's growing is reassuring; saying "Buffering… 0s left" mid-playback is distressing).

**Trade-offs:**
- More bitrates = more storage cost and more transcoding work for the publisher.
- Aggressive ABR upgrades reduce average quality over a session but minimize stalls. Conservative ABR maximizes peak quality but risks stalls.
- Pre-fetching the next likely episode helps continuity but wastes bandwidth if the user navigates away.

---

## 14. Design: Pinterest — A Masonry Image Grid

The reason this gets asked instead of "design a feed" is that **every simplifying assumption a feed relies on is false here**. A feed is one column of roughly uniform rows; a masonry grid is N columns of items whose heights you do not know until the image loads. That breaks virtualisation, breaks scroll restoration, and makes layout shift the default rather than a bug.

### Functional requirements

- An infinite grid of image cards in a variable number of columns, responsive to viewport width
- Cards have **different heights** — the layout packs them to minimise ragged column bottoms
- Infinite scroll, with the position preserved when you open a card and come back
- Hover/focus actions on a card (save, share) without reflowing anything

### Non-functional

- Smooth 60fps scroll on a mid-range Android, with thousands of items loaded
- **CLS ≈ 0** — nothing may jump as images arrive
- Fast LCP: the first screen of images should not wait on the rest
- Memory flat as you scroll — not growing with the number of items seen

### Architecture

\`\`\`text
  ┌──────────────── Grid container (measures its own width) ──────────────┐
  │   column count = floor(width / targetColumnWidth)                     │
  │                                                                       │
  │   ┌── Layout engine (pure) ──────────────────────────────────────┐    │
  │   │  for each item, in order:                                    │    │
  │   │    col = index of SHORTEST column        ← greedy packing     │    │
  │   │    y   = height of that column                                │    │
  │   │    h   = width / aspectRatio  (+ caption)  ← NO measuring     │    │
  │   │    columnHeights[col] += h + gap                              │    │
  │   │  → positions: Map<itemId, {x, y, w, h}>                       │    │
  │   └──────────────────────────────────────────────────────────────┘    │
  │                                                                       │
  │   render only items whose [y, y+h] intersects                         │
  │   [scrollTop - overscan, scrollTop + viewportHeight + overscan]        │
  └───────────────────────────────────────────────────────────────────────┘
\`\`\`

### Key design decisions

**1. The server must send the aspect ratio with every item.** This is the decision the whole design rests on, and it is the thing to say first. If the client has to load an image to learn its height, it cannot compute the layout, cannot virtualise, and cannot avoid layout shift. With \`{ id, url, width, height }\` in the payload the height of every card is known before a single byte of image data arrives.

**2. Greedy shortest-column packing, not CSS columns.** \`column-count\` in CSS fills top-to-bottom per column, so items read down rather than across and the order is wrong for a feed. CSS grid with \`grid-auto-rows: 1px\` and a computed \`span\` works but still needs the height up front. An explicit layout function returning absolute positions is what makes the next decision possible.

**3. Virtualise on the position map, not on the DOM.** Because layout is a pure function of \`(items, containerWidth)\`, positions exist for items that were never rendered. Rendering is then a filter over that map, and the container gets \`height = max(columnHeights)\` so the scrollbar is correct from the start. **This is why variable heights are not fatal**: the usual objection to virtualising them — "you cannot know the offset without measuring" — disappears once the server supplies the ratio.

**4. Reserve the space before the image exists.** Every card wraps its image in an \`aspect-ratio\` box sized from the known ratio, so the box occupies its final height immediately and the picture fades in. That is the CLS fix, and it is also what makes the layout stable while images are still in flight.

**5. Recompute only on width change.** Layout depends on container width and the item list, so it is memoised on both. A resize recomputes; a scroll does not. On a resize, keep the item under the pointer anchored rather than jumping to the same \`scrollTop\`.

**6. Image delivery is most of the performance.** Responsive \`srcset\` so a phone never downloads a 1200px asset, modern formats with fallbacks, \`loading="lazy"\` plus \`decoding="async"\` on everything below the fold, \`fetchpriority="high"\` on the first few, and a tiny blurred placeholder (LQIP) inlined in the payload so the card is never empty.

**7. Scroll restoration is a product requirement, not a nicety.** Opening a pin and coming back must return you to the same item. Store the **first visible item id and its offset within the card**, not \`scrollTop\` — a raw pixel value is wrong as soon as the column count changes or items are prepended.

### What breaks at scale, and the fix

| Problem | Why it happens | Fix |
|---|---|---|
| Scroll jank on Android | layout recomputed per scroll event | positions are memoised; scroll only filters |
| Memory grows forever | every item ever loaded stays mounted | virtualise; cap the retained window |
| Images pop in and shove content | no space reserved | aspect-ratio box from server-supplied dimensions |
| Ragged column bottoms | naive round-robin column assignment | greedy shortest-column packing |
| Duplicate/missing items when new content arrives | offset pagination with a shifting dataset | cursor pagination |
| Position lost after navigating back | restoring \`scrollTop\` | restore by item id + intra-item offset |

### What to say about trade-offs

Greedy packing is O(n) and near-optimal for a feed, but it is not the tightest packing — a lookahead algorithm fills the bottom edge better and costs more, and nobody sees the bottom edge of an infinite grid. Virtualisation costs you \`Ctrl+F\` and naive print/SEO, which is why a server-rendered first page plus client virtualisation afterwards is the common compromise. And if items have *no* reliable aspect ratio — user-generated video, mixed embeds — the honest answer is that you measure the first render and accept one reflow, or you impose a fixed ratio and crop.

---

## 15. HLD: A Reusable Tabs Component

This is the "component design" variant of frontend system design — common in Senior frontend interviews. Build a Tabs component that any team in the company can use.

### Requirements

- Multiple tabs with labels and content panels.
- Active tab is visually distinguished.
- Keyboard navigation (arrow keys, Home/End).
- Accessible (ARIA roles, focus management).
- Controlled and uncontrolled modes.
- Compound components: \`<Tabs>\`, \`<TabList>\`, \`<Tab>\`, \`<TabPanel>\`.
- Theming via props or CSS variables.
- Lazy rendering: tab panel content renders only when active (option to keep mounted).
- Supports vertical orientation.
- Animations between panels (optional).

### Public API

\`\`\`tsx
<Tabs defaultValue="overview" onChange={(v) => {}}>
  <TabList>
    <Tab value="overview">Overview</Tab>
    <Tab value="specs">Specs</Tab>
    <Tab value="reviews">Reviews</Tab>
  </TabList>
  <TabPanel value="overview">…</TabPanel>
  <TabPanel value="specs">…</TabPanel>
  <TabPanel value="reviews">…</TabPanel>
</Tabs>
\`\`\`

### Architecture

**Compound components pattern with Context.**

\`<Tabs>\` provides a Context with:
- \`activeValue: string\`
- \`setActiveValue(v: string): void\`
- \`orientation: 'horizontal' | 'vertical'\`
- \`keepMounted: boolean\`
- \`idPrefix: string\` (for ARIA pairing)

Children (\`<Tab>\`, \`<TabPanel>\`) consume context.

\`\`\`tsx
const TabsContext = createContext<TabsCtx | null>(null);

function Tabs({ defaultValue, value, onChange, orientation = 'horizontal', children, keepMounted = false }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internalValue;
  const idPrefix = useId();
  const setActiveValue = useCallback((v) => {
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
  }, [isControlled, onChange]);
  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue, orientation, keepMounted, idPrefix }}>
      <div className={\`tabs tabs--\${orientation}\`}>{children}</div>
    </TabsContext.Provider>
  );
}

// stand-ins so this example runs on its own (the full TabPanel is below)
function Tab({ value, children }) {
  const { activeValue, setActiveValue } = useContext(TabsContext);
  return <button aria-selected={activeValue === value} onClick={() => setActiveValue(value)}>{children}</button>;
}
function TabPanel({ value, children }) {
  return useContext(TabsContext).activeValue === value ? <div role="tabpanel">{children}</div> : null;
}

function Demo() {
  return (
    <Tabs defaultValue="overview" onChange={(v) => console.log('active:', v)}>
      <Tab value="overview">Overview</Tab>
      <Tab value="specs">Specs</Tab>
      <TabPanel value="overview">Product overview</TabPanel>
      <TabPanel value="specs">Tech specs</TabPanel>
    </Tabs>
  );
}

render(<Demo />);
\`\`\`

**Controlled vs uncontrolled.**

If \`value\` prop is passed → controlled (parent owns state). Otherwise uncontrolled (component owns via \`useState\`). The dual-mode pattern with \`isControlled\` check is the canonical React design.

**Keyboard navigation.**

\`<TabList>\` registers all tab refs. On \`onKeyDown\`:
- Arrow Right / Down → focus next tab (wraps).
- Arrow Left / Up → focus previous.
- Home → focus first.
- End → focus last.

The W3C ARIA Authoring Practices spec defines this exactly. **Activation mode:** "automatic" (focus = activate) vs "manual" (focus moves but you press Enter/Space to activate). Default is automatic for tabs but expose a prop.

**ARIA roles.**

\`\`\`html
<div class="tabs">
  <div role="tablist" aria-orientation="horizontal">
    <button role="tab" id="tab-overview" aria-controls="panel-overview" aria-selected="true" tabindex="0">Overview</button>
    <button role="tab" id="tab-specs" aria-controls="panel-specs" aria-selected="false" tabindex="-1">Specs</button>
  </div>
  <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" tabindex="0">…</div>
  <div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs" tabindex="0" hidden>…</div>
</div>
\`\`\`

The IDs need to be unique per \`<Tabs>\` instance. Use \`useId()\` (React 18+) to generate a stable prefix.

**Lazy rendering.**

\`\`\`tsx
function TabPanel({ value, children }) {
  const { activeValue, keepMounted, idPrefix } = useContext(TabsContext);
  const isActive = activeValue === value;
  const wasActiveRef = useRef(isActive);
  if (isActive) wasActiveRef.current = true;
  if (!isActive && !keepMounted && !wasActiveRef.current) return null;
  return (
    <div role="tabpanel" id={\`\${idPrefix}-panel-\${value}\`} aria-labelledby={\`\${idPrefix}-tab-\${value}\`} hidden={!isActive} tabIndex={0}>
      {children}
    </div>
  );
}

// stand-ins so this example runs on its own (the full Tabs is above)
const TabsContext = createContext(null);
function Tabs({ defaultValue, keepMounted = false, children }) {
  const [activeValue, setActiveValue] = useState(defaultValue);
  const idPrefix = useId();
  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue, keepMounted, idPrefix }}>
      <div role="tablist">
        {['overview', 'specs'].map((v) => <button key={v} onClick={() => setActiveValue(v)}>{v}</button>)}
      </div>
      {children}
    </TabsContext.Provider>
  );
}

function Demo() {
  return (
    <Tabs defaultValue="overview">
      <TabPanel value="overview">Overview (type here, switch tabs, come back)<input /></TabPanel>
      <TabPanel value="specs">Specs: not mounted until first opened</TabPanel>
    </Tabs>
  );
}

render(<Demo />);
\`\`\`

Three modes:
- \`keepMounted=false\` and never active: don't render.
- Once active: render and keep in DOM (mount-once).
- \`keepMounted=true\`: render from start, just hide when inactive.

The mount-once pattern preserves form state when switching tabs.

**Routing integration (optional).**

For URL-driven tabs (\`/product/123?tab=specs\`), you'd accept \`value\` / \`onChange\` from the parent and let the parent sync to the URL:

\`\`\`tsx
const [searchParams, setSearchParams] = useSearchParams();
<Tabs value={searchParams.get('tab') ?? 'overview'} onChange={(v) => setSearchParams({ tab: v })}>
  <TabPanel value="overview">…</TabPanel>
</Tabs>
\`\`\`

The component itself doesn't know about the router — the parent wires it. Keeps the component agnostic.

**Theming.**

Use CSS variables that consumers can override:
\`\`\`css
.tabs {
  --tabs-active-color: var(--accent, #2563eb);
  --tabs-border: 1px solid #e5e7eb;
}
\`\`\`

Plus an optional \`className\` prop for full override.

**Edge cases to discuss in the interview:**
- What if no \`<TabPanel>\` matches \`defaultValue\`? — Fall back to first tab or render nothing; document the behavior.
- What if \`<Tab>\` is rendered conditionally (some tabs hidden by permissions)? — Filter the focusable list at runtime.
- Disabled tabs — \`aria-disabled="true"\` + skip in keyboard navigation.
- RTL support — swap left/right arrow behavior in RTL mode.
- Server-rendered hydration mismatch — make sure \`useId\` is React 18+ (stable on server and client).

This question signals whether a candidate can build a real library component vs a one-off UI for a project. The good answers cover compound components, ARIA, keyboard, controlled/uncontrolled, mount strategies, and theming — all of which are evaluated independently.

---

## 16. Interview Questions & Answers

### Beginner

**Q1: What's the difference between server state and client state?**

**Server state** has a remote source of truth — data lives on a server, the client has a (potentially stale) cache. It needs to handle async loading, errors, caching, refetching, dedup, optimistic updates.

**Client state** is purely UI — modal open/closed, sidebar collapsed, selected tab, in-progress form input.

Putting server state in client state libraries (Redux) is a common mistake. It works but you reimplement everything TanStack Query / SWR already do well: cache, retry, dedupe, background refresh, garbage collection. Greenfield in 2026: TanStack Query for server state, useState/Zustand for client state.

---

**Q2: How do you choose between REST and GraphQL?**

REST is the default — well-tooled, cacheable via HTTP headers, easy debugging. Use it unless you have specific GraphQL needs.

GraphQL shines when:
- Multiple clients need different shapes of the same data (mobile wants compact, web wants nested).
- Aggregating data from multiple backend services in one round-trip.
- Strongly-typed schema is high-value for the team.

Trade-offs:
- GraphQL adds server complexity: resolvers (a function per field), N+1 prevention (fetching a list of 50 posts and then each post's author naively makes 1 + 50 database calls, so you need a batching layer such as DataLoader), and query whitelisting in production (only accepting pre-registered queries, because otherwise any client can send an arbitrarily deep, expensive query).
- HTTP caching is harder (all GraphQL goes through one POST endpoint).
- GraphQL clients are powerful but learning-curve heavy.

The "BFF" pattern (Backend for Frontend) is a middle ground: keep REST for upstream services, build a frontend-specific aggregator that hides multi-service complexity.

---

**Q3: How do you make a long list of 10,000 items performant?**

**Virtualization.** Render only the visible viewport + a small buffer. Libraries: \`react-window\`, \`@tanstack/react-virtual\`, \`react-virtuoso\`.

Without virtualization, 10,000 DOM nodes will:
- Cripple initial render (layout/paint).
- Make scrolling janky.
- Bloat memory.

With virtualization, you typically have 20–50 nodes in the DOM at any time regardless of list length.

Other techniques to combine:
- Use \`key={stableId}\` (NEVER index for changing lists).
- Wrap row components in \`React.memo\` so unchanged rows don't re-render.
- Debounce search inputs so each keystroke doesn't re-filter 10,000 items.

### Intermediate

**Q4: Walk me through optimistic UI for posting a tweet. What can go wrong?**

Optimistic flow:
1. User types tweet, clicks Post.
2. Add tweet to local cache immediately with \`clientId\` and \`status: 'sending'\`.
3. UI shows the tweet at the top of the feed instantly.
4. Send POST request to server.
5. Server returns the persisted tweet with \`serverId\` and \`createdAt\`.
6. Replace the optimistic entry with the server's response.

What can go wrong:
- **Server error** — roll back, show a toast "Couldn't post," and offer retry.
- **Duplicate submit** (user hit Post twice) — debounce the button, use an idempotency key.
- **Race condition** — user posted A, then B; B's server response arrives first. Sort by \`clientCreatedAt\`, not server time.
- **Network timeout** — keep showing "Sending…" with a retry option, don't crash.
- **Reconciliation** — server might add metadata (mentions parsed, URLs unfurled). Replace, don't merge.

The pattern: optimistic UI is great for perceived speed, but you MUST handle the rollback path. Not rolling back = "ghost tweets" stay forever locally even though they didn't send.

---

**Q5: How would you design real-time presence ("3 users are viewing this page")?**

**Transport:** WebSocket or SSE. WebSocket is fine; for one-way presence broadcast, SSE works too.

**Architecture:**
1. Client opens connection on page load.
2. Sends \`JOIN { pageId, userId }\`.
3. Server maintains in-memory map: \`{ pageId -> Set<userId> }\`.
4. Server broadcasts updated count to all sockets in that page.
5. On disconnect (close event or timeout), server removes the user.
6. Client closes connection on \`pagehide\` event.

**Scaling concerns:**
- One server can't hold all sockets — shard by pageId (consistent hashing across WS gateway nodes), or use a pub/sub bus (Redis) to fan out across nodes.
- Heartbeat: client sends a ping every 30s; if no ping in 60s, server prunes.
- Mobile devices disconnect frequently (app backgrounded) — be aggressive about pruning.

**UI:**
- Stable counter that doesn't flicker on transient disconnects. Use a debounced counter that updates every 1–2s.
- "John, Jane, +5 others" with avatars if you want to show identities.

---

**Q6: How does adaptive bitrate streaming (ABR) work, and why is it important?**

The video is pre-encoded at multiple bitrates (e.g., 240p / 480p / 720p / 1080p / 4K). The client downloads short segments (2–10 seconds) one at a time. After each segment, the player measures:
- Throughput (bytes/time of last download).
- Buffer health (how much video is buffered ahead).

The player picks the next bitrate based on those signals. Throughput-based ABR is simple but flickers; buffer-based ABR (used by Netflix) is steadier.

Why it matters:
- **Fast start** — begin playback at low quality, upgrade as buffer fills. Reduces start delay.
- **Adaptive to network changes** — when bandwidth drops, downgrade gracefully instead of stalling.
- **Single source, many devices** — one encoded asset serves a phone on 3G, a laptop on WiFi, a 4K TV.

Standards: **HLS** (Apple, .m3u8 manifest, ubiquitous) and **MPEG-DASH** (newer, more flexible, .mpd manifest). Libraries: \`hls.js\`, \`shaka-player\`, \`dash.js\`.

Without ABR, you'd either ship a single-bitrate file (terrible UX for slow connections) or ask users to pick quality manually (terrible UX for anyone).

### Advanced

**Q7: How would you architect end-to-end encryption for a chat app?**

Use the **Signal Protocol** (open spec, used by Signal, WhatsApp, Skype).

Concepts:
- **Long-term identity key** — generated per user, stored locally. Public key uploaded to a key-server.
- **Pre-keys** — short-lived public keys uploaded to the server so other users can initiate sessions while you're offline.
- **Session keys** — derived per-conversation via the Double Ratchet algorithm, which moves to a new key with every message. The point: a key stolen today cannot decrypt earlier messages (forward secrecy), and once the ratchet has moved on it cannot decrypt later ones either (backward, or post-compromise, secrecy).

On send:
1. Client fetches recipient's pre-keys from server.
2. Establishes a session via X3DH (Extended Triple Diffie-Hellman).
3. Encrypts message with current ratchet key.
4. Sends ciphertext + minimal metadata to server.

Server stores ciphertext but cannot decrypt.

On receive:
1. Client decrypts with its session key.
2. Ratchets forward for the next message.

Implementation: Signal's \`libsignal\` (TypeScript binding \`@signalapp/libsignal-client\`). It is a native Node module, fine for an Electron app like Signal Desktop but not for a plain browser tab; the former browser port, \`libsignal-protocol-javascript\`, was archived in 2021 and is no longer maintained.

Trade-offs:
- Server can't search messages, generate notification previews, do abuse detection.
- Key management is hard: device additions/removals, key verification UX (QR codes), backup/restore.
- Increases client complexity significantly.
- Compliance with law enforcement requests becomes harder (good or bad depending on your stance).

Most products don't need E2E. Use it only when threat model demands it (Signal, ProtonMail, WhatsApp).

---

**Q8: A user reports their video keeps buffering on 4G. Walk through how you'd debug.**

1. **Reproduce.** Get details: device, browser, region, time, video ID. Try playing the same video on a similar setup.

2. **Check client-side network metrics.** \`RTCStatsReport\` (for WebRTC) or HLS.js's \`bandwidth\` and \`dropped frames\` stats. Is the issue throughput-low or packet-loss-high?

3. **Check the ABR algorithm.** Is the player getting stuck on too-high bitrate? Force the lowest bitrate as a sanity check. If that plays smoothly, the ABR logic is the issue.

4. **Check buffer health.** If buffer drains to zero repeatedly even on low bitrate, the issue is genuinely network — try a different CDN edge or a fallback origin.

5. **Check the CDN.** Use \`curl -v\` to fetch segments and time them. Try different regions. Is one CDN node hosting the segments unhealthy?

6. **Check codec / transmux.** Some browsers transcode codecs on the fly (cost). Verify the manifest's codecs match what the device prefers.

7. **Cross-check with metrics.** Is this a single user or a population? Pull RUM data filtered by region + ISP. If 5% of users in that region see this, infra issue. If it's just one, look at device/local issues.

8. **Hypotheses to rule out:**
   - Carrier throttling video (some mobile carriers throttle Netflix/YouTube).
   - WiFi vs cellular handoff causing 5–10s pauses.
   - Battery-saver mode reducing CPU, making decode slow.
   - Ad-blocker breaking the manifest fetch.

The senior debugging signal: combining client observability, network introspection, and population-level metrics rather than blindly retrying.

---

**Q9: Walk me through the high-level design of a frontend system you have built — modules, component hierarchy, API contracts, caching, performance, and how you handled non-functional requirements.**

This is the most common round-2 question and the one candidates prepare least, because it looks like it needs no preparation. It does: the interviewer is not checking whether you *worked* on something, they are checking whether you can **describe a system at the right altitude, own its trade-offs, and attach numbers to its behaviour.** Rambling chronologically through features is the failure mode.

**Open with one sentence of context, then the shape.** "It is a B2B logistics dashboard — about 40 screens, roughly 300 daily users, the heaviest page streams live vehicle positions." Scale, domain, and the hardest part, before any technology. If you lead with "it's a React app with Redux", you have answered a different question.

**Then follow a fixed order**, because the interviewer is listening for structure:

| Layer | What to actually say |
|---|---|
| **Modules** | How the code is split and *why that boundary* — by feature/domain rather than by file type, what is shared, and how you stop shared code becoming a dumping ground |
| **Component hierarchy** | Where state lives and where it deliberately does not; which components are presentational; the one or two places you used context and why prop drilling was worse |
| **API contracts** | Shape and ownership — who defines it, REST or GraphQL and why, how you version, what happens to the UI when a field is added or removed |
| **Caching** | Which of the layers you actually used (see §7) and, for each, **the invalidation story** — a cache without one is the thing you will be asked about |
| **Performance** | The budget, how it is measured, and one concrete thing you fixed with a before/after number |
| **NFRs** | Response time, availability, error handling, accessibility, i18n — and what you did when the backend was down, not just when it was up |

**Be specific about non-functional requirements**, since that is the part of the question people skip. Availability on the frontend means: what the user sees when an API times out, whether a stale cached value is better than an error (usually yes for read-heavy screens), whether writes are queued or rejected, and whether one failing widget can take down the page — which is the honest reason to have error boundaries per region rather than one at the root. Response time means a **budget with a number** — "interactions under 200ms at p95, LCP under 2.5s on a mid-range Android" — plus how you knew: real-user monitoring, not a Lighthouse score from your laptop.

**Volunteer one thing you got wrong.** Interviewers grade ownership, and a design with no regrets reads as a design you did not really make. "We put server state in Redux and hand-wrote caching for a year before moving to TanStack Query; I would reach for it on day one now" is worth more than any diagram.

**Have three numbers ready**: scale (users, requests, payload size), a performance figure before and after some change, and a reliability figure (error rate, or how long the last incident took to detect). Numbers are what separate a system you owned from one you were near.

**What not to do:** narrate the folder structure, list every library, describe the backend in detail when the question is about the frontend, or claim a scale you cannot support with a number. If part of it was designed before you joined, say so and describe what you would change — that reads as senior, not as a gap.

---

## 17. Tricky Scenarios

**Q1: You ship a feed app. Users complain that scrolling past 5,000 tweets crashes the tab. What went wrong and how do you fix it?**

The likely cause: you didn't virtualize. 5,000 DOM nodes (each with images, links, action buttons) is roughly 30,000+ DOM nodes in total. Memory grows linearly, the layout cost on every scroll becomes catastrophic, and React's reconciliation is doing work for every node even with \`key\`s.

Fix: **virtualization**. Use \`@tanstack/react-virtual\` or \`react-window\`. Render only the ~30 visible tweets plus a buffer. Memory stays constant regardless of how far you scroll.

Secondary fixes (in priority order):
- Remove inline-rendered media for offscreen tweets. Lazy-load images via \`loading="lazy"\` and \`IntersectionObserver\`.
- Use \`content-visibility: auto\` on tweet containers — the browser can skip painting offscreen ones.
- Debounce scroll handlers; don't recalculate layout on every wheel tick.
- Drop offscreen tweets from React state when memory budget exceeds threshold (advanced).

The interview signal here: recognizing that DOM size and React's reconciliation cost are the bottleneck, not network or compute.

---

**Q2: Your team adds a "live cursor" feature where users see each other's cursors in real-time. Latency feels horrible. How do you investigate?**

Each cursor position is a tiny event but they come at 60 Hz. Send all of them naively and:

- **WebSocket bandwidth** — 60 events/second × 100 collaborators = 6000 events/sec broadcast. Server CPU explodes.
- **Network overhead** — even tiny packets have headers (TCP, WebSocket frame overhead).
- **Render thrash** — 60 cursor re-renders per second per user.

Fixes:

1. **Throttle send rate.** Cap at 20 events/sec. Use \`throttle(send, 50)\`. Combined with interpolation on the receiving side (fix 2), 20 updates a second looks smooth, and it cuts the traffic to a third of the raw 60 Hz.

2. **Interpolate on receive.** When a peer cursor moves, animate smoothly to the new position over the next 50ms rather than jumping. Smooths perception.

3. **Send deltas, not absolutes.** If the protocol allows it, only send \`(dx, dy)\` and a sequence number. Deltas only work on a reliable, ordered channel — one lost delta leaves the cursor permanently off — so if you adopt fix 5 and let updates drop, send absolute positions instead.

4. **Coalesce server-side.** The server can drop stale updates if a newer one is queued for the same client.

5. **Use UDP-like transport for non-critical data.** WebRTC DataChannel with \`ordered: false\` and \`maxRetransmits: 0\` lets cursor updates drop in favor of newer ones. Lower-latency than WebSocket for high-frequency stuff.

6. **Render via CSS transforms, not React re-renders.** Imperative cursor update: hold a \`useRef\` to the cursor element, write \`transform: translate(x, y)\` directly on receive. Bypass React's render cycle entirely.

The architectural signal: separating "data plane" (high-frequency cursor positions, latency-sensitive) from "control plane" (low-frequency events like joining/leaving, must be reliable).

---

**Q3: Your team migrated from REST to GraphQL. Six months later, the frontend is slower and the backend bill is 3x higher. What happened?**

Several common GraphQL anti-patterns:

1. **N+1 queries on the server.** Resolvers fan out to many database queries because each field is resolved independently. The fix is \`DataLoader\` (or framework equivalent) to batch and cache within a request. If the original team didn't wire DataLoader, the server is doing 100 DB calls for one GraphQL request.

2. **No query whitelisting in production.** Anyone can craft arbitrary queries that explode in cost (deep nested queries, expensive fields). Production GraphQL servers should accept only persisted/whitelisted queries.

3. **Lost HTTP caching.** All queries are POSTed to one endpoint, so the CDN can't cache anything. REST endpoints cached at the CDN edge for free; GraphQL needs an explicit caching layer (Apollo Cache Control, Hasura, etc.).

4. **Client over-fetching despite GraphQL.** Developers got lazy: instead of writing precise queries, they fetch large object trees "because we'll need this later." GraphQL doesn't prevent over-fetching; it enables under-fetching IF used disciplined.

5. **No payload size monitoring.** Without alerting on average query response size, payloads bloat silently as teams add more fields.

Fixes: introduce DataLoader, enforce persisted queries in production, add Apollo Cache Control or a Redis cache in front, add payload size dashboards.

The lesson: GraphQL is more powerful but doesn't auto-optimize. Without good infra discipline, it costs more than REST.

---

**Q4: A senior asks you to add SSR to a 4-year-old React SPA. Codebase is 200k LOC. What do you actually do?**

The naive answer: "Use Next.js." Reality: a 200k LOC SPA has likely accumulated dozens of SSR-hostile patterns. Migration is a project, not a flag flip.

What to audit first:

1. **Window / document references at module load.** \`const dimensions = { width: window.innerWidth }\` at the top of a file crashes SSR. Find them all (grep \`window\\.\`, \`document\\.\`, \`localStorage\`).

2. **Browser-only libraries.** Some libraries (carousels, charts, drag-and-drop) reference \`window\` on import. Need \`next/dynamic\` with \`ssr: false\` for these.

3. **Authentication.** SPA likely reads token from localStorage. Server has no localStorage — needs to be cookies (httpOnly, sameSite) for SSR-friendly auth.

4. **Data fetching.** \`useEffect\` fetches don't run on the server. Either migrate to a data-fetching framework (Next's \`getServerSideProps\`, Remix loaders, TanStack Query SSR) or accept that initial paint won't have data.

5. **Routing.** React Router → file-based router (Next.js / Remix). Significant churn.

6. **Bundle size.** SSR does not shrink the JavaScript — the browser still downloads the whole bundle to hydrate (attach event handlers to) the server HTML, and the HTML itself gets larger. So compression (gzip / Brotli) and deferring non-critical scripts still matter, or you trade a blank page for a page that looks ready but ignores clicks.

Realistic incremental path:
1. **Server-render only marketing/SEO pages first.** Keep the authenticated app SPA.
2. **Identify the data-fetching pattern.** Migrate to TanStack Query with SSR hydration if existing fetches are simple.
3. **Migrate routes one at a time** with feature flags.
4. **Measure.** First-byte, LCP, hydration time. SSR can actually HURT TTI if hydration is heavy.

Estimate in quarters, not sprints. The real figure depends on how many SSR-hostile patterns (direct \`window\`/\`localStorage\` access at module load, client-only libraries, fetches inside effects) an audit turns up, so do that audit before quoting a number.

**Be honest in the interview** that this isn't a Friday afternoon job. Senior interviewers value realistic scoping.

---

**Q5: Your video conferencing app works perfectly with 4 participants but degrades sharply at 8+. What's the architecture issue and what do you do?**

The likely cause: **peer-to-peer mesh topology**. With N participants, each sends N-1 streams and receives N-1 streams. Every added person raises every client's upload and encoding work, and the call as a whole carries N×(N-1) streams — so going from 4 to 8 people takes each laptop from 3 uploads to 7 and the total from 12 streams to 56.

Switch to **SFU (Selective Forwarding Unit)**.

- Each client opens ONE WebRTC connection to the SFU.
- Client uploads their stream once.
- SFU receives, forwards to each other client.
- Linear scaling.

The client-side change is moderate (one peer connection to the SFU instead of many). The server-side change is significant — you now operate a media server.

Options:
- Self-host: \`mediasoup\`, \`Janus\`, \`Jitsi\`, \`LiveKit\` (LiveKit is the modern open-source pick).
- Managed: Daily.co, Agora, Twilio Video, Vonage.

For a 50+ participant call, you also want **simulcast**: each client uploads multiple resolutions (180p / 360p / 720p), SFU forwards the appropriate one to each receiver based on their downlink. Without simulcast, one slow receiver forces all senders to drop quality.

Architecturally: mesh works up to ~4 participants, SFU is the standard for 5–500, MCU (transcoding) only for special cases like recording or legacy phone bridging.

---

**Q6: Your "messages sent" indicator on chat shows ✓ for sent and ✓✓ for delivered. Users sometimes see ✓ for hours when the recipient is clearly online. What's the bug?**

The "delivered" status requires the server to know the recipient has received the message. There are several possible breaks:

1. **Recipient's WebSocket dropped silently.** TCP can hang in half-open state — the connection seems alive on the recipient's side but the server's view is dead (or vice versa). Fix: heartbeat protocol with timeout. If no ping in 30s, treat as disconnected and queue messages.

2. **Recipient went offline before delivering ACK.** Server forwards the message → recipient device received the WebSocket frame → app crashed before sending the delivered ACK. From server's view, the message was sent but never confirmed.

3. **Delivery ACK lost in transit.** Recipient confirmed delivery, but the ACK back to server was lost (network blip). Fix: idempotent ACK protocol — recipient sends ACK with the message ID; server is idempotent on receipt.

4. **Sender's status updates are not pushed.** Server marked the message as delivered but the WebSocket push to the sender's device dropped. Fix: on reconnect, sender's client syncs message statuses from the server.

5. **Multi-device confusion.** Recipient has phone + laptop. Phone is offline, laptop received it. Did delivery require both? Define the semantics: most apps mark "delivered" when ANY of the recipient's devices has the message.

Debugging steps:
- Add server-side logging of message delivery events with timestamps.
- Check the heartbeat / timeout config; the default may be too long.
- Verify ACK round-trip in production via synthetic transactions.
- Audit the multi-device case — is one device's offline state stalling delivery?

The interview signal: real-time systems have many points where status can desync. Reliable status requires acks, retries, idempotency, and reconnect-sync.

---

**Q7: A new engineer suggests "just put everything in Redux." Senior code review pushes back. Why?**

Several reasons.

1. **Server state in Redux is a step backwards.** Async fetches, caching, retries, dedup, staleness — TanStack Query / SWR / Apollo handle all of this. Putting it in Redux means reimplementing it badly. Most teams that did this in 2017 are now migrating off.

2. **Boilerplate explosion.** Each piece of state needs an action type, an action creator, a reducer case, a selector. 4 things to add for what is usually \`useState\`.

3. **Premature centralization.** Component-local state (modal open?) doesn't need to be global. Putting it in Redux makes refactoring harder (you can't simply remove a component).

4. **Re-render performance.** Every store update runs every mounted \`useSelector\`, and a component re-renders whenever its selector returns a different reference. A selector that builds a new object or array (\`state.items.filter(...)\`) returns a new reference every time, so that component re-renders on every action anywhere in the app — including thousands of trivial UI actions once everything lives in the store. \`reselect\` (memoised selectors) fixes it, but it is easy to get wrong.

5. **Debug noise.** The Redux DevTools history fills with thousands of trivial actions ("HOVER_CARD", "OPEN_DROPDOWN"). The meaningful state changes get lost.

When Redux IS the right tool:
- Truly global app state that many distant components read/write (auth user, theme).
- Complex multi-step user workflows (multi-step form wizards with cross-step dependencies).
- Existing investment (huge codebase, team trained on it, devtools workflow).

For greenfield in 2026: **Zustand or Jotai for global UI state, TanStack Query for server state, useState for local UI state**. Redux only when the team has a specific reason.

---

**Q8: An interviewer asks: "if we made the Tabs component throw an error when both \`value\` and \`defaultValue\` are provided, would that be a good API decision?"**

This is a controlled-vs-uncontrolled question. The convention in React is:
- \`value\` (with \`onChange\`) = controlled mode.
- \`defaultValue\` = uncontrolled (initial only).
- Providing both is ambiguous: which one wins on first render?

React's own \`<input>\` warns (in development) but doesn't throw — it picks one and uses it.

Throwing in production = harsh. The form would crash. A typo in props shouldn't take down the page.

Better: **warn in development, pick a deterministic rule in production.**

\`\`\`js
if (process.env.NODE_ENV !== 'production' && value !== undefined && defaultValue !== undefined) {
  console.warn('<Tabs>: provide either \`value\` (controlled) or \`defaultValue\` (uncontrolled), not both. Using \`value\`.');
}
const isControlled = value !== undefined; // value wins
\`\`\`

The general principle: components should be **forgiving at runtime, strict at dev-time**. Bad type combinations get TypeScript errors at compile time and console warnings in dev — but production should keep working with a reasonable fallback.

The interview signal: respect for production robustness over theoretical purity.

---

## References

- [GreatFrontEnd](https://www.greatfrontend.com/) — comprehensive frontend system design problem bank
- [Frontend Interview Handbook](https://www.frontendinterviewhandbook.com)
- [Building Mobile Apps at Scale](https://www.mobileatscale.com)
- [HLS Specification](https://datatracker.ietf.org/doc/html/rfc8216)
- [MPEG-DASH on web.dev](https://web.dev/articles/media-mse-basics)
- [WebRTC API on MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Signal Protocol Documentation](https://signal.org/docs)
- [WAI-ARIA Authoring Practices — Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- *Designing Data-Intensive Applications* by Martin Kleppmann — relevant chapters on consistency, caching, eventual consistency
`;export{e as default};
