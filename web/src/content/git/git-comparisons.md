# Git Comparison Tables

Quick-reference comparison tables for Git "X vs Y" questions interviewers love.

---

## merge vs rebase

| Feature | `git merge` | `git rebase` |
|---|---|---|
| **Approach** | Creates a new merge commit joining two branches | Replays your commits on top of the target branch |
| **History shape** | Non-linear (diamond/railroad track) | Linear (straight line) |
| **Merge commit** | Yes (unless fast-forward) | No — rewrites commit SHAs |
| **Conflict resolution** | Resolve once in the merge commit | Resolve per replayed commit |
| **Collaboration safety** | Safe for shared branches | Dangerous on shared branches (rewrites history) |
| **Traceability** | Easy to see when branches joined | Harder to see where work began |
| **Reversibility** | Easy — revert the merge commit | Hard — original SHAs are gone |

**When to use which:** Use `merge` for integrating shared/public branches (e.g., merging a feature into `main`). Use `rebase` to keep a clean linear history on local/private branches before opening a PR.

---

## reset vs revert

| Feature | `git reset` | `git revert` |
|---|---|---|
| **What it does** | Moves the branch pointer backward, discarding commits | Creates a new commit that undoes a previous commit's changes |
| **History impact** | Rewrites history (removes commits) | Preserves history (adds an undo commit) |
| **Safety for shared branches** | Unsafe — force push required, breaks collaborators | Safe — no history rewrite |
| **Scope** | Can undo multiple commits at once | Typically targets one commit at a time |
| **Staging area / working dir** | Configurable via `--soft`, `--mixed`, `--hard` | Always creates a new commit |
| **Use case** | Undo local work not yet pushed | Undo a commit already pushed/shared |

**When to use which:** Use `reset` for local-only cleanup before pushing. Use `revert` to undo changes on any branch others have pulled from.

---

## reset --soft vs --mixed vs --hard

| Feature | `--soft` | `--mixed` (default) | `--hard` |
|---|---|---|---|
| **Moves HEAD** | Yes | Yes | Yes |
| **Resets staging area** | No — changes stay staged | Yes — unstages changes | Yes — staging area matches target commit |
| **Resets working directory** | No — files untouched | No — files untouched | Yes — all uncommitted changes deleted |
| **Data loss risk** | None | None (changes still in working dir) | High — untracked files survive, but all tracked changes are gone |
| **Typical use** | Recommit with a different message or combine commits | Unstage files and rework what to commit | Completely discard all work since target commit |
| **Recovery** | Easy | Easy | Only via `git reflog` within ~30 days |

**When to use which:** Use `--soft` to amend or squash recent commits. Use `--mixed` (the default) to unstage and re-select files. Use `--hard` only when you truly want to throw everything away.

---

## fetch vs pull

| Feature | `git fetch` | `git pull` |
|---|---|---|
| **What it does** | Downloads new data from remote, updates remote-tracking branches | Runs `fetch` + `merge` (or `rebase`) in one step |
| **Modifies working directory** | No | Yes |
| **Modifies local branches** | No — only `origin/*` refs | Yes — merges into current branch |
| **Safety** | Completely safe — read-only | May trigger merge conflicts |
| **Control** | Full — you decide when to integrate | Less — integrates immediately |
| **Typical workflow** | `fetch` then inspect with `log`/`diff`, then merge | Quick sync when you trust the remote state |

**When to use which:** Use `fetch` when you want to review what changed before integrating. Use `pull` for straightforward "get latest" workflows. Prefer `pull --rebase` to keep a linear history.

---

## clone vs fork

| Feature | `git clone` | Fork (GitHub/GitLab) |
|---|---|---|
| **Operation type** | Git command (local) | Platform feature (server-side copy) |
| **Where it lives** | Creates a local copy on your machine | Creates a server-side copy under your account |
| **Write access to original** | Only if you have push permissions | No — you push to your fork |
| **Upstream relationship** | `origin` points to the cloned repo | You manually add `upstream` remote to original |
| **Use case** | Work on repos you own or collaborate on directly | Contribute to repos you don't have push access to |
| **PR workflow** | Push branch, open PR from same repo | Push to fork, open PR across repos |

**When to use which:** Use `clone` for repos you have write access to. Use `fork` + clone for open-source contributions where you lack push access to the original.

---

## checkout vs switch vs restore

