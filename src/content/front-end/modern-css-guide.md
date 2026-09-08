# Modern CSS — Complete Guide

CSS spent a decade being the thing frontend engineers apologised for not knowing properly. That stopped working around 2024, when the platform absorbed most of what we used preprocessors, utility frameworks and JavaScript for: component-level responsiveness, parent selection, specificity control, scoping, nesting, typed custom properties, perceptual colour, and animated page transitions.

The result is that CSS questions in interviews got *harder and more architectural*. "What is `float`?" became "how do you manage specificity across a design system consumed by five teams?" This guide covers the fundamentals that still get asked, and the modern features that are now expected.

---

## Table of Contents

- [1. Why CSS Is Back in Interviews](#1-why-css-is-back-in-interviews)
- [2. The Cascade, Specificity and Inheritance](#2-the-cascade-specificity-and-inheritance)
- [3. Cascade Layers](#3-cascade-layers)
- [4. Nesting and Scope — What Replaced BEM](#4-nesting-and-scope--what-replaced-bem)
- [5. Layout — Flexbox, Grid, Subgrid](#5-layout--flexbox-grid-subgrid)
- [6. Container Queries](#6-container-queries)
- [7. Modern Selectors](#7-modern-selectors)
- [8. Custom Properties and @property](#8-custom-properties-and-property)
- [9. Modern Colour](#9-modern-colour)
- [10. Fluid Sizing and Logical Properties](#10-fluid-sizing-and-logical-properties)
- [11. Stacking Contexts, Containing Blocks and z-index](#11-stacking-contexts-containing-blocks-and-z-index)
- [12. Anchor Positioning, popover and dialog](#12-anchor-positioning-popover-and-dialog)
- [13. View Transitions](#13-view-transitions)
- [14. Motion and prefers-reduced-motion](#14-motion-and-prefers-reduced-motion)
- [15. Styling Architecture in 2026](#15-styling-architecture-in-2026)
- [16. Performance](#16-performance)
- [17. Interview Questions & Answers](#17-interview-questions--answers)
- [18. Tricky Questions](#18-tricky-questions)
- [19. Cheat Sheet](#19-cheat-sheet)
- [20. References](#20-references)

---

## 1. Why CSS Is Back in Interviews

Three things changed at once.

**The platform caught up.** Container queries, `:has()`, cascade layers, native nesting, `@scope`, subgrid, OKLCH, `color-mix()`, `@property`, `clamp()`, logical properties, `popover` and same-document View Transitions all reached **Baseline** between roughly 2023 and 2026. Features that needed a JavaScript library or a preprocessor are now one declaration.

**That removed the reasons for the workarounds.** BEM existed because CSS had no scoping. CSS-in-JS existed largely for scoping and dynamic values. Sass existed for nesting and variables. Utility-first CSS partly existed to dodge the cascade. When the platform provides scoping, nesting, variables and specificity control, the *architectural* question — what do we actually need a tool for? — becomes a real interview question rather than a matter of taste.

**AI made the easy half free.** A model will write your flexbox centring. It will not decide your specificity strategy, tell you why a `position: fixed` element is clipped inside a transformed ancestor, or work out why your `100vh` layout breaks on iOS. Interviewers moved toward exactly those.

So the questions cluster into: **the cascade and specificity** (still the single most-asked area), **layout debugging** (why is this element the size it is?), **modern feature fluency** (do you know `:has()` and container queries exist, and when they're the wrong tool?), and **architecture** (how does styling scale across teams?).

---

## 2. The Cascade, Specificity and Inheritance

Most CSS bugs are cascade bugs, and most cascade bugs come from not knowing the order of the deciding factors. When two declarations conflict, the browser resolves them in this order — and it only moves to the next step on a tie:

```
1. Origin & importance   author !important > author > user-agent (roughly; see below)
2. Cascade layers        later @layer wins; unlayered author styles beat layered ones
3. Specificity           (id, class, type) compared left to right
4. Order of appearance   last one wins
```

**Specificity** is three numbers, not one score. `(id, class, type)`, compared component by component:

| Selector | Specificity |
|---|---|
| `*`, `:where(...)` | `0,0,0` |
| `div`, `::before` | `0,0,1` |
| `.card`, `[type="text"]`, `:hover` | `0,1,0` |
| `#main` | `1,0,0` |
| inline `style=""` | wins over all selectors |
| `!important` | separate origin — beats everything in the same origin |

The critical property: **it is not additive across columns.** `1,0,0` beats `0,99,0`. Eleven classes never beat one ID, which is the whole reason ID selectors are discouraged in shared stylesheets — they create a ceiling nobody can override without `!important`.

**Two special cases that get asked:**

- `:is()` and `:not()` take the specificity of their **most specific argument**. So `:is(#a, p)` is `1,0,0` — even when it matches a `p`. This surprises people.
- `:where()` always has **zero** specificity, whatever is inside it. That makes it the correct tool for library defaults you want consumers to override effortlessly.

```css
/* A design-system default a consumer can override with a single class */
:where(.button) { padding: 8px 16px; }   /* 0,0,0 — trivially overridable */

/* Same match, but now it fights back */
:is(.button) { padding: 8px 16px; }      /* 0,1,0 */
```

**Inheritance** is separate from the cascade and worth keeping distinct. Some properties inherit by default (`color`, `font-*`, `line-height`, `visibility`, `cursor`); most do not (`display`, `padding`, `border`, `background`). You can force either direction with `inherit`, `initial`, `unset` (inherit if inheritable, else initial), and `revert` (go back to what the previous origin said — usually the browser default).

The two nuances that come up:

- **An unset property isn't "no value" — it's the initial value**, which may be inherited from an ancestor instead. `all: unset` is a bigger hammer than people expect.
- **`!important` inverts inside layers.** In the *author* origin, `!important` declarations resolve in **reverse** layer order — so an `!important` in an earlier layer beats an `!important` in a later one. This is deliberate and is what makes `@layer` safe for third-party CSS.

---

## 3. Cascade Layers

`@layer` gives you explicit control over the cascade, independent of specificity and source order. Declare your layer order once, and everything in a later layer beats everything in an earlier one **regardless of how specific it is**.

```css
/* Declare the order up front — this single line is the whole architecture */
@layer reset, base, components, utilities;

@layer components {
  #sidebar .nav a.link { color: blue; }   /* specificity 1,2,2 */
}

@layer utilities {
  .text-red { color: red; }               /* specificity 0,1,0 — and it WINS */
}
```

This is the feature that solves the problem BEM, ITCSS and `!important` were all trying to solve. Specificity wars happen because a low-specificity utility can't override a high-specificity component rule; layers make the *intent* (utilities beat components) explicit instead of encoding it in selector gymnastics.

**The rules to know:**

- Order is set by the **first** `@layer` statement that names them. Declare all your layers at the top of your entry stylesheet so the order is never accidental.
- **Unlayered styles beat all layered styles.** This is the most surprising rule and the most useful one: anything not in a layer sits in an implicit final layer. It means you can adopt `@layer` incrementally — put a vendor stylesheet in a low layer and your existing unlayered CSS keeps winning.
- `!important` resolves in **reverse** layer order within the author origin (see §2).
- You can layer an import: `@import url("vendor.css") layer(vendor);` — which is the killer use case. A third-party stylesheet full of `#id` selectors becomes trivially overridable by your own unlayered or later-layered CSS.

```css
/* Tame a third-party stylesheet without touching it */
@layer vendor, app;
@import url("some-widget.css") layer(vendor);

@layer app {
  .widget { border-radius: 8px; }   /* wins over the vendor's #widget rule */
}
```

---

## 4. Nesting and Scope — What Replaced BEM

### 4.1 Native Nesting

```css
.card {
  padding: 1rem;

  & .title { font-weight: 600; }   /* & is optional before a simple selector */
  &:hover { border-color: currentColor; }
  &.is-featured { border-width: 2px; }

  @media (width >= 48rem) { padding: 2rem; }   /* at-rules nest too */
}
```

Two differences from Sass that trip people up:

- **No selector concatenation.** Sass's `&__title` → `.card__title` does not exist in CSS. `&` is a real selector reference, not string interpolation, so BEM-style composition has to be written out.
- **Nested selectors are implicitly wrapped in `:is()`**, which affects specificity. `& .title` behaves like `:is(.card) .title`, and since `:is()` takes its most specific argument, a nested rule under a compound selector list can be more specific than you'd guess.

### 4.2 `@scope`

`@scope` gives real CSS scoping with a **lower boundary** — the thing no methodology could do:

```css
@scope (.card) to (.card-content) {
  /* Applies inside .card, but STOPS at .card-content.
     Arbitrary user/CMS markup inside .card-content is untouched. */
  a { color: var(--card-link); }
  :scope { border: 1px solid; }   /* the scope root itself */
}
```

The "donut scope" (that `to (...)` lower boundary) is the genuinely new capability. It's the clean answer to "style this component's links, but not the links inside the rich-text region a user pasted in" — previously only solvable with fragile `:not()` chains.

### 4.3 So What Replaced BEM?

The honest answer is that **BEM solved scoping and specificity flatness, and the platform now solves both** — so the naming discipline is optional where it used to be load-bearing:

| BEM was doing | The platform now does |
|---|---|
| Scoping via unique names | `@scope`, or CSS Modules / Vue-SFC-style build-time scoping |
| Flat specificity (all `0,1,0`) | `@layer` for intent, `:where()` for zero-specificity defaults |
| Readable structure | native nesting |

What to say in an interview: BEM is still perfectly reasonable, and a large existing codebase should not be churned for fashion. But for new work, **`@layer` + native nesting + build-time scoping (CSS Modules) or `@scope`** expresses the same intent with less naming overhead — and crucially, `@layer` is the piece that solves the problem BEM *couldn't*: making a utility reliably beat a component without `!important`.

---

## 5. Layout — Flexbox, Grid, Subgrid

### 5.1 Choosing Between Them

The distinction that actually holds: **Flexbox distributes space along one axis and lets content size itself; Grid defines a two-dimensional structure that content fits into.** Or shorter — *Flexbox is content-driven, Grid is layout-driven.*

- **Flexbox** for a toolbar, a button row, a card's internal stack, anything where the number of items varies and you want them to size naturally.
- **Grid** for page structure, forms with aligned label/field columns, image galleries, anything where things must line up in **both** directions.

`gap` works in both (and in multi-column), which removed the last real reason to use margins for spacing between siblings.

### 5.2 The Flexbox Facts That Get Asked

```css
.item { flex: 1; }        /* = flex-grow:1  flex-shrink:1  flex-basis:0%  */
.item { flex: auto; }     /* = 1 1 auto  — grows from its content size    */
.item { flex: none; }     /* = 0 0 auto  — rigid                          */
```

`flex: 1` vs `flex: auto` is the classic question, and the difference is `flex-basis`. With `flex: 1` the basis is `0`, so items get **equal widths** regardless of content. With `flex: auto` the basis is the content size, so items get **equal extra space** on top of different starting widths.

**`min-width: auto` is the source of the most common flexbox bug.** A flex item won't shrink below its content's minimum size, so one long unbreakable string (a URL, a long word, or a nested `<pre>`) blows out the layout:

```css
.flex-child { min-width: 0; }        /* let it shrink */
.text { overflow-wrap: anywhere; }   /* and let the text break */
```

The same applies on the block axis with `min-height: 0`, which is what breaks scrollable flex children.

### 5.3 Grid Essentials

```css
.gallery {
  display: grid;
  /* Responsive with no media queries at all */
  grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
  gap: 1rem;
}
```

- **`auto-fill` vs `auto-fit`**: `auto-fill` keeps empty tracks; `auto-fit` collapses them, so the existing items stretch to fill the row. `auto-fit` is usually what you want; `auto-fill` is right when you want a stable column rhythm.
- **`minmax(min(260px, 100%), 1fr)`** — the `min()` guard prevents overflow when the container is narrower than 260px, which the naive `minmax(260px, 1fr)` does not.
- **`1fr` means "one fraction of the *leftover* space"**, and its minimum is `auto` — so a `1fr` track won't shrink below its content. Use `minmax(0, 1fr)` when you need it to. This is the Grid twin of the flexbox `min-width: auto` bug and causes the same overflow.
- **Named areas** are the most readable way to express page structure:

```css
.page {
  display: grid;
  grid-template-areas: "nav header" "nav main";
  grid-template-columns: 250px 1fr;
}
.sidebar { grid-area: nav; }
```

### 5.4 Subgrid

`subgrid` lets a nested grid **participate in its parent's tracks** instead of creating its own. It solves the alignment problem that previously required either JS measurement or flattening your markup:

```css
.cards { display: grid; grid-template-rows: auto 1fr auto; }

.card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;   /* title/body/footer align across ALL cards */
}
```

Without subgrid, each card's internal rows are independent, so card titles of different lengths push the bodies out of alignment. With it, every card's title row is the same height because they're the *same row*.


---

## 6. Container Queries

Media queries ask about the **viewport**. That is the wrong question for a component, because a card doesn't care how wide the window is — it cares how wide *its own slot* is. The same card in a sidebar and in a main column needs different layouts at the same viewport width, and media queries fundamentally cannot express that.

```css
.card-wrapper {
  container-type: inline-size;   /* opt in: query this element's inline size */
  container-name: card;          /* optional, for targeting a specific ancestor */
}

.card { display: block; }

@container card (width >= 400px) {
  .card { display: grid; grid-template-columns: 120px 1fr; }
}
```

**Why this is the most important CSS feature of the decade** for component authors: it makes a component genuinely portable. Drop it anywhere and it adapts to its context, with no props, no `ResizeObserver`, and no knowledge of the page it's on. It's what makes a design system component *actually* reusable rather than reusable-with-a-`variant`-prop.

**The rules and gotchas:**

- **`container-type: inline-size` applies size containment on the inline axis**, which means the element no longer sizes from its children's inline size in the normal way. It's cheap, but it isn't free.
- **`container-type: size`** queries both axes and requires containment on both — so the element needs an explicit height or it collapses. This is why `inline-size` is what you use 95% of the time.
- **You cannot query the container you're styling.** The query targets the nearest ancestor container, so a component needs a wrapper. This surprises everyone once.
- **Container query units** — `cqi` (inline), `cqb` (block), `cqw`, `cqh`, `cqmin`, `cqmax` — are relative to the container, so `font-size: clamp(1rem, 5cqi, 2rem)` gives you typography that scales to the component's width, not the viewport's.
- **Style queries** (`@container style(--variant: compact)`) query a custom property on the container, which is a clean way to pass a "mode" down through CSS without a class on every descendant.

The mental model to state: **media queries for page-level layout and device concerns (print, orientation, `prefers-*`), container queries for everything a component does.**

---

## 7. Modern Selectors

### 7.1 `:has()` — The Parent Selector

For twenty years CSS could only look down the tree. `:has()` looks sideways and up, which unlocks a surprising amount:

```css
/* A card that contains an image gets a different layout */
.card:has(img) { grid-template-rows: 200px auto; }

/* A form field with an invalid input — no JS, no class toggling */
.field:has(input:invalid) { border-color: red; }

/* A label whose checkbox is checked */
label:has(input:checked) { font-weight: 600; }

/* Quantity queries: 4+ children → a different layout */
.grid:has(> :nth-child(4)) { grid-template-columns: repeat(2, 1fr); }

/* The "previous sibling" selector we never had */
li:has(+ li:hover) { opacity: 0.5; }

/* Page-level state driven by a descendant — genuinely powerful */
body:has(dialog[open]) { overflow: hidden; }
```

That last one is worth dwelling on: it replaces a whole category of "add a class to `<body>` from JavaScript" code. The state already exists in the DOM; `:has()` lets CSS read it.

**Specificity:** `:has()` takes the specificity of its most specific argument, like `:is()`. So `.card:has(#x)` is `1,1,0`.

**Performance:** modern engines handle it well and it's Baseline, but it is not free — an unqualified, very broad `:has()` on a huge tree (`* :has(...)`) can cost. Qualify the left side (`.card:has(...)`, not `:has(...)`) and you'll never notice it.

### 7.2 `:is()`, `:where()` and Selector Lists

```css
/* Before: repetition, and one invalid selector kills the whole rule */
h1 a, h2 a, h3 a { color: inherit; }

/* After */
:is(h1, h2, h3) a { color: inherit; }
```

Beyond brevity there's a real behavioural difference: **`:is()` and `:where()` are forgiving selector lists.** One unsupported selector inside them doesn't invalidate the rule, whereas a single bad selector in a plain comma list drops the entire rule. That makes them useful for progressive enhancement.

Specificity, again, is the reason to choose between them: `:is()` takes its most specific argument; `:where()` is always `0,0,0`. Library defaults go in `:where()`.

### 7.3 The Rest Worth Knowing

```css
/* Nth-child of a filtered set — count only what matches */
li:nth-child(2 of .visible) { … }

/* Logical form of nth — reads better and supports even/odd offsets */
tr:nth-child(odd) { … }

/* Not, with a list (one selector, not a chain) */
button:not(.primary, .ghost) { … }

/* Range syntax in media and container queries — no more min-/max- */
@media (400px <= width <= 900px) { … }

/* Custom media-ish behaviour via a container style query */
@container style(--theme: dark) { … }
```

`:nth-child(n of S)` is the one people don't know exists, and it's the correct answer to "zebra-stripe only the visible rows" — where `:nth-child(odd)` counts hidden rows too and produces a broken pattern.

---

## 8. Custom Properties and `@property`

### 8.1 Custom Properties Are Not Sass Variables

```css
:root { --gap: 1rem; }
.tight { --gap: 0.5rem; }        /* re-declared per subtree — this is the point */
.stack { gap: var(--gap, 1rem); } /* second arg is the fallback */
```

The differences that matter:

- **They cascade and inherit at runtime.** A Sass variable is compiled away; a custom property is a live, inheritable value you can override on any element, read from JavaScript (`getComputedStyle`), and change with a class or a media query.
- **They can cross a shadow DOM boundary**, which makes them the standard way to theme web components.
- **They're the correct way to ship design tokens** — see the Frontend Architecture guide. Tokens as CSS variables cascade, cost no JavaScript, need no re-render, and are shared even between independently-deployed bundles on different component-library versions.

### 8.2 `@property` — Typed Custom Properties

An untyped custom property is a *string* to the browser, which is why you cannot animate one:

```css
/* Does NOT animate — --angle is just text, so there's nothing to interpolate */
:root { --angle: 0deg; }
```

`@property` registers a type, an initial value and whether it inherits — and then it animates:

```css
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@property --progress {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

.spinner {
  background: conic-gradient(from var(--angle), red, blue);
  transition: --angle 1s linear;   /* now interpolatable */
}
.spinner:hover { --angle: 360deg; }
```

Three payoffs beyond animation: `initial-value` means a typo no longer silently produces an invalid inherited value; type checking means `--gap: red` is rejected rather than breaking a `gap` declaration downstream; and `inherits: false` lets you build properties that are deliberately local, which is essential for component internals you don't want leaking into children.

Animated gradients, animated conic progress rings and smooth theme colour transitions all became possible in plain CSS because of this one at-rule.

---

## 9. Modern Colour

### 9.1 Why `hsl()` Wasn't Good Enough

HSL looks perceptually uniform and isn't. `hsl(60 100% 50%)` (yellow) and `hsl(240 100% 50%)` (blue) claim the same 50% lightness, but the yellow is dramatically brighter to a human eye. That's why a palette generated by rotating HSL hue at fixed lightness has inconsistent contrast, and why hover states generated with `lighten()` behave unpredictably across hues.

**OKLCH** is perceptually uniform: `oklch(L C H)` with lightness 0–1, chroma, hue in degrees. Equal `L` really does look equally light.

```css
:root {
  --brand:       oklch(0.62 0.19 264);
  --brand-hover: oklch(0.55 0.19 264);   /* just lower L — predictable everywhere */
  --brand-subtle: oklch(0.95 0.03 264);
}
```

This makes systematic palettes *actually* systematic — you can generate a 10-step ramp by stepping `L` and trust the contrast behaves. It also reaches colours sRGB can't express, for wide-gamut displays.

### 9.2 `color-mix()` and Relative Colour

```css
/* Mix in a colour space you choose */
.btn:hover { background: color-mix(in oklch, var(--brand), black 15%); }

/* Semi-transparent from a token, without needing the token as components */
.overlay { background: color-mix(in srgb, var(--brand) 20%, transparent); }

/* Relative colour syntax — derive from an existing colour */
.muted { color: oklch(from var(--brand) calc(l + 0.2) calc(c * 0.5) h); }
```

`color-mix()` is the native replacement for Sass's `darken()`/`lighten()`/`rgba($c, .2)`, and it's better because it works on *runtime* values — including a custom property whose value you don't know at build time. That's the thing a preprocessor structurally cannot do, and it's a strong point to make when asked "do we still need Sass?"

### 9.3 Wide Gamut, Safely

```css
.hero { background: #0055ff; }                     /* fallback */
@supports (color: color(display-p3 0 0 0)) {
  .hero { background: color(display-p3 0 0.33 1); } /* richer where supported */
}
```

Also worth knowing: `light-dark()` picks a value based on the used colour scheme, which removes a whole class of media-query duplication:

```css
:root { color-scheme: light dark; }
body { background: light-dark(white, #111); color: light-dark(#111, #eee); }
```

---

## 10. Fluid Sizing and Logical Properties

### 10.1 `clamp()` and Fluid Type

```css
/* min, preferred (fluid), max — one declaration replaces three media queries */
h1 { font-size: clamp(1.75rem, 1rem + 3vw, 3.5rem); }
.container { width: clamp(20rem, 90vw, 75rem); }
```

The **accessibility rule that gets asked**: the preferred value must include a `rem`-based term, not be pure `vw`. `font-size: clamp(1rem, 4vw, 2rem)` fails WCAG 1.4.4 (Resize Text) because a pure viewport unit ignores the user's browser font-size setting entirely — zooming text does nothing. Mixing `rem + vw` keeps user preference in the equation.

Prefer `cqi` over `vw` inside a component, so it scales to its container rather than the window.

### 10.2 The Viewport Unit Family

`vh` is the classic mobile bug: on iOS Safari `100vh` is the *largest* viewport (toolbar hidden), so a `100vh` element is taller than the visible area and content sits under the toolbar.

```css
.hero {
  height: 100vh;   /* fallback for old browsers */
  height: 100dvh;  /* dynamic — tracks the toolbar as it shows/hides */
}
```

- `svh` — **s**mallest viewport (toolbars shown). Safe, never clipped, may leave a gap.
- `lvh` — **l**argest viewport (toolbars hidden). What `vh` effectively is.
- `dvh` — **d**ynamic, changes as the UI does. Usually what you want, but be aware it can cause layout shift *while* the toolbar animates, so for a full-screen app shell `svh` is sometimes calmer.

### 10.3 Logical Properties

```css
/* Physical — breaks in RTL */
.card { margin-left: 1rem; padding-right: 2rem; text-align: left; border-left: 2px solid; }

/* Logical — flips automatically with direction and writing-mode */
.card { margin-inline-start: 1rem; padding-inline-end: 2rem; text-align: start; border-inline-start: 2px solid; }
```

The mapping: `inline` is the text-flow axis (horizontal in English), `block` is perpendicular. So `margin-inline` sets both left and right in LTR, `padding-block` sets top and bottom, and `inset-inline-start` replaces `left`.

If your product ships Arabic or Hebrew, this isn't a nicety — it's the difference between one stylesheet and a parallel RTL stylesheet that drifts. Worth defaulting to logical properties even in a single-language product, because retrofitting is far more expensive than starting that way.

---

## 11. Stacking Contexts, Containing Blocks and z-index

This is the single most common "why is my CSS doing that?" category, and the answer is nearly always that some ancestor created a context the developer didn't know about.

### 11.1 `z-index` Only Works Within a Stacking Context

`z-index: 9999` on a modal loses to a sibling with `z-index: 1` if the modal is inside an ancestor stacking context that is itself below that sibling. **Children can never escape their parent's stacking context** — the parent's z-index positions the whole subtree as one unit.

Things that create a stacking context (an incomplete but practical list):

- `position: relative | absolute` **with a `z-index` other than `auto`**
- `position: fixed` or `sticky` (always, no z-index needed)
- any non-`none` `transform`, `filter`, `perspective`, `clip-path`, `mask`
- `opacity` less than 1
- `will-change` naming any of the above
- `isolation: isolate`
- `contain: paint | layout | content`, and `container-type`
- a flex or grid **item** with a `z-index` other than `auto`

`opacity: 0.99` creating a stacking context is a genuinely notorious one.

**The fix is `isolation: isolate`.** Rather than escalating z-index numbers, deliberately create a stacking context on each independent component root so its internal z-indexes are local and can't collide with anything outside:

```css
.card { isolation: isolate; }   /* internal z-index 1..10 is now private */
```

And for modals, the real answer is to **render outside the offending subtree** — a portal to `document.body`, or better, use `<dialog>` / the `popover` attribute, which render in the **top layer** and sidestep stacking contexts entirely (§12).

### 11.2 Containing Blocks

`position: fixed` is famously "relative to the viewport" — except when it isn't. **Any ancestor with a `transform`, `filter`, `perspective`, `will-change` of those, or `contain: paint | layout` becomes the containing block for fixed descendants.** So a `position: fixed` modal inside a card that has `transform: translateZ(0)` for "performance" is fixed *to the card*, and it will be clipped and scroll with it.

This is the bug behind a large share of "my dropdown is cut off" and "my sticky header isn't sticky" reports. Same root cause for `position: sticky` failing: it sticks within its **nearest scrolling ancestor**, and an ancestor with `overflow: hidden | auto` silently becomes that scroll container.

The diagnostic to state in an interview: when `fixed`/`sticky`/`z-index` misbehaves, **walk up the ancestor chain in DevTools looking for `transform`, `filter`, `opacity`, `overflow` and `contain`** — the culprit is almost always an ancestor, not the element you're debugging.

---

## 12. Anchor Positioning, `popover` and `<dialog>`

Three features that together delete a category of JavaScript.

### 12.1 The `popover` Attribute

```html
<button popovertarget="menu">Open</button>
<div id="menu" popover>…</div>
```

For free, with no JavaScript: **top-layer rendering** (immune to `z-index` and `overflow: hidden`), **light dismiss** (click outside or press Escape), automatic focus management, and correct `aria-expanded` wiring on the invoker. `popover="manual"` opts out of light dismiss for things like toasts.

`::backdrop` styles the layer behind it, and `:popover-open` styles the open state.

### 12.2 `<dialog>`

```html
<dialog id="confirm">
  <form method="dialog"><button value="ok">OK</button></form>
</dialog>
<script>confirm.showModal();</script>
```

`showModal()` gives you the top layer, a **focus trap**, Escape-to-close, `inert` on the rest of the page, and `::backdrop`. Building all of that correctly by hand is genuinely hard — focus trapping in particular is where hand-rolled modals fail accessibility audits — so "use `<dialog>`" is the right answer to "how would you build an accessible modal?", with the caveat that you should still verify focus return and scroll locking.

Note the distinction interviewers probe: **`popover` is non-modal** (the page stays interactive) and is for menus, tooltips and disclosure; **`dialog.showModal()` is modal** (the page is inert) and is for confirmations and blocking flows. Using a modal dialog for a dropdown is a UX bug, not just an implementation detail.

### 12.3 CSS Anchor Positioning

Tethering a popover to its trigger — keeping it aligned, flipping it when it would overflow the viewport — was the entire reason libraries like Popper and Floating UI existed. It's now CSS:

```css
.trigger { anchor-name: --menu-trigger; }

.menu {
  position: fixed;
  position-anchor: --menu-trigger;
  position-area: block-end span-inline-end;   /* below, aligned to the start edge */
  position-try-fallbacks: block-start span-inline-end, inline-end;  /* flip if it won't fit */
  margin-block-start: 0.5rem;
}
```

`position-area` places the element in a 3×3 grid around the anchor; `position-try-fallbacks` lists alternative placements the browser tries when the preferred one would overflow. That's the auto-flipping behaviour Floating UI computes in JavaScript, done by the compositor.

**Support caveat worth stating honestly:** anchor positioning reached Baseline through Chromium and Safari, with Firefox shipping it more recently than the rest — so verify against your support matrix before deleting your JS fallback. The graceful pattern is `@supports (anchor-name: --x)` with the library as the fallback path, which lets you adopt it without a flag day.


---

## 13. View Transitions

### 13.1 Same-Document (SPA)

```js
// The browser snapshots the "before" state, runs your callback, snapshots "after",
// then cross-fades between them — for the whole page by default.
document.startViewTransition(() => {
  updateTheDOM();          // React: flushSync(() => setState(...))
});
```

To animate specific elements independently, give them a shared `view-transition-name` in both states:

```css
.hero-image { view-transition-name: hero; }   /* same name on both pages */

::view-transition-old(hero) { animation: fade-out 200ms; }
::view-transition-new(hero) { animation: fade-in 200ms; }
```

The element then *morphs* between its old and new position and size — the shared-element transition that used to require Framer Motion's layout animations.

**The rule that catches everyone: `view-transition-name` must be unique per snapshot.** Two elements with `view-transition-name: card` visible at once silently disables the whole transition. For a list, generate names (`view-transition-name: card-42`) — and note this is exactly why React's `useId` prefix changed from `:r:` to `_r_` in 19.2, since a colon is not a valid `view-transition-name`.

### 13.2 Cross-Document (MPA)

```css
@view-transition { navigation: auto; }   /* both pages must opt in */
```

Two lines of CSS give a multi-page app animated navigation with no framework at all — genuinely the highest impact-to-effort feature in modern CSS for server-rendered sites.

**Support:** cross-document transitions shipped in Chromium 126 and Safari 18.2; **Firefox has not shipped it in a stable release**. Same-document transitions are Baseline. Since the whole thing degrades to an instant navigation, this is safe to ship as a progressive enhancement — which is the right framing for the interview answer.

### 13.3 The React Answer

React's own `<ViewTransition>` component is **still Canary-only** — it is not in a stable release, despite a lot of 2026 writing implying otherwise. So today the correct answer to "how would you animate route transitions in React?" is:

- the **browser** API driven from your router (React Router and TanStack Router both have hooks for it), wrapping the navigation's DOM update in `startViewTransition`, or
- your framework's wrapper (Next.js), or
- a JS animation library if you need behaviour the platform doesn't give you.

Also always respect `prefers-reduced-motion` — a full-page morph is exactly the kind of motion that triggers vestibular discomfort:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) {
    animation: none !important;
  }
}
```

---

## 14. Motion and `prefers-reduced-motion`

### 14.1 Animate the Cheap Properties

Only `transform` and `opacity` can be animated entirely on the compositor, skipping layout and paint. Everything else costs a frame's worth of work per frame:

| Animating | Cost |
|---|---|
| `transform`, `opacity` | **compositor only** — cheap, 60fps achievable |
| `filter`, `backdrop-filter` | paint (compositor-accelerated in modern engines, but expensive) |
| `color`, `background-color`, `box-shadow` | **paint** every frame |
| `width`, `height`, `top`, `margin`, `padding` | **layout** every frame — worst case |

The standard trick for animating layout-affecting change is **FLIP** — measure First and Last positions, apply an inverted `transform`, then Play by transitioning the transform to zero. `startViewTransition` (§13) now does this for you, which is the better answer where it's available.

`will-change: transform` promotes an element to its own layer, but it costs memory and creates a stacking context (§11) — add it just before an animation and remove it after, never leave it on permanently.

### 14.2 Animating to and from `auto`

Long-standing gap, now mostly solved:

```css
/* interpolate-size unlocks transitions to keyword sizes */
:root { interpolate-size: allow-keywords; }
.panel { height: 0; transition: height 300ms; }
.panel.open { height: auto; }

/* Or the grid technique, which works more widely today */
.panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 300ms; }
.panel.open { grid-template-rows: 1fr; }
```

Also relevant for entry/exit animations: `@starting-style` gives you an initial state to animate *from* when an element first renders (or exits `display: none`), and `transition-behavior: allow-discrete` lets `display` and `overlay` participate in a transition — which together make animating a `popover` or `<dialog>` open and closed possible in pure CSS.

### 14.3 `prefers-reduced-motion` Is Not Optional

This is WCAG 2.3.3 territory and a common accessibility-audit failure. The correct implementation is **not** "turn off all animation" — that can break UI that depends on a transition to communicate state. Reduce or replace instead:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The nuance to state: keep *opacity* fades (they don't cause vestibular problems), remove *movement* — parallax, large translations, scaling, spinning, auto-playing carousels. The user preference is specifically about motion, not about feedback.

---

## 15. Styling Architecture in 2026

The question "Tailwind or CSS Modules or CSS-in-JS?" is a proxy for "do you understand what each one is actually solving?"

| Approach | Solves | Costs |
|---|---|---|
| **Plain CSS + `@layer` + `@scope`** | zero deps, zero build, cascades properly | needs discipline and a documented layer order |
| **CSS Modules** | build-time scoping, plain CSS syntax, no runtime | no design constraints of its own; class-name indirection |
| **Tailwind** | design constraints, no naming, co-located styles, tiny output after purge | verbose markup, learning curve, escape hatches get ugly |
| **CSS-in-JS (runtime)** | dynamic values from props, colocation | **runtime cost, and it fights RSC/SSR** |
| **Zero-runtime CSS-in-JS** (vanilla-extract, Panda, Linaria) | type-safe tokens, extracted at build time | build complexity |

**The important shift:** runtime CSS-in-JS (styled-components, Emotion) is in decline, and the reason is architectural rather than fashionable. It needs to run JavaScript to produce styles, which conflicts with **React Server Components** — a Server Component has no client runtime to execute a styled-component's interpolation. That plus the per-render serialisation cost is why the ecosystem moved to build-time extraction. If asked, say that: it's a concrete technical reason, not a preference.

**What most teams pick now:** Tailwind (with tokens defined as CSS custom properties so they're shared beyond Tailwind) or CSS Modules, with `@layer` to govern the cascade in either case. Both work with RSC because neither needs a runtime.

**Do you still need Sass?** Mostly no, and it's worth being specific about why: nesting, variables and `color-mix()` are native, and `color-mix()` is *better* than `darken()` because it works on runtime custom-property values a preprocessor can't see. What Sass still gives you is `@mixin`, `@each`/`@for` loops and functions for generating rulesets at build time — real, but a narrow reason to keep a build step.

**The layer order to put in an interview answer**, because it demonstrates you've thought about scale:

```css
@layer reset, tokens, base, layout, components, utilities, overrides;
```

Third-party CSS gets imported into an early layer; utilities live late so they reliably win; `overrides` exists as the documented escape hatch so nobody reaches for `!important`.

---

## 16. Performance

- **Critical CSS inline, the rest deferred.** Render-blocking CSS delays first paint, so inline what's needed above the fold and load the remainder asynchronously. Watch that this doesn't cause a flash of unstyled content.
- **`content-visibility: auto`** skips rendering work for off-screen subtrees — one of the largest single wins available for long pages. Pair it with `contain-intrinsic-size` to avoid scrollbar jumping.
- **`contain: layout | paint | content`** scopes layout and paint work to a subtree, so a change inside a card doesn't invalidate the whole page's layout.
- **Layout thrash is a JS problem CSS gets blamed for.** Reading `offsetHeight` after a write forces synchronous layout; batch all reads then all writes.
- **Fonts** are usually the biggest CSS-adjacent cost: `font-display: swap` (or `optional`), `preload` the one or two faces above the fold, subset aggressively, prefer variable fonts over eight static weights, and set `size-adjust`/fallback metrics to reduce CLS from the swap.
- **CLS discipline:** always give images and video `width`/`height` (or `aspect-ratio`) so space is reserved; reserve space for ads and embeds; never insert content above existing content.
- **Selector performance basically doesn't matter any more** — engines match right-to-left and are extremely fast. The exceptions are pathological cases: a huge unqualified `:has()`, or very deep descendant selectors applied across an enormous DOM. Stylesheet *size* and the number of elements matter far more than selector shape, and saying so signals you know where the real cost is.

---

## 17. Interview Questions & Answers

### Beginner

---

**Q1: Explain specificity. Why doesn't `!important` count as "very high specificity"?**

Specificity is a **three-part tuple** — `(id, class, type)` — compared component by component, left to right, not a single additive score. `#main` is `1,0,0` and beats `.a.b.c…` with ninety-nine classes (`0,99,0`), because the comparison never gets to the second column. That non-additivity is the whole reason ID selectors are discouraged in shared stylesheets: they create a ceiling nobody can override without escalating.

`!important` isn't specificity at all — it moves the declaration into a **different origin bucket**, and origin is checked *before* specificity in the cascade. The order the browser applies is: origin and importance → cascade layers → specificity → source order. So an `!important` author declaration beats every non-important author declaration regardless of selector, and specificity is only used to break ties *within* the same origin and layer.

Two follow-ups worth pre-empting: `:is()` and `:not()` take the specificity of their most specific argument (so `:is(#a, p)` is `1,0,0` even when matching a `p`), while `:where()` is always `0,0,0`, which makes it the right wrapper for library defaults you want consumers to override effortlessly. And inside the author origin, `!important` resolves in **reverse** cascade-layer order — which is deliberate, and is what makes `@layer` safe for taming third-party CSS.

---

**Q2: When would you use Flexbox and when Grid?**

**Flexbox distributes space along one axis and lets content size itself; Grid defines a two-dimensional structure that content fits into.** Shorter: Flexbox is content-driven, Grid is layout-driven.

Flexbox for a toolbar, a button row, a card's internal stack — anywhere the item count varies and you want natural sizing. Grid for page structure, aligned form columns, galleries, anything that must line up in **both** directions. `gap` works in both, which removed the last real reason to space siblings with margins.

The detail that shows depth is `flex: 1` versus `flex: auto`. Both are `grow:1 shrink:1`; they differ in `flex-basis`. `flex: 1` sets basis `0`, so items end up **equal width** regardless of content. `flex: auto` sets basis `auto`, so items keep their content size and share only the **extra** space. Picking the wrong one is the most common flexbox surprise.

I'd also mention the two overflow traps, because they're the same bug in both systems: a flex item won't shrink below its content's minimum (`min-width: auto`), and a `1fr` grid track won't either — so one long URL blows out the layout until you add `min-width: 0` or `minmax(0, 1fr)`.

---

**Q3: What are container queries and why are they better than media queries for components?**

Media queries ask about the **viewport**, which is the wrong question for a component. A card doesn't care how wide the window is — it cares how wide its own slot is. The same card in a 300px sidebar and an 900px main column needs different layouts at one viewport width, and media queries structurally cannot express that.

```css
.card-wrapper { container-type: inline-size; }
@container (width >= 400px) { .card { grid-template-columns: 120px 1fr; } }
```

The consequence is that a component becomes **genuinely portable** — drop it anywhere and it adapts, with no `variant` prop, no `ResizeObserver`, and no knowledge of the page. That's what makes a design-system component actually reusable.

Gotchas to name: you **cannot query the element you're styling**, so components need a wrapper; `container-type: inline-size` applies size containment on the inline axis, so it's cheap but not free; `container-type: size` needs an explicit height or the element collapses, which is why `inline-size` is what you use almost always. And container query units (`cqi`, `cqb`) let type and spacing scale to the container rather than the window.

The rule I'd state: **media queries for page-level and device concerns (print, orientation, `prefers-*`); container queries for everything a component does.**

---

### Intermediate

---

**Q4: Lay out five divs in a row — no flexbox, no grid, no margin, no padding. How, and what breaks?**

A constrained-tools question. The point isn't nostalgia for pre-flexbox CSS; it's whether you actually understand the **display** property rather than reaching for `flex` reflexively.

```css
.item { display: inline-block; width: 20%; }
```

`div` is `display: block` by default, which is why five of them stack. `inline-block` makes each participate in inline layout — so they sit on a line — while keeping block behaviour internally (width, height and vertical padding all work, which plain `inline` ignores).

**And then the classic bug bites**, which is the real content of the question:

```html
<!-- Five 20% items = 100%… and they WRAP. Why? -->
<div class="row">
  <div class="item"></div>
  <div class="item"></div>
</div>
```

Because inline-block elements are **inline**, the whitespace between the tags in your HTML is rendered as a **real space character** — roughly 4px per gap at a typical font size. Five items at 20% plus four spaces exceeds 100%, so the last one drops to the next line. Interviewers love this because the CSS looks correct and the layout is broken by the *markup formatting*.

The fixes, and the trade-offs:

```css
/* 1. Kill the font on the parent, restore it on the children.
      Ugly, but the most reliable and it needs no markup changes. */
.row  { font-size: 0; }
.item { font-size: 1rem; display: inline-block; width: 20%; }
```

```html
<!-- 2. Remove the whitespace from the source. Correct, but fragile —
        a prettier run or a template rewrite reintroduces it. -->
<div class="item"></div><div class="item"></div>
```

Two other approaches worth naming, because they show range:

```css
/* display: table-cell — no whitespace problem at all, since table layout
   ignores inter-element whitespace. Equal widths come free. */
.row  { display: table; width: 100%; }
.item { display: table-cell; }

/* float: left — the pre-flexbox default. No gaps, but the parent
   collapses because floats are out of flow, so you need a clearfix. */
.item { float: left; width: 20%; }
.row::after { content: ""; display: table; clear: both; }
```

**What to say at the end:** in real code this is `display: flex` (or `grid` for equal columns), because none of the above have the gap problem, none need a clearfix, and `gap` gives you spacing without margins. The constraint exists to test the mechanism. It's also worth noting `inline-block` still has legitimate uses — inline badges and buttons inside flowing text, where you genuinely want the element to sit in a line of prose.

One more detail if they push: `inline-block` elements are baseline-aligned by default, so items with different content heights won't line up at the top. `vertical-align: top` fixes it, and that's another gap-class bug that looks like a CSS mystery until you know it.

---

**Q5: A modal with `z-index: 9999` renders behind a header with `z-index: 10`. Why, and how do you fix it properly?**

Because `z-index` only orders siblings **within the same stacking context**, and children can never escape their parent's. If the modal sits inside an ancestor that forms a stacking context which is itself painted below the header, no z-index on the modal can lift it out — the parent moves as one unit.

The list of things that create a stacking context is longer than most people expect: positioned elements with a non-`auto` `z-index`, any `position: fixed` or `sticky`, any non-`none` `transform`/`filter`/`perspective`/`clip-path`/`mask`, `opacity` < 1 (`opacity: 0.99` is notorious), `will-change` naming any of those, `isolation: isolate`, `contain: paint|layout|content`, and `container-type`.

The proper fixes, in order of preference:

1. **Render it in the top layer** — `<dialog>` with `showModal()`, or the `popover` attribute. The top layer is above the entire stacking-context tree, so the problem disappears rather than being managed. You also get light dismiss, focus trapping and `::backdrop` for free.
2. **Portal it out** of the offending subtree to `document.body`.
3. **`isolation: isolate` on component roots** so each component's internal z-indexes are private and can't collide — this is the systemic fix that stops the escalating-numbers war.

And the diagnostic habit: when `fixed`, `sticky` or `z-index` misbehaves, **walk up the ancestor chain in DevTools looking for `transform`, `filter`, `opacity`, `overflow` and `contain`.** The culprit is almost always an ancestor, not the element you're staring at.

---

**Q6: What problem do cascade layers solve, and how would you structure them?**

Specificity wars. The recurring pain is that a low-specificity utility (`.mt-0`, `0,1,0`) cannot override a high-specificity component rule (`#sidebar .nav a`, `1,2,2`), so people reach for `!important`, which then can only be beaten by another `!important`, and the cascade becomes unmanageable.

`@layer` makes the **intent** explicit and independent of specificity: everything in a later layer beats everything in an earlier one, however specific.

```css
@layer reset, tokens, base, layout, components, utilities, overrides;
```

Utilities live late so they reliably win; `overrides` is a documented escape hatch so nobody needs `!important`.

The rules that matter: layer order is fixed by the **first** statement naming them, so declare it at the top of your entry stylesheet; **unlayered styles beat all layered styles**, which is what makes incremental adoption possible; and `!important` resolves in **reverse** layer order within the author origin.

The killer use case is third-party CSS: `@import url("widget.css") layer(vendor);` drops a stylesheet full of `#id` selectors into a low layer, and your own CSS overrides it trivially without touching their code or writing a single `!important`.

---

**Q7: Do you still need Sass, BEM, or CSS-in-JS? Justify your answer.**

Each solved a real gap that the platform has now closed, so the answer is specific per tool rather than a blanket yes or no.

**Sass** — nesting, variables and colour functions are native. And `color-mix()` is genuinely *better* than `darken()`, because it operates on **runtime** values including custom properties a preprocessor cannot see. What Sass still uniquely offers is `@mixin`, `@each`/`@for` loops and functions for generating rulesets at build time. Real, but a narrow reason to keep a build step.

**BEM** — it existed to provide scoping (via unique names) and specificity flatness. Both are now solved: `@scope` or build-time scoping (CSS Modules) for the first, `@layer` and `:where()` for the second. And `@layer` solves the thing BEM *couldn't* — making a utility reliably beat a component. That said, BEM is still perfectly reasonable and a large existing codebase should not be churned for fashion.

**Runtime CSS-in-JS** (styled-components, Emotion) — this one I'd argue against on architectural grounds, not taste: it needs JavaScript to execute in order to produce styles, which conflicts directly with **React Server Components**, where there's no client runtime to evaluate the interpolation. Add the per-render serialisation cost and you get the reason the ecosystem moved to build-time extraction (vanilla-extract, Panda, Linaria) or away entirely.

**What I'd actually pick for new work:** Tailwind or CSS Modules — both zero-runtime and RSC-compatible — with design tokens as **CSS custom properties** rather than a JS object, so they cascade, cost no JavaScript, need no re-render, and can be shared across independently-deployed bundles. Plus a documented `@layer` order to govern the cascade.

---

### Advanced

---

**Q8: How do you build a themeable design system that supports dark mode, per-product branding, and works with web components?**

**CSS custom properties, as a token layer.** This is the decision everything else follows from, and the reasoning is worth stating: custom properties cascade and inherit at runtime, so theming becomes overriding a value on a container — no re-render, no context, no prop drilling, no JavaScript bundle cost. They also **pierce shadow DOM**, which is the standard mechanism for theming web components. And critically, tokens shipped as CSS can be shared between independently-deployed bundles on *different* component-library versions, which a JS token object cannot.

Structure it in three layers so that theming has one obvious seam:

```css
@layer tokens {
  :root {
    /* 1. primitives — raw values, never used directly by components */
    --blue-500: oklch(0.62 0.19 264);
    --gray-900: oklch(0.20 0.01 264);

    /* 2. semantic — what components actually reference */
    --color-action: var(--blue-500);
    --color-text: var(--gray-900);
    --color-surface: white;
  }

  /* 3. themes override only the semantic layer */
  :root { color-scheme: light dark; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --color-text: oklch(0.95 0.01 264);
      --color-surface: oklch(0.20 0.01 264);
    }
  }
  :root[data-theme="dark"] { /* same overrides, for the explicit toggle */ }

  /* per-product branding: override primitives on a container */
  [data-brand="acme"] { --color-action: oklch(0.58 0.21 20); }
}
```

The rules that make this hold up:

- **Components reference semantic tokens only.** A `Button` uses `--color-action`, never `--blue-500`. Otherwise rebranding means touching every component.
- **Support all three theme states**: explicit light, explicit dark, and system default. Define the full light palette on bare `:root`, redefine only what changes in a `prefers-color-scheme` block guarded so an explicit light choice wins, then again under an explicit dark attribute.
- **Use OKLCH for the primitives** so a generated ramp is perceptually even and contrast behaves predictably when you step lightness — the thing HSL gets wrong.
- **`color-scheme`** so form controls, scrollbars and the canvas follow the theme.
- **Theme switching must not flash.** Set the attribute in a blocking inline script in `<head>` before first paint, or you get a light flash on a dark-mode reload.
- **Contrast is a test, not a hope.** Automated contrast checks on every token pair in CI; a "nice" palette that fails 4.5:1 is a compliance defect (see the Accessibility guide).

---

**Q9: Walk me through debugging a layout that looks correct on desktop, breaks on mobile Safari, and has a visible content shift on load.**

Three separate problems; I'd separate them before touching anything, because conflating them is how you fix the wrong one.

**Mobile Safari specifically** — the first suspect is `100vh`. On iOS, `vh` resolves against the **largest** viewport (toolbars hidden), so a `100vh` element is taller than the visible area and content hides behind the toolbar. Fix: `height: 100dvh` with a `100vh` fallback, or `svh` if the toolbar's animation causes distracting reflow. Other Safari-specific suspects: `-webkit-fill-available`, `position: sticky` inside an `overflow: hidden` ancestor, flexbox `gap` in older versions, and `100%` height chains where an intermediate element has no height.

**The content shift** is a CLS problem, and it has a short list of causes: images and iframes with no `width`/`height` or `aspect-ratio` so no space is reserved; a **web font swapping** and re-flowing text at a different metric; content injected above existing content (a banner, a consent dialog); and lazily-loaded content without a reserved skeleton. Fixes in order: intrinsic dimensions or `aspect-ratio` on every media element, `font-display: swap` plus `preload` plus fallback-metric overrides (`size-adjust`, `ascent-override`) so the swap doesn't change layout, reserve space for anything injected, and use `contain-intrinsic-size` alongside `content-visibility`.

**The general method**, which is really what's being tested: reproduce on a real device or a simulator rather than a narrow desktop window, because the failures are engine-specific rather than width-specific. Then in DevTools, walk the ancestor chain for `transform`, `filter`, `overflow` and `contain` (the containing-block and stacking-context traps from §11); check computed values rather than authored ones; and toggle declarations to bisect. For CLS specifically, use the Performance panel's layout-shift regions to see *what* moved rather than guessing, and confirm with **field data** — a shift that only appears on slow connections won't reproduce locally at all, which is exactly why RUM matters.


---

**Q10: How do you ensure consistent rendering and layout across browsers and devices?**

Start by rejecting the goal as stated: **pixel-identical across every browser is neither achievable nor worth the cost.** The realistic target is that the layout is *correct and usable* everywhere and *visually equivalent* on your supported matrix. Saying that first is the answer — chasing identical rendering is how teams end up with a stack of hacks.

**1. Define the matrix, in code.** "Modern browsers" is not a specification. `browserslist` in `package.json` is, and it's read by Autoprefixer, Babel, Lightning CSS and your bundler, so one declaration drives the whole toolchain:

```json
"browserslist": ["> 0.5%", "last 2 versions", "Firefox ESR", "not dead"]
```

Derive it from **your analytics**, not from a default. Then check features against **Baseline** (webstatus.dev) rather than guessing — "Baseline newly available" versus "widely available" is exactly the distinction that tells you whether you still need a fallback.

**2. Neutralise the defaults you don't control.** A modern reset — `box-sizing: border-box` everywhere, zeroed margins, `img { max-width: 100% }`, consistent form-control inheritance. Form controls and `<select>` in particular are still styled inconsistently, which is why `appearance: none` plus your own styling is standard for them.

**3. Feature detection, not browser detection.** `@supports` in CSS and capability checks in JS. User-agent sniffing breaks on the next release and on every browser that spoofs:

```css
.card { display: block; }                          /* baseline that works everywhere */
@supports (container-type: inline-size) { … }      /* enhancement */
```

That ordering is **progressive enhancement**: write the version that works, then layer on. The inverse — building on the new feature and patching older browsers — leaves you unable to tell what's load-bearing.

**4. Prefer the things that are consistent by construction.** Flexbox and Grid behave far more predictably than floats and absolute positioning ever did. **Logical properties** (`margin-inline-start`) handle RTL without a parallel stylesheet. `clamp()` and container queries remove a class of breakpoint mismatch. CSS custom properties keep one source of truth for spacing and colour so drift can't creep in per-component.

**5. The device axis is a different problem from the browser axis**, and it's the one people underestimate:

- **`100vh` on iOS Safari** resolves against the *largest* viewport, so a full-height layout hides content behind the toolbar. `dvh`/`svh` is the fix (§10.2).
- **Touch targets** need 24×24 CSS px minimum (WCAG 2.5.8) — a mouse-designed 16px icon button fails on a phone.
- **`:hover` doesn't exist on touch**, and a hover-only affordance is invisible there. Guard with `@media (hover: hover)`.
- **Safe-area insets** for notches: `padding: env(safe-area-inset-bottom)`.
- **The software keyboard** resizes the viewport on Android and overlays it on iOS — different behaviour for the same layout.
- **Device pixel ratio** for images: `srcset` with `2x`/`3x` descriptors.
- **Low-end CPUs.** This is the biggest real inconsistency and it isn't a layout issue at all — a bundle that parses in 400ms on your laptop can take 2s on a cheap Android, so the *experience* differs even where the pixels don't.

**6. Verify it, don't hope.** Real devices where it matters, **BrowserStack/Sauce** or Playwright's Chromium/Firefox/**WebKit** engines in CI for the rest — Playwright bundling a real WebKit is the cheapest Safari coverage available. **Visual regression testing** (Chromium + WebKit screenshots per PR) is what actually catches drift, and it must run in a container with pinned fonts or you'll get diffs that aren't bugs. Plus zoom to 200% and 400%, and check `prefers-reduced-motion` and `prefers-color-scheme`.

**7. Where inconsistency is legitimate.** Native form controls, scrollbars, date pickers, focus rings and font rendering *should* look like the platform. Overriding all of them to match a design is a large maintenance cost, usually degrades accessibility, and users generally prefer the platform behaviour. Knowing which battles not to fight is part of the answer.

---
---

## 18. Tricky Questions

---

**Q1: What colour is the paragraph?**

```html
<div id="wrap"><p class="text">Hello</p></div>
```

```css
:is(#wrap) .text { color: red; }
:where(#wrap) .text { color: blue; }
.text { color: green; }
```

**Output:** `red`

**Explanation:**

The trap is assuming `:is()` and `:where()` behave the same because they match the same elements. They match identically and have **completely different specificity**.

- `:is(#wrap) .text` — `:is()` takes the specificity of its **most specific argument**, which is an ID. So this is `1,0,1`.
- `:where(#wrap) .text` — `:where()` is **always `0,0,0`**, whatever is inside it. Only `.text` counts: `0,1,1`.
- `.text` — `0,1,0`.

Sorting: `1,0,1` > `0,1,1` > `0,1,0`. Red wins, and it isn't close — remember specificity is compared **column by column, not summed**, so the single ID in column one settles it before the other columns are even considered.

The practical lesson is which one to reach for. `:where()` is the correct wrapper for **library and design-system defaults**, precisely because zero specificity means a consumer overrides it with a single class and never has to fight you:

```css
:where(.button) { padding: 8px 16px; }   /* 0,0,0 — consumer's .my-btn wins */
:is(.button)    { padding: 8px 16px; }   /* 0,1,0 — now it's a fight */
```

Two related facts that get asked as follow-ups. `:not()` also takes its most specific argument's specificity, so `:not(#x)` is `1,0,0` — surprisingly heavy. And **native CSS nesting implicitly wraps the parent in `:is()`**, which means a nested rule inherits the specificity of the most specific selector in the parent list:

```css
.card, #featured {
  & .title { color: red; }   /* behaves as :is(.card, #featured) .title → 1,0,1 */
}
```

That one bites in real codebases, because the `.card` case silently gets ID-level specificity it never asked for.

**Takeaway:** `:is()` and `:not()` adopt their most specific argument's specificity while `:where()` is always zero — so use `:where()` for overridable defaults, and remember CSS nesting wraps the parent selector in an implicit `:is()`.

---

**Q2: Which background wins?**

```css
@layer base, components, utilities;

@layer utilities {
  .box { background: yellow; }
}

.box { background: teal; }

@layer components {
  #main .box.box { background: purple; }
}
```

**Output:** `teal`

**Explanation:**

This tests the rule almost nobody expects: **unlayered author styles beat all layered author styles.**

The cascade checks layers *before* specificity. Anything not in a `@layer` is treated as being in an implicit final layer that sorts after every declared one. So the ordering here is:

```
base  <  components  <  utilities  <  (unlayered)   ← teal lives here
```

`teal` has specificity `0,1,0` and still beats `purple` at `1,2,0` and `yellow` at `0,1,0`, because the layer comparison resolves first and specificity is only consulted **within** the same layer.

This is deliberate, and it's what makes `@layer` adoptable incrementally: you can drop a vendor stylesheet into a low layer and your entire existing unlayered codebase keeps winning without a single change.

```css
@layer vendor, app;
@import url("some-widget.css") layer(vendor);
/* every existing unlayered rule you already have now overrides the widget */
```

Two follow-on rules worth knowing. **Layer order is fixed by the first statement that names them** — so `@layer base, components, utilities;` at the top of your entry stylesheet is the whole architecture, and a later `@layer components { }` block doesn't move it. And within the author origin, **`!important` resolves in reverse layer order**: an `!important` in `base` beats an `!important` in `utilities`. That inversion looks bizarre until you see the purpose — it lets a low layer contain a hard, non-negotiable rule (a reset, an accessibility override) that a later layer cannot stomp on with `!important`.

**Takeaway:** the cascade checks origin → layer → specificity → order, so unlayered styles outrank every layered style regardless of specificity — and `!important` flips layer order, which is what makes `@layer` safe for third-party CSS.

---

**Q3: The modal has `position: fixed; inset: 0`. It renders inside a card and is clipped to the card, scrolling with it instead of covering the viewport. The modal's CSS is correct. Why?**

**Answer:** An ancestor has a `transform` (or `filter`, `perspective`, `will-change` of those, or `contain: paint|layout`), which makes that ancestor the **containing block** for fixed descendants.

**Explanation:**

`position: fixed` is described as "positioned relative to the viewport", and that's true only when no ancestor has hijacked the containing block. Any of these on an ancestor changes it:

```css
.card {
  transform: translateZ(0);   /* the classic "GPU acceleration" hack */
  /* or: filter, perspective, backdrop-filter, will-change: transform,
         contain: paint | layout | content, container-type */
}
```

Once that happens, `inset: 0` on the fixed child resolves against **the card**, not the viewport — so it's card-sized, clipped by the card's `overflow`, and scrolls with it. Nothing in the modal's own CSS is wrong, which is exactly why this is hard to debug from the element you're looking at.

The maddening part is that the ancestor's `transform` was often added deliberately, for "performance", and works fine until someone renders a fixed-position descendant inside it a year later.

**The same root cause produces a family of bugs**, and recognising the family is the point:

- **`position: sticky` not sticking** — it sticks within its nearest *scrolling* ancestor, and any ancestor with `overflow: hidden|auto|scroll` silently becomes that container.
- **A dropdown clipped by its parent** — `overflow: hidden` on an ancestor.
- **`z-index: 9999` losing to `z-index: 1`** — the ancestor created a *stacking* context too (transform does both), so the child can't escape it.

**The fixes:**

1. **Render in the top layer** — `<dialog>` with `showModal()`, or the `popover` attribute. The top layer is outside the whole containing-block and stacking-context tree, so this class of bug is structurally impossible. This is the modern right answer, and it also gets you light dismiss, focus trapping and `::backdrop`.
2. **Portal to `document.body`** so the modal isn't a descendant of the offending element at all.
3. Remove the ancestor's `transform` if it isn't earning anything — `translateZ(0)` as a blanket performance hack usually isn't.

**The diagnostic to state:** when `fixed`, `sticky`, `z-index` or clipping misbehaves, **walk up the ancestor chain in DevTools looking for `transform`, `filter`, `opacity`, `overflow`, `contain` and `container-type`.** The bug is nearly always in an ancestor, not in the element you're debugging.

**Takeaway:** a `transform`, `filter`, `perspective` or `contain` on any ancestor makes it the containing block for `position: fixed` descendants and creates a stacking context — which is why the real fix for modals is the top layer (`<dialog>` / `popover`) rather than fighting the tree.

---

**Q4: A flex row contains a text element with a long URL. Instead of wrapping, the whole layout overflows horizontally. `overflow-wrap: break-word` on the text doesn't help. Why?**

**Answer:** Flex items have `min-width: auto`, so the item refuses to shrink below its content's minimum size. The text never gets a narrow enough box to wrap inside.

**Explanation:**

The order of operations is what makes this confusing. Flexbox sizes the *item* first, and `min-width: auto` on a flex item means "at least as wide as my minimum content size." An unbreakable string — a long URL, a long word in German, a `<pre>` block — has a large min-content width, so the item claims that width, the row exceeds its container, and the page scrolls sideways.

`overflow-wrap: break-word` on the text is asking the *text* to wrap inside its box. But the box was already sized to fit the text without wrapping, so there's nothing to wrap against. The declaration is correct and irrelevant.

You need **both** halves:

```css
.flex-child {
  min-width: 0;               /* allow the ITEM to shrink below min-content */
}
.text {
  overflow-wrap: anywhere;    /* now let the TEXT break inside the smaller box */
}
```

`overflow-wrap: anywhere` differs from `break-word` in one useful way: `anywhere` is taken into account when calculating min-content size, `break-word` is not — so `anywhere` alone sometimes fixes it, which is why the two behave inconsistently across cases and confuses people further.

**The same bug in three other costumes:**

- **Block axis:** `min-height: 0` is needed for a flex child that should scroll (`overflow-y: auto`) inside a column flex container. Without it the child grows to its content and the scroll never appears — the single most common "why won't this scroll?" bug.
- **Grid:** a `1fr` track's minimum is also `auto`, so `grid-template-columns: 1fr 1fr` overflows for the same reason. Fix: `minmax(0, 1fr)`.
- **Nested flex:** you may need `min-width: 0` at **every** level of nesting, because each container independently refuses to shrink. Fixing only the outer one appears to do nothing.

Related and worth mentioning: `flex-shrink` doesn't override this. `flex: 1` is `1 1 0%`, so the *basis* is zero, but `min-width: auto` still floors the used size. Shrink factors operate above the minimum, never below it.

**Takeaway:** `min-width: auto` (and `min-height: auto`, and a `1fr` track's implicit `auto` minimum) stops flex and grid children shrinking below their content — you need `min-width: 0` / `minmax(0, 1fr)` on the container's child *and* a wrapping rule on the text, at every level of nesting.

---

**Q5: Your view transition animates the whole page as one cross-fade instead of morphing the individual cards, and on some navigations no transition happens at all. The CSS looks right. What's wrong?**

```css
.card { view-transition-name: card; }
```

**Answer:** `view-transition-name` must be **unique per snapshot**. Multiple visible `.card` elements share one name, which is invalid, so the browser silently falls back to a whole-page transition — or aborts entirely.

**Explanation:**

`view-transition-name` is an *identity*, not a class. The browser uses it to pair an element's "before" snapshot with its "after" snapshot so it can morph between the two positions and sizes. If two elements claim the same name in the same snapshot, there's no unambiguous pairing, and the specification says the transition is skipped.

The behaviour you observe is confusing because it's not a hard error — you get a whole-page cross-fade (the default group), or nothing, and no console message on some engines.

The fix is generated names:

```jsx
{cards.map(card => (
  <div key={card.id} style={{ viewTransitionName: `card-${card.id}` }} />
))}
```

Or in pure CSS, if you know the count: `.card:nth-child(1) { view-transition-name: card-1; }` and so on — clumsy, which is why this is usually done in the framework layer.

**Related gotchas in the same family:**

- **Only the *visible* set matters.** Names must be unique among elements actually rendered in that snapshot; an offscreen or `display: none` element doesn't collide. So a virtualised list is fine as long as visible rows have distinct names.
- **Both states need the same name** for a morph. If the destination page names the hero `hero-image` and the source names it `hero`, you get two independent fades instead of one morph.
- **Colons are invalid** in a `view-transition-name`. This is exactly why React changed the `useId` prefix from `:r:` to `_r_` in 19.2 — the old form couldn't be used as a transition name.
- **A cross-document transition needs `@view-transition { navigation: auto; }` on *both* pages.** Opting in on only one silently does nothing.
- **React's `<ViewTransition>` is still Canary-only** — not in a stable release, despite a lot of writing implying otherwise. Drive the browser API from your router instead.

And always gate it on motion preference, since a full-page morph is precisely the kind of movement that causes vestibular discomfort:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) {
    animation: none !important;
  }
}
```

**Takeaway:** `view-transition-name` is a unique identity per snapshot, not a class — duplicate names silently degrade to a whole-page fade or skip the transition entirely, so generate per-item names and use the same name on both sides of the navigation.

---

**Q6: This gradient rotation refuses to animate. `transition` is set and the value does change. Why?**

```css
:root { --angle: 0deg; }

.ring {
  background: conic-gradient(from var(--angle), red, blue);
  transition: --angle 1s linear;
}
.ring:hover { --angle: 360deg; }
```

**Answer:** An unregistered custom property is an untyped **token string** to the browser. There's no type, so there's nothing to interpolate — the value flips from `0deg` to `360deg` instantly.

**Explanation:**

By default a custom property's value is parsed as an arbitrary sequence of tokens. The browser doesn't know `0deg` is an angle rather than the literal text `0deg`; it only knows what it means at the point of substitution, inside `conic-gradient()`. Interpolation requires knowing the *type* so the engine can compute an intermediate value, and it doesn't have one. So `transition: --angle` is accepted (it's a valid property name) and does nothing.

`@property` fixes it by registering a type, an initial value and inheritance:

```css
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
```

Now `--angle` is a typed, animatable property and the transition works. This one at-rule is why animated gradients, animated conic progress rings and smooth token-driven colour transitions became possible in plain CSS.

**Three more things `@property` buys you**, which are the follow-up:

1. **`initial-value` makes typos non-fatal.** An invalid value falls back to the initial value instead of producing an invalid inherited token that breaks a declaration somewhere downstream.
2. **Type checking is real.** With `syntax: '<length>'`, `--gap: red` is rejected at parse time rather than silently poisoning a `gap` declaration that uses it — which is otherwise a genuinely nasty debugging session, because the error surfaces far from the cause.
3. **`inherits: false` gives you genuinely local properties**, essential for component internals you don't want leaking into descendants.

Note `syntax: '*'` means "any token stream" — that's the default behaviour, so registering with `*` gives you `initial-value` and inheritance control but **still no animation**. The type has to be concrete (`<length>`, `<color>`, `<angle>`, `<percentage>`, `<number>`, or a union like `<length> | <percentage>`).

**Takeaway:** custom properties are untyped token strings and therefore not animatable; `@property` with a concrete `syntax` registers a type so the browser can interpolate — and also gives you a real initial value and parse-time type checking.

---

## 19. Cheat Sheet

```
CASCADE
 1. Resolution order: origin & importance → cascade layer → specificity → source order.
 2. Specificity is a TUPLE (id, class, type), compared column by column, never summed.
    1,0,0 beats 0,99,0.
 3. !important is a different ORIGIN, not high specificity.
 4. :is() and :not() take their MOST SPECIFIC argument's specificity.
    :where() is always 0,0,0 → use it for overridable library defaults.
 5. CSS nesting implicitly wraps the parent in :is() — inherits its highest specificity.

@LAYER
 6. @layer reset, tokens, base, layout, components, utilities, overrides;
 7. Order is fixed by the FIRST statement naming the layers. Declare it up front.
 8. UNLAYERED styles beat ALL layered styles → incremental adoption works.
 9. !important resolves in REVERSE layer order within the author origin.
10. @import url("vendor.css") layer(vendor) — tame third-party CSS with no !important.

SCOPING
11. @scope (.card) to (.card-content) — donut scope with a LOWER boundary.
12. Native nesting has no & concatenation (no &__title).
13. BEM's two jobs are now @scope/CSS-Modules (scoping) + @layer/:where() (specificity).

LAYOUT
14. Flexbox = content-driven, one axis. Grid = layout-driven, two axes. gap works in both.
15. flex: 1 → basis 0 → EQUAL widths. flex: auto → basis auto → equal EXTRA space.
16. min-width: auto is the #1 flex overflow bug → min-width: 0 + overflow-wrap: anywhere,
    at EVERY nesting level. Block axis needs min-height: 0 for scrollable children.
17. A 1fr grid track's minimum is auto → use minmax(0, 1fr) to allow shrinking.
18. repeat(auto-fit, minmax(min(260px, 100%), 1fr)) — responsive grid, zero media queries.
    auto-fit collapses empty tracks, auto-fill keeps them.
19. grid-template-rows: subgrid — align nested content across siblings.

CONTAINER QUERIES
20. Media queries = viewport. Container queries = the component's own slot.
21. container-type: inline-size (95% of cases). `size` needs an explicit height.
22. You CANNOT query the element you're styling — components need a wrapper.
23. cqi/cqb units scale type and spacing to the container, not the window.
24. Media queries for page/device concerns (print, orientation, prefers-*);
    container queries for everything a component does.

SELECTORS
25. :has() looks sideways and up. body:has(dialog[open]) replaces JS class toggling.
26. Qualify the left side (.card:has(...), not :has(...)) to keep it cheap.
27. :nth-child(2 of .visible) — count only matching elements (zebra-stripe visible rows).
28. Range syntax: @media (400px <= width <= 900px).

CUSTOM PROPERTIES
29. They cascade, inherit, are readable from JS, and pierce shadow DOM.
    Sass variables do none of that.
30. Untyped custom properties CANNOT animate. @property with a concrete syntax
    registers a type → animatable, plus initial-value and parse-time type checking.
31. syntax: '*' is the default → still not animatable.
32. Ship design tokens as CSS custom properties: primitives → semantic → theme override.
    Components reference SEMANTIC tokens only.

COLOUR
33. HSL is not perceptually uniform (yellow and blue at L=50% look nothing alike).
    OKLCH is → step L for a predictable ramp.
34. color-mix(in oklch, var(--c), black 15%) replaces darken() — and works on RUNTIME values.
35. light-dark(a, b) + color-scheme removes a lot of media-query duplication.

SIZING
36. clamp(min, preferred, max). The preferred value MUST include a rem term —
    pure vw fails WCAG 1.4.4 because it ignores the user's font-size setting.
37. 100vh = LARGEST viewport on iOS → use dvh (dynamic) or svh (smallest, calmest).
38. Logical properties (margin-inline-start, padding-block, inset-inline-start)
    flip automatically for RTL. Default to them even in one language.

STACKING & CONTAINING BLOCKS
39. z-index only orders siblings within one stacking context. Children never escape.
40. Stacking context created by: positioned + z-index, fixed/sticky, transform, filter,
    perspective, clip-path, mask, opacity < 1, will-change, isolation, contain,
    container-type.
41. transform/filter/perspective/contain on an ANCESTOR becomes the containing block
    for position: fixed → clipped, scrolling modals.
42. sticky sticks within its nearest SCROLLING ancestor — overflow: hidden breaks it.
43. Fix modals with the TOP LAYER (<dialog> showModal / popover), not bigger z-index.
44. isolation: isolate on component roots makes internal z-indexes private.
45. Debug rule: walk UP the ancestor chain for transform / filter / opacity /
    overflow / contain.

TOP LAYER & POSITIONING
46. popover attribute = non-modal + top layer + light dismiss + focus mgmt, free.
47. <dialog>.showModal() = modal + focus trap + Escape + inert page + ::backdrop.
48. popover for menus/tooltips, modal dialog for blocking flows. Don't swap them.
49. Anchor positioning (anchor-name / position-anchor / position-area /
    position-try-fallbacks) replaces Floating UI. Verify Firefox support; use @supports.

VIEW TRANSITIONS
50. view-transition-name must be UNIQUE per snapshot — duplicates silently degrade
    to a whole-page fade or skip the transition. Generate per-item names.
51. Same name on BOTH states for a morph. No colons allowed in the name.
52. Cross-document: @view-transition { navigation: auto; } on BOTH pages.
    Chromium + Safari 18.2; not Firefox stable. Degrades safely.
53. React's <ViewTransition> is Canary-only — drive the browser API from your router.

MOTION
54. Animate transform and opacity only (compositor). width/height/top = layout per frame.
55. will-change is temporary — it costs memory and creates a stacking context.
56. interpolate-size: allow-keywords, or grid-template-rows 0fr→1fr, to animate to auto.
57. @starting-style + transition-behavior: allow-discrete → animate popover/dialog open.
58. prefers-reduced-motion: remove MOVEMENT, keep opacity fades. It's WCAG 2.3.3.

ARCHITECTURE & PERF
59. Runtime CSS-in-JS conflicts with RSC (no client runtime to evaluate styles) —
    that's the architectural reason the ecosystem moved to build-time extraction.
60. Sass still uniquely offers @mixin and build-time loops. Everything else is native.
61. content-visibility: auto (+ contain-intrinsic-size) is the biggest win on long pages.
62. Reserve space for all media (width/height or aspect-ratio) or you ship CLS.
63. Fonts: font-display: swap, preload above-the-fold faces, variable fonts,
    fallback metric overrides to stop the swap shifting layout.
64. Selector performance is a non-issue except pathological cases. Stylesheet size
    and DOM size matter far more.
```

---

## 20. References

- [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference) — the authoritative per-property reference
- [MDN — CSS Cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade) — origin, layers, specificity, order
- [web.dev — Learn CSS](https://web.dev/learn/css) — free structured course, strong on the cascade and layout
- [Baseline / Web Platform Status](https://webstatus.dev) — check whether a feature is safe to ship before you drop the fallback
- [MDN — CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [MDN — `@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [MDN — `@property`](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)
- [MDN — CSS Anchor Positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
- [MDN — View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [OKLCH Colour Picker](https://oklch.com) — build perceptually even palettes and see the gamut
- [A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) — the reference everyone actually keeps open
- [A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Josh Comeau — CSS Stacking Contexts](https://www.joshwcomeau.com/css/stacking-contexts/) — the clearest explanation of §11
- [Modern Font Stacks](https://modernfontstacks.com) — system font stacks with zero download cost
