# Git Workflows & Advanced Cheat Sheet

## Interactive Rebase
```bash
git rebase -i HEAD~5                 # rebase last 5 commits interactively
# Editor commands:
#   pick   = keep commit as-is
#   reword = keep commit, edit message
#   edit   = pause to amend commit
#   squash = meld into previous commit (keep message)
#   fixup  = meld into previous commit (discard message)
#   drop   = remove commit entirely

# Reorder commits by rearranging lines in the editor
# Squash last 3 commits into one:
git rebase -i HEAD~3                 # mark 2nd and 3rd as "squash"

# Create a fixup commit (auto-squash later)
git commit --fixup=<hash>
git rebase -i --autosquash HEAD~5    # auto-reorders fixup commits

git rebase --continue                # after resolving conflicts
git rebase --abort                   # cancel rebase entirely
git rebase --skip                    # skip current conflicting commit
```

## Cherry-Pick
```bash
git cherry-pick <hash>               # apply a single commit to current branch
git cherry-pick <hash1> <hash2>      # apply multiple commits
git cherry-pick <start>..<end>       # apply range (exclusive start)
git cherry-pick <start>^..<end>      # apply range (inclusive start)
git cherry-pick -n <hash>            # apply without committing (--no-commit)
git cherry-pick -x <hash>            # append "cherry picked from" to message
git cherry-pick --abort              # cancel in-progress cherry-pick
git cherry-pick --continue           # continue after resolving conflicts
```

## Bisect
```bash
git bisect start                     # begin bisect session
git bisect bad                       # current commit is bad
git bisect good <hash>               # known good commit
# Git checks out midpoint — test and mark:
git bisect bad                       # this commit is bad
git bisect good                      # this commit is good
# Repeat until the first bad commit is found

git bisect reset                     # end session, return to original branch
git bisect log                       # show bisect steps so far
git bisect visualize                 # show remaining suspects in gitk

# Automated bisect with a test script
git bisect start HEAD v1.0.0
git bisect run npm test              # auto-marks via exit code (0=good, 1=bad)
git bisect run ./test-script.sh      # any script works
```

## Reflog
```bash
git reflog                           # show all HEAD movements
git reflog show <branch>             # reflog for a specific branch
git reflog --date=relative           # show with relative timestamps

# Recover a deleted branch
git reflog                           # find the commit hash before deletion
git checkout -b <branch> <hash>      # recreate branch at that commit

# Recover lost commits (e.g., after bad reset)
git reflog                           # find the lost commit hash
git reset --hard <hash>              # move HEAD back to it
git cherry-pick <hash>               # or just cherry-pick the lost commit

# Recover from bad rebase
git reflog                           # find pre-rebase HEAD position
git reset --hard HEAD@{5}            # reset to that reflog entry

# Expire reflog entries (careful!)
git reflog expire --expire=90.days.ago --all
```

## Worktrees
```bash
git worktree add ../hotfix hotfix    # check out 'hotfix' branch in ../hotfix dir
git worktree add ../feature -b feat  # create new branch + worktree
git worktree add ../review HEAD~5    # detached HEAD at specific commit
git worktree list                    # show all worktrees
git worktree remove ../hotfix        # remove a worktree
git worktree prune                   # clean up stale worktree references
git worktree lock ../hotfix          # prevent pruning of a worktree
git worktree unlock ../hotfix        # unlock a locked worktree
```

## Hooks
Common hooks (located in `.git/hooks/`):

| Hook | Trigger | Use Case |
|------|---------|----------|
| `pre-commit` | Before commit is created | Lint, format, run tests |
| `prepare-commit-msg` | After default message, before editor | Auto-prefix ticket numbers |
| `commit-msg` | After message is entered | Enforce commit message format |
| `post-commit` | After commit completes | Notifications, logging |
| `pre-push` | Before push to remote | Run full test suite |
| `pre-rebase` | Before rebase starts | Prevent rebase on shared branches |
| `post-merge` | After merge completes | Install deps, rebuild |
| `post-checkout` | After checkout/switch | Install deps, notify |
| `pre-receive` | Server-side, before accepting push | Enforce policies |
| `post-receive` | Server-side, after accepting push | Deploy, send notifications |

```bash
# Make a hook executable
chmod +x .git/hooks/pre-commit

# Skip hooks for a single command
git commit --no-verify -m "wip"
git push --no-verify

# Share hooks via a directory in the repo
git config core.hooksPath .githooks
```

## Submodules
```bash
git submodule add <url> path/to/sub  # add a submodule
git submodule init                   # init after fresh clone
git submodule update                 # fetch submodule commits
git submodule update --init --recursive  # init + update all (nested too)

git clone --recurse-submodules <url> # clone repo + all submodules at once

git submodule status                 # show current commit of each submodule
git submodule foreach 'git pull'     # run command in every submodule

# Update submodule to latest remote
cd path/to/sub && git pull origin main
cd .. && git add path/to/sub && git commit -m "update submodule"

# Remove a submodule
git submodule deinit -f path/to/sub
rm -rf .git/modules/path/to/sub
git rm -f path/to/sub
```

