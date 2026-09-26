const e=`# Database Schema Design Guide

A comprehensive guide to database schema design for MongoDB and relational databases, covering modeling patterns, relationships, indexing, migrations, and interview preparation.

---

## Table of Contents

1. [Schema Design Fundamentals](#1-schema-design-fundamentals)
2. [MongoDB Schema Design](#2-mongodb-schema-design)
3. [Embedding vs Referencing](#3-embedding-vs-referencing)
4. [Common Schema Patterns](#4-common-schema-patterns)
5. [Mongoose ODM](#5-mongoose-odm)
6. [Indexing Strategies](#6-indexing-strategies)
7. [Data Modeling for Common Domains](#7-data-modeling-for-common-domains)
8. [Schema Migrations](#8-schema-migrations)
9. [Relational Database Design](#9-relational-database-design)
10. [Normalization](#10-normalization)
11. [Denormalization & Performance](#11-denormalization-performance)
12. [Multi-Tenancy Schema Design](#12-multi-tenancy-schema-design)
13. [Schema Validation](#13-schema-validation)
14. [Time-Series & Event Data](#14-time-series-event-data)
15. [Interview Questions](#15-interview-questions)

---

## 1. Schema Design Fundamentals

### Data Modeling Process

\`\`\`
1. Identify entities (users, jobs, candidates, etc.)
2. Define attributes for each entity
3. Identify relationships (one-to-one, one-to-many, many-to-many)
4. Determine access patterns (how data is read/written)
5. Choose embedding vs referencing (for document DBs)
6. Add indexes for query patterns
7. Plan for scale and evolution
\`\`\`

### Key Principles

The idea behind every principle below: **design the storage around the questions your app asks most often.** A schema that mirrors your real-world nouns neatly but needs five lookups to render the main page is a bad schema, however tidy it looks.

\`\`\`
1. Model for your queries, not your entities
   - In MongoDB: structure documents around how data is accessed
   - In SQL: normalize first, denormalize for performance

2. Avoid unbounded arrays
   - Don't embed arrays that can grow indefinitely
   - MongoDB document size limit: 16 MB

3. Keep related data together
   - Data accessed together should be stored together
   - Reduces the need for joins/lookups

4. Plan for evolution
   - Schemas change over time
   - Use versioning or migrations

5. Index strategically
   - Index fields used in queries, filters, and sorts
   - Don't over-index (slows writes, uses memory)
\`\`\`

---

## 2. MongoDB Schema Design

### Document Structure

\`\`\`json
// A MongoDB document is a JSON-like object
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  title: "Senior React Developer",
  status: "open",
  department: {
    _id: ObjectId("507f1f77bcf86cd799439022"),
    name: "Engineering"
  },
  skills: [
    { name: "React", isPrimary: true, minYears: 3, maxYears: null },
    { name: "TypeScript", isPrimary: true, minYears: 2, maxYears: 5 },
    { name: "Node.js", isPrimary: false, minYears: 0, maxYears: null }
  ],
  salary: {
    min: 120000,
    max: 180000,
    currency: "USD"
  },
  createdBy: ObjectId("507f1f77bcf86cd799439033"),
  tenantId: "tenant-abc",
  createdAt: ISODate("2026-03-06T10:00:00Z"),
  updatedAt: ISODate("2026-03-06T10:00:00Z")
}
\`\`\`

### Data Types

\`\`\`json
// Common MongoDB/BSON types
{
  stringField: "hello",                        // String
  numberField: 42,                             // Number (Double or Int32/Int64)
  booleanField: true,                          // Boolean
  dateField: new Date("2026-03-06"),           // Date
  objectIdField: new ObjectId(),               // ObjectId (12-byte)
  arrayField: [1, 2, 3],                       // Array
  embeddedDoc: { key: "value" },              // Object (embedded document)
  nullField: null,                             // Null
  decimalField: Decimal128("19.99"),          // Decimal128 (precise)
  binaryField: BinData(0, "base64data"),      // Binary
  regexField: /^pattern$/i,                    // Regular expression
}
\`\`\`

---

## 3. Embedding vs Referencing

### When to Embed

*Embedding* means putting related data inside the parent document, so one read returns everything. It is the default in MongoDB when the child data has no life of its own: an address only matters as part of its user.

\`\`\`json
// Embed when:
// 1. Data is always accessed together
// 2. Child data belongs to exactly one parent
// 3. Array size is bounded and small
// 4. Read performance is critical (one query, no joins)

// Example: User with address (1:1, always fetched together)
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  address: {
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
    country: "US"
  }
}

// Example: Job with skills (1:few, bounded)
{
  _id: ObjectId("..."),
  title: "React Developer",
  skills: [
    { name: "React", isPrimary: true, minYears: 3 },
    { name: "TypeScript", isPrimary: true, minYears: 2 }
  ]
}
\`\`\`

### When to Reference

*Referencing* means storing only the other document's \`_id\` and fetching it separately (with Mongoose's \`populate()\` or the \`$lookup\` aggregation stage), much like a foreign key in SQL. You pay an extra lookup, and in exchange documents stay small and a shared record exists only once. The deciding question is usually growth: a job can receive thousands of candidates, and one MongoDB document is capped at 16 MB, so the candidates cannot live inside the job.

\`\`\`json
// Reference when:
// 1. Related data is accessed independently
// 2. Array can grow unbounded
// 3. Many-to-many relationship
// 4. Data is shared across multiple parents
// 5. Write-heavy on the related data

// Example: Job references candidates (1:many, unbounded)
// Job document
{
  _id: ObjectId("job-123"),
  title: "React Developer",
  candidateCount: 150
}

// Candidate document (separate collection)
{
  _id: ObjectId("candidate-456"),
  name: "Alice Smith",
  jobId: ObjectId("job-123"),  // Reference
  matchPercentage: 85,
  appliedAt: ISODate("2026-03-06T10:00:00Z")
}

// Example: Many-to-many (users ↔ departments)
// User document
{
  _id: ObjectId("user-1"),
  name: "John",
  departmentIds: [ObjectId("dept-1"), ObjectId("dept-2")]
}

// Department document
{
  _id: ObjectId("dept-1"),
  name: "Engineering",
  memberCount: 25
}
\`\`\`

### Hybrid Approach

The hybrid copies the one or two fields you *display* (a department's name) into the parent, while the full record stays in its own collection. You get the fast single-read of embedding for the common screen, and accept that a rename must update every copy.

\`\`\`javascript
// Store frequently accessed fields from related docs
// "Denormalized reference"

// Job document with partial department data
const jobWithDenormalisedDepartment = {
  _id: ObjectId("job-123"),
  title: "React Developer",
  department: {
    _id: ObjectId("dept-1"),
    name: "Engineering"       // Denormalized for read performance
  }
  // Full department data lives in departments collection
};

// Pros: Fast reads (no join needed for display name)
// Cons: Must update denormalized data when department name changes
// Use when: The denormalized field rarely changes
\`\`\`

### Decision Matrix

\`\`\`
                       Embed              Reference
─────────────────────────────────────────────────────
Relationship        1:1 or 1:few        1:many or many:many
Array size          Bounded (<100)       Unbounded
Access pattern      Always together      Independent access
Update frequency    Rarely changes       Frequently changes
Data sharing        Single parent        Multiple parents
Document size       Stays under 16MB     Would exceed 16MB
Read performance    Optimal (1 query)    Requires lookup
Write performance   Atomic update        Separate updates
\`\`\`

---

## 4. Common Schema Patterns

### Attribute Pattern

Use this when documents in one collection have different sets of fields: a shirt has \`size\` and \`material\`, a charger has \`voltage\`. Instead of one field per possible attribute (mostly empty, and each needing its own index to be searchable), store them as an array of \`{ key, value }\` pairs. Then **one** compound index on \`attributes.key\` + \`attributes.value\` makes every attribute searchable, including ones added next year. The query uses \`$elemMatch\` so that \`key\` and \`value\` must match inside the *same* array element; without it, a product with \`color: blue\` and \`size: red\` elsewhere in the array could match \`color = red\`.

\`\`\`json
// Instead of many sparse fields:
// BAD: { color: "red", size: "L", voltage: null, material: null, ... }

// GOOD: Attribute pattern
{
  _id: ObjectId("..."),
  name: "Product A",
  type: "clothing",
  attributes: [
    { key: "color", value: "red" },
    { key: "size", value: "L" },
    { key: "material", value: "cotton" }
  ]
}

// Index: { "attributes.key": 1, "attributes.value": 1 }
// Query: db.products.find({ attributes: { $elemMatch: { key: "color", value: "red" } } })
\`\`\`

### Bucket Pattern

Use this for data that arrives as a stream of small readings (sensor values, metrics, events). Instead of one document per reading, keep one document per time window (say, one per sensor per hour) with the readings in an array. Fewer, larger documents mean a much smaller index (one entry per hour instead of one per reading), and the \`stats\` field lets a dashboard show hourly min/max/average without reading the individual values. The window must be bounded so the array cannot grow forever.

\`\`\`json
// Instead of one document per event:
// BAD: 1 million sensor readings = 1 million documents

// GOOD: Bucket by hour
{
  sensorId: "sensor-001",
  date: ISODate("2026-03-06T10:00:00Z"),
  count: 120,
  readings: [
    { timestamp: ISODate("2026-03-06T10:00:30Z"), value: 72.5 },
    { timestamp: ISODate("2026-03-06T10:01:00Z"), value: 73.1 },
    // ... up to 120 readings per hour
  ],
  stats: {
    min: 71.2,
    max: 75.8,
    avg: 73.1
  }
}
\`\`\`

### Computed Pattern

Store a derived value (a count, an average) on the document and update it when the underlying data changes, instead of recalculating it on every read. It pays off when the value is read far more often than the data changes: a job's candidate count shown on every list page. The cost is that every write path must keep it correct; \`$inc\` makes each update atomic, so two applications arriving at once still add 2.

\`\`\`javascript
// Instead of calculating on every read:
const jobWithPrecomputedStats = {
  _id: ObjectId("job-123"),
  title: "React Developer",
  candidates: [/* ... */],

  // Pre-computed stats (updated on writes)
  stats: {
    totalCandidates: 150,
    avgMatchScore: 72.5,
    topMatchScore: 98,
    statusCounts: {
      new: 45,
      screening: 30,
      interview: 20,
      offer: 5,
      rejected: 50
    }
  },
  lastUpdated: ISODate("2026-03-06T10:00:00Z")
};

// Update stats when a candidate is added/updated
await db.jobs.updateOne(
  { _id: jobId },
  {
    $inc: { 'stats.totalCandidates': 1, 'stats.statusCounts.new': 1 },
    $set: { lastUpdated: new Date() },
  }
);
\`\`\`

### Polymorphic Pattern

Store different but related kinds of record in one collection, with a \`type\` field (the *discriminator*) saying which kind each document is. An email, a push message and an SMS share most fields (recipient, status, sent time) and are usually listed together ("show this user's notifications"), so one collection with one index serves that query; the type-specific fields simply appear only on the documents that need them.

\`\`\`javascript
// Notifications collection
const emailNotification = {
  _id: ObjectId("..."),
  type: "email",
  recipientId: ObjectId("user-1"),
  subject: "New candidate applied",
  body: "Alice Smith applied for React Developer...",
  sentAt: ISODate("2026-03-06T10:00:00Z"),
  status: "delivered"
};

const pushNotification = {
  _id: ObjectId("..."),
  type: "push",
  recipientId: ObjectId("user-1"),
  title: "Interview reminder",
  body: "Interview with Bob in 30 minutes",
  deviceToken: "token-xyz",
  sentAt: ISODate("2026-03-06T10:00:00Z"),
  status: "sent"
};

const smsNotification = {
  _id: ObjectId("..."),
  type: "sms",
  recipientId: ObjectId("user-1"),
  phone: "+1234567890",
  message: "Your interview is confirmed",
  sentAt: ISODate("2026-03-06T10:00:00Z"),
  status: "delivered"
};
\`\`\`

### Outlier Pattern

Design for the typical document, and handle the rare giant one separately instead of letting it dictate the schema. If 99% of users have a handful of addresses, embedding is right for them; the few with thousands would blow past the size limit. So embed up to a cap, set a flag, and put the overflow in a second collection that only the flagged documents ever read.

\`\`\`json
// Most users have 1-10 addresses, but some have 1000+
// Store overflow in a separate collection

// User document
{
  _id: ObjectId("user-1"),
  name: "Normal User",
  addresses: [/* 1-10 addresses embedded */],
  hasOverflow: false
}

{
  _id: ObjectId("user-2"),
  name: "Enterprise Client",
  addresses: [/* first 20 addresses */],
  hasOverflow: true  // Flag to check overflow collection
}

// Overflow collection
{
  userId: ObjectId("user-2"),
  addresses: [/* remaining 980 addresses */]
}
\`\`\`

### Tree Structures

There are several ways to store a hierarchy (an org chart, categories), and each one makes a different question cheap. **Parent reference** makes "move this node" a one-field update, but finding all descendants takes one query per level. **Materialized path** stores the whole route as a string, so "everything under Engineering" is a single prefix/regex match. **Nested sets** number every node with a \`left\` and \`right\` value so that a node's descendants are exactly the nodes whose numbers fall between its two values: subtree reads are one range query, but inserting a node renumbers much of the tree. **Array of ancestors** stores the ids of every ancestor, so both "all descendants of X" (\`ancestors._id: X\`) and "breadcrumb for this node" are single indexed queries. Pick by which question your app asks most.

\`\`\`json
// 1. Parent Reference (simplest)
{
  _id: "Engineering",
  parent: "Company",
  name: "Engineering"
}

// 2. Child References
{
  _id: "Company",
  children: ["Engineering", "Marketing", "Sales"],
  name: "Company"
}

// 3. Materialized Path (fast ancestry queries)
{
  _id: "Frontend",
  path: ",Company,Engineering,Frontend,",
  name: "Frontend Team"
}
// Query all descendants: db.collection.find({ path: /,Engineering,/ })

// 4. Nested Sets (fast subtree queries, slow updates)
{
  _id: "Engineering",
  name: "Engineering",
  left: 2,
  right: 7
}

// 5. Array of Ancestors (most flexible for MongoDB)
{
  _id: "Frontend",
  name: "Frontend Team",
  ancestors: [
    { _id: "Company", name: "Company" },
    { _id: "Engineering", name: "Engineering" }
  ],
  parent: "Engineering",
  depth: 2
}
\`\`\`

---

## 5. Mongoose ODM

### Schema Definition

\`\`\`javascript
import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'under_assessment', 'closed', 'on_hold', 'expired'],
        message: '{VALUE} is not a valid status',
      },
      default: 'open',
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    skills: [
      {
        name: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        minYears: { type: Number, default: 0, min: 0 },
        maxYears: { type: Number, default: null },
      },
    ],
    salary: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: 'USD' },
    },
    location: {
      city: String,
      state: String,
      country: String,
      remote: { type: Boolean, default: false },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    dueDate: Date,
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deletedAt;
        return ret;
      },
    },
  }
);

// Compound indexes for common queries
jobSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
jobSchema.index({ tenantId: 1, department: 1 });
jobSchema.index({ title: 'text', description: 'text' });

export const Job = mongoose.model('Job', jobSchema);
\`\`\`

### Virtuals

\`\`\`javascript
// Computed properties not stored in DB
jobSchema.virtual('isActive').get(function () {
  return ['open', 'under_assessment'].includes(this.status);
});

jobSchema.virtual('primarySkills').get(function () {
  return this.skills.filter((s) => s.isPrimary);
});

// Virtual populate (reference without storing)
jobSchema.virtual('candidates', {
  ref: 'Candidate',
  localField: '_id',
  foreignField: 'jobId',
  count: true, // only get count, not full docs
});
\`\`\`

### Middleware (Hooks)

Hooks (Mongoose calls them middleware) are functions Mongoose runs before (\`pre\`) or after (\`post\`) an operation such as \`save\`, \`find\` or \`aggregate\`. Inside a document hook like \`save\`, \`this\` is the document; inside a query hook like \`find\`, \`this\` is the query being built, so you can add conditions to it before it runs.

The soft-delete filter is the reason hooks are worth knowing. With soft delete, a "deleted" job is still in the collection with \`deletedAt\` set. If every caller had to remember \`{ deletedAt: null }\`, one forgotten filter would show deleted jobs to users. A \`pre(/^find/)\` hook (the regex matches \`find\`, \`findOne\`, \`findOneAndUpdate\` and the rest) adds the filter in one place, so the default is safe and a caller has to ask explicitly for deleted rows. \`aggregate\` does not go through the find hooks, which is why it needs its own hook that prepends a \`$match\` stage.

The hooks below are written without a \`next\` callback: they throw to report an error and use \`async\` for async work. That form works in current Mongoose versions, and Mongoose 9 removed the \`next\` parameter from \`pre\` hooks altogether.

\`\`\`javascript
// Pre-save hook: validation that spans two fields.
// Throwing aborts the save, and save() rejects with this error.
jobSchema.pre('save', async function () {
  if (this.salary.min && this.salary.max && this.salary.min > this.salary.max) {
    throw new Error('Minimum salary cannot exceed maximum salary');
  }
  // Mongoose sets isNew to false once save() succeeds, so remember it for the post hook
  this.$locals.wasNew = this.isNew;
});

// Pre-find hook (auto-exclude soft-deleted)
jobSchema.pre(/^find/, function () {
  // Only apply if not explicitly querying deleted docs
  if (!this.getQuery().deletedAt) {
    this.where({ deletedAt: null });
  }
});

// Post-save hook (side effects)
jobSchema.post('save', async function (doc) {
  if (doc.$locals.wasNew) {
    await notifyTeam(doc.department, \`New job created: \${doc.title}\`);
  }
});

// Pre-aggregate hook
jobSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { deletedAt: null } });
});
\`\`\`

Two bugs this version avoids. The older callback style needed \`return next(err)\`: without the \`return\`, the function carried on and called \`next()\` a second time after reporting the error. And checking \`doc.isNew\` in a \`post('save')\` hook never fires, because by then the save has succeeded and Mongoose has already set \`isNew\` to \`false\`; the flag has to be captured in the \`pre\` hook (here in \`$locals\`, a per-document scratch object Mongoose provides for exactly this).

### Static Methods & Instance Methods

\`\`\`javascript
// Static methods (on the Model)
jobSchema.statics.findByDepartment = function (departmentId, tenantId) {
  return this.find({ department: departmentId, tenantId })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email');
};

jobSchema.statics.getStatusCounts = function (tenantId) {
  return this.aggregate([
    { $match: { tenantId, deletedAt: null } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
};

// Instance methods (on a document)
jobSchema.methods.close = function (reason) {
  this.status = 'closed';
  this.closedAt = new Date();
  this.closeReason = reason;
  return this.save();
};

jobSchema.methods.isExpired = function () {
  return this.dueDate && this.dueDate < new Date();
};

// Usage
const jobs = await Job.findByDepartment(deptId, tenantId);
const counts = await Job.getStatusCounts(tenantId);
await job.close('Position filled');
\`\`\`

### Population (Joins)

\`\`\`javascript
// Basic populate
const job = await Job.findById(jobId)
  .populate('department')        // Full department document
  .populate('createdBy', 'name email');  // Only name and email

// Nested populate
const jobV2 = await Job.findById(jobId)
  .populate({
    path: 'department',
    populate: {
      path: 'manager',
      select: 'name email',
    },
  });

// Conditional populate
const jobV2V2 = await Job.findById(jobId)
  .populate({
    path: 'candidates',
    match: { status: 'active' },
    select: 'name matchPercentage',
    options: { sort: { matchPercentage: -1 }, limit: 10 },
  });
\`\`\`

---

## 6. Indexing Strategies

### Index Types

\`\`\`javascript
// 1. Single field index
db.users.createIndex({ email: 1 });        // ascending
db.jobs.createIndex({ createdAt: -1 });    // descending

// 2. Compound index (field order matters!)
db.jobs.createIndex({ tenantId: 1, status: 1, createdAt: -1 });
// Supports queries on:
// - { tenantId }
// - { tenantId, status }
// - { tenantId, status, createdAt }
// Does NOT efficiently support:
// - { status } alone
// - { createdAt } alone

// 3. Unique index
db.users.createIndex({ email: 1, tenantId: 1 }, { unique: true });

// 4. Sparse index (only indexes documents that have the field)
db.users.createIndex({ phoneNumber: 1 }, { sparse: true });

// 5. TTL index (auto-delete documents after time)
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// 6. Text index (full-text search)
db.jobs.createIndex({ title: 'text', description: 'text' });

// 7. Wildcard index (dynamic schemas)
db.products.createIndex({ 'attributes.$**': 1 });

// 8. Partial index (index subset of documents)
db.jobs.createIndex(
  { createdAt: -1 },
  { partialFilterExpression: { status: { $in: ['open', 'under_assessment'] } } }
);

// 9. Multikey index (arrays)
db.jobs.createIndex({ 'skills.name': 1 });

// 10. Geospatial index
db.offices.createIndex({ location: '2dsphere' });
\`\`\`

### ESR Rule (Equality, Sort, Range)

An index is sorted by its first field, then by the second within each value of the first, and so on, like a phone book sorted by surname then first name. That is why order matters. **Equality** fields go first because they narrow the index to one contiguous block. **Sort** fields go next so that, inside that block, entries are already in the order you want and the database does not have to sort results in memory. **Range** fields go last because a range (\`>= 100000\`) spans many values of that field; putting it before the sort field would break the block into many pieces, each separately sorted, and the database would have to sort again.

\`\`\`javascript
// For compound indexes, order fields as:
// 1. Equality fields (exact match)
// 2. Sort fields
// 3. Range fields

// Query: find open jobs in department X, sorted by date, salary > 100K
db.jobs.find({
  status: 'open',           // Equality
  department: deptId,        // Equality
  'salary.min': { $gte: 100000 }  // Range
}).sort({ createdAt: -1 });  // Sort

// Optimal index:
db.jobs.createIndex({
  status: 1,              // Equality first
  department: 1,           // Equality
  createdAt: -1,           // Sort next
  'salary.min': 1          // Range last
});
\`\`\`

### Index Analysis

\`\`\`javascript
// Explain a query to see if it uses indexes
const explanation = await db.jobs
  .find({ status: 'open', tenantId: 'abc' })
  .sort({ createdAt: -1 })
  .explain('executionStats');

// Key metrics:
// - nReturned: documents returned
// - totalDocsExamined: documents scanned (should be close to nReturned)
// - totalKeysExamined: index keys scanned
// - executionTimeMillis: query time
// - stage: IXSCAN (using index) vs COLLSCAN (full collection scan)

// If totalDocsExamined >> nReturned, you need a better index
\`\`\`

---

## 7. Data Modeling for Common Domains

### User Management

\`\`\`javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['admin', 'manager', 'recruiter'],
    default: 'recruiter',
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  profileImage: String,
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date,
  tenantId: { type: String, required: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

userSchema.index({ email: 1, tenantId: 1 }, { unique: true });
userSchema.index({ tenantId: 1, role: 1, isActive: 1 });
\`\`\`

### Job & Candidates (Recruitment Domain)

\`\`\`javascript
// Job Description
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['open', 'under_assessment', 'closed', 'on_hold', 'expired'],
    default: 'open',
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  skills: [{
    stack: String,
    isPrimary: Boolean,
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    type: String,
    isCMS: Boolean,
  }],
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
  },
  location: {
    city: String,
    state: String,
    country: String,
  },
  workMode: { type: String, enum: ['onsite', 'remote', 'hybrid'] },
  osiParticipation: { type: Boolean, default: false },
  dueDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tenantId: { type: String, required: true },
}, { timestamps: true });

// Candidate (per-job application)
const jobTalentSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  matchPercentage: { type: Number, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['new', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'],
    default: 'new',
  },
  ctaStatus: {
    type: String,
    enum: ['approve', 'voice_auth', 'standby'],
    default: null,
  },
  outcomeData: {
    outcome: { type: String, enum: ['presented', 'forwarded', 'hired'] },
    metadata: mongoose.Schema.Types.Mixed,
    recordedAt: Date,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  appliedAt: { type: Date, default: Date.now },
  tenantId: { type: String, required: true },
}, { timestamps: true });

jobTalentSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
jobTalentSchema.index({ jobId: 1, status: 1 });
jobTalentSchema.index({ candidateId: 1 });

// Candidate (global profile)
const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: String,
  resumeUrl: String,
  skills: [{ name: String, years: Number }],
  experience: [{
    company: String,
    title: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    year: Number,
  }],
  tenantId: { type: String, required: true },
}, { timestamps: true });

candidateSchema.index({ email: 1, tenantId: 1 }, { unique: true });
candidateSchema.index({ tenantId: 1, 'skills.name': 1 });
\`\`\`

### Audit Trail

\`\`\`javascript
const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'invite', 'export'],
  },
  resource: {
    type: { type: String, required: true }, // 'job', 'user', 'candidate'
    id: { type: String, required: true },
    name: String,
  },
  actor: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    ip: String,
    userAgent: String,
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
  },
  tenantId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// TTL index: auto-delete after 1 year
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
// Query indexes
auditLogSchema.index({ tenantId: 1, timestamp: -1 });
auditLogSchema.index({ tenantId: 1, 'resource.type': 1, 'resource.id': 1 });
auditLogSchema.index({ tenantId: 1, 'actor.userId': 1, timestamp: -1 });
\`\`\`

### Notifications

\`\`\`javascript
const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['candidate_applied', 'job_status_changed', 'interview_scheduled',
           'assessment_complete', 'mention', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  body: String,
  data: mongoose.Schema.Types.Mixed, // { jobId, candidateId, etc. }
  read: { type: Boolean, default: false },
  readAt: Date,
  tenantId: { type: String, required: true },
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ tenantId: 1, type: 1, createdAt: -1 });
\`\`\`

---

## 8. Schema Migrations

### MongoDB Migration Strategies

\`\`\`javascript
// 1. Lazy migration (on read/write)
// Handle both old and new schema in application code

async function getUser(userId) {
  const user = await User.findById(userId);

  // Migrate on read
  if (!user.schemaVersion || user.schemaVersion < 2) {
    // Old schema: { name: "John Doe" }
    // New schema: { firstName: "John", lastName: "Doe" }
    if (user.name && !user.firstName) {
      const [firstName, ...rest] = user.name.split(' ');
      user.firstName = firstName;
      user.lastName = rest.join(' ');
      user.schemaVersion = 2;
      await user.save();
    }
  }

  return user;
}

// 2. Batch migration script
async function migrateUsersV2() {
  const cursor = db.users.find({
    $or: [
      { schemaVersion: { $exists: false } },
      { schemaVersion: { $lt: 2 } },
    ],
  }).batchSize(100);

  let migrated = 0;

  for await (const user of cursor) {
    const [firstName, ...rest] = (user.name || '').split(' ');

    await db.users.updateOne(
      { _id: user._id },
      {
        $set: {
          firstName,
          lastName: rest.join(' '),
          schemaVersion: 2,
        },
        $unset: { name: '' },
      }
    );

    migrated++;
    if (migrated % 1000 === 0) {
      console.log(\`Migrated \${migrated} users\`);
    }
  }

  console.log(\`Migration complete: \${migrated} users updated\`);
}
\`\`\`

### Migration Framework (migrate-mongo)

\`\`\`javascript
// migrations/20260306-add-user-profile-fields.js
module.exports = {
  async up(db) {
    // Add default values for new fields
    await db.collection('users').updateMany(
      { profileCompleted: { $exists: false } },
      {
        $set: {
          profileCompleted: false,
          preferences: {
            notifications: true,
            theme: 'light',
            locale: 'en',
          },
        },
      }
    );

    // Create new index
    await db.collection('users').createIndex(
      { profileCompleted: 1, tenantId: 1 }
    );
  },

  async down(db) {
    await db.collection('users').updateMany(
      {},
      { $unset: { profileCompleted: '', preferences: '' } }
    );

    await db.collection('users').dropIndex('profileCompleted_1_tenantId_1');
  },
};
\`\`\`

### Zero-Downtime Migration Strategy

\`\`\`
1. Deploy code that reads BOTH old and new schema
2. Run migration script (batch update)
3. Deploy code that writes ONLY new schema
4. Verify all documents migrated
5. Deploy code that removes old schema handling
6. (Optional) Clean up old fields with $unset
\`\`\`

---

## 9. Relational Database Design

### SQL Schema Example

\`\`\`sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'recruiter'
        CHECK (role IN ('admin', 'manager', 'recruiter')),
    department_id UUID REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (email, tenant_id)
);

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (name, tenant_id)
);

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'under_assessment', 'closed', 'on_hold', 'expired')),
    department_id UUID NOT NULL REFERENCES departments(id),
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(3) DEFAULT 'USD',
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    work_mode VARCHAR(10) CHECK (work_mode IN ('onsite', 'remote', 'hybrid')),
    due_date DATE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job skills (many-to-many with extra attributes)
CREATE TABLE job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    min_years INTEGER DEFAULT 0,
    max_years INTEGER,
    UNIQUE (job_id, skill_name)
);

-- Candidates
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    resume_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (email, tenant_id)
);

-- Job-Candidate junction (applications)
CREATE TABLE job_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    match_percentage DECIMAL(5,2),
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (job_id, candidate_id)
);

-- Indexes
CREATE INDEX idx_jobs_tenant_status ON jobs(tenant_id, status);
CREATE INDEX idx_jobs_tenant_dept ON jobs(tenant_id, department_id);
CREATE INDEX idx_job_candidates_job ON job_candidates(job_id, status);
CREATE INDEX idx_job_candidates_candidate ON job_candidates(candidate_id);
CREATE INDEX idx_users_tenant_role ON users(tenant_id, role, is_active);
\`\`\`

### Foreign Keys & Constraints

\`\`\`sql
-- Referential integrity
ALTER TABLE jobs
    ADD CONSTRAINT fk_jobs_department
    FOREIGN KEY (department_id) REFERENCES departments(id)
    ON DELETE RESTRICT;  -- Prevent deleting department with jobs

-- Cascade delete (child records deleted with parent)
ALTER TABLE job_skills
    ADD CONSTRAINT fk_job_skills_job
    FOREIGN KEY (job_id) REFERENCES jobs(id)
    ON DELETE CASCADE;

-- Set null (keep child, null the reference)
ALTER TABLE users
    ADD CONSTRAINT fk_users_department
    FOREIGN KEY (department_id) REFERENCES departments(id)
    ON DELETE SET NULL;

-- Check constraints
ALTER TABLE jobs
    ADD CONSTRAINT chk_salary_range
    CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max);
\`\`\`

---

## 10. Normalization

### Normal Forms

*Normalization* means organising tables so that **each fact is stored in exactly one place**. When a fact is duplicated (a department's name copied onto every employee row), a rename has to update every copy, and a missed one leaves the database contradicting itself. The normal forms are a checklist of the ways duplication sneaks in; each one below builds on the previous. A *dependency* here means "knowing column A tells you column B": knowing a \`department_id\` tells you the \`department_name\`.

\`\`\`
1NF (First Normal Form):
- Each column contains atomic (indivisible) values
- Each row is unique (has a primary key)
- No repeating groups

BAD:  | name | skills           |
      | John | React,TypeScript |

GOOD: | name | skill      |
      | John | React      |
      | John | TypeScript |

─────────────────────────────────────────

2NF (Second Normal Form):
- Satisfies 1NF
- No partial dependencies (all non-key columns depend on the FULL primary key)

BAD (composite key: student_id + course_id):
| student_id | course_id | student_name | grade |
student_name depends only on student_id, not full key

GOOD: Separate into students and enrollments tables

─────────────────────────────────────────

3NF (Third Normal Form):
- Satisfies 2NF
- No transitive dependencies (non-key columns don't depend on other non-key columns)

BAD:
| employee_id | department_id | department_name |
department_name depends on department_id, not employee_id

GOOD: Move department_name to departments table

─────────────────────────────────────────

BCNF (Boyce-Codd Normal Form):
- Satisfies 3NF
- Every determinant is a candidate key
- Handles edge cases of 3NF with multiple candidate keys
\`\`\`

### When to Normalize vs Denormalize

\`\`\`
Normalize when:
- Data integrity is critical (financial, medical)
- Write-heavy workload
- Storage efficiency matters
- Data is frequently updated
- Multiple applications access the same data

Denormalize when:
- Read performance is critical
- Queries require many joins
- Data is read far more than written
- Reporting/analytics use cases
- Acceptable eventual consistency
\`\`\`

Why "write-heavy" points to normalizing: in a normalized schema each fact is stored once, so a change is one write to one row. Every denormalized copy is another place the same change must be written, and a write that updates some copies but not others leaves the data disagreeing with itself. So the more often data changes, the more denormalization costs; it pays off only when reads vastly outnumber writes.

---

## 11. Denormalization & Performance

### Common Denormalization Strategies

*Denormalization* is deliberately storing a fact in more than one place to make reads cheaper. It is a trade, not a shortcut: every copy is one more thing a write must keep correct. Each strategy below says which copy exists and what keeps it up to date.

\`\`\`javascript
// 1. Duplicate fields for read performance
// Instead of joining user + department on every read:
const userSchema = {
  name: String,
  departmentId: ObjectId,
  departmentName: String,  // Denormalized (must update when department renamed)
};

// 2. Pre-computed aggregates
const jobSchema = {
  title: String,
  candidateCount: Number,        // Incremented on new application
  avgMatchScore: Number,         // Recalculated periodically
  lastApplicationAt: Date,       // Updated on new application
};

// 3. Summary tables / Materialized views
// Periodically compute expensive aggregations
const dashboardStatsSchema = {
  tenantId: String,
  date: Date,
  activeJobs: Number,
  totalCandidates: Number,
  hiredThisMonth: Number,
  avgTimeToHire: Number,
  computedAt: Date,
};

// 4. Caching layer
// For data that's expensive to compute but rarely changes
async function getDashboardStats(tenantId) {
  const cacheKey = \`dashboard:\${tenantId}\`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const stats = await computeStats(tenantId);
  await redis.setex(cacheKey, 300, JSON.stringify(stats)); // 5 min TTL
  return stats;
}
\`\`\`

### MongoDB Aggregation for Reporting

\`\`\`javascript
// Complex analytics query using aggregation pipeline
const hiringFunnel = await JobTalent.aggregate([
  { $match: { jobId: ObjectId(jobId), tenantId } },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      avgMatch: { $avg: '$matchPercentage' },
    },
  },
  {
    $project: {
      status: '$_id',
      count: 1,
      avgMatch: { $round: ['$avgMatch', 1] },
    },
  },
  { $sort: { count: -1 } },
]);

// Time-series: applications per day
const applicationTrend = await JobTalent.aggregate([
  {
    $match: {
      tenantId,
      appliedAt: { $gte: thirtyDaysAgo },
    },
  },
  {
    $group: {
      _id: {
        $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' },
      },
      count: { $sum: 1 },
    },
  },
  { $sort: { _id: 1 } },
]);
\`\`\`

---

## 12. Multi-Tenancy Schema Design

### Approaches

\`\`\`
1. Database per tenant
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ Tenant A │  │ Tenant B │  │ Tenant C │
   │    DB    │  │    DB    │  │    DB    │
   └──────────┘  └──────────┘  └──────────┘
   Pros: Strongest isolation, easy backup/restore per tenant
   Cons: Expensive, complex connection management

2. Schema per tenant (PostgreSQL)
   ┌─────────────────────────────────────┐
   │          Shared Database            │
   │  ┌──────────┐  ┌──────────┐       │
   │  │ Schema A │  │ Schema B │  ...  │
   │  └──────────┘  └──────────┘       │
   └─────────────────────────────────────┘
   Pros: Good isolation, shared infrastructure
   Cons: Schema management complexity

3. Shared tables with tenant column (Most common)
   ┌─────────────────────────────────────┐
   │          Shared Database            │
   │  ┌────────────────────────────┐    │
   │  │ users (tenant_id column)   │    │
   │  │ jobs  (tenant_id column)   │    │
   │  └────────────────────────────┘    │
   └─────────────────────────────────────┘
   Pros: Simple, cost-effective, easy to manage
   Cons: Must enforce tenant isolation in every query
\`\`\`

### Shared Table Implementation (MongoDB)

\`\`\`javascript
// Middleware to enforce tenant scoping
function tenantScope(schema) {
  // Add tenantId to schema
  schema.add({
    tenantId: { type: String, required: true, index: true },
  });

  // Auto-add tenantId to all queries
  schema.pre(/^find/, function () {
    if (!this.getQuery().tenantId && this._tenantId) {
      this.where({ tenantId: this._tenantId });
    }
  });

  // Auto-add tenantId to new documents
  schema.pre('save', function () {
    if (this.isNew && !this.tenantId && this._tenantId) {
      this.tenantId = this._tenantId;
    }
  });

  // Helper to set tenant context
  schema.statics.forTenant = function (tenantId) {
    const Model = this;
    const scopedModel = Object.create(Model);
    scopedModel._tenantId = tenantId;

    // Override find methods to include tenant
    ['find', 'findOne', 'findById', 'countDocuments'].forEach((method) => {
      scopedModel[method] = function (...args) {
        const query = Model[method].apply(Model, args);
        query._tenantId = tenantId;
        return query.where({ tenantId });
      };
    });

    return scopedModel;
  };
}

// Usage
const TenantJob = Job.forTenant('tenant-abc');
const jobs = await TenantJob.find({ status: 'open' });
// Automatically adds: { status: 'open', tenantId: 'tenant-abc' }
\`\`\`

The idea: in a shared table, forgetting \`tenantId\` in one query leaks another customer's data, so the plugin makes the tenant filter something you get by default rather than something you must remember.

How \`forTenant\` works: \`Object.create(Model)\` makes a new object whose prototype is the real model, so everything not overridden (such as \`aggregate\`) still falls through to the model. It then replaces four read methods with wrappers that call the real method and attach \`.where({ tenantId })\` to the query it returns. Because a Mongoose query does not run until it is awaited, the extra condition is in place before anything reaches the database. Request code asks for \`Job.forTenant(req.tenantId)\` once and never writes the filter by hand.

What it does **not** cover, and an interviewer will ask: only those four methods are scoped. \`updateMany\`, \`deleteMany\`, \`findOneAndUpdate\` and \`aggregate\` go straight to the unscoped model, and the \`pre('save')\` fallback only fires if something has set \`_tenantId\` on the document, which this helper never does, so new documents still need \`tenantId\` set explicitly (the \`required: true\` will reject them otherwise). A production version scopes writes and aggregations too, and where the database supports it, many teams add a database-level backstop such as row-level security in PostgreSQL, so a forgotten filter in application code still cannot return another tenant's rows.

---

## 13. Schema Validation

### MongoDB Schema Validation

A flexible schema means MongoDB will store any shape you send unless you tell it otherwise. Database-level validation is the last line of defence: it applies to every writer (your app, a script, someone in the shell), so bad data cannot get in through a path that skipped the application's checks. \`validationLevel: 'moderate'\` applies the rules to new documents and to updates of documents that already pass, which lets you add validation to a collection that has old, non-conforming data.

\`\`\`javascript
// JSON Schema validation at the database level
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'name', 'tenantId', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$',
          description: 'Must be a valid email address',
        },
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100,
        },
        role: {
          bsonType: 'string',
          enum: ['admin', 'manager', 'recruiter'],
        },
        salary: {
          bsonType: 'object',
          properties: {
            min: { bsonType: 'int', minimum: 0 },
            max: { bsonType: 'int', minimum: 0 },
          },
        },
      },
    },
  },
  validationLevel: 'moderate', // 'strict' | 'moderate' (skip existing invalid docs)
  validationAction: 'error',   // 'error' | 'warn'
});
\`\`\`

### Application-Level Validation with Zod

Application-level validation runs before the database is touched, so it can return a clear error to the user ("minimum salary must not exceed maximum") and check rules that span fields. Use both layers: the app for good error messages, the database for the guarantee.

\`\`\`javascript
import { z } from 'zod';

const createJobSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().optional(),
  departmentId: z.string().regex(/^[a-f\\d]{24}$/i, 'Invalid department ID'),
  skills: z.array(z.object({
    name: z.string().min(1),
    isPrimary: z.boolean().default(false),
    minYears: z.number().min(0).default(0),
    maxYears: z.number().min(0).optional(),
  })).min(1, 'At least one skill required'),
  salary: z.object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional(),
    currency: z.string().length(3).default('USD'),
  }).refine(
    (data) => !data.min || !data.max || data.min <= data.max,
    { message: 'Minimum salary must not exceed maximum' }
  ).optional(),
  workMode: z.enum(['onsite', 'remote', 'hybrid']).optional(),
  dueDate: z.string().datetime().optional(),
});

// Validate in controller
async function createJob(req, res) {
  const parsed = createJobSchema.parse(req.body);
  const job = await Job.create({ ...parsed, tenantId: req.tenantId });
  res.status(201).json({ status: 'success', results: job });
}
\`\`\`

---

## 14. Time-Series & Event Data

### Time-Series Schema Design

Three options, from simplest to most specialised. One document per event is easy but produces a huge collection and index. Bucketing (the bucket pattern above) groups events by time window by hand. A **time series collection** (MongoDB 5.0+) does that bucketing for you internally: you insert one document per reading, and MongoDB stores them compactly, grouped by \`metaField\` (which source the reading came from) and time. Prefer it when it is available.

\`\`\`javascript
// Approach 1: One document per event (simple, high volume)
const eventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  source: String,
  data: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, index: true },
  tenantId: String,
});

// Approach 2: Bucketed (reduces document count)
const hourlyMetricSchema = new mongoose.Schema({
  metricName: String,
  source: String,
  hour: Date, // Truncated to hour
  count: Number,
  values: [{
    minute: Number,
    value: Number,
  }],
  stats: {
    min: Number,
    max: Number,
    sum: Number,
    avg: Number,
  },
});

hourlyMetricSchema.index({ metricName: 1, source: 1, hour: -1 });

// Approach 3: MongoDB Time Series Collection (5.0+)
db.createCollection('metrics', {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata',
    granularity: 'minutes', // 'seconds' | 'minutes' | 'hours'
  },
  expireAfterSeconds: 90 * 24 * 60 * 60, // 90 days retention
});
\`\`\`

### Event Sourcing Schema

*Event sourcing* stores every change as an event ("status changed from open to under assessment") instead of overwriting the current state. The current state is computed by replaying the events in order. You get a complete history and audit trail for free, at the cost of more complex reads. The unique index on \`{ aggregateId, version }\` is the key detail: an *aggregate* is the entity the events belong to (one job), and if two writers both try to append version 4, the second insert fails instead of silently interleaving events.

\`\`\`javascript
const eventSchema = new mongoose.Schema({
  aggregateId: { type: String, required: true, index: true },
  aggregateType: { type: String, required: true }, // 'job', 'candidate'
  eventType: { type: String, required: true },
  version: { type: Number, required: true },
  data: mongoose.Schema.Types.Mixed,
  metadata: {
    userId: mongoose.Schema.Types.ObjectId,
    correlationId: String,
    timestamp: { type: Date, default: Date.now },
  },
  tenantId: { type: String, required: true },
});

eventSchema.index({ aggregateId: 1, version: 1 }, { unique: true });
eventSchema.index({ tenantId: 1, eventType: 1, 'metadata.timestamp': -1 });

// Example events for a job aggregate
// { aggregateId: "job-123", eventType: "JOB_CREATED", version: 1, data: { title: "..." } }
// { aggregateId: "job-123", eventType: "STATUS_CHANGED", version: 2, data: { from: "open", to: "under_assessment" } }
// { aggregateId: "job-123", eventType: "CANDIDATE_APPLIED", version: 3, data: { candidateId: "..." } }

// Rebuild aggregate state from events
async function getJobState(jobId) {
  const events = await Event.find({ aggregateId: jobId }).sort({ version: 1 });
  return events.reduce((state, event) => {
    switch (event.eventType) {
      case 'JOB_CREATED':
        return { ...event.data, status: 'open', candidates: [] };
      case 'STATUS_CHANGED':
        return { ...state, status: event.data.to };
      case 'CANDIDATE_APPLIED':
        return { ...state, candidates: [...state.candidates, event.data.candidateId] };
      default:
        return state;
    }
  }, {});
}
\`\`\`

---

## 15. Interview Questions

### Beginner (1-3 years)

**Q1: What is the difference between embedding and referencing in MongoDB?**

**Embedding** stores related data inside the parent document (nested objects or arrays). Use it when data is always accessed together, belongs to one parent, and the array is bounded. Benefits: single query reads (no joins), atomic updates, better read performance.

**Referencing** stores a foreign key (ObjectId) pointing to a document in another collection. Use it when related data is accessed independently, can grow unbounded, or is shared across multiple parents. Requires \`populate()\` or \`$lookup\` for joins but keeps documents smaller and allows independent updates.

The hybrid approach embeds frequently-read fields (like \`department.name\`) while also keeping the full document in a separate collection for detailed access.

---

**Q2: What are database indexes and why are they important?**

**Short answer:** an index is a sorted copy of one or more fields, each entry pointing back to its document, so the database can jump to matching documents instead of reading every one. It works like the index at the back of a book.

The usual structure is a *B-tree* (a balanced, sorted tree that finds any value in a few steps even across millions of entries). Without indexes, MongoDB must scan every document in a collection (COLLSCAN) to find matches. With indexes, it can jump directly to matching documents (IXSCAN).

Common types: single field; compound (several fields, sorted by the first then the next, see Q9); unique (also *rejects* a second document with the same value, which makes it a data-integrity tool, not only a speed one); text (full-text search); TTL, short for time-to-live (MongoDB deletes documents automatically once a date field is older than a set age, useful for sessions); partial (only indexes documents matching a filter, so the index stays small).

Trade-offs: indexes speed up reads but slow down writes (every insert/update must update the index too) and consume memory. Index strategically based on your actual query patterns.

---

**Q3: Explain the difference between SQL and NoSQL databases.**

**Short answer:** SQL databases store data in tables with a fixed schema and are built around joining related tables and guaranteeing consistency. "NoSQL" is a loose label for everything else, mostly databases that trade some of those guarantees or the query flexibility for a more flexible data shape and easier horizontal scaling (spreading data across many machines). The real question is which access patterns and guarantees your data needs.

**SQL** (PostgreSQL, MySQL): Structured schema (tables, rows, columns), SQL query language, ACID transactions (a group of changes either all happens or none does, and concurrent transactions do not see each other's half-finished work), strong consistency, relationships via foreign keys and JOINs. Best for structured data with complex relationships, financial systems, and when data integrity is critical.

**NoSQL** (MongoDB, DynamoDB, Cassandra): Flexible schema (documents, key-value, graph, columnar), different query languages, tunable consistency (you choose per operation how many copies must confirm a read or write, trading safety for speed), horizontal scaling. Best for rapidly evolving schemas, very large write volumes, and data that is naturally one self-contained document (an order with its line items). The catch: queries that were not planned for, especially ones that join across entities, are harder than in SQL.

MongoDB specifically is a document database that stores JSON-like documents, supports rich queries, aggregation pipelines, and scales horizontally via sharding.

---

**Q4: What is schema validation and why is it important?**

Schema validation ensures data meets expected formats and constraints before it's stored. In MongoDB, you can enforce validation at two levels:

1. **Database level**: JSON Schema validators on collections that reject invalid documents
2. **Application level**: Libraries like Mongoose schemas or Zod that validate before sending to the database

It prevents bad data from entering the system (null emails, negative salaries, invalid enums), catches bugs early, and maintains data quality. Even with MongoDB's flexible schema, validation is essential — schema-less doesn't mean validation-less.

---

**Q5: What are the normal forms in relational databases?**

**Short answer:** normal forms are successive rules for removing duplicated facts from tables, so that each fact lives in one place and an update cannot leave two copies disagreeing. In practice you aim for 3NF.

**1NF**: Atomic values (no arrays or repeating groups), unique rows (primary key).
**2NF**: 1NF + no partial dependencies (all non-key columns depend on the entire primary key, not just part of a composite key).
**3NF**: 2NF + no transitive dependencies (non-key columns depend only on the primary key, not on other non-key columns).
**BCNF**: 3NF + every determinant is a candidate key. A *determinant* is any column (or set of columns) that fixes the value of another column; a *candidate key* is any column set that uniquely identifies a row. BCNF only differs from 3NF in unusual tables with several overlapping candidate keys.

A single example covers 2NF and 3NF: an \`enrollments\` table keyed by \`(student_id, course_id)\` that also stores \`student_name\` breaks 2NF, because the name depends on only half the key, so it is repeated for every course the student takes. An \`employees\` table with \`department_id\` and \`department_name\` breaks 3NF, because the name depends on the department, not the employee. In both cases the fix is to move the column to the table where its key lives.

Most production databases are normalized to 3NF for write operations, with strategic denormalization (materialized views, computed columns, caching) for read-heavy access patterns.

---

### Intermediate (3-5 years)

**Q6: How would you design a schema for a multi-tenant SaaS application?**

Three approaches, in order of complexity:

1. **Shared tables with tenant column**: Add \`tenantId\` to every table/collection. Use middleware to automatically scope all queries. Simplest and most cost-effective but requires careful enforcement.

2. **Schema per tenant** (PostgreSQL): Each tenant gets their own schema within a shared database. Good isolation without the cost of separate databases.

3. **Database per tenant**: Strongest isolation, easiest compliance, but expensive and complex to manage.

For MongoDB, approach #1 is most common. Key implementation: add \`tenantId\` to every schema, include it in every compound index (usually as the first field), add middleware that automatically filters by tenant, and write integration tests that verify no cross-tenant data leakage.

---

**Q7: Explain the MongoDB aggregation pipeline and when to use it.**

**Short answer:** the aggregation pipeline is MongoDB's way to compute results (counts, averages, reshaped data, joins) inside the database. You pass an array of stages; documents flow through them in order, each stage filtering, grouping or reshaping what the previous one produced, much like a Unix pipe or a chain of \`.filter().map().reduce()\`.

Common stages: \`$match\` (filter), \`$group\` (aggregate), \`$project\` (reshape), \`$sort\`, \`$limit\`, \`$skip\`, \`$lookup\` (join), \`$unwind\` (flatten arrays), \`$facet\` (parallel pipelines), \`$addFields\`, \`$bucket\`.

Put \`$match\` as early as possible: it can use an index and shrinks the data every later stage has to handle. Use aggregation for: reporting/analytics, data transformation, computing statistics, combining data from multiple collections, and building dashboard data. It's more efficient than fetching all documents and computing in application code because the database handles the computation closer to the data.

---

**Q8: How do you handle schema migrations in MongoDB?**

Unlike SQL databases with rigid schemas, MongoDB's flexible schema allows gradual migration:

1. **Lazy migration**: Update documents on read. When reading a document with the old schema, transform it and save the new version. Simple but slow to complete.

2. **Batch migration**: Run a script that updates all documents in batches. Use \`batchSize()\` to avoid memory issues and add progress logging.

3. **Expand and contract** (often loosely called dual-write): deploy code that can read both the old and the new shape, run the migration script, then deploy code that handles only the new shape. Strictly, dual-write means the application writes both old and new fields during the transition, so either version of the code can read the data; that is one way to do the "expand" step (see §8, Zero-Downtime Migration Strategy).

4. **Schema versioning**: Add a \`schemaVersion\` field. Application code handles each version.

For zero downtime: always make additive changes first (add new fields with defaults), migrate data, then remove old fields. Never rename or remove fields in the same deployment that adds new ones.

---

**Q9: How do you design indexes for compound queries?**

Follow the **ESR rule** (Equality, Sort, Range):

1. Put **equality** fields first (exact matches like \`status: 'open'\`)
2. Then **sort** fields (like \`createdAt: -1\`)
3. Then **range** fields last (like \`salary: { $gte: 100000 }\`)

For a query: \`find({ tenantId: X, status: 'open', salary: { $gte: N } }).sort({ createdAt: -1 })\`, the optimal index is: \`{ tenantId: 1, status: 1, createdAt: -1, salary: 1 }\`.

Use \`explain('executionStats')\` to verify the index is used. Check that \`totalDocsExamined\` is close to \`nReturned\`. Create indexes that cover your most frequent queries, but avoid over-indexing (each index adds write overhead and memory usage).

---

**Q10: What is the bucket pattern and when would you use it?**

The bucket pattern groups multiple related documents into a single document to reduce document count and improve query performance. Instead of one document per event (which could be millions), you create one document per time bucket (hour, day) containing multiple events.

Example: IoT sensor readings — instead of 86,400 documents per sensor per day (one per second), create 24 documents (one per hour) each containing 3,600 readings as an array.

Benefits: fewer documents to scan, better locality (all hourly data in one document), can pre-compute statistics (min, max, avg) per bucket. Trade-offs: more complex insert logic, array size must be bounded, updates are more complex.

---

### Advanced (5+ years)

**Q11: How would you design a schema for an event sourcing system?**

**Short answer:** event sourcing stores every change as an immutable event (never updated or deleted) instead of overwriting the current state, and computes the current state by replaying those events. The schema needs an append-only event log with a per-entity version number, plus snapshots and read-optimized views so you are not replaying everything on every read. An *aggregate* below means the entity the events belong to, such as one job.

1. **Events collection**: \`aggregateId\` (entity it belongs to), \`eventType\`, \`version\` (sequential per aggregate), \`data\` (event payload), \`metadata\` (timestamp, userId, correlationId). Index on \`{ aggregateId: 1, version: 1 }\` (unique).

2. **Snapshots collection**: Periodic snapshots of aggregate state to avoid replaying all events. Store \`aggregateId\`, \`version\`, \`state\`, \`createdAt\`.

3. **Projections**: Read-optimized views built by consuming events. Updated asynchronously by event handlers.

To rebuild state: load the latest snapshot, then replay events after that snapshot's version. For querying, use projections (materialized views) not the event store directly. Handle concurrency with *optimistic locking*: instead of locking the aggregate, each writer reads the current version, then appends its event with the next version number. The unique \`{ aggregateId, version }\` index makes a second writer's append fail if someone else got there first, and that writer reloads and retries.

---

**Q12: How do you handle data consistency in a distributed system with MongoDB?**

**Short answer:** MongoDB lets you choose, per operation, how much safety to pay for. Production MongoDB runs as a *replica set*: one primary that takes writes and several secondaries holding copies. The settings below decide how many copies must confirm a write, which copies you may read from, and whether you can read data that might later be rolled back.

1. **Write Concern**: \`w: 'majority'\` ensures writes are acknowledged by majority of replica set members, so the write survives the primary failing. \`w: 1\` only waits for the primary, which is faster but can lose a write if the primary crashes before copying it. Since MongoDB 5.0 the default is \`majority\` for most deployments; older versions defaulted to \`w: 1\`.

2. **Read Concern**: \`'majority'\` reads data acknowledged by majority (no dirty reads). \`'local'\` reads the latest data on the node (may be rolled back).

3. **Read Preference**: \`primary\` (consistent, one node), \`secondary\` (eventual consistency, read scaling), \`nearest\` (lowest latency).

4. **Transactions**: Multi-document ACID transactions (since 4.0) for operations that must be atomic across documents/collections.

5. **Change Streams**: Watch for changes in real-time, useful for keeping secondary systems in sync.

For distributed applications: use \`majority\` write/read concern for critical operations, transactions for multi-document atomicity, and eventually-consistent reads (secondary preferred) for non-critical reads. Design schemas to minimize the need for multi-document transactions.

---

**Q13: How would you design the database layer for a system handling 100K writes/second?**

**Short answer:** no single machine takes 100K writes/second comfortably, so the answer is to spread writes across many machines (sharding) and make each write cheaper (batching, fewer indexes, smaller documents). The shard key choice is the part interviewers probe.

1. **Sharding**: split the collection across several servers (*shards*), each owning a range of a chosen field, the *shard key*. Choose a shard key with high cardinality (many distinct values) and even distribution (e.g., hashed \`_id\` or compound key). Avoid monotonically increasing keys such as a timestamp or a default \`ObjectId\`: every new document has the largest value yet, so every insert lands on the one shard owning the top of the range (a *hot spot*) while the others sit idle.

2. **Write optimization**: Use bulk writes (\`insertMany\`, \`bulkWrite\`) so one network round trip carries many documents, unordered operations (the server need not stop at the first failure or keep the order, so it can apply them in parallel), and minimize indexes on write-heavy collections, since every index is updated on every insert.

3. **Buffering**: Write to Redis first, flush to MongoDB in batches. Accepts small data loss window for much higher throughput.

4. **Schema design**: Minimize document size, avoid large arrays (which require rewriting the entire document), use the bucket pattern for time-series data.

5. **Hardware**: Use the WiredTiger storage engine (the default since MongoDB 3.2), ensure enough RAM for the *working set* (the data and indexes that are accessed regularly; once they no longer fit in memory, reads go to disk and throughput collapses), use SSDs, separate data and journal to different volumes.

6. **Monitoring**: Track \`opcounters\`, replication lag, page faults, lock percentage. Alert on write queue buildup.

---

**Q14: Compare the trade-offs of different multi-tenancy database architectures at scale.**

**Shared tables** (tenant column): Best for: SaaS with many small tenants (thousands). Pros: low cost, simple operations, easy cross-tenant queries/analytics. Cons: noisy neighbor risk (one heavy tenant's traffic slows everyone sharing the database), must enforce tenant isolation in every query, hard to give tenants different SLAs, GDPR data deletion is a query not a database drop.

**Database per tenant**: Best for: regulated industries, enterprise clients with strict isolation requirements. Pros: strongest isolation, per-tenant backup/restore, independent scaling, easy compliance. Cons: connection management (thousands of databases), schema migrations across all databases, higher infrastructure cost.

**Hybrid**: Use shared tables for small tenants and dedicated databases for enterprise tenants. Route at the application layer based on tenant tier. This is the most practical approach at scale — most tenants share resources, while high-value tenants get dedicated infrastructure.

Key implementation: connection pooling per tenant database, centralized schema migration tooling, per-tenant resource quotas, monitoring per tenant for fair usage enforcement.

---

*This guide covers schema design patterns for both MongoDB and relational databases. The key principle: always design your schema around your access patterns, not just your data model. Understand your read/write ratios, query patterns, and scale requirements before choosing between embedding and referencing, normalization and denormalization.*

---

## References

- [MongoDB Data Modeling](https://www.mongodb.com/docs/manual/data-modeling) — Official schema design guide
- [MongoDB Schema Design Patterns](https://www.mongodb.com/blog/post/building-with-patterns-a-summary) — Common schema patterns blog series
- [Mongoose Schema Guide](https://mongoosejs.com/docs/guide.html) — Defining schemas with Mongoose
`;export{e as default};
