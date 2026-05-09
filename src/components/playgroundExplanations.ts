// Step-by-step explanations for Coding Challenge templates.
// Loaded lazily from CodePlayground only when the user opens the explanation
// modal — keeps this off the initial route chunk.
//
// Data model is intentionally narrow: the modal renders a few primitive
// "snapshot" views (array, hash map, pseudocode) and walks through `steps`
// frame-by-frame. Adding a new explanation means filling out the same shape
// for whatever data structures the algorithm uses.

export type Highlight = 'i' | 'j' | 'hit' | 'new' | 'compare' | 'found';

export interface ArrayCell {
  value: string | number;
  highlight?: Highlight;
}

export interface ArraySnapshot {
  cells: ArrayCell[];
  pointers?: { index: number; label: string; color: 'red' | 'amber' | 'emerald' | 'indigo' }[];
}

export interface MapEntry {
  key: string | number;
  value: string | number;
  highlight?: 'new' | 'hit';
}

export interface MapSnapshot {
  entries: MapEntry[];
}

// ===== Extra snapshot primitives for non-iterative algorithms =====

export interface StackSnapshot {
  // First item is the BOTTOM of the stack, last is the TOP.
  items: ArrayCell[];
  // What's happening this step at the top of the stack.
  action?: 'push' | 'pop' | 'peek' | 'idle';
}

export interface SetSnapshot {
  items: { value: string | number; highlight?: 'new' | 'hit' }[];
}

// Two arrays side by side — useful for merge / compare visualizations.
export interface DualArraySnapshot {
  left: { label: string; cells: ArrayCell[]; pointer?: number };
  right: { label: string; cells: ArrayCell[]; pointer?: number };
  result?: { label: string; cells: ArrayCell[] };
}

// Function call frames for recursion (top is most recent).
export interface CallStackSnapshot {
  frames: { call: string; status?: 'active' | 'returned' | 'pending'; returns?: string }[];
}

// Linked-list nodes drawn left-to-right with → arrows.
export interface LinkedListSnapshot {
  nodes: { value: string | number; highlight?: Highlight; label?: string }[];
  // Optional next pointer label between nodes ("null" or other).
  tail?: string;
}

// Horizontal timeline — for debounce/throttle/event-loop kinds of problems.
export interface TimelineSnapshot {
  events: { t: number; label: string; kind: 'input' | 'fire' | 'skip' | 'pending' }[];
  windowMs?: number;
}

export interface ExplanationStep {
  // One-sentence summary that appears below the visual.
  title: string;
  // Optional longer paragraph for the "Why?" panel.
  detail?: string;
  // Highlighted pseudocode line index (0-based into approach.pseudocode).
  pseudoLine?: number;
  // Visual frames — render whichever ones are present.
  array?: ArraySnapshot;
  map?: MapSnapshot;
  stack?: StackSnapshot;
  set?: SetSnapshot;
  dualArray?: DualArraySnapshot;
  callStack?: CallStackSnapshot;
  linkedList?: LinkedListSnapshot;
  timeline?: TimelineSnapshot;
  // The math/comparison being performed this step (e.g., "9 - 2 = 7").
  computation?: { label: string; lhs?: string; op?: string; rhs?: string; result?: string };
  // Inline lookup outcome: 'hit' (found) / 'miss' (not found) / undefined.
  lookupOutcome?: { kind: 'hit' | 'miss'; key: string | number; at?: string };
  // Free-form note rendered as a soft callout.
  note?: string;
  // Final output once the algorithm decides.
  result?: { found: true; value: string } | { found: false; value?: string };
}

// Reference to a polyfill template that this approach leans on. The modal
// renders these as clickable chips — clicking loads that polyfill template
// in the playground so the user can see how the built-in works under the
// hood.
export interface PolyfillRef {
  /** Built-in name, e.g. "Array.prototype.reduce" */
  builtin: string;
  /** Matches a `name` in playgroundTemplates.ts JS Polyfills category */
  templateName: string;
  /** Optional one-liner explaining how this approach uses the built-in */
  why?: string;
}

export interface Approach {
  id: string;
  name: string;
  badge: 'best' | 'baseline' | 'alternative';
  intuition: string;
  complexity: { time: string; space: string; verdict: string };
  pseudocode: string[];
  example: { input: string; output: string };
  steps: ExplanationStep[];
  tradeoffs: string;
  /** Built-ins this approach uses that have a polyfill template in the playground */
  usesPolyfills?: PolyfillRef[];
}

export interface Explanation {
  problem: string;
  problemStatement: string;
  approaches: Approach[];
}

// ====================================================================

