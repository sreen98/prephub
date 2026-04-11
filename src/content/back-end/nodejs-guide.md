# Node.js — Complete Guide

## Table of Contents

- [1. What is Node.js?](#1-what-is-nodejs)
- [2. Architecture](#2-architecture)
- [3. Modules](#3-modules)
- [4. File System](#4-file-system)
- [5. HTTP Server](#5-http-server)
- [6. Streams](#6-streams)
- [7. Events](#7-events)
- [8. Process and Environment](#8-process-and-environment)
- [9. Buffers](#9-buffers)
- [10. Child Processes and Worker Threads](#10-child-processes-and-worker-threads)
- [11. Error Handling](#11-error-handling)
- [12. Package Management (npm)](#12-package-management-npm)
- [13. Performance and Best Practices](#13-performance-and-best-practices)
- [14. Interview Questions & Answers](#14-interview-questions--answers)
- [15. Tricky Output Questions](#15-tricky-output-questions)

---

## 1. What is Node.js?

Node.js is a **JavaScript runtime** built on Chrome's **V8 engine** that executes JavaScript outside the browser. It uses an **event-driven, non-blocking I/O** model that makes it efficient for building scalable network applications.

Key characteristics:
- **Single-threaded** event loop (with background thread pool for I/O)
- **Non-blocking I/O** — async operations don't block the main thread
- **V8 engine** — same engine that powers Chrome
- **Cross-platform** — runs on Windows, macOS, Linux
- **NPM** — largest package ecosystem in the world

### When to use Node.js

| Good for | Not ideal for |
|----------|---------------|
| REST APIs / GraphQL | CPU-intensive computation |
| Real-time apps (chat, gaming) | Heavy image/video processing |
| Microservices | Complex mathematical calculations |
| Streaming data | Monolithic enterprise apps (debatable) |
| CLI tools | |
| Server-side rendering | |

---

## 2. Architecture

### 2.1 Event Loop

The event loop is the core of Node.js. It allows non-blocking I/O despite JavaScript being single-threaded.

```mermaid
graph TD
    A["⏱ timers<br/>setTimeout, setInterval"] --> B["📋 pending callbacks<br/>I/O callbacks deferred"]
    B --> C["⚙️ idle, prepare<br/>internal use only"]
    C --> D["📡 poll<br/>retrieve new I/O events"]
    D --> E["✅ check<br/>setImmediate callbacks"]
    E --> F["🔒 close callbacks<br/>socket.on close"]
    F --> A
    style A fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b
    style D fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b
    style E fill:#ecfdf5,stroke:#10b981,color:#064e3b
```

> **Microtask queue** runs BETWEEN each phase: `process.nextTick` (highest priority), then Promise callbacks.

### 2.2 libuv and Thread Pool

```mermaid
graph TD
    JS["JavaScript V8<br/>single main thread"] --> EL["Event Loop"]
    EL --> LUV["libuv"]
    LUV --> T1["Thread 1<br/>fs ops"]
    LUV --> T2["Thread 2<br/>dns"]
    LUV --> T3["Thread 3<br/>crypto"]
    LUV --> TN["Thread N..."]
    style JS fill:#fef3c7,stroke:#f59e0b,color:#78350f
    style EL fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b
    style LUV fill:#ecfdf5,stroke:#10b981,color:#064e3b
```

> Default: **4 threads** (configurable via `UV_THREADPOOL_SIZE`)

- **Main thread**: Runs JavaScript, event loop
- **Thread pool** (libuv): Handles I/O operations that can't be done asynchronously by the OS (fs, DNS lookups, some crypto)
- **OS async mechanisms**: Network I/O (epoll/kqueue/IOCP) — doesn't use thread pool

### 2.3 Execution Order

```js
console.log('1 - sync');

process.nextTick(() => console.log('2 - nextTick'));

Promise.resolve().then(() => console.log('3 - promise'));

setTimeout(() => console.log('4 - setTimeout'), 0);

setImmediate(() => console.log('5 - setImmediate'));

console.log('6 - sync');

// Output: 1, 6, 2, 3, 4, 5
// (setTimeout vs setImmediate order can vary outside I/O cycle)
```

---

## 3. Modules

### 3.1 CommonJS (CJS) — Traditional Node.js

```js
// math.js — export
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }

module.exports = { add, subtract };
// or
exports.add = add;

// app.js — import
const { add, subtract } = require('./math');
const fs = require('fs');
const express = require('express');
```

### 3.2 ES Modules (ESM) — Modern

```js
// math.mjs (or .js with "type": "module" in package.json)
export function add(a, b) { return a + b; }
export default function multiply(a, b) { return a * b; }

// app.mjs
import multiply, { add } from './math.mjs';
import { readFile } from 'fs/promises';
```

### 3.3 CJS vs ESM

| Feature | CommonJS | ES Modules |
|---------|----------|------------|
| Syntax | `require()` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Asynchronous |
| Top-level await | No | Yes |
| Tree-shaking | No | Yes |
| `__dirname` / `__filename` | Available | Must use `import.meta.url` |
| Default in Node | Yes (legacy) | Yes (modern, with `"type": "module"`) |

### 3.4 Built-in Modules

```js
const fs = require('fs');           // File system
const path = require('path');       // Path manipulation
const http = require('http');       // HTTP server/client
const https = require('https');     // HTTPS
const os = require('os');           // OS info
const crypto = require('crypto');   // Cryptography
const events = require('events');   // Event emitter
const stream = require('stream');   // Streams
const url = require('url');         // URL parsing
const util = require('util');       // Utilities
const child_process = require('child_process'); // Child processes
const worker_threads = require('worker_threads'); // Worker threads
const cluster = require('cluster'); // Clustering
```

---

## 4. File System

### 4.1 Reading Files

```js
const fs = require('fs');
const fsp = require('fs/promises');

// Synchronous (blocks event loop - avoid in servers)
const data = fs.readFileSync('file.txt', 'utf8');

// Callback-based
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Promise-based (recommended)
const data = await fsp.readFile('file.txt', 'utf8');

// Streams (for large files)
const stream = fs.createReadStream('large-file.txt', 'utf8');
stream.on('data', (chunk) => console.log(chunk));
stream.on('end', () => console.log('done'));
```

### 4.2 Writing Files

```js
// Overwrite
await fsp.writeFile('output.txt', 'content', 'utf8');

// Append
await fsp.appendFile('log.txt', 'new line\n');

// Stream (large writes)
const ws = fs.createWriteStream('output.txt');
ws.write('line 1\n');
ws.write('line 2\n');
ws.end();
```

### 4.3 Directory Operations

```js
// List directory
const files = await fsp.readdir('src');
const detailed = await fsp.readdir('src', { withFileTypes: true });
detailed.forEach(dirent => {
  console.log(dirent.name, dirent.isDirectory() ? 'dir' : 'file');
});

// Create directory (recursive)
await fsp.mkdir('path/to/dir', { recursive: true });

// Remove directory
await fsp.rm('path/to/dir', { recursive: true, force: true });

// Check existence
try {
  await fsp.access('file.txt');
  console.log('exists');
} catch {
  console.log('does not exist');
}

// File stats
const stats = await fsp.stat('file.txt');
stats.isFile();
stats.isDirectory();
stats.size;                          // bytes
stats.mtime;                         // last modified
```

### 4.4 Path Module

```js
const path = require('path');

path.join('src', 'utils', 'index.ts');     // 'src/utils/index.ts'
path.resolve('src', 'utils');               // '/absolute/path/src/utils'
path.basename('/path/to/file.txt');         // 'file.txt'
path.extname('file.txt');                   // '.txt'
path.dirname('/path/to/file.txt');          // '/path/to'
path.parse('/path/to/file.txt');
// { root: '/', dir: '/path/to', base: 'file.txt', ext: '.txt', name: 'file' }
```

### 4.5 Watch for Changes

```js
const { watch } = require('fs/promises');

const watcher = watch('src', { recursive: true });
for await (const event of watcher) {
  console.log(event.eventType, event.filename);
}
```

---

## 5. HTTP Server

### 5.1 Basic HTTP Server

```js
const http = require('http');

const server = http.createServer((req, res) => {
  // Request info
  console.log(req.method);                  // GET, POST, etc.
  console.log(req.url);                     // /path?query=string
  console.log(req.headers);                 // { host, content-type, ... }

  // Response
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Hello World' }));
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 5.2 Handling Request Body

```js
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString());
    console.log(body);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ received: true }));
  }
});
```

### 5.3 Making HTTP Requests

```js
// Built-in fetch (Node 18+)
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// Built-in https module
const https = require('https');
https.get('https://api.example.com/data', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => console.log(JSON.parse(data)));
});
```

---

## 6. Streams

Streams process data piece by piece (chunks) instead of loading everything into memory.

### 6.1 Four Types of Streams

```
Readable  → data source (fs.createReadStream, http request)
Writable  → data sink (fs.createWriteStream, http response)
Duplex    → both readable and writable (TCP socket)
Transform → duplex that modifies data passing through (zlib.createGzip)
```

### 6.2 Reading and Writing

```js
const fs = require('fs');

// Pipe: most common pattern (connects readable to writable)
fs.createReadStream('input.txt')
  .pipe(fs.createWriteStream('output.txt'));

// With error handling
const readable = fs.createReadStream('input.txt');
const writable = fs.createWriteStream('output.txt');

readable.pipe(writable);
readable.on('error', (err) => console.error('Read error:', err));
writable.on('error', (err) => console.error('Write error:', err));
writable.on('finish', () => console.log('Done'));
```

### 6.3 Pipeline (Recommended over pipe)

```js
const { pipeline } = require('stream/promises');
const zlib = require('zlib');
const fs = require('fs');

// Compress a file
await pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('input.txt.gz')
);
```

### 6.4 Custom Streams

```js
const { Transform } = require('stream');

const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  },
});

process.stdin.pipe(upperCase).pipe(process.stdout);
```

### 6.5 When to Use Streams

- **Large files**: Don't load a 2GB file into memory — stream it
- **HTTP responses**: Stream data to clients chunk by chunk
- **Data transformation**: CSV parsing, JSON streaming, compression
- **Real-time data**: Video/audio processing, log tailing

---

## 7. Events

### 7.1 EventEmitter

```js
const EventEmitter = require('events');

class OrderService extends EventEmitter {
  createOrder(order) {
    // business logic
    this.emit('orderCreated', order);
  }
}

const service = new OrderService();

// Register listener
service.on('orderCreated', (order) => {
  console.log('Send email for order:', order.id);
});

service.on('orderCreated', (order) => {
  console.log('Update inventory for:', order.id);
});

// Listen once
service.once('orderCreated', (order) => {
  console.log('First order special handling');
});

service.createOrder({ id: 1, total: 99.99 });
```

### 7.2 EventEmitter Methods

```js
const emitter = new EventEmitter();

emitter.on(event, listener);               // add listener
emitter.once(event, listener);             // add one-time listener
emitter.off(event, listener);              // remove listener (alias: removeListener)
emitter.removeAllListeners(event);         // remove all listeners for event
emitter.emit(event, ...args);             // trigger event
emitter.listenerCount(event);             // count listeners
emitter.eventNames();                      // list registered events

// Max listeners (default: 10, warning if exceeded)
emitter.setMaxListeners(20);

// Error handling (MUST listen for 'error' event)
emitter.on('error', (err) => {
  console.error('Error:', err);
});
// If no 'error' listener, Node crashes with unhandled error
```

---

## 8. Process and Environment

### 8.1 process Object

```js
// Environment variables
process.env.NODE_ENV                       // 'development', 'production'
process.env.PORT                           // '3000'

// CLI arguments
process.argv                               // [nodePath, scriptPath, ...args]
// node app.js --port 3000
// process.argv = ['/usr/bin/node', '/path/app.js', '--port', '3000']

// Current working directory
process.cwd()                              // '/path/to/project'

// Platform info
process.platform                           // 'darwin', 'linux', 'win32'
process.arch                               // 'x64', 'arm64'
process.version                            // 'v20.11.0'
process.pid                                // process ID

// Memory usage
process.memoryUsage()
// { rss, heapTotal, heapUsed, external, arrayBuffers }

// Exit
process.exit(0);                           // success
process.exit(1);                           // error

// Standard I/O
process.stdin                              // readable stream
process.stdout                             // writable stream
process.stderr                             // writable stream
```

### 8.2 Signals and Graceful Shutdown

```js
// Handle SIGTERM (from kill command or container orchestrator)
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  await server.close();
  await database.disconnect();
  process.exit(0);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Shutting down...');
  process.exit(0);
});

