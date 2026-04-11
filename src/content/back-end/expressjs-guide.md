# Express.js — Complete Guide

## Table of Contents

- [1. What is Express.js?](#1-what-is-expressjs)
- [2. Getting Started](#2-getting-started)
- [3. Routing](#3-routing)
- [4. Middleware](#4-middleware)
- [5. Request and Response](#5-request-and-response)
- [6. Error Handling](#6-error-handling)
- [7. Template Engines](#7-template-engines)
- [8. Static Files](#8-static-files)
- [9. Security](#9-security)
- [10. Project Structure](#10-project-structure)
- [11. Authentication Patterns](#11-authentication-patterns)
- [12. Database Integration](#12-database-integration)
- [13. Testing](#13-testing)
- [14. Performance](#14-performance)
- [15. Interview Questions & Answers](#15-interview-questions--answers)
- [16. Tricky Output Questions](#16-tricky-output-questions)

---

## 1. What is Express.js?

Express.js is a **minimal, unopinionated web framework** for Node.js. It provides a thin layer of features for building web applications and REST APIs without hiding Node.js functionality.

Key features:
- **Routing** — map URLs to handler functions
- **Middleware** — pluggable request processing pipeline
- **Template engines** — server-side HTML rendering
- **Static file serving** — serve CSS, JS, images
- **Minimal** — no ORM, no auth, no opinions (bring your own)

---

## 2. Getting Started

### 2.1 Installation and Basic Server

```bash
npm install express
```

```js
const express = require('express');
const app = express();

// Built-in middleware
app.use(express.json());                   // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse form data

// Route
app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2.2 With TypeScript

```ts
import express, { Request, Response, NextFunction } from 'express';

const app = express();
app.use(express.json());

app.get('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ id, name: 'Alice' });
});

app.listen(3000);
```

---

## 3. Routing

### 3.1 HTTP Methods

```js
app.get('/users', handler);        // Read
app.post('/users', handler);       // Create
app.put('/users/:id', handler);    // Replace
app.patch('/users/:id', handler);  // Partial update
app.delete('/users/:id', handler); // Delete

// All methods
app.all('/secret', handler);

// Multiple handlers (middleware chain)
app.get('/users', authenticate, authorize('admin'), handler);
```

### 3.2 Route Parameters

```js
// Required params
app.get('/users/:userId', (req, res) => {
  console.log(req.params.userId);          // 'abc123'
});

// Optional params (use ? in route or query string)
app.get('/users/:userId/posts/:postId?', (req, res) => {
  console.log(req.params.postId);          // undefined if not provided
});

// Pattern matching
app.get('/files/*', (req, res) => {
  console.log(req.params[0]);             // everything after /files/
});
```

### 3.3 Query Strings

```js
// GET /search?q=node&page=2&sort=date
app.get('/search', (req, res) => {
  console.log(req.query.q);               // 'node'
  console.log(req.query.page);            // '2' (always string)
  console.log(req.query.sort);            // 'date'
});
```

### 3.4 Router (Modular Routes)

```js
// routes/users.js
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ users: [] });
});

router.get('/:id', (req, res) => {
  res.json({ user: { id: req.params.id } });
});

router.post('/', (req, res) => {
  res.status(201).json({ user: req.body });
});

router.put('/:id', (req, res) => {
  res.json({ user: { ...req.body, id: req.params.id } });
});

router.delete('/:id', (req, res) => {
  res.status(204).end();
});

module.exports = router;

// app.js
const usersRouter = require('./routes/users');
app.use('/api/v1/users', usersRouter);
// Routes: GET /api/v1/users, GET /api/v1/users/:id, etc.
```

### 3.5 Route Chaining

```js
app.route('/users')
  .get((req, res) => { res.json([]); })
  .post((req, res) => { res.status(201).json(req.body); });

app.route('/users/:id')
  .get((req, res) => { /* get user */ })
  .put((req, res) => { /* update user */ })
  .delete((req, res) => { /* delete user */ });
```

---

## 4. Middleware

Middleware functions have access to `req`, `res`, and `next`. They execute in order and can modify request/response, end the request, or pass to the next middleware.

### 4.1 Application-Level Middleware

```js
// Runs on EVERY request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();                                  // MUST call next() to continue
});

// Runs on specific path
app.use('/api', (req, res, next) => {
  console.log('API request');
  next();
});
```

### 4.2 Built-in Middleware

```js
app.use(express.json());                   // parse JSON body
app.use(express.urlencoded({ extended: true })); // parse URL-encoded body
app.use(express.static('public'));         // serve static files
app.use(express.raw());                    // parse raw Buffer body
app.use(express.text());                   // parse text body
```

### 4.3 Third-Party Middleware

```js
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

app.use(cors());                           // CORS headers
app.use(helmet());                         // security headers
app.use(morgan('combined'));               // HTTP request logging
app.use(compression());                    // gzip compression
app.use(cookieParser());                   // parse cookies

// Rate limiting
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,               // 15 minutes
  max: 100,                                // 100 requests per window
  message: 'Too many requests',
}));
```

### 4.4 Custom Middleware

```js
// Authentication middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Authorization middleware (factory function)
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Usage
app.get('/admin', authenticate, authorize('admin'), (req, res) => {
  res.json({ message: 'Admin panel' });
});
```

### 4.5 Middleware Execution Order

```
Request → middleware1 → middleware2 → route handler → Response

app.use(logger);        // 1st: runs on all requests
app.use(authenticate);  // 2nd: runs on all requests
app.get('/users', validate, handler);  // 3rd: validate, then handler

If middleware doesn't call next(), the request hangs.
If middleware sends a response, subsequent middleware/handlers don't run.
```

---

## 5. Request and Response

### 5.1 Request Object (req)

```js
app.post('/users', (req, res) => {
  // URL and path
  req.url;                     // '/users?sort=name'
  req.path;                    // '/users'
  req.originalUrl;             // '/api/v1/users?sort=name' (before router prefix stripping)
  req.baseUrl;                 // '/api/v1' (router mount path)
  req.method;                  // 'POST'
  req.protocol;                // 'https'
  req.hostname;                // 'example.com'
  req.ip;                      // '127.0.0.1'

  // Parameters
  req.params;                  // { userId: '123' } (route params)
  req.query;                   // { sort: 'name' } (query string)
  req.body;                    // { name: 'Alice' } (parsed body)

  // Headers
  req.headers;                 // all headers (lowercase keys)
  req.get('Content-Type');     // 'application/json'
  req.cookies;                 // { session: 'abc' } (with cookie-parser)

  // Checks
  req.is('json');              // 'json' if Content-Type matches
  req.accepts('json');         // check Accept header
});
```

### 5.2 Response Object (res)

```js
app.get('/demo', (req, res) => {
  // Status code
  res.status(200);
  res.sendStatus(404);                     // sets status AND sends status text

  // JSON response (most common)
  res.json({ message: 'Success' });        // sets Content-Type and sends

  // Other response types
  res.send('text');                         // auto-detects Content-Type
  res.send(Buffer.from('binary'));
  res.sendFile('/absolute/path/to/file');
  res.download('file.pdf', 'custom-name.pdf');
  res.render('template', { data });        // render template engine

  // Headers
  res.set('X-Custom', 'value');
  res.set({ 'X-One': '1', 'X-Two': '2' });
  res.cookie('session', 'abc', { httpOnly: true, secure: true });
  res.clearCookie('session');

  // Redirect
  res.redirect('/new-url');
  res.redirect(301, '/permanent-redirect');

  // Chaining
  res.status(201).json({ user: newUser });

  // End without body
  res.status(204).end();
});
```

### 5.3 Response Pattern (Standard Envelope)

```js
// Consistent response format
function sendSuccess(res, data, statusCode = 200) {
  res.status(statusCode).json({
    status: 'success',
    results: data,
  });
}

function sendError(res, message, statusCode = 500) {
  res.status(statusCode).json({
    status: 'error',
    message,
  });
}

app.get('/users', (req, res) => {
  const users = getUsersFromDB();
  sendSuccess(res, users);
});
```

---

## 6. Error Handling

### 6.1 Error-Handling Middleware

Error middleware has **4 parameters** (err, req, res, next). Express recognizes it by the arity.

```js
// Route that throws
app.get('/error', (req, res, next) => {
  try {
    throw new Error('Something broke');
  } catch (err) {
    next(err);                             // pass to error handler
  }
});

// Async route (Express 5 auto-catches, Express 4 needs wrapper)
app.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Error-handling middleware (MUST be defined LAST)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});
```

### 6.2 Async Error Wrapper (Express 4)

```js
// Wrapper that catches async errors
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage: no try/catch needed
app.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();         // if this throws, it's caught
  res.json(users);
}));
```

### 6.3 Custom Error Classes

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

// Usage
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json(user);
}));
```

### 6.4 404 Handler

```js
// Catch-all for unmatched routes (AFTER all routes, BEFORE error handler)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});
```

---

## 7. Template Engines

```js
// Setup (EJS example)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route
app.get('/profile', (req, res) => {
  res.render('profile', {
    user: { name: 'Alice', email: 'alice@example.com' },
    title: 'User Profile',
  });
});
```

```html
<!-- views/profile.ejs -->
<html>
<head><title><%= title %></title></head>
<body>
  <h1>Hello, <%= user.name %></h1>
  <p>Email: <%= user.email %></p>
  <% if (user.isAdmin) { %>
    <p>Admin Panel</p>
  <% } %>
</body>
</html>
```

Popular engines: **EJS**, **Pug** (formerly Jade), **Handlebars**, **Nunjucks**.

---

## 8. Static Files

```js
// Serve files from 'public' directory
app.use(express.static('public'));
// GET /style.css -> public/style.css
// GET /images/logo.png -> public/images/logo.png

// With virtual prefix
app.use('/static', express.static('public'));
// GET /static/style.css -> public/style.css

// Multiple directories (checked in order)
app.use(express.static('public'));
app.use(express.static('uploads'));

// Options
app.use(express.static('public', {
  maxAge: '1d',                            // cache for 1 day
  etag: true,                              // enable ETag
  index: 'index.html',                     // default index file
  dotfiles: 'ignore',                      // ignore .hidden files
}));
```

---

## 9. Security

### 9.1 Helmet (Security Headers)

```js
const helmet = require('helmet');
app.use(helmet());

// Sets headers like:
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// Strict-Transport-Security: max-age=...
// Content-Security-Policy: ...
```

### 9.2 CORS

```js
const cors = require('cors');

// Allow all origins
app.use(cors());

// Specific origins
app.use(cors({
  origin: ['https://example.com', 'https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,                       // allow cookies
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 9.3 Rate Limiting

```js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,               // 15 minutes
  max: 100,                                // 100 requests per window
  standardHeaders: true,                   // RateLimit-* headers
  legacyHeaders: false,
  message: { error: 'Too many requests, try again later' },
});

