# HTTP Status Codes Cheat Sheet

## 1xx — Informational

| Code | Name | Use |
|------|------|-----|
| 100 | Continue | Client should continue with request |
| 101 | Switching Protocols | Upgrading to WebSocket |

## 2xx — Success

| Code | Name | Use |
|------|------|-----|
| **200** | **OK** | Standard success response |
| **201** | **Created** | Resource created (POST) |
| 202 | Accepted | Request accepted, processing async |
| **204** | **No Content** | Success, no body (DELETE) |

## 3xx — Redirection

| Code | Name | Use |
|------|------|-----|
| **301** | **Moved Permanently** | URL changed forever (SEO redirect) |
| **302** | **Found** | Temporary redirect |
| 303 | See Other | Redirect after POST (PRG pattern) |
| **304** | **Not Modified** | Cached version is valid |
| 307 | Temporary Redirect | Like 302, preserves HTTP method |
| 308 | Permanent Redirect | Like 301, preserves HTTP method |

## 4xx — Client Errors

| Code | Name | Use |
|------|------|-----|
| **400** | **Bad Request** | Malformed syntax, invalid data |
| **401** | **Unauthorized** | Authentication required |
| **403** | **Forbidden** | Authenticated but not allowed |
| **404** | **Not Found** | Resource doesn't exist |
| 405 | Method Not Allowed | Wrong HTTP method |
| 408 | Request Timeout | Client took too long |
| **409** | **Conflict** | Conflicts with current state |
| 413 | Payload Too Large | Request body too big |
| **422** | **Unprocessable Entity** | Validation errors |
| **429** | **Too Many Requests** | Rate limit exceeded |

## 5xx — Server Errors

| Code | Name | Use |
|------|------|-----|
| **500** | **Internal Server Error** | Generic server failure |
| 501 | Not Implemented | Feature not supported |
| **502** | **Bad Gateway** | Upstream server error |
| **503** | **Service Unavailable** | Server overloaded/maintenance |
| **504** | **Gateway Timeout** | Upstream server timeout |

## REST API Mapping

| Action | Method | Success Code |
|--------|--------|-------------|
| Get resource | GET | 200 |
| Get list | GET | 200 |
| Create resource | POST | 201 |
| Update (full) | PUT | 200 |
| Update (partial) | PATCH | 200 |
| Delete resource | DELETE | 204 |
| Resource not found | Any | 404 |
| Validation error | POST/PUT | 422 |
| Auth required | Any | 401 |
| Not permitted | Any | 403 |

## Quick Decision Tree
```
Is it a success? → 2xx
  Created something? → 201
  Nothing to return? → 204
  Otherwise → 200

Is the client wrong? → 4xx
  Not logged in? → 401
  Logged in, no permission? → 403
  Resource missing? → 404
  Bad input? → 400 or 422
  Too many requests? → 429

Is the server broken? → 5xx
  Generic error? → 500
  Proxy/gateway issue? → 502 or 504
  Overloaded? → 503
```

## The Pairs People Confuse
| Pair | Difference |
|---|---|
| **301 vs 308** | Both permanent. 301 lets clients switch POST→GET; **308 preserves the method and body**. |
| **302 vs 307** | Both temporary. 302 historically allowed POST→GET; **307 preserves the method**. |
| **401 vs 403** | 401 = *who are you* (no/invalid credentials, retry with auth). 403 = *I know you, you may not* (don't retry). |
| **400 vs 422** | 400 = malformed/unparseable. 422 = syntactically valid but semantically wrong (validation). |
| **404 vs 403** | Return 404 for a resource the user may not even know exists — a 403 confirms existence and leaks information. |
| **409 vs 422** | 409 = conflicts with current **state** (duplicate, version mismatch). 422 = the **payload** is invalid. |
| **502 vs 504** | 502 = upstream returned garbage or refused. 504 = upstream didn't answer in time. |
| **503 vs 429** | 503 = the server is unavailable. 429 = *you specifically* sent too many. |

## Headers That Go With Them
```http
401 → WWW-Authenticate: Bearer realm="api"
405 → Allow: GET, POST
429 → Retry-After: 120            # seconds, or an HTTP date
503 → Retry-After: 30
301/302/307/308 → Location: /new-path
201 → Location: /resources/42     # where the new resource lives
206 → Content-Range: bytes 0-999/5000
304 → (no body) driven by ETag / Last-Modified
```

## Conditional Requests & 304
```http
# response
ETag: "abc123"
Cache-Control: max-age=60, must-revalidate

# next request
If-None-Match: "abc123"     → 304 Not Modified (no body, saves bandwidth)
If-Match: "abc123"          → 412 Precondition Failed if it changed (optimistic locking)
```
`If-Match` + `412` is how you prevent lost updates without a database lock.

## Idempotency & Retries
| Method | Safe | Idempotent | Retryable |
|---|---|---|---|
| GET / HEAD | yes | yes | yes |
| PUT | no | **yes** | yes |
| DELETE | no | **yes** | yes |
| POST | no | **no** | only with an idempotency key |
| PATCH | no | no* | with a key |

Retry `408`, `429`, `502`, `503`, `504` with backoff and jitter. Never blind-retry a `POST` — send an `Idempotency-Key` header and have the server de-duplicate.

## CORS & Preflight
```
OPTIONS preflight must return 2xx (200 or 204) — a 401/403/404 on OPTIONS
breaks the actual request, because preflight is sent WITHOUT credentials.
A CORS failure is not a status code: the response may be 200 and still be
blocked by the browser for missing Access-Control-Allow-Origin.
```

## Less Common but Asked
| Code | Use |
|---|---|
| 206 | Partial Content — range requests, video streaming |
| 207 | Multi-Status — per-item results in a batch |
| 410 | Gone — permanently removed (stronger than 404, good for SEO) |
| 412 | Precondition Failed — `If-Match` didn't hold |
| 415 | Unsupported Media Type — wrong `Content-Type` |
| 418 | I'm a teapot — a joke, genuinely in an RFC |
| 421 | Misdirected Request |
| 428 | Precondition Required — force conditional writes |
| 451 | Unavailable For Legal Reasons |
| 499 | Client Closed Request — nginx-specific, not standard |

## Gotchas
- **GraphQL returns `200` even for errors**, with an `errors` array — checking `res.ok` is not enough.
- `fetch()` does **not** reject on 4xx/5xx; only network failure rejects. Check `res.ok` yourself.
- `204` must have **no body** — sending one breaks some clients and proxies.
- A `301` is **cached aggressively by browsers**, sometimes permanently. Use `302`/`307` while you're unsure.
- Redirecting a POST with `301`/`302` can silently convert it to GET and drop the body — use `307`/`308`.
- Returning `200` with `{"error": ...}` defeats every monitoring tool and cache. Use the status code.
- `500` for validation errors hides real bugs in your alerting — reserve 5xx for *your* faults.
- `403` on a missing resource leaks its existence; prefer `404` for anything permission-scoped.
- Load balancers generate their own `502`/`504` — your app may never have seen the request.
