# CSS Fundamentals — Complete Guide

Most CSS bugs aren't about new features. They're about the old ones: a margin that leaks out of its parent, a `height: 100%` that does nothing, a `width: 100%` box that overflows, an `em` that compounds, a gap between inline-block items that nobody typed. Interviewers ask about these because they separate people who know how CSS *works* from people who try values until something looks right.

This guide is the foundation: how CSS is applied, selectors, the box model, display and normal flow, positioning, units, Flexbox and Grid basics, centring, responsive design, typography and motion. [Modern CSS](/frontend/modern-css) builds on it with the cascade in depth, cascade layers, container queries, `:has()`, stacking contexts and the platform features of the last few years. For the markup underneath, see [HTML](/frontend/html).

---

## Table of Contents

- [1. How CSS Reaches the Screen](#1-how-css-reaches-the-screen)
- [2. Selectors](#2-selectors)
- [3. Inheritance and Computed Values](#3-inheritance-and-computed-values)
- [4. The Box Model](#4-the-box-model)
- [5. The display Property](#5-the-display-property)
- [6. Normal Flow, Margin Collapsing and BFCs](#6-normal-flow-margin-collapsing-and-bfcs)
- [7. Positioning](#7-positioning)
- [8. Floats](#8-floats)
- [9. Units and Percentages](#9-units-and-percentages)
- [10. Flexbox Fundamentals](#10-flexbox-fundamentals)
- [11. Grid Fundamentals](#11-grid-fundamentals)
- [12. Centring](#12-centring)
- [13. Responsive Design](#13-responsive-design)
- [14. Typography and Text](#14-typography-and-text)
- [15. Transitions and Animations](#15-transitions-and-animations)
- [16. Pseudo-elements and Generated Content](#16-pseudo-elements-and-generated-content)
- [17. Interview Questions & Answers](#17-interview-questions-answers)
- [18. Tricky Questions](#18-tricky-questions)
- [19. Cheat Sheet](#19-cheat-sheet)
- [20. References](#20-references)

---

## 1. How CSS Reaches the Screen

Three ways to attach CSS, and where each belongs:

```html
<link rel="stylesheet" href="/app.css">          <!-- external: cached, shared across pages. The default -->
<style> .hero { padding: 2rem; } </style>         <!-- embedded: critical CSS inlined for first paint -->
<p style="color: red">Inline</p>                  <!-- inline: beats every selector; only for dynamic values -->
```

The browser parses stylesheets into the **CSSOM** (the CSS Object Model, the tree of rules), then for every element works out the value of every property:

```text
declared values (every rule that matches)
  → cascaded value   (the winner: origin & importance → layers → specificity → order)
  → specified value  (the cascaded value, or inherited/initial if nothing matched)
  → computed value   (relative units resolved where possible: 2em → 32px)
  → used value       (after layout: percentages and auto turned into pixels)
```

After style come **layout** (sizes and positions), **paint** (pixels into layers) and **composite** (layers combined on the GPU). Which stage a property change re-runs decides how expensive it is to change ([§15](#15-transitions-and-animations)).

**CSS is render-blocking.** A stylesheet in the `<head>` delays the first paint until it loads, to avoid a flash of unstyled content. Keep the critical CSS small, and avoid `@import` inside CSS files: an imported file can't start downloading until the file importing it has arrived, which turns parallel downloads into a chain.

The cascade's order of deciding factors (origin, importance, layers, specificity, order of appearance) is covered fully in [Modern CSS §2](/frontend/modern-css#2-the-cascade-specificity-and-inheritance). The short version you need here: when two rules set the same property on the same element, the **more specific selector** wins, and on a tie the **later** one wins. Inline `style` beats every selector; `!important` beats inline.

---

## 2. Selectors

| Selector | Matches | Specificity (id, class, type) |
|---|---|---|
| `*` | Every element | `0,0,0` |
| `p` | Every `<p>` (type selector) | `0,0,1` |
| `.card` | Elements with class `card` | `0,1,0` |
| `#main` | The element with `id="main"` | `1,0,0` |
| `[type="email"]` | Attribute equals | `0,1,0` |
| `[href^="https"]`, `[href$=".pdf"]`, `[class*="btn"]` | Starts with, ends with, contains | `0,1,0` |
| `a:hover`, `li:nth-child(2)` | Pseudo-class: a state or position | `0,1,1` |
| `p::first-line`, `.tip::before` | Pseudo-element: a part of an element | `0,0,2` / `0,1,1` |

### Combinators

```css
article p      { }  /* descendant: any p inside an article, at any depth */
article > p    { }  /* child: only p elements directly inside */
h2 + p         { }  /* next sibling: the p immediately after an h2 */
h2 ~ p         { }  /* subsequent siblings: every p after an h2, same parent */
h1, h2, h3     { }  /* selector list: any of these */
```

### Structural pseudo-classes

```css
li:first-child        { }  /* an li that is the first child of its parent */
li:last-child         { }
li:nth-child(odd)     { }  /* 1st, 3rd, 5th… (same as 2n+1) */
li:nth-child(3n)      { }  /* 3rd, 6th, 9th… */
li:nth-child(-n+3)    { }  /* the first three */
p:first-of-type       { }  /* the first p among its siblings, whatever comes before it */
p:only-child          { }
:not(.active)         { }
:empty                { }  /* no children, not even text or whitespace */
```

`:first-child` asks "is this element the first child?"; `:first-of-type` asks "is this the first element *of its tag*?". `p:first-child` matches nothing if a heading comes first ([Tricky Q9](#18-tricky-questions)).

### State pseudo-classes

`:hover`, `:active`, `:focus`, `:focus-visible` (focus that should show a ring: keyboard focus, not a mouse click), `:focus-within` (the element or anything inside has focus), `:checked`, `:disabled`, `:required`, `:invalid`, `:user-invalid` (invalid *after* the user interacted), `:target` (the element whose `id` is in the URL fragment), `:visited`.

Link states have an order that matters when specificity ties: **`:link`, `:visited`, `:hover`, `:active`** ("LoVe HAte"). Put `:hover` before `:visited` and visited links stop showing their hover style.

### How selectors are matched

Browsers match selectors **right to left**. For `.sidebar ul li a`, the engine starts from every `a` and walks *up* the tree checking for an `li`, then a `ul`, then `.sidebar`. Starting from the right means most elements are rejected at the first step. The practical consequence today is small (engines are very fast at this), but it explains why a broad key selector like `.sidebar *` or `div > *` is the costly shape, not long chains of classes. The newer selectors (`:is()`, `:where()`, `:has()`) are in [Modern CSS §7](/frontend/modern-css#7-modern-selectors).

---

## 3. Inheritance and Computed Values

Some properties **inherit** by default: when an element doesn't set them, it takes its parent's computed value. Roughly, the **text** properties inherit and the **box** properties don't.

| Inherits by default | Doesn't inherit |
|---|---|
| `color`, `font-*`, `line-height`, `letter-spacing`, `text-align`, `text-transform`, `white-space`, `visibility`, `cursor`, `list-style`, `direction` | `margin`, `padding`, `border`, `width`, `height`, `background`, `display`, `position`, `overflow`, `opacity`, `transform`, `z-index` |

Custom properties (`--brand: …`) always inherit, which is what makes them work for theming. Form controls are the classic surprise: `<button>`, `<input>` and `<select>` don't inherit `font` from the page, because the browser stylesheet sets their font explicitly. A reset usually adds:

```css
button, input, select, textarea { font: inherit; color: inherit; }
```

### The global keywords

Every property accepts four keywords that control inheritance explicitly:

| Keyword | Means |
|---|---|
| `inherit` | Take the parent's computed value, even for a property that doesn't normally inherit |
| `initial` | The property's initial value from the spec. For `display` that's `inline`, not `block`, even on a `<div>` |
| `unset` | `inherit` for inherited properties, `initial` for the rest |
| `revert` | Roll back to what the browser stylesheet would give (so `display: revert` on a `<div>` is `block`) |

`all: unset` resets every property on an element at once, which is handy for stripping a `<button>` to a bare clickable element. It also removes the focus outline, so add your own `:focus-visible` style back.

**Inherited values are computed values.** A child inherits the parent's *computed* value, not the text you wrote. `font-size: 2em` on a parent computes to pixels, and children inherit the pixels. `line-height` is the exception people trip over: a unitless `1.5` is inherited as the factor, while `150%` is computed to pixels first ([Tricky Q5](#18-tricky-questions)).

---

## 4. The Box Model

Every element generates a box with four areas, from the inside out:

```text
┌──────────────────── margin ────────────────────┐   transparent, outside the border; can be negative
│  ┌───────────────── border ─────────────────┐  │
│  │  ┌────────────── padding ─────────────┐  │  │   inside the border; shows the background
│  │  │                                    │  │  │
│  │  │            content box             │  │  │   width/height apply here by default
│  │  │                                    │  │  │
│  │  └────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

### `box-sizing`

With the default **`content-box`**, `width` sets the *content* only, and padding and border are added on top. With **`border-box`**, `width` is the whole box up to the border, and padding and border are taken out of it.

```css
.a { box-sizing: content-box; width: 200px; padding: 20px; border: 5px solid; } /* 250px wide */
.b { box-sizing: border-box;  width: 200px; padding: 20px; border: 5px solid; } /* 200px wide */
```

That's why almost every project starts with:

```css
*, *::before, *::after { box-sizing: border-box; }
```

Under `content-box`, a `width: 100%` element with padding is wider than its parent and overflows ([Tricky Q1](#18-tricky-questions)). Margins are never part of either box: they always sit outside.

### Outline is not border

`outline` is drawn outside the border and **takes no space**, so adding or removing it never moves anything. That makes it the right tool for focus rings. Never remove it without replacing it: `outline: none` on `:focus` makes keyboard focus invisible ([Accessibility §6.2](/frontend/accessibility#62-visible-focus)). Use `:focus-visible` to show the ring for keyboard users only.

### Overflow

When content is bigger than its box, `overflow` decides what happens: `visible` (the default: it spills out and overlaps), `hidden` (clipped), `scroll` (always scrollbars), `auto` (scrollbars only when needed) or `clip` (clipped, and unlike `hidden` it doesn't create a scroll container). Setting `overflow` to anything but `visible` or `clip` also makes the box a **block formatting context** ([§6](#6-normal-flow-margin-collapsing-and-bfcs)), and breaks `position: sticky` for its descendants.

Single-line truncation needs all three:

```css
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
```

Multi-line truncation uses `-webkit-line-clamp: 3` together with `display: -webkit-box` and `-webkit-box-orient: vertical`. Despite the prefixes, it works in every current browser.

---

## 5. The display Property

`display` sets two things: how the box behaves **outside** (does it start a new line?) and how it lays out its **children** inside.

| Value | Outside | Width | Respects `width`/`height`? | Vertical margin/padding |
|---|---|---|---|---|
| `block` | Starts a new line | Fills the container | Yes | Applies and pushes others away |
| `inline` | Flows in the line of text | Its content | **No** | Margin ignored; padding painted but doesn't move lines |
| `inline-block` | Flows in the line | Its content, or `width` | Yes | Applies, and the line grows to fit |
| `flex` / `grid` | Block outside | Fills the container | Yes | Children use Flexbox / Grid |
| `inline-flex` / `inline-grid` | Inline outside | Its content | Yes | Children use Flexbox / Grid |
| `none` | Not rendered at all | — | — | — |
| `contents` | The box disappears; its children take its place in the parent's layout | — | — | — |
| `flow-root` | Block that contains its floats and margins (a new BFC) | Fills the container | Yes | Applies |

Inline-block items in a row have a **gap** between them that nobody wrote: it's the whitespace (newlines and indentation) between the tags in the HTML, rendered as a space character. Four `width: 25%` inline-block boxes therefore don't fit on one line ([Tricky Q6](#18-tricky-questions)). Flexbox and Grid ignore whitespace between items, which is one reason they replaced inline-block layouts.

### Ways to hide something

| Technique | Takes space? | Clickable / focusable? | Read by screen readers? | Animatable? |
|---|---|---|---|---|
| `display: none` | No | No | No | Not traditionally (it's discrete) |
| `visibility: hidden` | **Yes** | No | No | Yes (switches at the end) |
| `opacity: 0` | Yes | **Yes**, still clickable and focusable | **Yes** | Yes |
| `hidden` attribute | No (it's `display: none` from the browser stylesheet) | No | No | — |
| Visually hidden (`.sr-only`, below) | No | Focusable if it's a control | **Yes** | — |

`visibility: hidden` has one more property: a child can set `visibility: visible` and reappear inside a hidden parent. `display: none` can't be undone by a child.

The **visually-hidden** pattern hides text from sight but keeps it for screen readers (a "Skip to content" link, a label for an icon-only button):

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

---

## 6. Normal Flow, Margin Collapsing and BFCs

**Normal flow** is the layout you get with no Flexbox, Grid, floats or positioning: block boxes stack vertically, each as wide as its container, and inline content flows in lines inside them, wrapping at the edge.

### Margin collapsing

In normal flow, **vertical** margins between block boxes can **collapse**: instead of adding up, the larger one wins.

```css
.first  { margin-bottom: 30px; }
.second { margin-top: 20px; }
/* The gap between them is 30px, not 50px */
```

It happens in three situations:

1. **Adjacent siblings**: the bottom margin of one and the top margin of the next ([Tricky Q2](#18-tricky-questions)).
2. **Parent and first or last child**: if nothing separates them (no border, no padding, no inline content, no BFC on the parent), the child's top margin collapses with the parent's and appears **outside the parent** ([Tricky Q3](#18-tricky-questions)).
3. **Empty blocks**: a block with no content, padding, border or height collapses its own top and bottom margins together.

With negative margins, the result is the largest positive margin plus the most negative one (`30px` and `-10px` give `20px`).

Margins **don't** collapse:

- horizontally, ever;
- on **flex or grid items** (so the same components spaced with `gap` don't surprise you);
- on floated or absolutely positioned elements;
- across a border, padding or a BFC boundary.

This is why many design systems space siblings with `gap` on a flex or grid parent, or with margins in one direction only (for example, only `margin-block-start`), rather than margins on both sides.

### Block formatting contexts

A **block formatting context** (BFC) is a self-contained region of normal-flow layout. Inside it, floats and margins behave normally; across its boundary they don't interact with the outside. A BFC root:

- **contains its floats** (its height includes them, so a parent no longer collapses to zero around floated children);
- **doesn't collapse margins with its children** (the parent-child leak above stops);
- **doesn't overlap floats** next to it (it shrinks to sit beside them, which is the classic media-object layout).

What creates one: `display: flow-root` (the property made for exactly this, with no side effects), `overflow` other than `visible` or `clip`, floats, `position: absolute` or `fixed`, `display: inline-block`, table cells, and flex and grid items. Use `display: flow-root` when you want a BFC; the old `overflow: hidden` trick also clips shadows and dropdowns.

---

## 7. Positioning

| `position` | Taken out of flow? | Offsets (`top`, `left`…) are relative to | Typical use |
|---|---|---|---|
| `static` (default) | No | Offsets do nothing | Everything |
| `relative` | No; its original space is kept | Its own normal position | Nudging; making an anchor for absolute children |
| `absolute` | **Yes** | The nearest **positioned** ancestor (anything but `static`), otherwise the initial containing block | Badges, overlays, dropdowns inside a component |
| `fixed` | **Yes** | The viewport | Sticky headers, toasts, floating buttons |
| `sticky` | No | Its scroll container, once you scroll past the threshold | Table headers, section headings |

The pattern every interview expects:

```css
.card  { position: relative; }                          /* the anchor, not moved */
.badge { position: absolute; top: 8px; right: 8px; }    /* pinned to the card's corner */
```

Without `position: relative` on the card, the badge positions itself against the next positioned ancestor up the tree, often the page, and ends up in the corner of the screen.

Three behaviours to know:

- **An absolutely positioned element shrinks to fit its content** (it no longer fills the width like a block). `left: 0; right: 0` (or `inset: 0` for all four sides) stretches it to the containing block.
- **`position: fixed` isn't always relative to the viewport.** An ancestor with `transform`, `filter`, `perspective`, `contain: paint` or `will-change: transform` becomes its containing block, so a "fixed" modal inside a transformed card is trapped in the card ([Modern CSS §11](/frontend/modern-css#11-stacking-contexts-containing-blocks-and-z-index)).
- **`z-index` only orders elements within the same stacking context**, so `z-index: 9999` can still be behind a `z-index: 10` element in a different context. Also covered in Modern CSS §11, with `position: sticky` failures in [Modern CSS Q11](/frontend/modern-css#17-interview-questions-answers).

---

## 8. Floats

`float: left | right` takes a box out of normal flow and pushes it to one side, and **inline content wraps around it**. That's the job floats were designed for, and still the right use:

```css
.article img.pull { float: right; margin: 0 0 1rem 1rem; max-width: 40%; }
```

For years floats were also used for whole page layouts, which created two problems that still come up in interviews and old codebases.

**The collapsing parent.** A parent containing only floated children has a height of zero, because floats are out of flow. Its background and border disappear and the next content rides up. Fixes, newest first:

```css
.row { display: flow-root; }                                    /* modern: make the parent a BFC */

.row::after { content: ""; display: table; clear: both; }       /* the classic "clearfix" */
```

**Clearing.** `clear: both` on an element makes it start below any earlier floats rather than beside them.

For layout, use Flexbox or Grid. Keep floats for text wrapping around an image, and pair them with `shape-outside` if the wrap should follow a curve.

---

## 9. Units and Percentages

| Unit | Relative to | Use for |
|---|---|---|
| `px` | A CSS pixel (not a device pixel; a 3× phone draws one CSS pixel with 3×3 device pixels) | Borders, shadows, small fixed details |
| `rem` | The **root** element's font size (`html`, 16px by default) | Font sizes, spacing, most layout values |
| `em` | The **element's own** font size; for `font-size` itself, the **parent's** | Padding that should grow with a button's text; icon sizes next to text |
| `%` | Depends on the property (see below) | Fluid widths |
| `vw` / `vh` | 1% of the viewport width / height | Full-bleed sections; fluid type in `clamp()` |
| `dvh`, `svh`, `lvh` | Dynamic, small and large viewport height (mobile browser toolbars) | Full-height mobile layouts ([Modern CSS §10.2](/frontend/modern-css#102-the-viewport-unit-family)) |
| `ch` | The width of the "0" glyph in the current font | Readable line lengths: `max-width: 65ch` |
| `fr` | A share of the free space in a grid container | Grid tracks only |

**Prefer `rem` for font sizes.** If a user sets a larger default font in their browser, `rem`-based text scales with it and `px`-based text doesn't. **`em` compounds**: `font-size: 1.2em` inside another `1.2em` is 1.44× the root ([Tricky Q4](#18-tricky-questions)).

One related detail: an `em` or `rem` inside a **media query** is relative to the browser's *initial* font size (the user's setting), not to anything your CSS set on `html`. That makes `@media (min-width: 40em)` respond correctly when the user zooms text.

### What a percentage is a percentage of

| Property | `%` is relative to |
|---|---|
| `width`, `left`, `right`, `margin-left/right`, `padding-left/right` | The containing block's width |
| **`margin-top/bottom`, `padding-top/bottom`** | **The containing block's width too**, not its height |
| `height`, `top`, `bottom` | The containing block's height, **only if that height is definite**; otherwise `height: X%` behaves as `auto` |
| `font-size` | The parent's font size |
| `line-height` | The element's own font size |
| `transform: translate()` | The element's **own** size |

The vertical-padding rule is what made the old aspect-ratio hack work (`padding-top: 56.25%` for a 16:9 box, [Tricky Q7](#18-tricky-questions)); today you write `aspect-ratio: 16 / 9`. The `height` rule is behind "why doesn't `height: 100%` work?" ([Tricky Q8](#18-tricky-questions)). And `translate(-50%, -50%)` uses the element's own size, which is why it centres an absolutely positioned box ([§12](#12-centring)).

---

## 10. Flexbox Fundamentals

Flexbox lays items out along **one axis** at a time, a row or a column, and distributes space between them.

```css
.toolbar {
  display: flex;
  flex-direction: row;          /* main axis: row (default) or column */
  justify-content: space-between; /* along the main axis */
  align-items: center;          /* across it (the cross axis) */
  gap: 12px;                    /* space between items, no outer margin */
  flex-wrap: wrap;              /* allow multiple lines */
}
```

| Property (on the item) | Does |
|---|---|
| `flex-grow` | How much of the **leftover** space this item takes, as a share |
| `flex-shrink` | How much it gives up when space runs out (weighted by its size) |
| `flex-basis` | Its starting size before growing or shrinking (`auto` = its `width` or content size) |
| `align-self` | Overrides `align-items` for this item |
| `order` | Changes visual order only. Keyboard and screen-reader order still follow the DOM |

### The `flex` shorthand

| Shorthand | Equals | Behaviour |
|---|---|---|
| `flex: initial` (the default) | `0 1 auto` | Content-sized; shrinks if needed, never grows |
| `flex: 1` | `1 1 0%` | Starts from zero, so all `flex: 1` items get **equal** widths |
| `flex: auto` | `1 1 auto` | Starts from content size, then shares the leftover, so widths stay **unequal** |
| `flex: none` | `0 0 auto` | Fixed at content size: neither grows nor shrinks |

The `flex: 1` vs `flex: auto` difference is [Tricky Q10](#18-tricky-questions). Two other facts that get asked: `margin-left: auto` on an item pushes it (and everything after it) to the far end, which is the cleanest way to put a "Log out" button on the right of a nav. And flex items have `min-width: auto` by default, so an item won't shrink below its content, which is why a long URL or a `<pre>` can overflow a flex row. The fix is `min-width: 0` on the item ([Modern CSS Tricky Q4](/frontend/modern-css#18-tricky-questions)).

---

## 11. Grid Fundamentals

Grid lays items out in **two dimensions**, rows and columns at once, with tracks you define on the container.

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;           /* a fixed sidebar and the rest */
  grid-template-rows: auto 1fr auto;          /* header, content, footer */
  grid-template-areas:
    "header header"
    "nav    main"
    "footer footer";
  gap: 16px;
  min-height: 100dvh;
}
.layout > header { grid-area: header; }
.layout > nav    { grid-area: nav; }
.layout > main   { grid-area: main; }
.layout > footer { grid-area: footer; }
```

- **`fr`** is a fraction of the *free* space after fixed tracks and gaps. `1fr 2fr` splits it one-third and two-thirds.
- **`repeat(3, 1fr)`** writes three equal columns. `minmax(200px, 1fr)` is a track at least 200px wide that grows to fill.
- **Placement by lines**: `grid-column: 1 / -1` spans from the first line to the last (full width); `grid-column: span 2` spans two columns.
- **Implicit grid**: items beyond the defined rows create new rows, sized by `grid-auto-rows` (default `auto`).

### The responsive grid with no media queries

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
```

The browser fits as many 220px-or-wider columns as the container allows, and the `1fr` maximum stretches them to fill the row. **`auto-fill` vs `auto-fit`**: both create as many tracks as fit. `auto-fill` keeps empty tracks when there are fewer items than columns, so three cards in a wide row stay 220px-ish with empty space after them. `auto-fit` collapses the empty tracks to zero, so the three cards stretch across the whole row.

Choosing between Flexbox and Grid, and subgrid, are in [Modern CSS §5](/frontend/modern-css#5-layout-flexbox-grid-subgrid). The one-line rule: **Flexbox when the content decides the size, Grid when the layout does.**

---

## 12. Centring

"Centre a div" has a right answer for each situation:

```css
/* 1. Horizontally centre a block with a width */
.page { max-width: 70ch; margin-inline: auto; }

/* 2. Centre anything in both directions: Grid */
.center-grid { display: grid; place-items: center; }

/* 3. Centre in both directions: Flexbox */
.center-flex { display: flex; justify-content: center; align-items: center; }

/* 4. Centre an overlay over a positioned parent */
.overlay { position: absolute; inset: 0; margin: auto; width: 300px; height: 200px; }

/* 5. Centre an element of unknown size over a positioned parent */
.popup { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }

/* 6. Centre inline content (text, inline-block children) */
.caption { text-align: center; }
```

- **`margin: auto` centres horizontally in normal flow**, but not vertically: in normal flow, `auto` vertical margins resolve to zero. Inside a flex or grid container, or on an absolutely positioned box with `inset: 0` and a size, `margin: auto` centres in **both** directions.
- **`translate(-50%, -50%)`** works because translate percentages refer to the element's *own* size: `top: 50%; left: 50%` puts its top-left corner at the centre, and the translate pulls it back by half its width and height. The catch: it can land on half pixels and blur text slightly.
- **`vertical-align: middle`** only affects inline and table-cell boxes, which is why it never centres a block.

---

## 13. Responsive Design

Responsive design means one page that adapts to any screen. It starts with the viewport meta tag ([HTML §2](/frontend/html#2-the-document-and-the-head)); without it, phones render at about 980px and media queries meant for phones never match.

### Mobile-first media queries

Write the base styles for the smallest screen, then add `min-width` queries as space grows:

```css
.grid { display: grid; gap: 16px; }                         /* one column on phones */

@media (min-width: 40rem) {                                 /* ~640px and up */
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 64rem) {                                 /* ~1024px and up */
  .grid { grid-template-columns: repeat(4, 1fr); }
}
```

Mobile-first keeps the simplest layout as the default and adds complexity only where there's room for it. The desktop-first alternative (`max-width` queries) works, but it means overriding desktop styles back down, and the phone, usually the slowest device, downloads and evaluates the most overrides. Set breakpoints where *your content* breaks, not at device widths, which change every year.

### Media features beyond width

```css
@media (hover: hover) and (pointer: fine) { .row:hover { background: #f5f5f5; } } /* mouse users only */
@media (prefers-color-scheme: dark)       { :root { --bg: #111; --text: #eee; } }
@media (prefers-reduced-motion: reduce)   { * { animation: none; transition: none; } }
@media (orientation: landscape)           { … }
@media print                              { nav, .ads { display: none; } }
```

`(hover: hover)` avoids "sticky hover" on touch screens, where a tapped item keeps its hover style.

### Intrinsic layouts

Many layouts no longer need breakpoints at all: `repeat(auto-fit, minmax(220px, 1fr))` grids, `flex-wrap: wrap` with `flex: 1 1 200px`, `clamp()` for fluid type (`font-size: clamp(1rem, 0.9rem + 1vw, 1.5rem)`), and `max-width: 100%` on images. Media queries respond to the *viewport*; when a component should respond to the space *its container* gives it, that's a container query ([Modern CSS §6](/frontend/modern-css#6-container-queries)).

---

## 14. Typography and Text

```css
body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 1rem;
  line-height: 1.5;          /* unitless: inherited as a factor */
  color: #1f2937;
}
h1 { font-size: clamp(2rem, 1.5rem + 2vw, 3rem); line-height: 1.15; }
p  { max-width: 65ch; }      /* about 65 characters per line is comfortable to read */
```

- **`font-family` is a fallback list.** The browser uses the first font that is available and has the glyph, so always end with a generic family (`sans-serif`, `serif`, `monospace`).
- **Use a unitless `line-height`.** A unit (`24px`, `150%`, `1.5em`) is computed once on the element where you set it and inherited as a fixed length, so a larger heading inside it gets cramped, overlapping lines ([Tricky Q5](#18-tricky-questions)).
- **The `font` shorthand resets everything it doesn't mention**: `font: 16px Arial` sets `font-weight` back to `normal` and `line-height` back to `normal`.
- **Web fonts** load with `@font-face`; `font-display: swap` shows fallback text immediately instead of invisible text while the font downloads. Loading strategy and layout shift from font swaps are in [Web Performance §7](/frontend/web-performance#7-fonts).
- **`white-space`**: `normal` collapses spaces and wraps; `nowrap` collapses but never wraps; `pre` keeps everything and never wraps; `pre-wrap` keeps spaces and newlines and wraps. Long unbroken strings (URLs) need `overflow-wrap: anywhere` to break.

---

## 15. Transitions and Animations

A **transition** animates a property *between two states* when the value changes (on hover, when a class is added). An **animation** runs **keyframes**, can loop, and can start on its own.

```css
.button {
  transition: transform 150ms ease-out, background-color 150ms;
}
.button:hover { transform: translateY(-2px); background-color: #4338ca; }

@keyframes spin { to { transform: rotate(360deg); } }
.spinner { animation: spin 1s linear infinite; }

@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.toast { animation: fade-in 200ms ease-out both; }   /* both: keep the first and last frame */
```

| Aspect | Transition | Animation |
|---|---|---|
| Starts | When a property value changes | When the animation is applied (immediately) |
| States | Two: from the old value to the new | Any number of keyframes |
| Loops | No | `animation-iteration-count: infinite` |
| Control from JS | Change a class or style | Also `animationend`, pause with `animation-play-state` |

### What to animate

The cost of an animation depends on which pipeline stage each frame re-runs:

| Changing | Re-runs | Cost |
|---|---|---|
| `width`, `height`, `top`, `left`, `margin`, `padding`, `font-size` | **Layout**, then paint, then composite | Expensive: neighbours may move too |
| `color`, `background-color`, `box-shadow`, `border-radius` | Paint, then composite | Medium |
| **`transform`, `opacity`** | Composite only (usually on the GPU) | Cheap: can stay smooth even when the main thread is busy |

So move things with `transform: translate()` instead of `top`/`left`, scale with `transform: scale()` instead of `width`, and fade with `opacity`. `will-change: transform` asks the browser to promote an element to its own layer ahead of time; add it only where you've measured a problem, because every layer costs memory.

### Layout thrashing

The JavaScript side of the same cost: reading a layout property (`offsetHeight`, `getBoundingClientRect()`) after writing a style forces the browser to run layout **synchronously**, right then. Doing it in a loop forces one layout per iteration.

```html
<script>
  const boxes = document.querySelectorAll('.box');

  // ✗ read, write, read, write: one forced layout per box
  boxes.forEach((box) => { box.style.width = box.parentElement.offsetWidth / 2 + 'px'; });

  // ✓ read everything, then write everything: one layout in total
  const widths = [...boxes].map((box) => box.parentElement.offsetWidth);
  boxes.forEach((box, i) => { box.style.width = widths[i] / 2 + 'px'; });
</script>
```

Respecting `prefers-reduced-motion` is not optional, and animating to and from `height: auto` has a modern answer; both are in [Modern CSS §14](/frontend/modern-css#14-motion-and-prefers-reduced-motion).

---

## 16. Pseudo-elements and Generated Content

A **pseudo-class** (one colon) selects an element in a state: `a:hover`, `li:first-child`. A **pseudo-element** (two colons) selects a *part* of an element, or creates one: `::before`, `::after`, `::first-line`, `::first-letter`, `::placeholder`, `::selection`, `::marker`, `::backdrop`.

```css
.required-label::after { content: " *"; color: #b91c1c; }

.quote::before { content: "“"; font-size: 2em; }

/* Numbered headings with CSS counters */
article { counter-reset: section; }
article h2::before { counter-increment: section; content: counter(section) ". "; }
```

- `::before` and `::after` need **`content`**, even `content: ""`, or they don't render. They're inserted *inside* the element, before and after its content, so they don't work on void elements like `<img>` and `<input>`, which have no content.
- They're inline by default; set `display: block` or position them absolutely for decorative shapes, overlays and the clearfix.
- Generated text is **read by most screen readers** but **can't be selected or copied**. Don't put real content there: decoration, icons and labels like " *" only. `content: "★" / "Featured"` gives a decorative character its own accessible text.
- Single-colon `:before` still works for backward compatibility with CSS2; write the double colon.

---

## 17. Interview Questions & Answers

### Beginner

**Q1: Explain the CSS box model.**

Every element is a rectangular box with four layers: **content**, then **padding** (inside the border, painted with the background), then **border**, then **margin** (transparent space outside the border). By default (`box-sizing: content-box`), `width` and `height` set only the content, so a `width: 200px` box with `20px` padding and a `5px` border renders 250px wide. With `box-sizing: border-box`, `width` includes padding and border, so the box is exactly 200px and the content area shrinks to 150px.

Most projects set `border-box` on everything, because "this card is 300px wide" should mean the whole card. Margins are outside both models and, vertically, can collapse ([§6](#6-normal-flow-margin-collapsing-and-bfcs)). Diagram and details: [§4](#4-the-box-model).

---

**Q2: What's the difference between `display: none`, `visibility: hidden` and `opacity: 0`?**

- **`display: none`** removes the box: no space, no clicks, no focus, and screen readers skip it.
- **`visibility: hidden`** hides it but **keeps its space**; it can't be clicked or focused and is hidden from screen readers. A child can override it with `visibility: visible`.
- **`opacity: 0`** makes it transparent only. It still takes space, **can still be clicked and focused**, and screen readers still read it. An invisible button that a keyboard user can tab to is a real accessibility bug.

To hide something visually but keep it for screen readers, use the visually-hidden (`.sr-only`) pattern. Comparison table: [§5](#5-the-display-property).

---

**Q3: What's the difference between `inline`, `block` and `inline-block`?**

**Block** boxes start on a new line, fill the container's width and respect `width`, `height` and all margins. **Inline** boxes flow inside a line of text, are as wide as their content, and **ignore `width`, `height` and vertical margins**; vertical padding is painted but doesn't push other lines away. **Inline-block** flows in the line like inline but respects `width`, `height`, margins and padding like block.

A common follow-up: why is there a small gap between inline-block items? It's the whitespace between the tags in the HTML, rendered as a space ([Tricky Q6](#18-tricky-questions)). And an `<img>` has a few pixels under it inside a container because images are inline and sit on the text baseline, leaving room for descenders; `display: block` or `vertical-align: middle` removes it.

---

**Q4: Explain the values of `position`.**

`static` is the default (normal flow, offsets ignored). `relative` keeps the element in flow and offsets it from where it would have been; it's mostly used to make an element the **containing block** for absolute children. `absolute` removes it from flow and positions it against the nearest positioned ancestor. `fixed` positions against the viewport (unless an ancestor has a `transform` or `filter`). `sticky` behaves like `relative` until its scroll container scrolls it to a threshold (`top: 0`), then sticks.

The pattern to say out loud: "`position: relative` on the parent, `position: absolute` on the child." Table and pitfalls: [§7](#7-positioning).

---

**Q5: When do you use `px`, `em`, `rem` and `%`?**

- **`rem`** (relative to the root font size) for font sizes and most spacing: it scales when the user increases their browser's default font size, and it doesn't compound.
- **`em`** (relative to the element's own font size) for things that should scale with *that component's* text, such as padding inside a button.
- **`px`** for things that shouldn't scale: hairline borders, shadows.
- **`%`** for fluid widths relative to the container. Remember that vertical padding and margin percentages also use the container's **width**.

The trap with `em` is compounding: nested `1.5em` font sizes multiply ([Tricky Q4](#18-tricky-questions)). Full unit table: [§9](#9-units-and-percentages).

---

**Q6: What's the difference between a pseudo-class and a pseudo-element?**

A **pseudo-class** (`:hover`, `:focus-visible`, `:nth-child(2)`, `:checked`) matches an element **in a certain state or position**. A **pseudo-element** (`::before`, `::after`, `::first-line`, `::placeholder`) targets **a part of an element**, or generates one that isn't in the DOM. The double colon marks pseudo-elements; single-colon `:before` survives only for compatibility with CSS2.

`::before`/`::after` need a `content` property to render, and they can't be used on `<img>` or `<input>`, because they're inserted inside the element's content and those elements have none. See [§16](#16-pseudo-elements-and-generated-content).

---

**Q7: Which CSS properties are inherited?**

Mostly the **text** properties: `color`, `font` and its parts, `line-height`, `letter-spacing`, `text-align`, `white-space`, `visibility`, `cursor`, `list-style`. Box properties (`margin`, `padding`, `border`, `background`, `width`, `display`, `position`) don't inherit. You can force either way with `inherit`, `initial`, `unset` or `revert`.

Two practical points: form controls don't inherit the page font because the browser stylesheet sets one, so resets add `font: inherit` to them; and custom properties always inherit, which is what makes them work for theming. See [§3](#3-inheritance-and-computed-values).

---

### Intermediate

**Q8: What is margin collapsing, and how do you stop it?**

In normal flow, adjacent **vertical** margins combine into one margin equal to the **largest** of them, instead of adding up. It happens between siblings, between a parent and its first or last child when nothing separates them, and on empty blocks. The parent-child case is the confusing one: a child's `margin-top` appears *above the parent*, outside its background.

It doesn't happen on flex or grid items, on floats or absolutely positioned elements, horizontally, or across a padding, border or BFC boundary. To stop the parent-child case, give the parent `display: flow-root`, some padding or a border. To avoid thinking about it, space siblings with `gap` in a flex or grid container. See [§6](#6-normal-flow-margin-collapsing-and-bfcs) and [Tricky Q2–Q3](#18-tricky-questions).

---

**Q9: What is a block formatting context (BFC), and why would you create one?**

A BFC is a region where normal-flow layout happens independently of the outside. A BFC root contains its floats (its height includes them), doesn't collapse margins with its children, and doesn't overlap floats beside it.

You create one to fix three classic problems: a parent that collapses to zero height around floated children, a child's margin leaking out of its parent, and text wrapping under a float when you wanted a clean column next to it. `display: flow-root` creates one with no side effects. `overflow: hidden` also does, but clips shadows, outlines and dropdowns. Floats, absolute positioning, `inline-block`, and flex and grid items are BFC roots too. See [§6](#6-normal-flow-margin-collapsing-and-bfcs).

---

**Q10: How do you centre an element horizontally and vertically?**

For a child of a container: `display: grid; place-items: center` on the parent, or `display: flex; justify-content: center; align-items: center`. For an overlay over a positioned parent: `position: absolute; inset: 0; margin: auto` with a size, or `top: 50%; left: 50%; transform: translate(-50%, -50%)` when the size is unknown. For a block horizontally only: `margin-inline: auto` with a width or `max-width`. For text: `text-align: center`.

A good answer explains why `margin: auto` doesn't centre vertically in normal flow (auto vertical margins resolve to zero there) but does inside flex and grid. All six patterns: [§12](#12-centring).

---

**Q11: What does `flex: 1` mean, and how is it different from `flex: auto`?**

`flex` is shorthand for `flex-grow`, `flex-shrink` and `flex-basis`. `flex: 1` is `1 1 0%`: every item starts from a basis of zero and shares *all* the space, so items with `flex: 1` end up **equal width** regardless of content. `flex: auto` is `1 1 auto`: each item starts from its content (or `width`) and only the *leftover* space is shared, so a wider item stays wider.

Use `flex: 1` for equal columns, `flex: auto` for "fit the content, then fill", and `flex: none` for something that should never resize, like an icon. Worked numbers: [Tricky Q10](#18-tricky-questions).

---

**Q12: What's the difference between `auto-fill` and `auto-fit` in a grid?**

Both appear in `repeat(auto-fill | auto-fit, minmax(220px, 1fr))` and create as many columns as fit the container. They differ only when there are **fewer items than columns**: `auto-fill` keeps the empty columns, so items keep their minimum-ish width and leave space at the end of the row; `auto-fit` collapses the empty columns, so the existing items stretch to fill the row.

For a card gallery that should look full with three cards, use `auto-fit`. To keep cards a consistent size however many there are, use `auto-fill`. See [§11](#11-grid-fundamentals).

---

**Q13: How do you approach responsive design?**

Start with the viewport meta tag. Write **mobile-first**: the base CSS is the single-column phone layout, and `min-width` media queries add columns as space grows, with breakpoints set where the content breaks, not at device sizes. Prefer **intrinsic** techniques that need no breakpoints (`auto-fit` grids, `flex-wrap`, `clamp()` for type, `max-width: 100%` on media). Use `rem` so text respects user settings, and responsive images (`srcset`/`sizes`) so phones don't download desktop images.

Then the details that show experience: `(hover: hover)` so touch devices don't get stuck hover states, `dvh` instead of `100vh` for full-height mobile layouts, touch targets of at least 24×24px, and container queries for components that live in different-sized slots. See [§13](#13-responsive-design).

---

**Q14: Why animate `transform` and `opacity` rather than `top`, `left` or `width`?**

Each animation frame re-runs the rendering pipeline from the stage the property affects. Changing `top`, `left`, `width` or `margin` changes geometry, so every frame runs **layout**, then paint, then composite, and layout can cascade to neighbours. `transform` and `opacity` can usually be applied in the **composite** step alone, often on the GPU, without layout or paint. That's cheaper, and it can stay smooth even while JavaScript keeps the main thread busy.

So move with `translate()`, grow with `scale()`, fade with `opacity`. And respect `prefers-reduced-motion`. See [§15](#15-transitions-and-animations).

---

**Q15: How do you hide an element visually but keep it available to screen readers?**

With the visually-hidden pattern (often called `.sr-only`): absolutely positioned, 1×1px, `overflow: hidden`, clipped with `clip-path: inset(50%)`, `white-space: nowrap` and no border or padding. The text stays in the accessibility tree and is read aloud, but takes no visible space.

`display: none` and `visibility: hidden` don't work for this, because they also hide the content from screen readers. Common uses: a "Skip to main content" link (made visible on `:focus`), extra context for an icon-only button, and table captions that are visually redundant. The CSS is in [§5](#5-the-display-property).

---

### Advanced

**Q16: What's the difference between reflow and repaint, and what is layout thrashing?**

**Reflow** (layout) recomputes the geometry of boxes: sizes and positions. It's triggered by changes to geometry (`width`, `padding`, `font-size`, adding nodes, resizing the window) and can affect many elements. **Repaint** redraws pixels without changing geometry (`color`, `background`, `visibility`). Compositing-only changes (`transform`, `opacity`) skip both.

**Layout thrashing** is when JavaScript alternates writes and layout reads in a loop: each read (`offsetWidth`, `getBoundingClientRect()`, `scrollTop`) after a write forces a synchronous layout, so the browser lays out the page once per iteration instead of once per frame. The fix is to batch: read everything first, then write everything, or schedule writes in `requestAnimationFrame`. Example: [§15](#15-transitions-and-animations).

---

**Q17: How do browsers match selectors, and does selector performance matter?**

Selectors are matched **right to left**: for `.nav ul li a` the engine finds candidate `a` elements, then walks up checking ancestors. Most elements fail on the rightmost part (the **key selector**), so it's fast.

In practice, selector matching is rarely the bottleneck today. What costs more is **style recalculation scope**: how many elements need restyling when a class changes. Toggling a class on `<body>` that many selectors depend on restyles the whole page; toggling it on the component restyles the component. Broad key selectors (`* `, `div > *`) and very large DOMs make recalculation slower. DevTools' Performance panel shows "Recalculate Style" with the number of elements affected, which is the measurement to make before blaming selectors.

---

**Q18: What's the difference between a CSS reset, normalize.css and a modern reset?**

- A **reset** (Eric Meyer's is the classic) removes almost all browser defaults: margins, heading sizes, list styles. You restyle everything from zero.
- **normalize.css** keeps useful defaults but makes them **consistent** across browsers and fixes known bugs.
- A **modern reset** (Andy Bell's and Josh Comeau's are common) is a small, opinionated set of sensible defaults: `box-sizing: border-box` everywhere, `margin: 0`, `line-height: 1.5`, `img { display: block; max-width: 100% }`, `font: inherit` on form controls, `overflow-wrap: break-word` on text, and `prefers-reduced-motion` handling.

Today, cross-browser default differences are small, so a short modern reset is the usual choice. Tailwind's Preflight is a modern reset of this kind. Put it in the lowest cascade layer so it never fights component styles ([Modern CSS §3](/frontend/modern-css#3-cascade-layers)).

---

**Q19: An element is the wrong size and you don't know why. How do you debug it?**

Work from the box outwards, in DevTools:

1. **Computed tab**: the final `width`, `height`, `box-sizing`, `display` and `position`, and which rule set each. A crossed-out declaration lost the cascade; the rule that won is listed.
2. **Box-model diagram**: is it content, padding, border or margin that's bigger than expected? `content-box` plus padding explains many "too wide" bugs.
3. **Who decides the size**: is it a flex item (check `flex-basis`, `flex-shrink` and the `min-width: auto` floor), a grid item (check the track sizes in the grid overlay), absolutely positioned (shrinks to fit), inline (ignores `width`)?
4. **The parent**: a percentage height on a parent with no definite height is `auto`; a containing block that isn't the element you think.
5. **Overflow**: toggle `outline: 1px solid red` on `*` to see every box, or use the DevTools badge that marks scroll containers and elements causing overflow.

Saying "I'd check the computed value and the rule that produced it before changing anything" is half the answer.

---

**Q20: How would you structure CSS for a large application?**

The fundamentals: a **reset** and **design tokens** (custom properties for colour, spacing, type, radii) at the base; **component-scoped styles** so a class name in one feature can't break another (CSS Modules, a scoping convention like BEM, `@scope`, or utility classes); **low, flat specificity** (single classes, `:where()` for defaults, no IDs and no `!important` outside utilities); and **cascade layers** to make the order explicit (`@layer reset, tokens, components, utilities`).

Then process: stylelint in CI, a design system that owns the shared components, and visual regression tests for the components that change most. Which tool to pick in 2026 (Tailwind, CSS Modules, CSS-in-JS with zero runtime, native nesting and `@scope`) is discussed in [Modern CSS §15](/frontend/modern-css#15-styling-architecture-in-2026).

---

**Q21: What are Flexbox and Grid, and how do they differ?**

Both are layout modes you switch on with `display` on a **container**; its direct children become the items. **Flexbox** (`display: flex`) arranges items along **one axis**, a row or a column. You control spacing along that main axis with `justify-content` and alignment across it with `align-items`, and each item's `flex` says how it grows or shrinks. **Grid** (`display: grid`) arranges items in **two dimensions**: you define columns and rows on the container, and items are placed into the cells.

```css
/* Flexbox: a nav bar. The items decide their own widths. */
.nav  { display: flex; align-items: center; gap: 12px; }
.nav .logout { margin-left: auto; }   /* pushed to the far right */

/* Grid: a page. The container decides where everything goes. */
.page { display: grid; grid-template-columns: 240px 1fr; gap: 16px; }
```

| Aspect | Flexbox | Grid |
|---|---|---|
| Dimensions | One (row **or** column) | Two (rows **and** columns) |
| Who decides sizes | The content: items size themselves, then share leftover space | The container: tracks are defined first, items fill them |
| Typical use | Toolbars, button groups, a card's inner stack, centring one thing | Page layouts, galleries, forms with aligned columns |
| Wrapping | Each wrapped line is laid out on its own, so columns don't line up | Rows and columns stay aligned |

They're not rivals: a page is usually a grid whose cells contain flex rows. Both support `gap`, and both centre with `place-items: center` (Grid) or `justify-content` + `align-items` (Flexbox). Details are in [§10](#10-flexbox-fundamentals) and [§11](#11-grid-fundamentals), and how to choose between them in a harder interview is [Modern CSS Q2](/frontend/modern-css#17-interview-questions-answers).

---

## 18. Tricky Questions

---

**Q1: The parent is 400px wide. How wide is the box?**

```html
<div class="parent">
  <div class="box">Hello</div>
</div>
```

```css
.parent { width: 400px; }
.box    { width: 100%; padding: 20px; border: 2px solid; }
```

**Output:** `444px`, overflowing the parent by 44px.

**Explanation:**

With the default `box-sizing: content-box`, `width: 100%` sizes only the **content area**, to 100% of the parent: 400px. Padding and border are then added outside it.

| Part | Width |
|---|---|
| Content (`100%` of 400px) | 400px |
| Padding, left + right | 40px |
| Border, left + right | 4px |
| **Rendered width** | **444px** |

The fix is `box-sizing: border-box`, which makes `width` include padding and border, so the box is exactly 400px with a 356px content area. This is why nearly every stylesheet starts with `*, *::before, *::after { box-sizing: border-box; }`. Alternatively, drop `width: 100%` altogether: a block element fills its container's width by default, padding included.

**Takeaway:** under `content-box`, `width: 100%` plus padding or border always overflows; use `border-box` or let the block fill its container naturally.

---

**Q2: How big is the gap between the two blocks?**

```html
<div class="first">First</div>
<div class="second">Second</div>
```

```css
.first  { margin-bottom: 30px; }
.second { margin-top: 20px; }
```

**Output:** `30px`

**Explanation:**

Vertical margins between adjacent block siblings in normal flow **collapse**: they don't add, the larger one wins. So it's `max(30, 20) = 30px`, not `50px`.

If one margin were negative, they'd be combined as the largest positive plus the most negative (`30px` and `-10px` give `20px`).

Two common ways it *doesn't* happen, which is also why it surprises people when it does:

- **Inside a flex or grid container**, margins never collapse, so the same markup with `display: flex; flex-direction: column` on the parent gives `50px`.
- **Horizontal margins never collapse**: two inline-blocks with `margin-right: 30px` and `margin-left: 20px` are 50px apart (plus the whitespace gap).

**Takeaway:** adjacent vertical margins in normal flow collapse to the larger one, but never in flex or grid containers and never horizontally.

---

**Q3: Where does the grey background start?**

```html
<div class="banner">
  <h2 class="title">Sale</h2>
</div>
```

```css
body    { margin: 0; }
.banner { background: #ddd; }
.title  { margin-top: 40px; }
```

**Output:** The grey starts **40px below the top of the page**, and the heading sits flush against the top edge of the grey, with no grey space above it.

**Explanation:**

The heading's `margin-top` collapses with its parent's top margin, because nothing separates them: the banner has no border, no padding, no content before the heading, and isn't a block formatting context. A collapsed margin belongs to the **parent**, so the 40px ends up *outside* the banner, pushing the whole banner (and its background) down.

| Element | Top edge |
|---|---|
| `.banner` (where the grey starts) | 40px from the top of the page |
| `.title` | 40px from the top of the page, the same line |

Any of these stops the collapse, and the grey then starts at the top with 40px of grey above the heading:

```css
.banner { display: flow-root; }   /* best: makes the banner a BFC, no side effects */
.banner { padding-top: 1px; }     /* anything that separates the two margins */
.banner { display: flex; flex-direction: column; }   /* flex items don't collapse */
```

**Takeaway:** a first child's top margin can escape through a parent with no border, padding or BFC, moving the parent instead of spacing the child inside it.

---

**Q4: What's the computed font size of the innermost span?**

```html
<div class="nest">
  <div class="nest">
    <span class="nest">Deep</span>
  </div>
</div>
```

```css
html  { font-size: 16px; }
.nest { font-size: 1.5em; }
```

**Output:** `54px`

**Explanation:**

For the `font-size` property, `em` means "times the **parent's** font size", and each level inherits the previous level's *computed* size, so the factors multiply:

| Element | Calculation | Computed |
|---|---|---|
| outer `.nest` | 16 × 1.5 | 24px |
| middle `.nest` | 24 × 1.5 | 36px |
| inner `.nest` | 36 × 1.5 | **54px** |

With `font-size: 1.5rem`, every level would be `16 × 1.5 = 24px`, because `rem` always refers to the root element. That's the reason to prefer `rem` for font sizes in reusable components: a component dropped inside another that also scales its text would otherwise compound.

**Takeaway:** `em` font sizes compound through nesting; `rem` refers to the root and doesn't.

---

**Q5: Why do the heading's lines overlap?**

```html
<article class="post">
  <h2>A long heading that wraps onto a second line</h2>
</article>
```

```css
.post    { font-size: 16px; line-height: 150%; width: 240px; }
.post h2 { font-size: 32px; }
```

**Output:** The heading's `line-height` computes to **`24px`**, smaller than its 32px text, so its lines overlap. With `line-height: 1.5` on `.post`, it would be **`48px`**.

**Explanation:**

A child inherits the parent's **computed** value. How `line-height` computes depends on how you wrote it:

| Written on `.post` | Computed on `.post` | Inherited by the `h2` | `h2` line height |
|---|---|---|---|
| `150%` | 16 × 1.5 = 24px (a length) | `24px` | **24px**, for 32px text |
| `1.5em` | 24px (a length) | `24px` | 24px |
| `1.5` (unitless) | the number 1.5 | `1.5` | 32 × 1.5 = **48px** |

A percentage or `em` is resolved to a length **on the element where you set it**, and children inherit that fixed length. A unitless number is inherited as the *factor* and recomputed against each element's own font size.

**Takeaway:** always write `line-height` unitless; percentages and `em` are computed once and inherited as a fixed length.

---

**Q6: Four boxes, each 25% wide. How many fit on the first line?**

```html
<div class="row">
  <div class="cell">1</div>
  <div class="cell">2</div>
  <div class="cell">3</div>
  <div class="cell">4</div>
</div>
```

```css
*     { box-sizing: border-box; }
.row  { width: 400px; }
.cell { display: inline-block; width: 25%; }
```

**Output:** `3`. The fourth box wraps onto a second line.

**Explanation:**

Inline-block boxes are laid out like words in a sentence, so the **whitespace between the tags** (the newline and indentation after each `</div>`) is rendered as a space character between them, about 4px in a 16px font. Four 100px boxes plus three spaces is more than 400px, so the last one wraps.

Fixes, from best to worst:

```css
.row { display: flex; }        /* flex and grid ignore whitespace between items */
.row { font-size: 0; }         /* the old hack: zero-width spaces (reset font-size on .cell) */
```

or deleting the whitespace in the HTML itself (`</div><div>`), which is fragile because a formatter will put it back.

**Takeaway:** whitespace between inline-block elements renders as a real space, so 4 × 25% doesn't fit; use Flexbox or Grid for rows of boxes.

---

**Q7: How tall is the inner box?**

```html
<div class="frame">
  <div class="ratio"></div>
</div>
```

```css
.frame { width: 400px; height: 600px; }
.ratio { padding-top: 50%; }
```

**Output:** `200px`

**Explanation:**

Percentage **padding and margin on all four sides** resolve against the containing block's **width**, even `padding-top` and `margin-bottom`. The frame's height (600px) is irrelevant: 50% of the 400px width is 200px.

The spec does this so vertical percentages don't create circular dependencies: a block's height usually depends on its content, so percentages of height would often be undefined.

This rule is the old intrinsic-ratio trick: `padding-top: 56.25%` (9 ÷ 16) on an empty box gives a 16:9 container for an embedded video at any width. Today, write it directly:

```css
.video { aspect-ratio: 16 / 9; width: 100%; }
```

**Takeaway:** vertical padding and margin percentages are percentages of the container's width, not its height.

---

**Q8: Why doesn't the sidebar fill the 300px panel?**

```html
<div class="panel">
  <aside class="sidebar">Menu</aside>
</div>
```

```css
.panel   { min-height: 300px; background: #eee; }
.sidebar { height: 100%; background: #c7d2fe; }
```

**Output:** The sidebar is only as tall as its one line of text, not 300px.

**Explanation:**

A percentage `height` resolves only against a **definite** height on the containing block. The panel's `height` is `auto` (it's sized by its content); `min-height` sets a floor but doesn't make the height definite. So `height: 100%` can't be resolved and **behaves as `auto`**, and the sidebar is as tall as its content.

Fixes:

```css
/* Grid: the item stretches to its row, and the row fills the 300px */
.panel { min-height: 300px; display: grid; }

/* Flex: stretches too, but only once the sidebar's height is auto again */
.panel   { min-height: 300px; display: flex; }
.sidebar { height: auto; }      /* i.e. delete height: 100% */

/* Or give the parent a definite height, so 100% has something to resolve against */
.panel { height: 300px; }
```

The flex fix catches people out: `align-items: stretch` (the default) only stretches an item whose cross size is `auto`. With `height: 100%` still on the sidebar, the flex version stays one line tall. Grid treats the item's row as a definite height, so `100%` resolves and both versions give 300px. Usually the cleanest answer is to drop the percentage and let stretching do the work. The same rule explains the classic "`height: 100%` on `body` does nothing", which needs `html { height: 100% }` too, or `min-height: 100dvh` on the body.

**Takeaway:** `height: 100%` needs a parent with a definite height, and `min-height` isn't enough. Use grid, or flex with the percentage removed, so the item stretches.

---

**Q9: Which paragraph is red?**

```html
<section class="intro">
  <h2>About</h2>
  <p class="a">First paragraph</p>
  <p class="b">Second paragraph</p>
</section>
```

```css
.intro p:first-child   { color: red; }
.intro p:first-of-type { text-decoration: underline; }
```

**Output:** **Neither** paragraph is red. Paragraph `a` is underlined.

**Explanation:**

`p:first-child` means "a `p` that is **the first child of its parent**". The first child of the section is the `<h2>`, so no `p` matches: both conditions must hold for the same element, and the selector doesn't mean "the first `p`".

`p:first-of-type` means "the first `p` among its siblings", whatever precedes it, so paragraph `a` matches.

| Selector | Matches | Why |
|---|---|---|
| `.intro p:first-child` | Nothing | The first child is the `h2` |
| `.intro p:first-of-type` | `p.a` | The first `p` element among the siblings |
| `.intro h2 + p` | `p.a` | Another way to say "the paragraph right after the heading" |

The bug usually appears when someone adds a heading above a list of paragraphs styled with `:first-child`, and the styling silently disappears. The same applies to `:nth-child(2)` vs `:nth-of-type(2)`. In current browsers there's also `:nth-child(1 of p)`, which counts only the elements matching the selector after `of`.

**Takeaway:** `:first-child` checks position among all siblings, so `p:first-child` fails when anything else comes first; use `:first-of-type` to count only `p` elements.

---

**Q10: How wide is each item?**

```html
<div class="row">
  <div class="a">A</div>
  <div class="b">B</div>
</div>
```

```css
.row { display: flex; width: 600px; }
.a   { width: 100px; }
.b   { width: 300px; }

/* Version 1 */ .a, .b { flex: 1; }
/* Version 2 */ .a, .b { flex: auto; }
```

**Output:** Version 1: `300px` and `300px`. Version 2: `200px` and `400px`.

**Explanation:**

`flex` sets three values: grow, shrink and **basis**, the starting size before free space is shared out.

| Step | `flex: 1` = `1 1 0%` | `flex: auto` = `1 1 auto` |
|---|---|---|
| Basis of A / B | 0 / 0 (the `width` is ignored) | 100px / 300px (from `width`) |
| Free space | 600 − 0 = 600px | 600 − 400 = 200px |
| Each item's share (grow 1 : 1) | 300px | 100px |
| **Final A / B** | **300px / 300px** | **200px / 400px** |

With `flex: 1`, the basis is zero, so *all* the space is shared equally and the widths end up equal, whatever the content or `width`. With `flex: auto`, each item keeps its starting size and only the leftover is split, so the size difference survives.

**Takeaway:** `flex: 1` gives equal widths because the basis is zero; `flex: auto` keeps each item's own size and shares only the leftover space.

---

## 19. Cheat Sheet

```text
APPLYING CSS      external <link> (cached) · <style> (critical CSS) · style="" (beats selectors)
                  CSS is render-blocking · avoid @import (serial downloads)
                  Tie-breaks: origin/!important → layers → specificity (id,class,type) → last wins

SELECTORS         a b (descendant) · a > b (child) · a + b (next) · a ~ b (later siblings)
                  :first-child = first of ALL siblings · :first-of-type = first of its tag
                  :nth-child(odd | 3n | -n+3) · :focus-visible · :focus-within · :user-invalid
                  Links: :link :visited :hover :active (LoVe HAte) · matched right to left

INHERITANCE       Text props inherit (color, font, line-height…) · box props don't
                  inherit · initial · unset · revert · all: unset
                  Form controls don't inherit font → button, input { font: inherit }
                  line-height: unitless (1.5), never % or em

BOX MODEL         content → padding → border → margin
                  content-box: width = content · border-box: width includes padding + border
                  *, *::before, *::after { box-sizing: border-box }
                  outline takes no space · never remove focus outline without replacing it

DISPLAY           block (new line, full width) · inline (no width/height/vertical margin)
                  inline-block (in line + sizable; whitespace gap) · flow-root (new BFC)
                  none (gone) · visibility:hidden (keeps space) · opacity:0 (still clickable!)

FLOW              Vertical margins collapse → larger wins (siblings, parent/child, empty)
                  Not in flex/grid, not horizontal, not across padding/border/BFC
                  BFC: contains floats, stops margin leaks · display: flow-root

POSITION          relative (anchor, keeps space) · absolute (nearest positioned ancestor)
                  fixed (viewport, unless transformed ancestor) · sticky (needs top + no overflow ancestor)
                  z-index only within a stacking context

UNITS             rem = root font · em = own font (parent's for font-size; compounds)
                  % padding/margin (all sides) = container WIDTH · % height needs definite parent height
                  translate(%) = own size · ch = "0" width · dvh for mobile full height

FLEX              one axis · justify-content (main) · align-items (cross) · gap
                  flex: 1 = 1 1 0% (equal) · flex: auto = 1 1 auto (content + share) · flex: none
                  margin-left: auto pushes right · min-width: 0 lets items shrink below content

GRID              two axes · fr = share of free space · repeat(auto-fit, minmax(220px, 1fr))
                  auto-fill keeps empty tracks · auto-fit collapses them · grid-column: 1 / -1

CENTRING          grid + place-items: center · flex + justify/align center
                  margin-inline: auto (block with width) · absolute + inset: 0 + margin: auto
                  absolute + top/left 50% + translate(-50%, -50%)

RESPONSIVE        viewport meta · mobile-first min-width queries · breakpoints where content breaks
                  (hover: hover) · prefers-color-scheme · prefers-reduced-motion · container queries

MOTION            animate transform + opacity (composite only) · not top/left/width (layout)
                  transition = A→B on change · animation = keyframes, loops, autostarts
                  Batch DOM reads before writes (no layout thrashing)

PSEUDO-ELEMENTS   ::before/::after need content · not on img/input · ::marker ::placeholder ::selection
```

---

## 20. References

- [MDN — CSS reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference) — every property with its initial value, inheritance and what its percentages refer to
- [MDN — Introduction to the CSS box model](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Introduction_to_the_CSS_box_model)
- [MDN — Mastering margin collapsing](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing)
- [MDN — Block formatting context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Block_formatting_context)
- [MDN — Containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block) — what percentages and positioned offsets are relative to
- [web.dev — Learn CSS](https://web.dev/learn/css) — a free structured course
- [CSS-Tricks — A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS-Tricks — A Complete Guide to CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Josh W. Comeau — A Modern CSS Reset](https://www.joshwcomeau.com/css/custom-css-reset/)
- [CSS Specificity Calculator](https://specificity.keegan.st)
