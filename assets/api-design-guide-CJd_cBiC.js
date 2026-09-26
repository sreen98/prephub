const e=`# API Design Guide

A comprehensive guide to RESTful API design, best practices, patterns, and interview preparation.

---

## Table of Contents

1. [REST Fundamentals](#1-rest-fundamentals)
2. [URL & Resource Design](#2-url-resource-design)
3. [HTTP Methods](#3-http-methods)
4. [Request & Response Design](#4-request-response-design)
5. [Status Codes](#5-status-codes)
6. [Pagination](#6-pagination)
7. [Filtering, Sorting & Searching](#7-filtering-sorting-searching)
8. [Authentication & Authorization](#8-authentication-authorization)
9. [Versioning](#9-versioning)
10. [Error Handling](#10-error-handling)
11. [Rate Limiting](#11-rate-limiting)
12. [HATEOAS & Hypermedia](#12-hateoas-hypermedia)
13. [File Upload & Download](#13-file-upload-download)
14. [Real-Time APIs](#14-real-time-apis)
15. [GraphQL](#15-graphql)
16. [API Documentation](#16-api-documentation)
17. [API Security Best Practices](#17-api-security-best-practices)
18. [API Testing](#18-api-testing)
19. [API Design Patterns](#19-api-design-patterns)
20. [Interview Questions](#20-interview-questions)

---

## 1. REST Fundamentals

### What is REST?

REST (Representational State Transfer) is an architectural style for designing networked applications. It was defined by Roy Fielding in his 2000 doctoral dissertation.

### REST Constraints

REST is a set of rules, not a protocol, and two of them do most of the work in practice. **Stateless** means the server keeps no memory of the client between requests — every request carries its own credentials and context. That is what lets you put any number of identical servers behind a load balancer, since any of them can answer any request. **Uniform interface** means every resource is handled the same way — a URL names the thing, the HTTP method says what to do with it — so a client that knows one endpoint can guess the rest. The list below is the full set.

\`\`\`
1. Client-Server:       Separation of concerns
2. Stateless:           Each request contains all info needed
3. Cacheable:           Responses must define cacheability
4. Uniform Interface:   Standardized way to interact
5. Layered System:      Client can't tell if connected to end server
6. Code on Demand:      (Optional) Server can send executable code
\`\`\`

### Richardson Maturity Model

A four-step scale for how fully an API uses HTTP, from "one URL that takes commands" to "responses tell you what you can do next". Most real-world APIs sit at Level 2, and that is generally considered good enough; Level 3 is covered in §12.

\`\`\`
Level 0: The Swamp of POX
  - Single URI, single HTTP method (usually POST)
  - POST /api  { action: "getUser", id: 123 }

Level 1: Resources
  - Multiple URIs, one per resource
  - POST /api/users/123

Level 2: HTTP Verbs
  - Proper use of HTTP methods
  - GET /api/users/123
  - POST /api/users
  - PUT /api/users/123

Level 3: Hypermedia Controls (HATEOAS)
  - Responses include links to related actions
  - { "user": {...}, "_links": { "orders": "/api/users/123/orders" } }
\`\`\`

---

## 2. URL & Resource Design

### Resource Naming Conventions

URLs name **things** (nouns); the HTTP method is already the verb. \`POST /users\` reads as "create a user", so \`POST /createUser\` says the verb twice and leaves you inventing a new URL for every operation. Plural names keep the collection (\`/users\`) and one member (\`/users/123\`) on the same path.

\`\`\`
GOOD (nouns, plural, kebab-case):
GET    /api/v1/users
GET    /api/v1/users/123
GET    /api/v1/users/123/orders
GET    /api/v1/job-descriptions
GET    /api/v1/job-descriptions/456/candidates
POST   /api/v1/users/123/profile-image

BAD:
GET    /api/v1/getUsers            ← verb in URL
GET    /api/v1/user/123            ← singular
POST   /api/v1/createUser          ← action in URL
GET    /api/v1/user_list           ← snake_case
GET    /api/v1/Users               ← PascalCase
\`\`\`

### Resource Hierarchy

Nest a resource under its parent only as deep as you need to identify it. Once a child has its own id, the parents in front of it add nothing, and a deep path breaks the day the relationship changes (a candidate moves to a different job, a job to a different department).

\`\`\`
# Top-level resources
/api/v1/users
/api/v1/jobs
/api/v1/departments

# Sub-resources (parent-child relationship)
/api/v1/jobs/123/candidates
/api/v1/users/456/orders
/api/v1/departments/789/members

# Keep nesting shallow (max 2 levels)
GOOD: /api/v1/jobs/123/candidates/456
BAD:  /api/v1/companies/1/departments/2/jobs/3/candidates/4
\`\`\`

### Action Endpoints (When REST Doesn't Fit)

Some operations are not a create, read, update or delete of one resource — cancelling an order triggers refunds, emails and stock changes. Forcing that into \`PATCH /orders/456 { status: "cancelled" }\` hides a big side effect behind what looks like a field edit. A \`POST\` to an action sub-resource says plainly that something happens.

\`\`\`
# When an operation isn't a standard CRUD action, use a verb sub-resource:

POST /api/v1/users/123/activate
POST /api/v1/orders/456/cancel
POST /api/v1/jobs/789/publish
POST /api/v1/reports/generate
POST /api/v1/emails/send

# Or use a controller-style pattern:
POST /api/v1/authentication/login
POST /api/v1/authentication/logout
POST /api/v1/authentication/refresh-token
\`\`\`

---

## 3. HTTP Methods

### Method Semantics

Two properties recur below. **Safe** means the request changes nothing on the server (GET, HEAD, OPTIONS), so crawlers, prefetchers and caches may send it freely. **Idempotent** means sending it twice has the same effect as sending it once — explained next.

\`\`\`
GET     - Read a resource (idempotent, safe, cacheable)
POST    - Create a new resource (not idempotent)
PUT     - Replace an entire resource (idempotent)
PATCH   - Partially update a resource (not necessarily idempotent)
DELETE  - Remove a resource (idempotent)
OPTIONS - Describe available methods (CORS preflight)
HEAD    - Same as GET but no body (check existence, headers only)
\`\`\`

### Idempotency

Idempotency matters because networks fail in the middle. If a request times out, the client cannot tell whether the server did the work, so it retries. Retrying an idempotent request (PUT, DELETE) is harmless; retrying a POST can charge a card twice. That is why payment APIs accept an idempotency key on POST — the server remembers the key and returns the first result instead of repeating the work. Note that PATCH is idempotent only if the body sets values rather than changing them relative to what is there:

\`\`\`
Idempotent = same request N times produces same result

GET    /users/123          → Always returns user 123 ✓
PUT    /users/123 {name}   → Always sets name to value ✓
DELETE /users/123           → Always deletes (or 404) ✓
PATCH  /users/123 {age:30} → Always sets age to 30 ✓

POST   /users {data}       → Creates new user each time ✗
PATCH  /users/123 {age:+1} → Increments each time ✗ (not idempotent)
\`\`\`

### Express Implementation

\`\`\`javascript
import express from 'express';

const router = express.Router();

// GET /api/v1/users - List all users
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, role, sort } = req.query;
  const users = await userService.list({ page, limit, role, sort });
  res.json({
    status: 'success',
    results: users.data,
    pagination: users.pagination,
  });
});

// GET /api/v1/users/:id - Get single user
router.get('/:id', async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found',
    });
  }
  res.json({ status: 'success', results: user });
});

// POST /api/v1/users - Create user
router.post('/', validate(createUserSchema), async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json({ status: 'success', results: user });
});

// PUT /api/v1/users/:id - Replace user
router.put('/:id', validate(updateUserSchema), async (req, res) => {
  const user = await userService.replace(req.params.id, req.body);
  res.json({ status: 'success', results: user });
});

// PATCH /api/v1/users/:id - Partial update
router.patch('/:id', validate(patchUserSchema), async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  res.json({ status: 'success', results: user });
});

// DELETE /api/v1/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  await userService.delete(req.params.id);
  res.status(204).send();
});

export default router;
\`\`\`

---

## 4. Request & Response Design

### Request Body Conventions

\`\`\`json
// POST /api/v1/jobs
// Content-Type: application/json
{
  "title": "Senior React Developer",
  "departmentId": "dept-123",
  "description": "Building scalable web applications...",
  "skills": [
    { "name": "React", "isPrimary": true, "minYears": 3 },
    { "name": "TypeScript", "isPrimary": true, "minYears": 2 },
    { "name": "Node.js", "isPrimary": false }
  ],
  "salary": {
    "min": 120000,
    "max": 180000,
    "currency": "USD"
  },
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "remote": true
  },
  "dueDate": "2026-04-15T00:00:00.000Z"
}
\`\`\`

### Response Envelope Pattern

An envelope wraps every response in the same outer shape, with the data under one key (\`results\` here) and fields such as \`status\`, \`message\` and \`pagination\` beside it. The point is predictability: a client can write one response handler for the whole API instead of learning a new shape per endpoint, and there is a fixed place to add metadata later without moving the data. The cost is some redundancy, since the HTTP status code already says success or failure. Many APIs skip the envelope and rely on status codes plus headers; either is fine, as long as every endpoint does the same thing.

\`\`\`json
// Success response
{
  "status": "success",
  "message": "User created successfully",
  "results": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-03-06T10:00:00.000Z"
  }
}

// List response with pagination
{
  "status": "success",
  "results": [
    { "id": "user-1", "name": "Alice" },
    { "id": "user-2", "name": "Bob" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}

// Error response
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Must be at least 8 characters" }
  ]
}
\`\`\`

### Response Shaping

\`\`\`javascript
// Field selection (sparse fieldsets)
// GET /api/v1/users?fields=id,name,email
router.get('/', async (req, res) => {
  const fields = req.query.fields?.split(',') || null;
  const users = await userService.list({ fields });
  res.json({ status: 'success', results: users });
});

// Expansion (include related resources)
// GET /api/v1/jobs/123?expand=department,candidates
router.get('/:id', async (req, res) => {
  const expand = req.query.expand?.split(',') || [];
  const job = await jobService.findById(req.params.id, { expand });
  res.json({ status: 'success', results: job });
});
\`\`\`

### Date & Time

Send every timestamp as an ISO 8601 string in UTC, such as \`2026-03-06T10:30:00.000Z\` (the \`Z\` means UTC). ISO 8601 is the international standard date format; because it is always written biggest unit first, it sorts correctly as plain text, and every mainstream language can parse it. Using UTC everywhere means the server never has to guess which time zone a value is in: store UTC, and let the client convert to the viewer's local time for display.

\`\`\`
Always use ISO 8601 format in UTC:
- "2026-03-06T10:30:00.000Z"
- "2026-03-06" (date only)

Request: Accept ISO 8601 strings
Response: Return ISO 8601 strings
Storage: Store as UTC, convert on the client

Do NOT use:
- Unix timestamps in API responses (not human-readable)
- Local time without timezone
- Custom date formats
\`\`\`

---

## 5. Status Codes

### Success Codes (2xx)

\`\`\`
200 OK
  - GET request successful
  - PUT/PATCH update successful
  - DELETE when returning deleted resource

201 Created
  - POST successfully created a resource
  - Include Location header: Location: /api/v1/users/123

204 No Content
  - DELETE successful, no body returned
  - PUT/PATCH when no body needed in response

202 Accepted
  - Request accepted for async processing
  - The action hasn't completed yet
  - Include Location header to check status
\`\`\`

### Client Error Codes (4xx)

The two pairs people mix up: **401** means "I don't know who you are" (no credentials, or bad ones — log in again), while **403** means "I know who you are, and you may not do this" (logging in again will not help). **400** means the request could not be read at all (malformed JSON, wrong types), while **422** means it was read fine but breaks a rule (end date before start date). Many APIs use 400 for both; what matters is picking one convention and sticking to it.

\`\`\`
400 Bad Request
  - Malformed request syntax
  - Invalid request body
  - Validation errors

401 Unauthorized
  - Missing or invalid authentication
  - Token expired

403 Forbidden
  - Authenticated but not authorized
  - Insufficient permissions

404 Not Found
  - Resource doesn't exist
  - Also used to hide existence (security)

405 Method Not Allowed
  - HTTP method not supported for this resource
  - Include Allow header: Allow: GET, POST

409 Conflict
  - Resource state conflict
  - Duplicate entry (unique constraint)
  - Concurrent modification conflict

410 Gone
  - Resource permanently deleted
  - Unlike 404, we know it existed

415 Unsupported Media Type
  - Content-Type not supported

422 Unprocessable Entity
  - Request is well-formed but semantically invalid
  - Business rule violations

429 Too Many Requests
  - Rate limit exceeded
  - Include Retry-After header
\`\`\`

### Server Error Codes (5xx)

\`\`\`
500 Internal Server Error
  - Generic server error
  - Unhandled exceptions

502 Bad Gateway
  - Upstream server returned invalid response
  - Proxy/load balancer issue

503 Service Unavailable
  - Server temporarily unavailable
  - Maintenance mode, overloaded
  - Include Retry-After header

504 Gateway Timeout
  - Upstream server didn't respond in time
\`\`\`

---

## 6. Pagination

### Offset-Based Pagination

Offset pagination asks the database to skip N rows and return the next page. It has two weaknesses. The database still reads and discards all the skipped rows, so page 5,000 is much slower than page 1. And if a row is inserted or deleted while the user is paging, everything shifts — they see an item twice or miss one.

\`\`\`javascript
// GET /api/v1/users?page=2&limit=20

router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    db.users.find().skip(skip).limit(limit).toArray(),
    db.users.countDocuments(),
  ]);

  res.json({
    status: 'success',
    results: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

// Pros: Simple, supports jumping to any page
// Cons: Inconsistent results if data changes, slow for large offsets
\`\`\`

### Cursor-Based Pagination

Cursor pagination replaces "skip N rows" with "give me rows after this one". The cursor is an opaque token — here, the last row's id, base64-encoded so clients treat it as a black box — and the query becomes \`_id > lastId\`, which an index answers directly however deep you are. Inserts and deletes elsewhere do not shift the page. The cost: there is no "jump to page 37", only next.

\`\`\`javascript
// GET /api/v1/users?cursor=eyJpZCI6MTIzfQ&limit=20

router.get('/', async (req, res) => {
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const cursor = req.query.cursor
    ? JSON.parse(Buffer.from(req.query.cursor, 'base64').toString())
    : null;

  const query = cursor
    ? { _id: { $gt: cursor.id } }
    : {};

  const users = await db.users
    .find(query)
    .sort({ _id: 1 })
    .limit(limit + 1) // fetch one extra to check hasNext
    .toArray();

  const hasNext = users.length > limit;
  if (hasNext) users.pop(); // remove the extra

  const nextCursor = hasNext
    ? Buffer.from(JSON.stringify({ id: users[users.length - 1]._id })).toString('base64')
    : null;

  res.json({
    status: 'success',
    results: users,
    pagination: {
      limit,
      hasNext,
      nextCursor,
    },
  });
});

// Pros: Consistent results, performant for large datasets
// Cons: Can't jump to arbitrary page, more complex
\`\`\`

### Keyset Pagination (Best for Sorted Data)

Keyset pagination is the same idea as a cursor, with the position passed as plain values instead of a token. It matters when you sort by something that is not unique, such as \`createdAt\`: two jobs created in the same millisecond would make "after this date" skip or repeat rows. Adding \`_id\` as a tie-breaker, and comparing on the pair, gives every row one exact position. (A cursor is often just this pair, encoded.)

\`\`\`javascript
// GET /api/v1/jobs?after_date=2026-03-01&after_id=job-100&limit=20

router.get('/', async (req, res) => {
  const { after_date, after_id } = req.query;
  const limit = Number.parseInt(req.query.limit, 10) || 20;  // query values are strings

  const query = after_date && after_id
    ? {
        $or: [
          { createdAt: { $lt: new Date(after_date) } },
          { createdAt: new Date(after_date), _id: { $lt: after_id } },
        ],
      }
    : {};

  const jobs = await db.jobs
    .find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .toArray();

  const hasNext = jobs.length > limit;
  if (hasNext) jobs.pop();

  res.json({
    status: 'success',
    results: jobs,
    pagination: {
      hasNext,
      nextParams: hasNext
        ? {
            after_date: jobs[jobs.length - 1].createdAt.toISOString(),
            after_id: jobs[jobs.length - 1]._id,
          }
        : null,
    },
  });
});
\`\`\`

---

## 7. Filtering, Sorting & Searching

### Filtering

\`\`\`javascript
// Simple equality filters
// GET /api/v1/jobs?status=open&departmentId=dept-123

// Range filters
// GET /api/v1/jobs?salary_min=100000&salary_max=200000
// GET /api/v1/jobs?created_after=2026-01-01&created_before=2026-03-01

// Multiple values (comma-separated)
// GET /api/v1/jobs?status=open,under_assessment&skills=React,TypeScript

router.get('/', async (req, res) => {
  const filter = {};

  // Equality
  if (req.query.status) {
    const statuses = req.query.status.split(',');
    filter.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
  }

  if (req.query.departmentId) {
    filter.departmentId = req.query.departmentId;
  }

  // Range
  if (req.query.salary_min || req.query.salary_max) {
    filter['salary.min'] = {};
    if (req.query.salary_min) filter['salary.min'].$gte = parseInt(req.query.salary_min);
    if (req.query.salary_max) filter['salary.min'].$lte = parseInt(req.query.salary_max);
  }

  // Date range
  if (req.query.created_after) {
    filter.createdAt = { ...filter.createdAt, $gte: new Date(req.query.created_after) };
  }
  if (req.query.created_before) {
    filter.createdAt = { ...filter.createdAt, $lte: new Date(req.query.created_before) };
  }

  const jobs = await db.jobs.find(filter).toArray();
  res.json({ status: 'success', results: jobs });
});
\`\`\`

### Sorting

The whitelist in this example is the important part. Letting clients sort on any field means one request can force a full scan on an unindexed field, or sort on an internal field you never meant to expose — the order of results leaks information about a value even when the value itself is hidden.

\`\`\`javascript
// GET /api/v1/jobs?sort=-createdAt,title
// Prefix with - for descending

router.get('/', async (req, res) => {
  const sortParam = req.query.sort || '-createdAt';
  const sort = {};

  for (const field of sortParam.split(',')) {
    if (field.startsWith('-')) {
      sort[field.slice(1)] = -1;
    } else {
      sort[field] = 1;
    }
  }

  // Whitelist allowed sort fields
  const allowedSortFields = ['createdAt', 'title', 'salary', 'status'];
  const sanitizedSort = {};
  for (const [key, value] of Object.entries(sort)) {
    if (allowedSortFields.includes(key)) {
      sanitizedSort[key] = value;
    }
  }

  const jobs = await db.jobs.find().sort(sanitizedSort).toArray();
  res.json({ status: 'success', results: jobs });
});
\`\`\`

### Full-Text Search

\`\`\`javascript
// GET /api/v1/jobs?search=react+developer+san+francisco

router.get('/', async (req, res) => {
  const { search } = req.query;

  let query = {};
  if (search) {
    // MongoDB text index search
    query = {
      $text: {
        $search: search,
        $caseSensitive: false,
      },
    };
  }

  const jobs = await db.jobs
    .find(query, {
      // Include text match score
      ...(search && { score: { $meta: 'textScore' } }),
    })
    .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
    .toArray();

  res.json({ status: 'success', results: jobs });
});
\`\`\`

---

## 8. Authentication & Authorization

### Token-Based Auth (JWT)

The usual pattern issues two tokens. A short-lived **access token** (15 minutes here) is sent on every request and checked without a database lookup — if it leaks, it stops working soon. A long-lived **refresh token** lives in an \`httpOnly\` cookie, which page JavaScript cannot read, and is used only to get new access tokens. See the OAuth & SSO guide for rotation and storage in depth.

\`\`\`javascript
import jwt from 'jsonwebtoken';

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.authenticate(email, password);

  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials',
    });
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    status: 'success',
    results: { accessToken, user: { id: user.id, name: user.name } },
  });
});

// Auth middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ status: 'error', message: 'No token' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Token expired' });
    }
    res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
}
\`\`\`

### Cookie-Based Auth

\`\`\`javascript
import session from 'express-session';
import MongoStore from 'connect-mongo';

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60,
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// All API calls use cookie-based auth
// Frontend sends: credentials: 'include' or withCredentials: true
\`\`\`

### Role-Based Access Control (RBAC)

\`\`\`javascript
// Authorization middleware
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
    }

    next();
  };
}

// Usage
router.get('/users', authenticate, authorize('admin', 'manager'), getUsers);
router.post('/users/invite', authenticate, authorize('admin'), inviteUser);
router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);
\`\`\`

### API Key Authentication

Store only a hash of each key, the same way you store passwords. Then a leaked database gives an attacker hashes, not working keys. Show the key to the customer once when it is created, and look it up later by hashing whatever they send.

Accept the key only in a header, never in the query string (\`?api_key=...\`). A URL is written down in many places you do not control — server and proxy access logs, browser history, analytics tools — so a key in the URL leaks into all of them.

\`\`\`javascript
// For service-to-service or public API access
async function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];         // header only: URLs end up in logs

  if (!apiKey) {
    return res.status(401).json({ status: 'error', message: 'API key required' });
  }

  // Hash the key and look up in database
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
  const keyRecord = await db.apiKeys.findOne({ hashedKey, active: true });

  if (!keyRecord) {
    return res.status(401).json({ status: 'error', message: 'Invalid API key' });
  }

  // Track usage
  await db.apiKeys.updateOne({ _id: keyRecord._id }, {
    $inc: { requestCount: 1 },
    $set: { lastUsed: new Date() },
  });

  req.apiClient = keyRecord;
  next();
}
\`\`\`

---

## 9. Versioning

### URL Path Versioning (Most Common)

The version is part of the address, so it is visible in every log line, bookmark and \`curl\` command, and each version can be routed to separate code (or a separate service) with a plain path rule. Caches also treat \`/v1/users\` and \`/v2/users\` as different resources automatically. The downside is that the version is baked into every URL a client has stored, so moving to v2 means changing all of them, and a team that bumps versions freely ends up running several at once.

\`\`\`
GET /api/v1/users
GET /api/v2/users

Pros: Clear, easy to route, cacheable
Cons: URL changes, version proliferation
\`\`\`

### Header Versioning

The URL stays the same and the client asks for a version in the \`Accept\` header, using a custom media type (a content-type name such as \`application/vnd.myapi.v2+json\`). This is the most "pure" REST choice, because the URL names the resource and the header names the representation. In practice it is harder to work with: you cannot try a version by pasting a URL into a browser, and any cache in the path must be told to vary on that header (\`Vary: Accept\`) or it may serve a v1 response to a v2 client.

\`\`\`
GET /api/users
Accept: application/vnd.myapi.v2+json

Pros: Clean URLs, content negotiation
Cons: Less visible, harder to test in browser
\`\`\`

### Query Parameter Versioning

The version rides along as \`?version=2\`. It is the easiest to add to an existing API, but it is also the easiest to leave off: a client that forgets it silently gets whatever default the server picks, which may change under them.

\`\`\`
GET /api/users?version=2

Pros: Easy to implement
Cons: Can be missed, less RESTful
\`\`\`

### Versioning Strategy in Express

\`\`\`javascript
// URL path versioning (recommended)
import v1Router from './routes/v1';
import v2Router from './routes/v2';

// Version sunset middleware. It must be registered BEFORE the v1 router:
// once a route in v1Router sends a response, later middleware never runs.
app.use('/api/v1', (req, res, next) => {
  res.set('Deprecation', '@1767225600');              // deprecated since 1 Jan 2026 (Unix seconds, RFC 9745)
  res.set('Sunset', 'Mon, 01 Jun 2026 00:00:00 GMT'); // switched off after this date (RFC 8594)
  res.set('Link', '</api/v2>; rel="successor-version"');
  next();
});

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);
\`\`\`

### Breaking vs Non-Breaking Changes

\`\`\`
Non-Breaking (safe, no version bump):
- Adding new optional fields to response
- Adding new optional query parameters
- Adding new endpoints
- Adding new HTTP methods to existing endpoint
- Relaxing validation (making required field optional)

Breaking (requires new version):
- Removing or renaming fields
- Changing field types
- Changing URL structure
- Adding required fields to request
- Changing error response format
- Changing authentication mechanism
\`\`\`

---

## 10. Error Handling

### Error Response Format

\`\`\`json
// Standard error envelope
{
  "status": "error",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address",
      "code": "INVALID_FORMAT"
    },
    {
      "field": "password",
      "message": "Must be at least 8 characters",
      "code": "TOO_SHORT",
      "params": { "min": 8 }
    }
  ],
  "requestId": "req-abc-123",
  "timestamp": "2026-03-06T10:30:00.000Z"
}
\`\`\`

### Custom Error Classes

The \`isOperational\` flag separates two kinds of error. **Operational** errors are expected situations — not found, validation failed, duplicate email — and the client should see the real message. **Programmer** errors are bugs — a null dereference, a typo in a query — and the client should see only a generic 500 while the details go to your logs. The global handler below uses the flag to decide which is which.

\`\`\`javascript
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(\`\${resource} not found\`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(errors) {
    super('Validation failed', 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}
\`\`\`

### Global Error Handler

\`\`\`javascript
function errorHandler(err, req, res, next) {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.id,
  });

  // Operational errors (expected)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.code,
      ...(err.errors && { errors: err.errors }),
      requestId: req.id,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      status: 'error',
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      status: 'error',
      message: \`Duplicate value for \${field}\`,
      code: 'DUPLICATE_KEY',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }

  // Unknown errors (programming bugs)
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    requestId: req.id,
  });
}

app.use(errorHandler);
\`\`\`

---

## 11. Rate Limiting

### Implementation with Express

The Redis store is what makes this work on more than one server. Without it, each server process keeps its own counter, so behind a load balancer with four instances a client effectively gets four times the limit. A shared store gives every instance the same count.

\`\`\`javascript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  message: {
    status: 'error',
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 'error',
    message: 'Too many login attempts',
    code: 'AUTH_RATE_LIMIT',
  },
});

app.use('/api', globalLimiter);
app.use('/api/v1/auth/login', authLimiter);
\`\`\`

### Rate Limit Headers

\`\`\`
HTTP/1.1 200 OK
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1709722800

HTTP/1.1 429 Too Many Requests
Retry-After: 900
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1709722800
\`\`\`

---

## 12. HATEOAS & Hypermedia

### Concept

HATEOAS (Hypermedia as the Engine of Application State) means API responses include links to related actions and resources. The point is that the server, not the client, decides which actions are available right now: a pending order includes a \`cancel\` link and a shipped one does not, so the client does not hard-code the rule "you can only cancel before shipping". In practice few public APIs go this far, because clients are usually written against documentation anyway.

\`\`\`json
// GET /api/v1/orders/123
{
  "status": "success",
  "results": {
    "id": "order-123",
    "status": "pending",
    "total": 59.99,
    "items": [
      { "product": "Widget", "qty": 2, "price": 29.99 }
    ],
    "_links": {
      "self": { "href": "/api/v1/orders/123", "method": "GET" },
      "cancel": { "href": "/api/v1/orders/123/cancel", "method": "POST" },
      "payment": { "href": "/api/v1/orders/123/pay", "method": "POST" },
      "items": { "href": "/api/v1/orders/123/items", "method": "GET" },
      "customer": { "href": "/api/v1/users/456", "method": "GET" }
    }
  }
}

// After order is shipped, links change:
{
  "status": "shipped",
  "_links": {
    "self": { "href": "/api/v1/orders/123" },
    "track": { "href": "/api/v1/orders/123/tracking" },
    // "cancel" link is gone — can't cancel shipped orders
  }
}
\`\`\`

---

## 13. File Upload & Download

### Multipart Upload

\`multipart/form-data\` is the encoding browsers use for file uploads: the body is split into parts, each with its own headers, so binary files and text fields travel in one request. \`memoryStorage\` holds each file in RAM, which is fine with a 10 MB limit; for large files, stream to disk or object storage instead.

\`\`\`javascript
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('File type not allowed', 415, 'INVALID_FILE_TYPE'));
    }
  },
});

// Single file upload
router.post('/profile-image', authenticate, upload.single('image'), async (req, res) => {
  const url = await storageService.upload(req.file.buffer, {
    contentType: req.file.mimetype,
    fileName: \`profiles/\${req.user.id}/\${req.file.originalname}\`,
  });

  res.json({ status: 'success', results: { imageUrl: url } });
});

// Multiple file upload
router.post('/resumes', authenticate, upload.array('files', 50), async (req, res) => {
  const urls = await Promise.all(
    req.files.map((file) =>
      storageService.upload(file.buffer, {
        contentType: file.mimetype,
        fileName: \`resumes/\${Date.now()}-\${file.originalname}\`,
      })
    )
  );

  res.status(201).json({ status: 'success', results: { urls } });
});
\`\`\`

### Mixed Payload (Files + JSON)

Multipart fields are plain strings, so nested JSON cannot be sent as structured fields. The common workaround, shown here, is to put the whole JSON object in one text field and parse it on the server — then validate it like any other request body.

\`\`\`javascript
// POST /api/v2/roles
// Content-Type: multipart/form-data

router.post('/roles', authenticate, upload.array('poolFiles', 50), async (req, res) => {
  // JSON data comes as a string field in multipart
  const payload = JSON.parse(req.body.data);
  const files = req.files;

  const role = await roleService.create({
    ...payload,
    files: files.map((f) => ({
      buffer: f.buffer,
      originalName: f.originalname,
      mimeType: f.mimetype,
    })),
  });

  res.status(201).json({ status: 'success', results: role });
});
\`\`\`

---

## 14. Real-Time APIs

Three ways to push updates, in order of complexity. **Long polling**: the client asks, and the server holds the request open until there is news or a timeout. **SSE** (Server-Sent Events): one long-lived HTTP response the server keeps writing events into; one-way, server to client, with automatic reconnection built into the browser. **WebSocket**: a persistent two-way connection, needed when the client also sends a stream of messages (chat, collaborative editing). Pick the simplest one that covers the direction of traffic you have.

### WebSocket API

\`\`\`javascript
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (ws, req) => {
  // Authenticate WebSocket connection
  const token = new URL(req.url, 'http://localhost').searchParams.get('token');
  const user = verifyToken(token);
  if (!user) return ws.close(4001, 'Unauthorized');

  ws.userId = user.id;

  ws.on('message', (raw) => {
    const message = JSON.parse(raw);

    switch (message.type) {
      case 'subscribe':
        subscribeToChannel(ws, message.channel);
        break;
      case 'unsubscribe':
        unsubscribeFromChannel(ws, message.channel);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
    }
  });

  ws.on('close', () => {
    cleanupSubscriptions(ws);
  });
});

// Broadcast to channel
function broadcastToChannel(channel, data) {
  for (const client of wss.clients) {
    if (client.channels?.has(channel) && client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  }
}
\`\`\`

### Server-Sent Events (SSE)

\`\`\`javascript
router.get('/events/jobs/:jobId', authenticate, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const jobId = req.params.jobId;

  // Send initial data
  res.write(\`event: connected\\ndata: \${JSON.stringify({ jobId })}\\n\\n\`);

  // Subscribe to updates
  const handler = (data) => {
    res.write(\`event: \${data.type}\\ndata: \${JSON.stringify(data)}\\n\\n\`);
  };

  eventEmitter.on(\`job:\${jobId}\`, handler);

  // Heartbeat
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\\n\\n');
  }, 30000);

  req.on('close', () => {
    eventEmitter.off(\`job:\${jobId}\`, handler);
    clearInterval(heartbeat);
  });
});
\`\`\`

### Polling Endpoints

\`\`\`javascript
// Long polling for async operations
router.get('/processing/:jobId/status', authenticate, async (req, res) => {
  const timeout = 30000; // 30s long poll timeout
  const pollInterval = 1000;
  const startTime = Date.now();

  const checkStatus = async () => {
    const status = await processingService.getStatus(req.params.jobId);

    // If terminal state or timeout, respond immediately
    if (status.state === 'completed' || status.state === 'failed') {
      return res.json({ status: 'success', results: status });
    }

    if (Date.now() - startTime >= timeout) {
      return res.json({ status: 'success', results: status });
    }

    // Otherwise, check again after interval
    setTimeout(checkStatus, pollInterval);
  };

  checkStatus();
});
\`\`\`

---

## 15. GraphQL

### Schema Definition

\`\`\`graphql
type Query {
  user(id: ID!): User
  users(page: Int, limit: Int, role: Role): UserConnection!
  job(id: ID!): Job
  jobs(filter: JobFilter, sort: JobSort): JobConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  createJob(input: CreateJobInput!): Job!
}

type Subscription {
  jobStatusChanged(jobId: ID!): Job!
  newCandidate(jobId: ID!): Candidate!
}

type User {
  id: ID!
  name: String!
  email: String!
  role: Role!
  department: Department
  createdAt: DateTime!
}

type Job {
  id: ID!
  title: String!
  description: String!
  status: JobStatus!
  department: Department!
  candidates(limit: Int): [Candidate!]!
  candidateCount: Int!
}

input JobFilter {
  status: [JobStatus!]
  departmentId: ID
  createdAfter: DateTime
  search: String
}

enum JobStatus {
  OPEN
  UNDER_ASSESSMENT
  CLOSED
  ON_HOLD
  EXPIRED
}

type JobConnection {
  edges: [JobEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}
\`\`\`

### REST vs GraphQL

\`\`\`
REST:
- Multiple endpoints per resource
- Server defines response shape
- Over-fetching (get all fields)
- Under-fetching (need multiple calls)
- Caching is straightforward (HTTP caching)
- Simpler to implement

GraphQL:
- Single endpoint (/graphql)
- Client defines response shape
- No over/under-fetching
- Complex queries in one request
- Caching is harder (POST requests)
- Type system built-in
- Introspection/self-documenting

When to use GraphQL:
- Multiple clients with different data needs (mobile vs web)
- Deeply nested relational data
- Rapid frontend iteration
- Real-time subscriptions needed

When to use REST:
- Simple CRUD operations
- File upload/download
- Caching is critical
- Simpler backend requirements
- Public APIs (more universal)
\`\`\`

---

## 16. API Documentation

### OpenAPI (Swagger) Specification

\`\`\`yaml
openapi: 3.0.3
info:
  title: Job Management API
  version: 1.0.0
  description: API for managing job descriptions and candidates

servers:
  - url: http://localhost:4000/api/v1
    description: Development
  - url: https://api.example.com/v1
    description: Production

paths:
  /jobs:
    get:
      summary: List all jobs
      tags: [Jobs]
      security:
        - cookieAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
        - name: status
          in: query
          schema:
            type: string
            enum: [open, under_assessment, closed, on_hold, expired]
      responses:
        '200':
          description: List of jobs
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: success
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/Job'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '401':
          $ref: '#/components/responses/Unauthorized'

    post:
      summary: Create a new job
      tags: [Jobs]
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateJobInput'
      responses:
        '201':
          description: Job created
        '422':
          $ref: '#/components/responses/ValidationError'

components:
  schemas:
    Job:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        status:
          type: string
          enum: [open, under_assessment, closed, on_hold, expired]
        createdAt:
          type: string
          format: date-time

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer

  securitySchemes:
    cookieAuth:
      type: apiKey
      in: cookie
      name: session

  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            type: object
            properties:
              status:
                type: string
                example: error
              message:
                type: string
                example: Authentication required
\`\`\`

### Auto-Generated Documentation with Express

\`\`\`javascript
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: { title: 'API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.js'], // Files with JSDoc annotations
};

const spec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

// JSDoc annotations in route files
/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     summary: List users
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', getUsers);
\`\`\`

---

## 17. API Security Best Practices

### Input Validation

\`\`\`javascript
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
  role: z.enum(['admin', 'manager', 'recruiter']).optional().default('recruiter'),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({
        status: 'error',
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    req.body = result.data; // Use parsed & sanitized data
    next();
  };
}
\`\`\`

### Security Checklist

Use this as a review list before an API goes public. Each line closes a different, common hole, so no single item is enough on its own; the groups follow the path a request takes, from how the caller is identified, through what they send, to how the response travels back and the infrastructure around it.

\`\`\`
Authentication & Authorization:
□ Use HTTPS everywhere
□ Implement proper token expiry
□ Hash passwords with bcrypt (cost factor 12+)
□ Rate limit auth endpoints
□ Validate JWT signature and claims

Input & Output:
□ Validate all input (Zod, Joi, etc.)
□ Sanitize HTML input (DOMPurify)
□ Parameterize database queries (no string concatenation)
□ Don't expose internal errors to clients
□ Remove sensitive fields from responses (password, tokens)

Headers & Transport:
□ Set security headers (Helmet)
□ Configure CORS properly (specific origins, not *)
□ Use httpOnly, Secure, SameSite cookies
□ Implement Content-Security-Policy

Infrastructure:
□ Rate limiting at API gateway level
□ Request size limits
□ Timeout configurations
□ Audit logging for sensitive operations
□ Regular dependency updates
\`\`\`

### Request Sanitization Middleware

This blocks NoSQL injection: a client sending an object where you expected a string. MongoDB treats keys that start with \`$\` as operators, so a login body of \`{ "email": "a@b.com", "password": { "$ne": null } }\` turns "password equals this value" into "password is not null" — true for every user. The middleware strips every \`$\`-prefixed key before any query sees the input. Validating input against a schema (Zod, Joi) is the stronger fix, because a schema that says \`password\` is a string rejects the object outright; this middleware is a safety net for routes that skip validation.

\`\`\`javascript
// Prevent NoSQL injection in MongoDB
function sanitizeInput(req, res, next) {
  const sanitize = (value) => {
    if (Array.isArray(value)) return value.map(sanitize);   // keep arrays as arrays
    if (typeof value !== 'object' || value === null) return value;
    const clean = {};
    for (const [key, v] of Object.entries(value)) {
      // Block MongoDB operators in user input
      if (key.startsWith('$')) continue;
      clean[key] = sanitize(v);
    }
    return clean;
  };

  req.body = sanitize(req.body);
  // Express 5 makes req.query a read-only getter, so it cannot be
  // reassigned; keep the cleaned copy on its own property instead.
  req.cleanQuery = sanitize(req.query);
  next();
}
\`\`\`

Two details in the code are easy to get wrong. Arrays need their own branch: \`Object.entries\` on an array returns index keys, so without it \`tags: ['a', 'b']\` would come out as the object \`{ 0: 'a', 1: 'b' }\`. And routes must read \`req.cleanQuery\`, not \`req.query\`, or the cleaning does nothing for query strings.

---

## 18. API Testing

### Unit Testing Endpoints

\`\`\`javascript
import request from 'supertest';
import app from '../app';

describe('GET /api/v1/users', () => {
  it('should return paginated users', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Cookie', [\`session=\${validSessionCookie}\`])
      .query({ page: 1, limit: 10 })
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.results).toBeInstanceOf(Array);
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  it('should require authentication', async () => {
    const res = await request(app).get('/api/v1/users').expect(401);
    expect(res.body.status).toBe('error');
  });

  it('should filter by role', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Cookie', [\`session=\${validSessionCookie}\`])
      .query({ role: 'admin' })
      .expect(200);

    res.body.results.forEach((user) => {
      expect(user.role).toBe('admin');
    });
  });
});

describe('POST /api/v1/users', () => {
  it('should create a user', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Cookie', [\`session=\${adminSessionCookie}\`])
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepass123',
        role: 'recruiter',
      })
      .expect(201);

    expect(res.body.results).toHaveProperty('id');
    expect(res.body.results.name).toBe('John Doe');
  });

  it('should validate required fields', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Cookie', [\`session=\${adminSessionCookie}\`])
      .send({ name: 'John' }) // missing email, password
      .expect(422);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'password' }),
      ])
    );
  });

  it('should reject duplicate email', async () => {
    await request(app)
      .post('/api/v1/users')
      .set('Cookie', [\`session=\${adminSessionCookie}\`])
      .send({ name: 'First', email: 'same@example.com', password: 'pass12345' })
      .expect(201);

    const res = await request(app)
      .post('/api/v1/users')
      .set('Cookie', [\`session=\${adminSessionCookie}\`])
      .send({ name: 'Second', email: 'same@example.com', password: 'pass12345' })
      .expect(409);

    expect(res.body.code).toBe('DUPLICATE_KEY');
  });
});
\`\`\`

### Contract Testing

A contract test checks the *shape* of a response — which fields exist, their types, which are required — rather than specific values. It catches the change that breaks clients even though every functional test still passes, such as renaming \`name\` to \`fullName\`. \`additionalProperties: false\` also fails the test when a field is added, which forces the team to decide deliberately that the new field is safe to expose.

\`\`\`javascript
// Ensure API contract doesn't break
import Ajv from 'ajv';

const ajv = new Ajv();

const userResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', const: 'success' },
    results: {
      type: 'object',
      required: ['id', 'name', 'email', 'role', 'createdAt'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        role: { type: 'string', enum: ['admin', 'manager', 'recruiter'] },
        createdAt: { type: 'string', format: 'date-time' },
      },
      additionalProperties: false,
    },
  },
};

it('should match the API contract', async () => {
  const res = await request(app)
    .get('/api/v1/users/123')
    .set('Cookie', [\`session=\${validSessionCookie}\`])
    .expect(200);

  const validate = ajv.compile(userResponseSchema);
  const valid = validate(res.body);
  expect(valid).toBe(true);
});
\`\`\`

---

## 19. API Design Patterns

### Bulk Operations

The status code here is **207 Multi-Status**: the request as a whole was processed, but items inside it succeeded or failed individually. Returning a per-item result with its index lets the client retry just the failures, instead of guessing which rows went in.

\`\`\`javascript
// Batch create
// POST /api/v1/users/bulk
router.post('/bulk', authenticate, authorize('admin'), async (req, res) => {
  const { users } = req.body; // Array of user objects
  const results = await userService.bulkCreate(users);

  res.status(207).json({
    status: 'success',
    results: results.map((r, i) => ({
      index: i,
      status: r.success ? 'created' : 'failed',
      data: r.success ? r.data : undefined,
      error: r.success ? undefined : r.error,
    })),
  });
});

// Batch delete
// DELETE /api/v1/users/bulk
router.delete('/bulk', authenticate, authorize('admin'), async (req, res) => {
  const { ids } = req.body;
  const deleted = await userService.bulkDelete(ids);
  res.json({ status: 'success', results: { deletedCount: deleted } });
});
\`\`\`

### Soft Delete

Soft delete marks a row as deleted instead of removing it, so you can undo mistakes, keep audit history, and avoid breaking records that reference it. The cost is that every query must now filter out deleted rows, and forgetting that filter once shows "deleted" data to users — which is why the filter belongs in shared middleware or a data-access layer, not in each handler.

\`\`\`javascript
// Mark as deleted but keep in database
router.delete('/:id', authenticate, async (req, res) => {
  await db.users.updateOne(
    { _id: req.params.id },
    { $set: { deletedAt: new Date(), deletedBy: req.user.id } }
  );
  res.status(204).send();
});

// Filter out deleted records by default
function excludeDeleted(req, res, next) {
  req.baseFilter = { deletedAt: null };
  next();
}
\`\`\`

### Async Operations

\`\`\`javascript
// For long-running operations
// POST /api/v1/reports/generate
router.post('/generate', authenticate, async (req, res) => {
  const taskId = await reportService.queueGeneration(req.body);

  res.status(202).json({
    status: 'accepted',
    message: 'Report generation started',
    results: {
      taskId,
      statusUrl: \`/api/v1/reports/status/\${taskId}\`,
    },
  });
});

// GET /api/v1/reports/status/:taskId
router.get('/status/:taskId', authenticate, async (req, res) => {
  const status = await reportService.getStatus(req.params.taskId);

  res.json({
    status: 'success',
    results: {
      taskId: req.params.taskId,
      state: status.state, // pending, processing, completed, failed
      progress: status.progress, // 0-100
      ...(status.state === 'completed' && {
        downloadUrl: status.downloadUrl,
      }),
      ...(status.state === 'failed' && {
        error: status.error,
      }),
    },
  });
});
\`\`\`

### Webhook Pattern

A webhook is your API calling the customer's server when something happens, instead of making them poll. Because anyone can POST to their URL, each delivery is signed: you compute an HMAC (a hash keyed with a secret only you and the subscriber know) over the body, and the subscriber recomputes it to confirm the request came from you and was not altered.

\`\`\`javascript
// Register webhook
// POST /api/v1/webhooks
router.post('/', authenticate, async (req, res) => {
  const webhook = await db.webhooks.create({
    url: req.body.url,
    events: req.body.events, // ['job.created', 'candidate.applied']
    secret: crypto.randomBytes(32).toString('hex'),
    userId: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    results: {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret, // Show once for HMAC verification
    },
  });
});

// Deliver webhook
async function deliverWebhook(event, payload) {
  const webhooks = await db.webhooks.find({ events: event, active: true });

  for (const webhook of webhooks) {
    const body = JSON.stringify({
      event,
      data: payload,
      timestamp: new Date().toISOString(),
    });

    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(body)
      .digest('hex');

    await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
      },
      body,
    });
  }
}
\`\`\`

### Multi-Tenant APIs

In a shared database, one missing \`tenantId\` in one query shows one customer's data to another. The defence is to make scoping automatic — a wrapper every query goes through — rather than relying on each developer to remember the filter.

\`\`\`javascript
// Tenant identification middleware
function tenantMiddleware(req, res, next) {
  const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({
      status: 'error',
      message: 'Tenant ID required',
    });
  }

  req.tenantId = tenantId;
  next();
}

// Ensure queries are scoped to tenant.
// Usage in a route: const jobs = scopeToTenant(db.jobs, req.tenantId);
function scopeToTenant(collection, tenantId) {
  // Drop any tenantId the caller passed, so data cannot move a record
  // to another tenant or claim to belong to one.
  const withoutTenant = ({ tenantId: _ignored, ...rest }) => rest;

  return {
    find: (filter = {}) => collection.find({ ...filter, tenantId }),
    create: (data) => collection.insertOne({ ...withoutTenant(data), tenantId }),
    update: (id, data) =>
      collection.updateOne({ _id: id, tenantId }, { $set: withoutTenant(data) }),
    delete: (id) => collection.deleteOne({ _id: id, tenantId }),
  };
}
\`\`\`

The tenant id is passed in per request, because the wrapper is created inside a route handler where \`req\` exists. Note the order in \`find\`: \`tenantId\` is spread *after* the caller's filter, so a filter that contains its own \`tenantId\` is overwritten rather than obeyed. \`update\` needs the same protection on the other side — without \`withoutTenant\`, a request body containing \`tenantId\` would be \`$set\` onto the record and move it into another customer's account.

---

## 20. Interview Questions

### Beginner (1-3 years)

**Q1: What is REST and what are its key constraints?**

Short answer: REST (Representational State Transfer) is an architectural style — a set of constraints, not a protocol or a library — where you model your API as resources identified by URLs and act on them with standard HTTP methods. There are six constraints:

1. **Client-Server**: Separate UI from data storage concerns
2. **Stateless**: Each request contains all information needed; server stores no session state
3. **Cacheable**: Responses must indicate if they can be cached
4. **Uniform Interface**: Standardized way to interact using resources, HTTP methods, and representations
5. **Layered System**: Client doesn't know if it's talking to the end server or an intermediary
6. **Code on Demand** (optional): Server can send executable code to the client

The one to explain if asked "why does it matter": **statelessness**. Because the server keeps no session memory between requests, any server can handle any request, so you scale by adding servers behind a load balancer. The price is that every request must carry its own authentication and context. **Cacheable** is the other one with a direct payoff: a response marked cacheable can be served by a browser or CDN without reaching your server at all.

---

**Q2: When should you use PUT vs PATCH?**

**PUT** replaces the entire resource. You send the complete object. If you omit a field, it gets set to null/default. It's idempotent — calling it multiple times produces the same result.

**PATCH** partially updates a resource. You only send the fields you want to change. Other fields remain untouched. Use PATCH for single-field updates (like changing status) and PUT when you're replacing the whole entity (like editing a form with all fields).

The trap with PUT: a client that sends only the fields it knows about wipes the rest. If a newer client added a \`timezone\` field and an older client PUTs the user without it, the timezone is gone. PATCH avoids that, which is why most APIs use it for edits. PATCH is not guaranteed idempotent — \`{ "age": 30 }\` is, but an operation like "add 1 to age" is not — so retries need more care.

---

**Q3: What are the most common HTTP status codes and when do you use them?**

Short answer: the first digit tells the client who has to act. 2xx means it worked, 4xx means the client sent something wrong and retrying the same request will not help, and 5xx means the server failed and a retry later might succeed. The pair interviewers probe is 401 vs 403: 401 means "we do not know who you are", 403 means "we know who you are, and you may not do this".

- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST that creates a resource
- **204 No Content**: Successful DELETE (no response body)
- **400 Bad Request**: Malformed request (invalid JSON, wrong types)
- **401 Unauthorized**: Not authenticated (missing or invalid credentials)
- **403 Forbidden**: Authenticated but not authorized (wrong role/permissions)
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate entry or state conflict
- **422 Unprocessable Entity**: Valid syntax but fails business validation
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Unhandled server error

---

**Q4: How do you handle pagination in REST APIs?**

Short answer: use offset pagination (\`?page=2\`) when users need numbered pages over a small, slow-changing dataset, and cursor pagination when the data is large or changes while people page through it (feeds, logs, infinite scroll).

**Offset-based**: \`GET /users?page=2&limit=20\` — uses skip/offset to jump to a page. Simple and supports jumping to any page, but slow for large offsets (the database still reads every skipped row) and inconsistent if data changes between requests (an insert shifts every later row, so the user sees an item twice or misses one).

**Cursor-based**: \`GET /users?cursor=abc123&limit=20\` — uses an opaque token pointing to the last item. More performant for large datasets (uses indexed column, not skip) and gives consistent results, but can't jump to arbitrary pages.

Return pagination metadata in the response: \`total\`, \`totalPages\`, \`hasNext\`, \`hasPrev\` (offset) or \`nextCursor\`, \`hasNext\` (cursor).

---

**Q5: What's the difference between authentication and authorization?**

Short answer: authentication proves who you are; authorization decides what you are allowed to do. Authentication always comes first, because you cannot check a user's permissions until you know which user it is. In HTTP terms, a failed authentication is a \`401\` and a failed authorization is a \`403\`.

**Authentication** verifies *who* you are. It answers "Are you a valid user?" Methods: username/password, JWT, OAuth, API keys, cookies.

**Authorization** verifies *what you can do*. It answers "Do you have permission for this action?" Methods: Role-based (RBAC — admin, manager, recruiter), attribute-based (ABAC — based on user attributes, resource attributes, and environment), or policy-based.

In a typical flow: the auth middleware authenticates the user (validates JWT/cookie), then an authorization middleware checks if that user's role has permission for the requested resource/action.

---

**Q6: How should you structure error responses in an API?**

Short answer: the same shape for every error, with a stable machine-readable code for programs and a message for humans.

Use a consistent error envelope with: \`status\` ("error"), \`message\` (human-readable), \`code\` (machine-readable error code like "VALIDATION_ERROR"), and \`errors\` array (for field-level validation errors). Include a \`requestId\` for debugging. The separate \`code\` matters because clients branch on it — "if \`EMAIL_TAKEN\`, highlight the email field" — and you will want to reword or translate \`message\` without breaking them. The \`requestId\` lets a user's bug report be matched to one line in your logs.

Always use appropriate HTTP status codes. Never return 200 with an error body. Don't expose internal implementation details (stack traces, database errors) in production — log them server-side and return a generic message to the client.

---

### Intermediate (3-5 years)

**Q7: How do you version an API? What are the trade-offs?**

Short answer: put the major version in the URL path (\`/v1/\`) for most APIs, and work hard to need a new version rarely, by making changes additive.

1. **URL path**: \`/api/v1/users\` vs \`/api/v2/users\` — most common, easy to route and cache, but URLs change
2. **Header**: \`Accept: application/vnd.api.v2+json\` — clean URLs, supports content negotiation, but less visible
3. **Query parameter**: \`/api/users?version=2\` — easy to implement but can be missed

Key principles: avoid breaking changes when possible (additive-only), deprecate old versions with \`Deprecation\` headers and sunset dates, maintain at most 2-3 active versions, document migration guides, and use non-breaking changes (new optional fields, new endpoints) as long as possible before bumping versions.

---

**Q8: Explain rate limiting. Why is it important and how would you implement it?**

Short answer: rate limiting caps how many requests one client can make in a time window, so one misbehaving script or one heavy customer cannot use up capacity everyone else needs. It also makes brute-force attacks on login and scraping slow enough to be impractical.

**Algorithms** — the choice is about how bursts are treated:
- **Fixed window**: count requests per clock window (say, per minute) and reset at the boundary. Simplest, but a client can send a full quota at 0:59 and another at 1:00, doubling the rate for a moment.
- **Sliding window**: count requests in the last 60 seconds from *now*, which removes the boundary burst at the cost of storing more data (timestamps, or counts for two windows).
- **Token bucket**: each client has a bucket that refills at a steady rate; each request spends a token. It allows short bursts up to the bucket size while holding the long-run average — usually what you want for real clients.

**Implementation**: Use Redis for distributed rate limiting across multiple servers. Track request count per client (by IP, API key, or user ID) with TTL-based expiry. Return standard headers: \`RateLimit-Limit\`, \`RateLimit-Remaining\`, \`RateLimit-Reset\`. Return \`429 Too Many Requests\` with \`Retry-After\` header when exceeded.

Apply different limits for different endpoints: stricter for auth (5/15min), moderate for writes (100/15min), lenient for reads (1000/15min).

---

**Q9: How do you handle long-running operations in a REST API?**

Short answer: don't hold the HTTP request open while the work runs. Accept the job, return immediately with somewhere to check on it, and let the client come back. Use the **async request pattern**:

1. Client sends \`POST /api/v1/reports/generate\`
2. Server queues the job and immediately returns \`202 Accepted\` ("I have taken this, but it is not done") with a \`taskId\` and status URL
3. Client polls \`GET /api/v1/reports/status/:taskId\` for progress
4. When complete, the status response includes the result or download URL

Alternatives to polling: WebSockets for real-time updates, SSE for server push, or webhooks to call back the client when done. The polling approach is simplest and works with any client.

---

**Q10: What is CORS and how does it work?**

CORS (Cross-Origin Resource Sharing) is the mechanism by which a server tells the browser which other origins (scheme + host + port) may read its responses. By default the browser's same-origin policy stops JavaScript on one origin from reading responses from another; CORS headers are the server's way of relaxing that for chosen origins. When a frontend at \`https://app.example.com\` calls an API at \`https://api.example.com\`, those are different origins, so the browser enforces it.

Note what CORS is *not*: it does not protect your API from other servers, curl or scripts — only browsers enforce it. It protects users, by stopping a malicious site from using the user's logged-in browser to read your API's responses.

**Simple requests** (GET, POST with standard content types) include an \`Origin\` header. The server responds with \`Access-Control-Allow-Origin\`.

**Preflight requests** (PUT, DELETE, custom headers) trigger an \`OPTIONS\` request first. The browser checks the response headers (\`Access-Control-Allow-Methods\`, \`Access-Control-Allow-Headers\`) before sending the actual request.

Configure CORS with specific origins (not \`*\`), allowed methods, and \`credentials: true\` for cookie-based auth. Set \`Access-Control-Max-Age\` to cache preflight results.

---

**Q11: How would you design an API for a multi-tenant SaaS application?**

Short answer: decide where the tenant id comes from, decide how strongly tenants' data is separated, and then make tenant scoping automatic so no single query can forget it — a cross-tenant leak is the failure that ends a B2B business's trust.

Identify tenants via: subdomain (\`tenant1.api.example.com\`), header (\`X-Tenant-ID\`), or JWT claim. Prefer the claim inside the verified token: a header or subdomain is only a hint, and must be checked against the tenants the authenticated user actually belongs to.

**Data isolation strategies**:
- **Database per tenant**: Strongest isolation, hardest to manage
- **Schema per tenant**: Good isolation, moderate complexity
- **Shared database with tenant column**: Easiest and cheapest, and what most SaaS products start with — but every query must be scoped, because one forgotten \`WHERE tenantId = ?\` is a data leak

Key concerns: ensure all queries are scoped to the tenant (middleware that adds \`tenantId\` to every query), prevent cross-tenant data leaks, per-tenant rate limiting and quotas, tenant-aware caching (namespace cache keys with tenant ID).

---

**Q12: Compare REST and GraphQL. When would you choose each?**

**REST**: Multiple endpoints, server-defined response shapes, HTTP caching built-in, simpler to implement, better for public APIs. Best when: resources map cleanly to endpoints, caching is important, operations are straightforward CRUD.

**GraphQL**: Single endpoint, client-defined response shapes, no over/under-fetching, built-in type system, introspection (clients can query the schema itself, which powers autocomplete and generated docs). Over-fetching is getting fields you don't need (a mobile list screen receiving full user profiles); under-fetching is needing several round trips to assemble one screen (user, then their orders, then each order's items). In GraphQL the client names the fields it wants, nested, in one request. Best when: multiple clients need different data shapes, deeply nested relational data, need to reduce API calls.

Downsides of GraphQL: complex caching (all POST requests), potential for expensive nested queries (need depth limiting), steeper learning curve, harder to implement rate limiting.

Many teams use both: REST for simple CRUD and file operations, GraphQL for complex data-fetching scenarios.

---

### Advanced (5+ years)

**Q13: How would you design an API gateway for a microservices architecture?**

Short answer: an API gateway is a single front door in front of all your services. It exists so that concerns every request shares — checking who the caller is, rate limiting, routing to the right service — are done once, in one place, instead of being reimplemented (slightly differently) in every microservice. Key responsibilities:

1. **Routing**: Map external URLs to internal service endpoints
2. **Authentication**: Verify tokens/sessions, pass user context to services
3. **Rate limiting**: Per-client and per-endpoint limits
4. **Request aggregation**: Combine multiple service calls into one response (BFF pattern)
5. **Circuit breaking**: Fail fast when downstream services are unhealthy — after repeated failures, stop sending requests to that service for a while and return an error immediately, so callers don't pile up waiting on timeouts and the struggling service gets room to recover
6. **Transformation**: Convert between external API format and internal protocols
7. **Caching**: Cache responses for read-heavy endpoints
8. **Monitoring**: Centralized logging, metrics, distributed tracing

Technologies: Kong, AWS API Gateway, Nginx, or custom (Express + http-proxy-middleware). Use the BFF (Backend for Frontend: a separate small gateway per client type, owned by that client's team) pattern when mobile and web need different response shapes.

The design risk to volunteer: the gateway is on every request, so it must stay thin. Once business logic creeps in, every team has to change and redeploy the gateway to ship features, and it becomes the bottleneck the microservices were meant to remove.

---

**Q14: How do you ensure backward compatibility when evolving an API?**

Short answer: existing clients must keep working without changing a line, so within a version you only ever *add* — never remove, rename or tighten. Anything else goes in a new version with a deprecation period.

**Additive changes only** in existing versions: new optional fields, new endpoints, new enum values (if clients handle unknown values). Never remove or rename fields, change types, or add required fields.

**Strategies**:
- Default values for new fields so old clients aren't affected
- Support both old and new field names during migration period
- Use API versioning for breaking changes
- Feature flags to gradually roll out changes
- Consumer-driven contract testing (Pact) to detect breaking changes early
- Deprecation timeline: announce → sunset header → warning period → removal

For database migrations that affect the API: deploy code that handles both schemas, migrate data, then remove old schema handling.

---

**Q15: How would you design a webhook system that guarantees delivery?**

Short answer: you cannot guarantee the receiver is up, so you guarantee you will *keep trying*: store every event durably, retry with backoff until the receiver acknowledges it, and give each event an id so the receiver can ignore duplicates. That is at-least-once delivery.

**Delivery guarantees**:
1. Persist webhook events to a durable queue before attempting delivery
2. Exponential backoff retry: 1min → 5min → 30min → 2h → 24h
3. Dead letter queue after max retries (notify admin)
4. Idempotency key per event so receivers can deduplicate

**Security**: HMAC signature (SHA-256) with a per-subscriber secret. Include timestamp in signature to prevent replay attacks. Receivers verify the signature before processing.

**Reliability**: Separate delivery workers from the main application. Track delivery status per subscriber per event. Provide a UI/API for subscribers to see delivery logs and replay failed events. Include a "test" endpoint to verify the subscriber's URL is reachable.

**At-least-once semantics**: Mark an event delivered only when the receiver returns a 2xx; treat timeouts and non-2xx responses as failures and retry. This means a receiver can get the same event twice (it processed it, but its response was lost), which is exactly why the per-event idempotency key above is required, not optional.

---

**Q16: How do you handle API security for a public-facing API at scale?**

Short answer: assume any single control will fail, so put independent checks at every layer a request passes through — "defense in depth". Each layer stops a different kind of attack, and a request has to beat all of them.

**Defense in depth**:
1. **Edge**: CDN/WAF (web application firewall — CloudFlare, AWS WAF) blocks floods and known attack patterns before they reach your servers
2. **Gateway**: Authentication, rate limiting, request validation, IP allowlisting for partners
3. **Application**: Input sanitization, parameterized queries, authorization checks, business rule validation
4. **Data**: Field-level encryption, audit logging, PII masking in logs

**API key management**: Hash keys in storage (never store plaintext), scope keys to specific endpoints/actions, support key rotation without downtime, track usage per key.

**OAuth 2.0 for third-party access**: Authorization code flow for web apps, PKCE for SPAs/mobile, client credentials for service-to-service. Scope tokens to minimum necessary permissions.

**Monitoring**: Anomaly detection on request patterns, alert on auth failure spikes, log all admin actions, implement request signing for sensitive operations.

---

## References

- [OpenAPI Specification](https://swagger.io/specification) — Industry standard for REST API definitions
- [REST API Tutorial](https://restfulapi.net) — Comprehensive REST design guide
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — MDN reference for all status codes
`;export{e as default};
