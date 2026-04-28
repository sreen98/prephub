# Google Play Store Launch — Complete Guide

A practical, end-to-end playbook for shipping any Android app to the Google Play Store — whether you're using React Native (Expo or bare), native Android (Kotlin/Java), Flutter, or any other framework. Covers everything from code-side preparation, Android build internals (AAB/APK/signing), Play Console forms, Closed Testing, the 14-day soak, and Production Access. Examples use Expo / EAS where they're most concrete, but the Play Console workflow is identical for every framework.

## Table of Contents

- [1. Overview & Timeline](#1-overview--timeline)
- [2. Code-Side Prerequisites](#2-code-side-prerequisites)
- [3. App Configuration (`app.json`)](#3-app-configuration-appjson)
- [4. EAS Build Setup](#4-eas-build-setup)
- [5. Privacy Policy & Data Deletion](#5-privacy-policy--data-deletion)
- [6. Cascade Delete — The Hidden Compliance Trap](#6-cascade-delete--the-hidden-compliance-trap)
- [7. Runtime Config from Backend](#7-runtime-config-from-backend)
- [8. Building the AAB](#8-building-the-aab)
- [9. Play Console Account Setup](#9-play-console-account-setup)
- [10. The 11 Dashboard Forms](#10-the-11-dashboard-forms)
- [11. Content Rating (IARC)](#11-content-rating-iarc)
- [12. Target Audience](#12-target-audience)
- [13. Data Safety Form (5 Steps)](#13-data-safety-form-5-steps)
- [14. Other Declarations](#14-other-declarations)
- [15. Store Settings — Category & Tags](#15-store-settings--category--tags)
- [16. Main Store Listing — Assets](#16-main-store-listing--assets)
- [17. Closed Testing Setup](#17-closed-testing-setup)
- [18. The 14-Day Soak & Production Access](#18-the-14-day-soak--production-access)
- [19. Common Pitfalls](#19-common-pitfalls)
- [20. Pre-Launch Checklist](#20-pre-launch-checklist)
- [21. Android Build Internals - AAB, APK & Signing](#21-android-build-internals---aab-apk--signing)
- [22. React Native and Expo Build Concerns](#22-react-native-and-expo-build-concerns)
- [23. Bundletool, Pre-Launch Report & Internal App Sharing](#23-bundletool-pre-launch-report--internal-app-sharing)
- [24. Interview Questions](#24-interview-questions)
- [25. Tricky Questions](#25-tricky-questions)
- [26. Cheat Sheet - 20 Rules to Remember](#26-cheat-sheet---20-rules-to-remember)
- [References](#references)

---

## 1. Overview & Timeline

### What you're shipping
An Android App Bundle (`.aab`) — Google Play's preferred format. Smaller download size, signed by Play (Play App Signing). EAS Build produces one for you.

### Timeline for a brand-new personal developer account

| Phase | Duration | Notes |
|---|---|---|
| Account verification | Hours to days | $25 one-time fee, ID verification |
| Code prep + first AAB build | 1–3 days | Privacy policy, data deletion endpoint, build config |
| Play Console forms | 1 day | 11 forms across the dashboard |
| Closed Testing review (first time) | 1–7 days | Google reviews your first submission |
| 14-day Closed Testing soak | 14 days | Required for new personal accounts |
| Production Access review | 1–7 days | After applying post-soak |
| Production review | 1–7 days | First production submission |
| **Total to public launch** | **~3–5 weeks** | If everything goes smoothly |

### Account types that matter
- **Personal account**: Subject to the 14-day Closed Testing rule (since Nov 2023). Needs 12+ testers.
- **Organization account**: No 14-day rule, but needs DUNS number and business documents.

If you don't have a registered business, personal is fine — just plan for the soak window.

---

## 2. Code-Side Prerequisites

Before you touch the Play Console, fix these in code. Catching them later costs you a rebuild + re-review.

### Privacy policy alignment
Your privacy policy makes claims (encryption, data deletion, no sharing). Verify every claim is actually true in the code. **Common gap:** "We delete all your data on request" — but the delete-account endpoint only removes the user document, leaving bills, photos, payments, and feedback orphaned. This is a Play Store policy violation and a GDPR exposure. Fix it before you submit anything.

### Account deletion endpoint
Google requires a way for users to delete their account from outside the app (a public URL). You need:
- **Web URL** (e.g., `https://yourapp.com/delete-account`) — publicly accessible
- **In-app deletion** that cascades through all related collections
- Both must work end-to-end before submission

### Encryption in transit
"Encryption in transit" = HTTPS / TLS. Make sure:
- All API calls use `https://`
- `app.json` sets `usesCleartextTraffic: false` for Android
- No accidental `http://` URLs in code

### Remove dev/debug artifacts
- All `console.log` calls (use a logger that's stripped in production)
- `expo-dev-client` must be in `devDependencies`, not `dependencies` — otherwise it bloats your prod build by ~5MB
- Sentry / Firebase / analytics SDKs should not be in debug mode

### Cookie/session security
If using session cookies, ensure `secure: true` (or `process.env.NODE_ENV === 'production'`) — never hardcode `secure: false`.

### Rotate any exposed secrets
Audit your `.env` files. If anything was committed to git (even briefly), rotate it: API keys, email service tokens, signing secrets.

---

## 3. App Configuration (`app.json`)

Your Expo `app.json` is the single source of truth for native config. Don't edit `android/` or `ios/` directly — they're regenerated by `expo prebuild`.

### Critical fields

```json
{
  "expo": {
    "name": "MyApp",
    "slug": "myapp-mobile",
    "scheme": "myapp",
    "version": "1.0.0",
    "android": {
      "package": "com.yourapp.appname",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "INTERNET",
        "USE_BIOMETRIC"
      ],
      "blockedPermissions": [
        "RECORD_AUDIO",
        "SYSTEM_ALERT_WINDOW"
      ]
    }
  }
}
```

**Notes:**
- `package` is your unique bundle ID. Once you ship a release with this, you can never change it for that app — pick carefully.
- `versionCode` is an integer that must increase with every release. Play Console rejects re-uploads of the same versionCode.
- `permissions` declares what your app uses. Anything you don't need, don't declare.
- `blockedPermissions` removes permissions that auto-merge from third-party SDKs. Useful when an SDK pulls in `RECORD_AUDIO` you don't want.

### Build properties plugin

```json
"plugins": [
  ["expo-build-properties", {
    "android": {
      "enableProguardInReleaseBuilds": true,
      "enableShrinkResourcesInReleaseBuilds": true,
      "newArchEnabled": false,
      "usesCleartextTraffic": false
    }
  }]
]
```

- **Proguard + shrink resources**: Reduces APK size, obfuscates code. Mandatory for production.
- **`usesCleartextTraffic: false`**: Blocks all non-HTTPS network traffic. Required for "Encryption in transit" claim.
- **`newArchEnabled`**: Set to `false` for SDK 55 unless you've thoroughly tested the new architecture with all native modules.

### Tablet support

```json
"ios": { "supportsTablet": true }
```

If you set this `true`, Play Console will require **7-inch and 10-inch tablet screenshots** for the store listing. If you don't have tablet-specific UI, set it to `false` to avoid the screenshot requirement.

---

## 4. EAS Build Setup

EAS (Expo Application Services) handles signing, native builds, and AAB generation in the cloud.

### `eas.json` profile for production

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "autoIncrement": false
      },
      "channel": "production"
    }
  }
}
```

### `autoIncrement` strategy

- **First build**: Set `false`. You want versionCode 1 to match what's in `app.json`.
- **After your first AAB is accepted by Play**: Flip to `true`. EAS auto-increments versionCode for every subsequent build.
- **Why this matters**: If you build with `autoIncrement: true` and your first AAB is rejected, your next build will be versionCode 2, leaving a gap. Then you'd have to manually fix the version logic.

### Sentry integration

```json
"plugins": [
  ["@sentry/react-native/expo", {
    "organization": "your-org",
    "project": "react-native"
  }]
]
```

Set the `SENTRY_AUTH_TOKEN` as an EAS secret:
```bash
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value <token>
```

This uploads sourcemaps during the build so Sentry can deminify stack traces.

### Sentry tracesSampleRate
If you set `tracesSampleRate > 0` in your Sentry init, you're collecting performance data → this counts as **"App interactions"** in the Data Safety form. Plan for that declaration.

---

## 5. Privacy Policy & Data Deletion

### Privacy policy requirements

Your privacy policy must be:
- **Hosted on a public URL** (not behind a login)
- **Accessible without the app installed**
- **Linked from the Play Console listing**
- **Linked from inside the app** (Settings → Privacy Policy)

It must accurately describe:
- What data you collect (every type)
- How it's used (purpose for each)
- Whether/with whom it's shared
- How users can delete their data
- Encryption practices (in transit, at rest)
- Children's data handling (if applicable)
- Contact information

### Data deletion URL

Google requires a public URL where users can request deletion **without installing the app**. Common pattern:

```
https://yourapp.com/delete-account
```

This page should:
- Explain what gets deleted (be specific — list every collection/data type)
- Provide a way to submit the request (form, email instructions, OAuth login)
- State the deletion timeline (typically 30 days)

Add the URL to:
- Play Console → App content → Data safety → Data deletion section
- Privacy policy

### Where to host
Free options that work:
- Vercel / Netlify static page
- GitHub Pages
- Your existing marketing site

**Don't host on Google Docs, Notion, or Medium** — Google sometimes flags those URLs as non-compliant.

---

## 6. Cascade Delete — The Hidden Compliance Trap

Most "delete account" implementations only delete the User document. This violates your privacy policy claim of "we delete all your data" and exposes you to GDPR/CCPA penalties.

### Three categories of data to handle

Every app has three kinds of user-related data:

1. **Owned data** — documents the user created and only they can see (their profile, their notes, their uploads, their feedback). **Hard-delete** these.
2. **Shared data — user is the author/owner** (a post they wrote, a chat group they created, a record they shared with others). **Hard-delete or transfer ownership** depending on UX. If others rely on it, anonymize the author field.
3. **Shared data — user is referenced by others** (User A appears as a comment author on User B's post, a participant in User B's group, a recipient in User B's transaction). **Anonymize** these references — never hard-delete or you'll break User B's data.

### Generic cascade pattern

```typescript
// Pseudocode — the same pattern applies whether you're using MongoDB,
// Postgres, DynamoDB, Firestore, etc.
export const deleteUserAccount = async (userId: string) => {

  // 1. Hard-delete OWNED documents
  await UserProfile.deleteMany({ userId });
  await UserUploads.deleteMany({ userId });        // any S3/storage too
  await UserPreferences.deleteMany({ userId });
  await Notifications.deleteMany({ userId });
  await Feedback.deleteMany({ userId });

  // 2. Hard-delete documents the user authored that no one else depends on
  await Drafts.deleteMany({ authorId: userId });

  // 3. Anonymize where the user is REFERENCED in others' data
  await Posts.updateMany(
    { "comments.authorId": userId },
    { $set: {
        "comments.$[c].authorId": null,
        "comments.$[c].authorName": "Deleted user",
        "comments.$[c].authorAvatar": null,
    }},
    { arrayFilters: [{ "c.authorId": userId }] }
  );
  await Groups.updateMany(
    { "members.userId": userId },
    { $set: {
        "members.$[m].userId": null,
        "members.$[m].displayName": "Deleted user",
        "members.$[m].email": null,
    }},
    { arrayFilters: [{ "m.userId": userId }] }
  );

  // 4. Strip identifiers from shared aggregate data (analytics, audit logs)
  // Replace identifying fields; keep the row so historical reports stay accurate
  await AuditLog.updateMany(
    { userId },
    { $set: { userId: null, userEmail: null } }
  );

  // 5. Revoke sessions / refresh tokens / push tokens
  await Sessions.deleteMany({ userId });
  await PushTokens.deleteMany({ userId });

  // 6. Delete the User document last
  return User.findByIdAndDelete(userId);
};
```

Wrap in a transaction (or a sequenced operation with idempotent retries) so a partial failure doesn't leave half-deleted state.

### Why anonymize rather than delete
If User A wrote a comment on User B's post, you can't simply delete that comment — User B's post would lose context. Replace User A's identifying info with placeholders. The post stays intact; User A's identity is gone. Same logic for group memberships, shared documents, transaction history, and audit logs.

### Don't forget non-database data
The user's data lives in more places than your primary DB:

- **Object storage** (S3, Cloud Storage, Cloudinary) — delete uploaded files / images.
- **Search index** (Elasticsearch, Algolia, Meilisearch) — remove indexed documents.
- **Email / SMS / push provider** (Mailgun, Twilio, Firebase Messaging) — unsubscribe + remove tokens.
- **Third-party analytics** (Mixpanel, Amplitude, Segment) — call their delete-user API.
- **Backups** — document a retention window in your privacy policy (typically 30–90 days).

### Test it locally before deploying
Create a test user, exercise every feature that creates data (post, comment, share with another user, upload), hit the delete endpoint, then verify every collection / table / index:

```bash
# MongoDB example — adapt to your DB
db.users.findOne({_id: <id>})               // null
db.userProfiles.find({userId: <id>})        // empty
db.userUploads.find({userId: <id>})         // empty
db.posts.find({"comments.authorId": <id>}) // empty (anonymized to null)
db.groups.find({"members.userId": <id>})   // empty (anonymized to null)
db.sessions.find({userId: <id>})            // empty
```

---

## 7. Runtime Config from Backend

Hardcoding URLs (privacy policy, Play Store link, force-update messages) means a code release every time something changes. Instead, store them in a Config collection and have the app fetch on launch.

### Backend Config model

```typescript
// configModel.ts
const ConfigSchema = new Schema({
  minimumVersion: { type: String, required: true },
  latestVersion: { type: String, required: true },
  forceUpdateMessage: { type: String, required: true },
  playStoreUrl: { type: String, required: true },
  privacyPolicyUrl: { type: String, required: true },
}, { timestamps: true });
```

### Auto-seed on first request

```typescript
// configController.ts
const DEFAULTS = {
  minimumVersion: "1.0.0",
  latestVersion: "1.0.0",
  forceUpdateMessage: "A critical update is available. Please update.",
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.yourapp.app",
  privacyPolicyUrl: "https://yourapp.com/privacy-policy",
};

export const getAppConfig = async (_req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create(DEFAULTS);
    }
    res.json(config);
  } catch (err) {
    res.json(DEFAULTS); // graceful fallback
  }
};
```

### Mobile-side: fetch on launch, store in Zustand

```typescript
// App.tsx
const config = await getAppConfig();
if (config) {
  useConfigStore.getState().setConfig(config);
  // force-update check
  if (compareVersions(currentVersion, config.minimumVersion) < 0) {
    showForceUpdateModal();
  }
}
```

```typescript
// SettingsScreen.tsx
const config = useConfigStore((s) => s.config);
const privacyPolicyUrl = config?.privacyPolicyUrl ?? FALLBACK_URL;
<TouchableOpacity onPress={() => Linking.openURL(privacyPolicyUrl)}>
  Privacy Policy
</TouchableOpacity>
```

### Why this matters for Play Store
- **Force updates**: When you ship a critical bug fix, you can require all users to update without a new app release.
- **Privacy policy URL changes**: If your hosting URL changes, you don't need to ship an app update.
- **Play Store URL**: Useful for "Rate us" / "Share app" features that point to your Play Store listing.

---

## 8. Building the AAB

### Local sanity check first

```bash
npx expo prebuild --platform android --clean
npx expo run:android  # local debug build, verify everything works
```

### Production build via EAS

```bash
eas build --platform android --profile production
```

**This costs build minutes if you're on Expo's free tier.** Don't trigger blindly. Review the output, watch for warnings, verify versionCode is what you expect.

The build typically takes 15–25 minutes. EAS uploads the `.aab` to its dashboard and sends a download link.

### What signing looks like
- **First build**: EAS generates a signing key for you (or you upload your own). Stored in EAS's encrypted credential store.
- **Play App Signing**: When you upload the AAB to Play Console, Google signs the final APK with their key for distribution. EAS's key signs the upload.
- **Don't lose your EAS credentials**: Run `eas credentials` to back them up. If lost, you can't update your app — Google won't let you switch signing keys.

### Verify before upload
- Download the `.aab` from EAS
- Check the file size (typical: 30–80 MB for an Expo app)
- If larger than 100 MB, audit your assets and dependencies

---

## 9. Play Console Account Setup

### One-time setup

1. **Create the developer account**: `play.google.com/console`
2. **Pay $25 one-time fee** (USD or local equivalent)
3. **Verify identity**: Government ID + selfie + address proof. Takes 1–3 days.
4. **Create the app**: "Create app" → fill name, default language, app/game, free/paid

### Bundle ID verification (one-time per app)

Google may require you to verify ownership of your Android package name. You'll see a "Registered + Verified" status when it's complete. Some setups require a one-time native plugin (`withAdiRegistration` or similar) — once verified, you can remove that plugin to keep your build clean.

### Managed publishing
- **OFF**: Approved changes auto-publish immediately.
- **ON**: You manually click "publish" after approval.

For closed testing: **OFF is fine**. For production: **turn ON** so you control the exact go-live moment.

---

## 10. The 11 Dashboard Forms

Play Console's dashboard has a "Set up your app" section with 11 (give or take) tasks. They must all be completed before submission. Below is a typical list:

1. **App access** — Can reviewers test all features without restrictions? (Most apps: yes; if login-gated, provide test credentials.)
2. **Ads** — Does your app contain ads? (No → declare none; Yes → declare and follow ad policies.)
3. **Content rating** — IARC questionnaire.
4. **Target audience and content** — Age groups; child-directed handling.
5. **News app** — Are you a news publisher? Almost always: No.
6. **COVID-19 contact tracing & status apps** — Almost always: No.
7. **Data safety** — The big 5-step form. Largest time investment.
8. **Government apps** — Are you a government agency? Almost always: No.
9. **Financial features** — Bill splitters, expense trackers usually: "No financial features" (you don't process payments or hold funds).
10. **Health** — Medical/fitness/wellness? Almost always: No.
11. **Advertising ID** — Does your app or any SDK use advertising ID? If you have no ad SDKs and Sentry only: No.

Plus separately under "Set up your store presence":
- **App category** (e.g., Finance, Productivity, Tools)
- **Tags** (1–5 relevant tags from a curated list)
- **Store listing** (icon, screenshots, descriptions, contact info)

---

## 11. Content Rating (IARC)

The International Age Rating Coalition questionnaire generates ratings for multiple regions in one go (PEGI, ESRB, ACB, etc.).

### Typical answers for a non-game app

| Category | Answer |
|---|---|
| Violence | None |
| Sexuality | None |
| Profanity | None |
| Drugs / alcohol / tobacco | None |
| Gambling | None |
| User-generated content | Depends — if users can post text/images visible to others, **Yes** |
| Shares user location | Depends — if you use precise location, **Yes** |
| Personal info collection | Yes (most apps collect emails, names, etc.) |
| Mini-games | None |

### Result
You'll get region-specific ratings (e.g., PEGI 3, ESRB Everyone). For most utility/productivity apps, you'll land in the lowest age tier.

### Important note
If your app has **chat features or user-generated content visible to others**, you must declare it. Failing to declare and being caught later results in app removal.

---

## 12. Target Audience

This determines whether your app is treated as child-directed (subject to COPPA in the US, GDPR-K in the EU).

### Standard adult app

- Target age: **18 and over**
- Will minors interact? **No**
- Restrict children from accessing? **Yes** (recommended for most non-children apps — this enables age-gating in the Play Store)

### If you want to support multiple age groups

You can pick multiple ages (13+, 16+, 18+) but you'll get extra requirements:
- "Designed for Families" program eligibility check
- COPPA/GDPR-K compliance for under-13 users (much stricter)
- Need a separate kid-safe ad declaration

**For most apps, "18+ only" is the simplest path.**

---

## 13. Data Safety Form (5 Steps)

This is the most time-consuming form. It's a 5-step wizard.

### Step 1: Overview
Just an informational page. Click Next.

### Step 2: Data collection and security

| Question | Typical answer |
|---|---|
| Does your app collect or share any user data? | **Yes** (almost always) |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (you set `usesCleartextTraffic: false`) |
| Do you provide a way for users to request that their data be deleted? | **Yes** (your delete-account URL) |

### Step 3: Data types

You'll see a list of data categories. Tick **only** what you actually collect.

For a typical app collecting: name, email, phone, user ID, app-specific content, profile photos, crash reports, analytics, device IDs:

| Section | Items to tick | Reasoning |
|---|---|---|
| **Personal info** (5/9) | Name, Email address, User IDs, Phone number, Other info | Other info = your app-specific user content (notes, posts, records, whatever your app stores) |
| **Photos and videos** (1/2) | Photos | Profile photo + any user-uploaded images |
| **App activity** (1/5) | App interactions | Sentry tracesSampleRate triggers this |
| **App info and performance** (2/3) | Crash logs, Diagnostics | Sentry collects both |
| **Device or other IDs** (1/1) | Device or other IDs | Most analytics SDKs collect this |
| Location | None | Unless you use precise/coarse location |
| Financial info | None | Unless you process payments |
| Messages | None | Unless you have chat |
| Audio files | None | Unless you record audio |
| Files and docs | None | Unless you store user docs |
| Calendar | None | Unless you read calendar |
| Contacts | None | Unless you read contacts |
| Web browsing | None | Unless you track URLs visited |
| Health and fitness | None | Unless you're a health app |

### Step 4: Data usage and handling (per-type follow-up)

For each ticked item, you get a popup with:

| Question | Standard answer |
|---|---|
| Collected? | Yes |
| Shared with third parties? | No (unless you actually share) |
| Processed ephemerally? | No (you store on server) |
| Required or optional? | Most: Required. Photos: Optional (opt-in feature) |
| Purposes (multi-select) | Varies by data type |

**Purpose mapping for common items:**

| Item | Purposes |
|---|---|
| Name | App functionality + Account management |
| Email | App functionality + Account management |
| Phone | App functionality + Account management |
| User IDs | App functionality + Account management |
| Other info (app-specific content) | App functionality |
| Photos | App functionality |
| App interactions | App functionality + Analytics |
| Crash logs | App functionality + Analytics |
| Diagnostics | App functionality + Analytics |
| Device IDs | App functionality + Analytics |

**Skip these purposes unless you actually do them:**
- Developer communications (only if you send marketing emails)
- Advertising or marketing
- Fraud prevention (only if you have fraud-detection logic)
- Personalisation (only if you customize content per user)

### Step 5: Preview
Review the generated summary. Common things to verify:
- "No data shared with third parties" appears (if you don't share)
- "Data is encrypted in transit" appears
- Delete-account URL is shown
- All data types from Step 3 are listed
- Privacy policy URL is shown

If anything is wrong, go back. Otherwise: **Save**.

### Notes on Sentry
- Sentry's default config collects crash reports → **Crash logs**
- Sentry with `tracesSampleRate > 0` collects performance/navigation traces → **App interactions** + **Diagnostics**
- Sentry uses device identifiers → **Device or other IDs**
- Sentry does NOT use Advertising ID by default → answer "No" on the Advertising ID declaration

---

## 14. Other Declarations

### Ads declaration
If you have **no ads**: "My app does not contain ads."

### Financial features
"Financial features" is a regulated category that triggers extra Play scrutiny. It means:
- Banking, loans, credit
- Mobile payments / wire transfers
- Cryptocurrency / NFT trading
- Stock trading / investment
- Crowdfunding
- Insurance
- Credit monitoring

If your app simply *tracks* numbers, *calculates* expenses, or *displays* market data without processing money on behalf of users, you select **My app doesn't provide any financial features**. Bill-splitters, expense trackers, budget calculators, and tip-calculators all fall under "no financial features." If you accept payments (Stripe, Razorpay, Square, in-app purchases for a service rather than digital content), you do declare financial features.

### Health, Government, News apps
For non-domain-specific apps: **No** to all three.

### Advertising ID
If you have no ad SDKs and use only Sentry for analytics: **No**.
If you ever add AdMob, Facebook Audience Network, AppsFlyer, etc., flip this to Yes.

---

## 15. Store Settings — Category & Tags

### Category
Pick the closest fit from Play's curated category list. Examples:

| App type | Category |
|---|---|
| Bill splitter, expense tracker, budget calculator | **Finance** |
| Note-taking, todo, calendar, file manager | **Productivity** |
| Habit tracker, journal, mindfulness | **Lifestyle** or **Health & Fitness** |
| Recipe, cooking, meal planner | **Food & Drink** |
| Photo editor, drawing, design | **Art & Design** or **Photography** |
| News reader, RSS, aggregator | **News & Magazines** |
| Chat, social network, dating | **Social**, **Communication**, or **Dating** |
| E-commerce, marketplace | **Shopping** |
| Streaming, podcasts, audio | **Music & Audio** or **Video Players & Editors** |
| Weather, clock, utility | **Tools** |
| Education / learning | **Education** |
| Step counter, workout, sleep tracking | **Health & Fitness** |
| Game | **Games** (with sub-genre — Action, Puzzle, etc.) |

When in doubt, look at how comparable popular apps in your space have categorized themselves — Play's category page lists the top apps per category.

### Tags
Click "Manage tags" and select 1–5. Pick tags that describe your app's actual function. Skip tags that imply features you don't have.

### Store Listing Contact details
- **Email**: Use a public-facing support email (e.g., `support@yourapp.com`). It's shown publicly.
- **Phone, Website**: Optional but website is recommended.

### External marketing
Keep "Advertise my app outside Google Play" **checked**. Free promotion via Google Search/YouTube; no downside unless you have a specific reason to suppress it.

---

## 16. Main Store Listing — Assets

This is what users see on the Play Store.

### Text fields

| Field | Limit | Notes |
|---|---|---|
| App name | 30 chars | Same as `expo.name` |
| Short description | 80 chars | Shown in search results — be punchy |
| Full description | 4000 chars | Use feature lists, target audience, key benefits |

**Short description tips:**
- Lead with the action verb
- Mention 2–3 key features
- Avoid keyword stuffing (Play penalizes it)

### Graphics — exact specs

| Asset | Size | Format | Required |
|---|---|---|---|
| App icon | 512×512 px | PNG | Yes |
| Feature graphic | 1024×500 px | PNG/JPEG | Yes |
| Phone screenshots | 320–3840 px sides, 16:9 or 9:16 | PNG/JPEG | 2–8 (recommend 4–6) |
| 7-inch tablet screenshots | 320–3840 px sides | PNG/JPEG | If `supportsTablet: true` |
| 10-inch tablet screenshots | 1080–7680 px sides | PNG/JPEG | If `supportsTablet: true` |
| Promo video | YouTube URL | — | Optional |
| Chromebook screenshots | — | — | Optional |
| Android XR | — | — | Optional |

### Resizing your icon
Your source `icon.png` is probably 1024×1024. Play Console requires exactly 512×512.

```bash
sips -z 512 512 assets/icon.png --out assets/icon-512.png
```

Then upload `icon-512.png`. Source stays untouched.

### Feature graphic
This is a 1024×500 banner shown above your screenshots. Build one in Figma/Canva:
- App logo + tagline
- Match your splash screen color for brand consistency
- Optionally: phone mockup showing the app

### Phone screenshots
Take on a real device or emulator at 1080×1920 or 1080×2400. Recommended flow:
1. Home / main list screen (with sample data, not empty state)
2. Core feature in action
3. Detail / drill-down view
4. A "wow" feature
5. Settings / customization
6. Empty state or onboarding

**Pro tip:** Add captions on top in Figma — boosts conversion 30%+. E.g., "Scan any receipt", "Split fairly", "See who owes what".

### Reusing phone screenshots for tablet
If you set `supportsTablet: true`, you must provide tablet screenshots. The cheapest path: reuse phone screenshots. The size ranges allow it (1080×1920 fits both 7-inch and 10-inch limits).

If your app has no real tablet UI, consider setting `supportsTablet: false` instead.

---

## 17. Closed Testing Setup

### Why Closed Testing (not Internal Testing)
For new personal accounts (since November 2023), Google requires:
- A Closed Testing track active for **14 consecutive days**
- **12+ active testers** during that window

Internal Testing **does not count** toward this requirement. Open Testing is overkill (public).

### Track structure
- **Internal testing**: Up to 100 testers, no Play review, instant rollout. Use for dev sanity checks.
- **Closed testing (Alpha/Beta tracks)**: Up to 100 testers per email list, requires Play review on first submission. Use for the soak.
- **Open testing**: Public, anyone can opt in.
- **Production**: Public release.

### Setting up Closed Testing

1. **Test and release** → **Testing** → **Closed testing** → **Create new track** (or use the default Alpha)
2. **Create release** → upload your `.aab`
3. **Release name**: Internal label (e.g., `1.0.0 — Initial closed testing`). Testers don't see this.
4. **Release notes**: Inside `<en-US>...</en-US>` tags. Brief description of what's in this release.
5. **Save** → **Review release** → **Start rollout**

### Testers tab

1. **Create email list** — paste 12+ Gmail / Google Workspace addresses
2. **Opt-in URL** — copy this. This is what you send to testers. They open it, click "Become a tester," then can install from Play Store.
3. **Feedback URL/email** — point to your support email or a feedback form
4. **Add countries/regions** — start small (e.g., your home country). You can expand later.

### Critical rules during the soak

- **Don't change the tester list mid-soak.** Google tracks tester stability. Adding/removing destabilizes the count.
- **Make sure 12+ testers actually install the app.** Just being on the list isn't enough.
- **Encourage testers to use the app daily** — Google tracks "active testers."

### What testers experience
1. Open opt-in URL (must be signed in with their tester Gmail)
2. Click "Become a tester"
3. Wait a few minutes (sometimes hours) for Play to process
4. Search for your app in Play Store, OR open the direct URL
5. Install — same as any normal app
6. Updates auto-deliver via Play Store

---

## 18. The 14-Day Soak & Production Access

### Day 0
First Closed Testing release goes live. 14-day countdown starts when **the first tester actually installs the app** (not when you upload).

### Days 1–14: Monitor

- **Sentry / Crashlytics**: Watch crash rates daily. If crashes spike, fix and ship a new Closed release.
- **Tester engagement**: Send periodic reminders to testers. Try to get 12+ active users daily.
- **Don't change the tester list.** Don't switch tracks. Stability counts.

### Day 14+: Apply for Production Access

In Play Console:
1. **Test and release** → **Production** → **Set up your app** (you'll see the "Apply for production access" prompt once you're eligible)
2. Fill the application:
   - How long has your app been in closed testing?
   - How many active testers?
   - Brief description of the app
   - Target users
3. Submit and wait 1–7 days

### Production rollout

Once approved:
1. Create a new release in the **Production** track
2. Upload the same AAB (or a newer one)
3. Choose **rollout percentage**: start at 5–10%, ramp up over a week
4. Monitor Sentry / Crashlytics during ramp
5. If issues, halt rollout, fix, ship new release

### Halt vs. release rollout
- **Halt rollout**: Stops new users from getting the version. Existing users keep it.
- **Release update**: Shipping a new versionCode replaces the previous one for all rolled-out users.

---

## 19. Common Pitfalls

### Privacy policy claims don't match code
**Symptom**: App approved, but later flagged for policy violation. App removal.
**Fix**: Audit privacy policy claims against actual code BEFORE submission. Especially "we delete all your data" — implement a true cascade delete.

### Missing crash logs declaration when using Sentry
**Symptom**: Data Safety form looks good, but reviewer flags incomplete declaration.
**Fix**: Tick both "Crash logs" AND "Diagnostics" under "App info and performance" if Sentry is in your build.

### Tablet screenshots required even though no tablet UI
**Symptom**: Form blocks you from saving Main Store Listing.
**Fix**: Either provide screenshots (reuse phone screenshots — they fit the size range) OR set `supportsTablet: false` in `app.json` and rebuild.

### `versionCode` collision
**Symptom**: Play Console rejects your AAB upload: "Version code 1 has already been used."
**Fix**: Bump versionCode in `app.json` (or let EAS `autoIncrement` handle it after first submission).

### `autoIncrement: true` from day 1
**Symptom**: First build is versionCode 2 (EAS incremented from 1). Now your local `app.json` says 1 but Play sees 2. Confusion.
**Fix**: Set `autoIncrement: false` for the first production build. Flip to `true` only after first AAB is accepted.

### `expo-dev-client` in `dependencies`
**Symptom**: Production AAB is 5–10MB larger than expected; sometimes shows "Connect to Metro" banner in production.
**Fix**: Move `expo-dev-client` to `devDependencies`. Rebuild.

### `RECORD_AUDIO` permission auto-added by SDK
**Symptom**: Play Console flags suspicious permission. Or your app shows "needs to record audio" prompt with no audio feature.
**Fix**: Add to `blockedPermissions` in `app.json` android section. Rebuild.

### Wrong category choice
**Symptom**: App reviewed under stricter policy than expected (e.g., chose "Finance" but Play treats it like a regulated payment app, or chose "Health & Fitness" and got flagged for medical-app rules).
**Fix**: Pick the closest non-regulated category that matches what users do in your app. Look at how the top apps in your space categorize themselves — match them, don't try to game discoverability with a more specific regulated category.

### Hardcoded `secure: false` on cookies
**Symptom**: GDPR audit flag; potential data-in-transit leak.
**Fix**: `secure: process.env.NODE_ENV === 'production'` — never `false` in prod.

### App icon not exactly 512×512
**Symptom**: Play Console rejects upload. Or shows "Needs cropping."
**Fix**: Resize externally with `sips` (macOS) or any image tool. Re-upload.

### "Needs cropping" filter is on
**Symptom**: Your icon doesn't show in the asset picker.
**Fix**: Untick the "Needs cropping" filter, OR resize the asset to the exact required dimensions.

### Forgetting to deploy backend before testers install
**Symptom**: Testers install, but the app crashes on first API call because backend doesn't have the new endpoints.
**Fix**: Deploy backend changes (cascade delete, Config collection, any new endpoints) BEFORE distributing the opt-in URL.

### Managed publishing OFF in production
**Symptom**: Update auto-published the moment Google approved, before you were ready.
**Fix**: Turn ON managed publishing for production. You manually click "publish" after approval.

### Lost EAS credentials
**Symptom**: Need to update app, but `eas build` says credentials are missing/different.
**Fix**: Run `eas credentials` and back up the keystore + key alias + passwords. If lost, you can't update — Google won't accept a different signing key for the same package.

---

## 20. Pre-Launch Checklist

Print this and tick before you submit anything.

### Code-side

- [ ] All `console.log` statements removed (or behind `__DEV__` check)
- [ ] `expo-dev-client` in `devDependencies`, not `dependencies`
- [ ] `secure: true` on all production cookies
- [ ] All API URLs use HTTPS
- [ ] `usesCleartextTraffic: false` in `app.json`
- [ ] Cascade delete implemented and tested locally
- [ ] Privacy policy hosted on public URL
- [ ] Delete-account public URL hosted and works
- [ ] Privacy policy claims match actual code behavior
- [ ] No exposed secrets in git history (rotated if any)
- [ ] Sentry sourcemap upload configured

### App config

- [ ] Unique `package` / bundle ID set
- [ ] `versionCode: 1` for first build
- [ ] Permissions list is minimal — only what you actually use
- [ ] `blockedPermissions` includes anything an SDK might add that you don't want
- [ ] Icon at `assets/icon.png` (1024×1024 source)
- [ ] Splash screen / adaptive icon configured

### Build

- [ ] `eas.json` production profile uses `buildType: app-bundle`
- [ ] `autoIncrement: false` for first build
- [ ] Local `npx expo run:android` works without errors
- [ ] First production AAB built successfully via EAS
- [ ] AAB downloaded and file size sanity-checked

### Play Console — App content

- [ ] App access declaration submitted
- [ ] Ads declaration submitted (No ads)
- [ ] Content rating questionnaire complete (IARC certificate received)
- [ ] Target audience: 18+ with restriction
- [ ] News app: No
- [ ] Data safety: 5 steps complete, preview reviewed
- [ ] Government apps: No
- [ ] Financial features: No (or correctly declared)
- [ ] Health: No
- [ ] Advertising ID: No (unless using ads)
- [ ] Privacy policy URL added

### Play Console — Store presence

- [ ] App category: appropriate choice (e.g., Finance)
- [ ] Tags: 1–5 selected
- [ ] Store Listing contact email is public-facing
- [ ] Main Store Listing — text fields filled
- [ ] App icon uploaded (512×512)
- [ ] Feature graphic uploaded (1024×500)
- [ ] 4–6 phone screenshots uploaded
- [ ] Tablet screenshots uploaded (if `supportsTablet: true`)

### Closed Testing

- [ ] Closed Testing track created (Alpha)
- [ ] AAB uploaded to release
- [ ] Release notes written
- [ ] Tester email list created (12+ Gmail addresses)
- [ ] Opt-in URL copied
- [ ] Countries/regions configured
- [ ] Backend deployed with all required endpoints
- [ ] Backend smoke-tested via opt-in URL flow

### Post-submission

- [ ] Monitor Sentry / Crashlytics daily
- [ ] Track tester install count (12+ within first week)
- [ ] Don't modify tester list mid-soak
- [ ] Day 14: apply for Production Access
- [ ] After Production Access: ramp rollout 5% → 25% → 50% → 100%
- [ ] After first acceptance: flip `autoIncrement: true` in eas.json

---

## 21. Android Build Internals - AAB, APK & Signing

### 21.1 APK vs AAB

**APK (Android Package Kit)** is the legacy install format — a ZIP containing `classes.dex`, resources, native libs, and the manifest. One APK ships everything (every screen density, every CPU ABI, every locale) to every device, even if 80% of those resources are unused.

**AAB (Android App Bundle)** is a publishing format introduced in 2018. It's also a ZIP, but Google Play uses it to *generate* per-device APKs at install time. A user on an `arm64-v8a` device with `xxhdpi` density and English locale gets an APK with only those slices — typically 30–50% smaller than a universal APK.

| Format | Purpose | Where it lives |
|---|---|---|
| `.aab` | Publishing artifact you upload to Play | Play Console |
| Split APKs | What Play generates and ships | Generated server-side |
| Universal APK | One APK with everything | Used for sideloading; never published |
| `.apks` | Container of split APKs (debug tool) | Output of `bundletool` |

**Why Play forced the switch (Aug 2021):** Smaller installs = better install rates and lower carrier-data complaints. Apps over 150 MB *must* use AAB.

**Local debug installs** still use APK. `npx expo run:android` produces an APK, not an AAB.

### 21.2 What's Inside an APK

```
app.apk
├── AndroidManifest.xml        # Compiled to binary XML
├── classes.dex                # Compiled Java/Kotlin → Dalvik bytecode
├── classes2.dex, ...          # Multidex if you cross 65,536 method limit
├── resources.arsc             # Compiled resource lookup table
├── res/                       # Raw resources (drawables, layouts, anim)
├── lib/
│   ├── arm64-v8a/             # Native .so libraries per ABI
│   ├── armeabi-v7a/
│   ├── x86_64/
│   └── x86/
├── assets/                    # Bundled JS for RN, fonts, etc.
├── META-INF/                  # Signature blocks (V1)
└── kotlin/                    # Kotlin stdlib metadata
```

For a React Native app, `assets/index.android.bundle` is your minified JS bundle, and `lib/<abi>/libhermes.so` (or `libjsc.so`) is the JavaScript engine.

### 21.3 The Android Build Pipeline

```
.kt / .java        ────►  javac/kotlinc  ────►  .class files
                                                    │
.xml resources     ────►  AAPT2          ────►  resources.arsc
                                                    │
                                                    ▼
.class + R.class   ────►  R8 (shrink, obfuscate, optimize)
                                                    │
                                                    ▼
                          D8 (dex compiler)  ────►  classes.dex
                                                    │
                                                    ▼
                          zipalign + sign   ────►  signed APK / AAB
```

For React Native specifically, an extra step bundles `index.js` → `assets/index.android.bundle` (Metro bundler) and Hermes optionally pre-compiles that to bytecode (`.hbc`).

### 21.4 R8 - Shrinking, Obfuscation, Optimization

R8 (which replaced ProGuard in AGP 3.4+) does four things in one pass:

1. **Tree shaking** — removes unreachable classes/methods. Example: importing `lodash` and using only `_.debounce` doesn't ship the whole library.
2. **Resource shrinking** — removes drawables/strings nothing references.
3. **Obfuscation** — renames `com.example.UserService` → `a.b.c`. Smaller dex + harder to reverse-engineer.
4. **Optimization** — inlines methods, eliminates dead branches, simplifies switches.

Enabled in Expo via:

```json
"expo-build-properties": {
  "android": {
    "enableProguardInReleaseBuilds": true,
    "enableShrinkResourcesInReleaseBuilds": true
  }
}
```

**Keep rules** (`proguard-rules.pro`) tell R8 which classes/methods *must not* be removed or renamed — typically anything accessed via reflection (Gson models, JNI methods, native callbacks). React Native's autolinking generates these for you, but a bare project may need manual rules:

```
-keep class com.facebook.react.** { *; }
-keep class com.yourcompany.NativeModule { *; }
```

**Symptoms when keep rules are wrong:** the debug build works, the release build crashes with `NoSuchMethodError` or `ClassNotFoundException`. Keep `mapping.txt` — Play Console accepts uploads for crash deobfuscation.

### 21.5 APK Signature Schemes V1 to V4

| Scheme | Year | What it signs | Min API |
|---|---|---|---|
| **V1** (JAR signing) | Pre-2017 | Each file individually via `META-INF/MANIFEST.MF` — slow, verifies post-install | 1 |
| **V2** (whole-file) | Android 7.0 (2016) | Entire APK in one go via APK Signing Block — verified before install | 24 |
| **V3** (key rotation) | Android 9.0 (2018) | V2 + lineage block proving the new key is endorsed by the old one | 28 |
| **V4** (incremental) | Android 11 (2020) | Signature stored in `.idsig` next to APK; supports ADB Incremental for huge installs | 30 |

For a Play-published app you should sign with **at least V1+V2**, ideally V1+V2+V3. Modern AGP and Play App Signing handle this automatically — you don't manually pick. The only time it matters is if your `minSdkVersion` is 23 or lower; then V1 is required (V2-only won't install on Android 6).

### 21.6 Upload Key vs App Signing Key

When Play App Signing is enabled (mandatory for new apps since Aug 2021):

```
Your machine / EAS                        Google's servers                 User's device
   ┌───────────────┐                     ┌─────────────────┐              ┌────────────┐
   │  Upload key   │  signs upload  ──►  │ App signing key │ resigns ──►  │ Final APK  │
   │  (yours)      │                     │ (Google's)      │              │            │
   └───────────────┘                     └─────────────────┘              └────────────┘
```

- **Upload key** — your private key. Used to sign the AAB *before* uploading. Stored in EAS or your local keystore.
- **App signing key** — Google's private key. Used to sign the per-device APK that ships to users. Google never gives you this, but commits to a key fingerprint that never changes for the app's lifetime.
- **What users verify** — the app signing key fingerprint, not the upload key. So you can lose / rotate the upload key without changing the user-facing identity.

**If you lose your upload key** — file a support request, prove ownership, and Google generates a new upload key. The app signing key stays the same, so updates still work.

**Without Play App Signing** (legacy apps) — you sign the user-facing APK directly. Lose the key = you can never update the app, period. New developers don't have this option; Play forces App Signing.

### 21.7 Key Rotation, Key Upgrade & Recovery

Three operations often confused:

- **Upload key reset** — replace your upload key. Cheap, safe, supported. File a Play Console request, prove ownership, supply your new key fingerprint, wait 1–2 business days.
- **App signing key upgrade** — Play offers a one-time upgrade from a 2 048-bit RSA key to a stronger one (e.g., 4 096-bit RSA). Old devices keep verifying with the old key (V2); new ones verify with the new (V3 lineage). Only relevant if your original key didn't meet modern strength requirements.
- **App signing key rotation** — replace Google's signing key for your app entirely via the V3 lineage block. Almost no one needs this; it's reserved for compromise scenarios.

Keystore basics for those rolling their own credentials:

```bash
# Generate a fresh upload key (PKCS12 format - JKS is deprecated)
keytool -genkeypair \
  -alias upload \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -keystore upload-keystore.jks \
  -storetype PKCS12

# Inspect a keystore
keytool -list -v -keystore upload-keystore.jks

# Get the fingerprint Play needs
keytool -list -v -keystore upload-keystore.jks | grep -i sha
```

EAS does this for you — `eas credentials` is the entry point.

### 21.8 versionCode vs versionName

```json
"android": {
  "versionCode": 14,        // integer, internal — what Play tracks
  "version": "1.2.3"        // string — what users see (Expo maps this to versionName)
}
```

| Field | Type | Visible to user? | Must increase? |
|---|---|---|---|
| `versionCode` | int (max 2 100 000 000) | No | Yes — strictly monotonic per app |
| `versionName` | string | Yes (Play listing, Settings → About) | Recommended SemVer but not enforced |

A common scheme for multi-track releases:

```
versionCode = MAJOR * 10000 + MINOR * 1000 + PATCH * 100 + BUILD
            =       1 * 10000 +     2 * 1000 +    3 * 100 +    14
            = 12314
```

This way you never collide across release tracks (internal build 5 and prod build 5 of the same version differ in BUILD).

### 21.9 minSdkVersion / targetSdkVersion / compileSdkVersion

| Field | Meaning | What happens if wrong |
|---|---|---|
| `minSdkVersion` | Lowest Android version your app installs on | Devices below that don't see your app on Play |
| `targetSdkVersion` | Android version your app is *tested against* — drives compat behavior | Play enforces a minimum (currently 34 for new apps); below = upload rejected |
| `compileSdkVersion` | Android API the project compiles against | Too low = can't use new APIs; too high = nothing on its own, but may pull in incompatible libs |

**Target SDK is the political one.** Google bumps the required `targetSdkVersion` annually. Apps that don't meet the new floor get hidden from the Play Store for users on newer Android versions, even if the app still works.

### 21.10 Manifest Merger

Each library you include can declare permissions, components, and `<uses-feature>` tags in *its* manifest. Gradle's manifest merger combines them all into one `AndroidManifest.xml`.

**Common surprise:** an SDK declares `<uses-permission android:name="android.permission.RECORD_AUDIO" />` even if you don't use that feature. Now your app *requests* audio at install/runtime, scaring users.

**Fix:** override in your manifest with `tools:node="remove"`:

```xml
<uses-permission
  android:name="android.permission.RECORD_AUDIO"
  tools:node="remove" />
```

In Expo, this is the `blockedPermissions` array in `app.json` — it generates the same `tools:node="remove"` automatically.

To inspect what merged in, look at `android/app/build/intermediates/merged_manifests/release/AndroidManifest.xml` after a build, or run `./gradlew app:processReleaseManifest`.

### 21.11 Hermes & Baseline Profiles

**Hermes** is Meta's JavaScript engine optimized for React Native:

- Pre-compiles JS → bytecode (`.hbc`) at build time, so app startup skips the parse/compile phase.
- Smaller heap usage, better cold-start time on low-end Android.
- Default in React Native ≥ 0.70.

Toggle in `app.json`:

```json
"jsEngine": "hermes"   // or "jsc"
```

**Baseline Profiles** ship with your app and tell ART (Android Runtime) which methods to AOT-compile at install time. This dramatically improves first-launch performance on Android 9+. Generated by:

1. Running an instrumented benchmark (`androidx.benchmark`) of your critical user journey.
2. Bundling the resulting profile in `assets/dexopt/baseline.prof`.

For an app where startup time matters, baseline profiles are typically a 20–30% improvement worth chasing. Hermes precompilation handles the JS side; baseline profiles handle the native/Android side. Both stack.

### 21.12 Dynamic Delivery & Feature Modules

AAB unlocks three module types:

- **Install-time** — included in the base install. Default for everything.
- **On-demand** — downloaded only when your app calls `SplitInstallManager.startInstall()`. Useful for huge optional features (a video editor in a productivity app).
- **Conditional** — installed only if the device meets criteria (e.g., AR-only module installs only on AR-capable phones).

Most React Native / Expo apps don't use feature modules — the JS bundle is monolithic. But if you have a 200 MB ML model used by 10% of users, an on-demand module can keep your base install lean.

### 21.13 OTA Updates - What Play Allows

You can update **JavaScript and assets** without a Play submission via:

- **EAS Update** (Expo) — hosted by Expo, channel-based.
- **CodePush** (Microsoft, retiring March 2025) — hosted by Microsoft.
- **Self-hosted** — `react-native-code-push`-compatible servers.

What you **cannot** ship via OTA (Play policy):

- Native code changes (anything in `android/` that requires recompilation).
- New permissions.
- Behavior changes that materially diverge from your last reviewed version (Play interprets this loosely; obvious cases are blocked).

**Rule of thumb:** OTA for bug fixes and minor features. Submit a new AAB for new permissions, new native modules, RN version upgrades, or major UX changes.

---

## 22. React Native and Expo Build Concerns

### 22.1 Bridge vs JSI vs Fabric vs TurboModules

| Term | Old way | New way |
|---|---|---|
| Bridge | JSON-serialized async messages between JS and native | — |
| **JSI** (JavaScript Interface) | — | Direct C++ binding; calls feel synchronous |
| **TurboModules** | NativeModules over the bridge | TurboModules over JSI — typed, lazy-loaded |
| **Fabric** | UIManager over the bridge | Fabric renderer over JSI — concurrent-mode aware |
| **Bridgeless** | — | RN ≥ 0.74 — the legacy bridge is gone entirely |

The "New Architecture" is the bundle of JSI + TurboModules + Fabric + Hermes + Bridgeless. As of RN 0.76, it's the default. For a brand-new app, leave it on. For an app upgrading from old-arch, third-party native modules may not yet support it — that's why our `app.json` keeps `newArchEnabled: false` until the full dependency graph is verified.

### 22.2 Managed vs Bare Workflow

| Workflow | Native code | Custom native modules | Recommended for |
|---|---|---|---|
| **Managed (Expo Go / EAS)** | Expo manages | Only Config Plugin–compatible | Most apps; fastest to ship |
| **Bare** | You own `android/` and `ios/` | Anything | Apps with deep native customization |

**Prebuild** is the bridge: `npx expo prebuild` regenerates native folders from your `app.json` + plugins. After prebuild you *can* edit `android/`, but a future prebuild will overwrite it — so use config plugins instead for durable native customization.

### 22.3 EAS Build vs Local Gradle

| Aspect | EAS Build | Local `./gradlew assembleRelease` |
|---|---|---|
| Where | Expo cloud | Your machine |
| Speed | 15–25 min | 2–10 min after the first build |
| Cost | Free tier limits, then per-minute | Free |
| Reproducibility | Identical across devs | Depends on local toolchain |
| Credentials | Stored in EAS | You manage `.keystore` files |
| iOS support | Yes | Mac required |

For CI, EAS shines. For a fast inner loop on Android, local Gradle is faster — assuming you've solved JDK + Android SDK + NDK installation pain.

### 22.4 Sourcemaps & Crash Symbolication

Without sourcemaps, a Sentry crash looks like:

```
TypeError: undefined is not an object (evaluating 'a.b')
  at index.android.bundle:1:42857
```

With sourcemaps:

```
TypeError: undefined is not an object (evaluating 'user.profile')
  at UserScreen.tsx:42:18
```

The Sentry Expo plugin uploads sourcemaps to Sentry during the EAS build. Two requirements:

1. `SENTRY_AUTH_TOKEN` set as an EAS secret.
2. `@sentry/react-native/expo` plugin in `app.json`.

After the build, verify in Sentry → Settings → Source Maps that the bundle and map for your `versionCode` are present. If they aren't, your crash reports stay obfuscated forever — there's no retroactive upload.

### 22.5 expo-doctor & Dependency Drift

`npx expo-doctor` audits your `package.json` against the SDK's expected versions. Common output:

```
✖ Expected react-native@0.76.5, found 0.76.3
✖ react-native-gesture-handler is not compatible with Expo SDK 52
```

Run before every release build. Mismatched native dependency versions are a top cause of "works in dev, crashes in release" failures.

---

## 23. Bundletool, Pre-Launch Report & Internal App Sharing

### Bundletool

Google's CLI for working with AAB locally:

```bash
# Convert AAB → universal APK for sideloading testing
bundletool build-apks \
  --bundle=app.aab \
  --output=app.apks \
  --mode=universal

# Install on connected device (chooses correct splits)
bundletool install-apks --apks=app.apks
```

Use this to verify your AAB actually runs end-to-end before uploading to Play. Catches manifest-merger bugs and signing issues earlier.

### Firebase Pre-Launch Report

Once you upload an AAB to *any* track (internal/closed/etc.), Play kicks off an automated test:

- Robo crawler taps through your app on 5–10 device configurations.
- Reports crashes, ANRs, accessibility issues, performance metrics.
- Available in Play Console → Testing → Pre-launch report.
- Free, runs in 1–2 hours.

**Common findings:** missing splash screen on certain densities, ANR on cold start when permissions denied, dark-mode contrast warnings.

### Internal App Sharing

Different from Internal Testing track. A drop-zone where you can upload any AAB and get a shareable URL — no review, no version-number constraints, no email list. Useful for:

- Sharing builds with stakeholders without the testing-track ceremony.
- Letting QA test a candidate before promoting it to Closed Testing.

URL: `play.google.com/console/internal-app-sharing/`

---

## 24. Interview Questions

### Beginner

**Q1: What is the difference between an APK and an AAB?**

An APK (Android Package Kit) is the legacy installable package — a single ZIP containing every screen density, every CPU ABI, and every locale your app supports. Every device downloads the same file. An AAB (Android App Bundle) is a publishing format you upload to Google Play. Play uses it to generate per-device APKs server-side — a user only downloads the slices their device actually needs (their ABI, their density, their language). The result is a 30–50% smaller install on average. Since August 2021, all new apps on Play must be AABs; APKs are still used for sideloading and for stores that don't support AAB.

---

**Q2: What is `versionCode` vs `versionName`, and why does Play care about both?**

`versionCode` is an integer (max ~2.1 billion) that Play uses internally to compare releases. It must strictly increase with every upload — Play rejects re-uploads of the same code. `versionName` is a human-readable string like `"1.2.3"` shown to users in the Play listing and the device's app info screen. Play doesn't enforce SemVer on `versionName` — it just shows what you give it. The split exists because you may want internal versioning (fine-grained build numbers) different from the marketing version users see.

---

**Q3: What does Play App Signing do, and why is it now mandatory?**

Play App Signing splits the signing into two keys: an **upload key** you control (used to sign the AAB you upload) and an **app signing key** Google holds (used to sign the per-device APK that ships to users). Users only verify the app signing key fingerprint. The benefit is recoverability: if you lose the upload key, you can prove ownership and Play issues a new one — users keep getting updates because the app signing key never changed. Without Play App Signing, losing your key meant you could never update the app. Mandatory for all new Play apps since August 2021.

---

**Q4: What is the 14-day Closed Testing soak rule?**

Since November 2023, new personal Play developer accounts must run a Closed Testing track for 14 consecutive days with at least 12 active testers before they can apply for Production access. The intent is to catch policy and quality issues before they reach the public. Internal Testing does *not* count. Organization accounts (which require a DUNS number) bypass this requirement.

---

**Q5: Why must your app's privacy policy be hosted on a public URL?**

Google's policies require the privacy policy to be reachable without installing the app, without a login, and from a public web URL. The same URL is shown in the Play listing and inside the app (Settings → Privacy Policy). It must accurately describe every data type your app collects, who you share it with, how users delete their data, and your encryption practices. Mismatches between the policy and actual app behavior are a top cause of post-approval app removal.

---

**Q6: Why do you set `usesCleartextTraffic` to `false`?**

`usesCleartextTraffic: false` tells Android to block all non-HTTPS network traffic at the OS level. It's required to truthfully claim "Encryption in transit" in the Play Data Safety form. Without it, an accidental `http://` URL would silently leak user data. With it, the OS throws an error so you catch the bug in development.

---

**Q7: What does `expo prebuild` do?**

`npx expo prebuild` regenerates the `android/` and `ios/` native project folders from your `app.json` + Expo config plugins. It's the bridge between Expo's managed (config-driven) workflow and a bare native project. After prebuild you can edit native files, but the next prebuild overwrites your edits — config plugins are the durable way to express native customization.

---

**Q8: What's the difference between Internal, Closed, and Open testing tracks?**

| Track | Audience | Play review | Best use |
|---|---|---|---|
| Internal | Up to 100 testers via email list | None — instant rollout | Quick dev sanity checks |
| Closed | Up to 100 testers per email list (multiple lists allowed) | Yes, on first submission per track | The required 14-day soak |
| Open | Public — anyone can opt in | Yes | Public beta |

Internal Testing does *not* count toward the 14-day soak — only Closed Testing does.

---

### Intermediate

**Q9: Walk through what happens when a user installs your app from Play.**

1. User taps Install. Play looks at the device's ABI (`arm64-v8a`), density (`xxhdpi`), and locale (`en-US`).
2. Play picks the matching split APKs from your AAB and stitches them on its servers.
3. Play signs the resulting APK with your **app signing key** (not the upload key).
4. APK downloads to the device. Android verifies the signature using V2/V3 APK Signing Block.
5. Android extracts the package, registers it in Package Manager, and runs install-time hooks.
6. If you have install-time feature modules, Play also delivers those splits.
7. App is launchable.

The whole pipeline is per-device, which is why an AAB can ship a 60 MB install where a universal APK would be 120 MB.

---

**Q10: What is R8, and what are "keep rules"?**

R8 is the code shrinker/optimizer that runs on release builds (replaced ProGuard in AGP 3.4+). It does tree-shaking, resource shrinking, obfuscation (renaming classes/methods), and inlining/optimization in one pass — typically cutting 20–40% off APK size and making reverse engineering meaningfully harder.

R8 doesn't know about reflection, JNI, or JSON deserialization — anything that looks up classes by name at runtime. **Keep rules** in `proguard-rules.pro` tell R8 "don't touch these symbols." Typical examples: Gson model classes (`-keep class com.example.models.** { *; }`), JNI methods, native callbacks. React Native's autolinking generates the keep rules you need; bare native code may need manual rules.

---

**Q11: What are the Android signature schemes V1, V2, V3, V4 and when does each matter?**

- **V1** (JAR signing) — Pre-2017. Signs each file individually via `META-INF/MANIFEST.MF`. Slow, verifies post-install. Required for `minSdk ≤ 23`.
- **V2** (Android 7.0) — Signs the entire APK in one pass via the APK Signing Block. Verifies *before* install, much faster, prevents tampering with metadata.
- **V3** (Android 9.0) — Adds a key-rotation lineage block, so you can prove a new signing key is endorsed by the old one.
- **V4** (Android 11) — Signature stored in a separate `.idsig` file alongside the APK. Enables ADB Incremental for huge installs (the app can launch while it's still streaming).

Modern AGP signs with V1+V2+V3 by default. Practically: leave it alone unless you're targeting Android 6 or below.

---

**Q12: How would you handle a force update for users on an outdated app version?**

Don't hardcode the minimum version in the app. Use a backend Config endpoint:

```js
// On app launch
const config = await fetch('/api/config').then(r => r.json());
if (semver.lt(currentVersion, config.minimumVersion)) {
  showForceUpdateModal({ playStoreUrl: config.playStoreUrl });
}
```

The Config endpoint returns `{ minimumVersion, latestVersion, playStoreUrl, message }`. When you ship a critical fix, bump `minimumVersion` server-side and every user on launch is gated. No new app release needed for the gate itself.

Keep a graceful fallback: if `/api/config` errors, log and skip the force-update — never lock users out because your own backend is down.

---

**Q13: What is the manifest merger and how do you fix a permission you don't want?**

Each Android library declares its own `AndroidManifest.xml`. Gradle merges them all into one final manifest. A library you didn't write can sneak in `<uses-permission android:name="android.permission.RECORD_AUDIO" />` even if you don't record audio — and now your install-time permission list scares users.

Override it in your manifest with `tools:node="remove"`:

```xml
<uses-permission
  android:name="android.permission.RECORD_AUDIO"
  tools:node="remove" />
```

In Expo's `app.json`, put `"RECORD_AUDIO"` in the `blockedPermissions` array — Expo emits the same `tools:node="remove"` during prebuild. To audit what merged in, inspect `android/app/build/intermediates/merged_manifests/release/AndroidManifest.xml` after a build.

---

**Q14: What is `targetSdkVersion`, and why does Play care so much about it?**

`targetSdkVersion` is the Android version your app declares it has been *tested against*. The OS uses this to decide which compatibility shims to apply — for example, scoped storage, runtime permission models, background execution restrictions. If your `targetSdk` is 28 and the device runs Android 14, Android applies legacy behavior so older apps don't break.

Google bumps the **required** minimum `targetSdkVersion` annually. Apps that don't keep up get hidden from Play for users on newer Android versions, even though they technically still work. As of late 2024 the floor is API 34 (Android 14) for new apps and updates. The intent is to keep the ecosystem on modern security/privacy primitives.

---

**Q15: What are sourcemaps in the React Native build, and what breaks if they aren't uploaded?**

When Metro bundles your JS, it minifies — `userProfile` becomes `a`, line numbers compress to a single line. The sourcemap is a `.map` file that maps minified positions back to original `.tsx`/`.ts` source.

Without sourcemaps uploaded to Sentry/Crashlytics, every crash report looks like `at index.android.bundle:1:42857` — useless for debugging. With them: `at UserScreen.tsx:42:18` — actionable.

Sourcemaps must be uploaded **at build time, keyed by `versionCode`**. The Sentry Expo plugin does this automatically when `SENTRY_AUTH_TOKEN` is set as an EAS secret. There's no retroactive upload — if you forget for a release, those crashes stay obfuscated forever.

---

**Q16: How does the Data Safety form interact with Sentry?**

Sentry, by default, collects:

- **Crash logs** → tick "Crash logs" under "App info and performance"
- **Stack traces + device state** → tick "Diagnostics" under "App info and performance"
- **Device identifiers** (install ID, not Advertising ID) → tick "Device or other IDs"

If you enable performance monitoring (`tracesSampleRate > 0`), Sentry also captures navigation and tap events → tick **"App interactions"** under "App activity".

Sentry does **not** use the Android Advertising ID by default, so the dedicated "Advertising ID" declaration stays "No" unless you have AdMob or similar.

Forgetting any of these is a top reason Play reviewers send the form back asking for a more complete declaration.

---

### Advanced

**Q17: How do you implement GDPR-compliant cascade delete for a multi-collection schema?**

The typical "delete account" endpoint only removes the User document — leaving every related document orphaned. That violates the privacy policy claim of "we delete all your data" and is a GDPR exposure. Three-step strategy:

1. **Cascade delete** for documents the user *owns*: their profile, settings, uploads, feedback, drafts, notifications. `deleteMany({ userId })` in each collection. Don't forget non-database stores: object storage (S3 / GCS), search indexes, third-party analytics, push-notification tokens.
2. **Anonymize** in documents owned by *others* that reference this user — comments on someone else's post, members of a shared group, recipients in a transaction, audit logs. You can't hard-delete those rows without breaking the owning user's data. Replace identifying fields (`name`, `email`, `phone`, `userId`) with `null` / `"Deleted user"` placeholders.
3. **Revoke credentials** — sessions, refresh tokens, push tokens, OAuth grants, API keys.

Wrap it in a transaction (or sequenced idempotent retries) so a partial failure doesn't leave half-deleted state. Test by creating a rich account that has interacted with other accounts (commented, shared, joined groups), deleting it, and confirming every collection has zero rows referencing the user ID and zero unanonymized references.

---

**Q18: What is the New Architecture in React Native, and what's the migration risk?**

The New Architecture replaces the old asynchronous JSON bridge with:

- **JSI** — a C++ interface that lets JS hold direct references to native objects, with synchronous calls.
- **TurboModules** — native modules over JSI; typed via codegen, lazy-loaded.
- **Fabric** — a new renderer over JSI, concurrent-mode aware, supports React's Suspense/transitions properly.
- **Bridgeless mode** (RN ≥ 0.74) — the legacy bridge is removed entirely.
- Hermes is the de facto JS engine for the New Architecture.

Migration risk lies in third-party native modules: each has to be ported. Until your full dependency graph supports the New Architecture, you keep `newArchEnabled: false` in `app.json`. As of RN 0.76 it's the default for new apps, but upgrading a real app means auditing every native module.

---

**Q19: How would you debug an ANR (Application Not Responding) reported in Play Console?**

ANRs in Play Console come with:

- **Stack trace** of the main thread at the moment Android killed the app for blocking >5s.
- **Device state** (CPU, memory, foreground/background).
- **Frequency** by device model and Android version.

Workflow:

1. **Symbolicate** — make sure your sourcemaps / `mapping.txt` are uploaded for that `versionCode`. Without that, the stack is unreadable.
2. **Identify the blocking call.** Common React Native culprits: synchronous bridge calls (legacy arch), `JSON.parse` of huge payloads on the main thread, `MainQueueExecutor` work that should be on a background queue.
3. **Reproduce locally** with Android Studio's CPU profiler and Strict Mode (`StrictMode.setThreadPolicy`) which crashes on disk/network on the main thread.
4. **Fix** by moving work off the main thread — `InteractionManager.runAfterInteractions`, native module work on a background queue, or splitting heavy JS work with `setImmediate` / `requestAnimationFrame`.

ANRs over 0.47% (the user-perceived ANR rate threshold) trigger Play's "Bad Behaviour" Vital, which can cause demotion in search rankings.

---

**Q20: Compare Play App Signing key rotation, key upgrade, and lost-upload-key recovery.**

Three operations, often confused:

1. **Lost-upload-key recovery** — you lost your upload key. File a Play support request, prove ownership (sign-off from your developer email, 2FA), Play replaces the upload key. The app signing key never changes; users see no impact. Cheap, supported.
2. **App signing key upgrade** — Play offers a one-time upgrade from a 2 048-bit RSA key to a stronger key (e.g., 4 096-bit RSA). Only relevant for apps whose original signing key was created before stricter requirements. Old devices keep verifying with the old key (V2), new devices verify with the new (V3 lineage), so updates work for everyone.
3. **App signing key rotation** — replace Google's signing key for your app entirely. Uses the V3 lineage block; only meaningful on Android 13+ devices. Almost no one does this; it's reserved for compromise scenarios.

Practically: most developers will only ever do (1).

---

**Q21: What can you change via OTA (EAS Update / CodePush) and what *must* be a Play submission?**

You **can** ship via OTA:

- JavaScript bundle changes (logic, UI, screens, business rules).
- Asset changes (images, fonts, JSON configs in `assets/`).
- React component fixes, styling tweaks, copy changes.

You **cannot** ship via OTA:

- Anything in `android/` or `ios/` requiring native recompilation — new native modules, library upgrades that bump native code, RN engine version changes.
- New permissions in `AndroidManifest.xml`.
- Behavior changes that materially diverge from the last reviewed version (Play interprets this loosely; flagrant cases are blocked, but an incremental UI improvement is fine).

Rule of thumb: bug fixes and minor features = OTA; new permissions, native modules, or RN upgrade = new AAB.

---

**Q22: Walk through the full release rollout strategy for a high-traffic app.**

1. **Internal Testing** — push the AAB. Smoke test on dev/QA devices.
2. **Closed Testing - Alpha** — 10–50 power users. Run for 3–7 days. Watch Sentry crash-free rate; target ≥ 99.5%.
3. **Closed Testing - Beta** — 1 000–10 000 users. Run for 7+ days. Watch ANR rate (target < 0.47%), crash rate, and key business metrics (sign-up, retention).
4. **Production staged rollout** — start at **5%**. Watch for 24 hours.
5. **Bump to 25%** if metrics hold. Watch 24 hours.
6. **Bump to 50%**, watch 24 hours. **100%** after another 24h.
7. **Halt rollout** if Sentry crash rate spikes >2× baseline or ANR rate exceeds 0.47%. New users stop getting the version; existing users keep it.
8. **Hotfix** with a new versionCode if the bug is in code; you can release the hotfix straight to 100% if confidence is high.

Every step gets logged in your release tracker, so a post-mortem can identify which percentage exposed the regression.

---

**Q23: What are baseline profiles and when are they worth the effort?**

Baseline profiles are pre-computed lists of "hot" methods that ART (Android Runtime) AOT-compiles at install time, instead of relying on JIT during the first few launches.

- **What they help** — cold start, screen transitions, list scrolling. Typically 20–30% improvement on the first few launches.
- **How they're generated** — write an `androidx.benchmark` macro test that scripts the critical user journey (open app → log in → open feed → scroll). The test outputs a `baseline-prof.txt` you bundle in `assets/dexopt/baseline.prof`.
- **When they're worth it** — high-volume consumer apps where startup time materially affects retention. For a niche productivity tool with 10 k users, the engineering cost outweighs the gain.

Hermes precompilation (which RN does by default) addresses the JS side; baseline profiles address the native/Android side. Both stack.

---

**Q24: How would you architect a privacy-policy / Play-Store-URL system that you can change without an app release?**

A backend `Config` collection with a `GET /api/config` endpoint returning:

```json
{
  "minimumVersion": "1.2.0",
  "latestVersion": "1.5.0",
  "forceUpdateMessage": "Critical update — please update.",
  "privacyPolicyUrl": "https://yourapp.com/privacy",
  "termsOfServiceUrl": "https://yourapp.com/terms",
  "playStoreUrl": "https://play.google.com/store/apps/details?id=com.yourapp",
  "supportEmail": "support@yourapp.com"
}
```

Auto-seed the document on first request so a fresh database doesn't error. The mobile app fetches it on launch, stores in a Zustand store, and reads from it everywhere a URL would otherwise be hardcoded. Always ship a fallback: if `/api/config` fails, fall back to bundled defaults — never block app boot on a non-essential network call.

This pattern means: changing the privacy policy URL, ramping a force-update, or replacing the support email is a single backend update, not a Play submission + 1–7 day review + 14-day soak.

---

## 25. Tricky Questions

**Q1: Your CI built an AAB with `versionCode: 14`. You upload it to Play and get "Version code 14 has already been used. Try another version code." But you've never used 14 before — only 1, 2, 3, ..., 11 in past releases. What's happening, and how do you fix it without burning more EAS build minutes?**

Play tracks the **highest versionCode ever uploaded across all tracks**. A previous internal-testing build that someone forgot about almost certainly used codes 12, 13, and/or 14. The track is irrelevant — Play stores one global high-water mark per app.

Two ways to fix without a rebuild:

- **In Play Console**, go to Internal/Closed testing → past releases. You'll see the orphan upload at versionCode 14. There's no way to "release" a code; you have to bump and re-upload.
- **Locally**, run `eas build --platform android --profile production` with `versionCode` bumped to 15 (or set `autoIncrement: true` so EAS handles it). You will pay one rebuild.

The deeper lesson: never assume `versionCode` resets per track. Adopt `autoIncrement: true` immediately after your first successful upload so the local source of truth (`app.json`) and Play's high-water mark stay in sync.

**Takeaway:** Play tracks a global versionCode high-water mark across all release tracks. Internal-testing throwaways still consume codes.

---

**Q2: You set `autoIncrement: true` in `eas.json` from day one. Your `app.json` says `versionCode: 1`. You build, get versionCode 1 in the artifact, upload to Play. Play accepts it. The next day you build again, get versionCode 2, upload — accepted. But your `app.json` still says 1. A new dev clones the repo, builds locally with `npx expo run:android`, and gets versionCode 1 in the debug APK. Why is this a problem the moment you ship?**

The new dev's debug APK is signed with their local keystore (different from yours), but more importantly its `versionCode` is 1 — the same as your *first* released production build. If they sideload it onto a phone that has the production app installed, Android refuses ("app not installed") because the signing key doesn't match. Worse: every CI job, every PR build, every dev-environment build is colliding on `versionCode: 1`, so nobody has a clean way to test "is my local build newer than what's on Play?"

The fix: after your first successful production upload, manually bump `app.json` to match Play's reality (`"versionCode": 2`). From then on, `autoIncrement: true` works because every new dev who clones the repo starts from a code higher than any historical artifact in their environment.

**Takeaway:** `autoIncrement` mutates Play's view of versionCode without writing back to `app.json`. After the first prod release, sync `app.json` to the latest released code so local builds don't collide on stale numbers.

---

**Q3: You've configured `usesCleartextTraffic: false` and `enableProguardInReleaseBuilds: true`. Release build runs fine on your phone. You ship to Closed Testing. Testers report the app crashes immediately on the login screen. Sentry shows `ClassNotFoundException: com.yourapp.models.LoginRequest`. Debug build still works. What happened, and what's the smallest fix?**

R8 obfuscated your model classes, but your network library (likely Gson, kotlinx.serialization, or a Retrofit converter) reads them via reflection by class name. After R8, `com.yourapp.models.LoginRequest` no longer exists at runtime — it's now `a.b.c`. Reflection fails, the converter throws, the app crashes.

Smallest fix: add a keep rule for your model package in `proguard-rules.pro`:

```
-keep class com.yourapp.models.** { *; }
-keepclassmembers class com.yourapp.models.** { *; }
```

For Gson specifically:

```
-keepattributes Signature
-keep class com.google.gson.reflect.TypeToken { *; }
-keep class * extends com.google.gson.reflect.TypeToken
```

For kotlinx.serialization, use the official rules from the library docs.

Debug builds didn't crash because debug doesn't run R8 — code names are intact.

**Takeaway:** R8 obfuscation can break any code that touches symbols by name (reflection, JNI, JSON deserialization). Add explicit keep rules for those classes; if release crashes but debug doesn't, R8 is the prime suspect.

---

**Q4: You're on a personal Play account, started Closed Testing on Day 0 with 12 testers, all installed by Day 1. On Day 7 you notice three testers haven't opened the app in days, so you replace them with three more enthusiastic friends. On Day 14 you apply for Production Access. Google rejects: "We did not detect 12+ testers active for 14 consecutive days." You can prove 12+ active testers most days. What did you misunderstand, and how do you recover?**

The 14-day soak counts **continuous tester-list stability**, not the rolling count of active testers on each day. When you removed three testers and added three on Day 7, Google interpreted that as a new tester cohort starting then — your effective soak day became Day 7, not Day 0. You needed Day 7 → Day 21 to satisfy "14 consecutive days of stable testers, ≥ 12 active."

Recovery: don't change the tester list again. Wait until Day 21 (14 days from your last change), make sure 12+ testers are active in that window, and reapply. Going forward, treat the tester list as immutable during the soak — communicate aggressively to keep your initial 12 engaged rather than rotating them.

**Takeaway:** the 14-day soak window resets when the tester roster changes. Plan for a stable 12+ from day zero; don't rotate testers mid-soak.

---

**Q5: You add Sentry with `tracesSampleRate: 0.2` for performance monitoring. You fill out Data Safety: "Crash logs: Yes, Diagnostics: Yes, Device or other IDs: Yes". You submit. Reviewer rejects with "Data Safety form does not match observed app behavior." What's the missing declaration?**

Sentry with `tracesSampleRate > 0` collects performance traces — navigation transitions, tap events, network latency — which Play categorizes as **"App interactions"** under the **App activity** section, not under "App info and performance." You declared crash logs and diagnostics (correct) but missed the App activity → App interactions tick.

Add **App interactions** in Step 3 of the Data Safety form, then in Step 4 declare its purposes (typically `App functionality` + `Analytics`). Resubmit.

The general rule: Play distinguishes between **what** is collected (crashes, performance, identifiers) and **why** (functionality, analytics, advertising). Crash logs are reactive (you collect on error); App interactions are proactive (you sample during normal use). Each lives in a different category.

**Takeaway:** Sentry `tracesSampleRate > 0` means you're collecting App interactions, not just diagnostics. Declare it under App activity → App interactions.

---

**Q6: Your app's privacy policy says "All data is encrypted in transit and at rest. We delete all your data within 30 days of account deletion." Reviewer approves the app. Three weeks later, a user reports that their name and email are still showing up as a comment author on someone else's posts after they deleted their account. Play sends a policy violation notice. What did you miss in your delete-account flow, and what's the bigger compliance risk?**

The delete-account endpoint hard-deleted the User document and the user's owned content, but missed the places where the user was *referenced inside other users' data* — comments on someone else's post, members of a shared group, recipients on someone else's transaction, audit logs. User A's identifying fields (name, email, phone) sit embedded inside User B's documents, untouched. The "we delete all your data" claim is now demonstrably false.

The fix isn't deletion (you'd break User B's post by removing the comment). It's **anonymization**: when you delete User A, scan every collection where they're referenced and replace identifying fields with placeholders:

```js
await Posts.updateMany(
  { 'comments.authorId': userId },
  { $set: {
      'comments.$[c].authorId': null,
      'comments.$[c].authorName': 'Deleted user',
      'comments.$[c].authorAvatar': null,
  }},
  { arrayFilters: [{ 'c.authorId': userId }] }
);
```

Repeat for every collection that references users — group memberships, audit logs, shared documents, transaction participants. Don't forget non-database stores: search indexes, third-party analytics, push-notification provider tokens.

The bigger compliance risk: GDPR / CCPA. A privacy-policy mismatch is the kind of thing that triggers user complaints, then regulator complaints, then fines. The Play policy enforcement is a wake-up call, not the actual penalty.

**Takeaway:** "Delete all your data" requires cascading through every collection AND anonymizing references in other users' data. Test by creating an account, sharing data with another account, deleting, then querying every collection for the dead userId.

---

**Q7: You set `supportsTablet: false` in `app.json` because your app has no real tablet UI. The build succeeds, AAB uploads. Yet Play Console asks for 7-inch tablet screenshots when you try to save the Main Store Listing. Why, and what's the simplest fix?**

The Main Store Listing's tablet-screenshot requirement is decoupled from manifest-level `supportsTablet`. Play asks for tablet screenshots as part of "discoverability" (your listing should look right on a tablet) regardless of whether you advertise tablet support in the manifest. Even if your app's manifest filters tablets out of installs, the listing is still browsed on tablets.

Two fixes:

1. **Provide screenshots** — easiest. Upload your phone screenshots; the size ranges (1080×1920) overlap with the 7-inch and 10-inch tablet ranges. Play accepts them.
2. **Provide native tablet screenshots** — if your app does have minor tablet rendering (e.g., bigger fonts), take real screenshots in Android emulator with a `Pixel C` or `Nexus 9` profile.

Don't try to fight the form — it always wins. Provide assets and move on.

**Takeaway:** Tablet screenshot requirement isn't gated solely by `supportsTablet`. Reusing phone screenshots that fit the size range is the path of least resistance.

---

**Q8: You upload your first AAB to Closed Testing. Play accepts it. Two days later, you change the EAS signing key (you migrated keystores). The next AAB upload fails: "Upload key fingerprint does not match the registered upload key." You panic. Are you locked out of your app forever?**

No — you're locked out only until you reset the upload key in Play Console. Critically: this is **upload key fingerprint**, not **app signing key** fingerprint. Play App Signing means Google holds the app signing key (which never changes for the life of the app); your upload key is just an envelope wrapper.

Fix:

1. Play Console → Setup → App integrity → App signing → Request upload key reset.
2. Provide the new public key fingerprint (from `eas credentials` or `keytool -list`).
3. Wait 1–2 business days for Play to verify and switch.
4. Resume uploads with the new key.

If you'd lost the *app signing key* (which can't happen with Play App Signing; only legacy V1-only apps without App Signing risk this), you'd be permanently unable to update the app — Google won't switch user-facing keys. The whole point of Play App Signing is to make upload-key loss recoverable.

**Takeaway:** Lost / changed upload key = recoverable via Play Console reset (1–2 days). Lost app signing key (legacy non-Play-Signed apps only) = unrecoverable. Play App Signing exists to prevent this.

---

**Q9: You enable Managed Publishing OFF for Closed Testing (so each release rolls out automatically) and ON for Production. Your team submits a fix to production. Two days later Google approves. You're on vacation. The release auto-publishes anyway. How is that possible?**

Managed Publishing in Play Console has two scopes that confuse people:

- **Per-release** managed publishing — controls a specific release (set when you create the release).
- **App-level** managed publishing — controls the whole app (set in Publishing overview).

If app-level Managed Publishing is OFF and you didn't explicitly mark a release as "managed," the release publishes automatically when Google approves — even if you intended otherwise.

Fix: turn on **app-level** Managed Publishing in Publishing overview → Managed publishing → ON. Now *every* approved change waits for a manual "Publish" click. Don't rely on per-release toggles for this; the app-level switch is the real safety net.

**Takeaway:** Managed Publishing has app-level and per-release scopes. Toggle the app-level one ON in Publishing overview to guarantee no auto-publish, ever.

---

**Q10: Your app uses an SDK that requires `RECORD_AUDIO`. You don't actually use the audio feature, so you add `"RECORD_AUDIO"` to `blockedPermissions` in `app.json`. You build and upload. Testers install — but the SDK throws `SecurityException: requires RECORD_AUDIO permission` at runtime when it auto-initializes. Why doesn't blocking the permission make the SDK quietly skip its audio feature?**

`blockedPermissions` removes the permission *declaration* from your AndroidManifest.xml — Android will never grant it because you never request it. That's a privacy win (the install screen doesn't list it, the runtime prompt never appears). But the SDK code that calls `MediaRecorder.start()` doesn't know that. It assumes the permission exists, calls the audio API, and Android throws `SecurityException`.

Three options, in order of safety:

1. **Configure the SDK to disable its audio feature.** Most SDKs have a flag like `audioEnabled: false` in their config — use it. Now the SDK never calls the API.
2. **Wrap the SDK** so its initialization is guarded behind your own boolean, and only initialize on screens that need the SDK's non-audio features.
3. **If neither works**, you must either declare the permission and live with the user prompt, or replace the SDK.

`blockedPermissions` is a privacy guarantee for users, not a feature flag for SDKs. Declaring vs blocking is independent of the SDK's runtime behavior.

**Takeaway:** Removing a manifest permission doesn't disable the code that uses it. Always pair `blockedPermissions` with disabling the corresponding feature in the SDK, or you ship runtime crashes.

---

## 26. Cheat Sheet - 20 Rules to Remember

1. **AAB > APK** — Play requires AAB for new apps; APK is for sideloading only.
2. **Play App Signing is mandatory** — your upload key signs uploads, Google's signing key signs the user-facing APK.
3. **Lose the upload key** = recoverable via Play Console reset. **Lose the app signing key** (legacy) = permanent app death.
4. **`versionCode`** is a global, ever-increasing integer per app (not per track).
5. **`autoIncrement: false` for the first build**; flip to `true` after, AND sync `app.json` to Play's reality.
6. **`targetSdkVersion`** has a yearly Google-enforced floor — keep up or get hidden from Play.
7. **`usesCleartextTraffic: false`** is the OS-level enforcement of "Encryption in transit."
8. **R8 obfuscates** — anything accessed via reflection, JNI, or JSON parsing needs a keep rule.
9. **`blockedPermissions`** removes the manifest declaration; you still must disable the SDK feature that uses it.
10. **Privacy policy must be public** (no login wall), accurate, and linked from both Play listing AND in-app Settings.
11. **Cascade delete + anonymize** — delete user-owned docs, anonymize references in other users' docs.
12. **Public delete-account URL** is a Play requirement — works without installing the app.
13. **14-day Closed Testing soak** — needs 12+ active testers, **stable list** (no rotation).
14. **Internal Testing doesn't count** toward the soak; only Closed Testing does.
15. **Sentry default = Crash logs + Diagnostics + Device IDs**; `tracesSampleRate > 0` adds **App interactions**.
16. **Managed Publishing app-level ON** prevents auto-publish on approval.
17. **OTA (EAS Update / CodePush)** ships JS + assets. Anything native = new AAB.
18. **Sourcemaps must be uploaded per `versionCode`** — no retroactive upload, no symbolicated stack traces.
19. **Hermes** = JS bytecode at build time; **baseline profiles** = AOT-compiled native methods at install.
20. **Tablet screenshots** are required even with `supportsTablet: false` if Play asks — reuse phone screenshots that fit the size range.

---

## References

- [Google Play Console](https://play.google.com/console)
- [Play Console Help — Closed Testing requirements for new accounts](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Data Safety form documentation](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Content Rating (IARC)](https://support.google.com/googleplay/android-developer/answer/188189)
- [Play Console policy center](https://play.google.com/console/about/policy)
- [Expo EAS Build documentation](https://docs.expo.dev/build/introduction)
- [Expo app.json reference](https://docs.expo.dev/versions/latest/config/app)
- [Sentry React Native setup](https://docs.sentry.io/platforms/react-native/manual-setup/expo)
- [Android App Bundle format](https://developer.android.com/guide/app-bundle)
- [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)