// Uncaught exceptions (last resort)
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);                         // always exit after uncaught
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
});
```

---

## 9. Buffers

Buffers handle raw binary data (before strings, after network/file I/O).

```js
// Creating buffers
const buf1 = Buffer.alloc(10);                    // 10 zero-filled bytes
const buf2 = Buffer.from('Hello', 'utf8');         // from string
const buf3 = Buffer.from([72, 101, 108, 108, 111]); // from byte array

// Buffer operations
buf2.toString('utf8');                     // 'Hello'
buf2.toString('base64');                   // 'SGVsbG8='
buf2.toString('hex');                      // '48656c6c6f'
buf2.length;                               // 5 (bytes, not characters)

// Compare
Buffer.compare(buf1, buf2);               // -1, 0, or 1
buf1.equals(buf2);                         // boolean

// Concatenate
Buffer.concat([buf1, buf2]);

// Copy
buf2.copy(buf1, 0, 0, 5);                // copy 5 bytes from buf2 to buf1

// Slice (shares memory!)
const slice = buf2.subarray(0, 3);         // 'Hel' (same memory)
```

---

## 10. Child Processes and Worker Threads

### 10.1 Child Processes

```js
const { exec, execFile, spawn, fork } = require('child_process');

// exec: runs shell command, buffers output
const { stdout } = await require('util').promisify(exec)('ls -la');