const twoSum: Explanation = {
  problem: 'Two Sum',
  problemStatement:
    'Given an array of integers `nums` and a target integer `target`, return the indices of the two numbers that add up to target. Each input has exactly one solution and the same element may not be used twice.',
  approaches: [
    // --------------------------- BRUTE FORCE ---------------------------
    {
      id: 'brute-force',
      name: 'Brute Force — Nested Loops',
      badge: 'baseline',
      intuition:
        "Try every possible pair (i, j) with j > i. For each pair, check if nums[i] + nums[j] equals the target. Guaranteed correct, but you do up to n·(n−1)/2 comparisons.",
      complexity: { time: 'O(n²)', space: 'O(1)', verdict: 'Don\'t ship — too slow on large inputs' },
      pseudocode: [
        'for i from 0 to n-1:',
        '  for j from i+1 to n-1:',
        '    if nums[i] + nums[j] === target:',
        '      return [i, j]',
        'return [] // no solution',
      ],
      example: { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' },
      steps: [
        {
          title: 'Start with i = 0. We will pair nums[0] = 3 with every j > 0.',
          pseudoLine: 0,
          array: {
            cells: [
              { value: 3, highlight: 'i' },
              { value: 2 },
              { value: 4 },
            ],
            pointers: [{ index: 0, label: 'i', color: 'red' }],
          },
        },
        {
          title: 'i=0, j=1. Check 3 + 2.',
          detail: '3 + 2 = 5, which is not equal to target 6. Move j forward.',
          pseudoLine: 2,
          array: {
            cells: [
              { value: 3, highlight: 'i' },
              { value: 2, highlight: 'j' },
              { value: 4 },
            ],
            pointers: [
              { index: 0, label: 'i', color: 'red' },
              { index: 1, label: 'j', color: 'amber' },
            ],
          },
          computation: { label: 'nums[i] + nums[j] vs target', lhs: '3', op: '+', rhs: '2', result: '5 ≠ 6' },
        },
        {
          title: 'i=0, j=2. Check 3 + 4.',
          detail: '3 + 4 = 7, also not 6. j has run off the end, so move i forward.',
          pseudoLine: 2,
          array: {
            cells: [
              { value: 3, highlight: 'i' },
              { value: 2 },
              { value: 4, highlight: 'j' },
            ],
            pointers: [
              { index: 0, label: 'i', color: 'red' },
              { index: 2, label: 'j', color: 'amber' },
            ],
          },
          computation: { label: 'nums[i] + nums[j] vs target', lhs: '3', op: '+', rhs: '4', result: '7 ≠ 6' },
        },
        {
          title: 'i=1, j=2. Check 2 + 4.',
          detail: '2 + 4 = 6 — match! Return [1, 2].',
          pseudoLine: 3,
          array: {
            cells: [
              { value: 3 },
              { value: 2, highlight: 'i' },
              { value: 4, highlight: 'found' },
            ],
            pointers: [
              { index: 1, label: 'i', color: 'red' },
              { index: 2, label: 'j', color: 'emerald' },
            ],
          },
          computation: { label: 'nums[i] + nums[j] vs target', lhs: '2', op: '+', rhs: '4', result: '6 = 6 ✓' },
          result: { found: true, value: '[1, 2]' },
        },
      ],
      tradeoffs:
        "Pick this only if n is tiny (say, ≤ 100) or if you need a baseline you're certain is correct. For typical interview inputs (n up to 10,000+), nested loops will time out — recruiters expect you to recognize this and switch.",
    },
    // ----------------------------- HASH MAP -----------------------------
    {
      id: 'hash-map',
      name: 'Hash Map — One Pass',
      badge: 'best',
      intuition:
        "Walk the array once. At each index i, ask: have I seen the complement (target − nums[i]) already? If a hash map says yes, you've found the pair. If not, store the current number → its index and keep going. The trick: you only need to look back, never forward, because pairs are symmetric.",
      complexity: { time: 'O(n)', space: 'O(n)', verdict: 'Ship this — the canonical answer' },
      pseudocode: [
        'map = {}',
        'for i from 0 to n-1:',
        '  complement = target - nums[i]',
        '  if complement in map:',
        '    return [map[complement], i]',
        '  map[nums[i]] = i',
        'return [] // no solution',
      ],
      example: { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
      steps: [
        {
          title: 'Start with an empty map.',
          detail: 'The map will store numbers we have already seen, mapped to their index.',
          pseudoLine: 0,
          array: {
            cells: [
              { value: 2 },
              { value: 7 },
              { value: 11 },
              { value: 15 },
            ],
          },
          map: { entries: [] },
        },
        {
          title: 'i = 0, nums[i] = 2. Compute complement = 9 − 2 = 7.',
          detail: 'We need to find a 7 somewhere. Check the map.',
          pseudoLine: 2,
          array: {
            cells: [
              { value: 2, highlight: 'i' },
              { value: 7 },
              { value: 11 },
              { value: 15 },
            ],
            pointers: [{ index: 0, label: 'i', color: 'indigo' }],
          },
          map: { entries: [] },
          computation: { label: 'complement = target − nums[i]', lhs: '9', op: '−', rhs: '2', result: '7' },
        },
        {
          title: 'Is 7 in the map? No — map is empty.',
          detail: "Store the current number 2 → its index 0 in the map. Then move on to i = 1.",
          pseudoLine: 5,
          array: {
            cells: [
              { value: 2, highlight: 'i' },
              { value: 7 },
              { value: 11 },
              { value: 15 },
            ],
            pointers: [{ index: 0, label: 'i', color: 'indigo' }],
          },
          map: { entries: [{ key: 2, value: 0, highlight: 'new' }] },
          lookupOutcome: { kind: 'miss', key: 7 },
        },
        {
          title: 'i = 1, nums[i] = 7. Compute complement = 9 − 7 = 2.',
          detail: 'We need to find a 2. Check the map.',
          pseudoLine: 2,
          array: {
            cells: [
              { value: 2 },
              { value: 7, highlight: 'i' },
              { value: 11 },
              { value: 15 },
            ],
            pointers: [{ index: 1, label: 'i', color: 'indigo' }],
          },
          map: { entries: [{ key: 2, value: 0 }] },
          computation: { label: 'complement = target − nums[i]', lhs: '9', op: '−', rhs: '7', result: '2' },
        },
        {
          title: 'Is 2 in the map? YES — at index 0.',
          detail: 'Return [map[2], i] = [0, 1]. Done in one pass with two lookups.',
          pseudoLine: 4,
          array: {
            cells: [
              { value: 2, highlight: 'found' },
              { value: 7, highlight: 'found' },
              { value: 11 },
              { value: 15 },
            ],
            pointers: [{ index: 1, label: 'i', color: 'emerald' }],
          },
          map: { entries: [{ key: 2, value: 0, highlight: 'hit' }] },
          lookupOutcome: { kind: 'hit', key: 2, at: '0' },
          result: { found: true, value: '[0, 1]' },
        },
      ],
      tradeoffs:
        "Trades O(n) extra space for O(n) time. Always the right answer in interviews unless the interviewer explicitly bans extra space (in which case fall back to sorting + two pointers — but that needs O(n log n) and loses the original indices unless you keep them paired).",
    },
  ],
};

// ====================================================================

const reverseString: Explanation = {
  problem: 'Reverse String',
  problemStatement: 'Reverse a string with no use of the built-in reverse. The interviewer is looking for the two-pointer pattern; the one-liner with split/reverse/join is acceptable in real code but in interviews you should articulate what those built-ins do internally.',
  approaches: [{
    id: 'two-pointer',
    name: 'Two-Pointer Swap (Best)',
    badge: 'best',
    intuition:
      "Strings in JavaScript are immutable, so we can't mutate them in place — we convert to an array first. Then place a pointer at each end. " +
      "On each iteration, swap the characters at the two pointers and step them inward. When the pointers meet (odd length) or cross (even length), we're done. " +
      "The key insight is that **each pair of mirror positions is touched exactly once** — position 0 swaps with position n-1, position 1 with n-2, etc. That's why this runs in O(n/2) iterations. The middle character of an odd-length string never moves: it's already in its final spot.",
    complexity: { time: 'O(n)', space: 'O(n) for the array intermediate; O(1) extra beyond that', verdict: 'Ship this — what interviewers expect' },
    pseudocode: [
      'arr = str.split("")              // immutable string → mutable array',
      'left = 0, right = arr.length - 1',
      'while left < right:',
      '  swap arr[left] with arr[right] // [arr[left], arr[right]] = [arr[right], arr[left]]',
      '  left++, right--',
      'return arr.join("")              // array back to string',
    ],
    example: { input: '"hello"', output: '"olleh"' },
    steps: [
      {
        title: 'Convert "hello" to a 5-cell array. Place L at index 0 and R at index 4.',
        detail: 'Strings are immutable in JS — `s[0] = "x"` does nothing. We need a mutable buffer to swap into.',
        pseudoLine: 1,
        array: { cells: [{ value: 'h', highlight: 'i' }, { value: 'e' }, { value: 'l' }, { value: 'l' }, { value: 'o', highlight: 'j' }],
          pointers: [{ index: 0, label: 'L', color: 'red' }, { index: 4, label: 'R', color: 'amber' }] },
      },
      {
        title: 'Swap arr[L]=h with arr[R]=o. Array is now [o, e, l, l, h]. L→1, R→3.',
        detail: 'A destructuring swap `[a[i], a[j]] = [a[j], a[i]]` does this without a temp variable, but conceptually it is still three moves: temp = a[i]; a[i] = a[j]; a[j] = temp.',
        pseudoLine: 3,
        array: { cells: [{ value: 'o' }, { value: 'e', highlight: 'i' }, { value: 'l' }, { value: 'l', highlight: 'j' }, { value: 'h' }],
          pointers: [{ index: 1, label: 'L', color: 'red' }, { index: 3, label: 'R', color: 'amber' }] },
      },
      {
        title: 'Swap arr[L]=e with arr[R]=l. Array is [o, l, l, e, h]. L→2, R→2.',
        detail: 'Now L === R — they point at the same middle slot. The loop condition `left < right` is now false, so we exit without touching the middle.',
        pseudoLine: 3,
        array: { cells: [{ value: 'o' }, { value: 'l' }, { value: 'l', highlight: 'i' }, { value: 'e' }, { value: 'h' }],
          pointers: [{ index: 2, label: 'L=R', color: 'emerald' }] },
      },
      {
        title: 'Loop exits. Join the array back into a string and return.',
        detail: 'The middle character ("l" at index 2) was never moved — that is correct, the middle of an odd-length palindrome-shaped buffer is already in place.',
        pseudoLine: 5,
        array: { cells: [{ value: 'o', highlight: 'found' }, { value: 'l', highlight: 'found' }, { value: 'l', highlight: 'found' }, { value: 'e', highlight: 'found' }, { value: 'h', highlight: 'found' }] },
        result: { found: true, value: '"olleh"' },
      },
    ],
    tradeoffs: "This is the answer the interviewer wants — it shows you understand the two-pointer pattern, can manipulate indices, and recognize that strings are immutable. The split-reverse-join one-liner is essentially this same algorithm wrapped behind built-ins (V8's `reverse` is in fact a two-pointer swap loop in C++).",
  },
  {
    id: 'split-reverse-join',
    name: 'Built-in Chain — split → reverse → join (Alternative)',
    badge: 'alternative',
    intuition:
      "The whole problem becomes a one-liner if you're allowed to use the built-ins: `str.split('').reverse().join('')`. This is fine in production code but it's almost always rejected in interviews because it sidesteps the algorithm. The teaching value is: knowing what each built-in does internally. " +
      "`split('')` splits a string into an array of single characters (O(n) time, O(n) space). `Array.prototype.reverse()` is exactly the two-pointer swap loop, just inside the engine. `join('')` walks the array and concatenates (O(n)). So the one-liner is three O(n) passes — about 3× the work of a hand-rolled single-pass two-pointer.",
    complexity: { time: 'O(n) but with a 3× constant factor', space: 'O(n)', verdict: 'Real-world: fine. Interview: explain what the built-ins do, then offer the two-pointer.' },
    pseudocode: [
      'return str.split("").reverse().join("")',
      '// equivalent to:',
      '// arr = str.split("")     ← O(n)',
      '// arr.reverse()           ← O(n) two-pointer swap',
      '// return arr.join("")     ← O(n)',
    ],
    example: { input: '"hello"', output: '"olleh"' },
    steps: [
      {
        title: 'split("") — turn "hello" into ["h", "e", "l", "l", "o"].',
        detail: 'split with an empty separator yields one entry per UTF-16 code unit. Beware: this breaks emoji and other surrogate-pair characters into halves. For Unicode-correct splitting use [...str] instead.',
        pseudoLine: 0,
        array: { cells: [{ value: 'h' }, { value: 'e' }, { value: 'l' }, { value: 'l' }, { value: 'o' }] },
      },
      {
        title: 'reverse() — engine runs two-pointer swap internally → ["o", "l", "l", "e", "h"].',
        detail: 'Internally the engine does the same thing as approach 1: walk from both ends, swap, advance until they meet.',
        pseudoLine: 3,
        array: { cells: [{ value: 'o', highlight: 'compare' }, { value: 'l', highlight: 'compare' }, { value: 'l', highlight: 'compare' }, { value: 'e', highlight: 'compare' }, { value: 'h', highlight: 'compare' }] },
      },
      {
        title: 'join("") — walk the array and concatenate to "olleh".',
        detail: 'join with empty separator just stringifies and concatenates each element with no glue between them.',
        pseudoLine: 4,
        array: { cells: [{ value: 'o', highlight: 'found' }, { value: 'l', highlight: 'found' }, { value: 'l', highlight: 'found' }, { value: 'e', highlight: 'found' }, { value: 'h', highlight: 'found' }] },
        result: { found: true, value: '"olleh"' },
      },
    ],
    tradeoffs: "Use this one-liner in everyday code. In an interview, expect a follow-up: 'now do it without reverse'. That's your cue to switch to two-pointer.",
    usesPolyfills: [
      { builtin: 'Array.prototype.reverse', templateName: 'Array.reverse',
        why: 'reverse() is the two-pointer swap loop wrapped in a built-in' },
      { builtin: 'Array.prototype.join', templateName: 'Array.prototype.join',
        why: 'join concatenates the reversed character array back to a string' },
    ],
  }],
};

// ====================================================================

const validPalindrome: Explanation = {
  problem: 'Valid Palindrome',
  problemStatement: 'Determine if a string reads the same forwards and backwards, ignoring case and non-alphanumeric characters. Punctuation, spaces, and case differences should NOT cause a false negative — `"A man, a plan, a canal: Panama"` is a palindrome.',
  approaches: [{
    id: 'two-pointer',
    name: 'Two-Pointer Compare (Best — O(1) space)',
    badge: 'best',
    intuition:
      "Two pointers, one at each end, walk toward each other. The 'ignore non-alphanumeric and case' rule is handled inline: at each step, before comparing, advance each pointer past any non-alphanumeric character (commas, spaces, colons). Then compare the lowercased characters. Mismatch → return false; match → step inward and continue. " +
      "This is strictly better than building a cleaned copy of the string because it uses O(1) extra space — no allocation, no second pass. The double inner-while loops to skip non-alphanumeric look weird at first but are linear overall: each character is visited at most twice across all iterations (once by L scanning forward, once by R scanning backward), which is still O(n).",
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Best — no allocation' },
    pseudocode: [
      'left = 0, right = s.length - 1',
      'while left < right:',
      '  while left<right and !isAlnum(s[left]):  left++   // skip non-alnum on left',
      '  while left<right and !isAlnum(s[right]): right--  // skip non-alnum on right',
      '  if lower(s[left]) !== lower(s[right]): return false',
      '  left++, right--',
      'return true',
    ],
    example: { input: '"racecar"', output: 'true' },
    steps: [
      { title: 'Initial pointers at both ends of "racecar".', pseudoLine: 0,
        array: { cells: 'racecar'.split('').map(c => ({ value: c })), pointers: [{ index: 0, label: 'L', color: 'red' }, { index: 6, label: 'R', color: 'amber' }] } },
      { title: 'Compare r === r ✓. Step both pointers inward.',
        detail: 'Both characters are alphanumeric, so the inner skip-loops do nothing. Lowercased comparison passes.',
        pseudoLine: 4,
        array: { cells: 'racecar'.split('').map((c, i) => ({ value: c, highlight: (i === 0 || i === 6) ? 'i' as const : undefined })),
          pointers: [{ index: 0, label: 'L', color: 'red' }, { index: 6, label: 'R', color: 'amber' }] },
        computation: { label: 'lower(s[L]) vs lower(s[R])', lhs: 'r', op: '=', rhs: 'r', result: 'match' } },
      { title: 'Compare a === a ✓. Step inward.', pseudoLine: 4,
        array: { cells: 'racecar'.split('').map((c, i) => ({ value: c, highlight: (i === 1 || i === 5) ? 'i' as const : undefined })),
          pointers: [{ index: 1, label: 'L', color: 'red' }, { index: 5, label: 'R', color: 'amber' }] },
        computation: { label: 'lower(s[L]) vs lower(s[R])', lhs: 'a', op: '=', rhs: 'a', result: 'match' } },
      { title: 'Compare c === c ✓. Step inward.', pseudoLine: 4,
        array: { cells: 'racecar'.split('').map((c, i) => ({ value: c, highlight: (i === 2 || i === 4) ? 'i' as const : undefined })),
          pointers: [{ index: 2, label: 'L', color: 'red' }, { index: 4, label: 'R', color: 'amber' }] },
        computation: { label: 'lower(s[L]) vs lower(s[R])', lhs: 'c', op: '=', rhs: 'c', result: 'match' } },
      { title: 'Pointers meet at center "e". Loop exits — return true.',
        detail: 'The middle character of an odd-length palindrome is unreachable to the comparison; that is correct because a single character is trivially a palindrome with itself.',
        pseudoLine: 6,
        array: { cells: 'racecar'.split('').map((c, i) => ({ value: c, highlight: i === 3 ? 'found' as const : undefined })),
          pointers: [{ index: 3, label: 'L=R', color: 'emerald' }] },
        result: { found: true, value: 'true' } },
    ],
    tradeoffs: "This is the canonical answer. It is harder to write correctly (off-by-one in the inner skip-loops is the classic bug — be careful with the `left<right` guard) but interviewers want to see you handle the 'ignore certain chars' rule without allocating a new string.",
  },
  {
    id: 'regex-strip',
    name: 'Strip with Regex + Compare Reversed (Alternative — readable)',
    badge: 'alternative',
    intuition:
      "Build a clean version of the string — only alphanumeric, lowercased — then check if it equals its own reverse. Less code, easier to reason about, easier to extend (e.g., 'also ignore underscores' is a single character class change). The cost is O(n) extra space for the cleaned copy.\n\n" +
      "**The regex `/[^a-z0-9]/gi` is the centerpiece. Let's break it down piece by piece:**\n\n" +
      "• `[ ]` — a *character class*, meaning 'any one character from this set'.\n" +
      "• `^` (only when it's the first thing inside `[]`) — *negation*. Now the class means 'any character NOT in this set'.\n" +
      "• `a-z` — a range: lowercase letters a through z.\n" +
      "• `0-9` — another range: digits.\n" +
      "• `g` flag (after the closing `/`) — *global*: replace ALL occurrences, not just the first.\n" +
      "• `i` flag — *case-insensitive*: `a-z` also matches `A-Z` because of `i`. (Without `i` we would write `[^a-zA-Z0-9]` instead.)\n\n" +
      "So the whole pattern reads: 'every character that is not a lowercase letter, not an uppercase letter (because of `i`), and not a digit'. We hand it to `replace(re, '')` to delete each such character. After that, we lowercase what remains and compare with its reverse.",
    complexity: { time: 'O(n)', space: 'O(n)', verdict: 'Use when readability matters more than the constant-factor space savings' },
    pseudocode: [
      'cleaned = s.replace(/[^a-z0-9]/gi, "").toLowerCase()',
      'reversed = cleaned.split("").reverse().join("")',
      'return cleaned === reversed',
    ],
    example: { input: '"A man, a plan, a canal: Panama"', output: 'true' },
    steps: [
      {
        title: 'Strip non-alphanumeric. "A man, a plan, a canal: Panama" → "AmanaplanacanalPanama".',
        detail: 'The regex `/[^a-z0-9]/gi` matches every space, comma, colon. The `g` flag means replace ALL occurrences. The `i` flag means a-z also matches A-Z, so we keep both cases in this step.',
        pseudoLine: 0,
        note: '**The regex breakdown:** `[^a-z0-9]` = any one char NOT in (lowercase letters | digits). The `i` flag extends this to uppercase letters too. The `g` flag triggers global replace.',
        computation: { label: 'replace', lhs: 'long input', op: '→', result: '"AmanaplanacanalPanama"' },
      },
      {
        title: 'Lowercase it: "amanaplanacanalpanama".',
        pseudoLine: 0,
        computation: { label: 'toLowerCase', result: '"amanaplanacanalpanama"' },
      },
      {
        title: 'Reverse: split → reverse → join → "amanaplanacanalpanama".',
        detail: 'It happens to be the same forward and backward (that is what palindrome means).',
        pseudoLine: 1,
        computation: { label: 'split→reverse→join', result: '"amanaplanacanalpanama"' },
      },
      {
        title: 'Compare. cleaned === reversed → return true.',
        pseudoLine: 2,
        computation: { label: 'strict equality', lhs: 'cleaned', op: '===', rhs: 'reversed', result: 'true' },
        result: { found: true, value: 'true' },
      },
    ],
    tradeoffs: "Three passes over the string (replace, toLowerCase, reverse) plus the equality check — about 4× the work of the two-pointer approach, plus O(n) memory. Real-world: this is fine; the readability is worth it. Interview: be ready for 'now do it in O(1) space' which is the cue to switch to two-pointer.",
    usesPolyfills: [
      { builtin: 'String.prototype.replace', templateName: 'Array.prototype.join',
        why: 'replace deletes every match of the regex (uses the regex engine, not directly polyfilled here)' },
      { builtin: 'Array.prototype.reverse', templateName: 'Array.reverse',
        why: 'reverse the cleaned character array to compare against the original' },
    ],
  }],
};

// ====================================================================

const fizzBuzz: Explanation = {
  problem: 'FizzBuzz',
  problemStatement: 'For numbers 1..n: print "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for multiples of 15 (which are multiples of both), otherwise the number itself. The classic screening question — designed to filter out candidates who cannot translate plain-English rules into code.',
  approaches: [{
    id: 'modulo',
    name: 'Modulo Branching (Best)',
    badge: 'best',
    intuition:
      "The trick is **order of checks**. A multiple of 15 is also a multiple of 3 AND of 5. If you check `%3` first, you print 'Fizz' for 15 and never get to the combined case. So the rule is: **most-specific case first**. Check `%15` (or equivalently, check `%3 && %5`) before checking `%3` or `%5` alone.\n\n" +
      "Once that's clear, the rest is a simple loop with `if/else if/else`. Each iteration is O(1) (three modulo operations and a push), the whole thing is O(n).",
    complexity: { time: 'O(n)', space: 'O(n) for the output array; O(1) extra', verdict: 'Canonical — what every interviewer expects' },
    pseudocode: [
      'for i from 1 to n:',
      '  if i % 15 === 0: push "FizzBuzz"',
      '  else if i % 3 === 0: push "Fizz"',
      '  else if i % 5 === 0: push "Buzz"',
      '  else: push String(i)',
    ],
    example: { input: 'n = 15', output: '[1,2,Fizz,4,Buzz,Fizz,7,8,Fizz,Buzz,11,Fizz,13,14,FizzBuzz]' },
    steps: [
      { title: 'i=1: not divisible by 3 or 5 → push "1".', pseudoLine: 4,
        array: { cells: [{ value: 1, highlight: 'i' }] } },
      { title: 'i=3: 3 % 3 === 0, 3 % 15 !== 0 → push "Fizz".', pseudoLine: 2,
        computation: { label: '3 % 3', result: '0 → Fizz' } },
      { title: 'i=5: 5 % 5 === 0 → push "Buzz".', pseudoLine: 3,
        computation: { label: '5 % 5', result: '0 → Buzz' } },
      { title: 'i=15: 15 % 15 === 0 → push "FizzBuzz". This is why we check 15 FIRST.', pseudoLine: 1,
        computation: { label: '15 % 15', result: '0 → FizzBuzz' },
        note: 'If you check %3 first, you would print "Fizz" and miss the combined case. Order matters.',
        result: { found: true, value: '[1,2,Fizz,...,FizzBuzz]' } },
    ],
    tradeoffs: "A 'string-build' variant concatenates: `s = (i%3?'':'Fizz') + (i%5?'':'Buzz') || String(i)`. Same output, slightly slower in tight loops, more readable to some. Lookup-table variants exist but rarely win on n ≤ 10⁶.",
  },
  {
    id: 'string-concat',
    name: 'String Concatenation — No Branching (Alternative)',
    badge: 'alternative',
    intuition:
      "Avoid the `if/else if` ladder entirely. Build the output string by concatenating 'Fizz' if divisible by 3 plus 'Buzz' if divisible by 5. If the result is empty (neither), fall back to `String(i)`. The clever bit is using the fact that an empty string is falsy in JavaScript, so `'' || String(i)` evaluates to `String(i)`.\n\n" +
      "Why this is interesting: it eliminates the multi-of-15 special case naturally. If a number is divisible by both, both 'Fizz' and 'Buzz' get concatenated, giving 'FizzBuzz' — no explicit check needed. This generalizes well: adding a 'Bazz for multiples of 7' is one more line, no order rearrangement.",
    complexity: { time: 'O(n)', space: 'O(n)', verdict: 'Cleaner for extending; slightly slower per iteration' },
    pseudocode: [
      'for i from 1 to n:',
      '  s = ""',
      '  if i % 3 === 0: s += "Fizz"',
      '  if i % 5 === 0: s += "Buzz"',
      '  push(s || String(i))',
    ],
    example: { input: 'n = 15', output: '[1,2,Fizz,4,Buzz,Fizz,7,8,Fizz,Buzz,11,Fizz,13,14,FizzBuzz]' },
    steps: [
      { title: 'i=3: 3 % 3 === 0 → s = "Fizz". 3 % 5 ≠ 0 → s stays "Fizz".', pseudoLine: 2,
        computation: { label: 's', result: '"Fizz"' } },
      { title: 'i=15: 15 % 3 === 0 → s = "Fizz". 15 % 5 === 0 → s = "FizzBuzz".',
        detail: 'No special "multiple of 15" branch needed — both conditions fire and concatenate naturally.',
        pseudoLine: 3,
        computation: { label: 's', result: '"FizzBuzz"' } },
      { title: 'i=4: neither condition fires → s stays "". Push String(4) via the `s || String(i)` trick.',
        detail: 'Empty string is falsy in JS, so `"" || "4"` evaluates to "4". This is the elegant fallback that replaces the explicit else branch.',
        pseudoLine: 4,
        computation: { label: 's || String(i)', lhs: '""', op: '||', rhs: '"4"', result: '"4"' },
        result: { found: true, value: '4 → pushed as String' } },
    ],
    tradeoffs: "Slightly slower in microbenchmarks (string concat allocates) but more elegant when the rules grow (Fizz/Buzz/Bazz/Quux/...). For interview purposes the modulo version is more conventional; this version is the senior-level 'I see the pattern' answer.",
  }],
};

// ====================================================================

const maxProfit: Explanation = {
  problem: 'Max Profit (Best Time to Buy/Sell Stock)',
  problemStatement: 'Given an array `prices` where `prices[i]` is the stock price on day i, return the maximum profit from one buy and one sell. You must buy before you sell. If no profit is possible, return 0.',
  approaches: [{
    id: 'one-pass',
    name: 'Single Pass — Track Min So Far (Best)',
    badge: 'best',
    intuition:
      "Imagine walking through the prices left-to-right. At each day, ask one question: **if I sold today, what would my profit be if I had bought on the cheapest day I've seen so far?** That profit is `today_price − min_seen_so_far`. Keep the maximum of these as you go.\n\n" +
      "Two scalar variables, `minPrice` (initially +∞) and `maxProfit` (initially 0). For each price: if it's a new low, update `minPrice` and skip — no profit can be realized today by buying today and selling today. Otherwise, compute today's hypothetical profit and update `maxProfit` if it beats the previous best.\n\n" +
      "**Why this is correct:** any optimal buy/sell pair has *some* buy day. For that buy day to be optimal, no earlier day can have been cheaper (otherwise we'd have bought earlier). So at each sell day, considering only the running minimum is sufficient — any other earlier 'buy candidate' is dominated.",
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Canonical — single linear pass' },
    pseudocode: [
      'minPrice = Infinity, maxProfit = 0',
      'for price in prices:',
      '  if price < minPrice: minPrice = price',
      '  else: maxProfit = max(maxProfit, price - minPrice)',
      'return maxProfit',
    ],
    example: { input: '[7, 1, 5, 3, 6, 4]', output: '5' },
    steps: [
      { title: 'i=0, price=7. minPrice=7. Cannot sell yet.', pseudoLine: 2,
        array: { cells: [{ value: 7, highlight: 'i' }, { value: 1 }, { value: 5 }, { value: 3 }, { value: 6 }, { value: 4 }] },
        computation: { label: 'minPrice', result: '7' } },
      { title: 'i=1, price=1. New low → minPrice=1.', pseudoLine: 2,
        array: { cells: [{ value: 7 }, { value: 1, highlight: 'i' }, { value: 5 }, { value: 3 }, { value: 6 }, { value: 4 }] },
        computation: { label: 'minPrice', result: '1' } },
      { title: 'i=2, price=5. profit = 5−1 = 4. maxProfit=4.', pseudoLine: 3,
        array: { cells: [{ value: 7 }, { value: 1, highlight: 'compare' }, { value: 5, highlight: 'i' }, { value: 3 }, { value: 6 }, { value: 4 }] },
        computation: { label: 'price − minPrice', lhs: '5', op: '−', rhs: '1', result: '4' } },
      { title: 'i=4, price=6. profit = 6−1 = 5. maxProfit=5.', pseudoLine: 3,
        array: { cells: [{ value: 7 }, { value: 1, highlight: 'compare' }, { value: 5 }, { value: 3 }, { value: 6, highlight: 'found' }, { value: 4 }] },
        computation: { label: 'price − minPrice', lhs: '6', op: '−', rhs: '1', result: '5' },
        result: { found: true, value: '5' } },
    ],
    tradeoffs: 'Brute force checks every (i, j) pair → O(n²). The single-pass trick is the gold standard. Generalizes to "k transactions" via DP but that is a different problem.',
  },
  {
    id: 'brute-force',
    name: 'Brute Force — Try Every Pair (Baseline)',
    badge: 'baseline',
    intuition:
      "The literal reading of the problem: for every possible buy day i and every sell day j > i, compute `prices[j] − prices[i]` and remember the maximum. The two nested loops produce all n·(n−1)/2 valid pairs. Easy to write, easy to verify correctness — and impossibly slow on big inputs.\n\n" +
      "Worth knowing because the path from this brute force to the O(n) one-pass is a beautiful illustration of how a key insight (`only the running minimum matters`) collapses an O(n²) algorithm into O(n).",
    complexity: { time: 'O(n²)', space: 'O(1)', verdict: "Don't ship — for any n > 10⁴ this times out" },
    pseudocode: [
      'maxProfit = 0',
      'for i from 0 to n-1:',
      '  for j from i+1 to n-1:',
      '    profit = prices[j] - prices[i]',
      '    if profit > maxProfit: maxProfit = profit',
      'return maxProfit',
    ],
    example: { input: '[7, 1, 5, 3, 6, 4]', output: '5' },
    steps: [
      { title: 'i=0 (price=7). Try j=1..5. Best profit so far: 0 (selling 7→1, 7→5… all losses).', pseudoLine: 2,
        array: { cells: [{ value: 7, highlight: 'i' }, { value: 1, highlight: 'j' }, { value: 5 }, { value: 3 }, { value: 6 }, { value: 4 }] },
        computation: { label: 'prices[j] − prices[i]', lhs: '1', op: '−', rhs: '7', result: '−6 (skip)' } },
      { title: 'i=1 (price=1). Try j=2..5. profit at j=4: 6−1 = 5.', pseudoLine: 4,
        array: { cells: [{ value: 7 }, { value: 1, highlight: 'i' }, { value: 5 }, { value: 3 }, { value: 6, highlight: 'found' }, { value: 4 }] },
        computation: { label: 'prices[j] − prices[i]', lhs: '6', op: '−', rhs: '1', result: '5 (new max)' } },
      { title: 'Continue for i=2..4. No pair beats 5. Return 5.', pseudoLine: 5,
        result: { found: true, value: '5' } },
    ],
    tradeoffs: 'Useful as a sanity check against the optimized version on small inputs (their outputs must match). Never the answer to ship.',
  }],
};

// ====================================================================

const validParentheses: Explanation = {
  problem: 'Valid Parentheses',
  problemStatement: 'Given a string of brackets `()[]{}`, return true if every opener has a matching closer in the correct order. `"({[]})"` is valid; `"([)]"` is not (the brackets cross). Compare with the simpler "Balanced Brackets (Count)" challenge which only checks counts and ignores ordering.',
  approaches: [{
    id: 'stack',
    name: 'Stack — Match Most-Recent Opener (Best)',
    badge: 'best',
    intuition:
      "Brackets nest like Russian dolls. The most recently opened bracket must be the next one to close — it's a strict last-in-first-out discipline. That's exactly what a stack provides.\n\n" +
      "**Algorithm:** scan the string left-to-right. On an opener (`(`, `[`, `{`), push it. On a closer (`)`, `]`, `}`), peek at the stack: it must be a matching opener, so pop it. If the popped opener doesn't match (or the stack was empty), the string is invalid. At the end of the scan, the stack must be empty (every opener got closed).\n\n" +
      "A small map `{ ')': '(', ']': '[', '}': '{' }` makes the closer-to-opener lookup O(1). Many candidates instead store opener-to-closer and check the inverse — works either way; pick whichever you find easier to read.",
    complexity: { time: 'O(n)', space: 'O(n) — worst case all openers on the stack', verdict: 'Canonical — what every interviewer expects' },
    pseudocode: [
      'stack = [], pairs = { ")": "(", "]": "[", "}": "{" }',
      'for ch in s:',
      '  if ch is opener: stack.push(ch)',
      '  else if stack.pop() !== pairs[ch]: return false',
      'return stack.length === 0',
    ],
    example: { input: '"({[]})"', output: 'true' },
    steps: [
      { title: 'Read "(". Push to stack.', pseudoLine: 2, stack: { items: [{ value: '(', highlight: 'new' }], action: 'push' } },
      { title: 'Read "{". Push.', pseudoLine: 2, stack: { items: [{ value: '(' }, { value: '{', highlight: 'new' }], action: 'push' } },
      { title: 'Read "[". Push.', pseudoLine: 2, stack: { items: [{ value: '(' }, { value: '{' }, { value: '[', highlight: 'new' }], action: 'push' } },
      { title: 'Read "]". Pop "[" — matches. Continue.', pseudoLine: 3, stack: { items: [{ value: '(' }, { value: '{' }], action: 'pop' },
        computation: { label: 'pop & compare', lhs: '[', op: '↔', rhs: ']', result: 'match' } },
      { title: 'Read "}". Pop "{" — matches.', pseudoLine: 3, stack: { items: [{ value: '(' }], action: 'pop' } },
      { title: 'Read ")". Pop "(" — matches. Stack empty.', pseudoLine: 4, stack: { items: [], action: 'pop' },
        result: { found: true, value: 'true' } },
    ],
    tradeoffs: "A counter-only approach (track depth of each kind) is wrong — `([)]` would pass. The stack is what enforces correct nesting order. Don't confuse this with the simpler 'Balanced Brackets (Count)' challenge.",
  },
  {
    id: 'replace-pairs',
    name: 'Replace Inner Pairs (Cute but Slow)',
    badge: 'alternative',
    intuition:
      "A clever non-stack approach: notice that any valid bracket string must contain an *innermost* pair `()`, `[]`, or `{}` — a pair with nothing between the opener and closer. Repeatedly delete those pairs. If the string is valid, you'll eventually delete everything; if it's invalid, you'll get stuck with leftover characters.\n\n" +
      "Implementation: while the string contains `()`, `[]`, or `{}` as a substring, replace it with empty. Stop when no more replacements happen. If the result is the empty string, the input was valid.\n\n" +
      "**Why this is O(n²):** each `replace` call is O(n), and you may need O(n) passes (one per nesting level). For deeply nested input like `(((((...)))))`, that's O(n²) total. The stack approach is O(n) — strictly better. So why teach this? Because it's a beautiful constructive proof that a valid bracket string can always be reduced to nothing by removing innermost pairs.",
    complexity: { time: 'O(n²)', space: 'O(n)', verdict: "Don't ship at scale — but a fun alternative to think with" },
    pseudocode: [
      'while s.length > 0:',
      '  prev = s',
      '  s = s.replace("()", "").replace("[]", "").replace("{}", "")',
      '  if s === prev: break  // no progress → invalid',
      'return s.length === 0',
    ],
    example: { input: '"({[]})"', output: 'true' },
    steps: [
      { title: 'Pass 1: replace "[]" → s becomes "({})".', pseudoLine: 2,
        computation: { label: 'replace', lhs: '"({[]})"', op: '→', result: '"({})"' } },
      { title: 'Pass 2: replace "{}" → s becomes "()".', pseudoLine: 2,
        computation: { label: 'replace', lhs: '"({})"', op: '→', result: '"()"' } },
      { title: 'Pass 3: replace "()" → s becomes "". Length 0 → valid.', pseudoLine: 4,
        computation: { label: 'replace', lhs: '"()"', op: '→', result: '""' },
        result: { found: true, value: 'true' } },
    ],
    tradeoffs: 'A nice teaching tool to convince yourself that the rule "every valid bracket string reduces to nothing by removing inner pairs" is true. But quadratic time makes it a non-starter for large inputs — always reach for the stack in production.',
  }],
};

// ====================================================================

const mergeSortedArrays: Explanation = {
  problem: 'Merge Sorted Arrays',
  problemStatement: 'Given two arrays already sorted in ascending order, merge them into one sorted array.',
  approaches: [{
    id: 'two-pointer',
    name: 'Two-Pointer Merge',
    badge: 'best',
    intuition: 'Pointer at the head of each array. Compare the two heads, take the smaller, advance that pointer. When one runs out, append the rest of the other. Each element copied exactly once.',
    complexity: { time: 'O(m + n)', space: 'O(m + n)', verdict: 'Canonical' },
    pseudocode: [
      'i = 0, j = 0, out = []',
      'while i < m and j < n:',
      '  if a[i] <= b[j]: out.push(a[i++])',
      '  else: out.push(b[j++])',
      'append leftover from a or b',
      'return out',
    ],
    example: { input: 'a=[1,3,5], b=[2,4,6]', output: '[1,2,3,4,5,6]' },
    steps: [
      { title: 'i=0, j=0. Compare 1 vs 2.', pseudoLine: 2,
        dualArray: { left: { label: 'a', cells: [{ value: 1, highlight: 'i' }, { value: 3 }, { value: 5 }], pointer: 0 },
          right: { label: 'b', cells: [{ value: 2, highlight: 'j' }, { value: 4 }, { value: 6 }], pointer: 0 },
          result: { label: 'merged', cells: [] } },
        computation: { label: 'a[i] <= b[j]', lhs: '1', op: '<=', rhs: '2', result: 'yes → take 1' } },
      { title: 'Take 1, advance i. Compare 3 vs 2.', pseudoLine: 3,
        dualArray: { left: { label: 'a', cells: [{ value: 1 }, { value: 3, highlight: 'i' }, { value: 5 }], pointer: 1 },
          right: { label: 'b', cells: [{ value: 2, highlight: 'j' }, { value: 4 }, { value: 6 }], pointer: 0 },
          result: { label: 'merged', cells: [{ value: 1 }] } },
        computation: { label: 'a[i] <= b[j]', lhs: '3', op: '<=', rhs: '2', result: 'no → take 2' } },
      { title: 'Take 2, advance j. Continue 3 vs 4 → take 3.', pseudoLine: 2,
        dualArray: { left: { label: 'a', cells: [{ value: 1 }, { value: 3, highlight: 'i' }, { value: 5 }], pointer: 1 },
          right: { label: 'b', cells: [{ value: 2 }, { value: 4, highlight: 'j' }, { value: 6 }], pointer: 1 },
          result: { label: 'merged', cells: [{ value: 1 }, { value: 2 }] } } },
      { title: 'a exhausted at i=3. Append remaining b: [6].', pseudoLine: 4,
        dualArray: { left: { label: 'a', cells: [{ value: 1 }, { value: 3 }, { value: 5 }] },
          right: { label: 'b', cells: [{ value: 2 }, { value: 4 }, { value: 6, highlight: 'j' }], pointer: 2 },
          result: { label: 'merged', cells: [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }] } },
        result: { found: true, value: '[1,2,3,4,5,6]' } },
    ],
    tradeoffs: 'Concat-and-sort works but is O((m+n) log(m+n)) — wasteful when both inputs are already sorted. The merge step of mergesort is exactly this routine.',
  },
  {
    id: 'concat-sort',
    name: 'Concat + Sort (Lazy Alternative)',
    badge: 'baseline',
    intuition:
      "If you don't care about preserving the sorted-ness of the inputs, the laziest answer is `[...a, ...b].sort((x,y) => x − y)`. One spread to merge into a new array, one sort.\n\n" +
      "**Why this is wasteful:** the engine's sort is general-purpose — it doesn't know the inputs are already sorted, so it does O((m+n) log(m+n)) comparisons. The two-pointer merge does exactly m+n comparisons. On 100k+m100k arrays, that's a 17× difference.\n\n" +
      "**Why people still write it:** it's three characters of code. In real code, when n is small or the arrays aren't actually sorted, this is the right call. In an interview, mention this as the 'if I didn't know they were sorted' baseline, then switch to two-pointer.",
    complexity: { time: 'O((m+n) log(m+n))', space: 'O(m+n)', verdict: 'Acceptable for tiny inputs; wasteful otherwise' },
    pseudocode: [
      'return [...a, ...b].sort((x, y) => x - y)',
    ],
    example: { input: 'a=[1,3,5], b=[2,4,6]', output: '[1,2,3,4,5,6]' },
    steps: [
      { title: 'Spread both arrays into a new one: [1,3,5,2,4,6].', pseudoLine: 0,
        array: { cells: [1,3,5,2,4,6].map(v => ({ value: v })) } },
      { title: 'Sort with numeric comparator (default sort is lexicographic — easy to forget!). Result: [1,2,3,4,5,6].',
        detail: '`.sort()` without a comparator sorts as strings, so [10, 2] sorts to [10, 2] — looks right, but [10, 2, 1] sorts to [1, 10, 2]. Always pass `(a,b) => a-b` for numbers.',
        pseudoLine: 0,
        array: { cells: [1,2,3,4,5,6].map(v => ({ value: v, highlight: 'found' as const })) },
        result: { found: true, value: '[1,2,3,4,5,6]' } },
    ],
    tradeoffs: 'Use when the inputs might not actually be sorted, or when n is small enough that the constant factor difference does not matter. For 99% of "merge two sorted lists" problems, the two-pointer is strictly better.',
    usesPolyfills: [
      { builtin: 'Array.prototype.sort', templateName: 'Array.sort',
        why: "the engine's general-purpose sort runs over the concatenated array" },
    ],
  }],
};

// ====================================================================

const flattenArray: Explanation = {
  problem: 'Flatten Array (Deep)',
  problemStatement: 'Given a nested array, flatten it to a single level — `[1, [2, [3, 4], 5]] → [1,2,3,4,5]`.',
  approaches: [{
    id: 'recursive',
    name: 'Recursive Reduce',
    badge: 'best',
    intuition: 'For each element, if it is an array, recursively flatten and concatenate; otherwise append. The recursion mirrors the structure of the data.',
    complexity: { time: 'O(n)', space: 'O(d) call-stack where d is nesting depth', verdict: 'Canonical for arbitrary depth' },
    pseudocode: [
      'function flat(arr):',
      '  return arr.reduce((acc, x) =>',
      '    Array.isArray(x) ? acc.concat(flat(x)) : acc.concat(x),',
      '    [])',
    ],
    example: { input: '[1, [2, [3, 4]]]', output: '[1, 2, 3, 4]' },
    steps: [
      { title: 'Top call: flat([1, [2, [3, 4]]])', pseudoLine: 0,
        callStack: { frames: [{ call: 'flat([1, [2, [3, 4]]])', status: 'active' }] } },
      { title: 'Element 1 is not an array → push. Element [2, [3, 4]] is → recurse.', pseudoLine: 1,
        callStack: { frames: [{ call: 'flat([1, [2, [3, 4]]])', status: 'pending' }, { call: 'flat([2, [3, 4]])', status: 'active' }] } },
      { title: 'Inside flat([2, [3, 4]]): element 2 plain, [3, 4] is an array → recurse again.', pseudoLine: 1,
        callStack: { frames: [{ call: 'flat([1, [2, [3, 4]]])', status: 'pending' }, { call: 'flat([2, [3, 4]])', status: 'pending' }, { call: 'flat([3, 4])', status: 'active' }] } },
      { title: 'flat([3, 4]) returns [3, 4]. Bubble up: parent gets [2, 3, 4].', pseudoLine: 2,
        callStack: { frames: [{ call: 'flat([1, [2, [3, 4]]])', status: 'pending' }, { call: 'flat([2, [3, 4]])', status: 'returned', returns: '[2,3,4]' }] } },
      { title: 'Top returns [1, 2, 3, 4].', pseudoLine: 2,
        callStack: { frames: [{ call: 'flat([1, [2, [3, 4]]])', status: 'returned', returns: '[1,2,3,4]' }] },
        result: { found: true, value: '[1, 2, 3, 4]' } },
    ],
    tradeoffs: 'Iterative version with a stack avoids recursion-depth limits — necessary if input nesting can be 10,000+ deep. ES2019 `Array.prototype.flat(Infinity)` is the modern shortcut for non-pathological inputs.',
    usesPolyfills: [
      { builtin: 'Array.prototype.reduce', templateName: 'Array.reduce',
        why: 'folds each item into an accumulating result array' },
      { builtin: 'Array.prototype.concat', templateName: 'Array.concat',
        why: 'merges nested results one level at a time' },
      { builtin: 'Array.prototype.flat', templateName: 'Array.flat & flatMap',
        why: 'the modern one-liner replacement (`arr.flat(Infinity)`)' },
    ],
  },
  {
    id: 'iterative-stack',
    name: 'Iterative with Stack (Recursion-Safe)',
    badge: 'alternative',
    intuition:
      "The recursive version is elegant but has a hard ceiling: V8's JS call stack is around 10–15k frames. If your input is `[[[[[...[1]...]]]]]` nested 20k deep, recursion overflows. The fix: simulate recursion explicitly with a stack.\n\n" +
      "Push the input onto a stack. While the stack is non-empty, pop a value. If it's an array, push its elements back (reversed, so the first child comes off next — preserving order). If it's a primitive, prepend to the result. The trick of pushing children **in reverse** is what keeps the output in left-to-right order even though the stack is LIFO.\n\n" +
      "This is the same algorithm as the recursive version — depth-first, left-to-right — but with the call stack moved into our heap-allocated `stack` array, which has no fixed limit (other than memory).",
    complexity: { time: 'O(n)', space: 'O(n)', verdict: 'Use when input nesting depth could blow the call stack' },
    pseudocode: [
      'stack = [...arr]                  // shallow copy so we can pop',
      'out = []',
      'while stack.length > 0:',
      '  x = stack.pop()',
      '  if Array.isArray(x): stack.push(...x)   // push items in original order',
      '  else: out.unshift(x)            // prepend so order stays left-to-right',
      'return out',
    ],
    example: { input: '[1, [2, [3, 4]]]', output: '[1, 2, 3, 4]' },
    steps: [
      { title: 'Initial stack: [1, [2, [3, 4]]]. Pop right side first.',
        pseudoLine: 3,
        stack: { items: [{ value: 1 }, { value: '[2,[3,4]]' as const }], action: 'pop' } },
      { title: 'Popped [2, [3, 4]] — it is an array. Push its elements: 2, then [3,4].',
        pseudoLine: 4,
        stack: { items: [{ value: 1 }, { value: 2 }, { value: '[3,4]' as const, highlight: 'new' as const }], action: 'push' } },
      { title: 'Pop [3,4]. It is an array. Push 3, 4.',
        pseudoLine: 4,
        stack: { items: [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4, highlight: 'new' as const }], action: 'push' } },
      { title: 'Pop 4 (primitive) → out=[4]. Pop 3 → out=[3,4]. Pop 2 → out=[2,3,4]. Pop 1 → out=[1,2,3,4].',
        pseudoLine: 5,
        stack: { items: [], action: 'pop' },
        result: { found: true, value: '[1,2,3,4]' } },
    ],
    tradeoffs: "Always safe regardless of nesting depth, but slightly more code than the recursive version. Use when you don't trust the input depth. Note: `Array.prototype.flat(Infinity)` is the modern one-liner that is also iterative under the hood — prefer it in production unless you need to support very old browsers.",
  }],
};

