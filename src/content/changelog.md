# What's New

## v1.6.3 (September 2026)

**React guide — the `<Activity>` question now shows the `<Activity>`.** The question asked what happens when you toggle an activity from visible to hidden and back, but the code showed only the timer inside it; the boundary the whole question is about was a comment. It is now real code, with the visible-hidden-visible timeline running on its own, so you can press **Try it** and watch the console print exactly what the answer says it will.

**Fixed: "Try it" could not run the newer React examples.** The playground made only eleven React names available to a snippet, so anything using `<Activity>`, `useEffectEvent`, `use`, `useOptimistic` or `useActionState` failed the instant you pressed Run — including the examples in the guide's own React 19.2 section. The list is now taken from React itself, so every hook and component it ships is available, and future ones will be too.

**Two more React 19.2 questions now actually run.** The `useEffectEvent` question and the React Compiler question both described the setup in a comment — the parent that feeds the prop, and the line that uses the component — so pressing **Try it** ran something that could not demonstrate the answer. Both now include the surrounding component and run on their own. The Compiler one is worth clicking: each press of *Re-render* adds two more tags, because the component mutates an array it does not own.

**Fixed: "Try it" opened the wrong component.** When an example defined more than one component, the playground sometimes picked an inner one and ran it without the props it needs — so a perfectly good example greeted you with a crash. It now picks the component that composes the others, which is the one you meant to see.

**Fixed: the console showed stray `%o` and `%s` markers.** React writes some of its warnings using placeholders that get filled in with real values. The playground was printing the placeholders instead of filling them, so a genuine error arrived surrounded by noise that looked like the playground itself was broken.

**React guide — the performance questions now show the fixed code, not just a description of it.** Two of them, on `React.memo` and on Context, previously explained the fix in prose. They now show the working version, and in the Context case that exposed something worth correcting: the fix everyone reaches for first — wrapping the provider value in `useMemo` — **does not solve the problem that question asks about**. Only splitting the context does. The answer now measures all three approaches so you can see which actually stops the re-render.

**Fixed: two React "Guess the Output" answers were wrong.** Both were caught by pressing **Try it** and seeing the playground disagree with the stated answer. The conditional-hooks question claimed a runtime error, but the example never actually toggled anything, so it just printed `0 25` — it now includes a button that triggers the error, so you can watch it happen. And the question about setting state to the value it already has claimed the first click causes a render; it does not, on any click. That answer has been rewritten to explain where React really discards the update, and why the caveat everyone quotes applies to a different situation.

## v1.6.2 (September 2026)

**React guide — three sections that were code with no explanation now have one.** `use()`, `useOptimistic` and Creating and Using Context each opened with a code block and said nothing about what the API is for or what goes wrong with it. `use()` now explains why it is the one hook you *can* call inside an `if`, and the mistake that costs an afternoon — creating the promise during render, which loops forever. `useOptimistic` explains that the automatic revert is the entire point, and why the optimistic row vanishing a moment after it appears usually means the real data was never refreshed. The Context section explains why the type is `T | null` and why you export the hook rather than the context.

One of those examples also had a genuine bug: the optimistic to-do was rendered with a key taken from an id the server had not assigned yet, so React saw no key at all. Fixed, and explained, since it is the classic mistake with optimistic lists.

**Opening a guide from a search result or a bookmark is about a second faster on mobile.** Every link straight into a guide — rather than to the home page — used to hit a dead end first: the server had no file at that address, so it bounced the browser to a different URL that the app could understand, and only then started loading. That detour cost roughly a second on a phone. There is now a real page at every address, so links open directly.

**Fixed: the page no longer jumps as a guide finishes loading.** The placeholder shown while a guide downloads was a few hundred pixels tall while the guide itself can be hundreds of thousands, so everything lurched the moment the text arrived. The space is now reserved up front.

**Tables are readable by screen readers again.** Forty-three comparison tables had a blank corner cell, which left an entire column of figures with nothing naming it — a screen reader would read the values with no idea what they described. Every column is now labelled.

**Guide pages animate more cheaply.** The fade-in when a guide opens now runs as a plain CSS animation instead of going through the animation library, so it no longer competes with the work of rendering the guide itself — and it correctly stays still if you have reduced motion turned on in your system settings.

## v1.6.1 (September 2026)

**Frontend Tooling — webpack vs Vite now answers the question interviewers actually ask.** The guide compared the two thoroughly but recommended Vite flatly, which is only the answer for a *new* project. The harder version — "would you migrate an existing webpack app?" — now has its own section and its own interview question, and the answer starts with *no, by default*: a working build config is years of accumulated decisions, and "the dev server starts faster" rarely pays for replacing it. It names the three things that would change that, and adds the option most people miss — **Rspack**, a Rust rewrite of webpack that runs your existing config, so you get most of the speed without rewriting your loaders. Vite is the better destination; Rspack is the cheaper move. Rspack also gets a full entry alongside the other bundlers.

Also new: the gotcha that `vite build` happily succeeds on code with type errors, because it strips TypeScript without checking it — you need a separate type-check step, and plenty of teams find that out the hard way.

**Every page used to quietly download all 68 guides. Now none do.** The "Daily Review" badge in the sidebar needed to know how many questions exist, and the only way it had to find out was to fetch the entire library — 64 files, 1.6 MB — on every single page you opened, including the home page, where none of that text is ever shown. On a slow phone connection that was the difference between the page being usable in about a second and taking twelve. The count is now worked out when the site is built, so the badge costs nothing at all.

**Fixed: unreadable greys in dark mode.** The light-mode contrast pass shipped earlier fixed one half of the problem and left the mirror image: a colour written without a dark-mode counterpart applies to *both* themes, so thirty places that now read clearly on white were too faint on black — the sidebar search box, its ⌘K hint, "View on GitHub", and captions throughout. Code blocks had it worse: the language label, the Copy button, and **comments inside every code sample** were all below the readable threshold.

**Buttons that were invisible to screen readers now announce themselves.** The theme toggle, search, text-size, sidebar close, copy-code and bookmark buttons are icons with no words, and a screen reader had nothing to read out but "button". Each now describes what it does, and the ones that change meaning say the right thing for the current state — the theme toggle reads "Switch to dark theme" or "Switch to light theme" rather than always the same label.

## v1.6.0 (September 2026)

**SOLID principles added to the Design Patterns guide.** The guide walked through all 23 Gang-of-Four patterns without ever explaining the principles those patterns exist to serve — so the catalogue read as twenty-three unrelated recipes. The new section opens with a table mapping each principle to the tension it names and the patterns it leads you to, then takes each one in turn: the misreading to avoid, the smell that identifies a real violation, a runnable before-and-after, and which patterns resolve it. It closes with when SOLID becomes the problem — over-applied, it buys indirection you never use — and why a module of pure functions already satisfies most of it in JavaScript. Two new interview questions cover how SOLID and the patterns relate, and what applying them badly looks like.

The Low-Level Design guide keeps its own SOLID section, which is a different angle: the same principles worked through four complete designs. The new one cross-links to it rather than repeating it.

**Every coding challenge now has a Show Solution and an Explain walkthrough.** Six challenges were missing both and eighteen more had no step-by-step explanation — all 94 JavaScript challenges are now covered. The new solutions are written in the usual house style: several approaches, a time/space comparison, and a note on which to pick when. Auto-Retry explains the thundering-herd problem and why jitter fixes it; Batch Promises shows why naive chunking stalls a worker; Implement useState explains, with the array-and-cursor model, why the rules of hooks exist at all; and Task Runner shows the missing `finally` that silently deadlocks a queue.

**Fixed: every code block in every guide now runs.** All 1,670 blocks with a "Try it" button used to include 188 that were guaranteed to fail the moment you clicked — now there are none, and a check blocks any new one from shipping. Most were genuine content problems rather than formatting: snippets showing `yield` or `return` outside any function (not valid JavaScript at all), before-and-after pairs that declared the same variable twice, two files crammed into one block, MongoDB documents tagged as JavaScript, and reference listings whose lines ran together. Where a before-and-after pair needed renaming, the *correct* version keeps the clean name so it stays copy-pasteable. Decorator examples (`@Component`) now run too — the playground had never been told to accept them.

**Fixed: faint, hard-to-read text in light mode.** Sidebar section headings like "REACT & STATE", the "ON THIS PAGE" label, card captions, hint lines such as "Tap to reveal answer", the version number and several icon buttons were rendered in a grey too light to read against a white background — roughly half the contrast needed. Thirty-six of these were corrected across the sidebar, home page, quiz, review, bookmarks, checkpoints and search. Two were written backwards, so they were faint in *both* themes. Light and dark mode now each get the shade meant for them.

**Fixed: TypeScript in the playground failed on the most common React pattern.** A component with a typed event handler — `const handleSubmit = (e: React.FormEvent) => …` — died with `Unexpected token, expected ","` instead of running. The playground tried to *detect* whether your code was TypeScript by looking for a fixed list of built-in type names after a colon, so a custom or namespaced type like `React.FormEvent`, `Props` or `User` was missed and the code was compiled as plain JavaScript. TypeScript is a superset of JavaScript, so there was never anything to detect — it is now always handled, and every existing template still behaves identically.

**"Playground" is now "Code Playground",** so it reads clearly alongside the new Query Playground.

**React guide — the custom hooks section is now just the good versions.** §6.3 previously showed a naive implementation of each hook before the correct one. It now gives only the version you should write, plus how to consume it: `useToggle`, `useDebounce`, `useFetch`, `useLocalStorage` and a new `useMediaQuery`. The reasoning that used to justify the bad versions is kept as short notes on *why* each line is there — why the cleanup **is** the debounce, why `useFetch` guards on `aborted` rather than using `.finally`, and why every storage access is wrapped in `try`/`catch`.

**New: a Query Playground for SQL and MongoDB.** Thirty-four interview questions — twenty PostgreSQL, fourteen MongoDB — where you write the query, run it against real seeded data, and have your answer checked automatically. Every question comes with the schema in front of you, a reference solution, and an explanation of what it is really testing.

**It runs an actual PostgreSQL database in your browser.** Not an approximation — window functions, `DISTINCT ON`, `FILTER`, `ILIKE`, recursive CTEs and arrays all behave exactly as they would on a server, because it *is* Postgres, compiled to WebAssembly. The engine is about 5 MB and downloads the first time you run a query, then stays cached. MongoDB questions run a real aggregation pipeline — `$unwind`, `$lookup`, `$facet`, `$reduce`, `$elemMatch` — and load in well under a second.

**Answer checking is deliberately forgiving where it should be.** Your columns can be in any order, row order is only graded when the question asks for a specific order, and a Postgres numeric coming back as `"150000"` still matches `150000`. Two different-but-correct queries both pass — a `LEFT JOIN … IS NULL` and a `NOT EXISTS` are accepted equally. When something is wrong it says *why*: too many rows means your filter is leaking, too few means a filter or JOIN is excluding them, and a column mismatch names the column.

The questions cover the ones that actually get asked. On the SQL side: second-highest salary (with the tie that breaks the naive answer), top-N per group, employees earning more than their manager, customers who never ordered, the `LEFT JOIN`-with-`WHERE` trap, `RANK` vs `DENSE_RANK` vs `ROW_NUMBER`, pivoting rows into columns, running totals, `LAG` for row-to-row comparison, grouping by month, string aggregation, NULL handling, self-joins, recursive CTEs and `UNION` vs `UNION ALL`. On the Mongo side: `$unwind` with `$group`, `$lookup`, `$facet`, `$bucket` histograms, `$graphLookup` for hierarchies, collecting arrays with `$addToSet`, date grouping, `$cond`, computing with `$reduce` instead of unwinding, and the `$elemMatch` mistake.

**Every SQL question says how it differs on MySQL**, and there is a "Why PostgreSQL and not MySQL?" note explaining the choice: PostgreSQL is the only production-grade SQL engine that compiles to WebAssembly, and with no backend there is nothing else to run your query against. For interview SQL the two are now largely the same — MySQL 8.0 added window functions and CTEs — so the notes flag only the genuine gaps, like `DISTINCT ON` and `FILTER` being PostgreSQL-only, `STRING_AGG` vs `GROUP_CONCAT` (which silently truncates), and the date-function differences.

**Every code block in the React guide now actually runs.** 26 of them couldn't even be parsed, which meant their "Try it" button loaded the playground and immediately failed — the class lifecycle methods were shown as bare method bodies with no class around them, some blocks declared the same name twice to contrast good and bad versions, and a few used `...` or `dependencies?` as shorthand that isn't valid code. All 191 runnable blocks in the guide now parse, and the ones that were rewritten also execute. The lifecycle examples gained the surrounding class, which makes them clearer as well as runnable.

**React guide — the custom hooks section rewritten, and eight more interview questions.** §6.3 now gives each hook its own walkthrough — `useToggle`, `useDebounce`, `useFetch`, `useLocalStorage` — with the naive version, **the bug that naive version has**, the fix, and a consumption example for each. Three of the four had a version that looks correct and passes a quick manual test while being wrong:

- **`useFetch` used `.finally` to clear its loading flag, which fires on abort.** Change the URL and the old request's `.finally` runs anyway, so `loading` goes false while the new request is still in flight — and the component renders the *previous* URL's data as if it were fresh. It also fired on every first mount in development. Rewritten as a single discriminated-union state with an `aborted` guard in both handlers, which also fixes `data` and `error` never being cleared between requests. The union means consumers no longer need null checks.
- **`useLocalStorage` read storage inside a `useState` initialiser with no `try`/`catch`.** In a private window that read *throws* rather than returning empty, and because the initialiser runs during render, it took down the whole page. Now guarded, plus a re-read when the key changes (the old version wrote one key's value into another) and cross-tab sync.
- **`useDebounce`** was already correct; it now explains why the cleanup *is* the debounce, and why binding the input to the debounced value makes the field feel broken.

New questions **Q46–Q53**: `useRef` and when to use it, the rules of hooks and why they exist, what Fragments are for, what custom hooks are with a worked example, subscribing to an external data source with correct cleanup, client-side versus server-side routing, the React event system versus native DOM events, and localizing a React app.

**Fixed: the playground preview could go blank with no explanation.** If your React code threw *after* it mounted — most often because a pasted snippet calls a helper it doesn't define, like `fetchResults` — React tore down the preview and you were left with a white pane and an empty console. The preview now shows the actual error where the component was, and writes the full message to Console Output. Errors from `setTimeout`, intervals and unhandled promise rejections are captured too; those never reached the console before.

**Fixed: "Balanced Brackets (Count)" showed a failing test in its own solution.** Clicking Show Solution printed a red ❌ on a correct implementation. The test asserted that `"[(])"` is unbalanced, but that input has matching counts, so a counting approach correctly reports it as balanced — which is the whole point of that challenge, and exactly why Valid Parentheses (which uses a stack) exists separately. The case is now labelled as the limitation it demonstrates, with a genuinely count-unbalanced input alongside it.

**Guides open faster on a first visit.** The guide renderer is now fetched alongside the first guide you open rather than on every page load, so landing on the home page no longer downloads it. Combined with the earlier change, first load is down from about 900 KB to 525 KB.

**The Code Playground opens much faster.** It was downloading all 180 template bodies — about 350 KB — before showing you anything, even though the picker only needs each template's name and tags. The list now loads immediately and the code arrives when you open a template (and quietly pre-loads in the background, so in practice it's already there). The playground's own download dropped from 428 KB to 95 KB.

