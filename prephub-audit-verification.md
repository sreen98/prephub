# Verification of prephub-audit.md (Part 1 findings)

**Checked:** 9 Oct 2026, against the current working tree (audited commit `bc66290`).
**How:** each finding was located in the guide, code was **run** where the finding is about behaviour
(Node 24.21, React/react-dom 19.3.0, TypeScript 6.0.2, jsdom, Babel, babel-plugin-react-compiler 1.0),
and volatile facts (versions, policies, dates, CVEs) were checked against primary sources.
Nothing in the repo was edited during verification.

**Verdicts:**
- **CONFIRMED:** the finding and its proposed fix are right.
- **FIX-CHANGE:** the finding is right but the audit's "Change to" text is wrong or incomplete. **Use the fix given here.**
- **PARTLY:** only part of the finding holds.
- **REJECTED:** the guide is already right. Do not change it.
- **ALREADY / UNVERIFIABLE:** as named.

## Summary

| Result | Count | IDs |
|---|---:|---|
| Rejected (guide is right) | 4 | M5, FA1, FT8, N9 (N9: add the single-locale precondition) |
| Partly right | 20 | RN6, I2, I3, T12, T13, X3, X6, TQ3, RT1, Z3, JE5, A4, D5, RF1, FA2, FT1, FT5, FT7, web-perf priority, (P10 secondary sources only) |
| Right, but the audit's fix is wrong or incomplete | 22 | R3, R10, R12, R18, R19, J1, J4, S4, T2, X4, N1, N2, N4, N8, RR4, RT2, M1, A2, RN1, P8, I4, MS1 |
| Confirmed as written | the rest (about 125) | |
| New problems the audit missed | about 30 | listed per guide below |

**The audit's own claims that turned out wrong:** a few "Change to" texts would introduce new errors:
- **A2:** the "exists but is empty" label also falls back to "Save".
- **T2:** `Record<'red'|'green'|'blue', …>` breaks `palette3`.
- **RT2:** `actionCreatorCheck` arrived in RTK **1.9.6**, not RTK 2.
- **P8:** JSC was moved to a community package in 0.79, not removed.
- **N1:** FormData is not serialisable across the client boundary.
- **J4:** `toString` also throws.
- **X4:** Cloudflare lost about 80% of traffic, not "nearly all".

---

## 1.1 react-guide.md (file unchanged since bc66290, so the audit's line numbers hold)

