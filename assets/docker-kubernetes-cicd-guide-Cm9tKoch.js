const e=`# Docker, Kubernetes & CI/CD — Complete Guide

You do not need to be a platform engineer to be asked these questions. Any full-stack or backend role now expects you to containerise a service, read a \`Dockerfile\` critically, explain what a Kubernetes deployment does, and describe a pipeline that gets code to production safely.

This guide covers exactly that band: enough container and orchestration depth to hold a real conversation, plus the CI/CD and deployment-strategy questions that follow. Terraform and cloud specifics are touched on but the AWS guides carry that detail.

---

## Table of Contents

- [1. Why This Comes Up](#1-why-this-comes-up)
- [2. Container Fundamentals](#2-container-fundamentals)
- [3. Writing a Dockerfile](#3-writing-a-dockerfile)
- [4. Image Size and Security](#4-image-size-and-security)
- [5. Docker Compose](#5-docker-compose)
- [6. Kubernetes — The Objects](#6-kubernetes-the-objects)
- [7. Health, Scaling and Configuration](#7-health-scaling-and-configuration)
- [8. CI/CD Pipelines](#8-cicd-pipelines)
- [9. Deployment Strategies](#9-deployment-strategies)
- [10. Secrets in CI/CD](#10-secrets-in-cicd)
- [11. Logs, Metrics and the 12-Factor Contract](#11-logs-metrics-and-the-12-factor-contract)
- [12. Infrastructure as Code](#12-infrastructure-as-code)
- [13. Interview Questions & Answers](#13-interview-questions-answers)
- [14. Tricky Questions](#14-tricky-questions)
- [15. Cheat Sheet](#15-cheat-sheet)
- [16. References](#16-references)

---

## 1. Why This Comes Up

Containers changed the deployment contract from "here is my code, please have the right runtime installed" to "here is an immutable artefact that runs identically everywhere." That shifts real responsibility onto application engineers: **you** own the \`Dockerfile\`, which means you own the image size, the startup time, the security posture and the build cache behaviour of your service.

The questions cluster into four areas:

| Area | What's being tested |
|---|---|
| **Containers** | Do you understand images and layers, or do you just copy a \`Dockerfile\`? |
| **Orchestration** | Can you explain what happens when a pod dies, and how traffic finds a new one? |
| **Pipelines** | Can you design a path to production that's fast, reproducible and safe? |
| **Deployment safety** | How do you ship without downtime, and how do you get back when it goes wrong? |

The recurring theme is **reproducibility and blast radius.** Almost every good answer here reduces to "make the artefact immutable, make the deploy reversible, and make the failure small."

---

## 2. Container Fundamentals

### 2.1 Containers Are Not VMs

\`\`\`
VIRTUAL MACHINES                    CONTAINERS
┌─────────┬─────────┐               ┌─────────┬─────────┐
│  App A  │  App B  │               │  App A  │  App B  │
│  Libs   │  Libs   │               │  Libs   │  Libs   │
├─────────┼─────────┤               ├─────────┴─────────┤
│ Guest OS│ Guest OS│  ← full OS    │  Container runtime│
├─────────┴─────────┤     each      ├───────────────────┤
│    Hypervisor     │               │  Host OS kernel   │ ← SHARED
├───────────────────┤               ├───────────────────┤
│    Host OS        │               │    Hardware       │
\`\`\`

A container is **a process on the host, isolated by kernel features** — not a virtualised machine. Three Linux primitives do the work:

- **Namespaces** — isolate what a process can *see*: PID, network, mount, UTS (hostname), IPC, user.
- **cgroups** — limit what it can *use*: CPU, memory, I/O.
- **Union filesystem** (overlayfs) — layered, copy-on-write images.

The consequences that get asked:

- **Startup is milliseconds**, not tens of seconds, because there's no OS to boot.
- **The kernel is shared**, so isolation is weaker than a VM's. A kernel exploit escapes the container. This is why multi-tenant untrusted workloads use VMs or a sandboxed runtime (gVisor, Firecracker) rather than plain containers.
- **You cannot run a Linux container on a Windows kernel** natively — Docker Desktop runs a Linux VM to do it. Same reason an \`arm64\` image won't run on \`amd64\` without emulation.

### 2.2 Images, Layers and the Cache

An image is an ordered stack of read-only layers. Each \`RUN\`, \`COPY\` and \`ADD\` creates one. A container adds a thin writable layer on top.

Two facts drive nearly every \`Dockerfile\` optimisation:

**1. Layers are cached and keyed by their instruction plus their inputs.** Docker reuses a layer if the instruction and everything it depends on are unchanged — and **a cache miss invalidates every layer after it.** That's the whole reason for the dependency-install ordering in §3.

**2. Layers are additive — deleting a file doesn't shrink the image.**

\`\`\`dockerfile
RUN curl -O https://example.com/big-file.tar.gz   # layer 1: +200 MB
RUN tar -xzf big-file.tar.gz                      # layer 2: +200 MB extracted
RUN rm big-file.tar.gz                            # layer 3: records a deletion
# Final image: ~400 MB. The file is still in layer 1, just hidden.
\`\`\`

The fix is to do it in **one** \`RUN\`, so the intermediate never becomes a layer:

\`\`\`dockerfile
RUN curl -O https://example.com/big-file.tar.gz \\
 && tar -xzf big-file.tar.gz \\
 && rm big-file.tar.gz
\`\`\`

This is also why a secret passed via \`ARG\` or written to a file and deleted **is still in the image history** and recoverable — a genuinely common leak (see §10).

---

## 3. Writing a Dockerfile

### 3.1 The Multi-Stage Node Build

This is the canonical thing to be able to write and explain:

\`\`\`dockerfile
# syntax=docker/dockerfile:1

# ---- deps: install production dependencies only -------------------------
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# ---- build: full deps, compile, then discard everything ------------------
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# ---- runtime: only what's needed to run ---------------------------------
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Run as a non-root user
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps  --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist         ./dist
COPY --chown=app:app package.json ./

USER app
EXPOSE 3000
# Handle signals properly — see §3.3
CMD ["node", "dist/server.js"]
\`\`\`

**Why each part is there:**

- **\`COPY package*.json\` before \`COPY . .\`** — the single most important optimisation. Dependencies change rarely, source changes constantly. Copying the manifests first means \`npm ci\` is cached and only re-runs when the lockfile changes. Copy the source first and you reinstall every dependency on every commit.
- **\`npm ci\`, not \`npm install\`** — installs exactly from the lockfile and fails if it's out of sync with \`package.json\`. Reproducible.
- **\`--ignore-scripts\`** — blocks install-time arbitrary code execution, the supply-chain control from the Web Security guide.
- **Multi-stage** — the build stage has compilers, dev dependencies and source; none of it ships. The final image contains the runtime, production \`node_modules\` and \`dist\`.
- **Non-root \`USER\`** — a container escape from a root process is far more dangerous. Containers run as root by default, which is the wrong default.
- **Exec-form \`CMD\` (\`["node", …]\`)** — not shell form. See §3.3.

### 3.2 The Frontend Variant

A React/Vite app has no Node runtime in production — it's static files:

\`\`\`dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf   # SPA fallback + cache headers
EXPOSE 80
\`\`\`

The \`nginx.conf\` is where the caching rules from the Frontend Architecture guide live — hashed assets \`immutable\`, \`index.html\` \`no-cache\`, and \`try_files $uri /index.html\` for client-side routing.

**The build-time environment-variable trap:** frontend env vars are **baked in at build time**, so one image cannot serve two environments. Either build per environment (simple, but you're no longer promoting the same artefact), or inject configuration at container start by templating a \`config.js\` the app fetches. The second is better practice and worth naming, because "build once, promote the same artefact" is a core CD principle.

### 3.3 Signals, PID 1 and Graceful Shutdown

Your process runs as **PID 1**, which has special semantics: it doesn't get default signal handlers, and it must reap orphaned children.

\`\`\`dockerfile
CMD npm start                      # ✗ shell form → sh is PID 1, SIGTERM is NOT
                                   #   forwarded to node. Container waits for the
                                   #   grace period then gets SIGKILL.
CMD ["node", "dist/server.js"]     # ✓ exec form → node is PID 1 and receives SIGTERM
\`\`\`

This matters because Kubernetes sends \`SIGTERM\`, waits \`terminationGracePeriodSeconds\` (30 by default), then \`SIGKILL\`s. If your process never sees the \`SIGTERM\`, every deploy drops in-flight requests. So handle it:

\`\`\`js
process.on('SIGTERM', async () => {
  server.close();                      // stop accepting new connections
  await drainInFlightRequests();       // finish what's in progress
  await db.end();                      // close pools cleanly
  process.exit(0);
});
\`\`\`

If your process spawns children (a shell script wrapper, a worker pool), add an init: \`docker run --init\`, or \`tini\`, or \`shareProcessNamespace\` in Kubernetes — otherwise zombies accumulate because PID 1 isn't reaping them.

---

## 4. Image Size and Security

### 4.1 Choosing a Base Image

| Base | Size | Trade-off |
|---|---|---|
| \`node:24\` | ~1.1 GB | full Debian; every tool present; large attack surface |
| \`node:24-slim\` | ~250 MB | Debian minus the extras — a safe default |
| \`node:24-alpine\` | ~140 MB | musl libc, not glibc — **native modules may break** |
| \`gcr.io/distroless/nodejs24\` | ~170 MB | **no shell, no package manager** — smallest attack surface |
| \`scratch\` | 0 | only for fully static binaries (Go, Rust) |

The Alpine caveat is the one to know: Alpine uses **musl** rather than glibc, so packages with prebuilt native binaries may fail or fall back to slow compilation, and some (notably certain image and crypto libraries) have subtle behavioural differences. \`-slim\` is the safer default; Alpine is fine once you've verified your native dependencies.

**Distroless is the security answer.** No shell means an attacker who achieves RCE has no \`sh\`, no \`curl\`, no package manager to pivot with. The trade-off is that you can't \`kubectl exec\` into it to debug — which is what **ephemeral debug containers** (\`kubectl debug\`) exist for.

### 4.2 The Rest of the Checklist

- **\`.dockerignore\`** — genuinely important, and frequently missing. Without it \`COPY . .\` sends \`node_modules\`, \`.git\`, \`.env\`, \`dist\` and every local artefact into the build context: slow builds, cache misses on every local change, and secrets in the image.

\`\`\`
node_modules
.git
.env*
dist
coverage
Dockerfile
\`\`\`

- **Pin base images by digest** for reproducibility: \`FROM node:24-alpine@sha256:…\`. A tag is mutable; a digest is not.
- **Scan images** — Trivy, Grype, or your registry's scanner, in CI, failing on high severity.
- **Drop capabilities and run read-only** where you can: \`--read-only\`, \`--cap-drop=ALL\`, \`--security-opt=no-new-privileges\`.
- **One process per container.** Not a religious rule — it's that orchestrators manage *containers*, so two processes in one container means the orchestrator can't restart, scale or health-check them independently.
- **Don't store state in the container filesystem.** It's ephemeral by design; use a volume or an external service.
- **Use BuildKit cache mounts** so the package cache survives across builds without becoming a layer:

\`\`\`dockerfile
RUN --mount=type=cache,target=/root/.npm npm ci
\`\`\`

---

## 5. Docker Compose

Compose is for **local development and simple single-host deployments** — not a production orchestrator.

\`\`\`yaml
services:
  api:
    build:
      context: .
      target: build            # use the build stage for dev, with dev deps
    command: npm run dev
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/app
    volumes:
      - .:/app                 # bind-mount source for hot reload
      - /app/node_modules      # anonymous volume: keep the CONTAINER's node_modules
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_PASSWORD: secret
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      retries: 10

volumes:
  pgdata:
\`\`\`

Three details that are the actual interview content:

- **\`depends_on\` alone only waits for the container to *start*, not to be *ready*.** A Postgres container is "running" seconds before it accepts connections, so your API crashes on boot. The fix is \`condition: service_healthy\` plus a \`healthcheck\` — or application-level connection retry, which you want anyway because databases restart in production too.
- **The \`/app/node_modules\` anonymous volume** stops the host bind-mount from shadowing the container's installed modules. Without it, a host without \`node_modules\` (or with modules built for a different platform/architecture) breaks the container.
- **Service names are DNS names.** \`db:5432\` resolves via Docker's embedded DNS on the user-defined network. That's why the connection string says \`db\` and not \`localhost\`.

---

## 6. Kubernetes — The Objects

You don't need to run a cluster to answer these; you need the object model and the reconciliation idea.

**The core concept: declarative reconciliation.** You describe desired state; controllers continuously work to make actual state match. That single idea explains self-healing, rolling updates and scaling — nobody tells Kubernetes to restart a crashed pod; the ReplicaSet controller notices a discrepancy and fixes it.

| Object | What it is |
|---|---|
| **Pod** | the smallest deployable unit — one or more containers sharing a network namespace and volumes |
| **ReplicaSet** | keeps N identical pods running |
| **Deployment** | manages ReplicaSets to give you **rolling updates and rollback** |
| **Service** | a stable virtual IP + DNS name load-balancing across matching pods |
| **Ingress** / Gateway API | HTTP routing, TLS termination, host/path rules |
| **ConfigMap** | non-secret configuration |
| **Secret** | secret configuration (**base64-encoded, not encrypted** by default) |
| **StatefulSet** | for stateful workloads — stable identities and per-pod storage |
| **DaemonSet** | one pod per node (log shippers, agents) |
| **Job** / **CronJob** | run-to-completion and scheduled work |
| **HPA** | scales replicas on metrics |
| **PVC** | a request for persistent storage |
| **Namespace** | a scoping boundary for names, quotas and RBAC |

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }   # never dip below capacity
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: registry.example.com/api@sha256:abc123…   # digest, not a tag
          ports: [{ containerPort: 3000 }]
          resources:
            requests: { cpu: 100m, memory: 128Mi }   # used for SCHEDULING
            limits:   { cpu: 500m, memory: 512Mi }   # enforced at RUNTIME
          readinessProbe:
            httpGet: { path: /readyz, port: 3000 }
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /healthz, port: 3000 }
            periodSeconds: 10
            failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata: { name: api }
spec:
  selector: { app: api }
  ports: [{ port: 80, targetPort: 3000 }]
\`\`\`

**How traffic finds a pod** — worth being able to narrate, because it's a common "explain what happens" question: the Service selects pods by **label**, and the endpoints controller maintains the list of *ready* pod IPs. When a pod fails its readiness probe it's removed from that list, so traffic stops going to it without the pod being killed. That distinction — readiness controls traffic, liveness controls restarts — is §7.1.


---

## 7. Health, Scaling and Configuration

### 7.1 The Three Probes — and Why They're Different

This is the most-asked Kubernetes question, and getting the distinction right is the whole answer.

| Probe | Failing it does what | Use for |
|---|---|---|
| **readiness** | **removes the pod from the Service** — no traffic, pod stays alive | "am I able to serve right now?" |
| **liveness** | **kills and restarts the container** | "am I wedged and unrecoverable?" |
| **startup** | disables the other two until it passes | slow-booting apps |

\`\`\`yaml
readinessProbe:                      # can I serve? check dependencies
  httpGet: { path: /readyz, port: 3000 }
livenessProbe:                       # am I deadlocked? check ONLY the process
  httpGet: { path: /healthz, port: 3000 }
startupProbe:                        # give a slow JVM/Rails boot time
  httpGet: { path: /healthz, port: 3000 }
  failureThreshold: 30
  periodSeconds: 10                  # up to 300s to start
\`\`\`

**The classic mistake — and it causes cascading outages:** checking the database in the *liveness* probe.

\`\`\`
Database has a brief hiccup
  → every pod's liveness probe fails
  → Kubernetes restarts EVERY pod simultaneously
  → the app is now fully down, and stays down while pods crash-loop
  → and the restart storm hammers the recovering database
\`\`\`

A liveness probe should check only "is this process responsive" — usually a trivial handler that returns 200. Dependency checks belong in **readiness**, where failure removes the pod from load balancing but leaves it alive to recover. The rule: **liveness answers "restart me?", readiness answers "route to me?"** — and a dependency being down is almost never a reason to restart.

The other reason readiness matters: it's what makes **zero-downtime rolling updates** work. A new pod receives no traffic until it's ready, so \`maxUnavailable: 0\` plus a correct readiness probe means the old pod isn't removed before the new one can serve.

### 7.2 Requests vs Limits

\`\`\`yaml
resources:
  requests: { cpu: 100m, memory: 128Mi }   # guaranteed; used for SCHEDULING
  limits:   { cpu: 500m, memory: 512Mi }   # ceiling; enforced at RUNTIME
\`\`\`

The two behave **completely differently on exceeding the limit**, and this is a favourite follow-up:

- **CPU is compressible** — exceeding the CPU limit **throttles** the container (via cgroup CFS quota). Your app gets slow, not killed. A too-low CPU limit is a classic cause of mysterious latency: p99 spikes with no error, because the process is being paused mid-request.
- **Memory is not compressible** — exceeding the memory limit **kills the container** with \`OOMKilled\` (exit 137). Kubernetes then restarts it. A container that's \`OOMKilled\` in a loop is \`CrashLoopBackOff\`.

Requests also determine **QoS class**, which decides eviction order under node pressure: \`Guaranteed\` (requests == limits) is evicted last, \`BestEffort\` (nothing set) first. Setting requests but no limits is common and reasonable for CPU; **always set a memory limit**, or one leaking pod can take down a whole node.

And the Node-specific gotcha: **the JVM and Node.js historically didn't see cgroup limits**, so they'd size their heap against the *node's* memory and get OOMKilled long before hitting their own limit. Modern versions are container-aware, but you should still set \`--max-old-space-size\` (Node) below the container's memory limit.

### 7.3 Scaling

\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }
\`\`\`

The HPA scales on CPU, memory, or custom/external metrics (queue depth is often the right signal for a worker). Two things to name: **CPU utilisation is measured against the *request***, not the limit — so a wrong request breaks autoscaling entirely. And **HPA is useless without correct requests**, which is the most common misconfiguration.

Also worth knowing: **VPA** adjusts requests/limits rather than replica count (and conflicts with HPA on the same resource), **Cluster Autoscaler / Karpenter** adds *nodes* when pods can't be scheduled, and **PodDisruptionBudget** stops voluntary disruptions (a node drain, a cluster upgrade) from taking too many replicas down at once — the thing people forget until a routine cluster upgrade causes an outage.

### 7.4 Configuration and Secrets

\`\`\`yaml
envFrom:
  - configMapRef: { name: api-config }
  - secretRef:    { name: api-secrets }
\`\`\`

**Kubernetes Secrets are base64-encoded, not encrypted**, and that's the single most important fact about them. Anyone with \`get secret\` RBAC, or read access to etcd, can read them. Mitigations, in ascending order of robustness:

1. **Enable encryption at rest** for etcd (\`EncryptionConfiguration\`) — table stakes, and off by default in some distributions.
2. **Tight RBAC** on secret access, per namespace.
3. **External secret stores** — Vault, AWS Secrets Manager, or an operator like External Secrets, so the source of truth is outside the cluster with rotation and audit.
4. **Workload identity / IRSA** — the strongest option: no long-lived secret at all. The pod assumes a cloud IAM role via a projected service-account token, so there's nothing to leak.

Never commit secrets to Git — including in a Helm \`values.yaml\`. If you're doing GitOps, use Sealed Secrets or SOPS so what's committed is encrypted.

---

## 8. CI/CD Pipelines

### 8.1 The Shape

\`\`\`
push → lint + typecheck + unit  (fast, parallel, on every push)
     → build image once, tag by SHA        ← ONE artefact
     → integration tests against it
     → push to registry
     → deploy to staging automatically
     → E2E smoke tests
     → deploy to production (gated)
     → verify (health, metrics, error rate)
\`\`\`

The principle that ties it together: **build the artefact once and promote it.** Rebuilding per environment means staging and production ran different bytes, so your testing proved nothing about what shipped. That's also why frontend build-time env vars are a problem (§3.2).

### 8.2 A Real GitHub Actions Workflow

\`\`\`yaml
name: ci
on:
  push: { branches: [main] }
  pull_request:

concurrency:                      # cancel superseded runs on the same ref
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

permissions:                      # least privilege — default is often too broad
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version: 24, cache: npm }
      - run: npm ci --ignore-scripts
      - run: npm run lint
      - run: npx tsc --noEmit          # type-check separately; Node strips, doesn't check
      - run: npm test -- --coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write               # OIDC — no long-lived cloud keys
      packages: write
    steps:
      - uses: actions/checkout@v5
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/\${{ github.repository }}:\${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          provenance: true            # build attestation
\`\`\`

The details that matter and are frequently missing:

- **\`concurrency\` with \`cancel-in-progress\`** — stops five queued runs on the same branch burning CI minutes.
- **Explicit \`permissions\`** — the default token scope is often far wider than the job needs. A compromised action with \`contents: write\` can push to your repo.
- **\`id-token: write\` + OIDC** — federate into AWS/GCP for a short-lived credential instead of storing long-lived access keys as secrets. This is the single biggest CI security improvement available, and it directly addresses the supply-chain scenario from the Web Security guide.
- **Pin actions.** \`@v5\` is a mutable tag; a compromised action version runs in your pipeline with your secrets. Pinning to a full commit SHA is the hardened form.
- **\`cache-from\`/\`cache-to type=gha\`** — Docker layer cache across runs, otherwise every CI build starts cold.
- **\`npx tsc --noEmit\`** as its own step, because bundlers and Node's type stripping don't type-check (see the TypeScript and Node guides).
- **Tag by SHA**, never only \`latest\`. \`latest\` is mutable, so you can't tell what's deployed or roll back to a known artefact.

### 8.3 Making Pipelines Fast

Slow pipelines get bypassed, so speed is a correctness feature:

- **Parallelise** independent jobs; only serialise real dependencies.
- **Cache aggressively** — dependency cache, Docker layer cache, and a build cache (Turborepo/Nx remote cache for a monorepo, which is what makes affected-only CI viable — see the Frontend Architecture guide).
- **Run affected-only** in a monorepo. A change to one package shouldn't test twelve.
- **Fail fast**: lint and type-check before the expensive E2E suite.
- **Shard slow suites** across runners (Playwright and Jest both support it).
- **Keep E2E to critical paths.** They're slow and flaky relative to their coverage; the pyramid exists for a reason (see the Testing Strategy guide).

---

## 9. Deployment Strategies

| Strategy | How | Cost | Rollback |
|---|---|---|---|
| **Recreate** | stop all, start new | **downtime** | redeploy |
| **Rolling** | replace pods incrementally | none | roll forward/back gradually |
| **Blue-green** | two full environments, flip the router | 2× infrastructure | **instant** — flip back |
| **Canary** | send 1% → 10% → 50% → 100% | needs traffic splitting | shift traffic back |
| **A/B** | route by user attribute | needs routing logic | change the rule |

**Rolling** is the Kubernetes default and the right baseline. \`maxSurge: 1, maxUnavailable: 0\` means it adds a pod before removing one, so capacity never dips.

**Canary is the best answer for a risky change**, because it limits blast radius *and* gives you real signal: watch error rate, latency and business metrics **for the canary cohort specifically**, not the aggregate — 1% of traffic failing is invisible in an average. Automated analysis (Argo Rollouts, Flagger) can promote or roll back on those metrics without a human.

**The point to make unprompted: feature flags decouple deploy from release.** Ship the code dark, enable it per cohort, and now your rollback is a config change taking effect in seconds rather than a redeploy taking minutes. That's a fundamentally better failure mode, and it's what makes trunk-based development safe.

**And the constraint that breaks all of this: the database.** Every strategy above assumes the old and new versions can coexist, which means every migration must be backwards-compatible with the currently-running code — the expand/contract pattern from the SQL guide §12. Blue-green is *hardest* here, because both environments share one database and the schema must satisfy both simultaneously.

---

## 10. Secrets in CI/CD

The failure modes, and what to do:

- **\`ARG\` and \`ENV\` are baked into image history.** \`docker history\` recovers them. Never pass a secret via \`--build-arg\`. Use BuildKit secret mounts, which never become a layer:

\`\`\`dockerfile
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
\`\`\`
\`\`\`bash
docker build --secret id=npmrc,src=$HOME/.npmrc .
\`\`\`

- **A deleted file is still in the earlier layer** (§2.2). Writing a secret and \`rm\`-ing it in a later \`RUN\` leaves it recoverable.
- **Logs leak secrets.** Echo a variable in a debug step and it's in your CI log, which usually has broader read access than the secret store. GitHub masks registered secrets, but not values derived from them.
- **Pull requests from forks** must not have access to secrets. \`pull_request_target\` runs with the base repo's secrets against the fork's code — a known privilege-escalation shape. Avoid it, or gate it behind an approval.
- **Prefer no secret at all**: OIDC federation (\`id-token: write\`) for cloud access, workload identity for pods. A short-lived token that can't be exfiltrated to be reused later is categorically better than a stored key.
- **Separate the install job from the deploy job.** The job that runs \`npm ci\` should not hold production credentials, so a malicious \`postinstall\` can't reach production (Web Security guide §7).
- **Rotate on exposure, don't just delete.** Git history, forks and clones retain it.

---

## 11. Logs, Metrics and the 12-Factor Contract

The relevant 12-factor rules for containers:

- **Config in the environment**, not in the image. One artefact, many environments.
- **Logs to \`stdout\`/\`stderr\` as an event stream** — never to a file inside the container. The platform collects, aggregates and routes them; a log file in an ephemeral filesystem disappears with the pod, and log rotation becomes your problem. **Structured JSON** so they're queryable.
- **Processes are stateless and disposable.** Any pod can be killed at any moment; state lives in a database, cache or object store. Sticky sessions are a smell — put session state in Redis.
- **Fast startup, graceful shutdown** (§3.3). Slow startup makes scaling and rolling updates slow.

**Correlation is what makes this useful**: propagate a trace ID from the edge through every service and include it in every log line, so one request's journey is queryable across pods. OpenTelemetry is the standard, and the same trace ID should reach the browser so a frontend error links to the server responses that caused it (Frontend Architecture guide §8).

The four signals to expose: **RED** for services (Rate, Errors, Duration) and **USE** for resources (Utilisation, Saturation, Errors). Alert on **symptoms** users feel (error rate, latency), not causes (CPU) — a CPU alert at 3am that nobody is affected by is how on-call rotations burn out.

---

## 12. Infrastructure as Code

\`\`\`hcl
resource "aws_ecs_service" "api" {
  name            = "api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 3
}
\`\`\`

The concepts worth holding, without pretending to be a Terraform specialist:

- **Declarative and idempotent** — you describe desired state; \`plan\` shows the diff; \`apply\` converges. Same reconciliation idea as Kubernetes.
- **State is the crux.** Terraform's state file maps config to real resources. It must be in **remote storage with locking** (S3 + DynamoDB, or Terraform Cloud), or two engineers applying simultaneously corrupt it. State also **contains secrets in plaintext**, so it needs encryption and tight access.
- **\`plan\` in CI on every PR** so reviewers see the infrastructure diff; \`apply\` gated on merge.
- **Modules** for reuse; **workspaces** or separate state per environment.
- **Drift** — someone changes something in the console and reality diverges from code. Detect it with a scheduled \`plan\`.
- **Terraform vs CloudFormation vs CDK/Pulumi**: Terraform is multi-cloud with a huge provider ecosystem; CloudFormation is AWS-native with no state file to manage; CDK and Pulumi let you write infrastructure in a real programming language, which is a genuine advantage for loops and abstractions and a genuine hazard for the same reason.


---

## 13. Interview Questions & Answers

### Beginner

---

**Q1: What's the difference between a container and a virtual machine?**

A VM virtualises **hardware** — it runs a full guest OS with its own kernel on a hypervisor. A container is **a process on the host, isolated by kernel features**, sharing the host kernel.

Three Linux primitives do the isolation: **namespaces** control what the process can *see* (PID, network, mount, hostname, IPC, user), **cgroups** limit what it can *use* (CPU, memory, I/O), and a **union filesystem** provides the layered copy-on-write image.

The consequences:

- **Startup**: milliseconds vs tens of seconds, because there's no OS to boot. That's what makes autoscaling and per-request containers viable.
- **Density**: hundreds of containers per host vs a handful of VMs, since you're not duplicating an OS each time.
- **Isolation strength**: **weaker**. A kernel exploit escapes a container but not a VM. So genuinely untrusted multi-tenant workloads use VMs, or a sandboxed runtime like gVisor or Firecracker — which is exactly what serverless platforms do under the hood.
- **Kernel compatibility**: you can't run a Linux container on a Windows or macOS kernel natively — Docker Desktop runs a Linux VM. Same reason an \`arm64\` image needs emulation on \`amd64\`.

The framing I'd add: containers didn't win on isolation, they won on **the artefact**. An image is an immutable, reproducible bundle of your app *and* its dependencies, which changes the deployment contract from "please have the right runtime installed" to "run this exact thing."

---

**Q2: Walk me through a production Dockerfile for a Node app. Why is each part there?**

I'd write a multi-stage build:

\`\`\`dockerfile
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps  --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist         ./dist
USER app
CMD ["node", "dist/server.js"]
\`\`\`

**\`COPY package*.json\` before \`COPY . .\`** is the most important line, and it's about the layer cache. Layers are keyed by instruction plus inputs, and a cache miss invalidates every layer after it. Dependencies change rarely and source changes constantly, so copying manifests first means \`npm ci\` is cached until the lockfile changes. Copy the source first and you reinstall every dependency on every commit.

**Multi-stage** means the compilers, dev dependencies and source never ship — the final image has only the runtime, production \`node_modules\` and \`dist\`. Typically a 1 GB image becomes 150 MB, which is faster to pull (so faster to scale) and a much smaller attack surface.

**\`npm ci --ignore-scripts\`**: \`ci\` installs exactly from the lockfile and fails if it's out of sync, so builds are reproducible; \`--ignore-scripts\` blocks install-time arbitrary code execution, which is the main supply-chain control here.

**Non-root \`USER\`** because containers run as root by default and a container escape from a root process is far worse.

**Exec-form \`CMD\`** so \`node\` is PID 1 and receives \`SIGTERM\`. Shell form makes \`sh\` PID 1, which doesn't forward signals, so every deploy drops in-flight requests when Kubernetes eventually \`SIGKILL\`s.

And I'd insist on a **\`.dockerignore\`** — without one, \`COPY . .\` ships \`node_modules\`, \`.git\` and \`.env\` into the image, and busts the cache on every local change.

---

**Q3: Explain readiness, liveness and startup probes. What's the classic mistake?**

- **Readiness** — "can I serve traffic right now?" Failing it **removes the pod from the Service's endpoint list**, so traffic stops, but the pod stays alive.
- **Liveness** — "am I wedged?" Failing it **kills and restarts the container**.
- **Startup** — disables the other two until it passes, so a slow-booting app isn't killed before it finishes starting.

**The classic mistake is checking dependencies in the liveness probe**, and it causes cascading outages:

\`\`\`
Database hiccups for 20 seconds
  → every pod's liveness probe fails
  → Kubernetes restarts EVERY pod at once
  → the app is fully down, pods crash-loop
  → the restart storm hammers the recovering database
\`\`\`

A brief dependency blip becomes a total outage, and restarting the pod was never going to fix a database problem. So: **liveness checks only whether the process is responsive** — usually a trivial 200. Dependency checks go in **readiness**, where failure removes the pod from load balancing but leaves it alive to recover on its own.

The rule to state: **liveness answers "restart me?", readiness answers "route to me?"** — and a dependency being down is almost never a reason to restart.

Readiness is also what makes zero-downtime rolling updates work: a new pod gets no traffic until ready, so \`maxUnavailable: 0\` plus a correct readiness probe means the old pod isn't drained before the new one can serve.

---

### Intermediate

---

**Q4: What's the difference between resource requests and limits, and what happens when you exceed each?**

**Requests** are what the scheduler uses to place the pod — a guaranteed reservation. **Limits** are a runtime ceiling. The important part is that **CPU and memory behave completely differently on exceeding the limit:**

- **CPU is compressible** → the container is **throttled** via the cgroup CFS quota. It gets slow, not killed. A too-low CPU limit is a classic cause of mysterious p99 latency with zero errors, because the process is paused mid-request.
- **Memory is not compressible** → the container is **\`OOMKilled\`** (exit 137) and restarted. In a loop, that's \`CrashLoopBackOff\`.

Requests also set the **QoS class**, which determines eviction order under node pressure: \`Guaranteed\` (requests == limits) is evicted last, \`Burstable\` next, \`BestEffort\` (nothing set) first.

The practical guidance: **always set a memory limit**, or one leaking pod can take down the whole node. For CPU, setting a request without a limit is often reasonable — it guarantees a floor while letting the pod burst into idle capacity, avoiding throttling on spiky workloads.

Two things I'd volunteer. **HPA measures CPU utilisation against the *request*, not the limit** — so a wrong request silently breaks autoscaling, and that's the most common HPA misconfiguration. And **runtimes historically didn't see cgroup limits**: the JVM and older Node versions sized their heap against the *node's* memory and got OOMKilled well before their own limit. Modern versions are container-aware, but I'd still set \`--max-old-space-size\` below the container limit.

---

**Q5: Design a CI/CD pipeline for a web application.**

\`\`\`
push → lint + typecheck + unit (parallel, every push)
     → build the image ONCE, tag by commit SHA
     → integration tests against that image
     → push to registry
     → auto-deploy to staging
     → E2E smoke tests
     → deploy to production (gated)
     → verify: health, error rate, latency
\`\`\`

The organising principle is **build once, promote the same artefact.** Rebuilding per environment means staging and production ran different bytes, so your testing proved nothing about what shipped. Tag by **SHA**, never only \`latest\`, so you always know what's deployed and can roll back to a known artefact.

Concretely in GitHub Actions I'd want: **\`concurrency\` with \`cancel-in-progress\`** so superseded runs don't burn minutes; **explicit least-privilege \`permissions\`** because the default token scope is usually too broad; **OIDC federation (\`id-token: write\`)** instead of storing long-lived cloud keys — the single biggest CI security improvement available; **actions pinned to a commit SHA**, since a tag is mutable and a compromised action runs with your secrets; **Docker layer caching** (\`type=gha\`) or every build starts cold; and **\`tsc --noEmit\` as its own step**, because bundlers and Node's type stripping don't type-check.

**Speed is a correctness feature** — slow pipelines get bypassed. So: parallelise independent jobs, cache dependencies and layers, run affected-only in a monorepo, fail fast (lint before E2E), shard slow suites, and keep E2E to critical paths.

For **deployment**, rolling as the baseline with \`maxSurge: 1, maxUnavailable: 0\`, and **canary for risky changes** — watching error rate and latency **for the canary cohort specifically**, because 1% of traffic failing is invisible in the aggregate.

Two things I'd raise unprompted. **Feature flags decouple deploy from release**, which turns rollback from a redeploy into a config change taking effect in seconds — a fundamentally better failure mode. And **the database is the real constraint**: every strategy assumes old and new code can coexist, so migrations must be backwards-compatible with the running version (expand/contract). Blue-green is hardest here because both environments share one database.

---

**Q6: Your deployment is in \`CrashLoopBackOff\`. How do you debug it?**

Systematically, from the outside in — and the first job is to find out *which* kind of failure it is.

\`\`\`bash
kubectl get pods                          # STATUS, RESTARTS, AGE
kubectl describe pod <pod>                # Events + Last State + exit code
kubectl logs <pod> --previous             # ← logs from the CRASHED container
kubectl logs <pod> -c <container>         # a specific container in a multi-container pod
\`\`\`

**\`--previous\` is the key flag.** The current container may have just started, so its logs are empty — you need the logs of the instance that died.

Then the **exit code** in \`describe\` narrows it immediately:

- **137** → \`OOMKilled\`. Memory limit too low, or a genuine leak. Check \`describe\` for \`Reason: OOMKilled\`.
- **139** → segfault, usually a native module built for the wrong architecture or libc (the Alpine/musl trap).
- **1 / other non-zero** → the app exited on its own. Read the logs; usually a missing env var, a failed database connection at boot, or an unhandled exception during startup.
- **0** → the process *completed*. It's a long-running service that exited successfully, so probably the wrong \`CMD\`, or a shell form that ran and finished.

The specific causes I'd check in order: **missing or wrong configuration** (a ConfigMap or Secret key that doesn't exist — \`describe\` shows this as a mount/env error rather than a crash); **the app failing on a dependency at startup** and exiting instead of retrying; **a liveness probe that's too aggressive**, killing the app before it finishes booting — which is what \`startupProbe\` exists to fix; **the wrong architecture** (\`exec format error\`); and **a readiness probe pointing at the wrong port or path**, which won't crash-loop but will show \`0/1 READY\` forever.

For a hard case: \`kubectl debug\` to attach an ephemeral container (essential with distroless images, where there's no shell), or temporarily override the command to \`sleep 3600\` so you can exec in and inspect the environment as the app sees it. And \`kubectl get events --sort-by=.lastTimestamp\` catches cluster-level causes like failed image pulls or unschedulable pods.

---

### Advanced

---

**Q7: A container runs fine locally and fails in production. What are the likely causes?**

I'd group them, because "works on my machine" has a few distinct shapes:

**1. Architecture.** Building on an Apple Silicon Mac produces \`arm64\`; the cluster is probably \`amd64\`. Symptom: \`exec format error\`, or a native module segfaulting (exit 139). Fix: \`docker buildx build --platform linux/amd64\`, or build multi-arch in CI. This is by far the most common cause since Apple Silicon became standard.

**2. Configuration.** Local \`.env\` files aren't in the image (correctly — \`.dockerignore\`), so a variable that exists on your machine is absent in the cluster. Symptom: exit 1 at startup. Fix: validate required config at boot and fail with a clear message naming the missing key, rather than a stack trace from a downstream \`undefined\`.

**3. Networking.** \`localhost\` inside a container is the *container*, not the host or another service. Locally Compose gives you service-name DNS; in Kubernetes it's the Service name, and cross-namespace needs the FQDN. Plus egress: NetworkPolicies, security groups or a proxy may block calls that work from your laptop.

**4. Filesystem and permissions.** Locally you're root and the filesystem is writable. In production you're a non-root \`USER\` (correctly) and possibly \`readOnlyRootFilesystem\`, so anything writing to disk fails. Fix: write only to a mounted \`emptyDir\` or \`/tmp\`, and make sure \`--chown\` is right on copied files.

**5. Resources.** Your laptop has 32 GB; the container has a 512 Mi limit. Symptom: \`OOMKilled\`. Also the runtime-not-seeing-cgroups issue.

**6. Signals and lifecycle.** Locally you Ctrl-C and don't notice that shell-form \`CMD\` swallowed \`SIGTERM\`. In production every deploy drops in-flight requests.

**7. Timing and dependencies.** Locally the database is already up. In the cluster the app may start before its dependency is reachable. The fix is application-level retry with back-off — not just \`depends_on\`, which doesn't exist in Kubernetes anyway.

**8. Image drift.** \`FROM node:24\` locally resolved to a different digest than the CI build weeks later. Fix: pin by digest.

**The structural fix** for most of this is **build the image in CI and run that exact image locally** (\`docker compose\` against the built image, or \`kind\`/Minikube), rather than running the app natively in development and the image only in production. Also: staging should match production in architecture, resource limits and configuration shape — differences there are precisely where this class of bug hides.

---

**Q8: When would you *not* use Kubernetes?**

Often, and being willing to say so is the point of the question — Kubernetes is powerful and has a very real operational cost.

**Don't use it when:**

- **You have a handful of services and a small team.** Kubernetes has a large surface area — networking, RBAC, ingress, storage classes, autoscaling, upgrades, certificate rotation — and someone has to own it. For three services, that person's time is better spent on the product. A managed platform (Cloud Run, ECS Fargate, App Runner, Fly, Render, Vercel) gives you containers, autoscaling, rolling deploys and TLS with a fraction of the concepts.
- **The workload is genuinely serverless-shaped** — spiky, event-driven, scale-to-zero. Lambda or Cloud Run bills per request and idles at zero cost; a Kubernetes cluster has a floor.
- **It's a static site or a simple SPA.** A CDN and object storage. Putting a React build behind an nginx pod behind an ingress behind a load balancer is strictly worse than a static host on every axis.
- **You need it for one thing.** Adopting Kubernetes to get rolling deploys, when your PaaS already does rolling deploys, is buying a platform to use one feature.
- **Nobody on the team knows it.** The failure mode isn't "it doesn't work" — it's a misconfigured cluster nobody can debug at 3am. That's worse than a simpler system you fully understand.

**Do use it when:** you have many services with genuinely different scaling profiles; you need portability across clouds or on-prem; you want one consistent control plane for deploys, secrets, scaling and networking across many teams; you have workloads a PaaS can't express (DaemonSets, StatefulSets, GPU scheduling, custom operators); or you already have the platform expertise, at which point the marginal cost of another service is near zero.

The honest summary: **Kubernetes solves an organisational problem — many teams deploying many services with one operating model.** If you don't have that problem, it's mostly cost. That's the same reasoning as micro-frontends in the Frontend Architecture guide, and it's the reasoning interviewers are checking for.

---

## 14. Tricky Questions

---

**Q1: Your image is 1.2 GB despite \`rm\`-ing the build artefacts. Why, and how do you fix it?**

\`\`\`dockerfile
FROM node:24
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
RUN rm -rf node_modules src .git && npm install --omit=dev
\`\`\`

**Answer:** Layers are **additive** — \`rm\` in a later layer only records a deletion mask. Every deleted file is still present in the earlier layer, and still in the image.

**Explanation:**

An image is an ordered stack of read-only layers, and each \`RUN\`/\`COPY\`/\`ADD\` adds one. Deleting a file in layer 5 doesn't remove it from layer 3; it writes a whiteout entry so the file isn't *visible* in the final filesystem. The bytes are still shipped, still pulled, and still recoverable with \`docker history\` or by extracting the layer.

So this \`Dockerfile\` ships: the full Debian base (~1.1 GB), the entire source tree including \`.git\`, the dev \`node_modules\`, the build output, **and** the production \`node_modules\` — layered on top of each other.

Two fixes, and the second is the real one:

\`\`\`dockerfile
# 1. Collapse into one RUN so the intermediate never becomes a layer
RUN npm ci && npm run build && rm -rf node_modules && npm ci --omit=dev
\`\`\`

\`\`\`dockerfile
# 2. MULTI-STAGE — the correct answer. Nothing from the build stage exists
#    in the final image unless you explicitly COPY it.
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/dist ./dist
CMD ["node", "dist/server.js"]
\`\`\`

Multi-stage works because each \`FROM\` starts a **fresh layer stack**. The build stage's layers are never part of the final image's history at all — so there's nothing to hide and nothing to recover.

**The same mechanism is a security bug, not just a size one.** A secret passed as a build arg, or written to a file and deleted, is permanently in the image history:

\`\`\`dockerfile
ARG NPM_TOKEN                              # ✗ recoverable via docker history
RUN echo "//registry:_authToken=$NPM_TOKEN" > .npmrc && npm ci && rm .npmrc
\`\`\`

The fix is a BuildKit secret mount, which is never persisted to a layer:

\`\`\`dockerfile
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
\`\`\`

Also worth naming: add a **\`.dockerignore\`** (\`node_modules\`, \`.git\`, \`.env*\`, \`dist\`) — without it \`COPY . .\` ships all of that into the build context, which both bloats the image and busts the layer cache on every local file change.

**Takeaway:** image layers are additive, so \`rm\` only hides files rather than removing them — use multi-stage builds (a fresh layer stack per \`FROM\`) for size, and BuildKit secret mounts for anything sensitive, because \`ARG\` and deleted files stay in the image history.

---

**Q2: Every deploy drops in-flight requests, even with \`maxUnavailable: 0\` and a correct readiness probe. Why?**

**Answer:** Most likely the container isn't receiving \`SIGTERM\` (shell-form \`CMD\`), or it isn't handling it — and even when it is, there's an endpoint-propagation race that needs a \`preStop\` sleep.

**Explanation:**

Two separate problems, and both are needed for genuinely zero-downtime deploys.

**1. The signal never arrives.**

\`\`\`dockerfile
CMD npm start                    # ✗ /bin/sh is PID 1. It does NOT forward SIGTERM.
CMD ["node", "dist/server.js"]   # ✓ node is PID 1 and receives it
\`\`\`

With shell form, Kubernetes sends \`SIGTERM\` to \`sh\`, which ignores it, waits out \`terminationGracePeriodSeconds\` (30s by default), then gets \`SIGKILL\`ed — taking every in-flight request with it. And even with exec form, you must actually handle it:

\`\`\`js
process.on('SIGTERM', async () => {
  server.close();                    // stop accepting NEW connections
  await drainInFlight();             // finish what's in progress
  await db.end();
  process.exit(0);
});
\`\`\`

**2. The endpoint-removal race — the subtler half.** Pod termination and endpoint removal happen **concurrently**, not in sequence:

\`\`\`
kubelet sends SIGTERM ──┐
                        ├── these race
endpoints controller ───┘   removes the pod IP → kube-proxy/ingress updates rules
\`\`\`

So for a brief window the pod has begun shutting down while load balancers are *still* routing to it. The fix is a \`preStop\` hook that simply waits, so the endpoint removal propagates before your app starts refusing connections:

\`\`\`yaml
lifecycle:
  preStop:
    exec: { command: ["sh", "-c", "sleep 5"] }
terminationGracePeriodSeconds: 30    # must exceed preStop + your drain time
\`\`\`

The sequence then becomes: \`preStop\` starts → endpoints update and traffic stops arriving → \`preStop\` finishes → \`SIGTERM\` → your handler drains → exit. Counter-intuitively, **sleeping does more for zero-downtime than any amount of application code**, because the problem is propagation delay outside your process.

Other contributors worth checking: \`terminationGracePeriodSeconds\` shorter than your drain time (you get \`SIGKILL\`ed mid-drain); long-lived connections like **WebSockets**, which need application-level "reconnect elsewhere" messaging rather than draining; a **\`PodDisruptionBudget\`** missing, so a node drain removes too many replicas at once; and the readiness probe's \`periodSeconds\` being long enough that a not-yet-ready pod still looks ready.

**Takeaway:** zero-downtime shutdown needs three things — exec-form \`CMD\` so the process is PID 1 and gets \`SIGTERM\`, a handler that stops accepting connections and drains, and a \`preStop\` sleep to cover the race between pod termination and endpoint removal.

---

**Q3: A brief database blip took down your entire service for ten minutes, even though the database recovered in twenty seconds. What happened?**

**Answer:** The liveness probe checked the database. Every pod failed it simultaneously, Kubernetes restarted them all, and the restart storm both removed all capacity and hammered the recovering database.

**Explanation:**

\`\`\`yaml
livenessProbe:
  httpGet: { path: /health, port: 3000 }   # /health also pings the DB  ← the bug
  failureThreshold: 3
  periodSeconds: 10
\`\`\`

The cascade:

\`\`\`
t+0s   DB becomes unreachable for 20s
t+30s  every pod has failed liveness 3× → Kubernetes kills ALL of them
t+35s  new pods start, fail their startup DB connection, exit
t+45s  CrashLoopBackOff begins — with EXPONENTIAL BACKOFF (10s, 20s, 40s, 80s…)
t+50s  DB is healthy again — but pods are now in a long backoff and won't retry yet
t+10m  backoff finally elapses, pods start, service recovers
\`\`\`

The database was fine after 20 seconds. The **outage was entirely self-inflicted**, and \`CrashLoopBackOff\`'s exponential delay is what turned a 20-second blip into ten minutes.

The compounding factor: restarting a pod **cannot fix a database problem**. Every restart was pure harm — it destroyed warm connection pools and caches, and the simultaneous reconnection attempts from every replica made the database's recovery slower.

**The fix is the probe split:**

\`\`\`yaml
livenessProbe:                      # ONLY: is this process responsive?
  httpGet: { path: /healthz, port: 3000 }     # returns 200 unconditionally
readinessProbe:                     # dependencies go HERE
  httpGet: { path: /readyz, port: 3000 }      # checks DB, cache, etc.
\`\`\`

Now a database outage fails **readiness**, so pods are removed from the Service and stop receiving traffic — but stay alive, keep their connection pools, and rejoin automatically the moment the dependency recovers. Recovery time becomes the dependency's recovery time, which is the correct behaviour.

Two more things I'd add. **Don't exit on a failed dependency at startup** either — retry with back-off, so a pod that starts during an outage waits rather than crash-looping. And consider whether the dependency should even affect readiness: if only 20% of your endpoints need the database, taking the whole pod out of rotation is worse than serving the other 80% and returning a 503 for the rest. **Graceful degradation beats binary health**, and that's the senior version of this answer.

**Takeaway:** liveness answers "restart me?" and readiness answers "route to me?" — putting a dependency check in liveness converts any dependency blip into a cluster-wide restart storm that outlasts the original outage thanks to \`CrashLoopBackOff\`'s exponential backoff.

---

## 15. Cheat Sheet

\`\`\`
CONTAINERS
 1. A container is a PROCESS isolated by namespaces (what it sees) + cgroups
    (what it uses) + a union FS. It shares the host KERNEL — weaker isolation
    than a VM, so untrusted multi-tenant → VMs or gVisor/Firecracker.
 2. Layers are CACHED (keyed by instruction + inputs) and a miss invalidates
    everything after it.
 3. Layers are ADDITIVE — \`rm\` only hides a file. Deleted files (and secrets)
    stay in the image history. Collapse into one RUN, or use multi-stage.
 4. One process per container — orchestrators manage containers, so two processes
    can't be restarted/scaled/health-checked independently.

DOCKERFILE
 5. COPY package*.json BEFORE COPY . . — the single most important optimisation.
 6. npm ci (lockfile-exact, fails if out of sync) + --ignore-scripts (supply chain).
 7. MULTI-STAGE: each FROM starts a fresh layer stack. Compilers and dev deps
    never ship. ~1 GB → ~150 MB.
 8. Non-root USER — containers run as root by default, which is the wrong default.
 9. EXEC-FORM CMD ["node","x.js"] — shell form makes sh PID 1, which does NOT
    forward SIGTERM → every deploy drops in-flight requests.
10. .dockerignore (node_modules, .git, .env*, dist) or COPY . . ships everything
    and busts the cache on every local edit.
11. Pin base images by DIGEST. A tag is mutable.
12. RUN --mount=type=cache,target=/root/.npm — cache without a layer.
13. RUN --mount=type=secret — the ONLY safe way to use a secret at build time.
    NEVER --build-arg.
14. Alpine = musl not glibc → native modules may break. -slim is the safer default.
    Distroless = no shell = smallest attack surface (debug with kubectl debug).
15. Handle SIGTERM: server.close() → drain → close pools → exit(0).
    Use --init/tini if you spawn children, or zombies accumulate.

COMPOSE
16. depends_on waits for START, not READY → use condition: service_healthy
    + a healthcheck, AND application-level retry.
17. The anonymous /app/node_modules volume stops the host bind-mount shadowing
    container-installed modules.
18. Service names are DNS names on the user-defined network (db:5432, not localhost).

KUBERNETES
19. Declarative RECONCILIATION: you declare desired state, controllers converge.
    That one idea explains self-healing, rolling updates and scaling.
20. Deployment → ReplicaSet → Pods. Service = stable VIP + DNS selecting pods
    BY LABEL; the endpoints controller tracks the READY ones.
21. PROBES: readiness = "route to me?" (removes from Service, pod lives)
    liveness  = "restart me?" (kills the container)
    startup   = disables the other two until it passes
22. NEVER check dependencies in LIVENESS → a DB blip restarts every pod, and
    CrashLoopBackOff's exponential backoff outlasts the original outage.
23. Dependency checks go in READINESS. Better still: degrade gracefully rather
    than taking the whole pod out for a partial dependency.
24. REQUESTS = scheduling + QoS + the HPA's utilisation baseline.
    LIMITS = runtime ceiling.
25. CPU over limit → THROTTLED (slow, no error, mystery p99).
    Memory over limit → OOMKILLED (exit 137).
26. ALWAYS set a memory limit. CPU request without a limit is often right.
27. HPA measures against the REQUEST — a wrong request silently breaks autoscaling.
28. Set --max-old-space-size (Node) below the container memory limit.
29. PodDisruptionBudget stops a routine node drain becoming an outage.
30. K8s Secrets are BASE64, NOT ENCRYPTED. Enable etcd encryption at rest, tight
    RBAC, external secret stores, and prefer workload identity (no secret at all).
31. Zero-downtime needs: exec-form CMD + a SIGTERM handler + a preStop sleep
    (to cover the endpoint-removal race) + terminationGracePeriodSeconds > drain time.
32. Debug: kubectl logs --previous (the CRASHED instance), describe pod for exit
    code + events, kubectl debug for distroless. 137=OOM, 139=segfault/wrong arch,
    0=process completed (wrong CMD).

CI/CD
33. BUILD ONCE, PROMOTE THE SAME ARTEFACT. Rebuilding per environment means your
    tests proved nothing about what shipped.
34. Tag by commit SHA, never only \`latest\` (mutable → you can't tell what's deployed).
35. concurrency + cancel-in-progress. Explicit least-privilege permissions.
36. OIDC federation (id-token: write) instead of long-lived cloud keys —
    the biggest single CI security win.
37. PIN ACTIONS TO A COMMIT SHA. A tag is mutable and runs with your secrets.
38. Separate the INSTALL job from the DEPLOY job — a malicious postinstall must
    not reach production credentials.
39. Never --build-arg a secret; never echo one (CI logs have wider read access).
    Fork PRs must not get secrets (beware pull_request_target).
40. tsc --noEmit as its own step — bundlers and Node's type stripping don't check types.
41. Speed is a correctness feature: parallelise, cache deps + layers, affected-only
    in a monorepo, fail fast, shard slow suites, E2E on critical paths only.

DEPLOYMENT
42. Rolling (maxSurge 1 / maxUnavailable 0) is the sane baseline.
43. Blue-green = instant rollback, 2x infra, HARDEST with a shared database.
44. Canary for risky changes — and watch the CANARY COHORT's metrics, not the
    aggregate (1% failing is invisible in an average).
45. FEATURE FLAGS decouple deploy from release → rollback becomes a config change
    in seconds instead of a redeploy in minutes.
46. THE DATABASE IS THE CONSTRAINT. Every strategy assumes old and new code coexist
    → expand/contract migrations, backwards-compatible with the running version.

12-FACTOR & OBSERVABILITY
47. Config in the ENVIRONMENT, logs to STDOUT as structured JSON, processes
    stateless and disposable, fast start + graceful shutdown.
48. Never log to a file inside a container — it dies with the pod.
49. Propagate a trace ID from the edge into every log line (OpenTelemetry), and
    reach the browser so a frontend error links to the causing server responses.
50. RED for services (Rate/Errors/Duration), USE for resources. Alert on SYMPTOMS
    users feel, not on CPU.

IaC
51. Declarative + idempotent: plan shows the diff, apply converges.
52. STATE must be remote WITH LOCKING, and it contains secrets in plaintext →
    encrypt it and restrict access.
53. terraform plan in CI on every PR; apply gated on merge. Scheduled plan to
    detect console-made drift.

WHEN NOT TO USE K8s
54. A handful of services and a small team → managed platform (Cloud Run, Fargate,
    Fly, Render, Vercel).
55. Spiky, event-driven, scale-to-zero → serverless (K8s has a cost floor).
56. A static site → CDN + object storage.
57. Nobody on the team knows it → a misconfigured cluster nobody can debug at 3am
    is worse than a simpler system you understand.
58. K8s solves an ORGANISATIONAL problem: many teams, many services, one operating
    model. Without that problem it's mostly cost.
\`\`\`

---

## 16. References

- [Docker — Best practices for writing Dockerfiles](https://docs.docker.com/build/building/best-practices/) — the authoritative source on layers and caching
- [Docker BuildKit — build secrets](https://docs.docker.com/build/building/secrets/) — the correct way to use a secret at build time
- [Kubernetes Documentation — Concepts](https://kubernetes.io/docs/concepts/) — genuinely well written; start with Workloads and Services
- [Kubernetes — Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Kubernetes — Managing Resources for Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) — requests, limits and QoS classes
- [Kubernetes — Pod Lifecycle (termination)](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination) — the endpoint-removal race in primary-source form
- [Distroless container images](https://github.com/GoogleContainerTools/distroless) — minimal runtime images
- [Trivy](https://trivy.dev) — image and IaC vulnerability scanning in CI
- [GitHub Actions — Security hardening](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions) — permissions, OIDC, pinning, fork-PR risks
- [GitHub Actions — OIDC hardening](https://docs.github.com/en/actions/concepts/security/openid-connect) — replacing long-lived cloud credentials
- [The Twelve-Factor App](https://12factor.net) — still the clearest statement of the container-native application contract
- [Google SRE Book](https://sre.google/sre-book/table-of-contents/) — the source for alerting on symptoms and error budgets
- [Argo Rollouts](https://argoproj.github.io/rollouts/) / [Flagger](https://flagger.app) — automated canary analysis and progressive delivery
- [Terraform — Remote State](https://developer.hashicorp.com/terraform/language/state/remote) — why locking matters
`;export{e as default};