// ====================================================================

const debounce: Explanation = {
  problem: 'Debounce',
  problemStatement: 'Wrap a function so it only fires after `wait` ms of silence. Every call within the wait window cancels the pending fire and restarts the timer.',
  approaches: [{
    id: 'trailing',
    name: 'Trailing-Edge Debounce',
    badge: 'best',
    intuition: 'Keep a single timeout reference. Every call clears the previous timeout and schedules a fresh one. The wrapped function only runs when `wait` ms have passed without any new call.',
    complexity: { time: 'O(1) per call', space: 'O(1)', verdict: 'Canonical' },
    pseudocode: [
      'function debounce(fn, wait):',
      '  let timer = null',
      '  return (...args) =>',
      '    clearTimeout(timer)',
      '    timer = setTimeout(() => fn(...args), wait)',
    ],
    example: { input: 'debounced("a"), …300ms…, debounced("b"), …500ms idle…', output: 'fn("b")' },
    steps: [
      { title: 't=0: call with "a". Schedule fire at t=500.', pseudoLine: 4,
        timeline: { events: [{ t: 0, label: 'call "a"', kind: 'input' }, { t: 500, label: 'pending', kind: 'pending' }], windowMs: 500 } },
      { title: 't=300: call with "b". Cancel pending, reschedule fire at t=800.', pseudoLine: 3,
        timeline: { events: [{ t: 0, label: '"a"', kind: 'skip' }, { t: 300, label: 'call "b"', kind: 'input' }, { t: 800, label: 'pending', kind: 'pending' }], windowMs: 500 } },
      { title: 't=800: 500ms of silence after the last call → fire fn("b").', pseudoLine: 4,
        timeline: { events: [{ t: 0, label: '"a"', kind: 'skip' }, { t: 300, label: '"b"', kind: 'input' }, { t: 800, label: 'fire("b")', kind: 'fire' }], windowMs: 500 },
        result: { found: true, value: 'fn("b")' } },
    ],
    tradeoffs: "Leading-edge debounce fires immediately and ignores follow-ups — better for 'first click wins' (e.g., submit). Most search inputs want trailing. The 'cancellable' variant exposes `.cancel()` so unmounting components don't fire stale callbacks — a real-world must-have in React.",
  },
  {
    id: 'leading-edge',
    name: 'Leading-Edge Debounce (First Wins)',
    badge: 'alternative',
    intuition:
      "Inverse of trailing-edge: fire the function **immediately** on the first call, then ignore every subsequent call until `wait` ms of silence have passed. Use when 'first click wins' matters — preventing double-submits, handling the first key in a sequence, etc.\n\n" +
      "Implementation has a flag (`waiting`) instead of a pending timer. On call: if not `waiting`, fire immediately and start a timeout to clear `waiting` after `wait` ms. Subsequent calls during the wait window do nothing. After the timeout, the flag clears and the next call fires again.",
    complexity: { time: 'O(1) per call', space: 'O(1)', verdict: 'For "first click wins" scenarios' },
    pseudocode: [
      'function debounceLeading(fn, wait):',
      '  let waiting = false',
      '  return (...args) =>',
      '    if (!waiting):',
      '      fn(...args)',
      '      waiting = true',
      '      setTimeout(() => { waiting = false }, wait)',
    ],
    example: { input: 'click at t=0, t=100, t=600', output: 'fire at t=0; t=100 ignored; fire at t=600' },
    steps: [
      { title: 't=0: first click. waiting=false → fire immediately, set waiting=true.', pseudoLine: 4,
        timeline: { events: [{ t: 0, label: 'fire', kind: 'fire' }], windowMs: 500 } },
      { title: 't=100: click during wait. waiting=true → ignored.', pseudoLine: 3,
        timeline: { events: [{ t: 0, label: 'fire', kind: 'fire' }, { t: 100, label: 'ignored', kind: 'skip' }], windowMs: 500 } },
      { title: 't=500: timeout fires, waiting=false again.', pseudoLine: 6,
        timeline: { events: [{ t: 0, label: 'fire', kind: 'fire' }, { t: 100, label: 'skip', kind: 'skip' }, { t: 500, label: 'unlocked', kind: 'pending' }], windowMs: 500 } },
      { title: 't=600: next click. waiting=false → fire again.', pseudoLine: 4,
        timeline: { events: [{ t: 0, label: 'fire', kind: 'fire' }, { t: 100, label: 'skip', kind: 'skip' }, { t: 600, label: 'fire', kind: 'fire' }], windowMs: 500 },
        result: { found: true, value: 'fired at t=0 and t=600' } },
    ],
    tradeoffs: 'Leading-edge for: submit buttons, "load more" buttons, anywhere the first action matters and follow-ups are noise. Trailing-edge for: search-as-you-type, scroll-stop detection. Both-edges variants exist for completeness.',
  }],
};

// ====================================================================

const groupAnagrams: Explanation = {
  problem: 'Group Anagrams',
  problemStatement: 'Given an array of strings, group strings that are anagrams of each other.',
  approaches: [{
    id: 'sorted-key',
    name: 'Sorted-Letter Key',
    badge: 'best',
    intuition: 'Two strings are anagrams iff they have the same letters. Sort each string\'s letters to get a canonical key, then bucket by that key in a map.',
    complexity: { time: 'O(n · k log k)', space: 'O(n · k)', verdict: 'Canonical and short' },
    pseudocode: [
      'map = {}',
      'for s in strs:',
      '  key = [...s].sort().join("")',
      '  if !map[key]: map[key] = []',
      '  map[key].push(s)',
      'return Object.values(map)',
    ],
    example: { input: '["eat","tea","tan","ate","nat","bat"]', output: '[["eat","tea","ate"], ["tan","nat"], ["bat"]]' },
    steps: [
      { title: '"eat" → key "aet". Map: { aet: ["eat"] }.', pseudoLine: 4,
        map: { entries: [{ key: 'aet', value: '["eat"]', highlight: 'new' }] } },
      { title: '"tea" → key "aet". Match! Map: { aet: ["eat","tea"] }.', pseudoLine: 4,
        map: { entries: [{ key: 'aet', value: '["eat","tea"]', highlight: 'hit' }] } },
      { title: '"tan" → key "ant". New bucket.', pseudoLine: 3,
        map: { entries: [{ key: 'aet', value: '["eat","tea"]' }, { key: 'ant', value: '["tan"]', highlight: 'new' }] } },
      { title: 'After all: 3 buckets.', pseudoLine: 5,
        map: { entries: [{ key: 'aet', value: '["eat","tea","ate"]' }, { key: 'ant', value: '["tan","nat"]' }, { key: 'abt', value: '["bat"]' }] },
        result: { found: true, value: '3 groups' } },
    ],
    tradeoffs: 'Char-count signature ("a:1,e:1,t:1") avoids the sort, giving O(n·k). Slightly more code, faster on long strings. Prime-product trick (multiply primes assigned to each letter) is cute but overflows 64-bit on long inputs.',
    usesPolyfills: [
      { builtin: 'Array.prototype.sort', templateName: 'Array.sort',
        why: 'sorts the letters of each string into a canonical key' },
      { builtin: 'Array.prototype.join', templateName: 'Array.prototype.join',
        why: 'concatenates the sorted letters into a hashable string key' },
    ],
  },
  {
    id: 'char-count-key',
    name: 'Char-Count Signature (Faster on Long Strings)',
    badge: 'alternative',
    intuition:
      "The sort-based key takes O(k log k) per word. We can build a canonical signature in O(k) by counting characters and producing a fixed-shape string like `\"1,0,0,...,2,0,1\"` (26 numbers, comma-separated). Two anagrams produce identical signatures because they have identical letter counts.\n\n" +
      "Total work: O(n·k) — strictly better than O(n·k log k) when k is large. For 100-char words this beats sort by ~6×; for tiny words (3–4 chars) the sort version's tiny constant factors usually win in practice.",
    complexity: { time: 'O(n·k)', space: 'O(n·k)', verdict: 'Best when k (word length) is large' },
    pseudocode: [
      'map = {}',
      'for s in strs:',
      '  counts = new Array(26).fill(0)',
      '  for ch in s: counts[ch.charCodeAt(0) - 97]++',
      '  key = counts.join(",")',
      '  map[key] = (map[key] || []).concat(s)',
      'return Object.values(map)',
    ],
    example: { input: '["eat","tea","tan"]', output: '[["eat","tea"], ["tan"]]' },
    steps: [
      { title: '"eat" → counts: a=1, e=1, t=1 → key "1,0,0,0,1,0,...,1,0,...".',
        detail: 'Each letter increments its slot. Position 0 = a, 1 = b, ... 19 = t. The full 26-element comma-separated string is the canonical key.',
        pseudoLine: 4,
        map: { entries: [{ key: '"1,0,...1,..."', value: '["eat"]', highlight: 'new' }] } },
      { title: '"tea" → same counts → same key. Add to bucket.',
        pseudoLine: 5,
        map: { entries: [{ key: '"1,0,...1,..."', value: '["eat","tea"]', highlight: 'hit' }] } },
      { title: '"tan" → counts: a=1, n=1, t=1 → different key. New bucket.',
        pseudoLine: 5,
        map: { entries: [{ key: '"1,0,...,n=1..."', value: '["eat","tea"]' }, { key: '"a=1,n=1,t=1"', value: '["tan"]', highlight: 'new' }] },
        result: { found: true, value: '2 buckets' } },
    ],
    tradeoffs: 'Strictly faster than sort for long words. The 26-element fixed array assumes ASCII lowercase only; for arbitrary Unicode you would use a hash map of code points and serialize that — slightly more code but the same idea.',
  }],
};

// ====================================================================

