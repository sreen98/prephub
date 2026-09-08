# Testing Strategy & E2E — Complete Guide

The Jest & React Testing Library guide covers *how* to write a test. This one covers the questions that come after that: what to test at which level, how to keep a suite from becoming slow and flaky, what Playwright is actually for, and how to make CI a gate people trust rather than a thing they retry until it goes green.

That shift is deliberate — with AI able to generate a test file for any component instantly, "can you write a test?" stopped being a useful question. "Your suite takes 40 minutes and everyone reruns failures, what do you do?" is the modern one.

---

## Table of Contents

- [1. What's Actually Being Asked](#1-whats-actually-being-asked)
- [2. The Shape of a Suite](#2-the-shape-of-a-suite)
- [3. What to Test at Each Level](#3-what-to-test-at-each-level)
- [4. Vitest vs Jest](#4-vitest-vs-jest)
- [5. Mocking — Where to Draw the Line](#5-mocking-where-to-draw-the-line)
- [6. End-to-End with Playwright](#6-end-to-end-with-playwright)
- [7. Flake — The Real Enemy](#7-flake-the-real-enemy)
- [8. Visual Regression Testing](#8-visual-regression-testing)
- [9. Accessibility Testing](#9-accessibility-testing)
- [10. Contract Testing](#10-contract-testing)
- [11. Test Data and Environments](#11-test-data-and-environments)
- [12. Coverage and What It Doesn't Tell You](#12-coverage-and-what-it-doesnt-tell-you)
- [13. Testing in CI](#13-testing-in-ci)
- [14. Interview Questions & Answers](#14-interview-questions-answers)
- [15. Tricky Questions](#15-tricky-questions)
- [16. Cheat Sheet](#16-cheat-sheet)
- [17. References](#17-references)

---

## 1. What's Actually Being Asked

Testing questions are really about **judgement under constraint**. Anyone can add tests; the skill is knowing which tests earn their maintenance cost.

Every test has a value and a price:

```
VALUE  =  bugs caught  ×  cost of those bugs reaching production
PRICE  =  time to write  +  time to run (× every run, forever)
       +  time to maintain when the code changes
       +  time lost to flake and to false confidence
```

A suite that maximises coverage while ignoring the right-hand side produces the pathology every experienced engineer recognises: hundreds of tests, 40-minute CI, half of them asserting implementation details, everyone reruns failures reflexively, and bugs still ship.

So the four things being probed:

| Question behind the question | What a good answer shows |
|---|---|
| "What do you test?" | you optimise for confidence per unit of cost, not coverage |
| "How do you keep it fast?" | you know the pyramid is about *speed and determinism*, not dogma |
| "How do you handle flake?" | you treat it as a bug, not as weather |
| "How do you know it works?" | you distinguish "tests pass" from "the software works" |

---

## 2. The Shape of a Suite

### 2.1 Pyramid vs Trophy

The **testing pyramid** (Mike Cohn): many fast unit tests, fewer integration tests, very few slow E2E tests. The reasoning is that cost and runtime grow as you go up, so put the volume where it's cheap.

The **testing trophy** (Kent C. Dodds) reweights it for frontend work:

```
        ▲  E2E                 few — critical user journeys
       ███ INTEGRATION         MOST — components + their real collaborators
      ██   Unit                some — pure logic, algorithms, utils
       ─   Static              types + lint (free, catches a whole class)
```

The argument for the trophy in frontend specifically: a React component in isolation with everything mocked tests almost nothing real. Most frontend bugs live in the **wiring** — a component with its actual state, its actual child components and a realistic API response. So the fat middle is where the confidence is.

**Both models agree on the substance**, and that's worth saying rather than picking a camp: put volume where tests are **fast and deterministic**, and keep the slow, order-dependent, environment-dependent tests few and reserved for what genuinely needs them.

The **ice cream cone** is the anti-pattern to name: mostly E2E, few unit tests. It happens naturally because E2E tests feel like they prove more. The result is a suite that takes an hour, fails for unrelated reasons, and points at a screenshot rather than a line of code.

### 2.2 The Numbers That Drive the Shape

| Level | Typical runtime | Determinism | What breaks it |
|---|---|---|---|
| Static (types, lint) | seconds | total | nothing |
| Unit | ~1 ms each | total | nothing |
| Component / integration | 10–100 ms each | high | timers, async, DOM APIs |
| API / service integration | 100 ms–1 s | medium | real DB, ports, fixtures |
| E2E | 5–60 s each | **low** | network, timing, real browsers, real data |

An E2E test is on the order of **10,000× slower** than a unit test and vastly more likely to fail for a reason unrelated to your change. That ratio is the entire argument, and it's more persuasive than any diagram.

---

## 3. What to Test at Each Level

**Static — types and lint.** Free, runs in your editor, and eliminates a whole category (typos, wrong argument types, missing null checks with `strictNullChecks`, forgotten `await` with the right lint rule). `tsc --noEmit` in CI is the cheapest test you will ever add.

**Unit — pure logic.** Business rules, algorithms, reducers, formatters, validators, permission checks. The tell for a good unit test: **no mocks needed.** If a function needs five mocks to test, that's a design signal — extract the pure logic and test that.

```ts
// Ideal unit test: pure in, pure out, no setup
expect(calculateVAT({ net: 100, region: 'UK' })).toEqual({ vat: 20, gross: 120 });
```

**Component / integration — the fat middle.** Render a component with its real children, real state and a mocked *network boundary*. Assert what a user would observe.

```tsx
test('shows validation errors and does not submit', async () => {
  render(<CheckoutForm />);                       // real children, real state
  await userEvent.click(screen.getByRole('button', { name: 'Pay' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/card number/i);
  expect(submitSpy).not.toHaveBeenCalled();
});
```

**API / service integration.** Route handlers against a real database (Testcontainers, or a dedicated test database). This is where you catch the bugs unit tests structurally cannot: a wrong query, a missing index assumption, a transaction that doesn't roll back, a constraint violation.

**E2E — critical journeys only.** Signup, login, checkout, the one flow that makes money. Across the real stack, in a real browser.

The allocation heuristic I'd defend: **test at the lowest level that can actually catch the bug.** A currency-rounding bug belongs in a unit test. "The submit button is disabled while pending" belongs in a component test. "A user can complete checkout with a saved card" belongs in E2E. Testing the rounding bug through the UI is slow, fragile, and gives a worse error message.

---

## 4. Vitest vs Jest

| | **Vitest** | **Jest** |
|---|---|---|
| Config | reuses your `vite.config` | its own, plus a transform pipeline |
| Speed | **much faster** (esbuild transform, native ESM) | slower; Babel/ts-jest transform |
| ESM | native | historically painful |
| Watch mode | HMR-like, near-instant | full re-run of affected files |
| Ecosystem | large and growing | **largest**; every guide assumes it |
| API | Jest-compatible (`describe`/`it`/`expect`) | the reference |
| Browser mode | real-browser component testing | jsdom only |

**The practical rule: Vitest if you're on Vite, Jest otherwise.** The config unification is the real argument — with Jest on a Vite project you maintain two build pipelines that must agree about aliases, TypeScript and asset handling, and they drift.

Two Vitest details worth knowing: the API is deliberately Jest-compatible so migration is mostly `jest.` → `vi.`, and **`vi.mock` is hoisted** just like `jest.mock`, which trips people up when a mock factory references a variable declared below it (use `vi.hoisted()`).

And the jsdom caveat that applies to both: **jsdom is not a browser.** It has no layout engine, so `getBoundingClientRect` returns zeros, `IntersectionObserver` and `ResizeObserver` need polyfilling, and CSS-dependent behaviour is unobservable. Anything genuinely visual or layout-dependent needs a real browser — Vitest browser mode, or Playwright component testing.

---

## 5. Mocking — Where to Draw the Line

The single most consequential testing decision, and the one most suites get wrong.

**Mock at the network boundary, not at your module boundaries.** MSW intercepts at the network layer, so your real fetch code, your real query client and your real error handling all execute:

```ts
// msw handlers — shared between tests, dev and E2E
export const handlers = [
  http.get('/api/users/:id', ({ params }) =>
    HttpResponse.json({ id: params.id, name: 'Ada' })),
  http.post('/api/users', () =>
    HttpResponse.json({ error: 'Email taken' }, { status: 409 })),
];
```

Compare with mocking your own module:

```ts
// ✗ Now the test passes even if the real fetch code is broken. You've tested
//   your mock, and the test will keep passing after you refactor the API client
//   into something that doesn't work.
vi.mock('./api', () => ({ getUser: () => Promise.resolve({ name: 'Ada' }) }));
```

The distinction: mocking the network tests **your code against a contract**. Mocking your own module tests **your code against your assumptions about your own code** — which is exactly the thing most likely to be wrong.

**What's legitimate to mock:**

- The **network** (MSW) — always.
- **Time** — fake timers, so a 30-second retry test runs in a millisecond.
- **Randomness** — seed it or stub it.
- **Third-party SDKs with real side effects** — payments, email, analytics.
- **Genuinely slow or unavailable dependencies** in a unit test.

**What's a smell to mock:** your own modules, more than two or three things in one test (a design signal), and anything you're mocking to make an assertion pass rather than to isolate a boundary.

**Spies vs stubs vs mocks**, since the terminology gets asked: a **spy** records calls while keeping the real behaviour; a **stub** replaces behaviour with a canned response; a **mock** replaces behaviour *and* asserts on how it was called. Prefer spies and stubs — asserting on interactions couples the test to implementation, so it breaks on refactors that change nothing observable.

---

## 6. End-to-End with Playwright

Playwright became the default for new work: multi-browser (Chromium, Firefox, WebKit), auto-waiting, real parallelism, and a genuinely good debugging story.

```ts
import { test, expect } from '@playwright/test';

test('a user can complete checkout', async ({ page }) => {
  await page.goto('/products/42');
  await page.getByRole('button', { name: 'Add to basket' }).click();
  await page.getByRole('link', { name: 'Checkout' }).click();

  await page.getByLabel('Card number').fill('4242424242424242');
  await page.getByRole('button', { name: 'Pay £29.99' }).click();

  // Auto-waiting + web-first assertion: retries until it passes or times out
  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
  await expect(page).toHaveURL(/\/orders\/\d+/);
});
```

### 6.1 The Features That Matter

**Auto-waiting** is the headline. Playwright waits for an element to be attached, visible, stable, enabled and receiving events before acting — which removes the single largest source of Selenium-era flake. **`expect()` is "web-first"**: it retries the assertion until it passes or times out, rather than evaluating once.

The consequence: **never `waitForTimeout`.** A fixed sleep is either too short (flaky) or too long (slow), and it's always both across different machines. If you need to wait, wait for a **condition** — `expect(locator).toBeVisible()`, `page.waitForResponse()`, `page.waitForURL()`.

**Locators are lazy and auto-retrying**, unlike a resolved element handle:

```ts
const row = page.getByRole('row', { name: /Ada/ });   // a query, not an element
await row.getByRole('button', { name: 'Edit' }).click();  // resolved at click time
```

**Locator priority** — this is both a testing and an accessibility practice, because it fails when your markup isn't accessible:

```
getByRole (+ name)  →  getByLabel  →  getByPlaceholder  →  getByText
                    →  getByTestId (escape hatch)  →  CSS/XPath (avoid)
```

`getByRole('button', { name: 'Pay' })` is resilient to markup changes and breaks if the button loses its accessible name — so your E2E suite doubles as a smoke test for basic accessibility. A CSS selector like `.btn-primary > span:nth-child(2)` breaks on any refactor and tells you nothing.

**Storage state for authentication.** Logging in through the UI in every test is the classic E2E time sink:

```ts
// global-setup.ts — log in ONCE, reuse the session everywhere
await page.goto('/login');
await page.getByLabel('Email').fill(process.env.TEST_USER!);
await page.getByLabel('Password').fill(process.env.TEST_PASS!);
await page.getByRole('button', { name: 'Sign in' }).click();
await page.context().storageState({ path: 'auth.json' });
```

```ts
// playwright.config.ts
use: { storageState: 'auth.json' },
projects: [{ name: 'setup', testMatch: /global-setup/ }, { name: 'chromium', dependencies: ['setup'] }],
```

Better still: seed the session via an API call rather than the UI. It's faster and it doesn't make every test depend on the login page.

**Network control** so E2E doesn't depend on third parties:

```ts
await page.route('**/api/analytics', route => route.fulfill({ status: 204 }));
await page.route('**/api/flaky-vendor/**', route => route.abort());
```

**The debugging tooling** is the reason people switch: **trace viewer** (`--trace on-first-retry`) records a DOM snapshot, network log, console and screenshot for every step, so a CI failure is fully diagnosable without reproducing it locally. Plus `--ui` mode, `--debug`, and codegen.

### 6.2 What to Put in E2E

**Yes:** signup, login, checkout, the primary revenue path, a smoke test per critical page, and anything that has broken in production before.

**No:** validation permutations (component tests), every empty state (component tests), business-rule edge cases (unit tests), styling (visual regression), and anything where a lower-level test would catch the same bug.

The budget to state: **a handful to a few dozen E2E tests, running in a few minutes.** If your E2E suite has 400 tests you've built an ice cream cone, and it will be slow, flaky and distrusted.


---

## 7. Flake — The Real Enemy

A flaky test is worse than no test, and the reasoning is what matters: it trains the team to **ignore red**. Once "just rerun it" is the norm, a genuine failure gets rerun too and ships anyway. So flake destroys the value of the entire suite, not just the flaky test.

### 7.1 The Causes, and the Fix for Each

| Cause | Fix |
|---|---|
| **Fixed sleeps** (`waitForTimeout`, `setTimeout` in tests) | wait for a **condition**, never a duration |
| **Shared mutable state** between tests | fresh state per test; no module-level singletons |
| **Test order dependence** | randomise order (`--shuffle`) to *expose* it, then isolate |
| **Real time / dates** | fake timers; never `new Date()` without control |
| **Randomness** | seed it |
| **Parallel tests hitting the same data** | per-worker namespacing (unique emails, per-worker schema) |
| **Animations and transitions** | disable them in the test environment |
| **Un-awaited async** | a lint rule that catches a missing `await` |
| **Network to a real third party** | mock it at the boundary |
| **Race between navigation and assertion** | web-first assertions that retry |

### 7.2 The Policy That Actually Works

```ts
// playwright.config.ts
retries: process.env.CI ? 2 : 0,      // retry in CI only; 0 locally so you SEE flake
trace: 'on-first-retry',               // full diagnostics for exactly the flaky runs
```

Retries are a **detection** mechanism, not a fix. Playwright reports a test that passed on retry as **flaky**, distinct from passed — and that signal is the point. So:

1. **Track flake rate as a metric**, per test.
2. **Quarantine** a test above a threshold — move it out of the blocking suite so it stops eroding trust, but keep it running so it's visible.
3. **Fix or delete within a bounded window.** A quarantined test that nobody fixes is a test nobody needs.
4. **Never retry locally** — you want to see flake while you're writing the test, when it's cheapest to fix.

The framing worth stating: **treat flake as a production bug with an owner and a deadline.** Teams that treat it as weather end up with a suite nobody believes.

---

## 8. Visual Regression Testing

Unit tests cannot catch a 2px padding change across 300 usages, or a token change that breaks contrast, or a layout that collapses at 375px. Screenshot diffing can.

```ts
// Playwright
await expect(page).toHaveScreenshot('checkout.png', { maxDiffPixelRatio: 0.01 });

// Or component-level, via Storybook + Chromatic / Percy / Loki
```

**Where it earns its keep:** a design system (this is the primary use case — see the Frontend Architecture guide), a marketing site where visual polish is the product, and any refactor of shared CSS. It is what makes a large design-system change safe.

**The costs, which are real:** screenshots are **environment-sensitive**, so font rendering, GPU differences and OS versions produce diffs that aren't bugs — which is why you run them in a **container with pinned fonts**, or use a hosted service that normalises the environment. Dynamic content (dates, avatars, random data) must be masked or stubbed. And every legitimate visual change requires an approval step, so the review burden is ongoing.

**Component-level beats page-level** for most teams: faster, more stable, and a failure points at a component rather than "something on this page moved."

---

## 9. Accessibility Testing

Layered, and with an honest number attached — **automated tools catch roughly 30–40% of WCAG issues** (see the Accessibility guide).

```ts
// Component level, in CI
import { axe, toHaveNoViolations } from 'jest-axe';
expect(await axe(container)).toHaveNoViolations();

// Page level, in E2E
import AxeBuilder from '@axe-core/playwright';
const results = await new AxeBuilder({ page }).analyze();
expect(results.violations).toEqual([]);
```

Plus `eslint-plugin-jsx-a11y` at authoring time, which is free and catches a real class of static mistakes.

The point to make: automation verifies the machine-checkable things — is there an accessible name, is the role valid, is contrast sufficient. It **cannot** judge whether the keyboard interaction model matches the pattern (a tablist that's nine tab stops instead of one passes axe cleanly), whether alt text is meaningful, or whether a flow is completable with a screen reader. So a green axe report is a **floor, not a pass**, and the manual keyboard pass remains necessary.

The useful side effect worth naming: **Testing Library and Playwright's role-based queries fail when markup isn't accessible.** `getByRole('button', { name: 'Save' })` throws if the button has no accessible name — so writing queries the recommended way turns accessibility regressions into test failures for free.

---

## 10. Contract Testing

The gap the pyramid leaves: unit and component tests mock the API, E2E tests are too few and too slow to cover every interaction, so **nobody verifies that the frontend's assumptions match the backend's reality.** A backend renames a field, all tests pass on both sides, and production breaks.

Three approaches:

**1. A shared schema as the single source of truth.** OpenAPI or GraphQL schema → generated TypeScript types → the compiler catches a mismatch. This is the cheapest and most effective option when you own both sides, and it's why schema-first API design pays off (see the API Design guide).

**2. Consumer-driven contract testing** (Pact). The consumer declares what it expects; that expectation becomes a contract the provider's CI verifies. The provider then **cannot merge** a breaking change without knowing which consumer breaks.

```
Frontend test → generates a pact → published to a broker
                                      ↓
Backend CI    → replays the pact against the real provider → fails on a break
```

Worth the setup cost when teams deploy independently and you can't run everything together — which is exactly the microservices/micro-frontends situation.

**3. Schema validation at runtime.** Zod (or equivalent) at the API boundary, so a shape mismatch fails loudly with a useful message at the edge, rather than as `undefined is not a function` three components deep. Cheap, and it catches drift in production, not just in CI.

**Keep mocks honest** either way: generate MSW handlers from the same OpenAPI schema, so a fixture can't silently diverge from reality. A hand-written mock that no longer matches the API is a test that actively lies to you.

---

## 11. Test Data and Environments

**Factories over fixtures.** A shared fixture file becomes a coupling point — every test depends on `user_3` having a particular property, and changing it breaks twenty tests. A factory builds exactly what the test needs and makes the relevant data visible *in the test*:

```ts
const makeUser = (overrides: Partial<User> = {}): User => ({
  id: crypto.randomUUID(), name: 'Ada', email: `${crypto.randomUUID()}@test.dev`,
  role: 'member', createdAt: new Date('2026-01-01'),
  ...overrides,
});

test('suspended users cannot post', () => {
  const user = makeUser({ status: 'suspended' });   // the RELEVANT field is visible
  expect(canPost(user)).toBe(false);
});
```

That last point is underrated: a test reading `makeUser({ status: 'suspended' })` documents what matters; one reading `fixtures.user_3` documents nothing.

**Isolation under parallelism.** Parallel tests sharing a database is a top flake source. Options, in ascending robustness: unique data per test (random emails), a transaction per test rolled back at the end, a schema per worker, or a container per worker (**Testcontainers**). Testcontainers is the strong answer for backend integration tests — a real Postgres per run, disposable, identical to production.

**Environments:** run against a real database in integration tests (an in-memory substitute has different behaviour — SQLite is not Postgres, and the differences are exactly where bugs live). Seed deterministically. And **never run tests against production** — the failure mode is obvious and someone always suggests it.

---

## 12. Coverage and What It Doesn't Tell You

Coverage measures **which lines executed**, not whether they were **verified**. This test yields 100% coverage of `calculateTotal` and asserts nothing:

```ts
test('calculateTotal', () => { calculateTotal(items); });   // 100% covered, 0% tested
```

So the failure modes of a coverage target:

- **It's gameable**, and it *will* be gamed once it's a gate. Assertion-free tests, snapshot tests of large trees that get blindly updated, and tests of trivial getters all raise the number without raising confidence.
- **It says nothing about the important cases.** 100% line coverage with no test for the empty array, the null, the network failure or the concurrent case.
- **The last 20% is the expensive 20%** — error paths, defensive branches, generated code. Chasing 95% typically produces low-value tests with real maintenance cost.

What to do instead:

- Use coverage **diagnostically**: look at *uncovered* lines to find untested code you care about. It's a map, not a score.
- Prefer **branch** over line coverage — it at least notices unexercised conditions.
- If you must have a gate, gate on **coverage of changed lines in the diff** (~80%) rather than a global percentage. That's actionable and not retroactively punitive.
- **Mutation testing** (Stryker) is the honest measure — it changes your code and checks whether a test fails. Slow, so run it periodically on critical modules rather than in every build, but it tells you what coverage cannot: whether your assertions actually assert.

---

## 13. Testing in CI

```yaml
jobs:
  static:                        # seconds — fail fastest
    steps: [lint, tsc --noEmit]

  unit:                          # ~1 min, sharded
    strategy: { matrix: { shard: [1, 2, 3, 4] } }
    steps: [npx vitest run --shard=${{ matrix.shard }}/4 --coverage]

  e2e:                           # minutes — only after the cheap things pass
    needs: [static, unit]
    strategy: { matrix: { shard: [1, 2, 3, 4] } }
    steps:
      - npx playwright test --shard=${{ matrix.shard }}/4
      - uses: actions/upload-artifact@v4       # traces for failures
        if: failure()
        with: { name: traces-${{ matrix.shard }}, path: test-results/ }
```

The principles:

- **Fail fast, cheapest first.** Lint and types before unit; unit before E2E. Don't spend eight minutes on E2E to discover a type error.
- **Shard** the slow suites across runners. Both Vitest and Playwright support it natively, and it's the difference between a 20-minute and a 5-minute suite.
- **Run affected-only** in a monorepo (Nx/Turborepo) — a change to one package shouldn't test twelve (see the Frontend Architecture guide).
- **Upload traces and screenshots on failure.** A CI failure you can't diagnose without local reproduction is a failure that wastes an hour. Playwright's trace viewer makes this genuinely good.
- **Retries in CI only** (`retries: process.env.CI ? 2 : 0`), reported as *flaky* rather than passed.
- **A required status check**, not an advisory one. A suite that can be merged around is documentation.
- **Keep the whole thing under ~10 minutes.** Beyond that, people batch changes and stop trusting it — and slow CI is the root cause of most other testing pathologies.

---

## 14. Interview Questions & Answers

### Beginner

---

**Q1: Explain the testing pyramid. Do you agree with it?**

The pyramid says: many fast unit tests at the base, fewer integration tests, very few slow E2E tests at the top — because cost and runtime grow as you go up.

I agree with the **substance** and would reframe the shape for frontend work. The pyramid's real claim isn't about test *types*, it's that volume belongs where tests are **fast and deterministic**. That's why an E2E test being roughly 10,000× slower than a unit test — and far more likely to fail for reasons unrelated to your change — is the actual argument.

For frontend I'd lean toward the **testing trophy**: a fat middle of integration/component tests, some unit tests for pure logic, few E2E, on a base of static analysis. The reasoning is that a React component tested in isolation with everything mocked verifies almost nothing real — most frontend bugs live in the **wiring** between a component, its state, its children and a realistic API response. Testing that wiring is where the confidence is.

Static analysis at the base is the part people leave out and shouldn't: `tsc --noEmit` plus lint is free, runs in your editor, and eliminates a whole class of bug.

The anti-pattern to name is the **ice cream cone** — mostly E2E, few unit tests. It happens naturally because E2E feels like it proves more, and the result is an hour-long suite that fails for unrelated reasons and points at a screenshot instead of a line of code.

My actual heuristic: **test at the lowest level that can catch the bug.** A rounding error belongs in a unit test; "the button disables while pending" in a component test; "a user can check out with a saved card" in E2E.

---

**Q2: What should you mock, and what shouldn't you?**

**Mock at the network boundary, not at your own module boundaries.** That's the whole answer, and MSW is how you do it in practice:

```ts
http.get('/api/users/:id', ({ params }) => HttpResponse.json({ id: params.id, name: 'Ada' }))
```

With that, your real fetch code, your real query client, your real error handling and your real state updates all execute. Compare:

```ts
// ✗ Now the test passes even if the real API client is broken, and it keeps
//    passing after a refactor that breaks it.
vi.mock('./api', () => ({ getUser: () => Promise.resolve({ name: 'Ada' }) }));
```

The distinction: mocking the network tests **your code against a contract**; mocking your own module tests **your code against your assumptions about your own code** — which is precisely the thing most likely to be wrong.

**Legitimate:** the network, **time** (fake timers, so a 30-second retry test runs in a millisecond), randomness (seed it), and third-party SDKs with real side effects — payments, email, analytics.

**A smell:** mocking your own modules; needing more than two or three mocks in one test (that's a design signal — extract the pure logic); and mocking something to make an assertion pass rather than to isolate a boundary.

On terminology, since it gets asked: a **spy** records calls but keeps real behaviour; a **stub** replaces behaviour with a canned response; a **mock** replaces behaviour *and* asserts on how it was called. I prefer spies and stubs, because asserting on interactions couples the test to implementation and breaks on refactors that change nothing observable.

---

**Q3: What makes a good E2E test, and what belongs in one?**

**What belongs:** critical user journeys — signup, login, checkout, the primary revenue path — plus a smoke test per critical page and anything that has broken in production before.

**What doesn't:** validation permutations, every empty state, business-rule edge cases, styling. Each of those has a faster, more reliable home, and testing them through the UI is slow, fragile and gives a worse error message.

**What makes one good:**

- **Query the way a user perceives the page** — `getByRole('button', { name: 'Pay' })` over CSS selectors. It's resilient to markup changes, and it fails if the button loses its accessible name, so the E2E suite doubles as an accessibility smoke test. `.btn-primary > span:nth-child(2)` breaks on any refactor and tells you nothing.
- **Never `waitForTimeout`.** A fixed sleep is too short (flaky) or too long (slow) and always both across different machines. Wait for a **condition**: `expect(locator).toBeVisible()`, `waitForResponse`, `waitForURL`. Playwright's web-first assertions retry until they pass or time out, which removes the largest source of legacy flake.
- **Independent and idempotent.** No dependence on another test having run, and no dependence on data a previous run created. Unique data per test, or a per-worker namespace.
- **Authenticate via `storageState` or an API call, not through the UI** in every test — logging in via the form each time is the classic E2E time sink.
- **Stub third parties** (`page.route`) so your suite doesn't fail because an analytics vendor is down.
- **Traces on retry**, so a CI failure is diagnosable without reproducing it locally.

And the budget: **a handful to a few dozen, running in a few minutes.** 400 E2E tests is an ice cream cone.

---

### Intermediate

---

**Q4: Your CI suite takes 40 minutes and the team reruns failures reflexively. What do you do?**

Two separate problems, and the trust one is more urgent than the speed one — a suite people rerun without reading is a suite that provides no signal, and a real failure will be rerun and shipped too.

**Fix the flake first, because it's destroying the value of everything else.**

1. **Measure it.** Flake rate per test. Playwright reports a test that passed on retry as *flaky*, distinct from passed — that signal is the whole point of retries.
2. **Quarantine** anything over a threshold: out of the blocking suite so it stops eroding trust, still running so it stays visible.
3. **Fix or delete within a bounded window.** A quarantined test nobody fixes is a test nobody needs.
4. **Fix the causes**, which are a short list: fixed sleeps → wait for conditions; shared mutable state → fresh state per test; order dependence → randomise order to *expose* it, then isolate; real time → fake timers; parallel tests colliding on data → per-worker namespacing; animations → disable in test; un-awaited async → a lint rule.
5. **`retries: 0` locally**, so developers see flake while it's cheapest to fix.

**Then the speed:**

- **Reshape the suite.** 40 minutes usually means an ice cream cone. Push coverage down: replace E2E tests that assert business rules with unit tests, and E2E tests that assert UI states with component tests.
- **Shard** unit and E2E across runners — natively supported by both Vitest and Playwright, and often the single biggest win.
- **Fail fast:** lint and `tsc` (seconds) → unit (a minute) → E2E (minutes). Don't spend eight minutes on E2E to find a type error.
- **Affected-only** in a monorepo via Nx/Turborepo, with remote caching.
- **Vitest instead of Jest** on a Vite project — a substantial constant-factor win, plus one build pipeline instead of two.
- **Reuse expensive setup** — one login into `storageState`, seeded data via API rather than UI.

**Target under ~10 minutes.** Past that, people batch changes and stop trusting the gate — and slow CI is the root cause of most other testing pathologies, including the flake tolerance.

I'd also make it a **required status check**. A suite that can be merged around is documentation, not a gate.

---

**Q5: Is 100% test coverage a good goal?**

No, and the reason is that coverage measures **which lines executed**, not whether they were **verified**:

```ts
test('calculateTotal', () => { calculateTotal(items); });   // 100% covered, 0% tested
```

That test asserts nothing and reports full coverage. Which leads to the three real problems:

**It's gameable, and it will be gamed once it's a gate.** Assertion-free tests, snapshot tests of large trees that get blindly updated on every change, and tests of trivial getters all move the number without moving confidence.

**It says nothing about the cases that matter.** You can have 100% line coverage with no test for the empty array, the null, the network failure, or the concurrent case — which is where bugs actually are.

**The last 20% is the expensive 20%** — error paths, defensive branches, generated code. Chasing 95% reliably produces low-value tests with real ongoing maintenance cost.

**What I'd do instead:** treat coverage **diagnostically** — read the *uncovered* lines to find untested code I care about. It's a map, not a score. Prefer **branch** coverage over line coverage. If a gate is required, gate on **coverage of changed lines in the diff** (~80%), which is actionable and not retroactively punitive.

And **mutation testing** (Stryker) is the honest measure: it mutates your code and checks whether a test fails. It's slow, so run it periodically on critical modules rather than every build — but it tells you the thing coverage cannot, which is whether your assertions actually assert anything.

The framing: **coverage is a proxy, and optimising a proxy directly is how you get the pathology.** I'd rather have 60% coverage concentrated on the money paths and the historically-broken code than 95% spread evenly.

---

### Advanced

---

**Q6: Your frontend and backend teams deploy independently. All tests pass on both sides and production still breaks. What's missing?**

**Contract testing.** That's the exact gap: frontend tests mock the API, backend tests test the API, and **nobody verifies that the frontend's assumptions match the backend's reality.** A backend renames `user.fullName` to `user.name`, its own tests pass because they test the new shape, and the frontend's tests pass because its *mock* still returns the old one. Both suites are green and the integration is broken.

Three fixes, and I'd pick by whether we own both sides:

**1. A shared schema as the single source of truth** — OpenAPI or GraphQL → generated TypeScript types on the client. The compiler then catches the rename at build time. This is the cheapest and most effective option when both sides are ours, and it's the strongest argument for schema-first API design.

**2. Consumer-driven contract testing (Pact)** when teams genuinely can't be built together. The frontend declares its expectations; those become a contract published to a broker; the backend's CI replays it against the real provider and **fails on a breaking change**, telling the provider *which* consumer breaks. That last part is what makes independent deployment safe.

**3. Runtime schema validation** (Zod) at the API boundary — so drift fails loudly with a useful message at the edge rather than as `undefined is not a function` three components deep. Cheap, and it catches drift in production, not just CI.

And the hygiene point that makes all of this work: **keep mocks honest.** Generate MSW handlers from the same OpenAPI schema so a fixture cannot silently diverge from reality. A hand-written mock that no longer matches the API is a test that actively lies to you — it's worse than having no test, because it manufactures confidence.

I'd also add a **small number of genuinely integrated smoke tests** against a real deployed staging stack. Contract tests verify shape; a smoke test verifies that the whole thing is wired together. Both, not either.

---

**Q7: How would you test a design system consumed by five product teams?**

The consumers change the calculus completely — a regression here breaks five products at once, and I can't test their code. So the strategy is about **contract stability and visual safety**.

**Visual regression is the primary safety net**, and this is the case where it genuinely earns its cost. Unit tests cannot catch a 2px padding change across 300 usages, or a token change that breaks contrast. Storybook plus Chromatic (or Playwright screenshots) is what makes a large refactor safe. Run it **component-level** rather than page-level — faster, more stable, and a failure points at a component instead of "something moved."

**Component tests for behaviour and API surface.** Every component tested for keyboard interaction, controlled *and* uncontrolled modes, ref forwarding, `...rest` spreading, and `className` passthrough — because those are the escape hatches consumers depend on, and silently dropping one forces a fork.

**Accessibility tests are non-negotiable here.** `jest-axe` on every component in CI, because a design system is the highest-leverage place in the entire codebase to fix accessibility — one `Button` fix propagates to five products. Automated tools catch 30–40%, so I'd add a manual keyboard pass for interactive components.

**Type tests.** For a TypeScript library the types *are* the contract, so I'd test them — `expect-type` or `tsd` — and assert that a wrong prop is a compile error. A type-level breaking change is invisible to runtime tests.

**Test in a real consumer.** Publish a canary version and run one product's test suite against it in CI. That catches integration problems no amount of in-repo testing will: bundler resolution, peer dependency conflicts, CSS specificity collisions with the consumer's own styles.

Then the **process** half, which matters at least as much as the tests:

- **Codemods shipped with breaking changes**, and a deprecation period where both APIs work. Without a codemod, a breaking change doesn't get adopted — it gets forked.
- **Changesets** so every PR declares its own semver impact and releases are derived rather than negotiated.
- **Adoption tracked as a number** — remaining old-API usages per product, from a lint rule. "Please migrate" without a count never finishes.

And in a monorepo, the atomic path is the real advantage: change the component and all five consumers in one PR with one CI run. That's the clearest concrete argument for a monorepo in a design-system-heavy organisation (see the Frontend Architecture guide).


---

## 15. Tricky Questions

---

**Q1: This test passes. The function is completely broken. Why does it pass?**

```ts
test('rejects an invalid email', async () => {
  try {
    await createUser({ email: 'not-an-email' });
    // if we get here, validation did NOT throw
  } catch (err) {
    expect(err.message).toMatch(/invalid email/i);
  }
});
```

**Answer:** If `createUser` **doesn't throw**, the `catch` block never runs, no assertion executes, and the test passes green. It's a test that can only ever pass.

**Explanation:**

This is the single most common false-green pattern in async testing, and it's insidious because the code looks careful. The `try`/`catch` shape means the assertion is *conditional on the failure happening* — so the test verifies "if it throws, the message is right," which is not what you wanted to assert.

Worse, it also passes if `createUser` throws the *wrong* error for the wrong reason — a `TypeError` from a typo in your code would need `/invalid email/i` to match, but a bug that made the function throw a matching message for unrelated reasons would sail through.

Two correct forms:

```ts
// 1. The purpose-built assertion — fails if nothing is thrown
await expect(createUser({ email: 'not-an-email' }))
  .rejects.toThrow(/invalid email/i);

// Node's built-in test runner:
await assert.rejects(() => createUser({ email: 'not-an-email' }),
                     { message: /invalid email/i });

// 2. If you must use try/catch, assert the assertion COUNT
test('rejects an invalid email', async () => {
  expect.assertions(1);              // ← fails if the catch never runs
  try {
    await createUser({ email: 'not-an-email' });
  } catch (err) {
    expect(err.message).toMatch(/invalid email/i);
  }
});
```

**Three sibling false-greens in the same family**, all worth recognising:

```ts
// A. Forgotten await/return — the test function returns before the assertion runs
test('a', () => { expect(getUser()).resolves.toEqual({}); });   // ✗ no await
test('a', async () => { await expect(getUser()).resolves.toEqual({}); });  // ✓

// B. Assertion inside a callback that never fires
test('b', () => {
  emitter.on('done', () => expect(x).toBe(1));   // ✗ if 'done' never fires, green
});

// C. A conditional that's never true
test('c', () => { if (result) expect(result.id).toBeDefined(); });  // ✗
```

**The general defence**, and the point of the question: **make sure a test can fail.** Before trusting a new test, break the implementation and confirm it goes red. That five-second habit catches every case above. Beyond that: enable `expect.assertions()` for callback-based tests, add a lint rule for un-awaited assertions (`vitest/valid-expect`, `jest/valid-expect`), and use **mutation testing** on critical modules, which is precisely the tool that finds tests that can't fail.

**Takeaway:** a `try`/`catch` around an async call makes the assertion conditional on the throw happening, so the test passes when nothing is thrown — use `expect(...).rejects` / `assert.rejects`, and always verify a new test can actually fail by breaking the implementation.

---

**Q2: Your component tests all pass. Production breaks because the API changed a field name. Both the frontend and backend suites are green. How?**

**Answer:** The frontend mocks the API, so its tests validate against a **fixture** that no longer matches reality. The backend tests the real API and passes because it tests the *new* shape. Nobody tested the boundary.

**Explanation:**

```ts
// Frontend test — passes forever, regardless of what the API actually returns
vi.mock('./api', () => ({ getUser: () => ({ fullName: 'Ada Lovelace' }) }));
// Backend renamed fullName → name. Its own tests were updated. Green.
// Frontend mock still says fullName. Green. Production: undefined.
```

Both suites are internally consistent and jointly wrong. This is a structural gap in the pyramid rather than a mistake in either test: **unit and component tests mock the network** (correctly — otherwise they'd be slow and flaky), **E2E tests are too few** to cover every interaction, so the contract between the two systems is verified by nothing.

The fixes, in order of what I'd reach for first:

**1. A shared schema as the source of truth.** OpenAPI or GraphQL → generated TypeScript types. Now the rename is a **compile error** in the frontend, caught before any test runs. Cheapest and most effective when you own both sides, and it's the strongest practical argument for schema-first API design.

**2. Generate mocks from the schema.** This is the specific fix for the bug above — if MSW handlers are generated from the same OpenAPI document, a fixture **cannot** silently diverge:

```ts
// Generated from the schema, not hand-written
export const handlers = [http.get('/api/users/:id', () => HttpResponse.json(mockUser()))];
```

**3. Consumer-driven contract testing (Pact)** when the teams genuinely can't be built or deployed together. The consumer publishes its expectations; the provider's CI replays them against the real provider and fails on a break, naming which consumer it breaks. That's what makes independent deployment safe.

**4. Runtime validation at the boundary** (Zod). Catches drift in **production**, not just CI, and fails with "expected `name`, received `undefined`" at the edge rather than `Cannot read property 'split' of undefined` three components deep.

**5. A small number of genuinely integrated smoke tests** against a real deployed staging stack — contract tests verify *shape*, a smoke test verifies the whole thing is wired up.

The lesson worth stating: **a mock is a claim about someone else's behaviour, and claims go stale.** Mocking at the network boundary is right, but it creates an obligation to keep the mock honest — either derive it from a schema, or verify it against the real provider. A hand-written mock that no longer matches the API is worse than no test, because it manufactures confidence.

**Takeaway:** mocking the network is correct but leaves the frontend/backend contract verified by nothing — generate mocks and types from a shared schema so drift is a compile error, and add consumer-driven contract tests when teams deploy independently.

---

**Q3: A test passes locally and fails in CI roughly one run in five. You add `retries: 3` and CI goes green. What's wrong with that?**

**Answer:** Retries are a **detection** mechanism, not a fix. The bug is still there — you've hidden it, and you've trained the team to accept red as noise.

**Explanation:**

The immediate objection is that the flake almost always indicates a **real race** in the code, not just in the test. A test that fails one in five times because an assertion runs before a state update has settled is telling you there's a window where your UI is in an inconsistent state. Users hit that window too; they just don't file it as a test failure.

The second, larger objection is cultural: **once red is routine, red stops meaning anything.** A genuine regression gets rerun alongside the flake and ships. That's how flake destroys the value of the whole suite rather than one test.

So retries are legitimate, but only configured as a **signal**:

```ts
retries: process.env.CI ? 2 : 0,      // 0 locally — see flake while it's cheap to fix
trace: 'on-first-retry',               // full diagnostics for exactly the flaky runs
```

Playwright reports a test that passed on retry as **flaky**, distinct from passed. That distinction is the entire point — you get a green build *and* a list of tests to fix.

The policy around it:

1. **Track flake rate per test** as a metric.
2. **Quarantine** anything over a threshold — out of the blocking suite so it stops eroding trust, still running so it stays visible.
3. **Fix or delete within a bounded window.** A quarantined test nobody fixes is a test nobody needs.

**Why it fails in CI and not locally** — the causes are a short and finite list, and knowing them is most of the fix:

| Symptom | Cause |
|---|---|
| Fails on a loaded CI machine | a **fixed sleep** that's long enough locally, not under load |
| Fails only in parallel | **shared state** — same database row, same file, same port |
| Fails in a random order | **test order dependence** — one test leaks state into another |
| Fails at certain times | real `Date`/timezone, or a date-boundary bug |
| Fails on retry of the whole suite | data created by the previous run |
| Fails only in CI's browser | animations, different viewport, missing fonts |

Fixes respectively: wait for **conditions** not durations; namespace data per worker (unique emails, a schema per worker, Testcontainers); randomise test order (`--shuffle`) to *expose* dependence, then isolate; fake timers; idempotent setup; disable animations and pin fonts in the test environment.

**Treat flake as a production bug with an owner and a deadline.** Teams that treat it as weather end up with a suite nobody believes — and at that point the 40 minutes of CI is pure cost.

**Takeaway:** retries hide a real race and normalise red, so configure them as a *signal* (CI-only, reported as flaky, traces on retry) and then fix the cause — the flake list is short and finite: fixed sleeps, shared state, order dependence, real time, and unisolated parallel data.

---

## 16. Cheat Sheet

```
STRATEGY
 1. Every test has a PRICE: write + run (× forever) + maintain + flake + false
    confidence. Optimise confidence per unit of cost, not coverage.
 2. Pyramid and Trophy agree on the substance: put VOLUME where tests are FAST
    and DETERMINISTIC. An E2E test is ~10,000x slower than a unit test.
 3. Frontend leans Trophy: static → some unit → MOST integration/component → few E2E.
    A component with everything mocked verifies almost nothing; bugs live in the wiring.
 4. ICE CREAM CONE (mostly E2E) is the anti-pattern. It feels like more proof and
    delivers an hour-long suite that fails for unrelated reasons.
 5. TEST AT THE LOWEST LEVEL THAT CAN CATCH THE BUG.
    Rounding → unit. "Disabled while pending" → component. "Can check out" → E2E.
 6. Static analysis is the free base: tsc --noEmit + lint.

MOCKING
 7. MOCK AT THE NETWORK BOUNDARY (MSW), NOT AT YOUR MODULE BOUNDARIES.
 8. vi.mock('./api') tests your code against your ASSUMPTIONS about your own code —
    the thing most likely to be wrong. It keeps passing after you break the real client.
 9. Legitimate: network, TIME (fake timers), randomness (seed it), third-party SDKs
    with real side effects.
10. Smells: mocking your own modules; >2-3 mocks in one test (a DESIGN signal);
    mocking to make an assertion pass.
11. Spy = records, keeps behaviour. Stub = canned response. Mock = replaces AND
    asserts on calls. Prefer spies/stubs — interaction assertions break on refactors.
12. KEEP MOCKS HONEST: generate them from the schema, or they silently lie.

RUNNERS
13. Vitest if you're on Vite (one config, much faster, native ESM), Jest otherwise.
    API is Jest-compatible; vi.mock is hoisted (use vi.hoisted()).
14. jsdom IS NOT A BROWSER: no layout engine, getBoundingClientRect returns 0s,
    IntersectionObserver/ResizeObserver need polyfills. Visual/layout → real browser.

E2E / PLAYWRIGHT
15. Auto-waiting (attached → visible → stable → enabled → receives events) plus
    WEB-FIRST assertions that retry. This removes the biggest legacy flake source.
16. NEVER waitForTimeout. Wait for a CONDITION: toBeVisible, waitForResponse,
    waitForURL. A fixed sleep is too short AND too long.
17. Locator priority: getByRole(+name) → getByLabel → getByPlaceholder → getByText
    → getByTestId → CSS/XPath (avoid). Role queries fail when markup isn't
    accessible, so E2E doubles as an a11y smoke test.
18. Locators are LAZY queries, not resolved elements — they re-resolve on use.
19. Authenticate via storageState (or an API call), ONCE — not through the UI in
    every test.
20. page.route() to stub third parties, so a vendor outage isn't your test failure.
21. trace: 'on-first-retry' → DOM snapshots, network, console per step. A CI failure
    becomes diagnosable WITHOUT local reproduction.
22. E2E budget: a handful to a few dozen, minutes not hours. 400 = ice cream cone.
23. In E2E: critical journeys + smoke per page + anything that broke in production.
    NOT validation permutations, empty states, business rules or styling.

FLAKE
24. A FLAKY TEST IS WORSE THAN NO TEST — it trains the team to ignore red, so a
    real failure gets rerun and ships.
25. Retries are DETECTION, not a fix. retries: CI ? 2 : 0. Report as FLAKY, not passed.
26. Causes: fixed sleeps · shared mutable state · order dependence · real time ·
    parallel data collisions · animations · un-awaited async · real third parties.
27. --shuffle to EXPOSE order dependence. Per-worker namespacing for parallel data.
28. Quarantine over a threshold (out of the blocking suite, still visible), then
    fix or delete within a bounded window.
29. Treat flake as a production bug with an owner and a deadline.

FALSE GREENS
30. try/catch around an async call = the assertion is CONDITIONAL on the throw.
    Use expect().rejects / assert.rejects, or expect.assertions(n).
31. A forgotten await/return means the test ends before the assertion runs.
32. An assertion inside a callback that never fires passes silently.
33. ALWAYS VERIFY A NEW TEST CAN FAIL — break the implementation and watch it go red.
34. Lint rule for un-awaited expects (vitest/valid-expect, jest/valid-expect).

COVERAGE
35. Coverage measures WHICH LINES RAN, not whether they were VERIFIED.
    `test('x', () => { fn() })` = 100% covered, 0% tested.
36. It's gameable and WILL be gamed once it's a gate (assertion-free tests, blindly
    updated snapshots, tests of getters).
37. Use it DIAGNOSTICALLY — read the uncovered lines. It's a map, not a score.
38. Prefer BRANCH coverage. If you must gate, gate on coverage of CHANGED LINES.
39. MUTATION TESTING (Stryker) is the honest measure — it checks whether your
    assertions actually assert. Slow → periodic, on critical modules.

OTHER LAYERS
40. VISUAL REGRESSION is the only thing that catches a 2px change across 300 usages.
    Component-level > page-level. Pin fonts / use a container, or you get
    environment diffs that aren't bugs.
41. A11Y: eslint-plugin-jsx-a11y → jest-axe (component) → @axe-core/playwright (page).
    AUTOMATION CATCHES ~30-40%. Green axe is a FLOOR, not a pass.
42. CONTRACT TESTING fills the real gap: FE mocks the API, BE tests the API, nobody
    tests the boundary. Shared schema → generated types (best when you own both);
    Pact for independent deploys; Zod at the boundary for runtime drift.
43. TYPE TESTS (expect-type / tsd) for a library — the types ARE the contract.

DATA & CI
44. FACTORIES over fixtures. makeUser({ status: 'suspended' }) documents what
    matters; fixtures.user_3 documents nothing.
45. Isolation under parallelism: unique data → transaction-per-test → schema-per-worker
    → Testcontainers (a real disposable Postgres).
46. Use a REAL database in integration tests. SQLite is not Postgres, and the
    differences are exactly where bugs live.
47. CI order: lint + tsc (seconds) → unit (minute) → E2E (minutes). Fail fast.
48. SHARD slow suites across runners (Vitest and Playwright both support it natively).
49. Affected-only in a monorepo (Nx/Turborepo) + remote caching.
50. Upload traces/screenshots on failure. Required status check, not advisory.
51. KEEP THE WHOLE SUITE UNDER ~10 MINUTES. Past that people batch changes and stop
    trusting it — slow CI causes most other testing pathologies, including flake
    tolerance.
```

---

## 17. References

- [Testing Library — Guiding Principles](https://testing-library.com/docs/guiding-principles) — "the more your tests resemble the way your software is used…"
- [Kent C. Dodds — The Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) and [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
- [Playwright Documentation](https://playwright.dev/docs/intro) — read **Locators**, **Auto-waiting** and **Trace viewer** first
- [Playwright — Best Practices](https://playwright.dev/docs/best-practices) — the official position on locators, isolation and waiting
- [Vitest Documentation](https://vitest.dev) — including the migration-from-Jest guide
- [MSW (Mock Service Worker)](https://mswjs.io) — network-level mocking shared across tests, dev and E2E
- [Testcontainers](https://testcontainers.com) — real disposable dependencies for integration tests
- [Pact](https://docs.pact.io) — consumer-driven contract testing
- [Stryker Mutator](https://stryker-mutator.io) — mutation testing for JavaScript and TypeScript
- [Chromatic](https://www.chromatic.com) / [Percy](https://percy.io) — hosted visual regression with a normalised environment
- [Google Testing Blog — Test Sizes](https://testing.googleblog.com/2010/12/test-sizes.html) — the small/medium/large framing, which ages better than the pyramid
- [Martin Fowler — Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) and [Eradicating Non-Determinism in Tests](https://martinfowler.com/articles/nonDeterminism.html) — the canonical flake essay
