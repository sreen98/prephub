const e=`# Terraform — Interview Guide

Terraform is **declarative infrastructure as code**: you describe the desired end state, Terraform diffs it against recorded state and computes the actions needed to converge. Everything distinctive about it — and every interesting failure — comes back to **state** (§3).

## Table of Contents

1. [Infrastructure as Code](#1-infrastructure-as-code)
2. [HCL Building Blocks](#2-hcl-building-blocks)
3. [State — the Core Concept](#3-state-the-core-concept)
4. [The Workflow](#4-the-workflow)
5. [Variables, Outputs and Locals](#5-variables-outputs-and-locals)
6. [count vs for_each](#6-count-vs-for_each)
7. [Dependencies](#7-dependencies)
8. [Lifecycle Meta-Arguments](#8-lifecycle-meta-arguments)
9. [Modules](#9-modules)
10. [Environments](#10-environments)
11. [Secrets](#11-secrets)
12. [Importing and Refactoring](#12-importing-and-refactoring)
13. [Terraform in CI/CD](#13-terraform-in-cicd)
14. [Terraform vs the Alternatives](#14-terraform-vs-the-alternatives)
15. [Interview Questions and Answers](#15-interview-questions-and-answers)
16. [Tricky Questions](#16-tricky-questions)
17. [Cheat Sheet](#17-cheat-sheet)
18. [References](#18-references)

---

## 1. Infrastructure as Code

The problem IaC solves is **drift and irreproducibility**. Click-ops in a cloud console leaves no record of why a security group has a rule, no way to recreate an environment identically, and no review step before a production change.

**Declarative vs imperative** is the distinction to get right:

- *Imperative* (a bash script, \`aws\` CLI calls): you specify the **steps**. Running it twice does it twice.
- *Declarative* (Terraform): you specify the **desired state**. Running it twice is a no-op, because the second run sees no difference — that property is **idempotence**.

The trade-off is that declarative tools need to know what already exists, which is exactly why state exists and why it becomes the thing you spend your time managing.

---

## 2. HCL Building Blocks

\`\`\`hcl
terraform {
  required_version = ">= 1.9"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.60" }   # pin: ~> allows patch/minor
  }
  backend "s3" { bucket = "tf-state", key = "prod/terraform.tfstate", region = "us-east-1" }
}

provider "aws" { region = var.region }

# RESOURCE — something Terraform creates and owns
resource "aws_s3_bucket" "assets" {
  bucket = "\${var.project}-assets-\${var.env}"
  tags   = local.tags
}

# DATA SOURCE — something that already exists; read-only
data "aws_vpc" "default" { default = true }

# reference: <type>.<name>.<attribute>
output "bucket_arn" { value = aws_s3_bucket.assets.arn }
\`\`\`

| Block | Purpose |
|---|---|
| \`terraform\` | version constraints, backend, providers |
| \`provider\` | credentials and region for a cloud/API |
| \`resource\` | infrastructure Terraform **owns** |
| \`data\` | read existing infrastructure |
| \`variable\` / \`output\` / \`locals\` | inputs, exports, computed values |
| \`module\` | a reusable group of resources |
| \`moved\` / \`import\` | refactoring and adoption |

**Always pin provider versions.** Without a constraint, a fresh \`init\` can pull a new major provider and change or destroy resources.

---

## 3. State — the Core Concept

Terraform records what it created in a **state file** mapping configuration addresses (\`aws_s3_bucket.assets\`) to real resource IDs, plus the last-known attributes.

State exists because Terraform must answer three questions: does this resource already exist, what are its current values, and what depends on what (so it can order create/destroy correctly).

**Consequences that drive most real-world practice:**

- **State is the source of truth about ownership.** Delete a resource block and Terraform destroys the resource, because state says it owns it. Delete the *state entry* and Terraform will try to **create it again**, hitting an "already exists" error.
- **State contains secrets in plaintext** — database passwords, generated keys, and any sensitive attribute. It must be encrypted at rest and access-controlled. \`sensitive = true\` only hides values from CLI output, not from state.
- **Local state doesn't work for teams.** Two people applying concurrently produce divergent state and orphaned resources.

**Remote state with locking** is therefore mandatory:

\`\`\`hcl
terraform {
  backend "s3" {
    bucket       = "tf-state"
    key          = "prod/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true          # S3 native locking (1.10+); previously DynamoDB
  }
}
\`\`\`

The lock prevents two simultaneous applies. Historically this needed a DynamoDB table; modern Terraform can use S3 conditional writes.

**Drift** is when reality diverges from state — someone changed a security group by hand. \`terraform plan\` detects it by refreshing, and shows it as a change to be reverted. \`terraform apply -refresh-only\` accepts reality into state instead.

\`\`\`bash
terraform state list                  # every managed address
terraform state show <addr>
terraform state rm <addr>             # stop managing it (does NOT delete it)
terraform state mv <old> <new>        # rename without destroy/recreate
terraform force-unlock <lock-id>      # only after confirming nothing is running
\`\`\`

---

## 4. The Workflow

\`\`\`bash
terraform init            # download providers/modules, configure the backend
terraform fmt -recursive  # canonical formatting
terraform validate        # syntax and internal consistency (no API calls)
terraform plan -out=tf.plan
terraform apply tf.plan   # apply the SAVED plan — no re-computation, no surprises
terraform destroy
\`\`\`

\`plan\` does three things: refresh state against the real world, diff desired vs actual, and produce an ordered action list. Read the symbols carefully:

\`\`\`
+ create
- destroy
~ update in place
-/+ destroy and then create      ← REPLACEMENT. The dangerous one.
+/- create then destroy          ← replacement with create_before_destroy
<= read (data source)
\`\`\`

**\`-/+\` on a stateful resource is how outages happen.** Changing an immutable attribute — a database engine version, an EC2 AMI, a subnet — forces replacement, which for an RDS instance means deleting it. Always read the plan for \`forces replacement\`.

Applying a **saved plan file** in CI is the practice that matters: it guarantees what was reviewed is exactly what runs, whereas a bare \`terraform apply\` recomputes and may act on a changed world.

---

## 5. Variables, Outputs and Locals

\`\`\`hcl
variable "env" {
  type        = string
  description = "Deployment environment"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.env)
    error_message = "env must be dev, staging or prod."
  }
}

variable "db_password" {
  type      = string
  sensitive = true            # redacted from CLI output — NOT from state
}

locals {                      # computed, not settable from outside
  name = "\${var.project}-\${var.env}"
  tags = { Project = var.project, Env = var.env, ManagedBy = "terraform" }
}

output "endpoint" {
  value     = aws_db_instance.main.address
  sensitive = false
}
\`\`\`

Precedence, lowest to highest: defaults → \`terraform.tfvars\` → \`*.auto.tfvars\` → \`-var-file\` → \`-var\` → \`TF_VAR_*\` environment variables.

Use \`variable\` for inputs a caller sets, \`locals\` for values derived inside the module.

---

## 6. count vs for_each

The most consequential everyday choice, because it decides how resources are **addressed in state**.

\`\`\`hcl
# count → addressed by INDEX: aws_instance.web[0], [1], [2]
resource "aws_instance" "web" {
  count = 3
  tags  = { Name = "web-\${count.index}" }
}

# for_each → addressed by KEY: aws_instance.web["api"], ["worker"]
resource "aws_instance" "web" {
  for_each      = { api = "t3.small", worker = "t3.medium" }
  instance_type = each.value
  tags          = { Name = "web-\${each.key}" }
}
\`\`\`

**Why \`for_each\` is almost always right:** with \`count\`, removing the *middle* element of a list shifts every subsequent index, so Terraform sees \`[1]\` change identity and **destroys and recreates every resource after the removed one**. With \`for_each\`, keys are stable — removing one key destroys exactly that one resource.

Use \`count\` only for a genuine on/off toggle:

\`\`\`hcl
count = var.enable_monitoring ? 1 : 0
\`\`\`

\`for_each\` requires a map or a set of strings, and the **keys must be known at plan time** — deriving keys from an unknown attribute of another resource produces the "value depends on resource attributes that cannot be determined until apply" error.

---

## 7. Dependencies

Terraform builds a dependency graph and parallelises independent work (10 concurrent operations by default).

\`\`\`hcl
# IMPLICIT — created by referencing another resource's attribute. Prefer this.
resource "aws_instance" "app" {
  subnet_id = aws_subnet.private.id      # app depends on subnet, automatically
}

# EXPLICIT — only when the dependency isn't expressible as a reference
resource "aws_instance" "app" {
  depends_on = [aws_iam_role_policy.app]  # the policy must exist before boot
}
\`\`\`

Prefer implicit dependencies: they are precise and self-documenting. \`depends_on\` is a blunt instrument that serialises the whole resource and is easy to leave behind after a refactor. Its legitimate use is a genuine ordering requirement invisible to the graph — IAM policy propagation being the classic case.

Inspect the graph with \`terraform graph | dot -Tsvg > graph.svg\`.

---

## 8. Lifecycle Meta-Arguments

\`\`\`hcl
resource "aws_instance" "app" {
  lifecycle {
    create_before_destroy = true          # zero-downtime replacement
    prevent_destroy       = true          # refuse to destroy — for databases
    ignore_changes        = [tags["LastScanned"]]   # tolerate external mutation
    replace_triggered_by  = [aws_launch_template.app.id]
  }
}
\`\`\`

- **\`create_before_destroy\`** inverts replacement order so the new resource exists before the old is removed. Essential for anything serving traffic; requires that names don't collide (use \`name_prefix\`).
- **\`prevent_destroy\`** makes \`apply\` **fail** rather than destroy. Put it on databases and state buckets. Note it blocks \`terraform destroy\` for the whole configuration, which is the point.
- **\`ignore_changes\`** stops Terraform fighting a value something else mutates — an autoscaler adjusting \`desired_count\`, or a tag written by a scanner.

---

## 9. Modules

A module is any directory of \`.tf\` files. Every configuration has a root module; anything it calls is a child.

\`\`\`hcl
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"                # pin registry modules

  name = local.name
  cidr = "10.0.0.0/16"
}

resource "aws_instance" "app" {
  subnet_id = module.vpc.private_subnets[0]     # consume a module output
}
\`\`\`

Sources: local path (\`./modules/network\`), the Terraform Registry, or a git ref (\`git::https://...?ref=v1.2.0\` — **always pin the ref**).

Design guidance:

- A module should own **one coherent piece of infrastructure**, exposing a small typed interface. A module with forty variables is a leaky abstraction.
- **Don't wrap a single resource** in a module — it adds indirection for nothing.
- Modules must not configure \`provider\` blocks or backends; those belong to the root, otherwise the module can't be reused.
- Version and changelog shared modules like libraries, because a breaking change can propose destroying production resources.

---

## 10. Environments

Three approaches, and the interview wants you to know why workspaces are usually the wrong one:

| Approach | State | Verdict |
|---|---|---|
| **Directory per environment** (\`envs/prod/\`) | separate files | **preferred** — full isolation, per-env differences explicit |
| **Workspaces** | separate keys, **same backend and config** | fine for ephemeral copies; bad for prod |
| Branch per environment | — | anti-pattern: drift between branches |

\`\`\`bash
terraform workspace new staging
terraform workspace select staging
terraform workspace show
\`\`\`

Workspaces share one configuration, so per-environment differences turn into \`var.env == "prod" ? ... : ...\` conditionals sprinkled through the code, and one \`terraform apply\` in the wrong workspace hits the wrong environment with no separate credentials boundary. Directory-per-environment gives distinct backends, distinct variable files and distinct IAM roles — separation you can actually enforce.

Even better for large estates: **split state by blast radius** — network, data, and application in separate states, consuming each other through \`terraform_remote_state\` data sources or published outputs. Small states plan faster and a mistake can't destroy everything.

---

## 11. Secrets

**Terraform state stores every value in plaintext**, so the rules are:

1. Never hardcode secrets in \`.tf\` files (they go to git) or \`.tfvars\` (usually also git).
2. Encrypt state at rest, restrict backend access with IAM, and version the bucket.
3. Fetch secrets at apply time from a secret manager rather than passing them in:

\`\`\`hcl
data "aws_secretsmanager_secret_version" "db" { secret_id = "prod/db" }

resource "aws_db_instance" "main" {
  password = jsondecode(data.aws_secretsmanager_secret_version.db.secret_string)["password"]
}
\`\`\`

That value **still lands in state** — the win is that it isn't in git and rotates centrally. For genuinely sensitive material, have Terraform create the secret *container* and let the application populate it, so the value never enters Terraform's graph.

\`sensitive = true\` only redacts CLI and plan output. It is not encryption.

---

## 12. Importing and Refactoring

**Adopting existing infrastructure.** The declarative \`import\` block (1.5+) is reviewable and plan-visible, unlike the old CLI command:

\`\`\`hcl
import {
  to = aws_s3_bucket.assets
  id = "my-existing-bucket"
}
\`\`\`
\`\`\`bash
terraform plan -generate-config-out=generated.tf   # scaffold the resource block
\`\`\`

**Renaming without destroying.** Renaming a resource changes its address, and Terraform reads that as *destroy the old, create the new*. The \`moved\` block records the rename instead:

\`\`\`hcl
moved {
  from = aws_s3_bucket.old_name
  to   = aws_s3_bucket.assets
}
\`\`\`

That is far safer than \`terraform state mv\`, because it lives in code, gets reviewed, and applies identically for every teammate. Same mechanism when you move resources into a module.

---

## 13. Terraform in CI/CD

\`\`\`yaml
# plan on PR, apply on merge
- run: terraform init -backend-config=envs/prod/backend.hcl
- run: terraform fmt -check -recursive
- run: terraform validate
- run: terraform plan -out=tf.plan -input=false
- run: terraform show -no-color tf.plan > plan.txt   # post as a PR comment
# on merge to main, gated by an environment approval:
- run: terraform apply -input=false -auto-approve tf.plan
\`\`\`

Practices that separate a working pipeline from a dangerous one:

- **Apply the saved plan file**, so what was reviewed is what runs.
- **Never \`-auto-approve\` a freshly computed plan** in production.
- **OIDC federation** for cloud credentials, not long-lived access keys.
- Concurrency control so two pipelines can't apply the same state.
- Policy as code — **OPA/Conftest**, Sentinel, or \`tflint\` — to reject, say, an unencrypted bucket before apply.
- \`tfsec\`/\`checkov\` for security scanning, and \`infracost\` to surface cost deltas in the PR.
- Set \`TF_IN_AUTOMATION=1\` and \`-input=false\` so nothing waits on a prompt.

---

## 14. Terraform vs the Alternatives

| Aspect | Terraform | CloudFormation | Pulumi / CDK | Ansible |
|---|---|---|---|---|
| Language | HCL (declarative) | YAML/JSON | real languages (TS/Python/Go) | YAML |
| Scope | **multi-cloud** + SaaS providers | AWS only | multi-cloud | config mgmt, some provisioning |
| State | **you manage it** | AWS manages it | managed or self-hosted | stateless |
| Drift | \`plan\` detects | drift detection | \`preview\` | re-run converges |
| Strength | huge provider ecosystem | native AWS integration, no state to lose | loops/abstraction in a real language | in-place server configuration |

Terraform's edge is the **provider ecosystem** — AWS, GCP, Azure, Cloudflare, Datadog, GitHub, Kubernetes, all in one graph. CloudFormation's edge is that AWS keeps the state for you, so it can't be corrupted or lost. Pulumi's edge is real language features when your infrastructure needs genuine abstraction.

**Terraform and Ansible are complements, not competitors:** Terraform provisions infrastructure (declarative, stateful), [Ansible](/devops/ansible) configures what runs on it (procedural, stateless). The common pattern is Terraform to create the machines, then Ansible or a baked image to configure them — and Terraform \`provisioner\` blocks are explicitly a last resort, because they run only at create time, aren't tracked in state, and turn a failure into a tainted resource.

---

## 15. Interview Questions and Answers

**Q1: What is Terraform state, and why does it exist?**

State is Terraform's record mapping each configuration address, such as \`aws_s3_bucket.assets\`, to a real resource ID plus its last-known attributes. It exists because a declarative tool must answer three questions before it can act: does this thing already exist, what are its current values, and what depends on what so creates and destroys can be ordered correctly. Without state, Terraform couldn't distinguish "create this" from "update this", and couldn't know that a resource you deleted from the config should be destroyed. Three consequences follow: state is the **source of truth about ownership**, so removing a state entry makes Terraform try to create the resource again; state contains **secrets in plaintext**, so it must be encrypted and access-controlled; and local state is unworkable for teams, so you need a remote backend with locking.

**Q2: Why do you need remote state with locking, and what is drift?**

Local state means each engineer has a different idea of what exists, and two concurrent applies produce divergent state plus orphaned resources that nothing manages. A remote backend — S3, GCS, Terraform Cloud — gives one shared source of truth, encryption at rest, versioning so you can roll back a corrupted state, and IAM-controlled access. **Locking** is the other half: it stops two applies mutating the same state simultaneously, historically via a DynamoDB table and now via S3 conditional writes with \`use_lockfile\`. **Drift** is divergence between state and reality, usually from a manual console change; \`terraform plan\` refreshes and surfaces it as a change Terraform intends to revert, while \`apply -refresh-only\` accepts reality into state instead. In practice you also want a scheduled plan that alerts on drift, because unnoticed drift makes the next unrelated apply surprising.

**Q3: What's the difference between \`count\` and \`for_each\`, and which should you use?**

\`count\` addresses resources by **numeric index** (\`aws_instance.web[0]\`), \`for_each\` by **key** (\`aws_instance.web["api"]\`). That addressing difference is the whole answer: with \`count\`, removing an element from the middle of a list shifts every later index, so Terraform sees those resources change identity and **destroys and recreates all of them** — catastrophic for stateful resources. With \`for_each\`, keys are stable, so removing one key destroys exactly one resource. So \`for_each\` is the default choice, and \`count\` is appropriate only for a genuine on/off toggle like \`count = var.enabled ? 1 : 0\`. The constraint on \`for_each\` is that keys must be **known at plan time**; deriving them from another resource's unknown attribute gives the "cannot be determined until apply" error, which you fix by keying off input variables rather than computed IDs.

**Q4: When would you use \`depends_on\` rather than an implicit dependency?**

Almost never. Referencing another resource's attribute — \`subnet_id = aws_subnet.private.id\` — creates an implicit dependency that is precise, self-documenting and survives refactoring. \`depends_on\` is for a real ordering requirement the graph can't see, and the classic legitimate case is IAM: an instance needs a role policy to be *effective* before it boots, but nothing in the instance's configuration references the policy. The costs of over-using it are that it serialises the entire resource rather than the specific attribute, it defeats parallelism, and it lingers after refactors as invisible coupling. A related smell is using \`depends_on\` to paper over eventual consistency in a provider — usually the provider or a \`time_sleep\` resource is the more honest fix.

**Q5: How do you rename a resource without destroying it?**

Use a **\`moved\` block**, which records the address change in code:

\`\`\`hcl
moved { from = aws_s3_bucket.old, to = aws_s3_bucket.assets }
\`\`\`

Renaming a resource block changes its address, and because state keys off the address Terraform reads that as "destroy the old, create the new" — for a database or a bucket with data, that is destructive. The \`moved\` block updates state during apply instead. It is strictly better than \`terraform state mv\` because it lives in version control, gets reviewed, and applies identically for every teammate and for CI, whereas the CLI command is a local imperative action someone has to remember to run. The same mechanism handles moving resources into or between modules, which is otherwise one of the riskiest refactors.

**Q6: How should you handle secrets in Terraform?**

Start from the fact that **state stores every attribute in plaintext**, so the goal is to keep secrets out of git and to limit who can read state. Never hardcode them in \`.tf\` or \`.tfvars\`. Encrypt state at rest, version the bucket, and restrict backend access by IAM. Fetch values at apply time from a secret manager via a data source so the secret is centrally rotated and never committed — accepting that the value still lands in state. For genuinely sensitive material, invert the flow: let Terraform create the empty secret *container* and have the application or a separate process populate it, so the value never enters Terraform's graph at all. Be clear that \`sensitive = true\` only redacts CLI and plan output; it is not encryption and offers no protection to state.

**Q7: Workspaces or directory-per-environment?**

Directory-per-environment for anything real. Workspaces share **one configuration and one backend**, differing only in the state key, so per-environment differences become conditionals like \`var.env == "prod" ? 2 : 1\` scattered through the code, there is no credential boundary between environments, and selecting the wrong workspace applies production changes with no separate approval path. Directories give you distinct backends, distinct variable files and distinct IAM roles, so isolation is enforced rather than remembered. Workspaces are genuinely useful for **ephemeral** copies — a per-developer or per-PR stack from identical configuration. For a large estate I'd go further and split state by **blast radius** — network, data and application separately — since small states plan faster and one mistake can't destroy everything.

**Q8: What does \`plan\` actually do, and why apply a saved plan file?**

\`plan\` refreshes state against the real world, diffs desired configuration against actual, and emits an ordered list of actions. Reading it properly is the skill: \`+\` create, \`-\` destroy, \`~\` update in place, and **\`-/+\` destroy-then-create**, which is the dangerous one — changing an immutable attribute such as an RDS engine version or a subnet forces replacement, and for a stateful resource that means data loss. Always search the plan for "forces replacement". Applying a **saved plan file** matters because a bare \`terraform apply\` recomputes the plan at apply time, so what runs may differ from what was reviewed if the world changed in between; \`terraform plan -out=tf.plan\` followed by \`terraform apply tf.plan\` guarantees the reviewed actions are exactly the executed actions, which is why it's the standard in CI.

**Q9: How do you design good Terraform modules?**

A module should own **one coherent piece of infrastructure** and expose a small, typed, well-documented interface — a VPC with its subnets and routing, not "all of production". Keep \`provider\` and \`backend\` blocks out of it, or it can't be reused. Don't wrap a single resource, which adds indirection with no abstraction. Add \`validation\` blocks to variables so misuse fails at plan rather than producing broken infrastructure. Treat shared modules like libraries: version them, pin consumers to a \`~>\` constraint or a git tag, and keep a changelog — a breaking module change can propose destroying production resources across every consumer at once. The smell to name is a module with forty variables that pass straight through to one resource: that's a leaky abstraction and you'd be better off using the resource directly.

**Q10: How does Terraform compare to Ansible, and would you use both?**

They solve different problems and are complements. Terraform is **declarative and stateful**, purpose-built for *provisioning* cloud resources, and its strength is the provider ecosystem letting one graph span AWS, Cloudflare, Datadog and GitHub. Ansible is **procedural and stateless**, purpose-built for *configuration management* — installing packages, templating config files, restarting services on existing hosts — and it converges by re-running rather than by diffing recorded state. The idiomatic pairing is Terraform to create the infrastructure, then Ansible or a pre-baked image to configure what runs on it. I would specifically avoid Terraform \`provisioner\` blocks for that configuration step: they run only at create time, aren't tracked in state, don't re-converge, and a failure taints the resource. In a container world much of the Ansible role is replaced by immutable images and Kubernetes.

---

## 16. Tricky Questions

**Q1: You remove one item from the middle of a \`count\`-based list of five EBS volumes. The plan wants to destroy and recreate three of them. Why?**

**Because \`count\` addresses resources by index, and removing the middle element shifts every later index.** State holds \`aws_ebs_volume.data[0]\` through \`[4]\`. Removing the item that was \`[2]\` means what used to be \`[3]\` is now \`[2]\` and \`[4]\` is now \`[3]\` — so Terraform compares the configuration at \`[2]\` against the state at \`[2]\` and sees a different volume, concluding it must destroy and recreate. Index four disappears entirely. For volumes that means **data loss on three of them**, not one. The fix is \`for_each\` over a map, where each resource is keyed by a stable identifier so removing a key destroys exactly that resource. If you're already on \`count\` in production, migrate with \`moved\` blocks to re-key existing resources rather than letting a plan rewrite them. This is the single best argument for \`for_each\` being the default.

**Q2: \`terraform plan\` shows no changes, but the security group in the console has an extra rule someone added by hand. Why didn't Terraform notice?**

**Most likely the refresh was skipped, or the rule is managed outside the resource's tracked attributes.** \`plan\` normally refreshes state against the provider and would surface the extra rule as a change to revert — unless it was run with \`-refresh=false\` (common in CI to speed up plans), in which case Terraform diffs against a stale snapshot and sees nothing. The other common cause is structural: if you manage rules with separate \`aws_security_group_rule\` resources, the parent \`aws_security_group\` doesn't own the inline rules, so an added rule belongs to no resource and Terraform is indifferent to it. A third possibility is an \`ignore_changes\` on that attribute quietly suppressing it. The practices that catch this class of problem are a **scheduled drift-detection plan** that alerts, and avoiding \`-refresh=false\` on anything you intend to trust.

**Q3: A colleague deleted a resource block and applied, intending to hand that resource to another team. It got destroyed. What should they have done?**

**\`terraform state rm\`, which stops managing the resource without touching it.** Deleting the block tells Terraform "I no longer want this to exist", and because state records that Terraform owns it, apply destroys it. \`terraform state rm aws_s3_bucket.legacy\` removes only the *state entry*, so Terraform forgets the resource and leaves it running for the other team to adopt with an \`import\` block. The mirror-image mistake is worth knowing too: deleting the state entry when you actually wanted the resource gone leaves an **orphan** nothing manages and nobody is paying attention to. For anything genuinely irreplaceable, \`lifecycle { prevent_destroy = true }\` makes apply fail rather than destroy, which converts this whole category of accident into an error message.

**Q4: Your \`for_each\` fails with "the for_each value depends on resource attributes that cannot be determined until apply". What's happening?**

**The keys are derived from something Terraform won't know until it has created another resource.** \`for_each\` needs its keys at **plan** time, because keys become resource addresses and Terraform must know how many resources exist and what they're called before it can produce a plan. If you write \`for_each = toset(aws_subnet.private[*].id)\`, those IDs are unknown pre-apply, so Terraform cannot enumerate the addresses. The fix is to key off something static — input variables, a local map, or the same list you used to create the subnets — and look up the computed attribute in the body: \`for_each = var.subnet_names\` with \`subnet_id = aws_subnet.private[each.key].id\`. Values may be unknown; **keys may not**. A two-stage apply with \`-target\` is the escape hatch, but restructuring the keys is the real fix.

**Q5: An apply fails halfway. Terraform shows some resources created and then errors. Is state now wrong, and what do you do?**

**No — state records what was actually created, so it's accurate but incomplete; the correct action is to fix the cause and re-apply.** Terraform writes state as it goes, so resources created before the failure are recorded and Terraform will not recreate them. Because the configuration is declarative and converging, re-running plan shows only the remaining work. What you must **not** do is hand-edit state or assume everything rolled back — Terraform has no transactions and does not undo completed creates. Two complications to mention: if the process was killed rather than erroring, the **lock may still be held**, needing \`force-unlock\` after confirming nothing is running; and a resource that failed mid-provisioner is marked **tainted** and will be replaced on the next apply. If a resource was created but not recorded, you'll get an "already exists" error and need to \`import\` it.

---

## 17. Cheat Sheet

**Concepts**

1. Declarative: you describe the end state; running twice is a no-op (idempotence).
2. State maps config addresses → real resource IDs + last-known attributes.
3. **State is the source of truth about ownership.**
4. State holds secrets in **plaintext** — encrypt, version, restrict by IAM.
5. \`sensitive = true\` redacts output only. It is not encryption.
6. Drift = reality diverging from state; \`plan\` refreshes and surfaces it.

**Workflow**

7. \`init\` → \`fmt\` → \`validate\` → \`plan -out\` → \`apply <plan>\`.
8. Plan symbols: \`+\` create, \`-\` destroy, \`~\` update, **\`-/+\` replace**, \`+/-\` create-before-destroy.
9. Grep every plan for **"forces replacement"**.
10. Apply the **saved plan file** so reviewed == executed.
11. \`terraform apply -refresh-only\` accepts reality into state.

**State commands**

12. \`state list\` / \`state show <addr>\`.
13. \`state rm\` stops managing — it does **not** delete the resource.
14. \`state mv\` renames; prefer a **\`moved\` block** in code.
15. \`force-unlock\` only after confirming nothing is running.

**Iteration**

16. **\`for_each\` by default** — stable keys.
17. \`count\` shifts indices: removing a middle element recreates everything after it.
18. \`count = var.enabled ? 1 : 0\` is the one good use of \`count\`.
19. \`for_each\` keys must be known at **plan** time; values may be unknown.

**Dependencies & lifecycle**

20. Prefer implicit dependencies (attribute references) over \`depends_on\`.
21. \`create_before_destroy\` for zero-downtime replacement (use \`name_prefix\`).
22. \`prevent_destroy\` on databases and state buckets.
23. \`ignore_changes\` where something external mutates a value.

**Modules & environments**

24. One coherent piece of infrastructure, small typed interface.
25. No \`provider\` or \`backend\` blocks inside a module.
26. Pin registry versions (\`~>\`) and git refs (\`?ref=v1.2.0\`).
27. **Directory per environment** over workspaces.
28. Split state by blast radius: network / data / app.

**Adoption & refactoring**

29. \`import\` block (1.5+) is reviewable; \`-generate-config-out\` scaffolds the code.
30. \`moved\` blocks for renames and module moves — never a bare rename.

**CI/CD**

31. Plan on PR (post it as a comment), apply on merge behind an approval.
32. Never \`-auto-approve\` a freshly computed plan in production.
33. OIDC federation, not long-lived cloud keys.
34. Concurrency control so two pipelines can't apply one state.
35. \`tflint\`, \`tfsec\`/\`checkov\`, OPA/Conftest policy gates, \`infracost\`.
36. \`TF_IN_AUTOMATION=1\` and \`-input=false\`.

**Gotchas**

37. Always pin provider versions, or a fresh \`init\` can pull a breaking major.
38. Failed apply = accurate but partial state. Fix and re-apply; never hand-edit.
39. A killed apply can leave a stale lock.
40. \`provisioner\` blocks are a last resort — create-time only, untracked, taint on failure.
41. \`-refresh=false\` speeds plans up and hides drift.
42. Terraform provisions; [Ansible](/devops/ansible) configures. Use both.

---

## 18. References

- [Terraform documentation](https://developer.hashicorp.com/terraform/docs) — the primary source.
- [State](https://developer.hashicorp.com/terraform/language/state) and [Backends](https://developer.hashicorp.com/terraform/language/backend)
- [\`for_each\` and \`count\`](https://developer.hashicorp.com/terraform/language/meta-arguments/for_each)
- [Lifecycle meta-arguments](https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle)
- [\`moved\` blocks](https://developer.hashicorp.com/terraform/language/modules/develop/refactoring) and [\`import\` blocks](https://developer.hashicorp.com/terraform/language/import)
- [Module development best practices](https://developer.hashicorp.com/terraform/language/modules/develop)
- [Running Terraform in automation](https://developer.hashicorp.com/terraform/tutorials/automation/automate-terraform)
- [tflint](https://github.com/terraform-linters/tflint), [tfsec](https://github.com/aquasecurity/tfsec), [Checkov](https://www.checkov.io/), [Infracost](https://www.infracost.io/)
`;export{e as default};
