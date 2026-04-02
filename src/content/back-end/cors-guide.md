# CORS (Cross-Origin Resource Sharing) Guide

A comprehensive guide to CORS — how browsers enforce cross-origin security, how servers configure it, and everything you need to know for interviews.

---

## Table of Contents

1. [Same-Origin Policy](#1-same-origin-policy)
2. [What is CORS?](#2-what-is-cors)
3. [How Origins Work](#3-how-origins-work)
4. [Simple Requests](#4-simple-requests)
5. [Preflight Requests](#5-preflight-requests)
6. [CORS Headers](#6-cors-headers)
7. [Credentialed Requests](#7-credentialed-requests)
8. [Common CORS Patterns](#8-common-cors-patterns)
9. [CORS in Express.js](#9-cors-in-expressjs)
10. [CORS Errors & Debugging](#10-cors-errors--debugging)
11. [Security Best Practices](#11-security-best-practices)
12. [CORS vs Other Cross-Origin Mechanisms](#12-cors-vs-other-cross-origin-mechanisms)
13. [CORS in Different Environments](#13-cors-in-different-environments)
14. [Interview Questions](#14-interview-questions)

---

## 1. Same-Origin Policy

### What is the Same-Origin Policy?

The **Same-Origin Policy (SOP)** is a fundamental browser security mechanism that restricts how documents or scripts from one origin can interact with resources from another origin.

```
Two URLs have the SAME origin if they share:
  ✅ Same protocol (scheme)
  ✅ Same host (domain)
  ✅ Same port

Example base URL: https://example.com

✅ Same origin:
  https://example.com/page       → same protocol, host, port
  https://example.com/api/data   → path doesn't matter

❌ Different origin:
  http://example.com             → different protocol (http vs https)
  https://api.example.com        → different host (subdomain counts!)
  https://example.com:8080       → different port
  https://other.com              → different host entirely
```

### What SOP Blocks

```
Without CORS, the browser BLOCKS:
  ❌ XMLHttpRequest / fetch() to different origins
  ❌ Reading response from cross-origin <canvas>
  ❌ Reading cross-origin iframe content

The browser ALLOWS (even without CORS):
  ✅ <img src="...">          → loading images
  ✅ <script src="...">       → loading scripts (JSONP exploits this)
  ✅ <link href="...">        → loading stylesheets
  ✅ <form action="...">      → submitting forms
  ✅ <video> / <audio>        → loading media
```

> **Key insight:** SOP is enforced by the **browser**, not the server. The server always receives and processes the request — SOP prevents the browser from exposing the response to JavaScript.

---

## 2. What is CORS?

**CORS (Cross-Origin Resource Sharing)** is a protocol that allows servers to declare which origins are permitted to read their responses via browsers.

```
Without CORS:
  Browser → Request → Server → Response → ❌ Browser blocks JS from reading it

With CORS:
  Browser → Request → Server → Response + CORS headers → ✅ Browser allows JS to read it
```

### The CORS Flow

```
┌─────────┐                          ┌─────────┐
│ Browser  │                          │ Server  │
│ (JS at   │                          │ (API at │
│ app.com) │                          │ api.com)│
└────┬─────┘                          └────┬────┘
     │                                     │
     │  1. JS calls fetch("https://api.com/data")
     │                                     │
     │  2. Browser adds Origin header      │
     │  ─────────────────────────────────► │
     │  GET /data                          │
     │  Origin: https://app.com            │
     │                                     │
     │  3. Server checks Origin, adds      │
     │     CORS headers to response        │
     │  ◄───────────────────────────────── │
     │  Access-Control-Allow-Origin:       │
     │    https://app.com                  │
     │                                     │
     │  4. Browser checks CORS headers    │
     │     ✅ Origin is allowed → JS gets  │
     │        the response data            │
     │     ❌ Origin not allowed → browser │
     │        blocks, throws CORS error    │
     │                                     │
```

---

## 3. How Origins Work

### Origin Components

```javascript
// An origin is: protocol + host + port
const url = new URL("https://app.example.com:443/api/data?key=123#section");

url.origin    // "https://app.example.com:443"
url.protocol  // "https:"
url.host      // "app.example.com:443"
url.hostname  // "app.example.com"
url.port      // "443" (default for https)
```

### Origin Comparison Examples

```
Base: https://www.example.com

URL                                 Same Origin?   Reason
─────────────────────────────────────────────────────────────
https://www.example.com/page        ✅ Yes         Same everything
https://www.example.com:443/api     ✅ Yes         443 is default for https
http://www.example.com              ❌ No          http ≠ https
https://example.com                 ❌ No          www.example.com ≠ example.com
https://api.example.com             ❌ No          Different subdomain
https://www.example.com:8080        ❌ No          Different port
```

### The `null` Origin

```
Requests that send Origin: null:
  - Sandboxed iframes
  - Local file:// URLs
  - Redirects from data: URLs
  - Privacy-sensitive contexts

⚠️ NEVER allow Access-Control-Allow-Origin: null
   Multiple sources can send null — it's not a safe value to whitelist
```

---

## 4. Simple Requests

A **simple request** is a CORS request that does NOT trigger a preflight. The browser sends it directly.

### Conditions for a Simple Request

```
ALL conditions must be true:

1. Method is one of:
   ✅ GET
   ✅ HEAD
   ✅ POST

2. Only these headers are set (beyond auto-set ones):
   ✅ Accept
   ✅ Accept-Language
   ✅ Content-Language
   ✅ Content-Type (with restrictions)

3. Content-Type (if set) is one of:
   ✅ application/x-www-form-urlencoded
   ✅ multipart/form-data
   ✅ text/plain

4. No ReadableStream in the request body
5. No event listeners on XMLHttpRequest.upload
```

### Simple Request Flow

```
Browser                                Server
  │                                      │
  │  GET /api/data HTTP/1.1              │
  │  Host: api.example.com              │
  │  Origin: https://app.example.com    │
  │  ──────────────────────────────────► │
  │                                      │
  │  HTTP/1.1 200 OK                     │
  │  Access-Control-Allow-Origin:        │
  │    https://app.example.com           │
  │  Content-Type: application/json      │
  │  ◄────────────────────────────────── │
  │                                      │
  │  ✅ Origin matches → JS can read     │
```

### Why POST with `application/json` Is NOT Simple

```
// ❌ This triggers a preflight:
fetch("https://api.example.com/data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },  // ← NOT in safe list
  body: JSON.stringify({ name: "Alice" })
});

// ✅ This is a simple request:
fetch("https://api.example.com/data", {
  method: "POST",
  headers: { "Content-Type": "text/plain" },  // ← In safe list
  body: JSON.stringify({ name: "Alice" })
});
// But the server gets a text/plain Content-Type, which is usually not useful
```

---

## 5. Preflight Requests

When a request doesn't qualify as "simple," the browser sends a **preflight** — an `OPTIONS` request — to ask the server for permission before sending the actual request.

### What Triggers a Preflight

```
Any of these triggers a preflight:

✦ Methods: PUT, DELETE, PATCH, or any custom method
✦ Headers: Authorization, X-Custom-Header, Content-Type: application/json
✦ Content types other than the three "safe" ones
```

### Preflight Flow

```
Browser                                  Server
  │                                        │
  │  ① OPTIONS /api/users HTTP/1.1         │  ← Preflight
  │  Origin: https://app.example.com       │
  │  Access-Control-Request-Method: PUT    │
  │  Access-Control-Request-Headers:       │
  │    Content-Type, Authorization         │
  │  ────────────────────────────────────► │
  │                                        │
  │  HTTP/1.1 204 No Content               │
  │  Access-Control-Allow-Origin:          │
  │    https://app.example.com             │
  │  Access-Control-Allow-Methods:         │
  │    GET, POST, PUT, DELETE              │
  │  Access-Control-Allow-Headers:         │
  │    Content-Type, Authorization         │
  │  Access-Control-Max-Age: 86400        │
  │  ◄──────────────────────────────────── │
  │                                        │
  │  ✅ Preflight passed                   │
  │                                        │
  │  ② PUT /api/users/123 HTTP/1.1        │  ← Actual request
  │  Origin: https://app.example.com       │
  │  Authorization: Bearer token123        │
  │  Content-Type: application/json        │
  │  {"name": "Alice"}                     │
  │  ────────────────────────────────────► │
  │                                        │
  │  HTTP/1.1 200 OK                       │
  │  Access-Control-Allow-Origin:          │
  │    https://app.example.com             │
  │  ◄──────────────────────────────────── │
```

### Preflight Caching

```
Access-Control-Max-Age: 86400    (24 hours)

Browser caches the preflight result per:
  - Origin
  - URL
  - Request method + headers

During the cache period, subsequent requests
skip the preflight and go directly.

⚠️ Browser caps may apply:
  Chrome: max 7200 (2 hours)
  Firefox: max 86400 (24 hours)
```

---

## 6. CORS Headers

### Response Headers (Server → Browser)

```
Header                              Purpose
──────────────────────────────────────────────────────────────────

Access-Control-Allow-Origin         Which origin(s) can read the response
  Values: *, specific origin, or omitted

Access-Control-Allow-Methods        Which HTTP methods are allowed (preflight)
  Values: GET, POST, PUT, DELETE, PATCH, OPTIONS

Access-Control-Allow-Headers        Which request headers are allowed (preflight)
  Values: Content-Type, Authorization, X-Custom-Header, etc.

Access-Control-Expose-Headers       Which response headers JS can read
  (By default, JS can only see "safe" headers)
  Values: X-Total-Count, X-Request-Id, etc.

Access-Control-Allow-Credentials    Whether cookies/auth can be sent
  Values: true (only valid value, or omit the header)

Access-Control-Max-Age              How long (seconds) to cache preflight result
  Values: 0 to 86400

Vary                                Must include "Origin" when CORS responses differ
  Values: Origin (append to existing Vary values)
```

### Request Headers (Browser → Server, auto-set)

```
Header                              Purpose
──────────────────────────────────────────────────────────────────

Origin                              The origin making the request
  Set by browser, cannot be faked by JS

Access-Control-Request-Method       The method the actual request will use
  Only sent in preflight OPTIONS request

Access-Control-Request-Headers      Custom headers the actual request will send
  Only sent in preflight OPTIONS request
```

### CORS-Safe Response Headers

```
By default, JS can only access these response headers:
  - Cache-Control
  - Content-Language
  - Content-Length
  - Content-Type
  - Expires
  - Last-Modified
  - Pragma

To expose others, use Access-Control-Expose-Headers:

// Server response
Access-Control-Expose-Headers: X-Total-Count, X-Request-Id

// Now JS can read these:
response.headers.get("X-Total-Count")  // ✅ works
response.headers.get("X-Request-Id")   // ✅ works
```

---

## 7. Credentialed Requests

By default, cross-origin requests do NOT include cookies, HTTP auth, or client certificates. To include credentials, both sides must opt in.

### Client Side

```javascript
// Fetch API
fetch("https://api.example.com/data", {
  credentials: "include"    // ← send cookies cross-origin
});

// XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.withCredentials = true;  // ← send cookies cross-origin
xhr.open("GET", "https://api.example.com/data");

// Axios
axios.get("https://api.example.com/data", {
  withCredentials: true
});
```

### Server Side

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com   ← MUST be specific origin
Access-Control-Allow-Credentials: true                  ← MUST be true
```

### Credential Rules

```
When credentials: true:

  ❌ Access-Control-Allow-Origin: *           → CANNOT use wildcard
  ❌ Access-Control-Allow-Headers: *          → CANNOT use wildcard
  ❌ Access-Control-Allow-Methods: *          → CANNOT use wildcard
  ❌ Access-Control-Expose-Headers: *         → CANNOT use wildcard

  ✅ Must specify exact origin
  ✅ Must list explicit headers
  ✅ Must list explicit methods

This is a security measure — wildcard + credentials would allow
any site to make authenticated requests to your API.
```

### Cookie Behavior

```
Cross-origin cookies require:
  1. credentials: "include" on the request
  2. Access-Control-Allow-Credentials: true in the response
  3. The cookie must have SameSite=None
  4. The cookie must have Secure flag (HTTPS only)
  5. The domain must match (cookie domain ⊇ API domain)

// Server setting a cross-origin cookie:
Set-Cookie: session=abc123; SameSite=None; Secure; HttpOnly; Path=/
```

---

## 8. Common CORS Patterns

### Pattern 1: Public API (Any Origin)

```
Access-Control-Allow-Origin: *

Use for:
  - Public data APIs
  - CDN resources
  - Open APIs

Limitations:
  - Cannot use with credentials
  - Cannot expose custom headers with wildcard
```

### Pattern 2: Single Trusted Origin

```
Access-Control-Allow-Origin: https://app.example.com
Vary: Origin

Use for:
  - Single frontend + API architecture
  - Simple internal tools
```

### Pattern 3: Dynamic Origin Allowlist

```javascript
// Server checks Origin against a whitelist
const allowedOrigins = [
  "https://app.example.com",
  "https://staging.example.com",
  "https://admin.example.com"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  next();
});
```

### Pattern 4: Subdomain Matching

```javascript
// Allow all subdomains of example.com
function isAllowedOrigin(origin) {
  try {
    const url = new URL(origin);
    return url.hostname === "example.com" ||
           url.hostname.endsWith(".example.com");
  } catch {
    return false;
  }
}
```

### Pattern 5: Proxy to Avoid CORS

```
Instead of:
  Browser → fetch("https://api.external.com/data")  ← CORS!

Use a proxy:
  Browser → fetch("/api/proxy/data")  ← Same origin, no CORS
  Your Server → https://api.external.com/data  ← Server-to-server, no CORS

// Vite dev server proxy
// vite.config.js
export default {
  server: {
    proxy: {
      "/api": {
        target: "https://api.external.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
}
```

---

## 9. CORS in Express.js

### Using the `cors` Middleware

```javascript
const express = require("express");
const cors = require("cors");
const app = express();

// ① Allow all origins (public API)
app.use(cors());

// ② Allow specific origin
app.use(cors({
  origin: "https://app.example.com"
}));

// ③ Allow multiple origins with dynamic check
app.use(cors({
  origin: ["https://app.example.com", "https://staging.example.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count", "X-Request-Id"],
  credentials: true,
  maxAge: 86400
}));

// ④ Dynamic origin with a function
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "https://app.example.com",
      "https://staging.example.com"
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ⑤ Per-route CORS
app.get("/api/public", cors(), (req, res) => {
  res.json({ data: "public" });
});

app.get("/api/private", cors({ origin: "https://app.example.com" }), (req, res) => {
  res.json({ data: "private" });
});
```

### Manual CORS Without Middleware

```javascript
app.use((req, res, next) => {
  const allowedOrigins = ["https://app.example.com"];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});
```

---

## 10. CORS Errors & Debugging

### Common Error Messages

```
❌ "Access to fetch at 'https://api.example.com' from origin
    'https://app.example.com' has been blocked by CORS policy:
    No 'Access-Control-Allow-Origin' header is present on the
    requested resource."

    Fix: Server must add Access-Control-Allow-Origin header

❌ "...has been blocked by CORS policy: The value of the
    'Access-Control-Allow-Origin' header must not be the wildcard
    '*' when the request's credentials mode is 'include'."

    Fix: Use specific origin instead of * when credentials are used

❌ "...has been blocked by CORS policy: Request header field
    'authorization' is not allowed by Access-Control-Allow-Headers
    in preflight response."

    Fix: Add 'Authorization' to Access-Control-Allow-Headers

❌ "...has been blocked by CORS policy: Method PUT is not allowed
    by Access-Control-Allow-Methods in preflight response."

    Fix: Add 'PUT' to Access-Control-Allow-Methods
```

### Debugging Checklist

```
1. Open DevTools → Network tab
2. Look for the OPTIONS preflight request
3. Check these response headers:
   □ Access-Control-Allow-Origin matches your origin?
   □ Access-Control-Allow-Methods includes your method?
   □ Access-Control-Allow-Headers includes your custom headers?
   □ Access-Control-Allow-Credentials: true (if sending cookies)?
4. Is the server returning an error status on OPTIONS?
   (OPTIONS should return 200 or 204)
5. Is a reverse proxy / load balancer stripping CORS headers?
```

### Using `curl` to Debug

```bash
# Test a simple CORS request
curl -v -H "Origin: https://app.example.com" \
  https://api.example.com/data

# Test a preflight request
curl -v -X OPTIONS \
  -H "Origin: https://app.example.com" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  https://api.example.com/data

# Look for these in the response:
# < Access-Control-Allow-Origin: https://app.example.com
# < Access-Control-Allow-Methods: PUT
# < Access-Control-Allow-Headers: Content-Type, Authorization
```

### Common Mistakes

```
Mistake                              Fix
─────────────────────────────────────────────────────────────────

Wildcard * with credentials          Use specific origin
Missing Vary: Origin                 Always add when origin is dynamic
OPTIONS returns 404/500              Ensure server handles OPTIONS method
CORS headers on error responses      Add CORS headers even for 4xx/5xx
Trailing slash mismatch              /api/data ≠ /api/data/
http vs https origin mismatch        Origins must exactly match
Forgetting port in origin            localhost:3000 ≠ localhost:5000
```

---

## 11. Security Best Practices

### Origin Validation

```javascript
// ❌ BAD: Regex that can be bypassed
const isAllowed = /example\.com/.test(origin);
// Matches: evil-example.com, example.com.evil.com

// ❌ BAD: Partial string match
const isAllowed = origin.includes("example.com");
// Matches: evil.com?example.com, example.com.evil.com

// ✅ GOOD: Exact match against whitelist
const allowedOrigins = new Set([
  "https://app.example.com",
  "https://staging.example.com"
]);
const isAllowed = allowedOrigins.has(origin);

// ✅ GOOD: Safe subdomain check with URL parsing
function isAllowed(origin) {
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === "https:" &&
           (hostname === "example.com" ||
            hostname.endsWith(".example.com"));
  } catch { return false; }
}
```

### Security Checklist

```
✅ Use an explicit allowlist — never reflect Origin blindly
✅ Always set Vary: Origin when the response depends on origin
✅ Never allow Access-Control-Allow-Origin: null
✅ Limit Access-Control-Allow-Methods to what's needed
✅ Limit Access-Control-Allow-Headers to what's needed
✅ Set a reasonable Access-Control-Max-Age (not too long)
✅ Validate Origin on the server even if using CORS
   (CORS is browser-enforced — attackers can use curl)
✅ Use HTTPS for all origins
✅ Don't rely solely on CORS for security — use auth tokens too
```

### The `Vary: Origin` Header

```
Why it matters:
  If your server returns different CORS headers based on the Origin,
  caches (CDN, browser) MUST know that the response varies by Origin.

Without Vary: Origin:
  1. User A from origin-a.com → gets cached response with Allow-Origin: origin-a.com
  2. User B from origin-b.com → gets the CACHED response → CORS error!

With Vary: Origin:
  Cache stores separate entries per Origin → correct behavior.

Rule: If Access-Control-Allow-Origin is NOT *, always send Vary: Origin
```

---

## 12. CORS vs Other Cross-Origin Mechanisms

### CORS vs JSONP

```
Feature                CORS                    JSONP
──────────────────────────────────────────────────────────────
Mechanism              HTTP headers             <script> tag
Methods supported      All                     GET only
Error handling         Yes (catch errors)      No (script fails silently)
Security               Controlled by server    Risky (executes arbitrary JS)
Headers access         Yes                     No
Modern usage           ✅ Standard             ❌ Legacy, avoid
Credentials            Configurable            Always sends cookies
POST data              Yes                     No
```

### CORS vs Proxy

```
CORS (direct):
  Browser ──fetch──► API server (different origin)
  + No extra infrastructure
  + Lower latency
  - Requires server CORS configuration
  - Exposes API to browsers directly

Proxy (indirect):
  Browser ──fetch──► Your server ──http──► API server
  + No CORS needed (same-origin to browser)
  + Can add auth, caching, rate limiting
  + Hides external API from client
  - Extra hop = more latency
  - More infrastructure to maintain
```

### CORS vs `postMessage`

```
CORS:        For HTTP requests between different origins
postMessage: For communication between windows/iframes at different origins

// postMessage example (iframe communication)
// Parent window
iframe.contentWindow.postMessage({ action: "getData" }, "https://other.com");

// Child iframe
window.addEventListener("message", (event) => {
  if (event.origin !== "https://parent.com") return;  // ← validate!
  // Handle the message
});
```

---

## 13. CORS in Different Environments

### AWS (API Gateway + Lambda)

```yaml
# SAM template
MyApi:
  Type: AWS::Serverless::Api
  Properties:
    Cors:
      AllowMethods: "'GET,POST,PUT,DELETE,OPTIONS'"
      AllowHeaders: "'Content-Type,Authorization'"
      AllowOrigin: "'https://app.example.com'"
```

```javascript
// Lambda function — return CORS headers in every response
exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "https://app.example.com",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    },
    body: JSON.stringify({ data: "hello" })
  };
};
```

### Nginx

```nginx
server {
    location /api/ {
        # Handle preflight
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "https://app.example.com";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Access-Control-Max-Age 86400;
            return 204;
        }

        add_header Access-Control-Allow-Origin "https://app.example.com" always;
        add_header Vary "Origin" always;

        proxy_pass http://backend;
    }
}
```

### Cloudflare Workers

```javascript
export default {
  async fetch(request) {
    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "https://app.example.com",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    const response = await fetch(request);
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "https://app.example.com");
    newResponse.headers.set("Vary", "Origin");
    return newResponse;
  }
};
```

### Development Environment

```javascript
// Vite proxy (avoids CORS in development)
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true
      }
    }
  }
});

// Create React App proxy
// package.json
{
  "proxy": "http://localhost:4000"
}

// In development, fetch("/api/data") proxies to http://localhost:4000/api/data
// No CORS needed — browser sees same-origin request
```

---

## 14. Interview Questions

### Beginner

**Q1: What is CORS and why does it exist?**

CORS (Cross-Origin Resource Sharing) is a browser security mechanism that controls which web origins can access resources from a different origin. It exists because of the **Same-Origin Policy** — browsers block cross-origin HTTP requests by default to prevent malicious websites from reading sensitive data from other sites.

For example, without SOP/CORS, a malicious page at `evil.com` could make a `fetch()` to `bank.com/api/account` and read your banking data if you're logged in — because the browser would send your cookies automatically. CORS lets servers explicitly opt in to sharing resources with specific origins.

---

**Q2: What is the difference between a simple request and a preflight request?**

**Simple requests** are sent directly without a preflight. They must use GET, HEAD, or POST with only standard headers and safe content types (`text/plain`, `multipart/form-data`, `application/x-www-form-urlencoded`).

**Preflight requests** are triggered when the request uses other methods (PUT, DELETE, PATCH), custom headers (like `Authorization`), or `Content-Type: application/json`. The browser sends an `OPTIONS` request first to check if the server allows it, then sends the actual request only if the preflight succeeds.

The key point: most real API calls trigger a preflight because they use JSON content type or Authorization headers.

---

**Q3: What does `Access-Control-Allow-Origin: *` mean? When can't you use it?**

The wildcard `*` means any origin is allowed to read the response. It's useful for public APIs that don't require authentication.

You **cannot** use `*` when `credentials: "include"` is set on the request (or `withCredentials: true` for XHR). The browser will reject the response with a CORS error. For credentialed requests, the server must echo back the specific origin (e.g., `Access-Control-Allow-Origin: https://app.example.com`).

---

**Q4: Why is CORS enforced by the browser and not the server?**

The server always processes the request regardless of CORS — it's the browser that decides whether to expose the response to JavaScript. This is because CORS is a **browser security feature** protecting the user, not a server-side access control mechanism.

This means:
- Server-to-server requests (Node.js, curl, Postman) are never affected by CORS
- CORS headers are instructions from the server to the browser about what's allowed
- You still need server-side auth — CORS alone doesn't protect your API from non-browser clients

---

### Intermediate

**Q5: Explain the full lifecycle of a CORS preflight request.**

1. Browser JS makes a cross-origin request (e.g., `PUT` with `Content-Type: application/json`)
2. Browser detects it's not a "simple" request → sends `OPTIONS` preflight
3. Preflight includes: `Origin`, `Access-Control-Request-Method`, `Access-Control-Request-Headers`
4. Server responds with: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, `Access-Control-Max-Age`
5. Browser checks: Does the allowed origin match? Is the method permitted? Are the headers allowed?
6. If all checks pass → browser sends the actual PUT request with the real payload
7. Server responds with data + `Access-Control-Allow-Origin` header on the actual response too
8. Browser exposes the response to JavaScript

If any check fails at step 5, the browser blocks the request and throws a CORS error. The actual request is never sent.

---

**Q6: What is `Vary: Origin` and why is it important?**

`Vary: Origin` tells caches (CDN, browser cache) that the response differs based on the `Origin` request header. Without it, a cached response for `origin-a.com` might be served to `origin-b.com`, causing CORS failures.

Example problem: A CDN caches the response with `Access-Control-Allow-Origin: https://a.com`. When `https://b.com` makes the same request, the CDN serves the cached response — but the CORS header says `a.com`, so the browser blocks it.

**Rule:** Always include `Vary: Origin` when `Access-Control-Allow-Origin` is set to a specific origin (not `*`).

---

**Q7: How do credentialed cross-origin requests work?**

Both client and server must opt in:
- **Client:** `credentials: "include"` (fetch) or `withCredentials: true` (XHR)
- **Server:** `Access-Control-Allow-Credentials: true` + specific origin (no wildcards)

With credentials, the browser sends cookies, HTTP auth, and TLS client certs. The server must respond with the exact origin (not `*`) for Allow-Origin, Allow-Headers, Allow-Methods, and Expose-Headers.

Additionally, cross-site cookies require `SameSite=None; Secure` attributes. Third-party cookie restrictions in modern browsers make this increasingly difficult — consider using tokens in headers instead.

---

**Q8: Your API works fine in Postman but fails with CORS errors in the browser. Why?**

Postman (and curl, server-to-server requests, etc.) are **not browsers** and don't enforce CORS. CORS is purely a browser security feature.

When Postman sends a request, there's no origin, no preflight, no CORS check. The server processes it normally.

When a browser sends the same request from a different origin, it:
1. Adds the `Origin` header automatically
2. May send a preflight `OPTIONS` request
3. Checks the response for CORS headers
4. Blocks the response if headers are missing or wrong

**Fix:** Configure the server to return proper CORS headers. The fact that it works in Postman confirms the API itself is fine — only the CORS headers are missing.

---

### Advanced

**Q9: How would you implement a secure CORS configuration for a production multi-tenant application?**

Key considerations:

1. **Dynamic origin allowlist** — Maintain a whitelist of allowed origins per tenant. Check the request's `Origin` header against the tenant's allowed origins from your database or config.

2. **Origin validation** — Use exact string matching (not regex or substring). Parse with `new URL()` to prevent bypass attacks like `evil-example.com` matching a regex for `example.com`.

3. **Always include `Vary: Origin`** — Critical for CDN correctness when responses differ per origin.

4. **Credential handling** — Use specific origins (never `*`), return `Access-Control-Allow-Credentials: true`, and ensure cookies have `SameSite=None; Secure`.

5. **Header minimization** — Only allow the specific headers and methods each endpoint needs, not a broad wildcard.

6. **Preflight caching** — Set `Access-Control-Max-Age` to reduce preflight overhead (e.g., 3600 seconds), but not so long that config changes take forever to propagate.

7. **Error responses** — CORS headers must be present even on error responses (4xx, 5xx), otherwise the browser can't read the error message.

8. **Defense in depth** — CORS is browser-only. Always validate auth tokens server-side. Never rely on CORS as your only security layer.

---

**Q10: Explain the security implications of reflecting the `Origin` header without validation.**

If a server blindly echoes back whatever `Origin` it receives:

```
// Dangerous server code:
res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
res.setHeader("Access-Control-Allow-Credentials", "true");
```

**Attack scenario:**
1. Victim is logged into `bank.com` (has session cookie)
2. Victim visits `evil.com`
3. `evil.com` runs: `fetch("https://bank.com/api/account", { credentials: "include" })`
4. Server sees `Origin: https://evil.com`, echoes it back
5. Browser sees matching CORS headers → allows `evil.com` to read the response
6. `evil.com` now has the victim's bank account data

This is essentially a CORS misconfiguration vulnerability. It's equivalent to `Access-Control-Allow-Origin: *` with credentials (which browsers explicitly block), but bypasses that protection through origin reflection.

**Fix:** Always validate the Origin against an explicit allowlist before reflecting it.

---

**Q11: How does CORS interact with CDNs, caching layers, and service workers?**

**CDN/Cache interaction:**
- Without `Vary: Origin`, a CDN may serve a cached response with the wrong CORS headers to a different origin, causing failures.
- Some CDNs strip or ignore `Vary` headers — test your CDN's behavior.
- Preflight responses should be cached at the browser level (`Access-Control-Max-Age`) to reduce CDN load, since OPTIONS requests may bypass CDN cache.

**Service Worker interaction:**
- Service workers can intercept requests and respond from cache. The cached response must include the correct CORS headers.
- `fetch()` from a service worker follows the same CORS rules as the page.
- `mode: "cors"` is the default for cross-origin `fetch()` — service workers should preserve this.
- A service worker can act as a CORS proxy by fetching in `mode: "no-cors"` (opaque response), but JS cannot read the response body — only useful for caching assets.

**Key principle:** Any layer that can serve a cached response must understand that CORS responses can vary by origin, and must cache and serve them accordingly.

---

**Q12: What are the alternatives to CORS for cross-origin communication, and when would you use each?**

| Mechanism | Use Case | Limitation |
|-----------|----------|------------|
| **CORS** | Standard API communication | Requires server support |
| **Proxy server** | When you can't modify the target server | Adds latency and infra |
| **postMessage** | Window/iframe communication | Not for HTTP requests |
| **WebSocket** | Real-time bidirectional comms | Only initial handshake has origin check |
| **JSONP** | Legacy GET-only APIs | Security risk, no error handling, deprecated |
| **Server-Sent Events** | Server push (one-way) | Subject to CORS for cross-origin |
| **document.domain** | Subdomain communication | Deprecated, being removed |

In modern applications, **CORS** is the standard for API communication. Use a **proxy** when you don't control the API server. Use **postMessage** for cross-window communication. Avoid JSONP and `document.domain` in new code.

---

**Q13: A user reports that CORS works in Chrome but fails in Safari. What could be wrong?**

Several Safari-specific CORS behaviors:

1. **Stricter cookie handling** — Safari's Intelligent Tracking Prevention (ITP) blocks third-party cookies more aggressively. Cross-origin cookies with `SameSite=None` may still be blocked.

2. **Preflight caching differences** — Safari may cache preflight results differently or have different max-age limits.

3. **`Vary` header handling** — Safari's cache may not properly respect `Vary: Origin`, serving stale CORS responses.

4. **Redirect handling** — Safari may not follow redirects on preflight requests the same way Chrome does. Ensure your server doesn't redirect OPTIONS requests.

5. **Private Relay / iCloud+** — Can change the client's IP and potentially affect origin-based decisions.

**Debugging steps:** Check Safari's Web Inspector for the exact error, compare the preflight responses between browsers, check for redirect chains, and test with and without ITP.

---

**Q14: How do you handle CORS in a microservices architecture with an API gateway?**

**Best approach — handle CORS at the API gateway only:**

```
Browser → API Gateway (CORS here) → Microservice A
                                  → Microservice B
                                  → Microservice C
```

Advantages:
- Single place to configure and update CORS
- Microservices don't need CORS logic
- Consistent behavior across all endpoints
- Gateway can validate origins against a central config

**Implementation:**
- Gateway handles all `OPTIONS` preflight requests and returns CORS headers
- Gateway adds CORS headers to all proxied responses
- Microservices are configured to only accept requests from the gateway (not directly from browsers)
- Use a centralized origin allowlist that the gateway reads from config/database

**Avoid:** Having both the gateway AND individual services add CORS headers — this can result in duplicate headers, which browsers reject.

---

**Q15: What is an opaque response and when would you encounter one?**

An **opaque response** (`type: "opaque"`) is returned when you make a cross-origin request with `mode: "no-cors"`. The browser fetches the resource but blocks JavaScript from reading any part of the response (status, headers, body).

```javascript
// Returns an opaque response
const res = await fetch("https://other.com/image.png", { mode: "no-cors" });
console.log(res.type);    // "opaque"
console.log(res.status);  // 0
console.log(res.ok);      // false
await res.text();          // "" (empty)
```

**Use cases:**
- Service workers caching third-party assets (the cache stores the opaque response; the browser can still render it for `<img>`, `<script>`, etc.)
- Fire-and-forget analytics pings

**Gotchas:**
- Opaque responses in Cache API count as ~7MB against storage quota (padded for privacy)
- You can't tell if the request succeeded or failed
- They're essentially useless for API data — use CORS instead