// spawn: streaming I/O (for long-running processes)
const child = spawn('grep', ['-r', 'TODO', 'src/']);
child.stdout.on('data', (data) => console.log(data.toString()));
child.stderr.on('data', (data) => console.error(data.toString()));
child.on('close', (code) => console.log('Exit code:', code));

// fork: spawn a Node.js process with IPC channel
const worker = fork('./worker.js');
worker.send({ task: 'process-data', payload: data });
worker.on('message', (result) => console.log(result));

// worker.js
process.on('message', (msg) => {
  const result = heavyComputation(msg.payload);
  process.send(result);
});
```

### 10.2 Worker Threads

```js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // Main thread
  const worker = new Worker('./worker.js', {
    workerData: { numbers: [1, 2, 3, 4, 5] },
  });

  worker.on('message', (result) => console.log('Sum:', result));
  worker.on('error', (err) => console.error(err));
  worker.on('exit', (code) => console.log('Exit:', code));
} else {
  // Worker thread (worker.js)
  const { numbers } = workerData;
  const sum = numbers.reduce((a, b) => a + b, 0);
  parentPort.postMessage(sum);
}
```

### 10.3 When to Use What

| | Child Process | Worker Thread |
|---|---|---|
| Separate memory | Yes | Shared (SharedArrayBuffer) |
| Startup cost | Higher (new process) | Lower (new thread) |
| Communication | IPC (serialized) | MessagePort (transferable) |
| Use case | Run external programs, isolation | CPU-intensive JS, parallel computation |

---

## 11. Error Handling

### 11.1 Error Patterns

```js
// Synchronous - try/catch
try {
  const data = JSON.parse(invalidJson);
} catch (error) {
  console.error('Parse error:', error.message);
}

