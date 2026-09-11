const e=`# Git Commands Cheat Sheet

## Setup
\`\`\`bash
git config --global user.name "Name"
git config --global user.email "email@example.com"
git init                    # new repo
git clone <url>             # clone remote
\`\`\`

## Daily Workflow
\`\`\`bash
git status                  # check changes
git add <file>              # stage file
git add .                   # stage all
git commit -m "message"     # commit
git push                    # push to remote
git pull                    # fetch + merge
\`\`\`

## Branching
\`\`\`bash
git branch                  # list branches
git branch <name>           # create branch
git checkout <name>         # switch branch
git checkout -b <name>      # create + switch
git switch <name>           # modern switch
git switch -c <name>        # modern create + switch
git merge <branch>          # merge into current
git branch -d <name>        # delete branch
\`\`\`

## Viewing History
\`\`\`bash
git log                     # full log
git log --oneline           # compact
git log --graph --oneline   # visual graph
git diff                    # unstaged changes
git diff --staged           # staged changes
git blame <file>            # who changed what
\`\`\`

## Undoing Things
\`\`\`bash
git restore <file>          # discard changes
git restore --staged <file> # unstage
git reset HEAD~1            # undo last commit (keep changes)
git reset --hard HEAD~1     # undo last commit (discard changes)
git revert <commit>         # create inverse commit
git stash                   # save work temporarily
git stash pop               # restore stashed work
\`\`\`

## Remote
\`\`\`bash
git remote -v               # list remotes
git remote add origin <url> # add remote
git fetch                   # download without merge
git push -u origin <branch> # push + set upstream
git push --force-with-lease # safe force push
\`\`\`

## Rebase
\`\`\`bash
git rebase main             # rebase current onto main
git rebase -i HEAD~3        # interactive rebase (squash, edit, reorder)
git rebase --abort          # cancel in-progress rebase
\`\`\`

## Common Patterns

| Scenario | Command |
|----------|---------|
| Undo last commit | \`git reset HEAD~1\` |
| Fix last commit message | \`git commit --amend\` |
| See file at commit | \`git show <hash>:<file>\` |
| Cherry-pick commit | \`git cherry-pick <hash>\` |
| Clean untracked files | \`git clean -fd\` |
| Tag a release | \`git tag v1.0.0\` |

## Inspecting & Searching
\`\`\`bash
git log --oneline --graph --all --decorate   # the one to memorise
git log -S "functionName"                    # commits that ADDED/REMOVED that string
git log -p <file>                            # full patch history of a file
git log --author="name" --since="2 weeks ago"
git log main..feature                        # commits in feature not in main
git shortlog -sn                             # commits per author
git show <hash>                              # a commit's message + diff
git diff main...feature                      # changes since the branches diverged
git grep "TODO" $(git rev-list --all)        # search all of history
\`\`\`

## Recovering From Mistakes
\`\`\`bash
git reflog                        # every HEAD move — your safety net
git reset --hard HEAD@{2}         # jump back to where you were 2 moves ago
git checkout -b rescue <hash>     # resurrect a "lost" commit
git fsck --lost-found             # find dangling commits
git restore --source=<hash> -- <file>   # one file from an old commit
\`\`\`
**Almost nothing is truly lost for ~90 days** — \`git reflog\` first, panic second.

## Undo Matrix
| Situation | Command |
|---|---|
| Discard unstaged edits to a file | \`git restore <file>\` |
| Unstage but keep edits | \`git restore --staged <file>\` |
| Amend the last commit (message or content) | \`git commit --amend\` |
| Undo last commit, keep changes staged | \`git reset --soft HEAD~1\` |
| Undo last commit, keep changes unstaged | \`git reset HEAD~1\` |
| Undo last commit, **destroy** changes | \`git reset --hard HEAD~1\` |
| Undo a **pushed** commit safely | \`git revert <hash>\` |
| Drop a commit from the middle | \`git rebase -i\` → \`drop\` |
| Undo a merge (not pushed) | \`git reset --hard ORIG_HEAD\` |
| Move the last commit to a new branch | \`git branch new && git reset --hard HEAD~1\` |

## Bisect — find the commit that broke it
\`\`\`bash
git bisect start
git bisect bad                 # current commit is broken
git bisect good v1.2.0         # this tag was fine
# git checks out the midpoint; test, then:
git bisect good | git bisect bad
git bisect run npm test        # fully automated
git bisect reset
\`\`\`
O(log n): 1000 commits → ~10 tests.

## Stash
\`\`\`bash
git stash push -m "wip"
git stash push --include-untracked      # -u: untracked files too
git stash list / git stash show -p stash@{1}
git stash pop      # apply + drop
git stash apply    # apply, keep in the list
git stash branch fix stash@{0}
\`\`\`

## Worktrees & Submodules
\`\`\`bash
git worktree add ../hotfix main   # a second checkout, same repo, no re-clone
git worktree list / remove ../hotfix

git submodule update --init --recursive
git clone --recurse-submodules <url>
\`\`\`

## Merge vs Rebase
| | Merge | Rebase |
|---|---|---|
| History | preserves the true graph | linear, rewritten |
| Commit hashes | unchanged | **all rewritten** |
| Conflicts | once | potentially per commit |
| Safe on shared branches | **yes** | **no** |

**The golden rule:** never rebase (or force-push) a branch other people have based work on. \`git pull --rebase\` for your own feature branches, merge for shared ones.

## Conflict Resolution
\`\`\`bash
git status                       # lists "both modified"
git diff --name-only --diff-filter=U
git checkout --ours <file>       # during a MERGE: your branch
git checkout --theirs <file>     # during a merge: the incoming branch
git add <file> && git merge --continue
git merge --abort / git rebase --abort
git rerere.enabled true          # reuse recorded conflict resolutions
\`\`\`
During a **rebase**, \`--ours\` and \`--theirs\` are **swapped** relative to a merge — \`--ours\` is the upstream you're replaying onto.

## Tags & Releases
\`\`\`bash
git tag -a v1.2.0 -m "release"       # annotated (has author/date) — prefer these
git tag                              # list
git push origin v1.2.0
git push --follow-tags               # push commits + their annotated tags
git tag -d v1.2.0                    # delete locally
git push origin :refs/tags/v1.2.0    # delete on the remote
git describe --tags                  # nearest tag to HEAD
\`\`\`

## Gotchas
- \`git reset --hard\` **discards uncommitted work permanently** — reflog cannot bring back what was never committed.
- \`git stash\` ignores untracked and ignored files unless you pass \`-u\` / \`-a\`; a stash round-trip is a classic way to lose new files.
- \`git checkout <file>\` (old syntax) silently overwrites; \`git restore\` is the clearer modern form.
- \`git push --force\` clobbers others' work — always \`--force-with-lease\`, which refuses if the remote moved.
- \`--amend\` after pushing rewrites history and requires a force-push.
- Detached HEAD: commits belong to no branch. \`git switch -c name\` before you lose them.
- \`.gitignore\` does **not** untrack an already-tracked file — \`git rm --cached <file>\`.
- \`git clean -fd\` deletes untracked files irreversibly; dry-run with \`-n\` first.
- Amending or rebasing changes commit hashes, so open PRs and CI links go stale.
`;export{e as default};
