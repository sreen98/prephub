const e=`# iOS & App Store Deployment — Complete Guide

The counterpart to the [Play Store Deployment guide](/frontend/play-store-deployment). iOS shipping is harder than Android in one specific way — **code signing** (§3) — and easier in another: there is one store, one review process, and no fragmentation.

Everything here assumes a React Native or Expo app, but the App Store Connect and signing material applies to any iOS app.

## Table of Contents

1. [Overview & Timeline](#1-overview-timeline)
2. [Apple Developer Program](#2-apple-developer-program)
3. [Code Signing — the Core Concept](#3-code-signing-the-core-concept)
4. [Bundle ID, Capabilities and Entitlements](#4-bundle-id-capabilities-and-entitlements)
5. [Info.plist and Usage Descriptions](#5-infoplist-and-usage-descriptions)
6. [Versioning](#6-versioning)
7. [Building — Archive to IPA](#7-building-archive-to-ipa)
8. [Automating the Build](#8-automating-the-build)
9. [App Store Connect](#9-app-store-connect)
10. [TestFlight](#10-testflight)
11. [Privacy — Manifests, Labels and ATT](#11-privacy-manifests-labels-and-att)
12. [App Transport Security](#12-app-transport-security)
13. [Store Listing Assets](#13-store-listing-assets)
14. [Submission and Release](#14-submission-and-release)
15. [App Review — Common Rejections](#15-app-review-common-rejections)
16. [Push Notifications on iOS](#16-push-notifications-on-ios)
17. [Universal Links](#17-universal-links)
18. [App Size and Thinning](#18-app-size-and-thinning)
19. [iOS-Specific React Native Concerns](#19-ios-specific-react-native-concerns)
20. [Pre-Submission Checklist](#20-pre-submission-checklist)
21. [Interview Questions & Answers](#21-interview-questions-answers)
22. [Tricky Questions](#22-tricky-questions)
23. [Cheat Sheet](#23-cheat-sheet)
24. [References](#24-references)

---

## 1. Overview & Timeline

\`\`\`
Enrol in the Apple Developer Program      1–2 days (up to a week for orgs)
Create App ID + signing assets            hours
Configure the project + privacy manifest  1–2 days
Archive and upload a build                hours
TestFlight internal testing               immediate (no review)
TestFlight external testing               Beta App Review, ~1 day
Submit for App Store review               typically 24–48 h
Phased release to 100%                    7 days (optional)
\`\`\`

Realistic first-submission timeline: **1–2 weeks**, dominated by enrolment and the privacy paperwork rather than review. Apple's review is far faster than its reputation — the median is under a day — but a rejection costs a full round trip, which is why §15 matters most.

The single biggest structural difference from Android: **you cannot ship without Apple's approval**, and there is no equivalent of Play's staged rollout to production without review. Every update goes through review.

---

## 2. Apple Developer Program

- **$99/year**, per account. Required to distribute on the App Store or via TestFlight.
- **Individual vs Organization.** An Organization account requires a **D-U-N-S number** and legal-entity verification, which is what takes a week. It also gives you team roles and shows your company name as the seller — an Individual account shows your personal name, which is usually not what a business wants. Migrating later is painful, so choose correctly up front.
- **Roles**: Account Holder (one, owns the agreement), Admin, App Manager, Developer, Marketing, Finance. Only the Account Holder can accept new agreements — a common release blocker when Apple updates terms and the holder is on leave.
- The **Apple Developer Enterprise Program** ($299/yr) is for internal-only distribution and is not a route to the public store.

Alternatives for internal apps: **Ad Hoc** distribution (up to 100 devices per type, registered by UDID) and **Custom Apps for Business** through Apple Business Manager.

---

## 3. Code Signing — the Core Concept

This is where iOS deployment actually breaks, and it is the most-asked area in interviews. Four pieces must agree:

| Piece | What it is | Lives where |
|---|---|---|
| **Certificate** | proves *who* built it (a public/private key pair) | Keychain + Apple |
| **App ID** | the bundle identifier registered with Apple | Developer portal |
| **Provisioning profile** | binds certificate + App ID + devices + entitlements | Portal, embedded in the app |
| **Entitlements** | which capabilities the app may use | \`.entitlements\` file |

\`\`\`
Certificate (who)  +  App ID (what)  +  Devices (where)  +  Entitlements (allowed to do)
                          ↓
                  Provisioning profile
                          ↓
                  Signed .app → .ipa
\`\`\`

**Certificate types:** *Apple Development* (run on your registered devices) and *Apple Distribution* (App Store and Ad Hoc). The **private key never leaves the machine that generated the CSR** — which is why a certificate downloaded onto a new laptop is useless without exporting the key as a \`.p12\`. Losing the key means revoking and re-issuing.

**Provisioning profile types:**

- **Development** — your registered devices, debuggable.
- **Ad Hoc** — up to 100 registered devices per device type, per year, no review.
- **App Store** — no device list, cannot be installed directly; only for upload.
- **Enterprise (In-House)** — internal distribution, Enterprise program only.

Profiles **expire after a year** (certificates too), and an expired profile is the classic "it built last month and fails today". The mitigations are **Xcode automatic signing** for simple apps, **\`fastlane match\`** for teams (stores the certificates and profiles encrypted in a private git repo so every machine and CI runner shares one identity), or **Xcode Cloud / EAS** managed credentials.

---

## 4. Bundle ID, Capabilities and Entitlements

The **bundle identifier** (\`com.company.app\`) is permanent. You cannot change it after release — a new bundle ID is a new app, with a new App Store listing and no upgrade path for existing users.

**Capabilities** are enabled in Xcode (Signing & Capabilities) and must match the App ID's configuration in the portal:

\`\`\`
Push Notifications · Sign in with Apple · Associated Domains (universal links)
App Groups (share data with extensions) · Keychain Sharing · HealthKit
Background Modes · In-App Purchase · CarPlay · iCloud
\`\`\`

Enabling a capability writes an **entitlement** into \`App.entitlements\`, and the provisioning profile must carry the same entitlement or signing fails. This three-way agreement — Xcode capability, App ID configuration, provisioning profile — is the second-most common signing failure after expiry.

\`\`\`xml
<!-- App.entitlements -->
<key>aps-environment</key><string>production</string>
<key>com.apple.developer.associated-domains</key>
<array><string>applinks:example.com</string></array>
\`\`\`

**\`aps-environment\`** deserves attention: it is \`development\` for debug builds and \`production\` for App Store builds, and it selects which APNs environment your device token is valid for. A token minted against the sandbox will silently fail against production APNs (§16).

---

## 5. Info.plist and Usage Descriptions

**Every privacy-sensitive API needs a purpose string, or the app is rejected** — and if the key is missing entirely, the app *crashes* the moment the API is called.

\`\`\`xml
<key>NSCameraUsageDescription</key>
<string>Take a photo to attach to your report.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Choose an existing photo to attach.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Show jobs near you.</string>
<key>NSMicrophoneUsageDescription</key>
<string>Record a voice note.</string>
<key>NSFaceIDUsageDescription</key>
<string>Unlock the app with Face ID.</string>
<key>NSUserTrackingUsageDescription</key>
<string>Used to show you more relevant job ads.</string>
\`\`\`

Reviewers read these strings. **"We need access to your camera" gets rejected** under guideline 5.1.1 — the string must explain the *user benefit*, specifically. Generic or templated strings are one of the most common avoidable rejections.

Other keys that matter:

\`\`\`xml
<key>ITSAppUsesNonExemptEncryption</key><false/>   <!-- skips the export-compliance prompt -->
<key>UIRequiredDeviceCapabilities</key>            <!-- restricts installable devices -->
<key>LSApplicationQueriesSchemes</key>             <!-- URL schemes you canOpenURL() -->
<key>CFBundleLocalizations</key>                   <!-- declared languages -->
\`\`\`

\`ITSAppUsesNonExemptEncryption: false\` is correct for most apps that only use HTTPS (which is exempt), and setting it saves answering the compliance question on every single upload.

---

## 6. Versioning

Two separate numbers, and confusing them is a routine upload failure:

| Key | Xcode name | Meaning |
|---|---|---|
| \`CFBundleShortVersionString\` | **Version** | user-facing, e.g. \`1.4.0\` |
| \`CFBundleVersion\` | **Build** | internal, must **increase** every upload |

Rules: the **build number must be strictly greater** than any previous build for that version, or App Store Connect rejects the upload with "The bundle version must be higher than the previously uploaded version". Version must follow the pattern \`X.Y.Z\` and must increase for a new App Store release, but you can upload many builds against one version during testing. Build numbers can be integers or dotted; CI usually sets them from the commit count or the pipeline run number so they're monotonic without human intervention.

Note App Store Connect keeps **one review at a time per version** — you cannot have two builds of \`1.4.0\` in review simultaneously.

---

## 7. Building — Archive to IPA

Archiving requires **macOS and Xcode**; there is no supported way to build iOS on Linux, which is why cloud macOS runners (EAS, Xcode Cloud, GitHub's macOS runners) exist.

\`\`\`bash
# 1. archive
xcodebuild -workspace App.xcworkspace -scheme App \\
  -configuration Release -sdk iphoneos -archivePath build/App.xcarchive archive

# 2. export a signed .ipa
xcodebuild -exportArchive -archivePath build/App.xcarchive \\
  -exportOptionsPlist ExportOptions.plist -exportPath build/

# 3. upload
xcrun altool --upload-app -f build/App.ipa --type ios \\
  --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID"
# (or \`xcrun notarytool\`/Transporter; altool is deprecated in favour of the ASC API)
\`\`\`

\`\`\`xml
<!-- ExportOptions.plist -->
<key>method</key><string>app-store-connect</string>
<key>teamID</key><string>ABCDE12345</string>
<key>uploadSymbols</key><true/>          <!-- dSYMs for crash symbolication -->
\`\`\`

**Always upload symbols.** Without dSYMs, crash reports are hex addresses instead of stack frames — and for React Native you additionally need the **JS source map** uploaded to your crash reporter, or JS stack traces are minified garbage.

The archive is a \`.xcarchive\` (app plus dSYMs); the \`.ipa\` is the signed, zipped payload. Bitcode was **removed in Xcode 14** — if a tutorial mentions enabling it, the tutorial is stale.

---

## 8. Automating the Build

| Tool | Best for |
|---|---|
| **EAS Build** (Expo) | React Native — managed credentials, no Mac needed |
| **Fastlane** | full control; the de facto standard for native teams |
| **Xcode Cloud** | Apple-native, tight App Store Connect integration |
| GitHub Actions + macOS runner | you already live in Actions; slowest and priciest minutes |

\`\`\`ruby
# fastlane/Fastfile
lane :beta do
  match(type: "appstore", readonly: is_ci)   # shared certs from a private git repo
  increment_build_number(build_number: ENV["GITHUB_RUN_NUMBER"])
  gym(scheme: "App", export_method: "app-store")
  pilot(skip_waiting_for_build_processing: true)   # upload to TestFlight
end
\`\`\`

\`fastlane match\` is the answer to "how does your whole team and CI share signing identities": it keeps certificates and profiles encrypted in a private repo, so a new machine runs one command instead of a signing archaeology session. Use \`readonly: true\` on CI so a runner can never regenerate and revoke everyone's certificate.

For authentication in CI, use an **App Store Connect API key** (\`.p8\` issuer ID + key ID) rather than an Apple ID and password — it avoids 2FA entirely and is scoped and revocable.

\`\`\`bash
eas build --platform ios --profile production
eas submit --platform ios --latest
\`\`\`

---

## 9. App Store Connect

The app record must exist before you can upload a build. What you configure:

- **App Information** — name (30 chars), subtitle (30), bundle ID, primary category, content rights, age rating.
- **Pricing and Availability** — price tier, territories, pre-orders.
- **App Privacy** — the nutrition labels (§11). **Mandatory**; you cannot submit without it.
- **Version information** — screenshots, description (4,000 chars), keywords (100 chars, comma-separated, no spaces), promotional text (170 chars, updatable *without* review), support and marketing URLs, what's new.
- **Build** — selected from processed uploads.
- **App Review Information** — **demo account credentials**, contact details, notes.

Two practical notes. **Promotional text** is the only listing field you can change without submitting a new version — use it for time-sensitive messaging. And **keywords are invisible to users** but drive search; don't repeat words from the title, and don't add competitor names (guideline 5.2 rejection).

The **App Store Connect API** automates all of this — essential once releases are frequent.

---

## 10. TestFlight

| | Internal | External |
|---|---|---|
| Testers | up to **100**, must be team members | up to **10,000** |
| Review | **none** — available in minutes | **Beta App Review** (~1 day) |
| Invite | by Apple ID | email or a **public link** |
| Build lifetime | 90 days | 90 days |

The workflow that works: push every build to **internal** TestFlight automatically from CI (no review, instant), and promote a chosen build to **external** groups for wider beta. Beta App Review is lighter than App Store review but still catches crashes on launch and missing demo credentials.

Details worth knowing: builds **expire after 90 days**; testers must install the TestFlight app; **\`expiresAfter\` / build expiry can be set manually**; feedback and crash reports flow back through TestFlight, including screenshots testers annotate; and a build that passed Beta App Review still has to pass full App Store review, which is stricter.

Because internal TestFlight needs no review, it is also the fastest path to verifying a production-signed build on a real device — worth doing before every submission, since a signing or entitlement problem that only manifests in a Release build is otherwise found by the reviewer.

---

## 11. Privacy — Manifests, Labels and ATT

Apple's privacy requirements are the most common source of modern rejections. Three distinct things:

### Privacy manifest — \`PrivacyInfo.xcprivacy\`

Required since **spring 2024**. A bundled plist declaring the data you collect, the tracking domains you contact, and — crucially — your **reasons for using "required reason" APIs**:

\`\`\`xml
<key>NSPrivacyAccessedAPITypes</key>
<array>
  <dict>
    <key>NSPrivacyAccessedAPIType</key>
    <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
    <key>NSPrivacyAccessedAPITypeReasons</key>
    <array><string>CA92.1</string></array>   <!-- app's own data only -->
  </dict>
</array>
<key>NSPrivacyTracking</key><false/>
<key>NSPrivacyCollectedDataTypes</key><array>…</array>
\`\`\`

Required-reason API categories include \`UserDefaults\`, file timestamps, disk space, active keyboards and system boot time — APIs previously used for fingerprinting. Omit the declaration and the upload is **rejected automatically at processing time**, before human review.

Additionally, **commonly-used third-party SDKs must ship their own signed privacy manifest**. So an outdated analytics or ad SDK can block your release even though your own code is fine — which makes "keep SDKs current" a release requirement, not hygiene.

### App Privacy nutrition labels

Declared in App Store Connect, shown on your product page: for each data type, whether you collect it, whether it is **linked to identity**, and whether it is used for **tracking**. It must match reality *including what your SDKs do* — Apple compares declarations against observed behaviour, and a mismatch is a rejection or a post-release removal.

### App Tracking Transparency

If you track users across apps or websites owned by other companies — including using IDFA — you **must** call \`ATTrackingManager.requestTrackingAuthorization\` and provide \`NSUserTrackingUsageDescription\`. Accessing the IDFA without consent is a hard rejection. Note most users decline, so any business model depending on IDFA needs a fallback.

Two more requirements that mirror Android's: **account deletion must be offered in-app** if the app supports account creation (since June 2022), and **Sign in with Apple** must be offered if you offer any third-party social login.

---

## 12. App Transport Security

ATS forces HTTPS with TLS 1.2+ and forward secrecy by default. Exceptions live in \`Info.plist\`:

\`\`\`xml
<key>NSAppTransportSecurity</key>
<dict>
  <!-- do NOT do this; near-automatic rejection without justification -->
  <key>NSAllowsArbitraryLoads</key><true/>

  <!-- do this instead: scope the exception to one domain -->
  <key>NSExceptionDomains</key>
  <dict>
    <key>legacy-api.internal</key>
    <dict><key>NSExceptionAllowsInsecureHTTPLoads</key><true/></dict>
  </dict>
</dict>
\`\`\`

\`NSAllowsArbitraryLoads\` disables ATS app-wide and requires a written justification at review; reviewers reject it routinely. Scope exceptions per domain instead. Note **React Native debug builds** enable a localhost exception for Metro — make sure it does not survive into the Release configuration.

---

## 13. Store Listing Assets

\`\`\`
App icon      1024×1024 PNG, no alpha channel, no rounded corners (Apple rounds it)
Screenshots   REQUIRED: 6.9" (iPhone 16 Pro Max) and 6.5" or 6.7"
              iPad 13" required if the app supports iPad
              up to 10 per device size; first 3 show in search results
App previews  optional video, 15–30 s, up to 3
\`\`\`

Apple **scales screenshots down** to smaller device sizes, so you only need the largest of each family — but the required sizes change as Apple ships new hardware, and a missing required size blocks submission. Use \`fastlane snapshot\` or a design template so a device-lineup change is a rebuild, not a redesign.

The **first three screenshots** appear in search results, so lead with your strongest. Localised screenshots and metadata materially improve conversion in non-English markets.

Marketing rules that cause rejections: no device frames implying hardware you don't support, no "Best app!" style claims without substantiation, no pricing in screenshots (it goes stale), and no Apple trademarks or lookalike icons.

---

## 14. Submission and Release

\`\`\`
Upload build → processing (10–60 min) → select build → answer export compliance
→ Submit for Review → In Review → Approved → Release
\`\`\`

Release options:

- **Automatic** — releases as soon as it's approved.
- **Manual** — you press the button, which is what you want when a release is coordinated with a backend deploy or marketing.
- **Scheduled** — a date and time.
- **Phased release** — 1%, 2%, 5%, 10%, 20%, 50%, 100% over **7 days**, automatic updates only. You can **pause** it, and you can push the remaining users to 100% early.

Phased release is iOS's answer to a staged rollout, with two caveats: it only affects **automatic** updates (users who manually update get the new version immediately), and pausing stops the ramp but does **not** roll anyone back. There is no rollback on iOS — the only remedies are **removing the version from sale**, submitting a fix (with an **expedited review** request if it's severe), or shipping the fix over the air if your JS layer allows it (§19).

---

## 15. App Review — Common Rejections

Ranked by how often they actually happen:

1. **Guideline 2.1 — incomplete information.** No demo account, or a login the reviewer cannot get past. If your app requires auth, provide working credentials in App Review Information; if it needs a phone-number OTP, provide a bypass or a test number.
2. **Guideline 5.1.1 — data collection and purpose strings.** Vague usage descriptions, requesting permissions the app doesn't need, or requiring registration for features that don't need an account.
3. **Guideline 2.3 — inaccurate metadata.** Screenshots that don't match the app, mention of unreleased features, or platform references ("also on Android").
4. **Guideline 4.3 — spam / duplicate.** Multiple near-identical apps, or a thin app that could be a website.
5. **Guideline 3.1.1 — in-app purchase.** Selling digital content or unlocking features through anything but IAP, or linking out to your own payment page. Physical goods and "reader" apps have carve-outs; the rules here shift with regulation, so check current guidance.
6. **Guideline 4.2 — minimum functionality.** A wrapped website with no native value.
7. **Guideline 5.1.1(v) — account deletion.** Account creation without in-app deletion.
8. **Crashes on launch** — usually a Release-only signing, entitlement or missing-plist-key problem the team never saw in debug.
9. **Missing/invalid privacy manifest** — auto-rejected at processing (§11).
10. **Sign in with Apple missing** where third-party login is offered.

Practical handling: read the **Resolution Center** message carefully — it cites the guideline number; you can reply and argue with evidence, which genuinely works when the reviewer misunderstood the app. **Expedited review** exists for critical bugs and legal issues and should be used sparingly, since abusing it costs credibility. A rejection does not reset your review position for the next submission.

---

## 16. Push Notifications on iOS

\`\`\`
APNs authentication:
  .p8 auth KEY  → one key, all apps in the team, NEVER expires   ← preferred
  .p12 certificate → per app, per environment, expires annually
\`\`\`

Use a **\`.p8\` key**. Certificates expire every year and their expiry is a classic silent production outage — notifications simply stop.

The environment mismatch is the other classic bug: a debug build gets a **sandbox** device token, a TestFlight or App Store build gets a **production** token, and sending a sandbox token to production APNs fails with \`BadDeviceToken\`. TestFlight builds use production APNs even though they feel like testing — so a "push works in debug but not TestFlight" report is almost always this.

Also: permission must be requested at a moment the user understands (\`UNUserNotificationCenter.requestAuthorization\`), **provisional authorisation** lets you deliver quietly to Notification Center without a prompt, and rich or actionable notifications need a Notification Service Extension — which is a separate target with **its own bundle ID, provisioning profile and privacy manifest**.

---

## 17. Universal Links

iOS's deep-linking mechanism, and it requires server-side setup:

\`\`\`json
// https://example.com/.well-known/apple-app-site-association
{ "applinks": { "details": [
  { "appIDs": ["ABCDE12345.com.company.app"], "components": [{ "/": "/jobs/*" }] }
]}}
\`\`\`

Requirements: served over **HTTPS with no redirects**, \`Content-Type: application/json\`, **no \`.json\` extension** on the filename, and the **Associated Domains** capability with \`applinks:example.com\` in the entitlement.

The behaviours that surprise people: Apple **caches** the association file (and fetches it through its CDN, so changes take time to propagate), a universal link **pasted into Safari's address bar does not open the app** — it must be a tap from another app — and if the user taps the "example.com" breadcrumb in Safari to leave your app, iOS remembers that preference and stops opening the app for that domain until they long-press and choose to open in the app. Custom URL schemes (\`myapp://\`) still work as a fallback but any app can claim them, so they aren't secure for auth callbacks.

---

## 18. App Size and Thinning

The **cellular download limit is 200 MB** — above it users are prompted to switch to Wi-Fi, which measurably hurts install conversion.

Apple reduces delivered size automatically with **app thinning**: **slicing** (per-device architecture and resource variants), **on-demand resources** (tagged assets downloaded after install), and **asset catalogs** so only the needed image scale ships. What you control:

- Ship images in **asset catalogs**, not loose files, and prefer HEIC/WebP where practical.
- Strip unused architectures and enable dead-code stripping in Release.
- Audit dependencies — an unused SDK is pure size.
- For React Native, enable **Hermes** (smaller and faster startup than JSC) and check the JS bundle size.
- Use the **App Store Connect App Size report** for real per-device download and install sizes; the \`.ipa\` size is not what users download.

---

## 19. iOS-Specific React Native Concerns

- **CocoaPods.** Native dependencies come through \`Podfile\`/\`Podfile.lock\`; run \`pod install\` after any native dependency change, and commit the lockfile. \`cd ios && pod install --repo-update\` fixes a large share of "it doesn't build on my machine".
- **Expo managed vs bare.** Managed + EAS handles signing and needs no Mac. Bare gives full native control and requires you to own the Xcode project. **Prebuild/CNG** regenerates the \`ios/\` directory from config, so hand edits are lost unless expressed as a **config plugin**.
- **New Architecture.** Fabric and TurboModules are the default in recent React Native; verify each native dependency supports it before upgrading, since an unmaintained module is what blocks the migration.
- **Hermes** is the default engine; keep the \`.hbc\` **source map** and upload it to your crash reporter or JS stack traces are unreadable.
- **OTA updates.** EAS Update (or CodePush) can ship **JS-only** changes without review — legitimate and explicitly permitted, provided you do not change the app's purpose or add features that would need review. Anything touching native code still needs a full submission. Guideline 3.1.1 and 2.5.2 set the boundary: don't ship functionality the reviewer never saw.
- **Debug-only settings must not leak** — the ATS localhost exception (§12) and any dev menu.

---

## 20. Pre-Submission Checklist

\`\`\`
[ ] Bundle ID matches the App ID and the provisioning profile
[ ] Distribution certificate and App Store profile valid (not expiring soon)
[ ] Build number > every previous build for this version
[ ] All privacy usage descriptions present AND specific
[ ] PrivacyInfo.xcprivacy present; every required-reason API declared
[ ] All third-party SDKs updated with signed privacy manifests
[ ] App Privacy nutrition labels completed and truthful
[ ] ATT prompt implemented if you track; IDFA not touched otherwise
[ ] Account deletion available in-app (if accounts exist)
[ ] Sign in with Apple offered (if third-party login exists)
[ ] No NSAllowsArbitraryLoads in Release
[ ] Screenshots for every required device size; icon 1024×1024 no alpha
[ ] Demo account credentials in App Review Information
[ ] dSYMs uploaded; JS source maps uploaded to the crash reporter
[ ] Tested the Release build via internal TestFlight on a real device
[ ] Push tested with a PRODUCTION token, not sandbox
[ ] Export compliance answered (or ITSAppUsesNonExemptEncryption set)
\`\`\`

---

## 21. Interview Questions & Answers

**Q1: Explain iOS code signing. What are the pieces and how do they fit together?**

Four things must agree. A **certificate** proves who built the app, backed by a public/private key pair whose private key stays in the Keychain of the machine that generated the CSR. An **App ID** registers the bundle identifier with Apple. **Entitlements** declare which capabilities the app may use. A **provisioning profile** binds all of it together — certificate, App ID, permitted devices and entitlements — and is embedded in the app. Signing fails when any pair disagrees, and the two failures you'll actually hit are **expiry** (certificates and profiles last a year, so a build that worked last month suddenly doesn't) and **entitlement mismatch** — enabling a capability in Xcode without enabling it on the App ID, so the profile doesn't carry it. For teams the answer is **\`fastlane match\`**, which stores certificates and profiles encrypted in a private git repo so every developer and CI runner shares one identity; use \`readonly\` on CI so a runner can't regenerate and revoke everyone's certificate.

**Q2: What's the difference between Version and Build number, and what breaks?**

\`CFBundleShortVersionString\` is the **Version** — the user-facing \`1.4.0\` — and \`CFBundleVersion\` is the **Build**, an internal counter. The rule that bites is that the **build number must be strictly greater than any previous upload for that version**, otherwise App Store Connect rejects the binary at upload with "the bundle version must be higher than the previously uploaded version". You can upload many builds against one version during testing; the version itself must increase for a new App Store release. In CI you derive the build number from something monotonic — the pipeline run number or commit count — so nobody has to remember. A related constraint is that App Store Connect allows **one review at a time per version**, so you can't have two builds of \`1.4.0\` in review simultaneously.

**Q3: What is the privacy manifest and why can it block a release?**

\`PrivacyInfo.xcprivacy\` is a bundled plist, required since spring 2024, declaring the data your app collects, the tracking domains it contacts, and your **reasons for calling "required reason" APIs** — \`UserDefaults\`, file timestamps, disk space, active keyboards, system boot time, all of which were historically used for device fingerprinting. Each use needs a declared reason code such as \`CA92.1\`. If it's missing or incomplete the upload is **rejected automatically during processing**, before any human review, so it fails fast and confusingly. The part that catches teams out is that **commonly-used third-party SDKs must ship their own signed privacy manifest** — so an outdated analytics or ads SDK blocks your release even though your own code is compliant. That turns "keep SDKs current" from hygiene into a release requirement. It's separate from the **nutrition labels** in App Store Connect, which are the user-facing declaration and must match what the app and its SDKs actually do.

**Q4: Walk me through TestFlight — internal versus external.**

**Internal** testing is up to 100 team members, requires **no review**, and a build is available within minutes of processing — so CI should push every build there automatically. **External** testing scales to 10,000 testers invited by email or a public link, but the first build for an external group needs **Beta App Review**, roughly a day, which checks for launch crashes and missing demo credentials. Builds **expire after 90 days** in both cases, and testers need the TestFlight app. The reason internal TestFlight matters beyond convenience: it is the fastest way to run a **production-signed Release build on a real device**, which is where signing, entitlement and missing-Info.plist-key problems surface — otherwise the App Review team finds them for you. Passing Beta App Review doesn't imply passing full App Store review, which is materially stricter.

**Q5: What are the most common App Store rejections and how do you avoid them?**

Top of the list is **guideline 2.1, incomplete information** — no working demo account, or an OTP login the reviewer can't get through; always supply credentials and a bypass in App Review Information. Then **5.1.1**, purpose strings and data collection: "We need camera access" gets rejected, because the string must state the specific user benefit, and requesting permissions the app doesn't need or gating basic features behind registration also fails. **2.3 inaccurate metadata** — screenshots not matching the app, or mentioning Android. **4.3 spam** for near-duplicate or thin apps, **4.2 minimum functionality** for a wrapped website, and **3.1.1** for taking payment for digital goods outside IAP. Newer ones: **account deletion** must be in-app if you allow account creation, **Sign in with Apple** if you offer social login, and a **missing privacy manifest** auto-rejects. The process point: the Resolution Center message cites the guideline number, and you can reply with evidence — arguing works when the reviewer misunderstood the app.

**Q6: How do you handle a critical bug discovered after release? Can you roll back?**

**There is no rollback on iOS** — you cannot revert users to a previous version, which is the sharpest operational difference from Android and from web. Your options: **remove the version from sale** to stop new installs and updates (existing users keep the broken build), **submit a fix with an expedited review request**, which Apple grants for genuinely critical issues, and — if the bug is in the JavaScript layer of a React Native app — **ship an OTA update** through EAS Update or CodePush, which needs no review and reaches users in minutes. That last one is why OTA capability is worth having before you need it. Preventatively: **phased release** ramps automatic updates over 7 days and can be **paused**, which limits blast radius, though pausing doesn't roll anyone back and users who update manually get the build immediately. And feature-flag risky changes server-side so you can disable them without shipping anything.

**Q7: Push notifications work in debug but not in TestFlight. What's happening?**

**An APNs environment mismatch.** A debug build receives a **sandbox** device token; TestFlight and App Store builds receive a **production** token — even though TestFlight feels like testing. Sending a sandbox token to production APNs (or vice versa) fails with \`BadDeviceToken\`, so the notification never arrives and nothing obviously errors on the client. The \`aps-environment\` entitlement in the build selects which environment the token comes from, so it's \`development\` in debug and \`production\` in a distribution build. The fix is for your backend to either use the right APNs host per token or, better, record the environment alongside each token at registration. While you're there: use a **\`.p8\` auth key** rather than a \`.p12\` certificate — one key covers all apps in the team and never expires, whereas certificates expire annually and their expiry is a classic silent production outage where notifications simply stop.

**Q8: How do universal links work, and what commonly breaks them?**

You host an **\`apple-app-site-association\`** file at \`https://example.com/.well-known/\`, listing your team-prefixed app ID and the URL paths it claims, and you enable the **Associated Domains** capability with \`applinks:example.com\` in the entitlement. iOS fetches and verifies that file at install. What breaks it: the file must be served over **HTTPS with no redirects**, with \`Content-Type: application/json\` and **no \`.json\` file extension**; a missing or mismatched entitlement; and Apple's **caching**, which means changes take time to propagate. Two behaviours look like bugs but aren't: a universal link **typed into Safari's address bar won't open the app** — it has to be a tap from another context — and if the user taps the site breadcrumb in Safari to leave your app, iOS remembers that and stops opening the app for that domain until they explicitly choose otherwise. Custom URL schemes are a fallback but any app can register the same scheme, so they're unsuitable for auth callbacks.

**Q9: How does iOS deployment differ from Android, at a process level?**

Three structural differences. **Review is mandatory on every update** — there is no equivalent of pushing to Play production without review — so your release cadence includes a 24–48 hour review, and you plan around it. **Code signing is far stricter**: Android needs one keystore, whereas iOS requires the certificate, App ID, entitlements and provisioning profile to agree, which is why \`fastlane match\` exists and why "it builds on my machine" is a common iOS-only failure. And **there's no rollback**, versus Play where you can halt a staged rollout and resume a previous release. In the other direction iOS is simpler: one store, one hardware family, no fragmentation across OEM skins, and phased release plus TestFlight are cleaner than their Android equivalents. Building also **requires macOS**, so CI needs Mac runners or a service like EAS or Xcode Cloud. Privacy paperwork is heavier on iOS — privacy manifests, nutrition labels and ATT — while Android's Data Safety form is the rough analogue.

**Q10: Can you ship an update without App Review?**

Partially, and knowing the boundary matters. **Over-the-air JavaScript updates** — EAS Update or CodePush — are explicitly permitted for React Native apps and reach users in minutes without review, which makes them the fastest fix path for a JS-layer bug. The limit is that you must not change the app's **purpose** or add functionality the reviewer never evaluated; guidelines 3.1.1 and 2.5.2 draw that line, and abusing it risks removal. Anything touching **native** code — a new dependency, an entitlement, a permission — requires a full submission. Separately, some App Store Connect fields update without review: **promotional text** is the notable one, so use it for time-sensitive messaging rather than editing the description. And server-side **feature flags** are the most under-used answer here: shipping a feature dark and enabling it remotely means the risky change needs no release at all.

---

## 22. Tricky Questions

**Q1: Your app builds and runs fine in debug, but the TestFlight build crashes immediately on launch. What are the likely causes?**

**Almost always something that only exists in the Release configuration: a missing \`Info.plist\` usage description, an entitlement the distribution profile doesn't carry, or code stripped by Release optimisation.** The most common single cause is a **missing usage-description key** — calling a privacy-sensitive API without, say, \`NSCameraUsageDescription\` doesn't warn, it **terminates the process**, and if your debug build had the key while a merge dropped it from the Release plist you'd never see it locally. Next is an entitlement mismatch: a capability enabled in Xcode but not on the App ID, so the App Store profile lacks it and the app fails at launch. Others: a debug-only dependency or dev-server URL that isn't reachable, \`NSAllowsArbitraryLoads\` present in debug and removed in Release so network calls now fail hard, and for React Native a JS bundle that wasn't embedded so the app can't find \`main.jsbundle\`. The workflow fix is to **always run the Release build through internal TestFlight** (no review, minutes) before submitting, and to upload dSYMs so the crash log is a stack trace rather than hex.

**Q2: You upload a build and App Store Connect immediately rejects it before any human sees it. Nothing changed in your code. What happened?**

**An automated processing check failed — most likely the privacy manifest or a build-number collision.** Uploads pass through automated validation before review, and three things reject there. A **missing or invalid \`PrivacyInfo.xcprivacy\`**, including the case where your code is fine but a **third-party SDK shipped without a signed privacy manifest** — so a dependency update (or a new Apple enforcement date arriving) breaks a build whose own source is unchanged. A **build number that isn't higher** than a previous upload for that version. Or a **missing required screenshot size** after Apple added new hardware. The "nothing changed in our code" framing is the tell that it's an external requirement changing under you, which is why SDK currency is a release requirement rather than housekeeping. Read the email or the Activity tab — the message names the specific check.

**Q3: A universal link opens Safari instead of your app, but only for some users, and it used to work. Why?**

**Those users tapped the site breadcrumb in Safari to leave your app, and iOS remembered the preference.** When a universal link opens your app, Safari shows a small breadcrumb with the domain; tapping it opens the page in Safari *and* records that the user prefers the website for that domain, so subsequent links go to Safari until they long-press a link and explicitly choose "Open in App". It's per-user, per-domain and invisible server-side, which is exactly why it presents as "works for me, not for them". The other candidates worth ruling out: the **association file changed and Apple's CDN still has the old copy cached**, the file started being served with a redirect or the wrong content type, or the entitlement stopped matching. And remember a link **typed into the address bar never opens the app** by design — so a tester reproducing it that way will always see Safari and conclude it's broken.

**Q4: Your team's iOS builds suddenly fail on CI with a signing error, and nobody touched the certificates. Why, and how do you prevent it?**

**Something expired, or a developer regenerated a certificate and revoked the shared one.** Distribution certificates and provisioning profiles are valid for a year, so builds fail on an anniversary nobody diarised — a profile expiring is the single most common iOS CI failure. The nastier version: an engineer hit "revoke and create new" in Xcode's automatic signing on their machine, which **invalidates the certificate everyone else and CI were using**, so the whole team breaks at once. Prevention: use **\`fastlane match\`** so certificates and profiles live encrypted in a private git repo as the single source of truth, and run CI with **\`readonly: true\`** so a runner can never regenerate or revoke. Add a calendar or monitoring alert on expiry dates, authenticate CI with an **App Store Connect API key** rather than an Apple ID (which also removes 2FA fragility), and keep the number of people with the ability to revoke small.

**Q5: A reviewer rejects your app under guideline 5.1.1 even though you already show a permission prompt with a usage description. What's wrong?**

**The string itself is probably generic, or you're requesting a permission the app doesn't visibly need.** 5.1.1 isn't satisfied by *having* a purpose string — it requires the string to explain the **specific benefit to the user**, so "This app needs access to your camera" is rejected while "Take a photo to attach to your expense report" passes. Two adjacent causes trigger the same guideline: asking for a permission that isn't obviously connected to any feature the reviewer can find (requesting location because an SDK wants it is a frequent one), and **gating basic functionality behind account creation** when the feature doesn't need an account, which 5.1.1(v) treats as unnecessary data collection. Fix by making each string concrete and feature-specific, requesting permission **at the moment of use** rather than on launch so the context is obvious, removing permissions no feature needs, and — if a reviewer has misunderstood — replying in the Resolution Center explaining which screen triggers it, which genuinely resolves these.

---

## 23. Cheat Sheet

**Account & timeline**

1. Apple Developer Program: **$99/yr**. Organization needs a **D-U-N-S** number (~1 week).
2. Only the **Account Holder** can accept new agreements — a real release blocker.
3. Review is typically 24–48 h; the whole first submission takes 1–2 weeks.
4. **Every update goes through review.** There is no unreviewed production push.

**Code signing**

5. Certificate (who) + App ID (what) + devices + entitlements → **provisioning profile**.
6. The **private key never leaves** the machine that made the CSR — export a \`.p12\`.
7. Certificates and profiles **expire yearly** — the #1 CI failure.
8. Xcode capability, App ID config and profile entitlements must all agree.
9. Profiles: Development / Ad Hoc (100 devices) / App Store / Enterprise.
10. **\`fastlane match\`** for teams; \`readonly: true\` on CI so it can't revoke.
11. Authenticate CI with an **App Store Connect API key** (\`.p8\`), not an Apple ID.

**Project config**

12. **Bundle ID is permanent** — changing it means a new app.
13. Every privacy API needs a usage description, or the app **crashes**.
14. Purpose strings must state the **specific user benefit** (guideline 5.1.1).
15. \`ITSAppUsesNonExemptEncryption: false\` skips the export prompt (HTTPS is exempt).
16. \`aps-environment\`: \`development\` in debug, \`production\` in distribution builds.

**Versioning**

17. \`CFBundleShortVersionString\` = Version (user-facing); \`CFBundleVersion\` = Build.
18. **Build must strictly increase** per upload, or the upload is rejected.
19. One review at a time per version.

**Build & upload**

20. Archiving needs **macOS + Xcode** — no Linux path.
21. \`xcodebuild archive\` → \`-exportArchive\` → \`.ipa\` → upload.
22. **Always upload dSYMs**, plus the **JS source map** for React Native.
23. Bitcode was removed in Xcode 14 — ignore old tutorials.

**TestFlight**

24. Internal: 100 testers, **no review**, minutes. External: 10,000, **Beta App Review**.
25. Builds expire after **90 days**.
26. Use internal TestFlight to test the **Release-signed** build before submitting.

**Privacy**

27. **\`PrivacyInfo.xcprivacy\`** required — declare every required-reason API.
28. Third-party SDKs need their **own signed manifests** — stale SDKs block releases.
29. Nutrition labels must match reality **including SDK behaviour**.
30. Tracking across companies (incl. IDFA) requires **ATT** consent.
31. Account creation ⇒ **in-app account deletion** required.
32. Third-party login ⇒ **Sign in with Apple** required.

**Networking**

33. ATS requires HTTPS/TLS 1.2+. **Never** ship \`NSAllowsArbitraryLoads\`; scope per domain.
34. Keep the RN debug localhost exception out of Release.

**Assets**

35. Icon 1024×1024, **no alpha, no rounded corners**.
36. Screenshots: largest of each family; Apple scales down. First 3 show in search.
37. **Promotional text** updates without review; description does not.

**Release**

38. Phased release: 1→100% over **7 days**, affects **automatic** updates only, pausable.
39. **No rollback.** Options: remove from sale, expedited review, or an OTA JS fix.
40. Cellular download limit is **200 MB**.

**Push & links**

41. Use a **\`.p8\` APNs key** — never expires, covers the whole team.
42. TestFlight uses **production** APNs — sandbox tokens fail there.
43. AASA file: HTTPS, **no redirects**, JSON content type, **no \`.json\` extension**.
44. Address-bar links don't open the app; the Safari breadcrumb sets a sticky preference.

**React Native**

45. \`pod install\` after any native dependency change; commit \`Podfile.lock\`.
46. Expo prebuild regenerates \`ios/\` — express native changes as **config plugins**.
47. Hermes is default; keep and upload the source map.
48. OTA updates: **JS only**, and must not change the app's purpose.

---

## 24. References

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) — read 2.1, 2.3, 4.2, 4.3, 5.1.1.
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Code signing overview](https://developer.apple.com/documentation/technotes/tn3125-inside-code-signing-provisioning-profiles) and [Certificates, IDs & Profiles](https://developer.apple.com/account/resources/)
- [Privacy manifest files](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files) and [required reason APIs](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)
- [App privacy details on the App Store](https://developer.apple.com/app-store/app-privacy-details/) — the nutrition labels.
- [User privacy and data use / ATT](https://developer.apple.com/app-store/user-privacy-and-data-use/)
- [TestFlight](https://developer.apple.com/testflight/) and [phased release](https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases)
- [Supporting associated domains](https://developer.apple.com/documentation/xcode/supporting-associated-domains) — universal links.
- [Establishing a certificate-based connection to APNs](https://developer.apple.com/documentation/usernotifications/establishing-a-certificate-based-connection-to-apns) and [token-based (.p8)](https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns)
- [App thinning](https://developer.apple.com/documentation/xcode/reducing-your-app-s-size) and [NSAppTransportSecurity](https://developer.apple.com/documentation/bundleresources/information-property-list/nsapptransportsecurity)
- [fastlane](https://docs.fastlane.tools/) · [EAS Build](https://docs.expo.dev/build/introduction/) · [Xcode Cloud](https://developer.apple.com/xcode-cloud/)
`;export{e as default};