| Feature | `git checkout` | `git switch` | `git restore` |
|---|---|---|---|
| **Purpose** | Swiss-army knife: switch branches AND restore files | Switch branches only | Restore file contents only |
| **Switch branches** | `checkout <branch>` | `switch <branch>` | N/A |
| **Create + switch** | `checkout -b <branch>` | `switch -c <branch>` | N/A |
| **Discard file changes** | `checkout -- <file>` | N/A | `restore <file>` |
| **Restore from commit** | `checkout <commit> -- <file>` | N/A | `restore --source=<commit> <file>` |
| **Ambiguity risk** | Yes — branch or file? | No — branches only | No — files only |
| **Introduced in** | Original Git | Git 2.23 (2019) | Git 2.23 (2019) |

**When to use which:** Prefer `switch` for branches and `restore` for files — they are explicit and less error-prone. Use `checkout` only if you need backward compatibility with older Git versions.

---

## stash vs branch

| Feature | `git stash` | `git branch` + commit |
|---|---|---|
| **Purpose** | Temporarily shelve uncommitted work | Permanently save work on a named branch |
| **Persistence** | Stack-based; easy to forget or lose | Named and visible in branch list |
| **When temporary** | Ideal for quick context switches | Overkill for 5-minute detours |
| **Visibility** | Hidden — requires `stash list` | Visible in `branch -a` |
| **Collaboration** | Local only — not pushable | Can be pushed and shared |
| **Multiple saves** | Stack grows; older stashes get buried | Each branch is independent |
| **Typical use** | "Pause work, fix hotfix, resume" | "Start a new feature or experiment" |

**When to use which:** Use `stash` for quick, short-lived interruptions (minutes to hours). Use a branch for anything you want to name, share, or keep for more than a day.

---

## cherry-pick vs rebase

| Feature | `git cherry-pick` | `git rebase` |
|---|---|---|
| **Commits moved** | One (or a few) specific commits | All commits on the current branch since the fork point |
| **History rewrite** | No rewrite of source branch; duplicates commits | Rewrites current branch's commit history |
| **New SHAs** | Yes — picked commits get new SHAs | Yes — all replayed commits get new SHAs |
| **Source branch affected** | Not at all | Not at all (only current branch moves) |
| **Conflict scope** | Per cherry-picked commit | Per replayed commit across the whole branch |
| **Typical use case** | Backport a single fix to a release branch | Clean up an entire feature branch before merge |

**When to use which:** Use `cherry-pick` to selectively bring one or two commits to another branch (e.g., hotfix backport). Use `rebase` to replay an entire branch for a clean linear history.

---

## Git Flow vs GitHub Flow vs Trunk-Based Development

| Feature | Git Flow | GitHub Flow | Trunk-Based |
|---|---|---|---|
| **Long-lived branches** | `main`, `develop`, `release/*`, `hotfix/*` | `main` only | `main` only |
| **Feature branches** | Off `develop` | Off `main` | Short-lived (< 1-2 days) off `main` |
| **Complexity** | High — many branch types and rules | Low — one rule: branch off `main`, PR back | Very low — commit to `main` (with feature flags) |
| **Release model** | Scheduled releases via `release/*` branches | Every merge to `main` is deployable | Continuous delivery from `main` |
| **Hotfixes** | Dedicated `hotfix/*` branch off `main` | Same as any feature branch | Fix directly on `main` |
| **Team size** | Large teams with formal release cycles | Small-to-medium teams | Any size with strong CI/CD |
| **CI/CD compatibility** | Moderate — CI on multiple branches | High — CI on `main` and PRs | Highest — every commit tested and deployable |

**When to use which:** Use Git Flow for products with versioned releases (mobile apps, SDKs). Use GitHub Flow for web apps deployed continuously. Use Trunk-Based for high-performing teams with robust CI/CD and feature flags.

---

## shallow clone vs full clone vs sparse checkout

| Feature | Shallow Clone | Full Clone | Sparse Checkout |
|---|---|---|---|
| **What's downloaded** | Latest commit(s) only (`--depth N`) | Entire history, all branches, all files | Full history but only specified directories/files |
| **Disk usage** | Very low | Full repo size | Low to moderate |
| **History available** | Limited to depth N | Complete | Complete (for checked-out paths) |
| **`git log` / `git blame`** | Truncated | Full | Full (for sparse paths) |
| **Speed** | Fastest clone | Slowest for large repos | Fast initial checkout |
| **Use case** | CI builds, one-off scripts | Day-to-day development | Monorepo — work on one service/package |

**When to use which:** Use shallow clone for CI pipelines and disposable environments. Use full clone for regular development. Use sparse checkout in monorepos where you only need a subset of directories.

---

## merge --squash vs merge --no-ff vs fast-forward