**The app loads noticeably faster, and no longer breaks in private browsing.** The first download is down from about 900 KB to 525 KB, because the markdown renderer — around 327 KB — was being fetched on every visit even by people who only opened the home page, which shows no markdown at all. It now arrives with the first guide you open.

**Fixed: the app could show a blank page in a private window.** Several features read your saved progress while the page was still rendering, and in a private window (or with site data blocked) that read doesn't return empty — it fails outright, which took the whole page down with it. All saved-data access is now failure-proof: worst case a preference doesn't persist, instead of a blank screen. Your existing bookmarks, checkpoints, review schedule and playground drafts are untouched.

**Fixed: a guide that fails to download now says so.** If the network dropped or a new version was released mid-session, the loading skeleton would spin forever with no explanation. Guides, search, Quiz and the Daily Review now all show a real message and stop loading.

**Fixed: the playground inserted a closing tag into the middle of a prop.** Typing `<button onClick={()=>` put `</button>` inside the `onClick` value — `<button onClick={()=></button>}>` — because the `>` in the arrow function was mistaken for the end of the tag. Tag completion now waits until the opening tag is actually finished: while a `{`, `(` or `[` is still open inside it, any `>` you type belongs to that expression and is left alone. Once the prop is closed, `<button onClick={() => inc()}>` completes to `</button>` as expected.

**React guide — §5.2 State Update Rules now explains the concepts, not just shows them.** The section was a single sentence followed by a long code block, so batching, immutability and functional updates were demonstrated without ever being explained. It now builds all three rules from the one idea they share — **the state variable in a render is a snapshot, not a live value** — and then takes each in turn: why two `setCount(count + 1)` calls increment once and why you can't read your own update back; what React 18 changed about where batching applies; why mutating an object makes React skip the render entirely (`Object.is` compares the reference, not the contents) and the four other things that quietly break with it; and what the updater form actually does differently, with a side-by-side trace of the update queue. Includes a table of mutating array methods and their safe equivalents — `sort` and `reverse` are the ones that slip through review, since they look like they return a new array but don't — plus the three situations where the updater form isn't just tidier but required, including the stale-closure bug that freezes a `setInterval` counter at 1.

**Playground — `<` now pairs with `>`.** Opening a bracket auto-closes it, but `<` was never included, so typing it did nothing. It now inserts the matching `>` — and cooperates with tag completion, so typing `<div>` still gives you `<div></div>` rather than a stray extra bracket. It stays out of the way where `<` isn't a tag: comparisons like `if (i < n)` and TypeScript generics like `useState<Props>` are left exactly as typed.

**Playground — JSX tags now auto-close, and a bracket bug that corrupted code is fixed.** The toolbar said "Auto-close on" but only closed brackets and quotes, never tags: typing `<div>` left you to write `</div>` yourself. It now inserts the closing tag and puts the cursor between the two, including for fragments (`<>` → `<></>`) and dotted components (`<Modal.Header>`). It deliberately stays out of the way where a `>` isn't a tag — self-closing tags, void elements like `<br>` and `<img>`, TypeScript generics like `useState<Props>`, and plain comparisons.

**The bracket bug was the more damaging one.** Typing `[`, `(` or `{` immediately before existing text inserted the pair anyway and swallowed that text inside it, so editing a line like `const [count, setCount] = useState(0)` could silently leave you with `count[(count, setCount)]`. Auto-close now holds off when the cursor sits directly against a word — while still wrapping a selection in brackets when you've selected something on purpose, which is the case where that behaviour is wanted.

**A Reset button you can always reach.** Reset was only shown once a draft had been auto-saved, which meant it was missing at exactly the wrong moment — right after code got mangled but before the save fired. It now appears whenever a template is loaded, restores that template's original code, and clears the console output, the saved draft and any revealed solution. It only asks for confirmation if you actually have unsaved changes.

**Frontend Architecture guide — every abbreviation and bit of jargon now explained where it's used.** The guide was written in the shorthand these interviews are actually conducted in, which made it hard going whenever a term was new. Rather than a glossary you'd have to learn first, the explanation now sits inline at the point of first use — **BFF (backend-for-frontend)**, **PKCE (Proof Key for Code Exchange)**, **IdP (identity provider)**, **RUM (real-user monitoring)**, **INP / LCP / CLS**, **RBAC**, **PPR**, **rAF**, **p50 / p99** and around forty more — so you can read straight through without looking anything up.

The same treatment went to the jargon that carries the real meaning but was previously assumed: phantom dependency, single version policy, affected graph, barrel file, codemod, the strangler-fig pattern, ring buffer, backpressure, thundering herd, jitter, layout thrash, overscan, cursor pagination, idempotency key, escape hatch, and controlled versus uncontrolled. It also now says explicitly that **`@acme` is a stand-in for your own company's name**, and that **`RTL` here means right-to-left, not React Testing Library**.

Several passages that named a concept without explaining it have been expanded — what `s-maxage` does that `max-age` doesn't, what a surrogate-key purge actually is, why `workspace:*` removes version bumps, what selector-level subscriptions mean in practice, and the two anti-CSRF token patterns. One genuinely confusing explanation in the closure question was rewritten as three separate runnable examples, since it had packed mutation, reassignment and a leaked reference into a single sentence.

**Fixed: Daily Review opened to a blank page and got stuck.** Guides are now downloaded as you open them rather than all up front, and the review queue was being built before the question bank had finished arriving — so the page went blank with no way out. It now shows a loading state while the questions load, then the queue.

**Fixed: review scheduling could confuse two different questions.** Most guides contain two question sequences — the interview section and "Tricky Output Questions" — and both start again at Q1. Questions were identified by that number, so a pair of unrelated questions shared a single review record: answering one silently rescheduled the other, and both turned up in the same review session. 344 of the 1,298 questions were affected. Your existing review history is kept.

**A page that fails now explains itself instead of going blank.** If a page hits an unexpected error — or a new version is released while your tab is open and part of the app can no longer be fetched — you now get a short explanation and a Reload button rather than an empty screen.

**Loading indicators everywhere.** Now that guides are fetched individually, opening one can involve a short download — and previously nothing on screen said so, so the page you were on appeared to hang. There is now a thin progress bar at the top of the page whenever content is being fetched, a skeleton in place of the guide while it loads, and a proper loading state in search, Quiz and the Interview Simulator instead of an empty result. Revisiting a guide you have already opened is instant and shows no loader at all, and the reading time in the header is correct immediately rather than briefly reading "~1 min".

**Fixed: playground template filtering showed "No templates found".** Picking a pattern like Two Pointer and then switching to the React tab filtered everything away, because React machine-coding challenges have no pattern or difficulty labels and the filter stayed applied — and it persisted after closing and reopening the modal. The filters now reset when you change tab or mode, and the pattern list and difficulty chips only appear for the challenges they actually apply to, with counts that match what's on screen instead of always showing the JavaScript totals.

**Seven new React challenges, covering the concepts that had guides but no hands-on exercise.** **Optimistic UI Updates** — `useOptimistic` and the manual-rollback version, where the graded part is the failure path. **Suspense + Lazy** — code splitting with `React.lazy`, plus the error boundary Suspense does *not* give you and the throw-a-promise data pattern. **Client Cache** — stale-while-revalidate, request de-duplication and cancellation, i.e. what TanStack Query actually does for you. **WebSocket Live Feed** — connection lifecycle, reconnect with jittered backoff, and a bounded buffer. **Protected Route (Auth + RBAC)** — authentication vs authorization, and the loading state whose absence logs everyone out on refresh. **Mini Redux Store** — `createStore` in twenty lines with `useSyncExternalStore`, showing why selector isolation is the real answer to "why not just Context". **Responsive Images** — `srcset` vs `sizes`, `<picture>` with AVIF/WebP, reserving space for CLS, and never lazy-loading the LCP image.

**Playground totals: 180 templates, 129 challenges (94 JS + 35 React).**

**Much faster first load.** The app used to bundle every guide into a single file, so opening one page downloaded all 68 — about 5.4 MB of JavaScript before anything appeared, and the service worker then cached 14.5 MB. Guides are now fetched individually as you open them: **initial load is down from 5.4 MB to 0.8 MB**, and the offline cache from 14.5 MB to about 1 MB. Search, Quiz and the Interview Simulator still need everything, so they fetch it the first time you use them and show a brief loading state.

**Fixed: no more white flash on load.** In dark mode the page appeared white for a moment (or several seconds on a slow connection) before the theme applied. The theme is now resolved before the first paint.

**Fixed: "Continue" from Checkpoints and Bookmarks now lands on the right heading** instead of the top of the guide.

## v1.5.0 (September 2026)

**React guide — every lifecycle method now explained individually.** The lifecycle section was one long code block with one-line comments, so it showed the methods without explaining them. Each of the nine now gets its own walkthrough: signature, what it does, when to use it, the **most common pitfall**, and the hook equivalent — including the `componentDidUpdate` guard that prevents an infinite loop, why `getDerivedStateFromProps` is `static` and runs on *every* render, what `getSnapshotBeforeUpdate` is actually for, and why error boundaries need two methods. It opens with the run order and the **render-phase vs commit-phase** distinction, which is the single idea that explains why some methods must be pure and why the `UNSAFE_` ones were deprecated.

**React guide — a new section on what React 19 changed.** The guide already covered what React 19 *added* (the Compiler, Actions, `use()`, `<Activity />`, `useEffectEvent`). New **§16.9** covers what it **removed or changed**: the full removals table with replacements and codemods, the two that fail quietly (`propTypes` is now silently ignored, and `defaultProps` still works on classes but not function components), ref cleanup functions and the TypeScript implicit-return break they cause, `ref` as a plain prop, `<Context>` as its own provider, automatic metadata hoisting, stylesheet precedence, the preload APIs, hydration error diffs — and an upgrade order that starts at 18.3. Plus **Q45** on the same. It also states plainly that **no lifecycle methods were removed** in React 19, since that's a common assumption.

**Fixed: pasting real React code into the playground no longer fails.** Code starting with `import React from 'react'` — which is how every real component and every tutorial begins — died with `SyntaxError: Cannot use import statement outside a module`. The playground now ignores `import`/`export` lines and tells you so, since React, the hooks and `render` are already available. TypeScript in the same snippet (`interface Props`, `React.Component<Props>`) already worked and still does.

## v1.4.0 (September 2026)

**Fixed: new releases now appear without a hard reload.** The service worker was being registered in a way that cached the app but never told the page a newer build had taken over, so updates only showed up after a manual hard refresh — and a tab left open never noticed a release at all. The app now checks for a new version on load, on tab focus and once a minute, and refreshes itself when one is ready.

**Screening-round gaps closed.** The React guide gained a **Component Communication** section (§5.4) — props down, callbacks up, lifting state to the *closest* common parent, when Context actually earns its cost, and refs for imperative actions — plus **Q44** on the same, because "how do components talk to each other" is asked in almost every screening round and was the one fundamental the guide didn't cover directly.

**Two new playground templates for the hands-on exercises interviewers actually set.** **Display Data from a JSON Prop** — pass a JSON object as a prop, access it defensively, render it with a stable key, and handle the empty case. **JSON → API → React fetch** — the full-stack version, with the Express handler shown as reference (read the file once at startup, `res.json`, 404 on a missing record) and the React consumer covering loading, error and empty states with `AbortController` cleanup.

The Express guide also gained **§5.4 Serving Data from a JSON File**, covering the three things graded in that task: don't read the file per request, use `res.json()` rather than a hand-stringified body, and fail at startup rather than on the first request.

## v1.3.0 (September 2026)

**Three new DevOps guides, and two new sections in the sidebar.** **SSH & Linux Administration** is the layer under every other tool: how key authentication actually works, `ssh_config` and `ProxyJump`, the three kinds of port forwarding, why agent forwarding is risky, hardening `sshd` without locking yourself out, and a methodical walkthrough for diagnosing a sick server — load average, memory, the three causes of "disk full", and the text-processing one-liners you reach for in a log. **Observability & SRE** covers Prometheus metric types and PromQL, why cardinality is the thing that breaks metrics systems, Grafana dashboards that are useful under pressure, logs and traces with OpenTelemetry, SLIs/SLOs and error budgets, burn-rate alerting, and incident response and postmortems. **Helm & GitOps** covers charts and templating, Helm vs Kustomize, Argo CD with `prune` and `selfHeal`, secrets in a git repository, environment promotion, and progressive delivery that queries your metrics and rolls itself back.

DevOps now reads as **Linux & Networking → AWS → Containers & Orchestration → Infrastructure as Code → CI/CD → Observability & SRE**.

**Mobile is now covered end to end.** The React Native guide gained four sections it was missing — **in-app purchases and subscriptions** (server-side receipt validation, and why an unacknowledged Android purchase auto-refunds after three days), **crash reporting and monitoring** (dSYMs and source maps, crash-free session rate, ANRs and watchdog terminations), **background tasks** (why the OS may never run yours, and the outbox pattern that survives it) and **app size and startup time** — plus four new tricky questions.

**Three new mobile guides.** **iOS & App Store Deployment** is the counterpart to the Play Store guide: code signing explained properly, TestFlight internal vs external, privacy manifests and nutrition labels, App Transport Security, the ten most common App Review rejections, phased release — and why there is no rollback on iOS. **Mobile Accessibility** covers VoiceOver and TalkBack, grouping cards into single announcements (the highest-leverage change in most apps), Dynamic Type, touch targets, Reduce Motion, and the WCAG criteria that only apply on mobile. **Mobile App Security** starts from the assumption that the attacker owns the device: Keychain and Keystore, biometrics as a key-release gate rather than a boolean, PKCE and why never to use a WebView for login, certificate pinning and the outage it can cause, attestation, and receipt validation.

**"Play Store Launch" is now "Play Store Deployment"**, to sit alongside the iOS guide.

**The sidebar is now grouped throughout.** Every category with more than a handful of guides has sub-headings, so finding something no longer means scanning twenty flat entries: **Front End** splits into React & State, Styling & Accessibility, Browser/Real-Time/Performance, Architecture & Code Quality, Testing & Tooling and Mobile; **Back End** into Runtimes & Frameworks, APIs & Integrations, Databases, Security & Auth and Architecture & AI; **DevOps** into AWS, Containers & Orchestration, Infrastructure as Code and CI/CD; plus JS & TS and System Design. Git, DSA and Behavioral are small enough to stay as they are.