## Git Flow Workflow
```
Main Branches:
  main ────────●────────────●─────────────●──── (production releases)
               │            ↑             ↑
  develop ──●──┤──●──●──●───┤──●──●──●────┤──── (integration branch)
               │  ↑     ↑   │  ↑        ↑ │
               │  │     │   │  │        │  │
Support:       │  │     │   │  │        │  │
  feature/* ───┘──┘     │   │  └────────┘  │
                        │   │              │
  release/*             └───┘              │
  hotfix/*  ───────────────────────────────┘
```

| Branch | From | Merges Into | Purpose |
|--------|------|-------------|---------|
| `main` | — | — | Production-ready code, tagged releases |
| `develop` | `main` | — | Integration branch for features |
| `feature/*` | `develop` | `develop` | New features |
| `release/*` | `develop` | `main` + `develop` | Prep release (version bump, final fixes) |
| `hotfix/*` | `main` | `main` + `develop` | Emergency production fixes |

```bash
# Feature
git checkout -b feature/login develop
# ... work ...
git checkout develop && git merge --no-ff feature/login

# Release
git checkout -b release/1.2.0 develop
# ... bump version, final fixes ...
git checkout main && git merge --no-ff release/1.2.0
git tag -a v1.2.0
git checkout develop && git merge --no-ff release/1.2.0

# Hotfix
git checkout -b hotfix/1.2.1 main
# ... fix ...
git checkout main && git merge --no-ff hotfix/1.2.1
git tag -a v1.2.1
git checkout develop && git merge --no-ff hotfix/1.2.1
```

## GitHub Flow Workflow
```
main ──●──────●──────●──────●──────●──── (always deployable)
       │      ↑      │      ↑      ↑
       └──●───┘      └──●───┘      │
       feature-a     feature-b     │
                                   │
       hotfix ─────────────────────┘
```

| Step | Action |
|------|--------|
| 1. Branch | `git checkout -b feature-x main` |
| 2. Commit | Make changes, push regularly |
| 3. PR | Open Pull Request for review |
| 4. Review | Code review + CI checks pass |
| 5. Deploy | Deploy from branch (optional pre-merge) |
| 6. Merge | Merge PR into `main` |

```bash
git checkout -b feature-x main
# ... develop + commit + push ...
git push -u origin feature-x
# Open PR on GitHub, get reviews
# After approval:
git checkout main && git pull
git merge --no-ff feature-x
git push
git branch -d feature-x
git push origin --delete feature-x
```

**Key principle:** `main` is always deployable. Short-lived branches only.

## Trunk-Based Development
```
main ──●──●──●──●──●──●──●──●──●──●──── (trunk, always releasable)
       │     ↑  │  ↑
       └──●──┘  └──┘    ← short-lived branches (< 1-2 days)
       feature   fix

Release:
main ──●──●──●──●──●──●──●──●──●
              │              │
   release/1.0 ──●          │
                      release/2.0 ──●
                      (cherry-pick hotfixes)
```

| Practice | Description |
|----------|-------------|
| Small commits | Push to `main` multiple times per day |
| Short branches | Feature branches live < 1-2 days max |
| Feature flags | Hide incomplete features behind toggles |
| CI/CD | Every commit to `main` is tested + deployable |
| No long-lived branches | Avoid `develop`, `staging`, etc. |
| Release branches | Cut from `main` only for release stabilization |

```bash
# Typical flow
git checkout -b small-fix main
# ... minimal change ...
git commit -m "fix: resolve null check in auth"
git push -u origin small-fix
# PR → quick review → merge to main (same day)

# Feature flags for larger work
git checkout main
# ... commit behind flag, push directly or via tiny PR ...
```

## Advanced Log
```bash
# Pretty formats
git log --oneline --graph --all      # full branch graph
git log --pretty=format:"%h %an %ar %s"  # hash, author, date, subject
git log --pretty=format:"%C(yellow)%h%C(reset) %C(blue)%an%C(reset) %s"

# Date filtering
git log --since="2024-01-01"         # commits after date
git log --until="2024-06-30"         # commits before date
git log --since="2 weeks ago"        # relative dates work too

# Author filtering
git log --author="Alice"             # filter by author name
git log --author="alice@|bob@"       # regex: multiple authors

# File history
git log -- path/to/file.js           # commits touching a file
git log -p -- path/to/file.js        # with diffs
git log --follow -- old-name.js      # track across renames

# Search commit messages
git log --grep="fix"                 # search commit messages
git log --grep="feat" --grep="auth" --all-match  # AND search
git log -S "functionName"            # pickaxe: find when string was added/removed
git log -G "regex.*pattern"          # regex pickaxe

# Other useful options
git log --merges                     # only merge commits
git log --no-merges                  # exclude merge commits
git log --first-parent               # follow only first parent (cleaner)
git log --diff-filter=D -- .         # only deleted files
git shortlog -sn --all               # leaderboard: commits per author
```

