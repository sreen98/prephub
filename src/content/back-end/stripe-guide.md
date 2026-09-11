# Stripe Integration — Complete Guide

Stripe is the dominant payments-API platform — most modern web apps that take card payments either use Stripe directly or use a wrapper around it (Shopify, Substack, GitHub Sponsors, etc., all run on Stripe). Knowing Stripe's contract well — keys, webhooks, idempotency, the PaymentIntent state machine, and the race-condition pitfalls around coupons and refunds — is increasingly a baseline expectation for full-stack interviews at companies that handle money.

This guide covers the Stripe API contract end-to-end with a backend-engineer focus: server-side flows, webhook handling, idempotency, race conditions, subscription lifecycle, and the safety nets the platform expects you to build.

## Table of Contents

- [1. What is Stripe?](#1-what-is-stripe)
- [2. API Keys and Account Setup](#2-api-keys-and-account-setup)
- [3. Architecture — Client / Server Split](#3-architecture-client-server-split)
- [4. Integration Paths — Elements vs Checkout vs Payment Element](#4-integration-paths-elements-vs-checkout-vs-payment-element)
- [5. PaymentIntent — The Modern Charge Flow](#5-paymentintent-the-modern-charge-flow)
- [6. Webhooks](#6-webhooks)
- [7. Idempotency Keys](#7-idempotency-keys)
- [8. Customers and Saved Payment Methods](#8-customers-and-saved-payment-methods)
- [9. Subscriptions and Recurring Billing](#9-subscriptions-and-recurring-billing)
- [10. Coupons and Promotion Codes](#10-coupons-and-promotion-codes)
- [11. Refunds and Disputes](#11-refunds-and-disputes)
- [12. Strong Customer Authentication (SCA / 3D Secure)](#12-strong-customer-authentication-sca-3d-secure)
- [13. Stripe Connect — Marketplaces and Platforms](#13-stripe-connect-marketplaces-and-platforms)
- [14. PCI Compliance and Security](#14-pci-compliance-and-security)
- [15. Testing and Local Development](#15-testing-and-local-development)
- [16. Common Patterns and Gotchas](#16-common-patterns-and-gotchas)
- [17. Interview Questions & Answers](#17-interview-questions-answers)
- [18. Tricky Questions](#18-tricky-questions)
- [References](#references)

---

## 1. What is Stripe?

Stripe is a **payment-processing platform** with REST APIs, SDKs in every major language, hosted UI components, and a webhook-driven event model. The mental model:

- **You** describe the money movement (charge $50, set up a $10/mo subscription, refund half of order #42).
- **Stripe** handles card networks, fraud detection, 3DS authentication, retries, and compliance.
- **You** listen to webhook events for finality and update your database.

What Stripe is *not*: a database for your application's source of truth. Stripe knows about its own objects (PaymentIntents, Customers, Subscriptions). It doesn't know about your User, Order, or Cart models. Your job is to stitch them together via webhooks and metadata.

**Core resources:**

```
Customer        — represents a person/entity who pays you
PaymentMethod   — a card or bank account attached to a Customer
PaymentIntent   — a single intent to collect money (one charge attempt)
SetupIntent     — collect a payment method without charging (for later use)
Charge          — the resulting transaction (created from a PaymentIntent)
Refund          — money returned to the customer
Subscription    — recurring billing on a schedule
Price           — a recurring or one-time price ($10/mo, $99 one-time)
Product         — a thing you sell (the Subscription's Price points to it)
Coupon          — discount that can apply to invoices
PromotionCode   — a customer-facing code that maps to a Coupon
Invoice         — itemized bill, generated for subscriptions
Event           — a thing that happened, delivered via webhook
```

Stripe is famously API-first: most operations have direct REST equivalents. The dashboard is a thin client over the same API.

---

## 2. API Keys and Account Setup

Two key types, two environments. Mixing them up is the most common source of mysterious 401 errors.

```
| Key                  | Where it's used                | Sample format        |
|----------------------|--------------------------------|----------------------|
| Publishable key      | Browser / mobile (safe to ship)| pk_test_… / pk_live_…|
| Secret key           | Server only (NEVER ship)       | sk_test_… / sk_live_…|
| Restricted key       | Server (scoped permissions)    | rk_test_… / rk_live_…|
| Webhook signing      | Server-side webhook verify     | whsec_…              |
```

- **Publishable key** identifies your account to Stripe.js for tokenizing card details. Safe in the browser bundle; the worst an attacker can do with it is generate test tokens.
- **Secret key** authorizes server-side API calls (creating PaymentIntents, refunds, customers). Treat it like a database password. Leak = financial blast radius.
- **Restricted keys** are secret keys with a scoped permission set (e.g., "can create PaymentIntents but not refunds"). Use these for services that don't need full access — limits the damage of a leaked key.
- **Test mode vs Live mode** — every object you create in test mode is invisible in live mode and vice versa. Test mode never moves real money. Use it heavily during development.

**Storing keys in production:**

- Never commit keys to git, even `pk_live_*` (which is harmless but signals account leakage).
- Use environment variables, secrets managers (AWS Secrets Manager, GCP Secret Manager, Vault).
- **Rotate immediately** if a secret key is exposed — Stripe dashboard has a "roll key" button that issues a new one and revokes the old.

---

## 3. Architecture — Client / Server Split

The single most important rule with Stripe: **card numbers never touch your server.** This is what keeps you out of expensive PCI compliance scope (see §14). The client tokenizes the card directly with Stripe; your server only sees a token.

```
           ┌──────────────┐    1. card number    ┌────────┐
           │   Browser    │  ────────────────▶   │ Stripe │
           │ (Stripe.js)  │                      │  API   │
           │              │  ◀────────────────   │        │
           │              │    2. payment        └────────┘
           │              │       method id
           └──────┬───────┘            (token, e.g. pm_1Abc…)
                  │ 3. token
                  ▼
           ┌──────────────┐    4. create PI       ┌────────┐
           │ Your server  │  ────────────────▶   │ Stripe │
           │              │  ◀────────────────   │  API   │
           │              │    5. client_secret  └────────┘
           └──────┬───────┘
                  │ 6. client_secret
                  ▼
           ┌──────────────┐    7. confirm        ┌────────┐
           │   Browser    │  ────────────────▶   │ Stripe │
           │              │  ◀────────────────   │  API   │
           │              │    8. payment result └────────┘
           └──────────────┘
                  ▲                                  │
                  │     9. webhook                   │
                  │  payment_intent.succeeded        │
           ┌──────┴──────┐  ◀─────────────────────  │
           │ Your server │                          │
           └─────────────┘                          ▼
```

The client gets a `client_secret` from your server (which holds the secret key) and uses it to confirm the payment directly with Stripe. The actual card details and confirmation result flow client ↔ Stripe, never client → server → Stripe. Your server learns the outcome via webhook, not via the client's "success" callback.

---

## 4. Integration Paths — Elements vs Checkout vs Payment Element

Three Stripe-provided UI options, in increasing order of "Stripe handles more":

```
| Path              | UX control          | Server work | Best for                            |
|-------------------|---------------------|-------------|-------------------------------------|
| Stripe Elements   | Full custom UI      | High        | Tightly branded apps                |
| Payment Element   | Pre-styled, multi-method | Medium  | Most modern apps (recommended)      |
| Checkout (hosted) | Stripe-hosted page  | Minimal     | MVPs, small teams, multi-currency   |
```

**Stripe Elements** — granular React/JS components for individual fields (`<CardNumberElement>`, `<CardExpiryElement>`). You design the form completely. Most flexibility, most code.

**Payment Element** — single drop-in component that renders the right UI for every payment method (card, Apple Pay, Google Pay, ACH, BNPL like Klarna/Affirm, regional methods). Stripe maintains the UI; you get every payment method you've enabled in the dashboard automatically.

```jsx
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripe = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ clientSecret }) {
  return (
    <Elements stripe={stripe} options={{ clientSecret }}>
      <PaymentElement />        {/* card, wallets, BNPL, all in one */}
      <button onClick={confirm}>Pay</button>
    </Elements>
  );
}
```

**Checkout** — fully hosted page at `checkout.stripe.com`. You redirect the user; Stripe handles the entire payment UI. Lowest engineering effort, least branding.

```js
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{ price: 'price_…', quantity: 1 }],
  success_url: 'https://yoursite.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://yoursite.com/cart',
});
res.redirect(session.url);   // Stripe renders the UI
```

**Pick by team size:** small team or MVP → Checkout. Standard e-commerce → Payment Element. Tightly designed bespoke flow (e.g., custom subscription paywall) → Elements.

---

## 5. PaymentIntent — The Modern Charge Flow

The PaymentIntent (PI) replaced the older Charges API in 2019. It's a state machine that knows about retries, 3D Secure authentication, and async confirmation — the older Charges API didn't.

**The states:**

```
requires_payment_method   ← initial state, no card attached yet
        ↓
requires_confirmation     ← card attached, waiting for confirm()
        ↓
requires_action           ← needs 3DS or other auth (SCA)
        ↓
processing                ← Stripe is working (e.g., async ACH)
        ↓
succeeded                 ← money moved, you can fulfill the order
        OR
canceled                  ← intentionally aborted
```

**Server-side creation (typical):**

```js
// 1. User clicks "Pay" — server creates the PaymentIntent
const pi = await stripe.paymentIntents.create({
  amount: 4999,              // in CENTS (always integer minor units)
  currency: 'usd',
  customer: 'cus_…',
  metadata: { order_id: 'order_42' },   // your business id, for webhook lookup
  automatic_payment_methods: { enabled: true },
}, {
  idempotencyKey: `pi-create-${orderId}`,   // see §7
});

// 2. Server returns the client_secret (NOT the full PI)
res.json({ clientSecret: pi.client_secret });
```

**Client-side confirmation:**

```js
const { error, paymentIntent } = await stripe.confirmPayment({
  elements,
  confirmParams: { return_url: `${origin}/order/complete` },
});
// Don't trust this result for fulfillment — wait for the webhook.
```

**Critical**: the client's `paymentIntent.status === 'succeeded'` is **suggestive but not authoritative**. The user could close the tab, the network could fail mid-call, the response could be tampered with. The source of truth for "did we get paid" is the webhook event `payment_intent.succeeded` (see §6).

### 5.1 Amount in minor units

Always integers. `$49.99` → `4999`. JPY (no minor units) → just `4999` for ¥4,999. **Never** float math: `Math.round(price * 100)` and only at the boundary.

### 5.2 Why not the old Charges API

Charges synchronously charged the card and returned success/failure. SCA (mandatory 3DS in Europe since 2019) needs an *async* step where the user authenticates on their bank's page mid-flow — Charges can't model that. PaymentIntent has an explicit `requires_action` state for it.

Don't write new code against `stripe.charges.create()`. It still exists for backwards compat but is functionally deprecated.

---

## 6. Webhooks

Webhooks are **the source of truth** for what happened on Stripe's side. Anything you do based on the client's response is provisional; commit fulfillment when the webhook arrives.

### 6.1 The basic shape

```js
// Express endpoint
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const pi = event.data.object;
      fulfillOrder(pi.metadata.order_id, pi.amount_received);
      break;
    case 'payment_intent.payment_failed':
      notifyUserOfFailure(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      extendSubscription(event.data.object);
      break;
  }

  res.status(200).end();
});
```

**Use raw body** — the signature is computed over the original bytes. JSON-parsed body won't verify.

### 6.2 Signature verification — non-optional

Without verification, anyone who guesses your URL can POST fake events that say "payment succeeded" and trigger fulfillment for unpaid orders. The signature is an HMAC of `timestamp.body` keyed by your webhook secret — Stripe's SDK has `constructEvent()` that does it correctly.

### 6.3 Idempotency — Stripe will retry

Stripe retries webhook deliveries with exponential backoff for up to **3 days** if your endpoint returns non-2xx or times out (after 30 seconds). Two implications:

1. **Same event will arrive multiple times.** You need to handle duplicates.
2. **A long-running handler will trigger retries.** Acknowledge fast (2xx + 200 within seconds), enqueue the heavy work to a background queue.

The standard idempotent webhook pattern:

```js
async function handleWebhook(event) {
  // Insert into a `processed_events` table; let the unique key throw if dup.
  try {
    await db.processedEvents.insert({ id: event.id, type: event.type });
  } catch (e) {
    if (isUniqueConstraintError(e)) return;   // already processed, skip
    throw e;
  }
  await actuallyProcessEvent(event);
}
```

Or check-then-process (with a transaction):

```js
await db.transaction(async (trx) => {
  const exists = await trx('processed_events').where({ id: event.id }).first();
  if (exists) return;
  await processEvent(event, trx);
  await trx('processed_events').insert({ id: event.id });
});
```

Every Stripe `Event` has a stable `event.id` you can use as the dedup key.

### 6.4 Replay attacks

The signature scheme includes a timestamp. By default, Stripe's SDK rejects events older than 5 minutes. Without that check, a captured webhook payload could be replayed forever.

### 6.5 Events you'll commonly handle

```
payment_intent.succeeded             — fulfill the order
payment_intent.payment_failed        — notify, retry, or refund stock
charge.refunded                      — credit back, decrement metrics
checkout.session.completed           — same as payment_intent.succeeded for Checkout
invoice.payment_succeeded            — extend subscription
invoice.payment_failed               — start dunning flow, email user
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted        — cancel access on plan end
charge.dispute.created               — chargeback opened, gather evidence
```

---

## 7. Idempotency Keys

Stripe's API accepts an **`Idempotency-Key`** header on POST requests. Same key = same response, even if the request is retried. Critical for "did the request actually fail, or did it succeed but my response got lost?" scenarios — common on flaky mobile networks.

```js
// First call: creates the PaymentIntent
const pi1 = await stripe.paymentIntents.create({ amount: 5000, currency: 'usd' }, {
  idempotencyKey: 'pi-create-order-42-attempt-1',
});

// Network blip, you retry with the SAME key:
const pi2 = await stripe.paymentIntents.create({ amount: 5000, currency: 'usd' }, {
  idempotencyKey: 'pi-create-order-42-attempt-1',
});

// Stripe returns the SAME PaymentIntent — no duplicate created.
console.log(pi1.id === pi2.id);   // true
```

**Picking idempotency keys:**

- **Tie to the business operation, not the HTTP request.** `pi-create-order-42` is stable across retries; `pi-create-${Date.now()}` is not.
- Stripe stores keys for **24 hours**. Same key after 24h gets a fresh response.
- Different request body + same key = error. Stripe returns the *original* response and a header signaling the body mismatch.

**Where idempotency is mandatory:**

- Anywhere a retry could create a duplicate (PaymentIntents, Refunds, Transfers, Subscriptions).
- Anywhere your client retries on its own (most HTTP libraries, queue workers, etc.).

**Where it's optional but cheap:** every state-changing call. The downside is zero; the upside is "won't double-charge if the network blips."

---

## 8. Customers and Saved Payment Methods

A `Customer` in Stripe is a person + their payment methods + subscription history. It's how you do "saved cards," "subscription billing," and "send this user 3 invoices a year."

```js
// Create on signup
const customer = await stripe.customers.create({
  email: 'ana@example.com',
  metadata: { user_id: '42' },
});

// Save the Stripe customer id on your User row
await db.users.update(42, { stripe_customer_id: customer.id });
```

**Saving a card for later use:**

```js
// Use a SetupIntent (no charge, just attach the method)
const si = await stripe.setupIntents.create({
  customer: customer.id,
  payment_method_types: ['card'],
  usage: 'off_session',   // we'll charge them later without their presence
});
// Client confirms si.client_secret — card is attached to the customer.

// Later, charge that saved card:
const pi = await stripe.paymentIntents.create({
  amount: 1500,
  currency: 'usd',
  customer: customer.id,
  payment_method: paymentMethodId,
  off_session: true,
  confirm: true,
});
```

**`off_session: true`** is required when charging without the customer present (recurring, automated billing). It tells the bank "this is a saved-card transaction" and may avoid SCA challenges; without it, the charge may fail with `authentication_required` even for a previously-authenticated card.

---

## 9. Subscriptions and Recurring Billing

The model: a `Customer` has one or more `Subscriptions`, each pointing to a `Price` (one of your `Product`s). Stripe generates an `Invoice` on every billing cycle and attempts to charge the saved payment method.

**Creating a subscription:**

```js
const sub = await stripe.subscriptions.create({
  customer: 'cus_…',
  items: [{ price: 'price_monthly_pro' }],
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent'],
});

// Hand the client the PI's client_secret to confirm the first payment
res.json({
  subscription_id: sub.id,
  client_secret: sub.latest_invoice.payment_intent.client_secret,
});
```

`payment_behavior: 'default_incomplete'` is the modern default — the subscription is created in `incomplete` state, the user confirms the first invoice's PI, and only on success does the subscription move to `active`. This handles the SCA-required case correctly.

**Lifecycle states:**

```
incomplete           — created, awaiting first payment
incomplete_expired   — first payment failed for 24h, sub abandoned
trialing             — in free trial period
active               — paid up
past_due             — invoice failed, dunning in progress
canceled             — terminated
unpaid               — dunning gave up
```

**Dunning** — Stripe will retry failed renewal payments on a schedule (default 4 retries over 1–3 weeks). After dunning fails, Stripe fires `customer.subscription.deleted` (depending on settings). Your job: listen and revoke access.

**Proration** — when the user upgrades mid-cycle, Stripe credits the unused portion of the old plan and charges the prorated upgrade. Configurable via `proration_behavior: 'create_prorations'` (default) or `'none'`.

**Pause vs cancel** — pausing keeps the subscription but skips invoice generation. Cancel ends it. Both can be at-period-end (`cancel_at_period_end: true`) or immediate.

---

## 10. Coupons and Promotion Codes

This is one of the trickiest areas in Stripe — and one of the most common interview-question source-areas because the race conditions, idempotency, and data-modeling questions all live here.

### 10.1 Coupon vs Promotion Code

**Coupon** — the underlying discount. `25% off`, `$10 off`, `30% off for 3 months`. Identified by an internal code (e.g., `coupon_xyz`) you choose. Not customer-facing.

**Promotion Code** — a customer-facing alias for a coupon. `SUMMER25` is a Promotion Code that maps to coupon `coupon_summer_25_pct`. You can create many Promotion Codes pointing to the same Coupon, each with different restrictions (per-customer limits, expiration, max redemptions, etc.).

**Why this split exists:** you can give different users different codes (`ANA-VIP`, `BOB-VIP`) all backed by the same underlying discount, with per-code redemption tracking.

```js
// 1. Create the underlying discount
const coupon = await stripe.coupons.create({
  id: 'summer-25',
  percent_off: 25,
  duration: 'once',                 // 'once' | 'repeating' | 'forever'
  max_redemptions: 1000,            // global cap
});

// 2. Create a customer-facing code
const promo = await stripe.promotionCodes.create({
  coupon: 'summer-25',
  code: 'SUMMER25',
  max_redemptions: 1000,            // per-code cap
  expires_at: Math.floor(Date.now() / 1000) + 30 * 86400,
  restrictions: {
    first_time_transaction: true,   // new customers only
    minimum_amount: 5000,           // $50 min order
    minimum_amount_currency: 'usd',
  },
});
```

### 10.2 Applying a coupon

To a one-off PaymentIntent: you compute the discount yourself and pass the discounted amount. PaymentIntent doesn't have a `coupon` field.

To a Subscription / Invoice: pass `discounts: [{ promotion_code: 'promo_…' }]` and Stripe does the math, including handling proration correctly.

```js
const sub = await stripe.subscriptions.create({
  customer: 'cus_…',
  items: [{ price: 'price_monthly_pro' }],
  discounts: [{ promotion_code: 'promo_xyz' }],
});
```

### 10.3 The Coupon Race Condition (a real interview question)

> *"You have a Stripe coupon with `max_redemptions: 100`. A user enters the code at checkout. You validate it ('is it valid? is it not yet exhausted?'). Then the user takes 30 seconds to fill in their card. Meanwhile, 5 other users redeem the coupon. By the time your user submits, the coupon is exhausted. How do you prevent this?"*

This is a **time-of-check vs time-of-use (TOCTOU)** race. The validation and the redemption are separated in time, and any number of concurrent transactions can land in between. Three layers of defense, used together:

**Layer 1 — Let Stripe enforce the cap atomically.**

Don't reproduce Stripe's `max_redemptions` count in your application. When you actually redeem (i.e., create the PaymentIntent / Subscription with the discount), Stripe will reject the call atomically if the cap was hit. The validation step in your UI is *advisory*; the binding check happens server-side at redemption time. You handle the rejection gracefully:

```js
async function run() {
  try {
    const sub = await stripe.subscriptions.create({
      customer,
      items: [{ price }],
      discounts: [{ promotion_code: promoId }],
    });
  } catch (err) {
    if (err.code === 'coupon_expired' || err.code === 'promotion_code_limit_reached') {
      return { error: 'Sorry, this coupon was just claimed. Please try a different code.' };
    }
    throw err;
  }
}
```

This single layer prevents the most common variant of the bug: Stripe is the single source of truth on the global cap, and its check is atomic with the redemption.

**Layer 2 — Reserve the coupon application-side for per-user constraints.**

Stripe enforces global caps (`max_redemptions`) and per-customer caps (`first_time_transaction`, customer-scoped Promotion Codes). For *your* business rules — "this code can only be used once per email," "this code only applies to orders over $50" — you need an application-side check:

```sql
-- Schema
CREATE TABLE coupon_redemptions (
  id              SERIAL PRIMARY KEY,
  user_id         INT NOT NULL,
  promotion_code  TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('reserved', 'committed', 'expired')),
  reserved_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  committed_at    TIMESTAMP,
  expires_at      TIMESTAMP NOT NULL,
  stripe_pi_id    TEXT,
  UNIQUE (user_id, promotion_code, status) WHERE status IN ('reserved', 'committed')
);
```

The unique constraint enforces "one active redemption per (user, code)" — duplicate inserts throw. Now the flow is:

```js
async function applyCoupon(userId, code) {
  // 1. Reserve in your DB (atomic via unique constraint)
  await db.couponRedemptions.insert({
    user_id: userId,
    promotion_code: code,
    status: 'reserved',
    expires_at: new Date(Date.now() + 15 * 60 * 1000),    // 15 min TTL
  });
  // If this throws on the unique constraint → user already has an active reservation.
}

async function checkout(userId, code) {
  // 2. Verify reservation is still active
  const reservation = await db.couponRedemptions.findOne({
    user_id: userId,
    promotion_code: code,
    status: 'reserved',
  });
  if (!reservation || reservation.expires_at < new Date()) {
    throw new Error('Coupon reservation expired — please re-enter the code');
  }

  // 3. Create the PaymentIntent / Subscription with the discount.
  //    Stripe will reject if its own caps are hit (Layer 1).
  const pi = await stripe.paymentIntents.create({ /* ... */ }, {
    idempotencyKey: `pi-${userId}-${reservation.id}`,
  });

  // 4. Commit happens in the webhook, NOT here.
  await db.couponRedemptions.update(reservation.id, { stripe_pi_id: pi.id });
}

// 5. In the webhook handler — this is the binding moment
async function handleWebhook(event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      await db.couponRedemptions.update({
        stripe_pi_id: event.data.object.id,
      }, {
        status: 'committed',
        committed_at: new Date(),
      });
      break;
  }
}
```

The reservation gives you a 15-minute window during which the user "owns" the discount. Concurrent redemption attempts by the same user fail at the unique-constraint level. Stripe still enforces the global cap independently.

**Layer 3 — Idempotency keys on the redemption.**

Tie the idempotency key to the reservation id (or order id), not the request. If the user clicks "Pay" twice, both calls hit the same key and Stripe returns the same PaymentIntent — no double-redemption.

```js
const pi = await stripe.paymentIntents.create({ /* ... */ }, {
  idempotencyKey: `redeem-${reservation.id}`,
});
```

**The combined picture:**

```
Time  User               Your Server                 DB                Stripe
────  ─────              ───────────                 ──                ──────
 t0   Enter "SUMMER25"   ── reserve(user, code) ──▶  INSERT (UNIQUE)
                                                     reserved
 t1   ── 30 sec idle filling card form ──
 t2   Click Pay          ── verify reservation ──▶   row exists?
                         ── PaymentIntent.create ──▶ ── Stripe enforces cap ──▶ Stripe
                         ── (idempotency key) ───▶                              ↓ atomic
                                                                                ↓ either
                                                                                ↓ accept
                                                                                ↓ or 'limit_reached'
                                                     ◀── PI client_secret
 t3   Confirm w/ Stripe.js                                            ◀── confirm ─── Stripe
 t4                       ◀── webhook  ─────────────                                  ↓
                          ── commit redemption ──▶   status: committed
```

**Common mistakes to avoid:**

- **Tracking redemptions only in your app DB** without using Stripe's `max_redemptions`. Two requests racing in the gap between your validate and your insert will both pass — your unique constraint isn't enough on its own without the reservation TTL.
- **Committing in the client's success callback** instead of the webhook. The user's tab might close before the callback runs; the webhook is guaranteed to arrive (eventually).
- **Reservation without TTL.** If a reservation never expires, abandoned carts hold codes forever. Always set `expires_at`.

### 10.4 First-time-customer codes

Stripe Promotion Codes have `restrictions.first_time_transaction: true`. With this set, Stripe automatically rejects the code if the customer has any prior successful charge. You don't need to track this yourself.

For "one per customer email," create per-customer Promotion Codes scoped to a specific Customer:

```js
const promo = await stripe.promotionCodes.create({
  coupon: 'returning-customer-10',
  customer: 'cus_…',                   // scoped to one customer
  code: 'WELCOMEBACK',
});
```

---

## 11. Refunds and Disputes

### 11.1 Refunds

Refunds are PaymentIntent-scoped:

```js
const refund = await stripe.refunds.create({
  payment_intent: 'pi_…',
  amount: 1500,                        // partial refund (or omit for full)
  reason: 'requested_by_customer',     // 'duplicate' | 'fraudulent' | 'requested_by_customer'
}, {
  idempotencyKey: `refund-${orderId}`, // double-click protection
});
```

The webhook event is `charge.refunded`. Money returns to the customer's card in 5–10 business days; on Stripe's side, it's instant.

Partial refunds across multiple calls are fine — Stripe tracks how much remains refundable on the original PaymentIntent. You can't refund more than the original.

### 11.2 Disputes (Chargebacks)

A dispute is the customer telling their bank "this charge was fraudulent / not as described." The bank reverses the funds. Stripe fires `charge.dispute.created`, you have ~7 days to submit evidence (receipts, shipping logs, customer-service emails).

```js
async function handleWebhook(event) {
  switch (event.type) {
    case 'charge.dispute.created':
      // Disputed amount is debited from your Stripe balance immediately
      await db.disputes.insert({
        charge_id: event.data.object.charge,
        amount: event.data.object.amount,
        reason: event.data.object.reason,
        deadline: event.data.object.evidence_details.due_by,
      });
      // Notify ops team to compile evidence
      break;
  }
}
```

**Dispute fees** — Stripe charges $15 per dispute, win or lose. Fraud disputes (`reason: 'fraudulent'`) above 1% of your volume put you on **excessive dispute** programs (Visa's VDMP, Mastercard's MCMP) with extra fees and risk of merchant termination.

---

## 12. Strong Customer Authentication (SCA / 3D Secure)

PSD2 in Europe (since 2019) requires multi-factor authentication for most online card transactions. The user gets pinged by their bank's app or SMS code mid-checkout. Stripe handles this via **3D Secure 2** (`requires_action` state on the PaymentIntent).

The PaymentIntent flow handles SCA automatically — you just need to:

1. Use PaymentIntent (not legacy Charges).
2. Pass `automatic_payment_methods: { enabled: true }` or include `card` in `payment_method_types`.
3. On the client, call `stripe.confirmPayment()` (not the deprecated `confirmCardPayment()`).
4. Render the result. If `pi.status === 'requires_action'`, Stripe.js automatically pops the bank's challenge.

**Off-session charges** (recurring billing) need `off_session: true` on the PaymentIntent. If SCA *is* required and the customer isn't present, the charge fails with `authentication_required`. Your server gets a `payment_intent.payment_failed` webhook; you email the customer with a link to re-authenticate.

**Exemptions** — low-value, low-risk, recurring (after the first), and merchant-initiated transactions can skip SCA. Stripe's Radar handles exemption requests automatically; you don't need to compute them yourself.

---

## 13. Stripe Connect — Marketplaces and Platforms

If your app pays multiple sellers (Shopify, Etsy, Substack model), use Connect. Three flavors:

```
Standard      — sellers have full Stripe accounts; you're a referral partner
Express       — sellers have lightweight Stripe accounts, you do most of the work
Custom        — sellers don't know Stripe exists; you handle everything
```

The platform takes a fee:

```js
const pi = await stripe.paymentIntents.create({
  amount: 10000,                          // $100 buyer pays
  currency: 'usd',
  application_fee_amount: 500,            // $5 platform fee
  transfer_data: { destination: 'acct_seller_xyz' },   // $95 to seller
}, {
  stripeAccount: 'acct_seller_xyz',       // act on behalf of seller
});
```

**KYC** — Connect accounts must complete identity verification (name, address, EIN/SSN, bank account) before they can receive payouts. Stripe provides a hosted onboarding flow — don't try to collect this yourself.

---

## 14. PCI Compliance and Security

PCI DSS (Payment Card Industry Data Security Standard) is the rule book card networks impose on anyone handling card data. Compliance levels are based on transaction volume; even a small merchant must self-assess (SAQ).

**The whole point of Stripe.js / Elements / Checkout is to keep you in SAQ A**, the lightest scope. SAQ A means:
- You never see, store, or transmit primary account numbers (PANs).
- You don't load the card form on a server you control.
- The card entry runs in a Stripe-hosted iframe (Elements) or a Stripe-hosted page (Checkout).

If you ever:
- Submit a card number to your own server (even as proxy)
- Render a card-input field outside of Stripe's iframe
- Log a token along with PII

…you escalate to SAQ A-EP or SAQ D, with much larger compliance overhead (penetration testing, ASV scans, network segmentation, $$$).

**Other practical security:**

- **Restricted keys** for service-to-service calls (see §2).
- **Webhook signature verification** — never accept events without it.
- **Don't log secret keys**, request bodies that contain card data (you shouldn't have any), or webhook payloads with PII (consider truncating before logging).
- **Rotate keys** on personnel changes; treat secret keys like SSH keys.

---

## 15. Testing and Local Development

### 15.1 Test cards

Stripe ships a handful of magic numbers that simulate specific outcomes:

```
4242 4242 4242 4242   — succeeds
4000 0000 0000 0002   — declines (generic)
4000 0000 0000 9995   — declines (insufficient funds)
4000 0025 0000 3155   — requires 3DS authentication
4000 0084 0000 1629   — declines after authentication (post-3DS)
```

Any future expiration date works. CVV: 123. ZIP: any 5 digits. Full list: https://stripe.com/docs/testing.

### 15.2 Webhook testing locally

Stripe events can't reach `localhost`. Two options:

**Stripe CLI** (recommended) — forwards real test-mode events to your local server.

```bash
stripe listen --forward-to localhost:3000/webhook
# Prints a temporary whsec_… you use for signature verification in dev.
```

You can also trigger specific events on demand:

```bash
stripe trigger payment_intent.succeeded
```

**ngrok / cloudflared** — public tunnel to your laptop. More flexible but you have to configure the webhook URL in the Stripe dashboard.

### 15.3 Fixtures and replay

Real webhooks have stable payloads. Capture one (Stripe dashboard → Webhook attempts → JSON), commit as a test fixture, replay against your handler in unit tests.

---

## 16. Common Patterns and Gotchas

```
1.  Never trust client-reported success. Webhook is the source of truth.
2.  Always pass amounts in MINOR units (cents). $49.99 = 4999, not 49.99.
3.  metadata is your friend — store your business id (order_id, user_id)
    on Stripe objects for webhook lookup.
4.  Use idempotency keys on EVERY mutating call, not just retries.
5.  Webhook handlers must return 2xx within ~30s, else Stripe retries.
6.  Webhook signature verification uses RAW body bytes, not parsed JSON.
7.  Don't recreate Customer per checkout — once per user, save the id.
8.  off_session: true is required for charging without user presence.
9.  Subscriptions created with default_incomplete handle SCA correctly.
10. Test mode and live mode are completely separate — don't mix keys.
11. Restricted keys reduce blast radius on leaks; use them for narrow services.
12. Coupons enforced by Stripe (max_redemptions) ARE atomic — don't reproduce in app.
13. For per-user coupon limits, reserve in your DB with a TTL + UNIQUE constraint.
14. Refunds, like charges, need idempotency keys.
15. Disputes deduct funds immediately; don't fulfill anything else for that user.
16. SCA via PaymentIntent + automatic_payment_methods is the simplest path.
17. Connect platforms must handle KYC via Stripe's hosted onboarding.
18. Logging webhook payloads risks PII; sanitize before persisting to logs.
```

---

## 17. Interview Questions & Answers

### Beginner

---

**Q1: What's the difference between a publishable key and a secret key?**

The publishable key (`pk_…`) identifies your account to Stripe.js running in the browser. It's safe to ship in your client bundle — the worst it can do is generate test tokens for your account. The secret key (`sk_…`) authorizes server-side API calls — creating PaymentIntents, refunds, customers, etc. Treat it like a database password; it must never appear in browser code, logs, or git.

Stripe also has **restricted keys** (`rk_…`) which are secret keys with a scoped permission set (e.g., "can create PaymentIntents but not refunds"). These limit blast radius if a key leaks.

---

**Q2: Why does Stripe push you toward client-side card collection (Elements / Checkout)?**

So your servers never touch primary account numbers (PANs). If a card number passes through your code path — even briefly — you escalate from PCI SAQ A (minimal compliance) to SAQ A-EP or SAQ D (full annual audits, network scans, much higher cost). Stripe.js loads the card form in a Stripe-hosted iframe so PCI scope stays on Stripe's servers, not yours.

---

**Q3: What is a PaymentIntent and why did Stripe replace the old Charges API?**

A PaymentIntent is a state machine for collecting a single payment. States: `requires_payment_method` → `requires_confirmation` → `requires_action` (for 3DS) → `processing` → `succeeded` / `canceled`. The Charges API was synchronous — you called `stripe.charges.create()` and got success/failure immediately. That model can't handle 3D Secure (PSD2 / SCA in Europe), which requires an async authentication step where the user goes to their bank's page mid-flow and comes back. PaymentIntent has an explicit `requires_action` state for it. New code should always use PaymentIntent.

---

**Q4: Why is webhook signature verification non-optional?**

Without it, anyone who guesses your webhook URL can POST a fake `payment_intent.succeeded` event and trigger fulfillment for an unpaid order. The signature is an HMAC of `timestamp.body` keyed by your webhook secret — the SDK's `stripe.webhooks.constructEvent()` verifies it. The signature also includes a timestamp; events older than 5 minutes are rejected, preventing replay attacks with captured payloads.

---

**Q5: Amounts in Stripe — gotcha?**

Always in **integer minor units**. $49.99 → 4999 cents. JPY (no minor unit) → 4999 = ¥4,999. Never use floats. Compute in your business-currency math, then `Math.round(price * 100)` only at the API boundary. Mixing units (passing 4999 when you meant $4,999) leads to either undercharges or 100x overcharges; both are bad.

---

### Intermediate

---

**Q6: Why are idempotency keys important and where should you use them?**

An idempotency key tells Stripe "if you've seen this key before, return the same response — don't create a duplicate." It's the single most important defense against double-charges from network retries. Use it on **every state-changing API call**: PaymentIntents, Refunds, Subscriptions, Transfers.

Tie the key to the **business operation**, not the HTTP request: `pi-create-order-42`, not `pi-${Date.now()}`. Stripe stores keys for 24 hours; same key after 24h gets a fresh response. If the request body differs but the key matches, Stripe returns the original response with a header signaling the body mismatch — that's a bug in your code.

---

**Q7: A user pays, then closes their browser before the success page loads. How do you know whether to fulfill the order?**

You don't trust the client at all. The source of truth is the **webhook event** `payment_intent.succeeded`. Your server pipeline:

1. Client confirms payment with Stripe.js → may or may not return success to you.
2. Stripe sends `payment_intent.succeeded` webhook.
3. Your webhook handler verifies signature, checks the `event.id` for dedup, looks up `pi.metadata.order_id`, marks the order paid, fulfills.

The webhook is delivered with retries for up to 3 days, even if your service is briefly down. The client-side success callback is convenient for UX (showing "Thanks!") but never authoritative for business logic.

---

**Q8: How do webhooks handle duplicates? What's your dedup strategy?**

Stripe retries webhook delivery on any non-2xx response or timeout (>30s) with exponential backoff for up to 3 days. So the same event arrives multiple times — guaranteed.

Standard pattern: a `processed_events` table keyed on `event.id`. Insert with a unique constraint; if the insert throws on conflict, return 200 (already processed). Otherwise process and return 200. Wrapping the dedup insert + business logic in a single transaction means a crash mid-process re-runs cleanly.

```js
await db.transaction(async (trx) => {
  if (await trx('processed_events').where({ id: event.id }).first()) return;
  await processEvent(event, trx);
  await trx('processed_events').insert({ id: event.id });
});
```

---

**Q9: What's the difference between a Coupon and a Promotion Code?**

A **Coupon** is the underlying discount (percent off / amount off, duration, max redemptions). It has an internal id like `coupon_xyz`. Not customer-facing.

A **Promotion Code** is a customer-facing alias — `SUMMER25` — that maps to a Coupon. You can have many Promotion Codes pointing to the same Coupon, each with its own restrictions (per-customer limits, expiration, minimum order amount, first-time customer only). Customers type the Promotion Code; Stripe resolves it to the Coupon.

This split lets you give different users different codes (`ANA-VIP`, `BOB-VIP`) all backed by the same discount, with per-code redemption tracking.

---

**Q10: What is `off_session` and when must you use it?**

`off_session: true` on a PaymentIntent tells Stripe "the customer isn't actively present in this checkout flow" — required when charging a saved payment method on a schedule (recurring billing, automated invoices). Without it, the charge may fail with `authentication_required` because European banks require Strong Customer Authentication for most online transactions and need the customer's presence.

`off_session` triggers the merchant-initiated-transaction (MIT) exemption when applicable. If SCA *is* required and the customer isn't there, the charge fails with `authentication_required` and you receive a `payment_intent.payment_failed` webhook — your job is to email the customer with a link to re-authenticate.

---

### Advanced

---

**Q11: Walk me through how to build a marketplace — buyer pays, you take a fee, seller receives the rest.**

Use **Stripe Connect**. Three flavors with different ownership:

- **Standard** — seller has full Stripe account, you're a referral partner.
- **Express** — seller has lightweight Stripe account, you handle most UX.
- **Custom** — seller doesn't know Stripe exists, you control everything.

The fee split happens on the PaymentIntent:

```js
stripe.paymentIntents.create({
  amount: 10000,                          // buyer pays $100
  currency: 'usd',
  application_fee_amount: 500,            // platform takes $5
  transfer_data: { destination: 'acct_seller_xyz' },   // seller gets $95
});
```

Sellers must complete **KYC** (know-your-customer) before payouts — name, address, tax id, bank account. Stripe provides hosted onboarding (`stripe.accounts.createLink`) — never collect this yourself.

Disputes/refunds against the original charge debit the seller, not the platform (configurable).

---

**Q12: How does SCA / 3D Secure affect your integration?**

PSD2 (EU) requires multi-factor authentication for most online card transactions. The customer gets pinged by their bank's app or SMS code mid-checkout. PaymentIntent has an explicit `requires_action` state for this; Stripe.js's `confirmPayment()` automatically pops the bank's challenge UI.

Two integration requirements:

1. Use PaymentIntent (not legacy Charges) — it has the state machine for the async authentication step.
2. For off-session charges (recurring billing), if SCA is needed and the customer isn't present, the charge fails with `authentication_required`. Listen for `payment_intent.payment_failed` and email the customer with a link to re-authenticate the saved method.

Exemptions exist (low-value, low-risk, recurring after the first, merchant-initiated). Stripe's Radar requests them automatically; you don't compute them yourself.

---

**Q13: Your subscription customer's renewal payment fails. What happens, what do you do?**

Stripe enters **dunning** — automated retry of the failed invoice on a configurable schedule (default 4 retries over 1–3 weeks). During this period the subscription is `past_due`. Each retry attempt fires `invoice.payment_failed`; the eventual success fires `invoice.payment_succeeded`.

If dunning gives up:
- Default behavior: subscription transitions to `unpaid` or `canceled` (configurable in the dashboard).
- You receive `customer.subscription.updated` (status change) or `customer.subscription.deleted` (final).

Your job:
1. On `invoice.payment_failed`, email the customer with a link to update their payment method (Stripe's `customer-portal` is the easiest path).
2. On final cancellation, revoke access in your app.
3. **Don't immediately revoke access on first failure** — many cards fail transiently (insufficient funds, fraud alert, expiration). Dunning gives the user a recovery window.

---

**Q14: How do you keep Stripe data and your application database in sync?**

Stripe is the source of truth for payment state; your DB is the source of truth for business state. They sync via **webhooks**, not polling.

Patterns:

1. **Mirror the IDs.** Save `stripe_customer_id` on your User row, `stripe_subscription_id` on your Subscription row, `stripe_payment_intent_id` on your Order row. Bidirectional lookup.

2. **Use `metadata` for business ids.** When creating a PaymentIntent, set `metadata: { order_id: '42' }`. When the webhook arrives, `event.data.object.metadata.order_id` tells you what business object to update — no extra API call to look up.

3. **Webhook handlers update your DB transactionally.** Receive `payment_intent.succeeded` → look up `pi.metadata.order_id` → update Order to `paid` → fulfill. All in one transaction, with the dedup check upstream.

4. **Reconcile periodically.** A nightly job that pulls Stripe Customers / Subscriptions / Charges and compares to your DB catches drift from missed webhooks (rare, but happens during outages).

5. **Don't store data Stripe owns.** Card last4 and brand are fine to cache; full PAN never. Subscription state is fine to denormalize for fast reads, but webhook-update it; don't query Stripe from your hot path.

---

**Q15: How do you test webhook handlers without a public URL?**

Two main options:

1. **Stripe CLI** — `stripe listen --forward-to localhost:3000/webhook`. Forwards real test-mode events to your local server. Prints a temporary `whsec_…` you use as the signing secret in dev. Also lets you trigger specific events on demand: `stripe trigger payment_intent.succeeded`.

2. **Tunnel to localhost** with ngrok / cloudflared. Configure that public URL in your Stripe webhook settings. More flexible but the URL changes per session unless paid.

For automated tests, capture a real webhook payload from the Stripe dashboard (Webhook attempts → JSON), commit as a fixture, replay against your handler with the signing logic mocked or with a test signing secret. The Stripe SDK's `Webhook.generateTestHeaderString` can produce valid signatures for tests.

---

## 18. Tricky Questions

Practice questions on the more subtle interview scenarios.

### Coupons & Idempotency

---

**Q1: You have a Stripe coupon with `max_redemptions: 100`. A user enters the code at checkout. Your server validates ("is it valid? is it not yet exhausted?"). The user takes 30 seconds to fill in their card. Meanwhile, 5 other users redeem the coupon. By the time your user submits, the coupon is exhausted. How do you prevent this race?**

**Output:** Three layers, used together: (1) trust Stripe to enforce `max_redemptions` atomically at redemption time; (2) reserve the coupon in your own DB with a TTL + unique constraint for per-user limits; (3) idempotency keys on the redemption call.

**Explanation:**

This is a **time-of-check vs time-of-use (TOCTOU)** race. The validation happens at t=0 ("yes, the coupon has redemptions left"), the redemption happens at t=30 seconds, and any number of concurrent redemptions can land in between. The fix is to never rely on the validation result as binding — only the *redemption* is binding.

**Layer 1 — Stripe enforces the global cap atomically.** Don't reproduce `max_redemptions` in your application database. When you actually create the PaymentIntent or Subscription with the discount, Stripe checks the count atomically as part of that API call and rejects with `coupon_expired` or `promotion_code_limit_reached` if exhausted. The validation step in your UI is *advisory*; the binding check happens at redemption. You handle the rejection gracefully — show the user "this code was just claimed, please try another."

**Layer 2 — Reserve in your DB for per-user constraints.** Stripe enforces global caps and per-customer caps (via `first_time_transaction` or per-customer Promotion Codes). For your business rules — "one per email," "stackable up to N times" — add a `coupon_redemptions` table with a unique constraint on `(user_id, promotion_code, status='reserved')`. Insert the reservation with a 15-minute TTL when the user enters the code. Concurrent redemption attempts by the same user fail at the unique-constraint level.

**Layer 3 — Idempotency keys.** Tie the idempotency key to the reservation id, not the request: `idempotencyKey: \`redeem-\${reservation.id}\``. Double-clicks on "Pay" hit the same key and Stripe returns the same PaymentIntent.

**The commit happens in the webhook, not the client.** When `payment_intent.succeeded` arrives, mark the reservation `committed`. If the user abandons the checkout, the reservation expires after 15 minutes and the slot frees up. The flow:

```
t=0   user enters code        → reserve (DB unique constraint)
t=30  user clicks Pay         → PI.create with idempotency key
                                → Stripe atomically checks max_redemptions
                                → either succeeds or fails with limit_reached
t=60  webhook arrives          → commit reservation
```

The frequent mistake is tracking only in your app DB without using Stripe's atomic check, *or* committing in the client's success callback (which can fail to fire if the tab closes).

**Takeaway:** Defense in depth — Stripe's atomic cap is the safety net for global limits; your DB reservation handles per-user limits and gives the user "ownership" of the discount during checkout; idempotency keys protect against retries; webhooks (not client callbacks) commit the redemption.

---

**Q2: A user clicks "Pay" twice in rapid succession because the page felt laggy. Without idempotency keys, what's the worst case? With idempotency keys, what's the worst case?**

**Output:** Without idempotency keys: two PaymentIntents created, two charges, the user is double-billed. With idempotency keys: same PaymentIntent returned both times, exactly one charge.

**Explanation:**

Without protection, each click triggers `stripe.paymentIntents.create(...)` and Stripe sees two distinct requests. Both succeed, both result in charges, both arrive on the customer's statement. Refunding requires customer-service contact, dispute risk goes up, the customer's trust is lost. This is the failure mode the entire idempotency-key design exists to prevent.

With an idempotency key tied to the **business operation** (e.g., `pi-create-order-42`, not `pi-create-${Date.now()}`), Stripe stores the response under that key for 24 hours. The second call hits the same key and Stripe returns the *exact response* from the first call — no second PaymentIntent, no second charge. From the client's perspective, both calls return the same `client_secret`; both go on to confirm against the same PI; the user sees one success.

Subtle correctness points:

- The key must be **stable across retries.** `pi-create-${Date.now()}` produces a different key every call, defeating idempotency. Tie the key to the order id, the user's checkout session, or any business artifact that persists across retries.
- The key must be **scoped to the operation.** Reusing `pi-${userId}` across multiple orders means the second order returns the first order's PI — silent data corruption. Include the operation specifier: `pi-create-order-${orderId}`.
- The 24-hour storage window means same-key calls after 24h get a fresh response. Don't rely on idempotency for permanent dedup; use your `processed_events` table for that.
- Different request body + same key = Stripe returns the original response and a header (`Idempotent-Replayed: true`) plus a body-mismatch warning. This is a bug in your code; surface it loudly.

The same idea applies to Refunds, Subscriptions, Transfers, Customer creation, and any other state-changing call. The cost of always passing an idempotency key is one HTTP header; the upside is "one of the most common production payment bugs becomes impossible."

**Takeaway:** Idempotency keys turn "did the request succeed or did the response just get lost?" from a database-corruption hazard into a no-op. Pass one on every state-changing Stripe call, tied to the business operation rather than the HTTP request.

---

### Subscriptions & State Sync

---

**Q3: A customer's renewal payment fails on day 30 of their monthly subscription. Your app immediately revokes their access. What's wrong with this approach?**

**Explanation:**

You've turned a transient failure into a customer-experience cliff. Card payments fail for many recoverable reasons — temporarily insufficient funds, fraud-alert hold, expired card, bank's risk system pinging at 2am. Stripe's **dunning** mechanism is specifically designed for this: it retries the failed invoice on a configurable schedule (default 4 attempts over 1–3 weeks) before declaring the subscription unrecoverable. During this window the subscription state is `past_due`, not `canceled`.

Revoking on the first `invoice.payment_failed` event:

1. Cuts off paying customers whose cards eventually succeed on retry — they discover this when they realize they've lost access without warning.
2. Skips the dunning UX that lets the user fix the underlying issue (update their card via the Stripe customer portal). Your support team gets the inbound complaints instead.
3. Inflates churn metrics — what should be a 5% transient-fail-then-recover becomes "involuntary cancellation."

The right pattern:

- On **`invoice.payment_failed`**: do nothing access-wise. Email the customer "your payment didn't go through; please update your card here" with a link to the Stripe customer portal.
- During `past_due`: keep access live, possibly with a soft warning banner.
- On **`customer.subscription.deleted`** (only fires after dunning gives up — typically 2-3 weeks later, or per your dashboard settings): revoke access.
- Optionally, on the *final* dunning attempt (just before cancellation), email a last-chance reminder.

A small refinement for high-trust products: after dunning ends in cancellation, give a 7–14 day grace period where the user's data is preserved and a one-click "reactivate" path is offered. This recovers ~10–20% of involuntarily-canceled subscriptions in most B2B SaaS contexts.

The deeper lesson: **payment failures are a UX event, not a security event.** Treat them with the same care as a forgot-password flow.

**Takeaway:** Stripe's dunning gives users a recovery window. Revoking access on the first failed payment turns transient failures into permanent churn. Wait for `customer.subscription.deleted`, and use the dunning period to email recovery links via the Stripe customer portal.

---

**Q4: Your application database says a subscription is `active`. Stripe says it's `canceled`. Your customer is locked out of features they should have access to. How did this happen and how do you prevent it?**

**Explanation:**

Two systems hold related state and they've diverged. The source of the divergence is almost always a missed or mishandled webhook. Common causes:

1. **Webhook handler crashed mid-processing.** Stripe sent `customer.subscription.deleted`, your handler started a transaction, errored, and you returned 500. Stripe retries — *unless your handler caught the error and returned 200 by mistake*, which is the most common variant. Always let real errors propagate; never silently catch and 200-OK.

2. **Wrong webhook endpoint configured.** Test-mode events going to a prod endpoint, or vice versa. Or the endpoint URL was changed and the dashboard wasn't updated. Fixed by always pulling the active webhook URL from a source of truth and alerting on undelivered events from the dashboard.

3. **Event filter mismatch.** The endpoint subscribes only to `customer.subscription.updated` but not `.deleted`. Cancellations slip past silently. Subscribe to `customer.subscription.*` (the wildcard) to be safe, and explicitly handle each subtype.

4. **Race with Stripe's billing job.** A subscription cancels at the end of a billing cycle. Your dashboard query runs at the same instant; Stripe still says `active` momentarily. Resolution: trust the webhook event ordering, not point-in-time API queries.

**Detection** — without monitoring, you might not notice the divergence for weeks. Add:

- A daily reconciliation job that fetches every Subscription from Stripe and diffs against your DB. Log + alert on mismatches.
- Webhook delivery monitoring — Stripe's dashboard shows endpoint health and undelivered events. Pipe to your alerting.
- A "sync from Stripe" admin button in your tooling that pulls the canonical state for a given customer when support gets a complaint.

**Recovery for the locked-out customer:**

1. Run the reconciliation for their account, find the divergent record.
2. Update your DB to match Stripe's truth (whether that's `canceled` or still `active` depending on what actually happened).
3. If your DB was wrong about `active` → apologize, explain, possibly comp them a month.
4. If your DB was wrong about `canceled` → reinstate access, refund any prorated charges if applicable.

The deeper architectural takeaway: never treat your DB's payment state as authoritative for *Stripe's* truth. Treat it as a **denormalized cache** of Stripe's truth, kept in sync by webhooks, with a periodic reconciliation safety net for missed events.

**Takeaway:** Divergence between your DB and Stripe's state almost always traces to a missed webhook (handler crash silently 200-OK'd, wrong filter, wrong endpoint). Treat your DB as a cache, not a source of truth; run nightly reconciliation; alert on undelivered webhooks.

---

### Webhooks & Side Effects

---

**Q5: Your webhook handler updates the database and sends a confirmation email. The DB write succeeds, the email send fails, you return 500 to Stripe. Stripe retries. What's the problem?**

**Explanation:**

The problem is that the DB write and the email aren't in the same transactional boundary, so they have different "successful state" semantics. Two visible failure modes:

1. **The email gets sent twice.** First webhook delivery: DB write succeeded, email send succeeded, then *something else* (the DB commit ack? a logging call?) failed and you returned 500. Stripe retries. Your handler runs again — your dedup table doesn't show this event yet (because the first attempt aborted before writing it), the DB row update is idempotent, but the email send executes a second time. The customer gets two "Order confirmed!" emails.

2. **The email never gets sent.** First delivery: DB write succeeded but the email service was down. Your handler caught the email error, returned 200 (so Stripe doesn't retry), and silently lost the email. Customer's order is paid but they don't know.

**The fix is the outbox pattern.** Both effects must be transactional — either both happen or neither does. Achieved by:

```js
await db.transaction(async (trx) => {
  await trx('processed_events').insert({ id: event.id });   // dedup
  await trx('orders').where({ id }).update({ status: 'paid' });
  await trx('outbox').insert({                              // email queued, not sent
    type: 'order_confirmation',
    payload: { order_id: id, email: customer.email },
  });
});
```

Then a separate worker reads the `outbox` table and actually sends the emails, with its own dedup logic. The webhook handler's responsibility ends at "I've recorded that this happened and queued the side effects." It's instantly idempotent and fast (the DB transaction is the only blocking I/O), so it always returns 2xx in time.

**Why the outbox over "just retry the email synchronously":**

- Email sends can take seconds; webhook handlers must finish in <30s.
- Email service outages happen; you don't want webhook delivery to fail because Mailgun is down.
- Multiple side effects (email + Slack + analytics) in one handler compound the latency and failure surface.

The outbox pattern is the same technique distributed-systems courses teach for transactional messaging. Stripe webhooks happen to be one of the most common reasons frontend engineers run into it.

**Takeaway:** Webhook handlers should be fast and transactional — write to DB + queue side effects in one transaction; let a separate worker drain the queue. Mixing DB writes with synchronous external calls (email, Slack, etc.) in the handler creates "DB succeeded but email failed" duplication risk on retry.

---

### Refunds & Disputes

---

**Q6: A user disputes a charge. Stripe immediately deducts the disputed amount from your balance. Your app fulfilled the order; the goods were shipped. What's the right response?**

**Explanation:**

Disputes are the most legally and financially complex part of payments work. The dispute mechanic:

- The customer told their bank "this charge was unauthorized / not as described / not received."
- The bank reverses the funds — you lose the money immediately.
- You have ~7 days to submit evidence (per Stripe; banks can be tighter).
- The bank reviews and either rules in your favor (you get the money back, minus Stripe's $15 dispute fee) or against (you stay out the money plus the $15).

**On `charge.dispute.created` webhook:**

1. **Don't refund.** The funds are already gone; refunding stacks a second deduction on top, and the dispute proceeds either way. Specifically: do NOT call `refunds.create()` on the disputed charge — Stripe blocks this anyway, but trying it is a code smell.
2. **Lock down the user.** If the dispute reason is `'fraudulent'`, this is likely a stolen card. Suspend the account, reverse any in-flight orders, prevent further charges to the same payment method. If the reason is `'product_not_received'` or `'product_unacceptable'`, contact the customer to resolve before the deadline.
3. **Compile and submit evidence** before the deadline. Stripe's dispute API lets you attach: receipt confirmations, shipping proof (carrier tracking, signature), customer correspondence (support tickets, emails), refund policy that the customer agreed to. Submit via `stripe.disputes.update(disputeId, { evidence: { ... } })`.
4. **Track the outcome via webhook.** `charge.dispute.closed` fires when the bank rules; `event.data.object.status` is `won` (you keep the funds) or `lost` (you don't). Update internal metrics either way.

**Strategic considerations:**

- **The $15 dispute fee is per dispute, win or lose.** Multiple losses in a row drive your dispute rate up; if it crosses ~1% of volume, Visa's VDMP (Visa Dispute Monitoring Program) puts you in a remediation program with extra fees and possible merchant termination.
- **It's often cheaper to refund proactively** than to dispute. If a customer emails "I want my money back," refunding before they file a dispute saves the $15 plus avoids the dispute-rate impact. The "always fight" approach is wrong-headed for low-value transactions.
- **Tools like Stripe Radar** (fraud detection) reduce the inbound rate. Configure rules around country-of-card mismatch, velocity, ZIP/AVS failures.
- **Friendly fraud** ("I got the goods but disputed anyway") is rampant in some categories (digital goods, subscriptions). Strong evidence (clickwrap acceptance of terms, login records, IP address, email confirmations of the purchase) wins these. Weak evidence (just a receipt) loses them.

**The deeper architectural lesson:** disputes are the part of payments where you most need clean records of "what the user agreed to and what we delivered." If you can produce the user clicking "I agree" with a timestamp + IP, the shipping carrier's signature proof, and the customer's prior correspondence acknowledging the order — you'll usually win. If you have nothing, you'll lose.

**Takeaway:** Don't refund a disputed charge (funds are already gone). Decide quickly: contest with strong evidence, or accept and refund preemptively for borderline cases. Track dispute rate; >1% triggers card-network monitoring programs. The best defense is rigorous logging of order acceptance + delivery proof.

---

### Tricky Stripe Cheat Sheet

```
1.  Client success != fulfillment. Webhook is the source of truth.
2.  Idempotency keys tied to BUSINESS operation, not request timestamp.
3.  Webhook signature uses RAW body bytes; rejects events older than 5 min.
4.  Stripe webhooks retry for 3 days on non-2xx; dedup on event.id.
5.  Webhook handler must finish in <30s; outbox heavy work.
6.  Coupons enforce max_redemptions atomically — don't reproduce in app DB.
7.  For per-user coupon limits: DB reservation + TTL + UNIQUE constraint.
8.  Commit redemption in webhook, NOT client callback.
9.  off_session: true required when charging without user presence.
10. PaymentIntent (not Charges) — only PI handles SCA / 3DS correctly.
11. Subscriptions with default_incomplete handle SCA on first payment.
12. Don't revoke access on first invoice failure — let dunning recover the user.
13. Disputes: don't refund; submit evidence; >1% rate = card-network programs.
14. Restricted keys for narrow services; rotate immediately on leak.
15. Test mode vs live mode keys are completely separate; never mix.
```

---

## References

- [Stripe Docs — API Reference](https://stripe.com/docs/api) — canonical reference for every endpoint and field
- [Stripe Docs — Payments](https://stripe.com/docs/payments) — PaymentIntent, Elements, Checkout
- [Stripe Docs — Webhooks](https://stripe.com/docs/webhooks) — signing, retries, best practices
- [Stripe Docs — Idempotency](https://stripe.com/docs/api/idempotent_requests) — the safety-net pattern
- [Stripe Docs — Coupons](https://stripe.com/docs/billing/subscriptions/coupons) — coupons, promotion codes, restrictions
- [Stripe Docs — Disputes](https://stripe.com/docs/disputes) — submitting evidence, fee structure
- [Stripe Docs — Connect](https://stripe.com/docs/connect) — marketplaces, KYC, account types
- [Stripe Docs — Strong Customer Authentication](https://stripe.com/docs/strong-customer-authentication) — SCA, 3DS, exemptions
- [Stripe Docs — Testing](https://stripe.com/docs/testing) — test cards, fixtures, CLI
- [PCI DSS Quick Reference Guide (PCI Council)](https://www.pcisecuritystandards.org/document_library) — official compliance docs