// Callbacks - error-first convention
fs.readFile('file.txt', (err, data) => {
  if (err) {
    console.error('Read error:', err);
    return;
  }
  console.log(data);
});

// Promises - .catch or try/catch with await
try {
  const data = await fsp.readFile('file.txt', 'utf8');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('File not found');
  } else {
    throw error;                           // re-throw unexpected errors
  }
}

// EventEmitter - 'error' event
emitter.on('error', (err) => {
  console.error('Emitter error:', err);
});
```

### 11.2 Custom Errors

```js
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}
```

### 11.3 Operational vs Programmer Errors

```
Operational errors (expected, recoverable):
  - File not found
  - Network timeout
  - Invalid user input
  - Database connection lost
  → Handle gracefully (retry, return error response)

Programmer errors (bugs, unexpected):
  - TypeError: Cannot read property of undefined
  - ReferenceError
  - Logic errors
  → Crash and restart (let process manager handle)
```

---

## 12. Package Management (npm)

### 12.1 Essential Commands

```bash
npm init -y                    # create package.json
npm install express            # install dependency
npm install -D typescript      # install dev dependency
npm install -g nodemon         # install globally
npm uninstall express          # remove
npm update                     # update all
npm outdated                   # check for updates
npm audit                      # security vulnerabilities
npm audit fix                  # auto-fix vulnerabilities
npm ls                         # dependency tree
npm run <script>               # run script from package.json
npx <command>                  # run package binary without installing
```

### 12.2 package.json

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "node --watch src/index.js",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=20"
  }
}
```

### 12.3 Version Ranges

```
^1.2.3  → >=1.2.3 <2.0.0  (minor + patch updates)
~1.2.3  → >=1.2.3 <1.3.0  (patch updates only)
1.2.3   → exactly 1.2.3
*       → any version
>=1.0.0 → 1.0.0 and above
```

---

## 13. Performance and Best Practices

### 13.1 Don't Block the Event Loop

```js
// BAD: CPU-intensive on main thread
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
app.get('/fib/:n', (req, res) => {
  res.json({ result: fibonacci(parseInt(req.params.n)) });
});

// GOOD: Offload to worker thread
const { Worker } = require('worker_threads');
app.get('/fib/:n', (req, res) => {
  const worker = new Worker('./fib-worker.js', {
    workerData: parseInt(req.params.n),
  });
  worker.on('message', (result) => res.json({ result }));
});
```

