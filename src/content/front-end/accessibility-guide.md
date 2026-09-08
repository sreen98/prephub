# Accessibility (a11y) — Complete Guide

Accessibility stopped being a "nice to have" in June 2025, when the **European Accessibility Act** became enforceable. It is now a legal requirement for a large class of products sold in the EU, alongside long-standing obligations under the ADA in the US and equivalent laws elsewhere. That changed hiring: accessibility questions moved from "bonus points" to a standard part of frontend interviews, and a candidate who cannot explain the difference between `aria-label` and a visible label is now a liability rather than an incomplete hire.

This guide covers what interviews actually ask: the standards and their legal weight, semantic HTML, the ARIA rules, keyboard and focus management, the component patterns that get built live in interviews, and how to test any of it.

---

## Table of Contents

- [1. Why This Is Now a Legal Requirement](#1-why-this-is-now-a-legal-requirement)
- [2. POUR and How WCAG Is Structured](#2-pour-and-how-wcag-is-structured)
- [3. WCAG 2.2 — What Changed](#3-wcag-22-what-changed)
- [4. Semantic HTML First](#4-semantic-html-first)
- [5. ARIA — The Rules](#5-aria-the-rules)
- [6. Keyboard and Focus Management](#6-keyboard-and-focus-management)
- [7. Screen Readers and the Accessibility Tree](#7-screen-readers-and-the-accessibility-tree)
- [8. Forms](#8-forms)
- [9. Colour and Visual Design](#9-colour-and-visual-design)
- [10. Live Regions and Dynamic Content](#10-live-regions-and-dynamic-content)
- [11. Component Patterns](#11-component-patterns)
- [12. Accessibility in React](#12-accessibility-in-react)
- [13. Testing](#13-testing)
- [14. Interview Questions & Answers](#14-interview-questions-answers)
- [15. Tricky Questions](#15-tricky-questions)
- [16. Cheat Sheet](#16-cheat-sheet)
- [17. References](#17-references)

---

## 1. Why This Is Now a Legal Requirement

| Jurisdiction | Instrument | Status |
|---|---|---|
| **EU** | **European Accessibility Act** (Directive 2019/882) | **Applies from 28 June 2025.** Covers e-commerce, banking, transport, e-books, telecoms and more |
| **EU (public sector)** | Web Accessibility Directive + **EN 301 549** | In force; **EN 301 549 v4.1.1 (expected 2026)** aligns the standard to WCAG 2.2 |
| **US** | ADA Titles II & III | Title II regulations set explicit **WCAG 2.1 AA** deadlines for state/local government; Title III enforced through litigation |
| **US (federal)** | Section 508 | WCAG 2.0 AA baseline |
| **UK** | Equality Act 2010 + public sector regs | In force |
| **Canada** | ACA / AODA | Phased deadlines |

Three practical consequences worth knowing for an interview:

**The target is WCAG 2.x AA.** Almost every law references WCAG 2.0/2.1/2.2 at **Level AA**. AAA is not the compliance target — it's a stretch goal, and some AAA criteria are impossible to meet for certain content types.

**Accessibility overlays don't work, legally or technically.** The "install one script and become compliant" widgets have repeatedly lost in court and are actively opposed by disability advocacy groups. If asked about them, say so: they cannot fix semantics, they often break existing assistive technology, and they create legal exposure rather than removing it.

**"We'll do accessibility later" is now a compliance risk with a date on it.** The senior framing is that accessibility is cheapest at the **design system** layer — fix a `Button`'s focus handling once and every product inherits it. Retrofitting it per feature across five products is where the cost explodes. That's the connection to the Frontend Architecture guide: a design system is the highest-leverage place in the codebase to make accessibility the default.

And the framing that always lands better than the legal one: **the requirements are just usability for people using your product differently.** Keyboard navigation helps power users. Captions help everyone in a noisy room. Good contrast helps everyone outdoors. Roughly one in six people worldwide has a significant disability, and permanent disability is only part of it — situational and temporary impairments (a broken arm, bright sunlight, holding a baby) affect everyone eventually.

---

## 2. POUR and How WCAG Is Structured

WCAG organises everything under four principles, and knowing them lets you reason about a novel case rather than memorising rules.

| Principle | Means | Example failures |
|---|---|---|
| **Perceivable** | Users can perceive the information | no alt text, no captions, colour-only meaning, poor contrast |
| **Operable** | Users can operate the interface | keyboard traps, drag-only interaction, tiny targets, short timeouts |
| **Understandable** | Content and operation are comprehensible | unlabelled inputs, unclear errors, inconsistent navigation |
| **Robust** | Works with current and future assistive tech | invalid ARIA, custom widgets with no roles, state not exposed |

The hierarchy is **Principles (4) → Guidelines (13) → Success Criteria (87 in WCAG 2.2)**, each criterion at Level A, AA or AAA. A, AA and AAA are *not* difficulty tiers — they reflect how broadly applicable and how testable the requirement is. Some AAA criteria are genuinely impossible for certain content, which is exactly why the legal target is AA.

The criterion numbers worth actually remembering, because they come up by number in audits:

```
1.1.1  Non-text Content (A)          — alt text
1.3.1  Info and Relationships (A)    — semantic structure; the most-cited failure
1.4.3  Contrast (Minimum) (AA)       — 4.5:1 text, 3:1 large text
1.4.4  Resize Text (AA)              — 200% zoom without loss
1.4.11 Non-text Contrast (AA)        — 3:1 for UI components and focus indicators
2.1.1  Keyboard (A)                  — all functionality via keyboard
2.1.2  No Keyboard Trap (A)
2.4.3  Focus Order (A)
2.4.7  Focus Visible (AA)
2.5.3  Label in Name (A)             — visible label must be in the accessible name
3.3.1  Error Identification (A)
3.3.2  Labels or Instructions (A)
4.1.2  Name, Role, Value (A)         — the criterion custom widgets fail
```

**WCAG 3.0** is still a working draft with a different model (outcomes and scoring rather than pass/fail criteria). It is years from being a legal reference. If asked, say you're targeting 2.2 AA and watching 3.0 — claiming to build to 3.0 today signals you haven't read it.

---

## 3. WCAG 2.2 — What Changed

WCAG 2.2 was published as a W3C Recommendation on **5 October 2023**. It adds **nine** success criteria and removes one.

| SC | Name | Level | What it requires |
|---|---|---|---|
| **2.4.11** | Focus Not Obscured (Minimum) | **AA** | The focused element must not be *entirely* hidden by other content (sticky headers, cookie banners) |
| **2.4.12** | Focus Not Obscured (Enhanced) | AAA | Not even *partially* hidden |
| **2.4.13** | Focus Appearance | AAA | Minimum size and contrast for the focus indicator |
| **2.5.7** | Dragging Movements | **AA** | Anything draggable needs a single-pointer alternative (buttons, a menu) |
| **2.5.8** | Target Size (Minimum) | **AA** | Targets at least **24×24 CSS px**, or adequately spaced |
| **3.2.6** | Consistent Help | **A** | Help mechanisms appear in a consistent relative order across pages |
| **3.3.7** | Redundant Entry | **A** | Don't ask for the same information twice in one process |
| **3.3.8** | Accessible Authentication (Minimum) | **AA** | No cognitive function test (puzzle, memorisation, transcription) without an alternative |
| **3.3.9** | Accessible Authentication (Enhanced) | AAA | No cognitive function test at all |

**Removed: 4.1.1 Parsing.** It's obsolete — modern HTML parsers recover from duplicate IDs and unclosed tags, and assistive technology relies on the parsed DOM rather than the source. Note this only removes the *criterion*; duplicate IDs still break `aria-labelledby` and `for`/`id` associations, so they're still bugs, just not 4.1.1 failures.

**The three that actually change how you build things:**

**2.5.8 Target Size (24×24)** — a 16px icon button with no padding now fails AA. This is a design-system-wide fix: make your icon button's hit area at least 24×24 by default, and remember the target can be larger than the visual (padding, or a pseudo-element expanding the hit area). Note 2.5.5 Target Size (Enhanced) at AAA is the older 44×44 figure — don't confuse them.

**2.5.7 Dragging Movements** — a drag-and-drop kanban, a slider, a sortable list all need a non-drag path. For a slider, arrow keys already satisfy it. For a kanban, a "Move to…" menu on each card. This is the criterion that most often forces a genuine feature addition rather than an attribute fix.

**3.3.8 Accessible Authentication** — this outlaws a surprising amount of common practice: transcribing a code from an image, solving a puzzle CAPTCHA, or re-typing a one-time code that you then *block from being pasted*. **Blocking paste in an OTP field is an accessibility failure**, and it's the single most commonly-shipped violation of this criterion. Object recognition and personal-content identification are permitted exceptions; email-link or passkey-based flows satisfy it cleanly.

**2.4.11 Focus Not Obscured** is the one that catches sticky UI: tab through your own site with a sticky header and watch the focused element scroll underneath it. `scroll-margin-top` on focusable elements is usually the fix.

---

## 4. Semantic HTML First

**The first rule of ARIA is: don't use ARIA.** A native element gives you the role, the keyboard behaviour, the focus handling and the state reporting for free, and all of it is already correct in every assistive technology. Every one of those becomes your job the moment you use a `div`.

```html
<!-- 40+ lines of JS to make this correct, and it still won't be -->
<div class="btn" onclick="submit()">Submit</div>

<!-- Correct in every screen reader, keyboard, and voice control tool, for free -->
<button type="button" onclick="submit()">Submit</button>
```

What you get from `<button>` and lose from `div`: focusability, Enter and Space activation, `role="button"` exposure, the disabled state, form submission behaviour, right-click and context-menu behaviour, and voice-control targeting ("click Submit").

### 4.1 Document Structure

```html
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <header><nav aria-label="Main">…</nav></header>
  <main id="main">
    <h1>One h1 per page</h1>
    <section aria-labelledby="billing-h"><h2 id="billing-h">Billing</h2>…</section>
  </main>
  <aside aria-label="Related"></aside>
  <footer></footer>
</body>
```

Landmarks (`header`, `nav`, `main`, `aside`, `footer`, `search`, `form` with a name) let screen-reader users jump directly between regions — this is *the* primary navigation mechanism, more used than reading linearly. Give repeated landmarks an accessible name (`aria-label`) so "Main navigation" and "Footer navigation" are distinguishable.

**Headings are a navigation structure, not a font-size picker.** Screen-reader users pull up a heading list and navigate by it. So: one `<h1>`, never skip levels going down (`h2` → `h4` is a failure of 1.3.1), and style with CSS rather than choosing a level for its size.

**The skip link** is required in practice (2.4.1 Bypass Blocks) and is usually implemented wrong. It must be the first focusable element, visually hidden until focused, and visible when focused:

```css
.skip-link {
  position: absolute; left: -9999px;
}
.skip-link:focus {
  position: fixed; left: 1rem; top: 1rem; z-index: 999;
  /* must be visible — the whole point is that a keyboard user can see it */
}
```

### 4.2 Images and Alt Text

```html
<img src="chart.png" alt="Revenue grew from £2m in 2024 to £5m in 2026">  <!-- informative -->
<img src="divider.png" alt="">                                            <!-- decorative -->
<a href="/"><img src="logo.svg" alt="Acme home"></a>                      <!-- functional: describe the ACTION -->
<img src="chart.png" alt="Q3 revenue by region" aria-describedby="chart-data">
<table id="chart-data" class="sr-only">…</table>                          <!-- complex: alt + long description -->
```

The rules: `alt=""` (empty, but **present**) for decorative images — omitting `alt` entirely makes some screen readers read the filename. Describe the *function* for functional images, not the picture. Never start with "image of" — the role is already announced. And for charts, the alt should convey the **insight**, with the underlying data available as a table.

### 4.3 The Elements People Reimplement Needlessly

`<dialog>` (modal with a real focus trap), `<details>`/`<summary>` (disclosure), the `popover` attribute (top-layer with light dismiss), `<progress>`, `<meter>`, `<output>`, `<datalist>`, `<fieldset>`/`<legend>` for radio groups, `<table>` with `<caption>`/`<th scope>`, and `<input type="date|search|tel|email">` for the right mobile keyboard and native validation. Reaching for one of these instead of a custom widget is often the single highest-value accessibility decision in a component.

---

## 5. ARIA — The Rules

ARIA adds semantics to markup that doesn't have them. It changes **only what assistive technology reports** — it adds no behaviour, no keyboard handling, and no focusability. `role="button"` on a `div` makes a screen reader *say* "button" while the element remains unfocusable and unactivatable. That gap is worse than no ARIA at all, because it lies.

**The five rules of ARIA**, worth being able to recite:

1. **Use a native element if one exists.** ARIA is for when the platform has no equivalent.
2. **Don't change native semantics** unless you must. `<h2 role="tab">` is wrong; wrap instead — `<h2><div role="tab">…</div></h2>`.
3. **All interactive ARIA controls must be keyboard operable.** If you add `role="button"`, you own `tabindex="0"` plus Enter and Space handlers.
4. **Don't use `role="presentation"` or `aria-hidden="true"` on a focusable element.** You create something a screen reader can't see but a keyboard can reach — the worst possible state.
5. **Every interactive element needs an accessible name.**

### 5.1 Naming: The Priority Order

The accessible name is computed from the first of these that exists:

```
aria-labelledby  →  aria-label  →  native label (<label>, alt, title on some)  →  text content  →  title
```

`aria-labelledby` wins over everything, which is the source of a lot of confusion, and it takes **IDs**, not text. Two mistakes to avoid:

```html
<!-- WRONG: aria-label overrides the visible text. Voice control users saying
     "click Save" now fail, and it violates 2.5.3 Label in Name. -->
<button aria-label="Submit form">Save</button>

<!-- RIGHT: if you need more context, extend rather than replace -->
<button>Save <span class="sr-only">billing details</span></button>
```

**`aria-label` on a non-interactive element is usually ignored.** It works on interactive elements and landmarks; on a `<div>` or `<span>` with no role it typically does nothing at all. This is a very common false fix.

### 5.2 `aria-describedby` vs `aria-labelledby`

The label is *what it is*; the description is *extra detail*. Screen readers announce the label immediately and the description after a pause (and some let users skip descriptions). So error messages and hint text go in `aria-describedby`, never in the label.

### 5.3 State and Properties You Actually Use

```html
<button aria-expanded="false" aria-controls="menu">Menu</button>
<div aria-live="polite">3 results</div>
<input aria-invalid="true" aria-describedby="email-err" aria-required="true">
<button aria-pressed="true">Bold</button>          <!-- toggle button -->
<div role="tab" aria-selected="true">…</div>       <!-- selection within a set -->
<button aria-busy="true">Saving…</button>
<nav><a href="/x" aria-current="page">X</a></nav>  <!-- current item in a set -->
```

**`aria-hidden="true"`** removes an element from the accessibility tree but leaves it visible and focusable — so use it for decorative icons (`<svg aria-hidden="true">` next to visible text) and **never** on anything focusable or on a container holding focusable content.

**`aria-disabled` vs `disabled`**: `disabled` removes the element from the tab order, so a keyboard user can never reach it to discover *why* it's disabled. `aria-disabled="true"` keeps it focusable and announced as disabled — usually the better UX for a form's submit button, as long as you also prevent the action in your handler.

**`role="presentation"`/`role="none"`** strips semantics — the legitimate use is a layout table, or a `<ul>` used purely as a styling wrapper where the list semantics are noise.

### 5.4 The Most Common ARIA Mistakes

- **Adding roles that duplicate native semantics** — `<button role="button">`, `<nav role="navigation">`. Harmless but signals cargo-culting.
- **`aria-label` on a div with no role** — silently does nothing.
- **`aria-labelledby` pointing at a non-existent or duplicated ID** — silently produces no name. This is why duplicate IDs are still bugs even though 4.1.1 was removed.
- **Roles without their required states** — `role="checkbox"` with no `aria-checked`, `role="tab"` with no `aria-selected`. An incomplete role is worse than no role.
- **`aria-hidden` on a focusable element** — creates the invisible-but-reachable state.
- **Overriding visible text with `aria-label`** — breaks voice control and fails 2.5.3.

The rule to state: **no ARIA is better than bad ARIA.** A plain unlabelled `div` is a missing feature; a `div` with `role="button"` and no keyboard handling actively misleads the user into thinking it will work.


---

## 6. Keyboard and Focus Management

Keyboard support is the highest-value accessibility work, because it serves screen-reader users, switch and sip-and-puff users, people with tremor or RSI who can't use a mouse precisely, and power users — all at once. And it's testable in thirty seconds: **unplug your mouse and use your own product.**

### 6.1 The Tab Order Rules

```html
<button>Naturally focusable, in DOM order</button>
<div tabindex="0">Focusable, in DOM order</div>
<div tabindex="-1">NOT tabbable, but focusable via element.focus()</div>
<div tabindex="5">Never do this — positive values break DOM order globally</div>
```

**Never use positive `tabindex`.** It jumps ahead of every naturally-focusable element on the page, so one positive value on one component reorders the entire document unpredictably. `tabindex="0"` and `tabindex="-1"` are the only two you need.

**Focus order must follow visual order** (2.4.3). This is where CSS and accessibility collide: `flex-direction: row-reverse`, `order`, and `grid-area` placement change the *visual* order while the DOM order — and therefore the tab order — stays the same. A keyboard user tabs "backwards" through a visually-reversed row. The fix is to reorder the DOM, not the CSS.

### 6.2 Visible Focus

```css
/* NEVER do this */
*:focus { outline: none; }

/* Do this: :focus-visible shows the ring for keyboard users only,
   not on mouse click — which is what people were trying to fix with outline:none */
:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}

/* Sticky headers obscure focus — WCAG 2.2's SC 2.4.11 */
:focus-visible { scroll-margin-top: var(--header-height); }
```

`:focus-visible` is the answer to the entire historical argument about focus rings. The browser applies it on keyboard focus and omits it on mouse click, so designers get clean click states and keyboard users keep their indicator.

The requirements: the indicator must have **3:1 contrast** against the adjacent background (1.4.11), and `outline-offset` matters because a ring flush against a same-coloured border is invisible. Never rely on colour change alone — an outline or underline is perceivable to colour-blind users.

### 6.3 Managing Focus on State Change

This is what SPAs get wrong most often, and it comes up in interviews constantly.

| Event | Where focus should go |
|---|---|
| Modal opens | into the modal — the first focusable element, or the heading with `tabindex="-1"` |
| Modal closes | **back to the element that opened it** |
| Route change (SPA) | to the `<h1>` or the `<main>` (with `tabindex="-1"`), and announce the new page |
| Deleting a list item | to the next item, or the list container if it was the last |
| Async content loads | usually stay put and announce via a live region — do **not** steal focus |
| Validation fails | to the first invalid field, with the error in `aria-describedby` |
| Expanding a disclosure | stays on the trigger; content follows in DOM order |

```jsx
// Return focus on close — the half people forget
function Modal({ onClose }) {
  const opener = useRef(document.activeElement);
  useEffect(() => () => opener.current?.focus(), []);
  // …
}
```

**Don't steal focus** for things the user didn't initiate. Auto-focusing a search box on page load is disorienting for a screen-reader user, who has been dropped past the page's structure. Focus movement should be a response to a user action.

### 6.4 Focus Trapping

A modal must trap focus: Tab from the last element wraps to the first, and nothing outside the dialog is reachable. Getting it right by hand means handling Tab and Shift+Tab, recomputing the focusable set as content changes, `inert`-ing the background, restoring focus on close and closing on Escape.

**Use `<dialog>` with `showModal()`** — the browser does all of it, including `inert` on the rest of the page, and it renders in the top layer so it can't be clipped by an ancestor's `overflow` or lose a `z-index` fight. This is genuinely the correct answer to "how would you build an accessible modal?", and a hand-rolled trap is where most component libraries historically failed audits.

The remaining manual bit: `<dialog>` doesn't lock background scroll, so add `body:has(dialog[open]) { overflow: hidden; }`.

### 6.5 Standard Key Bindings

Follow the platform conventions or users will be lost — the ARIA Authoring Practices Guide is the reference:

```
Tab / Shift+Tab   move between widgets (one stop per composite widget)
Arrows            move WITHIN a composite widget (tabs, menu, listbox, radio group)
Enter             activate button/link; submit form
Space             activate button; toggle checkbox; select option
Escape            close dialog/menu/popover; cancel
Home / End        first / last item
Type-ahead        jump to matching option in a listbox or select
```

**The composite-widget rule is the one candidates miss:** a tablist, menu, radio group or listbox is **one tab stop**, and arrow keys move inside it. Making every tab in a tablist individually tabbable is a common and incorrect implementation — it forces a keyboard user through nine tab presses to get past your navigation. The pattern is called **roving tabindex**: exactly one item has `tabindex="0"`, all others `tabindex="-1"`, and arrow keys move both focus and the `0`.

---

## 7. Screen Readers and the Accessibility Tree

The browser builds an **accessibility tree** from the DOM — a parallel structure where each node has a **role**, a **name**, a **description**, a **value** and **states**. That is all a screen reader sees. It has no access to your CSS classes, your React component names, or your visual layout.

```
DOM                              Accessibility tree
<button aria-expanded="false">   role: button
  <svg aria-hidden="true"/>      name: "Menu"          (svg is hidden, so ignored)
  Menu                           state: collapsed
</button>
```

Debug it in DevTools: Chrome's Elements panel has an **Accessibility** pane showing the computed name, role and the full tree. Reading that pane is the single most useful accessibility debugging skill, because it tells you what the user actually receives instead of what you intended.

**Things that remove a node from the tree:** `display: none`, `visibility: hidden`, the `hidden` attribute, `aria-hidden="true"`, and `role="presentation"`. Note that `opacity: 0`, `clip-path`, and moving something off-screen do **not** — which is exactly how the `.sr-only` pattern works, and also how you accidentally leave invisible content readable.

```css
/* Visually hidden but available to screen readers — the correct implementation */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

Don't use `display: none` (removed from the tree entirely), `visibility: hidden` (same), `text-indent: -9999px` (breaks in RTL), or `font-size: 0` (unreliable).

**The screen readers that matter**, and why testing on more than one is necessary: **NVDA** (Windows, free, most common in testing), **JAWS** (Windows, commercial, most common in enterprise), **VoiceOver** (macOS/iOS, built in), **TalkBack** (Android), **Narrator** (Windows, built in). They differ in how they handle ARIA edge cases, live regions and custom widgets — a pattern that reads perfectly in VoiceOver can be silent in NVDA.

**Browse mode vs focus mode** is the concept that explains most confusing screen-reader behaviour. In **browse mode** (the default in NVDA/JAWS), keystrokes are intercepted by the screen reader for navigation — arrow keys read the next line rather than reaching your handler. The screen reader switches to **focus mode** when focus enters a form field or a widget with an interactive role. This is why a `div` with an interactive role but no proper role/state combination behaves unpredictably: the screen reader can't tell it should switch modes.

---

## 8. Forms

Forms are where accessibility failures cost the most, because a broken form blocks a transaction rather than merely annoying someone.

```html
<div class="field">
  <label for="email">Email address</label>
  <input
    id="email"
    type="email"
    name="email"
    autocomplete="email"
    required
    aria-describedby="email-hint email-error"
    aria-invalid="true"
  >
  <p id="email-hint">We'll only use this for receipts.</p>
  <p id="email-error" role="alert">Enter an email address like name@example.com</p>
</div>
```

**The rules:**

- **Every input needs a real `<label>` with `for`.** Not a placeholder, not an `aria-label` where a visible label would do. A visible label survives zoom, benefits everyone, and gives a bigger click target (clicking the label focuses the input).
- **Placeholders are not labels.** They vanish on input (so the user loses the field's identity while typing), usually fail contrast, and are not reliably announced. Use them for format examples only, if at all.
- **`autocomplete` is an accessibility feature**, not just convenience — it satisfies 1.3.5 Identify Input Purpose and directly serves WCAG 2.2's **3.3.7 Redundant Entry**. Use the standard tokens (`email`, `tel`, `given-name`, `street-address`, `cc-number`, `one-time-code`).
- **Group related controls** with `<fieldset>` and `<legend>`. A radio group without a `<legend>` gives a screen-reader user four options and no question.
- **Never rely on colour alone** for error state (1.4.1). Colour + icon + text.
- **Errors must be programmatically associated** via `aria-describedby`, placed near the field, and describe the fix (`"Enter an email like name@example.com"`) rather than the failure (`"Invalid"`).
- **On submit failure, move focus to the first invalid field** and provide an error summary at the top of the form that links to each field. Users don't hunt for errors.
- **Don't validate on every keystroke.** Announcing "invalid" while someone is halfway through typing their email is hostile. Validate on blur or submit.
- **Don't block paste** — in any field, and especially not in an OTP or password field. It's a WCAG 2.2 **3.3.8** failure and it breaks password managers.

**`required` vs `aria-required`:** the native `required` gives you the semantics plus browser validation; `aria-required="true"` gives semantics only, for when you're handling validation yourself and don't want the browser's default UI.

---

## 9. Colour and Visual Design

### 9.1 Contrast Requirements

| What | Ratio | SC |
|---|---|---|
| Body text | **4.5:1** | 1.4.3 (AA) |
| Large text (**≥24px**, or **≥18.66px bold**) | **3:1** | 1.4.3 (AA) |
| UI components, graphical objects, **focus indicators** | **3:1** | 1.4.11 (AA) |
| Body text (enhanced) | 7:1 | 1.4.6 (AAA) |
| Disabled controls, pure decoration, logos | exempt | — |

The two most-missed parts: **1.4.11 covers UI components**, so a form input's border, a toggle's track and your focus ring all need 3:1 against their surroundings — a 1px `#e5e5e5` border on white fails. And **placeholder text is body text** for contrast purposes; the fashionable pale-grey placeholder is a very common AA failure.

Automate this. A contrast check on every token pair in CI turns a subjective design argument into a build failure, which is the only way it stays fixed (see the Frontend Architecture guide's design-system section).

### 9.2 Don't Encode Meaning in Colour Alone

1.4.1 — roughly 1 in 12 men has a colour vision deficiency, so "the red rows need attention" conveys nothing to them. Every colour-coded state needs a second channel: an icon, a text label, a pattern, or a shape. This applies to charts (use shape and direct labels, not just a colour legend), status badges, form validation, and required-field markers.

### 9.3 Zoom, Reflow and Text Spacing

- **1.4.4 Resize Text (AA):** text must scale to **200%** without loss of content or function. This is why `font-size` in `px` on `html` is a problem and why `clamp()` needs a `rem` term (see the Modern CSS guide) — a pure `vw` font-size ignores the user's setting entirely.
- **1.4.10 Reflow (AA):** no two-dimensional scrolling at **320 CSS px** wide (equivalently 400% zoom on a 1280px viewport). Test by zooming to 400%, not by narrowing the window — they're different, and the zoom case is what's specified.
- **1.4.12 Text Spacing (AA):** the layout must survive user-injected line-height 1.5×, paragraph spacing 2×, letter-spacing 0.12em, word-spacing 0.16em. Fixed-height containers with text inside are the usual failure.

### 9.4 Target Size and Pointers

WCAG 2.2's **2.5.8 (AA)** requires **24×24 CSS px** targets or sufficient spacing; the older **2.5.5 (AAA)** asks for 44×44. The target can exceed the visual — padding or a pseudo-element expanding the hit area both count:

```css
.icon-button {
  position: relative;
  /* visual can stay 16px; the hit area doesn't have to */
}
.icon-button::after {
  content: ''; position: absolute; inset: -6px;   /* 16 + 12 = 28px hit area */
}
```

And **2.5.7 Dragging Movements (AA)**: anything drag-only needs a single-pointer alternative. Sliders get arrow keys for free; a drag-and-drop board needs an explicit "Move to…" action.

---

## 10. Live Regions and Dynamic Content

A screen reader reads the page as it was when focus arrived. Content that changes elsewhere is **silent** unless you announce it — which is the core accessibility problem of every SPA.

```html
<!-- Announced when content changes, without moving focus -->
<div aria-live="polite" aria-atomic="true">3 results found</div>

<!-- Interrupts immediately — for errors and time-critical info only -->
<div role="alert">Payment failed</div>

<!-- Progress / status -->
<div role="status">Saving…</div>
```

- **`polite`** waits for a pause. Use it for almost everything.
- **`assertive`** interrupts whatever is being read. Reserve it for genuine errors — overuse makes a page unusable.
- **`role="alert"`** is `aria-live="assertive"` plus `aria-atomic="true"`; **`role="status"`** is `polite` plus `atomic`.

**The rule that makes live regions actually work: the container must exist in the DOM, empty, before you put content in it.** Adding an element that already has `aria-live` and text does not reliably announce, because the screen reader registers live regions when they're inserted and then watches them for changes. Render the empty region in your layout, then write into it.

```jsx
// A reusable announcer — mount once at the app root
function Announcer({ message }) {
  return <div aria-live="polite" className="sr-only">{message}</div>;
}
```

**SPA route changes** are the classic failure: the URL and DOM change, focus stays on the clicked link, and a screen-reader user has no idea anything happened. The fix is both halves:

```jsx
useEffect(() => {
  document.title = `${pageTitle} — Acme`;   // announced by some SR/browser pairs
  headingRef.current?.focus();              // move focus to the new <h1 tabindex="-1">
  announce(`${pageTitle} loaded`);          // and announce it explicitly
}, [pathname]);
```

Other things that need announcing: search results updating, an item added to a cart, a toast, a form's async validation result, an infinite-scroll page load ("20 more results loaded"), and an optimistic update failing and rolling back.

`aria-atomic="true"` reads the whole region on change; `false` (the default) reads only the changed part — which for a log-style region is what you want, and for a "3 results found" counter is not.


---

## 11. Component Patterns

The ARIA Authoring Practices Guide (APG) is the reference for all of these. What follows is the interview-relevant summary of each — the role structure, the keyboard contract, and the thing people get wrong.

### 11.1 Modal Dialog

```html
<dialog id="confirm" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Delete project?</h2>
  <p>This cannot be undone.</p>
  <button value="cancel">Cancel</button>
  <button value="delete">Delete</button>
</dialog>
```

Use `<dialog>` + `showModal()`. Free: top layer (no `z-index` or `overflow` clipping), real focus trap, Escape to close, `inert` on the rest of the page, `::backdrop`. **You still must** return focus to the opener on close and lock background scroll (`body:has(dialog[open]) { overflow: hidden; }`).

### 11.2 Tabs

One tab stop for the whole tablist, arrows to move within it — the **roving tabindex** pattern.

```html
<div role="tablist" aria-label="Settings">
  <button role="tab" aria-selected="true"  aria-controls="p1" id="t1" tabindex="0">General</button>
  <button role="tab" aria-selected="false" aria-controls="p2" id="t2" tabindex="-1">Billing</button>
</div>
<div role="tabpanel" id="p1" aria-labelledby="t1" tabindex="0">…</div>
<div role="tabpanel" id="p2" aria-labelledby="t2" hidden>…</div>
```

Keyboard: Left/Right (or Up/Down for vertical) between tabs, Home/End to first/last. **The mistake** is making every tab individually tabbable — nine tabs then costs nine Tab presses to get past.

### 11.3 Accordion / Disclosure

```html
<h3><button aria-expanded="false" aria-controls="sec1">Billing</button></h3>
<div id="sec1" hidden>…</div>
```

Unlike tabs, each trigger **is** a normal tab stop — an accordion is a set of independent disclosures, not a composite widget. The trigger must be a real `<button>` wrapped in the appropriate heading, and `aria-expanded` must track state.

**The animation trap:** `height: 0` alone leaves the content focusable and in the accessibility tree, so a keyboard user tabs into an invisible panel. Use `hidden`, `display: none`, or `content-visibility: hidden` when closed. `<details>`/`<summary>` gives you the whole pattern natively.

### 11.4 Combobox / Autocomplete

The hardest common pattern, and the one most often built wrong.

```html
<label for="city">City</label>
<input id="city" role="combobox" aria-expanded="true" aria-controls="city-list"
       aria-autocomplete="list" aria-activedescendant="opt-2" autocomplete="off">
<ul id="city-list" role="listbox">
  <li role="option" id="opt-1">London</li>
  <li role="option" id="opt-2" aria-selected="true">Lisbon</li>
</ul>
```

The critical mechanism is **`aria-activedescendant`**: DOM focus stays in the input (so typing keeps working) while the *virtual* focus moves through the options. Moving real DOM focus to the options breaks typing.

Keyboard: Down opens/moves, Up moves, Enter selects, Escape closes then clears, Tab closes and accepts. Announce the result count in a live region. Prefer `<datalist>` or a well-tested library (React Aria, Radix, Headless UI) — this pattern has a lot of edge cases and rebuilding it in an interview is usually the wrong call unless asked.

### 11.5 Toast / Notification

`role="status"` for informational, `role="alert"` for errors. The container must be in the DOM before the message. Don't auto-dismiss critical information — WCAG 2.2.1 requires the user be able to turn off, adjust or extend a timing constraint. And don't move focus to a toast the user didn't ask for; if a toast has an action, it must be reachable another way too.

### 11.6 Data Table

```html
<table>
  <caption>Q3 revenue by region</caption>
  <thead><tr><th scope="col">Region</th><th scope="col">Revenue</th></tr></thead>
  <tbody><tr><th scope="row">EMEA</th><td>£2.1m</td></tr></tbody>
</table>
```

`<caption>` names the table, `scope` associates headers to cells so a screen reader announces "EMEA, Revenue, £2.1m" when navigating. **Sortable columns** need `aria-sort="ascending|descending|none"` on the `<th>` and a button inside it. Don't use a `div` grid unless you implement `role="grid"` fully — and if you do virtualise rows, `aria-rowcount`/`aria-rowindex` tell the user the real total.

### 11.7 Menu

`role="menu"`/`menuitem` is for **application menus** (like a desktop app's menu bar), not for site navigation. A nav dropdown should be a `<nav>` with a `<ul>` of links plus a `aria-expanded` disclosure button — using `role="menu"` there puts screen readers into application mode and makes ordinary link behaviour feel broken. This distinction is a favourite interview question.

---

## 12. Accessibility in React

React's model creates a few specific hazards and offers a few specific tools.

**`useId` for label association.** Hard-coded IDs collide when a component renders twice; `useId` is SSR-safe and stable across hydration:

```jsx
function Field({ label, error }) {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-describedby={error ? `${id}-err` : undefined} aria-invalid={!!error} />
      {error && <p id={`${id}-err`} role="alert">{error}</p>}
    </>
  );
}
```

**Attribute naming:** `className`, `htmlFor`, and `onChange` firing on every keystroke — but ARIA attributes keep their hyphens (`aria-label`, `aria-expanded`, `data-*`). Passing `ariaLabel` silently does nothing, which is a common bug.

**Focus management needs refs and effects**, and the cleanup is where the bug usually is — return focus to the opener in the effect's cleanup, not in the close handler, so it also runs on unmount.

**`<Fragment>` and semantics:** wrapping table rows or list items in a `div` for convenience breaks the required parent-child relationships that screen readers depend on (`<ul>` must contain `<li>`, `<tr>` must be in a `<tbody>`). Use fragments.

**Portals keep the React tree but move the DOM node**, so focus order follows the *DOM*, not the component hierarchy. A portalled dropdown rendered to `document.body` is at the end of the tab order regardless of where its trigger sits — which is why the top layer (`<dialog>`, `popover`) plus explicit focus management is the safer pattern.

**Conditional rendering vs `hidden`:** `{open && <Panel/>}` removes the content entirely (good — nothing focusable left behind), whereas CSS-hiding leaves it reachable. React 19.2's `<Activity mode="hidden">` preserves state while destroying effects, but it hides with `display: none`, which correctly removes content from the accessibility tree.

**Announce route changes.** React Router and TanStack Router change the DOM without a page load, so nothing is announced. Move focus to the new `<h1 tabindex="-1">`, update `document.title`, and write to a live region (§10).

**Libraries worth naming:** **React Aria** (Adobe) and **Radix UI** give you correct, unstyled, accessible primitives for exactly the hard patterns in §11 — the honest interview answer to "would you build a combobox from scratch?" is usually "no, I'd use one of these and style it," because the edge cases are numerous and already solved. **`eslint-plugin-jsx-a11y`** catches a meaningful class of static mistakes in CI and costs nothing to add.

---

## 13. Testing

The single most important number: **automated tools catch roughly 30–40% of WCAG issues.** They find missing alt text, contrast failures, invalid ARIA and missing labels. They cannot tell you whether your alt text is *meaningful*, whether focus order makes sense, whether an error message is *helpful*, or whether the whole flow is usable. A green axe report is a floor, not a pass — and saying this unprompted is one of the strongest signals in an accessibility interview.

### 13.1 The Layers

| Layer | Tool | Catches |
|---|---|---|
| **Lint** | `eslint-plugin-jsx-a11y` | static JSX mistakes, at authoring time |
| **Unit / component** | `jest-axe` / `vitest-axe` + Testing Library | per-component violations, in CI |
| **E2E** | `@axe-core/playwright`, Cypress-axe | violations on real, interactive pages |
| **Browser** | axe DevTools, Lighthouse, WAVE, ARC Toolkit | ad-hoc audits during development |
| **Manual keyboard** | your keyboard | focus order, traps, visible focus, all functionality reachable |
| **Manual screen reader** | NVDA + Firefox, VoiceOver + Safari | names, roles, states, announcements, whether it makes sense |
| **Zoom / reflow** | browser zoom to 200% and 400% | 1.4.4 and 1.4.10 |
| **User testing** | people who use AT daily | everything above misses |

```js
// Component-level, in CI
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('form has no violations', async () => {
  const { container } = render(<SignupForm />);
  expect(await axe(container)).toHaveNoViolations();
});
```

**Testing Library pushes you toward accessible markup**, which is a real side benefit worth mentioning: `getByRole('button', { name: 'Save' })` fails if the button has no accessible name, so writing queries the recommended way makes accessibility failures into test failures.

### 13.2 The Manual Pass That Catches Most Things

Five minutes, no tools:

1. **Tab through the whole page.** Can you reach everything? Can you see where you are? Does the order match the visuals? Can you get out of every component?
2. **Zoom to 200%,** then 400%. Does anything disappear, overlap or require horizontal scrolling?
3. **Turn on a screen reader** and navigate by heading, then by landmark. Does the structure make sense without the visual layout?
4. **Unplug the mouse** and complete your product's primary task end to end.
5. **Check one form's error state** — is the error announced, associated, and does it say how to fix the problem?

### 13.3 CI Strategy

Run axe on every component in unit tests and on critical flows in E2E, and **fail the build** on new violations. For an existing codebase with a backlog, snapshot the current violation count and fail only on *increases* — a ratchet, so you stop the bleeding without blocking every PR on historical debt. Add contrast checks over your design tokens (§9.1) so palette regressions are caught at the source rather than per component.

---

## 14. Interview Questions & Answers

### Beginner

---

**Q1: What is the first rule of ARIA, and why does it exist?**

**"Don't use ARIA."** If a native HTML element does the job, use it.

The reason is that ARIA changes **only what assistive technology reports.** It adds no behaviour, no keyboard handling, and no focusability. A native `<button>` gives you focusability, Enter and Space activation, the `button` role, disabled-state handling, form submission, and voice-control targeting — all already correct in every screen reader and browser combination. `<div role="button">` gives you the *word* "button" and nothing else, so you now owe `tabindex="0"`, an Enter handler, a Space handler (including preventing page scroll), and disabled semantics.

That gap is why **no ARIA is better than bad ARIA**: an unlabelled `div` is a missing feature, but a `div` with `role="button"` and no keyboard handling actively lies to the user, who now believes it will work.

The rest of the five rules follow from the same logic: don't override native semantics (wrap instead), every interactive ARIA control must be keyboard operable, never put `aria-hidden` or `role="presentation"` on something focusable (you'd create an element a screen reader can't see but a keyboard can reach), and every interactive element needs an accessible name.

---

**Q2: How do you make an image accessible?**

It depends on what the image *does*, which is the actual point of the question — there are four cases.

**Informative:** describe the information. `alt="Revenue grew from £2m in 2024 to £5m in 2026"`, not `alt="chart"`.

**Decorative:** `alt=""` — empty, but the attribute must be **present**. Omitting `alt` entirely makes some screen readers fall back to reading the filename, which is worse than nothing.

**Functional** (an image that is a link or button): describe the **action**, not the picture. A logo linking home is `alt="Acme home"`, not `alt="Acme logo"`.

**Complex** (charts, diagrams, infographics): a short `alt` for identification plus a long description — `aria-describedby` pointing at a visually-hidden data table, or a caption. The alt should carry the **insight**; the data should be available in text.

Extra credit: never start with "image of" (the role is already announced), keep informative alt reasonably concise, and remember `<figure>`/`<figcaption>` gives you a visible caption that's programmatically associated. For CSS background images used decoratively, nothing is needed — but a background image carrying meaning is a bug, because there's nowhere to put the alternative.

---

**Q3: What is a skip link and why do you need one?**

A link at the very top of the page that jumps past repeated navigation straight to the main content — required in practice by **2.4.1 Bypass Blocks**.

Without one, a keyboard or screen-reader user has to Tab through your entire header and navigation — often 20–40 stops — on **every single page** before reaching the content. That's the whole justification.

```html
<a href="#main" class="skip-link">Skip to main content</a>
…
<main id="main" tabindex="-1">
```

The implementation details are where it usually goes wrong: it must be the **first focusable element** in the DOM, visually hidden until focused, and **genuinely visible when focused** — a skip link hidden with `display: none` isn't focusable at all, and one that stays invisible on focus is useless to the sighted keyboard user it's meant to serve. The `tabindex="-1"` on the target makes focus actually move there in all browsers rather than only scrolling.

Landmarks (`<main>`, `<nav>`, `<header>`) complement it — screen-reader users often navigate by landmark instead — but they don't help a sighted keyboard-only user, so you need both.

---

### Intermediate

---

**Q4: A designer wants to remove all focus outlines because they look ugly. How do you respond?**

I'd agree with the problem and reject the solution, because there's a feature that solves exactly this.

The complaint is almost always about the ring appearing on **mouse click**, which does look untidy. `:focus-visible` fixes precisely that: the browser applies it on keyboard focus and omits it on mouse click, using its own heuristics.

```css
/* not this */
*:focus { outline: none; }

/* this */
:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
```

So the designer gets clean click states and keyboard users keep their indicator. If they want it to look *different*, that's a real conversation — we can style it to match the brand as long as it meets **1.4.11's 3:1 contrast** against the adjacent background, and `outline-offset` matters because a ring flush against a same-coloured border is invisible. Colour change alone isn't enough, since it's imperceptible to some colour-blind users.

Two things I'd add. Removing focus indicators is a **2.4.7 Focus Visible** failure at AA, which in an EAA-covered product is a compliance issue, not a style preference — that usually ends the debate faster than the usability argument. And WCAG 2.2 added **2.4.11 Focus Not Obscured**, so I'd also check the indicator isn't hidden behind our sticky header (`scroll-margin-top` on focusable elements), which is a bug we'd have regardless.

---

**Q5: How do you make an SPA route change accessible?**

Nothing is announced by default, and that's the core accessibility problem of client-side routing: the URL and DOM change, focus stays on the link the user just activated, and a screen-reader user has no idea the page changed. On a real page load the browser resets focus and announces the new document; a client-side navigation does neither.

Three things, all of them:

```jsx
useEffect(() => {
  document.title = `${pageTitle} — Acme`;   // 2.4.2 Page Titled; some SR/browser pairs announce it
  headingRef.current?.focus();              // <h1 tabindex="-1"> — resets the reading position
  announce(`${pageTitle} loaded`);          // explicit live-region announcement
}, [pathname]);
```

**Move focus** to the new `<h1>` (with `tabindex="-1"`) or to `<main>`. This is the important one, because it resets where the screen reader is reading from and where the next Tab goes — otherwise a keyboard user's next Tab continues from the old page's position.

**Update `document.title`**, which is also 2.4.2 and matters for tab switching and history.

**Announce it** via a live region that already exists in the DOM (see §10 — a region added *with* content doesn't reliably announce).

Two related cases worth volunteering: **scroll restoration** should be handled deliberately rather than left to the router's default, and **loading states** should be announced through `role="status"` rather than by stealing focus, since focus movement the user didn't initiate is disorienting. Also verify the browser Back button both navigates *and* announces — it's a commonly missed path.

---

**Q6: Build me an accessible custom dropdown/select. What do you need to handle?**

I'd start by pushing back on the premise, because that's the senior answer: if a native `<select>` will do, use it — it's correct on every platform, gives the right mobile UI for free, and needs zero maintenance. Custom selects exist for styling and rich option content, and that's a real requirement, but it should be a deliberate trade rather than a default.

If we do need a custom one, it's the **combobox** pattern from the APG, and the critical mechanism is `aria-activedescendant`:

```html
<label for="city">City</label>
<input id="city" role="combobox" aria-expanded="true" aria-controls="list"
       aria-autocomplete="list" aria-activedescendant="opt-2" autocomplete="off">
<ul id="list" role="listbox">
  <li role="option" id="opt-1">London</li>
  <li role="option" id="opt-2" aria-selected="true">Lisbon</li>
</ul>
```

**DOM focus stays in the input** while *virtual* focus moves through the options via `aria-activedescendant`. Moving real DOM focus onto the options breaks typing, which is the single most common implementation error.

The full contract: Down opens and moves, Up moves, Enter selects and closes, Escape closes (then clears on a second press), Tab closes and accepts, Home/End jump, and type-ahead matches. Plus `aria-expanded` on the input tracking open state, `aria-selected` on the active option, a live region announcing the result count ("6 results available"), a real `<label>`, click-outside and scroll-into-view for the active option, and touch behaviour.

Then the honest conclusion: this pattern has a long tail of edge cases across screen-reader and browser combinations, so in production I'd use **React Aria** or **Radix** and style it, rather than maintain my own. Being willing to say that is usually a better signal than reciting the implementation.

---

### Advanced

---

**Q7: You're joining a company with a large inaccessible product and a legal deadline. What's your plan?**

I'd treat it as a programme rather than a bug-fix sprint, in five phases.

**1. Establish the baseline and the target.** Target **WCAG 2.2 AA**, since that's what the EAA and EN 301 549 effectively reference. Then measure: automated scan across all key pages, plus a manual audit of the top revenue and legally-exposed flows — signup, checkout, account management. Crucially, get a real audit including **screen-reader testing**, because automation catches only 30–40% of issues and the remaining 60% is where the legal risk actually lives.

**2. Triage by impact, not by count.** A missing alt on a decorative icon and a keyboard trap in checkout are both "one violation." Prioritise: blockers first (anything that makes a task impossible — keyboard traps, unlabelled form controls in a purchase flow), then high-traffic flows, then breadth issues. Fixing 500 contrast violations while checkout remains keyboard-inoperable is optimising the wrong number.

**3. Fix at the design system, not per feature.** This is the highest-leverage decision. Fix `Button`, `Input`, `Modal`, `Select` and the focus-ring token **once**, and every product inherits it. I'd expect the design system to account for a large share of total violations, and it converts a per-team problem into one team's roadmap. This is also where accessibility becomes the path of least resistance instead of extra work.

**4. Stop the regression.** `eslint-plugin-jsx-a11y` in CI, `jest-axe` on components, `@axe-core/playwright` on critical flows, contrast checks over design tokens. For an existing backlog, **ratchet** — snapshot the current violation count and fail only on increases, so you stop the bleeding without blocking every PR on historical debt.

**5. Build the capability.** Accessibility acceptance criteria in the definition of done, a keyboard-and-screen-reader pass in code review for UI changes, training, and ideally paid testing with people who use assistive technology daily. Without this, everything above decays.

Two things I'd say to leadership. **Overlay widgets are not an option** — they've repeatedly lost in court, they can't fix semantics, they often break existing assistive technology, and they increase exposure rather than reducing it. And I'd publish an honest **accessibility statement** with known issues and a remediation timeline; that's required by several regimes and demonstrated good-faith progress materially changes the legal picture.

---

**Q8: What does WCAG 2.2 add, and which additions actually change how you build?**

Nine new success criteria and one removal. Three of them change real implementation work:

**2.5.8 Target Size (Minimum), AA — 24×24 CSS px.** A 16px icon button with no padding now fails. This is a design-system fix rather than a per-page one: make the default icon-button hit area ≥24×24. Worth knowing the target can exceed the visual — padding or a pseudo-element expanding the hit area both count — and that the older **2.5.5** at AAA is the 44×44 figure people often misquote as the AA requirement.

**2.5.7 Dragging Movements, AA.** Anything drag-only needs a single-pointer alternative. A slider already satisfies it via arrow keys; a drag-and-drop kanban needs an explicit "Move to…" action on each card. This is the criterion that most often forces a genuine **feature** addition rather than an attribute fix, so it belongs in planning rather than in a remediation pass.

**3.3.8 Accessible Authentication (Minimum), AA.** No cognitive function test without an alternative — which outlaws puzzle CAPTCHAs, transcribing a code from an image, and, notably, **blocking paste in an OTP or password field.** That last one is shipped constantly and breaks password managers too. Object recognition and personal-content identification are permitted exceptions; email-link and passkey flows satisfy it cleanly.

The other six: **2.4.11 Focus Not Obscured (Minimum)** at AA — tab through your own site with a sticky header and watch focus disappear underneath it; `scroll-margin-top` is usually the fix. **2.4.12** and **2.4.13** (focus obscuring and appearance) are AAA. **3.2.6 Consistent Help** and **3.3.7 Redundant Entry** are Level A and mostly about not re-asking for information — `autocomplete` attributes do a lot of the work.

**Removed: 4.1.1 Parsing**, as obsolete — modern parsers recover from malformed markup and AT works off the parsed DOM. Worth adding the caveat: duplicate IDs are still bugs, because they break `aria-labelledby` and `for`/`id` association; they're just no longer a 4.1.1 failure.

And if asked about **WCAG 3.0**: it's a working draft with a different outcome-and-scoring model, years from being a legal reference. Targeting 2.2 AA while watching 3.0 is the correct position; claiming to build to 3.0 today signals you haven't read it.


---

## 15. Tricky Questions

---

**Q1: The audit says this button has no accessible name. It clearly has text. Why?**

```html
<button aria-labelledby="tooltip-9">
  <svg aria-hidden="true">…</svg>
  Save
</button>
```

**Answer:** `aria-labelledby` wins over everything, and it points at an ID that doesn't exist (or was removed) — so the name computation returns empty rather than falling through to the text content.

**Explanation:**

The accessible name is computed from the **first** available source in a strict priority order:

```
aria-labelledby  →  aria-label  →  native label (<label>, alt)  →  text content  →  title
```

The critical property is that this is a **priority list, not a fallback chain**. Once `aria-labelledby` is present, the algorithm uses it and **does not** continue down the list if it produces nothing. A dangling ID reference gives you an empty name, and the visible text "Save" is never consulted.

This is a very common real bug, and it usually arrives one of three ways: a tooltip component that renders its label element conditionally, so the ID exists only while the tooltip is open; a component that generates IDs per render without `useId`, so the reference goes stale after re-render; or a copy-paste that kept the attribute but not the target.

It's also why **duplicate IDs are still bugs** even though WCAG 2.2 removed 4.1.1 Parsing — `aria-labelledby` resolves to the *first* match, so a duplicate can silently point at the wrong element.

The related version of the same trap, which is arguably worse because nothing looks broken:

```html
<!-- The name is now "Submit form". Voice control users saying "click Save" FAIL,
     and this violates 2.5.3 Label in Name. -->
<button aria-label="Submit form">Save</button>
```

`aria-label` overrode the visible text. The rule is that when you need more context, **extend rather than replace**:

```html
<button>Save <span class="sr-only">billing details</span></button>
```

Debug all of this in Chrome DevTools' **Accessibility** pane, which shows the computed name and which source produced it. That pane is the single most useful accessibility debugging tool, because it shows what the user actually receives rather than what you intended.

**Takeaway:** the accessible-name computation is a strict priority order, not a fallback chain — a present-but-broken `aria-labelledby` yields an empty name, and a working `aria-label` silently overrides visible text, breaking voice control and 2.5.3.

---

**Q2: Keyboard users report they can Tab into your closed accordion panel and focus disappears. `aria-expanded` is correct. What's wrong?**

```css
.panel { height: 0; overflow: hidden; transition: height 300ms; }
.panel.open { height: auto; }
```

**Answer:** `height: 0` and `overflow: hidden` hide content **visually only**. The content is still in the accessibility tree and still focusable, so Tab moves focus to a button nobody can see.

**Explanation:**

Only a specific set of mechanisms actually removes an element from the accessibility tree and the tab order:

| Hides visually | Removes from a11y tree & tab order |
|---|---|
| `height: 0; overflow: hidden` | ✗ |
| `opacity: 0` | ✗ |
| `clip-path: inset(50%)` | ✗ (this is how `.sr-only` works) |
| `transform: translateX(-9999px)` | ✗ |
| `visibility: hidden` | ✓ |
| `display: none` | ✓ |
| `hidden` attribute | ✓ |
| `content-visibility: hidden` | ✓ |
| `inert` (on an ancestor) | ✓ (focus only; still in tree) |

So the first four produce the worst possible state: **invisible but reachable.** A sighted keyboard user Tabs and focus vanishes — the focus ring is on an element clipped to zero height. A screen-reader user hears content that isn't on screen. This is the same failure mode as `aria-hidden` on a focusable element, arrived at from the other direction.

The fix is to combine the animation technique with real removal:

```css
.panel[hidden] { display: none; }        /* or content-visibility: hidden */
```

```jsx
<div id="p1" hidden={!open}>…</div>      {/* React: toggle the attribute */}
```

If you need the height animation *and* correct semantics, the modern options are `interpolate-size: allow-keywords` with `transition-behavior: allow-discrete` so `display` can participate in the transition, or the `grid-template-rows: 0fr → 1fr` technique, or simply conditional rendering (`{open && <Panel/>}`) which removes the content entirely and is what React makes easiest anyway.

The cleanest answer of all: **`<details>`/`<summary>`** gives you the whole disclosure pattern natively, with correct semantics, keyboard handling and hiding, for free.

**Takeaway:** `height: 0`, `opacity: 0` and off-screen positioning hide content visually but leave it focusable and in the accessibility tree — use `hidden`, `display: none`, `content-visibility: hidden`, or conditional rendering, or you ship invisible focus targets.

---

**Q3: Your toast component has `aria-live="polite"` and is never announced. The markup is correct. Why?**

```jsx
{toast && <div aria-live="polite">{toast.message}</div>}
```

**Answer:** The live region is inserted into the DOM *with* its content already present. Screen readers register live regions when they appear and then watch them for **subsequent** changes — so the initial content isn't a change and isn't announced.

**Explanation:**

A live region works by the accessibility layer observing mutations inside an element it already knows is live. The sequence has to be:

```
1. The empty region exists in the DOM       ← screen reader registers it as live
2. Content changes inside it                ← the change is announced
```

Conditionally rendering the whole element collapses those into one step. The screen reader sees a new node appear that happens to have `aria-live` on it, and in most implementations there's no "change" to report — the region and its content arrived together. Behaviour varies by screen reader and browser, which is why this bug is often reported as intermittent or "works in VoiceOver but not NVDA."

The fix is to mount a persistent, empty announcer at the app root and write into it:

```jsx
// Mounted once, always present, always empty until there's something to say
function Announcer({ message }) {
  return <div aria-live="polite" aria-atomic="true" className="sr-only">{message}</div>;
}
```

Now the region is registered at page load and every message is a genuine mutation.

Several related gotchas in the same family:

- **`role="alert"` is more reliable for this specific case**, because it's `assertive` + `atomic` and implementations tend to handle late-inserted alerts better. But reserve `assertive` for genuine errors — it interrupts whatever is being read, and overuse makes a page unusable.
- **Don't put `aria-live` on an element you also toggle with `hidden`/`display: none`.** A region that isn't in the tree isn't being watched, so you've recreated the same problem.
- **`aria-atomic`** matters: `true` re-reads the whole region on change (right for "3 results found"), `false` — the default — reads only the changed part (right for a log-style region).
- **Rapid successive updates get dropped or queued** unpredictably. Debounce, and don't announce every keystroke of an async validation.
- **`.sr-only` must not use `display: none`** — that removes it from the tree entirely. Use the clip-path implementation.

**Takeaway:** a live region must already exist, empty, in the DOM before you write to it — conditionally rendering the region together with its message means there's no mutation to announce, which is why the "works in one screen reader" toast bug is so common.

---

**Q4: Your tab component passes axe with zero violations, but keyboard users say the navigation is unusable. What did axe miss?**

**Answer:** Almost certainly that every tab is individually tabbable. axe validates roles, names and states — it cannot judge whether the keyboard *interaction model* matches the pattern.

**Explanation:**

```html
<!-- Passes axe: correct roles, names, aria-selected, aria-controls. Still wrong. -->
<div role="tablist">
  <button role="tab" aria-selected="true"  tabindex="0">General</button>
  <button role="tab" aria-selected="false" tabindex="0">Billing</button>
  <button role="tab" aria-selected="false" tabindex="0">Team</button>
  <!-- …9 tabs, 9 tab stops -->
</div>
```

A **composite widget** — tablist, menu, listbox, radio group, tree, grid — is **one tab stop**, with arrow keys moving *within* it. That's the ARIA APG contract, and it exists so a keyboard user can skip past a nine-item control with a single Tab instead of nine.

The correct implementation is **roving tabindex**: exactly one item has `tabindex="0"`, all others `tabindex="-1"`, and the arrow-key handler moves both DOM focus and the `0`.

```jsx
<button role="tab" tabindex={isActive ? 0 : -1} aria-selected={isActive} />
```

Plus Left/Right (or Up/Down when vertical), Home/End for first/last, and a decision about whether arrow keys activate the panel immediately (automatic activation, fine for cheap panels) or only move focus with Enter/Space to activate (manual activation, correct when the panel loads data).

**This is the general lesson, and the reason the question exists:** automated tools catch roughly **30–40%** of WCAG issues. They verify the things that are machine-checkable — is there a name, is the role valid, is the required state present, is contrast sufficient — and are structurally unable to assess:

- whether the keyboard interaction model matches the pattern (this bug)
- whether focus order matches visual order
- whether alt text is *meaningful* rather than merely present
- whether an error message tells you how to fix the problem
- whether the flow is actually completable with a screen reader
- whether a live region announcement arrives at a useful moment

So a clean axe report is a **floor, not a pass.** The five-minute manual pass catches most of what's left: Tab through the whole page, zoom to 400%, navigate by heading with a screen reader, unplug the mouse and complete the primary task.

**Takeaway:** axe validates roles, names, states and contrast but cannot evaluate interaction models — composite widgets (tablist, menu, listbox, radio group) must be a single tab stop with roving tabindex and arrow-key navigation, and only manual keyboard testing catches that.

---

**Q5: A "Filter" button opens a panel of checkboxes. You used `role="menu"` and `role="menuitem"`, and screen-reader users report the checkboxes don't work. Why?**

**Answer:** `role="menu"` puts screen readers into application mode with a menu interaction contract, and `menuitem` is not a checkbox — the checked state has nowhere to live and the expected keyboard behaviour is completely different.

**Explanation:**

Two separate mistakes compound here.

**First, `role="menu"` is the wrong role.** It means an **application menu** — a desktop-style menu bar with commands, like File/Edit/View. It carries a specific contract: it's a single tab stop, arrow keys move between items, Enter activates and **closes** the menu, and items are actions rather than persistent state. Applying it to a filter panel or to site navigation makes screen readers announce "menu" and switch into a mode where ordinary interaction feels broken. This is one of the most over-applied roles in web development — `role="menu"` for a nav dropdown is nearly always wrong.

**Second, `menuitem` cannot hold a checked state.** If you need checkboxes inside a menu-like structure, the correct roles are `menuitemcheckbox` or `menuitemradio`, with `aria-checked`. A bare `menuitem` with a nested `<input type="checkbox">` gives the screen reader contradictory information: the parent says "this is a command that will close the menu," the child says "this is a persistent toggle."

**What this should be** is a disclosure widget containing an ordinary group of checkboxes — no ARIA widget roles at all:

```html
<button aria-expanded="false" aria-controls="filters">Filter</button>
<div id="filters" hidden>
  <fieldset>
    <legend>Categories</legend>
    <label><input type="checkbox" name="cat" value="a"> Apparel</label>
    <label><input type="checkbox" name="cat" value="b"> Books</label>
  </fieldset>
</div>
```

Every element is native, so states, keyboard behaviour and announcements are all correct for free. The button gets `aria-expanded`; the panel is a normal region whose contents are normal tab stops. `<fieldset>`/`<legend>` gives the group a name, so a user hears "Categories, Apparel, checkbox, not checked" instead of four options with no question attached.

**The generalisable rule:** `role="menu"` is for application menus, not for navigation dropdowns or filter panels. Site navigation is a `<nav>` with a `<ul>` of links plus an `aria-expanded` disclosure button. And whenever you reach for an ARIA widget role, check whether native elements plus `aria-expanded` would do the job — they almost always will, and they're correct everywhere.

**Takeaway:** `role="menu"`/`menuitem` means a desktop-style application menu with its own interaction contract and no support for persistent checked state — use `menuitemcheckbox` if you genuinely need a menu, but a disclosure button plus a native `<fieldset>` of checkboxes is almost always the right answer.

---

## 16. Cheat Sheet

```
LEGAL & STANDARDS
 1. Target WCAG 2.2 Level AA. AAA is not the compliance target.
 2. EU Accessibility Act (2019/882) enforceable since 28 June 2025.
    ADA Title II has explicit WCAG 2.1 AA deadlines. EN 301 549 v4.1.1 → WCAG 2.2.
 3. Overlay widgets don't work — legally or technically. They increase exposure.
 4. WCAG 3.0 is a draft with a different model. Years from being a legal reference.
 5. Structure: 4 principles (POUR) → 13 guidelines → 87 success criteria (2.2).

WCAG 2.2 NEW (9 added, 4.1.1 Parsing removed)
 6. 2.5.8 Target Size (AA) = 24×24 CSS px. (2.5.5 AAA is the 44×44 figure.)
 7. 2.5.7 Dragging Movements (AA) — drag-only needs a single-pointer alternative.
 8. 3.3.8 Accessible Authentication (AA) — no cognitive-function test.
    BLOCKING PASTE IN AN OTP FIELD IS A FAILURE.
 9. 2.4.11 Focus Not Obscured (AA) — sticky headers hiding focus. scroll-margin-top.
10. 3.3.7 Redundant Entry (A) + 3.2.6 Consistent Help (A). autocomplete does a lot.
11. Duplicate IDs are still bugs (they break aria-labelledby / for-id), just not 4.1.1.

SEMANTIC HTML
12. First rule of ARIA: don't use ARIA. Native elements bring role + keyboard +
    focus + state for free, already correct in every AT.
13. NO ARIA is better than BAD ARIA. div[role=button] with no keyboard handling lies.
14. One <h1>. Never skip heading levels downward. Headings are navigation, not sizes.
15. Landmarks (header/nav/main/aside/footer) are the primary SR navigation mechanism.
    Name repeated ones with aria-label.
16. Skip link: first focusable element, hidden until focus, VISIBLE on focus.
17. alt="" (present, empty) for decorative. Describe the ACTION for functional images.
    Omitting alt makes some SRs read the filename.
18. Reach for natives you're about to reimplement: <dialog>, <details>, popover,
    <fieldset>/<legend>, <table>/<caption>/<th scope>, <progress>, <datalist>.

ARIA
19. Name priority (a PRIORITY ORDER, not a fallback chain):
    aria-labelledby → aria-label → native label → text content → title.
20. A broken aria-labelledby ID = EMPTY name. It does not fall through to text.
21. aria-label OVERRIDES visible text → breaks voice control, fails 2.5.3 Label in Name.
    Extend with .sr-only text instead of replacing.
22. aria-label on a div with no role usually does NOTHING.
23. labelledby = what it is. describedby = extra detail (errors, hints).
24. An incomplete role is worse than no role: role=checkbox needs aria-checked,
    role=tab needs aria-selected.
25. Never aria-hidden or role=presentation on anything focusable.
26. aria-disabled keeps it focusable (user can discover WHY); disabled removes it
    from the tab order.
27. role="menu"/menuitem = desktop APPLICATION menu. Not nav dropdowns, not filters.

KEYBOARD & FOCUS
28. Only tabindex="0" and tabindex="-1". Positive values reorder the whole document.
29. Focus order must match VISUAL order — flex row-reverse / order / grid-area break
    this. Reorder the DOM, not the CSS.
30. :focus-visible, never outline: none. 3:1 contrast (1.4.11) + outline-offset.
31. Composite widgets (tablist, menu, listbox, radio group, tree, grid) are ONE tab
    stop → ROVING TABINDEX, arrows move within.
32. Modal opens → focus in. Modal closes → focus BACK TO THE OPENER (in effect cleanup).
33. Route change → focus the <h1 tabindex="-1"> + update title + announce.
34. Async content loads → announce, do NOT steal focus.
35. Validation fails → focus first invalid field + error summary linking to each.
36. Use <dialog>.showModal() — real focus trap, Escape, inert page, top layer.
    You still add scroll lock and focus return.

HIDING — what actually removes from the a11y tree
37. Removes: display:none, visibility:hidden, [hidden], aria-hidden,
    content-visibility:hidden. inert removes from tab order only.
38. Does NOT remove: height:0, opacity:0, clip-path, off-screen transform.
    → these create INVISIBLE BUT FOCUSABLE, the worst state.
39. .sr-only = clip-path: inset(50%) + 1px size + absolute. Never display:none.

FORMS
40. Real <label for>. Placeholders are NOT labels — they vanish and fail contrast.
41. autocomplete is an accessibility feature (1.3.5 + 3.3.7). Use standard tokens.
42. <fieldset>/<legend> for radio/checkbox groups, or there's no question.
43. Errors: aria-describedby + role=alert + say how to FIX it, not "invalid".
44. Never colour alone for state. Never validate on every keystroke. NEVER block paste.

LIVE REGIONS
45. The empty region must exist in the DOM BEFORE you write to it. Mount one announcer
    at the app root.
46. polite for almost everything. assertive/role=alert for real errors only.
47. role=alert = assertive + atomic. role=status = polite + atomic.
48. aria-atomic=true re-reads the whole region; false (default) reads only the change.

COLOUR & VISUAL
49. 4.5:1 body text, 3:1 large (≥24px or ≥18.66px bold), 3:1 UI components AND
    focus indicators (1.4.11). Placeholder text counts as body text.
50. Never encode meaning in colour alone (1.4.1) — ~1 in 12 men has a CVD.
51. 200% text zoom (1.4.4), reflow at 320px / 400% zoom (1.4.10),
    survive user text spacing (1.4.12).
52. prefers-reduced-motion: remove MOVEMENT, keep opacity fades. WCAG 2.3.3.

REACT
53. useId for label/describedby association — SSR-safe, no collisions.
54. ARIA attributes keep their hyphens in JSX. ariaLabel silently does nothing.
55. Return focus in the effect CLEANUP, so it also runs on unmount.
56. Portals move the DOM node → tab order follows the DOM, not the component tree.
57. React Aria / Radix for the hard patterns (combobox, menu, dialog). Don't rebuild.
58. eslint-plugin-jsx-a11y in CI is free and catches a real class of mistakes.

TESTING
59. AUTOMATED TOOLS CATCH ~30-40%. A green axe report is a floor, not a pass.
60. Layers: eslint-plugin-jsx-a11y → jest-axe → @axe-core/playwright → manual
    keyboard → manual screen reader → real AT users.
61. Automation cannot judge: interaction models, focus order sanity, whether alt text
    is meaningful, whether errors are helpful, whether a flow is completable.
62. The 5-minute manual pass: Tab the whole page → zoom 400% → navigate by heading
    with a SR → unplug the mouse and do the primary task → check one error state.
63. Existing backlog? RATCHET — fail CI only on increases.
64. Test on more than one SR: NVDA+Firefox and VoiceOver+Safari differ on ARIA edges.
65. Fix at the DESIGN SYSTEM layer — one Button fix, every product inherits it.
```

---

## 17. References

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) — filterable list of all success criteria with techniques
- [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) — the nine new criteria and the 4.1.1 removal
- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/patterns/) — the reference implementation for every widget pattern
- [MDN — ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) — per-role and per-attribute reference
- [MDN — Accessible name computation](https://developer.mozilla.org/en-US/docs/Glossary/Accessible_name)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) — and their annual WebAIM Million report on real-world failures
- [The A11Y Project Checklist](https://www.a11yproject.com/checklist/) — a practical, human-readable audit checklist
- [axe DevTools](https://www.deque.com/axe/devtools/) — the browser extension and the engine behind `jest-axe` / `@axe-core/playwright`
- [React Aria](https://react-spectrum.adobe.com/react-aria/) — accessible unstyled hooks and components
- [Radix UI Primitives](https://www.radix-ui.com/primitives) — accessible unstyled React primitives
- [Inclusive Components](https://inclusive-components.design) — Heydon Pickering's pattern-by-pattern deep dives
- [European Accessibility Act overview](https://ec.europa.eu/social/main.jsp?catId=1202) — scope and obligations
- [WebAIM — Screen Reader User Survey](https://webaim.org/projects/screenreadersurvey/) — what assistive tech people actually use