**New guide — AWS CodePipeline & CodeBuild.** The AWS CI/CD family was barely covered (CodeDeploy and CodeArtifact had no mentions at all): buildspec phases and the `post_build`-runs-on-failure trap, CodePipeline stages and artifacts, CodeDeploy in-place vs blue/green with alarm-triggered rollback, ECR and CodeArtifact, cross-account deploys and the KMS key that silently breaks them, and where each IAM service role fits.

**The AWS section is now DevOps, with AWS as one group inside it.** The sidebar category gained sub-headings, so DevOps reads as **AWS** (the seven existing guides) → **Containers & Orchestration** → **Infrastructure as Code** → **CI/CD**. Existing AWS links are unchanged.

**Four new guides.** **Terraform** — state as the thing everything hinges on, `for_each` vs `count` and why index shifting destroys resources, `moved` blocks for safe renames, reading a plan for `forces replacement`, and directory-per-environment over workspaces. **Ansible** — idempotence and what quietly breaks it, why modules beat `shell`, handlers and the two ways they surprise you, Vault, and safe rolling waves. **Jenkins** — declarative pipelines, agents and per-agent workspaces, credentials and how masking is defeated, and the security model (why builds must never run on the controller). **FastAPI** — `async def` vs `def` and the blocking trap, dependency injection, `response_model` as a security control, streaming, and deployment. **20 interview questions and 20 tricky questions between them.**

**Cheat sheets: 7 → 14.** Six new printable quick-reference cards — **TypeScript** (narrowing, generics, utility types, `satisfies`), **Python** (comprehensions, dataclasses, decorators, asyncio), **SQL** (joins, window functions, CTEs, isolation levels, EXPLAIN), **GraphQL** (nullability, DataLoader, connections, security), **Regex** (lookaround, the `lastIndex` trap, ReDoS) and **Docker & Kubernetes** (multi-stage builds, kubectl, probes, requests vs limits) — plus the Comparison Tables card. Each one closes with the gotchas that actually cost people interviews.

**And the six original cards were doubled in depth** so every sheet now carries the same weight. React Hooks gained the concurrent and React 19 action hooks, `useEffectEvent`, dependency-array rules, a when-*not*-to-use-`useEffect` table and the stale-closure traps. JavaScript ES6+ gained classes, generators, the event loop and microtask ordering, the promise combinators and everything through ES2026 (`Object.groupBy`, `structuredClone`, `using`, Temporal). CSS gained the `min-width: auto` bug in its four disguises, the `flex` shorthand decoded, subgrid, container queries and an alignment reference. Git gained `reflog` recovery, `bisect`, worktrees, a full undo matrix and merge-vs-rebase. HTTP gained the eight code pairs people confuse (301 vs 308, 401 vs 403, 409 vs 422…), conditional requests, and which statuses are safe to retry. Big-O gained how to derive complexity, amortized analysis, graph algorithms and the hidden O(n) costs in everyday JavaScript.

Two existing cards were also rendering in the wrong colour and now look right.

**New guides — GraphQL, PostgreSQL and MySQL.** GraphQL covers schema and nullability design, resolvers, the N+1 problem and DataLoader, why HTTP caching stops working and what replaces it, cost and depth limiting, federation, and when not to use it. PostgreSQL goes into the engine: MVCC and why `VACUUM` exists, connection pooling, replication, partitioning, and **pgvector for RAG** on the database you already run. MySQL covers InnoDB's clustered index and why a random UUID primary key hurts, gap locks and deadlocks, online schema changes, and the `utf8`/`utf8mb4` trap. **37 interview questions and 16 tricky questions between them.**

**New guide — Python.** A 2,475-line guide written for backend and AI-service engineers rather than data scientists: the GIL and how to choose between threads, processes and asyncio; asyncio in depth (gather, semaphores, queues, cancellation, timeouts); decorators, generators and context managers built from scratch; memory management and the cyclic garbage collector; pytest and mocking; and a full section on Python for LLM and agent services — bounded concurrent pipelines, streaming responses, distributed rate limiting, Redis caching of model calls, partial-failure recovery across dozens of agents, plugin registries, and secrets on Lambda. **50 interview questions, 8 tricky output questions, a 58-rule cheat sheet and 15 worked practical exercises.**

**New cheat sheet — Comparison Tables.** 762 lines of side-by-side tables spanning JavaScript, React, backend, networking, AWS and system design. This content already existed in the repo but was never wired into a route, so nobody could reach it.

**The sidebar now shows the app version.** It sits under "View on GitHub" and reflects the build you're actually running — so if a cached copy is serving you something older than the latest release, you can tell at a glance.

## v1.2.0 (September 2026)

**Fixed: the Introduction page you're reading from was showing the repo's developer README.** The build was overwriting this page with the GitHub README on every deploy, so `/` showed project structure and setup instructions instead of the study roadmap. The real Introduction — the 20-topic priority map and the themed guide index — is now what actually ships.

A playground release. **171 templates, 120 challenges (94 JS + 26 React), 88 with a multi-approach Show-Solution walkthrough.**

Two audits drove it: the existing array/string coverage against the questions that actually get asked, and the React Machine Coding set against the low-level-design components interviewers name directly. Sliding window went from 1 challenge to 5, and two React LLD components that were entirely absent are now covered at interview depth.

### React Machine Coding &mdash; the LLD Components, Properly

Audited the React Machine Coding set against a list of the low-level-design components interviewers ask for by name. Eight questions; two were **completely missing**, four existed only as shallow versions. All eight are now covered at interview depth (React Machine Coding 21 &rarr; **26**).

**New:**

- **Counter (optimized re-renders)** &mdash; the question every React interview opens with, and the follow-up that actually matters. Functional updates, `useCallback` with empty deps, `React.memo` on children with a live render counter, bounds and step, plus a runnable demo of the **stale-closure trap in `setInterval`** and why batched `setCount(count + 1)` twice only increments once.
- **Search with Debounce + Cancel** &mdash; debouncing is the easy half. The half that separates candidates is **cancelling the in-flight request**: type "re" then "rea", and without an `AbortController` the slow response for "re" lands last and overwrites the results for "rea". Includes a `useDebouncedValue` hook and all five states (idle / loading / success / empty / error).
- **Modal (Portal + Focus Trap)** &mdash; `createPortal`, focus into the modal on open, a real **Tab/Shift+Tab focus trap**, focus **returned to the trigger** on close (the most-forgotten step), Escape, `aria-modal`, scroll lock, and `stopPropagation` so a click inside doesn't hit the backdrop. Rendered inside a deliberately `transform`ed, `overflow:hidden` ancestor so you can see what the portal is escaping &mdash; plus the `<dialog>` version you should actually ship.
- **Form with Validation** &mdash; the validation-timing decision that gets graded: **on blur, then live once touched**, because validating from the first keystroke is hostile. Errors are *derived*, never stored. Full accessibility: real `<label htmlFor>`, `aria-invalid`, `aria-describedby` linking the message, `role="alert"`, and focus moved to the first invalid field on failed submit.
- **Theme Switcher (dark/light)** &mdash; and the two things implementations get wrong. **Three states, not a boolean**: light / dark / *system*, because `isDark` can't represent "follow the OS" and the user's choice breaks at sunset. And **the flash of wrong theme** &mdash; a `useEffect` runs after first paint, so the fix is a blocking inline script in `<head>`; the template documents exactly what to put there. CSS variables on `:root[data-theme]`, a live `prefers-color-scheme` listener, and `localStorage` wrapped in `try`/`catch` because it *throws* in Safari private mode rather than returning `null`.

**Upgraded:**

- **Auto-Complete (ARIA combobox)** &mdash; was "Auto-suggest" with arrow keys and nothing else. Now the full pattern: debounce, request cancellation, and the mechanism that matters &mdash; **`aria-activedescendant`**, so DOM focus stays in the input while a *virtual* focus moves through the options. Moving real focus onto the options breaks typing, and that's the classic wrong build. Plus `role="listbox"`/`option"`, `aria-expanded`, Home/End, two-stage Escape, and `onMouseDown` instead of `onClick` (because `onClick` fires after `onBlur` has already closed the list).
- **Todo List (localStorage + memo)** &mdash; gained persistence. Lazy state initialiser so storage is read once, shape **validation** on load so a schema change doesn't white-screen returning users, and a visible warning when storage is unavailable. Notes on multi-tab sync via the `storage` event.
- **Infinite Scroll** &mdash; gained an **error state with retry** and an `aria-live` announcement. The demo fails page 3 once so the path is reachable. Also guards the observer while an error is showing, since otherwise it retries in a tight loop against a failing endpoint.

**Playground totals: 171 templates, 120 challenges (94 JS + 26 React), 88 with a Show-Solution walkthrough.**

### Playground &mdash; 18 New Array & String Challenges

The playground gained 18 JS coding challenges (76 &rarr; **94**), chosen by auditing the existing set against the array and string questions that actually come up. Every one ships with a **multi-approach solution** and a Time/Space/Verdict comparison table.

**Arrays** &mdash; **Merge Intervals** (sort then sweep; the overlap predicate `a <= d && c <= b`), **Minimum Size Subarray Sum** (why the window only works because the values are positive), **Sliding Window Maximum** (monotonic deque &mdash; the O(n) answer where the obvious one is O(n&middot;k)), **Longest Consecutive Sequence** (the sequence-start guard that makes it O(n)), **Next Permutation** (pivot &rarr; swap &rarr; reverse suffix, derived rather than memorised), **Rotate Matrix 90&deg;** (transpose + reverse rows, plus the anticlockwise and ring variants), **Shuffle Array (Fisher-Yates)**, **Array Intersection & Union**, **Chunk Array**.

**Strings** &mdash; **String Compression (RLE)**, **Integer to Roman** (the mirror of the existing Roman to Integer), **Reverse Integer** (the overflow check *is* the question), **Isomorphic Strings** (why a one-directional map is wrong), **Longest Repeating Char Replacement**, **Minimum Window Substring**, **Case Converter (camel/snake/kebab)** including the recursive `deepCamelize` you actually write at work.

**Sliding window coverage went from 1 challenge to 5** &mdash; it was the biggest gap in the set, a top-five interview pattern represented by a single problem. New distribution: Hash Map/Set 20, Two Pointer 19, Recursion/D&C 12, Math/Bit 11, Closure/State 11, Greedy 10, Sorting 9, In-Place 9, DP 6, **Sliding Window 5**, Stack 4, Linked List 4, Backtracking 4, Binary Search 3. Difficulty: **38 Easy / 51 Medium / 5 Hard**.

### The Solutions Teach the Trap, Not Just the Algorithm