### 13.2 Use Clustering

```js
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const cpuCount = os.cpus().length;
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Each worker runs the server
  const app = require('./app');
  app.listen(3000);
}
```

### 13.3 Memory Management

```js
// Monitor memory
setInterval(() => {
  const usage = process.memoryUsage();
  console.log({
    rss: `${(usage.rss / 1024 / 1024).toFixed(1)} MB`,
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(1)} MB`,
  });
}, 10000);

// Increase heap size
// node --max-old-space-size=4096 app.js

// Common memory leak causes:
// - Global variables accumulating data
// - Event listeners not removed
// - Closures retaining references
// - Caching without bounds
```

---

## 14. Interview Questions & Answers

### Beginner

---

**Q1: What is Node.js? Is it a programming language?**

No, Node.js is not a programming language. It's a **runtime environment** that allows JavaScript to run outside the browser. It's built on Chrome's V8 JavaScript engine and provides APIs for file system access, networking, and other server-side operations that browsers don't expose.

---

**Q2: What is the event loop?**

The event loop is the mechanism that allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded. It continuously checks for pending callbacks and executes them when the call stack is empty.

The loop has phases: timers -> pending callbacks -> poll (I/O) -> check (setImmediate) -> close callbacks. Between each phase, microtasks (process.nextTick, Promise callbacks) are processed.

---

**Q3: What is the difference between `require` and `import`?**

- `require` is CommonJS (CJS) — synchronous, dynamic, traditional Node.js
- `import` is ES Modules (ESM) — asynchronous, static (analyzed at parse time), supports tree-shaking

```js
// CJS
const express = require('express');

// ESM
import express from 'express';
```

ESM is the modern standard. Use `"type": "module"` in package.json or `.mjs` extension.

---

**Q4: What is `process.nextTick()` and how does it differ from `setImmediate()`?**

- `process.nextTick()`: Executes **before** the event loop continues to the next phase. It runs at the end of the current operation, before any I/O.
- `setImmediate()`: Executes in the **check** phase of the event loop, after the poll phase (I/O).

```js
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('nextTick'));
// Output: nextTick, immediate
```

`process.nextTick` has higher priority. Overusing it can starve I/O.

---

**Q5: What are streams in Node.js?**

Streams are objects for handling reading/writing data continuously, chunk by chunk, instead of loading everything into memory. There are four types:

1. **Readable** — data source (reading a file)
2. **Writable** — data sink (writing to a file)
3. **Duplex** — both (TCP socket)
4. **Transform** — modifies data passing through (compression)

Streams are essential for processing large files, HTTP responses, and real-time data without consuming excessive memory.

---

### Intermediate

---

**Q6: Explain the Node.js architecture. How does it handle concurrent requests?**

Node.js uses a single-threaded event loop model:

1. **Main thread** runs JavaScript and the event loop
2. **libuv** provides a thread pool (default 4 threads) for blocking operations (file I/O, DNS, crypto)
3. **OS async APIs** handle network I/O (epoll/kqueue/IOCP) without threads

When a request arrives:
1. JavaScript callback is registered
2. I/O operation is delegated to libuv or OS
3. Event loop continues to handle other requests
4. When I/O completes, callback is queued and executed

This allows handling thousands of concurrent connections with a single thread, as long as JavaScript execution is fast (non-blocking).

---

**Q7: What is the difference between `spawn`, `exec`, `execFile`, and `fork`?**

| Method | Shell | Output | Use case |
|--------|-------|--------|----------|
| `exec` | Yes | Buffered | Short commands, need full output |
| `execFile` | No | Buffered | Run a specific file, no shell injection risk |
| `spawn` | No | Streamed | Long-running processes, large output |
| `fork` | No | Streamed + IPC | Spawn Node.js processes with message passing |

```js
exec('ls -la', (err, stdout) => {});           // shell, buffered
spawn('ls', ['-la']);                            // no shell, streamed
fork('./worker.js');                             // Node.js process with IPC
```

---

**Q8: How would you handle uncaught exceptions and unhandled promise rejections?**

```js
// Uncaught exceptions - log and exit (state may be corrupted)
process.on('uncaughtException', (err) => {
  logger.fatal('Uncaught exception:', err);
  process.exit(1);  // must exit - state is unreliable
});

