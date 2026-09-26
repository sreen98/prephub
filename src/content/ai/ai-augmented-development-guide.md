# AI-Augmented Development — Using Claude Code Efficiently

This guide is about the engineering discipline around AI coding tools, not the tools' feature lists. The distinction matters in interviews: everyone has used Copilot, so "I use AI to write code faster" is worth nothing. What gets graded is whether you can describe **what you changed about how the team works** — where the model is allowed to act, what it is never allowed to do, how its output is reviewed, and how you know any of it helped.

**The number to have ready**, because it reframes the whole conversation: a 2025 telemetry study of over 10,000 developers across 1,255 teams found high-AI-adoption teams completed **21% more tasks** and merged **98% more pull requests** — while **PR review time rose 91%**, average **PR size grew 154%**, and **bug counts rose 9%**. Generation got cheap; verification did not. Everything below is a response to that asymmetry.

## Table of Contents

- [1. Why This Is an Interview Topic Now](#1-why-this-is-an-interview-topic-now)
- [2. The Four Mechanisms — and Which to Reach For](#2-the-four-mechanisms-and-which-to-reach-for)
- [3. CLAUDE.md — The Always-On Context](#3-claudemd-the-always-on-context)
- [4. Context Scoping — The Real Constraint](#4-context-scoping-the-real-constraint)
- [5. Prompt Scoping — Specifying Work for a Model](#5-prompt-scoping-specifying-work-for-a-model)
- [6. The Agentic Workflow — Plan, Implement, Review, Report](#6-the-agentic-workflow-plan-implement-review-report)
- [7. Subagents as Delegation Boundaries](#7-subagents-as-delegation-boundaries)
- [8. Hooks — The Only Thing That Is Not a Suggestion](#8-hooks-the-only-thing-that-is-not-a-suggestion)
- [9. Permissions — The Blast Radius](#9-permissions-the-blast-radius)
- [10. Review Standards for AI-Generated Code](#10-review-standards-for-ai-generated-code)
- [11. Claude Code vs GitHub Copilot vs Cursor](#11-claude-code-vs-github-copilot-vs-cursor)
- [12. The Tooling Ecosystem — Skills, Plugins and Third-Party Tools](#12-the-tooling-ecosystem-skills-plugins-and-third-party-tools)
- [13. Team-Level Rollout](#13-team-level-rollout)
- [14. Measuring Whether It Worked](#14-measuring-whether-it-worked)
- [15. Anti-Patterns](#15-anti-patterns)
- [16. Interview Questions & Answers](#16-interview-questions-answers)
- [17. Tricky Questions](#17-tricky-questions)
- [18. Cheat Sheet](#18-cheat-sheet)
- [19. References](#19-references)

---

## 1. Why This Is an Interview Topic Now

Three things changed at once, and each creates a question you will be asked.

**Generation outpaced review.** The figures above are the whole story: more tasks and far more pull requests, but reviews taking nearly twice as long on changes about two and a half times as large. The industry name for this is the **verification tax** — the cognitive cost of reading, validating and taking responsibility for code you did not write. A team that adds AI without changing its review process converts a coding bottleneck into a review bottleneck and banks none of the gain.

**The failure modes are new.** A model does not make typos; it produces plausible, well-formatted code with a subtly wrong assumption in it. It will confidently use an API that does not exist, drop a tenant filter, or "fix" a failing test by weakening the assertion. Reviewers trained on human mistakes look in the wrong places.

**Ownership got murky.** If a model wrote it and a model reviewed it, who is accountable when it breaks? Every serious team answers this the same way — the human who opened the pull request — and the interesting question is what structure makes that answer honest rather than a formality.

---

## 2. The Four Mechanisms — and Which to Reach For

This is the single most useful thing to be able to say, because it shows you understand that these are different kinds of control rather than four ways to write instructions.

| Mechanism | Nature | Use for |
|---|---|---|
| **`CLAUDE.md`** | a request, always loaded | short, always-relevant project guidance |
| **Rules / skills** | a request, loaded on demand | conventions that matter only in some files |
| **Subagents** | a delegation boundary | work that should not pollute the main context |
| **Hooks & permissions** | **a guarantee** | anything that must happen, or must never happen |

**The decision rule in one sentence: if it must be enforced it is a hook or a permission; if it is knowledge it is a rule; if it is a boundary it is a subagent; if it is always-on guidance it belongs in `CLAUDE.md` and it should be short.**

The corollary is the part people miss. **`CLAUDE.md` is not a policy document.** It is context the model may or may not act on. Writing "never commit secrets" there is a hope; a `PreToolUse` hook that blocks writes to `.env` is a fact. Every instruction you can demote from prose to enforcement makes the prose shorter and the guarantee stronger — and a shorter `CLAUDE.md` is followed more reliably, because a long one buries its own important lines.

---

## 3. `CLAUDE.md` — The Always-On Context

It is loaded into every session in that project, so every line costs context on every turn.

**What earns its place:**

- **Commands** — how to run the dev server, the tests, the type-checker, the full gate. This is the highest-value content, because the model uses it constantly and guessing is expensive.
- **Layout and layering** — where things live and which direction dependencies point.
- **Canonical exemplars by path** — "when adding an endpoint, follow `app/api/x.py`". One good pointer beats three paragraphs of description, because the model can read the file.
- **The non-obvious invariants**, each with the reason. "Every query goes through `get_auth_db`, because a missing tenant filter reads as ordinary code" is worth ten lines of style guidance.
- **What is dead.** "That service is retired — if a doc points at it, say so rather than following it." Models are excellent at confidently following stale documentation.

**What does not belong:** anything the model already does correctly without being told (delete it), anything enforceable (make it a hook), and anything that only applies to a few files (make it a rule that loads on those paths).

**The failure mode to name in an interview:** a `CLAUDE.md` that grows to several hundred lines stops working, because the important rules are diluted by the obvious ones. The fix is a periodic pruning pass with a specific test — for each line, ask whether the model would get it wrong without it. If not, cut it.

**Keep it honest.** Documentation that describes an aspiration rather than the code is worse than none, because the model will act on it. The same is true of counts and version numbers in it — if it says "eight endpoints" and there are eleven, everything else in the file loses credibility.

---

## 4. Context Scoping — The Real Constraint

**The model is rarely the bottleneck; the context window is.** Almost every advanced practice is a way of keeping it clean.

Four techniques, in the order they pay off:

1. **Delegate the searching.** Answering "how does X work here?" can mean reading thirty files, and all thirty land in your context. A **subagent** reads them in its own window and returns the conclusion with citations. The search cost is paid somewhere you are not.
2. **Point, do not paste.** Give a path and a line range rather than a file dump. The model can read what it needs; you cannot un-read a 2,000-line paste.
3. **Load conventions by path.** A rule that applies to test files should load when a test file is opened, not on every turn. (A practical trap: a rules file with no path-matching front matter never loads automatically at all, so it silently does nothing while looking like governance.)
4. **Start a new session at a task boundary.** A long session accumulates dead ends, abandoned approaches and stale file contents. That history is not free, and it actively misleads — the model can "remember" an earlier wrong assumption.

**The symptom of bad context hygiene** is worth naming because interviewers recognise it: the model starts re-reading files it already read, contradicting decisions made earlier in the session, or producing edits that ignore a constraint you established twenty turns ago.

---

## 5. Prompt Scoping — Specifying Work for a Model

A prompt for real work is a **specification**, not a question. The difference is what you get back.

> "Write a function that validates emails" → you get a regex and a guess at the rules.
>
> "Implement `validateEmail(input: string): Result` in `src/lib/validation.ts`, following the shape of `validatePhone` in the same file. Reject empty input and addresses over 254 characters. Do not use a new dependency. Add cases to `validation.test.ts` covering both rejections." → you get the thing you wanted.

**The four things a good task prompt carries:**

- **The interface** — the signature, the file, the return shape.
- **The exemplar** — "follow the pattern in *this* file". This is the highest-leverage sentence in most prompts, because it transfers a hundred conventions you would otherwise have to write out.
- **The constraints** — what not to add, what not to change, what must not regress.
- **The definition of done** — which command proves it.

**Scope the blast radius, not just the task.** "Fix the bug" invites a refactor. "Fix the bug by changing only `useCart.ts`; if the fix requires touching anything else, stop and tell me why" gives you a change you can review and a signal when your assumption was wrong.

---

## 6. The Agentic Workflow — Plan, Implement, Review, Report

The pipeline that makes larger changes reviewable:

```text
  plan  ──►  implement  ──►  review  ──►  report
   │            │              │            │
   │            │              │            └─ what changed, what was skipped,
   │            │              │               what the reviewer flagged
   │            │              └─ a DIFFERENT context, given only the diff
   │            │                 and the plan — never the transcript
   │            └─ constrained to the plan's file list, enforced by a hook
   └─ a human approves the file list and the approach BEFORE any code exists
```

**Why planning first is not ceremony:** the cheapest place to catch "you have misunderstood the requirement" is before any code exists. It also produces the artefact everything downstream needs — an explicit list of files the change is allowed to touch, which is what turns "please stay in scope" into something a hook can enforce.

**Tier the work, or the process collapses under its own weight.** A typo fix does not need a plan and two reviewers. A useful shape:

| Tier | Shape | Process |
|---|---|---|
| **T1** | one file, no interface change | just do it; the gate still runs |
| **T2** | multiple files, one repo | plan → implement → review |
| **T3** | multiple repos, or a contract change | plan → implement → review, with a human before merge |

**The classification trap worth mentioning:** a "frontend-only ticket" that needs a field the API does not return yet is a two-repo change, even though every file you would touch is in one repo. Check the contract before you classify.

---

## 7. Subagents as Delegation Boundaries

A subagent has **its own context window, its own tool set, and its own instructions**. That makes it two things at once: a way to keep noise out of your session, and a way to create an *independent* opinion.

Three that earn their keep:

- **An investigator** — answers "how does this work?" by reading widely and returning a cited conclusion. Read-only, by design: the value is the summary, not the files.
- **A spec-conformance reviewer** — reads the **diff and the plan**, and nothing else. Answers one question: does this change do what was agreed, and only that?
- **A security reviewer** — reads the **diff only**, against the specific ways this codebase gets hurt: tenant isolation, authz, injection, secrets.

**The design rule that makes reviewers useful, and the best single line to say in an interview: give the reviewer the diff, the ticket key and the base ref — and nothing else.** Handing over your reasoning turns a second opinion into an echo. The reviewer's value comes precisely from not having seen the session that produced the code, because it therefore cannot inherit the assumption that caused the bug.

Two honest caveats to volunteer:

- **It is a convention, not a sandbox.** A reviewer with shell access can read the transcript if it goes looking. The isolation is structural discipline, not enforcement.
- **Cap the loop.** Two fix-and-review rounds, then a human decides. Otherwise you get an agent and a reviewer negotiating with each other while the actual question goes unanswered.

---

## 8. Hooks — The Only Thing That Is Not a Suggestion

Hooks fire on events — before a tool runs, after it runs, when a turn tries to end — and they can **block**. This is the layer that turns intent into guarantee.

A guard set that covers the real risks:

| Hook | Event | Enforces |
|---|---|---|
| **Scope guard** | before write/edit | no writes outside the approved plan's file list; no new top-level directories |
| **Secret guard** | before write/edit | no writes to `.env`, `*.pem`, `*.key`; no live-credential patterns in content |
| **Lint guard** | after write/edit | runs the fast linter and hands the result straight back as context |
| **Gate guard** | on turn end | blocks the turn while source files are newer than the last green gate run |

**Four design lessons, and these are what make the answer sound like experience rather than reading:**

**Allow by default.** Any condition the guard cannot evaluate — missing dependency, unparseable input, a path it does not recognise — must fall through to normal behaviour. A guard that blocks on its own bugs gets switched off by the team within a week, and a guard that has been switched off guards nothing.

**Advise where you cannot prevent.** A post-write hook cannot un-write the file. Blocking there strands the model with a half-finished edit, which is worse than the lint error. So the lint guard's entire job is to put the error in front of the model *immediately*, while it still has the context to fix it.

**Never run the test suite in a turn-end hook.** It adds minutes to every trivial exchange and will be disabled. Compare timestamps instead: source files against a marker written only by a real gate run. The marker means a real command proved it; the hook's only job is to notice when the proof is older than the code.

**Watch for the re-entry loop.** A blocked turn-end re-enters the same hook. Without a check for "am I already inside a blocked stop", the session ping-pongs forever and the only escape is killing it.

**Log denials.** One line per block — rule id and path, never content. Without it you have complaints from the team and no denominator, and cannot tell three-out-of-five from three-out-of-three-hundred.

---

## 9. Permissions — The Blast Radius

Orthogonal to hooks, and simpler: a three-way list of what the tool may do without asking.

```text
deny   — reading or editing .env, *.pem, *.key
         git push --force, git reset --hard, rm -rf
         anything with --no-verify (bypassing the hooks you just installed)

ask    — git commit, git push, opening or merging a PR
         installing or removing a dependency

allow  — typecheck, lint, format, test, build, dev server
```

**The shape of the answer:** deny anything destructive or irreversible, ask for anything that leaves the machine or changes the dependency graph, and allow everything that is read-only or trivially repeatable. The `--no-verify` denials are the ones that show you have thought about it — they stop the model from routing around the guards.

---

## 10. Review Standards for AI-Generated Code

The standards differ from human code review because the failure distribution differs. **Human reviewers look for the mistakes humans make.** Ask what the model gets wrong instead.

**Where to look first:**

- **Invented APIs.** A method, option or import that does not exist, used with total confidence. Resolve every unfamiliar symbol.
- **Silently weakened tests.** A test changed to pass rather than a bug fixed — an assertion loosened, a case deleted, a `skip` added. **Always read the test diff before the source diff.**
- **Plausible-but-wrong invariants.** The tenant filter left off a query, the authorization check on the wrong side of a boundary. This is where a codebase-specific reviewer earns its cost.
- **Scope creep.** Unrequested refactors bundled with the fix. This is why the plan's file list exists.
- **Duplicated rather than reused.** Models re-implement a helper they did not find. Grep for near-duplicates of anything new.
- **Dependencies.** Anything added to the lockfile is a supply-chain decision, and it should have been a human one.

**The process rules that make this sustainable:**

1. **Keep changes small.** The industry data shows AI-assisted PRs grew 154% in size and took 91% longer to review. The single most effective intervention is a size cap, because review quality falls off a cliff past a few hundred lines.
2. **The author is accountable, regardless of who typed it.** If you cannot explain a line in review, it does not merge. This one sentence resolves most of the ownership question.
3. **Automate what is mechanical.** Lint, types, tests, coverage and the security scan should never consume a human reviewer's attention. Their job is the logic and the invariants.
4. **An AI reviewer complements, never replaces.** It is good at breadth and consistency, and it shares blind spots with the model that wrote the code.
5. **Label the provenance.** Knowing which parts were AI-generated tells a reviewer where to concentrate — and later tells you whether those parts churned more.

---

## 11. Claude Code vs GitHub Copilot vs Cursor

Interviewers ask this to hear whether you understand the categories, not to hear a favourite.

| Aspect | Copilot (inline) | Cursor | Claude Code |
|---|---|---|---|
| Unit of work | the next few lines | a file or selection | a task across a repo |
| Where it lives | inside the editor | an editor | terminal, editor, or CI |
| Context | open file, nearby code | workspace index | what you scope, plus what it goes and reads |
| Runs commands | no | limited | yes — tests, builds, git |
| Best at | typing less | in-editor edits with project awareness | multi-file changes, investigation, refactors with a verification loop |

**The answer that lands: they are different granularities and most teams run more than one.** Inline completion is unbeatable for the mechanical middle of a function you already know how to write. An agentic tool earns its cost when the task spans files, needs the tests run, or needs the codebase investigated first. Using the agent for a one-line completion is slow; using completion for a cross-cutting refactor is how you get twenty inconsistent edits.

**The governance point worth adding:** they differ enormously in how much you can constrain them. A tool that can run commands is one you must put permissions and hooks around. A tool that only suggests text needs code review and nothing more. Match the control surface to the capability.

---

## 12. The Tooling Ecosystem — Skills, Plugins and Third-Party Tools

Claude Code is extensible in four ways, and a **plugin** is simply a bundle of them: **skills** (instructions for a kind of task), **subagents**, **hooks**, and **MCP servers** (Model Context Protocol servers — separate programs that hand the model extra tools, such as access to a database or an issue tracker). `/plugin` browses the marketplaces; Anthropic's official directory is added automatically and holds a few hundred entries, and any git repository can serve as a marketplace with `/plugin marketplace add <owner>/<repo>`.

**Skills are the mechanism worth understanding**, because they solve the `CLAUDE.md` length problem from §3. A skill is a directory with a `SKILL.md` that loads **only when its description matches what you are doing**. So a long procedure that applies to one kind of task — releasing, writing a migration, doing an accessibility pass — costs nothing on every other turn. The rule from §2 still decides: knowledge that applies sometimes is a skill, not another paragraph in the always-on file.

### Tools that actually change the numbers

| Tool | What it does | Why it matters |
|---|---|---|
| **`ccusage`** | reads local session logs and reports token spend and cost by day, session and model | you cannot manage what you cannot see; this is the cheapest way to get a real per-developer figure |
| **`ccstatusline`** / status line plugins | live context usage, cost and git state in the prompt line | context exhaustion is the main quality cliff, and this makes it visible *before* you hit it |
| **`caveman`** | a skill that compresses the model's prose output | the most-shared example of output-token reduction — see the caveat below |
| **Official marketplace plugins** | packaged skills, agents, hooks and MCP servers | the fastest way to adopt a practice without writing it yourself |

**`caveman` deserves a closer look, and not only because it is fun.** It is an MIT-licensed skill that instructs the model to answer in compressed, telegraphic prose — dropping filler while keeping code, commands and error text intact — with intensity levels from light trimming to near-telegraphic. It works in Claude Code and, as a drop-in `SKILL.md`, across many other agents.

**The number is where it gets instructive.** The headline is a **65–75% cut in output tokens**, and that figure is real — *for the discursive prose it acts on*. But prose is only around a quarter of a typical session's tokens; the rest is code, file contents and tool results, which it deliberately does not touch. **Measured over a whole session the saving is roughly 4–10%.** Both numbers are honest; they have different denominators.

That gap is the point, and it generalises to every efficiency tool you will be asked about: **a percentage is meaningless until you know what it is a percentage of.** At a few thousand pounds a month of spend, 4–10% is a real saving and worth one line of configuration. It is not the order-of-magnitude change the headline suggests, and quoting the headline number in an interview without the denominator is exactly the kind of claim that unravels under one follow-up.

### The things that actually dominate cost

Before reaching for a compression tool, the larger levers are structural, and they are the ones from earlier in this guide:

1. **Do not put it in the context in the first place.** A subagent that reads thirty files and returns a paragraph saves more than compressing every response for a week.
2. **Prune the always-on context.** Every line of `CLAUDE.md` is re-sent on every turn of every session.
3. **Keep the stable prefix stable** so prompt caching applies — reordering or interpolating a timestamp into the system prompt silently defeats it.
4. **Start fresh at task boundaries** rather than carrying a session's dead ends forward.

Output compression is a genuine optimisation on top of those. It is not a substitute for any of them.

### Evaluating a third-party tool before you install it

This is the part to raise unprompted, because it connects the ecosystem back to the governance in §9 and §13.

**A plugin can contain hooks and MCP servers, which means installing one is installing code that runs on your machine with your permissions.** It is a supply-chain decision with the same shape as adding an npm dependency, and it deserves the same questions:

- **Who publishes it, and is it pinned?** A marketplace entry can change after you approved it.
- **What does it actually add?** A skill is text the model reads. A hook is a script that runs. An MCP server is a network client. Those are three very different risk levels in one package format.
- **Does it touch the guards?** Anything that registers hooks can, in principle, register around yours.
- **Is it in the repo or on one machine?** Anything the team depends on belongs in project settings and code review; personal ergonomics — a status line, a usage dashboard — is fine per-developer and should not be mandated.

The short version of the standard: **read what a plugin installs before installing it, pin it, and keep team-wide extensions in the repo where they get reviewed.**

---

## 13. Team-Level Rollout

This is the part of the resume line that separates a user from someone who changed how a team works.

**Start with the shape of the pilot.** One team, one repo, a fixed period, and a decision at the end. Announce the metrics before you start, or the review becomes an argument about anecdotes.

**Give people a path, not a tool.** The thing to hand over is not "we have licences" but a working setup: a `CLAUDE.md` that is accurate, the hooks installed, the permission lists, and one worked example of a real ticket taken end to end. A brief that shows the workflow on a change everyone recognises is worth more than any amount of documentation.

**Make the standard the default, not a request.** Conventions in the repo, loaded automatically. Guards registered in the project settings so a clone gets them. The reason is the same as everywhere else: anything optional becomes inconsistent, and inconsistency is what makes AI output unreviewable.

**Then close the honesty gap, which is the strongest thing to raise unprompted.** Every local control — hooks, permission lists, conventions — lives in files the same developer can edit. Deleting a deny list is a one-line diff that nothing would flag. So add a CI job that hashes the governance files and verifies them on every pull request.

**Describe what that job does accurately**, because overclaiming it is the trap: it does **not** prevent tampering — a determined author edits that file too. What it changes is that disabling a guard becomes **a visible line in the diff instead of a silent absence**. And it only becomes load-bearing once it is a *required* status check; until branch protection is updated it reports and does not block. Being precise about that distinction is exactly the kind of thing a senior interviewer is listening for.

**Roll out in stages:** report-only first, so you can see the false-positive rate; then advisory; then blocking, once the noise is low enough that people trust it. A guard introduced as blocking on day one gets disabled on day two.

---

## 14. Measuring Whether It Worked

**DORA remains the foundation** — the four delivery metrics from Google's DevOps Research and Assessment programme: deployment frequency, lead time for changes, change failure rate, time to restore. But when a model writes a large share of the code, those four become misleading on their own: deployment frequency and lead time improve *because generation got faster*, while the cost lands somewhere they do not measure.

**Extend them with the things that actually move:**

| Metric | Why it matters here |
|---|---|
| **PR size and review latency** | the documented regressions: +154% and +91%. If these are not flat, the gain is being spent on review |
| **Change failure rate** | bugs rose 9% in the same study — this is where quality loss shows up |
| **Rework / code durability** | how much of last month's code was rewritten this month. Fast-written code that does not survive is not throughput |
| **Guard denial rate** | per rule. A rule firing constantly is either wrong or teaching something |
| **Escalation rate** | how often the workflow ends with a human taking over |

**The framing that scores:** the goal is not "more code" — it is **more shipped, working change per unit of human attention**. A team that doubles its merged PRs and doubles its review queue has moved the bottleneck, not removed it.

---

## 15. Anti-Patterns

- **Treating `CLAUDE.md` as policy.** It is context. Enforce with hooks.
- **A `CLAUDE.md` nobody prunes.** Past a certain length the important rules stop being followed.
- **Blocking guards on day one.** The false-positive rate is unknown, and one bad block costs you the whole programme.
- **Guards that fail closed.** A guard that blocks when it cannot evaluate something gets disabled.
- **Reviewing AI output like human output.** Different failure distribution; read the test diff first.
- **Giving the reviewer your reasoning.** You get agreement instead of review.
- **Unbounded agent loops.** Cap the rounds and define what happens at the cap.
- **Measuring adoption instead of outcomes.** Seats used is not a result. Shipped change that survives is.
- **Claiming prevention where you have detection.** Overclaiming the governance story is worse than a modest one, and an interviewer will find the seam.

---

## 16. Interview Questions & Answers

**Q1: Your resume says "AI-augmented development". What does that mean in practice on your team?**

It means the workflow changed, not just the typing. Concretely: every repo carries a `CLAUDE.md` with the commands, the layering and the non-obvious invariants, so a session starts with accurate context instead of guessing. Larger changes go through plan → implement → review → report, where the plan is approved by a human before any code exists and produces an explicit list of files the change may touch.

The part I would emphasise is that **instructions and guarantees are different things**. Prose in a context file is a request the model may or may not follow, so anything that must hold is a hook or a permission instead: writes are blocked outside the approved file list, writes to `.env` and key files are blocked outright, and a turn cannot end while the source is newer than the last green gate run. Destructive git operations are denied, anything that leaves the machine asks first.

And the review step is done by a separate context that sees only the diff and the plan — never the session that produced them — because a reviewer given your reasoning agrees with it.

---

**Q2: How do you decide what goes in `CLAUDE.md` versus a hook versus a subagent?**

By what kind of control it is. **If it must be enforced, it is a hook or a permission** — those can block, and nothing else can. **If it is knowledge that applies to some files, it is a rule** loaded by path, so it costs nothing on turns where it is irrelevant. **If it is a boundary — work that should happen in its own context — it is a subagent.** **If it is always-on guidance, it goes in `CLAUDE.md`, and it should be short.**

The corollary is the useful bit: every line you can demote from prose to enforcement makes the prose shorter *and* the guarantee stronger. "Never commit secrets" in a context file is a hope; a pre-write hook that blocks `.env` is a fact. And a shorter context file is followed more reliably, because a long one buries its own important lines — if a `CLAUDE.md` is several hundred lines, the model is effectively ignoring part of it.

---

**Q3: What does context scoping mean and why does it matter?**

The constraint is almost never the model's ability, it is the context window — and everything in it competes for attention. Context scoping is deciding what earns a place.

Four things I actually do. **Delegate searching to a subagent**: answering "how does this work?" can mean reading thirty files, and in a subagent that cost is paid in a separate window and I get back a cited conclusion. **Point rather than paste** — a path and a line range, because the model can read what it needs and I cannot un-paste 2,000 lines. **Load conventions by path**, so test conventions arrive when a test file is opened rather than on every turn. And **start a new session at task boundaries**, because a long session carries dead ends and abandoned approaches that actively mislead.

The symptom of getting this wrong is recognisable: the model re-reads files it already read, contradicts a decision made earlier in the session, or ignores a constraint you set twenty turns ago.

---

**Q4: How do you review AI-generated code differently from human code?**

The failure distribution is different, so the attention goes somewhere different. Humans make typos and off-by-ones; a model produces plausible, well-formatted code with a wrong assumption inside it.

I look first for **invented APIs** — a method or option that does not exist, used confidently — so every unfamiliar symbol gets resolved. Then **the test diff, before the source diff**, because the most dangerous single pattern is a test weakened to pass rather than a bug fixed: an assertion loosened, a case deleted, a skip added. Then **codebase-specific invariants** — in a multi-tenant system a missing tenant filter reads as completely ordinary code, which is exactly why it needs a reviewer that knows to ask. Then **scope creep**, which the plan's file list makes visible, **duplication** of a helper the model did not find, and **any dependency added**, because that is a supply-chain decision that should be human.

Process-wise, three rules: keep changes small, because review quality collapses past a few hundred lines and AI-assisted PRs grew 154% in size industry-wide; automate everything mechanical so human attention goes to logic and invariants; and the author is accountable regardless of who typed it — if you cannot explain a line in review, it does not merge.

---

**Q5: How would you roll this out to a team that has not used it?**

One team, one repo, a fixed window, and metrics agreed **before** starting — otherwise the review is an argument about anecdotes.

What I hand over is a working setup rather than a licence: an accurate `CLAUDE.md`, the guards installed and registered in project settings so a clone gets them, the permission lists, and one worked example of a real ticket taken end to end. The worked example does more than documentation, because people copy a shape they have seen.

**Staged enforcement is the part I would insist on.** Guards go in report-only first so I can measure the false-positive rate, then advisory, then blocking once the noise is low enough to trust. A guard introduced as blocking on day one gets switched off on day two, and then it guards nothing — which is why every guard I write also allows by default on any condition it cannot evaluate.

Then the honesty gap: all of that lives in files the same developer can edit, so a CI job hashes the governance files and verifies them per PR. I would describe that job accurately — it does not *prevent* tampering, it makes tampering **a visible line in the diff rather than a silent absence** — and note it is only load-bearing once it is a required status check.

---

**Q6: How do you know any of this actually helped?**

DORA as the base — deployment frequency, lead time, change failure rate, time to restore — but I would say up front that DORA alone is misleading once a model writes a large share of the code, because frequency and lead time improve from faster generation while the cost lands where those four do not look.

So I extend it with the things that actually moved in the published data: **PR size** and **review latency**, which rose 154% and 91% for high-adoption teams, **change failure rate**, where the 9% bug increase shows up, and **rework** — how much of last month's code got rewritten this month, because fast-written code that does not survive is not throughput. Internally I would also watch the **guard denial rate per rule**, since a rule firing constantly is either wrong or teaching something, and the **escalation rate**.

The framing I would put on it: the goal is not more code, it is more shipped working change per unit of human attention. A team that doubles merged PRs and doubles its review queue has moved the bottleneck, not removed it.

---

**Q7: When would you use Copilot rather than an agentic tool like Claude Code?**

They are different granularities. Inline completion is unbeatable for the mechanical middle of a function I already know how to write — it saves typing and stays out of the way. An agentic tool earns its cost when the task spans several files, needs the tests actually run, or needs the codebase investigated before anything is written.

Using the agent for a one-line completion is slow and ceremonious; using completion for a cross-cutting refactor gives you twenty individually plausible edits that do not agree with each other. Most teams run both.

The governance angle is worth adding: they need different amounts of control. A tool that only suggests text needs ordinary code review. A tool that can run commands and edit files needs permissions, hooks and a review step, because its blast radius is completely different. Match the control surface to the capability.

---

**Q8: Give me a concrete example of something you enforce mechanically rather than by convention.**

Scope. A plan lists the files a change may touch, and a pre-write hook blocks edits to anything outside that list. It matters because scope creep is the most common way an AI-assisted change becomes unreviewable — an unrequested refactor arrives bundled with the fix, and the diff triples.

Three design details in it are the reason it still exists. It **allows by default** on anything it cannot evaluate, because a guard that blocks on its own bugs gets disabled within a week. It **logs every denial** — rule id and path, never content — so the false-positive rate has a denominator instead of being a feeling. And it is deliberately paired with an advisory hook rather than another blocking one for lint: a post-write block cannot un-write the file, so it would strand the model mid-edit; putting the lint error in front of it immediately is strictly better.

The other one I would mention is the turn-end gate: a turn cannot end while source files are newer than the last green gate run. Critically, that hook **does not run the tests** — it compares timestamps against a marker that a real gate run writes. A hook that ran the suite on every turn end would add minutes to every trivial exchange and be switched off inside a week.

---

**Q9: Who is accountable when AI-generated code causes an incident?**

The person who opened the pull request. That is not a technicality — it is the only answer that keeps the incentives right, because if authorship is diluted then nobody reads the diff carefully.

What makes it honest rather than a formality is the structure around it. Changes stay small enough to actually review. The review step is done by a context that has not seen the reasoning, so it is a real second opinion. The automated gate proves the mechanical properties so human attention goes to logic and invariants. And the standard is explicit: if you cannot explain a line in review, it does not merge — which is the practical test for whether you have read what you are shipping.

I would also be honest about the thing that does not have a clean answer: an AI reviewer shares blind spots with the model that wrote the code, so it adds breadth and consistency but cannot be the last line. That is why the rounds are capped and a human settles it.

---

## 17. Tricky Questions

**Q1: You introduce hooks that block writes outside the approved plan. Within two weeks half the team has disabled them. What went wrong, and what do you do?**

Almost certainly the false-positive rate. A guard that blocks legitimate work — a genuinely necessary file the plan did not anticipate, a path it fails to parse, a missing dependency on someone's machine — trains people to route around it, and once it is off it guards nothing. The second likely cause is that it was introduced as blocking with no advisory period, so nobody had reason to trust it.

The fix has three parts. **Make the guard allow by default** on anything it cannot evaluate, so its own bugs never block anyone. **Log every denial with the rule id** so the conversation moves from "it keeps blocking me" to a rate with a denominator — three-in-five and three-in-three-hundred need completely different responses. And **stage the rollout**: report-only, then advisory, then blocking.

The deeper point is that **the guard competes with the developer's deadline, and the deadline wins.** Any control that is cheaper to disable than to satisfy will be disabled, so the design target is not maximum strictness but the strongest rule people will leave switched on.

---

**Q2: Your AI reviewer approves a change that drops a tenant filter, and it reaches production. What failed?**

Probably several things, and the useful answer separates them.

**The reviewer may have been given the reasoning.** If it received the session transcript or the author's explanation along with the diff, it was primed to agree — that is why a reviewer should get the diff, the ticket key and the base ref and nothing else.

**The reviewer may not have known what to look for.** A generic "review this code" pass finds generic problems. A missing tenant filter reads as completely ordinary code; only a reviewer told that this is a multi-tenant system and that every query must go through the scoped accessor will ask. Codebase-specific invariants have to be stated.

**And the check should not have been left to review at all.** Anything a reviewer must remember every time is a candidate for enforcement — a lint rule or a test that fails when a query bypasses the scoped accessor. The honest conclusion is that a human missed it too, so the structural fix is a mechanical check, with review as the backstop rather than the primary control.

---

**Q3: Six months in, your team ships 40% more pull requests and your change failure rate is up 9%. Was the rollout a success?**

Not as stated, and that is the point of the question. Those two numbers are the documented pattern rather than a surprise, so the interesting answer is what you do about it.

First, decide whether the failure rate rose *per change* or in aggregate. Forty percent more changes at a constant per-change risk gives more incidents without anything getting worse — unpleasant but not a quality regression. If it rose per change, quality genuinely fell.

Then look at where the cost went: PR size and review latency. If PRs got larger and reviews slower, the throughput gain was spent on review and the bugs came from changes too big to review properly — in which case the intervention is a size cap, not less AI.

And I would want **rework**: how much of that code was rewritten within a month. Shipping 40% more change that does not survive is not a 40% gain. Without that number, "more PRs" is activity rather than outcome.

---

**Q4: A developer says the workflow slows them down — the plan step is bureaucracy for a two-line fix. Are they right?**

For a two-line fix, yes, and a process that cannot say so will be abandoned wholesale. That is why the workflow is tiered: a single-file change with no interface change goes straight to implementation with the normal gate, and the plan-and-review pipeline starts where a change spans several files.

The judgement worth showing is that **the cost of the process must scale with the blast radius of the change**, and that people are quite good at classifying their own work when the tiers are clear. Where they are unreliable is a specific case worth naming: a change that looks local but crosses a contract — a frontend ticket needing a field the API does not return yet is a two-repo change even though every file you would touch is in one repo.

I would also take the complaint seriously as data. If people report friction on changes the tiers say are large, either the tiers are wrong or the steps are too heavy, and the answer is to fix the process rather than to insist on it.

---

**Q5: Your governance CI job hashes the guard files and fails when they change. A developer legitimately improves a hook and the build goes red. Is the job wrong?**

No, but the framing around it is, if a mismatch is presented as a failure. A changed guard is not automatically wrong — it means a control changed and the change needs a sentence in the pull request saying why. The job's real purpose is to make guard changes **visible**, not to freeze them.

So: regenerating the manifest is part of the change, and the PR explains what moved and what it now allows or blocks. A reviewer then treats a guard edit like any other change to a control.

What I would push back on is any claim that this *prevents* tampering. A determined author edits the CI file too. The honest description is detection: disabling a guard becomes a visible line in the diff rather than a silent absence. And it only has teeth once it is a required status check — until branch protection enforces it, it reports and nothing more. Overclaiming that is the kind of thing that falls apart under one follow-up question.

---

**Q6: The model keeps producing code that ignores a convention clearly written in your `CLAUDE.md`. What is actually wrong?**

The instinct is to write the rule again, louder. That rarely works, and the reason tells you what to do instead.

**The file is probably too long.** Past a few hundred lines the important rules are diluted by obvious ones, and adding another line makes it worse. The fix is subtraction: delete everything the model already does correctly without being told.

**Or the rule is in the wrong mechanism.** If it applies to a subset of files, it should load on those paths, not compete for attention on every turn. A rules file with no path front matter never loads automatically at all — it looks like governance and does nothing, which is the worst of both.

**Or it should not be prose.** A convention that is violated repeatedly and matters is a lint rule, a test, or a hook. Prose is a request; those are guarantees.

And one to check before any of that: **is the instruction still true?** A context file describing an aspiration, or a module that has been retired, actively misleads — the model will confidently follow a path that no longer exists, and the fault is the documentation's.

---

## 18. Cheat Sheet

**Mechanisms**
1. Hooks and permissions enforce. Everything else requests.
2. `CLAUDE.md` = always-on and short. Rules = by path. Subagents = boundaries.
3. Every line you demote from prose to enforcement strengthens both.

**`CLAUDE.md`**
4. Commands, layout, exemplars by path, non-obvious invariants with reasons.
5. Delete anything the model already gets right.
6. Say what is dead — models follow stale docs confidently.
7. Too long means partially ignored.

**Context**
8. The window is the bottleneck, not the model.
9. Delegate searching to a subagent; you get the conclusion, not the files.
10. Point at paths; do not paste files.
11. New session at a task boundary.

**Prompts**
12. Interface + exemplar + constraints + definition of done.
13. "Follow the pattern in this file" is the highest-leverage sentence available.
14. Scope the blast radius, not just the task.

**Workflow**
15. plan → implement → review → report, tiered by blast radius.
16. The plan's file list is what makes scope enforceable.
17. Reviewers get the diff and the plan — never your reasoning.
18. Cap fix-and-review at two rounds, then a human decides.

**Hooks**
19. Allow by default; a guard that blocks on its own bugs gets disabled.
20. Post-write cannot un-write — advise, do not block.
21. Never run the suite on turn end; compare against a green marker.
22. Handle hook re-entry or the session ping-pongs forever.
23. Log denials: rule id and path, never content.

**Review**
24. Read the test diff before the source diff.
25. Resolve every unfamiliar symbol — invented APIs look perfect.
26. Watch tenant/authz invariants; they read as ordinary code.
27. Small PRs. Review quality collapses past a few hundred lines.
28. The author is accountable. Cannot explain it, cannot merge it.

**Rollout**
29. Report-only → advisory → blocking.
30. Ship a working setup and one worked ticket, not a licence.
31. Verify guards in CI — but call it detection, not prevention.
32. Only a required status check is load-bearing.

**Measurement**
33. DORA is the base and is insufficient alone once AI writes much of the code.
34. Track PR size, review latency, change failure rate, rework.
35. More shipped working change per unit of human attention — not more code.

---

## 19. References

- [Claude Code — Best practices](https://code.claude.com/docs/en/best-practices)
- [Claude Code — Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code — Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code — Settings and permissions](https://code.claude.com/docs/en/settings)
- [Anthropic — Claude Code best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)
- [DORA — State of DevOps and the AI era](https://dora.dev/research/)
- [GitHub Copilot documentation](https://docs.github.com/en/copilot)
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
