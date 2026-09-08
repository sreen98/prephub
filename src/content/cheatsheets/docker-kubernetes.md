# Docker & Kubernetes Cheat Sheet

## Docker CLI
```bash
docker build -t app:1.0 .              # build from ./Dockerfile
docker build --target builder .        # stop at a named stage
docker run -p 3000:3000 --rm app:1.0   # host:container, remove on exit
docker run -e NODE_ENV=production -v "$PWD":/app app:1.0
docker exec -it <id> sh                # shell into a RUNNING container
docker logs -f --tail 100 <id>
docker ps -a                           # -a includes stopped
docker images / docker rmi <img>
docker system prune -af --volumes      # reclaim everything unused
docker stats                           # live CPU/memory
docker inspect <id>
docker compose up -d --build
docker compose logs -f svc
docker compose down -v
```

## Dockerfile — multi-stage Node
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev                  # ci = lockfile-exact; cached unless lock changes

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node                              # never run as root
EXPOSE 3000
CMD ["node", "dist/server.js"]         # EXEC form → PID 1 gets SIGTERM
```

## Dockerfile rules
- **Layers are additive.** `RUN rm secret` only *hides* it — the earlier layer still contains it. Use multi-stage or a secret mount.
- Copy `package*.json` and install **before** copying source, so the dependency layer stays cached.
- **Exec-form `CMD`** (`["node","x.js"]`), not shell form — shell form makes `/bin/sh` PID 1 and swallows `SIGTERM`.
- Alpine uses **musl**, not glibc — native modules may need `node:20-slim` or `-bookworm`.
- `.dockerignore` must list `node_modules`, `.git`, `dist`, `.env`.
- `COPY` over `ADD` (ADD auto-extracts and fetches URLs).
- `ARG` is build-time and **visible in history**; `ENV` persists into the image. Neither is a secret store.
- Pin base image tags; `latest` is not reproducible.

```dockerfile
# BuildKit cache + secret mounts
RUN --mount=type=cache,target=/root/.npm npm ci
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
```

## kubectl
```bash
kubectl get pods -o wide -n prod
kubectl get all -A
kubectl describe pod <p>               # events at the bottom = why it won't start
kubectl logs -f <p> -c <container>
kubectl logs --previous <p>            # logs from the CRASHED instance
kubectl exec -it <p> -- sh
kubectl apply -f k8s/ --dry-run=server
kubectl rollout status deploy/app
kubectl rollout undo deploy/app
kubectl rollout restart deploy/app
kubectl scale deploy/app --replicas=5
kubectl port-forward svc/app 8080:80
kubectl top pod / kubectl top node
kubectl get events --sort-by=.lastTimestamp
kubectl config use-context staging
```

## Deployment manifest
```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: app }
spec:
  replicas: 3
  selector: { matchLabels: { app: app } }
  template:
    metadata: { labels: { app: app } }
    spec:
      containers:
        - name: app
          image: registry/app:1.0        # never :latest
          ports: [{ containerPort: 3000 }]
          resources:
            requests: { cpu: 100m, memory: 128Mi }   # scheduling + HPA baseline
            limits:   { cpu: 500m, memory: 256Mi }   # CPU throttles, memory OOMKills
          readinessProbe:                # gates TRAFFIC
            httpGet: { path: /ready, port: 3000 }
          livenessProbe:                 # gates RESTART — keep it dumb
            httpGet: { path: /healthz, port: 3000 }
            initialDelaySeconds: 10
          envFrom:
            - configMapRef: { name: app-config }
            - secretRef:    { name: app-secrets }
```

## Objects
| Object | Purpose |
|---|---|
| Pod | smallest unit; one or more containers sharing network/volumes |
| Deployment | stateless replicas + rolling updates |
| StatefulSet | stable identity and storage per replica |
| DaemonSet | one pod per node |
| Job / CronJob | run-to-completion / scheduled |
| Service | stable virtual IP + load balancing |
| Ingress | HTTP routing and TLS termination |
| ConfigMap / Secret | config / credentials (**Secrets are base64, not encrypted**) |
| HPA | scales replicas against the **request**, not the limit |
| PVC | persistent storage claim |

## Probes — the classic outage
A **liveness** probe that checks the database restarts every pod when the database blips, taking the whole fleet down. Liveness answers "is this process wedged"; **readiness** answers "can it serve right now" and is where dependency checks belong.

## Requests vs limits
- CPU over the limit → **throttled** (slow).
- Memory over the limit → **OOMKilled** (`exit 137`).
- No requests set → poor scheduling and the HPA has no baseline.

## Debugging a pod
```
Pending          → unschedulable: resources, taints, no node fits
ImagePullBackOff → wrong tag or missing registry credentials
CrashLoopBackOff → starts and exits: `kubectl logs --previous`
OOMKilled (137)  → raise the memory limit or fix the leak
Running/not ready→ readiness probe failing
```

## Gotchas
- `depends_on` in Compose waits for **start**, not readiness — add a healthcheck.
- Secrets are base64-encoded, not encrypted: enable encryption at rest and RBAC.
- A rolling update needs `terminationGracePeriodSeconds` plus `SIGTERM` handling, or you drop in-flight requests.
- `kubectl apply` of an unchanged manifest does nothing — use `rollout restart` to force a cycle.
- Frontend builds bake `VITE_*`/`REACT_APP_*` at **build** time, so runtime env vars won't change them.