app.use('/api', limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,               // 1 hour
  max: 5,                                  // 5 attempts
});
app.use('/api/auth/login', authLimiter);
```

### 9.4 Input Validation

```js
const { body, param, query, validationResult } = require('express-validator');

app.post('/users',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // safe to use req.body
  }
);
```

### 9.5 Common Security Practices

```js
// 1. Never trust user input
// Always validate, sanitize, escape

// 2. Use parameterized queries (prevent SQL injection)
// db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);

// 3. Hash passwords
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);

// 4. Use HTTPS in production
// 5. Set secure cookie flags
res.cookie('session', token, {
  httpOnly: true,                          // no JS access
  secure: true,                            // HTTPS only
  sameSite: 'strict',                      // CSRF protection
  maxAge: 3600000,                         // 1 hour
});

// 6. Don't expose stack traces in production
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.isOperational ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
```

---

## 10. Project Structure

### 10.1 Feature-Based Structure (Recommended)

```
src/
  features/
    users/
      users.controller.ts
      users.service.ts
      users.model.ts
      users.routes.ts
      users.validation.ts
      users.types.ts
    auth/
      auth.controller.ts
      auth.service.ts
      auth.routes.ts
    jobs/
      ...
  middleware/
    authenticate.ts
    authorize.ts
    error-handler.ts
    validate.ts
  lib/
    database.ts
    logger.ts
    email.ts
  config/
    index.ts
  app.ts                    # Express app setup (middleware, routes)
  server.ts                 # Server startup (listen, graceful shutdown)
