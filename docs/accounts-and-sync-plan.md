# Accounts and progress sync: plan, options and costs

Status: proposal, nothing built yet. Written 2026-10-14. Prices and free limits were checked on
the providers' own pages that day (links at the end). They change, so check them again before
you choose.

## The goal

PrepHub keeps all progress in `localStorage`, so it lives in one browser on one device. The goal
is an optional **Sign in with Google** that keeps your progress (guides read, Daily Review
history, streaks, bookmarks, checkpoints, solved challenges and drafts) in step across devices.

Ground rules:

- **Signing in stays optional.** Everything keeps working with no account, and offline.
- **`localStorage` stays the source of truth on the device.** The cloud copy is how devices
  agree; the app never waits for the network to show progress.
- **The site stays static on GitHub Pages** unless the chosen option needs an API server.

Why this is easier than it sounds: every stored value already goes through `src/lib/storage.ts`,
under a fixed list of keys pinned by `storageKeys.test.ts`. That one file is the boundary a sync
layer plugs into.

---

## The three options

| Option | How it works | Strengths | Weaknesses |
|---|---|---|---|
| **A. Firebase Auth + Cloud Firestore** (recommended) | Google sign-in and the database are called straight from the browser. Security rules allow each user only their own documents | No server to run, so it fits GitHub Pages as it is. Offline cache, live updates between devices and Google sign-in are built in | Vendor lock-in. Redirect sign-in is unreliable on a custom domain since browsers blocked third-party storage, so use the popup |
| **B. Supabase** (Auth + Postgres) | Google sign-in, plus Postgres with row-level security, called from the browser | Real SQL and easy export. Open source, so you can self-host later | No offline cache, so you write the sync yourself. Free projects pause after a week of inactivity |
| **C. Your own API: Cloudflare Worker + D1 (SQLite)** | Google's sign-in library gives the browser an ID token. Your Worker verifies it, sets a session cookie and stores the data in D1 | You own everything, and it's cheap. Your DNS is already on Cloudflare | The most work and the most risk: sessions, CSRF protection, verifying Google's token, and the sync protocol are all yours |

---

## Free limits (as checked 2026-10-14)

### A. Firebase (Spark plan: free, no card)

| Item | Free limit |
|---|---|
| Authentication | 50,000 monthly active users |
| Firestore stored data | 1 GiB |
| Firestore document reads | 50,000 per day |
| Firestore document writes | 20,000 per day |
| Firestore document deletes | 20,000 per day |
| Firestore outbound transfer | 10 GiB per month |
| Free databases | one per project |

- **What happens at a limit:** on Spark, requests over a daily limit **fail** until the quota
  resets. There is never a bill.
- **Blaze (pay as you go):** the same free amounts apply each day, and you pay only above them.
  Prices in us-central1: **$0.03 per 100,000 reads, $0.09 per 100,000 writes, $0.01 per
  100,000 deletes**, about **$0.15 per GiB-month** stored.
- **How reads are counted:** a live listener costs one read each time a document it watches
  changes. Every query costs at least one read.

### B. Supabase

| Item | Free plan | Pro plan ($25 per month) |
|---|---|---|
| Auth monthly active users | 50,000 | 100,000 included, then $0.00325 each |
| Database size | 500 MB | 8 GB disk per project, then $0.125 per GB |
| Egress | 5 GB | 250 GB included, then $0.09 per GB |
| Active projects | 2 | not limited by plan |
| Inactivity | **paused after 1 week of inactivity** | never paused |
| Compute | shared | $10 per month credit, which covers one Micro instance |

### C. Cloudflare Workers + D1

| Item | Free plan | Workers Paid ($5 per month minimum) |
|---|---|---|
| Worker requests | 100,000 per day | 10 million per month included, then $0.30 per million |
| CPU time | 10 ms per request | 30 million CPU-ms per month included, then $0.02 per million |
| D1 rows read | 5 million per day | 25 billion per month included, then $0.001 per million |
| D1 rows written | 100,000 per day | 50 million per month included, then $1.00 per million |
| D1 storage | 5 GB total | 5 GB included, then $0.75 per GB-month |

Google sign-in itself, through Google Identity Services, costs nothing with any option.

---

## How much PrepHub would use

### Data per user