// Unhandled rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
  // In newer Node.js versions, this also crashes by default
});
```

Best practice: Use a process manager (PM2, systemd) that auto-restarts on crash. Always handle errors at the source — these handlers are last resort.

---

**Q9: What is the `cluster` module?**

The cluster module allows running multiple instances of the same Node.js server, sharing the same port. The primary process forks worker processes (one per CPU core), and the OS load-balances connections across workers.

```js
if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) cluster.fork();
} else {
  app.listen(3000);
}
```

This overcomes Node.js's single-threaded limitation for CPU-bound work and provides better utilization of multi-core systems.

---

**Q10: Explain the difference between `Buffer` and `String` in Node.js.**

- `Buffer`: Raw binary data (bytes). Fixed size. Used for I/O operations (file reading, network data).
- `String`: Text data encoded in UTF-16. Variable size. Used for human-readable text.

```js
const buf = Buffer.from('Hello');
buf.length;         // 5 (bytes)
const str = buf.toString('utf8');
str.length;         // 5 (characters)

// Multi-byte characters differ
const emoji = Buffer.from('Hi');
emoji.length;       // 6 bytes (emoji is 4 bytes in UTF-8)
'Hi'.length;       // 3 characters (emoji counts as 2 in JS)
```

Buffers are essential when working with binary protocols, file I/O, and streams.

---

### Advanced

---

**Q11: How does the V8 engine manage memory? Explain garbage collection.**

V8 divides the heap into generations:

1. **Young generation** (new space): Short-lived objects. Collected frequently with **Scavenge** (semi-space copying GC). Fast (~1-2ms).

2. **Old generation** (old space): Objects that survived multiple young-gen collections. Collected with **Mark-Sweep-Compact** (less frequently, more expensive).

3. **Large object space**: Objects larger than a threshold. Never moved by GC.

V8 uses **incremental marking** and **concurrent sweeping** to minimize GC pauses. You can tune with flags:
```bash
node --max-old-space-size=4096 app.js    # 4GB heap
node --expose-gc app.js                   # expose global.gc()
```

---

**Q12: What are Worker Threads? When would you use them over child processes?**

Worker threads run JavaScript in parallel threads within the same process, sharing memory via `SharedArrayBuffer`.

Use worker threads when:
- CPU-intensive computation (parsing, compression, number crunching)
- Need shared memory (SharedArrayBuffer)
- Want lower overhead than child processes

Use child processes when:
- Running external programs
- Need complete isolation (separate memory, separate V8)
- Running untrusted code

```js
// Worker threads share the process
const { Worker } = require('worker_threads');
const worker = new Worker('./compute.js');

