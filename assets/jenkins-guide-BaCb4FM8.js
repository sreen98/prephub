const e=`# Jenkins — Interview Guide

Jenkins is a **self-hosted automation server**. Its defining characteristics are the **controller/agent architecture** (§1) and **pipeline-as-code** via a \`Jenkinsfile\` (§3). Because you run it yourself, the interview questions that matter most are about **security** (§10) and **scaling** (§11) — the parts a hosted service would handle for you.

Compare with the GitHub Actions workflow in the [Docker, K8s & CI/CD guide](/backend/docker-kubernetes).

## Table of Contents

1. [Architecture](#1-architecture)
2. [Job Types](#2-job-types)
3. [Declarative Pipeline](#3-declarative-pipeline)
4. [Agents and Labels](#4-agents-and-labels)
5. [Credentials](#5-credentials)
6. [Parallelism and Matrix Builds](#6-parallelism-and-matrix-builds)
7. [Triggers](#7-triggers)
8. [Multibranch Pipelines](#8-multibranch-pipelines)
9. [Shared Libraries](#9-shared-libraries)
10. [Security](#10-security)
11. [Scaling and Reliability](#11-scaling-and-reliability)
12. [Artifacts, Tests and Deployment](#12-artifacts-tests-and-deployment)
13. [Jenkins vs GitHub Actions vs GitLab CI](#13-jenkins-vs-github-actions-vs-gitlab-ci)
14. [Interview Questions and Answers](#14-interview-questions-and-answers)
15. [Tricky Questions](#15-tricky-questions)
16. [Cheat Sheet](#16-cheat-sheet)
17. [References](#17-references)

---

## 1. Architecture

\`\`\`
        ┌──────────────┐
        │  Controller  │  scheduling, UI, plugins, config, build history
        └──────┬───────┘
       ┌───────┼────────┐
   ┌───▼──┐ ┌──▼───┐ ┌──▼───┐
   │agent │ │agent │ │agent │   execute the actual work (executors)
   └──────┘ └──────┘ └──────┘
\`\`\`

- **Controller** (formerly "master"): schedules builds, serves the UI, stores configuration and history in \`JENKINS_HOME\`, and hosts plugins.
- **Agent** (formerly "slave"): a machine with **executors**, each able to run one build at a time. Agents connect inbound (via JNLP/WebSocket) or are launched outbound over SSH.

**Run no builds on the controller.** Set its executor count to **0**. A build on the controller has filesystem access to \`JENKINS_HOME\`, which holds credentials and every job's configuration — so a malicious or careless \`Jenkinsfile\` becomes full compromise. This is the single most important architectural rule in Jenkins.

\`JENKINS_HOME\` *is* your Jenkins: config XML, job definitions, plugins, secrets and build history. Back it up, and prefer **Configuration as Code (JCasC)** so the controller is reproducible from a YAML file rather than being a hand-tuned pet.

---

## 2. Job Types

| Type | Use |
|---|---|
| **Pipeline** | a \`Jenkinsfile\` in the repo — the modern default |
| **Multibranch Pipeline** | auto-discovers branches and PRs, one pipeline each |
| Organization Folder | auto-discovers repositories in a GitHub/Bitbucket org |
| Freestyle | UI-configured, legacy — avoid |
| Matrix | one job across a combination of axes |

**Declarative vs Scripted pipeline** is a standard question:

- **Declarative** — a structured \`pipeline { }\` block. Validated up front, readable, supports \`post\`, \`when\`, \`matrix\`, and restart-from-stage. **Use this.**
- **Scripted** — arbitrary Groovy in a \`node { }\` block. Maximum flexibility, no guardrails, harder to read and review.

Declarative can drop into Groovy via a \`script { }\` block when you genuinely need it, which is why "start declarative, escape hatch where required" is the right answer.

---

## 3. Declarative Pipeline

\`\`\`groovy
pipeline {
  agent none                                   // don't hold an executor while idle

  options {
    timeout(time: 30, unit: 'MINUTES')         // never let a build hang forever
    disableConcurrentBuilds()                  // per-branch serialisation
    buildDiscarder(logRotator(numToKeepStr: '30'))
    timestamps()
    ansiColor('xterm')
  }

  environment {
    REGISTRY = 'registry.example.com'
    IMAGE    = "\${REGISTRY}/app:\${env.GIT_COMMIT.take(7)}"
  }

  parameters {
    choice(name: 'ENVIRONMENT', choices: ['staging', 'prod'])
    booleanParam(name: 'SKIP_TESTS', defaultValue: false)
  }

  stages {
    stage('Build') {
      agent { docker { image 'node:20-alpine'; args '-v $HOME/.npm:/root/.npm' } }
      steps {
        sh 'npm ci'
        sh 'npm run build'
        stash name: 'dist', includes: 'dist/**'    // pass files between agents
      }
    }

    stage('Test') {
      when { not { params.SKIP_TESTS } }
      agent { docker { image 'node:20-alpine' } }
      steps { sh 'npm test -- --ci --reporters=jest-junit' }
      post {
        always { junit 'reports/*.xml' }            // publish even on failure
      }
    }

    stage('Deploy') {
      when {
        allOf {
          branch 'main'
          expression { currentBuild.result == null }   // nothing failed yet
        }
      }
      agent { label 'deploy' }
      steps {
        unstash 'dist'
        withCredentials([string(credentialsId: 'deploy-token', variable: 'TOKEN')]) {
          sh './scripts/deploy.sh'                     // reads $TOKEN from the env
        }
      }
    }
  }

  post {
    success  { slackSend(message: "✅ \${env.JOB_NAME} #\${env.BUILD_NUMBER}") }
    failure  { slackSend(message: "❌ \${env.JOB_NAME} #\${env.BUILD_NUMBER}") }
    unstable { echo 'tests failed but the build completed' }
    always   { cleanWs() }                       // reclaim disk on the agent
  }
}
\`\`\`

Structure to remember: \`pipeline\` → \`agent\` → \`options\` / \`environment\` / \`parameters\` → \`stages\` → \`stage\` → \`steps\` → \`post\`.

\`post\` conditions: \`always\`, \`success\`, \`failure\`, \`unstable\`, \`changed\`, \`aborted\`, \`cleanup\`. **Publish test results in \`post { always }\`**, not in \`steps\` — a failing test aborts the stage, so a report published as a step never runs and you lose the diagnostic exactly when you need it.

---

## 4. Agents and Labels

\`\`\`groovy
agent any                                   // any available executor
agent none                                  // declare per stage
agent { label 'linux && docker' }           // boolean label expressions
agent { docker { image 'maven:3.9' } }      // run the stage in a container
agent { dockerfile true }                    // build the image from the repo
agent { kubernetes { yaml podTemplate } }    // a pod per build
\`\`\`

\`agent none\` at the top with per-stage agents is the efficient pattern — otherwise the pipeline holds an executor for its whole lifetime, including while waiting for an input approval.

**Workspaces are per-agent.** Files created on one agent do not exist on another, so anything crossing a stage boundary with a different agent must be passed with \`stash\`/\`unstash\` (small files) or an artifact repository (large ones). This surprises people whose pipeline works on a single agent and breaks when stages get distributed.

Prefer **ephemeral agents** — the Kubernetes or Docker cloud plugin creates a fresh pod or container per build. That removes the biggest source of "works on agent-3 only" flakiness: accumulated state on long-lived agents.

---

## 5. Credentials

Jenkins stores credentials encrypted in \`JENKINS_HOME\` (or an external provider — Vault, AWS Secrets Manager) and injects them scoped to a block:

\`\`\`groovy
withCredentials([
  string(credentialsId: 'api-token', variable: 'API_TOKEN'),
  usernamePassword(credentialsId: 'registry',
                   usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS'),
  file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG'),
  sshUserPrivateKey(credentialsId: 'deploy-key', keyFileVariable: 'KEY'),
]) {
  sh 'echo "$REG_PASS" | docker login -u "$REG_USER" --password-stdin $REGISTRY'
}
\`\`\`

Rules that get asked about:

- **Scope credentials to a folder**, not globally, so one team's job can't use another's secrets.
- Jenkins **masks** credential values in console output — but masking is a string match. \`echo $TOKEN | base64\` defeats it, so masking is a safety net, not a control.
- **Never interpolate a secret into a Groovy string** with \`"\${TOKEN}"\`: double-quoted Groovy interpolation happens *before* the shell runs, so the secret can end up in the process list and in \`set -x\` output. Use single quotes and let the shell expand \`$TOKEN\` from the environment.
- Prefer short-lived credentials — OIDC federation to a cloud role — over long-lived keys stored in Jenkins.

---

## 6. Parallelism and Matrix Builds

\`\`\`groovy
stage('Verify') {
  parallel {
    stage('Unit')   { steps { sh 'npm run test:unit' } }
    stage('Lint')   { steps { sh 'npm run lint' } }
    stage('E2E')    { steps { sh 'npm run test:e2e' } }
  }
}

stage('Cross-platform') {
  matrix {
    axes {
      axis { name 'NODE'; values '20', '22' }
      axis { name 'OS';   values 'linux', 'windows' }
    }
    excludes { exclude { axis { name 'OS'; values 'windows' }
                         axis { name 'NODE'; values '20' } } }
    agent { label "\${OS}" }
    stages { stage('Test') { steps { sh 'npm test' } } }
  }
}
\`\`\`

\`failFast true\` inside \`parallel\` aborts siblings on the first failure — good for saving executor time, bad when you want the full picture of what's broken. Each parallel branch needs its own executor, so wide parallelism needs agent capacity to match or the branches simply queue.

---

## 7. Triggers

\`\`\`groovy
triggers {
  cron('H 2 * * *')                    // nightly; H staggers the load
  pollSCM('H/15 * * * *')              // polling — a last resort
  upstream(upstreamProjects: 'build-lib', threshold: hudson.model.Result.SUCCESS)
}
\`\`\`

**Prefer webhooks** (\`GitHub hook trigger for GITScm polling\`) over \`pollSCM\`: polling means every job asks the SCM on a timer, which scales badly and adds latency up to the poll interval.

The **\`H\`** in a cron expression means "hash" — Jenkins spreads jobs across the interval based on the job name, so a hundred jobs on \`H 2 * * *\` don't all start at 02:00 and stampede the agents. Using \`0 2 * * *\` everywhere is a classic self-inflicted load spike.

---

## 8. Multibranch Pipelines

A multibranch job scans a repository and creates a sub-job per branch and per pull request, each running that branch's own \`Jenkinsfile\`.

Why it matters: the pipeline definition is **versioned with the code**, so a change to the build travels with the change to the app and gets reviewed in the same PR. Branch-specific behaviour comes from \`when { branch 'main' }\` rather than from separate jobs that drift apart.

Key configuration: discover branches and PRs (from origin and from forks — **treat fork PRs as untrusted**, §10), set an orphaned-item strategy so deleted branches clean up, and scope credentials at the folder level.

---

## 9. Shared Libraries

Once several repositories have near-identical pipelines, extract a shared library:

\`\`\`
(root)
  vars/
    buildNodeApp.groovy       # defines the step buildNodeApp()
  src/org/example/Utils.groovy
  resources/                  # non-Groovy files, loaded with libraryResource
\`\`\`

\`\`\`groovy
// vars/buildNodeApp.groovy
def call(Map cfg = [:]) {
  pipeline {
    agent { docker { image "node:\${cfg.node ?: '20'}-alpine" } }
    stages {
      stage('Build') { steps { sh 'npm ci && npm run build' } }
      stage('Test')  { steps { sh 'npm test' }
                       post { always { junit 'reports/*.xml' } } }
    }
  }
}
\`\`\`
\`\`\`groovy
// a consumer's Jenkinsfile becomes:
@Library('platform-ci@v2') _
buildNodeApp(node: '22')
\`\`\`

Version the library and have consumers pin a **tag** (\`@v2\`), not \`main\` — otherwise a library change silently alters every pipeline in the organisation at once. Libraries are also the right place to enforce policy (mandatory security scans, artifact signing) because consumers get it for free.

---

## 10. Security

Jenkins is a build server that executes arbitrary code with access to your deployment credentials — historically one of the most attacked pieces of infrastructure in a typical estate.

**Controller isolation.** Executors on the controller = 0 (§1). A build there can read \`JENKINS_HOME\` and exfiltrate every credential.

**Authorization.** Enable **Role-Based Strategy** or Matrix Authorization; never leave "anyone can do anything". Disable signup. Put jobs in folders and scope both permissions and credentials to the folder.

**Script security.** Declarative pipelines run inside the **Groovy sandbox**, which blocks dangerous calls; anything outside it requires an admin to approve via **In-process Script Approval**. Approving scripts casually is equivalent to granting remote code execution on the controller.

**Untrusted contributions.** A pull request from a fork carries a \`Jenkinsfile\` the contributor controls. Building it automatically means running attacker-supplied code with your agent's credentials. Require approval for PRs from non-collaborators, and give fork builds a credential-free agent.

**Plugins are the main CVE surface.** Jenkins' power is ~1,900 plugins, and its vulnerability history is mostly plugin-shaped. Keep them updated, remove unused ones, and subscribe to the security advisories.

Also: run agents as an unprivileged user, avoid mounting the Docker socket into build containers (that is root on the host), put the controller behind SSO with the CLI and JNLP ports closed to the internet, and audit with the Audit Trail plugin.

---

## 11. Scaling and Reliability

**The controller is a single point of failure** in open-source Jenkins — there is no active/active HA. So:

- Keep the controller doing **only** scheduling and UI; all work on agents.
- Scale out with **ephemeral agents** via the Kubernetes plugin: one pod per build, so capacity is elastic and no state accumulates. Long-lived agents drift and cause "works on agent-3" flakiness.
- Watch **\`JENKINS_HOME\` disk** — unbounded build history and archived artifacts are the most common cause of a wedged Jenkins. \`buildDiscarder\` on every job is not optional.
- **Back up \`JENKINS_HOME\`** and, better, define the controller with **JCasC** plus plugin version pinning so it can be rebuilt from code rather than restored as a pet.
- Set \`timeout\` on every pipeline; a hung build holds an executor indefinitely.
- Use \`disableConcurrentBuilds()\` or \`lock()\` for stages that touch shared resources such as a staging environment.

Queue starvation, where jobs pile up waiting for executors, is diagnosed from the build queue plus per-label executor utilisation.

---

## 12. Artifacts, Tests and Deployment

\`\`\`groovy
archiveArtifacts artifacts: 'dist/**', fingerprint: true
junit 'reports/**/*.xml'                                  // test trends
publishHTML(target: [reportDir: 'coverage', reportFiles: 'index.html'])
stash name: 'dist', includes: 'dist/**'                   // between stages
\`\`\`

\`archiveArtifacts\` is for **build outputs you want to keep and download**; \`stash\` is for **passing files between stages** within one build and is discarded afterwards. Jenkins is not an artifact repository — push real releases to Nexus, Artifactory or a container registry, and keep Jenkins' own retention tight.

A manual gate before production:

\`\`\`groovy
stage('Approve') {
  steps {
    timeout(time: 1, unit: 'HOURS') {                     // always bound an input
      input message: 'Deploy to production?', submitter: 'release-managers'
    }
  }
}
\`\`\`

Wrap \`input\` in a \`timeout\` and put it in a stage with \`agent none\`, or an abandoned approval holds an executor for as long as it takes someone to notice.

---

## 13. Jenkins vs GitHub Actions vs GitLab CI

| Aspect | Jenkins | GitHub Actions | GitLab CI |
|---|---|---|---|
| Hosting | **self-hosted** | hosted (self-hosted runners optional) | hosted or self-managed |
| Config | \`Jenkinsfile\` (Groovy) | YAML workflows | \`.gitlab-ci.yml\` |
| Ecosystem | ~1,900 plugins | Marketplace actions | built-in components |
| Maintenance | **you own upgrades, security, scaling** | provider handles it | mostly provider |
| Cost | infrastructure + engineer time | per-minute | per-minute / licence |
| Flexibility | **highest** — arbitrary Groovy, any environment | good, more opinionated | good |
| Secrets | credentials store, folder-scoped | repo/org secrets, OIDC | project/group variables, OIDC |

Choose Jenkins when you need **on-premise or air-gapped** builds, unusual hardware (mainframe, embedded, GPU farms), deep customisation, or you already have significant investment in it. Choose a hosted service for greenfield work: no controller to secure and patch, no plugin CVE treadmill, and tight integration with the code host.

The honest summary: Jenkins buys maximum flexibility at the cost of **owning a security-critical service**. Most new projects should not start with Jenkins; most large enterprises still run it, which is why it remains an interview topic.

---

## 14. Interview Questions and Answers

**Q1: Describe Jenkins' architecture, and why shouldn't builds run on the controller?**

A **controller** handles scheduling, the UI, plugins, configuration and build history, all stored in \`JENKINS_HOME\`; **agents** provide **executors**, each running one build at a time, connecting either inbound over JNLP/WebSocket or launched outbound over SSH. Builds must not run on the controller — set its executor count to **0** — because a build there has filesystem access to \`JENKINS_HOME\`, which holds every stored credential and job definition. That turns any careless or malicious \`Jenkinsfile\`, including one from a fork pull request, into full compromise of your CI and everything it can deploy to. The related operational point is that \`JENKINS_HOME\` *is* your Jenkins, so it must be backed up, and ideally the controller should be reproducible from **Configuration as Code** rather than being a hand-tuned pet.

**Q2: Declarative or Scripted pipeline, and why?**

**Declarative**, structured as a \`pipeline { }\` block. It is validated before execution, far more readable, and unlocks features Scripted doesn't have: \`post\` conditions, \`when\` guards, \`matrix\`, \`options\` like \`timeout\` and \`buildDiscarder\`, and restart-from-stage. **Scripted** is arbitrary Groovy in a \`node { }\` block — maximum flexibility with no guardrails, harder to review, and it makes it easy to accumulate logic in CI that belongs in a script in the repository. The practical answer is "declarative by default, with a \`script { }\` block as the escape hatch" when you genuinely need imperative Groovy. Keeping real logic in checked-in shell or build scripts rather than in the \`Jenkinsfile\` also keeps it testable locally.

**Q3: How do you pass files between stages, and why does it sometimes break?**

With \`stash\` and \`unstash\` for small files, or an artifact repository for large ones. It breaks because **workspaces are per-agent**: if two stages run on different agents, files created in the first simply do not exist in the second. Pipelines often work fine on a single agent and then fail once stages are given distinct agents or the pipeline moves to ephemeral Kubernetes pods. The distinction to state clearly is that \`stash\` is temporary and scoped to one build, intended for handing files between stages, while \`archiveArtifacts\` persists build outputs for download and retention. And Jenkins should not be your artifact store — real releases belong in Nexus, Artifactory or a container registry, with tight retention on Jenkins itself.

**Q4: How do you handle secrets in Jenkins?**

Store them in the credentials store — or better, an external provider such as Vault or AWS Secrets Manager — and inject them scoped to a block with \`withCredentials\`, so they exist only for those steps. **Scope credentials to a folder** rather than globally so one team's jobs cannot use another team's secrets. Two subtleties get asked about. Jenkins **masks** secrets in console output, but masking is a string match, so \`echo $TOKEN | base64\` defeats it — masking is a safety net, not a control. And you must **never interpolate a secret into a double-quoted Groovy string**, because Groovy interpolation happens before the shell runs, which can leak the value into the process list and \`set -x\` output; use single quotes and let the shell expand the environment variable. Best of all, prefer short-lived credentials via OIDC federation over long-lived keys stored in Jenkins.

**Q5: What's the biggest security risk in a Jenkins installation?**

That Jenkins executes arbitrary code with access to your deployment credentials, so any path to running code is a path to compromise. Concretely, the top risks are: **builds on the controller**, giving access to \`JENKINS_HOME\` and every credential; **automatically building pull requests from forks**, which runs contributor-supplied \`Jenkinsfile\` code with your agents' credentials — require approval for non-collaborators and give fork builds a credential-free agent; **casual script approval**, since approving a script outside the Groovy sandbox is equivalent to granting remote code execution; and **outdated plugins**, which are where most of Jenkins' CVE history lives. Add weak authorization (leaving "anyone can do anything"), and mounting the Docker socket into build containers, which is effectively root on the host. Mitigations are RBAC, folder-scoped credentials, unprivileged ephemeral agents, SSO with JNLP and CLI ports closed, and disciplined plugin updates.

**Q6: How do you scale Jenkins, and what's its weak point?**

The weak point is that in open-source Jenkins the **controller is a single point of failure** — there is no active/active HA. So you keep the controller doing only scheduling and UI, and scale horizontally with agents. The best pattern is **ephemeral agents** through the Kubernetes plugin: one pod per build, so capacity is elastic and no state accumulates between builds, which removes the "works only on agent-3" class of flakiness that long-lived agents produce. Beyond that: watch \`JENKINS_HOME\` disk, because unbounded build history and archived artifacts are the most common cause of a wedged Jenkins, so \`buildDiscarder\` belongs on every job; set a \`timeout\` on every pipeline so a hung build can't hold an executor forever; use \`disableConcurrentBuilds()\` or \`lock()\` for stages touching shared environments; and define the controller with JCasC plus pinned plugin versions so it can be rebuilt rather than restored.

**Q7: Why publish test results in \`post { always }\` rather than as a step?**

Because a failing test makes the stage fail, and subsequent **steps in that stage do not run** — so a \`junit\` call placed after the test command never executes precisely when there are failures to report. You lose the report exactly when you need it, and the build shows only a red stage with no test detail. Putting \`junit 'reports/*.xml'\` in \`post { always }\` guarantees publication whether the stage passed or failed. The same reasoning applies to coverage reports, artifact archiving of logs, and workspace cleanup. It is also worth knowing that publishing test results can mark a build **UNSTABLE** rather than FAILED, which is a distinct state — useful because it lets you treat "tests failed" differently from "the build broke".

**Q8: What are shared libraries and when do you introduce one?**

A shared library is a versioned Git repository of Groovy — \`vars/\` defining custom steps, \`src/\` for classes, \`resources/\` for files — loaded with \`@Library('name@version')\`, letting many repositories reuse one pipeline definition. Introduce one when you notice several repositories carrying near-identical \`Jenkinsfile\`s, because at that point a policy change means editing every repo. Libraries are also the right place to **enforce standards** — mandatory security scanning, artifact signing, standard notifications — since consumers get them automatically. The critical practice is versioning: consumers must pin a **tag**, not \`main\`, otherwise a library commit silently changes every pipeline in the organisation simultaneously, which is both a reliability and a security concern. Keep the library's own tests and changelog, and treat it as a product with consumers.

**Q9: What does \`H\` mean in a Jenkins cron expression, and why does it matter?**

\`H\` stands for "hash": Jenkins hashes the job name to pick a value within the allowed range, so \`H 2 * * *\` runs once between 02:00 and 02:59 at a time that is consistent for that job but different across jobs. It matters because writing \`0 2 * * *\` on a hundred jobs starts a hundred builds at exactly 02:00, stampeding the agents, saturating the SCM and the artifact registry, and turning a nightly build into an incident. \`H\` spreads that load automatically while keeping each job's schedule stable. It works in any field — \`H/15 * * * *\` for roughly every fifteen minutes. The same load-spreading instinct applies to \`pollSCM\`, though webhooks are strictly better than polling because they remove both the SCM load and the up-to-one-interval latency.

**Q10: Jenkins or GitHub Actions for a new project?**

For greenfield work, a hosted service — GitHub Actions or GitLab CI. The decisive argument is that Jenkins means **owning a security-critical service**: you patch the controller, triage plugin CVEs, secure the credential store, scale the agents and back up \`JENKINS_HOME\`, all of which is engineering time not spent on the product. Hosted CI removes that entirely and integrates natively with the code host, with OIDC for cloud credentials. Jenkins remains the right answer for **on-premise or air-gapped** environments, unusual build hardware such as embedded, mainframe or GPU farms, deep customisation that YAML can't express, or where there is already major investment and a platform team. The summary I'd give is that Jenkins buys maximum flexibility at the cost of operational ownership, which is why most enterprises still run it and most new projects shouldn't start with it.

---

## 15. Tricky Questions

**Q1: Your pipeline works on one agent. You give each stage its own agent and the Deploy stage fails with "dist: No such file or directory". Why?**

**Workspaces are per-agent, so files built in one stage don't exist in another agent's workspace.** With a single \`agent any\` at the top, every stage shared one workspace on one machine and \`dist/\` persisted naturally. Once stages declare their own agents — or the pipeline moves to ephemeral Kubernetes pods — each stage gets a fresh workspace on a different machine, and nothing carries over. The fix is \`stash name: 'dist', includes: 'dist/**'\` in the build stage and \`unstash 'dist'\` in the deploy stage, or publishing to an artifact repository for anything large, since stash is meant for modest files. This is also why \`agent none\` plus per-stage agents is an efficiency win but a correctness hazard: you stop holding an executor while idle, but you must make every cross-stage dependency explicit.

**Q2: A secret shows up in the build log even though Jenkins masks credentials. How?**

**Masking is a literal string match on the output, so any transformation of the secret slips past it.** Jenkins scans console output for the exact credential value and replaces it with asterisks, so \`echo $TOKEN\` is masked — but \`echo $TOKEN | base64\`, printing it one character at a time, or a tool that logs it URL-encoded produces a string Jenkins doesn't recognise. The more insidious cause is **Groovy interpolation**: writing \`sh "curl -H 'Auth: \${TOKEN}'"\` expands the secret into the command string before the shell ever runs, so it appears in the process list, in \`set -x\` traces, and in any error message echoing the command. Use single quotes — \`sh 'curl -H "Auth: $TOKEN"'\` — so the shell expands it from the environment. The general principle: treat masking as a safety net, not a control, and scope credentials narrowly with short lifetimes.

**Q3: A contributor opens a pull request from a fork and your Jenkins starts leaking AWS keys. What went wrong?**

**Jenkins automatically built a fork PR, running a \`Jenkinsfile\` the contributor fully controls, on an agent that had your credentials.** In a multibranch pipeline, PR discovery from forks means an outsider can submit a pipeline definition that does anything — read environment variables, dump the credential store if the build lands on the controller, or exfiltrate whatever the agent's IAM role can reach — and Jenkins will happily execute it. The mitigations: require **approval before building** PRs from non-collaborators, run untrusted builds on a **credential-free agent** with no cloud role, keep controller executors at zero so no build can read \`JENKINS_HOME\`, and never expose deployment credentials to a PR pipeline at all — build and test only, with deployment gated on a merge to a protected branch. This is the same threat model as untrusted GitHub Actions workflows, and it is the most commonly exploited Jenkins misconfiguration.

**Q4: Every night at 02:00 your agents are saturated and builds time out, but each individual job is fast. Why?**

**Every job is scheduled with a literal \`0 2 * * *\`, so they all start simultaneously and queue behind a finite pool of executors.** Individually each build is quick; collectively a hundred of them at the same instant exceeds executor capacity, so most sit in the queue while the pipeline \`timeout\` clock is already running — hence timeouts on jobs that would have completed in two minutes. They also stampede shared dependencies: the SCM, the artifact registry and the container registry all see a hundred simultaneous clients. The fix is \`H 2 * * *\`, where Jenkins hashes the job name to pick a minute within the hour, spreading the load while keeping each job's schedule deterministic. Also give long pipelines generous timeouts, and consider whether the nightly work needs to be nightly at all.

**Q5: \`JENKINS_HOME\` filled the disk and Jenkins won't start. What caused it and how do you prevent it?**

**Unbounded build history and archived artifacts.** Every build keeps its console log, test results and any \`archiveArtifacts\` output under \`JENKINS_HOME/jobs/<job>/builds/\`, and with no retention policy that grows forever — a job archiving a 200 MB bundle on every commit consumes disk at a rate nobody notices until Jenkins can't write its configuration and fails to start. Prevention: \`buildDiscarder(logRotator(numToKeepStr: '30'))\` in \`options\` on **every** pipeline, \`cleanWs()\` in \`post { always }\` to reclaim agent workspaces, and archiving only what you genuinely need to download while pushing real releases to Nexus, Artifactory or a container registry. Monitor \`JENKINS_HOME\` disk with an alert. The deeper lesson is that \`JENKINS_HOME\` is the whole system, which is why it needs backups and why defining the controller with JCasC — so it can be rebuilt rather than nursed — is worth the effort.

---

## 16. Cheat Sheet

**Architecture**

1. Controller = scheduling, UI, plugins, config, history in \`JENKINS_HOME\`.
2. Agents provide **executors**; one build per executor.
3. **Controller executors = 0.** A build there can read every credential.
4. \`JENKINS_HOME\` is your Jenkins — back it up; prefer **JCasC**.
5. No HA in open-source Jenkins: the controller is a single point of failure.

**Pipelines**

6. **Declarative** over Scripted; \`script { }\` as the escape hatch.
7. Structure: \`pipeline → agent → options/environment/parameters → stages → stage → steps → post\`.
8. \`post\` conditions: \`always\`, \`success\`, \`failure\`, \`unstable\`, \`changed\`, \`aborted\`, \`cleanup\`.
9. **Publish \`junit\` in \`post { always }\`** — a failing stage skips later steps.
10. Keep real logic in checked-in scripts, not in the \`Jenkinsfile\`.

**Agents & workspaces**

11. \`agent none\` + per-stage agents, so you don't hold an executor while idle.
12. **Workspaces are per-agent** — use \`stash\`/\`unstash\` across stages.
13. \`stash\` = temporary, within a build. \`archiveArtifacts\` = persisted output.
14. Prefer **ephemeral** agents (Kubernetes/Docker cloud) over long-lived pets.
15. \`agent { docker { image '...' } }\` for reproducible tool versions.

**Options**

16. \`timeout\` on **every** pipeline.
17. \`buildDiscarder\` on **every** job, or \`JENKINS_HOME\` fills the disk.
18. \`disableConcurrentBuilds()\` or \`lock()\` for shared environments.
19. \`cleanWs()\` in \`post { always }\`.

**Credentials**

20. \`withCredentials\` scopes secrets to a block.
21. **Folder-scoped**, not global.
22. Masking is a string match — \`base64\` defeats it.
23. **Never** \`"\${TOKEN}"\` in Groovy; use single quotes so the shell expands it.
24. Prefer OIDC short-lived cloud credentials over stored keys.

**Triggers & parallelism**

25. Webhooks over \`pollSCM\`.
26. **\`H\` in cron** spreads load; \`0 2 * * *\` on many jobs is a stampede.
27. \`parallel\` branches each need an executor; \`failFast\` trades detail for speed.
28. \`matrix\` with \`axes\`/\`excludes\` for combinations.

**Multibranch & libraries**

29. Multibranch = one pipeline per branch/PR, \`Jenkinsfile\` versioned with the code.
30. Shared libraries: \`vars/\`, \`src/\`, \`resources/\`; pin \`@v2\`, never \`main\`.
31. Libraries are where you enforce mandatory scans and signing.

**Security**

32. RBAC or Matrix Authorization; disable signup.
33. **Fork PRs are untrusted code** — require approval, credential-free agents.
34. Script approval outside the sandbox ≈ granting RCE.
35. Plugins are the main CVE surface — update and prune.
36. Don't mount the Docker socket into build containers.
37. Close JNLP/CLI to the internet; front it with SSO.

**Deployment**

38. Wrap \`input\` in a \`timeout\` and use \`agent none\`, or it holds an executor.
39. Jenkins is not an artifact repository — push to Nexus/Artifactory/a registry.
40. Jenkins buys flexibility at the cost of owning a security-critical service.

---

## 17. References

- [Jenkins User Documentation](https://www.jenkins.io/doc/) — the primary source.
- [Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/) — the declarative reference.
- [Pipeline Best Practices](https://www.jenkins.io/doc/book/pipeline/pipeline-best-practices/)
- [Using Credentials](https://www.jenkins.io/doc/book/using/using-credentials/) and [Credentials Binding](https://plugins.jenkins.io/credentials-binding/)
- [Shared Libraries](https://www.jenkins.io/doc/book/pipeline/shared-libraries/)
- [Securing Jenkins](https://www.jenkins.io/doc/book/security/) and the [Security Advisories](https://www.jenkins.io/security/advisories/)
- [Configuration as Code (JCasC)](https://www.jenkins.io/projects/jcasc/)
- [Kubernetes plugin](https://plugins.jenkins.io/kubernetes/) for ephemeral agents.
`;export{e as default};