| Stored key | Typical | Heavy user |
|---|---|---|
| `guide-progress` (86 guides) | 3 KB | 5 KB |
| `sr-schedule` (Daily Review, up to 1,666 questions) | 15 KB | 130 KB |
| `study-stats`, `bookmarks`, `checkpoints` | 5 KB | 20 KB |
| `playground-progress` (solved state and drafts, 161 challenges) | 30 KB | 300 KB |
| **Total** | **about 50 KB** | **about 450 KB** |

### Traffic per signed-in user per active day

These are assumptions; measure the real numbers in Phase 5.

- **On opening the app:** download about 6 stored items, one per key, so about 6 reads or 1 request.
- **While studying:** changes are batched and sent every few seconds, so about 15–20 writes a
  day, and about 10–12 requests for option C.
- **Updates from your other devices:** a few reads.
- **Round numbers used below:** about 30 reads, 20 writes and 12 requests per active user-day,
  and about 200 KB of data transfer.

### Estimated monthly cost

DAU means daily active users who are signed in. Monthly active users are taken as about three
times DAU.

| Scenario | A. Firebase | B. Supabase | C. Cloudflare Worker + D1 |
|---|---|---|---|
| **100 DAU** (300 MAU) | **$0**: 3,000 reads and 2,000 writes a day, far under the limits | **$0**: about 0.6 GB egress a month. Paused only if nobody signs in for a week | **$0**: about 1,200 requests a day |
| **1,000 DAU** (3,000 MAU) | **$0, at the edge**: about 30,000 reads (limit 50,000) and 20,000 writes (limit 20,000) a day. Batch writes harder, or move to Blaze for pennies | **$25**: about 6 GB egress a month is over the free 5 GB, so Pro | **$0**: about 12,000 requests and 20,000 rows written a day |
| **10,000 DAU** (30,000 MAU) | **about $7–8**: reads about $2.25, writes about $4.90, storage about $0.30 (3 GB) | **$25**: within Pro's included 100,000 MAU, 8 GB and 250 GB | **$5**: over the free 100,000 requests a day, but about 3.6 million requests and 6 million rows written a month is inside Paid's included amounts |

**How the Firebase figure at 10,000 DAU is worked out:**

| Item | Daily use | Above the free amount | Monthly cost |
|---|---|---|---|
| Reads | 300,000 | 250,000 | 250,000 × $0.03 / 100,000 × 30 days ≈ **$2.25** |
| Writes | 200,000 | 180,000 | 180,000 × $0.09 / 100,000 × 30 days ≈ **$4.86** |
| Storage | 30,000 users × about 100 KB ≈ 3 GiB | 2 GiB | 2 × $0.15 ≈ **$0.30** |

**Storage, the other limit that can bite:**

| Option | Free storage | Users that fit at about 50 KB each | At 450 KB each (heavy users) |
|---|---|---|---|
| Firebase | 1 GiB | about 20,000 | about 2,000 |
| Supabase | 500 MB | about 10,000 | about 1,000 |
| D1 | 5 GB | about 100,000 | about 10,000 |

**Hidden costs are the same for all three:**
- the domain you already pay for;
- time spent on privacy and deletion requests;
- for option C, your time maintaining the security code.

---

## Recommendation

**Option A, Firebase.**
- It is the only one with offline caching and live sync built in, which this app needs.
- It costs nothing up to about 1,000 daily signed-in users, and single-digit dollars at 10,000.
- It needs no server.

**Guardrails:**
- Start on Spark, which has no billing at all.
- Move to Blaze only with a **budget alert** set, at for example $5 a month.

**Pick C instead if:** you want a portfolio piece showing backend skills, or no vendor lock-in.
It would cost $0 to $5 a month, plus roughly double the build time.

**Pick B if:** you want SQL access to the data, for example to analyse how people study. Budget
for the $25 Pro plan once there's real traffic.

---

## What to sync, and how two devices are merged

| Key | Sync? | Merge rule |
|---|---|---|
| `guide-progress` | yes | per guide, the furthest status wins (completed beats in-progress) |
| `sr-schedule` | yes | per question, the most recent review wins |
| `study-stats` | yes | recompute from the merged review history, or keep the maximum |
| `bookmarks`, `checkpoints` | yes | union by id, with deletion markers so a removal syncs instead of coming back |
| `playground-progress` | yes | solved: once true, stays true. Drafts: the newest edit wins |
| `theme`, `readingFontSize`, `last-minute-mode`, editor layout keys | no | they belong to the device |

The merge rules are pure functions in `src/lib/`, tested like everything else there.

---

## Build plan

Estimates are for option A. Option C adds about one to two weeks for the Worker, the session
handling and the security work.

