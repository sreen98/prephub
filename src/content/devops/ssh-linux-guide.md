# SSH & Linux Server Administration — Interview Guide

The skills that sit under every other DevOps tool. [Ansible](/devops/ansible) rides on SSH, [Terraform](/devops/terraform) provisions the hosts, [Docker](/backend/docker-kubernetes) runs on them — and when something breaks at 3am you are on a shell.

The two things interviews actually test: **can you explain SSH key authentication precisely** (§2), and **can you diagnose a sick server methodically** (§11).

## Table of Contents

1. [How SSH Works](#1-how-ssh-works)
2. [Key-Based Authentication](#2-key-based-authentication)
3. [ssh_config](#3-ssh_config)
4. [ssh-agent and Agent Forwarding](#4-ssh-agent-and-agent-forwarding)
5. [Bastion and Jump Hosts](#5-bastion-and-jump-hosts)
6. [Port Forwarding and Tunnels](#6-port-forwarding-and-tunnels)
7. [File Transfer](#7-file-transfer)
8. [Hardening sshd](#8-hardening-sshd)
9. [Troubleshooting SSH](#9-troubleshooting-ssh)
10. [Processes and systemd](#10-processes-and-systemd)
11. [Diagnosing a Sick Server](#11-diagnosing-a-sick-server)
12. [Logs](#12-logs)
13. [Users, Permissions and sudo](#13-users-permissions-and-sudo)
14. [Text Processing](#14-text-processing)
15. [Networking Tools](#15-networking-tools)
16. [Disk and Filesystem](#16-disk-and-filesystem)
17. [tmux](#17-tmux)
18. [Interview Questions & Answers](#18-interview-questions-answers)
19. [Tricky Questions](#19-tricky-questions)
20. [Cheat Sheet](#20-cheat-sheet)
21. [References](#21-references)

---

## 1. How SSH Works

SSH gives you an encrypted, authenticated channel over an untrusted network. A connection has three phases:

```
1. Key exchange     → negotiate ciphers, do a Diffie–Hellman exchange
                       → derive a shared session key (symmetric, per session)
2. Server auth      → server proves it holds the private half of its HOST KEY
                       → client checks it against ~/.ssh/known_hosts
3. Client auth      → publickey / password / keyboard-interactive
```

Two distinct key pairs are involved, and conflating them is the classic misunderstanding:

- The **host key** identifies the *server*. It is what `known_hosts` records, and it is how you detect a man-in-the-middle.
- Your **user key** identifies *you*, in phase 3.

```
The authenticity of host 'web-01 (10.0.1.5)' can't be established.
ED25519 key fingerprint is SHA256:abc123...
```

That prompt is the **only** point at which MITM is detectable, which is why blindly typing "yes" — or worse, scripting `StrictHostKeyChecking=no` — removes SSH's server-authentication guarantee entirely. In automation, pre-seed `known_hosts` from a trusted source, or use `ssh-keyscan` at image-build time and ship the result.

Forward secrecy comes from the per-session key: recording traffic and later stealing the host key does not decrypt past sessions.

---

## 2. Key-Based Authentication

```bash
ssh-keygen -t ed25519 -C "ana@laptop"          # modern default: small, fast, secure
ssh-keygen -t rsa -b 4096 -C "ana@laptop"      # only for old servers
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@host # appends to remote authorized_keys
```

**How it works** — the answer interviewers want:

1. You generate a **key pair**. The private key never leaves your machine.
2. The **public** key is appended to `~/.ssh/authorized_keys` on the server.
3. On connect, the server sends a challenge; your client **signs** it with the private key.
4. The server verifies the signature against the stored public key.

**Your private key is never transmitted** — that is the whole point, and it is why key auth is strictly better than passwords: nothing reusable crosses the wire, there is nothing to brute-force, and the key can be passphrase-protected at rest.

**Prefer Ed25519** over RSA: shorter keys, faster, no parameter-choice footguns. RSA is fine at 4096 bits if you must interoperate with something ancient. DSA and ssh-rsa with SHA-1 are dead.

**Permissions are enforced and are the #1 self-inflicted failure:**

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519         # private key
chmod 644 ~/.ssh/id_ed25519.pub
chmod 600 ~/.ssh/authorized_keys
chown -R user:user ~/.ssh
```

`sshd` **silently refuses** keys if `~/.ssh` or `authorized_keys` are group- or world-writable, or if the home directory itself is writable by others (`StrictModes`). You get "Permission denied (publickey)" with no explanation on the client — the reason is only in the server log.

At scale, distributing `authorized_keys` files does not work. **SSH certificates** (an SSH CA signing short-lived user certificates) or a broker like Teleport give you central issuance, expiry and revocation without touching every host.

---

## 3. ssh_config

`~/.ssh/config` is the single highest-value SSH thing to know:

```
Host *
    ServerAliveInterval 60          # keep NAT/firewall from dropping idle sessions
    ServerAliveCountMax 3
    AddKeysToAgent yes
    HashKnownHosts yes

Host bastion
    HostName bastion.example.com
    User ana
    IdentityFile ~/.ssh/id_ed25519
    ControlMaster auto              # reuse one TCP connection…
    ControlPath ~/.ssh/cm-%r@%h:%p  # …across subsequent sessions
    ControlPersist 10m

Host prod-*
    ProxyJump bastion               # everything prod-* goes via the bastion
    User deploy
    IdentitiesOnly yes              # don't offer every key in the agent
```

```bash
ssh prod-web-01     # → jumps through bastion as deploy, with the right key
```

Two options worth calling out. **`ControlMaster`/`ControlPersist`** multiplex sessions over one TCP connection, which makes repeated `ssh`/`scp` calls near-instant — and is exactly why Ansible's `pipelining` plus `ControlPersist` gives such a large speedup. **`IdentitiesOnly yes`** stops your client offering every key in the agent; without it, a server with `MaxAuthTries 3` can reject you before it reaches the right key, producing a baffling "too many authentication failures".

---

## 4. ssh-agent and Agent Forwarding

`ssh-agent` holds decrypted private keys in memory so you type a passphrase once:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
ssh-add -l              # list loaded keys
ssh-add -D              # drop all
ssh-add -t 3600 key     # auto-expire after an hour
```

**Agent forwarding** (`ssh -A`, `ForwardAgent yes`) lets a remote host use your local agent to authenticate onward — convenient for `git pull` on a server without putting a key there.

**It is also a real security risk, and this is a favourite interview question.** When you forward your agent, the remote host gets a socket it can use to sign challenges with your keys. **Anyone with root on that host — or any process running as your user — can use your agent to authenticate as you to anything your keys open**, for as long as your session lasts. They cannot copy the key, but they don't need to.

So: don't forward to hosts you don't fully trust, and prefer **`ProxyJump`** (§5), which tunnels through the intermediate host without exposing your agent to it. If you must forward, scope it per-host in config rather than globally, and use `ssh-add -c` to require confirmation on each use.

---

## 5. Bastion and Jump Hosts

The standard pattern: private hosts have no public IP, and all access flows through one hardened, audited **bastion**.

```bash
ssh -J bastion.example.com deploy@10.0.1.5      # ProxyJump, one hop
ssh -J bastion1,bastion2 deploy@10.0.1.5        # chained
```

`ProxyJump` (`-J`) is the modern answer and supersedes the old `ProxyCommand ssh -W %h:%p bastion` incantation. The important property: the connection to the final host is **end-to-end encrypted through** the bastion — the bastion forwards TCP but cannot read the session or use your keys. That is precisely why it is safer than `ssh -A` plus a second `ssh`.

Bastion hygiene: key-only auth, MFA, session logging, tight security-group rules, no long-lived credentials on it, and short-lived SSH certificates rather than static `authorized_keys`. Managed equivalents remove the host entirely — **AWS Systems Manager Session Manager** gives you shell access with IAM authorisation and CloudTrail auditing and **no open inbound port at all**, which is strictly better than a bastion when you are on AWS.

---

## 6. Port Forwarding and Tunnels

Three directions, and mixing them up is a common interview stumble:

```bash
# LOCAL (-L): my port → through the server → to a target
ssh -L 5433:db.internal:5432 bastion
#   psql -h localhost -p 5433   → reaches db.internal:5432 privately

# REMOTE (-R): a port on the server → back through me → to a target
ssh -R 8080:localhost:3000 public-host
#   someone hitting public-host:8080 reaches my local dev server

# DYNAMIC (-D): a local SOCKS proxy, routing arbitrary traffic through the server
ssh -D 1080 bastion
#   set the browser's SOCKS proxy to localhost:1080
```

Mnemonic: **`-L` brings a remote service to you; `-R` exposes your service remotely; `-D` makes the server a proxy.**

Useful flags: `-N` (no remote command — just the tunnel), `-f` (background), `-T` (no TTY). So `ssh -fNL 5433:db:5432 bastion` is the idiomatic "open a tunnel and get my prompt back".

Note `-R` on a public host binds to loopback unless the server sets `GatewayPorts yes` — a deliberate default, because remote forwarding is an easy way to accidentally expose an internal service to the internet.

---

## 7. File Transfer

```bash
scp file.txt user@host:/path/                # simple, no resume, deprecated protocol
rsync -avz --progress file.txt user@host:/path/
rsync -avz --delete ./dist/ user@host:/var/www/   # mirror; note trailing slashes
sftp user@host                               # interactive
tar czf - ./dir | ssh host 'tar xzf - -C /dest'    # stream, no temp files
```

**Prefer `rsync`.** It transfers only differences, resumes, preserves permissions and timestamps, can delete extraneous files to mirror a directory, and shows progress. `scp` re-copies everything and its underlying protocol is deprecated (modern OpenSSH `scp` actually uses SFTP internally).

The `rsync` trailing-slash rule causes real accidents: `rsync -a src/ dest/` copies the *contents* of `src` into `dest`, while `rsync -a src dest/` copies the *directory* to `dest/src`. Always `--dry-run` first when `--delete` is involved.

---

## 8. Hardening sshd

```
# /etc/ssh/sshd_config
PermitRootLogin no                 # or prohibit-password
PasswordAuthentication no          # keys only — the single biggest win
PubkeyAuthentication yes
ChallengeResponseAuthentication no
AllowGroups ssh-users              # allow-list, not deny-list
X11Forwarding no
AllowAgentForwarding no            # unless genuinely needed
MaxAuthTries 3
LoginGraceTime 20
ClientAliveInterval 300
ClientAliveCountMax 2
Protocol 2
```

```bash
sshd -t                            # ALWAYS validate before restarting
systemctl reload sshd              # reload, don't restart, to keep sessions
```

Two operational rules. **Validate with `sshd -t` and keep your existing session open** while you test a new one from a second terminal — locking yourself out of a remote host with a bad `sshd_config` and no console access is a genuinely unrecoverable mistake on some providers. And **`reload` rather than `restart`** so current sessions survive.

Beyond the config: `fail2ban` to throttle brute force, changing the port only reduces log noise (it is not security), and firewall rules restricting source ranges do far more than any `sshd` setting. Prefer **certificates over `authorized_keys`** at scale so access expires automatically.

---

## 9. Troubleshooting SSH

```bash
ssh -v host        # -vv, -vvv for more; shows which keys are offered and rejected
```

| Symptom | Usual cause |
|---|---|
| `Permission denied (publickey)` | wrong key offered, key not in `authorized_keys`, or **file permissions** (§2) |
| `Too many authentication failures` | agent offering many keys — set `IdentitiesOnly yes` |
| `Connection refused` | `sshd` not running, or wrong port |
| `Connection timed out` | firewall / security group / wrong IP — a network problem, not SSH |
| `Host key verification failed` | host rebuilt, or a genuine MITM — verify before removing the entry |
| Hangs after banner | DNS reverse-lookup on the server (`UseDNS no`), or MTU issues |
| Drops when idle | NAT timeout — `ServerAliveInterval` |

The discriminator worth stating: **refused means something answered and said no** (reached the host, no listener) while **timed out means nothing answered** (blocked before arrival) — so the first is an `sshd`/port problem and the second is a firewall or routing problem. Client-side `-v` shows what the client did; the reason for a rejection is usually only in the **server's** `/var/log/auth.log` or `journalctl -u sshd`.

---

## 10. Processes and systemd

```bash
systemctl status nginx             # is it running, recent logs, PID
systemctl start|stop|restart|reload nginx
systemctl enable --now nginx       # start now AND at boot
systemctl list-units --failed      # what's broken
systemctl daemon-reload            # after editing a unit file
journalctl -u nginx -f --since "10 min ago"
```

**`enable` ≠ `start`.** `enable` makes it boot-persistent, `start` runs it now — forgetting `enable` is why a service comes back after a reboot only in staging where someone remembered.

A minimal unit:

```ini
# /etc/systemd/system/app.service
[Unit]
Description=App API
After=network-online.target

[Service]
Type=simple
User=app
WorkingDirectory=/srv/app
EnvironmentFile=/etc/app/env
ExecStart=/usr/bin/node /srv/app/dist/server.js
Restart=on-failure
RestartSec=5
# hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/srv/app/tmp

[Install]
WantedBy=multi-user.target
```

Process inspection:

```bash
ps aux --sort=-%mem | head        # top memory consumers
pgrep -af node                    # find by name, with full command line
kill -TERM <pid>                  # ask nicely (15) — the default
kill -KILL <pid>                  # force (9) — no cleanup, last resort
kill -HUP <pid>                   # many daemons reload config on HUP
nice / renice / ionice            # CPU and IO priority
```

`SIGTERM` lets a process flush and close cleanly; `SIGKILL` cannot be caught, so buffers are lost and locks may be left behind. Always TERM first — this is the same reasoning as container `stopGracePeriod` and Kubernetes `terminationGracePeriodSeconds`.

---

## 11. Diagnosing a Sick Server

A methodical order beats guessing, and this sequence is a common interview exercise.

```bash
# 1. Load and overall shape
uptime                     # load average: 1 / 5 / 15 min
top -o %CPU                # or htop

# 2. CPU
mpstat -P ALL 1            # per-core; %iowait vs %sys vs %usr
ps aux --sort=-%cpu | head

# 3. Memory
free -h                    # look at "available", not "free"
ps aux --sort=-%rss | head
dmesg -T | grep -i oom     # was anything OOM-killed?

# 4. Disk
df -h                      # space
df -i                      # INODES — full inodes look like a full disk
iostat -xz 1               # %util, await
du -xh /var --max-depth=1 | sort -h

# 5. Network
ss -tulpn                  # what's listening
ss -s                      # socket summary
ss -tan state time-wait | wc -l

# 6. Logs
journalctl -p err --since "1 hour ago"
```

Interpretation notes that separate a real answer from a tool list:

- **Load average is per-runnable-task, not a percentage.** Compare it to core count: load 4 on 4 cores is saturated; load 4 on 32 cores is idle. On Linux load **includes tasks blocked on I/O**, so high load with low CPU means you are I/O-bound.
- **`free` is misleading.** Linux uses spare RAM as page cache by design, so low "free" is healthy — read **`available`**.
- **High `%iowait`** points at disk or network storage, not CPU.
- **`df -h` full but nothing large?** Check **`df -i`** for inode exhaustion, and check for **deleted-but-open files** with `lsof +L1` — a rotated log still held by a process consumes space invisible to `du`.
- **OOM kills** appear in `dmesg`, not in your app log; the app just vanishes.
- Steal time (`%st` in `top`) on a VM means the hypervisor is busy — your neighbour's problem, not yours.

---

## 12. Logs

```bash
journalctl -u app -f                  # follow one unit
journalctl -p err -b                  # errors since boot
journalctl --since "2026-09-08 10:00" --until "10:15"
journalctl --disk-usage / --vacuum-time=7d
tail -f /var/log/nginx/error.log
```

Traditional files live in `/var/log` (`syslog`/`messages`, `auth.log`/`secure`, `nginx/`), and **journald is binary** — `grep` on the file won't work, use `journalctl`.

Two practical points. **Log rotation** via `logrotate` is what stops logs filling the disk, and its `copytruncate` versus `create` choice matters: with `create`, a process holding the old file keeps writing to a deleted inode until it is signalled to reopen — the deleted-but-open-file problem from §11. And on servers, `journalctl` output is not persistent unless `/var/log/journal` exists; otherwise it is lost on reboot.

---

## 13. Users, Permissions and sudo

```bash
adduser deploy
usermod -aG docker deploy         # -a is critical: without it you REPLACE groups
id deploy
chown -R app:app /srv/app
chmod 640 /etc/app/secrets.env    # owner rw, group r, others none
chmod +x script.sh
umask 027                         # default permissions for new files
```

```
Permission bits:  r=4  w=2  x=1
  644  rw- r-- r--   normal file
  600  rw- --- ---   secret
  755  rwx r-x r-x   executable / directory
  700  rwx --- ---   private directory
```

**On a directory, `x` means "may traverse"**, so a directory with `r` but no `x` lets you list names and nothing else — a frequent confusion. Special bits: **setuid** (run as the file owner — a privilege-escalation surface worth auditing with `find / -perm -4000`), **setgid**, and the **sticky bit** on `/tmp` so users can only delete their own files.

`usermod -aG` without the `-a` **replaces** the user's supplementary groups, which is how people accidentally remove themselves from `sudo`. And group membership changes only take effect on a **new login session**, which is why "I added myself to docker but still get permission denied" is answered by logging out and back in.

For sudo, prefer narrow rules in `/etc/sudoers.d/` over blanket access, and edit with **`visudo`** so a syntax error is caught before it locks out privilege escalation entirely.

---

## 14. Text Processing

The pipeline skills that make log spelunking fast:

```bash
grep -rn "ERROR" /var/log/app/          # recursive, with line numbers
grep -c / -v / -i / -A3 -B3             # count / invert / ignore case / context
grep -E "5[0-9]{2}" access.log          # extended regex

# top 10 IPs by request count — the classic one-liner
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head

# average response time from field 10
awk '{sum+=$10; n++} END {print sum/n}' access.log

# 5xx responses only (status in field 9)
awk '$9 >= 500' access.log

sed -i 's/old/new/g' file.conf           # in-place substitute
sed -n '100,200p' big.log                # print a line range
cut -d: -f1 /etc/passwd                  # field extract
sort -u / sort -k3 -rn                   # unique / by column, numeric desc
wc -l                                    # count lines
tr -d '\r' < win.txt > unix.txt
jq '.items[] | select(.status=="failed") | .id' out.json
xargs -P4 -n1 curl -s                    # parallelise
```

The `sort | uniq -c | sort -rn` idiom is worth memorising — `uniq` only collapses **adjacent** duplicates, which is why the first `sort` is mandatory and why forgetting it silently produces wrong counts.

---

## 15. Networking Tools

```bash
dig +short api.example.com              # DNS: what does it resolve to
dig @8.8.8.8 example.com NS +trace      # who is authoritative
curl -sSv -o /dev/null https://api.example.com     # TLS + headers + timings
curl -w "@curl-format.txt" -o /dev/null -s URL     # DNS/connect/TLS/TTFB breakdown
ss -tulpn                               # listening sockets + owning process
ss -tan | awk '{print $1}' | sort | uniq -c        # connection states
ping / mtr example.com                  # reachability / per-hop loss
traceroute -T -p 443 host               # TCP traceroute (ICMP is often blocked)
tcpdump -i any -nn port 5432 -c 20      # see actual packets
nc -zv host 5432                        # is the port open
openssl s_client -connect host:443 -servername host   # inspect the cert chain
ip a / ip r                             # addresses / routes
```

The debugging order for "the app can't reach the database": **resolve** (`dig`), **route/reach** (`nc -zv`, `mtr`), **TLS** (`openssl s_client`), then **application** (`curl -v`). Working outward-in wastes time; each step rules out a whole layer.

`ss` has replaced `netstat`, `ip` has replaced `ifconfig`/`route`, and `mtr` is strictly better than `traceroute` because it shows sustained per-hop loss rather than one sample. Note ICMP is frequently blocked, so **`ping` failing does not mean the host is down** — use TCP-based checks.

---

## 16. Disk and Filesystem

```bash
df -h / df -i                            # space / inodes
du -xh /var --max-depth=1 | sort -h      # -x stays on one filesystem
lsof +L1                                 # deleted files still held open
lsof /var/log/app.log                    # who has this file open
ncdu /var                                # interactive size explorer
iostat -xz 1                             # per-device %util and await
find /var/log -type f -mtime +30 -delete
mount | column -t ; lsblk
```

The three "disk full" causes, in the order to check them: **actual data** (`du`), **inode exhaustion** (`df -i` — millions of tiny files, and it presents as "no space left" with plenty of free bytes), and **deleted-but-open files** (`lsof +L1` — the space is only released when the holding process closes or restarts, which is why restarting the service reclaims gigabytes that `du` never showed).

---

## 17. tmux

Essential because a dropped SSH connection kills your foreground processes.

```bash
tmux new -s deploy          # named session
tmux attach -t deploy       # reattach after a disconnect
tmux ls
Ctrl-b d                    # detach
Ctrl-b c / n / p            # new window / next / previous
Ctrl-b % / "                # split vertical / horizontal
Ctrl-b [                    # copy mode, scroll back
```

The operational point: run any long migration, build or restore **inside tmux**, so a laptop sleeping or a Wi-Fi blip doesn't abort it halfway. `nohup cmd &` and `systemd-run` are alternatives when you don't need to reattach. `screen` does the same job and is more likely to be pre-installed.

---

## 18. Interview Questions & Answers

**Q1: Explain how SSH key-based authentication works.**

You generate a key pair; the **private key never leaves your machine** and the public key is appended to `~/.ssh/authorized_keys` on the server. On connection the server sends a challenge, your client signs it with the private key, and the server verifies that signature against the stored public key. Nothing reusable crosses the network, which is why it is strictly stronger than password auth — there is no credential to intercept and nothing practical to brute-force, and the key can be passphrase-protected at rest. Worth separating from this is the **host key**, a *different* pair that identifies the server and is what `known_hosts` records; that is the mechanism that detects a man-in-the-middle, and accepting the fingerprint prompt blindly (or setting `StrictHostKeyChecking=no`) throws that guarantee away. Prefer **Ed25519** over RSA, and remember `sshd` **silently ignores** keys if `~/.ssh`, `authorized_keys` or the home directory have loose permissions — the reason appears only in the server log.

**Q2: What is agent forwarding and why is it risky?**

`ssh-agent` holds your decrypted private keys in memory; **agent forwarding** (`ssh -A`) exposes a socket to the remote host so it can ask your local agent to sign challenges, letting you authenticate onward without copying a key to that server. The risk is that the socket is usable by **anyone with root on that host, or any process running as your user**, for the life of your session — they can authenticate as you to every system your keys open. They never obtain the key itself, but they don't need to. So never forward to a host you don't fully trust, and prefer **`ProxyJump`**, which tunnels through the intermediate host with the final connection **end-to-end encrypted**, so the jump host can neither read your session nor use your keys. If you must forward, scope it per-host in `ssh_config` rather than globally, and use `ssh-add -c` to require confirmation for each signature.

**Q3: Explain local, remote and dynamic port forwarding.**

**Local (`-L`)** opens a port on your machine that tunnels through the SSH server to a target — `ssh -L 5433:db.internal:5432 bastion` lets you point `psql` at `localhost:5433` and reach a private database. **Remote (`-R`)** does the reverse: it opens a port on the *server* that tunnels back to something reachable from your machine — `ssh -R 8080:localhost:3000 public-host` exposes your local dev server on the remote host. **Dynamic (`-D`)** starts a local SOCKS proxy so arbitrary traffic routes through the server, which is effectively a lightweight VPN for a browser. The mnemonic is: `-L` brings a remote service to you, `-R` exposes your service remotely, `-D` makes the server a proxy. Add `-fNL` for a backgrounded tunnel with no shell. One security note: `-R` binds to loopback on the server unless `GatewayPorts yes` is set, deliberately, because remote forwarding is an easy way to expose an internal service to the internet by accident.

**Q4: A server is slow. Walk me through your diagnosis.**

I work top-down and let each step rule out a layer. **`uptime`** for load average, interpreted against core count — load 4 is saturated on 4 cores and idle on 32 — and remembering Linux load **includes tasks blocked on I/O**, so high load with low CPU means I/O-bound. Then **CPU**: `top`/`mpstat -P ALL 1` to split `%usr`, `%sys` and especially `%iowait`, plus `%st` steal time which on a VM means the hypervisor is oversubscribed. Then **memory**: `free -h` reading **`available`** rather than "free", because Linux deliberately uses spare RAM as page cache, and `dmesg -T | grep -i oom` to check whether the kernel killed something — an OOM kill appears there, not in the app log. Then **disk**: `df -h`, `df -i` for inodes, `iostat -xz 1` for `%util` and `await`. Then **network**: `ss -tulpn` and connection-state counts. Finally logs via `journalctl -p err`. The habit that matters is forming a hypothesis from the numbers before touching anything.

**Q5: `df` says the disk is full but `du` doesn't account for the space. Why?**

**Almost certainly deleted-but-still-open files, or inode exhaustion.** `du` walks the directory tree, so it cannot see a file that has been unlinked while a process still holds an open descriptor — the space stays allocated until that process closes the file or exits. The classic case is a log rotated with `create` semantics while the writing process was never signalled to reopen, so it keeps appending to a deleted inode that grows invisibly. Find it with **`lsof +L1`**, which lists open files with a link count of zero, and reclaim it by restarting or `HUP`-ing the holder. The other cause is **inode exhaustion** — check `df -i`; millions of tiny files (session files, mail spool, cache) exhaust inodes while leaving plenty of free bytes, and it reports as "No space left on device" which sends people hunting for large files that don't exist. A third, rarer one is space reserved for root, which makes a filesystem appear full to unprivileged writes at ~95%.

**Q6: How would you harden SSH on a public-facing server?**

The single biggest win is **`PasswordAuthentication no`** with key-only auth, which eliminates brute-force entirely. Then `PermitRootLogin no`, an **allow-list** via `AllowGroups` rather than a deny-list, `MaxAuthTries 3`, a short `LoginGraceTime`, and `AllowAgentForwarding no` and `X11Forwarding no` unless genuinely needed. Outside `sshd` itself: restrict source ranges at the **firewall or security group**, which does more than any config setting; run `fail2ban` to throttle noise; and at scale replace `authorized_keys` with **SSH certificates** from an SSH CA so access expires automatically and revocation is central. Changing the port only reduces log volume — it is not security. Two operational rules I'd insist on: always validate with **`sshd -t`** and test a new session from a second terminal **while keeping the current one open**, because a bad config on a host with no console access is unrecoverable; and use `reload` rather than `restart` so live sessions survive. On AWS, **SSM Session Manager** is better still — IAM-authorised shell access with CloudTrail auditing and no inbound port at all.

**Q7: What's the difference between `SIGTERM` and `SIGKILL`, and why does it matter?**

`SIGTERM` (15) is a **request** to terminate: the process can catch it, flush buffers, close connections, release locks and exit cleanly. `SIGKILL` (9) **cannot be caught or ignored** — the kernel destroys the process immediately, so in-flight writes are lost, temp files and lock files are left behind, and clients see abrupt connection resets. So you always send TERM first and only escalate to KILL if it doesn't exit within a grace period, which is exactly what `kill` does by default and what `systemd`'s `TimeoutStopSec` automates. The reason this comes up beyond the shell is that it is the same contract everywhere: Docker's `stop` sends TERM then KILL after a grace period, and Kubernetes uses `terminationGracePeriodSeconds` — so an application that doesn't handle `SIGTERM` drops in-flight requests on every deploy. `SIGHUP` is the third one to know: many daemons reload configuration on HUP without restarting.

**Q8: How do you connect to a host with no public IP?**

Through a **bastion** with `ProxyJump`: `ssh -J bastion.example.com deploy@10.0.1.5`, or declared once in `ssh_config` with `Host prod-* / ProxyJump bastion` so `ssh prod-web-01` just works. The property that makes `ProxyJump` the right answer rather than chaining two `ssh` calls with agent forwarding is that the session to the final host is **end-to-end encrypted through** the bastion — it forwards TCP but cannot read the traffic or use your keys, which removes the agent-forwarding risk entirely. The bastion itself needs to be hardened and audited: key-only auth, MFA, session logging, tight inbound rules, and ideally short-lived SSH certificates so access expires. Better still, if you're on AWS, **SSM Session Manager** removes the bastion: shell access is authorised by IAM, logged to CloudTrail and S3, and requires **no open inbound port**, which eliminates the whole attack surface rather than defending it.

**Q9: How do you find the top 10 IPs hitting your server from an access log?**

```bash
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head
```

`awk` extracts the first field, `sort` groups identical values **adjacently**, `uniq -c` collapses and counts them, and `sort -rn` orders by count descending. The detail that matters is that **`uniq` only collapses adjacent lines**, so omitting the first `sort` silently produces wrong counts rather than an error — that's the part interviewers are checking. From there you'd extend the same idiom: `awk '$9 >= 500'` to filter 5xx first, `awk '{sum+=$10; n++} END {print sum/n}'` for an average latency, and `grep -E "5[0-9]{2}"` when the field position varies. On a very large file, `awk` alone can do the counting in one pass with an associative array, which avoids sorting the whole input.

**Q10: `ssh` says "Connection refused" on one host and "Connection timed out" on another. What's the difference?**

**"Refused" means something answered and actively rejected the connection; "timed out" means nothing answered at all.** Refused is a TCP RST — you reached the host, and there is no process listening on that port, so the causes are `sshd` not running, `sshd` listening on a different port, or a local firewall rejecting rather than dropping. Timed out means your SYN was silently dropped, so the packet never got there or the reply never came back: a security group or network ACL, a host firewall set to DROP, wrong IP, no route, or the host being down. That distinction tells you where to look — refused is a service problem on a host you can reach, timed out is a network-path problem — and it saves the common mistake of debugging `sshd` config when nothing is reaching the machine. Confirm with `nc -zv host 22`, and remember `ping` failing proves nothing because ICMP is routinely blocked.

---

## 19. Tricky Questions

**Q1: You add a public key to `authorized_keys`, permissions on the file look right, and you still get "Permission denied (publickey)". What's left?**

**Most likely the permissions on the *home directory* or `~/.ssh`, not the file itself.** `sshd` enforces `StrictModes`, which rejects keys if the user's home directory, `~/.ssh`, or `authorized_keys` are writable by group or others — and people check the file while leaving the home directory at `775`. The failure is deliberately silent on the client, so the only place the reason appears is the **server log** (`journalctl -u sshd` or `/var/log/auth.log`), which is the actual answer to "what's left": go read it. Other candidates worth naming: wrong ownership (`chown -R user:user ~/.ssh`), the key appended with a line break so it's malformed, SELinux contexts wrong after copying the file in (`restorecon -R ~/.ssh`), the user not matching `AllowUsers`/`AllowGroups`, the client offering a different key (check `ssh -v` for which keys were tried), or `authorized_keys` not being where `AuthorizedKeysFile` points.

**Q2: A colleague ran `usermod -G docker deploy` and now the deploy user can't sudo. What happened?**

**`-G` without `-a` *replaces* the user's entire supplementary group list**, so `deploy` was removed from `sudo`/`wheel` and every other group it belonged to, retaining only `docker`. The correct form is **`usermod -aG docker deploy`** — append. Recovery needs an account that still has privileges: `usermod -aG sudo deploy` from root or another admin, or single-user/console/rescue access if nobody else can escalate, which on a cloud VM may mean attaching the volume elsewhere or using the provider's console. Two related things worth mentioning: group changes only apply to a **new login session**, which is why adding yourself to `docker` and still getting permission denied is fixed by logging out and back in, not by re-running the command; and this class of accident is why sudo rules belong in `/etc/sudoers.d/` edited with **`visudo`**, and why you keep a second privileged path open before changing access.

**Q3: You edit `sshd_config`, restart sshd, and now you cannot log in at all. Your session is already closed. What should you have done?**

**Kept the existing session open, validated with `sshd -t`, and tested a new connection from a second terminal before closing anything.** A bad `sshd_config` on a remote host with no out-of-band console is one of the few genuinely unrecoverable operational mistakes — you have removed the only way in. The safe procedure is: run `sshd -t` (or `sshd -T` to dump the effective config) to catch syntax errors, use `systemctl reload` rather than `restart` so live sessions survive, keep your current shell **open**, open a **new** terminal and confirm you can still authenticate, and only then close the original. Belt and braces for risky changes: schedule a revert with `at`/`sleep` that restores the previous config in ten minutes unless you cancel it, and run a second `sshd` on an alternate port as a fallback. Recovery without any of that means the provider console, a rescue instance with the volume attached, or SSM Session Manager if the agent is installed — which is a strong argument for having it installed everywhere.

**Q4: Your monitoring alerts on load average above 8 on an 8-core box, but CPU utilisation is only 15%. Is the server overloaded?**

**Not in the CPU sense — it's almost certainly I/O-bound, because Linux load average counts tasks blocked on uninterruptible I/O, not just tasks wanting CPU.** This is a Linux-specific definition that differs from other Unixes and catches people out: a process waiting on a slow disk or a hung NFS mount is in state `D` and counts toward load while consuming no CPU. So load 8 with 15% CPU means eight things are queued, mostly waiting on something. Confirm with `mpstat -P ALL 1` showing high **`%iowait`**, `iostat -xz 1` for device `%util` and `await`, and `ps -eo state,cmd | grep '^D'` to see the blocked processes. Common causes are a saturated or failing disk, network storage latency, or a database doing heavy sequential I/O. The broader lesson is that **load average alone is not an alertable metric** — it needs core-count normalisation and pairing with CPU and I/O breakdowns, which is why SRE practice prefers alerting on user-visible latency instead.

**Q5: `rsync -a /var/www /backup/` produced `/backup/www/` last week; today someone ran `rsync -a /var/www/ /backup/ --delete` and files disappeared from `/backup`. Explain both.**

**The trailing slash changes the meaning of the source, and `--delete` then made the difference destructive.** Without a trailing slash, `rsync` copies the **directory itself** into the destination, giving `/backup/www/`. With a trailing slash it copies the **contents** of the directory into the destination, so files landed directly in `/backup/`. Combined with `--delete`, which makes the destination an exact mirror of the source, everything already in `/backup` that wasn't in `/var/www` — including last week's `www/` subdirectory and any other backups — was removed as "extraneous". So one character turned a copy into a wipe of the backup target. The habits that prevent it: always **`--dry-run`** (or `-n`) first when `--delete` is involved, be deliberate about trailing slashes on both sides, prefer `--delete-after` so deletions happen only once the transfer succeeded, and never point a mirroring `rsync` at a directory that holds anything you aren't reproducing from the source.

---

## 20. Cheat Sheet

**SSH fundamentals**

1. Three phases: key exchange → **server** auth (host key) → **client** auth.
2. **Host key** identifies the server (`known_hosts`); **user key** identifies you.
3. The fingerprint prompt is the only MITM defence — never `StrictHostKeyChecking=no`.
4. Private keys never cross the wire.

**Keys**

5. `ssh-keygen -t ed25519` — modern default. RSA 4096 only for legacy.
6. Public key → remote `~/.ssh/authorized_keys` (`ssh-copy-id`).
7. `700 ~/.ssh`, `600` private key, `600 authorized_keys`, and the **home dir must not be group-writable**.
8. Bad permissions fail **silently** — the reason is in the server log only.
9. At scale use **SSH certificates**, not distributed `authorized_keys`.

**Config**

10. `~/.ssh/config` — `Host`, `HostName`, `User`, `IdentityFile`, `ProxyJump`.
11. `ControlMaster`/`ControlPersist` multiplex TCP — big speedup for repeated calls.
12. `IdentitiesOnly yes` prevents "too many authentication failures".
13. `ServerAliveInterval 60` stops NAT dropping idle sessions.

**Agent & jump hosts**

14. `ssh-add -l` / `-D` / `-t 3600`.
15. **Agent forwarding lets root on that host authenticate as you** — avoid it.
16. **`ProxyJump` (`-J`)** is end-to-end encrypted through the bastion. Prefer it.
17. On AWS, **SSM Session Manager** needs no inbound port at all.

**Tunnels**

18. `-L` remote service → to you. `-R` your service → exposed remotely. `-D` SOCKS proxy.
19. `-fNL` = background tunnel, no shell.
20. `-R` binds loopback unless `GatewayPorts yes`.

**Transfer**

21. Prefer **`rsync -avz`** — deltas, resume, permissions, `--delete`.
22. **Trailing slash**: `src/` copies contents; `src` copies the directory.
23. `--dry-run` always, before `--delete`.

**Hardening**

24. `PasswordAuthentication no` is the single biggest win.
25. `PermitRootLogin no`, `AllowGroups`, `MaxAuthTries 3`.
26. **`sshd -t` then `reload`, keeping your session open** and testing in a second terminal.
27. Firewall source ranges beat any sshd setting. A non-standard port is not security.

**Troubleshooting**

28. `ssh -vvv` shows which keys were offered.
29. **Refused** = reached the host, nothing listening. **Timed out** = never arrived (firewall).
30. `ping` failing proves nothing — ICMP is often blocked. Use `nc -zv`.
31. Host key changed = rebuilt host, or MITM. Verify before deleting the entry.

**systemd**

32. `enable` ≠ `start`. `enable --now` does both.
33. `daemon-reload` after editing a unit; `systemctl list-units --failed`.
34. `journalctl -u X -f -p err --since`.
35. **TERM then KILL.** TERM is catchable and lets the process clean up.

**Diagnosis**

36. Load average is **task count**, not a percentage — normalise by cores.
37. Linux load **includes I/O-blocked tasks** — high load + low CPU = I/O-bound.
38. Read **`available`** in `free`, not "free" — page cache is healthy.
39. OOM kills show in **`dmesg`**, not the app log.
40. Disk full: check `du`, then **`df -i`** (inodes), then **`lsof +L1`** (deleted-but-open).
41. `%st` steal time = noisy hypervisor neighbour.

**Text & network**

42. `awk '{print $1}' log | sort | uniq -c | sort -rn | head` — `uniq` needs adjacency.
43. `ss` replaced `netstat`; `ip` replaced `ifconfig`; `mtr` beats `traceroute`.
44. Debug order: **resolve → reach → TLS → application** (`dig`, `nc`, `openssl s_client`, `curl -v`).

**Permissions**

45. `r=4 w=2 x=1`; on a **directory `x` means traverse**.
46. **`usermod -aG`** — omitting `-a` replaces all groups.
47. Group changes need a new login session.
48. Audit setuid binaries: `find / -perm -4000`.
49. Edit sudoers with **`visudo`**; prefer `/etc/sudoers.d/`.

**Sessions**

50. Run long operations inside **`tmux`** so a dropped connection can't abort them.

---

## 21. References

- [OpenSSH manual pages](https://www.openssh.com/manual.html) — `ssh`, `sshd_config`, `ssh_config`, `ssh-keygen`.
- [SSH.com / OpenSSH key management](https://www.ssh.com/academy/ssh/keygen)
- [Mozilla OpenSSH security guidelines](https://infosec.mozilla.org/guidelines/openssh)
- [systemd.service](https://www.freedesktop.org/software/systemd/man/systemd.service.html) and [journalctl](https://www.freedesktop.org/software/systemd/man/journalctl.html)
- [Brendan Gregg — Linux Performance](https://www.brendangregg.com/linuxperf.html) — the canonical diagnosis reference.
- [rsync man page](https://download.samba.org/pub/rsync/rsync.1) — read the trailing-slash section.
- [AWS Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)
- [Teleport](https://goteleport.com/docs/) for SSH certificate-based access at scale.