| ID | Verdict | Evidence / correct fix | Line |
|---|---|---|---|
| R1 | CONFIRMED | Ran: `startTransition(cb)` runs cb synchronously. Also rewrite Q20's Output paragraph and the §6.2 `setResults(filter(...))` example. Q20's premise is weak too: a 50k `includes` filter takes a few ms, so the 300 ms lag can't come from it. | 1530–1533, 8607–8640 |
| R2 | CONFIRMED | Ran: warns "optimistic state update occurred outside a transition or action" and reverts. | 2755–2764 |
| R3 | FIX-CHANGE | Unprefixed `componentWillMount` still runs in 19.3 with a "has been renamed" warning in every mode, not only StrictMode. Name the `UNSAFE_` methods. | 6492 |
| R4 | CONFIRMED | Ran: ThemedButton re-renders because Page consumes UserCtx. | 8582 |
| R5 | CONFIRMED | react.dev use-client: Client Components can render Server Components passed as JSX props. | 3264 |
| R6 | CONFIRMED | ISR is stale-while-revalidate. | 3341 |
| R7 | CONFIRMED | Ran Babel: classic `createElement("h1",{…},"Hello, ",name,"!")`, automatic `_jsxs("h1",{children:[…]})`. | 74, 6270 |
| R8 | CONFIRMED | Ran: setState after unmount logs nothing in 19.3. | 1321 |
| R9 | CONFIRMED | React changelog: 19.1 `:r:`→`«r»`, 19.2 →`_r_`. Ran: client `_r_0_`, server `_R_0_`. | 4409, 5645 |
| R10 | FIX-CHANGE | The table lists 15 and omits `useEffectEvent` (stable in 19.2), so the true count is 16. Better to drop the number. | 1237 |
| R11 | CONFIRMED | Ran: a native listener between the target and the root fired before React's onClick. | 6003 |
| R12 | FIX-CHANGE | Ran Compiler 1.0: TagList **compiles** (no bail-out on `tags.push`) and is memoised, so the list never grows. Uncompiled, it grows by two. Rewrite the scenario; "silently skipped" is wrong too, and so is line 2633's "only compiles when it can prove purity". | 8809–8851, 2633 |
| R13 | CONFIRMED | Ran: through `jsx()`, function `defaultProps` is ignored (legacy `createElement` still applies it). A failing propTypes validator logs nothing. | 726, 755 |
| R14 | CONFIRMED | Ran: `ref` lives in `props`; reading `element.ref` warns. | 3786, 5405 |
| R15 | CONFIRMED | eslint-plugin-react-hooks 7.1.1 is current (7.0.0 shipped Oct 2025). | 2633, 8803, 8851 |
| R16 | CONFIRMED | web.dev fetch-priority: images Low by default, first 5 large ones Medium. | 2981 |
| R17 | CONFIRMED | The App Router has no `loader`. | 2111 |
| R18 | FIX-CHANGE | Moving `'use client'` to the top makes both components client. The block is two files in one: split it, or tag it `text`. | 4974–4975 |
| R19 | FIX-CHANGE | Needs two selectors: `useStore(s => s.count)` and `useStore(s => s.increment)`. | 5004 |
| R20 | CONFIRMED | Ran: `renderToString` throws "Missing getServerSnapshot". | 1455, 5965 |
| R21 | CONFIRMED | Lazy init isn't in §5.1/§5.3; it is in Tricky Q16 (8358). | 1264, 1298 |
| R22 | CONFIRMED | Next docs: the `[slug]` + `'page'` form invalidates every matching path. | 3337 |
| R23 | CONFIRMED | Ran: `getSnapshot` runs per render, not per commit. | 2768 |
| R24 | CONFIRMED | react.dev: an Effect from an interaction may run before paint. The audit's line 4975 is wrong; real sites are 1317, 3411, 6429, 7948, 8975. | — |
| R25 | CONFIRMED | Ran: no warning for setState in `componentWillUnmount`; Q23 gives 3, 2, 3 across runs (a real race). | 540, 8705–8728 |
| R26 | CONFIRMED | 19.3.0 (9 Sep 2026), React Foundation (24 Feb 2026), Vite 8.0.0 (12 Mar 2026), checkout v7.0.1, single-arg `revalidateTag` deprecated. | 4526–4538 etc. |

**Missed:**
- Line 3338 uses single-argument `revalidateTag('posts')`; it should be `revalidateTag('posts', 'max')`.
- Lines 3411, 6429 and 7948 repeat the R24 overstatement.

## 1.2 javascript-guide.md · 1.5 comparison pages · 1.6 cheat sheets

Line numbers are current; the Tricky section moved after Q41–Q46 were added.