```

### 10.2 Controller-Service-Model Pattern

```js
// users.model.ts - data access
class UserModel {
  static async findById(id) {
    return db.collection('users').findOne({ _id: id });
  }
  static async create(data) {
    return db.collection('users').insertOne(data);
  }
}

// users.service.ts - business logic
class UserService {
  static async getUser(id) {
    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  }
  static async createUser(data) {
    // validation, password hashing, etc.
    const hash = await bcrypt.hash(data.password, 12);
    return UserModel.create({ ...data, password: hash });
  }
}

// users.controller.ts - HTTP handling
class UserController {
  static async getUser(req, res) {
    const user = await UserService.getUser(req.params.id);
    res.json({ status: 'success', results: user });
  }
  static async createUser(req, res) {
    const user = await UserService.createUser(req.body);
    res.status(201).json({ status: 'success', results: user });
  }
}

// users.routes.ts - route definitions
const router = express.Router();
router.get('/:id', asyncHandler(UserController.getUser));
router.post('/', validateUser, asyncHandler(UserController.createUser));
```

---

## 11. Authentication Patterns

### 11.1 JWT Authentication

```js
const jwt = require('jsonwebtoken');

// Login - generate token
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

// Middleware - verify token
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### 11.2 Cookie-Based Sessions

```js
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,          // 1 day
    sameSite: 'strict',
  },
}));

// Login
app.post('/login', async (req, res) => {
  const user = await authenticate(req.body);
  req.session.userId = user.id;
  res.json({ message: 'Logged in' });
});

// Check auth
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}
```