const findDuplicates: Explanation = {
  problem: 'Find Duplicates',
  problemStatement: 'Return all values that appear more than once in an array.',
  approaches: [{
    id: 'two-sets',
    name: 'Two Sets — Seen + Duplicates',
    badge: 'best',
    intuition: 'One pass. Track every value you have seen. The second time you see one, add it to a duplicates set so you do not record it more than once.',
    complexity: { time: 'O(n)', space: 'O(n)', verdict: 'Canonical' },
    pseudocode: [
      'seen = new Set(), dups = new Set()',
      'for x in arr:',
      '  if seen.has(x): dups.add(x)',
      '  else: seen.add(x)',
      'return [...dups]',
    ],
    example: { input: '[1, 2, 3, 2, 4, 1]', output: '[2, 1]' },
    steps: [
      { title: '1 → not in seen. Add to seen.', pseudoLine: 3, set: { items: [{ value: 1, highlight: 'new' }] } },
      { title: '2 → not in seen. Add.', pseudoLine: 3, set: { items: [{ value: 1 }, { value: 2, highlight: 'new' }] } },
      { title: '3 → not in seen. Add.', pseudoLine: 3, set: { items: [{ value: 1 }, { value: 2 }, { value: 3, highlight: 'new' }] } },
      { title: '2 → in seen! Add to dups.', pseudoLine: 2, set: { items: [{ value: 2, highlight: 'hit' }] }, note: 'dups now contains {2}' },
      { title: '4 → new. 1 → in seen, add to dups. Final dups = {2, 1}.', pseudoLine: 2,
        set: { items: [{ value: 2 }, { value: 1, highlight: 'hit' }] },
        result: { found: true, value: '[2, 1]' } },
    ],
    tradeoffs: 'Frequency map (`Map<x, count>`) is identical work but lets you also report counts. Sort-then-scan is O(n log n) but O(1) space — pick when memory is tight.',
  },
  {
    id: 'sort-scan',
    name: 'Sort-Then-Scan (O(1) Extra Space)',
    badge: 'alternative',
    intuition:
      "Sort the array first. Now any duplicates sit next to each other. Walk once and emit any element equal to its predecessor. The trade is O(n log n) time for O(1) extra space — useful when memory is the constraint or the input can be mutated.\n\n" +
      "Caveat: this destroys the original order of the input (the sort mutates). If you need to preserve the input, copy first — but then you've spent O(n) space again, defeating the point.",
    complexity: { time: 'O(n log n)', space: 'O(1) if mutating allowed; O(n) for a copy', verdict: 'When memory matters more than time' },
    pseudocode: [
      'arr.sort((a,b) => a - b)',
      'dups = []',
      'for i from 1 to n-1:',
      '  if arr[i] === arr[i-1] and arr[i] !== arr[i-2]:',
      '    dups.push(arr[i])',
      'return dups',
    ],
    example: { input: '[1, 2, 3, 2, 4, 1]', output: '[1, 2]' },
    steps: [
      { title: 'Sort: [1, 2, 3, 2, 4, 1] → [1, 1, 2, 2, 3, 4].', pseudoLine: 0,
        array: { cells: [1,1,2,2,3,4].map(v => ({ value: v, highlight: 'compare' as const })) } },
      { title: 'i=1: arr[1]=1, arr[0]=1 — duplicate found. Push 1.', pseudoLine: 4,
        array: { cells: [{ value: 1, highlight: 'found' }, { value: 1, highlight: 'found' }, { value: 2 }, { value: 2 }, { value: 3 }, { value: 4 }] } },
      { title: 'i=3: arr[3]=2, arr[2]=2 — duplicate. Check arr[i-2]=1 ≠ 2 → not yet recorded. Push 2.', pseudoLine: 4,
        detail: 'The `arr[i] !== arr[i-2]` guard handles triples (e.g., [2,2,2] only emits 2 once, not twice).',
        result: { found: true, value: '[1, 2]' } },
    ],
    tradeoffs: 'Cleanest if you can mutate the input. The triple-equal-guard is the part candidates often miss — without it, [1,1,1] would emit 1 twice.',
    usesPolyfills: [
      { builtin: 'Array.prototype.sort', templateName: 'Array.sort',
        why: 'sorting groups equal elements together for the linear scan' },
    ],
  }],
};

// ====================================================================

const removeDuplicates: Explanation = {
  problem: 'Remove Duplicates',
  problemStatement: 'Return the array with duplicates removed (keep first occurrence).',
  approaches: [{
    id: 'set',
    name: 'Set Pass',
    badge: 'best',
    intuition: 'Walk the array. If you have not seen the value, add to result and to a "seen" set. Single pass, O(n).',
    complexity: { time: 'O(n)', space: 'O(n)', verdict: 'Canonical' },
    pseudocode: [
      'seen = new Set(), out = []',
      'for x in arr:',
      '  if !seen.has(x):',
      '    seen.add(x); out.push(x)',
      'return out',
    ],
    example: { input: '[1, 2, 2, 3, 1, 4]', output: '[1, 2, 3, 4]' },
    steps: [
      { title: 'Start. seen = {}, out = [].', pseudoLine: 0, set: { items: [] } },
      { title: '1 → new. seen={1}, out=[1].', pseudoLine: 3, set: { items: [{ value: 1, highlight: 'new' }] } },
      { title: '2 → new. seen={1,2}, out=[1,2].', pseudoLine: 3, set: { items: [{ value: 1 }, { value: 2, highlight: 'new' }] } },
      { title: '2 → hit. Skip.', pseudoLine: 2, set: { items: [{ value: 1 }, { value: 2, highlight: 'hit' }] } },
      { title: 'Final: out=[1,2,3,4].', pseudoLine: 4,
        set: { items: [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }] },
        result: { found: true, value: '[1, 2, 3, 4]' } },
    ],
    tradeoffs: '`[...new Set(arr)]` is the one-liner equivalent. The Set version is O(n) average; sort-then-uniq is O(n log n). For tiny arrays, `arr.filter((x, i) => arr.indexOf(x) === i)` is acceptable but is O(n²).',
  },
  {
    id: 'spread-set',
    name: 'Set Spread (One-Liner)',
    badge: 'alternative',
    intuition:
      "The idiomatic JS one-liner: `[...new Set(arr)]`. Construct a Set from the array (Set deduplicates by `===` equality), then spread it back into an array. Insertion order is preserved because Set guarantees iteration order matches insertion.\n\n" +
      "Two passes total: one to build the Set, one to spread it back. Identical asymptotic complexity to the manual approach but a fraction of the code. The downside: zero opportunity to do anything else during the dedup (counting frequencies, conditional inclusion, etc.) — those need the explicit loop.",
    complexity: { time: 'O(n)', space: 'O(n)', verdict: 'The one-liner — use in production' },
    pseudocode: [
      'return [...new Set(arr)]',
    ],
    example: { input: '[1, 2, 2, 3, 1, 4]', output: '[1, 2, 3, 4]' },
    steps: [
      { title: 'Build Set from [1, 2, 2, 3, 1, 4]. Duplicates ignored. Set: {1, 2, 3, 4}.', pseudoLine: 0,
        set: { items: [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }] } },
      { title: 'Spread to array: [1, 2, 3, 4]. Order preserved because Set iteration is insertion order.', pseudoLine: 0,
        array: { cells: [1,2,3,4].map(v => ({ value: v, highlight: 'found' as const })) },
        result: { found: true, value: '[1, 2, 3, 4]' } },
    ],
    tradeoffs: "Beautifully concise. Use unless you need to do something extra during dedup. NaN gotcha: `Set` treats two NaNs as equal (so they dedupe correctly), but `Array.prototype.indexOf` doesn't — that's why `arr.filter((x,i) => arr.indexOf(x) === i)` doesn't dedupe NaNs.",
  }],
};

// ====================================================================

const findMissingNumber: Explanation = {
  problem: 'Find Missing Number',
  problemStatement: 'Given an array of n distinct numbers from 0..n with one missing, find the missing number.',
  approaches: [{
    id: 'sum',
    name: 'Sum Formula',
    badge: 'best',
    intuition: 'The sum of 0..n is known: n·(n+1)/2. Subtract the actual sum from the expected sum — what is left is the missing number.',
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Canonical' },
    pseudocode: [
      'expected = n * (n + 1) / 2',
      'actual = sum(arr)',
      'return expected - actual',
    ],
    example: { input: '[3, 0, 1] (n=3)', output: '2' },
    steps: [
      { title: 'n=3 → expected = 3·4/2 = 6.', pseudoLine: 0,
        computation: { label: 'expected', lhs: '3·4', op: '/', rhs: '2', result: '6' } },
      { title: 'actual = 3 + 0 + 1 = 4.', pseudoLine: 1,
        array: { cells: [{ value: 3, highlight: 'i' }, { value: 0, highlight: 'i' }, { value: 1, highlight: 'i' }] },
        computation: { label: 'actual', result: '4' } },
      { title: 'missing = 6 − 4 = 2.', pseudoLine: 2,
        computation: { label: 'expected − actual', lhs: '6', op: '−', rhs: '4', result: '2' },
        result: { found: true, value: '2' } },
    ],
    tradeoffs: 'XOR variant (`xor of indices xor of values`) avoids potential overflow on huge n in fixed-width languages — irrelevant in JS bigint, but the canonical answer in C/C++ interviews. Set lookup is O(n) time + space, slower in practice.',
  },
  {
    id: 'xor',
    name: 'XOR Trick (Overflow-Safe)',
    badge: 'alternative',
    intuition:
      "**The key property:** XOR is its own inverse. `a ^ a === 0` and `a ^ 0 === a`. So if we XOR every index 0..n with every value in the array, every number that appears in BOTH sets cancels out, leaving only the missing one.\n\n" +
      "**Why this matters:** the sum approach can overflow in C/C++/Java for very large n (n=2³² overflows int). XOR has no such risk — it's a bitwise operation that works on each bit independently. In JS where numbers are 64-bit floats, sum is safe up to ~9 quadrillion so the overflow argument is academic, but XOR remains the canonical 'overflow-safe' answer in interviews.",
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Best for C/C++/Java; equivalent in JS' },
    pseudocode: [
      'result = 0',
      'for i from 0 to n:        // include n itself',
      '  result ^= i',
      'for x in arr:',
      '  result ^= x',
      'return result',
    ],
    example: { input: '[3, 0, 1] (n=3)', output: '2' },
    steps: [
      { title: 'XOR all indices 0..3: 0^1^2^3 = 0.', pseudoLine: 2,
        computation: { label: '0 ^ 1 ^ 2 ^ 3', result: '0' } },
      { title: 'XOR all array values: 0 ^ (3 ^ 0 ^ 1) = 0 ^ 2 = 2. The 0, 1, 3 from indices cancel with 0, 1, 3 in array; 2 has no twin.', pseudoLine: 4,
        computation: { label: '0 ^ 3 ^ 0 ^ 1', result: '2' },
        result: { found: true, value: '2' } },
    ],
    tradeoffs: 'Same complexity as the sum approach in JS. The key skill being tested is recognizing the XOR identity — interviewers often follow up with the related "find the duplicate" or "every-element-twice-except-one" problems where XOR shines.',
  }],
};

// ====================================================================

const moveZeros: Explanation = {
  problem: 'Move Zeros',
  problemStatement: 'Move all zeros to the end of an array, in place, preserving the relative order of non-zero elements.',
  approaches: [{
    id: 'write-pointer',
    name: 'Write Pointer (Two Pointer)',
    badge: 'best',
    intuition: 'Walk with a read pointer. Maintain a write pointer for the next non-zero slot. When a non-zero is read, copy to write and advance write. After the pass, fill the rest with zeros.',
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Canonical' },
    pseudocode: [
      'w = 0',
      'for r from 0 to n-1:',
      '  if arr[r] !== 0: arr[w++] = arr[r]',
      'while w < n: arr[w++] = 0',
    ],
    example: { input: '[0, 1, 0, 3, 12]', output: '[1, 3, 12, 0, 0]' },
    steps: [
      { title: 'r=0, arr[0]=0. Skip — write does not advance.', pseudoLine: 1,
        array: { cells: [{ value: 0, highlight: 'i' }, { value: 1 }, { value: 0 }, { value: 3 }, { value: 12 }],
          pointers: [{ index: 0, label: 'r/w', color: 'red' }] } },
      { title: 'r=1, arr[1]=1. Copy to w=0, w→1.', pseudoLine: 2,
        array: { cells: [{ value: 1, highlight: 'found' }, { value: 1, highlight: 'i' }, { value: 0 }, { value: 3 }, { value: 12 }],
          pointers: [{ index: 0, label: 'w', color: 'emerald' }, { index: 1, label: 'r', color: 'red' }] } },
      { title: 'r=3, arr[3]=3. Copy to w=1, w→2.', pseudoLine: 2,
        array: { cells: [{ value: 1 }, { value: 3, highlight: 'found' }, { value: 0 }, { value: 3, highlight: 'i' }, { value: 12 }],
          pointers: [{ index: 1, label: 'w', color: 'emerald' }, { index: 3, label: 'r', color: 'red' }] } },
      { title: 'r=4, arr[4]=12 → arr[2]=12, w→3. End of read pass.', pseudoLine: 2,
        array: { cells: [{ value: 1 }, { value: 3 }, { value: 12, highlight: 'found' }, { value: 3 }, { value: 12, highlight: 'i' }] } },
      { title: 'Fill positions 3..n-1 with zeros.', pseudoLine: 3,
        array: { cells: [{ value: 1 }, { value: 3 }, { value: 12 }, { value: 0, highlight: 'new' }, { value: 0, highlight: 'new' }] },
        result: { found: true, value: '[1, 3, 12, 0, 0]' } },
    ],
    tradeoffs: 'Single-pass swap variant `if (arr[r]) [arr[w], arr[r]] = [arr[r], arr[w]], w++` skips the second loop but does redundant swaps when w === r. The write-pointer + zero-fill is the cleanest pattern.',
  },
  {
    id: 'single-swap',
    name: 'Single-Pass Swap (One Loop)',
    badge: 'alternative',
    intuition:
      "Same two-pointer idea, one loop instead of two. As you scan with `r`, every time you see a non-zero, **swap** it with `arr[w]` and advance `w`. Zeros end up on the right naturally because non-zeros 'leapfrog' over them.\n\n" +
      "Why prefer the two-pass version? When `w === r` (no zeros encountered yet), the swap is a no-op but still costs the destructuring assignment. Two-pass is conceptually simpler. In practice both are O(n) and the difference is microseconds.",
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Slightly less code; same complexity' },
    pseudocode: [
      'w = 0',
      'for r from 0 to n-1:',
      '  if arr[r] !== 0:',
      '    [arr[w], arr[r]] = [arr[r], arr[w]]',
      '    w++',
    ],
    example: { input: '[0, 1, 0, 3, 12]', output: '[1, 3, 12, 0, 0]' },
    steps: [
      { title: 'r=0: 0. Skip — no swap.', pseudoLine: 2,
        array: { cells: [{ value: 0, highlight: 'i' }, { value: 1 }, { value: 0 }, { value: 3 }, { value: 12 }],
          pointers: [{ index: 0, label: 'r/w', color: 'red' }] } },
      { title: 'r=1: 1 ≠ 0. Swap arr[0]↔arr[1]. Array becomes [1, 0, 0, 3, 12]. w→1.', pseudoLine: 3,
        array: { cells: [{ value: 1, highlight: 'found' }, { value: 0 }, { value: 0 }, { value: 3 }, { value: 12 }],
          pointers: [{ index: 1, label: 'w', color: 'emerald' }] } },
      { title: 'r=3: 3 ≠ 0. Swap arr[1]↔arr[3]. Array [1, 3, 0, 0, 12]. w→2.', pseudoLine: 3,
        array: { cells: [{ value: 1 }, { value: 3, highlight: 'found' }, { value: 0 }, { value: 0 }, { value: 12 }] } },
      { title: 'r=4: 12 ≠ 0. Swap arr[2]↔arr[4]. Array [1, 3, 12, 0, 0]. Done.', pseudoLine: 3,
        array: { cells: [{ value: 1 }, { value: 3 }, { value: 12, highlight: 'found' }, { value: 0 }, { value: 0 }] },
        result: { found: true, value: '[1, 3, 12, 0, 0]' } },
    ],
    tradeoffs: 'Slightly more elegant. The two-pass version separates concerns (compact, then fill) which some readers find clearer.',
  }],
};

// ====================================================================

const rotateArray: Explanation = {
  problem: 'Rotate Array',
  problemStatement: 'Rotate an array right by k steps. `[1,2,3,4,5,6,7]`, k=3 → `[5,6,7,1,2,3,4]`.',
  approaches: [{
    id: 'reverse-3',
    name: 'Reverse Three Times',
    badge: 'best',
    intuition: 'Reverse the entire array, then reverse the first k, then reverse the rest. The clever observation: rotating right by k is the same as a sequence of three reversals — and reversal is in-place O(1) extra space.',
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Canonical, O(1) space' },
    pseudocode: [
      'k = k % n',
      'reverse(arr, 0, n-1)',
      'reverse(arr, 0, k-1)',
      'reverse(arr, k, n-1)',
    ],
    example: { input: '[1,2,3,4,5,6,7], k=3', output: '[5,6,7,1,2,3,4]' },
    steps: [
      { title: 'Original.', pseudoLine: 0,
        array: { cells: [1, 2, 3, 4, 5, 6, 7].map(v => ({ value: v })) } },
      { title: 'Reverse all → [7,6,5,4,3,2,1].', pseudoLine: 1,
        array: { cells: [7, 6, 5, 4, 3, 2, 1].map(v => ({ value: v, highlight: 'compare' as const })) } },
      { title: 'Reverse first k=3 → [5,6,7, 4,3,2,1].', pseudoLine: 2,
        array: { cells: [{ value: 5, highlight: 'found' }, { value: 6, highlight: 'found' }, { value: 7, highlight: 'found' }, { value: 4 }, { value: 3 }, { value: 2 }, { value: 1 }] } },
      { title: 'Reverse rest [3..n-1] → [5,6,7, 1,2,3,4].', pseudoLine: 3,
        array: { cells: [{ value: 5 }, { value: 6 }, { value: 7 }, { value: 1, highlight: 'found' }, { value: 2, highlight: 'found' }, { value: 3, highlight: 'found' }, { value: 4, highlight: 'found' }] },
        result: { found: true, value: '[5,6,7,1,2,3,4]' } },
    ],
    tradeoffs: 'Slice-and-concat (`arr.slice(-k).concat(arr.slice(0, -k))`) is O(n) extra space — fine for typical inputs. Cyclic-replacement is O(1) space too but needs gcd-cycle math to avoid double work. Reverse-3 is the cleanest interview answer.',
    usesPolyfills: [
      { builtin: 'Array.prototype.reverse', templateName: 'Array.reverse',
        why: 'each of the three reversals is a two-pointer in-place swap' },
      { builtin: 'Array.prototype.slice', templateName: 'Array.slice',
        why: 'the slice-and-concat alternative implementation' },
      { builtin: 'Array.prototype.concat', templateName: 'Array.concat',
        why: 'merges the two slices in the alternative implementation' },
    ],
  },
  {
    id: 'slice-concat',
    name: 'Slice + Concat (Allocates)',
    badge: 'alternative',
    intuition:
      "The simplest mental model: 'rotate right by k = take the last k elements and stick them in front'. Two slices, one concat. Easier to reason about than the three-reversal trick — it does the same thing visually as you'd describe to a colleague.\n\n" +
      "Trade-off: allocates a new array (O(n) extra space). Reverse-3 mutates in place. For most inputs neither difference matters; for interview purposes, lead with the in-place answer to demonstrate you can do it without extra allocation.",
    complexity: { time: 'O(n)', space: 'O(n)', verdict: 'Best for clarity; uses extra memory' },
    pseudocode: [
      'k = k % n           // normalize',
      'return arr.slice(-k).concat(arr.slice(0, -k))',
    ],
    example: { input: '[1,2,3,4,5,6,7], k=3', output: '[5,6,7,1,2,3,4]' },
    steps: [
      { title: 'arr.slice(-3) = [5,6,7] — last 3 elements.', pseudoLine: 1,
        array: { cells: [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5, highlight: 'found' }, { value: 6, highlight: 'found' }, { value: 7, highlight: 'found' }] } },
      { title: 'arr.slice(0, -3) = [1,2,3,4] — everything except last 3.', pseudoLine: 1,
        array: { cells: [{ value: 1, highlight: 'compare' }, { value: 2, highlight: 'compare' }, { value: 3, highlight: 'compare' }, { value: 4, highlight: 'compare' }, { value: 5 }, { value: 6 }, { value: 7 }] } },
      { title: 'concat → [5,6,7,1,2,3,4].', pseudoLine: 1,
        result: { found: true, value: '[5,6,7,1,2,3,4]' } },
    ],
    tradeoffs: 'Most readable. Use in production unless memory is tight or the array is huge. The trick of negative indices in slice is the key teaching moment — `slice(-k)` means "last k elements".',
  }],
};

// ====================================================================

