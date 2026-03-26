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
