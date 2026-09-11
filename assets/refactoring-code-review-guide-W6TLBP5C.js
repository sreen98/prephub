const e=`# Refactoring &amp; Code Review — Complete Guide

Refactoring is "improving the design of existing code without changing its observable behavior" (Fowler, *Refactoring*). Code review is the social process that catches what refactoring is supposed to fix — *before* the bad code ships. They're two sides of the same skill: spotting code smells, knowing the standard transformations that fix them, and giving (or receiving) feedback that improves the codebase without burning out the team.

This guide covers both. It's framework-agnostic in spirit — most examples are JavaScript/TypeScript because that's the rest of this site, but the principles are language-independent.

## Table of Contents

- [1. What is Refactoring?](#1-what-is-refactoring)
- [2. When to Refactor (and When Not To)](#2-when-to-refactor-and-when-not-to)
- [3. How to Refactor Safely](#3-how-to-refactor-safely)
- [4. Code Smells — The Catalog](#4-code-smells-the-catalog)
  - [4.1 Bloaters](#41-bloaters)
  - [4.2 Object-Orientation Abusers](#42-object-orientation-abusers)
  - [4.3 Change Preventers](#43-change-preventers)
  - [4.4 Dispensables](#44-dispensables)
  - [4.5 Couplers](#45-couplers)
- [5. Refactoring Techniques](#5-refactoring-techniques)
  - [5.1 Composing Methods](#51-composing-methods)
  - [5.2 Moving Features Between Objects](#52-moving-features-between-objects)
  - [5.3 Simplifying Conditional Expressions](#53-simplifying-conditional-expressions)
  - [5.4 Simplifying Method Calls](#54-simplifying-method-calls)
  - [5.5 Dealing with Generalization](#55-dealing-with-generalization)
- [6. Refactoring in React-Specific Code](#6-refactoring-in-react-specific-code)
- [7. Code Review — Goals and Scope](#7-code-review-goals-and-scope)
- [8. The Code Review Checklist](#8-the-code-review-checklist)
- [9. How to Write Review Comments That Help](#9-how-to-write-review-comments-that-help)
- [10. How to Receive Code Review](#10-how-to-receive-code-review)
- [11. Pull Request Hygiene](#11-pull-request-hygiene)
- [12. Common Anti-Patterns to Flag](#12-common-anti-patterns-to-flag)
- [13. Interview Questions & Answers](#13-interview-questions-answers)
- [14. Tricky Refactoring Questions](#14-tricky-refactoring-questions)
- [References](#references)

---

## 1. What is Refactoring?

Refactoring has a precise definition that's narrower than "code cleanup." Two parts:

1. **Behavior preservation.** The observable behavior of the system — its public API, the side effects, the test results — does not change. If a test passes before, it must pass after.
2. **Internal structure improvement.** Names get clearer, dependencies get cleaner, duplication goes away, intent gets more visible.

Adding a feature is *not* refactoring. Fixing a bug is *not* refactoring. **Either you change behavior or you change structure — never both in the same commit.** This separation is the entire reason refactoring is safe: when something breaks, you know which kind of change broke it.

The "two hats" rule (Kent Beck): when you sit down to code, you're wearing either the *adding feature* hat or the *refactoring* hat. You may switch hats often, but you can't wear both at once.

---

## 2. When to Refactor (and When Not To)

Refactoring is not a separate phase you do "after the project ships." It's a continuous activity, applied opportunistically when its cost is lowest.

### When to refactor

- **Rule of three.** First time, just write it. Second time, wince and duplicate. Third time, refactor. Three samples is enough to see the abstraction; one or two is a coin flip.
- **Before adding a feature.** If the code where you're about to add a feature is hard to extend, refactor it first so the feature change is small. Boy Scout rule: leave the code cleaner than you found it.
- **While fixing a bug.** A bug is often a signal that the code's structure made the bug easy to introduce. Fix the bug, then ask: what about this code lets this kind of bug exist? Refactor that.
- **During code review.** Reviewers often spot smells that the author missed. The right time to refactor is before the PR merges.
- **When you understand new context.** You learned that "user" actually means three different things in three different flows; the old name now reads as a lie. Rename it.

### When not to refactor

- **Code that's about to be deleted.** Don't polish what's about to die.
- **External APIs you don't own.** You can't safely refactor someone else's contract; you can only adapt to it (with the Adapter pattern).
- **Right before a release.** Refactoring introduces risk. A PR window of 24 hours before launch is the wrong time.
- **Without tests, on critical code.** Refactoring without a safety net is just rewriting. Either add tests first (yes, even just characterization tests that capture *current* behavior), or do a much smaller, more conservative change.
- **For style alone.** A linter handles style. A reviewer's "I'd prefer this style" is a preference, not a smell.

---

## 3. How to Refactor Safely

Big refactorings fail. Small ones succeed. Three rules:

1. **Tests pass at every step.** Not "tests pass at the end of the refactor." Run the test suite after each tiny transformation. If a test breaks, revert that single change and think — much easier than untangling ten changes at once.

2. **One refactoring at a time.** Extract a method, run tests. Rename the method, run tests. Move the method to another class, run tests. Three commits if you commit each; many people do, because git bisect on a stack of pure refactors makes a regression trivial to localize.

3. **Don't mix refactoring and behavior changes in one commit.** This is the single most violated rule and the single biggest source of "we should never have refactored" sentiment on a team. A reviewer can't tell if a 400-line diff that "rewrites X" *also* changed behavior. Split: one PR moves the code, one PR changes the logic. The diff in each is small enough to read.

The standard transformations in section 5 are designed to be **composable** — each one is small and reversible. A complex refactoring is not one big leap; it's a sequence of small, named, individually-reversible steps.

---

## 4. Code Smells — The Catalog

A "smell" is a surface symptom that something deeper might be wrong. It's not a bug; the code works. It's a signal that the structure could be better. The canonical catalog (Fowler, 1999, expanded by refactoring.guru) groups them into five families.

### 4.1 Bloaters

Code that has grown too large to comprehend at a glance.

| Smell | Symptom | Common fix |
|---|---|---|
| **Long Method** | Function spans more than ~20 lines, requires scrolling, mixes levels of abstraction | Extract Method (5.1) |
| **Large Class** | Class has 500+ lines or 30+ methods; does too much | Extract Class, Extract Subclass |
| **Primitive Obsession** | \`string\` for an email, \`number\` for a price, \`string\` for a phone — repeated everywhere | Replace primitive with an \`Email\` / \`Money\` / \`PhoneNumber\` value object |
| **Long Parameter List** | More than 3–4 parameters; callers can't remember the order | Introduce Parameter Object, Preserve Whole Object |
| **Data Clumps** | The same group of fields (\`startDate\`, \`endDate\`, \`timezone\`) appears in many places | Extract Class for the clump (\`DateRange\`) |

\`\`\`ts
// Smell: Long Parameter List + Primitive Obsession
function createBookingBefore(userId, hotelId, checkIn, checkOut, guests, currency, amount) { /* … */ }

// Refactored: Introduce Parameter Object + value objects
function createBooking({ user, hotel, dates, guests, price }: BookingArgs) { /* … */ }
\`\`\`

### 4.2 Object-Orientation Abusers

Code that uses OO incorrectly or only partially — usually because it grew procedurally and the abstractions were never extracted.

| Smell | Symptom | Common fix |
|---|---|---|
| **Switch Statements** | Long \`switch\`/chain of \`if-else\` on a type tag, repeated in multiple places | Replace Conditional with Polymorphism |
| **Temporary Field** | An object field that's set only sometimes; null/undefined the rest of the time | Introduce Null Object, Extract Class for the conditional state |
| **Refused Bequest** | Subclass inherits methods it doesn't use or doesn't make sense for it | Replace inheritance with composition; Push Down to specific subclasses |
| **Alternative Classes with Different Interfaces** | Two classes do similar things but have different method names | Rename methods to align; Extract Superclass once they match |

### 4.3 Change Preventers

Code where one logical change requires editing many places, or one place requires many different kinds of changes.

| Smell | Symptom | Common fix |
|---|---|---|
| **Divergent Change** | One class is edited for many different reasons (auth, formatting, persistence) | Extract Class along the change axis |
| **Shotgun Surgery** | Opposite: one logical change requires touching many classes | Move Method/Field to consolidate the affected logic in one place |
| **Parallel Inheritance Hierarchies** | Adding \`OrderRefund\` requires also adding \`OrderRefundProcessor\`, etc. | Fold one hierarchy into the other or use composition |

### 4.4 Dispensables

Code that, if removed, would not be missed.

| Smell | Symptom | Common fix |
|---|---|---|
| **Comments** | Comments that explain *what* the code does (a sign the code is unclear) | Extract Method with a name that says what; delete the comment |
| **Duplicate Code** | The same logic in two or more places | Extract Method; Pull Up Method; replace with a function call |
| **Lazy Class** | A class so small or under-used it doesn't justify existing | Inline Class |
| **Data Class** | A class that only holds fields with getters/setters and no behavior | Move related behavior to it; or replace with a plain interface/type |
| **Dead Code** | Code that nothing calls; old branches; commented-out blocks | Delete it. Git remembers. |
| **Speculative Generality** | "We might need a strategy interface here someday" — but you don't, today | Inline the abstraction back; keep code as concrete as the actual need |

### 4.5 Couplers

Code where modules know too much about each other.

| Smell | Symptom | Common fix |
|---|---|---|
| **Feature Envy** | A method on class A calls more methods on class B than on A | Move Method to where the data lives |
| **Inappropriate Intimacy** | Two classes reach into each other's private state | Move Method/Field; or Extract Class for the shared concern |
| **Message Chains** | \`a.b().c().d().e()\` — long chains break encapsulation | Hide Delegate (\`a.someBusinessOp()\` does the chain internally) |
| **Middle Man** | A class whose methods all delegate to another object with no added value | Remove Middle Man — call the real object directly |

---

## 5. Refactoring Techniques

The catalog of named transformations. Each one is small. Combinations of these handle every refactoring you'll do.

### 5.1 Composing Methods

The most-used family — they reshape one method's body without changing what it does.

- **Extract Method** — pull a code block out into its own named function. The single most important refactoring; if you only learn one, this is it.
- **Inline Method** — the inverse. When a method's body is more obvious than its name, replace calls with the body.
- **Extract Variable** — give a sub-expression a name so the next reader doesn't have to decode it.
- **Replace Temp with Query** — instead of computing a value into a temp variable, extract it into a method that's called on demand.
- **Substitute Algorithm** — replace the body of a method with a clearer implementation that produces the same output.

\`\`\`js
// Before: implicit logic, hard to scan
function totalForOrder(order) {
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.qty;
    if (item.discount) total -= item.discount;
  }
  total = total + total * 0.07;        // tax
  return total;
}

// After: Extract Method, Extract Variable
function totalForOrderV2(order) {
  const subtotal = sumLineItems(order.items);
  return applyTax(subtotal);
}

function sumLineItems(items) {
  return items.reduce((sum, item) => sum + lineItemTotal(item), 0);
}

function lineItemTotal(item) {
  return item.price * item.qty - (item.discount ?? 0);
}

const TAX_RATE = 0.07;
function applyTax(amount) {
  return amount * (1 + TAX_RATE);
}
\`\`\`

### 5.2 Moving Features Between Objects

When responsibilities are in the wrong class:

- **Move Method / Move Field** — the method belongs on the data it operates on. Move it.
- **Extract Class** — when one class does two unrelated things, split.
- **Inline Class** — when a class adds no value over its caller, fold it in.
- **Hide Delegate** — replace \`a.getB().doX()\` with \`a.doX()\`. The caller doesn't need to know \`B\` exists.

### 5.3 Simplifying Conditional Expressions

- **Decompose Conditional** — extract the condition, then-branch, and else-branch each into named methods. The point is making each piece readable, not minimizing line count.
- **Consolidate Conditional Expression** — when several \`if\`s with different bodies all fall through to the same result, combine them into one OR-chained condition.
- **Replace Nested Conditional with Guard Clauses** — flat-and-early-return is easier to read than deeply nested if-else.
- **Replace Conditional with Polymorphism** — when a \`switch\` on a type tag drives different behavior, replace with polymorphic dispatch (subclasses, strategy, or a discriminated-union map of functions).
- **Introduce Null Object** — replace null checks with a do-nothing object that satisfies the same interface.

\`\`\`js
// Before: Nested Conditional
function shippingCost(order) {
  if (order.country === 'US') {
    if (order.weight > 10) {
      if (order.express) return 50;
      else return 25;
    } else {
      return 10;
    }
  } else {
    return 80;
  }
}

// After: Guard Clauses
function shippingCostV2(order) {
  if (order.country !== 'US') return 80;
  if (order.weight <= 10) return 10;
  return order.express ? 50 : 25;
}
\`\`\`

### 5.4 Simplifying Method Calls

- **Rename Method** — names are the cheapest, highest-leverage code change you can make.
- **Add / Remove Parameter** — change the API signature.
- **Separate Query from Modifier** — a method that both returns a value and changes state should be split into two.
- **Introduce Parameter Object** — collapse a long parameter list into one structured arg.
- **Replace Constructor with Factory Method** — gives you a name and the freedom to return subclasses or pooled instances.

### 5.5 Dealing with Generalization

For class hierarchies (relevant in TS / OO codebases; less in idiomatic React):

- **Pull Up Method/Field** — move shared behavior into the superclass.
- **Push Down Method/Field** — move specific behavior down into the subclass that needs it.
- **Extract Superclass / Interface** — when two classes share behavior, extract.
- **Replace Inheritance with Delegation** — when "is-a" is the wrong relationship, hold the supertype as a field instead of inheriting.

---

## 6. Refactoring in React-Specific Code

Component code has its own canonical refactorings beyond Fowler's list:

- **Extract Custom Hook.** When two components share \`useState\` + \`useEffect\` + handlers around the same concern (form state, debounced search, persisted prefs), extract \`useFoo()\`. Same idea as Extract Method but for stateful logic.

- **Extract Component.** When a component's JSX has more than ~80 lines or its \`return\` is hard to scan, find the cohesive block and extract \`<SubComponent {...} />\`. Cheaper to test, cheaper to memoize.

- **Move state down.** When a piece of state is only used by one subtree, push it down. The smaller the subtree that owns the state, the smaller the re-render scope.

- **Lift state up.** When two siblings need to coordinate, lift the state to their common parent. Don't reach for Context until you've actually seen the prop drilling hurt.

- **Replace \`useEffect\` with derivation.** A common smell: \`useEffect(() => setX(deriveFrom(y)), [y])\`. Almost always wrong — derive \`x\` directly during render. Only use \`useEffect\` for *synchronization with external systems*.

- **Replace prop drilling with Context** *(only when 3+ levels deep)* — and even then, prefer composition first (passing the rendered child down as a prop) before reaching for Context.

- **Replace \`class extends React.Component\` with hooks** — for new code, always. Old code only when you're touching it for another reason.

- **Replace \`bind\`/\`.apply\` and arrow functions in JSX** with \`useCallback\` or hoisted handlers — but only after the Profiler tells you it matters.

- **Replace inline conditionals with early returns.** A render function with 5 nested ternaries is unreadable; 5 early returns is fine.

- **Co-locate.** Components, their tests, their styles, their stories, their hooks — they all live next to each other. Don't split by file type into \`/components/\`, \`/styles/\`, \`/hooks/\`.

---

## 7. Code Review — Goals and Scope

A code review has four goals, in priority order:

1. **Correctness.** Does it work? Does it handle the edge cases? Does the test suite cover what it claims to?
2. **Design.** Is the change in the right place? Does it use the project's existing patterns? Will the next change be easier or harder because of this one?
3. **Maintainability.** Will someone six months from now understand this? Are names clear? Is there commented-out code, TODO comments without an owner, magic numbers, dead branches?
4. **Style/Nit consistency.** Does it match the project's voice? (Linter handles most of this; humans handle the parts a linter can't.)

A review is **not** for:

- Re-litigating the architectural decision that produced this change. That conversation belongs in a design doc, not in line-by-line PR comments.
- Personal style preferences disguised as quality concerns ("I would have used \`for...of\` here"). If the codebase isn't consistent enough for a linter rule, your preference isn't a rule.
- Showing off. The reviewer's job is to make the *codebase* better, not to outrank the author.

The most important thing a reviewer can ask themselves: *"Is the code, after this change, better than before?"* If yes, the change is approvable. Not "is this the code I would have written" — *better than before*. Perfect is the enemy of merged.

---

## 8. The Code Review Checklist

A practical checklist, ordered roughly by what to look at first:

**Correctness**
- [ ] The PR description matches the diff. (Author claimed feature X; the diff actually does X.)
- [ ] The happy-path test is meaningful (not just "function returns truthy").
- [ ] Edge cases: empty input, null/undefined, very large input, concurrent calls, network failure.
- [ ] Error paths: are they handled, swallowed silently, or just unhandled?
- [ ] No off-by-one, fence-post, or boundary mistakes.

**Design**
- [ ] The change is in the right module. (Not a 3-line fix in a \`helpers.ts\` that should be in the feature folder.)
- [ ] No new circular dependencies between modules.
- [ ] Public API surface is minimal — if a function/export doesn't need to be public, it isn't.
- [ ] No premature abstraction (single-implementation interfaces, factory of one).

**Performance**
- [ ] No O(N²) inside a hot loop, no N+1 query in a list render.
- [ ] No unbounded data structures (queue/cache/array that can grow without limit).
- [ ] Heavy work isn't in render; not in a synchronous handler.

**Security**
- [ ] User input is validated at the boundary; SQL/HTML/template values are escaped.
- [ ] Auth is checked on the server, not just the UI.
- [ ] Secrets aren't logged, committed, or sent to the client.

**Tests**
- [ ] Tests fail without the change (proving they cover the right thing).
- [ ] Tests don't depend on real network, real time, or real filesystem unless it's explicit.
- [ ] No \`.skip\` or \`.only\` left over.

**Naming &amp; clarity**
- [ ] Names describe intent, not implementation. \`userSet\` is worse than \`selectedUsers\`.
- [ ] No \`data\`, \`info\`, \`value\`, \`result\`, \`temp\` as primary identifiers.
- [ ] No commented-out code; no \`// TODO: fix this later\` without an issue link.

**Hygiene**
- [ ] Diff is reasonably scoped (refactor + feature in same PR is a smell).
- [ ] Commit messages explain *why*, not just *what*.
- [ ] No unrelated formatting churn making the real change hard to read.

---

## 9. How to Write Review Comments That Help

The **single most-corrected** code-review behavior at any senior-engineering level is *tone*. Same content, different framing — completely different effect on the team's learning velocity.

**Use a comment-prefix convention** so the author knows which comments block the merge and which are optional:

\`\`\`
nit:        — purely stylistic, not blocking. Author can ignore.
question:   — I genuinely don't understand. Help me out.
suggestion: — non-blocking, "you might prefer this."
issue:      — I think this is a bug or a problem worth fixing before merge.
blocking:   — this must change before I approve.
\`\`\`

Adopting a convention like this once team-wide saves countless cycles of "is this a hard requirement or a preference?"

**Frame as questions when uncertain.** "Why this approach over X?" reads as collaboration. "This is wrong, you should use X" reads as "I'm right, you're wrong" even if you're correct on the technical point.

**Always give a reason.** "Use a Map here" is less useful than "Use a Map here — array \`.find\` makes this O(N²) in the loop above." The reason teaches the principle that applies to the *next* PR, not just this one.

**Suggest, don't demand.** GitHub's "Suggestion" syntax (\\\`\\\`\\\`suggestion ... \\\`\\\`\\\`) lets the reviewer propose an edit the author can apply with one click. Use it for small fixes; saves a round trip.

**Say what's good.** A PR that's all critique is demoralizing even when every critique is correct. "This abstraction is the right call" or "good catch on this null check" doesn't cost you anything and balances the feedback.

**Don't pile on.** If three reviewers have already flagged the same issue, you don't need to be the fourth. Add an emoji reaction instead.

**Ship-it for non-blocking.** If your only comments are nits and questions, approve the PR and let the author merge after addressing them. Don't block on aesthetics.

---

## 10. How to Receive Code Review

The other half of the loop, and the half engineers tend to under-invest in:

- **Don't take it personally.** The reviewer is critiquing the code, not the author. Reread comments after a few hours if a first read stings — the second read is almost always fine.
- **Engage with the technical point.** "This is wrong because X" deserves "you're right, fixing" or "I disagree because Y" — both are productive. Silence isn't.
- **Push back, with reasons.** If you disagree, say so. The reviewer might be missing context only you have. Code review is a dialogue, not a verdict.
- **Make the suggested change in a follow-up commit, not by force-pushing.** The reviewer can see exactly what changed in response to feedback. Squash before merge.
- **Ask for re-review explicitly.** GitHub's "Re-request review" button. Don't leave reviewers guessing whether you want another look.
- **When you ignore a nit, say so.** "Leaving as-is — not worth the change" is better than silently dismissing the comment. The reviewer might have agreed if you'd explained.

---

## 11. Pull Request Hygiene

Bad PRs — too big, mixed concerns, no description — burn reviewer time even when the code is correct. Good PR hygiene is one of the highest-leverage skills you can build.

**Size**

- Aim for **under 400 lines** of changes (excluding generated files, lockfile bumps). Past that, review quality drops sharply — reviewers skim instead of read.
- If a change has to be 2000 lines, split it: one PR introduces the new structure (mostly green diff), one moves callers over, one deletes the old code.
- **One feature, one PR.** A feature plus a refactor is two PRs.

**Description**

- **Why** this change exists (link the issue/ticket).
- **What** changed at the conceptual level. Don't restate the diff; the diff says that.
- **How to verify** — what URL to visit, what command to run, what to look for.
- **Anything risky** — known unknowns, follow-up work, things you punted on.

**Commits**

- Each commit should pass tests on its own (so \`git bisect\` works).
- Use **conventional commits** (\`feat:\`, \`fix:\`, \`refactor:\`, \`test:\`, \`docs:\`, \`chore:\`) if your team has adopted them — they make changelogs trivial.
- Squash-merge or rebase-merge by default; the PR's commit log inside it is for the reviewer's benefit, not for \`main\`.

**Drafts**

- Open PRs as drafts when you want feedback on direction but not line-by-line review yet. Don't put a finished PR up and write "draft, ignore the lines" — reviewers won't.

---

## 12. Common Anti-Patterns to Flag

Things that should fail review without much discussion:

- **God objects / God components.** A 1000-line component or a class that does five unrelated things.
- **Magic numbers and strings.** \`if (status === 3)\` — what's 3? Extract a named constant.
- **\`any\` in TypeScript** without a comment explaining why. \`any\` defeats the type system.
- **Catching exceptions with empty handlers** (\`try { ... } catch {}\`). At minimum log; ideally rethrow or handle.
- **Disabling tests, lint rules, or type errors** (\`// eslint-disable\`, \`// @ts-ignore\`, \`.skip\`) without a comment explaining why. These should be rare and dated.
- **Mutating shared state** (props, store state, function arguments). Especially in React — the framework is built on the assumption you don't.
- **Async/await without \`try/catch\`** in a path where errors aren't caught upstream.
- **\`useEffect\` with missing/wrong dependencies.** The lint rule exists for a reason.
- **Indexed list keys** when the list can reorder, splice, or filter (see React Guide § 14.4).
- **Auth/permission checks only in the UI.** "Hide the admin button" is not authorization.
- **Logging PII or secrets.** Audit-logged is not sanitized.
- **N+1 queries.** A loop that triggers a database call per iteration. Use a join or batch.
- **Inconsistent error contracts.** Half the API returns \`{ error }\`, the other half throws — pick one.
- **Snapshot tests asserting nothing meaningful.** A snapshot of "this component renders some HTML" catches accidental regressions, not behavior.

---

## 13. Interview Questions & Answers

### Beginner

---

**Q1: What's the difference between refactoring and rewriting?**

Refactoring is **incremental** — small, behavior-preserving changes applied in sequence, with tests passing at every step. The system never stops being shippable. Rewriting throws away the existing code and starts over; the system is broken until the rewrite is done.

The risk profile is completely different. A refactor that breaks gets reverted in one commit; a rewrite that breaks loses weeks. Joel Spolsky's classic essay *"Things You Should Never Do, Part I"* argues that rewrites are the single biggest strategic mistake software teams make — Netscape did it and lost the browser war. Real-world, prefer refactoring; rewrite only when the existing system has become genuinely impossible to extend (and even then, do it module-by-module via the **strangler fig pattern**, not all at once).

---

**Q2: What's the "rule of three" in refactoring?**

When you see a piece of code:

1. The first time, just write it. You don't yet know what abstraction you'd want.
2. The second time, wince and duplicate it. You still don't have enough samples.
3. The third time, refactor. By now you have three concrete shapes, and the abstraction that fits all three is visible.

The reason is that *premature abstraction* is more expensive than duplication. An abstraction that fits two cases often turns out not to fit the third — and now you have to refactor *the abstraction*, which is harder than refactoring three concrete duplicates would have been. Three samples gives you enough variation to see the right shape.

---

**Q3: What's a "code smell" and how is it different from a bug?**

A bug is a behavior failure — the program does the wrong thing. A code smell is a *structural* signal that the code might be hard to maintain, extend, or reason about — but the code works. Long methods, duplicate code, large classes, primitive obsession — none of these break tests, but each makes the next change more expensive.

Smells are heuristics, not rules. A 200-line method might be fine if it's a state machine that just lists out the cases; a 50-line method might be too long if it does five different things. The skill is recognizing the smell *and* knowing when it's actually load-bearing in this context.

---

**Q4: What are guard clauses and why are they preferred over nested conditionals?**

Guard clauses are early returns that handle edge cases at the top of a function:

\`\`\`js
function process(user) {
  if (!user) return null;
  if (!user.active) return null;
  if (user.role !== 'admin') throw new ForbiddenError();
  // happy path here, undented
  return doTheThing(user);
}
\`\`\`

Compare to the nested version, which keeps adding indentation for each check, leaving the happy path buried in \`if-else-else\` at maximum depth. Two reasons guard clauses win:

1. **The reader reaches the happy path faster** — it's at the bottom of the function with no left-margin nesting.
2. **Each precondition is local.** The reader sees "if X is wrong, leave" and can dismiss that case from short-term memory before reading on.

There are languages where this is harder (single-return-per-function disciplines), but in JS/TS, guard clauses are idiomatic and almost universally preferred.

---

**Q5: When should you write a comment?**

Almost never to explain *what* the code does — well-named code already does that. Write a comment when:

- The code does something **surprising** for a reason that isn't obvious from reading it ("we sort by \`id desc\` because the db's default index is on \`id asc\` and reversing here is faster than \`ORDER BY id DESC\`").
- A constraint is invisible from the code ("this function must be re-entrant — runs concurrently from two callers").
- A workaround references an external bug ("Safari 16.4 bug — see https://...").
- A non-obvious gotcha awaits the next reader ("don't move this \`await\` above the lock release; deadlocks").

If a comment explains *what*, the answer is usually: rename a variable, or extract a method whose name says the *what*, and delete the comment.

---

### Intermediate

---

**Q6: Walk through how you'd refactor a 200-line component with mixed UI, state, and side effects.**

One refactor at a time, tests passing throughout:

1. **Read it once, end-to-end.** Don't change anything yet. Build the mental model of what it does.
2. **Add a regression test** if there isn't one. A character-stylized test that captures *current* output is better than nothing.
3. **Extract obvious sub-components first.** A 50-line render block that produces a card → \`<UserCard />\`. Pass the data down. No logic moves yet.
4. **Extract custom hooks for cohesive state.** Search-with-debounce, modal open/close, form state — each becomes \`useFoo()\`. The component shrinks; the hook can be tested in isolation.
5. **Replace \`useEffect\`-as-derivation with derivation in render.** \`useEffect(() => setX(deriveFrom(y)), [y])\` is almost always wrong; compute \`x\` directly.
6. **Move data fetching into a hook or query layer** (\`useQuery\`, \`useFooData\`). Render code shouldn't know about HTTP.
7. **Co-locate.** The hooks, sub-components, and tests for \`<UserDashboard>\` live in \`UserDashboard/\`.

After each step, the diff is small and reviewable, and the test suite still passes.

---

**Q7: What's "primitive obsession" and how do you fix it?**

Primitive obsession is using language primitives (\`string\`, \`number\`, \`boolean\`) for concepts that have richer behavior or invariants — emails, money, distances, IDs, phone numbers. The smell shows up as repetitive validation, formatting, and conversion code scattered across the codebase, and as bugs where two values that "look like strings" are accidentally combined wrong (USD + EUR, miles + kilometers).

The fix is to introduce **value objects** that encapsulate the type plus its rules:

\`\`\`ts
class Money {
  constructor(readonly amount: number, readonly currency: 'USD' | 'EUR') {}
  add(other: Money) {
    if (other.currency !== this.currency) throw new Error('mismatched currency');
    return new Money(this.amount + other.amount, this.currency);
  }
}
\`\`\`

In TS, **branded types** are a lightweight version: \`type Email = string & { __brand: 'Email' }\` plus a constructor that validates. The compiler then refuses to pass a \`string\` where an \`Email\` is expected, even though at runtime it's still a string.

---

**Q8: Explain "Replace Conditional with Polymorphism" with an example.**

When you find a \`switch\` (or chain of \`if-else\`) on a type discriminator, repeated in multiple places, replace it with polymorphic dispatch.

Before:
\`\`\`js
function describe(animal) {
  switch (animal.kind) {
    case 'dog': return \`\${animal.name} barks\`;
    case 'cat': return \`\${animal.name} meows\`;
    case 'bird': return \`\${animal.name} chirps\`;
  }
}
function feed(animal) {
  switch (animal.kind) {
    case 'dog': return giveKibble(animal);
    case 'cat': return giveFish(animal);
    case 'bird': return giveSeeds(animal);
  }
}
\`\`\`

Adding a new \`kind\` requires editing every site. After:

\`\`\`js
class Animal { describe() { throw 'abstract' } feed() { throw 'abstract' } }
class Dog  extends Animal { describe() { return \`\${this.name} barks\` } feed() { giveKibble(this) } }
class Cat  extends Animal { describe() { return \`\${this.name} meows\` } feed() { giveFish(this) } }
class Bird extends Animal { describe() { return \`\${this.name} chirps\` } feed() { giveSeeds(this) } }

animal.describe();   // dispatch happens automatically
animal.feed();
\`\`\`

In FP-leaning JS, the same idea is a **map of functions** keyed by the discriminator:

\`\`\`js
const handlers = {
  dog:  { describe: a => \`\${a.name} barks\`,  feed: giveKibble },
  cat:  { describe: a => \`\${a.name} meows\`,  feed: giveFish },
  bird: { describe: a => \`\${a.name} chirps\`, feed: giveSeeds },
};
handlers[animal.kind].describe(animal);
\`\`\`

Either way, the switch is gone; adding \`Fish\` is one new entry, not five.

---

**Q9: What's the strangler fig pattern and when do you use it?**

Named after the fig tree that grows around a host tree and gradually replaces it. The pattern: build the new system *next to* the old one, route a small fraction of traffic to it, expand the new system's coverage one feature at a time, and eventually delete the old one. The system is always shippable; the migration is incremental; there's never a "big bang" cutover.

This is the modern alternative to a rewrite. Real examples:
- Migrating a Rails monolith to microservices: extract one bounded context at a time behind a proxy.
- Rebuilding a React app on Next.js: route a subset of pages to Next, the rest to the legacy app.
- Replacing a SQL schema: dual-write to both, read from old, gradually flip reads to new, then drop old.

The cost is tooling — you need a proxy/feature-flag layer that can route to either system. The win is risk reduction: at every point, the percentage of traffic on the new system is a number you control.

---

### Advanced

---

**Q10: How do you refactor without tests?**

The honest answer: very, very carefully. Two strategies:

**1. Add characterization tests first.** Don't try to make them "the right tests." Capture *current* behavior — black-box, end-to-end, snapshot-style. They lock in whatever the system does today, including the bugs. Now refactor; if a test fails, you changed observable behavior — back out and retry. After the refactor, you can rewrite the tests properly because the code is now testable.

**2. Use only mechanical, IDE-assisted refactorings.** Rename, Extract Method, Inline Method, Move Method — these are syntactically safe; the tool can prove they preserve behavior (modulo some edge cases). Bigger refactors (Replace Conditional with Polymorphism, Extract Class) are riskier without tests.

The framing that helps: "The code's behavior is the spec." Untested code is *defined* by what it does today; refactoring is "make the code better while keeping today's behavior." Every test you can add up front shrinks the space of "today's behavior" to something you can verify.

Books worth reading on this: Michael Feathers, *Working Effectively with Legacy Code*. The whole book is about how to break dependencies in untestable code so you can add a test, then refactor.

---

**Q11: What are the trade-offs between async / pair / synchronous code review?**

| | Async (PR comments) | Pair / mob | Synchronous review |
|---|---|---|---|
| Speed of feedback | Hours-to-days | Real-time | Real-time |
| Calendar cost | None — reviewer fits it in | High — both engineers | High — meeting |
| Knowledge spread | Limited to author + reviewer | Maximum | High |
| Audit trail | Excellent (in PR) | None unless documented | Limited |
| Best for | Most changes; distributed teams | Hard or risky changes; onboarding | Architectural reviews |

Most teams use async PR review as the default and reach for pair-programming for the 5% of changes where sync collaboration justifies the calendar cost — usually a tricky bug, a security-sensitive change, or onboarding a new engineer through a critical area.

---

**Q12: How do you decide whether to refactor or accept the smell?**

Three questions:

1. **How often will this code be touched?** Smells in hot code (touched weekly) cost more than smells in stable code (touched yearly). Refactor the hot stuff first.
2. **How big is the refactor relative to the next planned change?** If the change adds a fourth case to a smelly switch, the polymorphism refactor pays back immediately. If the next change is unrelated, the refactor is speculative.
3. **What's the blast radius if it goes wrong?** Refactoring core auth code is riskier than refactoring a leaf component. Risk-weight the decision.

The wrong frame is "this code is bad, therefore I should refactor." The right frame is "this code is bad *and* the cost of leaving it is greater than the cost of fixing it now." Sometimes accept-and-document is the right call — open an issue, note the smell, move on.

---

## 14. Tricky Refactoring Questions

Practice questions testing the more subtle aspects.

### Smells &amp; Diagnoses

---

**Q1: A method calls \`customer.getAccount().getBalance().getValue()\`. Is this a smell, and if so, which one and what's the fix?**

**Output:** Yes — this is a **Message Chain** (Couplers family).

**Explanation:**

The caller knows three things it shouldn't have to know: that a customer has an account, that the account has a balance object (not just a number), and that the balance object has a \`getValue()\` accessor. If any of those internal types changes — say, the balance moves to a separate "wallet" service, or \`Balance\` becomes just a \`number\` — every caller breaks.

The smell is **Inappropriate Intimacy** in disguise: the calling method has too much knowledge of the customer's internal structure. The fix is **Hide Delegate** — push the chain into one of the intermediate objects so the caller asks one question:

\`\`\`js
// Before
const balance = customer.getAccount().getBalance().getValue();

// After — the customer hides its account internals
const balanceV2 = customer.getCurrentBalance();   // returns a number
\`\`\`

Now the customer's implementation of "what is the balance" can change freely without any caller noticing. There's a counter-smell to watch for: if \`Customer\` ends up with 50 pass-through methods that just delegate to its account, you've created **Middle Man** and the next refactor is to give callers direct access to the account *or* fold the account into the customer entirely.

The Law of Demeter ("only talk to your immediate friends") captures this in a single rule: a method should call only methods of its own object, its parameters, objects it creates, and direct fields. Chains of three or more reads usually violate it.

**Takeaway:** Long getter chains leak internal structure to callers. Use Hide Delegate to expose intent (\`getCurrentBalance\`) instead of structure (\`getAccount().getBalance().getValue()\`).

---

**Q2: A \`User\` class has fields \`street\`, \`city\`, \`state\`, \`zip\`, \`country\`, and a \`Booking\` class also has \`street\`, \`city\`, \`state\`, \`zip\`, \`country\`. What's the smell and the fix?**

**Output:** Data Clump (Bloaters family).

**Explanation:**

Whenever the same group of fields travels together in multiple classes — and worse, the same group appears in method signatures (\`updateAddress(street, city, state, zip, country)\`) — that group is begging to be its own concept. The cluster has a name (\`Address\`); the fact that you don't have a class for it is the smell.

The fix is **Extract Class** for the clump. Replace each occurrence of the five fields with one \`Address\` field:

\`\`\`ts
class Address {
  constructor(
    readonly street: string,
    readonly city: string,
    readonly state: string,
    readonly zip: string,
    readonly country: string,
  ) {}
  format(): string { /* ... */ }
  isInUS(): boolean { return this.country === 'US'; }
}

class User { address: Address; /* ... */ }
class Booking { shippingAddress: Address; billingAddress?: Address; }
\`\`\`

Three downstream wins:

1. **Method signatures shrink.** \`updateAddress(address: Address)\` is one parameter instead of five — this also fixes a likely **Long Parameter List** smell next door.
2. **Behavior gravitates to the right place.** Address-formatting and validation move onto \`Address\`; both \`User\` and \`Booking\` get them for free. Pre-refactor, that logic was probably duplicated in both classes (a **Duplicate Code** smell) — the data clump and the duplication had the same root cause.
3. **Type safety improves.** Passing a billing \`Address\` where a shipping \`Address\` was expected requires an explicit decision; passing five anonymous strings makes the swap silent.

The data clump smell is upstream of several others — Long Parameter List, Duplicate Code, Primitive Obsession can all be cured by the same Extract Class. The first time you fix one, you'll spot the others immediately.

**Takeaway:** Fields that always travel together want to be a class. Extract Class shrinks parameter lists, eliminates duplicate behavior, and gives you a place for related methods.

---

**Q3: A function takes 8 parameters: \`function createUser(name, email, age, role, country, theme, language, timezone)\`. The reviewer says "introduce a parameter object" — but the author says "but they're all just primitives, what's the win?" Who's right?**

**Explanation:**

Both have a point, but the reviewer wins the argument. The wins from introducing a parameter object aren't about the *primitives* — they're about everything else.

1. **Argument-order bugs.** With 8 positional args, \`createUser('alice@x.com', 'Alice', 30, ...)\` (email and name swapped) compiles fine and produces a wrong user named "alice@x.com." With a parameter object, the call site is \`createUser({ email: 'alice@x.com', name: 'Alice', age: 30 })\` — order doesn't matter and the swap is impossible.

2. **Optional and defaulted parameters become trivial.** With positional args, an optional \`theme\` after a required \`language\` requires you to remember to pass \`undefined\` for omitted preceding optionals. With an object, you just don't include the key.

3. **Future change cost.** Adding a 9th parameter to a positional API is a breaking change for every caller. Adding a 9th key to an object parameter is a non-breaking addition (with a default).

4. **Cohesion signal.** If the same 8 fields keep appearing together — \`createUser\`, \`updateUser\`, \`validateUser\` — they're a **Data Clump** that wants its own class (\`UserDraft\`, \`UserSpec\`). The parameter-object refactor often surfaces this insight.

5. **Self-documenting calls.** \`createUser('US', 'dark', 'en', 'America/New_York', ...)\` is cryptic; \`createUser({ country: 'US', theme: 'dark', language: 'en', timezone: 'America/New_York' })\` is readable in a code review.

The author's "they're all just primitives" framing misses the point — the smell isn't about the primitives' types; it's about the *count* and the *call-site fragility*. Long Parameter List is a top-five smell precisely because every one of the wins above compounds across hundreds of call sites.

A small caveat: object parameters are slightly more expensive than positional in microbenchmarks (V8 has to allocate the literal). For hot loops calling thousands of times per frame, positional can matter. For 99% of code, the readability/safety wins dominate.

**Takeaway:** Introduce Parameter Object eliminates argument-order bugs, makes calls self-documenting, makes future changes non-breaking, and surfaces hidden Data Clumps — none of which are about the parameters being primitives.

---

### Refactoring Mechanics

---

**Q4: You're about to apply Extract Method to a 30-line block in the middle of a function. The block uses 4 variables from the enclosing scope and updates 2 of them. What's the catch, and what do you do?**

**Explanation:**

Extract Method is mechanically simple when the block reads from enclosing scope but doesn't write to it: the read variables become parameters; the block's last expression is the return value; you call the new method where the block was. Tests pass; you're done.

The catch is the **two updated variables**. A function returns one value, but the block needs to communicate two updates back. There are three honest ways to handle this, in increasing order of smelliness:

1. **Return an object** with both updated values. Caller destructures.
   \`\`\`js
   const { x, y } = doThing(a, b, x, y);
   \`\`\`
   Clean and explicit. No hidden coupling. Best default.

2. **Apply Replace Temp with Query first.** If \`x\` and \`y\` are temporary variables holding intermediate results, maybe each one should be its own extracted method that recomputes. Two calls instead of one, but each method has a single return.

3. **Mutate via reference.** Pass an object and have the new method mutate it (\`function update(state, ...) { state.x = ...; state.y = ... }\`). Works in JS but creates the exact coupling Extract Method was supposed to break — the caller can't reason about what changed without reading the callee. **Avoid unless you're modeling something that's genuinely stateful.**

The deeper question: if a 30-line block updates two enclosing variables, the *containing function* is probably a **Long Method** with multiple responsibilities, and the right refactor isn't "Extract Method on the block" — it's "decompose the function so each piece has one job." Replace Temp with Query, applied to all the temps, often shrinks the function down so the original "two updated vars" problem dissolves.

A real example: in event-handler-heavy React code, the temptation is to \`useState\` for any value the handler updates. Often the right move is to derive the value during render rather than store it; the "two updated vars" become two pure expressions.

**Takeaway:** Extract Method for blocks that update enclosing scope is harder than it looks — return an object, or refactor the surrounding function first. If the natural extract requires mutating two outer variables, the surrounding function is likely doing too much.

---

**Q5: A reviewer comments: "Replace this \`if/else\` with polymorphism." The author replies: "It's only 3 cases and it's a single switch — polymorphism would be over-engineering." Who's right?**

**Explanation:**

This is one of the most common code-review disagreements, and the answer is "it depends — but the reviewer is asking the wrong question."

The right question isn't *"3 cases or 30?"* It's *"how many switches on the same discriminator are scattered through the codebase?"* If the entire app has exactly one switch on \`payment.type\`, leaving it as a switch is fine — there's nothing to consolidate. If \`payment.type\` is switched on in 7 places (\`format\`, \`validate\`, \`process\`, \`refund\`, \`display\`, \`tax\`, \`audit\`), every new payment type requires editing 7 functions, you'll forget one, and the bug shows up six months later when the new type's audit log is empty. *That* is the problem polymorphism solves: not the local switch, but the cross-cutting "where do I add a new variant" cost.

So the answer to the reviewer/author dispute:

- **Author is right** if this is the only switch on this discriminator. Polymorphism here adds boilerplate without changing the cost of adding a variant. Mark it with a comment if there's a chance a second switch appears later.
- **Reviewer is right** if there are already 2-3 other switches on the same discriminator. Replace Conditional with Polymorphism (or the strategy-map equivalent) is the right refactor, *and* the right time is now — before the fourth one appears.

A diagnostic that catches this is grep: search for the discriminator (\`payment.type\`, \`event.kind\`, \`user.role\`) — if it appears in three or more files outside the type definition, the polymorphism refactor probably pays off. In TS, **discriminated unions** with \`never\` exhaustiveness checks are a lighter middle ground:

\`\`\`ts
type Payment = { type: 'card'; cvv: string } | { type: 'bank'; iban: string } | { type: 'cash' };

function describe(p: Payment): string {
  switch (p.type) {
    case 'card': return \`card ending in \${p.cvv.slice(-4)}\`;
    case 'bank': return \`bank account \${p.iban}\`;
    case 'cash': return 'cash';
    default:
      const _exhaustive: never = p;   // compile error if a new variant is added
      return _exhaustive;
  }
}
\`\`\`

The compiler now forces you to update every switch when you add a new variant. That's most of polymorphism's value with none of the class hierarchy.

**Takeaway:** "Switch vs polymorphism" depends on how many switches there are on the same discriminator, not on the number of cases. One switch — leave it. Three or more — refactor (or use a discriminated union with exhaustiveness checks for the typed-language equivalent).

---

### Code Review Judgement

---

**Q6: A junior engineer's PR has a 600-line diff. The review reveals: the feature works, but the structure is messy — names are unclear, there's some duplication, two components could be extracted. The PR has been sitting for three days and the engineer is anxious about it. Do you ask for the structural changes before approving, or approve and request follow-up?**

**Explanation:**

The wrong frame is "is the structure ideal?" The right frame is "is it ideal *enough* given the cost of asking for changes?" Three competing forces:

1. **PR latency erodes engineer engagement.** A PR sitting for three days with a "now please refactor" comment is demoralizing. Developer velocity over a quarter is dominated by how many "near-done" PRs are stuck.
2. **Structural debt accumulates.** Things you don't fix in review almost never get fixed later — there's no calendar slot for "go fix the names from that PR three months ago." Once it merges, it's how the codebase looks.
3. **Junior engineer growth.** The PR is also a teaching moment. *Some* feedback on structure is the entire point — that's how juniors learn.

The senior-engineer move is to **separate the concerns**:

- **Block on:** anything that's a correctness issue, a security issue, a regression risk, or that becomes much harder to fix once merged. ("This auth check is missing on the server.")
- **Don't block on:** anything that's a follow-up-able structural improvement. ("These two components are similar enough to extract; let's open an issue and follow up next sprint.")

Approve the PR. Request a follow-up. Do *one* of the structural improvements yourself in a small follow-up PR — the junior sees the move applied to their own code, learns more from that than from a review comment, and the codebase doesn't accumulate the debt. This costs you 30 minutes and pays back tenfold.

The exception is if the engineer is at a senior level where structural code is part of their job grade. Then "please make it better" is fair feedback, and three days of latency is a process problem to fix at the team level (faster review SLAs, smaller PRs by default), not a reason to lower the bar.

**Takeaway:** Separate "blocks merge" feedback from "follow-up" feedback. Approve when the change is a net improvement, even if not ideal. PR latency has compounding costs; ideal structure has diminishing returns once the code is *good enough*.

---

**Q7: A PR adds a new \`useFetch\` custom hook with 80 lines of logic — retries, abort, caching, deduplication. The reviewer comments: "Why not use TanStack Query?" The author says: "We need this for one screen, the dependency cost isn't worth it." How do you adjudicate?**

**Explanation:**

This is a classic "build vs adopt" question, and the math is rarely as obvious as either side claims.

The author's argument has merit:

- **Bundle cost is real** — TanStack Query is ~13 KB gzipped, which can matter on a marketing landing page that's currently sub-100 KB.
- **Adoption cost is real** — every dependency is a small ongoing tax (security advisories, version migrations, docs to learn, training new hires).
- **Single-use code is fine** — premature dependency adoption is as costly as premature abstraction.

But the reviewer's argument has more weight when the *full picture* is considered:

- **80 lines of \`useFetch\` with retries, cache, dedup is wrong, today.** The author thinks they're done; they're not. Abort on unmount, request deduplication on rapid re-render, error retries with backoff, race-condition handling on stale-while-revalidate, cache invalidation, optimistic updates — all of these will be requested over the next year, and each will add 30-100 lines. The hand-rolled hook will keep growing until it *is* a small reimplementation of TanStack Query, but with bugs.
- **One screen today, three screens next quarter.** The "we only need it for one screen" prediction is almost always wrong. Once you have a working pattern, it spreads.
- **The real cost of TanStack Query isn't bundle size; it's the *learning curve*.** That's a one-time cost you pay anyway when the third screen needs the same logic.

The right resolution: ask the author what the next 5 features on this screen will need. If retries-and-cache is sufficient and it's truly a single-screen need, hand-rolled is fine — but write it in 20 lines, not 80, and write a comment that says "if this grows past X, switch to TanStack Query." If the next features include optimistic updates, real-time sync, or cross-screen cache invalidation, adopt the library now while the migration is one screen instead of seven.

The meta-lesson: "build vs adopt" decisions should be evaluated against the **expected feature trajectory**, not against the current state. A library is overkill for what you have today and just-right for what you'll have in six months — that asymmetry is what makes the call hard.

**Takeaway:** Hand-rolling a feature subset of a mature library is cheap today and expensive over time as feature requests accumulate. Adjudicate by projecting the next 6 months of feature needs; if they include the library's bread-and-butter (retries, cache, dedup, optimistic updates), adopt now while the migration is small.

---

### Refactoring Cheat Sheet

\`\`\`
1.  Refactoring preserves behavior — change either structure or behavior, never both.
2.  Tests pass at every step. If they don't, revert that single transformation.
3.  Rule of three: write it; duplicate it; refactor on the third occurrence.
4.  Five smell families: Bloaters, OO Abusers, Change Preventers, Dispensables, Couplers.
5.  Long Method → Extract Method. Highest-leverage refactor; learn it first.
6.  Long Parameter List → Introduce Parameter Object.
7.  Primitive Obsession → Value Objects (or branded types in TS).
8.  Switch on type tag in 3+ places → Replace Conditional with Polymorphism.
9.  Nested if-else → Guard Clauses with early returns.
10. Comments that explain WHAT → rename code; delete comment.
11. Code review's job: correctness > design > maintainability > style.
12. Approve PRs that are net improvements; not all feedback blocks the merge.
13. Separate refactor commits from feature commits — single PR doing both is unreviewable.
14. PRs > 400 lines lose review quality; split.
15. Strangler fig replaces rewrite for legacy migration.
\`\`\`

---

## References

- [Refactoring.guru — Refactoring](https://refactoring.guru/refactoring) — visual catalog of smells and techniques
- [Refactoring.guru — Code Smells](https://refactoring.guru/refactoring/smells) — the canonical list
- [Refactoring.guru — Refactoring Techniques](https://refactoring.guru/refactoring/techniques) — every named transformation
- *Refactoring* (Martin Fowler, 2nd ed.) — the original book; JS examples in the second edition
- *Working Effectively with Legacy Code* (Michael Feathers) — refactoring without tests
- [Google's Engineering Practices — Code Review](https://google.github.io/eng-practices/review/) — the reviewer/author guide most teams adopt
- *The Pragmatic Programmer* (Hunt & Thomas) — boy scout rule, broken windows, software entropy
`;export{e as default};