| Feature | `merge --squash` | `merge --no-ff` | Fast-Forward (default) |
|---|---|---|---|
| **Resulting history** | Single squashed commit on target branch | Merge commit even if fast-forward possible | Target branch pointer moves forward; no merge commit |
| **Commit count on target** | 1 (all changes combined) | Original commits + 1 merge commit | Original commits (no extra commit) |
| **Branch topology** | Linear | Explicit branch-and-merge diamond | Linear |
| **Traceability** | Loses individual commits from feature branch | Preserves all commits and shows branch boundary | Preserves commits but no branch boundary marker |
| **Feature branch info** | Lost (single commit message) | Retained in merge commit | Not explicitly marked |
| **Typical use** | Clean up messy WIP commits | Enforce "always merge commit" policy | Simple, fast updates (e.g., `main` tracking `origin/main`) |

**When to use which:** Use `--squash` to collapse noisy feature branches into a single clean commit. Use `--no-ff` when you want branch history preserved (many teams enforce this via branch protection). Let fast-forward happen for trivial or linear updates.

---

## tag (lightweight) vs tag (annotated)

| Feature | Lightweight Tag | Annotated Tag |
|---|---|---|
| **Created with** | `git tag v1.0` | `git tag -a v1.0 -m "msg"` |
| **Stored as** | Pointer to a commit (like a branch that never moves) | Full Git object with metadata |
| **Tagger name/email** | Not stored | Stored |
| **Timestamp** | Not stored (uses commit's date) | Own creation date |
| **Message** | None | Required (or editor opens) |
| **GPG signing** | Not supported | Supported (`git tag -s`) |
| **Use case** | Temporary/local bookmarks | Official releases, version numbers |

**When to use which:** Use annotated tags for anything you'll share or that marks a release — they carry authorship, timestamps, and can be signed. Use lightweight tags for local/temporary markers.

---

## submodule vs subtree

| Feature | `git submodule` | `git subtree` |
|---|---|---|
| **Approach** | Links to an external repo at a specific commit (pointer) | Copies external repo's files into your repo |
| **Stored as** | `.gitmodules` file + commit SHA reference | Regular files in your tree |
| **Clone behavior** | Requires `--recurse-submodules` or separate `init`/`update` | Just works — files are already in the repo |
| **Updating** | `git submodule update --remote` | `git subtree pull --prefix=<dir> <remote> <branch>` |
| **Complexity** | Higher — easy to get into detached HEAD states | Lower — standard Git operations |
| **Independence** | Submodule has its own history, branches, remotes | History is merged into parent repo |
| **Contributing back** | Easy — cd into submodule, commit, push | Possible via `subtree push`, but awkward |

**When to use which:** Use submodules when the dependency is an independent project you want to pin to exact versions (e.g., a shared library). Use subtrees when you want a simpler workflow and don't mind the external code living in your repo's history.

---

## SSH vs HTTPS for Git remotes

| Feature | SSH | HTTPS |
|---|---|---|
| **URL format** | `git@github.com:user/repo.git` | `https://github.com/user/repo.git` |
| **Authentication** | SSH key pair | Username + PAT (personal access token) or credential manager |
| **Initial setup** | Generate key, add public key to GitHub | Minimal — may need to create a PAT |
| **Password prompts** | None after key is set up | Can be cached via credential helper |
| **Firewall friendliness** | Port 22 sometimes blocked by corporate firewalls | Port 443 — almost never blocked |
| **CI/CD usage** | Deploy keys or SSH keys in secrets | PAT stored as secret; simpler for ephemeral runners |
| **Security** | Strong — private key never leaves your machine | Strong — PAT scoped and rotatable |

**When to use which:** Use SSH for day-to-day development on personal machines — set it up once and never type a password again. Use HTTPS in CI/CD pipelines, corporate networks with restrictive firewalls, or when SSH key management is impractical.

---

## git add -A vs git add . vs git add -u

| Feature | `git add -A` | `git add .` | `git add -u` |
|---|---|---|---|
| **Scope** | Entire repository (all directories) | Current directory and subdirectories | Entire repository |
| **Stages new files** | Yes | Yes (within current dir) | No — only already-tracked files |
| **Stages modifications** | Yes | Yes (within current dir) | Yes |
| **Stages deletions** | Yes | Yes (within current dir) | Yes |
| **Untracked files** | Included | Included (within current dir) | Excluded |
| **Run from subdirectory** | Still stages everything in the repo | Only stages from `.` downward | Still updates everything in the repo |
| **Typical use** | "Stage absolutely everything" | "Stage everything in this folder" | "Update tracked files only — don't add new ones" |

**When to use which:** Use `git add -A` when you want to stage all changes across the entire repo. Use `git add .` when scoped to the current directory is intentional. Use `git add -u` when you want to stage modifications and deletions but explicitly not add any new untracked files.
