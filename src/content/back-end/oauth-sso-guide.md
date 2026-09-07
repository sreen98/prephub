# OAuth & SSO — Complete Guide

OAuth and SSO are the two acronyms developers most often confuse, conflate, and misuse — including in production. **OAuth is an authorization protocol** (it answers "what can this client do?"). **SSO is a user-experience pattern** (it answers "can the user log in once and reach many apps?"). They're related: most modern SSO is built ON TOP of OAuth (specifically OAuth 2.0 + OpenID Connect). But they're not the same thing, and getting them wrong is how production systems leak credentials.

This guide walks through both from first principles, covers the four OAuth grant types (and the two you should actually use in 2026), explains OpenID Connect, dissects the OAuth-vs-SSO confusion, and goes deep on the real-world failure modes interviewers love to probe.

## Table of Contents

- [1. The Problem OAuth Solves](#1-the-problem-oauth-solves)
- [2. OAuth 2.0 — Core Concepts](#2-oauth-20--core-concepts)
- [3. The Four Grant Types](#3-the-four-grant-types)
- [4. Authorization Code Flow (the Default)](#4-authorization-code-flow-the-default)
- [5. PKCE — Code Flow for Public Clients](#5-pkce--code-flow-for-public-clients)
- [6. OpenID Connect (OIDC) — Authentication on Top of OAuth](#6-openid-connect-oidc--authentication-on-top-of-oauth)
- [7. JWT Anatomy & Validation](#7-jwt-anatomy--validation)
- [8. What is SSO Really?](#8-what-is-sso-really)
- [9. SAML vs OIDC vs OAuth](#9-saml-vs-oidc-vs-oauth)
- [10. Token Lifecycles](#10-token-lifecycles)
- [11. Refresh Tokens, Rotation, and Theft Detection](#11-refresh-tokens-rotation-and-theft-detection)
- [12. Where to Store Tokens in the Browser](#12-where-to-store-tokens-in-the-browser)
- [13. Logout — Harder Than You Think](#13-logout--harder-than-you-think)
- [14. Common Security Pitfalls](#14-common-security-pitfalls)
- [15. Implementation Recipes](#15-implementation-recipes)
- [16. Interview Questions & Answers](#16-interview-questions--answers)
- [17. Tricky Questions](#17-tricky-questions)
- [References](#references)

---

## 1. The Problem OAuth Solves

Before OAuth (pre-2010), if a third-party app wanted to access your data on another service, you'd give that app your password. The app would log in as you and screen-scrape what it needed. This was awful for three reasons:

1. **Total access:** the app could do ANYTHING you could. Read all your email, delete photos, change your password.
2. **No revocation:** to "log out" the third-party, you had to change your real password — breaking every other thing that used it.
3. **No audit trail:** there was no way to see "what did this app actually do as me?"

OAuth's insight: **issue a separate credential for the third-party app, scoped to just what it needs, revocable independently of the user's password.**

The user logs into the real service. The real service issues a token to the third-party app. That token says "this app can read your photos but not your contacts, and expires in 1 hour." If the app misbehaves, you revoke the token without touching your password.

OAuth 1.0 (2010) was the first standard. OAuth 2.0 (2012) is what every modern API uses — Google, GitHub, Microsoft, Stripe, every "Sign in with X" button you see. OAuth 2.1 (in draft as of 2024–2025) is a consolidation that removes legacy flows.

---

## 2. OAuth 2.0 — Core Concepts

OAuth defines four roles:

| Role | What it does | Example |
|---|---|---|
| **Resource Owner** | The user. Owns the protected resources. | You |
| **Resource Server** | The API that holds the data. | Google Drive's API |
| **Authorization Server** | The service that authenticates the user and issues tokens. | accounts.google.com |
| **Client** | The third-party app requesting access. | A PDF-viewer SaaS |

And several types of tokens / codes:

| Token | Lifetime | What it does |
|---|---|---|
| **Access Token** | 5 min – 1 hr | Bearer credential the client uses to call the API |
| **Refresh Token** | days – months | Long-lived; trade for a fresh access token without re-prompting user |
| **Authorization Code** | ~60 sec | One-time-use intermediary in the Authorization Code flow |
| **ID Token** (OIDC) | matches access token | A JWT that identifies the user (only with OpenID Connect) |

**Scope** is OAuth's permission system. The client requests scopes (`read:email`, `write:photos`); the user approves or denies them at the consent screen; the resulting token is limited to those scopes. The resource server checks the scope on every API call.

---

## 3. The Four Grant Types

OAuth 2.0 defined four grant types. Two are still recommended; two are deprecated in OAuth 2.1.

| Grant | Used for | Status |
|---|---|---|
| **Authorization Code (with PKCE)** | Web apps, mobile, SPAs | ✅ Default for almost everything |
| **Client Credentials** | Server-to-server (no user involved) | ✅ Machine-to-machine APIs |
| **Implicit** | SPAs (legacy) | ❌ Deprecated — use Auth Code + PKCE instead |
| **Resource Owner Password Credentials** | "I'll just collect username/password directly" | ❌ Defeats the point of OAuth |

A fifth grant, **Device Code**, exists for input-constrained devices (smart TVs, CLI tools). The TV shows a code; the user types it on their phone to authorize.

**Refresh Token** is technically also a grant type — but it's a follow-up grant, not a standalone flow.

---

## 4. Authorization Code Flow (the Default)

This is THE flow you use for any user-facing app. Five steps:

```
┌──────────┐        1. Redirect to /authorize (with client_id, scope, redirect_uri)
│          │─────────────────────────────────────────────────────────►┌──────────┐
│  Client  │                                                          │  Auth    │
│ (Browser)│      2. User authenticates, approves scopes              │  Server  │
│          │  ◄───────────────────────────────────────────────────────│          │
│          │        3. Redirect back with ?code=xyz                   └──────────┘
│          │  ◄──────────────────────────────────────────────────────────────────
│          │
│          │        4. POST /token { code, client_id, client_secret, redirect_uri }
│          │───────────────────────────────────────────────────────────────────►
│          │        5. { access_token, refresh_token, id_token }
│          │  ◄────────────────────────────────────────────────────────────────
└──────────┘
```

**Why the indirection (code → token instead of token directly)?** The code travels through the user's BROWSER (which is untrusted — could be malware, browser extension, network tap). The code is single-use, short-lived, and useless without the client_secret. The actual tokens never touch the browser in the classic web-app flow — they come back over the server-to-server `/token` exchange.

**The `state` parameter** is a CSRF protection. The client generates a random `state`, sends it in step 1, and verifies it matches in step 3. Without `state`, an attacker could trick a logged-in victim into authorizing the attacker's account on the third-party app.

### Minimal Node.js implementation

```js
// Express server initiating Google OAuth
import crypto from 'crypto';

app.get('/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: 'https://myapp.com/callback',
    response_type: 'code',
    scope: 'openid email profile',
    state,
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  // 1. CSRF check
  if (state !== req.session.oauthState) {
    return res.status(400).send('Invalid state');
  }

  // 2. Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'https://myapp.com/callback',
      grant_type: 'authorization_code',
    }),
  });
  const tokens = await tokenRes.json();
  // tokens = { access_token, refresh_token, id_token, expires_in }

  // 3. Store tokens server-side. NEVER ship them to the browser.
  req.session.tokens = tokens;
  res.redirect('/dashboard');
});
```

---

## 5. PKCE — Code Flow for Public Clients

The classic Auth Code flow assumes the client can keep `client_secret` secret. SPAs and mobile apps **cannot** — their code is downloaded by the user. So OAuth 2.0 added **PKCE** (Proof Key for Code Exchange, pronounced "pixie") to make the flow safe for public clients.

PKCE adds two parameters:

1. **`code_verifier`** — a random 43–128 character string the client generates and keeps secret in memory.
2. **`code_challenge`** — SHA-256(code_verifier), base64-url-encoded, sent in the `/authorize` request.

The auth server stores the challenge against the issued code. When the client trades the code for a token, it must send the original `code_verifier`. The server hashes it and compares against the stored challenge.

This means: even if an attacker intercepts the authorization code, they can't redeem it without the verifier (which never leaves the client's memory).

```js
// Browser-side SPA initiating PKCE flow
async function login() {
  const verifier = generateRandomString(64);
  sessionStorage.setItem('pkce_verifier', verifier);   // keep until callback

  const challenge = await sha256Base64Url(verifier);

  const params = new URLSearchParams({
    client_id: 'spa-client-id',
    redirect_uri: window.location.origin + '/callback',
    response_type: 'code',
    scope: 'openid profile',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: generateRandomString(16),
  });
  window.location = `https://auth.example.com/authorize?${params}`;
}

// In the callback
async function handleCallback() {
  const code = new URLSearchParams(location.search).get('code');
  const verifier = sessionStorage.getItem('pkce_verifier');
  sessionStorage.removeItem('pkce_verifier');

  const res = await fetch('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: verifier,
      client_id: 'spa-client-id',
      redirect_uri: window.location.origin + '/callback',
    }),
  });
  const { access_token } = await res.json();
}

async function sha256Base64Url(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
```

**OAuth 2.1 makes PKCE mandatory for ALL clients**, not just public ones. Even confidential server-side clients benefit because it removes one class of authorization-code-injection attacks.

---

## 6. OpenID Connect (OIDC) — Authentication on Top of OAuth

**OAuth is authorization** ("what can this client DO?"). It says nothing about WHO the user is.

**OpenID Connect (OIDC)** is a thin layer on top of OAuth that adds authentication. It adds:

1. The `openid` scope. Including it in the OAuth request signals "I want an ID token too."
2. An **ID Token** — a JWT containing the user's identity (`sub`, `email`, `name`, etc.) along with claims about WHEN they authenticated and WHICH auth server issued it.
3. Standard endpoints: `/userinfo` (to fetch profile data), `/.well-known/openid-configuration` (discovery).

```json
// Example ID Token payload (decoded JWT)
{
  "iss": "https://accounts.google.com",      // issuer
  "sub": "108234950321784093123",             // subject (user ID at issuer)
  "aud": "your-client-id.apps.googleusercontent.com",
  "exp": 1715600000,                           // expiration
  "iat": 1715596400,                           // issued at
  "email": "alice@example.com",
  "email_verified": true,
  "name": "Alice Example",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

**Critical: the ID token is for IDENTITY. The access token is for AUTHORIZATION.** They're different tokens with different purposes. Don't use the ID token to call the resource server's API — that's what the access token is for. Don't use the access token to identify the user — that's the ID token's job.

When you see "Sign in with Google", you're using OIDC. The button initiates an OAuth 2.0 Authorization Code flow with the `openid` scope, which gives you both an access token AND an ID token, the latter telling you who logged in.

---

## 7. JWT Anatomy & Validation

JWT (JSON Web Token) is the format ID tokens (and often access tokens) take. It's three base64-url-encoded segments joined by dots:

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE3MTYwfQ.signature
└──────── HEADER ────────┘ └──────── PAYLOAD ────────┘ └── SIGNATURE ──┘
```

- **Header:** `{ "alg": "RS256", "typ": "JWT" }` — algorithm and type.
- **Payload:** the claims (sub, exp, iat, custom data).
- **Signature:** HMAC or RSA signature over `header.payload`, using the issuer's key.

**A JWT is NOT encrypted.** The payload is base64-decoded, plain to read. Don't put secrets in it. Anyone with the token can read every claim.

### Validating a JWT

Receiving a JWT means nothing until you've verified it. Required checks:

1. **Signature** — recompute the signature using the issuer's public key (fetched from `/.well-known/jwks.json`) and compare. If you skip this, ANY token "validates."
2. **`exp` (expiration)** — must be in the future.
3. **`iat` / `nbf` (issued at / not before)** — must be in the past.
4. **`iss` (issuer)** — must match your trusted issuer URL.
5. **`aud` (audience)** — must be your client_id. Not your friend's client_id.

```js
import { jwtVerify, createRemoteJWKSet } from 'jose';

const JWKS = createRemoteJWKSet(new URL('https://accounts.google.com/.well-known/jwks.json'));

async function verifyGoogleIdToken(token) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: 'https://accounts.google.com',
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return payload;   // throws if any check fails
}
```

**The `alg: none` attack:** historically, some JWT libraries accepted `{ "alg": "none" }` as "no signature needed." Attackers would send tokens with `alg: none` and the libraries would happily accept them. Modern libraries reject this — but always pin your expected algorithm explicitly.

---

## 8. What is SSO Really?

**Single Sign-On** is the user-facing pattern: log in once, access many apps without re-authenticating. The user types their password to the identity provider (IdP) ONCE per session; every app they visit gets a token from the IdP via OAuth/OIDC or SAML.

A few flavors:

| SSO type | How it works | Where you see it |
|---|---|---|
| **Federated SSO** | Each app trusts a common IdP. App → IdP for auth. | "Sign in with Google" everywhere |
| **Enterprise SSO** | Company has its own IdP (Okta, Azure AD). Employees authenticate once; everything in the company is auto-logged-in. | Your work laptop opening Slack, Jira, GitHub without prompts |
| **Kerberos-based SSO** | Windows domain. Ticket-based; user logs into Windows, all kerberized apps trust the ticket. | Legacy on-prem deployments |
| **OS-level SSO** | macOS Single Sign-On extensions, Windows Hello. | Native apps on devices |

The protocols underneath are usually **SAML 2.0** (older enterprise apps) or **OIDC** (modern web/mobile).

**The key insight:** SSO is the user experience; OAuth/OIDC/SAML are the technical protocols that achieve it. Saying "we use OAuth for SSO" is correct shorthand but conflates the two.

---

## 9. SAML vs OIDC vs OAuth

The three acronyms get used interchangeably but they're different.

| Property | OAuth 2.0 | OIDC | SAML 2.0 |
|---|---|---|---|
| **Purpose** | Authorization (delegated API access) | Authentication (who is the user?) | Authentication + (limited) authorization |
| **Format** | Opaque tokens or JWTs | JWT (ID Token) | XML assertions |
| **Year** | 2012 | 2014 | 2005 |
| **Transport** | Mostly HTTP redirects + JSON | HTTP redirects + JSON | HTTP redirects + POST with XML payloads |
| **Mobile-friendly** | ✅ | ✅ | ❌ Hard — XML and bigger redirects |
| **Common in** | Public APIs, consumer apps | Modern SSO, mobile apps | Enterprise SSO (Okta, AD FS, Ping) |

**SAML** sends authentication info as an XML "assertion" signed by the IdP. SAML is heavier (XML is verbose, signatures are XML-DSig which is fragile), but it's still the dominant protocol in big enterprises because the surrounding ecosystem (Active Directory Federation Services, AD FS) is mature.

**OIDC** is what you reach for in greenfield projects. JSON, JWT, mobile-friendly, standardized discovery.

If an enterprise customer says "we need SSO," ask whether they expect SAML (the AD FS / on-prem default) or OIDC (Okta, Azure AD newer apps). Many B2B SaaS apps support BOTH because some customers are still on SAML.

---

## 10. Token Lifecycles

The hardest part of OAuth in practice isn't getting tokens — it's managing their lifecycles.

### Access tokens — short

- Lifetime: 5 minutes to 1 hour typical.
- Bearer credential — whoever holds it can call the API.
- Goal: short enough that if leaked, the blast radius is bounded.

### Refresh tokens — long

- Lifetime: hours to months.
- Used ONLY to mint new access tokens at the `/token` endpoint.
- Should never be sent to a resource API.
- Should be stored more securely than access tokens (they're the long-lived credential).

### ID tokens — match the session

- Lifetime: typically matches the access token.
- Identifies the user. Use once at login to establish identity, then store the resulting session.
- Don't re-validate the ID token on every API call — that's what the access token (or your own session) is for.

### The renewal loop

```
[Login] → [Get tokens] → [Use access token for API calls]
                              │
                              ▼ (access token expires)
                         [POST /token with refresh_token]
                              │
                              ▼ (new access token + maybe new refresh token)
                         [Use new access token]
                              │
                              ▼ (refresh token also expires eventually)
                         [Re-prompt user to log in]
```

Most OAuth libraries (passport.js, openid-client, msal.js) handle the renewal loop for you.

---

## 11. Refresh Tokens, Rotation, and Theft Detection

The classic refresh-token problem: it's a long-lived credential. If stolen, an attacker can mint access tokens for as long as it lives.

Two defenses:

### Refresh Token Rotation

Every time the client uses a refresh token, the auth server issues a NEW refresh token along with the new access token. The old refresh token is invalidated.

```
Client sends RT_v1  →  Server returns AT_v2 + RT_v2 (RT_v1 now invalid)
Client sends RT_v2  →  Server returns AT_v3 + RT_v3 (RT_v2 now invalid)
```

### Theft detection via reuse

If the auth server EVER sees an already-used (rotated-out) refresh token, that means either:
- The legitimate client lost its newer RT and is retrying the old one (rare bug)
- An attacker is using a stolen old RT

The server can't distinguish, so the safe move is: **invalidate the entire refresh-token chain for that user**. Force a re-login. Auth0, Okta, Azure AD all implement this.

---

## 12. Where to Store Tokens in the Browser

This is the #1 question in OAuth implementation, and the answer is contested.

| Storage | Pros | Cons |
|---|---|---|
| **localStorage** | Easy, persists across reloads | XSS attacker can read it — same-origin script wins |
| **sessionStorage** | Same as localStorage but tab-scoped | Same XSS risk |
| **In-memory (JS variable)** | XSS attacker can read it only during the session; lost on reload | Lost on reload — need silent renewal |
| **HttpOnly cookie** | Inaccessible to JS — XSS-safe | CSRF risk (mitigated with SameSite=Lax/Strict) |
| **HttpOnly cookie + BFF pattern** | Tokens never reach the browser at all | Most complex; needs backend |

**Modern best practice (BFF — Backend for Frontend):**

1. SPA does OIDC login via the browser.
2. Tokens are received and stored by a **lightweight backend** (a "BFF" proxy).
3. The BFF issues the SPA a session cookie (HttpOnly, Secure, SameSite=Lax).
4. SPA calls its own backend (the BFF) with the session cookie; BFF attaches the access token and proxies to the real API.

The tokens never live in JS-accessible storage. XSS can't steal them. CSRF is blocked by SameSite. Logout invalidates the session server-side.

This is what most enterprise SaaS apps do in 2026. It's more infrastructure but materially safer than putting tokens in localStorage.

---

## 13. Logout — Harder Than You Think

"Log out" sounds simple. It's not.

When a user clicks Log Out, you need to:

1. **Revoke the access token** (call `/revoke` on the auth server).
2. **Revoke the refresh token** (separate revoke, or the same call depending on server).
3. **Destroy the local session** (clear cookies / storage).
4. **Notify the user's other SESSIONS** if you support session listing.
5. **Notify the IdP** (RP-Initiated Logout in OIDC: redirect to `/end_session_endpoint`).
6. **In SSO scenarios:** decide whether to log them out of the IdP entirely or just the current app.

**The IdP logout decision is the hard part.** If a user clicks "Log out" in App A:
- Should they ALSO be logged out of App B and App C (which share the same IdP)? This is **Single Logout** (SLO).
- Or just App A?

Different products choose differently. Google: clicking sign-out in Gmail signs you out of EVERYTHING Google-tied. Slack: signing out of one workspace doesn't log you out of others.

**SAML Single Logout** has a notorious problem: it broadcasts logout to every SP (service provider) the user was logged into, often via redirect chains. If any SP is slow or unreachable, the whole logout hangs.

---

## 14. Common Security Pitfalls

### CSRF on the redirect URI
Without the `state` parameter, an attacker can paste their authorization code into a victim's session. Always validate `state`.

### Open redirect via `redirect_uri`
If your auth server lets clients register `https://myapp.com/*` as a valid redirect URI, an attacker can redirect to `https://myapp.com/evil-page-with-exfil`. Pin redirect URIs exactly, no wildcards.

### Token leakage via Referer
Tokens in the URL fragment (legacy Implicit flow) could leak via the `Referer` header to linked third-party content. Implicit flow is deprecated for this reason.

### Insufficient JWT validation
Skipping any of signature / iss / aud / exp / nbf validation. Especially common: validating signature but not audience — letting one app's token authenticate to another app.

### Mixing access and ID tokens
Sending the ID token to a resource API (it's not an access token; the API will likely accept it but you've lost the access-control benefits).

### Client secret in JavaScript
The `client_secret` is for confidential clients (servers) only. SPAs and mobile apps must use PKCE — no secret.

### Long-lived access tokens
Access tokens valid for 24 hours mean a stolen token can be used for 24 hours. Keep them short (15 min – 1 hr).

### Not revoking refresh tokens on logout
Logout that just clears the session but leaves the refresh token alive lets an attacker who stole it keep generating access tokens.

---

## 15. Implementation Recipes

### "Sign in with Google" on a Node.js app (BFF pattern)

```js
import express from 'express';
import session from 'express-session';
import { Issuer, generators } from 'openid-client';

const app = express();
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));

const googleIssuer = await Issuer.discover('https://accounts.google.com');
const client = new googleIssuer.Client({
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uris: ['http://localhost:3000/callback'],
  response_types: ['code'],
});

app.get('/login', (req, res) => {
  const state = generators.state();
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);
  req.session.oauth = { state, codeVerifier };
  res.redirect(client.authorizationUrl({
    scope: 'openid email profile',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  }));
});

app.get('/callback', async (req, res) => {
  const { state, codeVerifier } = req.session.oauth;
  const params = client.callbackParams(req);
  const tokenSet = await client.callback(
    'http://localhost:3000/callback',
    params,
    { state, code_verifier: codeVerifier }
  );
  // tokenSet.id_token verified inside .callback
  const user = tokenSet.claims();
  req.session.user = { sub: user.sub, email: user.email, name: user.name };
  req.session.tokens = tokenSet;   // server-side only, never to browser
  res.redirect('/');
});

app.get('/me', (req, res) => res.json(req.session.user ?? null));

app.post('/logout', async (req, res) => {
  // Revoke + destroy
  if (req.session.tokens?.refresh_token) {
    await client.revoke(req.session.tokens.refresh_token);
  }
  req.session.destroy(() => {
    res.redirect(client.endSessionUrl());
  });
});
```

### Validating a Google ID Token on an Express API

```js
import { OAuth2Client } from 'google-auth-library';
const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).send('no token');
  const ticket = await oauth2Client.verifyIdToken({
    idToken: auth.slice(7),
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  req.user = ticket.getPayload();
  next();
}
app.get('/me', requireAuth, (req, res) => res.json(req.user));
```

### Refresh-token rotation in a SPA (msal.js sketch)

```js
import { PublicClientApplication } from '@azure/msal-browser';

const msal = new PublicClientApplication({
  auth: {
    clientId: 'spa-id',
    authority: 'https://login.microsoftonline.com/{tenant}',
    redirectUri: window.location.origin,
  },
  cache: { cacheLocation: 'sessionStorage' },
});

async function getAccessToken() {
  const account = msal.getAllAccounts()[0];
  try {
    const result = await msal.acquireTokenSilent({ scopes: ['api://my-api/read'], account });
    return result.accessToken;
  } catch (err) {
    // Silent refresh failed — fall back to interactive
    const result = await msal.acquireTokenPopup({ scopes: ['api://my-api/read'] });
    return result.accessToken;
  }
}
```

---

## 16. Interview Questions & Answers

### Beginner

**Q1: What's the difference between OAuth and OpenID Connect?**

OAuth is an **authorization** protocol — it answers "what is this client allowed to DO with my data?" The token a client receives says "I can read your photos" or "I can write to your calendar." OAuth tells you nothing about who the user is.

OpenID Connect is **authentication** on top of OAuth. Adding the `openid` scope to an OAuth request gets you an additional **ID Token** (a JWT) describing the user — their subject ID, email, name, when they authenticated. OIDC standardizes endpoints (`/userinfo`, `/.well-known/openid-configuration`) and the ID Token format.

In short: every OIDC flow is an OAuth flow with extra payload. You use OAuth alone when you need API delegation but don't care who the user is (rare). You use OIDC when you want to know who logged in (most "Sign in with Google" buttons).

---

**Q2: What is OAuth's `state` parameter for?**

CSRF protection. The client generates a random `state` value at the start of an OAuth flow, stores it in the user's session, and includes it in the `/authorize` redirect. When the auth server redirects back with the authorization code, it echoes the `state` back. The client verifies the returned state matches what it stored.

Without `state`, an attacker could craft an OAuth callback URL that injects THEIR authorization code into the VICTIM'S session, causing the victim's app to log in as the attacker — a session-fixation attack.

---

**Q3: What's the difference between an access token and a refresh token?**

**Access token:** short-lived (typically 5–60 minutes). The bearer credential you actually send to the resource API as `Authorization: Bearer <token>`. Anyone holding it can call the API on the user's behalf, scoped to the granted scopes.

**Refresh token:** long-lived (hours to months). Used ONLY to call the auth server's `/token` endpoint to mint a new access token without re-prompting the user. Should never be sent to a resource API. Should be stored more securely than access tokens.

The two-tier design exists so leaked access tokens have a small blast radius (expire in minutes), while users don't get re-prompted constantly (refresh tokens silently renew).

### Intermediate

**Q4: Walk through the Authorization Code flow with PKCE step by step.**

PKCE is the modern default for SPAs and mobile apps. The flow:

1. **Client generates** a random `code_verifier` (43-128 chars). Computes `code_challenge = SHA-256(verifier)` base64-url-encoded.
2. **Redirects user to `/authorize`** with `client_id`, `redirect_uri`, `scope`, `state`, `code_challenge`, `code_challenge_method=S256`.
3. **User authenticates** with the auth server (typing password, MFA, etc.) and consents to the requested scopes.
4. **Auth server redirects back** to `redirect_uri` with `?code=xyz&state=...`. The client verifies `state` matches.
5. **Client POSTs `/token`** with `code`, `redirect_uri`, `client_id`, AND `code_verifier`. The auth server hashes the verifier and compares against the stored challenge.
6. **Auth server returns** access token, refresh token, and (if OIDC) ID token.

PKCE's win: even if step 4's authorization code is intercepted (browser extension, network), it's useless without the `code_verifier` — which never left the client's memory.

---

**Q5: Where should you store tokens in a browser-based SPA?**

The honest answer is "it depends, and the contemporary best practice is to avoid storing them in the browser at all."

Options:
- **localStorage / sessionStorage:** persistent and easy, but ANY XSS gives an attacker the token. The default attack surface is "any malicious script that runs in your origin."
- **In-memory JavaScript variable:** safer from XSS (the token disappears on reload), but lost on reload — requires silent renewal.
- **HttpOnly cookie:** the JS can't read it, so XSS can't steal it directly. But you need CSRF protection (SameSite=Lax minimum).
- **BFF pattern (best practice 2026):** the SPA's backend keeps the tokens; the SPA only sees a server-issued session cookie. Tokens never enter JS at all.

For a greenfield SPA today, the BFF pattern is the recommended approach. For pure-static SPAs that can't run a backend, in-memory + silent renewal is the next best.

---

**Q6: What is the BFF (Backend for Frontend) pattern in OAuth?**

The BFF is a small backend service that owns the OAuth flow on behalf of the browser. The flow:

1. SPA clicks Login → opens the IdP's authorization page.
2. After consent, the IdP redirects back to the BFF (NOT the SPA).
3. The BFF exchanges the code for tokens, stores them server-side, and issues the SPA a session cookie (HttpOnly, Secure, SameSite=Lax).
4. SPA makes API calls to the BFF using the session cookie. The BFF attaches the access token and proxies the request to the real API.

Benefits:
- Tokens never enter JavaScript memory; XSS can't steal them.
- Refresh-token rotation happens server-side; SPA doesn't have to manage it.
- Logout can revoke everything server-side cleanly.

Cost: you need to run a backend (even if just a thin proxy). For pure-static deployments this isn't viable.

---

**Q7: Why is the OAuth Implicit grant deprecated?**

The Implicit grant returned the access token directly in the URL fragment (`#access_token=...`) after the user consented. Reasons it's now deprecated:

1. **Token leakage via Referer:** tokens in the URL could leak via `Referer` headers to linked third-party content (analytics scripts, embedded iframes).
2. **Token in browser history:** the URL stays in the user's history; tokens can be recovered.
3. **No refresh token:** silent renewal required popups or iframes, both of which became increasingly broken (third-party cookie restrictions, popup blockers).
4. **No proof of code-to-token binding:** the Auth Code flow with PKCE provides cryptographic binding; Implicit doesn't.

OAuth 2.1 removes Implicit entirely. Use Authorization Code with PKCE for SPAs.

### Advanced

**Q8: How do you implement single sign-on across multiple subdomains of your company?**

Two common approaches:

**Approach 1: Shared cookie domain.** All apps live under `*.example.com`. The session cookie is set on `.example.com` (with a leading dot). Browsers send it on every subdomain. Easiest but only works on a single parent domain.

**Approach 2: Token-based SSO via IdP.** A central IdP (Okta, your own) issues an OIDC session. When the user hits app2.example.com, the app redirects to the IdP, which sees an existing session cookie (on the IdP's domain) and silently issues a new ID token / authorization code for app2 without prompting.

Most production SSO uses Approach 2 because it works across unrelated domains (e.g., yourapp.com + customerportal.com + admin.internal.io). The user authenticates ONCE to the IdP; every app does silent OIDC against the IdP.

---

**Q9: Explain refresh-token rotation and what reuse detection does.**

**Rotation:** every time the client uses a refresh token at the `/token` endpoint, the auth server issues a NEW refresh token along with the new access token. The old refresh token is invalidated immediately.

```
Initial:       client has RT_1
Renewal #1:    POST /token { refresh_token: RT_1 }
               server returns AT_2 + RT_2; RT_1 is now dead.
Renewal #2:    POST /token { refresh_token: RT_2 }
               server returns AT_3 + RT_3; RT_2 is now dead.
```

**Reuse detection:** if the auth server ever sees an already-rotated-out refresh token (RT_1 used twice, RT_2 used after RT_3 was issued), something is wrong. Possibilities:
- A bug — the legitimate client lost the new token and is replaying the old one.
- An attack — someone stole an old RT before it was rotated, and is trying to use it now.

The server can't distinguish, so the safe move is to **invalidate the entire refresh-token chain for that user**. All RTs derived from that root token are nuked. The legitimate user has to log in again, but an attacker is locked out.

Auth0, Okta, Azure AD all implement this.

---

**Q10: What's the difference between SAML and OIDC, and when would you pick each?**

Both achieve federated authentication. They differ in format and ecosystem.

**SAML 2.0 (2005):**
- XML-based assertions, signed with XML-DSig.
- Bigger messages, harder to debug.
- Mature enterprise ecosystem (Active Directory Federation Services, Okta, Ping, OneLogin).
- Heavy: redirects with massive XML payloads. Not mobile-friendly.

**OIDC (2014):**
- JSON / JWT based.
- Compact, easy to debug.
- Modern: built for mobile and SPAs.
- Standardized discovery (`/.well-known/openid-configuration`).

**Choose SAML when:** you're integrating with a big enterprise customer that already runs AD FS, Okta-classic, or Shibboleth. Most B2B SaaS supports both and the customer dictates which one.

**Choose OIDC when:** greenfield, mobile-heavy, or you control the IdP. It's strictly easier to implement and debug.

If you're shipping a B2B SaaS, support BOTH. If consumer-only, OIDC is sufficient.

---

**Q11: How does logout in an SSO system work across multiple apps?**

This is harder than logging in. Options:

**Front-channel logout (SAML SLO):** the IdP sends logout requests to every SP the user was logged into. Via browser redirects. Problems: if any SP is slow/unreachable, the chain stalls; bidirectional handshakes break behind certain network configs.

**Back-channel logout (OIDC):** the IdP makes direct server-to-server calls to each app's `/logout` endpoint. Faster and more reliable than front-channel because it doesn't depend on the user's browser.

**Token revocation:** the app revokes its own access/refresh tokens with the auth server. Doesn't propagate to OTHER apps the user was logged into.

**Session-only logout:** the app just destroys its local session. The user is logged out of THIS app; clicking "Sign in" again silently re-authenticates from the still-valid IdP session.

The product decision: should logging out of App A log the user out of EVERYTHING (Google's model) or just App A (Slack's model)? Different products choose differently.

---

**Q12: What is the `aud` claim in a JWT and why is it critical to validate?**

The `aud` (audience) claim identifies the intended recipient of the token. The auth server stamps it when issuing the token — typically the `client_id` of the app the user authenticated to.

**Why it matters:** without checking `aud`, App B will happily accept tokens issued for App A. An attacker who legitimately authenticates with App A (low security) can then use that token to access App B (high security).

```js
// CORRECT: pin the expected audience
const { payload } = await jwtVerify(token, JWKS, {
  issuer: 'https://accounts.google.com',
  audience: 'my-app-client-id.apps.googleusercontent.com',
});

// WRONG: signature valid, but no audience check
// → accepts ANY Google-signed token, including ones issued to other apps
```

Always pin `audience` to your client_id. The OAuth 2.0 spec calls this the most-skipped check and the source of many real-world breaches.

---

## 17. Tricky Questions

**Q1: A user clicks "Sign in with Google." The flow completes successfully. You get an ID token. You decode it (without verifying the signature) and read the email. Is this safe? What goes wrong?**

It's NOT safe. Decoding a JWT without verification is meaningless — anyone can mint a JWT with any payload. The signature is what proves the token came from Google.

The attack: the user runs malware that intercepts the redirect-back URL, replaces the legitimate ID token with one the attacker minted (signed with a key the attacker controls, with `email: ceo@yourcompany.com`), and sends it to your callback. If you decode without verification, you'll happily log in the attacker as the CEO.

The fix: ALWAYS verify the signature against the issuer's public key (fetched from `/.well-known/jwks.json`), pin the `iss` claim to Google's exact URL, and pin `aud` to your client_id. The `jose` or `google-auth-library` packages do all this for you — use them, don't roll your own.

---

**Q2: Your SPA uses Authorization Code + PKCE. You store the access token in localStorage so it survives reloads. An attacker discovers an XSS vulnerability in a third-party dependency that runs in your app. What's the blast radius?**

The attacker can read localStorage from any script running in your origin. They steal the access token. With it, they can:
- Call your API as the user for as long as the access token lives (typically 15 min – 1 hr).
- Read the refresh token (if also stored in localStorage) and continuously mint fresh access tokens until the refresh token is revoked or expires (days to months).

PKCE prevented authorization-code interception in transit; it doesn't help once tokens are stored insecurely on the client. **PKCE is not a substitute for secure token storage.**

The fix: don't store tokens in localStorage. Use the BFF pattern (HttpOnly cookies, tokens server-side) or in-memory storage with silent renewal. The XSS isn't a token-storage problem at root — it's an XSS problem — but securing token storage reduces the blast radius dramatically.

---

**Q3: Your team is integrating with a legacy enterprise customer who insists on SAML. What complications should you expect?**

Several:

1. **Metadata exchange ceremony.** SAML requires you to exchange XML metadata files describing your SP (Service Provider) endpoints and certificates. Customers often ask you to upload to their AD FS console; updates require re-exchange.
2. **Clock skew.** SAML assertions have very tight time windows (often 5 minutes); if your servers and theirs aren't NTP-synced, assertions fail with "not yet valid" or "expired" errors that are painful to debug.
3. **Just-in-Time provisioning.** Often customers won't pre-create accounts in your system; the first SAML login should create the user. You'll need attribute mapping (their `emailAddress` claim → your `email` field, their `firstName` → `first_name`, etc.).
4. **Signature canonicalization issues.** XML-DSig signs the canonicalized XML, and there are multiple canonicalization algorithms. Mismatches between your SAML library and theirs cause "invalid signature" errors that look like a key problem but are actually a c14n problem.
5. **Single Logout (SLO) reliability.** If SLO is required, expect to debug "phantom session" problems for weeks.
6. **No standard discovery.** Unlike OIDC, there's no `/.well-known` endpoint. You'll be configuring URLs, certificates, and binding types by hand for every customer.

Library: `samlify` or `passport-saml` for Node, `OneLogin/python3-saml` for Python. Don't roll your own SAML.

---

**Q4: A pen tester reports they can log into your app using their account but with someone else's tokens by manipulating the `aud` claim. Walk through what went wrong.**

This is the classic missing-aud-check bug. The flow:

1. Pen tester logs into THEIR account on App A (an OAuth-protected app they legitimately own).
2. App A's auth server issues them a JWT with `aud: app-a`.
3. Pen tester sends this token to App B's API with `Authorization: Bearer <token>`.
4. App B verifies the signature (passes — same auth server signed it).
5. App B does NOT check the `aud` claim.
6. App B reads the `sub` claim and authenticates the request as that user… but App B's database has its own user mapping. The pen tester's `sub` from App A might happen to match a different user in App B's database.

Result: the pen tester accessed App B as another user.

The fix: always check `aud` matches your expected client_id. Token verification libraries make this a one-line option (`audience: '...'`). Forgetting it is one of the most common findings in OAuth security audits.

---

**Q5: Your SPA's PKCE flow is failing on Safari but works on Chrome. What's likely going on?**

Common culprits when "works in Chrome, breaks in Safari":

1. **sessionStorage cleared between redirects.** Safari's Intelligent Tracking Prevention (ITP) can clear cross-domain sessionStorage data on redirect. If you stored the `code_verifier` in sessionStorage and the OAuth flow goes through a different domain, ITP may wipe it before you can use it. Move to in-memory state managed by a single-page navigation, or use cookies with proper SameSite.
2. **Third-party cookies.** If the IdP needs a session cookie to skip re-authentication and you're in a top-level navigation, this is usually fine. But silent renewal in an iframe (older patterns) breaks completely in Safari with ITP enabled.
3. **Date/time skew.** Older Safari builds had clock-drift issues that caused JWT validation to fail with "not yet valid."
4. **Cross-origin redirect issues.** Some IdPs use multiple redirect hops; Safari may strip referrer info more aggressively, breaking flows that depend on it.

Debug: open the Safari Web Inspector → Network tab → record the full flow. The `code_verifier` must persist through the redirect; the most common Safari failure is that it doesn't.

---

**Q6: Your API serves multiple frontend clients (web SPA, mobile, third-party). How do you architect OAuth so that scopes work correctly?**

The key insight: **each client should have its own client_id** registered with the auth server. The auth server can then issue different sets of scopes to different clients.

Configuration:
- `web-spa` client: allowed scopes = `read:profile`, `read:posts`, `write:posts`
- `mobile-app` client: allowed scopes = `read:profile`, `read:posts`, `write:posts`, `read:photos`
- `partner-api` client: allowed scopes = `read:posts` (no profile, no write)

Each requests only what it needs:
- SPA: `scope=read:profile read:posts write:posts`
- Mobile: same + `read:photos`
- Partner: `scope=read:posts`

The resource API:
- Validates the JWT signature, issuer, audience.
- Reads the `scope` claim (space-separated).
- Authorizes each endpoint based on required scope (e.g., `POST /posts` requires `write:posts`).

Don't try to make a single client_id work for everything — you lose per-client control over allowed scopes, can't revoke one client without affecting others, and can't measure usage per client.

---

**Q7: A user reports they're being signed out of your app every 30 seconds. You're using OIDC with refresh-token rotation. What might be happening?**

The most likely cause: **two browser tabs racing on refresh-token rotation**.

When the access token nears expiry, both tabs try to refresh. They each send a request with the same refresh token RT_1.

Tab A's request hits the server first → server returns AT_2 + RT_2, invalidates RT_1.
Tab B's request arrives a moment later, still using RT_1 → server sees RT_1 as already-used, treats it as a stolen-token reuse, and INVALIDATES THE ENTIRE TOKEN CHAIN.

Both tabs now have unusable tokens. User is force-logged-out.

Fixes:
1. **Cross-tab coordination.** Use BroadcastChannel or localStorage events to serialize refresh attempts — first tab to start the refresh holds a lock; other tabs wait and pick up the new token.
2. **Refresh-token "grace period."** Some auth servers (like Auth0) allow the previous refresh token to be valid for a short window (e.g., 10 seconds) to absorb race conditions. Check if yours supports this.
3. **BFF pattern.** Move the refresh logic server-side. The BFF can serialize refreshes per user via a Redis lock or similar; the SPA never sees the refresh complexity.

This bug is very common in multi-tab SPAs and is often misdiagnosed as "users complaining about random logouts."

---

**Q8: Your auth server uses asymmetric JWT signing (RS256). The key rotates every 90 days. Your API caches the JWKS for performance. What can go wrong, and how do you handle it?**

Two things go wrong:

1. **Key rotation race:** the auth server starts signing with the new key, but your API's cached JWKS still has only the old key. Tokens signed with the new key fail "signature verification" until the cache refreshes.

2. **Old tokens after rotation:** if you cache JWKS and aggressively purge old keys when refreshing, tokens still in-flight that were signed with the OLD key fail to validate.

The standard fix:
- **Publish BOTH keys during rotation.** The auth server's JWKS contains the OLD key + the NEW key for a transition window (24–48 hours). New tokens are signed with the new key; old tokens still verify against the old key. After the window, the old key is removed.
- **API caches JWKS keyed by `kid` (key ID).** Each JWT header includes `kid`. The API looks up that specific key in its cache.
- **On unknown kid, refresh the JWKS cache.** Don't fail; refetch and retry.

Libraries like `jose` and `jsonwebtoken` with `jwks-rsa` handle this automatically — but you must configure the cache TTL (commonly 10–60 minutes) and the "refresh on unknown kid" behavior.

---

## References

- [The OAuth 2.0 Authorization Framework (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749)
- [PKCE (RFC 7636)](https://datatracker.ietf.org/doc/html/rfc7636)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [OAuth 2.0 Security Best Current Practice (RFC 9700)](https://datatracker.ietf.org/doc/html/rfc9700)
- [OAuth 2.1 (draft)](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- [SAML 2.0 Technical Overview](https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html)
- [jwt.io](https://jwt.io) — JWT decoder + library directory
- [Auth0 Docs — Refresh Token Rotation](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)
- [The BFF Pattern for SPAs](https://datatracker.ietf.org/doc/draft-ietf-oauth-browser-based-apps/)