### Phase 1: make storage sync-ready (done 2026-10-14, branch `accounts-sync`)
- `src/lib/syncKeys.ts`: `SYNCED_KEYS` (the 7 progress keys, including interview attempts) and
  `DEVICE_KEYS`. `storageKeys.test.ts` fails unless every pinned key is in exactly one list.
- `storage.ts`: `onSyncedWrite(listener)` reports every successful write or removal of a synced
  key in localStorage. A throwing listener cannot fail the save.
- `src/lib/syncMerge.ts`: `mergeSyncedValue(key, base, local, remote)`, a **three-way** merge.
  `base` is the copy from the last successful sync, so a change made on one side (including a
  deletion or an un-complete) wins without timestamps. That replaced the planned `updatedAt` on
  every record and per-item deletion markers, so **no stored data changes shape** and nothing
  needs migrating. Only when both sides changed one entry does the per-key rule above decide.
  With no base (first sign-in) the copies are unioned. Counters in `study-stats` add each
  side's increase since the base, or take the larger total without one.
- Tests: `syncMerge.test.ts` and the new cases in `storage.test.ts`; each was probed by
  reintroducing the bug it guards. Phase 3 must store the base per user after each sync.

### Phase 2: sign-in (done 2026-10-14, branch `accounts-sync`; sign-in tested on localhost)

Built: `lib/account.ts` (lazy SDK, popup sign-in, `account-hint` device key, error messages),
`lib/firebaseConfig.ts`, `hooks/useAccount.ts`, `components/AccountControl.tsx` in the sidebar
footer. Shown only in development or a build with `VITE_ACCOUNTS=on` until sync ships; the
production build without it contains no Firebase code. With it on, Firebase is one lazy
**39 KB gzipped** chunk (Firebase 13.0.0), not precached, and the app chunk grows ~1 KB.
`account.test.ts` fails on any static `firebase/*` import. Sign-out only signs out for now:
the keep/remove dialog comes with phase 3, when an account copy exists to fall back on.
Sync now, Export and Delete account come in phases 3–4.

Original plan:
- A "Sign in with Google" button in the sidebar, and an account menu with Sync now, Sign out,
  Export my data and Delete account.
- **Load the Firebase SDK only when needed:** when someone clicks Sign in, or was already signed
  in. Nothing is added to first paint, as CLAUDE.md rule 9c requires.
- Use **popup** sign-in, and add `prephub.sreenathp.com` to the authorised domains.

### Phase 3: the sync engine (built 2026-10-14; rules not yet deployed)

Built:
- `firestore.rules` (owner-only `users/{uid}/data/{key}`, only the synced keys, exactly
  `{ value: string ≤ 900,000 chars, updatedAt: server time }`), `firebase.json`, `.firebaserc`.
  `npm run test:rules` runs `firestore/rules.emulator.test.ts` in the emulator (needs Java 21+);
  `npm run deploy:rules` deploys. `src/lib/firestoreRules.test.ts` pins the rules' key list to
  `SYNCED_KEYS`.
- `lib/syncEngine.ts` against a `RemoteStore` interface; `lib/firestoreRemote.ts` is the
  Firestore one (value stored as a JSON string, so free-text keys need no escaping). Remote
  snapshots merge into localStorage at once; local saves push after 3 s; each push is a
  read-merge-write **transaction**, so two devices pushing together can't overwrite each other.
  The merge base lives in `sync-base` (per account). A key missing on the device merges with no
  base, so it can never wipe the account copy. Offline: changes stay local, status says so, and
  they push on the `online` event or every 30 s.
- `storage.ts` `setJSONFromSync`: listeners get `fromSync`, so the engine doesn't re-upload
  what it received, and `hooks/useSyncedReload.ts` makes the six progress hooks re-read.
- UI: sync status under the name, a one-time "Progress from this device was added to your
  account" notice, and `SignOutDialog` (keep or remove; remove is enabled only after a
  successful flush, and stops the engine before clearing storage).
- Tests: `syncEngine.test.ts` (11 cases with an in-memory Firestore), each probed by
  reintroducing its bug.

Original plan:
- **Layout:** one document per key per user, at `users/{uid}/data/{key}`. Split the playground
  drafts into one document per challenge if they approach Firestore's 1 MiB document limit.
- **First sign-in:** merge the local data with the cloud copy, write the result to both, and
  show "Progress from this device was added to your account."
