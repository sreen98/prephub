# What's New

## v1.7.4 (September 2026)

**Performance: Redux Toolkit and React.** The Redux Toolkit guide has a new section, 11.4, on finding and fixing over-rendering, and a new interview question, Q20, walks through diagnosing a sluggish Redux app. They cover:

- selectors that return a new array on every action;
- what `createSelector` caches since RTK 2, and when to give it a size limit;
- `shallowEqual` for selectors that return objects;
- RTK Query's shared requests, `keepUnusedDataFor`, per-item tags and `selectFromResult`.

The React guide gains a step-by-step profiling routine, a note on when *not* to virtualise a list (it breaks find-in-page and screen-reader row counts), and built-in `Intl` date formatting as an alternative to moment. Prompted by Anshu Raj's article on React performance, now linked from both guides; one of its tips, a selector cache that only remembers the last inputs, describes RTK 1, and the guide explains what changed.

**New: CI/CD in the React guide.** Section 15.12 shows how to run lint, the type check, tests and a build on every pull request with GitHub Actions, and how to make those checks required so a failing PR cannot merge. It also covers the mistakes that bite: a path-filtered required check that never runs and blocks every PR, renaming a job, `pull_request_target`, and keeping CI fast.

**New interview questions from a senior frontend loop:**

- **React:** Q84 designing a CI/CD pipeline for a React app, and Q85 finding out why a bundle grew from 500 KB to 5 MB. Q12 on Fiber was rewritten to explain how it works inside (fibers, double buffering, the work loop, lanes) and to say precisely why it helps: it makes rendering interruptible, not faster.
- **Next.js:** Q10 `revalidate` vs `cache` (and the three different things called "cache"), Q11 choosing Server or Client Components, and Q12 streaming and progressive rendering.
- **Frontend Architecture:** Q20 designing a reusable Data Table, and Q21 sharing code between web and mobile apps.

Error boundaries and async errors, Server Actions vs API routes, and `Promise.all` from scratch were already covered, so they were left as they are.

**Challenges now grade you like an interview does.**

- **Hidden tests.** Every JavaScript challenge has 4–6 extra tests you can't see, covering the cases interviewers probe: empty input, one element, duplicates, negatives, large inputs and each problem's own trap. Run shows both, for example "3/3 passed · 🔒 5/7 hidden", and a failing hidden test tells you which case broke and what was expected. A challenge only counts as solved when the hidden tests pass too, so hard-coding the visible answers no longer works.
- **Interview mode.** Start a 15, 30 or 45-minute timer on any challenge. Explain, Compare and Show Solution stay hidden until you solve it, run out of time or press End, and reloading the page doesn't reset the clock. Your best time appears next to the challenge in the Challenges list.
- **Check for React challenges.** React machine-coding challenges now have a **Check** button. It uses your running component the way a person would (clicking, typing, pressing Escape) and reports which behaviours work, for example "Escape closes the modal and focus returns to the button". It finds things by their role, label and visible text, so your own markup passes if it behaves correctly. Passing every check marks the challenge solved.
- **Compare.** Put your code beside the reference solution, with matching lines aligned and differences highlighted, instead of Show Solution replacing your code. For challenges without a solution, it compares against the original template, so you can see what you changed.

**New: Tree Traversal track (6 challenges).** DOM Tree Height, Invert Binary Tree, Level-Order Traversal, getElementsByClassName from Scratch, Find Matching Node in Identical Tree, and Lowest Common Ancestor of Two Nodes. The DOM ones use plain objects shaped like DOM nodes, because the JavaScript playground runs your code without a page.

**New: TypeScript Types track (6 challenges).** They're graded by the real TypeScript compiler: when you press Run, type errors show up as failures next to the runtime tests. The challenges are MyPick and MyOmit, Model an API Response, DeepReadonly, Type-safe groupBy, Typed EventEmitter, and dotted-key Paths. The first TypeScript run downloads the compiler once (about 1 MB).

**Separate JavaScript and React playgrounds.** The playground is now two: the **JavaScript Playground** and the **React Playground**, each with its own entry in the sidebar and a switch in the header. Each one shows only its own templates, challenges and blank starters, and remembers what you had open, so going back to one never drops you into the other's work. The **Try it** button on a React example opens the React playground.

**Challenge code starts where you write.** The problem statement, examples and constraints used to appear twice: in the Problem panel and again as a block of comments at the top of the code. The comments are gone, so the editor opens on the function you need to write. React challenges keep their design notes (such as when to reach for the native `<details>` element), which aren't in the panel. If you had already edited a challenge, your code is kept as it was.

**The Problem panel is resizable.** Drag the handle along its bottom edge to give the statement or the code more room, the same way you drag the divider between the editor and the output. The height is remembered; double-click the handle to reset it, or focus it and use the arrow keys.

**Fixed:** in the Challenges list, unsolved challenges showed a thin line instead of an empty circle, and their names didn't line up with the solved ones.

**The Code Playground now has separate Templates and Challenges.** Two buttons instead of one picker: **Templates** for reference code (JavaScript fundamentals, spec polyfills, utility implementations, React basics), and **Challenges** for the 145 practice problems. Before, opening the picker always landed on the Templates tab, even when you were in the middle of a challenge.

**Challenges are grouped into study tracks**, so problems that use the same technique are tried together, easiest first:

- **15 JavaScript tracks,** one per technique: Two Pointer, Sliding Window, Hash Map / Set, Stack, Dynamic Programming, Binary Search, Backtracking and more. Each opens with one sentence on the idea the whole track practises.
- **7 React tracks** by theme: forms, data and lists, overlays, navigation, async actions and real-time, and state architecture.

Each track shows how many you've solved and has a Start / Continue button. While you work through one, **Prev** and **Next** buttons above the editor step through it.

**Every challenge now has a proper problem statement**, above the editor, with:

- what you're given and what to return;
- two or three **sample inputs with the expected output**, including an edge case;
- the constraints.

All 290 JavaScript sample outputs were checked by running the reference solution, and they're checked again on every build, so a sample can never disagree with the answer. React challenges describe what you do and what you should see. The Merge Sorted Arrays solution also now uses the same function name as the challenge.

**New JavaScript questions from a real interview:** Q40 "Why do we need closures?" (the uses, not just the definition), and tricky Q52 and Q53. Those two are output puzzles where a timer, a promise and an `await` all change the same counter, so you have to track its value as well as the order of the logs.

**Every "Try it" button in the guides now works.** We pressed every one, automatically. About 150 React examples either crashed or showed nothing useful, usually because they used a helper defined in a different example or needed props that were never passed.

- **Fixed in the example (about 100).** They now include what they need: a small stand-in component, or a demo that passes realistic props. For example, the custom hooks in the React guide now run on their own.
- **Button removed (about 50).** These examples can't run in a browser playground at all: React Native code, examples that need another library (Next.js, React Router, TanStack Query), and Server Components. Showing a button that is guaranteed to fail was worse than showing none.

**Output claims checked by running them.** Every example that states its output was run, including the Express, MongoDB, Redux Saga and Redux Toolkit ones, which were run against the real libraries. One was wrong: in Express 4, an error thrown in an async handler crashes the whole Node process rather than leaving the request hanging. It's corrected, along with a few smaller slips in the Redux Toolkit and TypeScript answers.

**Security updates** for several of the app's dependencies.

**23 more "guess the output" questions for JavaScript and TypeScript**, after checking both sections for missing topics.

**JavaScript (Q41 to Q51):**

- a `return` inside `finally` that silently swallows an error;
- why a subclass's field is `undefined` when the parent constructor calls a method;
- `#private` fields and the `#x in obj` check;
- `-0` and `NaN` equality (`includes` vs `indexOf`, `Object.is`);
- `arguments` vs arrow functions and rest parameters;
- array holes, `length` and `delete`;
- when `valueOf` or `toString` gets called;
- why a promise's executor runs straight away;
- how far `?.` short-circuits;
- named function expressions;
- `Symbol` keys and `Map` keys.

**TypeScript (Q20 to Q31), mostly about the gap between types and what actually runs:**

- `as` doesn't convert anything;
- `private` vs `#private` at runtime;
- classes being matched by shape;
- why `Object.keys` returns `string[]`;
- array indexing and `noUncheckedIndexedAccess`;
- `void` callbacks that return values;
- `typeof` checks that let `null` through;
- `keyof` on unions vs intersections;
- `unknown` in `catch`;
- overloads;
- optional vs `undefined` properties;
- narrowing inside closures.

The TypeScript examples keep their compile errors as commented lines marked ✗, so **Try it** runs them and shows the real output. The 19 older TypeScript output questions now work the same way. Before this, pressing **Try it** on some of them crashed straight away, because they contained the very line that was meant to be a compile error. Every compile error was checked with the TypeScript compiler, and every output was run, on every build.

**The app now runs React 19.3**, so the React 19.3 examples in the React guide (`<ViewTransition>`, Fragment Refs and `browser()`) now have working **Try it** buttons.

**New topic: Backend for Frontend (BFF)**, in the Frontend Architecture guide (§2.3), with interview question Q19. It covers:

- What a BFF is and the problems it solves: chatty screens, over-fetching, tokens in the browser, and apps tied to how the backend is split up.
- What it should and shouldn't do, with a runnable example that combines three services into one response and still works when one of them is down.
- How it differs from an API gateway and GraphQL, what it costs, and when not to add one.

**New in the JavaScript guide: why JavaScript is everywhere.** Section 1.8 covers why it became the most-used language, its short history, why companies keep choosing it, and its honest downsides. Five new interview questions about the language itself:

- Q35: Why is JavaScript so popular?
- Q36: JavaScript vs ECMAScript, and how new features get added.
- Q37: Is JavaScript compiled or interpreted?
- Q38: Why do most teams use TypeScript?
- Q39: JavaScript's weaknesses, and when to choose another language.

**14 more "guess the output" questions in the JavaScript guide** (Q27 to Q40), covering the classic puzzles that were missing:

