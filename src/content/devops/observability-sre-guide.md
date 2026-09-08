# Observability & SRE — Interview Guide

Monitoring tells you **whether** the system is broken. Observability lets you ask **why** without shipping new code. The distinction matters because it changes what you instrument: dashboards for known failure modes versus high-cardinality data you can slice arbitrarily when something novel happens.

Complements the [Microservices guide](/backend/microservices) (distributed tracing in context), [Docker & Kubernetes](/backend/docker-kubernetes) (probes and cluster health), and [AWS CloudWatch](/aws/cloudwatch).

## Table of Contents

1. [Monitoring vs Observability](#1-monitoring-vs-observability)
2. [Metrics and the Prometheus Model](#2-metrics-and-the-prometheus-model)
3. [PromQL](#3-promql)
4. [Scraping, Exporters and Service Discovery](#4-scraping-exporters-and-service-discovery)
5. [Recording Rules and Alertmanager](#5-recording-rules-and-alertmanager)
6. [Grafana and Dashboard Design](#6-grafana-and-dashboard-design)
7. [Logs](#7-logs)
8. [Traces and OpenTelemetry](#8-traces-and-opentelemetry)
9. [Cardinality and Cost](#9-cardinality-and-cost)
10. [SLIs, SLOs and Error Budgets](#10-slis-slos-and-error-budgets)
11. [What to Alert On](#11-what-to-alert-on)
12. [On-Call and Incident Response](#12-on-call-and-incident-response)
13. [Postmortems](#13-postmortems)
14. [Toil, Automation and Reliability Work](#14-toil-automation-and-reliability-work)
15. [The Tool Landscape](#15-the-tool-landscape)
16. [Interview Questions & Answers](#16-interview-questions-answers)
17. [Tricky Questions](#17-tricky-questions)
18. [Cheat Sheet](#18-cheat-sheet)
19. [References](#19-references)

---

## 1. Monitoring vs Observability

**Monitoring** is checking predefined signals against thresholds — you decided in advance what could go wrong. **Observability** is a property of a system: can you answer *new* questions about its behaviour from the data it already emits, without deploying a change?

The practical test: when a customer reports that checkout is slow **only for users on Android in Brazil paying with one particular provider**, can you answer it? A dashboard of averages cannot. Data with enough dimensions to filter on can.

The **three pillars** framing — metrics, logs, traces — is the standard answer, and worth also knowing its limitation: they're three storage shapes, not three purposes, and treating them as separate silos is why teams end up pivoting between four tools during an incident. What matters is being able to move from *a metric showing a spike* to *the traces in that window* to *the logs for those requests*, which is why **correlation IDs and exemplars** matter more than any individual pillar.

| | Metrics | Logs | Traces |
|---|---|---|---|
| Shape | numeric time series | discrete events | causal request trees |
| Cost | cheap, bounded by cardinality | expensive at volume | expensive, usually sampled |
| Answers | "is it broken, how much" | "what exactly happened" | "where did the time go" |
| Cardinality | **low** — labels are dangerous | high, fine | high, fine |

---

## 2. Metrics and the Prometheus Model

A Prometheus time series is identified by a **name plus a set of labels**:

```
http_requests_total{method="POST", route="/checkout", status="500"}  →  1 27  @timestamp
```

Every unique label combination is a **separate time series** — the fact that governs cost (§9).

**The four metric types:**

| Type | Behaviour | Use for |
|---|---|---|
| **Counter** | monotonically increasing, resets to 0 on restart | requests, errors, bytes |
| **Gauge** | goes up and down | queue depth, memory, temperature |
| **Histogram** | pre-defined buckets, exposes `_bucket`, `_sum`, `_count` | latency, sizes — **quantiles server-side** |
| **Summary** | client-computed quantiles | when you can't choose buckets — **not aggregatable** |

```
# HELP http_request_duration_seconds Request latency
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 240
http_request_duration_seconds_bucket{le="0.5"} 900
http_request_duration_seconds_bucket{le="+Inf"} 1000
http_request_duration_seconds_sum 187.4
http_request_duration_seconds_count 1000
```

**Histogram over summary, almost always.** A summary computes quantiles inside each instance, and **you cannot average percentiles** — the p99 of ten instances' p99s is a meaningless number. A histogram ships bucket counts, which *are* additive, so `histogram_quantile()` can compute a correct global percentile across every instance. The cost is choosing buckets up front; native (exponential) histograms in newer Prometheus remove that constraint.

**Counters, not gauges, for things that only increase** — a counter's reset is detectable, so `rate()` handles restarts correctly, whereas a gauge you increment yourself loses data silently on restart.

---

## 3. PromQL

```promql
# request rate per second, averaged over 5 minutes
rate(http_requests_total[5m])

# error ratio — the canonical SLI
sum(rate(http_requests_total{status=~"5.."}[5m]))
  / sum(rate(http_requests_total[5m]))

# p99 latency across all instances (requires a histogram)
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# top 5 routes by error rate
topk(5, sum(rate(http_requests_total{status=~"5.."}[5m])) by (route))

# memory headroom
1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)

# is anything down?
up{job="api"} == 0

# predict disk exhaustion in the next 4 hours
predict_linear(node_filesystem_avail_bytes[6h], 4*3600) < 0
```

The functions that matter and their traps:

- **`rate()`** is per-second, averaged over the window, and **handles counter resets**. Use it on counters only.
- **`irate()`** uses the last two samples — spiky, good for graphs, **bad for alerts** because it can miss a sustained problem between samples.
- **`increase()`** is `rate() × window`, for "how many in the last hour".
- The window must be **at least 4× the scrape interval**, or you get gaps and misleading zeros.
- **`sum by (le)` before `histogram_quantile`** — aggregating after computing the quantile is wrong.
- `sum()`, `avg()`, `max()` with `by`/`without` for aggregation; `offset` and `@` for comparisons against the past.

Never alert on `avg` latency — an average hides the tail that users actually feel.

---

## 4. Scraping, Exporters and Service Discovery

Prometheus is **pull-based**: it scrapes an HTTP `/metrics` endpoint on each target.

```yaml
scrape_configs:
  - job_name: api
    kubernetes_sd_configs: [{ role: pod }]
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: "true"
```

**Pull vs push** is a standard question. Pull gives you a free liveness signal (`up`), target discovery is centralised and auditable, there is no way for a rogue client to flood you, and you can scrape a target manually with `curl` to debug. It struggles with short-lived jobs and targets you cannot reach — for those, the **Pushgateway** exists for batch jobs (and only batch jobs; using it for service metrics loses the `up` signal and creates stale series). **OpenTelemetry** and the newer remote-write protocols have made push more common, and managed backends (Grafana Cloud, Mimir, Thanos) generally ingest via remote write.

**Exporters** translate something that doesn't speak Prometheus: `node_exporter` (host CPU/memory/disk), `cAdvisor`/kube-state-metrics (containers and cluster objects), `blackbox_exporter` (probe a URL from outside), plus per-database exporters. Instrument your own application **directly** with a client library rather than parsing logs into metrics.

For long retention and global query, single-node Prometheus is not enough — **Thanos** or **Mimir** add object-storage backed long-term storage and cross-cluster querying, and **VictoriaMetrics** is a common single-binary alternative.

---

## 5. Recording Rules and Alertmanager

**Recording rules** precompute expensive expressions so dashboards and alerts stay fast:

```yaml
groups:
  - name: sli
    interval: 30s
    rules:
      - record: job:request_error_ratio:rate5m
        expr: sum by (job) (rate(http_requests_total{status=~"5.."}[5m]))
            / sum by (job) (rate(http_requests_total[5m]))
```

**Alerting rules** fire when an expression stays true for `for`:

```yaml
      - alert: HighErrorRatio
        expr: job:request_error_ratio:rate5m > 0.01
        for: 10m                      # avoids flapping on a brief blip
        labels: { severity: page }
        annotations:
          summary: "{{ $labels.job }} error ratio {{ $value | humanizePercentage }}"
          runbook_url: https://runbooks.example.com/high-error-ratio
```

`for` is what turns a noisy expression into a usable alert — without it, one bad scrape pages someone.

**Alertmanager** handles everything after firing:

- **Grouping** — one notification for fifty pods failing the same way, not fifty.
- **Inhibition** — suppress downstream alerts when a cause alert is already firing (cluster down ⇒ don't page for every service).
- **Silences** — time-boxed muting during known maintenance.
- **Routing** — by label to the owning team's PagerDuty/Slack, with different severities going to different channels.

Every paging alert needs a **`runbook_url`**. An alert without a documented response is an interruption, not information.

---

## 6. Grafana and Dashboard Design

Grafana queries datasources; it stores no metrics itself. What separates a useful dashboard from decoration:

- **One dashboard per service, answering "is my service healthy"** with the four golden signals (§11) above the fold — not forty panels of everything available.
- **Template variables** (`$namespace`, `$service`) so one dashboard serves every instance instead of copies drifting apart.
- **Percentiles, not averages**, and show p50 **and** p99 together — the gap between them is the interesting signal.
- **Annotations** for deploys, so "it broke at 14:20" lines up visibly with "we deployed at 14:19". This single feature resolves a large share of incidents.
- **Exemplars** linking a latency bucket to an actual trace ID, which is the bridge from metric to trace.
- **Dashboards as code** — JSON in git, provisioned automatically, so they're reviewable and reproducible rather than hand-edited artefacts nobody can rebuild.

The anti-pattern to name: the **wall-of-graphs** dashboard that looks impressive and answers nothing under pressure. During an incident you need three or four numbers and a deploy marker.

---

## 7. Logs

**Structured, one JSON object per line** — the same discipline as the [Python guide §18.9](/backend/python):

```json
{"ts":"2026-09-08T10:00:00Z","level":"error","msg":"charge failed",
 "service":"billing","trace_id":"4bf92f...","user_id":"u_123",
 "provider":"stripe","err":"card_declined","duration_ms":812}
```

Unstructured logs force `grep` and regex; structured logs are queryable. The **`trace_id` is the critical field** — it's what lets you jump from a log line to the full request trace and back.

**Stack choices:**

| Stack | Model | Trade-off |
|---|---|---|
| **ELK / OpenSearch** | index everything | powerful full-text search; expensive, heavy to run |
| **Loki** | index **labels only**, store compressed chunks | far cheaper; slower for arbitrary full-text |
| **CloudWatch Logs** | managed | zero ops; cost grows fast, query language is limited |
| Datadog / Splunk | managed, feature-rich | most expensive at volume |

Loki's design point is worth understanding: it deliberately does **not** build a full-text index, betting that you almost always know the service and time window and only then need to grep within it. That makes it dramatically cheaper, and worse for "find this string anywhere in six months".

Operational rules: **log levels used consistently** (error = someone must act, warn = suspicious, info = business events, debug = off in production); **never log secrets, tokens or PII**; **sample high-volume repetitive lines** rather than dropping levels; set **retention by value** (7 days hot, 90 days cold, then delete) because logs are usually the largest observability bill; and **never use logs as metrics** — counting log lines to derive a rate is slow, expensive and lossy compared with a counter.

---

## 8. Traces and OpenTelemetry

A **trace** is a tree of **spans** describing one request across services. Each span has a name, start/end time, attributes, and a parent — so the tree shows exactly where the time went.

```
trace_id 4bf92f
├─ POST /checkout                 240ms
│  ├─ auth.verify                  12ms
│  ├─ inventory.reserve            35ms
│  └─ payment.charge              180ms   ← the answer
│     └─ stripe.api               172ms
```

**Context propagation** is the mechanism: the `traceparent` header (W3C Trace Context) carries the trace and parent span IDs across service boundaries. If any service drops it, the trace breaks into disconnected fragments — which is the most common tracing defect, and usually one un-instrumented HTTP client or a queue that doesn't forward headers.

**OpenTelemetry** is the vendor-neutral standard — API, SDK, and the **Collector** for receiving, processing and exporting. Instrument with OTel and you can switch backends (Jaeger, Tempo, Datadog, Honeycomb) without touching application code, which is the main argument for it.

```
app (OTel SDK) → OTel Collector → Tempo / Jaeger / vendor
                      ↑ batching, attribute scrubbing, sampling, fan-out
```

**Sampling** is unavoidable at volume:

- **Head-based** — decide at the start of the trace (e.g. keep 1%). Cheap, simple, but you will miss the rare slow request you actually care about.
- **Tail-based** — buffer the whole trace, then decide: keep all errors, all slow requests, and a small sample of successes. Far more useful, and needs the Collector to hold traces in memory.

The rule: **always keep 100% of errors and slow traces.** A uniformly sampled 1% of a rare failure gives you nothing.

---

## 9. Cardinality and Cost

The single most common way to break a metrics system.

```promql
# CATASTROPHIC — one series per user
http_requests_total{user_id="u_123"}
# also bad: request_id, session_id, full URL with IDs, email, raw error message
```

Every unique label-value combination is a separate time series held in memory and on disk. Ten thousand users × five routes × three statuses is **150,000 series from one metric** — and unbounded labels grow without limit, which is how a Prometheus instance OOMs and takes your visibility down during the incident it was meant to explain.

The discipline:

- **Labels must be bounded and low-cardinality**: service, route *template* (`/users/:id`, never `/users/12345`), method, status class, region.
- **High-cardinality identifiers belong in logs and traces**, not metrics. That's precisely what those stores are for.
- Watch `prometheus_tsdb_head_series` and set per-target limits (`sample_limit`, `label_limit`).
- On managed platforms cardinality **is** the bill, and it's usually a bigger line item than volume.

The general shape of observability cost control: metrics cheap and bounded, traces sampled with errors kept, logs retained by tier and sampled where repetitive.

---

## 10. SLIs, SLOs and Error Budgets

The SRE framework, and the part interviews probe hardest because it is as much organisational as technical.

- **SLI** — a *measured* indicator of user-visible behaviour. "Ratio of requests served in under 300 ms."
- **SLO** — the target. "99.9% of requests under 300 ms over 28 days."
- **SLA** — a contract with consequences. Always looser than the SLO, so you breach the SLO first and have time to react.
- **Error budget** — `100% − SLO`. At 99.9% over 28 days that's **~40 minutes** of allowed failure.

```
availability SLI = good events / valid events

sum(rate(http_requests_total{status!~"5.."}[28d]))
  / sum(rate(http_requests_total[28d]))
```

**The error budget is the point.** It converts reliability from an argument into arithmetic: budget remaining means you can ship risky changes; budget exhausted means the team switches to reliability work and freezes feature launches. That's a **policy agreed in advance with product**, which is what stops "is this reliable enough?" being a recurring opinion fight.

Getting SLOs right:

- Measure what the **user experiences** — success rate and latency at the edge, not CPU utilisation.
- **Don't chase 100%.** Each extra nine costs exponentially more, and the user's network is less reliable than your service anyway. An SLO tighter than the surrounding reality is wasted money.
- Choose the **quantile deliberately**: a p99 target protects the tail; a p50 target protects nobody.
- **Burn-rate alerting** beats threshold alerting: page when the budget is being consumed fast enough to exhaust it (e.g. 14.4× for 1 hour = 2% of a 28-day budget), with a slower multi-window rule for gradual burn. This is how you page on "we will breach" rather than "a graph crossed a line".

---

## 11. What to Alert On

**Alert on symptoms, not causes.** Users don't care that CPU is at 90%; they care that checkout fails. A cause-based alert fires when nothing is wrong (high CPU during a planned batch) and misses failures with a cause you didn't predict.

**The four golden signals** (Google SRE) — the default set for any request-driven service:

| Signal | Meaning |
|---|---|
| **Latency** | how long requests take — split successful from failed |
| **Traffic** | demand (requests/sec) |
| **Errors** | rate of failed requests |
| **Saturation** | how full the constrained resource is |

For resources rather than services, the **USE method** (Utilisation, Saturation, Errors) is the counterpart; **RED** (Rate, Errors, Duration) is the request-oriented restatement.

Rules for an alert that deserves to page:

1. **It is user-visible or imminently will be.** Otherwise it's a ticket or a dashboard.
2. **It is actionable** — there is a runbook and a human can do something now.
3. **It has a `for` duration** so a single blip doesn't wake anyone.
4. **It is urgent.** "Disk 80% full" with two weeks of headroom is a ticket; `predict_linear` exhausting in four hours is a page.

Then split severities: **page** (wake a human), **ticket** (business hours), **dashboard only**. If every alert pages, on-call learns to ignore them, and **alert fatigue is itself an outage risk** — the real one, because the page that mattered is the one that got dismissed.

---

## 12. On-Call and Incident Response

**Roles** during a significant incident — separating them is what stops chaos:

- **Incident Commander** — coordinates, decides, and does **not** debug. The most common failure is the IC diving into logs and nobody running the incident.
- **Operations/Responder** — makes the changes.
- **Communications** — updates the status page and stakeholders so responders aren't answering "any update?" every five minutes.
- **Scribe** — timestamps actions, which is what makes the postmortem possible.

**The response order that matters: mitigate before you diagnose.** Roll back, fail over, disable the feature flag, shed load — restore the user experience first and find the root cause afterwards from logs and traces. Teams that debug first have longer outages, and "we understood it fully before acting" is not a defence to a customer.

Severity levels should be defined in advance (SEV1 total/critical, SEV2 major degradation, SEV3 minor) with each mapping to an escalation path and comms expectation, so nobody is negotiating urgency mid-incident.

Healthy on-call: a rotation large enough that no one burns out, an escalation path that actually answers, a **runbook per alert**, handover notes, and time compensated. Track **MTTD/MTTR**, page volume and — the most telling metric — **pages per shift outside business hours**.

---

## 13. Postmortems

**Blameless** is the load-bearing word, and it is a practical stance rather than a kind one: if people fear consequences they hide contributing detail, and you lose the information needed to prevent recurrence. The framing is that a person doing a reasonable thing in a system that permitted a catastrophic outcome is a **system** problem.

A useful postmortem contains:

- **Impact** — who was affected, how badly, for how long, in user terms.
- **Timeline** — detection, escalation, mitigation, resolution, with timestamps.
- **Contributing factors** — plural. Complex failures never have a single root cause, and "human error" is where analysis stops rather than where it should start.
- **What went well** — including luck, named as luck.
- **Action items** — each with an **owner and a date**, tracked in the normal backlog. Un-owned actions don't happen, and a postmortem whose actions are never done is theatre.

Ask **why detection took as long as it did**, not just why it broke — missing observability is itself an action item, and often the highest-value one.

---

## 14. Toil, Automation and Reliability Work

**Toil** is manual, repetitive, automatable work that scales linearly with the service and creates no lasting value — restarting a service nightly, hand-running a report, clicking through a deploy. Google's SRE guidance caps it at ~**50%** of time, so that the rest goes to engineering that reduces future toil.

Reducing it: automate the repetitive path, remove the need (fix the leak instead of scripting the restart), and make the platform self-service so teams don't queue on you.

Related practices worth naming: **capacity planning** from real growth trends rather than guesses; **load and stress testing** to find the actual saturation point before users do; **chaos engineering** — deliberately injecting failure (killing pods, adding latency, severing a dependency) in a controlled way to verify your resilience assumptions and, just as importantly, that your alerts fire; and **game days** where the team rehearses an incident, which is where you discover the runbook is stale and half the team lacks access.

---

## 15. The Tool Landscape

| Need | Open source | Managed |
|---|---|---|
| Metrics | **Prometheus**, VictoriaMetrics | Grafana Cloud, Amazon Managed Prometheus, Datadog |
| Long-term metrics | **Thanos**, **Mimir**, Cortex | as above |
| Dashboards | **Grafana** | Grafana Cloud, CloudWatch |
| Logs | **Loki**, ELK/OpenSearch | CloudWatch, Datadog, Splunk |
| Traces | **Tempo**, **Jaeger** | Honeycomb, Datadog, X-Ray |
| Instrumentation | **OpenTelemetry** | — |
| Alert routing | **Alertmanager** | PagerDuty, Opsgenie, Incident.io |
| Synthetic / uptime | blackbox_exporter | Pingdom, Checkly |
| Errors | — | Sentry |

The defensible default for a self-hosted stack is **Prometheus + Grafana + Loki + Tempo, instrumented with OpenTelemetry** — one query language family, one UI, and OTel keeps the backend swappable. Choose managed when your team's time is worth more than the licence, which it usually is below a certain scale; the cost curve inverts at high volume, which is when teams migrate back.

---

## 16. Interview Questions & Answers

**Q1: What's the difference between monitoring and observability?**

**Monitoring** checks predefined signals against thresholds — you decided in advance what could go wrong, so it tells you *whether* something is broken. **Observability** is a property of the system: can you answer **new** questions about its behaviour from data it already emits, without shipping code? The test I'd use is a customer reporting that checkout is slow only for Android users in Brazil on one payment provider — a dashboard of averages cannot answer that, and data with enough dimensions to filter on can. The standard framing is the **three pillars** (metrics, logs, traces), and the useful caveat is that those are three *storage shapes*, not three purposes: treating them as separate silos is why teams pivot between four tools mid-incident. What actually delivers observability is the ability to move from a metric spike to the traces in that window to the logs for those requests — which makes **correlation IDs and exemplars** more important than any single pillar.

**Q2: Explain the Prometheus metric types and when you'd use each.**

**Counter** — monotonically increasing, resets to zero on restart; for requests, errors, bytes. Always query it with `rate()`, which detects resets correctly. **Gauge** — goes up and down; for queue depth, memory, connections. **Histogram** — pre-defined buckets exposing `_bucket`, `_sum` and `_count`; for latency and sizes. **Summary** — quantiles computed inside the client. The decision that matters is **histogram over summary**, because a summary's quantiles are per-instance and **you cannot average percentiles** — the p99 of ten instances' p99 values is meaningless. A histogram ships bucket counts, which *are* additive, so `histogram_quantile()` computes a correct global percentile across every instance; the price is choosing buckets up front, which native exponential histograms now remove. The other rule: use a counter, not a self-incremented gauge, for anything monotonic, because a gauge loses data silently across restarts while a counter reset is detectable.

**Q3: Why is Prometheus pull-based, and when does that not work?**

Pulling gives you several things for free. You get a **liveness signal** (`up`) as a side effect of scraping, so target down is detected without the target doing anything. Target discovery is **centralised and auditable** rather than depending on every service being configured correctly. No misbehaving client can flood the server, because the server controls the rate. And you can **debug by hand** — `curl` the `/metrics` endpoint and see exactly what Prometheus sees. Where it breaks down is short-lived work: a batch job may finish before any scrape, which is what the **Pushgateway** exists for — and only for batch jobs, since using it for service metrics loses the `up` signal and leaves stale series behind. It also struggles with targets you can't reach on a network path, and with serverless. That's why OpenTelemetry and **remote write** have made push common: managed backends like Grafana Cloud, Mimir and Thanos ingest via remote write, so most real setups are now hybrid.

**Q4: What is cardinality and why does it matter?**

Cardinality is the number of distinct time series, and in Prometheus **every unique combination of label values is a separate series** held in memory and on disk. So a label like `user_id` or `request_id` is catastrophic — ten thousand users across five routes and three status classes is 150,000 series from one metric, and an unbounded label grows without limit until the Prometheus instance OOMs, taking your visibility down during the very incident it was supposed to explain. The discipline is that **metric labels must be bounded and low-cardinality**: service, method, status class, region, and the route **template** (`/users/:id`, never `/users/12345`). High-cardinality identifiers belong in **logs and traces**, which are built for exactly that. Practically, watch `prometheus_tsdb_head_series`, set `sample_limit` and `label_limit` per target, and know that on managed platforms cardinality *is* the bill — usually a larger line item than raw volume.

**Q5: Define SLI, SLO, SLA and error budget.**

An **SLI** is a measured indicator of user-visible behaviour — "the ratio of requests served in under 300 ms". An **SLO** is the target for it — "99.9% under 300 ms over 28 days". An **SLA** is a contract with financial or legal consequences, and it should always be **looser** than your SLO so you breach the internal target first and have time to react. The **error budget** is `100% − SLO`, which at 99.9% over 28 days is about **40 minutes** of allowed failure. The budget is the whole point: it turns reliability from a recurring opinion fight into arithmetic. Budget remaining means the team can ship risky changes; budget exhausted triggers a pre-agreed policy where feature work pauses in favour of reliability work. That policy has to be agreed **with product in advance**, which is the organisational half of the answer, and it's why SLOs are as much a management tool as a technical one.

**Q6: Should you alert on CPU utilisation?**

Generally no — that's a **cause**, and you should **alert on symptoms**. High CPU is routine during a batch job or a cache warm and pages someone for nothing; meanwhile a failure whose cause you didn't anticipate produces no alert at all. Alert instead on what the user experiences: error ratio, latency at the edge, and success rate — the **four golden signals** (latency, traffic, errors, saturation) for a service, or **USE** for a resource. CPU still belongs on a **dashboard**, because it's exactly what you look at once a symptom alert has fired and you're diagnosing. There is a narrow exception: saturation of a resource with a hard, imminent limit — a disk that `predict_linear` says exhausts in four hours — is worth paging on, because by the time it's a symptom it's already an outage. The test for any paging alert is that it's user-visible or imminently will be, actionable with a runbook, and urgent enough to justify waking someone.

**Q7: How would you design alerting for an SLO?**

With **burn-rate alerting** rather than static thresholds. A threshold like "error ratio > 1%" either fires constantly during small blips or misses a slow bleed that quietly consumes the whole budget. Instead you alert on the **rate at which the error budget is being consumed**: a fast-burn rule pages when consumption is high enough to exhaust the budget imminently — the standard example being **14.4× over one hour**, which burns 2% of a 28-day budget — and a slow-burn rule with a longer window catches gradual degradation as a ticket rather than a page. Using **multiple windows** (a short one for sensitivity and a longer one to confirm) suppresses false pages from brief spikes. The advantage is that you page on "we are going to breach the SLO", which is inherently user-relevant and inherently actionable, instead of "a graph crossed a line". Each alert still needs a `runbook_url`, appropriate severity routing, and Alertmanager grouping so fifty failing pods produce one notification.

**Q8: What happens in the first ten minutes of a serious incident?**

**Mitigate before diagnosing.** Roll back, fail over, disable the feature flag, or shed load — restore the user experience first and find the root cause afterwards from logs and traces, which are still there. Teams that insist on understanding the failure before acting have measurably longer outages. Alongside that, establish roles: an **Incident Commander** who coordinates and explicitly does *not* debug (the classic failure is the IC diving into logs while nobody runs the incident), a responder making changes, someone on **communications** so responders aren't fielding "any update?", and a **scribe** timestamping actions — which is what makes a real postmortem possible. Declare a severity from pre-agreed definitions so nobody negotiates urgency mid-incident, and get a status page update out early; customers tolerate outages far better than silence. Then check the obvious correlation first: **what deployed recently**, which is why deploy annotations on dashboards resolve a large share of incidents in seconds.

**Q9: What makes a postmortem useful?**

Being **blameless**, which is a practical stance rather than a kind one — if people fear consequences they withhold the detail you need, so you lose the information that prevents recurrence. The framing is that a reasonable person acting in a system that allowed a catastrophic outcome is a **system** problem. Content-wise: **impact in user terms**, a **timeline** with detection, escalation, mitigation and resolution timestamps, **contributing factors in the plural** — complex failures never have one root cause, and "human error" is where analysis stops rather than starts — what **went well** including luck named as luck, and **action items each with an owner and a date**, tracked in the normal backlog. The two questions that add most value are "why did **detection** take as long as it did", since missing observability is often the highest-value action item, and "what would have made this a non-event". A postmortem whose actions are never completed is theatre.

**Q10: What is toil, and why does SRE cap it?**

**Toil** is manual, repetitive, automatable work that scales linearly with the service and produces no lasting value — nightly service restarts, hand-run reports, clicking through deploys, manually provisioning accounts. It's distinct from overhead like meetings, and distinct from genuine engineering. Google's guidance caps it at roughly **50%** of an SRE's time, and the reason is structural: if toil grows with the service and consumes all available time, the team can never do the engineering that would reduce it, so reliability degrades as you scale and the team burns out. Reducing it means automating the repetitive path, **removing the need** rather than scripting around it (fix the memory leak instead of automating the restart), and making the platform self-service so other teams don't queue on you. The related practices are capacity planning from real trends, load testing to find the true saturation point, **chaos engineering** to verify resilience assumptions *and* that alerts actually fire, and game days that reliably reveal a stale runbook and missing access.

---

## 17. Tricky Questions

**Q1: Your dashboard shows average latency at 120 ms and everything looks fine, but customers are complaining the app is slow. What's wrong with the dashboard?**

**Averages hide the tail, and the tail is what users feel.** If 95% of requests take 50 ms and 5% take 3 seconds, the mean is a healthy-looking ~200 ms while one in twenty users has an unacceptable experience — and a mean can't distinguish that from every request taking 200 ms. Worse, the affected 5% is rarely random: it's usually one endpoint, one region, one tenant with a large dataset, or the cold-start path, so a subset of customers experiences *consistent* slowness that the aggregate erases. The fix is to show **p50 alongside p99** — the gap between them *is* the signal — and to break latency down by route and region so a single bad endpoint is visible. Two further points: latency should be split into **successful versus failed** requests, because fast errors flatter your numbers; and if you're using summary metrics you cannot correctly aggregate percentiles across instances at all, which is the argument for histograms.

**Q2: You add `user_id` as a Prometheus label to debug a customer issue. A week later Prometheus OOMs. Explain the chain.**

**Every distinct label value creates a new time series, so `user_id` multiplied your series count by the number of users.** Prometheus holds an in-memory index of active series in the TSDB head block, so one metric with 10,000 users, 5 routes and 3 status classes becomes 150,000 series — and it doesn't stop, because the label is **unbounded**: every new user adds series permanently, and churn (users appearing and disappearing) makes it worse by leaving series that must still be indexed for the retention window. Memory grows until the process is OOM-killed, which takes down monitoring **precisely when you most need it**. The correct place for a per-user question is **logs or traces**, which are designed for high cardinality; metrics answer "how much and is it broken", and you pivot to traces for "which user". Prevention: `sample_limit` and `label_limit` per scrape target, alerting on `prometheus_tsdb_head_series` growth, and a review habit that treats a new label as a cost decision.

**Q3: An alert fires "DiskSpaceLow: 85% full" every week. On-call acknowledges and does nothing. What's the actual problem?**

**The alert isn't actionable or urgent, so it's training on-call to ignore alerts — which is a reliability risk in itself.** 85% with weeks of headroom needs a ticket during business hours, not a page at 3am; the page has no action attached, so the only rational response is to acknowledge and go back to sleep, and that habit generalises to alerts that *do* matter. This is **alert fatigue**, and the page that gets dismissed is the one that causes the outage. The fix is threefold. Change the **signal**: alert on time-to-exhaustion with `predict_linear(node_filesystem_avail_bytes[6h], 4*3600) < 0`, so it fires only when the disk will actually fill soon. Change the **severity**: route the slow-growth case as a ticket. And attach a **runbook** so whoever does respond knows what to do. More broadly, review paging alerts regularly and delete or downgrade any that produced no action — an alert nobody acts on should not exist.

**Q4: Traces from your frontend show a complete request, but traces from your background worker appear as isolated single-span traces with no parent. Why?**

**Trace context isn't being propagated across the queue boundary.** Distributed tracing relies on the `traceparent` header (W3C Trace Context) carrying the trace ID and parent span ID from caller to callee; HTTP client instrumentation usually injects it automatically, but a **message queue is not HTTP** — you have to explicitly inject the context into the message metadata when publishing and extract it when consuming, and if you don't, the worker starts a brand-new trace with no parent. That's why the spans exist but are orphaned. The fix is to use the OTel propagator API to inject on publish and extract on consume, so the worker's span is a child of the producing request. Two related causes worth ruling out: an un-instrumented HTTP client somewhere in the chain silently dropping the header, and a proxy or load balancer configured to strip unknown headers. Also note that with **head-based sampling**, a producer that didn't sample the trace means the consumer has nothing to attach to — another argument for tail-based sampling.

**Q5: You sample 1% of traces to control cost. A rare intermittent 5-second timeout is reported by users, but you can never find a trace for it. What went wrong and what's the fix?**

**Head-based sampling decided at the start of each trace, so the rare failures were discarded with 99% of everything else.** A uniform 1% sample of an event that happens in 0.1% of requests gives you essentially nothing, and the traces you *do* keep are overwhelmingly the healthy ones you didn't need — you are paying to store the uninteresting cases and throwing away the diagnostic ones. The fix is **tail-based sampling** in the OpenTelemetry Collector: buffer the complete trace, then decide based on what happened — **keep 100% of traces containing an error, 100% above a latency threshold**, and a small percentage of successes for baseline comparison. That costs more memory in the Collector, since traces must be held until complete, and it needs care with very long traces, but it inverts the economics in your favour. Complementary measures: use **exemplars** so a latency histogram bucket links directly to a kept trace ID, and always ensure error paths are instrumented, because an exception that escapes instrumentation produces no span at all.

---

## 18. Cheat Sheet

**Concepts**

1. Monitoring = known failure modes. Observability = answering **new** questions without shipping code.
2. Three pillars are storage shapes, not purposes — **correlation** is what makes them useful.
3. Metrics: cheap, low-cardinality. Logs: exact events. Traces: where time went.

**Prometheus model**

4. A series = **name + label set**. Every label combination is a new series.
5. **Counter** (monotonic), **gauge** (up/down), **histogram** (buckets), **summary** (client quantiles).
6. **Histogram over summary** — you cannot average percentiles.
7. Counters, not self-incremented gauges, for monotonic values.

**PromQL**

8. `rate()` on counters, per-second, handles resets.
9. `irate()` for graphs, **never for alerts**.
10. Window ≥ **4× scrape interval**.
11. `sum by (le)` **before** `histogram_quantile`.
12. `predict_linear()` for time-to-exhaustion alerts.
13. Never alert on `avg` latency.

**Collection**

14. Pull gives free `up`, central discovery, and `curl`-debuggable targets.
15. **Pushgateway is for batch jobs only** — it loses `up` and leaves stale series.
16. Exporters: `node_exporter`, cAdvisor/kube-state-metrics, `blackbox_exporter`.
17. Instrument apps directly; don't derive metrics from logs.
18. Thanos/Mimir/VictoriaMetrics for long retention and global query.

**Alerting**

19. Recording rules precompute; alerting rules need **`for`**.
20. Alertmanager: grouping, inhibition, silences, routing.
21. Every paging alert needs a **`runbook_url`**.
22. **Alert on symptoms, not causes.**
23. Golden signals: **latency, traffic, errors, saturation**. USE for resources, RED for requests.
24. Page only if user-visible, actionable and urgent. Else ticket or dashboard.
25. **Alert fatigue is an outage risk** — delete alerts nobody acts on.

**Dashboards**

26. One per service; golden signals above the fold.
27. Template variables, not copies.
28. **p50 and p99 together** — the gap is the signal.
29. **Deploy annotations** resolve a large share of incidents instantly.
30. Exemplars bridge metric → trace. Dashboards as code, in git.

**Logs**

31. Structured JSON, one object per line, with **`trace_id`**.
32. ELK indexes everything (powerful, expensive); **Loki indexes labels only** (cheap, less full-text).
33. Consistent levels; never log secrets or PII; sample repetitive lines.
34. Retention by tier — logs are usually the biggest bill.
35. **Never use logs as metrics.**

**Traces**

36. Spans form a causal tree; `traceparent` (W3C) propagates context.
37. Dropped propagation = fragmented traces — the most common defect, often a queue.
38. **OpenTelemetry** keeps the backend swappable; Collector does batching, scrubbing, sampling.
39. Head sampling is cheap and misses rare failures; **tail sampling keeps all errors and slow traces**.

**Cardinality**

40. **Never** `user_id`, `request_id`, session, email, raw URL or error string as a metric label.
41. Use route **templates** (`/users/:id`).
42. High cardinality → logs and traces.
43. Watch `prometheus_tsdb_head_series`; set `sample_limit`/`label_limit`.
44. On managed platforms, cardinality **is** the bill.

**SRE**

45. SLI measured, SLO targeted, SLA contractual (**looser** than the SLO).
46. Error budget = `100% − SLO`. 99.9% over 28 days ≈ **40 minutes**.
47. Budget policy agreed **with product in advance**.
48. Measure what users experience, not CPU. Don't chase 100%.
49. **Burn-rate, multi-window alerting** (e.g. 14.4× / 1h) over static thresholds.

**Incidents**

50. **Mitigate before you diagnose.** Roll back, fail over, flag off.
51. Roles: IC (**does not debug**), responder, comms, scribe.
52. Check what deployed recently, first.
53. Pre-agreed severities; early status-page updates.
54. Postmortems **blameless**, contributing factors **plural**, actions **owned and dated**.
55. Ask why **detection** was slow — missing observability is an action item.
56. **Toil** capped ~50%; automate the path or remove the need.
57. Chaos engineering verifies resilience **and** that alerts fire.

---

## 19. References

- [Google SRE Book](https://sre.google/sre-book/table-of-contents/) — SLOs, error budgets, alerting, postmortems. The canonical source.
- [Google SRE Workbook](https://sre.google/workbook/table-of-contents/) — practical SLO implementation and **alerting on burn rates**.
- [Prometheus documentation](https://prometheus.io/docs/) — [metric types](https://prometheus.io/docs/concepts/metric_types/), [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/), [histograms vs summaries](https://prometheus.io/docs/practices/histograms/), [naming](https://prometheus.io/docs/practices/naming/)
- [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/) and [alerting best practices](https://prometheus.io/docs/practices/alerting/)
- [OpenTelemetry documentation](https://opentelemetry.io/docs/) and [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- [Grafana Loki](https://grafana.com/docs/loki/latest/) — the label-only index model.
- [Grafana Tempo](https://grafana.com/docs/tempo/latest/) and [tail-based sampling](https://opentelemetry.io/docs/collector/configuration/#processors)
- [Thanos](https://thanos.io/) · [Mimir](https://grafana.com/docs/mimir/latest/) · [VictoriaMetrics](https://docs.victoriametrics.com/)