const bubbleSort: Explanation = {
  problem: 'Bubble Sort',
  problemStatement: 'Sort an array by repeatedly swapping adjacent out-of-order pairs.',
  approaches: [{
    id: 'classic',
    name: 'Classic Bubble Sort with Early Exit',
    badge: 'baseline',
    intuition: 'Walk the array, swap any adjacent pair where left > right. After one pass, the largest element has "bubbled" to the end. Repeat for the remaining unsorted prefix. If a pass does no swaps, you are done.',
    complexity: { time: 'O(n²)', space: 'O(1)', verdict: 'Educational only' },
    pseudocode: [
      'for i from 0 to n-1:',
      '  swapped = false',
      '  for j from 0 to n-i-2:',
      '    if arr[j] > arr[j+1]: swap, swapped = true',
      '  if !swapped: break',
    ],
    example: { input: '[5, 1, 4, 2, 8]', output: '[1, 2, 4, 5, 8]' },
    steps: [
      { title: 'Pass 1 starts. Compare 5 vs 1 → swap.', pseudoLine: 3,
        array: { cells: [{ value: 5, highlight: 'i' }, { value: 1, highlight: 'j' }, { value: 4 }, { value: 2 }, { value: 8 }] } },
      { title: 'After swap: [1,5,4,2,8]. Compare 5 vs 4 → swap.', pseudoLine: 3,
        array: { cells: [{ value: 1 }, { value: 5, highlight: 'i' }, { value: 4, highlight: 'j' }, { value: 2 }, { value: 8 }] } },
      { title: '5 vs 2 → swap. [1,4,2,5,8]. 5 vs 8 → no swap. End of pass 1, 8 is sorted.', pseudoLine: 3,
        array: { cells: [{ value: 1 }, { value: 4 }, { value: 2 }, { value: 5 }, { value: 8, highlight: 'found' }] } },
      { title: 'Pass 2: 1<4 ok, 4>2 swap → [1,2,4,5]. Pass 3 finds no swaps → done.', pseudoLine: 5,
        array: { cells: [{ value: 1, highlight: 'found' }, { value: 2, highlight: 'found' }, { value: 4, highlight: 'found' }, { value: 5, highlight: 'found' }, { value: 8, highlight: 'found' }] },
        result: { found: true, value: '[1,2,4,5,8]' } },
    ],
    tradeoffs: 'Never use in production — quicksort/mergesort/Timsort are faster on every realistic input. The early-exit makes it O(n) on already-sorted arrays. Cocktail sort variant alternates direction and reduces passes on certain inputs.',
  },
  {
    id: 'cocktail',
    name: 'Cocktail Sort (Bidirectional)',
    badge: 'alternative',
    intuition:
      "A bubble-sort variant that alternates direction every pass. Forward pass bubbles the largest unsorted element to the end (like classic bubble sort). The next pass goes backward, bubbling the smallest to the front. Repeat until no swaps occur in either direction.\n\n" +
      "Why it sometimes wins: classic bubble sort has 'turtles' — small elements near the end of the array — that take O(n) passes to crawl forward, since each forward pass only moves them one step left. Cocktail sort fixes that: the backward pass moves them left in O(n) work per pass, so the algorithm completes in fewer passes on near-sorted arrays. The asymptotic complexity is still O(n²) worst case.",
    complexity: { time: 'O(n²)', space: 'O(1)', verdict: 'Slightly better on near-sorted; still educational only' },
    pseudocode: [
      'low = 0, high = n - 1, swapped = true',
      'while swapped:',
      '  swapped = false',
      '  for i from low to high-1:    // forward',
      '    if arr[i] > arr[i+1]: swap, swapped = true',
      '  high--',
      '  for i from high-1 down to low:  // backward',
      '    if arr[i] > arr[i+1]: swap, swapped = true',
      '  low++',
    ],
    example: { input: '[5, 1, 4, 2, 8]', output: '[1, 2, 4, 5, 8]' },
    steps: [
      { title: 'Forward pass: 5↔1, 5↔4, 5↔2 → [1,4,2,5,8]. 5 bubbles to position before 8.', pseudoLine: 4,
        array: { cells: [{ value: 1 }, { value: 4 }, { value: 2 }, { value: 5 }, { value: 8, highlight: 'found' }] } },
      { title: 'Backward pass: 4>2 swap → [1,2,4,5,8]. Smallest unsorted reached front.', pseudoLine: 7,
        array: { cells: [{ value: 1, highlight: 'found' }, { value: 2, highlight: 'found' }, { value: 4 }, { value: 5 }, { value: 8 }] } },
      { title: 'Next pass: no swaps in either direction → done.', pseudoLine: 1,
        result: { found: true, value: '[1,2,4,5,8]' } },
    ],
    tradeoffs: 'Slightly fewer passes on average than classic bubble sort. Still O(n²) — never the right answer when quicksort/mergesort are available. Useful as a teaching example for bidirectional thinking.',
  }],
};

// ====================================================================

const quickSort: Explanation = {
  problem: 'Quick Sort',
  problemStatement: 'Sort an array using divide-and-conquer with a pivot.',
  approaches: [{
    id: 'lomuto',
    name: 'Lomuto Partition (Last-Pivot)',
    badge: 'best',
    intuition: 'Pick a pivot. Partition: rearrange so everything ≤ pivot is left, > pivot is right. Recurse on each side. Average O(n log n); worst case O(n²) on already-sorted input with bad pivot.',
    complexity: { time: 'O(n log n) avg, O(n²) worst', space: 'O(log n) stack', verdict: 'Canonical for in-place sort' },
    pseudocode: [
      'function quickSort(arr, lo, hi):',
      '  if lo >= hi: return',
      '  pivot = arr[hi]; i = lo',
      '  for j from lo to hi-1:',
      '    if arr[j] <= pivot: swap arr[i++], arr[j]',
      '  swap arr[i], arr[hi] // place pivot',
      '  quickSort(arr, lo, i-1)',
      '  quickSort(arr, i+1, hi)',
    ],
    example: { input: '[3, 6, 1, 5, 2, 4]', output: '[1, 2, 3, 4, 5, 6]' },
    steps: [
      { title: 'Pick last element 4 as pivot.', pseudoLine: 2,
        array: { cells: [{ value: 3 }, { value: 6 }, { value: 1 }, { value: 5 }, { value: 2 }, { value: 4, highlight: 'compare' }] } },
      { title: 'Partition: scan, move ≤4 to the left. After: [3,1,2 | 5,6,4].', pseudoLine: 4,
        array: { cells: [{ value: 3, highlight: 'found' }, { value: 1, highlight: 'found' }, { value: 2, highlight: 'found' }, { value: 5 }, { value: 6 }, { value: 4, highlight: 'compare' }] } },
      { title: 'Place pivot in its final spot at index 3 → [3,1,2,4,6,5].', pseudoLine: 5,
        array: { cells: [{ value: 3 }, { value: 1 }, { value: 2 }, { value: 4, highlight: 'found' }, { value: 6 }, { value: 5 }] } },
      { title: 'Recurse left subarray [3,1,2] and right [6,5].', pseudoLine: 6,
        callStack: { frames: [{ call: 'quickSort([3,1,2,4,6,5], 0, 5)', status: 'returned' }, { call: 'quickSort([3,1,2], 0, 2)', status: 'active' }, { call: 'quickSort([6,5], 4, 5)', status: 'pending' }] } },
      { title: 'Both sides recurse to base case → fully sorted.', pseudoLine: 1,
        result: { found: true, value: '[1, 2, 3, 4, 5, 6]' } },
    ],
    tradeoffs: 'Random pivot avoids the O(n²) worst case on sorted inputs. Three-way partition (Dutch national flag) handles many duplicates better. Engine sort (`Array.prototype.sort`) is Timsort or Powersort — use it unless the interviewer asks you to roll your own.',
  },
  {
    id: 'three-way',
    name: 'Three-Way Partition (Duplicate-Heavy)',
    badge: 'alternative',
    intuition:
      "When inputs have many duplicates, Lomuto's partition wastes work — it puts all elements equal to the pivot in the right partition, which then needs another pass. Three-way partition (a.k.a. Dutch National Flag) splits into THREE regions: less-than-pivot, equal-to-pivot, greater-than-pivot. Recurse on the two outer regions only; the middle is already in its final place.\n\n" +
      "Walk with three pointers: `lt` (next slot for <pivot), `gt` (next slot for >pivot), `i` (current). For each `i`: if less, swap with `lt` and advance both. If greater, swap with `gt` and decrement `gt` (don't advance `i` — the swapped-in value is unread). If equal, just advance `i`. After the pass, the array is partitioned `[<pivot | =pivot | >pivot]` and we recurse only on the two outer regions.",
    complexity: { time: 'O(n log n) avg, O(n) when many duplicates', space: 'O(log n)', verdict: 'Best for duplicate-heavy inputs' },
    pseudocode: [
      'function quickSort3(arr, lo, hi):',
      '  if lo >= hi: return',
      '  pivot = arr[lo]; lt = lo; gt = hi; i = lo + 1',
      '  while i <= gt:',
      '    if arr[i] < pivot: swap(i++, lt++)',
      '    else if arr[i] > pivot: swap(i, gt--)',
      '    else: i++',
      '  quickSort3(arr, lo, lt - 1)',
      '  quickSort3(arr, gt + 1, hi)',
    ],
    example: { input: '[3, 5, 3, 1, 5, 3, 2]', output: '[1, 2, 3, 3, 3, 5, 5]' },
    steps: [
      { title: 'Pivot = 3 (first). After partition: [<3 | =3 | >3] = [1,2 | 3,3,3 | 5,5].', pseudoLine: 3,
        array: { cells: [{ value: 1, highlight: 'found' }, { value: 2, highlight: 'found' }, { value: 3, highlight: 'compare' }, { value: 3, highlight: 'compare' }, { value: 3, highlight: 'compare' }, { value: 5 }, { value: 5 }] } },
      { title: 'Three 3s already in their final positions. Recurse only on [1,2] and [5,5].', pseudoLine: 7,
        result: { found: true, value: '[1,2,3,3,3,5,5]' } },
    ],
    tradeoffs: 'Big win when the input has many duplicate keys. Adds complexity vs Lomuto. JS engine sort handles duplicates natively — only roll your own when the interviewer asks for in-place quicksort.',
  }],
};

// ====================================================================

const mergeSort: Explanation = {
  problem: 'Merge Sort',
  problemStatement: 'Sort by recursively splitting the array in half, sorting each half, then merging.',
  approaches: [{
    id: 'top-down',
    name: 'Top-Down Recursive',
    badge: 'best',
    intuition: 'Split the array in half, recursively sort each half, then merge them with a two-pointer linear merge. The recursion gives a tree of depth log n; each level does O(n) merging.',
    complexity: { time: 'O(n log n)', space: 'O(n)', verdict: 'Canonical, stable sort' },
    pseudocode: [
      'function mergeSort(arr):',
      '  if arr.length <= 1: return arr',
      '  mid = floor(arr.length / 2)',
      '  left = mergeSort(arr.slice(0, mid))',
      '  right = mergeSort(arr.slice(mid))',
      '  return merge(left, right)',
    ],
    example: { input: '[5, 2, 4, 1]', output: '[1, 2, 4, 5]' },
    steps: [
      { title: 'Top call: mergeSort([5,2,4,1]).', pseudoLine: 0,
        callStack: { frames: [{ call: 'mergeSort([5,2,4,1])', status: 'active' }] } },
      { title: 'Split → mergeSort([5,2]) and mergeSort([4,1]).', pseudoLine: 3,
        callStack: { frames: [{ call: 'mergeSort([5,2,4,1])', status: 'pending' }, { call: 'mergeSort([5,2])', status: 'active' }, { call: 'mergeSort([4,1])', status: 'pending' }] } },
      { title: '[5,2] splits to [5] and [2]; both base case. Merge → [2,5].', pseudoLine: 5,
        dualArray: { left: { label: '[5]', cells: [{ value: 5 }] }, right: { label: '[2]', cells: [{ value: 2 }] }, result: { label: 'merged', cells: [{ value: 2 }, { value: 5 }] } } },
      { title: '[4,1] merges to [1,4].', pseudoLine: 5,
        dualArray: { left: { label: '[4]', cells: [{ value: 4 }] }, right: { label: '[1]', cells: [{ value: 1 }] }, result: { label: 'merged', cells: [{ value: 1 }, { value: 4 }] } } },
      { title: 'Final merge of [2,5] and [1,4] → [1,2,4,5].', pseudoLine: 5,
        dualArray: { left: { label: '[2,5]', cells: [{ value: 2 }, { value: 5 }] }, right: { label: '[1,4]', cells: [{ value: 1 }, { value: 4 }] }, result: { label: 'merged', cells: [{ value: 1 }, { value: 2 }, { value: 4 }, { value: 5 }] } },
        result: { found: true, value: '[1, 2, 4, 5]' } },
    ],
    tradeoffs: 'Stable (preserves order of equal keys) — important for tagging-then-sorting. Bottom-up iterative version avoids recursion overhead for very deep arrays. JS engine sort is Timsort, which is mergesort-with-runs and is what mergesort would be in production.',
  },
  {
    id: 'bottom-up',
    name: 'Bottom-Up Iterative (No Recursion)',
    badge: 'alternative',
    intuition:
      "Same algorithm, no call stack. Instead of splitting top-down, **build up** by merging successively larger windows: first merge every adjacent pair (window=1), then every adjacent quadruple (window=2), then 8s, 16s, ... until the window size covers the whole array.\n\n" +
      "Why use it: avoids the O(log n) recursion stack. For very large arrays (say 100M elements) the recursive version's stack overhead is real. The iterative version is also slightly cache-friendlier because the merge work is tighter.",
    complexity: { time: 'O(n log n)', space: 'O(n)', verdict: 'When recursion depth or stack overhead matters' },
    pseudocode: [
      'for size = 1; size < n; size *= 2:',
      '  for left = 0; left < n - size; left += 2*size:',
      '    mid = left + size - 1',
      '    right = min(left + 2*size - 1, n - 1)',
      '    merge(arr, left, mid, right)',
    ],
    example: { input: '[5, 2, 4, 1]', output: '[1, 2, 4, 5]' },
    steps: [
      { title: 'size=1: merge pairs (5,2)→(2,5) and (4,1)→(1,4). Array: [2,5,1,4].', pseudoLine: 4,
        array: { cells: [{ value: 2, highlight: 'compare' }, { value: 5, highlight: 'compare' }, { value: 1, highlight: 'compare' }, { value: 4, highlight: 'compare' }] } },
      { title: 'size=2: merge ([2,5], [1,4]) → [1,2,4,5].', pseudoLine: 4,
        array: { cells: [{ value: 1, highlight: 'found' }, { value: 2, highlight: 'found' }, { value: 4, highlight: 'found' }, { value: 5, highlight: 'found' }] },
        result: { found: true, value: '[1,2,4,5]' } },
    ],
    tradeoffs: 'Same complexity, no recursion stack, slightly trickier indexing. Tim sort (used by V8) is bottom-up mergesort + run detection — already what JS gives you for free.',
  }],
};

// ====================================================================

const anagramCheck: Explanation = {
  problem: 'Anagram Check',
  problemStatement: 'Are two strings anagrams of each other (same letters, possibly reordered)?',
  approaches: [{
    id: 'frequency',
    name: 'Frequency Map',
    badge: 'best',
    intuition: 'Length must match. Count letters in one, decrement counts in the other. If any count goes non-zero at the end, not an anagram. Single-map variant is the cleanest.',
    complexity: { time: 'O(n)', space: 'O(k) where k is alphabet size', verdict: 'Canonical' },
    pseudocode: [
      'if a.length !== b.length: return false',
      'count = {}',
      'for ch in a: count[ch] = (count[ch] || 0) + 1',
      'for ch in b:',
      '  if !count[ch]: return false',
      '  count[ch]--',
      'return true',
    ],
    example: { input: '"listen", "silent"', output: 'true' },
    steps: [
      { title: 'Count letters of "listen".', pseudoLine: 2,
        map: { entries: [{ key: 'l', value: 1, highlight: 'new' }, { key: 'i', value: 1, highlight: 'new' }, { key: 's', value: 1, highlight: 'new' }, { key: 't', value: 1, highlight: 'new' }, { key: 'e', value: 1, highlight: 'new' }, { key: 'n', value: 1, highlight: 'new' }] } },
      { title: 'Decrement for each letter of "silent".', pseudoLine: 5,
        map: { entries: [{ key: 'l', value: 0 }, { key: 'i', value: 0 }, { key: 's', value: 0 }, { key: 't', value: 0 }, { key: 'e', value: 0 }, { key: 'n', value: 0 }] } },
      { title: 'All zero → anagram.', pseudoLine: 6,
        result: { found: true, value: 'true' } },
    ],
    tradeoffs: 'Sort-and-compare is O(n log n) but a one-liner: `[...a].sort().join("") === [...b].sort().join("")`. Char-code array (size 26) avoids hash-map overhead for ASCII-only inputs.',
    usesPolyfills: [
      { builtin: 'Array.prototype.sort', templateName: 'Array.sort',
        why: 'the sort-and-compare alternative leans on a stable sort' },
      { builtin: 'Array.prototype.join', templateName: 'Array.prototype.join',
        why: 'collapses the sorted letters into a comparable string' },
    ],
  },
  {
    id: 'sort-compare',
    name: 'Sort and Compare (One-Liner)',
    badge: 'alternative',
    intuition:
      "If two strings are anagrams, sorting their letters gives the same string. So compare the sorted forms directly: `[...a].sort().join('') === [...b].sort().join('')`. One line, easy to read.\n\n" +
      "Cost: O(k log k) for the sort vs O(k) for the frequency map. For short words (k < 100), the constant factors of the sort are tiny and this can win in practice. For long words, the frequency map wins.",
    complexity: { time: 'O(k log k)', space: 'O(k)', verdict: 'Most readable; slower for long inputs' },
    pseudocode: [
      'function isAnagram(a, b):',
      '  if a.length !== b.length: return false',
      '  return [...a].sort().join("") === [...b].sort().join("")',
    ],
    example: { input: '"listen", "silent"', output: 'true' },
    steps: [
      { title: '[..."listen"].sort() = ["e","i","l","n","s","t"]. join → "eilnst".', pseudoLine: 2,
        computation: { label: 'sort', lhs: '"listen"', op: '→', result: '"eilnst"' } },
      { title: '[..."silent"].sort() = ["e","i","l","n","s","t"]. join → "eilnst".', pseudoLine: 2,
        computation: { label: 'sort', lhs: '"silent"', op: '→', result: '"eilnst"' } },
      { title: 'Strings match → anagram.', pseudoLine: 2,
        result: { found: true, value: 'true' } },
    ],
    tradeoffs: "Use the one-liner in everyday code. For interviews, follow up the frequency-map answer with 'and the one-liner is sort-compare' to demonstrate breadth.",
  }],
};

// ====================================================================

const longestSubstring: Explanation = {
  problem: 'Longest Substring Without Repeating Characters',
  problemStatement: 'Return the length of the longest contiguous substring with all distinct characters.',
  approaches: [{
    id: 'sliding-window',
    name: 'Sliding Window with Set',
    badge: 'best',
    intuition: 'Two pointers form a window. Right expands while characters are new. When a duplicate is encountered, shrink the left until the duplicate is gone. Track max window size.',
    complexity: { time: 'O(n)', space: 'O(min(n, k))', verdict: 'Canonical' },
    pseudocode: [
      'set = new Set(), left = 0, best = 0',
      'for right from 0 to n-1:',
      '  while set.has(s[right]): set.delete(s[left++])',
      '  set.add(s[right])',
      '  best = max(best, right - left + 1)',
      'return best',
    ],
    example: { input: '"abcabcbb"', output: '3 ("abc")' },
    steps: [
      { title: 'right=0..2: a, b, c added. Window "abc", best=3.', pseudoLine: 3,
        set: { items: [{ value: 'a' }, { value: 'b' }, { value: 'c', highlight: 'new' }] } },
      { title: 'right=3, char a is in set. Shrink left: drop a. Window now "bc".', pseudoLine: 2,
        set: { items: [{ value: 'b' }, { value: 'c' }] } },
      { title: 'Add a → "bca". Continue. Each new dup forces a shrink, but window length never exceeds 3.', pseudoLine: 3,
        set: { items: [{ value: 'b' }, { value: 'c' }, { value: 'a', highlight: 'new' }] } },
      { title: 'Final answer best=3.', pseudoLine: 5,
        result: { found: true, value: '3' } },
    ],
    tradeoffs: 'Index-map variant `Map<char, lastIndex>` lets `left` jump in O(1) instead of advancing one-by-one — strictly faster on adversarial inputs but slightly more code.',
  },
  {
    id: 'index-map',
    name: 'Index-Map Sliding Window (Faster Shrink)',
    badge: 'alternative',
    intuition:
      "Same sliding window, smarter shrink. Instead of inching `left` forward one character at a time when a duplicate is found, store `Map<char, lastSeenIndex>` so we can **jump** `left` directly past the previous occurrence.\n\n" +
      "**Why it's faster:** the original approach is O(n) because each character enters the window once and leaves once — but the leaves can be slow when the window shrinks character-by-character. The map approach makes the shrink O(1) per duplicate, which matters on inputs like `\"abcdefghigj\"` where the duplicate is far back. In the worst case both are O(n), but the constants differ.",
    complexity: { time: 'O(n)', space: 'O(min(n, k))', verdict: 'Best on long inputs with infrequent duplicates' },
    pseudocode: [
      'lastSeen = new Map(), left = 0, best = 0',
      'for right from 0 to n-1:',
      '  if lastSeen.has(s[right]) and lastSeen.get(s[right]) >= left:',
      '    left = lastSeen.get(s[right]) + 1     // jump past the duplicate',
      '  lastSeen.set(s[right], right)',
      '  best = max(best, right - left + 1)',
      'return best',
    ],
    example: { input: '"abba"', output: '2 ("ab" or "ba")' },
    steps: [
      { title: 'right=0..1: a, b added. Window "ab" length 2.', pseudoLine: 4,
        map: { entries: [{ key: 'a', value: 0 }, { key: 'b', value: 1, highlight: 'new' }] } },
      { title: 'right=2: b is in map at index 1, ≥ left=0 → jump left to 2. Window "b".', pseudoLine: 3,
        map: { entries: [{ key: 'a', value: 0 }, { key: 'b', value: 1, highlight: 'hit' }] } },
      { title: 'Update b\'s index to 2. right=3: a is in map at index 0, but 0 < left=2 → no jump. Add a, best=2 ("ba").', pseudoLine: 4,
        result: { found: true, value: '2' } },
    ],
    tradeoffs: 'The `>= left` guard is the subtle part — without it, we would jump backward when the duplicate is already outside the window. Use this when input is long and duplicates are rare.',
  }],
};

// ====================================================================

