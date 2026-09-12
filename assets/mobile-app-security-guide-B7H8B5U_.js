const e=`# Mobile App Security — Interview Guide

Mobile security starts from an assumption web security doesn't have to make: **the attacker owns the device**. Your binary, your storage and your network traffic are all inspectable by a motivated user on a rooted phone. That single fact determines almost every answer in this guide.

Complements the [Web Security guide](/backend/web-security) (server-side threats, XSS, CSRF) and the [OAuth & SSO guide](/backend/oauth-sso) (token flows).

## Table of Contents

1. [The Mobile Threat Model](#1-the-mobile-threat-model)
2. [Secure Storage](#2-secure-storage)
3. [Biometric Authentication](#3-biometric-authentication)
4. [Token Handling on Mobile](#4-token-handling-on-mobile)
5. [OAuth on Mobile — PKCE and the Redirect Problem](#5-oauth-on-mobile-pkce-and-the-redirect-problem)
6. [Network Security and Certificate Pinning](#6-network-security-and-certificate-pinning)
7. [Deep Link Security](#7-deep-link-security)
8. [WebView Security](#8-webview-security)
9. [Reverse Engineering, Obfuscation and Secrets](#9-reverse-engineering-obfuscation-and-secrets)
10. [Root and Jailbreak Detection, Attestation](#10-root-and-jailbreak-detection-attestation)
11. [In-App Purchases and Receipt Validation](#11-in-app-purchases-and-receipt-validation)
12. [Data Leakage Channels](#12-data-leakage-channels)
13. [Permissions and Least Privilege](#13-permissions-and-least-privilege)
14. [Third-Party SDKs and Supply Chain](#14-third-party-sdks-and-supply-chain)
15. [OWASP Mobile Top 10](#15-owasp-mobile-top-10)
16. [Interview Questions & Answers](#16-interview-questions-answers)
17. [Tricky Questions](#17-tricky-questions)
18. [Cheat Sheet](#18-cheat-sheet)
19. [References](#19-references)

---

## 1. The Mobile Threat Model

Four attacker positions, and they need different defences:

| Attacker | Can do | Defence lives |
|---|---|---|
| **Device owner** (rooted/jailbroken) | read storage, hook functions, dump memory, patch the binary | **server-side** |
| **Network attacker** (hostile Wi-Fi) | intercept, downgrade, MITM | TLS, pinning |
| **Malicious app** on the same device | claim URL schemes, read world-readable files, screen-record | scoped storage, verified links |
| **Someone holding the phone** | shoulder-surf, use an unlocked app | biometrics, timeouts, snapshot masking |

The consequence that reframes everything: **the client cannot be trusted, ever**. There is no client-side check a determined device owner cannot bypass — not a jailbreak check, not a licence check, not input validation, not a feature flag. Client-side controls raise the cost of an attack; **only server-side enforcement provides a guarantee**. If an interviewer asks how to stop a user cheating in your app, the answer is authoritative server-side validation, not client hardening.

The second reframe: your app ships to millions of devices you don't control, and **you cannot patch it instantly** — App Review takes days and users update slowly. So a security bug in a mobile client has a long tail, which is an argument for keeping security logic server-side where you *can* patch it.

---

## 2. Secure Storage

| Mechanism | Encrypted | Use for |
|---|---|---|
| **iOS Keychain** | yes, hardware-backed | tokens, keys, credentials |
| **Android Keystore** | yes, hardware-backed (TEE/StrongBox) | key material |
| **EncryptedSharedPreferences** | yes (key from Keystore) | small secrets on Android |
| \`AsyncStorage\` (RN) | **no** — plaintext | non-sensitive cache, preferences |
| \`UserDefaults\` / \`SharedPreferences\` | **no** | non-sensitive settings |
| SQLite / Realm | no by default | use SQLCipher for sensitive data |
| MMKV | no by default | supports an encryption key |

\`\`\`js
// React Native — the right tool
import * as SecureStore from 'expo-secure-store';          // Keychain / Keystore

await SecureStore.setItemAsync('refresh_token', token, {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,  // no iCloud sync
  requireAuthentication: true,                              // gate on biometrics
});
\`\`\`

**\`AsyncStorage\` is not secure storage.** It is an unencrypted SQLite file (Android) or a plaintext file (iOS) readable on a rooted device and often included in backups. Storing a token there is the single most common mobile security defect in React Native apps.

iOS Keychain accessibility classes matter: \`WhenUnlocked\` is the sensible default; \`AfterFirstUnlock\` is needed for background access; **\`ThisDeviceOnly\` prevents the item syncing to iCloud Keychain** and travelling to the user's other devices — usually what you want for a device-bound refresh token. On Android, request **\`setUserAuthenticationRequired(true)\`** and StrongBox where available so the key is unusable without a fresh unlock.

Note that hardware-backed keys mean the **key** can't be extracted — but data your app decrypts into memory can still be read by a debugger on a rooted device. Storage encryption raises cost; it doesn't make the device trustworthy.

---

## 3. Biometric Authentication

The most misunderstood topic in mobile security interviews. **Biometrics are a local gate, not an authentication protocol.**

\`\`\`js
import * as LocalAuthentication from 'expo-local-authentication';

const ok = await LocalAuthentication.authenticateAsync({
  promptMessage: 'Unlock PrepHub',
  disableDeviceFallback: false,     // allow passcode — accessibility matters
  cancelLabel: 'Use password',
});
\`\`\`

What that call returns is **a boolean from the OS**, on the device, in your process. On a rooted phone it can be hooked to always return true. So a design that says "if biometrics succeed, log the user in" is trivially bypassable.

The correct pattern is **biometrics gating access to a key or token**, not a boolean:

1. Store the refresh token in the Keychain/Keystore with \`requireAuthentication: true\` (iOS) or \`setUserAuthenticationRequired(true)\` (Android).
2. The OS releases the secret **only** after a successful biometric or passcode check, enforced by the secure element rather than your code.
3. A hooked boolean gets the attacker nothing, because the token never leaves the keystore without OS-level authentication.

Other points that come up:

- **\`Face ID\`/\`Touch ID\` require \`NSFaceIDUsageDescription\`** in \`Info.plist\`, or the app crashes.
- **Enrolment changes must invalidate the key.** iOS: use an access control that includes \`biometryCurrentSet\` so adding a new fingerprint invalidates the item. Android: \`setInvalidatedByBiometricEnrolment(true)\`. Otherwise someone who can unlock the device once can enrol their own biometric and keep access.
- **Always offer a fallback** — passcode, or your own credentials. Biometrics fail for wet hands, masks, and some disabilities; a biometric-only app is an accessibility failure.
- Biometrics are for **local convenience and re-authentication**, not for identifying a user to your server. The server authenticates the token, not the face.

---

## 4. Token Handling on Mobile

Mobile is genuinely different from the browser: there is **no \`httpOnly\` cookie**, so "don't store tokens in JS-readable storage" has no mobile equivalent. Your app process holds the token.

The pattern that works:

\`\`\`
short-lived access token   → memory only (never persisted)
long-lived refresh token   → Keychain / Keystore, device-only, biometric-gated
\`\`\`

- Keep the **access token in memory** with a short TTL (minutes). If the process dies, refresh.
- Persist **only the refresh token**, in secure storage, and **rotate it on every use** with reuse detection server-side — so a stolen refresh token is single-use and its reuse reveals the theft.
- Bind the refresh token to the device where you can (device ID, attestation) so exfiltrating it to another device fails.
- Support **remote revocation** — a "sign out all devices" that actually invalidates server-side, because you cannot reach into a lost phone.
- **Never** store tokens in \`AsyncStorage\`, in a plain file, in logs, or in a URL.
- Never put a long-lived, broadly-scoped token on the device at all. Scope down.

Note the trade-off with \`AfterFirstUnlock\` accessibility: background sync needs the token available without user presence, which is incompatible with biometric gating on every access. Resolve it deliberately — usually a device-bound token for background work with narrow scope, and a stronger gate for sensitive actions.

---

## 5. OAuth on Mobile — PKCE and the Redirect Problem

A mobile app is a **public client**: it cannot keep a client secret (§9), so the classic authorization-code flow with a secret doesn't apply.

**Authorization Code + PKCE** is the answer, and it is mandatory in OAuth 2.1:

\`\`\`
1. app generates code_verifier (random) and code_challenge = S256(verifier)
2. opens the system browser with the challenge
3. user authenticates; provider redirects back with a code
4. app exchanges code + verifier for tokens
   → a stolen code is useless without the verifier, which never left the device
\`\`\`

Two mobile-specific requirements:

**Use the system browser, not a WebView.** \`ASWebAuthenticationSession\` (iOS) / Chrome Custom Tabs (Android), or \`expo-auth-session\`. A WebView-based login lets your app read the user's credentials as they type, which is exactly why identity providers block it — and it also can't share the system's existing SSO session, so users log in again unnecessarily.

**Custom URL schemes are hijackable.** Any app can register \`myapp://\`, so an attacker's app can claim your callback and receive the authorization code. Mitigations: PKCE (so the code alone is useless), and preferring **verified deep links** — Universal Links (iOS) / App Links (Android) — which are domain-verified and cannot be claimed by another app (§7).

Also: send \`state\` and verify it, use a **loopback or claimed-https redirect** per RFC 8252, and never embed a client secret to "make the flow work".

---

## 6. Network Security and Certificate Pinning

Baseline first: **TLS 1.2+ everywhere, no exceptions.** iOS enforces this with **App Transport Security**; Android with the default **Network Security Config** (cleartext blocked since API 28).

\`\`\`xml
<!-- Android: res/xml/network_security_config.xml -->
<network-security-config>
  <base-config cleartextTrafficPermitted="false" />
  <domain-config>
    <domain includeSubdomains="true">api.example.com</domain>
    <pin-set expiration="2027-01-01">
      <pin digest="SHA-256">base64PrimaryKeyHash=</pin>
      <pin digest="SHA-256">base64BACKUPKeyHash=</pin>   <!-- MANDATORY -->
    </pin-set>
  </domain-config>
</network-security-config>
\`\`\`

**Certificate pinning** binds your app to a specific key, so a MITM with a device-installed root CA cannot intercept. It defends against a hostile network *and* against a user who installs a proxy CA to inspect traffic.

The reason pinning is a risky control, and the thing interviewers want to hear: **a pin outlives your ability to change it.** If you pin a leaf certificate and rotate it, every installed app breaks and you cannot fix it without a store release — days of outage. So:

- **Pin the intermediate or the public key (SPKI)**, not the leaf certificate.
- **Always ship a backup pin** for a key you haven't deployed yet.
- Set an **expiration** so the pin fails open rather than bricking the app forever.
- Have a **kill switch**: a server-controlled flag (fetched over a non-pinned channel, or a signed config) that can disable pinning remotely.
- Pin only the domains that matter, and don't pin third-party CDNs you don't control.

Pinning is bypassable on a rooted device with Frida in minutes, so it is **anti-casual-inspection**, not a guarantee. That's fine — the goal is raising cost.

---

## 7. Deep Link Security

Three mechanisms with very different security properties:

| Mechanism | Claimable by other apps | Verified |
|---|---|---|
| **Custom scheme** (\`myapp://\`) | **yes — any app** | no |
| **Universal Links** (iOS) | no | via \`apple-app-site-association\` |
| **App Links** (Android) | no | via \`assetlinks.json\` + \`android:autoVerify\` |

**Treat every incoming link as untrusted input.** It can come from a website, a QR code, another app or an SMS. Concretely:

\`\`\`js
// BAD — an attacker's link can drive privileged actions
Linking.addEventListener('url', ({ url }) => {
  const { path, params } = parse(url);
  if (path === '/transfer') doTransfer(params.to, params.amount);   // no.
});
\`\`\`

Rules: never perform a state-changing action directly from a link — navigate to a screen that requires confirmation; **validate and allow-list** paths and parameters; never accept a redirect target from a link parameter (open redirect → token theft); and require authentication *after* the link resolves, not before, so a deep link cannot skip an auth gate.

Use **App Links / Universal Links** for anything security-relevant, especially OAuth callbacks (§5), because a custom scheme can be hijacked by a malicious app installed alongside yours.

---

## 8. WebView Security

A WebView is a browser inside your app, with your app's privileges. Treat it as the highest-risk component you ship.

\`\`\`jsx
<WebView
  source={{ uri: trustedUrl }}
  originWhitelist={['https://*.example.com']}   // block navigation elsewhere
  javaScriptEnabled={true}                       // only if genuinely needed
  allowFileAccess={false}
  allowUniversalAccessFromFileURLs={false}       // critical: else file:// reads any origin
  allowsInlineMediaPlayback={false}
  onShouldStartLoadWithRequest={req => isAllowed(req.url)}   // gate navigation
  setSupportMultipleWindows={false}
/>
\`\`\`

The specific dangers:

- **\`addJavascriptInterface\` (Android) / injected JS bridges** expose native functions to page JavaScript. If the page is ever attacker-controlled, that is remote code execution with your app's permissions. Never expose a generic bridge; expose narrow, validated, non-privileged methods only.
- **\`allowUniversalAccessFromFileURLs\`** lets a local file read any origin — a classic path to stealing session data.
- **Loading untrusted or user-supplied URLs.** Allow-list origins and gate navigation with \`onShouldStartLoadWithRequest\`; a page that redirects off-domain must not be followed silently.
- **Never use a WebView for OAuth** (§5).
- Postmessage bridges must **validate the origin** of every message, exactly as on the web.
- Mixed content and disabled TLS validation in WebViews bypass your ATS/Network Security Config work.

If you only need to open a link, use the system browser (\`Linking.openURL\`) — it has no access to your app's context.

---

## 9. Reverse Engineering, Obfuscation and Secrets

**Anything shipped in the binary is public.** An \`.ipa\` or \`.apk\` is a zip; \`strings\`, \`apktool\`, Hopper and a JS-bundle beautifier extract your code and constants in minutes.

So the rule is absolute: **there are no client-side secrets.**

\`\`\`js
// all equally broken — a determined user reads every one of these
const API_KEY = 'sk_live_abc123';
const KEYBroken = process.env.EXPO_PUBLIC_API_KEY;    // baked in at build time
const KEY = atob('c2tfbGl2ZQ==');               // obfuscation, not secrecy
\`\`\`

What to do instead:

- **Move the secret server-side** and have your backend call the third-party API. The app calls your backend with a user token.
- If the third party must be called directly, use **short-lived, narrowly-scoped credentials minted by your backend** per session.
- Where a key must ship (a public API key for maps or analytics), **restrict it at the provider** — by bundle ID, package name + signing certificate, referrer, and quota. Then leaking it is survivable.
- For React Native, remember \`EXPO_PUBLIC_*\` and any \`.env\` value inlined at build time is **in the bundle**. The name is a warning, not a suggestion.

**Obfuscation** (R8/ProGuard on Android, Hermes bytecode, JS minification, commercial tools) raises the cost of understanding your code and is worth enabling — R8 also shrinks the app. But it is **not a security control**: it delays an attacker, it doesn't stop one. Do enable it, don't rely on it, and never let it be the reason you shipped a secret.

Related: strip debug symbols and logs from release builds, disable debuggable flags, and don't ship source maps publicly (upload them to your crash reporter instead).

---

## 10. Root and Jailbreak Detection, Attestation

**Detection is bypassable by definition** — it runs on the device the attacker controls, and tools like Magisk Hide and Frida defeat naive checks routinely. So:

- Use it to **raise cost and inform risk**, not to gate security. Log it, adjust risk scoring, warn the user, restrict the highest-risk features.
- **Never** let it be the only thing between an attacker and a privileged action.
- Expect false positives — developers, custom ROMs, and legitimate power users — so a hard block will lock out real customers.

The stronger primitive is **hardware-backed attestation**, which is cryptographically verified **server-side**:

| Platform | Mechanism |
|---|---|
| **iOS** | **App Attest** / DeviceCheck — a hardware key asserts "this is a genuine, unmodified instance of your app" |
| **Android** | **Play Integrity API** — device, app and licensing verdicts |

The critical detail: **verify the attestation token on your server**, never in the app. A client-side "attestation passed" boolean is as bypassable as a jailbreak check. Attestation gives you a signal you can actually trust, and it is the right tool when you need to keep bots and modified clients off an endpoint — combined with rate limiting and server-side authorisation, which remain the real defence.

---

## 11. In-App Purchases and Receipt Validation

Both stores require digital goods to be sold through their IAP systems (Apple guideline 3.1.1; Google Play Billing), with narrow carve-outs for physical goods and "reader" apps — and the rules shift with regulation, so check current guidance.

The security question is **receipt validation**, and the answer is always server-side:

\`\`\`
app → store purchase → receipt/token → YOUR SERVER → store's verification API
                                            ↓
                                   entitlement recorded server-side
\`\`\`

- **Never grant entitlement from a client-side "purchase succeeded" callback.** It can be faked trivially, and there are consumer tools that do exactly this.
- Validate with **App Store Server API** / **Google Play Developer API** from your backend, then store the entitlement against the user account.
- Handle **subscription lifecycle server-side** via **App Store Server Notifications** and **Real-time Developer Notifications** — renewals, cancellations, refunds, billing retries, grace periods. A client that only checks at launch will keep serving a refunded subscriber.
- Treat **refunds and chargebacks** as revocation events.
- Make purchase handling **idempotent** and keyed on the transaction ID; network failures mid-purchase are routine, and double-granting is a real bug.
- Restore purchases must work — it's an App Review requirement and a common rejection.

Libraries like RevenueCat exist precisely because this lifecycle is fiddly; the interview point is knowing **where the trust boundary sits**.

---

## 12. Data Leakage Channels

Mobile has leak paths the web doesn't:

- **App snapshots.** Both OSes screenshot your app when it backgrounds, for the app switcher. Sensitive screens must be masked — on iOS blur or overlay in \`sceneWillResignActive\`; on Android set \`FLAG_SECURE\`, which also blocks screenshots and screen recording.
- **Clipboard.** Anything copied is readable by other apps (and iOS shows a paste notification). Don't auto-copy tokens; mark sensitive fields to exclude from the general pasteboard.
- **Logs.** \`console.log\` in release goes to device logs, readable via Xcode/logcat and sometimes by other tooling. Strip logging in release builds; never log tokens, PII or full request bodies.
- **Backups.** iTunes/iCloud and Android Auto Backup can include your files. Keychain items marked \`ThisDeviceOnly\` are excluded; mark files with \`NSURLIsExcludedFromBackupKey\` / \`android:allowBackup="false"\` where appropriate.
- **Keyboard caches.** Set \`secureTextEntry\` / \`textContentType="password"\` and disable autocorrect on sensitive fields, or typed secrets end up in the predictive-text dictionary.
- **Crash reports and analytics.** Breadcrumbs and network logs frequently capture tokens and PII. Scrub before sending, and check your SDK's defaults.
- **Third-party keyboards** can log everything typed; you cannot prevent this, but you can avoid asking for sensitive input where a code from another channel would do.

---

## 13. Permissions and Least Privilege

Request the **minimum**, at the **moment of use**, with a clear reason. Both stores reject over-broad permission requests, and users deny prompts they don't understand.

- Ask **in context** — requesting location on first launch gets denied; requesting it when the user taps "jobs near me" gets granted.
- Prefer the **narrowest variant**: coarse over precise location, when-in-use over always, a photo picker (which needs no permission on modern OSes) over full library access.
- Handle **denial gracefully** — the feature must degrade, not break, and you cannot re-prompt after a hard denial; deep-link to Settings instead.
- Remove permissions you no longer use. A stale \`android.permission.READ_CONTACTS\` in the manifest is both a rejection risk and a privacy-label inconsistency.
- Declare everything truthfully in the **Data Safety form** (Play) and **privacy nutrition labels** (App Store) — including what your SDKs collect (§14). A mismatch is a removal risk, not just a rejection.

---

## 14. Third-Party SDKs and Supply Chain

An SDK runs with your app's full privileges and your app's identity. Its behaviour is your legal and store responsibility.

- **Audit what each SDK collects**, and make sure it matches your privacy declarations. Ad and analytics SDKs are the usual mismatch source.
- Since 2024, iOS requires commonly-used SDKs to ship **signed privacy manifests** — so an outdated SDK **blocks your release** ([iOS deployment §11](/frontend/ios-app-store-deployment)).
- **Pin versions and review updates.** A compromised or newly-monetised SDK version is a real supply-chain vector, and mobile's slow patch cycle makes it worse.
- Minimise count — every SDK is code you didn't write, size you pay for, and a permission surface.
- For React Native, the JS dependency tree carries the same risks as any npm project: lockfiles, \`npm audit\`, and caution with postinstall scripts.

---

## 15. OWASP Mobile Top 10

The reference list (2024 revision), with the mobile-specific reading:

| OWASP ID | Risk | Core defence |
|---|---|---|
| M1 | Improper Credential Usage | no hardcoded secrets (§9) |
| M2 | Inadequate Supply Chain Security | SDK auditing, pinned versions (§14) |
| M3 | Insecure Authentication/Authorization | **server-side** enforcement (§1, §4) |
| M4 | Insufficient Input/Output Validation | validate deep links and WebView input (§7, §8) |
| M5 | Insecure Communication | TLS + considered pinning (§6) |
| M6 | Inadequate Privacy Controls | least-privilege permissions, truthful labels (§13) |
| M7 | Insufficient Binary Protection | obfuscation as cost, not control (§9) |
| M8 | Security Misconfiguration | ATS/NSC, debug flags, backup rules (§12) |
| M9 | Insecure Data Storage | Keychain/Keystore, never \`AsyncStorage\` (§2) |
| M10 | Insufficient Cryptography | platform crypto, never roll your own |

If you remember one thing: **M3 and M9 are where real mobile breaches come from** — trusting the client for authorisation, and leaving tokens in plaintext storage.

---

## 16. Interview Questions & Answers

**Q1: What's fundamentally different about mobile security compared with web security?**

The attacker can own the execution environment. In a browser you can rely on the origin model, \`httpOnly\` cookies and the fact that the user can't rewrite your server's code; on mobile, a user with a rooted device can read your storage, hook your functions with Frida, dump memory and patch the binary — and your \`.ipa\`/\`.apk\` is a zip anyone can unpack. So **no client-side check is a security guarantee**: not jailbreak detection, not a licence check, not input validation, not a feature flag. Client controls raise cost; only **server-side enforcement** guarantees anything. Two further differences: there is **no \`httpOnly\` equivalent**, so your process necessarily holds tokens and secure storage becomes the control; and you **cannot patch quickly** — review takes days and users update slowly — which is a strong argument for keeping security logic on the server where you can fix it today.

**Q2: Where do you store an authentication token in a mobile app?**

Split by lifetime. Keep the **short-lived access token in memory only**, never persisted — if the process dies you refresh. Persist **only the refresh token**, in the **iOS Keychain or Android Keystore**, marked device-only so it doesn't sync to iCloud Keychain, and ideally gated on biometric or passcode authentication so the OS releases it only after a user-presence check. Then **rotate the refresh token on every use with server-side reuse detection**, so a stolen token is single-use and its reuse is a detectable theft signal, and support remote revocation because you can't reach into a lost phone. What you must never do is use **\`AsyncStorage\`**, which is an unencrypted SQLite file or plaintext file — readable on a rooted device and frequently swept into backups. That's the most common mobile security defect in React Native apps.

**Q3: Is biometric authentication secure? How would you implement it correctly?**

Biometrics are a **local gate, not an authentication protocol**, and the common implementation is bypassable. If your code calls \`authenticateAsync()\` and logs the user in when it returns true, that boolean is produced on a device the attacker controls and can be hooked to always succeed. The correct pattern is to have biometrics **gate release of a key or token** rather than return a decision: store the refresh token in the Keychain/Keystore with \`requireAuthentication\` / \`setUserAuthenticationRequired(true)\`, so the **secure element** — not your code — refuses to release it without a successful check. A hooked boolean then gains nothing. Two details that get missed: **enrolment changes must invalidate the key** (\`biometryCurrentSet\` on iOS, \`setInvalidatedByBiometricEnrolment(true)\` on Android), or someone who unlocks the device once can add their own fingerprint and retain access; and you must **always offer a fallback**, because biometrics fail for wet hands, masks and some disabilities, making biometric-only an accessibility failure. Biometrics authenticate *locally*; the server still authenticates the token.

**Q4: Should you use certificate pinning? What are the risks?**

Usually yes for your own API, but understand it as **anti-casual-inspection rather than a guarantee** — Frida defeats it on a rooted device in minutes. Its real value is stopping a hostile network, and stopping a user who installs a proxy CA from reading your traffic. The risk that matters is **operational**: a pin outlives your ability to change it. Pin a leaf certificate, rotate it, and every installed app breaks with no fix short of a store release — days of total outage. So pin the **intermediate or the public key (SPKI)** rather than the leaf, **always ship a backup pin** for a key you haven't deployed yet, set an **expiration** so the pin fails open instead of bricking the app permanently, and build a **remote kill switch** so you can disable pinning without a release. Don't pin third-party domains you don't control. And get the baseline right first: TLS 1.2+ enforced by ATS on iOS and the Network Security Config on Android, with cleartext blocked.

**Q5: Why shouldn't you use a WebView for OAuth login?**

Because a WebView runs inside your app, so your app can read everything the user types — including their password for the identity provider. That breaks the entire trust premise of delegated authentication, which is why providers like Google actively block WebView-based OAuth. It also can't share the **system browser's existing session**, so users are forced to log in again instead of getting SSO, and it doesn't show the address bar and padlock the user needs to verify who they're giving credentials to. The correct approach is the **system browser**: \`ASWebAuthenticationSession\` on iOS, Chrome Custom Tabs on Android, or \`expo-auth-session\` in React Native — combined with **Authorization Code + PKCE**, since a mobile app is a public client and cannot hold a client secret. And prefer a **verified deep link** (Universal Links / App Links) for the callback over a custom scheme, because any app can register \`myapp://\` and intercept the authorization code.

**Q6: How do you protect API keys in a mobile app?**

You don't — you stop shipping them. Anything in the binary is public: the package is a zip, and \`strings\`, \`apktool\` or a JS-bundle beautifier extracts constants in minutes. Base64, obfuscation and \`EXPO_PUBLIC_*\` env vars are all equally readable; env vars especially, because they're **inlined at build time**. So: **move the secret server-side** and have your backend call the third party, with the app authenticating to your backend as the user. If direct calls are unavoidable, have your backend mint **short-lived, narrowly-scoped credentials** per session. Where a key genuinely must ship — a maps or analytics public key — **restrict it at the provider** by bundle ID, package name plus signing certificate, and quota, so leaking it is survivable. Enable **R8/ProGuard and Hermes bytecode** because they raise the cost of understanding your code and shrink the app, but never treat obfuscation as a security control.

**Q7: How should in-app purchases be validated?**

**Server-side, always.** The app receives a receipt or purchase token from the store, sends it to **your** backend, and your backend validates it against the App Store Server API or Google Play Developer API and records the entitlement against the user account. Never grant entitlement from a client-side "purchase succeeded" callback — it's trivially faked, and consumer tools exist to do exactly that. Beyond the initial validation, the subscription **lifecycle must be handled server-side** through App Store Server Notifications and Google's Real-time Developer Notifications: renewals, cancellations, refunds, billing retries and grace periods, because a client that only checks at launch keeps serving a refunded subscriber. Make purchase handling **idempotent** and keyed on the transaction ID, since mid-purchase network failures are routine and double-granting is a real bug. Also implement restore-purchases properly — it's an App Review requirement and a common rejection.

**Q8: Is jailbreak/root detection worth implementing?**

Worth implementing, never worth trusting. It executes on the device the attacker controls, so Magisk Hide and Frida defeat naive checks as a matter of routine — and it produces **false positives** on developer devices and custom ROMs, so a hard block locks out legitimate users. Use it as a **risk signal**: log it, feed it into fraud scoring, warn the user, and optionally restrict your highest-risk features. What you should reach for when you genuinely need assurance is **hardware-backed attestation** — **App Attest**/DeviceCheck on iOS and the **Play Integrity API** on Android — which produces a token your **server** verifies cryptographically, asserting that this is a genuine unmodified instance of your app on a genuine device. The critical detail is that verification must happen server-side; a client-side "attestation passed" boolean is exactly as bypassable as the jailbreak check it replaced. And attestation supplements rather than replaces server-side authorisation and rate limiting.

**Q9: What data leakage channels exist on mobile that don't exist on the web?**

Several, and they're routinely missed. **App snapshots** — both OSes screenshot your app when backgrounding it for the app switcher, so a banking balance or a token on screen is written to disk; mask sensitive screens on resign-active, or set \`FLAG_SECURE\` on Android, which also blocks screenshots and recording. **Clipboard** contents are readable by other apps, so never auto-copy a token. **Device logs** — \`console.log\` in a release build lands in logcat or the device console, so strip logging and never log tokens or PII. **Backups** — iCloud and Android Auto Backup can sweep up your files; mark Keychain items device-only and exclude sensitive files explicitly. **Keyboard caches** learn typed text unless a field is \`secureTextEntry\`. And **crash reporters and analytics** capture breadcrumbs and network payloads that very often include tokens, so scrub before sending. Third-party keyboards can log everything typed, which you can't prevent — only design around.

**Q10: What are the top mobile risks according to OWASP, and which actually cause breaches?**

The OWASP Mobile Top 10 runs from M1 Improper Credential Usage through M10 Insufficient Cryptography, covering supply chain, authentication, input validation, communication, privacy, binary protection, misconfiguration and storage. The two that produce most real-world incidents are **M3 Insecure Authentication/Authorization** — trusting the client to decide what a user may do, which is the root of most mobile API abuse — and **M9 Insecure Data Storage**, overwhelmingly tokens or PII left in \`AsyncStorage\`, \`SharedPreferences\` or an unencrypted SQLite file. M1 is a close third: hardcoded API keys extracted from the bundle. The pattern is that breaches come from **misplaced trust and plaintext storage**, not from exotic binary attacks — which is why effort is better spent on server-side authorisation and Keychain/Keystore usage than on obfuscation and jailbreak detection, the two controls teams most often reach for first.

---

## 17. Tricky Questions

**Q1: Your app stores the auth token in \`AsyncStorage\` "because it's encrypted on modern devices by full-disk encryption". Why is that reasoning wrong?**

**Full-disk encryption protects data at rest against someone who steals a powered-off device — it does nothing once the device is unlocked and running, which is precisely when your app and any attacker's tooling execute.** After first unlock, the filesystem is transparently decrypted, so \`AsyncStorage\`'s SQLite file or plaintext file is readable by anything with filesystem access: a rooted shell, a debugger attached to your process, a backup extraction, or a malicious app exploiting a path traversal. It also frequently gets included in iCloud or Android Auto Backup, so the token leaves the device entirely. Keychain and Keystore are different in kind, not degree: keys are held by the **secure element**, items can be marked device-only so they never sync, and access can require **user presence** enforced by hardware rather than by your code. The correct framing is that FDE defends against device theft, and Keychain/Keystore defend against a running attacker — you need the second one.

**Q2: You implement Face ID login. On a jailbroken device, an attacker hooks \`authenticateAsync\` to return \`true\` and gets straight in. Your code looked correct. What was the design error?**

**You used biometrics to obtain a *decision* rather than to unlock a *secret*.** \`authenticateAsync()\` returns a boolean produced inside your process on the attacker's device, so it is exactly as trustworthy as any other client-side check — hooking it is a one-line Frida script. The correct design never asks "did biometrics pass?"; it stores the refresh token in the Keychain or Keystore with \`requireAuthentication\` / \`setUserAuthenticationRequired(true)\` and simply **attempts to read it**. The secure element refuses to release the item without a successful biometric or passcode check, so a hooked boolean yields nothing because there is no token to use. Two follow-ons worth stating: bind the key to the **current biometric set** (\`biometryCurrentSet\`, \`setInvalidatedByBiometricEnrolment(true)\`) so an attacker who can unlock the device once cannot enrol their own fingerprint and keep access; and the server must still authenticate the token, since biometrics only ever proved local user presence.

**Q3: After rotating your TLS certificate, your app stops working for all existing users and you can't fix it with a server change. What went wrong and how do you recover?**

**You pinned the leaf certificate, so rotating it invalidated the pin baked into every installed binary.** The pin is client-side configuration you can only change by shipping a new build — which means an App Review round trip of days, during which every user is fully broken, and users who don't update stay broken indefinitely. Recovery: reissue the **previous certificate** if the CA allows it, or ship an emergency release with an expedited review request, and use any non-pinned channel you have (a remote config endpoint, a push message) to tell users to update. Prevention is the real answer: pin the **intermediate or the SPKI public key** rather than the leaf, since the key can survive certificate renewal; **always include a backup pin** for a not-yet-deployed key; set a pin **expiration** so it fails open instead of bricking the app permanently; and implement a **remote kill switch** that disables pinning without a release. This is why pinning is a deliberate operational commitment, not a checkbox.

**Q4: Your OAuth callback uses \`myapp://auth\`. A security review flags it as critical even though you use PKCE. Why is it still a problem?**

**Custom URL schemes are unverified — any app on the device can register \`myapp://\` and receive your authorization code.** PKCE is doing real work here: the intercepting app gets a code it cannot exchange, because the \`code_verifier\` never left your app. So PKCE prevents the token theft, which is why this isn't catastrophic. But two problems remain. The attacker can mount a **denial or confusion attack** — swallowing the callback so your login silently never completes — and depending on flow details can attempt **authorization code injection**, feeding your app a code obtained in their own session. There is also no way for the user or the OS to tell which app legitimately owns the scheme. The fix is a **verified deep link**: Universal Links on iOS (\`apple-app-site-association\`) or App Links on Android (\`assetlinks.json\` with \`android:autoVerify\`), both domain-verified so no other app can claim them, or a **loopback redirect** per RFC 8252. Keep PKCE either way; defence in depth is the point.

**Q5: Your app blocks rooted devices outright. Support tickets spike and an attacker is still using the app. What's the lesson?**

**You paid the full cost of the control and got none of the benefit.** Root detection runs on the attacker's device, so Magisk Hide, Frida and a dozen off-the-shelf bypasses defeat it — while the false positives hit real customers: developers, custom-ROM users, and people whose device trips a heuristic for unrelated reasons, all of whom are now locked out and calling support. So the control blocks paying users and not attackers, which is the worst possible ratio. The right posture is to treat root detection as a **risk signal**: log it, feed it into fraud scoring, gate only your highest-risk actions, and warn rather than block. For genuine assurance use **hardware-backed attestation** — App Attest or Play Integrity — verified **on your server**, since that produces a signal the client cannot forge. And keep the real defence where it belongs: server-side authorisation, rate limiting and anomaly detection, none of which the device can bypass.

---

## 18. Cheat Sheet

**Threat model**

1. Assume the attacker **owns the device**. No client check is a guarantee.
2. Only **server-side enforcement** guarantees anything.
3. You **cannot patch fast** — review takes days, users update slowly.
4. Client controls raise cost; that's their whole job.

**Storage**

5. **\`AsyncStorage\` is not secure** — plaintext, backed up, readable when rooted.
6. Tokens and keys → **iOS Keychain / Android Keystore**.
7. Mark items **device-only** so they don't sync to iCloud Keychain.
8. \`setUserAuthenticationRequired(true)\` / \`requireAuthentication\` for user presence.
9. Full-disk encryption protects a **powered-off** device, not a running one.
10. SQLite/Realm need SQLCipher; MMKV needs an explicit key.

**Biometrics**

11. Biometrics are a **local gate**, not an authentication protocol.
12. Never trust a boolean — use biometrics to **release a key**.
13. Invalidate keys on **enrolment change** (\`biometryCurrentSet\`).
14. Always offer a fallback — biometric-only is an accessibility failure.
15. \`NSFaceIDUsageDescription\` or the app crashes.

**Tokens**

16. Access token → **memory only**, short TTL. Refresh token → secure storage.
17. **Rotate refresh tokens** with server-side reuse detection.
18. Bind to device where possible; support remote revocation.
19. No \`httpOnly\` equivalent on mobile — the process holds the token.

**OAuth**

20. Mobile apps are **public clients** — no client secret, ever.
21. **Authorization Code + PKCE** (mandatory in OAuth 2.1).
22. **System browser**, never a WebView, for login.
23. Custom schemes are **hijackable** — prefer Universal Links / App Links.
24. Verify \`state\`; use a claimed-https or loopback redirect (RFC 8252).

**Network**

25. TLS 1.2+ enforced by **ATS** (iOS) and **Network Security Config** (Android).
26. Pin the **intermediate or SPKI**, never the leaf.
27. **Always ship a backup pin** + an expiration + a remote kill switch.
28. Pinning is anti-casual-inspection; Frida beats it on a rooted device.

**Deep links & WebView**

29. Every incoming link is **untrusted input** — allow-list paths and params.
30. Never perform a state-changing action straight from a link.
31. \`originWhitelist\` + \`onShouldStartLoadWithRequest\` on every WebView.
32. **Never** \`allowUniversalAccessFromFileURLs\`.
33. A JS bridge into a WebView with untrusted content is **RCE**.
34. Just opening a link? Use the system browser, not a WebView.

**Binary**

35. **No client-side secrets.** \`EXPO_PUBLIC_*\` and \`.env\` are inlined into the bundle.
36. Move secrets server-side, or mint short-lived scoped credentials.
37. Restrict unavoidable public keys by bundle ID / package + signature + quota.
38. Enable R8/ProGuard and Hermes — cost, not control.
39. Strip logs and debug flags from release; don't ship source maps publicly.

**Integrity**

40. Root/jailbreak detection = **risk signal**, never a gate. Expect false positives.
41. **App Attest** (iOS) / **Play Integrity** (Android), verified **server-side**.

**Purchases**

42. Validate receipts **server-side** against the store APIs.
43. Handle the lifecycle via server notifications — refunds revoke entitlement.
44. Idempotent, keyed on transaction ID. Restore-purchases is required.

**Leakage**

45. Mask sensitive screens on background (\`FLAG_SECURE\` / resign-active).
46. Clipboard is readable by other apps.
47. Strip release logging; scrub crash-reporter breadcrumbs.
48. Exclude sensitive files from backup; use \`secureTextEntry\` to keep text out of keyboard caches.

**Permissions & SDKs**

49. Minimum permission, at point of use, degrade gracefully on denial.
50. Audit what SDKs collect; declare it truthfully in Data Safety / nutrition labels.
51. Stale iOS SDKs without signed privacy manifests **block releases**.
52. Breaches come from **M3 (trusting the client)** and **M9 (plaintext storage)** — spend effort there.

---

## 19. References

- [OWASP Mobile Application Security](https://mas.owasp.org/) — MASVS and the MASTG testing guide.
- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [Apple — Keychain Services](https://developer.apple.com/documentation/security/keychain-services) and [Local Authentication](https://developer.apple.com/documentation/localauthentication)
- [Apple — App Attest / DeviceCheck](https://developer.apple.com/documentation/devicecheck)
- [Android — Keystore system](https://developer.android.com/privacy-and-security/keystore) and [security best practices](https://developer.android.com/privacy-and-security/security-tips)
- [Android — Network security configuration](https://developer.android.com/privacy-and-security/security-config)
- [Play Integrity API](https://developer.android.com/google/play/integrity)
- [RFC 8252 — OAuth 2.0 for Native Apps](https://datatracker.ietf.org/doc/html/rfc8252) and [RFC 7636 — PKCE](https://datatracker.ietf.org/doc/html/rfc7636)
- [App Store Server API](https://developer.apple.com/documentation/appstoreserverapi) and [Google Play Developer API](https://developers.google.com/android-publisher)
- [React Native security](https://reactnative.dev/docs/security) and [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/)
`;export{e as default};