## Cleanup & Maintenance
```bash
# Garbage collection
git gc                               # cleanup unnecessary files, optimize repo
git gc --aggressive                  # more thorough (slower)
git gc --auto                        # only if needed (Git decides)

# Prune
git prune                            # remove unreachable objects
git remote prune origin              # remove stale remote-tracking branches
git fetch --prune                    # prune during fetch

# Integrity check
git fsck                             # verify integrity of objects
git fsck --unreachable               # show unreachable objects

# Clean untracked files
git clean -n                         # dry run: show what would be deleted
git clean -fd                        # delete untracked files + directories
git clean -fdx                       # also delete ignored files (full reset)

# Rewrite history (remove sensitive data)
# filter-repo (recommended, install via pip)
git filter-repo --path secrets.env --invert-paths   # remove file from all history
git filter-repo --replace-text expressions.txt       # replace text patterns

# filter-branch (legacy, slower)
git filter-branch --tree-filter 'rm -f secrets.env' HEAD

# Reduce repo size
git count-objects -vH                # show repo size
git rev-list --objects --all | sort -k2 > objects.txt  # list all objects
git verify-pack -v .git/objects/pack/*.idx | sort -k3 -n | tail -10  # largest objects
```

## Diff & Patch
```bash
# Diff between branches
git diff main..feature               # changes in feature vs main
git diff main...feature              # changes since feature diverged from main
git diff main..feature -- src/       # limit to specific path
git diff --stat main..feature        # summary only (files changed)
git diff --name-only main..feature   # just file names

# Diff between commits
git diff abc123..def456              # between two commits
git diff HEAD~3..HEAD                # last 3 commits

# Create and apply patches
git diff > changes.patch             # unstaged changes to patch file
git diff --cached > staged.patch     # staged changes to patch file
git apply changes.patch              # apply a patch
git apply --check changes.patch      # dry run: check if patch applies cleanly
git apply --3way changes.patch       # apply with 3-way merge on conflict

# Format patches (for email-based workflows)
git format-patch main -o patches/    # one .patch file per commit since main
git format-patch -3                  # last 3 commits
git format-patch -1 <hash>           # single commit
git am patches/*.patch               # apply format-patch files (preserves author)
git am --abort                       # cancel if conflicts

# Binary diffs
git diff --binary > full.patch       # include binary file changes
```

## Configuration Tips
```bash
# Useful aliases
git config --global alias.co "checkout"
git config --global alias.br "branch"
git config --global alias.ci "commit"
git config --global alias.st "status"
git config --global alias.lg "log --oneline --graph --all --decorate"
git config --global alias.last "log -1 HEAD"
git config --global alias.unstage "reset HEAD --"
git config --global alias.amend "commit --amend --no-edit"
git config --global alias.wip "!git add -A && git commit -m 'wip'"

# Rerere (Reuse Recorded Resolution)
git config --global rerere.enabled true  # remember conflict resolutions
git rerere status                    # show current recorded resolutions
git rerere diff                      # show what rerere would auto-resolve

# Rebase settings
git config --global rebase.autoStash true   # auto-stash before rebase
git config --global rebase.autoSquash true  # auto-squash fixup! commits

# Default branch name
git config --global init.defaultBranch main

# Push behavior
git config --global push.default current         # push current branch to same name
git config --global push.autoSetupRemote true     # auto -u on first push

# Pull behavior
git config --global pull.rebase true             # rebase on pull instead of merge

# Diff & merge tools
git config --global merge.conflictstyle diff3    # show base in conflict markers
git config --global diff.algorithm histogram     # better diff algorithm

# Credential caching
git config --global credential.helper cache              # cache for 15 min
git config --global credential.helper 'cache --timeout=3600'  # cache for 1 hour

# Performance for large repos
git config --global core.fsmonitor true          # filesystem monitor
git config --global core.untrackedcache true     # cache untracked files
git config --global feature.manyFiles true       # optimize for large repos
```

## Common Scenarios

| Scenario | Command |
|----------|---------|
| Squash last 3 commits into one | `git rebase -i HEAD~3` (mark as `squash`) |
| Find which commit introduced a bug | `git bisect start && git bisect bad && git bisect good v1.0` |
| Recover a deleted branch | `git reflog` then `git checkout -b branch <hash>` |
| Move recent commits to a new branch | `git branch new-branch && git reset --hard HEAD~3` |
| Apply a commit from another branch | `git cherry-pick <hash>` |
| Undo a merge that was pushed | `git revert -m 1 <merge-hash>` |
| See who last changed each line | `git blame -w -C path/to/file` |
| Find when a function was deleted | `git log -S "functionName" --diff-filter=D` |
| Remove a file from all history | `git filter-repo --path secret.env --invert-paths` |
| Work on two branches simultaneously | `git worktree add ../other-dir other-branch` |
| Auto-resolve repeated conflicts | `git config rerere.enabled true` |
| Clean up merged remote branches | `git fetch --prune` |
| Create a patch for code review | `git format-patch -1 HEAD` |
| Rebase without losing local changes | `git config rebase.autoStash true` then `git pull --rebase` |
| Find all commits that touched a file | `git log --follow -p -- path/to/file` |