| ID | Verdict | Evidence / correct fix | Line |
|---|---|---|---|
| J1 | FIX-CHANGE | Ran Q31 four ways: CommonJS and a classic script print `has a this`; `.mjs` and `new Function` print `undefined`. The playground prints `undefined` only because `'use strict'` makes the body a strict function. Explain that, give the module rule, and fix the lead-in at 6502 ("same everywhere"), which is false. | 6502, 6543 |
| J2 | CONFIRMED | Ran with `--expose-gc` + WeakRef. | 4183 |
| J3 | CONFIRMED | Ran: `TypeError … target and holdings must not be same`. | 3676 |
| J4 | FIX-CHANGE | Ran: `'constructor'` throws `b.constructor.push is not a function`, so it is not silent. The audit's `toString` example also throws. A silent case is a counter: `c[k] = (c[k] \|\| 0) + 1` gives `"function Object() { [native code] }1"`. | 4108 |
| J5 | CONFIRMED | Ran: `fromAsync` over three already-created 50 ms promises took 60 ms; it doesn't fail fast and fires `unhandledRejection`. Only the last paragraph is wrong. | 5868 |
| J6 | CONFIRMED | React 17 RC post. Also give the `{ capture: true }` workaround and the real trap (a `document` listener added in an effect receives the same click). | 3105 |
| J7 | CONFIRMED | It's the index (2nd argument) that becomes the radix, not the array. | 1411 |
| J8 | CONFIRMED | `.catch(() => null)` resolves to null; it's the catch that's unreachable. | 1734 |
| J9 | CONFIRMED | Inspector `[[Scopes]]` shows the closure's token. | 1122 |
| J10 | CONFIRMED | Ran: prints `""`, not `undefined`. | 772 |
| J11 | CONFIRMED | Ran: sealed array `length` is writable; `push` throws. | 3947 |
| J12 | CONFIRMED | Ran: `o == 0` passes hint `default`. | 5270 |
| J13 | CONFIRMED | Ran `worker_threads`: a cloned error is `instanceof Error`. The iframe case stands. | 2523 |
| J14 | CONFIRMED | redux-immutable-state-invariant snapshots and compares; it never freezes (redux-freeze and Immer do). | 3949 |
| J15 | CONFIRMED | `using` runs on Node 24; Chrome 134; Node 20 EOL 2026-04-30. Optionally add Firefox 141 and that stable Safari has no support. | 2286 |
| J16 | CONFIRMED (optional) | The ES2026 spec has `JSON.rawJSON`, no Temporal and no `using`; the table split is right. Float16Array (ES2025) is missing. | 2276–2283 |
| J17 | CONFIRMED | Four different answers for top-level `this`; adopt one rule. | 754, 772, 789, 6543 |
| J18 | CONFIRMED | §11 vs Q6 disagree on where render happens. | 2714–2720, 3335–3343 |
| C1 | CONFIRMED | Ran: `SyntaxError: Unexpected token 'throw'`. | js-comparisons:106 |
| C2 | CONFIRMED | Automatic batching in React 18; fix the left cell too. | react-comparisons:44 |
| C3 | CONFIRMED | Zustand docs: update immutably. | react-comparisons:135 |
| C4 | CONFIRMED | "Announced in 2020, stable in React 19". | react-comparisons:143 |
| C5 | CONFIRMED | Compiler is a build-time tool supporting React 17–19. | react-comparisons:70 |
| C6 | CONFIRMED | Ran `renderToString` on 19.3: no console.error. | react-comparisons:86, 92; cheatsheets/react-hooks:184 |
| S1 | CONFIRMED | Ran tsc. | cheatsheets/typescript:76 |
| S2 | CONFIRMED | react.dev: Effect Event identity changes every render. | cheatsheets/react-hooks:124 |
| S3 | CONFIRMED | `using`/Temporal are ES2027; a labelled block is ES3. Also, `structuredClone` is an HTML API, not ECMAScript. | cheatsheets/javascript-es6:156, 172–174 |
| S4 | FIX-CHANGE | Items are track-width (≥200px, under 2×), not 200px. Wording: "empty tracks are KEPT → items don't stretch into the gap". From the spec; not run in a browser. | cheatsheets/css-flexbox-grid:122 |
| S5 | CONFIRMED | Line 74 uses 280px, so the fix there is `min(280px, 100%)`. | cheatsheets/css-flexbox-grid:41, 74 |

## 1.3 typescript-guide · 1.4 regex-guide · 1.7 nextjs-rsc · 1.8 react-router · 1.9 tanstack-query