const firstNonRepeating: Explanation = {
  problem: 'First Non-Repeating Character',
  problemStatement: 'Return the first character in a string that appears exactly once. If none, return null.',
  approaches: [{
    id: 'two-pass',
    name: 'Two-Pass Frequency Map',
    badge: 'best',
    intuition: 'First pass: count each character. Second pass: walk the original order; the first character with count 1 wins. Two passes preserves order without an ordered map.',
    complexity: { time: 'O(n)', space: 'O(k)', verdict: 'Canonical' },
    pseudocode: [
      'count = {}',
      'for ch in s: count[ch] = (count[ch] || 0) + 1',
      'for ch in s:',
      '  if count[ch] === 1: return ch',
      'return null',
    ],
    example: { input: '"leetcode"', output: '"l"' },
    steps: [
      { title: 'Pass 1: count letters of "leetcode".', pseudoLine: 1,
        map: { entries: [{ key: 'l', value: 1 }, { key: 'e', value: 3 }, { key: 't', value: 1 }, { key: 'c', value: 1 }, { key: 'o', value: 1 }, { key: 'd', value: 1 }] } },
      { title: 'Pass 2 ch=l, count=1 → return "l".', pseudoLine: 3,
        map: { entries: [{ key: 'l', value: 1, highlight: 'hit' }, { key: 'e', value: 3 }, { key: 't', value: 1 }, { key: 'c', value: 1 }, { key: 'o', value: 1 }, { key: 'd', value: 1 }] },
        result: { found: true, value: '"l"' } },
    ],
    tradeoffs: "One-pass variant uses an ordered map (or `Map` in JS, which preserves insertion order) and a 'first single' marker — same complexity, slightly trickier code.",
  },
  {
    id: 'one-pass-map',
    name: 'One-Pass Ordered Map',
    badge: 'alternative',
    intuition:
      "Use a `Map` instead of a plain object — `Map` preserves insertion order. As you walk the string, set each character's count. After the single pass, iterate the map in insertion order and return the first key whose count is 1.\n\n" +
      "Why this works in one pass over the string: the map's iteration order is INSERTION order, which matches the string order for first-seen characters. So 'first key with count 1 in iteration order' = 'first non-repeating character in the original string'.",
    complexity: { time: 'O(n)', space: 'O(k)', verdict: 'Slightly more elegant when single-pass matters' },
    pseudocode: [
      'count = new Map()',
      'for ch in s: count.set(ch, (count.get(ch) || 0) + 1)',
      'for [ch, n] of count:',
      '  if n === 1: return ch',
      'return null',
    ],
    example: { input: '"loveleetcode"', output: '"v"' },
    steps: [
      { title: 'Single pass: build Map. Insertion order: l, o, v, e, t, c, d.',
        detail: 'Each new character is added to the map in the order it first appears. Subsequent occurrences only increment the count without changing position.',
        pseudoLine: 1,
        map: { entries: [{ key: 'l', value: 2 }, { key: 'o', value: 2 }, { key: 'v', value: 1 }, { key: 'e', value: 4 }, { key: 't', value: 1 }, { key: 'c', value: 1 }, { key: 'd', value: 1 }] } },
      { title: 'Iterate map. l: count 2, skip. o: 2, skip. v: 1 — return "v".',
        pseudoLine: 3,
        map: { entries: [{ key: 'l', value: 2 }, { key: 'o', value: 2 }, { key: 'v', value: 1, highlight: 'hit' }] },
        result: { found: true, value: '"v"' } },
    ],
    tradeoffs: "Same complexity as two-pass; the iteration order trick depends on `Map` (NOT a plain object — object key order is not 100% guaranteed for non-integer keys across all engines, though in practice insertion order is preserved in modern JS).",
  }],
};

// ====================================================================

const sumCurry: Explanation = {
  problem: 'Sum Curry — sum(1)(2)(3)(...)',
  problemStatement: 'Build a function so `sum(1)(2)(3)()` returns 6. Each call adds, the empty call ends and returns the total.',
  approaches: [{
    id: 'closure',
    name: 'Closure Accumulator',
    badge: 'best',
    intuition: 'Each call returns a new function that closes over the running total. The empty call is the terminator: when no argument is passed, return the accumulated value.',
    complexity: { time: 'O(1) per call', space: 'O(n) chained closures', verdict: 'Canonical' },
    pseudocode: [
      'function sum(a):',
      '  return function inner(b):',
      '    if b === undefined: return a',
      '    return sum(a + b)',
    ],
    example: { input: 'sum(1)(2)(3)()', output: '6' },
    steps: [
      { title: 'sum(1) returns inner closure with a=1.', pseudoLine: 0,
        callStack: { frames: [{ call: 'sum(1) → inner', status: 'returned', returns: 'fn(a=1)' }] } },
      { title: 'inner(2): b=2 → return sum(1+2). New inner with a=3.', pseudoLine: 3,
        callStack: { frames: [{ call: 'inner(2)', status: 'returned', returns: 'fn(a=3)' }] } },
      { title: 'inner(3) similarly → new inner with a=6.', pseudoLine: 3,
        callStack: { frames: [{ call: 'inner(3)', status: 'returned', returns: 'fn(a=6)' }] } },
      { title: 'inner() with no arg → return a (=6).', pseudoLine: 2,
        callStack: { frames: [{ call: 'inner()', status: 'returned', returns: '6' }] },
        result: { found: true, value: '6' } },
    ],
    tradeoffs: 'A `valueOf` trick lets `sum(1)(2)(3) + 0` work without the empty terminator — clever but surprising. The undefined-check terminator is the most-asked variant.',
  },
  {
    id: 'valueof-trick',
    name: 'valueOf Coercion (No Terminator)',
    badge: 'alternative',
    intuition:
      "Avoid the empty `()` terminator by overriding the function's `valueOf`. JavaScript calls `valueOf` automatically when a function is used in a numeric or string context (`+ 0`, template literal, comparison). So `sum(1)(2)(3) + 0` triggers `valueOf` which returns the accumulated total.\n\n" +
      "**The trick:** functions are objects. You can attach properties to them, including `valueOf`. When the engine coerces the function to a primitive (which the `+` operator does), it calls `valueOf` first. So returning a function with a `valueOf` set to the running total gives you both the chainable behavior AND the primitive coercion.\n\n" +
      "Beautiful but surprising. Senior interviewers love it; junior reviewers may flag it as 'magic'. Use sparingly.",
    complexity: { time: 'O(1) per call', space: 'O(n) chained closures', verdict: 'Clever; surprising; use only if the team knows the pattern' },
    pseudocode: [
      'function sum(a):',
      '  function inner(b):',
      '    return sum(a + b)',
      '  inner.valueOf = () => a',
      '  return inner',
    ],
    example: { input: 'sum(1)(2)(3) + 0', output: '6' },
    steps: [
      { title: 'sum(1) returns inner with valueOf=() => 1.', pseudoLine: 4,
        callStack: { frames: [{ call: 'sum(1)', status: 'returned', returns: 'fn{valueOf:1}' }] } },
      { title: 'inner(2) calls sum(1+2) → returns inner with valueOf=() => 3.', pseudoLine: 2,
        callStack: { frames: [{ call: 'inner(2)', status: 'returned', returns: 'fn{valueOf:3}' }] } },
      { title: 'inner(3) similarly → fn with valueOf=() => 6.', pseudoLine: 2,
        callStack: { frames: [{ call: 'inner(3)', status: 'returned', returns: 'fn{valueOf:6}' }] } },
      { title: '`+ 0` triggers ToPrimitive → calls valueOf() → returns 6. Final: 0 + 6 = 6.',
        pseudoLine: 3,
        result: { found: true, value: '6' } },
    ],
    tradeoffs: "Implicit coercion is rare in modern JS code (we usually go explicit with `Number()`). This pattern works but feels like a parlor trick. The `()` terminator version is more conventional.",
  }],
};

// ====================================================================

const memoize: Explanation = {
  problem: 'Memoize',
  problemStatement: 'Wrap any pure function so repeated calls with the same arguments return cached results.',
  approaches: [{
    id: 'map-cache',
    name: 'Map<key, value> Cache',
    badge: 'best',
    intuition: 'Serialize args to a string key. On call, look up the cache; on hit, return immediately; on miss, run the function, store, return.',
    complexity: { time: 'O(1) per cached hit', space: 'O(unique-call-count)', verdict: 'Canonical' },
    pseudocode: [
      'function memoize(fn):',
      '  cache = new Map()',
      '  return (...args) =>',
      '    key = JSON.stringify(args)',
      '    if !cache.has(key): cache.set(key, fn(...args))',
      '    return cache.get(key)',
    ],
    example: { input: 'memo(slowSquare); memo(5); memo(5);', output: 'second call instant' },
    steps: [
      { title: 'First memo(5): key="[5]", cache miss. Run slowSquare(5)=25, store.', pseudoLine: 4,
        map: { entries: [{ key: '[5]', value: 25, highlight: 'new' }] },
        lookupOutcome: { kind: 'miss', key: '[5]' } },
      { title: 'Second memo(5): cache hit → return 25 instantly.', pseudoLine: 5,
        map: { entries: [{ key: '[5]', value: 25, highlight: 'hit' }] },
        lookupOutcome: { kind: 'hit', key: '[5]', at: 'cache' } },
      { title: 'memo(7): key="[7]", miss. Compute, store.', pseudoLine: 4,
        map: { entries: [{ key: '[5]', value: 25 }, { key: '[7]', value: 49, highlight: 'new' }] },
        result: { found: true, value: 'cache built' } },
    ],
    tradeoffs: '`JSON.stringify` keys break for unserializable args (functions, circular). `WeakMap` keyed by argument identity works for object args and lets entries get GCed. LRU-bounded cache prevents unbounded memory growth.',
  },
  {
    id: 'weakmap',
    name: 'WeakMap Cache (Object Args)',
    badge: 'alternative',
    intuition:
      "`JSON.stringify` for keys breaks the moment your args include unserializable values (functions, circular references, Maps, Sets, Symbols). Worse, two different objects with the same shape would hash to the same key — possibly correct for value-equality, possibly a bug.\n\n" +
      "When the function takes a single object argument, use a `WeakMap` keyed by the argument's identity. WeakMap holds the key as a weak reference, so when the original object is garbage-collected, the cache entry vanishes too — no memory leak. Pure objects, no JSON dance.",
    complexity: { time: 'O(1) per call', space: 'O(unique-objects)', verdict: 'Best for single-object args' },
    pseudocode: [
      'function memoize(fn):',
      '  cache = new WeakMap()',
      '  return (obj) =>',
      '    if (cache.has(obj)): return cache.get(obj)',
      '    result = fn(obj)',
      '    cache.set(obj, result)',
      '    return result',
    ],
    example: { input: 'memo(processUser); memo(alice); memo(alice);', output: 'second call hits cache' },
    steps: [
      { title: 'memo(alice): WeakMap miss → run processUser → store result keyed by alice (identity).',
        pseudoLine: 4,
        map: { entries: [{ key: 'alice', value: '{...}', highlight: 'new' }] } },
      { title: 'memo(alice): WeakMap hit (same object identity) → return cached result.',
        pseudoLine: 3,
        lookupOutcome: { kind: 'hit', key: 'alice', at: 'WeakMap' },
        result: { found: true, value: 'cached' } },
      { title: 'When `alice` becomes unreachable elsewhere, WeakMap entry GCs automatically.',
        pseudoLine: 1,
        note: 'WeakMap holds keys weakly — no cleanup code needed, no memory leak.' },
    ],
    tradeoffs: 'Only works when the cache key is an object (WeakMap requires object keys). For mixed args, layer a regular Map on top: `if (typeof arg === "object") use WeakMap else use Map`.',
  }],
};

// ====================================================================

const deepClone: Explanation = {
  problem: 'Deep Clone',
  problemStatement: 'Return a deep copy of an arbitrarily nested object/array. No shared references at any depth.',
  approaches: [{
    id: 'recursion',
    name: 'Recursion + WeakMap (Cycle-Safe)',
    badge: 'best',
    intuition: 'Recurse into every property. For arrays, build a new array; for objects, build a new object. A `WeakMap<original, clone>` short-circuits cycles and shared references so each source object is cloned once.',
    complexity: { time: 'O(n) total props', space: 'O(d) call stack + O(n) WeakMap', verdict: 'Canonical' },
    pseudocode: [
      'function clone(obj, seen = new WeakMap()):',
      '  if obj is primitive: return obj',
      '  if seen.has(obj): return seen.get(obj)',
      '  copy = Array.isArray(obj) ? [] : {}',
      '  seen.set(obj, copy)',
      '  for key in obj: copy[key] = clone(obj[key], seen)',
      '  return copy',
    ],
    example: { input: '{ a: 1, b: { c: [2, 3] } }', output: 'deep-equal copy with no shared refs' },
    steps: [
      { title: 'Top call: clone({a:1, b:{c:[2,3]}}).', pseudoLine: 0,
        callStack: { frames: [{ call: 'clone({a, b})', status: 'active' }] } },
      { title: 'a=1 is primitive → 1. b is an object → recurse.', pseudoLine: 5,
        callStack: { frames: [{ call: 'clone({a, b})', status: 'pending' }, { call: 'clone({c})', status: 'active' }] } },
      { title: 'c is an array → recurse. Each element primitive.', pseudoLine: 5,
        callStack: { frames: [{ call: 'clone({a, b})', status: 'pending' }, { call: 'clone({c})', status: 'pending' }, { call: 'clone([2,3])', status: 'active' }] } },
      { title: 'Bubble back up. Final structure cloned with WeakMap protecting against cycles.', pseudoLine: 6,
        callStack: { frames: [{ call: 'clone({a, b})', status: 'returned', returns: 'deep-copy' }] },
        result: { found: true, value: 'cloned object' } },
    ],
    tradeoffs: '`structuredClone(obj)` (built into modern JS) is the right answer in production — handles cycles, Maps, Sets, Dates, typed arrays. JSON round-trip is fast for plain JSON-able data but drops functions/Dates and chokes on cycles.',
    usesPolyfills: [
      { builtin: 'JSON.stringify', templateName: 'JSON.stringify',
        why: 'the JSON-round-trip alternative serializes the input' },
      { builtin: 'JSON.parse', templateName: 'JSON.parse',
        why: 'pairs with stringify to rebuild the object from text' },
    ],
  },
  {
    id: 'json-roundtrip',
    name: 'JSON Round-Trip (Quick & Lossy)',
    badge: 'baseline',
    intuition:
      "The two-line classic: `JSON.parse(JSON.stringify(obj))`. Serialize the object to a string, then parse it back. Strings are immutable so the parse builds an entirely new graph — no shared references with the original.\n\n" +
      "**What it loses:** `Date` becomes a string (and `parse` doesn't know to revive it). `undefined` is dropped from objects (set to nothing) and turned to `null` in arrays. Functions are dropped silently. `RegExp` becomes `{}`. Circular references throw `TypeError: Converting circular structure to JSON`. `Map`, `Set`, `Symbol` keys all get lost.\n\n" +
      "**When it's still fine:** plain JSON-shaped data (numbers, strings, booleans, null, arrays of those, plain objects of those). Configuration objects, API request bodies, etc. For anything richer use `structuredClone` (browser/Node native, ~2022+).",
    complexity: { time: 'O(n) where n = total chars in serialized form', space: 'O(n)', verdict: 'Quick & dirty for plain data' },
    pseudocode: [
      'return JSON.parse(JSON.stringify(obj))',
    ],
    example: { input: '{ a: 1, b: { c: [2, 3] } }', output: 'deep copy with no shared refs' },
    steps: [
      { title: 'stringify({a:1, b:{c:[2,3]}}) → \'{"a":1,"b":{"c":[2,3]}}\'.', pseudoLine: 0,
        computation: { label: 'stringify', op: '→', result: '"{...}" (string)' } },
      { title: 'parse the string → fresh object {a:1, b:{c:[2,3]}}, no shared refs.', pseudoLine: 0,
        result: { found: true, value: 'cloned' } },
      { title: 'Test: original.b.c === clone.b.c is FALSE (different array instances).',
        note: 'That is the whole point — independent reference graphs.' },
    ],
    tradeoffs: 'Two lines. Use only when the data is JSON-safe. Throws on cycles. The full recursion+WeakMap version handles edge cases; structuredClone is the modern best answer.',
    usesPolyfills: [
      { builtin: 'JSON.stringify', templateName: 'JSON.stringify',
        why: 'serialize the input object to a string' },
      { builtin: 'JSON.parse', templateName: 'JSON.parse',
        why: 'parse the string back into a fresh object graph' },
    ],
  }],
};

// ====================================================================

const throttle: Explanation = {
  problem: 'Throttle',
  problemStatement: 'Wrap a function so it runs at most once every `wait` ms. Bursty calls collapse to a steady stream.',
  approaches: [{
    id: 'timestamp',
    name: 'Timestamp-Based',
    badge: 'best',
    intuition: 'Remember when the function last ran. On each call, fire only if `wait` ms have passed since the last fire. Drops everything in between.',
    complexity: { time: 'O(1) per call', space: 'O(1)', verdict: 'Canonical leading-edge throttle' },
    pseudocode: [
      'function throttle(fn, wait):',
      '  last = 0',
      '  return (...args) =>',
      '    now = Date.now()',
      '    if now - last >= wait:',
      '      last = now; fn(...args)',
    ],
    example: { input: 'throttle(fn, 200); calls at t=0,50,150,300', output: 'fires at t=0, t=300' },
    steps: [
      { title: 't=0: first call. last=0, now=0, diff=0 ≥ 200? No initially we set last=now and fire.', pseudoLine: 4,
        timeline: { events: [{ t: 0, label: 'fire', kind: 'fire' }], windowMs: 200 } },
      { title: 't=50: now-last = 50 < 200 → skip.', pseudoLine: 4,
        timeline: { events: [{ t: 0, label: 'fire', kind: 'fire' }, { t: 50, label: 'skip', kind: 'skip' }], windowMs: 200 } },
      { title: 't=150: 150 < 200 → skip.', pseudoLine: 4,
        timeline: { events: [{ t: 0, label: 'fire', kind: 'fire' }, { t: 50, label: 'skip', kind: 'skip' }, { t: 150, label: 'skip', kind: 'skip' }], windowMs: 200 } },
      { title: 't=300: 300 ≥ 200 → fire. last=300.', pseudoLine: 5,
        timeline: { events: [{ t: 0, label: 'fire', kind: 'fire' }, { t: 150, label: 'skip', kind: 'skip' }, { t: 300, label: 'fire', kind: 'fire' }], windowMs: 200 },
        result: { found: true, value: 'fires at t=0 and t=300' } },
    ],
    tradeoffs: 'Trailing throttle (fire AFTER the wait window with the last args) is friendlier for "scroll position" — you do not lose the final position. Both-edges variant fires on first AND last call. Pick by use case: animations want trailing; rate-limiting wants leading.',
  },
  {
    id: 'trailing',
    name: 'Trailing-Edge Throttle (Catches Final Args)',
    badge: 'alternative',
    intuition:
      "The leading-edge version drops everything in the wait window — including the most recent call. For 'track scroll position' or 'autosave on type', you actually want the LAST args, not the first, because the user's final position/state is what matters.\n\n" +
      "Implementation: on each call, store the latest args. If no timer is pending, schedule one for `wait` ms; the timer's job is to fire `fn(latestArgs)` and clear itself. Subsequent calls during the window just update `latestArgs` without re-scheduling.",
    complexity: { time: 'O(1) per call', space: 'O(1)', verdict: 'For scroll/autosave/animation' },
    pseudocode: [
      'function throttleTrailing(fn, wait):',
      '  let timer = null, latestArgs',
      '  return (...args) =>',
      '    latestArgs = args',
      '    if (timer === null):',
      '      timer = setTimeout(() => { fn(...latestArgs); timer = null }, wait)',
    ],
    example: { input: 'calls at t=0,50,150,300', output: 'fires at t=200 with args from t=150 (latest)' },
    steps: [
      { title: 't=0: first call. timer null → schedule fire at t=200 with args from t=0.', pseudoLine: 5,
        timeline: { events: [{ t: 0, label: 'call', kind: 'input' }, { t: 200, label: 'pending', kind: 'pending' }], windowMs: 200 } },
      { title: 't=50, t=150: update latestArgs to most recent. Timer still pending.', pseudoLine: 3,
        timeline: { events: [{ t: 0, label: 'call', kind: 'input' }, { t: 50, label: 'update', kind: 'input' }, { t: 150, label: 'update', kind: 'input' }, { t: 200, label: 'pending', kind: 'pending' }], windowMs: 200 } },
      { title: 't=200: timer fires fn(latestArgs from t=150). Reset timer to null.', pseudoLine: 5,
        timeline: { events: [{ t: 0, label: 'call', kind: 'input' }, { t: 150, label: 'final', kind: 'input' }, { t: 200, label: 'fire', kind: 'fire' }], windowMs: 200 },
        result: { found: true, value: 'fires once with latest args' } },
    ],
    tradeoffs: 'Trailing for scroll/autosave/animation. Leading for rate limits where the first signal matters. Both-edges (`{ leading: true, trailing: true }`) is what lodash defaults to — fires twice per burst, once on the leading edge and once with the latest args at the trailing edge.',
  }],
};

// ====================================================================

