# Zustand — Complete Guide

A small store that lives outside React, with **selector-level subscriptions** — which is the one thing Context cannot do and the reason this library exists alongside it.

## Table of Contents

- [1. Why Zustand Exists](#1-why-zustand-exists)
- [2. The Store](#2-the-store)
- [3. Selectors and Re-render Control](#3-selectors-and-re-render-control)
- [4. Structuring a Real Store](#4-structuring-a-real-store)
- [5. Middleware](#5-middleware)
- [6. Async Actions and Server State](#6-async-actions-and-server-state)
- [7. Using the Store Outside React](#7-using-the-store-outside-react)
- [8. TypeScript](#8-typescript)
- [9. Testing](#9-testing)
- [10. Zustand vs Redux Toolkit vs Context vs Jotai](#10-zustand-vs-redux-toolkit-vs-context-vs-jotai)
- [11. Common Pitfalls](#11-common-pitfalls)
- [12. Interview Questions and Answers](#12-interview-questions-and-answers)
- [13. Tricky Output Questions](#13-tricky-output-questions)
- [14. Quick Reference Card](#14-quick-reference-card)
- [15. References](#15-references)

---

## 1. Why Zustand Exists

Zustand (German for "state") is a ~1 KB store built on `useSyncExternalStore`. The store lives **outside** React; components subscribe to the slices they care about.

**The problem it solves is a specific one.** React Context has no partial subscription: when the context value changes, **every** consumer re-renders, regardless of which field it reads. Split a context into five and you have five providers to nest and five decisions to maintain. Zustand keeps one store and makes the *selector* the unit of subscription — a component re-renders only when the value it selected actually changed.

```tsx
// Context: reading one field subscribes you to the whole value, so this
// component re-renders when `user` or `notifications` change too.
const { theme } = useContext(AppContext);
```

```tsx
// Zustand: this component re-renders only when `theme` itself changes.
const theme = useAppStore(s => s.theme);
```

**What it deliberately does not have:** actions as serialisable objects, a reducer, a dispatcher, or a single mandated update path. That is the trade — less ceremony and no boilerplate, but also no action log to replay and weaker conventions in a large team. Section 10 covers when that trade is wrong.

### Installation

```bash
npm install zustand
```

---

## 2. The Store

`create` takes a function that receives `set` and `get` and returns the initial state **plus the actions that change it**. Keeping actions inside the store is the convention that matters: it means the store is the complete description of how the state can change.

```tsx
import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  couponCode: null,

  addItem: (product) => set((state) => ({
    items: [...state.items, { ...product, qty: 1 }],
  })),

  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id),
  })),

  // `get` reads current state without subscribing — useful inside actions.
  total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

  clear: () => set({ items: [], couponCode: null }),
}));
```

Three things about `set` that catch people out:

**It merges at the top level, one level deep.** `set({ items: [] })` leaves `couponCode` untouched — you do not have to spread the whole state. But nested objects are *replaced*, not merged: `set({ user: { name: 'Ana' } })` drops every other field on `user`. Spread it yourself, or reach for the `immer` middleware (§5).

**Pass a function when the next value depends on the current one.** `set(state => ...)` reads the value React is about to commit. `set({ count: count + 1 })` closes over a possibly-stale render value — the same trap as `setState`.

**You can replace rather than merge** with the second argument: `set(newState, true)`. This wipes everything not in `newState`, including your actions, so it is almost always a bug unless you are deliberately resetting the whole store.

### Using it

```tsx
function Cart() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <ul>
      {items.map((i) => (
        <li key={i.id}>{i.name} <button onClick={() => removeItem(i.id)}>Remove</button></li>
      ))}
    </ul>
  );
}
```

**There is no provider.** The store is a module-level singleton, so any component can use the hook without being wrapped in anything. That is convenient, and it is also the thing that makes per-request isolation in SSR a real problem — see §11.

---

## 3. Selectors and Re-render Control

This section is the whole library. Everything else is convenience.

```tsx
// ✗ Subscribes to the ENTIRE store. Re-renders on every change anywhere.
const store = useCartStore();

// ✓ Subscribes to one value. Re-renders only when that value changes.
const count = useCartStore((s) => s.items.length);
```

Zustand compares the selector's result to the previous one with `Object.is`. A primitive compares by value, so `items.length` only triggers a render when the number actually changes.

### The new-object trap

```tsx
// ✗ A NEW object every call, so Object.is is always false — re-renders on
//   every store change, exactly what you were trying to avoid.
const { items, total } = useCartStore((s) => ({ items: s.items, total: s.total }));
```

Two correct fixes:

```tsx
// 1. Separate subscriptions — simplest, and usually right.
const items = useCartStore((s) => s.items);
const total = useCartStore((s) => s.total);
```

```tsx
// 2. Shallow comparison, when you genuinely want one selector.
import { useShallow } from 'zustand/react/shallow';

const { items, total } = useCartStore(
  useShallow((s) => ({ items: s.items, total: s.total })),
);
```

`useShallow` compares one level deep, so a new wrapper object with the same field references is treated as unchanged. **In Zustand v5 this is the only supported form** — the old `useStore(selector, shallow)` second argument was removed.

### Derived values

Compute in the selector, not in the component, so the comparison happens on the *result*:

```tsx
// Re-renders only when the count of unread items changes — not on every edit.
const unread = useCartStore((s) => s.items.filter((i) => !i.seen).length);
```

Note the filter runs on every store change; it is the *render* that is skipped, not the selector. For an expensive derivation over a large collection, memoise it or store the derived value.

---

## 4. Structuring a Real Store

For anything beyond a few fields, split the store into **slices** — functions that each return part of the state and are composed into one store.

```tsx
const createCartSlice = (set) => ({
  items: [],
  addItem: (p) => set((s) => ({ items: [...s.items, p] })),
});

const createUserSlice = (set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null, items: [] }),   // can touch other slices
});

const useStore = create((...a) => ({
  ...createCartSlice(...a),
  ...createUserSlice(...a),
}));
```

**Why this shape:** each slice is owned by a feature and reviewable on its own, while there is still one store — so an action can span slices (`logout` clearing the cart) without cross-store coordination.

**The trade-off to state out loud:** slices share one namespace, so two features cannot both have `items`. That is a real constraint at scale, and the usual answer is a naming convention or separate stores per domain.

### One store or several?

Several small stores are fine and often better — they are independent modules with no shared namespace. Use one store when actions routinely need to read or write across domains; use several when they do not. Unlike Redux, nothing forces the single-store choice.

---

## 5. Middleware

Middleware wraps the store creator. Order matters, and it is the thing people get wrong.

```tsx
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useStore = create(
  devtools(
    persist(
      immer((set) => ({
        user: { name: '', prefs: { theme: 'light' } },
        setTheme: (theme) => set((s) => { s.user.prefs.theme = theme; }),
      })),
      {
        name: 'app-storage',                       // localStorage key
        partialize: (s) => ({ user: s.user }),     // persist only this
        version: 1,
        migrate: (persisted, from) => (from === 0 ? upgrade(persisted) : persisted),
      },
    ),
  ),
);
```

| Middleware | What it gives you | Watch out for |
|---|---|---|
| `persist` | Writes state to localStorage and rehydrates on load | Persists everything unless you `partialize`; needs `version` + `migrate` or an old shape crashes a returning user |
| `devtools` | Redux DevTools, including time travel | Name your actions (`set(fn, false, 'cart/addItem')`) or the log is a wall of `anonymous` |
| `immer` | Write "mutations" that produce immutable updates | Adds ~14 KB; only worth it for genuinely deep state |
| `subscribeWithSelector` | `subscribe` with a selector and an equality check | Only needed for imperative subscriptions outside React (§7) |

**Ordering:** `devtools` goes outermost so it sees every change; `persist` wraps the creator so it can rehydrate; `immer` goes innermost, next to your state. Getting `persist` and `devtools` the wrong way round means the devtools log shows rehydration as a user action.

**`persist` is asynchronous on rehydration.** The first render can happen before storage is read, which is a hydration mismatch waiting to happen in SSR. `useStore.persist.hasHydrated()` and `onRehydrateStorage` exist for exactly that.

---

## 6. Async Actions and Server State

There is no thunk and no special API — an action is just a function, so it can be async.

```tsx
const useUserStore = create((set, get) => ({
  user: null,
  status: 'idle',                                  // idle | loading | error | done
  error: null,

  fetchUser: async (id) => {
    // Guard re-entry: two components mounting at once must not both fetch.
    if (get().status === 'loading') return;
    set({ status: 'loading', error: null });
    try {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      set({ user: await res.json(), status: 'done' });
    } catch (e) {
      set({ error: e.message, status: 'error' });
    }
  },
}));
```

**But the strong answer in an interview is that most of this should not be in the store at all.** Data owned by a server needs caching, de-duplication, background refetching, retries and invalidation — and rebuilding those in a store is how state managers became bloated in the first place. Use **TanStack Query for server state** and Zustand for what is genuinely client state: the user's UI preferences, a multi-step form in progress, a selection, an open modal, feature flags.

If you have a `loading` flag, an `error` field and a cache keyed by id in your store, you are writing a worse TanStack Query.

---

## 7. Using the Store Outside React

Because the store is a plain object, it works anywhere — an event handler, a socket callback, a route guard, a test.

```tsx
// Read once, no subscription.
const token = useAuthStore.getState().token;

// Write from outside React.
useAuthStore.getState().logout();

// Subscribe imperatively (requires subscribeWithSelector for the selector form).
const unsub = useAuthStore.subscribe(
  (s) => s.token,                                  // what to watch
  (token, prev) => { if (!token && prev) redirectToLogin(); },
);
```

This is genuinely useful — an API client can read the token without a hook, and a socket handler can push messages into the store. **The risk is that it bypasses every convention you set**: any module can now mutate state from anywhere, and nothing records that it happened. Keep writes going through named actions, and treat `setState` from outside a store action as a smell.

---

## 8. TypeScript

The one piece of syntax to remember is the **curried `create`**, needed because TypeScript cannot infer the state type and the middleware types at the same time.

```tsx
interface CartState {
  items: Item[];
  addItem: (p: Item) => void;
}

// Note create<CartState>()(...) — the extra call is not a typo.
const useCartStore = create<CartState>()(
  devtools(
    persist((set) => ({
      items: [],
      addItem: (p) => set((s) => ({ items: [...s.items, p] })),
    }), { name: 'cart' }),
  ),
);
```

Without the second pair of parentheses you get an inference error that does not obviously point at this. For slices, type each slice creator with `StateCreator<FullState, [], [], SliceState>` so a slice can read fields owned by another.

---

## 9. Testing

The store being a module singleton is the thing that bites: **state leaks between tests**.

```tsx
const initial = useCartStore.getState();

beforeEach(() => {
  // Reset to the initial snapshot, replacing rather than merging.
  useCartStore.setState(initial, true);
});

it('adds an item', () => {
  useCartStore.getState().addItem({ id: '1', name: 'Book', price: 10 });
  expect(useCartStore.getState().items).toHaveLength(1);
});
```

Most store logic can be tested exactly like that — no rendering at all, because the store is not a React thing. For components, render normally and drive the store with `setState`; there is no provider to wrap.

---

## 10. Zustand vs Redux Toolkit vs Context vs Jotai

| Aspect | Context | Zustand | Redux Toolkit | Jotai |
|---|---|---|---|---|
| Partial subscription | **No** — every consumer re-renders | Yes, per selector | Yes, per selector | Yes, per atom |
| Boilerplate | Lowest | Low | Moderate | Low |
| Provider required | Yes | No | Yes | Yes |
| DevTools / time travel | No | Via middleware | Built in, best in class | Via middleware |
| Enforced update path | No | No | Yes — actions and reducers | No |
| Async | Plain functions | Plain functions | Thunks / RTK Query / Saga | Plain functions |
| Bundle | 0 — built in | ~1 KB | ~13 KB (+ RTK Query) | ~3 KB |
| Model | Tree-scoped value | One external store | One external store | Bottom-up atoms |

**Context is not a state manager.** It is dependency injection — a way to pass a value down without prop drilling. It is the right tool for something that rarely changes: the theme, the locale, a configured client. It becomes the wrong tool the moment the value changes often, because it cannot subscribe partially.

**Choose Redux Toolkit when the constraints are organisational.** A large team benefits from one enforced way to change state, an action log you can read in a bug report, time-travel debugging, and middleware for cross-cutting concerns. Redux Saga adds declarative, testable orchestration for genuinely complex async flows — long-running sagas, cancellation, racing, retries — which is real work to reproduce in any of the others.

**Choose Zustand when the constraint is ceremony.** Small to mid-size teams, or a large app where most state is server state and the remaining client state is modest. You give up the enforced path and the action history.

**Jotai** is the same subscription idea inverted: state is built bottom-up from atoms that compose, rather than top-down from one store. It suits state that is naturally fine-grained and derived.

**The answer that lands in an interview:** name the axis rather than the winner. The real question is whether your state is server state (TanStack Query, regardless of the rest), rarely-changing config (Context), or genuinely shared mutable client state — and only for the third does the Zustand-versus-Redux question even arise.

---

## 11. Common Pitfalls

**Subscribing to the whole store.** `const store = useMyStore()` re-renders that component on every change anywhere. It is the single most common Zustand mistake and it silently undoes the library's main benefit.

**Returning a new object from a selector** without `useShallow`, which fails `Object.is` every time. Same symptom as above, harder to spot.

**Putting server data in the store.** You end up hand-rolling caching, refetching and invalidation. See §6.

**Nested updates that drop siblings.** `set` merges only the top level: `set({ user: { name } })` discards every other field on `user`.

**Persisting everything.** Without `partialize` you write transient UI state to localStorage and rehydrate a stale modal. Without `version` and `migrate`, a shape change breaks every returning user — and it is *their* browser holding the bad data, so you cannot fix it server-side.

**Module singletons in SSR.** One store shared across requests means one user's data can leak into another's render. For Next.js, create the store per request and provide it through Context — the one case where Zustand needs a provider after all.

**Actions defined outside the store.** Scattered `useStore.setState(...)` calls across components means the store no longer describes how it can change, which is the thing that makes a store readable.

---

## 12. Interview Questions and Answers

**Q1: What problem does Zustand solve that Context does not?**

Partial subscription. A Context value change re-renders **every** consumer, whatever field it reads, because Context has no way to subscribe to part of a value. Zustand keeps the store outside React and makes the selector the unit of subscription, so a component re-renders only when its own slice changes. Splitting Context into several contexts is the workaround, and it trades one problem for provider nesting and a set of boundaries you have to keep re-deciding. Context is still the right tool for a rarely-changing value — theme, locale, a configured client — because there it is dependency injection, not state management.

---

**Q2: How does Zustand avoid re-rendering components that did not change?**

The store holds state outside React and keeps a set of subscribers. Each `useStore(selector)` call subscribes through `useSyncExternalStore`, runs the selector against the new state on every change, and compares the result with `Object.is`. Equal result, no re-render. This is why returning a fresh object from a selector defeats it entirely — a new reference is never `Object.is`-equal — and why `useShallow` exists for the case where you genuinely want several fields from one selector.

---

**Q3: Why `useSyncExternalStore` rather than `useState` and `useEffect`?**

Because it is the purpose-built primitive for reading an external mutable source, and it prevents **tearing**. With `useState` + `useEffect` the subscription is established after paint, so the first frame can show stale data; worse, under concurrent rendering React can interrupt and resume a render, and two components reading the same store mid-update can display different values within one frame. `useSyncExternalStore` gives React a snapshot function it can call during render and forces a synchronous re-render when the store changes, which closes both holes.

---

**Q4: When would you choose Redux Toolkit over Zustand?**

When the constraints are organisational rather than technical. Redux gives you one enforced way to change state, which matters when many people touch the same store; a serialisable action log, so a bug report can include what actually happened; time-travel debugging; and an established middleware ecosystem for cross-cutting concerns. Redux Saga on top of that is genuinely hard to replicate — declarative, testable orchestration of complex async flows with cancellation and racing. Zustand's trade is deliberate: far less ceremony, and no enforced path or action history. For a small team where most remote data lives in TanStack Query and the client state is modest, that trade is usually right.

---

**Q5: How do you structure a Zustand store for a large application?**

Slices — a function per feature returning its state and actions, composed into one store — with each slice owned by a team and reviewable on its own. Actions live inside the store so it remains a complete description of how state can change. Cross-slice actions are fine and are the reason to keep one store rather than several. The constraint worth naming is the shared namespace: two features cannot both own `items`, so you need a convention, or separate stores per domain. I would also keep server state out entirely, which usually shrinks the store to the point where the structure question is much less pressing.

---

**Q6: What is `useShallow` and when do you need it?**

Zustand compares the selector result with `Object.is`. A selector returning an object literal produces a new reference every call, so the comparison always fails and the component re-renders on every store change — the exact thing selectors were meant to prevent. `useShallow` wraps the selector with a one-level-deep comparison, so a new wrapper containing the same field references counts as unchanged. In v5 it is the only supported form; the old second-argument equality function was removed. The alternative, and usually the simpler one, is several separate `useStore` calls.

---

**Q7: How do you persist state, and what goes wrong?**

The `persist` middleware, with three options that are not optional in practice. `partialize` restricts what is written, because persisting the whole store means transient UI state is restored on the next visit. `version` plus `migrate` handles shape changes — without them, a returning user with an old shape gets a crash on load, and the bad data is in *their* browser, so you cannot fix it from the server. And rehydration is asynchronous, so the first render can occur before storage is read; `onRehydrateStorage` and `hasHydrated()` exist for that, and ignoring it is a classic SSR hydration mismatch.

---

**Q8: Can you use Zustand outside React? Should you?**

Yes — `getState()`, `setState()` and `subscribe()` are plain methods on the store, so an API client, a socket handler or a router guard can read and write without a hook. It is one of the practical advantages over Context. The caution is that it bypasses every convention you have: any module can now change state from anywhere and nothing records it. I keep writes going through named actions and treat a bare `setState` outside the store as a smell worth a comment.

---

**Q9: How does Zustand handle async?**

There is nothing to handle — an action is a plain function, so it can be `async` and call `set` when it resolves. No thunk middleware, no special action types. What that leaves you responsible for is everything a data-fetching library does: guarding re-entry so two mounts do not both fetch, cancelling superseded requests, retries, and cache invalidation. Which is the argument for not putting server data in the store in the first place.

---

**Q10: What breaks when you use Zustand with SSR?**

The store is a module-level singleton, so on a server it is shared across requests — one user's data can end up in another user's HTML. The fix is to create the store per request and pass it down through Context, which is the one situation where Zustand does need a provider. The second problem is `persist`: rehydration happens on the client after the server has already rendered, so the markup can differ and React reports a hydration mismatch. Gate on `hasHydrated()` and render the pre-hydration state on both sides.

---

**Q11: How do you test a Zustand store?**

Most of it needs no rendering at all, because the store is not a React construct: call the action, assert on `getState()`. The thing to get right is isolation — the store is a module singleton, so state leaks between tests. Snapshot the initial state once and reset with `setState(initial, true)` in `beforeEach`, where the `true` replaces rather than merges. For components, render normally and drive the store imperatively; there is no provider to set up, which makes component tests noticeably shorter than the Redux equivalent.

---

**Q12: Your team says "we'll just use Context, we don't need a library." What is your response?**

I would agree for anything that rarely changes and disagree for the rest, on one specific ground: Context cannot subscribe partially, so every consumer re-renders when any field changes. With a theme that is irrelevant. With a store holding the user, notifications and a cart, it means adding a notification re-renders everything reading the user. The usual reply is "split the contexts", which works and costs you nested providers and a boundary decision every time a field is added. So: Context for injection and rarely-changing values, a selector-based store for shared mutable state, and TanStack Query for anything owned by the server — at which point the remaining state is often small enough that the argument stops mattering.

---

## 13. Tricky Output Questions

**Q1: A component calls `const { count } = useStore()` with no selector. The store also holds an unrelated `messages` array that updates every second. How often does this component re-render?**

**Output:**
```
Every second — once per store change, forever.
```

**Explanation:**

Calling the hook with no selector subscribes to the **entire store object**. Zustand compares the previous and next selected value with `Object.is`, and the selected value here is the whole state object, which is a new reference on every `set`. So every change anywhere — including `messages`, which this component never reads — fails the comparison and schedules a render.

Destructuring in the component is the misleading part: it looks like you only asked for `count`, but the destructuring happens *after* the subscription has already taken everything. The fix is to move the narrowing into the selector, where the comparison happens: `useStore(s => s.count)`.

**Takeaway:** the selector is the subscription. Anything you narrow after the hook returns is too late.

---

**Q2: `useStore(s => ({ a: s.a, b: s.b }))` — `a` and `b` never change, but the component re-renders on every unrelated store update. Why?**

**Output:**
```
The selector returns a new object every call, so Object.is is always false.
```

**Explanation:**

Zustand runs the selector after each store change and compares the result with the previous one. `{ a: s.a, b: s.b }` allocates a **new object literal** every time it runs, and two distinct objects are never `Object.is`-equal — even when every field inside them is identical. So the comparison fails, and the component re-renders on every change in the store.

This is the same class of bug as an inline object defeating `React.memo`, and it is easy to miss because the code reads as though it selected only two fields.

Two fixes: two separate `useStore` calls, each returning a primitive or a stable reference; or `useShallow(s => ({ a: s.a, b: s.b }))`, which compares one level deep so a new wrapper with the same field references counts as unchanged.

**Takeaway:** returning a fresh object from a selector turns a precise subscription into a subscription to everything.

---

**Q3: `set({ user: { name: 'Ana' } })` runs against state `{ user: { name: 'Bo', email: 'bo@x.com', role: 'admin' } }`. What is `user` afterwards?**

**Output:**
```
{ name: 'Ana' }        // email and role are gone
```

**Explanation:**

`set` performs a **shallow merge — one level deep only**. It merges the object you passed into the top level of the state, so other top-level keys survive. But `user` itself is replaced wholesale by the new object; nothing merges *inside* it.

People expect a deep merge because the top-level behaviour looks like one. The correct forms are `set(s => ({ user: { ...s.user, name: 'Ana' } }))`, or the `immer` middleware, where `set(s => { s.user.name = 'Ana'; })` produces the immutable update for you.

**Takeaway:** `set` merges the top level and replaces everything below it.

---

**Q4: Two components mount at the same time and both call `fetchUser()` in an effect. The action sets `status: 'loading'` before awaiting. How many requests are sent?**

**Output:**
```
Two — unless the action guards on the CURRENT state with get().
```

**Explanation:**

`set({ status: 'loading' })` is synchronous, but both effects run before either `await` resolves, so both calls pass any check made against a value captured at render time. A guard using a selector value from the component's closure sees `'idle'` in both.

Reading through `get()` **inside** the action is what makes the guard work, because `get()` returns the state as it is at that moment, after the first call has already set `'loading'`:

```tsx
fetchUser: async (id) => {
  if (get().status === 'loading') return;      // ✓ reads current state
  set({ status: 'loading' });
  // …
}
```

This is de-duplication done by hand, and it is a good moment to note that TanStack Query does it for you — which is the argument for keeping server data out of the store.

**Takeaway:** inside an action, read with `get()`; a value captured during render is already stale by the time the action runs.

---

**Q5: A test asserts the cart is empty, but it contains an item added by a previous test. The store was never shared deliberately. What happened?**

**Output:**
```
The store is a module singleton — it persists across tests in the same file.
```

**Explanation:**

`create()` runs once when the module is first imported and produces one store for the lifetime of the module registry. Tests in the same file share it, so state written by one test is visible to the next, and the failure depends on test **order** — which makes it look intermittent.

The fix is to snapshot the initial state once and restore it before each test, replacing rather than merging so that anything added is removed:

```tsx
const initial = useCartStore.getState();
beforeEach(() => useCartStore.setState(initial, true));
```

The same singleton property is what breaks SSR, for the same reason at a different scale: one store shared across requests instead of across tests.

**Takeaway:** a module-level store is shared by everything that imports it — reset it explicitly in tests, and create it per request on a server.

---

**Q6: With `persist`, a returning user sees a blank screen after a release that renamed a state field. Why, and what prevents it?**

**Output:**
```
Rehydration restored the OLD shape; code reading the new field crashed.
```

**Explanation:**

`persist` writes the store to localStorage and restores it on load. The restored value is whatever shape the app had when that user last visited — the release changed the code, not the data already sitting in their browser. Code expecting `profile.displayName` gets `undefined` from a payload that still has `profile.name`, and if that value is dereferenced during render, the tree unmounts.

The data is in *their* browser, so there is no server-side fix and no way to migrate it centrally. That is what `version` and `migrate` are for: bump the version when the shape changes and transform the old payload on read. A defensive `merge` and validation of the rehydrated value are worth adding for the same reason — persisted state is untrusted input.

**Takeaway:** persisted state is a schema you have to version, and the only place to migrate it is on the user's next visit.

---

## 14. Quick Reference Card

```tsx
// Create
const useStore = create((set, get) => ({ count: 0, inc: () => set(s => ({ count: s.count + 1 })) }));

// Read — ALWAYS with a selector
const count = useStore(s => s.count);                    // ✓ subscribes to one value
const store = useStore();                                // ✗ subscribes to everything

// Several fields from one selector
import { useShallow } from 'zustand/react/shallow';
const { a, b } = useStore(useShallow(s => ({ a: s.a, b: s.b })));

// Outside React
useStore.getState().inc();
const unsub = useStore.subscribe(s => s.count, c => console.log(c));

// Reset (tests) — `true` REPLACES instead of merging
useStore.setState(initial, true);
```

- `set` merges **one level deep**; nested objects are replaced.
- `set(fn)` when the next value depends on the current one.
- `get()` inside actions reads current state without subscribing.
- Selector returning an object literal ⇒ `useShallow`, or split the calls.
- `persist` needs `partialize`, `version` and `migrate`.
- `devtools` outermost, `immer` innermost.
- Server data belongs in TanStack Query, not here.
- SSR: create the store per request, and gate on `hasHydrated()`.

---

## 15. References

- **Zustand docs** — [https://zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs)
- **GitHub repository** — [https://github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)
- **`useSyncExternalStore`** — [https://react.dev/reference/react/useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- **Documentation home** — [https://zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs) · **Repository and release notes** — [https://github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)
- **TanStack Query** (server state) — [https://tanstack.com/query/latest](https://tanstack.com/query/latest)