| ID | Verdict | Evidence / correct fix | Line |
|---|---|---|---|
| T1 | CONFIRMED | Ran tsc: `push` compiles; `as const satisfies` makes it TS2339. | 1203 |
| T2 | FIX-CHANGE | The proposed `Record<'red'\|'green'\|'blue', …>` makes palette3 fail (TS1360, missing blue). Use `Partial<Record<…>>` (gives TS2561 "Did you mean 'red'?") or add `blue`. | 1171, 1189 |
| T3 | CONFIRMED | Ran tsc. | 2387 |
| T4 | CONFIRMED | Ran tsc: `f(1,'x')` gives TS2345. | 3213 |
| T5 | CONFIRMED | tsc never renames. | 113–118 |
| T6 | CONFIRMED | Line 248 says "only enums and decorators"; 1654 contradicts 3242/3267. | 248, 1654 |
| T7 | CONFIRMED (minor) | Bare side-effect imports are never elided; the risk is a type-only named import from a barrel. | 2295 |
| T8 | CONFIRMED | Ran tsc 6.0.2: TS5107 / TS5101 without `ignoreDeprecations`. | 150, 1519 |
| T9 | CONFIRMED | Standard decorators need no flag since 5.0. | 141 |
| T10 | CONFIRMED | | 239 |
| T11 | CONFIRMED | Ran tsc: TS18046. | 307, 1775 |
| T12 | PARTLY | Ran tsc: a non-ambient `const enum` imports fine under isolatedModules and verbatimModuleSyntax; only `erasableSyntaxOnly` errors (TS1294). Narrow the caveat; line 993 too. | 3061, 993 |
| T13 | PARTLY | TS 7.0 post (8 Jul 2026) confirms no API, `@typescript/typescript6`/`tsc6`, 8–12×. "tsgo is nightly-only" is not supported: nightlies are `typescript@next`. | 1548–1556, 2231 |
| X1 | CONFIRMED | Ran Node. | 497–498 |
| X2 | CONFIRMED | Ran Node. | 1129 |
| X3 | PARTLY | 2^(n−1) is right; line 547 (2^n) and line 1180 (should be 2^15) are wrong. 1302 is fine. | 547, 1180 |
| X4 | FIX-CHANGE | Cloudflare's post: "about 80% of traffic", pattern `.*.*=.*`, "super-linear". | 1304 |
| X5 | CONFIRMED | `RegExp.escape` exists in Node 24. | 76, 762 |
| X6 | PARTLY | The hex row is backwards (guide 3/6/8, cheat sheet 3/6). The email and password differences are real. | 331, 644, 655, 1140 |
| N1 | FIX-CHANGE | react.dev: no RegExp; only `Symbol.for` symbols. TypedArray/ArrayBuffer are allowed but **FormData is not**, so drop it from the fix. | 166, 798, 800 |
| N2 | FIX-CHANGE | The block is runnable; an async component won't render client-side. Use `use(params)` and render with `params={Promise.resolve({id:'42'})}`. | 403–413 |
| N3 | CONFIRMED | | 433–449 |
| N4 | FIX-CHANGE | `priority` is deprecated in v16; the docs say "in most cases" use `loading="eager"` or `fetchPriority="high"`. | 633 |
| N5 | CONFIRMED | Next 15 / 16 blogs. | 216 |
| N6 | CONFIRMED | | 305, 702 |
| N7 | CONFIRMED | 16.1 blog. | 608 |
| N8 | FIX-CHANGE | Add it, citing **CVE-2025-55182** as canonical (CVE-2025-66478 was rejected as a duplicate). | (missing) |
| N9 | REJECTED | Guide correct. Add CVE-2026-64642's **single-locale** precondition (OSV), also at 733, 1110, 1254. | 523–524, 611 |
| RR1 | CONFIRMED | Also note `RouterProvider` comes from `react-router/dom`. | 47, all imports |
| RR2 | CONFIRMED | Six flags. | 470 |
| RR3 | CONFIRMED | Framework and Data modes. | 376 |
| RR4 | FIX-CHANGE | Data mode: revalidate on own params change, any search change, or a non-error action. Framework mode with SSR: after every navigation. Split by mode; line 238 too. | 238, 543 |
| TQ1 | CONFIRMED | Object-form `extraReducers` was removed in RTK 2; indentation is broken at 817. | 815 |
| TQ2 | CONFIRMED | | 873 |
| TQ3 | PARTLY (editorial) | A scope choice, not an error. | 702–877 |
| TQ4 | CONFIRMED | | 1344 |

## 1.10–1.16 redux-toolkit, zustand, redux-saga, storybook, jest-rtl, testing-strategy, realtime-web

