const e=`# Frontend Deployment — Basics, Hosting Types and Platforms

How a React app gets from \`npm run build\` to a URL, explained once and then shown on the platforms you will meet in practice: GitHub Pages, Cloudflare and AWS. The guide has four parts:

- **Part 1 — The basics** (§1–§2): what deploying a frontend means, the words you need, the three rules every host must follow, and the main *types* of deployment.
- **Part 2 — Platforms** (§3–§7), simplest first. Each one covers the same ground: how it works, setup, SPA routing, deploying from GitHub Actions, custom domain, caching and rollback. §7 then puts the same app on every platform side by side.
- **Part 3 — Concepts that apply everywhere** (§8–§14): configuration, caching, security, performance, monitoring, environments and cost.
- **Part 4 — Interview questions** (§15).

## Table of Contents

**Part 1 — The basics**
- [1. What Deploying a Frontend Means](#1-what-deploying-a-frontend-means)
- [2. Types of Frontend Deployment](#2-types-of-frontend-deployment)

**Part 2 — Platforms**
- [3. GitHub Pages — Worked Example: PrepHub](#3-github-pages-worked-example-prephub)
- [4. Cloudflare Workers and Pages](#4-cloudflare-workers-and-pages)
- [5. AWS: S3 + CloudFront](#5-aws-s3-cloudfront)
- [6. AWS Amplify](#6-aws-amplify)
- [7. The Same App on Every Platform](#7-the-same-app-on-every-platform)

**Part 3 — Concepts that apply everywhere**
- [8. Environment Variables and Config](#8-environment-variables-and-config)
- [9. Caching Strategy](#9-caching-strategy)
- [10. Security](#10-security)
- [11. Performance Optimization](#11-performance-optimization)
- [12. Monitoring](#12-monitoring)
- [13. Multi-Environment Setup and Rollbacks](#13-multi-environment-setup-and-rollbacks)
- [14. Cost Comparison](#14-cost-comparison)

**Part 4 — Interview questions**
- [15. Interview Questions & Answers](#15-interview-questions-answers)

---

## 1. What Deploying a Frontend Means

A React SPA (single-page application — one HTML page whose JavaScript swaps the content as you navigate, instead of the server sending a new page per URL) builds to plain static files: \`npm run build\` writes \`index.html\` plus an \`assets/\` folder of JavaScript, CSS and images into \`dist/\`. Nothing runs on a server per request, so "deploying" means putting those files somewhere and handing them out quickly. The cheapest, most reliable way to do that is file storage behind a **CDN** (content delivery network — cache servers spread around the world, so a user downloads from a nearby city rather than from your one data centre).

### 1.1 What happens when someone opens your site

\`\`\`text
1. Browser asks DNS: where is app.example.com?      → DNS answers with the CDN's address
2. Browser opens HTTPS to the nearest CDN server    → the CDN presents your TLS certificate
3. Browser requests /dashboard                      → no such file: the CDN answers with index.html (SPA fallback)
4. index.html loads /assets/index-a1b2c3.js         → served from the CDN's cache, or fetched once from storage
5. React Router reads the URL /dashboard            → renders the dashboard page in the browser
\`\`\`

The same journey as a picture. The thick lines are what happens on every visit; the dotted ones happen only when the CDN does not have the file cached yet:

\`\`\`mermaid
flowchart LR
  B["Browser"] e1@-->|"1. where is app.example.com?"| DNS["DNS"]
  DNS e2@-->|"CDN address"| B
  B e3@==>|"2-3. HTTPS GET /dashboard"| EDGE["CDN server<br/>in the nearest city"]
  EDGE e4@-.->|"cache miss only"| ORIGIN[("Storage<br/>S3 bucket or Worker assets")]
  ORIGIN e5@-.-> EDGE
  EDGE e6@==>|"4. index.html, then assets"| B
  B e7@--> R["5. React Router<br/>draws /dashboard"]
  e3@{ animate: true }
  e4@{ animate: true }
  e5@{ animate: true }
  e6@{ animate: true }
  e7@{ animate: true }
\`\`\`

Every platform in this guide is a different way of providing those five steps. GitHub Pages and Cloudflare do most of them for you; on AWS you assemble them from separate services.

| Job | GitHub Pages | Cloudflare | AWS |
|-----|--------------|------------|-----|
| Store the files | A branch of your repository | Worker static assets | S3 bucket |
| Serve them worldwide | GitHub's CDN (automatic) | Cloudflare's network (automatic) | CloudFront |
| HTTPS certificate | Automatic | Automatic | ACM (AWS Certificate Manager) |
| DNS for your domain | Any provider, one CNAME record | Cloudflare DNS | Route 53 |
| SPA fallback | None built in: route shells or the \`404.html\` trick | \`not_found_handling: "single-page-application"\` | CloudFront error responses or a CloudFront Function |
| Deploy on every push | GitHub Actions | GitHub Actions with \`wrangler-action\` | GitHub Actions or CodePipeline |

### 1.2 Key Terms

These words come up on every platform, so here they are once:

- **Build output** — what \`npm run build\` produces (\`dist/\` for Vite, \`build/\` for Create React App). It is the only thing you deploy; your \`src/\` folder never reaches the server.
- **Static hosting** — a server that only hands out files as they are, without running your code per request. Every SPA can be hosted this way.
- **CDN, edge location, origin** — a CDN is a network of cache servers around the world (each one an *edge location* or *point of presence*). When an edge does not have a file, it fetches it once from the *origin*, the place your files really live.
- **DNS record** — the entry that turns \`app.example.com\` into an address. An **A/AAAA** record points at an IP address; a **CNAME** points one name at another name (\`app.example.com → my-site.github.io\`); an **alias** (AWS) or a flattened CNAME (Cloudflare) does the same on a bare domain like \`example.com\`, where a plain CNAME is not allowed.
- **TLS certificate** — the file that lets the browser trust \`https://app.example.com\`. All three platforms issue and renew it for free.
- **Cache headers** — \`Cache-Control\` tells browsers and CDNs how long they may reuse a file without asking again (§9).
- **SPA fallback** — answering a request for a path that is not a file (\`/dashboard\`) with \`index.html\`, so the client-side router can draw the page.
- **CI/CD** — continuous integration and delivery: a pipeline (here, GitHub Actions) that tests, builds and deploys on every push, so nobody uploads files by hand.
- **Preview deployment** — a temporary copy of the site for one branch or pull request, at its own URL, so a change can be reviewed before it goes live.
- **Rollback** — putting the previous version back after a bad deploy (§13).

### 1.3 Three rules every host must follow

1. **Unknown paths serve \`index.html\`.** \`/dashboard\` is not a file; it is a route React draws in the browser. If the host returns 404 for it, refreshing the page or opening a shared link breaks.
2. **\`index.html\` is never cached for long; hashed assets are cached forever.** Vite names each built file after a hash of its contents (\`index-a1b2c3.js\`), so a changed file gets a new name and an old name can be cached for a year. \`index.html\` keeps its name every build, so it must be revalidated on every visit, or users keep loading the old app.
3. **Upload assets first and \`index.html\` last.** If the new \`index.html\` went live first, it would point at files that are not uploaded yet.

Keep these three in mind and every configuration below is just one host's way of expressing them.

---

## 2. Types of Frontend Deployment

"Deploying a frontend" covers four quite different setups. Which one you need depends mostly on one question: **does any of your code have to run on a server for each request?** A plain SPA does not, so it gets the simplest and cheapest option.

\`\`\`mermaid
flowchart TD
  Q1{"Server code<br/>per request?"}
  Q1 e1@-->|"no: a plain SPA or static site"| Q2{"Platform builds<br/>on every push?"}
  Q1 e2@-->|"yes: SSR, server components"| SSR["2.3 Server-side rendering<br/>Vercel, Netlify, Amplify SSR,<br/>Cloudflare Workers code, Lambda, containers"]
  Q2 e3@-->|"no: CI builds and uploads"| STATIC["2.1 Static hosting + CDN<br/>GitHub Pages, Cloudflare Workers,<br/>S3 + CloudFront"]
  Q2 e4@-->|"yes"| MANAGED["2.2 Git-connected platform<br/>Amplify, Cloudflare Pages,<br/>Vercel, Netlify"]
  Q1 e5@-.->|"company runs everything<br/>on Kubernetes or ECS"| CONT["2.4 Container<br/>nginx image serving dist/"]
  e1@{ animate: true }
  e2@{ animate: true }
  e3@{ animate: true }
  e4@{ animate: true }
  e5@{ animate: true }
\`\`\`

### 2.1 Static Hosting Behind a CDN

The build output is uploaded to file storage and served by a CDN. Your CI pipeline does the building, and the host only stores and serves files. This is the default for SPAs and static sites, and it is what most of this guide covers: **GitHub Pages** (§3), **Cloudflare Workers static assets** (§4) and **AWS S3 + CloudFront** (§5).

- **Strengths:** nearly free, very fast (every file is served from a nearby edge), almost nothing can break at runtime, and scaling is the CDN's problem.
- **Limits:** no server code, so anything secret or per-user (API keys, database access) has to live in a separate backend API.

### 2.2 Git-Connected Platforms

You connect a repository, and the platform runs the build itself on every push, deploys the result to its CDN and gives every branch or pull request a preview URL. **AWS Amplify** (§6), **Cloudflare Pages** (§4.7), **Vercel** and **Netlify** work this way. Underneath, the result is still static hosting plus a CDN, so the trade-off is convenience against control: less pipeline to write, but you only get the settings the platform exposes, and builds run on the platform's machines and are billed by the minute.

### 2.3 Server-Side Rendering (SSR)

Frameworks such as Next.js, Remix/React Router framework mode or Nuxt can render pages on a server per request, which helps SEO and first paint for content that changes. That needs compute, not just storage: a Node server, serverless functions (AWS Lambda) or edge functions (Cloudflare Workers code, Vercel's edge runtime). Static assets still go to a CDN; only the HTML rendering runs as code. Vercel and Netlify specialise in this, and Amplify and Cloudflare support it too. The [Next.js & RSC guide](/frontend/nextjs-rsc) covers rendering modes; this guide sticks to SPAs.

### 2.4 Containers

Some companies run everything as containers on Kubernetes or Amazon ECS, so the frontend becomes a small image too: a multi-stage Dockerfile builds the app and copies \`dist/\` into an nginx image. The same three rules apply, written as nginx config:

\`\`\`nginx
server {
  listen 80;
  root /usr/share/nginx/html;

  # Rule 2: hashed assets cached for a year
  location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # Rule 1: any path that is not a file falls back to index.html
  location / {
    add_header Cache-Control "no-cache";
    try_files $uri $uri/ /index.html;
  }
}
\`\`\`

This gives one deployment model for the whole company, at the cost of running servers for files a CDN could serve for free; in practice a CDN usually still sits in front. The [Docker, K8s & CI/CD guide](/backend/docker-kubernetes) covers building and running images.

### 2.5 Choosing a Platform


| Feature | GitHub Pages | Cloudflare Workers | S3 + CloudFront | AWS Amplify |
|---------|--------------|--------------------|-----------------|-------------|
| Type (§2) | Static + CDN | Static + CDN | Static + CDN | Git-connected |
| CDN and HTTPS | Yes, automatic | Yes, automatic | Yes (CloudFront + ACM) | Yes, automatic |
| SPA routing | Not built in (workarounds, §3.3) | One config line | You configure it | Rewrite rule |
| Response headers | None, fixed 10-minute cache | \`_headers\` file | Full control | \`customHttp.yml\` |
| Deploy on push | GitHub Actions | GitHub Actions (short) | GitHub Actions (longest) | Built in |
| Preview URL per PR | No | Version preview URLs | Build it yourself | Built in |
| CI credentials | None needed | API token | OIDC role (no stored secret) | None needed |
| Cost for a typical SPA | Free | Free (static requests unlimited) | Usually within the free tier | $0.15 per GB after 15 GB |
| Setup effort | Lowest | Low | Highest | Low |

How to choose:

- **A personal project, docs or a portfolio, free, straight from the repository**, and you can live without rewrites or custom headers: **GitHub Pages** (§3).
- **The least plumbing with full control over caching and headers**, and your domain can use Cloudflare's DNS: **Cloudflare Workers** (§4). No bucket, no certificate step, no cache invalidation, and static traffic is free.
- **Your company already runs on AWS**, or needs WAF rules, IAM-controlled access, multi-region failover or infrastructure reviewed as code: **S3 + CloudFront** (§5).
- **A team inside AWS wants deploy-on-push and PR previews without writing a pipeline**: **Amplify** (§6).
- **The app renders on the server** (Next.js SSR, server components): a platform with compute (§2.3), not plain static hosting.
- **Avoid S3 static website hosting on its own**: it serves HTTP only, from one region, and needs a public bucket.

---

## 3. GitHub Pages — Worked Example: PrepHub

**GitHub Pages** serves static files straight from a GitHub repository, for free, over HTTPS, on GitHub's own CDN. You publish by pushing the build output to a branch (or by uploading it with GitHub's official \`actions/deploy-pages\` action), and you can attach your own domain with one DNS record. It is the simplest platform in this guide, and also the most limited: there are no rewrite rules, so SPA fallback has to be faked, and no way to set response headers.

The best way to see both sides is a real app, so this section walks through the site you are reading. PrepHub is a Vite + React SPA: about a hundred guides, each a lazily loaded chunk, installed as a PWA (progressive web app — a site that a service worker can run offline). It is hosted on **GitHub Pages**, with **Cloudflare for DNS only**. Every detail below is from the repository's \`.github/workflows/deploy.yml\` and from the live site's response headers.

\`\`\`mermaid
flowchart LR
  DEV["git push to main"] e1@--> GA["GitHub Actions<br/>quality gates, then vite build"]
  GA e2@--> POST["route shells<br/>+ sitemap"]
  POST e3@--> GHP["gh-pages branch<br/>dist/ + CNAME file"]
  GHP e4@--> CDN["GitHub Pages CDN"]
  USER["Browser"] e5@-->|"prephub.sreenathp.com?"| CF["Cloudflare DNS<br/>CNAME, not proxied"]
  CF e6@-->|"sreen98.github.io"| USER
  USER e7@==>|"HTTPS"| CDN
  CDN e8@==>|"index.html + chunks"| SW["Service worker<br/>caches the app shell"]
  e1@{ animate: true }
  e2@{ animate: true }
  e3@{ animate: true }
  e4@{ animate: true }
  e7@{ animate: true }
  e8@{ animate: true }
\`\`\`

### 3.1 The Pipeline

One workflow runs on every push to \`main\`. Every check runs *before* the build, so a broken commit never reaches the site:

\`\`\`yaml
# .github/workflows/deploy.yml (trimmed; the real file explains each step in comments)
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

permissions:
  contents: write          # lets the built-in GITHUB_TOKEN push the gh-pages branch

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: 'npm' }
      - run: npm install
      - run: npm run content:meta          # generated files the typecheck needs
      - run: npm run playground:index
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run verify:arch           # repository invariants
      - run: npm run verify:blocks         # every guide code block parses
      - run: node scripts/prepare-content.js
      - run: npm run verify:counts         # numbers quoted in prose match the content
      - run: npm run build                 # vite build + route shells + sitemap
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: prephub.sreenathp.com
\`\`\`

Three choices worth copying:

- **No deploy credentials at all.** The host is GitHub itself, so the token GitHub gives every workflow run (\`GITHUB_TOKEN\`), with \`contents: write\`, is enough to publish. There is no AWS role and no Cloudflare token to manage.
- **The deploy step is a git push.** \`peaceiris/actions-gh-pages\` commits \`dist/\` to the \`gh-pages\` branch, and GitHub Pages serves that branch.
- **The \`cname:\` input** writes a \`CNAME\` file into every deploy. Each deploy replaces the branch's contents, so without that file GitHub would forget the custom domain and fall back to \`sreen98.github.io/prephub/\`, where the site's root-based asset paths do not resolve.

### 3.2 The Domain: Cloudflare DNS, GitHub HTTPS

Cloudflare manages the \`sreenathp.com\` zone and holds one record, \`CNAME prephub → sreen98.github.io\`, set to **DNS only** (not proxied through Cloudflare). A lookup of \`prephub.sreenathp.com\` returns GitHub's own \`185.199.108–111.153\` addresses, and responses carry \`Server: GitHub.com\`, so Cloudflare answers the DNS question and then steps out of the way. GitHub issues and renews the HTTPS certificate for the custom domain.

The site moved here from \`sreen98.github.io/prephub/\`. GitHub now 301-redirects the old address, and the move meant changing the base path from \`/prephub/\` to \`/\` in one place (\`base\` in \`vite.config.js\`), plus the PWA scope and a few absolute URLs.

### 3.3 SPA Routing on a Host Without Rewrites

GitHub Pages cannot rewrite unknown paths to \`index.html\`, so it breaks rule 1 from §1.3 out of the box: a request for \`/frontend/react\` finds no file and gets a real 404. PrepHub handles this in two layers.

\`\`\`mermaid
flowchart TD
  REQ["GET /frontend/react"] e1@--> Q{"Is it a known route?"}
  Q e2@-->|"yes"| SHELL["dist/frontend/react/index.html exists<br/>301 to the trailing slash, then 200"]
  Q e3@-->|"no"| NF["404.html<br/>rewrites the URL to /?/unknown/path"]
  NF e4@--> IDX["index.html restores the path,<br/>the router redirects unknown routes home"]
  SHELL e5@--> APP["React Router renders the guide"]
  e1@{ animate: true }
  e2@{ animate: true }
  e3@{ animate: true }
  e4@{ animate: true }
  e5@{ animate: true }
\`\`\`

1. **Route shells for every known route.** After \`vite build\`, \`scripts/generate-route-shells.js\` copies \`index.html\` to \`dist/<route>/index.html\` for every route the app has. A deep link then finds a real file: GitHub answers \`/frontend/react\` with a 301 to \`/frontend/react/\` and serves the shell with a 200. Before the shells existed, every deep link paid for a 404 plus a redirect, which Lighthouse measured at 978 ms on mobile.
2. **\`404.html\` for everything else.** GitHub Pages serves \`404.html\` for missing paths. PrepHub's version is a tiny script that rewrites \`/some/path\` to \`/?/some/path\` and loads the app, and \`index.html\` turns that query string back into the real path before the router starts. This is the well-known "SPA on GitHub Pages" trick, and here it only handles genuinely unknown URLs.

### 3.4 The Caching You Cannot Control

GitHub Pages sends \`Cache-Control: max-age=600\` on **every** file, hashed or not, and offers no way to change it or add other headers:

\`\`\`bash
curl -sI https://prephub.sreenathp.com/ | grep -i cache-control
# cache-control: max-age=600
curl -sI https://prephub.sreenathp.com/assets/app-CZwu4M6U.js | grep -i cache-control
# cache-control: max-age=600   ← a hashed file that could safely be cached for a year
\`\`\`

That breaks rule 2 in both directions: \`index.html\` can be up to ten minutes stale after a deploy, and hashed chunks are revalidated every ten minutes instead of being cached for a year. PrepHub compensates in the browser with a **service worker** (generated by \`vite-plugin-pwa\`, which uses Google's Workbox library): it precaches the app shell (the \`app-*\` and \`vendor-*\` chunks), caches each guide chunk the first time it is opened, and checks for a new version periodically, updating automatically when it finds one. Returning visitors therefore load the app from their own device. The other missing piece, security headers such as HSTS or a CSP header, cannot be fixed on GitHub Pages at all; a CSP could only be added as a \`<meta>\` tag.

### 3.5 Setting It Up for Your Own App

PrepHub publishes by pushing \`dist/\` to a \`gh-pages\` branch. A new project can skip the branch and use GitHub's official Pages actions instead: in the repository's **Settings → Pages**, set **Source** to **GitHub Actions**, then add this workflow.

\`\`\`yaml
# .github/workflows/pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write       # publish to Pages
  id-token: write    # Pages verifies the deployment with an OIDC token

concurrency: pages

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: '24', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - run: cp dist/index.html dist/404.html     # simplest SPA fallback (see below)
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
\`\`\`

Three things to get right:

- **The base path.** Without a custom domain, a repository's site lives at \`https://<user>.github.io/<repo>/\`, not at the domain root, so set \`base: '/<repo>/'\` in \`vite.config.js\` (and \`basename\` on your router) or every asset URL 404s. With a custom domain, or a repository named \`<user>.github.io\`, the base stays \`/\`.
- **SPA fallback.** Copying \`index.html\` to \`404.html\` makes every unknown path load the app, so deep links work. The response status is still 404, which search engines index badly and Lighthouse flags; PrepHub's route shells (§3.3) fix that for known routes.
- **Custom domain.** Enter it under **Settings → Pages → Custom domain**, add a \`CNAME\` record pointing at \`<user>.github.io\` with your DNS provider (any provider works), and tick **Enforce HTTPS** once GitHub has issued the certificate.

**Rollback.** Every run is a separate deployment in the \`github-pages\` environment. To go back, re-run the deploy workflow from the last good commit (**Actions → the run → Re-run all jobs**) or revert the bad commit and let the push redeploy. Both rebuild, so a rollback takes as long as a deploy.

---

## 4. Cloudflare Workers and Pages

Cloudflare runs one of the largest CDNs, and its **Workers** platform can serve a folder of static files directly. A **Worker** is a small program Cloudflare runs at every one of its locations; a Worker with **static assets** may have no program at all, just your \`dist/\` folder plus a config file. Cloudflare uploads the files to its network, serves them over HTTPS with an automatic certificate, and does the SPA fallback with one setting.

Cloudflare also has an older product for this, **Pages**. Pages is still supported, but Cloudflare's own documentation now says to start new projects on Workers, which it calls its primary platform. Pages is covered in §4.7 because many existing sites use it.

The whole Cloudflare flow, for production pushes and for pull requests:

\`\`\`mermaid
flowchart LR
  PUSH["push to main"] e1@--> GA["GitHub Actions<br/>npm ci, test, build"]
  PR["pull request"] e2@--> GA
  GA e3@==>|"wrangler deploy"| CFN["Cloudflare network<br/>every location"]
  GA e4@-.->|"wrangler versions upload<br/>--preview-alias pr-42"| PREV["pr-42-my-app.workers.dev"]
  CFN e5@==>|"HTTPS, automatic certificate"| USER["Visitors on<br/>app.example.com"]
  e1@{ animate: true }
  e2@{ animate: true }
  e3@{ animate: true }
  e4@{ animate: true }
  e5@{ animate: true }
\`\`\`

### 4.1 How It Compares with AWS

If you have used AWS, this table translates each AWS piece (explained in §5) into its Cloudflare equivalent. Most of the AWS work simply disappears:

| AWS piece | Cloudflare equivalent |
|-----------|-----------------------|
| S3 bucket + OAC | The Worker's static assets (never publicly listable, nothing to lock down) |
| CloudFront distribution | Automatic: every Worker is served from Cloudflare's whole network |
| 403/404 → \`index.html\` | \`"not_found_handling": "single-page-application"\` |
| Response headers policy | A \`_headers\` file in the build output |
| ACM certificate | Issued automatically when you attach a custom domain |
| Route 53 alias | A custom domain on the Worker (your zone must use Cloudflare DNS) |
| Invalidation | Not needed: Cloudflare revalidates static files on each request by default (§4.3) |
| OIDC role | Not available: a scoped API token stored as a GitHub secret |

### 4.2 Project Setup

Add a Wrangler config file at the project root. **Wrangler** is Cloudflare's CLI; it reads this file to know what to deploy.

\`\`\`json
{
  "name": "my-app",
  "compatibility_date": "2026-10-01",
  "assets": {
    "directory": "./dist/",
    "not_found_handling": "single-page-application"
  }
}
\`\`\`

Save it as \`wrangler.jsonc\` (Wrangler also accepts \`wrangler.toml\`). What each key does:

- \`name\` — the Worker's name; it also gives you a free URL, \`my-app.<your-subdomain>.workers.dev\`.
- \`compatibility_date\` — pins Cloudflare's runtime behaviour to that date, so a platform change never alters a deployed site. Set it to the day you create the project.
- \`assets.directory\` — the folder to upload: Vite's \`dist/\`.
- \`not_found_handling: "single-page-application"\` — any request that matches no file gets \`index.html\` with a 200. This is rule 1 from §1.3 in one line.

There is no \`main\` key, because an assets-only Worker has no code. If you later need server logic (an \`/api\` proxy, for example), add a script with \`main\` and list the paths it should handle in \`assets.run_worker_first\`; requests for files are still served without running your code.

Headers go in a \`_headers\` file. Put it in Vite's \`public/\` folder, so the build copies it into \`dist/\`:

\`\`\`text
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=63072000; includeSubDomains
\`\`\`

Each block is a URL pattern followed by indented headers. The first block gives Vite's hashed files a one-year cache; without it Cloudflare would revalidate them on every request, which is correct but wasteful.

### 4.3 First Deploy from Your Laptop

\`\`\`bash
npm install --save-dev wrangler
npx wrangler login          # opens the browser once to authorise this machine
npm run build
npx wrangler deploy         # uploads dist/ and prints the workers.dev URL
\`\`\`

Only files whose content changed are uploaded on later deploys.

Caching works differently from S3. Unless \`_headers\` says otherwise, Cloudflare sends static files with \`Cache-Control: public, max-age=0, must-revalidate\` and an \`ETag\` (a fingerprint of the file's contents). Browsers therefore re-check each file on every visit and get a tiny \`304 Not Modified\` when nothing changed. So \`index.html\` is always fresh after a deploy and there is **no invalidation step**.

### 4.4 Deploy from GitHub Actions

Cloudflare does not support GitHub OIDC for deploys, so CI authenticates with an **API token** — a long-lived secret, which makes scoping it narrowly matter:

1. In the Cloudflare dashboard, go to **My Profile → API Tokens → Create Token** and use the **Edit Cloudflare Workers** template. Limit it to your one account (and zone, if you attach a custom domain).
2. Copy your **Account ID** from the dashboard's Workers overview.
3. In GitHub, add both as repository secrets: \`CLOUDFLARE_API_TOKEN\` and \`CLOUDFLARE_ACCOUNT_ID\`.

\`\`\`yaml
# .github/workflows/deploy-cloudflare.yml
name: Deploy frontend to Cloudflare

on:
  push:
    branches: [main]

permissions:
  contents: read

concurrency: deploy-production

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: '24'
          cache: 'npm'

      - run: npm ci
      - run: npm test
      - run: npm run build
        env:
          VITE_API_BASE_URL: \${{ vars.API_BASE_URL }}

      - uses: cloudflare/wrangler-action@v4
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
\`\`\`

\`cloudflare/wrangler-action\` installs Wrangler (v4 by default, or the version in your \`package.json\`) and runs the command you give it, reading \`wrangler.jsonc\` from the repository. The build happens in GitHub Actions, so \`VITE_*\` values must be set on the build step, as here; variables set in the Cloudflare dashboard are never seen by a build that ran somewhere else.

Compared with the AWS workflow in §5.4.2, there is no upload ordering to manage and no invalidation: Wrangler uploads the new files and then switches the Worker to the new version in one step.

### 4.5 Preview URL for Every Pull Request

\`wrangler versions upload\` uploads a new version *without* sending production traffic to it, and \`--preview-alias\` gives that version a readable URL:

\`\`\`yaml
# .github/workflows/preview-cloudflare.yml
name: Preview

on:
  pull_request:

permissions:
  contents: read

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: '24', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v4
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: versions upload --preview-alias pr-\${{ github.event.number }}
\`\`\`

Pull request 42 is then live at \`pr-42-my-app.<your-subdomain>.workers.dev\`. Two things to know: preview URLs are public unless you put Cloudflare Access (Cloudflare's login gateway) in front of them, and pull requests from forks get no repository secrets, so this job only works for branches in your own repository.

### 4.6 Custom Domain

Attaching your own domain requires the domain's DNS to be on Cloudflare (an active "zone": you point the registrar's nameservers at Cloudflare). Then add a route to \`wrangler.jsonc\`:

\`\`\`json
{
  "name": "my-app",
  "compatibility_date": "2026-10-01",
  "assets": {
    "directory": "./dist/",
    "not_found_handling": "single-page-application"
  },
  "routes": [{ "pattern": "app.example.com", "custom_domain": true }]
}
\`\`\`

On the next deploy Cloudflare creates the DNS record and issues the certificate itself. The hostname must not already have a CNAME record. If your DNS has to stay with another provider, use Pages (§4.7), which accepts a subdomain CNAME from external DNS.

### 4.7 Cloudflare Pages (Alternative)

Pages differs in three ways: a project must exist before the first upload, SPA fallback is automatic (if \`dist/\` has no \`404.html\`, every unknown path gets \`index.html\`, so no \`_redirects\` rule is needed), and every deployment gets its own permanent URL (\`<hash>.my-app.pages.dev\`) plus a branch alias (\`<branch>.my-app.pages.dev\`).

\`\`\`bash
npx wrangler pages project create my-app   # once
\`\`\`

\`\`\`yaml
# .github/workflows/deploy-pages.yml
name: Deploy to Cloudflare Pages

on:
  push:

permissions:
  contents: read
  deployments: write     # lets the action show the deployment in GitHub

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: '24', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v4
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=my-app
          gitHubToken: \${{ secrets.GITHUB_TOKEN }}
\`\`\`

A push to the project's production branch (normally \`main\`) updates the live site; a push to any other branch becomes a preview deployment. The API token needs **Account → Cloudflare Pages → Edit**. This "Direct Upload" style (building in GitHub Actions and uploading \`dist/\`) cannot later be switched to Cloudflare's own Git-connected builds for the same project.

### 4.8 Rollback and Gotchas

**Rollback.** Workers keep your recent versions: \`npx wrangler deployments list\` shows them and \`npx wrangler rollback <version-id>\` sends traffic back to one in seconds. On Pages, open the project's **Deployments**, choose a previous production deployment and select **Rollback to this deployment** (preview deployments cannot be rollback targets).

**Gotchas:**

- **Old chunks after a deploy.** On S3 you keep the previous build's files on purpose (§5.2 Step 9). Cloudflare does not document keeping the previous deployment's files, so assume each deploy serves only its own set: a tab opened before the deploy may get a \`ChunkLoadError\` on its next lazy route. Handle it in the app by reloading once (Q19).
- **A missing asset returns \`index.html\`.** In SPA mode, a request that matches no file gets \`index.html\`, so a wrong script path shows up as an HTML parse error, as with Option A on CloudFront.
- **\`_headers\` applies to static files only.** If you add Worker code, set headers on the responses it builds in that code.
- **Limits.** 20,000 files per version on the Free plan (100,000 on Paid), and 25 MiB per file. A typical Vite build is far below both.

---

## 5. AWS: S3 + CloudFront

AWS has no single "host my SPA" product (apart from Amplify, §6). Instead you combine five services: S3 stores the files, CloudFront serves them worldwide, ACM provides the certificate, Route 53 handles DNS, and IAM controls who may deploy. It is the most work of any platform here, and it is what many companies use, because everything stays inside their AWS account, under their IAM policies, reviewable as code and able to use WAF, origin failover and edge functions. This section builds it in four stages:

1. **The pieces** (§5.1): what each service does and how they connect.
2. **By hand** (§5.2): the ten steps once in the console and CLI, so you see what each piece is for.
3. **As code** (§5.3): the same setup in AWS CDK, the way real projects do it.
4. **Automated** (§5.4): GitHub Actions deploying on every push, with OIDC instead of stored keys.

### 5.1 The Pieces


The words below come up in every AWS step, so here they are once:

- **S3 bucket** — a container for files ("objects") in one AWS region. Ours stays fully private.
- **CloudFront distribution** — your CDN configuration. It gets an address like \`d1234abcd.cloudfront.net\` and runs at 750+ points of presence (the CDN servers, also called edge locations).
- **Origin** — where CloudFront fetches a file when its cache does not have it. Here, the bucket.
- **OAC (Origin Access Control)** — CloudFront signs every request it makes to S3, and the bucket policy accepts only requests signed by *your* distribution. That is how the bucket stays private while CloudFront can still read it.
- **Behavior and cache policy** — rules for a URL pattern: allowed methods, HTTPS redirect, compression and how long to cache.
- **Invalidation** — telling CloudFront to throw away its cached copy of a path before it expires.
- **ACM** — issues the free TLS certificate for HTTPS and renews it automatically. CloudFront reads certificates only from **us-east-1**.
- **Route 53** — AWS's DNS. An **alias** record points your domain at the distribution, and unlike a CNAME it also works on the bare domain (\`example.com\`).

The finished setup. Visitors follow the top path; your deploys follow the bottom one:

\`\`\`mermaid
flowchart LR
  U["Visitor"] e1@-->|"app.example.com"| R53["Route 53<br/>alias record"]
  U e2@==>|"HTTPS"| CF["CloudFront distribution<br/>750+ edge locations"]
  ACM["ACM certificate<br/>us-east-1"] -.- CF
  CF e3@==>|"signed by OAC"| S3[("S3 bucket<br/>private")]
  GH["GitHub Actions"] e4@-->|"1. upload assets, then index.html"| S3
  GH e5@-->|"2. invalidate /*"| CF
  e2@{ animate: true }
  e3@{ animate: true }
  e4@{ animate: true }
  e5@{ animate: true }
\`\`\`

The same setup as a settings checklist:

\`\`\`text
Bucket my-app-frontend (private, Block Public Access on, no "static website hosting")
  ↑ reads, signed by OAC
CloudFront distribution
  - Origin: the bucket's REST endpoint (my-app-frontend.s3.us-east-1.amazonaws.com)
  - Viewer protocol: redirect HTTP to HTTPS
  - Cache policy: CachingOptimized (respects the Cache-Control header on each file)
  - Compression: on (gzip + Brotli)
  - SPA fallback: 403/404 → /index.html with 200, or a CloudFront Function (§5.2 Step 7)
  - Alternate domain: app.example.com, certificate from ACM in us-east-1
  ↑
Route 53 alias records (A + AAAA): app.example.com → the distribution
\`\`\`

You do **not** turn on S3's "static website hosting" feature. It needs a public bucket and serves HTTP only, and CloudFront already handles routing and HTTPS.

### 5.2 Step-by-Step by Hand


Doing it once by hand shows what each piece is for. In real projects you write the same thing as code (§5.3), because a console setup cannot be reviewed or recreated reliably.

#### Step 1: Build Your App

\`\`\`bash
npm run build
# dist/index.html, dist/assets/index-a1b2c3.js, dist/assets/index-d4e5f6.css, ...
# Files from public/ (favicon.ico, robots.txt) are copied to dist/ unhashed.
\`\`\`

#### Step 2: Create a Private Bucket

Bucket names are global across all AWS accounts, so pick something unique.

\`\`\`bash
aws s3 mb s3://my-app-frontend --region us-east-1

# New buckets already block public access; setting it explicitly documents the intent
aws s3api put-public-access-block \\
  --bucket my-app-frontend \\
  --public-access-block-configuration \\
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
\`\`\`

#### Step 3: Request the Certificate (ACM, us-east-1)

The certificate has to exist before the distribution can use your domain. Request it in **us-east-1**, whatever region your bucket is in, or it will not appear in CloudFront.

\`\`\`bash
aws acm request-certificate \\
  --domain-name "app.example.com" \\
  --subject-alternative-names "*.example.com" \\
  --validation-method DNS \\
  --region us-east-1
\`\`\`

ACM then asks you to prove you own the domain by adding one CNAME record that it gives you. If the domain is in Route 53, the console's **Create records in Route 53** button adds it for you. Validation usually takes a few minutes, and ACM renews the certificate automatically for as long as that record stays in place. The \`*.example.com\` name means one certificate also covers \`dev.\` and \`qa.\` later.

#### Step 4: Create the Origin Access Control

\`\`\`bash
aws cloudfront create-origin-access-control \\
  --origin-access-control-config \\
  Name=my-app-oac,SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3
\`\`\`

The response contains an \`Id\` that you attach to the distribution's origin in the next step.

#### Step 5: Create the Distribution

The CLI's shorthand (\`aws cloudfront create-distribution --origin-domain-name … --default-root-object index.html\`) creates a distribution with no OAC, no domain and no certificate, so for a first manual setup use the console, which walks through the same settings as §5.1:

\`\`\`text
Origin domain:           my-app-frontend.s3.us-east-1.amazonaws.com   (pick the bucket, not a website endpoint)
Origin access:           Origin access control settings → my-app-oac
Viewer protocol policy:  Redirect HTTP to HTTPS
Allowed HTTP methods:    GET, HEAD
Cache policy:            CachingOptimized
Compress objects:        Yes
Alternate domain name:   app.example.com
Custom SSL certificate:  the ACM certificate from Step 3
Security policy:         TLSv1.2_2021
Default root object:     index.html
Price class:             all edge locations, or North America + Europe only (cheaper; slower elsewhere)
\`\`\`

#### Step 6: Let the Distribution Read the Bucket

The console shows this policy after you create the distribution, with your IDs filled in. It allows exactly one thing: *this* distribution may read objects.

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontRead",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-app-frontend/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E1234567890"
        }
      }
    }
  ]
}
\`\`\`

\`\`\`bash
aws s3api put-bucket-policy --bucket my-app-frontend --policy file://bucket-policy.json
\`\`\`

#### Step 7: SPA Routing

There is no file called \`dashboard\` in the bucket, so without this step a refresh or a shared deep link fails. There are two ways to do it, and the difference is *where* the request gets redirected:

\`\`\`mermaid
flowchart TD
  REQ["GET /dashboard"] e1@--> CF{"CloudFront"}
  CF e2@-->|"Option A: ask S3 as is"| S3["S3: no such object<br/>answers 403"]
  S3 e3@--> ERR["Error response rule<br/>403 becomes /index.html, 200"]
  CF e4@-->|"Option B: Function rewrites<br/>extensionless paths first"| FN["uri becomes /index.html"]
  FN e5@--> S3OK["S3 returns index.html"]
  ERR e6@--> APP["React Router renders /dashboard"]
  S3OK e7@--> APP
  e1@{ animate: true }
  e2@{ animate: true }
  e3@{ animate: true }
  e4@{ animate: true }
  e5@{ animate: true }
  e6@{ animate: true }
  e7@{ animate: true }
\`\`\`

**Option A: custom error responses** (simplest). In the distribution's **Error pages** tab:

\`\`\`text
HTTP error code 403 → Response page /index.html → Response code 200
HTTP error code 404 → Response page /index.html → Response code 200
\`\`\`

Why **403** as well as 404? A private bucket that does not grant CloudFront permission to list its contents answers a request for a missing file with **403 Forbidden**, because S3 refuses to confirm whether a file exists to a caller who cannot list. So in practice the 403 rule is the one that fires. The trade-off: a genuinely missing script or image *also* comes back as \`index.html\` with a 200, so a broken asset path shows up as a confusing "unexpected token \`<\`" error instead of a clean 404.

**Option B: a CloudFront Function** (more precise). A CloudFront Function is a few lines of JavaScript that CloudFront runs on every request at the edge, before it checks its cache. This one sends any path *without a file extension* to \`index.html\` and leaves real files alone, so a missing asset still returns a true 404:

\`\`\`js
// CloudFront Function, runtime 2.0, attached to the default behavior as "viewer request"
function handler(event) {
  var request = event.request;
  // /dashboard/users has no extension → it's an app route, serve the shell
  // /assets/index-a1b2c3.js has one     → it's a file, fetch it as asked
  if (!/\\.[a-zA-Z0-9]+$/.test(request.uri)) {
    request.uri = '/index.html';
  }
  return request;
}
\`\`\`

The catch: a route whose last segment contains a dot (\`/users/jane.doe\`) looks like a file to this rule. AWS's own published example only appends \`index.html\` to directory paths, which suits a multi-page static site rather than a client-side router, so adapt it as above.

#### Step 8: Point Your Domain at the Distribution

If you registered the domain in Route 53, a hosted zone (the set of DNS records for the domain) already exists. If the domain is registered elsewhere, create a hosted zone in Route 53 and set your registrar's nameservers to the four \`NS\` values it lists.

Then add two **alias** records — \`A\` (IPv4) and \`AAAA\` (IPv6) — for \`app.example.com\` that point at the distribution. In the console: **Create record → Alias → Alias to CloudFront distribution**. On the CLI:

\`\`\`bash
aws route53 change-resource-record-sets \\
  --hosted-zone-id Z1234567890 \\
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "app.example.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "d1234567890.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
# Repeat with "Type": "AAAA" for IPv6.
\`\`\`

The \`HostedZoneId\` \`Z2FDTNDATAQYW2\` is not a typo and not yours: it is the fixed ID AWS uses for every CloudFront alias target. Alias queries to CloudFront are free.

#### Step 9: Upload the Build

This is the upload every later section reuses:

\`\`\`bash
BUCKET=my-app-frontend

# 1. Hashed build output: cache for a year. No --delete, so the previous
#    build's chunks stay available to tabs that are already open.
aws s3 sync dist/assets "s3://$BUCKET/assets" \\
  --cache-control "public, max-age=31536000, immutable"

# 2. Everything else (index.html, favicon, robots.txt, config.js): revalidate
#    on every request. --delete removes stale files, but never touches assets/,
#    because excluded paths are skipped by --delete too.
aws s3 sync dist "s3://$BUCKET" \\
  --exclude "assets/*" \\
  --cache-control "no-cache" \\
  --delete

# 3. Drop CloudFront's cached copies of the unhashed files
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"
\`\`\`

What a deploy looks like from the user's side. The tab opened before the deploy keeps working because the old chunks are still there:

\`\`\`mermaid
sequenceDiagram
  autonumber
  participant CI as GitHub Actions
  participant S3 as S3 bucket
  participant CF as CloudFront
  participant Old as Tab opened yesterday
  participant New as New visitor
  CI->>S3: upload assets/ (new hashed names, old ones kept)
  CI->>S3: upload index.html last
  CI->>CF: invalidate /*
  Old->>CF: GET /assets/Settings-OLD.js (lazy route)
  CF-->>Old: 200, the old chunk still exists
  New->>CF: GET /
  CF->>S3: cache was dropped, fetch index.html
  CF-->>New: new index.html pointing at the new chunks
\`\`\`

Why each choice:

- **Order** follows rule 3 from §1.3: the assets go up first, so the new \`index.html\` never points at a file that is not there yet.
- **No \`--delete\` on assets.** Deleting the previous build's chunks means a user who opened the app before the deploy gets a \`ChunkLoadError\` when they navigate to a lazily loaded route (see Frontend Architecture tricky Q3). Prune builds older than a release or two in a separate cleanup job.
- **\`no-cache\` rather than \`no-store\`.** \`no-cache\` means "you may keep a copy, but check with me before using it". The check is a small conditional request that comes back \`304 Not Modified\` when nothing changed, which is exactly what \`index.html\` needs. \`no-store\` forbids keeping a copy at all, so every visit downloads the full file again.
- **Only \`assets/\` is immutable.** Splitting on \`*.html\` instead, as many tutorials do, would also give \`favicon.ico\` and \`robots.txt\` a one-year cache, even though their names never change.
- **The invalidation** makes the edges fetch the new \`index.html\` at once. A path containing \`*\` counts as one path, and the first 1,000 paths a month are free per account.

#### Step 10: Check It Works

\`\`\`bash
curl -sI https://app.example.com/ | grep -iE "^(HTTP|cache-control|x-cache)"
# HTTP/2 200, cache-control: no-cache, x-cache: Hit from cloudfront (or Miss, first time)

curl -sI https://app.example.com/dashboard | head -1
# HTTP/2 200 — the SPA fallback works

curl -sI https://my-app-frontend.s3.us-east-1.amazonaws.com/index.html | head -1
# HTTP/1.1 403 — the bucket is private, nobody can bypass CloudFront
\`\`\`

### 5.3 Infrastructure as Code (CDK)


The same setup as §5.2, written as code. The **AWS CDK** (Cloud Development Kit) lets you describe infrastructure in TypeScript; \`cdk deploy\` turns it into a CloudFormation stack, AWS's format for a set of resources created, updated and deleted together. The certificate is created separately (once, in us-east-1) and imported by ARN, because a wildcard certificate is shared by every stage.

\`\`\`ts
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';

interface FrontendStackProps extends cdk.StackProps {
  stage: string;
  domainName: string;
  apiUrl: string;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // Step 2: private bucket, no website hosting; no fixed bucketName, so stages don't collide
    const bucket = new s3.Bucket(this, 'FrontendBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Step 3: the us-east-1 certificate, created once; a *.example.com cert covers every stage
    const certificate = acm.Certificate.fromCertificateArn(
      this, 'Certificate',
      'arn:aws:acm:us-east-1:123456789012:certificate/abc-123'
    );

    // Steps 4–7: OAC, distribution, bucket policy and SPA fallback.
    // withOriginAccessControl creates the OAC and writes the bucket policy for you.
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      defaultRootObject: 'index.html',
      domainNames: [props.domainName],
      certificate,
      errorResponses: [
        { httpStatus: 403, responsePagePath: '/index.html', responseHttpStatus: 200, ttl: cdk.Duration.seconds(0) },
        { httpStatus: 404, responsePagePath: '/index.html', responseHttpStatus: 200, ttl: cdk.Duration.seconds(0) },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // North America + Europe
    });

    // Step 9: upload. prune defaults to true, which would delete the previous
    // build's chunks, so upload assets and the rest separately, both with prune: false.
    const assets = new s3deploy.BucketDeployment(this, 'DeployAssets', {
      sources: [s3deploy.Source.asset('../dist')],
      destinationBucket: bucket,
      include: ['assets/*'],
      exclude: ['*'],
      prune: false,
      cacheControl: [s3deploy.CacheControl.fromString('public, max-age=31536000, immutable')],
    });

    const shell = new s3deploy.BucketDeployment(this, 'DeployShell', {
      sources: [s3deploy.Source.asset('../dist')],
      destinationBucket: bucket,
      exclude: ['assets/*'],
      prune: false,
      cacheControl: [s3deploy.CacheControl.noCache()],
      distribution,
      distributionPaths: ['/*'],
    });
    shell.node.addDependency(assets);        // assets first, index.html last

    // Step 8: DNS
    const hostedZone = route53.HostedZone.fromLookup(this, 'Zone', {
      domainName: 'example.com',
    });

    new route53.ARecord(this, 'ARecord', {
      zone: hostedZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(new route53targets.CloudFrontTarget(distribution)),
    });
    new route53.AaaaRecord(this, 'AaaaRecord', {
      zone: hostedZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(new route53targets.CloudFrontTarget(distribution)),
    });

    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });
  }
}
\`\`\`

\`\`\`bash
npx cdk bootstrap   # once per account and region: creates the bucket CDK stages assets in
npx cdk deploy
\`\`\`

Uploading the site from CDK (\`BucketDeployment\`) is convenient for small projects. Larger teams usually let CDK own only the infrastructure and let CI upload each build with the script from Step 9, so a frontend release does not need a CloudFormation deploy.

### 5.4 CI/CD: GitHub Actions with OIDC


#### 5.4.1 One-Time Setup: Let GitHub Assume an AWS Role (OIDC)

Do not store AWS access keys in GitHub. Use **OIDC** (OpenID Connect) instead: on each run, GitHub issues the job a short-lived signed token saying "this is repository \`my-org/my-app\`, branch \`main\`". AWS checks that token against a role's trust policy and hands back temporary credentials that expire within the hour. Nothing permanent is stored in GitHub, so there is no key to leak or rotate.

\`\`\`mermaid
sequenceDiagram
  autonumber
  participant Job as GitHub Actions job
  participant GH as GitHub OIDC provider
  participant STS as AWS STS
  participant AWS as S3 + CloudFront
  Job->>GH: request a token (needs id-token: write)
  GH-->>Job: signed token: repo my-org/my-app, branch main
  Job->>STS: AssumeRoleWithWebIdentity(token, role ARN)
  STS->>STS: check signature, aud and sub against the trust policy
  STS-->>Job: temporary credentials, expire within the hour
  Job->>AWS: s3 sync + create-invalidation
\`\`\`

**1. Add GitHub as an identity provider** (once per AWS account). In IAM → Identity providers → Add provider: type **OpenID Connect**, provider URL \`https://token.actions.githubusercontent.com\`, audience \`sts.amazonaws.com\`.

**2. Create a role whose trust policy accepts only your repository's main branch:**

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:my-org/my-app:ref:refs/heads/main"
        }
      }
    }
  ]
}
\`\`\`

The \`sub\` (subject) condition is the security boundary: without it, *any* GitHub repository could assume the role. To tie it to a GitHub Environment instead of a branch, use \`repo:my-org/my-app:environment:production\`. Check the subject format your repository actually sends: since July 2026, newly created, renamed or transferred repositories send **immutable** subjects that include numeric IDs (\`repo:my-org@123456/my-app@456789:ref:refs/heads/main\`), and a trust policy written for the old format rejects them.

**3. Give the role only what a deploy needs:**

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::my-app-frontend"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::my-app-frontend/*"
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::123456789012:distribution/E1234567890"
    }
  ]
}
\`\`\`

If this role leaks, the worst anyone can do is overwrite one site, and only from your main branch.

#### 5.4.2 The Workflow

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy frontend to AWS

on:
  push:
    branches: [main]

permissions:
  id-token: write    # lets the job request the OIDC token
  contents: read

concurrency: deploy-production   # two pushes never upload at the same time

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: '24'
          cache: 'npm'

      - run: npm ci
      - run: npm test
      - run: npm run build
        env:
          VITE_API_BASE_URL: \${{ vars.API_BASE_URL }}

      - uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: \${{ vars.AWS_DEPLOY_ROLE_ARN }}
          aws-region: us-east-1

      - name: Upload (assets first, then index.html) and invalidate
        run: |
          aws s3 sync dist/assets "s3://\${{ vars.S3_BUCKET }}/assets" \\
            --cache-control "public, max-age=31536000, immutable"
          aws s3 sync dist "s3://\${{ vars.S3_BUCKET }}" \\
            --exclude "assets/*" --cache-control "no-cache" --delete
          aws cloudfront create-invalidation \\
            --distribution-id "\${{ vars.CLOUDFRONT_ID }}" --paths "/*"
\`\`\`

The bucket name, distribution ID and role ARN are not secrets, so they live in repository **variables** (\`vars.*\`), not secrets. The \`permissions: id-token: write\` line is the one people forget; without it the credentials step fails with "Could not load credentials".

#### 5.4.3 Multi-Environment Deployment

One workflow, three environments. A **GitHub Environment** holds its own variables and secrets and can require a reviewer's approval, so production values exist only for jobs that deploy from \`main\`.

\`\`\`yaml
name: Deploy

on:
  push:
    branches:
      - develop      # → development
      - qa           # → qa
      - main         # → production

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: \${{ github.ref_name == 'main' && 'production' || github.ref_name == 'qa' && 'qa' || 'development' }}
    concurrency: deploy-\${{ github.ref_name }}
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: '24', cache: 'npm' }
      - run: npm ci

      - name: Build with this environment's config
        run: npm run build
        env:
          VITE_API_BASE_URL: \${{ vars.API_BASE_URL }}

      - uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: \${{ vars.AWS_DEPLOY_ROLE_ARN }}
          aws-region: us-east-1

      - name: Deploy
        run: |
          aws s3 sync dist/assets "s3://\${{ vars.S3_BUCKET }}/assets" --cache-control "public, max-age=31536000, immutable"
          aws s3 sync dist "s3://\${{ vars.S3_BUCKET }}" --exclude "assets/*" --cache-control "no-cache" --delete
          aws cloudfront create-invalidation --distribution-id "\${{ vars.CLOUDFRONT_ID }}" --paths "/*"
\`\`\`

Each environment has its own \`AWS_DEPLOY_ROLE_ARN\`, and each role's trust policy names its environment (\`…:environment:production\`), so a job on \`develop\` cannot assume the production role even if someone edits the workflow.

#### 5.4.4 AWS CodePipeline (Alternative)

If the team's source and CI already live in AWS, CodePipeline does the same job. Its build step is a CodeBuild project driven by a \`buildspec.yml\`:

\`\`\`text
Source (GitHub via CodeConnections, or CodeCommit)
  → Build (CodeBuild: npm ci, npm run build, upload, invalidate)
\`\`\`

\`\`\`yaml
# buildspec.yml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 24
    commands:
      - npm ci
  build:
    commands:
      - npm run build
  post_build:
    commands:
      - aws s3 sync dist/assets "s3://\${S3_BUCKET}/assets" --cache-control "public, max-age=31536000, immutable"
      - aws s3 sync dist "s3://\${S3_BUCKET}" --exclude "assets/*" --cache-control "no-cache" --delete
      - aws cloudfront create-invalidation --distribution-id "\${CLOUDFRONT_ID}" --paths "/*"
\`\`\`

CodeBuild runs with its own IAM service role, so no credentials appear anywhere; give that role the same permissions as §5.4.1 step 3. The [AWS CodePipeline & CodeBuild guide](/devops/aws-cicd) covers pipelines in depth.

---

## 6. AWS Amplify

### 6.1 Setup

For hosting a static SPA you need no CLI: in the console choose **Amplify → Create new app → GitHub**, pick the repository and branch, and Amplify detects the build settings. Every push to that branch then builds and deploys, and you can turn on a preview URL per pull request.

The old Amplify CLI (\`@aws-amplify/cli\`, \`amplify init\`) belongs to **Amplify Gen 1**, which is in maintenance mode and reaches end of life on May 1, 2027. Amplify Gen 2 is about defining a backend in TypeScript; a frontend-only app does not need it.

### 6.2 amplify.yml

\`\`\`yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
\`\`\`

Custom headers no longer belong in \`amplify.yml\` (that form is legacy). Put them in \`customHttp.yml\` in the project root (or in the console under Hosting > Custom headers), then redeploy for them to take effect:

\`\`\`yaml
# customHttp.yml
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'Strict-Transport-Security'
        value: 'max-age=31536000; includeSubDomains'
      - key: 'X-Content-Type-Options'
        value: 'nosniff'
      - key: 'X-Frame-Options'
        value: 'DENY'
\`\`\`

### 6.3 Amplify Rewrites (SPA Routing)

This rewrite sends every path that does not end in a known file extension to \`index.html\`, the same idea as the CloudFront Function in §5.2 Step 7:

\`\`\`json
[
  {
    "source": "</^[^.]+$|\\\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>",
    "target": "/index.html",
    "status": "200"
  }
]
\`\`\`

### 6.4 Amplify vs S3 + CloudFront

| Feature | Amplify | S3 + CloudFront |
|---------|---------|----------------|
| Setup time | 5 minutes | 30–60 minutes |
| CI/CD | Built in (git push = deploy) | You write it (GitHub Actions / CodePipeline) |
| Branch and PR previews | Yes | Build it yourself |
| Custom headers | \`customHttp.yml\` | Full control (response headers policy, Functions) |
| WAF | Yes (added March 2025, extra monthly fee) | Yes |
| Serving cost | $0.15 per GB after 15 GB free; builds $0.01 per minute after 1,000 free | CloudFront rates (§14) |
| IaC | Console or Amplify Gen 2 | CDK / CloudFormation / Terraform |

---

## 7. The Same App on Every Platform

Each platform section above expressed the same three rules from §1.3 in its own way. Here they are side by side for one app, PrepHub from §3:

| PrepHub's need | GitHub Pages (today) | Cloudflare Workers | S3 + CloudFront | Amplify |
|----------------|----------------------|--------------------|-----------------|---------|
| Deep links | Route shells + \`404.html\` trick | \`not_found_handling: "single-page-application"\` | Error responses or a CloudFront Function | Rewrite rule |
| Cache headers per file | Fixed \`max-age=600\` | \`_headers\` | Set on upload (§5.2 Step 9) | \`customHttp.yml\` |
| Security headers | Not possible | \`_headers\` | Response headers policy | \`customHttp.yml\` |
| Who builds | GitHub Actions | GitHub Actions | GitHub Actions or CodePipeline | Amplify |
| CI credentials | Built-in \`GITHUB_TOKEN\` | API token secret | OIDC role | None (Amplify reads the repository) |
| Preview per pull request | Not built in | \`wrangler versions upload\` | Build it yourself | Built in |
| Custom domain | CNAME file + DNS record | Custom domain on the Worker | ACM + Route 53 alias | Built in |
| Monthly cost | $0 | $0 | Roughly $0.50 (hosted zone) | Per GB served after 15 GB |

The trade-off is visible in the table. GitHub Pages costs nothing and needs no credentials, but two of the three rules from §1.3 have to be worked around in code (route shells, the 404 redirect, a service worker). On Cloudflare Workers the same app would delete \`generate-route-shells.js\` and \`404.html\`, set a one-year cache on \`assets/\` and add security headers with one \`_headers\` file, at the price of creating an API token and moving the deploy step to \`wrangler-action\`.

---

## 8. Environment Variables and Config

### 8.1 Build-Time Variables (Vite)

A frontend has no server process to read environment variables from at request time. Vite instead **copies the values into the JavaScript while building**, so the built file literally contains \`"https://api.example.com"\`. Only variables starting with \`VITE_\` are copied — that prefix is a safety catch, so a server secret sitting in the same \`.env\` file is not shipped to every browser by accident. The consequence to remember: anything in a \`VITE_\` variable is public.

\`\`\`bash
# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_CDN_BASE_URL=https://cdn.example.com/data
VITE_GOOGLE_MAPS_API_KEY=AIza...

# Vite replaces these at BUILD time (embedded in JS bundle)
# They are NOT secret — anyone can see them in the browser
\`\`\`

Because the values are baked in where the build runs, set them on the build step in CI (as every workflow above does), not in the hosting provider's dashboard.

### 8.2 Per-Environment Builds

\`\`\`bash
# Option 1: .env files per environment
.env.development        # VITE_API_BASE_URL=http://localhost:4000
.env.staging            # VITE_API_BASE_URL=https://staging-api.example.com
.env.production         # VITE_API_BASE_URL=https://api.example.com

# Build with specific mode (loads .env.staging)
npx vite build --mode staging

# Option 2: CI environment variables (preferred)
# Set VITE_API_BASE_URL per GitHub Environment (§5.4.3); Vite reads process.env during the build
\`\`\`

Vite chooses which \`.env.[mode]\` file to load from the \`--mode\` flag; there is no environment variable that selects the mode, so if your \`build\` script wraps other steps, pass the flag through (\`npm run build -- --mode staging\`). Either way the result is one build per environment: the same code, compiled several times with different values baked in. Option 2 is preferred because the values live in the CI system's per-environment settings rather than in files committed to the repository.

### 8.3 Runtime Config (No Rebuild)

\`\`\`text
// public/config.js (plain JavaScript, no <script> tags)
window.__APP_CONFIG__ = {
  API_BASE_URL: 'https://api.example.com',
  FEATURE_FLAGS: { newDashboard: true },
};
\`\`\`

\`\`\`html
<!-- index.html: load config.js before the app's module script -->
<script src="/config.js"><\/script>
<script type="module" src="/src/main.tsx"><\/script>
\`\`\`

\`\`\`ts
// In app code
const config = window.__APP_CONFIG__;
\`\`\`

This lets you change config without rebuilding: replace \`config.js\` in the bucket (or redeploy just that file). It also means one build can be promoted unchanged from QA to production, so what you tested is exactly what ships. Two things make it work: \`config.js\` must be loaded by a plain \`<script>\` tag **before** the app bundle, so the value exists when the app starts; and it must be revalidated on every request like \`index.html\`, because its name never changes. The upload in §5.2 Step 9 already does that, since \`config.js\` sits outside \`assets/\`.

---

## 9. Caching Strategy

Every caching decision follows from rule 2 in §1.3:

\`\`\`text
index.html                 → no-cache: keep a copy, but revalidate on every visit
  ↓ loads
assets/index-a1b2c3.js     → public, max-age=31536000, immutable: the name changes when the content does
assets/logo-9f8e7d.png     → same (Vite hashes imported images too)
favicon.ico, robots.txt    → no-cache (copied from public/, unhashed)
config.js                  → no-cache (its whole point is to change without a rebuild)
\`\`\`

\`immutable\` tells the browser not to revalidate the file even when the user presses reload, which saves a request per asset on every refresh.

A returning visitor, the day after a deploy that changed nothing:

\`\`\`mermaid
sequenceDiagram
  autonumber
  participant B as Browser cache
  participant CDN as CDN
  B->>CDN: GET /index.html, If-None-Match: "abc"
  CDN-->>B: 304 Not Modified (a few hundred bytes)
  Note over B: index.html still points at index-a1b2c3.js
  B->>B: index-a1b2c3.js is immutable, use the local copy, no request
  Note over B,CDN: After a real deploy, step 2 is a 200 with the new index.html,<br/>which names new files, so those are fetched once
\`\`\`

**On AWS** there are two caches: the browser's and CloudFront's. CloudFront's **CachingOptimized** policy follows each file's \`Cache-Control\` header within its limits (minimum 1 second, maximum one year, 24 hours when the file has no header), compresses responses, and leaves query strings, headers and cookies out of the cache key. So the headers set during upload (§5.2 Step 9) drive both caches, and the invalidation after each deploy makes the edges drop their copy of \`index.html\` immediately. Invalidating \`/*\` counts as one path; the first 1,000 paths a month are free per account, then $0.005 per path.

**On Cloudflare**, static files default to \`max-age=0, must-revalidate\` with an \`ETag\`, so new HTML is picked up immediately without a purge; the \`_headers\` rule in §4.2 adds the long cache for \`assets/\`.

If you also proxy an API through the same CloudFront distribution, give that path its own behavior with the **CachingDisabled** policy and an origin request policy that forwards what the API needs (for example \`AllViewerExceptHostHeader\`), so responses for one user are never cached for another.

---

## 10. Security

A static site has no server code to attack, so the realistic threats are someone reading or overwriting your files, someone tampering with traffic, and a script injected into your page.

### 10.1 Storage and Deploy Access

\`\`\`text
1. Block ALL public access on the bucket; only CloudFront reads it, via OAC
2. Keep default encryption (SSE-S3) on
3. The deploy role can write to this one bucket and invalidate this one distribution, nothing else (§5.4.1)
4. CI uses OIDC on AWS; on Cloudflare, a token scoped to one account, stored as a GitHub secret
5. Turn on S3 versioning if you want to recover from a bad upload by restoring previous object versions
\`\`\`

### 10.2 Transport and Headers

\`\`\`text
1. Redirect HTTP to HTTPS (always)
2. TLS 1.2 or newer (CloudFront security policy TLSv1.2_2021)
3. AWS WAF on the distribution for rate limiting and bot blocking (optional)
4. Security headers (CloudFront response headers policy, or _headers on Cloudflare):
   - Strict-Transport-Security: max-age=63072000; includeSubDomains
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - Content-Security-Policy: default-src 'self'; ...
   - Referrer-Policy: strict-origin-when-cross-origin
\`\`\`

What each of these buys you:

- **WAF** (Web Application Firewall) inspects requests at CloudFront before they reach anything else, and blocks the ones matching rules such as "more than N requests a minute from one IP". For a purely static site its main value is rate limiting and bot blocking, since there is no database to inject into. Cloudflare applies DDoS protection to every site by default.
- **\`Strict-Transport-Security\`** (HSTS) tells the browser to use HTTPS for this domain for the next \`max-age\` seconds, even if someone types \`http://\` or follows an old link, so nobody can downgrade the connection on a café Wi-Fi.
- **\`X-Content-Type-Options: nosniff\`** stops the browser guessing a file's type from its contents, so an uploaded "image" cannot be run as a script.
- **\`X-Frame-Options: DENY\`** forbids other sites from loading your page in an \`<iframe>\`, which blocks clickjacking (a hostile page overlaying your buttons with invisible ones).
- **\`Content-Security-Policy\`** lists where scripts, styles and requests may come from; it is the main defence if an attacker manages to inject a script (see Q15).
- **\`Referrer-Policy\`** limits how much of your URL is sent to other sites when a user follows a link.
- **\`X-XSS-Protection\`** is a legacy header: it switched on a filter that modern browsers have removed, and the filter itself could introduce vulnerabilities into otherwise safe pages. Current OWASP guidance is to omit it or explicitly turn it off with \`0\`, and rely on CSP instead. The CDK example below sends \`0\` (\`protection: false\`).

### 10.3 CloudFront Response Headers Policy

\`\`\`ts
import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

// Inside FrontendStack's constructor (§5.3); attach it with
// defaultBehavior: { ..., responseHeadersPolicy: headersPolicy }
const headersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
  securityHeadersBehavior: {
    strictTransportSecurity: {
      override: true,
      accessControlMaxAge: cdk.Duration.days(730),
      includeSubdomains: true,
      preload: true,
    },
    contentTypeOptions: { override: true },
    frameOptions: {
      override: true,
      frameOption: cloudfront.HeadersFrameOption.DENY,
    },
    xssProtection: {
      override: true,
      protection: false,   // sends "X-XSS-Protection: 0" — the legacy filter is off
    },
    referrerPolicy: {
      override: true,
      referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
    },
  },
});
\`\`\`

---

## 11. Performance Optimization

A static SPA gets fast in two places: the build decides how many bytes there are, and the CDN decides how far they travel. Most of the work is already done by the defaults; the job is mostly not to undo it.

### 11.1 Build Optimization

Vite's production build already applies the standard techniques below, so there is little to switch on. What is worth doing is *measuring*: a bundle visualiser shows which dependency is taking the space, which is usually one large library imported for one small function.

\`\`\`bash
# Vite already does:
# - Tree shaking (remove unused code)
# - Code splitting (lazy routes → separate chunks)
# - Minification
# - CSS minification
# - Asset hashing (cache busting)

# Check bundle size
npx vite-bundle-visualizer
\`\`\`

### 11.2 CloudFront Optimization

Each item cuts either bytes (compression), round trips (HTTP/2 and HTTP/3 reuse one connection for many files) or trips back to S3 (cache TTLs, Origin Shield). Origin Shield is an extra caching layer in one region that all edge locations ask before they ask S3; it costs extra and mainly helps when many edges miss at once, so a small static site rarely needs it. On Cloudflare, compression, HTTP/2 and HTTP/3 are on by default.

\`\`\`text
1. Compression (gzip + Brotli): automatic with CachingOptimized
2. HTTP/2 and HTTP/3: enabled by default
3. Long cache on hashed assets (§9)
4. Price Class 100 if users are only in North America and Europe (cheaper; users elsewhere get slower responses)
5. Origin Shield (additional caching layer, reduces origin requests)
\`\`\`

### 11.3 S3 Transfer Acceleration

This speeds up **uploads to** the bucket by routing them through the nearest edge location, which helps a CI runner far from the bucket's region. It does nothing for your users, who never talk to S3 directly, and it is billed per GB uploaded.

\`\`\`bash
aws s3api put-bucket-accelerate-configuration \\
  --bucket my-app-frontend \\
  --accelerate-configuration Status=Enabled

aws s3 sync dist/ s3://my-app-frontend --endpoint-url https://s3-accelerate.amazonaws.com
\`\`\`

---

## 12. Monitoring

A static site has no server logs of its own, so the CDN is where you see what users experienced. Watch two things: the error rate, which tells you a deploy broke something, and the cache hit ratio, which tells you whether the CDN is doing its job or passing everything through to storage. On Cloudflare, the Worker's **Metrics** tab shows requests and errors without any setup.

### 12.1 CloudFront Metrics

The default metrics are free and cover traffic and errors. Cache hit rate and origin latency are **additional metrics** you turn on per distribution for a monthly fee. CloudFront publishes its metrics to CloudWatch in \`us-east-1\`, whatever region your bucket is in, so create alarms there.

\`\`\`text
Default (free):
  - Requests
  - Bytes downloaded / uploaded
  - Error rate (4xx, 5xx, total)

Additional metrics ($, per distribution):
  - Cache hit rate
  - Origin latency
  - Error rate by status code (401, 403, 404, 502, 503, 504)

Logs:
  - Standard logs to S3 — no CloudFront charge, you pay for S3 storage
  - Real-time logs (Kinesis) — charged
\`\`\`

### 12.2 CloudWatch Alarms

An alarm turns a metric into a notification. This one fires when more than 5% of requests fail for three periods in a row; requiring several periods avoids paging someone over a single bad minute.

\`\`\`ts
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';

// Inside FrontendStack's constructor (§5.3), with an SNS topic named alertsTopic
new cloudwatch.Alarm(this, 'HighErrorRate', {
  metric: distribution.metricTotalErrorRate(),
  threshold: 5,                            // 5% error rate
  evaluationPeriods: 3,
  comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
}).addAlarmAction(new actions.SnsAction(alertsTopic));
\`\`\`

### 12.3 CloudFront Access Logs

Metrics tell you *that* something went wrong; logs tell you which URL, from where, and whether it was a cache hit. Standard logs arrive in batches, not live, so use them for investigation and reporting rather than alerting.

\`\`\`text
Enable standard logging → S3 bucket
Each log line includes:
  - Date, time
  - Edge location
  - Client IP
  - URI
  - Status code
  - Bytes sent
  - Cache hit/miss
  - User-Agent
\`\`\`

---

## 13. Multi-Environment Setup and Rollbacks

### 13.1 Typical Setup

\`\`\`text
Environment   Branch    AWS: bucket / distribution     Cloudflare: Worker     Domain
development   develop   my-app-dev / E111...           my-app-dev             dev.example.com
qa            qa        my-app-qa  / E222...           my-app-qa              qa.example.com
production    main      my-app-prod / E333...          my-app                 app.example.com
\`\`\`

On AWS each environment is its own stack; on Cloudflare each is its own Worker. Wrangler can generate them from one config with an \`env\` block per environment (\`npx wrangler deploy --env qa\`).

### 13.2 CDK Multi-Stack

\`\`\`ts
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from './frontend-stack';   // the stack from §5.3

const app = new cdk.App();

new FrontendStack(app, 'FrontendDev', {
  env: { account: '123456789012', region: 'us-east-1' },
  stage: 'dev',
  domainName: 'dev.example.com',
  apiUrl: 'https://dev-api.example.com',
});

new FrontendStack(app, 'FrontendProd', {
  env: { account: '123456789012', region: 'us-east-1' },
  stage: 'prod',
  domainName: 'app.example.com',
  apiUrl: 'https://api.example.com',
});
\`\`\`

### 13.3 Rollbacks

A rollback is fastest when it only switches traffic back to files that already exist, and slowest when it has to rebuild an old commit:

| Platform | How to roll back | Speed |
|----------|------------------|-------|
| Cloudflare Workers | \`npx wrangler rollback <version-id>\` (recent versions are kept) | Seconds |
| Cloudflare Pages | Deployments → previous production deployment → **Rollback to this deployment** | Seconds |
| Amplify | Redeploy an earlier build from the branch's deployment history in the console | About a minute |
| S3 + CloudFront | Switch a versioned prefix back (Q11), or re-run the deploy for the last good commit | Seconds with prefixes, a full deploy without |
| GitHub Pages | Re-run the deploy workflow from the last good commit, or revert and push | A full deploy |

Two habits make any platform's rollback safer: keep each release's build output (for example with \`actions/upload-artifact\`), so going back never depends on rebuilding with today's dependencies, and keep the previous build's hashed chunks available, so tabs opened before the bad deploy keep working while you fix it (Q19, Q20).

---

## 14. Cost Comparison

### 14.1 S3 + CloudFront, Pay-as-You-Go

\`\`\`text
Assumptions: 100K visitors/month, 5 pages/visit, ~2 MB per visit (most of it cached in the browser)

S3:
  Storage: ~50 MB = ~$0.01
  Requests: CloudFront misses only, a few thousand GETs = cents

CloudFront (always-free allowance every month: 1 TB out, 10M requests, 2M Function invocations):
  Data transfer: 200 GB = $0
  Requests: 500K HTTPS = $0
  Invalidations: ~50 paths = $0 (first 1,000 paths/month free)

Route 53:
  Hosted zone: $0.50
  Alias queries to CloudFront: free

ACM certificate: free

Total: ~$0.50–1/month; beyond 1 TB, data transfer is about $0.085/GB in North America and Europe
\`\`\`

### 14.2 CloudFront Flat-Rate Plans

Since November 2025 CloudFront also sells **flat-rate plans**: a fixed monthly price that bundles CloudFront, WAF, DDoS protection, Route 53 DNS and some S3 storage, with no overage charges.

| Plan | Price per month | Requests | Data transfer |
|------|-----------------|----------|---------------|
| Free | $0 | 1M | 100 GB |
| Pro | $15 | 10M | 50 TB |
| Business | $200 | 125M | 50 TB |
| Premium | $1,000 | 500M | 50 TB |

For a small SPA, pay-as-you-go's free allowance is more generous on data (1 TB vs 100 GB). The plans are worth it when you want a predictable bill or would otherwise pay separately for WAF rules.

### 14.3 Cloudflare

Requests for static assets on Workers are **free and unlimited** on every plan; only requests that run Worker code are billed, and an assets-only Worker has none. Custom domains and certificates are free. So the same 100K-visitor SPA costs $0, which is the strongest argument for Cloudflare when you do not need anything AWS-specific.

### 14.4 Cost Optimization on AWS

\`\`\`text
1. Price Class 100: excludes the most expensive edge locations; the saving depends on how much traffic came from them
2. Maximise cache hit ratio: fewer requests reach S3
3. Compression (gzip/Brotli): less data transferred
4. Immutable cache headers on hashed assets: repeat visitors download almost nothing
5. A wildcard invalidation (/*) is one path, so invalidation cost is rarely the issue
\`\`\`

---

## 15. Interview Questions & Answers

### Beginner

---

**Q1: How do you deploy a React SPA on AWS?**

The standard approach: **S3 + CloudFront**.

Short answer: put the built files in a private S3 bucket and serve them through CloudFront. S3 is cheap, durable file storage; CloudFront is the CDN in front of it that adds HTTPS, caching near the user and the routing an SPA needs.

1. Build the React app (\`npm run build\`) to generate static files
2. Create a private S3 bucket (no public access — only CloudFront may read it, via OAC)
3. Request an ACM certificate in us-east-1
4. Create a CloudFront distribution with the bucket as its origin, OAC, HTTPS redirect, your domain and the certificate
5. Configure SPA routing: 403/404 → \`/index.html\` with 200, or a CloudFront Function
6. Point your domain at CloudFront with Route 53 alias records
7. Upload assets first and \`index.html\` last, then invalidate (§5.2 Step 9)

CloudFront serves as the CDN — caches files globally for fast delivery and handles HTTPS.

---

**Q2: Why do you need CloudFront? Can't you just use S3?**

S3 static website hosting works but has limitations:
- **No HTTPS** — the website endpoint serves HTTP only, so there is no HTTPS on your custom domain either
- **No CDN** — files are served from a single region, so distant users wait longer
- **Public bucket** — website hosting requires anyone to be able to read every file
- **No compression** (gzip/Brotli)

CloudFront adds: global CDN (750+ points of presence), HTTPS, compression, caching, security headers, WAF integration, and HTTP/2+3 support. It's practically required for production.

---

**Q3: How do you handle SPA routing on S3/CloudFront?**

SPAs use client-side routing (React Router). When a user navigates to \`/dashboard/users\` and refreshes, the browser requests that path from the server. Since there's no actual file at that path, you get a 403/404.

Solution: Configure CloudFront custom error responses to serve \`/index.html\` for 403 and 404 errors with a 200 status code. React Router then reads the URL and renders the correct page.

The 403 matters more than the 404: a private bucket answers "no such file" with 403 Forbidden, because it will not reveal to a caller without list permission whether the file exists. The cost of this catch-all is that a genuinely missing asset also returns \`index.html\`, so a wrong script path shows up as a confusing parse error rather than a clean 404. A CloudFront Function that rewrites only extensionless paths to \`/index.html\` avoids that (§5.2 Step 7), and Amplify's rewrite rule works the same way (§6.3).

---

**Q4: What is Origin Access Control (OAC)?**

OAC is a CloudFront feature that restricts access to your S3 bucket — only CloudFront can read the files. Users can't bypass CloudFront by accessing S3 directly.

Without OAC: Anyone could access \`my-bucket.s3.amazonaws.com/index.html\` directly, bypassing your CDN, caching, and security.

With OAC: S3 bucket is fully private. Only the specific CloudFront distribution can read from it (enforced by S3 bucket policy).

---

**Q5: How does caching work for an SPA?**

Two-tier strategy:
- **index.html**: \`no-cache\` — keep a copy, but revalidate with the origin on every visit. This is the entry point that references hashed asset files.
- **JS/CSS assets** (e.g., \`index-abc123.js\`): \`max-age=31536000, immutable\` — cached for 1 year. The content hash in the filename ensures a new build produces a new filename, so old caches are irrelevant.

When you deploy: index.html changes → user gets new index.html → which loads new hashed assets → old assets are never requested again.

> [!FOLLOWUP]
> After a deploy, some users still see the old version (or old JavaScript) while others see the new one. Why?
>
> A hashed file can't be stale, because a new build gives it a new name. So a user running old code was either handed an old \`index.html\` or never asked for a new one. Check, in this order:
>
> | Cause | How to spot it | Fix |
> |---|---|---|
> | \`index.html\` cached with a \`max-age\`, by the browser or the CDN | the response headers for \`/\` show \`max-age\` or a CDN \`Age\` header, and the HTML names last build's files | \`Cache-Control: no-cache\` on HTML; invalidate \`/index.html\` on the CDN after each deploy (Q8) |
> | The tab was open before the deploy | only users who never reloaded; navigating to a lazy route fails | it keeps running the old bundle until it reloads; handle the failed chunk (Q19) |
> | A service worker serves the precached shell | DevTools → Application shows a new worker "waiting to activate" | update and reload on the next visit, or ask the user to reload ([Browser APIs, tricky Q8](/frontend/browser-apis#17-tricky-questions)) |
> | A file without a content hash (\`app.js\`, \`config.js\`) cached for a long time | the old file comes back from cache although the HTML is new | add the hash, or give that file \`no-cache\` too |

---

### Intermediate

---

**Q6: How would you set up CI/CD for frontend deployment?**

Using GitHub Actions:
1. **Trigger**: Push to \`main\` branch
2. **Build**: Install deps (\`npm ci\`), test, build (\`npm run build\`) with the environment's \`VITE_*\` values
3. **Credentials**: OIDC (OpenID Connect) — GitHub proves the job's repository and branch to AWS and receives short-lived credentials for an IAM role whose trust policy names that repository and branch. No long-lived key is stored in GitHub, so there is nothing to leak or rotate
4. **Deploy** in two steps: \`dist/assets\` first with \`public, max-age=31536000, immutable\` and no \`--delete\`, then everything else with \`no-cache\` and \`--delete\`
5. **Invalidate**: \`aws cloudfront create-invalidation --paths "/*"\` (one path, free)

The order of the upload matters: hashed assets first and \`index.html\` last, so the new page never points at files that are not there yet. Invalidation is needed only because \`index.html\` keeps the same name; the hashed files never need it.

For multiple environments: Use GitHub Environments with branch protection rules — \`develop\` deploys to dev, \`main\` to production. A GitHub Environment holds its own variables and secrets and can require an approval, and each environment's IAM role trusts only that environment, so production credentials are only available to jobs that deploy from \`main\`. On Cloudflare the same workflow ends with \`cloudflare/wrangler-action\` instead of the upload and invalidation steps (§4.4).

---

**Q7: How do you handle environment variables in a frontend deployment?**

Frontend env vars are embedded at **build time** (Vite's \`VITE_*\` variables). They're baked into the JavaScript bundle, which has two consequences: anyone can read them in the browser, so they must never hold a secret; and changing one means rebuilding.

Options:
1. **Per-environment builds**: Different CI/CD pipelines set different env vars, producing different builds for dev/staging/prod
2. **Runtime config**: Load config from a \`config.js\` file that's separate from the build. Change the file in S3 without rebuilding.
3. **API-driven config**: Fetch config from an API on app startup

Option 1 is most common and simplest. Option 2 is useful when you need to change config without rebuilding, and it lets you build once and promote the same artifact from QA to production — what you tested is byte-for-byte what ships. Option 3 costs an extra request before the app can start, so it is usually reserved for values that genuinely change often, such as feature flags.

**Precautions with \`.env\` files**, the usual follow-up:

1. **Assume every value the client reads is public.** Vite exposes only variables named \`VITE_*\` to client code, and their values are written into the bundle at build time. The Vite docs say they "should not contain sensitive information such as API keys". A secret key belongs on a server, a serverless function or an edge function that the browser calls.
2. **Keep secrets out of git.** Put local values in \`.env.local\` or \`.env.[mode].local\`, and add \`*.local\` to \`.gitignore\`, as the Vite docs advise. Commit a \`.env.example\` with names and dummy values, so a new developer knows what to set.
3. **Set CI and production values in the CI system or host** (GitHub Environments, Cloudflare or AWS secrets), not in a committed \`.env.production\`.
4. **Don't widen the prefix.** \`envPrefix\` decides which variables reach the client. Vite throws an error on \`''\`, which would expose every variable, but a short prefix shared with CI variables leaks the same way.
5. **Treat a leaked key as compromised.** Deleting it from the repository leaves it in git history and in bundles already deployed. Rotate it, then turn on secret scanning (GitHub push protection) so the next one is blocked before it lands.

---

**Q8: What is CloudFront invalidation and when do you need it?**

CloudFront caches files at edge locations. When you update files in S3, CloudFront still serves the old cached versions until the cache expires (TTL).

Invalidation forces CloudFront to fetch new versions from S3 immediately. You need it after every deployment for files without content hashes (mainly \`index.html\`).

\`\`\`bash
aws cloudfront create-invalidation --distribution-id E123 --paths "/index.html"
\`\`\`

Hashed assets (JS/CSS) don't need invalidation — new builds produce new filenames, so they're never cached under the old name. Cost is rarely a concern: the first 1,000 paths a month are free and a wildcard such as \`/*\` counts as one path. Cloudflare has no equivalent step for static assets, because it revalidates them on each request by default.

---

**Q9: Compare S3+CloudFront vs AWS Amplify for frontend hosting.**

Short answer: they are the same kind of thing underneath — files on a CDN — and the choice is about who owns the plumbing. With S3 + CloudFront you own the bucket, the distribution and the pipeline, so everything is configurable and you pay only raw AWS prices. With Amplify, AWS owns them, so a new app is live in minutes, but you can only change what Amplify exposes.

The reasons behind each trade-off (the feature-by-feature table is in §6.4):

- **Control.** Amplify runs a CloudFront distribution for you, but you cannot edit it. So cache policies, CloudFront Functions (for A/B tests or blue-green switches, Q11 and Q13) and origin groups for failover (Q12) are only available when you own the distribution yourself.
- **Cost.** S3 + CloudFront bills storage, requests and data transfer at CloudFront's rates, with 1 TB a month free. Amplify bills $0.15 per GB served after 15 GB, plus build minutes, so at low traffic the difference is pennies and at high traffic it becomes a real line item.
- **Delivery workflow.** Amplify builds on every push and gives each branch or pull request its own preview URL. With S3 + CloudFront you write that pipeline yourself (§5.4), and preview environments mean a bucket or prefix per branch plus the wiring to create and delete them.
- **Setup and ownership.** Amplify is minutes in the console. S3 + CloudFront takes 30–60 minutes the first time and is best written as IaC (§5.3), which is also what makes it reviewable and reproducible across environments.

Choose S3 + CloudFront when you need edge logic, specific caching behaviour, multi-region failover, or when the infrastructure must be reviewed as code for compliance. Choose Amplify when a team wants previews and deploy-on-push without owning a pipeline, which covers most prototypes and many small-to-medium production apps. Both can sit behind AWS WAF, so security alone is no longer a reason to pick one.

---

**Q10: How do you secure a frontend deployment on AWS?**

Short answer: lock the bucket so only CloudFront can read it, force HTTPS, send security headers from CloudFront, and give the deploy pipeline the smallest, shortest-lived credentials possible. A static site has no server code to attack, so the realistic threats are someone reading or overwriting your bucket, someone tampering with traffic, and a script injected into your page.

1. **S3**: Block all public access, use OAC (CloudFront-only access) — nobody can bypass CloudFront's HTTPS and headers by fetching from S3 directly
2. **HTTPS**: ACM certificate, redirect HTTP to HTTPS
3. **TLS 1.2+**: CloudFront security policy, so old protocol versions with known weaknesses are refused
4. **Security headers**: HSTS (always use HTTPS for this domain), X-Content-Type-Options (no guessing file types), X-Frame-Options (no embedding in other sites' iframes), CSP (which script sources may run) via CloudFront response headers policy
5. **WAF**: Rate limiting, geo-blocking, SQL injection / XSS protection — for a static site, mostly rate limiting and bot blocking
6. **Access control**: IAM roles with least privilege for deployment — the deploy role can write to this one bucket and invalidate this one distribution, nothing else
7. **OIDC for CI/CD**: Use GitHub OIDC instead of long-lived IAM keys, because a leaked long-lived key lets anyone overwrite your site until someone notices and revokes it

---

### Advanced

---

**Q11: How would you implement blue-green deployment for a frontend?**

Short answer: keep the current version ("blue") and the new version ("green") side by side in S3, test green, then switch CloudFront to serve green. Rollback is switching back, which is much faster and safer than redeploying the old build. For a static frontend both versions are just folders of files, so keeping two of them costs almost nothing.

Three approaches, which differ only in *what* you flip:

**Approach 1: Two S3 buckets**
\`\`\`text
Blue bucket  (current production)  ← CloudFront points here
Green bucket (new version)         ← deployed and tested

Switch: Update CloudFront origin from blue to green
Rollback: Switch back to blue
\`\`\`

**Approach 2: Versioned prefixes**
\`\`\`text
S3: /v1/index.html, /v1/assets/...  (current)
S3: /v2/index.html, /v2/assets/...  (new)

Switch: Update CloudFront origin path from /v1 to /v2
\`\`\`

**Approach 3: CloudFront Functions for routing**
\`\`\`ts
// CloudFront Function (viewer-request)
function handler(event) {
  const version = 'v2';  // change this to switch
  event.request.uri = \`/\${version}\${event.request.uri}\`;
  return event.request;
}
\`\`\`

Two details make the switch honest. A change to the distribution's origin or origin path is not instant — it has to propagate to every edge location — and the edges still hold cached copies of the old \`index.html\`, so pair the switch with an invalidation of the HTML. And users with the old page already open still request old asset URLs, which is another reason to keep the blue version's files around after the switch rather than deleting them.

On Cloudflare, blue-green is built in: every deploy is a new version, \`wrangler versions upload\` stages one without sending traffic to it, and \`wrangler rollback\` switches back (Q20).

---

**Q12: How do you implement a multi-region frontend for disaster recovery?**

\`\`\`text
Route 53 (failover routing)
  ├→ Primary:   CloudFront (us-east-1) → S3 (us-east-1)
  └→ Secondary: CloudFront (eu-west-1) → S3 (eu-west-1)

Setup:
1. S3 cross-region replication (auto-sync buckets)
2. Two CloudFront distributions (one per region)
3. Route 53 health checks on primary
4. Failover routing policy: if primary is unhealthy, route to secondary
\`\`\`

Start from what can actually fail. CloudFront has no "region" — it is one global service running at every edge location — so the region labels above really describe where each **origin bucket** lives. The component that sits in one region is S3. That is why, for most SPAs, a single CloudFront distribution is sufficient, and multi-region setup is mainly for S3 origin redundancy.

The simpler way to get that redundancy is a CloudFront **origin group**: one distribution with a primary and a secondary bucket (kept in sync by S3 cross-region replication), where CloudFront retries the secondary automatically when the primary returns errors. It avoids running two distributions and DNS failover between them, which is awkward because CloudFront does not let two distributions claim the same custom domain name.

---

**Q13: How would you handle A/B testing with CloudFront?**

Short answer: build and upload both variants into separate folders, and use a CloudFront Function — a small piece of JavaScript CloudFront runs on every request at the edge — to rewrite each request to \`/a/...\` or \`/b/...\`. A cookie keeps each user on the same variant, because a user who flips between versions on every visit ruins both the experience and the experiment.

\`\`\`ts
// CloudFront Function (viewer-request)
function handler(event) {
  const request = event.request;
  const cookies = request.cookies;

  // Check for existing assignment
  if (cookies['ab-test']) {
    const variant = cookies['ab-test'].value;
    request.uri = \`/\${variant}\${request.uri}\`;
    return request;
  }

  // Assign variant (50/50)
  const variant = Math.random() < 0.5 ? 'a' : 'b';
  request.uri = \`/\${variant}\${request.uri}\`;

  // Set cookie via response header (in viewer-response function)
  request.headers['x-ab-variant'] = { value: variant };
  return request;
}
\`\`\`

S3 structure:
\`\`\`text
/a/index.html, /a/assets/...   (variant A)
/b/index.html, /b/assets/...   (variant B)
\`\`\`

The function runs at *viewer request*, before the cache lookup, so the rewritten path becomes part of the cache key — \`/a/index.html\` and \`/b/index.html\` are cached separately and nobody is served the other variant's copy. The function can only change the request, so the cookie that pins a new user to a variant has to be set in a second, *viewer-response* function (that is what the \`x-ab-variant\` header is passing along).

---

**Q14: How do you optimize CloudFront cache hit ratio?**

The cache hit ratio is the share of requests CloudFront answers from its own copy without going back to S3. The idea behind every item below is the **cache key** — the set of request details CloudFront uses to decide whether two requests are "the same file". Every extra thing in the key (a query parameter, a header, a cookie) splits one cached copy into many, and each copy has to be fetched from the origin separately.

1. **Normalize query strings**: Remove unnecessary query params or sort them consistently
2. **Minimize cache key**: Don't include headers or cookies in cache key unless necessary
3. **Set proper Cache-Control headers**: Long TTLs for static assets, short/none for dynamic
4. **Enable Origin Shield**: Additional caching layer between edge and origin, reduces cache misses
5. **Use consistent URLs**: Avoid URL variations for the same content
6. **Pre-warm cache**: Generate traffic to popular paths after deployment

Monitor cache hit ratio in CloudWatch — aim for 90%+ for static sites.

---

**Q15: How do you handle Content Security Policy (CSP) for an SPA?**

A CSP is a response header listing where the page may load scripts, styles, images and network requests from. If an attacker manages to inject a \`<script>\`, the browser refuses to run it unless its source is on the list, so CSP is the safety net behind every other XSS defence. For a static SPA on CloudFront you set it once, in the response headers policy (on Cloudflare, in \`_headers\`).

\`\`\`text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https://*.amazonaws.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com https://*.amazonaws.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
\`\`\`

Set via CloudFront Response Headers Policy. Challenges with SPAs:
- A default Vite production build does **not** need \`'unsafe-inline'\` for scripts: it emits \`index.html\` with an external \`<script type="module" src="/assets/index-….js">\`. Inline scripts come from what you add — \`@vitejs/plugin-legacy\`, an analytics snippet pasted into \`index.html\`, or a theme script that must run before first paint
- CSS-in-JS may need \`'unsafe-inline'\` for styles
- Google Maps, analytics, third-party scripts need explicit allow
- Test thoroughly — overly strict CSP breaks functionality

\`'unsafe-inline'\` in \`script-src\` is the expensive compromise: it allows any inline script to run, which is exactly what an injected script usually is, so it removes most of CSP's protection against XSS. A nonce (a random value per response that legitimate \`<script>\` tags must carry) is the proper fix, but a static site served from S3 returns the same bytes to everyone and cannot generate a fresh nonce per response. The practical route is to check the built \`index.html\` and keep it free of inline scripts, so \`script-src\` can drop \`'unsafe-inline'\` entirely; the example above keeps it only to show where a third-party snippet would force it. If you cannot avoid one fixed inline script, a hash (\`'sha256-…'\` of that script's exact text) allows it without a per-response nonce.

Start with \`Content-Security-Policy-Report-Only\` to monitor before enforcing: the browser reports what *would* have been blocked without blocking it, so you find the third-party script you forgot before your users do.

---

**Q16: Compare deploying a React SPA to Cloudflare Workers vs S3 + CloudFront.**

Short answer: both put static files on a global CDN with HTTPS and SPA fallback. AWS makes you assemble it from five services and gives you fine-grained control inside the AWS account model; Cloudflare gives you the whole thing from one config file, with free static traffic, but needs your domain's DNS on Cloudflare.

- **Setup.** AWS: bucket, OAC, certificate in us-east-1, distribution, bucket policy, error responses, DNS (§5.2). Cloudflare: \`wrangler.jsonc\` with \`assets.directory\` and \`not_found_handling: "single-page-application"\`, then \`wrangler deploy\` (§4.2).
- **Deploys.** AWS needs the upload order (assets, then \`index.html\`) and an invalidation. Cloudflare switches to the new version atomically and revalidates static files by default, so neither step exists.
- **CI credentials.** AWS supports GitHub OIDC, so no secret is stored. Cloudflare needs a long-lived API token, so scope it to one account and the Workers permission.
- **Cost.** CloudFront has a 1 TB/month free allowance, then per GB. Cloudflare static asset requests are free and unlimited.
- **Old chunks.** On S3 you choose to keep the previous build's files. On Cloudflare, assume each deploy serves only its own files and handle \`ChunkLoadError\` in the app (Q19).
- **Fit.** Pick AWS when the rest of the system, compliance reviews and IAM live there, or when you need WAF rules, origin groups or CloudFront Functions. Pick Cloudflare for the least plumbing and cost, especially for side projects, marketing sites and SPAs that call an API hosted anywhere.

---

**Q17: How do you deploy a React app to Cloudflare from GitHub Actions?**

1. **Config** in the repository: \`wrangler.jsonc\` with \`name\`, \`compatibility_date\`, \`assets.directory: "./dist/"\` and \`not_found_handling: "single-page-application"\`; a \`public/_headers\` file for the long cache on \`/assets/*\` and security headers.
2. **Credentials**: a Cloudflare API token from the **Edit Cloudflare Workers** template, limited to one account, plus the account ID, stored as \`CLOUDFLARE_API_TOKEN\` and \`CLOUDFLARE_ACCOUNT_ID\` repository secrets. Cloudflare does not accept GitHub OIDC for this, which is why scoping the token matters.
3. **Workflow**: checkout, \`setup-node\`, \`npm ci\`, test, \`npm run build\` with the \`VITE_*\` values on that step, then \`cloudflare/wrangler-action@v4\` with \`command: deploy\`.
4. **Previews**: on \`pull_request\`, run \`versions upload --preview-alias pr-<number>\` instead, which publishes a version at its own URL without sending production traffic to it.

\`\`\`yaml
- uses: cloudflare/wrangler-action@v4
  with:
    apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: deploy
\`\`\`

The build must happen in GitHub Actions with the environment's values, because Vite bakes them into the bundle; variables set in the Cloudflare dashboard never reach a build that ran in GitHub.

---

**Q18: Cloudflare Workers static assets or Cloudflare Pages — which would you pick for a new project?**

Workers. Cloudflare's documentation now tells new projects to start on Workers and calls it its primary platform; Pages is still supported, but new features land in Workers first. For a static SPA they behave almost the same: both serve \`dist/\` from Cloudflare's network, both read \`_headers\`, and both fall back to \`index.html\` for unknown paths (Workers through \`not_found_handling\`, Pages automatically when there is no \`404.html\`).

Reasons you might still choose Pages: an existing Pages project; a team that wants a permanent URL for every deployment (\`<hash>.<project>.pages.dev\`) and branch aliases with no extra configuration; or DNS that must stay with another provider, since Pages accepts a subdomain CNAME from external DNS while a Worker custom domain needs the zone on Cloudflare. Moving later is a migration, not a setting.

---

**Q19: Right after a deploy, some users get \`ChunkLoadError\` or a blank page when they click a link. Why, and how do you fix it?**

Those users loaded the *previous* \`index.html\` before the deploy. It references the previous build's chunk names (\`Dashboard-1a2b3c.js\`). When they navigate to a lazily loaded route, the browser requests that old file, and if the deploy removed it, the request fails — or, on a host with SPA fallback, it gets \`index.html\` back and fails to parse it as JavaScript.

\`\`\`mermaid
sequenceDiagram
  autonumber
  participant Tab as Tab opened before the deploy
  participant Host as Host
  Note over Host: deploy replaces Dashboard-1a2b3c.js with Dashboard-9z8y7x.js
  Tab->>Host: GET /assets/Dashboard-1a2b3c.js
  Host-->>Tab: 404, or index.html via SPA fallback
  Tab->>Tab: ChunkLoadError, the route never renders
  Tab->>Host: reload once, GET /index.html
  Host-->>Tab: new index.html naming Dashboard-9z8y7x.js
\`\`\`

Two layers of fix:

1. **Keep old chunks for a while where you control storage.** On S3, upload \`assets/\` without \`--delete\` (and CDK \`BucketDeployment\` with \`prune: false\`), and prune builds older than a release or two in a separate job.
2. **Recover in the app**, which also covers hosts where each deploy serves only its own files, as you should assume on Cloudflare. Vite fires \`vite:preloadError\` when a dynamic import fails; reload once to pick up the new \`index.html\`:

\`\`\`text
window.addEventListener('vite:preloadError', (event) => {
  // Reload at most once per session, so a genuinely broken deploy can't loop
  if (sessionStorage.getItem('reloaded-after-deploy')) return;
  sessionStorage.setItem('reloaded-after-deploy', '1');
  event.preventDefault();          // stop Vite rethrowing the error
  window.location.reload();
});
\`\`\`

An error boundary around lazy routes that shows "A new version is available — reload" is the gentler variant of the same idea. \`index.html\` served with \`no-cache\` keeps the window small, because the next full page load always gets the current build.

---

**Q20: How do you roll back a bad frontend deploy?**

The fastest rollback switches traffic back to files that already exist; the slowest rebuilds an old commit.

- **Cloudflare Workers:** every deploy is a version. \`npx wrangler deployments list\` shows recent ones and \`npx wrangler rollback <version-id>\` makes one live again in seconds.
- **Cloudflare Pages:** in the project's Deployments list, choose a previous *production* deployment and **Rollback to this deployment**.
- **S3 + CloudFront:** nothing is versioned unless you design it. Options, fastest first: deploy each build under a versioned prefix and switch the origin path or a CloudFront Function back (Q11), then invalidate \`index.html\`; or re-run the deploy job for the last good commit, which takes as long as a build; or restore the previous \`index.html\` object version if bucket versioning is on — the old chunks it references are still there because assets are never deleted on upload.

Whatever the platform, keep the build artifact for each release (for example with \`actions/upload-artifact\`), so rolling back never depends on rebuilding with today's dependencies.

---

**Q21: GitHub Pages cannot rewrite paths. How do you make deep links in an SPA work there?**

GitHub Pages serves files from a branch and nothing else: no rewrite rules, no custom headers. A request for \`/settings/profile\` finds no file and gets the site's \`404.html\` with a 404 status. Two techniques, often combined (PrepHub uses both, §3.3):

1. **Route shells.** After the build, copy \`index.html\` to \`dist/<route>/index.html\` for every route the app knows. The deep link now hits a real file and gets a 200. GitHub first answers \`/settings/profile\` with a 301 to \`/settings/profile/\`, then serves the shell. This needs a list of routes at build time, so it suits apps whose routes are known in advance; it is not pre-rendering, since every shell is the same empty page.
2. **The \`404.html\` redirect trick.** Make \`404.html\` a tiny script that rewrites \`/settings/profile\` to \`/?/settings/profile\` and loads the root. A matching script in \`index.html\` turns the query string back into the real path with \`history.replaceState\` before the router starts. It works for any path, but costs a 404 response and an extra round trip on every deep link, and search engines see the 404 status.

Mentioning the second option's cost is the strong part of the answer: shells give known routes a clean 200, and the redirect trick is only the fallback for URLs nobody planned for. If you also need cache or security headers, the honest answer is a different host (§7).

---

### Debugging Production

---

**Q22: Your React app works perfectly in development but breaks after deployment, or throws an error only in production. How do you investigate?**

**Start by making the problem reproducible, then compare the two environments one difference at a time.**

1. **Run the production build locally:** \`npm run build\`, then \`npm run preview\` (\`vite preview\` serves \`dist/\` the way a static host would). If it breaks there too, the cause is the build. If it works there, the cause is the host, the network or the environment, and the next steps narrow that down.
2. **Read the real error.** Open the deployed site with DevTools: the Console for the exception, the Network tab for requests that fail (a 404 on a script, a CORS error, a call to \`/undefined/users\`). A minified stack trace like \`at a (index-9f3c.js:1:20417)\` needs source maps. Upload them to your error tracker on every deploy instead of serving them publicly (Vite's \`build.sourcemap: 'hidden'\`).
3. **Check the usual causes:**

| Cause | What you see | Fix |
|---|---|---|
| An environment variable missing at build time | requests to \`undefined/...\`; the feature flag is always off | CI sets the variable for the build, and the app validates required values at start-up (Q7) |
| Routing or base path | a blank page with 404s for \`/assets/...\`; refreshing a deep link gives 404 | set \`base\` for a sub-path; add the SPA fallback (Q3, Q21) |
| File-name case | the build fails on Linux CI but works on Windows and macOS | match the import to the file's exact case (\`./Button\` is not \`./button\`) |
| CORS or mixed content | the console shows a CORS or "blocked: mixed content" error | add the production origin to the API's CORS list; call the API over HTTPS |
| Content Security Policy | "Refused to execute inline script" | allow the source or remove the inline script (Q15) |
| Minification | \`TypeError: x is not a function\`, or logic keyed by a function or class name takes the wrong branch | don't depend on \`Function.name\` (example below) |
| Tree shaking dropped a side effect | a polyfill or a global CSS import is missing | \`"sideEffects": ["*.css", "./src/polyfills.js"]\` in \`package.json\` |
| Different dependency versions | works on one machine, breaks in CI | commit the lockfile and install with \`npm ci\` |
| Older browsers | only some users, on one browser | check the build target and the RUM breakdown by browser |

**The minification trap.** The dev server leaves names as written, and the production minifier shortens them, so code that reads a function's \`.name\` changes behaviour:

\`\`\`js
function AdminPanel() { return 'admin tools'; }
function UserPanel() { return 'user home'; }

const titles = { AdminPanel: 'Admin', UserPanel: 'Home' };

// Keyed by the function's name: right in development, wrong once minified
function titleForBroken(Component) {
  return titles[Component.name] ?? 'Untitled';
}

console.log(titleForBroken(AdminPanel));   // 'Admin'; minified, 'Untitled'
\`\`\`

Minified, \`AdminPanel\` becomes a one-letter name, so the lookup misses. Key by the function itself, which survives minification:

\`\`\`js
function AdminPanel() { return 'admin tools'; }
function UserPanel() { return 'user home'; }

// Keyed by reference: renaming the function changes nothing
const titles = new Map([[AdminPanel, 'Admin'], [UserPanel, 'Home']]);

function titleFor(Component) {
  return titles.get(Component) ?? 'Untitled';
}

console.log(titleFor(AdminPanel));   // 'Admin', minified or not
\`\`\`

---

**Q23: Why might an app behave differently after \`npm run build\` than under \`npm start\`?**

\`npm start\` (Create React App) and \`npm run dev\` (Vite) run a **development server**. \`npm run build\` produces the **production bundle** that users get. They are different programs that happen to read the same source. Create React App has been deprecated for new apps since February 2025, so in a current project the comparison is \`vite\` against \`vite build\`.

| Area | Development server | Production build |
|---|---|---|
| Modules | Vite serves each file on its own as a native ES module | bundled into chunks, with tree shaking and code splitting, so import order, circular imports and side-effect imports can behave differently |
| Names and code size | names as written | minified (Q22) |
| React | the development build: warnings, extra checks, and StrictMode running components and effects twice | the production build: no warnings, StrictMode is a no-op, faster |
| Mode | \`import.meta.env.DEV\` is \`true\`; \`.env.development\` is loaded | \`import.meta.env.PROD\` is \`true\`; \`.env.production\` is loaded, so \`if (import.meta.env.DEV)\` branches disappear |
| API calls | often through the dev server's \`server.proxy\`, so the browser sees one origin and CORS never comes up | straight to the API's origin, so CORS rules apply |
| Routing | the dev server answers every path with \`index.html\` | the host serves only real files unless you add a fallback (Q3) |
| CSS | injected per module as it is imported | extracted into files, so the order of rules (and which one wins) can change |

The habit that catches most of these: run \`npm run build && npm run preview\` before you push. The Vite docs call \`vite preview\` a local check of the build, not a production server.

---

**Q24: A developer says, "The app is slow only in production." What would you check first?**

**First, pin down what "slow" means:** which metric (slow first load is LCP; laggy clicks are INP; a slow server is TTFB), which pages and which users. Field data from real users (RUM, or the Chrome UX Report) answers that; a single lab run on a fast laptop doesn't ([Web Performance, lab vs field](/frontend/web-performance#3-lab-vs-field-data)).

The development build is slower than production, so "slow only in production" almost always means the **conditions** differ, not the code. Check what production has and localhost doesn't:

1. **The network and the host.** Look in DevTools → Network on the live site:
   - \`Content-Encoding\`: missing \`br\` or \`gzip\` means uncompressed JavaScript.
   - \`Cache-Control\`: \`no-store\` on hashed assets means a full download on every visit.
   - The CDN's cache status (\`cf-cache-status\`, \`X-Cache\`): constant misses mean every request goes to an origin that may be on another continent.
   - TTFB on the HTML itself.
2. **Real data.** A local database with 20 rows hides a slow query, an N+1 API (one request per item) and a table that renders 5,000 rows. Compare the API timings in the Network tab, and add a \`Server-Timing\` header so the browser shows where the server spent its time.
3. **Third-party scripts that only run in production:** analytics, a tag manager, a chat widget, A/B testing, session replay. Block them with DevTools request blocking and measure again.
4. **Real devices.** Users on mid-range phones run JavaScript several times slower than a developer laptop. Record a Performance trace with CPU throttling, and look for long tasks.
5. **What changed.** If it started on a date, compare that release's bundle with the previous one ([React Q85](/frontend/react-interview-questions#delivery-and-scale)), and check the deploy for a misconfiguration such as inline source maps or a development build.

## References

- [AWS CloudFront Developer Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide) — CDN documentation
- [Configuring OpenID Connect in AWS (GitHub Docs)](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) — the trust policy behind §5.4.1
- [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/) — \`assets\` config, SPA mode, \`_headers\`
- [Cloudflare Workers with GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/) — API token and \`wrangler-action\`
- [Cloudflare Pages](https://developers.cloudflare.com/pages/) — Direct Upload, previews and rollbacks
- [AWS Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html) — managed hosting with deploy-on-push
`;export{e as default};
