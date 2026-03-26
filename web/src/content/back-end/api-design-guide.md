# API Design Guide

A comprehensive guide to RESTful API design, best practices, patterns, and interview preparation.

---

## Table of Contents

1. [REST Fundamentals](#1-rest-fundamentals)
2. [URL & Resource Design](#2-url--resource-design)
3. [HTTP Methods](#3-http-methods)
4. [Request & Response Design](#4-request--response-design)
5. [Status Codes](#5-status-codes)
6. [Pagination](#6-pagination)
7. [Filtering, Sorting & Searching](#7-filtering-sorting--searching)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Versioning](#9-versioning)
10. [Error Handling](#10-error-handling)
11. [Rate Limiting](#11-rate-limiting)
12. [HATEOAS & Hypermedia](#12-hateoas--hypermedia)
13. [File Upload & Download](#13-file-upload--download)
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

```
1. Client-Server:       Separation of concerns
2. Stateless:           Each request contains all info needed
3. Cacheable:           Responses must define cacheability
4. Uniform Interface:   Standardized way to interact
5. Layered System:      Client can't tell if connected to end server
6. Code on Demand:      (Optional) Server can send executable code
```

### Richardson Maturity Model

```
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
```

---

## 2. URL & Resource Design

### Resource Naming Conventions

```
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
```

### Resource Hierarchy

```
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
```

### Action Endpoints (When REST Doesn't Fit)

```
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
```

---

## 3. HTTP Methods

### Method Semantics

```
GET     - Read a resource (idempotent, safe, cacheable)
POST    - Create a new resource (not idempotent)
PUT     - Replace an entire resource (idempotent)
PATCH   - Partially update a resource (not necessarily idempotent)
DELETE  - Remove a resource (idempotent)
OPTIONS - Describe available methods (CORS preflight)
HEAD    - Same as GET but no body (check existence, headers only)
```

### Idempotency

```
Idempotent = same request N times produces same result

GET    /users/123          → Always returns user 123 ✓
PUT    /users/123 {name}   → Always sets name to value ✓
DELETE /users/123           → Always deletes (or 404) ✓
PATCH  /users/123 {age:30} → Always sets age to 30 ✓

POST   /users {data}       → Creates new user each time ✗
PATCH  /users/123 {age:+1} → Increments each time ✗ (not idempotent)
```

### Express Implementation

```javascript
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
```

---

## 4. Request & Response Design

### Request Body Conventions

```javascript
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
```

### Response Envelope Pattern

```javascript
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
```

### Response Shaping

```javascript
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
```

### Date & Time

```
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
```

---

## 5. Status Codes

### Success Codes (2xx)

```
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
```

### Client Error Codes (4xx)

```
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
```

### Server Error Codes (5xx)

```
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
```

---

## 6. Pagination

### Offset-Based Pagination

```javascript
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
```

### Cursor-Based Pagination

```javascript
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
```

### Keyset Pagination (Best for Sorted Data)

```javascript
// GET /api/v1/jobs?after_date=2026-03-01&after_id=job-100&limit=20

router.get('/', async (req, res) => {
  const { after_date, after_id, limit = 20 } = req.query;

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
    .limit(parseInt(limit) + 1)
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
```

---

## 7. Filtering, Sorting & Searching

### Filtering

```javascript
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
```

### Sorting

```javascript
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
```

### Full-Text Search

```javascript
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
```

---

## 8. Authentication & Authorization

### Token-Based Auth (JWT)

```javascript
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
```

### Cookie-Based Auth

```javascript
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
```

### Role-Based Access Control (RBAC)

```javascript
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
```

### API Key Authentication

```javascript
// For service-to-service or public API access
function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

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
```

---

## 9. Versioning

### URL Path Versioning (Most Common)

```
GET /api/v1/users
GET /api/v2/users

Pros: Clear, easy to route, cacheable
Cons: URL changes, version proliferation
```

### Header Versioning

```
GET /api/users
Accept: application/vnd.myapi.v2+json

Pros: Clean URLs, content negotiation
Cons: Less visible, harder to test in browser
```

### Query Parameter Versioning

```
GET /api/users?version=2

Pros: Easy to implement
Cons: Can be missed, less RESTful
```

### Versioning Strategy in Express

```javascript
// URL path versioning (recommended)
import v1Router from './routes/v1';
import v2Router from './routes/v2';

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// Version sunset middleware
app.use('/api/v1', (req, res, next) => {
  res.set('Deprecation', 'true');
  res.set('Sunset', 'Sat, 01 Jun 2026 00:00:00 GMT');
  res.set('Link', '</api/v2>; rel="successor-version"');
  next();
});
```

### Breaking vs Non-Breaking Changes

```
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
```

---

## 10. Error Handling

### Error Response Format

```javascript
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
```

### Custom Error Classes

```javascript
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
    super(`${resource} not found`, 404, 'NOT_FOUND');
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
```

### Global Error Handler

```javascript
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
      message: `Duplicate value for ${field}`,
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
```

---

## 11. Rate Limiting

### Implementation with Express

```javascript
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
```

### Rate Limit Headers

```
HTTP/1.1 200 OK
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1709722800

HTTP/1.1 429 Too Many Requests
Retry-After: 900
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1709722800
```

---

## 12. HATEOAS & Hypermedia

### Concept

HATEOAS (Hypermedia as the Engine of Application State) means API responses include links to related actions and resources.

```javascript
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
```

---

## 13. File Upload & Download

### Multipart Upload

```javascript
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
    fileName: `profiles/${req.user.id}/${req.file.originalname}`,
  });

  res.json({ status: 'success', results: { imageUrl: url } });
});

// Multiple file upload
router.post('/resumes', authenticate, upload.array('files', 50), async (req, res) => {
  const urls = await Promise.all(
    req.files.map((file) =>
      storageService.upload(file.buffer, {
        contentType: file.mimetype,
        fileName: `resumes/${Date.now()}-${file.originalname}`,
      })
    )
  );

  res.status(201).json({ status: 'success', results: { urls } });
});
```

### Mixed Payload (Files + JSON)

```javascript
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
```

---

## 14. Real-Time APIs

### WebSocket API

```javascript
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
```

### Server-Sent Events (SSE)

```javascript
router.get('/events/jobs/:jobId', authenticate, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const jobId = req.params.jobId;

  // Send initial data
  res.write(`event: connected\ndata: ${JSON.stringify({ jobId })}\n\n`);

  // Subscribe to updates
  const handler = (data) => {
    res.write(`event: ${data.type}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  eventEmitter.on(`job:${jobId}`, handler);

  // Heartbeat
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    eventEmitter.off(`job:${jobId}`, handler);
    clearInterval(heartbeat);
  });
});
```

### Polling Endpoints

```javascript
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
```

---

## 15. GraphQL

### Schema Definition

```graphql
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
```

### REST vs GraphQL

```
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
```

---

## 16. API Documentation

### OpenAPI (Swagger) Specification

```yaml
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
```

### Auto-Generated Documentation with Express

```javascript
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
```

---

## 17. API Security Best Practices

### Input Validation

```javascript
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
```

### Security Checklist

```
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
```

### Request Sanitization Middleware

```javascript
// Prevent NoSQL injection in MongoDB
function sanitizeInput(req, res, next) {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    const clean = {};
    for (const [key, value] of Object.entries(obj)) {
      // Block MongoDB operators in user input
      if (key.startsWith('$')) continue;
      clean[key] = typeof value === 'object' ? sanitize(value) : value;
    }
    return clean;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  next();
}
```

---

## 18. API Testing

### Unit Testing Endpoints

```javascript
import request from 'supertest';
import app from '../app';

describe('GET /api/v1/users', () => {
  it('should return paginated users', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Cookie', [`session=${validSessionCookie}`])
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
      .set('Cookie', [`session=${validSessionCookie}`])
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
      .set('Cookie', [`session=${adminSessionCookie}`])
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
      .set('Cookie', [`session=${adminSessionCookie}`])
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
      .set('Cookie', [`session=${adminSessionCookie}`])
      .send({ name: 'First', email: 'same@example.com', password: 'pass12345' })
      .expect(201);

    const res = await request(app)
      .post('/api/v1/users')
      .set('Cookie', [`session=${adminSessionCookie}`])
      .send({ name: 'Second', email: 'same@example.com', password: 'pass12345' })
      .expect(409);

    expect(res.body.code).toBe('DUPLICATE_KEY');
  });
});
```

### Contract Testing

```javascript
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
    .set('Cookie', [`session=${validSessionCookie}`])
    .expect(200);

  const validate = ajv.compile(userResponseSchema);
  const valid = validate(res.body);
  expect(valid).toBe(true);
});
```

---

## 19. API Design Patterns

### Bulk Operations

```javascript
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
```

### Soft Delete

```javascript
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
```

### Async Operations

```javascript
// For long-running operations
// POST /api/v1/reports/generate
router.post('/generate', authenticate, async (req, res) => {
  const taskId = await reportService.queueGeneration(req.body);

  res.status(202).json({
    status: 'accepted',
    message: 'Report generation started',
    results: {
      taskId,
      statusUrl: `/api/v1/reports/status/${taskId}`,
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
```

### Webhook Pattern

```javascript
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
```

### Multi-Tenant APIs

```javascript
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

// Ensure queries are scoped to tenant
function scopeToTenant(collection) {
  return {
    find: (filter = {}) => collection.find({ ...filter, tenantId: req.tenantId }),
    create: (data) => collection.create({ ...data, tenantId: req.tenantId }),
    update: (id, data) =>
      collection.updateOne({ _id: id, tenantId: req.tenantId }, { $set: data }),
    delete: (id) =>
      collection.deleteOne({ _id: id, tenantId: req.tenantId }),
  };
}
```

---

## 20. Interview Questions

### Beginner (1-3 years)

**Q1: What is REST and what are its key constraints?**

REST (Representational State Transfer) is an architectural style for APIs based on six constraints:

1. **Client-Server**: Separate UI from data storage concerns
2. **Stateless**: Each request contains all information needed; server stores no session state
3. **Cacheable**: Responses must indicate if they can be cached
4. **Uniform Interface**: Standardized way to interact using resources, HTTP methods, and representations
5. **Layered System**: Client doesn't know if it's talking to the end server or an intermediary
6. **Code on Demand** (optional): Server can send executable code to the client

---

**Q2: When should you use PUT vs PATCH?**

**PUT** replaces the entire resource. You send the complete object. If you omit a field, it gets set to null/default. It's idempotent — calling it multiple times produces the same result.

**PATCH** partially updates a resource. You only send the fields you want to change. Other fields remain untouched. Use PATCH for single-field updates (like changing status) and PUT when you're replacing the whole entity (like editing a form with all fields).

---

**Q3: What are the most common HTTP status codes and when do you use them?**

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

Two main approaches:

**Offset-based**: `GET /users?page=2&limit=20` — uses skip/offset to jump to a page. Simple and supports jumping to any page, but can give inconsistent results if data changes between requests and is slow for large offsets.

**Cursor-based**: `GET /users?cursor=abc123&limit=20` — uses an opaque token pointing to the last item. More performant for large datasets (uses indexed column, not skip) and gives consistent results, but can't jump to arbitrary pages.

Return pagination metadata in the response: `total`, `totalPages`, `hasNext`, `hasPrev` (offset) or `nextCursor`, `hasNext` (cursor).

---

**Q5: What's the difference between authentication and authorization?**

**Authentication** verifies *who* you are. It answers "Are you a valid user?" Methods: username/password, JWT, OAuth, API keys, cookies.

**Authorization** verifies *what you can do*. It answers "Do you have permission for this action?" Methods: Role-based (RBAC — admin, manager, recruiter), attribute-based (ABAC — based on user attributes, resource attributes, and environment), or policy-based.

In a typical flow: the auth middleware authenticates the user (validates JWT/cookie), then an authorization middleware checks if that user's role has permission for the requested resource/action.

---

**Q6: How should you structure error responses in an API?**

Use a consistent error envelope with: `status` ("error"), `message` (human-readable), `code` (machine-readable error code like "VALIDATION_ERROR"), and `errors` array (for field-level validation errors). Include a `requestId` for debugging.

Always use appropriate HTTP status codes. Never return 200 with an error body. Don't expose internal implementation details (stack traces, database errors) in production — log them server-side and return a generic message to the client.

---

### Intermediate (3-5 years)

**Q7: How do you version an API? What are the trade-offs?**

Three approaches:

1. **URL path**: `/api/v1/users` vs `/api/v2/users` — most common, easy to route and cache, but URLs change
2. **Header**: `Accept: application/vnd.api.v2+json` — clean URLs, supports content negotiation, but less visible
3. **Query parameter**: `/api/users?version=2` — easy to implement but can be missed

Key principles: avoid breaking changes when possible (additive-only), deprecate old versions with `Deprecation` headers and sunset dates, maintain at most 2-3 active versions, document migration guides, and use non-breaking changes (new optional fields, new endpoints) as long as possible before bumping versions.

---

**Q8: Explain rate limiting. Why is it important and how would you implement it?**

Rate limiting controls how many requests a client can make in a time window. It protects against: DDoS attacks, abuse, resource exhaustion, and ensures fair usage.

**Algorithms**: Token bucket (smooth, allows bursts), sliding window (precise, more memory), fixed window (simple, but burst at boundaries).

**Implementation**: Use Redis for distributed rate limiting across multiple servers. Track request count per client (by IP, API key, or user ID) with TTL-based expiry. Return standard headers: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`. Return `429 Too Many Requests` with `Retry-After` header when exceeded.

Apply different limits for different endpoints: stricter for auth (5/15min), moderate for writes (100/15min), lenient for reads (1000/15min).

---

**Q9: How do you handle long-running operations in a REST API?**

Use the **async request pattern**:

1. Client sends `POST /api/v1/reports/generate`
2. Server queues the job and immediately returns `202 Accepted` with a `taskId` and status URL
3. Client polls `GET /api/v1/reports/status/:taskId` for progress
4. When complete, the status response includes the result or download URL

Alternatives to polling: WebSockets for real-time updates, SSE for server push, or webhooks to call back the client when done. The polling approach is simplest and works with any client.

---

**Q10: What is CORS and how does it work?**

CORS (Cross-Origin Resource Sharing) is a browser security mechanism that restricts requests from one origin to another. When a frontend at `https://app.example.com` calls an API at `https://api.example.com`, the browser enforces CORS.

**Simple requests** (GET, POST with standard content types) include an `Origin` header. The server responds with `Access-Control-Allow-Origin`.

**Preflight requests** (PUT, DELETE, custom headers) trigger an `OPTIONS` request first. The browser checks the response headers (`Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`) before sending the actual request.

Configure CORS with specific origins (not `*`), allowed methods, and `credentials: true` for cookie-based auth. Set `Access-Control-Max-Age` to cache preflight results.

---

**Q11: How would you design an API for a multi-tenant SaaS application?**

Identify tenants via: subdomain (`tenant1.api.example.com`), header (`X-Tenant-ID`), or JWT claim.

**Data isolation strategies**:
- **Database per tenant**: Strongest isolation, hardest to manage
- **Schema per tenant**: Good isolation, moderate complexity
- **Shared database with tenant column**: Easiest, but must ensure every query is scoped

Key concerns: ensure all queries are scoped to the tenant (middleware that adds `tenantId` to every query), prevent cross-tenant data leaks, per-tenant rate limiting and quotas, tenant-aware caching (namespace cache keys with tenant ID).

---

**Q12: Compare REST and GraphQL. When would you choose each?**

**REST**: Multiple endpoints, server-defined response shapes, HTTP caching built-in, simpler to implement, better for public APIs. Best when: resources map cleanly to endpoints, caching is important, operations are straightforward CRUD.

**GraphQL**: Single endpoint, client-defined response shapes, no over/under-fetching, built-in type system, introspection. Best when: multiple clients need different data shapes, deeply nested relational data, need to reduce API calls.

Downsides of GraphQL: complex caching (all POST requests), potential for expensive nested queries (need depth limiting), steeper learning curve, harder to implement rate limiting.

Many teams use both: REST for simple CRUD and file operations, GraphQL for complex data-fetching scenarios.

---

### Advanced (5+ years)

**Q13: How would you design an API gateway for a microservices architecture?**

The API gateway is the single entry point for all client requests. Key responsibilities:

1. **Routing**: Map external URLs to internal service endpoints
2. **Authentication**: Verify tokens/sessions, pass user context to services
3. **Rate limiting**: Per-client and per-endpoint limits
4. **Request aggregation**: Combine multiple service calls into one response (BFF pattern)
5. **Circuit breaking**: Fail fast when downstream services are unhealthy
6. **Transformation**: Convert between external API format and internal protocols
7. **Caching**: Cache responses for read-heavy endpoints
8. **Monitoring**: Centralized logging, metrics, distributed tracing

Technologies: Kong, AWS API Gateway, Nginx, or custom (Express + http-proxy-middleware). Use BFF (Backend for Frontend) pattern when mobile and web need different response shapes.

---

**Q14: How do you ensure backward compatibility when evolving an API?**

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

**Delivery guarantees**:
1. Persist webhook events to a durable queue before attempting delivery
2. Exponential backoff retry: 1min → 5min → 30min → 2h → 24h
3. Dead letter queue after max retries (notify admin)
4. Idempotency key per event so receivers can deduplicate

**Security**: HMAC signature (SHA-256) with a per-subscriber secret. Include timestamp in signature to prevent replay attacks. Receivers verify the signature before processing.

**Reliability**: Separate delivery workers from the main application. Track delivery status per subscriber per event. Provide a UI/API for subscribers to see delivery logs and replay failed events. Include a "test" endpoint to verify the subscriber's URL is reachable.

**At-least-once semantics**: Don't wait for receiver acknowledgment before marking as delivered — use a confirmation model (receiver returns 2xx) with retries for non-2xx responses.

---

**Q16: How do you handle API security for a public-facing API at scale?**

**Defense in depth**:
1. **Edge**: CDN/WAF (CloudFlare, AWS WAF) blocks common attacks before reaching your servers
2. **Gateway**: Authentication, rate limiting, request validation, IP allowlisting for partners
3. **Application**: Input sanitization, parameterized queries, authorization checks, business rule validation
4. **Data**: Field-level encryption, audit logging, PII masking in logs

**API key management**: Hash keys in storage (never store plaintext), scope keys to specific endpoints/actions, support key rotation without downtime, track usage per key.

**OAuth 2.0 for third-party access**: Authorization code flow for web apps, PKCE for SPAs/mobile, client credentials for service-to-service. Scope tokens to minimum necessary permissions.

**Monitoring**: Anomaly detection on request patterns, alert on auth failure spikes, log all admin actions, implement request signing for sensitive operations.

---

*This guide covers the essential patterns and practices for designing, building, and maintaining production APIs. Focus on consistency, simplicity, and security — a well-designed API should be intuitive for consumers while being robust and maintainable on the server side.*

---

## References

- [OpenAPI Specification](https://swagger.io/specification) — Industry standard for REST API definitions
- [REST API Tutorial](https://restfulapi.net) — Comprehensive REST design guide
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) — MDN reference for all status codes