- the `var` vs `let` loop with `setTimeout`, hoisting, and the temporal dead zone;
- closures reading a variable rather than a copy, and `this` in methods and arrow functions;
- `0.1 + 0.2`, `typeof` surprises, `'b' + 'a' + +'a' + 'a'`, and default `sort` with `map(parseInt)`;
- a `.catch` that silently recovers, and `return` vs `return await` inside `try`;
- generators and `next(value)`, default values with `null`, and the `return`-on-its-own-line trap.

Every output was run and is checked on every build.

**New in the React guide: what React 19.3 brings.** React 19.3 came out on 9 September 2026, and a new section (§16.11) covers it:

- `<ViewTransition>`, now stable, for animating elements as they appear, disappear, change or move.
- Fragment Refs, for focusing or observing a group of elements without adding a wrapper.
- `browser()`, for components that should only render in the browser.
- Support for the browser's Trusted Types XSS protection.
- The smaller changes worth knowing.

There's a matching interview question (Q83). The "where React is today" table was out of date and is corrected, and so are the Modern CSS and Next.js guides, which still said `<ViewTransition>` wasn't released.

**The React Compiler section, rewritten to be easier to follow.** It now shows what the compiled code actually looks like, explains why that beats writing `useMemo` by hand (including memoizing after an early return, which hooks can't do), and covers the current setup for Vite 8. It also explains how to check that it worked (the ✨ badge in React DevTools) and how to leave one component out.

**Second pass over every guide: the leftover issues are fixed.** The first reread flagged items it wasn't sure about or didn't get to. Each flagged fact was checked, by running the code or against official docs, before anything changed. The outcome:

- **123 real mistakes fixed.** Many were in code examples. For example: a React example that lazy-loaded the main hero image, a `startTransition` example that didn't actually defer anything, Storybook examples updated to Storybook 9 and MSW 2, and outdated Vite, AWS and library details.
- **20 flagged items turned out to be correct** and were left alone.
- **About 100 long or repetitive sections rewritten** to lead with the point.

**Every guide was reread for clarity, and nearly 800 explanations were rewritten.** Each guide was checked section by section against one question: can someone who doesn't already know this topic follow it? Explanations that were one-liners, lists of buzzwords with no reasons, undefined jargon, or answers that just restated the question now start with a plain short answer and explain *why*. Sections that were already clear, and the code-first cheat sheets, were left alone.

The reread also caught about 110 statements that were wrong or out of date, now corrected. A few examples:

- **React:** the Virtual DOM isn't "faster than the DOM"; there is no 5-second timeout on transitions; index keys move state to the wrong row rather than losing it.
- **Python:** `257 is 257` in one file prints `True`, not `False` (checked by running it).
- **Redux Toolkit:** two Immer answers were wrong and are fixed. Setting a value to what it already was keeps the same state object, and the "mutate and return" example now shows the form that really throws.
- **AWS:** S3 has been strongly consistent since 2020, Lambda's scaling rules changed in 2023, the ALB metric for 504s was the wrong one, and X-Ray's errors and faults were swapped.
- **MongoDB:** the default write concern is `majority`, not `1`.
- **Stripe:** reusing an idempotency key with a different request body returns an error, not the original response.
- **Git:** `ort`, not `recursive`, has been the default merge strategy since Git 2.34.

No code examples, headings or question numbers changed (apart from the one Redux example above), so bookmarks, checkpoints and review progress are unaffected.

**The JavaScript guide now opens with how JavaScript actually works.** Section 1 used to be five bullet points. It is now seven short sections, in the order the pieces fit together, each in plain language with examples you can run:

- **1.1 The engine and the runtime:** what V8 does with your file, and why `setTimeout` isn't part of the language.
- **1.2 Execution context and the call stack:** what happens when a function is called, and what "hoisting" really is.
- **1.3 Function references:** functions are values, and the bugs that come from mixing up `fn` and `fn()`.
- **1.4 Why "single-threaded"? (new):** what it means, why JavaScript was designed that way, what still runs in parallel around your code, and why one long function freezes the page.
- **1.5 Why non-blocking? (new):** how slow work is handed off so the one thread never sits waiting, and why that doesn't help with heavy calculations.
- **1.6 The event loop (new):** the loop in a few lines of pseudocode, its two queues, and why a promise always beats a 0 ms timer.
- **1.7 Web Workers and worker threads:** how a second thread works, step by step, with a diagram of the messages passing between them.

Interview questions 31 to 34 are now short answers that link to these sections, so they still appear in Quiz mode.

**Nine more React interview questions** (Q74 to Q82), the ones that come up in almost every React interview as "why does this happen?". Each has a short answer first and an example you can run:

- **Q74: Why does my effect run twice in development?** What StrictMode is checking for, why the double run is a test and not a bug, and what to do instead of switching it off.
- **Q75: Automatic batching and `flushSync`.** Why two state updates cause one render, and the rare case where you need the DOM updated immediately.
- **Q76: Portals.** Why a click inside a modal rendered elsewhere in the page still reaches the component that opened it, and the "click outside" bug that follows.
- **Q77: Why `{count && <Badge />}` shows a 0.** Plus the three safe ways to write it.
- **Q78: Forms.** Controlled inputs vs React Hook Form vs React 19 form actions, with a working sign-up form that shows pending state and errors and resets itself after success.
- **Q79: TypeScript with React.** Typing props, children, events and generic components, all checked with the TypeScript compiler.
- **Q80: Reusable component patterns.** Composition, compound components, render props, and supporting both controlled and uncontrolled use.
- **Q81: Stale closures in hooks.** Why a timer stays stuck at 1, and four fixes with when to use each.
- **Q82: "My input loses focus every time I type."** The component-defined-inside-a-component bug, why it happens, and how to check for it.

**37 "real-time" React interview questions checked, and the gaps filled.** 23 were already answered well. For the rest:

**Eight new React questions** (Q66 to Q73), each with a short answer first and a small example you can run:

- **Q66: What is `React.memo`?** When it skips a re-render, and why an inline object quietly defeats it.
- **Q67: Two components need the same data.** Lift it to the nearest shared parent first, and when to use context, a store or a query cache instead.
- **Q68: Loading, success, empty and error states.** One status value instead of three booleans, and what makes each state good, not just present.
- **Q69: The API takes 10 seconds. What does the user see?** Feedback that changes over time, from skeleton to "taking longer than usual" to Cancel, and when to make it a background job instead.
- **Q70: The user leaves the page mid-request.** Cancel requests that load data, but let saves finish. Also why stale data landing on the wrong page is the real bug.
- **Q71: Refreshing the token on a 401.** Refresh once, retry once, and make several requests that fail at the same moment share one refresh. Includes a demo that proves it.
- **Q72: React talking to Spring Boot microservices.** One gateway, one API client, turning both of Spring's error formats into one, and the Spring details that trip React developers (pages start at 0, the page response shape, where CORS goes).
- **Q73: Downloading a CSV or PDF from Spring Boot.** A plain link when you can, fetch plus a temporary link when you need a token, and the header that silently disappears (`Content-Disposition` needs to be exposed).

**Three answers rewritten to go further:** React Q2 now covers state, props *and* context with one example. React Q11 on unnecessary re-renders now gives the fixes in the order to try them, with a demo of the cheapest one: passing a child in as `children` so it stops re-rendering. Redux Q1 now explains the problem Redux actually solves.

**New Redux question, Q19: the Redux flow.** Component, action, reducer, store and back to the component, shown with a tiny working store that prints each step.

**Two new React machine-coding templates:** a **Shopping Cart** (quantities that respect stock, a discount code, totals calculated in cents so they are never a penny out, and a cart that survives a refresh), and **File Upload with progress** (a percentage per file, cancel and retry, checking files before sending, and why `fetch` can't report upload progress).

**Nine React machine-coding questions from a real interview list, now all answered in the playground.** Five are new templates and four existing ones were rebuilt, each with a step-by-step Explain walkthrough:

- **New: Nested Comments.** A thread with replies to any depth, rendered by one recursive component. Shows why comments are stored flat by id, and how to make replying re-render only the comment you replied to (the console proves it).
- **New: Sidebar Navigation.** Beside the page on desktop, a slide-in drawer on mobile, submenus that open smoothly, the current page highlighted, and the right submenu already open when you arrive. A toggle lets you preview the mobile layout.
- **New: Data Table.** Sort by clicking a column, search, filter by status and paginate, with the header, rows and pagination as separate pieces. It also prints the request the same table would send if the filtering moved to the server.
- **New: Like Button.** Changes the moment you click and undoes itself if saving fails. It also stays correct when you click five times in a second, sending only one or two requests instead of five.
- **New: Rate-Limited Button.** Three buttons side by side (no guard, throttle, and a "busy" lock) with live API-call counters, so you can see why debounce is wrong for a button and why a Pay button needs a lock.
- **Rebuilt: Toast / Snackbar.** Callable from anywhere, even outside React, with at most three on screen and the rest queued. Hovering a toast pauses it, and duplicates are skipped.
- **Rebuilt: Tabs.** Built from data, so tabs can be added and removed. Full keyboard support, an underline that slides to the active tab, a panel that fades in, and a note on when CSS is enough and when to reach for Framer Motion.
- **Rebuilt: Accordion.** Smooth open and close, one open or several, arrow-key movement between sections, and closed sections that the Tab key correctly skips.
- **Rebuilt: Chat App.** Loads its history, shows each message as sending, sent or failed (with Retry), never shows a message twice, and has a typing indicator in both directions.

Every template is checked on each build by clicking through the behaviour it promises.

**How JavaScript works under the hood: four new interview questions** in the JavaScript guide, written in plain language with a short answer first and small examples you can run:

- **Q31: What happens when the browser runs your JavaScript?** The engine (like V8) versus the browser or Node around it, and why `setTimeout` isn't actually part of the language. Then the four steps: read the code, turn it into simple instructions, speed up the parts that run often, and undo that when a guess turns out wrong. Includes a demo showing that one syntax error stops the whole file before its first line runs.
- **Q32: What is an execution context, and how does the call stack work?** A stack of plates you can watch being added and removed, what "hoisting" really is (it's a setup step, not code moving), and what a stack overflow looks like.
- **Q33: How do function references work, and what is the difference between `fn` and `fn()`?** A function is a value you can pass around. Covers the three bugs that come from mixing them up: `setTimeout(save(), 1000)` running straight away, `removeEventListener` silently removing nothing, and a method losing its `this` when passed on.
- **Q34: What is a Web Worker, and when should you use one?** A second JavaScript thread for heavy work, why it can't touch the page, when it helps and when it doesn't (it won't make `fetch` faster), and the four kinds of worker people mix up, including Service Workers and Node's `worker_threads`.

**The event loop answer (Q6) now starts with a simple version**: one thread, a waiting line, and a loop that asks "is anything still running?", with a three-line example, before going into the details.

**Nine new "guess the output" questions about objects** in the JavaScript guide (tricky Q18 to Q26, under *Objects & References*). Each one turns on whether you are looking at a new object or another reference to an existing one:

- **Objects as keys:** why two different objects used as keys overwrite each other (they both become `"[object Object]"`), and why a `Map` doesn't have the problem.
- **Key order:** why `Object.keys` puts `"1"` and `"2"` first, and why `"-1"` and `"01"` don't count as numbers there.
- **Spread copies one level:** changing the copy's name leaves the original alone, but changing its city or its array does not.
- **Passing objects to functions:** why changing a property reaches the caller but reassigning the parameter doesn't.
- **`new Array(3).fill({})`:** one object in every slot, the classic "setting one cell sets the whole column" bug.
- **`JSON.parse(JSON.stringify(obj))`:** exactly what it silently loses (dates, `undefined`, functions, `NaN`, `Map`).
- **`structuredClone`:** how it keeps circular references and real dates, and why it throws on functions.
- **`Object.freeze` is shallow:** nested objects stay writable, and a blocked write only throws in strict mode.
- **Spread and getters:** the copy gets the getter's value at that moment, not the getter itself.

Every question has a line-by-line table explaining each printed line, and every output was run and is now checked on every build.

**New coding challenge: Max Consecutive Ones.** Given an array of 0s and 1s, find the longest run of 1s in a row. The catch is that it asks for the longest *run*, not how many 1s there are: `[1,1,0,1,1,1]` has five 1s but the answer is 3. The tests also catch the most common slip, a run that reaches the end of the array and never gets counted. The solution and Explain walkthrough include the usual follow-up, "what if you can flip up to k zeros?", solved with a sliding window.

**Clean Mixed Array: an easier no-built-ins solution.** The version that bans `sort`, `Set` and `filter` used to do everything in one loop, and that made it hard to follow. There's now a simpler answer that comes first: keep each number once, then **bubble sort** the result (swap neighbours that are out of order until nothing moves). It takes one sentence to explain, and the Explain walkthrough steps through both passes. The one-pass "sorted as you go" version is still there as the follow-up.

## v1.7.3 (September 2026)

**Nine additions from another real interview debrief**, this time a Frontend Developer loop at a large IT services firm: a technical round, a managerial round and HR. Of the 25 questions asked, 11 were already covered, and these close the rest.

**Agile and delivery questions, which had no home in the app at all.** The Behavioral guide covered conflict, failure and "why are you leaving", but never once asked about sprints. Four new questions:

- **Behavioral Q22: requirements that change mid-sprint.** Three questions to ask before touching code: is it new or a clarification, what does it replace, and how far along are we. The rule behind all of them: scope can change, but never silently.
- **Behavioral Q23: not finishing within the sprint.** What the interviewer listens for is not the miss, it's *finding out on the last day*. How to spot it early, and the three honest options: cut scope, get help, or carry it over with a fresh estimate.
- **Behavioral Q24: prioritising several tasks at once.** A five-step order (production issues, then anything blocking someone else, then sprint work, then quick requests, then nice-to-haves), and why you don't settle a conflict between two requesters yourself.
- **Behavioral Q25: dependencies on other teams.** Agree the contract first, build against a mock so you aren't waiting, and escalate the *trade-off*, not a complaint.

**Behavioral Q26: "Why do you want to join our company?"** It fails most often because the answer could be said to any company. A three-part structure (something specific about them, something specific about you, how the two connect), plus a section on what actually works for **IT services and consulting firms**, where the honest reasons (variety, scale, structured growth, client-facing skills) are different from a product company's.

**React Q63: what hooks are and what each one is for.** One table with a "reach for it when…" line for every built-in hook, why hooks replaced classes, and why call order is the reason the rules of hooks exist. Links to the full reference in §6.2.

**JavaScript Q28: `map` vs `filter` vs `reduce`.** Choose by the shape of the result: same count changed, fewer unchanged, or one out of many. Includes the three gotchas interviewers love: `['1','2','3'].map(parseInt)` giving `[1, NaN, NaN]`, `filter(Boolean)` quietly dropping `0`, and `reduce` with no initial value throwing on an empty array.

**New coding challenge: Clean Mixed Array.** The exact hands-on task from that interview: take an array of numbers mixed with characters, keep only the numbers, remove duplicates and sort. Easy on paper; the tests catch the three real traps: `typeof NaN` is `"number"`, the string `"7"` isn't a number, and `[10, 9, 1].sort()` gives `[1, 10, 9]` because sort compares text by default. Comes with five solutions and a step-by-step Explain walkthrough. One keeps an explicit "seen" table and sorts at the end, for when `Set` is banned but `sort` isn't. One of them uses **no built-ins at all**: no `sort`, no `Set`, no `filter`. It keeps the result sorted as it goes, so a duplicate always lands on a copy of itself and deduping comes free. Another covers the variant where numeric strings count.

**Six more from a list of senior "explain why it breaks" questions.** Of ten, four were already answered well: out-of-order search responses, the reflow/repaint/compositing pipeline, "works in Postman but not the browser", and token storage. The other six were explained somewhere but never asked the way an interviewer asks them.

- **JavaScript tricky Q17: how can already-resolved Promises freeze the UI?** "Asynchronous" means *later*, not *on another thread*. The microtask queue drains completely before the browser can paint or handle a click, so a chain of small `.then` steps blocks the page as surely as one long function. A runnable demo holds a 0 ms timer for 200 ms, and a second shows the fix: yield to the task queue.
- **JavaScript Q29: stale closures vs closures that hold memory.** Same mechanism, opposite symptoms. One is attached to an *old* variable and shows the wrong value; the other is still reachable and keeps the right value alive for too long. Includes a comparison table and the fixes for each.
- **JavaScript Q30: why an async error escapes `try/catch`.** The `try` block's stack frame is gone by the time the callback runs. Covers the four places to handle it, in order of preference, and why forgetting one `await` is the usual cause.
- **JavaScript Q9, rewritten: the spread copy that changed the original.** Exactly where the shared reference survives (every nested object), why it becomes a React bug where nothing re-renders, and why the fix is copying the path you change, not a deep copy.
- **JavaScript Q7, rewritten: the full prototype lookup.** Own property, then the chain, then `null`; getters running with the original object as `this`; why a write creates a new property instead of changing the prototype; `in` vs `Object.hasOwn`; and objects with no chain at all.
- **React Q64: memoization that made the app slower.** Memoization is a bet that inputs repeat and the skipped work is expensive. The four ways that bet loses, including a demo cache with 100,000 entries and zero hits, and how to prove it with the Profiler.

Every output shown in these answers was run, and is now checked on every build.

**Fixed: playground buttons overlapping on laptop screens.** When the toolbar was too wide for one row, the "solved" counter slid underneath the Templates button. The toolbar now moves to its own row when space runs out, and the editor's small Auto-close / Wrap / Format buttons no longer break their labels across two lines.

**Fixed: the Remove Duplicates solution broke its own rule.** The challenge says not to use `Set`, and the solution marked best used a `Set`. It now uses a `Map` as the "seen" table, with a note on why a `Map` and not a plain object: object keys are always strings, so `1` and `"1"` would be treated as the same value. The `Set` one-liner is still shown, labelled as what you'd write in real code, and the Explain walkthrough was updated to match.

**Four more interview questions.**

- **Redux Toolkit Q18: what `configureStore` is for.** What one call replaces, the development-only checks for mutated state and non-serializable values (and why they cost users nothing), and the classic mistake: passing your own middleware list silently removes thunk and both checks. Checked against the official Redux Toolkit docs.
- **Behavioral Q27: how you mentor junior engineers.** A method rather than a list of kind things: find out where they are, hand over ownership in stages, use code review to teach, make it safe to be stuck. Plus how to show it worked, with outcomes you can observe, like time to independence and review comments that fall over time.
- **Frontend Architecture Q18: designing a reusable component library.** Tokens, primitives, components and patterns as layers; an API built on composition rather than ever more props; accessibility and theming built in; packaging so apps only pay for what they use; and the part that decides whether it survives: versioning, deprecations and codemods, so teams can actually upgrade.
- **React Q65: SSR vs CSR, and what each does to SEO and performance.** What a crawler actually receives, why link previews in Slack or LinkedIn break on client-rendered pages, which speed metrics each approach helps and hurts, and why server rendering moves the cost rather than removing it.

## v1.7.2 (September 2026)

**Four questions added from a real interview debrief.** Someone sent through the list of what they were actually asked; 14 of the 18 topics were already covered, and these four were genuine blanks.

- **Modern CSS Q11 — `position: sticky`.** What it actually is (relative until a threshold, then fixed *within its scrolling ancestor*, and never escaping its parent), a comparison across all five positioning schemes, and the three reasons it silently does nothing: no threshold set, an ancestor that quietly became the scroll container, or a parent too short to stick inside. The guide talked about sticky in seven places and had never once asked about it.
- **React Router Q13 — 404 / Page Not Found.** The catch-all `path="*"` route, and why its position in the list no longer matters in v6 (routes are ranked by specificity, not matched in order). Separates the three different 404s people conflate: a URL matching no route, a route whose *data* is missing, and the server 404 that happens before React ever loads on static hosting — plus why a client-rendered 404 still returns HTTP 200 to Google.
- **React Q61 — infinite re-render loops.** The four shapes they come in, the mechanism in one sentence, and fixes in the order worth trying — starting with "should this effect exist at all", because most of these are derived state in disguise. Ends with the fix that isn't one: emptying the dependency array stops the loop and buys you a stale closure, trading a loud bug for a silent one.
- **Web Performance Q11 — a page making a dozen API calls.** The count is rarely the problem; the shape is. Includes a runnable demo showing four requests taking **800ms in sequence and 200ms in parallel** — same work, four times the wait. Then the order to fix things in, and the honest limit: the frontend can hide latency but it cannot remove a round trip, so eight resources for one screen is a server conversation.

**Two new entries in the JavaScript comparison tables: Map vs Object, and Array vs Set.** Both were genuinely absent — zero mentions anywhere in the app — and both are asked constantly.

The **Map vs Object** table leads with the thing that causes every real bug in this comparison: object keys are *strings*. `obj[1]` and `obj['1']` are the same key, every object used as a key stringifies to `"[object Object]"` and collides into one entry, and a plain `{}` already "has" a key called `toString` because it inherits one. It also covers the iteration-order rule people get wrong — integer-like keys come first in ascending numeric order, so `{ b:1, 2:1, a:1, 1:1 }` iterates `1, 2, b, a`, while a Map is always pure insertion order.

The **Array vs Set** table is built around membership: `includes` scans, `has` is a hash lookup, and everything else follows from that. Includes the `NaN` asymmetry (`includes` finds it, `indexOf` never does), that Set silently converts `-0` to `+0`, and the gotcha worth volunteering in an interview — `new Set([{id: 1}, {id: 1}])` has size **2**, because Set dedupes by reference, so it does nothing at all for objects parsed out of JSON.

Every claim in both tables was verified by running it.

**The polyfill section is now two sections, and everything in it is tagged by difficulty.** It had 32 entries and all of them were *spec methods* — re-implementations of things JavaScript already ships. That is only half of what "polyfill" means in an interview; the other half is utilities that were never part of the language, and that half had nowhere to live.

- **Spec Polyfills** — the original 32, unchanged.
- **Utility Implementations** — nine new ones: `once`, `curry`, `deepEqual`, `promisify`, `Promise.prototype.finally`, `myInstanceof` (walking the prototype chain by hand), `myNew` (what the `new` operator actually does, including the step where an object return replaces your instance), **retry with exponential backoff**, and **a Promise written from scratch** with the full then-chaining state machine — the standard senior-level async question, and the natural step after `Promise.all`.

**Every template in both sections, and every coding challenge, now carries an Easy / Medium / Hard tag**, so the list sorts toward what is worth doing next instead of leaving you to work down it in file order. The difficulty filter chips work while browsing templates now, not only challenges, and the counts beside them describe the set you are actually looking at.

The tags are opinionated on purpose. `Array.join`, `Array.reverse` and `String.repeat` are Easy because nobody has ever been told apart by them — they are warm-ups. `Function.bind`, `Array.sort`, `JSON.stringify`, `JSON.parse` and the Promise implementation are the ones that carry weight.

Worth knowing if you are hunting for something: **debounce, throttle, memoize, deep clone, EventEmitter, compose/pipe, auto-retry and the concurrency-limited task runner were already in the app** — they live under Coding Challenges, where you write them yourself against tests rather than read a finished version. The playground splits content by whether you solve it or read it, not by what family the function belongs to.

**Three more missing-number challenges in the Code Playground.** The playground had `Find Missing Number` — one value absent from a run of 0 to n — and nothing else from that family. The three variants people actually get asked are now there too, taking the playground to **186 templates** and **135 challenges**.

They look alike and are not. Each one takes away a guarantee the previous one leaned on, and the technique has to change as a result:

- **Find All Missing Numbers** (Medium) — the array holds values from 1 to n with duplicates, so several values go missing at once. The trick worth knowing: a value belongs at a predictable slot, and every slot already carries a spare bit you can write to — its sign. Flip signs on the first pass, then report every slot still positive. No second array.
- **First Missing Positive** (Hard) — now the array holds anything at all: negatives, zero, duplicates, numbers far bigger than the array. Sorting is too slow and a Set uses too much room. The realisation that unlocks it is that with n slots the answer can never be more than n + 1, so you are choosing between n + 1 candidates and already own enough space to record them. The solution also explains the one-line guard that stops the loop hanging on a duplicate — the most common way to fail this question.
- **Missing Term in Arithmetic Sequence** (Medium) — the terms no longer step by one, they step by some constant, and one middle term is gone. Recover the step from the endpoints, then binary-search for the point where the sequence stops matching what it should be, which finds the answer without reading the whole array.

Each ships with a full multi-approach solution and a step-by-step Explain walkthrough, and each closes with the trade-off that decides which version you would actually write — including why the fast binary-search answer quietly breaks when the step is not a whole number, and why the in-place trick that saves memory is usually the wrong choice in real code, because it destroys the array it was handed.
**A second interview debrief, and five more gaps closed.** Another list of what someone was actually asked — 23 topics across a fundamentals round and a system-design round. Eighteen were already covered; these five were not.

- **A `Button` template in React Machine Coding.** It reads as a CSS exercise and is not one: what an interviewer is actually grading is the prop API. Variants and sizes as closed sets, everything unknown passed straight through so it can stand in for a real `<button>`, a `loading` state that is not the same thing as `disabled`, `type="button"` by default — the one-line detail that stops every secondary action in a form from submitting it — and an escape hatch so a button that navigates can be a real link.
- **`React from Scratch` in the playground.** `createElement`, components, and `useState`, in about eighty lines, rendering to a string you can read. The payoff is the last section: it takes a hook and puts it behind an `if`, and you watch one variable's state land in another. The rules of hooks stop being a lint rule you obey and become an obvious consequence of how they are stored.
- **JavaScript Q27 — arrow vs normal functions.** Five differences, but only one is real: an arrow has no `this` of its own, and the other four follow from the same decision. Includes the case that catches people — a method written as an arrow inside an object literal can never see its own object, no matter how it is called.
- **React Q62 — the class lifecycle mapped to hooks.** The table, and then the four places it breaks: `componentDidMount` runs before paint and `useEffect` runs after it, there is no `prevProps`, error boundaries are still class-only in React 19, and one lifecycle method usually becomes several effects. With a runnable demo of the bug the class shape invites — forgetting to resubscribe when a prop changes.
- **Web Performance Q12 — reflow, repaint and compositing.** Why `transform` and `opacity` are the two properties everyone says are free: not because they are cheap, but because they cannot move anything else, so the browser can skip straight to the last stage. Plus layout thrashing, and the read-triggering properties worth knowing by name.


## v1.7.1 (September 2026)

**AI-Augmented Development is now its own category, not a corner of AI Engineering.** They answer different questions: AI Engineering is about *building* AI features — RAG, agents, MCP, LLM plumbing — while this is about *using* AI tools to build anything, which is a workflow and governance topic that applies to a team shipping a payments service with no AI in it at all. It sits in the sidebar as **AI-Augmented Development → Using Claude Code Efficiently**.

**It also gained a section on the tooling ecosystem** — skills, plugins and the third-party tools worth knowing. Covers how a skill loads only when its description matches what you are doing (which is the answer to a context file that has grown too long), the plugin marketplace mechanism, and the tools that change real numbers: `ccusage` for seeing token spend per developer, status-line plugins that show context usage before you hit the cliff, and **`caveman`**, the open-source skill that compresses the model's prose output.

`caveman` gets a close look because its numbers are a lesson in themselves. The headline is a **65–75% cut in output tokens**, and that is true — of the discursive prose it acts on. But prose is only about a quarter of a session; measured over a whole session the saving is **roughly 4–10%**. Both figures are honest and they have different denominators, which is exactly the kind of claim that falls apart in an interview if you quote the headline without it. The section also lists the structural levers that dominate cost before any compression tool matters, and the supply-chain questions to ask before installing a plugin — because a plugin can carry hooks and MCP servers, which means installing one is installing code that runs on your machine.

**New guide: AI-Augmented Development — using Claude Code efficiently.** Written for the interview question behind the resume line, not as a feature tour: what you changed about how a team works, where the model is allowed to act, what it can never do, how its output is reviewed, and how you know it helped.

It opens with the number that reframes the whole conversation — a study of 10,000+ developers across 1,255 teams found high-AI-adoption teams completed 21% more tasks and merged 98% more pull requests, while review time rose 91%, PR size grew 154% and bugs rose 9%. Generation got cheap; verification did not, and everything in the guide is a response to that.

Covers the distinction that matters most — **instructions versus guarantees**: a context file is a request the model may ignore, while hooks and permissions are the only things that actually enforce. Then context scoping (the window is the bottleneck, not the model), prompt scoping as specification rather than question, the plan → implement → review → report pipeline tiered by blast radius, subagents as independent reviewers that must *not* be given your reasoning, a four-guard hook set with the design lessons that keep guards switched on, permission lists, review standards tuned to how AI code fails (read the test diff first), Claude Code versus Copilot as different granularities, staged team rollout, and why DORA alone stops being enough once a model writes much of the code.

Closes with nine interview questions written as answers you can say out loud — including who is accountable when AI-generated code causes an incident — and six tricky ones, such as what to do when half the team disables your new guards within two weeks.

**A full correctness audit of all 32 JS polyfills — 243 scenarios, ten more bugs found and fixed.** Every polyfill was run against the real built-in across every edge case that distinguishes them: holes in sparse arrays, `NaN`, `-0`, negative and out-of-range indices, `thisArg`, empty inputs, missing arguments, mutation during iteration, control characters, and the error each one should throw.

The ten that were wrong:

- **`reduce` with no initial value** started from `this[0]` rather than the first *present* element, so `[ , , 3].reduce(fn)` gave `NaN` instead of `3`, and an array of nothing but holes returned `undefined` where it should throw.
- **`indexOf` and `lastIndexOf` matched holes.** `[ , 1].indexOf(undefined)` returned `0`; a hole is an absent index, not one holding `undefined`, so the answer is `-1`.
- **`splice()` with no arguments threw a `RangeError`** instead of removing nothing and returning `[]`.
- **`Object.create(null)` did not produce a prototype-less object** — the classic `new F()` trick silently falls back to `Object.prototype`, which defeats the main reason to call it.
- **`JSON.stringify` did not escape control characters**, so a string containing a newline or a tab produced output that `JSON.parse` rejects — it was emitting invalid JSON.
- **`JSON.parse` ignored `\uXXXX` escapes** (and `\r`, `\b`, `\f`), returning the literal characters instead of decoding them.
- **`map` re-read the array length on every step**, so pushing during iteration extended the loop; the real one fixes the length before it starts.
- **`slice` filled holes in** rather than copying them as holes.

All 243 scenarios now match the built-in exactly, and they run on every build so they cannot drift back.

**A comment could turn a plain-JavaScript snippet into a React one.** The playground decides whether your code is JSX by looking for things like a `<div>` or a `render(` call — but it was looking at the *whole* file, comments included. So a teaching comment in the `Array.map` polyfill that mentioned a gap in an array as `<hole>` was read as an HTML tag, the snippet was run as a React component, and it finished by complaining "No render() call detected". It now ignores comments entirely, which it should have done from the start: a detector that reads comments is a detector that reads English.

The same check also assumed that calling `useState` means React. The "Implement useState (Basic)" challenge builds `useState` from scratch in plain JavaScript, so it was misread too — calling a function you defined yourself is not evidence of React, and the check now says so. All 183 templates are now verified to be detected as the language they actually are.

**Three playground templates threw the moment you pressed Run.** `Array.filter` ended with `users.myFilter(...).myMap(...)` — but `myMap` is defined in the *Array.map* template, and every snippet runs on its own, so it failed with `myMap is not a function`. `Array.flat & flatMap` had the same problem inside its own implementation. Both now use the native method for the part that is not the subject of the lesson.

**And "How to Write a Polyfill" really did break the page.** Among its list of conventions was this, as an example of what *not* to do:

`Array.prototype.map = function () {};   // breaks every library`

That line was live code, so running the template genuinely destroyed `Array.prototype.map` — doing exactly the damage the comment warned about, and corrupting the rest of its own output from that point on. The bad examples are now shown rather than executed, which is also a better demonstration: the reason not to write that line is that it takes effect immediately and globally.

**All 45 plain-JS reference templates are now executed on every build**, not merely parsed. That gap is what let these through: the existing gate checked that every template *compiles*, which cannot see a call to something that was never defined.

**Reference templates can now be marked complete, so their progress counts actually move.** The template picker has always shown a "done / total" figure beside every category — but the Mark complete button only appeared for *challenges*, so the 51 reference snippets, including all 32 polyfills, sat at `0/32` forever with no way to change it. The button now appears for any open template (labelled "Mark read" for reference material, since there is nothing to solve), and the header chip counts whichever set you are looking at — challenges while a challenge is open, reference templates while one of those is open.

**Two HLD round-2 questions were missing, and both are now covered.**

**Designing a Pinterest-style masonry grid** is the eighth worked design in the Frontend System Design guide. It gets asked instead of "design a feed" because every assumption a feed relies on is false here: a feed is one column of roughly uniform rows, while a masonry grid is N columns of items whose heights you do not know until the image loads — which breaks virtualisation, breaks scroll restoration, and makes layout shift the default. The design turns on one decision: **the server sends each image's dimensions**, so every card's height is known before a byte of image data arrives, which is what makes the layout computable, the grid virtualisable and the layout shift avoidable. Also covers greedy shortest-column packing (and why CSS `column-count` gives the wrong reading order), reserving space with aspect-ratio boxes, the image-delivery details that are most of the performance, restoring scroll by item id rather than pixel offset, and a table of what breaks at scale.

**"Walk me through the HLD of a system you have built"** is now an interview question in the same guide. It is the most common round-2 question and the one people prepare least, because it looks like it needs no preparation. The answer gives a fixed order to speak in — modules, component hierarchy, API contracts, caching, performance, non-functional requirements — with what to actually say at each layer, why every cache needs an invalidation story, what availability and response time mean *on the frontend* specifically, and the advice that lands best: volunteer one thing you got wrong, and have three numbers ready.

**Fact-checked all 32 JS polyfills by running them against the real built-ins — four were wrong.** A polyfill is a claim that it behaves like the thing it replaces, so every one was executed side by side with the native method across ~110 edge cases (sparse arrays, `NaN`, negative indices, `thisArg`, empty inputs, `new`, malformed input).

**`JSON.parse` looped forever on malformed input.** Give it `{oops}` or `[1,` and it never returned — its array and object loops could only exit on a comma or a closing bracket, so running off the end of the string left it spinning. In the playground that meant pressing Run froze for three seconds and then reported a timeout. It now reports a proper `SyntaxError` telling you the position, and it also rejects empty input and trailing characters rather than silently returning `0`.

**`Array.map` dropped holes.** `[1, , 3].map(x => x * 2)` gives a three-element array with the hole preserved; the polyfill returned two elements, because it built the result with `push`. It now preallocates and assigns by index, which is why the real one behaves as it does.

**`Array.find` and `findIndex` skipped holes** — but those two methods are precisely the ones that do *not* skip them; they visit every index and pass `undefined`. Fixed, with a note explaining why the guard that belongs in `map` does not belong here.

**`Function.bind` ignored `new`.** Constructing a bound function must ignore the bound `this` and use the fresh instance while still applying the pre-filled arguments — the JavaScript guide already said reproducing that asymmetry is the point of the exercise, and the polyfill did not. `new Bound()` now works and `instanceof` is correct.

Two more differences turned out to be deliberate simplifications that were already documented (sort is not stable; `Object.assign` skips symbols), and two that were not are now labelled: `call`/`apply` boxes a primitive `this`, and `concat` reads holes as `undefined`. Every polyfill is now checked against its built-in on each build.

**Checked a 16-topic React interview list against the guide — three real gaps, now closed.** Thirteen were already answered properly (Node vs Element vs Component, controlled vs uncontrolled, Fragments, `useEffect` vs `useLayoutEffect`, reconciliation and Fiber, hydration, `useMemo`/`useCallback`, never mutating state, code splitting, testing, `useReducer` vs `useState`). The missing ones are now **React Q58, Q59 and Q60**:

**`createElement` vs `cloneElement`** — what JSX actually compiles to, versus copying an element that already exists. Covers the three details that get probed: props are shallow-merged so a cloned `onClick` *replaces* the original rather than running alongside it, children are replaced rather than merged, and `key`/`ref` come from the new props. Plus where it is genuinely used (compound components like `<Tabs>` handing each `<Tab>` an `isActive` it could not know at authoring time) and why context or a render prop is usually better in application code.

**Higher-order components** — what they are, and the honest answer that a custom hook is strictly better for nearly everything they were invented for: no wrapper hell, no silent prop collisions, and the source of a value is visible at the call site. But also what hooks *cannot* do — a hook can add behaviour, it cannot change what a component renders — which is why `React.memo`, `forwardRef`, error-boundary wrappers and route guards are still HOCs.

**`useImperativeHandle`** — customising what a parent gets when it reads a ref, and why the point is *narrowing* rather than access: hand back the raw DOM node and every internal detail becomes your public API forever. Includes the dependency array people forget, the verbs-not-data test for whether you should be using it at all, and the React 19 changes (`ref` is an ordinary prop, ref callbacks can return a cleanup).

**And "why are array indices bad keys" is now answered properly.** The keys question previously had one sentence on it. It now explains that the index describes *where an item sits* rather than *which item it is*, shows the failure with an uncontrolled input where deleting the first row leaves the typed text behind on the wrong one, lists what else follows the key (focus, scroll position, transitions, `memo` bailouts, child state), says when an index genuinely is fine, and covers why `key={Math.random()}` is worse than an index.

**Two new React machine-coding challenges, from a gap audit against a list of React LLD interview questions.** Seven topics were checked against everything in the app: infinite scrolling, live search filtering, `useFetch`, authentication and protected routes were already covered well — but **dynamic form fields** and **multi-step forms** had nothing, and **drag-and-drop** had a template with no question anywhere.

**Form with Dynamic Fields** — add and remove rows in a form, with per-row validation, errors derived rather than stored, submit gated on the whole set being valid, and per-row accessible labels. It is built around the detail that actually gets graded: keying rows by a stable id rather than by array index, and the template explains what breaks when you don't (remove the first row while the second has text in it, and the text stays behind on the wrong row).

**Multi-Step Form (Wizard)** — three steps sharing one state object owned by the parent, because each step unmounts when you move on and state kept inside it is destroyed. Per-step validation as a lookup table, errors revealed on the attempt to advance rather than on arrival, and Back that never validates, so a user who mistypes something is never trapped on a step.

Both come with full Explain walkthroughs. **React Q57** is new too — implementing a reorderable drag-and-drop list: tracking ids instead of positions, why `preventDefault` in `onDragOver` is mandatory (without it nothing drops at all), keeping per-move updates out of state, and the keyboard and screen-reader support that native HTML drag-and-drop simply does not provide.

**The type-safe event emitter question was a code dump with no prose.** It now opens with the idea the whole design rests on — one map type from event name to payload type, so every method becomes a lookup — and then explains the one genuinely clever line rather than narrating every step: `emit`'s rest parameter is typed as a **tuple chosen by a conditional type**, which is what makes the *number* of arguments depend on which event you name. An empty tuple means "nothing more", a one-element tuple means "exactly one, of this type", and that single line is what rejects `emit('click')` with no payload and `emit('load', …)` with one. The obvious alternative, `payload?: Events[K]`, does not work — it makes the argument optional for every event, including the ones that require it. Closes with the two things worth volunteering in an interview: the typing lives only at the `on`/`emit` boundary, and `off` needs the same function reference, which is why `on` usually returns an unsubscribe function.

**`as const` says `readonly`, so why can you still change the value?** Because `readonly` is a **compile-time** constraint and nothing else. Q10 now says so directly, shows the `TS2540` error you get in an editor, and shows the emitted JavaScript — where `as const` has vanished entirely and the assignment simply works. It also warns that the **"Try it" button cannot show you this**: the playground strips types and runs the JavaScript, so a readonly violation runs happily there. TypeScript protects you while you write code, not while it runs; `Object.freeze` is the runtime equivalent. Plus two properties that catch people out: `as const` is deep, `Readonly<T>` is shallow, and neither survives being aliased to a mutable type.

**"Can't I just use `Pick` and `Omit` instead of `Extract` and `Exclude`?"** — now **Q28** in the TypeScript interview questions, because the four look interchangeable and are not: `Pick`/`Omit` select **properties by key** from an object type, while `Extract`/`Exclude` filter **members of a union** by assignability. `Pick<'a' | 'b' | 'c', 'a'>` is a compile error, and the error message is the explanation — `keyof` a union of string literals gives you the shared `string` methods, not the members, so there is nothing to pick. Pointed the other way, `Exclude` on an object type does not remove a property; it tests the whole type and collapses to `never`.

They are related, though, and it is the best thing to say in an interview: **`Omit` is built from `Exclude`** — `Pick<T, Exclude<keyof T, K>>` is the actual standard-library definition. One gotcha falls straight out of it: `Pick` constrains its keys to `keyof T` but `Omit` does not, so `Pick<User, 'nope'>` is an error while `Omit<User, 'nope'>` silently returns `User` unchanged — rename a field and nothing tells you.

**"Can a `type` be extended like an `interface`?"** — the Interface vs Type table said "Yes (via `&`)" and left the interesting half unanswered, so §3.3 now has a section on it. Yes, with `&` rather than the `extends` keyword, and the two mix in both directions: an interface can extend a type alias, and a type can intersect an interface.

The difference that matters is **what happens on a conflict**. `extends` checks compatibility and rejects an incompatible override at the declaration; `&` just combines, so redefining `id: number` as `id: string` produces no error at all — the property quietly becomes `never`, and you find out at every place you try to use it instead. That is the strongest practical reason to use `interface` for object shapes other people will extend. Also covered: why `interface X extends SomeUnion` is an error while `SomeUnion & { … }` is fine, and why the DOM and Node type definitions are interfaces (only interfaces can be added to from your own code).

**The TypeScript guide was fact-checked with the TypeScript compiler.** Every type claim it makes — 122 code blocks and all 19 tricky questions — was put through `tsc` rather than reviewed by eye, because a claim about what the compiler does is checkable by the compiler.

**Two examples claimed an error that never happened.** Both `NoInfer` examples (§10.7 and tricky Q18) said the second call fails with `'light' is not assignable to 'dark'`. It compiled cleanly. The reason is the interesting part: without a constraint, a generic inferred from a string argument widens to `string`, so there was no narrower literal type for `NoInfer` to protect — it looked like the feature did nothing. Both now carry `extends string`, which is what preserves the literal, and both explain why leaving it off is an easy way to "disprove" `NoInfer` to yourself. The corrected examples are compiled on every build.

Everything else held up: the inferred types in all 19 tricky questions, the narrowing results, conditional-type distribution, `keyof` on index signatures, template-literal expansion, the `satisfies` behaviour, the utility types, the contravariance answers, the `erasableSyntaxOnly` results and the enum output were all confirmed exactly as written — including the three compiler error messages quoted in §1.1, which match word for word. The enum question's output now shows `Up` rather than `"Up"`, which is what actually prints.

The 2026 compiler section was re-checked against Microsoft's release notes: TypeScript 7.0 on 8 July 2026, 6.0 on 23 March 2026 as the last JavaScript-based release, the 8–12× speed-up, the VS Code benchmark and the Go rewrite's codename all correct. One point has been sharpened — 7.0 ships **no** programmatic API at all rather than an unstable one, which is why tooling that drives the compiler as a library has to stay on 6.0, installable side by side as `@typescript/typescript6`.

**A full audit of all 90 guides — and the "Try it" button now works on 129 blocks where it used to fail instantly.**

Any example using `await` at the top level — most of the database, payments, browser-API and testing snippets — failed with a syntax error the moment you pressed Try it, before running a single line. The cause was in the app, not the guides: the playground ran your code as a plain script, and a script is not allowed to `await` at the top level. It now handles that automatically, and an async error that used to vanish silently shows up in the console panel instead. Every other snippet runs exactly as before.

**One answer was wrong, and executing it found it.** The coercion question showed `console.log({} + [])` and claimed the answer was `0`. It is actually `"[object Object]"` — the famous `0` only happens when `{}` starts a *statement*, which is what you get typing it into a browser console, not what happens inside `console.log(...)`. The example now demonstrates both cases and explains that the difference is about **parsing**, not about `+` behaving differently with objects.

**Every external link in every guide was checked — 551 of them.** Eleven were dead and two had moved house. Fixed: the Cloudflare, Apple, Python, Google Play, React Router, Socket.IO, TanStack Query, Chrome, Zustand and RFC references, plus Partytown and Starlette, which both changed domains. One citation pointed at a GitHub repository that does not exist and has been replaced with a real benchmark.

**The Frontend Tooling guide was contradicting itself.** Its earlier sections still said "Vite 6 (as of late 2024)", "npm 10", "pnpm 9" and "Turbopack is dev-mode only", while its 2026 Toolchain section correctly described Vite 8, Rolldown and Turbopack as the default for production builds too. The older sections have been brought up to date, and the `npx` example no longer teaches `create-react-app`, which was retired in February 2025.

**Everything version-sensitive was re-checked against primary sources** — the three Next.js CVEs, the TypeScript 7 release, ESLint 10, React Compiler 1.0, Vite 8, Rolldown and Next.js 16. All confirmed accurate.

**Four tricky questions now say what the feature *is* before asking something tricky about it.** Q12–Q15 cover `Object.groupBy`, iterator helpers, `using` and `Temporal` — four APIs a reader may never have met — and each went straight into a puzzle about them. Every one now opens with a plain-language description of the API and why it exists, followed by a **line-by-line table** mapping each printed line to the reason it printed. So "why is this `2`?" and "why is that `undefined`?" are answered directly, next to the output, instead of somewhere inside a paragraph.

**Fixed: one of those answers was wrong.** Q13 claimed that calling `chain.toArray()` a second time returns the remaining `[6]`. It returns `[]` — `take(1)` does not merely stop pulling, it *closes* the iterator underneath it, so the whole pipeline is dead. The corrected explanation is now checked on every build.

**New section: AI Engineering — five new guides.** AI now has its own category in the sidebar rather than one guide buried under Back End, with **75 guides across 9 categories** in total. The existing AI & LLM Engineering guide moved into it (same link — your bookmarks still work), joined by five new ones:

**Generative AI Foundations** — the mental model, for application engineers rather than researchers. What a generative model actually is, tokens and why they decide cost and limits, the transformer explained without maths, embeddings and vector space, the three training stages and why a model has a personality, sampling and why temperature 0 is not deterministic, the context window and "lost in the middle", reasoning models and when *not* to use them, hallucination as a consequence of the design rather than a bug, multimodality, how diffusion differs from an LLM, the prompting-to-fine-tuning ladder, open vs closed models, and inference economics.

**RAG** — a full guide to retrieval augmented generation, built around the idea that RAG is a search problem wearing an AI hat: the end-to-end pipeline, why parsing quality caps everything downstream, chunking strategies with real numbers, embeddings, vector indexes and the recall/latency dial, why hybrid search beats vectors alone, what a reranker does that retrieval cannot, query rewriting for follow-ups, context assembly, evaluating retrieval and generation separately, contextual retrieval and agentic RAG, production concerns like freshness and access control — and a diagnosis table that maps each symptom to its cause.

**Agentic AI & Multi-Agent Systems** — the agent loop and the five details that carry the production weight, tool design, the four budgets every agent needs, context engineering, memory, planning patterns, multi-agent topologies with an honest argument for *not* using them, human-in-the-loop, durability, evaluating outcome **and** trajectory, a failure-mode table, and the security model including the lethal trifecta.

**Model Context Protocol (MCP)** — what it is, the host/client/server architecture, the primitives and who controls each, transports, and a full treatment of the **2026-07-28 stateless revision** — the handshake and session header removed, multi round-trip requests, cacheable tool lists, header-based routing, the extensions framework, hardened OAuth, and why sampling and roots were deprecated. Plus the security section that matters: tool poisoning, rug-pull updates, and why three individually safe servers can leak your data.

**LangChain & LangGraph** — starting with the most common misconception, that they compete: LangChain is the agent library and it runs on the LangGraph runtime. Covers the v1 reset and what replaced what, `create_agent`, middleware as the customisation mechanism, state and reducers, checkpointers and threads, interrupts and the replay trap, streaming modes, multi-agent shapes, LangSmith, deployment — and when a framework is the wrong answer.

Each guide closes with interview questions, tricky questions and a cheat sheet, taking the app to **386 tricky questions across 52 guides**.

**Event bubbling and the event loop — two of the most-asked questions — were three bullet points each.** Both are now full answers.

**"Implement `once(fn)`" never said what `once` is.** It opened straight into the implementation, which is fine if you already know the pattern and useless if you don't. It now starts with what the wrapper does — the first call runs the function and remembers the result; every later call skips it and returns that same result — and points at the versions you have already used, `addEventListener(..., { once: true })` and Node's `emitter.once`. Then the four places you write your own: one-time setup, a submit handler that must not double-fire, a deprecation warning, a singleton.

The demo now shows it working — five calls, one "expensive setup running…", the same object returned every time — followed by a walkthrough of how the four lines do it, and why the async follow-up needs a different answer: cache the **promise**, not the result, or three callers arriving before the first finishes each start their own request. That version runs too, and its trap is named — a rejected promise is cached just as happily, so one transient failure poisons every future call unless you clear it.

**The `Object.groupBy` answer asked about Lodash and never mentioned it.** The question is "why is this not a drop-in replacement for Lodash's `groupBy`" — and the old answer went straight to string coercion and null prototypes without ever showing the Lodash call anyone is actually migrating from. It now starts there: what `_.groupBy(users, 'role')` does and returns, and the two things that quietly matter about it — `'role'` is a string rather than a function, and the result is an ordinary object.

Then a three-way comparison table and the four things that break a find-and-replace: the property-name shorthand does not exist natively (`Object.groupBy(users, 'role')` throws), the callback also receives the index, the result has no prototype so `.hasOwnProperty` is gone, and non-arrays are no longer accepted — Lodash groups a plain object or even `null` quite happily, the native version throws.

Then the part that decides between `Object.groupBy` and `Map.groupBy`, with a runnable demo: object keys can only be strings, so grouping `1` and `'1'` collapses them into one bucket, grouping by a field that is sometimes missing gives you a group literally named `"undefined"`, and grouping by objects puts everything under `"[object Object]"`. `Map.groupBy` keeps the key exactly as returned. And why the missing prototype is a feature: the obvious hand-written grouper actually **crashes** on a value called `__proto__`, because the lookup finds `Object.prototype` instead of nothing — that failure now runs in the guide, next to the version that cannot be corrupted.

**Five more interview answers went from a bullet list to an actual answer — and two of them had code that could not run.**

**`call`, `apply` and `bind`** was three bullets and a three-line example. It now leads with *why* they exist — `this` is chosen by the call site, so a detached method has nothing to take it from — then the argument-shape difference (apply takes an array; that is the only difference from call), and the five things about `bind` that interviews actually probe: it returns a function instead of calling one, the binding can never be changed afterwards, every call hands back a *new* function (which is why `.bind(this)` in a React render defeats `React.memo` and why `removeEventListener` silently fails), it pre-fills arguments, and `new` beats it. Plus what arrow functions do to all three (nothing — there is no `this` to set), how a primitive `thisArg` gets boxed in sloppy mode, and where each one still appears in real code now that spread has replaced `apply` and arrows have replaced most of `bind`.

**`WeakRef` and `FinalizationRegistry`** had a code block that threw `ReferenceError` the moment you pressed Try it — it registered an object that was never defined. The answer now explains what "weak" means (a normal reference keeps an object alive; these do not), why `deref()` must be read into a local exactly once, and the distinction most answers miss: dropping the last reference makes an object *eligible* for collection, not collected — the runnable demo shows `deref()` still returning it. Plus the trap that makes the whole API useless (holding the object itself as the callback's held value keeps it alive forever), why `WeakMap`/`WeakSet` are usually the right answer instead, and the three cases where these genuinely earn their place.

**`for...in` vs `for...of`** now covers **`forEach`** as well, since that is the third option everyone actually reaches for. A comparison table across seven axes, then the parts that bite: `for...in` returns *string* keys and walks the prototype chain, a plain object is not iterable (that `TypeError` is the most common surprise here), and the two things `forEach` cannot do — you cannot `break` out of it, and it does not await, demonstrated with a runnable snippet where `forEach` returns before a single callback has finished. Also what a hole in a sparse array does to each of the three.

**Debounce with leading and trailing** was a code block with no prose at all. It now says what debouncing is, what the two edges mean — leading fires on the first call of a burst, trailing fires once the calls stop — with a timeline diagram and the everyday split (a search box wants trailing, a submit button wants leading). Then a line-by-line walkthrough of the implementation: which line *is* the debounce, how the pending timer identifies the leading edge, and why clearing the saved arguments after firing is what stops a single isolated call firing twice. The demo runs three configurations over the same keystrokes so you can see which characters reach the function and which never do. Closes with what the implementation still lacks — `cancel()`, which React code needs in effect cleanup, `flush()`, and the fact that a debounced function cannot return a value.

**`freeze` vs `seal` vs `preventExtensions`** now explains that they are one scale, each a superset of the last: seal is preventExtensions plus "cannot delete", freeze is seal plus "cannot change". With the trap that matters most — those writes fail **silently** in a plain script and throw only under strict mode, which is to say inside every ES module — plus a deep-freeze that guards against cycles, and the three things freeze does not stop: a setter still runs, `Map` and `Set` contents are untouched, and `const` is a different guarantee entirely (the binding, not the value).

Every output claimed in those five answers is executed on each build, and the debounce example is now self-contained so its Try it button works.

The event material now lives in one ordered place. **DOM Manipulation** gained three new parts — the event path, the three stopping methods, and delegation — and the interview answer is a focused answer again that points at them, instead of 300 lines with the three phases explained three times over.

The path section starts with what bubbling and capturing actually *are*: an event fires on the element you hit **and every one of its ancestors**, because clicking a button inside a div is physically a click on both. Then what the browser does mechanically — it builds the chain of ancestors once, then walks it twice, down and then up — and the question the old version skipped entirely: why there are two directions at all. Netscape implemented capturing, Internet Explorer implemented bubbling, and the standard kept both with bubbling as the default. With a diagram, a runnable demo that prints the real firing order (checked on every build), why the path cannot change once dispatch has started, and `target` versus `currentTarget`.

The stopping section puts `stopPropagation`, `stopImmediatePropagation` and `preventDefault` side by side — they are three different verbs and people reach for the wrong one — then a table of scenarios for each and runnable demos: the form that reloads the page without `preventDefault`, the modal panel that must not trigger its own backdrop, and a link inside a clickable card where you genuinely need both. Plus the alternative to reach for first, since `stopPropagation` fixes your problem by breaking everyone else's: let the ancestor decide with `e.target.closest(...)` instead of silencing the event for every other listener on the page. And the React trap — stopping React's synthetic propagation does not stop a native `document` listener, which is why a dropdown so often closes the instant it opens.

Delegation closes it out — one listener on a parent handling rows that do not exist yet, which is how React's own event system works — along with the events that do **not** bubble, which is why hover delegation with `mouseenter` quietly fails.

The event loop now starts by unpicking "single-threaded": one call stack, but the timer, the network and the file read genuinely run elsewhere. Then the rule that answers most interview questions — after each macrotask the engine drains the *entire* microtask queue, including microtasks queued during the drain — demonstrated with an eight-line snippet whose exact output is checked on every build. Plus why an `async` body runs synchronously to its first `await`, why `setTimeout(fn, 0)` does not mean "now", and what microtask starvation looks like.

**The retry pattern now explains itself properly — including the function it was missing.** It referenced an `isRetryable` helper that was never defined anywhere, so pressing Try it threw `ReferenceError` on the first failure. That helper is now written out, and it is the important one: retry a 429, a 503 or a dropped connection, never a 400 or a 404, because a malformed request fails identically forever.

The section now starts with the problem rather than the code — which failures are worth retrying, and why retrying naively makes an overloaded server worse — then a table of what the delays actually are (`retries: 3` means four calls), a picture of the thundering herd that jitter exists to break, the full-vs-equal jitter trade-off, and what is still missing from all three patterns. The biggest omission is idempotency: retrying a POST that charges a card can charge twice, and the server cannot tell it is a retry unless you send a key.

**A runnable `fetch` example for `AbortController`, and the trap inside it.** The explainer described the signal but never showed the thing you actually use it with. There is now a four-case example that hits a real endpoint — a timeout, a user-initiated cancel, both combined, and the happy path — so pressing Try it shows the real outcomes. It exists mainly to surface one detail: `AbortSignal.timeout()` rejects with a **`TimeoutError`**, not an `AbortError`. Code that checks only for `AbortError` therefore treats every timeout as a genuine failure and reports it. Both handlers are in the guide, and the distinction is checked on every build.

**`AbortController` is now explained before it is used.** The cancellation section went straight from the problem to code that used it, without ever saying what it is: the platform's general-purpose cancellation primitive, deliberately split into a controller you keep and a signal you hand out, so code can react to cancellation without being able to cause it. There is a table of the signal's surface — `aborted`, `reason`, `throwIfAborted()`, `AbortSignal.timeout`, `AbortSignal.any` — and the point that nothing about it is `fetch`-specific: your own functions can honour a signal, which is exactly what the retry pattern was missing. Plus the trick worth stealing, that `addEventListener` takes a signal too, so one `abort()` removes every listener at once.

**Cancellation and bounded concurrency got the same treatment as retry.** Cancellation now opens with why ignoring a result is not the same as stopping it — the connection stays open, the bytes still arrive, and a slow earlier response can still land on top of a fast later one, which is the bug that makes a search box show results for a query you already replaced. There is a table comparing `AbortController` with the `Promise.race` timeout most people write first: race stops you *waiting*, it does not stop the *request*.

Bounded concurrency opens with why `Promise.all` over a thousand URLs is a denial-of-service attack on your own infrastructure, with a diagram of the difference, and answers the obvious "why not just process it in batches of five?" — because a batch runs at the speed of its slowest member while a pool lets a free worker take the next item. Measured rather than asserted: nine items where every third is slow take 76 ms through a pool and 182 ms in fixed batches.

**The three async patterns — retry, cancellation and bounded concurrency — are now explained line by line.** Each had a note on what interviewers look for, but nothing on how the code works. Now: why `return await` is not redundant in the retry (drop the `await` and the rejection escapes the `catch`, so the retry silently never happens); why the controller and the signal are deliberately two separate objects; and the trick in the pool — a shared cursor claimed with `i++`, which is safe without a lock only because there is no `await` between the read and the write. The back-off series and the pool's concurrency limit are now checked on every build.

**Array, object and iteration sections now give you signatures and parameters, not just examples.** Each one gained a reference table — what the method takes, what it returns, and the detail about each parameter that actually catches people. `reduce` without an initial value starts at index 1 and throws on an empty array. `sort` with no comparator compares as strings, so `[10, 9, 100]` becomes `[10, 100, 9]`. `fill([])` puts the *same* array in every slot. `Object.keys` is own-and-enumerable-and-string-keyed, and each of those three words excludes something. `forEach` cannot break and does not await. `for...in` on an array gives you string keys and anything on the prototype. Every claim in those tables is executed on each build.

## v1.7.0 (September 2026)

**The classic loop-and-`setTimeout` gotcha is now explained, not just demonstrated.** It showed the three-line problem and two fixes with output comments and left you to infer the rest. It now separates the two facts that combine to cause it — one shared binding, and callbacks that run only after the loop has finished — and points out that the delay is a red herring: change 100ms to 0 and it still prints 3, 3, 3. Then how each fix actually works: `let` gets a per-iteration binding from a rule written specifically for `for` headers, and the IIFE works because the value is passed **as an argument**, which is the part that snapshots it. There is a third fix too — `setTimeout` forwards extra arguments — and the idea that unifies all three: a closure captures a binding, never a value, so the fix is always to arrange for more bindings.

**Closures now have a "in the wild" section with six real uses.** Function factories that capture configuration once, memoization where the cache lives in the closure, debounce where the timer handle has to survive between calls, private state in an API client that is unreachable rather than merely underscore-prefixed, per-row event handlers that each carry their own item, and React's stale closure shown as a small render cycle you can run. Each one names what was captured and when the outer function returned, since that is the part that makes it a closure rather than an ordinary function. Every example runs and prints what its comments claim — the build checks that.

**Fixed: three JavaScript guide examples printed nothing when you ran them.** The scope-chain example defined its functions and never called the outer one; the closure counter and the generator example called their methods but never logged the results, while the comments claimed values like `1`, `2`, `2`. All three now print what they say they print, and a test runs them on every build so a silent example cannot come back.

**The closures section now explains the mechanism, not just the definition.** Which of those functions *is* the closure (all three of the returned ones), which variable they capture (`count` — the binding, not a copy), and the part that makes it surprising: the outer function has already returned by the time you call any of them. Plus why the variable survives anyway, why two counters do not share state, why `count` is genuinely private, and how the same reachability that keeps it alive is what makes closures leak.

**The JavaScript guide's `this` section now explains `call`, `apply` and `bind`.** It named them as "explicit binding" and then showed three one-line examples, which tells you the syntax and nothing else. There is now a comparison of how arguments arrive and when the function runs, why `bind` is the one that behaves differently — it returns a function, the binding is permanent, `new` overrides it, and every call makes a new reference — and when an arrow function is the better answer.

Also corrected there: detaching a method and calling it was annotated `// undefined`. In a browser it prints an empty string, because `window.name` exists and is `''`. The same line prints `undefined` in Node and throws in strict mode, which is now stated — three results for one snippet is the actual lesson.

**Five new JavaScript and TypeScript questions, from a sweep of current interview sources.** The pattern in 2026 lists is that they push past the definition into application, so: what a closure actually *holds on to* and how that leaks in a single-page app; implementing `once` and the four things it quietly tests; refactoring `isLoading`/`error`/`data` into a union where invalid states cannot be built at all; typing a button that is a link or a button but never both; and how to type JSON you read back out of storage, where `as Settings` compiles and lies.

**Four new interview questions, the kind that come from having debugged something in production.** Why an error boundary never catches an async failure — and the one line that makes it catchable. When a mutation should be a Server Action rather than an API route, including the part people miss: a Server Action is a public endpoint, so importing it only from an admin page authorises nothing. How other browser tabs learn that one of them logged out. And what to measure first when an app is fast on your laptop and slow on a real Android phone.

**Corrections from a factual audit.** Two guides contradicted themselves and have been fixed. The React guide's performance section said the React Compiler "memoizes everything automatically" — its own compiler section explains that it silently *skips* any component it cannot prove is pure, so that advice was wrong in the direction that costs you the optimisation without telling you. And the Next.js guide listed View Transitions among the React 19.2 features available in the App Router; React's own `<ViewTransition>` is still Canary-only, which the React guide is careful to say. The repo README also still described the guide library as it stood several releases ago — it listed an "AWS" category that has been DevOps for a while, and undercounted Front End by five guides.

**New guide — React Router.** Twenty sections on the thing every React app needs and nothing here covered properly: nested layouts and why `<Outlet />` is what makes parent state survive a navigation, the URL as state, loaders and actions, `useFetcher`, protected routes, and the two jobs the browser stops doing for you when navigation goes client-side — scroll restoration and focus. Plus why deep links 404 on static hosting and what each host needs to fix it. 12 interview questions and 6 "guess the output" questions, two of which are bugs this very app shipped.

**A WebSocket example you can actually connect with.** The Browser APIs guide now has a live demo against Postman's public echo service — press Try it, type something, and it comes straight back. Closing it shows a clean `1000` alongside the `1006` you get from a failed connection, so both halves of the lifecycle are visible rather than described.

**The WebSocket example now explains what you see when you run it.** Pressing Try it prints `connection error` then `1006`, because there is no server at the example address — so the guide now says what those two lines mean: the error event carries no detail by design, the close code is where the detail lives, and `1006` with no prior `open` means the handshake never completed at all.

**Fixed: the WebSocket examples threw the moment you ran them.** Both the Browser APIs and Real-Time Web guides listed `ws.send(...)` as plain statements after opening the socket, so pressing **Try it** gave you `InvalidStateError: still in CONNECTING state` — the connection has not finished being set up when those lines run. The sends now sit inside the `open` handler, or behind a `readyState` check, which is also what you want in production: a socket that has dropped throws on send too.

**The templates picker now shows how many you have finished.** Every category reads "done / total" instead of just a total, the header says how many of all 130 challenges you have solved, and the number only lights up once it is above zero. It counts challenges you actually marked complete — not every one you happened to open.

**Every React coding challenge now has an Explain walkthrough.** All 36 of them — Tabs, Auto-Complete, Infinite Scroll, Protected Route, the lot — previously had no Explain button at all, so the only way in was reading a 100-to-250-line template from the top. Each one now opens with the brief, then breaks the build into numbered steps showing just the few lines that step is about, what decision it encodes and the mistake it avoids, and closes with what an interviewer is actually grading.

Each step quotes the template you have open rather than a tidied-up version of it, so the lines in the walkthrough are the lines in your editor. Where a step is about something the template deliberately does not do — a platform alternative, or a gap worth naming — it says so instead of showing invented code.

It is a different walkthrough from the one on the JavaScript challenges, deliberately: there is no Big-O to compare or array to step through when you are building a component, so stepping through frames would have been theatre. The order you would build it in is the useful thing instead.

**Search Filter now shows the debounced version too.** "Now add debouncing" is the standard follow-up to this challenge, so the template has both side by side with live counters — keystrokes against filters actually run. Type in each and the difference is visible: the debounced panel does less work and feels slower, because the work it skipped was already free. The notes explain when debouncing is the right answer (a keystroke that costs a network request), when it is the wrong one (a local array), and what to reach for instead when rendering is genuinely expensive.

**Fixed: a broken code example in the TanStack Query guide.** The `enabled` question showed an empty code box, then the code itself as plain text, then swallowed the three bullet points that followed it into another box. The example now renders properly — and it is a fuller one, showing the dependent-query pattern across several lines rather than one long line.

**New guide — Zustand, and a Global State Management section.** TanStack Query, Redux Toolkit and Redux Saga now sit under their own **Global State Management** heading in the sidebar rather than being mixed in with React, and a new **Zustand** guide joins them. Sidebar headings are also easier to tell apart from the guides beneath them — they now have a dividing line, wider lettering, and the guides are indented under them. It leads with the thing interviewers actually ask about — why Context re-renders every consumer and a selector-based store does not — and covers slices, the middleware stack, persistence and its migration trap, using the store outside React, testing, and an honest comparison of Zustand, Redux Toolkit, Context and Jotai. 12 interview questions and 6 "guess the output" questions, including the two selector mistakes that silently undo the entire point of the library.

Existing Redux links are unchanged, so anything you had bookmarked still works.

**Nine new interview questions, from a three-round question list.** Covering the gaps an audit turned up: a custom hook that debounces a value and why the cleanup *is* the debounce; CSR vs SSR vs SSG vs ISR as one decision rather than four; designing a dashboard with 100+ pages; handling API rate limits from the frontend; architecting for a million daily users; a reusable dropdown with search and multi-select; and three behavioural ones — technical debt against features, conflicts with designers and backend teams, and explaining technical decisions to non-technical stakeholders. Seven of the sixteen were already answered elsewhere and were deliberately left alone rather than duplicated.

**Fixed: a challenge you had opened once would never show its updates.** The playground saves your work automatically about a second after a challenge loads — which meant simply *opening* one stored a copy, and that copy then outranked the challenge itself forever. If the challenge was later corrected, you kept seeing the old version with no indication why. A saved copy you never actually edited now steps aside for the newer one, and if you *have* edited it you get told the challenge has changed so you can choose to Reset.

**Fixed: the Protected Route challenge warned in the console.** Clicking through to the admin page produced *"Cannot update a component while rendering a different component"* — the template was performing its redirect during render instead of after it. It now renders a small `Redirect` component that navigates in an effect, which is exactly why react-router gives you `<Navigate />` rather than a function you call inline, and the template says so.

**Mark any challenge complete yourself.** JavaScript challenges have always ticked themselves off when every test passes, but the 36 React machine-coding ones have no tests to pass — so there was no way to record that you had finished one, and they never counted towards your progress. There is now a **Mark complete** button for every challenge, and the header count covers all 130 rather than only the 94 JavaScript ones. Un-marking keeps your code and notes; it only changes the tick.

**New playground challenge — list users from a real API.** It calls `jsonplaceholder.typicode.com/users` for real, so pressing Run shows you the actual loading, error and empty states rather than a simulation — including a retry button when the request fails. The notes at the bottom cover the part people get wrong: `fetch` treats a 404 or a 500 as success unless you check `res.ok` yourself.
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
