const e=`# AWS Lambda — Complete Guide

## Table of Contents

- [1. What is AWS Lambda?](#1-what-is-aws-lambda)
- [2. Core Concepts](#2-core-concepts)
- [3. Lambda Function Structure](#3-lambda-function-structure)
- [4. Event Sources and Triggers](#4-event-sources-and-triggers)
- [5. API Gateway + Lambda](#5-api-gateway-lambda)
- [6. Environment and Configuration](#6-environment-and-configuration)
- [7. Layers](#7-layers)
- [8. Cold Starts](#8-cold-starts)
- [9. Concurrency](#9-concurrency)
- [10. Database and Storage](#10-database-and-storage)
- [11. Error Handling and Retries](#11-error-handling-and-retries)
- [12. Monitoring and Logging](#12-monitoring-and-logging)
- [13. Security](#13-security)
- [14. Deployment](#14-deployment)
- [15. Patterns and Best Practices](#15-patterns-and-best-practices)
- [16. Interview Questions & Answers](#16-interview-questions-answers)

---

## 1. What is AWS Lambda?

AWS Lambda is a **serverless compute service** that runs your code in response to events without you managing servers. You pay only for the compute time consumed — no charge when idle.

Key characteristics:
- **No server management** — AWS handles provisioning, scaling, patching
- **Auto-scaling** — scales from 0 to thousands of concurrent executions
- **Pay-per-use** — billed per request and compute duration (ms)
- **Event-driven** — triggered by AWS services, HTTP requests, schedules, etc.
- **Stateless** — design each invocation as if it starts from nothing. Lambda *may* reuse the same environment for the next call (so a cached client or file can still be there, §6.4), but it may equally start a fresh one, so nothing you rely on for correctness can live in memory or \`/tmp\`
- **Supports** — Node.js, Python, Java, Go, .NET, Ruby, custom runtimes

### When to Use Lambda

| Good for | Not ideal for |
|----------|---------------|
| REST/GraphQL APIs | Long-running processes (>15 min) |
| Event processing (S3, SQS, DynamoDB) | Real-time WebSocket servers |
| Scheduled tasks (cron) | High-throughput, low-latency (sub-10ms) |
| File/image processing | Stateful applications |
| Webhooks | Constant high-traffic (cheaper with EC2/containers) |
| Authentication/authorization | GPU workloads |
| Data transformation pipelines | |

### Pricing (as of 2024)

These are the x86 prices in US East (N. Virginia); they were re-checked against the AWS pricing page in September 2026 and had not changed. Arm (Graviton) duration is cheaper, and the example below ignores the free tier.

\`\`\`
Requests:  $0.20 per 1M requests
Duration:  $0.0000166667 per GB-second
Free tier: 1M requests + 400,000 GB-seconds per month

Example: 128MB function, 200ms avg, 10M invocations/month
  = 10M * $0.20/1M + 10M * 0.2s * 0.125GB * $0.0000166667
  = $2.00 + $4.17 = $6.17/month
\`\`\`

---

## 2. Core Concepts

### 2.1 Execution Model

\`\`\`
Event (HTTP, S3, SQS, etc.)
    |
    v
+-------------------+
|  Lambda Service    |
|  - finds/creates  |
|    execution env  |
+-------------------+
    |
    v
+-------------------+
| Execution Env     |     <-- may be reused (warm) or created (cold start)
|  - Runtime (Node) |
|  - Your code      |
|  - /tmp storage   |
+-------------------+
    |
    v
Handler function executes
    |
    v
Response returned to caller
\`\`\`

### 2.2 Execution Environment Lifecycle

\`\`\`
INIT Phase (cold start):
  1. Download code/layers
  2. Create execution environment
  3. Initialize runtime (Node.js)
  4. Run code OUTSIDE the handler (module-level)
  → Happens once per new environment

INVOKE Phase:
  1. Run handler function
  2. Return response
  → Happens on every invocation

SHUTDOWN Phase:
  1. Runtime shutdown hooks
  2. Environment destroyed (after idle timeout ~5-15 min)
\`\`\`

### 2.3 Key Limits

| Resource | Limit |
|----------|-------|
| Timeout | 15 minutes max |
| Memory | 128 MB to 10,240 MB (10 GB) |
| /tmp storage | 512 MB to 10,240 MB |
| Deployment package | 50 MB (zipped), 250 MB (unzipped) |
| Environment variables | 4 KB total |
| Concurrent executions | 1,000 per region (default, can increase) |
| Payload (sync) | 6 MB request, 6 MB response |
| Payload (async) | 1 MB |
| Layers | 5 layers per function |

---

## 3. Lambda Function Structure

### 3.1 Node.js Handler

\`\`\`js
// index.mjs (ES Modules)
export const handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event));
  console.log('Context:', JSON.stringify(context));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello from Lambda!' }),
  };
};
\`\`\`

\`\`\`js
// index.js (CommonJS)
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello' }),
  };
};
\`\`\`

### 3.2 Event Object

The \`event\` structure depends on the trigger:

\`\`\`json
// API Gateway (REST API) event
{
  httpMethod: 'POST',
  path: '/users',
  pathParameters: { id: '123' },
  queryStringParameters: { page: '1' },
  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ...' },
  body: '{"name":"Alice"}',                // always a string
  isBase64Encoded: false,
  requestContext: {
    authorizer: { claims: { sub: 'user-123' } },
    identity: { sourceIp: '1.2.3.4' },
  },
}

// API Gateway (HTTP API v2) event
{
  version: '2.0',
  routeKey: 'POST /users',
  rawPath: '/users',
  rawQueryString: 'page=1',
  headers: { ... },
  queryStringParameters: { page: '1' },
  pathParameters: { id: '123' },
  body: '{"name":"Alice"}',
  requestContext: {
    http: { method: 'POST', path: '/users', sourceIp: '1.2.3.4' },
    authorizer: { jwt: { claims: { sub: 'user-123' } } },
  },
}

// S3 event
{
  Records: [{
    s3: {
      bucket: { name: 'my-bucket' },
      object: { key: 'uploads/photo.jpg', size: 1024 },
    },
    eventName: 'ObjectCreated:Put',
  }],
}

// SQS event
{
  Records: [{
    messageId: 'msg-123',
    body: '{"orderId":"abc"}',
    attributes: { ApproximateReceiveCount: '1' },
  }],
}

// DynamoDB Streams event
{
  Records: [{
    eventName: 'INSERT',
    dynamodb: {
      NewImage: { id: { S: '123' }, name: { S: 'Alice' } },
      OldImage: null,
    },
  }],
}

// Scheduled (EventBridge/CloudWatch)
{
  source: 'aws.events',
  'detail-type': 'Scheduled Event',
  time: '2024-01-15T10:00:00Z',
}
\`\`\`

### 3.3 Context Object

\`\`\`js
export const handler = async (event, context) => {
  context.functionName;           // 'my-function'
  context.functionVersion;        // '$LATEST' or version number
  context.memoryLimitInMB;        // '256'
  context.logGroupName;           // '/aws/lambda/my-function'
  context.logStreamName;          // '2024/01/15/[$LATEST]abc123'
  context.awsRequestId;           // unique ID for this invocation
  context.getRemainingTimeInMillis(); // time left before timeout

  // Use remaining time for graceful handling
  if (context.getRemainingTimeInMillis() < 5000) {
    // Less than 5 seconds left — wrap up
  }
};
\`\`\`

### 3.4 TypeScript Handler

\`\`\`ts
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || '{}');
  const userId = event.pathParameters?.id;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ userId, data: body }),
  };
};
\`\`\`

Install types: \`npm install -D @types/aws-lambda\`

---

## 4. Event Sources and Triggers

Every trigger uses one of three invocation models, and the model decides the thing you most need to know when something fails: **who retries**. With synchronous calls the caller sees the error and must retry itself. With asynchronous calls Lambda queues the event and retries for you. With poll-based sources Lambda reads batches from a queue or stream, and a failure puts the batch back to be read again.

### 4.1 Synchronous Invocation

Caller waits for response. Lambda returns the result directly.

\`\`\`
API Gateway    →  Lambda  →  Response to client
ALB            →  Lambda  →  Response to client
SDK invoke()   →  Lambda  →  Response to caller
\`\`\`

### 4.2 Asynchronous Invocation

Caller gets an immediate 202 response. Lambda processes in the background.

\`\`\`
S3 event       →  Lambda (queued, retried 2x on failure)
SNS            →  Lambda
EventBridge    →  Lambda
CloudFormation →  Lambda
\`\`\`

Async config:
- Retries: 0, 1, or 2 (default: 2)
- DLQ or destination for failed events
- Max age: up to 6 hours

### 4.3 Poll-Based (Stream/Queue)

Lambda polls the source and invokes your function with a batch.

\`\`\`
SQS            →  Lambda (polls queue, batch of messages)
DynamoDB       →  Lambda (polls stream, batch of records)
Kinesis        →  Lambda (polls stream, batch of records)
\`\`\`

### 4.4 Common Triggers

\`\`\`
HTTP:        API Gateway (REST/HTTP), Function URL, ALB
Storage:     S3 (object created/deleted)
Messaging:   SQS, SNS, EventBridge, Kafka
Database:    DynamoDB Streams
Scheduling:  EventBridge Rules (cron)
Auth:        Cognito triggers
CDN:         CloudFront (Lambda@Edge)
IoT:         IoT Rules
Code:        CodeCommit, CodePipeline
Other:       Alexa, Lex, Step Functions
\`\`\`

---

## 5. API Gateway + Lambda

### 5.1 REST API (v1) vs HTTP API (v2)

| Feature | REST API (v1) | HTTP API (v2) |
|---------|--------------|--------------|
| Cost | ~$3.50/million | ~$1.00/million |
| Performance | Higher latency | Lower latency |
| Features | Full (caching, WAF, API keys, usage plans) | Basic (JWT auth, CORS) |
| Event format | v1 (detailed) | v2 (simpler) |
| Use case | Enterprise APIs | Simple APIs, cost-sensitive |

### 5.2 REST API Integration

\`\`\`yaml
# SAM template
Resources:
  ApiGateway:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod
      Cors:
        AllowOrigin: "'https://myapp.com'"
        AllowMethods: "'GET,POST,PUT,DELETE,OPTIONS'"
        AllowHeaders: "'Content-Type,Authorization'"

  GetUsersFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/users.getAll
      Runtime: nodejs20.x
      Events:
        GetUsers:
          Type: Api
          Properties:
            Path: /users
            Method: GET
            RestApiId: !Ref ApiGateway
\`\`\`

### 5.3 Handling API Gateway Events

\`\`\`ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Router pattern (simple)
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, pathParameters, body } = event;

  try {
    switch (\`\${httpMethod} \${path}\`) {
      case 'GET /users':
        return await getUsers(event);
      case 'GET /users/{id}':
        return await getUserById(pathParameters!.id!);
      case 'POST /users':
        return await createUser(JSON.parse(body || '{}'));
      default:
        return response(404, { error: 'Not found' });
    }
  } catch (error) {
    console.error(error);
    return response(500, { error: 'Internal server error' });
  }
};

function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}
\`\`\`

### 5.4 Lambda Function URLs (No API Gateway)

\`\`\`ts
// Simple HTTPS endpoint directly on Lambda (no API Gateway needed)
// event format is similar to HTTP API v2

export const handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Function URL' }),
  };
};

// Configure via AWS Console or IaC:
// FunctionUrlConfig:
//   AuthType: NONE  (public) or AWS_IAM (authenticated)
\`\`\`

---

## 6. Environment and Configuration

### 6.1 Environment Variables

\`\`\`ts
// Set via console, CLI, or IaC
// Accessed like any Node.js env var
const DB_URL = process.env.DB_URL;
const API_KEY = process.env.API_KEY;
const STAGE = process.env.STAGE || 'dev';

// Common Lambda-provided env vars
process.env.AWS_REGION;                    // 'us-east-1'
process.env.AWS_LAMBDA_FUNCTION_NAME;      // 'my-function'
process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE; // '256'
process.env._HANDLER;                      // 'index.handler'
\`\`\`

### 6.2 Memory and Timeout

\`\`\`
Memory:  128 MB to 10,240 MB (1 MB increments)
         CPU scales proportionally with memory
         At 1,769 MB you get 1 full vCPU
         At 10,240 MB you get 6 vCPUs

Timeout: 1 second to 15 minutes

Rule of thumb:
  - API responses: 256-512 MB, 30s timeout
  - Background processing: 512-1024 MB, 5-15 min timeout
  - CPU-intensive: 1769+ MB (full CPU core)
\`\`\`

The rule-of-thumb figures are starting points, not limits. Memory is also the CPU dial, so a function that is slow because it computes (parsing, image work, crypto) often gets both faster *and* cheaper when you raise memory: you pay per GB-second, and a shorter run can more than offset the higher rate. A function that mostly waits on the network gains little from more memory. Measure rather than guess: AWS Lambda Power Tuning runs your function at several memory sizes and plots cost against duration. For timeouts, set the value just above what the slowest legitimate request needs. Behind API Gateway, the gateway's own integration timeout is what the caller experiences, so a Lambda timeout longer than that only keeps the function running (and billing) after the caller has given up.

### 6.3 /tmp Storage

\`\`\`ts
import { writeFileSync, readFileSync } from 'fs';

// /tmp is the only writable directory (512 MB to 10 GB)
// Persists between invocations in the SAME execution environment (warm starts)
// NOT shared across concurrent invocations

writeFileSync('/tmp/cache.json', JSON.stringify(data));
const cached = JSON.parse(readFileSync('/tmp/cache.json', 'utf8'));
\`\`\`

### 6.4 Initialization (Outside Handler)

\`\`\`ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// Code outside the handler runs ONCE during cold start (INIT phase)
// Reused across invocations in the same execution environment
const dynamodb = new DynamoDBClient({});   // connection reused!
const config = loadConfig();                // loaded once

export const handler = async (event) => {
  // This runs on EVERY invocation
  const result = await dynamodb.send(new GetCommand({ /* … */ }));
  return { statusCode: 200, body: JSON.stringify(result) };
};
\`\`\`

Always initialize SDK clients, DB connections, and config OUTSIDE the handler for connection reuse.

---

## 7. Layers

Layers are ZIP archives containing libraries, custom runtimes, or shared code. They reduce deployment size and enable code sharing.

### 7.1 Creating a Layer

\`\`\`bash
# Create layer directory
mkdir -p my-layer/nodejs/node_modules

# Install dependencies into layer
cd my-layer/nodejs
npm install lodash axios sharp

# Zip the layer
cd my-layer
zip -r my-layer.zip nodejs/

# Publish layer
aws lambda publish-layer-version \\
  --layer-name my-shared-libs \\
  --zip-file fileb://my-layer.zip \\
  --compatible-runtimes nodejs20.x
\`\`\`

### 7.2 Using Layers

\`\`\`yaml
# SAM template
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Layers:
        - !Ref SharedLibsLayer
        - arn:aws:lambda:us-east-1:123456789:layer:my-layer:1

  SharedLibsLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      ContentUri: layers/shared-libs/
      CompatibleRuntimes:
        - nodejs20.x
\`\`\`

### 7.3 Layer Structure

\`\`\`
my-layer.zip
  nodejs/
    node_modules/
      lodash/
      axios/
    package.json

# Lambda merges layers into /opt/
# Node.js automatically finds modules in /opt/nodejs/node_modules/
\`\`\`

---

## 8. Cold Starts

A cold start occurs when Lambda creates a new execution environment (no warm container available). The request then waits for the whole INIT phase from §2.2: downloading your code, starting the runtime, and running everything at module level. That is why package size, heavy imports and work done outside the handler show up as latency on exactly these requests. It matters most for user-facing APIs, where it appears as occasional slow responses; for background jobs it is usually irrelevant.

### 8.1 What Causes Cold Starts

\`\`\`
1. First invocation (no environment exists)
2. Scaling up (need more concurrent environments)
3. Code or config change (new environment needed)
4. Environment recycled (idle too long, ~5-15 minutes)
\`\`\`

### 8.2 Cold Start Duration

\`\`\`
Runtime             Typical Cold Start
Node.js             100-500ms
Python              100-500ms
Go                  <100ms
Java                500ms-5s+
.NET                200ms-2s

Factors that increase cold start:
  - Larger deployment package
  - More dependencies
  - VPC configuration (+1-10s, improved with Hyperplane)
  - Too little memory allocated (CPU scales with memory, so init code runs slower)
  - Layers (slightly slower init)
\`\`\`

### 8.3 Reducing Cold Starts

\`\`\`ts
// 1. Keep deployment package small
// Remove dev dependencies, use tree-shaking, avoid large libraries

// 2. Initialize outside handler (reused on warm starts)
const client = new DynamoDBClient({});     // initialized once

// 3. Use Provisioned Concurrency (pre-warm environments)
// AWS keeps N environments always warm — eliminates cold starts
// Costs: ~$0.015/GB-hour for provisioned environments

// 4. Use smaller runtimes (Node.js, Python > Java, .NET)

// 5. Lazy loading (only import what you need)
export const handler = async (event) => {
  // Import heavy library only when needed
  const sharp = await import('sharp');
  // ...
};

// 6. Use AWS Lambda SnapStart (Java only)
// Snapshots the initialized environment for instant restore

// 7. Keep functions warm (invoke periodically — not recommended, use Provisioned Concurrency)
\`\`\`

---

## 9. Concurrency

Concurrency is the number of requests your function is handling at the same moment, and each one needs its own execution environment. The two settings below are easy to confuse because both have "concurrency" in the name: **reserved** concurrency is a *cap and a guarantee* (how many environments this function may use, carved out of the account's shared pool) and costs nothing; **provisioned** concurrency is *pre-warming* (environments initialized ahead of time so requests skip the cold start) and is billed for as long as it is configured.

### 9.1 Concurrency Model

\`\`\`
Each concurrent invocation = 1 execution environment

100 simultaneous requests = 100 environments
  (if not enough warm envs, cold starts for the rest)

Account default: 1,000 concurrent executions per region
  (can request increase to tens of thousands)
  New AWS accounts start with a reduced quota,
  which AWS raises automatically as usage grows
\`\`\`

### 9.2 Reserved Concurrency

\`\`\`
Sets a MAX concurrent executions for a function.
Guarantees capacity AND limits impact.

Example: Reserve 100 for payment processing
  - Guaranteed capacity for 100 environments (not pre-warmed: see 9.3)
  - Never exceeds 100 (protects downstream services)
  - Other functions share the remaining 900
\`\`\`

### 9.3 Provisioned Concurrency

\`\`\`
Pre-initializes N execution environments (always warm).
Eliminates cold starts for those N environments.

Example: Provision 50 for a latency-sensitive API
  - 50 environments are always initialized and warm
  - Requests 1-50: zero cold start
  - Request 51+: may cold start (or use auto-scaling)

Cost: ~$0.015/GB-hour (on top of invocation costs)
Use for: APIs needing consistent latency, scheduled traffic spikes
\`\`\`

---

## 10. Database and Storage

### 10.1 DynamoDB (Recommended for Lambda)

\`\`\`ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

// Initialize OUTSIDE handler
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  // Get item
  const { Item } = await docClient.send(new GetCommand({
    TableName: 'Users',
    Key: { userId: '123' },
  }));

  // Put item
  await docClient.send(new PutCommand({
    TableName: 'Users',
    Item: { userId: '456', name: 'Alice', createdAt: Date.now() },
  }));

  // Query
  const { Items } = await docClient.send(new QueryCommand({
    TableName: 'Orders',
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': '123' },
  }));

  return { statusCode: 200, body: JSON.stringify(Items) };
};
\`\`\`

### 10.2 S3

\`\`\`ts
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({});

export const handler = async (event) => {
  // Triggered by S3 event
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  // Read file
  const { Body } = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const content = await Body.transformToString();

  // Write file
  await s3.send(new PutObjectCommand({
    Bucket: 'output-bucket',
    Key: \`processed/\${key}\`,
    Body: processedContent,
    ContentType: 'application/json',
  }));
};
\`\`\`

### 10.3 RDS/MongoDB (Connection Pooling Challenges)

A traditional database accepts a limited number of connections, and a normal server shares a small pool of them across all its requests. Lambda breaks that assumption: every concurrent environment is a separate process with its own pool, so a traffic spike that scales you to hundreds of environments opens hundreds of connections and can hit the database's limit. The two defences below are to keep each environment's pool tiny and reuse it across warm invocations, or to put RDS Proxy (a managed pooler that sits between Lambda and the database) in front so the database sees a small, stable number of connections.

\`\`\`ts
// Problem: Lambda can create hundreds of concurrent connections
// Solution: Use RDS Proxy or connection pooling

// MongoDB with connection reuse
import { MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;

  cachedClient = new MongoClient(process.env.MONGO_URI!, {
    maxPoolSize: 1,                        // minimal connections per environment
  });
  await cachedClient.connect();
  return cachedClient;
}

export const handler = async (event) => {
  const client = await getClient();        // reused on warm starts
  const db = client.db('myapp');
  const users = await db.collection('users').find().toArray();
  return { statusCode: 200, body: JSON.stringify(users) };
};
\`\`\`

---

## 11. Error Handling and Retries

### 11.1 Synchronous Invocations

\`\`\`ts
// Throw an error → caller receives error response
export const handler = async (event) => {
  try {
    const result = await processEvent(event);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    console.error('Error:', error);
    // Return error response (don't throw — that returns 502)
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
\`\`\`

### 11.2 Asynchronous Invocations

\`\`\`
On failure:
  1. Lambda retries up to 2 times (configurable: 0, 1, or 2)
  2. After all retries fail:
     - Send to Dead Letter Queue (DLQ) — SQS or SNS
     - OR send to failure destination (Lambda, SQS, SNS, EventBridge)

Configuration:
  MaximumRetryAttempts: 0-2
  MaximumEventAgeInSeconds: 60-21600 (max 6 hours)
  DestinationConfig:
    OnFailure: { Destination: arn:aws:sqs:...:dlq }
    OnSuccess: { Destination: arn:aws:sns:...:topic }
\`\`\`

### 11.3 SQS Trigger Error Handling

\`\`\`
On failure:
  1. Message becomes invisible (visibility timeout)
  2. After timeout, message reappears in queue
  3. Lambda retries automatically
  4. After maxReceiveCount, message goes to Dead Letter Queue

Configure on SQS queue:
  VisibilityTimeout: 6x your Lambda timeout
  RedrivePolicy:
    maxReceiveCount: 3
    deadLetterTargetArn: arn:aws:sqs:...:my-dlq
\`\`\`

### 11.4 Partial Batch Failure (SQS)

\`\`\`ts
import { SQSEvent, SQSBatchResponse } from 'aws-lambda';

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const failedMessageIds: string[] = [];

  for (const record of event.Records) {
    try {
      await processMessage(JSON.parse(record.body));
    } catch (error) {
      failedMessageIds.push(record.messageId);
    }
  }

  // Only failed messages go back to queue
  return {
    batchItemFailures: failedMessageIds.map(id => ({
      itemIdentifier: id,
    })),
  };
};
// Requires: ReportBatchItemFailures in EventSourceMapping
\`\`\`

---

## 12. Monitoring and Logging

### 12.1 CloudWatch Logs

\`\`\`ts
// All console.log output goes to CloudWatch Logs automatically
console.log('INFO:', JSON.stringify({ action: 'createUser', userId: '123' }));
console.error('ERROR:', JSON.stringify({ error: 'Not found', code: 404 }));
console.warn('WARN:', 'Approaching rate limit');

// Structured logging (recommended)
const log = (level, message, data = {}) => {
  console.log(JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    requestId: process.env._X_AMZN_TRACE_ID,
    ...data,
  }));
};

log('INFO', 'User created', { userId: '123', email: 'a@b.com' });
\`\`\`

### 12.2 CloudWatch Metrics

\`\`\`
Built-in metrics (automatic):
  - Invocations         — number of invocations
  - Duration            — execution time
  - Errors              — invocations that returned an error
  - Throttles           — invocations throttled (concurrency limit)
  - ConcurrentExecutions — concurrent invocations
  - IteratorAge          — age of last record processed (streams)

Custom metrics: Use CloudWatch embedded metric format or AWS SDK
\`\`\`

### 12.3 X-Ray Tracing

\`\`\`ts
// Enable active tracing in Lambda config
// Then instrument SDK calls:
import { captureAWSv3Client } from 'aws-xray-sdk-core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const dynamodb = captureAWSv3Client(new DynamoDBClient({}));
// Now all DynamoDB calls are traced in X-Ray
\`\`\`

---

## 13. Security

### 13.1 IAM Execution Role

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:123456789:table/Users"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
\`\`\`

### 13.2 Secrets Management

\`\`\`ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({});

// Cache secret outside handler (reused on warm starts)
let cachedSecret: string | null = null;

async function getSecret(): Promise<string> {
  if (cachedSecret) return cachedSecret;

  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: 'my-app/db-credentials' })
  );
  cachedSecret = response.SecretString!;
  return cachedSecret;
}

export const handler = async (event) => {
  const secret = JSON.parse(await getSecret());
  // Use secret.username, secret.password
};
\`\`\`

### 13.3 VPC Configuration

\`\`\`
When Lambda needs to access private resources (RDS, ElastiCache, internal APIs):
  - Configure VPC, subnets, and security groups
  - Lambda gets ENI in your VPC
  - Internet access requires NAT Gateway (Lambda in VPC has no public IP)

When Lambda only accesses AWS services (DynamoDB, S3, SQS):
  - No VPC needed (faster, simpler)
  - Or use VPC Endpoints for private access without internet
\`\`\`

---

## 14. Deployment

### 14.1 AWS SAM (Serverless Application Model)

\`\`\`yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Runtime: nodejs20.x
    Timeout: 30
    MemorySize: 256
    Environment:
      Variables:
        STAGE: !Ref Stage
        TABLE_NAME: !Ref UsersTable

Parameters:
  Stage:
    Type: String
    Default: dev

Resources:
  GetUsersFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: handlers/users.getAll
      Events:
        GetUsers:
          Type: Api
          Properties:
            Path: /users
            Method: GET
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref UsersTable

  CreateUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: handlers/users.create
      Events:
        CreateUser:
          Type: Api
          Properties:
            Path: /users
            Method: POST
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref UsersTable

  UsersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub '\${Stage}-users'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: userId
          AttributeType: S
      KeySchema:
        - AttributeName: userId
          KeyType: HASH

Outputs:
  ApiUrl:
    Value: !Sub 'https://\${ServerlessRestApi}.execute-api.\${AWS::Region}.amazonaws.com/Prod/'
\`\`\`

\`\`\`bash
# Deploy
sam build
sam deploy --guided                        # first time (creates samconfig.toml)
sam deploy                                 # subsequent deploys

# Local testing
sam local invoke GetUsersFunction --event events/get-users.json
sam local start-api                        # local API Gateway on port 3000
\`\`\`

### 14.2 Serverless Framework

\`\`\`yaml
# serverless.yml
service: my-api
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  stage: \${opt:stage, 'dev'}
  environment:
    TABLE_NAME: \${self:service}-\${self:provider.stage}-users
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:GetItem
            - dynamodb:PutItem
            - dynamodb:Query
          Resource: !GetAtt UsersTable.Arn

functions:
  getUsers:
    handler: src/handlers/users.getAll
    events:
      - httpApi:
          path: /users
          method: GET

  createUser:
    handler: src/handlers/users.create
    events:
      - httpApi:
          path: /users
          method: POST

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: \${self:provider.environment.TABLE_NAME}
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: userId
            AttributeType: S
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
\`\`\`

\`\`\`bash
serverless deploy
serverless deploy --stage prod
serverless invoke -f getUsers
serverless logs -f getUsers --tail
\`\`\`

### 14.3 CDK (Cloud Development Kit)

\`\`\`ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class MyApiStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'Users', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const fn = new lambda.Function(this, 'GetUsers', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/users.getAll',
      code: lambda.Code.fromAsset('src'),
      environment: { TABLE_NAME: table.tableName },
    });

    table.grantReadData(fn);

    new apigateway.LambdaRestApi(this, 'Api', { handler: fn });
  }
}
\`\`\`

---

## 15. Patterns and Best Practices

### 15.1 Single-Purpose Functions

\`\`\`
GOOD: One function per action
  getUser, createUser, deleteUser

BAD: Monolith Lambda (Express inside Lambda)
  One function handling all routes

EXCEPTION: "Fat Lambda" with lightweight router
  can reduce cold starts and simplify deployment
  for moderate-size APIs
\`\`\`

### 15.2 Idempotency

Async and poll-based triggers deliver events **at least once**, so the same event can reach your handler twice (a retry after a timeout, or a duplicate from the queue). An idempotent handler is one where processing it a second time has no additional effect. The example records each event id with a conditional write that fails if the id already exists, and skips the event when it does.

One gap to know about: this version records the id *before* doing the work. If \`processEvent\` then throws, the retry finds the id already recorded and skips the event, so it is never processed. Production implementations (such as the idempotency utility in AWS Lambda Powertools) store an "in progress" status first and remove or complete the record depending on whether the work succeeded.

\`\`\`ts
// Lambda may be invoked multiple times for the same event (retries)
// Make handlers idempotent (safe to repeat)

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event) => {
  const idempotencyKey = event.Records[0].messageId;

  // Check if already processed
  try {
    await docClient.send(new PutCommand({
      TableName: 'Idempotency',
      Item: { id: idempotencyKey, ttl: Math.floor(Date.now() / 1000) + 86400 },
      ConditionExpression: 'attribute_not_exists(id)',
    }));
  } catch (e) {
    if (e.name === 'ConditionalCheckFailedException') {
      console.log('Already processed, skipping');
      return;
    }
    throw e;
  }

  // Process event
  await processEvent(event);
};
\`\`\`

### 15.3 Keep Functions Small and Fast

\`\`\`
1. Minimize deployment package (tree-shake, exclude dev deps)
2. Initialize SDK clients outside handler
3. Use environment variables for config (not parameter store on every invocation)
4. Cache secrets/config in module scope
5. Use connection pooling for databases
6. Set appropriate timeout (not max 15 min for an API)
7. Set appropriate memory (profile to find optimal cost/performance)
\`\`\`

---

## 16. Interview Questions & Answers

### Beginner

---

**Q1: What is AWS Lambda?**

AWS Lambda is a serverless compute service that runs your code in response to events without provisioning or managing servers. You upload your code, configure triggers, and AWS handles everything else — scaling, patching, availability. You pay only for the compute time you consume (per request + per millisecond of execution).

---

**Q2: What is a cold start?**

A cold start occurs when Lambda creates a new execution environment for your function — downloading code, initializing the runtime, and running initialization code. This adds latency (100ms-5s depending on runtime and package size) to the first invocation. Subsequent invocations reuse the warm environment and skip this overhead.

---

**Q3: What is the maximum execution time for a Lambda function?**

15 minutes (900 seconds). If your function needs more time, consider: Step Functions for orchestration, breaking work into smaller chunks, or using ECS/Fargate for long-running tasks.

---

**Q4: What are Lambda triggers? Name five.**

Triggers are event sources that invoke Lambda functions:
1. **API Gateway** — HTTP requests
2. **S3** — object created/deleted
3. **SQS** — messages in a queue
4. **DynamoDB Streams** — table changes
5. **EventBridge/CloudWatch Events** — scheduled or custom events
6. **SNS** — pub/sub notifications
7. **Cognito** — authentication events

---

**Q5: What is the difference between synchronous and asynchronous invocation?**

- **Synchronous**: Caller waits for the response. Lambda executes and returns the result directly. (API Gateway, SDK \`invoke()\`)
- **Asynchronous**: Caller gets an immediate 202 acknowledgment. Lambda queues the event and processes it in the background. Failed events can be retried and sent to a DLQ (dead-letter queue, a queue that collects events that failed every retry so you can inspect them). (S3, SNS, EventBridge)

The practical difference is who handles failure. A synchronous caller receives the error and decides whether to retry; nobody else will. An asynchronous caller has already moved on, so Lambda retries for you (twice by default), which is also why async handlers must be safe to run more than once for the same event.

---

### Intermediate

---

**Q6: How do you reduce cold starts?**

1. **Keep package small**: Remove unused dependencies, use tree-shaking
2. **Initialize outside handler**: SDK clients, DB connections, config — initialized once during cold start, reused on warm invocations
3. **Provisioned Concurrency**: Pre-warm N environments — eliminates cold starts for traffic up to N concurrent requests; anything beyond N still cold-starts (costs extra, billed while configured)
4. **Choose fast runtimes**: Node.js/Python have faster cold starts than Java/.NET
5. **Avoid VPC** if not needed (VPC adds ENI setup time)
6. **Lazy import**: Only import heavy libraries when needed
7. **SnapStart** (Java): Snapshots initialized environment

---

**Q7: How does Lambda scaling work?**

Short answer: Lambda scales by running more copies of your function side by side. One execution environment handles one request at a time, so 100 simultaneous requests need 100 environments, and Lambda creates the missing ones on demand (each new one is a cold start).

The limits that shape it:
- **Scaling rate**: each function can add up to 1,000 concurrent environments every 10 seconds. (Older material quotes a regional "burst limit" of 500–3,000 followed by 500 per minute; AWS replaced that model in late 2023.)
- **Account limit**: 1,000 concurrent executions per region by default, shared by all your functions, and raisable on request. Requests beyond it are **throttled**: synchronous callers get a 429 error, asynchronous events are retried.
- **Reserved concurrency** carves a fixed slice out of that shared pool for one function. It guarantees that function can always get that many environments, and also caps it there, which protects a fragile downstream database.
- **Provisioned concurrency** keeps a number of environments initialized in advance so those requests skip the cold start; you pay for them while they are configured.

Scale-down: Environments are kept warm for ~5-15 minutes after the last invocation, then destroyed.

---

**Q8: How do you handle database connections in Lambda?**

Short answer: create the connection once per execution environment and reuse it, keep each environment's pool to about one connection, and put RDS Proxy in front of relational databases so a traffic spike cannot open more connections than the database allows.

Challenge: Each Lambda environment is a separate process with its own connection. At 500 concurrent environments that is 500 connections, and relational databases like PostgreSQL and MySQL have a fixed maximum, so a spike can make the database refuse new connections for every client, not just Lambda.

Solutions:
1. **Initialize outside handler**: Reuse connections on warm invocations
2. **Minimal pool size**: Set \`maxPoolSize: 1\` per environment
3. **RDS Proxy**: Connection pooling service between Lambda and RDS (manages connections)
4. **DynamoDB**: Serverless database, no connection limits
5. **Cache connection**: Store in module-level variable, check before reconnecting

\`\`\`ts
let cachedDb = null;
async function getDb() {
  if (cachedDb) return cachedDb;
  cachedDb = await MongoClient.connect(uri, { maxPoolSize: 1 });
  return cachedDb;
}
\`\`\`

---

**Q9: What are Lambda Layers?**

Layers are ZIP archives containing shared code (libraries, runtimes, config) that multiple Lambda functions can use. They're extracted to \`/opt/\` at runtime.

Benefits:
- **Smaller uploads per deploy** — your function zip holds only your code, so deploys are faster and the code stays viewable in the console. Note the layer's size still counts toward the 250 MB unzipped limit; layers do not let you exceed it.
- **Share code across functions** — one copy of common utilities or dependencies instead of one per function.
- **Independent versioning** — each published layer version is immutable, and each function pins a specific version, so updating the layer never silently changes a function that has not opted in.

Example: A layer with \`sharp\` (image processing) shared by 10 Lambda functions instead of packaging it 10 times.

The trade-off to volunteer: a layer is a dependency your bundler and tests do not see, so version mismatches between a layer and the code using it only show up at runtime.

---

**Q10: Explain Lambda destinations vs DLQ.**

Short answer: both catch an **asynchronous** invocation that failed every retry, so the event is not silently lost. A dead-letter queue (DLQ) stores the original event, with only the error code and a truncated message attached. A destination sends a full invocation record (the event, the response or error, and why it was sent), can also fire on **success**, and supports more targets. Prefer destinations for new work.

| Feature | DLQ | Destinations |
|---------|-----|-------------|
| Trigger | Failure only | Success AND/OR failure |
| Targets | Standard SQS queue, standard SNS topic | SQS, SNS, Lambda, EventBridge, and S3 (on failure only) |
| Info included | The original event, plus error code and message as message attributes | Full invocation record: request payload, response payload, and the reason (for example \`RetriesExhausted\`) |
| Configuration | Function level only (all versions share it) | Function, version or alias |

Why the difference matters in practice: a DLQ message tells you *which* event failed and gives only the first 1 KB of the error message, so the full story means correlating the request ID with the logs. The destination record carries the full response and the retry count with it, which is what you want when someone has to reprocess the failures by hand.

Two things interviewers probe:
- **Neither applies to an SQS trigger.** When Lambda polls an SQS queue, the invocation is not asynchronous; failed messages go back to the queue and to the **queue's own** redrive DLQ, configured on the queue (see §11.3).
- **Size limits still apply.** An SNS target caps messages at 256 KB, while an async payload can now be up to 1 MB, so a large event can fail to reach an SNS DLQ or destination. SQS or S3 is the safer target for big payloads.

---

### Advanced

---

**Q11: How would you design a serverless REST API with Lambda?**

Architecture:
\`\`\`
Client → CloudFront (CDN) → API Gateway (HTTP API)
  → Lambda (getUsers) → DynamoDB
  → Lambda (createUser) → DynamoDB → SQS (send welcome email)
  → Lambda (processEmail) ← SQS trigger

Cognito → JWT Auth → API Gateway authorizer
\`\`\`

Key decisions:
1. **HTTP API v2** over REST API — cheaper and lower latency; choose REST API only if you need its extras (response caching, API keys and usage plans, WAF).
2. **One function per route** or **one function with router** — separate functions give each route its own permissions and scaling, one function means fewer cold starts because traffic keeps a single function warm.
3. **DynamoDB** for data — it is accessed over HTTP with no connection limit, so it does not suffer the connection exhaustion described in Q8, and it scales on demand like Lambda.
4. **SQS** for async work (email, notifications) — the API responds as soon as the message is queued instead of waiting on a slow third party, and failed sends retry from the queue.
5. **CloudFront** (AWS's CDN, a network of edge caches) — serves cacheable responses close to users and keeps repeat reads from reaching Lambda at all.
6. **Cognito** for authentication — API Gateway's JWT authorizer validates the token before your function runs, so unauthenticated requests never cost an invocation.
7. **SAM/CDK** for infrastructure as code — the whole stack is reproducible from a repository instead of console clicks.

---

**Q12: How do you handle idempotency in Lambda?**

Short answer: assume every event can arrive more than once, give each event a stable id, and record that id in a store with a conditional write so the second delivery sees "already done" and skips the work.

Duplicates are normal, not a bug: async invocations retry on failure, and SQS and streams guarantee *at-least-once* delivery, so a charge-the-card handler that runs twice charges twice. The pieces:

1. **Idempotency key**: an id that is the same on every delivery of one event (SQS \`messageId\`, or a client-supplied request id for APIs). A timestamp or a freshly generated UUID does not work, because it differs on each retry.
2. **Conditional write**: DynamoDB \`ConditionExpression: 'attribute_not_exists(id)'\` makes "check if seen, then record it" a single atomic step, so two copies arriving at the same moment cannot both pass the check.
3. **Idempotency table with a TTL** (an expiry time after which DynamoDB deletes the row automatically) keeps the table from growing forever; the TTL only needs to outlast the retry window.
4. **Record the outcome, not just the id**: mark the key "in progress" before the work and "complete" after, deleting it on failure, so a crash mid-way lets the retry run instead of being skipped (the gap in the §15.2 example). AWS Lambda Powertools ships an idempotency utility that implements this, and it can be used as Middy middleware.
5. **Database constraints**: a unique constraint on the business key (order id, payment id) is a last line of defence that holds even if the other layers have a bug.

---

**Q13: What is the difference between Lambda@Edge and CloudFront Functions?**

Short answer: both run your code on CloudFront requests. CloudFront Functions are tiny, very cheap JavaScript functions that run at every edge location and can only inspect and change request or response metadata (URL, headers, cookies), with no network access and a sub-millisecond budget. Lambda@Edge is a real Lambda function (Node.js or Python): slower and pricier per request, but it can call other services, read the request body and run for seconds.

| Feature | Lambda@Edge | CloudFront Functions |
|---------|------------|---------------------|
| Runtime | Node.js, Python | JavaScript only |
| Execution | Regional (nearest region) | Edge (all PoPs) |
| Duration | Up to 30s (viewer and origin events) | Sub-millisecond |
| Memory | 128 MB (viewer events), up to 10 GB (origin events) | 2 MB |
| Network | Yes | No |
| Use case | Complex origin logic, A/B testing, auth | URL rewrites, header manipulation, redirects |
| Cost | Higher | ~1/6 of Lambda@Edge |

Use CloudFront Functions for simple, fast transformations. Use Lambda@Edge for complex logic requiring network access or more compute.

---

**Q14: How do you implement a fan-out pattern with Lambda?**

\`\`\`
              ┌→ Lambda (resize small) → S3
S3 upload → SNS ─→ Lambda (resize medium) → S3
              └→ Lambda (resize large) → S3

Or:
              ┌→ SQS → Lambda (send email)
API → Lambda ─→ SQS → Lambda (update analytics)
              └→ SQS → Lambda (notify Slack)

Or:
Step Functions → Parallel state
  ├→ Lambda (validate)
  ├→ Lambda (enrich)
  └→ Lambda (score)
  → Lambda (combine results)
\`\`\`

Fan-out patterns use SNS (pub/sub), SQS (queues), or Step Functions (orchestration) to invoke multiple Lambda functions in parallel from a single event.

---

**Q15: Explain Step Functions and when to use them with Lambda.**

Step Functions is a serverless orchestration service that coordinates multiple Lambda functions into workflows (state machines).

\`\`\`json
{
  "StartAt": "ValidateInput",
  "States": {
    "ValidateInput": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:...:validate",
      "Next": "ProcessOrder"
    },
    "ProcessOrder": {
      "Type": "Parallel",
      "Branches": [
        { "StartAt": "ChargePayment", "States": { ... } },
        { "StartAt": "ReserveInventory", "States": { ... } }
      ],
      "Next": "SendConfirmation"
    },
    "SendConfirmation": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:...:notify",
      "End": true
    }
  }
}
\`\`\`

Use when:
- Workflow exceeds 15-minute Lambda limit
- Need retry/error handling per step
- Need parallel execution with join
- Need human approval steps
- Need visual workflow monitoring

---

**Q16: How would you optimize Lambda cost?**

Short answer: the bill is requests × price plus memory × duration, so cut the duration (faster code, right-sized memory, Arm), cut the number of invocations (batching, caching), and stop paying for idle capacity (provisioned concurrency only where latency demands it).

1. **Right-size memory**: Use AWS Lambda Power Tuning to find optimal memory (more memory = more CPU = faster = sometimes cheaper)
2. **Minimize duration**: Optimize code, use connection reuse, parallel API calls
3. **Use ARM/Graviton2**: 20% cheaper, often faster — set \`Architectures: [arm64]\`
4. **Avoid over-provisioning**: Use provisioned concurrency only where needed
5. **Reduce invocations**: Batch SQS messages, use larger batch sizes
6. **Use HTTP API v2**: 70% cheaper than REST API
7. **Caching**: CloudFront, API Gateway caching, or DynamoDB DAX
8. **Tiered storage**: S3 Intelligent-Tiering for infrequently accessed data
9. **Compute Savings Plans**: Up to 17% discount for committed usage

---

## References

- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg) — Official Lambda documentation
- [Lambda API Reference](https://docs.aws.amazon.com/lambda/latest/api) — Complete API reference
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide) — Serverless Application Model
`;export{e as default};