---

## 12. Database Integration

### 12.1 MongoDB with Mongoose

```js
const mongoose = require('mongoose');

await mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// CRUD
const user = await User.create({ name: 'Alice', email: 'a@b.com' });
const users = await User.find({ name: /alice/i });
const one = await User.findById(id);
await User.findByIdAndUpdate(id, { name: 'Bob' });
await User.findByIdAndDelete(id);
```

### 12.2 Connection Handling

```js
mongoose.connection.on('connected', () => console.log('DB connected'));
mongoose.connection.on('error', (err) => console.error('DB error:', err));
mongoose.connection.on('disconnected', () => console.log('DB disconnected'));

// Graceful shutdown
process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
```

---

## 13. Testing

### 13.1 Integration Testing with Supertest

```js
const request = require('supertest');
const app = require('./app');

describe('GET /api/users', () => {
  it('should return list of users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.results).toBeInstanceOf(Array);
  });

  it('should return 401 without auth', async () => {
    await request(app)
      .get('/api/users')
      .expect(401);
  });
});

describe('POST /api/users', () => {
  it('should create a user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'pass1234' })
      .expect(201);

    expect(res.body.results.name).toBe('Alice');
  });

  it('should validate required fields', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({})
      .expect(400);

    expect(res.body.errors).toBeDefined();
  });
});
```

### 13.2 Separate App from Server

```js
// app.js - export app (for testing)
const app = express();
// ... setup middleware, routes ...
module.exports = app;

// server.js - start listening (not imported in tests)
const app = require('./app');
app.listen(3000);
```

---

## 14. Performance

### 14.1 Compression

```js
const compression = require('compression');
app.use(compression());                   // gzip responses
```

### 14.2 Caching

```js
// Response caching headers
app.get('/api/data', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  res.json(data);
});

// In-memory caching
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

app.get('/api/data', async (req, res) => {
  const cached = cache.get('data');
  if (cached) return res.json(cached);

  const data = await fetchExpensiveData();
  cache.set('data', data);
  res.json(data);
});
```

### 14.3 Connection Pooling

