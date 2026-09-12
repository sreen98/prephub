# Ansible — Interview Guide

Ansible is **agentless configuration management**: a control node connects over SSH (or WinRM), pushes small programs to the target, runs them, and removes them. There is nothing to install on the managed hosts beyond Python and SSH access.

The concept everything hangs on is **idempotence** (§4) — and the most common real-world mistake is writing playbooks that aren't (§5).

Pairs with [Terraform](/devops/terraform): Terraform provisions infrastructure, Ansible configures what runs on it.

## Table of Contents

1. [Architecture](#1-architecture)
2. [Inventory](#2-inventory)
3. [Playbooks, Plays and Tasks](#3-playbooks-plays-and-tasks)
4. [Idempotence](#4-idempotence)
5. [Modules vs shell/command](#5-modules-vs-shellcommand)
6. [Variables and Precedence](#6-variables-and-precedence)
7. [Facts](#7-facts)
8. [Templates and Handlers](#8-templates-and-handlers)
9. [Loops, Conditionals and Blocks](#9-loops-conditionals-and-blocks)
10. [Roles and Collections](#10-roles-and-collections)
11. [Secrets — Ansible Vault](#11-secrets-ansible-vault)
12. [Safety: Check Mode, Diff and Tags](#12-safety-check-mode-diff-and-tags)
13. [Error Handling](#13-error-handling)
14. [Performance](#14-performance)
15. [Ansible vs the Alternatives](#15-ansible-vs-the-alternatives)
16. [Interview Questions and Answers](#16-interview-questions-and-answers)
17. [Tricky Questions](#17-tricky-questions)
18. [Cheat Sheet](#18-cheat-sheet)
19. [References](#19-references)

---

## 1. Architecture

```
┌───────────────┐   SSH    ┌──────────┐
│ control node  │─────────▶│  host A  │  (Python + SSH only)
│  ansible-     │─────────▶│  host B  │
│  playbook     │─────────▶│  host C  │
└───────────────┘  WinRM   └──────────┘
```

**Agentless and push-based.** Ansible copies a module (a small Python program) to the target, executes it, collects JSON output, and deletes it. Consequences:

- **Nothing to install or patch on managed hosts** — a major operational advantage over Puppet/Chef agents.
- **No continuous enforcement.** Config only converges when you *run* a playbook. Puppet's agent re-applies on a timer; Ansible does not, so drift persists between runs unless you schedule them (or use AWX/Ansible Automation Platform).
- **The control node needs network reach and credentials** to every host, which makes it a high-value target.
- Scale is bounded by SSH fan-out from one node (§14), not by an agent fleet.

Ansible is **stateless** — it stores nothing between runs. It reads the current state of each host at run time and converges. That is the opposite of [Terraform](/devops/terraform), whose whole model is recorded state, and it is why Ansible has no `plan`/`apply` split and no drift database.

---

## 2. Inventory

```ini
# inventory/production.ini
[web]
web-01.example.com
web-02.example.com

[db]
db-01.example.com ansible_host=10.0.1.5 ansible_user=postgres

[production:children]
web
db

[web:vars]
nginx_worker_processes=4
```

```yaml
# inventory/production.yml — the modern form
all:
  children:
    web:
      hosts:
        web-01.example.com:
        web-02.example.com:
      vars:
        nginx_worker_processes: 4
```

Variables belong in `group_vars/` and `host_vars/` directories rather than inline, so they're reviewable and layered:

```
inventory/
  production.yml
  group_vars/
    all.yml
    web.yml
    web/vault.yml        # encrypted secrets for the group
  host_vars/
    web-01.example.com.yml
```

**Dynamic inventory** queries the source of truth instead of a static file — essential in cloud, where hosts come and go:

```yaml
# inventory/aws_ec2.yml
plugin: amazon.aws.aws_ec2
regions: [us-east-1]
keyed_groups:
  - key: tags.Role       # creates groups like tag_Role_web
    prefix: tag
filters:
  instance-state-name: running
```

```bash
ansible-inventory -i inventory/ --graph      # verify what Ansible actually sees
```

---

## 3. Playbooks, Plays and Tasks

```yaml
- name: Configure web servers
  hosts: web
  become: true                      # privilege escalation (sudo)
  serial: 2                         # rolling: two hosts at a time
  max_fail_percentage: 25
  vars:
    app_port: 8080

  pre_tasks:
    - name: Ensure the cache is fresh
      ansible.builtin.apt: { update_cache: true, cache_valid_time: 3600 }

  roles:
    - common
    - { role: nginx, nginx_port: "{{ app_port }}" }

  tasks:
    - name: Install packages
      ansible.builtin.apt:
        name: [nginx, curl]
        state: present              # NOT "latest" — see §4

    - name: Deploy config
      ansible.builtin.template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        owner: root
        mode: '0644'
        validate: 'nginx -t -c %s'  # refuse to install a broken config
      notify: Restart nginx

  handlers:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
```

A **playbook** is a list of **plays**; each play maps a set of hosts to **tasks**; each task calls a **module** with arguments. Use **fully qualified collection names** (`ansible.builtin.apt`) — short names are ambiguous once you have collections installed, and FQCNs are the modern standard.

Execution order within a play: `pre_tasks` → `roles` → `tasks` → `post_tasks` → handlers. By default Ansible runs each task on **all hosts** before moving to the next task (the `linear` strategy), which is what makes `serial` a meaningful rolling-deployment control.

---

## 4. Idempotence

**A playbook must be safe to run repeatedly.** The second run should report `changed=0` and do nothing.

Modules achieve this by declaring **desired state** and checking before acting: `apt: state=present` inspects whether the package is installed and only installs if not. That is why Ansible reports `ok` versus `changed` per task — `changed` means it actually modified something.

```
PLAY RECAP
web-01 : ok=12  changed=0  unreachable=0  failed=0     ← converged
```

The subtle killers of idempotence:

- **`state: latest`** on a package. It's *technically* idempotent but not **deterministic** — the same playbook produces different results on different days, and an unattended run can pull a breaking upgrade into production. Pin versions and upgrade deliberately.
- **`shell`/`command`** modules, which cannot know whether the change is needed (§5).
- **`lineinfile`** with a loose regex, which can match different lines on successive runs.
- Anything generating a timestamp, random value or new key into a managed file, which reports `changed` on every run and — if it triggers a handler — restarts services needlessly.

Verify with `--check --diff`: a converged system should show no changes.

---

## 5. Modules vs shell/command

Prefer a module. Modules are idempotent, report `changed` accurately, work in check mode, and return structured data. `shell` and `command` know none of that — they run every time and always report `changed`, which breaks handlers and makes `--check` meaningless.

```yaml
# BAD — runs every time, always reports changed, unusable in check mode
- ansible.builtin.shell: useradd appuser

# GOOD
- ansible.builtin.user:
    name: appuser
    state: present
```

When you genuinely must shell out, make it honest:

```yaml
- name: Build the artifact
  ansible.builtin.command:
    cmd: ./build.sh
    chdir: /opt/app
    creates: /opt/app/dist/bundle.js     # skip if this already exists
  register: build
  changed_when: build.rc == 0 and 'up to date' not in build.stdout
  failed_when: build.rc != 0
  check_mode: false                       # it's safe to skip in check mode
```

`creates` / `removes` give you conditional execution; `changed_when` and `failed_when` let you report truthfully. Also: `command` does **not** run through a shell, so no pipes, redirects or globs — that's a feature, since it avoids shell-injection. Use `shell` only when you need shell features, and quote carefully.

---

## 6. Variables and Precedence

Ansible has 22 levels of variable precedence. The ones worth memorising, **lowest to highest**:

```
role defaults (roles/x/defaults/main.yml)     ← put your defaults HERE
inventory group_vars/all
inventory group_vars/<group>
inventory host_vars/<host>
play vars
role vars (roles/x/vars/main.yml)             ← hard to override; use sparingly
block/task vars
include_vars / set_fact
extra vars (-e)                               ← ALWAYS wins
```

The two practical rules: **`defaults/` is for values consumers should override**, and `vars/` is for values internal to the role that shouldn't be. And `-e` beats everything, which makes it perfect for a one-off override and dangerous as a habit, because it hides where a value came from.

```bash
ansible-playbook site.yml -e "app_version=1.2.3"
ansible-playbook site.yml -e @overrides.yml
```

Debug what a host actually resolved:

```bash
ansible web-01 -m ansible.builtin.debug -a "var=app_port"
ansible-inventory --host web-01
```

---

## 7. Facts

At the start of a play Ansible gathers **facts** — structured data about each host — and exposes them as variables:

```yaml
- ansible.builtin.debug:
    msg: "{{ ansible_facts['distribution'] }} {{ ansible_facts['distribution_version'] }}"

- name: Size workers to the host
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
  vars:
    workers: "{{ ansible_facts['processor_vcpus'] }}"
```

Useful ones: `distribution`, `distribution_major_version`, `os_family`, `processor_vcpus`, `memtotal_mb`, `default_ipv4.address`, `hostname`, `mounts`.

Fact gathering costs a round trip per host, so on large inventories:

```yaml
- hosts: web
  gather_facts: false          # skip when you don't need them
```
```ini
# ansible.cfg
[defaults]
gathering = smart
fact_caching = jsonfile
fact_caching_connection = /tmp/ansible_facts
fact_caching_timeout = 7200
```

`set_fact` creates your own facts at run time; `cacheable: true` persists them. Custom facts can also be dropped on hosts in `/etc/ansible/facts.d/*.fact` and appear under `ansible_local`.

---

## 8. Templates and Handlers

**Jinja2 templates** are how configuration files get host-specific values:

```jinja
# templates/nginx.conf.j2
worker_processes {{ ansible_facts['processor_vcpus'] }};

upstream app {
{% for host in groups['app'] %}
    server {{ hostvars[host]['ansible_default_ipv4']['address'] }}:{{ app_port }};
{% endfor %}
}

{% if enable_tls | default(false) %}
    ssl_certificate {{ tls_cert_path }};
{% endif %}
```

Filters you'll use constantly: `default(x)`, `mandatory`, `to_json`, `to_nice_yaml`, `join(',')`, `bool`, `int`, `regex_replace()`, `combine()`, `dict2items`, `password_hash('sha512')`.

**Handlers** run **once at the end of the play**, only if notified, and only if the notifying task actually reported `changed`:

```yaml
- ansible.builtin.template:
    src: app.conf.j2
    dest: /etc/app.conf
  notify: Restart app          # matches the handler's NAME
```

That design is deliberate: ten tasks touching nginx config produce **one** restart, not ten. Things to know:

- Handlers are notified by **name**; a typo silently does nothing.
- If a later task **fails**, pending handlers don't run — the service keeps the old config. `--force-handlers` overrides, or use `meta: flush_handlers` to run them at a chosen point.
- A handler can itself `notify` another handler.
- `listen:` lets several handlers respond to one notification topic.

---

## 9. Loops, Conditionals and Blocks

```yaml
- name: Create users
  ansible.builtin.user: { name: "{{ item.name }}", groups: "{{ item.groups }}" }
  loop:
    - { name: ana,  groups: sudo }
    - { name: brij, groups: docker }
  loop_control:
    label: "{{ item.name }}"        # keeps output readable

- name: Only on Debian family
  ansible.builtin.apt: { name: nginx }
  when: ansible_facts['os_family'] == 'Debian'

- name: Group related tasks with error handling
  block:
    - ansible.builtin.command: /opt/migrate.sh
  rescue:
    - ansible.builtin.command: /opt/rollback.sh
    - ansible.builtin.fail: { msg: 'migration failed, rolled back' }
  always:
    - ansible.builtin.service: { name: app, state: started }
  when: run_migrations | bool
```

`loop` replaces the old `with_items` family. Note **`when` on a loop is evaluated per item**, and `when` on a block applies to every task inside it. A common trap is that `when` with an undefined variable errors rather than being false — use `when: myvar | default(false) | bool`, and remember a non-empty string like `"false"` is **truthy** unless you pipe it through `| bool`.

---

## 10. Roles and Collections

A **role** is the unit of reuse — a standard directory layout Ansible loads automatically:

```
roles/nginx/
  defaults/main.yml     # overridable defaults (low precedence)
  vars/main.yml         # internal vars (high precedence)
  tasks/main.yml        # entry point
  handlers/main.yml
  templates/
  files/
  meta/main.yml         # dependencies, supported platforms
  molecule/             # tests
```

```yaml
- hosts: web
  roles:
    - common
    - { role: nginx, nginx_port: 8080 }

  tasks:
    - ansible.builtin.include_role: { name: deploy }   # dynamic: honours when/loop
    - ansible.builtin.import_role: { name: deploy }    # static: parsed up front
```

`import_*` is **static** (evaluated at parse time, tags apply to inner tasks); `include_*` is **dynamic** (evaluated at run time, so it can be looped or conditioned). If you need `loop` or a run-time `when`, you need `include_`.

**Collections** are the modern distribution format, bundling roles, modules and plugins under a namespace:

```bash
ansible-galaxy collection install community.postgresql amazon.aws
```
```yaml
# requirements.yml — commit this and install in CI
collections:
  - name: amazon.aws
    version: ">=8.0.0"
roles:
  - name: geerlingguy.nginx
    version: 3.1.4
```

Pin versions and test roles with **Molecule**, which spins up a container, applies the role, then applies it again to assert idempotence.

---

## 11. Secrets — Ansible Vault

```bash
ansible-vault create   group_vars/production/vault.yml
ansible-vault edit     group_vars/production/vault.yml
ansible-vault encrypt_string 'super-secret' --name 'db_password'
ansible-vault rekey    group_vars/production/vault.yml
ansible-playbook site.yml --vault-password-file ~/.vault_pass
```

Vault encrypts files (or single strings) with AES256, so secrets can live in git safely.

The convention that makes Vault workable: keep encrypted variables in a **separate file with prefixed names** and reference them from plain files.

```yaml
# group_vars/production/vault.yml   (encrypted)
vault_db_password: hunter2

# group_vars/production/vars.yml    (plaintext, reviewable)
db_password: "{{ vault_db_password }}"
```

Why: an encrypted file is an opaque blob in code review — you can't see *which* variables changed. This way the plaintext file documents the structure and the encrypted one holds only values. Use **multiple vault IDs** (`--vault-id prod@prompt`) so staging and production secrets have different keys, never commit the vault password itself, and remember Vault protects **at rest** only — a secret still reaches the target host and can appear in output unless the task is marked `no_log: true`.

```yaml
- name: Configure the database
  ansible.builtin.template: { src: db.conf.j2, dest: /etc/db.conf }
  no_log: true                 # keeps the value out of logs and callbacks
```

---

## 12. Safety: Check Mode, Diff and Tags

```bash
ansible-playbook site.yml --check --diff        # dry run, show file changes
ansible-playbook site.yml --limit web-01        # one host first — always
ansible-playbook site.yml --tags nginx
ansible-playbook site.yml --skip-tags slow
ansible-playbook site.yml --start-at-task "Deploy config"
ansible-playbook site.yml --list-hosts --list-tasks
ansible-playbook site.yml -vvv                  # -vvvv includes connection debug
```

`--check` is Ansible's closest equivalent to `terraform plan`, but it is **weaker**: modules must implement check mode, `shell`/`command` are skipped by default, and any task whose result depends on an earlier task's *actual* change will report inaccurately. So a clean `--check` is reassurance, not proof.

The rollout discipline that gets asked about: `--check --diff` first, then `--limit` one canary host, then `serial: 2` or a percentage for a rolling wave, with `max_fail_percentage` so a bad batch halts the play instead of marching through the fleet.

---

## 13. Error Handling

```yaml
- ansible.builtin.command: /opt/optional.sh
  ignore_errors: true                       # continue even on failure

- ansible.builtin.command: /opt/check.sh
  register: result
  failed_when: result.rc not in [0, 2]      # rc 2 means "nothing to do" here
  changed_when: result.rc == 0

- ansible.builtin.uri:
    url: "http://{{ inventory_hostname }}:{{ app_port }}/healthz"
  register: health
  retries: 10
  delay: 3
  until: health.status == 200                # wait for readiness

- ansible.builtin.wait_for: { port: 8080, timeout: 60 }
- ansible.builtin.assert:
    that: [ "app_version is defined", "app_version is match('^\\d+\\.\\d+')" ]
    fail_msg: "app_version must be set to a semver-ish string"
```

By default a failed task removes that **host** from the rest of the play while other hosts continue. `any_errors_fatal: true` aborts the whole play on any host's failure; `max_fail_percentage` sets a threshold. Prefer `failed_when` over `ignore_errors`, because `ignore_errors` hides real failures — including ones you didn't anticipate.

---

## 14. Performance

Ansible's default settings are conservative, and a slow playbook is usually configuration rather than fate:

```ini
# ansible.cfg
[defaults]
forks = 50                    # parallel hosts (default 5 — the biggest single win)
gathering = smart
fact_caching = jsonfile
fact_caching_connection = /tmp/ansible_facts
fact_caching_timeout = 7200
callbacks_enabled = profile_tasks     # shows where the time actually goes

[ssh_connection]
pipelining = True             # fewer SSH round trips per task (needs no requiretty)
control_path = /tmp/.ansible-%%h-%%r
ssh_args = -o ControlMaster=auto -o ControlPersist=60s
```

In order of impact: raise **`forks`** (5 is the default and it is the usual bottleneck), enable **`pipelining`** (removes an SSH round trip per task by not writing the module to a temp file), **cache facts** or skip gathering, and only then look at task design. `strategy: free` lets each host race ahead independently instead of waiting for the slowest host at every task — good for independent work, wrong when ordering across hosts matters. Use `profile_tasks` to measure before tuning; the answer is frequently one slow `shell` task or unnecessary fact gathering.

At a few thousand hosts, one control node fanning out over SSH becomes the limit — that's the point to move to AWX / Ansible Automation Platform with distributed execution nodes.

---

## 15. Ansible vs the Alternatives

| Aspect | Ansible | Terraform | Puppet / Chef |
|---|---|---|---|
| Purpose | **configuration management** | **provisioning** | configuration management |
| Model | procedural tasks, converging | declarative + state | declarative |
| Agent | **agentless** (SSH) | n/a | agent on every host |
| State | **stateless** | state file | agent-side catalog |
| Enforcement | only when you run it | only when you apply | **continuous**, on a timer |
| Language | YAML + Jinja2 | HCL | Puppet DSL / Ruby |
| Learning curve | low | moderate | higher |

**Ansible and Terraform are complements.** Terraform creates the VM, the network and the load balancer (declarative, state-tracked, knows how to destroy). Ansible installs packages, templates configuration and restarts services on hosts that already exist. Using Terraform `provisioner` blocks for configuration is explicitly a last resort — they run only at create time and aren't tracked; using Ansible to create cloud infrastructure is possible (there are AWS modules) but you lose the dependency graph, the plan step and the ability to cleanly destroy.

Versus **Puppet/Chef**: Ansible's agentless push model is far easier to adopt and needs nothing on the hosts, but it gives **no continuous enforcement** — drift persists until the next run, whereas a Puppet agent re-converges every 30 minutes.

And in a container world, much of Ansible's traditional job disappears: an immutable image built by a `Dockerfile` plus Kubernetes replaces per-host configuration management. Ansible's enduring niches are provisioning the hosts *under* the cluster, network and appliance automation, and legacy or on-premise fleets.

---

## 16. Interview Questions and Answers

**Q1: How does Ansible work, and what does "agentless" buy and cost you?**

A control node connects to targets over SSH (or WinRM for Windows), copies a small module program, executes it, collects JSON output and deletes it — so managed hosts need only Python and SSH access. What that buys: **nothing to install, patch or monitor on the fleet**, which removes an entire operational surface compared with Puppet or Chef agents, and makes adoption on existing servers trivial. What it costs: **no continuous enforcement**, because configuration only converges when someone runs a playbook, so drift persists between runs unless you schedule them or use AWX; the control node needs credentials and network reach to everything, making it a high-value target; and scale is bounded by SSH fan-out from one machine rather than by an agent fleet. Ansible is also **stateless** — it records nothing between runs and reads live host state each time, which is why there's no `plan`/`apply` split.

**Q2: What is idempotence and how does Ansible achieve it?**

Idempotence means running the playbook repeatedly is safe: after the first convergent run, further runs change nothing and report `changed=0`. Ansible achieves it because modules take **desired state** and check before acting — `apt: state=present` inspects whether the package is installed and only installs if it isn't — which is also why every task reports `ok` versus `changed`. The things that quietly break it are worth naming: **`shell`/`command`** can't know whether the change is needed, so they run every time and always report `changed`; **`lineinfile`** with a loose regex can match different lines on successive runs; and anything writing a timestamp or freshly generated value into a managed file reports `changed` forever and, if it notifies a handler, restarts services on every run. I'd also flag **`state: latest`** as technically idempotent but non-deterministic, which is worse in production.

**Q3: Why prefer modules over `shell` and `command`, and how do you make a shell task well-behaved?**

Modules are idempotent, report `changed` accurately, work in `--check` mode and return structured data; `shell` and `command` do none of that, so they execute unconditionally, always report `changed` — which breaks handlers by triggering restarts every run — and make check mode meaningless. When shelling out is genuinely necessary, make it honest: use **`creates`** or `removes` so it skips when the work is already done, **`changed_when`** to report truthfully based on return code or output, **`failed_when`** to define real failure, and `check_mode: false` if it's safe to skip during a dry run. Also prefer `command` over `shell`: `command` doesn't invoke a shell, so there are no pipes, globs or redirects and therefore no shell-injection risk — reach for `shell` only when you actually need shell features.

**Q4: Explain handlers, and the two ways they surprise people.**

A handler is a task that runs **once at the end of the play**, only if notified, and only if the notifying task actually reported `changed`. That means ten tasks all touching nginx configuration produce a single restart instead of ten, which is exactly what you want. The first surprise is that handlers are matched **by name**, so a typo in `notify` silently does nothing at all — no error, no restart, and a service left running stale config. The second is that if a **later task in the play fails, pending handlers never run**, so a config change is written to disk but the service is never restarted, leaving the host in a half-applied state; `--force-handlers` or an explicit `meta: flush_handlers` at a chosen point addresses that. Worth adding that handlers can notify other handlers, and `listen:` lets several handlers subscribe to one topic.

**Q5: How does variable precedence work, and where should defaults live?**

There are 22 levels; the ones that matter, lowest to highest, are role `defaults/` → inventory `group_vars/all` → `group_vars/<group>` → `host_vars/<host>` → play vars → role `vars/` → task vars → `set_fact`/`include_vars` → **extra vars (`-e`)**, which always wins. The practical rule is that **`defaults/main.yml` is for values consumers are meant to override** — it's deliberately the lowest precedence — while `vars/main.yml` is for values internal to the role, and because it outranks inventory it's hard to override, so use it sparingly. `-e` beating everything makes it ideal for a one-off (`-e app_version=1.2.3`) and a bad habit in scripts, because it obscures where a value came from. When a value is unexpectedly wrong, `ansible-inventory --host <h>` and a `debug` task show what actually resolved.

**Q6: How do you manage secrets in Ansible?**

With **Ansible Vault**, which encrypts files or individual strings with AES256 so they can live in git. The convention that makes it usable in practice is to keep encrypted values in a separate `vault.yml` with prefixed names — `vault_db_password` — and reference them from a plaintext `vars.yml` as `db_password: "{{ vault_db_password }}"`. The reason is code review: an encrypted file is an opaque blob, so you cannot see which variables changed, whereas this split keeps the structure reviewable and only the values encrypted. Use **separate vault IDs** for staging and production so one key doesn't unlock everything, never commit the vault password, and use `--vault-password-file` or an external secret manager in CI. Two limits to state: Vault protects **at rest only** — the secret still reaches the host — and any task handling it should carry `no_log: true`, or the value can appear in output and callback plugins.

**Q7: How do you roll out a change safely to a large fleet?**

Layer the controls. Start with `--check --diff` for a dry run, then `--limit web-01` to prove it on a single canary, then a rolling wave with **`serial: 2`** (or a percentage) so only part of the fleet is touched at a time, with **`max_fail_percentage`** so a bad batch halts the play instead of marching through everything. Add readiness verification between batches — an `uri` task with `retries`/`until` against a health endpoint, or `wait_for` on a port — so you don't proceed past a host that came back broken. Use `validate:` on template tasks (`nginx -t -c %s`) so a syntactically invalid config is never installed. And be honest about `--check`'s limits: modules must implement it, `shell`/`command` are skipped, and results that depend on earlier real changes report inaccurately — so a clean check is reassurance, not proof.

**Q8: How do you speed up a slow Ansible run?**

Measure first with the `profile_tasks` callback, because the answer is usually one slow task or unnecessary fact gathering rather than Ansible itself. Then, in order of impact: raise **`forks`** from its default of 5, which is the single most common bottleneck on any sizeable inventory; enable **`pipelining`**, which removes an SSH round trip per task by not writing the module to a temp file; **cache facts** (`gathering = smart` plus `fact_caching`) or set `gather_facts: false` on plays that don't need them; and enable SSH `ControlPersist` for connection reuse. Beyond configuration, `strategy: free` lets each host progress independently instead of waiting for the slowest host at every task — appropriate for independent work, wrong when cross-host ordering matters. At a few thousand hosts a single control node's SSH fan-out becomes the ceiling, which is the point to adopt AWX with distributed execution nodes.

**Q9: How do Ansible and Terraform fit together?**

They solve adjacent problems and are complements. **Terraform provisions**: it is declarative, tracks state, builds a dependency graph, and knows how to destroy what it created — so it creates the VMs, networks, load balancers and managed databases. **Ansible configures**: it is procedural and stateless, connecting to hosts that already exist to install packages, template configuration files and restart services. The idiomatic pipeline is Terraform to create infrastructure, then Ansible (or a pre-baked image) to configure it, often driven by Ansible's dynamic inventory reading the cloud provider so it discovers whatever Terraform just built. I'd avoid the two anti-patterns: Terraform `provisioner` blocks for configuration, since they run only at create time, aren't tracked in state and taint the resource on failure; and using Ansible to create cloud infrastructure, which sacrifices the plan step, the dependency graph and clean teardown.

**Q10: Is Ansible still relevant with containers and Kubernetes?**

Less than it was, and it's worth saying so directly. Immutable images built from a `Dockerfile` plus Kubernetes managing rollout replaces most traditional per-host configuration management: you no longer converge a long-lived server's state, you replace the whole artifact. Where Ansible remains genuinely useful is **provisioning the hosts underneath the cluster** (bootstrapping nodes, kernel and kubelet configuration), **network and appliance automation** where there is no container option — switches, routers, firewalls, load balancers all have Ansible collections — **legacy and on-premise fleets** that aren't containerised, and **orchestrating operational runbooks** such as patching waves, certificate rotation and controlled restarts. So the honest positioning is that Ansible has moved from "how you configure servers" to "how you automate the things that aren't containers", plus a very low-friction ad-hoc tool for fleet-wide operations.

---

## 17. Tricky Questions

**Q1: Your playbook reports `changed=7` on every run even though nothing on the host differs. Why does that matter, and what causes it?**

**It means the playbook isn't idempotent, and the practical damage is spurious handler runs — services restarting on every deploy for no reason.** The usual causes: `shell`/`command` tasks, which execute unconditionally and always report `changed` because they cannot know whether the change was needed; a `template` whose output includes a timestamp, a random value or a re-generated key, so the file genuinely differs each run; `lineinfile` with a regex loose enough to match a different line each time; and `file` tasks re-asserting a mode or owner that something else keeps changing back. It matters beyond aesthetics: `changed` is the signal handlers key off, so a falsely-changed config task restarts nginx on every run, and it destroys your ability to use `changed=0` as a "converged" assertion or to spot real drift. Fix by using proper modules, and where you must shell out, adding `creates`/`removes` and an accurate `changed_when`.

**Q2: A task writes a new config file successfully, but the service is still running the old configuration after the playbook finishes with no errors reported for that task. What happened?**

**A later task in the play failed, so the pending handler never ran.** Handlers are deferred to the end of the play, and if any subsequent task fails on that host, Ansible stops processing it and the queued `Restart nginx` is silently dropped — the file is on disk, the service is stale, and the failure message points at an unrelated task. The other candidate is a **`notify` name that doesn't match the handler's name**, which fails completely silently: no error, no restart. Fixes: use `--force-handlers` (or `force_handlers: true`) so notified handlers run even after a failure, insert `meta: flush_handlers` at a safe point to apply restarts before risky later work, and add `validate:` to template tasks so a broken config can't be installed at all. This is also why a health check with `retries`/`until` after a deploy is worth having — it catches the half-applied state that no task reported as an error.

**Q3: `when: enable_feature` skips on some hosts and runs on others, and the variable is the string `"false"` everywhere. Why?**

**A non-empty string is truthy in Jinja2, so `"false"` evaluates as true — and the hosts that skipped had the variable set as a real boolean.** Ansible variables come from many sources with different types: YAML `enable_feature: false` is a genuine boolean, whereas a value from an environment variable, a `-e` command-line override, or an inventory INI file arrives as the **string** `"false"`, which is truthy because it has length. So the same condition behaves differently depending on where the value came from. The fix is to coerce explicitly: `when: enable_feature | default(false) | bool`, which correctly interprets `"false"`, `"no"`, `"0"` and `false`. The related trap is that referencing an **undefined** variable in `when` raises an error rather than being falsy, which is why `| default(false)` belongs there too. Ansible's INI inventory and `-e` are the two most common sources of accidental strings.

**Q4: `--check` passes cleanly, but the real run fails partway through. Why isn't check mode a reliable plan?**

**Because check mode is a per-module best effort, not a simulation of the whole run.** Three distinct reasons. Modules must **implement** check mode; those that don't are skipped, so their effects are invisible. `shell` and `command` are **skipped by default**, which means any logic they perform — and any file they create — doesn't happen, so later tasks that depend on it can't be evaluated properly. And crucially, tasks whose behaviour depends on an earlier task's **actual** change report inaccurately: if step one would create a directory, check mode doesn't create it, so step two's "does this path exist" logic evaluates against the wrong world and may report no change where the real run will act. Unlike `terraform plan`, there is no dependency graph and no recorded state to diff against — Ansible is stateless. So treat a clean `--check --diff` as useful reassurance, and rely on `--limit` canary runs plus `serial` rollouts for actual safety.

**Q5: You add a role to `roles:` and give it `when: install_nginx`, but the tasks run anyway on hosts where the variable is false. What's going on?**

**`when` on a role in the `roles:` list is applied to each of the role's tasks individually, and any task that overrides or ignores the condition — or any `import_tasks` evaluated at parse time — can still execute.** More practically, the common version of this bug is the static-versus-dynamic distinction: `import_role` and `import_tasks` are processed at **parse** time, so tags and conditionals attach to the inner tasks rather than gating the inclusion, whereas `include_role`/`include_tasks` are resolved at **run** time and can genuinely be skipped or looped. So if you need a run-time condition or a loop around a whole role, use `include_role` with `when`, not `import_role`. Two related consequences worth knowing: you cannot `loop` over an `import_`, and tags behave differently between the two — `--tags` will match tasks inside an `import_` but the include itself must carry the tag for a dynamic include to be selected at all.

---

## 18. Cheat Sheet

**Model**

1. Agentless, push-based, over SSH/WinRM. Hosts need only Python + SSH.
2. **Stateless** — nothing recorded between runs; reads live state each time.
3. No continuous enforcement: drift persists until you run again.
4. Ansible **configures**; [Terraform](/devops/terraform) **provisions**.

**Structure**

5. Playbook → plays → tasks → modules. Handlers at the end.
6. Order: `pre_tasks` → `roles` → `tasks` → `post_tasks` → handlers.
7. Use **FQCNs** (`ansible.builtin.apt`).
8. Default strategy is `linear`: every host completes a task before the next.

**Idempotence**

9. A converged run reports **`changed=0`**.
10. `state: present` over `state: latest` — latest isn't deterministic.
11. `shell`/`command` always report `changed` — they break handlers.
12. Make shell tasks honest: `creates`, `changed_when`, `failed_when`.
13. `command` doesn't use a shell (no pipes/globs) — safer than `shell`.

**Variables**

14. Precedence low→high: role `defaults` → `group_vars` → `host_vars` → play vars → role `vars` → task vars → `set_fact` → **`-e`**.
15. `defaults/` = meant to be overridden. `vars/` = internal, hard to override.
16. `-e` always wins — great for one-offs, bad as a habit.
17. `ansible-inventory --host <h>` to see what resolved.
18. Coerce booleans: `| default(false) | bool` — `"false"` is **truthy**.
19. An undefined variable in `when` **errors**, it isn't falsy.

**Facts**

20. Gathered per play; cost a round trip per host.
21. `gather_facts: false` when unused; `gathering = smart` + `fact_caching`.
22. `set_fact` for your own; `cacheable: true` to persist.

**Handlers**

23. Run **once**, at the end, only if notified by a **changed** task.
24. Matched by **name** — a typo fails silently.
25. A later task failing means pending handlers **never run**.
26. `--force-handlers` or `meta: flush_handlers` to control that.
27. `validate:` on templates so broken config is never installed.

**Roles**

28. `defaults/ vars/ tasks/ handlers/ templates/ files/ meta/`.
29. `import_*` = static (parse time); `include_*` = dynamic (run time).
30. Loops and run-time conditions require `include_`.
31. Collections via `ansible-galaxy`; pin versions in `requirements.yml`.
32. Test roles with **Molecule** — it applies twice to prove idempotence.

**Secrets**

33. Vault encrypts files/strings with AES256.
34. Split `vault_*` values from a plaintext `vars.yml` so diffs stay reviewable.
35. Separate vault IDs per environment; never commit the password.
36. Vault is **at rest only** — add `no_log: true` on tasks handling secrets.

**Safety**

37. `--check --diff` → `--limit` canary → `serial:` rolling wave.
38. `max_fail_percentage` and `any_errors_fatal` to bound damage.
39. `--check` is weaker than `terraform plan`: modules must support it, `shell` is skipped.
40. Prefer `failed_when` over `ignore_errors`.
41. Health-check with `uri` + `retries`/`until` between batches.

**Performance**

42. Raise **`forks`** (default 5) — the usual bottleneck.
43. Enable **`pipelining`** — one fewer SSH round trip per task.
44. Cache facts; enable SSH `ControlPersist`.
45. `strategy: free` when hosts are independent.
46. Measure with the `profile_tasks` callback before tuning.

---

## 19. References

- [Ansible Documentation](https://docs.ansible.com/ansible/latest/) — the primary source.
- [Best Practices / Tips and tricks](https://docs.ansible.com/ansible/latest/tips_tricks/ansible_tips_tricks.html)
- [Variable precedence](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#variable-precedence-where-should-i-put-a-variable)
- [Handlers](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_handlers.html) and [Blocks](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_blocks.html)
- [Ansible Vault](https://docs.ansible.com/ansible/latest/vault_guide/index.html)
- [Roles](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html) and [Collections](https://docs.ansible.com/ansible/latest/collections_guide/index.html)
- [Dynamic inventory](https://docs.ansible.com/ansible/latest/inventory_guide/intro_dynamic_inventory.html)
- [Molecule](https://ansible.readthedocs.io/projects/molecule/) for role testing.
