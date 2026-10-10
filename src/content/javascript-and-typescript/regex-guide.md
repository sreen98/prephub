# Regex — The Complete JavaScript Guide

Regular expressions (regex) are a tiny domain-specific language for **describing patterns in text**. You write a pattern, you ask "does this string contain it / where / replace it with what", and the regex engine answers in microseconds. They're in every language; this guide focuses on the JavaScript flavor — `RegExp` literals, `String` methods, the eight flags, and the gotchas that bite real codebases.

Regex shows up everywhere you read user input, transform text, or check whether a string "is shaped like X". Form validation, URL parsing, slug generation, search highlighting, file globs, Markdown rendering and log parsing all use it. Knowing how the engine actually reads a pattern lets you write one that is right the first time, instead of tweaking it until the tests pass.

## Table of Contents

- [1. What Regex Is and Isn't](#1-what-regex-is-and-isnt)
- [2. Two Ways to Make a Regex](#2-two-ways-to-make-a-regex)
- [3. The Eight Flags](#3-the-eight-flags)
- [4. Character Classes](#4-character-classes)
- [5. Anchors and Word Boundaries](#5-anchors-and-word-boundaries)
- [6. Quantifiers — Greedy vs Lazy](#6-quantifiers-greedy-vs-lazy)
- [7. Groups, Captures, and Backreferences](#7-groups-captures-and-backreferences)
- [8. Lookarounds — Look Ahead and Behind](#8-lookarounds-look-ahead-and-behind)
- [9. Alternation and Escaping](#9-alternation-and-escaping)
- [10. Unicode in Regex](#10-unicode-in-regex)
- [11. JavaScript Regex API](#11-javascript-regex-api)
- [12. The `lastIndex` Gotcha](#12-the-lastindex-gotcha)
- [13. Performance: Catastrophic Backtracking and ReDoS](#13-performance-catastrophic-backtracking-and-redos)
- [14. Commonly Used Patterns](#14-commonly-used-patterns)
- [15. Real-World JS Use Cases](#15-real-world-js-use-cases)
- [16. Anti-Patterns and When NOT to Use Regex](#16-anti-patterns-and-when-not-to-use-regex)
- [17. Cheat Sheet](#17-cheat-sheet)
- [18. Interview Questions & Answers](#18-interview-questions-answers)
- [19. Tricky Questions](#19-tricky-questions)
- [References](#references)

---

## 1. What Regex Is and Isn't

A regex is a small program written as a string of characters. The engine walks the input left to right, trying to match the pattern character by character; when a path fails, it backs up and tries another way (this "backing up" is called backtracking, and §13 is about when it goes wrong). Some pattern characters are literal ("match an `a`"), others are special and mean "any digit" or "one or more of the previous thing".

**What regex is good for:**
- Validating input shape (`/^\d{4}$/` — exactly four digits)
- Searching for substrings with structure ("any number followed by KB or MB")
- Find-and-replace with structural transformations
- Splitting strings on flexible boundaries
- Token extraction (URLs, hashtags, mentions)

**What regex is NOT good for:**
- Parsing recursive structures: HTML, JSON, code with nested brackets. A regex has no memory of how deep it is, so it cannot check that every `{` has a matching `}` at any nesting depth — that needs a counter or a stack, which is what a parser has. People still try; people still get burned.
- Parsing email addresses to RFC 5322 perfection. The standard regex for this is ~6,000 characters.
- Anything where readability matters more than terseness. Regex compresses a lot into a little; that's its blessing and its curse.

If your problem really is recursive (HTML, code), use a parser (`DOMParser`, `JSON.parse`, an AST library). If it's flat or "shaped like X", regex is perfect. [§16](#16-anti-patterns-and-when-not-to-use-regex) lists the common cases.

---

## 2. Two Ways to Make a Regex

```js
// Literal — compiled once, at parse time. Most common.
const re = /\d+/g;

// Constructor — needed when the pattern is dynamic (built at runtime).
const word = 'hello';
const re2 = new RegExp(`\\b${word}\\b`, 'gi');
```

**The difference matters for escaping.** A literal regex uses regex escaping. The constructor takes a *string*, so backslashes need to be escaped twice (once for the string, once for the regex):

```js
/\d/                        // matches a digit
new RegExp('\\d')           // same — note the doubled backslash
new RegExp('\d')            // ❌ '\d' becomes 'd' as a string escape; regex sees just 'd'
```

**Use the literal** unless your pattern is dynamic. Literals are precompiled, easier to read, and don't double-escape.

When you DO need the constructor (e.g., search built from user input), **always escape the user input** first, otherwise typing `.` or `*` in the search box produces unintended results. `RegExp.escape()` (ES2025; Node 24 and current browsers) does this for you. Keep a hand-written fallback for older engines:

```js
// RegExp.escape where it exists; the replace() is the fallback for older engines
const escapeRegex = RegExp.escape ?? (s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

const userInput = 'a.b*';   // stand-in for a search box value
new RegExp(escapeRegex(userInput), 'gi').test('A.B*');   // true
new RegExp(userInput, 'gi').test('axb');                 // true — unescaped '.' matches any char
```

`RegExp.escape` escapes more than the fallback (whitespace, and a leading letter or digit as `\x..`), so its output looks different, but both produce a pattern that matches the input literally.

---

## 3. The Eight Flags

JavaScript regex supports eight flags, written after the closing `/`:

| Flag | Name | Purpose |
|---|---|---|
| `g` | global | Match all occurrences instead of stopping at the first |
| `i` | ignoreCase | Case-insensitive matching |
| `m` | multiline | `^` and `$` match line boundaries inside the string, not just start/end |
| `s` | dotAll | `.` matches newlines too (default: `.` skips `\n`) |
| `u` | unicode | Treat the pattern as a Unicode-aware regex; enables `\p{}`, `\u{...}`, surrogate-pair handling |
| `y` | sticky | Match must start exactly at `lastIndex`; no skipping |
| `d` | hasIndices | `exec`/`match` results include start/end indices for captures (ES2022) |
| `v` | unicodeSets | Stricter superset of `u`: enables set notation `[\p{A}--\p{B}]`, properties of strings (ES2024) |

**The most-used trio: `g`, `i`, `m`.** Stack them: `/foo/gim`.

```js
'Hello hello HELLO'.match(/hello/);    // ['hello'] — first match only
'Hello hello HELLO'.match(/hello/g);   // ['hello'] — every match, still case-sensitive
'Hello hello HELLO'.match(/hello/gi);  // ['Hello', 'hello', 'HELLO']
```

The common wrong guess is that `/hello/g` returns all three words. It does not: `g` finds *every* match but is still case-sensitive, so only the lowercase `hello` matches (and without `g`, the first match is that same lowercase `hello` at index 6, not the leading `Hello`). You need `i` as well to get all three.

**`g` vs `y` — easy to confuse:**
- `g` (global): scans forward from `lastIndex` looking for the next match.
- `y` (sticky): match MUST start at `lastIndex` exactly. If the next character isn't a match, the call fails — no skipping. That makes `y` the flag for tokenizers/parsers that consume input strictly in order.

Both flags make the regex object stateful, which is the source of the bug in [§12](#12-the-lastindex-gotcha). `u` and `v` are covered in [§10](#10-unicode-in-regex).

---

## 4. Character Classes

A character class describes "one character that is X".

### Built-in shortcuts

| Class | Matches | Inverse |
|---|---|---|
| `\d` | A digit `[0-9]` | `\D` (any non-digit) |
| `\w` | Word char `[A-Za-z0-9_]` | `\W` |
| `\s` | Whitespace (space, tab, newline, form feed, vertical tab, non-breaking space, etc.) | `\S` |
| `.` | Any character except newline (unless `s` flag) | — |

Even with the `u` flag, `\d` and `\w` stay ASCII-only (for backward compatibility). Use `\p{Number}` or `\p{Letter}` (below) for other scripts.

### Custom classes

```json
[abc]      // a, b, or c
[^abc]     // NOT a, b, or c (the ^ inside [] means negation)
[a-z]      // lowercase a through z
[A-Za-z0-9_]  // same as \w
[\d.]      // a digit OR a literal dot
```

Inside `[]`, most special characters lose their meaning. `.` is just a dot. `*` is a literal asterisk. The exceptions: `\`, `]`, `^` (only at start), `-` (between two chars).

### Predefined Unicode categories (with `u` or `v` flag)

```js
/\p{Letter}/u;             // any letter, any script
/\p{Lowercase}/u;
/\p{Script=Greek}/u;       // Greek letters
/\p{Number}/u;             // any number, including ⅔, ½
/\p{Emoji}/u;              // 😀, 🎉, etc.
/\P{Letter}/u;             // negation: not-a-letter
```

**Without the `u` flag, `\p{}` is silently broken.** It might be parsed as just `p` followed by literal characters. Always pair `\p{}` with `u` (or `v`).

---

## 5. Anchors and Word Boundaries

Anchors don't match characters — they match *positions*.

| Anchor | Matches |
|---|---|
| `^` | Start of string (or line, with `m` flag) |
| `$` | End of string (or line, with `m` flag) |
| `\b` | Word boundary — between `\w` and `\W` |
| `\B` | Non-word-boundary |
| `\A` | Start of string (some flavors; not JS) |
| `\Z` | End of string (some flavors; not JS) |

```js
/^hello$/.test('hello');         // true — entire string IS "hello"
/^hello$/.test('hello world');   // false — there's more after

/\bhello\b/.test('say hello to');  // true
/\bhello\b/.test('helloworld');    // false — no boundary between 'o' and 'w'
```

`\b` is positional — it matches the spot *between* a word char and a non-word char (or start/end of string).

**`m` flag changes `^` and `$`:**

```js
const text = 'one\ntwo\nthree';
text.match(/^two/);     // null — start of STRING is 'one'
text.match(/^two/m);    // ['two'] — start of LINE matches
```

`m` does not make `.` match newlines; that is the separate `s` (dotAll) flag.

---

## 6. Quantifiers — Greedy vs Lazy

Quantifiers say "how many of the previous thing".

| Quantifier | Meaning |
|---|---|
| `*` | Zero or more |
| `+` | One or more |
| `?` | Zero or one (optional) |
| `{n}` | Exactly n |
| `{n,}` | At least n |
| `{n,m}` | Between n and m, inclusive |

```js
/a*/;      // matches '', 'a', 'aa', 'aaa'...
/a+/;      // matches 'a', 'aa', 'aaa'...   (NOT empty)
/colou?r/; // matches 'color' or 'colour'
/\d{4}/;   // exactly four digits
/\d{2,4}/; // two to four digits
```

### Greedy vs lazy — the most important regex concept

By default, quantifiers are **greedy**: they match as much as possible.

```js
'<b>hello</b>'.match(/<.+>/);   // ['<b>hello</b>']  ← greedy: takes everything
```

`.+` greedily eats `b>hello</b`, then backtracks just enough to satisfy the trailing `>`. The result spans both tags.

Add `?` after the quantifier to make it **lazy** — match as little as possible:

```js
'<b>hello</b>'.match(/<.+?>/);  // ['<b>']  ← lazy: stops at first '>'
```

Lazy quantifiers: `*?`, `+?`, `??`, `{n,m}?`.

**When a token has a clear closer, a negated character class is usually faster and simpler than lazy `.+?`:**
- HTML tags: `/<[^>]+>/`
- JS strings: `/"[^"]*"/`
- Markdown links: `/\[([^\]]+)\]\(([^)]+)\)/`

---

## 7. Groups, Captures, and Backreferences

### Capturing groups

Parentheses do two things: group items together (so a quantifier applies to all of them) AND capture the matched text.

```js
'2026-05-09'.match(/(\d{4})-(\d{2})-(\d{2})/);
// ['2026-05-09', '2026', '05', '09']
//  full match    group 1  group 2  group 3
```

You can reference captures by index in:
- The match result array
- `replace()` replacement strings as `$1`, `$2`, ...
- The pattern itself as `\1`, `\2`, ... (backreferences)

```js
// Reformat date
'2026-05-09'.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1');
// '09/05/2026'

// Backreference: match repeated word
/\b(\w+)\s+\1\b/.test('the the cat');  // true — \1 means "same as group 1"
```

A backreference matches the literal *text* group 1 captured, not the group's pattern again: `/(.)\1/` matches `aa` but not `ab`.

### Named groups (ES2018)

Indices are fragile when patterns evolve. Names are clearer:

```js
const m = '2026-05-09'.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);
m.groups.year;   // '2026'
m.groups.month;  // '05'
m.groups.day;    // '09'

// In replacements, use $<name>; in the pattern itself, \k<name>
'2026-05-09'.replace(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
  '$<day>/$<month>/$<year>',
);
```

### Non-capturing groups

`(?:...)` groups without capturing — slightly faster, and keeps your numbered captures clean:

```js
// Match (http or https) followed by ://
/^(?:http|https):\/\//.test('https://example.com');  // true

// Without (?:), 'http' or 'https' would be group 1, shifting everything else down.
```

**Rule of thumb:** use `(?:)` for grouping, `()` only when you actually need the capture.

---

## 8. Lookarounds — Look Ahead and Behind

Lookarounds match positions based on what follows or precedes — without consuming those characters, so the context is checked but left out of the result.

| Syntax | Name | Matches |
|---|---|---|
| `(?=...)` | Positive lookahead | Position where the next chars match `...` |
| `(?!...)` | Negative lookahead | Position where the next chars DON'T match `...` |
| `(?<=...)` | Positive lookbehind (ES2018) | Position where the previous chars match `...` |
| `(?<!...)` | Negative lookbehind (ES2018) | Position where the previous chars DON'T match `...` |

```js
// "digits followed by KB" — but capture only the digits
'500KB and 200MB'.match(/\d+(?=KB)/g);   // ['500']

// "$ NOT followed by 0" — match prices that aren't free
/\$(?!0)\d+/.test('$5');        // true
/\$(?!0)\d+/.test('$0');        // false

// "digits preceded by $" — extract dollar amounts
'price: $42'.match(/(?<=\$)\d+/);   // ['42']

// "word NOT preceded by 'no '"
/(?<!no )good/.test('not good');    // true   ('not ' ≠ 'no ')
/(?<!no )good/.test('no good');     // false  ('no ' precedes 'good')
```

**Strong password example combining lookaheads** (the guide uses this one version everywhere; "special" means any character that is not a letter or digit):

```js
// Must contain: 1+ lowercase, 1+ uppercase, 1+ digit, 1+ special, 8+ chars
const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
strong.test('Hello123!');   // true
strong.test('hello123');    // false (no uppercase, no special)
```

Each `(?=.*X)` is a separate "must contain X somewhere" check. None consumes input, so they all assert from position 0, and the final `.{8,}` is what actually consumes the string and enforces the length. To forbid spaces, change `.{8,}` to `\S{8,}`.

---

## 9. Alternation and Escaping

`|` means "or". Pretty straightforward — but watch operator precedence: `|` binds more loosely than anything else, including anchors.

```js
/cat|dog/        // matches 'cat' OR 'dog'
/the (cat|dog)/  // matches 'the cat' or 'the dog'
/the cat|dog/    // matches 'the cat' OR 'dog' — NOT what you might expect
```

Always use `(?:...)` to scope alternation when the surrounding pattern matters:

```js
/^(?:GET|POST|PUT|DELETE) /  // matches HTTP method at start
```

### Escaping special characters

These characters have special meaning and need a `\` to match literally:

```
.  *  +  ?  ^  $  |  (  )  [  ]  {  }  \  /
```

```js
/\$\d+/;       // match a literal $ followed by digits — '$42'
/\.\d+/;       // match a literal dot followed by digits — '.42'
/\\n/;         // match the literal characters '\' and 'n'
/\//;          // match a literal forward slash
```

Inside `[]`, fewer escapes are needed (most special chars are literal):

```js
/[.+*]/;        // matches a literal '.', '+', or '*'
/[\]]/;         // matches a literal ']' (must escape the closer)
```

For escaping a whole user-supplied string, use `RegExp.escape` ([§2](#2-two-ways-to-make-a-regex)).

---

## 10. Unicode in Regex

JavaScript strings are stored as UTF-16 code units (16-bit chunks), and without the `u` flag a regex treats each chunk as one character. Characters in the BMP (Basic Multilingual Plane, the first 65,536 code points, covering almost all living scripts) fit in one chunk; emoji and other characters beyond it are stored as two chunks (a "surrogate pair") — so `.` matches half an emoji.

```js
'😀'.length;                // 2 — it's two UTF-16 units
/^.$/.test('😀');           // false — '.' matches one code unit, not the whole emoji
/^.$/u.test('😀');          // true — 'u' flag makes '.' code-point-aware
```

The `u` flag also enables:
- `\u{1F600}` code-point escapes
- `\p{...}` Unicode property classes
- Stricter parsing: invalid escapes throw instead of silently degrading

```js
/\p{Script=Devanagari}+/u.test('हिन्दी');     // true
/\p{Currency_Symbol}/u.test('$');              // true
/\p{Currency_Symbol}/u.test('€');              // true
```

The `v` flag (ES2024) is a stricter superset with different escape rules inside classes. It adds set operations and properties of strings (multi-character matches such as `\p{RGI_Emoji}`). Prefer `v` when targeting modern engines:

```js
// Letters that are not Greek
/[\p{Letter}--\p{Script=Greek}]/v
```

**Use `u` (or `v`) on every regex that touches user-facing text.** Without it, an emoji in a name field can break your validation. The performance cost is negligible.

---

## 11. JavaScript Regex API

### `RegExp.prototype.test(str)` — boolean

Fastest way to ask "is this pattern in the string". Returns `true`/`false`.

```js
/\d/.test('hello42');   // true
```

### `RegExp.prototype.exec(str)` — match details

Returns an array with the match + captures, or `null`. With `g` or `y` flag, advances `lastIndex` so you can iterate:

```js
const re = /\d+/g;
let m;
while ((m = re.exec('a1 b22 c333')) !== null) {
  console.log(m[0], m.index);
}
// 1 1
// 22 4
// 333 8
```

### `String.prototype.match(regex)` — array

Without `g`: returns first match details (same shape as `exec`).
With `g`: returns array of all matches as plain strings (no captures, no indices).

```js
'a1 b22 c333'.match(/\d+/);    // ['1', index: 1, ...]
'a1 b22 c333'.match(/\d+/g);   // ['1', '22', '333']  ← captures lost
```

### `String.prototype.matchAll(regex)` — iterator

Modern replacement for the `exec` loop. **Requires the `g` flag**; a non-global regex throws a `TypeError`. Returns an iterator of match arrays *with* captures, indices and named groups preserved. It works on a copy of the regex, so the caller's `lastIndex` is never touched.

```js
const matches = 'a1 b22 c333'.matchAll(/(\D)(\d+)/g);
for (const m of matches) {
  console.log(m[0], m[1], m[2]);   // full, letter, digits
}
// a1 a 1
// b22 b 22
// c333 c 333
```

Always prefer `matchAll` over the `exec`-while loop for new code.

### `String.prototype.replace(regex, replacement)`

Replacement can be a string with `$1`, `$2`, `$<name>`, `$&` (full match), or a function:

```js
'price: 42'.replace(/(\d+)/, '$$$1');                    // 'price: $42'
'price: 42'.replace(/(\d+)/, (match, num) => `$${num * 2}`);  // 'price: $84'

// Function form receives: match, ...captures, offset, full string, [groups]
'a1 b22'.replace(/(\D)(\d+)/g, (full, letter, digits) => `${letter}-${digits}`);
// 'a-1 b-22'
```

### `String.prototype.replaceAll(regex, replacement)` (ES2021)

Cleaner than `replace` with `g` flag — but still **requires the `g` flag** when given a regex (throws otherwise). For plain strings, use without regex.

```js
'foo foo foo'.replaceAll('foo', 'bar');         // 'bar bar bar'
'a1 b22'.replaceAll(/\d+/g, 'X');               // 'aX bX'
'a1 b22'.replaceAll(/\d+/, 'X');                // ❌ TypeError: must use 'g' flag
```

### `String.prototype.search(regex)` — index

Returns the index of the first match, or `-1`. Like `indexOf` but for patterns.

```js
'hello world'.search(/world/);   // 6
'hello world'.search(/xyz/);     // -1
```

### `String.prototype.split(regex)`

Split on a pattern. Captures inside the pattern get included in the result (use `(?:...)` to group without keeping the delimiter). A delimiter at the very end leaves an empty string after it:

```js
'a1b2c3'.split(/\d/);         // ['a', 'b', 'c', '']
'a1b2c3'.split(/(\d)/);       // ['a', '1', 'b', '2', 'c', '3', '']  ← captures kept
```

---

## 12. The `lastIndex` Gotcha

This is the #1 source of regex bugs in JS. With `g` or `y` flag, the regex object **maintains internal state** (`lastIndex`) across calls.

```js
const re = /\d/g;
re.test('a1');   // true
re.test('b2');   // false  ← surprising!
re.test('b2');   // true
re.test('b2');   // false
```

What's happening: after the first `test('a1')` succeeds, `lastIndex` is 2. The second call starts searching at index 2 of `'b2'`, which is past the end → no match → `lastIndex` resets to 0 → next call works.

**Four ways to avoid this:**

1. **Don't use `g` with `test()` or single-shot `replace()` calls.** They don't need it. This is almost always the right fix.
2. **Use a fresh regex if you must use `g`:**
   ```js
   for (const s of ['a1', 'b2']) {
     if (/\d/g.test(s)) { /* … */ }   // new regex each iteration — allocates, but safe
   }
   ```
3. **Or reset manually:**
   ```js
   const re = /\d/g;
   re.lastIndex = 0;
   ```
4. **Use `matchAll`** to iterate: it works on a copy, so it never reads or moves your regex's `lastIndex`.

Even worse: a single `test()` call is synchronous, so two callers cannot interrupt each other mid-call, but a module-level `g` regex is shared by every caller. Whoever used it last leaves `lastIndex` wherever their match ended, and the next caller — a different request handler, a different component — silently starts from there. And an `exec` loop that `await`s between iterations can be interleaved with another caller's loop on the same regex. **Don't share `g`-flagged regexes between unrelated callers.**

---

## 13. Performance: Catastrophic Backtracking and ReDoS

Regex engines try alternatives on failure ("backtracking"). For most patterns this is fine. For some, it explodes into exponential time.

### The classic catastrophic pattern

```text
/^(a+)+$/.test('aaaaaaaaaaaaaaaaaaaaaaaaaa!');
// Takes seconds, and the time roughly doubles with each extra 'a'.
```

A run of *n* `a`s can be split between the inner `a+` and the outer `+` in 2^(n−1) ways. The trailing `!` forces the match to fail, so the engine tries every split before giving up: with 26 `a`s, that is 2^25, about 33 million. (This block is tagged `text` because running it would stall the playground.)

The fix is to remove the nesting: `(a+)+` matches exactly what `a+` matches, so `/^a+$/` fails instantly.

### ReDoS — Regular expression Denial of Service

If user input feeds into a regex with this shape, an attacker can post a small string that hangs your server — and in Node, a regex runs on the single main thread, so one hung match stalls every other request. Real incidents exist: in the [Cloudflare outage of 2 July 2019](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/), a WAF rule containing `.*.*=.*` backtracked super-linearly (polynomially, not exponentially like `(a+)+`), pinned CPUs worldwide and dropped about 80% of Cloudflare's traffic.

### Patterns to avoid

- **Nested quantifiers:** `(a+)+`, `(a*)*`, `(.+)+` — same alternative, multiple ways to match.
- **Overlapping alternations with quantifier:** `(a|aa)+`, `(\w|\d)+`.
- **Unanchored `.*` followed by a literal:** `.*foo$` on a long string without `foo` is slow. The engine retries the whole scan from every start position, so the work grows with the square of the input length — not exponential like `(a+)+`, but enough to stall on large input. Anchoring it as `^.*foo$` fixes this: the match can only start at position 0, so the engine scans once and gives up.

### Defensive patterns

- **Use specific character classes** instead of `.`: `[^>]+` instead of `.+?`.
- **Anchor patterns**: `^` and `$` cut down the search space.
- **Know what JS is missing.** Other flavors (Java, PHP) have *possessive quantifiers* and *atomic groups* — syntax that tells the engine "once you've matched this, never backtrack into it", which removes the exponential retrying. JavaScript has neither, so in JS the fix has to be a pattern that has only one way to match.
- **Bound user-driven input length** before matching.
- **Use `RE2`** (Google's non-backtracking engine) for hostile input. It guarantees matching time grows linearly with input length, so no pattern can hang it; the price is that it drops the features that need backtracking, such as backreferences (`\1`) and lookarounds. `re2` exists for Node via the `re2` package.

```js
// SAFE for user input: specific class, no nested quantifiers
const pattern = /^[a-z0-9-]{1,40}$/i;
```

---

## 14. Commonly Used Patterns

These are battle-tested patterns. Each has caveats — read them.

### Email (pragmatic, not RFC 5322)

```js
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
email.test('hello@example.com');     // true
email.test('hello@example');         // false
email.test('..@a.b');                // true — a shape check, not a validator
```

Piece by piece: `[^\s@]+` is the local part (no whitespace, no second `@`), then a literal `@`, the domain, a literal `\.`, and the top-level domain. A common variant ends in `[^\s@]{2,}$` to require a TLD of at least two characters (every real TLD has two or more).

**The full RFC 5322 regex is ~6,000 chars and not what you want.** This loose pattern catches obvious typos. For real validation, send a confirmation email — that's the only way to verify deliverability.

### URL

```js
const url = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
url.test('https://example.com/path?q=1');   // true
url.test('not a url');                      // false
```

For more thoroughness, use the URL constructor:

```js
function isValidURL(s) {
  try { new URL(s); return true; }
  catch { return false; }
}
```

### Phone — international, basic

```js
const phone = /^\+?[1-9]\d{6,14}$/;   // E.164: + then 7–15 digits, no leading 0
phone.test('+14155552671');   // true
phone.test('14155552671');    // true
```

For real phone validation, use the `libphonenumber-js` library — there are too many country-specific rules.

### IPv4

```js
const ipv4 = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
ipv4.test('192.168.1.1');   // true
ipv4.test('256.0.0.1');     // false (256 is invalid)
```

The `(25[0-5]|2[0-4]\d|1?\d?\d)` term matches 0–255 properly.

### ISO date — YYYY-MM-DD (loose)

```js
const isoDate = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
isoDate.test('2026-05-09');   // true
isoDate.test('2026-13-01');   // false (no month 13)
isoDate.test('2026-02-30');   // true — the regex cannot know month lengths
```

For a real date check, parse it and round-trip it:

```js
function isValidDate(s) {
  const d = new Date(s);
  return !isNaN(d) && d.toISOString().startsWith(s);
}
isValidDate('2026-02-30');   // false
```

### Time — HH:MM 24-hour

```js
const time24 = /^([01]\d|2[0-3]):[0-5]\d$/;
time24.test('23:59');   // true
time24.test('24:00');   // false
```

### HEX color

```js
const hex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;   // 3, 6, or 8 hex
hex.test('#fff');         // true
hex.test('#abc123');      // true
hex.test('#abc123ff');    // true (with alpha)
hex.test('#xyz');         // false
```

### Strong password

The same pattern as [§8](#8-lookarounds-look-ahead-and-behind), which explains how the lookaheads work:

```js
// 8+ chars, at least one lowercase, one uppercase, one digit, one special (non-alphanumeric)
const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
strong.test('Hello123!');   // true
```

### Username — alphanumeric + underscore + hyphen, 3–20 chars

```js
const username = /^[a-zA-Z0-9_-]{3,20}$/;
username.test('john_doe');   // true
username.test('jd');          // false (too short)
```

### UUID v4

```js
const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
uuidV4.test('123e4567-e89b-42d3-a456-426614174000');   // true
```

The `4[0-9a-f]{3}` enforces version 4. The `[89ab]` enforces the variant nibble.

### Credit card — basic (also use Luhn check)

```js
const visa       = /^4[0-9]{12}(?:[0-9]{3})?$/;
const mastercard = /^(?:5[1-5][0-9]{14}|2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9]{2}|7(?:[01][0-9]|20))[0-9]{12})$/;
const amex       = /^3[47][0-9]{13}$/;
```

Always **also run the Luhn checksum** — regex only validates shape.

### Slug (kebab-case, URL-safe)

```js
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
slug.test('hello-world');   // true
slug.test('-hello');         // false
slug.test('hello--world');   // false (double dash)
```

### Whitespace trim alternatives

```js
'  hello  '.trim();                          // built-in — prefer this
'  hello  '.replace(/^\s+|\s+$/g, '');        // regex equivalent

// Collapse consecutive whitespace into one space
'hello    world'.replace(/\s+/g, ' ');        // 'hello world'
```

### Markdown bold and italic

```js
const bold   = /\*\*(.+?)\*\*/g;
const italic = /(?<!\*)\*([^*]+?)\*(?!\*)/g;   // negative lookarounds avoid bold

'this is **bold** and *italic*'
  .replace(bold,   '<strong>$1</strong>')
  .replace(italic, '<em>$1</em>');
```

### HTML tags (with the obligatory caveat)

```js
const tag = /<([a-z][a-z0-9]*)\b[^>]*>(.*?)<\/\1>/gi;
```

**Don't use this for general HTML parsing.** Use `DOMParser` or a real HTML parser. The pattern above is fine for "find tag-shaped substrings" in trusted content, not for sanitization.

---

## 15. Real-World JS Use Cases

### Form validation

```js
function validate(form) {
  const errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email';
  if (!/^.{8,}$/.test(form.password)) errors.password = 'Min 8 chars';
  if (!/^[a-z0-9_-]{3,20}$/i.test(form.username)) errors.username = 'Letters, numbers, _, - only';
  return errors;
}
```

### Slug generation

```js
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')                    // decompose accented chars (é → e + ´)
    .replace(/[̀-ͯ]/g, '')     // strip combining marks
    .replace(/[^a-z0-9]+/g, '-')         // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '')             // trim leading/trailing hyphens
    .replace(/-{2,}/g, '-');             // collapse multiple hyphens
}

slugify('Hello, World!');                       // 'hello-world'
slugify('  Café & Crème Brûlée  ');             // 'cafe-creme-brulee'
```

### Highlight search matches

```js
function highlight(text, query) {
  if (!query) return text;
  // RegExp.escape (ES2025) where available; see §2
  const escape = RegExp.escape ?? (s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return text.replace(new RegExp(escape(query), 'gi'), m => `<mark>${m}</mark>`);
}
highlight('Hello World', 'world');
// 'Hello <mark>World</mark>'
```

### Parse query strings

```js
function parseQuery(qs) {
  const out = {};
  qs.replace(/^\?/, '').replace(/([^&=]+)=([^&]*)/g, (_, k, v) => {
    out[decodeURIComponent(k)] = decodeURIComponent(v);
  });
  return out;
}
parseQuery('?name=Alice&age=30');  // { name: 'Alice', age: '30' }
```

In production, prefer `URLSearchParams` over hand-rolled regex parsing.

### Mask sensitive data (e.g., logs)

```js
function maskCardNumbers(s) {
  return s.replace(/\b(?:\d[ -]*?){13,19}\b/g, '****-****-****-****');
}
maskCardNumbers('Card 4111 1111 1111 1111 charged');
// 'Card ****-****-****-**** charged'
```

### Extract URLs from text

```js
function extractUrls(text) {
  return text.match(/https?:\/\/[^\s<>"]+/g) || [];
}
extractUrls('See https://example.com and http://foo.bar/baz?q=1');
// ['https://example.com', 'http://foo.bar/baz?q=1']
```

### Strip HTML tags (low-stakes; for high-stakes use DOMPurify)

```js
function stripTags(html) {
  return html.replace(/<[^>]*>/g, '');
}
stripTags('<p>Hello <b>world</b></p>');   // 'Hello world'
```

For sanitization where security matters (XSS prevention), regex is **not safe**. Use [DOMPurify](https://github.com/cure53/DOMPurify).

### camelCase ↔ kebab-case

```js
const toKebab = s => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
const toCamel = s => s.replace(/-(.)/g, (_, c) => c.toUpperCase());

toKebab('helloWorld');         // 'hello-world'
toCamel('hello-world');        // 'helloWorld'
```

### Replace tokens in templates

```js
function fillTemplate(tpl, data) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '');
}
fillTemplate('Hi {{name}}, you are {{age}}', { name: 'Ana', age: 30 });
// 'Hi Ana, you are 30'
```

---

## 16. Anti-Patterns and When NOT to Use Regex

### ❌ Parsing HTML with regex

```js
// Looks fine until you encounter <a href="</a>">
'<a href="</a>">link</a>'.match(/<a [^>]+>(.*?)<\/a>/);
```

HTML allows `<` inside attribute values, comments, CDATA, etc. Use `DOMParser`:

```js
const html = '<a href="/one">one</a> <a href="/two">two</a>';   // sample input
new DOMParser().parseFromString(html, 'text/html').querySelectorAll('a');
```

### ❌ Parsing JSON

`JSON.parse` exists. Use it. Regex can't handle nested objects correctly.

### ❌ Validating "real" emails

The RFC 5322 regex is famously [unmaintainable](https://emailregex.com/). Use the shape check from [§14](#email-pragmatic-not-rfc-5322) to catch typos; the address is valid iff the user receives your confirmation message.

### ❌ Splitting CSV with `split(',')`

Quoted fields containing commas break this. Use [Papa Parse](https://www.papaparse.com/) or a real CSV library.

### ❌ Counting balanced brackets

A regex cannot match arbitrary nesting, because it has no way to remember how many brackets are still open. Balanced brackets need that memory — push on `(`, pop on `)` — which is exactly a stack. PCRE (the regex library used by PHP and others) has a recursion extension that works around this, but JS doesn't. Use a stack.

### ❌ Sanitizing HTML for XSS prevention

Use `DOMPurify`, or a templating library that escapes by default (React JSX, Vue). Hand-rolled regex sanitizers have lost to XSS attacks for 20 years. Tricky Q8 below shows why even simple escaping is easy to get wrong.

### ❌ Long single regex

If your pattern exceeds ~80 chars, nobody (including you next month) can review it. Other languages solve this with an `x` flag ("extended" mode, which lets you spread a pattern over several lines with comments). JS has no `x` flag, so the equivalent is to build the pattern from small named pieces and join them with a template literal:

```js
// Hard to read
const re = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?Z$/;

// Easier (compose from named pieces)
const year   = /(?<year>\d{4})/.source;
const month  = /(?<month>0[1-9]|1[0-2])/.source;
const day    = /(?<day>0[1-9]|[12]\d|3[01])/.source;
const time   = /(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})/.source;
const re2    = new RegExp(`^${year}-${month}-${day}T${time}(?:\\.\\d+)?Z$`);
```

---

## 17. Cheat Sheet

A condensed recap of §3–§12. The standalone [Regex cheat sheet](/cheatsheets/regex) has the longer version.

```
CLASSES      \d \w \s  (inverse \D \W \S)   .  any but \n (any with /s)
             [abc] [^abc] [a-z]             \p{X} \P{X}  (need /u or /v)
ANCHORS      ^ $ (per line with /m)         \b \B
QUANTIFIERS  * + ? {n} {n,} {n,m}           greedy; add ? for lazy: *? +? ?? {n,m}?
GROUPS       (...) capture   (?:...) non-capture   (?<name>...) named
             \1 \k<name> backreference      $1 $<name> $& in replacement strings
LOOKAROUNDS  (?=...) (?!...) ahead          (?<=...) (?<!...) behind (ES2018)
FLAGS        g global  i ignore case  m multiline  s dotAll
             u unicode  y sticky  d hasIndices  v unicodeSets
METHODS      re.test(s) boolean             re.exec(s) match; advances lastIndex with /g or /y
             s.match(re) first, or all strings with /g
             s.matchAll(re) iterator, needs /g    s.replaceAll(re, …) needs /g
             s.replace(re, str|fn)          s.search(re) index or -1    s.split(re)
ESCAPING     RegExp.escape(s) (ES2025)      new RegExp('\\d') doubles backslashes
GOTCHAS      /g + test() keeps lastIndex (§12)    (a+)+ backtracks exponentially (§13)
             .  skips \n unless /s          [.+] most chars are literal inside a class
```

---

## 18. Interview Questions & Answers

### Beginner

**Q1: What is a regular expression and what is it used for?**

A regex is a pattern-matching DSL (domain-specific language — a small language built for one job). You describe the shape of a string with metacharacters, and the engine answers: does it match, where, what was matched, and what should replace it. It is used for input validation, search-and-replace, tokenization, log parsing and slug generation. Its limit is nesting: it can't parse recursive structures like HTML or JSON, so reach for a real parser there. → Full explanation: [§1](#1-what-regex-is-and-isnt)

---

**Q2: What's the difference between `/foo/` and `new RegExp('foo')`?**

The literal is compiled at parse time and is the default choice. The constructor takes a string, so it is for dynamic patterns such as user-supplied search text. The trap is double escaping: `/\d/` equals `new RegExp('\\d')`, not `new RegExp('\d')`, because the string parser eats one backslash first. With user input, escape it first, with `RegExp.escape` (ES2025) or a fallback. → Full explanation: [§2](#2-two-ways-to-make-a-regex)

---

**Q3: What do the `g` and `i` flags do?**

- `g` (global): match all occurrences. Without it, `match` returns only the first.
- `i` (ignoreCase): case-insensitive matching. `/cat/i` matches `Cat`, `CAT`, `cat`.

`g` has a side effect: the regex object tracks `lastIndex` between `exec`/`test` calls, the source of "passes once, then fails on the same string" bugs ([§12](#12-the-lastindex-gotcha)).

---

**Q4: What's the difference between `*` and `+`?**

- `*` matches zero or more of the preceding token.
- `+` matches one or more.

`/a*/.exec('xyz')` matches the empty string at position 0 (zero `a`s is fine). `/a+/.exec('xyz')` returns null — at least one `a` is required.

---

**Q5: How do `\d`, `\w`, `\s` differ from `[0-9]`, `[A-Za-z0-9_]`, `[ \t\n\r]`?**

`\d` and `\w` match the same ASCII characters as `[0-9]` and `[A-Za-z0-9_]`, and they stay ASCII-only even with the `u` flag (for backward compatibility); use `\p{Number}` for non-Latin digits. `\s` is wider than `[ \t\n\r]`: it also matches form feed, vertical tab, non-breaking space and other Unicode spaces. The shortcuts are shorter; the class form lets you add characters, as in `[\d.]` for "digit or dot". → Full explanation: [§4](#4-character-classes)

### Intermediate

**Q6: What's a capturing group, and what's the difference between `()` and `(?:)`?**

A capturing group `(...)` groups the inner pattern so quantifiers apply to all of it, AND remembers the matched text (in the result, as `$1` in `replace`, as `\1` in the pattern). `(?:...)` only groups:

```js
/(?:GET|POST) \/users/.exec('GET /users');
// match: ['GET /users']  — no captures
```

With `(GET|POST)`, the method would be `$1` and every later group's index would shift. Non-capturing groups keep numbered captures in the right slots and are slightly faster. → Full explanation: [§7](#7-groups-captures-and-backreferences)

---

**Q7: Greedy vs lazy quantifiers — explain with an example.**

Quantifiers are greedy by default: `'<b>hello</b>'.match(/<.+>/)` returns the whole `'<b>hello</b>'`, because `.+` eats everything and backtracks only far enough to find the last `>`. Adding `?` (`/<.+?>/`) makes it lazy, so it stops at the first `>` and returns `'<b>'`. In practice, a negated class like `<[^>]+>` is faster and clearer than a lazy quantifier when the token has a clear closer. → Full explanation: [§6](#6-quantifiers-greedy-vs-lazy)

---

**Q8: Explain lookaheads and lookbehinds.**

They assert what follows (`(?=X)`, `(?!X)`) or precedes (`(?<=X)`, `(?<!X)`) a position without consuming it, so the context is checked but left out of the match: `'500KB and 200MB'.match(/\d+(?=KB)/g)` returns `['500']`. The classic use is a password rule, where each `(?=.*X)` is an independent "must contain X" check made from position 0, and a final `.{8,}` consumes the string. → Full explanation: [§8](#8-lookarounds-look-ahead-and-behind)

---

**Q9: What is `lastIndex`, and why does this code behave strangely?**

```js
const re = /\d/g;
re.test('a1');   // true
re.test('a1');   // false
re.test('a1');   // true
```

A successful `test` or `exec` on a `g`-flagged regex sets `re.lastIndex` past the match, and the next call resumes there. On the same string, the second search starts past the digit, fails, and resets `lastIndex` to 0, so the third call succeeds again. The bug bites when one module-level regex is shared, because the result depends on who ran before you. Fix: drop `g` for single checks, reset `lastIndex`, create a fresh regex, or iterate with `matchAll`. → Full explanation: [§12](#12-the-lastindex-gotcha)

---

**Q10: How do you use a captured group in a replacement?**

In a replacement string, use `$1`, `$2`, ... or `$<name>` for named captures (and `$&` for the whole match). For logic, pass a function, which receives `(match, ...captures, offset, fullString, namedGroupsObject?)`:

```js
'2026-05-09'.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1');   // '09/05/2026'
'a1 b22'.replace(/(\D)(\d+)/g, (full, letter, digits) => `${letter}-${parseInt(digits) * 2}`);
// 'a-2 b-44'
```

→ Full explanation: [§7](#7-groups-captures-and-backreferences) and [§11](#11-javascript-regex-api)

### Advanced

**Q11: Write a regex that matches a valid email address (interview-pragmatic version).**

```js
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

It checks the shape "something@something.something": no whitespace, exactly one `@`, and a dot in the domain. It accepts things RFC 5322 forbids (like `..@a.b`) and rejects some valid edge cases. The answer interviewers want:

> The full RFC 5322 regex is over 6,000 characters. I'd use a permissive shape check like the one above, then verify deliverability with a confirmation email — that's the only way to know an address is real.

→ Full explanation: [§14](#email-pragmatic-not-rfc-5322)

---

**Q12: Write a regex to validate a strong password.**

Requirements: at least 8 characters, at least one uppercase, one lowercase, one digit, one special character.

```js
const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
strong.test('Hello123!');   // true
```

The four lookaheads are independent "somewhere in the string there must be X" checks, all made from position 0. Because they consume nothing, `.{8,}` is still needed to consume the input and enforce the length. To forbid spaces, use `\S{8,}`. → Full explanation: [§8](#8-lookarounds-look-ahead-and-behind)

---

**Q13: How would you parse a date string `2026-05-09` and extract year/month/day?**

Use named capture groups:

```js
const dateRe = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/;
const m = '2026-05-09'.match(dateRe);
const { year, month, day } = m.groups;
```

To reject `2026-13-01`, tighten the groups to `(?<month>0[1-9]|1[0-2])` and `(?<day>0[1-9]|[12]\d|3[01])`. The regex still accepts `2026-02-30`, because it cannot know month lengths. Real date validation parses the string and checks that it round-trips ([§14](#iso-date-yyyy-mm-dd-loose) has `isValidDate`).

---

**Q14: What is catastrophic backtracking? How do you avoid it?**

When a pattern can match the same input in many ways, the engine tries every way before it reports failure. With nested quantifiers that count is exponential: `^(a+)+$` against `aaaaaaaaaaaaaaaa!` has 2^15 ways to split the 16 `a`s, and the `!` forces it to try all of them. Attackers exploit this as ReDoS, a small input that hangs your server. Avoid nested quantifiers like `(a+)+` and overlapping alternations like `(a|aa)+`, prefer specific classes, anchor, bound input length, and use RE2 (the `re2` npm package) for untrusted input. → Full explanation: [§13](#13-performance-catastrophic-backtracking-and-redos)

---

**Q15: How does `String.prototype.matchAll` differ from a `while`-`exec` loop?**

The old idiom:

```js
const s = 'a1 b22 c333';
const re = /\d+/g;
let m;
const matches = [];
while ((m = re.exec(s)) !== null) matches.push(m);
```

The new idiom:

```js
const s = 'a1 b22 c333';
const matches = [...s.matchAll(/\d+/g)];
```

Both give full match objects (captures, indices, named groups), unlike `s.match(/\d+/g)`, which returns plain strings. `matchAll` works on a copy of the regex, so there is no `lastIndex` to reset. It requires the `g` flag and throws a `TypeError` without it, which forces you to say you want all matches. → Full explanation: [§11](#11-javascript-regex-api)

---

**Q16: Explain the `u` and `v` flags. When do you need them?**

Use `u` (or its newer superset `v`) whenever the text might contain emoji or you need `\p{Letter}`-style property classes. Without it, the regex works on UTF-16 code units, so a character outside the BMP (such as an emoji, stored as a surrogate pair) counts as two: `/^.$/.test('😀')` is `false`, and `/^.$/u.test('😀')` is `true`. `u` also enables `\u{...}` escapes and stricter parsing. `v` (ES2024) adds set operations like `[\p{Letter}--\p{Script=Greek}]` and properties of strings. → Full explanation: [§10](#10-unicode-in-regex)

---

## 19. Tricky Questions

**Q1: What's wrong with this code, and how do you fix it?**

```js
const isDigit = /\d/g;
function checkInputs(strings) {
  return strings.map(s => isDigit.test(s));
}
checkInputs(['1', '1', '1']);   // [true, false, true]
```

The `g` flag makes `lastIndex` persist on the shared regex. After matching `'1'`, `lastIndex` is 1, so the second `test('1')` starts past the end, returns `false` and resets to 0. The fix is almost always to drop `g`: `const isDigit = /\d/;`. → Other fixes: [§12](#12-the-lastindex-gotcha)

---

**Q2: Why does `/^abc$/m.test('xyz\nabc\ndef')` return `true`, but `/^abc$/.test('xyz\nabc\ndef')` returns `false`?**

Without `m`, `^` and `$` match only the start and end of the whole string, so the string would have to be exactly `'abc'`. With `m`, they match at every line boundary (`\n`), so it is enough for *some line* to be `'abc'`, and the middle line is. `m` does NOT make `.` match newlines; that is the `s` (dotAll) flag.

---

**Q3: What's the difference between these two regexes that "look the same"?**

```js
/^foo|bar$/.test('foobaz');   // true
/^(foo|bar)$/.test('foobaz'); // false
```

Operator precedence: `|` binds loosest, so the first regex is `(^foo)|(bar$)`, "starts with foo OR ends with bar", and `'foobaz'` starts with foo. The second anchors the whole alternation: "the whole string is foo or bar". When alternation meets anchors, scope it with `(?:...)`. → [§9](#9-alternation-and-escaping)

---

**Q4: Why does this regex hang the browser tab?**

```text
/^(a+)+$/.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!');
```

Catastrophic backtracking. A run of 30 `a`s can be split between the inner `a+` and the outer `+` in 2^29 ways, and the trailing `!` forces the engine to try every one before failing (several seconds of CPU in Node 24). With user-controlled input this is a ReDoS hole. **Fix:** `(a+)+` matches exactly what `a+` matches, so drop the outer group: `/^a+$/`. → [§13](#13-performance-catastrophic-backtracking-and-redos), including the Cloudflare outage

---

**Q5: What does this print, and why?**

```js
const re = /(.)\1/;
console.log(re.test('aa'));     // ?
console.log(re.test('ab'));     // ?
```

- `'aa'` → `true`
- `'ab'` → `false`

`\1` is a *backreference*: it matches the literal text group 1 captured, not the pattern `.` again. So `(.)\1` matches any doubled character (`aa`, `99`, two spaces), and `'ab'` has none. The same trick detects stuttering:

```js
/\b(\w+)\s+\1\b/.test('the the cat');   // true
```

---

**Q6: Why does `'abc'.split(/(b)/)` return `['a', 'b', 'c']` instead of `['a', 'c']`?**

When the split pattern contains a capturing group, the captured text is **interleaved into the result**, by design, so you can keep the delimiters. Use `(?:...)` to group without keeping them:

```js
'1,2;3,4'.split(/([,;])/);   // ['1', ',', '2', ';', '3', ',', '4']  ← kept
'1,2;3,4'.split(/(?:[,;])/); // ['1', '2', '3', '4']                 ← dropped
```

---

**Q7: How do you write a regex that matches a string but only if it does NOT contain a forbidden word?**

Use a negative lookahead anchored at the start:

```js
const re = /^(?!.*forbidden).*$/i;
re.test('hello world');         // true
re.test('this is forbidden');   // false
```

`(?!.*forbidden)` asserts, from position 0, that no `forbidden` appears anywhere ahead; it consumes nothing, so `.*` then consumes the content. Stack them for several words:

```js
// Must not contain 'admin' OR 'root'
/^(?!.*admin)(?!.*root).*$/i;
```

---

**Q8: What's wrong with using `replace(/&/g, '&amp;').replace(/</g, '&lt;')` to escape HTML?**

The order is right (`&` must go first, or the `&` in `&lt;` would be re-encoded as `&amp;lt;`), but it is incomplete. It misses `>`, `"` and `'`, and HTML-body escaping does nothing for attribute, script, CSS or URL contexts, which each have their own rules.

**Correct approach for HTML body content** (still not enough for attribute / script / URL contexts):

```js
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

For real XSS prevention, use a templating library that escapes by default (React JSX, Vue) or `DOMPurify` for user-supplied HTML ([§16](#16-anti-patterns-and-when-not-to-use-regex)).

---

## References

- [MDN — Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions)
- [MDN — RegExp object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
- [MDN — Cheat Sheet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Cheatsheet)
- [TC39 — RegExp `v` flag proposal](https://github.com/tc39/proposal-regexp-v-flag)
- [regex101.com](https://regex101.com) — interactive tester
- [Cloudflare regex outage post-mortem](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/)
- [DOMPurify](https://github.com/cure53/DOMPurify) — for XSS-safe HTML sanitization
