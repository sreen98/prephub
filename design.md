# Design — PrepHub

A locked design system for this app (Hallmark, v2.0.0). Every page restyle reads this file
first. Do not pick a new look per page: extend or amend this file when the system needs to
grow. Token values live in `src/index.css` (`:root` and `.dark`) and are mapped to Tailwind
names in `tailwind.config.js`; this file names them, it does not duplicate them.

## Genre
Editorial. Tone: **study notebook**: paper, ink, a highlighter, index cards, a book's
contents page. Tactile, never decorative for its own sake.

## Macrostructure family
- **Home and index pages** (Home, Cheat Sheets, Bookmarks, Checkpoints): *Index-First*. The
  page is the list of things to open. One strong headline, one working sample, then the
  index. No feature grids.
- **Reading pages** (guides, cheat sheets, legal): *Long Document*. A single prose column, a
  live contents rail, chapters marked by a ruled line and a teal tab.
- **Practice pages** (Quiz, Review, Simulator, Last-minute): *Workbench*. The task is the
  page; chrome stays out of the way.
- **Playgrounds**: always-dark IDE surfaces, outside this system (see CLAUDE.md).

## Theme (tokens in `src/index.css`)
| Token | Role |
| --- | --- |
| `canvas` | The cream desk (light) / green-black chalkboard (dark) |
| `surface` | Sheets of paper and index cards |
| `cover` | The notebook cover: the sidebar, in both themes. `.cover` re-points every token inside it (cream ink, amber active state) |
| `rule` / `margin` | Blue ruled lines and the red margin line. Decoration only, never text |
| `ink` / `muted` | Text and secondary text |
| `line` | Hairlines and ruled lines |
| `accent` (+ `-strong`/`-soft`/`-contrast`) | Deep teal, the ONLY accent: actions, links, focus, chapter tabs |
| `pop` (+ `-ink`/`-soft`) | Amber fill: progress, streaks, "say this" callouts. Never text on it |
| `highlight` | The highlighter band behind ink text (`.hl`). AA in both themes |

Status colours (emerald, amber, red) are the only other hues. No purple, no gradients, no glow.

## Typography
- **Display:** Fraunces Variable, weight 600, roman only. Headings and the wordmark.
- **Body:** the system sans stack.
- **Mono:** the system mono stack, for figures, reading times, paths and question numbers
  (`JS · Q46`, `31 guides · 42 h`).
- Headings are never italic. Emphasis in a heading is the highlighter (`.hl`), used on one
  or two words per screen.
- Hero headline at most 7 words. `[overflow-wrap:anywhere]` on display sizes.

## Signature marks (`src/index.css`)
- `.hl`: highlighter band across the lower half of the line.
- `.card-stack`: an index card resting on a second one, turned 2°. Static.
- `.leader`: dotted leader from a name to its figure, as in a contents page.
- Chapter mark: `h2` sits on a full-width hairline with a 2.5 rem teal tab on it.
- `.ruled-sheet`: blue lines every 2 rem plus the margin line (the home masthead).
- `.paper-sheet`: a sheet on the desk with the margin line (the guide page).
- `.index-card` (+ `-head` red rule, `-line` blue rule): categories and the sample question.
- `.sticky-note`: amber-tint notes, slightly turned, for the practice tools, empty states
  (`components/EmptyNote.tsx`, with `NoteLink`/`NoteButton`) and "still to settle" notes.
- `.cover`: the sidebar.
- `.flash-face` (+ `.flash-head`, `.flash-label`, `.flash-meta`, `.flash-hint`): the
  flashcard in Quiz, Daily Review and the Simulator. `.flash-face-answer` swaps the red rule
  for a green one. Set `min-h-*` on the element, never in the class (custom classes come
  after Tailwind's utilities, so a class value would win).
- `.page-title`: the Fraunces masthead on every practice and index page.
- Ruled lines never go behind text that isn't sitting on them: on a card with free-size
  text they read as strikethrough (tried on the Last-minute cards and removed).

## Page map
| Page | Treatment |
| --- | --- |
| Home | Ruled-sheet masthead, index-card categories, sticky-note tools, "Who built this" developer index card + a request sticky note |
| Guides, changelog, cheat sheets, Privacy, Terms | `.paper-sheet` with the margin line |
| Cheat Sheets index | Contents list on a `.paper-sheet` |
| Quiz, Daily Review, Simulator | `.flash-face` cards; Simulator setup on a `.paper-sheet` |
| Last-minute | `.flip-card-face` styled as an index card, deck name on the red rule |
| Bookmarks, Checkpoints | `.index-card` lists; empty state `EmptyNote` |
| Search, dialogs (`ModalShell`) | `.index-card` with the red head rule |
| Streak milestone | `.sticky-note`, Fraunces figure, highlighter on "day streak" |
| Toast | Ink chip (`bg-ink text-canvas`), square corners |
| Contents rail, Continue learning | Fraunces heading; related guides as index cards |
| Callouts | Square corners, sentence-case mono label |
| Admin | Lock screen on an index card; document on a `.paper-sheet` |

## Accessibility (measured, not assumed)
Every text pair is WCAG AA in both themes and on the cover. Lowest pairs: teal `accent` on
the cream `canvas` 4.73:1, on `surface` 5.38:1; white on the teal button 5.47:1; cream ink on
the cover's highlighter 5.18:1. Checked with axe-core's `color-contrast` rule (plus label, select-name, button-name,
link-name, list rules) on every page, light and dark (0 violations; the scan was proven able
to fail by planting a 3.13:1 probe). Status text uses the 700 shades in light mode
(`text-emerald-700`, `text-amber-800`, `text-red-700`) and 400 in dark; the 600s fail on
cream. What axe reports as "incomplete" (text over the ruled gradient) was checked with a
token-pair matrix. `npm run verify:a11y` repeats the scan on every verify, push and deploy.
**The teal is close to the line on cream: don't lighten it, and don't put it on anything
darker than `canvas`.** Scan with transitions disabled, or a background tab freezes
mid-transition colours.

## Spacing and layout
Tailwind's 4-point scale. Sections differ in rhythm on purpose (hero `mb-16`, stats `mb-10`,
index sections `mb-20`); don't pad every section the same. Hairlines, not boxes. Grid tracks
that hold text use `minmax(0, 1fr)`; no horizontal scroll at 320 / 375 / 414 / 768 px.
Running text in a guide uses the sheet's full width, like code, tables and diagrams (v2.0.1 dropped the 75ch cap at the owner's request: it left an empty strip on a wide monitor).

## Motion
Quiet. The reduced-motion block in `index.css` and `<MotionConfig reducedMotion="user">` stay.
No entrance animation on content, no hover lifts, no scale on hover. Colour transitions on
hover only. Focus rings show instantly.

## Microinteractions
Silent success; toasts only for things the user can't otherwise see (checkpoint saved, link
copied). Answers reveal in place (the sample question, `[!FOLLOWUP]` callouts).

## CTA voice
- Primary: solid `accent` fill, `rounded-md`, `px-5 py-3`, verb first ("Start studying",
  "Continue: React Guide").
- Secondary: `surface` fill with a `line` border, same shape.
- Text links: `accent`, underline on hover.

## What pages must share
The wordmark (Fraunces "PrepHub" with the highlighter on "Prep"), the tokens, Fraunces for
headings, the CTA shapes, mono for figures, and no uppercase eyebrows. A page's location
label is a quiet mono path (`Front End / React & State`), not a capitalised kicker.

## What pages may differ on
Macrostructure within the family above, and how prominent the index card is.
