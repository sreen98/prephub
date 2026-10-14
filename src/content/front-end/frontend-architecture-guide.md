# Frontend Architecture at Scale — Complete Guide

Some interview rounds don't ask you to write code. They ask how you would organise the frontend for a whole company: several products, many teams, one login. This guide covers that round, usually called **Platform UI** or **Frontend Architect**. The topics are how to split code into shared packages, one repository or many, micro-frontends, caching, live data, and finding bugs that only some users hit.

One idea runs through all of it: **most of these questions are about teams, not code.** "One repository or many?" is really "how often do teams need to change things together?" "Micro-frontends?" is really "can teams release without waiting for each other?" A strong answer names the team problem first, then picks the technology that solves it.

**How to read this guide:** sections 1–9 explain each topic in full. Section 10 has the interview questions; each answer is the short version you would say out loud, with a link back to the section that explains it. Section 11 has tricky follow-ups, and section 12 is a one-page summary.

---

## Table of Contents

- [1. What "Platform UI" Actually Means](#1-what-platform-ui-actually-means)
- [2. Multi-Product Architecture](#2-multi-product-architecture)
- [3. Monorepo vs Multi-Repo](#3-monorepo-vs-multi-repo)
- [4. Micro-Frontends](#4-micro-frontends)
- [5. Design Systems and Versioning](#5-design-systems-and-versioning)
- [6. The Caching Layers](#6-the-caching-layers)
- [7. Real-Time UI Under Load](#7-real-time-ui-under-load)
- [8. Observability — Debugging the 1%](#8-observability-debugging-the-1)
- [9. Deployment, Versioning and Rollout](#9-deployment-versioning-and-rollout)
- [10. Interview Questions & Answers](#10-interview-questions-answers)
- [11. Tricky Questions](#11-tricky-questions)
- [12. Cheat Sheet](#12-cheat-sheet)
- [13. References](#13-references)

---

## 1. What "Platform UI" Actually Means

A **Platform UI** team (also called Frontend Platform) doesn't build product features. It builds the things product teams build *on*: the shared component library, the build and deploy pipeline, login, the shared code for calling APIs, error reporting, and the lint and TypeScript settings. Its job is to stop five teams solving the same problem five different ways.

That changes what "good" means. A product engineer is judged on shipping a feature. A platform engineer is judged on how easy it is for *other* engineers, often people they have never met, to ship the hundredth feature. In practice that means:

| Concern | The question behind it |
|---|---|
| **Consistency** | Do all the products look and behave like one company's software? |
| **Leverage** | If you fix something once, is it fixed everywhere? |
| **Autonomy** | Can a product team release on Friday without asking the platform team for anything? |
| **Safety** | When something breaks, how much else breaks with it (the **blast radius**), and how fast can you undo it? |
| **Migration cost** | When React releases a new major version, or the design system gets a v2, how does every product move to it? |

Interviewers care most about the last row, and candidates forget it most often.

> [!KEY]
> Any design can be built; the real test is whether it can be **changed** later. If an upgrade needs forty repositories to change on the same day, it will never happen.

---

## 2. Multi-Product Architecture

> *"How would you design a frontend architecture that supports multiple products with shared UI components, reusable business logic, and centralized authentication?"*

**In short:** split the code into four layers, and only let code use the layers below it.

```
┌──────────────────────────────────────────────────────────────┐
│  Products     admin-console   billing-app   customer-portal  │
│               (own routes, own deploy, own team)             │
├──────────────────────────────────────────────────────────────┤
│  Features     @acme/feature-invoices  @acme/feature-users    │
│               (business screens, owned by product teams)     │
├──────────────────────────────────────────────────────────────┤
│  Shared       @acme/ui        @acme/api-client   @acme/auth   │
│               @acme/tokens    @acme/hooks        @acme/i18n   │
├──────────────────────────────────────────────────────────────┤
│  Foundation   @acme/eslint-config  @acme/tsconfig  @acme/vite │
└──────────────────────────────────────────────────────────────┘
```

**`@acme` stands for your own company's name.** npm names a company's internal packages `@company/package`, so read `@acme/ui` as "our shared UI package". `@acme/i18n` is the translations package (i18n is short for "internationalisation": an i, 18 letters, an n).

**The one rule: dependencies point downward only.** Product code may import shared code; shared code must never import product code. For example, `@acme/ui` must never import from `@acme/feature-invoices`. Make a tool enforce this, because people forget under deadline pressure. Options are an ESLint rule (`no-restricted-imports`), Nx's module boundary rules or dependency-cruiser, run in CI (the automatic checks on every pull request).

> [!TRAP]
> Splitting the code without that rule. You end up with a **distributed monolith**: separate packages so tangled together that they can only be released together. You pay the cost of splitting and get none of the benefit.

### 2.1 The Three Kinds of Shared Code

They are different things, and mixing them up is the most common mistake.

- **Shared UI (`@acme/ui`):** buttons, inputs, dialogs. They know nothing about your business: a `Button` knows about sizes and a disabled state, not about invoices. A quick test is whether you could publish it as open source without giving away anything about your company. If not, it belongs in a higher layer.
- **Shared business logic (`@acme/api-client`, `@acme/hooks`):** this layer knows your business but draws no UI. It holds:
  - the functions that call your APIs, with types generated from the API's schema (OpenAPI or GraphQL);
  - retry and login handling;
  - permission checks;
  - formatting rules for your currency and dates.

  This layer saves the most work and is the most often neglected. Five teams each writing their own `useCurrentUser` hook, each caching slightly differently, is a common real-world mess.
- **Shared features:** a whole piece of business UI, such as an invoice table, used by more than one product. They are useful, but easy to extract too early. Two products using something *similar* are not using the *same* thing, and a shared component with eleven true/false props to keep both happy is worse than two copies. **Extract it on the third use, not the second.**

> [!FOLLOWUP]
> Two products need almost the same invoice table. Do you share it now?
>
> Not yet. Two copies that drift apart a little are cheaper than one component with a true/false prop for every difference. When a third product needs it, you can see which parts really are the same in all three, and extract only those.

### 2.2 Centralised Authentication

**In short:** one login system, one session, one shared library. The protocols themselves are explained in the OAuth & SSO guide.

- **One `@acme/auth` package.** Your login provider is the **IdP** (identity provider), such as Okta, Auth0 or Microsoft Entra ID. It ships a client library; wrap it once and give product teams simple tools:
  - `useSession()`;
  - `useHasPermission(perm)`;
  - a `<RequireAuth>` wrapper for protected pages;
  - a `fetch` wrapper that attaches the login token.

  Product teams never use the IdP's library directly, so switching provider later means changing one package.
- **A session cookie on the shared parent domain** (`.acme.com`), so `admin.acme.com` and `billing.acme.com` see the same login without passing tokens around. Mark it `HttpOnly` (JavaScript can't read it), `Secure` (sent over HTTPS only) and `SameSite=Lax` (not sent on most requests started by other sites).
- **No second login when moving between products.** This is single sign-on (**SSO**). When a user goes from admin to billing, billing sends them to the IdP, which sees they are already logged in and sends them straight back, with no login screen. The flow used is the Authorization Code flow with **PKCE** (Proof Key for Code Exchange, said "pixy"), which protects the hand-over with a one-time secret.
- **Permissions decided on the server.** The server sends the user's permissions with the session, as **claims** (fields inside the token). The browser uses them only to *hide* buttons the user can't use. Hiding a button is a convenience, not security: every API checks the permission again itself.
- **One logout that really logs out everywhere.** It ends the IdP session, cancels the long-lived refresh tokens and clears every product's session. A logout that only clears the current app is a common security-audit finding.

> [!FOLLOWUP]
> An admin removes a user's permission while they are logged in. When does the UI find out?
>
> Usually not until the session or token is next refreshed, so for a few minutes the UI can still show a button the user may no longer use. That is acceptable, because every API checks the permission itself: the stale button leads to a `403` error, not a security hole. Handle the `403` politely (refresh the session, hide the button). When access must end at once, such as someone leaving the company, end the session on the server.

### 2.3 Backend for Frontend (BFF)

**Short answer:** a BFF is a small server, owned by the frontend team, that sits between **one kind of client** (the web app, the mobile app, the TV app) and the backend services. It gives that client an API shaped for its screens:
- one request per screen instead of five;
- only the fields the screen shows;
- login tokens kept on the server.

The pattern was named at SoundCloud and made popular by Sam Newman.

#### The problem it solves

Backend services are organised around *data* (users, orders, payments), but screens are organised around *tasks*. Without a BFF, the browser has to bridge that gap itself:

- **Too many requests.** A home screen that needs the profile, recent orders and recommendations makes three or more requests, often one after another. On a phone with a slow network, each one costs hundreds of milliseconds.
- **Too much data.** Each service returns its full object, so the app downloads fields it never shows, including internal ones it should never see.
- **Different clients want different things.** Mobile wants small responses and few calls; the web dashboard wants more detail. One general API serves both badly, and every change to it needs several teams to agree.
- **Tokens in the browser.** An app that calls APIs directly has to keep an access token in JavaScript. One XSS bug (cross-site scripting: an attacker's script running in your page) can steal it.
- **Tied to the backend's layout.** If the app calls ten services directly, splitting or renaming one means releasing a new app, and old versions on people's phones break.

#### What a BFF does

```text
Web app      ──▶  Web BFF     ──┐
Mobile app   ──▶  Mobile BFF  ──┼──▶  user-service, order-service, catalog-service ...
Admin panel  ──▶  Admin BFF   ──┘
```

| Job | What it means |
|---|---|
| **Combining** | calls several services at the same time and returns one response per screen |
| **Trimming** | returns only the fields the screen uses, already formatted (prices as display text, dates in the user's time zone) |
| **Login** | keeps the OAuth tokens on the server and gives the browser an `HttpOnly` session cookie instead, so JavaScript never sees a token (OAuth & SSO guide, Q6) |
| **Translating** | turns internal formats (gRPC, message queues, SOAP) into plain JSON for the app |
| **Coping with failures** | a time limit on each service call, and a partial response when an optional service is down |
| **Caching** | keeps responses that many users share, so the services aren't asked again |

Here is the heart of a BFF endpoint: three services called at once, a time limit on each, only the fields the screen needs, and an empty section instead of a failed page when an optional service is down.

```js
// Three backend "services". Recommendations is down today.
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const services = {
  profile: (id) => delay(40).then(() => ({ id, name: 'Asha', avatar: '/a.png', internalRiskScore: 0.93 })),
  orders: () => delay(60).then(() => [{ id: 'o1', totalCents: 4999, status: 'shipped', warehouseCode: 'BLR-7' }]),
  recommendations: () => delay(30).then(() => { throw new Error('recommendation service down'); }),
};

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timed out')), ms)),
  ]);
}

// GET /bff/home-screen: one request from the app, three calls behind it, in parallel.
async function homeScreen(userId) {
  const [profile, orders, recs] = await Promise.allSettled([
    withTimeout(services.profile(userId), 200),
    withTimeout(services.orders(userId), 200),
    withTimeout(services.recommendations(userId), 200),
  ]);

  // The profile is essential: without it there is no page to show.
  if (profile.status === 'rejected') throw new Error('Cannot build the home screen');

  return {
    user: { name: profile.value.name, avatar: profile.value.avatar },   // internalRiskScore never leaves the server
    recentOrders: orders.status === 'fulfilled'
      ? orders.value.map((o) => ({ id: o.id, total: '$' + (o.totalCents / 100).toFixed(2), status: o.status }))
      : null,
    recommendations: recs.status === 'fulfilled' ? recs.value : null,   // optional: the page still renders
  };
}

homeScreen('u1').then((screen) => console.log(JSON.stringify(screen)));
```

```text
{"user":{"name":"Asha","avatar":"/a.png"},"recentOrders":[{"id":"o1","total":"$49.99","status":"shipped"}],"recommendations":null}
```

The app made one request and got back exactly what it shows. The internal fields (`internalRiskScore`, `warehouseCode`) stayed on the server. The broken recommendation service cost one empty section, not the whole page.

> [!TRAP]
> Using `Promise.all` here. It rejects as soon as one call fails, so one optional service being down fails the whole screen. `Promise.allSettled` waits for every call and reports each one's success or failure.

#### What a BFF must NOT do

- **Make business decisions.** "Is this user allowed a refund?" belongs in a backend service. If it lives in a BFF, the web BFF and the mobile BFF each get their own copy, and the copies drift apart. A BFF combines and trims; it doesn't decide.
- **Serve every client.** One BFF shared by web, mobile and partners is just a general API gateway again, with every team queueing to change it. The guideline is **one BFF per user experience**, owned by the team that builds that experience.
- **Read databases directly.** It calls services. Going around them ties the BFF to another team's storage.

To avoid repeating code across BFFs, share **libraries** (an HTTP client with retries, login middleware), not endpoints.

#### BFF, API gateway or GraphQL?

| Aspect | API gateway | BFF | GraphQL server |
|---|---|---|---|
| **Serves** | every client, the same way | one kind of client | any client that writes queries |
| **Main job** | routing, login checks, rate limits, HTTPS | combining and trimming data for specific screens | letting the client ask for exactly the fields it needs |
| **Owned by** | a platform or backend team | the frontend team for that client | usually a shared API team |
| **Logic inside** | almost none | per-screen combining | resolvers that fetch and combine data |

They are often used **together**: a gateway in front for routing and security, and a BFF behind it for each client. A GraphQL server is a BFF where the client chooses its own response shape, which suits many clients with different needs. The cost is a schema to maintain, and protection against very expensive queries.

**Next.js may already be your BFF.** Server Components, Route Handlers and Server Actions run on a server the frontend team owns. They fetch from backend services and send the browser only what the page needs. Remember that a Server Action is a public HTTP endpoint, so it must check permissions itself (Next.js guide, Q9).

#### What it costs

- **Another service to run:** deploys, monitoring, scaling and someone on call. The frontend team may never have done that before.
- **An extra hop.** In practice total time usually goes *down*: one slow round trip from the phone replaces several, and the BFF's calls to the services happen over the fast network inside the data centre.
- **Failure handling for every call:** each service call needs a time limit, and each part of the response needs a decision. It is either essential (fail the request) or optional (return `null`).
- **It can take the app down.** If the BFF is down, that client is down, however healthy the services behind it are.

**When not to add one:** a single web app whose backend team already shapes the API for it, or a static site with no server at all. This app is an example: GitHub Pages cannot run a server, so there is nothing to put a BFF on.

---

## 3. Monorepo vs Multi-Repo

> *"How would you decide between Monorepo and Multi-repo architecture for a large-scale frontend organization?"*

**In short:** a **monorepo** keeps every project in one Git repository; **multi-repo** gives each project its own. Pick a monorepo when projects share code and often change together, and only if someone will own the tooling it needs.

This is the most common question in these rounds.

> [!TRAP]
> Listing pros and cons and stopping there. Interviewers want to hear *how you'd decide*, and what you would pick.

### 3.1 What Each One Actually Optimises

| Aspect | **Monorepo** | **Multi-repo** |
|---|---|---|
| Changing several projects at once | **One pull request**, checked by one CI run | A pull request per repo, version bumps, and a period where the repos disagree |
| Finding and renaming code | **Search and rename across everything** at once | Hard to see who uses your code |
| Library versions | One version of React for everyone | Each repo drifts to its own versions, and bundles end up with duplicates |
| Team independence | Needs tooling to protect it (see §3.3) | **Comes free:** own repo, own pipeline |
| CI speed | Slow unless CI only rebuilds what a change affects | Small, fast pipelines by default |
| Access control | Hard to hide part of the repo from some people | **Easy:** permissions per repo |
| Onboarding | Clone one repo and everything works | Clone six repos and work out how they fit together |
| Tooling effort | **High at the start** | Low at the start, constant coordination afterwards |

### 3.2 The Decision Framework

Ask these in order. The first one with a clear answer usually decides it.

1. **How often does one change need to touch several projects?** Examples are a design-system tweak plus every product that uses it, or a shared type change. If that happens weekly, a monorepo pays for itself straight away. In multi-repo every such change costs a version bump, N pull requests and a period where things don't match. Twice a year, that cost is fine.
2. **Do the projects share code, or just a company?** Shared UI, types and API code pull strongly toward a monorepo. A React app, a marketing site and an unrelated internal tool that share nothing gain little from living together.
3. **Do they release together or separately?** Products that must release together belong in one repo. Products that release months apart are happier in separate repos.
4. **Do some people need to be kept out of some code?** Payments, healthcare data or a customer-specific copy are easier to protect with per-repo permissions than by partitioning a monorepo.
5. **Will anyone own the tooling?** Without it, a monorepo rebuilds and tests everything on every change. CI then takes 40 minutes for a one-line fix, and people start skipping it. If nobody will own Nx or Turborepo, don't pick a monorepo.

### 3.3 The Position That Holds Up

**Default to a monorepo for one company's related frontend products.** You get one React version, one design system, refactors in a single pull request and one thing to clone. Most large frontend teams have ended up here, and the tooling has grown up around it.

**Split a project into its own repo only for a concrete reason:**
- it releases on a genuinely different schedule;
- some people must be kept out of its code;
- it is an open-source package with outside contributors;
- it uses a technology that fights your tools.

Then name the tooling, because a monorepo only works with it:

| Tool | What it does for you |
|---|---|
| **pnpm workspaces** | Links the repo's packages together, and stops code using a library it never listed as a dependency (a **phantom dependency**, which works by luck until it breaks) |
| **Turborepo or Nx** | Works out which projects a change can affect (the **affected graph**) and builds and tests only those. **Remote caching** reuses a build that another machine already did, so it doesn't run twice |
| **CODEOWNERS** | A GitHub file that says which team must review changes to each folder, so ownership works without separate repos |
| **Module boundary lint** | Enforces the "only import downward" rule from §2 |
| **Changesets** | Each pull request records how it changes a package's version; the tool then writes the version bumps and changelogs |
| **Single version policy** | Every project uses the same React and TypeScript version, so a page never ships two copies of React |

> [!FOLLOWUP]
> Isn't a monorepo just a monolith?
>
> No. A monolith is one big app deployed as one piece. A monorepo can hold twelve apps that each deploy on their own; only the repository and the tools are shared. People who mix these up reject monorepos for the wrong reason.

> [!TRAP]
> A monorepo with no import rules. Everything imports everything, nothing can be pulled out, and CI is slow because every change affects every project. It becomes the distributed monolith from §2.

---

## 4. Micro-Frontends

**In short:** micro-frontends split **one page or one app** into parts that different teams build and release on their own. They solve a team problem, and are only worth their cost when you really have that problem.

Two words you'll need:
- The **shell** (or **host**) is the main app that the user loads.
- A **remote** is a part the shell downloads from another team's deploy while it runs.

### 4.1 What Problem They Actually Solve

Micro-frontends let **separate teams release separate parts of the same page without coordinating**. That is the whole benefit, and it is a team benefit, not a technical one.

The tools matured around 2024–25, and the industry's conclusion was that micro-frontends are **not a default**. Adopt them without the problem they solve and you pay all the cost for no benefit.

> [!FOLLOWUP]
> Our app is getting big. Should we move to micro-frontends?
>
> First ask: **can your teams already release on their own?** If your products are separate apps on separate URLs with separate pipelines, they can, and you don't need micro-frontends. Micro-frontends are for when **several teams must put their work into one page or one shell** and cannot line up their releases.

### 4.2 Integration Approaches

| Approach | How it works | Trade-off |
|---|---|---|
| **npm packages (build time)** | Each team publishes a package, and the shell installs them | Simplest, but **no independent releases**: the shell must rebuild to pick up a change |
| **One app per URL path** | A proxy, or the framework's routing (Next.js calls this "multi-zones"), sends `/billing/*` to one app and `/admin/*` to another | Simple, robust and fully independent, but moving between apps is a full page load |
| **Module Federation (run time)** | The shell downloads the remotes' code while it runs, and they share one copy of `react` | **Truly independent releases** with shared libraries. The usual choice, but versions can drift apart |
| **iframes** | Each part is a separate page inside a frame | Complete isolation, but routing, sizing, focus, accessibility and login are all painful. Right for third-party or old apps you must embed |
| **Web Components** | Each part is a custom HTML element | Works with any framework, but passing data, styling and server rendering are awkward |
| **Server or CDN stitching** | The server, or the CDN (servers near the user that cache your pages), joins HTML fragments together. Known as SSI or ESI | Fast and works without JavaScript, but needs server or CDN support |

The tools:

- **Module Federation** is the usual way to load parts at run time. Version 2.0 is the pick for a new project (**greenfield**).
- **single-spa** is better for adding micro-frontends to an existing old app (**brownfield**).
- **Native Federation** does the same job using **import maps**, a browser feature that maps a name like `"react"` to a URL, so no particular bundler is required. It is common in Angular projects.
- **Rspack** is a faster rewrite of webpack in Rust (its authors measure builds up to about 10× faster). It has been production-ready since its 1.0 release in August 2024.
- **Vite 8** builds with Rolldown, and the official `@module-federation/vite` plugin works with it. That removed the last strong reason micro-frontend teams stayed on webpack.

### 4.3 What Actually Goes Wrong

- **Two copies of React.** If two remotes need different React major versions, the page either loads React twice or crashes. Two copies mean extra download, and context and hooks don't work between them (Tricky Q2 explains why). So you need **everyone on one React version**, checked in CI, which quietly takes away some of the independence you wanted.
- **Two looks on one page.** Remote A built with design tokens v2 and remote B with v1 means one page in two visual styles. Ship tokens as **CSS variables set by the shell**, not inside each remote's JavaScript, so the colours and spacing match even when component versions differ.
- **Duplicate libraries.** Every remote brings its own date library, icons and form library. Spotting this across separately deployed remotes is hard.
- **Sharing state between remotes.** This is the hardest part. What works is a small, versioned **event bus** (remotes send and listen for named messages) or **the URL**. A shared store, or React context across remotes, ties them back together.
- **One remote failing.** A remote that fails to load must not leave the user with a blank page. Every place a remote mounts needs an error boundary plus loading and failed states. Most demos skip this.
- **Debugging.** One error's stack trace can cross three separately built bundles, each with its own source maps. You need tracing and each remote's version in every error report from day one.
- **Nobody owns the whole page.** Performance, accessibility and consistency fall between teams. Someone must own the shell and check them.

### 4.4 The Verdict To Give

**For 5–15 engineers on one product: don't.** Build one well-organised app in a monorepo, use CODEOWNERS for ownership and deploy from one pipeline. You get most of the team benefit with none of the run-time cost.

**Adopt micro-frontends when either of these is true:**
- **Many teams share one shell and can't line up releases.** Realistically that means 40+ engineers across 5+ teams.
- **You are replacing an old app gradually.** This is the **strangler-fig** pattern: new code takes over one route at a time until the old app is unused, instead of one big rewrite. It is the strongest and least-disputed reason, because the split is temporary and pays off immediately.

> [!KEY]
> If your teams can't agree on the basics — which React version, shared design tokens, who owns error handling, how to roll back — micro-frontends won't fix that. You need a monorepo and stricter CI first. Coordination problems don't get easier when you add a network between the teams; they get harder to see.

---

## 5. Design Systems and Versioning

**In short:** a design system (a shared component library plus the rules for using it) is easy to build and hard to change. Most of the design work goes into keeping upgrades cheap for the teams that use it.

A component library is **a product whose users are other engineers**. Most fail not because the buttons look wrong, but for one of three reasons:
- the API is too rigid, so teams copy it and edit their copy;
- it is too loose, so every screen looks different;
- it is too hard to upgrade, so teams stay on an old version forever.

Design against those three from the start.

### 5.1 The Layers

| Layer | What it holds | Example |
|---|---|---|
| **Design tokens** | the raw design decisions: colours, spacing, font sizes, corner radius, shadows, animation timing | `--color-primary`, `--space-4` |
| **Primitives** | behaviour and accessibility with no styling of their own | trapping focus in a dialog, positioning a popover, arrow-key movement in a list |
| **Components** | styled building blocks made from tokens and primitives | `Button`, `Input`, `Select`, `Dialog` |
| **Patterns** | common combinations, documented rather than locked into one component | a form field with label, hint and error; an empty state |

**Ship tokens as CSS variables (custom properties), not as a JavaScript object.** This is the most valuable single decision in a design system:

- **CSS variables cascade.** A value set on a container applies to everything inside it, so dark mode or a per-product brand is just a different value on a container. There is no re-render, no React context and no extra JavaScript.
- **They work across micro-frontends.** Separately deployed remotes share the same tokens even when they use different versions of the component library.

Keep tokens in one source, often exported from Figma and turned into CSS variables by a tool such as Style Dictionary, so design and code can't drift apart.

**Don't write your own primitives unless you must.** Focus handling, keyboard support and positioning are the most expensive and bug-prone code in any library, and the least visible. Build on a **headless** library: one that provides behaviour but no styling, such as Radix, React Aria or Ark UI.

### 5.2 Versioning Strategy

**Inside a monorepo, skip version numbers.** List the library as `workspace:*`, which means "use the copy in this repository". There is nothing to bump or publish, and a change to the library plus all its users goes in one pull request. This is a real monorepo advantage that candidates forget to mention.

**Once other repos or separately deployed apps use the library, you need semver.** Semantic versioning numbers releases `MAJOR.MINOR.PATCH`, and only a MAJOR release may break existing code. The rules that go with it:

- **Use Changesets.** Each pull request states its own version bump and changelog line, so a release is assembled from them rather than argued about.
- **Deprecate before you remove.** Add the new API, mark the old one deprecated, then remove it in a later major. A breaking change with no way forward doesn't get adopted; teams just stay on the old version. §5.5 has the full rollout.
- **Give every component an owner and a status** (experimental, stable or deprecated), so teams know what they can rely on.
- **Allow one version per page.** Two versions of the design system on one page means two visual styles. Force a single version in the package manager's settings.

### 5.3 The API-Design Rules That Prevent Rewrites

- **Compose instead of adding props.** A `<Modal>` with `title`, `subtitle`, `icon`, `showClose`, `footerAlign`, `size` and `variant` props grows a new prop every sprint. **Compound components** give the user cooperating parts instead (`<Modal.Header>`, `<Modal.Body>`, `<Modal.Footer>`), so they can build layouts you didn't plan for.
- **Support controlled *and* uncontrolled use.** *Controlled* means the parent owns the value and passes `value` and `onChange`. *Uncontrolled* means the component keeps its own state and the parent gives only a starting value (`defaultValue`). Accept `value`/`onChange`, and fall back to internal state when they're missing. A form library needs control; a one-off use doesn't want the boilerplate.
- **Behave like the native element.** Pass through `ref`, `className`, `aria-*`, `data-*` and any other props (`...rest`). A `Button` should be able to replace a `<button>` anywhere. A component that swallows these forces teams to copy it.
- **Allow a fixed set of variants only.** `variant: 'primary' | 'secondary' | 'danger'`, `size: 'sm' | 'md' | 'lg'`, and no `color="#ff0000"`. A closed set keeps products consistent, and TypeScript enforces it.
- **Leave an escape hatch.** An **escape hatch** is a deliberate way around your abstraction, such as `className` on the root, or an `asChild`/`as` prop so a `Button` can render as a router link. Without one, teams copy and paste the component.
- **No business logic.** The library knows "a button that is loading", never "the checkout button". Once product logic gets in, only one product can use it.
- **Accessible by default, never by option.** Keyboard support, focus handling and **ARIA** (the HTML attributes that describe a widget to screen readers) belong inside the component. If accessibility is a prop, people will forget it. A design system is the best place in the company to make accessibility automatic, because fixing a dialog once fixes it in every product (see the Accessibility guide).

### 5.4 Theming, Packaging and Quality

**Theming.** Components read tokens (`var(--color-primary)`), and each theme (light, dark, a brand) sets those variables on a root element. Switching theme costs no JavaScript and no re-render. Avoid CSS-in-JS that runs in the browser for a shared library: it slows down every app that uses it, and it doesn't work well with React Server Components.

**Packaging, so apps only pay for what they use:**
- Publish ES modules, with one entry per component (`@acme/ui/button`).
- Mark the package's `sideEffects` correctly in `package.json`, so bundlers can drop components an app doesn't import.
- Make `react` and `react-dom` **peer dependencies**: the app provides them, the library doesn't bring its own. Otherwise an app can end up with two copies of React, and hooks break.
- Set a **size budget per component** in CI, so one heavy dependency can't slip in unnoticed.

**Quality checks:**
- **Storybook**, to build and document each component on its own page, with interaction tests for behaviour (Storybook guide Q12).
- **Visual regression tests:** screenshots compared on every change, using Chromatic or Playwright. These are the real safety net. Unit tests don't notice a 2px padding change across 300 places; a screenshot diff does.
- **axe**, an automatic accessibility checker in CI, plus manual testing with a keyboard and a screen reader for complex components.
- **Unit tests** for any logic.

Testing Strategy Q7 covers testing a library that five teams depend on.

### 5.5 Rolling Out a Breaking Change

When a change would break existing code, **don't make teams switch on one day**. Add the new way first, and remove the old way last, once it is unused.

1. **Ship the new API alongside the old one.** Both work, so no team is blocked, and each can move one component at a time.
2. **Deprecate loudly but harmlessly:** a `console.warn` in development only, a `@deprecated` comment so editors cross the name out, and an ESLint rule so it shows up in code review.
3. **Ship a codemod with the change.** A **codemod** is a script that rewrites code automatically, written with `jscodeshift` or `ts-morph`. One that does 90% of the work is the difference between "adopted in two weeks" and "three products stuck on v1 forever".
4. **Migrate the biggest product yourself.** It tests the codemod, finds the cases you missed and gives other teams an example pull request to copy. It also shows the platform team paying its own migration cost first, which earns trust.
5. **Track progress with a number:** a count of remaining old-API uses per product, from a lint rule or a search in CI. "Please migrate" with no number never finishes.
6. **Lean on visual regression tests** to catch anything that looks different.
7. **Remove the old API in the next major version**, once the count is zero. By then it is a formality.

In a **monorepo**, steps 1–7 can shrink to one pull request: change the library, run the codemod on every product and check everything in one CI run. That is the clearest argument for monorepos in a company with a big design system. In **multi-repo** the steps are the same, but each one is a pull request per repo.

> [!FOLLOWUP]
> One team keeps putting the migration off. What do you do?
>
> Make moving cheaper than staying. Run the codemod for them and open the pull request yourself, help with whatever it can't handle, and keep their remaining count visible next to everyone else's. Only set the removal date once the count is small. A deadline without that help just leaves the team stuck on the old version.

### 5.6 Keeping the Library Alive

**Scaling a library is mostly about people:**

- **A way for others to contribute.** Product teams propose components through a short written proposal (an RFC, "request for comments"), and the library team reviews them. Otherwise the library team becomes a bottleneck, and teams build their own.
- **A rule for what gets in:** something at least two products need, not one team's one-off.
- **Measure adoption:**
  - which version each product is on;
  - how often teams override or copy components;
  - how many home-made copies of "Button" exist in product code.

  A growing number of copies is the earliest sign that the API is wrong.

> [!KEY]
> The hardest part of a design system is upgrades, not components. A library that five teams can't upgrade has failed, however good it looks.

Keep the upgrade path cheap with small releases, codemods and deprecation periods, and by staying close to the teams who use it.

---

## 6. The Caching Layers

> *"How would you design a frontend caching strategy across browser cache, CDN cache, service workers, and API cache?"*

**In short:** there are five caches between the user and your database. Each one keeps copies for a different length of time and is cleared in a different way. For each layer, say what goes in it and **how it is refreshed** (**invalidated**) when the data changes. A cache you can't refresh is a bug waiting to happen.

| Layer | What it holds | How long it lasts | How you make it refresh |
|---|---|---|---|
| **1. Data layer** (TanStack Query, RTK Query, Apollo) | API data in this tab's memory | until the tab closes | after a change, mark the related queries as out of date (`invalidateQueries`) |
| **2. Service worker** (the Cache API) | the app's files for offline use, plus responses saved as you browse | until you delete them | ship a new worker version, which deletes old caches when it takes over |
| **3. Browser HTTP cache** | JavaScript, CSS and images | as long as `Cache-Control: max-age` says | give a changed file a new name (a hash of its content) |
| **4. CDN / edge** (servers near the user) | responses that are the same for every user | as long as `s-maxage` says | purge by tag (below) |
| **5. Server / API** (Redis, database caches) | results that are expensive to work out | a set time (a **TTL**, "time to live") | delete the key when the data changes |

### 6.1 The Rules Per Layer

**Static files: hashed names, cached for a year.** Build tools put a hash of each file's content in its name (`app-3f9a1c.js`) and serve it with `Cache-Control: public, max-age=31536000, immutable`, which means "keep it for a year and never check again". Refreshing is free, because a changed file gets a new name.

> [!TRAP]
> Caching `index.html` like the other files. It must be `no-cache` (meaning "check with the server every time"), because it is the file that lists the hashed names. If it is cached, users stay on the old version, or get a blank page when the old files are deleted (Tricky Q3).

**API responses: `ETag` and `304`.** The server sends an `ETag`, a fingerprint of the response. Next time, the browser sends that fingerprint back in `If-None-Match`. If nothing changed, the server answers `304 Not Modified` with no body, saving the download. This also works for per-user data, which a shared cache can't hold.

**CDN: `s-maxage` and `stale-while-revalidate`.** For example, `Cache-Control: public, s-maxage=60, stale-while-revalidate=600`:
- **`s-maxage=60`** is `max-age` for **shared caches only**. The CDN keeps the copy for 60 seconds, but the browser ignores it, so you cache at the CDN without freezing a copy in every user's browser.
- **`stale-while-revalidate=600`** means that for up to 10 more minutes, the CDN serves the old copy instantly and fetches a fresh one in the background. Nobody waits for the refresh.

This one header does more for how fast a read-heavy page feels than anything else.

To clear CDN copies, **purge by tag** rather than by URL. You attach labels (**surrogate keys**) such as `product-42` to each cached response. "Clear everything about product 42" is then one call, instead of a list of every URL that might mention it.

**Service worker: cache the app shell up front, the rest as it's used.** A service worker is a script the browser runs in the background that can answer the page's requests from its own cache.
- **Precache** (save at install) the **app shell**: the small set of files needed to start the app.
- Serve hashed files **cache-first** (use the saved copy if there is one).
- Serve API data **network-first**, or stale-while-revalidate.
- Keep an offline fallback page.

Two hard rules:
- **Never serve an unhashed URL cache-first**, or users never see its updates.
- **Delete old caches when a new worker takes over** (its `activate` event), or they fill the user's storage.

**Data layer: where most caching happens in a modern single-page app.** Use TanStack Query or RTK Query with a sensible `staleTime` (how long data counts as fresh), and mark data as out of date after every change.

The idea that keeps this sane is that **server state and client state are different things**:
- **Server state** is data that lives on the server and is copied to the browser. It belongs in a query cache with an expiry.
- **Client state** exists only in the browser, such as whether a menu is open. It belongs in component state or a store.

Mixing the two causes most "the screen shows old data" bugs.

### 6.2 The Two Questions That Separate Answers

> [!FOLLOWUP]
> What breaks first in your caching design?
>
> Almost always a cached `index.html`, or a service worker serving an old shell that points to files the deploy deleted. The fixes:
> - `no-cache` on `index.html`;
> - a service worker that updates itself. In `vite-plugin-pwa`, `registerType: 'autoUpdate'` switches to the new version on its own; `'prompt'` shows a "new version available" message instead;
> - **keeping the previous deploy's files for a release or two**, so someone mid-session can still load a page they haven't opened yet.
>
> Without that last one you get hard-to-reproduce `ChunkLoadError` reports (Tricky Q3).

> [!FOLLOWUP]
> How do you cache per-user data at the CDN?
>
> Mostly, you don't. Per-user responses are `Cache-Control: private` (browser only), and the CDN caches only the parts that are the same for everyone.
>
> That is what Partial Pre-rendering (**PPR**) is for. A static shell is cached at the CDN, and the per-user parts are streamed into it on each request (see the Next.js & React Server Components guide). Caching one user's response at the CDN would show it to other users: a data leak.

---

## 7. Real-Time UI Under Load

> *"How would you design a real-time UI receiving thousands of events per second?"*

**In short:** the network connection is not the problem; re-rendering is. Let events arrive as fast as they like, but update the screen only a few times a second.

> [!TRAP]
> Calling `setState` for every message. A WebSocket can deliver 5,000 messages a second without trouble, but the screen only repaints about 60 times a second, so React does far more work than can ever be shown, and the tab freezes.

So the design separates **how fast data arrives** from **how often the screen updates**:

```
socket → tidy each event → collect in a list (no render) → every 100 ms, update state once → render only the visible rows
```

Here is that pattern running. A fake feed sends about 2,000 price updates a second. Each event goes into a **ref** (`useRef`, a value React keeps between renders without re-rendering when it changes). Every 100 ms the collected events go into state in one update, keeping only the latest price per symbol.

```jsx
// A fake feed sending about 2,000 price updates a second, standing in for a WebSocket.
function startFakeFeed(onEvent) {
  const symbols = ['AAPL', 'MSFT', 'GOOG', 'AMZN'];
  const id = setInterval(() => {
    for (let i = 0; i < 20; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      onEvent({ symbol, price: +(100 + Math.random() * 10).toFixed(2) });
    }
  }, 10);
  return () => clearInterval(id);
}

function LivePrices() {
  const buffer = useRef([]);      // events wait here; changing a ref never renders
  const received = useRef(0);
  const [view, setView] = useState({ prices: {}, received: 0, renders: 0 });

  useEffect(() => {
    const stop = startFakeFeed((event) => {
      buffer.current.push(event);   // no setState per event
      received.current++;
    });
    const id = setInterval(() => {
      if (buffer.current.length === 0) return;   // nothing new: don't render
      const batch = buffer.current;
      buffer.current = [];
      setView((v) => {
        const prices = { ...v.prices };
        for (const e of batch) prices[e.symbol] = e.price;   // latest price per symbol wins
        return { prices, received: received.current, renders: v.renders + 1 };
      });
    }, 100);
    return () => { stop(); clearInterval(id); };
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <p>{view.received} events received, {view.renders} renders</p>
      <ul>
        {Object.entries(view.prices).map(([symbol, price]) => (
          <li key={symbol}>{symbol}: {price}</li>
        ))}
      </ul>
    </div>
  );
}
```

Press Try it and watch the two numbers: thousands of events, about ten renders a second.

### 7.1 The Techniques, In Order Of Impact

1. **Collect in a ref, update state on a timer.** Every 100–250 ms, or once per screen repaint with `requestAnimationFrame` (**rAF**: "run this just before the next repaint", at most about 60 times a second). This turns 5,000 events a second into 10–60 renders a second, and on its own usually solves the problem.
2. **Keep only the latest N items.** A list that only grows is a memory leak with a nice UI. Keep the most recent N in a **ring buffer** (a fixed-size list that overwrites its oldest entry when full), and page or archive the rest.
3. **Render only the visible rows (virtualise).** Libraries such as `@tanstack/react-virtual` or `react-window` render the 30 rows on screen instead of all 10,000. Ten thousand rows of DOM (the browser's tree of page elements) are slow however you got there.
4. **Keep only the latest event per item (coalesce by key).** For a price ticker or an "who's online" list, the 400th update for a symbol replaces the 399th. Collapse the batch into a `Map` keyed by item, as the demo does, and thousands of events become a few dozen real changes.
5. **Move heavy data work off the main thread.** Parsing, filtering, sorting and totalling thousands of messages belongs in a **Web Worker** (a background thread), which sends back only what the screen needs. Everything sent to a Worker is copied (the **structured clone**). That is cheap for small messages and expensive for big ones, so for large data use a `SharedArrayBuffer` or a binary format.
6. **Total it up on the server.** This is the real answer at extreme rates. If the chart shows one point per second, the server should send one total per second, not 5,000 events. Most candidates skip this in favour of clever browser code, so say it.
7. **Subscribe only to what you show.** Filter on the server and use topic subscriptions, so each client receives only what it displays.
8. **Handle slow clients and dropped connections:**
   - **Backpressure** means noticing that the receiver can't keep up and slowing down, instead of queueing without limit. Check the socket's `bufferedAmount` (bytes waiting to be sent) before sending more.
   - On reconnect, wait longer after each failed attempt (**exponential back-off**) and add a random extra delay (**jitter**). Otherwise a thousand clients that dropped together all retry on the same tick and knock the server over again.
   - Number each event (a **sequence number**), so after reconnecting you can ask for just the events you missed instead of reloading everything.
   - When the tab is hidden (`visibilitychange`), slow down or unsubscribe. A hidden tab updating a ticker only drains the battery.

   Connection details are in the Real-Time Web guide.

### 7.2 The State-Management Consequence

> [!FOLLOWUP]
> Why not keep the live data in React context?
>
> Context has no way to subscribe to part of a value: every component that reads it re-renders on every update. The same goes for any store that tells every component about every change.
>
> Use a store with **selector-level subscriptions**, where each component subscribes to just the piece of data it reads. Examples are Zustand, Jotai, or `useSyncExternalStore` over your own store. Then a row re-renders only when *its own* data changes.

---

## 8. Observability — Debugging the 1%

> *"How would you debug a production issue where only 1% of users experience a React rendering problem?"*

**In short:** you can't fix what you can't see. A bug that only 1% of users hit is first a question of **observability** (whether the data your app reports lets you see what's happening for real users). Work step by step from "I know nothing" to "I can reproduce it".

1. **Find what the affected users have in common.** "1% of users" is a group, and groups share something. Split your error reports and **RUM** data (real-user monitoring: speed and error data from actual visitors, not a test machine) by:
   - browser and version, operating system and device type;
   - language and time zone, network type and screen size;
   - which feature flags they have, app version and account type;
   - often the winner: the **shape of their data**.

   Truly random 1% bugs are rare. "1% of users" usually turns out to be "everyone on Safari 16 on iOS with a right-to-left language" or "every account with more than 500 line items".
2. **Get readable stack traces.**
   - Upload **source maps** on every deploy. A source map translates minified code back to your original code. Build them as `hidden-source-map`: the map goes to your error tracker (such as Sentry), but the shipped file doesn't link to it, so stack traces are readable to you and your source stays private.
   - Wrap the app in error boundaries that report the **component stack** (which components were rendering). Without it, a React rendering bug is guesswork.
   - Add `onRecoverableError` to catch **hydration mismatches**: the server's HTML and the browser's first render disagree. They are a classic cause of bugs that only some users see.
3. **Record what happened before the crash.** **Breadcrumbs** (the route changes, clicks, network calls and console messages leading up to an error) and **session replay** (a video-like playback of the user's session) for the affected group. For rendering bugs, replay often settles it, because it shows the order of actions you would never have guessed.
4. **Connect the browser error to the server.** Send a **trace ID** (a unique ID per request) from the browser through every API call, so an error links to the exact server responses behind it. Often the "rendering bug" is an API field that was unexpectedly empty, and this proves it.
5. **Measure, don't guess.** Track the three **Core Web Vitals** per group of users:
   - **INP** (Interaction to Next Paint): how long after a click the screen updates;
   - **LCP** (Largest Contentful Paint): when the biggest element appears;
   - **CLS** (Cumulative Layout Shift): how much the page jumps while loading.

   A healthy **p50** (the median user) can hide a broken **p99** (the slowest 1%). A 1% problem lives in that tail, so an average tells you nothing.
6. **Reproduce it on purpose.** Once you know the group, recreate its setup: that browser version (through a service like BrowserStack), that language, that account's data in a test environment. React causes worth checking early:
   - a render function with side effects that StrictMode's double-call exposes;
   - two effects racing each other;
   - duplicate `key`s making React reuse the wrong component's state;
   - a hydration mismatch from reading `Date`, `Math.random` or `localStorage` during render;
   - a **stale closure**: an effect still using a value it captured on an earlier render.
7. **Release the fix behind a feature flag** (a switch that turns code on for chosen users without a deploy). Watch that group's error rate. If the fix makes things worse, turn it off instantly.

> [!KEY]
> All of this has to exist *before* the incident. "I would add monitoring" is a weak answer. "Our error reporting already splits by user group and has source maps, so I'd start by finding what the affected users share" is a strong one.

---

## 9. Deployment, Versioning and Rollout

- **Each product deploys on its own.** Shared packages are versioned, or in a monorepo use `workspace:*` and ship together with each product.
- **CI builds only what changed.** Nx or Turborepo work out which projects a change affects, so a change to `@acme/ui` tests and builds only the apps that use it. Remote caching makes repeating a build almost instant. Without these, monorepo CI becomes unbearably slow.
- **Deploy files in the right order.**
  - Upload the new hashed files first, then switch `index.html` last. Done the other way round, users get an `index.html` pointing to files that don't exist yet.
  - **Keep the previous deploy's files** for a release or two, so people mid-session can still load pages (Tricky Q3).
- **Feature flags separate deploying from releasing.** Code can be deployed switched off, then turned on for chosen users. This makes **trunk-based development** safe: everyone merges small changes straight into the main branch instead of keeping long-lived branches. A flag also undoes a behaviour instantly; a redeploy undoes code.
- **Release to a small group first (a canary).** Watch *that group's* errors and INP, not the overall numbers, which are big enough to hide them.
- **Every error report includes the build version.** Use the Git commit hash (**SHA**) of the build, so "is this fixed yet?" has an answer. With micro-frontends, report the version of every loaded remote.

> [!FOLLOWUP]
> A release is breaking things for users. How do you roll back?
>
> If the change is behind a feature flag, turn the flag off: that is instant and needs no deploy. Otherwise point `index.html` back at the previous build. Its hashed files are still there, because you keep the previous deploy's files. Then use the build SHA in the error reports to confirm users are back on the old version.

---

## 10. Interview Questions & Answers

Each answer below is the short version you would say in the interview. Where a section above has the full explanation, the answer links to it.

---

**Q1: How would you design a frontend architecture that supports multiple products with shared UI components, reusable business logic, and centralized authentication?**

**Short answer:** four layers, and code only imports from the layers below it. The layers are products → features → shared packages → foundation (lint, TypeScript and build settings).

- **Shared code comes in three kinds**, and they aren't interchangeable:
  - **UI** with no business knowledge (`@acme/ui`);
  - **business logic** with no UI (`@acme/api-client`, `@acme/hooks`), the most valuable and most neglected kind;
  - **shared features**, which you extract on the third use, not the second.
- **Authentication** has four parts:
  - one `@acme/auth` package wrapping the login provider (IdP);
  - a session cookie on the parent domain (`.acme.com`) shared by every product;
  - single sign-on, so moving between products never shows a login screen;
  - permissions checked by every API. The browser only uses them to hide buttons.
- **Two things to say without being asked:**
  - make a lint rule in CI enforce the import direction, or it erodes;
  - design for change, because an architecture that needs every repo upgraded on the same day never gets upgraded.

Full explanation: [§2](#2-multi-product-architecture).

---

**Q2: How would you decide between Monorepo and Multi-repo architecture for a large-scale frontend organization?**

**Short answer:** a monorepo by default for one company's related products, if someone will own its tooling; separate repos only for a concrete reason.

I'd decide with five questions, in order:
1. How often does one change need to touch several projects?
2. Do the projects actually share code?
3. Do they release together?
4. Must some people be kept out of some code?
5. Will anyone own the tooling?

A monorepo gives one React version, one design system and refactors in a single pull request. I'd name the tooling that makes it work:
- **pnpm workspaces**;
- **Turborepo or Nx**, which build only what a change affects and share a remote cache;
- **CODEOWNERS** for review ownership;
- an import-boundary lint rule;
- **Changesets** for versions;
- one React and TypeScript version for everyone.

Two points to volunteer:
- **A monorepo isn't a monolith:** it can hold many apps that deploy separately.
- **A monorepo with no import rules goes bad:** everything depends on everything, and CI rebuilds it all.

Full explanation: [§3](#3-monorepo-vs-multi-repo).

---

**Q3: How would you design a frontend caching strategy across browser cache, CDN cache, service workers, and API cache?**

**Short answer:** five layers, and for each I'd say what goes in it and how it gets refreshed:
- **The API cache in the browser:** TanStack Query, refreshed with `invalidateQueries` after a change.
- **The service worker:** caches the app shell, and deletes old caches when a new version activates.
- **The browser HTTP cache:** hashed files cached for a year (`max-age=31536000, immutable`), with `index.html` on `no-cache`.
- **The CDN:** `s-maxage` plus `stale-while-revalidate` for shared responses, cleared by tag.
- **The server cache** (Redis): cleared by key when the data changes.

API responses also get `ETag` → `304`, so unchanged data isn't downloaded again.

The follow-ups to answer before they're asked:
- **"What breaks first?"** A cached `index.html`, or an old service worker pointing to deleted files. Keep the previous deploy's files for a release or two.
- **"Per-user data at the CDN?"** Don't cache it there. Mark it `private`, cache only the shared shell, and stream the per-user parts.

Full explanation: [§6](#6-the-caching-layers).

---

**Q4: How would you design an authentication system supporting SSO, OAuth, JWT rotation, and role-based permissions?**

**Short answer:** one login provider and one shared auth library; OAuth's Authorization Code flow with PKCE; tokens kept out of JavaScript; short-lived tokens that rotate, with reuse detection; and permissions checked by the server.

- **The flow:** Authorization Code + PKCE for every browser and mobile app. Never the implicit flow (tokens in the URL, so in history and logs) or ROPC (your app handles the user's actual password).
- **Tokens:** a **BFF** ([§2.3](#23-backend-for-frontend-bff)) holds the real tokens, and the browser gets only an `HttpOnly; Secure; SameSite=Lax` session cookie. Without a BFF, the access token lives in memory only.
- **Rotation:** access tokens last 5–15 minutes; each refresh returns a new refresh token, and a used one coming back means theft, so cancel the whole chain.
- **SSO and logout:** a silent redirect to the IdP means no second login between products; logout ends the IdP session, cancels refresh tokens and clears every product's session ([§2.2](#22-centralised-authentication)).
- **Permissions (RBAC):** the server works them out and sends them with the session; the browser only hides UI, and every API checks again. Prefer permission strings such as `invoice:write` over role names, so a new role needs no frontend release.

> [!TRAP]
> Keeping tokens in `localStorage`. Any script on the page can read it, so one XSS bug lets an attacker copy the token and use the account from anywhere.

> [!FOLLOWUP]
> What happens when two tabs refresh the token at the same moment?
>
> With rotation, the second refresh sends a token the first one has just cancelled. Reuse detection sees a used token come back and logs the user out. So let only one refresh run at a time: share one promise inside the tab, and coordinate tabs with `navigator.locks` or a `BroadcastChannel`.

Why each choice, with the storage comparison: [Web Security §5](/backend/web-security#5-tokens-sessions-and-cookies) and [OAuth & SSO §11](/backend/oauth-sso#11-refresh-tokens-rotation-and-theft-detection).

---

**Q5: How would you debug a production issue where only 1% of users experience a React rendering problem?**

**Short answer:** treat it as a visibility problem first, then work step by step towards reproducing it:
1. **Find what the affected users share:** browser, device, language, app version, feature flags, the shape of their data. It is rarely random.
2. **Get readable errors:** source maps uploaded on every deploy, error boundaries that report the component stack, and `onRecoverableError` for hydration mismatches.
3. **See the steps before the crash** with breadcrumbs and session replay.
4. **Link the browser error to the server response** with a trace ID. The "rendering bug" is often an unexpected empty API field.
5. **Reproduce it on purpose** with that browser and that data. Check React's usual suspects: impure renders, racing effects, duplicate keys, hydration mismatches and stale closures.
6. **Release the fix behind a feature flag** and watch that group's error rate.

> [!KEY]
> All of this must exist before the incident. "I'd add monitoring" is the weak answer.

Full explanation: [§8](#8-observability-debugging-the-1).

---

**Q6: How would you design a frontend security architecture against XSS, CSRF, token theft, and supply chain attacks?**

**Short answer:** four different threats, each needing its own defence. Treating them as one "security" bucket is the mistake.

- **XSS (cross-site scripting: an attacker's script running in your page):** never insert untrusted HTML (DOMPurify when you must), then a strict nonce + `'strict-dynamic'` CSP and Trusted Types as the second and third layers.
- **CSRF (cross-site request forgery: another site making the user's browser send a request to yours, with their cookies):** `SameSite` cookies plus an anti-CSRF token, an `Origin` check, and no `GET` that changes data.
- **Token theft:** the BFF pattern with `HttpOnly` cookies (Q4), short-lived rotating tokens, and a CSP `connect-src` so an injected script can't send data anywhere.
- **Supply chain (attacks through the packages you install):** `npm ci` from a committed lockfile, `--ignore-scripts`, provenance checks, reviewed dependency updates, and Subresource Integrity on CDN scripts.

> [!FOLLOWUP]
> Isn't a `SameSite` cookie enough on its own?
>
> Not quite. Your own subdomains count as the same site, so a hijacked `blog.acme.com` can still send requests with the cookie. And `Lax` still sends cookies on ordinary link clicks (`GET`). That is why the anti-CSRF token and the `Origin` check stay.

The full layered answer, with the security headers and the organisational half: [Web Security §12, Q7](/backend/web-security#12-interview-questions-answers).

---

**Q7: How would you handle authentication in Next.js App Router with Server Components?**

**Short answer:** check the session in several places, close to the data, and never rely on Next.js's Proxy (formerly middleware) alone, because it has been bypassed by real security bugs.

- **`proxy.ts`:** a quick redirect for users who clearly aren't logged in. A convenience, not a security boundary.
- **A Data Access Layer:** every function that touches sensitive data calls `verifySession()` itself, so a request-pipeline bypass can't skip it.
- **Server Actions and Route Handlers** each check login and permissions, because they are public HTTP endpoints.
- **Never pass the session object as a prop** to a Client Component; those props are sent to the browser.

Full detail, with the CVE history and the code: [Next.js & RSC §9](/frontend/nextjs-rsc#9-authentication-defence-in-depth).

---

**Q8: How would you design a real-time UI receiving thousands of events per second?**

**Short answer:** the network isn't the bottleneck; re-rendering is. Let events arrive at any speed, but update the screen only a few times a second. In order of impact:

1. **Collect events in a ref** and move them into state every 100 ms or once per animation frame, so thousands of events become 10–60 renders a second.
2. **Keep only the latest N items** in a ring buffer.
3. **Render only the visible rows**, with a virtualisation library.
4. **Keep only the latest event per item**, in a `Map` keyed by ID.
5. **Do heavy parsing and sorting in a Web Worker.**
6. **Total things up on the server** when the screen only needs totals. This is the answer that really scales.
7. **Subscribe only to what's shown.**
8. **Handle slow clients and reconnects:** back-off with jitter, sequence numbers to replay missed events, and pausing when the tab is hidden.

Keep fast-changing data out of React context. Use a store where each component subscribes to its own piece (Zustand, Jotai, `useSyncExternalStore`).

Full explanation, with a runnable demo: [§7](#7-real-time-ui-under-load).

---

**Q9: Design a scalable Accordion component in React that handles single and multiple item expansion with customizable UI behavior.**

**Short answer:** design the API first, because for a shared component the API is what's hard to change later. Use compound components, support single and multiple mode, controlled and uncontrolled use, and build in accessibility.

**Compound components** rather than one big config object, so teams can arrange the parts however they need:

```text
<Accordion type="single" collapsible defaultValue="a">
  <Accordion.Item value="a">
    <Accordion.Trigger>Billing</Accordion.Trigger>
    <Accordion.Content>…</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

**The decisions to talk through:**

- **`type="single" | "multiple"`, with matching state.** Single mode holds `string | null`; multiple mode holds `string[]`. Forcing both into one array plus a flag makes every user of the component deal with the awkward shape.
- **Controlled and uncontrolled** ([§5.3](#53-the-api-design-rules-that-prevent-rewrites)): accept `value`/`onValueChange`, and fall back to internal state started from `defaultValue`.
- **Context passes the wiring, not the data.** `Accordion` provides `{ openItems, toggle, type }` through context. Each `Item` provides its own `value` and generated IDs. That is what lets `Trigger` and `Content` sit anywhere inside the item's markup.
- **`collapsible`:** in single mode, can the open item be closed, or must one always stay open?
- **Accessibility built in:**
  - the trigger is a real `<button>` with `aria-expanded` and `aria-controls`;
  - the content has `role="region"` and `aria-labelledby`;
  - `useId` generates the matching IDs;
  - Home, End and the arrow keys move between triggers.
- **Animate without hiding content badly.** To animate height, measure it (`ResizeObserver`) or use the CSS `grid-template-rows: 0fr → 1fr` trick. When closed, the content must be removed or marked `hidden`. `height: 0` alone leaves its links and buttons reachable with Tab, which is a real bug.
- **Escape hatches:** forward refs, pass through other props, accept `className` on every part, and support `asChild`. With `asChild` the part lends its behaviour to the element you pass in instead of rendering its own, so a `Trigger` can sit inside an `<h3>`. The heading level is the app's choice, not the library's.
- **Lazy content:** don't render a heavy panel until it is opened, with a `forceMount` option to opt out.

**At scale:**
- with hundreds of items, store the open items as a `Set` rather than a true/false per item;
- memoise the context value, so opening one item doesn't re-render every trigger;
- virtualise if the list is really long.

The React Machine Coding section of the Code Playground has a working version with single and multiple modes.

---

**Q10: A breaking change to the design system needs to roll out across five products owned by five teams. How?**

**Short answer:** don't make anyone switch on one day. Add the new way first, and remove the old way last.

1. **Ship the new API next to the old one**, so nobody is blocked.
2. **Deprecate it loudly but harmlessly:** a development-only warning, a `@deprecated` comment and a lint rule.
3. **Ship a codemod** that rewrites most uses automatically.
4. **Migrate the biggest product yourself**, to prove the codemod and give the other teams an example.
5. **Track the remaining uses with a number.**
6. **Rely on visual regression tests** to catch anything that looks different.
7. **Remove the old API in the next major version** once the count reaches zero.

In a monorepo this can all be one pull request; in multi-repo it is the same steps, with one pull request per repo.

Full explanation: [§5.5](#55-rolling-out-a-breaking-change).

---

**Q11: Design a highly performant web app that renders large data tables with real-time updates.**

**Short answer:** two problems that make each other worse. A big table is a lot of DOM, and live updates keep changing it. Solve them separately: render only the visible rows, batch the updates, and move sorting, filtering and totals to the server.

**Rendering: the DOM is the cost.** 10,000 rows × 12 columns is 120,000 cells. No amount of `React.memo` makes that cheap, because the browser's style and layout work grows with the number of elements.

- **Virtualise:** render the ~30 visible rows plus a few extra just off-screen (**overscan**), so fast scrolling never shows blank space. `@tanstack/react-virtual` does this. For a very wide table, virtualise columns too.
- **Prefer fixed row heights.** Variable heights need measuring (`estimateSize` plus a `ResizeObserver`) and make the scrollbar jumpy.
- **Use the row's ID as its `key`**, never its position, or scrolling and sorting reuse the wrong row's state.
- **Wrap the row in `React.memo` and pass simple values**, such as `row.name` and `row.status`, not a new object on every render.
- If you can't virtualise, `content-visibility: auto` on rows is the cheap partial fix.

**Live updates.** Use the pipeline from [§7](#7-real-time-ui-under-load): collect updates in a ref, apply them every 100 ms or animation frame, and keep only the latest update per row ID. Thousands of events become a handful of cell changes.

**What is specific to tables**, where candidates usually stop short:

- **Sort and filter on the server for large data.** Sorting 100,000 rows in the browser blocks it for hundreds of milliseconds on every header click. Page with a **cursor** ("the 50 rows after this one") rather than a page number, so results stay correct while rows are being added.
- **Don't move rows under the user.** If a live update re-sorts the table while they are reading or editing, they lose their place. Hold updates for the visible rows and show "3 rows updated — refresh". Raise this as a product decision.
- **Update cells, not rows.** When one field changes, only that cell should re-render. A store with selector-level subscriptions lets each cell subscribe to its own value; React context can't.
- **Compute totals on the server.** Re-adding 100,000 rows in the browser on every update is often the real bottleneck.

**Accessibility, which almost nobody mentions:**
- a virtualised table needs `aria-rowcount` and `aria-rowindex`, so a screen reader announces the real total instead of "row 3 of 30";
- sortable headers need `aria-sort`;
- "table updated" announcements must be throttled, because announcing every update makes the page unusable.

**Close with build versus buy.** For anything beyond a moderate grid, consider:
- **TanStack Table**, which is headless: it handles the sort, filter and grouping logic, and you control the rendering;
- **AG Grid**, a commercial grid with every feature.

A fast, accessible, editable, virtualised grid built from scratch is a months-long project. Q20 covers the table's API.

---

**Q12: Design a system for client-side caching, API retries and error boundaries.**

**Short answer:**
- a query library caches API data and retries safe requests with back-off and jitter;
- changes (POST, PUT) are retried only with an idempotency key;
- an error boundary around each part of the page shows a fallback;
- global error handlers catch everything a boundary can't.

**Caching: use a query library.** TanStack Query or RTK Query give you the hard parts you would otherwise write badly:
- one request when two components ask for the same data;
- `staleTime` (how long data counts as fresh) and `gcTime` (how long unused data is kept);
- refreshing in the background and when the tab regains focus;
- marking data out of date after a change.

```text
useQuery({
  queryKey: ['invoices', orgId, filters],   // the key IS the cache identity
  queryFn: fetchInvoices,
  staleTime: 60_000,        // don't refetch for a minute
  gcTime: 5 * 60_000,       // keep it in cache 5 min after nothing uses it
});
```

Two points matter:
- **Server state isn't app state.** Putting fetched data in Redux means you now own caching, de-duplication and retries yourself.
- **The cache key must include every input that changes the result**, `orgId` included, or one customer sees another's cached data.

The HTTP and CDN caches sit above this ([§6](#6-the-caching-layers)).

**Retries: the details are the answer.**
- **Retry only what can succeed next time:** a `5xx` server error, a timeout or a network failure. Never a `400`, `401`, `404` or `422`: a validation error fails the same way forever, and retrying a `401` can lock an account.
- **Wait longer after each failure, and add randomness.** That is exponential back-off with **jitter**. Without jitter, a thousand clients that failed together retry together, a **thundering herd** that keeps the service down.
- **If the server sends `Retry-After`, obey it:** your back-off is a guess, and that header isn't (Q15).

```js
const queryClientDefaults = {
  retry: (failureCount, error) => error.status >= 500 && failureCount < 3,
  retryDelay: (attempt) => Math.random() * Math.min(30_000, 1000 * 2 ** attempt),
};
```

**Changes are not reads.** A failed `GET` is safe to retry. A failed `POST` may have worked on the server before the response was lost, so retrying could charge someone twice. Retry a change only with an **idempotency key**: a unique ID sent with the request, so the server recognises a repeat and performs it once. Without one, show the failure and let the user decide.

**Error boundaries, and what they miss.** A boundary catches errors thrown while rendering the components below it. It does **not** catch errors in event handlers, in `setTimeout`, in async code, or during server rendering. So you need the global `error` and `unhandledrejection` handlers as well.

**Where to put them** is the real skill:
- **One boundary per independent part of the page, not one at the root.** A root-only boundary turns any error into a blank screen. A boundary around each dashboard widget turns a broken chart into "couldn't load this chart" while the rest works.
- **Pair each boundary with `useQueryErrorResetBoundary`**, so the boundary's retry also resets the failed query. Otherwise retrying just shows the same error.

**How the three fit together:**

```
query library      → de-duplicate, cache, refresh in background, retry
   ↓ throws when retries run out
error boundary     → fallback UI for that part of the page, with a retry button
   ↓ reports
global handlers    → error + unhandledrejection → your error tracker
```

**Finishing touches:**
- show cached data while refetching (stale-while-revalidate) instead of a spinner;
- use optimistic updates (show the change before the server confirms it), with a way to undo them on failure;
- show a clear offline state: `navigator.onLine` plus a failed request means "you're offline, we'll retry", not "something went wrong".

---

**Q13: How do you manage global state efficiently in a React app that multiple teams contribute to?**

**Short answer:** keep as little as possible global. Put the rest in a store where each component subscribes to its own piece, with each part owned by one team and accessed only through what that team exports.

**Why several teams change the answer.** With one team, any consistent choice works. With several, global state becomes a shared space nobody owns. Team A adds some state, team B starts reading it, and now A can't change it without breaking B, but nobody knows B depends on it.

**So first, make less of it global.** Most state people put in a global store isn't global:

| Kind of state | Where it belongs |
|---|---|
| Data from the server (lists, records, details) | **a query cache** such as TanStack Query, not the store |
| Filters, current tab, page, sort order | **the URL**: shareable, works with the back button, survives a reload |
| Form values | the form library, inside the form |
| Open/closed, hover and other UI state | `useState` in the component |
| **Truly global** | the logged-in user, permissions, theme, feature flags, toasts |

That last row is short, and that's the point. **The biggest win isn't a faster store; it's having much less in it.**

**For what is truly global**, use a store with **selector-level subscriptions**, where each component subscribes to the piece it reads: Zustand, Jotai, or `useSyncExternalStore` over your own store. React context is the wrong tool, because every component reading a context re-renders when any part of it changes. Redux Toolkit is fine if the company already uses it, with `createSelector` for derived values.

**The multi-team rules**, which are what's really being asked:

- **Each part of the store has one owning team**, recorded in CODEOWNERS. Other teams read it through **exported selector functions**, not by reaching into its internal shape, so the owner can restructure it without breaking anyone.
- **Keep a team's state inside its feature folder**, not in one central `store/` folder that every team edits. A central folder means constant merge conflicts and no clear owner.
- **Nobody writes to another team's state directly.** Changes go through actions the owner exposes, so you can always tell who changed what.
- **Type everything**, with API types generated from the schema, so a change in shape is a compile error everywhere instead of a surprise at run time.
- **Enforce folder boundaries with lint** (`no-restricted-imports` or Nx module boundaries), so one feature can't import another feature's internals.
- **Document what's in the store and who owns it**, and use the store's DevTools.

**The trade-off to name:** this is process overhead a two-person team should skip. It pays off at scale because global state is where large apps collect coupling nobody intended. The cheapest fix is having less of it, not managing it better.

---

**Q14: How would you design a scalable React application for a dashboard with 100+ pages?**

**Short answer:**
- organise by feature, with imports pointing only downward;
- load each page separately, with routes generated from each feature's list;
- keep server data in a query cache and little in global state;
- watch build time and bundle size in CI.

At this size the problem is less React and more organisation. A hundred pages are a hundred chances for two teams to solve the same thing differently, and a build that gets slower every sprint.

- **Organise by feature, not by file type.** A `components/` folder with 400 components tells you nothing about what belongs together. A feature folder keeps its pages, components, hooks, API calls and tests together, so a feature can be owned, reviewed and deleted as a unit. Use the layers and the downward-only import rule from [§2](#2-multi-product-architecture).
- **Load each page separately.** One page must never download the other 99. Use `React.lazy` per route, with an error boundary above each `Suspense` for the `ChunkLoadError` users get after a deploy (Tricky Q3). Keep libraries in separate files, so a change in one feature doesn't make every user re-download everything.
- **Generate routes from a list, not by hand.** Each feature exports its routes: path, page component, required permission and breadcrumb label. The router assembles them. That gives you one place for login checks and analytics, and one place to catch two teams claiming the same URL.
- **Keep server data in a query cache.** Most dashboard data comes from the server, and TanStack Query handles it. What's left (user, permissions, theme, flags) goes in a store with per-component subscriptions (Q13).
- **Load the shell once.** The navigation, breadcrumbs and permission-aware menu load once, and pages load into them. Prefetch a page when the user hovers its link, to hide most of the delay from splitting.
- **Watch build time and size.** Use a monorepo tool that builds only what changed (Nx, Turborepo), remote caching in CI, and a size budget per route that fails the build. Otherwise the app slows down one page at a time, and nobody owns the problem.
- **Don't reach for micro-frontends** unless teams truly need separate releases. A hundred pages in one well-organised app is normal; a hundred pages across eight separately loaded apps, each with its own React, is much harder ([§4](#4-micro-frontends)).

---

**Q15: How do you handle API rate limits gracefully on the frontend?**

**Short answer:**
- obey `Retry-After` when the server sends it, otherwise back off with jitter;
- retry automatically only requests that are safe to repeat;
- mainly, make fewer requests;
- show the user what's happening instead of failing silently.

**Two cases.**
- **429 with a `Retry-After` header** means the server has told you exactly when to come back, so wait that long.
- **429 without one**, or a 503, means you choose the wait yourself, with exponential back-off and jitter (Q12).

```js
async function withRetry(request, { tries = 4, cap = 30000 } = {}) {
  for (let attempt = 0; attempt < tries; attempt++) {
    const res = await request();
    if (res.status !== 429 && res.status < 500) return res;   // success or a real error

    const header = res.headers.get('Retry-After');
    // Retry-After is seconds OR an HTTP date; both appear in the wild.
    const advised = header && (Number(header) * 1000 || Date.parse(header) - Date.now());
    const backoff = Math.min(cap, 1000 * 2 ** attempt);
    const wait = advised && advised > 0 ? advised : Math.random() * backoff;

    if (attempt === tries - 1) return res;                    // out of attempts
    await new Promise(r => setTimeout(r, wait));
  }
}
```

Here the jitter is "full jitter": wait a random time between zero and the back-off, so clients that hit the limit together don't all come back together.

**Retry only requests that are safe to repeat.** A `GET` is safe. A `POST` that creates an order isn't, unless the server accepts an idempotency key (Q12).

**Then make fewer requests**, which is the real fix:

- **Share in-flight requests.** Two components asking for the same data should share one request; a query library does this.
- **Cache, and refresh in the background.** Showing a cached value while refreshing removes most repeat traffic.
- **Debounce typing** (wait until the user pauses) and cancel the previous request when a new one starts.
- **Batch.** Ten calls for ten IDs should be one call for ten IDs, if the API allows it.
- **Poll less when the tab is hidden**, and stop when the user is idle. A dashboard left open overnight uses a surprising share of a rate limit.

**Show what's happening.** A request that silently retries for thirty seconds looks like a broken app.
- Show that the data is a little old and refreshing.
- If the limit lasts, say so: "We're being rate limited, retrying in 12 s", with a manual retry button.
- Use an error boundary per section, so a spike costs one widget, with its last value still showing, not the whole page.

**The honest framing:** the frontend can't fix a rate limit, only cope with it well. If you hit it routinely, the fix is on the server side: a BFF that combines the calls ([§2.3](#23-backend-for-frontend-bff)) or a server cache.

---

**Q16: How would you design a frontend architecture that can handle 1M+ users daily?**

**Short answer:** a million users a day doesn't load the frontend the way it loads a server, because each browser only renders for one person. It stresses delivery, caching, real-user performance and safe releases, so design for those.

1. **Serve files from a CDN.** Hashed files are cached for a year; only `index.html` is short-lived. At this traffic, every 200 KB you add costs real money as well as speed.
2. **Cache in layers, each with a way to refresh** ([§6](#6-the-caching-layers)). A layer you can't refresh is one you can't push a fix through.
3. **Set a budget for what loads first.** At this scale the slowest users are a real population: a mid-range Android phone on 4G is the number to watch, not your laptop. Use per-route code splitting, a size budget in CI, preloaded fonts and main image, and no third-party script on the first load unless someone owns it and has measured it.
4. **Measure real users, not test runs.** Lighthouse runs in a lab, and it can't measure INP at all. Track Core Web Vitals from real users, split by country, device, connection and app version, because an overall average hides the group that's broken ([§8](#8-observability-debugging-the-1)).
5. **Make bad releases small.** Use gradual rollout behind feature flags, automatic rollback when errors or Web Vitals get worse, and a kill switch for anything risky. At this scale, a bad deploy reaches tens of thousands of people before anyone notices. What matters is limiting the damage, not never making a mistake.
6. **Fail partly, not completely.**
   - An error boundary per part of the page, so one broken widget doesn't blank the page.
   - Skeletons and cached values instead of spinners.
   - An app shell that works offline.

   If the recommendations service is down, you should lose only the recommendations panel.
7. **Move work off the user's device.** Combine requests on the server or in a BFF, so the app makes one request instead of eight. Stream what you can, and move heavy browser work into a Web Worker.

**Scale-specific traps to name:**
- **many caches expiring at the same moment** and all hitting the server together. Stagger the expiry times;
- **assuming every user can hold a WebSocket open;**
- **logging or analytics** that was fine at 1,000 users and becomes its own outage at a million.

---

**Q17: Design a reusable dropdown component that supports search and multi-select.**

**Short answer:**
- a controlled component with a flexible API (`value`/`onChange`, `getOptionLabel`, `renderOption`, optional remote search);
- selection kept in a `Set`;
- filtering worked out during render, not stored;
- the ARIA combobox pattern, with focus kept in the input.

This is really a question about component API design, plus whether you know what the ARIA combobox pattern requires.

**Start with the API, because that's what "reusable" means:**

```text
<Select
  options={options}              // [{ value, label, disabled?, group? }]
  value={selected}               // controlled: string[] when multiple
  onChange={setSelected}
  multiple
  searchable
  getOptionLabel={o => o.label}  // so it works with any shape
  onSearch={handleRemoteSearch}  // omit ⇒ filter locally
  renderOption={o => <Row {...o} />}
  loading={isLoading}
  emptyMessage="No matches"
/>
```

Four decisions do the work:
- **It is controlled** (`value`/`onChange`), so the parent owns the selection and it works with form libraries.
- **`getOptionLabel`** makes it work with any data shape, not one backend's field names.
- **`renderOption`** is an escape hatch, so the next team can add an avatar without copying the component.
- **An optional `onSearch`** lets the same component filter locally or search a server.

**Keep the selection in a `Set`.** Checking and toggling are instant, whatever the size, and "is this option selected?" is easy during render. Convert it to an array in `onChange`, so the parent gets something ordinary.

**Work out the filtered list during render, never store it.** Use `useMemo` over the options and the search text. Storing a filtered copy in state needs an effect to keep it in sync, and for one render the list and the search text disagree.

**The accessibility contract, which interviewers check:**

- The input has `role="combobox"` with `aria-expanded`, `aria-controls` and `aria-haspopup="listbox"`.
- The popup has `role="listbox"`, and each option has `role="option"` with `aria-selected`. For multi-select, add `aria-multiselectable="true"` to the listbox.
- **`aria-activedescendant` keeps real focus in the input**, while a highlighted option moves through the list. Calling `.focus()` on an option is the most common mistake: typing stops working as soon as the user presses Down.
- Keyboard:
  - Down and Up move (Down also reopens a closed list);
  - Enter selects or unselects;
  - Home and End jump to the ends;
  - Escape closes, and a second Escape clears;
  - Backspace in an empty input removes the last chip.
- Generate IDs with `useId`, so two dropdowns on one page don't clash.
- Select on `onMouseDown`, not `onClick`. A click fires after the input loses focus, by which time the list may have closed.

**Three problems only multi-select has:**
- **Many selections must fit in the box:** show chips with "+3 more".
- **Removing a chip must not open the list.**
- **The list stays open after each pick**, the opposite of single-select.

**At scale:**
- virtualise the list past a few hundred options;
- debounce and cancel remote searches;
- keep selected options known even when the current search hides them, or selections seem to vanish while the user types.

**To finish:** in production I'd build this on a headless library such as Radix, React Aria or Downshift, because the ARIA and focus behaviour is where the bugs are, and it's already solved. Building it by hand is good practice; shipping a hand-built one usually isn't.

---

**Q18: How would you design a reusable design-system component library, and how do you keep it maintainable and scalable?**

**Short answer:** treat it as a product for other engineers, and design it so upgrades stay cheap. The structure:
- **Layers:** design tokens as CSS variables → behaviour primitives (from a headless library) → styled components → documented patterns.
- **API:** composition instead of ever more props, controlled and uncontrolled use, a fixed set of variants, escape hatches and no business logic.
- **Accessibility built into every component.**
- **Theming** by switching CSS variables.
- **Packaging** so apps pay only for what they import, with React as a peer dependency.

How it stays healthy:
- **Releases:** semantic versioning with Changesets.
- **Breaking changes:** deprecate first, then ship a codemod with the change.
- **Checks:** Storybook, visual regression tests and axe.
- **People:** a contribution process, and adoption measured by how many teams copy components instead of using them.

The point to volunteer: the hard part isn't building components, it's upgrades. A library five teams can't upgrade has failed, however good it looks.

Full explanation: [§5](#5-design-systems-and-versioning).

---

**Q19: What is a Backend for Frontend (BFF), and when would you add one?**

**Short answer:** a BFF is a small server, owned by the frontend team, between one kind of client and the backend services. It gives that client an API shaped for its screens:
- one request per screen, made of several service calls in parallel;
- only the fields shown;
- OAuth tokens kept on the server, with an `HttpOnly` cookie in the browser;
- a time limit on each call, so a broken optional service empties one section, not the page.

**Add one when** screens make many calls, download fields they don't use, or hold tokens in the browser, or when web and mobile need different things from the same services.

**The two rules interviewers probe:**
- **One BFF per user experience** (web, mobile, admin), owned by the team that builds it. One shared by every client is just an API gateway again.
- **No business rules in it.** It combines and trims data; decisions stay in the backend services, or each BFF gets its own drifting copy.

**The costs:** another service to deploy, monitor and be on call for, and if it's down, that client is down. The extra hop usually *lowers* total time, because one round trip from the phone replaces several.

**Skip it** for a single web app whose API already fits, or a static site with no server. On Next.js, Server Components and Route Handlers often already are the BFF.

Full explanation, with a runnable example: [§2.3](#23-backend-for-frontend-bff).

---

**Q20: Design a reusable Data Table component that supports sorting, filtering and pagination.**

**Short answer:**
- a headless hook owns the state and the filter → sort → page pipeline, and a thin, accessible component renders its output;
- columns are defined as data;
- state can be controlled;
- the same API works with data in the browser or on a server.

**Separate behaviour from markup.** Every team wants different cells, toolbars and styling, but almost none want a different sort algorithm. A hook that does the logic, plus a component that draws whatever the hook returns, is the whole design. It is how TanStack Table and most design-system tables are built. (The playground's `Data Table (sort + filter + paginate)` challenge is a working version.)

**1. The API is column definitions plus state, not a pile of true/false props.**

```ts
type Column<Row> = {
  id: string;
  header: string;
  accessor: (row: Row) => string | number | Date;   // what sorting and filtering read
  cell?: (row: Row) => React.ReactNode;             // how it looks (defaults to the accessor)
  sortable?: boolean;
  filter?: 'text' | 'select' | ((row: Row, value: string) => boolean);
};

type TableState = {
  sort: { columnId: string; direction: 'asc' | 'desc' } | null;
  filters: Record<string, string>;
  page: number;
  pageSize: number;
};
```

The types are generic over `Row`, so `accessor` and `cell` are checked against your real data. A new feature later is a new optional field on `Column`, not a breaking change.

**2. The pipeline always runs filter → sort → page.**
- Filtering first means less to sort.
- Paging last means page 2 is page 2 of the *filtered, sorted* rows.
- Each step is a pure function (same input, same output, no side effects), memoised on its inputs, so typing in a filter doesn't re-sort rows that didn't change.
- **Go back to page 1 whenever the filters or sort change.** Otherwise a user on page 7 filters down to three rows and sees an empty page.

**3. State can be controlled or uncontrolled.** By default the hook keeps its own state. Pass `state` and `onStateChange` and the parent owns it instead. That is what lets a team put the sort and filters in the URL (shareable, survives a reload) or save them per user.

**4. The same API works on the server.** With `mode: 'server'`:
- the hook stops sorting and slicing itself;
- the table state becomes the request (`?sort=name&dir=asc&status=open&page=2`);
- the component receives one page of rows plus a total count.

Plan for this from the start, because a table that assumes every row is in memory has to be rewritten the day there are 200,000. While a page loads:
- debounce text filters;
- cancel the previous request with an `AbortController`;
- keep showing the old rows, dimmed.

**5. Accessibility is part of the contract:**
- a real `<table>` with `<th scope="col">` headers;
- each sortable header contains a `<button>`, and its `<th>` has `aria-sort="ascending"`, `"descending"` or `"none"`;
- labelled pagination ("Page 3 of 12");
- an `aria-live="polite"` region that announces "Showing 24 of 310 results" after filtering.

**6. Scale is an option, not a rewrite.** Past a few thousand rows, render only the visible ones. The hook/component split makes that possible: the renderer changes, the hook doesn't.

**What to volunteer:**
- **Use the row's ID as its key**, never its position, or selection and focus jump when the sort changes.
- **Sort by type:** `Intl.Collator` for text (it handles accents and language rules), numeric comparison for numbers, timestamps for dates, and empty values always last.
- **The tests go on the hook.** The pipeline is pure functions, so sorting, filtering and paging are tested without rendering anything.

---

**Q21: How would you design a frontend architecture that supports both web and mobile apps with maximum code reuse?**

**Short answer:** share everything below the UI, and share UI only where the platforms truly agree. "Maximum reuse" sounds like one codebase rendering everywhere. But the code that is cheapest to share and most important to keep identical is the logic: data access, validation, business rules and state. Screens are where web and mobile users expect different things.

**The shape: one monorepo, two apps, shared packages underneath.**

```text
apps/
  web/          Next.js or Vite: routes, layouts, web-only UI
  mobile/       React Native with Expo: navigation, native modules, mobile UI
packages/
  api-client/   typed API calls and data types, generated from the OpenAPI schema
  domain/       business rules and formatting: pure TypeScript, no React
  validation/   Zod schemas shared by forms on both platforms (and the server)
  state/        TanStack Query hooks and client stores (Zustand), platform-free
  tokens/       design tokens (colours, spacing, type) exported for both
  ui/           the few components that really are the same on both (optional)
```

**From most to least shareable:**

1. **Types, API client, validation and business rules: 100% shared.** They are plain TypeScript with no web or mobile imports. A lint rule enforces that: it fails if `packages/domain` imports `react-dom` or `react-native`.
2. **Data and state hooks:** `useOrders()` and `useCart()`, built on TanStack Query, work unchanged on both, because they return data, not markup.
3. **Design tokens:** one source, turned into CSS variables for web and a theme object for React Native, so a brand change lands on both.
4. **UI components: the honest part.** React Native renders `<View>` and `<Text>`, not `<div>`. A component can be shared only through **React Native Web** (running React Native components in the browser) or a cross-platform kit such as Tamagui. That works well for basic pieces (buttons, inputs, cards). It works badly for whole screens, because navigation, layout density, hover, keyboard shortcuts and SEO all differ.
5. **Platform-specific files where they must differ.** `storage.web.ts` and `storage.native.ts` export the same functions (localStorage on web, SecureStore on mobile). The bundler picks the right file, and shared code just imports `storage`.

**What to volunteer:**

- **Monorepo tooling** (Turborepo or Nx), so a change to `packages/domain` rebuilds and tests both apps, and a web-only change doesn't build mobile.
- **React versions must match.** React Native pins a React version, so the web app may have to wait for mobile before upgrading React, because both use the shared hooks. This is the most common hidden cost.
- **Releases differ.** Web deploys in minutes; mobile goes through app-store review, and old app versions stay in use for months. The shared API client must stay compatible with the server for as long as those old versions are around.
- **What not to share:** navigation, animations, gestures, and anything using native features (camera, push notifications, biometrics).

The answer that lands: **share nearly all the logic and a smaller part of the UI, and explain why the UI share is lower.** Forcing one UI onto both platforms usually serves neither well.

---

## 11. Tricky Questions

---

**Q1: What will this print, and why?**

```js
function createCounter() {
  let obj = {
    value: 0
  };
  return {
    increment() {
      obj.value++;
    },
    getValue() {
      return obj.value;
    }
  };
}

const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.getValue());
```

**Output:** `2`

**Explanation:**

The answer is easy; the question is whether you can explain *why*. That needs one idea: a **closure**, meaning a function remembers the variables of the place where it was created.

- `createCounter` runs once and creates one variable, `obj`.
- `increment` and `getValue` are both created inside that call, so both remember the **same** `obj`, not a copy each.
- `increment` changes `obj.value` and `getValue` reads it. Two increments, so `2`.

A closure keeps the variable itself, not a snapshot of its value. `getValue` reads `obj` fresh every time it is called, which is why it sees the changes. It would work the same with a plain `let value = 0` and `value++`.

**Each call to `createCounter` creates a new, separate `obj`**, so two counters don't affect each other. And `obj` can't be reached from outside, which makes it private:

```js
function createCounter() {
  let obj = { value: 0 };
  return {
    increment() { obj.value++; },
    getValue() { return obj.value; },
  };
}

const a = createCounter();
const b = createCounter();
a.increment();
a.increment();
console.log(a.getValue(), b.getValue());   // 2 0
console.log(a.obj);                        // undefined: obj is private
```

**The follow-up interviewers ask: what if you return `obj` too?** Then the privacy is gone. Outside code holds the same object, and can change the count without calling `increment`:

```js
function broken() {
  let obj = { value: 0 };
  return { increment: () => obj.value++, getValue: () => obj.value, obj };
  //                                                              ^^^ leaked
}
const c = broken();
c.obj.value = 100;      // outside code changes the private state directly
c.increment();
console.log(c.getValue());   // 101
```

**Takeaway:** functions created in the same call share the same variables, and read their current values each time. That makes this the standard way to keep state private in JavaScript, until you hand out a reference to that state.

---

**Q2: Two Module Federation remotes both declare `react` as shared and both load successfully. But a React context provided by the shell is `undefined` inside one remote. Why?**

**Answer:** two copies of React are running. Listing `react` as `shared` only gives everyone one copy when one version can satisfy every remote's version range. Otherwise the remote quietly loads its own copy, and each copy of React has its own separate set of contexts.

**Explanation:**

React doesn't find a context by name. `createContext()` returns an object, and a `Provider` and `useContext` only connect if they use **the same context object inside the same copy of React**. The current value is stored in React's internal component tree (the **fiber tree**), and each copy of React has its own tree.

So when the shell renders `<ThemeContext.Provider>` with React copy A, and a remote calls `useContext(ThemeContext)` under React copy B, copy B searches *its own* tree. It finds no provider, and returns the context's **default value**, usually `undefined`. There's no error, because from copy B's point of view nothing is wrong.

Why it happens even with `shared: ['react']`:

```js
// Shell               remote-a                  remote-b
// react ^18.2.0       react ^18.2.0             react ^19.0.0   ← incompatible
// → shell + remote-a share one instance; remote-b loads its own copy
```

Module Federation **agrees on versions while the app runs**; it doesn't force them. If the version ranges don't overlap, it gives the remote the version it asked for, and you get two copies of React. Two other common causes:
- forgetting `singleton: true`, so even compatible versions can load twice;
- a remote that doesn't list React as shared in *its own* config (only the shell's), so it bundles its own copy.

```js
const moduleFederationConfig = {
  shared: {
    react:       { singleton: true, requiredVersion: '^19.0.0', strictVersion: true },
    'react-dom': { singleton: true, requiredVersion: '^19.0.0', strictVersion: true },
  }
};
```

`singleton: true` means "there must be exactly one copy". `strictVersion: true` turns a version mismatch into a **loud error when the remote loads**, instead of a silent second copy. A load error is far cheaper to find than an `undefined` context in production.

The same duplication causes symptoms that look unrelated until you know the cause:
- "Invalid hook call" errors;
- Suspense boundaries that don't work together;
- `instanceof` checks failing between the shell and a remote;
- about twice the React code downloaded.

The lesson for the design discussion: **with micro-frontends, everyone must use the same React version.** Teams can still deploy separately, but they can't choose their own React major. Say that out loud, because it's the hidden cost.

**Takeaway:** `shared` is a version negotiation at run time, not a guarantee. Set `singleton: true` and `strictVersion: true`, so a version mismatch fails loudly instead of creating two copies of React that break context, hooks and Suspense.

---

**Q3: After every deploy, a small number of users get `ChunkLoadError` — but only users who were already on the site, and only when they navigate to a lazily-loaded route. What's happening?**

**Answer:** their already-loaded app still refers to the *old* build's file names, and the deploy deleted those files. The code is fine; the way you deploy is the problem.

**Explanation:**

A user who opened the app before the deploy is still running the old version, which knows the old hashed file names, such as `Settings-a1b2c3.js`. An hour later they click through to `/settings`, and the browser asks for exactly that file. The deploy replaced the folder, so the file is gone. The request returns 404, and `React.lazy`'s dynamic `import()` fails with `ChunkLoadError`.

Only people who were already on the site are affected, which is why it looks rare and impossible to reproduce. Anyone who loads the page after the deploy gets the new version and the new names. For the people it hits, it fails every time.

Three fixes, and you want all three:

**1. Keep old files.** Deploys should only *add* files: upload the new hashed files and keep the previous one or two builds, instead of syncing with delete. Storage is cheap, and this removes the failure at its root. (`aws s3 sync --delete` is the classic way to cause it.)

**2. Upload `index.html` last, and never cache it.** Upload the files first, then the new `index.html`. In the other order, new visitors get HTML pointing to files that haven't arrived yet: the same failure for more people. `index.html` must be `no-cache`, or a cached copy keeps pointing at whatever it pointed to when it was saved.

**3. Recover when it happens anyway**, because you can't keep old files forever:

```js
const Settings = lazy(() =>
  import('./Settings').catch((err) => {
    // A failed chunk load after a deploy is not recoverable in-page —
    // the running app's module graph is stale. Reload once.
    if (!sessionStorage.getItem('chunk-reload')) {
      sessionStorage.setItem('chunk-reload', '1');
      window.location.reload();
    }
    throw err;
  })
);
```

The `sessionStorage` check matters. Without it, a file that is really missing (a broken deploy, or a user who is offline) causes an endless reload loop, which is much worse than the original bug.

Better still, notice new versions before anything breaks. Check a `version.json` file, or a build-version header, from time to time. When it changes, show "A new version is available — reload", so the user refreshes when they choose instead of hitting an error. For a service worker, `vite-plugin-pwa` does this: `registerType: 'prompt'` shows that message, and `'autoUpdate'` switches to the new version on its own.

The same problem appears with a **service worker** serving an old cached app shell that points to deleted files. The fix is the same: version the worker, delete old caches when the new one activates, and don't swap versions under a user mid-task.

**Takeaway:** hashed file names make caching safe but deleting files dangerous. Keep the previous builds' files, upload files before `index.html`, never cache `index.html`, and reload once (with a guard) when a file is missing anyway.

---

**Q4: Your monorepo's CI takes 35 minutes on every PR, including a one-line change to a single product's README. Nx/Turborepo are configured and the affected graph is working. What's wrong?**

**Answer:** almost certainly some file at the root of the repo counts as an input to every project, so the tool correctly decides that every change affects everything. The tool isn't broken; it's reporting a dependency you didn't mean to create.

**Explanation:**

Nx and Turborepo work out "what changed, and what depends on it?" That works well until something at the root is a hidden dependency of every project. Then every change touches every project, the tool rebuilds all of them, and the caching looks broken when it is actually doing what it was told.

The usual causes, most common first:

- **The lockfile.** Any dependency change affects every project. That's *correct*, but it makes "did we add a dependency?" an expensive question.
- **Root config files** (`tsconfig.json`, `eslint.config.mjs`, `.env`) listed as global inputs: `globalDependencies` in Turborepo, `implicitDependencies` or `namedInputs` in Nx. A formatting tweak to the root ESLint config then rebuilds everything.
- **Inputs that are too broad.** If a task's inputs default to the whole project folder, then `README.md`, docs and test snapshots all invalidate the build. Builds should list their inputs precisely and exclude files that can't change the output.
- **A barrel file in a shared package.** A barrel is an `index.ts` that re-exports everything. If `@acme/ui/index.ts` re-exports every component, any change in `@acme/ui` changes the file every app imports, so every app is affected. This one is subtle: the tool can only be as precise as your imports.
- **A grab-bag package everyone imports**, such as `@acme/utils` or `@acme/types`. Every project depends on it, so a change to it affects everything.

The fixes:

```jsonc
// turbo.json — declare inputs precisely
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "package.json", "tsconfig.json", "!**/*.test.*", "!**/*.md"],
      "outputs": ["dist/**"]
    }
  },
  "globalDependencies": ["pnpm-lock.yaml"]   // keep this list as short as honestly possible
}
```

Also:
- **turn on remote caching**, so a build another CI run already did is downloaded instead of repeated;
- **split grab-bag packages**, so projects depend only on what they use;
- **avoid root barrel files**, or publish each component on its own import path;
- **check why projects count as affected:** `turbo build --dry-run` and Nx's project graph show exactly which projects are affected and why, so this becomes a five-minute investigation instead of guesswork.

The bigger point: **this is the problem that makes teams give up on monorepos**, yet it's a configuration problem, not a fundamental one. It's also why "will anyone own the tooling?" belongs in the monorepo decision ([§3.2](#32-the-decision-framework)).

**Takeaway:** when CI rebuilds everything for a tiny change, look for a root-level input (the lockfile, a root config, inputs that are too broad) or a barrel or grab-bag package everyone imports. The tool is usually right about a dependency you didn't intend.

---

**Q5: You buffer WebSocket events in a ref, flush every 100 ms, and virtualise the list. The tab still janks badly at 3,000 events/sec. What did you miss?**

**Answer:** you reduced *how often* React renders, but not *how much work* each flush does. Each flush still processes 300 events on the main thread, and probably builds a new array of new objects, so every visible row re-renders.

**Explanation:**

Buffering reduces the number of renders. It does nothing about three other costs, and any one of them can still make the page stutter (**jank**):

**1. Data work on the main thread.** Parsing 300 JSON messages, then filtering, sorting and totalling them, all happens in the flush on the main thread, which also has to paint the screen. A frame has about 16 ms, and you're spending it on data. **Fix:** do the parsing, filtering, sorting and totalling in a **Web Worker** and send back only what the screen needs. `JSON.parse` on a big batch is often the single biggest cost.

**2. Every visible row re-renders.** Virtualisation limits how many rows *exist*. But if each flush builds a brand-new array of brand-new objects, every visible row gets new props and re-renders: 30 rows, 10 times a second. **Fix:** keep the latest event per item in a stable `Map` (coalesce by key), so items that didn't change keep the same object. Wrap rows in `React.memo` and pass simple values, not new objects. Then only rows whose data changed re-render.

**3. Layout work and growing memory.** If rows have different heights, each flush makes the browser measure them, which forces it to recalculate layout immediately. Reading and writing layout in turn makes it redo the work repeatedly (**layout thrashing**). And if you keep appending instead of capping the list, memory grows until garbage-collection pauses become visible. **Fix:** fixed or estimated row heights, `content-visibility: auto`, and a ring buffer that caps the list.

The order to work in, since this is really a diagnosis question:

```
1. Profile first, with the React DevTools Profiler and the Performance panel.
   Is the time in your JavaScript (data work), in React re-rendering,
   or in layout and paint? Each has a different fix, and you can't guess.
2. Worker for the data work            → takes it off the main thread
3. Latest-per-key Map + memo rows       → stops needless re-renders
4. Cap the list, fix row heights        → stops layout work and memory growth
5. Total things up on the server        → removes the problem
```

End on step 5. If the screen shows a chart with one point per second, or a table of the top 50 items, sending 3,000 events a second to the browser is the real bug. The server should send one total per second, or only what changed. **Every browser-side trick above works around a decision made on the server**, and saying so is what makes this an architect's answer.

**Takeaway:** buffering fixes how *often* you render, not how expensive each update is. Profile to find whether the time goes to data work, re-rendering or layout; move data work to a Worker; keep unchanged items as the same objects; and remember that totalling on the server removes the problem instead of working around it.

---

## 12. Cheat Sheet

```
THE BIG IDEAS
 1. Most architecture questions are about teams. Name the team problem first,
    then pick the technology that solves it.
 2. Platform teams make the 100th feature cheap for engineers they've never met.
 3. Ask whether a design can be CHANGED, not just built. If an upgrade needs
    40 repos to change on one day, it never happens.

LAYERS (§2)
 4. products → features → shared → foundation. Imports point DOWN only,
    enforced by a lint rule in CI.
 5. Three kinds of shared code: UI (no business knowledge), business logic
    (no UI), features (extract on the 3rd use, not the 2nd).
 6. Auth: one @acme/auth package, parent-domain cookie, SSO, permissions
    checked by every API (the browser only hides buttons), real logout.
 7. BFF: one small server per client type. Combines and trims data, keeps
    tokens on the server. No business rules in it.

MONOREPO vs MULTI-REPO (§3)
 8. Decide with: how often changes span projects → shared code? → release
    together? → access limits? → will anyone own the tooling?
 9. Default: monorepo for related products. Split only for a concrete reason.
10. Monorepo ≠ monolith. Tooling isn't optional: pnpm workspaces, Turborepo/Nx
    with remote cache, CODEOWNERS, boundary lint, Changesets, one React version.

MICRO-FRONTENDS (§4)
11. They buy ONE thing: teams releasing parts of one page independently.
12. Teams already release separately? You don't need them. 5–15 engineers? Don't.
13. Best reason: replacing an old app one route at a time (strangler fig).
14. Module Federation: singleton + strictVersion, or you get two Reacts.
15. Tokens as CSS variables from the shell. Error boundary at every mount.
    Share state through the URL or an event bus, never context.

DESIGN SYSTEMS (§5)
16. tokens (CSS variables) → primitives (headless library) → components → patterns.
17. Compose, don't add props. Controlled + uncontrolled. Fixed variants.
    Escape hatches. No business logic. Accessible by default.
18. Breaking change: add new → deprecate → codemod → migrate the biggest
    product yourself → count remaining uses → remove in next major.
19. Visual regression tests are the real safety net.

CACHING (§6) — say how each layer REFRESHES
20. data layer → service worker → browser HTTP → CDN → server.
21. Hashed files: max-age=31536000, immutable. index.html: no-cache.
22. API: ETag → 304. CDN: s-maxage + stale-while-revalidate, purge by tag.
23. Per-user data is private, never cached at the CDN.
24. Keep the previous deploy's files → no ChunkLoadError.

REAL-TIME (§7)
25. The network isn't the bottleneck; re-rendering is.
26. Collect in a ref → update state every 100 ms → cap the list → virtualise
    → latest per key → Worker for data work.
27. Per-component store subscriptions, never context, for fast data.
28. Totalling on the server REMOVES the problem; the rest works around it.

OBSERVABILITY (§8)
29. A 1% bug is a visibility problem first. Find what affected users share.
30. Source maps, component stacks, session replay, trace IDs, Web Vitals
    per user group. All in place BEFORE the incident.
31. Ship the fix behind a feature flag and watch that group.

DEPLOY (§9)
32. CI builds only what changed. Upload files first, index.html last.
33. Feature flags separate deploy from release. Canary to a small group.
34. Every error report carries the build version.
```

---

## 13. References

- [Monorepo Tools](https://monorepo.tools) — comparison of Nx, Turborepo, Bazel, Lerna and friends
- [Turborepo Docs](https://turborepo.com/docs) — task graph, inputs/outputs, remote caching
- [Nx Docs — Module Boundaries](https://nx.dev/features/enforce-module-boundaries) — enforcing the dependency direction
- [Changesets](https://github.com/changesets/changesets) — versioning and changelogs for workspace packages
- [micro-frontends.org](https://micro-frontends.org) — Michael Geers' original catalogue of integration approaches
- [Martin Fowler — Micro Frontends](https://martinfowler.com/articles/micro-frontends.html) — the canonical write-up, including the costs
- [Module Federation Docs](https://module-federation.io) — shared dependency negotiation, `singleton`, `strictVersion`
- [single-spa](https://single-spa.js.org) — the brownfield-friendly router/orchestrator
- [MDN — HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching) — the authoritative reference on `Cache-Control` semantics
- [web.dev — Love your cache](https://web.dev/articles/love-your-cache) — practical caching strategy for the whole stack
- [Workbox](https://developer.chrome.com/docs/workbox) — service worker caching strategies without hand-rolling them
- [TanStack Virtual](https://tanstack.com/virtual) — list virtualisation for large and streaming data sets
- [web.dev — INP](https://web.dev/articles/inp) — the responsiveness metric that high-frequency UIs fail