- **Fisher-Yates** explains *why* `arr.sort(() => Math.random() - 0.5)` is not a uniform shuffle (an inconsistent comparator, so the result depends on the engine's sort algorithm) &mdash; and includes **Sattolo's algorithm** as a runnable demonstration of how a one-character off-by-one silently produces only cyclic permutations.
- **Sum Without Loops** proves V8 has **no tail-call optimisation** with an assertion that catches the `RangeError`, so "tail recursive" is shown to buy nothing in JavaScript.
- **Longest Repeating Char Replacement** explains why the stale `maxCount` is safe rather than asking you to trust it.
- **First Repeating Character** disambiguates the two readings of the question &mdash; on `"success"` the answer is `'c'` or `'s'` depending on which was asked &mdash; because picking the wrong one is the actual failure mode.
- **Chunk Array**'s input guard prevents a `size: 0` infinite loop, which hangs the tab rather than just returning the wrong answer.

### Also From Two Interviewer Question Lists

Audited two user-supplied lists of commonly-asked questions against the app. Most were already covered (call/apply/bind polyfills, Flatten Array, Deep Clone, Sum Curry, Stopwatch, the event-loop output puzzles). The genuine gaps are now filled:

- **First Repeating Character** and **Sum Without Loops** as JS challenges (above).
- **Todo List (optimized re-renders)** &mdash; a new React Machine Coding challenge (20 &rarr; **21**). A complete reference implementation of the four re-render techniques: isolate the input's state so typing doesn't touch the list, `React.memo` on rows, stable `useCallback` identity, and functional `setState` so the dependency arrays stay empty. Each row shows a **live render counter**, so you can watch that toggling one item re-renders exactly one row. Closes with notes on what changes at 500+ items (virtualization), under the React Compiler, and once todos become server state.
- **Modern CSS guide** &mdash; new interview question: *"lay out five divs in a row with no flexbox, grid, margin or padding."* Covers `inline-block`, the **whitespace-gap bug** that breaks it (five 20% items wrap because the newlines between tags render as real spaces), and the `table-cell` and `float` alternatives.

**Playground totals: 166 templates, 115 challenges (94 JS + 21 React), 88 with a Show-Solution walkthrough.**

### Interview-Round Question Audit &mdash; 7 Gaps Closed

Audited a three-round interview question set (5 technical, 6 deep technical, 4 managerial) against the library. **Eight of the fifteen were already covered** &mdash; Fiber internals, reducing initial load, large-scale codebase structure, dynamic theming, dashboard filter lag, accessibility/WCAG, tight-deadline delivery, and disagreeing with a designer. Seven were genuine gaps:

**Frontend Architecture** &mdash; three new questions:
- **Large data tables with real-time updates.** Two problems that fight each other, solved separately: virtualize both axes because the DOM is the cost, then decouple ingest rate from render rate and coalesce updates by row key. Plus the table-specific parts candidates miss &mdash; server-side sort/filter, what to do when a live update reorders rows the user is reading, cell-level rather than row-level subscriptions, and `aria-rowcount` so a screen-reader user hears the real total rather than "row 3 of 30".
- **Client-side caching, API retries and error boundaries** as one system. Retry only retryable failures (never a `400` &mdash; it fails identically forever), back off with jitter, and treat mutations differently from queries because a failed `POST` may have succeeded before the response was lost. Error boundaries per region, not one at the root &mdash; a root-only boundary turns any component error into a white screen.
- **Global state with multiple teams contributing.** The insight is that the biggest efficiency win isn't a faster store, it's having far less in it &mdash; server data belongs in a query cache, filters belong in the URL. Then slice ownership via CODEOWNERS, cross-team reads through exported selectors rather than raw state paths, and boundaries enforced by lint because conventions don't survive a deadline.

**React guide** &mdash; **debugging a memory leak.** The heap-snapshot workflow (snapshot &rarr; exercise &rarr; force GC &rarr; snapshot &rarr; compare), reading the **Retainers** panel to find what's holding a **Detached HTMLElement**, and the React-specific causes in order of likelihood &mdash; missing effect cleanup, inline listeners that can never be removed, unbounded arrays, closures in long-lived refs. Includes the things that *look* like leaks and aren't.

**Modern CSS** &mdash; **cross-browser and cross-device consistency.** Starts by rejecting the goal as stated: pixel-identical everywhere isn't achievable or worth the cost. Then `browserslist` as the actual specification, feature detection over browser detection, and the device axis as a separate problem &mdash; `100vh` on iOS, touch target sizes, `:hover` not existing on touch, safe-area insets, and low-end CPU as the biggest real inconsistency.

**Web Performance** &mdash; **explaining FCP, TTI and CLS to non-technical stakeholders.** A translation table (LCP is "when they see the thing they came for"), the three-promises framing that explains why a page can pass one metric and fail another, and why you show a throttled screen recording rather than a Lighthouse score.

**Behavioral** &mdash; new **§9.9 "Tell me about a time your release broke production."** The structure that works, with the emphasis on **rollback before root-cause** &mdash; describing yourself debugging while customers are affected is the wrong instinct. Plus the frontend-specific failure modes to have ready: cached `index.html` pointing at purged chunks, an engine-specific CSS change, a flag defaulting to on, a service worker serving a stale shell.

---

## v1.1.0 (September 2026)

The largest content release so far: **11 new guides** and a full 2026 freshness pass across the existing ones. **Total guides: 42 &rarr; 53.**

The theory guides were written in April&ndash;May 2026 and a lot had moved since &mdash; React 19.2 shipped new stable hooks, TypeScript's compiler was rewritten in Go, ES2026 landed Temporal, Node started running TypeScript directly, and the whole build toolchain went native. Every affected guide is now current. Alongside that, eleven guides fill the gaps the library never covered: there was no CSS guide at all, no accessibility guide, nothing on SQL, and `Dockerfile` appeared nowhere in 85,000 lines of content.

### New Guide &mdash; AI & LLM Engineering (Back End)

**Total guides: 42 &rarr; 43. Back End: 10 &rarr; 11.**

Written for the **application engineer** who has to ship an AI feature, not the ML engineer who trains models &mdash; no maths, no model training. The framing throughout is that an LLM is "a slow, expensive, non-deterministic network dependency that sometimes lies", and every design rule follows from taking that literally.

- **Fundamentals** &mdash; tokens (and why non-Latin scripts cost 2&ndash;3&times; more, why digits tokenize badly, why models can't do arithmetic), the context window as a shared input+output budget, temperature vs top-p, and why model tiering is the biggest cost lever you have
- **Cost and latency** &mdash; the two budgets, model routing, prompt caching and the prefix layout it requires, TTFT vs total completion time
- **Prompting as engineering** &mdash; roles, the escape hatch that prevents most "hallucination", why prompts are code (versioned, evaluated in CI, model pinned)
- **Structured output** &mdash; the three levels of rigour, schema constraints, and why you validate anyway
- **Streaming to the UI** &mdash; the `fetch` + `ReadableStream` pattern with full server and client code, cancellation propagation, chunk-boundary handling, partial-markdown rendering, mid-stream errors, buffering proxies
- **Tool calling and agents** &mdash; the loop, authorizing inside the tool against the session, and a straight answer on when *not* to build an agent
- **RAG** &mdash; chunking (where most RAG systems actually fail), hybrid search, reranking, grounding and citations, the RAG triad for diagnosis, and RAG vs fine-tuning vs long context
- **Evaluation** &mdash; golden sets, grading methods, LLM-as-judge and its biases, offline gates vs online metrics
- **Security** &mdash; prompt injection, the lethal trifecta, and why a rendered markdown image is an exfiltration channel
- **Production and architecture** &mdash; failure matrix, observability, caching layers, and a reference "chat with our docs" design

**14 interview Q&A + 8 tricky scenario questions + a 40-rule cheat sheet.**

### New Guide &mdash; Frontend Architecture at Scale (Front End)

The Platform UI / frontend architect interview round. The recurring theme is that almost every question here is an **organisational** question wearing a technical costume &mdash; monorepo vs multi-repo is about how teams coordinate, micro-frontends are about deployment independence rather than JavaScript.

- **Multi-product architecture** &mdash; the four layers (products &rarr; features &rarr; shared &rarr; foundation), why dependencies must point downward and how to enforce it mechanically, and the three genuinely different kinds of shared code (UI, business logic, feature packages &mdash; extract on the *third* use, not the second)
- **Monorepo vs multi-repo** &mdash; a five-question decision framework, an honest comparison table, the position that holds up in an interview, and the mandatory tooling (pnpm workspaces, Turborepo/Nx, remote caching, CODEOWNERS, boundary lint, Changesets). Plus the two clarifications candidates miss: "monorepo" &ne; "monolith", and a monorepo without enforced boundaries is a distributed monolith with extra steps
- **Micro-frontends** &mdash; what they actually buy (one thing: independent deployment by independently-owned teams), the six integration approaches compared, what really goes wrong (shared dependency skew, token skew, cross-remote state, error isolation, nobody owning the page), and a clear verdict on when *not* to
- **Design systems** &mdash; tokens as CSS custom properties, versioning, and the breaking-change rollout sequence that actually works (add &rarr; deprecate &rarr; **ship a codemod** &rarr; migrate the biggest consumer yourself &rarr; track remaining usages &rarr; remove)
- **The five caching layers** &mdash; data layer, service worker, browser HTTP, CDN, server &mdash; each with its invalidation story, plus "what breaks first?" and why you can't edge-cache personalised data
- **Real-time UI at thousands of events/sec** &mdash; the key insight that the transport isn't the bottleneck, React is; buffering, coalescing, virtualising, Web Workers, and why server-side aggregation *removes* the problem
- **Debugging the 1%** &mdash; segmentation before theorising, source maps, session replay, trace correlation, and why "I'd add monitoring" is the weak answer

**10 interview Q&A** (including the full Platform UI round-3 question set) **+ 5 tricky questions + a 49-rule cheat sheet.**

### New Guide &mdash; Next.js & React Server Components (Front End)

RSC changed the React mental model more than hooks did, and this is the highest-variance topic in modern React interviews.

- **The RSC mental model** &mdash; starting with the distinction everything else depends on: **RSC is not SSR.** SSR ships your component code to the browser to hydrate; Server Component code never reaches the browser at all
- **The client boundary** &mdash; `'use client'` as an *entry point to the client graph* (not a single component), pushing the boundary down, the serialisation rules, and the security consequence: every prop is serialised into the payload the browser downloads
- **App Router** &mdash; file conventions, layout vs template, route groups, parallel and intercepting routes, and the async `params`/`cookies()`/`headers()` change
- **Rendering strategies** &mdash; CSR/SSR/SSG/ISR/streaming/RSC/PPR compared, with Partial Pre-rendering explained properly
- **The caching model** &mdash; the history (13&ndash;14 cached by default &rarr; 15 stopped &rarr; 16 opt-in only), Cache Components and `"use cache"`, and the three invalidation APIs with genuinely different semantics (`revalidateTag` = eventual consistency, `updateTag` = read-your-writes, `refresh` = uncached data)
- **Server Actions** &mdash; and the thing to say unprompted: **a Server Action is a public HTTP endpoint**
- **Authentication, defence in depth** &mdash; grounded in the real CVE history (CVE-2025-29927, CVE-2026-45109, CVE-2026-64642) that shows why the request-interception layer can't be your authorization boundary, and why a Data Access Layer can
- **Next.js 16** &mdash; everything that changed, including the breaking changes that bite on upgrade
- **When *not* to use it** &mdash; a straight answer, which is what separates having used it from having adopted it

**8 interview Q&A + 4 tricky questions + a 52-rule cheat sheet.**

### New Guide &mdash; Modern CSS (Front End)

There was no CSS guide at all &mdash; only a Flexbox/Grid cheat sheet. CSS questions have got *harder* as the platform absorbed what we used preprocessors and JavaScript for.

- **The cascade, specificity and inheritance** &mdash; still the single most-asked area. Specificity as a tuple compared column by column, why `!important` isn't specificity, and the `:is()` / `:where()` distinction
- **Cascade layers** &mdash; the feature that solves what BEM, ITCSS and `!important` were all reaching for, including the surprising rule that unlayered styles beat all layered styles
- **Nesting and `@scope`** &mdash; donut scope with a lower boundary, and an honest answer to "so what replaced BEM?"
- **Layout** &mdash; Flexbox vs Grid, `flex: 1` vs `flex: auto`, subgrid, and the `min-width: auto` overflow bug in all four of its costumes
- **Container queries** &mdash; why they make a component genuinely portable, and the gotchas (you can't query the element you're styling)
- **`:has()`** and the modern selectors, including `:nth-child(n of S)`
- **`@property`** &mdash; why untyped custom properties can't animate, and what registering a type unlocks
- **OKLCH and `color-mix()`** &mdash; why HSL isn't perceptually uniform, and why `color-mix()` beats Sass's `darken()`
- **Fluid sizing** &mdash; `clamp()` (and the WCAG rule about pure `vw`), the `dvh`/`svh`/`lvh` family, logical properties
- **Stacking contexts and containing blocks** &mdash; the single most common "why is my CSS doing that?" category, with the ancestor-chain diagnostic
- **Anchor positioning, `popover`, `<dialog>`** &mdash; deleting a category of JavaScript
- **View transitions**, motion and `prefers-reduced-motion`, styling architecture in 2026, and performance

**8 interview Q&A + 6 tricky questions + a 64-rule cheat sheet.**

### New Guide &mdash; Accessibility (Front End)

Accessibility stopped being optional in June 2025, when the **European Accessibility Act** became enforceable. It's now a standard part of frontend interviews.

- **The legal landscape** &mdash; EAA, ADA Titles II & III, EN 301 549, and why accessibility overlays lose in court
- **POUR and the WCAG structure**, plus the criterion numbers that come up by number in audits
- **WCAG 2.2** &mdash; all nine new criteria with levels, and the three that change how you build: target size (24&times;24), dragging movements, and accessible authentication &mdash; **blocking paste in an OTP field is a failure**
- **Semantic HTML first** &mdash; and the five rules of ARIA, with the naming priority order and why a broken `aria-labelledby` yields an *empty* name rather than falling through
- **Keyboard and focus** &mdash; roving tabindex for composite widgets, `:focus-visible`, and a table of where focus should go on every state change
- **The accessibility tree** &mdash; what actually removes an element from it, and the `.sr-only` implementation that works
- **Forms, colour and contrast, live regions** &mdash; including the rule that makes live regions work at all (the empty region must exist *before* you write to it)
- **Component patterns** &mdash; modal, tabs, accordion, combobox, toast, table, and the `role="menu"` distinction interviewers love
- **Accessibility in React** and **testing** &mdash; with the number that matters: automated tools catch only ~30&ndash;40%

**8 interview Q&A + 5 tricky questions + a 65-rule cheat sheet.**

### New Guide &mdash; Web Security (Back End)

- **A threat model** &mdash; almost every web vulnerability is confused *identity*, confused *data/code*, or confused *trust*, and the defence follows from which
- **XSS** &mdash; the three types (and why DOM-based defeats server-side defences), contextual output encoding, the `javascript:` URL bug React doesn't catch, and why you sanitise on output with DOMPurify rather than a regex
- **CSP and Trusted Types** &mdash; why host allowlists are obsolete, the nonce + `strict-dynamic` policy, deploying in report-only, and why Trusted Types is the *structural* fix for DOM XSS
- **CSRF** &mdash; why `SameSite` is necessary but not sufficient, and the honest answer about token-based APIs
- **Tokens and sessions** &mdash; the storage question answered by refusing the premise, the BFF pattern, the `__Host-` cookie prefix, refresh rotation with reuse detection, and IDOR
- **Supply chain** &mdash; the attack shapes, and the controls that actually contain them (`--ignore-scripts`, provenance, separated CI privileges)
- **Injection beyond XSS** &mdash; SQL, NoSQL, command, SSRF, path traversal, prototype pollution, ReDoS, open redirect, mass assignment
- **Secrets, authentication hardening**, and a full security-headers reference

**8 interview Q&A + 4 tricky questions + a 58-rule cheat sheet.**

### New Guide &mdash; SQL & Relational Databases (Back End)

The biggest remaining gap: the Database Schema guide was mostly MongoDB, so there was no coverage of joins, indexes, query plans, transactions or isolation &mdash; the things asked in nearly every backend and full-stack loop.

- **Query semantics** &mdash; the logical order of evaluation (which explains most SQL confusion), `WHERE` vs `HAVING`, and why `NULL` is *unknown* rather than a value
- **JOINs** &mdash; including the two most common bugs in production SQL: a `LEFT JOIN` silently becoming an `INNER JOIN` when you filter a right-hand column in `WHERE`, and **row multiplication** when two one-to-many joins hit the same parent and quietly break every aggregate
- **Window functions** &mdash; the highest-value SQL feature most candidates don't know exists, with the canonical "latest row per group" solution
- **Indexes** &mdash; the B-tree model, the **leftmost-prefix rule** (an index on `(a,b,c)` cannot serve `WHERE b = 2`), covering indexes and index-only scans, partial and expression indexes, and the **non-sargable predicates** that silently defeat an index
- **Reading a query plan** &mdash; `EXPLAIN (ANALYZE, BUFFERS)`, and the single most useful diagnostic: comparing *estimated* to *actual* rows, because a bad estimate is the root cause and the plan shape is only the symptom
- **Transactions and isolation** &mdash; all four anomalies, why the defaults differ between Postgres and MySQL, and **write skew** explained properly (two transactions read a set, decide independently, write different rows, and break an invariant neither would have broken alone)
- **Locking and deadlocks** &mdash; the consistent-lock-ordering fix, and why deadlocks are retryable
- **The N+1 problem** &mdash; why it never shows up in a slow-query log, three fixes, and the query-count budget assertion that prevents it permanently
- **Migrations and scaling** &mdash; expand/contract for zero-downtime schema changes, and the scaling order most teams get backwards

**8 interview Q&A + 4 tricky questions + a 63-rule cheat sheet.**

### New Guide &mdash; Docker, Kubernetes & CI/CD (Back End)

`Dockerfile` previously had **zero** mentions anywhere in the library.

- **Container fundamentals** &mdash; namespaces, cgroups and union filesystems; why isolation is weaker than a VM; and the two facts that drive every Dockerfile optimisation (layers are cached, and layers are **additive** so deleting a file doesn't shrink the image)
- **Writing a Dockerfile** &mdash; the canonical multi-stage Node build with every line justified, the frontend/nginx variant, and **signals and PID 1** (shell-form `CMD` means your process never receives `SIGTERM`, so every deploy drops in-flight requests)
- **Image size and security** &mdash; base image trade-offs including the Alpine/musl caveat, distroless, `.dockerignore`, and BuildKit secret mounts
- **Compose** &mdash; and the three details that are the actual interview content, including why `depends_on` alone doesn't wait for readiness
- **Kubernetes** &mdash; declarative reconciliation as the organising idea, the object model, and how traffic actually finds a pod
- **The three probes** &mdash; readiness answers "route to me?", liveness answers "restart me?" &mdash; and the classic mistake of checking a dependency in the liveness probe, which turns a 20-second database blip into a ten-minute self-inflicted outage
- **Requests vs limits** &mdash; and why CPU throttles while memory gets OOMKilled
- **CI/CD** &mdash; build once and promote the same artefact, a real GitHub Actions workflow with the details that are usually missing (OIDC instead of stored keys, pinned actions, explicit permissions), and why speed is a correctness feature
- **Deployment strategies** &mdash; rolling, blue-green, canary; feature flags decoupling deploy from release; and why the database is always the real constraint
- **When *not* to use Kubernetes**

**8 interview Q&A + 3 tricky questions + a 58-rule cheat sheet.**

### New Guide &mdash; Web Performance & Core Web Vitals (Front End)

- **The metrics** &mdash; LCP, INP and CLS with their thresholds, why **INP replaced FID** in 2024, and the diagnostic metrics that tell you *where* the problem is
- **Decomposition** &mdash; the single most useful skill here: LCP splits into TTFB + load delay + load time + render delay, and INP splits into input delay + processing + presentation. Each part has a completely different fix, and teams routinely compress an image when their problem was a slow server
- **Lab vs field** &mdash; field data tells you *what* to fix, lab data helps you *fix* it; why Lighthouse structurally cannot measure INP; and how to set up RUM that's actually useful (attribution, segmentation, percentiles)
- **The loading pipeline** &mdash; what blocks parsing versus what blocks rendering, and the **preload scanner** (which explains why a CSS background image or a JS-inserted hero is a bad LCP element)
- **Resource hints** &mdash; and how each one backfires when misused
- **Images and fonts** &mdash; the two biggest wins, including why `font-display: swap` fixes one problem and causes another
- **JavaScript** &mdash; why you pay for it three times, third-party scripts as usually the biggest cost, and the cost of hydration
- **INP and the main thread**, **layout stability**, and **budgets in CI** that survive contact with a real team

**8 interview Q&A + 4 tricky questions + a 57-rule cheat sheet.**

### New Guide &mdash; Testing Strategy & E2E (Front End)

The Jest & RTL guide covers *how* to write a test. This covers everything after that.

- **The shape of a suite** &mdash; pyramid vs trophy, what they actually agree on, and the ice-cream-cone anti-pattern
- **What to test at each level** &mdash; with the heuristic that settles most arguments: test at the lowest level that can catch the bug
- **Vitest vs Jest**, and why jsdom is not a browser
- **Mocking** &mdash; mock at the **network boundary**, not at your own module boundaries, and why mocking your own modules tests your code against your assumptions about your own code
- **Playwright** &mdash; auto-waiting and web-first assertions, locator priority (which doubles as an accessibility smoke test), `storageState` for auth, network stubbing, and the trace viewer
- **Flake** &mdash; treated as the real enemy, because a flaky test trains the team to ignore red. The full cause/fix table and a quarantine policy that works
- **Visual regression, accessibility testing and contract testing** &mdash; including the gap that causes "all tests green, production broken"
- **Coverage** &mdash; why 100% is the wrong goal, and what to measure instead

**7 interview Q&A + 3 tricky questions + a 51-rule cheat sheet.**

### New Guide &mdash; Low-Level Design & OOD (System Design)

The "design a parking lot" round, which has no LeetCode equivalent and rewards a method rather than a memorised answer.

- **What's actually being tested** &mdash; and the key insight: **the mid-interview requirement change is the exam.** A design where "now support electric vehicles" means adding a class passes; one where it means editing five `if` chains does not
- **The method** &mdash; clarify (the highest-value two minutes) &rarr; find the nouns &rarr; assign responsibilities &rarr; define interfaces at the axes of variation &rarr; sketch &rarr; walk a scenario and attack your own design
- **SOLID, usefully** &mdash; what each principle actually buys you, with the smell that identifies each violation
- **Composition over inheritance**, including the Liskov test and why most LSP violations are really mutability problems
- **Four worked designs**: **parking lot** (with a table showing how each requirement change becomes "add a class"), **rate limiter** (all five algorithms compared, and why token bucket usually wins), **elevator** (the SCAN algorithm and two-sorted-sets model), **vending machine** (the State pattern making illegal transitions inexpressible)
- **Concurrency in LLD** &mdash; including the JavaScript-specific point that races live across `await` boundaries rather than between threads
- **The eleven common mistakes**

**5 interview Q&A + 3 tricky questions + a 44-rule cheat sheet.**

### AI & LLM Engineering &mdash; MCP, Frameworks and Multi-Agent

Major expansion of the guide added last release.

- **MCP (Model Context Protocol)** &mdash; the N&times;M problem it solves, the three primitives and *who decides to use them* (tools = the model, resources = the host, prompts = the user), both transports, the 2026-07-28 spec's move to a **stateless** core and why that matters operationally, a minimal server, the security story (tool poisoning, the confused deputy), and when MCP is over-engineering
- **Multi-agent patterns** &mdash; opening with the counter-evidence, because it's the strongest thing you can say: a single agent matches or beats multi-agent on ~64% of benchmarked tasks. Then the six topologies compared, why orchestrator-worker is the default, and what actually breaks (context loss compounding at every handoff)
- **Frameworks** &mdash; LangChain and LangGraph are not competitors (`create_agent` runs *on* the LangGraph runtime), "LangChain for linear, LangGraph for cyclic", what LangGraph actually buys you (durable execution, HITL interrupts, typed state, time-travel replay), and when the provider SDK is the right answer
- **Beyond naive RAG** &mdash; query rewriting and decomposition, contextual retrieval, agentic RAG, GraphRAG, multimodal &mdash; each framed as fixing a *specific* failure, with an ordered list of what to try first

**4 more interview Q&A + 2 more tricky questions**, and the cheat sheet grew to 50 rules.

### React Guide &mdash; React 19.2 and the Compiler, Brought Current

The React 19 section stopped at `useOptimistic` and described the compiler in a single sentence. It now covers what actually shipped.

- **`<Activity />`** &mdash; the boundary that **preserves state while destroying effects**, which is the combination neither conditional rendering (loses state) nor `display: none` (keeps timers and subscriptions running) could express. Includes the comparison table, the pre-rendering use case, and the traps: a hidden activity still re-renders on new props at low priority, hiding uses `display: none`, and effect cleanup becomes load-bearing rather than good practice
- **`useEffectEvent`** &mdash; the fix for "I need the latest value but don't want the effect to re-run". Walks the chat-room example, explains why `useCallback` gives stability *or* freshness but never both, and covers the restriction that effect events may only be called from inside effects
- **React Compiler 1.0** &mdash; rewritten from a stub. How the HIR and data-flow analysis produce finer-grained memoization than hand-written `useMemo`, the purity and immutability rules it depends on, and the critical failure mode: it **bails out silently** on components that violate the rules, so adoption is a linting project first
- **React 19.2's rendering changes** &mdash; Partial Pre-rendering (`prerender` + `resume`), batched Suspense reveals in SSR, `cacheSignal`, Performance Tracks in Chrome DevTools, the `useId` prefix change
- **Where React actually is** &mdash; a status table, including the correction that `<ViewTransition>` and Fragment Refs are **still Canary-only** despite a great deal of 2026 writing treating them as shipped

**4 new interview Q&A + 4 new tricky questions** (React tricky total: 22 &rarr; 26).

### React Guide &mdash; The Fundamentals Checklist

Filled the gaps against a comprehensive React interview question list. New sections: **Higher-Order Components**, **Presentational vs Container** (including why the original prescription was walked back), **Flux and one-way data flow** (why it matters, not just the diagram), **Portals** (what follows the React tree vs the DOM tree), **Fragments and Node vs Element vs Component**, **StrictMode**, **internationalisation**, and **event delegation and the synthetic event system**.

Plus a **Rapid-Fire Fundamentals** round of **12 new Q&A**: Node vs Element vs Component, why never to mutate state, Context pitfalls and reducing Context re-renders, resetting state with `key`, hydration mismatches, testing strategy, data-fetching pitfalls, `forwardRef` in React 19, `useReducer` vs `useState`, `useId`, what re-rendering actually means, and how to debug a React app.

### TypeScript Guide &mdash; The Go Compiler, and Inference Control

- **TypeScript 6.0 and 7.0** &mdash; the compiler was rewritten in Go and shipped stable on 8 July 2026, 8&ndash;12&times; faster. Covers why Go (native speed, real structs, shared-memory parallelism that Node's worker model cannot do), the two-track release plan, and the upgrade caveat that matters: the programmatic API is not stable in 7.0, so Vue/Svelte/Astro/MDX tooling stays on 6.0
- **Modern compiler flags** &mdash; `erasableSyntaxOnly`, `verbatimModuleSyntax`, `isolatedDeclarations`, `noUncheckedIndexedAccess`, `module: preserve`, with the reasoning behind each rather than a list
- **Controlling inference** &mdash; `const` type parameters (and how they differ from `as const` and `satisfies`), `NoInfer<T>`, and inferred type predicates with the trap that an explicit `: boolean` return type silently defeats the narrowing

**4 new interview Q&A + 3 new tricky questions** (TypeScript tricky total: 16 &rarr; 19).

### JavaScript Guide &mdash; ES2024, ES2025, ES2026

Section 9 stopped at ES2023. It is now "ES6+ and Modern JavaScript" and runs through ES2026, with a table showing which edition shipped what so you can tell what needs a polyfill.

- **Temporal** &mdash; the `Date` replacement, with the full type table and the point interviewers actually test: picking the right type encodes a business decision. A hotel check-in is a `PlainDate`; a meeting is a `ZonedDateTime`; a recurring 9 a.m. standup is a `PlainTime` and storing it as a UTC instant is the bug that makes it drift twice a year
- **Explicit resource management** &mdash; `using` and `await using`, reverse disposal order, `DisposableStack`
- **Iterator helpers** &mdash; lazy `map`/`filter`/`take` on any iterator, why they beat array chains on large data, and the single-use gotcha
- **Grouping and Set methods** &mdash; `Object.groupBy` vs `Map.groupBy` (key stringification, `null` prototype), and the seven new `Set` methods
- **Smaller additions** &mdash; `Promise.withResolvers`, `Array.fromAsync`, `Promise.try`, `Error.isError`, `RegExp.escape`, `Object.hasOwn`, class static blocks, private brand checks, import attributes

**4 new interview Q&A + 5 new tricky questions** (JavaScript tricky total: 11 &rarr; 16).

### JavaScript Guide &mdash; Async Patterns and Global Error Handling

Filled the gaps against a "20 JavaScript questions for frontend developers" list. New sections:

- **Mixing `async`/`await` with `.then()`/`.catch()`** &mdash; the forgotten `await` that escapes your `try`/`catch`, why `.catch()` returning a value turns a rejection into a silently-wrong resolution, where `.then()` is genuinely better, and the `return await` vs `return` distinction inside a `try`
- **Top-level `await`** &mdash; how it makes a module an *async module*, the three genuinely useful patterns, and why `require()` of such a module throws even on Node 24
- **Retrying, cancelling and bounding async work** &mdash; exponential back-off with **jitter** (and why jitter isn't optional), `AbortController` and `AbortSignal.timeout`, and a bounded-concurrency pool
- **Global error handling** &mdash; "error boundaries" outside React: the four browser hooks, why `error` and `unhandledrejection` are separate events, why resource-load failures need the capture phase, why cross-origin scripts give you a useless `"Script error."`, and how this relates to React error boundaries
- **Testing async code without a framework** &mdash; `node:test` and `assert.rejects`, plus the techniques that make async tests reliable

### Node.js Guide &mdash; Node 24 LTS and Node 26

- **A release table** for Node 22 / 24 / 26 with what each one changed, plus the note that Node 26 is the last release on the six-month schedule before annual releases begin
- **`require(esm)`** &mdash; the dual-package nightmare is over, with the two limits: it fails on top-level `await`, and the default export arrives on `.default`
- **Running TypeScript with no build step** &mdash; `node app.ts`, and the crucial point that it **strips types without checking them**, so `tsc --noEmit` is still mandatory and only erasable syntax is allowed
- **Built-ins that removed dependencies** &mdash; `node:sqlite`, the global `WebSocket` client (client only, not a server), `node --run`, the permission model as a supply-chain answer, and `Temporal` as a global in Node 26

**2 new interview Q&A + 2 new tricky questions** (Node tricky total: 12 &rarr; 14).

### Frontend Tooling Guide &mdash; The 2026 Toolchain

A new section on where the toolchain landed, because 2025&ndash;26 was the year every layer got a native rewrite and then started consolidating.

- **Vite 8 and Rolldown** &mdash; Vite used to run esbuild in dev and Rollup in production, which meant two module graphs and the "works in dev, breaks in build" bug class. Vite 8 ships Rolldown as the single bundler for both, 10&ndash;30&times; faster, and unlocks full bundle mode in dev, persistent caching and Module Federation
- **Turbopack** &mdash; Next.js 16 removed webpack as the default, and why both ecosystems reached the same conclusion independently
- **Linting** &mdash; ESLint 10 removed `eslintrc` entirely, plus an honest comparison of ESLint + typescript-eslint vs oxlint vs Biome, including which job each one is actually built for
- **What to actually pick** &mdash; a decision list, and the framing that matters more than the versions

**3 new interview Q&A.**

### Behavioral Guide &mdash; The AI-Assisted Interview

The biggest change to technical hiring in a decade, and it is a behavioural change as much as a technical one. New section covering:

- **What changed and why** &mdash; and a table of what Google, Meta, Canva and Anthropic actually do, including that several now grade "AI fluency, prompt engineering and output validation" explicitly
- **What is being graded** &mdash; direction versus passive acceptance, verification (the highest-weighted signal at most companies), requirement clarification, and communicating while your attention is split between the model and the interviewer
- **A practical playbook** &mdash; clarify before prompting, state which parts you'll delegate and why, prompt like a specification rather than a question, verify actively, push back when the model is wrong, keep narrating
- **Anti-patterns that fail the round** &mdash; paste-and-pray, not reading the generated code, delegating the design decisions, going silent, and assuming AI is allowed without checking
- **Behavioural questions about AI use** &mdash; model answers for "how do you use AI?", "tell me about a time it led you astray", "how do you review AI-generated code?", "how do juniors still learn?", "has it changed your estimates?"
- **What got harder** &mdash; when everyone's code compiles, differentiation moves to architecture, debugging, code review and communication, which changes what's worth practising

**3 new interview Q&A.**

### Rewritten Introduction

The home page now opens with **"The 20 Topics That Actually Come Up"** &mdash; a prioritised roadmap across JavaScript core, React mastery, performance and essential concepts, each linking to where it's covered. Followed by a full, current map of every guide grouped by theme, the interactive tools, and three study plans depending on whether you're interviewing in a week, a month, or just levelling up.

### Totals

**53 guides** across 8 categories. **30 guides** now have "Guess the Output" tricky-question sections, **261 questions** in total &mdash; up 65 this release.

---

---

## v1.0.9 (May 2026)

### Single Number II &mdash; the XOR Follow-up

Added a new Medium challenge that complements **Single Number** (75 &rarr; **76** JS challenges). When every element appears THREE times except one, the classic XOR trick breaks &mdash; XOR is addition mod 2 per bit, so triples leave bits set just like singletons. The fix is **bit-counting mod 3**: for each of the 32 bit positions, count how many numbers have that bit set, take mod 3, reassemble. Two approaches shown: the clear-to-explain 32-pass version and the elegant two-bit state-machine (`ones = (ones ^ x) & ~twos`; `twos = (twos ^ x) & ~ones`) that does it in a single pass.

The original Single Number explanation now also flags this constraint up front &mdash; XOR works ONLY for "exactly twice", and the moment the problem shifts to triples (or any K), you need bit-counting mod K.

### New Theory Guides &mdash; OAuth & SSO, Microservices, Frontend System Design

Three substantial new guides fill long-requested theory gaps. **Total guides: 39 &rarr; 42.**

**OAuth & SSO (Back End)** &mdash; a comprehensive walkthrough of OAuth 2.0, OpenID Connect, SSO, and SAML. Covers all four grant types (Authorization Code, Client Credentials, Implicit-deprecated, ROPC-deprecated), PKCE for mobile/SPA, JWT anatomy and validation, refresh token rotation with theft detection, browser token storage strategies (the BFF pattern recommendation), logout complexity across federated apps, security pitfalls, and Node + SPA implementation recipes using `openid-client` and `msal.js`. **12 interview Q&A + 8 tricky scenario Qs.**

**Microservices (Back End)** &mdash; engineering view of microservices, not the marketing one. Covers when to choose them and when NOT to, the "modular monolith" middle path, service-boundary design (bounded contexts, data ownership), sync vs async communication, API gateway and BFF patterns, service discovery (DNS / client-side / mesh), distributed transactions and the saga pattern (choreography vs orchestration), the outbox pattern for at-least-once event publishing, resilience patterns (circuit breakers, retries with jitter, timeouts), observability (logs, metrics, traces with OpenTelemetry), auth across services, deployment strategies (blue-green, canary, feature flags), the distributed-monolith anti-pattern, and a realistic incremental migration playbook. **12 interview Q&A + 8 tricky scenario Qs.**

**Frontend System Design (System Design)** &mdash; the question style you get in Senior/Staff frontend interviews. Starts with the framework: how to clarify, the architecture pieces, state-management trade-offs (server vs client vs URL state), data fetching, real-time transports, performance/caching, accessibility. Then applies it to seven canonical designs:
- **Netflix** &mdash; video player with adaptive bitrate streaming (HLS/DASH), DRM, hover previews, row virtualization
- **Twitter/Facebook Feed** &mdash; virtualized infinite scroll, cursor pagination, optimistic UI, "3 new tweets" pill
- **Zoom/Google Meet** &mdash; WebRTC with SFU vs mesh topology, simulcast, bandwidth adaptation, echo cancellation
- **WhatsApp-style Chat** &mdash; WebSocket + IndexedDB local-first, offline outbox, read receipts, push notifications
- **Streaming Under Poor Network** &mdash; the ABR algorithm explained, buffer management, Network Information API, audio-first fallback
- **Reusable Tabs Component (HLD)** &mdash; compound components, ARIA, keyboard nav, controlled/uncontrolled, lazy panels

**8 interview Q&A + 8 tricky scenario Qs** covering server-state-vs-Redux, GraphQL pitfalls, SSR migration, real-time presence at scale.

### Polyfills &mdash; Detailed Line-by-Line Walkthroughs

Every polyfill's Explain modal now walks through the implementation **one line at a time**, with deeper annotations on the canonical ones (`Array.map`, `Array.filter`, `Array.reduce`, `Function.bind`, `Promise.all`). Each explanation now opens with a generalized "how to write a polyfill" mental model &mdash; the four parts (validate inputs, walk the data, apply the callback with canonical signature, return the right shape) &mdash; so the technique transfers to any built-in. Line annotations point out the subtle correctness details: the sparse-array `i in this` check, why `new Array(n)` is faster than `push`, the `arguments.length < 2` detection in reduce, the Promise.all closure-index trick that preserves order despite async ordering.

### 14 More String + Array Challenges + Easy-First Default Sort

The playground gained 14 new JS Coding Challenges (50 &rarr; **64**). The set covers common gaps in string parsing, in-place array tricks, bit manipulation, and one classic binary-search variant:

**Mirrors of existing challenges:**
- **Rotate Array Left** &mdash; same three-reversal trick as Rotate Array (right) with the order flipped
- **Reverse Words in a String** &mdash; uses the reverse pattern twice (whole string then each word)

**Strings:**
- **Longest Common Prefix** &mdash; vertical scan
- **Longest Palindromic Substring** &mdash; expand around center
- **Reverse Vowels of a String** &mdash; two-pointer
- **String to Integer (atoi)** &mdash; whitespace, sign, INT32 overflow clamping
- **Letter Combinations of Phone Number** &mdash; backtracking

**Arrays:**
- **Single Number** &mdash; XOR identity
- **Majority Element** &mdash; Boyer&ndash;Moore voting
- **Product of Array Except Self** &mdash; two-pass left/right product trick, no division
- **Plus One** &mdash; digit-array carry walk
- **Subarray Sum Equals K** &mdash; prefix sum + hash map
- **Search in Rotated Sorted Array** &mdash; binary search where one half is always sorted
- **Spiral Matrix** &mdash; four-boundary directional traversal

**Default sort is now Easy &rarr; Medium &rarr; Hard.** When "All" difficulty is selected, the cards order themselves by difficulty within each category so you start with the warmups and ramp up. Other filter selections preserve insertion order.

### Coding Challenges Now Tagged by Algorithmic Pattern

Every JS Coding Challenge is now tagged with the algorithmic pattern(s) it demonstrates &mdash; so studying one challenge teaches you the pattern for every other challenge that shares the tag. **Reverse String** and **Valid Palindrome** both use the **Two Pointer** pattern; learn it once on Reverse String, you've learned it for both.

Each template card now shows its pattern tags below the name. A new **Pattern filter** row in the templates modal (challenges tab) lets you narrow the list to only challenges that use a specific pattern. Clicking **Two Pointer** surfaces 10 challenges all using the same converging-pointer technique:

- Reverse String &middot; Valid Palindrome &middot; Container With Most Water &middot; 3Sum &middot; Trapping Rain Water &middot; Move Zeros &middot; Rotate Array &middot; Sort Colors &middot; Detect Cycle in Linked List &middot; Merge Two Sorted Lists &middot; Merge Sorted Arrays

The 14 patterns are organized into 5 super-categories &mdash; no long horizontal-scrolling row, just five short labeled rows that fit any screen:

- **Linear scans:** Two Pointer · Sliding Window · In-Place
- **Lookup:** Hash Map / Set · Stack
- **Recursive:** Recursion / D&amp;C · Backtracking
- **Optimization:** Dynamic Programming · Greedy · Binary Search
- **Data + Misc:** Sorting · Linked List · Closure / State · Math / Bit

Each chip shows its challenge count, so you can see at a glance which patterns are most-asked.

Distribution highlights:
- **Hash Map / Set** &mdash; 11 challenges (Two Sum, Find Duplicates, EventEmitter, LRU, Memoize, etc.)
- **Two Pointer** &mdash; 10 challenges
- **Recursion / D&amp;C** &mdash; 9 (Quick Sort, Merge Sort, Flatten Array, Deep Clone, Compose &amp; Pipe, Subsets, Permutations, Generate Parentheses, Sum Curry)
- **Closure / State** &mdash; 6 (Debounce, Throttle, Memoize, EventEmitter, Compose &amp; Pipe, Sum Curry)
- **Sorting** &mdash; 6 (Bubble/Quick/Merge Sort plus Group Anagrams, Anagram Check, Top K Frequent)
- **Dynamic Programming** &mdash; 5 (Climbing Stairs, House Robber, Coin Change, Maximum Subarray, Max Profit)

A challenge can have multiple patterns (Quick Sort is both **Sorting** and **Recursion / D&amp;C**; Longest Substring is both **Sliding Window** and **Hash Map / Set**). The intent is that the patterns reflect what techniques you actually need to know to solve the challenge.

### Every Coding Challenge Now Has 2+ Approaches with Elaborate Teaching

Big quality upgrade across all 35 algorithm explanations. Every challenge in the Explain modal now shows **at least two approaches** &mdash; the canonical "best" answer plus an alternative or baseline &mdash; with multi-paragraph intuitions that walk you through the algorithm rather than just stating it.

A representative sample of new second approaches now shipped:

- **Reverse String** &mdash; built-in chain (split &rarr; reverse &rarr; join) alongside the canonical two-pointer
- **Valid Palindrome** &mdash; regex-based strip-and-compare with the regex `/[^a-z0-9]/gi` broken down piece by piece (`[^...]` negation, `a-z` and `0-9` ranges, `g`/`i` flag meanings)
- **FizzBuzz** &mdash; string concatenation with the elegant `s || String(i)` falsy-empty-string trick
- **Max Profit** &mdash; brute-force baseline showing the path to the O(n) one-pass insight
- **Valid Parentheses** &mdash; the cute "replace inner pairs" alternative (O(n&sup2;) but a beautiful constructive proof)
- **Quick Sort** &mdash; three-way partition (Dutch National Flag) for duplicate-heavy inputs
- **Merge Sort** &mdash; bottom-up iterative variant that avoids recursion stack overhead
- **Find Missing Number** &mdash; XOR identity (`a ^ a = 0`) for overflow safety
- **LRU Cache** &mdash; the textbook DLL+Map version alongside the JS Map insertion-order trick
- **Memoize** &mdash; WeakMap variant for object-keyed caches with automatic GC
- **Deep Clone** &mdash; quick `JSON.parse(JSON.stringify())` baseline with all the things it loses (Date, undefined, functions, cycles)
- **Throttle** &mdash; trailing-edge variant that captures the LAST args (vs leading-edge that captures the first)
- **Compose &amp; Pipe** &mdash; async pipe that awaits each step
- **Binary Search** &mdash; recursive variant with the JS-tail-call-not-eliminated caveat
- **Climbing Stairs** &mdash; memoized top-down recursion alongside the O(1) bottom-up

When regex appears in any approach, the regex itself is now explained piece by piece &mdash; what each character class means, what each flag does, why the pattern was chosen.

### New JS & TS Guide &mdash; Regex

A complete, interview-grade Regex guide now lives under JS &amp; TS. Roughly 1,100 lines covering:

- **What regex is** (and emphatically isn't &mdash; HTML, JSON, RFC 5322 emails)
- **The two creation forms** (literal vs constructor) and the double-escape gotcha
- **All 8 flags** &mdash; `g i m s u y d v` &mdash; what each does and when to use it
- **Character classes**, **anchors**, **word boundaries**
- **Greedy vs lazy quantifiers** with a tag-extraction example
- **Groups, captures, named captures, backreferences**
- **All 4 lookarounds** with worked examples (the strong-password regex with stacked positive lookaheads)
- **Unicode handling** &mdash; the `u` flag, `\p{Letter}`, surrogate-pair gotchas with emoji
- **Full JS API** &mdash; test, exec, match, matchAll, replace, replaceAll, search, split &mdash; with the differences between them
- **The `lastIndex` gotcha** &mdash; the #1 source of regex bugs in JS, with three fixes
- **Catastrophic backtracking and ReDoS** &mdash; what makes a regex hangable, why `(a+)+` is dangerous, how to avoid it
- **Commonly used patterns** &mdash; email, URL, phone, IPv4, ISO date, time, HEX color, strong password, username, UUID v4, credit card, slug, whitespace, markdown, HTML
- **Real-world use cases** &mdash; form validation, slug generation, search highlighting, query string parsing, sensitive-data masking, URL extraction, HTML stripping, camelCase&harr;kebab-case, template token replacement
- **Anti-patterns** &mdash; what regex should never be used for
- **Full cheat sheet**
- **8 interview Qs** + **8 tricky Qs** including the `lastIndex` bug, the catastrophic-backtracking pattern, the split-with-capture-group surprise, and the HTML-escape-order subtlety

Total guides: 38 &rarr; **39**. JS &amp; TS section: 3 &rarr; **4**.

### Polyfill Cross-Links in Explain Modal + 7 New Polyfills

The Explain modal now shows you which built-in JavaScript methods each algorithmic approach actually leans on &mdash; with **clickable chips that open the corresponding polyfill template**. Curious how `Array.prototype.reduce` or `JSON.parse` is implemented under the hood? Click the chip in the Flatten Array or Deep Clone explanation, and the polyfill opens in the editor instantly.

Tagged so far:
- **Flatten Array** &rarr; reduce, concat, flat
- **Group Anagrams** &rarr; sort, join
- **Rotate Array** &rarr; reverse, slice, concat
- **Anagram Check** &rarr; sort, join
- **Deep Clone** &rarr; JSON.stringify, JSON.parse
- **Compose &amp; Pipe** &rarr; reduce

**7 new JS polyfills** added to fill commonly-asked gaps in interview prep:

- **JSON.parse** &mdash; full recursive-descent parser, pairing with the existing `JSON.stringify` polyfill
- **Array.isArray** &mdash; including the iframe-cross-realm gotcha that breaks `instanceof Array`
- **Object.create** &mdash; the classic 4-line implementation, descriptors variant, and the null-prototype use case for "true map" objects
- **Object.freeze + deepFreeze** &mdash; shallow native freeze, recursive deep freeze, plus a `WeakSet`-based cycle-safe variant
- **Array.prototype.fill** &mdash; with the shared-reference gotcha (`new Array(3).fill([])` makes three slots pointing to the SAME array)
- **String.prototype.repeat** &mdash; the O(log n) bit-shifting doubling trick, plus the naive baseline
- **Array.prototype.join** &mdash; with `null`/`undefined`/sparse-hole handling

Polyfill count: 24 &rarr; **31**.

### Playground — Auto-Save, Status Tracking, 15 New Challenges, Word Wrap

The biggest playground update yet. Five things shipped together.

**1. Your code is auto-saved per challenge.** Type anything in the editor and it's quietly saved every ~800ms. Close the tab, reload, come back tomorrow — your code is right where you left it. Each challenge has its own slot. When you reopen one, a small toast says "Resumed your saved work in '_X_'" and a **Reset** button lets you revert to the original challenge stub if you want a clean start. Show Solution still confirms before overwriting.

**2. Solved tracking.** When you click Run and every test passes (all ✅), the challenge is marked Solved. The templates modal now shows colored dots on each card — green for solved, amber for in-progress, none for untouched. The playground header shows your overall progress: "**4 / 50 solved**". The pass/fail count appears as a green or red pill near Run after each execution.

**3. Continue last session + Random Challenge.** When you open `/playground`, if you have unfinished work, a pill at the top says **Resume "Two Sum"** with how long ago you edited it. One click takes you back. New **Random** button in the templates modal (challenges tab) opens a randomly chosen unsolved challenge.

**4. Notes scratchpad per challenge.** A collapsible Notes panel below the editor lets you jot down thoughts as you go — approach ideas, gotchas, complexity reasoning. Saved alongside your code. Stays empty for fresh templates.

**5. Word-wrap toggle (default ON).** New **Wrap on / off** pill in the editor toolbar. When the splitter is dragged narrow, long lines now wrap to the next line by default instead of clipping off the right side. Toggle off if you prefer horizontal scroll. Persists across reloads.

### 15 New JavaScript Coding Challenges

Total challenge count: 35 → **50**. New patterns now represented: dynamic programming, backtracking, monotonic stack, greedy, linked list cycle detection.

- **Maximum Subarray (Kadane's)** — classic DP / running sum
- **Trapping Rain Water** — two-pointer, harder
- **3Sum** — sort + two-pointer (extends Two Sum)
- **Generate Parentheses** — backtracking with two counters
- **Subsets** — power-set backtracking
- **Permutations** — backtracking with used-set
- **Min Stack** — implement push/pop/top/getMin all in O(1)
- **Daily Temperatures** — monotonic stack
- **Coin Change** — minimum-coins DP
- **House Robber** — adjacency-constrained DP
- **Jump Game** — greedy reachability
- **Detect Cycle in Linked List** — Floyd's tortoise & hare (helper included)
- **Sort Colors** — Dutch flag three-pointer
- **Top K Frequent Elements** — bucket sort or heap
- **Merge Two Sorted Lists** — linked list splicing (helper included)

### Playground — Resizable Layout + Step-by-Step Explain Modal

Two upgrades to the playground.

**Resizable editor / console split.** The vertical divider between the editor and the Console Output panel is now draggable. Grab it and pull left or right to give the panel that needs more room exactly that &mdash; useful when your test output runs long, or when you're typing a wide function. Your chosen split persists across reloads.

**Explain button (Two Sum, more coming).** Coding Challenges now have a new **Explain** button (Sparkles icon, indigo) next to **Show Solution**. Click it to open a step-by-step walkthrough modal:

- **Intuition** of the approach in one paragraph &mdash; what the algorithm is actually doing.
- **Complexity** with time, space, and a verdict on when to use it.
- **Visual canvas** showing the array, the hash map, and the math being performed at each step. Cells light up to show what i and j are pointing at; map entries highlight when newly added or matched.
- **Pseudocode** alongside the visual, with the current line highlighted as you walk through.
- **Step navigator** at the bottom &mdash; Prev/Next/Reset, click any dot to jump, or hit the Play button to auto-advance. Keyboard shortcuts: &larr;/&rarr; to step, Space to autoplay, Esc to close.

For Two Sum specifically, you can step through both **Brute Force** (4 steps showing the nested-loop comparisons) and the **Hash Map one-pass** approach (5 steps showing how the complement check + map fill works). It's the difference between reading a solution and watching the solution happen.

**Now extended to all 35 JavaScript Coding Challenges.** Every JS challenge in the playground now has its own Explain button with the same step-by-step treatment, tailored to the algorithm:

- **Stack visualizations** for **Valid Parentheses** (push/pop) showing matched openers and closers.
- **Two-pointer animations** for **Reverse String**, **Valid Palindrome**, **Container With Most Water**, **Merge Sorted Arrays** &mdash; pointers light up as they walk inward or merge.
- **Sliding window + set** for **Longest Substring Without Repeating** &mdash; watch the window expand and shrink.
- **Recursion call-stack** for **Quick Sort**, **Merge Sort**, **Flatten Array**, **Sum Curry**, **Deep Clone**, **Compose &amp; Pipe** &mdash; see frames stack up and resolve.
- **Linked-list nodes with arrows** for **Reverse Linked List** &mdash; prev/curr/next markers walk through the reversal.
- **Timeline visualizations** for **Debounce** and **Throttle** &mdash; events appear on a time axis showing which calls fire and which get skipped.
- **Hash map state** for **Group Anagrams**, **Anagram Check**, **First Non-Repeating Character**, **Memoize**, **EventEmitter**, **LRU Cache**, **Balanced Brackets (Count)** &mdash; entries highlight as new or hit.
- **Set state** for **Find Duplicates**, **Remove Duplicates** &mdash; chips light up as values are added or matched.
- **Sorting walkthroughs** for **Bubble Sort** with swap markers per pass.
- **Search visualizations** for **Binary Search** &mdash; low/mid/high pointers shrink in half each step.
- **Math callouts** for **Find Missing Number**, **Climbing Stairs**, **Roman to Integer**, **Second Largest Number** &mdash; running computation shown step by step.

React Machine Coding templates intentionally do **not** have Explain entries &mdash; those are open-ended UI builds, not single-answer algorithms.

### Checkpoints — Pick Up Where You Left Off

Reading a long guide, hitting pause, and trying to remember which section you were on now has a one-click answer.

While reading **any guide**, scroll to wherever you stopped and click the new floating **&ldquo;Save Checkpoint&rdquo;** button (bottom-right, appears once you've scrolled past the top). It auto-detects the nearest heading above your current viewport and remembers it as your reading position for that guide.

When you return to the same guide, an indigo **&ldquo;Continue from 'Hooks'&rdquo;** banner appears at the top &mdash; one click smooth-scrolls you straight back to the section you were last reading. The banner has an &times; to clear the checkpoint when you're done.

**One checkpoint per guide.** Saving a new one replaces the old (you don't need to clean up). Unlike bookmarks (where you save many interesting sections to revisit), a checkpoint is your single &ldquo;you are here&rdquo; marker. The two coexist &mdash; you might bookmark a key section for reference and set a checkpoint somewhere else for resuming.

A new **&ldquo;Checkpoints&rdquo;** entry in the sidebar Tools section opens a global page listing every checkpoint you've saved across all guides, sorted by most recent. Each row shows the guide name, the section heading, when you saved it, and a **Continue &rarr;** button that jumps you straight there.

All checkpoints persist locally in the browser like the rest of PrepHub's state &mdash; nothing leaves your device.

### New Guide — Real-Time Web (Polling, SSE, WebSockets & Beyond)

A new Front End guide covering the architectural question of "how does the server tell the client something happened?" — every transport pattern senior front-end interviews probe.

**What's covered (~1,400 lines, 9 transport patterns):**

- **HTTP is request/response** — the architectural fact every pattern in the guide exists to work around
- **Short polling** — when it's the right answer, exponential back-off, pause-on-hidden-tab
- **Long polling** — Comet-era pattern, still valuable as a fallback; full Express server example with event bus
- **Server-Sent Events** — `EventSource`, frame format (`data:`, `event:`, `id:`, `retry:`, comment heartbeats), `Last-Event-ID` resumption, the ~6-connections-per-origin gotcha + HTTP/2 fix
- **WebSockets** — handshake (with `Sec-WebSocket-Accept` SHA-1 derivation), frame anatomy (FIN, opcode, MASK), why client→server frames are masked (cache-poisoning defense), close codes (1000/1001/1006/1011/4xxx), heartbeats, the half-open connection problem, full reconnection-with-jitter implementation, `ws` Node example, Socket.IO example with rooms + acks
- **HTTP streaming with `fetch` + ReadableStream** — how AI chat UIs (ChatGPT-style) actually work; SSE-over-fetch for endpoints that need `Authorization` headers (which `EventSource` can't send)
- **WebRTC DataChannels** — peer-to-peer with sub-100ms latency; signaling channel responsibilities; when you'd actually reach for it (games, collab editors, P2P file transfer)
- **Push API + Service Workers** — VAPID, subscription endpoints, `web-push` Node example; the "must show a notification" browser policy
- **GraphQL Subscriptions** — `graphql-ws` server + Apollo Client setup; the operational-cost reality check

**Production concerns section** covers auth (token-in-URL vs subprotocol vs cookie vs auth-after-open), reconnection strategy (exponential back-off + full jitter + visibility-aware), message ordering & replay (sequence numbers, `Last-Event-ID`, outbox pattern), backpressure (`ws.bufferedAmount`, SSE `drain`), scaling (sticky sessions + Redis pub/sub fan-out diagram), monitoring metrics, and the WebSocket → SSE → long polling → short polling fallback chain.

**Decision table** comparing all 9 patterns by direction, latency, complexity, browser limits, and when-to-use; plus a 6-question decision tree.

**16 interview Qs** (beginner → advanced) covering why HTTP can't push, short vs long polling, SSE vs WebSocket choice, WebSocket handshake details, why client frames are masked, production reconnection requirements, SSE heartbeat vs WebSocket ping at protocol vs application layer, the 6-tab SSE limit, WebSocket auth strategies, WebSocket scaling with Redis pub/sub, the laptop-sleep half-open connection problem, when to use `fetch` streaming over `EventSource`, HTTP/2 push deprecation, polling as the right answer, and message-ordering with reconnect.

**8 tricky Qs** covering 8-tabs-hang on SSE, corporate-proxy WebSocket failures, out-of-order events despite TCP guarantees, React Strict Mode double-mounting WebSockets (with the singleton-context fix), WebSocket cost-explosion audit questions, Safari-only `fetch` streaming buffering, why "exactly-once" is a marketing lie (and the at-least-once + idempotent pattern that approximates it), and why a WebRTC video-call app still needs a WebSocket (signaling vs media).

Total guides: 37 → 38; tricky Qs across the app: 135 → 143.

### React Guide — Built-in Hooks Reference Now Has Theory

Section 6.2 was a lone code block listing every hook signature with no explanation — useful as a recap, useless if you didn't already know what `useImperativeHandle` was for. It's now a per-hook walkthrough: each of the 14 React 19 built-in hooks gets its own subsection with **what it does**, **when to use it**, and **the most common pitfall**, plus a focused example.

Highlights of what's now properly explained:

- **`useState` and `useReducer`** — when a reducer earns its complexity and when a single boolean really doesn't need one
- **`useEffect`** — what to use it for vs what people mistakenly use it for (deriving state, handling user events) — with a pointer to §7 for the full effect lifecycle
- **`useContext`** — the re-render storm pitfall when `value={{ user, setUser }}` is a fresh object literal every render
- **`useRef`** — DOM ref vs instance variable, and why reading `.current` during render breaks purity
- **`useMemo` vs `useCallback`** — the identity `useCallback(fn, deps) === useMemo(() => fn, deps)`, plus the senior-level "useless without consumer memoization" caveat
- **`useImperativeHandle`** — the "you're probably fighting the framework" warning sign
- **`useLayoutEffect`** — the synchronous-before-paint contract and when the flicker is bad enough to escalate from `useEffect`
- **`useSyncExternalStore`** — the "must return `===`-equal" stable snapshot rule that infinite-loops if you violate it
- **`useId`** — why it's SSR-safe and why you must NOT use it as a list `key`
- **`useTransition` vs `useDeferredValue`** — when to use one vs the other (own the setter / don't own the setter)

Opens with a 7-row mental-model table grouping all 14 hooks into State / Side effects / Context / Refs / Memoization / Concurrent / External data / Misc buckets.

### Playground — Rainbow Brackets + Matching-Pair Highlight

The playground editor now colors brackets by nesting depth — paired `( )`, `[ ]`, and `{ }` share the same color (gold / orchid / azure), cycling every three levels just like VS Code's bracket pair colorization. Makes it instantly obvious which closer belongs to which opener in deeply-nested JSX or callback chains.

When the cursor lands on a bracket, both that bracket **and its match** are outlined and softly highlighted, so you can see at a glance where a pair starts and ends. Strings, comments, and regex literals are intentionally skipped — a `(` inside `"hello ("` is still gray, not a depth color.

### Playground — Auto-Format with Prettier

New **Format** button (also `⌘/Ctrl + Shift + F`) reformats your code with Prettier on demand. The formatter is lazy-loaded on first click — about ~140 KB gzipped split across babel, estree, and the typescript plugin, none of which are paid for unless you actually format. Picks the right parser automatically: pure JS/JSX uses Babel, anything with TypeScript syntax (interfaces, generics, type annotations) uses TypeScript even when the template is marked JSX. If your code has a real syntax error, Prettier surfaces the line and column in the console without overwriting your buffer.

Two more editor niceties shipped alongside it:
- **Auto-indent on Enter** — pressing Enter inside `{`, `[`, or `(` opens a new line with one extra indent and re-aligns the closing bracket on a third line.
- **Bracket auto-close** (toggleable from the toolbar pill, persisted across sessions) — typing `(`, `[`, `{`, `"`, `'`, or `` ` `` inserts the matching closer and places the caret between them. Skipped intelligently when the next character is a word character (so `console.log` doesn't get an extra `)`).

### Playground — Every Challenge Solution Now Multi-Approach

Completed the audit: **all 35 Coding Challenge solutions** now show multiple approaches side by side with a Time / Space / Verdict comparison table and a "When to pick which" footer that explains the trade-offs and _why_ a given approach is used.

Highlights of what's now covered:

- **Sorting:** Bubble Sort (basic / early-exit / cocktail), Quick Sort (three-way partition / Lomuto in-place / random pivot), Merge Sort (top-down / bottom-up iterative)
- **Search:** Binary Search (iterative / recursive / linear baseline), Longest Substring (index-map / Set+shrink), First Non-Repeating Char (two-pass map / one-pass ordered map)
- **Data structures:** EventEmitter (Map of Sets vs Map of Arrays), LRU Cache (Map insertion-order trick vs textbook doubly-linked-list + Map), Memoize (4 cache strategies including WeakMap for object args)
- **Functional:** Debounce (4 variants: trailing-edge / leading-edge / both-edges / cancellable), Throttle (timestamp / timer / both-edges), Compose & Pipe, Sum Curry (empty-call vs valueOf trick), Memoize
- **Cloning / serialization:** Deep Clone (recursion+WeakMap vs `structuredClone` vs JSON round-trip), Group Anagrams (sorted-key vs char-count signature vs prime-product trick)
- **Array manipulation:** Rotate Array (slice+concat / reverse-three-times / cyclic replacement), Move Zeros (write-index / single-pass-swap / filter+pad), Find Missing Number (sum / XOR overflow-safe / Set / sort), Find Duplicates, Remove Duplicates
- **String / classic LeetCode:** Two Sum (hash map vs brute force), FizzBuzz (if/else / string-concat / lookup table), Valid Parentheses (stack canonical / replace-empty-pairs), Roman to Integer (peek / right-to-left / replace-pairs)

Every solution names its **best** approach for performance, **best** for readability, and **don't ship** baselines — and explains _why_ the pattern (sliding window, two-pointer, DLL+Map, etc.) is the right shape for the problem class. The Show Solution toggle in the playground reveals all of them.

### Playground — Multi-Approach Solutions + 2 More Templates

Two new Coding Challenges added:

- **Balanced Brackets (Count)** — count-based parity check for `()`, `[]`, `{}`. Returns true when the number of opens equals closes for each pair. Note: this is _different_ from the existing **Valid Parentheses** template, which validates nesting order (so `([)]` is `false` for that one but `true` for this count-based one).
- **Second Largest Number** — find the second-largest unique value in an array, without using `sort()`.

The "Show Solution" toggle for both new templates reveals **multiple approaches** side by side, with a comparison table showing time / space / verdict, and trailing commentary on when to pick which approach.

Several existing Coding Challenges had their solutions upgraded the same way — multiple approaches with performance commentary instead of one canonical answer:

- **Two Sum** — single-pass hash map (best) · two-pass hash map · brute force O(n²)
- **Reverse String** — two-pointer in-place · split+reverse+join (1-liner) · recursion · for-loop concat
- **Find Missing Number** — sum formula (best) · XOR (overflow-safe) · Set lookup · sort+scan
- **Find Duplicates** — two Sets (best) · frequency map · sort+scan · filter+indexOf
- **Anagram Check** — frequency map (best) · sort+compare · char-code array (ASCII)
- **Climbing Stairs** — bottom-up DP O(1) space (best) · dp array · memoized recursion · naive recursion · Binet's closed-form
- **Container With Most Water** — two-pointer (best) · brute force
- **Binary Search** — iterative (best) · recursive · linear scan

Each shows a Time / Space / Verdict table and "When to pick which" commentary so you can see not just _an_ answer but the _trade-offs_ between answers.

Total templates: 96 → 98. Total solutions: 33 → 35.

## v1.0.8 (May 2026)

### Stripe Integration Guide

A new Back End guide: **Stripe Integration** — full backend-engineer playbook for handling payments. Covers the API key model (publishable / secret / restricted / webhook signing), the client-server split that keeps you out of PCI scope, the three integration paths (Elements, Checkout, Payment Element), the PaymentIntent state machine, webhook handling (signature verification, idempotency, replay protection), idempotency keys and how to scope them to business operations, Customers and saved payment methods (`off_session`), Subscriptions lifecycle and dunning, **Coupons and Promotion Codes including the coupon race-condition deep dive** (defense in depth: Stripe's atomic `max_redemptions` cap, application-side reservations with TTL + UNIQUE constraint, and idempotency keys at the redemption call), Refunds and Disputes, Strong Customer Authentication / 3D Secure, Stripe Connect for marketplaces, PCI scope (SAQ A, A-EP, D), testing with the Stripe CLI. Closes with **16 interview questions** (Beginner / Intermediate / Advanced) and **6 tricky scenario questions** including the coupon race condition, double-click idempotency, why first-failed-invoice shouldn't revoke access, DB / Stripe state divergence, transactional webhook handlers via the outbox pattern, and dispute response strategy.

## v1.0.7

### DSA Guide — Three New Topic Sections

The DSA guide (2297 → 2722 lines, +18%) was audited for canonical interview topics that were absent. Three full sections were added between current §10 (Dynamic Programming) and §11 (Common Patterns Summary), then 11 / 12 renumbered to 14 / 15 with TOC updated:

- **§11 Heaps & Priority Queues** — when to reach for a heap (Top-K, streaming median, merge K sorted lists, scheduling, A\*); full MinHeap implementation with bubble-up/bubble-down; canonical problems: Top-K Frequent Elements, K-th Largest in Stream; 7-row comparison table covering Top K Frequent / K Closest Points / Median Stream / Merge K Sorted / Task Scheduler / Sliding Window Maximum.
- **§12 Tries (Prefix Trees)** — why a trie beats a hash set for prefix queries; TrieNode/Trie class implementation with `insert`, `search`, `startsWith`; autocomplete-via-DFS function; 6-row comparison table (Word Search II, Replace Words, Auto-Complete System, Longest Word in Dictionary, Maximum XOR with binary trie); space trade-off note (dense word lists vs random IDs).
- **§13 Backtracking** — the general template (state + choices + isSolution + isValid pruning); five fully worked problems: Permutations (used-set), Combinations (start-index with prune), Subsets (power set), N-Queens (cols + diag1 + diag2 attack-set tracking), Word Search (DFS with in-place `#` visited mark + restore); 9-row table of canonical problems including Combination Sum, Sudoku Solver, Generate Parentheses, Restore IP Addresses, Palindrome Partitioning; closing performance note that pruning is what makes backtracking practical.

### Playground — JS Polyfills Expansion (15 → 24)

The JS Polyfills category nearly doubled in size. Added the most-asked polyfill exercises that interviewers reach for after the basic map/filter/reduce trio:

- **Array.sort** — implements QuickSort and demonstrates the classic _string-compare default_ gotcha (`[1, 10, 2].sort()` → `[1, 10, 2]`), then walks through ascending/descending/by-key comparators. Includes a stability note for ES2019+ behavior.
- **Array.indexOf / lastIndexOf** — strict equality (`===`), so `[NaN].indexOf(NaN)` → `-1`. Negative `fromIndex`, lastIndexOf reverse search.
- **Array.reverse** — two-pointer in-place swap. Mutation note + ES2023 `toReversed` alternative.
- **Array.slice** — shallow copy with negative-index handling. The shallow-vs-deep clarification (nested object refs are shared).
- **Array.splice** — the three-jobs-in-one method: remove items, insert items, return removed items. All three modes demonstrated.
- **Array.concat** — one-level array flattening (not recursive). Mixed array / non-array args.
- **String.padStart / padEnd** — pad with fill string, truncated to fit. Common time-formatting use case.
- **JSON.stringify** — recursive serialization with the quirks that catch people: `undefined`/function/symbol values dropped from objects, replaced with `null` in arrays; `NaN` and `Infinity` become `null`; `toJSON` hook (Date) honored. Includes equivalence test against native.
- **Object.keys / values / entries** — enumerable-own-string-keyed contract (no prototype, no symbols by default).

Total templates now **96 across 7 categories** (JS Fundamentals 6, JS Interview Topics 7, React Basics 3, React Advanced 3, JS Polyfills **24**, Coding Challenges 33, React Machine Coding 20).

### Playground — 15 More Templates (72 → 87)

- **JS Fundamentals (+2):** Map & Set (modern collections, when to use which), Spread & Rest (the same syntax, opposite jobs)
- **JS Polyfills (+3):** `Array.includes` (with the `NaN` SameValueZero quirk), `Object.assign`, `Array.from` (iterable + array-like + mapFn)
- **Coding Challenges (+5, all with Show Solution):** Binary Search, Roman to Integer, Reverse Linked List, Container With Most Water (two-pointer area-maximization), Climbing Stairs (Fibonacci-pattern DP intro)
- **React Machine Coding (+5):** Stopwatch (start/pause/resume/reset with millisecond display), Calculator (4-function), Auto-suggest / Typeahead (filter + arrow-key nav + click-outside-to-close), Toast / Snackbar (queue with auto-dismiss + 4 severity levels), Carousel / Slider (auto-play + keyboard nav + dots indicator)

### Playground — "Show Solution" Toggle

The playground now has a **Show Solution** button (lightbulb icon) in the toolbar for every Coding Challenges template. Click it to swap the function-stub code for the canonical working solution; click again ("Hide Solution") to restore the original challenge.

- **Confirms before clobbering work** — if you've typed code that differs from the challenge stub, a confirm dialog prevents accidental loss.
- **Active state styling** — when viewing the solution, the button glows amber so you don't forget you're looking at the answer.
- **Solutions match each challenge** — all 28 Coding Challenges have a hand-written canonical solution: Two Sum (hash map), FizzBuzz (modulo 15 first), Bubble / Quick / Merge Sort (early-exit / middle-pivot / divide-and-conquer), Find Duplicates (single-pass two sets), Throttle (timestamp-based), EventEmitter (Map of Set listeners), LRU Cache (Map insertion-order trick), Deep Clone (recursive with WeakMap cycle guard), and so on. Each solution includes the same test cases as the challenge so you can see ✅ across the board.
- **No solution for non-challenge templates** — React Machine Coding and JS Polyfills don't show the button (those aren't single-answer "did I solve it" templates). The button only renders when a matching solution exists.

Solutions live in a separate `src/components/playgroundSolutions.ts` keyed by template name, so they don't bloat the main templates definition.

### Playground — 22 New Templates (49 → 72)

Audited the playground for the most-asked JavaScript and React coding interview templates. Added 22 new templates across two categories:

**Coding Challenges — 17 new (was 10, now 27):**

- **Array mutation classics:** Find Duplicates, Remove Duplicates (without Set), Find Missing Number, Move Zeros, Rotate Array
- **Sort without built-in:** Bubble Sort, Quick Sort, Merge Sort — covers the "sort without using `Array.prototype.sort`" interview ask in three classic styles
- **String puzzles:** Anagram Check, Longest Substring Without Repeating, First Non-Repeating Character
- **Functional patterns:** Sum Curry (`sum(1)(2)(3)()`), Memoize, Deep Clone (without `structuredClone` or JSON tricks), Throttle (companion to existing Debounce), Compose & Pipe
- **Data-structure builds:** EventEmitter (`on`/`off`/`emit`/`once`), LRU Cache (with `Map` insertion-order trick)

Each template follows the established pattern: clear challenge description, constraints, function stub with `// YOUR CODE HERE`, and 4–5 test cases that print ✅/❌ for instant feedback in the playground.

**React Machine Coding — 5 new (was 10, now 15):**

- **Star Rating** — 5-star input with hover preview
- **Tabs** — compound-component pattern (`<Tabs>` / `<Tabs.List>` / `<Tabs.Tab>` / `<Tabs.Panel>` sharing state via Context — the canonical Radix UI / Headless UI shape)
- **Accordion** — single-open and multi-open modes via `allowMultiple` prop
- **OTP Input** — 6-digit input with auto-advance, backspace-to-previous, paste distribution
- **Tic-Tac-Toe** — winner detection across rows/columns/diagonals, draw detection, reset

Total playground templates now **72 across 7 categories** (JS Fundamentals, JS Interview Topics, React Basics, React Advanced, JS Polyfills, Coding Challenges, React Machine Coding).

### Cross-Guide Audit — 2026 Modern-Feature Gaps Closed

A systematic audit ran across every substantive guide (JavaScript, TypeScript, Node.js, Express, MongoDB, API Design, Database Schema, AWS IAM/EC2/S3/Lambda/CloudWatch/Frontend Deployment, Git, DSA, System Design) checking for canonical 2026-relevant topics. Most guides were already strong; three real gaps were patched:

- **JavaScript §7.1 — Modern Array Helpers** — added `at()` (ES2022) for relative indexing including negative offsets, `findLast` / `findLastIndex` (ES2023) for searching from the end, and the ES2023 **immutable array methods** (`toSorted`, `toReversed`, `toSpliced`, `with`) which return new arrays instead of mutating. The immutable variants directly solve the most common accidental-mutation bug in React/Redux code.
- **Node.js §13.4 "Modern Node Built-Ins (No npm Install Required)"** (NEW subsection) — covers what the platform now ships natively that used to require dependencies: native `fetch` (Node 18+, replaces `node-fetch` / `axios` for most cases), the native test runner (`node:test` + `node:assert/strict`, replaces Jest/Mocha for backend code), `node --watch` (replaces nodemon), `node --env-file=.env` (replaces dotenv), and `--inspect-brk` with Chrome DevTools. Establishes the modern framing: start with what the platform gives you; add npm only when there's a specific reason.
- **TypeScript §10.6 — The `satisfies` Operator (TS 4.9+)** (NEW subsection) — promoted from a single interview-Q reference to a full reference subsection. Walks through the three options (annotation widens; `as` skips validation; `satisfies` does both) with concrete code showing why it matters — e.g., `palette.red.toUpperCase()` failing under annotation but working under `satisfies`. Includes the canonical use case: const config objects with shape constraints.

The audit also confirmed that Express (Fastify/Koa/NestJS comparison + Express 5 async errors), MongoDB, AWS IAM (Identity Center / SCP / permissions boundaries), Database Schema, API Design (19 sections), System Design, Git, and DSA were already comprehensive — no additions needed.

### React Guide — 2026 Priority-Map Gaps Closed

The React guide was audited against the "React.js Priority Map for Jobs in 2026" topic list to find what was missing. Five additions:

- **§7.4 "When NOT to Use useEffect"** — the senior-level signal that interviewers grade for. Five concrete patterns of misuse (derive instead of effect, real query libraries instead of effect-fetch, event handlers instead of "effect-as-listener", `key`-based reset instead of effect-reset, and the actual jobs `useEffect` is for: subscribing to external systems, browser APIs, third-party libraries, server sync). Frames `useEffect` as the _escape hatch_ from React's pure-render model rather than the default.
- **§11.3 "Server State vs Client State — The Most Important Distinction"** — explicit comparison table contrasting source-of-truth, lifetime, sync model, concerns, examples, and the right tool for each side. Closes with the modern-stack guidance: TanStack Query + Zustand for greenfield React projects in 2026; Redux only for genuinely complex client state or legacy codebases.
- **§16.3 useFormStatus** — added alongside existing `useActionState` (renamed from "Actions" with deeper explanation) and `useOptimistic`, framing them as the **form-state triad** (form-level state machine + descendant access + instant UI). Renumbered React 19 subsections to 16.1–16.5.
- **§13.2 useMemo / useCallback identity** — added the `useCallback(fn, deps) === useMemo(() => fn, deps)` equivalence interviewers love to test, plus a "when NOT to memoize" senior-signal block (cheap renders, unstable deps, no memoized consumer, React Compiler enabled). The point: profile first, don't sprinkle memoization preemptively.
- **§6.3 Custom Hooks expansion** — added `useFetch` (with `AbortController` cleanup, the canonical "build one live" interview ask) and `useToggle` alongside the existing `useDebounce` and `useLocalStorage`. The four together cover the most-asked custom-hook patterns, with a note that the cancellation pattern is the senior-level signal.