const eventEmitter: Explanation = {
  problem: 'EventEmitter',
  problemStatement: 'Implement on, off, and emit. on(event, fn) registers; off removes; emit(event, ...args) fires every registered handler in order.',
  approaches: [{
    id: 'map-set',
    name: 'Map<event, Set<fn>>',
    badge: 'best',
    intuition: 'A map from event name to a set of handlers. Set automatically dedupes if the same handler is registered twice. emit walks the set and calls each.',
    complexity: { time: 'O(1) on/off, O(n) emit', space: 'O(handlers)', verdict: 'Canonical' },
    pseudocode: [
      'class EventEmitter:',
      '  events = new Map()',
      '  on(name, fn): get-or-create set, add fn',
      '  off(name, fn): set.delete(fn)',
      '  emit(name, ...args): for fn in set: fn(...args)',
    ],
    example: { input: 'on("greet", a); on("greet", b); emit("greet", "hi")', output: 'a("hi"), b("hi")' },
    steps: [
      { title: 'Empty emitter.', pseudoLine: 1, map: { entries: [] } },
      { title: 'on("greet", a) → events.greet = Set{a}.', pseudoLine: 2,
        map: { entries: [{ key: 'greet', value: '{a}', highlight: 'new' }] } },
      { title: 'on("greet", b) → Set{a, b}.', pseudoLine: 2,
        map: { entries: [{ key: 'greet', value: '{a, b}', highlight: 'hit' }] } },
      { title: 'emit("greet", "hi") → call a("hi"), then b("hi").', pseudoLine: 4,
        map: { entries: [{ key: 'greet', value: '{a, b}' }] },
        note: 'Order is insertion order. Set guarantees no duplicate handlers.',
        result: { found: true, value: 'fired 2 handlers' } },
    ],
    tradeoffs: 'Array variant `Map<event, Array<fn>>` allows duplicates and preserves order more obviously, but `off` becomes O(n). Once-handlers wrap the original to remove itself after firing — common extension.',
  },
  {
    id: 'array',
    name: 'Map<event, Array<fn>> (Order-Visible)',
    badge: 'alternative',
    intuition:
      "Use `Map<event, fn[]>` instead of `Map<event, Set<fn>>`. Two trade-offs: (1) duplicates are allowed (the same handler can register twice and fire twice — sometimes desired, sometimes a bug), and (2) `off` must scan the array to find and remove (O(n) instead of Set's O(1)).\n\n" +
      "Why some prefer it: ordering is unambiguous (insertion order in arrays is bullet-proof), and arrays are easier to reason about than Sets for engineers less familiar with the latter. Node's built-in `EventEmitter` uses arrays.",
    complexity: { time: 'O(1) on, O(n) off, O(n) emit', space: 'O(handlers)', verdict: 'When duplicates allowed or to mirror Node EventEmitter' },
    pseudocode: [
      'class EventEmitter:',
      '  events = new Map()',
      '  on(name, fn): get-or-create array, push fn',
      '  off(name, fn): array.indexOf(fn) → splice',
      '  emit(name, ...args): for fn of array: fn(...args)',
    ],
    example: { input: 'on("greet", a); on("greet", a); emit("greet", "hi")', output: 'a("hi") fires TWICE' },
    steps: [
      { title: 'on("greet", a) twice → array [a, a]. Set version would have just {a}.',
        pseudoLine: 2,
        map: { entries: [{ key: 'greet', value: '[a, a]', highlight: 'new' }] },
        note: 'Set dedups; array does not. Choose based on whether double-registration should fire double.' },
      { title: 'emit fires every entry → a("hi") runs twice.',
        pseudoLine: 4,
        result: { found: true, value: '2 firings' } },
    ],
    tradeoffs: 'Mirror Node\'s native `EventEmitter` (which uses arrays). For dedup-by-default behavior, use Set. For "register once, fire once even if registered twice" semantics, Set wins.',
  }],
};

// ====================================================================

const lruCache: Explanation = {
  problem: 'LRU Cache',
  problemStatement: 'Cache with capacity N. get and put are O(1). When full, evict the least-recently-used entry.',
  approaches: [{
    id: 'map-trick',
    name: 'Map Insertion-Order Trick',
    badge: 'best',
    intuition: 'JavaScript Map preserves insertion order. On get/put, delete-then-set the key — that bumps it to the most-recent position. The first key in the map is always the LRU; on overflow, take Map.keys().next().value and delete it.',
    complexity: { time: 'O(1) get/put', space: 'O(N)', verdict: 'Canonical for JS' },
    pseudocode: [
      'class LRUCache(capacity):',
      '  cache = new Map()',
      '  get(k): if has, delete & re-set; return value',
      '  put(k, v): if has, delete; set; if size > cap, delete first key',
    ],
    example: { input: 'cap=2; put(1,A); put(2,B); get(1); put(3,C)', output: 'evicts 2 (LRU)' },
    steps: [
      { title: 'put(1, A). Cache: { 1→A }.', pseudoLine: 3,
        map: { entries: [{ key: 1, value: 'A', highlight: 'new' }] } },
      { title: 'put(2, B). Cache: { 1→A, 2→B }. Order: 1 is oldest.', pseudoLine: 3,
        map: { entries: [{ key: 1, value: 'A' }, { key: 2, value: 'B', highlight: 'new' }] } },
      { title: 'get(1). Bump 1 to most-recent. Cache: { 2→B, 1→A }.', pseudoLine: 2,
        map: { entries: [{ key: 2, value: 'B' }, { key: 1, value: 'A', highlight: 'hit' }] } },
      { title: 'put(3, C). Size > cap → evict first key (2).', pseudoLine: 3,
        map: { entries: [{ key: 1, value: 'A' }, { key: 3, value: 'C', highlight: 'new' }] },
        note: 'Key 2 was the LRU — bumped to oldest by the get(1) above.',
        result: { found: true, value: 'evicted 2' } },
    ],
    tradeoffs: 'Textbook implementation is doubly-linked-list + hash map: HashMap<key, Node>, DLL maintains LRU order. More code, language-agnostic. The Map trick is JS-specific but every bit as O(1) and a quarter of the lines.',
  },
  {
    id: 'dll-map',
    name: 'Doubly-Linked-List + Hash Map (Textbook)',
    badge: 'alternative',
    intuition:
      "The language-agnostic textbook answer. Two data structures cooperate:\n\n" +
      "• **Hash map** `Map<key, Node>` for O(1) key→node lookup.\n" +
      "• **Doubly-linked list** of (key, value) nodes, **head = most-recent, tail = least-recent**.\n\n" +
      "On `get(k)`: hash lookup the node; if found, move it to the head of the DLL (O(1) with prev/next pointers); return its value.\n" +
      "On `put(k, v)`: if key exists, update and move to head. If new, create a node, insert at head, set hash entry. If size now exceeds capacity, remove the tail node and delete its key from the map.\n\n" +
      "Every operation is O(1) and the LRU ordering is maintained explicitly. The Map insertion-order trick is JS-specific; this is what you'd write in Java or C++.",
    complexity: { time: 'O(1) get/put', space: 'O(N)', verdict: 'Universal — works in any language' },
    pseudocode: [
      'class Node { key, value, prev, next }',
      'head ↔ ... ↔ tail (DLL)',
      'map: Map<key, Node>',
      'get(k): if !map.has(k) return -1',
      '  node = map.get(k); moveToHead(node); return node.value',
      'put(k, v): if has → update + moveToHead',
      '  else: addToHead(new Node); if size > cap: removeTail',
    ],
    example: { input: 'cap=2; put(1,A); put(2,B); get(1); put(3,C)', output: 'evicts 2 (the tail)' },
    steps: [
      { title: 'put(1, A): create Node(1,A), insert at head. DLL: head ↔ Node(1,A) ↔ tail.',
        pseudoLine: 5,
        linkedList: { nodes: [{ value: '1:A', label: 'head/tail', highlight: 'new' }], tail: 'tail' } },
      { title: 'put(2, B): insert at head. DLL: head ↔ Node(2,B) ↔ Node(1,A) ↔ tail.',
        pseudoLine: 5,
        linkedList: { nodes: [{ value: '2:B', label: 'head', highlight: 'new' }, { value: '1:A', label: 'tail' }], tail: 'tail' } },
      { title: 'get(1): hash hit. Move Node(1,A) to head. DLL now: head ↔ 1:A ↔ 2:B ↔ tail.',
        pseudoLine: 4,
        linkedList: { nodes: [{ value: '1:A', label: 'head', highlight: 'hit' }, { value: '2:B', label: 'tail' }], tail: 'tail' } },
      { title: 'put(3, C): insert at head, size > cap → remove tail (Node(2,B)).',
        pseudoLine: 7,
        linkedList: { nodes: [{ value: '3:C', label: 'head', highlight: 'new' }, { value: '1:A', label: 'tail' }], tail: 'tail' },
        result: { found: true, value: 'evicted 2' } },
    ],
    tradeoffs: '~3x more code than the Map-trick version. Use when targeting languages without ordered hash maps, or when interviewers explicitly ask for the textbook DLL approach.',
  }],
};

// ====================================================================

const composePipe: Explanation = {
  problem: 'Compose & Pipe',
  problemStatement: 'compose(f, g, h)(x) = f(g(h(x))). pipe is the same in left-to-right order.',
  approaches: [{
    id: 'reduce',
    name: 'Reduce-Based',
    badge: 'best',
    intuition: 'compose folds right; pipe folds left. Each fold step wraps the accumulator: `(acc, fn) => x => fn(acc(x))` for pipe, swap for compose.',
    complexity: { time: 'O(n) functions', space: 'O(n)', verdict: 'Canonical' },
    pseudocode: [
      'pipe = (...fns) => x => fns.reduce((v, fn) => fn(v), x)',
      'compose = (...fns) => x => fns.reduceRight((v, fn) => fn(v), x)',
    ],
    example: { input: 'pipe(double, addOne, square)(3) = ((3*2)+1)² = 49', output: '49' },
    steps: [
      { title: 'Start: x=3.', pseudoLine: 0,
        callStack: { frames: [{ call: 'pipe(double, addOne, square)(3)', status: 'active' }] } },
      { title: 'Reduce step 1: double(3) = 6.', pseudoLine: 0,
        callStack: { frames: [{ call: 'double(3)', status: 'returned', returns: '6' }] } },
      { title: 'Reduce step 2: addOne(6) = 7.', pseudoLine: 0,
        callStack: { frames: [{ call: 'addOne(6)', status: 'returned', returns: '7' }] } },
      { title: 'Reduce step 3: square(7) = 49.', pseudoLine: 0,
        callStack: { frames: [{ call: 'square(7)', status: 'returned', returns: '49' }] },
        result: { found: true, value: '49' } },
    ],
    tradeoffs: 'Async pipe (returning a function that awaits each step) is the same shape — wrap reduce with await. RxJS, Ramda, lodash/fp all use the same algebra under the hood.',
    usesPolyfills: [
      { builtin: 'Array.prototype.reduce', templateName: 'Array.reduce',
        why: 'pipe folds left-to-right, applying each fn to the running value' },
    ],
  },
  {
    id: 'async-pipe',
    name: 'Async Pipe (Awaits Each Step)',
    badge: 'alternative',
    intuition:
      "Real-world pipes often need to handle async functions: `pipe(fetchUser, validateData, saveToDb)`. Each step might return a Promise. Wrapping `reduce` with `await` makes the pipe await each step before passing the result to the next.\n\n" +
      "**The key change:** the reducer becomes `async (acc, fn) => fn(await acc)`. Every step both awaits the previous result and produces a new (possibly Promise-wrapped) value. JavaScript handles the auto-await/auto-wrap because `async` functions always return Promises.",
    complexity: { time: 'O(n) functions × cost of each', space: 'O(n) for the reduce chain', verdict: 'For pipelines with async steps' },
    pseudocode: [
      'pipeAsync = (...fns) => async (x) =>',
      '  fns.reduce(async (acc, fn) => fn(await acc), Promise.resolve(x))',
    ],
    example: { input: 'pipeAsync(fetchUser, validate, save)(123)', output: 'Promise → final saved record' },
    steps: [
      { title: 'Reduce starts with Promise.resolve(123).', pseudoLine: 1,
        callStack: { frames: [{ call: 'pipeAsync(fetchUser, validate, save)(123)', status: 'active' }] } },
      { title: 'Step 1: await initial → 123. Call fetchUser(123) → Promise<user>.',
        pseudoLine: 1,
        callStack: { frames: [{ call: 'fetchUser(123)', status: 'active', returns: 'Promise<user>' }] } },
      { title: 'Step 2: await user → call validate(user) → Promise<validated>.',
        pseudoLine: 1,
        callStack: { frames: [{ call: 'validate(user)', status: 'active', returns: 'Promise<validated>' }] } },
      { title: 'Step 3: await validated → call save → final result.',
        pseudoLine: 1,
        callStack: { frames: [{ call: 'save(validated)', status: 'returned', returns: 'Promise<saved>' }] },
        result: { found: true, value: 'Promise<saved record>' } },
    ],
    tradeoffs: 'Async pipe handles both sync and async functions transparently — sync return values get auto-wrapped in `Promise.resolve` thanks to `async`. Trade-off: every step now returns a Promise (extra microtask). For purely-sync pipelines, the regular pipe is faster.',
  }],
};

// ====================================================================

const binarySearch: Explanation = {
  problem: 'Binary Search',
  problemStatement: 'Find the index of target in a sorted array, or -1 if absent. Run in O(log n).',
  approaches: [{
    id: 'iterative',
    name: 'Iterative Two-Pointer',
    badge: 'best',
    intuition: 'Maintain low/high bounds. Each step, look at mid = (low+high)/2. If arr[mid] is target, done. If less, target is in the right half; otherwise the left half. Halve the search range every iteration → log₂(n) steps.',
    complexity: { time: 'O(log n)', space: 'O(1)', verdict: 'Canonical' },
    pseudocode: [
      'low = 0, high = n - 1',
      'while low <= high:',
      '  mid = floor((low + high) / 2)',
      '  if arr[mid] === target: return mid',
      '  if arr[mid] < target: low = mid + 1',
      '  else: high = mid - 1',
      'return -1',
    ],
    example: { input: '[1,3,5,7,9,11], target=7', output: '3' },
    steps: [
      { title: 'low=0, high=5, mid=2 → arr[2]=5.', pseudoLine: 2,
        array: { cells: [{ value: 1 }, { value: 3 }, { value: 5, highlight: 'i' }, { value: 7 }, { value: 9 }, { value: 11 }],
          pointers: [{ index: 0, label: 'lo', color: 'red' }, { index: 2, label: 'mid', color: 'indigo' }, { index: 5, label: 'hi', color: 'amber' }] },
        computation: { label: 'arr[mid] vs target', lhs: '5', op: '<', rhs: '7', result: 'go right' } },
      { title: 'low=3, high=5, mid=4 → arr[4]=9.', pseudoLine: 2,
        array: { cells: [{ value: 1 }, { value: 3 }, { value: 5 }, { value: 7 }, { value: 9, highlight: 'i' }, { value: 11 }],
          pointers: [{ index: 3, label: 'lo', color: 'red' }, { index: 4, label: 'mid', color: 'indigo' }, { index: 5, label: 'hi', color: 'amber' }] },
        computation: { label: 'arr[mid] vs target', lhs: '9', op: '>', rhs: '7', result: 'go left' } },
      { title: 'low=3, high=3, mid=3 → arr[3]=7. Match!', pseudoLine: 3,
        array: { cells: [{ value: 1 }, { value: 3 }, { value: 5 }, { value: 7, highlight: 'found' }, { value: 9 }, { value: 11 }],
          pointers: [{ index: 3, label: 'lo=mid=hi', color: 'emerald' }] },
        result: { found: true, value: '3' } },
    ],
    tradeoffs: 'Off-by-one is the classic bug: write the loop condition as `low <= high` (inclusive) and update with `mid + 1` / `mid - 1`. Use `mid = low + Math.floor((high - low) / 2)` to avoid integer overflow in non-JS languages.',
  },
  {
    id: 'recursive',
    name: 'Recursive Binary Search',
    badge: 'alternative',
    intuition:
      "Same algorithm, expressed recursively. Pass `low` and `high` as arguments, recurse into the half that could contain the target.\n\n" +
      "**Why some interviewers ask for it:** to test whether you can convert iteration into recursion (and to see if you understand tail-call optimization, which JavaScript famously **does not** implement consistently — meaning you can stack-overflow on large arrays). The iterative version is strictly safer.",
    complexity: { time: 'O(log n)', space: 'O(log n) call stack', verdict: 'Cleaner code; risk of stack overflow on huge arrays' },
    pseudocode: [
      'function search(arr, target, low = 0, high = arr.length - 1):',
      '  if low > high: return -1',
      '  mid = (low + high) >> 1',
      '  if arr[mid] === target: return mid',
      '  if arr[mid] < target: return search(arr, target, mid + 1, high)',
      '  return search(arr, target, low, mid - 1)',
    ],
    example: { input: '[1,3,5,7,9,11], target=7', output: '3' },
    steps: [
      { title: 'search(low=0, high=5). mid=2, arr[2]=5 < 7 → recurse(3, 5).', pseudoLine: 4,
        callStack: { frames: [{ call: 'search(0,5) mid=5', status: 'pending' }, { call: 'search(3,5)', status: 'active' }] } },
      { title: 'search(3, 5). mid=4, arr[4]=9 > 7 → recurse(3, 3).', pseudoLine: 5,
        callStack: { frames: [{ call: 'search(3,5)', status: 'pending' }, { call: 'search(3,3)', status: 'active' }] } },
      { title: 'search(3, 3). mid=3, arr[3]=7 — match! Return 3 up the call stack.', pseudoLine: 3,
        callStack: { frames: [{ call: 'search(3,3)', status: 'returned', returns: '3' }] },
        result: { found: true, value: '3' } },
    ],
    tradeoffs: 'Iterative is preferred unless the interviewer explicitly asks for recursion. JS engines do not reliably eliminate tail calls, so deep recursion blows the stack — for n=10⁹, log₂(n) ≈ 30 frames is fine, but most interview engines reject recursion on principle.',
  }],
};

// ====================================================================

const romanToInteger: Explanation = {
  problem: 'Roman to Integer',
  problemStatement: 'Convert a Roman numeral string to an integer. Handle subtractive cases (IV=4, IX=9, etc.) by checking if the next symbol is larger.',
  approaches: [{
    id: 'peek-next',
    name: 'Peek Next, Subtract on Mismatch',
    badge: 'best',
    intuition: 'Walk left to right. Add the current value, but if the next value is larger, subtract twice (because we already added once). One pass, O(n).',
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Canonical' },
    pseudocode: [
      'val = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 }',
      'total = 0',
      'for i from 0 to n-1:',
      '  if i+1 < n and val[s[i]] < val[s[i+1]]: total -= val[s[i]]',
      '  else: total += val[s[i]]',
      'return total',
    ],
    example: { input: '"MCMXCIV"', output: '1994' },
    steps: [
      { title: 'i=0: M(1000), next=C(100). 1000 ≥ 100, add. total=1000.', pseudoLine: 4,
        computation: { label: 'add', lhs: '1000', result: 'total=1000' } },
      { title: 'i=1: C(100), next=M(1000). 100 < 1000 → subtract. total=900.', pseudoLine: 3,
        computation: { label: 'subtract', lhs: '100', result: 'total=900' } },
      { title: 'i=2: M(1000), next=X(10). add. total=1900.', pseudoLine: 4,
        computation: { label: 'add', lhs: '1000', result: 'total=1900' } },
      { title: 'Continue: X(10) before C(100) → subtract; C → +100; I before V → −1; V → +5. Total=1994.', pseudoLine: 5,
        result: { found: true, value: '1994' } },
    ],
    tradeoffs: 'Right-to-left scan with a "running max" is symmetric and avoids the `i+1 < n` bound-check; some find it more readable. Replace-pairs (IV→4, IX→9, …) is fun but slow for long inputs.',
  },
  {
    id: 'right-to-left',
    name: 'Right-to-Left with Running Max',
    badge: 'alternative',
    intuition:
      "Walk **backward**. Keep a 'previous' value (initially 0). For each character: if its value is less than the previous, subtract; otherwise add. Update previous to the current value as you go.\n\n" +
      "**Why this works:** in Roman numerals, the subtractive cases (IV, IX, XL, XC, CD, CM) are precisely those where a smaller numeral immediately PRECEDES a larger one. Walking backward, we encounter the larger first, then the smaller — and the rule 'smaller-than-just-seen → subtract' captures exactly the subtractive cases.\n\n" +
      "Same complexity as the forward peek-next approach, but no `i + 1 < n` boundary check is needed because we're never looking ahead.",
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Equally good; symmetric, no peek' },
    pseudocode: [
      'val = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 }',
      'total = 0, prev = 0',
      'for i from n-1 down to 0:',
      '  curr = val[s[i]]',
      '  total += curr < prev ? -curr : curr',
      '  prev = curr',
      'return total',
    ],
    example: { input: '"MCMXCIV"', output: '1994' },
    steps: [
      { title: 'i=6 (V=5): curr=5 < prev=0? no → add. total=5, prev=5.', pseudoLine: 4,
        computation: { label: 'add', lhs: '5', op: '+', rhs: '0', result: 'total=5' } },
      { title: 'i=5 (I=1): curr=1 < prev=5? yes → subtract. total=4, prev=1.', pseudoLine: 4,
        computation: { label: 'subtract', lhs: '5', op: '−', rhs: '1', result: 'total=4' } },
      { title: 'Continue backward. C(100)+X(10)→subtract→90 partial; XC pair contributes 90; M+C→subtract→900 partial; final = 1000+(−100)+1000+(−10)+100+(−1)+5 = 1994.',
        pseudoLine: 6,
        result: { found: true, value: '1994' } },
    ],
    tradeoffs: 'Same complexity, slightly more elegant — no boundary check, no peek-ahead. Choose by readability preference.',
  }],
};

// ====================================================================