```js
// MongoDB (Mongoose handles pooling automatically)
mongoose.connect(uri, {
  maxPoolSize: 10,                         // default: 100
});

// PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({
  max: 20,                                 // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 15. Interview Questions & Answers

### Beginner

---

**Q1: What is Express.js? Why use it instead of raw Node.js HTTP?**

Express.js is a minimal web framework for Node.js. You'd use it over raw `http` module because:
- **Routing**: Clean URL-to-handler mapping (`app.get('/users/:id', handler)`)
- **Middleware**: Pluggable request processing pipeline
- **Request parsing**: Built-in JSON/form body parsing
- **Response helpers**: `res.json()`, `res.redirect()`, `res.sendFile()`
- **Ecosystem**: Thousands of middleware packages (cors, helmet, morgan, etc.)

The raw HTTP module gives you one callback for all requests — you'd have to manually parse URLs, bodies, methods, and content types.

---

**Q2: What is middleware in Express?**

Middleware is a function with access to `req`, `res`, and `next`. It sits in the request-response pipeline and can:
1. Execute code
2. Modify `req` and `res`
3. End the request-response cycle
4. Call `next()` to pass control to the next middleware

```js
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();                                  // pass to next middleware
}
app.use(logger);
```

Middleware runs in the order it's registered with `app.use()`.

---

**Q3: What is the difference between `app.use()` and `app.get()`?**

- `app.use()`: Matches ALL HTTP methods and any path that STARTS WITH the given prefix
- `app.get()`: Matches only GET requests to the EXACT path

```js
app.use('/api', middleware);    // matches GET /api/users, POST /api/data, etc.
app.get('/api', handler);      // matches only GET /api (exact)
```

`app.use()` is for middleware; `app.get()` (and `.post()`, `.put()`, etc.) is for route handlers.

---

**Q4: How do you handle errors in Express?**

1. Synchronous errors in route handlers are caught automatically (Express 5) or need try/catch (Express 4)
2. Async errors must be passed to `next(err)`
3. Define an error-handling middleware with 4 parameters `(err, req, res, next)` as the LAST middleware

```js
// Error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
  });
});
```

---

**Q5: What is `req.params` vs `req.query` vs `req.body`?**

```js
// Route: PUT /users/123?active=true
// Body: { "name": "Alice" }

req.params;   // { id: '123' }        — from URL path (:id)
req.query;    // { active: 'true' }   — from query string (?key=value)
req.body;     // { name: 'Alice' }    — from request body (needs parser middleware)
```

---

### Intermediate

---

**Q6: Explain the middleware execution order in Express.**

Middleware executes in the order it's registered:

```js
app.use(cors());           // 1st
app.use(helmet());         // 2nd
app.use(express.json());   // 3rd
app.use('/api', authMiddleware);  // 4th (only /api routes)
app.get('/api/users', handler);   // 5th (route handler)
app.use(notFoundHandler);  // 6th (unmatched routes)
app.use(errorHandler);     // 7th (error handler - LAST)
```

Key rules:
- Middleware without a path runs on ALL requests
- Each middleware must call `next()` or send a response
- Error handlers (4 params) only run when `next(err)` is called
- Route-specific middleware runs only when the route matches

---

**Q7: How would you structure a large Express.js application?**

Feature-based structure with separation of concerns:

1. **Routes** — define URL-to-controller mapping
2. **Controllers** — handle HTTP (parse req, send res)
3. **Services** — business logic (reusable, framework-agnostic)
4. **Models** — data access (database queries)
5. **Middleware** — cross-cutting concerns (auth, validation, logging)

```
src/
  features/users/    (routes, controller, service, model)
  features/auth/
  middleware/
  config/
  app.ts             (setup)
  server.ts          (listen)
```

This separates HTTP concerns from business logic, making services testable without Express.

---

**Q8: How do you handle CORS in Express?**

CORS (Cross-Origin Resource Sharing) controls which domains can make requests to your API.

```js
const cors = require('cors');

// Allow all
app.use(cors());

