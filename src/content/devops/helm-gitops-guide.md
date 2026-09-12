# Helm & GitOps — Interview Guide

Raw Kubernetes manifests don't survive contact with more than one environment. **Helm** packages and templates them; **GitOps** makes a git repository the single source of truth for what is running, with a controller continuously reconciling the cluster toward it.

Builds on the [Docker & Kubernetes guide](/backend/docker-kubernetes). Compare with [Terraform](/devops/terraform), which is provisioning rather than continuous reconciliation.

## Table of Contents

1. [The Problem](#1-the-problem)
2. [Helm Concepts](#2-helm-concepts)
3. [Chart Structure](#3-chart-structure)
4. [Templating](#4-templating)
5. [Values and Overrides](#5-values-and-overrides)
6. [Dependencies and Subcharts](#6-dependencies-and-subcharts)
7. [Release Lifecycle](#7-release-lifecycle)
8. [Hooks and Tests](#8-hooks-and-tests)
9. [Helm vs Kustomize](#9-helm-vs-kustomize)
10. [GitOps Principles](#10-gitops-principles)
11. [Argo CD](#11-argo-cd)
12. [Flux](#12-flux)
13. [Structuring Repositories](#13-structuring-repositories)
14. [Secrets in GitOps](#14-secrets-in-gitops)
15. [Environment Promotion](#15-environment-promotion)
16. [Progressive Delivery](#16-progressive-delivery)
17. [Interview Questions & Answers](#17-interview-questions-answers)
18. [Tricky Questions](#18-tricky-questions)
19. [Cheat Sheet](#19-cheat-sheet)
20. [References](#20-references)

---

## 1. The Problem

A single service needs a Deployment, Service, Ingress, ConfigMap, HPA and ServiceAccount. Multiply by three environments and twenty services and you have 360 YAML files differing only in replica counts, image tags and hostnames. Copy-paste diverges within a sprint.

Two distinct problems fall out:

1. **Packaging and parameterisation** — one definition, many configurations. That's **Helm** (or Kustomize).
2. **Delivery and drift** — how does what's in git become what's running, and stay that way? That's **GitOps**.

They are complementary, not alternatives: the common production shape is **Helm charts stored in git, applied by Argo CD**.

---

## 2. Helm Concepts

| Term | Meaning |
|---|---|
| **Chart** | a package of templates + default values + metadata |
| **Values** | the parameters that fill the templates |
| **Release** | an *installed instance* of a chart in a cluster, with a name |
| **Repository** | where charts are hosted (HTTP index, or an **OCI registry**) |
| **Revision** | a numbered version of a release, enabling rollback |

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm search repo postgres
helm install my-db bitnami/postgresql -f values-prod.yaml
helm upgrade my-db bitnami/postgresql --set replicaCount=3
helm list -A
helm history my-db
helm rollback my-db 2
helm uninstall my-db
```

Helm 3 removed **Tiller** (the in-cluster server component Helm 2 used, which held broad permissions and was a genuine security problem). Helm 3 is a **client-side** tool: it renders templates locally and talks to the API server with **your** credentials, so RBAC applies to you rather than to a privileged daemon. Release state is stored as Secrets in the release's namespace.

Charts can be hosted in **OCI registries** (`oci://registry/charts/app`), which means the same registry and auth as your container images.

---

## 3. Chart Structure

```
mychart/
  Chart.yaml            # name, version, appVersion, dependencies
  values.yaml           # DEFAULT values — document every key
  values.schema.json    # JSON Schema: validates values, fails fast
  templates/
    deployment.yaml
    service.yaml
    ingress.yaml
    _helpers.tpl        # named templates (underscore = not rendered as a manifest)
    NOTES.txt           # printed after install
    tests/
      test-connection.yaml
  charts/               # vendored dependencies
  .helmignore
```

`Chart.yaml` carries two versions that are routinely confused:

```yaml
apiVersion: v2
name: mychart
version: 1.4.2          # the CHART's version — bump on any chart change
appVersion: "2.7.0"     # the APPLICATION version it deploys (informational)
```

Changing the container image means bumping **`appVersion`**; changing the templates means bumping **`version`**. Only `version` affects Helm's dependency resolution.

**`values.schema.json` is underused and worth mentioning** — it validates supplied values against a schema at install time, so a typo like `replicaCount: "three"` fails immediately instead of producing a broken Deployment.

---

## 4. Templating

Helm uses Go templates plus the Sprig function library.

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mychart.fullname" . }}
  labels: {{- include "mychart.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          {{- with .Values.resources }}
          resources: {{- toYaml . | nindent 12 }}
          {{- end }}
          env:
            {{- range $k, $v := .Values.env }}
            - name: {{ $k }}
              value: {{ $v | quote }}
            {{- end }}
          {{- if .Values.probes.enabled }}
          readinessProbe:
            httpGet: { path: /ready, port: http }
          {{- end }}
```

Built-in objects: `.Values`, `.Chart`, `.Release` (`.Name`, `.Namespace`, `.IsUpgrade`, `.Revision`), `.Capabilities` (API versions available), `.Files`.

The whitespace rules are where everyone loses time:

- **`{{-`** trims preceding whitespace including the newline; **`-}}`** trims following.
- **`nindent N`** adds a newline then indents by N — almost always what you want when injecting a YAML block.
- `indent N` indents without the leading newline.
- **`toYaml`** serialises a values object; combine as `{{- toYaml . | nindent 4 }}`.
- **`| quote`** on anything that could be read as a number or boolean — an unquoted `"true"` or a version like `1.10` will be coerced and surprise you.

Named templates live in `_helpers.tpl`:

```yaml
{{- define "mychart.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end }}
```

`trunc 63` is not decoration — Kubernetes names are limited to 63 characters and a long release name silently produces an invalid manifest.

**Debug without installing:**

```bash
helm template mychart -f values-prod.yaml       # render locally, print YAML
helm install --dry-run --debug mychart          # render + server-side validate
helm lint mychart
helm diff upgrade my-release mychart            # plugin: show what would change
```

`helm template` is client-side only; `--dry-run` also validates against the API server, so it catches a bad `apiVersion` or a schema violation that `template` won't.

---

## 5. Values and Overrides

Precedence, **lowest to highest**:

```
chart's values.yaml
  → a parent chart's values for a subchart
    → -f values-prod.yaml   (later -f files win)
      → --set / --set-string / --set-file   (highest)
```

```bash
helm upgrade app ./mychart \
  -f values-common.yaml -f values-prod.yaml \
  --set image.tag=$GIT_SHA
```

The pattern that works: a **common** values file plus a **per-environment** file, with only the image tag supplied on the command line by CI. Putting environment differences in `--set` flags scattered through a pipeline makes the deployed configuration unreproducible.

Two `--set` gotchas: commas and dots must be escaped (`--set 'nodeSelector.kubernetes\.io/os=linux'`), and `--set` interprets values, so use **`--set-string`** for anything that must stay a string — a numeric-looking tag like `1.10` otherwise becomes `1.1`.

**`--reuse-values` vs `--reset-values`** trips people badly. `--reuse-values` merges into the previously supplied values, so a value you *removed* from your file persists invisibly; `--reset-values` starts from the chart defaults. Neither is a safe default for CI — supply the **full** set of values every time so a deploy is a function of the repository state alone.

---

## 6. Dependencies and Subcharts

```yaml
# Chart.yaml
dependencies:
  - name: postgresql
    version: "15.5.x"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled       # toggle it off in prod
    alias: primary-db
```

```bash
helm dependency update      # resolves into charts/ and writes Chart.lock
helm dependency build       # installs exactly what Chart.lock pins
```

**Commit `Chart.lock`** and use `dependency build` in CI, or a subchart's patch release can change your deployment without any change in your repo.

Configure a subchart under its name, and use `global` for values that must reach every chart:

```yaml
postgresql:
  auth: { database: app }
global:
  imageRegistry: registry.example.com
```

`condition` is the mechanism for "bundled database in dev, managed RDS in production". The caution worth voicing: **an umbrella chart bundling every service into one release couples their lifecycles** — one bad template fails the whole release, and rollback reverts everything. Separate releases per service, orchestrated by GitOps, scale better.

---

## 7. Release Lifecycle

```bash
helm upgrade --install app ./chart \        # idempotent: install or upgrade
  --namespace prod --create-namespace \
  --atomic --timeout 5m \                   # roll back automatically on failure
  --wait                                    # wait for resources to be ready
helm history app
helm rollback app 3
helm get values app / manifest app / notes app
```

`--atomic` is the flag to know: it implies `--wait`, and if resources don't become ready within the timeout it **automatically rolls back** to the previous revision, so a failed deploy doesn't leave a half-applied release. In CI, `upgrade --install --atomic --timeout` is the standard incantation.

Release state lives in Secrets (`sh.helm.release.v1.<name>.v<revision>`) in the release namespace, which is how `history` and `rollback` work — and why deleting those Secrets by hand orphans the release.

Two failure modes to recognise. A release stuck in **`pending-upgrade`** (an interrupted `helm upgrade` — a killed CI job) blocks further upgrades until you roll back or delete the pending revision. And **Helm does not manage resources it didn't create**, so an object added by hand is invisible to it; conversely a template you delete from the chart *is* removed on upgrade, which is the usual cause of "our ConfigMap disappeared".

Note **CRDs are special**: Helm installs those in `crds/` but does **not** upgrade or delete them, deliberately, because deleting a CRD deletes every custom resource of that kind. CRD upgrades are a manual step.

---

## 8. Hooks and Tests

```yaml
metadata:
  annotations:
    "helm.sh/hook": pre-upgrade
    "helm.sh/hook-weight": "-5"                  # lower runs first
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
```

Hook points: `pre-install`, `post-install`, `pre-upgrade`, `post-upgrade`, `pre-delete`, `post-delete`, `pre-rollback`, `post-rollback`, `test`.

The canonical use is a **database migration Job** as `pre-upgrade`, so schema changes land before the new code. Three caveats: a failed hook fails the release; **hook resources are not tracked as part of the release**, so they aren't rolled back by `helm rollback`; and a hook Job left behind by a missing `hook-delete-policy` causes the next upgrade to fail on an immutable-field conflict.

```bash
helm test app        # runs templates/tests/* as Jobs, asserting the release works
```

`helm test` is genuinely useful in a pipeline: a small Job that curls the service's health endpoint from inside the cluster verifies the release end-to-end rather than just that YAML applied.

---

## 9. Helm vs Kustomize

| Aspect | Helm | Kustomize |
|---|---|---|
| Mechanism | **templating** (Go templates) | **overlays** (strategic merge patches) |
| Distribution | packaged, versioned charts, repositories | plain directories |
| Third-party software | **the standard** — everyone ships a chart | you patch someone's manifests |
| Release tracking | revisions, `rollback`, `history` | none (it just emits YAML) |
| Readability | templates get unreadable at scale | base YAML stays valid YAML |
| Built into kubectl | no | **yes** (`kubectl apply -k`) |

Helm's weakness is that templated YAML is neither valid YAML nor a real programming language, so complex charts become unreadable string manipulation. Kustomize's weakness is that patching is awkward for large structural differences, and it has no packaging or release semantics.

The pragmatic answer, and the common real-world one: **Helm for third-party software** (you're going to install the vendor's chart regardless) and **Kustomize or a thin chart for your own services**, whose manifests you control and which differ only slightly per environment. Argo CD supports both natively, and can even run Kustomize over Helm output.

---

## 10. GitOps Principles

Four principles (OpenGitOps):

1. **Declarative** — the whole desired state is expressed declaratively.
2. **Versioned and immutable** — that state lives in git, so it's auditable and revertible.
3. **Pulled automatically** — agents pull the desired state; nobody pushes from CI.
4. **Continuously reconciled** — a controller constantly corrects drift.

What that buys you over `kubectl apply` from CI:

- **Git is the audit log.** Who changed production and when is `git log`, with review attached.
- **Rollback is `git revert`.**
- **Drift is corrected automatically.** A hand-edited replica count is reverted, so the cluster cannot silently diverge from the repo.
- **CI needs no cluster credentials.** This is the security argument and it's the strongest one: in push-based CD your pipeline holds admin credentials for production, so compromising CI compromises the cluster. In GitOps the agent runs *inside* the cluster and pulls, so no external system holds those credentials.

The trade-offs to state honestly: **you now debug a controller** as well as your app; a bad commit propagates automatically, so branch protection and review become load-bearing; **secrets need a solution** because git is world-readable within your org (§14); and the feedback loop is longer than a direct apply, which developers notice.

---

## 11. Argo CD

Argo CD is a Kubernetes controller that reconciles a cluster toward manifests in git, with a UI that shows the diff and resource health.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: api-prod
  namespace: argocd
spec:
  project: production
  source:
    repoURL: https://github.com/org/deploy.git
    targetRevision: main                 # branch, tag, or commit SHA
    path: envs/prod/api
    helm:
      valueFiles: [values.yaml, values-prod.yaml]
  destination:
    server: https://kubernetes.default.svc
    namespace: api
  syncPolicy:
    automated:
      prune: true                        # delete resources removed from git
      selfHeal: true                     # revert manual cluster changes
    syncOptions:
      - CreateNamespace=true
      - ServerSideApply=true
    retry:
      limit: 3
      backoff: { duration: 5s, factor: 2 }
```

Concepts:

- **Application** — one deployable unit mapping a git path to a cluster namespace.
- **Sync status** — `Synced` / `OutOfSync` (cluster differs from git).
- **Health status** — `Healthy` / `Progressing` / `Degraded`, computed per resource kind with custom Lua for CRDs.
- **`prune`** deletes resources no longer in git. Off by default because it's dangerous; without it, deleted manifests linger forever.
- **`selfHeal`** reverts manual changes — the mechanism that makes drift impossible.
- **Sync waves** (`argocd.argoproj.io/sync-wave`) order resources; **PreSync/Sync/PostSync hooks** run Jobs such as migrations.
- **AppProjects** scope which repos, clusters and namespaces an Application may touch — the multi-tenancy boundary.

`selfHeal: true` has an important consequence: **`kubectl edit` in production stops working**, by design. That surprises people mid-incident, so the break-glass procedure (disable auto-sync, or annotate the resource) needs to be documented *before* you need it.

---

## 12. Flux

Flux v2 is the other CNCF-graduated option, built as a set of composable controllers (source, kustomize, helm, notification, image automation) rather than one application with a UI.

| Aspect | Argo CD | Flux |
|---|---|---|
| Interface | **rich web UI**, strong visualisation | CLI + CRDs (UI via Weave GitOps) |
| Model | `Application` CRD | composable controllers |
| Multi-tenancy | AppProjects | native namespace/RBAC-based |
| Image automation | needs Argo Image Updater | **built in** |
| Sweet spot | teams wanting visibility and self-service | GitOps-native, fully declarative setups |

Argo CD's UI is the practical differentiator — during an incident, seeing exactly which resources are OutOfSync and why is worth a lot, and it's what most teams choose for developer self-service. Flux is more Kubernetes-idiomatic and composes better if you want everything expressed as CRDs. Both are good; the choice is mostly about whether you want a UI.

---

## 13. Structuring Repositories

**Separate the application repo from the deployment repo.** Application code and its CI live in one; rendered manifests or charts plus environment values live in another. Reasons: a config change shouldn't rebuild the image, deployment history stays legible, and the deploy repo's access control differs from the code's.

```
deploy-repo/
  charts/api/                  # your chart
  envs/
    dev/api/{values.yaml,application.yaml}
    staging/api/...
    prod/api/...
  bootstrap/                   # the app-of-apps
```

**Environments as directories, not branches.** Branch-per-environment sounds natural and fails in practice: changes must be merged between branches, they drift, and a cherry-pick becomes the promotion mechanism. Directories make every environment's full state visible in one commit and diffable side by side — the same conclusion as [Terraform's](/devops/terraform) directory-per-environment.

**App-of-apps** bootstraps everything from one Application pointing at a directory of Applications, so a new service is a file rather than a cluster operation. **ApplicationSets** generalise it further, generating Applications from a list, a git directory glob, or a cluster list — which is how you manage the same app across twenty clusters without twenty hand-written files.

---

## 14. Secrets in GitOps

Git is the source of truth, and plaintext secrets cannot go in git. Four approaches:

| Approach | How | Trade-off |
|---|---|---|
| **Sealed Secrets** | encrypt with a cluster-held public key; only the controller can decrypt | simple; secrets are cluster-bound, awkward to rotate/migrate |
| **SOPS** (+ age/KMS) | encrypt values in-place in the YAML | **diffable** (keys visible, values encrypted); key management is yours |
| **External Secrets Operator** | git holds a *reference*; the operator fetches from Vault/AWS/GCP | **no secret in git at all**; needs an external store |
| Vault Agent / CSI driver | injected at pod start | strong; more moving parts |

**External Secrets Operator is the strongest default** where you already run a secret manager, because git contains only a pointer:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
spec:
  secretStoreRef: { name: aws-sm, kind: ClusterSecretStore }
  target: { name: api-secrets }
  data:
    - secretKey: DB_PASSWORD
      remoteRef: { key: prod/api, property: db_password }
```

That keeps rotation entirely in the secret manager — rotate there and the operator refreshes the Kubernetes Secret without a commit. **SOPS** is the better fit when you have no external store and want everything in git, and its diffability is a genuine advantage over Sealed Secrets, where a re-encrypted value changes wholesale and review tells you nothing.

Whichever you pick: Kubernetes Secrets are **base64, not encrypted**, so enable **encryption at rest** on etcd and lock down RBAC regardless.

---

## 15. Environment Promotion

The promotion question is the one interviews reach for, because it's where GitOps gets organisational.

```
CI: build image → tag with the immutable GIT SHA → push to registry
                ↓
dev:      auto-update the tag on every main commit
staging:  auto-update after dev tests pass
prod:     a PULL REQUEST changing the tag, reviewed and merged
```

Principles that make it work:

- **Immutable tags.** Deploy `api:7f3a9c1`, never `:latest`. A mutable tag makes "what is running" unanswerable and rollback meaningless.
- **Promotion is a commit** that changes an image tag in the target environment's values — so promotion is reviewable, auditable, and revertible with `git revert`.
- **Automate low environments, gate production** with a pull request and required reviewers. That gives you a human checkpoint without slowing the inner loop.
- **The image is built once** and promoted unchanged. Rebuilding per environment means you tested a different artefact than you shipped.
- Tools: **Argo CD Image Updater** or Flux's image automation can open the PR for you, so promotion is reviewing a bot's diff.

Rollback is then `git revert` of the promotion commit, and the controller reconciles — which is genuinely faster and more auditable than a `helm rollback` nobody recorded.

---

## 16. Progressive Delivery

Native Kubernetes rolling updates only check readiness probes; they don't know whether the new version is *behaving*. Progressive delivery adds metric-driven analysis.

**Argo Rollouts** (or Flagger) replaces the Deployment with a `Rollout`:

```yaml
strategy:
  canary:
    steps:
      - setWeight: 5
      - pause: { duration: 5m }
      - analysis:
          templates: [{ templateName: success-rate }]
      - setWeight: 25
      - pause: { duration: 10m }
      - setWeight: 100
```

```yaml
# AnalysisTemplate — query Prometheus and abort if the SLI degrades
metrics:
  - name: success-rate
    interval: 1m
    successCondition: result[0] >= 0.99
    failureLimit: 2
    provider:
      prometheus:
        address: http://prometheus:9090
        query: |
          sum(rate(http_requests_total{app="api",status!~"5.."}[2m]))
            / sum(rate(http_requests_total{app="api"}[2m]))
```

The key idea: the rollout **queries your metrics** ([Observability guide](/devops/observability-sre)) and **automatically aborts and rolls back** when the error rate or latency degrades — so a bad release is reverted in minutes without a human noticing. **Blue/green** is the alternative shape when you need instant, all-at-once cutover with a tested-but-dark environment.

This closes the loop between the three guides: Helm packages, GitOps delivers, and observability decides whether the delivery was safe.

---

## 17. Interview Questions & Answers

**Q1: What problem does Helm solve, and what are charts, values and releases?**

Raw manifests don't survive multiple environments — a single service needs six or seven objects, and across three environments and twenty services you get hundreds of near-identical files that diverge by copy-paste. Helm solves **packaging and parameterisation**: a **chart** is a package of templates plus default values and metadata, **values** are the parameters that fill those templates, and a **release** is an installed instance of a chart in a cluster with a name and a numbered revision history — which is what makes `helm history` and `helm rollback` possible. Charts are distributed through repositories or, increasingly, **OCI registries**, so the same registry and auth as your images. Worth adding that Helm 3 removed **Tiller**, the privileged in-cluster component from Helm 2; Helm 3 renders templates client-side and talks to the API server with **your** credentials, so RBAC applies to the user rather than to a broadly-permissioned daemon.

**Q2: Compare Helm and Kustomize.**

Helm **templates**: Go templates with variable substitution, packaged as versioned charts, with release tracking and rollback. Kustomize uses **overlays** — a base of plain, valid YAML plus strategic-merge patches per environment — and it's built into `kubectl` via `apply -k`. Helm's weakness is that templated YAML is neither valid YAML nor a real language, so complex charts degenerate into unreadable string manipulation with `nindent` and whitespace-trim markers everywhere. Kustomize's weakness is that patching is clumsy for large structural differences, and it has **no packaging or release semantics** — it just emits YAML, so there's no `rollback` or `history`. The pragmatic answer is to use both: **Helm for third-party software**, because every vendor ships a chart and you're not going to re-derive it, and **Kustomize or a thin in-house chart for your own services**, whose manifests you control and which differ only slightly per environment. Argo CD supports both natively and can run Kustomize over Helm output.

**Q3: What is GitOps and what does it buy you over `kubectl apply` from CI?**

GitOps means the desired state is **declarative**, **versioned in git**, **pulled** by an in-cluster agent, and **continuously reconciled**. Four concrete benefits over push-based CD. **Git is the audit log** — who changed production and when is `git log`, with code review attached. **Rollback is `git revert`.** **Drift is corrected automatically**, so a hand-edited replica count gets reverted and the cluster cannot silently diverge from the repository. And the strongest one: **CI needs no cluster credentials**. In push-based delivery your pipeline holds admin credentials for production, so compromising CI compromises the cluster; with GitOps the agent runs inside the cluster and pulls, so nothing external holds those keys. The honest trade-offs are that you now operate a controller as well as your app, a bad commit propagates automatically so branch protection becomes load-bearing, **secrets need a dedicated solution**, and the feedback loop is longer than a direct apply.

**Q4: How do you handle secrets in a GitOps repository?**

You never commit plaintext, and there are four approaches. **Sealed Secrets** encrypts with a public key whose private half lives in the cluster, so only the controller can decrypt — simple, but secrets become cluster-bound and awkward to rotate or migrate. **SOPS** with age or KMS encrypts values in place, which keeps the YAML **diffable** — keys visible, values encrypted — so review is meaningful; key management is yours. **External Secrets Operator** puts only a *reference* in git and has an operator fetch the real value from Vault, AWS Secrets Manager or GCP, which means **no secret is in git at all** and rotation happens entirely in the secret manager without a commit. Vault's agent injector or the CSI driver inject at pod start. I'd default to **External Secrets** where a secret manager already exists, and **SOPS** where everything must live in git — noting SOPS's diffability beats Sealed Secrets, where a re-encrypted value changes wholesale and the diff tells you nothing. Regardless: Kubernetes Secrets are **base64, not encrypted**, so enable etcd encryption at rest and tighten RBAC.

**Q5: How do you promote a release from staging to production with GitOps?**

CI builds the image once and tags it with the **immutable git SHA** — never `:latest`, because a mutable tag makes "what is running" unanswerable and rollback meaningless. Dev auto-updates its tag on every commit to main, staging updates after dev's tests pass, and production is promoted by a **pull request that changes the image tag** in the prod environment's values, reviewed and merged. That makes promotion a reviewable, auditable, revertible commit, and gives a human gate on production without slowing the inner loop; Argo CD Image Updater or Flux image automation can open that PR so promotion is reviewing a bot's diff. The critical discipline is that the **same artefact** is promoted unchanged — rebuilding per environment means you tested something other than what you shipped. Rollback is then `git revert` of the promotion commit and the controller reconciles, which is both faster and better recorded than an ad-hoc `helm rollback`. And environments should be **directories, not branches**, so each environment's full state is visible in one commit.

**Q6: What do `prune` and `selfHeal` do in Argo CD, and why are they off by default?**

**`prune`** deletes cluster resources that no longer exist in git; **`selfHeal`** reverts manual changes made in the cluster so it converges back to the repository. Together they make git genuinely authoritative. They're off by default because both are destructive in the wrong circumstances: with `prune`, a mistaken commit removing a manifest — or a bad path in the Application spec so Argo sees *no* resources — deletes live infrastructure; with `selfHeal`, an emergency `kubectl edit` is silently reverted, possibly mid-incident. The consequence worth stating is that `selfHeal: true` means **`kubectl edit` in production stops working by design**, which surprises people at the worst moment, so the break-glass procedure — disable auto-sync, or annotate the resource — must be documented before you need it. In practice you enable both in production because uncorrected drift is worse, and you pair them with branch protection, `AppProject` restrictions on what an Application may touch, and sync windows.

**Q7: What's the difference between `version` and `appVersion` in `Chart.yaml`?**

**`version`** is the chart's own version and follows semver; **`appVersion`** is the version of the application the chart deploys and is informational. So changing the templates — adding a probe, fixing an indentation bug — bumps **`version`**; shipping a new container image bumps **`appVersion`**. Only `version` participates in Helm's dependency resolution, so a subchart constraint like `15.5.x` matches on `version`, not `appVersion`. It matters practically because `appVersion` is commonly used as the default image tag (`.Values.image.tag | default .Chart.AppVersion`), which means forgetting to bump it silently deploys the old image, and because a chart change with no `version` bump can be served from a cache or resolved to the wrong artefact. While on `Chart.yaml`: **commit `Chart.lock`** and use `helm dependency build` in CI, or a subchart's patch release changes your deployment with no change in your repo.

**Q8: How does progressive delivery differ from a Kubernetes rolling update?**

A rolling update only knows about **readiness probes** — it replaces pods gradually and stops if new pods fail to become ready. It has no idea whether the new version is *behaving*: a release that starts fine and returns 500s, or triples latency, passes readiness and rolls out completely. **Progressive delivery** with Argo Rollouts or Flagger adds metric-driven analysis: you shift a small percentage of traffic, pause, **query Prometheus** for your SLI, and continue only if the success rate and latency hold — otherwise the rollout **aborts and rolls back automatically**, typically within minutes and without a human involved. You express it as canary steps with weights and `AnalysisTemplate`s, or as blue/green when you need an instant all-at-once cutover to a tested-but-dark environment. The thing to emphasise is that this is where deployment and observability meet: the value depends entirely on having an SLI that actually reflects user experience, which is why SLOs and progressive delivery are usually adopted together.

---

## 18. Tricky Questions

**Q1: You remove a ConfigMap template from your chart and run `helm upgrade`. The ConfigMap disappears from the cluster and the app breaks. Separately, a Secret someone created with `kubectl` survives every upgrade. Explain both.**

**Helm manages exactly the resources it created, tracked in the release's state — nothing more, nothing less.** Removing a template means the object is absent from the newly rendered manifest, so on upgrade Helm computes the diff against the previous revision, sees the ConfigMap as removed, and deletes it. That's correct behaviour and the reason "we deleted a template to tidy up" is a recognised outage cause. The hand-created Secret is the mirror image: it was never in any release manifest, so Helm has no record of it and neither reconciles nor removes it — it's invisible to `helm get manifest` and will not be recreated if someone deletes it, which is exactly the kind of undocumented dependency that breaks a cluster rebuild. The lessons: never mix imperative `kubectl create` with a Helm-managed release, use `helm diff upgrade` before applying so removals are visible, and know that **CRDs are the deliberate exception** — Helm installs `crds/` but never upgrades or deletes them, because deleting a CRD deletes every custom resource of that kind.

**Q2: A `helm upgrade` was cancelled when the CI job timed out. Now every subsequent upgrade fails and the release shows `pending-upgrade`. Why?**

**The release is stuck in a transitional state because the Helm client was killed before it could finalise the revision.** Helm stores release state as Secrets in the namespace, and an interrupted `upgrade` leaves the newest revision marked `pending-upgrade` with no client coming back to complete it. Helm refuses to start another operation on a release it believes is mid-flight, so every later upgrade fails with "another operation is in progress" — and no amount of retrying clears it. Recovery is `helm rollback <release> <last-good-revision>`, which resets the state, or deleting the pending release Secret as a last resort. Prevention is the real answer: **`--atomic --timeout`** so a failed upgrade rolls itself back rather than hanging, a CI timeout comfortably longer than the Helm timeout so Helm finishes first, and `--wait` so success actually means ready. This is also an argument for GitOps: a controller reconciling continuously has no interruptible client-side session to strand.

**Q3: Your Argo CD Application shows `Synced` and `Healthy`, but the running pods are clearly the old version. How?**

**Because `Synced` compares the cluster to git, and the manifest in git hasn't changed** — the most likely cause is a **mutable image tag**. If the Deployment says `api:latest` (or `:main`), the manifest is byte-identical before and after your build, so Argo has nothing to sync and correctly reports Synced; meanwhile the pods are running whatever `latest` pointed to when they were last created, and with `imagePullPolicy: IfNotPresent` a node may not even pull the new image. That's precisely why GitOps requires **immutable tags** — a git SHA — so a new build produces a new manifest and reconciliation is meaningful. Other candidates: CI pushed the image but never committed the tag change, so the deploy repo is genuinely unchanged; the Application's `targetRevision` is pinned to a tag or old SHA rather than `main`; or the path in the Application points somewhere other than where you edited. The tell is that `Synced` is an assertion about git-versus-cluster, never about "is this the newest build".

**Q4: A team enables `prune: true` and `selfHeal: true`. During an incident an engineer scales a Deployment up with `kubectl scale` and it drops back to 3 replicas within seconds. Then someone fixes the Application path typo and half the namespace is deleted. Explain both.**

**`selfHeal` reverted the manual scale, and `prune` deleted everything Argo no longer saw in git.** `selfHeal` exists to make drift impossible: it continuously reconciles, so `kubectl scale` is undone almost immediately — correct by design, and genuinely dangerous mid-incident if nobody knows the break-glass procedure, which is to disable auto-sync on the Application (or annotate the resource) *before* making manual changes. The second failure is worse and is the standard argument against enabling `prune` casually: while the path was wrong, Argo rendered **no resources** from that source, concluded that every live object tracked by the Application was absent from git, and pruned them. A path typo therefore becomes a deletion event. Mitigations: `prune: false` until the Application is proven, `PrunePropagationPolicy` and `prune-last`, `ignoreDifferences` for fields other controllers own (like HPA-managed replicas), sync windows, and restricting blast radius with `AppProject` allow-lists on namespaces and kinds.

**Q5: Your chart renders correctly with `helm template` but `helm install` fails with a validation error. And an image tag of `1.10` deploys as `1.1`. What's happening in each case?**

**`helm template` renders client-side only, whereas `install`/`--dry-run` also validates against the API server** — so anything requiring server knowledge slips through the first and fails the second: an `apiVersion` that doesn't exist in that cluster version, a field rejected by a CRD's OpenAPI schema, an admission webhook or policy engine (OPA/Kyverno) refusing the object, or a `.Capabilities` check that resolves differently against a real server. The fix is to use **`helm install --dry-run --debug`** in CI rather than `template` when you want real validation. The second problem is a **`--set` type coercion**: `--set image.tag=1.10` is parsed as a number, and `1.10` as a float is `1.1`, which then renders as a nonexistent tag. Use **`--set-string image.tag=1.10`**, or quote in values with `{{ .Values.image.tag | quote }}`. The same class of bug hits anything numeric-looking or boolean-looking in YAML — version strings, `"true"`, `"on"`, and leading-zero values — which is why `| quote` on template output is a habit worth having.

---

## 19. Cheat Sheet

**Helm concepts**

1. **Chart** = package, **values** = parameters, **release** = installed instance with revisions.
2. Helm 3 removed **Tiller** — it's client-side and uses **your** RBAC.
3. Release state is Secrets in the namespace (`sh.helm.release.v1.*`).
4. Charts can live in **OCI registries**.
5. **`version`** = the chart; **`appVersion`** = the app. Only `version` affects dependency resolution.

**Chart layout**

6. `Chart.yaml`, `values.yaml`, `templates/`, `_helpers.tpl`, `crds/`, `NOTES.txt`.
7. `values.schema.json` validates values and **fails fast** — underused.
8. **Commit `Chart.lock`**; use `helm dependency build` in CI.

**Templating**

9. `{{-` / `-}}` trim whitespace; **`nindent N`** for injected YAML blocks.
10. `toYaml . | nindent 4` is the idiom for a values object.
11. **`| quote`** anything numeric- or boolean-looking.
12. `trunc 63` in name helpers — Kubernetes name limit.
13. `.Release.IsUpgrade` / `.Capabilities` for conditional rendering.

**Values**

14. Precedence: chart defaults → parent values → `-f` (later wins) → **`--set`**.
15. **`--set-string`** for version-like values — `--set tag=1.10` becomes `1.1`.
16. `--reuse-values` silently keeps removed values; supply the **full** set in CI.
17. Common + per-environment values files; only the image tag from CI.

**Lifecycle**

18. `helm upgrade --install --atomic --timeout 5m` is the CI standard.
19. **`--atomic`** implies `--wait` and auto-rolls back on failure.
20. `helm history` / `helm rollback N`.
21. **`pending-upgrade`** = interrupted client; fix with `rollback`.
22. Deleting a template **deletes the resource**; hand-created objects are invisible to Helm.
23. **CRDs in `crds/` are never upgraded or deleted** by Helm.
24. Hooks: `pre-upgrade` migration Jobs; hook resources are **not** rolled back.
25. `helm diff upgrade` before applying; `helm test` after.

**Helm vs Kustomize**

26. Helm = templating + packaging + releases. Kustomize = overlays, in `kubectl`.
27. **Helm for third-party, Kustomize/thin chart for your own services.**

**GitOps**

28. Declarative · versioned in git · **pulled** · continuously reconciled.
29. Rollback = `git revert`. Audit log = `git log`.
30. **CI holds no cluster credentials** — the strongest argument.
31. Costs: a controller to operate, secrets need a solution, slower feedback.

**Argo CD**

32. `Application` maps a git path → a cluster namespace.
33. **`prune`** deletes what's gone from git — a path typo becomes a deletion event.
34. **`selfHeal`** reverts manual changes — `kubectl edit` stops working by design.
35. Document break-glass **before** you need it.
36. Sync waves order resources; PreSync/PostSync hooks for migrations.
37. **AppProjects** are the multi-tenancy boundary.
38. `ignoreDifferences` for fields other controllers own (HPA replicas).
39. `Synced` compares **git to cluster** — it never means "newest build".

**Structure & promotion**

40. Separate **app repo** from **deploy repo**.
41. **Environments as directories, not branches.**
42. App-of-apps to bootstrap; **ApplicationSets** for many clusters.
43. **Immutable image tags (git SHA)** — never `:latest`.
44. Build once, promote the **same artefact**.
45. Auto-sync low environments, **gate prod with a PR**.

**Secrets**

46. Sealed Secrets (cluster-bound) · **SOPS** (diffable) · **External Secrets** (nothing in git) · Vault injection.
47. Kubernetes Secrets are **base64, not encrypted** — enable etcd encryption at rest.

**Progressive delivery**

48. Rolling updates only check **readiness**, not behaviour.
49. Argo Rollouts/Flagger **query Prometheus** and auto-abort on SLI regression.
50. Its value depends on an SLI that reflects real user experience.

---

## 20. References

- [Helm documentation](https://helm.sh/docs/) — [chart best practices](https://helm.sh/docs/chart_best_practices/), [template guide](https://helm.sh/docs/chart_template_guide/), [chart hooks](https://helm.sh/docs/topics/charts_hooks/)
- [Kustomize](https://kubectl.docs.kubernetes.io/references/kustomize/) — overlays and patches.
- [OpenGitOps principles](https://opengitops.dev/) — the four principles.
- [Argo CD documentation](https://argo-cd.readthedocs.io/) — [Application spec](https://argo-cd.readthedocs.io/en/stable/operator-manual/application.yaml), [sync options](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/), [AppProjects](https://argo-cd.readthedocs.io/en/stable/operator-manual/project-specification/)
- [ApplicationSets](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/) and [Argo CD Image Updater](https://argocd-image-updater.readthedocs.io/)
- [Flux documentation](https://fluxcd.io/flux/) — controllers and image automation.
- [Argo Rollouts](https://argo-rollouts.readthedocs.io/) and [Flagger](https://docs.flagger.app/)
- [External Secrets Operator](https://external-secrets.io/) · [SOPS](https://github.com/getsops/sops) · [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