// Transferable objects (zero-copy)
const buffer = new SharedArrayBuffer(1024);
worker.postMessage({ buffer });
```

---

**Q13: How would you debug a memory leak in a Node.js application?**

1. **Detect**: Monitor `process.memoryUsage().heapUsed` over time. If it grows continuously, there's a leak.

2. **Heap snapshots**: Use `--inspect` flag and Chrome DevTools:
   ```bash
   node --inspect app.js
   # Open chrome://inspect, take heap snapshots, compare
   ```

3. **Programmatic**: Use `v8.writeHeapSnapshot()` or `heapdump` module to capture snapshots at specific times.

4. **Common causes**:
   - Global variables accumulating data
   - Event listeners not removed
   - Closures holding references to large objects
   - Caches without eviction (use LRU cache)
   - Circular references in complex object graphs

5. **Tools**: Chrome DevTools (heap profiler), `clinic.js` (flamegraphs), `memwatch-next`.

---

**Q14: Explain the N-API and native addons.**

N-API (Node-API) is a stable C/C++ API for building native Node.js addons. It's ABI-stable — addons compiled for one Node.js version work on future versions without recompilation.

Use cases:
- Performance-critical code (image processing, cryptography)
- Binding to existing C/C++ libraries
- Hardware access

```cpp
// native_addon.cc
#include <napi.h>
Napi::Number Add(const Napi::CallbackInfo& info) {
  double a = info[0].As<Napi::Number>().DoubleValue();
  double b = info[1].As<Napi::Number>().DoubleValue();
  return Napi::Number::New(info.Env(), a + b);
}
```

---

**Q15: How would you implement graceful shutdown in a production Node.js server?**

```js
const server = app.listen(3000);
let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  // 1. Stop accepting new connections
  server.close();

  // 2. Set a hard timeout (force exit if graceful fails)
  const forceExit = setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);

  try {
    // 3. Wait for in-flight requests to complete
    await new Promise((resolve) => server.on('close', resolve));

    // 4. Close database connections
    await database.disconnect();

    // 5. Close message queues, cache connections, etc.
    await redis.quit();

    console.log('Graceful shutdown complete');
    clearTimeout(forceExit);
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

Key points: stop accepting connections, drain in-flight requests, close external resources, set a hard timeout.

---

**Q16: Explain event-driven architecture patterns in Node.js.**

Node.js naturally supports event-driven patterns:

1. **Observer pattern** (EventEmitter): Components publish/subscribe to events
   ```js
   orderService.on('orderCreated', sendEmail);
   orderService.on('orderCreated', updateInventory);
   ```

2. **Pub/Sub with message brokers**: Decouple services via Redis, RabbitMQ, Kafka
   ```js
   // Publisher
   redis.publish('orders', JSON.stringify(order));
   // Subscriber (different process)
   redis.subscribe('orders', (msg) => processOrder(JSON.parse(msg)));
   ```

3. **Event sourcing**: Store state changes as events, rebuild state by replaying

4. **CQRS**: Separate read/write models, connected by events

These patterns enable loose coupling, scalability, and resilience in microservices architectures.

---

**Q17: What is backpressure in streams and how do you handle it?**

Backpressure occurs when a writable stream can't consume data as fast as a readable stream produces it. Without handling it, data buffers in memory indefinitely.

```js
// BAD: Ignores backpressure
readable.on('data', (chunk) => {
  writable.write(chunk);                    // might return false!
});

// GOOD: Use pipe (handles backpressure automatically)
readable.pipe(writable);

// GOOD: Manual handling
readable.on('data', (chunk) => {
  const canContinue = writable.write(chunk);
  if (!canContinue) {
    readable.pause();                       // stop reading
    writable.once('drain', () => {
      readable.resume();                    // resume when writable catches up
    });
  }
});
```

`pipeline()` from `stream/promises` handles backpressure and error propagation automatically — use it over raw `pipe()`.

---

**Q18: How does `libuv` work under the hood?**

libuv is the C library that provides Node.js's event loop and async I/O:

1. **Event loop**: Implements the main loop with its phases (timers, I/O poll, check, close)
2. **Thread pool**: Default 4 threads (configurable via `UV_THREADPOOL_SIZE`) for:
   - File system operations
   - DNS lookups (`dns.lookup`)
   - Some crypto operations
   - User-defined async tasks
3. **OS async APIs**:
   - Linux: `epoll`
   - macOS: `kqueue`
   - Windows: `IOCP`
   - These handle network I/O without threads

The distinction matters: network I/O scales to thousands of connections (OS-level), while file I/O is limited by thread pool size.

---

## 15. Tricky Output Questions

Practice questions testing your understanding of Node.js event loop phases, `process.nextTick`, `setImmediate`, streams, and async patterns.

### Event Loop Ordering

---

**Q1: setTimeout vs setImmediate**

```js
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
```

**Output:** Non-deterministic — could be either order.

When run in the main module, the order depends on process performance. `setTimeout(fn, 0)` is actually `setTimeout(fn, 1)` internally. If the event loop enters the timer phase before 1ms elapses, `setImmediate` fires first. If not, `setTimeout` fires first.

---

**Q2: setTimeout vs setImmediate inside I/O callback**

```js
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
});
```

**Output:**
```
immediate
immediate
```

Wait — actually:
```
immediate
timeout
```

Inside an I/O callback, `setImmediate` **always** fires before `setTimeout`. After the poll phase completes, the check phase (where `setImmediate` lives) runs before the event loop wraps back to timers.

---

**Q3: process.nextTick vs Promise vs setTimeout**

```js
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

process.nextTick(() => console.log("4"));

console.log("5");
```

**Output:**
```
1
5
4
3
2
```

Execution order: Synchronous (`1`, `5`) → `nextTick` queue (`4`) → microtask/Promise queue (`3`) → timer phase (`2`). `process.nextTick` always fires before Promises.

---

**Q4: Nested nextTick — starvation risk**

```js
setImmediate(() => console.log("immediate"));

process.nextTick(() => {
  console.log("tick 1");
  process.nextTick(() => console.log("tick 2"));
});

console.log("sync");
```

**Output:**
```
sync
tick 1
tick 2
immediate
```

`process.nextTick` callbacks are processed **completely** before moving to the next event loop phase — including any new nextTick calls added during processing. This can starve I/O if abused.

---

**Q5: Multiple timers with same delay**

```js
setTimeout(() => console.log("A"), 0);
setTimeout(() => console.log("B"), 0);
setTimeout(() => console.log("C"), 0);

Promise.resolve().then(() => console.log("D"));
process.nextTick(() => console.log("E"));
```

**Output:**
```
E
D
A
B
C
```

`nextTick` (E) runs first, then microtask/Promise (D), then all timers in FIFO order (A, B, C).

---

### Async Patterns

---

**Q6: async/await with process.nextTick**

```js
async function main() {
  console.log("A");

  await new Promise(resolve => {
    process.nextTick(() => {
      console.log("B");
      resolve();
    });
  });

  console.log("C");
}

main();
console.log("D");
```

**Output:**
```
A
D
B
C
```

`A` is synchronous. `await` pauses `main()`. `D` runs synchronously. `nextTick` fires `B` and resolves the promise. Then `C` runs from the microtask queue.

---

**Q7: Event emitter — sync or async?**

```js
const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('data', () => console.log("listener"));

console.log("before");
emitter.emit('data');
console.log("after");
```

**Output:**
```
before
listener
after
```

Event emitter listeners are called **synchronously** when `emit()` is called. This surprises many people who assume Node.js events are async.

---

**Q8: Error event without listener**

```js
const EventEmitter = require('events');
const emitter = new EventEmitter();

console.log("before");

try {
  emitter.emit('error', new Error('boom'));
} catch (err) {
  console.log("caught:", err.message);
}

console.log("after");
```

**Output:**
```
before
caught: boom
after
```

If no listener is registered for `'error'` events, Node.js throws the error. Since `emit` is synchronous, the `try/catch` works. Without the `try/catch`, this would crash the process.

---

### Streams & Buffers

---

**Q9: Stream ordering — readable events**

```js
const { Readable } = require('stream');

const readable = new Readable({
  read() {
    this.push("hello");
    this.push(null);
  }
});

readable.on('data', (chunk) => console.log("data:", chunk.toString()));
readable.on('end', () => console.log("end"));
readable.on('close', () => console.log("close"));

console.log("sync");
```

**Output:**
```
sync
data: hello
end
close
```

Stream events are emitted asynchronously (on the next tick), so `sync` prints first. Events fire in order: `data` for each chunk, `end` when no more data, `close` when the stream is fully closed.

---

**Q10: Buffer comparison**

```js
const buf1 = Buffer.from("abc");
const buf2 = Buffer.from("abc");

console.log(buf1 === buf2);
console.log(buf1.equals(buf2));
console.log(Buffer.compare(buf1, buf2));
```

**Output:**
```
false
true
0
```

`===` compares references (different Buffer objects). `.equals()` compares contents. `Buffer.compare()` returns `0` for equal, negative if first is less, positive if first is greater.

---

### Module System

---

**Q11: require caching — how many times does the module execute?**

```js
// counter.js
let count = 0;
count++;
console.log("loaded, count:", count);
module.exports = { count };

// main.js
const a = require('./counter');
const b = require('./counter');
console.log(a.count, b.count);
console.log(a === b);
```

**Output:**
```
loaded, count: 1
1 1
true
```

`require()` caches modules after first load. The second `require('./counter')` returns the cached export — the module code does NOT execute again. Both `a` and `b` are the same object.

---

**Q12: Circular dependencies**

```js
// a.js
console.log("a: start");
exports.value = "A";
const b = require('./b');
console.log("a: b.value =", b.value);

// b.js
console.log("b: start");
const a = require('./a');
console.log("b: a.value =", a.value);
exports.value = "B";

// main.js
require('./a');
```

**Output:**
```
a: start
b: start
b: a.value = A
a: b.value = B
```

When `a.js` requires `b.js`, Node gives `b` the **partially completed** exports of `a` (which already has `value = "A"`). After `b` finishes, `a` continues and sees `b.value = "B"`.

---

### Key Rules

```
Node.js Output Cheat Sheet:
1. Execution: sync → process.nextTick → Promises/microtasks → timers → I/O → setImmediate
2. Inside I/O callbacks: setImmediate always fires before setTimeout
3. process.nextTick drains fully before moving to next phase (starvation risk)
4. EventEmitter.emit() is synchronous
5. Unhandled 'error' events throw (crash the process)
6. require() caches — modules execute once
7. Circular dependencies get partial exports
8. Stream events (data, end, close) fire asynchronously
9. Buffer === compares references, .equals() compares contents
10. setTimeout(fn, 0) is actually setTimeout(fn, 1)
```

---

## References

- [Node.js Documentation](https://nodejs.org/docs/latest/api) — Official API reference
- [Node.js Guides](https://nodejs.org/en/learn) — Getting started and best practices
- [Node.js GitHub](https://github.com/nodejs/node) — Source code and release notes