// Allow specific origins with credentials
app.use(cors({
  origin: ['https://myapp.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

Without CORS, browsers block cross-origin requests. The `cors` middleware sets the `Access-Control-Allow-*` headers that browsers check.

---

**Q9: What is the difference between `res.send()`, `res.json()`, and `res.end()`?**

- `res.send(body)`: Sends response, auto-sets Content-Type based on body type (string -> text/html, object -> application/json, Buffer -> application/octet-stream)
- `res.json(obj)`: Converts to JSON string, sets Content-Type to application/json. Also handles `null`, `undefined`, etc. correctly.
- `res.end()`: Ends response without body. Use for 204 No Content.

```js
res.send('Hello');          // text/html
res.send({ a: 1 });        // application/json (same as res.json)
res.json({ a: 1 });        // application/json (explicit, preferred)
res.status(204).end();      // no body
```

Use `res.json()` for APIs — it's more explicit and handles edge cases.

---

**Q10: How do you implement authentication in Express?**

Two main approaches:

1. **JWT (stateless)**: Token in Authorization header, verified on each request
   ```js
   // Login: generate token
   const token = jwt.sign({ userId }, secret, { expiresIn: '1h' });
   // Middleware: verify token on each request
   const decoded = jwt.verify(token, secret);
   ```

2. **Session (stateful)**: Server stores session, client sends session ID cookie
   ```js
   req.session.userId = user.id;  // store on login
   req.session.userId;            // check on each request
   ```

JWT is better for APIs and microservices (no shared state). Sessions are better for traditional web apps (easier to revoke).

---

### Advanced

---

**Q11: How does Express handle async errors? What changed in Express 5?**

**Express 4**: Async errors must be caught and passed to `next(err)`. Unhandled promise rejections crash or hang the request.

```js
// Express 4 - must catch manually
app.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
});
```

**Express 5**: Automatically catches rejected promises from async route handlers and passes them to error middleware.

```js
// Express 5 - auto-caught
app.get('/users', async (req, res) => {
  const users = await User.find();  // if this throws, error handler gets it
  res.json(users);
});
```

For Express 4, use an `asyncHandler` wrapper to avoid repetitive try/catch.

---

**Q12: How would you implement rate limiting with different tiers?**

```js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new RedisStore({ client: redisClient }), // distributed
}));

// Strict for auth
app.use('/auth/login', rateLimit({ windowMs: 3600000, max: 5 }));

// Per-user with dynamic limit
function dynamicLimit(req, res, next) {
  const tier = req.user?.tier || 'free';
  const limits = { free: 100, pro: 1000, enterprise: 10000 };
  const limiter = rateLimit({
    windowMs: 3600000,
    max: limits[tier],
    keyGenerator: (req) => req.user.id,
  });
  limiter(req, res, next);
}
```

For distributed systems, use Redis-backed stores so rate limits are shared across instances.

---

**Q13: How do you handle file uploads in Express?**

```js
const multer = require('multer');

// Memory storage (buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },    // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  },
});

// Single file
app.post('/upload', upload.single('avatar'), (req, res) => {
  console.log(req.file);                       // { buffer, mimetype, size, ... }
  // Upload to S3, save to disk, etc.
});

// Multiple files
app.post('/gallery', upload.array('photos', 10), (req, res) => {
  console.log(req.files);                      // array of files
});

// Disk storage
const diskUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});
```

---

**Q14: How would you implement API versioning?**

Three approaches:

```js
// 1. URL prefix (most common)
app.use('/api/v1/users', v1UsersRouter);
app.use('/api/v2/users', v2UsersRouter);

// 2. Custom header
app.use('/api/users', (req, res, next) => {
  const version = req.get('API-Version') || 'v1';
  if (version === 'v2') return v2Handler(req, res, next);
  v1Handler(req, res, next);
});

// 3. Accept header (content negotiation)
app.use('/api/users', (req, res, next) => {
  if (req.accepts('application/vnd.api.v2+json')) {
    return v2Handler(req, res, next);
  }
  v1Handler(req, res, next);
});
```

URL prefix is simplest and most widely used. It's clear, cacheable, and easy to deprecate.

---

**Q15: Explain the difference between Express.js and other Node.js frameworks (Fastify, Koa, NestJS).**

| Feature | Express | Fastify | Koa | NestJS |
|---------|---------|---------|-----|--------|
| Philosophy | Minimal, unopinionated | Performance-focused | Minimal, modern | Full-featured, opinionated |
| Performance | Good | Best (2-3x Express) | Good | Good (uses Express/Fastify under the hood) |
| Middleware | Callback-based | Plugin system | async/await native | Decorators, dependency injection |
| Validation | Third-party (express-validator) | Built-in (JSON schema) | Third-party | Built-in (class-validator) |
| TypeScript | Community types | First-class | Community types | First-class |
| Learning curve | Low | Low | Low | High |
| Ecosystem | Largest | Growing | Small | Growing |
| Use case | Most projects | High-performance APIs | Modern, lightweight | Enterprise, large teams |

Express is the most popular and has the largest ecosystem. Choose others when you need specific advantages (performance, TypeScript, structure).

---

**Q16: How do you implement graceful shutdown with Express?**

```js
const server = app.listen(3000);

async function gracefulShutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);

  // 1. Stop accepting new connections
  server.close(async () => {
    // 2. Close database connections
    await mongoose.connection.close();

    // 3. Close Redis, message queues, etc.
    await redis.quit();

    console.log('Server closed');
    process.exit(0);
  });

  // 4. Force exit after timeout
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

---

**Q17: How do you handle multipart/form-data vs application/json in the same route?**

```js
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

app.post('/roles',
  // Conditionally apply multer based on content type
  (req, res, next) => {
    const contentType = req.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      upload.array('files')(req, res, next);
    } else {
      express.json()(req, res, next);
    }
  },
  asyncHandler(async (req, res) => {
    // req.body has JSON fields
    // req.files has uploaded files (if multipart)
    const result = await RoleService.create(req.body, req.files);
    res.status(201).json(result);
  })
);
```

---

**Q18: How would you implement request validation middleware?**

```js
const { z } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = validated.body;
      req.query = validated.query;
      req.params = validated.params;
      next();
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: err.errors,
      });
    }
  };
}

