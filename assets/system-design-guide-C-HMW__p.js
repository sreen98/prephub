const e=`# System Design Guide

A comprehensive guide to system design concepts, patterns, and interview preparation for full-stack developers.

---

## Table of Contents

1. [Fundamentals](#1-fundamentals)
2. [Scalability](#2-scalability)
3. [Load Balancing](#3-load-balancing)
4. [Caching](#4-caching)
5. [Database Design](#5-database-design)
6. [Message Queues & Event-Driven Architecture](#6-message-queues-event-driven-architecture)
7. [Microservices Architecture](#7-microservices-architecture)
8. [API Gateway](#8-api-gateway)
9. [CDN (Content Delivery Network)](#9-cdn-content-delivery-network)
10. [Rate Limiting & Throttling](#10-rate-limiting-throttling)
11. [Monitoring & Observability](#11-monitoring-observability)
12. [Security](#12-security)
13. [Real-Time Communication](#13-real-time-communication)
14. [File Storage & Upload](#14-file-storage-upload)
15. [Search Systems](#15-search-systems)
16. [Common System Design Patterns](#16-common-system-design-patterns)
17. [Design Case Studies](#17-design-case-studies)
18. [Interview Questions](#18-interview-questions)

---

## 1. Fundamentals

### What is System Design?

System design is deciding which pieces a system is made of (servers, databases, caches, queues), how they talk to each other, and how data moves between them, so that it meets its requirements: how many users, how fast, how reliable. In an interview there is rarely one correct answer. What is graded is whether you can name the trade-off behind each choice: why this database, why a cache here, and what breaks first when traffic grows ten times.

### Key Concepts

#### Latency vs Throughput

- **Latency**: Time taken for a single request to complete (milliseconds)
- **Throughput**: Number of requests a system can handle per unit time (requests/second)

The two are independent: a system can handle 10,000 requests a second while each one still takes 2 seconds. Memorise the numbers below as orders of magnitude, because they explain most design choices. RAM is roughly a thousand times faster than an SSD, and one round trip across the internet costs as much as hundreds of round trips inside a datacenter. That gap is why caches and CDNs exist.

\`\`\`
Latency Examples:
- L1 cache reference:          0.5 ns
- RAM reference:               100 ns
- SSD read:                    150 us
- HDD seek:                    10 ms
- Round trip within datacenter: 0.5 ms
- Internet round trip:          150 ms
\`\`\`

#### CAP Theorem

A distributed system can only guarantee two of three properties. The useful way to read it: a partition (the network between your nodes failing, so some of them cannot talk to the others) is not optional once data lives on more than one machine. So the real choice is what the system does *while* a partition is happening: refuse some requests so it never returns wrong data (CP), or keep answering and risk returning stale data (AP).

- **Consistency**: Every read receives the most recent write
- **Availability**: Every request receives a response (not guaranteed to be the latest)
- **Partition Tolerance**: System continues to operate despite network partitions

\`\`\`
CP Systems: HBase, ZooKeeper, etcd, MongoDB (majority concerns)
  - Sacrifice availability during partitions
  - Always return consistent data

AP Systems: Cassandra, DynamoDB, CouchDB
  - Sacrifice consistency during partitions
  - Always respond, but data may be stale

CA Systems: Traditional RDBMS (single node)
  - Not practical in distributed systems
  - Network partitions are inevitable
\`\`\`

Treat the product labels above as rough. Most databases let you tune this per operation (Cassandra's consistency level per query, MongoDB's read and write concerns), so one database can behave as CP for one query and AP for another. Redis is deliberately not listed as CP, although it often is: its replication is asynchronous, so a failover can lose writes that were already acknowledged, and a system that can lose acknowledged writes is not giving you consistency.

#### ACID vs BASE

These are two answers to "what does the database promise after a write?" ACID, the guarantee relational databases give, promises that a transaction happens completely or not at all, and that once committed everyone sees it. BASE, the looser model many distributed NoSQL stores use, promises that the system keeps answering and that copies *will* agree eventually, but a read straight after a write may still see the old value. You pay for ACID with coordination between nodes, which costs speed and availability. You pay for BASE in application code that has to cope with stale reads.

\`\`\`
ACID (Traditional RDBMS):
- Atomicity:    All or nothing transactions
- Consistency:  Data always valid according to rules
- Isolation:    Concurrent transactions don't interfere
- Durability:   Committed data survives failures

BASE (NoSQL / Distributed):
- Basically Available:  System always responds
- Soft state:           State may change over time
- Eventually consistent: System becomes consistent eventually
\`\`\`

### Estimation & Back-of-the-Envelope Calculations

Interviewers ask for rough numbers so that your design fits the load: 100 requests a second fits on one server, 100,000 does not. Round aggressively, because the goal is the order of magnitude, not the digit. The one habit worth having: divide daily volume by about 100,000 seconds to get average requests per second, then multiply by 2 to 3 for the peak.

\`\`\`
Powers of 2:
- 2^10 = 1 Thousand    = 1 KB
- 2^20 = 1 Million     = 1 MB
- 2^30 = 1 Billion     = 1 GB
- 2^40 = 1 Trillion    = 1 TB

Common Estimations:
- 1 day = 86,400 seconds ~ 100K seconds
- 1 month ~ 2.5 million seconds
- 1 year ~ 30 million seconds

QPS (Queries Per Second):
- 1 million DAU, each makes 10 requests/day
- QPS = 10M / 86400 ~ 116 QPS
- Peak QPS = QPS * 2-3 = ~300 QPS
\`\`\`

---

## 2. Scalability

### Vertical Scaling (Scale Up)

Add more power to an existing machine (CPU, RAM, storage). It is the right first move more often than people admit: one bigger database server avoids every distributed-systems problem in this guide, until you reach the largest machine you can buy.

\`\`\`
Pros:
- Simple to implement
- No application code changes
- No distributed system complexity

Cons:
- Hardware limits (can't scale indefinitely)
- Single point of failure
- Expensive at higher tiers
- Downtime during upgrades
\`\`\`

### Horizontal Scaling (Scale Out)

Add more machines to the pool. The catch is that the machines must be interchangeable, so that any server can take any request. That means nothing a user needs can live only in one server's memory: sessions move to Redis or a cookie, uploaded files move to object storage.

\`\`\`
Pros:
- Virtually unlimited scaling
- Better fault tolerance
- Cost-effective (commodity hardware)
- No downtime for scaling

Cons:
- Application must handle distributed state
- More complex infrastructure
- Data consistency challenges
- Need load balancing
\`\`\`

### Database Scaling Strategies

#### Read Replicas

Most applications read far more than they write, so you send every write to one primary database and copy its data to replicas that serve reads. The trade-off is replication lag: a replica runs milliseconds to seconds behind, so a user who saves a change and immediately reloads may read the old value from a replica. The usual fix is to send that user's reads to the primary for a short while after they write.

\`\`\`mermaid
graph TD
    W["Writes"] --> P["Primary Database"]
    P -->|replication| R1["Replica 1"]
    P -->|replication| R2["Replica 2"]
    R1 --> RD1["Reads"]
    R2 --> RD2["Reads"]
    style P fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b
    style R1 fill:#ecfdf5,stroke:#10b981,color:#064e3b
    style R2 fill:#ecfdf5,stroke:#10b981,color:#064e3b
\`\`\`

#### Sharding (Horizontal Partitioning)

Sharding splits one table across several databases, each holding a slice of the rows, so that no single machine has to store or serve all of it. The whole design hinges on the shard key, the field that decides which shard a row lives on. Hash-based spreads rows evenly, but a range query ("all users created this week") has to ask every shard. Range-based keeps ranges together, but when the key only grows (a sequential id, a date), every new row lands on the last shard. Directory-based uses a lookup table, which is flexible, but that table becomes one more thing that must be fast and must never go down.

\`\`\`javascript
// Hash-based sharding
function getShard(userId) {
  const shardCount = 4;
  return hash(userId) % shardCount;
}

// Range-based sharding
function getShardV2(userId) {
  if (userId < 1000000) return 'shard_1';
  if (userId < 2000000) return 'shard_2';
  if (userId < 3000000) return 'shard_3';
  return 'shard_4';
}

// Directory-based sharding
const shardMap = {
  'US': 'shard_us',
  'EU': 'shard_eu',
  'ASIA': 'shard_asia',
};
\`\`\`

#### Consistent Hashing

Consistent hashing spreads keys across servers so that adding or removing a server moves only a small fraction of the keys. With plain \`hash(key) % N\`, changing N changes the answer for almost every key, so every cache entry misses at once or almost every row has to migrate. On a hash ring, a key belongs to the next server clockwise, so a new server only takes over keys from its one neighbour. Virtual nodes (placing each server at many points on the ring) stop one unlucky server from owning a huge arc of it.

\`\`\`
Traditional Hashing Problem:
- 4 servers: hash(key) % 4
- Add 1 server: hash(key) % 5
- Almost ALL keys need to be remapped!

Consistent Hashing:
- Arrange servers on a hash ring (0 to 2^32)
- Each key maps to the next server clockwise
- Adding/removing a server only affects neighbors
- Virtual nodes improve distribution

         Server A
           |
    ───────●───────
   /       |       \\
  ●        |        ●  Server D
  Server B |
   \\       |       /
    ───────●───────
           |
         Server C
\`\`\`

---

## 3. Load Balancing

### Types of Load Balancers

A load balancer spreads incoming requests across a pool of servers and stops sending traffic to the ones that fail. The main choice is how much of each request it reads. A Layer 4 balancer (the transport layer) sees only IP addresses and ports, so it is fast but cannot route by URL. A Layer 7 balancer (the application layer) reads the HTTP request, so it can send \`/api\` to one pool and \`/images\` to another, at the cost of parsing every request.

\`\`\`
Layer 4 (Transport Layer):
- Routes based on IP and TCP/UDP port
- Faster (no content inspection)
- Less flexible
- Examples: AWS NLB, HAProxy (TCP mode)

Layer 7 (Application Layer):
- Routes based on HTTP headers, URL, cookies
- More flexible (content-based routing)
- Can do SSL termination
- Examples: AWS ALB, Nginx, HAProxy (HTTP mode)
\`\`\`

### Load Balancing Algorithms

Round robin is fine when requests cost roughly the same. Least connections is better when some requests are slow (uploads, reports), because it stops piling new work onto a server that is still busy. IP hash sends the same client to the same server, which you only need when servers keep per-user state in memory. Needing it is usually a sign that the state should move to a shared store.

\`\`\`javascript
// 1. Round Robin
class RoundRobinBalancer {
  constructor(servers) {
    this.servers = servers;
    this.current = 0;
  }

  getNext() {
    const server = this.servers[this.current];
    this.current = (this.current + 1) % this.servers.length;
    return server;
  }
}

// 2. Weighted Round Robin
class WeightedRoundRobin {
  constructor(servers) {
    // servers = [{ address: 'A', weight: 3 }, { address: 'B', weight: 1 }]
    this.pool = [];
    for (const server of servers) {
      for (let i = 0; i < server.weight; i++) {
        this.pool.push(server.address);
      }
    }
    this.current = 0;
  }

  getNext() {
    const server = this.pool[this.current];
    this.current = (this.current + 1) % this.pool.length;
    return server;
  }
}

// 3. Least Connections
class LeastConnectionsBalancer {
  constructor(servers) {
    this.connections = new Map(servers.map(s => [s, 0]));
  }

  getNext() {
    let min = Infinity;
    let selected = null;
    for (const [server, count] of this.connections) {
      if (count < min) {
        min = count;
        selected = server;
      }
    }
    this.connections.set(selected, min + 1);
    return selected;
  }

  release(server) {
    const count = this.connections.get(server);
    this.connections.set(server, Math.max(0, count - 1));
  }
}

// 4. IP Hash (sticky sessions)
function ipHashBalance(clientIP, servers) {
  const hash = simpleHash(clientIP);
  return servers[hash % servers.length];
}
\`\`\`

### Health Checks

A health check is the load balancer calling each server on a schedule and taking it out of the pool after a few failures, so users are never routed to a dead machine. The pass and fail thresholds exist so that one slow response does not flap a server in and out. Note that the active \`health_check\` directive shown here is an NGINX Plus (the commercial edition) feature; open-source Nginx marks servers down passively, from failures on real traffic, using \`max_fails\` and \`fail_timeout\`.

\`\`\`nginx
# Nginx health check configuration
upstream backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000 backup;

    # Health check every 10s, 3 failures = mark down
    health_check interval=10s fails=3 passes=2;
}
\`\`\`

---

## 4. Caching

### Caching Strategies

A cache is a faster copy of data kept in front of a slower source, usually Redis in front of a database. The three strategies below differ in one thing: when the cache gets written, and therefore what happens when the cache and the database disagree.

#### Cache-Aside (Lazy Loading)

The application checks the cache first, and on a miss reads the database and fills the cache itself. Only data someone actually asks for gets cached, and if Redis goes down the app still works, just slower. The cost: the first read of anything is slow, and a cached value stays stale until its TTL (time to live, the expiry you set) runs out or you delete the key when the data changes.

\`\`\`javascript
async function getUser(userId) {
  // 1. Check cache
  const cached = await redis.get(\`user:\${userId}\`);
  if (cached) return JSON.parse(cached);

  // 2. Cache miss — read from DB
  const user = await db.users.findById(userId);

  // 3. Populate cache
  await redis.setex(\`user:\${userId}\`, 3600, JSON.stringify(user));

  return user;
}
\`\`\`

#### Write-Through

Every write goes to the database and the cache together, so a read straight after a write sees the new value. The cost is slower writes, and a cache that fills up with data nobody may ever read.

\`\`\`javascript
async function updateUser(userId, data) {
  // 1. Write to DB
  const user = await db.users.findByIdAndUpdate(userId, data, { new: true });

  // 2. Write to cache (synchronously)
  await redis.setex(\`user:\${userId}\`, 3600, JSON.stringify(user));

  return user;
}
\`\`\`

#### Write-Behind (Write-Back)

The write goes to the cache only, and a background worker copies it to the database later. Writes are very fast, but if the cache dies before the worker runs, those writes are gone. Use it for data you can afford to lose, such as view counters, never for orders or payments.

\`\`\`javascript
async function updateUser(userId, data) {
  // 1. Write to cache immediately
  await redis.setex(\`user:\${userId}\`, 3600, JSON.stringify(data));

  // 2. Queue async write to DB
  await messageQueue.publish('db-writes', {
    collection: 'users',
    operation: 'update',
    id: userId,
    data,
  });
}

// Background worker processes the queue
async function processDbWrite(message) {
  await db.users.findByIdAndUpdate(message.id, message.data);
}
\`\`\`

### Cache Eviction Policies

\`\`\`
LRU (Least Recently Used):
- Evict the item that was accessed longest ago
- Good for: most use cases, temporal locality

LFU (Least Frequently Used):
- Evict the item with the fewest accesses
- Good for: items with stable access patterns

TTL (Time to Live):
- Items expire after a set duration
- Good for: data that changes at known intervals

FIFO (First In, First Out):
- Evict the oldest item
- Simple but less effective
\`\`\`

### Multi-Level Caching

Each layer answers what it can and passes the rest down, so the database only sees requests that missed every cache above it. The closer a layer is to the user, the faster it is and the harder it is to invalidate: you can delete a Redis key instantly, but you cannot reach into a user's browser cache.

\`\`\`
Request → Browser Cache (L1)
       → CDN Cache (L2)
       → API Gateway Cache (L3)
       → Application Cache / Redis (L4)
       → Database Query Cache (L5)
       → Database
\`\`\`

### Cache Invalidation Patterns

Invalidation is deciding when a cached copy is no longer true. A TTL is the safety net: anything cached is wrong for at most that many seconds. Deleting keys on write makes a change visible immediately, but you must remember every key that contains the data, which is why the example deletes \`product-list\` as well as the product itself. Tags group keys ("everything about product 42") so one call clears them all.

\`\`\`javascript
// 1. TTL-based expiration
await redis.setex('key', 300, 'value'); // expires in 5 min

// 2. Event-driven invalidation
async function updateProduct(productId, data) {
  await db.products.update(productId, data);
  await redis.del(\`product:\${productId}\`);
  await redis.del('product-list'); // invalidate list cache too
}

// 3. Tag-based invalidation
async function invalidateByTag(tag) {
  const keys = await redis.smembers(\`tag:\${tag}\`);
  if (keys.length > 0) {
    await redis.del(...keys);
    await redis.del(\`tag:\${tag}\`);
  }
}

// When caching, register tags
async function cacheWithTags(key, value, tags) {
  await redis.setex(key, 3600, JSON.stringify(value));
  for (const tag of tags) {
    await redis.sadd(\`tag:\${tag}\`, key);
  }
}
\`\`\`

### Redis Caching in Node.js

\`\`\`javascript
import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

// Cache middleware for Express
function cacheMiddleware(ttl = 300) {
  return async (req, res, next) => {
    const key = \`cache:\${req.originalUrl}\`;
    const cached = await redis.get(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      redis.setex(key, ttl, JSON.stringify(data));
      return originalJson(data);
    };

    next();
  };
}

// Usage
app.get('/api/products', cacheMiddleware(600), getProducts);
\`\`\`

---

## 5. Database Design

### SQL vs NoSQL Decision Matrix

The question is really about how you access the data. Relational databases are built for data with relationships that you query in many different ways. Document and key-value stores are built for data you usually fetch whole, by one key, at a scale where spreading it over many machines matters. The lists below are signals, not rules: one system often uses several of these side by side.

\`\`\`
Choose SQL (PostgreSQL, MySQL) when:
- Complex queries with JOINs
- ACID transactions required
- Data has clear relationships
- Schema is well-defined and stable
- Reporting / analytics needs

Choose NoSQL (MongoDB, DynamoDB) when:
- Schema evolves frequently
- Massive scale needed (horizontal)
- Hierarchical / nested data
- High write throughput
- Low-latency reads for simple queries

Choose In-Memory (Redis, Memcached) when:
- Sub-millisecond latency needed
- Session storage
- Caching layer
- Real-time leaderboards / counters
- Pub/sub messaging

Choose Graph DB (Neo4j, Amazon Neptune) when:
- Complex relationship traversals
- Social networks
- Recommendation engines
- Fraud detection
\`\`\`

### Database Indexing

An index is a sorted copy of one or more fields with a pointer back to each record, so the database can jump straight to matching rows instead of scanning the whole collection, like the index at the back of a book. Every index slows down writes and takes storage, so add them for the queries you actually run. "Order matters" on a compound index means \`{ userId, createdAt }\` helps queries that filter by \`userId\` (and then sort by date), but does nothing for a query that filters by \`createdAt\` alone.

\`\`\`javascript
// MongoDB index examples

// Single field index
db.users.createIndex({ email: 1 }); // ascending

// Compound index (order matters!)
db.orders.createIndex({ userId: 1, createdAt: -1 });

// Unique index
db.users.createIndex({ email: 1 }, { unique: true });

// Text index (full-text search)
db.articles.createIndex({ title: 'text', body: 'text' });

// TTL index (auto-delete after time)
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });

// Partial index (index subset of documents)
db.orders.createIndex(
  { status: 1 },
  { partialFilterExpression: { status: 'active' } }
);
\`\`\`

### Replication

Replication keeps copies of the same data on several servers, for two reasons: surviving the loss of a machine, and spreading reads. With a single primary, write conflicts cannot happen, because only one node accepts writes. With several primaries, two users can change the same record on different nodes at the same moment, and you need a rule for which change wins.

\`\`\`
Primary-Replica (Master-Slave):

  Client          Client          Client
    │               │               │
    │ write         │ read          │ read
    ▼               ▼               ▼
┌────────┐    ┌──────────┐    ┌──────────┐
│ Primary │───│ Replica 1 │───│ Replica 2 │
│ (Write) │   │  (Read)   │   │  (Read)   │
└────────┘    └──────────┘    └──────────┘
      │           replication
      └──────────────────────────────────┘

Primary-Primary (Multi-Master):
- Both nodes accept writes
- Conflict resolution needed
- Higher availability
- More complex
\`\`\`

---

## 6. Message Queues & Event-Driven Architecture

### Message Queue Pattern

A message queue lets one part of the system hand work to another without waiting for it. The API puts a job on the queue and answers the user immediately; a worker picks the job up when it has capacity. That buys three things: slow work (sending email, resizing images) leaves the request path, a burst of traffic waits in the queue instead of overloading the workers, and a failed job can be retried without the user submitting again.

\`\`\`mermaid
graph LR
    P["Producer<br/>(API)"] --> Q["Queue<br/>(Redis / SQS / RabbitMQ)"]
    Q --> C["Consumer<br/>(Worker)"]
    style P fill:#fef3c7,stroke:#f59e0b,color:#78350f
    style Q fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b
    style C fill:#ecfdf5,stroke:#10b981,color:#064e3b
\`\`\`

### Use Cases

\`\`\`
1. Async Processing:
   User uploads resume → Queue → Worker parses & indexes

2. Decoupling Services:
   Order Service → Queue → Inventory Service
                        → Payment Service
                        → Notification Service

3. Rate Limiting:
   Burst of requests → Queue → Process at steady rate

4. Retry Logic:
   Failed job → Dead letter queue → Retry with backoff
\`\`\`

A dead letter queue is where a job goes after failing too many times, so one broken message stops blocking the rest and someone can inspect it later.

### Bull Queue with Redis (Node.js)

Bull is a Node.js job-queue library that stores its jobs in Redis. The options worth noticing: \`attempts\` and \`backoff\` retry a failing job with growing delays, and the \`5\` passed to \`process\` is how many jobs one worker runs at the same time.

\`\`\`javascript
import Queue from 'bull';

// Create a queue
const emailQueue = new Queue('email', {
  redis: { host: 'localhost', port: 6379 },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

// Producer: Add jobs
async function sendWelcomeEmail(userId, email) {
  await emailQueue.add(
    'welcome',
    { userId, email, template: 'welcome' },
    { priority: 1, delay: 5000 } // send after 5s
  );
}

// Consumer: Process jobs
emailQueue.process('welcome', 5, async (job) => {
  const { userId, email, template } = job.data;
  await sendEmail(email, template);
  return { sent: true };
});

// Event listeners
emailQueue.on('completed', (job, result) => {
  console.log(\`Job \${job.id} completed:\`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(\`Job \${job.id} failed:\`, err.message);
});
\`\`\`

### Event-Driven Architecture

In an event-driven design, a service announces that something happened ("order created") instead of calling every service that cares. The order code does not know that inventory, email and analytics exist, so adding a fourth reaction means adding a subscriber, not editing the publisher. This example is an in-process sketch: Node's \`EventEmitter\` only reaches listeners in the same process, which is why it also saves each event to the database. Between separate services you would use a broker such as Kafka, RabbitMQ or SNS.

\`\`\`javascript
// Event bus pattern
import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
  async publish(event, data) {
    // Persist event for replay
    await db.events.insertOne({
      event,
      data,
      timestamp: new Date(),
    });
    this.emit(event, data);
  }
}

const bus = new EventBus();

// Subscribe to events
bus.on('order.created', async (order) => {
  await inventoryService.reserve(order.items);
});

bus.on('order.created', async (order) => {
  await notificationService.sendConfirmation(order.userId);
});

bus.on('order.created', async (order) => {
  await analyticsService.trackOrder(order);
});

// Publish event
await bus.publish('order.created', {
  orderId: '123',
  userId: 'user-456',
  items: [{ sku: 'ITEM-1', qty: 2 }],
  total: 59.99,
});
\`\`\`

### Event Sourcing

Event sourcing stores every change as an event ("item added", "order paid") instead of only the current state, and rebuilds the current state by replaying those events in order. You get a complete audit history, and "what did this order look like last Tuesday?" becomes easy to answer. The costs: reading the current state needs a replay (so real systems also keep periodic snapshots), and events are permanent, so a badly designed event shape is hard to change later.

\`\`\`javascript
// Instead of storing current state, store all events
class OrderAggregate {
  constructor() {
    this.state = { status: 'new', items: [], total: 0 };
    this.events = [];
  }

  // Apply events to build state
  apply(event) {
    switch (event.type) {
      case 'ORDER_CREATED':
        this.state = { ...this.state, id: event.data.orderId, status: 'created' };
        break;
      case 'ITEM_ADDED':
        this.state.items.push(event.data.item);
        this.state.total += event.data.item.price;
        break;
      case 'ORDER_PAID':
        this.state.status = 'paid';
        break;
      case 'ORDER_SHIPPED':
        this.state.status = 'shipped';
        break;
    }
    this.events.push(event);
  }

  // Rebuild state from event history
  static fromEvents(events) {
    const order = new OrderAggregate();
    events.forEach((e) => order.apply(e));
    return order;
  }
}
\`\`\`

---

## 7. Microservices Architecture

### Monolith vs Microservices

A monolith is one application with one database. Microservices split the system into separately deployed services that each own their data and talk over the network. The diagrams show the structural difference; the trade-off is covered in Q9 below.

**Monolith:**

\`\`\`mermaid
graph TD
    subgraph Monolith["Application"]
        U["Users"] --- J["Jobs"] --- B["Billing"]
        DB["Shared Database"]
    end
    U --> DB
    J --> DB
    B --> DB
    style Monolith fill:#fef3c7,stroke:#f59e0b,color:#78350f
    style DB fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b
\`\`\`

**Microservices:**

\`\`\`mermaid
graph TD
    US["User Service<br/>+ own DB"] --> MB["Message Bus"]
    JS["Job Service<br/>+ own DB"] --> MB
    BS["Billing Service<br/>+ own DB"] --> MB
    style US fill:#ecfdf5,stroke:#10b981,color:#064e3b
    style JS fill:#ecfdf5,stroke:#10b981,color:#064e3b
    style BS fill:#ecfdf5,stroke:#10b981,color:#064e3b
    style MB fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b
\`\`\`

### Service Communication

Synchronous calls are the simplest, but the caller waits, and it fails when the service it calls is down, so a chain of five synchronous services fails whenever any one of them does, making it less available than each service on its own. Asynchronous events decouple that: the order is saved even if the email service is down, at the cost of the rest happening later. gRPC is a synchronous option that sends compact binary messages over HTTP/2, with typed client code generated from a shared \`.proto\` schema file.

\`\`\`javascript
// 1. Synchronous (HTTP/REST)
// Service A calls Service B directly
async function getUserOrders(userId) {
  const user = await fetch('http://user-service/users/' + userId);
  const orders = await fetch('http://order-service/orders?userId=' + userId);
  return { user: await user.json(), orders: await orders.json() };
}

// 2. Asynchronous (Message Queue)
// Service A publishes event, Service B consumes
async function createOrder(orderData) {
  const order = await db.orders.create(orderData);

  // Publish event — other services react independently
  await messageQueue.publish('order.created', {
    orderId: order.id,
    userId: order.userId,
    amount: order.total,
  });

  return order;
}

// 3. gRPC (high-performance binary protocol)
// Defined via .proto files, generates typed clients
// Best for internal service-to-service calls
\`\`\`

### Circuit Breaker Pattern

A circuit breaker stops calling a service that keeps failing, so your requests are not all stuck waiting on timeouts and the failing service gets room to recover. After a set number of failures it "opens" and fails every call instantly; after a cool-down it lets a trial call through ("half-open") and closes again if that succeeds. Q8 below walks through the three states.

\`\`\`javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit is OPEN — request blocked');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

// Usage
const breaker = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 10000 });

async function callExternalService() {
  return breaker.execute(async () => {
    const res = await fetch('http://payment-service/charge');
    if (!res.ok) throw new Error('Payment service error');
    return res.json();
  });
}
\`\`\`

### Saga Pattern (Distributed Transactions)

You cannot wrap one database transaction around three services that each own a separate database. A saga runs each step as its own local transaction, and if a later step fails, it runs a compensating action for every earlier step: refund the payment, release the stock. In choreography, each service reacts to the previous service's event and nothing is in charge; in orchestration, one coordinator runs the sequence (both are sketched below), which is easier to follow and debug. Compensation is not a rollback: the customer may briefly see a charge before the refund arrives.

\`\`\`javascript
// Choreography-based saga (event-driven)
// Each service listens for events and publishes compensating events on failure

// Orchestration-based saga (coordinator)
class OrderSaga {
  async execute(orderData) {
    const steps = [];

    try {
      // Step 1: Reserve inventory
      const reservation = await inventoryService.reserve(orderData.items);
      steps.push({ service: 'inventory', action: 'release', data: reservation });

      // Step 2: Process payment
      const payment = await paymentService.charge(orderData.amount);
      steps.push({ service: 'payment', action: 'refund', data: payment });

      // Step 3: Create shipping
      const shipping = await shippingService.create(orderData.address);
      steps.push({ service: 'shipping', action: 'cancel', data: shipping });

      return { success: true, orderId: orderData.id };
    } catch (error) {
      // Compensate — undo steps in reverse order
      for (const step of steps.reverse()) {
        await this.compensate(step);
      }
      return { success: false, error: error.message };
    }
  }

  async compensate(step) {
    switch (step.service) {
      case 'inventory':
        await inventoryService.release(step.data);
        break;
      case 'payment':
        await paymentService.refund(step.data);
        break;
      case 'shipping':
        await shippingService.cancel(step.data);
        break;
    }
  }
}
\`\`\`

---

## 8. API Gateway

### Responsibilities

An API gateway is the single entry point in front of all your services. It exists so that work every service would otherwise repeat (checking the token, rate limiting, logging, TLS termination, i.e. decrypting HTTPS) happens once, and so that clients call one address instead of knowing where each service lives. The risk is that it becomes a bottleneck, or a place where business logic creeps in. Keep it to routing and these shared concerns.

\`\`\`
Client Request → API Gateway → Microservice

API Gateway handles:
1. Request routing
2. Authentication / Authorization
3. Rate limiting
4. Request/response transformation
5. Load balancing
6. Circuit breaking
7. Caching
8. Logging & monitoring
9. SSL termination
10. API versioning
\`\`\`

### Express API Gateway Example

\`\`\`javascript
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Auth middleware
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    req.user = await verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Route to microservices
app.use(
  '/api/users',
  createProxyMiddleware({
    target: 'http://user-service:3001',
    pathRewrite: { '^/api/users': '/users' },
  })
);

app.use(
  '/api/orders',
  createProxyMiddleware({
    target: 'http://order-service:3002',
    pathRewrite: { '^/api/orders': '/orders' },
  })
);

app.use(
  '/api/products',
  createProxyMiddleware({
    target: 'http://product-service:3003',
    pathRewrite: { '^/api/products': '/products' },
  })
);
\`\`\`

### BFF (Backend for Frontend)

A BFF is a small server per kind of client (mobile, web, admin), usually owned by that client's team. It calls the underlying services and returns exactly the shape one screen needs, so a mobile app on a slow network makes one request instead of five and never downloads fields it does not show.

\`\`\`
Mobile App  ──→  Mobile BFF  ──→  Microservices
Web App     ──→  Web BFF     ──→  Microservices
Admin Panel ──→  Admin BFF   ──→  Microservices

Each BFF:
- Aggregates data from multiple services
- Formats response for specific client needs
- Handles client-specific auth flows
- Reduces over-fetching for mobile
\`\`\`

---

## 9. CDN (Content Delivery Network)

### How CDNs Work

A CDN is a network of servers around the world that keep copies of your files. A user in Tokyo gets the file from a nearby edge server instead of from your origin server in the US, which removes most of the round-trip time. The first request for a file at each edge still goes to the origin (a cache miss); everyone after that is served locally.

\`\`\`
Without CDN:
User (Tokyo) ──── 200ms ────> Origin (US East)

With CDN:
User (Tokyo) ── 20ms ──> Edge (Tokyo) ── cache hit ──> Response
                              │
                         cache miss
                              │
                              ▼
                     Origin (US East)
\`\`\`

### CDN Configuration

\`\`\`javascript
// CloudFront distribution with S3 origin
const distribution = {
  Origins: [{
    DomainName: 'my-bucket.s3.amazonaws.com',
    S3OriginConfig: {
      OriginAccessIdentity: 'origin-access-identity/cloudfront/XXXXX',
    },
  }],
  DefaultCacheBehavior: {
    ViewerProtocolPolicy: 'redirect-to-https',
    CachePolicyId: 'managed-caching-optimized',
    TTL: {
      Default: 86400,  // 1 day
      Max: 31536000,   // 1 year
      Min: 0,
    },
    Compress: true,
  },
  // Custom error pages for SPA routing
  CustomErrorResponses: [{
    ErrorCode: 403,
    ResponseCode: 200,
    ResponsePagePath: '/index.html',
    ErrorCachingMinTTL: 300,
  }],
};

// Cache busting via content hash in filenames
// index-a1b2c3d4.js  → immutable, cache forever
// index.html          → no-cache, always revalidate
\`\`\`

Two parts of that config carry the design. Hashed filenames (\`index-a1b2c3d4.js\`) change whenever the content changes, so they can be cached for a year without ever serving an outdated file, while \`index.html\` is always revalidated so that after a deploy it points at the new hashes. The 403 → \`/index.html\` rule is for single-page apps: S3 answers 403 for a path such as \`/settings\` that has no file behind it, and returning \`index.html\` instead lets the app's client-side router show the right page.

### Caching Headers

Careful with the names: \`no-cache\` does not mean "do not cache". The browser may keep the file but must check with the server before using it, which is a cheap request that returns 304 Not Modified when nothing changed. \`no-store\` is the one that means never keep a copy. \`stale-while-revalidate\` lets the cache serve the old copy instantly while it fetches a fresh one in the background.

\`\`\`
Cache-Control: public, max-age=31536000, immutable
  → Static assets with content hash (JS, CSS, images)

Cache-Control: no-cache
  → HTML files (may be stored, but revalidated with the server before every use)

Cache-Control: no-store
  → Sensitive data (never cache)

Cache-Control: public, max-age=3600, stale-while-revalidate=86400
  → API responses (serve stale while fetching fresh)
\`\`\`

---

## 10. Rate Limiting & Throttling

### Algorithms

A rate limiter caps how many requests one client can make in a period. It protects you from abuse and stops one noisy customer from starving everyone else.

#### Token Bucket

Picture a bucket that holds up to \`capacity\` tokens and refills at a steady rate. Each request takes a token, and an empty bucket means the request is rejected. The capacity decides how large a burst you allow; the refill rate decides the long-run average.

\`\`\`javascript
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate; // tokens per second
    this.lastRefill = Date.now();
  }

  consume(tokens = 1) {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}
\`\`\`

#### Sliding Window

Keep the timestamp of every recent request and count the ones inside the last window. It is exact and has no burst at window edges, but storing every timestamp costs memory for each user.

\`\`\`javascript
class SlidingWindowRateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map(); // userId → timestamps[]
  }

  isAllowed(userId) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get user's request timestamps
    const timestamps = this.requests.get(userId) || [];

    // Filter to current window
    const recent = timestamps.filter((t) => t > windowStart);

    if (recent.length >= this.maxRequests) {
      return false;
    }

    recent.push(now);
    this.requests.set(userId, recent);
    return true;
  }
}
\`\`\`

### Redis-based Rate Limiting

The limiters above keep their counts in one server's memory, so with several API servers each would count separately and a client could get several times the limit. Redis gives every server one shared counter. This version is a fixed window: the counter resets when the key expires, so a client can send 100 requests at the end of one window and 100 more at the start of the next, 200 in a few seconds. That is often acceptable; when it is not, use a sliding window or a token bucket stored in Redis.

\`\`\`javascript
import Redis from 'ioredis';

const redis = new Redis();

async function rateLimitMiddleware(req, res, next) {
  const key = \`ratelimit:\${req.ip}\`;
  const limit = 100;
  const window = 60; // seconds

  // INCR and EXPIRE run together in one Lua script, which Redis executes
  // atomically. As two separate calls, a crash between them would leave a
  // key with no expiry, and that client would stay blocked forever.
  const current = await redis.eval(
    "local c = redis.call('INCR', KEYS[1]) " +
      "if c == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end " +
      'return c',
    1,
    key,
    window,
  );

  res.set({
    'X-RateLimit-Limit': limit,
    'X-RateLimit-Remaining': Math.max(0, limit - current),
    'X-RateLimit-Reset': await redis.ttl(key),
  });

  if (current > limit) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: await redis.ttl(key),
    });
  }

  next();
}
\`\`\`

---

## 11. Monitoring & Observability

### Three Pillars

\`\`\`
1. Logging (What happened)
   - Structured JSON logs
   - Log levels: error, warn, info, debug
   - Centralized log aggregation (ELK, CloudWatch)

2. Metrics (What's the system doing)
   - Request rate, error rate, latency (RED)
   - Utilization, saturation, errors (USE)
   - Business metrics (signups, orders)

3. Tracing (How did it flow)
   - Distributed request tracing
   - Trace ID propagated across services
   - Span timing for each service hop
\`\`\`

The two acronyms are checklists for what to graph. RED (rate, errors, duration) is for services: how many requests, how many fail, how long they take. USE (utilization, saturation, errors) is for resources such as CPU, memory and disks: how busy they are, how much work is queued waiting for them, and how many errors they report. Tracing ties the pillars together across services: every request carries one trace ID, so you can see which of six services made it slow.

### Structured Logging

Structured logs are JSON objects instead of free-text sentences, so a log tool can filter \`orderId = 456\` across millions of lines instead of you searching text. Put the trace ID on every line so one request can be followed across services. Log ids rather than personal data such as emails: logs are copied into many tools and kept for a long time, and every copy of personal data is one more place a privacy rule applies.

\`\`\`javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

// Usage
logger.info('User created', {
  userId: '123', // log the id, not the email: keep personal data out of logs
  duration: 45,
  traceId: req.headers['x-trace-id'],
});

logger.error('Payment failed', {
  orderId: '456',
  error: error.message,
  stack: error.stack,
  traceId: req.headers['x-trace-id'],
});
\`\`\`

### Health Check Endpoint

\`\`\`javascript
app.get('/health', async (req, res) => {
  const checks = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    checks: {},
  };

  // Database check
  try {
    await db.command({ ping: 1 });
    checks.checks.database = { status: 'healthy' };
  } catch (e) {
    checks.checks.database = { status: 'unhealthy', error: e.message };
  }

  // Redis check
  try {
    await redis.ping();
    checks.checks.redis = { status: 'healthy' };
  } catch (e) {
    checks.checks.redis = { status: 'unhealthy', error: e.message };
  }

  const isHealthy = Object.values(checks.checks).every(
    (c) => c.status === 'healthy'
  );

  res.status(isHealthy ? 200 : 503).json(checks);
});
\`\`\`

Be deliberate about what this endpoint checks. Reporting unhealthy when the database is down is useful on a dashboard. But if a load balancer or orchestrator uses the same endpoint to decide which servers to remove or restart, a database outage fails every server at once, and they are all pulled even though restarting them fixes nothing. A common split is a shallow check ("the process is up") for restarts and a deeper one for "ready to take traffic".

---

## 12. Security

### Defense in Depth

Defence in depth means no single control is trusted to stop an attack on its own; each layer assumes the one outside it has already failed. The firewall should block the attacker, but if it does not, the application still validates input, and if that fails too, the data is still encrypted and the access is still logged. (RBAC is role-based access control, "admins can delete"; ABAC is attribute-based, "users can edit documents in their own department".)

\`\`\`
Layer 1: Network (Firewall, VPC, Security Groups)
Layer 2: Transport (TLS/SSL, certificate pinning)
Layer 3: Application (Input validation, CSRF, XSS prevention)
Layer 4: Authentication (JWT, OAuth, MFA)
Layer 5: Authorization (RBAC, ABAC)
Layer 6: Data (Encryption at rest, field-level encryption)
Layer 7: Monitoring (Intrusion detection, audit logs)
\`\`\`

### Common Security Patterns

Each item below stops a specific attack. Validation rejects malformed input at the door. Parameterised queries keep user input from being run as SQL (SQL injection). Sanitising HTML stops injected scripts from running in other users' browsers (XSS, cross-site scripting). CORS (cross-origin resource sharing) controls which websites may call your API from a browser. Security headers switch on browser protections, such as refusing to be shown inside another site's frame.

\`\`\`javascript
// 1. Input validation
import Joi from 'joi';

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  name: Joi.string().max(100).required(),
});

// 2. SQL injection prevention (parameterized queries)
// BAD
const queryBroken = \`SELECT * FROM users WHERE email = '\${email}'\`;
// GOOD
const query = 'SELECT * FROM users WHERE email = $1';
await db.query(query, [email]);

// 3. XSS prevention
import DOMPurify from 'dompurify';
const sanitized = DOMPurify.sanitize(userInput);

// 4. CORS configuration
app.use(cors({
  origin: ['https://app.example.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 5. Security headers
import helmet from 'helmet';
app.use(helmet());
// Sets: X-Content-Type-Options, X-Frame-Options,
//       Strict-Transport-Security, Content-Security-Policy, etc.

// 6. Rate limiting (see section 10)
\`\`\`

---

## 13. Real-Time Communication

### WebSocket

HTTP is request-response: the server can only answer when the client asks. A WebSocket upgrades one HTTP connection into a long-lived two-way channel, so the server can push a chat message the moment it arrives. The example keeps a set of open sockets per room and forwards each message to everyone else in that room. Those sockets live in one server's memory, so a second server would not see them; Q17 covers how to scale past one server.

\`\`\`javascript
// Server (ws library)
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const rooms = new Map(); // roomId → Set<WebSocket>

wss.on('connection', (ws, req) => {
  ws.on('message', (data) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case 'join':
        if (!rooms.has(message.room)) rooms.set(message.room, new Set());
        rooms.get(message.room).add(ws);
        ws.room = message.room;
        break;

      case 'message':
        // Broadcast to room
        const members = rooms.get(ws.room) || new Set();
        for (const client of members) {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify(message));
          }
        }
        break;
    }
  });

  ws.on('close', () => {
    if (ws.room && rooms.has(ws.room)) {
      rooms.get(ws.room).delete(ws);
    }
  });
});
\`\`\`

### Server-Sent Events (SSE)

Server-Sent Events are the simpler, one-way option. The client opens an ordinary HTTP request, the server keeps it open, and writes a \`data: ...\` line whenever it has something to send. The browser's \`EventSource\` reconnects on its own if the connection drops. Use it when only the server needs to push (notifications, live scores): it is plain HTTP, so it passes through most proxies unchanged.

\`\`\`javascript
// Server
app.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const sendEvent = (data) => {
    res.write(\`data: \${JSON.stringify(data)}\\n\\n\`);
  };

  // Send updates
  const interval = setInterval(() => {
    sendEvent({ type: 'heartbeat', timestamp: Date.now() });
  }, 30000);

  req.on('close', () => clearInterval(interval));
});

// Client
const eventSource = new EventSource('/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
\`\`\`

### Comparison

\`\`\`
WebSocket:
- Full duplex (bidirectional)
- Binary + text data
- Custom protocol (ws://)
- Use for: chat, gaming, collaboration

SSE (Server-Sent Events):
- Server → Client only (unidirectional)
- Text data only
- HTTP protocol
- Auto-reconnect built-in
- Use for: notifications, live feeds, dashboards

Long Polling:
- Client polls repeatedly
- Higher latency, more overhead
- Works everywhere
- Use for: fallback when WS/SSE unavailable
\`\`\`

---

## 14. File Storage & Upload

### Architecture

Avoid streaming large files through your API servers: every upload ties up a server for its whole duration and you pay for the bandwidth twice. Instead the API gives the client permission to upload straight to object storage (S3), and only records the result.

\`\`\`
Client → API Server → Object Storage (S3)
         │
         ├── Small files: direct upload through API
         └── Large files: presigned URL (direct to S3)
\`\`\`

### Presigned URL Upload

A presigned URL is a link your server signs with its own AWS credentials that allows one specific action (upload to this key, until this time) without giving the client any credentials. The browser sends the file directly to S3 with it, and the link stops working when it expires.

\`\`\`javascript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'us-east-1' });

// Generate presigned upload URL
async function getUploadUrl(fileName, contentType) {
  const key = \`uploads/\${Date.now()}-\${fileName}\`;

  const command = new PutObjectCommand({
    Bucket: 'my-bucket',
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return { url, key };
}

// Generate presigned download URL
async function getDownloadUrl(key) {
  const command = new GetObjectCommand({
    Bucket: 'my-bucket',
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

// API routes
app.post('/api/upload-url', async (req, res) => {
  const { fileName, contentType } = req.body;
  const { url, key } = await getUploadUrl(fileName, contentType);
  res.json({ uploadUrl: url, key });
});
\`\`\`

### Chunked Upload for Large Files

For large files, S3 multipart upload splits the file into parts (at least 5 MB each, except the last) that are uploaded separately and stitched together at the end. A dropped connection then costs one part instead of the whole file, and parts can be sent in parallel. The loop below uploads the parts one after another, for clarity; to parallelise, start several part uploads at once with a small concurrency limit.

\`\`\`javascript
// Client-side chunked upload
async function uploadLargeFile(file, chunkSize = 5 * 1024 * 1024) {
  // 1. Initialize multipart upload
  const { uploadId } = await api.post('/upload/init', {
    fileName: file.name,
    contentType: file.type,
  });

  // 2. Upload chunks one at a time (see the note above to parallelise)
  const chunks = Math.ceil(file.size / chunkSize);
  const parts = [];

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const { url } = await api.post('/upload/part-url', {
      uploadId,
      partNumber: i + 1,
    });

    const response = await fetch(url, {
      method: 'PUT',
      body: chunk,
    });

    parts.push({
      partNumber: i + 1,
      etag: response.headers.get('etag'),
    });
  }

  // 3. Complete multipart upload
  await api.post('/upload/complete', { uploadId, parts });
}
\`\`\`

---

## 15. Search Systems

### Full-Text Search with Elasticsearch

A database \`LIKE '%react%'\` query scans every row and knows nothing about relevance. A search engine such as Elasticsearch builds an inverted index, a map from each word to the documents that contain it, so it can find matches quickly and rank them. In the query below, \`title^3\` makes a title match count three times as much as a description match, \`must\` clauses affect the relevance score, and \`filter\` clauses only include or exclude results.

\`\`\`javascript
// Index document
await esClient.index({
  index: 'jobs',
  body: {
    title: 'Senior React Developer',
    description: 'Building scalable web applications...',
    skills: ['React', 'TypeScript', 'Node.js'],
    location: 'San Francisco',
    salary: { min: 150000, max: 200000 },
    postedAt: new Date(),
  },
});

// Search with relevance scoring
const results = await esClient.search({
  index: 'jobs',
  body: {
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query: 'react developer',
              fields: ['title^3', 'description', 'skills^2'],
            },
          },
        ],
        filter: [
          { range: { 'salary.min': { gte: 100000 } } },
          { term: { location: 'San Francisco' } },
        ],
      },
    },
    highlight: {
      fields: { title: {}, description: {} },
    },
    sort: [{ _score: 'desc' }, { postedAt: 'desc' }],
    from: 0,
    size: 20,
  },
});
\`\`\`

### Search Architecture

The search index is a copy, not the source of truth. Writes go to the database, a sync process copies each change into the index (so search can lag the database by a moment), and results are often re-read from the database so the user sees current data.

\`\`\`
Write Path:
App → Database → Change Stream/Binlog → Sync Service → Search Index

Read Path:
User Query → API → Search Index → Results
                                     │
                              Hydrate from DB
                                     │
                                  Response

Components:
- Search Index (Elasticsearch/OpenSearch): inverted index, fast text search
- Sync Service: keeps search index in sync with primary DB
- Tokenizer: breaks text into searchable tokens
- Analyzer: stemming, stop words, synonyms
\`\`\`

---

## 16. Common System Design Patterns

### CQRS (Command Query Responsibility Segregation)

CQRS separates the code, and often the storage, for changing data from the code for reading it, because the two usually want different shapes. Writes want normalised, validated data; reads want pre-joined views that answer one screen in one query. The cost is that the read side is updated after the write, so it can briefly lag. Q12 covers when that is worth it.

\`\`\`
Commands (Write):
Client → API → Command Handler → Write DB

Queries (Read):
Client → API → Query Handler → Read DB (optimized views)

Write DB ──sync──> Read DB (denormalized, optimized for reads)
\`\`\`

### Strangler Fig (Migrating from Monolith)

Named after a vine that grows around a tree until it replaces it. Instead of a risky rewrite of everything at once, you put a proxy in front of the monolith and move one feature at a time into a new service, pointing that feature's URLs at the new code. The system works at every step, and you can stop or roll back at any point.

\`\`\`
Phase 1: Route all traffic through proxy
  Client → Proxy → Monolith

Phase 2: Migrate features one by one
  Client → Proxy → New Service (feature A)
                 → Monolith (features B, C, D)

Phase 3: Complete migration
  Client → Proxy → Service A
                 → Service B
                 → Service C
                 → Service D
\`\`\`

### Bulkhead Pattern

Named after the watertight compartments in a ship's hull. Each dependency gets its own limited number of concurrent calls, so if the payment provider hangs, at most 10 calls are tied up in it at once, and the rest of the app keeps serving search and email instead of every worker getting stuck behind payments.

\`\`\`javascript
// Isolate different parts of the system
// so failure in one doesn't cascade

class BulkheadExecutor {
  constructor(name, maxConcurrent) {
    this.name = name;
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async execute(fn) {
    if (this.running >= this.maxConcurrent) {
      await new Promise((resolve) => this.queue.push(resolve));
    }

    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      if (this.queue.length > 0) {
        this.queue.shift()();
      }
    }
  }
}

// Separate bulkheads per dependency
const paymentBulkhead = new BulkheadExecutor('payment', 10);
const emailBulkhead = new BulkheadExecutor('email', 20);
const searchBulkhead = new BulkheadExecutor('search', 50);
\`\`\`

### Idempotency

An operation is idempotent if doing it twice has the same effect as doing it once. Networks drop responses, so clients retry, and without protection a retried payment charges the card twice. The client sends a unique idempotency key with each logical operation; the server stores the result under that key and returns the stored result if the same key arrives again. This simple version has a gap: two identical requests arriving at the same moment can both miss the stored result and both charge, so real implementations claim the key atomically first (for example with Redis \`SET key value NX\`, which only succeeds for the first caller).

\`\`\`javascript
// Ensure operations can be safely retried
async function processPayment(req, res) {
  const idempotencyKey = req.headers['idempotency-key'];

  // Check if already processed
  const existing = await redis.get(\`idem:\${idempotencyKey}\`);
  if (existing) {
    return res.json(JSON.parse(existing));
  }

  // Process payment
  const result = await paymentGateway.charge(req.body);

  // Store result for idempotency
  await redis.setex(\`idem:\${idempotencyKey}\`, 86400, JSON.stringify(result));

  res.json(result);
}
\`\`\`

---

## 17. Design Case Studies

### URL Shortener (TinyURL)

Each case study follows the order you would use in an interview: requirements, a rough estimate of load, the architecture, then the few decisions that matter. "Zk" in the diagram is ZooKeeper, a coordination service used here to keep one shared counter consistent across all app servers, so two servers never generate the same short code. Q13 below explains the other decisions.

\`\`\`
Requirements:
- Shorten long URLs → short alias
- Redirect short URL → original
- Custom aliases (optional)
- Analytics (click count)
- High availability, low latency

Estimation (100M URLs/month):
- Write QPS: 100M / (30 * 86400) ≈ 40/s
- Read QPS: assume 10 reads per write = 400/s
- Storage: 100M * 500 bytes = 50 GB/month

Architecture:
┌────────┐    ┌─────────┐    ┌──────┐
│ Client │───>│  API GW  │───>│ App  │
└────────┘    └─────────┘    └──┬───┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                ┌───┴───┐  ┌───┴───┐  ┌───┴────┐
                │ Redis  │  │  DB   │  │ Counter│
                │ Cache  │  │(URLs) │  │  (Zk)  │
                └───────┘  └───────┘  └────────┘

Key Design:
- Base62 encoding: [a-zA-Z0-9] → 62^7 = 3.5 trillion combinations
- Counter-based (Zookeeper) vs hash-based ID generation
- Read-heavy → cache popular URLs in Redis (roughly 20% of URLs get 80% of clicks)
- 301 (permanent) vs 302 (temporary) redirect
\`\`\`

### Chat System

Cassandra appears here because chat is write-heavy and nearly always read as "the latest messages in this conversation". Partitioning by \`chat_id\` and sorting by time inside each partition makes that a single, fast read.

\`\`\`
Requirements:
- 1:1 and group messaging
- Online/offline status
- Message persistence
- Read receipts
- Real-time delivery

Architecture:
┌────────┐    ┌──────────┐    ┌────────────┐
│Client A │──>│WebSocket │───>│   Chat     │
└────────┘    │  Server   │   │  Service   │
              └──────────┘    └─────┬──────┘
                                    │
              ┌─────────────────────┼──────────────┐
              │                     │              │
         ┌────┴────┐         ┌─────┴─────┐  ┌────┴────┐
         │ Message  │         │  Presence │  │  Push   │
         │  Store   │         │  Service  │  │Notific. │
         │(Cassandra)│        │  (Redis)  │  │         │
         └─────────┘         └──────────┘  └─────────┘

Message delivery:
1. Client A sends message → WebSocket server
2. Check if recipient online (Presence Service)
3. If online: deliver via WebSocket
4. If offline: store + push notification
5. Persist message in Message Store
6. Update conversation metadata

Schema (Cassandra):
- messages: partition by (chat_id), cluster by (timestamp DESC)
- conversations: partition by (user_id), cluster by (last_message_time DESC)
\`\`\`

### Notification System

The key decision is a separate queue per channel: a slow SMS provider backs up only the SMS queue, and each worker retries its own failures without resending the email.

\`\`\`
Requirements:
- Multi-channel: push, email, SMS, in-app
- Millions of notifications/day
- Templated messages
- User preferences (opt-out)
- Retry on failure

Architecture:
┌──────────┐    ┌────────────┐    ┌───────────┐
│ Trigger  │───>│Notification│───>│  Message   │
│ Service  │    │  Service   │    │   Queue    │
└──────────┘    └────────────┘    └─────┬─────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
              ┌─────┴─────┐      ┌─────┴─────┐      ┌─────┴─────┐
              │   Push    │      │   Email   │      │    SMS    │
              │  Worker   │      │  Worker   │      │  Worker   │
              └───────────┘      └───────────┘      └───────────┘

Flow:
1. Event triggers notification (order placed, etc.)
2. Notification service checks user preferences
3. Renders template with data
4. Enqueues to channel-specific queue
5. Workers send via provider (FCM, SES, Twilio)
6. Track delivery status, retry on failure
\`\`\`

---

## 18. Interview Questions

### Beginner (1-3 years)

**Q1: What is the CAP theorem? Give an example of each type.**

Short answer: when the network between nodes fails, a distributed system has to choose between staying correct (refusing some requests) and staying available (answering, possibly with stale data).

The CAP theorem states a distributed system can guarantee at most two of three properties: Consistency (all nodes see the same data), Availability (every request gets a response), and Partition Tolerance (system works despite network failures).

- **CP**: MongoDB (primary/secondary) — during a network partition, the secondary becomes unavailable for writes to maintain consistency
- **AP**: Cassandra — continues serving reads/writes during partitions, but data may be temporarily inconsistent
- **CA**: A single-node PostgreSQL instance — no partition tolerance since it's not distributed

In practice, since network partitions are inevitable in distributed systems, you choose between CP and AP.

---

**Q2: What is the difference between vertical and horizontal scaling?**

**Vertical scaling** (scale up) means adding more resources to a single machine — more CPU, RAM, or storage. It's simpler (no code changes) but has hardware limits and creates a single point of failure.

**Horizontal scaling** (scale out) means adding more machines to the pool. It offers virtually unlimited scaling and better fault tolerance, but requires the application to handle distributed concerns like load balancing, data consistency, and session management.

Most production systems use horizontal scaling for the application tier and a mix of both for databases (vertical for primary, horizontal via sharding/replicas).

---

**Q3: Explain caching. What is cache-aside pattern?**

Caching stores frequently accessed data in a faster storage layer (like Redis) to reduce load on the primary database and improve response times.

**Cache-aside** (lazy loading): The application checks the cache first. On a cache hit, it returns the cached data. On a cache miss, it reads from the database, populates the cache, and returns the data. This pattern is simple and only caches data that's actually requested, but the first request for any item is always slower (cold cache), and data can become stale if the database changes without the cache being invalidated.

---

**Q4: What is a CDN and why would you use one?**

A CDN (Content Delivery Network) is a geographically distributed network of servers that caches content closer to users. Instead of every request hitting your origin server (which might be in one region), the CDN serves static assets (JS, CSS, images) from the nearest edge location.

Benefits: lower latency, because the edge server is physically close to the user; less load on your origin, because most requests never reach it; and resilience, because a DDoS (distributed denial-of-service) flood is spread across the CDN's many servers instead of landing on yours, and an edge can keep serving cached files if your origin is briefly down. For SPAs, the CDN serves the static build files while API requests go to the backend.

---

**Q5: What is a load balancer and what algorithms can it use?**

A load balancer distributes incoming traffic across multiple servers to ensure no single server is overwhelmed.

Common algorithms:
- **Round Robin**: Requests distributed sequentially across servers
- **Weighted Round Robin**: Servers with more capacity get proportionally more traffic
- **Least Connections**: Routes to the server with fewest active connections
- **IP Hash**: Routes based on client IP (sticky sessions)
- **Random**: Simple random selection

Layer 4 load balancers route based on IP/port (faster), while Layer 7 route based on HTTP content like URL paths or headers (more flexible).

---

**Q6: What are WebSockets and when would you use them over REST?**

WebSockets provide a persistent, full-duplex communication channel over a single TCP connection. Unlike REST (request-response), WebSockets allow both client and server to send messages at any time.

The deciding question is who starts the conversation. If the server must push updates the moment they happen, REST forces the client to poll, which either wastes requests or adds delay, so a persistent connection wins. If the client asks and the server answers, REST is simpler, cacheable and needs no long-lived connection per user.

Use WebSockets for: real-time chat, live notifications, collaborative editing, gaming, live dashboards, stock tickers.

Use REST for: CRUD operations, data fetching, file uploads, operations that don't need real-time updates.

SSE (Server-Sent Events) is a lighter alternative when you only need server-to-client streaming.

---

### Intermediate (3-5 years)

**Q7: How would you design a rate limiter?**

A rate limiter controls the rate of requests a user/client can make to an API.

**Token Bucket algorithm**: A bucket holds tokens up to a maximum capacity. Each request consumes a token. Tokens are added at a fixed rate. If the bucket is empty, the request is rejected. This allows bursts (up to bucket capacity) while maintaining an average rate.

**Sliding Window**: Track timestamps of recent requests per user. Count requests within the window. If count exceeds the limit, reject. More precise than fixed windows but uses more memory.

For distributed systems, keep the counter in Redis so every API server shares it, and run INCR and EXPIRE together in one Lua script so they are atomic (as two separate calls, a crash between them leaves a key that never expires). Return \`429 Too Many Requests\` with \`Retry-After\` and \`X-RateLimit-*\` headers.

---

**Q8: Explain the circuit breaker pattern.**

The circuit breaker prevents cascading failures when a downstream service is unhealthy. It has three states:

1. **Closed** (normal): Requests flow through. Failures are counted.
2. **Open** (tripped): After exceeding the failure threshold, all requests immediately fail without calling the downstream service. A timer starts.
3. **Half-Open** (testing): After the timer expires, a limited number of test requests are allowed through. If they succeed, the circuit closes. If they fail, it reopens.

This prevents a failing service from being overwhelmed with retries and allows it time to recover, while the caller gets fast failure responses instead of hanging.

---

**Q9: Compare microservices vs monolith architecture.**

**Short answer:** a monolith is one deployable unit and is the right starting point; microservices split it into independently deployed services, which pays off only once separate teams need to ship and scale separately, because you buy that independence with the cost of a distributed system.

**Monolith**: Single deployable unit. All features share one codebase, one database, one deployment. Simpler to develop, test, debug, and deploy initially. But as it grows: longer build times, harder to scale individual features, one bug can take down everything, technology lock-in.

**Microservices**: Each feature is an independent service with its own database, deployment, and potentially tech stack. Benefits: independent scaling, team autonomy, isolated failures, technology diversity. Costs: distributed system complexity (networking, data consistency, debugging), operational overhead (many services to deploy/monitor), inter-service communication latency.

Start with a monolith and extract microservices when you have clear bounded contexts (areas of the business with their own data and vocabulary, such as billing or search) and team scaling needs.

---

**Q10: What is database sharding and what are its challenges?**

Sharding is horizontal partitioning of a database across multiple servers, each holding a subset of the data.

**Strategies**: Hash-based (hash(key) % N), range-based (e.g., users A-M on shard 1, N-Z on shard 2), directory-based (lookup table maps keys to shards).

**Challenges**:
- **Joins across shards** are expensive or impossible
- **Resharding** when adding servers (consistent hashing helps)
- **Hotspots** if sharding key isn't well-distributed (shard by signup date and every new user lands on the newest shard)
- **Referential integrity** can't be enforced across shards
- **Increased operational complexity** (backups, schema migrations across all shards)

---

**Q11: How does event-driven architecture work?**

**Short answer:** a service announces that something happened and does not care who reacts; a broker delivers the event to every interested service. You gain loose coupling and easy extension, and pay with eventual consistency and harder debugging.

In event-driven architecture, services communicate by producing and consuming events rather than making direct calls.

**Components**: Event producers (emit events when state changes), event bus/broker (routes events — Kafka, RabbitMQ, SNS), event consumers (react to events).

**Benefits**: Loose coupling (producer doesn't know consumers), async processing, easy to add new consumers, event log enables replay/audit.

**Patterns**: Event notification (just a signal), event-carried state transfer (event includes all data needed), event sourcing (store events as the source of truth, derive state).

**Challenges**: Eventual consistency, harder debugging (no linear call stack), event ordering, duplicate handling (idempotency).

---

**Q12: What is CQRS and when would you use it?**

**Short answer:** use separate models for writing and reading data, so each can be shaped and scaled for its own job. It is worth the extra moving parts only when reads and writes look very different; for ordinary CRUD it is overkill.

CQRS (Command Query Responsibility Segregation) separates the write model (commands) from the read model (queries). Instead of one model for both reads and writes, you have:

- **Command side**: Handles creates/updates/deletes, optimized for write consistency
- **Query side**: Handles reads, uses denormalized views optimized for specific read patterns

The write database syncs to the read database (eventually consistent). Use CQRS when: read and write patterns differ significantly (e.g., write normalized, read denormalized), you need independent scaling of reads vs writes, or complex domain logic on writes but simple reads.

---

### Advanced (5+ years)

**Q13: Design a URL shortener (TinyURL).**

**Requirements**: Generate short URLs, redirect to original, custom aliases, analytics, 100M URLs/month.

**Key decisions**:
1. **ID generation**: Counter-based (Zookeeper for coordination) or hash-based (MD5/SHA → base62, take first 7 chars). Counter avoids collisions; hash is simpler but needs collision handling.
2. **Storage**: Key-value store (DynamoDB/Cassandra) for O(1) lookups. Schema: \`{ shortUrl, longUrl, createdAt, userId, expiresAt }\`.
3. **Caching**: Redis cache for hot URLs (80/20 rule — 20% of URLs get 80% of traffic). Cache on read, LRU eviction.
4. **Redirect**: 301 (permanent, cacheable by browser) vs 302 (temporary, every request hits server — better for analytics).
5. **Scale**: Stateless app servers behind a load balancer. Database sharding by short URL hash. CDN for popular URLs.

---

**Q14: Design a distributed message queue (like Kafka).**

**Short answer:** model each topic as a set of append-only logs (partitions) stored on disk and replicated across brokers. Order holds only within a partition, so the partition key decides what stays ordered, and consumers track their own read position instead of the broker deleting messages as they are read.

**Core concepts**: Topics (named channels), partitions (ordered log segments within a topic), producers (write to partitions), consumers/consumer groups (read from partitions).

**Key design decisions**:
1. **Storage**: Append-only log per partition on disk. Sequential writes are fast. Retention by time or size.
2. **Ordering**: Guaranteed within a partition. Producer chooses partition (key-based hashing or round-robin).
3. **Consumer groups**: Each partition assigned to one consumer in the group. Rebalance on join/leave.
4. **Replication**: Each partition has a leader and replicas. Writes go to leader, replicated to followers. If leader fails, a follower is promoted.
5. **Delivery guarantees**: At-most-once (no retry), at-least-once (retry, may duplicate), exactly-once (idempotent producers + transactional consumers).

---

**Q15: How would you handle distributed transactions across microservices?**

Options from simplest to most complex:

1. **Saga pattern**: Break the transaction into a sequence of local transactions. Each service completes its step and publishes an event. If a step fails, compensating transactions undo previous steps. Two flavors: choreography (event-driven, no coordinator) and orchestration (a saga coordinator manages the flow).

2. **Two-phase commit (2PC)**: A coordinator asks all participants to prepare (phase 1), then commit or rollback (phase 2). Strong consistency but blocks on coordinator failure and has poor performance.

3. **Outbox pattern**: Write the event to an "outbox" table in the same database transaction as the business data. A separate process reads the outbox and publishes to the message broker. Guarantees at-least-once delivery without distributed transactions.

In practice, most microservice systems use sagas with eventual consistency and idempotent operations.

---

**Q16: Design a real-time collaborative editor (like Google Docs).**

**Core challenge**: Multiple users editing the same document simultaneously without conflicts.

**Conflict resolution algorithms**:
1. **OT (Operational Transformation)**: Transform operations against concurrent operations. Used by Google Docs. Complex to implement correctly (especially for undo).
2. **CRDT (Conflict-free Replicated Data Types)**: Data structures that automatically merge without conflicts. Used by Figma, Yjs. No central server needed for conflict resolution.

**Architecture**:
- WebSocket connections per document session
- Document state stored as a sequence of operations (event sourcing)
- Server applies operations, resolves conflicts, broadcasts to all clients
- Periodic snapshots for fast document loading
- Presence system (who's editing where) via lightweight heartbeats
- Version vector (a per-client counter of edits seen) for detecting concurrent edits: if neither client had seen the other's edit, the two are concurrent and need merging

---

**Q17: How would you design a system to handle 1 million concurrent WebSocket connections?**

**Challenges**: Memory per connection (~50KB), CPU for message routing, single-server limits (~100K connections).

**Architecture**:
1. **Horizontal scaling**: Multiple WebSocket servers behind a load balancer (sticky sessions via IP hash or connection ID).
2. **Pub/sub backbone**: Redis Pub/Sub or Kafka to broadcast messages across servers. When Server A receives a message for a user on Server B, it publishes to the channel; Server B delivers it.
3. **Connection management**: Track user→server mapping in Redis. On disconnect, clean up. Heartbeats to detect stale connections.
4. **Memory optimization**: Use binary protocols (MessagePack/protobuf) instead of JSON. Compress messages. Limit message buffer sizes.
5. **Graceful scaling**: When adding/removing servers, drain connections gradually. Client auto-reconnect with exponential backoff.
6. **Infrastructure**: 10 servers × 100K connections each. Use epoll (the Linux mechanism that lets one thread watch many thousands of sockets and wake only for the ones with data) for efficient I/O multiplexing. Tune OS limits (file descriptors, TCP buffers).

---

**Q18: Explain the trade-offs between consistency and availability in your past system designs.**

**Short answer:** pick per piece of data, not per system. Where a wrong answer costs money (payments, stock), choose consistency and accept brief errors during a failure; where stale data is harmless (feeds, profiles), choose availability. Then say how you softened the cost of each choice.

This is an open-ended question. A strong answer discusses:

1. **Where you chose CP**: Payment processing, inventory management — data correctness is critical. Used database transactions, synchronous replication, and accepted brief unavailability during failures.

2. **Where you chose AP**: User profiles, activity feeds, search indexes — stale data is acceptable. Used eventually consistent stores, cache-aside with TTL, and async replication.

3. **Hybrid approaches**: Strong consistency for writes (primary database), eventual consistency for reads (replicas, caches). Tunable consistency in Cassandra (quorum reads for critical paths, ONE for less critical).

4. **Mitigation strategies**: Idempotent operations (safe retries), conflict resolution (last-write-wins, vector clocks), compensation mechanisms (sagas), read-your-writes consistency (route reads to primary after writes).

---

*This guide covers the foundational concepts for system design interviews. Practice by designing real systems end-to-end: define requirements, estimate scale, choose components, design the API, plan the data model, identify bottlenecks, and discuss trade-offs.*

---

## References

- [System Design Primer](https://github.com/donnemartin/system-design-primer) — Comprehensive open-source study guide
- [Designing Data-Intensive Applications](https://dataintensive.net) — Essential book by Martin Kleppmann
- [High Scalability Blog](http://highscalability.com) — Real-world architecture case studies
`;export{e as default};
