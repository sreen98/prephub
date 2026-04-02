# AWS Comparison Tables

Quick-reference comparison tables for AWS "X vs Y" interview questions.

---

## EC2 vs Lambda vs ECS

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

**When to use which:** Lambda for short-lived event-driven workloads. ECS for containerized microservices. EC2 for full OS control or GPU workloads.

---

## S3 vs EBS vs EFS

| Feature | S3 | EBS | EFS |
|---|---|---|---|
| **Type** | Object storage | Block storage | File storage (NFS) |
| **Access** | HTTP API (any service) | Single EC2 instance | Multiple EC2/Lambda |
| **Durability** | 11 9's | 5 9's | 11 9's |
| **Scalability** | Unlimited | Up to 64 TB/volume | Petabyte, auto-scaling |
| **Latency** | ~50-100ms | ~1ms | Low, scales with size |
| **Pricing** | ~$0.023/GB/mo | ~$0.08-0.125/GB/mo | ~$0.30/GB/mo |
| **Use case** | Static assets, backups, data lakes | Boot volumes, databases | Shared file systems, ML data |

**When to use which:** S3 for static files and backups. EBS for databases needing low latency. EFS for shared access across instances.

---

## ALB vs NLB

| Feature | ALB | NLB |
|---|---|---|
| **OSI layer** | Layer 7 (HTTP/HTTPS) | Layer 4 (TCP/UDP) |
| **Routing** | Path, host, header, query string | Port-based only |
| **Performance** | Moderate latency | Ultra-low latency (~100 microseconds) |
| **Static IP** | No | Yes — Elastic IP per AZ |
| **Targets** | Instances, IPs, Lambda | Instances, IPs, ALBs |
| **Use case** | Web apps, REST APIs | Gaming, IoT, TCP/UDP services |

**When to use which:** ALB for HTTP routing. NLB for extreme performance or TCP/UDP.

---

## SQS vs SNS vs EventBridge

| Feature | SQS | SNS | EventBridge |
|---|---|---|---|
| **Pattern** | Point-to-point (queue) | Pub-sub (fan-out) | Event bus (routing + filtering) |
| **Delivery** | Pull-based | Push-based | Push-based |
| **Retention** | Up to 14 days | No retention | 24h replay via archive |
| **Filtering** | No built-in | Message attribute filtering | Content-based rules |
| **Use case** | Work queues, decoupling | Fan-out notifications | Complex event routing |

**When to use which:** SQS for buffered delivery. SNS for fan-out. EventBridge for complex routing with content-based filtering.

---

## IAM Role vs IAM User vs IAM Group

| Feature | IAM User | IAM Group | IAM Role |
|---|---|---|---|
| **Represents** | A person or service | Collection of users | Permissions assumed temporarily |
| **Credentials** | Long-term (password, access keys) | None | Short-lived via STS |
| **Assumable by** | N/A | N/A | EC2, Lambda, users, cross-account |
| **Best practice** | Human users with MFA only | Organize by job function | Everything else: services, cross-account |
| **Security risk** | Key leakage | Over-broad permissions | Low — auto-rotated |

**When to use which:** Users for humans (with MFA). Groups to organize. Roles for everything else.