// Usage
const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(8),
  }),
  query: z.object({}),
  params: z.object({}),
});

app.post('/users', validate(createUserSchema), handler);
```

---

## 16. Tricky Output Questions

Practice questions testing your understanding of Express middleware execution order, error handling flow, and request/response lifecycle.

### Middleware Execution Order

---

**Q1: What order do middlewares execute?**

```js
app.use((req, res, next) => {
  console.log("A");
  next();
  console.log("B");
});

app.use((req, res, next) => {
  console.log("C");
  next();
  console.log("D");
});

app.get("/", (req, res) => {
  console.log("E");
  res.send("OK");
});
```

**Output for `GET /`:**
```
A
C
E
D
B
```

Middleware forms a call stack. `next()` passes control to the next middleware. Code **after** `next()` runs in reverse order as the stack unwinds — like an onion. This is important for logging, timing, and cleanup.

---

**Q2: Middleware short-circuit — what happens when next() isn't called?**

```js
app.use((req, res, next) => {
  console.log("A");
  next();
});

app.use((req, res, next) => {
  console.log("B");
  res.send("stopped");
  // no next() call
});

app.use((req, res, next) => {
  console.log("C");
  next();
});

app.get("/", (req, res) => {
  console.log("D");
  res.send("OK");
});
```

**Output for `GET /`:**
```
A
B
```

When middleware sends a response without calling `next()`, the chain stops. `C` and `D` never execute. The response is "stopped". This is how auth middleware blocks unauthorized requests.

---

**Q3: Route-specific vs app-level middleware**

```js
app.use((req, res, next) => {
  console.log("global");
  next();
});

app.get("/api", (req, res, next) => {
  console.log("route 1");
  next();
});

app.get("/api", (req, res) => {
  console.log("route 2");
  res.send("OK");
});
```

**Output for `GET /api`:**
```
global
route 1
route 2
```

**Output for `GET /other`:**
```
global
```

App-level middleware (`app.use`) runs for all routes. Multiple handlers on the same route execute in order when `next()` is called.

---

### Error Handling

---

**Q4: Error middleware — which handler catches the error?**

```js
app.get("/", (req, res, next) => {
  console.log("A");
  throw new Error("boom");
});

app.use((req, res, next) => {
  console.log("B");
  next();
});

app.use((err, req, res, next) => {
  console.log("C:", err.message);
  res.status(500).send("error");
});
```

**Output for `GET /`:**
```
A
C: boom
```

Synchronous errors thrown in route handlers are caught by Express and forwarded to the next **error middleware** (4 parameters). Regular middleware `B` is skipped entirely — Express jumps straight to error handlers.

---

**Q5: Async error — does Express catch it?**

```js
app.get("/", async (req, res) => {
  console.log("A");
  throw new Error("async boom");
});

