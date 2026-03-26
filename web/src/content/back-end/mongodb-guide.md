# MongoDB — Complete Guide

## Table of Contents

- [1. What is MongoDB?](#1-what-is-mongodb)
- [2. Core Concepts](#2-core-concepts)
- [3. CRUD Operations](#3-crud-operations)
- [4. Query Operators](#4-query-operators)
- [5. Aggregation Pipeline](#5-aggregation-pipeline)
- [6. Indexes](#6-indexes)
- [7. Schema Design](#7-schema-design)
- [8. Mongoose ODM](#8-mongoose-odm)
- [9. Transactions](#9-transactions)
- [10. Replication and Sharding](#10-replication-and-sharding)
- [11. Performance](#11-performance)
- [12. Security](#12-security)
- [13. Interview Questions & Answers](#13-interview-questions--answers)

---

## 1. What is MongoDB?

MongoDB is a **document-oriented NoSQL database** that stores data in flexible, JSON-like documents (BSON). Instead of rows and columns (SQL), data is stored as collections of documents.

Key characteristics:
- **Document model** — flexible schema, nested objects, arrays
- **Horizontal scaling** — built-in sharding
- **High availability** — replica sets with automatic failover
- **Rich queries** — ad-hoc queries, aggregation framework, full-text search
- **BSON format** — binary JSON with additional types (ObjectId, Date, Decimal128)

### SQL vs MongoDB Terminology

| SQL | MongoDB |
|-----|---------|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| Primary Key | `_id` field |
| JOIN | `$lookup` (aggregation) or embedded documents |
| Index | Index |
| Transaction | Transaction (multi-document) |

---

## 2. Core Concepts

### 2.1 Documents

```js
// A MongoDB document (stored as BSON)
{
  _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e1"),  // auto-generated unique ID
  name: "Alice Johnson",
  email: "alice@example.com",
  age: 30,
  address: {                                     // embedded document
    street: "123 Main St",
    city: "New York",
    zip: "10001"
  },
  skills: ["JavaScript", "TypeScript", "React"], // array
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  isActive: true
}
```

### 2.2 Collections

Collections are groups of documents. Unlike SQL tables, documents in a collection don't need to have the same structure (schema-flexible).

```js
// Create collection (implicit - created on first insert)
db.users.insertOne({ name: "Alice" });

// Explicit creation with options
db.createCollection("logs", {
  capped: true,                    // fixed-size, auto-removes oldest
  size: 10485760,                  // 10MB max
  max: 5000                        // 5000 documents max
});
```

### 2.3 ObjectId

```js
// ObjectId is a 12-byte unique identifier
// Structure: 4-byte timestamp | 5-byte random | 3-byte counter
const id = ObjectId("65a1b2c3d4e5f6a7b8c9d0e1");

id.getTimestamp();    // Date from the first 4 bytes
id.toString();        // "65a1b2c3d4e5f6a7b8c9d0e1"
```

### 2.4 Data Types

```js
{
  string: "hello",
  number: 42,                       // stored as int32, int64, or double
  decimal: NumberDecimal("19.99"),   // exact decimal (financial data)
  boolean: true,
  date: new Date(),                  // ISODate
  null: null,
  objectId: ObjectId(),
  array: [1, 2, 3],
  object: { nested: true },
  binary: BinData(0, "base64data"),
  regex: /pattern/i,
  timestamp: Timestamp()             // internal, for replication
}
```

---

## 3. CRUD Operations

### 3.1 Create

```js
// Insert one document
db.users.insertOne({
  name: "Alice",
  email: "alice@example.com",
  age: 30
});
// Returns: { insertedId: ObjectId("...") }

// Insert many documents
db.users.insertMany([
  { name: "Bob", email: "bob@example.com", age: 25 },
  { name: "Charlie", email: "charlie@example.com", age: 35 },
]);
// Returns: { insertedIds: { 0: ObjectId("..."), 1: ObjectId("...") } }
```

### 3.2 Read

```js
// Find all
db.users.find();

// Find with filter
db.users.find({ age: { $gte: 25 } });

// Find one
db.users.findOne({ email: "alice@example.com" });

// Projection (select specific fields)
db.users.find(
  { age: { $gte: 25 } },
  { name: 1, email: 1, _id: 0 }           // include name, email; exclude _id
);

// Sort, limit, skip (pagination)
db.users.find()
  .sort({ age: -1 })                       // descending
  .skip(20)                                 // skip first 20
  .limit(10);                               // return 10

// Count
db.users.countDocuments({ age: { $gte: 25 } });
db.users.estimatedDocumentCount();          // fast estimate (metadata-based)

// Distinct values
db.users.distinct("city");                  // ["New York", "London", ...]
```

### 3.3 Update

```js
// Update one
db.users.updateOne(
  { email: "alice@example.com" },           // filter
  { $set: { age: 31, updatedAt: new Date() } } // update
);

// Update many
db.users.updateMany(
  { isActive: false },
  { $set: { status: "archived" } }
);

// Replace entire document (except _id)
db.users.replaceOne(
  { email: "alice@example.com" },
  { name: "Alice", email: "alice@example.com", age: 31 }
);

// Upsert (insert if not found)
db.users.updateOne(
  { email: "new@example.com" },
  { $set: { name: "New User", age: 25 } },
  { upsert: true }
);

// Find and modify (return the document)
db.users.findOneAndUpdate(
  { email: "alice@example.com" },
  { $inc: { loginCount: 1 } },
  { returnDocument: "after" }               // return updated document
);
```

### 3.4 Delete

```js
// Delete one
db.users.deleteOne({ email: "alice@example.com" });

// Delete many
db.users.deleteMany({ isActive: false });

// Find and delete (return deleted document)
db.users.findOneAndDelete({ email: "alice@example.com" });

// Drop entire collection
db.users.drop();
```

---

## 4. Query Operators

### 4.1 Comparison

```js
db.users.find({ age: { $eq: 30 } });       // equal (same as { age: 30 })
db.users.find({ age: { $ne: 30 } });       // not equal
db.users.find({ age: { $gt: 25 } });       // greater than
db.users.find({ age: { $gte: 25 } });      // greater than or equal
db.users.find({ age: { $lt: 35 } });       // less than
db.users.find({ age: { $lte: 35 } });      // less than or equal
db.users.find({ age: { $in: [25, 30, 35] } }); // in array
db.users.find({ age: { $nin: [25, 30] } }); // not in array
```

### 4.2 Logical

```js
// AND (implicit)
db.users.find({ age: { $gte: 25 }, isActive: true });

// AND (explicit)
db.users.find({ $and: [{ age: { $gte: 25 } }, { isActive: true }] });

// OR
db.users.find({ $or: [{ age: { $lt: 25 } }, { age: { $gt: 35 } }] });

// NOT
db.users.find({ age: { $not: { $gte: 30 } } });

// NOR (neither condition)
db.users.find({ $nor: [{ isActive: false }, { isDeleted: true }] });
```

### 4.3 Element

```js
db.users.find({ email: { $exists: true } });     // field exists
db.users.find({ age: { $type: "number" } });      // field is number type
```

### 4.4 Array

```js
// Match array containing value
db.users.find({ skills: "React" });                // has "React" in skills array

// Match all values
db.users.find({ skills: { $all: ["React", "TypeScript"] } });

// Array size
db.users.find({ skills: { $size: 3 } });          // exactly 3 skills

// Element match (object in array)
db.users.find({
  experience: {
    $elemMatch: { company: "Google", years: { $gte: 2 } }
  }
});
```

### 4.5 String / Regex

```js
db.users.find({ name: { $regex: /^ali/i } });     // starts with "ali" (case insensitive)
db.users.find({ name: /alice/i });                  // shorthand regex

// Text search (requires text index)
db.users.find({ $text: { $search: "senior developer" } });
```

### 4.6 Update Operators

```js
// Set fields
{ $set: { name: "Alice", age: 31 } }

// Unset fields (remove)
{ $unset: { temporaryField: "" } }

// Increment
{ $inc: { age: 1, loginCount: 1 } }

// Multiply
{ $mul: { price: 1.1 } }                          // increase by 10%

// Min/Max (only update if new value is less/more)
{ $min: { lowScore: 50 } }
{ $max: { highScore: 100 } }

// Rename field
{ $rename: { "old_name": "newName" } }

// Current date
{ $currentDate: { lastModified: true } }

// Array: push
{ $push: { skills: "GraphQL" } }
{ $push: { skills: { $each: ["GraphQL", "Docker"], $position: 0 } } }

// Array: pull (remove)
{ $pull: { skills: "jQuery" } }
{ $pull: { scores: { $lt: 50 } } }

// Array: add to set (no duplicates)
{ $addToSet: { skills: "React" } }

// Array: pop
{ $pop: { skills: 1 } }                           // remove last
{ $pop: { skills: -1 } }                          // remove first
```

---

## 5. Aggregation Pipeline

The aggregation pipeline processes documents through a sequence of stages. Each stage transforms the documents.

### 5.1 Pipeline Stages

```js
db.orders.aggregate([
  // Stage 1: Filter
  { $match: { status: "completed" } },

  // Stage 2: Join with another collection
  { $lookup: {
    from: "users",
    localField: "userId",
    foreignField: "_id",
    as: "user"
  }},

  // Stage 3: Unwind array (1 doc per user)
  { $unwind: "$user" },

  // Stage 4: Group and aggregate
  { $group: {
    _id: "$user.name",
    totalOrders: { $sum: 1 },
    totalSpent: { $sum: "$amount" },
    avgOrder: { $avg: "$amount" },
    lastOrder: { $max: "$createdAt" }
  }},

  // Stage 5: Sort
  { $sort: { totalSpent: -1 } },

  // Stage 6: Limit
  { $limit: 10 },

  // Stage 7: Project (reshape output)
  { $project: {
    _id: 0,
    name: "$_id",
    totalOrders: 1,
    totalSpent: { $round: ["$totalSpent", 2] },
    avgOrder: { $round: ["$avgOrder", 2] }
  }}
]);
```

### 5.2 Common Stages

```js
// $match - filter documents
{ $match: { age: { $gte: 18 } } }

// $group - group by field, compute aggregates
{ $group: {
  _id: "$department",                      // group key
  count: { $sum: 1 },
  avgSalary: { $avg: "$salary" },
  names: { $push: "$name" },              // collect into array
  uniqueRoles: { $addToSet: "$role" }
}}

// $project - reshape documents
{ $project: {
  fullName: { $concat: ["$firstName", " ", "$lastName"] },
  age: 1,
  _id: 0
}}

// $sort
{ $sort: { createdAt: -1 } }              // descending

// $limit and $skip
{ $skip: 20 }
{ $limit: 10 }

// $unwind - deconstruct array (1 doc per element)
{ $unwind: "$tags" }
{ $unwind: { path: "$tags", preserveNullAndEmptyArrays: true } }

// $lookup - left outer join
{ $lookup: {
  from: "products",
  localField: "productId",
  foreignField: "_id",
  as: "product"
}}

// $addFields - add computed fields
{ $addFields: {
  totalPrice: { $multiply: ["$price", "$quantity"] },
  discountedPrice: { $multiply: ["$price", 0.9] }
}}

// $facet - multiple pipelines on same data
{ $facet: {
  stats: [{ $group: { _id: null, total: { $sum: 1 } } }],
  topResults: [{ $sort: { score: -1 } }, { $limit: 5 }],
  byCategory: [{ $group: { _id: "$category", count: { $sum: 1 } } }]
}}

// $bucket - group into ranges
{ $bucket: {
  groupBy: "$age",
  boundaries: [0, 18, 30, 50, 100],
  default: "Other",
  output: { count: { $sum: 1 } }
}}
```

### 5.3 Aggregation Expressions

```js
// String
{ $concat: ["$firstName", " ", "$lastName"] }
{ $toUpper: "$name" }
{ $toLower: "$email" }
{ $substr: ["$name", 0, 3] }

// Math
{ $add: ["$price", "$tax"] }
{ $subtract: ["$total", "$discount"] }
{ $multiply: ["$price", "$qty"] }
{ $divide: ["$total", "$count"] }
{ $round: ["$avg", 2] }

// Date
{ $year: "$createdAt" }
{ $month: "$createdAt" }
{ $dayOfMonth: "$createdAt" }
{ $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }

// Conditional
{ $cond: {
  if: { $gte: ["$score", 90] },
  then: "A",
  else: "B"
}}

{ $switch: {
  branches: [
    { case: { $gte: ["$score", 90] }, then: "A" },
    { case: { $gte: ["$score", 80] }, then: "B" },
    { case: { $gte: ["$score", 70] }, then: "C" },
  ],
  default: "F"
}}

// Array
{ $size: "$skills" }
{ $arrayElemAt: ["$scores", 0] }
{ $filter: {
  input: "$scores",
  as: "score",
  cond: { $gte: ["$$score", 70] }
}}
```

---

## 6. Indexes

### 6.1 Index Types

```js
// Single field index
db.users.createIndex({ email: 1 });                // ascending
db.users.createIndex({ createdAt: -1 });            // descending

// Compound index (field order matters)
db.users.createIndex({ department: 1, createdAt: -1 });

// Unique index
db.users.createIndex({ email: 1 }, { unique: true });

// Partial index (index only matching documents)
db.users.createIndex(
  { email: 1 },
  { partialFilterExpression: { isActive: true } }
);

// TTL index (auto-delete documents after time)
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }                      // delete after 1 hour
);

// Text index (full-text search)
db.articles.createIndex({ title: "text", body: "text" });

// Compound text index with weights
db.articles.createIndex(
  { title: "text", body: "text" },
  { weights: { title: 10, body: 1 } }
);

// Wildcard index (index all fields)
db.logs.createIndex({ "$**": 1 });

// Geospatial index
db.places.createIndex({ location: "2dsphere" });
```

### 6.2 Index Management

```js
// List indexes
db.users.getIndexes();

// Drop index
db.users.dropIndex("email_1");
db.users.dropIndexes();                    // drop all (except _id)

// Explain query (check if index is used)
db.users.find({ email: "alice@example.com" }).explain("executionStats");
// Look for: "stage": "IXSCAN" (good) vs "COLLSCAN" (bad)
```

### 6.3 Index Strategies

```
1. Index fields used in queries (filter, sort, join)
2. Compound index order: Equality → Sort → Range (ESR rule)
3. Covered queries: if all fields are in the index, MongoDB doesn't read documents
4. Don't over-index: each index costs write performance and memory
5. Use explain() to verify index usage
6. Partial indexes for queries on subsets of documents
```

---

## 7. Schema Design

### 7.1 Embedding vs Referencing

```js
// EMBEDDING (denormalized) — good for 1:few, data read together
{
  _id: ObjectId("..."),
  name: "Alice",
  address: {                               // embedded
    street: "123 Main St",
    city: "NYC"
  },
  orders: [                                // embedded array
    { product: "Widget", qty: 2, price: 9.99 },
    { product: "Gadget", qty: 1, price: 24.99 }
  ]
}

// REFERENCING (normalized) — good for 1:many, many:many, large/growing data
// User document
{
  _id: ObjectId("user1"),
  name: "Alice"
}
// Order documents (separate collection)
{
  _id: ObjectId("order1"),
  userId: ObjectId("user1"),               // reference
  product: "Widget",
  qty: 2
}
```

### 7.2 When to Embed vs Reference

| Embed | Reference |
|-------|-----------|
| Data is read together | Data is read independently |
| 1:1 or 1:few relationship | 1:many or many:many |
| Data rarely changes | Data changes frequently |
| Document stays under 16MB | Sub-documents could grow unbounded |
| Need atomic updates | Need to query sub-documents independently |

### 7.3 Common Patterns

```js
// Pattern 1: Subset pattern — embed frequently accessed fields, reference the rest
// User profile (embedded subset)
{
  _id: ObjectId("..."),
  name: "Alice",
  avatarUrl: "/img/alice.jpg",
  recentOrders: [/* last 5 orders */]      // subset
}
// Full order history in separate collection

// Pattern 2: Bucket pattern — group time-series data
{
  sensorId: "temp-01",
  date: ISODate("2024-01-15"),
  readings: [
    { time: ISODate("2024-01-15T00:00:00Z"), value: 22.5 },
    { time: ISODate("2024-01-15T00:05:00Z"), value: 22.7 },
    // ... up to 288 readings per day (5-min intervals)
  ],
  count: 288,
  sum: 6480,
  min: 20.1,
  max: 25.3
}

// Pattern 3: Polymorphic pattern — different shapes in same collection
// All "content" types in one collection
{ type: "article", title: "...", body: "..." }
{ type: "video", title: "...", url: "...", duration: 120 }
{ type: "podcast", title: "...", url: "...", episodes: 50 }

// Pattern 4: Attribute pattern — dynamic key-value pairs
{
  name: "Laptop",
  attributes: [
    { key: "cpu", value: "M3 Pro", unit: null },
    { key: "ram", value: 36, unit: "GB" },
    { key: "storage", value: 1, unit: "TB" }
  ]
}
```

---

## 8. Mongoose ODM

### 8.1 Connection

```js
const mongoose = require('mongoose');

await mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
});

mongoose.connection.on('connected', () => console.log('Connected'));
mongoose.connection.on('error', (err) => console.error(err));
```

### 8.2 Schema and Model

```js
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  password: { type: String, required: true, select: false },
  age: { type: Number, min: 0, max: 150 },
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  skills: [String],
  address: {
    street: String,
    city: String,
    zip: String
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,                        // adds createdAt, updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const User = mongoose.model('User', userSchema);
```

### 8.3 CRUD with Mongoose

```js
// Create
const user = await User.create({ name: 'Alice', email: 'a@b.com' });
// or
const user = new User({ name: 'Alice' });
await user.save();

// Read
const users = await User.find({ isActive: true })
  .select('name email')
  .sort('-createdAt')
  .limit(20)
  .skip(0)
  .lean();                                 // return plain objects (faster)

const user = await User.findById(id);
const user = await User.findOne({ email: 'a@b.com' });

// Update
await User.findByIdAndUpdate(id, { name: 'Bob' }, { new: true, runValidators: true });
await User.updateMany({ isActive: false }, { $set: { role: 'archived' } });

// Delete
await User.findByIdAndDelete(id);
await User.deleteMany({ isActive: false });
```

### 8.4 Population (Joins)

```js
// Schema with reference
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
});

// Populate (resolve references)
const order = await Order.findById(id)
  .populate('user', 'name email')          // select specific fields
  .populate('product');

// Deep populate
const order = await Order.findById(id)
  .populate({
    path: 'user',
    select: 'name department',
    populate: { path: 'department', select: 'name' }
  });
```

### 8.5 Middleware (Hooks)

```js
// Pre-save hook
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Post-save hook
userSchema.post('save', function(doc) {
  console.log(`User ${doc.name} saved`);
});

// Pre-find hook (e.g., exclude deleted)
userSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Pre-remove hook
userSchema.pre('findOneAndDelete', async function(next) {
  const user = await this.model.findOne(this.getQuery());
  await Order.deleteMany({ user: user._id });   // cascade delete
  next();
});
```

### 8.6 Virtual Properties

```js
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual populate (reverse lookup without storing reference)
userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'user',
});

const user = await User.findById(id).populate('orders');
```

### 8.7 Static and Instance Methods

```js
// Static method (on the Model)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};
const user = await User.findByEmail('a@b.com');

// Instance method (on a document)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
const isMatch = await user.comparePassword('mypassword');
```

---

## 9. Transactions

Multi-document transactions ensure atomicity across multiple operations.

```js
const session = await mongoose.startSession();

try {
  session.startTransaction();

  // All operations in the transaction
  const user = await User.create([{ name: 'Alice' }], { session });
  await Account.create([{ userId: user[0]._id, balance: 0 }], { session });
  await AuditLog.create([{ action: 'user_created', userId: user[0]._id }], { session });

  // Commit
  await session.commitTransaction();
} catch (error) {
  // Rollback
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Requirements**: Transactions require a replica set (even for development — use `mongod --replSet`).

---

## 10. Replication and Sharding

### 10.1 Replica Sets

```
Primary (reads + writes) ←→ Secondary (reads) ←→ Secondary (reads)
                              ↕ (automatic failover)
                            Arbiter (votes only, no data)
```

- **Primary**: Receives all writes
- **Secondary**: Replicates data from primary, can serve reads
- **Arbiter**: Votes in elections, holds no data
- If primary goes down, secondaries elect a new primary (automatic failover)

### 10.2 Sharding (Horizontal Scaling)

```
Client → mongos (router) → Shard 1 (replica set)
                          → Shard 2 (replica set)
                          → Shard 3 (replica set)

Config servers store shard metadata (which data is where)
```

**Shard key**: Determines how data is distributed across shards.

```js
sh.shardCollection("mydb.orders", { userId: "hashed" });
// or
sh.shardCollection("mydb.orders", { region: 1, createdAt: 1 });
```

Good shard key: high cardinality, even distribution, matches query patterns.

---

## 11. Performance

### 11.1 Query Optimization

```js
// Use explain() to analyze queries
db.users.find({ age: { $gt: 25 } }).explain("executionStats");
// Check: totalDocsExamined, executionTimeMillis, stage (IXSCAN vs COLLSCAN)

// Use projections (return only needed fields)
db.users.find({}, { name: 1, email: 1 });

// Use .lean() in Mongoose (skip hydration)
const users = await User.find().lean();

// Use covered queries (all fields in the index)
db.users.createIndex({ email: 1, name: 1 });
db.users.find({ email: "a@b.com" }, { email: 1, name: 1, _id: 0 });
// MongoDB reads from index only — no document access

// Avoid $where and $regex without anchors
// BAD: db.users.find({ name: /alice/ })     // scans all strings
// GOOD: db.users.find({ name: /^alice/i })  // can use index prefix
```

### 11.2 Bulk Operations

```js
const bulk = db.users.initializeOrderedBulkOp();
bulk.insert({ name: "Alice" });
bulk.find({ email: "bob@example.com" }).updateOne({ $set: { age: 26 } });
bulk.find({ isDeleted: true }).delete();
await bulk.execute();

// Mongoose bulkWrite
await User.bulkWrite([
  { insertOne: { document: { name: "Alice" } } },
  { updateOne: { filter: { email: "bob@b.com" }, update: { $set: { age: 26 } } } },
  { deleteOne: { filter: { email: "old@b.com" } } },
]);
```

---

## 12. Security

```js
// 1. Authentication
mongod --auth                              // enable auth

// 2. Role-based access control
db.createUser({
  user: "appUser",
  pwd: "securePassword",
  roles: [{ role: "readWrite", db: "myapp" }]
});

// 3. Network security
// - Bind to specific IP: mongod --bind_ip 127.0.0.1,192.168.1.100
// - Use TLS/SSL
// - Firewall rules

// 4. Field-level encryption (client-side)
// MongoDB supports automatic client-side field-level encryption

// 5. Audit logging
// Enterprise feature: track who did what

// 6. Input sanitization (prevent NoSQL injection)
// BAD: db.users.find({ email: req.body.email })
// If req.body.email = { $gt: "" }, it returns all users!

// GOOD: validate and sanitize input
const email = String(req.body.email);      // force to string
// Or use express-mongo-sanitize middleware
```

---

## 13. Interview Questions & Answers

### Beginner

---

**Q1: What is MongoDB and how does it differ from SQL databases?**

MongoDB is a document-oriented NoSQL database. Key differences:

| Aspect | SQL (MySQL/PostgreSQL) | MongoDB |
|--------|----------------------|---------|
| Data model | Tables, rows, columns | Collections, documents (JSON-like) |
| Schema | Fixed, predefined | Flexible, dynamic |
| Relationships | JOINs | Embedding or referencing ($lookup) |
| Scaling | Vertical (bigger server) | Horizontal (sharding) |
| Transactions | Strong ACID | ACID (multi-document since 4.0) |
| Query language | SQL | MQL (MongoDB Query Language) |
| Best for | Complex relationships, strict schema | Flexible data, rapid iteration, large scale |

---

**Q2: What is a document in MongoDB?**

A document is a JSON-like record (stored as BSON) that serves as the basic unit of data. Documents have key-value pairs and can contain nested objects and arrays.

```json
{
  "_id": "ObjectId(...)",
  "name": "Alice",
  "skills": ["React", "Node"],
  "address": { "city": "NYC" }
}
```

Unlike SQL rows, documents in the same collection can have different structures.

---

**Q3: What is the `_id` field?**

`_id` is the primary key of every MongoDB document. If you don't provide one, MongoDB auto-generates an `ObjectId` — a 12-byte unique identifier containing a timestamp, random value, and counter. You can use any unique value as `_id` (string, number, etc.), but `ObjectId` is the default and recommended type.

---

**Q4: What is the difference between `find()` and `findOne()`?**

- `find()`: Returns a cursor (iterable) of all matching documents. Even if only one matches, it returns a cursor.
- `findOne()`: Returns the first matching document directly (not a cursor), or `null` if nothing matches.

Use `findOne()` when you need a single document (by ID or unique field). Use `find()` for queries that return multiple results.

---

**Q5: What is embedding vs referencing?**

- **Embedding**: Store related data inside the same document (nested objects/arrays). Good for data that's always read together.
- **Referencing**: Store related data in separate collections and link via `ObjectId`. Good for large, independent, or many-to-many data.

```js
// Embedded
{ name: "Alice", address: { city: "NYC" } }

// Referenced
{ name: "Alice", addressId: ObjectId("...") }
```

---

### Intermediate

---

**Q6: Explain the aggregation pipeline.**

The aggregation pipeline is a framework for data transformation and analysis. Documents pass through a sequence of stages, each transforming the data:

```js
db.orders.aggregate([
  { $match: { status: "completed" } },    // filter
  { $group: { _id: "$userId", total: { $sum: "$amount" } } }, // group
  { $sort: { total: -1 } },               // sort
  { $limit: 10 }                          // limit
]);
```

Common stages: `$match`, `$group`, `$project`, `$sort`, `$lookup` (join), `$unwind`, `$facet`, `$bucket`. It's more powerful than simple `find()` queries — equivalent to SQL's GROUP BY, HAVING, JOIN, subqueries, etc.

---

**Q7: How do indexes work in MongoDB? What types are there?**

Indexes are data structures that speed up queries by allowing MongoDB to find documents without scanning every document (COLLSCAN).

Types:
1. **Single field**: `{ email: 1 }` — index one field
2. **Compound**: `{ department: 1, createdAt: -1 }` — multiple fields (order matters)
3. **Unique**: Enforces uniqueness
4. **Text**: Full-text search
5. **TTL**: Auto-delete documents after time
6. **Partial**: Index only documents matching a condition
7. **Wildcard**: Index all fields dynamically
8. **Geospatial**: `2dsphere` for location queries

Trade-off: Indexes speed up reads but slow down writes (index must be updated on every insert/update/delete) and consume memory.

---

**Q8: What is the difference between `$push` and `$addToSet`?**

Both add elements to an array:
- `$push`: Always adds the element (allows duplicates)
- `$addToSet`: Only adds if the element doesn't already exist (prevents duplicates)

```js
// Array: ["React"]
{ $push: { skills: "React" } }      // Result: ["React", "React"]
{ $addToSet: { skills: "React" } }  // Result: ["React"] (no change)
```

---

**Q9: How does MongoDB handle transactions?**

MongoDB supports multi-document ACID transactions (since version 4.0). They work across multiple documents, collections, and databases within a replica set.

```js
const session = await mongoose.startSession();
session.startTransaction();
try {
  await Account.updateOne({ _id: from }, { $inc: { balance: -100 } }, { session });
  await Account.updateOne({ _id: to }, { $inc: { balance: 100 } }, { session });
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
}
session.endSession();
```

Limitations: Transactions add overhead, require replica sets, and have a 60-second default timeout. Design your schema to minimize the need for transactions.

---

**Q10: Explain `$lookup` in the aggregation pipeline.**

`$lookup` performs a left outer join with another collection, similar to SQL JOIN:

```js
{ $lookup: {
  from: "orders",              // collection to join
  localField: "_id",           // field from input documents
  foreignField: "userId",      // field from "orders" collection
  as: "userOrders"             // output array field
}}
```

The result adds an array field (`userOrders`) to each document. If no match, the array is empty (left outer join).

For complex joins, use the pipeline form:
```js
{ $lookup: {
  from: "orders",
  let: { userId: "$_id" },
  pipeline: [
    { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
    { $sort: { createdAt: -1 } },
    { $limit: 5 }
  ],
  as: "recentOrders"
}}
```

---

### Advanced

---

**Q11: How would you design a schema for a social media feed (posts, comments, likes)?**

```js
// Posts — own collection (queried independently, can grow large)
{
  _id: ObjectId("..."),
  authorId: ObjectId("..."),
  content: "Hello world!",
  mediaUrls: ["image1.jpg"],
  likeCount: 42,                           // denormalized counter
  commentCount: 5,                         // denormalized counter
  recentComments: [                        // subset pattern (last 3)
    { authorId: ObjectId("..."), text: "Great post!", createdAt: Date }
  ],
  createdAt: Date
}

// Comments — separate collection (can grow unbounded per post)
{
  _id: ObjectId("..."),
  postId: ObjectId("..."),
  authorId: ObjectId("..."),
  text: "Nice!",
  createdAt: Date
}

// Likes — separate collection (many:many, need to check if user already liked)
{
  _id: ObjectId("..."),
  postId: ObjectId("..."),
  userId: ObjectId("..."),
  createdAt: Date
}
// Compound unique index: { postId: 1, userId: 1 } — prevents double-likes
```

Reasoning:
- Posts: embed recent comments (subset pattern) for fast feed rendering
- Comments: separate collection because they can grow unbounded
- Likes: separate collection with compound unique index for deduplication
- Denormalized counters avoid expensive `$count` aggregations

---

**Q12: Explain the ESR (Equality-Sort-Range) rule for compound indexes.**

When creating a compound index, order the fields for optimal performance:

1. **Equality** conditions first (exact match: `{ status: "active" }`)
2. **Sort** fields next (what you `sort()` by)
3. **Range** conditions last (`{ age: { $gte: 25 } }`)

```js
// Query: find active users, sorted by name, age > 25
db.users.find({ status: "active", age: { $gte: 25 } }).sort({ name: 1 });

// Optimal index:
db.users.createIndex({ status: 1, name: 1, age: 1 });
//                      equality    sort    range
```

Why: Equality narrows to exact matches (most selective). Sort avoids in-memory sorting. Range at the end doesn't break the sort order.

---

**Q13: How does MongoDB sharding work? How do you choose a shard key?**

Sharding distributes data across multiple servers (shards). A **mongos** router directs queries to the right shard based on the **shard key**.

Choosing a shard key:
- **High cardinality**: Many unique values (avoid boolean or status fields)
- **Even distribution**: Data should spread evenly (avoid monotonically increasing keys like `_id`)
- **Query isolation**: Common queries should target a single shard (include the shard key in queries)

```js
// Good: hashed _id (even distribution, but scatter-gather for range queries)
sh.shardCollection("mydb.users", { _id: "hashed" });

// Good: compound key (query isolation + distribution)
sh.shardCollection("mydb.orders", { userId: 1, createdAt: 1 });
```

Bad shard keys: `{ status: 1 }` (low cardinality), `{ createdAt: 1 }` (all writes go to one shard).

---

**Q14: What is the `$facet` stage and when would you use it?**

`$facet` runs multiple sub-pipelines on the same input documents, returning results in a single response. Each sub-pipeline gets its own output field.

```js
db.products.aggregate([
  { $match: { category: "electronics" } },
  { $facet: {
    // Sub-pipeline 1: pagination metadata
    metadata: [{ $count: "total" }],

    // Sub-pipeline 2: actual results
    data: [
      { $sort: { price: -1 } },
      { $skip: 20 },
      { $limit: 10 }
    ],

    // Sub-pipeline 3: price ranges
    priceRanges: [
      { $bucket: {
        groupBy: "$price",
        boundaries: [0, 100, 500, 1000, Infinity],
        output: { count: { $sum: 1 } }
      }}
    ]
  }}
]);
```

Use cases: pagination with total count, search results with faceted filters (like e-commerce category/price/brand filters), dashboard KPIs from the same data set.

---

**Q15: How do you handle schema migrations in MongoDB?**

Unlike SQL databases, MongoDB doesn't require formal migrations for schema changes because it's schema-flexible. However, for production systems:

1. **Lazy migration**: Update documents on read/write
   ```js
   // In application code, handle both old and new formats
   const name = doc.fullName || `${doc.firstName} ${doc.lastName}`;
   ```

2. **Background migration scripts**: Run async jobs to update all documents
   ```js
   await db.users.updateMany(
     { fullName: { $exists: false } },
     [{ $set: { fullName: { $concat: ["$firstName", " ", "$lastName"] } } }]
   );
   ```

3. **Schema validation** (enforce shape going forward):
   ```js
   db.createCollection("users", {
     validator: {
       $jsonSchema: {
         required: ["name", "email"],
         properties: {
           name: { bsonType: "string" },
           email: { bsonType: "string" }
         }
       }
     }
   });
   ```

4. **Versioning**: Add a `schemaVersion` field and handle different versions in code.

---

**Q16: Explain read/write concerns and read preferences.**

**Write Concern** — how many replica set members must acknowledge a write:
- `w: 1` — acknowledged by primary (default)
- `w: "majority"` — acknowledged by majority of members (durable)
- `w: 0` — fire and forget (fastest, no guarantee)

**Read Concern** — what data a read sees:
- `"local"` — latest data on current node (may not be replicated)
- `"majority"` — data acknowledged by majority (durable reads)
- `"linearizable"` — most recent majority write (strongest, slowest)

**Read Preference** — which node to read from:
- `primary` — only primary (default, most consistent)
- `primaryPreferred` — primary, fallback to secondary
- `secondary` — only secondaries (eventual consistency)
- `secondaryPreferred` — secondary, fallback to primary
- `nearest` — lowest latency node

---

**Q17: How do you prevent NoSQL injection?**

MongoDB is vulnerable to injection when user input is passed directly as query objects:

```js
// Vulnerable:
const user = await User.findOne({ email: req.body.email });
// If req.body.email = { "$gt": "" }, it returns the first user!

// Prevention:
// 1. Validate input types
const email = String(req.body.email);

// 2. Use express-mongo-sanitize middleware
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());  // removes $ and . from req.body/query/params

// 3. Use schema validation (Mongoose validates types automatically)
// 4. Never pass raw req.body to queries
// 5. Use parameterized queries in aggregation
```

---

**Q18: What is Change Streams and when would you use it?**

Change Streams let you watch for real-time changes to a collection, database, or deployment:

```js
const changeStream = db.collection('orders').watch([
  { $match: { operationType: { $in: ['insert', 'update'] } } }
]);

changeStream.on('change', (change) => {
  console.log(change.operationType);       // 'insert', 'update', 'delete', 'replace'
  console.log(change.fullDocument);        // the document (for insert/update)
  console.log(change.updateDescription);   // changed fields (for update)
});
```

Use cases:
- Real-time notifications (new order -> send email)
- Cache invalidation (document changed -> invalidate cache)
- Data synchronization (replicate changes to another system)
- Event sourcing / audit trails

Requires replica set. Uses the oplog internally.

---

## References

- [MongoDB Manual](https://www.mongodb.com/docs/manual) — Official documentation
- [MongoDB University](https://learn.mongodb.com) — Free courses and certifications
- [Mongoose Documentation](https://mongoosejs.com/docs) — ODM library for Node.js
