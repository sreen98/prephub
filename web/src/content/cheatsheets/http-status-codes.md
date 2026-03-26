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
