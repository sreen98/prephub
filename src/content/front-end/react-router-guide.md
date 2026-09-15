# React Router — Complete Guide

The URL is the one piece of application state the user can type, bookmark, share and hit Back on. React Router's job is to make your component tree a function of it.

## Table of Contents

- [1. What React Router Does](#1-what-react-router-does)
- [2. The Three Modes](#2-the-three-modes)
- [3. Routes and Nested Layouts](#3-routes-and-nested-layouts)
- [4. Navigating](#4-navigating)
- [5. The URL Is State](#5-the-url-is-state)
- [6. Data APIs — Loaders and Actions](#6-data-apis-loaders-and-actions)
- [7. Pending UI and Optimistic Updates](#7-pending-ui-and-optimistic-updates)
- [8. Errors and Boundaries](#8-errors-and-boundaries)
- [9. Code Splitting](#9-code-splitting)
- [10. Protected Routes](#10-protected-routes)
- [11. Scroll, Focus and Accessibility](#11-scroll-focus-and-accessibility)
- [12. Testing Routes](#12-testing-routes)
- [13. Deploying a SPA](#13-deploying-a-spa)
- [14. Migrating from v5 and v6](#14-migrating-from-v5-and-v6)
- [15. React Router vs the Alternatives](#15-react-router-vs-the-alternatives)
- [16. Common Pitfalls](#16-common-pitfalls)
- [17. Interview Questions and Answers](#17-interview-questions-and-answers)
- [18. Tricky Output Questions](#18-tricky-output-questions)
- [19. Quick Reference Card](#19-quick-reference-card)
- [20. References](#20-references)

---

## 1. What React Router Does

A single-page app serves one HTML document. Without a router, clicking a link asks the server for a new document and the page tears down — losing your JavaScript state, your open sockets and your scroll position.

React Router intercepts the click, calls `history.pushState` to change the URL without a request, matches the new URL against your route config, and renders the components that match. The browser's Back and Forward buttons keep working because `pushState` writes real history entries.

**Three things it owns**, and it is worth separating them because interview questions tend to be about one of them specifically:

| Concern | What it means |
|---|---|
| **Matching** | Given a URL, decide which components render |
| **Navigation** | Change the URL without a document request, and react to Back/Forward |
| **Data** | In the data modes, fetch before rendering and submit without a form post |

### Installation

```bash
npm install react-router-dom
```

In **v7** the package is just `react-router`; `react-router-dom` still exists and re-exports it, so an existing import path keeps working.

---

## 2. The Three Modes

This is the first thing to get straight, because the same library is three quite different tools depending on how you set it up, and an interviewer asking "how do you fetch data with React Router?" is really asking which of these you have used.

| Mode | You set it up with | Data fetching | Where it runs |
|---|---|---|---|
| **Declarative** | `<BrowserRouter>` + `<Routes>` | in your own components (`useEffect`, TanStack Query) | client only |
| **Data** | `createBrowserRouter([...])` | route `loader` / `action` | client only |
| **Framework** | the React Router plugin (v7) | route modules with server + client loaders | server and client |

**Declarative mode** is the one most people picture: `<Routes>` and `<Route>` in JSX, and you fetch however you like. It is a perfectly good choice — this very app uses it — and it is the right answer when your data layer is already TanStack Query.

**Data mode** hoists fetching into the route definition, which is what unlocks the rest: parallel loading for nested routes, pending UI, error boundaries per route, and form submissions without a page post.

**Framework mode** (v7, the former Remix) adds a build plugin, server rendering and file-based route modules. It is a framework decision, not a routing one.

**The upgrade path is deliberate:** declarative → data → framework, each a superset. You do not have to adopt all of it.

---

## 3. Routes and Nested Layouts

Nesting is the feature everything else rests on. A nested route renders *inside* its parent, which is how a persistent layout stays mounted while the content under it changes.

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="products" element={<ProductsLayout />}>
        <Route index element={<ProductList />} />
        <Route path=":id" element={<ProductDetail />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
</BrowserRouter>
```

The parent decides *where* the child appears, with `<Outlet />`:

```jsx
function RootLayout() {
  return (
    <div>
      <Header />          {/* stays mounted across every navigation below */}
      <main>
        <Outlet />        {/* the matched child route renders here */}
      </main>
    </div>
  );
}
```

**Why this matters beyond tidiness:** because the header never unmounts, its state survives — an open menu, a search box, a running animation. It is also what lets the data modes load a parent and child in parallel rather than waterfalling.

**Route types worth naming:**

- **Index route** (`index`) — what renders at the parent's own path. `/products` renders `ProductList` inside `ProductsLayout`.
- **Dynamic segment** (`:id`) — matches one segment and exposes it via `useParams()`.
- **Splat** (`*`) — matches the rest of the path, including slashes. As a sibling of your real routes it is your 404.
- **Layout route** — a `<Route>` with an `element` and children but **no `path`**, used to wrap a group without adding a URL segment.
- **Optional segment** (`:lang?`) — matches with or without that part.

**Matching is ranked, not ordered.** This is the biggest change from v5: React Router scores every route and picks the most specific match, so `/products/new` beats `/products/:id` regardless of which you wrote first. In v5 you needed `<Switch>` and `exact` and the order mattered.

---

## 4. Navigating

```jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';

function Nav() {
  const navigate = useNavigate();

  return (
    <nav>
      {/* Declarative: renders a real <a href>. */}
      <Link to="/products">Products</Link>

      {/* Knows whether it is active — style from the render prop, not by
          comparing location yourself. */}
      <NavLink
        to="/products"
        className={({ isActive }) => (isActive ? 'active' : undefined)}
      >
        Products
      </NavLink>

      {/* Imperative: for after an event, not instead of a link. */}
      <button onClick={() => navigate('/checkout')}>Checkout</button>
      <button onClick={() => navigate(-1)}>Back</button>
    </nav>
  );
}
```

**Use `<Link>` unless you cannot.** It renders an anchor, so middle-click, ⌘-click, "open in new tab", "copy link address" and screen-reader link navigation all work. A `<div onClick={() => navigate(...)}>` throws all of that away and is the single most common accessibility mistake in a React app.

**`replace` vs push.** `navigate('/x', { replace: true })` swaps the current history entry instead of adding one. Use it after a login redirect or a form submit, so Back does not return the user to a page that no longer makes sense.

**`<NavLink>` and `end`.** By default a NavLink is active when the URL *starts with* its `to`, so a link to `/` is active on every page. `end` restricts it to an exact match — and forgetting it is why the Home tab is always highlighted.

**Relative links resolve against the route, not the URL.** Inside a route matched at `/products/42`, `<Link to="edit">` goes to `/products/42/edit`, and `<Link to="..">` goes up one *route* level.

---

## 5. The URL Is State

The most useful idea in this guide: anything that should survive a refresh, be shareable, or be undoable with Back belongs in the URL rather than in `useState`.

```jsx
import { useParams, useSearchParams } from 'react-router-dom';

function ProductList() {
  const { category } = useParams();                    // from the path
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = searchParams.get('sort') ?? 'popular';
  const page = Number(searchParams.get('page') ?? 1);

  const setSort = (next) => {
    // Functional form, so you never clobber params you did not mean to touch.
    setSearchParams(prev => {
      prev.set('sort', next);
      prev.delete('page');          // a new sort means page 1
      return prev;
    }, { replace: true });          // filter changes should not fill history
  };

  return <SortSelect value={sort} onChange={setSort} page={page} />;
}
```

**Which filters belong in the URL?** The ones a user would expect to share or bookmark — search text, category, sort, page. A transiently open dropdown does not.

**Two details people get wrong.** `setSearchParams` replaces the whole query string when you hand it an object, so build from the previous value. And a filter change should usually `replace`, or pressing Back ten times walks the user through ten filter states instead of leaving the page.

---

## 6. Data APIs — Loaders and Actions

In data mode, a route declares how to get its data. The router calls the loader **before** rendering the route, so the component never renders in a loading state at all.

```jsx
import { createBrowserRouter, RouterProvider, useLoaderData } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/products/:id',
    element: <ProductDetail />,
    errorElement: <RouteError />,
    loader: async ({ params, request }) => {
      // `request.signal` is aborted when the user navigates away — pass it on
      // and a superseded request is cancelled for free.
      const res = await fetch(`/api/products/${params.id}`, { signal: request.signal });
      if (!res.ok) throw new Response('Not found', { status: res.status });
      return res.json();
    },
    action: async ({ request, params }) => {
      const form = await request.formData();
      await fetch(`/api/products/${params.id}`, { method: 'PUT', body: form });
      return redirect(`/products/${params.id}`);
    },
  },
]);

function ProductDetail() {
  const product = useLoaderData();     // already resolved — no loading branch
  return <h1>{product.name}</h1>;
}
```

**What this actually buys you:**

- **No fetch-on-render waterfall.** Nested loaders run **in parallel**, because the router knows the whole matched branch before rendering any of it. The `useEffect` version discovers the child's fetch only after the parent has rendered.
- **Cancellation for free**, via `request.signal`.
- **Errors become a route concern.** Throwing a `Response` from a loader renders the nearest `errorElement` instead of crashing the tree.
- **Forms work without JavaScript state.** `<Form method="post">` posts to the route's `action`, and the router revalidates the loaders afterwards.

**What it deliberately is not:** a cache. Loaders re-run on every navigation to that route. If you want caching, de-duplication and background revalidation, that is still TanStack Query's job — and combining them is normal.

---

## 7. Pending UI and Optimistic Updates

Because the router knows a navigation is in flight, it can tell you.

```jsx
import { useNavigation, useFetcher, Form } from 'react-router-dom';

function Root() {
  const navigation = useNavigation();   // 'idle' | 'loading' | 'submitting'
  return (
    <div>
      {navigation.state !== 'idle' && <TopProgressBar />}
      <Outlet />
    </div>
  );
}
```

**`useFetcher` is the one worth knowing.** It calls a loader or action **without navigating** — a "mark as read" button, a newsletter signup in the footer, a like. You get the same pending state and the same revalidation, with no URL change:

```jsx
function LikeButton({ id }) {
  const fetcher = useFetcher();
  // The optimistic value: what the server will say once this lands.
  const liked = fetcher.formData ? fetcher.formData.get('liked') === 'true' : undefined;

  return (
    <fetcher.Form method="post" action={`/products/${id}/like`}>
      <button name="liked" value="true" disabled={fetcher.state !== 'idle'}>
        {liked ?? 'Like'}
      </button>
    </fetcher.Form>
  );
}
```

`fetcher.formData` is the submission in flight, which is what makes optimistic UI nearly free: render from the submitted data while it is pending, and the revalidated loader data takes over when it settles.

---

## 8. Errors and Boundaries

```jsx
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    // A thrown Response — a 404 or 403 you raised deliberately.
    return <h1>{error.status} — {error.statusText}</h1>;
  }
  // An actual exception: a bug, or a chunk that failed to load.
  return <h1>Something went wrong.</h1>;
}
```

**Distinguish the two cases.** A thrown `Response` is an expected outcome — this product does not exist — and deserves a specific page. A thrown `Error` is a bug, and deserves a generic apology plus a way out.

**Put an `errorElement` at the root at minimum**, or a loader failure blanks the app. Putting one on a nested route is better: it keeps the layout and only the failing panel is replaced.

In declarative mode there are no `errorElement`s, so a plain React error boundary around the `<Outlet />` is the equivalent — which is what this app does, including a special case for the post-deploy `ChunkLoadError`.

---

## 9. Code Splitting

Routes are the correct splitting boundary: one page should not ship the other ninety-nine.

```jsx
const Dashboard = React.lazy(() => import('./Dashboard'));

<Route
  path="dashboard"
  element={
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard />
    </Suspense>
  }
/>
```

In data mode there is a `lazy` property that splits the loader and action too, so none of the route's code is in the main bundle:

```jsx
const dashboardRoute = {
  path: 'dashboard',
  lazy: async () => {
    const { Dashboard, loader } = await import('./Dashboard');
    return { Component: Dashboard, loader };
  },
};
```

**The failure mode to name:** after a deploy, hashed chunk filenames change, and a tab that has been open since before the deploy requests a file that no longer exists. That is `ChunkLoadError`, it is routine rather than exotic, and the fix is an error boundary that offers a reload.

---

## 10. Protected Routes

```jsx
function RequireAuth({ children }) {
  const { status, user } = useAuth();
  const location = useLocation();

  // Three states. "Not yet known" is not "logged out" — treating it as such
  // redirects every user to login on every refresh.
  if (status === 'loading') return <Spinner />;
  if (status === 'anon') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!user.permissions.includes('admin')) return <Forbidden />;   // 403, not login
  return children;
}
```

Three things carry the answer here: the **loading state** as a distinct third case, **401 versus 403** going to different places, and **remembering the destination** so login is a detour rather than a reset. `<Navigate>` is a component that navigates in an effect — which is why you render it rather than calling `navigate()` during render.

**Say the security point unprompted:** this is UX, not security. Client state is editable, so every protected route must be backed by server-side authorization on the API.

---

## 11. Scroll, Focus and Accessibility

A client-side navigation changes the page without the browser doing any of the things it normally does, and the two it stops doing are the two that matter for accessibility.

**Scroll.** The browser restores scroll on a real navigation; a `pushState` does not. In framework mode `<ScrollRestoration />` handles it. Otherwise:

```jsx
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
```

Depend on `pathname` rather than the whole location, or changing a search param scrolls the user to the top mid-filter.

**Focus is the one people miss entirely.** After a real navigation, focus resets to the document. After a client-side one it stays wherever it was — so a keyboard user activates a link and focus is still on a link that no longer exists, and a screen reader announces nothing at all.

```jsx
function RouteAnnouncer({ title }) {
  const headingRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => { headingRef.current?.focus(); }, [pathname]);

  // tabIndex={-1} makes it programmatically focusable without adding a tab stop.
  return <h1 ref={headingRef} tabIndex={-1}>{title}</h1>;
}
```

A live region announcing the new page title is the other half. Neither is provided for you.

---

## 12. Testing Routes

Use `MemoryRouter` — no DOM history, and you set the starting URL directly:

```jsx
import { MemoryRouter } from 'react-router-dom';

render(
  <MemoryRouter initialEntries={['/products/42']}>
    <App />
  </MemoryRouter>,
);
```

For data mode, build a router in the test with `createMemoryRouter(routes, { initialEntries })` and render a `RouterProvider`, which lets you assert on loader behaviour too.

**The bug this catches, and it is a real one from this codebase:** a component that reads the global `window.location` instead of `useLocation()` typechecks perfectly and works in development. Under a basename — this app is served from `/prephub/` — `window.location.pathname` is `/prephub/quiz` and never equals `/quiz`, so every active-link highlight is silently dead in production. `MemoryRouter` catches it because there is no `window.location` to accidentally read.

---

## 13. Deploying a SPA

Client-side routing means the browser asks your server for `/products/42`, and a static host has no such file.

| Host | The fix |
|---|---|
| **nginx** | `try_files $uri $uri/ /index.html;` |
| **Apache** | a `.htaccess` rewrite to `index.html` |
| **Netlify** | `/* /index.html 200` in `_redirects` |
| **Vercel** | a rewrite in `vercel.json` |
| **GitHub Pages** | no server config at all — see below |

**GitHub Pages has no rewrite rules**, which is why the usual workaround is a `404.html` that stores the path and redirects to `index.html`, where the router restores it. It works, and it costs a redirect on every deep link — measurably around a second on mobile. The better fix for a known set of routes is to emit a real `index.html` at each one at build time, so the server finds a file and no redirect happens.

Set `basename` when the app is not at the domain root:

```jsx
<BrowserRouter basename="/prephub">{/* …the rest of the app… */}</BrowserRouter>;
```

**`HashRouter`** (`/#/products/42`) needs no server configuration at all, because everything after `#` never reaches the server. The cost is ugly URLs and worse SEO — it is the fallback for hosts you cannot configure.

---

## 14. Migrating from v5 and v6

**v5 → v6** was the big one:

| v5 | v6 |
|---|---|
| `<Switch>` with ordered matching | `<Routes>` with **ranked** matching — order stops mattering |
| `exact` | not needed; matching is exact by default |
| `component={X}` / `render={...}` | `element={<X />}` |
| `useHistory()` | `useNavigate()` |
| `history.push(x)` / `.replace(x)` | `navigate(x)` / `navigate(x, { replace: true })` |
| nested routes defined inside components | nested `<Route>` elements plus `<Outlet />` |
| `<Redirect>` | `<Navigate>` |

**v6 → v7** is deliberately undramatic. The package became `react-router`, the minimum React version rose, and the behaviours that were behind `future` flags in late v6 became the default. The migration strategy the team recommends is to turn those flags on one at a time in v6.30 — `v7_startTransition`, `v7_relativeSplatPath`, `v7_fetcherPersist`, `v7_normalizeFormMethod`, `v7_partialHydration` — so that by the time you bump the major, nothing changes.

**The one that surprises people is `v7_relativeSplatPath`**, which changes how relative links resolve inside a splat route. If you have `<Route path="files/*">` with relative links inside it, check those first.

---

## 15. React Router vs the Alternatives

| Aspect | React Router | TanStack Router | Next.js App Router |
|---|---|---|---|
| Route definition | JSX or an object array | an object array, file-based optional | file system |
| Type safety | params typed manually | **fully inferred**, including search params | params typed manually |
| Search params | strings via `URLSearchParams` | typed, validated, structured | strings |
| Data loading | loaders (data mode) | loaders with built-in caching | Server Components + `fetch` |
| Server rendering | framework mode only | separate (TanStack Start) | the whole point |
| Bundle | small | small | it is the framework |

**React Router** is the default for a client-rendered SPA, and its reach means most teams already know it.

**TanStack Router** wins on type safety — route params and search params are fully inferred and validated, so a typo in a param name is a compile error rather than an `undefined` at runtime. That is a genuine and rare advantage.

**Next.js App Router** is not really a competitor; choosing it is choosing a framework, a server and a rendering model. If you are already there, use its router.

---

## 16. Common Pitfalls

**A `<div onClick={navigate}>` instead of a `<Link>`.** No middle-click, no ⌘-click, no "copy link", not reachable by keyboard, not announced as a link.

**Calling `navigate()` during render.** It is a side effect, so it produces "Cannot update a component while rendering a different component". Render `<Navigate />` instead, or call it from an effect or an event handler.

**`<NavLink to="/">` without `end`.** Active on every page, because matching is prefix-based by default.

**Treating "session unknown" as logged out.** The three-state auth bug: every user is redirected to login on every refresh.

**Reading `window.location` instead of `useLocation()`.** Works until there is a basename, then silently never matches.

**Filters that push instead of replacing.** Twenty filter changes means twenty Back presses to leave the page.

**Rebuilding the router on every render.** `createBrowserRouter` belongs at module scope; calling it inside a component throws away all router state on every render.

**Forgetting the server rewrite.** Everything works locally and every deep link 404s in production.

---

## 17. Interview Questions and Answers

**Q1: How does client-side routing actually work?**

The router intercepts link clicks, calls `history.pushState` to change the URL without issuing a request, and re-renders the component tree against the new URL. It also listens for `popstate` so the browser's Back and Forward buttons work. Because no document is fetched, the JavaScript context survives — state, sockets, timers — which is the whole performance argument for an SPA. The costs are the ones you then have to reimplement: scroll restoration, focus management, and a server rewrite so a deep link does not 404.

---

**Q2: What is `<Outlet />` and why does nesting matter?**

`<Outlet />` is the placeholder where a parent route renders whichever child route matched. It matters for two reasons. First, the parent stays **mounted** across navigations between its children, so a sidebar, header or open panel keeps its state instead of being rebuilt. Second, in data mode the router knows the whole matched branch before it renders any of it, so nested loaders run **in parallel** — the fetch-in-`useEffect` equivalent cannot, because the child's request is not discovered until the parent has rendered.

---

**Q3: `<Link>` versus `useNavigate` — when is each right?**

`<Link>` renders a real anchor, so the browser gives you middle-click, ⌘-click, "open in new tab", "copy link address", and link semantics for screen readers. That is the default and it should stay the default. `useNavigate` is for navigation that follows something other than a click on a destination — after a successful form submit, after a timeout, after a login. The mistake is a `<div onClick={() => navigate('/x')}>` styled to look like a link: it discards every one of those browser behaviours and is not keyboard reachable.

---

**Q4: How do you decide what goes in the URL versus component state?**

Anything the user would expect to survive a refresh, share as a link, or undo with the Back button. Search text, filters, sort, pagination and the open tab of a tabbed page all qualify; a dropdown that is momentarily open does not. The practical test I use is "would a colleague pasting this link see what I see?". Getting it wrong in the other direction is the common bug — a filtered dashboard that resets to the default view when someone reloads it, or that cannot be linked to at all.

---

**Q5: What do loaders give you that fetching in `useEffect` does not?**

Four things. The data is fetched **before** the route renders, so there is no loading branch in the component. Nested loaders run **in parallel** rather than waterfalling parent-then-child. The `request.signal` is aborted for you when the user navigates away, so a superseded request cancels itself. And a thrown `Response` is caught by the route's `errorElement` rather than crashing the tree. What they do not give you is caching — loaders re-run on every navigation — which is why pairing them with TanStack Query is common rather than contradictory.

---

**Q6: What is `useFetcher` for?**

Calling a loader or action **without navigating**. A "mark as read" button, a like, a footer newsletter form: all of them want the server round trip, the pending state and the revalidation that a form submission gives you, but none of them should change the URL. It also makes optimistic UI nearly free, because `fetcher.formData` is the submission currently in flight — you render from that while it is pending, and the revalidated loader data takes over when it lands.

---

**Q7: How do you implement a protected route?**

One declarative gate component rather than a check in every page, with three states rather than two. "Session not yet known" is distinct from "logged out", and treating them as the same redirects every user to login on every refresh — which is the single most common bug in this exercise. Unauthenticated goes to login carrying the intended destination in `location.state` so login is a detour; authenticated-but-wrong-role goes to a forbidden page, because sending them back to login is a loop they cannot escape. And I would say unprompted that this is UX only: client state is editable, so the API must enforce it.

---

**Q8: Why is matching ranked rather than ordered, and what changed from v5?**

In v5, `<Switch>` rendered the first matching route, so `/products/:id` declared before `/products/new` would swallow it, and `exact` existed to work around prefix matching. v6 scores every route by specificity — static segments beat dynamic ones, dynamic beat splats — and renders the best match regardless of declaration order. It removes a whole class of ordering bugs, and it is why `<Switch>` and `exact` are gone.

---

**Q9: What breaks when you deploy a React Router app to static hosting?**

Deep links. The browser asks the server for `/products/42` and there is no such file, so you get a 404 — even though the app handles that route perfectly once loaded. The fix is a server rewrite that serves `index.html` for unknown paths. GitHub Pages has no rewrite rules at all, so the common workaround is a `404.html` that stashes the path and bounces through `index.html`, at the cost of a redirect on every deep link. Emitting a real HTML file per known route at build time avoids the redirect entirely. `HashRouter` sidesteps the problem because nothing after `#` reaches the server, but the URLs are worse and so is SEO.

---

**Q10: What accessibility work does client-side routing create?**

Two things the browser stops doing for you. **Scroll** is not restored on a `pushState`, so you handle it yourself — keyed on pathname, not the whole location, or a filter change scrolls the user to the top. **Focus** is the one usually missed entirely: after a real navigation focus resets to the document, but after a client-side one it stays on an element that may no longer exist, and nothing is announced. The fix is to move focus to the new page's heading with `tabIndex={-1}`, and to announce the route change in a live region.

---

**Q11: How do you code-split by route, and what goes wrong?**

`React.lazy` plus a dynamic `import()` per route, with a `Suspense` boundary scoped to the region rather than the whole app; in data mode the `lazy` route property splits the loader and action too. The failure that bites in production is `ChunkLoadError`: after a deploy, hashed filenames change and a tab that was open beforehand requests a file that no longer exists. It is routine, not exotic, so the boundary should recognise it and offer a reload — which actually fixes it — rather than showing a generic error.

---

**Q12: How would you test routing?**

`MemoryRouter` with `initialEntries` so the starting URL is explicit and no real history is involved; `createMemoryRouter` plus `RouterProvider` when I need loaders to run. The specific bug worth testing for is a component reading the global `window.location` instead of `useLocation()` — it typechecks, works in development, and silently breaks under a basename, because `window.location.pathname` includes the basename and the route path does not.

---

## 18. Tricky Output Questions

**Q1: A `<NavLink to="/">Home</NavLink>` sits beside links to `/about` and `/products`. The user is on `/products`. Which links have the active class?**

**Output:**
```
Home AND Products — both are "active".
```

**Explanation:**

`NavLink` matching is **prefix-based by default**. `/products` starts with `/`, so the link to `/` is considered active — and since every path starts with `/`, the Home link is active on every page in the app.

This is not a bug in the library; it is what you want for a parent link like `/products` staying highlighted while you are on `/products/42`. It is only wrong for the root, which is a prefix of everything.

The fix is `end`, which requires the match to be exact:

```jsx
<NavLink to="/" end>Home</NavLink>
```

**Takeaway:** `NavLink` is active on prefixes; add `end` for any link whose path is a prefix of its siblings — always the case for `/`.

---

**Q2: Routes are declared in this order: `/products/:id` first, then `/products/new`. The user visits `/products/new`. Which route renders?**

**Output:**
```
/products/new — the specific one, despite being declared second.
```

**Explanation:**

v6 **ranks** routes by specificity rather than taking the first match in declaration order. A static segment scores higher than a dynamic one, which scores higher than a splat, so `/products/new` wins over `/products/:id`.

This is a deliberate break from v5, where `<Switch>` rendered the first match and this exact ordering was a classic bug: `:id` would swallow `new` and your create page would render the detail view with `id === 'new'`.

The practical consequence is that **declaration order is not a tool you have any more**. If you need to influence matching, change the specificity of the paths.

**Takeaway:** v6 matching is by score, not by order — the `/new` before `/:id` ordering rule from v5 is obsolete.

---

**Q3: A component calls `navigate('/login')` directly in its render body when the user is not authenticated. What happens?**

**Output:**
```
Warning: Cannot update a component (Router) while rendering a
different component (Dashboard).
```

**Explanation:**

Navigation is a **side effect**: it updates the router's state. Doing it during render means scheduling an update to one component while React is part-way through rendering another, which React cannot honour there.

The library's answer is `<Navigate to="/login" replace />` — a component that performs the navigation in an effect, after commit. That is the whole reason it exists as a component rather than being a function you call inline.

```jsx
function RequireAuth({ status, children }) {
  const navigate = useNavigate();

  if (status === 'anon') return <Navigate to="/login" replace />;   // ✓ rendered
  // if (status === 'anon') { navigate('/login'); return null; }    // ✗ warns

  return children;
}
```

**Takeaway:** render a redirect, do not perform one during render — the same rule as any other side effect.

---

**Q4: `setSearchParams({ sort: 'price' })` runs on a page whose URL is `/products?category=shoes&page=3`. What is the resulting URL?**

**Output:**
```
/products?sort=price      — category and page are gone.
```

**Explanation:**

`setSearchParams` **replaces the entire query string** with what you hand it. It is not a merge, in the same way `setState` with an object is not a deep merge — the object you pass becomes the whole search.

Build from the previous value instead:

```jsx
setSearchParams(prev => {
  prev.set('sort', 'price');
  return prev;
});
```

The second thing to add here is `{ replace: true }`. Each filter change otherwise pushes a history entry, so a user who adjusts five filters needs five Back presses to leave the page.

**Takeaway:** `setSearchParams` sets, it does not merge — and filter changes should replace rather than push.

---

**Q5: A route is `/products/:id`. `useParams()` is destructured as `const { productId } = useParams()`. What is `productId`?**

**Output:**
```
undefined — and every use of it fails silently or crashes later.
```

**Explanation:**

The keys of `useParams()` come from the **path pattern**, not from anything you declare. The segment is `:id`, so the key is `id`. `productId` is simply not a property of that object, and destructuring a missing property gives `undefined` rather than an error.

The consequence arrives one step later — `fetch('/api/products/undefined')` returns a 404, or a `.toString()` on it throws — so the stack trace points somewhere unrelated to the typo.

This is the class of bug TanStack Router exists to remove: its params are inferred from the route definition, so a mismatched name is a compile error.

**Takeaway:** param names come from the path pattern; a typo is `undefined`, not an error, and it surfaces far from its cause.

---

**Q6: An app is served from `/app/`. `<BrowserRouter basename="/app">` is set. A component checks `window.location.pathname === '/dashboard'` to highlight a nav item. Does the highlight work?**

**Output:**
```
Never — window.location.pathname is "/app/dashboard".
```

**Explanation:**

`basename` is stripped by the router, so `useLocation().pathname` gives you the **route-relative** path, `/dashboard`. The global `window.location` knows nothing about the router and reports the real URL, basename included.

What makes this dangerous is that it typechecks and usually works in development, where the app is often served from the root and the two strings happen to be equal. It only breaks once deployed under a subpath — and it breaks silently, because a highlight that never activates raises no error.

This exact bug shipped in this app when `Sidebar` was extracted from `App.tsx` and the `useLocation()` call was left behind; the bare `location` in the moved JSX resolved to the global.

**Takeaway:** always read location through `useLocation()`; the global `window.location` ignores `basename` and fails only in production.

---

## 19. Quick Reference Card

```jsx
// Setup — declarative
function App() {
  return (
    <BrowserRouter basename="/app">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products/:id" element={<Detail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

```jsx
// Navigation
function Nav() {
  const navigate = useNavigate();
  return (
    <>
      <Link to="/products">Products</Link>          {/* renders a real <a> */}
      <NavLink to="/" end>Home</NavLink>            {/* `end` or always active */}
      <button onClick={() => navigate('/x', { replace: true })}>Go</button>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
}
```

```jsx
// Reading the URL
function Filters() {
  const { id } = useParams();                      // keys come from the PATH
  const [params, setParams] = useSearchParams();

  const sortByPrice = () => setParams(prev => {
    prev.set('sort', 'price');
    return prev;
  }, { replace: true });

  return <button onClick={sortByPrice}>Sort by price ({id})</button>;
}
```

```js
// Data mode
const router = createBrowserRouter([
  { path: '/products/:id', element: null, loader: null, action: null, errorElement: null },
]);
// useLoaderData() · useActionData() · useNavigation() · useFetcher()
```

- Matching is **ranked**, not ordered — `<Switch>` and `exact` are gone.
- `<Outlet />` keeps the parent mounted; that is what enables parallel loaders.
- Render `<Navigate />`; never call `navigate()` during render.
- `setSearchParams` replaces the whole query — build from `prev`.
- Auth has **three** states; "unknown" is not "logged out".
- Scroll and focus are yours to restore. Both.
- Static hosting needs a rewrite, or every deep link 404s.

---

## 20. References

- **React Router docs** — [https://reactrouter.com](https://reactrouter.com)
- **Enabling the v7 future flags** — [https://reactrouter.com/upgrading/future](https://reactrouter.com/upgrading/future)
- **Moving component routes to a data router** — [https://reactrouter.com/upgrading/component-routes](https://reactrouter.com/upgrading/component-routes)
- **Framework mode from `RouterProvider`** — [https://reactrouter.com/upgrading/router-provider](https://reactrouter.com/upgrading/router-provider)
- **History API (MDN)** — [https://developer.mozilla.org/en-US/docs/Web/API/History_API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- **TanStack Router** — [https://tanstack.com/router/latest](https://tanstack.com/router/latest)