- **After that:** local changes are batched and written every few seconds. A live listener
  applies changes from other devices through the merge functions. Offline writes queue up and
  go out when the connection returns.
- **Security rules:** a user can read and write only `users/{their own uid}/**`. Test the rules
  in CI with the Firebase emulator.

### Phase 4: a proper account (built 2026-10-14)

Built: an account menu (⋯ next to the name) with **Export my data** (`lib/exportData.ts`, the
synced keys as JSON, from this device's copy), **Sign out** and **Delete account**
(`DeleteAccountDialog`: stops sync, batch-deletes `users/{uid}/data/*`, clears `sync-base`,
deletes the Firebase user, re-authenticating in a popup if Google asks; progress on the device
is kept). `/privacy` gains "If you sign in with Google" and `/terms` mentions the optional
account, both only when `ACCOUNTS_ENABLED`. The home line reads "no account needed". GA never
receives the email or uid (nothing sends them). Not yet tested by hand: Delete account.

Original plan:
- Export my data as JSON, and Delete my account and data, with no support email needed.
- **Rewrite `/privacy` and `/terms`:** today they say "no accounts" and "data stays in your
  browser". They must say what is stored, where, for how long, and how to delete it.
- Google Analytics must never receive the email address or the user ID.

### Phase 5: rollout (about 1 week, mostly waiting)
- Put sign-in behind a feature flag and use it on two devices for a week.
- Measure real reads and writes per user, and compare them with the estimates above.
- Turn it on for everyone, and announce it in What's New.

---

## Project setup (option A chosen)

Firebase project `sree-90321`, web app registered 2026-10-14. These values are public by design
(every Firebase web app ships them to the browser); the security rules protect the data.

```js
const firebaseConfig = {
  apiKey: 'AIzaSyBNy78Th-3EAPTp9gWLHfJlq3IW1cS7DLo',
  authDomain: 'sree-90321.firebaseapp.com',
  projectId: 'sree-90321',
  storageBucket: 'sree-90321.firebasestorage.app',
  messagingSenderId: '947518705595',
  appId: '1:947518705595:web:a27a2eaedb86833187fe9e',
};
```

`databaseURL` from the console snippet is left out: it belongs to the Realtime Database, and the
plan uses Firestore.

Console checklist:
- [x] Project and web app registered
- [x] Public-facing name "Prephub" and support email set (Project settings → General)
- [x] Authentication: Google provider enabled, `prephub.sreenathp.com` authorised
- [x] Firestore `(default)`, Standard edition, Native mode, production rules, region **asia-south1**
  (Mumbai). The project's 2018 Datastore-mode database was deleted first; Firebase can't use one.
- [x] Google Auth Platform: External, **In production**; branding (name, support email, home,
  privacy and terms links, authorised domain `sreenathp.com`, no logo) saved
- [x] Branding published
- [x] OAuth web client exists (Firebase did not create one when Google was enabled; fixed
  2026-10-14). Its secret lives only in the Firebase Google-provider settings, never in the repo
- [x] API key restricted to `prephub.sreenathp.com`, `localhost:5173`, `sree-90321.firebaseapp.com`
  (add `localhost:4173` too if sign-in should work under `npm run preview`)
- [x] Firebase CLI 15.33.0 installed and logged in; `firebase projects:list` shows `sree-90321`
- [x] Java **21+** for the emulator (firebase-tools 15 refuses older). OpenJDK 21 installed
  2026-10-14; if `java -version` still says 17, put `jdk-21…\bin` first on PATH
- [x] Rules tests pass in the emulator (6/6; probed with a loosened read rule)
- [x] Rules deployed (`npm run deploy:rules`, 2026-10-14); first real sync showed "Progress synced"

## Decisions (all made 2026-10-14)

1. **Option:** A, Firebase.
2. **Drafts:** synced from day one, along with solved state.
3. **Signing out:** ask each time: "Keep progress on this device" or "Remove it from this device".
   The account copy is never touched by signing out.
4. **Guest mode:** permanent. Everything works with no account; signing in only adds sync.

---

## Sources (checked 2026-10-14)

- Firebase pricing (Spark and Blaze limits): https://firebase.google.com/pricing
- Firestore billing (free quota, listener and query read rules): https://firebase.google.com/docs/firestore/pricing
- Firestore per-operation and storage prices: https://cloud.google.com/firestore/pricing
- Firebase Authentication limits: https://firebase.google.com/docs/auth/limits
- Supabase pricing: https://supabase.com/pricing
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
