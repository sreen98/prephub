# CSS Flexbox & Grid Cheat Sheet

## Flexbox Container
```css
.container {
  display: flex;
  flex-direction: row | column | row-reverse | column-reverse;
  justify-content: flex-start | center | flex-end | space-between | space-around | space-evenly;
  align-items: stretch | center | flex-start | flex-end | baseline;
  flex-wrap: nowrap | wrap | wrap-reverse;
  gap: 16px;
}
```

## Flexbox Items
```css
.item {
  flex: 1;                /* grow: 1, shrink: 1, basis: 0 */
  flex: 0 0 200px;       /* fixed 200px, no grow/shrink */
  align-self: center;    /* override container's align-items */
  order: -1;             /* reorder (default 0) */
}
```

## Common Flexbox Patterns

| Pattern | CSS |
|---------|-----|
| Center everything | `display:flex; justify-content:center; align-items:center` |
| Space between items | `display:flex; justify-content:space-between` |
| Sidebar layout | Container `flex`, sidebar `flex:0 0 250px`, main `flex:1` |
| Equal columns | Items with `flex:1` |
| Sticky footer | Container `flex-direction:column; min-height:100vh`, footer `margin-top:auto` |

## Grid Container
```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;         /* 3 columns */
  grid-template-columns: repeat(3, 1fr);       /* 3 equal */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* responsive */
  grid-template-rows: auto 1fr auto;
  gap: 16px;
}
```

## Grid Items
```css
.item {
  grid-column: 1 / 3;       /* span columns 1-2 */
  grid-column: span 2;      /* span 2 columns */
  grid-row: 1 / -1;         /* full height */
  place-self: center;       /* center this item */
}
```

## Grid Template Areas
```css
.container {
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
}
.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
```

## Common Grid Patterns

| Pattern | CSS |
|---------|-----|
| Auto-fit cards | `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` |
| Holy grail layout | Use `grid-template-areas` |
| Masonry-like | `grid-template-columns: repeat(3, 1fr)` + varying `grid-row: span N` |
| Full-bleed | `grid-template-columns: 1fr min(65ch, 100%) 1fr` |

## Flexbox vs Grid

| Use Case | Choose |
|----------|--------|
| Single row/column | Flexbox |
| 2D layout (rows + columns) | Grid |
| Unknown item count | Flexbox or Grid auto-fit |
| Complex page layout | Grid |
| Alignment within row | Flexbox |
| Overlap elements | Grid |

## Key Units

| Unit | Meaning |
|------|---------|
| `fr` | Fraction of available space |
| `minmax(min, max)` | Responsive range |
| `auto` | Content-sized |
| `min-content` | Smallest without overflow |
| `max-content` | Widest single line |
| `fit-content(300px)` | Clamp to max |

## The `min-width: auto` Bug
```css
/* A flex item refuses to shrink below its content — text overflows, no ellipsis */
.item { flex: 1; min-width: 0; }        /* THE FIX */
.grid-child { min-width: 0; }           /* grid items need it too */
```
Flex and grid items default to `min-width: auto`, so they won't shrink smaller than their content. It shows up in four disguises: text not truncating with `text-overflow: ellipsis`, a long URL widening the layout, a `<pre>` blowing out the page, and a nested flex container overflowing. `min-width: 0` (or `overflow: hidden`) fixes all four.

## `flex` Shorthand Decoded
```css
flex: 1;        /* 1 1 0%    — grow, shrink, ignore content size (equal columns) */
flex: auto;     /* 1 1 auto  — grow, shrink, START from content size */
flex: initial;  /* 0 1 auto  — don't grow, may shrink (the default) */
flex: none;     /* 0 0 auto  — fixed at content size, never flexes */
flex: 0 0 250px;/* fixed 250px sidebar */
```
`flex: 1` vs `flex: auto` is the classic question: with `1` all items end up **equal width**; with `auto` they keep their content proportions while sharing leftover space.

## auto-fit vs auto-fill
```css
repeat(auto-fit,  minmax(200px, 1fr))   /* empty tracks COLLAPSE → items stretch */
repeat(auto-fill, minmax(200px, 1fr))   /* empty tracks are KEPT → items stay 200px */
```

## Subgrid
```css
.card { display: grid; grid-template-rows: subgrid; grid-row: span 3; }
```
Lets a child align to its **parent's** tracks — the proper fix for making titles and footers line up across cards of differing content length.

## Container Queries
```css
.sidebar { container-type: inline-size; container-name: side; }
@container side (min-width: 400px) { .card { flex-direction: row; } }
@container style(--theme: dark) { ... }         /* style queries */
```
Media queries ask about the **viewport**; container queries ask about the **parent** — which is what component-level responsiveness actually needs. Note `container-type: inline-size` creates containment, so the container can no longer be sized by its children's height.

## Alignment Reference
| Property | Axis | Works on |
|---|---|---|
| `justify-content` | main (flex) / inline (grid) | container |
| `align-items` | cross / block | container |
| `align-content` | cross, multi-line | container (needs `wrap`) |
| `justify-items` | inline | **grid only** |
| `align-self` / `justify-self` | one item | item |
| `place-items` / `place-content` | both axes | shorthand |
| `gap` / `row-gap` / `column-gap` | spacing | flex **and** grid |

`margin: auto` still absorbs free space — `margin-left: auto` pushes an item right in flexbox.

## Modern Layout Utilities
```css
aspect-ratio: 16 / 9;
inline-size / block-size;                    /* logical: works in RTL */
padding-inline: 1rem; margin-block: 2rem;
inset: 0;                                    /* top/right/bottom/left */
width: min(65ch, 100%);  clamp(1rem, 2.5vw, 2rem);
height: 100dvh;                              /* dvh/svh/lvh — mobile toolbars */
position: sticky; top: 0;                    /* needs a scrolling ancestor */
overflow: clip; overscroll-behavior: contain;
```

## Centring, Every Way
```css
.a { display: grid; place-items: center; }              /* best */
.b { display: flex; justify-content: center; align-items: center; }
.c { margin-inline: auto; }                             /* horizontal, known width */
.d { position: absolute; inset: 0; margin: auto; }
```

## Gotchas
- **`min-width: auto`** — see above. The single most common flex bug.
- `align-content` does nothing without `flex-wrap: wrap`.
- `justify-items` and `justify-self` **do not exist in flexbox**.
- Percentage `height` needs a definite parent height; percentage `gap` resolves against the container.
- `100vh` on mobile is the *largest* viewport, so content hides behind toolbars — use `100dvh`.
- `position: sticky` silently fails if any ancestor has `overflow: hidden|auto|scroll`, or if no offset is set.
- `transform`, `filter` and `will-change` create a **containing block**, breaking `position: fixed` children.
- `z-index` only works on positioned or flex/grid items, and only within its stacking context.
- `gap` is not the same as `margin` — it doesn't apply on the outer edges.
- `order` and `flex-direction: row-reverse` change visual order but **not** tab/screen-reader order — an accessibility bug.
- Collapsing margins don't happen inside flex or grid containers.
- `fr` accounts for `gap`, so `repeat(3, 33.33%)` overflows where `repeat(3, 1fr)` doesn't.