app.use((err, req, res, next) => {
  console.log("caught:", err.message);
  res.status(500).send("error");
});
```

**Output (Express 4):** Unhandled promise rejection — the error middleware does NOT fire.

**Output (Express 5):** `A` then `caught: async boom` — Express 5 handles async errors.

Express 4 does not catch rejected promises from async handlers. Fix: wrap with `next(err)` or use a wrapper: `const asyncHandler = fn => (req, res, next) => fn(req, res, next).catch(next)`.

---

**Q6: next('route') vs next(error)**

```js
app.get("/",
  (req, res, next) => {
    console.log("handler 1");
    next("route");
  },
  (req, res, next) => {
    console.log("handler 2");
    next();
  }
);

app.get("/", (req, res) => {
  console.log("handler 3");
  res.send("OK");
});

app.use((err, req, res, next) => {
  console.log("error:", err);
  res.status(500).send("error");
});
```

**Output for `GET /`:**
```
handler 1
handler 3
```

`next('route')` skips remaining handlers in the **current route** and jumps to the next matching route. `handler 2` is skipped, but `handler 3` (a separate `app.get`) still runs. Note: `next('route')` only works with `app.METHOD()` or `router.METHOD()`, not `app.use()`.

---

### Request/Response Quirks

---

**Q7: Double response — what happens?**

```js
app.get("/", (req, res) => {
  res.send("first");
  console.log("A");
  res.send("second");
  console.log("B");
});
```

**Output:**
```
A
Error: Cannot set headers after they are sent to the client
```

The client receives "first". After `res.send()`, the response is finished. `A` logs because `res.send()` doesn't stop execution. But the second `res.send()` throws. Always `return res.send()` or use `if/else` to prevent double responses.

---

**Q8: res.json() vs res.send() for objects**

```js
app.get("/", (req, res) => {
  const data = { status: "ok", count: 0 };

  res.send(data);   // A: Content-Type?
  // vs
  res.json(data);   // B: Content-Type?
});
```

**Answer:**
- A: `application/json` — `res.send()` detects objects and sets JSON content type
- B: `application/json` — `res.json()` explicitly sets JSON content type

Both produce the same result for objects. But `res.send(null)` sends an empty body, while `res.json(null)` sends the string `"null"`. Use `res.json()` for APIs for clarity.

---

**Q9: Middleware params — does it match?**

```js
app.param("id", (req, res, next, id) => {
  console.log("param:", id);
  next();
});

app.get("/users/:id", (req, res) => {
  console.log("route:", req.params.id);
  res.send("OK");
});

app.get("/posts/:id", (req, res) => {
  console.log("posts:", req.params.id);
  res.send("OK");
});
```

**Output for `GET /users/42`:**
```
param: 42
route: 42
```

**Output for `GET /posts/7`:**
```
param: 7
posts: 7
```

`app.param("id")` fires for ANY route with an `:id` parameter. It runs before the route handler, making it useful for validation or loading resources.

---

**Q10: Middleware order matters — what's wrong?**

```js
app.use(express.json());

app.post("/api", (req, res) => {
  console.log("body:", req.body);
  res.send("OK");
});

// vs

app.post("/api", (req, res) => {
  console.log("body:", req.body);
  res.send("OK");
});

app.use(express.json());
```

**Output (first version):** `body: { name: "John" }` (parsed JSON)

**Output (second version):** `body: undefined`

Middleware registration order matters. In the second version, `express.json()` is registered AFTER the route, so `req.body` is never parsed. Always register body-parsing middleware before your routes.

---

### Key Rules

```
Express Output Cheat Sheet:
1. Middleware executes in registration order — first registered, first called
2. Code after next() runs in reverse order (stack unwinding)
3. No next() = chain stops (short-circuit)
4. Sync errors auto-forward to error middleware; async errors don't (Express 4)
5. Error middleware must have exactly 4 params (err, req, res, next)
6. next('route') skips current route's handlers, not all routes
7. res.send() doesn't stop execution — use return
8. app.param() fires for all routes with matching parameter
9. Middleware order = registration order (body parser before routes)
10. Multiple handlers on same route chain via next()
```

---

## References

- [Express.js Documentation](https://expressjs.com) — Official API reference and guides
- [Express.js GitHub](https://github.com/expressjs/express) — Source code and middleware list
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html) — Security and performance guidelines
