# AWS CodePipeline & CodeBuild — Interview Guide

AWS's CI/CD offering is a **family of narrow services** you compose, not one product: CodePipeline orchestrates, CodeBuild compiles and tests, CodeDeploy releases, ECR and CodeArtifact store artifacts. Understanding the seams between them — and where IAM sits — is what interviews probe.

Complements the [Jenkins guide](/devops/jenkins) (self-hosted alternative), the [Docker, K8s & CI/CD guide](/backend/docker-kubernetes) (GitHub Actions), and [AWS Frontend Deployment](/aws/frontend-deployment) (the static-site case).

## Table of Contents

1. [The Service Family](#1-the-service-family)
2. [CodeBuild](#2-codebuild)
3. [buildspec.yml](#3-buildspecyml)
4. [CodePipeline](#4-codepipeline)
5. [CodeDeploy](#5-codedeploy)
6. [Artifact Storage — ECR and CodeArtifact](#6-artifact-storage-ecr-and-codeartifact)
7. [IAM for CI/CD](#7-iam-for-cicd)
8. [Secrets in Builds](#8-secrets-in-builds)
9. [Approvals and Cross-Account Deploys](#9-approvals-and-cross-account-deploys)
10. [Monitoring and Notifications](#10-monitoring-and-notifications)
11. [Defining Pipelines as Code](#11-defining-pipelines-as-code)
12. [AWS CI/CD vs GitHub Actions vs Jenkins](#12-aws-cicd-vs-github-actions-vs-jenkins)
13. [Interview Questions and Answers](#13-interview-questions-and-answers)
14. [Tricky Questions](#14-tricky-questions)
15. [Cheat Sheet](#15-cheat-sheet)
16. [References](#16-references)

---

## 1. The Service Family

| Service | Job | Notes |
|---|---|---|
| **CodePipeline** | orchestration — stages, actions, approvals | the workflow engine |
| **CodeBuild** | run builds and tests in a managed container | pay per build-minute |
| **CodeDeploy** | release to EC2 / ECS / Lambda, with rollback | deployment strategies |
| **CodeArtifact** | private npm / pip / Maven registry | package artifacts |
| **ECR** | private container registry | image artifacts |
| CodeCommit | managed Git | **closed to new customers (2024)** — use GitHub |
| CodeGuru | automated review / profiling | optional |

```
source (GitHub) → CodeBuild (build + test) → CodeDeploy / ECS → prod
        └──────────── CodePipeline orchestrates ─────────────┘
```

The design philosophy is composition: each service does one thing and IAM governs what it may touch. The cost is more moving parts than a single YAML file in GitHub Actions — and **CodeCommit being closed to new accounts** means most new pipelines start from GitHub anyway, which weakens the "everything in one place" argument.

---

## 2. CodeBuild

A **project** defines: where the source comes from, the build environment (image, compute size), the `buildspec`, artifacts, cache and the service role.

```
Compute types (Linux):
  BUILD_GENERAL1_SMALL    2 vCPU,  3 GB
  BUILD_GENERAL1_MEDIUM   4 vCPU,  7 GB
  BUILD_GENERAL1_LARGE    8 vCPU, 15 GB
  BUILD_GENERAL1_2XLARGE 72 vCPU, 145 GB
  ARM / GPU / Lambda compute also available
```

Key knobs:

- **Environment image** — an AWS-managed standard image (`aws/codebuild/standard:7.0`) or your own from ECR. A custom image is how you stop reinstalling toolchains on every build.
- **`privilegedMode: true`** — required to run Docker inside the build (docker-in-docker). Understand that this is effectively root on the build host.
- **Caching** — local (layer/source/custom) or S3. Without it every build re-downloads all dependencies.
- **VPC configuration** — put the build in your VPC to reach a private RDS or an internal registry. Requires private subnets **plus a NAT gateway or VPC endpoints**, or the build loses internet access and hangs on package downloads.
- **Timeout** (default 60 min, max 8 h) and **queue timeout**.
- **Reports** — surface test and coverage results in the console.
- **Batch builds** — fan out into parallel builds (matrix, or graph with dependencies).

`aws codebuild start-build --project-name app` runs one; the **CodeBuild Local Agent** runs a buildspec on your laptop in the same image, which is the fastest way to debug a failing build without a 5-minute feedback loop.

---

## 3. buildspec.yml

The file lives at the repository root (or is inlined in the project).

```yaml
version: 0.2

env:
  variables:
    NODE_ENV: production
  parameter-store:                       # SSM Parameter Store
    API_URL: /prod/api-url
  secrets-manager:                       # Secrets Manager (key:json-key)
    DB_PASSWORD: prod/db:password
  exported-variables:
    - IMAGE_TAG                          # pass values to later pipeline stages

phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - npm ci
  pre_build:
    commands:
      - IMAGE_TAG=${CODEBUILD_RESOLVED_SOURCE_VERSION:0:7}
      - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
  build:
    commands:
      - npm run lint
      - npm test -- --ci
      - docker build -t $ECR_REGISTRY/app:$IMAGE_TAG .
  post_build:
    commands:
      - docker push $ECR_REGISTRY/app:$IMAGE_TAG
      - printf '[{"name":"app","imageUri":"%s"}]' "$ECR_REGISTRY/app:$IMAGE_TAG" > imagedefinitions.json

reports:
  jest:
    files: ['reports/junit.xml']
    file-format: JUNITXML

artifacts:
  files:
    - imagedefinitions.json
    - appspec.yml

cache:
  paths:
    - '/root/.npm/**/*'
```

Phases run in order: `install` → `pre_build` → `build` → `post_build`. Details that matter:

- **`post_build` runs even if `build` fails.** So a naive `docker push` in `post_build` can publish an image whose tests failed — guard it with `$CODEBUILD_BUILD_SUCCEEDING`.
- **Each command runs in its own shell.** `cd foo` in one command does not persist to the next; chain with `&&` or set `shell` / use a script.
- A **non-zero exit** fails the phase and the build.
- `finally` blocks (per phase) run regardless of the phase's success — the right place for cleanup and report collection.
- Useful environment variables: `CODEBUILD_RESOLVED_SOURCE_VERSION` (the full commit SHA), `CODEBUILD_BUILD_ID`, `CODEBUILD_WEBHOOK_TRIGGER`, `CODEBUILD_BUILD_SUCCEEDING`.
- `exported-variables` is how a build hands a value (like the image tag) to a later CodePipeline stage.

---

## 4. CodePipeline

A pipeline is **stages** containing **actions**. Actions within a stage can run in parallel (`runOrder`), and stages run sequentially.

```
Source ──▶ Build ──▶ Test ──▶ Approve ──▶ Deploy-Staging ──▶ Approve ──▶ Deploy-Prod
```

Action categories: `Source`, `Build`, `Test`, `Deploy`, `Approval`, `Invoke`.

**Artifacts are the data plane.** Every action declares input and output artifacts, which CodePipeline stores in an **S3 artifact bucket** (encrypted with KMS) and passes between stages. So a build's output only reaches the deploy stage if the buildspec declared it in `artifacts:` — a missing `artifacts` block is the most common "my deploy stage can't find the file" cause.

```yaml
# a Source action's trigger
Source: GitHub (via CodeStar Connections)  # OAuth app connection, not a PAT
        or S3, ECR, CodeCommit
```

**Prefer CodeStar Connections** for GitHub rather than a personal access token: it's an IAM-governed connection, tokens don't expire in someone's account, and it supports webhooks so pushes trigger immediately instead of polling.

**V2 pipelines** add: git tag and pull-request **triggers with filters** (branch/path), pipeline-level **variables**, and stage-level `conditions` for rollback and retry — worth knowing because V1 could only trigger on a branch push.

`disableInboundStageTransitions` lets you pause a pipeline at a stage boundary — useful for a release freeze.

---

## 5. CodeDeploy

CodeDeploy handles the release itself, with health checks and automatic rollback. Three compute platforms, and the deployment styles differ per platform:

| Platform | Styles |
|---|---|
| **EC2 / on-premise** | in-place, or blue/green with a new ASG |
| **ECS** | blue/green via a load-balancer target-group swap; canary/linear |
| **Lambda** | shift alias traffic: canary, linear, all-at-once |

```yaml
# appspec.yml — EC2
version: 0.0
os: linux
files:
  - source: /
    destination: /var/www/app
hooks:
  ApplicationStop:  [{ location: scripts/stop.sh,    timeout: 60 }]
  BeforeInstall:    [{ location: scripts/backup.sh,  timeout: 300 }]
  AfterInstall:     [{ location: scripts/deps.sh,    timeout: 300 }]
  ApplicationStart: [{ location: scripts/start.sh,   timeout: 60 }]
  ValidateService:  [{ location: scripts/health.sh,  timeout: 300 }]
```

```yaml
# appspec.yml — ECS
version: 0.0
Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: <TASK_DEF_ARN>
        LoadBalancerInfo: { ContainerName: app, ContainerPort: 8080 }
Hooks:
  - AfterAllowTestTraffic: arn:aws:lambda:...:validate
```

Concepts that get asked about:

- **In-place vs blue/green.** In-place updates the existing instances — cheap, but there's a window of mixed versions and rollback means re-deploying the old build. Blue/green stands up a new environment and shifts traffic, so **rollback is instant** (shift back) at the cost of running both fleets briefly.
- **Traffic-shifting configs**: `Canary10Percent5Minutes`, `Linear10PercentEvery1Minute`, `AllAtOnce`.
- **Automatic rollback** on deployment failure or a **CloudWatch alarm** — this is the feature that makes CodeDeploy worth using over a script.
- **`ApplicationStop` runs from the *previously deployed* revision**, so a broken `stop.sh` you already shipped will keep failing every future deployment until you work around it. This surprises people badly.
- The **CodeDeploy agent** must be installed and running on EC2 targets, and instances need a tag or ASG membership matching the deployment group.

---

## 6. Artifact Storage — ECR and CodeArtifact

```bash
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin 1234.dkr.ecr.us-east-1.amazonaws.com
docker push 1234.dkr.ecr.us-east-1.amazonaws.com/app:$IMAGE_TAG
```

ECR essentials: **immutable tags** (so `:v1.2.3` can never be overwritten — turn this on), **scan on push** for CVEs, and a **lifecycle policy** to expire untagged images, which otherwise accumulate cost indefinitely. Never deploy `:latest` — it makes rollbacks and "what is actually running" unanswerable; tag with the commit SHA.

**CodeArtifact** is the equivalent for language packages (npm, pip, Maven, NuGet), with **upstream repositories** that proxy and cache the public registry. That gives you a supply-chain control point: pin what enters, keep building when npm is down, and stop a dependency being yanked out from under you.

---

## 7. IAM for CI/CD

Every service assumes a **service role**, and that is where most misconfigurations live.

```
CodeBuild service role  → ECR push, S3 artifacts, Secrets Manager read, CloudWatch Logs, VPC ENIs
CodePipeline role       → S3 artifact bucket, KMS key, StartBuild, CreateDeployment, sts:AssumeRole
CodeDeploy role         → EC2/ASG/ELB/ECS describe + modify
EC2 instance profile    → pull the revision from S3, read only what the app needs
```

Rules that get probed:

- **Least privilege per project**, not one shared admin role. A build role with `AdministratorAccess` means anyone who can change a `buildspec.yml` owns the account — and a `buildspec` change is just a pull request.
- **Fork pull requests are untrusted code.** If a webhook builds PRs from forks with a privileged role, that is remote code execution with your credentials. Filter the webhook, or require approval.
- **KMS grants matter for cross-account**: the artifact bucket and its KMS key must be readable by the target account's role, or the deploy stage fails with an opaque access error.
- **`sts:AssumeRole` into the target account** is the pattern for cross-account deploys (§9) — never long-lived keys.
- **From GitHub Actions into AWS, use OIDC**, not access keys: GitHub's OIDC provider federates into an IAM role with a trust policy scoped to your repo and branch.

---

## 8. Secrets in Builds

Never put secrets in the buildspec, in plaintext environment variables on the project, or in the repository.

```yaml
env:
  parameter-store:
    API_URL: /prod/api-url                  # SSM Parameter Store (SecureString)
  secrets-manager:
    DB_PASSWORD: prod/db:password           # secret-id:json-key
```

CodeBuild resolves these at build start using the service role, so access is IAM-governed and auditable in CloudTrail. Points to make:

- Values are **injected as environment variables**, so they can leak into build logs via `set -x`, a tool echoing its config, or `env` — CodeBuild masks known values in logs but, like Jenkins, masking is a string match and any transformation defeats it.
- **Prefer no secret at all**: give the build role permission to *do the thing* rather than a credential to authenticate with. Pushing to ECR needs an IAM permission, not a password.
- Rotate through Secrets Manager rather than editing project configuration.
- **CodeBuild logs go to CloudWatch Logs** — control who can read them, because they're a common accidental secret store.

---

## 9. Approvals and Cross-Account Deploys

**Manual approval** is an action type that pauses the pipeline and can require a specific IAM principal, with an SNS notification and a review URL:

```
Stage: Approve-Prod
  Action: Manual approval
    NotificationArn: arn:aws:sns:...:release-approvals
    ExternalEntityLink: <link to the staging environment>
```

Approvals expire after **7 days**, which is a real operational gotcha — a pipeline left waiting over a holiday fails and must be re-run.

**Cross-account** is the standard production shape: a *tools* account holds the pipeline; *dev*, *staging* and *prod* are separate accounts.

```
tools account:  CodePipeline + CodeBuild + artifact bucket (KMS CMK)
                        │ sts:AssumeRole
prod account:   deploy role ──▶ ECS / Lambda / EC2
```

The two things that trip people: the artifact bucket must use a **customer-managed KMS key** with a policy granting the target account's role decrypt, and the target role's trust policy must allow the pipeline role to assume it. Cross-account with the default S3-managed key silently fails.

---

## 10. Monitoring and Notifications

```
CodePipeline / CodeBuild → EventBridge events → SNS / Lambda / Slack / Chatbot
CodeBuild logs           → CloudWatch Logs (+ metrics, filters, alarms)
CodeDeploy               → CloudWatch alarms can trigger automatic rollback
```

What to actually watch: pipeline **failure rate** and **stage duration** (a build creeping from 4 to 12 minutes is a productivity tax nobody notices), CodeBuild **queue time** (a sign of concurrency limits), and deployment **rollback frequency**. **CodeStar Notifications** wires pipeline and build events to Slack or Teams via AWS Chatbot without writing Lambda glue.

Wire a CloudWatch alarm on application error rate into the CodeDeploy deployment group — that turns "we deployed a bad build" into an automatic rollback instead of a page.

---

## 11. Defining Pipelines as Code

Do not click pipelines together in the console — they drift and can't be reviewed or recreated.

```typescript
// AWS CDK — the highest-level option
const pipeline = new CodePipeline(this, 'Pipeline', {
  synth: new ShellStep('Synth', {
    input: CodePipelineSource.connection('org/repo', 'main', {
      connectionArn: 'arn:aws:codestar-connections:...',
    }),
    commands: ['npm ci', 'npm run build', 'npx cdk synth'],
  }),
});
pipeline.addStage(new AppStage(this, 'Prod', { env: prodEnv }));
```

Options ranked by how much they hide: **CDK Pipelines** (self-mutating — the pipeline updates itself when its own definition changes), **CloudFormation/SAM**, or **[Terraform](/devops/terraform)** with `aws_codepipeline` if the rest of your estate is Terraform. CDK's self-mutation is genuinely useful and genuinely surprising: a change to the pipeline definition is applied by the pipeline itself on the next run.

---

## 12. AWS CI/CD vs GitHub Actions vs Jenkins

| | AWS (CodePipeline/Build) | GitHub Actions | Jenkins |
|---|---|---|---|
| Setup | several services + IAM | one YAML file | install and operate a server |
| Auth to AWS | **native service roles** | OIDC federation | stored credentials or OIDC |
| VPC / private resources | **native** | needs self-hosted runners | self-hosted anyway |
| Marketplace / plugins | limited | large | ~1,900 plugins |
| Local reproduction | CodeBuild local agent | `act` (partial) | agent-dependent |
| Cost model | per build-minute | per minute (free tier for public) | your infrastructure |
| Compliance / audit | CloudTrail on everything | GitHub audit log | you build it |
| Developer experience | **weakest** | **strongest** | configurable |

Choose **AWS-native** when you need builds inside a VPC reaching private resources, when compliance wants everything auditable in CloudTrail within your account boundary, when you're deploying to ECS/Lambda and want CodeDeploy's traffic shifting and alarm-triggered rollback, or in a regulated environment where code cannot leave AWS. Choose **GitHub Actions** for developer experience and speed of setup — which is why a very common real-world split is **Actions for build and test, CodeDeploy or ECS for the release**, with OIDC federation joining them.

The honest weakness of the AWS suite is ergonomics: the console is clumsy, iterating on a `buildspec` is slow without the local agent, and errors surface as IAM or KMS access denials that don't say what's missing.

---

## 13. Interview Questions and Answers

**Q1: How do CodePipeline, CodeBuild and CodeDeploy fit together?**

They are three narrow services you compose. **CodePipeline** is the orchestrator: stages containing actions, run sequentially with parallelism inside a stage, plus approvals. **CodeBuild** is the managed build environment — it runs your `buildspec.yml` in a container and produces artifacts. **CodeDeploy** performs the release to EC2, ECS or Lambda with health checks and rollback. The data plane between them is **artifacts** stored in an S3 bucket: each action declares inputs and outputs, so a file only reaches the deploy stage if the buildspec declared it under `artifacts:`. That composition is the design philosophy — each service does one thing and IAM governs what it can touch — and the trade-off is more moving parts than a single GitHub Actions YAML. Worth noting **CodeCommit is closed to new customers**, so most new pipelines source from GitHub via CodeStar Connections anyway.

**Q2: Walk through a `buildspec.yml` and the traps in it.**

`version: 0.2`, then `env` for variables (including `parameter-store` and `secrets-manager` references resolved at build start), `phases` — `install`, `pre_build`, `build`, `post_build` — then `reports`, `artifacts` and `cache`. Three traps. **`post_build` runs even when `build` fails**, so a `docker push` there can publish an image whose tests failed unless you guard on `$CODEBUILD_BUILD_SUCCEEDING`. **Each command runs in its own shell**, so `cd` doesn't persist between commands — chain with `&&` or call a script. And a **missing `artifacts` block** means later pipeline stages can't see your output, which is the most common "deploy stage can't find the file" cause. Also useful: `exported-variables` passes a value like the image tag to later stages, `finally` blocks run regardless of phase outcome, and `CODEBUILD_RESOLVED_SOURCE_VERSION` gives you the commit SHA for tagging.

**Q3: In-place versus blue/green deployment in CodeDeploy?**

**In-place** updates the existing instances in the deployment group: the agent stops the app, installs the new revision and restarts it. It's cheaper — no extra capacity — but there is a window where instances run mixed versions, and **rollback means redeploying the previous revision**, which takes as long as a deployment. **Blue/green** provisions a new set of instances (or, for ECS, a second target group), validates them, then shifts the load balancer, so **rollback is instant** because you shift traffic back to the still-running old environment; the cost is running both fleets briefly. For ECS and Lambda you additionally get traffic-shifting configurations — `Canary10Percent5Minutes`, `Linear10PercentEvery1Minute`, `AllAtOnce`. The feature that makes CodeDeploy worth using over a shell script is **automatic rollback on a CloudWatch alarm**, which turns a bad release into an automatic revert rather than a page.

**Q4: How should IAM be set up for a CI/CD pipeline?**

Each service assumes its own **service role**, scoped to exactly what it needs: the CodeBuild role gets ECR push, artifact-bucket access, Secrets Manager read, CloudWatch Logs and — if the build runs in a VPC — permission to manage ENIs; the CodePipeline role gets the artifact bucket, the KMS key, `StartBuild`, `CreateDeployment` and `sts:AssumeRole`; CodeDeploy gets the describe/modify calls for its platform. The critical principle is **least privilege per project rather than one shared admin role**, because a build role with `AdministratorAccess` means anyone who can edit a `buildspec.yml` owns the account — and editing a buildspec is just opening a pull request. Related: treat **fork pull requests as untrusted code** and never build them with a privileged role; use `sts:AssumeRole` for cross-account rather than long-lived keys; and if you're triggering from GitHub Actions, federate with **OIDC** instead of storing access keys.

**Q5: How do you handle secrets in CodeBuild?**

Reference them, don't store them: `env.parameter-store` for SSM SecureStrings and `env.secrets-manager` for Secrets Manager (`secret-id:json-key`). CodeBuild resolves these at build start using its service role, so access is IAM-governed and logged in CloudTrail, and rotation happens centrally rather than by editing project configuration. Two caveats. The values arrive as **environment variables**, so they can leak into logs through `set -x`, a tool echoing its configuration, or a stray `env` — CodeBuild masks known values but masking is a string match, so any transformation defeats it, and **CodeBuild logs land in CloudWatch Logs**, which becomes an accidental secret store if read access is broad. Best of all, prefer having **no secret**: grant the build role permission to perform the action rather than a credential to authenticate with — pushing to ECR needs an IAM permission, not a password.

**Q6: How do cross-account deployments work, and what usually breaks?**

The standard shape is a **tools account** holding the pipeline, CodeBuild and the artifact bucket, with separate **dev/staging/prod** accounts. The pipeline role calls `sts:AssumeRole` into a deploy role in the target account, which performs the release. Two things break it, both opaque. First, the artifact bucket must use a **customer-managed KMS key** whose key policy grants decrypt to the target account's role — with the default S3-managed key, cross-account access silently fails because you cannot grant on that key. Second, the **target role's trust policy** must allow the pipeline role to assume it, and the pipeline role needs `sts:AssumeRole` on it. The failure mode is an access-denied error that doesn't say which of the two is missing, which is why this question gets asked. The account boundary is the point — it's the strongest blast-radius control AWS offers.

**Q7: Why would you choose AWS-native CI/CD over GitHub Actions?**

Four reasons that actually hold. **VPC-native builds** — CodeBuild can run inside your VPC to reach a private RDS, an internal registry or a service with no public endpoint, where Actions would need self-hosted runners. **Native IAM**, so there are no credentials to store at all; the build assumes a role. **Compliance** — everything is auditable in CloudTrail inside your account boundary, which matters in regulated environments where code and build logs cannot leave AWS. And **CodeDeploy's release features** — traffic shifting and automatic rollback on a CloudWatch alarm — if you're deploying to ECS or Lambda. Against that, the developer experience is clearly weaker: the console is clumsy, iterating on a buildspec is slow without the local agent, and failures often surface as unhelpful IAM or KMS denials. That's why a very common split is **Actions for build and test, AWS for the deploy**, joined by OIDC.

**Q8: How do you define pipelines as code, and what does CDK's self-mutation mean?**

Never click them together in the console — console-built pipelines drift, can't be code-reviewed and can't be recreated in another account. Options are **CDK Pipelines** (highest level), **CloudFormation/SAM**, or **Terraform** with `aws_codepipeline` if the rest of your estate is Terraform. CDK Pipelines are **self-mutating**: the pipeline contains a stage that redeploys its own definition, so when you change the pipeline in code, the running pipeline updates itself on the next execution rather than needing a manual deploy. That's genuinely useful — adding a stage is an ordinary pull request — and genuinely surprising the first time, because the thing you're changing is the thing applying the change, and a broken pipeline definition can leave you needing a manual `cdk deploy` to recover. Whichever tool you use, pin versions and review pipeline changes as carefully as application code, since the pipeline holds the deploy credentials.

---

## 14. Tricky Questions

**Q1: Your tests fail, the build is marked failed — and yet a new image appeared in ECR and got deployed. How?**

**The `docker push` was in `post_build`, which runs even when `build` fails.** CodeBuild's phase model is not "stop on first failure": a failing `build` phase marks the build unsuccessful but still executes `post_build`, by design, so you can collect logs, publish test reports and clean up. A naive buildspec that puts the push in `post_build` therefore publishes an artifact from a failed build — and if the pipeline's deploy stage keys off the image tag rather than the build status, that artifact ships. The fix is to guard on the build status: `if [ "$CODEBUILD_BUILD_SUCCEEDING" = "1" ]; then docker push ...; fi`, or move the push into the `build` phase after the tests, or gate the deploy stage on the build action's success in CodePipeline. Use `finally` for the things that genuinely should always run, like report collection.

**Q2: A CodeBuild project works fine, then you attach it to a VPC to reach a private RDS instance and every build hangs on `npm ci`. Why?**

**Putting CodeBuild in a VPC removes its default internet access.** Outside a VPC, builds run in an AWS-managed network with outbound internet. Once you attach it to your VPC, the build gets an ENI in the subnets you chose and follows your routing — so if those are private subnets with no **NAT gateway** and no **VPC endpoints**, outbound calls to the npm registry, Docker Hub and even AWS APIs have nowhere to go, and the build hangs until it times out rather than failing fast. Fixes: place the build in **private** subnets with a NAT gateway, or add **VPC endpoints** for the AWS services it needs (S3, ECR, Secrets Manager, CloudWatch Logs) plus a mirror or CodeArtifact upstream for public packages. Note you must use private subnets — a public subnet doesn't work for CodeBuild ENIs — and the build's security group needs egress. Also make sure the service role can create and delete ENIs, or the build fails before it starts.

**Q3: A CodeDeploy deployment to EC2 fails at `ApplicationStop` every single time, even after you fix and push the script. Why won't your fix take effect?**

**`ApplicationStop` runs from the *previously deployed* revision, not the one you're deploying.** The lifecycle has to stop the currently running application before installing the new files, so the agent executes the hook scripts it already has on disk from the last successful deployment. That means a broken `stop.sh` you shipped earlier keeps failing forever, and pushing a fixed version doesn't help because the fixed script isn't used until *after* a successful deployment installs it. It is a genuinely circular trap. Ways out: deploy with `--ignore-application-stop-failures`, manually delete or fix the script on the instances (or clear the agent's deployment archive), or in a blue/green deployment sidestep it entirely because the new instances have no previous revision. The lesson is that `ApplicationStop`, `BeforeBlockTraffic` and `AfterBlockTraffic` all come from the old revision, so they deserve more defensive scripting than the later hooks.

**Q4: Your cross-account deploy fails with "Access Denied" on the artifact. The IAM roles look correct on both sides. What's missing?**

**Almost certainly the KMS key policy — the artifact bucket is using the default S3-managed key.** CodePipeline encrypts artifacts, and for cross-account access the target account's role needs both `s3:GetObject` on the bucket **and** `kms:Decrypt` on the key that encrypted the object. With the default `aws/s3` managed key you cannot grant cross-account decrypt, so no amount of IAM policy on either side will work; the fix is a **customer-managed KMS key** with a key policy granting the target role decrypt, referenced by the pipeline's artifact store. The bucket policy must also allow the target account. This is asked because the error message names the artifact, not the key, so people iterate on S3 and IAM policies for hours. The general principle: for cross-account anything in AWS, check the resource policy, the identity policy **and** the KMS key policy.

**Q5: A release pipeline that was waiting on a manual approval over a long weekend shows as failed on Monday, and nothing was deployed. Why?**

**Manual approval actions time out after 7 days**, and the action fails when they do, failing the stage and halting the pipeline. Nothing was deployed because approval never happened — which is correct behaviour, just surprising if you assumed a pipeline waits indefinitely. You have to re-run the pipeline execution from the source stage; you cannot retroactively approve an expired action. Practical mitigations: wire the approval to **SNS or CodeStar Notifications** into Slack so it's visible rather than sitting in a console nobody opens, include an `ExternalEntityLink` to the staging environment so approving is quick, name a specific approver group in IAM so responsibility is clear, and for genuinely long freezes use `disableInboundStageTransitions` to pause the pipeline at a stage boundary instead of leaving an approval action pending. Also worth knowing that a stuck approval holds the pipeline execution, and CodePipeline supersedes queued executions by default, so newer commits may be discarded while you wait.

---

## 15. Cheat Sheet

**The family**

1. CodePipeline orchestrates, CodeBuild builds, CodeDeploy releases, ECR/CodeArtifact store.
2. **CodeCommit is closed to new customers** — source from GitHub via CodeStar Connections.
3. Artifacts pass between stages through an **S3 artifact bucket** (KMS-encrypted).

**CodeBuild**

4. A project = source + environment image + compute size + buildspec + role.
5. `privilegedMode: true` for docker-in-docker — effectively root on the build host.
6. Configure **caching**, or every build re-downloads dependencies.
7. **VPC attachment removes default internet access** — needs NAT or VPC endpoints.
8. Use the **local agent** to debug a buildspec without a 5-minute loop.
9. Custom images from ECR stop you reinstalling toolchains every build.

**buildspec.yml**

10. Phases: `install` → `pre_build` → `build` → `post_build`.
11. **`post_build` runs even if `build` failed** — guard on `$CODEBUILD_BUILD_SUCCEEDING`.
12. **Each command is its own shell** — `cd` doesn't persist; chain with `&&`.
13. Missing `artifacts:` = later stages can't see your output.
14. `finally` per phase for cleanup and report collection.
15. `exported-variables` passes values to later pipeline stages.
16. `CODEBUILD_RESOLVED_SOURCE_VERSION` = the commit SHA (use it as the image tag).

**CodePipeline**

17. Stages run sequentially; actions within a stage can parallelise via `runOrder`.
18. Categories: Source, Build, Test, Deploy, Approval, Invoke.
19. V2 adds tag/PR triggers with filters, pipeline variables, stage conditions.
20. **Approvals expire after 7 days** and then fail the stage.
21. `disableInboundStageTransitions` to pause for a release freeze.
22. Queued executions are superseded by default — newer commits can discard older ones.

**CodeDeploy**

23. In-place = cheap, mixed versions, slow rollback. Blue/green = instant rollback, double capacity.
24. Traffic shifting: `Canary10Percent5Minutes`, `Linear10PercentEvery1Minute`, `AllAtOnce`.
25. **Automatic rollback on a CloudWatch alarm** — the main reason to use it.
26. **`ApplicationStop` runs from the PREVIOUS revision** — a broken stop script blocks all future deploys.
27. The agent must be installed; targets matched by tag or ASG.

**Registries**

28. ECR: enable **immutable tags** and **scan on push**; lifecycle-expire untagged images.
29. **Never deploy `:latest`** — tag with the commit SHA.
30. CodeArtifact upstreams proxy public registries — a supply-chain control point.

**IAM & secrets**

31. Separate least-privilege service role per project — a buildspec edit is just a PR.
32. **Fork PRs are untrusted code**; never build them with a privileged role.
33. Cross-account: `sts:AssumeRole` + **customer-managed KMS key** granting decrypt.
34. Reference secrets via `parameter-store` / `secrets-manager`, never inline.
35. Better than a secret: give the role permission to do the thing.
36. Build logs go to CloudWatch Logs — restrict who can read them.
37. From GitHub Actions, federate with **OIDC**, not access keys.

**Operations**

38. Watch failure rate, stage duration, queue time, rollback frequency.
39. CodeStar Notifications → Slack/Teams via Chatbot, no Lambda glue.
40. Define pipelines as code — CDK Pipelines **self-mutate**; never click-build.
41. Common real-world split: **GitHub Actions to build, AWS to deploy**, joined by OIDC.

---

## 16. References

- [CodePipeline User Guide](https://docs.aws.amazon.com/codepipeline/latest/userguide/) — stages, actions, artifacts.
- [CodeBuild User Guide](https://docs.aws.amazon.com/codebuild/latest/userguide/) and the [buildspec reference](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)
- [CodeBuild in a VPC](https://docs.aws.amazon.com/codebuild/latest/userguide/vpc-support.html) — the NAT/endpoint requirement.
- [CodeDeploy User Guide](https://docs.aws.amazon.com/codedeploy/latest/userguide/) and the [AppSpec reference](https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file.html)
- [Deployment lifecycle event hooks](https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html) — note which hooks run from the previous revision.
- [ECR lifecycle policies](https://docs.aws.amazon.com/AmazonECR/latest/userguide/LifecyclePolicies.html) and [image scanning](https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html)
- [CodeArtifact upstream repositories](https://docs.aws.amazon.com/codeartifact/latest/ug/repos-upstream.html)
- [Cross-account CodePipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/pipelines-create-cross-account.html) — the KMS key requirement.
- [CDK Pipelines](https://docs.aws.amazon.com/cdk/v2/guide/cdk_pipeline.html) — self-mutating pipelines.
- [Configuring OpenID Connect in AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) for GitHub Actions federation.