const reverseLinkedList: Explanation = {
  problem: 'Reverse Linked List',
  problemStatement: 'Given the head of a singly linked list, reverse it in place and return the new head.',
  approaches: [{
    id: 'three-pointer',
    name: 'Iterative Three-Pointer',
    badge: 'best',
    intuition: 'Maintain prev (initially null), curr (head), and next (lookahead). At each step, save next, redirect curr.next = prev, advance prev and curr. When curr is null, prev is the new head.',
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Canonical' },
    pseudocode: [
      'prev = null, curr = head',
      'while curr !== null:',
      '  next = curr.next',
      '  curr.next = prev',
      '  prev = curr; curr = next',
      'return prev',
    ],
    example: { input: '1 → 2 → 3 → 4 → null', output: '4 → 3 → 2 → 1 → null' },
    steps: [
      { title: 'Initial. prev=null, curr=1.', pseudoLine: 0,
        linkedList: { nodes: [{ value: 1, label: 'curr' }, { value: 2 }, { value: 3 }, { value: 4 }], tail: 'null' } },
      { title: 'Save next=2. Redirect 1→null. Advance prev=1, curr=2.', pseudoLine: 4,
        linkedList: { nodes: [{ value: 1, label: 'prev', highlight: 'i' }, { value: 2, label: 'curr' }, { value: 3 }, { value: 4 }] } },
      { title: 'Continue. After step on 2: 2→1, prev=2, curr=3.', pseudoLine: 4,
        linkedList: { nodes: [{ value: 2, label: 'prev', highlight: 'i' }, { value: 1 }, { value: 3, label: 'curr' }, { value: 4 }] } },
      { title: 'Continue until curr=null. Return prev as new head.', pseudoLine: 5,
        linkedList: { nodes: [{ value: 4, label: 'head', highlight: 'found' }, { value: 3 }, { value: 2 }, { value: 1 }] },
        result: { found: true, value: '4 → 3 → 2 → 1' } },
    ],
    tradeoffs: 'Recursive variant is elegant but uses O(n) call-stack — risky for very long lists. Iterative is the safe default. Reversing in groups of k is a follow-up question that uses the same three-pointer pattern within each group.',
  },
  {
    id: 'recursive',
    name: 'Recursive Reverse',
    badge: 'alternative',
    intuition:
      "A beautifully short version: recurse to the end of the list, then on the way back up, reverse one pointer at a time.\n\n" +
      "**The key insight:** at each call, after the recursive call returns the new head (the deepest node), we know `head.next` (the *current* second node) should now point to `head`. Set `head.next.next = head`, then `head.next = null` (so the original head doesn't dangle into a cycle), then return the new head up the call stack unchanged.\n\n" +
      "The recursion depth equals the list length — for a 10,000-node list that's 10,000 stack frames, which V8 will refuse. Iterative is preferred for lists of unknown length.",
    complexity: { time: 'O(n)', space: 'O(n) call stack', verdict: 'Elegant; risky for long lists' },
    pseudocode: [
      'function reverse(head):',
      '  if (head === null || head.next === null) return head',
      '  newHead = reverse(head.next)',
      '  head.next.next = head     // make next point back',
      '  head.next = null          // break original forward link',
      '  return newHead',
    ],
    example: { input: '1→2→3→null', output: '3→2→1→null' },
    steps: [
      { title: 'reverse(1) → recurse(2) → recurse(3). 3 returns itself (base case).',
        pseudoLine: 1,
        callStack: { frames: [{ call: 'reverse(1)', status: 'pending' }, { call: 'reverse(2)', status: 'pending' }, { call: 'reverse(3)', status: 'returned', returns: '3 (newHead)' }] } },
      { title: 'Back in reverse(2): 2.next.next = 2 (so 3→2), 2.next = null. Return 3.',
        pseudoLine: 4,
        linkedList: { nodes: [{ value: 3 }, { value: 2, highlight: 'i' }, { value: 1 }] } },
      { title: 'Back in reverse(1): 1.next.next = 1 (so 2→1), 1.next = null. Return 3.',
        pseudoLine: 4,
        linkedList: { nodes: [{ value: 3, highlight: 'found' }, { value: 2, highlight: 'found' }, { value: 1, highlight: 'found' }] },
        result: { found: true, value: '3 → 2 → 1' } },
    ],
    tradeoffs: '5 lines vs 7 for iterative. Same correctness, worse worst-case stack usage. Prefer iterative in production; mention recursive in interviews to show fluency.',
  }],
};

// ====================================================================

const containerWater: Explanation = {
  problem: 'Container With Most Water',
  problemStatement: 'Given heights, find two lines that with the x-axis form a container holding the most water. Return that area.',
  approaches: [{
    id: 'two-pointer',
    name: 'Two-Pointer Greedy',
    badge: 'best',
    intuition: 'Start with widest container (l=0, r=n-1). Area = min(h[l], h[r]) · (r-l). Move the pointer at the SHORTER line inward — moving the taller would only decrease both width and the binding height. One pass, O(n).',
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Canonical' },
    pseudocode: [
      'l = 0, r = n - 1, best = 0',
      'while l < r:',
      '  area = min(h[l], h[r]) * (r - l)',
      '  best = max(best, area)',
      '  if h[l] < h[r]: l++ else r--',
      'return best',
    ],
    example: { input: '[1,8,6,2,5,4,8,3,7]', output: '49' },
    steps: [
      { title: 'l=0(h=1), r=8(h=7). area=min(1,7)·8 = 8. h[l] shorter → l++.', pseudoLine: 2,
        array: { cells: [{ value: 1, highlight: 'i' }, { value: 8 }, { value: 6 }, { value: 2 }, { value: 5 }, { value: 4 }, { value: 8 }, { value: 3 }, { value: 7, highlight: 'j' }] },
        computation: { label: 'min·width', lhs: '1', op: '·', rhs: '8', result: '8' } },
      { title: 'l=1(h=8), r=8(h=7). area=min(8,7)·7 = 49. h[r] shorter → r--.', pseudoLine: 2,
        array: { cells: [{ value: 1 }, { value: 8, highlight: 'i' }, { value: 6 }, { value: 2 }, { value: 5 }, { value: 4 }, { value: 8 }, { value: 3 }, { value: 7, highlight: 'j' }] },
        computation: { label: 'min·width', lhs: '7', op: '·', rhs: '7', result: '49' } },
      { title: 'No later pair beats 49. Return 49.', pseudoLine: 5,
        result: { found: true, value: '49' } },
    ],
    tradeoffs: 'Brute force checks every pair → O(n²). The two-pointer move-the-shorter-side rule is what makes the algorithm correct in a single pass — moving the taller side cannot increase the area because the new width is smaller AND the binding height is still capped by the shorter side.',
  },
  {
    id: 'brute-force',
    name: 'Brute Force — All Pairs',
    badge: 'baseline',
    intuition:
      "Try every possible (i, j) pair, compute the area, keep the max. O(n²) — straightforward, slow.\n\n" +
      "**Worth knowing because:** it's the path to the two-pointer optimization. The leap from 'try every pair' to 'two pointers, move the shorter' is the kind of insight interviewers reward. Articulate the brute force first, then explain why the greedy two-pointer is provably correct.",
    complexity: { time: 'O(n²)', space: 'O(1)', verdict: 'Times out for n > 10⁴' },
    pseudocode: [
      'best = 0',
      'for i from 0 to n-2:',
      '  for j from i+1 to n-1:',
      '    area = min(h[i], h[j]) * (j - i)',
      '    if area > best: best = area',
      'return best',
    ],
    example: { input: '[1,8,6,2,5,4,8,3,7]', output: '49' },
    steps: [
      { title: 'i=0, j=1..8: try (1,8), (1,6), (1,2)... best for i=0 is 8 at j=8.', pseudoLine: 3,
        computation: { label: 'min(1,7)*8', result: '8' } },
      { title: 'i=1, j=8: min(8,7)*7 = 49 — new max.', pseudoLine: 4,
        computation: { label: 'min(8,7)*7', result: '49' } },
      { title: 'No later pair beats 49. Return 49.', pseudoLine: 5,
        result: { found: true, value: '49' } },
    ],
    tradeoffs: 'Useful as a sanity check (output must match the optimized version). Never the answer to ship — the two-pointer is strictly better and just as readable.',
  }],
};

// ====================================================================

const climbingStairs: Explanation = {
  problem: 'Climbing Stairs',
  problemStatement: 'How many distinct ways to climb n stairs taking 1 or 2 steps at a time?',
  approaches: [{
    id: 'dp-o1',
    name: 'O(1)-Space DP — Two Variables',
    badge: 'best',
    intuition: 'ways(n) = ways(n-1) + ways(n-2) — Fibonacci. You only need the last two values, so iterate with two scalars, no array.',
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Canonical' },
    pseudocode: [
      'if n <= 2: return n',
      'a = 1, b = 2',
      'for i from 3 to n:',
      '  c = a + b; a = b; b = c',
      'return b',
    ],
    example: { input: 'n = 5', output: '8' },
    steps: [
      { title: 'Base: ways(1)=1, ways(2)=2.', pseudoLine: 1,
        array: { cells: [{ value: 'i:1', highlight: 'found' }, { value: 'i:2', highlight: 'found' }] },
        computation: { label: 'a, b', result: '1, 2' } },
      { title: 'i=3: c = 1+2 = 3. a=2, b=3.', pseudoLine: 3,
        computation: { label: 'a + b', lhs: '1', op: '+', rhs: '2', result: '3' } },
      { title: 'i=4: c = 2+3 = 5. a=3, b=5.', pseudoLine: 3,
        computation: { label: 'a + b', lhs: '2', op: '+', rhs: '3', result: '5' } },
      { title: 'i=5: c = 3+5 = 8.', pseudoLine: 3,
        computation: { label: 'a + b', lhs: '3', op: '+', rhs: '5', result: '8' },
        result: { found: true, value: '8' } },
    ],
    tradeoffs: 'Memoized recursion is the same complexity but eats stack on big n. Naive recursion is O(2ⁿ) — never use. Binet\'s formula is O(1) but loses precision past n ≈ 70.',
  },
  {
    id: 'memoized',
    name: 'Memoized Recursion (Top-Down DP)',
    badge: 'alternative',
    intuition:
      "Express the problem recursively: `ways(n) = ways(n-1) + ways(n-2)`, base cases `ways(0) = 1`, `ways(1) = 1`. Naive recursion recomputes overlapping subproblems exponentially — `ways(5)` calls `ways(3)` twice (via ways(4) and directly).\n\n" +
      "**Memoization fix:** cache the result of each subproblem. The first call to `ways(3)` runs the recursion; the second call hits the cache in O(1). Total work drops from O(2ⁿ) to O(n).\n\n" +
      "Same complexity as the iterative two-variable solution, but the recursive expression is closer to how you'd describe the problem in plain English. Pedagogically useful; in production prefer the iterative scalar version (no stack risk, no map allocation).",
    complexity: { time: 'O(n)', space: 'O(n) cache + O(n) call stack', verdict: 'Closest to the natural problem statement' },
    pseudocode: [
      'memo = new Map([[0,1],[1,1]])',
      'function ways(n):',
      '  if memo.has(n): return memo.get(n)',
      '  result = ways(n-1) + ways(n-2)',
      '  memo.set(n, result)',
      '  return result',
    ],
    example: { input: 'n=5', output: '8' },
    steps: [
      { title: 'ways(5) → ways(4) + ways(3). Cache miss for both, recurse.',
        pseudoLine: 3,
        callStack: { frames: [{ call: 'ways(5)', status: 'pending' }, { call: 'ways(4) + ways(3)', status: 'active' }] } },
      { title: 'ways(3) memoized after first compute. Second call (from ways(4)) hits cache.',
        pseudoLine: 2,
        map: { entries: [{ key: 0, value: 1 }, { key: 1, value: 1 }, { key: 2, value: 2 }, { key: 3, value: 3, highlight: 'hit' }] } },
      { title: 'All values bubble back up. ways(5) = 8.',
        pseudoLine: 4,
        result: { found: true, value: '8' } },
    ],
    tradeoffs: 'Same O(n) time and O(n) space as the iterative DP table. The trade is recursion stack vs explicit array — iterative wins on safety, recursive wins on readability.',
  }],
};

// ====================================================================

const balancedBracketsCount: Explanation = {
  problem: 'Balanced Brackets (Count)',
  problemStatement: 'Given a string with parens, brackets, braces, return true if the COUNT of opens equals the count of closes for each pair. Note: this is different from Valid Parentheses — order does NOT matter here.',
  approaches: [{
    id: 'counters',
    name: 'Three Counters',
    badge: 'best',
    intuition: 'Track running counts for each pair. Ignore order entirely. At the end, all counts must be zero.',
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Canonical' },
    pseudocode: [
      'paren = 0, bracket = 0, brace = 0',
      'for ch in s:',
      '  if ch === "(": paren++ else if ch === ")": paren--',
      '  if ch === "[": bracket++ else if ch === "]": bracket--',
      '  if ch === "{": brace++ else if ch === "}": brace--',
      'return paren === 0 && bracket === 0 && brace === 0',
    ],
    example: { input: '"([)]"', output: 'true (counts balance)' },
    steps: [
      { title: 'String "([)]". Track counters.', pseudoLine: 0,
        map: { entries: [{ key: '()', value: 0 }, { key: '[]', value: 0 }, { key: '{}', value: 0 }] } },
      { title: '"(" → paren=1.', pseudoLine: 2,
        map: { entries: [{ key: '()', value: 1, highlight: 'new' }, { key: '[]', value: 0 }, { key: '{}', value: 0 }] } },
      { title: '"[" → bracket=1. "(" still 1.', pseudoLine: 3,
        map: { entries: [{ key: '()', value: 1 }, { key: '[]', value: 1, highlight: 'new' }, { key: '{}', value: 0 }] } },
      { title: '")" → paren=0.', pseudoLine: 2,
        map: { entries: [{ key: '()', value: 0, highlight: 'hit' }, { key: '[]', value: 1 }, { key: '{}', value: 0 }] } },
      { title: '"]" → bracket=0. All counters zero → balanced.', pseudoLine: 3,
        map: { entries: [{ key: '()', value: 0 }, { key: '[]', value: 0, highlight: 'hit' }, { key: '{}', value: 0 }] },
        note: 'Note: Valid Parentheses (the stack version) would call this string INVALID because the order is wrong — "(" pairs with "]" interleaved. This count-only version sees only totals.',
        result: { found: true, value: 'true' } },
    ],
    tradeoffs: 'If you actually need nesting validation, use the stack approach (Valid Parentheses challenge). The count-only version is the simpler "are all opens closed somewhere" check — useful for code-formatter sanity checks, not for parser validation.',
  },
  {
    id: 'object-counters',
    name: 'Object as Counter Map',
    badge: 'alternative',
    intuition:
      "Use a single object `{ '(': 0, '[': 0, '{': 0 }` instead of three separate variables. For each character, look up its associated counter (e.g., `)` increments `(`'s counter as a closer would). Cleaner if you ever need to add another bracket type.\n\n" +
      "Functionally identical to three counters; the choice is stylistic. The map version scales: adding `<...>` (angle brackets) is one entry change instead of three new variables.",
    complexity: { time: 'O(n)', space: 'O(k) where k = number of bracket kinds', verdict: 'Same as three counters; more extensible' },
    pseudocode: [
      'pairs = { ")":"(", "]":"[", "}":"{" }',
      'count = { "(": 0, "[": 0, "{": 0 }',
      'for ch in s:',
      '  if ch in count: count[ch]++',
      '  else if ch in pairs: count[pairs[ch]]--',
      'return count["("]===0 && count["["]===0 && count["{"]===0',
    ],
    example: { input: '"([)]"', output: 'true (counts balance)' },
    steps: [
      { title: 'Walk "([)]". (→ count["("]=1. [ → count["["]=1.', pseudoLine: 4,
        map: { entries: [{ key: '(', value: 1, highlight: 'new' }, { key: '[', value: 1, highlight: 'new' }] } },
      { title: ') → count["("]=0. ] → count["["]=0. All zero → true.', pseudoLine: 5,
        map: { entries: [{ key: '(', value: 0 }, { key: '[', value: 0 }, { key: '{', value: 0 }] },
        result: { found: true, value: 'true' } },
    ],
    tradeoffs: 'Slightly nicer for extensibility. The order-aware Valid Parentheses problem still requires a stack — these counter-based approaches only verify totals balance, not that nesting is correct.',
  }],
};

// ====================================================================

const secondLargest: Explanation = {
  problem: 'Second Largest Number',
  problemStatement: 'Find the second-largest UNIQUE value in an array, without using sort.',
  approaches: [{
    id: 'single-pass',
    name: 'Single Pass — Two Variables',
    badge: 'best',
    intuition: 'Track first (largest) and second (next-largest, distinct from first). For each x: if x > first, second becomes first and first becomes x. Else if x > second AND x !== first, second becomes x.',
    complexity: { time: 'O(n)', space: 'O(1)', verdict: 'Canonical' },
    pseudocode: [
      'first = -Infinity, second = -Infinity',
      'for x in arr:',
      '  if x > first: second = first; first = x',
      '  else if x > second && x !== first: second = x',
      'return second',
    ],
    example: { input: '[3, 1, 4, 4, 5, 5, 2]', output: '4' },
    steps: [
      { title: 'x=3. first=3, second=-∞.', pseudoLine: 2,
        computation: { label: 'first / second', result: '3 / -∞' } },
      { title: 'x=1. Not > 3, but > -∞ → second=1.', pseudoLine: 3,
        computation: { label: 'first / second', result: '3 / 1' } },
      { title: 'x=4. > 3 → second=3, first=4.', pseudoLine: 2,
        computation: { label: 'first / second', result: '4 / 3' } },
      { title: 'x=4. Not > 4, and equal to first → skip.', pseudoLine: 3,
        note: 'The x !== first check is what enforces "unique" — without it, [4, 4] would say second=4.' },
      { title: 'x=5. > 4 → second=4, first=5. After array: 4.', pseudoLine: 2,
        computation: { label: 'first / second', result: '5 / 4' },
        result: { found: true, value: '4' } },
    ],
    tradeoffs: 'Two-pass version (find max, then max of rest) is fine — same complexity, easier to read, but two scans. Set + sort is O(n log n). Heap is overkill at k=2 but generalizes to "k-th largest" in O(n log k).',
  },
  {
    id: 'set-sort',
    name: 'Set + Sort (Most Readable)',
    badge: 'alternative',
    intuition:
      "Dedupe with `new Set(arr)`, sort descending, take index 1. Three lines that read like English: 'unique values, biggest first, second one'.\n\n" +
      "**Trade:** O(n log n) sort cost instead of O(n) single-pass. For typical interview inputs (n ≤ 10⁵), the difference is microseconds. The clarity cost is zero.",
    complexity: { time: 'O(n log n)', space: 'O(n)', verdict: 'Pick this when readability matters more than the optimal complexity' },
    pseudocode: [
      'unique = [...new Set(arr)]',
      'unique.sort((a, b) => b - a)         // descending',
      'return unique.length >= 2 ? unique[1] : null',
    ],
    example: { input: '[3, 1, 4, 4, 5, 5, 2]', output: '4' },
    steps: [
      { title: 'new Set → {3,1,4,5,2}. Spread: [3,1,4,5,2].', pseudoLine: 0,
        set: { items: [{ value: 3 }, { value: 1 }, { value: 4 }, { value: 5 }, { value: 2 }] } },
      { title: 'Sort descending: [5,4,3,2,1].', pseudoLine: 1,
        array: { cells: [{ value: 5 }, { value: 4, highlight: 'found' }, { value: 3 }, { value: 2 }, { value: 1 }] } },
      { title: 'Index 1 = 4 → return 4.', pseudoLine: 2,
        result: { found: true, value: '4' } },
    ],
    tradeoffs: 'Three readable lines for the price of O(n log n). Use unless n is huge or someone explicitly says "must be O(n)".',
    usesPolyfills: [
      { builtin: 'Array.prototype.sort', templateName: 'Array.sort',
        why: 'sort the deduped values descending to pick index 1' },
    ],
  }],
};

export const playgroundExplanations: Record<string, Explanation> = {
  'Two Sum': twoSum,
  'Reverse String': reverseString,
  'Valid Palindrome': validPalindrome,
  'FizzBuzz': fizzBuzz,
  'Max Profit': maxProfit,
  'Valid Parentheses': validParentheses,
  'Merge Sorted Arrays': mergeSortedArrays,
  'Flatten Array': flattenArray,
  'Debounce': debounce,
  'Group Anagrams': groupAnagrams,
  'Find Duplicates': findDuplicates,
  'Remove Duplicates': removeDuplicates,
  'Find Missing Number': findMissingNumber,
  'Move Zeros': moveZeros,
  'Rotate Array': rotateArray,
  'Bubble Sort': bubbleSort,
  'Quick Sort': quickSort,
  'Merge Sort': mergeSort,
  'Anagram Check': anagramCheck,
  'Longest Substring': longestSubstring,
  'First Non-Repeating Char': firstNonRepeating,
  'Sum Curry': sumCurry,
  'Memoize': memoize,
  'Deep Clone': deepClone,
  'Throttle': throttle,
  'EventEmitter': eventEmitter,
  'LRU Cache': lruCache,
  'Compose & Pipe': composePipe,
  'Binary Search': binarySearch,
  'Roman to Integer': romanToInteger,
  'Reverse Linked List': reverseLinkedList,
  'Container With Most Water': containerWater,
  'Climbing Stairs': climbingStairs,
  'Balanced Brackets (Count)': balancedBracketsCount,
  'Second Largest Number': secondLargest,
};

export const playgroundExplanationKeys: string[] = Object.keys(playgroundExplanations);
