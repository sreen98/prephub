# Browser APIs — Complete Guide

Browser APIs ("Web APIs") are the contract between your JavaScript and the browser. They are *not* part of JavaScript — `fetch`, `localStorage`, `IntersectionObserver`, the DOM itself — none of it ships with the language. The browser provides them, Node.js doesn't (mostly), and React/Vue/Svelte are all just thin layers over the same underlying APIs. Knowing what the browser actually gives you is what separates "I know React" from "I know the web."

This guide focuses on the APIs that show up in interviews and real product work — what each one does, how it compares to alternatives, the gotchas, and the questions you'll be asked about it.

## Table of Contents

- [1. The DOM and EventTarget](#1-the-dom-and-eventtarget)
- [2. Storage APIs](#2-storage-apis)
  - [2.1 Cookies](#21-cookies)
  - [2.2 localStorage and sessionStorage](#22-localstorage-and-sessionstorage)
  - [2.3 IndexedDB](#23-indexeddb)
  - [2.4 Cache API](#24-cache-api)
  - [2.5 Storage comparison](#25-storage-comparison)
- [3. Network APIs](#3-network-apis)
  - [3.1 fetch and XMLHttpRequest](#31-fetch-and-xmlhttprequest)
  - [3.2 AbortController](#32-abortcontroller)
  - [3.3 WebSockets](#33-websockets)
  - [3.4 Server-Sent Events](#34-server-sent-events-sse)
  - [3.5 Real-time comparison](#35-real-time-comparison-websocket-vs-sse-vs-polling)
- [4. Workers](#4-workers)
  - [4.1 Web Workers](#41-web-workers-dedicated)
  - [4.2 Shared Workers](#42-shared-workers)
  - [4.3 Service Workers](#43-service-workers)
  - [4.4 Worker comparison](#44-worker-comparison)
- [5. Observers](#5-observers)
  - [5.1 IntersectionObserver](#51-intersectionobserver)
  - [5.2 MutationObserver](#52-mutationobserver)
  - [5.3 ResizeObserver](#53-resizeobserver)
  - [5.4 PerformanceObserver](#54-performanceobserver)
- [6. History and Routing](#6-history-and-routing)
- [7. Performance API](#7-performance-api)
- [8. Scheduling APIs](#8-scheduling-apis)
- [9. File, Blob, and Streams](#9-file-blob-and-streams)
- [10. Geolocation, Notifications, Clipboard](#10-geolocation-notifications-clipboard)
- [11. Web Crypto](#11-web-crypto)
- [12. Cross-Document and Cross-Tab Messaging](#12-cross-document-and-cross-tab-messaging)
- [13. Page Lifecycle and Visibility](#13-page-lifecycle-and-visibility)
- [14. Permissions API](#14-permissions-api)
- [15. URL and URLSearchParams](#15-url-and-urlsearchparams)
- [16. Interview Questions & Answers](#16-interview-questions--answers)
- [17. Tricky Questions](#17-tricky-questions)
- [References](#references)

---

## 1. The DOM and EventTarget

Every node in an HTML document — `document`, `<div>`, even `window` and `XMLHttpRequest` — implements **`EventTarget`**, the interface with `addEventListener`, `removeEventListener`, and `dispatchEvent`. It's the substrate the rest of the web platform builds on.

```js
// DOM querying
const btn = document.querySelector('#save');         // first match
const items = document.querySelectorAll('.item');    // NodeList (live? No — static)
const live = document.getElementsByClassName('item'); // HTMLCollection (live!)

// Event flow: capture → target → bubble
btn.addEventListener('click', e => {
  e.preventDefault();           // cancel default browser behavior
  e.stopPropagation();          // prevent bubble to parent listeners
  e.stopImmediatePropagation(); // also skip remaining handlers on this element
}, { capture: false, once: true, passive: false, signal: ac.signal });
```

**Key options most devs miss:**

- **`once: true`** — listener auto-removes after first fire; saves the manual cleanup pair.
- **`passive: true`** — promises you won't call `preventDefault()`. The browser can scroll without waiting for your handler — critical for `touchstart`/`wheel` on mobile.
- **`signal`** — ties the listener's lifetime to an `AbortController`. Calling `ac.abort()` removes every listener attached with that signal in one shot.
- **`capture: true`** — fires during the *capture* phase (top-down) instead of bubbling. Useful for analytics catch-alls.

**Custom events** — `EventTarget` is not just for the DOM. Any class can extend it (or you can subclass `EventTarget` directly) to build your own pub/sub:

```js
class Store extends EventTarget {
  set(key, value) {
    this[key] = value;
    this.dispatchEvent(new CustomEvent('change', { detail: { key, value } }));
  }
}

const store = new Store();
store.addEventListener('change', e => console.log(e.detail));
store.set('user', { id: 42 });
```

**Event delegation** — attach one listener at a parent and inspect `event.target` to know which child fired. Cuts listener count from N to 1 on lists; survives DOM mutations:

```js
document.querySelector('#list').addEventListener('click', e => {
  const item = e.target.closest('[data-id]');
  if (!item) return;
  console.log('clicked item', item.dataset.id);
});
```

---

## 2. Storage APIs

The browser ships **five** different storage mechanisms with very different rules. Picking the wrong one is a common bug source — auth tokens in `localStorage` (XSS-readable), large data in cookies (sent on every request), expecting tabs to share `sessionStorage` (they don't).

### 2.1 Cookies

The original. Strings only, sent automatically on every same-origin request, max ~4 KB total per domain. The only client-readable storage that the *server* can also see, which is why they're still the standard transport for session IDs and CSRF tokens.

```js
// Set (the API is one of the worst in the platform — a string with semicolons)
document.cookie =
  'sid=abc123; Max-Age=3600; Path=/; Secure; HttpOnly; SameSite=Strict';

// Read (returns ALL cookies as one string)
document.cookie;  // "sid=abc123; theme=dark"

// Delete by setting Max-Age=0
document.cookie = 'theme=; Max-Age=0; Path=/';
```

**Critical flags:**

- **`HttpOnly`** — JavaScript cannot read it (`document.cookie` won't show it). Defends against XSS-based session theft. Set this on every auth cookie. *Must be set by the server* — `document.cookie` cannot.
- **`Secure`** — only sent over HTTPS.
- **`SameSite`** — `Strict` (never sent cross-site), `Lax` (sent on top-level navigation only — the modern default), `None` (always sent — requires `Secure`). Defends against CSRF.
- **`Domain`** / **`Path`** — scope. Default is the issuing host + current path.

### 2.2 localStorage and sessionStorage

Synchronous key-value stores keyed off the **origin** (scheme + host + port). Both implement the same `Storage` interface; the difference is lifetime.

```js
// Same API for both
localStorage.setItem('theme', 'dark');
localStorage.getItem('theme');           // 'dark' or null
localStorage.removeItem('theme');
localStorage.clear();
localStorage.length;
localStorage.key(0);                     // get key by index

// Listen for cross-tab updates (storage event ONLY fires in OTHER tabs)
window.addEventListener('storage', e => {
  console.log(e.key, e.oldValue, e.newValue, e.url);
});
```

- **`localStorage`** — persists indefinitely (until the user clears site data or the storage quota is hit). Shared across tabs of the same origin.
- **`sessionStorage`** — scoped to a *tab*. Cleared when the tab closes. Two tabs of the same origin do **not** share it. Survives reload.

**Gotchas:**

- **Strings only.** `setItem('user', { id: 1 })` stores `[object Object]`. Always `JSON.stringify` / `JSON.parse`.
- **Synchronous.** Reading or writing blocks the main thread. Don't loop over hundreds of items.
- **5–10 MB quota** depending on browser. Hit it and `setItem` throws `QuotaExceededError`.
- **Readable by any JS on the page** — including XSS payloads. Never store auth tokens, only put data here that's safe to be stolen.

### 2.3 IndexedDB

A real database in the browser — async, transactional, indexed, can store ~50% of disk (gigabytes). The native API is hideous (callback-based, version migrations, transaction lifetimes), so most teams use a wrapper like **Dexie** or **idb**.

```js
// Native API (raw — use a wrapper in real code)
const req = indexedDB.open('my-db', 1);
req.onupgradeneeded = e => {
  const db = e.target.result;
  const store = db.createObjectStore('users', { keyPath: 'id' });
  store.createIndex('email', 'email', { unique: true });
};
req.onsuccess = e => {
  const db = e.target.result;
  const tx = db.transaction('users', 'readwrite');
  tx.objectStore('users').put({ id: 1, email: 'a@b.com', name: 'Ana' });
};
```

```js
// Same thing with idb (Promise wrapper) — what you'd actually write
import { openDB } from 'idb';
const db = await openDB('my-db', 1, {
  upgrade(db) { db.createObjectStore('users', { keyPath: 'id' }); }
});
await db.put('users', { id: 1, name: 'Ana' });
const user = await db.get('users', 1);
```

Use IndexedDB when: you need **structured queries** over a lot of data, you need **offline** workflows, you're storing **blobs** (images, files), or you've outgrown `localStorage`'s 5 MB.

### 2.4 Cache API

Different beast — designed to be used by **Service Workers** to cache HTTP responses for offline. Pairs Request → Response objects. Available on the main thread too via `caches`.

```js
const cache = await caches.open('v1');
await cache.add('/static/logo.svg');                       // fetch + store
await cache.put('/api/x', new Response(JSON.stringify({}))); // manual
const res = await cache.match('/static/logo.svg');         // hit or undefined
```

This is what enables a PWA's offline-first behavior — the Service Worker intercepts `fetch`, looks up `caches.match`, and falls back to network.

### 2.5 Storage comparison

```
| API              | Capacity      | Sync? | Sent w/ requests | Tab scope        | Use for                               |
|------------------|---------------|-------|------------------|------------------|---------------------------------------|
| Cookies          | ~4 KB total   | Sync  | Yes (always)     | Origin (config)  | Session id, CSRF token (HttpOnly)     |
| localStorage     | 5–10 MB       | Sync  | No               | Origin (shared)  | UI prefs, tiny client cache           |
| sessionStorage   | 5–10 MB       | Sync  | No               | Tab only         | Per-tab transient state               |
| IndexedDB        | ~½ disk (GB)  | Async | No               | Origin (shared)  | Offline data, big blobs, queries      |
| Cache API        | ~½ disk       | Async | No               | Origin (shared)  | Service Worker HTTP response cache    |
```

**Decision flow:**

- Server needs to read it on every request? → **Cookie** (with `HttpOnly`, `Secure`, `SameSite`).
- Tiny key/value, sync access OK? → **localStorage**.
- Per-tab state? → **sessionStorage**.
- Lots of structured data, offline, blobs? → **IndexedDB**.
- HTTP response caching for offline PWA? → **Cache API** (in a Service Worker).

---

## 3. Network APIs

### 3.1 fetch and XMLHttpRequest

`fetch` is the modern way. `XMLHttpRequest` predates Promises and only matters for legacy code or progress-event APIs that `fetch` doesn't expose well.

```js
// Basic fetch
const res = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Ana' }),
  credentials: 'include',     // 'omit' | 'same-origin' | 'include' (cookies)
  cache: 'no-cache',
  signal: ac.signal,          // see 3.2
});
if (!res.ok) throw new Error(`${res.status}`);  // 4xx/5xx do NOT reject
const data = await res.json();
```

**Gotchas that catch everyone:**

- **HTTP errors don't reject.** A 500 response gives you `res.ok === false` and `res.status === 500` — but the promise resolves. Only network failures (DNS, CORS preflight reject, offline) reject. You must check `res.ok` yourself.
- **The body is a stream and can be read once.** Calling `res.json()` after `res.text()` throws.
- **CORS** is enforced by the *browser*, not the server. The server sets `Access-Control-Allow-Origin`; the browser refuses to expose the response if the header doesn't match. Cross-origin requests with non-simple methods/headers send a **preflight OPTIONS** request first.
- **`credentials: 'include'`** is required to send cookies cross-origin. The server must respond with `Access-Control-Allow-Credentials: true` *and* a non-wildcard `Access-Control-Allow-Origin` for it to work.

`XMLHttpRequest` is still useful in two cases: (1) **upload progress** (`xhr.upload.onprogress` — fetch has no equivalent in widely-shipped browsers), (2) synchronous requests in legacy environments. Don't reach for it otherwise.

### 3.2 AbortController

The standard cancellation primitive. `fetch`, `addEventListener`, async iterators, and most modern web APIs accept a `signal`. One controller, one or many signals — abort once, all attached operations abort together.

```js
const ac = new AbortController();
const timer = setTimeout(() => ac.abort(), 5000);  // 5s timeout

try {
  const res = await fetch('/slow', { signal: ac.signal });
  clearTimeout(timer);
  return res.json();
} catch (e) {
  if (e.name === 'AbortError') console.log('cancelled');
  else throw e;
}

// Composing: AbortSignal.timeout(ms) is shorthand for the above
fetch('/x', { signal: AbortSignal.timeout(5000) });

// Combine multiple signals (timeout AND user-clicked-cancel)
fetch('/x', { signal: AbortSignal.any([userCancel.signal, AbortSignal.timeout(5000)]) });
```

The same `signal` works on `addEventListener` — instant teardown of every listener registered with it:

```js
btn.addEventListener('click', onClick, { signal: ac.signal });
input.addEventListener('input', onInput, { signal: ac.signal });
ac.abort();   // both listeners removed
```

### 3.3 WebSockets

Full-duplex, persistent TCP connection over a single HTTP-upgraded handshake. Both client and server can push at any time.

```js
const ws = new WebSocket('wss://example.com/socket');

ws.addEventListener('open', () => ws.send(JSON.stringify({ type: 'hello' })));
ws.addEventListener('message', e => {
  // e.data is string OR Blob OR ArrayBuffer (set ws.binaryType to choose)
  console.log(JSON.parse(e.data));
});
ws.addEventListener('close', e => console.log(e.code, e.reason));
ws.addEventListener('error', () => console.log('connection error'));

ws.send('text');
ws.send(JSON.stringify({ x: 1 }));
ws.send(new Blob([buf]));
ws.close(1000, 'normal');
```

**Things you'll learn the hard way:**

- **No automatic reconnect.** When the connection drops (mobile networks, server restart, idle timeout in proxies), `onclose` fires and you have to reopen yourself — typically with exponential backoff.
- **No request/response semantics.** Just a stream. Add a `requestId` to messages if you want correlation.
- **Backpressure**: `ws.bufferedAmount` tells you how many bytes are queued in the send buffer. Flooding with `send` faster than the network drains causes memory growth — check this before pushing more.

### 3.4 Server-Sent Events (SSE)

One-way push from server to client over a long-lived HTTP response with `Content-Type: text/event-stream`. The browser handles reconnect automatically.

```js
const es = new EventSource('/api/events');
es.onmessage = e => console.log(e.data);
es.addEventListener('user-joined', e => console.log(JSON.parse(e.data)));
es.onerror = () => console.log('disconnected, will retry');
es.close();
```

Server format:

```
event: user-joined
data: {"id":42,"name":"Ana"}
id: 1234
retry: 5000

```

The blank line terminates an event. `id` is sent back as `Last-Event-ID` on reconnect so the server can replay missed events. `retry` overrides the client's default reconnect interval.

### 3.5 Real-time comparison: WebSocket vs SSE vs Polling

```
| Mechanism      | Direction          | Protocol         | Auto-reconnect | Binary? | Through proxies? |
|----------------|--------------------|--------------------|---------------|---------|-------------------|
| Long polling   | Client request     | HTTP request loop  | n/a           | Yes     | Always            |
| SSE            | Server → client    | HTTP (text only)   | Yes (built-in)| No      | Yes               |
| WebSocket      | Bidirectional      | TCP after upgrade  | No            | Yes     | Often blocked     |
| Webhook        | Server → server    | HTTP POST          | n/a           | Yes     | n/a (server-only) |
```

**Pick by use case:**

- **Notifications, score tickers, log tail, AI streaming** → SSE. Simpler than WebSocket, free reconnect, works through every proxy.
- **Chat, collaborative editing, multiplayer games** → WebSocket. You need bidirectional and you need it fast.
- **Anything else, especially behind weird corporate firewalls** → polling. Boring and reliable.

---

## 4. Workers

JavaScript on the main thread shares the thread with rendering, layout, and input. CPU-heavy work blocks the UI. Workers run JS in a separate thread with no DOM access, communicating via `postMessage`.

### 4.1 Web Workers (dedicated)

One worker per page, owned by the page that created it. Dies when the page unloads.

```js
// main.js
const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
worker.postMessage({ cmd: 'sort', data: bigArray });
worker.onmessage = e => console.log('result', e.data);
worker.onerror = e => console.error(e.message);
worker.terminate();   // kill it

// worker.js
self.onmessage = e => {
  const { cmd, data } = e.data;
  if (cmd === 'sort') self.postMessage(data.sort());
};
```

**Transferable objects** — moving a 100 MB `ArrayBuffer` by *copy* takes seconds. Transfer instead:

```js
worker.postMessage(buffer, [buffer]);   // ownership moves to worker; main thread's buffer is now empty
```

`MessagePort`, `ReadableStream`, `OffscreenCanvas`, `ImageBitmap`, and `ArrayBuffer` are transferable.

### 4.2 Shared Workers

One worker shared across all tabs/iframes of the same origin. Useful for centralizing a connection (one WebSocket for all tabs) or coordinating cross-tab state. Lower browser support than dedicated workers — Safari shipped it late.

```js
const sw = new SharedWorker('./shared.js');
sw.port.onmessage = e => console.log(e.data);
sw.port.postMessage('hi');
sw.port.start();
```

### 4.3 Service Workers

A different beast — an **HTTP proxy** that sits between your page and the network. Survives tab close. Drives PWAs, offline, push notifications, background sync.

```js
// register
if ('serviceWorker' in navigator) {
  await navigator.serviceWorker.register('/sw.js');
}

// sw.js — intercept all fetches from controlled pages
self.addEventListener('install', e => {
  e.waitUntil(caches.open('v1').then(c => c.addAll(['/', '/app.js', '/style.css'])));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// activate — clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== 'v1').map(k => caches.delete(k)))
  ));
});
```

**Lifecycle is the hard part.** A new SW version doesn't take over from the old one until every controlled tab closes (unless you call `self.skipWaiting()` and `clients.claim()`). Stale SWs serving stale assets is a classic deploy bug.

### 4.4 Worker comparison

```
| Type            | Lifetime           | Scope             | DOM access | Use for                          |
|-----------------|--------------------|-------------------|------------|----------------------------------|
| Web (dedicated) | Page lifetime      | One page          | No         | CPU work (parse, crypto, math)   |
| Shared          | While any tab open | All tabs (origin) | No         | Shared connection, coordination  |
| Service         | Independent of tab | All pages (scope) | No         | Offline, caching, push, PWAs     |
```

---

## 5. Observers

The four observer APIs replaced what used to be done with scroll/resize listeners and `setInterval` polling — all four batch their callbacks and run them in a dedicated frame, far cheaper than the old way.

### 5.1 IntersectionObserver

Fires when an element enters or leaves the viewport (or another scroll container). The implementation that powers lazy-loading, infinite scroll, "scroll-spy" navigation, and impression analytics.

```js
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;  // lazy-load image
      io.unobserve(entry.target);
    }
  });
}, { rootMargin: '200px', threshold: 0.1 });

document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
```

- **`rootMargin`** — expand the trigger area. `'200px'` means "fire 200px before the element enters the viewport" — preload images before the user scrolls to them.
- **`threshold`** — fraction of the element visible (0 to 1). `[0, 0.5, 1]` fires at every quarter visibility.
- **`root`** — the scroll container. Defaults to the viewport.

### 5.2 MutationObserver

Watches DOM changes — child added/removed, attribute changed, text changed. Replaces the deprecated mutation events.

```js
const mo = new MutationObserver(mutations => {
  for (const m of mutations) {
    if (m.type === 'childList') console.log('added', m.addedNodes);
    if (m.type === 'attributes') console.log(m.attributeName, 'changed on', m.target);
  }
});
mo.observe(document.body, { childList: true, subtree: true, attributes: true });
mo.disconnect();
```

Used by ad blockers, accessibility tools that wait for dynamic content, and frameworks integrating with non-React-rendered DOM.

### 5.3 ResizeObserver

Fires when an element's content box size changes. Use this instead of listening to `window.resize` when you care about a specific element (which might resize because of CSS, parent flex, content change — none of which `window.resize` notices).

```js
const ro = new ResizeObserver(entries => {
  for (const e of entries) {
    const { width, height } = e.contentRect;
    console.log(e.target, width, height);
  }
});
ro.observe(panel);
```

### 5.4 PerformanceObserver

The streaming interface to performance entries — long tasks, paint, navigation, resource timing, layout shifts.

```js
new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) console.warn('long task', entry);
  }
}).observe({ type: 'longtask', buffered: true });
```

`buffered: true` replays entries that fired *before* you started observing — useful for measuring page load metrics that happen before your script runs.

---

## 6. History and Routing

The History API is what turns a multi-page experience into a single-page app. React Router, Vue Router, Next.js — all of them are wrappers around three primitives.

```js
// Push a new entry — URL changes, no page reload
history.pushState({ pageId: 42 }, '', '/products/42');

// Replace current entry (no new history entry)
history.replaceState({ pageId: 43 }, '', '/products/43');

// Listen for back/forward
window.addEventListener('popstate', e => {
  console.log('navigated to', location.pathname, e.state);
});

// Programmatic navigation
history.back();
history.forward();
history.go(-2);
```

**Key rules:**

- **`popstate` does NOT fire on `pushState`/`replaceState`** — only on user navigation (back/forward, hash change). You manually update your app state when you push.
- **The `state` object is structured-cloned and persisted** in the browser's history. ~640 KB limit. Don't put non-cloneable objects (functions, DOM nodes) in there.
- **Path must be same-origin.** `pushState({}, '', 'https://other.com/x')` throws.
- **Back-forward cache (bfcache)** — when the user navigates away and back, the browser may resurrect the *exact* in-memory page. Use `pageshow`/`pagehide` events with `e.persisted === true` to detect.

```js
window.addEventListener('pageshow', e => {
  if (e.persisted) console.log('restored from bfcache');
});
```

---

## 7. Performance API

The browser's built-in timeline. Three layers worth knowing:

```js
// 1. Navigation Timing — how the page itself loaded
const nav = performance.getEntriesByType('navigation')[0];
console.log('TTFB:', nav.responseStart - nav.requestStart);
console.log('DOMContentLoaded:', nav.domContentLoadedEventEnd);
console.log('load:', nav.loadEventEnd);

// 2. Resource Timing — every fetched asset
performance.getEntriesByType('resource').forEach(r => {
  console.log(r.name, r.duration, r.transferSize);
});

// 3. User Timing — your own measurements
performance.mark('parse-start');
parseHugeJSON();
performance.mark('parse-end');
performance.measure('parse', 'parse-start', 'parse-end');
performance.getEntriesByName('parse');  // [{ duration: 23.4, ... }]
```

`performance.now()` gives a high-resolution monotonic timestamp (microsecond-precise, immune to system clock changes — `Date.now()` is none of those things).

For Core Web Vitals (LCP, INP, CLS) and the `web-vitals` library, see the [React Guide § Performance](#) — the same metrics, more product-focused framing.

---

## 8. Scheduling APIs

Four ways to schedule work, each with a specific shape:

```js
// 1. setTimeout / setInterval — millisecond delay, no frame guarantee
setTimeout(fn, 0);   // "next tick" — actually clamped to ≥4ms in most browsers

// 2. queueMicrotask — runs BEFORE next paint, after current task
queueMicrotask(() => console.log('microtask'));   // same queue as Promise.then

// 3. requestAnimationFrame — runs right before the browser paints (~60Hz)
requestAnimationFrame(ts => {
  // ts = high-res timestamp; great for animation interpolation
  element.style.transform = `translateX(${x}px)`;
});

// 4. requestIdleCallback — runs when the browser is idle (low priority)
requestIdleCallback(deadline => {
  while (deadline.timeRemaining() > 0 && queue.length) processOne();
}, { timeout: 1000 });   // ...but at most 1s late
```

**Mental model — the event loop:**

```
[Run task to completion]
  ↓
[Drain ALL microtasks]    ← Promise.then, queueMicrotask, MutationObserver
  ↓
(maybe paint)             ← rAF callbacks run JUST before this
  ↓
(when idle) rIC callbacks
  ↓
[Pull next task]
```

This is why `await fetch(...)` can starve the event loop if the response comes back synchronously cached — microtasks can keep firing before the browser ever paints.

---

## 9. File, Blob, and Streams

Anything binary in the browser flows through these types.

```js
// Blob — immutable raw bytes + MIME type
const blob = new Blob([JSON.stringify({ x: 1 })], { type: 'application/json' });

// File — Blob with a name and lastModified, returned by <input type=file>
const file = inputEl.files[0];
console.log(file.name, file.size, file.type, file.lastModified);

// FileReader — old API, callback-based (still useful for non-stream cases)
const reader = new FileReader();
reader.onload = () => console.log(reader.result);
reader.readAsDataURL(file);   // base64 data: URL
reader.readAsText(file);
reader.readAsArrayBuffer(file);

// Modern alternatives — Promise-based, no FileReader needed
const text = await file.text();
const buf = await file.arrayBuffer();
const stream = file.stream();   // ReadableStream of Uint8Array chunks

// Convert to a downloadable URL
const url = URL.createObjectURL(blob);
anchor.href = url;
anchor.download = 'data.json';
anchor.click();
URL.revokeObjectURL(url);   // free memory when done
```

**Streams API** — a backpressure-aware async iteration over chunks. `fetch().body` is a `ReadableStream`. You can read it incrementally instead of waiting for the whole response:

```js
const res = await fetch('/big-file');
const reader = res.body.getReader();
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  process(value);   // Uint8Array chunk
}
```

Pipe through transforms — e.g., decompress on the fly:

```js
const decompressed = res.body.pipeThrough(new DecompressionStream('gzip'));
const text = await new Response(decompressed).text();
```

**Drag and drop** uses `DataTransfer`, which itself can hold `File`s:

```js
dropZone.addEventListener('dragover', e => e.preventDefault());
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  for (const file of e.dataTransfer.files) console.log(file.name);
});
```

---

## 10. Geolocation, Notifications, Clipboard

Three APIs you'll touch often, with very similar permission patterns.

### Geolocation

```js
navigator.geolocation.getCurrentPosition(
  pos => console.log(pos.coords.latitude, pos.coords.longitude),
  err => console.error(err.code, err.message),
  { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
);

const watchId = navigator.geolocation.watchPosition(pos => { /* ... */ });
navigator.geolocation.clearWatch(watchId);
```

Requires HTTPS. Triggers a permission prompt the first time. `enableHighAccuracy: true` uses GPS on mobile (slower, more battery).

### Notifications

```js
const perm = await Notification.requestPermission();
if (perm === 'granted') {
  new Notification('Hello', { body: 'World', icon: '/logo.png' });
}
```

For notifications that survive tab close (push), you need a Service Worker + Push API + a server holding VAPID keys.

### Clipboard

```js
// Read (requires user gesture + permission)
const text = await navigator.clipboard.readText();
const items = await navigator.clipboard.read();   // images, etc.

// Write
await navigator.clipboard.writeText('hi');
await navigator.clipboard.write([
  new ClipboardItem({ 'image/png': pngBlob })
]);
```

The legacy `document.execCommand('copy')` still works in some places but is deprecated; new code uses `navigator.clipboard`.

---

## 11. Web Crypto

Native cryptographic primitives — random, hash, HMAC, AES, RSA, ECDSA. Significantly faster and more secure than userland crypto libraries (operations run in native code, keys can be marked non-extractable). Available everywhere via `crypto.subtle`, plus the synchronous `crypto.getRandomValues` and `crypto.randomUUID`.

```js
// Cryptographically random bytes
const bytes = crypto.getRandomValues(new Uint8Array(16));

// UUID v4
crypto.randomUUID();   // 'a1b2c3d4-...'

// SHA-256 hash
const enc = new TextEncoder().encode('hello');
const hashBuf = await crypto.subtle.digest('SHA-256', enc);
const hex = [...new Uint8Array(hashBuf)].map(b => b.toString(16).padStart(2, '0')).join('');

// AES-GCM symmetric encryption
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
);
const iv = crypto.getRandomValues(new Uint8Array(12));
const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc);
const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
```

Keys can be **non-extractable** — you can use them to encrypt/sign but never read the bytes back, even from your own code. The browser holds them in a protected slot. This is what makes `crypto.subtle` fundamentally safer than `Math.random()` + a userland library.

`Math.random()` is **never** appropriate for security purposes. It's a deterministic PRNG, predictable from a small number of outputs. Use `crypto.getRandomValues` for tokens, IDs, and any random number that must be unpredictable.

---

## 12. Cross-Document and Cross-Tab Messaging

Three APIs, three different scopes:

### postMessage (cross-origin window/iframe)

```js
// In page A
iframe.contentWindow.postMessage({ type: 'hello' }, 'https://embed.example.com');

// In iframe B
window.addEventListener('message', e => {
  if (e.origin !== 'https://parent.example.com') return;   // ALWAYS check origin
  if (e.source !== window.parent) return;
  console.log(e.data);
});
```

The cornerstone of safe cross-origin communication. **Always validate `origin` and `source`** — without it you've opened your iframe to messages from any window that holds a reference.

### BroadcastChannel (same-origin tabs)

```js
const ch = new BroadcastChannel('app');
ch.postMessage({ type: 'logout' });

ch.addEventListener('message', e => {
  if (e.data.type === 'logout') location.reload();
});
```

Perfect for "user logged out in another tab — log them out here too." Doesn't require a Shared Worker.

### MessageChannel (paired ports)

```js
const { port1, port2 } = new MessageChannel();
port1.onmessage = e => console.log('port1 got', e.data);
port2.postMessage('ping');

// Transfer port2 to a worker
worker.postMessage({ port: port2 }, [port2]);
```

A two-ended pipe. Used internally by frameworks for worker RPC. Each port is its own EventTarget.

---

## 13. Page Lifecycle and Visibility

Knowing when the page is visible, hidden, or about to unload is the difference between draining queues correctly and leaking work.

```js
// Visibility — tab focused/hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseTimers();
  else resumeTimers();
});

// Page lifecycle (modern, preferred)
window.addEventListener('pagehide', e => {
  // Going away — possibly to bfcache (e.persisted === true)
  // Send analytics with sendBeacon, NOT fetch (fetch may be killed)
  navigator.sendBeacon('/analytics', JSON.stringify(events));
});
window.addEventListener('pageshow', e => {
  if (e.persisted) restoreFromBfcache();
});

// `beforeunload` — fires only on actual unload, NOT bfcache transitions
//   Modern browsers ignore custom strings; just preventDefault to prompt
window.addEventListener('beforeunload', e => {
  if (hasUnsavedChanges) e.preventDefault();
});
```

**`navigator.sendBeacon`** is critical — it queues a small POST that the browser commits to delivering even if the page is being torn down. `fetch` in `pagehide` is unreliable; `sendBeacon` is the right tool.

---

## 14. Permissions API

A unified way to query permission state without triggering a prompt.

```js
const status = await navigator.permissions.query({ name: 'geolocation' });
console.log(status.state);   // 'granted' | 'denied' | 'prompt'
status.addEventListener('change', () => console.log('now', status.state));
```

Names: `'geolocation'`, `'notifications'`, `'camera'`, `'microphone'`, `'clipboard-read'`, `'clipboard-write'`, `'persistent-storage'`, etc. Browser support varies by name — Safari historically lags.

Use this to **decide whether to show your permission UI**. If `state === 'granted'`, skip the "click here to enable" button. If `'denied'`, show "you've blocked this — fix it in browser settings."

---

## 15. URL and URLSearchParams

The boring API that everyone gets wrong with manual string concatenation.

```js
const url = new URL('https://example.com/path?x=1#frag');
url.protocol;   // 'https:'
url.host;       // 'example.com'
url.pathname;   // '/path'
url.search;     // '?x=1'
url.hash;       // '#frag'
url.searchParams;  // URLSearchParams instance

// Build a URL safely
const target = new URL('/api/users', location.origin);
target.searchParams.set('page', '2');
target.searchParams.set('q', 'hello world');   // properly URL-encoded
fetch(target);

// Parse a query string
const params = new URLSearchParams(location.search);
params.get('q');
params.getAll('tag');         // multiple values
params.has('q');
for (const [k, v] of params) console.log(k, v);
```

Always use these instead of `'?' + Object.entries(...).map(...)`. Encoding rules are non-trivial (spaces, unicode, special chars), and URLSearchParams gets them right.

---

## 16. Interview Questions & Answers

### Beginner

---

**Q1: What's the difference between `localStorage`, `sessionStorage`, and cookies?**

All three store data on the client, keyed by origin, but their lifetimes, scopes, and capabilities differ:

- **`localStorage`** — synchronous string KV store, ~5–10 MB, persists indefinitely, shared across tabs of the same origin. Not sent on requests.
- **`sessionStorage`** — same API, same size, but scoped to the **tab**. Cleared when the tab closes; not shared across tabs.
- **Cookies** — ~4 KB total per domain, sent automatically on every same-origin request, can be made `HttpOnly` (invisible to JS — defends against XSS) and `SameSite` (defends against CSRF). The only mechanism the server can both set and read.

Pick by the question "who needs to read this and when": server every request → cookie; client-only UI prefs → localStorage; per-tab transient state → sessionStorage. Auth tokens go in `HttpOnly` cookies, never `localStorage`.

---

**Q2: What does `addEventListener`'s third argument do?**

Either a boolean (legacy) for `useCapture`, or an options object:

- **`capture: true`** — listener fires during the capture phase (top-down) instead of bubbling. Useful for catch-all instrumentation.
- **`once: true`** — listener auto-removes after first fire.
- **`passive: true`** — promises you won't call `preventDefault()`. Lets the browser scroll without waiting for your handler. Required for good scroll perf on `touchstart`/`wheel`.
- **`signal`** — bind to an `AbortController`; calling `abort()` removes the listener.

```js
btn.addEventListener('click', fn, { once: true, signal: ac.signal });
```

---

**Q3: What's the difference between `fetch` and `XMLHttpRequest`?**

`fetch` is the modern Promise-based API. It's cleaner, integrates with async/await, and supports the Streams API for incremental response reading.

`XMLHttpRequest` predates Promises — callback-based with `onload`/`onerror`, but it has **upload progress** (`xhr.upload.onprogress`) which `fetch` lacks in widely-shipped browsers.

Pinch points to remember about `fetch`:

1. **HTTP errors don't reject** — a 500 resolves with `res.ok === false`. You must check yourself.
2. **The body is a stream readable once.** `res.json()` after `res.text()` throws.
3. **No upload progress.** Reach for XHR when you need it (or use a custom `ReadableStream` with `Request.body`).

---

**Q4: How do you fix CORS errors?**

CORS is enforced by the **browser**, not the server. The fix is always on the **server** — set the right `Access-Control-Allow-*` headers.

For a simple GET, the server needs `Access-Control-Allow-Origin: <your origin>` (or `*`). For non-simple requests (custom headers, methods like PUT/DELETE), the browser sends a **preflight OPTIONS** request first; the server must respond with `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` listing what's allowed, then the real request goes through.

If you need cookies cross-origin: client uses `credentials: 'include'`, server responds with `Access-Control-Allow-Credentials: true` AND a non-wildcard `Access-Control-Allow-Origin`.

For local dev, a proxy (Vite's `server.proxy`, Webpack DevServer's `proxy`) avoids the issue entirely by making the browser see same-origin.

---

**Q5: How does event delegation work and why is it useful?**

Attach **one** listener at a parent and use `event.target` to find which child fired. Two wins:

1. **Memory** — N items, 1 listener instead of N.
2. **Dynamic content** — children added later are handled by the same listener; no re-binding.

```js
list.addEventListener('click', e => {
  const item = e.target.closest('[data-id]');
  if (item) handleClick(item.dataset.id);
});
```

`closest()` is the unsung hero — it walks up from `event.target` until it finds an ancestor matching the selector, so a click on a `<span>` inside a `<li>` still resolves to the `<li>`.

---

### Intermediate

---

**Q6: What's the difference between WebSockets and Server-Sent Events?**

| | WebSocket | SSE |
|---|---|---|
| Direction | Bidirectional | Server → client only |
| Protocol | TCP after HTTP upgrade | Plain HTTP, long-lived response |
| Reconnect | You implement | Built-in (browser auto-retries) |
| Binary | Yes | No (text only) |
| Through proxies | Often blocked | Always works |
| Browser API | `WebSocket` | `EventSource` |

Pick **SSE** for one-way streams: notifications, logs, AI token streaming, score tickers. The free auto-reconnect with `Last-Event-ID` replay is a huge win.

Pick **WebSockets** when you need bidirectional or when latency matters (chat, multiplayer, collab editing). Plan on writing your own reconnect logic with backoff.

For most "real-time" features, SSE is enough and simpler than people assume.

---

**Q7: What is `AbortController` and why does it matter?**

Standard cancellation primitive across the platform. One controller produces a `signal`; the signal is accepted by `fetch`, `addEventListener`, async iterators, and most modern web APIs. Calling `controller.abort()` rejects pending operations with an `AbortError` and removes attached listeners.

Three patterns it unlocks:

1. **Timeouts** — `AbortSignal.timeout(5000)` is shorthand for "cancel after 5s."
2. **Cancellable requests** — abort the in-flight request when the user navigates away or types a new search.
3. **Bulk listener removal** — register every listener for a component with the same `signal`, call `abort()` in cleanup. One line replaces N `removeEventListener` calls.

```js
const ac = new AbortController();
fetch('/x', { signal: ac.signal });
btn.addEventListener('click', fn, { signal: ac.signal });
// later — both cancelled:
ac.abort();
```

---

**Q8: When would you use IndexedDB over localStorage?**

`localStorage` is fine for small (sub-MB), low-frequency, simple key-value data — UI prefs, "last-seen" timestamps, small cached responses. It's synchronous (so it blocks the main thread) and limited to 5–10 MB.

Reach for **IndexedDB** when you have:

- **Lots of structured data** with queries and indexes (find all orders where status = 'pending').
- **Offline-first** workflows where you need full CRUD locally and sync to the server later.
- **Binary blobs** (images, audio, files) — `localStorage` can't store them efficiently.
- **Quotas measured in GBs** — IDB can use ~50% of free disk.
- **Async access** — never blocks the main thread.

The native API is unpleasant; use a wrapper like **idb** (Promise-based, ~1 KB) or **Dexie** (richer query API).

---

**Q9: How does `IntersectionObserver` work and what's it good for?**

Asynchronous API for detecting when an element enters or leaves the viewport (or another scroll container). Replaces fragile scroll-listener + `getBoundingClientRect` polling.

```js
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) loadImage(e.target); });
}, { rootMargin: '200px', threshold: 0.1 });
io.observe(el);
```

Use cases:

- **Lazy-loading images** below the fold (or use the native `loading="lazy"` for the simple case).
- **Infinite scroll** — observe a sentinel at the list's end; fire fetch when it enters view.
- **Impression analytics** — fire one event when an ad/section is at least 50% visible.
- **Active-section nav** — highlight the side-nav entry whose section is currently in view.

The browser batches callbacks and runs them in a dedicated frame, so it scales to thousands of observed elements without scroll jank.

---

**Q10: What's the difference between `requestAnimationFrame` and `setTimeout`?**

- **`setTimeout(fn, 0)`** schedules `fn` to run on the next event-loop tick (clamped to ≥4ms in most browsers). It has **no relation** to the screen refresh — your animation can run between frames and never get drawn.
- **`requestAnimationFrame(fn)`** runs `fn` *just before the next paint*, syncing your update with the browser's render cycle (~60Hz, more on high-refresh-rate displays). Receives a high-resolution timestamp for interpolation.

```js
function animate(ts) {
  el.style.transform = `translateX(${(ts / 10) % 200}px)`;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

`rAF` is also auto-paused when the tab is hidden — `setTimeout` keeps firing in the background. For animations, **always** use `rAF`.

For idle work (analytics flush, prefetching), use `requestIdleCallback`.

---

### Advanced

---

**Q11: How do Service Workers differ from Web Workers?**

Both run JS off the main thread with no DOM access, communicating via `postMessage`. The differences are about **lifetime** and **purpose**:

| | Web Worker | Service Worker |
|---|---|---|
| Lifetime | Tied to the page | Independent of any page |
| Scope | One page | All pages under a URL scope |
| Survives tab close | No | Yes |
| Intercepts fetch | No | Yes (it's an HTTP proxy) |
| Use for | CPU work | Offline, caching, push, PWAs |

A Service Worker is fundamentally an **HTTP proxy** that sits between your pages and the network. It's how PWAs work offline — the SW listens to `fetch` events and replies from the Cache API. It's also how push notifications work, since it's still alive after the tab closes.

Web Workers are for pure computation: parsing huge JSON, image processing, crypto, ML inference.

---

**Q12: What's the Web Crypto API and when must you use it instead of a library?**

`crypto.subtle` provides native primitives — random, hash, HMAC, AES, RSA, ECDSA — running in browser-native code. It's faster than userland JS, and it supports **non-extractable keys**: keys you can use to encrypt/sign but cannot read out, even from your own code. The browser holds them in a protected slot.

You **must** use it (or its server equivalent) any time security depends on the operation — passwords, tokens, encryption keys, signatures. Never use `Math.random()` for anything security-related; it's a deterministic PRNG predictable from a few outputs. `crypto.getRandomValues` and `crypto.randomUUID` are the right tools for unpredictable IDs.

Userland libraries (`bcrypt.js`, `CryptoJS`) still have niche uses (legacy algorithms, password hashing — Web Crypto doesn't yet ship a good password KDF API), but for everyday symmetric crypto, hashing, and randomness, prefer the native API.

---

**Q13: What's the back-forward cache (bfcache) and how does it interact with your code?**

When the user navigates away from a page and back, the browser may resurrect the **exact in-memory page** — JS state, scroll position, even open WebSockets — without re-running anything. This is bfcache, and it's the reason the back button feels instant on well-built sites.

Your code must handle bfcache transitions:

- **`pagehide`** with `e.persisted === true` — page is being frozen, not unloaded. Don't tear down what you'll need on resume.
- **`pageshow`** with `e.persisted === true` — page was restored from bfcache. Refresh stale data, reconnect WebSockets the browser silently dropped, restart timers.

Things that **prevent** bfcache eligibility: `unload` listeners, open IndexedDB transactions, `Cache-Control: no-store`. If your page won't bfcache, the back button is slow — it's worth diagnosing in DevTools' Application panel.

---

**Q14: How do `postMessage`, `BroadcastChannel`, and `MessageChannel` compare?**

All three are message-passing APIs, with different scopes:

- **`window.postMessage`** — cross-origin between windows/iframes. Required to talk to an embedded iframe on a different origin. **Always validate `event.origin` and `event.source`** in the receiver.
- **`BroadcastChannel`** — same-origin broadcast across tabs/iframes/workers. One named channel; everyone subscribed receives every message. Perfect for "user logged out — log out everywhere."
- **`MessageChannel`** — creates a paired `MessagePort` duplex. Used for RPC-style worker communication; you can transfer one port to a worker and have a private bidirectional channel.

All three serialize messages with the **structured clone algorithm** (no functions, no DOM nodes; cycles are fine).

---

**Q15: What's the structured clone algorithm and where does it apply?**

The platform's algorithm for **deep-copying** values across realms — workers, `postMessage`, `history.pushState`, `IndexedDB`, `Cache.put`. Roughly:

- Handles cycles (a → b → a doesn't infinite loop).
- Copies typed arrays, Maps, Sets, Dates, RegExps, Blobs, Files, ArrayBuffers correctly.
- **Fails on**: functions, DOM nodes, class instances with custom prototypes (you get a plain object back), Symbols, Proxies.

`structuredClone(value)` exposes it directly — a faster, more correct deep-clone than `JSON.parse(JSON.stringify(...))`:

```js
const copy = structuredClone({ map: new Map([[1, 2]]), date: new Date() });
// JSON.parse/JSON.stringify would lose both the Map and Date types.
```

For huge ArrayBuffers, you can **transfer** ownership instead of cloning — the original becomes detached, but the copy is free.

---

**Q16: How would you implement infinite scroll without performance issues?**

Three pieces:

1. **`IntersectionObserver` on a sentinel** at the list's end. When it intersects, fetch the next page and append. Scales to thousands of items because there's only one observer.
2. **Append, don't replace.** Replacing the whole list reflows everything; appending adds only the new nodes.
3. **Virtualization above some threshold.** Even with appending, the DOM grows unboundedly. After N items (~1000), drop offscreen items from the DOM (`react-virtual`, `react-window`) so the browser only renders what's visible.

Plus the small-but-important details: keep a stable `key` per item (so React reconciliation doesn't shuffle state), track the last fetched cursor (not the page number — page numbers break when items shift), and ignore the IO callback while a fetch is in flight to avoid double-loads.

---

## 17. Tricky Questions

Practice questions testing your understanding of how the browser actually behaves under specific edge cases.

### Storage & Lifecycle

---

**Q1: A user opens your app in two tabs. Tab A writes `localStorage.setItem('user', 'alice')`. Will Tab B's `'storage'` event fire? Will Tab A's?**

**Output:** Tab B's `'storage'` event fires. Tab A's does not.

**Explanation:**

The `'storage'` event is a *cross-tab* mechanism — it's the browser telling other tabs of the same origin "something changed in storage that you might care about." It explicitly does not fire in the tab that *made* the change, because that tab already knows; firing in the writer would create a guaranteed reentrancy hazard for any code that writes inside its own listener.

This is a frequent source of bugs in code that tries to keep tabs in sync. Developers add a `'storage'` listener that also calls `setItem` (e.g., to update a derived field), expect the listener to fire on both tabs, and end up with the writer's UI silently out of sync. The fix is to update the local UI **synchronously after the write** in the same tab and rely on the `'storage'` event only for the *other* tabs. Modern code often replaces this dance with `BroadcastChannel`, which has the same scope (same-origin, cross-tab) and a more natural API — though `BroadcastChannel` *also* doesn't echo to the sender by default.

The same gotcha applies to `sessionStorage` writes — they don't fire `'storage'` in *any* tab because `sessionStorage` is per-tab; cross-tab notification doesn't make sense for tab-scoped state.

**Takeaway:** `'storage'` events fire only in **other** tabs of the same origin. Update the writing tab synchronously, and consider `BroadcastChannel` for cleaner cross-tab messaging.

---

**Q2: A page calls `localStorage.setItem('cart', JSON.stringify(bigArray))` where `bigArray` is 50,000 items. The call throws `QuotaExceededError`. After the throw, what's the state of `localStorage.getItem('cart')`?**

**Output:** Whatever was there before the failed `setItem` call — the partial write does not happen.

**Explanation:**

`localStorage.setItem` is **atomic** — it either stores the entire serialized value or it stores nothing. When the browser starts the write, it first computes the size of the new value, sums it with existing storage, and compares to the quota; if the result would exceed the quota, the call throws **before** modifying any state. There is no partial write to clean up.

However, two subtleties trip people up:

1. **The quota is shared across origin storage**, not just `localStorage`. IndexedDB, Cache API, and others draw from the same per-origin pool in some browsers. A heavy IndexedDB user can crowd out a `localStorage` write of any size. The error you get is the same `QuotaExceededError` regardless of which API filled the pool.

2. **The thrown error is recoverable**, but a robust handler shouldn't just retry blindly — the user's quota is full and your write *will* fail again. The right pattern is to catch, prune the value (e.g., drop optional fields, evict old cache entries), and retry; or surface a "we couldn't save your cart" UX rather than failing silently.

The one place the atomicity guarantee breaks down is if the value contains a circular reference or something `JSON.stringify` cannot serialize — `JSON.stringify` throws *before* `setItem` runs, so storage is untouched, but the call site needs to handle that error too.

**Takeaway:** `localStorage.setItem` is atomic — failed writes leave existing values intact. Catch `QuotaExceededError`, but treat it as "user is out of space," not "transient error to retry."

---

**Q3: A site sets `document.cookie = 'sid=abc; HttpOnly; Path=/'` from JavaScript. On the next page load, the cookie is missing. Why?**

**Output:** The cookie was silently rejected. `HttpOnly` cookies can only be set by the **server** via `Set-Cookie` headers — JavaScript cannot set them.

**Explanation:**

The `HttpOnly` flag exists specifically to keep auth cookies away from JavaScript so they survive an XSS attack. The browser enforces this by stripping `HttpOnly` from any cookie set via `document.cookie` and — in most modern browsers — refusing to set the cookie at all (the assignment silently no-ops). There's no thrown error, no warning unless DevTools is open.

This catches teams that try to "set the cookie from JS for SPA convenience and just use the same name as the server one." That cookie doesn't have `HttpOnly`, so an XSS payload *can* read it; meanwhile the server's `HttpOnly` version may be shadowed or conflicting depending on path/domain. The result is a security regression that looks like a working feature.

The correct pattern: server sets the auth cookie via `Set-Cookie: sid=...; HttpOnly; Secure; SameSite=Lax; Path=/`, the browser attaches it automatically to every same-origin request, and JavaScript never touches it. If JS *needs* to know whether the user is logged in, the server returns a separate non-`HttpOnly` "is_authenticated: true" cookie or a `/me` endpoint — the auth cookie itself stays opaque to JS.

The same rule applies to `Secure` over HTTP and `SameSite` flags — JavaScript can set them, but trying to set `HttpOnly` from JS is ignored.

**Takeaway:** `HttpOnly` cookies are server-only. If JS needs auth state, request it from the server; never try to mirror an `HttpOnly` cookie in JS.

---

### Network & Async

---

**Q4: A `fetch('/api/data')` request returns HTTP 500. What does the awaited promise resolve to?**

```js
try {
  const res = await fetch('/api/data');
  console.log('try:', res.ok, res.status);
} catch (e) {
  console.log('catch:', e.message);
}
```

**Output:** `try: false 500`

**Explanation:**

This trips up half the people who learned `fetch` from a tutorial. `fetch` only **rejects** on *network* failures — DNS failure, no internet, connection refused, CORS preflight rejection, abort signal, redirect to a different scheme. It does **not** reject on HTTP error status codes (4xx/5xx). The reasoning from the spec: HTTP responses are still "successful" from the browser's transport perspective; the application interprets the status.

The consequence is that idiomatic `fetch` always looks like:

```js
const res = await fetch(url);
if (!res.ok) throw new Error(`HTTP ${res.status}`);   // explicit re-throw
return res.json();
```

Wrapping `fetch` in a helper that converts non-2xx to thrown errors is so universal that libraries like `ky`, `wretch`, and `axios` all do it by default. Every team eventually writes one or adopts one — usually after a Sentry alert shows that a 500 silently became `{}` because the code did `await res.json()` without checking.

A second variant of this trap: a 401 *with* a JSON body that's not valid JSON makes `res.json()` throw a SyntaxError. The 500 case logs as "JSON parse error," and the real cause (the 5xx) is invisible without manual logging. Always check `res.ok` first; if it's false, log the status and `await res.text()` to capture whatever the server actually sent.

**Takeaway:** `fetch` resolves on any HTTP response, even 5xx. Always check `res.ok` and throw yourself — or use a wrapper that does it for you.

---

**Q5: A search input fires a `fetch` on every keystroke. Without `AbortController`, what's the user-visible bug? With it, what changes?**

**Explanation:**

Without abort, every keystroke launches a request, and the responses come back **out of order**. The user types `iphon`, you fire `?q=i`, `?q=ip`, `?q=iph`, `?q=ipho`, `?q=iphon`. If `?q=ip` happens to be slow (cache miss, pod cold-start) and `?q=iphon` is fast, the slow `?q=ip` response *arrives last* and overwrites the more specific result. The user sees results for "ip" while their input shows "iphon."

The naive fix — "track the latest query string and ignore old responses" — works but each ignored response still wastes bandwidth, server CPU, and (on metered connections) the user's data. With `AbortController`, you actually cancel the in-flight request:

```js
let ac;
input.addEventListener('input', async e => {
  ac?.abort();                          // cancel previous
  ac = new AbortController();
  try {
    const res = await fetch(`/search?q=${e.target.value}`, { signal: ac.signal });
    setResults(await res.json());
  } catch (err) {
    if (err.name !== 'AbortError') throw err;
  }
});
```

The `AbortError` reaches the catch, you ignore it, and the canceled request is never billed in your CDN logs. The browser also closes the underlying TCP/HTTP/2 stream, so the server stops processing the query if it hasn't already (assuming a server framework that propagates request cancellation — Node's `req.aborted`, Go's `context.Done()`, etc.).

A subtler win: pair the same signal with `AbortSignal.timeout(5000)` via `AbortSignal.any()` and you've got per-keystroke cancellation **plus** a 5-second timeout in three lines. Without `AbortController`, doing both correctly is a half-page of code.

**Takeaway:** Without abort, async user input creates a race between keystrokes; results can land in the wrong order. `AbortController` cancels stale requests cleanly and lets you compose timeouts.

---

**Q6: A page has 6 simultaneous `fetch` calls to the same origin. Some complete fast, others take 30+ seconds even though the server isn't slow. Why?**

**Output:** HTTP/1.1's per-origin connection limit (typically 6) is the bottleneck — requests beyond it queue at the browser.

**Explanation:**

HTTP/1.1 has no in-flight request multiplexing — each TCP connection can serve one request at a time. Browsers cap concurrent connections per origin (typically **6 in Chrome/Firefox**) to avoid hammering servers. If you fire 10 concurrent `fetch`es to one origin over HTTP/1.1, six get connections immediately and **four queue at the browser** until a connection frees up. Slow requests block the queue: a single 30-second request occupies one of the six slots for the duration. The slow request itself isn't the bug — the *queue head-of-line blocking* is what makes the others look slow.

Two fixes, in order of leverage:

1. **Switch to HTTP/2 or HTTP/3.** Both multiplex many requests over a single connection — the per-origin limit becomes effectively unlimited (at least, far higher than 6). This is the real fix; almost any production CDN supports it. Verify with DevTools' Network → Protocol column.

2. **Shard origins.** If you're stuck on HTTP/1.1, split static assets across `cdn1.example.com`, `cdn2.example.com`, etc. — each origin gets its own pool of 6. This used to be standard advice; it's actively *harmful* on HTTP/2 because each origin is a new TCP+TLS handshake.

Same lesson with WebSockets: each WebSocket counts as a connection, so a page with two WebSockets and 5 in-flight fetches over HTTP/1.1 is already at capacity. On HTTP/2, the connection is reused.

This is also why opening DevTools and "throttling to slow 3G" doesn't reproduce the same symptom — the throttle slows everything uniformly, while HTTP/1.1 head-of-line blocking only manifests when one specific request hangs.

**Takeaway:** HTTP/1.1's per-origin connection limit (~6) creates head-of-line blocking; one slow request can stall others. Use HTTP/2 to multiplex over a single connection.

---

### Workers & Threading

---

**Q7: A page does `worker.postMessage(bigArray)` where `bigArray` is a 100 MB `Float64Array`. The main thread freezes for 800ms. What happened, and how do you fix it?**

**Explanation:**

`postMessage` *clones* the value by default, using the structured clone algorithm. For a 100 MB typed array, the browser must allocate another 100 MB and walk every byte — that's the 800ms freeze. The clone runs synchronously on the main thread before `postMessage` returns; the worker doesn't see the message until the clone finishes.

The fix is **transferable objects**. `ArrayBuffer`, `MessagePort`, `ReadableStream`, `OffscreenCanvas`, and `ImageBitmap` can be *transferred* — ownership moves to the receiver, the sender's reference is detached, and the operation is essentially free (just a pointer hand-off):

```js
worker.postMessage(bigArray.buffer, [bigArray.buffer]);
// After this line, bigArray.buffer is detached on the main thread.
// Any further read of bigArray throws or returns 0-length data.
```

Notice the second argument — the **transfer list**. Without it, the buffer is cloned. With it, ownership moves. This is one of the few places in JavaScript where you can have memory genuinely "move" rather than be referenced from two places.

A related gotcha: the worker can transfer the buffer back when it's done, so the main thread regains ownership for further work. If you forget to transfer back, the main thread can't read the worker's results without another clone.

For shared ownership (both threads reading/writing the same memory simultaneously), the answer is **`SharedArrayBuffer`** with `Atomics` for synchronization — but `SharedArrayBuffer` requires cross-origin isolation (`COOP`/`COEP` headers), which most apps don't set up by default.

**Takeaway:** `postMessage` clones by default — that's a 100 MB walk for a 100 MB buffer. Use the transfer list (`postMessage(data, [data.buffer])`) to move ownership instead.

---

**Q8: A Service Worker caches `/app.js`. You deploy a new version of `/app.js` with a different content. Users reload the page and still see the old version. What's the fix?**

**Explanation:**

Service Worker lifecycle is intentionally conservative. When you deploy a new SW (`/sw.js`), the browser fetches it on the next page load, sees it's different, and **installs it as the "waiting" worker**. The current SW keeps controlling all open tabs until **every** tab navigates away or closes — at which point the new SW activates.

Now layer the cache on top: the *old* SW is still controlling the page, and its `fetch` listener responds from the *old* cache. Even though the user just reloaded, their `/app.js` request goes through the SW, which serves the cached old version. Closing one tab isn't enough; the user has to close **all** tabs of your origin (and sometimes the browser itself) before the new SW takes over and refreshes the cache.

Two patches, applied in the new SW:

1. **`self.skipWaiting()` in the `install` handler** — bypass the "waiting" stage, activate immediately even with tabs open.
2. **`self.clients.claim()` in the `activate` handler** — take over already-loaded pages without waiting for them to navigate.

```js
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
```

Plus a **versioned cache name** (`v2`, `v3`...) and an `activate` handler that deletes old caches:

```js
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== 'v2').map(k => caches.delete(k)))
  ));
});
```

Without the cache cleanup, old versions accumulate forever and eventually hit quota. Without `skipWaiting`/`claim`, deploys take effect inconsistently — some users get the new code immediately, others not until they restart their browser. The full pattern is what tools like Workbox encode by default.

**Takeaway:** New Service Workers wait for all tabs to close before activating. Combine `skipWaiting` + `clients.claim` + versioned caches to make deploys take effect on the next reload.

---

### DOM & Events

---

**Q9: An iframe at `https://embed.example.com` does `window.parent.postMessage('hello', '*')`. The parent at `https://main.example.com` has `addEventListener('message', e => eval(e.data))` (yes, really). What goes wrong, beyond the obvious `eval` issue?**

**Explanation:**

Two compounding security problems beyond the `eval`:

1. **The receiver doesn't validate `event.origin`.** Any window on the internet that holds a reference to `main.example.com`'s window (via `window.open` or being framed) can `postMessage` and the parent will execute it. Not just `embed.example.com` — any origin. The `*` wildcard the *sender* uses just means "I don't care who reads this"; it has nothing to do with what the *receiver* should accept. Receivers must always check `event.origin` against an allowlist.

2. **The receiver doesn't validate `event.source`.** Even if origin were correct, an attacker page can include the same iframe and use *that* frame's reference to relay messages. Always check that `event.source === expectedFrame.contentWindow` (or `=== window.parent` for child-to-parent direction).

The correct pattern:

```js
window.addEventListener('message', e => {
  if (e.origin !== 'https://embed.example.com') return;
  if (e.source !== iframe.contentWindow) return;
  // Now safe to handle e.data — but still don't eval.
});
```

A sneakier variant: when the sender says `postMessage('hello', '*')`, anyone listening (including malicious frames inside *the same parent*) can read it. If the message contains tokens or PII, the sender should target a specific origin: `postMessage('hello', 'https://embed.example.com')`. The browser then refuses to deliver if the iframe has navigated to a different origin in between — a useful integrity check.

Real bugs along this pattern have been found in production payment widgets, OAuth flows, and even browser extensions.

**Takeaway:** `postMessage` security is the *receiver's* job — always check `event.origin` and `event.source`. The sender's target argument is a delivery filter, not authentication.

---

**Q10: A click handler attached with `passive: true` calls `e.preventDefault()`. What happens?**

**Explanation:**

The browser silently ignores the `preventDefault()` call and prints a warning to the console: *"Unable to preventDefault inside passive event listener invocation."* The default action proceeds.

The semantics: `passive: true` is the developer **promising** the browser they will not cancel the default action. With that promise, the browser can run the default (typically scrolling or zooming) **in parallel** with the JS handler — it doesn't have to wait to see if you'll prevent it. The performance win is huge on mobile: scroll on a page without passive listeners is gated on JS execution, so a slow `touchstart` handler turns smooth scroll into stutter. With passive listeners, scroll happens on the compositor thread immediately while JS runs concurrently.

To make this fast path safe, browsers refuse to honor a `preventDefault()` from a passive handler — otherwise the default action could already be in flight before JS finished. The warning is the only feedback; the page behaves as if you hadn't called `preventDefault` at all.

For touch and wheel events, modern browsers default `passive: true` *automatically* on root-element listeners (`document`, `body`, `window`). If you actually need to call `preventDefault` (e.g., to lock scroll during a swipe gesture), you must explicitly opt out: `addEventListener('touchstart', fn, { passive: false })`. That's a real performance cost, so do it only on the specific elements that need it, not the document root.

For non-touch events (`click`, `submit`, etc.), passive is rarely needed and `passive: false` is the default — `preventDefault` works as expected there.

**Takeaway:** `passive: true` is a developer promise not to call `preventDefault`. Calls are silently ignored with a console warning. Browsers default touch/wheel listeners to passive — opt out with `{ passive: false }` only when you genuinely need to cancel scroll.

---

### Lifecycle & Performance

---

**Q11: A page sends analytics on `beforeunload` via `fetch('/track', { method: 'POST', body, keepalive: true })`. Some events arrive, but ~30% are missing in production. Why, and what's the fix?**

**Explanation:**

`beforeunload` and `unload` are unreliable triggers — and modern browsers have made them *more* unreliable on purpose, because pages were abusing them for "are you sure you want to leave" prompts. Several things conspire against the analytics call:

1. **`beforeunload` doesn't fire on all navigations.** Mobile browsers, in particular, often kill the tab when the user switches to another app without firing `beforeunload`. Crashes don't fire it. Force-closing the tab doesn't fire it.
2. **`fetch` requests started in `beforeunload` may be killed when the page unloads** before they reach the network. `keepalive: true` helps but has a 64 KB body limit and isn't supported in every browser version.
3. **`unload` is even worse** — it doesn't fire when the page enters bfcache (back/forward cache), so users who navigate via back/forward never trigger it.

The robust pattern is `pagehide` + `navigator.sendBeacon`:

```js
window.addEventListener('pagehide', e => {
  navigator.sendBeacon('/track', JSON.stringify(events));
});
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    navigator.sendBeacon('/track', JSON.stringify(events));
  }
});
```

`sendBeacon` is designed for exactly this case: the browser commits to delivering the small POST even if the page is being torn down. It returns immediately (non-blocking), and the browser handles the network call separately.

**Why both `pagehide` and `visibilitychange`:** mobile users often *don't* unload the page — they switch apps. The page becomes hidden but stays alive in memory; `pagehide` may not fire until much later (or never, if the OS reaps the tab). `visibilitychange` to `'hidden'` fires immediately on app-switch, and that's your last reliable chance to flush.

Modern analytics libraries (Sentry, Datadog RUM, Google Analytics) all do this dance internally — fire on visibility-hidden, not on unload — for the same reason.

**Takeaway:** `beforeunload`/`unload` are unreliable, especially on mobile. Use `navigator.sendBeacon` triggered on `pagehide` and `visibilitychange→'hidden'` for analytics flush.

---

**Q12: `requestAnimationFrame` is called with a function that schedules *another* `requestAnimationFrame` to run "next frame." On a page that's hidden (background tab), this animation visibly lags when the tab becomes visible again. Why?**

**Explanation:**

Browsers throttle or pause `requestAnimationFrame` callbacks when the tab is hidden. In Chrome, the callback frequency drops to roughly 1 Hz (one call per second) after the tab has been backgrounded for a while; some browsers stop firing rAF entirely until the tab becomes visible. Your animation loop, which assumed 60 FPS, instead got 1 callback per second for the duration the tab was hidden.

When the tab becomes visible again, three things compound:

1. **Animation state is stale.** Your animation thinks 60 frames have passed since the user last looked at it; the browser thinks 0 frames have passed. If you advance state by a fixed delta per frame, you're 60 frames behind real time.
2. **The first rAF after visibility-change can be a "catch-up" frame** — some browsers fire one immediately, and your callback advances state by the assumed 16ms. A naive animation jumps forward by one frame's worth, which looks fine; one that integrates "I should be at second 30 now" jumps by a huge amount.
3. **A `setInterval`-based animation has the opposite problem** — it keeps firing in the background (though throttled to ≥1s), so timers run *more* than expected by visible-time and the animation's perceived speed is wrong.

The fix is to use the **timestamp argument** rAF passes you, not a frame counter:

```js
let lastTs = 0;
function loop(ts) {
  const dt = lastTs ? ts - lastTs : 16;
  lastTs = ts;
  if (dt < 100) advance(dt);   // skip integration if we paused (>100ms gap)
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

By integrating against the actual elapsed time and **clamping** the maximum dt, you get correct animation when the tab is visible and a clean reset when it returns from being hidden. The clamp is what avoids the "animation jumps forward by 30 seconds" effect when the tab is unhidden after being away.

A second pattern: pause your animation explicitly on `visibilitychange → hidden` and resume on `visibilitychange → visible`. Cheaper than computing through pause periods, especially for things like games where simulation has costs beyond animation.

**Takeaway:** rAF is throttled or paused in hidden tabs. Use the timestamp argument and clamp dt — or pause/resume on `visibilitychange`.

---

### Tricky Cheat Sheet

```
1.  fetch only rejects on network error — 4xx/5xx resolve with ok=false
2.  storage event fires only in OTHER tabs of the same origin
3.  HttpOnly cookies cannot be set from JavaScript — server-only
4.  postMessage clones by default — use transfer list for ArrayBuffers
5.  Always validate event.origin AND event.source on message receivers
6.  passive: true silently ignores preventDefault — opt out for swipe gestures
7.  rAF is throttled (~1Hz) or paused in hidden tabs
8.  HTTP/1.1 caps ~6 connections per origin → head-of-line blocking
9.  beforeunload is unreliable — use sendBeacon on pagehide/visibilitychange
10. Service Workers wait for all tabs to close — use skipWaiting + clients.claim
11. AbortController cancels both fetch AND addEventListener via signal
12. structuredClone handles Map/Set/Date/Blob; JSON.parse(JSON.stringify(...)) doesn't
13. localStorage.setItem is atomic — failed writes leave existing value intact
14. document.cookie is a single string of ALL cookies — parse it carefully
15. Use IntersectionObserver, not scroll listeners, for visibility detection
```

---

## References

- [MDN — Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) — the canonical reference for every API listed here
- [web.dev](https://web.dev) — Google's modern web platform guides (PWAs, performance, security)
- [HTML Living Standard](https://html.spec.whatwg.org/) — the spec itself; surprisingly readable
- [Can I Use](https://caniuse.com) — browser support matrix for any feature
- [The Modern JavaScript Tutorial — Browser](https://javascript.info/ui) — DOM, events, UI events in depth
