# Git Commands Cheat Sheet

## Setup
```bash
git config --global user.name "Name"
git config --global user.email "email@example.com"
git init                    # new repo
git clone <url>             # clone remote
```

## Daily Workflow
```bash
git status                  # check changes
git add <file>              # stage file
git add .                   # stage all
git commit -m "message"     # commit
git push                    # push to remote
git pull                    # fetch + merge
```

## Branching
```bash
git branch                  # list branches
git branch <name>           # create branch
git checkout <name>         # switch branch
git checkout -b <name>      # create + switch
git switch <name>           # modern switch
git switch -c <name>        # modern create + switch
git merge <branch>          # merge into current
git branch -d <name>        # delete branch
```

## Viewing History
```bash
git log                     # full log
git log --oneline           # compact
git log --graph --oneline   # visual graph
git diff                    # unstaged changes
git diff --staged           # staged changes
git blame <file>            # who changed what
```

## Undoing Things
```bash
git restore <file>          # discard changes
git restore --staged <file> # unstage
git reset HEAD~1            # undo last commit (keep changes)
git reset --hard HEAD~1     # undo last commit (discard changes)
git revert <commit>         # create inverse commit
git stash                   # save work temporarily
git stash pop               # restore stashed work
```

## Remote
```bash
git remote -v               # list remotes
git remote add origin <url> # add remote
git fetch                   # download without merge
git push -u origin <branch> # push + set upstream
git push --force-with-lease # safe force push
```

## Rebase
```bash
git rebase main             # rebase current onto main
git rebase -i HEAD~3        # interactive rebase (squash, edit, reorder)
git rebase --abort          # cancel in-progress rebase
```

## Common Patterns

| Scenario | Command |
|----------|---------|
| Undo last commit | `git reset HEAD~1` |
| Fix last commit message | `git commit --amend` |
| See file at commit | `git show <hash>:<file>` |
| Cherry-pick commit | `git cherry-pick <hash>` |
| Clean untracked files | `git clean -fd` |
| Tag a release | `git tag v1.0.0` |
