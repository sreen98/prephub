# Regex Cheat Sheet

## Creating
```js
// /pattern/flags                  — the literal form; compiled once
/\d+/g;                              // e.g. digits, global
new RegExp('pat\\d', 'g');           // from a string: escapes need DOUBLING
new RegExp(RegExp.escape(userInput)); // escape untrusted input
```

## Flags
| Flag | Meaning |
|---|---|
| `g` | global — find all; drives `lastIndex` |
| `i` | case-insensitive |
| `m` | multiline: `^`/`$` match line boundaries |
| `s` | dotAll: `.` also matches newline |
| `u` | unicode: enables `\p{}`, correct surrogate handling |
| `v` | unicode sets: set operations in classes |
| `y` | sticky: match only at `lastIndex` |
| `d` | indices: adds `.indices` to the match |

## Character Classes
```
.        any char except newline (unless /s)
\d \D    digit / non-digit            [0-9]
\w \W    word / non-word              [A-Za-z0-9_]
\s \S    whitespace / non-whitespace
[abc]    any of a, b, c
[^abc]   NOT a, b or c                (^ inside [] = negation)
[a-z0-9] ranges
\p{L}    unicode letter (needs /u)    \p{Script=Greek}
\\ \. \* escape a metacharacter
```

## Anchors & Boundaries
```
^   start of string (or line with /m)
$   end of string (or line with /m)
\b  word boundary        \bcat\b matches "cat" not "category"
\B  non-boundary
```

## Quantifiers
```
*        0 or more (greedy)
+        1 or more
?        0 or 1
{3}      exactly 3
{2,}     2 or more
{2,5}    2 to 5
*? +? ?? {2,5}?   LAZY — match as few as possible
*+ ++             POSSESSIVE (no backtracking)
```
```js
'<a><b>'.match(/<.+>/)[0]    // '<a><b>'  greedy
'<a><b>'.match(/<.+?>/)[0]   // '<a>'     lazy
```

## Groups
```
(abc)         capturing → $1
(?:abc)       non-capturing (no capture cost)
(?<name>abc)  named → groups.name
\1            backreference to group 1
\k<name>      named backreference
a|b           alternation (lowest precedence!)
```
`^cat|dog$` means `(^cat)|(dog$)` — you almost always want `^(cat|dog)$`.

## Lookaround
```
(?=...)   positive lookahead    \d+(?= USD)      digits followed by " USD"
(?!...)   negative lookahead    \d+(?! USD)
(?<=...)  positive lookbehind   (?<=\$)\d+       digits preceded by "$"
(?<!...)  negative lookbehind
```
Lookarounds are **zero-width** — they assert without consuming.

## JS API
```js
re.test(s);                   // boolean
re.exec(s);                   // one match + groups; advances lastIndex with /g
s.match(re);                  // /g → all matches (no groups); else first + groups
s.matchAll(re);               // iterator of full match objects — needs /g
s.replace(re, '$1-$2');       // $1 $<name> $& $` $'
s.replace(re, (m, g1) => g1); // function replacer
s.replaceAll(re, r);          // regex must have /g
s.search(re);                 // index or -1
s.split(re);                  // capture groups get INCLUDED in the result
```

## Common Patterns
```js
/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;          // pragmatic email (never RFC 5322)
/^https?:\/\/[^\s/$.?#].[^\s]*$/i;         // URL
/^\d{4}-\d{2}-\d{2}$/;                     // ISO date
/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;         // hex colour
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;   // password rules via lookahead
/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;  // UUIDv4
/\s+/g;                                    // whitespace runs → collapse
s.replace(/[A-Z]/g, m => '-' + m.toLowerCase());  // camelCase → kebab-case
```

## The `lastIndex` Trap
```js
const re = /a/g;
re.test('a');   // true
re.test('a');   // FALSE — lastIndex is now 1
```
A `/g` or `/y` regex is **stateful**. Fixes: create it inside the function, drop `g` for `test`, or reset `re.lastIndex = 0`. Never reuse a module-level `/g` regex across calls.

## Catastrophic Backtracking (ReDoS)
```js
/^(a+)+$/.test('a'.repeat(30) + 'b');  // exponential — hangs
/^(\w+\s?)*$/;                         // classic vulnerable shape
```
Nested quantifiers over overlapping character sets explode. Fix by removing the nesting, using a possessive/atomic form, anchoring, or bounding input length. Never build a regex from untrusted input without `RegExp.escape`.

## Don't Use Regex For
HTML/XML parsing · JSON parsing · CSV with quoted commas · balanced brackets · XSS sanitisation · full RFC 5322 email validation. Use a real parser.
