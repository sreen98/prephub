const e=`# AWS Comparison Tables

Quick-reference comparison tables for AWS "X vs Y" interview questions. Each section explains the **why** behind the tradeoff — the architectural decision each service embodies.

---

## EC2 vs Lambda vs ECS

These represent three fundamentally different compute models. EC2 is infrastructure-as-a-service — you rent virtual machines and run whatever you want on them. Lambda is functions-as-a-service — you hand AWS a function and they run it on demand, charging per invocation. ECS (on Fargate) is containers-as-a-service — you hand AWS a Docker image and they run it with the resources you specify.

| Feature | EC2 | Lambda | ECS (Fargate) |
|---|---|---|---|
| **Model** | IaaS — virtual machines | FaaS — event-driven functions | CaaS — managed containers |
| **Management** | You manage OS, runtime, patching | Fully managed | You manage containers; AWS manages infra |
| **Scaling** | Manual or Auto Scaling Groups | Automatic (0 to thousands) | Auto Scaling based on tasks |
| **Pricing** | Per hour/second (always running) | Per request + duration | Per vCPU + memory per second |
| **Cold start** | None | ~100ms to seconds | ~30-60 seconds |
| **Max execution** | Unlimited | 15 minutes | Unlimited |
| **State** | Stateful | Stateless | Stateful within task |
| **Use case** | Legacy apps, GPU, long-running | Event processing, APIs, cron | Microservices, batch, web apps |

**Why the cost models diverge**: EC2 bills for the VM whether you use it or not — efficient for steady load, wasteful for bursty load. Lambda bills per 1-ms of execution — efficient for bursty load, expensive for steady load (crossover point is usually ~50% utilization). Fargate sits in between: you pay for tasks while they're running, which is cheaper than keeping an EC2 hot for quiet periods but lacks Lambda's scale-to-zero.

**Why Lambda is stateless**: containers are torn down after execution (or kept warm for ~15 min). You cannot rely on in-memory state or local disk across invocations. Use DynamoDB, S3, Redis (ElastiCache), or RDS for state.

**Why Fargate has slow cold starts**: each task pulls a container image, allocates ENI for networking, and starts the runtime. Provisioned capacity (EC2 launch type, or Fargate with capacity providers) keeps warm tasks and sidesteps this.

**When to use which**: Lambda for short-lived event-driven workloads (API Gateway handlers, S3 triggers, queue consumers). ECS for containerized microservices that run continuously. EC2 for full OS control (kernel tuning, GPU workloads, specialized licensing, sidecars that can't fit containers).

---

## S3 vs EBS vs EFS

Three different storage abstractions. S3 is an object store accessed over HTTP — you PUT and GET whole blobs. EBS is a block device attached to a single EC2 instance (like a virtual hard drive). EFS is a network file system (NFS) that multiple instances can mount simultaneously.

| Feature | S3 | EBS | EFS |
|---|---|---|---|
| **Type** | Object storage | Block storage | File storage (NFS) |
| **Access** | HTTP API (any service) | Single EC2 instance | Multiple EC2/Lambda |
| **Durability** | 11 9's | 5 9's | 11 9's |
| **Scalability** | Unlimited | Up to 64 TB/volume | Petabyte, auto-scaling |
| **Latency** | ~50-100ms | ~1ms | Low, scales with size |
| **Pricing** | ~$0.023/GB/mo | ~$0.08-0.125/GB/mo | ~$0.30/GB/mo |
| **Use case** | Static assets, backups, data lakes | Boot volumes, databases | Shared file systems, ML data |

**Why S3 is not a filesystem**: S3 keys that look like paths (\`logs/2024/01/file.log\`) are actually flat keys — "directories" don't exist. There's no rename (you have to copy+delete), no permissions at the inode level, no random-access writes. Applications that expect filesystem semantics don't work on S3 without a translation layer (\`s3fs\`, Mountpoint for S3).

**Why EBS is single-attach**: it's block-level, which means the OS formats it and keeps caches in memory. Allowing two machines to write the same blocks would corrupt the filesystem. There's "Multi-Attach" now, but it requires a cluster filesystem on top — not for general use.

**Why EFS is 6× more expensive than EBS**: NFS behind the scenes, replicated across AZs, scales elastically. You pay for that redundancy and scaling. For most workloads, EBS + S3 is cheaper. EFS shines when many compute nodes genuinely need a shared POSIX file system (ML training feeding from a shared dataset, legacy apps assuming local files).

**When to use which**: S3 for static files, backups, log archives, data lakes, anything accessed via HTTP. EBS for databases, boot volumes, anything that needs low-latency random I/O. EFS for shared file system access across many instances (avoid otherwise — it's expensive).

---

## ALB vs NLB

Application Load Balancer operates at OSI Layer 7 (HTTP/HTTPS), understanding URL paths, headers, and cookies. Network Load Balancer operates at Layer 4 (TCP/UDP), seeing only port numbers. The choice is about how much the load balancer needs to understand the traffic.

| Feature | ALB | NLB |
|---|---|---|
| **OSI layer** | Layer 7 (HTTP/HTTPS) | Layer 4 (TCP/UDP) |
| **Routing** | Path, host, header, query string | Port-based only |
| **Performance** | Moderate latency | Ultra-low latency (~100 microseconds) |
| **Static IP** | No | Yes — Elastic IP per AZ |
| **Targets** | Instances, IPs, Lambda | Instances, IPs, ALBs |
| **Use case** | Web apps, REST APIs | Gaming, IoT, TCP/UDP services |

**Why ALB is slower**: it terminates the TLS connection, parses HTTP headers, applies routing rules, then establishes a new connection to the target. Each step adds latency (a few ms typically). NLB just forwards packets — the TCP session is established end-to-end between client and target, no interpretation.

**Why NLB supports static IPs**: Layer 4 means it doesn't need to modify source/dest like a reverse proxy. It preserves the client's source IP (via source/destination NAT depending on mode) and offers Elastic IPs per AZ, so you can give customers "whitelist this IP" guarantees. ALB's IPs float with AWS's infrastructure.

**Why you'd chain ALB behind NLB**: NLB gives you static IPs and extreme performance at the edge; ALB sits behind it to do HTTP routing. Common in regulated environments where customers require fixed IPs.

**When to use which**: ALB for HTTP / HTTPS routing — REST APIs, web apps, anywhere URL-aware routing is valuable. NLB for extreme performance (HFT, gaming), TCP/UDP workloads, preserving client IPs, or when you need a static IP.

---

## SQS vs SNS vs EventBridge

Three messaging patterns. SQS is a queue — one producer puts messages in, one consumer reads them out, each message delivered to exactly one reader. SNS is pub-sub — one publisher, many subscribers, each subscriber gets every message. EventBridge is an event bus with content-based routing — events flow in, rules match them to targets.

| Feature | SQS | SNS | EventBridge |
|---|---|---|---|
| **Pattern** | Point-to-point (queue) | Pub-sub (fan-out) | Event bus (routing + filtering) |
| **Delivery** | Pull-based | Push-based | Push-based |
| **Retention** | Up to 14 days | No retention | 24h replay via archive |
| **Filtering** | No built-in | Message attribute filtering | Content-based rules |
| **Use case** | Work queues, decoupling | Fan-out notifications | Complex event routing |

**Why SQS is pull-based**: consumers poll the queue. This is essential for work-queue semantics — if a consumer is busy or crashed, messages sit in the queue and another worker grabs them. SNS pushes to its subscribers; a slow or failed subscriber doesn't affect others, but the message is gone after delivery attempts (with retry + DLQ).

**Why SNS → SQS is a standard pattern**: SNS gives you fan-out but no retention; SQS gives you retention but no fan-out. Subscribing SQS queues to an SNS topic gives you both — one publish event is mirrored into multiple queues, each queue buffers independently for its consumer. Most AWS event-driven designs use this.

**Why EventBridge exists**: when you have many event sources and many targets with complex routing needs ("route orders above $1000 to the VIP queue, all others to the default queue, also send all of them to audit logs"), SNS filtering doesn't cut it. EventBridge rules are content-based (JSON match), support multiple targets per rule, and know about AWS service events (EC2 state changes, S3 uploads, etc.) out of the box.

**When to use which**: SQS for work queues that need retention and backpressure. SNS for fan-out to a known set of subscribers. EventBridge for complex, content-based routing and integrating SaaS / AWS service events.

---

## IAM Role vs IAM User vs IAM Group

The IAM primitives all grant permissions but differ in *who holds the credential* and *how long it lasts*. Users are long-lived identities for humans or CI systems. Groups are just an organizational convenience. Roles are the preferred way to grant permissions to anything that can assume them — EC2 instances, Lambda functions, cross-account principals, even humans via federation.

| Feature | IAM User | IAM Group | IAM Role |
|---|---|---|---|
| **Represents** | A person or service | Collection of users | Permissions assumed temporarily |
| **Credentials** | Long-term (password, access keys) | None | Short-lived via STS |
| **Assumable by** | N/A | N/A | EC2, Lambda, users, cross-account |
| **Best practice** | Human users with MFA only | Organize by job function | Everything else: services, cross-account |
| **Security risk** | Key leakage | Over-broad permissions | Low — auto-rotated |

**Why roles beat users for services**: an IAM user's access keys are long-lived strings sitting in a config file or env var. Leaking them (commit to GitHub, logging, a compromised workstation) gives an attacker indefinite access. A role produces short-lived credentials (minutes to hours) via STS — leaking them is bounded in time and automatically expires.

**Why groups are structural only**: groups don't hold credentials. A user can be in multiple groups; the user's effective permissions are the union of group policies plus user policies. Groups let you manage "engineers get RO on S3" as a single attach instead of per-user.

**Role trust policy vs permissions policy**: a role has *two* policies. The **trust policy** says who can assume the role ("any EC2 instance in this account"). The **permissions policy** says what they can do once assumed ("read this S3 bucket"). Both must allow for access.

**When to use which**: Users for humans with MFA only (and consider federation via SSO / IAM Identity Center to avoid even that). Groups to organize permissions by job function. Roles for everything else — services, cross-account, short-lived access, CI/CD.

---

## RDS vs DynamoDB vs Aurora

Three database offerings that sit at very different points on the SQL-to-NoSQL spectrum.

| Feature | RDS | Aurora | DynamoDB |
|---|---|---|---|
| **Model** | Relational (SQL) | Relational (MySQL/Postgres compatible) | Key-value / document (NoSQL) |
| **Management** | Fully managed | Fully managed, AWS-proprietary storage | Fully managed serverless |
| **Scaling** | Vertical (bigger instance) + read replicas | Same + auto-scaling storage | Horizontal — unlimited |
| **Latency** | ms | ms (3–5× faster writes than RDS MySQL) | Single-digit ms, predictable |
| **Pricing** | Per instance hour + storage | Per instance hour + storage + I/O | Per request + storage (on-demand), or per capacity unit (provisioned) |
| **Best for** | Traditional OLTP, complex joins | High-perf SQL at scale | Massive scale, predictable access patterns |

**Why Aurora is worth 20% more than RDS MySQL/Postgres**: Aurora replaces the storage engine with a distributed log-structured store replicated 6× across 3 AZs. Writes commit when 4 of 6 copies confirm, giving you stronger durability and much faster replication. It also scales to 15 read replicas that share the same storage — so adding replicas is nearly free in terms of I/O.

**Why DynamoDB is horizontally scalable but restrictive**: it partitions by hash key. This gives you predictable single-digit-ms latency at any scale — but means access patterns must be designed around the key. \`SELECT * WHERE created_at > X\` is an anti-pattern unless you model an index for it. RDS lets you write whatever SQL you want (at the cost of not scaling horizontally past a point).

**When to use which**: RDS for small-to-medium OLTP apps where you want standard SQL. Aurora when you need SQL at scale or want better failover. DynamoDB for very-high-scale, well-understood access patterns (shopping carts, sessions, event logs, leaderboards).

---

## CloudFront vs API Gateway vs ALB

All three terminate requests at the edge of your architecture but do different jobs. CloudFront is a CDN — global edge locations caching static and dynamic content. API Gateway is an API proxy — request/response transformation, auth, throttling, usage plans. ALB is a load balancer — routes to targets.

| Feature | CloudFront | API Gateway | ALB |
|---|---|---|---|
| **Primary role** | CDN / edge caching | Managed API front door | Load balancer |
| **Scope** | Global (edge locations worldwide) | Regional (or edge-optimized) | Regional |
| **Caching** | First-class (edge + origin shield) | Limited (per-method) | None built-in |
| **Auth** | Lambda@Edge, signed URLs | IAM, Cognito, Lambda authorizers, API keys | None (delegate to backend) |
| **Pricing** | Per request + data transfer | Per request + data transfer | Per hour + LCU |
| **Use case** | Static assets, SPA, video, globally cached APIs | REST/HTTP APIs with quotas, usage plans, auth | HTTP traffic to your compute |

**Why you'd chain them**: \`CloudFront → API Gateway → Lambda\` is a common architecture. CloudFront caches at the edge globally, API Gateway handles auth and throttling, Lambda runs the business logic. Each layer does one thing well.

**When to use which**: CloudFront for anything cacheable and globally distributed. API Gateway when you want a managed API with throttling, quotas, or complex auth. ALB when you have regional compute (EC2, ECS) and just need traffic distributed.
`;export{e as default};
