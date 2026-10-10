# React — React 19 & Patterns

Component patterns that hold up in real codebases, and what React 19 added: Actions, new hooks, Server Components and the compiler.

Part of the React series: [React Guide](/frontend/react) · [React Performance & Internals](/frontend/react-performance) · **React 19 & Patterns** · [React Interview Questions](/frontend/react-interview-questions) · [React Tricky Questions](/frontend/react-tricky-questions)

---

## Table of Contents

- [15. Patterns and Best Practices](#15-patterns-and-best-practices)
- [16. React 19 Features](#16-react-19-features)

---

## 15. Patterns and Best Practices

This section is the React how-to. For the general theory (the Gang of Four patterns, and which pattern to pick when), see the [Design Patterns guide](/frontend/design-patterns#6-react-specific-patterns).

### 15.1 Compound Components

A compound component is a set of components used together, like `<select>` and `<option>` in HTML. The parent (`Tabs`) holds the state and shares it through Context, so the caller never passes `activeTab` around and can arrange `Tabs.Tab` and `Tabs.Panel` in any markup. Compared with one `<Tabs items={[...]} />` with many props, the caller controls layout and content while the parent controls behaviour. Radix UI and Headless UI are built this way.

```tsx
const TabsContext = createContext({ activeTab: 0, setActiveTab: (_index: number) => {} });

function Tabs({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabList({ children }: { children: React.ReactNode }) {
  return <div className="tab-list">{children}</div>;
};

Tabs.Tab = function Tab({ index, children }: { index: number; children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      className={activeTab === index ? 'active' : ''}
      onClick={() => setActiveTab(index)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function TabPanel({ index, children }: { index: number; children: React.ReactNode }) {
  const { activeTab } = useContext(TabsContext);
  return activeTab === index ? <div>{children}</div> : null;
};

// Usage
render(
  <Tabs>
    <Tabs.List>
      <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
      <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel index={0}>Content 1</Tabs.Panel>
    <Tabs.Panel index={1}>Content 2</Tabs.Panel>
  </Tabs>
);
```

### 15.2 Render Props

A component accepts a function prop and calls it to decide what to render. The component owns the *behaviour* (here, tracking the mouse) and each caller chooses the *markup*. It was the standard way to share stateful logic before hooks, and libraries still use it when they must render your JSX from their internal state.

```tsx
interface MousePosition { x: number; y: number }

function MouseTracker({ render }: { render: (pos: MousePosition) => React.ReactNode }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return <>{render(position)}</>;
}

// Usage
render(<MouseTracker render={({ x, y }) => <p>Mouse: {x}, {y}</p>} />);
```

### 15.3 Custom Hook Pattern (Preferred over Render Props)

Custom hooks have largely replaced render props and HOCs ([§15.4](#154-higher-order-components-hocs)) for sharing stateful logic. The same logic becomes a function that returns a value: no extra component in the tree, no nested callbacks when you need two, and the data arrives as an ordinary variable.

```tsx
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return position;
}

// Usage
function Component() {
  const { x, y } = useMousePosition();
  return <p>Mouse: {x}, {y}</p>;
}
```

---

### 15.4 Higher-Order Components (HOCs)

A HOC is a function that takes a component and returns a new one with extra behaviour: the Decorator pattern applied to components ([Design Patterns](/frontend/design-patterns#higher-order-component-hoc)). It was the dominant reuse pattern before hooks.

```tsx
// stand-ins so this example runs on its own
const analytics = { track: (event: string, name: string) => console.log('track', event, name) };
const Dashboard = () => <h2>Dashboard</h2>;

function withLogging<P extends object>(Wrapped: React.ComponentType<P>) {
  return function WithLogging(props: P) {
    useEffect(() => { analytics.track('mount', Wrapped.name); }, []);
    return <Wrapped {...props} />;
  };
}
const DashboardWithLogging = withLogging(Dashboard);
export default DashboardWithLogging;

render(<DashboardWithLogging />);
```

**Why hooks replaced them:** nested wrappers in the tree, props whose origin you can't see (three HOCs deep, which one injected `user`?), silent prop-name collisions, and static methods that must be copied over by hand. They are also hard to type well.

**Where a HOC is still the right tool:** when the behaviour must wrap the component rather than run inside it: an error boundary, a Suspense boundary, an authorization gate that renders something *else*, or injecting a provider. A hook can't stop a component rendering; a HOC can. If you write one, name it `withX`, copy static methods across, pass `ref` through (in React 19 it is an ordinary prop, so `{...props}` carries it), and set `displayName` so DevTools is readable.

---

### 15.5 Presentational vs Container Components

The 2015 split (Dan Abramov) separated **container** components, which fetch data and hold state, from **presentational** components, which take props and render. Abramov later dropped it as a *rule*: custom hooks let you extract the data logic without extracting a component, so a `Container` file for every component is overkill.

The principle survives: keep the code that knows about data apart from the component that only renders, because a presentational component is trivially testable, reusable, and the natural unit for Storybook. In modern React the seam is usually a **custom hook** (`const users = useUsers()` feeding `<UserList users={users} />`), and in an RSC codebase it is the **Server Component fetches / Client Component renders** boundary (see the [Next.js & RSC guide](/frontend/nextjs-rsc)). More in [Design Patterns](/frontend/design-patterns#container-presentational).

---

### 15.6 Flux and One-Way Data Flow

**Flux** is the architecture Facebook introduced in 2014 to replace two-way binding. It is the ancestor of Redux, Zustand and `useReducer`:

```
Action  →  Dispatcher  →  Store  →  View
  ↑                                  │
  └──────────────────────────────────┘
        (views dispatch actions, never write to stores)
```

**Data flows in one direction only.** A view cannot write to a store; it can only *dispatch an action describing what happened*, and the store owns the transition. Redux merged the dispatcher into a single store with reducers, and `useReducer` is the same idea at component scope.

**Why it matters** (the interview answer, not the diagram):

- **Predictability.** Each change has one path, so "why did this change?" has a findable answer. Two-way binding (AngularJS, Knockout) let any view write to any model, so a cascade of updates had no traceable origin.
- **Debuggability.** Every change is an action, so you get a log of them, which is what makes Redux DevTools' time-travel possible.
- **Testability.** A reducer is a pure function: given this state and this action, expect that state.

In React, one-way flow is why **props flow down and events flow up**: a child calls a callback and the parent decides. Siblings that need the same state **lift it** to a common ancestor or a store. And it is why **mutating state directly is a bug**: the setter or reducer is the only sanctioned transition ([§5](/frontend/react#5-state)).

---

### 15.7 Portals

A portal renders children into a **different DOM node** while keeping them in the same React tree.

```tsx
import { createPortal } from 'react-dom';

function Modal({ children, onClose }) {
  return createPortal(
    <div className="overlay" onClick={onClose}>{children}</div>,
    document.body,                 // rendered here in the DOM
  );
}
```

**The problem it solves** is CSS containment: a modal, dropdown or tooltip deep in the tree is clipped by an ancestor's `overflow: hidden`, or loses a `z-index` fight because an ancestor created a stacking context ([Modern CSS §11](/frontend/modern-css#11-stacking-contexts-containing-blocks-and-z-index)). Portalling to `document.body` escapes both.

| Follows the **React** tree | Follows the **DOM** tree |
|---|---|
| Context — a portal still reads providers above it | CSS — styles come from the new parent |
| Event bubbling *in React* — events propagate to React ancestors | Focus/tab order — the node is where you put it |
| Error boundaries | `document.activeElement`, native event listeners on ancestors |

The first row surprises people: a portalled component **still reads context** from where it sits in JSX, and a synthetic event inside it **still bubbles to its React parent** even though the DOM nodes are unrelated. That is usually what you want, and occasionally why a "click outside to close" handler on a React ancestor fires for a click *inside* the modal.

**Often the better option:** `<dialog>` with `showModal()` and the `popover` attribute render in the browser's **top layer**, above every stacking context, with Escape-to-close and `::backdrop` built in (a modal `<dialog>` also makes the rest of the page inert). Use a portal for non-dialog cases or designs that predate those.

**Accessibility:** **tab order follows the DOM, not your JSX**, so a dropdown appended to `document.body` sits at the end of the tab order wherever its trigger is. Manage focus yourself ([Accessibility §6.3](/frontend/accessibility#63-managing-focus-on-state-change)).

---

### 15.8 Fragments, and Node vs Element vs Component

**Fragments** group children without adding a DOM node:

```tsx
<>
  <td>Name</td>
  <td>Email</td>
</>
```

They matter for more than tidiness: wrapping `<td>`s or `<li>`s in a `<div>` produces invalid HTML and breaks the parent-child relationships screen readers depend on, and an extra `div` inside a flex or grid container changes the layout. Use the long form `<React.Fragment key={id}>` when you need a `key`; the shorthand can't take one.

**The three terms** are a common definition question:

| Term | What it is |
|---|---|
| **React Component** | A function (or class) that returns UI. A *blueprint* — `function Button() {…}` |
| **React Element** | The lightweight object JSX produces. Immutable, describes what to render — `{ type: Button, props: {…}, key }`. In React 19 `ref` is an ordinary prop, so it lives in `props` (reading `element.ref` logs a deprecation warning) |
| **React Node** | Anything React can render: an element, a string, a number, `null`, `undefined`, a boolean, or an array of nodes |

```tsx
const Button = () => <button/>;         // Component (blueprint)
const el = <Button />;                  // Element  (a plain object, NOT rendered yet)
const node = [el, 'text', null, 42];    // Node     (all renderable)
```

The practical consequences: **elements are immutable**, so you describe a new one rather than mutating the old one. `<Button />` is *not* a call to `Button()`; it compiles to `jsx(Button, …)` (or `createElement(Button, …)` with the classic transform), an object describing a component React will call *later*, or not at all. And `React.ReactNode` is the type for a `children` prop because it is the permissive one; `ReactElement` rejects a string child, a common TypeScript mistake.

---

### 15.9 StrictMode

```tsx
<StrictMode><App /></StrictMode>
```

In **development only**, StrictMode deliberately:

- **Double-invokes** component function bodies, initialisers, and reducer/state updater functions — to surface impure renders.
- **Double-runs effects** — mount → unmount → mount — to surface missing cleanup.
- Warns about deprecated APIs and legacy patterns.

None of this happens in production. The double-invoke is a detector, not a bug to "fix" with a ref guard. **If double-invoking breaks your component, the component is impure**, and it will also break under the concurrent renderer, which may start, abandon and restart a render.

The two failures it exposes:

```text
// Impure render — mutates a prop; StrictMode makes it push twice
function List({ items }) { items.push('extra'); /* … */ }

// Missing cleanup — StrictMode's mount/unmount/mount leaves two subscriptions
useEffect(() => { socket.subscribe(handler); }, []);   // no return
```

It matters more with React Compiler, which **assumes** your components are pure. The compiler skips a component only when it *detects* a violation; one it can't see, such as pushing into a prop array, is compiled anyway and can then behave differently once memoised. StrictMode's double render is one way to make that impurity visible first ([§16.1](#161-react-compiler-stable-since-10)).

---

### 15.10 Internationalisation (i18n)

Not a React feature, but a standard interview topic because getting it wrong is expensive to retrofit.

```tsx
// react-i18next / next-intl / FormatJS all follow this shape
const { t } = useTranslation();
<p>{t('cart.items', { count })}</p>          // pluralisation handled by the library
```

The decisions that matter:

- **Never concatenate translated strings.** `t('You have') + count + t('items')` breaks in any language with a different word order. Use **named placeholders** and let the library handle **plurals**: plural rules range from two forms (English) to six (Arabic), so `count === 1 ? 'item' : 'items'` is wrong outside English.
- **Use `Intl` for anything formattable**: `NumberFormat`, `DateTimeFormat`, `RelativeTimeFormat`, `ListFormat`, and `Collator` for sorting. It is built in and handles currency, grouping separators and calendars. For time-zone-correct dates use `Temporal` ([JavaScript §9.10](/javascript/guide#910-the-temporal-api-the-replacement-for-date)).
- **RTL is a layout problem, not a translation problem.** `dir="rtl"` on `<html>` plus **CSS logical properties** (`margin-inline-start`, not `margin-left`) lets one stylesheet serve both directions ([Modern CSS §10.3](/frontend/modern-css#103-logical-properties)). Retrofitting it is far more expensive than starting with it.
- **Load translations per locale, lazily**, rather than shipping every language to every user.
- **Design for text expansion.** German and Finnish often run 30–40% longer than English, so fixed-width buttons break. Test with a pseudo-locale.
- **Put the locale in the URL** (`/en/…`, `/de/…`), not only in a cookie, so pages are shareable, crawlable and cacheable per locale.
- **Give translators context.** A key like `submit` may need five different translations in five places; namespaced keys plus a description prevent that.

---

### 15.11 Events — Delegation and the Synthetic System

React attaches **one listener per event type at the root container**, not one per element, and dispatches to your handlers by walking the fiber tree. That saves memory, and a newly rendered element's handler works with no attach step. Your handler receives a **SyntheticEvent**, React's cross-browser wrapper; `e.nativeEvent` is the underlying event (the basics are in [React §8](/frontend/react#8-event-handling)).

The consequences that get asked:

- **`e.stopPropagation()` stops propagation within React only.** By the time your handler runs, the native event has already bubbled to the root, so native listeners on elements *between* the target and the root have already fired, and a `document` listener still fires. `e.nativeEvent.stopPropagation()` can only stop listeners *above* the root (`document`, `window`).
- **React 17 moved the root listener** from `document` to the root container. That fixed embedding several React versions, or a React app inside another app, where `stopPropagation` in one tree used to affect the other.
- **Event pooling was removed in React 17**, so `e.persist()` is no longer needed to read the event asynchronously.
- **Some events don't bubble** and are attached directly (`scroll`, media events). `onFocus`/`onBlur` bubble in React because they are built on `focusin`/`focusout`.
- **Manual delegation is rarely needed**, since React already delegates. One handler on a list container instead of each row only helps for very large lists, by saving thousands of closures per render.

---

### 15.12 CI/CD — Lint, Type-check and Test on Every Pull Request

**CI (continuous integration) runs the same checks on every change, on a clean machine, before it can merge. CD (continuous delivery or deployment) turns merged code into a release automatically.** Interviews mostly ask about the gate: a pull request (PR) cannot merge until lint, the type checker and the tests pass. That takes two pieces: a workflow that runs the checks, and a repository rule that makes them **required**. Without the rule, a red check is only advice. (General pipeline design: [Docker, K8s & CI/CD §8.2](/backend/docker-kubernetes#82-a-real-github-actions-workflow).)

The npm scripts the workflow calls:

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings=0",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "build": "vite build"
  }
}
```

`--max-warnings=0` turns warnings into failures; otherwise warnings pile up and nobody reads them. `tsc --noEmit` is a separate step because **Vite and esbuild strip types without checking them**, so `vite build` succeeds on code with type errors.

The workflow, in `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:            # every PR, including forks
  push:
    branches: [main]       # and every merge
  merge_group:             # only for the merge queue

permissions:
  contents: read           # least privilege: CI never pushes

concurrency:
  # A new push cancels the PR's previous run; pushes to main are never cancelled.
  group: ci-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc   # same Node as local development
          cache: npm
      - run: npm ci                   # exactly what package-lock.json says
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - run: npm test -- --coverage

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - run: npm run build            # catches a failing bundle
```

**Why four jobs, not four steps in one job:** jobs run in parallel, so CI takes as long as the slowest check, and each job is a separately named check, so the author sees *which* one failed without opening a log. The four installs cost seconds with the npm cache. When the setup steps repeat, move them into a composite action (a reusable group of steps in `.github/actions/setup/action.yml`).

**Blocking the merge.** In the repository's Settings, open **Rules → Rulesets** (or the older **Branches → Branch protection rules**) and create a rule for `main`:

1. **Require a pull request before merging.**
2. **Require status checks to pass**: `lint`, `typecheck`, `test` and `build`. These are the job ids above, so keep them short and stable.
3. **Require branches to be up to date**, or turn on the **merge queue**, which tests each PR combined with the ones queued ahead of it. That is why the workflow listens to `merge_group`: without it the queue waits for a check that never starts.
4. **Block force pushes** to `main`.

**The mistakes that come up in reviews and interviews:**

- **A required check that never runs blocks the PR forever.** With a `paths:` filter ("only run when `src/` changes"), a docs-only PR never produces `test`, and GitHub shows *Expected, waiting for status*. Don't path-filter required workflows; let the job run and skip its steps.
- **Renaming a job silently breaks the rule.** The ruleset still requires `test`, the workflow now reports `unit-tests`, and every PR waits. Rename both together.
- **Security:** pin third-party actions to a commit SHA (a tag can be moved), and never check out a fork's code under `pull_request_target`, which runs with your secrets. Both are covered in [Docker, K8s & CI/CD §10](/backend/docker-kubernetes#10-secrets-in-cicd).
- **Keep it fast.** Past ten minutes, people start merging around CI. Cache dependencies, run jobs in parallel, shard slow suites (`vitest run --shard=1/3`), and move slow or flaky end-to-end tests to a separate non-blocking or nightly workflow.
- **Local hooks are a convenience, CI is the gate.** A pre-push hook catches problems in seconds, but `--no-verify` skips it. This app does both: `npm run verify` runs six gates in a pre-push hook, and the deploy workflow runs the same six.

**The CD half, briefly:** a `deploy` job runs only on `push` to `main`, declares `needs: [lint, typecheck, test, build]`, and targets a GitHub **environment** (`environment: production`) that can require a reviewer's approval and holds its own secrets. Cloud credentials come from OIDC rather than a stored key, and many teams deploy a **preview** of every PR. [Interview Q84](/frontend/react-interview-questions) walks through the whole pipeline.

---

## 16. React 19 Features

### 16.1 React Compiler (stable since 1.0)

**Short answer:** React Compiler is a build step (a Babel plugin that runs data-flow analysis over your components) that memoizes them for you. It works out which values can change between renders and caches the rest, so in the components it compiles you no longer write `useMemo`, `useCallback` or `React.memo` by hand. It reached **1.0 on 7 October 2025** and works with React 17, 18 and 19, for React and React Native.

**The problem it solves.** Objects, arrays and functions created during render are new each time, so a `memo` child sees "new" props and an effect with that value in its dependencies re-runs. Fixing that by hand with `useMemo`/`useCallback`/`memo` is tedious and easy to get wrong, since one unstable prop defeats it ([§13.2](/frontend/react-performance#132-usememo-and-usecallback)).

**What it actually outputs.** Take this component:

```text
function Greeting({ user, onLogout }) {
  const name = user.firstName + ' ' + user.lastName;
  return <Header title={name} onLogout={onLogout} />;
}
```

The compiled version (simplified) keeps a small **cache array per component instance**, and recomputes each piece only when the values it depends on have changed:

```text
import { c as _c } from 'react/compiler-runtime';

function Greeting({ user, onLogout }) {
  const $ = _c(5);                       // a cache with 5 slots, kept between renders
  let name;
  if ($[0] !== user) {                   // user changed? recompute and store
    name = user.firstName + ' ' + user.lastName;
    $[0] = user; $[1] = name;
  } else {
    name = $[1];                          // unchanged: reuse the cached value
  }
  let header;
  if ($[2] !== name || $[3] !== onLogout) {
    header = <Header title={name} onLogout={onLogout} />;
    $[2] = name; $[3] = onLogout; $[4] = header;
  } else {
    header = $[4];                        // same element object, so React skips Header
  }
  return header;
}
```

Two things follow from that shape, and they are why it beats hand-written memoization:

- **It is finer-grained.** It caches individual values and JSX elements. Returning the *same element object* is what lets React skip re-rendering `Header`, without `Header` being wrapped in `memo`.
- **It can memoize after an early return.** `useMemo` can never come after `if (!props.items) return null;`, because hooks can't be conditional. The compiler is not a hook, so it can.

**The rules it depends on, and what happens when you break them.** This is the part interviewers press on. The compiler **assumes** your code follows the **Rules of React**:

- **Pure rendering:** same props and state in, same JSX out; no side effects while rendering.
- **No mutation** of props, state or hook return values, such as pushing into a prop array during render.
- **Rules of Hooks:** hooks at the top level, in the same order every render ([§6.1](/frontend/react#61-rules-of-hooks)).

When it **detects** a violation (a conditional hook, a ref read during render), it **skips that component and leaves it as it was**. Nothing crashes, and nothing tells you. It cannot detect every violation, though: a component that mutates a prop, such as `tags.push(…)` during render, is compiled anyway, and once its output is cached it can behave differently from the uncompiled version. So adopting the compiler is mostly a lint exercise. Its checks are built into **`eslint-plugin-react-hooks` 7.x** (the `recommended` preset includes them; `recommended-latest` adds newer experimental ones), and the linter points at both kinds of problem.

**Setting it up.** Install it with an exact version:

```text
npm install --save-dev --save-exact babel-plugin-react-compiler@latest
```

`--save-exact` is deliberate: a future version may memoize at a different granularity, which can change how often an effect fires in a component that quietly breaks the rules. Upgrade on purpose, with tests.

- **Vite 8 (`@vitejs/plugin-react` v6, which no longer runs Babel itself):** add Babel back just for the compiler.

  ```text
  // vite.config.js
  import { defineConfig } from 'vite';
  import react, { reactCompilerPreset } from '@vitejs/plugin-react';
  import babel from '@rolldown/plugin-babel';   // npm install -D @rolldown/plugin-babel

  export default defineConfig({
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  });
  ```

- **Older Vite (`@vitejs/plugin-react` v5 and earlier):** `react({ babel: { plugins: ['babel-plugin-react-compiler'] } })`.
- **Next.js:** `reactCompiler: true` in `next.config`. **Expo SDK 54+:** on by default.
- **React 17 or 18:** also install `react-compiler-runtime` and set the compiler's `target` option to your React version.

**Checking that it worked.** In React DevTools, compiled components show a **"Memo ✨"** badge. A component without it was skipped, so check what the linter says about it. To exclude one component on purpose, put `"use no memo";` as the first line of its body.

**Rolling it out on an existing app:**

1. Turn on the lint rules and fix what they report: mutation during render, side effects in render, conditional hooks.
2. Enable the compiler, everywhere or for one directory first.
3. Check the ✨ badges on your important screens, and profile before and after ([§13.6](/frontend/react-performance#136-profiling-and-measuring-performance)).
4. **Leave existing `useMemo`/`useCallback` alone.** They do no harm, and removing them in bulk is a large, risky diff. Stop adding new ones, and remove old ones only when you are already editing that code.

Meta reported that on the Quest Store, initial loads and navigations became up to **12%** faster and some interactions over **2.5×** faster, with memory use unchanged.

**What it does not do.** It does not replace `useTransition`/`useDeferredValue` (which decide *when* work runs), virtualisation or code splitting. It can't help when a parent passes a genuinely new value each time, such as a provider whose value changed. And `useMemo`/`useRef` still have a job when an outside API needs the *same* object across renders for correctness, not speed ([Interview Q27](/frontend/react-interview-questions)).

---

### 16.2 Actions and useActionState

An **Action** is an async function that React runs inside a transition, typically a form submission or a mutation. Because React runs it, React can track whether it is pending and what it returned, which replaces the `isLoading`/`error` `useState` pair you would otherwise write for every form. `useActionState` exposes that tracking.

```tsx
// stand-ins so this example runs on its own
const updateName = async (name) => (name ? null : 'Name is required');
const redirect = (path) => console.log('redirect to', path);

function UpdateName() {
  const [error, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const error = await updateName(formData.get('name'));
      if (error) return error;
      redirect('/profile');
      return null;
    },
    null
  );

  return (
    <form action={submitAction}>
      <input name="name" />
      <button disabled={isPending}>Update</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

The contract: pass an async function and an initial state; you get back the latest returned state, an action to wire to `<form action>`, and an `isPending` flag. The function receives the previous state first, then the form data. No loading `useState`, and no forgotten `setLoading(false)`.

### 16.3 useFormStatus

Reads the submission status of the **nearest enclosing `<form>` from any descendant component**, without prop-drilling.

```tsx
import { useFormStatus } from 'react-dom';

// stand-in so this example runs on its own: a fake server call that takes a second
const updateProfile = (formData: FormData) => new Promise((resolve) => setTimeout(resolve, 1000));

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}

function ProfileForm() {
  return (
    <form action={updateProfile}>
      <input name="name" />
      <SubmitButton />          {/* knows the form is submitting */}
    </form>
  );
}
```

That makes Actions composable: build `<SubmitButton>` once and drop it into any form. The three form hooks are one story: **`useActionState`** (the form's state and pending flag), **`useFormStatus`** (that status, read from a descendant) and **`useOptimistic`** (instant UI while the action runs).

### 16.4 use() Hook

`use` reads a resource, a promise or a context, during render. It is the one API **not bound by the rules of hooks**: it can be called inside an `if`, a loop, or after an early return. The rules exist because `useState` and friends are matched to their stored state **by call order** ([§6.1](/frontend/react#61-rules-of-hooks)). `use` reserves no slot (a promise identifies itself, and a context is looked up on the fiber), so there is no order to corrupt.

```tsx
// stand-ins so this example runs on its own
const ThemeContext = createContext('dark');
const commentsPromise = new Promise<Comment[]>((resolve) =>
  setTimeout(() => resolve([{ id: 1, text: 'First!' }, { id: 2, text: 'Great post' }]), 500));

// Read a promise during render (with Suspense)
function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise);   // suspends until it resolves
  return comments.map(c => <p key={c.id}>{c.text}</p>);
}

// Read context (can be called conditionally, unlike useContext)
function Theme({ isEnabled }: { isEnabled: boolean }) {
  if (isEnabled) {
    const theme = use(ThemeContext);
    return <div className={theme}>Theme: {theme}</div>;
  }
  return null;
}

function Demo() {
  return (
    <Suspense fallback={<p>Loading comments…</p>}>
      <Comments commentsPromise={commentsPromise} />
      <Theme isEnabled />
    </Suspense>
  );
}
render(<Demo />);
```

**With a promise, `use` suspends.** The nearest `<Suspense>` shows its fallback, and React retries when the promise resolves; a rejection goes to the nearest error boundary. Loading and error states are boundaries, not more component state.

**The pitfall: never create the promise during render.**

```text
// ✗ Infinite loop. A new promise every render, so `use` suspends every render.
function Comments() {
  const comments = use(fetch('/api/comments').then(r => r.json()));
  return comments.map(/* … */);
}

// ✓ The promise is created outside the render — passed in as a prop…
<Comments commentsPromise={commentsPromise} />

// …or returned from a cache that gives back the SAME promise for the same key
const commentsPromise = getCachedComments(postId);
```

React must recognise the promise it suspended on. A fresh one each render has a new identity, so it suspends, re-renders, creates another, and never settles. In practice the promise comes from a Server Component, a framework loader or a cache, which is why `use` feels natural in Next.js and awkward in a bare client component.

**Two more limits.** `use` cannot be called inside `try`/`catch`; use an error boundary. And `use(Context)` is otherwise identical to `useContext(Context)`, so use it only when you need the conditional call.

---

### 16.5 useOptimistic

`useOptimistic` shows a provisional result **immediately**, while the request is in flight, and drops it automatically when the action ends. That is the whole value: hand-rolled optimistic UI means keeping a second copy of the list and unwinding it correctly on failure. The optimistic value only lives as long as the action, so it disappears on success *and* on error, and the real state shows through.

```tsx
// stand-in so this example runs on its own: a fake server call
const api = { createTodo: (todo: { title: string }) => new Promise((resolve) => setTimeout(resolve, 1000)) };

function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, { ...newTodo, pending: true }]
  );

  async function addTodo(formData: FormData) {
    const title = formData.get('title') as string;
    // A temporary id so the optimistic row has a stable key of its own.
    // Without one, key={todo.id} is undefined and React warns on every render.
    addOptimisticTodo({ id: `temp-${crypto.randomUUID()}`, title });
    await api.createTodo({ title });         // the server assigns the real id
  }

  return (
    <form action={addTodo}>
      <input name="title" />
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.title}
          </li>
        ))}
      </ul>
    </form>
  );
}

// The todos prop is never refreshed here, so a new row fades in and then
// disappears when the action ends: the failure mode described below.
render(<TodoList todos={[{ id: '1', title: 'Read about useOptimistic' }]} />);
```

**The two arguments.** The first is the real state, what you would render if nothing were pending. The second is a pure reducer, `(currentState, optimisticValue) => nextState`: return a new array, never push into `state`. While no action is running, `optimisticTodos` **is** `todos`.

**`addOptimisticTodo` only works inside an Action or a transition.** Called from a bare click handler, React logs a warning ("An optimistic state update occurred outside a transition or action") and the value snaps back straight away. Here `<form action={addTodo}>` makes `addTodo` an Action.

**The failure mode: the real state never catches up.** If the server succeeded but `todos` was never refreshed (no revalidation, no refetch), the row vanishes a moment after it appeared and looks exactly like a failed write. The optimistic value is a *bridge* to the real state; if nothing is coming, there is nothing to bridge to.

---

### 16.6 `<Activity />` — Hide UI Without Destroying It

`<Activity />` (19.2) marks part of the tree as `visible` or `hidden`. A hidden activity **keeps its state** but has its **effects destroyed**, so timers stop and subscriptions close. When it becomes visible again, React restores the state and **re-creates the effects**.

```tsx
// stand-ins so this example runs on its own
const HomeTab = () => <p>Home</p>;
const SearchTab = () => <input placeholder="Type here, switch tabs, come back" />;

function App() {
  const [tab, setTab] = useState('home');

  return (
    <>
      <button onClick={() => setTab('home')}>Home</button>
      <button onClick={() => setTab('search')}>Search</button>
      <Activity mode={tab === 'home' ? 'visible' : 'hidden'}>
        <HomeTab />
      </Activity>
      <Activity mode={tab === 'search' ? 'visible' : 'hidden'}>
        <SearchTab />   {/* scroll position and input text survive tab switches */}
      </Activity>
    </>
  );
}
```

**Why this is not just `display: none` or conditional rendering.** The three differ on two axes: does state survive, and do effects keep running?

| Approach | State | Effects | DOM |
|---|---|---|---|
| `{cond && <Tab />}` | **destroyed** | unmounted | removed |
| `style={{ display: cond ? 'block' : 'none' }}` | preserved | **keep running** | kept |
| `<Activity mode={…}>` | **preserved** | **destroyed** | kept, hidden |

Conditional rendering loses scroll position, half-typed input and fetched data on every switch. CSS hiding keeps them but leaves intervals ticking and polling running for a panel nobody can see. `<Activity />` is the combination that was impossible before: **state preserved, effects torn down.**

Two details matter in practice. A hidden activity is **not frozen**: its children still re-render for new props, at lower priority than visible content, so it is cheap but not free. And hiding uses `display: none`, so a component that renders only text produces no DOM output while hidden.

**Uses:** preserving state across navigation (tabs, wizards, a list you return to), and **pre-rendering a likely next screen** so its data and code are warm when the user arrives.

**Traps.** A hidden `Activity` does **not** keep a WebSocket alive or keep polling; if a hidden panel must keep receiving data, that subscription belongs *above* the boundary. Every effect inside needs a correct cleanup, or hiding leaks. For teardown tied to the *visual* hide (pausing a video), use `useLayoutEffect` cleanup so it runs before the content disappears.

---

### 16.7 `useEffectEvent` — Non-Reactive Logic Inside Effects

Stable since 19.2, and the answer to the most common `useEffect` complaint: *"I need the latest value of something, but I don't want the effect to re-run when it changes."*

Take a chat room that connects to a socket and shows a toast, in the current theme, on connect. `theme` is read inside the callback, so the linter demands it in the dependencies, and then every theme change tears down and rebuilds the connection. Omitting it suppresses a real warning and captures a stale value; a `useRef` mirror works but is ceremony for every value.

`useEffectEvent` splits the callback into a **reactive** part (the effect) and a **non-reactive** part (the event). Toggle the theme below and the console shows no disconnect or reconnect.

```tsx
// stand-ins so this example runs on its own
const createConnection = (roomId) => {
  let onConnected = () => {};
  return {
    on: (_event, fn) => { onConnected = fn; },
    connect: () => { console.log('connect', roomId); setTimeout(() => onConnected(), 100); },
    disconnect: () => console.log('disconnect', roomId),
  };
};
const showToast = (message, theme) => console.log(message, '(' + theme + ' toast)');

function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showToast('Connected!', theme);   // always reads the latest theme
  });

  useEffect(() => {
    const conn = createConnection(roomId);
    conn.on('connected', () => onConnected());
    conn.connect();
    return () => conn.disconnect();
  }, [roomId]);   // ← honest and complete: only roomId is reactive
}                 //   (without useEffectEvent this had to be [roomId, theme])

function Demo() {
  const [theme, setTheme] = useState('light');
  return (
    <>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Theme: {theme}</button>
      <ChatRoom roomId="general" theme={theme} />
    </>
  );
}
render(<Demo />);
```

The function `useEffectEvent` returns is **not reactive**, so it never goes in a dependency array, yet its body always sees the **latest** props and state, so it is never stale. Note that it is *not* a stable reference: in React 19.3 it is a new function on every render, which is one more reason never to pass it anywhere except your own effects.

Rules that come up in interviews:

- **Call it only from inside an effect** (or another effect event), never during render, and never pass it to a child. The linter flags both.
- **`eslint-plugin-react-hooks` 7.x knows about it** and leaves effect events out of dependency arrays.
- **The test:** does this logic describe *when to synchronise* (reactive, so a dependency) or *what to do when something happens* (non-reactive, so an effect event)? Connecting to `roomId` is synchronisation; showing a toast is an event.

The first question is still "should this be an effect at all?" ([§7.4](/frontend/react#74-when-not-to-use-useeffect)). `useEffectEvent` is for the effects that survive it.

---

### 16.8 React 19.2's Rendering and SSR Changes

These 19.2 changes are invisible in application code but are what a senior interview probes.

**Partial Pre-rendering.** Pre-render a page's static shell at build time, then *resume* the dynamic parts later. `prerender()` with an `AbortController` stops at the dynamic boundaries and returns the static HTML plus a serialisable "postponed" state; `resume()` / `resumeToPipeableStream()` (SSR) or `resumeAndPrerender()` (SSG) picks up where it left off.

```jsx
// Build time — render the static shell, abort at dynamic boundaries
const controller = new AbortController();
const { prelude, postponed } = await prerender(<App />, { signal: controller.signal });

// Request time — resume from the saved state
const stream = await resume(<App />, postponed);
```

A page no longer has to be *entirely* static or dynamic: the shell comes instantly from a CDN, and only the personalised holes are computed per request. This is the primitive under Next.js's PPR.

**Batched Suspense reveals in SSR.** Server-rendered `Suspense` boundaries used to reveal one at a time as their HTML arrived, while client-rendered ones batched. 19.2 batches server reveals too: fewer layout jumps on streamed pages, and one coherent change for `<ViewTransition>` to animate.

**Web Streams in Node.** `renderToReadableStream()` and `prerender()` now work under Node (Node Streams remain the recommended choice there), which helps code that runs on both Node and an edge runtime.

**`cacheSignal()`** (Server Components only) returns an `AbortSignal` that fires when a `cache()` lifetime ends, so you can abort in-flight work:

```js
async function getData(id) {
  return fetch(`/api/${id}`, { signal: cacheSignal() });
}
```

**Performance Tracks.** React adds custom tracks to the Chrome DevTools Performance panel: a **Scheduler** track showing what React worked on at each priority, and a **Components** track showing which components rendered and for how long. "I'd open the Scheduler track to see whether the work was starved by a higher-priority lane" beats guessing from the flame chart.

**`useId` format, changed twice.** React 19.1 changed generated IDs from `:r123:` to `«r123»` so they are valid CSS selectors, and 19.2 changed them again to underscores (`_r_0_` on the client, `_R_0_` from the server), which are also valid in a `view-transition-name`. It only matters if snapshot tests assert on generated IDs, which is itself a bad idea.

---

### 16.9 What React 19 Changed — Removals, Migrations and Behaviour

The sections above cover what React 19 **added**. This one covers what it **changed or removed**, which is what an upgrade runs into.

#### Removed

| Removed | Replacement | Codemod |
|---|---|---|
| **`findDOMNode`** | a `ref` on the element | — |
| **String refs** (`ref="input"`) | callback refs — `ref={el => this.input = el}` | `react/19/replace-string-ref` |
| **Legacy context** (`contextTypes`, `getChildContext`) | `createContext` + `static contextType` | — |
| **`propTypes`** | TypeScript. **Silently ignored** in 19 — no warning | `react/prop-types-typescript` |
| **`defaultProps` on function components** | ES6 default parameters. **Classes keep `defaultProps`** | — |
| **`ReactDOM.render`** | `createRoot(el).render(…)` | `react/19/replace-reactdom-render` |
| **`ReactDOM.hydrate`** | `hydrateRoot(el, …)` | as above |
| **`unmountComponentAtNode`** | `root.unmount()` | as above |
| **`react-test-utils`** | React Testing Library | — |

The two that catch people out: **`propTypes` is ignored silently**, so runtime validation you thought you had stopped working; and **`defaultProps` still works on classes** but not on function components.

#### No lifecycle methods were removed

A common wrong assumption. Every class lifecycle method still works in React 19, from `constructor` to `componentDidCatch`. The three `UNSAFE_*` methods (`UNSAFE_componentWillMount`, `UNSAFE_componentWillReceiveProps`, `UNSAFE_componentWillUpdate`) are still documented "for historical reasons"; see [§3.2](/frontend/react#32-class-components) for why they are unsafe under concurrent rendering. Class components are "still supported, but we don't recommend using them in new code": discouraged, not deprecated. Error boundaries still *require* a class.

#### Deprecated by replacement

Two APIs now have simpler forms, and the old ones are slated for removal:

```jsx
// ref is a normal prop — forwardRef is no longer needed
function MyInput({ placeholder, ref }) {
  return <input placeholder={placeholder} ref={ref} />;
}

function Demo() {
  const inputRef = useRef(null);
  return (
    <>
      <MyInput placeholder="Name" ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus the input</button>
    </>
  );
}
render(<Demo />);
```

Note `ref` on a **class** component is still the instance, not a prop.

```jsx
// <Context> is its own provider
const ThemeContext = createContext('');

function App() {
  return (
    // not <ThemeContext.Provider>
    <ThemeContext value="dark">
      <Toolbar />
    </ThemeContext>
  );
}

function Toolbar() {
  return <p>Theme: {useContext(ThemeContext)}</p>;
}
render(<App />);
```

Both have codemods, and both old forms (`forwardRef`, `<Context.Provider>`) will be removed in a future major.

#### Ref cleanup functions

A ref callback can now **return a cleanup function**, which React calls on unmount:

```jsx
<input
  ref={(node) => {
    const observer = new ResizeObserver(onResize);
    observer.observe(node);
    return () => observer.disconnect();      // NEW
  }}
/>
```

With a cleanup returned, React no longer calls the ref with `null` on unmount. One TypeScript consequence: **implicit returns are rejected**, because a returned value would be read as a cleanup, so `ref={el => (this.input = el)}` must become `ref={el => { this.input = el; }}`. A common upgrade error.

#### Behavioural improvements

- **Document metadata hoists automatically.** `<title>`, `<meta>` or `<link>` rendered anywhere moves to `<head>`, on the client, in streaming SSR and in Server Components. No `react-helmet` needed for simple cases.
- **Stylesheet precedence.** `<link rel="stylesheet" precedence="high" />` lets React order and deduplicate stylesheets across components, which prevents a flash of unstyled content.
- **Async scripts anywhere.** `<script async src="…" />` can go in any component and is deduplicated.
- **Resource preloading APIs** in `react-dom`: `prefetchDNS`, `preconnect`, `preload`, `preinit`. See the [Web Performance guide](/frontend/web-performance) for when to use each; a preloaded font needs `crossorigin` or it downloads twice.
- **Hydration errors show a diff** in one message, so a mismatch tells you which node differed.
- **`useDeferredValue` takes an `initialValue`**: `useDeferredValue(value, '')` returns `''` on the first render, then re-renders with the real value.

#### Upgrade order that works

1. Upgrade to **18.3 first**: it is 18.2 plus the deprecation warnings, so you fix them without a behaviour change.
2. Run the codemods: `npx codemod@latest react/19/migration-recipe`.
3. Replace `propTypes` with TypeScript, since it now fails silently.
4. Switch `ReactDOM.render` → `createRoot`, and check for `findDOMNode` and string refs in older code.
5. Fix TypeScript ref callbacks with implicit returns.
6. Only then adopt the new APIs (§16.1–16.8).

---

### 16.10 Where React Actually Is — Versions and Experimental Status

Interviewers ask this to check whether you follow the ecosystem or repeat old blog posts. This is the one place in the series that lists what each release changed; the sections above focus on how to use each feature. As of October 2026:

| Release | What it added or changed |
|---|---|
| **19.0** (5 December 2024) | Actions, `useActionState`, `useFormStatus`, `useOptimistic`, `use` (§16.2–16.5); `ref` as a prop; `<Context>` as its own provider; ref cleanup functions; metadata and stylesheet hoisting; the removals in §16.9 |
| **19.1** (28 March 2025) | Owner Stacks (`captureOwnerStack()`, development only); Suspense fixes; `useId` format `:r123:` → `«r123»` |
| **19.2** (1 October 2025) | `<Activity />`, `useEffectEvent`, `cacheSignal`, Partial Pre-rendering, batched SSR Suspense reveals, Performance Tracks (§16.6–16.8); `useId` format → `_r_` |
| **19.3** (9 September 2026), **latest** | `<ViewTransition>` and `addTransitionType` (Canary-only through 19.2), Fragment Refs, `browser()`, Trusted Types (§16.11). No removals |
| **React Compiler** | **1.0, stable** (7 October 2025). Opt-in; on by default in Expo SDK 54+ |
| **`eslint-plugin-react-hooks`** | **7.x**. Flat config by default; `recommended` includes the compiler-powered rules |
| **Governance** | React moved to the **React Foundation**, hosted by the Linux Foundation (February 2026) |

**The trap here is dates.** Much writing from 2025 and early 2026 correctly called `<ViewTransition>` experimental, and it is now stable; before September 2026 the reverse mistake, treating it as shipped because React Labs posts showed it, was just as common. When you mention a React feature in an interview, say which version it arrived in.

---

### 16.11 React 19.3 — What's New (September 2026)

19.3 is mostly about **animation and DOM control**, with no removals or breaking changes.

#### `<ViewTransition>`: animate UI changes

Wrap part of the tree in `<ViewTransition>` and React animates it, using the browser's View Transitions API, when a **Transition** changes it. The default is a cross-fade; you customise it with CSS.

```tsx
// In a real file: import { ViewTransition, startTransition, useState } from 'react';
const PHOTOS = [
  { id: 'p1', label: 'Mountains', color: '#2563eb' },
  { id: 'p2', label: 'Forest', color: '#16a34a' },
  { id: 'p3', label: 'Desert', color: '#d97706' },
];

function Gallery() {
  const [index, setIndex] = useState(0);
  const photo = PHOTOS[index];
  // A Transition, so <ViewTransition> animates it. A plain setIndex would not.
  const next = () => startTransition(() => setIndex((i) => (i + 1) % PHOTOS.length));

  return (
    <div>
      {/* A new key means the old slide EXITS and the new one ENTERS, so React cross-fades them. */}
      <ViewTransition key={photo.id}>
        <div style={{ width: 240, height: 140, borderRadius: 8, background: photo.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20 }}>
          {photo.label}
        </div>
      </ViewTransition>
      <button onClick={next} style={{ marginTop: 12 }}>Next</button>
    </div>
  );
}

render(<Gallery />);
```

What makes it different from animating by hand:

- **It animates four kinds of change:** *enter* (the `<ViewTransition>` was added), *exit* (it was removed; React keeps it on screen long enough to animate out, the part that is hard to do yourself), *update* (its contents changed) and *share* (an element with the same `name` leaves one place and appears in another, such as a thumbnail growing into a full image).
- **It only runs for Transitions:** `startTransition`, a `<Suspense>` boundary revealing content, or `useDeferredValue`. A plain `setState` does not animate, deliberately, so urgent updates such as typing never wait for an animation.
- **It works with Suspense.** Around a `<Suspense>` boundary it animates the switch from fallback to content. The recommended pattern: the fallback appears at once, and the switch to loaded content animates.
- **`addTransitionType('next')`** inside `startTransition` labels *why* the change happened, so the same update can slide left for "next" and right for "previous", with `enter`/`exit` props mapping each type to a CSS class.

It is DOM-only for now. Before 19.3 you called the browser's `document.startViewTransition()` from your router, which still works ([Modern CSS §13](/frontend/modern-css#13-view-transitions)).

#### Fragment Refs: reach a group of elements without a wrapper

A component that renders several siblings has no single DOM node for a ref, and a wrapper `<div>` can break a flex or grid layout. `<Fragment ref={ref}>` gives you a **FragmentInstance** that acts on its children:

```tsx
// In a real file: import { Fragment, useRef, useEffect } from 'react';
function ResultRow({ item }) {
  return <button style={{ display: 'block', margin: '4px 0' }}>{item.title}</button>;
}

function Results({ items }) {
  const groupRef = useRef(null);
  useEffect(() => {
    groupRef.current.focus();                    // focuses the first focusable child: "First result"
  }, []);
  return (
    <Fragment ref={groupRef}>
      {items.map((item) => <ResultRow key={item.id} item={item} />)}
    </Fragment>
  );
}

render(<Results items={[{ id: 1, title: 'First result' }, { id: 2, title: 'Second result' }]} />);
```

A FragmentInstance can `addEventListener`/`removeEventListener` on all its children, `focus()`/`focusLast()`/`blur()`, attach an `IntersectionObserver` or `ResizeObserver` with `observeUsing()`, and measure or scroll (`getClientRects()`, `scrollIntoView()`), so you can attach behaviour to children you did not write without changing their DOM.

#### `browser()`: client-only components without hydration errors

Some components can only render in the browser: they read `localStorage`, `window` or the user's time zone. On the server they crash or produce HTML that doesn't match the client, a hydration mismatch ([Interview Q35](/frontend/react-interview-questions)). The old workaround, a `mounted` flag set in an effect, renders twice.

```tsx
// In a real file: import { use, Suspense } from 'react'; import { browser } from 'react-dom';
function LocalTime() {
  use(browser());                                // on the server: suspend, show the Suspense fallback
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return <p>Your time zone: {zone}</p>;
}

render(
  <Suspense fallback={<p>Loading your time zone…</p>}>
    <LocalTime />
  </Suspense>
);
```

During server rendering `browser()` errors, and inside a `<Suspense>` boundary React treats that as "render this part in the browser": the fallback goes into the HTML and no recoverable error is reported. In the browser it resolves and the component renders normally. Like any `use` call, it can come after an early return or inside a condition.

#### Trusted Types

Trusted Types is a browser feature that, once a site enables it with a Content Security Policy header, refuses raw strings in dangerous places such as `innerHTML`; only values made by an approved policy pass. React used to convert every value to a plain string, which stripped that approval. It now passes `TrustedHTML`, `TrustedScript` and `TrustedScriptURL` through unchanged, so a site can enforce Trusted Types and still use `dangerouslySetInnerHTML` ([Web Security §3.4](/backend/web-security#34-trusted-types)).

#### Smaller changes worth knowing

- **Server Components can render a context provider from a client module directly**, such as `<UserContext value={user}>`, without writing a separate `'use client'` Provider wrapper component.
- **Transitions render independently** instead of being merged into one render, so a slow transition no longer holds back an unrelated one.
- **StrictMode double-invokes effects during hydration** too, so server-rendered pages get the same check as client-rendered ones ([Interview Q74](/frontend/react-interview-questions)).
- **A development warning when `use` is called conditionally** in a way that looks wrong.
- **React DOM:** `onFullscreenChange`/`onFullscreenError` events, `onReset` when React resets a form after an action, `submit` events include the `submitter`, and `resize` updates are batched until the next frame.
- Fixes include `useDeferredValue` getting stuck and `useEffectEvent` reading stale values inside `memo` and `forwardRef` components.

**Upgrading** from 19.2 is a version bump. If you were on a Canary build for `<ViewTransition>`, you can move back to stable.
