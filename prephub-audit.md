# PrepHub Content Audit: Front End and JS & TS Guides

**Site:** https://prephub.sreenathp.com
**Source audited:** GitHub `sreen98/prephub`, commit `bc66290` (9 Oct 2026)
**Scope:** all 25 guides in `src/content/front-end/`, all 4 guides in `src/content/javascript-and-typescript/`, and the related cheat sheets in `src/content/cheatsheets/` (about 455,000 words / 52,000 lines)

---

## Contents

0. [How to use this report](#0-how-to-use-this-report)
1. [Summary](#1-summary)
2. [Part 1: Factual fixes, guide by guide](#part-1-factual-fixes-guide-by-guide)
3. [Part 2: Duplication: what is repeated and where it should live](#part-2-duplication)
4. [Part 3: How to shorten the long guides](#part-3-how-to-shorten-the-long-guides)
5. [Part 4: Rules for editing safely](#part-4-rules-for-editing-safely)
6. [Part 5: Suggested order of work (checklist)](#part-5-suggested-order-of-work)
7. [Appendix: How the audit was done and its limits](#appendix-how-the-audit-was-done-and-its-limits)

---

## 0. How to use this report

**Line numbers** are from commit `bc66290`. When you edit a file, lines below the edit move. Two ways to cope:
- Work through each file **from the bottom up** (highest line number first). Earlier line numbers then stay correct.
- Or search for the quoted text or the question number (for example "Tricky Q20") instead of relying on the line number.

**Every finding has a label:**

| Label | Meaning | What to do |
|---|---|---|
| **[Wrong]** | The guide states something that is factually incorrect, or code that does not behave as described. | Fix it. These mislead readers in interviews. |
| **[Outdated]** | It was true once but has changed (a new library version, a removed API, a changed policy). | Update it. |
| **[Inconsistent]** | Two places in the site say different things. Usually one is right. | Make both say the right thing. Better still, delete one copy (see Part 2). |
| **[Minor]** | A small slip in wording or detail. The main point still holds. | Fix it when you are in that file anyway. |
| **[Verify]** | The reviewers could not confirm or rule this out. Usually the event is too recent (mid-2026 or later), or the reviewer was unsure. | Check it against the official source before deciding. |

**[verified]** after an item means the reviewer actually ran the code (Node 24, or the TypeScript 5.9 compiler) and saw the result. It was not just reasoned about.

**Is everything in this file?** Yes. Every finding from the six reviewers is listed in Part 1 (fixes) or Part 2 (duplication). Parts 3–5 are the plan for acting on them. Nothing outside the Front End and JS & TS categories was audited (see the Appendix).

---

## 1. Summary

### Accuracy: good overall
- About **95 genuine errors** in about 52,000 lines, roughly one per 550 lines. For content this size, that is a good result.
- In the JavaScript guide, **81 of 82** "what does this print?" examples gave exactly the stated output when run.
- The errors cluster in three places:
  1. **Places where the same fact is written more than once.** One copy was updated and the other was not. Most contradictions are this kind.
  2. **Fast-moving tools:** React Router v7, Vite 8, Storybook 9, Jest 29+, Play Store policies, CodePush.
  3. **"Tricky" questions,** where a subtle detail of the answer is off.

### Duplication: the main problem
- **Word-for-word copying is rare:** 0–7% of any guide.
- **The same idea re-explained in new words is very common.** About **one third** of all Interview Q&A and Tricky Question text re-teaches something the guide body already explained. In some guides it is 70–90%.
- **Q&A and Tricky sections are huge:** 53% of the React guide, 60% of JavaScript, 65% of TypeScript and 70% of Redux Toolkit.
- **Some topics are taught in full by three or four different guides.** Examples are code splitting, the Context/Zustand/Redux comparison, mocking advice and signing keys.

### What shortening could achieve
- About **25–30% less text** (around 120,000–140,000 words), **without removing any topic**. Each idea gets explained once, in one place, and everywhere else points to it.

---

## Part 1: Factual fixes, guide by guide

Each item is laid out as:
- **Now:** what the guide currently says or does
- **Problem:** why that is wrong or outdated
- **Change to:** what to write instead

---

### 1.1 `front-end/react-guide.md`

**R1. [Wrong] `startTransition` does not make a slow filter faster**
*Lines 1533 (§6.2) and 8607–8644 (Tricky Q20)*
- **Now:** The code wraps `setFiltered(products.filter(...))` in `startTransition`. The text says this fixes typing lag because React can "throw away the in-progress work mid-filter".
- **Problem:** The function you pass to `startTransition` runs immediately and synchronously. The `filter()` over 50,000 products still runs on every keystroke and still blocks the page. A transition only makes the re-render *after* the state update interruptible, and here that re-render shows just 50 items, so it is already cheap. The guide gets this right elsewhere: Q15 (line 5018) and Q24 (line 5200).
- **Change to:** Keep the text box value in normal state. Keep a separate "query used for filtering" value updated inside `startTransition`, or use `useDeferredValue(query)`. Do the filtering **during render** inside `useMemo`, so React can interrupt it. §13.5 already shows this pattern, so reuse it.

**R2. [Wrong] `useOptimistic` called outside an Action**
*Lines 2755–2764 (§13.5)*
- **Now:** `addOptimistic(...)` is called inside an ordinary `async` function. The text says "if it throws, React rolls back".
- **Problem:** `useOptimistic` only works inside an Action or a transition. Outside one, React logs a warning and the optimistic value vanishes straight away. Also, the optimistic value is *always* discarded when the action finishes, on success as well as on failure, because the real state replaces it. §16.5 (line 4230) explains this correctly.
- **Change to:** Call it inside `startTransition(async () => { addOptimistic(item); await save(item); })`, or from a form `action`. Reword the sentence to: "when the action finishes, the optimistic value is replaced by the real state. If the save failed, the real state never changed, so the item disappears."

**R3. [Wrong] "UNSAFE_* lifecycle methods were removed"**
*Line 6492 (Q62)*
- **Now:** Says `componentWillMount`, `componentWillReceiveProps` and `componentWillUpdate` "were removed".
- **Problem:** They are **deprecated, not removed**. They still work in React 19. Lines 784 and 4435 of the same guide say this correctly.
- **Change to:** "...have no hook equivalent. They are deprecated (still working in React 19, but warned about in StrictMode) because they can run more than once per commit under concurrent rendering."

**R4. [Wrong] Wrong reason for a re-render after splitting context**
*Line 8582 (Tricky Q18)*
- **Now:** Explains that you still need `memo` after splitting the context because "AppProvider re-renders… re-rendering a parent re-renders its children".
- **Problem:** `Page` is passed to `AppProvider` as `children`. That element was created by AppProvider's *parent*, so when AppProvider re-renders from its own state change, React reuses the same element and `Page` does **not** re-render. `ThemedButton` re-renders for a different reason: its own parent, `Page`, reads `UserCtx`, so `Page` re-renders when the user changes and takes its children with it. Q11 (fix 3) and Q33 (point 3) explain the `children` rule correctly, so this answer contradicts them.
- **Change to:** Rewrite the explanation as "ThemedButton re-renders because Page consumes UserCtx". The fix is either `memo(ThemedButton)` or moving the `UserCtx` read out of `Page` into a smaller component.

**R5. [Wrong] How Client and Server Components can be combined**
*Line 3264 (§13.12)*
- **Now:** Says a Client Component rendering a Server Component "requires a navigation or `import()` boundary".
- **Problem:** A Client Component cannot *import* a Server Component. It **can** render one that a Server Component parent passes in as `children` or another prop. This is the standard "server component inside a client wrapper" pattern.
- **Change to:** "A Client Component can't import a Server Component, but it can receive one as `children` (or any prop) from a Server Component parent and render it."

**R6. [Wrong] ISR: who waits for the regenerated page**
*Line 3341*
- **Now:** "The first user after the revalidation window pays a slower request."
- **Problem:** ISR is stale-while-revalidate. The first user after the window gets the **old (stale) page immediately**, and regeneration happens in the background. The *next* user gets the fresh page. Line 3323 says this correctly.
- **Change to:** Match line 3323.

**R7. [Wrong] What JSX compiles to**
*Lines 74 (§2) and 6270*
- **Now:** Says JSX "compiles to exactly this", followed by a `React.createElement(...)` call whose child is a template literal. Line 6270 says JSX is "literally `createElement`".
- **Problem:** Two inaccuracies.
  1. Even the old transform passes text and expressions as **separate children**: `'Hello, ', name, '!'`, not one template string.
  2. Since React 17 the default ("automatic") transform calls `jsx()` from `react/jsx-runtime`, not `createElement`. Q3 (line 4720) explains this correctly.
- **Change to:** Show the `_jsx("h1", { children: ["Hello, ", name, "!"] })` output. Or say "is roughly equivalent to" and point to Q3.

**R8. [Outdated] The "unmounted component" warning no longer exists**
*Line 1321*
- **Now:** Says a missing cleanup causes the warning "Can't perform a React state update on an unmounted component".
- **Problem:** React 18 removed that warning. Lines 5712 and 6930 say so.
- **Change to:** Give the real reasons to clean up: memory leaks, duplicate subscriptions, and a slow old request overwriting newer data (race conditions).

**R9. [Wrong] History of the `useId` prefix**
*Lines 4409 and 5645*
- **Now:** Says the prefix changed from `:r:` to `_r_` because colons broke CSS selectors.
- **Problem:** It changed twice. React 19.1 changed `:r:` to `«r»`, and React 19.2 changed `«r»` to `_r_`.
- **Change to:** Give both steps.

**R10. [Minor] Hook count**
*Line 1237*
- **Now:** "14 built-in hooks."
- **Problem:** The table right below it lists 15.
- **Change to:** "15", or avoid a number.

**R11. [Wrong] What `e.nativeEvent.stopPropagation()` stops**
*Line 6003 (Q52)*
- **Now:** Says it stops native listeners on ancestor elements.
- **Problem:** React listens at the root container. By the time your React handler runs, the native event has already bubbled up to the root, so native listeners on elements *between* the target and the root have already run. Calling it only stops listeners *above* the root (`document`, `window`).
- **Change to:** "It only stops native listeners above the React root, such as `document` and `window`."

**R12. [Wrong, medium confidence] Tricky Q25 answer assumes the compiler is off**
*Lines 8809–8841*
- **Now:** The scenario says the React Compiler is enabled, and the answer says the list "grows by two every click".
- **Problem:** With the compiler on, `Demo` is compiled and `<TagList tags={tags}/>` is memoised (`tags` doesn't change), so `TagList` wouldn't re-render on click. "Grows by two" only happens with the compiler off.
- **Change to:** Either say the compiler is *off* in this scenario, or change the answer.

**R13. [Outdated] `defaultProps` and `propTypes` in React 19**
*Lines 726 and 755*
- **Now:** Line 726 says React 18 "deprecated" `defaultProps` on function components. Line 755 talks about `propTypes` as if it still runs.
- **Problem:** React 19 **removed** `defaultProps` for function components (classes still support it), and silently ignores `propTypes`. §16.9 already lists both.
- **Change to:** "Removed in React 19 for function components; use default parameter values." And: "React 19 ignores `propTypes`; use TypeScript."

**R14. [Outdated] Shape of a React element**
*Lines 3786 and 5405*
- **Now:** Lists `ref` as a top-level field of the element object.
- **Problem:** In React 19, `ref` is an ordinary prop (`element.props.ref`). Reading `element.ref` is deprecated.
- **Change to:** Move `ref` into `props` in the example.

**R15. [Inconsistent] `eslint-plugin-react-hooks` version**
*Lines 2633, 8803, 8851 say v6; lines 4024 and 4531 say 7.x*
- **Change to:** Use the current version (7.x) everywhere.

**R16. [Inconsistent] Default download priority of images**
*Line 2981 says "medium"; web-performance-guide.md lines 214, 530 and 833 say "Low"*
- **Problem:** In Chrome, images start at **Low** priority. The first few large images get boosted to Medium, and `fetchpriority="high"` raises the LCP image to High. The web-performance guide is closer to the truth.
- **Change to:** Use the same sentence in both guides. Better still, keep it only in web-performance (see Part 2) and link to it.

**R17. [Minor] Next.js listed as having a `loader`**
*Line 2111*
- **Problem:** The Next.js App Router has no `loader` function. Data is fetched inside Server Components.
- **Change to:** Remove Next.js from that list, or describe its approach separately.

**R18. [Minor] `'use client'` placed in the middle of a file**
*Line 4975 (Q13)*
- **Problem:** The directive must be the very first statement in the file, before any imports.
- **Change to:** Move it to the top of the code example.

**R19. [Minor] Zustand example contradicts its own advice**
*Line 5004 (Q14)*
- **Problem:** The example reads the whole store with no selector, right after advising readers to always use selectors.
- **Change to:** `useStore(s => s.count)`.

**R20. [Minor] Where `useSyncExternalStore` fails without `getServerSnapshot`**
*Lines 1456 and 5965*
- **Problem:** The error is thrown during **server rendering**, not during hydration.
- **Change to:** "Throws during server rendering."

**R21. [Minor] Broken cross-references**
*Lines 1264 and 1298*
- **Problem:** They refer to "lazy initialisation in §5.1 / §5.3", but those sections don't cover it.
- **Change to:** Add a short lazy-initialisation example to §5.1, or point to where it is actually covered.

**R22. [Minor] What `revalidatePath` with a dynamic segment does**
*Line 3337*
- **Problem:** `revalidatePath('/blog/[slug]', 'page')` invalidates **every** blog post page, not "a single path".
- **Change to:** "To refresh one post, call `revalidatePath('/blog/my-post')`. The `[slug]` form refreshes all of them."

**R23. [Verify] `getSnapshot` call frequency**
*Line 2768*
- **Now:** "snapshot called once per commit".
- **Note:** React calls `getSnapshot` on every render, not once per commit. That is why it must return a cached value. Check against the React docs and reword.

**R24. [Verify] "Effects always run after paint"**
*Lines 1317, 4975 and 8975 (Key Rule 4)*
- **Note:** Since React 18, effects triggered by a discrete user event such as a click are flushed **before** the browser paints.
- **Suggested change:** "Effects *usually* run after paint", plus a footnote.

**R25. [Verify] Two fragile details**
- Line 540: whether calling `setState` in `componentWillUnmount` still warns.
- Line 8729 (Tricky Q23): the answer "3" depends on two timers both firing at exactly 3000 ms, which is a race. Change one of the delays so the order is unambiguous.

**R26. [Verify] Facts dated mid-2026 or later**
- §16.10–16.11 and Q83: React 19.3, `browser()`, Fragment refs, `<ViewTransition>` going stable.
- React Foundation date (Feb 2026).
- Vite 8 release date (March 2026).
- `actions/checkout@v7`.
- Next.js 16's `revalidateTag` needing a second argument.

Check each against official release notes.

---

### 1.2 `javascript-and-typescript/javascript-guide.md`

**J1. [Wrong] [verified] Value of `this` at the top level in strict mode**
*Lines 6428–6463 (Tricky Q31)*
- **Now:** Says `user.arrow()` prints `undefined` because top-level `this` "in strict mode is undefined".
- **Problem:** `'use strict'` does **not** change top-level `this`. In a normal browser script it is `window`. In Node CommonJS it is `module.exports`, so the code prints "has a this". It is only `undefined` in an **ES module**.
- **Change to:** "In an ES module, top-level `this` is undefined", and run the example as a module (`<script type="module">` or an `.mjs` file).

**J2. [Wrong] [verified] Closure memory example**
*Lines 4173–4183 (Q25)*
- **Now:** The comment says "`rows` can never be collected".
- **Problem:** V8 only keeps the variables that some closure actually uses. Here the event handler only uses `summary`, so `rows` *is* garbage-collected. This was confirmed with `--expose-gc`. `rows` would only stay alive if another closure from the same function also used it, which Q29 (line 4466) explains.
- **Change to:** Add a second closure in the same function that references `rows`. That makes the leak real and matches Q29.

**J3. [Wrong] [verified] `FinalizationRegistry` example throws**
*Line 3676 (Q13)*
- **Now:** Says `registry.register(user, user)` keeps `user` alive forever.
- **Problem:** It throws `TypeError: target and holdings must not be same`.
- **Change to:** Explain that the engine forbids this, because using the target as its own "holdings" would keep it alive. Show `registry.register(user, user.id)`.

**J4. [Wrong] [verified] The `'constructor'` key is not a silent bug**
*Line 4108 (Q21)*
- **Now:** "Swap the key for 'constructor' and you get the same class of bug silently."
- **Problem:** `obj.constructor` is the `Object` function, so `.push()` on it throws a `TypeError`. That is the same visible failure as `__proto__`, not a silent one.
- **Change to:** Say it throws too. If you want a silent example, use a key like `toString` with a check like `if (obj[key])`, which is truthy because it is inherited.

**J5. [Wrong] [verified] `Array.fromAsync` and concurrency**
*Line 5788 (Tricky Q16)*
- **Now:** "`Array.fromAsync([p1,p2,p3])` … same result, no concurrency."
- **Problem:** The three promises are already running when you create them. Three 50 ms promises finished in about 53 ms, not 150 ms. The real differences from `Promise.all` are:
  1. It does not stop at the first rejection (no fail-fast).
  2. A later promise that rejects while an earlier one is still being awaited can trigger an "unhandled rejection".
- **Change to:** Explain those two differences instead.

**J6. [Outdated] React `stopPropagation` and `document` listeners**
*Line 3105*
- **Now:** Says calling `e.stopPropagation()` in a React `onClick` does not stop a native listener on `document`.
- **Problem:** That was true up to React 16. Since React 17, React attaches its listeners to the root container instead of `document`, so it **does** stop `document` listeners.
- **Change to:** Describe the React 17+ behaviour, mentioning that it changed in 17.

**J7. [Minor] `map(parseInt)` explanation**
*Line 1411*
- **Problem:** It blames the third parameter (`array`). It is the **second** parameter (the index) that `parseInt` treats as the radix. The output shown is correct.
- **Change to:** "the second parameter, the index, becomes `parseInt`'s radix".

**J8. [Minor] Comment in an `await` example**
*Lines 1733–1738*
- **Problem:** The comment says the `await` "resolves with undefined and the try block is never entered". It resolves with `null`, and it is the **catch** block that never runs.
- **Change to:** Fix both words.

**J9. [Minor] Closure "privacy" from the debugger**
*Line 1122*
- **Problem:** Says a debugger can't see closure variables. DevTools shows them under `[[Scopes]]`.
- **Change to:** "Hidden from other code, though not from DevTools."

**J10. [Minor] Arrow function `this` in a browser**
*Line 772*
- **Problem:** The comment says the arrow prints `undefined`. In a browser script `this` is `window`, and `window.name` is `''` (empty string). Line 789 makes that very point.
- **Change to:** Say it prints `''` in a browser script, and `undefined` in Node or a module.

**J11. [Minor] Why `push` fails on a sealed array**
*Line 3947*
- **Problem:** It fails because a sealed array is **non-extensible** (no new index can be added). It is not because "length cannot grow": `length` stays writable.

**J12. [Minor] `==` and the ToPrimitive hint**
*Line 5190*
- **Problem:** `==` uses the "default" hint, not "number". The result is the same, so this is wording only.

**J13. [Minor] Errors from Web Workers**
*Line 2523*
- **Problem:** Errors posted from a worker are structured-cloned into the main page, so `instanceof Error` **does** work for them. The iframe case described is correct.

**J14. [Verify] How `redux-immutable-state-invariant` detects mutation**
*Line 3949*
- **Note:** The guide says it deep-freezes state. The reviewer believes it tracks and compares instead. Check the library's README.

**J15. [Outdated] `using` declarations**
*Line 2286*
- **Now:** "needs TypeScript 5.2+ or a transpiler".
- **Problem:** `using` now runs natively in Chrome 134+ and Node 24. The Node 20 caveat refers to a version that reached end of life in April 2026.
- **Change to:** "Native in Chrome 134+ and Node 24+; TypeScript 5.2+ or a transpiler for older targets."

**J16. [Verify] ES version table**
*Lines 2279–2284*
- **Note:** The table is correct, but it leaves out `JSON.parse` source-text access (ES2026). This is optional to add.

**J17. [Inconsistent] Top-level `this` described three different ways**
*Line 754 says `window` or `{}`; lines 772/789 say `''`; Tricky Q31 (6463) says "undefined in strict mode"*
- **Change to:** Use one rule everywhere:
  - classic browser script: `window`
  - Node CommonJS: `module.exports` (`{}`)
  - ES module: `undefined`

**J18. [Inconsistent] Event-loop diagrams**
*§11 (line 2691) draws rendering after the macrotask; Q6 (line 3337) draws it before*
- **Change to:** Both can be defended, but side by side they confuse readers. Keep one diagram (see Part 2, where the event loop is explained seven times).

---

### 1.3 `javascript-and-typescript/typescript-guide.md`

**T1. [Wrong] [verified] `push` on a tuple**
*Line 1203*
- **Now:** Says `palette3.red.push(0)` is an error because the tuple has a fixed length.
- **Problem:** An ordinary tuple type `[number, number, number]` still has `push`, and this compiles. Only a `readonly` tuple blocks it.
- **Change to:** Make the tuple `readonly [number, number, number]` (for example with `as const`), or delete the line.

**T2. [Wrong] [verified] What `satisfies` catches**
*Line 1189*
- **Now:** Presents the `read:` typo as something `satisfies` catches but `as` misses.
- **Problem:** Against `Record<string, …>`, any key is allowed, so `satisfies` doesn't catch the typo either.
- **Change to:** Use a type with fixed keys, for example `Record<'red' | 'green' | 'blue', …>`, so the typo is caught.

**T3. [Wrong] [verified] Excess-property checks on a union**
*Line 2387*
- **Now:** Says passing `{ href, onClick }` as an inline object literal would be caught by excess-property checking.
- **Problem:** With a union type, a key is allowed if it exists in **any** member of the union, so the literal compiles. That is exactly why the `never` trick shown next is needed.
- **Change to:** "Excess-property checking does *not* catch this with a union, which is why we need `never`."

**T4. [Wrong] [verified] Type parameter inference**
*Line 3213*
- **Now:** "Any type parameter that appears in more than one position widens to a union of candidates."
- **Problem:** Too broad. `f<T>(a: T, b: T)` called as `f(1, 'x')` is an **error** (TS2345), not `number | string`. A union only forms in narrower cases, such as literal types with the same base type.
- **Change to:** Narrow the claim and show the TS2345 counter-example.

**T5. [Wrong] Compiled output renames variables**
*Lines 113–118*
- **Now:** The "compiled JavaScript" shows `greet`/`alice` renamed to `greetV2`/`aliceV2`.
- **Problem:** `tsc` never renames identifiers. It only removes types.
- **Change to:** Keep the original names in the output.

**T6. [Wrong] "Only enums emit runtime code"**
*Lines 248 and 1654*
- **Problem:** Namespaces, constructor parameter properties (`constructor(private x)`) and `import x = require()` also produce JavaScript. §13.3, Q19 and Q23 in the same guide list them correctly.
- **Change to:** List all of them, or point to §13.3.

**T7. [Minor] Side-effect imports**
*Line 2295*
- **Problem:** Implies a bare `import './x'` may be removed. `tsc` never removes side-effect imports.

**T8. [Outdated, verify] Deprecated tsconfig options**
*Line 1519 (`baseUrl`) and line 150 (`target: "ES5"`)*
- **Note:** Both are deprecated in TypeScript 6.0, and the guide itself says 6.0 turns deprecations into errors. Confirm against the TS 6.0 release notes.
- **Change to:** Use `paths` without `baseUrl`, and a modern target (for example `ES2022`).

**T9. [Outdated] "Decorators (experimental)"**
*Line 141*
- **Problem:** Standard decorators have needed no flag since TypeScript 5.0. Only the *legacy* decorators need `experimentalDecorators`.

**T10. [Inconsistent] "tsc is written in JavaScript"**
*Line 239*
- **Problem:** Conflicts with §13.2, which says TypeScript 7 is a native port written in Go.
- **Change to:** "tsc up to 6.x is written in TypeScript; 7.x is a native Go port."

**T11. [Outdated] Old error message wording**
*Lines 307 and 1775*
- **Problem:** They use "Object is of type 'unknown'". Current TypeScript says `'x' is of type 'unknown'.` (TS18046), as lines 2504 and 2989 already show.

**T12. [Outdated] `const enum` recommended without a warning**
*Line 3061*
- **Problem:** `const enum` breaks under `isolatedModules`, `verbatimModuleSyntax` and `erasableSyntaxOnly`, which §13.3 recommends turning on.
- **Change to:** Add that caveat, or recommend `as const` objects instead.

**T13. [Verify] TypeScript 7 details**
*Lines 1540–1556 and 2231*
- **Note:** Check the release date ("8 Jul 2026"), the `@typescript/typescript6` / `tsc6` package, "no API in 7.0" and the `tsgo` naming against the TypeScript blog.

---

### 1.4 `javascript-and-typescript/regex-guide.md`

**X1. [Wrong] [verified] `split` results are missing an empty string**
*Lines 497–498*
- **Now:** `'a1b2c3'.split(/\d/)` → `['a','b','c']` and `'a1b2c3'.split(/(\d)/)` → `['a','1','b','2','c','3']`.
- **Problem:** The string ends with a digit, so there is an empty piece after it.
- **Change to:** `['a','b','c','']` and `['a','1','b','2','c','3','']`.

**X2. [Wrong] [verified] Email example that the regex actually rejects**
*Line 1129*
- **Now:** Says the email regex accepts `..@.`.
- **Problem:** It rejects that string. `..@a.b` is an example it really accepts.
- **Change to:** `..@a.b`.

**X3. [Minor] Number of backtracking paths**
*Lines 547, 1180 and 1302*
- **Problem:** The number of ways nested quantifiers can split *n* characters is 2^(n−1), not 2^n. The conclusion ("exponential") stays the same.

**X4. [Minor] The 2019 Cloudflare outage**
*Line 1304*
- **Problem:** Calls the Cloudflare regex "similar structure" to `(a+)+` and says it took down half of traffic. The real pattern was `.*.*=.*`, which backtracks **polynomially**, not exponentially. Line 551 describes it correctly. It also took down nearly all of Cloudflare's traffic, not half.
- **Change to:** Match line 551.

**X5. [Outdated] Hand-written `escapeRegex`**
*Lines 76 and 762*
- **Problem:** `RegExp.escape()` is standard since ES2025 and available in current browsers and Node 24. The regex cheat sheet already uses it.
- **Change to:** Recommend `RegExp.escape()`, and keep the hand-written helper as a fallback for older environments.

**X6. [Inconsistent] The guide and `cheatsheets/regex.md` disagree**
| Topic | Guide | Cheat sheet |
|---|---|---|
| Escaping | hand-written helper | `RegExp.escape` |
| Hex colour pattern | 3 or 6 digits | 3, 6 or 8 digits |
| Email top-level domain | `+` | `{2,}` |

Also, the guide's three password patterns (lines 331, 655, 1140) each use a different set of "special characters". Pick one version of each pattern and use it in every place.

---

### 1.5 Comparison pages

**C1. [Wrong] [verified] Syntax error**
*`js-comparisons.md` line 106*
- **Now:** `delay(5000).then(() => throw)`
- **Problem:** `throw` is a statement, not an expression, so this is a `SyntaxError`.
- **Change to:** `delay(5000).then(() => { throw new Error('timeout'); })`

**C2. [Wrong] `useReducer` vs `useState` batching**
*`react-comparisons.md` line 44*
- **Now:** "`useReducer` can batch updates naturally; `useState` re-renders on every set call."
- **Problem:** Since React 18, **all** state updates are batched automatically, and both hooks behave the same way.
- **Change to:** Compare them on what really differs: complex state transitions, testability of the reducer, and passing `dispatch` down.

**C3. [Wrong] Zustand and mutation**
*`react-comparisons.md` line 135*
- **Now:** Says Zustand lets you "mutate state directly via setters".
- **Problem:** Zustand's `set()` is immutable, like React state. Direct mutation only works with the `immer` middleware.

**C4. [Wrong] When Server Components became stable**
*`react-comparisons.md` line 143*
- **Now:** "introduced with React 18".
- **Problem:** They became stable in **React 19**. React 18 only had experimental support.

**C5. [Minor] React Compiler and React 19**
*`react-comparisons.md` line 70*
- **Problem:** The React Compiler is a separate build tool. It is not part of React 19, and it supports React 17 and later.

**C6. [Verify] `useLayoutEffect` SSR warning**
*`react-comparisons.md` lines 86 and 92 (also `cheatsheets/react-hooks.md` line 184)*
- **Note:** The reviewer believes React 19 removed the "useLayoutEffect does nothing on the server" warning. Confirm before editing.

---

### 1.6 Cheat sheets (`src/content/cheatsheets/`)

**S1. [Wrong] [verified] `satisfies` and literal types**
*`typescript.md` line 76*
- **Now:** Says `satisfies` "keeps `{ x: 'y' }`".
- **Problem:** The inferred type is `{ x: string }`. The keys are kept, but the literal `'y'` widens to `string` unless you add `as const`. The TypeScript guide (line 2216) has this right.

**S2. [Verify] `useEffectEvent` "stable identity"**
*`react-hooks.md` line 124*
- **Note:** The React docs say Effect Events intentionally do **not** have a stable identity. They must not go in dependency arrays or be passed to other components. This is probably wrong; confirm and reword.

**S3. [Inconsistent] ES version labels**
*`javascript-es6.md` lines 156–174*
- **Problem:** Puts Temporal and `using` under "ES2026", while the JavaScript guide puts them in ES2027. It also lists labelled blocks (an ES3 feature) as a "modern addition".
- **Change to:** Match the JavaScript guide's table, and remove labelled blocks.

**S4. [Wrong] Grid `auto-fill` behaviour**
*`css-flexbox-grid.md` line 122*
- **Problem:** Says `auto-fill` items "stay 200px". With `minmax(200px, 1fr)` they still grow to fill the space. The difference from `auto-fit` is only what happens to *empty* tracks.

**S5. [Minor] Grid overflow on small screens**
*`css-flexbox-grid.md` lines 41 and 74*
- **Problem:** `minmax(250px, 1fr)` overflows on screens narrower than 250px. The modern-css guide (line 224) warns about this.
- **Change to:** `minmax(min(250px, 100%), 1fr)`.

---

### 1.7 `front-end/nextjs-rsc-guide.md`

**N1. [Wrong] What can be passed from a Server to a Client Component**
*Lines 166, 798 and 1211*
- **Now:** The "can cross the boundary" lists include `RegExp` and "Symbols (except well-known)".
- **Problem:** `RegExp` is **not** serialisable. Only *global* symbols created with `Symbol.for()` can cross, not "all except well-known".
- **Change to:** Remove `RegExp`, and say "symbols created with `Symbol.for()`". You could also add TypedArray, ArrayBuffer and FormData, which are allowed.

**N2. [Wrong] `params` read synchronously**
*Lines 403–404*
- **Now:** The example reads `params.id` directly.
- **Problem:** Since Next.js 15, `params` is a Promise. §4.2 of the same guide says so. This code gets `undefined`.
- **Change to:** `const { id } = await params;`

**N3. [Wrong] Zod schema drops the field it needs**
*Line 445*
- **Problem:** The code reads `parsed.data.id`, but the schema has no `id` field, so Zod strips it and the value is `undefined`. Also, `updateTag` is used without being imported.
- **Change to:** Add `id` to the schema, and add the import.

**N4. [Outdated] `priority` on images**
*Line 633*
- **Problem:** `next/image`'s `priority` prop is deprecated in Next.js 16 in favour of `preload`.

**N5. [Wrong] When params became async**
*Lines 214–216*
- **Now:** Calls async `params` "a Next.js 16 breaking change".
- **Problem:** Async params arrived in **Next.js 15**, with a temporary synchronous fallback. Next.js 16 removed the fallback.
- **Change to:** "Introduced in 15 with a sync fallback; the fallback was removed in 16."

**N6. [Outdated] Caching tables overstate Next.js 16**
*Lines 305 and 702*
- **Problem:** The tables read as if Next.js 16 makes all caching opt-in. That only applies when `cacheComponents: true` is set. Without it, the Next.js 15 behaviour applies.
- **Change to:** Add a "with / without `cacheComponents`" column or footnote.

**N7. [Verify] Turbopack dev filesystem cache**
*Line 608*
- **Note:** Described as beta behind a flag. The reviewer believes it became stable and on by default in 16.1.

**N8. [Missing] "React2Shell" security incident**
- **Note:** The December 2025 remote-code-execution bug in the React Server Components Flight protocol (CVE-2025-55182; Next.js advisory CVE-2025-66478) is not mentioned. It is directly relevant to this guide's security section.

**N9. [Verify] CVE numbers and dates**
*Lines 523–524 and 611*
- **Note:** Check CVE-2026-45109, CVE-2026-64642 and "React 19.3, September 2026" against the official advisories and release notes.

---

### 1.8 `front-end/react-router-guide.md`

**RR1. [Outdated] Package name**
*Line 47 and throughout*
- **Now:** Installs and imports from `react-router-dom`.
- **Problem:** In React Router v7, everything lives in `react-router`. `react-router-dom` now only exists to help people migrate.
- **Change to:** `npm install react-router`, and `import { ... } from 'react-router'` in every example.

**RR2. [Outdated] Incomplete list of future flags**
*Line 470*
- **Problem:** The v6→v7 future-flag list leaves out `v7_skipActionErrorRevalidation`.

**RR3. [Wrong] `<ScrollRestoration/>`**
*Line 376*
- **Now:** Says it is framework-mode only.
- **Problem:** It also works in data mode (`createBrowserRouter`).

**RR4. [Wrong] When loaders re-run**
*Line 543*
- **Now:** "Loaders re-run on every navigation."
- **Problem:** By default, a loader re-runs only when:
  - its route's params or the search string change,
  - an action has been submitted, or
  - you navigate to the same URL again.

  Parent loaders whose inputs didn't change do **not** re-run.
- **Change to:** List those three triggers.

---

### 1.9 `front-end/tanstack-query-guide.md`

**TQ1. [Outdated] Redux example uses removed syntax**
*Line 815*
- **Problem:** The Redux+Saga comparison declares `extraReducers` in object form, which Redux Toolkit 2 removed. The handlers shown are really ordinary `reducers` anyway.

**TQ2. [Inconsistent] Automatic cancellation**
*§7.5 says queries "auto-cancel on unmount"; §6.4 says this only happens if you pass the `signal` to `fetch`*
- **Change to:** Use §6.4's (correct) wording in §7.5.

**TQ3. [Wrong comparison] §7 compares against an outdated setup**
- **Problem:** §7 compares TanStack Query with hand-written Redux + Redux Saga, which almost nobody would choose today. The fair comparison is with **RTK Query**, which the Redux Toolkit guide (Q12) already treats as the real alternative.
- **Change to:** Rewrite §7–8 as "TanStack Query vs RTK Query". See also Part 2.

**TQ4. [Inconsistent] Mocking advice**
*Q22 recommends `vi.mock('@/lib/api')`; testing-strategy-guide.md calls module mocking a smell and recommends MSW*
- **Change to:** Use MSW, as the testing-strategy guide does.

---

### 1.10 `front-end/redux-toolkit-guide.md`

**RT1. [Outdated] Lazy-loading reducers**
*Line 1261*
- **Problem:** Uses `store.replaceReducer`. In Redux Toolkit 2 the built-in way is `combineSlices(...)` plus `.inject(slice)`.

**RT2. [Minor] Missing development check**
*Line 1093*
- **Problem:** The list of development-only middleware leaves out `actionCreatorCheck`, added in RTK 2.

---

### 1.11 `front-end/zustand-guide.md`

**Z1. [Wrong] Jotai and Providers**
*Line 341*
- **Now:** Lists Jotai as "Provider required: Yes".
- **Problem:** Jotai works without a Provider, using a default global store. A Provider is optional.

**Z2. [Wrong] `persist` rehydration timing**
*Line 231*
- **Now:** "persist is asynchronous on rehydration".
- **Problem:** With `localStorage`, rehydration happens synchronously when the store is created. It is only asynchronous with async storage, such as React Native's AsyncStorage. The SSR mismatch the guide warns about is real, but it happens because the *server has no localStorage*, not because rehydration is async.

**Z3. [Verify] Size of immer**
*Line 226*
- **Now:** "immer adds ~14 KB".
- **Note:** The reviewer believes it is about 5 KB gzipped. Check bundlephobia.

**Z4. [Outdated] Equality functions in Zustand v5**
*Line 148*
- **Now:** Says `useShallow` is "the only supported form".
- **Problem:** `createWithEqualityFn` from `zustand/traditional` still exists in v5 for custom equality functions.

---

### 1.12 `front-end/redux-saga-guide.md`

No errors found. This guide received the lightest check (setup, comparison section and Q&A titles only). See Part 3 about its length.

---

### 1.13 `front-end/storybook-guide.md`

**SB1. [Wrong] Test-runner and snapshots**
*Line 977*
- **Now:** "Using test-runner, stories are automatically snapshot tested."
- **Problem:** The test-runner checks that each story renders without errors and runs its `play` function. Snapshot testing has to be added yourself with a `postVisit` hook.

**SB2. [Outdated] Viewport configuration**
*Lines 646–660*
- **Problem:** `parameters.viewport.defaultViewport` is the Storybook 8 API. Storybook 9, which line 100 says the guide targets, uses:
  - `globals: { viewport: { value: '...' } }` to choose the viewport
  - `parameters.viewport.options` to list the available viewports

---

### 1.14 `front-end/jest-react-testing-library-guide.md`

**JE1. [Inconsistent] A "Don't" that is later used as a good example**
*Line 1450 vs lines 1484–1492*
- **Problem:** The Don'ts list bans using `getBy` inside `waitFor`. A few lines later the guide calls the same pattern "works, but wordy" and uses it in a ✅ example.
- **Change to:** Remove the Don't, or rewrite it as "prefer `findBy` over `waitFor` + `getBy`".

**JE2. [Outdated] Missing package in the install line**
*Lines 31 and 1503*
- **Problem:** `testEnvironment: 'jsdom'` needs the separate `jest-environment-jsdom` package (required since Jest 28). The install command leaves it out.

**JE3. [Outdated] Inline snapshot format**
*Line 2113*
- **Problem:** The snapshot shows escaped quotes (`\"`). Since Jest 29 the default is `escapeString: false`, so the snapshot contains plain quotes.

**JE4. [Wrong] Vite alias path**
*Around line 1537*
- **Problem:** `'@': './src'` is a relative path. Vite aliases need absolute paths.
- **Change to:** `'@': path.resolve(__dirname, './src')`

**JE5. [Inconsistent] Which end-to-end tool**
*Q21 (around line 2224) names Cypress; testing-strategy-guide.md treats Playwright as the default*
- **Change to:** Use Playwright as the default in both, and mention Cypress as an alternative.

**JE6. [Inconsistent] Mocking advice**
*§13.2 (lines 1210–1245) and Q9 (1837–1866) call `jest.mock` "the most common" approach and fine for unit tests; testing-strategy-guide.md (lines 158–177 and 486–496) calls module mocking a smell*
- **Change to:** Agree on one rule across the site: use MSW for network calls, and module mocks only for things you genuinely can't run in a test.

---

### 1.15 `front-end/testing-strategy-guide.md`

No errors found. It is the most accurate of the testing guides, so it should be the "owner" of shared testing topics (see Part 2).

---

### 1.16 `front-end/realtime-web-guide.md`

**RW1. [Wrong] Broken Server-Sent Events example**
*Lines 207–212*
- **Problem:** There is no blank line before `event: typing`. In SSE, a blank line ends an event, so without it the two events merge into one.
- **Change to:** Insert the blank line.

**RW2. [Wrong] Socket.IO fallback transport**
*Lines 894–897*
- **Problem:** Implies Socket.IO falls back to Server-Sent Events. It falls back to **HTTP long-polling** and has no SSE transport.

**RW3. [Outdated, verify] GraphQL subscription import paths**
*Lines 738 and 750*
- **Note:** `graphql-ws/lib/use/ws` became `graphql-ws/use/ws` in graphql-ws v6. The reviewer also believes `asyncIterator` became `asyncIterableIterator` in graphql-subscriptions v3.

**RW4. [Outdated] Socket.IO Redis adapter**
*Line 1064*
- **Problem:** `socket.io-redis` is now `@socket.io/redis-adapter`.

---

### 1.17 `front-end/modern-css-guide.md`

**M1. [Wrong] Specificity values**
*Lines 1064–1068 and 1081*
- **Now:** `:is(#wrap) .text` is `1,0,1`; `:where(#wrap) .text` is `0,1,1`.
- **Problem:** The format is (IDs, classes, elements), and `.text` is a **class**, not an element:
  - `:is(#wrap) .text` = 1 ID + 1 class = **1,1,0**
  - `:where(#wrap) .text` = the `:where` part counts as zero, plus 1 class = **0,1,0**
  - `:is(.card, #featured) .title` = **1,1,0**

  The final answer (red wins) is still right.
- **Change to:** Fix the three numbers and the sorting line.

**M2. [Wrong, moderate confidence] Duplicate `view-transition-name`**
*Lines 1214–1220*
- **Now:** Says a duplicated name falls back to a whole-page cross-fade.
- **Problem:** By the spec, a duplicate name makes the transition **skip entirely**, with an `InvalidStateError`.

**M3. [Wrong, moderate confidence] Popover focus**
*Lines 555 and 1380*
- **Now:** Says `popover` gives "automatic focus management".
- **Problem:** Opening a popover does **not** move focus into it. It does give light-dismiss, Esc to close, and focus returning to the trigger in some cases.
- **Change to:** List exactly what it does, and note that focus does not move in.

**M4. [Wrong] WCAG 2.3.3 level and an over-broad snippet**
*Lines 688 and 1400*
- **Problem:** WCAG 2.3.3 (Animation from Interactions) is **AAA**, while most audits target AA, so say so. Also, the snippet on lines 692–697 turns off *all* animation, which contradicts line 688's advice to reduce only non-essential motion.
- **Change to:** Mention AAA, and make the snippet target only decorative animation.

**M5. [Verify] "React 19.3, September 2026"**
*Line 632*

---

### 1.18 `front-end/accessibility-guide.md`

**A1. [Wrong] Number of WCAG 2.2 success criteria**
*Lines 65 and 1104*
- **Now:** "87 success criteria".
- **Problem:** WCAG 2.2 has **86**: 2.1's 78, minus 4.1.1 Parsing (removed), plus 9 new.

**A2. [Wrong] What happens with a broken `aria-labelledby`**
*Lines 885, 895, 917 and 1131 (Tricky question and cheat sheet)*
- **Now:** Says an `aria-labelledby` pointing at an ID that doesn't exist gives the button an empty name and never falls back to its text.
- **Problem:** The accessible-name rules only use `aria-labelledby` if **at least one** of its IDs points at a real element. If none do, the browser ignores it and uses `aria-label` or the visible text, so the button is still named "Save".
- **Change to:** Make the bug scenario an ID that points at an element that *exists* but is empty or contains the wrong text. That really does produce a bad name.

**A3. [Wrong] Skipped heading levels**
*Line 150*
- **Now:** "h2 → h4 is a failure of 1.3.1."
- **Problem:** Skipping heading levels is bad practice but not a normative WCAG failure.
- **Change to:** "Not a WCAG failure on its own, but confusing for screen-reader users. Avoid it."

**A4. [Wrong] WCAG 2.3.3 level**
*Line 1185*
- **Problem:** Same issue as M4: 2.3.3 is AAA, not AA.

---

### 1.19 `front-end/browser-apis-guide.md`

**B1. [Wrong] Cookie size limit**
*Lines 106, 205 and 986*
- **Now:** "4 KB total per domain".
- **Problem:** The limit is about 4 KB **per cookie**. Browsers also cap the *number* of cookies per domain (around 50 or more).

**B2. [Wrong] Setting `HttpOnly` from JavaScript**
*Lines 110–111*
- **Problem:** The example sets `HttpOnly` through `document.cookie`. Browsers ignore that: `HttpOnly` can only be set by the server. This contradicts line 122 and the guide's own Tricky Q3 (line 1382).
- **Change to:** Remove `HttpOnly` from the client-side example, and point to the server-side example.

**B3. [Wrong] "One worker per page"**
*Line 446*
- **Problem:** A page can create as many dedicated workers as it likes. "Dedicated" means each worker has *one owner*, not that there is one per page.

**B4. [Wrong] `requestAnimationFrame` in hidden tabs**
*Lines 1644 and 1683*
- **Now:** Says Chrome runs rAF at about 1 Hz in background tabs.
- **Problem:** Chrome **stops** rAF completely in hidden tabs. The 1-per-second figure applies to *timers* (`setTimeout`/`setInterval`). This also contradicts line 1145, which says rAF is "auto-paused".

**B5. [Wrong] SameSite=Lax "the modern default"**
*Line 124*
- **Problem:** Only Chromium-based browsers default to Lax. Firefox and Safari do not.
- **Change to:** "Chromium browsers default to Lax; always set SameSite explicitly."

**B6. [Minor] `Cache.put` and structured clone**
*Line 1212*
- **Problem:** `Cache.put` stores a `Response`; it does not use structured clone.

---

### 1.20 `front-end/design-patterns-guide.md`

**D1. [Wrong] "fetch is a Facade over XMLHttpRequest"**
*Line 546*
- **Problem:** `fetch` and `XMLHttpRequest` are separate browser APIs. `fetch` is not built on XHR.
- **Change to:** Pick a real facade example, such as an `apiClient` wrapping `fetch` with auth, retries and JSON parsing.

**D2. [Wrong] Bridge pattern class count**
*Line 422*
- **Problem:** The example needs 2 + 3 classes, not "3 + 3".

**D3. [Inconsistent] What pattern Express middleware is**
*Lines 514 and 1117 say Decorator; lines 653 and 867 say Chain of Responsibility*
- **Change to:** Use Chain of Responsibility everywhere: each middleware can handle the request, pass it on with `next()`, or stop the chain.

**D4. [Inconsistent] What pattern reducers are**
*Line 807 says State pattern; line 1064 says Command + Mediator*
- **Change to:** Choose one explanation (actions as Commands is the common view) and use it in both places.

**D5. [Inconsistent] When to generalise code**
*Line 135 says after the second case; refactoring-code-review-guide.md line 56 and frontend-architecture-guide.md line 78 say the "rule of three"*
- **Change to:** Use the rule of three in all three guides. Line 1077 already partly reconciles them.

---

### 1.21 `front-end/refactoring-code-review-guide.md`

**RF1. [Outdated] Reaching for `useCallback`**
*Line 280*
- **Problem:** Recommends `useCallback` for inline handlers. With the React Compiler now stable, manual `useCallback` is mostly unnecessary in compiled code.
- **Change to:** Mention the compiler first, and keep `useCallback` for projects without it.

---

### 1.22 `front-end/frontend-architecture-guide.md`

**FA1. [Verify] CVE numbers**
*Line 588*
- **Note:** Check CVE-2026-45109 and CVE-2026-64642 (also used in the Next.js guide).

**FA2. [Verify] "Vite 8 supports Module Federation natively"**
*Line 279*
- **Note:** As far as the reviewer knows, Module Federation on Vite still comes from the `@module-federation/vite` plugin. See FT7.

---

### 1.23 `front-end/frontend-tooling-guide.md`

**FT1. [Wrong] `eslint --ext` with flat config**
*Lines 1619–1620*
- **Problem:** The `--ext` flag does not work with flat config, which the guide's own §9 says is now the only config format.
- **Change to:** `eslint .`, with file patterns set in `eslint.config.js`.

**FT2. [Outdated] Husky setup**
*Lines 1625–1626*
- **Problem:** `husky install` is deprecated in Husky v9. The setup is `"prepare": "husky"` plus a `.husky/pre-commit` file. Also, a script named `"precommit"` in `package.json` is not a Git hook and will never run on commit.

**FT3. [Wrong] SVGR import**
*Line 269*
- **Problem:** `import { ReactComponent as Logo }` is Create React App's SVGR setup. Plain `@svgr/webpack` uses a default export: `import Logo from './logo.svg'`.

**FT4. [Minor] "Acyclic" dependency graph**
*Line 251*
- **Problem:** Calls webpack's module graph acyclic. Circular imports are allowed, so the graph can have cycles.

**FT5. [Outdated] Example files predate the guide's own Vite 8 section**
These code examples were written for an older toolchain and contradict §9:

| Line(s) | What it shows | Update to |
|---|---|---|
| 1539–1543 | `vite ^5`, `eslint ^8.55` | current major versions |
| 1716 | `pnpm@9` | current pnpm |
| 698 | Vite's default `build.target` comment | Vite 7 changed the default to `'baseline-widely-available'` |
| 723 | Sass `@import` | `@use` (`@import` is deprecated) |
| 1468 | `create-remix` | `create-react-router` |
| 1043 | `next dev --turbo` | `next dev --turbopack` |
| 26–27 | React 18 UMD `<script>` tags | React 19 has no UMD builds; use an ESM CDN or a bundler |

**FT6. [Outdated] Vite internals**
*Lines 859, 951 and 989*
- **Problem:** Say Vite uses esbuild and Rollup, and "library mode uses Rollup". That is stale next to the guide's own Vite 8 / Rolldown section.
- **Change to:** Match §9.

**FT7. [Verify] "Vite 8 supports Module Federation natively"**
*Lines 851, 884, 1748, 1808, 1987–1989 and 2062*
- **Note:** As far as the reviewer knows, it still needs the `@module-federation/vite` plugin. Vite 8 described federation as something Rolldown makes *possible*. Confirm before keeping the word "natively".

**FT8. [Verify] Recent version facts**
- Line 1735: Rolldown 1.0 dated after Vite 8 shipped.
- Lines 1138 and 1308: npm 12, and pnpm 11/12.
- Line 1798: the TypeScript 7 date.

---

### 1.24 `front-end/web-performance-guide.md`

No errors found. It is the most accurate guide in the set, with current Core Web Vitals thresholds and INP. Only align the image-priority sentence with the React guide (R16).

---

### 1.25 `front-end/react-native-guide.md`

**RN1. [Outdated] CodePush is shut down**
*Lines 1587–1589; also line 2129, and ios-app-store-deployment-guide.md lines 438, 491 and 507*
- **Now:** Calls CodePush "active but deprioritized".
- **Problem:** Microsoft retired the hosted CodePush service (App Center) on **31 March 2025**. The Play Store guide (line 1215) already says this.
- **Change to:** "Retired in March 2025. Use EAS Update, or a self-hosted CodePush server." Remove "(or CodePush)" from the other lines.

**RN2. [Wrong] Losing the Android signing key**
*Lines 1561 and 1871*
- **Now:** Says losing the keystore "permanently locks you out" and that there is "no path back".
- **Problem:** With Play App Signing (the default), Google holds the real app-signing key, and you can request an **upload key reset**, which takes about 1–2 days. The Play Store guide (lines 443, 1094 and 1757–1772) explains this correctly.
- **Change to:** Match the Play Store guide. The "locked out forever" case only applies to old apps not enrolled in Play App Signing.

**RN3. [Outdated] Flipper**
*Lines 1397 and 1453*
- **Problem:** Presents Flipper as a current debugging tool for "bridge traffic". Flipper was removed from the React Native template in 0.74, and the New Architecture has no bridge.
- **Change to:** React Native DevTools.

**RN4. [Inconsistent] Storing a token in AsyncStorage**
*Line 919 stores `@token` in AsyncStorage; line 938 says never do that*
- **Change to:** Store the token in secure storage (Keychain/Keystore via `expo-secure-store` or `react-native-keychain`) in the example on line 919.

**RN5. [Inconsistent] `allowFontScaling={false}`**
*Line 1641 shows it as fine for a logo; mobile-accessibility-guide.md lines 269, 275 and 627 say "never"*
- **Change to:** Follow the accessibility guide (use `maxFontSizeMultiplier` instead).

**RN6. [Inconsistent] When "bridgeless" mode became the default**
*Line 1378 says 0.76; play-store-deployment-guide.md lines 1234 and 1522 say 0.74*
- **Note:** Both can be defended. 0.74 made it the default *when the New Architecture was turned on*, and 0.76 turned the New Architecture on by default.
- **Change to:** Say this explicitly in one place and link to it.

**RN7. [Verify] MMKV API**
*Lines 925–931*
- **Note:** `new MMKV()` is the v2/v3 API. The reviewer believes v4 uses `createMMKV()`.

---

### 1.26 `front-end/play-store-deployment-guide.md`

**P1. [Wrong] When the 14-day closed-testing period starts**
*Line 805; also §17/§18 at lines 786–807*
- **Now:** Says the 14 days start "when the first tester actually installs".
- **Problem:** Google's rule is that at least 12 testers must each have been **opted in** to the closed test continuously for 14 days. Install day does not matter. The guide's own Q4 (lines 1694–1700) states the opt-in rule.
- **Change to:** Match Q4.

**P2. [Wrong] Tester list size**
*Lines 767 and 1392*
- **Now:** "Closed testing: up to 100 testers per email list."
- **Problem:** 100 is the cap for **internal** testing. Closed-testing email lists hold about 2,000 addresses each, and you can also use Google Groups.

**P3. [Wrong] "Apps over 150 MB must use AAB"**
*Line 996*
- **Problem:** Android App Bundles are required for **all** new apps since August 2021 (the guide says so at line 1347). The 150 MB figure was an old download-size limit, not a trigger for needing an AAB.
- **Change to:** Delete the sentence.

**P4. [Wrong] Mixing up two different "V1"s**
*Line 1768*
- **Now:** "...only legacy V1-only apps without App Signing".
- **Problem:** This confuses the old **v1 APK signature scheme** with **not using Play App Signing**.
- **Change to:** "apps not enrolled in Play App Signing".

**P5. [Wrong, fairly confident] Managed publishing**
*Lines 465–470 and Q9 (lines 1774–1787)*
- **Problem:** Treats managed publishing as something you set per track or per release. In Play Console it is a single **app-wide** on/off switch.
- **Change to:** Rewrite the section and the premise of Q9.

**P6. [Wrong] Build command makes the wrong file type**
*Line 1253*
- **Problem:** The local-build row uses `./gradlew assembleRelease`, which builds an **APK**. Google Play needs an AAB.
- **Change to:** `./gradlew bundleRelease`, as the React Native guide (line 1556) already shows.

**P7. [Wrong] Cleartext HTTP**
*Line 1379*
- **Now:** Says that without `usesCleartextTraffic="false"`, `http://` calls "silently" go through.
- **Problem:** Since target SDK 28, cleartext traffic is **blocked by default**. mobile-app-security-guide.md (line 157) says so.
- **Change to:** "Setting it explicitly documents the default and guards against a library or config turning it back on."

**P8. [Outdated] JavaScriptCore option**
*Line 1192*
- **Problem:** Shows `"jsEngine": "jsc"` as a normal option. JSC was removed from React Native core in 0.79 and is now a community package. Hermes is the only built-in engine.

**P9. [Outdated] "EAS secret"**
*Line 1268*
- **Problem:** EAS secrets have been replaced by **EAS environment variables**.

**P10. [Outdated] History of the tester requirement**
*Lines 59 and 1365*
- **Now:** "Since Nov 2023 … 12 testers."
- **Problem:** The rule started in November 2023 with **20** testers, and dropped to 12 in December 2024.

**P11. [Inconsistent] Inside the guide**
- §17/§18 (lines 786–807) talk about "install" and "active" testers; Q4 talks about "opted in".
- Fixing P1 resolves this.

---

### 1.27 `front-end/ios-app-store-deployment-guide.md`

**I1. [Wrong] Screenshots and upload processing**
*Line 519*
- **Now:** Lists a missing screenshot size as something that gets automatically rejected when the build is processed.
- **Problem:** Screenshots are not part of the uploaded build. A missing screenshot size blocks you from **submitting for review**, not from uploading.

**I2. [Wrong] Wrong guideline cited for over-the-air updates**
*Lines 438 and 507*
- **Now:** Cites "Guideline 3.1.1 and 2.5.2".
- **Problem:** 3.1.1 is about in-app purchase. The rules on downloading code are guideline **2.5.2** and section **3.3.1(B)** of the Apple Developer Program License Agreement.

**I3. [Wrong] Rolling back on Google Play**
*Line 503*
- **Now:** Says on Play you can "resume a previous release".
- **Problem:** Google Play cannot roll back to a lower `versionCode`. Users who already got the halted build keep it, and the Play Store guide (line 834) says so. The fix is to ship a new release with a higher version code.

**I4. [Verify] Required screenshot sizes**
*Line 334*
- **Now:** "REQUIRED: 6.9" and 6.5" or 6.7"".
- **Note:** The reviewer believes Apple requires **one of** 6.9" or 6.5", not both. Check App Store Connect's current screenshot specification.

**I5. [Outdated] Sign in with Apple**
*Lines 303, 379, 455, 487 and 588*
- **Now:** Says Sign in with Apple **must** be offered whenever the app has third-party login.
- **Problem:** Since January 2024, guideline 4.8 only requires *an* equivalent privacy-focused login option. Sign in with Apple is one way to meet it, but not the only one.

**I6. [Missing] Minimum Xcode / SDK for uploads**
- Apple requires uploads to be built with a minimum Xcode and SDK version: Xcode 16 since April 2025, and Xcode 26 with the iOS 26 SDK since April 2026. This is a common reason uploads get rejected, and the guide does not mention it.

**I7. [Outdated] CodePush mentions**
- See RN1 (lines 438, 491 and 507).

---

### 1.28 `front-end/mobile-accessibility-guide.md`

**MA1. [Verify] Apple guideline 2.5.1 and accessibility**
*Line 37*
- **Note:** Says guideline 2.5.1 is grounds for rejecting an app over accessibility. That is doubtful; 2.5.1 is about using public APIs. Check the App Review Guidelines.

Otherwise accurate. This guide should be the home for accessibility props (see Part 2).

---

### 1.29 `front-end/mobile-app-security-guide.md`

**MS1. [Outdated] EncryptedSharedPreferences**
*Line 54*
- **Problem:** The `androidx.security:security-crypto` library (EncryptedSharedPreferences) is deprecated.
- **Change to:** Recommend Android Keystore with Tink, or DataStore with encryption.

**MS2. [Wrong] "Mandatory in OAuth 2.1"**
*Lines 135 and 474*
- **Problem:** OAuth 2.1 is still an IETF **draft**, not a finished standard.
- **Change to:** "required by the OAuth 2.1 draft and by current best practice (RFC 9700)".

**MS3. [Optional] OWASP MASVS v2**
- The guide only links to MASVS v2. A short summary of its control groups would be useful for interviews.

---

## Part 2: Duplication

### What "duplication" means here

Two kinds were measured:
1. **Copy-paste:** the same sentences or code block appear twice. This is **rare**; the worst guides are testing-strategy (7%) and Next.js (6%).
2. **Re-explaining:** the same idea is taught again in different words, usually in the Interview Q&A or Tricky Questions section. This is **common**: about one third of all Q&A/Tricky text overall, and up to 90% in some guides.

The second kind is the real problem for two reasons:
- **It makes the guides long.** Readers study the same idea three or more times.
- **It causes errors.** When a fact changes, one copy gets updated and the others don't. That is exactly where most of the contradictions in Part 1 came from (R3, R6, R8, J17, RN1, RN2, P1 and others).

### 2.1 How much of each guide is Q&A, and how much of it repeats the body

"Repeats body" = the share of Q&A/Tricky text that closely matches a body section of the same guide (measured automatically with TF-IDF similarity ≥ 0.3).

| Guide | Size (words) | Body | Q&A | Tricky | Q&A that repeats body | Tricky that repeats body |
|---|---:|---:|---:|---:|---:|---:|
| react-guide | 75,600 | 46% | 39% | 14% | 29% | 25% |
| javascript-guide | 59,500 | 41% | 31% | 29% | 30% | 22% |
| typescript-guide | 26,300 | 34% | 25% | 40% | 25% | 23% |
| frontend-architecture | 20,200 | 33% | 48% | 14% | 28% | 0% |
| react-native | 17,900 | 44% | 20% | 34% | 51% | 35% |
| frontend-tooling | 15,400 | 69% | 31% | — | 49% | — |
| play-store-deployment | 14,900 | 60% | 20% | 17% | **85%** | 54% |
| modern-css | 13,500 | 44% | 30% | 17% | 51% | **86%** |
| browser-apis | 12,600 | 42% | 26% | 31% | 55% | 24% |
| web-performance | 12,300 | 36% | 38% | 16% | 52% | 45% |
| nextjs-rsc | 12,000 | 43% | 35% | 13% | 39% | 51% |
| accessibility | 11,900 | 55% | 17% | 17% | **70%** | **81%** |
| redux-toolkit | 11,900 | 30% | 38% | 32% | 8% | 0% |
| design-patterns | 11,600 | 62% | 19% | 16% | 36% | 9% |
| testing-strategy | 8,900 | 43% | 26% | 17% | **81%** | 68% |
| jest-rtl | 8,800 | 57% | 42% | — | 38% | — |
| regex-guide | 7,200 | 57% | 25% | 13% | **74%** | 35% |
| mobile-app-security | 6,600 | 51% | 24% | 14% | **90%** | 19% |
| mobile-accessibility | 5,800 | 53% | 21% | 14% | **87%** | 19% |

(The "body" percentage excludes small sections such as the table of contents and references, so rows don't add up to exactly 100%.)

The automatic measure is conservative. Reviewers reading by hand put the real overlap at **about 40% of the React Q&A** and **55–60% of the JavaScript Q&A**.

### 2.2 Repetition inside a single guide

**JavaScript guide**

| Topic | How many times | Where |
|---|---|---|
| Event loop | ~7 | §1.6 (357–405), §8.4 (1690–1705), §11 (2687–2744), Q6 (3317–3409), Tricky Q7–Q11 (5345–5540), Q17 (5796–5849), Q52–53 (7408–7518) |
| Closures | ~7 | §5.2–5.4 (903–1172), §14.1 (3149–3161), Q2 (3248), Q25 (4167), Q29 (4432), Q40 (4664), Tricky Q27/Q30 (6259–6417) |
| Hoisting / TDZ / var vs let | ~7 | §1.2 (121–150), §3 (643–695), Q5 (3300), Q11 (3588), Q41 (4728), Q45 (4989–5142), Tricky Q28–29 |
| `this`, call/apply/bind | 4 | §4.3 (748–826) ≈ Q8 (3452–3508), Q27 (4304–4368), Tricky Q31 |
| Debounce | 3 | §5.4 (1076–1095), §14.4 (3198–3223), Q16 (3776–3882) |
| for…in / for…of / forEach | 3 | §7.3 (1490–1582) ≈ Q14 (3688–3759), §8.5 (1766) |
| `Object.freeze` | 3 | §6.3 (1294), Q17 (3884–3949), Tricky Q25 |
| Shallow copy / structuredClone | 4 | Q9 (3510–3544), Tricky Q20, Q23, Q24 |
| Promise combinators | 2 | §8.2 vs Q10 |
| groupBy, iterator helpers, `using`, Temporal | 3 each | §9.7–9.10 + Q21–24 + Tricky Q12–15 |

**React guide**
- About 45 of 86 Interview Q&As restate §1–16 (about 1,200 lines). Clearest cases:

  | Q&A | Restates |
  |---|---|
  | Q12 | §14.5–14.6 |
  | Q21–Q23 | §13.9–13.11, with the same tables |
  | Q27 | §16.1 |
  | Q28 | §16.6, same table |
  | Q29 | §16.7, same code |
  | Q30 | §16.8, same code |
  | Q31 | §15.8 |
  | Q44 | §5.4 |
  | Q45 | §16.9 |
  | Q47 | §6.1 |
  | Q49 | §6.3 |
  | Q50 | §6.2 |
  | Q52 | §15.11 |
  | Q53 | §15.10 |
  | Q54 | §6.3 |
  | Q59 | §15.4 |
  | Q63 | §6.2 |
  | Q74 | §15.9 |
  | Q76 | §15.7 |
  | Q83 | §16.11 |
  | Q84 | §15.12 |

- **Repeated code:**
  - The ChatRoom / `useEffectEvent` example appears 4 times (§16.7 and lines 4290–4363, 5318–5356, 8926–8959).
  - `useDebounce` appears 4 times (lines 1615, 1636, 1772, 6065).
  - `useMediaQuery` appears 3 times (lines 1931, 1950, 5889).
- **Other repeats:**
  - §13.12 has three overlapping rendering-model tables (lines 3250, 3313, 3345).
  - The class lifecycle order is listed twice (lines 296–306 and 639–653).
  - §6.3 re-declares helper functions as "stand-ins so this runs on its own" (lines 1583–1588, 1733–1751, 1770–1799, 1892–1904). These can go.

**TypeScript guide** (about 400–500 lines removable)

| Topic | Places it appears (lines) |
|---|---|
| `satisfies` | 1168–1218 ≈ Q20 (2196–2225) |
| `const` type parameters | 1226–1240 ≈ Q22 (2245–2264) |
| `NoInfer` | 1242–1256 ≈ Tricky Q18 (3184–3215), almost word for word |
| Inferred type predicates | 1258–1284 ≈ Tricky Q17 (3134–3180), same four-point list |
| TypeScript 7 | 1538–1559 ≈ Q21 (2229–2241) |
| `erasableSyntaxOnly` (3 times) | 1594–1605, Q23 (2268–2285), Q19 (3219–3267) |
| `verbatimModuleSyntax` | 1607 ≈ Q24 |
| Conditional types | 1063–1088, Q11, Q13, Tricky Q9 |
| Mapped types | 1035–1061, Q12, Tricky Q8 |
| Exhaustive checks | 831–851 ≈ Tricky Q5 |

**Regex guide** (about 250 lines removable)

| Topic | Places it appears (lines) |
|---|---|
| Greedy vs lazy | §6 (213–236) ≈ Q7 (1021–1039) |
| `lastIndex` (3 times) | §12, Q9, Tricky Q1 |
| ReDoS (3 times) | §13, Q14, Tricky Q4 |
| Email pattern (3 times) | §14, Q11, §16 |
| Unicode | §10 ≈ Q16 |
| Constructor | §2 ≈ Q2 |
| Lookarounds | §8 ≈ Q8 |
| In-guide cheat sheet | §17 (890–952) repeats about 85% of `cheatsheets/regex.md` |

**Next.js guide** (about 30% removable)
- §3, §5, §6 and §9 are restated almost word for word in Q1–Q6, Tricky Q1–Q4 and the cheat sheet.
- The CVE table appears 3 times.
- The rendering-strategies code block at line 272 is copied exactly at line 768; the block at 319 is copied at 704.

**Frontend Architecture guide** (about 250 lines removable)
- Q3 (508–526) repeats §6, the caching layers (340–375).
- Q5 repeats §8, debugging the 1% / RUM.
- Q8 (603–622) and Q11 (680–686) repeat §7, real-time UI.

**Frontend Tooling guide**
- Q20 and Q21 (2005–2029) repeat §4, Webpack vs Vite (825–916, especially 861–892).

**Testing Strategy guide**
- Tricky questions at 754 and 771 repeat Q&A at 531 and §7 "Flake" at 303.

**Play Store guide**
- §19 (pitfalls), §20 (checklist) and §26 (cheat sheet) restate earlier sections.
- Q3, Q20 and Tricky Q8 restate §21.6–21.7.
- Two identical code blocks: lines 1169 and 1458.

**Modern CSS guide**
- Identical code blocks at lines 642 and 1242.
- Q&A at 763 repeats §5 at 186.

**Accessibility guide**
- The live-region code at line 507 is repeated in Tricky at 988.

### 2.3 The same topic taught in several guides

For each topic, pick **one owner guide**. That guide keeps the full explanation. The other guides keep **one short paragraph plus a link** to the owner.

| Topic | Where it is taught now | Owner | What the others keep |
|---|---|---|---|
| Code splitting (bundler side) | react §13.3 (2637–2660) and §13.11 (3188–3242); tooling 86–94, 366–449, 1905–1921, 1993; web-perf 310–311, 927–965 | **Tooling** (how bundlers split) and **Web Performance** (when and why, and the effect on LCP/INP) | React keeps `React.lazy` + `<Suspense>` and links out |
| Tree shaking / `sideEffects` | tooling 74–84, 451–485, 1879–1887, 1947; react 3117–3186; web-perf 314 | **Tooling** | Link only |
| Webpack vs Vite | tooling 825–916 + Q20–21; react §13.9 (3017–3064) | **Tooling** | Delete React §13.9 and replace it with a link |
| Bundle analyzers | react §13.10 (3066–3115); tooling 1993; web-perf 312 | **Web Performance** | Link only |
| Images and fonts | react §13.8 (2970–3015); web-perf §6–7, Q3, Tricky Q1/Q3; modern-css 739 | **Web Performance** | Link only |
| Layout thrashing, compositing, `content-visibility`, CLS | web-perf 380–411, 767–801; modern-css 654–667, 733–741 | **Web Performance** | CSS keeps a two-line pointer |
| Rendering strategies (SSR/SSG/ISR/RSC) | react §13.12 (3244–3377); nextjs §5; web-perf 428–442 | **Next.js guide** for the mechanics | React keeps a short overview; web-perf keeps its metrics table |
| HOC, render props, compound components, container/presentational | design-patterns §6 (910–1064); react §15 (3556–3710); architecture 332 and Q9 | **React §15** | Design-patterns replaces §6 with a small table mapping classic patterns to their React equivalents |
| Caching layers | architecture §6 (340–375) and Q3; web-perf 415–424; browser-apis Service Worker sections | **Architecture §6** | Delete Architecture Q3's restatement |
| Real-time UI (WebSockets, SSE, polling) | realtime §2; browser-apis §3.3–3.5 (285, 394); architecture §7, Q8, Q11; react-native 880; redux-saga 7.1 and Q8; tanstack Q11 | **Realtime Web** | Others link; Architecture keeps one paragraph |
| Debugging the 1% / RUM | architecture §8 and Q5; web-perf §3 | **Architecture §8** | Remove Q5's restatement |
| Design tokens as CSS variables | modern-css 368–370 and Q8; architecture 284, 314 | **Architecture §5** | CSS shows the syntax only |
| `<dialog>`, `popover`, top layer | modern-css §11–12; accessibility §4.3, §6.4, §11.1 | **Modern CSS** for stacking and styling, **Accessibility** for focus and keyboard | Each links to the other |
| `sendBeacon` / `pagehide` | web-perf 144; browser-apis §13 and Tricky Q11 | **Browser APIs** | Link only |
| Context vs Zustand vs Redux | zustand §10 (335–356), Q1, Q4, Q12; redux-toolkit Q1 (951–970), Q10 (1117–1135); tanstack §8 | **Zustand §10** | Others link |
| TanStack Query vs Redux / RTK Query | tanstack §7–8 (702–925), Q16; redux-toolkit Q12 (1155–1175) | **TanStack Query**, rewritten to compare against RTK Query (see TQ3) | Redux Toolkit keeps a short Q12 |
| Saga vs thunk vs listener middleware | redux-saga §10 (823–896); redux-toolkit Q11 (1138–1153) | **Redux Saga** | Link only |
| Testing pyramid vs testing trophy | testing-strategy §2.1 and Q1; jest Q21 (2224–2250) | **Testing Strategy** | Link only |
| Testing Library query priority | jest §7.3 (522–535) and Q2 (1659–1675); testing-strategy §6.1 and §9 | **Jest §7.3** | Jest Q2 becomes a short answer plus a link |
| MSW setup and mocking policy | jest §13.3 and Q9; testing-strategy §5 and Q2; storybook Q13; tanstack Q22 | **Testing Strategy §5** (and use MSW-first everywhere; see JE6 and TQ4) | Link only |
| Testing Redux / React Query components | redux-toolkit §12 (871–944); tanstack Q22; jest §12–13 | **Jest** | Link only |
| Visual regression testing | storybook §11 and Q11; testing-strategy §8 and Q7 | **Testing Strategy** | Storybook keeps the Chromatic how-to |
| Polling | redux-saga 7.1 and Q8; tanstack Q11; realtime §2 | **Realtime Web** | Link only |
| Android signing and keystores | react-native 1558–1561, 1871; play-store 440–443, 1069–1125, 1357, 1423, 1549, 1757 | **Play Store** | React Native keeps two lines and a link |
| iOS signing | react-native 1555–1560; ios §3 (66–95) | **iOS** | Link only |
| New Architecture, JSI, Hermes | react-native §21 (1349–1389), Q21, Q29; play-store 1179–1192, 1230–1240, Q18 (1516–1528); ios 427, 436–437 | **React Native** | Remove from Play Store; iOS keeps one line |
| Over-the-air updates | react-native §26 (1575–1607) and Q26; play-store 1210–1226 and Q21 (1561); ios 438 and Q10 (505) | **React Native** | Store guides keep only their policy rule |
| Source maps and crash symbols | react-native §30 (1767–1797) and 2636; play-store §22.4 (1264–1285) and Q15; ios 199 | **React Native** | Link only |
| Managed vs bare Expo | react-native §2 and 2036; play-store §22.2 (1242–1249); ios 435 | **React Native** | Link only |
| Accessibility props | react-native §27 (1609–1670); mobile-accessibility §4–11 (95–330) | **Mobile Accessibility** | React Native keeps a short summary and a link |
| Secure storage and tokens | react-native §12 (902–947) and Q at 1987; mobile-app-security §2 and §4 (48–130) | **Mobile App Security** | Link only |
| In-app purchase receipt validation | react-native §29 (1732–1765), almost word for word the same as mobile-app-security §11 (288–310) | **Mobile App Security** | Link only |
| Cheat sheets | TS cheat sheet is ~90% covered in the TS guide; regex cheat sheet ~85% repeats regex guide §17; 11 guides have their own "cheat sheet" section | **The standalone cheat sheets** in `src/content/cheatsheets/` | Delete the in-guide cheat-sheet sections, or replace each with a link |

---

## Part 3: How to shorten the long guides

### 3.1 Five rules that apply to every guide

**Rule 1. Q&A answers should test, not re-teach.**
If the answer is already explained in the guide body, cut it to what you would actually *say* in an interview (2–4 sentences), then link to the body section for detail.

*Before (typical today, about 40 lines):*
> **Q6: What is the event loop?**
> *(a full re-explanation of the call stack, task queue and microtask queue, with a diagram and two code examples, all already in §1.6 and §11)*

*After (about 5 lines):*
> **Q6: What is the event loop?**
> JavaScript runs on one thread. The event loop takes one task from the task queue, runs it to completion, then runs **all** pending microtasks (promise callbacks) before the browser may render and pick the next task. That is why a resolved promise's `.then` runs before a `setTimeout(…, 0)`.
> → Full explanation and diagrams: [§11 The Event Loop](#11-the-event-loop)

This one rule removes about **60,000–80,000 words** across the 29 guides.

**Rule 2. One home per topic.**
Use the owner table in Part 2.3. Everywhere else gets one paragraph and a link. This also stops the copies drifting apart, which is where most of the errors came from.

**Rule 3. Trim the Tricky Questions.**
Keep:
1. the code
2. the output
3. one or two sentences on *why*

Most tricky questions currently follow that with three or four paragraphs re-explaining the concept. Reviewers estimate about **50%** of the tricky-question text can go with no loss (especially React Tricky Q1–Q19, lines 7769–8603, and JavaScript Tricky Q7–Q15).

**Rule 4. Remove the in-guide summaries that repeat the guide.**
Sections called "Cheat Sheet", "Quick Reference", "Key Rules", "Pitfalls" or "Checklist" at the end of a guide mostly restate it. Keep **either** the standalone cheat sheet in `src/content/cheatsheets/` **or** the in-guide one, not both.

**Rule 5. Remove scaffolding code.**
Example: React §6.3 re-declares helper functions as "stand-ins so this runs on its own" (lines 1583, 1733, 1770 and 1892). If the playground needs them, load them from a shared file instead of repeating them in the text.

### 3.2 Guide-by-guide plan

| Guide | Lines now | What to cut or merge | Target lines |
|---|---:|---|---:|
| **react-guide** | 8,996 | See the list below this table | **~6,000** |
| **javascript-guide** | 7,554 | See the list below this table | **~5,000** |
| **typescript-guide** | 3,787 | The ~10 repeated feature sections listed in Part 2.2 (~450 lines); trim Tricky answers (Rule 3) | **~3,000** |
| **react-native-guide** | 2,654 | Move signing, accessibility props, secure storage and IAP validation to their owner guides (Part 2.3); keep links | **~2,100** |
| **jest-rtl-guide** | 2,385 | Q&A that repeats the body (Q2 → link to §7.3, Q9 → link to §13); testing-Redux section overlaps redux-toolkit §12 | **~1,700** |
| **frontend-tooling-guide** | 2,118 | Delete Q20/Q21 (repeat §4); **rewrite** the early sections for Vite 8 / ESLint 9 rather than leaving old examples patched with notes (see FT5) | **~1,600** |
| **redux-toolkit-guide** | 1,951 | Testing section (§12) → move to jest guide; Q1/Q10 → link to zustand §10 | **~1,500** |
| **play-store-deployment-guide** | 1,841 | See the list below this table | **~1,050** |
| **redux-saga-guide** | 1,789 | Saga is a declining tool. Keep: why it exists, effects, cancellation, testing, and when to choose it over listener middleware. Halve it. | **~900** |
| **browser-apis-guide** | 1,702 | The WebSocket demo is heavy; WebSocket/SSE theory → realtime-web | **~1,500** |
| **design-patterns-guide** | 1,605 | Replace §6 (React patterns, 910–1064) with a mapping table that links to react §15 | **~1,450** |
| **frontend-architecture-guide** | 1,439 | Delete Q3, Q5, Q8, Q11 restatements (or cut to short answers plus links) | **~1,200** |
| **modern-css-guide** | 1,431 | §16 (performance) → link to web-perf; remove duplicate code block (642/1242) | **~1,300** |
| **regex-guide** | 1,404 | Repeated `lastIndex`/ReDoS/email/greedy sections; in-guide cheat sheet §17 | **~1,150** |
| **nextjs-rsc-guide** | 1,312 | Q1–6, Tricky Q1–4 and cheat sheet restate §3/5/6/9; keep the CVE table once | **~950** |

**React guide cuts (8,996 → ~6,000 lines):**
- **Class components (§3.2, lines 143–813, about 3,800 words).** Most interviews only ask about these for legacy code. Keep:
  1. a short class example
  2. one lifecycle table showing each method and its hook equivalent
  3. error boundaries (still class-only)
  4. a migration note

  Cut the per-method deep dives and the "four ways to bind `this`" detail. This saves about 450 lines.
- **§13.9–13.11 (bundlers, analyzers, tree shaking):** replace with links to the Tooling and Web Performance guides (about 300 lines).
- **Q&A that restates the body:** cut to short answers plus links (about 1,200 lines).
- **Tricky Q1–19:** trim the explanations (about 600 lines).
- **Duplicate examples:** keep one copy of `useEffectEvent`/ChatRoom, `useDebounce` and `useMediaQuery`.

**JavaScript guide cuts (7,554 → ~5,000 lines):**
- **Event loop:** keep one full explanation (§11, or §1.6), plus Q6 as a short answer. §8.4 and the long Tricky explanations link to it.
- **Merge pairs:** §4.3 with Q8, and §7.3 with Q14.
- **ES2024–2027 features:** explain each once in §9; Q21–24 and Tricky Q12–15 become short questions with links.
- **§14.1 and §14.4:** turn into pointers.
- **§8.7 (retry/cancel/bound async work, about 3,400 words):** tighten it.

**Play Store guide cuts (1,841 → ~1,050 lines):**
- **Material that isn't about the Play Store:** §2 (cookies and secrets), §6 (cascade delete with MongoDB code) and §7 (runtime config), about lines 63–420. Move these to a backend guide or reduce them to a checklist (about 300 lines).
- **React Native / Hermes material:** §21.11, §22.1–22.4, Q7, Q15 and Q18 (about 130 lines). It belongs in the React Native guide.
- **Step-by-step Play Console walkthroughs (§10–16, lines 473–755):** condense into one table. The Console UI changes often, so these go out of date quickly.
- **Restating sections:** §19 pitfalls, §20 checklist and §26 cheat sheet repeat earlier content.

**Guides already the right size (leave the length alone, just apply the Part 1 fixes):**
- zustand
- react-router
- tanstack-query (apart from rewriting §7–8)
- testing-strategy
- web-performance
- accessibility
- refactoring-code-review
- realtime-web
- storybook
- ios-app-store
- mobile-accessibility
- mobile-app-security

### 3.3 Expected result

| | Now | After |
|---|---:|---:|
| Front End + JS & TS (words) | ~455,000 | ~320,000–335,000 |
| Reduction | | **~25–30%** |
| Topics removed | | **none** |

---

## Part 4: Rules for editing safely

**1. Don't delete or renumber questions. Shorten their answers instead.**
- Each question's ID is built as `<guide name>-q<number>` (see `src/data/extractQuestions.ts` lines 83 and 106).
- That ID is the **localStorage key for each user's spaced-repetition history** (Daily Review).
- If you delete Q12 and renumber Q13 to Q12, every user's Q13 history silently attaches to the new Q12, and so on down the list.
- Safe options:
  - Shorten the answer and keep the number.
  - If a question must go, leave its number unused.
  - Or write a small ID migration.
- Tricky Questions restart at Q1, which is why the code adds `-2` suffixes (`dedupeIds`). So moving a Tricky section above the Q&A section would also change IDs. Keep the section order.

**2. Run the repo's checks after each guide.**
- `npm run content:meta` after adding or removing any `**QN:**` marker.
- `npm run verify` before calling a change done. Its `verify:counts` step checks numbers written in prose (for example "86 questions") and in-page anchor links. After cutting sections, update any "§N" links and counts it reports.

**3. Fix facts before cutting.**
Apply Part 1 first, so the copy you keep is the correct one.

**4. Follow the repo's own CLAUDE.md** if Claude Code does the editing. For example, it says no co-author trailer on commits, and never use `git stash` or `git checkout -- <file>`.

---

## Part 5: Suggested order of work

Each step is one pull request, which keeps reviews manageable.

- [ ] **1. High-impact factual fixes** (an afternoon):
  - R1, R2, R3, R4
  - J1–J5
  - T1–T6
  - X1, X2, C1–C4
  - M1, A1, A2
  - B1, B2, B4
  - N1–N3
  - RN1, RN2
  - P1–P3, P6
  - I5
- [ ] **2. Outdated items:**
  - React Router package name (RR1)
  - Tooling examples (FT1–FT6)
  - Storybook viewport (SB2)
  - Jest (JE2, JE3)
  - The remaining [Outdated] labels
- [ ] **3. Check every [Verify] item** against official sources and fix or keep it.
- [ ] **4. Pick one answer for each contradiction:**
  - mocking policy (JE6, TQ4)
  - E2E tool (JE5)
  - state-tool comparison (Part 2.3)
  - top-level `this` (J17)
  - image priority (R16)
  - design-pattern labels (D3–D5)
- [ ] **5. Consolidate cross-guide topics** using the owner table (Part 2.3), one owner at a time.
- [ ] **6. Shorten the Q&A and Tricky sections**, guide by guide, largest first:
  1. React
  2. JavaScript
  3. TypeScript
  4. Play Store
  5. Next.js
  6. Redux Saga
  7. Tooling
  8. Jest
  9. Architecture
  10. Regex

  Keep question numbers (Part 4).
- [ ] **7. Remove in-guide cheat sheets** that duplicate `src/content/cheatsheets/`.
- [ ] **8. Run `npm run verify`** after every step.

---

## Appendix: How the audit was done and its limits

**Accuracy check**
- Six reviewers each read a group of guides in full.
- Where possible they **ran the code** rather than reasoning about it:
  - 82 JavaScript output examples in Node 24.21 (81 matched)
  - TypeScript examples with `tsc 5.9 --strict`
  - regex examples in Node
- Items marked **[verified]** were confirmed this way.
- A sample of findings was re-checked independently, and all held:
  - CSS specificity (M1)
  - regex `split` output (X1)
  - the `throw` syntax error (C1)
  - the WCAG count (A1)
  - CodePush status (RN1)
  - "UNSAFE_* removed" (R3)

**Duplication check**
- **Copy-paste:** every paragraph and code block was compared against every other, using overlapping 8-word sequences.
- **Re-explaining:** each Q&A and Tricky answer was compared with every body subsection of the same guide using TF-IDF text similarity. Similarity ≥ 0.3 counted as "repeats the body". This measure is conservative; human review found more overlap than it did.

**Limits**
- **Not audited:** Back End, AI Engineering, DevOps, AWS, Git, DSA, Behavioral and System Design guides, and the cheat sheets for those areas.
- **Light check only:** Redux Saga (setup, comparison section and Q&A titles).
- **Too recent for the reviewers:** facts dated after mid-2026 could not be confirmed or ruled out. They are marked [Verify], not counted as errors.
- **Line numbers:** taken from commit `bc66290`. They will shift as the files change.