| ID | Verdict | Evidence / correct fix | Line |
|---|---|---|---|
| RT1 | PARTLY | `replaceReducer` isn't obsolete. Mention `combineSlices` + `rootReducer.inject(slice)` as the RTK 2 way. | 1261 |
| RT2 | FIX-CHANGE | `actionCreatorCheck` arrived in **RTK 1.9.6**, not 2. Line 1911 also says "two" sanity checks; it's three. | 1093, 1911 |
| Z1 | CONFIRMED | Jotai provider-less mode. | 341 |
| Z2 | CONFIRMED | Ran persist: synchronous with sync storage. Line 418 too. | 231, 418 |
| Z3 | PARTLY | Immer is 13.7 KB minified, **~5 KB gzipped**. | 226 |
| Z4 | CONFIRMED | `zustand/traditional` `createWithEqualityFn`. | 148, 412 |
| (saga) | — | No findings to check. | — |
| SB1 | CONFIRMED | Snapshots need a `postVisit` hook. Also say test-runner is superseded by the Vitest addon for Vite frameworks (line 965). | 977 |
| SB2 | CONFIRMED | `parameters.viewport.options` / `initialGlobals`; the `customViewports` at 663 is never wired in. | 646–674 |
| JE1 | CONFIRMED | | 1450 vs 1470–1493 |
| JE2 | CONFIRMED | Jest 28 stopped bundling jsdom. | 31, 1503 |
| JE3 | CONFIRMED | Ran pretty-format: `escapeString: false`. | 2112–2114 |
| JE4 | CONFIRMED | Also import `node:path`, or use `fileURLToPath(new URL('./src', import.meta.url))`. | 1536 |
| JE5 | PARTLY | Both tools are already named; preference only. | 2228 |
| JE6 | CONFIRMED | | 1846, 1862 |
| (testing-strategy) | — | No findings. Its mocking passage is duplicated at 155–177 and 486–497. | — |
| RW1 | CONFIRMED | Ran Node's EventSource: the two events merge. | 204–212 |
| RW2 | CONFIRMED | engine.io has polling/websocket/webtransport, no SSE, and starts on polling. Also Tricky Q2 at 1167. | 894–897, 1167 |
| RW3 | CONFIRMED | Ran: `graphql-ws/use/ws`; `asyncIterableIterator`. Also `makeExecutableSchema`, `pubsub` and `httpServer` are never defined. | 738–750 |
| RW4 | CONFIRMED | `@socket.io/redis-adapter`. | 1064 |

## 1.17–1.24 modern-css, accessibility, browser-apis, design-patterns, refactoring, architecture, tooling, web-perf

| ID | Verdict | Evidence / correct fix | Line |
|---|---|---|---|
| M1 | FIX-CHANGE | Ran @bramus/specificity. Also say blue and green now tie at 0,1,0 (source order decides), and fix the self-contradiction at 1065. | 1064–1081 |
| M2 | CONFIRMED | Spec: skipped with InvalidStateError, no fallback. | 1214, 1220, 1250, 1388 |
| M3 | CONFIRMED | | 555, 1380 |
| M4 | CONFIRMED | 2.3.3 is AAA; the snippet contradicts the advice. | 688–699, 1400 |
| M5 | REJECTED | React 19.3 (9 Sep 2026) made `<ViewTransition>` stable. | 632 etc. |
| A1 | CONFIRMED | 86 criteria. | 65, 1104 |
| A2 | FIX-CHANGE | AccName 1.2: an empty or invalid reference falls through, so the audit's example also gives "Save". Use an ID pointing at an element with the wrong text. The "priority list, not a fallback chain" framing is wrong. Also line 251 (a duplicate ID resolves to the first match, giving the wrong name, not no name) and 1129–1131. | 251, 885–917, 1129 |
| A3 | CONFIRMED | | 150 |
| A4 | PARTLY | Just add "(AAA)". | 1185 |
| B1 | CONFIRMED | RFC 6265: 4096 per cookie, 50 per domain. | 106, 205, 986 |
| B2 | CONFIRMED | Ran jsdom: the whole cookie is dropped. Line 1388's "stripping HttpOnly" is wrong too. | 110–111, 1388 |
| B3 | CONFIRMED | | 446 |
| B4 | CONFIRMED | rAF pauses in background tabs; the throttling applies to timers. | 1644, 1683 |
| B5 | CONFIRMED | Lax-by-default is Chromium only. | 124 |
| B6 | CONFIRMED | | 1212 |
| D1 | CONFIRMED | | 546 |
| D2 | CONFIRMED | | 422 |
| D3 | CONFIRMED | Also line 514. | 514, 1117 vs 653, 867 |
| D4 | CONFIRMED | | 807 vs 1064 |
| D5 | PARTLY | Only line 135 conflicts; align it with 1077. | 135 |
| RF1 | PARTLY | Add a compiler-first note. | 280 |
| FA1 | REJECTED | The CVE details are accurate. | 588 |
| FA2 | PARTLY | "Natively" overstates it. Say "through Rolldown, with `@module-federation/vite`". | 279 |
| FT1 | PARTLY | `--ext` came back in ESLint 9.21; `eslint .` is cleaner. | 1619 |
| FT2 | CONFIRMED | Husky 9: `"prepare": "husky"`, `npx husky init`. | 1625 |
| FT3 | CONFIRMED | | 269 |
| FT4 | CONFIRMED | Ran an ESM cycle. | 251 |
| FT5 | PARTLY | All rows right except `--turbo` (history). | various |
| FT6 | CONFIRMED | Also, the §9.1 table's "Dev transform: Rolldown" should be **Oxc**. | 859, 951, 989 |
| FT7 | PARTLY | Same as FA2. | 851, 884, … |
| FT8 | REJECTED | The dates are accurate. | 1138 etc. |
| web-perf | PARTLY | Add "first 5 large images Medium (Chrome 117+)". | 214, 530 |

