# Regex — The Complete JavaScript Guide

Regular expressions (regex) are a tiny domain-specific language for **describing patterns in text**. You write a pattern, you ask "does this string contain it / where / replace it with what", and the regex engine answers in microseconds. They're in every language; this guide focuses on the JavaScript flavor — `RegExp` literals, `String` methods, the eight flags, and the gotchas that bite real codebases.

Regex shows up everywhere you read user input, transform text, or do any sort of "is this string shaped like X" check. Form validation, URL parsing, slug generation, search highlighting, file globs, Markdown rendering, log parsing — all regex underneath. Knowing the language well separates engineers who guess-and-check until tests pass from engineers who write a pattern, look at it once, and ship.

## Table of Contents

- [1. What Regex Is and Isn't](#1-what-regex-is-and-isnt)
- [2. Two Ways to Make a Regex](#2-two-ways-to-make-a-regex)
- [3. The Eight Flags](#3-the-eight-flags)
- [4. Character Classes](#4-character-classes)
- [5. Anchors and Word Boundaries](#5-anchors-and-word-boundaries)
- [6. Quantifiers — Greedy vs Lazy](#6-quantifiers--greedy-vs-lazy)
- [7. Groups, Captures, and Backreferences](#7-groups-captures-and-backreferences)
- [8. Lookarounds — Look Ahead and Behind](#8-lookarounds--look-ahead-and-behind)
- [9. Alternation and Escaping](#9-alternation-and-escaping)
- [10. Unicode in Regex](#10-unicode-in-regex)
- [11. JavaScript Regex API](#11-javascript-regex-api)
- [12. The `lastIndex` Gotcha](#12-the-lastindex-gotcha)
- [13. Performance: Catastrophic Backtracking and ReDoS](#13-performance-catastrophic-backtracking-and-redos)
- [14. Commonly Used Patterns](#14-commonly-used-patterns)
- [15. Real-World JS Use Cases](#15-real-world-js-use-cases)
- [16. Anti-Patterns and When NOT to Use Regex](#16-anti-patterns-and-when-not-to-use-regex)
- [17. Cheat Sheet](#17-cheat-sheet)
- [18. Interview Questions & Answers](#18-interview-questions--answers)
- [19. Tricky Questions](#19-tricky-questions)
- [References](#references)

---

## 1. What Regex Is and Isn't

A regex is a *finite-state machine* dressed up as text. The engine walks the input string left-to-right, trying to match the pattern character by character. Some of those characters are literal ("match an `a`"), some are special and mean "any digit" or "one or more of the previous thing".

**What regex is good for:**
- Validating input shape (`/^\d{4}$/` — exactly four digits)
- Searching for substrings with structure ("any number followed by KB or MB")
- Find-and-replace with structural transformations
- Splitting strings on flexible boundaries
- Token extraction (URLs, hashtags, mentions)

**What regex is NOT good for:**
- Parsing recursive structures: HTML, JSON, code with nested brackets. Regex is *regular* — by definition it can't count balanced braces. People still try; people still get burned.
- Parsing email addresses to RFC 5322 perfection. The standard regex for this is ~6,000 characters.
- Anything where readability matters more than terseness. Regex compresses a lot into a little; that's its blessing and its curse.

If your problem really is recursive (HTML, code), use a parser (`DOMParser`, `JSON.parse`, an AST library). If it's flat or "shaped like X", regex is perfect.

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

When you DO need the constructor (e.g., search built from user input), **always escape the user input** first, otherwise typing `.` or `*` in the search box produces unintended results:

```js
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
new RegExp(escapeRegex(userInput), 'gi');
```

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
'Hello hello HELLO'.match(/hello/);    // ['Hello'] — first match only
'Hello hello HELLO'.match(/hello/g);   // ['Hello', 'hello', 'HELLO'] WAIT — no, default is case sensitive
'Hello hello HELLO'.match(/hello/g);   // ['hello']
'Hello hello HELLO'.match(/hello/gi);  // ['Hello', 'hello', 'HELLO']
```

**`g` vs `y` — easy to confuse:**
- `g` (global): scans forward from `lastIndex` looking for the next match.
- `y` (sticky): match MUST start at `lastIndex` exactly. If the next character isn't a match, the call fails — no skipping.

`y` is for tokenizers/parsers that need to consume input strictly in order.

**`u` vs `v`:** `u` makes regex Unicode-aware (e.g., `\u{1F600}` for emoji code points). `v` is the modern superset that adds set operations and string properties — prefer `v` when targeting modern engines.

---

## 4. Character Classes

A character class describes "one character that is X".

### Built-in shortcuts

| Class | Matches | Inverse |
|---|---|---|
| `\d` | A digit `[0-9]` | `\D` (any non-digit) |
| `\w` | Word char `[A-Za-z0-9_]` | `\W` |
| `\s` | Whitespace (space, tab, newline, etc.) | `\S` |
| `.` | Any character except newline (unless `s` flag) | — |

### Custom classes

```js
[abc]      // a, b, or c
[^abc]     // NOT a, b, or c (the ^ inside [] means negation)
[a-z]      // lowercase a through z
[A-Za-z0-9_]  // same as \w
[\d.]      // a digit OR a literal dot
```

Inside `[]`, most special characters lose their meaning. `.` is just a dot. `*` is a literal asterisk. The exceptions: `\`, `]`, `^` (only at start), `-` (between two chars).

### Predefined Unicode categories (with `u` or `v` flag)

```js
/\p{Letter}/u             // any letter, any script
/\p{Lowercase}/u
/\p{Script=Greek}/u       // Greek letters
/\p{Number}/u             // any number, including ⅔, ½
/\p{Emoji}/u              // 😀, 🎉, etc.
/\P{Letter}/u             // negation: not-a-letter
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

`\b` is positional — it matches the spot *between* a word char and a non-word char (or start/end of string). `\bhello\b` matches "hello" as a whole word but not "helloworld".

**`m` flag changes `^` and `$`:**

```js
const text = 'one\ntwo\nthree';
text.match(/^two/);     // null — start of STRING is 'one'
text.match(/^two/m);    // ['two'] — start of LINE matches
```

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
/a*/      // matches '', 'a', 'aa', 'aaa'...
/a+/      // matches 'a', 'aa', 'aaa'...   (NOT empty)
/colou?r/ // matches 'color' or 'colour'
/\d{4}/   // exactly four digits
/\d{2,4}/ // two to four digits
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

**Use lazy when extracting tokens that have a clear closer:**
- HTML tags: `/<[^>]+>/` (negated class is even better than lazy)
- JS strings: `/"[^"]*"/`
- Markdown links: `/\[([^\]]+)\]\(([^)]+)\)/`

The "negated character class" approach (`[^>]`) is usually faster and simpler than lazy `.+?`.

---

## 7. Groups, Captures, and Backreferences

### Capturing groups

Parentheses do two things: group items together AND capture the matched text.

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

### Named groups (ES2018)

Indices are fragile when patterns evolve. Names are clearer:

```js
const m = '2026-05-09'.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);
m.groups.year;   // '2026'
m.groups.month;  // '05'
m.groups.day;    // '09'

// In replacements, use $<name>:
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

Lookarounds match positions based on what follows or precedes — without consuming those characters.

| Syntax | Name | Matches |
|---|---|---|
| `(?=...)` | Positive lookahead | Position where the next chars match `...` |
| `(?!...)` | Negative lookahead | Position where the next chars DON'T match `...` |
| `(?<=...)` | Positive lookbehind (ES2018) | Position where the previous chars match `...` |
| `(?<!...)` | Negative lookbehind (ES2018) | Position where the previous chars DON'T match `...` |

```js
// "digits followed by KB" — but capture only the digits
'500KB'.match(/\d+(?=KB)/);     // ['500']

// "$ NOT followed by 0" — match prices that aren't free
/\$(?!0)\d+/.test('$5');        // true
/\$(?!0)\d+/.test('$0');        // false

// "digits preceded by $" — extract dollar amounts
'price: $42'.match(/(?<=\$)\d+/);   // ['42']

// "word NOT preceded by 'no '"
/(?<!no )good/.test('not good');    // true   ('not ' ≠ 'no ')
/(?<!no )good/.test('no good');     // false  ('no ' precedes 'good')
```

**Why lookarounds matter:** they let you match a position based on context without including the context in the result.

**Strong password example combining lookaheads:**

```js
// Must contain: 1+ lowercase, 1+ uppercase, 1+ digit, 1+ special, 8+ chars
const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
strong.test('Hello123!');   // true
strong.test('hello123');    // false (no uppercase, no special)
```

Each `(?=.*X)` is a separate "must contain X somewhere" check. They don't consume input — they just assert from the start position.

---

## 9. Alternation and Escaping

`|` means "or". Pretty straightforward — but watch operator precedence.

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
/\$\d+/        // match a literal $ followed by digits — '$42'
/\.\d+/        // match a literal dot followed by digits — '.42'
/\\n/          // match the literal characters '\' and 'n'
/\//           // match a literal forward slash
```

Inside `[]`, fewer escapes are needed (most special chars are literal):

```js
/[.+*]/        // matches a literal '.', '+', or '*'
/[\]]/         // matches a literal ']' (must escape the closer)
```

---

## 10. Unicode in Regex

Without the `u` flag, JavaScript regex thinks each UTF-16 code unit is a character. That's wrong for emoji and supplementary-plane characters (which use surrogate pairs).

```js
'😀'.length;                // 2 — it's two UTF-16 units
/^.$/.test('😀');           // false — '.' matches one code unit, not the whole emoji
/^.$/u.test('😀');          // true — 'u' flag makes '.' code-point-aware
```

With `u`, you also get `\p{...}` Unicode properties:

```js
/\p{Script=Devanagari}+/u.test('हिन्दी');     // true
/\p{Currency_Symbol}/u.test('$');              // true
/\p{Currency_Symbol}/u.test('€');              // true
```

The `v` flag (ES2024) is a stricter superset that supports set operations:

```js
// Letters that are not Greek
/[\p{Letter}--\p{Script=Greek}]/v
```

**Use `u` (or `v`) on every regex that touches user-facing text.** Without it, an emoji in a name field can break your validation.

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

Modern replacement for the `exec` loop. **Requires the `g` flag.** Returns an iterator of match arrays *with* captures and indices preserved.

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

Split on a pattern. Captures inside the pattern get included in the result:

```js
'a1b2c3'.split(/\d/);         // ['a', 'b', 'c']
'a1b2c3'.split(/(\d)/);       // ['a', '1', 'b', '2', 'c', '3']  ← captures kept
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

**Three rules to avoid this:**

1. **Don't use `g` with `test()` or `replace()` of single-shot calls.** They don't need it.
2. **Use a fresh regex if you must use `g`:**
   ```js
   for (const s of strings) {
     if (/\d/g.test(s)) { ... }   // new regex each iteration — wasteful but safe
   }
   ```
3. **Or reset manually:**
   ```js
   const re = /\d/g;
   re.lastIndex = 0;
   ```

Even worse: passing the same regex to multiple calls in parallel (e.g., from concurrent async handlers) can race on `lastIndex`. **`g`-flagged regexes are not safe to share across async contexts.**

---

## 13. Performance: Catastrophic Backtracking and ReDoS

Regex engines try alternatives on failure ("backtracking"). For most patterns this is fine. For some, it explodes into exponential time.

### The classic catastrophic pattern

```js
/^(a+)+$/.test('aaaaaaaaaaaaaaaaaaaaaaaaaa!');
// Hangs for seconds.
```

The regex engine tries all 2^n ways to split the `a`s between the inner `a+` and the outer `+`. With 26 `a`s and a `!` at the end (forcing failure), it tries millions of permutations.

### ReDoS — Regular expression Denial of Service

If user input feeds into a regex with this shape, an attacker can post a small string that hangs your server. Real CVEs exist (e.g., the [Cloudflare 2019 outage](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/) was a regex with `.*.*=.*`).

### Patterns to avoid

- **Nested quantifiers:** `(a+)+`, `(a*)+`, `(.+)+` — same alternative, multiple ways to match.
- **Overlapping alternations with quantifier:** `(a|aa)+`, `(\w|\d)+`.
- **Greedy `.*` followed by literal:** `^.*$` is fine; `^.*foo$` on a string without `foo` does the worst-case backtrack.

### Defensive patterns

- **Use specific character classes** instead of `.`: `[^>]+` instead of `.+?`.
- **Anchor patterns**: `^` and `$` cut down the search space.
- **Use possessive quantifiers** (Java/PHP have them; JS doesn't, sadly) or atomic groups (also not in JS).
- **Bound user-driven input length** before matching.
- **Use `RE2`** (a non-backtracking engine) for hostile input. `re2` exists for Node via the `re2` package.

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
```

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

```js
// 8+ chars, at least one lowercase, one uppercase, one digit, one special
const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
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
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escaped, 'gi'), m => `<mark>${m}</mark>`);
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
new DOMParser().parseFromString(html, 'text/html').querySelectorAll('a');
```

### ❌ Parsing JSON

`JSON.parse` exists. Use it. Regex can't handle nested objects correctly.

### ❌ Validating "real" emails

The RFC 5322 regex is famously [unmaintainable](https://emailregex.com/). The user's email is valid iff they receive your confirmation message. The simple `[^\s@]+@[^\s@]+\.[^\s@]+` pattern is enough to catch typos.

### ❌ Splitting CSV with `split(',')`

Quoted fields containing commas break this. Use [Papa Parse](https://www.papaparse.com/) or a real CSV library.

### ❌ Counting balanced brackets

Regex is, by definition, not powerful enough to match arbitrary nesting (it's a regular language; balanced brackets need context-free grammar). PCRE's recursive regex extension exists but JS doesn't have it. Use a stack.

### ❌ Sanitizing HTML for XSS prevention

Use `DOMPurify`. Hand-rolled regex sanitizers have lost to XSS attacks for 20 years.

### ❌ Long single regex

If your pattern exceeds ~80 chars, split it into named groups, use the `x` flag (not in JS — use template literals to compose):

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

```
CHARACTER CLASSES
  \d    digit                 \D   non-digit
  \w    word char [A-Za-z0-9_] \W  non-word
  \s    whitespace            \S   non-whitespace
  .     any except \n         (.   any with /s flag)
  [abc] one of a, b, c        [^abc] none of those
  [a-z] range
  \p{X} Unicode property      (needs /u or /v)

ANCHORS
  ^     start of string (line with /m)
  $     end   of string (line with /m)
  \b    word boundary         \B   non-boundary

QUANTIFIERS (greedy by default)
  *     0 or more             *?   lazy
  +     1 or more             +?   lazy
  ?     0 or 1                ??   lazy
  {n}   exactly n
  {n,}  at least n
  {n,m} between n and m

GROUPS
  (...)         capturing
  (?:...)       non-capturing
  (?<name>...)  named capture
  \1, \k<name>  backreference
  $1, $<name>   in replacement strings
  $&            full match in replacement

LOOKAROUNDS
  (?=...)   positive lookahead
  (?!...)   negative lookahead
  (?<=...)  positive lookbehind
  (?<!...)  negative lookbehind

FLAGS
  g  global       i  ignore case   m  multiline
  s  dotall       u  unicode       y  sticky
  d  has-indices  v  unicodeSets

JS METHODS
  re.test(s)              boolean
  re.exec(s)              first match (with /g advances lastIndex)
  s.match(re)             first match OR all matches with /g
  s.matchAll(re)          iterator (needs /g)
  s.replace(re, str|fn)   replace first or all (with /g)
  s.replaceAll(re, ...)   needs /g
  s.search(re)            index or -1
  s.split(re)             split

GOTCHAS
  - /g + test() retains lastIndex across calls — bug source #1
  - Lookbehinds need ES2018+ (mostly fine in 2026)
  - .  doesn't match \n  unless /s
  - [.+] inside class — most chars are literal
  - new RegExp('\\d') — double-escape backslashes
  - \p{} requires /u or /v
  - Catastrophic backtracking with (a+)+ patterns
```

---

## 18. Interview Questions & Answers

### Beginner

**Q1: What is a regular expression and what is it used for?**

A regex is a pattern-matching DSL. You describe the shape of a string with a small set of metacharacters and the engine answers four questions: (a) does this string contain the pattern? (b) where? (c) what was matched? (d) replace matches with what?

Common uses: input validation, search-and-replace, tokenization, log parsing, slug generation. Limits: regex can't parse arbitrarily nested structures (HTML, JSON), and overly clever patterns become unreadable. Reach for regex when the problem is "shaped like X" and reach for a real parser when the structure is recursive.

---

**Q2: What's the difference between `/foo/` and `new RegExp('foo')`?**

The literal `/foo/` is compiled at parse time and is the most common form. The `RegExp` constructor takes a string and is for when the pattern is dynamic — e.g., user-supplied search text.

The trap with the constructor: backslashes need to be doubled because the string parser eats one of them first. `/\d/` is the same as `new RegExp('\\d')`, not `new RegExp('\d')`.

When using the constructor with user input, **escape the input first** to prevent the user from accidentally typing regex metacharacters that change the pattern meaning.

---

**Q3: What do the `g` and `i` flags do?**

- `g` (global): match all occurrences. Without it, `match` returns only the first.
- `i` (ignoreCase): case-insensitive matching. `/cat/i` matches `Cat`, `CAT`, `cat`.

`g` has a side effect on the regex object: it tracks `lastIndex` between calls of `exec`/`test`. This is the source of "the test passes once and then fails on the same string" bugs.

---

**Q4: What's the difference between `*` and `+`?**

- `*` matches zero or more of the preceding token.
- `+` matches one or more.

`/a*/.exec('xyz')` matches the empty string at position 0 (zero `a`s is fine). `/a+/.exec('xyz')` returns null — at least one `a` is required.

---

**Q5: How do `\d`, `\w`, `\s` differ from `[0-9]`, `[A-Za-z0-9_]`, `[ \t\n\r]`?**

In **ASCII** mode (no `u` flag), they are essentially equivalent — though `\s` actually includes more whitespace types than `[ \t\n\r]` (form feed, vertical tab, non-breaking space). In **Unicode** mode (`u` flag), `\d` and `\w` still match only ASCII digits/word chars by default (a deliberate choice for backward compatibility), so `[0-9]` and `\d` are the same. Use `\p{Number}` if you want non-Latin digits matched too.

The shortcuts are shorter to type and more readable. The class form is useful when you want to add or exclude specific characters: `[\d.]` for "digit or dot".

### Intermediate

**Q6: What's a capturing group, and what's the difference between `()` and `(?:)`?**

A capturing group `(...)` does two things: groups the inner pattern so quantifiers apply to all of it, AND remembers the matched text so you can refer to it later (in the result, in `replace` strings as `$1`, in the pattern itself as `\1`).

`(?:...)` is a **non-capturing group** — it groups but doesn't remember. Use it when you only want the grouping behavior:

```js
/(?:GET|POST) \/users/.exec('GET /users');
// match: ['GET /users']  — no captures
```

If you used `(GET|POST)`, the method would be in `$1`, shifting any later groups' indices. Non-capturing groups keep your numbered captures in the right slots and are slightly faster.

---

**Q7: Greedy vs lazy quantifiers — explain with an example.**

By default, quantifiers match as much as possible (greedy):

```js
'<b>hello</b>'.match(/<.+>/);     // ['<b>hello</b>']
```

`.+` greedily eats the entire middle, then backtracks just far enough to satisfy the trailing `>`. The match spans both tags.

Adding `?` after the quantifier makes it lazy — match as little as possible:

```js
'<b>hello</b>'.match(/<.+?>/);    // ['<b>']
```

Lazy stops at the first `>` it finds.

In practice: prefer a **negated character class** over a lazy quantifier when extracting tokens with a clear delimiter. `<[^>]+>` is faster and clearer than `<.+?>`.

---

**Q8: Explain lookaheads and lookbehinds.**

Lookarounds match a *position* based on what follows or precedes — without consuming characters.

- `(?=X)` — positive lookahead: match a position where X comes next
- `(?!X)` — negative lookahead: match a position where X does NOT come next
- `(?<=X)` — positive lookbehind: position where X just preceded
- `(?<!X)` — negative lookbehind: position where X did NOT just precede

Example — extract digits before "KB":

```js
'500KB and 200MB'.match(/\d+(?=KB)/g);   // ['500']
```

The lookahead asserts "KB follows" but doesn't include "KB" in the match. Without it, `\d+` would match all digits.

A common interview pattern: "password must contain a digit, an uppercase letter, and a special char, 8+ chars total":

```js
/^(?=.*\d)(?=.*[A-Z])(?=.*[!@#$])^.{8,}$/
```

Each `(?=.*X)` is an independent "must-contain" assertion. They all check from the same position (start of string) without consuming anything.

---

**Q9: What is `lastIndex`, and why does this code behave strangely?**

```js
const re = /\d/g;
re.test('a1');   // true
re.test('a1');   // false
re.test('a1');   // true
```

After a successful `test` or `exec` on a `g`-flagged regex, the engine sets `re.lastIndex` to the position right after the match. The next call resumes from there. With the same input string, the search starts past the match position, fails, and resets `lastIndex` to 0. The third call starts over and finds the match again.

This causes intermittent bugs in shared-regex code, especially in async/concurrent contexts where two callers race on `lastIndex`.

**Fixes:**
1. Don't use `g` with `test`/`replace` if you only need a single check.
2. Re-create the regex each time, or set `re.lastIndex = 0` before each call.
3. Use `matchAll` (which always returns an iterator and doesn't share state).

---

**Q10: How do you use a captured group in a replacement?**

In `replace`, captured groups are referenced by `$1`, `$2`, ... or `$<name>` for named captures:

```js
'2026-05-09'.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1');
// '09/05/2026'

'2026-05-09'.replace(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
  '$<day>/$<month>/$<year>',
);
```

If you need conditional logic in the replacement, pass a function:

```js
'a1 b22'.replace(/(\D)(\d+)/g, (full, letter, digits) => `${letter}-${parseInt(digits) * 2}`);
// 'a-2 b-44'
```

The function receives `(match, ...captures, offset, fullString, namedGroupsObject?)`.

### Advanced

**Q11: Write a regex that matches a valid email address (interview-pragmatic version).**

```js
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

Explanation:
- `^` start of string
- `[^\s@]+` one or more characters that are not whitespace or `@` (the local part)
- `@` literal at-sign
- `[^\s@]+` the domain, no spaces or another `@`
- `\.` literal dot before the TLD
- `[^\s@]+$` TLD

This catches the obvious shape ("something@something.something"). It will accept things RFC 5322 forbids (like `..@.`) and reject some valid edge cases. The right answer in most interviews:

> The full RFC 5322 regex is over 6,000 characters. I'd use a permissive shape check like the one above, then verify deliverability with a confirmation email — that's the only way to know an address is real.

---

**Q12: Write a regex to validate a strong password.**

Requirements: at least 8 characters, at least one uppercase, one lowercase, one digit, one special character.

```js
const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+[\]{};:'",.<>?/\\|`~])[\s\S]{8,}$/;
```

The four lookaheads `(?=...)` are independent assertions that all check from position 0 — they each say "somewhere in the string there must be X". `[\s\S]{8,}` enforces the length (`[\s\S]` is "any char including newline" — since lookaheads don't consume, we still need the body to consume the input).

Common variant: forbid spaces in the password. Replace `[\s\S]` with `\S`.

---

**Q13: How would you parse a date string `2026-05-09` and extract year/month/day?**

Use named capture groups:

```js
const dateRe = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/;
const m = '2026-05-09'.match(dateRe);
const { year, month, day } = m.groups;
```

For more rigor (reject `2026-13-01`):

```js
const dateRe = /^(?<year>\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12]\d|3[01])$/;
```

But the regex still accepts `2026-02-30`. Real date validation needs `Date.parse` plus a round-trip check:

```js
function isValidDate(s) {
  const d = new Date(s);
  return !isNaN(d) && d.toISOString().startsWith(s);
}
```

---

**Q14: What is catastrophic backtracking? How do you avoid it?**

When a pattern has multiple ways to match the same input (e.g., nested quantifiers), the regex engine tries every combination on failure. For some patterns, the number of combinations grows exponentially with input length.

Classic example: `^(a+)+$` against `aaaaaaaaaaaaaaaa!`. The engine has 2^16 ways to split the `a`s between the inner `a+` and the outer `+`. With a `!` at the end forcing failure, it tries all of them.

This is exploitable as a denial-of-service vector (ReDoS): an attacker submits a small input that hangs your server.

**Avoidance:**
- Avoid nested quantifiers like `(a+)+` and `(a*)*`.
- Avoid alternations where alternatives can match the same input: `(a|aa)+`.
- Prefer specific character classes over `.`. `[^>]+` instead of `.+?`.
- Anchor patterns with `^` and `$` to limit search space.
- Bound user input length before matching.
- For untrusted input, use a non-backtracking engine like Google's RE2 (the `re2` npm package).

---

**Q15: How does `String.prototype.matchAll` differ from a `while`-`exec` loop?**

The old idiom:

```js
const re = /\d+/g;
let m;
const matches = [];
while ((m = re.exec(s)) !== null) matches.push(m);
```

The new idiom:

```js
const matches = [...s.matchAll(/\d+/g)];
```

Differences:
1. `matchAll` returns an iterator with **all match info preserved** — captures, indices, named groups. `s.match(/\d+/g)` (note: no `All`) returns plain strings with no captures, which is a footgun.
2. `matchAll` is stateless from the caller's perspective. You don't need to worry about resetting `lastIndex`.
3. `matchAll` requires the `g` flag — passing a non-global regex throws a `TypeError`. This is intentional: it forces you to be explicit that you want all matches.

Always prefer `matchAll` for new code that needs all matches with capture details.

---

**Q16: Explain the `u` and `v` flags. When do you need them?**

Without these flags, JavaScript treats each UTF-16 code unit as a character. Most BMP code points fit in one unit, but emoji and supplementary-plane characters use surrogate pairs (two units).

```js
'😀'.length;          // 2
/^.$/.test('😀');     // false — '.' matches one code unit
/^.$/u.test('😀');    // true — 'u' makes '.' code-point-aware
```

The `u` flag also enables:
- `\u{1F600}` notation (vs `😀`)
- `\p{Letter}`, `\p{Script=...}`, etc. — Unicode property classes
- Stricter parsing — invalid escapes throw instead of silently degrading

The `v` flag (ES2024) is a stricter superset:
- Set notation in classes: `[\p{Letter}--\p{Script=Greek}]` (letters except Greek)
- Properties of strings, multi-character escapes
- Different escape rules

**Use `u` (or `v`) on any regex that touches user-facing text.** Otherwise an emoji in a name field can corrupt your validation. The performance cost is negligible.

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

The `g` flag causes `lastIndex` to persist on the regex object across calls. After matching `'1'` (advancing `lastIndex` to 1), the second call to `test('1')` starts at index 1 — past the end of the string — so it returns `false` and resets `lastIndex` to 0. The third call works again.

**Three fixes:**
1. Drop the `g` flag. `test` doesn't need it: `const isDigit = /\d/;`
2. Inline a fresh regex each call: `s => /\d/g.test(s)` (works because each call gets a new regex literal — though in tight loops this allocates).
3. Manually reset before each call: `isDigit.lastIndex = 0;` (ugly and error-prone).

The bug is especially insidious in async code where multiple callers share the regex. The right answer is almost always (1).

---

**Q2: Why does `/^abc$/m.test('xyz\nabc\ndef')` return `true`, but `/^abc$/.test('xyz\nabc\ndef')` returns `false`?**

The `m` (multiline) flag changes the meaning of `^` and `$`:
- Without `m`: `^` matches only the very start of the string, `$` only the very end.
- With `m`: `^` matches the start of any line, `$` the end of any line (boundaries are `\n`).

Without `m`, the regex requires the entire string to be exactly `'abc'`. With `m`, it just requires *some line* to be `'abc'`. The middle line `abc` qualifies.

Note: `m` does NOT make `.` match newlines — that's the `s` (dotAll) flag, a separate concept.

---

**Q3: What's the difference between these two regexes that "look the same"?**

```js
/^foo|bar$/.test('foobaz');   // true
/^(foo|bar)$/.test('foobaz'); // false
```

Operator precedence. The first regex is `(^foo) | (bar$)` — start-anchored "foo" OR end-anchored "bar". `'foobaz'` starts with "foo", so the first alternative matches and the test passes. This is almost certainly NOT what the author meant.

The second regex anchors the entire alternation. `^(foo|bar)$` means "the whole string is foo OR bar". `'foobaz'` is neither, so it fails — correctly.

**Lesson:** when alternation interacts with anchors or other operators, always wrap it in `(?:...)` to scope it explicitly.

---

**Q4: Why does this regex hang the browser tab?**

```js
/^(a+)+$/.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!');
```

Catastrophic backtracking. The pattern `(a+)+` has multiple ways to split a sequence of `a`s between the inner `a+` and the outer `+`. With 30 `a`s, there are 2^29 ways. The trailing `!` forces the overall match to fail, so the engine tries every single combination before giving up.

**Why this is a security issue:** if user-controlled input feeds a pattern with this shape, an attacker can construct a small input that consumes minutes of CPU time. Cloudflare took down half its network in July 2019 from a regex with similar structure.

**Fix:** rewrite without nested quantifiers. The pattern `(a+)+` is exactly equivalent to `a+` — drop the outer group.

---

**Q5: What does this print, and why?**

```js
const re = /(.)\1/;
console.log(re.test('aa'));     // ?
console.log(re.test('ab'));     // ?
```

- `'aa'` → `true`
- `'ab'` → `false`

`(.)\1` means "any character, captured, followed by the same character". `\1` is a *backreference* to the first capture group — it matches the literal text that group 1 matched, not the pattern.

So `(.)\1` matches any doubled character: `aa`, `bb`, `99`, ` ` (two spaces). `'ab'` doesn't have two consecutive identical characters, so it fails.

Use case: detect repeated characters in passwords or detect stuttering ("the the"):

```js
/\b(\w+)\s+\1\b/.test('the the cat');   // true
```

---

**Q6: Why does `'abc'.split(/(b)/)` return `['a', 'b', 'c']` instead of `['a', 'c']`?**

When the split pattern contains a capturing group, the captured text is **interleaved into the result**. This is a deliberate design choice — useful when you want to keep the delimiters:

```js
'1,2;3,4'.split(/[,;]/);     // ['1', '2', '3', '4']     ← delimiters lost
'1,2;3,4'.split(/([,;])/);   // ['1', ',', '2', ';', '3', ',', '4']  ← kept
```

If you want to group without capturing (and not include the delimiter), use `(?:...)`:

```js
'1,2;3,4'.split(/(?:[,;])/);  // ['1', '2', '3', '4']    ← back to original
```

---

**Q7: How do you write a regex that matches a string but only if it does NOT contain a forbidden word?**

Use a negative lookahead anchored at the start:

```js
const re = /^(?!.*forbidden).*$/i;
re.test('hello world');         // true
re.test('this is forbidden');   // false
```

`(?!.*forbidden)` asserts "from the start of the string, scanning forward, no occurrence of 'forbidden' exists". The lookahead doesn't consume — `.*` then consumes the actual content.

This is the canonical "must not contain" pattern. Combine multiple negatives:

```js
// Must not contain 'admin' OR 'root'
/^(?!.*admin)(?!.*root).*$/i;
```

---

**Q8: What's wrong with using `replace(/&/g, '&amp;').replace(/</g, '&lt;')` to escape HTML?**

It's *almost* right, but order matters and there's a sneaky bug.

If you do `<` first then `&`, the `&` in `&lt;` itself gets re-encoded into `&amp;lt;`. So you must escape `&` first, then everything else.

But there's a deeper problem: this naive approach misses `>`, `"`, `'`, and the various XSS vectors involving JS contexts (`onclick=`, etc.), CSS contexts, URL contexts. Each context has its own escaping rules.

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

For real XSS prevention in dynamic HTML, use a templating library that escapes by default (React JSX, Vue, etc.) or `DOMPurify` for sanitizing user-supplied HTML. **Hand-rolled regex sanitizers have lost to XSS attacks for 20+ years.**

---

## References

- [MDN — Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions)
- [MDN — RegExp object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
- [MDN — Cheat Sheet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Cheatsheet)
- [TC39 — RegExp `v` flag proposal](https://github.com/tc39/proposal-regexp-v-flag)
- [regex101.com](https://regex101.com) — interactive tester
- [Cloudflare regex outage post-mortem](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/)
- [DOMPurify](https://github.com/cure53/DOMPurify) — for XSS-safe HTML sanitization
