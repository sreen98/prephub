# Real-Time Web — Polling, SSE, WebSockets & Beyond

HTTP, by design, is request/response. The client asks; the server answers. That's perfect for fetching a profile page, fine for submitting a form, and completely useless when the server is the one with new information — a chat message arrived, a stock price ticked, the build finished, another player moved.

This guide is about the patterns and protocols built on top of (or alongside) HTTP to solve that problem: **how does the server tell the client something happened?** Each pattern trades latency, complexity, scalability, and browser support differently, and senior front-end interviews very often probe whether you can pick the right one.

We cover the full spectrum — short polling, long polling, Server-Sent Events, WebSockets, fetch streaming, WebRTC data channels, the Push API, and GraphQL Subscriptions — with both client and minimal server-side examples (Node.js with `ws`, Express, etc.), then close with production concerns, a decision table, interview questions, and tricky scenario questions.

## Table of Contents

- [1. The Problem: HTTP is Request/Response](#1-the-problem-http-is-requestresponse)
- [2. Short Polling](#2-short-polling)
- [3. Long Polling](#3-long-polling)
- [4. Server-Sent Events (SSE)](#4-server-sent-events-sse)
- [5. WebSockets](#5-websockets)
- [6. HTTP Streaming with `fetch` + ReadableStream](#6-http-streaming-with-fetch--readablestream)
- [7. WebRTC DataChannels](#7-webrtc-datachannels)
- [8. Push API + Service Workers](#8-push-api--service-workers)
- [9. GraphQL Subscriptions](#9-graphql-subscriptions)
- [10. Decision Table — Picking a Transport](#10-decision-table--picking-a-transport)
- [11. Production Concerns](#11-production-concerns)
- [12. Interview Questions & Answers](#12-interview-questions--answers)
- [13. Tricky Questions](#13-tricky-questions)
- [References](#references)

---

## 1. The Problem: HTTP is Request/Response

Every transport pattern in this guide exists because of a single architectural fact:

> The server cannot speak unless the client asked first.

A normal HTTP request is one round-trip:

```
Client  ─── GET /messages ────►  Server
        ◄── 200 OK + body ────
```

After the response arrives, the connection is closed (HTTP/1.1 with keep-alive reuses the TCP socket, but each request is still client-initiated). If a new message arrives at the server one second later, the server has no way to tell the client.

**The four families of solutions:**

| Family | Technique | One-liner |
|---|---|---|
| **Repeatedly ask** | Short polling | Client makes new requests on a timer |
| **Ask, then wait** | Long polling | Server holds the request open until data exists |
| **One persistent stream** | SSE, fetch streaming | Server keeps writing to one long-lived response |
| **Bidirectional channel** | WebSocket, WebRTC | Either side can send a message any time |

Push API is a fifth, separate thing — it lets the server wake the *browser*, not just an open page, via the OS notification system. Useful when the tab might be closed.

---

## 2. Short Polling

The simplest answer: the client just keeps asking.

```js
// Client — short polling
const POLL_MS = 5000;

async function poll() {
  try {
    const res = await fetch('/api/messages?since=' + lastSeen);
    const data = await res.json();
    if (data.length) handleNewMessages(data);
  } catch (err) {
    console.error('poll failed', err);
  }
}

const id = setInterval(poll, POLL_MS);
// Stop on unmount: clearInterval(id);
```

```js
// Server — Express
app.get('/api/messages', (req, res) => {
  const since = Number(req.query.since) || 0;
  res.json(db.messagesAfter(since));
});
```

**Pros**

- Trivially simple. Works through every proxy, firewall, load balancer.
- Stateless on the server — each request is independent, scales horizontally with no thought.
- No special infrastructure.

**Cons**

- **Wasted requests.** With a 5-second interval and no new data 99% of the time, you've made hundreds of pointless requests per user per hour.
- **Latency = poll interval / 2 on average.** Set it too long and notifications feel sluggish; too short and you DDoS yourself.
- **Headers per request.** Each poll re-sends cookies, auth headers, user-agent — often more bytes than the body.

**When to use it.** Genuinely fine for low-frequency updates: dashboard refreshes every 30s, build status, "anyone joined the room?" once a minute. Don't reach for WebSockets when polling-every-30s would do.

**Interview tip — back-off and pause-when-hidden.**

```js
// Pause polling when tab is hidden — saves battery + bandwidth.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearInterval(id);
  else id = setInterval(poll, POLL_MS);
});

// Exponential back-off on consecutive failures.
let failureCount = 0;
async function poll() {
  try {
    const res = await fetch(url);
    failureCount = 0;
    // ...
  } catch {
    failureCount++;
    const backoff = Math.min(60_000, POLL_MS * 2 ** failureCount);
    setTimeout(poll, backoff);
  }
}
```

---

## 3. Long Polling

A clever middle ground. The client makes a request; the server **does not respond immediately**. It holds the connection open until either (a) data is available, or (b) a timeout elapses (typically 30–60s). The client gets the response, immediately sends another request, and the cycle continues.

```js
// Client — long polling
async function longPoll() {
  while (!stopped) {
    try {
      const res = await fetch(`/api/messages?since=${lastSeen}`, {
        signal: abortCtrl.signal,
      });
      const data = await res.json();
      if (data.length) {
        lastSeen = data[data.length - 1].id;
        handleNewMessages(data);
      }
      // Loop runs immediately — server only returned because data was ready
      // OR the long-poll timeout fired.
    } catch (err) {
      if (err.name === 'AbortError') return;
      await new Promise(r => setTimeout(r, 5000)); // back off on error
    }
  }
}
longPoll();
```

```js
// Server — Express with a simple event bus
const EventEmitter = require('events');
const bus = new EventEmitter();

app.get('/api/messages', (req, res) => {
  const since = Number(req.query.since) || 0;
  const existing = db.messagesAfter(since);
  if (existing.length) return res.json(existing);

  // Otherwise — hold the response open.
  const onMessage = (msg) => {
    cleanup();
    res.json([msg]);
  };
  const timeout = setTimeout(() => {
    cleanup();
    res.json([]); // empty — client immediately reconnects
  }, 30_000);

  function cleanup() {
    clearTimeout(timeout);
    bus.off('message', onMessage);
    req.off('close', cleanup);
  }
  bus.on('message', onMessage);
  req.on('close', cleanup); // client disconnected
});
```

**Pros over short polling**

- **Latency ≈ 0.** As soon as data is available, the response goes out.
- **Far fewer requests** when nothing's happening (one per ~30 seconds vs one per few seconds).

**Cons**

- **Half-duplex.** Client→server still requires a *new* request.
- **Server resources.** You now have hundreds or thousands of open connections, each tying up a thread/file descriptor in synchronous frameworks. Node/Go/Python-async handle this fine; classic blocking PHP/Rails per-request workers do not.
- **Proxies and load balancers** may kill idle connections at 30/60/120 seconds — you have to time the poll-out to be slightly under that.
- **Reconnection storm risk.** If the server restarts, every client immediately reconnects in lockstep.

**When to use it.** Best as a **fallback** for SSE or WebSockets when those are blocked (corporate proxies, ancient browsers). Many real-time libraries (Socket.IO, SignalR) use long polling as the bottom of their fallback chain.

---

## 4. Server-Sent Events (SSE)

A standardized **one-way** push from server to client over a single long-lived HTTP response. The browser ships an `EventSource` API that handles the framing, parsing, and (crucially) automatic reconnection for you.

The server sets `Content-Type: text/event-stream` and writes plain-text frames separated by blank lines:

```
data: {"id": 1, "text": "hello"}

data: {"id": 2, "text": "world"}
event: typing
data: {"user": "alice"}

```

### Client

```js
// Client — SSE
const es = new EventSource('/api/events');

es.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('default channel:', data);
};

es.addEventListener('typing', (event) => {
  const data = JSON.parse(event.data);
  console.log('typing:', data);
});

es.onerror = (err) => {
  // EventSource auto-reconnects with exponential back-off.
  // readyState is CONNECTING during retry.
  console.warn('SSE error, browser will retry', err);
};

// Manually close:
// es.close();
```

### Server (Express)

```js
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Tell the client to wait 5s before reconnecting if the connection drops.
  res.write('retry: 5000\n\n');

  const onMessage = (msg) => {
    res.write(`id: ${msg.id}\n`);
    res.write(`data: ${JSON.stringify(msg)}\n\n`);
  };
  bus.on('message', onMessage);

  // Heartbeat — comment lines start with `:`. Keeps proxies from killing
  // the connection when traffic is silent.
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    bus.off('message', onMessage);
  });
});
```

### Frame format

| Field | Purpose |
|---|---|
| `data:` | Payload. Multiple `data:` lines on one event get joined by `\n`. |
| `event:` | Custom event name (default is `message`). |
| `id:` | Last-event ID. Client sends this back as `Last-Event-ID` header on reconnect. |
| `retry:` | Reconnect delay in ms. |
| `:` (line starting with colon) | Comment. Used as a heartbeat. |

### Pros

- **Auto-reconnect built in.** No code to write.
- **Resumable.** `Last-Event-ID` lets the server replay missed events.
- **Plain HTTP.** Goes through firewalls, proxies, CDNs (mostly).
- **Simpler than WebSockets.** No upgrade dance, no framing protocol, no ping/pong to manage.

### Cons

- **One-way.** Client→server still goes through normal `fetch`/`XHR`.
- **Browser connection limit.** ~6 concurrent HTTP/1.1 connections per origin. Open SSE in 7 tabs and the 7th hangs. Mitigate by serving over **HTTP/2 or HTTP/3** (per-origin limit becomes ~100), or use a `BroadcastChannel`/`SharedWorker` to share one connection across tabs.
- **No binary frames.** Text only (you can base64, but it's wasteful).
- **No native IE support** (irrelevant in 2026, but flagged on legacy interview questions).

### When to use it

- **Server-pushed feeds** with rare client-to-server interaction: stock tickers, log streams, build progress, AI-generated text streaming token-by-token (though `fetch` streaming has overtaken SSE for that — see §6).
- Anywhere you need server push and a WebSocket would be overkill.

---

## 5. WebSockets

A full-duplex, persistent, message-based protocol over a single TCP connection. The handshake is HTTP — `GET /chat HTTP/1.1` with `Upgrade: websocket` — but once the server agrees, the connection is "upgraded" and both sides can send framed messages independently from then on.

```
Client                        Server
   ─── GET /chat HTTP/1.1 ──────►
        Upgrade: websocket
        Sec-WebSocket-Key: …

   ◄── 101 Switching Protocols ──
        Upgrade: websocket
        Sec-WebSocket-Accept: …

   ─── frame ───────────────────►   (any time)
   ◄── frame ──────────────────────  (any time)
```

### Client

```js
const ws = new WebSocket('wss://example.com/chat', ['v1.json']);

ws.binaryType = 'arraybuffer'; // or 'blob'

ws.addEventListener('open', () => {
  ws.send(JSON.stringify({ type: 'auth', token: getToken() }));
});

ws.addEventListener('message', (event) => {
  // event.data is string | ArrayBuffer | Blob depending on what server sent
  const msg = JSON.parse(event.data);
  console.log('received', msg);
});

ws.addEventListener('close', (event) => {
  console.log('closed', event.code, event.reason);
});

ws.addEventListener('error', (err) => {
  // The error event has no useful info — the close event has the code.
  console.warn('ws error', err);
});

// Send:
ws.send('hello');
ws.send(new Uint8Array([1, 2, 3]).buffer);

// Close:
ws.close(1000, 'bye');  // 1000 = normal closure
```

### Server (Node.js with `ws`)

```js
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, req) => {
  console.log('client connected from', req.socket.remoteAddress);

  ws.on('message', (data, isBinary) => {
    // Broadcast to everyone:
    for (const client of wss.clients) {
      if (client.readyState === ws.OPEN) {
        client.send(data, { binary: isBinary });
      }
    }
  });

  ws.on('close', (code, reason) => {
    console.log('client disconnected', code, reason.toString());
  });
});
```

### Server (Socket.IO — adds rooms, ack callbacks, fallbacks)

```js
const { Server } = require('socket.io');
const io = new Server(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('join', (room) => socket.join(room));
  socket.on('chat', (msg, ack) => {
    io.to(msg.room).emit('chat', msg);
    ack?.('delivered');
  });
});
```

```js
// Client (socket.io-client)
import { io } from 'socket.io-client';
const socket = io('https://example.com', { transports: ['websocket'] });
socket.emit('chat', { room: 'room1', text: 'hi' }, (ack) => console.log(ack));
```

### Frame anatomy (what's actually on the wire)

A WebSocket frame has:
- 1 bit: FIN (last frame of a message)
- 4 bits: opcode (`0x1` text, `0x2` binary, `0x8` close, `0x9` ping, `0xA` pong)
- 1 bit: MASK (client→server frames must be masked with a 4-byte XOR key)
- 7/16/64 bits: payload length
- (optional) 4-byte mask key
- N bytes: payload

You almost never deal with this — the browser/Node library handles framing — but interviewers love asking why client→server messages are masked. **Answer:** to defeat cache-poisoning attacks against intermediaries that don't understand WebSocket frames and might mistake frame data for a new HTTP request.

### Close codes you should know

| Code | Meaning |
|---|---|
| 1000 | Normal closure |
| 1001 | Going away (page unload) |
| 1006 | Abnormal closure (no close frame sent — connection just dropped) |
| 1008 | Policy violation |
| 1011 | Internal server error |
| 4000–4999 | Application-defined |

`1006` is the one you see most often — TCP-level disconnect, no graceful shutdown. Treat it as "reconnect with back-off."

### Heartbeats and the half-open problem

A WebSocket connection can be **half-open**: the network is gone but neither side has noticed because nothing's been sent. You discover this only when you try to send. Solution: send a periodic ping.

The `ws` Node library handles this:

```js
function heartbeat() { this.isAlive = true; }

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
});

const interval = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  }
}, 30_000);
```

Browsers don't expose `ping`/`pong` to JS — they're handled at the protocol layer. If you need an application-level heartbeat from the client, send a `{type: 'ping'}` JSON message and have the server reply.

### Reconnection logic (you have to write this yourself)

```js
class ResilientWS {
  constructor(url) { this.url = url; this.attempts = 0; this.connect(); }
  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => { this.attempts = 0; };
    this.ws.onclose = () => {
      const delay = Math.min(30_000, 1000 * 2 ** this.attempts);
      const jitter = Math.random() * 1000;
      this.attempts++;
      setTimeout(() => this.connect(), delay + jitter);
    };
  }
  send(msg) {
    if (this.ws.readyState === WebSocket.OPEN) this.ws.send(msg);
    // else: enqueue, send on next open — the bit you'll discuss in interviews
  }
}
```

### Pros

- **Full duplex, low latency.** Both sides send freely.
- **Binary support.** Send `ArrayBuffer`, `Blob`, `Uint8Array` directly.
- **Subprotocols.** Negotiate at handshake (`['v1.json', 'v2.json']`).
- **Wide library support.** ws, Socket.IO, ws on Cloudflare Workers, Erlang/Elixir Phoenix Channels, etc.

### Cons

- **No native auto-reconnect.** Unlike SSE, you have to write the reconnection loop.
- **No native message replay.** SSE has `Last-Event-ID`; you build your own resume token.
- **Sticky sessions or pub-sub needed for scale.** A WebSocket is bound to one server process. Two clients on different servers can't see each other unless you wire up Redis pub/sub, NATS, or a similar fan-out.
- **Proxy hostility.** Some corporate proxies don't pass `Upgrade`. Most cloud LBs do (AWS ALB, Cloudflare, Nginx with `proxy_http_version 1.1`).
- **State on the server.** Connection per user means each disconnect/reconnect storm is real load.

### When to use it

- **Truly bidirectional, low-latency** workloads: chat, multiplayer games, collaborative editors (Figma, Google Docs use a mix of WS + custom protocols), live trading, IoT control planes.
- When server→client and client→server frequency are both high.

---

## 6. HTTP Streaming with `fetch` + ReadableStream

Modern browsers expose response bodies as a `ReadableStream`. That means you can do server-push over **plain `fetch`** — read the response chunk-by-chunk as it arrives instead of waiting for the whole body. This is how ChatGPT, Claude, Gemini, and most modern AI chat UIs stream text token-by-token.

### Client

```js
async function streamChat(prompt) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    appendToUI(chunk);
  }
}
```

### Server (Node.js / Express)

```js
app.post('/api/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.flushHeaders();

  for await (const token of generateTokens(req.body.prompt)) {
    res.write(token);
  }
  res.end();
});
```

### Or Server-Sent Events over fetch streaming

A common pattern — the server emits SSE-formatted frames, the client parses them by hand instead of using `EventSource`. Why? Because `EventSource` doesn't support `POST` requests or custom headers (no `Authorization` header, only cookies). With `fetch`, you get full control.

```js
async function streamSSE(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'text/event-stream' },
    body: JSON.stringify(body),
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop(); // last one is incomplete
    for (const evt of events) {
      const dataLine = evt.split('\n').find(l => l.startsWith('data: '));
      if (dataLine) handleEvent(JSON.parse(dataLine.slice(6)));
    }
  }
}
```

### Pros

- **Full HTTP semantics.** Auth headers, custom headers, POST bodies, status codes.
- **One-way push** (server → client) like SSE, but without `EventSource`'s limitations.
- **Works through HTTP/2 multiplexing** — many concurrent streams over one connection.

### Cons

- **No automatic reconnection** (you implement it).
- **Manual SSE parsing** if you want event types, IDs, retries.
- **Slightly more code than `EventSource`** for the simple case.

### When to use it

- **AI/LLM streaming responses.** Almost every modern chat UI uses this.
- Server push that needs auth headers (`EventSource` only sends cookies).
- POST-then-stream patterns ("submit this prompt, stream the answer").

---

## 7. WebRTC DataChannels

WebRTC is best known for video/audio (`getUserMedia` + peer connection), but it also exposes a **DataChannel** — an arbitrary message channel between two browsers, peer-to-peer, with sub-100ms latency. Built on UDP (via SCTP/DTLS), so unlike everything else in this guide, it doesn't go server-relay every packet.

```js
// One peer — initiator
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
});
const dc = pc.createDataChannel('game', { ordered: false, maxRetransmits: 0 });

dc.onopen = () => dc.send('hello');
dc.onmessage = (e) => console.log('peer says', e.data);

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
// Exchange `offer` and ICE candidates with the remote peer over a signaling
// channel (typically WebSocket) — out of band.

// Other peer:
// pc.setRemoteDescription(offer)
// answer = pc.createAnswer()
// pc.setLocalDescription(answer)
// (exchange answer back)
```

The signaling channel — how the two peers find each other and exchange SDPs/ICE candidates — is **not** part of WebRTC. You build it on a WebSocket.

### Pros

- **Peer-to-peer.** Server pays bandwidth only for signaling, not for the data itself.
- **Sub-100ms latency** if peers have direct connectivity.
- **UDP semantics available** (`ordered: false`, `maxRetransmits: 0`) — fire-and-forget for game state.
- **Encrypted by default** (DTLS).

### Cons

- **NAT traversal is hard.** ~10–20% of peers can't connect directly and need a TURN relay (which you pay for).
- **Heavy API.** Peer connections, ICE, SDP, candidates — easily a week of integration time.
- **No native multi-party.** Building a 5-person call requires a mesh (N×N connections) or an SFU (Selective Forwarding Unit) server.

### When to use it

- **Real-time games** where every millisecond counts.
- **Collaborative editors** that need server-bypass for cursor positions.
- **Peer-to-peer file transfer**, screen share, low-latency audio.
- Most apps **don't need this** — WebSockets are fast enough for chat, dashboards, even most multiplayer games.

---

## 8. Push API + Service Workers

Everything above requires the page to be **open**. The Push API is different: it lets the server wake the *browser*, deliver a payload to a background Service Worker, which can show a notification — even if the tab is closed, even if the browser isn't running (on most platforms).

The path: app server → push provider (FCM for Chrome/Edge/Firefox; APNs for Safari) → user's browser → Service Worker.

### Client — subscribe

```js
// Register a Service Worker first.
const reg = await navigator.serviceWorker.register('/sw.js');

// Ask permission.
const permission = await Notification.requestPermission();
if (permission !== 'granted') return;

// Subscribe to push. VAPID public key identifies your app to the push service.
const sub = await reg.pushManager.subscribe({
  userVisibleOnly: true, // browser policy: must show a notification
  applicationServerKey: VAPID_PUBLIC_KEY_AS_UINT8ARRAY,
});

// Send `sub.endpoint`, `sub.toJSON().keys.p256dh`, and `keys.auth` to your server.
await fetch('/api/push/subscribe', {
  method: 'POST',
  body: JSON.stringify(sub),
});
```

### Service Worker — receive

```js
// /sw.js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
      data: { url: data.url },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

### Server (Node.js with `web-push`)

```js
const webpush = require('web-push');
webpush.setVapidDetails('mailto:you@example.com', VAPID_PUB, VAPID_PRIV);

await webpush.sendNotification(subscription, JSON.stringify({
  title: 'New message',
  body: 'Alice replied to your post',
  url: 'https://example.com/posts/42',
}));
```

### Pros

- **Works when the page is closed.** The killer feature.
- **Cross-platform.** Same API on desktop and mobile (with caveats — iOS Safari requires PWA install).

### Cons

- **Permission prompt friction.** Most users decline; misuse damages your reputation.
- **Browser policy: notifications must be visible.** No silent push on the open web (only inside browser extensions / TWA / etc.).
- **Provider quirks.** APNs vs FCM behave differently for payload size, TTL, and silent delivery.
- **One-way only.** It's a delivery mechanism, not a transport. Use it to wake the user, then have them open the app where you connect a real-time channel.

### When to use it

- Genuine notifications: a message, a build failed, an order shipped.
- **Don't use it** for live data — that's what SSE/WS are for.

---

## 9. GraphQL Subscriptions

GraphQL has three operation types: `query` (read), `mutation` (write), and `subscription` (live data stream). The **transport** for subscriptions is not part of the GraphQL spec — it's a convention. The two common ones:

- **`graphql-ws`** — WebSocket-based, the modern standard.
- **`subscriptions-transport-ws`** — older, deprecated.
- **SSE** is also possible but rare.

### Server (Apollo Server with `graphql-ws`)

```js
const { ApolloServer } = require('@apollo/server');
const { useServer } = require('graphql-ws/lib/use/ws');
const { WebSocketServer } = require('ws');

const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });

const schema = makeExecutableSchema({
  typeDefs: `
    type Subscription { messageAdded(roomId: ID!): Message! }
  `,
  resolvers: {
    Subscription: {
      messageAdded: {
        subscribe: (_, { roomId }) => pubsub.asyncIterator(`MSG_${roomId}`),
      },
    },
  },
});

useServer({ schema }, wsServer);
```

### Client (Apollo Client)

```js
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const wsLink = new GraphQLWsLink(createClient({
  url: 'wss://example.com/graphql',
  connectionParams: { authToken: getToken() },
}));

const SUB = gql`
  subscription OnMessage($roomId: ID!) {
    messageAdded(roomId: $roomId) { id text author }
  }
`;

const { data } = useSubscription(SUB, { variables: { roomId } });
```

**Reality check.** GraphQL Subscriptions are powerful but operationally expensive — you're maintaining a stateful WebSocket per subscriber, plus a pub/sub fanout (Redis, Kafka, etc.). Many teams find that **polling a normal query with a 2–5s interval** delivers 90% of the perceived value at 10% of the operational cost. Use subscriptions when you actually need the latency.

---

## 10. Decision Table — Picking a Transport

| Transport | Direction | Latency | Complexity | Browser limit | Use when |
|---|---|---|---|---|---|
| **Short polling** | Pull | High (½ interval avg) | Trivial | None | Updates rare, infra simple |
| **Long polling** | Pull, server-held | ~0 | Medium | None | Fallback when SSE/WS blocked |
| **SSE** | Server→client | ~0 | Low (auto-reconnect built in) | ~6 per origin (HTTP/1.1) | One-way push, plain HTTP |
| **WebSocket** | Bidirectional | ~0 | High (you write reconnect, replay, heartbeats) | None | True bidi, low latency, binary |
| **fetch streaming** | Server→client | ~0 | Medium | None | Auth headers needed; AI streaming |
| **WebRTC DataChannel** | Peer↔peer | < 100ms | Very high | None for # peers | Games, P2P transfer, server-bypass |
| **Push API** | Server→browser (closed page) | Seconds | High (SW + provider) | Per-browser/OS limits | Genuine notifications |
| **GraphQL Subscriptions** | Bidirectional (WS underneath) | ~0 | High + ops | Same as WS | Already on GraphQL |

**Quick decision tree:**

1. **Server-only push, no auth headers?** → SSE.
2. **Server-only push, needs auth headers or POST?** → fetch streaming.
3. **Both directions needed?** → WebSocket.
4. **Latency must beat ~50ms?** → WebRTC.
5. **Page is closed?** → Push API.
6. **Updates are rare and small?** → polling. Don't overthink it.

---

## 11. Production Concerns

### 11.1 Authentication

| Transport | How |
|---|---|
| Polling / fetch streaming | `Authorization` header — like any other request |
| SSE (`EventSource`) | **Cookies only** (no custom headers). Use a session cookie or pass token in the URL query string (with TLS — but URLs end up in logs). |
| WebSocket | **Token in URL** (`wss://example.com/ws?token=...`) is most common. **Subprotocol header** is a cleaner option (`new WebSocket(url, ['v1.json', `Bearer.${token}`])`). The server reads `Sec-WebSocket-Protocol` during handshake. |

### 11.2 Reconnection strategy

Three rules every production client should follow:

1. **Exponential back-off with cap.** `delay = min(MAX, BASE * 2^attempt)`.
2. **Jitter.** Add `Math.random() * 1000` so a server restart doesn't cause a thundering-herd reconnect at the same millisecond.
3. **Pause on hidden tab.** Save battery, save bandwidth, save server load.

```js
function backoff(attempt) {
  const base = 500;
  const cap = 30_000;
  const exp = Math.min(cap, base * 2 ** attempt);
  return exp / 2 + Math.random() * exp / 2; // full jitter
}
```

### 11.3 Message ordering and replay

If the connection drops mid-stream, the client may have missed messages. Your options:

- **Sequence numbers.** Each message has an ID. On reconnect, client says "last I saw was 42"; server replays 43+.
- **SSE's `Last-Event-ID`.** Built in. Server reads the header.
- **Outbox / event log.** Server keeps the last N messages or full history in a log (Kafka, Redis Streams, Postgres).

Any system claiming "guaranteed delivery" needs all three: idempotent IDs, server-side log, client-side resume token.

### 11.4 Backpressure

What happens when the server produces faster than the client can consume?

- **WebSocket / fetch streaming**: TCP backpressure naturally slows the writer when the read buffer fills. But if you're queuing in user-space (`for (msg of messages) ws.send(msg)`), you'll OOM the server. Check `ws.bufferedAmount` and pause.
- **SSE**: same — server's `res.write()` returns `false` when the buffer's full; you should pause until `'drain'`.

```js
// Server — backpressure-aware
function sendOrQueue(res, data) {
  if (!res.write(data)) {
    return new Promise(resolve => res.once('drain', resolve));
  }
  return Promise.resolve();
}
```

### 11.5 Scaling — sticky sessions and pub/sub

A WebSocket is bound to one server process. Three users on three different servers can't see each other unless you fan out:

```
   ┌─ ws-server-1 ─┐
   │              │       ┌─────────┐
   ├─ ws-server-2 ─┼──────►│  Redis  │
   │              │       │ pub/sub │
   └─ ws-server-3 ─┘◄──────┘         │
                          └─────────┘
```

Each server subscribes to a channel; when a message comes in on any server, it publishes to Redis; every server pushes to its connected clients in the relevant rooms.

**Sticky sessions** (load-balancer routes the same client to the same server) help with reconnection but don't solve fan-out — you still need pub/sub for cross-server visibility.

### 11.6 Monitoring

Real-time systems fail in unique ways. Track:

- **Connection count** per server (capacity planning).
- **Connection lifetime distribution** (sudden drop in average → mass disconnect).
- **Reconnection rate** (high = network instability or server flapping).
- **Time-to-first-byte for SSE/streaming** (high = origin slow).
- **Heartbeat round-trip** for WebSocket.
- **Backpressure events** (`ws.bufferedAmount > N`, SSE `drain` count).

### 11.7 Fallback chain

A production-grade real-time client tries the best transport first and falls back gracefully:

```
WebSocket  →  SSE  →  Long polling  →  Short polling
```

**Socket.IO** does this automatically. If you build your own, the fallback usually only matters for users behind hostile corporate proxies — and many teams skip it for the operational simplicity of "WebSocket only, with a clear error if it fails."

---

## 12. Interview Questions & Answers

### Beginner

**Q1: Why can't a normal HTTP server "push" data to a browser?**

HTTP is request/response. The TCP connection stays open (with `Keep-Alive`) for performance, but each exchange is initiated by the client. The server has no API to send a response unless the client has just sent a request. Every real-time pattern in this space exists to work around that constraint — by either making the client poll, or by holding a single response open long enough for the server to write into it, or by negotiating an upgrade to a different protocol where both sides can speak (WebSocket).

---

**Q2: What's the difference between short polling and long polling?**

Short polling: the client sends `GET /messages` every N seconds; if there's nothing new, the server returns an empty list and the client tries again later. Latency averages half the polling interval.

Long polling: the client sends `GET /messages` and the server **does not respond immediately** — it holds the connection open until either new data arrives or a timeout fires (typically 30s). The instant data is available, the response goes out, the client gets it, and immediately reconnects. Latency is near zero. The cost is connection-holding state on the server.

Use short polling for genuinely infrequent updates (dashboards every 30s); use long polling as a fallback for SSE/WS in environments that block them.

---

**Q3: When would you use SSE over WebSockets?**

When you only need server→client. SSE is dramatically simpler:
- Plain HTTP, goes through any proxy that allows long-lived connections.
- Auto-reconnect with exponential back-off — the browser does it for you.
- Resumable via `Last-Event-ID` — the server can replay missed events.
- No upgrade handshake, no framing protocol, no ping/pong management.

Stock tickers, build progress, log streams, chat where the user types via separate POST requests — SSE is enough.

WebSockets are worth the complexity only when client→server messages are also frequent and latency-sensitive: chat with typing indicators, multiplayer games, collaborative editors.

---

**Q4: What is the WebSocket handshake?**

The connection starts as a normal HTTP `GET` with two special headers:

```
GET /chat HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

The server, if it agrees, responds:

```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

`Sec-WebSocket-Accept` is the SHA-1 of `Sec-WebSocket-Key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"` (a fixed magic GUID), base64-encoded. This proves the server understood the handshake and isn't a confused HTTP cache.

After 101, the underlying TCP connection switches to the WebSocket framing protocol — both sides can send framed messages independently.

---

**Q5: What does `EventSource` give you that a manual `fetch` stream doesn't?**

Three things:
1. **Automatic reconnection** with the `retry:` field controlling delay.
2. **`Last-Event-ID` resumption** — on reconnect, the browser sends the last `id:` it received as a header, so the server can replay missed events.
3. **Event parsing** — handles `data:`, `event:`, `id:`, multi-line `data:`, and dispatches to `addEventListener('typing', ...)`.

What it doesn't give you: custom request headers (no `Authorization`), POST bodies, or method control. If you need any of those, you're back to `fetch` + manual SSE parsing.

### Intermediate

**Q6: Why are client-to-server WebSocket frames masked, but server-to-client frames are not?**

Masking is a security defense — not against a malicious server, but against intermediaries. In the early WebSocket spec discussions, researchers showed that without masking, a malicious page could craft data that, when sent through a non-WS-aware HTTP cache or proxy, would be misread as a new HTTP request and poison the cache.

The mandatory 4-byte XOR mask on every client frame ensures the bytes on the wire don't look like a valid HTTP request, defeating that attack. Server→client frames don't need masking because there's no equivalent attack vector — clients don't operate caches that other users would consume.

---

**Q7: How does WebSocket reconnection work, and what should a production reconnection loop look like?**

The browser does **not** auto-reconnect (unlike SSE). When the `close` event fires, you have to reconnect yourself. A production loop should:

1. **Exponential back-off with cap.** Don't hammer the server when it's down: `delay = min(30_000, 500 * 2^attempts)`.
2. **Jitter.** Add `random * delay` so a server restart doesn't cause every client to reconnect at the same millisecond — you'd DoS yourself.
3. **Reset on success.** When `onopen` fires, set `attempts = 0` so the next disconnect starts back at 500ms.
4. **Pause on hidden tab.** `document.visibilityState === 'hidden'`? Pause reconnects, save battery + bandwidth.
5. **Queue outbound messages.** While disconnected, buffer `send()` calls and flush on next open. Or surface a "reconnecting…" state to the UI.
6. **Authenticate on every open.** The server forgot you when you disconnected — re-send the auth token in the first message.
7. **Resume token.** Send the last seen sequence number; server replays anything missed.

Skip any of these and you have a real-time feature that fails the moment a wifi router blips.

---

**Q8: What's the difference between an SSE heartbeat and a WebSocket ping?**

Both solve the same problem — detecting half-open connections (network gone, neither side knows yet) — but at different layers.

**SSE heartbeat:** application-level. The server periodically writes a comment line — `: ping\n\n` — into the response stream. The browser doesn't expose this to JS; the bytes just keep the TCP connection from being idle so proxies don't kill it. If the browser's reading socket fails, the next `read` errors and `EventSource` triggers reconnect.

**WebSocket ping/pong:** protocol-level. Opcodes `0x9` (ping) and `0xA` (pong) are special control frames. The browser handles them automatically — JS never sees them. If a peer doesn't respond to a ping within timeout, the connection is closed with a `1006` close code. **Browsers don't expose `ping`/`pong` to JS** — only Node servers can send them. If you want a browser-initiated heartbeat, send a `{type:'ping'}` JSON message and expect a `{type:'pong'}` reply.

Both should fire at ~25–30s intervals — slightly under the 60s typical proxy idle timeout.

---

**Q9: Why might SSE fail if you open it in 7 browser tabs?**

HTTP/1.1 has a per-origin connection limit, traditionally 6. Each `EventSource` connection is one of those 6 — and SSE keeps the connection open indefinitely, so it never gets recycled. The 7th tab's `EventSource` will hang in `CONNECTING` state until you close one of the others.

**Fixes:**

1. **Serve over HTTP/2 or HTTP/3.** Browsers raise the per-origin limit to ~100 because of stream multiplexing.
2. **Share one connection across tabs** with `BroadcastChannel` or `SharedWorker`. One tab opens the SSE connection; it relays events to siblings via the broadcast channel.
3. **Use WebSocket instead.** WebSocket connections aren't subject to the HTTP connection limit.

---

**Q10: How do you authenticate a WebSocket connection in the browser?**

The `WebSocket` constructor doesn't accept custom headers (unlike `fetch`), so the standard tricks:

1. **Token in URL query string.** `new WebSocket('wss://api.example.com/ws?token=' + jwt)`. Works everywhere; downside is the token shows up in server access logs and can be cached at proxies.

2. **Subprotocol header.** `new WebSocket(url, ['Bearer', jwt])`. The browser sends `Sec-WebSocket-Protocol: Bearer, <jwt>`; the server reads it during handshake and decides whether to accept. Cleaner — keeps the token off URL logs — but the JWT travels in plaintext through the handshake (use `wss://`).

3. **Cookie auth.** If the API and the WS are on the same origin (or use `SameSite=None; Secure`), a session cookie travels automatically. Best for first-party apps; doesn't work cross-origin.

4. **Connect anonymously, authenticate after open.** First message is `{type: 'auth', token: '...'}`. Server accepts the connection but rejects all other messages until auth succeeds. Decouples handshake from auth, lets you rotate tokens without dropping the socket.

In all cases — **do not** put the token in the URL of a non-TLS connection, and rotate tokens periodically.

### Advanced

**Q11: How do you scale a WebSocket app to multiple servers?**

The fundamental problem: a WebSocket is bound to one process. Two users connected to two different servers can't see each other's messages without infrastructure between them.

**Layer 1: load balancer.** Use one that supports `Upgrade` (AWS ALB, Cloudflare, Nginx with `proxy_http_version 1.1`). Sticky sessions help reconnection efficiency but don't solve cross-server fan-out.

**Layer 2: pub/sub fan-out.** When a message arrives at server A destined for room `room1`, server A publishes to a Redis channel `room:room1`. Every server subscribes to that channel and pushes to its locally-connected room members.

```js
// Each server
const sub = redis.duplicate();
sub.subscribe('room:*');
sub.on('pmessage', (pattern, channel, message) => {
  const room = channel.split(':')[1];
  for (const client of localRoomClients.get(room) || []) {
    client.send(message);
  }
});

// Publishing
function broadcast(room, message) {
  redis.publish(`room:${room}`, message);
}
```

**Layer 3: presence and replay.** Track who's online (Redis sorted set with TTL). Track last-message-ID per user (Redis hash). On reconnect, read missed messages from a log (Redis Streams, Kafka).

**Common mistake:** assuming Socket.IO "just scales." Socket.IO requires the `socket.io-redis` adapter to do exactly the fan-out above; without it, multi-server is broken.

---

**Q12: A user reports that real-time updates stop arriving after their laptop sleeps. What's happening and how do you fix it?**

When a laptop sleeps, the OS suspends network sockets. On wake, the TCP connection might be:

1. **Half-open** — both sides think it's alive, but no packets flow. Until one side tries to send, neither knows.
2. **Reset by NAT timeout** — the user's home router NAT entry expired during sleep; packets in either direction are dropped.

The browser doesn't fire `close` on `WebSocket`/`EventSource` until it tries to write or read and fails. So the page sits in a "connected, silently broken" state.

**Fixes:**

- **Application heartbeat from the client.** Every 30s, send a ping; if no pong arrives in 5s, treat the connection as dead and reconnect. SSE's built-in retry handles this automatically once the read fails — but on a sleeping laptop the read may not fail until the page is interacted with.
- **`visibilitychange` listener.** When the tab becomes visible again, eagerly probe the connection (send a ping or a sequence-number sync); if it fails, reconnect.
- **`online`/`offline` events.** When `navigator.onLine` flips, trigger a reconnect. Not 100% reliable but a good signal.
- **Server-side TTL.** Auto-close idle connections after N minutes (with a polite close frame); the client reconnects. Better than holding zombie connections forever.

A robust client uses all four.

---

**Q13: When would you use `fetch` streaming over `EventSource` for server-sent events?**

Three situations force the choice:

1. **You need an `Authorization` header.** `EventSource` only sends cookies. Bearer-token-authenticated APIs (most modern SaaS, all OpenAI-style APIs) require `Authorization: Bearer ...` headers — `fetch` allows them, `EventSource` doesn't.

2. **You need to POST.** `EventSource` is GET-only. AI chat UIs send a long prompt as a POST body and stream the answer — there's no way to express that with `EventSource`.

3. **You need fine-grained control.** Custom timeout, AbortController for cancellation, custom retry logic, request priority hints — all available on `fetch`, none on `EventSource`.

The cost: you write the SSE parser yourself (split on `\n\n`, parse `data:` / `event:` / `id:`), and you write the reconnection loop yourself. About 30 lines of code total — usually worth it.

---

**Q14: Compare WebSockets, SSE, and HTTP/2 push for delivering server events.**

**HTTP/2 server push** is the deprecated answer — it was a feature where the server could "push" additional resources (CSS, JS) into the browser's cache before the page asked for them. Chrome removed support in 2022 because measurements showed it rarely helped real-world page loads. It's not relevant to real-time data delivery — push targets are *resources* (URLs), not application messages.

For real-time data:

- **WebSocket**: bidirectional, binary, but the browser limit doesn't apply (HTTP `Upgrade` exits the HTTP world). One persistent connection, both sides write any time.
- **SSE**: one-way (server→client), text-only, runs over plain HTTP, `EventSource` handles reconnect. Subject to HTTP/1.1's ~6-per-origin connection limit unless served over HTTP/2 or 3.
- **fetch streaming**: same one-way push as SSE, but with full HTTP semantics (auth headers, POST). No `EventSource`-level helpers.

**Decision rule:** if you need bidirectional, use WebSocket. If you need server→client only and headers/POST, use fetch streaming. If you need server→client only and don't need custom headers, SSE is the lowest-effort choice.

---

**Q15: What's the smallest viable real-time feature, and when does it not need any of this?**

The smallest viable real-time feature is **a poll on a setInterval** — and a surprising amount of "real-time" can be served by `fetch` every 5–10 seconds. It's the right answer when:

- Updates are **infrequent** (notifications, dashboard refreshes).
- Latency requirements are **loose** (10s is fine).
- Infra is **simple** — no WebSocket-aware load balancer, no pub/sub, no heartbeat code.

It scales horizontally with no thought (any cache or CDN handles it), works through any proxy, and survives mobile network transitions trivially.

The mistake teams make is reaching for WebSockets first. The mistake interviewers test for is whether you can recognize when polling is the *right* answer, not just the easy one.

---

**Q16: How do you implement message ordering and guaranteed delivery on top of WebSockets?**

WebSockets give you ordered, reliable delivery **within a single connection**. Across a reconnect, the gap is your problem. The standard pattern:

1. **Sequence numbers.** Every server-sent message has a monotonic `id`. Client tracks the highest `id` seen.
2. **Resume token on reconnect.** First message after open: `{type: 'resume', lastId: 42}`.
3. **Server-side log.** Server keeps the last N messages per channel (in Redis Streams, Kafka, or a Postgres table) — enough to cover a typical reconnect gap.
4. **Replay.** On resume, server reads the log from `lastId + 1` and sends them all before resuming live.
5. **Idempotent client handling.** Keep a `seenIds` set in case the server replays past the gap; the client de-dupes.
6. **Acks for client→server.** Each client message includes a `clientMsgId`. Server replies `{ack: clientMsgId, serverId: 99}`. Client retransmits unacknowledged messages on reconnect.

For "exactly-once" semantics, the client's idempotency key + the server's seen-key set gives you de-duplication; combined with the sequence-number replay, you have at-least-once + idempotent = effectively-once.

If this sounds like a lot — that's because it is. Ninety percent of apps don't actually need exactly-once and can ship at-most-once with a "you might miss messages if your phone slept" warning. Push the complexity only where the product demands it.

---

## 13. Tricky Questions

**Q1: A user opens 8 tabs of your SSE-powered dashboard and reports the last 2 hang on a blank page. Why, and how do you fix it without changing the server?**

HTTP/1.1 caps simultaneous connections per origin at 6 in every major browser. Each `EventSource` is one persistent connection that never gets recycled. The 7th and 8th tabs sit in `CONNECTING` because there are no free slots.

**Fix without server changes:** use a `SharedWorker` or `BroadcastChannel`-based fan-out. The first tab opens the `EventSource`; subsequent tabs detect that an SSE connection already exists (via `BroadcastChannel('sse-coordinator')`) and listen to broadcasts instead of opening their own. Now you use 1 connection regardless of tab count.

**Fix with server changes:** serve over HTTP/2 or HTTP/3. The per-origin limit becomes ~100 because of stream multiplexing. Requires terminating TLS and HTTP/2 at the edge — Cloudflare/ALB/Nginx all support it.

The "8 tabs hang" symptom comes up specifically with SSE because the connections are held forever; short-polling doesn't have this problem because each request finishes and the slot is recycled.

---

**Q2: Your WebSocket-based chat works on dev (localhost) and on staging (Cloudflare in front). It breaks on a customer's corporate network with a vague "connection failed" before any frames are exchanged. What's the most likely cause, and what's your fallback?**

Corporate proxies often don't pass `Upgrade: websocket` — they see the HTTP request, return 200 OK with a captive portal page or a generic error, and the browser fires `error` then `close` with code `1006` (abnormal closure). Diagnostic: check `event.code` in `onclose` — `1006` with `wasClean: false` and no prior `onopen` strongly suggests a proxy that ate the upgrade.

Other hostile-proxy behaviors: stripping the `Sec-WebSocket-Protocol` header, terminating idle connections at 30s, or caching the handshake response.

**Fallback:** ship a transport-fallback chain — WebSocket first, then SSE, then long polling. Socket.IO does this automatically. If you're rolling your own, the typical strategy is:

1. Try WebSocket. If `onclose` fires with `1006` before `onopen`, mark WS as unavailable.
2. Try SSE for receive + plain `fetch POST` for send.
3. If SSE also fails, fall back to long polling.

The user's proxy almost always passes plain HTTPS, so SSE/long-polling work where WebSocket doesn't.

A simpler workaround if you don't want a fallback chain: tell the user to switch off the corporate VPN. Not satisfying, but for B2B SaaS it's often the truthful answer.

---

**Q3: You added an SSE feed for build progress. Users on slow connections sometimes see events arrive out-of-order, despite SSE being TCP. How is that possible?**

SSE *transport* is in-order (TCP guarantees that). What's not in-order is the **server's writes** if multiple sources can write to the same response.

Common bug: you have two services emitting build events (linter, test runner). Both `pubsub.publish('build:42', event)` to Redis. Your SSE handler subscribes and writes each as it arrives. But linter events and test-runner events are produced concurrently — they hit Redis in interleaved order, and the SSE writer simply emits whatever arrives next. So `lint-finished` can land *before* `lint-started` if the producer's write to Redis was slower than the test-runner's.

This isn't an SSE problem; it's an event-pipeline ordering problem. SSE will faithfully deliver whatever you write, in the order you write it.

**Fixes:**

- **Sequence the writer.** Build events should pass through a single sequencer that assigns monotonic IDs and orders by event timestamp before publishing.
- **Use a log with stream IDs.** Redis Streams or Kafka give every entry a unique, monotonic ID. The reader emits in that order.
- **Tolerate it.** For UI rendering, attach a logical timestamp to every event and sort client-side before display.

The interview signal: do you understand that SSE's in-order guarantee is **per response stream**, not across the producer pipeline?

---

**Q4: You use `useEffect` to open a WebSocket in a React component. In Strict Mode (dev), the component mounts → unmounts → mounts. You're seeing two connections to your server. How do you fix it correctly?**

This is the #1 React + WebSocket bug. Strict Mode intentionally double-invokes effects in dev to surface cleanup bugs.

The wrong fix: disable Strict Mode. (You're hiding a real bug — the same double-mount can happen with React 18+ concurrent features, and on remount-by-`key` change.)

The right fix: clean up properly.

```jsx
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = handleMessage;
  return () => {
    ws.close(1000, 'unmounting');
  };
}, [url]);
```

But there's a subtlety: a `WebSocket` in `CONNECTING` state, closed before `onopen`, transitions through `CONNECTING → CLOSING → CLOSED` and **may still complete the TCP handshake** depending on browser and timing. Two connections briefly hit the server. For a server that charges per connection or has tight rate limits, that matters.

**Production fix:** lift the WebSocket out of the component into a module-level singleton or a context provider that doesn't care about React's mount/unmount lifecycle. The component subscribes/unsubscribes from the singleton; the singleton manages the actual socket.

```jsx
// ws-singleton.js
let ws = null;
const listeners = new Set();
function connect() {
  if (ws) return;
  ws = new WebSocket(URL);
  ws.onmessage = (e) => listeners.forEach(l => l(e));
  ws.onclose = () => { ws = null; setTimeout(connect, 1000); };
}
export function subscribe(fn) {
  listeners.add(fn);
  if (!ws) connect();
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0) { ws?.close(); ws = null; }
  };
}

// Component
useEffect(() => subscribe(handleMessage), []);
```

This is connection-multiplexing — many components share one socket — and survives Strict Mode double-invocation cleanly because the second mount immediately finds an existing socket and just adds a listener.

---

**Q5: Your team picked WebSockets for "all real-time features" two years ago. You now have 50K concurrent connections and AWS bills are exploding. What questions would you ask before reaching for an architecture change?**

Before adding more infrastructure, audit:

1. **What fraction of those connections are actually exchanging messages?** If most users sit idle 90% of the time, you're paying for connection state with no traffic. Polling-when-needed beats persistent-connection-when-idle for that workload.

2. **How latency-sensitive is each feature?** "Real-time" often means "within a few seconds." For most dashboards, a 5s poll is indistinguishable from a 100ms WebSocket — but cheaper.

3. **What's the peak vs average concurrency?** Persistent connections cost 24/7. If peak is 50K and average is 5K, you're over-provisioned 10x. With polling, you'd auto-scale to actual traffic.

4. **Are there workloads that genuinely need bidi?** Chat, multiplayer games, live trading: yes. Notifications, build status, dashboard updates: no.

5. **What's the cost of a missed update?** SSE/polling lose nothing if the connection drops mid-window. WebSocket-with-replay infrastructure (Redis Streams, sticky sessions, resume tokens) is a significant ops burden.

6. **Can you split workloads?** Use WebSockets *only* for the truly bidi, low-latency features (chat); use SSE for one-way push (notifications, dashboards); use polling for everything else (settings, profile updates).

The architectural mistake is treating "real-time" as one problem with one solution. Each feature has its own answer; the cost reduction usually comes from acknowledging that and reverting most features to polling or SSE.

---

**Q6: Your AI chat UI streams responses with `fetch` + `ReadableStream`. Users on Safari complain of long delays before any text appears, while Chrome users see instant streaming. What's likely going on?**

A few common causes, in order of likelihood:

1. **Buffering at the proxy / origin / CDN.** Cloudflare buffers responses smaller than 1MB by default unless you set `Cache-Control: no-transform` and either hit a streaming-eligible content type or use a Worker. Nginx without `proxy_buffering off;` does the same. Safari's HTTP/2 implementation is more strict about flushing — sometimes it shows the bug Chrome's heuristic flushing hides.

2. **`TextDecoder` not in streaming mode.** If you decode each chunk independently — `decoder.decode(value)` — and a multi-byte UTF-8 character (em-dash, emoji) spans two chunks, you get a replacement character or the chunk gets held back. Always pass `{ stream: true }`: `decoder.decode(value, { stream: true })`.

3. **HTTP/3 vs HTTP/2 behavior.** Safari prefers HTTP/3 (QUIC); some intermediaries handle stream-flushing inconsistently between the two.

4. **Compression buffering.** `gzip`/`brotli` won't flush small chunks until they have enough data to compress efficiently. Either disable compression on the streaming endpoint (`Cache-Control: no-transform`) or write padding bytes occasionally to force a flush.

Diagnostic path: use `curl --no-buffer https://...` and time the bytes arriving. If curl shows instant streaming, the bug is client-side (TextDecoder, etc.); if curl also waits, the bug is server-side or proxy buffering.

---

**Q7: Why is "exactly-once delivery" usually a lie, and what should you implement instead?**

"Exactly-once" requires perfect coordination between sender and receiver across an unreliable network. In the general case, it's impossible — the Two Generals Problem. What you can build is **at-least-once delivery + idempotent processing**, which behaves like exactly-once from the user's perspective.

The pattern:

1. **Sender attaches a unique ID** (`messageId: uuid()`) to every message.
2. **Sender retries on no ack** — yes, the receiver might get the same message twice.
3. **Receiver maintains a seen-IDs set** (Redis with TTL, or a local Set in memory). On receive, look up the ID; if seen, drop. If new, process and add to set.
4. **Processing must be idempotent.** "Send notification" → check if already sent. "Increment counter" → use UPDATE WHERE messageId NOT IN (...) or a transactional outbox.

Now: messages may be delivered N times, but processed exactly once. Functionally indistinguishable from exactly-once.

The interview signal: do you reach for "guaranteed delivery" (a marketing term) or for "at-least-once + idempotent" (the engineering reality)?

---

**Q8: You build a video-call app with WebRTC for media. Why do you also need a WebSocket?**

WebRTC media flows peer-to-peer (or via a TURN/SFU relay), but the **discovery/signaling** — how peers find each other and exchange the SDPs (Session Description Protocols) and ICE candidates needed to start the connection — is **not** part of WebRTC.

Signaling needs:

- Real-time bidirectional message delivery between two browsers that don't yet have a direct connection.
- Persistent (the call setup might take seconds).
- Handles offers, answers, candidate trickling, renegotiation, hangup.

That's a textbook WebSocket use case. The alternatives — long polling, SSE, manual `fetch` — all work, but WebSocket is the easiest fit. Once signaling completes and the peer connection is up, you can close the WebSocket if you want; many apps keep it for control-plane messages (mute/unmute notifications, in-call chat, hangup signals).

The split: **WebSocket = control plane (signaling)**, **WebRTC = data plane (media)**. Real apps need both.

---

## References

- [MDN — Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [MDN — WebSockets API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [MDN — Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [RFC 6455 — The WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [HTML Living Standard — Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [web.dev — Streaming requests with the fetch API](https://web.dev/articles/fetch-upload-streaming)
- [Socket.IO docs](https://socket.io/docs/v4/)
- [graphql-ws — GraphQL over WebSocket](https://github.com/enisdenjo/graphql-ws)
- [Cloudflare — Building real-time apps at scale](https://blog.cloudflare.com/durable-objects-easy-fast-correct/)