## 1.25–1.29 react-native, play-store, ios-app-store, mobile-accessibility, mobile-app-security

| ID | Verdict | Evidence / correct fix | Line |
|---|---|---|---|
| RN1 | FIX-CHANGE | App Center/CodePush retired 31 Mar 2025; `code-push-server` was **archived** 20 May 2025. Call it "archived, self-maintained". | rn:1587–1589, 2129; ios:438, 491, 507 |
| RN2 | CONFIRMED | A lost upload key can be reset. | rn:1561, 1871 |
| RN3 | CONFIRMED | Flipper unsupported from 0.74. | rn:1397, 1453 |
| RN4 | CONFIRMED | Also the MMKV token at 930–931. | rn:919–938 |
| RN5 | CONFIRMED | | rn:1641–1648 |
| RN6 | PARTLY | The RN guide is defensible. The Play guide's "legacy bridge gone entirely in 0.74" (1238, 1523) is the real error. | |
| RN7 | CONFIRMED | MMKV v4: `createMMKV()`, `.remove`, needs nitro-modules. | rn:927–929 |
| P1 | CONFIRMED | 12 testers opted in for 14 days; installs don't matter. Line 788 too. | play:786–805 |
| P2 | CONFIRMED | | play:767, 1392 |
| P3 | CONFIRMED | | play:996 |
| P4 | CONFIRMED | | play:1768 |
| P5 | CONFIRMED | Managed publishing is one toggle; Q9's premise is false. | play:465–470, 1774–1822 |
| P6 | CONFIRMED | `bundleRelease`. | play:1253 |
| P7 | CONFIRMED | Also line 147. | play:1377 |
| P8 | FIX-CHANGE | JSC "moved to a community package from 0.79", not removed. | play:1190 |
| P9 | CONFIRMED | `eas env`; more occurrences than cited. | play:197–199, 1282, 1482 |
| P10 | CONFIRMED (secondary sources) | Google confirms 12 testers; the 20→12 date is from third parties only. | play:56, 759, 1365 |
| P11 | CONFIRMED | Fixed by P1. | |
| I1 | CONFIRMED | | ios:519 |
| I2 | PARTLY | Cite 2.5.2 plus the DPLA interpreted-code clause; "3.3.1(B)" could not be confirmed. | ios:438, 507 |
| I3 | PARTLY | Halting makes the previous version available to new users; existing updaters keep the halted one. | ios:503 |
| I4 | FIX-CHANGE | The only required iPhone set is "iPhone with Dynamic Island (medium display)"; 6.5" only if the large set is missing. The audit's "6.9 or 6.5" is also outdated. | ios:334 |
| I5 | CONFIRMED (date unverified) | | ios:303, 379, 455, 487, 588 |
| I6 | CONFIRMED | Xcode 16 from 24 Apr 2025; Xcode 26 from 28 Apr 2026. | (missing) |
| I7 | CONFIRMED | Same as RN1. | |
| MA1 | CONFIRMED | | a11y:37 |
| MS1 | FIX-CHANGE | Google names no Tink/DataStore replacement: recommend platform APIs + Android Keystore, with Tink as an option. | sec:54 |
| MS2 | CONFIRMED | OAuth 2.1 is still a draft (updated 2026-09-02). | sec:135, 474 |
| MS3 | Optional | | sec:532 |

---

## Notes on Parts 2–5 of the audit (the plan)

- **Part 4 matches the repo's rules:** keep question numbers, run `content:meta` + `verify`, fix facts before cutting.
- **Part 3 Rule 5 conflicts with CLAUDE.md.** Rule 5 is "load scaffolding from a shared file instead of repeating it", but every guide code block must run standalone with marked stand-ins, because of the Try it buttons. Shorten stand-ins; don't move them out.
- **Part 3 Rule 4** (drop in-guide cheat sheets that duplicate `src/content/cheatsheets/`) and the shortening targets are editorial choices. Parts 2–3 were not fact-checked here.
- **Line numbers:** the JavaScript and TypeScript guides and browser-apis have changed since `bc66290`. Use the "Line" column above (current).
