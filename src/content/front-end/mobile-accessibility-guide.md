# Mobile Accessibility — Interview Guide

Mobile accessibility is not "web accessibility on a small screen". The assistive technologies are different (**VoiceOver** and **TalkBack**, not desktop screen readers), the interaction model is gestural rather than keyboard-driven, and the platform APIs are native.

This guide covers the platform behaviour and the React Native API surface. For web a11y — WCAG in depth, ARIA, focus management — see the [Accessibility guide](/frontend/accessibility); for React Native generally, the [React Native guide](/frontend/react-native).

## Table of Contents

1. [Why It Matters](#1-why-it-matters)
2. [Screen Readers — VoiceOver and TalkBack](#2-screen-readers-voiceover-and-talkback)
3. [The Accessibility Tree on Mobile](#3-the-accessibility-tree-on-mobile)
4. [React Native Accessibility Props](#4-react-native-accessibility-props)
5. [Roles, States and Values](#5-roles-states-and-values)
6. [Grouping and Reading Order](#6-grouping-and-reading-order)
7. [Announcements and Live Regions](#7-announcements-and-live-regions)
8. [Touch Targets and Motor Accessibility](#8-touch-targets-and-motor-accessibility)
9. [Dynamic Type and Text Scaling](#9-dynamic-type-and-text-scaling)
10. [Colour, Contrast and Visual Settings](#10-colour-contrast-and-visual-settings)
11. [Motion and Vestibular Safety](#11-motion-and-vestibular-safety)
12. [Focus Management and Modals](#12-focus-management-and-modals)
13. [Forms and Errors](#13-forms-and-errors)
14. [Lists, Images and Media](#14-lists-images-and-media)
15. [WCAG for Mobile](#15-wcag-for-mobile)
16. [Testing](#16-testing)
17. [Common Mistakes](#17-common-mistakes)
18. [Interview Questions & Answers](#18-interview-questions-answers)
19. [Tricky Questions](#19-tricky-questions)
20. [Cheat Sheet](#20-cheat-sheet)
21. [References](#21-references)

---

## 1. Why It Matters

Roughly **16% of people** live with a significant disability (WHO), and on mobile the affected population is broader than screen-reader users: anyone using large text, anyone with a temporary injury, anyone in bright sunlight, anyone one-handed on a train.

The legal picture matters commercially. The **European Accessibility Act** became enforceable in June 2025 and covers consumer mobile apps sold in the EU; **ADA Title II** obligations apply to US public entities and their apps; and both stores can reject or remove apps — Apple's guideline 2.5.1 and Google's accessibility policies. Unlike the web, **you cannot hot-patch a rejected app the same day**, which makes accessibility a release-blocking concern rather than a follow-up ticket.

The practical argument that lands in interviews: mobile accessibility APIs are **cheaper to satisfy than the web's**, because the platform gives you semantics if you use the real components. Most failures come from re-implementing a button as a `View` with an `onPress`.

---

## 2. Screen Readers — VoiceOver and TalkBack

| | VoiceOver (iOS) | TalkBack (Android) |
|---|---|---|
| Enable | Settings → Accessibility, or triple-click side button | Settings → Accessibility, or volume-key shortcut |
| Next / previous element | swipe right / left | swipe right / left |
| Activate | **double-tap** anywhere | **double-tap** anywhere |
| Explore by touch | drag a finger | drag a finger |
| Scroll | three-finger swipe | two-finger swipe |
| Navigate by type | **rotor** (rotate two fingers) | reading controls (swipe up/down) |
| Back | two-finger "Z" scrub | swipe down-then-left |

The behaviour with the biggest design consequence: **a screen reader user double-taps to activate whatever is focused, not what is under their finger.** So a control that only responds to a precise touch location, or a custom gesture handler that never registers as an accessible element, is unreachable.

Both readers move focus **linearly** through the accessibility tree. There is no Tab key and no keyboard focus ring — though iOS and Android both support external keyboards and switch control, which is why focusability still matters.

**Test with the real thing.** A simulator's VoiceOver behaves differently from a device, and no automated tool reproduces the experience of navigating your app by swipe.

---

## 3. The Accessibility Tree on Mobile

Both platforms build a tree of accessible elements from the view hierarchy. An element carries a **label**, **role/trait**, **state**, **value** and **hint**. Everything a screen reader announces comes from that tree — not from your visual layout.

Native components populate it automatically. Custom ones don't:

```jsx
// invisible to a screen reader — announces nothing, cannot be activated
<View onTouchEnd={submit}><Text>Submit</Text></View>

// correct
<Pressable accessibilityRole="button" accessibilityLabel="Submit application" onPress={submit}>
  <Text>Submit</Text>
</Pressable>
```

Three ways elements get removed from the tree, and confusing them causes real bugs:

- **`accessible={false}`** (RN) — the element is not itself focusable, but children may still be.
- **`accessibilityElementsHidden`** (iOS) / **`importantForAccessibility="no-hide-descendants"`** (Android) — the element **and its subtree** are removed. This is what you need for content behind a modal.
- **`display: none` / not rendered** — gone entirely, as on the web.

An element that is visually hidden but still in the tree is a common defect: an off-screen drawer whose contents remain focusable means a user swipes into invisible controls.

---

## 4. React Native Accessibility Props

```jsx
<Pressable
  accessible={true}                          // treat as a single element
  accessibilityRole="button"                 // maps to native trait/role
  accessibilityLabel="Delete application"    // WHAT it is
  accessibilityHint="Removes this application from your list"   // WHAT HAPPENS
  accessibilityState={{ disabled: false, selected: false, busy: false }}
  accessibilityValue={{ min: 0, max: 100, now: 40, text: '40 percent' }}
  accessibilityLanguage="en-GB"              // iOS: pronunciation
  testID="delete-btn"                        // for automation, NOT accessibility
  onPress={onDelete}
/>
```

The distinction interviewers probe: **`accessibilityLabel` is the name, `accessibilityHint` is the consequence.** The label should be short and identify the control ("Delete application"); the hint describes the result and is announced after a pause, and users can disable hints entirely — so **never put essential information in a hint**.

`accessibilityLabel` **replaces** the announced text, so a label on a container overrides its children's text — useful for grouping (§6), harmful when applied carelessly.

Platform-specific props worth knowing:

```jsx
accessibilityViewIsModal={true}              // iOS: trap VO inside this view
accessibilityElementsHidden={true}           // iOS: hide subtree
importantForAccessibility="no-hide-descendants"  // Android: hide subtree
accessibilityLiveRegion="polite"             // Android: announce changes
accessibilityLabelledBy={id}                 // Android: label from another element
accessibilityActions={[{ name: 'activate', label: 'Open' }]}
onAccessibilityAction={e => …}               // custom rotor/menu actions
```

---

## 5. Roles, States and Values

```
Common accessibilityRole values:
  button  link  header  image  imagebutton  text  search  switch
  checkbox  radio  tab  tablist  menu  menuitem  progressbar
  slider  spinbutton  alert  summary  adjustable  none
```

`accessibilityRole` determines how the element is announced and which gestures apply. `adjustable` (with `accessibilityActions` for increment/decrement) is what makes a custom slider usable — a screen reader user cannot drag.

**State must be conveyed programmatically, not visually.** A tab that looks selected because it is blue announces nothing:

```jsx
<Pressable accessibilityRole="tab"
           accessibilityState={{ selected: activeTab === 'jobs' }}>
```

`accessibilityState` keys: `disabled`, `selected`, `checked` (supports `'mixed'`), `busy`, `expanded`. Note `checked` is for checkboxes and radios while `selected` is for tabs and list selection — mixing them produces odd announcements.

`accessibilityValue` conveys a current value for sliders and progress: prefer the `text` variant when a number alone is meaningless (`text: "3 of 10 steps"` beats `now: 3`).

---

## 6. Grouping and Reading Order

By default every `Text` is its own focusable element, so a card with five text nodes takes five swipes and announces fragments. Group it:

```jsx
// 5 stops, fragmented
<View>
  <Text>Senior Engineer</Text><Text>Acme Ltd</Text>
  <Text>London</Text><Text>£90k</Text><Text>2 days ago</Text>
</View>

// 1 stop, coherent
<Pressable
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Senior Engineer at Acme Ltd, London, £90,000, posted 2 days ago"
  onPress={open}
>
  {/* visual children unchanged */}
</Pressable>
```

`accessible={true}` on the container makes it a single element and suppresses child elements on iOS. This is the highest-leverage change in most React Native apps — it turns a 60-swipe list screen into a 12-swipe one.

**Reading order follows the view hierarchy, not the visual layout.** So `position: absolute`, `flexDirection: 'row-reverse'` and `order`-style tricks can produce an announcement order that doesn't match what's on screen. The fix is to reorder the JSX, not to patch it — there is no reliable cross-platform "accessibility order" override in React Native.

---

## 7. Announcements and Live Regions

Visual-only feedback is invisible to a screen reader. Three mechanisms:

```jsx
import { AccessibilityInfo, findNodeHandle } from 'react-native';

// one-off announcement (both platforms)
AccessibilityInfo.announceForAccessibility('5 jobs found');

// iOS: with options (queue rather than interrupt)
AccessibilityInfo.announceForAccessibilityWithOptions?.('Saved', { queue: true });

// Android: declarative — announce when this subtree's content changes
<View accessibilityLiveRegion="polite"><Text>{status}</Text></View>

// move focus to an element (e.g. after opening a screen)
AccessibilityInfo.setAccessibilityFocus(findNodeHandle(ref.current));
```

Practical rules: `polite` waits for the reader to finish, `assertive` interrupts — reserve it for errors. **Don't announce on every keystroke** or during a search-as-you-type; debounce, and announce the result count once settled. And `announceForAccessibility` is fire-and-forget with no guarantee of delivery if the screen changes immediately, which is why post-navigation announcements are better handled by moving focus.

Detect the reader so you can adapt behaviour rather than guess:

```jsx
const [srOn, setSrOn] = useState(false);
useEffect(() => {
  AccessibilityInfo.isScreenReaderEnabled().then(setSrOn);
  const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setSrOn);
  return () => sub.remove();
}, []);
```

Use this to lengthen auto-dismiss timeouts or disable carousels — not to serve a different, lesser experience.

---

## 8. Touch Targets and Motor Accessibility

**Minimum target sizes** — the numbers to quote:

| Standard | Minimum |
|---|---|
| **WCAG 2.2 SC 2.5.8** Target Size (Minimum), Level AA | **24×24 CSS px** |
| WCAG 2.1 SC 2.5.5 Target Size, Level AAA | 44×44 |
| **Apple HIG** | **44×44 pt** |
| **Android / Material** | **48×48 dp** |

Ship to the platform guidance (44pt / 48dp), not the WCAG minimum — the AA floor of 24px is a legal baseline, not a usability target.

```jsx
// expand the touch area without changing the visual size
<Pressable hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
  <Icon size={20} />
</Pressable>
```

`hitSlop` is the idiomatic React Native fix for a 20pt icon that must stay 20pt visually. Also: leave **spacing between adjacent targets** (adjacent 44pt buttons with no gap still cause mis-taps), avoid placing destructive actions next to common ones, and remember **SC 2.5.7 Dragging Movements** requires a non-drag alternative for anything drag-based — a reorderable list needs "move up / move down" actions, which is exactly what `accessibilityActions` is for.

Support **switch control** and external keyboards by keeping everything reachable as a focusable element, and never require a **multi-finger or path-based gesture** as the only way to do something (SC 2.5.1).

---

## 9. Dynamic Type and Text Scaling

Users routinely set text to 200% or more. On iOS this is **Dynamic Type**; on Android, **font size** and **display size** (which scales `dp` too).

```jsx
// RN scales `fontSize` with the OS setting by default — keep it that way
<Text style={{ fontSize: 16 }}>Scales automatically</Text>

// clamp rather than disable, when a layout genuinely can't take 300%
<Text maxFontSizeMultiplier={1.8}>Title</Text>

// never do this — it opts the user out entirely
<Text allowFontScaling={false}>Broken</Text>
```

`allowFontScaling={false}` is an accessibility failure and a common one, usually added to "fix" a layout. Fix the layout instead:

- Never give a text container a **fixed height** — use padding and let it grow.
- Allow wrapping; avoid `numberOfLines={1}` on anything essential.
- Test at the **largest** setting including the iOS accessibility sizes, and in **landscape**.
- Prefer vertical stacking over side-by-side label/value rows, which break first.
- Icons paired with text should scale too — use `PixelRatio.getFontScale()` if you size them manually.

The related setting is Android's **display size**, which scales all `dp` values; an app that only handles font scaling still breaks there.

---

## 10. Colour, Contrast and Visual Settings

Contrast requirements are the same as the web: **4.5:1** for normal text, **3:1** for large text (18pt+, or 14pt+ bold) and for UI components and graphical objects (SC 1.4.11).

**Never convey information by colour alone** (SC 1.4.1) — a red border on an invalid field needs an icon or text too, and a status dot needs a label.

Platform settings to respect:

```jsx
import { AccessibilityInfo, useColorScheme } from 'react-native';

AccessibilityInfo.isInvertColorsEnabled()       // iOS: Smart Invert
AccessibilityInfo.isBoldTextEnabled()           // iOS
AccessibilityInfo.isGrayscaleEnabled()          // iOS
AccessibilityInfo.isHighTextContrastEnabled?.() // Android
```

Two mobile-specific points. iOS **Smart Invert** deliberately skips images and media, so mark decorative image-based backgrounds with `accessibilityIgnoresInvertColors` to avoid them being inverted into unreadable states. And dark mode is not an accessibility feature by itself — a low-contrast dark theme fails the same criteria as a low-contrast light one, so check both.

---

## 11. Motion and Vestibular Safety

Animation can cause nausea, dizziness and migraine for people with vestibular disorders. Both platforms expose a **Reduce Motion** setting, and honouring it is SC 2.3.3:

```jsx
const [reduceMotion, setReduceMotion] = useState(false);
useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  const s = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
  return () => s.remove();
}, []);

// with Reanimated
const style = useAnimatedStyle(() => reduceMotion
  ? { opacity: withTiming(1, { duration: 0 }) }        // cross-fade, no movement
  : { transform: [{ translateY: withSpring(0) }] });
```

Reduce Motion means **replace movement with a cross-fade**, not remove all feedback — the user still needs to know something changed. The offenders are large parallax, zoom transitions, spinning loaders and auto-playing carousels.

Also honour **Reduce Transparency** (iOS blur effects) and **prefers-crossfade-transitions**, and never auto-play video with sound. React Navigation's `animation: 'none'` or a fade preset is the simple screen-transition answer.

---

## 12. Focus Management and Modals

The classic mobile bug: a modal opens, but the screen reader stays on the content behind it, so a user swipes through invisible controls.

```jsx
<Modal visible={open} onRequestClose={close}>
  <View
    accessibilityViewIsModal={true}          // iOS: trap VoiceOver here
    accessibilityRole="alert"                 // announce on appear
  >
    <Text ref={titleRef} accessibilityRole="header">Delete application?</Text>
    …
  </View>
</Modal>

// Android: hide the background subtree explicitly
<View importantForAccessibility={open ? 'no-hide-descendants' : 'auto'}>
  {screenContent}
</View>
```

The two props do the same job on different platforms and **both are required** — this is the single most commonly missed pair in React Native accessibility. On open, move focus to the modal's heading with `setAccessibilityFocus`; on close, return focus to the control that opened it, which is the same discipline as the web.

For screen transitions, React Navigation announces the new screen on both platforms, but a custom header or a tab change often needs an explicit announcement or focus move.

---

## 13. Forms and Errors

```jsx
<Text nativeID="emailLabel">Email address</Text>
<TextInput
  accessibilityLabel="Email address"
  accessibilityLabelledBy="emailLabel"        // Android
  accessibilityHint="We'll send your confirmation here"
  accessibilityState={{ invalid: !!error }}
  keyboardType="email-address"
  autoComplete="email"                        // enables autofill + password managers
  textContentType="emailAddress"              // iOS autofill
  importantForAutofill="yes"
  returnKeyType="next"
/>
{error && (
  <Text accessibilityLiveRegion="assertive" accessibilityRole="alert">{error}</Text>
)}
```

Points that matter on mobile specifically: a `TextInput` **placeholder is not a label** — it disappears on focus and some readers ignore it; **`autoComplete`/`textContentType` are accessibility features**, because autofill removes typing for people for whom typing is expensive; the right **`keyboardType`** reduces effort; and errors must be announced, not only coloured. On submit, move focus to the **first invalid field** and announce a summary.

---

## 14. Lists, Images and Media

**Images.** Every meaningful image needs a label; decorative ones must be hidden, not labelled with empty text:

```jsx
<Image source={logo} accessibilityRole="image" accessibilityLabel="Acme Ltd logo" />
<Image source={divider} accessible={false} accessibilityElementsHidden />
```

Never include "image of" — the role already conveys that.

**Lists.** Group each row (§6), and give context that the visual layout implies:

```jsx
<FlatList
  data={jobs}
  renderItem={({ item, index }) => (
    <Pressable accessible accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${index + 1} of ${jobs.length}`} />
  )}
/>
```

Position information matters because a screen reader user has no visual sense of list length. Note that virtualised lists only render a window, so announcements about "loading more" need a live region.

**Media.** Captions are required for prerecorded video (SC 1.2.2) and audio description where visual content carries meaning (1.2.5). Custom players need labelled controls, an `adjustable` seek bar with `accessibilityActions`, and must not trap focus.

---

## 15. WCAG for Mobile

WCAG 2.2 applies to apps; these are the criteria where mobile differs most:

| SC | Level | Mobile relevance |
|---|---|---|
| **1.3.4 Orientation** | AA | don't lock to one orientation without a genuine reason |
| **1.4.4 Resize Text** | AA | Dynamic Type / font scaling (§9) |
| **1.4.10 Reflow** | AA | no two-dimensional scrolling; support 320px-equivalent |
| **1.4.11 Non-text Contrast** | AA | icons, borders, focus indicators at 3:1 |
| **2.5.1 Pointer Gestures** | A | a single-pointer alternative to every multi-touch/path gesture |
| **2.5.2 Pointer Cancellation** | A | act on **release**, not press, so a mis-touch can be aborted |
| **2.5.4 Motion Actuation** | A | shake-to-undo needs a button alternative |
| **2.5.7 Dragging Movements** | AA (2.2) | drag reorder needs non-drag actions |
| **2.5.8 Target Size (Min)** | AA (2.2) | 24×24 minimum; ship 44/48 |
| **2.3.3 Animation from Interactions** | AAA | honour Reduce Motion (§11) |
| **4.1.2 Name, Role, Value** | A | the core one — custom controls must expose all three |

**1.3.4 Orientation** is the one people get wrong: locking a whole app to portrait fails it, because a user with a device mounted to a wheelchair may be fixed in landscape. Lock only a specific screen with a real justification, such as a camera viewfinder.

**2.5.2 Pointer Cancellation** is why you use `onPress` (fires on release, cancellable by dragging away) rather than `onPressIn`.

---

## 16. Testing

**Automated tools catch roughly 30–40% of issues** — the same ceiling as the web. Use them as a floor, not a verdict.

```bash
# Android: Accessibility Scanner app — scans the current screen on-device
# iOS: Xcode → Open Developer Tool → Accessibility Inspector → Audit
```

```jsx
// unit/integration: query the way a screen reader would
import { render, screen } from '@testing-library/react-native';
render(<JobCard job={job} />);
expect(screen.getByRole('button', { name: /Senior Engineer at Acme/ })).toBeTruthy();
expect(screen.getByLabelText('Delete application')).toBeTruthy();
```

Querying by **role and accessible name** rather than by `testID` means the test fails when the accessibility tree breaks — the single best structural habit, because a11y regressions otherwise go unnoticed.

The manual pass that actually finds bugs, on a **real device**:

1. Turn on the screen reader and complete a core task **without looking at the screen**.
2. Set text to the largest size and check nothing is clipped or unreachable.
3. Turn on Reduce Motion and confirm transitions still communicate change.
4. Navigate with an external keyboard or Switch Control.
5. Check contrast on the actual device outdoors, not just in a design tool.

`accessibilityLabel` in RN maps to `testID`-adjacent automation on both platforms, so keep `testID` for automation and labels for users — overloading one for both produces announcements like "job-card-3".

---

## 17. Common Mistakes

1. **`View` + `onPress` instead of `Pressable`/`Button`** — no role, often not focusable.
2. **Not grouping rows**, so a card is five separate announcements.
3. **`allowFontScaling={false}`** to protect a layout.
4. **Missing the modal pair** — `accessibilityViewIsModal` (iOS) *and* `no-hide-descendants` (Android).
5. **Colour-only state** — selected tabs, invalid fields, status dots.
6. **Placeholder as label** on `TextInput`.
7. **Essential info in `accessibilityHint`**, which users can disable.
8. **Touch targets under 44pt/48dp** with no `hitSlop`.
9. **Announcing on every keystroke**, flooding the reader.
10. **Locking the whole app to portrait** (SC 1.3.4).
11. **Hidden-but-focusable content** — off-screen drawers still in the tree.
12. **"Image of…" in labels**, duplicating the role.
13. **Ignoring Reduce Motion** on parallax and zoom transitions.
14. **Reading order following visual position**, not the view hierarchy.
15. **Testing only in the simulator** with automated tools.

---

## 18. Interview Questions & Answers

**Q1: How does mobile accessibility differ from web accessibility?**

The assistive technology and the interaction model both differ. On mobile the screen readers are **VoiceOver and TalkBack**, and navigation is **gestural** — swipe for next element, **double-tap anywhere to activate what's focused** — so there's no Tab key, no focus ring, and no hover. That single behaviour reshapes design: a control that only responds to a precise touch point, or a custom gesture with no accessible element, is simply unreachable. The API surface is native (`accessibilityRole`, `accessibilityState`) rather than ARIA, though it maps onto the same Name/Role/Value model from SC 4.1.2. Mobile adds criteria the web rarely deals with — pointer gestures (2.5.1), motion actuation (2.5.4), dragging (2.5.7) and orientation (1.3.4) — and platform settings like Dynamic Type, Reduce Motion and Smart Invert that you must query and honour. The commercial difference is that **you can't hot-fix a rejected build**, so accessibility is release-blocking rather than a follow-up.

**Q2: What's the difference between `accessibilityLabel` and `accessibilityHint`?**

The **label is the name** — what the control is, announced immediately, and it should be short and specific: "Delete application". The **hint is the consequence** — what happens if you activate it — announced after a pause: "Removes this application from your list". The critical point is that **users can turn hints off**, so anything essential must be in the label; putting "double-tap to submit your application" in a hint means some users never hear it. Two further details: `accessibilityLabel` **replaces** the announced content, so a label on a container overrides its children's text, which is exactly how you group a card into one announcement but also how you accidentally silence real content; and you should never include the role in the label — "Delete button" announces as "Delete button, button".

**Q3: How do you make a list of complex cards usable with a screen reader?**

Group each card into a **single accessible element** with `accessible={true}` on the container, an `accessibilityRole` of `button` if it's tappable, and one `accessibilityLabel` that reads the card's meaning as a sentence — "Senior Engineer at Acme Ltd, London, £90,000, posted 2 days ago". Without that, every `Text` node is its own focus stop, so a five-field card costs five swipes and announces disconnected fragments; grouping turns a 60-swipe screen into a 12-swipe one, which is the highest-leverage accessibility change in most React Native apps. Add **position context** — "3 of 24" — because a screen reader user has no visual sense of list length. Then make sure any per-row actions are still reachable, via `accessibilityActions` on the grouped element so a swipe-to-delete has a non-gestural equivalent, and use a live region for "loading more" since a virtualised list only renders a window.

**Q4: Why is `allowFontScaling={false}` a problem, and what should you do instead?**

It opts the user out of the text size they chose at the OS level, which for someone with low vision may be the difference between usable and unusable — and it's usually added to stop a layout breaking, so it trades an accessibility failure for a cosmetic fix. The right response is to **fix the layout**: remove fixed heights from text containers and use padding so they grow, allow wrapping instead of `numberOfLines={1}` on essential text, stack label/value pairs vertically rather than side by side, and test at the largest setting including the iOS accessibility sizes and in landscape. If a layout genuinely cannot survive 300%, **clamp rather than disable** with `maxFontSizeMultiplier`, which still respects the user's preference up to a bound. One more thing people miss: Android has a separate **display size** setting that scales all `dp` values, so handling font scale alone isn't sufficient.

**Q5: A modal opens and the screen reader keeps reading the content behind it. Why, and how do you fix it?**

Because visual layering is not accessibility layering — the background views are still in the accessibility tree, so the reader swipes straight into invisible controls. The fix needs **both platform props**, and missing one is the most common React Native accessibility bug: **`accessibilityViewIsModal={true}`** on the modal's container traps VoiceOver on iOS, and **`importantForAccessibility="no-hide-descendants"`** on the background subtree removes it on Android. Then manage focus like you would on the web: on open, move focus to the modal's heading with `AccessibilityInfo.setAccessibilityFocus`, and on close return it to the control that opened the modal, otherwise focus resets to the top of the screen. Give the modal container `accessibilityRole="alert"` or announce it so its appearance isn't silent. Note `accessible={false}` alone is not enough — it only stops that one view being focusable, not its subtree.

**Q6: What are the minimum touch target sizes, and how do you meet them without changing the design?**

**WCAG 2.2 SC 2.5.8** sets a Level AA floor of **24×24 CSS pixels**, but the platform guidance is higher and is what you should actually ship: **44×44 pt** on iOS (Apple HIG) and **48×48 dp** on Android (Material). When a control must stay visually small — a 20pt close icon — use **`hitSlop`** in React Native to expand the touch area without touching the visual size. Beyond raw size, leave **spacing between adjacent targets**, because two abutting 44pt buttons still produce mis-taps, and keep destructive actions away from frequently-used ones. Two related criteria: **SC 2.5.2 Pointer Cancellation** is why you use `onPress` (fires on release, and dragging away cancels) rather than `onPressIn`; and **SC 2.5.7 Dragging Movements** requires a non-drag alternative, so a reorderable list needs explicit "move up / move down" accessibility actions.

**Q7: How do you announce dynamic changes, like search results appearing?**

Two mechanisms. `AccessibilityInfo.announceForAccessibility('5 jobs found')` is an imperative one-off that works on both platforms, and Android additionally supports the declarative **`accessibilityLiveRegion`** (`polite` or `assertive`) so changes inside that subtree are announced automatically. The judgement is in the timing: **don't announce on every keystroke** during search-as-you-type — debounce and announce the settled result count once, or you flood the reader and make the app unusable. Use `polite` by default so it waits for the current utterance, and reserve `assertive` for errors, since it interrupts. Two caveats: `announceForAccessibility` is fire-and-forget with no delivery guarantee if the screen changes immediately, so after navigation it's more reliable to **move focus** than to announce; and check `isScreenReaderEnabled` if you want to adapt behaviour — for example lengthening an auto-dismissing toast — rather than assuming.

**Q8: How would you test the accessibility of a mobile app?**

In layers, being honest that **automated tooling catches only about 30–40%**. Start with the platform auditors — **Accessibility Scanner** on Android and Xcode's **Accessibility Inspector** audit on iOS — for missing labels, small targets and contrast. Add automated regression coverage by querying **by role and accessible name** in React Native Testing Library (`getByRole('button', { name: /…/ })`) rather than by `testID`, so a broken accessibility tree fails the test suite; that's the single best structural habit because a11y regressions are otherwise invisible. Then the manual pass on a **real device**, which is where the real bugs are: complete a core task with the screen reader on and the screen not looked at, set text to the largest size, enable Reduce Motion, navigate with an external keyboard or Switch Control, and check contrast on the device rather than in a design tool. Finally, involve people who actually use assistive technology — expert review finds issues no checklist encodes.

---

## 19. Tricky Questions

**Q1: You add `accessibilityLabel` to a card container to group it, and now the screen reader announces the label but users report they can no longer reach the "Save" button inside the card. What happened?**

**Setting `accessible={true}` on a container collapses its subtree into one element, so descendant controls stop being individually focusable — on iOS especially.** That's the intended mechanism for grouping, and it's why grouping is so effective for read-only cards, but any interactive child inside the group becomes unreachable: the reader sees one button, and double-tapping fires the container's `onPress`, not the nested Save. The fix is to expose the inner actions as **`accessibilityActions`** on the grouped element and handle them in `onAccessibilityAction`, so a screen reader user gets "Save" and "Open" as actions on the single card element — which is also how swipe-to-delete rows should be built. The alternative is to not group and accept the extra swipes, or to group only the non-interactive text and leave buttons as siblings outside the accessible container. The general lesson: grouping trades granularity for brevity, so it suits content, not controls.

**Q2: Your app passes Accessibility Scanner and the Xcode audit with zero issues, but a screen-reader user says it's unusable. How is that possible?**

**Automated tools check the presence of properties, not the coherence of the experience** — they catch roughly 30–40% of real problems. Everything they verify can pass while the app remains unusable: labels can be present but meaningless ("button", "image1", "job-card-3" from an overloaded `testID`), the **reading order** can follow the view hierarchy while the visual layout says something completely different, a card can be technically labelled yet split into fifteen fragments, focus can be lost to the background when a modal opens, and dynamic changes can go unannounced entirely. None of that trips a static audit. What finds it is completing a core task on a real device with the screen off-limits, which surfaces exactly these coherence failures, plus review by people who use assistive technology daily. So the honest answer is that the tools are a floor for mechanical defects and say nothing about whether the app can actually be operated.

**Q3: A tester says your tab bar "doesn't tell me which tab is active", but the active tab is clearly highlighted in blue and you've set `accessibilityRole="tab"`. What's missing?**

**`accessibilityState={{ selected: true }}` — the visual highlight carries no semantics.** The role tells the reader this is a tab; nothing tells it *this* tab is the current one, so all five announce identically and the user has no way to orient. Setting `selected` makes VoiceOver and TalkBack append "selected" to the announcement. This is the mobile form of SC 1.4.1 (colour alone) combined with 4.1.2 (Name, Role, Value), and it recurs across every stateful control: disabled buttons need `disabled`, checkboxes need `checked` (which also supports `'mixed'` for indeterminate), accordions need `expanded`, and loading buttons need `busy`. A related trap is using the wrong key — `checked` is for checkboxes and radios while `selected` is for tabs and list selection, and swapping them produces odd or absent announcements.

**Q4: Locking your app to portrait made the layout much simpler. Why is that an accessibility failure?**

**It fails WCAG SC 1.3.4 Orientation.** The criterion requires content not to restrict its view to a single display orientation unless that orientation is essential, and the reason is concrete rather than theoretical: a user whose device is mounted — to a wheelchair, a bed frame, a stand — may be physically unable to rotate it, so a portrait-locked app is simply unusable in a landscape-fixed mount. "Our layout is simpler" isn't an essentiality argument. What *is* essential is something like a camera viewfinder, a piano keyboard or a specific game — and the criterion allows locking **that screen**, not the whole app. So the fix is to unlock the app and make the layout responsive, locking individual screens only with a genuine justification. Practically, supporting landscape also improves things for large-text users, since more horizontal space reduces clipping at 200%+ text sizes.

**Q5: You honour Reduce Motion by removing all animations, and now users complain they can't tell when a screen has changed. What's the right interpretation?**

**Reduce Motion means replace movement with a non-vestibular transition, not eliminate feedback.** The setting exists because large-scale movement — parallax, zoom, sliding full screens — can trigger nausea, dizziness and migraine in people with vestibular disorders. It does not mean the interface should change instantly and silently, which removes the change cue everyone relies on and disproportionately affects users with cognitive disabilities. The correct substitution is a **cross-fade or opacity change** with no translation or scaling, which conveys "something changed" without motion; Apple's own guidance and the `prefers-crossfade-transitions` setting point the same way. So `useAnimatedStyle` should swap a `translateY` spring for a `withTiming` opacity fade, and React Navigation should use a fade preset rather than `animation: 'none'`. Pair it with a screen-reader announcement or focus move so the change is conveyed non-visually too.

---

## 20. Cheat Sheet

**Platform basics**

1. VoiceOver (iOS) and TalkBack (Android): swipe to move, **double-tap anywhere to activate**.
2. No Tab key, no focus ring — but support external keyboards and Switch Control.
3. Everything announced comes from the **accessibility tree**, not the visual layout.
4. Use real components (`Pressable`, `Button`) — a `View` + `onPress` has no role.

**Props**

5. `accessibilityLabel` = the **name**; `accessibilityHint` = the **consequence**.
6. **Hints can be turned off** — never put essential info there.
7. Never include the role in the label ("Delete button" → "Delete button, button").
8. `accessibilityRole` drives announcement and available gestures.
9. `accessibilityState`: `disabled`, `selected`, `checked` (+`'mixed'`), `busy`, `expanded`.
10. `checked` is for checkbox/radio; `selected` is for tabs/selection.
11. `accessibilityValue` — prefer `text` when a number alone is meaningless.
12. Keep `testID` for automation, labels for users.

**Grouping**

13. `accessible={true}` on a container = **one** element (biggest single win).
14. Grouping makes interactive children unreachable — expose `accessibilityActions`.
15. Reading order follows the **view hierarchy**, not visual position. Reorder the JSX.
16. Add position context: "3 of 24".

**Hiding**

17. `accessible={false}` — this view only. Children may remain focusable.
18. `accessibilityElementsHidden` (iOS) / `importantForAccessibility="no-hide-descendants"` (Android) — whole subtree.
19. Hidden-but-focusable off-screen content is a real bug.

**Modals & focus**

20. Modals need **both** `accessibilityViewIsModal` (iOS) and `no-hide-descendants` (Android).
21. Move focus to the modal heading on open; **return it** on close.
22. `AccessibilityInfo.setAccessibilityFocus(findNodeHandle(ref))`.

**Announcements**

23. `announceForAccessibility` (both) / `accessibilityLiveRegion` (Android).
24. `polite` waits, `assertive` interrupts — assertive for errors only.
25. **Debounce** — never announce per keystroke.
26. After navigation, moving focus beats announcing.
27. `isScreenReaderEnabled` to adapt timing, not to serve a lesser experience.

**Targets & motor**

28. Ship **44×44 pt** (iOS) / **48×48 dp** (Android). WCAG AA floor is 24×24.
29. `hitSlop` expands the touch area without changing visuals.
30. Space adjacent targets; keep destructive actions apart.
31. `onPress` (release) not `onPressIn` — SC 2.5.2 cancellation.
32. Every multi-touch/path gesture needs a single-pointer alternative (2.5.1).
33. Drag interactions need non-drag actions (2.5.7).

**Text & colour**

34. **Never `allowFontScaling={false}`** — clamp with `maxFontSizeMultiplier` instead.
35. No fixed heights on text containers; allow wrapping; test at max size and landscape.
36. Android **display size** scales `dp` too, not just fonts.
37. Contrast 4.5:1 text, 3:1 large text and UI components.
38. Never colour alone for state (1.4.1).
39. `accessibilityIgnoresInvertColors` on image-based backgrounds (iOS Smart Invert).

**Motion & orientation**

40. Honour **Reduce Motion**: cross-fade instead of movement — don't remove feedback.
41. **Don't lock the app to portrait** (SC 1.3.4); lock a screen only if essential.

**Forms**

42. A placeholder is **not** a label.
43. `autoComplete` / `textContentType` are accessibility features (autofill).
44. Announce errors via a live region; focus the first invalid field on submit.

**Testing**

45. Automated tools catch ~**30–40%**.
46. Accessibility Scanner (Android), Accessibility Inspector audit (Xcode).
47. Query by **role and accessible name** in tests, not `testID`.
48. Do a real-device pass with the screen reader on and the screen unseen.

---

## 21. References

- [Apple — Accessibility](https://developer.apple.com/accessibility/) and the [HIG Accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Android — Build accessible apps](https://developer.android.com/guide/topics/ui/accessibility) and [Material accessibility](https://m3.material.io/foundations/accessible-design/overview)
- [React Native — Accessibility](https://reactnative.dev/docs/accessibility) — the canonical prop reference.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [Mobile Accessibility: How WCAG Applies to Mobile](https://www.w3.org/TR/mobile-accessibility-mapping/)
- [WCAG 2.2 — Target Size (Minimum) 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) and [Dragging Movements 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- [Accessibility Scanner](https://support.google.com/accessibility/android/answer/6376570) · [Xcode Accessibility Inspector](https://developer.apple.com/documentation/accessibility/accessibility-inspector)
- [Supporting Dynamic Type](https://developer.apple.com/documentation/uikit/uifont/scaling-fonts-automatically) · [Reduce Motion](https://developer.apple.com/documentation/uikit/uiaccessibility/1615133-isreducemotionenabled)
- [European Accessibility Act](https://ec.europa.eu/social/main.jsp?catId=1202) — enforceable from June 2025.
